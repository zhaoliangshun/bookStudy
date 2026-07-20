export const chapters = [
  {
    id: "tsrx-fetch-basic",
    group: "数据请求篇",
    icon: "🌐",
    title: "原生fetch与数据请求模式",
    content: `
# 原生fetch与数据请求模式

数据请求是现代Web应用的核心能力。React + TypeScript项目中，我们需要一套类型安全、可维护、健壮的数据请求方案。本章将从原生\`fetch\`出发，逐步构建通用HTTP客户端，处理取消请求、错误处理、请求状态管理以及竞态条件等常见问题。

## 一、fetch + async/await 基础

\`fetch\`是浏览器原生提供的网络请求API，基于Promise设计，配合async/await使用非常优雅。

\`\`\`tsx
// 基础GET请求
async function fetchUsers() {
  try {
    const response = await fetch('/api/users')
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`)
    }
    const users = await response.json()
    return users
  } catch (error) {
    console.error('请求失败:', error)
    throw error
  }
}

// POST请求发送JSON
async function createUser(userData: { name: string; email: string }) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })
  if (!response.ok) {
    throw new Error('创建用户失败')
  }
  return response.json()
}
\`\`\`

\`fetch\`的一个常见"坑"：**只有网络错误才会reject Promise，HTTP 404/500等状态码仍然会resolve**。所以必须检查\`response.ok\`属性。

## 二、封装通用HTTP函数（泛型响应类型）

封装一个类型安全的通用HTTP客户端，避免重复代码：

\`\`\`tsx
// API响应基础类型
interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
}

interface ApiError {
  code: number
  message: string
}

// 自定义HTTP错误类
class HttpError extends Error {
  status: number
  code: number

  constructor(status: number, code: number, message: string) {
    super(message)
    this.status = status
    this.code = code
    this.name = 'HttpError'
  }
}

// 请求配置类型
interface RequestOptions extends RequestInit {
  timeout?: number
}

// 通用HTTP请求函数
async function http<T = unknown>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { timeout = 10000, ...fetchOptions } = options

  // 合并默认headers
  const headers = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // 解析响应
    const data = await response.json() as ApiResponse<T>

    if (!response.ok) {
      throw new HttpError(
        response.status,
        data.code || response.status,
        data.message || \`请求失败: \${response.status}\`
      )
    }

    if (data.code !== 0 && data.code !== 200) {
      throw new HttpError(response.status, data.code, data.message)
    }

    return data.data
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof HttpError) {
      throw error
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new HttpError(408, 408, '请求超时')
    }
    throw new HttpError(500, 500, '网络错误，请检查网络连接')
  }
}

// 使用示例
interface User {
  id: number
  name: string
  email: string
}

// GET请求自动推导返回类型为User[]
const getUsers = () => http<User[]>('/api/users')

// POST请求
const createUser = (data: { name: string; email: string }) =>
  http<User>('/api/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })
\`\`\`

## 三、AbortController取消请求

在React组件中，当组件卸载或请求参数变化时，应该取消正在进行的请求，避免内存泄漏和状态更新警告：

\`\`\`tsx
import { useEffect, useState } from 'react'

// 使用AbortController的useEffect模式
function UserList({ searchQuery }: { searchQuery: string }) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 创建AbortController实例
    const controller = new AbortController()

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await http<User[]>(
          \`/api/users?q=\${encodeURIComponent(searchQuery)}\`,
          { signal: controller.signal }
        )
        setUsers(data)
      } catch (err) {
        // 忽略取消请求导致的错误
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        setError(err instanceof Error ? err.message : '请求失败')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    // cleanup函数：组件卸载或effect重新执行时取消请求
    return () => {
      controller.abort()
    }
  }, [searchQuery])

  if (loading) return <div>加载中...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name} - {user.email}</li>
      ))}
    </ul>
  )
}
\`\`\`

## 四、RequestState可辨识联合管理三态

用可辨识联合（Discriminated Union）来精确表达请求的三种状态：加载中、成功、失败：

\`\`\`tsx
// 请求状态类型定义
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }

// 自定义Hook封装数据请求
function useData<T>(fetchFn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<RequestState<T>>({ status: 'idle' })

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false

    const execute = async () => {
      setState({ status: 'loading' })
      try {
        const data = await fetchFn()
        if (!cancelled) {
          setState({ status: 'success', data })
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: 'error',
            error: error instanceof Error ? error : new Error('未知错误')
          })
        }
      }
    }

    execute()

    return () => {
      cancelled = true
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}

// 使用示例
function ProductList({ categoryId }: { categoryId: number }) {
  const state = useData<Product[]>(
    () => http<Product[]>(\`/api/products?category=\${categoryId}\`),
    [categoryId]
  )

  // TypeScript会根据status字段自动窄化类型
  if (state.status === 'loading') {
    return <div>加载中...</div>
  }

  if (state.status === 'error') {
    return <div className="text-red-500">错误: {state.error.message}</div>
  }

  if (state.status === 'success') {
    return (
      <div>
        {state.data.map(product => (
          <div key={product.id}>{product.name}</div>
        ))}
      </div>
    )
  }

  return null
}
\`\`\`

## 五、竞态条件（Race Condition）处理

竞态条件是前端数据请求中常见的bug：用户快速切换筛选条件，后发的请求可能先返回，导致旧数据覆盖新数据。使用\`useRef\`记录请求ID，忽略过期响应：

\`\`\`tsx
import { useRef } from 'react'

function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  // 用useRef记录请求ID
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const currentRequestId = ++requestIdRef.current
    const controller = new AbortController()
    setLoading(true)

    const fetchResults = async () => {
      try {
        // 模拟不同请求耗时不同
        const delay = Math.random() * 1000
        await new Promise(resolve => setTimeout(resolve, delay))

        const data = await http<SearchResult[]>(
          \`/api/search?q=\${encodeURIComponent(query)}\`,
          { signal: controller.signal }
        )

        // 只处理最新的请求响应
        if (currentRequestId === requestIdRef.current) {
          setResults(data)
          setLoading(false)
        }
      } catch (err) {
        if (currentRequestId === requestIdRef.current) {
          if (err instanceof Error && err.name !== 'AbortError') {
            console.error('搜索失败:', err)
          }
          setLoading(false)
        }
      }
    }

    fetchResults()

    return () => {
      controller.abort()
    }
  }, [query])

  return (
    <div>
      {loading && <div>搜索中...</div>}
      {results.map(result => (
        <div key={result.id}>{result.title}</div>
      ))}
    </div>
  )
}

// 请求重试（指数退避）
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelay = 1000
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries === 0) {
      throw error
    }
    // 指数退避：1s, 2s, 4s, 8s...
    const delay = baseDelay * Math.pow(2, 3 - retries)
    await new Promise(resolve => setTimeout(resolve, delay))
    return fetchWithRetry(fn, retries - 1, baseDelay)
  }
}
\`\`\`

## 六、try/catch + toast 错误处理最佳实践

\`\`\`tsx
// 错误处理工具函数
function handleError(error: unknown, showToast: (msg: string) => void) {
  let message = '发生未知错误'

  if (error instanceof HttpError) {
    switch (error.status) {
      case 400:
        message = '请求参数错误'
        break
      case 401:
        message = '请先登录'
        // 可以在这里跳转到登录页
        break
      case 403:
        message = '没有权限执行此操作'
        break
      case 404:
        message = '请求的资源不存在'
        break
      case 408:
        message = '请求超时，请重试'
        break
      case 500:
        message = '服务器错误，请稍后再试'
        break
      default:
        message = error.message
    }
  } else if (error instanceof Error) {
    message = error.message
  }

  showToast(message)
  console.error(error)
}

// 在组件中使用
function UserProfile() {
  const { showToast } = useToast()

  const handleSave = async (data: UserFormData) => {
    try {
      await http.put<User>('/api/user/profile', data)
      showToast('保存成功')
    } catch (error) {
      handleError(error, showToast)
    }
  }

  return <UserForm onSubmit={handleSave} />
}
\`\`\`

## 小结

- 始终检查\`response.ok\`，因为fetch只有网络错误才reject
- 封装泛型http函数统一处理请求/响应/错误
- 使用AbortController在useEffect cleanup中取消请求
- 用可辨识联合类型精确管理请求状态
- useRef记录requestId解决竞态条件问题
- 指数退避策略用于请求重试
- 统一错误处理+友好提示提升用户体验
`,
  },
  {
    id: "tsrx-tanstack-query",
    group: "数据请求篇",
    icon: "🔍",
    title: "TanStack Query(React Query)完整方案",
    content: `
# TanStack Query(React Query)完整方案

手动管理数据请求状态（loading/error/data/cache/refresh）是一项繁琐且容易出错的工作。TanStack Query（原React Query）是一个强大的**服务端状态管理库**，它帮你自动处理缓存、后台刷新、重试、乐观更新等问题，让数据请求代码变得简洁优雅。

## 一、安装与基础配置

\`\`\`bash
npm install @tanstack/react-query
\`\`\`

在应用根部配置QueryClientProvider：

\`\`\`tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 创建QueryClient实例并配置全局默认选项
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 数据在多久内被认为是"新鲜"的，默认0（立即过期）
      staleTime: 5 * 60 * 1000, // 5分钟
      // 失败重试次数
      retry: 2,
      // 窗口获得焦点时是否重新获取数据
      refetchOnWindowFocus: false,
      // 组件挂载时重新获取
      refetchOnMount: true,
      // 网络重连时重新获取
      refetchOnReconnect: true,
    },
  },
})

// 在根部包裹应用
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TodoApp />
    </QueryClientProvider>
  )
}
\`\`\`

## 二、useQuery基础查询

\`useQuery\`用于查询数据，自动管理缓存和后台刷新：

\`\`\`tsx
import { useQuery } from '@tanstack/react-query'

// 1. 定义API函数
interface Post {
  id: number
  title: string
  body: string
  userId: number
}

const fetchPosts = async (page = 1, pageSize = 10): Promise<Post[]> => {
  const res = await fetch(\`/api/posts?_page=\${page}&_limit=\${pageSize}\`)
  if (!res.ok) throw new Error('获取文章失败')
  return res.json()
}

// 2. 在组件中使用useQuery
function PostList() {
  const {
    data,           // 成功时的数据
    isLoading,     // 首次加载（无缓存）
    isFetching,    // 任何时候正在获取（包括后台刷新）
    isError,       // 是否出错
    isSuccess,     // 是否成功
    error,         // 错误对象
    refetch,       // 手动触发重新获取
  } = useQuery({
    queryKey: ['posts', { page: 1 }], // 查询键：数组形式，用于缓存
    queryFn: () => fetchPosts(1),      // 查询函数
  })

  if (isLoading) return <div>加载中...</div>
  if (isError) return <div>错误: {error.message}</div>

  return (
    <div>
      {isFetching && <div>后台刷新中...</div>}
      <button onClick={() => refetch()}>刷新</button>
      <ul>
        {data?.map(post => (
          <li key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.body}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
\`\`\`

**queryKey设计原则**：
- 字符串或数组，数组用于分层
- 与查询相关的参数都要放进去（page、filter、id等）
- 顺序一致、序列化稳定
- 分层设计：\`['posts', postId, 'comments']\`

## 三、useMutation增删改

\`useMutation\`用于创建/更新/删除数据，配合\`invalidateQueries\`刷新缓存：

\`\`\`tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

function CreatePostForm() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (newPost: { title: string; body: string }) => {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      })
      if (!res.ok) throw new Error('创建失败')
      return res.json()
    },
    onSuccess: () => {
      // 创建成功后，使posts缓存失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      // 也可以直接更新缓存（见乐观更新）
    },
    onError: (error) => {
      console.error('创建失败:', error)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    mutation.mutate({
      title: formData.get('title') as string,
      body: formData.get('body') as string,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="标题" required />
      <textarea name="body" placeholder="内容" required />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? '提交中...' : '发布文章'}
      </button>
      {mutation.isError && <div className="text-red-500">{mutation.error.message}</div>}
      {mutation.isSuccess && <div className="text-green-500">发布成功!</div>}
    </form>
  )
}
\`\`\`

## 四、乐观更新（Optimistic Update）

乐观更新让UI立即响应用户操作，不用等待服务器返回，提供更流畅的体验。如果请求失败再回滚：

\`\`\`tsx
function TodoItem({ todo }: { todo: { id: number; text: string; completed: boolean } }) {
  const queryClient = useQueryClient()

  const toggleMutation = useMutation({
    mutationFn: async (updated: typeof todo) => {
      const res = await fetch(\`/api/todos/\${updated.id}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      if (!res.ok) throw new Error('更新失败')
      return res.json()
    },

    // mutation开始前执行：保存旧快照
    onMutate: async (newTodo) => {
      // 取消相关查询，防止覆盖乐观更新
      await queryClient.cancelQueries({ queryKey: ['todos'] })

      // 保存旧数据快照
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos'])

      // 立即更新缓存（乐观更新）
      queryClient.setQueryData<Todo[]>(['todos'], (old) =>
        old?.map(t => t.id === newTodo.id ? newTodo : t) ?? []
      )

      // 返回context对象给onError使用
      return { previousTodos }
    },

    // 失败时回滚
    onError: (err, newTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos)
      }
      alert('更新失败，已回滚')
    },

    // 成功或失败后最终刷新
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  return (
    <label>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={(e) => {
          toggleMutation.mutate({
            ...todo,
            completed: e.target.checked,
          })
        }}
      />
      {todo.text}
    </label>
  )
}
\`\`\`

## 五、useInfiniteQuery无限滚动分页

\`\`\`tsx
import { useInfiniteQuery } from '@tanstack/react-query'

interface PageData {
  items: Post[]
  nextPage: number | null
  total: number
}

const fetchPostsPage = async ({ pageParam = 1 }): Promise<PageData> => {
  const res = await fetch(\`/api/posts?page=\${pageParam}&limit=10\`)
  if (!res.ok) throw new Error('加载失败')
  const data = await res.json()
  return {
    items: data.items,
    nextPage: data.hasMore ? pageParam + 1 : null,
    total: data.total,
  }
}

function InfinitePostList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['posts', 'infinite'],
    queryFn: fetchPostsPage,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  })

  // 使用Intersection Observer实现自动加载
  const loadMoreRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) return <div>加载中...</div>

  return (
    <div>
      {data?.pages.map((page, i) => (
        <React.Fragment key={i}>
          {page.items.map(post => (
            <div key={post.id} className="post-card">{post.title}</div>
          ))}
        </React.Fragment>
      ))}
      <div ref={loadMoreRef}>
        {isFetchingNextPage ? '加载更多...' : hasNextPage ? '向下滚动加载更多' : '没有更多了'}
      </div>
    </div>
  )
}
\`\`\`

## 六、高级用法：预加载、条件查询、数据转换

\`\`\`tsx
import { useQueryClient, keepPreviousData } from '@tanstack/react-query'

// 1. prefetchQuery：hover预加载
function PostLink({ postId }: { postId: number }) {
  const queryClient = useQueryClient()

  const prefetchPost = () => {
    queryClient.prefetchQuery({
      queryKey: ['posts', postId],
      queryFn: () => fetchPost(postId),
      staleTime: 5 * 60 * 1000,
    })
  }

  return (
    <Link
      to={\`/posts/\${postId}\`}
      onMouseEnter={prefetchPost}
    >
      查看详情
    </Link>
  )
}

// 2. enabled条件查询：依赖其他数据
function UserOrders({ userId }: { userId: number | undefined }) {
  // 只有userId存在时才执行查询
  const { data: orders } = useQuery({
    queryKey: ['orders', userId],
    queryFn: () => fetchOrders(userId!),
    enabled: !!userId,
  })

  return <div>{/* 渲染订单列表 */}</div>
}

// 3. select数据转换
function PostList() {
  const { data: postTitles } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    // select只转换返回的数据，不影响缓存
    select: (posts) => posts.map(p => ({ id: p.id, title: p.title })),
  })

  return <div>{/* 只渲染标题列表 */}</div>
}

// 4. 分页时保持旧数据不闪屏
function PaginatedList({ page }: { page: number }) {
  const { data, isPlaceholderData } = useQuery({
    queryKey: ['posts', { page }],
    queryFn: () => fetchPosts(page),
    placeholderData: keepPreviousData, // 新数据加载时保持旧数据
  })

  return (
    <div style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
      {/* 列表内容 */}
    </div>
  )
}
\`\`\`

## 小结

- TanStack Query是服务端状态管理利器，自动处理缓存/刷新/重试
- queryKey是缓存的核心，设计要规范
- useQuery查数据，useMutation改数据
- onMutate+onError+onSettled实现乐观更新
- useInfiniteQuery轻松实现无限滚动
- prefetchQuery在用户hover时预加载提升体验
- enabled条件查询处理数据依赖
- select在不改变缓存的情况下转换数据
`,
  },
  {
    id: "tsrx-sse-websocket",
    group: "数据请求篇",
    icon: "🔌",
    title: "SSE与WebSocket实时通信",
    content: `
# SSE与WebSocket实时通信

现代Web应用越来越需要"实时"能力：消息通知、进度更新、AI流式输出、聊天室、协同编辑等。本章介绍两种主要的实时通信方案：**SSE（Server-Sent Events）**用于服务器单向推送，**WebSocket**用于双向实时通信。

## 一、SSE（Server-Sent Events）基础

SSE是HTTP协议上的轻量级单向通信机制，服务器可以主动向客户端推送事件。SSE基于纯文本，原生支持自动重连，非常适合通知、进度、AI流式输出等场景。

\`\`\`tsx
import { useEffect, useState, useRef } from 'react'

// SSE基础用法
function NotificationListener() {
  const [notifications, setNotifications] = useState<string[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // 创建EventSource实例
    const eventSource = new EventSource('/api/events/notifications')

    // 连接建立
    eventSource.onopen = () => {
      console.log('SSE连接已建立')
      setConnected(true)
    }

    // 接收默认消息事件
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setNotifications(prev => [data.message, ...prev].slice(0, 10))
    }

    // 监听自定义事件类型
    eventSource.addEventListener('notification', (event) => {
      const data = JSON.parse((event as MessageEvent).data)
      console.log('收到通知:', data)
    })

    // 错误处理
    eventSource.onerror = (error) => {
      console.error('SSE连接错误:', error)
      setConnected(false)
      // EventSource会自动尝试重连
    }

    // 组件卸载时关闭连接
    return () => {
      eventSource.close()
      setConnected(false)
    }
  }, [])

  return (
    <div>
      <div>状态: {connected ? '🟢 已连接' : '🔴 断开连接'}</div>
      <ul>
        {notifications.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>
  )
}
\`\`\`

**SSE适用场景**：
- 消息通知推送
- 文件上传/下载进度
- AI聊天流式输出（stream）
- 实时日志/监控面板
- 股票/加密货币行情更新

**SSE vs WebSocket**：

| 特性 | SSE | WebSocket |
|------|-----|-----------|
| 方向 | 服务器→客户端单向 | 双向通信 |
| 协议 | HTTP | 独立协议（ws/wss） |
| 自动重连 | 原生支持 | 需要自己实现 |
| 数据格式 | 文本（UTF-8） | 文本/二进制 |
| 复杂度 | 简单 | 相对复杂 |
| 适用场景 | 通知/进度/流输出 | 聊天/游戏/协同编辑 |

## 二、AI流式输出Demo（SSE典型应用）

AI聊天的打字机效果是SSE的经典用例：

\`\`\`tsx
import { useState, useRef, useCallback } from 'react'

function AIChat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [streaming, setStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (prompt: string) => {
    const controller = new AbortController()
    abortRef.current = controller
    setStreaming(true)

    // 添加用户消息
    setMessages(prev => [...prev, { role: 'user', content: prompt }])
    // 添加AI消息占位
    const aiMessageIndex = messages.length + 1
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
        signal: controller.signal,
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('无法获取响应流')
      }

      // 逐块读取流
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        // 解析SSE格式：data: {...}\\n\\n
        const lines = chunk.split('\\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content || ''
              // 增量更新消息
              setMessages(prev => {
                const updated = [...prev]
                updated[aiMessageIndex] = {
                  ...updated[aiMessageIndex],
                  content: updated[aiMessageIndex].content + content,
                }
                return updated
              })
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('AI响应错误:', error)
      }
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }, [messages.length])

  const stopStreaming = () => {
    abortRef.current?.abort()
  }

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={\`message \${msg.role}\`}>
            {msg.content}
          </div>
        ))}
      </div>
      {streaming ? (
        <button onClick={stopStreaming}>停止生成</button>
      ) : (
        <form onSubmit={(e) => {
          e.preventDefault()
          const input = e.currentTarget.elements.namedItem('prompt') as HTMLInputElement
          sendMessage(input.value)
          input.value = ''
        }}>
          <input name="prompt" placeholder="输入问题..." />
          <button type="submit">发送</button>
        </form>
      )}
    </div>
  )
}
\`\`\`

## 三、WebSocket基础与聊天室实现

WebSocket提供全双工双向通信，适合高频互动场景。

\`\`\`tsx
import { useEffect, useRef, useState, useCallback } from 'react'

// 连接状态类型
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

interface ChatMessage {
  id: string
  userId: string
  username: string
  content: string
  timestamp: number
  type?: 'message' | 'typing' | 'join' | 'leave'
}

function ChatRoom({ username, roomId }: { username: string; roomId: string }) {
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)
  const maxRetries = 5

  // 建立WebSocket连接（带指数退避重连）
  const connect = useCallback(() => {
    // WebSocket URL：ws://（非加密）或 wss://（加密，生产环境）
    const wsUrl = \`\${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//\${window.location.host}/ws/chat/\${roomId}\`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('WebSocket连接成功')
      setStatus('connected')
      retryCountRef.current = 0
      // 加入房间
      ws.send(JSON.stringify({
        type: 'join',
        username,
        roomId,
      }))
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as ChatMessage

      switch (data.type) {
        case 'message':
          setMessages(prev => [...prev, data])
          break
        case 'typing':
          if (data.username !== username) {
            setTypingUsers(prev =>
              prev.includes(data.username) ? prev : [...prev, data.username]
            )
            // 3秒后清除typing状态
            setTimeout(() => {
              setTypingUsers(prev => prev.filter(u => u !== data.username))
            }, 3000)
          }
          break
        case 'join':
        case 'leave':
          setMessages(prev => [...prev, data])
          break
      }
    }

    ws.onclose = (event) => {
      console.log('WebSocket连接关闭:', event.code, event.reason)
      setStatus('disconnected')

      // 自动重连（指数退避）
      if (retryCountRef.current < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000)
        retryCountRef.current++
        console.log(\`\${delay}ms后尝试第\${retryCountRef.current}次重连...\`)

        reconnectTimeoutRef.current = setTimeout(() => {
          setStatus('connecting')
          connect()
        }, delay)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket错误:', error)
    }
  }, [roomId, username])

  // 心跳ping/pong机制
  useEffect(() => {
    if (status !== 'connected') return

    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000) // 每30秒发送心跳

    return () => clearInterval(pingInterval)
  }, [status])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      wsRef.current?.close()
    }
  }, [connect])

  // 发送消息
  const sendMessage = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        content,
        timestamp: Date.now(),
      }))
    }
  }, [])

  // 发送typing指示
  const sendTyping = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'typing', username }))
    }
  }, [username])

  return (
    <div className="chat-room">
      <div className="status-bar">
        聊天室: {roomId} | 状态: {
          status === 'connected' ? '🟢 在线' :
          status === 'connecting' ? '🟡 连接中...' : '🔴 离线'
        }
      </div>

      <div className="messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className={\`message \${msg.type}\`}>
            {msg.type === 'join' && <em>{msg.username} 加入了聊天室</em>}
            {msg.type === 'leave' && <em>{msg.username} 离开了聊天室</em>}
            {msg.type === 'message' && (
              <>
                <strong>{msg.username}: </strong>
                <span>{msg.content}</span>
              </>
            )}
          </div>
        ))}
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            {typingUsers.join(', ')} 正在输入...
          </div>
        )}
      </div>

      <MessageInput onSend={sendMessage} onTyping={sendTyping} disabled={status !== 'connected'} />
    </div>
  )
}
\`\`\`

## 四、封装可复用的useSSE和useWebSocket Hooks

\`\`\`tsx
// useSSE Hook
function useSSE(url: string, options?: EventSourceInit) {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<Event | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const es = new EventSource(url, options)
    eventSourceRef.current = es

    es.onopen = () => setStatus('connected')
    es.onmessage = (e) => {
      try {
        setData(JSON.parse(e.data))
      } catch {
        setData(e.data)
      }
    }
    es.onerror = (e) => {
      setError(e)
      setStatus('disconnected')
    }

    return () => es.close()
  }, [url])

  return { data, error, status }
}

// useWebSocket Hook
function useWebSocket(url: string) {
  const [lastMessage, setLastMessage] = useState<any>(null)
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => setStatus('connected')
    ws.onmessage = (e) => {
      try {
        setLastMessage(JSON.parse(e.data))
      } catch {
        setLastMessage(e.data)
      }
    }
    ws.onclose = () => setStatus('disconnected')
    ws.onerror = () => setStatus('disconnected')

    return () => ws.close()
  }, [url])

  const sendMessage = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data))
      return true
    }
    return false
  }, [])

  return { lastMessage, status, sendMessage }
}

// 使用示例
function LiveUpdates() {
  const { data } = useSSE('/api/live-updates')
  return <div>最新更新: {data?.content}</div>
}
\`\`\`

## 小结

- SSE适合服务器单向推送，原生自动重连，实现简单
- WebSocket支持双向通信，适合聊天室、游戏等强交互场景
- SSE的典型应用：AI流式输出、通知、进度更新
- WebSocket需要自己实现心跳、重连、错误处理
- 用useRef保存WebSocket实例避免重连时重渲染问题
- 指数退避策略用于重连，避免服务器压力过大
- 封装成自定义Hook让代码更简洁可复用
`,
  },
  {
    id: "tsrx-memo",
    group: "性能优化篇",
    icon: "🛡️",
    title: "React.memo与重渲染优化",
    content: `
# React.memo与重渲染优化

React的渲染机制很智能，但不必要的重渲染仍然是性能瓶颈的常见来源。当组件树庞大或组件渲染开销大时，重渲染优化就变得至关重要。本章深入讲解React.memo、重渲染原因分析，以及如何系统性地优化React应用性能。

## 一、理解React重渲染机制

**重渲染（re-render）**是React重新执行组件函数计算新UI的过程。React在以下情况会触发组件重渲染：

1. **组件自身state变化**：调用setState/useState setter
2. **父组件重渲染**：父组件render会级联导致所有子组件重渲染（默认行为）
3. **context值变化**：useContext订阅的context value改变
4. **props变化**：但memo可以阻断这一过程

\`\`\`tsx
// 为什么父组件重渲染会导致所有子组件重渲染？
function Parent() {
  const [count, setCount] = useState(0)
  console.log('Parent render')

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      {/* 每次count变化，Parent重渲染，ChildA和ChildB都会重渲染 */}
      <ChildA />
      <ChildB />
    </div>
  )
}

function ChildA() {
  console.log('ChildA render') // 每次Parent render都会打印！
  return <div>Child A</div>
}

const ChildB = () => {
  console.log('ChildB render') // 每次Parent render都会打印！
  return <div>Child B</div>
}
\`\`\`

**重要认知**：重渲染≠DOM更新。重渲染是JS计算过程，React会diff虚拟DOM，只更新真正变化的DOM节点。但大量无意义的重渲染仍然会浪费CPU。

## 二、React.memo基础

\`React.memo\`是一个高阶组件（HOC），它会对props进行**浅比较（shallow compare）**，如果props没有变化，就跳过组件重渲染：

\`\`\`tsx
import { memo } from 'react'

// 1. 基础用法：memo包裹组件，默认浅比较props
const ExpensiveComponent = memo(function ExpensiveComponent({ items }: { items: Item[] }) {
  console.log('ExpensiveComponent render')
  // 假设有复杂计算或大量DOM
  return (
    <ul>
      {items.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  )
})

// 2. 自定义比较函数（谨慎使用！）
const VeryCustomComponent = memo(
  function VeryCustomComponent({ user, onUpdate }: Props) {
    return <div>{user.name}</div>
  },
  // 第二个参数：自定义areEqual函数，返回true表示不重渲染
  (prevProps, nextProps) => {
    return prevProps.user.id === nextProps.user.id &&
           prevProps.user.name === nextProps.user.name
  }
)
\`\`\`

**浅比较（Shallow Compare）原理**：
- 对基本类型（string/number/boolean），比较值是否相等
- 对引用类型（object/array/function），比较引用地址是否相同
- 只比较第一层属性，不递归深层比较

## 三、memo失效的常见原因

memo最常见的"坑"是**内联创建的对象/函数/数组每次都是新引用**，导致浅比较永远不相等：

\`\`\`tsx
// ❌ 错误示范：memo被内联props破坏
const MemoizedChild = memo(function Child({ style, onClick, data }: {
  style: React.CSSProperties
  onClick: () => void
  data: number[]
}) {
  console.log('Child render')
  return <div onClick={onClick} style={style}>{data.length}</div>
})

function Parent() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      {/* 以下props每次都是新引用！memo失效 */}
      <MemoizedChild
        style={{ color: 'red' }}           // 内联对象：新引用！
        onClick={() => console.log('click')} // 内联函数：新引用！
        data={[1, 2, 3]}                   // 内联数组：新引用！
      />
    </div>
  )
}

// ✅ 正确做法：useMemo/useCallback稳定引用
import { useMemo, useCallback } from 'react'

function ParentFixed() {
  const [count, setCount] = useState(0)

  // useMemo缓存对象引用
  const style = useMemo(() => ({ color: 'red' }), [])
  // useCallback缓存函数引用
  const onClick = useCallback(() => {
    console.log('click')
  }, [])
  // useMemo缓存数组
  const data = useMemo(() => [1, 2, 3], [])

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <MemoizedChild style={style} onClick={onClick} data={data} />
    </div>
  )
}
\`\`\`

**useMemo vs useCallback**：
- \`useMemo(() => value, deps)\`：缓存计算结果（值/对象/数组）
- \`useCallback(fn, deps)\`：等价于\`useMemo(() => fn, deps)\`，专门缓存函数

## 四、性能分析工具：找到真正的瓶颈

**不要盲目优化！先测量，再优化。**

\`\`\`tsx
// 1. React DevTools Profiler
// - Chrome/Firefox安装React Developer Tools扩展
// - 打开开发者工具 → Profiler标签
// - 点击"Record"按钮，操作页面，点击"Stop"
// - 可以看到每次commit哪些组件render了、耗时多少
// - 开启"Highlight updates when components render"选项，
//   交互时重渲染的组件会有彩色边框闪烁

// 2. why-did-you-render：检测不必要的重渲染
// 安装：npm install @welldone-software/why-did-you-render --save-dev

// 在开发环境初始化（src/wdyr.tsx）：
import React from 'react'

if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render')
  whyDidYouRender(React, {
    trackAllPureComponents: true, // 追踪所有memo组件
    // trackHooks: true,
  })
}

// 在入口文件最顶部导入
// import './wdyr'

// 为组件开启追踪
const MyComponent = memo(function MyComponent(props) {
  return <div>{props.name}</div>
})
MyComponent.whyDidYouRender = true

// Console会告诉你为什么这个组件重渲染了：
// "MyComponent re-rendered because of props changes:"
// "onClick: function different ← 这就是原因！"
\`\`\`

## 五、完整优化示例：列表项优化

\`\`\`tsx
import { memo, useState, useCallback, useMemo } from 'react'

// 列表项组件：用memo包裹
interface TodoItemProps {
  todo: { id: number; text: string; completed: boolean }
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}

const TodoItem = memo(function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  console.log(\`TodoItem \${todo.id} render\`)

  return (
    <div className="todo-item">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
        {todo.text}
      </span>
      <button onClick={() => onDelete(todo.id)}>删除</button>
    </div>
  )
})

// 父组件
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: '学习React', completed: false },
    { id: 2, text: '学习TypeScript', completed: true },
    { id: 3, text: '学习TanStack Query', completed: false },
  ])
  const [inputText, setInputText] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  // useCallback稳定函数引用
  const toggleTodo = useCallback((id: number) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }, [])

  const deleteTodo = useCallback((id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }, [])

  const addTodo = useCallback(() => {
    if (inputText.trim()) {
      setTodos(prev => [
        ...prev,
        { id: Date.now(), text: inputText.trim(), completed: false }
      ])
      setInputText('')
    }
  }, [inputText])

  // useMemo缓存过滤后的列表
  const filteredTodos = useMemo(() => {
    console.log('过滤计算执行')
    switch (filter) {
      case 'active': return todos.filter(t => !t.completed)
      case 'completed': return todos.filter(t => t.completed)
      default: return todos
    }
  }, [todos, filter])

  const completedCount = useMemo(
    () => todos.filter(t => t.completed).length,
    [todos]
  )

  return (
    <div>
      <h1>Todo List ({completedCount}/{todos.length} 已完成)</h1>

      <div>
        <input
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
          placeholder="添加新任务..."
        />
        <button onClick={addTodo}>添加</button>
      </div>

      <div>
        {(['all', 'active', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ fontWeight: filter === f ? 'bold' : 'normal' }}
          >
            {f === 'all' ? '全部' : f === 'active' ? '进行中' : '已完成'}
          </button>
        ))}
      </div>

      {filteredTodos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
        />
      ))}
    </div>
  )
}
\`\`\`

## 六、何时不需要memo？

过早优化是万恶之源。以下情况**不应该**使用memo：

| 场景 | 原因 |
|------|------|
| 组件很简单，渲染开销极小 | memo本身也有比较开销，可能得不偿失 |
| props变化很频繁 | 浅比较也挡不住频繁变化的props |
| 组件几乎不会重渲染 | 没有性能问题就不需要优化 |
| 列表项少于100个 | 浏览器完全能handle |
| 传给组件的props本来就是不稳定的 | memo没用，先解决props稳定性问题 |

**优化原则**：
1. 先用Profiler找到真正的性能瓶颈
2. 先优化渲染逻辑本身（减少不必要的计算）
3. 再考虑memo/useMemo/useCallback
4. 优化后再次测量，确认确实有提升
5. 不要在整个项目无脑加memo

## 小结

- React默认行为：父组件重渲染，所有子组件重渲染
- React.memo通过浅比较props跳过不必要的重渲染
- 内联对象/函数/数组是memo失效的最常见原因
- useMemo缓存值，useCallback缓存函数，稳定props引用
- 自定义areEqual深比较要谨慎，比较开销可能比重渲染还大
- React DevTools Profiler+why-did-you-render是性能分析利器
- 状态下放、children隔离是比memo更好的优化模式（见下一章）
- 不要过早优化，先测量再优化
`,
  },
  {
    id: "tsrx-suspense-lazy",
    group: "性能优化篇",
    icon: "📦",
    title: "代码分割与懒加载",
    content: `
# 代码分割与懒加载

首屏加载速度是用户体验的关键指标。如果把整个应用打包成一个JS文件，用户需要下载所有代码才能看到首屏，即使某些页面/功能可能永远不会访问。**代码分割（Code Splitting）**让我们把代码拆分成小块，按需加载，首屏bundle可以减小50%以上。

## 一、React.lazy + Suspense基础

\`React.lazy\`让你动态导入组件，配合\`Suspense\`显示加载中状态：

\`\`\`tsx
import { lazy, Suspense, useState } from 'react'

// 静态导入：首屏就会加载
import HeavyComponent from './HeavyComponent'

// 动态导入：用到时才加载
// React.lazy接收一个返回Promise的函数，即import()动态导入
const LazyHeavyComponent = lazy(() => import('./HeavyComponent'))

// 注意：lazy组件必须在Suspense内部渲染
function App() {
  const [showHeavy, setShowHeavy] = useState(false)

  return (
    <div>
      <h1>我的应用</h1>
      <button onClick={() => setShowHeavy(true)}>
        加载重型组件
      </button>

      {/* Suspense fallback：加载过程中显示的UI */}
      {showHeavy && (
        <Suspense fallback={<div>组件加载中...</div>}>
          <LazyHeavyComponent />
        </Suspense>
      )}
    </div>
  )
}
\`\`\`

**import()动态导入**是Webpack/Rollup/Vite等打包工具支持的语法，打包时会自动分割成独立的chunk文件。

## 二、路由级代码分割

路由级分割是最常见、收益最高的代码分割方式，每个页面一个chunk：

\`\`\`tsx
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

// 每个页面lazy import
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const UserProfile = lazy(() => import('./pages/UserProfile'))
const Settings = lazy(() => import('./pages/Settings'))
const NotFound = lazy(() => import('./pages/NotFound'))

// 全局Loading组件
function PageLoading() {
  return (
    <div className="page-loading">
      <div className="spinner" />
      <p>页面加载中...</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">首页</Link>
        <Link to="/about">关于</Link>
        <Link to="/dashboard">仪表盘</Link>
      </nav>

      {/* 整个路由区域用Suspense包裹 */}
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

// Next.js中更简单：app目录下的page.tsx自动做代码分割
// loading.tsx文件自动作为Suspense fallback
// app/dashboard/loading.tsx
export default function Loading() {
  return <div>仪表盘加载中...</div>
}
\`\`\`

## 三、Error Boundary捕获加载失败

网络请求可能失败（弱网、断网），动态导入的chunk可能加载失败。Error Boundary可以捕获渲染期错误，包括动态导入失败：

\`\`\`tsx
import { Component, ReactNode, ErrorInfo } from 'react'

// Error Boundary类组件
interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('组件加载失败:', error, errorInfo)
    // 可以在这里上报错误监控
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // 自定义错误UI + 重试按钮
      return this.props.fallback || (
        <div className="error-boundary">
          <h3>😢 加载失败</h3>
          <p>{this.state.error?.message}</p>
          <button onClick={this.handleRetry}>
            点击重试
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// 使用：Suspense + ErrorBoundary组合
function LazyComponentWithError() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoading />}>
        <LazyHeavyComponent />
      </Suspense>
    </ErrorBoundary>
  )
}

// 封装成通用的懒加载工具函数
function withSuspense<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  fallback?: ReactNode
) {
  const LazyComp = lazy(factory)
  return function WrappedComponent(props: React.ComponentProps<T>) {
    return (
      <ErrorBoundary>
        <Suspense fallback={fallback || <PageLoading />}>
          <LazyComp {...props} />
        </Suspense>
      </ErrorBoundary>
    )
  }
}

// 使用
const LazyChart = withSuspense(
  () => import('./components/Chart'),
  <div>图表加载中...</div>
)
\`\`\`

## 四、大组件按需加载

不是只有页面需要懒加载。大体积的第三方组件（ECharts、富文本编辑器、Markdown渲染器、PDF预览等）也应该按需加载：

\`\`\`tsx
import { lazy, Suspense, useState } from 'react'

// ECharts体积很大，只有用户进入图表页面才加载
const EChartsComponent = lazy(() => import('./components/EChartsComponent'))
// Markdown编辑器
const MarkdownEditor = lazy(() => import('./components/MarkdownEditor'))
// 图片查看器
const ImageLightbox = lazy(() => import('./components/ImageLightbox'))

function ArticleEditor() {
  const [showPreview, setShowPreview] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  return (
    <div className="editor-page">
      <Suspense fallback={<div>编辑器加载中...</div>}>
        <MarkdownEditor />
      </Suspense>

      <button onClick={() => setShowPreview(true)}>
        预览图表
      </button>

      {showPreview && (
        <Suspense fallback={<div>图表加载中...</div>}>
          <EChartsComponent />
        </Suspense>
      )}

      {lightboxImage && (
        <Suspense fallback={<div>图片加载中...</div>}>
          <ImageLightbox
            src={lightboxImage}
            onClose={() => setLightboxImage(null)}
          />
        </Suspense>
      )}
    </div>
  )
}
\`\`\`

**webpackChunkName注释**：给chunk命名，方便调试和预加载策略：

\`\`\`tsx
// 不加注释：chunk名是数字（如 234.chunk.js）
const A = lazy(() => import('./A'))

// 加webpackChunkName注释：chunk名是有意义的名称
const UserSettings = lazy(
  () => import(/* webpackChunkName: "user-settings" */ './pages/UserSettings')
)
const ECharts = lazy(
  () => import(/* webpackChunkName: "echarts" */ './components/ECharts')
)

// Vite中用类似注释
const MdEditor = lazy(
  () => import(/* @vite-ignore */ './components/MarkdownEditor')
)
\`\`\`

## 五、Preload/Prefetch预加载策略

懒加载是"用到才加载"，但我们可以**预测用户行为**，提前加载。用户hover链接时预加载对应页面chunk是常见优化：

\`\`\`tsx
import { lazy, useEffect, useRef, Suspense } from 'react'
import { Link } from 'react-router-dom'

// 方案1：Link组件hover时预加载
function PrefetchLink({ to, children }: { to: string; children: React.ReactNode }) {
  const prefetchedRef = useRef(false)

  const prefetch = () => {
    if (prefetchedRef.current) return
    prefetchedRef.current = true

    // 映射路由到chunk
    const chunkMap: Record<string, () => Promise<any>> = {
      '/dashboard': () => import('./pages/Dashboard'),
      '/settings': () => import('./pages/Settings'),
      '/profile': () => import('./pages/UserProfile'),
    }

    if (chunkMap[to]) {
      console.log('预加载页面:', to)
      chunkMap[to]() // 只需要调用import()，不用等待结果
    }
  }

  return (
    <Link
      to={to}
      onMouseEnter={prefetch}
      onFocus={prefetch} // 键盘tab聚焦时也预加载
    >
      {children}
    </Link>
  )
}

// 方案2：基于可见性预加载
import { useEffect, useRef } from 'react'

function LazySection({ children, loader }: {
  children: React.ReactNode
  loader: () => Promise<any>
}) {
  const ref = useRef<HTMLDivElement>(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (!ref.current || loadedRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !loadedRef.current) {
            loadedRef.current = true
            loader()
            observer.disconnect()
          }
        })
      },
      { rootMargin: '200px' } // 提前200px开始加载
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [loader])

  return <div ref={ref}>{children}</div>
}

// 方案3：空闲时预加载（requestIdleCallback）
function preloadWhenIdle(importFn: () => Promise<any>) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => importFn(), { timeout: 5000 })
  } else {
    setTimeout(() => importFn(), 1000)
  }
}

// 首屏渲染完成后预加载其他页面
useEffect(() => {
  // 首屏渲染后延迟预加载
  const timer = setTimeout(() => {
    preloadWhenIdle(() => import('./pages/Dashboard'))
    preloadWhenIdle(() => import('./pages/Settings'))
  }, 2000) // 首屏加载完成2秒后

  return () => clearTimeout(timer)
}, [])
\`\`\`

## 六、基于路由的预加载完整示例

\`\`\`tsx
import { lazy, Suspense, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'

// 路由配置 + 预加载映射
interface RouteConfig {
  path: string
  name: string
  component: React.LazyExoticComponent<React.ComponentType<any>>
  preload: () => Promise<any>
}

const routes: RouteConfig[] = [
  {
    path: '/',
    name: '首页',
    component: lazy(() => import(/* webpackChunkName: "home" */ './pages/Home')),
    preload: () => import(/* webpackChunkName: "home" */ './pages/Home'),
  },
  {
    path: '/products',
    name: '产品列表',
    component: lazy(() => import(/* webpackChunkName: "products" */ './pages/Products')),
    preload: () => import(/* webpackChunkName: "products" */ './pages/Products'),
  },
  {
    path: '/cart',
    name: '购物车',
    component: lazy(() => import(/* webpackChunkName: "cart" */ './pages/Cart')),
    preload: () => import(/* webpackChunkName: "cart" */ './pages/Cart'),
  },
]

// 智能导航Link：hover时预加载
function SmartLink({ route }: { route: RouteConfig }) {
  return (
    <Link
      to={route.path}
      onMouseEnter={() => route.preload()}
      onTouchStart={() => route.preload()} // 移动端触摸时预加载
    >
      {route.name}
    </Link>
  )
}

function Navigation() {
  return (
    <nav>
      {routes.map(route => (
        <SmartLink key={route.path} route={route} />
      ))}
    </nav>
  )
}

// 路由加载指示器（顶部进度条）
function RouteLoadingIndicator() {
  const location = useLocation()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [location.pathname])

  return loading ? <div className="top-progress-bar" /> : null
}

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <RouteLoadingIndicator />
      <Suspense fallback={<div className="page-fade-loading" />}>
        <Routes>
          {routes.map(route => (
            <Route
              key={route.path}
              path={route.path}
              element={<route.component />}
            />
          ))}
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
\`\`\`

## 小结

- React.lazy + Suspense实现组件级代码分割
- 路由级分割是收益最高的优化方式
- Error Boundary处理动态导入失败，提供重试机制
- 大体积第三方组件（ECharts/编辑器/预览器）按需加载
- webpackChunkName注释给chunk有意义的名称
- 用户hover链接时预加载是很好的UX优化
- IntersectionObserver实现组件接近视口时预加载
- requestIdleCallback在浏览器空闲时预加载
- Next.js的loading.tsx自动提供Suspense边界
- 首屏bundle减小50%+是完全可以做到的
`,
  },
  {
    id: "tsrx-virtual-list",
    group: "性能优化篇",
    icon: "📜",
    title: "虚拟列表与大数据渲染",
    content: `
# 虚拟列表与大数据渲染

当需要渲染成千上万条列表数据时（如聊天记录、日志、商品列表、表格），即使做了memo优化，DOM节点数量仍然会让浏览器卡顿。大量DOM节点带来的问题：**内存占用高**、**layout/reflow慢**、**初次渲染慢**、**滚动不流畅**。**虚拟列表（Virtual List/Windowing）**只渲染可视区域内的元素，完美解决大数据渲染问题。

## 一、问题场景：1万条列表为什么会卡？

\`\`\`tsx
// ❌ 一次性渲染1万条：浏览器会非常卡
function SlowList({ items }: { items: Item[] }) {
  console.log(\`渲染 \${items.length} 个DOM节点\`)
  return (
    <div className="list-container" style={{ height: '500px', overflow: 'auto' }}>
      {/* 10000个div节点！ */}
      {items.map(item => (
        <div key={item.id} className="list-item" style={{ height: '50px' }}>
          <img src={item.avatar} alt="" />
          <span>{item.name}</span>
          <span>{item.content}</span>
        </div>
      ))}
    </div>
  )
}

// 为什么会卡？
// 1. 创建10000个DOM节点本身就耗时
// 2. 每个DOM节点占内存（约几百字节到几KB）
// 3. 浏览器layout阶段需要计算所有节点位置
// 4. repaint阶段需要绘制所有节点
// 5. 滚动时浏览器需要处理所有节点
// 6. React diff10000个vnode也有开销
\`\`\`

**渲染方案选型参考**：

| 数据量 | 推荐方案 |
|--------|----------|
| < 100条 | 普通渲染，无需优化 |
| 100 - 1000条 | 分页（Pagination） |
| 100 - 1000条 | 无限滚动（Infinite Scroll） |
| > 1000条 | 虚拟列表（Virtual List） |
| > 10000条 | 虚拟列表 + 无限滚动 |

## 二、react-window快速上手

\`react-window\`是Brian Vaughn（React核心团队成员）开发的轻量虚拟列表库，API简洁，性能优秀：

\`\`\`bash
npm install react-window @types/react-window
\`\`\`

固定高度列表最简单：

\`\`\`tsx
import { FixedSizeList as List } from 'react-window'

// 固定高度虚拟列表
function VirtualizedList({ items }: { items: Item[] }) {
  // 只渲染可视区域约10个元素，上下留一点buffer
  console.log('DOM节点数约等于：可视区域高度 / item高度 + overscan')

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index]
    // style属性必须传给外层div！它包含定位信息
    return (
      <div style={style} className="list-item">
        <img src={item.avatar} alt="" width="40" height="40" />
        <div>
          <div className="name">{item.name}</div>
          <div className="content">{item.content}</div>
        </div>
      </div>
    )
  }

  return (
    <List
      height={500}           // 列表容器高度
      itemCount={items.length} // 总项数
      itemSize={60}          // 每项高度（固定）
      width="100%"           // 容器宽度
      overscanCount={5}      // 可视区域外预渲染的项数
    >
      {Row}
    </List>
  )
}

// 现在即使100万条数据也丝滑滚动！
const MillionItems = Array.from({ length: 1000000 }, (_, i) => ({
  id: i,
  name: \`用户\${i}\`,
  avatar: \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${i}\`,
  content: \`这是第\${i}条消息的内容...\`,
}))

function App() {
  return <VirtualizedList items={MillionItems} />
}
\`\`\`

**注意**：Row组件的\`style\`参数**必须**传给最外层DOM元素，它包含\`position: absolute\`和\`transform\`定位信息！

## 三、动态高度列表

如果列表项高度不固定（如文本内容长度不一），使用\`VariableSizeList\`：

\`\`\`tsx
import { VariableSizeList as List } from 'react-window'
import { useRef, useCallback } from 'react'

function DynamicHeightList({ messages }: { messages: Message[] }) {
  // 缓存每项高度
  const itemHeights = useRef<Record<number, number>>({})
  const listRef = useRef<List>(null)

  // 获取指定项高度
  const getItemSize = useCallback((index: number) => {
    // 返回缓存高度或默认高度
    return itemHeights.current[index] || 80
  }, [])

  // 项实际渲染后测量高度并更新
  const setItemSize = useCallback((index: number, size: number) => {
    if (itemHeights.current[index] !== size) {
      itemHeights.current[index] = size
      // 通知List重新计算该项高度
      listRef.current?.resetAfterIndex(index)
    }
  }, [])

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = messages[index]
    const rowRef = useRef<HTMLDivElement>(null)

    // 测量DOM实际高度
    useEffect(() => {
      if (rowRef.current) {
        const height = rowRef.current.getBoundingClientRect().height
        setItemSize(index, height)
      }
    }, [index, item.content])

    return (
      <div style={style}>
        <div ref={rowRef} className="message-item">
          <img src={item.avatar} alt="" />
          <div className="bubble">
            <div className="name">{item.name}</div>
            <div className="text">{item.content}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <List
      ref={listRef}
      height={600}
      itemCount={messages.length}
      itemSize={getItemSize}
      width="100%"
      overscanCount={3}
    >
      {Row}
    </List>
  )
}
\`\`\`

## 四、Autosizer自适应容器大小

\`react-virtualized-auto-sizer\`让List自动适应父容器大小：

\`\`\`bash
npm install react-virtualized-auto-sizer
\`\`\`

\`\`\`tsx
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'

function FullWindowList({ items }: { items: Item[] }) {
  return (
    <div className="list-page" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="list-header">列表头部</header>
      {/* AutoSizer会占用剩余空间，把width/height传给children */}
      <div style={{ flex: 1 }}>
        <AutoSizer>
          {({ height, width }) => (
            <FixedSizeList
              height={height}
              width={width}
              itemCount={items.length}
              itemSize={60}
            >
              {({ index, style }) => (
                <div style={style}>
                  {items[index].name}
                </div>
              )}
            </FixedSizeList>
          )}
        </AutoSizer>
      </div>
    </div>
  )
}
\`\`\`

## 五、手写一个简化版虚拟列表

理解原理才能更好地使用。固定高度虚拟列表的核心原理：

1. 只渲染可视区域+少量overscan的项
2. 外层容器设置总高度撑开滚动条
3. 内层用\`transform: translateY()\`定位到正确位置

\`\`\`tsx
import { useState, useRef, useCallback, useEffect } from 'react'

interface SimpleVirtualListProps<T> {
  items: T[]
  itemHeight: number
  height: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
}

function SimpleVirtualList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  overscan = 3,
}: SimpleVirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)

  // 计算可视区域起始/结束索引
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const visibleCount = Math.ceil(height / itemHeight) + overscan * 2
  const endIndex = Math.min(items.length, startIndex + visibleCount)

  // 总高度：撑开滚动条
  const totalHeight = items.length * itemHeight
  // 偏移量：把渲染的项往下移
  const offsetY = startIndex * itemHeight

  // 需要渲染的项
  const visibleItems = items.slice(startIndex, endIndex)

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        height,
        overflow: 'auto',
        position: 'relative',
      }}
      onScroll={handleScroll}
    >
      {/* 占位div：撑开滚动条，模拟完整列表高度 */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* 实际渲染的项：用translateY定位 */}
        <div style={{ transform: \`translateY(\${offsetY}px)\` }}>
          {visibleItems.map((item, i) => (
            <div
              key={startIndex + i}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 使用手写的虚拟列表
function Demo() {
  const items = Array.from({ length: 100000 }, (_, i) => ({
    id: i,
    name: \`项 \${i}\`,
  }))

  return (
    <SimpleVirtualList
      items={items}
      itemHeight={50}
      height={500}
      overscan={5}
      renderItem={(item) => (
        <div style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
          {item.name}
        </div>
      )}
    />
  )
}
\`\`\`

**原理图示**：
\`\`\`
滚动容器（viewport, 500px高）
┌─────────────────────────┐
│                         │
│  overscan (3个)         │
│  ┌───────────────────┐  │
│  │ 项 47             │  │ ← translateY(47*50=2350px)
│  │ 项 48             │  │
│  │ 项 49             │  │
│  ├───────────────────┤  │
│  │ 项 50  ───┐       │  │ ← scrollTop=2500
│  │ 项 51     │ 可视  │  │
│  │ ...       │ 区域  │  │
│  │ 项 59     │ 10个  │  │
│  ├───────────────────┤  │
│  │ 项 60         ───┘  │  │
│  │ 项 61             │  │
│  │ 项 62 (overscan)  │  │
└─────────────────────────┘
  项 63 ...（不渲染）
  ...
  项 99999
\`\`\`

## 六、虚拟表格+横向滚动

\`react-window\`也支持表格和横向滚动：

\`\`\`tsx
import { FixedSizeGrid as Grid } from 'react-window'

// 虚拟表格（Grid）
function VirtualTable({ data }: { data: string[][] }) {
  const Cell = ({
    columnIndex,
    rowIndex,
    style,
  }: {
    columnIndex: number
    rowIndex: number
    style: React.CSSProperties
  }) => (
    <div
      style={{
        ...style,
        padding: '8px',
        borderBottom: '1px solid #eee',
        borderRight: '1px solid #eee',
        background: rowIndex === 0 ? '#f5f5f5' : 'white',
        fontWeight: rowIndex === 0 ? 'bold' : 'normal',
      }}
    >
      {data[rowIndex][columnIndex]}
    </div>
  )

  return (
    <div style={{ border: '1px solid #ddd' }}>
      <Grid
        height={400}
        width={800}
        columnCount={data[0]?.length || 0}
        columnWidth={150}
        rowCount={data.length}
        rowHeight={40}
        overscanRowCount={5}
        overscanColumnCount={2}
      >
        {Cell}
      </Grid>
    </div>
  )
}
\`\`\`

**react-window vs react-virtualized**：
- **react-window**：轻量（~12KB gzip）、API简洁，满足90%场景
- **react-virtualized**：功能丰富（Grid/Table/Masonry瀑布流/CellMeasurer），包更大

推荐优先用react-window，需要瀑布流等复杂场景再用react-virtualized。

## 七、虚拟列表+无限滚动

结合虚拟列表和无限滚动，处理超大量数据：

\`\`\`tsx
import { FixedSizeList } from 'react-window'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

function InfiniteVirtualList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['items'],
    queryFn: ({ pageParam = 1 }) => fetchItemsPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  })

  // 扁平化所有页数据
  const allItems = data?.pages.flatMap(p => p.items) ?? []
  const listRef = useRef<FixedSizeList>(null)
  const outerRef = useRef<HTMLDivElement>(null)

  // 滚动到底部检测
  useEffect(() => {
    const handleScroll = () => {
      if (!outerRef.current || !hasNextPage || isFetchingNextPage) return

      const { scrollTop, scrollHeight, clientHeight } = outerRef.current
      // 距离底部200px时加载更多
      if (scrollHeight - scrollTop - clientHeight < 200) {
        fetchNextPage()
      }
    }

    const el = outerRef.current
    el?.addEventListener('scroll', handleScroll)
    return () => el?.removeEventListener('scroll', handleScroll)
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = allItems[index]
    if (!item) return <div style={style}>加载中...</div>

    return (
      <div style={style} className="list-item">
        {item.name}
      </div>
    )
  }

  return (
    <FixedSizeList
      ref={listRef}
      outerRef={outerRef}
      height={600}
      width="100%"
      itemCount={allItems.length + (hasNextPage ? 1 : 0)}
      itemSize={60}
    >
      {Row}
    </FixedSizeList>
  )
}
\`\`\`

## 小结

- 超过1000条数据优先考虑虚拟列表
- react-window轻量高效，覆盖大多数场景
- FixedSizeList用于固定高度，VariableSizeList用于动态高度
- style属性一定要传给渲染项的外层DOM
- AutoSizer实现容器自适应
- react-virtualized提供瀑布流、表格等更复杂组件
- 虚拟列表核心原理：只渲染可视区+translateY定位
- 虚拟列表+无限滚动是大数据列表的终极方案
- 动态高度列表用ResizeObserver测量+缓存高度
- 虚拟列表滚动时保持低DOM节点数，永远流畅
`,
  },
  {
    id: "tsrx-perf-patterns",
    group: "性能优化篇",
    icon: "⚡",
    title: "其他性能优化模式",
    content: `
# 其他性能优化模式

除了React.memo、代码分割、虚拟列表，还有很多重要的React性能优化模式。本章讲解状态下放、children隔离、useDeferredValue/useTransition并发特性、Web Worker、bundle分析等，构建完整的性能优化知识体系。

## 一、状态下放（Colocate State）

这是最简单也最有效的优化模式：**把state移到实际使用它的子组件中**，避免父组件重渲染时连累所有子组件。

\`\`\`tsx
import { useState } from 'react'

// ❌ 反模式：state放在不需要它的父组件
function BadCounterPage() {
  const [count, setCount] = useState(0)
  console.log('BadCounterPage render')

  return (
    <div>
      <h1>我的页面</h1>
      {/* count变化，整个页面重渲染，包括HeavyComponent */}
      <Counter count={count} setCount={setCount} />
      <HeavyComponent /> {/* 不需要count，但被迫重渲染 */}
      <AnotherHeavyComponent /> {/* 同样被迫重渲染 */}
    </div>
  )
}

function Counter({ count, setCount }: {
  count: number
  setCount: (n: number) => void
}) {
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}

// ✅ 好模式：state下放，Counter自己管理状态
function GoodCounterPage() {
  console.log('GoodCounterPage render（只渲染一次）')

  return (
    <div>
      <h1>我的页面</h1>
      {/* Counter自己管state，点击按钮不影响其他组件 */}
      <SelfContainedCounter />
      <HeavyComponent />
      <AnotherHeavyComponent />
    </div>
  )
}

function SelfContainedCounter() {
  const [count, setCount] = useState(0)
  console.log('Counter render')
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  )
}
\`\`\`

**原则**：state应该放在尽可能靠近使用它的组件的地方。如果只有一个子组件用某个state，就把state放在那个子组件里。

## 二、children隔离（children as a prop）

当父组件需要state但又不想连累某些子组件时，可以把"不需要state的部分"作为children传入。children prop是引用稳定的，父组件重渲染时children不会重渲染！

\`\`\`tsx
import { useState, memo, ReactNode } from 'react'

// ❌ 反模式
function BadLayout() {
  const [open, setOpen] = useState(false)
  console.log('BadLayout render')
  return (
    <div>
      <button onClick={() => setOpen(!open)}>切换</button>
      {/* 每次open变化，下面两个大组件都重渲染 */}
      <VeryHeavyNav />
      <VeryHeavyContent />
    </div>
  )
}

// ✅ 好模式：把不变部分作为children
function GoodLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  console.log('GoodLayout render（state变化时会渲染）')

  return (
    <div>
      <button onClick={() => setOpen(!open)}>切换</button>
      <nav>菜单: {open ? '展开' : '收起'}</nav>
      {/* children是从父组件传下来的，引用稳定，不会重渲染！ */}
      {children}
    </div>
  )
}

// App层：把不随open变化的内容作为children传入
function App() {
  return (
    <GoodLayout>
      {/* 这部分作为children传进去，GoodLayout重渲染时它们不会重渲染 */}
      <VeryHeavyNav />
      <VeryHeavyContent />
    </GoodLayout>
  )
}

// 更通用的模式：把"昂贵"的部分抽成组件，memo包裹
const ExpensiveWrapper = memo(function ExpensiveWrapper() {
  return (
    <>
      <VeryHeavyNav />
      <VeryHeavyContent />
    </>
  )
})

function GoodLayout2() {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button onClick={() => setOpen(!open)}>切换</button>
      <ExpensiveWrapper /> {/* memo保护 */}
    </div>
  )
}
\`\`\`

**为什么children可以隔离重渲染？**
- children本质上是React.createElement()创建的ReactElement对象
- 在App组件中创建后作为prop传给GoodLayout
- App不重渲染，children引用就不变
- GoodLayout重渲染时，children prop引用不变
- React发现引用不变，跳过children的重渲染

## 三、useDeferredValue：非紧急更新

React 18引入并发特性，\`useDeferredValue\`让你可以延迟更新非紧急部分，保持交互流畅。典型场景：大列表搜索，输入框要即时响应，搜索结果列表可以延迟更新。

\`\`\`tsx
import { useState, useDeferredValue, useMemo } from 'react'

function SearchableList({ allProducts }: { allProducts: Product[] }) {
  const [query, setQuery] = useState('')
  // deferredQuery是query的延迟版本
  const deferredQuery = useDeferredValue(query)
  // isStale表示延迟值是否落后于最新值
  const isStale = query !== deferredQuery

  // 使用deferredQuery进行搜索
  // 输入时query立刻更新，deferredQuery在空闲时更新
  const results = useMemo(() => {
    console.log('搜索:', deferredQuery)
    if (!deferredQuery) return allProducts
    return allProducts.filter(p =>
      p.name.toLowerCase().includes(deferredQuery.toLowerCase())
    )
  }, [allProducts, deferredQuery])

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="搜索商品..."
        // 输入框始终即时响应
        style={{ width: '100%', padding: '12px', fontSize: '16px' }}
      />

      {/* 列表可以"赶不上"输入，但输入框永远流畅 */}
      <div style={{ opacity: isStale ? 0.6 : 1, transition: 'opacity 0.2s' }}>
        <ProductList products={results} />
      </div>

      {isStale && <div className="loading-indicator">更新中...</div>}
    </div>
  )
}

// 对比：不用useDeferredValue的版本，输入时可能卡顿
function SlowSearch({ allProducts }: { allProducts: Product[] }) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    // 每次输入都同步执行大计算，阻塞主线程
    return allProducts.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase())
    )
  }, [allProducts, query])

  return (
    <div>
      {/* 输入框卡顿，因为渲染被大计算阻塞 */}
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ProductList products={results} />
    </div>
  )
}
\`\`\`

**useDeferredValue vs debounce（防抖）**：

| 特性 | useDeferredValue | debounce |
|------|------------------|----------|
| 机制 | React并发调度 | setTimeout |
| 延迟时间 | 自适应（设备快就快，设备慢就慢） | 固定延迟 |
| 是否中断渲染 | 可中断 | 不可中断 |
| 结果显示 | 尽可能快地更新 | 必须等固定时间 |
| 需要useEffect | 不需要 | 需要 |

## 四、useTransition：非阻塞导航

\`useTransition\`让你把某些更新标记为**非紧急（transition）**，紧急更新（如输入、点击反馈）可以中断transition更新。典型场景：tab切换、页面导航，避免点击后UI卡死。

\`\`\`tsx
import { useState, useTransition } from 'react'

function TabContainer() {
  const [activeTab, setActiveTab] = useState<'home' | 'posts' | 'contact'>('home')
  // isPending：transition是否进行中
  // startTransition：包裹的更新为低优先级
  const [isPending, startTransition] = useTransition()

  const handleTabChange = (tab: typeof activeTab) => {
    // 把tab切换标记为transition
    startTransition(() => {
      setActiveTab(tab)
    })
  }

  return (
    <div>
      <div className="tabs">
        {(['home', 'posts', 'contact'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            style={{
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {tab === 'home' ? '首页' : tab === 'posts' ? '文章' : '联系'}
          </button>
        ))}
      </div>

      {/* tab切换渲染很重，但不会阻塞按钮点击反馈 */}
      <div style={{ opacity: isPending ? 0.5 : 1 }}>
        {activeTab === 'home' && <HeavyHomeTab />}
        {activeTab === 'posts' && <HeavyPostsTab />}
        {activeTab === 'contact' && <HeavyContactTab />}
      </div>
    </div>
  )
}

// 搜索场景：输入+结果
function SearchWithTransition({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('')
  const [filtered, setFiltered] = useState(products)
  const [isPending, startTransition] = useTransition()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 输入是紧急更新，立即执行
    setQuery(e.target.value)
    // 过滤大列表是非紧急更新
    startTransition(() => {
      const result = products.filter(p =>
        p.name.includes(e.target.value)
      )
      setFiltered(result)
    })
  }

  return (
    <div>
      {/* 输入永远不卡 */}
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <ProductList products={filtered} />
    </div>
  )
}
\`\`\`

## 五、图片懒加载

图片是网页中占比最大的资源类型，懒加载可以显著提升首屏速度：

\`\`\`tsx
import { useState, useRef, useEffect } from 'react'

// 方案1：原生loading="lazy"（最简单，现代浏览器都支持）
function NativeLazyImage({ src, alt, placeholder }: {
  src: string
  alt: string
  placeholder?: string
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy" // 原生懒加载
      decoding="async" // 异步解码
      style={{
        width: '100%',
        aspectRatio: '16/9',
        background: placeholder || '#f0f0f0',
        objectFit: 'cover',
      }}
    />
  )
}

// 方案2：IntersectionObserver自定义懒加载（更可控，支持占位符动画）
function LazyImage({ src, alt, width = 300, height = 200 }: {
  src: string
  alt: string
  width?: number
  height?: number
}) {
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setInView(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '200px' } // 提前200px开始加载
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={imgRef}
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        background: '#f0f0f0',
      }}
    >
      {/* 占位符骨架屏 */}
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      )}
      {/* 进入视口才设置src */}
      {inView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        />
      )}
    </div>
  )
}
\`\`\`

## 六、Web Worker处理CPU密集计算

JavaScript是单线程的，CPU密集计算（大JSON解析、图像处理、加密解密、复杂排序）会阻塞主线程导致UI卡顿。Web Worker让我们在后台线程执行计算：

\`\`\`tsx
// src/workers/heavy-calculation.worker.ts
// Web Worker文件
self.onmessage = (e) => {
  const { type, data } = e.data

  switch (type) {
    case 'sort': {
      // 大数组排序（在worker线程不阻塞UI）
      const sorted = [...data].sort((a, b) => b.value - a.value)
      self.postMessage({ type: 'sorted', data: sorted })
      break
    }
    case 'parse': {
      // 大JSON解析
      const parsed = JSON.parse(data)
      self.postMessage({ type: 'parsed', data: parsed })
      break
    }
  }
}

// 主线程Hook封装
import { useEffect, useRef, useState } from 'react'

function useWorker<T, R>(workerUrl: string) {
  const workerRef = useRef<Worker | null>(null)
  const [result, setResult] = useState<R | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    // 创建Worker
    const worker = new Worker(new URL(workerUrl, import.meta.url), {
      type: 'module',
    })

    worker.onmessage = (e) => {
      setResult(e.data.data)
      setProcessing(false)
    }

    workerRef.current = worker
    return () => worker.terminate()
  }, [workerUrl])

  const postMessage = (data: T) => {
    setProcessing(true)
    workerRef.current?.postMessage(data)
  }

  return { result, processing, postMessage }
}

// 使用示例（Vite需要配置worker支持）
function DataProcessor() {
  const { result, processing, postMessage } = useWorker<any[], any[]>(
    '../workers/heavy-calculation.worker.ts'
  )

  const processLargeData = () => {
    const largeData = Array.from({ length: 1000000 }, (_, i) => ({
      id: i,
      value: Math.random(),
    }))
    postMessage({ type: 'sort', data: largeData })
    // UI不会卡顿，因为排序在worker线程
  }

  return (
    <div>
      <button onClick={processLargeData} disabled={processing}>
        {processing ? '处理中...' : '处理大数据'}
      </button>
      {result && <div>处理完成，共{result.length}条</div>}
    </div>
  )
}

// 简单场景也可以用comlink简化Worker通信
// npm install comlink
// import * as Comlink from 'comlink'
\`\`\`

## 七、Bundle体积分析

减小bundle体积是首屏性能优化的关键。先分析再优化：

\`\`\`bash
# Next.js
npm install @next/bundle-analyzer -D
# 在next.config.js中配置
# const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: true })

# Vite + rollup-plugin-visualizer
npm install rollup-plugin-visualizer -D
# vite.config.ts中配置plugins添加visualizer()

# Webpack
npm install webpack-bundle-analyzer -D

# VS Code插件：Import Cost
# 直接在编辑器显示每个import的包大小
\`\`\`

**Tree Shaking + 按需引入**：

\`\`\`tsx
// ❌ 导入整个lodash（~70KB gzip）
import _ from 'lodash'
_.debounce(fn, 300)
_.throttle(fn, 300)

// ✅ 只导入需要的函数（几KB）
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'

// ✅ 更好：用lodash-es（支持ES Module tree shaking）
import { debounce, throttle } from 'lodash-es'

// ❌ 引入整个antd
import { Button, DatePicker } from 'antd'
// ✅ antd v5+自动支持tree shaking，v4需要babel-plugin-import

// dayjs替代moment（moment是290KB，dayjs只有2KB）
// ❌
import moment from 'moment'
// ✅
import dayjs from 'dayjs'

// 检查哪些依赖占体积大
// npm ls <package> 查看依赖树
// npx depcheck 找出未使用的依赖
\`\`\`

## 八、React重渲染优化清单

1. ✅ **状态下放**：state尽可能下沉到使用它的组件
2. ✅ **children隔离**：不变部分作为children或memo组件
3. ✅ **列表key稳定**：不要用index做key
4. ✅ **useMemo缓存计算密集值**：不是所有值都缓存
5. ✅ **useCallback稳定回调引用**：配合memo使用
6. ✅ **React.memo**：memo经常重渲染且渲染成本高的组件
7. ✅ **避免内联对象/函数**：在memo组件的props中
8. ✅ **代码分割**：路由级+大组件级lazy加载
9. ✅ **虚拟列表**：1000条以上数据
10. ✅ **useDeferredValue/useTransition**：大计算/大渲染场景
11. ✅ **图片懒加载**：loading="lazy"或IntersectionObserver
12. ✅ **Web Worker**：CPU密集型计算移出主线程
13. ✅ **Bundle分析**：定期检查包大小，移除无用依赖
14. ✅ **Profiler测量**：先找瓶颈再优化，不要盲目优化

## 小结

- 状态下放是最有效的优化，影响面最小
- children prop天然隔离重渲染
- useDeferredValue延迟非紧急更新，输入不卡
- useTransition标记低优先级更新，可被高优先级中断
- 原生loading="lazy"是最简单的图片懒加载
- IntersectionObserver实现自定义懒加载+骨架屏
- Web Worker把CPU密集计算移出主线程
- 定期用bundle-analyzer检查包体积
- 用dayjs替代moment，按需引入lodash函数
- tree shaking需要ES Module
- 优化遵循"先测量再优化"原则
- React DevTools Profiler是性能调优必备工具
`,
  },
  {
    id: "tsrx-css-modules",
    group: "样式篇",
    icon: "🎨",
    title: "CSS Modules与CSS-in-JS",
    content: `
# CSS Modules与CSS-in-JS

React生态中有多种样式解决方案，各有优劣。本章对比CSS Modules、CSS-in-JS（styled-components/Emotion）方案，讲解类型安全、主题切换、样式组合等实战技巧，并给出选型建议。

## 一、CSS Modules基础

CSS Modules是React社区最广泛使用的样式方案之一。核心原理：编译时将类名转换为唯一值，彻底避免样式冲突。

\`\`\`tsx
// Button.module.css
.button {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.primary {
  background: #3b82f6;
  color: white;
}

.primary:hover {
  background: #2563eb;
}

.outline {
  background: transparent;
  border: 1px solid #3b82f6;
  color: #3b82f6;
}

.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

// Button.tsx
import styles from './Button.module.css'

interface ButtonProps {
  variant?: 'primary' | 'outline'
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
}

export function Button({
  variant = 'primary',
  disabled = false,
  children,
  onClick,
}: ButtonProps) {
  // 组合多个class
  const classNames = [
    styles.button,
    styles[variant],
    disabled ? styles.disabled : '',
  ].filter(Boolean).join(' ')

  return (
    <button className={classNames} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}

// 编译后的HTML类似：
// <button class="Button_button__3aXyz Button_primary__7kDef">点击</button>
// 类名包含文件名、原始类名、hash，全局唯一不冲突
\`\`\`

CSS Modules支持SCSS/LESS等预处理器：

\`\`\`bash
npm install -D sass
# 然后用 .module.scss 文件
\`\`\`

\`\`\`scss
// Button.module.scss
$primary-color: #3b82f6;
$border-radius: 6px;

.button {
  padding: 8px 16px;
  border-radius: $border-radius;
  border: none;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }

  &-primary {
    background: $primary-color;
    color: white;
  }

  &-large {
    padding: 12px 24px;
    font-size: 16px;
  }
}
\`\`\`

## 二、CSS Modules类型声明

TypeScript默认不认识\`.module.css\`导入，需要类型声明+可选的智能提示插件：

\`\`\`typescript
// src/vite-env.d.ts 或 src/global.d.ts
declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string }
  export default classes
}

// VS Code智能提示：typescript-plugin-css-modules
// npm install -D typescript-plugin-css-modules
// tsconfig.json添加：
// {
//   "compilerOptions": {
//     "plugins": [{ "name": "typescript-plugin-css-modules" }]
//   }
// }
// 这样在写styles.时会有className自动补全
\`\`\`

## 三、composes组合与继承

CSS Modules的\`composes\`关键字实现样式复用：

\`\`\`css
/* base.module.css */
.baseButton {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.flexCenter {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Button.module.css */
.button {
  composes: baseButton from './base.module.css';
  composes: flexCenter from './base.module.css';
  /* Button特有样式 */
  font-size: 14px;
}

.primary {
  composes: button;
  background: #3b82f6;
  color: white;
}

.danger {
  composes: button;
  background: #ef4444;
  color: white;
}

/* TypeScript中使用 */
import styles from './Button.module.css'

export function DangerButton({ children }: { children: React.ReactNode }) {
  return <button className={styles.danger}>{children}</button>
}
// composes的类会自动合并到最终class
// <button class="Button_danger__x baseButton__a flexCenter__y">
\`\`\`

## 四、CSS Variables主题切换

CSS自定义属性（CSS Variables）是实现主题切换的原生方案，配合CSS Modules使用非常优雅：

\`\`\`css
/* globals.css */
:root {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-border: #e5e7eb;
  --color-card-bg: #f9fafb;
  --radius: 8px;
  --shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* 深色主题 */
[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-text: #f1f5f9;
  --color-primary: #60a5fa;
  --color-primary-hover: #93c5fd;
  --color-border: #334155;
  --color-card-bg: #1e293b;
  --shadow: 0 1px 3px rgba(0,0,0,0.3);
}

body {
  background: var(--color-bg);
  color: var(--color-text);
  transition: background 0.3s, color 0.3s;
}

/* Card.module.css */
.card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 20px;
}

/* ThemeSwitcher组件 */
import { useState, useEffect } from 'react'

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'light' | 'dark' || 'light'
    }
    return 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? '🌙 深色' : '☀️ 浅色'}
    </button>
  )
}
\`\`\`

## 五、styled-components

styled-components是最流行的CSS-in-JS库之一，组件即样式，自动生成唯一类名，支持动态props：

\`\`\`bash
npm install styled-components
npm install -D @types/styled-components
\`\`\`

\`\`\`tsx
import styled, { css, createGlobalStyle, ThemeProvider } from 'styled-components'

// 1. 基础样式组件
const Button = styled.button<{
  $primary?: boolean
  $size?: 'sm' | 'md' | 'lg'
  $danger?: boolean
}>\`
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  /* size变体 */
  \${props => {
    switch (props.$size) {
      case 'sm': return css\`padding: 4px 10px; font-size: 12px;\`
      case 'lg': return css\`padding: 12px 24px; font-size: 16px;\`
      default: return css\`padding: 8px 16px; font-size: 14px;\`
    }
  }}

  /* variant变体 */
  \${props => {
    if (props.$danger) {
      return css\`
        background: #ef4444;
        color: white;
        &:hover { background: #dc2626; }
      \`
    }
    if (props.$primary) {
      return css\`
        background: \${p => p.theme.primary};
        color: white;
        &:hover { background: \${p => p.theme.primaryHover}; }
      \`
    }
    return css\`
      background: transparent;
      border: 1px solid #d1d5db;
      &:hover { background: #f3f4f6; }
    \`
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
\`

// 扩展已有样式组件
const RoundButton = styled(Button)\`
  border-radius: 9999px;
\`

// 2. 主题配置
interface Theme {
  primary: string
  primaryHover: string
  background: string
  text: string
  border: string
}

const lightTheme: Theme = {
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  background: '#ffffff',
  text: '#1a1a1a',
  border: '#e5e7eb',
}

const darkTheme: Theme = {
  primary: '#60a5fa',
  primaryHover: '#93c5fd',
  background: '#0f172a',
  text: '#f1f5f9',
  border: '#334155',
}

// 类型声明合并（让TypeScript识别theme类型）
declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}

// 全局样式
const GlobalStyle = createGlobalStyle\`
  body {
    margin: 0;
    padding: 0;
    background: \${p => p.theme.background};
    color: \${p => p.theme.text};
    font-family: system-ui, -apple-system, sans-serif;
  }
\`

// 3. 使用主题
function App() {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <GlobalStyle />
      <Button $primary $size="md" onClick={() => setDarkMode(!darkMode)}>
        切换主题
      </Button>
      <RoundButton $danger $size="lg">
        删除
      </RoundButton>
    </ThemeProvider>
  )
}
\`\`\`

**注意**：styled-components中传递给DOM的transient props要加\`$\`前缀（如\`$primary\`而不是\`primary\`），避免把自定义props透传到DOM元素产生React警告。

## 六、Emotion

Emotion是另一个流行的CSS-in-JS库，灵活性高，支持css prop：

\`\`\`bash
npm install @emotion/react @emotion/styled
\`\`\`

\`\`\`tsx
/** @jsxImportSource @emotion/react */
import { css, styled, ThemeProvider } from '@emotion/react'

// css prop方式
function Button({ primary = false, children }: { primary?: boolean; children: React.ReactNode }) {
  return (
    <button
      css={css\`
        padding: 8px 16px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        \${primary && css\`
          background: #3b82f6;
          color: white;
        \`}
        &:hover {
          opacity: 0.9;
        }
      \`}
    >
      {children}
    </button>
  )
}

// styled方式（类似styled-components）
const Card = styled.div<{ elevated?: boolean }>\`
  padding: 20px;
  border-radius: 8px;
  background: white;
  \${props => props.elevated && css\`
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  \`}
\`

// 主题
const theme = {
  colors: {
    primary: '#3b82f6',
    text: '#1a1a1a',
  },
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Card elevated>
        <Button primary>点击</Button>
      </Card>
    </ThemeProvider>
  )
}
\`\`\`

## 七、CSS Modules vs CSS-in-JS vs Tailwind 选型

| 维度 | CSS Modules | styled-components/Emotion | Tailwind CSS |
|------|-------------|---------------------------|--------------|
| 学习成本 | 低（就是CSS） | 中（新API+动态样式） | 中（记忆类名） |
| 样式冲突 | 编译后唯一类名，无冲突 | 自动生成唯一类名 | 工具类，天然无冲突 |
| 动态样式 | 通过className组合 | 天然支持（props） | 通过变体/条件class |
| TypeScript支持 | 需要插件 | 原生支持 | 原生支持 |
| 主题切换 | CSS Variables | ThemeProvider | CSS Variables/class策略 |
| 运行时开销 | 无（编译时处理） | 有（运行时生成CSS） | 无（编译时） |
| 包体积 | 无额外JS | +~12KB gzip | 构建时purge，CSS很小 |
| 代码共置 | 样式文件和组件同目录 | 样式写在组件里 | class直接写在JSX上 |
| 适用场景 | 传统项目/团队熟悉CSS | 设计系统/高度动态样式 | 新项目/快速开发 |

**推荐选择**：

1. **团队CSS基础好，不需要太多动态样式** → CSS Modules（简单、无运行时开销）
2. **构建设计系统、组件库、大量动态主题** → styled-components/Emotion
3. **新项目、追求开发效率、喜欢Utility First** → Tailwind CSS（下一章详细讲）
4. **大项目考虑性能** → CSS Modules 或 Tailwind（无运行时开销）

## 八、全局样式与CSS Reset

无论选择哪种方案，都需要处理全局样式重置：

\`\`\`css
/* globals.css - 现代CSS Reset */
*, *::before, *::after {
  box-sizing: border-box;
}

* {
  margin: 0;
  padding: 0;
}

html, body, #root {
  height: 100%;
}

body {
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  line-height: 1.5;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}

input, button, textarea, select {
  font: inherit;
}

p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}

a {
  color: inherit;
  text-decoration: none;
}

ul, ol {
  list-style: none;
}
\`\`\`

## 小结

- CSS Modules编译时生成唯一类名，零运行时开销
- typescript-plugin-css-modules提供className智能提示
- composes实现样式组合复用
- CSS Variables是原生主题切换方案，配合data-theme属性
- styled-components/Emotion支持动态props和ThemeProvider
- transient props用$前缀避免透传到DOM
- Emotion的css prop灵活度更高
- CSS Modules零运行时，CSS-in-JS有少量运行时开销
- 根据团队情况和项目需求选择方案，可以混合使用
- 先用CSS Reset统一浏览器默认样式
- 样式方案没有银弹，适合团队的就是最好的
`,
  },
  {
    id: "tsrx-tailwind",
    group: "样式篇",
    icon: "💨",
    title: "Tailwind CSS在React中实战",
    content: `
# Tailwind CSS在React中实战

Tailwind CSS是一款Utility First（原子类优先）的CSS框架，提供大量预定义的小工具类，直接在HTML/JSX中组合样式，不用写自定义CSS。配合TypeScript可以构建类型安全、高度可定制的设计系统，开发效率极高。

## 一、Tailwind配置

\`\`\`bash
# Vite项目安装
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Next.js安装（Next.js 13+内置支持）
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
\`\`\`

\`\`\`javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // 指定扫描哪些文件中的Tailwind类名（非常重要！）
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // 深色模式：基于class切换而非媒体查询
  theme: {
    extend: {
      // 扩展主题（不会覆盖默认值）
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      spacing: {
        '128': '32rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
\`\`\`

\`\`\`javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
\`\`\`

\`\`\`css
/* src/index.css - 添加Tailwind指令 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 可以在这里添加自定义工具类 */
@layer utilities {
  .content-auto {
    content-visibility: auto;
  }
  .text-balance {
    text-wrap: balance;
  }
}
\`\`\`

## 二、响应式设计

Tailwind采用移动优先（mobile-first）的断点设计：

\`\`\`tsx
function ResponsiveDemo() {
  return (
    <div>
      {/* 
        断点：
        sm: 640px 以上
        md: 768px 以上
        lg: 1024px 以上
        xl: 1280px 以上
        2xl: 1536px 以上
      */}

      {/* 手机1列，平板2列，桌面3列，大屏4列 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        {products.map(product => (
          <div key={product.id} className="p-4 border rounded-lg">
            <img src={product.image} alt="" className="w-full aspect-square object-cover mb-3" />
            <h3 className="text-sm md:text-base lg:text-lg font-semibold">
              {product.name}
            </h3>
            {/* 手机隐藏价格，平板以上显示 */}
            <p className="hidden md:block text-gray-500">¥{product.price}</p>
          </div>
        ))}
      </div>

      {/* flex响应式方向 */}
      <div className="flex flex-col md:flex-row gap-4">
        <aside className="w-full md:w-64 shrink-0">侧边栏</aside>
        <main className="flex-1">主内容</main>
      </div>

      {/* 响应式padding/字体 */}
      <div className="p-4 md:p-6 lg:p-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
          响应式标题
        </h1>
      </div>
    </div>
  )
}
\`\`\`

## 三、clsx/cn工具函数：条件样式

动态组合class需要一个可靠的工具函数。\`clsx\`+ \`tailwind-merge\`是最佳实践：

\`\`\`bash
npm install clsx tailwind-merge
\`\`\`

\`\`\`tsx
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// cn函数：合并class，解决Tailwind类名冲突
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 使用示例
function Button({
  variant = 'primary',
  size = 'md',
  disabled,
  className, // 允许外部传入class覆盖
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        // 基础样式
        'rounded-lg font-medium transition-all inline-flex items-center justify-center',
        // 变体样式
        variant === 'primary' && 'bg-primary-500 text-white hover:bg-primary-600',
        variant === 'outline' && 'border border-primary-500 text-primary-500 hover:bg-primary-50',
        variant === 'ghost' && 'text-gray-700 hover:bg-gray-100',
        variant === 'danger' && 'bg-red-500 text-white hover:bg-red-600',
        // 尺寸
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-base',
        size === 'lg' && 'px-6 py-3 text-lg',
        // 状态
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        // 外部传入的className（最后，可覆盖前面）
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

// 使用
function Demo() {
  const [active, setActive] = useState(false)

  return (
    <div>
      <Button
        variant={active ? 'primary' : 'outline'}
        size="md"
        onClick={() => setActive(!active)}
        className="w-full mt-4"
      >
        {active ? '已激活' : '点击激活'}
      </Button>
    </div>
  )
}
\`\`\`

**tailwind-merge的作用**：Tailwind中后写的类应该覆盖前面的，但clsx只是简单合并，twMerge智能解决冲突（如同时有\`px-3\`和\`px-6\`，后者覆盖前者）。

## 四、class-variance-authority(cva)组件变体系统

cva（class-variance-authority）让你用声明式方式创建组件变体系统，和Tailwind完美配合：

\`\`\`bash
npm install class-variance-authority
\`\`\`

\`\`\`tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

// 定义Button变体
const buttonVariants = cva(
  // 基础样式（所有变体共有）
  'inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        outline: 'border border-primary-500 text-primary-500 hover:bg-primary-50',
        ghost: 'text-gray-700 hover:bg-gray-100',
        danger: 'bg-red-500 text-white hover:bg-red-600',
        link: 'text-primary-500 underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-10 w-10', // 图标按钮
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

// TypeScript自动推导变体props类型
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }

// 使用示例
function ButtonDemo() {
  return (
    <div className="flex flex-wrap gap-4 p-8">
      <Button variant="primary" size="sm">小按钮</Button>
      <Button variant="outline" size="md">中按钮</Button>
      <Button variant="danger" size="lg">大按钮</Button>
      <Button variant="ghost" size="icon">🔔</Button>
      <Button disabled>禁用状态</Button>
    </div>
  )
}
\`\`\`

## 五、深色模式

\`\`\`tsx
// tailwind.config.js中配置
// darkMode: 'class'

// ThemeProvider组件（简化版）
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'system'
    }
    return 'system'
  })

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.add(systemDark ? 'dark' : 'light')
    } else {
      root.classList.add(theme)
    }

    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}

// 深色模式组件示例
function ThemedCard() {
  return (
    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <h2 className="text-xl font-bold mb-2">深色模式卡片</h2>
      <p className="text-gray-600 dark:text-gray-400">
        自动根据主题切换颜色
      </p>
    </div>
  )
}

// 主题切换按钮
function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
\`\`\`

## 六、封装Card/Input组件（shadcn/ui模式简介）

shadcn/ui不是组件库，而是可复制到项目的组件代码集合，基于Tailwind + cva + Radix UI：

\`\`\`tsx
// Card组件
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border bg-card text-card-foreground shadow',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('font-semibold leading-none tracking-tight', className)} {...props} />
  )
)
CardTitle.displayName = 'CardTitle'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

// Input组件
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export { Card, CardHeader, CardTitle, CardContent, Input }
\`\`\`

## 小结

- Tailwind配置content路径确保所有类名被扫描
- 移动优先的响应式断点：sm/md/lg/xl/2xl
- clsx+tailwind-merge封装cn工具函数处理条件类名和冲突
- cva优雅地创建组件变体系统
- darkMode:'class'+data-theme实现深色模式，localStorage持久化
- theme.extend自定义颜色、间距、字体、动画
- forwardRef+cva+cn封装可复用UI组件
- shadcn/ui是基于Tailwind的优秀组件模式参考
- 学习初期查文档，常用类名自然会记住
`,
  },
  {
    id: "tsrx-framer-motion",
    group: "样式篇",
    icon: "✨",
    title: "Framer Motion动画入门",
    content: `
# Framer Motion动画入门

Framer Motion是React生态最流行的动画库之一，API声明式、简单直观，支持进入/退出动画、手势、布局动画、拖拽等复杂交互效果，让React动画开发变得轻松愉悦。

## 一、安装与基础概念

\`\`\`bash
npm install framer-motion
\`\`\`

Framer Motion的核心API是\`motion\`组件和\`animate\`属性：

\`\`\`tsx
import { motion } from 'framer-motion'

function BasicAnimation() {
  return (
    <div className="p-8">
      {/* motion.* 是支持动画的HTML/SVG元素 */}
      <motion.div
        // initial：初始状态（挂载时）
        initial={{ opacity: 0, x: -100, scale: 0.5 }}
        // animate：目标状态（动画到这里）
        animate={{ opacity: 1, x: 0, scale: 1 }}
        // transition：动画参数（时长、缓动、延迟等）
        transition={{
          duration: 0.5,
          // type: 'spring'是弹簧物理动画，'tween'是时间动画
          type: 'spring',
          bounce: 0.3, // 弹性
          stiffness: 100, // 刚度
          damping: 15, // 阻尼
          delay: 0.2, // 延迟开始
          ease: 'easeOut', // 缓动函数
        }}
        className="w-32 h-32 bg-blue-500 rounded-xl"
      >
        Hello Motion
      </motion.div>
    </div>
  )
}
\`\`\`

**transition常用配置**：

| 参数 | 说明 | 示例 |
|------|------|------|
| duration | 动画时长（秒） | 0.5 |
| delay | 延迟开始 | 0.2 |
| type | 动画类型 | 'spring' \| 'tween' \| 'inertia' |
| ease | 缓动函数 | 'easeInOut' \| [0.42, 0, 0.58, 1] |
| bounce | 弹簧弹性 | 0-1，默认0.25 |
| stiffness | 弹簧刚度 | 默认100 |
| damping | 阻尼（越高越快停下） | 默认10 |
| repeat | 重复次数 | Infinity无限重复 |
| repeatType | 重复方式 | 'loop' \| 'reverse' \| 'mirror' |

## 二、基础动画示例

\`\`\`tsx
import { motion, useAnimation } from 'framer-motion'
import { useState } from 'react'

function AnimationExamples() {
  const [isToggled, setIsToggled] = useState(false)
  const controls = useAnimation() // 程序化控制动画

  const pulseSequence = async () => {
    // 可以链式调用动画
    await controls.start({ scale: 1.2, transition: { duration: 0.2 } })
    await controls.start({ scale: 1, transition: { duration: 0.2 } })
  }

  return (
    <div className="p-8 space-y-8">
      {/* 1. 悬停+点击手势 */}
      <motion.button
        whileHover={{ scale: 1.05, backgroundColor: '#2563eb' }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg"
        onClick={pulseSequence}
      >
        悬停放大，点击缩小
      </motion.button>

      {/* 2. 状态切换动画 */}
      <motion.div
        animate={{
          backgroundColor: isToggled ? '#10b981' : '#ef4444',
          borderRadius: isToggled ? '50%' : '12px',
          rotate: isToggled ? 360 : 0,
        }}
        transition={{ duration: 0.5 }}
        onClick={() => setIsToggled(!isToggled)}
        className="w-24 h-24 cursor-pointer flex items-center justify-center text-white"
      >
        {isToggled ? 'ON' : 'OFF'}
      </motion.div>

      {/* 3. 循环动画（加载指示器） */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
      />

      {/* 4. useAnimation程序化控制 */}
      <motion.div
        animate={controls}
        className="w-20 h-20 bg-purple-500 rounded-lg"
        initial={{ scale: 1 }}
      />

      {/* 5. 列表交错动画 */}
      <motion.ul>
        {[1, 2, 3].map((item, i) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }} // 每个延迟0.1s
            className="p-3 bg-gray-100 mb-2 rounded"
          >
            列表项 {item}
          </motion.li>
        ))}
      </motion.ul>
    </div>
  )
}
\`\`\`

## 三、AnimatePresence：进出场动画

条件渲染的元素（如弹窗、Toast、路由页面）需要进入和退出动画，这是CSS很难实现的，Framer Motion用\`AnimatePresence\`轻松解决：

\`\`\`tsx
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

// 弹窗/模态框进出场
function Modal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>打开弹窗</button>

      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            {/* 背景遮罩淡入淡出 */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* 弹窗从下方滑入 */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white p-8 rounded-2xl shadow-2xl w-96"
            >
              <h2 className="text-xl font-bold mb-4">弹窗标题</h2>
              <p className="text-gray-600 mb-6">这是弹窗内容，有平滑的进出场动画</p>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-blue-500 text-white rounded-lg"
              >
                关闭
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Toast通知
function ToastDemo() {
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([])

  const addToast = () => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, text: '这是一条通知消息' }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  return (
    <div>
      <button onClick={addToast}>显示Toast</button>

      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 200 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 200 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg"
            >
              {toast.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
\`\`\`

**AnimatePresence的mode选项**：
- \`'sync'\`（默认）：新旧元素同时动画
- \`'wait'\`：等旧元素退出后再进入新元素
- \`'popLayout'\`：元素退出时自动调整布局

**重要**：AnimatePresence里的元素必须有唯一的\`key\`prop，否则无法追踪进出。

## 四、手势交互：拖拽

Framer Motion的拖拽功能非常强大，支持约束、弹性、手势事件：

\`\`\`tsx
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useState } from 'react'

function DragDemo() {
  // 用motionValue追踪手势值变化
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  // 根据x值派生其他属性
  const rotate = useTransform(x, [-200, 200], [-30, 30])
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5])

  return (
    <div className="h-64 flex items-center justify-center bg-gray-100 rounded-xl relative overflow-hidden">
      <motion.div
        drag
        // 拖拽约束：只能在父元素内，或指定边界
        dragConstraints={{ left: -150, right: 150, top: -100, bottom: 100 }}
        // 弹性：松开后弹回约束边界
        dragElastic={0.1}
        // 拖拽方向：'x' | 'y' | true（xy都可以）
        dragDirectionLock={false}
        dragMomentum={true}
        onDragEnd={(event, info) => {
          console.log('拖拽结束位置:', info.point)
        }}
        style={{ x, rotate, opacity }}
        whileTap={{ cursor: 'grabbing', scale: 1.1 }}
        className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl cursor-grab flex items-center justify-center text-white font-bold shadow-lg"
      >
        拖我
      </motion.div>
    </div>
  )
}

// 滑动删除（Swipe to delete）
function SwipeToDelete({ item, onDelete }: { item: { id: number; text: string }; onDelete: () => void }) {
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.5, right: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.x < -150) {
          // 左滑超过150px触发删除
          onDelete()
        }
      }}
      whileDrag={{ scale: 1.02 }}
      className="bg-white p-4 border-b flex items-center justify-between"
    >
      <span>{item.text}</span>
      <span className="text-red-500 text-sm">← 左滑删除</span>
    </motion.div>
  )
}
\`\`\`

## 五、variants：预定义动画对象

variants让你可以预定义动画状态、组织动画层级，父组件可以控制子组件的动画（staggerChildren列表交错）：

\`\`\`tsx
import { motion } from 'framer-motion'

// 预定义variants对象
const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      // 子元素动画错开
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  hover: {
    scale: 1.03,
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
}

function StaggeredCardList() {
  const items = [
    { id: 1, title: '第一项', desc: '描述内容1' },
    { id: 2, title: '第二项', desc: '描述内容2' },
    { id: 3, title: '第三项', desc: '描述内容3' },
  ]

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible" // 进入视口时触发
      viewport={{ once: true, margin: '-100px' }}
      className="grid gap-4 p-8"
    >
      {items.map(item => (
        <motion.div
          key={item.id}
          variants={itemVariants} // 子组件继承父组件的动画控制
          whileHover="hover"
          className="bg-white p-6 rounded-xl shadow-sm border"
        >
          <h3 className="font-bold text-lg">{item.title}</h3>
          <p className="text-gray-500">{item.desc}</p>
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            查看详情
          </motion.button>
        </motion.div>
      ))}
    </motion.div>
  )
}
\`\`\`

**whileInView**：当元素滚动进入视口时触发动画，非常适合长页面动画。\`viewport.once: true\`表示只触发一次。

## 六、layoutId共享布局动画（FLIP）

layoutId可以实现不同组件之间的平滑位置过渡（FLIP动画），典型场景是点击卡片放大到详情页：

\`\`\`tsx
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface Photo {
  id: number
  title: string
  color: string
}

function PhotoGallery() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const photos: Photo[] = [
    { id: 1, title: '风景照片', color: '#3b82f6' },
    { id: 2, title: '城市夜景', color: '#8b5cf6' },
    { id: 3, title: '自然风光', color: '#10b981' },
    { id: 4, title: '人像摄影', color: '#f59e0b' },
  ]
  const selectedPhoto = photos.find(p => p.id === selectedId)

  return (
    <div className="p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map(photo => (
          <motion.div
            key={photo.id}
            layoutId={\`photo-\${photo.id}\`} // layoutId必须全局唯一
            onClick={() => setSelectedId(photo.id)}
            className="aspect-square rounded-xl cursor-pointer relative overflow-hidden shadow-md"
            style={{ backgroundColor: photo.color }}
            whileHover={{ scale: 1.03 }}
          >
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 text-white">
              {photo.title}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedPhoto && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="fixed inset-0 bg-black/60 z-50"
            />
            <motion.div
              layoutId={\`photo-\${selectedPhoto.id}\`} // 相同layoutId自动平滑过渡！
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-lg aspect-video rounded-2xl overflow-hidden shadow-2xl"
              style={{ backgroundColor: selectedPhoto.color }}
            >
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 text-white">
                <h2 className="text-2xl font-bold">{selectedPhoto.title}</h2>
                <p className="mt-2">点击任意位置关闭，动画会自动"飞回"原来的卡片位置</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
\`\`\`

这个FLIP（First-Last-Invert-Play）动画是Framer Motion的"魔法"特性，只需要两个元素共享同一个\`layoutId\`，Framer Motion自动计算位置差并创建平滑过渡！

## 七、Todo列表完整动画Demo

\`\`\`tsx
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface Todo {
  id: number
  text: string
  completed: boolean
}

function AnimatedTodoList() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: '学习Framer Motion基础', completed: true },
    { id: 2, text: '实现AnimatePresence进出场', completed: true },
    { id: 3, text: '做一个完整Todo动画Demo', completed: false },
  ])
  const [inputText, setInputText] = useState('')

  const addTodo = () => {
    if (inputText.trim()) {
      setTodos(prev => [...prev, {
        id: Date.now(),
        text: inputText.trim(),
        completed: false,
      }])
      setInputText('')
    }
  }

  const toggleTodo = (id: number) => {
    setTodos(prev => prev.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ))
  }

  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">动画Todo列表</h1>

      <div className="flex gap-2 mb-6">
        <input
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
          placeholder="添加新任务..."
          className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={addTodo}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium"
        >
          添加
        </motion.button>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {todos.map(todo => (
            <motion.div
              key={todo.id}
              layout // 自动布局动画（添加/删除时其他项平滑移动）
              initial={{ opacity: 0, x: -50, height: 0 }}
              animate={{
                opacity: 1,
                x: 0,
                height: 'auto',
                backgroundColor: todo.completed ? '#f3f4f6' : '#ffffff',
              }}
              exit={{ opacity: 0, x: 100, height: 0 }}
              transition={{
                opacity: { duration: 0.2 },
                layout: { type: 'spring', damping: 25, stiffness: 300 },
              }}
              className="flex items-center gap-3 p-4 rounded-xl border overflow-hidden"
            >
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => toggleTodo(todo.id)}
                className={\`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 \${
                  todo.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }\`}
              >
                {todo.completed && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </motion.svg>
                )}
              </motion.button>

              <motion.span
                animate={{
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? '#9ca3af' : '#1f2937',
                }}
                className="flex-1"
              >
                {todo.text}
              </motion.span>

              <motion.button
                whileHover={{ scale: 1.1, color: '#ef4444' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => deleteTodo(todo.id)}
                className="text-gray-400 p-1"
              >
                ✕
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {todos.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-400 py-12"
        >
          暂无任务，添加一个吧！
        </motion.div>
      )}
    </div>
  )
}
\`\`\`

## 八、路由/页面切换过渡

\`\`\`tsx
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, Routes, Route } from 'react-router-dom'

// 页面切换动画
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname} // key变化触发进出场
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        className="min-h-screen"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/posts" element={<Posts />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}
\`\`\`

## 小结

- Framer Motion是React最流行的动画库，API声明式且直观
- motion.*组件扩展了HTML元素的动画能力
- initial/animate/exit定义三阶段动画（进入/动画/退出）
- transition控制动画类型、时长、弹性参数
- AnimatePresence实现条件渲染元素的进出场
- whileHover/whileTap/whileFocus手势交互
- drag支持拖拽，constraints限制边界
- variants预定义动画对象，支持staggerChildren列表交错
- whileInView滚动进入视口时触发动画
- useAnimation程序化控制动画序列
- layoutId实现共享布局FLIP动画（神奇的组件过渡）
- layout prop自动处理布局变化动画
- 动画提升用户体验，但不要过度使用，保持简洁
`,
  },
];

