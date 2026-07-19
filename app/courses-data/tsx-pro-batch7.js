// =============================================================
// TypeScript + React 全栈精通 - Batch 7: React 进阶模式
// -------------------------------------------------------------
// 章节范围（共 6 章）：
//   43. tspro-hoc                 高阶组件（HOC）
//   44. tspro-render-props        Render Props 模式
//   45. tspro-compound-components 复合组件
//   46. tspro-error-boundary      错误边界
//   47. tspro-portal              Portal 与 Modal
//   48. tspro-suspense            Suspense 与异步组件
//
// 代码运行环境：ts.transpileModule + jsx: ReactJSX + target ES2020
// 沙箱注入 react / react/jsx-runtime 的 mock，可写 JSX 语法
// =============================================================

export const chapters = [
  // =========================================================
  // 第四十三章：高阶组件（HOC）
  // =========================================================
  {
    id: "tspro-hoc",
    group: "七、React 进阶模式",
    icon: "🎁",
    title: "高阶组件（HOC）",
    content: `# 第四十三章：高阶组件（HOC）

## 43.1 为什么需要 HOC

React 组件复用有两种典型场景：

- **UI 复用**：按钮、表单、卡片——抽成子组件即可。
- **逻辑复用**：权限校验、加载状态、埋点、数据获取——这些逻辑横切在多个不相关组件里，抽子组件不合适。

HOC（Higher-Order Component）就是为「逻辑复用」而生的一种模式：**把一个组件包装成另一个组件，注入额外逻辑或 props**。

\`\`\`tsx
// 多个页面都要做权限校验
function Dashboard() { /* 需要登录 */ }
function Settings() { /* 需要登录 */ }
function Profile()  { /* 需要登录 */ }

// 重复写 if (!user) return <Login/> 太繁琐
// 用 withAuth 包一下：
const ProtectedDashboard = withAuth(Dashboard);
const ProtectedSettings  = withAuth(Settings);
const ProtectedProfile   = withAuth(Profile);
\`\`\`

## 43.2 HOC 是什么

HOC 是一个**函数**：接收一个组件，返回一个新组件。签名是 \`Component => Component\`。

\`\`\`tsx
function withSomething(WrappedComponent) {
  // 返回一个新组件
  return function Enhanced(props) {
    // 在这里做额外的事情
    return <WrappedComponent {...props} />;
  };
}
\`\`\`

注意：HOC 是**函数**，不是 React API。它只是一个被社区广泛使用的代码模式。

## 43.3 经典实现：withLoading

需求：给组件加 loading 状态，加载中显示"加载中..."。

\`\`\`tsx
function withLoading<P>(Wrapped: React.ComponentType<P>) {
  return function (props: P & { loading?: boolean }) {
    if (props.loading) return <div>加载中...</div>;
    // 把 loading 从 props 里剥离，不传给 Wrapped
    const { loading, ...rest } = props;
    return <Wrapped {...(rest as P)} />;
  };
}

// 使用
const UserList = withLoading(function (props: { users: string[] }) {
  return <ul>{props.users.map(u => <li key={u}>{u}</li>)}</ul>;
});

<UserList loading users={['Tom', 'Jerry']} />
\`\`\`

## 43.4 经典实现：withAuth

需求：未登录就跳登录页。

\`\`\`tsx
function withAuth<P>(Wrapped: React.ComponentType<P>) {
  return function (props: P) {
    const user = useCurrentUser();  // 假设有个 Hook
    if (!user) return <Navigate to="/login" />;
    return <Wrapped {...props} />;
  };
}
\`\`\`

## 43.5 HOC 的 TypeScript 类型

最常用的签名：

\`\`\`tsx
function withSomething<P>(
  Wrapped: React.ComponentType<P>
): React.ComponentType<P>;
\`\`\`

但 HOC 通常会**新增 props**（比如 withLoading 加了 loading），更完整的类型应该是：

\`\`\`tsx
// 用 Omit 把新增的 props 从外部 props 里去掉，避免重复传
function withLoading<P extends object>(
  Wrapped: React.ComponentType<P>
): React.ComponentType<Omit<P, 'loading'> & { loading?: boolean }> {
  return function (props) {
    if (props.loading) return <div>加载中...</div>;
    const { loading, ...rest } = props as any;
    return <Wrapped {...rest} />;
  };
}
\`\`\`

## 43.6 泛型 HOC

让 HOC 接收额外参数：

\`\`\`tsx
// 柯里化：先传配置，再传组件
function withFetch<T>(url: string) {
  return function <P>(Wrapped: React.ComponentType<P & { data: T }>) {
    return function (props: P) {
      const [data, setData] = useState<T | null>(null);
      useEffect(() => {
        fetch(url).then(r => r.json()).then(setData);
      }, []);
      if (!data) return <div>加载中</div>;
      return <Wrapped {...props} data={data} />;
    };
  };
}

const UserList = withFetch<User[]>('/api/users')(UserListInner);
\`\`\`

## 43.7 HOC 的常见坑

### 1. ref 透传问题

HOC 把组件包了一层，外部 ref 拿到的是包装组件，不是原组件。需要用 \`forwardRef\` 手动透传：

\`\`\`tsx
function withLog<P>(Wrapped: React.ComponentType<P>) {
  const Enhanced = React.forwardRef<InstanceType<typeof Wrapped>, P>(
    (props, ref) => {
      console.log('render');
      return <Wrapped {...props} ref={ref} />;
    }
  );
  return Enhanced;
}
\`\`\`

### 2. 静态方法丢失

HOC 返回的是新组件，原组件上的静态方法不会自动复制：

\`\`\`tsx
Wrapped.someStatic = () => {};
const Enhanced = withHoc(Wrapped);
Enhanced.someStatic;  // undefined！

// 解决：手动 hoist
hoistNonReactStatics(Enhanced, Wrapped);
\`\`\`

### 3. displayName

调试时 React DevTools 显示的组件名会乱掉，要手动设置：

\`\`\`tsx
Enhanced.displayName = \`withAuth(\${Wrapped.displayName || Wrapped.name})\`;
\`\`\`

### 4. props 类型继承

不要用 \`any\`，否则失去类型保护。用泛型 \`<P>\` + \`Omit\`：

\`\`\`tsx
// ❌ 反例
function withLoading(Wrapped: any) {
  return (props: any) => /* ... */;
}

// ✅ 正例
function withLoading<P extends object>(
  Wrapped: React.ComponentType<P>
): React.ComponentType<Omit<P, 'loading'> & { loading?: boolean }> {
  /* ... */
}
\`\`\`

## 43.8 HOC vs Hooks

Hooks 出现后，大部分 HOC 场景都被自定义 Hook 替代了：

| 维度 | HOC | 自定义 Hook |
|------|-----|-------------|
| 复用方式 | 包装组件 | 函数调用 |
| props 命名冲突 | 容易 | 不会 |
| 类型推断 | 复杂 | 简单 |
| 嵌套地狱 | \`withA(withB(withC(C)))\` | \`useA(); useB(); useC();\` |
| 适用场景 | 需要包装渲染结果 | 只复用逻辑 |

**新项目优先用 Hook，HOC 在改造老代码或包装第三方组件时还有用。**

## 43.9 小结

- HOC 是 \`Component => Component\` 的函数，用于逻辑复用
- 经典实现：withLoading、withAuth
- TS 类型：\`<P>(C: ComponentType<P>) => ComponentType<P>\`，用 \`Omit\` 处理新增 props
- 四大坑：ref 透传、静态方法、displayName、props 类型
- 新项目优先用自定义 Hook
`,
    code: `// =============================================================
// 第 43 章 demo：HOC 高阶组件
// 模拟 withLoading、withAuth、泛型 HOC、displayName、ref 透传
// =============================================================

// ---- 简易 React 组件模型 ----
// 组件就是一个函数，返回虚拟 DOM 节点
function h(type, props, ...children) {
  return { type, props: props || {}, children };
}

// 模拟渲染：把 vnode 转成字符串
function render(vnode) {
  if (vnode == null || vnode === false) return '';
  if (typeof vnode === 'string' || typeof vnode === 'number') return String(vnode);
  const { type, props, children } = vnode;
  if (typeof type === 'function') {
    // 函数组件：调用得到 vnode 再渲染
    return render(type(props));
  }
  const inner = children.map(render).join('');
  const propsStr = Object.entries(props)
    .filter(([k]) => k !== 'children')
    .map(([k, v]) => k + '=' + JSON.stringify(v))
    .join(' ');
  return '<' + type + (propsStr ? ' ' + propsStr : '') + '>' + inner + '</' + type + '>';
}

// ---- 1. withLoading：加 loading 状态 ----
console.log('=== 1. withLoading ===');

function withLoading(Wrapped) {
  // 返回增强后的组件
  function Enhanced(props) {
    if (props.loading) {
      return h('div', null, '加载中...');
    }
    // 剥离 loading prop，不传给原组件
    const { loading, ...rest } = props;
    return h(Wrapped, rest);
  }
  // 设置 displayName 便于调试
  Enhanced.displayName = 'withLoading(' + (Wrapped.name || 'Anonymous') + ')';
  return Enhanced;
}

// 原始组件：用户列表
function UserList(props) {
  return h('ul', null, ...props.users.map(u => h('li', { key: u }, u)));
}

const UserListWithLoading = withLoading(UserList);

console.log('  加载中：', render(h(UserListWithLoading, { loading: true })));
console.log('  加载完：', render(h(UserListWithLoading, { loading: false, users: ['Tom', 'Jerry'] })));

// ---- 2. withAuth：权限校验 ----
console.log('\\n=== 2. withAuth ===');

// 模拟当前用户
let currentUser = null;

function withAuth(Wrapped) {
  function Enhanced(props) {
    if (!currentUser) {
      return h('div', null, '请先登录');
    }
    return h(Wrapped, props);
  }
  Enhanced.displayName = 'withAuth(' + (Wrapped.name || 'Anonymous') + ')';
  return Enhanced;
}

function Dashboard(props) {
  return h('div', null, '欢迎，' + props.title);
}
const ProtectedDashboard = withAuth(Dashboard);

console.log('  未登录：', render(h(ProtectedDashboard, { title: '仪表盘' })));
currentUser = { name: 'Tom' };
console.log('  已登录：', render(h(ProtectedDashboard, { title: '仪表盘' })));

// ---- 3. 泛型 HOC：柯里化 ----
console.log('\\n=== 3. 泛型 HOC withFetch ===');

// 模拟 fetch：根据 url 返回数据
const fakeDb = { '/api/users': [{ name: 'Tom' }, { name: 'Jerry' }] };
function fakeFetch(url) {
  return Promise.resolve({ json: () => Promise.resolve(fakeDb[url]) });
}

// 柯里化 HOC：withFetch(url)(Component)
function withFetch(url) {
  return function (Wrapped) {
    function Enhanced(props) {
      // 模拟 useEffect + useState
      if (!Enhanced._data) {
        if (!Enhanced._promise) {
          Enhanced._promise = fakeFetch(url).then(r => r.json()).then(data => {
            Enhanced._data = data;
          });
        }
        return h('div', null, '加载中...');
      }
      return h(Wrapped, { ...props, data: Enhanced._data });
    }
    Enhanced.displayName = 'withFetch(' + (Wrapped.name || 'Anonymous') + ')';
    return Enhanced;
  };
}

function UserListWithData(props) {
  return h('ul', null, ...props.data.map(u => h('li', { key: u.name }, u.name)));
}
const UsersPage = withFetch('/api/users')(UserListWithData);

console.log('  首次渲染（同步）：', render(h(UsersPage, {})));

// 等异步数据回来后
setTimeout(() => {
  console.log('  数据回来后：', render(h(UsersPage, {})));
}, 10);

// ---- 4. ref 透传问题 ----
console.log('\\n=== 4. ref 透传 ===');

// 模拟 forwardRef
function forwardRef(render) {
  function Component(props) {
    const ref = props.ref;
    return render(props, ref);
  }
  return Component;
}

// ❌ 不透传 ref
function withLogBad(Wrapped) {
  function Enhanced(props) {
    console.log('  [withLogBad] render');
    return h(Wrapped, props);  // ref 不会传给 Wrapped
  }
  return Enhanced;
}

// ✅ 透传 ref
function withLogGood(Wrapped) {
  const Enhanced = forwardRef(function (props, ref) {
    console.log('  [withLogGood] render');
    return h(Wrapped, { ...props, ref });
  });
  Enhanced.displayName = 'withLogGood(' + (Wrapped.name || 'Anonymous') + ')';
  return Enhanced;
}

const innerRef = { current: null };
function Input(props) {
  // 模拟接收 ref
  if (props.ref) props.ref.current = 'input-element';
  return h('input', { type: 'text' });
}
const BadInput = withLogBad(Input);
const GoodInput = withLogGood(Input);

render(h(BadInput, { ref: innerRef }));
console.log('  BadInput ref:', innerRef.current, '（ref 没传到）');
innerRef.current = null;
render(h(GoodInput, { ref: innerRef }));
console.log('  GoodInput ref:', innerRef.current, '（ref 正确透传）');

// ---- 5. 静态方法丢失 ----
console.log('\\n=== 5. 静态方法丢失 ===');

function ComponentWithStatic() { return h('div', null, 'hello'); }
ComponentWithStatic.someStatic = '我是静态方法';

const Wrapped = withLoading(ComponentWithStatic);
console.log('  原组件静态:', ComponentWithStatic.someStatic);
console.log('  HOC 后静态:', Wrapped.someStatic, '（丢失！）');
console.log('  解决方案：手动 hoistNonReactStatics(Enhanced, Wrapped)');

// ---- 关键要点总结 ----
console.log('\\n=== HOC 核心要点 ===');
console.log('1. HOC 是 Component => Component 的函数');
console.log('2. 经典：withLoading、withAuth');
console.log('3. TS 类型：<P>(C: ComponentType<P>) => ComponentType<P>');
console.log('4. 四大坑：ref 透传、静态方法、displayName、props 类型');
console.log('5. 新项目优先用自定义 Hook');
`,
  },

  // =========================================================
  // 第四十四章：Render Props 模式
  // =========================================================
  {
    id: "tspro-render-props",
    group: "七、React 进阶模式",
    icon: "🎨",
    title: "Render Props 模式",
    content: `# 第四十四章：Render Props 模式

## 44.1 为什么需要 Render Props

跟 HOC 一样，Render Props 也是为了**逻辑复用**。区别在于：

- HOC 是"我包装你"——你不知道我给你加了什么。
- Render Props 是"我提供状态，你决定怎么渲染"——更灵活、更显式。

经典例子：跟踪鼠标位置。

\`\`\`tsx
// 多个组件都需要鼠标位置：tooltip、画板、拖拽
// 不可能每个都自己监听 mousemove
// 解决：抽一个 Mouse 组件，把位置通过 render prop 传出去
<Mouse>
  {({ x, y }) => <div>位置：{x}, {y}</div>}
</Mouse>
\`\`\`

## 44.2 Render Props 是什么

**Render Props** 指一种约定：组件接收一个函数 prop（通常叫 \`render\`，或直接用 \`children\`），组件内部把状态作为参数调用这个函数，由函数决定渲染什么。

\`\`\`tsx
class Mouse extends React.Component {
  state = { x: 0, y: 0 };
  handleMove = (e) => this.setState({ x: e.clientX, y: e.clientY });
  render() {
    // 调用 render prop，把状态传出去
    return (
      <div onMouseMove={this.handleMove}>
        {this.props.render(this.state)}
      </div>
    );
  }
}

<Mouse render={({ x, y }) => <div>{x}, {y}</div>} />
\`\`\`

## 44.3 children as function

社区更流行的写法是用 \`children\` 当函数：

\`\`\`tsx
<Mouse>
  {({ x, y }) => <div>{x}, {y}</div>}
</Mouse>

// Mouse 内部
return <div>{this.props.children(this.state)}</div>;
\`\`\`

这种写法更直观、JSX 嵌套更自然，是 React 官方推荐的写法。

## 44.4 函数签名与 TS 类型

\`\`\`tsx
type MouseState = { x: number; y: number };
type MouseProps = {
  children: (state: MouseState) => React.ReactNode;
};

function Mouse({ children }: MouseProps) {
  const [pos, setPos] = useState<MouseState>({ x: 0, y: 0 });
  return (
    <div onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}>
      {children(pos)}
    </div>
  );
}
\`\`\`

要点：
- \`children\` 是一个函数，参数是状态，返回值是 ReactNode
- 用泛型可以让状态类型更灵活

## 44.5 与 HOC 对比

| 维度 | HOC | Render Props |
|------|-----|--------------|
| 复用方式 | 包装组件 | 传函数 |
| props 命名冲突 | 容易 | 不会 |
| 灵活性 | 包装层固定 | 完全由调用者决定 |
| 类型推断 | 复杂 | 简单 |
| 调试 | 中间套了一层 | 直接看 JSX |
| 性能 | 默认好 | 每次渲染都创建新函数 |

## 44.6 何时用 Render Props

- 复用的逻辑需要根据状态渲染**不同 UI**：HOC 没法做到。
- 需要把状态暴露给调用者自由组合：tooltip、carousel、virtual list。
- 简单的逻辑复用：相比 HOC 更显式、更易理解。

## 44.7 DataProvider 实战

抽象"数据获取"逻辑：

\`\`\`tsx
type DataProviderProps<T> = {
  url: string;
  children: (state: { data: T | null; loading: boolean; error: Error | null }) => React.ReactNode;
};

function DataProvider<T>({ url, children }: DataProviderProps<T>) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  useEffect(() => {
    fetch(url)
      .then(r => r.json())
      .then(data => setState({ data, loading: false, error: null }))
      .catch(error => setState({ data: null, loading: false, error }));
  }, [url]);

  return <>{children(state)}</>;
}

// 使用：调用者决定 loading / error / data 各显示什么
<DataProvider url="/api/users">
  {({ data, loading, error }) =>
    loading ? <Spinner /> :
    error ? <ErrorView error={error} /> :
    <UserList users={data} />
  }
</DataProvider>
\`\`\`

## 44.8 性能优化：纯组件 + 函数 prop

Render Props 每次渲染都创建新函数，会让子组件 memo 失效。优化：

\`\`\`tsx
// 把 render 函数抽出来
function App() {
  const renderMouse = useCallback(({ x, y }) => <div>{x}, {y}</div>, []);
  return <Mouse>{renderMouse}</Mouse>;
}
\`\`\`

## 44.9 Render Props vs Hooks

跟 HOC 一样，Hooks 出现后大部分 Render Props 场景也被 Hook 替代：

\`\`\`tsx
// Render Props 写法
<Mouse>{({ x, y }) => <div>{x}, {y}</div>}</Mouse>

// Hook 写法
function App() {
  const { x, y } = useMouse();
  return <div>{x}, {y}</div>;
}
\`\`\`

Hook 更简洁，没有嵌套地狱。**新项目优先用 Hook，Render Props 在第三方库 API 设计中还会遇到**（比如 react-motion、downshift）。

## 44.10 小结

- Render Props：把状态通过函数 prop 暴露给调用者
- \`children as function\` 是主流写法
- 比 HOC 灵活、显式
- TS 类型：\`children: (state) => ReactNode\`
- 新项目优先用自定义 Hook
`,
    code: `// =============================================================
// 第 44 章 demo：Render Props 模式
// 模拟 Mouse 跟踪器、DataProvider、children as function
// =============================================================

// ---- 简易 React 组件模型 ----
function h(type, props, ...children) {
  return { type, props: props || {}, children };
}

function render(vnode) {
  if (vnode == null || vnode === false) return '';
  if (typeof vnode === 'string' || typeof vnode === 'number') return String(vnode);
  if (typeof vnode === 'function') return render(vnode());
  const { type, props, children } = vnode;
  if (typeof type === 'function') {
    return render(type(props));
  }
  const inner = children.map(render).join('');
  return '<' + type + '>' + inner + '</' + type + '>';
}

// ---- 1. Mouse 跟踪器 ----
console.log('=== 1. Mouse 跟踪器 ===');

// 模拟 Mouse 组件：内部维护位置，把位置通过 children 函数传出去
function Mouse(props) {
  // 模拟内部 state
  const state = { x: 100, y: 200 };
  // 调用 children 函数，把 state 传出去
  return h('div', { onMouseMove: 'handleMove' }, props.children(state));
}

// 调用者 1：显示坐标
const tooltip = h(Mouse, {}, (state) => h('span', null, '位置：' + state.x + ', ' + state.y));
console.log('  tooltip:', render(tooltip));

// 调用者 2：一只跟随鼠标的猫
const cat = h(Mouse, {}, (state) => h('div', null, '🐱 在 (' + state.x + ', ' + state.y + ')'));
console.log('  cat:', render(cat));

// 调用者 3：自定义画板
const canvas = h(Mouse, {}, (state) => h('canvas', { x: state.x, y: state.y }, '画板'));
console.log('  canvas:', render(canvas));

// ---- 2. render prop 命名（不限于 children）----
console.log('\\n=== 2. render prop 命名 ===');

function DataFetcher(props) {
  // 模拟数据
  const data = ['Tom', 'Jerry', 'Spike'];
  // 用 props.render 而不是 props.children
  return h('div', null, props.render(data));
}

const list = h(DataFetcher, {
  render: (data) => h('ul', null, ...data.map(u => h('li', { key: u }, u)))
}, null);
console.log('  list:', render(list));

// ---- 3. DataProvider：数据获取 ----
console.log('\\n=== 3. DataProvider ===');

// 模拟 fetch
const db = { '/api/users': ['Tom', 'Jerry', 'Spike'] };

function DataProvider(props) {
  // 模拟 useState/useEffect
  if (!DataProvider._cache) DataProvider._cache = {};
  const cache = DataProvider._cache;
  const url = props.url;

  if (!cache[url]) {
    cache[url] = { data: null, loading: true, error: null };
    // 模拟异步 fetch
    setTimeout(() => {
      cache[url] = { data: db[url], loading: false, error: null };
    }, 10);
  }

  // 调用 children 函数，把状态传出去
  return h('div', null, props.children(cache[url]));
}

// 调用者决定 loading/error/data 各显示什么
const page = h(DataProvider, { url: '/api/users' }, (state) => {
  if (state.loading) return h('div', null, '加载中...');
  if (state.error) return h('div', null, '出错了：' + state.error.message);
  return h('ul', null, ...state.data.map(u => h('li', { key: u }, u)));
});
console.log('  首次渲染（loading）：', render(page));

// 等异步完成
setTimeout(() => {
  console.log('  数据回来后：', render(page));
}, 20);

// ---- 4. 多状态组合 ----
console.log('\\n=== 4. 多状态组合 ===');

function MouseTracker(props) {
  const mouse = { x: 100, y: 200 };
  return h(Mouse, {}, (m) => props.children({ ...m, time: Date.now() }));
}

const combined = h(MouseTracker, {}, (state) =>
  h('div', null, '时间 ' + state.time + ' 位置 ' + state.x + ',' + state.y)
);
console.log('  combined:', render(combined));

// ---- 5. 与 HOC 对比 ----
console.log('\\n=== 5. 与 HOC 对比 ===');

// HOC 写法
function withMouseHOC(Wrapped) {
  function Enhanced(props) {
    const state = { x: 100, y: 200 };
    return h(Wrapped, { ...props, mouse: state });
  }
  Enhanced.displayName = 'withMouse(' + (Wrapped.name || '') + ')';
  return Enhanced;
}

function ShowPosHOC(props) {
  return h('div', null, 'HOC: ' + props.mouse.x + ',' + props.mouse.y);
}
const WithMouse = withMouseHOC(ShowPosHOC);

// Render Props 写法
const showPosRP = h(Mouse, {}, (m) => h('div', null, 'RP: ' + m.x + ',' + m.y));

console.log('  HOC:', render(h(WithMouse, {})));
console.log('  RP :', render(showPosRP));
console.log('  → RP 更灵活：调用者决定渲染什么');

// ---- 6. 性能优化提示 ----
console.log('\\n=== 6. 性能优化 ===');
console.log('  Render Props 每次渲染都创建新函数，会让 memo 失效');
console.log('  优化：把 render 函数抽出来用 useCallback 包裹');
console.log('  const render = useCallback(({x,y}) => <div>{x},{y}</div>, [])');
console.log('  <Mouse>{render}</Mouse>');

// ---- 关键要点总结 ----
console.log('\\n=== Render Props 核心要点 ===');
console.log('1. Render Props：把状态通过函数 prop 暴露给调用者');
console.log('2. children as function 是主流写法');
console.log('3. 比 HOC 更灵活、更显式');
console.log('4. TS 类型：children: (state) => ReactNode');
console.log('5. 新项目优先用自定义 Hook');
`,
  },

  // =========================================================
  // 第四十五章：复合组件（Compound Components）
  // =========================================================
  {
    id: "tspro-compound-components",
    group: "七、React 进阶模式",
    icon: "🧱",
    title: "复合组件（Compound Components）",
    content: `# 第四十五章：复合组件（Compound Components）

## 45.1 为什么需要复合组件

需求：实现一个 Tabs 组件。一种写法是配置驱动：

\`\`\`tsx
<Tabs
  items={[
    { label: '首页', content: <Home /> },
    { label: '关于', content: <About /> },
  ]}
  active={0}
  onChange={setActive}
/>
\`\`\`

但配置驱动有几个问题：

- 嵌套深时难写
- 标签和内容无法自由组合（比如标签里加图标、关闭按钮）
- 类型推断复杂

更好的写法是**复合组件**：

\`\`\`tsx
<Tabs defaultActive="home">
  <Tabs.List>
    <Tabs.Tab value="home">首页</Tabs.Tab>
    <Tabs.Tab value="about">关于</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panels>
    <Tabs.Panel value="home"><Home /></Tabs.Panel>
    <Tabs.Panel value="about"><About /></Tabs.Panel>
  </Tabs.Panels>
</Tabs>
\`\`\`

像原生 HTML 一样声明式、可组合。

## 45.2 复合组件是什么

**复合组件（Compound Components）**：一组协同工作的组件，对外暴露一个父组件 + 多个子组件，子组件通过 \`children\` 嵌入父组件，内部通过 **共享 Context** 通信。

经典例子：\`<select>\` / \`<option>\`、\`<table>\` / \`<tr>\` / \`<td>\`、\`<Tabs>\` / \`<Tabs.Tab>\`。

## 45.3 共享 Context 模式

核心思路：

1. 父组件维护状态，通过 Context 向下传
2. 子组件从 Context 拿状态、调方法
3. 调用者只需组合 JSX，不需要管状态

\`\`\`tsx
const TabsContext = createContext<TabsContextValue | null>(null);

function Tabs({ children, defaultActive }) {
  const [active, setActive] = useState(defaultActive);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      {children}
    </TabsContext.Provider>
  );
}

Tabs.Tab = function Tab({ value, children }) {
  const ctx = useContext(TabsContext)!;
  const isActive = ctx.active === value;
  return <button onClick={() => ctx.setActive(value)}>{children}</button>;
};
\`\`\`

## 45.4 用 React.Children / React.cloneElement

老版本 React 没有 Hooks 时，复合组件常用 \`React.Children.map\` + \`cloneElement\` 给子组件注入 props：

\`\`\`tsx
function Tabs({ children, active }) {
  return (
    <div>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { active })
      )}
    </div>
  );
}
\`\`\`

这种写法有问题：

- 子组件被强制注入 props，类型难写
- 嵌套结构脆弱（子组件不能套 div）

**Hooks 时代推荐用 Context，cloneElement 几乎不用了**。

## 45.5 Tabs 完整实现

\`\`\`tsx
type TabsContextValue = {
  active: string;
  setActive: (value: string) => void;
};
const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs 子组件必须在 <Tabs> 内使用');
  return ctx;
}

function Tabs({ children, defaultActive }) {
  const [active, setActive] = useState(defaultActive);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

Tabs.List = function List({ children }) {
  return <div className="tabs-list">{children}</div>;
};

Tabs.Tab = function Tab({ value, children }) {
  const { active, setActive } = useTabs();
  return (
    <button
      className={active === value ? 'active' : ''}
      onClick={() => setActive(value)}
    >
      {children}
    </button>
  );
};

Tabs.Panels = function Panels({ children }) {
  return <div className="tabs-panels">{children}</div>;
};

Tabs.Panel = function Panel({ value, children }) {
  const { active } = useTabs();
  if (active !== value) return null;
  return <div className="tabs-panel">{children}</div>;
};
\`\`\`

## 45.6 TS 类型设计

复合组件的 TS 类型有几个关键点：

### 1. 子组件挂到父组件上

\`\`\`tsx
type TabsType = typeof Tabs & {
  List: typeof List;
  Tab: typeof Tab;
  Panels: typeof Panels;
  Panel: typeof Panel;
};

const Tabs = ((props: TabsProps) => /* ... */) as TabsType;
Tabs.List = List;
Tabs.Tab = Tab;
\`\`\`

### 2. Context 默认值 null + 自定义 Hook 抛错

\`\`\`tsx
const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('useTabs 必须在 <Tabs> 内使用');
  return ctx;
}
\`\`\`

这样 \`Tabs.Tab\` 写在 \`<Tabs>\` 外面会立刻报错，便于调试。

### 3. 子组件 props 显式声明

\`\`\`tsx
type TabProps = {
  value: string;
  children: React.ReactNode;
};
\`\`\`

## 45.7 经典用例：Select / Accordion

\`\`\`tsx
// Select
<Select defaultValue="apple">
  <Select.Trigger />
  <Select.Option value="apple">苹果</Select.Option>
  <Select.Option value="banana">香蕉</Select.Option>
</Select>

// Accordion
<Accordion>
  <Accordion.Item>
    <Accordion.Trigger>标题 1</Accordion.Trigger>
    <Accordion.Panel>内容 1</Accordion.Panel>
  </Accordion.Item>
</Accordion>
\`\`\`

## 45.8 何时用复合组件

- 组件有**多个相关部分**需要协同（标签 + 面板、触发器 + 选项）
- 调用者需要**自由组合**子组件的顺序和内容
- 状态在父组件统一管理，子组件只负责渲染

不适合复合组件的场景：

- 只有单一职责的组件（直接写就行）
- 状态完全独立的组件（用普通 props 即可）

## 45.9 小结

- 复合组件：父 + 子组件协同，内部用 Context 共享状态
- 比配置驱动更声明式、更灵活
- \`React.Children\` + \`cloneElement\` 已过时，优先用 Context
- TS 类型：子组件挂到父组件上 + Context 默认 null + 自定义 Hook 抛错
- 经典案例：Tabs、Select、Accordion
`,
    code: `// =============================================================
// 第 45 章 demo：复合组件
// 模拟 Tabs 复合组件 + Context 共享状态
// =============================================================

// ---- 简易 React 组件模型 ----
function h(type, props, ...children) {
  return { type, props: props || {}, children };
}

function render(vnode) {
  if (vnode == null || vnode === false) return '';
  if (typeof vnode === 'string' || typeof vnode === 'number') return String(vnode);
  const { type, props, children } = vnode;
  if (typeof type === 'function') {
    return render(type(props));
  }
  const inner = children.map(render).join('');
  const propsStr = Object.entries(props)
    .filter(([k]) => k !== 'children' && k !== 'className')
    .map(([k, v]) => k + '=' + JSON.stringify(v))
    .join(' ');
  const cls = props.className ? ' class=' + props.className : '';
  return '<' + type + cls + (propsStr ? ' ' + propsStr : '') + '>' + inner + '</' + type + '>';
}

// ---- 模拟 Context 系统 ----
// 用一个简单的栈来模拟 Context Provider 树
const contextStack = [];

function createContext(defaultValue) {
  const context = { defaultValue, _id: Math.random() };
  context.Provider = function Provider(props) {
    contextStack.push({ context, value: props.value });
    const result = props.children;
    contextStack.pop();
    return result;
  };
  return context;
}

function useContext(context) {
  // 从栈顶向下找最近的 Provider
  for (let i = contextStack.length - 1; i >= 0; i--) {
    if (contextStack[i].context === context) {
      return contextStack[i].value;
    }
  }
  return context.defaultValue;
}

// ---- 1. Tabs 复合组件 ----
console.log('=== 1. Tabs 复合组件 ===');

const TabsContext = createContext(null);

// 自定义 Hook：拿 Context，没找到抛错
function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs 子组件必须在 <Tabs> 内使用');
  return ctx;
}

// 父组件：维护 active 状态，通过 Provider 向下传
function Tabs(props) {
  // 模拟 useState
  const state = { active: props.defaultActive, setActive: (v) => { state.active = v; } };
  return h(TabsContext.Provider, { value: state }, ...props.children);
}

// 子组件：List
Tabs.List = function List(props) {
  return h('div', { className: 'tabs-list' }, ...props.children);
};

// 子组件：Tab（标签按钮）
Tabs.Tab = function Tab(props) {
  const ctx = useTabs();
  const isActive = ctx.active === props.value;
  return h('button', {
    className: isActive ? 'active' : '',
    onClick: () => ctx.setActive(props.value)
  }, props.children);
};

// 子组件：Panels
Tabs.Panels = function Panels(props) {
  return h('div', { className: 'tabs-panels' }, ...props.children);
};

// 子组件：Panel（内容区）
Tabs.Panel = function Panel(props) {
  const ctx = useTabs();
  // 只渲染当前激活的 panel
  if (ctx.active !== props.value) return null;
  return h('div', { className: 'tabs-panel' }, props.children);
};

// ---- 渲染 Tabs ----
const tabsJSX = h(Tabs, { defaultActive: 'home' },
  h(Tabs.List, {},
    h(Tabs.Tab, { value: 'home' }, '首页'),
    h(Tabs.Tab, { value: 'about' }, '关于'),
    h(Tabs.Tab, { value: 'contact' }, '联系')
  ),
  h(Tabs.Panels, {},
    h(Tabs.Panel, { value: 'home' }, '首页内容'),
    h(Tabs.Panel, { value: 'about' }, '关于内容'),
    h(Tabs.Panel, { value: 'contact' }, '联系内容')
  )
);

console.log('  初始（active=home）：');
console.log('  ', render(tabsJSX));

// 模拟点击 about
console.log('\\n  点击 about 后：');
const state = { active: 'about', setActive: (v) => { state.active = v; } };
const tabsJSX2 = h(TabsContext.Provider, { value: state },
  h(Tabs.List, {},
    h(Tabs.Tab, { value: 'home' }, '首页'),
    h(Tabs.Tab, { value: 'about' }, '关于'),
    h(Tabs.Tab, { value: 'contact' }, '联系')
  ),
  h(Tabs.Panels, {},
    h(Tabs.Panel, { value: 'home' }, '首页内容'),
    h(Tabs.Panel, { value: 'about' }, '关于内容'),
    h(Tabs.Panel, { value: 'contact' }, '联系内容')
  )
);
state.setActive('about');
console.log('  ', render(tabsJSX2));

// ---- 2. 子组件必须在父组件内 ----
console.log('\\n=== 2. 子组件必须在父组件内 ===');
try {
  // 不在 Tabs 内直接用 Tab
  render(h(Tabs.Tab, { value: 'x' }, '孤儿 Tab'));
} catch (e) {
  console.log('  抛错：', e.message);
}

// ---- 3. 经典应用：Accordion ----
console.log('\\n=== 3. Accordion ===');

const AccordionContext = createContext(null);
function useAccordion() {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('Accordion 子组件必须在 <Accordion> 内使用');
  return ctx;
}

function Accordion(props) {
  const state = { open: props.defaultOpen || null, setOpen: (v) => { state.open = v; } };
  return h(AccordionContext.Provider, { value: state }, ...props.children);
}

Accordion.Item = function Item(props) {
  return h('div', { className: 'accordion-item' }, ...props.children);
};

Accordion.Trigger = function Trigger(props) {
  const ctx = useAccordion();
  const isOpen = ctx.open === props.value;
  return h('button', { onClick: () => ctx.setOpen(isOpen ? null : props.value) },
    props.children + (isOpen ? ' ▼' : ' ▶'));
};

Accordion.Panel = function Panel(props) {
  const ctx = useAccordion();
  if (ctx.open !== props.value) return null;
  return h('div', { className: 'accordion-panel' }, props.children);
};

const accordion = h(Accordion, { defaultOpen: 'item1' },
  h(Accordion.Item, {},
    h(Accordion.Trigger, { value: 'item1' }, '标题 1'),
    h(Accordion.Panel, { value: 'item1' }, '内容 1')
  ),
  h(Accordion.Item, {},
    h(Accordion.Trigger, { value: 'item2' }, '标题 2'),
    h(Accordion.Panel, { value: 'item2' }, '内容 2')
  )
);
console.log('  ', render(accordion).replace(/></g, '>\\n<'));

// ---- 关键要点总结 ----
console.log('\\n=== 复合组件核心要点 ===');
console.log('1. 复合组件：父 + 子组件协同，用 Context 共享状态');
console.log('2. 比配置驱动更声明式、更灵活');
console.log('3. 子组件挂到父组件上：Tabs.Tab、Tabs.Panel');
console.log('4. Context 默认 null + 自定义 Hook 抛错');
console.log('5. React.Children + cloneElement 已过时');
console.log('6. 经典案例：Tabs、Select、Accordion');
`,
  },

  // =========================================================
  // 第四十六章：错误边界（Error Boundary）
  // =========================================================
  {
    id: "tspro-error-boundary",
    group: "七、React 进阶模式",
    icon: "🛡️",
    title: "错误边界（Error Boundary）",
    content: `# 第四十六章：错误边界（Error Boundary）

## 46.1 为什么需要错误边界

React 组件树很深时，**任何一个组件抛错就会整棵树崩溃**，用户看到一片空白。

\`\`\`tsx
function BuggyComponent() {
  throw new Error('我挂了');
}

function App() {
  return (
    <div>
      <Header />
      <BuggyComponent />  {/* 抛错，整个 App 都崩 */}
      <Footer />          {/* 也不会渲染 */}
    </div>
  );
}
\`\`\`

try/catch 没法处理组件渲染时的错误——因为错误发生在 React 的渲染流程里，不在调用栈里。

错误边界（Error Boundary）就是 React 提供的**捕获子组件树渲染错误**的机制。

## 46.2 错误边界是什么

错误边界是一个 React 类组件，实现了以下任一（或两个）生命周期：

- \`static getDerivedStateFromError(error)\`：渲染阶段调用，返回新的 state（标记有错）
- \`componentDidCatch(error, info)\`：提交阶段调用，用来上报错误

\`\`\`tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('捕获到错误：', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>出错了</div>;
    }
    return this.props.children;
  }
}
\`\`\`

使用：

\`\`\`tsx
<ErrorBoundary fallback={<div>出错了</div>}>
  <BuggyComponent />
</ErrorBoundary>
\`\`\`

## 46.3 为什么函数组件不能做错误边界

错误边界依赖两个生命周期：\`getDerivedStateFromError\` 和 \`componentDidCatch\`。这两个 API **没有 Hook 等价物**，只能用类组件实现。

所以现在错误边界是 React 里少数仍需要类组件的场景。

\`\`\`tsx
// ❌ 函数组件做不到
function ErrorBoundary(props) {
  // 没有 getDerivedStateFromError 的等价 Hook
  // 也没有 componentDidCatch 的等价 Hook
}

// ✅ 必须用类组件
class ErrorBoundary extends React.Component { /* ... */ }
\`\`\`

## 46.4 getDerivedStateFromError vs componentDidCatch

| API | 调用阶段 | 用途 | 能否 setState |
|-----|---------|------|---------------|
| getDerivedStateFromError | 渲染阶段 | 标记有错，触发 fallback 渲染 | 返回新 state |
| componentDidCatch | 提交阶段 | 上报错误、打日志 | 调用 setState |

执行顺序：

1. 子组件渲染抛错
2. React 找到最近的错误边界
3. 调用 \`getDerivedStateFromError\` → 返回 \`{ hasError: true }\`
4. 重新渲染错误边界 → 渲染 \`fallback\`
5. 调用 \`componentDidCatch\` → 上报错误

## 46.5 错误边界的限制

错误边界**不捕获**以下错误：

- **事件处理器错误**：\`onClick\` 里 throw 不会被捕获
- **异步错误**：\`setTimeout\`、\`requestAnimationFrame\`、Promise reject
- **服务端渲染错误**：SSR 阶段不触发错误边界
- **错误边界自身的错误**：错误边界抛错不会被自己捕获

\`\`\`tsx
function Buggy() {
  const onClick = () => {
    throw new Error('事件错误');  // ❌ 错误边界捕获不到
  };
  return <button onClick={onClick}>click</button>;
}
\`\`\`

事件处理器错误要用 try/catch 自己处理；异步错误用 \`.catch()\` 或 \`window.onerror\`。

## 46.6 完整实现

\`\`\`tsx
type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
  resetKeys?: unknown[];
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.props.onError?.(error, info);
    // 上报到 Sentry / 自建日志
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // resetKeys 变化时重置状态
    if (this.state.hasError && prevProps.resetKeys !== this.props.resetKeys) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <h1>出错了</h1>;
    }
    return this.props.children;
  }
}
\`\`\`

## 46.7 错误上报

\`componentDidCatch\` 拿到错误后，应该上报到监控系统：

\`\`\`tsx
componentDidCatch(error, info) {
  Sentry.captureException(error, { extra: { info } });
}
\`\`\`

\`info.componentStack\` 是 React 组件栈，对调试非常有用：

\`\`\`
in BuggyComponent
in div (created by App)
in App
\`\`\`

## 46.8 嵌套错误边界

可以多层嵌套，让错误"局部化"：

\`\`\`tsx
<ErrorBoundary fallback={<AppError />}>
  <Header />
  <ErrorBoundary fallback={<MainError />}>
    <Main />
  </ErrorBoundary>
  <Footer />
</ErrorBoundary>
\`\`\`

Main 出错时只替换 Main 区域，Header / Footer 仍然正常。

## 46.9 实际项目用法

- 顶层包一个全局错误边界：兜底所有未捕获错误
- 关键模块各自包错误边界：避免互相影响
- 表单 / 图表等容易出错的子区域单独包
- 配合 Suspense 使用：\`<ErrorBoundary><Suspense fallback={<Loader />}><DataView/></Suspense></ErrorBoundary>\`

## 46.10 小结

- 错误边界捕获子组件树**渲染期**错误，避免整棵树崩溃
- 必须是类组件，依赖 \`getDerivedStateFromError\` + \`componentDidCatch\`
- 不捕获事件、异步、SSR、自身错误
- \`fallback\` prop 控制出错时显示什么
- 嵌套错误边界让错误"局部化"
- 实际项目：顶层 + 关键模块都包
`,
    code: `// =============================================================
// 第 46 章 demo：错误边界
// 模拟类组件错误边界、getDerivedStateFromError、嵌套边界
// =============================================================

// ---- 简易 React 类组件模型 ----
function h(type, props, ...children) {
  return { type, props: props || {}, children };
}

function render(vnode) {
  if (vnode == null || vnode === false) return '';
  if (typeof vnode === 'string' || typeof vnode === 'number') return String(vnode);
  const { type, props, children } = vnode;
  if (typeof type === 'function') {
    // 类组件或函数组件：实例化/调用
    if (type.prototype && type.prototype.isReactComponent) {
      const instance = new type(props);
      // 调用 render 方法
      let result;
      try {
        result = instance.render.call(instance);
      } catch (e) {
        // 模拟渲染抛错：检查是否有 getDerivedStateFromError
        if (type.getDerivedStateFromError) {
          const newState = type.getDerivedStateFromError(e);
          Object.assign(instance.state, newState);
          result = instance.render.call(instance);
          // 调用 componentDidCatch
          if (instance.componentDidCatch) {
            instance.componentDidCatch(e, { componentStack: 'in ' + type.name });
          }
        } else {
          throw e;
        }
      }
      return render(result);
    }
    return render(type(props));
  }
  const inner = children.map(render).join('');
  return '<' + type + '>' + inner + '</' + type + '>';
}

// 给类加标记
function makeClass(klass) {
  klass.prototype.isReactComponent = true;
  return klass;
}

// ---- 1. ErrorBoundary 类组件 ----
console.log('=== 1. ErrorBoundary 基础实现 ===');

const ErrorBoundary = makeClass(class ErrorBoundary {
  constructor(props) {
    this.props = props;
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    console.log('  [getDerivedStateFromError] 捕获到错误：', error.message);
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.log('  [componentDidCatch] 上报错误：', error.message);
    console.log('  [componentStack]', info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return h('div', { className: 'error' }, this.props.fallback || '出错了');
    }
    return this.props.children;
  }
});

// ---- 2. 测试：子组件抛错 ----
console.log('\\n=== 2. 子组件抛错 ===');

function BuggyComponent() {
  throw new Error('我挂了');
}

const tree1 = h(ErrorBoundary, { fallback: '😭 出错了，请稍后再试' },
  h('div', null,
    h('h1', null, '页面标题'),
    h(BuggyComponent, {}),
    h('p', null, '这段话不会渲染')
  )
);
console.log('  渲染结果:', render(tree1));

// ---- 3. 没有错误边界：整棵树崩溃 ----
console.log('\\n=== 3. 没有错误边界 ===');
const tree2 = h('div', null,
  h('h1', null, '页面'),
  h(BuggyComponent, {}),
  h('p', null, '不会渲染')
);
try {
  render(tree2);
} catch (e) {
  console.log('  整棵树崩溃：', e.message);
}

// ---- 4. 嵌套错误边界：错误局部化 ----
console.log('\\n=== 4. 嵌套错误边界 ===');

function Header() { return h('header', null, 'Header 正常'); }
function Footer() { return h('footer', null, 'Footer 正常'); }
function Main() {
  throw new Error('Main 挂了');
}

const tree3 = h(ErrorBoundary, { fallback: '全局错误' },
  h(Header, {}),
  h(ErrorBoundary, { fallback: '局部错误：Main 挂了' },
    h(Main, {})
  ),
  h(Footer, {})
);
console.log('  渲染结果:', render(tree3).replace(/></g, '>\\n  <'));
console.log('  → 只有 Main 区域显示 fallback，Header/Footer 正常');

// ---- 5. 错误边界的限制：不捕获事件处理器错误 ----
console.log('\\n=== 5. 不捕获事件错误 ===');

function BuggyEvent() {
  const onClick = () => {
    // 事件处理器里的错误，错误边界捕获不到
    throw new Error('事件错误');
  };
  return h('button', { onClick }, '点我');
}

const tree4 = h(ErrorBoundary, { fallback: '事件错误兜底' }, h(BuggyEvent, {}));
console.log('  渲染（不抛错）:', render(tree4));
console.log('  → 按钮渲染正常，但点击时抛错不会被错误边界捕获');
console.log('  → 事件错误要用 try/catch 自己处理');

// ---- 6. 限制：不捕获异步错误 ----
console.log('\\n=== 6. 不捕获异步错误 ===');

const tree5 = h(ErrorBoundary, { fallback: '异步错误兜底' },
  h('div', null, '异步错误演示')
);
console.log('  渲染:', render(tree5));
setTimeout(() => {
  try {
    throw new Error('异步错误');
  } catch (e) {
    console.log('  setTimeout 里抛错，错误边界捕获不到：', e.message);
    console.log('  → 异步错误要用 .catch() 或 window.onerror 处理');
  }
}, 10);

// ---- 7. resetKeys 重置 ----
console.log('\\n=== 7. resetKeys 重置 ===');

const ErrorBoundaryWithReset = makeClass(class ErrorBoundaryWithReset {
  constructor(props) {
    this.props = props;
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKeys !== this.props.resetKeys) {
      console.log('  [resetKeys 变化] 重置错误状态');
      this.state = { hasError: false };
    }
  }
  render() {
    return this.state.hasError ? h('div', null, '出错了，等待 reset') : this.props.children;
  }
});

// 模拟第一次：抛错
const instance1 = new ErrorBoundaryWithReset({ resetKeys: ['query1'], children: h(BuggyComponent, {}) });
instance1.render = function() {
  if (this.state.hasError) return h('div', null, '出错了，等待 reset');
  try { return this.props.children; } catch (e) {
    this.state = ErrorBoundaryWithReset.getDerivedStateFromError(e);
    return h('div', null, '出错了，等待 reset');
  }
};
console.log('  第一次渲染：', render(instance1.render()));

// 模拟 resetKeys 变化，重置
const prevProps = { resetKeys: ['query1'] };
const newProps = { resetKeys: ['query2'], children: h('div', null, '正常内容') };
instance1.props = newProps;
instance1.componentDidUpdate(prevProps);
console.log('  resetKeys 变化后渲染：', render(instance1.render()));

// ---- 关键要点总结 ----
console.log('\\n=== 错误边界核心要点 ===');
console.log('1. 错误边界捕获子组件树渲染期错误');
console.log('2. 必须用类组件：getDerivedStateFromError + componentDidCatch');
console.log('3. 函数组件做不了错误边界');
console.log('4. 不捕获事件、异步、SSR、自身错误');
console.log('5. fallback prop 控制出错时显示什么');
console.log('6. 嵌套错误边界让错误局部化');
console.log('7. 实际项目：顶层 + 关键模块都包');
`,
  },

  // =========================================================
  // 第四十七章：Portal 与 Modal
  // =========================================================
  {
    id: "tspro-portal",
    group: "七、React 进阶模式",
    icon: "🌀",
    title: "Portal 与 Modal",
    content: `# 第四十七章：Portal 与 Modal

## 47.1 为什么需要 Portal

需求：实现一个 Modal 弹窗。直觉写法：

\`\`\`tsx
function App() {
  return (
    <div className="container" style={{ position: 'relative', overflow: 'hidden' }}>
      <button onClick={() => setOpen(true)}>打开</button>
      {open && <Modal>...</Modal>}
    </div>
  );
}
\`\`\`

但这个 Modal 会有问题：

- 父容器 \`overflow: hidden\` 会**裁切掉** Modal
- 父容器 \`z-index\` 比兄弟节点小，Modal 可能被**遮挡**
- 父容器 \`transform / filter\` 会让 Modal 的 \`position: fixed\` 失效（变成相对父容器定位）

**Portal 解决的就是这个问题**：把组件渲染到 DOM 树的任意位置（通常是 \`document.body\` 末尾），跳出父容器的样式约束。

## 47.2 Portal 是什么

\`createPortal\` 让组件的渲染结果"传送"到指定的 DOM 节点，**而不是父组件在 DOM 树里的位置**。

\`\`\`tsx
import { createPortal } from 'react-dom';

function Modal({ children }) {
  return createPortal(
    <div className="modal">{children}</div>,
    document.body  // 渲染到 body 末尾
  );
}
\`\`\`

虽然 DOM 在 \`body\` 末尾，但 React 组件树还是父子的——事件冒泡、Context 都正常工作。

## 47.3 createPortal API

\`\`\`tsx
createPortal(node: ReactNode, container: Element): ReactPortal
\`\`\`

- \`node\`：要渲染的内容（JSX）
- \`container\`：目标 DOM 节点

通常在 \`Modal\` / \`Tooltip\` / \`Toast\` / \`Drawer\` 里用：

\`\`\`tsx
function Modal({ open, children }) {
  if (!open) return null;
  return createPortal(
    <div className="modal-overlay">{children}</div>,
    document.body
  );
}
\`\`\`

## 47.4 Portal 的事件冒泡

虽然 DOM 在 \`body\`，但 React 事件系统看的是**组件树**，不是 DOM 树。所以 Portal 内的事件会"虚拟"冒泡到父组件：

\`\`\`tsx
function App() {
  const onClick = () => console.log('父组件捕获到 Portal 的点击');
  return (
    <div onClick={onClick}>
      <Modal>
        <button>点我</button>  {/* 点击会触发父的 onClick */}
      </Modal>
    </div>
  );
}
\`\`\`

这是 Portal 设计上很巧妙的一点——DOM 位置变了，但 React 语义没变。

## 47.5 Modal 实现要点

一个完整的 Modal 需要处理：

1. **遮罩层**：点击空白处关闭
2. **Esc 键关闭**
3. **body 滚动锁定**：打开时禁止背景滚动
4. **焦点陷阱**：Tab 只能在 Modal 内循环
5. **无障碍**：\`role="dialog"\`、\`aria-modal\`

\`\`\`tsx
function Modal({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';  // 锁定背景滚动
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {children}
        <button onClick={onClose}>关闭</button>
      </div>
    </div>,
    document.body
  );
}
\`\`\`

## 47.6 焦点陷阱（Focus Trap）简介

Modal 打开后，键盘用户按 Tab 不应该跳到背景。实现思路：

1. 打开时记录当前焦点，把焦点移到 Modal 内第一个可聚焦元素
2. Tab 在 Modal 内的可聚焦元素间循环
3. 关闭时把焦点还回去

\`\`\`tsx
const firstRef = useRef();
const lastRef = useRef();

useEffect(() => {
  if (open) firstRef.current?.focus();
}, [open]);

function onKeyDown(e) {
  if (e.key !== 'Tab') return;
  if (e.shiftKey && document.activeElement === firstRef.current) {
    e.preventDefault();
    lastRef.current?.focus();
  }
  // ... 反向同理
}
\`\`\`

实际项目通常直接用 \`react-focus-lock\` 或 \`headlessui\` 这种成熟方案，不自己写。

## 47.7 Portal 的适用场景

- **Modal / Dialog**：跳出父容器样式
- **Tooltip / Popover**：避免被 overflow 裁切
- **Toast / Notification**：固定在角落
- **Drawer / 抽屉**：从边缘滑出
- **全局 Loading**：覆盖整个屏幕

## 47.8 Portal 的注意事项

- **SSR 兼容**：\`document.body\` 在服务端不存在，需要 \`typeof document !== 'undefined'\` 判断
- **样式隔离**：Portal 渲染在 \`body\` 末尾，可能跳出 CSS 作用域（如 Tailwind 的 \`@layer\`）
- **事件冒泡**：父组件的 \`onClick\` 会捕获到 Portal 内的点击——有时是 bug，要 \`stopPropagation\`

## 47.9 小结

- Portal 让组件渲染到 DOM 树的任意位置（通常是 body）
- 解决父容器 \`overflow\` / \`z-index\` / \`transform\` 的样式约束
- React 事件按组件树冒泡，不是 DOM 树
- Modal 要点：遮罩、Esc 关闭、点击外部关闭、滚动锁定、focus trap
- 适用：Modal、Tooltip、Toast、Drawer
`,
    code: `// =============================================================
// 第 47 章 demo：Portal 与 Modal
// 模拟 createPortal、Modal、Esc 关闭、点击外部关闭
// =============================================================

// ---- 简易 React 组件模型 ----
function h(type, props, ...children) {
  return { type, props: props || {}, children };
}

// 模拟 DOM：用一个虚拟的 body 容器
const fakeDOM = {
  body: { type: 'body', children: [], _isBody: true },
  getElementById: (id) => null,
  addEventListener: () => {},
  removeEventListener: () => {},
};

// 模拟 createPortal：把 vnode 标记为 portal，目标在 body
function createPortal(node, container) {
  return { type: 'PORTAL', props: { node, container }, _isPortal: true };
}

function render(vnode) {
  if (vnode == null || vnode === false) return '';
  if (typeof vnode === 'string' || typeof vnode === 'number') return String(vnode);
  if (vnode._isPortal) {
    // Portal：渲染到指定容器（body）
    const inner = render(vnode.props.node);
    fakeDOM.body.children.push(inner);
    return '';  // 在原位置不渲染
  }
  const { type, props, children } = vnode;
  if (typeof type === 'function') {
    return render(type(props));
  }
  const inner = children.map(render).join('');
  const propsStr = Object.entries(props)
    .filter(([k]) => k !== 'children' && typeof props[k] !== 'function')
    .map(([k, v]) => k + '=' + JSON.stringify(v))
    .join(' ');
  return '<' + type + (propsStr ? ' ' + propsStr : '') + '>' + inner + '</' + type + '>';
}

// ---- 1. 为什么需要 Portal ----
console.log('=== 1. 父容器 overflow 问题 ===');

function ModalNoPortal(props) {
  return h('div', { className: 'modal' }, props.children);
}

function AppNoPortal() {
  return h('div', { className: 'container', style: 'overflow:hidden' },
    h('p', null, '父容器 overflow:hidden'),
    h(ModalNoPortal, {}, '没有 Portal 的 Modal（被父容器裁切）')
  );
}
console.log('  不用 Portal：Modal 跟父容器在同一个 DOM 子树');
console.log('  ', render(h(AppNoPortal, {})));

// ---- 2. 用 Portal：Modal 渲染到 body ----
console.log('\\n=== 2. 用 Portal ===');

function ModalWithPortal(props) {
  return createPortal(
    h('div', { className: 'modal' }, props.children),
    fakeDOM.body  // 传送到 body
  );
}

function AppWithPortal() {
  return h('div', { className: 'container', style: 'overflow:hidden' },
    h('p', null, '父容器 overflow:hidden'),
    h(ModalWithPortal, {}, '用 Portal 的 Modal（跳到 body 末尾）')
  );
}

// 重置 body
fakeDOM.body.children = [];
render(h(AppWithPortal, {}));
console.log('  用 Portal：Modal 出现在 body 末尾');
console.log('  body children:', JSON.stringify(fakeDOM.body.children));

// ---- 3. 完整 Modal：Esc + 点击外部关闭 ----
console.log('\\n=== 3. 完整 Modal 实现 ===');

let modalState = { open: true, onClose: () => { modalState.open = false; console.log('  [onClose] Modal 关闭'); } };
let keydownHandler = null;
let bodyOverflow = '';

function Modal(props) {
  // 模拟 useEffect
  if (props.open) {
    keydownHandler = (e) => {
      if (e.key === 'Escape') {
        console.log('  [Esc 键] 关闭 Modal');
        props.onClose();
      }
    };
    bodyOverflow = 'hidden';
    console.log('  [useEffect] 注册 Esc 监听 + 锁定 body 滚动');
  }

  if (!props.open) return null;

  return createPortal(
    h('div', {
      className: 'overlay',
      onClick: () => { console.log('  [点击遮罩] 关闭 Modal'); props.onClose(); }
    },
      h('div', {
        className: 'modal-content',
        onClick: (e) => { console.log('  [点击内容] stopPropagation'); }
      }, props.children)
    ),
    fakeDOM.body
  );
}

// 模拟渲染
fakeDOM.body.children = [];
const modalJSX = h(Modal, {
  open: modalState.open,
  onClose: modalState.onClose
}, h('h2', null, '标题'), h('p', null, 'Modal 内容'));
render(modalJSX);
console.log('  body children:', JSON.stringify(fakeDOM.body.children));

// 模拟按 Esc
console.log('\\n  模拟按 Esc：');
keydownHandler({ key: 'Escape' });

// ---- 4. 焦点陷阱模拟 ----
console.log('\\n=== 4. 焦点陷阱（概念演示）===');

function focusTrapDemo() {
  const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  console.log('  Modal 内可聚焦元素：', focusableSelector);
  console.log('  打开 Modal 时：');
  console.log('    1. 记录当前焦点（activeElement）');
  console.log('    2. 把焦点移到 Modal 内第一个可聚焦元素');
  console.log('  按 Tab 时：');
  console.log('    1. 找到 Modal 内所有可聚焦元素');
  console.log('    2. 在第一个和最后一个之间循环');
  console.log('  关闭 Modal 时：');
  console.log('    把焦点还给之前记录的元素');
}
focusTrapDemo();

// ---- 5. Portal 事件冒泡 ----
console.log('\\n=== 5. Portal 事件冒泡 ===');

console.log('  虽然 DOM 在 body，但 React 事件按组件树冒泡');
console.log('  → 父组件的 onClick 会捕获到 Portal 内的点击');
console.log('  → 如果不希望冒泡，在 Portal 内调 e.stopPropagation()');

// ---- 6. 适用场景 ----
console.log('\\n=== 6. Portal 适用场景 ===');
console.log('  - Modal / Dialog：跳出父容器样式');
console.log('  - Tooltip / Popover：避免被 overflow 裁切');
console.log('  - Toast / Notification：固定在角落');
console.log('  - Drawer / 抽屉：从边缘滑出');
console.log('  - 全局 Loading：覆盖整个屏幕');

// ---- 关键要点总结 ----
console.log('\\n=== Portal 核心要点 ===');
console.log('1. Portal 把组件渲染到 DOM 任意位置（通常 body）');
console.log('2. 解决父容器 overflow / z-index / transform 约束');
console.log('3. React 事件按组件树冒泡，不是 DOM 树');
console.log('4. Modal 要点：遮罩 + Esc + 点击外部 + 滚动锁定 + focus trap');
console.log('5. SSR 兼容：判断 typeof document !== undefined');
console.log('6. 适用：Modal、Tooltip、Toast、Drawer');
`,
  },

  // =========================================================
  // 第四十八章：Suspense 与异步组件
  // =========================================================
  {
    id: "tspro-suspense",
    group: "七、React 进阶模式",
    icon: "⏳",
    title: "Suspense 与异步组件",
    content: `# 第四十八章：Suspense 与异步组件

## 48.1 为什么需要 Suspense

异步加载组件 / 数据，传统写法要手动管理 \`loading\` 状态：

\`\`\`tsx
function Page() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);
  if (loading) return <Spinner />;
  return <Content data={data} />;
}
\`\`\`

每个异步组件都要重复这套样板。**Suspense 把"loading 状态"提取到上层**，让组件专注于"有数据时怎么渲染"：

\`\`\`tsx
<Suspense fallback={<Spinner />}>
  <Content />  {/* 内部"等待"数据，由上层 Suspense 兜底 */}
</Suspense>
\`\`\`

## 48.2 Suspense 是什么

\`<Suspense>\` 是 React 16.6 引入的组件，用于**包裹会"挂起"的子组件**。子组件挂起时，Suspense 显示 \`fallback\`；子组件就绪后，自动切换到正常内容。

\`\`\`tsx
<Suspense fallback={<div>加载中...</div>}>
  <LazyComponent />
</Suspense>
\`\`\`

什么算"挂起"：

- \`React.lazy\` 加载的组件还没下载完
- （实验性）用 \`use()\` 读取未就绪的 Promise
- （实验性）Suspense-enabled 数据框架（Relay、Next.js）

## 48.3 fallback 属性

\`fallback\` 是子组件挂起时显示的内容，可以是任意 ReactNode：

\`\`\`tsx
<Suspense fallback={<Spinner />}>
<Suspense fallback={<div>加载中</div>}>
<Suspense fallback={<Skeleton />}>
<Suspense fallback={null}>  {/* 啥都不显示 */}
\`\`\`

## 48.4 React.lazy 配合使用

\`React.lazy\` 让组件**按需加载**（code splitting），必须配合 Suspense：

\`\`\`tsx
import { lazy, Suspense } from 'react';

// 懒加载：首次渲染时才下载 chunk
const HeavyChart = lazy(() => import('./HeavyChart'));

function App() {
  return (
    <Suspense fallback={<div>图表加载中...</div>}>
      <HeavyChart data={data} />
    </Suspense>
  );
}
\`\`\`

\`lazy\` 接收一个返回 \`Promise<{ default: Component }>\` 的函数。TypeScript 完整类型：

\`\`\`tsx
const LazyComp = lazy<ComponentProps<typeof RealComp>>(
  () => import('./RealComp')
);
\`\`\`

## 48.5 嵌套 Suspense

多层嵌套时，每个 Suspense 各自处理子树的"挂起"：

\`\`\`tsx
<Suspense fallback={<PageLoader />}>
  <Header />
  <Suspense fallback={<MainLoader />}>
    <Main />
  </Suspense>
  <Suspense fallback={<SidebarLoader />}>
    <Sidebar />
  </Suspense>
</Suspense>
\`\`\`

Main 加载完时只替换 Main 的 fallback，Header 和 Sidebar 不受影响——**流式渲染**。

## 48.6 Suspense for Data Fetching（实验性）

React 18 起，可以"直接在组件里读 Promise"，让 Suspense 兜底 loading：

\`\`\`tsx
// 实验性：用 use() 读取 Promise
import { use } from 'react';

function UserProfile({ userPromise }) {
  const user = use(userPromise);  // Promise 没就绪时组件挂起
  return <div>{user.name}</div>;
}

// 父组件
function Page() {
  const userPromise = fetchUser();  // 在组件外创建 Promise
  return (
    <Suspense fallback={<Spinner />}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
}
\`\`\`

要点：**Promise 必须在组件外创建**，不能在组件内 \`fetch\`（否则每次渲染都新建 Promise，永远不就绪）。

## 48.7 错误边界 + Suspense 组合

数据加载可能失败，Promise reject 时组件会"抛错"——需要错误边界捕获：

\`\`\`tsx
<ErrorBoundary fallback={<ErrorView />}>
  <Suspense fallback={<Spinner />}>
    <UserProfile userPromise={userPromise} />
  </Suspense>
</ErrorBoundary>
\`\`\`

经典组合：**ErrorBoundary 在外、Suspense 在内**。失败显示 fallback，加载中显示 spinner，成功显示内容。

\`\`\`tsx
function AsyncBoundary({ children, fallback, errorFallback }) {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}
\`\`\`

## 48.8 与 React 18 并发渲染的关系

React 18 的并发特性配合 Suspense：

- \`useTransition\`：把更新标记为非紧急，Suspense fallback 可以"等"
- \`useDeferredValue\`：延迟值，配合 Suspense 实现渐进式更新
- 流式 SSR：服务端可以分段输出 HTML，Suspense 边界作为分块点

\`\`\`tsx
function App() {
  const [isPending, startTransition] = useTransition();
  const goToTab = (tab) => startTransition(() => setTab(tab));
  // 切换 tab 时，旧内容继续显示，新内容加载完才切换
}
\`\`\`

## 48.9 实际项目用法

- **路由级懒加载**：每个路由组件用 \`lazy\`，外层 Suspense
- **大组件懒加载**：富文本编辑器、图表库等大依赖按需加载
- **数据获取**：配合 Relay / Next.js / React Query 的 Suspense 模式
- **流式渲染**：关键内容先显示，次要内容用 Suspense 包裹延迟渲染

\`\`\`tsx
// 路由级
<Suspense fallback={<RouteLoader />}>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<lazy(() => import('./About'))} />} />
  </Routes>
</Suspense>
\`\`\`

## 48.10 小结

- Suspense 包裹"会挂起"的子组件，挂起时显示 fallback
- 配合 \`React.lazy\` 实现代码分割
- 嵌套 Suspense 实现流式渲染
- 数据获取 Suspense（\`use()\`）是实验性，Promise 要在组件外创建
- 错误边界 + Suspense 经典组合：失败兜底 + 加载兜底
- React 18 并发特性让 Suspense 更强大
`,
    code: `// =============================================================
// 第 48 章 demo：Suspense 与异步组件
// 模拟 React.lazy、Suspense、嵌套、错误边界组合
// =============================================================

// ---- 简易 React 组件模型 ----
function h(type, props, ...children) {
  return { type, props: props || {}, children };
}

// 模拟 Suspense：内部维护挂起状态
function Suspense(props) {
  // 如果 children 还在挂起，返回 fallback
  // 这里模拟：调用 children，捕获"挂起"信号
  try {
    const childResult = renderVnode(props.children);
    return h('div', { className: 'suspense-resolved' }, childResult);
  } catch (e) {
    if (e && e._isPromise) {
      console.log('  [Suspense] 子组件挂起，显示 fallback');
      return h('div', { className: 'suspense-fallback' }, props.fallback);
    }
    throw e;
  }
}

function renderVnode(vnode) {
  if (vnode == null || vnode === false) return '';
  if (typeof vnode === 'string' || typeof vnode === 'number') return String(vnode);
  const { type, props, children } = vnode;
  if (typeof type === 'function') {
    return type(props);
  }
  return '(' + type + ')';
}

function render(vnode) {
  if (vnode == null || vnode === false) return '';
  if (typeof vnode === 'string' || typeof vnode === 'number') return String(vnode);
  if (vnode._isPromise) throw vnode;
  const { type, props, children } = vnode;
  if (typeof type === 'function') {
    if (type === Suspense) {
      // 特殊处理 Suspense
      try {
        const inner = renderVnode(props.children);
        return '<div class=suspense>' + inner + '</div>';
      } catch (e) {
        if (e && e._isPromise) {
          return '<div class=suspense-fallback>' + render(props.fallback) + '</div>';
        }
        throw e;
      }
    }
    const result = type(props);
    return render(result);
  }
  const inner = children.map(render).join('');
  return '<' + type + '>' + inner + '</' + type + '>';
}

// ---- 1. React.lazy 模拟 ----
console.log('=== 1. React.lazy 模拟 ===');

// 模拟 lazy：返回一个组件，首次渲染时抛 Promise
function lazy(loader) {
  let cached = null;
  let promise = null;

  function LazyComponent(props) {
    if (cached) {
      // 已加载：返回真实组件
      return h(cached, props);
    }
    if (!promise) {
      // 首次：触发加载
      console.log('  [lazy] 首次渲染，开始加载 chunk');
      promise = loader().then(mod => {
        cached = mod.default;
        promise = null;
      });
      promise._isPromise = true;
    }
    // 抛 Promise 让 Suspense 捕获
    throw promise;
  }
  return LazyComponent;
}

// 模拟一个真实组件
function HeavyChart(props) {
  return h('div', null, '图表：' + JSON.stringify(props.data));
}

// 模拟 import()：异步加载
function fakeImport() {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('  [import] chunk 下载完成');
      resolve({ default: HeavyChart });
    }, 20);
  });
}

const LazyChart = lazy(fakeImport);

// ---- 2. Suspense 兜底 ----
console.log('\\n=== 2. Suspense 兜底 ===');

const tree = h(Suspense, {
  fallback: h('div', null, '⏳ 加载中...'),
  children: h(LazyChart, { data: [1, 2, 3] })
});

console.log('  首次渲染：');
console.log('  ', render(tree));
console.log('  → 子组件挂起，显示 fallback');

// 等加载完成
setTimeout(() => {
  console.log('\\n  加载完成后渲染：');
  console.log('  ', render(tree));
}, 30);

// ---- 3. 嵌套 Suspense ----
console.log('\\n=== 3. 嵌套 Suspense（流式渲染）===');

function Header() { return h('header', null, 'Header 立即可见'); }
function MainSlow() {
  // 模拟还没就绪
  const p = new Promise(() => {});
  p._isPromise = true;
  throw p;
}
function SidebarSlow() {
  const p = new Promise(() => {});
  p._isPromise = true;
  throw p;
}

const nestedTree = h(Suspense, {
  fallback: h('div', null, '页面加载中'),
  children: [
    h(Header, {}),
    h(Suspense, { fallback: h('div', null, '主内容加载中'), children: h(MainSlow, {}) }),
    h(Suspense, { fallback: h('div', null, '侧边栏加载中'), children: h(SidebarSlow, {}) })
  ]
});
console.log('  ', render(nestedTree).replace(/></g, '>\\n  <'));
console.log('  → Header 立即显示，Main/Sidebar 各自有 fallback');

// ---- 4. 错误边界 + Suspense 组合 ----
console.log('\\n=== 4. 错误边界 + Suspense ===');

function makeErrorBoundary(fallback) {
  function EB(props) {
    try {
      return renderVnode(props.children);
    } catch (e) {
      console.log('  [ErrorBoundary] 捕获错误：', e.message || 'Promise reject');
      return h('div', { className: 'error' }, fallback);
    }
  }
  return EB;
}

const EB = makeErrorBoundary('❌ 加载失败');

// 模拟 lazy 加载失败
function lazyFail(loader) {
  let promise = null;
  return function LazyFail(props) {
    if (!promise) {
      promise = loader();
      promise._isPromise = true;
    }
    throw promise;
  };
}

const FailingComp = lazyFail(() => Promise.reject(new Error('网络错误')));

const treeWithError = h(EB, {
  children: h(Suspense, {
    fallback: h('div', null, '加载中'),
    children: h(FailingComp, {})
  })
});

console.log('  首次渲染（挂起，显示 fallback）：');
console.log('  ', render(treeWithError));

// Promise reject 后：错误边界捕获
setTimeout(() => {
  console.log('\\n  Promise reject 后渲染（错误边界捕获）：');
  // 模拟：lazyFail 抛错而非抛 Promise
  function FailingCompNow() { throw new Error('网络错误'); }
  const tree2 = h(EB, {
    children: h(Suspense, {
      fallback: h('div', null, '加载中'),
      children: h(FailingCompNow, {})
    })
  });
  console.log('  ', render(tree2));
}, 50);

// ---- 5. Suspense for Data Fetching（use）概念 ----
console.log('\\n=== 5. Suspense for Data Fetching ===');

console.log('  实验性写法：组件内用 use(promise) 读取数据');
console.log('  关键：Promise 必须在组件外创建，不能在组件内 fetch');
console.log('  ');
console.log('  function Page() {');
console.log('    const userPromise = fetchUser();  // 组件外创建');
console.log('    return (');
console.log('      <Suspense fallback={<Spinner/>}>');
console.log('        <User userPromise={userPromise} />');
console.log('      </Suspense>');
console.log('    )');
console.log('  }');
console.log('  ');
console.log('  function User({ userPromise }) {');
console.log('    const user = use(userPromise);  // 没就绪就挂起');
console.log('    return <div>{user.name}</div>');
console.log('  }');

// ---- 6. useTransition 配合 Suspense ----
console.log('\\n=== 6. useTransition 概念 ===');

console.log('  const [isPending, startTransition] = useTransition()');
console.log('  startTransition(() => setTab("about"))');
console.log('  → 切换 tab 时，旧内容继续显示');
console.log('  → 新内容加载完才切换');
console.log('  → isPending=true 时可以显示一个细微的 loading 提示');

// ---- 关键要点总结 ----
console.log('\\n=== Suspense 核心要点 ===');
console.log('1. Suspense 包裹会"挂起"的子组件，挂起时显示 fallback');
console.log('2. React.lazy 实现代码分割，必须配合 Suspense');
console.log('3. 嵌套 Suspense 实现流式渲染');
console.log('4. Suspense for Data Fetching：use(promise)，Promise 要在组件外创建');
console.log('5. 错误边界 + Suspense：失败兜底 + 加载兜底');
console.log('6. useTransition 让切换更顺滑');
`,
  },
];
