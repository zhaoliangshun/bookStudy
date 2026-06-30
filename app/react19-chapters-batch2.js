// =============================================================
// React 19 新特性交互式教程 —— 第二批章节（新 API 与改进组，共 5 章）
// -------------------------------------------------------------
// 覆盖 React 19 核心新 API：use() API、ref 作为 prop、Document Metadata
// React Compiler 自动 memo、资源预加载 API。
// 所有 code 字段为可在 Node 沙箱运行的纯 JS（不依赖 react），
// 用 console.log 模拟演示底层原理。
// =============================================================

export const chapters = [
  {
    id: "react19-use-hook",
    title: "use() API",
    icon: "🎣",
    group: "新 API 与改进",
    content: `## 一、什么是 use() API

React 19 最重要的新 API 就是 \`use()\`，它打破了 React Hooks 延续多年的一条核心规则：**不能在条件判断和循环中调用 Hooks**。

\`use()\` 是一个「读取式」Hook，它可以读取两种东西：
- **Promise**：配合 Suspense 实现异步数据获取
- **Context**：在条件/循环中读取 Context 值

传统 React Hooks 必须在组件顶层调用，因为 React 需要依赖调用顺序来保存 Hook 状态。\`use()\` 为什么能打破这个规则？因为它**不保存自己的状态**——它只是读取已存在的资源或上下文，React 在 Fiber 树中追踪这些资源，而不是依赖 \`use()\` 的调用顺序。

## 二、use(promise)：配合 Suspense 读取异步数据

最常见的用法是在组件中直接读取 Promise：

\`\`\`jsx
function Post({ id }) {
  // 直接在条件判断中调用 use()
  if (id) {
    const post = use(fetchPost(id));
    return <div>{post.title}</div>;
  }
  return null;
}

// 父组件用 Suspense 兜底加载状态
function App() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <Post id={1} />
    </Suspense>
  );
}
\`\`\`

当 \`use(promise)\` 第一次调用时，如果 Promise 还没 resolve，React 会**抛出这个 Promise**，就像你在 React 18 之前用 Suspense 时那样。Suspense 边界捕获到这个抛出后，就会显示 fallback。等 Promise resolve 了，React 会重新渲染组件，这时候就能拿到 resolved 值了。

这对比 React 18 之前的写法：

\`\`\`jsx
// React 18 之前，必须把所有数据请求提升到组件外部
const postPromise = fetchPost(id);

function Post() {
  const post = use(postPromise);
  return <div>{post.title}</div>;
}
\`\`\`

现在 \`use()\` 允许你在**组件内部、任意位置**发起请求，React 会自动处理 Suspense 集成。

## 三、use(context)：条件读取 Context

\`use()\` 也可以读取 Context：

\`\`\`jsx
function Component() {
  if (condition) {
    const value = use(MyContext);
    return <div>{value}</div>;
  }
  return null;
}
\`\`\`

对比传统的 \`useContext\`：

| 特性 | \`useContext(Context)\` | \`use(Context)\` |
|------|-------------------------|------------------|
| 调用位置 | 必须顶层 | 可以在条件/循环中 |
| 动态切换 | 需要闭包封装 | 直接判断 |
| 依赖调用顺序 | 是 | 否 |

核心区别：\`use()\` 只是读取，不占 Hook 调用槽位。你甚至可以在同一个组件里多次用不同条件读取同一个 Context：

\`\`\`jsx
function MultiReader({ theme, config }) {
  let result;
  if (theme) {
    result = use(ThemeContext); // 没问题
  }
  if (config) {
    result = use(ConfigContext); // 也没问题
  }
  return <div>{result}</div>;
}
\`\`\`

这种写法用 \`useContext\` 是做不到的，因为调用顺序会乱。

## 四、实际使用场景

### 1. 条件懒加载数据
\`\`\`jsx
function UserProfile({ userId, showProfile }) {
  // 只在需要时才请求数据
  if (showProfile && userId) {
    const profile = use(fetchUserProfile(userId));
    return <ProfileCard data={profile} />;
  }
  return null;
}
\`\`\`

### 2. 根据配置决定读取哪个 Context
\`\`\`jsx
function Button({ variant, children }) {
  // 根据 variant 动态选择主题
  const theme = variant === 'primary' ? use(PrimaryThemeContext) : use(SecondaryThemeContext);
  return <button style={theme}>{children}</button>;
}
\`\`\`

### 3. 循环中批量请求
\`\`\`jsx
function PostList({ ids }) {
  return (
    <div>
      {ids.map(id => {
        // 循环中调用，对 use() 来说完全合法
        const post = use(fetchPost(id));
        return <Post key={id} data={post} />;
      })}
    </div>
  );
}
\`\`\`

### 4. 在自定义 Hook 中条件读取
\`\`\`jsx
function useFeatureFlag(name) {
  const client = use(FeatureFlagContext);
  if (!client) {
    return false; // 默认值，不用强制提供 Provider
  }
  return use(client.getValue(name));
}
\`\`\`

## 底层原理

React 内部如何追踪 \`use()\` 的调用？

1. **Promise 读取流程**：
   - React 在当前 Fiber 的 \`pendingBailouts\` 集合中记录已经见过的 Promise
   - 当 \`use(promise)\` 调用时，如果 Promise 已 resolve，直接返回值
   - 如果未 resolve，检查是否已经抛出过：没抛过就 throw promise，Suspense 捕获后开始等待；抛过就继续挂起
   - Promise resolve 后，React 会重新渲染这个分支，此时就能拿到值

2. **Context 读取流程**：
   - 传统 \`useContext\` 会在 Hook 链表中存一个「订阅者」引用，用于变化时强制更新
   - \`use(context)\` 不存引用，它每次渲染都直接从 Fiber 树向上查找最近 Provider —— 和 Class 组件中 \`contextType\` 的查找方式类似
   - 由于 Context 变化会导致所有消费它的祖先重渲染，查找结果永远是最新的，不需要缓存

3. **throw 机制与 Suspense 交互**：
   - React 渲染过程本质是一个递归遍历 Fiber 树的循环
   - 如果某一层组件 throw 了 Promise，React 会停止当前深度遍历，往上找最近的 Suspense 边界
   - 找到后，把这个 Suspense 标记为「挂起」，渲染 fallback，剩下的子树暂时不处理
   - Promise resolve 后，React 重新从 Suspense 边界开始渲染，这次就能拿到值继续往下走

## 常见陷阱

1. **\`use(promise)\` 会导致组件挂起，必须有 Suspense 覆盖**
   - 如果上层没有 Suspense，Promise 未 resolve 时会渲染失败，整个应用都会挂掉
   - 解决方案：确保任何可能抛出 Promise 的 \`use()\` 调用上层都有 Suspense

2. **每次重渲染都会重新调用 \`use(promise)\`，容易重复请求**
   - 如果写成 \`use(fetchPost(id))\`，每次重渲染都会发起新请求
   - 解决方案：用 \`useMemo\` 缓存 Promise：\`const postPromise = useMemo(() => fetchPost(id), [id]); use(postPromise);\`

3. **错误处理还是需要 ErrorBoundary**
   - 如果 Promise reject，\`use()\` 会抛出错误，必须由 ErrorBoundary 捕获
   - 不要指望 Suspense 处理错误，它只处理加载状态

4. **不要把 \`use()\` 用在事件处理中**
   - 渲染过程外调用 \`use()\` 没有意义，React 无法捕获 throw 且找不到当前 Fiber
   - 只能在渲染过程（组件函数或 Hook 函数）中使用

## 性能提示

1. **批量请求可以利用 Promise.all 并发**
   - 多个 \`use()\` 会依次抛出，但 Promise.all 可以让多个请求并发等待：
   \`\`\`jsx
   const [a, b] = use(Promise.all([fetchA(), fetchB()]));
   \`\`\`
   这样只触发一次 Suspense  fallback，而不是两次。

2. **提前发起请求，配合 React 渲染流水线**
   - 在路由变化时就可以发起请求，而不是等组件渲染才开始
   - 服务端渲染场景下，提前预取数据可以让 HTML 直接包含渲染结果

3. **Context 频繁变化时，\`use()\` 比 \`useContext\` 略慢**
   - 因为每次渲染都要重新从 Fiber 树向上查找，而 \`useContext\` 是从 Hook 缓存直接读
   - 对于非常频繁变化的 Context，还是推荐用 \`useContext\`

4. **循环中使用时，尽量保持调用稳定**
   - 虽然允许循环，但每次循环次数变化都意味着不同的读取路径，React 需要重新处理挂起状态
   - 合理拆分 Suspense 边界可以避免整个页面 fallback
`,
    code: `// 纯 JS 模拟 use() API 的核心原理
// 在 Node 环境运行，演示 throw promise 和 Context 查找机制

// 模拟 Suspense 边界捕获
let currentSuspense = null;
let thrownPromises = new WeakMap();

// 模拟 Context 和 Provider 栈
const contextStack = [];

function use(resource) {
  // 处理 Promise
  if (resource instanceof Promise) {
    if (thrownPromises.has(resource)) {
      // 已经 resolve，返回结果
      return thrownPromises.get(resource);
    }
    if (resource.status === 'fulfilled') {
      return resource.value;
    }
    // 未 resolve，throw 给 Suspense 捕获
    throw resource;
  }

  // 处理 Context：从栈顶向下查找最近 Provider
  for (let i = contextStack.length - 1; i >= 0; i--) {
    const entry = contextStack[i];
    if (entry.context === resource) {
      console.log(\`[use] 找到 Context \${resource.name} = \${JSON.stringify(entry.value)}\`);
      return entry.value;
    }
  }
  throw new Error(\`找不到 Context Provider\`);
}

// 模拟创建 Context
function createContext(defaultValue, name) {
  const context = { defaultValue, name };
  return context;
}

// 模拟 Provider 入栈
function pushProvider(context, value) {
  contextStack.push({ context, value });
}

// 模拟出栈
function popProvider() {
  return contextStack.pop();
}

// 模拟 Promise 完成后缓存结果
function resolvePromise(promise, value) {
  thrownPromises.set(promise, value);
  console.log(\`[use] Promise 已 resolve，缓存结果\`, value);
}

// 测试：读取 Context
const ThemeContext = createContext({ dark: false }, 'ThemeContext');
pushProvider(ThemeContext, { dark: true });

try {
  const theme = use(ThemeContext);
  console.log('读取到 theme:', theme);
} catch (e) {
  console.error('读取 Context 失败:', e);
}

popProvider();

// 测试：读取 Promise
const delay = (ms) => new Promise(resolve => setTimeout(() => resolve({ data: 'Hello React 19' }), ms));
const promise = delay(1000);

try {
  const result = use(promise);
  console.log('Promise 已完成，结果:', result);
} catch (thrown) {
  console.log('捕获到未完成 Promise，等待 resolve...');
  // 模拟 Suspense 等待
  setTimeout(() => {
    resolvePromise(thrown, { data: 'Hello React 19' });
    console.log('可以重新渲染了');
  }, 1000);
}
`
  },
  {
    id: "react19-ref-prop",
    title: "ref 作为 prop（不再需要 forwardRef）",
    icon: "🔗",
    group: "新 API 与改进",
    content: `## 一、为什么要把 ref 变成普通 prop

React 19 之前，\`ref\` 是一个特殊关键字，不能直接作为组件 prop 接收。如果你想让子组件拿到父组件传入的 ref，必须用 \`React.forwardRef\` 包装：

\`\`\`jsx
// React 18 及之前
const MyInput = React.forwardRef((props, ref) => {
  return <input ref={ref} />;
});

// 使用
function App() {
  const inputRef = useRef(null);
  return <MyInput ref={inputRef} />;
}
\`\`\`

这个设计一直被开发者吐槽：
- **语法冗余**：多了一层包装，代码不直观
- **TypeScript 复杂**：forwardRef 的类型推导非常麻烦
- **容易遗忘**：新手经常忘了包 forwardRef 导致 ref 拿不到
- **自定义 Hook 传递 ref 更麻烦**

React 19 直接解决了这个问题：**ref 现在可以像普通 prop 一样传递了**，不再需要 forwardRef。

## 二、React 19 的新写法

直接把 ref 当 prop 用：

\`\`\`jsx
// React 19 新写法
function MyInput({ ref }) {
  return <input ref={ref} />;
}

// 使用
function App() {
  const inputRef = useRef(null);
  return <MyInput ref={inputRef} />;
}
\`\`\`

就这么简单！\`ref\` 就是一个普通的 prop，名字就叫 \`ref\`，和其他 prop 没有区别。

## 三、ref callback 支持 cleanup 函数

React 19 还给 ref callback 增加了一个重要改进：**如果 ref callback 返回一个函数，React 会在清理时调用它**。

\`\`\`jsx
<div ref={(node) => {
  // 绑定的时候执行
  console.log('节点挂载', node);
  // 返回清理函数，卸载时执行
  return () => {
    console.log('节点卸载，清理资源');
  };
}} />
\`\`\`

这个改进对于需要监听 DOM 尺寸、动画等场景非常有用，你不需要再在 \`useEffect\` 里写清理逻辑，直接把清理交给 React。

对比以前的写法：

\`\`\`jsx
// React 18 之前，ref callback 不支持返回清理函数
// 必须自己用 useEffect 保存引用并清理
useEffect(() => {
  measure(ref.current);
  return () => {
    unmeasure(ref.current);
  };
}, []);
\`\`\`

现在直接写在 ref callback 里就行。

## 四、迁移指南

- **forwardRef 仍然可用**：React 19 没有删除 forwardRef，旧代码不需要立即迁移
- **不推荐继续使用**：新项目直接用 ref prop 就好，更简洁
- **混合使用没问题**：同一个项目中，既有 forwardRef 包装的组件，也有直接接受 ref prop 的组件，完全兼容

迁移步骤：
1. 把 \`forwardRef((props, ref) => { ... })\` 改成 \`function Component({ ref }) { ... }\`
2. 删除对 forwardRef 的导入
3. 测试能正常拿到 ref 就完成了

## 五、与 TypeScript 配合

React 19 中 TypeScript 写法也简化了：

\`\`\`tsx
// React 19
type MyInputProps = {
  label: string;
  ref?: Ref<HTMLInputElement>;
};

function MyInput({ ref, label }: MyInputProps) {
  return <input ref={ref} />;
}
\`\`\`

对比 React 18：

\`\`\`tsx
// React 18
type MyInputProps = {
  label: string;
};

const MyInput = forwardRef<HTMLInputElement, MyInputProps>(({ label }, ref) => {
  return <input ref={label} />;
});
\`\`\`

以前必须用泛型传给 forwardRef，现在直接在 props 类型里定义 \`ref\` 就可以了，直观很多。

## 底层原理

React 19 之前，为什么 ref 必须特殊处理？

在 React 19 之前的设计中：
- JSX 编译时，\`<Component ref={x} />\` 会把 \`ref\` 单独提取出来，不放到 \`props\` 对象里
- ref 会作为第二个参数传给 forwardRef 包装后的函数
- 这个设计是从 React 早期延续下来的，当时认为 ref 是「特殊」的，不该和普通 props 混在一起

React 19 改变了这个处理流程：

1. **JSX 编译阶段**：\`ref\` 不再被特殊提取，和其他 prop 一起放进 props 对象
2. **协调阶段**：对于原生 DOM 元素（如 \`<input>\`），React 仍然会特殊处理 ref 赋值——在 commit 阶段把 DOM 节点赋值给 ref.current 或调用 ref callback
3. **对于自定义组件**：如果组件函数接收 \`ref\` prop，就直接传进去，React 不做额外处理；如果不接收，什么也不做
4. **cleanup 处理**：commit 阶段，当节点需要更新或卸载时，React 检查旧的 ref 是不是函数，并且这个函数在上一次调用时返回了另一个函数——如果是，就调用返回的那个函数做清理

所以核心变化只有一个：**把 ref 从 "特殊提取出来当第二个参数" 改成 "留在 props 里"**，没有更多魔法了。

## 常见陷阱

1. **不要同时用 forwardRef 和 ref prop**
   - 如果你已经用了 forwardRef，就不要再在 props 里声明 \`ref\`，会导致重复接收
   - 迁移时要彻底把 forwardRef 去掉

2. **解构 props 时不要漏掉 ref**
   - 以前不用解构 ref（因为它在第二个参数），现在别忘了：\`function Component({ children, ref }) { ... }\`

3. **高阶组件要透传 ref prop**
   - 以前 HOC 透传 ref 需要用 \`React.forwardRef\` 转发
   - 现在直接透传 props 就行：\`function HOC(props) { return <InnerComponent {...props} />; }\`，ref 自然就透过去了

4. **cleanup 函数只有 ref callback 才有**
   - \`useRef\` 创建的 ref 对象，不会调用 cleanup，只有当你传函数作为 ref 时才生效
   - 如果你用 ref 对象，清理逻辑还是要放在 \`useEffect\` 里

## 性能提示

1. **内联 ref callback 每次渲染都会重新执行**
   - 和以前一样，如果你写成 \`<div ref={() => {}} />\`，每次重渲染都会先调用旧函数的 cleanup，再调用新函数
   - 如果不需要 cleanup，用 \`useCallback\` 缓存可以避免重复执行

2. **利用 cleanup 减少 useEffect 代码**
   - 需要测量 DOM、监听滚动、绑定第三方库时，直接在 ref callback 里做并返回清理函数
   - 减少了一个 useEffect 的依赖处理，代码更紧凑，性能更好（少一次副作用执行）

3. **第三方 UI 库迁移：逐步替换 forwardRef**
   - 不需要一次性全改，可以保持 forwardRef 同时导出，兼容新旧用法
   - TypeScript 中可以用交叉类型同时支持两种方式，不会 break 不兼容

4. **ref 就是普通 prop，可以正常做解构默认值**
   - \`function Button({ ref = null }) { ... }\` 完全没问题
   - 以前不能这么做，因为 ref 不在 props 里
`,
    code: `// 纯 JS 模拟 ref 作为 prop 的传递机制
// 演示从 props 识别 ref、绑定到 DOM、支持 cleanup 回调

// 模拟 DOM 节点
class DomNode {
  constructor(tagName) {
    this.tagName = tagName;
  }
}

// 模拟 Fiber 中的 ref 处理
function processCustomComponent(component, props) {
  // React 19：ref 就在 props 里，直接传给组件函数
  console.log(\`[process] 传递 ref prop 给自定义组件，值 = \${props.ref}\`);
  return component(props);
}

// 模拟原生 DOM 的 ref 处理（带 cleanup）
let lastRef = null;
let lastCleanup = null;

function attachRefToDom(domNode, newRef) {
  // 清理旧的 ref：如果旧 ref 是函数且返回了 cleanup，调用它
  if (lastCleanup) {
    console.log('[attach] 调用旧 ref 的 cleanup 函数');
    lastCleanup();
    lastCleanup = null;
  }

  if (lastRef && typeof lastRef === 'object' && lastRef !== null) {
    // ref 对象，清空 current
    lastRef.current = null;
  }

  // 绑定新的 ref
  if (typeof newRef === 'function') {
    const result = newRef(domNode);
    if (typeof result === 'function') {
      // 返回了 cleanup，保存起来
      lastCleanup = result;
      console.log('[attach] ref callback 返回 cleanup，已保存');
    }
  } else if (newRef && typeof newRef === 'object') {
    newRef.current = domNode;
    console.log(\`[attach] 赋值给 ref 对象，current = \${domNode.tagName}\`);
  }

  lastRef = newRef;
}

// 测试 1：自定义组件接收 ref prop
function MyInput({ ref, label }) {
  console.log(\`MyInput 收到 label = "\${label}", ref = \${ref}\`);
  // 把 ref 转发给内部 input
  const inputNode = new DomNode('input');
  attachRefToDom(inputNode, ref);
  return inputNode;
}

const myRef = { current: null };
const result = processCustomComponent(MyInput, { ref: myRef, label: '用户名' });
console.log('处理完成，myRef.current =', myRef.current.tagName);

// 测试 2：ref callback 带 cleanup
console.log('\\n--- 测试 ref callback cleanup ---');
const divNode = new DomNode('div');
attachRefToDom(divNode, (node) => {
  console.log(\`ref callback 被调用，node = \${node.tagName}\`);
  return () => {
    console.log(\`cleanup 被调用，清理 \${node.tagName}\`);
  };
});

// 更新 ref，触发 cleanup
const newDivNode = new DomNode('div');
attachRefToDom(newDivNode, (node) => {
  console.log(\`新 ref callback 被调用，node = \${node.tagName}\`);
});
`
  },
  {
    id: "react19-document-metadata",
    title: "Document Metadata 原生支持",
    icon: "🏷️",
    group: "新 API 与改进",
    content: `## 一、原生支持 title/meta/link

React 19 现在原生支持在组件树的**任意位置**渲染 \`<title>\`、\`<meta>\`、\`<link>\` 标签，React 会自动把它们提升到 \`<head>\` 中。

也就是说，你再也不需要 \`react-helmet\`、\`next/head\` 这类第三方库来管理页面元数据了。

\`\`\`jsx
function BlogPost() {
  return (
    <article>
      <title>React 19 新特性详解 - My Blog</title>
      <meta name="description" content="React 19 带来了很多激动人心的新特性，本文详细讲解..." />
      <link rel="canonical" href="https://myblog.com/post/react19" />
      <h1>React 19 新特性详解</h1>
      {/* ... 文章内容 ... */}
    </article>
  );
}
\`\`\`

不管 \`<title>\` 在组件树的多深位置，React 都会自动把它提取出来放到 \`document.head\` 里。

## 二、为什么这很重要

在 React 19 之前，管理 document metadata 一直是个痛点：

- **服务端渲染（SSR）需要正确的 head 内容**：搜索引擎依赖 title 和 meta 标签做 SEO
- **不同页面需要不同的 title/description**：单页应用切换路由后需要更新
- **第三方库增加包体积**：react-helmet 有一定的代码量，还需要适配 SSR
- **容易出 bug**：客户端和服务端的 head 不同步，title 不更新等问题

React 19 把这个能力内置了，彻底解决了这些问题。

## 三、支持的标签

React 19 原生支持提升这些标签到 head：

- \`<title>\` - 页面标题
- \`<meta>\` - 各种元数据（description、og:xxx、viewport 等）
- \`<link>\` - 链接标签（rel="canonical"、rel="preload"、stylesheet 等）

任何其他标签（比如 \`<script>\`、\`<style>\`）不会被提升，仍然留在原来渲染的位置。如果你需要在 head 里放 script，还是需要手动操作 DOM。

## 四、基本用法示例

### 动态页面标题
\`\`\`jsx
function ProductPage({ product }) {
  return (
    <>
      <title>{product.name} - My Store</title>
      <meta name="description" content={product.description} />
      <div>
        {/* 产品详情 */}
      </div>
    </>
  );
}
\`\`\`

### Open Graph 社交分享
\`\`\`jsx
function BlogPost({ post }) {
  return (
    <>
      <title>{post.title}</title>
      <meta property="og:title" content={post.title} />
      <meta property="og:image" content={post.coverImage} />
      <meta property="og:url" content={post.url} />
      <meta name="twitter:card" content="summary_large_image" />
      {/* 文章内容 */}
    </>
  );
}
\`\`\`

### 预加载字体
\`\`\`jsx
function App() {
  return (
    <>
      <link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <Component />
    </>
  );
}
\`\`\`

## 五、SSR 支持

React 19 的服务端渲染会直接把 metadata 渲染到最终 HTML 的 \`<head>\` 里，不需要任何额外处理。

这意味着：
- SEO 直接生效，搜索引擎爬取就能看到正确的 title 和 meta
- 首屏打开就是正确的页面标题，不会闪烁
- 不需要在服务端做额外的收集逻辑（react-helmet 需要手动抽 head 数据）

在流式 SSR 中，React 也能正确处理——组件流过来，metadata 自动更新到 head。

## 底层原理

React 如何实现自动提升？分客户端渲染和服务端渲染两种情况：

### 客户端渲染流程：

1. **渲染阶段收集**：当 React 在渲染过程中遇到 \`<title>\`、\`<meta>\`、\`<link>\` 这些特殊标签时，它不会真的在当前位置创建 DOM 节点，而是先把它们收集到一个全局队列里。

2. **commit 阶段提升**：整个树渲染完成后，React 会把收集到的所有 metadata 元素依次处理，合并相同 key 的标签（比如后面的 \`<title>\` 会覆盖前面的），然后一次性更新到 \`document.head\`。

3. **去重和覆盖策略**：React 用标签的属性来判断是不是同一个 metadata：
   - \`<title>\`：整个文档只保留最后一个
   - \`<meta>\`：如果有相同的 \`name\` 或 \`property\`，后面的覆盖前面的
   - \`<link>\`：如果有相同的 \`rel\` 和 \`href\`，去重保留一个

4. **清理**：当渲染 metadata 的组件卸载时，React 会自动从 head 中移除对应的标签，如果还有其他组件提供了同名标签，会恢复成那个版本。

### 服务端渲染流程：

1. 渲染整个 React 树时，React 一边渲染一边收集所有 metadata 标签
2. 渲染完成后，把收集到的 metadata 注入到 HTML 的 \`<head>\` 部分一起输出
3. 客户端 hydration 时，React 匹配已有的 metadata，不需要重新创建，直接复用

整个过程对开发者完全透明，不需要任何 API 调用。

## 常见陷阱

1. **多个组件都写 title，哪个生效？**
   - 最后渲染的那个 title 生效，后面的覆盖前面的
   - 如果嵌套路由，子页面的 title 会覆盖父页面的，符合预期

2. **viewport meta 标签写错位置会导致问题**
   - 通常 viewport 只需要在 HTML 模板里写一次就够了
   - 如果组件里又写了一个，会覆盖模板里的，可能导致缩放错误

3. **react-helmet 还能用吗？**
   - 能用，React 19 不破坏它，它仍然会工作
   - 新项目可以直接用原生支持，减少一个依赖

4. **自定义 meta 属性能用吗？**
   - 能用，任何属性都支持，React 只会提升标签，不会校验属性
   - 自定义 data-* 属性完全没问题

5. **\`<link rel="stylesheet">\` 也会提升到 head，对吗？**
   - 对，link 标签不管 rel 是什么都会提升
   - 如果你想在 body 里放 link，这做不到，所有 link 都会去 head

## 性能提示

1. **把公共 metadata 放在根组件一次写好**
   - 比如 viewport、charset 这些全局不变的，放在 HTML 模板里就行，不用每个组件都写
   - 只把页面级可变的 metadata（title、description）放在页面组件里

2. **避免同一个 key 在多个组件中同时渲染**
   - 虽然覆盖机制能工作，但每次更新都需要修改 head，带来不必要的 DOM 操作
   - 同一个 name 的 meta 只在一个地方定义最好

3. **预加载关键资源**
   - 利用 \`<link rel="preload">\` 在 JS 加载前就开始加载字体、图片等关键资源
   - React 原生提升比手动注入 head 更可靠，不会遗漏

4. **卸载会自动清理，不需要手动清理**
   - 当组件卸载，React 自动移除它贡献的 metadata，恢复之前的状态
   - 路由切换时，前一个页面的 title 会自动被后一个页面替换，正常工作
`,
    code: `// 纯 JS 模拟 Document Metadata 提升机制
// 演示收集、去重、应用到 head 的过程

// 模拟 document.head
const simulatedHead = [];
const componentEntries = new Map();

// 判断是否需要提升到 head
function shouldLiftToHead(tagName) {
  return ['title', 'meta', 'link'].includes(tagName.toLowerCase());
}

// 生成 metadata 的 key（用于去重和覆盖）
function getMetadataKey(tagName, props) {
  if (tagName === 'title') return 'title';
  if (tagName === 'meta') {
    return \`meta:\${props.name || props.property || JSON.stringify(props)}\`;
  }
  if (tagName === 'link') {
    return \`link:\${props.rel}:\${props.href}\`;
  }
  return null;
}

// 收集 metadata（渲染阶段调用）
function collectMetadata(componentId, metadataList) {
  const entries = [];
  for (const { tagName, props } of metadataList) {
    const key = getMetadataKey(tagName, props);
    entries.push({ key, tagName, props });
  }
  componentEntries.set(componentId, entries);
  console.log(\`[collect] 组件 \${componentId} 收集了 \${entries.length} 个 metadata\`);
}

// 合并所有收集到的 metadata 并应用到 head
function applyToHead() {
  const merged = new Map();

  // 按组件顺序合并，后面的覆盖前面的
  for (const [componentId, entries] of componentEntries) {
    for (const entry of entries) {
      merged.set(entry.key, entry);
    }
  }

  // 清空模拟 head 并重新应用
  simulatedHead.length = 0;
  for (const entry of merged.values()) {
    simulatedHead.push(entry);
  }

  console.log(\`[apply] 合并完成，head 中共有 \${simulatedHead.length} 个 metadata:\`);
  simulatedHead.forEach((entry, i) => {
    console.log(\`  \${i + 1}. <\${entry.tagName}> key = \${entry.key}\`);
  });
}

// 移除组件的 metadata（卸载时调用）
function removeComponent(componentId) {
  componentEntries.delete(componentId);
  applyToHead();
  console.log(\`[remove] 移除组件 \${componentId} 的 metadata\`);
}

// 测试：首页组件
collectMetadata('HomePage', [
  { tagName: 'title', props: { children: '首页 - 我的网站' } },
  { tagName: 'meta', props: { name: 'description', content: '欢迎来到我的网站' } },
]);
applyToHead();

// 测试：进入文章页，文章页也有 metadata
console.log('\\n--- 进入文章页 ---');
collectMetadata('BlogPost', [
  { tagName: 'title', props: { children: 'React 19 原生支持 Metadata' } },
  { tagName: 'meta', props: { name: 'description', content: 'React 19 原生支持在组件中写 title/meta/link，自动提升到 head' } },
  { tagName: 'meta', props: { property: 'og:title', content: 'React 19 原生支持 Metadata' } },
  { tagName: 'link', props: { rel: 'canonical', href: 'https://example.com/post/1' } },
]);
applyToHead();

// 测试：文章页卸载，回到首页
console.log('\\n--- 回到首页 ---');
removeComponent('BlogPost');
`
  },
  {
    id: "react19-compiler",
    title: "React Compiler（自动 Memo）",
    icon: "🧠",
    group: "新 API 与改进",
    content: `## 一、什么是 React Compiler

React Compiler，原名 **React Forget**，是 React 团队开发的一个**编译器插件**，它能自动帮你给组件和 Hooks 加上 memo，优化重渲染性能。

简单说：
- 以前你需要手动写 \`useMemo\`、\`useCallback\`、\`memo\` 来避免不必要的重渲染
- 现在 React Compiler 在编译阶段自动分析你的代码，帮你加上这些 memo 包装
- 你不用手写了，编译器比你更懂哪里需要 memo

React 19 不强制启用，但官方强烈推荐在项目中打开它。

## 二、为什么需要自动 memo

React 的渲染机制是：**父组件重渲染，所有子组件默认都会跟着重渲染**，不管 props 有没有变。

要优化，开发者必须手动 memo：

\`\`\`jsx
// 手动 memo 的世界
const Button = memo(function Button({ onClick, label }) {
  // 只有 props 浅比较不变，才会跳过重渲染
  return <button onClick={onClick}>{label}</button>;
});

function Form() {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  const expensiveValue = useMemo(() => {
    return calculateExpensiveValue(a, b);
  }, [a, b]);

  return <Button onClick={handleClick} label="Submit" />;
}
\`\`\`

问题在于：
- **开发者容易忘写**：很多地方该 memo 的没写，导致多余重渲染
- **写多了也不好**：到处都是 memo，代码可读性变差，实际上很多 memo 本身也有开销
- **依赖数组容易写错**：少依赖会导致缓存旧值，多依赖会导致 memo 不生效

React Compiler 彻底解决这个问题——编译器来做静态分析，自动插 memo，你只管写业务逻辑。

## 三、编译器怎么工作

React Compiler 工作在**编译阶段**，它做这几件事：

1. **依赖分析**：分析每个组件、每个 Hook 的数据流，找出哪些值在重渲染时是稳定的（引用不会变），哪些会变
2. ** memo 插入**：在需要 memo 的地方自动插入等价的 memo 包装，确保只有依赖变化时才重新计算
3. **保留语义**：保证自动生成的 memo 和你手动写的行为完全一致，不会改变程序逻辑

举个例子，你写：

\`\`\`jsx
function SearchResults({ query, page }) {
  const results = search(query, page);
  const sorted = sortResults(results);
  return <List results={sorted} />;
}
\`\`\`

React Compiler 编译后大概变成：

\`\`\`jsx
function SearchResults({ query, page }) {
  const results = useMemo(() => search(query, page), [query, page]);
  const sorted = useMemo(() => sortResults(results), [results]);
  return useMemo(() => <List results={sorted} />, [List, sorted]);
}

SearchResults = memo(SearchResults);
\`\`\`

但编译器比这更聪明——它能看出哪些真的需要 memo，哪些不需要，不会盲目加。

## 四、和手动 memo 的关系

- **不冲突**：你仍然可以手写 memo，编译器会尊重你手动写的 memo
- **不需要都删**：已有代码中的手动 memo 不需要删除，编译器兼容
- **编译器更准确**：很多时候编译器能找到你没注意到的 memo 机会，也会删掉不必要的 memo（如果编译器发现不需要，就不会加）
- **渐进式启用**：可以在部分文件/部分项目启用，不需要一次性全转

## 五、性能收益

根据 React 团队的测试，启用 React Compiler 后：
- 大型应用通常能获得 **10-20%** 的性能提升
- 某些场景下（复杂表格、大列表）提升更大
- 减少了开发者手动优化的时间，降低了心智负担

你不用再花时间想"这里要不要加 memo"——编译器帮你想好了。

## 底层原理

React Compiler 的核心是**静态数据流分析**，它怎么知道哪里需要 memo？

### 1. 构建控制流图

编译器把你的组件函数转换成「控制流图」，遍历所有可能的执行路径，追踪每个变量的来源和变化。

### 2. 追踪记忆化边界

编译器给每个值打上「存储位置」标签：
- **不变值**：来自 props 的属性没有被重新创建，引用稳定
- **可变值**：在渲染过程中新建的对象/数组/函数，每次渲染引用都会变
- **依赖值**：依赖于某些 props 或 state，只有依赖变了才需要重新计算

### 3. 识别可缓存表达式

如果一个表达式的所有依赖都没有变化，那么它的计算结果一定不变，可以缓存。编译器会把这种表达式包在 \`useMemo\` 里。

如果一个函数的依赖都没变化，包在 \`useCallback\` 里。

如果一个组件的所有 props 都是稳定的，包在 \`memo\` 里。

### 4. 处理闭包和 Hooks

React Compiler 理解 React Hooks 规则，它知道：
- \`useState\` 返回的 setState 函数引用是稳定的（永远不变）
- \`useRef\` 的 current 可变，但 ref 对象本身稳定
- 自定义 Hook 返回的函数哪些会变，哪些稳定

基于这些知识，编译器能更准确地判断依赖，不会错误缓存。

### 5. 保守原则

React Compiler 遵循**保守原则**：**如果它不能 100% 确定缓存安全，就不缓存**。

这意味着：
- 永远不会因为缓存导致 bug
- 最坏情况就是没有优化，不会改变程序行为
- 只会增加一点编译时间，运行时完全安全

## 常见陷阱

1. **React Compiler 不能解决所有性能问题**
   - 它只能解决「不必要重渲染」问题
   - 如果问题出在算法复杂度太高、大量 DOM 操作，还是需要手动优化

2. **依赖可变外部变量还是有问题**
   - 如果你的代码依赖组件外部的全局变量，编译器无法追踪变化
   - 还是要把可变数据放到组件内部或 props 里

3. **不要为了让编译器优化改变代码结构**
   - 编译器能处理绝大多数常见写法，不需要刻意写"编译器友好"的代码
   - 保持代码可读性更重要

4. **开发环境编译会变慢一点**
   - 因为要做静态分析，编译时间会比不用时稍长
   - 这是正常的，生产环境还是会做压缩优化，运行时没有额外开销

5. **不是所有项目都需要**
   - 小型项目本来就没多少重渲染，收益不大
   - 大型项目、复杂交互的项目收益最明显

## 性能提示

1. **尽早在项目中启用**
   - React Compiler 已经稳定，React 19 推荐默认启用
   - 越早用，越少手动写 memo，代码越干净

2. **保留必要的手动优化**
   - 非常昂贵的计算（比如大数组排序、复杂计算），仍然可以手动加 useMemo
   - 编译器不会移除你写的手动 memo，双重保险也没问题

3. **不要写代码迎合编译器**
   - 正常写你的代码，编译器会处理
   - 刻意拆分表达式反而可能让分析更困难

4. **配合 React 19 其他新特性**
   - React Compiler + use() API，让你写更少的模板代码，编译器自动优化性能
   - 开发体验提升非常明显
`,
    code: `// 纯 JS 模拟 React Compiler 的依赖分析过程
// 演示如何识别不变引用，标记可 memo 化表达式

// 模拟 AST 节点类型
const NodeType = {
  Identifier: 'Identifier',
  Literal: 'Literal',
  ObjectExpression: 'ObjectExpression',
  FunctionExpression: 'FunctionExpression',
  JSXElement: 'JSXElement',
};

// 模拟变量依赖分析
function analyzeDependencies(code, props) {
  const propsName = Object.keys(props);
  const memoizableExpressions = [];
  const dependencies = new Map();

  console.log(\`[analyze] 分析组件，props = [\${propsName.join(', ')}]\`);

  // 模拟遍历 AST，识别需要 memo 的表达式
  // 规则：在渲染函数内新建的对象/函数/JSX，如果依赖稳定就可以 memo

  function checkExpression(expr, scope) {
    const deps = [];

    // 收集表达式中用到的变量
    for (const name of expr.dependsOn) {
      if (propsName.includes(name)) {
        // 依赖 props，props 变才需要重新计算
        deps.push(name);
      } else if (scope.stable.has(name)) {
        // 依赖稳定变量（比如 useState 的 setState），不需要重新计算
        // 不加入依赖数组，永远缓存
      } else {
        // 依赖可变变量，需要重新计算
        deps.push(name);
      }
    }

    if (canMemoize(expr.type)) {
      memoizableExpressions.push({
        type: expr.type,
        dependencies: deps,
      });
      dependencies.set(expr.type, deps);
      console.log(\`  ✓ 可 memo: \${expr.type}, 依赖 = [\${deps.join(', ')}]\`);
    } else {
      console.log(\`  ✗ 不可 memo: \${expr.type}\`);
    }
  }

  function canMemoize(type) {
    return [
      NodeType.ObjectExpression,
      NodeType.FunctionExpression,
      NodeType.JSXElement,
    ].includes(type);
  }

  // 模拟分析示例组件
  // function Component({ query, page }) {
  //   const results = search(query, page);
  //   const onClick = () => {};
  //   const data = { results, query };
  //   return <Child data={data} onClick={onClick} />;
  // }

  checkExpression(
    { type: NodeType.FunctionExpression, dependsOn: [] },
    { stable: new Set() }
  );
  checkExpression(
    { type: NodeType.ObjectExpression, dependsOn: ['results', 'query'] },
    { stable: new Set() }
  );
  checkExpression(
    { type: NodeType.JSXElement, dependsOn: ['Child', 'data', 'onClick'] },
    { stable: new Set() }
  );

  return { memoizableExpressions, dependencies };
}

// 模拟稳定引用识别（比如 useState 的 setState）
function findStableReferences(hooks) {
  const stable = new Set();
  for (const hook of hooks) {
    if (hook.name === 'useState') {
      // useState 返回的 setState 永远稳定
      stable.add(hook.resultNames[1]);
      console.log(\`[stable] \${hook.resultNames[1]} 是稳定引用\`);
    }
    if (hook.name === 'useRef') {
      // useRef 对象本身稳定
      stable.add(hook.resultNames[0]);
      console.log(\`[stable] \${hook.resultNames[0]} 是稳定引用\`);
    }
  }
  return stable;
}

// 测试分析
const props = { query: 'string', page: 'number' };
const hooks = [
  { name: 'useState', resultNames: ['query', 'setQuery'] },
  { name: 'useRef', resultNames: ['inputRef'] },
];

const stableRefs = findStableReferences(hooks);
const result = analyzeDependencies('function SearchResults({ query, page }) { ... }', props);

console.log('\\n[result] 分析完成：');
console.log(\`可 memo 表达式数量：\${result.memoizableExpressions.length}\`);
result.memoizableExpressions.forEach((expr, i) => {
  console.log(\`\${i + 1}. \${expr.type} 依赖: [\${expr.dependencies.join(', ')}]\`);
});
`
  },
  {
    id: "react19-preload",
    title: "资源预加载 API",
    icon: "🚀",
    group: "新 API 与改进",
    content: `## 一、为什么需要预加载 API

在 Web 应用中，加载性能至关重要。很多时候你知道接下来需要某个资源（字体、图片、脚本），希望浏览器提前开始加载，等用到的时候就已经加载好了，不需要等。

传统方案是在 HTML 的 \`<head>\` 里写 \`<link rel="preload">\`，但：
- 你需要提前知道所有要预加载的资源，不能动态决定
- 在组件懒加载场景，组件渲染了才知道需要什么资源
- 没法在 JavaScript 中方便地动态预加载

React 19 新增了一组**资源预加载 API**，允许你在组件中声明式地预加载资源，React 会帮你插入对应的 \`<link>\` 标签到 \`head\`。

## 二、支持的 API

React 19 在 \`react-dom\` 中导出了这些预加载 API：

| API | 对应 rel | 作用 |
|-----|----------|------|
| \`preload(url, options)\` | \`preload\` | 预加载资源，告诉浏览器这个资源在当前页面马上需要 |
| \`preconnect(url)\` | \`preconnect\` | 提前建立与域名的连接，后面请求这个域名下资源更快 |
| \`prefetchDNS(url)\` | \`dns-prefetch\` | 提前 DNS 解析域名 |
| \`preinit(url, options)\` | \`preload\` 加后续处理 | 预加载并执行样式表/脚本，比 preload 更进一步 |
| \`preloadModule(url, options)\` | \`modulepreload\` | 预加载 ES 模块 |
| \`preinitModule(url, options)\` | - | 预加载并执行 ES 模块 |

## 三、基本用法

### 预加载图片
\`\`\`jsx
import { preload } from 'react-dom';

function ProductGallery() {
  // 预加载第一张商品图片
  preload('/product1-large.jpg', {
    as: 'image',
  });

  return <div>...</div>;
}
\`\`\`

### 预加载字体
\`\`\`jsx
import { preload } from 'react-dom';

function App() {
  preload('/fonts/inter.woff2', {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  });

  return <Layout>{children}</Layout>;
}
\`\`\`

### 预连接第三方域名
\`\`\`jsx
import { preconnect } from 'react-dom';

function CheckoutPage() {
  // 接下来要请求支付网关，提前连接
  preconnect('https://payment-gateway.com');
  return <div>...</div>;
}
\`\`\`

### 预初始化脚本
\`\`\`jsx
import { preinit } from 'react-dom';

function EditorPage() {
  // 提前加载并执行编辑器代码
  preinit('/editor.js', {
    as: 'script',
  });

  return <div>
    <button onClick={() => openEditor()}>打开编辑器</button>
  </div>;
}
\`\`\`

### 预加载 ES 模块
\`\`\`jsx
import { preloadModule } from 'react-dom';

function App() {
  // 用户很可能打开图表，提前预加载图表库
  preloadModule('/charting-library.js');
  return <HomePage />;
}
\`\`\`

## 四、和原生 <link> 的区别

| 特性 | 原生 <link rel="preload"> | React 预加载 API |
|------|----------------------------|------------------|
| 位置 | 必须写在 HTML 静态 head | 组件中动态调用 |
| 重复插入 | 手动去重 | React 自动去重，调用多次只插入一个 link |
| 优先级控制 | 需要手动写 media 等属性 | React 根据选项自动设置 |
| 模块支持 | 需要手动写 modulepreload | \`preloadModule\` 直接支持 |

React 预加载 API 本质上还是创建原生 \`<link>\` 标签插入 head，只是封装了方便的 API，处理了去重等细节。

## 五、SSR 中的资源提示

在服务端渲染中，React 会把预加载指令直接输出到 HTML 的 \`<head>\` 里，这样浏览器在收到 HTML 就能立即开始预加载，不需要等 JS 执行。

这极大提升了首屏加载性能——资源加载和 JS 解析可以并行进行。

## 底层原理

React 预加载 API 底层非常直接：

### 1. API 调用 -> 创建 <link> 标签

当你调用 \`preload(url, options)\` 时，React：
- 根据传入的 \`as\` 选项、crossOrigin 等，创建一个 \`<link>\` 元素
- 设置正确的 \`rel\` 属性（preload/preconnect/dns-prefetch/modulepreload）
- 设置其他属性（href、type、crossOrigin 等）
- 如果已经有相同 href 和 rel 的 link 存在，不重复创建（自动去重）
- 将 link 插入到 \`document.head\`

### 2. preinit vs preload 的区别

- \`preload\` 只是告诉浏览器"我接下来可能需要这个资源，你先加载好放着"，不执行
- \`preinit\` 对于脚本：加载完成后直接执行；对于样式表：加载完成后直接应用
- 如果你确定页面一定会用到这个脚本/样式，用 \`preinit\` 比 \`preload\` 更快

### 3. 优先级处理

浏览器根据 \`as\` 的不同给资源不同的加载优先级：
- \`as: 'script'\`、\`as: 'style'\` 优先级最高
- \`as: 'image'\` 中等优先级
- \`as: 'font'\`、\`as: 'fetch'\` 较低优先级
- React 把这个选择权交给浏览器，通过正确设置 \`as\` 属性让浏览器做正确的优先级调度

### 4. 服务端渲染

在 SSR 时：
- React 收集所有调用预加载 API 的指令
- 在渲染 HTML 时，直接把所有 \`<link>\` 标签输出到 \`<head>\` 里
- 浏览器开始解析 HTML 时就能并发预加载，不需要等 React  hydration 完成
- 这样预加载可以和 HTML 解析、JS 下载并行，节省了好几趟网络往返

## 常见陷阱

1. **不要预加载用不到的资源**
   - 预加载会占用带宽，如果预加载了很多不用的资源，反而让关键资源变慢
   - 只预加载你"很可能马上用到"的资源

2. **preload 不代表立即缓存**
   - 预加载是告诉浏览器提前加载，加载完会放在内存缓存里
   - 如果很长时间不用，浏览器可能会把它从缓存中淘汰，白预加载了

3. **as 属性不能错**
   - \`preload\` 必须传正确的 \`as\`，否则浏览器不知道怎么优先级排队
   - 字体一定要加 crossOrigin，否则会被加载两次（CORS 问题）

4. **API 在 react-dom，不是 react**
   - 所有预加载 API 都从 \`react-dom\` 导出，不是从 \`react\` 导出
   - 因为这些都是浏览器 DOM 相关的操作

5. **预加载不能跨越域名限制**
   - 只能预加载允许跨域访问的资源，和正常加载一样受 CORS 限制

## 性能提示

1. **路由级预加载**
   - 用户点击路由链接时，立即预加载下一个页面需要的关键资源
   - 在跳转动画过程中，资源已经在加载了，跳转完成直接能用，体验非常流畅

2. **预判用户行为预加载**
   - 用户鼠标悬停在一个链接/按钮上，就开始预加载对应资源
   - 通常用户悬停 100-200ms 后会点击，这时候预加载已经开始，等点击完成加载得差不多了

\`\`\`jsx
function NavLink({ href, children }) {
  const handleMouseEnter = () => {
    // 用户悬停就预加载对应页面的资源
    preload(getPageCriticalAsset(href), { as: 'script' });
  };
  return <a href={href} onMouseEnter={handleMouseEnter}>{children}</a>;
}
\`\`\`

3. **大组件懒加载 + 预加载结合**
   - 组件懒加载后，在用户交互触发前就开始预加载
   - 既保持了初始包小，又能快速打开

4. **第三方域名一定要 preconnect**
   - 如果你的页面会请求 CDN、API、第三方支付等不同域名，提前 preconnect
   - TLS 握手 + DNS 解析节省几百毫秒，对用户感知提升明显

5. **字体预加载提升首屏体验**
   - 自定义字体一定要预加载，避免字体闪烁（FOIT）
   - 只预加载首屏用到的字重和字符集，不要预加载所有字体
`,
    code: `// 纯 JS 模拟 React 资源预加载 API
// 演示创建 link 标签、去重、优先级队列

// 模拟已插入的链接，用于去重
const insertedLinks = new Set();

// 生成去重 key
function getKey(rel, href) {
  return \`\${rel}:\${href}\`;
}

// 创建并插入 link 到 head（模拟）
function insertLink(rel, href, options = {}) {
  const key = getKey(rel, href);
  if (insertedLinks.has(key)) {
    console.log(\`[preload] 已存在，跳过：\${rel} \${href}\`);
    return;
  }

  const link = {
    rel,
    href,
    ...options,
  };

  insertedLinks.add(key);
  console.log(\`[preload] 插入 <link>：rel="\${rel}" href="\${href}"\`);
  if (options.as) {
    console.log(\`  as="\${options.as}"\`);
  }
  return link;
}

// React 预加载 API
function preload(href, options) {
  return insertLink('preload', href, options);
}

function preconnect(href) {
  return insertLink('preconnect', href);
}

function prefetchDNS(href) {
  return insertLink('dns-prefetch', href);
}

function preloadModule(href) {
  return insertLink('modulepreload', href);
}

function preinit(href, options) {
  // preinit = preload + 执行
  const link = insertLink('preload', href, options);
  console.log(\`[preinit] 预加载并将执行 \${href}\`);
  return link;
}

// 测试：预加载字体
console.log('--- 测试预加载字体 ---');
preload('/fonts/inter.woff2', {
  as: 'font',
  type: 'font/woff2',
  crossOrigin: 'anonymous',
});

// 测试：预连接第三方
console.log('\\n--- 测试预连接 ---');
preconnect('https://api.example.com');
preconnect('https://cdn.example.com');

// 测试：重复插入，自动去重
console.log('\\n--- 测试去重 ---');
preload('/images/hero.jpg', { as: 'image' });
preload('/images/hero.jpg', { as: 'image' }); // 第二次应该跳过

// 测试：预加载 ES 模块
console.log('\\n--- 测试模块预加载 ---');
preloadModule('/components/Chart.js');

// 测试：预初始化脚本
console.log('\\n--- 测试预初始化 ---');
preinit('/editor.js', { as: 'script' });

// 输出统计
console.log('\\n--- 统计 ---');
console.log(\`共插入 \${insertedLinks.size} 个唯一预加载链接\`);
`,
  },
];
