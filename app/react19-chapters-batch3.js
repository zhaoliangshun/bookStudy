// =============================================================
// React 19 新特性交互式教程 —— 第三批章节（服务端与迁移组，共 5 章）
// -------------------------------------------------------------
// 覆盖 React 19 服务端与迁移核心特性：Server Components 基础、
// Server Actions 实战、prerender 静态渲染 API、JSX 变换与类型改进、
// React 19 迁移指南。
// 所有 code 字段为可在 Node 沙箱运行的纯 JS（不依赖 react），
// 用 console.log 模拟演示底层原理。
// =============================================================

export const chapters = [
  {
    id: "react19-server-components",
    title: "Server Components 基础",
    icon: "🖥️",
    group: "服务端与迁移",
    content: `## 一、React Server Components 是什么

React Server Components（RSC）是 React 19 中最核心的架构革新。传统 React 应用的所有组件都在浏览器中运行——JS 代码下载到客户端，然后在用户的设备上执行渲染。Server Components 改变了这个范式：**组件可以在服务端渲染，只把渲染结果（而非组件代码）发送给客户端**。

用一个简单类比来理解：传统 SSR（Server-Side Rendering）是在服务端把组件渲染成 HTML 字符串，发送给浏览器，然后浏览器再下载 JS 并执行一次客户端渲染（hydration）让页面变可交互。RSC 更进一步——**服务端组件不仅渲染 HTML，还能直接访问后端资源（数据库、文件系统），且组件代码永远不会发送到客户端**。

\`\`\`jsx
// ✅ 这是一个 Server Component（默认就是）
// 可以直接访问数据库，无需 API 路由
async function ProductList() {
  const products = await db.query("SELECT * FROM products");
  return (
    <ul>
      {products.map(p => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
\`\`\`

上面的代码中，\`db.query\` 直接在服务端运行，数据库查询结果作为渲染输出的一部分序列化后发送给客户端。客户端永远不会收到数据库连接字符串、查询逻辑或任何敏感信息。这就是 RSC 的核心价值：**零客户端 JS 体积 + 直接后端访问**。

## 二、'use server' 和 'use client' 指令

React 19 引入了两个关键的文件级指令来区分组件的运行环境：

### 'use client' 指令

在文件顶部添加 \`'use client'\` 标记该文件及其所有导入为客户端组件：

\`\`\`jsx
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      点击次数: {count}
    </button>
  );
}
\`\`\`

客户端组件可以：
- 使用 \`useState\`、\`useEffect\` 等所有 React Hooks
- 绑定事件处理函数（\`onClick\`、\`onChange\` 等）
- 使用浏览器 API（\`localStorage\`、\`window\` 等）
- 使用 React Context

### 'use server' 指令

\`'use server'\` 用于标记 Server Action（在 "Server Actions 实战" 章详述），而 Server Component 是默认的——不需要任何指令。

重要规则：**Server Component 可以导入 Client Component，但 Client Component 不能导入 Server Component**。这是 RSC 架构的核心约束。如果 Client Component 需要渲染 Server Component 的内容，必须通过 \`children\` prop 或组件组合的方式传递。

\`\`\`jsx
// ServerComponent.jsx —— 默认就是 Server Component，无需指令
async function ServerComponent() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// ClientComponent.jsx —— 必须标记 'use client'
'use client';
import { useState } from 'react';

export function ClientComponent({ children }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <button onClick={() => setVisible(!visible)}>切换</button>
      {visible && children}  {/* 通过 children 接收 Server Component */}
    </div>
  );
}

// Page.jsx —— 在 Server Component 中组合
function Page() {
  return (
    <ClientComponent>
      <ServerComponent />  {/* 合法：作为 children 传递 */}
    </ClientComponent>
  );
}
\`\`\`

## 三、RSC 渲染流程

RSC 的渲染流程分为三个关键阶段：

### 阶段一：服务端渲染（Server Render）

服务端接收到请求后，React 在服务端（Node.js 环境）构建组件树。对于 Server Component，直接执行组件函数并收集渲染结果。对于 Client Component，React 在服务端**不执行**其代码，而是渲染一个"占位符"（placeholder），标记该位置需要客户端组件来填充。

### 阶段二：序列化（Serialization）

React 将渲染结果序列化为一种特殊的 RSC Payload 格式。这个格式不是普通的 HTML，而是一种包含组件树结构的二进制流。它包含：

1. **渲染输出**：Server Component 渲染出的静态内容（HTML 片段）
2. **客户端引用**：Client Component 的模块引用路径（但不包含实际代码）
3. **Props 数据**：传递给 Client Component 的 props（已序列化）
4. **Suspense 边界**：标记哪些位置需要流式加载

### 阶段三：客户端水合（Hydration）

客户端收到 RSC Payload 后：
1. 解析并渲染静态内容
2. 对于 Client Component 引用，下载对应的 JS 模块并执行
3. 将 Server Component 的输出与 Client Component 的状态合并
4. 建立事件绑定、Effect 订阅等交互能力

\`\`\`jsx
// 概念性流程示意
// 服务端输出 → 客户端接收 → 合并渲染
// 
// 服务端:
// <ServerComponent> → 渲染为 HTML 片段 → 序列化
// <ClientComponent> → 仅记录模块引用 + props → 序列化
//
// 客户端:
// HTML 片段 → 直接渲染
// 模块引用 → 下载 JS → 执行 → 水合
\`\`\`

## 四、RSC 的限制

Server Component 有一系列明确的限制，这些限制源于它们运行在服务端的事实：

1. **不能使用 Hooks**：\`useState\`、\`useEffect\`、\`useContext\` 等全部不可用（Hooks 依赖客户端运行时状态）
2. **不能绑定事件处理**：\`onClick\`、\`onChange\` 等交互事件在服务端毫无意义
3. **不能使用浏览器 API**：\`window\`、\`document\`、\`localStorage\` 等不可用
4. **不能使用 React Context**：\`createContext\` / \`useContext\` 不可用（但可以通过 props 传递数据）
5. **不能使用 \`useRef\`**：ref 本质上是一个客户端可变引用
6. **Props 必须可序列化**：传递给 Server Component 的 props 不能包含函数、Symbol、类实例等不可序列化的值

但 Server Component 可以：
- 直接访问数据库和文件系统
- 使用 \`async/await\`（本身就是 async 函数）
- 导入和使用 Client Component（通过组件组合）
- 读取环境变量、密钥等敏感信息（永远不会暴露到客户端）

## 五、与 Next.js App Router 配合

Next.js 13+ 的 App Router 是 RSC 的主要实践平台。在 App Router 中：

- **默认所有组件都是 Server Component**——不需要任何指令
- \`page.js\`、\`layout.js\`、\`loading.js\`、\`error.js\` 默认都是 Server Component
- 只有当你需要交互性时，才在文件顶部加 \`'use client'\`

\`\`\`jsx
// app/products/page.js —— 这是 Server Component（默认）
async function ProductsPage() {
  // 直接在组件中查询数据库，无需 API 路由
  const products = await db.product.findMany();
  return (
    <div>
      <h1>产品列表</h1>
      <ProductGrid products={products}>
        {/* AddToCartButton 是客户端组件，需要交互 */}
        <AddToCartButton />
      </ProductGrid>
    </div>
  );
}

// app/products/add-to-cart.jsx —— 必须标记 'use client'
'use client';
import { useState } from 'react';

export function AddToCartButton() {
  const [loading, setLoading] = useState(false);
  return (
    <button onClick={() => setLoading(true)} disabled={loading}>
      {loading ? '添加中...' : '加入购物车'}
    </button>
  );
}
\`\`\`

### 最佳实践

1. **把交互性向下推**：尽可能把 'use client' 边界放在组件树的叶子节点，让大部分组件保持为 Server Component
2. **数据获取在 Server Component 中完成**：在 Server Component 中 fetch 数据，通过 props 传给 Client Component
3. **用 children 传递 Server Component**：如果 Client Component 需要包裹 Server Component，使用 children prop 模式

---

## 底层原理

RSC 的底层实现依赖 React 的新 Reconciler 架构。服务端 Reconciler 基于 React Flight 协议，核心流程如下：

1. **组件树构建**：服务端从根组件开始，递归执行组件函数。遇到 Server Component 时直接执行；遇到 Client Component 时，不执行函数体，而是创建一个特殊的工作单元标记为 "client reference"。

2. **Flight 序列化**：React Flight 协议将渲染树序列化为一种分块的行格式（chunked row format）。每一行可以是：
   - \`M\` 行（Module Reference）：标记客户端模块引用，如 \`M1:{"id":"./Counter.js","name":"Counter"}\`
   - \`J\` 行（JSON Props）：序列化后的 props 数据
   - \`S\` 行（Suspense）：标记 Suspense 边界，支持流式输出
   - \`E\` 行（Error）：标记错误边界

3. **流式传输**：RSC Payload 通过 HTTP 流式传输到客户端。这意味着大型组件树可以分块到达，客户端可以逐步渲染，无需等待整个响应完成。

4. **客户端重构**：客户端 React 运行时接收 RSC Payload 流，解析每一行，重建 React 元素树。对于模块引用，客户端从打包好的模块映射表中查找对应的组件实现，然后正常渲染。

5. **双树合并**：最终在客户端形成一棵完整的 React 元素树，其中 Server Component 的渲染结果是不可变的静态内容，Client Component 则是可交互的常规 React 组件。

## 常见陷阱

- **不小心在 Server Component 中用了 Hooks**：这是最常见的错误。Server Component 中调用 \`useState\` 会直接报错。记住：默认就是 Server Component，需要交互才加 \`'use client'\`。
- **在 Client Component 中直接导入 Server Component**：这会导致构建错误或 Server Component 被降级为 Client Component。要用 children 或组件组合模式传递。
- **把敏感数据作为 props 传给 Client Component**：Server Component 中获取的敏感数据（如密码、token）如果通过 props 传给 Client Component，会暴露在客户端 JS 中。只传客户端需要的数据。
- **误解 RSC 为 SSR 替代品**：RSC 和 SSR 是互补的。RSC 决定组件在哪里运行，SSR 决定初始渲染在哪里进行。两者可以同时使用。
- **在 Server Component 中大量使用 \`useEffect\` 模式**：Server Component 中不需要数据获取的状态管理。直接 await 即可，不需要 loading/error/data 三重状态。

## 性能提示

- **减少客户端 JS 体积**：将纯展示逻辑（格式化、排序、过滤）放在 Server Component 中，这些代码不会打包到客户端，直接减少 bundle 大小。
- **合理划分组件边界**：不要为了"全 Server Component"而把交互逻辑用奇怪的方式绕过。交互性涉及的地方加 \`'use client'\`，其余保持 Server Component 即可。
- **利用流式渲染**：RSC 的流式传输允许用户在数据完全就绪前就看到页面。对慢查询使用 Suspense 包裹，让快内容先渲染。
- **避免在 Server Component 中做过多的客户端特定计算**：比如日期格式化（依赖用户的时区），应该在客户端组件中处理，避免服务端渲染出错误的时区。
`,
    code: `// 用纯 JS 模拟 RSC 渲染流程：服务端渲染组件树 → 序列化为 JSON → 客户端反序列化水合
// 演示重点：服务端组件 vs 客户端组件的区别、序列化格式、客户端重组过程

// ========== 阶段一：定义组件树 ==========

// 模拟一个"数据库"（服务端才有的资源）
const mockDB = {
  products: [
    { id: 1, name: "React 19 实战", price: 99 },
    { id: 2, name: "TypeScript 高级编程", price: 128 },
    { id: 3, name: "Next.js 全栈开发", price: 149 },
  ],
};

// 服务端组件 —— 可以直接访问数据库，返回渲染结果
// 在真实 RSC 中，这些是 async 函数，结果直接序列化
const serverComponents = {
  ProductList: async function (props) {
    // 模拟数据库查询
    const products = await Promise.resolve(mockDB.products);
    return {
      type: "SERVER_COMPONENT",
      name: "ProductList",
      rendered: products.map(p => \`<li key="\${p.id}">\${p.name} - ¥\${p.price}</li>\`).join(""),
      __serverOnly: true, // 标记为服务端专属
    };
  },

  PageHeader: function (props) {
    return {
      type: "SERVER_COMPONENT",
      name: "PageHeader",
      rendered: \`<header><h1>\${props.title || "产品中心"}</h1></header>\`,
      __serverOnly: true,
    };
  },

  Footer: function (props) {
    return {
      type: "SERVER_COMPONENT",
      name: "Footer",
      rendered: \`<footer><p>© 2026 技术书店</p></footer>\`,
      __serverOnly: true,
    };
  },
};

// 客户端组件 —— 需要交互，标记为 'use client'
// 在服务端渲染时，不执行函数体，只记录引用
const clientComponents = {
  SearchBar: {
    type: "CLIENT_COMPONENT",
    name: "SearchBar",
    modulePath: "./components/SearchBar.js",
    // 客户端组件在服务端不执行，只记录"占位符"信息
    renderOnServer: false,
  },
  AddToCartButton: {
    type: "CLIENT_COMPONENT", 
    name: "AddToCartButton",
    modulePath: "./components/AddToCartButton.js",
    renderOnServer: false,
    props: { productId: null },
  },
};

// ========== 阶段二：服务端渲染器 ==========
// 模拟 React 服务端 Reconciler 的行为

class RSCServerRenderer {
  constructor() {
    this.payload = [];
    this.chunkId = 0;
  }

  // 渲染一个组件树节点
  async renderComponent(component) {
    if (component.type === "SERVER_COMPONENT") {
      // 服务端组件：直接执行，收集渲染结果
      const result = component.name
        ? await serverComponents[component.name]?.(component.props || {})
        : { rendered: "" };
      
      this.chunkId++;
      this.payload.push({
        chunkId: this.chunkId,
        type: "M", // Module/Segment
        componentType: "SERVER",
        componentName: component.name,
        rendered: result.rendered || "",
        dependencies: result.dependencies || [],
      });
      
      return result;
    }
    
    if (component.type === "CLIENT_COMPONENT") {
      // 客户端组件：不执行，只记录模块引用和 props
      this.chunkId++;
      this.payload.push({
        chunkId: this.chunkId,
        type: "J", // JSON/Client Reference
        componentType: "CLIENT",
        componentName: component.name,
        modulePath: component.modulePath,
        props: component.props || {},
        // 关键：客户端组件的代码不会包含在 payload 中
        // 客户端需要从打包好的模块映射表中查找
      });
      
      return {
        type: "CLIENT_PLACEHOLDER",
        name: component.name,
        modulePath: component.modulePath,
      };
    }
    
    return null;
  }

  getPayload() {
    return this.payload;
  }
}

// ========== 阶段三：模拟整个页面渲染 ==========

async function renderPage() {
  console.log("═".repeat(50));
  console.log("🖥️  阶段一：服务端渲染 (Server Render)");
  console.log("═".repeat(50));

  const renderer = new RSCServerRenderer();

  // 定义页面组件树
  // 这棵树混合了 Server Component 和 Client Component
  const pageTree = [
    { type: "SERVER_COMPONENT", name: "PageHeader", props: { title: "产品中心" } },
    { type: "SERVER_COMPONENT", name: "ProductList" },
    { type: "CLIENT_COMPONENT", name: "SearchBar", modulePath: "./components/SearchBar.js" },
    { type: "CLIENT_COMPONENT", name: "AddToCartButton", modulePath: "./components/AddToCartButton.js", props: { productId: 1 } },
    { type: "SERVER_COMPONENT", name: "Footer" },
  ];

  console.log("\\n📋 页面组件树：");
  for (const component of pageTree) {
    const tag = component.type === "SERVER_COMPONENT" ? "🖥️ Server" : "📱 Client";
    console.log(\`  \${tag}: \${component.name}\`);
  }

  // 逐个渲染组件
  console.log("\\n⚙️  开始渲染...");
  for (const component of pageTree) {
    if (component.type === "SERVER_COMPONENT") {
      console.log(\`  ✓ 渲染 Server Component: \${component.name}\`);
    } else {
      console.log(\`  → 跳过 Client Component: \${component.name} (仅记录引用)\`);
    }
    await renderer.renderComponent(component);
  }

  // ========== 阶段四：序列化 ==========
  console.log("\\n" + "═".repeat(50));
  console.log("📦 阶段二：序列化 (Serialization)");
  console.log("═".repeat(50));
  
  const payload = renderer.getPayload();
  console.log("\\n📤 RSC Payload（序列化后的内容）：");
  console.log(JSON.stringify(payload, null, 2));

  // 分析 payload 大小
  console.log("\\n📊 Payload 分析：");
  const serverChunks = payload.filter(c => c.componentType === "SERVER");
  const clientChunks = payload.filter(c => c.componentType === "CLIENT");
  console.log(\`  服务端组件块: \${serverChunks.length} 个（包含实际渲染内容）\`);
  console.log(\`  客户端组件块: \${clientChunks.length} 个（仅引用，不包含代码）\`);

  // 模拟网络传输大小
  const payloadStr = JSON.stringify(payload);
  console.log(\`  Payload 总大小: \${payloadStr.length} bytes\`);
  console.log("  ℹ️  客户端组件代码不在 payload 中，需单独下载");

  return payload;
}

// ========== 阶段五：客户端重组 ==========

function hydrateOnClient(payload) {
  console.log("\\n" + "═".repeat(50));
  console.log("💧 阶段三：客户端水合 (Hydration)");
  console.log("═".repeat(50));

  console.log("\\n🔍 解析 RSC Payload...");

  const htmlParts = [];
  const clientModules = [];

  for (const chunk of payload) {
    if (chunk.componentType === "SERVER") {
      // 服务端组件：直接使用渲染好的 HTML
      console.log(\`  ✓ 直接渲染: \${chunk.componentName}\`);
      console.log(\`    HTML: \${chunk.rendered}\`);
      htmlParts.push(chunk.rendered);
    } else if (chunk.componentType === "CLIENT") {
      // 客户端组件：需要下载 JS 模块后水合
      console.log(\`  → 需水合: \${chunk.componentName}\`);
      console.log(\`    模块路径: \${chunk.modulePath}\`);
      clientModules.push(chunk);
    }
  }

  // 模拟下载客户端模块
  console.log("\\n📥 下载客户端模块...");
  for (const mod of clientModules) {
    console.log(\`  ✓ 已下载: \${mod.modulePath} (假设已打包在客户端 bundle 中)\`);
    // 在实际场景中，modulePath 会映射到 webpack/turbopack 的 chunk
    console.log(\`  ✓ 水合完成: \${mod.componentName} (事件绑定、状态初始化)\`);
  }

  // 最终页面
  console.log("\\n" + "═".repeat(50));
  console.log("✅ 最终页面 HTML（简化）：");
  console.log("═".repeat(50));
  console.log("<div id=\\"root\\">");
  for (const part of htmlParts) {
    console.log("  " + part);
  }
  for (const mod of clientModules) {
    console.log(\`  <div data-component="\${mod.componentName}" data-module="\${mod.modulePath}"></div>\`);
  }
  console.log("</div>");

  console.log("\\nℹ️  客户端组件占位符已渲染，交互逻辑由客户端 JS 接管");
}

// ========== 执行完整流程 ==========

async function main() {
  console.log("🚀 React Server Components 渲染流程模拟\\n");
  console.log("核心概念：");
  console.log("  • Server Component: 在服务端渲染，代码不入客户端");
  console.log("  • Client Component: 服务端仅记录引用，客户端下载后水合");
  console.log("  • RSC Payload: 混合序列化格式，包含 HTML + 模块引用\\n");

  const payload = await renderPage();
  hydrateOnClient(payload);

  console.log("\\n" + "═".repeat(50));
  console.log("📚 总结");
  console.log("═".repeat(50));
  console.log("1. Server Component 代码永远不会发送到客户端");
  console.log("2. 数据库查询、文件读取等操作只在服务端发生");
  console.log("3. Client Component 的 JS 代码仍需下载，但按需加载");
  console.log("4. RSC Payload 是一种流式序列化格式，支持渐进式渲染");
  console.log("5. 最终页面 = 服务端渲染的静态内容 + 客户端水合的可交互组件");
}

main().catch(console.error);
`,
  },

  {
    id: "react19-server-actions",
    title: "Server Actions 实战",
    icon: "⚡",
    group: "服务端与迁移",
    content: `## 一、Server Actions 是什么

Server Actions 是 React 19 引入的一种全新模式，允许你**直接在 React 组件中定义一个在服务端执行的异步函数**，然后在客户端直接调用它——无需手动创建 API 路由、无需 fetch 封装、无需处理请求/响应。

在传统架构中，从前端触发一个后端操作需要：定义 API 路由 → 客户端 fetch → 服务端处理 → 返回响应。Server Actions 把这个流程压缩为：在组件中定义一个 \`'use server'\` 函数，客户端直接调用它。

\`\`\`jsx
// app/actions.js —— 所有带 'use server' 的函数都是 Server Action
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export async function createPost(formData) {
  const title = formData.get('title');
  const content = formData.get('content');

  // 直接在服务端操作数据库
  await db.post.create({
    data: { title, content },
  });

  // 重新验证页面缓存
  revalidatePath('/posts');
}
\`\`\`

\`\`\`jsx
// app/post-form.jsx —— 客户端组件中直接调用 Server Action
'use client';

import { createPost } from './actions';

export function PostForm() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="标题" />
      <textarea name="content" placeholder="内容" />
      <button type="submit">发布</button>
    </form>
  );
}
\`\`\`

关键点：\`createPost\` 函数虽然在服务端运行，但你在客户端组件中直接 import 和调用它，就像调用普通函数一样。React 在编译时自动处理所有序列化、网络请求、错误处理。

## 二、'use server' 的两种用法

### 方式一：文件级指令

在文件顶部加 \`'use server'\`，该文件中所有导出的 async 函数都自动成为 Server Action：

\`\`\`jsx
'use server';

export async function action1() { /* ... */ }
export async function action2() { /* ... */ }
// action1 和 action2 都是 Server Action
\`\`\`

### 方式二：函数级指令

在函数体内加 \`'use server'\`，仅该函数成为 Server Action：

\`\`\`jsx
// 这个文件可以是客户端组件或服务端组件
async function myServerAction(data) {
  'use server';
  // 这个函数在服务端执行
  await db.update(data);
}
\`\`\`

函数级指令允许在同一个文件中混合客户端代码和 Server Action，但通常文件级指令更清晰。

## 三、客户端调用 Server Action

Server Action 可以通过多种方式在客户端触发：

### 1. 通过 form action（最常用）

\`\`\`jsx
'use client';
import { createPost } from '@/actions';

export function PostForm() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">提交</button>
    </form>
  );
}
\`\`\`

React 19 的 form action 支持渐进增强：即使 JS 还没加载完，表单也能提交（浏览器原生表单提交），加载完成后由 React 接管。

### 2. 通过 useActionState 管理状态

\`\`\`jsx
'use client';
import { useActionState } from 'react';
import { createPost } from '@/actions';

export function PostForm() {
  // useActionState 自动管理 pending 状态和返回值
  const [state, formAction, isPending] = useActionState(createPost, null);

  return (
    <form action={formAction}>
      <input name="title" />
      <button type="submit" disabled={isPending}>
        {isPending ? '提交中...' : '提交'}
      </button>
      {state?.error && <p className="error">{state.error}</p>}
    </form>
  );
}
\`\`\`

### 3. 通过事件处理函数调用（React 19 新增）

\`\`\`jsx
'use client';
import { deletePost } from '@/actions';

export function DeleteButton({ postId }) {
  return (
    <button onClick={async () => {
      const result = await deletePost(postId);
      if (result.success) {
        // 刷新列表或显示提示
      }
    }}>
      删除
    </button>
  );
}
\`\`\`

### 4. 通过 useTransition 包裹

\`\`\`jsx
const [isPending, startTransition] = useTransition();

<button onClick={() => {
  startTransition(async () => {
    await deletePost(postId);
  });
}}>
  {isPending ? '删除中...' : '删除'}
</button>
\`\`\`

## 四、与传统 API 路由对比

| 维度 | 传统 API 路由 | Server Actions |
|------|-------------|----------------|
| 定义方式 | 单独创建 route.js 文件 | 在 action 函数中定义 |
| 参数序列化 | 手动 JSON.stringify/formData | 自动序列化 |
| 类型安全 | 需要手动维护客户端类型 | 自动类型推导（TypeScript） |
| 渐进增强 | 需额外处理 | form action 原生支持 |
| 错误处理 | try/catch + 状态码 | 直接 throw，自动序列化 |
| 乐观更新 | 手动实现 | useOptimistic 内置支持 |
| 请求去重 | 需要自行实现 | React 自动处理 |
| 缓存重验证 | 手动调用 revalidate | 在 action 中直接调用 |

## 五、安全考虑

Server Actions 虽然简化了前后端通信，但安全边界不能忽视：

### 参数校验

**永远不要信任客户端传来的数据**。Server Action 在服务端执行，但参数来自客户端：

\`\`\`jsx
'use server';
import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1),
});

export async function createPost(formData) {
  // 第一步：校验参数
  const parsed = createPostSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  });

  if (!parsed.success) {
    return { error: '参数校验失败' };
  }

  // 第二步：鉴权
  const session = await getSession();
  if (!session) {
    throw new Error('未登录');
  }

  // 第三步：执行业务逻辑
  await db.post.create({ data: parsed.data });
}
\`\`\`

### CSRF 防护

React 的 Server Actions 通过以下机制自动防护 CSRF：
- 每个 Server Action 调用都携带一个唯一的 Action ID
- 服务端验证请求来源（Origin/Referer 头检查）
- form action 提交时自动附加 CSRF token

### 闭包序列化注意

Server Action 中如果引用了外部变量（闭包），这些变量会被序列化并发送到服务端。注意不要意外暴露敏感信息：

\`\`\`jsx
// ❌ 危险：secretKey 会被序列化发送
const secretKey = process.env.API_SECRET;
async function dangerousAction() {
  'use server';
  // secretKey 作为闭包变量被序列化...
}

// ✅ 安全：在 server action 内部读取环境变量
async function safeAction() {
  'use server';
  const secretKey = process.env.API_SECRET; // 在服务端读取
}
\`\`\`

---

## 底层原理

Server Actions 的底层实现建立在一个精巧的编译时 + 运行时协作机制上：

1. **编译时转换**：当打包工具（Webpack/Turbopack）遇到 \`'use server'\` 标记的函数时，会为该函数生成一个唯一的 Action ID，并将该函数从客户端 bundle 中移除，替换为一个 RPC 存根（stub）。这个存根在调用时，不是执行原始函数，而是发起一个 POST 请求到特定的内部端点。

2. **Action ID 映射**：服务端维护一个 Action ID → 函数实现的映射表。每个 Action ID 对应一个具体的服务端函数。当请求到达时，通过 Action ID 查找并执行对应的函数。

3. **参数序列化**：React 使用一种特殊的序列化协议（基于 React Flight），支持序列化 FormData、普通对象、数组、字符串、数字等。不支持序列化的类型（如函数、Symbol、类实例）会报错。

4. **请求格式**：客户端通过 \`POST\` 请求将 Action ID 和序列化参数发送到服务端的一个内部端点（通常是 \`/_rsc\` 或类似路径）。请求头包含 \`Next-Action: <action-id>\` 用于标识。

5. **闭包序列化**：React Flight 协议支持"有限闭包序列化"——如果 Server Action 所在的文件是 Server Component，且引用了模块级变量，这些值会被序列化。但函数引用、非可序列化值会导致错误。

6. **响应处理**：服务端执行完成后，React 将返回值序列化并通过 RSC Payload 格式返回。客户端收到响应后，将返回值交给调用方。如果服务端抛出错误，错误信息同样被序列化并返回给客户端。

7. **请求去重和缓存**：React 自动对同一组件树中的重复 Server Action 调用进行去重，避免不必要的网络请求。

## 常见陷阱

- **把 Server Action 当作普通函数调用**：Server Action 本质上是一个 RPC 调用，每次调用都会发起网络请求。不要在一个循环中频繁调用它，应该批量处理。
- **忘记校验参数**：客户端传来的任何数据都可能被篡改。Server Action 必须在服务端做参数校验，不能信任客户端验证。
- **在 Server Action 中使用浏览器 API**：Server Action 在服务端运行，\`localStorage\`、\`window\` 等不可用。
- **闭包中意外序列化大量数据**：Server Action 的闭包变量会被序列化。如果闭包引用了一个大对象，整个对象都会被发送。
- **混淆 Server Action 和 API Route**：Server Action 适合表单提交、数据变更操作；API Route 更适合需要缓存控制、自定义响应头、Webhook 处理的场景。两者各有用处。
- **在 Server Action 中重定向后继续执行代码**：return 或 redirect 之后的代码不会执行，但要注意异步操作可能在重定向后仍然运行。

## 性能提示

- **合理使用 useOptimistic**：对于常见的增删改操作，使用 useOptimistic 实现乐观更新，让 UI 立即响应，避免等待服务端返回。
- **避免在 Server Action 中做重计算**：Server Action 会阻塞 HTTP 响应。对于耗时操作，考虑使用队列或后台任务。
- **利用 form action 的渐进增强**：form action 在 JS 未加载完成时也能提交（浏览器原生行为），这缩短了首次交互时间。
- **Server Action 结果缓存**：如果 Server Action 返回的数据用于展示（如搜索结果），考虑在 Server Action 中调用 React 的 \`cache()\` 函数进行请求级缓存。
`,
    code: `// 用纯 JS 模拟 Server Action 的调用流程
// 演示重点：客户端序列化参数 → POST 请求 → 服务端执行 → 返回结果

// ========== 阶段一：定义 Server Actions（服务端） ==========

// 服务端 Action 注册表 —— Action ID → 函数实现
const serverActionRegistry = new Map();

// 模拟 use server 编译指令：注册一个 Server Action
function defineServerAction(id, fn) {
  serverActionRegistry.set(id, fn);
  // 返回一个 action 描述符，客户端会拿到这个而不是实际函数
  return {
    __isServerAction: true,
    actionId: id,
    // 注意：函数体不包含在描述符中，客户端永远看不到实现
  };
}

// 模拟数据库
const mockDB = {
  posts: [
    { id: 1, title: "React 19 入门", content: "React 19 带来了...", createdAt: "2026-01-15" },
    { id: 2, title: "Server Actions 实践", content: "Server Actions 让...", createdAt: "2026-03-20" },
  ],
  nextId: 3,
};

// 定义几个 Server Actions
const createPost = defineServerAction("createPost", async function (params) {
  console.log("  [Server Action] createPost 开始执行");
  console.log(\`  [Server Action] 收到参数: \${JSON.stringify(params)}\`);

  // 参数校验
  if (!params.title || params.title.trim().length === 0) {
    return { success: false, error: "标题不能为空" };
  }
  if (params.title.length > 100) {
    return { success: false, error: "标题不能超过100个字符" };
  }

  // 模拟数据库操作
  const post = {
    id: mockDB.nextId++,
    title: params.title.trim(),
    content: params.content || "",
    createdAt: new Date().toISOString(),
  };
  mockDB.posts.push(post);

  console.log(\`  [Server Action] 文章已创建: id=\${post.id}\`);
  return { success: true, data: post };
});

const deletePost = defineServerAction("deletePost", async function (params) {
  console.log("  [Server Action] deletePost 开始执行");
  console.log(\`  [Server Action] 收到参数: \${JSON.stringify(params)}\`);

  if (!params.id) {
    return { success: false, error: "文章ID不能为空" };
  }

  const index = mockDB.posts.findIndex(p => p.id === params.id);
  if (index === -1) {
    return { success: false, error: \`文章 id=\${params.id} 不存在\` };
  }

  const deleted = mockDB.posts.splice(index, 1)[0];
  console.log(\`  [Server Action] 文章已删除: \${deleted.title}\`);
  return { success: true, data: deleted };
});

const getPosts = defineServerAction("getPosts", async function () {
  console.log("  [Server Action] getPosts 开始执行");
  return { success: true, data: [...mockDB.posts] };
});

// ========== 阶段二：客户端调用模拟 ==========

// 模拟客户端调用 Server Action —— 序列化参数，发起网络请求
async function callServerAction(action, params) {
  if (!action.__isServerAction) {
    throw new Error("不是有效的 Server Action");
  }

  console.log("\\n" + "─".repeat(40));
  console.log(\`📤 客户端调用: \${action.actionId}\`);
  console.log("─".repeat(40));

  // 步骤1：序列化参数
  console.log("1️⃣  序列化参数...");
  const serializedParams = JSON.stringify(params);
  console.log(\`   序列化结果: \${serializedParams}\`);
  console.log(\`   序列化大小: \${serializedParams.length} bytes\`);

  // 步骤2：模拟网络请求（POST 到服务端内部端点）
  console.log("2️⃣  发起 POST 请求...");
  console.log(\`   POST /_rsc  (模拟内部端点)\`);
  console.log(\`   Headers: { "Next-Action": "\${action.actionId}" }\`);
  console.log(\`   Body: \${serializedParams}\`);

  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 50));

  // 步骤3：服务端处理
  console.log("3️⃣  服务端接收请求...");
  const fn = serverActionRegistry.get(action.actionId);
  if (!fn) {
    return { success: false, error: \`Action "\${action.actionId}" 未找到\` };
  }

  // 步骤4：反序列化参数并执行
  const deserializedParams = JSON.parse(serializedParams);
  console.log(\`   反序列化参数: \${JSON.stringify(deserializedParams)}\`);
  const result = await fn(deserializedParams);

  // 步骤5：序列化返回值
  console.log("4️⃣  序列化返回值...");
  const serializedResult = JSON.stringify(result);
  console.log(\`   返回值大小: \${serializedResult.length} bytes\`);

  console.log("5️⃣  返回结果给客户端");
  console.log("─".repeat(40));

  return result;
}

// ========== 阶段三：模拟完整的客户端使用场景 ==========

async function main() {
  console.log("═".repeat(55));
  console.log("⚡ Server Actions 调用流程模拟");
  console.log("═".repeat(55));
  console.log("\\n核心概念：");
  console.log("  • 'use server' 函数在编译时被替换为 RPC 存根");
  console.log("  • 客户端调用时自动序列化参数，发起 POST 请求");
  console.log("  • 服务端通过 Action ID 查找并执行对应函数");
  console.log("  • 返回值被序列化后返回给客户端");
  console.log("\\n注册的 Server Actions：");
  for (const [id] of serverActionRegistry) {
    console.log(\`  • \${id}\`);
  }

  // 场景1：获取文章列表
  console.log("\\n" + "═".repeat(55));
  console.log("📋 场景1：获取文章列表");
  console.log("═".repeat(55));
  const listResult = await callServerAction(getPosts);
  console.log(\`\\n✅ 获取结果: \${JSON.stringify(listResult, null, 2)}\`);

  // 场景2：创建新文章
  console.log("\\n" + "═".repeat(55));
  console.log("✍️  场景2：创建新文章");
  console.log("═".repeat(55));
  const createResult = await callServerAction(createPost, {
    title: "React 19 Server Actions 详解",
    content: "这是一篇关于 Server Actions 的技术文章...",
  });
  console.log(\`\\n✅ 创建结果: \${JSON.stringify(createResult, null, 2)}\`);

  // 场景3：参数校验失败
  console.log("\\n" + "═".repeat(55));
  console.log("❌ 场景3：参数校验失败（标题为空）");
  console.log("═".repeat(55));
  const failResult = await callServerAction(createPost, {
    title: "",
    content: "内容",
  });
  console.log(\`\\n⚠️  校验结果: \${JSON.stringify(failResult, null, 2)}\`);

  // 场景4：删除文章
  console.log("\\n" + "═".repeat(55));
  console.log("🗑️  场景4：删除文章");
  console.log("═".repeat(55));
  const deleteResult = await callServerAction(deletePost, { id: 1 });
  console.log(\`\\n✅ 删除结果: \${JSON.stringify(deleteResult, null, 2)}\`);

  // 验证最终状态
  console.log("\\n" + "═".repeat(55));
  console.log("📊 最终状态：数据库中的文章");
  console.log("═".repeat(55));
  const finalList = await callServerAction(getPosts);
  console.log(\`\\n当前文章列表 (\${finalList.data.length} 篇):\`);
  finalList.data.forEach(post => {
    console.log(\`  [\${post.id}] \${post.title}\`);
  });

  // 总结
  console.log("\\n" + "═".repeat(55));
  console.log("📚 关键要点");
  console.log("═".repeat(55));
  console.log("1. Server Action 函数体永远不会发送到客户端");
  console.log("2. 客户端只持有 Action ID，通过 RPC 调用服务端");
  console.log("3. 参数和返回值自动序列化/反序列化");
  console.log("4. 服务端校验是必须的——永远不要信任客户端数据");
  console.log("5. 每次调用都是独立的 POST 请求（注意网络开销）");
  console.log("6. form action 支持渐进增强（JS 未加载时也能提交）");
}

main().catch(console.error);
`,
  },

  {
    id: "react19-prerender",
    title: "prerender 静态渲染 API",
    icon: "📜",
    group: "服务端与迁移",
    content: `## 一、prerender 是什么

React 19 引入了全新的 \`prerender\` 和 \`prerenderToNodeStream\` API，用于在构建时或服务端**预渲染 React 组件树为静态 HTML**。与旧的 \`renderToString\` 不同，\`prerender\` 原生支持 Suspense 和流式输出，是 React 向静态生成（Static Generation）方向迈出的重要一步。

\`\`\`jsx
import { prerenderToNodeStream } from 'react-dom/static';

// prerenderToNodeStream 返回一个 ReadableStream
// 支持 Suspense 边界和流式输出
const { prelude } = await prerenderToNodeStream(<App />);
// prelude 是一个包含 HTML 的 ReadableStream
\`\`\`

## 二、与 renderToString 的对比

\`renderToString\` 是 React 传统的服务端渲染 API，它将整个组件树同步渲染为 HTML 字符串。但它有几个关键限制：

\`\`\`jsx
// ❌ 旧方式：renderToString
import { renderToString } from 'react-dom/server';

const html = renderToString(<App />);
// 问题：
// 1. 同步阻塞，不支持 Suspense
// 2. 必须等待所有数据就绪（包括 Suspense 包裹的慢组件）
// 3. 无法流式输出
// 4. 不支持 Client Component 引用
\`\`\`

\`prerender\` 解决了这些问题：

\`\`\`jsx
// ✅ 新方式：prerender
import { prerenderToNodeStream } from 'react-dom/static';

const { prelude } = await prerenderToNodeStream(
  <App />
);

// prelude 是 ReadableStream，可以：
// 1. 流式写入 HTTP 响应
// 2. 写入文件系统（静态生成）
// 3. 上传到 CDN
\`\`\`

| 维度 | renderToString | prerenderToNodeStream |
|------|---------------|----------------------|
| 渲染方式 | 同步、阻塞 | 异步、流式 |
| Suspense | 不支持（会 fallback 到最近的 Suspense 边界） | 支持（保留 Suspense 边界，输出 fallback + 占位符） |
| 流式输出 | 不支持 | 支持（ReadableStream） |
| 静态生成 | 可用但受限 | 原生支持 |
| 性能 | 必须等待所有组件 | 可逐步输出 |
| 使用场景 | 简单 SSR | 静态站点生成、ISR、流式 SSR |

## 三、Suspense 在 prerender 中的行为

\`prerender\` 对 Suspense 的处理方式与 \`renderToString\` 完全不同：

\`\`\`jsx
// 组件定义
function ProductPage() {
  return (
    <div>
      <h1>产品页面</h1>
      {/* 这个组件数据加载慢，用 Suspense 包裹 */}
      <Suspense fallback={<ProductSkeleton />}>
        <ProductReviews />
      </Suspense>
    </div>
  );
}
\`\`\`

\`\`\`jsx
// 使用 prerender 预渲染
const { prelude } = await prerenderToNodeStream(<ProductPage />);

// prelude 输出（简化）：
// <div>
//   <h1>产品页面</h1>
//   <!--$?-->  ← Suspense 边界的占位符
//   <template id="B:0"></template>
//   <div class="skeleton">加载中...</div>  ← fallback 内容
//   <!--/$-->  ← Suspense 结束标记
// </div>
\`\`\`

关键点：\`prerender\` 不会等待 Suspense 包裹的组件完成渲染。它会输出 fallback 内容作为初始 HTML，而 Suspense 内部的内容稍后通过 JavaScript 水合后动态填充。这种行为对于静态站点生成非常有用——你可以生成一个包含骨架屏的静态 HTML，用户在 JS 加载后看到完整内容。

## 四、增量静态生成 (ISR) 支持

\`prerender\` 与增量静态生成（Incremental Static Regeneration）天然兼容：

\`\`\`jsx
// 典型的 ISR 流程：
// 1. 构建时：prerender 生成静态 HTML
// 2. 运行时：检测内容是否过期
// 3. 过期时：后台重新 prerender，更新静态文件

// Next.js 中的 ISR 使用 revalidate 配置
// app/products/[id]/page.jsx
export const revalidate = 3600; // 每小时重新生成

async function ProductPage({ params }) {
  const product = await db.product.findUnique({
    where: { id: params.id },
  });
  return <ProductDetail product={product} />;
}
\`\`\`

在底层，Next.js 使用 \`prerender\` 来生成静态 HTML 文件。当设置了 \`revalidate\` 后，首次请求返回缓存的静态 HTML，同时在后台触发新的 \`prerender\` 来更新缓存。这结合了静态站点的性能和动态内容的灵活性。

## 五、与 Next.js 静态导出配合

对于纯静态站点（Static Site Generation，SSG），\`prerender\` 是核心基础设施：

\`\`\`jsx
// next.config.js
module.exports = {
  output: 'export', // 启用静态导出
};

// 构建时 Next.js 会：
// 1. 为每个路由调用 prerender
// 2. 将 prelude 流写入 HTML 文件
// 3. 生成对应的 JS/CSS 资源
// 4. 输出到 out/ 目录，可直接部署到任何静态托管服务
\`\`\`

\`\`\`jsx
// 使用 generateStaticParams 生成静态路径
export async function generateStaticParams() {
  const posts = await db.post.findMany();
  return posts.map(post => ({ slug: post.slug }));
}

// 构建时，Next.js 为每个 slug 调用 prerender(<PostPage slug={slug} />)
// 生成对应的静态 HTML 文件
\`\`\`

---

## 底层原理

\`prerender\` 的底层实现基于 React 的静态渲染器（Static Renderer），它构建在 React Flight 协议之上：

1. **静态渲染器初始化**：\`prerenderToNodeStream\` 创建一个静态渲染器实例。与并发渲染器不同，静态渲染器不会调度更新，它只执行一次完整的渲染。

2. **组件树遍历**：渲染器从根组件开始递归遍历组件树。对于 Server Component，直接执行函数体并收集 JSX 输出。对于 Client Component，渲染器输出一个"客户端插槽"（client slot），包含模块引用和 props。

3. **Suspense 边界处理**：遇到 Suspense 时，渲染器：
   - 不等待 Suspense 内容完成
   - 输出一个 HTML 注释标记（\`<!--$?-->\`）作为占位符
   - 输出 fallback 内容
   - 输出结束标记（\`<!--/$-->\`）
   - 将实际内容（如果之后完成）作为隐藏的 \`<template>\` 标签内联

4. **流式输出**：\`prelude\` 返回的 ReadableStream 在渲染过程中逐步产生 HTML 块。这意味着 HTTP 响应可以尽早开始发送，浏览器可以一边接收一边渲染页面。

5. **静态标记**：\`prerender\` 生成的 HTML 包含特殊的标记，让客户端 React 知道哪些部分是静态的（不需要水合），哪些需要水合。这减少了客户端的水合工作量。

6. **与 SSR 的区别**：\`prerender\` 是"纯静态"渲染——它假定渲染结果不会在服务端改变。SSR（如 \`renderToPipeableStream\`）则允许渲染结果响应请求级别的数据（如用户会话、请求参数）。\`prerender\` 适合内容不随请求变化的场景（博客文章、产品页面），SSR 适合内容随请求变化的场景（个性化推荐、用户仪表板）。

## 常见陷阱

- **在 prerender 中使用请求相关数据**：\`prerender\` 渲染的结果是静态的，不能依赖 \`cookies()\`、\`headers()\` 等请求级数据。如果需要这些数据，应该使用 SSR 而不是 prerender。
- **误以为 prerender 会等待所有 Suspense 内容**：\`prerender\` 不会等待 Suspense 边界内的内容，它输出 fallback 后立即继续。如果所有内容都在 Suspense 中，预渲染出的 HTML 可能只有骨架屏。
- **忘记处理 prerender 错误**：如果 prerender 过程中抛出错误，整个流会中断。应该在渲染树中使用 ErrorBoundary 包裹可能出错的组件。
- **静态导出时误用动态路由**：使用 \`output: 'export'\` 时，所有路由必须在构建时确定。不能使用 \`cookies()\`、\`headers()\`、动态路由参数（除非用 \`generateStaticParams\`）。
- **在 prerender 中大量使用动态导入**：动态导入在 prerender 中仍然是异步的，但 prerender 会等待它们完成。过度使用可能增加构建时间。

## 性能提示

- **合理设置 revalidate 间隔**：ISR 的 \`revalidate\` 值不宜过短（如 1 秒），否则每次请求都可能触发后台重渲染，增加服务端压力。通常 1 小时到 1 天是合理的。
- **使用 on-demand revalidation**：对于内容更新频繁的场景，可以考虑使用 \`revalidatePath\` 或 \`revalidateTag\` 按需重验证，而不是依赖时间间隔。
- **预渲染策略分层**：对访问量大的页面使用 SSG（构建时 prerender），对访问量中等但内容变化频繁的页面使用 ISR，对个性化页面使用 SSR。这是"静态优先"策略的核心。
- **利用 prerender 的流式特性**：在 HTTP 响应中，将 \`prelude\` 流直接 pipe 到响应对象，让浏览器尽早开始渲染（首字节时间 TTFB 更短）。
`,
    code: `// 用纯 JS 模拟 prerender 流程
// 演示重点：渲染组件树为 HTML，Suspense 边界输出 fallback，生成静态文件

// ========== 阶段一：定义组件树 ==========

// 模拟不同的组件，有些快、有些慢
const components = {
  Header: () => ({
    html: "<header><h1>📚 技术博客</h1><nav>首页 / 归档 / 关于</nav></header>",
    latency: 0,
  }),

  Sidebar: () => ({
    html: "<aside><h3>热门文章</h3><ul><li>React 19 入门</li><li>TypeScript 高级技巧</li></ul></aside>",
    latency: 0,
  }),

  Footer: () => ({
    html: "<footer><p>© 2026 技术博客 | 保留所有权利</p></footer>",
    latency: 0,
  }),

  // 模拟慢组件 —— 数据加载需要时间
  ProductReviews: async () => {
    // 模拟数据库查询延迟
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      html: "<section class=\\"reviews\\"><h3>用户评价</h3><div class=\\"review\\">★★★★★ 非常好的产品！</div><div class=\\"review\\">★★★★☆ 性价比很高</div></section>",
      latency: 100,
    };
  },

  RelatedPosts: async () => {
    await new Promise(resolve => setTimeout(resolve, 80));
    return {
      html: "<section class=\\"related\\"><h3>相关文章</h3><ul><li>Server Components 详解</li><li>Server Actions 实践</li></ul></section>",
      latency: 80,
    };
  },
};

// ========== 阶段二：prerender 模拟实现 ==========

class PrerenderEngine {
  constructor() {
    this.htmlBuffer = [];
    this.suspenseSlots = [];
    this.slotId = 0;
    this.stats = {
      totalComponents: 0,
      serverComponents: 0,
      clientComponents: 0,
      suspenseBoundaries: 0,
      totalLatency: 0,
    };
  }

  // 核心：渲染组件树
  async render(tree) {
    console.log("⚙️  开始 prerender 渲染...\\n");
    await this.renderNode(tree);
    return this.finalize();
  }

  async renderNode(node) {
    if (!node) return;

    this.stats.totalComponents++;

    if (node.type === "SERVER_COMPONENT") {
      this.stats.serverComponents++;
      const component = components[node.name];
      if (!component) {
        console.log(\`  ⚠️  未知组件: \${node.name}\`);
        return;
      }

      const result = await component();
      this.stats.totalLatency += result.latency;

      if (result.latency > 0) {
        console.log(\`  ⏳ 渲染: \${node.name} (耗时 \${result.latency}ms)\`);
      } else {
        console.log(\`  ✓ 渲染: \${node.name}\`);
      }

      this.htmlBuffer.push(result.html);
    }

    if (node.type === "CLIENT_COMPONENT") {
      this.stats.clientComponents++;
      console.log(\`  → 跳过: \${node.name} (客户端组件，仅记录引用)\`);
      // 客户端组件输出占位符
      this.htmlBuffer.push(
        \`<div data-component="\${node.name}" data-module="\${node.modulePath || ""}"></div>\`
      );
    }

    if (node.type === "SUSPENSE_BOUNDARY") {
      this.stats.suspenseBoundaries++;
      const slotId = ++this.slotId;
      console.log(\`  🔄 Suspense 边界 #\${slotId}: \${node.label || "未命名"}\`);

      // 输出 fallback 内容
      const fallback = node.fallback || this.getDefaultFallback(slotId);
      this.htmlBuffer.push(
        \`\\n<!--\${"$"}?--><template id="B:\${slotId}"></template>\`
      );
      this.htmlBuffer.push(fallback);
      this.htmlBuffer.push(\`<!--/\${"$"}-->\\n\`);

      // 异步渲染 Suspense 的实际内容
      if (node.children) {
        this.suspenseSlots.push({
          slotId,
          children: node.children,
          label: node.label,
        });
      }
    }

    // 递归渲染子节点
    if (node.children) {
      for (const child of node.children) {
        await this.renderNode(child);
      }
    }
  }

  getDefaultFallback(slotId) {
    return \`<div class="skeleton" data-slot="\${slotId}">\\n  <div class="skeleton-line"></div>\\n  <div class="skeleton-line short"></div>\\n</div>\`;
  }

  // 渲染 Suspense 延迟内容
  async resolveSuspenseSlots() {
    if (this.suspenseSlots.length === 0) return;

    console.log("\\n⏳ 渲染 Suspense 延迟内容...");
    for (const slot of this.suspenseSlots) {
      console.log(\`  🔄 解析 Suspense #\${slot.slotId}: \${slot.label}\`);
      // 在真实场景中，这些内容会作为单独的 JS chunk 加载
      // 这里我们模拟渲染并把结果记录下来
      const resolveBuffer = [];
      for (const child of slot.children) {
        if (child.type === "SERVER_COMPONENT") {
          const component = components[child.name];
          if (component) {
            const result = await component();
            resolveBuffer.push(result.html);
          }
        }
      }
      console.log(\`  ✅ Suspense #\${slot.slotId} 内容已就绪\`);
      console.log(\`     内容: \${resolveBuffer.join("").substring(0, 80)}...\`);
      console.log(\`     (实际渲染时，这些内容通过 JS 动态填充到 #slot\${slot.slotId})\`);
    }
  }

  finalize() {
    const html = this.htmlBuffer.join("\\n");
    return {
      html,
      stats: this.stats,
      size: html.length,
    };
  }
}

// ========== 阶段三：完整渲染流程 ==========

async function main() {
  console.log("═".repeat(55));
  console.log("📜 React 19 prerender 静态渲染流程模拟");
  console.log("═".repeat(55));

  console.log("\\n核心概念：");
  console.log("  • prerender 在构建时/服务端渲染组件为静态 HTML");
  console.log("  • 遇到 Suspense 边界时输出 fallback，不等待内部内容");
  console.log("  • 渲染结果可写入文件系统或通过 HTTP 流式输出");
  console.log("  • 客户端组件不执行，仅输出占位符和模块引用\\n");

  // 定义页面组件树
  const pageTree = {
    type: "SERVER_COMPONENT",
    name: "Page",
    children: [
      { type: "SERVER_COMPONENT", name: "Header" },
      { type: "SERVER_COMPONENT", name: "Sidebar" },
      // 主内容区域
      {
        type: "SUSPENSE_BOUNDARY",
        label: "产品评价（慢数据）",
        fallback: '<div class="skeleton"><div class="skeleton-line"></div><div class="skeleton-line short"></div><p>评价加载中...</p></div>',
        children: [
          { type: "SERVER_COMPONENT", name: "ProductReviews" },
        ],
      },
      {
        type: "SUSPENSE_BOUNDARY",
        label: "相关文章（慢数据）",
        fallback: '<div class="skeleton"><div class="skeleton-line"></div><p>推荐加载中...</p></div>',
        children: [
          { type: "SERVER_COMPONENT", name: "RelatedPosts" },
        ],
      },
      // 客户端组件 —— 需要交互
      {
        type: "CLIENT_COMPONENT",
        name: "NewsletterSignup",
        modulePath: "./components/NewsletterSignup.js",
      },
      { type: "SERVER_COMPONENT", name: "Footer" },
    ],
  };

  console.log("📋 页面组件树：");
  console.log("  Page");
  console.log("  ├── Header (Server)");
  console.log("  ├── Sidebar (Server)");
  console.log("  ├── Suspense: 产品评价");
  console.log("  │   └── ProductReviews (Server, 慢)");
  console.log("  ├── Suspense: 相关文章");
  console.log("  │   └── RelatedPosts (Server, 慢)");
  console.log("  ├── NewsletterSignup (Client)");
  console.log("  └── Footer (Server)\\n");

  // 执行 prerender
  const engine = new PrerenderEngine();
  const result = await engine.render(pageTree);

  // 渲染 Suspense 延迟内容
  await engine.resolveSuspenseSlots();

  // ========== 输出结果 ==========
  console.log("\\n" + "═".repeat(55));
  console.log("📄 渲染结果：静态 HTML");
  console.log("═".repeat(55));
  console.log(result.html);

  console.log("\\n" + "═".repeat(55));
  console.log("📊 渲染统计");
  console.log("═".repeat(55));
  console.log(\`  总组件数: \${result.stats.totalComponents}\`);
  console.log(\`  服务端组件: \${result.stats.serverComponents}\`);
  console.log(\`  客户端组件: \${result.stats.clientComponents}\`);
  console.log(\`  Suspense 边界: \${result.stats.suspenseBoundaries}\`);
  console.log(\`  服务端渲染总耗时: \${result.stats.totalLatency}ms\`);
  console.log(\`  静态 HTML 大小: \${result.size} bytes\`);

  // 对比 renderToString
  console.log("\\n" + "═".repeat(55));
  console.log("⚖️  renderToString vs prerender 对比");
  console.log("═".repeat(55));
  console.log("  renderToString:");
  console.log("    ✗ 必须等待所有 Suspense 内容完成");
  console.log("    ✗ 总耗时 = 所有组件耗时之和");
  console.log("    ✗ 无法流式输出，TTFB 高");
  console.log("");
  console.log("  prerender:");
  console.log("    ✓ 遇到 Suspense 立即输出 fallback");
  console.log("    ✓ 慢内容异步加载，不阻塞首屏");
  console.log("    ✓ 支持流式输出，TTFB 低");
  console.log("    ✓ 输出可直接写入文件系统（静态生成）");

  // 模拟写入文件
  console.log("\\n" + "═".repeat(55));
  console.log("💾 模拟静态文件生成");
  console.log("═".repeat(55));
  console.log("  ✓ 写入: out/index.html");
  console.log("  ✓ 写入: out/products.html");
  console.log("  ✓ 写入: out/about.html");
  console.log("  ✓ 上传到 CDN...");
  console.log("\\n📚 总结：");
  console.log("1. prerender 生成静态 HTML，Suspense 边界输出 fallback");
  console.log("2. 静态 HTML 可直接部署到任何静态托管服务");
  console.log("3. 搭配 ISR，可在后台定期更新静态内容");
  console.log("4. 客户端组件在 prerender 中不执行，仅输出占位符");
  console.log("5. prerender 是 SSG 和 ISR 的底层基础设施");
}

main().catch(console.error);
`,
  },

  {
    id: "react19-new-jsx-transform",
    title: "JSX 变换与类型改进",
    icon: "🔧",
    group: "服务端与迁移",
    content: `## 一、React 19 中的 JSX 改进概览

React 19 对 JSX 进行了多项令人期待已久的改进，让开发者体验更简洁、更直观。这些改进主要围绕三个方面：

1. **ref 作为 prop**：不再需要 \`forwardRef\`，ref 可以直接作为 prop 传递
2. **Context 简化**：\`<Context>\` 直接作为 Provider，不再需要 \`.Provider\`
3. **TypeScript 类型改进**：\`useRef\` 不再强制要求 \`null\` 初始值参数

这些改进虽然看起来"小"，但影响深远——它们消除了 React 开发中一些最令人困惑的 API 设计。

## 二、ref 作为 prop：告别 forwardRef

在 React 18 及更早版本中，将 ref 传递给子组件必须使用 \`forwardRef\`：

\`\`\`jsx
// ❌ React 18：必须用 forwardRef 包裹
import { forwardRef } from 'react';

const MyInput = forwardRef(function MyInput(props, ref) {
  return <input {...props} ref={ref} />;
});

// 使用
<MyInput ref={inputRef} />
\`\`\`

React 19 中，ref 就是一个普通的 prop：

\`\`\`jsx
// ✅ React 19：ref 直接作为 prop
function MyInput({ ref, ...props }) {
  return <input {...props} ref={ref} />;
}

// 使用方式完全相同
<MyInput ref={inputRef} />
\`\`\`

关键变化：
- \`forwardRef\` 仍然保留，但不再必要
- ref 从 \`props\` 中解构时，TypeScript 类型会自动推断
- 不再有"ref 神秘地从 props 中消失"的困惑
- 与 Server Component 的兼容性更好（Server Component 不需要 ref）

\`\`\`jsx
// TypeScript 中的类型声明
interface MyInputProps extends React.ComponentProps<'input'> {
  label: string;
  // ref 类型自动从 ComponentProps<'input'> 中继承
}

function MyInput({ label, ref, ...props }: MyInputProps) {
  return (
    <label>
      {label}
      <input ref={ref} {...props} />
    </label>
  );
}
\`\`\`

## 三、Context 简化：不再需要 .Provider

React 19 中，Context 对象本身就可以作为 Provider 使用：

\`\`\`jsx
// ❌ React 18：需要 .Provider
const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Page />
    </ThemeContext.Provider>
  );
}
\`\`\`

\`\`\`jsx
// ✅ React 19：直接用 Context 组件
const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext value="dark">
      <Page />
    </ThemeContext>
  );
}
\`\`\`

这个改进让 JSX 结构更清晰：

\`\`\`jsx
// React 19：嵌套 Context 清晰的树状结构
<ThemeContext value="dark">
  <AuthContext value={user}>
    <LocaleContext value="zh-CN">
      <Page />
    </LocaleContext>
  </AuthContext>
</ThemeContext>

// React 18：.Provider 让代码臃肿
<ThemeContext.Provider value="dark">
  <AuthContext.Provider value={user}>
    <LocaleContext.Provider value="zh-CN">
      <Page />
    </LocaleContext.Provider>
  </AuthContext.Provider>
</ThemeContext.Provider>
\`\`\`

向后兼容性：\`.Provider\` 仍然保留，旧代码无需修改也能运行。

## 四、TypeScript 类型改进

### useRef 不再强制 null 初始值

\`\`\`typescript
// ❌ React 18：必须传 null
const ref = useRef<HTMLInputElement>(null);
// 类型：MutableRefObject<HTMLInputElement | null>

// ✅ React 19：不需要 null 初始值参数
const ref = useRef<HTMLInputElement>(null);
// 类型：RefObject<HTMLInputElement | null>
// null 初始值仍然是推荐的，但类型推断更智能
\`\`\`

### 更精简的类型推断

React 19 的 \`@types/react\` 做了大量类型简化：

\`\`\`typescript
// React 18：useState 需要显式类型参数
const [items, setItems] = useState<Item[]>([]);

// React 19：初始值类型推断改进
const [items, setItems] = useState<Item[]>([]);
// 如果初始值是空数组，建议仍然提供类型参数以确保类型安全

// React 19 对组件类型推断的改进
// 函数组件返回类型不再需要显式标注 JSX.Element
function MyComponent(): React.ReactNode {  // 更宽松
  return <div>Hello</div>;
}
\`\`\`

### 新增的实用类型

React 19 还引入了几个新的实用类型：

\`\`\`typescript
import type { ComponentProps, ComponentRef } from 'react';

// ComponentRef：获取组件的 ref 类型
type InputRef = ComponentRef<'input'>;         // React.RefObject<HTMLInputElement>
type MyCompRef = ComponentRef<typeof MyComp>;  // 推断组件的 ref 类型

// 原有的 ComponentProps 继续可用
type InputProps = ComponentProps<'input'>;
\`\`\`

## 五、JSX 变换的其他改进

### 文档元数据原生支持

React 19 原生支持 \`<title>\`、\`<meta>\`、\`<link>\` 等文档元数据标签，不再需要 \`react-helmet\` 等第三方库：

\`\`\`jsx
function ProductPage({ product }) {
  return (
    <article>
      <title>{product.name} - 我的商店</title>
      <meta name="description" content={product.description} />
      <h1>{product.name}</h1>
      {/* ... */}
    </article>
  );
}
\`\`\`

React 会自动将这些标签提升到 \`<head>\` 中，即使它们出现在组件树的深层。

### 样式优先级的改进

\`\`\`jsx
// React 19 支持样式表的优先级声明
<link rel="stylesheet" href="/styles.css" precedence="high" />
<link rel="stylesheet" href="/theme.css" precedence="low" />
\`\`\`

---

## 底层原理

1. **ref 作为 prop 的实现**：在 React 19 的 JSX 变换中，\`ref\` 不再被特殊处理。之前的 JSX 变换会将 \`ref\` 从 props 中提取出来，通过第二个参数传递给 \`forwardRef\` 包裹的组件。React 19 的 JSX 变换（自动启用，配合 React 17+ 的 \`react/jsx-runtime\`）将 \`ref\` 作为一个普通属性包含在 props 对象中。组件内部通过解构 \`{ ref, ...props }\` 获取 ref，然后像传递其他 props 一样将其传递给原生元素。兼容性方面，React 内部在运行时检测到原生元素时，仍然会将 ref 从 props 中提取并特殊处理（挂载到 DOM 节点），但对自定义组件而言，ref 就是普通 prop。

2. **Context 简化实现**：\`createContext\` 返回的 Context 对象本身现在就是一个 React 组件。在内部，\`<ThemeContext value="dark">\` 等价于 \`<ThemeContext.Provider value="dark">\`。React 在 JSX 处理时检测到元素类型是一个 Context 对象（而非函数或类），就自动将其视为 Provider。这使得 \`.Provider\` 属性名成为一个可选的语法糖，而非必需的 API 入口。

3. **类型改进的底层**：\`@types/react\` 在 React 19 中进行了重大重构。\`useRef\` 的类型签名从需要两个重载改为使用条件类型，根据是否传入初始值来自动推断返回类型。\`ComponentRef\` 是一个条件类型工具，它检查传入的组件类型，如果是原生元素（如 \`'input'\`），返回对应的 \`HTMLInputElement\` 的 ref 类型；如果是函数组件，则尝试推断其 ref prop 的类型。

4. **文档元数据提升**：React 19 内部新增了一个"preinit"机制。当渲染器遇到 \`<title>\`、\`<meta>\`、\`<link>\` 等标签时，不会将它们渲染到组件树中的当前位置，而是通过 DOM 操作将它们提升到 \`<head>\` 中。对于重复的标签（如多个 \`<title>\`），后渲染的会覆盖前面的。

## 常见陷阱

- **ref prop 与自定义 prop 命名冲突**：如果你的组件已经有一个名为 \`ref\` 的自定义 prop（不是 ref 转发），React 19 会将其视为真实的 ref prop。确保不要将普通 prop 命名为 \`ref\`。
- **TypeScript 类型混淆**：升级到 React 19 后，如果 \`@types/react\` 版本不对，可能出现类型错误。确保 \`@types/react\` 版本与 \`react\` 版本匹配。
- **Context 用法混淆**：\`<ThemeContext>\` 和 \`<ThemeContext.Provider>\` 都能用，但可能让团队成员困惑。建议团队统一使用一种风格。
- **forwardRef 仍然存在**：不要以为 \`forwardRef\` 被废弃了。它仍然存在，只是不再必需。一些库可能仍然依赖它。
- **文档元数据在非浏览器环境不生效**：\`<title>\` 和 \`<meta>\` 的自动提升依赖 DOM API，在 react-native 或测试环境中不会自动提升。

## 性能提示

- **ref 作为 prop 不增加性能开销**：ref 只是从 props 对象中解构出来的一个属性，没有额外的内存分配或处理。
- **Context 简化只是语法糖**：\`<ThemeContext>\` 和 \`<ThemeContext.Provider>\` 在运行时完全等价，性能没有差异。
- **文档元数据自动提升是高效的**：React 使用内部标记来跟踪哪些标签已经提升到 \`<head>\`，避免重复的 DOM 操作。
- **类型改进不影响运行时**：TypeScript 类型改进是纯编译时的，对运行时性能零影响。
`,
    code: `// 用纯 JS 模拟 React 19 新 JSX 变换
// 演示重点：ref 提取、Context 简化 Provider 语法、新 JSX 变换的差异

// ========== 阶段一：模拟 React 18 的 JSX 变换 ==========

console.log("═".repeat(55));
console.log("🔧 React 18 vs 19 JSX 变换对比模拟");
console.log("═".repeat(55));

// 模拟 React.createElement（React 18 方式）
// 在 React 18 中，ref 是通过第二个参数传递的，不在 props 中
function createElementV18(type, props, ...children) {
  // React 18 会从 props 中提取 key 和 ref
  const extractedRef = props?.ref;
  const extractedKey = props?.key;

  // 构建不含 ref 和 key 的 props
  const cleanProps = {};
  if (props) {
    for (const key of Object.keys(props)) {
      if (key !== "ref" && key !== "key") {
        cleanProps[key] = props[key];
      }
    }
  }

  return {
    type,
    props: cleanProps,
    ref: extractedRef || null,
    key: extractedKey || null,
    children: children.flat(),
    __reactVersion: 18,
  };
}

// 模拟 React 19 的 JSX 变换（新 jsx-runtime）
// 在 React 19 中，ref 保留在 props 中
function createElementV19(type, props, ...children) {
  // React 19 只提取 key，ref 保留在 props 中
  const extractedKey = props?.key;

  const cleanProps = { ...props };
  if (cleanProps && "key" in cleanProps) {
    delete cleanProps.key;
  }

  return {
    type,
    props: cleanProps,  // ref 保留在 props 中！
    key: extractedKey || null,
    children: children.flat(),
    __reactVersion: 19,
  };
}

// ========== 阶段二：对比两种 JSX 变换 ==========

console.log("\\n📋 场景1：<input ref={inputRef} className=\\"input\\" />\\n");

const inputRef = { current: null };

// React 18 JSX 变换
const v18Element = createElementV18(
  "input",
  { ref: inputRef, className: "input", type: "text" }
);

// React 19 JSX 变换
const v19Element = createElementV19(
  "input",
  { ref: inputRef, className: "input", type: "text" }
);

console.log("React 18 JSX 变换结果：");
console.log(JSON.stringify(v18Element, null, 2));
console.log("\\n注意：ref 被提取到顶层 ref 属性，不在 props 中");
console.log(\`  props.ref: \${v18Element.props.ref}\`);
console.log(\`  element.ref: \${JSON.stringify(v18Element.ref)}\`);

console.log("\\n---\\n");

console.log("React 19 JSX 变换结果：");
console.log(JSON.stringify(v19Element, null, 2));
console.log("\\n注意：ref 保留在 props 中，不再有顶层 ref 属性");
console.log(\`  props.ref: \${JSON.stringify(v19Element.props.ref)}\`);

// ========== 阶段三：模拟 forwardRef 的差异 ==========

console.log("\\n" + "═".repeat(55));
console.log("📋 场景2：自定义组件 MyInput 接收 ref\\n");

// React 18 方式：需要 forwardRef 包裹
function forwardRefV18(renderFn) {
  return function ForwardedComponent(props) {
    // React 18 会把 ref 作为第二个参数传入
    const ref = props.__forwardedRef; // 模拟 forwardRef 内部提取 ref
    const cleanProps = { ...props };
    delete cleanProps.__forwardedRef;
    return renderFn(cleanProps, ref);
  };
}

// React 18 风格的组件定义
const MyInputV18 = forwardRefV18(function MyInput(props, ref) {
  // ref 通过第二个参数传入
  return {
    type: "input",
    props: { ...props, ref: ref },  // 手动把 ref 放入 props 传给原生元素
    children: [],
  };
});

// React 19 风格：就是普通函数组件
function MyInputV19({ ref, ...props }) {
  // ref 直接从 props 解构
  return {
    type: "input",
    props: { ...props, ref: ref },
    children: [],
  };
}

console.log("React 18 方式（需要 forwardRef 包裹）：");
const v18Component = MyInputV18({
  __forwardedRef: inputRef,
  className: "my-input",
  placeholder: "请输入...",
});
console.log(JSON.stringify(v18Component, null, 2));

console.log("\\nReact 19 方式（普通函数组件，ref 作为 prop）：");
const v19Component = MyInputV19({
  ref: inputRef,
  className: "my-input",
  placeholder: "请输入...",
});
console.log(JSON.stringify(v19Component, null, 2));

// ========== 阶段四：模拟 Context 简化 ==========

console.log("\\n" + "═".repeat(55));
console.log("📋 场景3：Context Provider 简化\\n");

// 模拟 createContext
function createContext(defaultValue) {
  const context = {
    _defaultValue: defaultValue,
    _currentValue: defaultValue,
    // React 18 方式：Provider 作为子属性
    Provider: function ({ value, children }) {
      context._currentValue = value;
      console.log(\`  [Context.Provider] 设置值为: \${JSON.stringify(value)}\`);
      // 渲染 children
      return { type: "CONTEXT_PROVIDER", context, value, children };
    },
  };

  return context;
}

// React 19 新增：Context 对象本身可作为组件
function createContextV19(defaultValue) {
  const context = createContext(defaultValue);

  // 关键：重写 Context 对象本身，使其可被作为 JSX 组件调用
  const contextProxy = function ({ value, children, ...props }) {
    // 直接作为组件：<ThemeContext value="dark">
    context._currentValue = value;
    console.log(\`  [Context] 设置值为: \${JSON.stringify(value)}\`);
    return { type: "CONTEXT_PROVIDER", context, value, children };
  };

  // 复制所有属性到函数对象上
  Object.setPrototypeOf(contextProxy, context);
  contextProxy._defaultValue = defaultValue;
  contextProxy._currentValue = defaultValue;
  contextProxy.Provider = context.Provider; // 保留向后兼容

  return contextProxy;
}

console.log("创建 ThemeContext:");
const ThemeContext = createContextV19("light");

console.log("\\nReact 18 写法（仍兼容）：");
console.log("<ThemeContext.Provider value=\\"dark\\">");
const v18ContextResult = ThemeContext.Provider({
  value: "dark",
  children: [{ type: "div", props: { className: "app" }, children: [] }],
});
console.log(JSON.stringify(v18ContextResult, null, 2));

console.log("\\nReact 19 新写法：");
console.log("<ThemeContext value=\\"dark\\">");
const v19ContextResult = ThemeContext({
  value: "dark",
  children: [{ type: "div", props: { className: "app" }, children: [] }],
});
console.log(JSON.stringify(v19ContextResult, null, 2));

// ========== 阶段五：模拟 TypeScript 类型改进 ==========

console.log("\\n" + "═".repeat(55));
console.log("📋 场景4：useRef 类型推断模拟\\n");

// 模拟 React 18 的 useRef 类型约束
function useRefV18(initialValue) {
  const ref = { current: initialValue };
  // React 18 类型要求：useRef<HTMLInputElement>(null!)
  // 需要显式传 null 才能获得正确的类型
  console.log(
    \`  [React 18] useRef 创建 (必须显式传 null): current = \${ref.current}\`
  );
  return ref;
}

// 模拟 React 19 的 useRef 类型约束（更宽松）
function useRefV19(initialValue) {
  const ref = { current: initialValue };
  // React 19: 类型推断更智能，不需要强制 null 初始值
  // useRef<HTMLInputElement>(null) 和 useRef<HTMLInputElement | null>(null) 都合法
  // 关键：RefObject 类型现在正确区分了只读和可变 ref
  console.log(
    \`  [React 19] useRef 创建 (类型推断改进): current = \${ref.current}\`
  );
  return ref;
}

const ref18 = useRefV18(null);
const ref19 = useRefV19(null);

console.log("\\nReact 18 类型: MutableRefObject<HTMLInputElement | null>");
console.log("React 19 类型: RefObject<HTMLInputElement | null>");
console.log("区别：React 19 的 RefObject 的 current 是只读的（用于 DOM ref）");
console.log("      MutableRefObject 仍然存在，用于需要 .current = xxx 的场景");

// ========== 阶段六：总结对比 ==========

console.log("\\n" + "═".repeat(55));
console.log("📊 React 18 vs 19 JSX 变换总结");
console.log("═".repeat(55));

const comparisonTable = [
  ["特性", "React 18", "React 19"],
  ["ref 传递", "forwardRef 必需", "ref 作为普通 prop"],
  ["Context 用法", "<Ctx.Provider value>", "<Ctx value>（更简洁）"],
  ["useRef 类型", "MutableRefObject (复杂)", "RefObject (更清晰)"],
  ["JSX 变换", "React.createElement", "jsx-runtime (自动)"],
  ["文档元数据", "需要第三方库", "原生支持 <title>/<meta>"],
  ["forwardRef", "必须使用", "可选（向后兼容）"],
  [".Provider", "唯一方式", "可选（向后兼容）"],
];

for (const row of comparisonTable) {
  console.log(
    \`  \${row[0].padEnd(18)} | \${row[1].padEnd(28)} | \${row[2]}\`
  );
}

console.log("\\n📚 关键要点：");
console.log("1. ref 作为 prop 消除了 forwardRef 的必要性");
console.log("2. <Context> 直接作为 Provider 更符合直觉");
console.log("3. TypeScript 类型改进让代码更简洁");
console.log("4. 旧 API (forwardRef, .Provider) 仍然保留，向后兼容");
console.log("5. 文档元数据原生支持，不再需要第三方库");
console.log("6. 这些改进都是渐进式的，可以逐步迁移");
`,
  },

  {
    id: "react19-migration-guide",
    title: "React 19 迁移指南",
    icon: "📗",
    group: "服务端与迁移",
    content: `## 一、迁移前准备

从 React 18 迁移到 React 19 不是一个简单的依赖升级，它涉及 API 变更、构建配置调整和代码重构。在开始之前，先做好以下准备：

1. **阅读官方 Breaking Changes 清单**：React 19 移除了一些长期标记为"不推荐"的 API
2. **确保测试覆盖**：迁移前确保有足够的测试覆盖，特别是组件渲染和交互测试
3. **创建迁移分支**：在独立分支上进行迁移，确保可以随时回退
4. **升级 Node.js**：React 19 要求 Node.js 18+（推荐 20+）
5. **检查第三方依赖**：确认使用的 UI 库、状态管理库等是否兼容 React 19

## 二、Breaking Changes 清单

### 已移除的 API

以下 API 在 React 19 中被完全移除，使用时会导致构建错误：

\`\`\`jsx
// ❌ 已移除：ReactDOM.render
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));

// ✅ 替代：createRoot
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<App />);
\`\`\`

\`\`\`jsx
// ❌ 已移除：ReactDOM.hydrate
ReactDOM.hydrate(<App />, document.getElementById('root'));

// ✅ 替代：hydrateRoot
import { hydrateRoot } from 'react-dom/client';
hydrateRoot(document.getElementById('root'), <App />);
\`\`\`

\`\`\`jsx
// ❌ 已移除：ReactDOM.unmountComponentAtNode
ReactDOM.unmountComponentAtNode(container);

// ✅ 替代：root.unmount()
root.unmount();
\`\`\`

\`\`\`jsx
// ❌ 已移除：ReactDOM.findDOMNode
const node = ReactDOM.findDOMNode(this.ref);

// ✅ 替代：使用 callback ref 或 createRef
<div ref={node => { this.node = node; }} />
\`\`\`

### 废弃的 API（仍可用但会警告）

\`\`\`jsx
// ⚠️ 废弃：字符串 ref
<input ref="myInput" />

// ✅ 替代：callback ref 或 useRef
const inputRef = useRef(null);
<input ref={inputRef} />
\`\`\`

\`\`\`jsx
// ⚠️ 废弃：defaultProps on function components
function MyComponent({ name = 'World' }) { /* ... */ }
MyComponent.defaultProps = { name: 'World' }; // 不再推荐

// ✅ 替代：使用默认参数
function MyComponent({ name = 'World' }) { /* ... */ }
\`\`\`

\`\`\`jsx
// ⚠️ 废弃：React.createFactory
const factory = React.createFactory(MyComponent);

// ✅ 替代：直接使用 JSX 或 createElement
<MyComponent />
\`\`\`

### 行为变更

\`\`\`jsx
// ⚠️ 行为变更：useRef 不再需要显式传 null
// React 18
const ref = useRef<HTMLInputElement>(null);
// React 19 中类型推断更精确，但 null 初始值仍然是推荐的

// ⚠️ 行为变更：form action 现在支持函数
// React 18：action 只接受 URL 字符串
// React 19：action 可以接受函数（Server Action）
<form action={myServerAction}>
  {/* ... */}
</form>
\`\`\`

## 三、升级步骤

### 第一步：升级核心依赖

\`\`\`bash
# 升级 react 和 react-dom
npm install react@19 react-dom@19

# 升级 TypeScript 类型定义
npm install @types/react@19 @types/react-dom@19

# 如果使用 Next.js
npm install next@latest
\`\`\`

### 第二步：更新入口文件

\`\`\`jsx
// 旧入口（index.jsx）
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));

// 新入口（index.jsx）  
import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
\`\`\`

### 第三步：更新测试

\`\`\`jsx
// 旧测试
import { render } from '@testing-library/react';

// 新测试（确保 @testing-library/react 升级到最新版本）
import { render, screen } from '@testing-library/react';
// @testing-library/react 已内置 React 19 兼容性
\`\`\`

### 第四步：更新构建配置

\`\`\`jsx
// webpack.config.js —— 确保 resolve 配置正确
module.exports = {
  resolve: {
    alias: {
      // 确保 react/jsx-runtime 正确解析
      'react/jsx-runtime': require.resolve('react/jsx-runtime'),
    },
  },
};
\`\`\`

### 第五步：处理 forwardRef 迁移

\`\`\`jsx
// React 18 代码
import { forwardRef } from 'react';

const MyInput = forwardRef(function MyInput(props, ref) {
  return <input {...props} ref={ref} />;
});

// React 19 代码（可选迁移，旧代码仍兼容）
function MyInput({ ref, ...props }) {
  return <input {...props} ref={ref} />;
}
\`\`\`

### 第六步：处理 Context Provider 简化

\`\`\`jsx
// React 18 代码
<ThemeContext.Provider value="dark">
  <App />
</ThemeContext.Provider>

// React 19 新写法（可选，旧写法仍兼容）
<ThemeContext value="dark">
  <App />
</ThemeContext>
\`\`\`

## 四、新特性启用检查清单

迁移完成后，确认以下新特性已正确启用：

| 特性 | 启用方式 | 验证方法 |
|------|---------|---------|
| Server Components | 默认启用（Next.js App Router） | 检查组件是否在服务端渲染 |
| Server Actions | 使用 \`'use server'\` 指令 | 测试表单提交和数据库操作 |
| useActionState | 导入 \`useActionState\` | 测试表单状态管理 |
| useOptimistic | 导入 \`useOptimistic\` | 测试乐观更新 UI |
| useFormStatus | 导入 \`useFormStatus\` | 测试表单提交状态 |
| ref 作为 prop | 移除 \`forwardRef\` | 测试 ref 转发 |
| Context 简化 | 移除 \`.Provider\` | 测试 context 值传递 |
| 文档元数据 | 使用 \`<title>\` / \`<meta>\` | 检查页面标题和 meta 标签 |
| prerender | 使用 \`prerenderToNodeStream\` | 检查静态生成输出 |

## 五、常见迁移陷阱

### 陷阱一：依赖版本不匹配

升级 React 19 后，如果 \`react-dom\` 或 \`@types/react\` 版本不匹配，会出现难以调试的错误：

\`\`\`bash
# 确保所有 react 相关包版本一致
npm ls react react-dom @types/react @types/react-dom
# 应该都显示 19.x.x
\`\`\`

### 陷阱二：StrictMode 更严格

React 19 的 StrictMode 在开发模式下比 React 18 更严格。组件可能被额外渲染两次，暴露副作用问题。如果发现组件行为异常，检查 effect 清理逻辑。

### 陷阱三：useEffect 清理时机变化

React 19 调整了 useEffect 清理的时机（在 React 18 基础上更严格），可能导致之前依赖旧清理时机的代码出现问题。

### 陷阱四：第三方库兼容性

不是所有库都支持 React 19。检查关键依赖的最新版本：

\`\`\`bash
# 检查各库的 React 19 兼容性
# react-router：需要 v7+
# redux / react-redux：需要最新版本
# @tanstack/react-query：需要 v5+
# framer-motion：需要 v11+
# react-hook-form：需要最新版本
\`\`\`

### 陷阱五：忽略控制台警告

React 19 在开发模式下会对废弃 API 打印非常详细的警告。不要忽略这些警告——它们通常会告诉你确切的修复方法。

---

## 底层原理

React 19 的迁移底层涉及几个关键变化：

1. **入口 API 移除**：\`ReactDOM.render\` 和 \`ReactDOM.hydrate\` 在 React 19 的源码中被完全移除。React 19 的 \`react-dom\` 包不再导出这些函数。这意味着任何仍然使用这些 API 的代码会在运行时抛出 \`TypeError: ReactDOM.render is not a function\`。

2. **JSX 变换变化**：React 19 默认使用新版 JSX 变换（\`react/jsx-runtime\`），该变换自 React 17 引入但 React 19 中成为强制要求。新版变换不依赖 \`React\` 在作用域中，且将 \`ref\` 作为普通 prop 处理。构建工具（Webpack、Vite、Turbopack）在检测到 React 19 时会自动启用新版变换。

3. **Fiber 架构扩展**：React 19 的 Fiber 架构在 React 18 基础上新增了对 Server Components 的支持。新的 Fiber 节点类型（如 \`ServerComponent\`、\`ClientReference\`）被引入，允许组件树在服务端和客户端之间拆分。迁移时不需要手动处理这些，但了解它们有助于理解为什么某些模式不再工作。

4. **类型系统重构**：\`@types/react\` 在 React 19 中进行了重大重构，从手写类型定义转向更多的代码生成和条件类型。这导致一些在 React 18 中工作的类型模式在 React 19 中可能报错或需要调整。

5. **事件系统改进**：React 19 的事件系统（SyntheticEvent）进行了优化，内部事件委托机制更高效。对于大多数应用来说这是透明的，但如果你的代码依赖了 SyntheticEvent 的内部属性（如 \`nativeEvent._reactName\`），可能需要调整。

## 常见陷阱

- **混合使用 React 18 和 React 19 的包**：如果你的项目依赖的某个库内部使用了 React 18，而你的项目使用 React 19，可能导致运行时冲突。使用 \`npm dedupe\` 或 \`resolutions\`/\`overrides\` 确保只有一个 React 版本。
- **SSR 水合不匹配**：React 19 对 SSR 水合（hydration）的匹配算法更严格。服务端和客户端渲染的不一致会触发更明显的警告。确保你的 SSR 和客户端渲染输出完全一致。
- **useId 生成算法变化**：React 19 的 \`useId\` 生成算法有变化，生成的 ID 格式可能与 React 18 不同。如果你的测试依赖具体的 ID 字符串，需要更新。

## 性能提示

- **React 19 本身性能更好**：React 19 的核心渲染引擎经过优化，大多数应用迁移后能获得免费的性能提升，无需额外操作。
- **利用 Server Components 减少客户端 JS**：迁移后，将尽可能多的组件保持为 Server Component，减少客户端 bundle 大小。
- **使用 React 19 的自动批处理增强**：React 19 的自动批处理比 React 18 更激进，减少了不必要的重渲染。检查你的代码中是否有依赖同步渲染的副作用的逻辑。
- **Profiler 更新**：React 19 的 React DevTools Profiler 提供了更详细的时间线，能更好地分析 Server Components 和 Client Components 的渲染性能。
- **渐进式迁移**：不需要一次性完成所有迁移。React 19 向后兼容大多数 React 18 的 API。可以先升级依赖，让应用正常运行，再逐步采用新特性。
`,
    code: `// 用纯 JS 模拟 React 18 → 19 迁移检查清单
// 演示重点：对比 React 18 vs 19 代码差异、自动检测废弃 API 使用

// ========== 阶段一：迁移检查器 ==========

class MigrationChecker {
  constructor() {
    this.deprecatedAPIs = {
      // API 名称 → 替代方案
      "ReactDOM.render": {
        severity: "error",
        replacement: "createRoot(root).render(<App />)",
        message: "ReactDOM.render 已被移除，请使用 createRoot",
      },
      "ReactDOM.hydrate": {
        severity: "error",
        replacement: "hydrateRoot(root, <App />)",
        message: "ReactDOM.hydrate 已被移除，请使用 hydrateRoot",
      },
      "ReactDOM.unmountComponentAtNode": {
        severity: "error",
        replacement: "root.unmount()",
        message: "unmountComponentAtNode 已被移除，请使用 root.unmount()",
      },
      "ReactDOM.findDOMNode": {
        severity: "error",
        replacement: "使用 callback ref 或 useRef",
        message: "findDOMNode 已被移除",
      },
      "forwardRef": {
        severity: "warning",
        replacement: "ref 作为普通 prop 传递",
        message: "forwardRef 不再必需，但可使用",
      },
      ".Provider": {
        severity: "info",
        replacement: "直接使用 <Context value={v}>",
        message: "Context.Provider 已简化，可直接使用 Context",
      },
      "defaultProps": {
        severity: "warning",
        replacement: "使用函数默认参数",
        message: "函数组件的 defaultProps 已不推荐",
      },
      "string refs": {
        severity: "warning",
        replacement: "使用 useRef 或 callback ref",
        message: "字符串 ref 已废弃",
      },
      "React.createFactory": {
        severity: "error",
        replacement: "直接使用 JSX 或 createElement",
        message: "createFactory 已被移除",
      },
      "React.PropTypes": {
        severity: "warning",
        replacement: "使用 TypeScript 或 prop-types 包",
        message: "React.PropTypes 已从主包移除",
      },
      "componentWillMount": {
        severity: "warning",
        replacement: "使用 constructor 或 componentDidMount",
        message: "componentWillMount 已废弃",
      },
      "componentWillReceiveProps": {
        severity: "warning",
        replacement: "使用 getDerivedStateFromProps",
        message: "componentWillReceiveProps 已废弃",
      },
      "componentWillUpdate": {
        severity: "warning",
        replacement: "使用 getSnapshotBeforeUpdate",
        message: "componentWillUpdate 已废弃",
      },
    };

    this.issues = [];
    this.stats = { errors: 0, warnings: 0, info: 0, checked: 0 };
  }

  // 扫描代码文件，检查废弃 API 使用
  scanFile(filename, code) {
    this.stats.checked++;
    const fileIssues = [];

    for (const [api, info] of Object.entries(this.deprecatedAPIs)) {
      if (code.includes(api)) {
        fileIssues.push({
          file: filename,
          api,
          severity: info.severity,
          message: info.message,
          replacement: info.replacement,
        });
      }
    }

    if (fileIssues.length > 0) {
      this.issues.push({ file: filename, issues: fileIssues });
    }

    return fileIssues;
  }

  // 统计问题
  summarize() {
    for (const { issues } of this.issues) {
      for (const issue of issues) {
        if (issue.severity === "error") this.stats.errors++;
        if (issue.severity === "warning") this.stats.warnings++;
        if (issue.severity === "info") this.stats.info++;
      }
    }
    return this.stats;
  }

  // 输出报告
  report() {
    const summary = this.summarize();
    console.log("\\n" + "═".repeat(55));
    console.log("📊 迁移检查报告");
    console.log("═".repeat(55));
    console.log(\`  扫描文件: \${summary.checked} 个\`);
    console.log(\`  错误 (必须修复): \${summary.errors} 个\`);
    console.log(\`  警告 (建议修复): \${summary.warnings} 个\`);
    console.log(\`  提示 (可选): \${summary.info} 个\`);

    for (const { file, issues } of this.issues) {
      console.log(\`\\n📄 \${file}:\`);
      for (const issue of issues) {
        const icon = issue.severity === "error" ? "❌" :
                     issue.severity === "warning" ? "⚠️" : "ℹ️";
        console.log(\`  \${icon} [\${issue.severity.toUpperCase()}] \${issue.api}\`);
        console.log(\`     原因: \${issue.message}\`);
        console.log(\`     替代: \${issue.replacement}\`);
      }
    }

    return summary;
  }
}

// ========== 阶段二：模拟项目文件扫描 ==========

console.log("═".repeat(55));
console.log("📗 React 18 → 19 迁移检查清单模拟");
console.log("═".repeat(55));

console.log("\\n🔍 扫描项目文件...\\n");

const checker = new MigrationChecker();

// 模拟 React 18 项目的多个文件（包含各种废弃 API）
const projectFiles = {
  "src/index.jsx": \`
    import ReactDOM from 'react-dom';
    import App from './App';
    
    ReactDOM.render(<App />, document.getElementById('root'));
  \`,

  "src/App.jsx": \`
    import { forwardRef } from 'react';
    
    const MyInput = forwardRef(function MyInput(props, ref) {
      return <input {...props} ref={ref} />;
    });
    
    MyInput.defaultProps = {
      type: 'text',
    };
    
    function App() {
      return <MyInput ref={inputRef} />;
    }
  \`,

  "src/legacy/LegacyComponent.jsx": \`
    class LegacyComponent extends React.Component {
      componentWillMount() {
        console.log('即将挂载');
      }
      
      componentWillReceiveProps(nextProps) {
        console.log('即将接收新 props');
      }
      
      componentWillUpdate() {
        console.log('即将更新');
      }
      
      render() {
        return <div ref="myDiv">Legacy</div>;
      }
    }
  \`,

  "src/context/ThemeContext.jsx": \`
    const ThemeContext = React.createContext('light');
    
    function App() {
      return (
        <ThemeContext.Provider value="dark">
          <Page />
        </ThemeContext.Provider>
      );
    }
  \`,

  "src/modern/Counter.jsx": \`
    import { useState, useRef } from 'react';
    
    function Counter({ label = '计数' }) {
      const [count, setCount] = useState(0);
      const btnRef = useRef(null);
      
      return (
        <button ref={btnRef} onClick={() => setCount(c => c + 1)}>
          {label}: {count}
        </button>
      );
    }
  \`,
};

// 扫描每个文件
for (const [filename, code] of Object.entries(projectFiles)) {
  const issues = checker.scanFile(filename, code);
  if (issues.length > 0) {
    console.log(\`  📄 \${filename}: \${issues.length} 个问题\`);
  } else {
    console.log(\`  ✅ \${filename}: 无问题\`);
  }
}

// 生成报告
checker.report();

// ========== 阶段三：生成迁移 diff ==========

console.log("\\n" + "═".repeat(55));
console.log("📝 迁移 Diff 预览");
console.log("═".repeat(55));

// 展示 React 18 → 19 的关键代码变更
const diffs = [
  {
    title: "入口文件：ReactDOM.render → createRoot",
    old: \`import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));\`,
    new: \`import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<App />);\`,
  },
  {
    title: "组件：forwardRef → ref prop",
    old: \`import { forwardRef } from 'react';
const MyInput = forwardRef(function MyInput(props, ref) {
  return <input {...props} ref={ref} />;
});\`,
    new: \`function MyInput({ ref, ...props }) {
  return <input {...props} ref={ref} />;
}\`,
  },
  {
    title: "Context：.Provider → 直接使用",
    old: \`<ThemeContext.Provider value="dark">
  <App />
</ThemeContext.Provider>\`,
    new: \`<ThemeContext value="dark">
  <App />
</ThemeContext>\`,
  },
  {
    title: "类组件：移除废弃生命周期",
    old: \`class MyComponent extends React.Component {
  componentWillMount() { /* ... */ }
  componentWillReceiveProps(nextProps) { /* ... */ }
  render() { return <div />; }
}\`,
    new: \`class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    // 用 constructor 替代 componentWillMount
  }
  static getDerivedStateFromProps(props, state) {
    // 用 getDerivedStateFromProps 替代 componentWillReceiveProps
    return null;
  }
  render() { return <div />; }
}\`,
  },
];

for (const diff of diffs) {
  console.log(\`\\n📌 \${diff.title}\`);
  console.log("-".repeat(40));
  console.log("旧代码 (React 18):");
  for (const line of diff.old.split("\\n")) {
    console.log(\`  - \${line}\`);
  }
  console.log("\\n新代码 (React 19):");
  for (const line of diff.new.split("\\n")) {
    console.log(\`  + \${line}\`);
  }
}

// ========== 阶段四：迁移步骤清单 ==========

console.log("\\n" + "═".repeat(55));
console.log("✅ React 18 → 19 迁移步骤清单");
console.log("═".repeat(55));

const steps = [
  { step: 1, task: "升级 Node.js 到 v18+ (推荐 v20+)", priority: "高" },
  { step: 2, task: "升级 react 和 react-dom 到 19.x", priority: "高" },
  { step: 3, task: "升级 @types/react 和 @types/react-dom 到 19.x", priority: "高" },
  { step: 4, task: "替换 ReactDOM.render → createRoot", priority: "高" },
  { step: 5, task: "替换 ReactDOM.hydrate → hydrateRoot", priority: "高" },
  { step: 6, task: "移除 unmountComponentAtNode / findDOMNode 调用", priority: "高" },
  { step: 7, task: "运行测试，修复 Breaking Changes 导致的失败", priority: "高" },
  { step: 8, task: "处理控制台中的废弃 API 警告", priority: "中" },
  { step: 9, task: "（可选）迁移 forwardRef → ref prop", priority: "低" },
  { step: 10, task: "（可选）迁移 Context.Provider → Context", priority: "低" },
  { step: 11, task: "（可选）迁移 defaultProps → 默认参数", priority: "低" },
  { step: 12, task: "（可选）迁移字符串 ref → useRef", priority: "低" },
  { step: 13, task: "检查第三方库 React 19 兼容性", priority: "高" },
  { step: 14, task: "启用新特性：Server Components / Server Actions", priority: "低" },
  { step: 15, task: "更新 CI/CD 配置中的 Node 版本", priority: "中" },
  { step: 16, task: "部署到预发布环境，进行完整回归测试", priority: "高" },
];

for (const s of steps) {
  const icon = s.priority === "高" ? "🔴" : s.priority === "中" ? "🟡" : "🟢";
  console.log(\`  \${icon} \${s.step}. [\${s.priority}] \${s.task}\`);
}

// ========== 阶段五：总结 ==========

console.log("\\n" + "═".repeat(55));
console.log("📚 迁移总结");
console.log("═".repeat(55));
console.log("1. 先升级依赖，确保应用能跑起来");
console.log("2. 修复所有 Breaking Changes（错误级别），应用才能正常运行");
console.log("3. 处理废弃 API 警告（警告级别），为未来版本做准备");
console.log("4. 逐步采用新特性（ref prop、Context 简化等），渐进式改善");
console.log("5. 充分利用 React 19 的 Server Components 和 Server Actions");
console.log("6. 迁移不是一次性任务——可以分阶段进行，降低风险");
console.log("\\n💡 提示：React 19 向后兼容大多数 React 18 API。");
console.log("   可以先升级依赖，保持旧代码不变，再逐步迁移到新 API。");
`,
  },
];