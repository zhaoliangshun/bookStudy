// =============================================================
// React 19 新特性交互式教程 —— 第一批章节（Actions 与表单组，共 5 章）
// -------------------------------------------------------------
// 覆盖 React 19 Actions 核心概念：Actions 概念、useActionState、
// useFormStatus、useOptimistic、form Actions 与 Server Actions。
// 所有 code 字段为可在 Node 沙箱运行的纯 JS（不依赖 react），
// 用 console.log 模拟演示底层原理。
// =============================================================

export const chapters = [
  {
    id: "react19-actions",
    title: "Actions 概念与异步 Transition",
    icon: "⚡",
    group: "Actions 与表单",
    content: `## 一、什么是 Actions
React 19 引入了 **Actions** 这一新概念，它本质上是一个**异步函数**，React 会自动帮你管理：
- pending 状态（是否正在执行）
- 错误处理
- 乐观更新
- 自动包装成 Transition（低优先级渲染）

在 React 18 中，如果你想做一个异步提交操作，你需要手写一大堆模板代码：

\`\`\`jsx
const [isPending, startTransition] = useTransition();
const [error, setError] = useState(null);

async function handleSubmit(data) {
  setError(null);
  startTransition(async () => {
    try {
      await submitToAPI(data);
      router.push('/success');
    } catch (err) {
      setError(err);
    }
  });
}
\`\`\`

而在 React 19 中，只要把异步函数直接传给 React（比如 \`<form action={fn}>\` 或按钮 \`formAction\`），React 就会帮你自动处理以上所有事情。

> 一句话总结：**Actions = 异步函数 + React 自动管理状态 + 自动 Transition**。

## 二、Action 的函数签名
一个标准的 Action 函数签名很简单：

\`\`\`jsx
// 无参数
async function action(): Promise<void>

// 接收表单数据（FormData）
async function action(formData: FormData): Promise<void>

// 返回结果给调用方（useActionState 会用）
async function action(prevState: State, formData: FormData): Promise<State>
\`\`\`

React 不关心函数内部做什么——可以是普通异步请求，可以是 Server Actions，甚至可以是空函数。只要是异步函数，就能作为 Action。

## 三、React 18 useTransition vs React 19 Actions
React 18 的 \`useTransition\` 只帮你做了**优先级标记**，而 React 19 Actions 做了全套自动化：

| 特性 | React 18 useTransition | React 19 Actions |
|------|------------------------|------------------|
| 标记低优先级 | ✅ | ✅（自动） |
| 自动管理 isPending | ❌（需手动） | ✅（自动） |
| 自动错误捕获 | ❌ | ✅ |
| 乐观更新支持 | ❌（需手动） | ✅（原生） |
| 与表单集成 | ❌（需手写） | ✅（原生 \`<form action>\`） |

Actions 建立在 Transition 之上，但它把常见的异步操作模式都内置了，大幅减少样板代码。

## 四、核心能力概览

### 1. 自动 pending 状态管理
当 Action 开始执行时，React 自动把 pending 设为 true；执行完成（成功或失败）后，自动设回 false。你不需要在 try/finally 里手写切换。

### 2. 自动错误处理
如果 Action 抛出错误，React 不会崩溃，而是把错误暴露给你（通过 \`useActionState\` 或错误边界），让你可以显示错误提示。

### 3. 乐观更新内置支持
React 19 新增了 \`useOptimistic\` Hook，可以让你在 Action 还在执行时，就先把 UI 更新成"预期结果"，等请求失败再自动回滚。这是点赞、评论、表单提交场景的利器。

### 4. 自动 Transition
所有 Actions 默认都运行在 Transition 里，也就是说它们的更新都是低优先级、可中断的，不会阻塞用户交互。

## 五、基本用法示例

\`\`\`jsx
// 最简单的表单 Action 用法
async function handleSubmit(formData) {
  await saveUser({
    name: formData.get('name'),
    email: formData.get('email')
  });
}

function UserForm() {
  return (
    <form action={handleSubmit}>
      <input name="name" />
      <input name="email" />
      <button type="submit">保存</button>
    </form>
  );
}
\`\`\`

就这么简单！没有 \`useState\`、没有 \`useTransition\`、没有 try/catch——React 全帮你处理了。

---

## 底层原理
当你把一个异步函数传给 React 作为 Action 时，React 内部做了这些事：

1. **包装异步函数**：React 把你的原始异步函数包在一个同步函数里，这个包装函数会：
   - 在调用原始函数前，自动把 pending 状态设为 true，并触发一次低优先级渲染。
   - 捕获异步函数抛出的错误，存在 fiber 上。
   - 异步函数完成后，自动把 pending 设为 false，若有错误则更新错误状态。

2. **Transition 上下文**：在执行你传入的 scope（其实就是 setState 触发更新）时，React 会把当前更新上下文标记为 transition，让所有这次更新里的 setState 都分到低优先级 lane，保证它们不会阻塞高优先级交互。

3. **pending 状态原子切换**：pending 的 true → false 切换是在微任务后自动完成的，不管成功失败都会切回 false，所以不会出现"pending 永远卡住"的情况。

4. **乐观更新集成点**：在渲染阶段，如果有 \`useOptimistic\` Hook，React 会基于当前 pending 的 Action fork 一份乐观状态，用乐观状态渲染 UI；等 Action 完成或失败，再自动回滚到真实状态。

简单说：**React 把"异步操作 + 状态管理 + 优先级调度"这三件事打包自动化了**。你只需要写业务异步逻辑，剩下的交给 React。

## 常见陷阱
- **在 Action 里同步抛出错误**：如果错误是同步抛出（比如参数校验失败抛错），React 也能捕获，但推荐返回错误对象而不是抛出，更可控。
- **期望 Action 一定只执行一次**：React 可能因为并发更新中断重来，Action 函数需要满足幂等性。
- **把 Action 当成 Effect 使用**：Action 是由用户交互触发的（提交表单、点击按钮），不是副作用。副作用还是用 \`useEffect\`。
- **忘记 Action 是异步的**：Action 执行过程中，pending 是 true，但这不代表网络请求还在发送——网络请求由你控制，React 只管状态。
- **Actions 取代所有异步逻辑**：不是的。复杂的异步流程（多步骤、链式调用）还是需要你自己用 \`useState\` + \`useEffect\` 管理。Actions 适合"单次用户操作触发一次异步请求"的场景。

## 性能提示
- **利用自动 Transition**：Actions 默认就是低优先级，不需要你再手动包一层 \`startTransition\`，重复包不会有额外好处。
- **复杂表单拆分成多个 Actions**：多个按钮用不同的 \`formAction\`，每个 Action 只做一件事，比一个大 Action 里判断按钮点击更清晰。
- **乐观更新减少感知延迟**：能做乐观更新就一定要做，用户会觉得"操作立刻生效"，体验比等请求回来再更新好很多。
- **避免在 Action 里做大量 setState**：多个 setState 会被自动批处理，但如果能一次更新完更好，减少不必要的渲染。
- **pending 状态只用于视觉反馈**：不要用 pending 禁用输入框，应该让用户在请求过程中还能继续操作（可并发），除非业务必须互斥。
`,
    code: `// 用纯 JS 模拟 Action 的 pending/error 自动管理机制
// 演示核心：自动切换 pending、自动捕获错误、支持乐观更新

// ---------- 模拟 React 的 Action 执行器 ----------
function createActionRunner() {
  return {
    isPending: false,
    error: null,
    run: async function(action, ...args) {
      // 关键点 1：开始执行前自动设置 pending = true
      this.isPending = true;
      this.error = null;
      console.log("[ActionRunner] 开始执行，isPending =", this.isPending);
      
      try {
        // 关键点 2：执行用户的异步 Action
        const result = await action(...args);
        console.log("[ActionRunner] 执行成功");
        return result;
      } catch (err) {
        // 关键点 3：自动捕获错误，保存到状态
        this.error = err;
        console.log("[ActionRunner] 捕获错误：", err.message);
        throw err; // 仍可让调用方处理
      } finally {
        // 关键点 4：不管成功失败，最后都把 pending 设回 false
        this.isPending = false;
        console.log("[ActionRunner] 执行结束，isPending =", this.isPending);
      }
    }
  };
}

// ---------- 模拟乐观更新 ----------
function createOptimisticState(initialState) {
  return {
    current: initialState,
    optimistic: null,
    // 应用乐观更新：先显示新值
    applyOptimistic: function(updater) {
      this.optimistic = updater(this.current);
      console.log("[optimistic] 应用乐观更新，显示：", this.optimistic);
      return this.optimistic;
    },
    // 成功：提交新值
    commit: function(newState) {
      this.current = newState;
      this.optimistic = null;
      console.log("[optimistic] 提交成功，current =", this.current);
    },
    // 失败：回滚到旧值
    rollback: function() {
      this.optimistic = null;
      console.log("[optimistic] 请求失败，回滚到：", this.current);
    },
    // 获取当前显示的值（优先乐观）
    getDisplayValue: function() {
      return this.optimistic !== null ? this.optimistic : this.current;
    }
  };
}

// ---------- 演示 1：成功场景 ----------
console.log("========== 演示 1：Action 成功执行 ==========");
const runner1 = createActionRunner();
async function successAction(data) {
  console.log("  正在保存数据：", data);
  await new Promise(resolve => setTimeout(resolve, 100));
  return "ok";
}

runner1.run(successAction, { name: "张三" })
  .then(() => console.log("演示 1 完成\\n"));

// ---------- 演示 2：失败场景 ----------
setTimeout(async () => {
console.log("========== 演示 2：Action 抛出错误 ==========");
const runner2 = createActionRunner();
async function failAction() {
  await new Promise(resolve => setTimeout(resolve, 100));
  throw new Error("网络请求失败");
}

runner2.run(failAction)
  .catch(() => console.log("演示 2 完成\\n"));
}, 200);

// ---------- 演示 3：乐观更新完整流程（成功） ----------
setTimeout(async () => {
console.log("========== 演示 3：乐观更新（成功） ==========");
const optState = createOptimisticState(["点赞"]);

// 用户点击点赞
const newCount = optState.getDisplayValue().length + 1;
optState.applyOptimistic(prev => [...prev, "点赞"]);
console.log("UI 现在显示：", optState.getDisplayValue().length, "个赞");

// 模拟网络请求成功
await new Promise(resolve => setTimeout(resolve, 100));
optState.commit(optState.getDisplayValue());
console.log("最终状态：", optState.getDisplayValue().length, "个赞");
console.log("演示 3 完成\\n");
}, 500);

// ---------- 演示 4：乐观更新完整流程（失败回滚） ----------
setTimeout(async () => {
console.log("========== 演示 4：乐观更新（失败回滚） ==========");
const optState = createOptimisticState(["点赞"]);

// 用户点击取消点赞
optState.applyOptimistic(prev => prev.slice(0, -1));
console.log("UI 乐观更新后：", optState.getDisplayValue().length, "个赞");

// 模拟网络请求失败
await new Promise(resolve => setTimeout(resolve, 100));
optState.rollback();
console.log("回滚后：", optState.getDisplayValue().length, "个赞");
console.log("演示 4 完成");

console.log("\\n========== 总结 ==========");
console.log("1. React 19 Action 自动在开始前设 pending = true");
console.log("2. 自动捕获异步错误，不会让应用崩溃");
console.log("3. 不管成功失败，最后都把 pending 设回 false");
console.log("4. 乐观更新：先显示新值，成功提交失败回滚，提升用户体验");
}, 800);
`,
  },
  {
    id: "react19-use-action-state",
    title: "useActionState",
    icon: "📋",
    group: "Actions 与表单",
    content: `## 一、useActionState 解决什么问题
\`useActionState\` 是 React 19 专为 Actions 设计的一个 Hook，用来替代你之前手写的：

\`\`\`jsx
// React 18 以前的写法，非常繁琐
const [state, setState] = useState(initialState);
const [isPending, startTransition] = useTransition();

async function handleSubmit(formData) {
  const newState = await myAction(state, formData);
  setState(newState);
}
\`\`\`

这种写法需要：
1. 自己维护 state
2. 自己管理 isPending
3. 自己包装 transition
4. 自己处理返回的新状态

\`useActionState\` 把这一切都打包了。只要你传入一个 Action，它就返回：
- 当前状态
- 给表单用的 \`formAction\`
- \`isPending\` 标志

一句话：**\`useActionState\` = useState + useTransition + 自动调用 Action + 更新状态**。

## 二、API 签名

\`\`\`jsx
const [state, formAction, isPending] = useActionState(
  action,
  initialState,
  permalink? // 可选，用于序列化 URL
);
\`\`\`

参数说明：
- \`action(prevState, formData)\`：你的 Action 函数，接收上一次的状态和表单数据，返回新状态。
- \`initialState\`：初始状态，第一次渲染时用。
- \`permalink\`：可选字符串，用于渐进增强场景，如果 JS 没加载，表单提交会跳转到这个 URL。

返回值说明：
- \`state\`：当前状态，由 Action 返回值更新。
- \`formAction\`：包装好的 props，直接传给 \`<form action={formAction}>\`。
- \`isPending\`：boolean，Action 是否正在执行。

## 三、基本用法示例

\`\`\`jsx
async function increment(prevState) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return prevState + 1;
}

function Counter() {
  const [count, formAction, isPending] = useActionState(increment, 0);
  
  return (
    <form action={formAction}>
      <p>Count: {count}</p>
      <button disabled={isPending} type="submit">
        {isPending ? "加载中..." : "加 1"}
      </button>
    </form>
  );
}
\`\`\`

就是这么简洁！所有状态管理都交给 Hook 了。

## 四、表单场景实战

最常见的场景就是表单提交后返回错误/成功消息：

\`\`\`jsx
async function login(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  
  try {
    await api.login(email, password);
    return {
      ...prevState,
      error: null,
      success: true
    };
  } catch (err) {
    return {
      ...prevState,
      error: err.message,
      success: false
    };
  }
}

function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, {
    error: null,
    success: false
  });
  
  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      {state.error && <p className="error">{state.error}</p>}
      <button disabled={isPending} type="submit">
        {isPending ? "登录中..." : "登录"}
      </button>
    </form>
  );
}
\`\`\`

你不需要自己处理任何状态变化——Action 返回什么，\`state\` 就是什么。

## 五、非表单场景用法
虽然叫 \`formAction\`，但它返回的就是一个普通函数，你可以在任何地方调用：

\`\`\`jsx
async function toggleLike(prevLikes, postId) {
  await api.toggleLike(postId);
  return prevLikes + 1;
}

function LikeButton({ postId, initialLikes }) {
  const [likes, action, isPending] = useActionState(
    (prev) => toggleLike(prev, postId),
    initialLikes
  );
  
  return (
    <button onClick={() => action()} disabled={isPending}>
      ❤️ {likes}
    </button>
  );
}
\`\`\`

注意：非表单场景调用时，\`formData\` 参数是 undefined，你的 Action 签名要适配。

## 六、渐进增强
\`useActionState\` 第三个参数 \`permalink\` 用于渐进增强：如果用户没加载 JS，表单会正常提交到这个 URL，由服务端渲染结果。这和 Server Actions 配合非常好。

---

## 底层原理
\`useActionState\` 内部其实就是 \`useReducer\` + \`useTransition\` 的简单封装，非常好理解：

1. **reducer 定义**：它内部定义了一个 reducer，有两个动作类型：
   - \`START\`：设置 \`isPending = true\`，状态不变。
   - \`COMPLETE\`：接收 Action 返回的新状态，更新 state，设置 \`isPending = false\`。

2. **dispatch 时机**：当 \`formAction\` 被调用（用户提交表单），它会：
   - 先 dispatch \`START\` → 立刻把 isPending 设为 true。
   - 然后异步调用用户提供的 \`action(currentState, formData)\`。
   - 拿到返回的新状态后，在 \`startTransition\` 里 dispatch \`COMPLETE(newState)\`。
   - 因为是在 transition 里，所以更新自动是低优先级。

3. **闭包陷阱规避**：因为用的是 reducer，每次调用 Action 都能拿到**最新的** previous state，不会遇到 "setState 闭包拿不到旧状态" 的问题。这比你自己用 \`useState\` + async 更可靠。

4. **自动批处理**：整个过程（START → COMPLETE）的两次更新会被 React 自动批处理吗？不——START 是同步的（立刻更新 isPending），COMPLETE 是异步的（等 Action 完成），所以分两次渲染，这正好符合我们想要的：先显示 loading，再显示结果。

所以本质上：**\`useActionState\` 就是帮你写好了 reducer 和 transition 包装，不用你自己手写模板代码**。

## 常见陷阱
- **Action 签名写错**：第一个参数必须是 \`prevState\`，第二个才是 \`formData\`，写反了会拿到错误的初始值。
- **依赖闭包拿旧状态**：如果你自己用 \`useState\` 写，可能会因为闭包拿到旧 state，但 \`useActionState\` 用 reducer 天然避免了这个问题——放心用就行。
- **在 Action 里直接 mutate prevState**：虽然 reducer 允许你 mutate，但推荐返回新对象，和平时 useState 一样， immutable 风格更安全。
- **期望 isPending 在 Action 开始后立刻变 true**：START 是同步 dispatch 的，所以 isPending 会立刻更新，不用担心，不需要 setTimeout。
- **把 permalink 忘了**：做渐进增强的时候别忘了传第三个参数，否则无 JS 环境下表单不知道提交去哪儿。

## 性能提示
- **状态粒度要适中**：把相关的错误、成功状态放在同一个 state 里，不要拆成多个 \`useActionState\`，减少重复渲染。
- **利用 isPending 做按钮禁用**：这是最常见、最合理的用法，防止重复提交。
- **初始状态要合理**：错误初始化为 null，success 初始化为 false，符合用户首次打开页面的预期。
- **不要在 state 里放不需要触发重渲染的数据**：如果某些数据不需要在 UI 上显示，没必要放在 useActionState 里，放 ref 就行。
- **配合 useOptimistic 使用**：\`useActionState\` 管服务端返回的最终状态，\`useOptimistic\` 管乐观 UI，配合起来体验最佳。
`,
    code: `// 用纯 JS 模拟 useActionState 的 reducer 模型
// 演示核心：状态流转、pending 自动管理、formAction 封装

// ---------- 模拟 useActionState ----------
function useActionState(action, initialState) {
  let state = initialState;
  let isPending = false;
  const listeners = [];
  
  function reducer(currentState, actionObj) {
    switch (actionObj.type) {
      case 'START':
        return { ...currentState, isPending: true };
      case 'COMPLETE':
        return { state: actionObj.newState, isPending: false };
      default:
        return currentState;
    }
  }
  
  function dispatch(actionObj) {
    const next = reducer({ state, isPending }, actionObj);
    state = next.state;
    isPending = next.isPending;
    listeners.forEach(l => l(state, isPending));
  }
  
  // 返回包装好的 formAction
  function formAction(formData) {
    // 关键点 1：开始前同步设置 pending = true
    dispatch({ type: 'START' });
    
    // 关键点 2：异步调用用户 action，拿到新状态
    action(state, formData).then(newState => {
      // 关键点 3：在 transition（这里用 setTimeout 模拟低优先级）更新状态
      setTimeout(() => {
        dispatch({ type: 'COMPLETE', newState });
      }, 0);
    });
  }
  
  function subscribe(listener) {
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx >= 0) listeners.splice(idx, 1);
    }
  }
  
  return { state, formAction, isPending, subscribe };
}

// ---------- 演示：登录表单 Action ----------
console.log("========== 演示：useActionState 登录表单 ==========");

async function loginAction(prevState, formData) {
  console.log("  Action 执行：登录 email =", formData.get('email'));
  await new Promise(resolve => setTimeout(resolve, 150));
  
  // 模拟：密码错误返回错误
  if (formData.get('password') !== '123456') {
    return {
      ...prevState,
      error: '密码错误，请重试'
    };
  }
  
  return {
    ...prevState,
    error: null,
    success: true
  };
}

// 初始化 Hook
const initialState = { error: null, success: false };
const { state: initialState_, formAction, subscribe } = 
  useActionState(loginAction, initialState);

// 模拟渲染订阅
let currentState = initialState_;
let currentIsPending = false;
subscribe((state, isPending) => {
  currentState = state;
  currentIsPending = isPending;
  console.log("  [渲染] state =", JSON.stringify(currentState), 
              "isPending =", currentIsPending);
});

console.log("初始状态：state =", JSON.stringify(currentState), 
            "isPending =", currentIsPending);

// 模拟用户提交表单（密码错误）
console.log("\\n用户提交：email=test@example.com password=wrong");
formAction({
  get: function(name) {
    return name === 'email' ? 'test@example.com' : 'wrong';
  }
});

console.log("提交后立刻：isPending =", currentIsPending);

// ---------- 演示成功场景 ----------
setTimeout(() => {
console.log("\\n---------- 密码正确重试 ----------");
console.log("用户提交：email=test@example.com password=123456");
formAction({
  get: function(name) {
    return name === 'email' ? 'test@example.com' : '123456';
  }
});
console.log("提交后立刻：isPending =", currentIsPending);

setTimeout(() => {
  console.log("\\n========== 最终结果 ==========");
  console.log("state.error =", currentState.error);
  console.log("state.success =", currentState.success);
  console.log("isPending =", currentIsPending);
  console.log("\\n核心点验证：");
  console.log("1. 提交后 isPending 立刻变为 true（同步更新）");
  console.log("2. Action 异步完成后，state 更新，isPending 变回 false");
  console.log("3. Action 总能拿到最新的 previous state（reducer 保证）");
  console.log("4. 用户只需要写业务逻辑，状态流转全由 Hook 管理");
}, 250);
}, 300);
`,
  },
  {
    id: "react19-use-form-status",
    title: "useFormStatus",
    icon: "📝",
    group: "Actions 与表单",
    content: `## 一、useFormStatus 解决什么问题
当你用 React 19 的 \`<form action={...}>\` 时，pending 状态在 \`useActionState\` 里，而你的提交按钮可能在**子组件**里（比如封装好的 \`<SubmitButton>\`）。

怎么让子组件读到父表单的 pending 状态？在 React 19 之前，你需要：
1. 通过 props 层层传递
2. 或者自己整个 Context 存 pending

React 19 内置了 \`useFormStatus\` Hook，专门解决这个问题：子组件只要调用这个 Hook，就能拿到最近的父表单的 pending 状态。

## 二、API 用法

\`\`\`jsx
import { useFormStatus } from "react";

function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? "提交中..." : "提交"}
    </button>
  );
}
\`\`\`

返回对象包含四个字段：
- \`pending\`：boolean，表单当前是否正在处理 Action。
- \`data\`：\`FormData | null\`，当前正在提交的表单数据（只读）。
- \`method\`：\`'get' | 'post' | null\`，表单的 method 属性。
- \`action\`：\`string | Function | null\`，表单的 action 属性。

最常用的就是 \`pending\`，其他字段用于高级场景（比如根据 method 显示不同文案）。

## 三、必须遵守的规则
\`\`\`jsx
// ✅ 正确：SubmitButton 是 form 的直接子组件
<form action={...}>
  <input name="email" />
  <SubmitButton />
</form>

// ❌ 错误：在 form 外面调用 useFormStatus
function Wrong() {
  const { pending } = useFormStatus(); // 永远返回 false
  return <button disabled={pending} />;
}
\`\`\`

**硬性规则**：\`useFormStatus\` 必须在 **<form> 的子组件** 内调用，不能在 form 外面，也不能在同一个组件里（就是放 form 的那个组件不能自己调用，必须是子组件）。

为什么？因为 Context 是由 \`<form>\` 组件本身提供的，只有子组件才能读到。

## 四、实战示例：封装通用 SubmitButton

这是最常见的用法：封装一个知道自己该不该禁用的提交按钮。

\`\`\`jsx
// components/SubmitButton.jsx
import { useFormStatus } from "react";

export default function SubmitButton({ children, ...props }) {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className={pending ? "btn-loading" : "btn"}
      {...props}
    >
      {pending ? (
        <>
          <Spinner /> 提交中...
        </>
      ) : (
        children
      )}
    </button>
  );
}

// 在表单中使用
function LoginForm() {
  const [state, formAction] = useActionState(login, {});
  
  return (
    <form action={formAction}>
      <input name="email" />
      <input name="password" type="password" />
      <SubmitButton>登录</SubmitButton>  {/* 自动禁用 */}
    </form>
  );
}
\`\`\`

完美！\`SubmitButton\` 自己知道要不要禁用，不需要父组件传 \`disabled={isPending}\`，减少了 props 传递。

## 五、和 useActionState 的区别

| 维度 | useActionState | useFormStatus |
|------|----------------|---------------|
| 用途 | 管理 Action 返回的整个状态 | 读取表单的 pending 状态给子组件 |
| 返回值 | [state, formAction, isPending] | { pending, data, method, action } |
| 所有权 | 当前组件拥有 Action 状态 | 从父表单 Context 读取 |
| 是否修改状态 | 是，维护完整 state | 否，只读 |

一句话：**你在表单组件里用 \`useActionState\`，在它的子按钮里用 \`useFormStatus\`**。

## 六、读取提交中的 FormData
\`data\` 字段让你可以拿到正在提交的表单数据，做一些有趣的事：

\`\`\`jsx
function SubmitButton() {
  const { pending, data } = useFormStatus();
  const email = data?.get('email');
  
  return (
    <button disabled={pending}>
      {pending ? \`正在登录 \${email}...\` : "登录"}
    </button>
  );
}
\`\`\`

可以在按钮上显示正在提交的邮箱，用户体验更好。

---

## 底层原理
\`useFormStatus\` 的实现非常简洁，核心就是 **Context 传递**：

1. **\`<form>\` 组件提供 Context**：当 React 渲染一个带 \`action={fn}\` 的 \`<form>\` 时，它会在内部创建一个 Form Context，把当前表单的 pending 状态、data、method、action 都放进去。

2. **子组件通过 useFormStatus 读取 Context**：\`useFormStatus\` 本质上就是 \`useContext(FormContext)\`，只是做了一层封装，让 API 更直观。

3. **pending 变化触发 Context 更新**：当表单开始提交，pending 从 false → true，Context 更新，所有消费 \`useFormStatus\` 的子组件都会自动重渲染，按钮随之禁用。提交完成后，pending 变回 false，按钮重新启用。

4. **为什么必须在子组件调用**：因为 Context 是由 form 组件本身提供的，form 组件自己无法读取自己提供的 Context——Context 只能给后代组件用。这就是为什么 "不能在同一个组件调用" 的限制，不是语法限制，是设计如此。

所以说穿了：**\`useFormStatus = 内置 Context + Hook 封装**，帮你省了自己写 Context 的样板代码。

## 常见陷阱
- **在 form 所在组件调用**：这是最常见的错误。必须把子按钮拆出去，必须是子组件。
- **以为 data 一直有值**：只有当 pending = true 时，data 才有值，平时是 null，访问前要做空检查。
- **修改 data 对象**：data 是只读的，不要修改它，它只是给你读信息用的。
- **嵌套 form 的问题**：HTML 不允许嵌套 form，React 也不支持，所以不用担心嵌套 Context，每个子 form 都会覆盖父的 Context。
- **多个 button 的 formAction**：即使你用按钮的 \`formAction\`，\`pending\` 仍然是整个表单的，所以所有子按钮都会显示 pending，符合预期。

## 性能提示
- **只抽按钮到子组件**：不需要把整个表单都拆了，只把提交按钮抽成子组件就能用，成本最低。
- **不要过度消费 Context**：只有真正需要 pending 的组件才调用 \`useFormStatus\`，不然会多一些不必要的重渲染。
- **配合 CSS transition**：pending 变化时用 CSS 过渡显示 loading，比生硬切换更流畅。
- **利用 data 做用户体验优化**：比如显示"正在发送验证码到 {phone}"，这种小细节体验提升很大，成本几乎为零。
- **多个提交按钮共享状态**：所有 \`useFormStatus\` 都读到同一个 pending，所以多个按钮都会同时禁用，防止重复提交，正好符合安全要求。
`,
    code: `// 用纯 JS 模拟 useFormStatus 的 Context 传递机制
// 演示核心：父表单提供 Context，子组件读取 pending 状态

// ---------- 模拟 React Context 实现 ----------
class Context {
  constructor(defaultValue) {
    this.defaultValue = defaultValue;
    this.currentValue = defaultValue;
    this.subscribers = [];
  }
  
  provider(value) {
    this.currentValue = value;
    this.subscribers.forEach(cb => cb(value));
  }
  
  subscribe(cb) {
    this.subscribers.push(cb);
    return () => {
      const idx = this.subscribers.indexOf(cb);
      if (idx >= 0) this.subscribers.splice(idx, 1);
    };
  }
  
  getValue() {
    return this.currentValue;
  }
}

// 创建 Form Context（React 内置）
const FormContext = new Context({
  pending: false,
  data: null,
  method: null,
  action: null
});

// ---------- 模拟 useFormStatus Hook ----------
function useFormStatus(subscriber) {
  const value = FormContext.getValue();
  FormContext.subscribe(subscriber);
  return value;
}

// ---------- 模拟 <form> 组件 ----------
function Form({ action, method = "post" }) {
  let pending = false;
  
  function submit(formData) {
    // 开始提交：更新 Context pending = true
    pending = true;
    FormContext.provider({
      pending,
      data: formData,
      method,
      action
    });
    console.log("[Form] 开始提交，pending = true");
    
    // 异步执行 Action
    action(formData).then(() => {
      // 完成：更新 Context pending = false
      pending = false;
      FormContext.provider({
        pending,
        data: null,
        method,
        action
      });
      console.log("[Form] 提交完成，pending = false");
    });
  }
  
  return { submit };
}

// ---------- 模拟 <SubmitButton> 子组件 ----------
function SubmitButton(label) {
  let renderedPending = false;
  
  function render() {
    const { pending, data } = useFormStatus(() => render());
    renderedPending = pending;
    console.log("  [SubmitButton 渲染] disabled =", pending, 
                data ? \`data.email = \${data.get('email')}\` : "");
    return renderedPending;
  }
  
  render(); // 初始渲染
  return { getDisabled: () => renderedPending };
}

// ---------- 演示 ----------
console.log("========== 演示：useFormStatus ==========");
console.log("初始渲染：");

// 创建表单和按钮
const loginAction = async (formData) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  console.log("  [loginAction] 异步执行完成");
};

const form = Form({ action: loginAction, method: "post" });
const button = SubmitButton("登录");

console.log("\\n初始 disabled =", button.getDisabled());

// 用户提交表单
console.log("\\n用户点击提交，email = test@example.com");
form.submit({
  get: (name) => name === "email" ? "test@example.com" : null
});

console.log("提交后立刻，按钮 disabled =", button.getDisabled());

// 检查最终状态
setTimeout(() => {
  console.log("\\nAction 完成后，按钮 disabled =", button.getDisabled());
  console.log("\\n========== 原理验证 ==========");
  console.log("1. <form> 组件通过 Context 向下传递 pending 状态");
  console.log("2. 子组件 <SubmitButton> 通过 useFormStatus 读取");
  console.log("3. pending 变化时，Context 更新触发子组件重渲染");
  console.log("4. 不需要通过 props 层层传递，减少样板代码");
}, 300);
`,
  },
  {
    id: "react19-use-optimistic",
    title: "useOptimistic",
    icon: "✨",
    group: "Actions 与表单",
    content: `## 一、useOptimistic 解决什么问题
什么是**乐观更新**？就是：
- 用户操作后，**不等服务端返回**，立刻把 UI 更新成预期结果
- 如果服务端成功了，就保持这个结果
- 如果服务端失败了，自动回滚到原来的值

优点是什么？**用户感知极快**——点完赞立刻看到数字+1，不用等网络请求走完，体验提升非常明显。

React 19 之前，你要自己手写乐观更新：
1. 保存旧状态
2. 立刻更新到乐观状态
3. 请求失败再手动切回去
4. 处理并发冲突...

非常麻烦。React 19 内置了 \`useOptimistic\` Hook，这一切全自动化了。

## 二、API 签名

\`\`\`jsx
const optimisticState = useOptimistic(realState, updateFn);
\`\`\`

参数：
- \`realState\`：真实状态（服务端返回的权威值）
- \`updateFn(prevOptimistic, param)\`：根据参数计算乐观状态的函数

返回：
- \`optimisticState\`：你应该在 UI 上渲染这个状态

当有 Action 正在进行时，React 自动返回乐观状态；当 Action 完成（成功或失败），自动回到真实状态。

## 三、实战：点赞功能

这是最经典的乐观更新场景：

\`\`\`jsx
import { useOptimistic } from "react";

async function toggleLike(postId) {
  await api.toggleLike(postId);
  return newCount;
}

function LikeButton({ postId, initialCount }) {
  const [count, setCount] = useState(initialCount);
  // 使用 useOptimistic：count 是真实值，返回 optimisticCount
  const [optimisticCount, addOptimistic] = useOptimistic(
    count,
    (prev, increment) => prev + increment
  );
  
  async function handleClick() {
    // 1. 乐观更新：立刻把计数+1 显示给用户
    addOptimistic(1);
    // 2. 发送请求给服务端
    try {
      const newCount = await toggleLike(postId);
      setCount(newCount); // 更新真实状态
    } catch (err) {
      // 什么都不用做！React 自动回滚到真实状态（原来的 count）
    }
  }
  
  return (
    <button onClick={handleClick}>
      ❤️ {optimisticCount}
    </button>
  );
}
\`\`\`

就这么几行代码！你甚至不需要写 catch 里的回滚逻辑——React 自动帮你回滚。

## 四、实战：表单提交乐观更新

配合 Actions 做表单提交：

\`\`\`jsx
function TodoList({ initialTodos }) {
  const [todos, setTodos] = useState(initialTodos);
  const [optimisticTodos, addOptimistic] = useOptimistic(
    todos,
    (prev, newTodo) => [...prev, newTodo]
  );
  
  async function addTodo(formData) {
    const title = formData.get('title');
    // 乐观添加
    addOptimistic({ id: Date.now(), title, completed: false });
    // 保存到服务端
    const newTodo = await api.createTodo(title);
    // 更新真实状态
    setTodos([...todos, newTodo]);
  }
  
  return (
    <form action={addTodo}>
      <input name="title" placeholder="新建 todo" />
      <button type="submit">添加</button>
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </form>
  );
}
\`\`\`

用户输入完按回车，立刻看到 todo 出现在列表里，根本感觉不到网络延迟。

## 五、适用场景
✅ 非常适合：
- 点赞 / 点踩 / 收藏
- 评论即时添加
- 拖拽排序（先挪位置，再保存）
- 切换开关状态
- 表单快速输入（每条消息立刻显示）

❌ 不太适合：
- 金额支付（钱不能错，必须等服务端确认）
- 破坏性操作（删除重要数据，用户确认等服务端返回更安全）
- 操作结果依赖服务端返回（必须拿到返回才能渲染下一步）

经验法则：**用户能接受偶发失败回滚，且追求快 → 乐观更新**；必须一步对 → 等服务端返回。

---

## 底层原理
\`useOptimistic\` 的实现很巧妙，它利用了 React 渲染流程中的一个关键点：**在渲染阶段，React 可以根据当前 pending 的 Actions，fork 一份状态快照**。

工作流程：

1. **首次渲染**：\`optimisticState = realState\`，直接返回真实状态。

2. **当乐观更新触发**：你调用 \`addOptimistic(param)\`，React 在当前 fiber 上记录"有一个 pending 的乐观更新"，参数是你传的 param，更新函数是 \`updateFn\`。

3. **本次渲染**：React 调用 \`updateFn(realState, param)\` 得到乐观状态，返回给你渲染。所以用户立刻看到乐观 UI。

4. **异步 Action 执行中**：只要 Action 还没完成，fiber 上一直记录着这个 pending 乐观更新，每次渲染都返回乐观状态。

5. **Action 完成**：
   - **成功**：你更新 \`realState\` 到最终值，React 清除 pending 乐观更新，\`optimisticState = new realState\`（和乐观值一致，所以不闪）。
   - **失败**：你不修改 \`realState\`（还是原来的），React 清除 pending 乐观更新，\`optimisticState 回到 realState\`——自动回滚完成。

**核心创新点**：乐观状态不是存在 state 里的，它是**在渲染过程中计算出来的派生状态**，只在 Action pending 期间存在。一旦 Action 结束，它就消失，自动回到真实状态。所以你根本不用手写回滚——只要不更新 realState，自然就回去了。

并发场景下，如果有多个 pending Actions，React 会按顺序把所有 pending 乐观更新都应用一遍，得到最终的乐观状态，完美支持并发操作。

## 常见陷阱
- **渲染真实状态而不是 optimisticState**：记住——UI 上要渲染 \`optimisticState\`，不是 \`realState\`。不然你用这个 Hook 干嘛？
- **在 updateFn 里 mutate 原状态**：和所有更新函数一样，返回新对象，不要改原数组/原对象。
- **期望乐观更新一定能成功**：乐观更新就是"乐观"，允许失败，失败自动回滚是设计的一部分，接受这个设定。
- **多个乐观更新顺序错**：React 会按调用顺序应用所有 pending 乐观更新，所以顺序是对的，不用担心并发。
- **把所有状态都乐观**：只有用户交互触发的、即时反馈需要的才做乐观，批量数据加载不用。

## 性能提示
- **updateFn 保持纯净**：不要在里面做副作用，它就是个纯函数，输入前一个状态，输出下一个乐观状态。
- **配合 Actions 使用最佳**：Actions 自动管理 pending，\`useOptimistic\` 自动知道哪个 Action pending，配合得天衣无缝。
- **大列表乐观更新**：拖拽排序时，先乐观换位置，再请求保存，用户会觉得拖拽丝滑流畅，完全感觉不到网络。
- **失败了可以加 toast 提示**：回滚是自动的，但你可以在 catch 里弹个 toast 告诉用户"网络不好，请重试"，体验更好。
- **避免不必要的 fork**：只有当真正有 pending 乐观更新时，React 才会 fork 状态，没有的时候就是直接返回 realState，没有额外开销。
`,
    code: `// 用纯 JS 模拟 useOptimistic 乐观更新机制
// 演示核心：先更新 UI 显示新值，异步请求失败后自动回滚

// ---------- 模拟 useOptimistic ----------
function useOptimistic(realState, updateFn) {
  let pending = null; // null 表示没有 pending 乐观更新
  
  function addOptimistic(param) {
    pending = param;
    console.log("[useOptimistic] 添加乐观更新，param =", param);
    // 触发重渲染（模拟）
    render();
  }
  
  function getOptimisticState() {
    if (pending === null) {
      // 没有 pending → 返回真实状态
      return realState;
    }
    // 有 pending → 计算乐观状态返回
    return updateFn(realState, pending);
  }
  
  function complete(success, newRealState) {
    if (success) {
      // 成功：真实状态更新成新值，清除 pending
      realState = newRealState;
      console.log("[useOptimistic] 更新成功，真实状态 =", realState);
    } else {
      // 失败：不修改真实状态，清除 pending → 自动回滚
      console.log("[useOptimistic] 更新失败，清除乐观更新 → 回滚");
    }
    pending = null;
    render();
  }
  
  let render = () => {
    console.log("  [渲染] 当前显示：", getOptimisticState());
  };
  
  return [getOptimisticState, addOptimistic, complete, render];
}

// ---------- 演示 1：点赞成功 ----------
console.log("========== 演示 1：点赞乐观更新（成功） ==========");
const [getState1, addOptimistic1, complete1] = useOptimistic(5, (prev, inc) => prev + inc);
console.log("初始状态（真实 = 5）：");
console.log("显示：", getState1());

// 用户点击点赞
console.log("\\n用户点击点赞，期望 +1");
addOptimistic1(1);
console.log("立刻显示：", getState1());

// 模拟网络请求成功
setTimeout(async () => {
  complete1(true, 6); // 更新真实状态为 6
  console.log("最终显示：", getState1());
  
  // ---------- 演示 2：点赞失败回滚 ----------
  setTimeout(() => {
  console.log("\\n========== 演示 2：点赞乐观更新（失败回滚） ==========");
  const [getState2, addOptimistic2, complete2] = useOptimistic(6, (prev, inc) => prev + inc);
  console.log("初始状态（真实 = 6）：");
  console.log("显示：", getState2());
  
  console.log("\\n用户点击取消点赞，期望 -1");
  addOptimistic2(-1);
  console.log("立刻显示：", getState2());
  
  // 模拟网络请求失败
  setTimeout(() => {
    complete2(false); // 失败，不修改真实状态
    console.log("网络失败后，最终显示：", getState2());
    console.log("（自动回滚到原来的 6）");
    
    // ---------- 总结 ----------
    console.log("\\n========== 核心原理总结 ==========");
    console.log("1. 用户操作后，addOptimistic 立刻触发乐观计算");
    console.log("2. UI 立刻显示乐观值，用户不用等网络");
    console.log("3. 成功：更新真实状态，清除乐观 → 最终就是乐观值");
    console.log("4. 失败：清除乐观，不更新真实 → 自动回滚到原真实值");
    console.log("5. 你不用写回滚逻辑！React 自动帮你做了");
  }, 200);
  }, 200);
}, 200);
`,
  },
  {
    id: "react19-form-actions",
    title: "form Actions 与 Server Actions",
    icon: "📨",
    group: "Actions 与表单",
    content: `## 一、React 19 <form> 原生支持 Action
React 19 对原生 \`<form>\` 做了扩展，直接支持把函数传给 \`action\` 和 \`formAction\`：

\`\`\`jsx
// 整个表单的主 action
<form action={handleSubmit}>

// 按钮的副 action
<button formAction={handleDelete}>删除</button>
\`\`\`

这就是 React 19 **Form Actions**——让你可以直接用异步函数处理表单提交，React 自动拦截默认行为、帮你管理 pending、调用你的异步函数。

## 二、基本用法

\`\`\`jsx
async function handleSubmit(formData: FormData) {
  const name = formData.get('name');
  const email = formData.get('email');
  await saveUser({ name, email });
  // 保存成功后跳转
  redirect('/dashboard');
}

function UserForm() {
  return (
    <form action={handleSubmit}>
      <input name="name" required />
      <input name="email" required />
      <button type="submit">保存</button>
    </form>
  );
}
\`\`\`

对比以前的写法：
- 以前：你需要 \`e.preventDefault()\` + 手动 \`new FormData(e.target)\` + 自己处理状态。
- 现在：React 帮你做了所有这些，你只需要写异步逻辑。

## 三、多个提交按钮：formAction
一个表单可以有多个不同的提交操作，用 \`formAction\`：

\`\`\`jsx
async function saveDraft(formData) {
  // 存草稿逻辑
}

async function publish(formData) {
  // 发布逻辑
}

function PostEditor() {
  return (
    <form action={publish}>
      <input name="title" />
      <textarea name="content" />
      <div>
        <button type="submit" formAction={saveDraft}>
          存草稿
        </button>
        <button type="submit">
          发布
        </button>
      </div>
    </form>
  );
}
\`\`\`

点击哪个按钮，就执行哪个 Action，非常清晰。不需要你自己在点击事件里判断。

## 四、渐进增强
如果不用 JavaScript，表单还能工作吗？答案是**能**。

如果你用的是 Server Actions，或者你的 action 是一个 URL 字符串：

\`\`\`jsx
<form action="/api/submit" method="post">
\`\`\`

这就是标准 HTML，浏览器原生就会提交表单到这个 URL，完全不需要 JavaScript。这就叫**渐进增强**：
- JS 加载了：React 拦截，用你的异步函数处理，SPA 体验
- JS 没加载：浏览器原生提交，服务端返回结果，功能仍然可用

这比"完全依赖 JS，没有 JS 表单根本不能用"优雅太多了。

## 五、配合 useActionState 使用
完整的表单写法通常是：

\`\`\`jsx
async function submitForm(prevState, formData) {
  const result = await validateAndSubmit(formData);
  return result; // { error: string | null, success: boolean }
}

function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitForm, {
    error: null,
    success: false
  });
  
  return (
    <form action={formAction}>
      <input name="email" required />
      <textarea name="message" required />
      {state.error && <p className="error">{state.error}</p>}
      <SubmitButton disabled={isPending}>
        {isPending ? "发送中..." : "发送消息"}
      </SubmitButton>
    </form>
  );
}
\`\`\`

- \`useActionState\` 给你包装好 \`formAction\`、状态、isPending
- \`<form action={formAction}>\` 交给 React 处理提交
- \`SubmitButton\` 用 \`useFormStatus\` 读 pending 自动禁用

完美分工，代码最少。

## 六、配合 Server Actions
React 19 + Next.js App Router 中，Form Actions + Server Actions 是绝配：

\`\`\`jsx
// 这就是一个 Server Action：直接在服务端运行
'use server';
export async function createPost(formData: FormData) {
  const title = formData.get('title');
  await db.posts.create({ title });
  redirect('/posts');
}

// 客户端组件
import { createPost } from './actions';

export default function CreatePostPage() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">创建</button>
    </form>
  );
}
\`\`\`

你不用写 API 路由，不用写 fetch，不用处理 CORS——直接把服务端函数传给表单就行，React 帮你处理所有通信。这就是 React 19 推崇的"表单全栈开发新范式"。

---

## 底层原理
React 拦截原生表单提交的过程很简单：

1. **监听 submit 事件**：当你给 \`<form>\` 传了一个函数作为 \`action\`，React 会自动监听 \`onSubmit\` 事件。

2. **拦截默认行为**：调用 \`e.preventDefault()\`，阻止浏览器原生提交（如果 action 是字符串 URL 就不阻止，让浏览器原生提交，支持渐进增强）。

3. **构造 FormData**：React 自动从 form 元素提取所有 input 的值，构造出 \`FormData\` 对象，传给你的 action 函数。

4. **触发 Action**：调用你的 action 函数，交给 Actions 机制处理——自动设置 pending、自动捕获错误、自动 transition。

5. **成功后自动 reset**：如果是没有受控的表单（即用原生 FormData），提交成功后 React 会自动重置表单，清空输入框，这是非常贴心的默认行为。

所以整个流程就是：**拦截 → 提取 FormData → 调用 Action → 自动重置**。你不用写一行样板代码。

对于 Server Actions，React 多做了一步：把 FormData 序列化后通过网络发到服务端，调用对应的服务端函数，再把结果返回，这个过程对开发者透明，你感觉就是直接调用了函数。

## 常见陷阱
- **忘记 input 有 name 属性**：FormData 是根据 \`name\` 收集字段的，如果 input 没有 \`name\`，根本不会出现在 FormData 里。这是最常见的错误。
- **把受控组件和 Form Action 混用**：其实也能用，但如果你已经用 \`useState\` 控了 value，不如直接从 state 拿数据，不需要用 FormData。
- **Server Actions 暴露敏感逻辑**：Server Actions 运行在服务端，代码不会发到客户端，但函数签名还是可见的，不要把密钥之类的直接当参数传。
- **多个按钮都不写 formAction**：如果多个按钮都是 type="submit"，点击哪个都会触发表单的主 action，而不是按钮自己的。需要哪个按钮用不同 action，就给它加 \`formAction\`。
- **期望 action 是同步的**：React 19 Form Action 设计就是给异步函数用的，同步函数也能跑，但没有意义。

## 性能提示
- **用非受控 + FormData 简单表单**：简单的联系表单、登录表单，不需要用 \`useState\` 控每个输入，让浏览器自己管，React 自动收集 FormData，代码最少最快。
- **复杂表单再用受控**：需要实时校验、动态增删字段的复杂表单，还是受控 + 自己管理 state 更灵活。
- **配合 useOptimistic 即时反馈**：提交评论时，先乐观加到列表，再提交，用户体验比提交成功再加好太多。
- **利用渐进增强**：即使做 SPA，也保留 url action 兜底，网络不好 JS 加载失败时用户还能提交，降级体验更好。
- **Server Actions 复用**：同一个 Server Action 可以给多个表单用，就像复用服务端函数一样，很方便。
`,
    code: `// 用纯 JS 模拟 form action 拦截机制
// 演示核心：拦截 submit 事件、提取 FormData、调用 action、自动 reset

// ---------- 模拟一个简化的 DOM form 元素 ----------
function createMockForm(fields) {
  return {
    fields: { ...fields },
    reset: function() {
      console.log("  [form] 表单已重置");
      Object.keys(this.fields).forEach(k => this.fields[k] = "");
    }
  };
}

// ---------- 模拟从 form 提取 FormData ----------
function extractFormData(form) {
  return {
    get: function(name) {
      return form.fields[name] || null;
    }
  };
}

// ---------- 模拟 React 处理 <form action={fn}> ----------
function handleFormSubmit(form, action) {
  // 关键点 1：拦截默认提交（这里我们模拟已经 preventDefault）
  console.log("[React] 拦截表单提交，preventDefault");
  
  // 关键点 2：提取 FormData
  const formData = extractFormData(form);
  console.log("[React] 提取 FormData 完成");
  
  // 关键点 3：调用 Action，自动处理 pending
  let isPending = true;
  console.log("[React] 开始执行 Action，isPending =", isPending);
  
  action(formData).then(() => {
    // 关键点 4：成功后自动重置表单
    isPending = false;
    console.log("[React] Action 执行成功，isPending =", isPending);
    form.reset();
  }).catch(err => {
    isPending = false;
    console.log("[React] Action 失败，isPending =", isPending);
    // 不重置，让用户修改后重新提交
  });
}

// ---------- 演示：联系表单提交 ==========
console.log("========== 演示：Form Action 拦截提交 ==========");

// 模拟用户填写了表单
const form = createMockForm({
  name: "张三",
  email: "zhangsan@example.com",
  message: "你好，我想咨询一下..."
});

console.log("用户填写：", form.fields);

// 定义 Action
async function submitContactForm(formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');
  
  console.log("  [Action] 提交数据：name=", name, "email=", email);
  await new Promise(resolve => setTimeout(resolve, 150));
  console.log("  [Action] 保存到服务端完成");
  return;
}

// 用户点击提交
console.log("\\n用户点击提交按钮");
handleFormSubmit(form, submitContactForm);

// ---------- 演示：表单有两个按钮 ==========
setTimeout(() => {
console.log("\\n========== 演示：多个按钮 + formAction ==========");

const form2 = createMockForm({
  title: "React 19 新特性",
  content: "这是一篇测试文章"
});

async function saveDraft(formData) {
  console.log("  [saveDraft] 保存草稿：title=", formData.get('title'));
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function publish(formData) {
  console.log("  [publish] 发布文章：title=", formData.get('title'));
  await new Promise(resolve => setTimeout(resolve, 100));
}

console.log("用户点击「存草稿」按钮，调用 saveDraft formAction");
handleFormSubmit(form2, saveDraft);

setTimeout(() => {
console.log("\\n用户填写完点击「发布」，调用 publish formAction");
form2.fields.title = "React 19 新特性笔记";
handleFormSubmit(form2, publish);

setTimeout(() => {
  console.log("\\n========== 原理总结 ==========");
  console.log("1. React 拦截原生 submit 事件，调用 preventDefault");
  console.log("2. 自动从表单提取所有 input 生成 FormData 对象");
  console.log("3. 调用用户提供的 action 函数，传入 FormData");
  console.log("4. 自动管理 pending 状态，提交成功后自动重置表单");
  console.log("5. 如果 action 是 URL，不拦截，让浏览器原生提交（渐进增强）");
  console.log("6. 不同按钮用不同 formAction，天然支持多操作");
}, 300);
}, 150);
}, 300);
`,
  },
];
