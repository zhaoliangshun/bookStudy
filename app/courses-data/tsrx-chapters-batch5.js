export const chapters = [
  {
    id: "tsrx-fetch-basic",
    icon: "🌐",
    group: "数据请求篇",
    title: "原生fetch与数据请求模式",
    content: `## 原生fetch与数据请求模式

在现代前端开发中，数据请求是核心能力之一。虽然有很多第三方请求库（如axios），但掌握原生fetch API和数据请求的最佳模式依然至关重要。本章将深入讲解如何使用TypeScript封装健壮的HTTP请求函数，处理请求取消、错误处理、加载状态管理，以及竞态条件等常见问题。

### 一、fetch API基础与TypeScript类型封装

原生fetch API返回Promise，但默认响应类型不够友好。我们需要封装一个泛型请求函数，统一处理响应解析和错误。

\`\`\`tsx
// src/api/request.ts

// 自定义HTTP错误类，携带状态码和业务错误码
export class HttpError extends Error {
  status: number;
  code?: number;

  constructor(message: string, status: number, code?: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }
}

// 通用API响应类型
export interface ApiResponse<T = unknown> {
  data: T;
  code: number;
  message: string;
}

// 请求配置类型
interface RequestOptions extends RequestInit {
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
}

// 基础请求封装
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function request<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { timeout = 10000, retryCount = 0, retryDelay = 1000, ...fetchOptions } = options;

  // 创建AbortController用于超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(\`\${BASE_URL}\${url}\`, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    clearTimeout(timeoutId);

    // 解析响应
    const result: ApiResponse<T> = await response.json();

    // HTTP状态码错误处理
    if (!response.ok) {
      throw new HttpError(
        result.message || \`HTTP错误: \${response.status}\`,
        response.status,
        result.code
      );
    }

    // 业务错误码处理（假设code=0表示成功）
    if (result.code !== 0) {
      throw new HttpError(result.message, response.status, result.code);
    }

    return result.data;
  } catch (error) {
    clearTimeout(timeoutId);

    // 请求重试逻辑（指数退避）
    if (retryCount > 0 && !(error instanceof HttpError && error.status < 500)) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return request<T>(url, {
        ...options,
        retryCount: retryCount - 1,
        retryDelay: retryDelay * 2,
      });
    }

    if (error instanceof HttpError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new HttpError('请求超时', 408);
    }

    throw new HttpError('网络请求失败', 0);
  }
}

// 快捷方法
export const http = {
  get: <T>(url: string, options?: RequestOptions) =>
    request<T>(url, { ...options, method: 'GET' }),

  post: <T>(url: string, data?: unknown, options?: RequestOptions) =>
    request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(url: string, data?: unknown, options?: RequestOptions) =>
    request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(url: string, options?: RequestOptions) =>
    request<T>(url, { ...options, method: 'DELETE' }),
};
\`\`\`

### 二、AbortController取消请求

在React组件中，当组件卸载或请求参数变化时，必须取消正在进行的请求，避免内存泄漏和状态更新警告。

\`\`\`tsx
// src/hooks/useFetch.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { http, HttpError } from '@/api/request';

// 可辨识联合类型：精确描述请求的三种状态
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: HttpError };

export function useFetch<T>(url: string | null, options?: RequestInit) {
  const [state, setState] = useState<RequestState<T>>({ status: 'idle' });
  // 使用useRef保存最新的请求ID，用于解决竞态条件
  const latestRequestRef = useRef(0);

  const fetchData = useCallback(async () => {
    if (!url) {
      setState({ status: 'idle' });
      return;
    }

    const requestId = ++latestRequestRef.current;
    const controller = new AbortController();

    setState({ status: 'loading' });

    try {
      const data = await http.get<T>(url, {
        ...options,
        signal: controller.signal,
      });

      // 只有当这是最新请求时才更新状态
      if (requestId === latestRequestRef.current) {
        setState({ status: 'success', data });
      }
    } catch (error) {
      // 只有当这是最新请求且不是取消错误时才更新错误状态
      if (
        requestId === latestRequestRef.current &&
        !(error instanceof Error && error.name === 'AbortError')
      ) {
        setState({
          status: 'error',
          error: error instanceof HttpError ? error : new HttpError('未知错误', 0),
        });
      }
    }

    return () => controller.abort();
  }, [url, options]);

  useEffect(() => {
    const cleanup = fetchData();
    return () => {
      cleanup?.then(abort => abort?.());
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch };
}
\`\`\`

### 三、三态管理组件实践

在组件中根据请求状态渲染不同的UI是常见模式：

\`\`\`tsx
// src/components/UserList.tsx
interface User {
  id: number;
  name: string;
  email: string;
}

export function UserList() {
  const { status, data: users, error } = useFetch<User[]>('/users');

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        <span className="ml-2">加载中...</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-medium">加载失败</p>
        <p className="text-red-500 text-sm mt-1">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
        >
          重试
        </button>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="space-y-3">
        {users.map(user => (
          <div key={user.id} className="p-4 bg-white shadow rounded-lg">
            <h3 className="font-medium">{user.name}</h3>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
\`\`\`

### 四、竞态条件解决方案

当用户快速切换筛选条件时，旧请求可能比新请求晚返回，导致显示错误数据。我们用useRef记录最新请求来解决这个问题：

\`\`\`tsx
// src/components/ProductSearch.tsx
import { useState, useEffect, useRef } from 'react';
import { http } from '@/api/request';

interface Product {
  id: number;
  name: string;
  price: number;
}

export function ProductSearch() {
  const [keyword, setKeyword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const latestSearchRef = useRef(0);

  useEffect(() => {
    if (!keyword.trim()) {
      setProducts([]);
      return;
    }

    const searchId = ++latestSearchRef.current;
    const controller = new AbortController();
    setLoading(true);

    const searchProducts = async () => {
      try {
        const data = await http.get<Product[]>(
          \`/products/search?q=\${encodeURIComponent(keyword)}\`,
          { signal: controller.signal }
        );

        // 关键：只展示最新搜索的结果
        if (searchId === latestSearchRef.current) {
          setProducts(data);
          setLoading(false);
        }
      } catch (