// =============================================================
// React 18 新特性交互式教程 —— 第三批章节（新 Hooks 与 API 组，共 6 章）
// =============================================================

export const chapters = [
  {
    id: "react18-use-id",
    title: "useId",
    icon: "🆔",
    group: "新 Hooks 与 API",
    content: `## useId：生成唯一稳定 ID 的新方案

### 一、为什么需要 useId

在 React 18 之前，前端开发者在表单场景中生成唯一 ID 通常会用 \`Math.random()\`、\`Date.now()\`、\`useRef(counter++)\` 等方式。这些方式在纯客户端渲染（CSR）下勉强可用，但一旦引入服务端渲染（SSR），就会出现严重问题：**hydration mismatch（水合不匹配）**。

考虑下面这段代码：

\`\`\`jsx
function FormField({ label }) {
  const id = Math.random().toString(36).slice(2);
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </div>
  );
}
\`\`\`

服务端渲染时生成一个随机 id（例如 \`abc123\`），写到 HTML 里发给浏览器。浏览器拿到 HTML 后开始 hydration，客户端 React 又调用一次 \`Math.random()\`，这次得到 \`xyz789\`。两边对不上，React 报错：

> Warning: Expected server HTML to contain a matching <input id="xyz789">...

更糟的是，\`Math.random()\` 不可复现，每次渲染都不同，导致 input 失去焦点、label 关联失效。

**useId 就是为了解决这个问题而诞生的**：它能在 SSR 和 CSR 之间生成**完全一致**的稳定 id。

### 二、基本用法

\`\`\`jsx
import { useId } from 'react';

function FormField({ label }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </div>
  );
}
\`\`\`

调用 \`useId()\` 返回一个字符串，例如 \`:r0:\`、\`:r1:\`、\`:r2:\`。这个 id 在同一个组件的多次渲染之间保持稳定，在服务端和客户端之间也保持一致。

### 三、生成的 id 格式

React 生成的 id 长这样：

\`\`\`
:r0:
:r1:
:r2:
:r0:
:r1:
\`\`\`

格式是 \`:r\` + 数字 + \`:\`。为什么用冒号包裹？因为**冒号在 CSS 选择器中需要转义**，这避免了与开发者自定义的 id 冲突。同时这种格式也保证了 id 不会与 \`querySelector\` 中可能的特殊符号冲突。

当你需要为多个元素生成 id 时，推荐做法是用一个 useId 作为前缀派生：

\`\`\`jsx
function PasswordField() {
  const id = useId();
  return (
    <div>
      <label htmlFor={id + '-password'}>密码</label>
      <input id={id + '-password'} type="password" />
      <label htmlFor={id + '-confirm'}>确认密码</label>
      <input id={id + '-confirm'} type="password" />
    </div>
  );
}
\`\`\`

### 四、适用场景

**✅ 适合：**

- **表单元素关联**：label 与 input 的 \`htmlFor/id\` 配对
- **ARIA 属性关联**：\`aria-labelledby\`、\`aria-describedby\`、\`aria-controls\`
- **可访问性（a11y）**：需要唯一 id 来连接相关元素的场景

**❌ 不适合：**

- **列表 key**：列表 key 应该来自数据本身的稳定标识（如 \`item.id\`），不要用 useId。useId 在组件树位置变化时会变化，会导致不必要的重渲染和状态丢失。
- **数据库主键**：useId 不是为持久化设计的，刷新页面后会变，不能作为数据标识。
- **生成密码/Token**：useId 不是加密安全的，不可预测性不足。

### 底层原理

useId 的核心是 **"树位置编码"（tree position encoding）**。React 在渲染过程中维护一棵 fiber 树，每个 fiber 节点都有自己在树中的位置。useId 根据组件在 fiber 树中的路径生成一个唯一标识。

具体算法（简化版）：

1. React 维护一个全局递增计数器 \`useIdNode\`，每次进入一个新的组件树层级，计数器递增。
2. 对于每个 useId 调用，React 沿着 fiber 树从当前节点向上回溯到根，记录路径上的"兄弟索引"。
3. 路径被编码为一串 base-32 数字，用 \`:r\` 前缀和 \`:R\` 分隔符组合。
4. 服务端和客户端使用相同的渲染顺序和算法，因此生成的 id 完全一致。

关键点：**id 的稳定性来自"位置"而非"随机数"**。只要组件树结构不变，id 就不变。这就是为什么 useId 不能用于列表 key——列表重排会改变位置，导致 id 变化。

React 18 内部用一个名为 \`requestFormReset\` 的机制保证：即使组件被 Suspense 挂起再恢复，id 也能保持稳定。

### 常见陷阱

1. **条件渲染导致 id 漂移**：如果在 \`if\` 分支里调用 useId，组件树结构变化会让后续组件的 id 全部改变。**useId 必须在顶层无条件调用**（这也是 Hooks 的通用规则）。

2. **多个根容器 id 冲突**：如果你在页面上同时渲染了多个 \`createRoot\`（例如微前端场景），它们的 id 计数器都从 0 开始，会产生 \`:r0:\` 冲突。解决方法是用 \`useId\` 的 \`identifierPrefix\` 选项（在 createRoot/hydrateRoot 中配置）：
   \`\`\`js
   createRoot(container, { identifierPrefix: 'app1' });
   // 生成的 id 会变成 :app1:r0:
   \`\`\`

3. **误用 useId 作为 key**：开发者常误以为 useId 是"自动 key 生成器"。实际上组件位置变化时 useId 会变，导致状态丢失。列表 key 必须来自数据。

4. **在 SSR 流式渲染中 id 不连续**：React 18 的流式 SSR 中，useId 仍能保持一致，但如果你手动拼接了 HTML 片段，可能出现 id 冲突。应始终通过 React 渲染。

### 性能提示

1. **避免在热路径上重复调用**：每次 useId 调用都会触发 fiber 树路径计算。一个组件内多次调用 useId 不如调用一次再派生：\`const id = useId(); const a = id + '-a';\`

2. **identifierPrefix 减少 hash 长度**：在大型应用中，树位置编码可能变长。使用 identifierPrefix 可以让 id 更短，减少 HTML 体积。

3. **不要在 useId 之上做加密假设**：useId 设计目标是"稳定且唯一"，不是"不可预测"。需要 token 时用 \`crypto.randomUUID()\`。

4. **SSR 下 useId 比自造方案快**：很多人用 \`react-uid\` 等第三方库，但 React 18 内置的 useId 与 fiber 树深度集成，性能优于第三方方案。
    `,
    code: `// =============================================================
// useId 树位置编码算法模拟
// 用纯 JS 演示 React 内部如何根据组件树位置生成稳定 id
// =============================================================

// 模拟 React fiber 树节点
class FiberNode {
  constructor(type, props = {}) {
    this.type = type;        // 组件类型（函数名/标签名）
    this.props = props;
    this.children = [];      // 子 fiber
    this.return = null;      // 父 fiber
    this.index = 0;          // 在兄弟中的索引
    this.memoizedId = null;  // 该节点上一次生成的 id（用于稳定性）
  }

  appendChild(child) {
    child.return = this;
    child.index = this.children.length;
    this.children.push(child);
    return child;
  }
}

// 模拟 React 内部的 id 生成器
// 核心思想：从当前 fiber 沿 return 链回溯到根，收集每个层级的"兄弟索引"
// 把这些索引用 base-32 编码并用 ':' 包裹，得到稳定唯一 id
class IdGenerator {
  constructor(prefix = '') {
    this.prefix = prefix;        // identifierPrefix（多 root 场景）
    this.base = 32;              // base-32 编码
    this.digitChars = '0123456789abcdefghijklmnopqrstuv'; // 32 个字符
  }

  // 把一个数字转成 base-32 字符串（React 实际实现简化版）
  toBase32(n) {
    if (n === 0) return '0';
    let s = '';
    while (n > 0) {
      s = this.digitChars[n % this.base] + s;
      n = Math.floor(n / this.base);
    }
    return s;
  }

  // 关键算法：根据 fiber 在树中的路径生成 id
  // 路径 = 从根到当前节点的每一层"兄弟索引"序列
  generateId(fiber) {
    const pathIndices = [];
    let node = fiber;
    while (node.return !== null) {
      pathIndices.push(node.index);
      node = node.return;
    }
    // 路径反转：从根到叶
    pathIndices.reverse();

    // React 实际用更复杂的分隔符，这里简化为 :r{编码}:
    const encoded = pathIndices.map(i => this.toBase32(i)).join('');
    const id = this.prefix + ':r' + encoded + ':';
    return id;
  }
}

// 模拟 useId Hook：在"渲染"过程中为每个调用分配 id
// 这里我们模拟"遍历组件树 + 收集 useId 调用"的过程
function renderTree(rootFiber, idGen) {
  const ids = [];
  function walk(fiber) {
    if (fiber.type === 'UsesIdComponent') {
      // 该组件调用了 useId()，生成一个 id
      const id = idGen.generateId(fiber);
      fiber.memoizedId = id;
      ids.push({ component: fiber.props.name, id });
    }
    for (const child of fiber.children) {
      walk(child);
    }
  }
  walk(rootFiber);
  return ids;
}

// ---------- 构建一棵模拟组件树 ----------
// 对应 React 代码：
// <App>
//   <Form name="login">
//     <Field name="user" />     <- 调用 useId
//     <Field name="pwd" />      <- 调用 useId
//   </Form>
//   <Form name="register">
//     <Field name="email" />    <- 调用 useId
//   </Form>
// </App>

const app = new FiberNode('App');
const form1 = app.appendChild(new FiberNode('Form', { name: 'login' }));
const field1 = form1.appendChild(new FiberNode('UsesIdComponent', { name: 'login.user' }));
const field2 = form1.appendChild(new FiberNode('UsesIdComponent', { name: 'login.pwd' }));
const form2 = app.appendChild(new FiberNode('Form', { name: 'register' }));
const field3 = form2.appendChild(new FiberNode('UsesIdComponent', { name: 'register.email' }));

console.log('=== 第一次渲染（模拟服务端 SSR）===');
const gen1 = new IdGenerator();
const ids1 = renderTree(app, gen1);
ids1.forEach(({ component, id }) => console.log(component + ' -> ' + id));

console.log('\\n=== 第二次渲染（模拟客户端 hydration）===');
// 关键：同样的树结构，生成同样的 id —— 这就是 SSR 一致性的来源
const gen2 = new IdGenerator();
const ids2 = renderTree(app, gen2);
ids2.forEach(({ component, id }) => console.log(component + ' -> ' + id));

console.log('\\n=== 一致性校验 ===');
const consistent = ids1.every((item, i) => item.id === ids2[i].id);
console.log('SSR 与 CSR id 是否完全一致: ' + (consistent ? '✅ 是' : '❌ 否'));

console.log('\\n=== 多 root 场景：用 identifierPrefix 避免冲突 ===');
// 微前端：两个 root 都从 :r0: 开始，会冲突
const microApp1 = new IdGenerator('app1');
const microApp2 = new IdGenerator('app2');
console.log('App1 的 Field id: ' + microApp1.generateId(field1));
console.log('App2 的 Field id: ' + microApp2.generateId(field1));
console.log('加了 prefix 后两者不再冲突 ✅');

console.log('\\n=== 树结构变化导致 id 漂移（陷阱演示）===');
// 在 form1 前插入一个新组件，所有后续 id 都变了
const newField = new FiberNode('UsesIdComponent', { name: 'login.captcha' });
form1.children.unshift(newField);
// 重新计算所有 children 的 index
form1.children.forEach((c, i) => { c.index = i; });
const gen3 = new IdGenerator();
const ids3 = renderTree(app, gen3);
ids3.forEach(({ component, id }) => console.log(component + ' -> ' + id));
console.log('⚠️ 注意：login.user 的 id 从 ' + ids1[0].id + ' 变成了 ' + ids3[0].id);
console.log('这正说明了 useId 不适合做列表 key —— 位置变，id 就变。');
`,
  },
  {
    id: "react18-use-sync-external-store",
    title: "useSyncExternalStore",
    icon: "🔄",
    group: "新 Hooks 与 API",
    content: `## useSyncExternalStore：安全订阅外部 store

### 一、Tearing 问题：并发渲染下的隐形杀手

React 18 引入并发渲染后，一个组件树的渲染过程可能被**中断和恢复**。这带来了一个新问题：**tearing（撕裂）**。

想象一个场景：你用 Redux 管理全局状态，组件 A 和组件 B 都读取同一个 store。在并发渲染下：

1. React 开始渲染，先渲染组件 A，A 读到 store 值 = 1。
2. React 暂停渲染（因为有更高优先级任务）。
3. 此时用户操作触发了 store 更新，store 值变成 2。
4. React 恢复渲染，继续渲染组件 B，B 读到 store 值 = 2。

结果：**同一次渲染中，A 看到的是 1，B 看到的是 2**。UI 上出现了不一致——这就是 tearing。同一帧的画面被"撕裂"成了两个版本。

在 React 17 的同步渲染下，这种情况不会发生，因为渲染一旦开始就不会中断。但 React 18 的并发特性让这成为可能。

### 二、useSyncExternalStore 的解决方案

React 团队给出的官方方案是 \`useSyncExternalStore\`：

\`\`\`js
import { useSyncExternalStore } from 'react';

const snapshot = useSyncExternalStore(
  subscribe,    // 订阅函数：注册回调
  getSnapshot,  // 客户端读取快照
  getServerSnapshot  // 服务端读取快照（可选）
);
\`\`\`

**三个参数：**

- **subscribe(callback)**：注册一个回调，store 变化时调用 callback 通知 React。返回取消订阅函数。
- **getSnapshot()**：返回当前 store 的快照。**关键要求**：必须返回缓存的引用（对象/数组要用引用相等性判断），不能每次返回新对象，否则会无限循环。
- **getServerSnapshot()**：SSR 时使用，返回服务端的初始快照。

**核心保证**：如果在渲染过程中 store 发生了变化，React 会**立即丢弃本次渲染结果，从头重新渲染**，从而避免 tearing。

### 三、与 Redux / Zustand 集成

**Redux** 内部已经基于 useSyncExternalStore 重新实现了 useSelector（react-redux v8+）：

\`\`\`js
// react-redux 内部简化实现
function useSelector(selector) {
  const store = useStore();
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
  );
}
\`\`\`

**Zustand** 同样如此：

\`\`\`js
import { useSyncExternalStore } from 'react';
import { store } from './store';

function useStore(selector) {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
  );
}
\`\`\`

### 四、getSnapshot 的"引用稳定性"陷阱

这是最容易踩坑的地方。考虑：

\`\`\`js
// ❌ 错误：每次返回新数组，导致无限重渲染
useSyncExternalStore(
  store.subscribe,
  () => store.getState().todos.filter(t => !t.done)  // 每次新数组
);

// ✅ 正确：返回稳定引用
useSyncExternalStore(
  store.subscribe,
  () => store.getState().todos  // 同一引用
);
// 过滤逻辑放到组件内部或 useMemo 里
\`\`\`

React 会用 \`Object.is\` 比较前后两次 getSnapshot 的返回值。如果不等，就认为 store 变了，触发重渲染。每次返回新数组会让 React 永远认为"变了"，陷入死循环。

### 底层原理

useSyncExternalStore 的实现可以拆成两部分：

**1. 订阅阶段（commit 后）**

组件挂载后，React 调用 \`subscribe\`，注册一个内部回调。当 store 变化时：

- store 调用回调 → React 标记该组件需要更新 → 进入调度队列
- 如果当前正处于渲染中（并发模式），React 会检测到"渲染期间 store 变了"，**立即中止渲染**，把这次更新作为高优先级任务重新调度

**2. 读取阶段（渲染时）**

每次渲染调用 \`getSnapshot\`。React 内部维护一个 \`cachedSnapshot\`：

- 渲染开始时调用一次 getSnapshot，缓存结果
- 渲染过程中如果 store 变化（subscribe 触发），React 比较新的 snapshot 与缓存
- 如果不同，**放弃当前渲染，从根重新开始**（这保证了同一次渲染中所有组件看到同一个快照）

**3. 为什么能防止 tearing**

关键在于"渲染中检测到变化就放弃重渲染"。即使 A 已经渲染了一半，只要 B 渲染前 store 变了，React 就会回头重新渲染 A，让 A 也看到新值。整个组件树要么全是旧值，要么全是新值，不会撕裂。

**4. getServerSnapshot 的作用**

SSR 时没有"订阅"概念（服务端不会响应 store 变化）。getServerSnapshot 提供一个静态初始值，保证服务端 HTML 与客户端首次渲染一致。

### 常见陷阱

1. **getSnapshot 返回新引用**：如前所述，返回新对象/数组会无限循环。**解法**：返回 store 中的原始引用，过滤/映射放到组件里用 useMemo 包裹。

2. **在 getSnapshot 中修改 store**：getSnapshot 必须是纯函数，不能有副作用。在里头 dispatch 会导致渲染期间更新，React 会报错。

3. **subscribe 没有返回取消订阅函数**：subscribe 必须返回一个清理函数，否则组件卸载后回调仍然挂着，造成内存泄漏。

4. **subscribe 在每次渲染都返回新函数**：useSyncExternalStore 会比较 subscribe 引用，如果每次都是新函数会导致重复订阅。**解法**：把 subscribe 定义在组件外部，或用 useCallback 包裹。

5. **store 变化但 snapshot 引用没变**：如果你直接修改 store 内部对象而不替换引用，React 检测不到变化。**store 必须遵循不可变更新**。

6. **与 useTransition 配合不当**：在 transition 中读 store 会有"过渡态读到旧值"的行为，需要理解 React 的过渡渲染语义。

### 性能提示

1. **selector 粒度尽量细**：返回整个 state 会让组件在 state 任何字段变化时都重渲染。返回具体字段（如 \`state.user.name\`）能减少不必要的渲染。

2. **用 useSyncExternalStoreWithSelector**：React 团队提供了 \`use-sync-external-store/with-selector\` 入口，内置 memoize 和相等性判断，避免手写 useMemo 出错。

3. **批量更新优化**：useSyncExternalStore 内部已经处理了批处理，多次同步 dispatch 只会触发一次重渲染。

4. **避免在 store 中存储派生数据**：派生数据应该用 selector 实时计算，避免 store 冗余字段同步问题。

5. **跨组件共享快照**：如果多个组件读同一份 store，React 会自动复用 getSnapshot 结果（在单次渲染内），无需手动缓存。
    `,
    code: `// =============================================================
// useSyncExternalStore 机制模拟
// 用纯 JS 实现一个简易 store + 订阅 + 快照，演示防 tearing
// =============================================================

// ---------- 一个最小化的外部 store ----------
function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();

  return {
    getState() { return state; },
    setState(updater) {
      const next = typeof updater === 'function' ? updater(state) : updater;
      // 不可变更新：必须替换引用
      if (next === state) return;
      state = next;
      // 通知所有订阅者
      listeners.forEach(fn => fn());
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);  // 返回取消订阅函数！
    },
  };
}

// ---------- 模拟 React 的 useSyncExternalStore ----------
// 关键：在"渲染"期间检测 store 是否变化，若变化则放弃并重渲染
class ReactLikeRenderer {
  constructor() {
    this.components = [];  // 注册的组件
    this.isRendering = false;
    this.renderToken = 0;  // 当前渲染批次标记
  }

  // 注册一个使用了 useSyncExternalStore 的组件
  useSyncExternalStore(component, store, getSnapshot) {
    component.store = store;
    component.getSnapshot = getSnapshot;
    component.cachedSnapshot = getSnapshot();  // 首次取快照
    this.components.push(component);

    // 模拟 commit 后订阅
    store.subscribe(() => {
      const newSnap = getSnapshot();
      if (!Object.is(newSnap, component.cachedSnapshot)) {
        console.log('  [订阅触发] ' + component.name + ' 检测到 store 变化，标记重渲染');
        this.scheduleRender();
      }
    });
  }

  // 渲染整个组件树
  scheduleRender() {
    if (this.isRendering) {
      // 渲染中被中断：模拟"放弃当前渲染，重新开始"
      console.log('  [中断] 渲染期间 store 变化，丢弃本次渲染，重新开始');
      this.renderToken++;  // 让正在进行的渲染失效
      this.isRendering = false;
      setTimeout(() => this.render(), 0);
      return;
    }
    this.render();
  }

  render() {
    this.isRendering = true;
    const myToken = this.renderToken;
    const results = [];

    for (const comp of this.components) {
      if (myToken !== this.renderToken) {
        // token 变了，说明被更高优先级中断
        console.log('  [放弃] ' + comp.name + ' 渲染前发现 token 失效');
        this.isRendering = false;
        return;
      }
      // 模拟"渲染中读快照"：如果在读取时发现 store 变了，会触发上面的中断
      const snap = comp.getSnapshot();
      if (!Object.is(snap, comp.cachedSnapshot)) {
        console.log('  [Tearing 检测] ' + comp.name + ' 渲染时发现快照不一致，重新渲染');
        comp.cachedSnapshot = snap;
      }
      results.push({ name: comp.name, value: snap });
    }

    this.isRendering = false;
    console.log('  [渲染完成] 快照: ' + JSON.stringify(results));
    return results;
  }
}

// ---------- 演示 1：基础订阅/快照 ----------
console.log('=== 演示 1：store 变化触发重渲染 ===');
const store = createStore({ count: 0 });
const react = new ReactLikeRenderer();

const compA = { name: 'CompA' };
const compB = { name: 'CompB' };
react.useSyncExternalStore(compA, store, () => store.getState().count);
react.useSyncExternalStore(compB, store, () => store.getState().count);

console.log('初始渲染：');
react.render();

console.log('\\n更新 store：count = 1');
store.setState({ count: 1 });

console.log('\\n更新 store：count = 2');
store.setState({ count: 2 });

// ---------- 演示 2：tearing 场景模拟 ----------
console.log('\\n=== 演示 2：Tearing 场景（无 useSyncExternalStore 时）===');
// 模拟旧方案：组件各自读 store，渲染中无检测
function naiveRender() {
  const a = store.getState().count;     // A 先读
  console.log('  CompA 读到: ' + a);
  // 模拟"渲染被中断，期间 store 变了"
  console.log('  [中断] 模拟并发渲染中断...');
  store.setState({ count: 999 });        // 渲染中 store 变化
  const b = store.getState().count;     // B 后读
  console.log('  CompB 读到: ' + b);
  console.log('  ⚠️ Tearing! A=' + a + ', B=' + b + '，UI 不一致！');
}
naiveRender();

// ---------- 演示 3：getSnapshot 引用稳定性陷阱 ----------
console.log('\\n=== 演示 3：getSnapshot 返回新引用导致无限循环 ===');
const badStore = createStore({ items: [1, 2, 3] });
let renderCount = 0;
const badGetSnapshot = () => {
  // ❌ 每次返回新数组（filter 创建新引用）
  return badStore.getState().items.filter(x => x > 0);
};
const goodGetSnapshot = () => {
  // ✅ 返回稳定引用
  return badStore.getState().items;
};

const prev1 = badGetSnapshot();
const prev2 = badGetSnapshot();
console.log('badGetSnapshot  两次调用引用是否相等: ' + (prev1 === prev2));
console.log('  → React 会认为 store 一直在变，触发无限重渲染 ❌');

const prev3 = goodGetSnapshot();
const prev4 = goodGetSnapshot();
console.log('goodGetSnapshot 两次调用引用是否相等: ' + (prev3 === prev4));
console.log('  → React 检测到引用未变，不会重渲染 ✅');

// ---------- 演示 4：getServerSnapshot ----------
console.log('\\n=== 演示 4：SSR 一致性（getServerSnapshot）===');
const ssrStore = createStore({ user: null });  // 服务端无用户
const clientSnapshot = () => ssrStore.getState().user;
const serverSnapshot = () => null;  // 服务端始终返回 null
console.log('服务端快照: ' + serverSnapshot());
console.log('客户端首次快照: ' + clientSnapshot());
console.log('  → 服务端 HTML 与客户端首次渲染一致，无 hydration mismatch ✅');
ssrStore.setState({ user: { name: 'Alice' } });
console.log('客户端登录后快照: ' + JSON.stringify(clientSnapshot()));
`,
  },
  {
    id: "react18-use-insertion-effect",
    title: "useInsertionEffect",
    icon: "🎨",
    group: "新 Hooks 与 API",
    content: `## useInsertionEffect：为 CSS-in-JS 而生的 Hook

### 一、为什么需要 useInsertionEffect

CSS-in-JS 库（如 styled-components、emotion）在运行时动态生成样式并注入到 DOM 中。在 React 18 之前，它们通常用 \`useLayoutEffect\` 来注入样式。但并发渲染引入了一个问题：

**useLayoutEffect 在 DOM 已经变更后执行**。如果样式在这时才注入，浏览器已经读取了一次旧的样式，可能会触发**强制重排（reflow）**，导致性能问题。

更严重的是：在并发渲染下，一个组件的渲染可能被中断多次。如果样式注入发生在 layout 阶段，每次中断恢复都可能导致样式闪烁（FOUC，Flash of Unstyled Content）。

**useInsertionEffect** 的执行时机在 **DOM 变更之前**，让 CSS-in-JS 库有机会在浏览器读取样式前就把样式注入好。

### 二、执行时机：四个阶段

React 18 的 effect 执行顺序：

\`\`\`
渲染（render，纯函数计算）
    ↓
useInsertionEffect  ← DOM 变更之前，用于注入样式
    ↓
DOM mutation（React 把变更提交到 DOM）
    ↓
useLayoutEffect    ← DOM 变更之后，浏览器 paint 之前
    ↓
browser paint（浏览器绘制）
    ↓
useEffect          ← paint 之后，异步执行（passive effect）
\`\`\`

### 三、基本用法

\`\`\`jsx
import { useInsertionEffect } from 'react';

function useCSS(rule) {
  useInsertionEffect(() => {
    const style = document.createElement('style');
    style.textContent = rule;
    document.head.appendChild(style);
    return () => style.remove();
  }, [rule]);
}

function StyledButton({ children }) {
  useCSS('.btn { color: red; }');
  return <button className="btn">{children}</button>;
}
\`\`\`

### 四、与 useLayoutEffect 的区别

| 特性 | useInsertionEffect | useLayoutEffect |
|------|-------------------|-----------------|
| 执行时机 | DOM mutation 之前 | DOM mutation 之后，paint 之前 |
| 能否读取 DOM | ❌ 不能（DOM 还没变） | ✅ 可以 |
| 能否读取 refs | ❌ 不能（refs 还未挂载） | ✅ 可以 |
| 主要用途 | CSS-in-JS 注入样式 | 读取布局、测量尺寸 |
| 是否阻塞 paint | 是 | 是 |
| 是否阻塞渲染 | 是 | 是 |

### 五、适用场景

**✅ 适合：**

- CSS-in-JS 库内部实现样式注入
- 需要在 DOM 变更前同步修改 \`<style>\` 或 \`<link>\` 的场景

**❌ 不适合：**

- 读取 DOM 尺寸/位置（用 useLayoutEffect）
- 订阅事件、数据获取（用 useEffect）
- 任何依赖 refs 当前值的操作

### 底层原理

React 的 commit 阶段细分为三个子阶段，每个子阶段处理不同的 effect：

**1. Before mutation 阶段（DOM 变更前）**
- 执行 useInsertionEffect 的回调
- 此时 DOM 还是旧的，但 React 已经计算出需要做什么变更
- 这个阶段最适合"准备 DOM 之外的东西"，比如注入样式

**2. Mutation 阶段（DOM 变更）**
- React 把所有变更应用到 DOM 上
- ref 的 current 在这个阶段被更新

**3. Layout 阶段（DOM 变更后，paint 前）**
- 执行 useLayoutEffect 的回调
- 此时可以同步读取 DOM（如 getBoundingClientRect）
- 浏览器还没 paint，所以这里修改 DOM 不会触发额外的重排

**4. Passive 阶段（paint 后异步）**
- 执行 useEffect 的回调
- 不阻塞 paint，性能最好

**为什么 useInsertionEffect 适合 CSS-in-JS？**

浏览器渲染流程是：DOM 变更 → 读取样式 → 布局 → 绘制。如果样式在"DOM 变更之后"才注入（useLayoutEffect），浏览器已经用旧样式布局了一次，注入新样式后还要重新布局。useInsertionEffect 在"DOM 变更之前"注入，浏览器只布局一次。

**注意：useInsertionEffect 不会在 SSR 时执行**，因为它需要 DOM。CSS-in-JS 库通常在 SSR 时通过单独的样式收集机制处理。

### 常见陷阱

1. **在 useInsertionEffect 中读取 refs**：此时 refs 还未挂载，\`ref.current\` 是 null。读取布局信息要用 useLayoutEffect。

2. **在 useInsertionEffect 中触发状态更新**：会导致渲染期间更新，React 会报错或重新渲染。useInsertionEffect 应该是"纯注入"操作。

3. **用 useInsertionEffect 替代 useEffect**：很多人看到"更早执行"就以为更好。实际上 useInsertionEffect 阻塞渲染，滥用会拖慢性能。它只为 CSS-in-JS 设计。

4. **依赖数组写错**：useInsertionEffect 也有依赖数组，写错会导致样式不更新或重复注入。CSS-in-JS 库通常用稳定的 rule 字符串作为依赖。

5. **SSR 下样式缺失**：useInsertionEffect 不在服务端执行，如果你的样式只在 useInsertionEffect 中注入，SSR 出来的 HTML 会没样式。需要配合 SSR 样式收集。

6. **清理函数执行时机**：useInsertionEffect 的清理函数在下一次执行前调用，确保旧样式被移除。如果你的样式是全局的，清理逻辑要小心不要移除其他组件还在用的样式。

### 性能提示

1. **只在 CSS-in-JS 库内部使用**：业务代码几乎不需要直接用 useInsertionEffect。如果你在业务代码里用，十有八九是误用。

2. **样式注入用稳定 key**：用样式内容本身作为依赖，避免对象引用变化导致重复注入。

3. **批量注入**：如果多个组件同时注入样式，考虑用一个全局 stylesheet 累积，减少 DOM 操作次数。

4. **优先用静态 CSS**：能用 CSS Modules / Tailwind 等静态方案就别用运行时 CSS-in-JS。useInsertionEffect 只是"减少伤害"，不是"消除伤害"。

5. **避免在 useInsertionEffect 中读取 props 触发样式重算**：props 变化会触发 effect 重跑，每次都注入新 style 节点，开销不小。可以预先收集所有样式变体。

6. **与 useLayoutEffect 配合**：useInsertionEffect 注入样式，useLayoutEffect 测量布局，分工明确，避免互相干扰。
    `,
    code: `// =============================================================
// useInsertionEffect 执行顺序与时机模拟
// 用纯 JS 演示 insertion → layout → paint → passive 的顺序
// =============================================================

// 模拟浏览器/React 的渲染管线
class RenderPipeline {
  constructor() {
    this.dom = {};           // 模拟 DOM 树
    this.styles = [];        // 已注入的样式
    this.paintQueue = [];    // paint 队列
    this.passiveQueue = [];  // passive effect 队列（异步）
    this.layoutCalls = [];
    this.insertionCalls = [];
    this.effectCalls = [];
  }

  // 模拟一次完整的 commit 流程
  commit(componentName, props) {
    console.log('\\n----- 渲染组件: ' + componentName + ' -----');
    console.log('[1] render 阶段（纯函数计算虚拟 DOM）');

    // 阶段 2: Before mutation —— useInsertionEffect
    console.log('[2] before-mutation 阶段：执行 useInsertionEffect');
    this.runInsertionEffects(componentName);

    // 阶段 3: Mutation —— 应用 DOM 变更
    console.log('[3] mutation 阶段：应用 DOM 变更，更新 ref.current');
    this.dom[componentName] = { props, ref: { current: { width: 100, height: 50 } } };

    // 阶段 4: Layout —— useLayoutEffect
    console.log('[4] layout 阶段：执行 useLayoutEffect（可读 DOM）');
    this.runLayoutEffects(componentName);

    // 阶段 5: Paint —— 浏览器绘制
    console.log('[5] paint 阶段：浏览器绘制（同步）');
    this.paintQueue.push(componentName);

    // 阶段 6: Passive —— useEffect（异步，setTimeout 模拟）
    console.log('[6] 调度 passive effect（useEffect，异步）');
    setTimeout(() => {
      console.log('[6 异步] passive 阶段：执行 useEffect');
      this.runPassiveEffects(componentName);
    }, 0);
  }

  // 注册各种 effect
  onInsertion(name, fn) { this.insertionCalls.push({ name, fn }); }
  onLayout(name, fn) { this.layoutCalls.push({ name, fn }); }
  onPassive(name, fn) { this.effectCalls.push({ name, fn }); }

  runInsertionEffects(name) {
    this.insertionCalls.filter(e => e.name === name).forEach(e => e.fn(this));
  }
  runLayoutEffects(name) {
    this.layoutCalls.filter(e => e.name === name).forEach(e => e.fn(this));
  }
  runPassiveEffects(name) {
    this.effectCalls.filter(e => e.name === name).forEach(e => e.fn(this));
  }
}

// 模拟 useInsertionEffect：注入样式（DOM 变更前）
function useInsertionEffectSim(pipeline, name, rule) {
  pipeline.onInsertion(name, (p) => {
    console.log('  → [insertion] 注入样式: ' + rule);
    p.styles.push({ name, rule });
    // ⚠️ 此时 DOM 还未变更，不能读取布局
    // 如果尝试读 ref.current，会是 null/旧值
    console.log('  → [insertion] 尝试读 ref.current: ' + (p.dom[name]?.ref?.current || 'null（DOM 未挂载）'));
  });
}

// 模拟 useLayoutEffect：测量布局（DOM 变更后，paint 前）
function useLayoutEffectSim(pipeline, name, measureFn) {
  pipeline.onLayout(name, (p) => {
    const node = p.dom[name];
    const rect = node.ref.current;
    console.log('  → [layout] 读取布局: width=' + rect.width + ', height=' + rect.height);
    measureFn(rect);
  });
}

// 模拟 useEffect：副作用（paint 后异步）
function useEffectSim(pipeline, name, fn) {
  pipeline.onPassive(name, (p) => {
    fn(p);
  });
}

// ---------- 演示：完整渲染流程 ----------
const pipeline = new RenderPipeline();

// 一个模拟的 CSS-in-JS 组件
function StyledCard(props) {
  const componentName = 'StyledCard';

  // useInsertionEffect：注入样式
  useInsertionEffectSim(pipeline, componentName,
    '.card { background: #fff; padding: 16px; }');

  // useLayoutEffect：测量尺寸
  useLayoutEffectSim(pipeline, componentName, (rect) => {
    console.log('  → [layout] 根据尺寸调整: 卡片高度 ' + rect.height + 'px');
  });

  // useEffect：订阅事件
  useEffectSim(pipeline, componentName, (p) => {
    console.log('  → [passive] 订阅窗口 resize 事件');
  });

  pipeline.commit(componentName, props);
}

StyledCard({ title: 'Hello' });

// ---------- 演示：顺序对比 ----------
setTimeout(() => {
  console.log('\\n=== 执行顺序总结 ===');
  console.log('insertion（注入样式）→ mutation（改 DOM）→ layout（测量）→ paint（绘制）→ passive（订阅）');
  console.log('关键：insertion 在 DOM 变更前，所以浏览器只布局一次，无重排');

  console.log('\\n=== 陷阱演示：在 useInsertionEffect 读 ref ===');
  const p2 = new RenderPipeline();
  // 模拟错误用法：在 insertion 阶段读 ref
  p2.onInsertion('BadComp', (p) => {
    console.log('  尝试读 ref.current: ' + (p.dom['BadComp']?.ref?.current || 'null'));
    console.log('  ⚠️ ref 未挂载，读取失败！应改用 useLayoutEffect');
  });
  p2.commit('BadComp', {});
}, 50);

// ---------- 演示：三种 effect 用途对比 ----------
setTimeout(() => {
  console.log('\\n=== 三种 effect 的正确用途 ===');
  console.log('useInsertionEffect: CSS-in-JS 注入 <style>（DOM 变更前）');
  console.log('useLayoutEffect    : 测量元素尺寸/位置（DOM 变更后，paint 前）');
  console.log('useEffect          : 数据获取、订阅事件（paint 后，不阻塞渲染）');
  console.log('');
  console.log('性能排序（阻塞程度）：');
  console.log('  useInsertionEffect ≈ useLayoutEffect > useEffect');
  console.log('  insertion 和 layout 都阻塞 paint，passive 不阻塞');
}, 100);
`,
  },
  {
    id: "react18-strict-mode",
    title: "Strict Mode 变化",
    icon: "⚠️",
    group: "新 Hooks 与 API",
    content: `## React 18 Strict Mode 的变化：双调用检测

### 一、Strict Mode 是什么

\`<React.StrictMode>\` 是一个开发模式下的辅助组件，它不会渲染任何 UI，但会在开发时对子树做额外的检查，帮助你发现潜在问题。**Strict Mode 只在开发模式下生效，生产构建中完全无效。**

React 18 对 Strict Mode 做了重大调整：**它会故意双调用一些函数**，让你提前暴露出"不纯"的代码。

### 二、React 18 新行为：mount → unmount → mount

在 React 18 的 Strict Mode 下，每个组件挂载时会经历：

\`\`\`
mount（首次挂载）
    ↓
unmount（立即卸载）
    ↓
mount（再次挂载）
    ↓
正常运行
\`\`\`

也就是说，组件会被挂载两次。这看起来很奇怪，但目的是**检测你的副作用清理是否正确**。

### 三、为什么要双调用

React 18 引入了"可复用状态"（reusable state）的概念。未来 React 可能会在用户切换 Tab 时卸载组件但保留状态，再切回来时恢复。如果你的副作用没有正确清理，这种场景下会出现 bug：

- 事件监听器没移除 → 重复监听
- 定时器没清除 → 多个定时器同时跑
- 订阅没退订 → 内存泄漏
- WebSocket 没关闭 → 连接泄漏

**Strict Mode 通过"挂载→卸载→重新挂载"模拟这种场景**，如果你的清理函数有问题，开发时就能立即看到（监听器数量翻倍、定时器堆积等）。

### 四、哪些函数会被双调用

Strict Mode 会双调用以下函数：

**1. 组件函数体**（每次渲染都会调用两次，用来检测纯函数）
\`\`\`jsx
function MyComponent() {
  // 这个函数体会被调用两次
  return <div />;
}
\`\`\`

**2. useState / useMemo / useReducer 的初始化函数**
\`\`\`jsx
const [state, setState] = useState(() => {
  // 这个初始化函数会被调用两次
  return computeInitialState();
});
\`\`\`

**3. useEffect 的 setup 和 cleanup**
\`\`\`jsx
useEffect(() => {
  setup();        // 第一次挂载
  return () => cleanup();  // 第一次卸载
  // 然后再 setup() 一次（第二次挂载）
});
\`\`\`

**4. useLayoutEffect 的 setup 和 cleanup**

**5. useInsertionEffect 的 setup 和 cleanup**

**不会被双调用的：**
- 事件处理器（onClick 等）
- 提交时的 ref 回调（commit phase 的 ref）
- setState 函数本身

### 五、如何编写兼容代码

**原则：让副作用成为"可逆"的**——setup 做了什么，cleanup 就精确地撤销什么。

\`\`\`jsx
// ❌ 有问题：没有清理
useEffect(() => {
  window.addEventListener('resize', handler);
}, []);

// ✅ 正确：成对出现
useEffect(() => {
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);
\`\`\`

\`\`\`jsx
// ❌ 有问题：定时器没清除
useEffect(() => {
  const id = setInterval(tick, 1000);
}, []);

// ✅ 正确
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);
\`\`\`

### 底层原理

Strict Mode 的双调用是通过"两次提交"实现的：

1. React 第一次挂载组件，执行所有 effect 的 setup。
2. **Strict Mode 立即模拟一次卸载**，执行所有 effect 的 cleanup。
3. Strict Mode 再模拟一次挂载，重新执行所有 effect 的 setup。
4. 之后正常运行。

**为什么组件函数体也被双调用？**

React 想检测你的组件是不是"纯函数"。纯函数应该：
- 相同输入产生相同输出
- 没有副作用（不修改外部变量、不读写文件等）

如果双调用两次结果不一样，或者产生了副作用（如全局计数器自增），React 会在开发控制台给出警告。

**为什么 useState 的初始化函数被双调用？**

初始化函数也应该是纯函数。如果你在里头做了 \`localStorage.getItem\` + 全局变量修改，双调用会让 bug 暴露。

**生产环境行为**

生产构建中 Strict Mode 完全是 no-op（无操作），不会有任何双调用，性能无影响。所以可以放心给整个应用包 Strict Mode。

### 常见陷阱

1. **第一次 mount 的 ref 和第二次 mount 的 ref 是不同的**：如果你在 ref 回调里缓存了 DOM 引用，注意第二次 mount 时要重新获取。

2. **useEffect 里的 fetch 请求会发两次**：开发时你会看到同一个请求发了两次。**解法**：用 AbortController 在 cleanup 中取消请求，第二次 mount 时重新发起。这也能避免竞态条件（race condition）。

3. **第三方库的初始化会被调用两次**：如果某个库在 useEffect 中初始化且不支持重复初始化，需要加守卫。但更好的做法是让初始化可清理。

4. **全局状态被污染**：如果在 effect 里修改全局变量，双调用会让全局变量被修改两次。**解法**：把状态放进 useState/useRef，不要用全局变量。

5. **console.log 看起来重复**：开发时看到日志打两遍是正常的，不要以为是 bug。可以加 \`if (process.env.NODE_ENV === 'development')\` 区分，但更好的是接受这个行为。

6. **useEffect 的 cleanup 不是"组件卸载时才调用"**：cleanup 在每次 re-run effect 前都会调用（依赖变化时），以及组件卸载时。Strict Mode 强制让你体验这个语义。

7. **ref 的回调函数也会被调用两次**（带 null 一次，带 DOM 一次），这是 React 18 Strict Mode 在开发环境的行为，生产环境不会发生。

### 性能提示

1. **生产环境无影响**：Strict Mode 只在开发时双调用，生产构建完全移除，零开销。

2. **不要为了避免双调用而禁用 Strict Mode**：双调用暴露的 bug 在生产中会更难发现。值得在开发时承受。

3. **让 setup/cleanup 轻量**：如果 effect 里做了重计算，双调用会翻倍。把重计算移到 useMemo 或组件外。

4. **用 AbortController 取消请求**：既能在 Strict Mode 下表现正确，也能处理组件卸载时的竞态。

5. **检测重复订阅**：可以临时在 effect 里 console.log 订阅数量，确认 cleanup 正确。

6. ** Strict Mode 不影响性能预算**：做性能测试时应该用生产构建，Strict Mode 的双调用不会出现在生产数据里。
    `,
    code: `// =============================================================
// Strict Mode 双调用机制模拟
// 用纯 JS 演示 mount → unmount → mount 的清理检测
// =============================================================

// 模拟 React Strict Mode 的双调用机制
class StrictModeSimulator {
  constructor() {
    this.effects = [];        // 注册的 effect
    this.globalListeners = 0; // 模拟全局监听器数量（检测泄漏）
    this.timers = new Set();  // 模拟活跃的定时器
    this.fetchCount = 0;      // 模拟 fetch 请求次数
    this.log = [];
  }

  // 注册一个 effect（包含 setup 和 cleanup）
  useEffect(name, setup, cleanup) {
    this.effects.push({ name, setup, cleanup });
  }

  // 模拟普通模式挂载
  mountNormal() {
    console.log('=== 普通模式（无 Strict Mode）===');
    console.log('[mount] 执行所有 effect setup');
    for (const e of this.effects) {
      e.setup();
    }
  }

  // 模拟 Strict Mode 双调用挂载
  mountStrict() {
    console.log('\\n=== Strict Mode 双调用 ===');
    console.log('[第一次 mount] 执行 setup');
    for (const e of this.effects) {
      e.setup();
    }
    console.log('[立即 unmount] 执行 cleanup（检测清理是否正确）');
    for (let i = this.effects.length - 1; i >= 0; i--) {
      this.effects[i].cleanup();
    }
    console.log('[第二次 mount] 再次执行 setup');
    for (const e of this.effects) {
      e.setup();
    }
  }

  unmount() {
    console.log('[真正 unmount] 执行 cleanup');
    for (let i = this.effects.length - 1; i >= 0; i--) {
      this.effects[i].cleanup();
    }
  }
}

// ---------- 场景 1：正确的 cleanup（无泄漏）----------
console.log('========== 场景 1：正确的副作用清理 ==========');
const sim1 = new StrictModeSimulator();

sim1.useEffect(
  'resize订阅',
  () => {
    sim1.globalListeners++;
    console.log('  setup: 添加 resize 监听，当前数量=' + sim1.globalListeners);
  },
  () => {
    sim1.globalListeners--;
    console.log('  cleanup: 移除 resize 监听，当前数量=' + sim1.globalListeners);
  }
);

sim1.useEffect(
  '定时器',
  () => {
    const id = Symbol('timer');
    sim1.timers.add(id);
    console.log('  setup: 启动定时器，活跃数量=' + sim1.timers.size);
    return id;
  },
  () => {
    // 简化：移除一个定时器
    const first = sim1.timers.values().next().value;
    if (first) sim1.timers.delete(first);
    console.log('  cleanup: 清除定时器，活跃数量=' + sim1.timers.size);
  }
);

sim1.mountStrict();
console.log('\\n最终状态：监听器=' + sim1.globalListeners + ', 定时器=' + sim1.timers.size);
console.log('✅ 没有泄漏，双调用后状态正常');

// ---------- 场景 2：忘记 cleanup（泄漏被暴露）----------
console.log('\\n\\n========== 场景 2：忘记 cleanup（Strict Mode 暴露泄漏）==========');
const sim2 = new StrictModeSimulator();

sim2.useEffect(
  'resize订阅(错误)',
  () => {
    sim2.globalListeners++;
    console.log('  setup: 添加监听，当前=' + sim2.globalListeners);
  },
  () => {
    // ❌ 忘记移除监听器！
    console.log('  cleanup: 什么都没做（漏写）');
  }
);

sim2.mountStrict();
console.log('\\n最终状态：监听器=' + sim2.globalListeners);
console.log('⚠️ 严格模式下监听器数量异常（应该是 1，实际是 2）→ 暴露了 bug！');

// ---------- 场景 3：fetch 请求竞态 ----------
console.log('\\n\\n========== 场景 3：fetch 请求被发两次（用 AbortController 解决）==========');
const sim3 = new StrictModeSimulator();

sim3.useEffect(
  '数据获取(错误)',
  () => {
    sim3.fetchCount++;
    console.log('  setup: 发起 fetch 请求 #' + sim3.fetchCount + '（无法取消）');
  },
  () => {
    console.log('  cleanup: 没有取消请求');
  }
);

sim3.mountStrict();
console.log('请求总数=' + sim3.fetchCount + '，⚠️ 双调用导致重复请求');

console.log('\\n--- 正确方案：用 AbortController ---');
const sim4 = new StrictModeSimulator();
let aborted = false;

sim4.useEffect(
  '数据获取(正确)',
  () => {
    const controller = { aborted: false, abort() { this.aborted = true; } };
    sim4.fetchCount++;
    console.log('  setup: 发起 fetch #' + sim4.fetchCount + '，绑定 AbortController');
    // 模拟异步请求检查是否被取消
    setTimeout(() => {
      if (controller.aborted) {
        console.log('  → 请求被 abort，丢弃响应');
      } else {
        console.log('  → 请求完成，处理响应');
      }
    }, 10);
    return controller;
  },
  () => {
    console.log('  cleanup: 调用 controller.abort() 取消请求');
    // 模拟 abort
  }
);

sim4.mountStrict();
console.log('请求总数=' + sim4.fetchCount + '，但第二次 mount 的请求才会真正处理响应 ✅');

// ---------- 场景 4：组件函数体双调用（纯函数检测）----------
console.log('\\n\\n========== 场景 4：组件函数体双调用（纯函数检测）==========');
let renderCount = 0;
let globalCounter = 0;

// ❌ 不纯的组件：修改了全局变量
function ImpureComponent() {
  renderCount++;
  globalCounter++;  // 副作用！
  return { type: 'div', renderCount, globalCounter };
}

console.log('Strict Mode 下渲染 ImpureComponent 两次：');
const r1 = ImpureComponent();
console.log('第一次渲染: renderCount=' + r1.renderCount + ', globalCounter=' + r1.globalCounter);
const r2 = ImpureComponent();
console.log('第二次渲染: renderCount=' + r2.renderCount + ', globalCounter=' + r2.globalCounter);
console.log('⚠️ globalCounter 被修改了两次 → 暴露了不纯的副作用');

// ✅ 纯组件
function PureComponent() {
  renderCount++;
  return { type: 'div', renderCount };  // 不碰外部状态
}
console.log('\\n纯组件多次渲染不会污染全局状态 ✅');

// ---------- 总结 ----------
setTimeout(() => {
  console.log('\\n========== Strict Mode 双调用总结 ==========');
  console.log('1. mount → unmount → mount，模拟"可复用状态"场景');
  console.log('2. 检测 setup/cleanup 是否成对，副作用是否可逆');
  console.log('3. 组件函数体、useState 初始化、useEffect setup 都被双调用');
  console.log('4. 生产构建完全无影响，只在开发模式生效');
  console.log('5. 修复方法：所有副作用都写 cleanup，用 AbortController 取消请求');
}, 50);
`,
  },
  {
    id: "react18-concurrent-pitfalls",
    title: "并发模式陷阱",
    icon: "🚨",
    group: "新 Hooks 与 API",
    content: `## React 18 并发模式下的常见陷阱

### 一、并发渲染改变了什么

React 18 的并发渲染意味着：**渲染过程可以被中断、暂停、恢复，甚至放弃重头来过**。这带来了性能提升（高优先级任务可以打断低优先级渲染），但也让一些原本"在同步渲染下能跑"的代码暴露出问题。

核心变化：
- 渲染不再是一次性完成的原子操作
- 同一次渲染可能跨多个事件循环 tick
- 渲染过程中外部状态可能变化
- effect 的执行时机更复杂

### 二、陷阱 1：渲染期间执行副作用

\`\`\`jsx
// ❌ 危险：渲染期间修改外部变量
let globalCache = {};
function BadComponent({ id }) {
  globalCache[id] = computeExpensive(id);  // 渲染期间写外部状态
  return <div>{globalCache[id]}</div>;
}
\`\`\`

在并发模式下，组件函数可能被调用多次（React 为了检测纯函数会双调用，并发中断后也会重渲染）。每次都修改 globalCache，可能导致：
- 缓存被错误覆盖
- 不同渲染批次看到不同的缓存状态

**正确做法**：渲染应该是纯函数，副作用放到 effect 里，或者用 useMemo 缓存计算结果。

### 三、陷阱 2：refs 滥用

\`\`\`jsx
// ❌ 危险：在渲染期间读 ref
function BadComponent() {
  const ref = useRef(0);
  ref.current++;  // 渲染期间修改 ref
  return <div>{ref.current}</div>;
}
\`\`\`

ref.current 在渲染期间不应该被读写。原因：
- 并发渲染下组件可能渲染多次，ref.current 会被多次自增
- React 不追踪 ref 的变化，读到的可能是"中间状态"

**正确做法**：
- 用 useState 管理需要触发渲染的状态
- ref 只在 effect 和事件处理器里读写

\`\`\`jsx
// ✅ 正确
function GoodComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
\`\`\`

### 四、陷阱 3：外部 store 不一致

如果你直接用 \`useState + useEffect + 订阅\` 管理外部 store，在并发渲染下会出现 tearing（前面章节讲过）。

\`\`\`jsx
// ❌ 危险：自己手写订阅
function BadComponent() {
  const [value, setValue] = useState(store.get());
  useEffect(() => {
    const unsub = store.subscribe(() => setValue(store.get()));
    return unsub;
  }, []);
  return <div>{value}</div>;
}
\`\`\`

并发渲染下，组件 A 渲染时读到 value=1，渲染被中断，store 变成 2，组件 B 渲染时读到 value=2。A 和 B 在同一次渲染中看到不同的值，UI 撕裂。

**正确做法**：用 \`useSyncExternalStore\`，React 内部会处理一致性。

### 五、陷阱 4：不可变更新违反

\`\`\`jsx
// ❌ 危险：直接修改 state
function BadComponent() {
  const [items, setItems] = useState([1, 2, 3]);
  const addItem = () => {
    items.push(4);  // 直接修改！
    setItems(items);
  };
}
\`\`\`

在同步渲染下，这种"修改后 set 同一引用"可能侥幸能工作（因为 React 会强制重渲染）。但在并发渲染下：

- React 用 \`Object.is\` 比较新旧 state，发现是同一引用，可能跳过更新
- 即使更新了，并发中断期间其他组件可能读到"被修改了一半"的状态

**正确做法**：始终创建新引用。

\`\`\`jsx
const addItem = () => setItems([...items, 4]);
\`\`\`

### 六、陷阱 5：Suspense 边界放置错误

\`\`\`jsx
// ❌ 危险：Suspense 边界包住整个页面
<Suspense fallback={<Loading />}>
  <Header />
  <Sidebar />
  <MainContent />  // 这里会 suspense
  <Footer />
</Suspense>
\`\`\`

如果 MainContent 触发 suspense，整个页面（包括 Header/Sidebar/Footer）都会被 fallback 替换。用户体验很差。

**正确做法**：把 Suspense 边界放在尽量靠近触发 suspense 的组件周围。

\`\`\`jsx
<Header />
<Sidebar />
<Suspense fallback={<MainLoading />}>
  <MainContent />
</Suspense>
<Footer />
\`\`\`

### 七、陷阱 6：transition 滥用

\`useTransition\` 把状态更新标记为"低优先级"，让 UI 保持响应。但不是所有更新都该用 transition：

\`\`\`jsx
// ❌ 滥用：用户输入框的值用 transition
function BadSearch() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  return (
    <input
      value={query}
      onChange={(e) => startTransition(() => setQuery(e.target.value))}
    />
  );
}
\`\`\`

输入框的值需要立即响应，用 transition 会让输入有延迟感。transition 适合**派生的、可延迟的更新**（如搜索结果列表），不适合**用户直接交互的输入**。

\`\`\`jsx
// ✅ 正确：输入立即更新，结果列表用 transition
function GoodSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  return (
    <>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);  // 高优先级
          startTransition(() => {
            setResults(filter(e.target.value));  // 低优先级
          });
        }}
      />
      <ResultList results={results} />
    </>
  );
}
\`\`\`

### 底层原理

并发渲染的核心是 **"可中断的渲染"**。React 内部用 fiber 树和 lane 模型管理优先级：

1. **Lane 模型**：每个更新有一个优先级（lane），高优先级 lane 可以打断低优先级渲染。
2. **时间切片**：React 把渲染工作切成 5ms 左右的小块，让浏览器有机会处理用户输入。
3. **可重用渲染结果**：被中断的渲染不会丢弃，React 复用已经完成的 fiber 节点，只重渲染必要的部分。

**为什么这些特性会让旧代码出问题？**

- **渲染期间副作用**：渲染被中断后恢复，副作用可能执行了多次。
- **refs 读取**：并发渲染下 ref.current 的值不确定，可能是上一次渲染的。
- **不可变更新违反**：React 用引用相等性判断是否跳过更新，直接修改原对象会让 React 误判"没变化"。
- **外部 store**：渲染中断期间 store 变化，组件读到不一致的快照。
- **Suspense 边界**：suspense 触发时整个子树被 fallback 替换，边界越大影响越大。
- **transition**：低优先级更新有"延迟"，不适合需要立即响应的场景。

**React 18 的设计哲学**：渲染必须是纯函数。任何"在渲染中做副作用"的代码都可能在并发模式下出问题。React 用 Strict Mode 双调用强制你提前发现这些问题。

### 常见陷阱

1. **在渲染中读取 Date.now() / Math.random()**：每次渲染结果不同，并发下会闪烁。**解法**：把这些值放进 state 或 useRef，在 effect 里更新。

2. **在渲染中读取 ref.current 用于显示**：ref 不触发重渲染，UI 会"滞后"。**解法**：用 state。

3. **useEffect 里修改父组件的 props 对象**：props 是只读的，修改会被并发渲染覆盖。**解法**：用 state + 回调。

4. **在 useEffect 里发起请求但不处理竞态**：连续输入时，旧请求可能后返回，覆盖新请求结果。**解法**：用 AbortController 或请求 ID 标记。

5. **Suspense 边界包住 router**：路由切换时整个应用变 fallback。**解法**：每个路由级别单独 Suspense。

6. **在 useTransition 中调用 setState 链**：transition 内的更新是低优先级的，链式 setState 可能被合并或丢弃。**解法**：把链式更新合并成一次。

7. **依赖外部可变变量（如全局 singleton）**：并发渲染下不同组件可能读到不同时刻的值。**解法**：用 useSyncExternalStore 订阅。

8. **在 effect 中读取 layout 信息触发回流的死循环**：useLayoutEffect 里读 DOM 又 setState，可能触发再次渲染。**解法**：用 ResizeObserver 等订阅式 API。

### 性能提示

1. **用 useDeferredValue 处理昂贵渲染**：\`const deferred = useDeferredValue(value);\` 让昂贵的渲染保持低优先级，输入框始终响应。

2. **transition 内不要做太多同步工作**：transition 标记的是"更新"，不是"计算"。重计算应该用 useMemo。

3. **Suspense 边界越小越好**：只包住真正会异步的组件，减少 fallback 影响范围。

4. **key 帮助 React 复用 fiber**：列表 key 稳定能让并发渲染更快复用已有 fiber。

5. **避免在并发渲染中创建大对象**：每次渲染创建大对象会增加中断/恢复时的内存压力。用 useMemo 缓存。

6. **监控长任务**：用 React DevTools Profiler 看渲染是否被频繁中断，调整组件拆分粒度。

7. **不要为了"并发"过度拆分组件**：拆得太细反而增加 fiber 数量，调度开销变大。一个组件的渲染时间在 1-5ms 比较合适。
    `,
    code: `// =============================================================
// React 18 并发模式典型陷阱演示
// 用纯 JS 模拟并发渲染下的问题场景
// =============================================================

// 模拟"可中断的并发渲染器"
class ConcurrentRenderer {
  constructor() {
    this.components = [];
    this.interruptAt = null;  // 在第几个组件后中断
    this.renderLog = [];
  }

  register(name, renderFn) {
    this.components.push({ name, renderFn });
  }

  // 模拟并发渲染：可能在某个点中断
  render({ interrupt = false, resumeFrom = 0 } = {}) {
    const start = resumeFrom || 0;
    for (let i = start; i < this.components.length; i++) {
      const comp = this.components[i];
      const result = comp.renderFn();
      this.renderLog.push({ name: comp.name, value: result, tick: Date.now() });

      if (interrupt && i === this.interruptAt) {
        console.log('  [中断] 渲染到 ' + comp.name + ' 时被高优先级任务打断');
        return { completed: false, resumeFrom: i };
      }
    }
    return { completed: true, resumeFrom: 0 };
  }
}

// ---------- 陷阱 1：渲染期间执行副作用 ----------
console.log('========== 陷阱 1：渲染期间执行副作用 ==========');
let globalCache = {};

function ImpureRender(id) {
  // ❌ 渲染期间修改外部变量
  globalCache[id] = 'computed-' + id + '-' + Math.random().toString(36).slice(2, 6);
  return globalCache[id];
}

const renderer1 = new ConcurrentRenderer();
renderer1.register('CompA', () => ImpureRender('a'));
renderer1.interruptAt = 0;

console.log('第一次渲染（中断）：');
renderer1.render({ interrupt: true });
console.log('  globalCache 此时: ' + JSON.stringify(globalCache));

console.log('第二次渲染（恢复，重新跑）：');
// 恢复时 React 会从头重渲染，ImpureRender 又跑了一遍
renderer1.render({ resumeFrom: 0 });
console.log('  globalCache 此时: ' + JSON.stringify(globalCache));
console.log('⚠️ 副作用被执行了多次，缓存值不稳定');

// ---------- 陷阱 2：refs 在渲染期间被读写 ----------
console.log('\\n========== 陷阱 2：渲染期间读写 ref ==========');
function simulateRefMisuse() {
  const ref = { current: 0 };  // 模拟 useRef
  const renderCounts = [];

  // 模拟并发渲染：组件被渲染 3 次（中断重试）
  for (let i = 0; i < 3; i++) {
    ref.current++;  // ❌ 渲染期间修改 ref
    renderCounts.push(ref.current);
  }
  console.log('渲染 3 次后 ref.current = ' + ref.current + '（预期 1，实际 3）');
  console.log('各次渲染看到的值: ' + renderCounts.join(', '));
  console.log('⚠️ ref 在渲染期间被多次修改，UI 显示不一致');
}
simulateRefMisuse();

console.log('\\n--- 正确做法：用 state ---');
function simulateStateUse() {
  let state = 0;
  const setState = (fn) => { state = fn(state); };
  const renders = [];
  // React 保证一次用户操作只触发一次 state 更新
  setState(c => c + 1);
  renders.push(state);
  console.log('用户点击一次后 state = ' + state + '（符合预期）');
}
simulateStateUse();

// ---------- 陷阱 3：外部 store 不一致（tearing）----------
console.log('\\n========== 陷阱 3：外部 store tearing ==========');
function simulateTearing() {
  const store = { value: 1 };
  const seen = [];

  // 模拟并发渲染：CompA 渲染时读到 1，中断期间 store 变了，CompB 读到 2
  const renderer = new ConcurrentRenderer();
  renderer.register('CompA', () => {
    const v = store.value;
    seen.push({ name: 'A', value: v });
    return v;
  });
  renderer.interruptAt = 0;
  renderer.register('CompB', () => {
    const v = store.value;
    seen.push({ name: 'B', value: v });
    return v;
  });

  console.log('渲染 CompA（读到 ' + store.value + '）');
  renderer.render({ interrupt: true });

  console.log('  [中断期间] store 变化: 1 → 2');
  store.value = 2;

  console.log('恢复渲染 CompB（读到 ' + store.value + '）');
  renderer.render({ resumeFrom: 1 });

  console.log('同一次渲染中：');
  seen.forEach(s => console.log('  ' + s.name + ' 看到 store=' + s.value));
  console.log('⚠️ Tearing! A 和 B 看到不同的值，UI 不一致');
  console.log('✅ 解法：用 useSyncExternalStore，React 会保证一致性');
}
simulateTearing();

// ---------- 陷阱 4：不可变更新违反 ----------
console.log('\\n========== 陷阱 4：不可变更新违反 ==========');
function simulateMutableUpdate() {
  let state = [1, 2, 3];
  const oldRef = state;

  // ❌ 直接修改原数组
  state.push(4);
  // setSameRef: 用同一引用触发更新
  const newRef = state;  // 还是同一个数组

  console.log('更新前引用 === 更新后引用: ' + (oldRef === newRef));
  console.log('  → React 用 Object.is 比较，发现没变，跳过更新');
  console.log('  → 并发渲染下其他组件可能读到"被改了一半"的中间状态');
  console.log('✅ 解法: setItems([...items, 4])  创建新引用');
}
simulateMutableUpdate();

// ---------- 陷阱 5：Suspense 边界过大 ----------
console.log('\\n========== 陷阱 5：Suspense 边界过大 ==========');
function simulateSuspenseBoundary() {
  console.log('❌ 错误：Suspense 包住整个页面');
  console.log('  <Suspense fallback={<Loading/>}>');
  console.log('    <Header/> <Sidebar/> <MainContent/> <Footer/>');
  console.log('  </Suspense>');
  console.log('  → MainContent 加载时，Header/Sidebar/Footer 全部消失');
  console.log('');
  console.log('✅ 正确：Suspense 只包住 MainContent');
  console.log('  <Header/> <Sidebar/>');
  console.log('  <Suspense fallback={<MainLoading/>}>');
  console.log('    <MainContent/>');
  console.log('  </Suspense>');
  console.log('  <Footer/>');
  console.log('  → 只有主内容区显示 loading，其他部分正常');
}
simulateSuspenseBoundary();

// ---------- 陷阱 6：transition 滥用 ----------
console.log('\\n========== 陷阱 6：transition 滥用 ==========');
function simulateTransitionMisuse() {
  console.log('❌ 滥用：输入框的值用 transition');
  console.log('  onChange: startTransition(() => setQuery(value))');
  console.log('  → 输入有延迟感，用户体验差');
  console.log('');
  console.log('✅ 正确：输入高优先级，结果列表用 transition');
  console.log('  onChange: {');
  console.log('    setQuery(value);  // 高优先级，立即响应');
  console.log('    startTransition(() => setResults(filter(value)));  // 低优先级');
  console.log('  }');
}
simulateTransitionMisuse();

// ---------- 总结 ----------
console.log('\\n========== 并发模式陷阱总结 ==========');
console.log('1. 渲染必须是纯函数，副作用放 effect');
console.log('2. ref 不在渲染期间读写，用 state 触发渲染');
console.log('3. 外部 store 用 useSyncExternalStore 订阅');
console.log('4. 不可变更新：始终创建新引用');
console.log('5. Suspense 边界尽量小，靠近异步组件');
console.log('6. transition 只用于派生的、可延迟的更新');
`,
  },
  {
    id: "react18-migration-guide",
    title: "React 18 迁移指南",
    icon: "📗",
    group: "新 Hooks 与 API",
    content: `## 从 React 17 迁移到 React 18

### 一、迁移概览

React 18 是一个**渐进式升级**版本。绝大多数应用不需要重写代码，但有几个关键改动必须做。整个迁移过程通常分为三步：

1. **安装 React 18** + 更新依赖
2. **替换根挂载 API**：\`ReactDOM.render\` → \`createRoot\`
3. **审计副作用**：修复 Strict Mode 双调用暴露的问题

### 二、第一步：安装与依赖升级

\`\`\`bash
npm install react@18 react-dom@18
\`\`\`

同时升级相关生态：

\`\`\`bash
npm install react-dom@18 @types/react@18 @types/react-dom@18
# 升级路由、状态管理等
npm install react-router-dom@6 react-redux@8
\`\`\`

**依赖检查清单：**

| 依赖 | 兼容版本 | 说明 |
|------|---------|------|
| react / react-dom | 18.x | 核心 |
| @types/react / @types/react-dom | 18.x | TypeScript 类型 |
| react-redux | 8+ | 基于 useSyncExternalStore |
| react-router-dom | 6+ | 支持并发特性 |
| @testing-library/react | 13+ | 支持 createRoot 的测试工具 |
| next.js | 12.2+ | 内置 React 18 支持 |
| styled-components | 6+ | 基于 useInsertionEffect |
| emotion | 11+ | 基于 useInsertionEffect |

### 三、第二步：替换根挂载 API

这是**最关键也最显眼**的改动。

**React 17（旧）：**
\`\`\`js
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
\`\`\`

**React 18（新）：**
\`\`\`js
import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
\`\`\`

**关键点：**
- 从 \`react-dom/client\` 导入 \`createRoot\`
- 先创建 root，再调用 \`root.render\`
- 不用 \`createRoot\` 而继续用 \`ReactDOM.render\` 会得到警告：\`ReactDOM.render is no longer supported in React 18\`，且不会启用并发特性

**SSR 同理：**
\`\`\`js
// React 17
import ReactDOMServer from 'react-dom/server';
const html = ReactDOMServer.renderToString(<App />);

// React 18（推荐流式渲染）
import { renderToPipeableStream } from 'react-dom/server';
const { pipe } = renderToPipeableStream(<App />, {
  onShellReady() { pipe(res); }
});
\`\`\`

### 四、第三步：自动批处理的影响

React 18 默认开启了**自动批处理（automatic batching）**，所有事件回调中的多次 setState 都会被合并成一次重渲染。这在 React 17 中只在 React 事件里生效，现在扩展到了 promise、setTimeout、原生事件等。

\`\`\`jsx
function App() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);

  const handleClick = async () => {
    // React 17: 这里会触发两次渲染
    // React 18: 自动批处理，只触发一次
    await fetch('/api');
    setA(1);
    setB(2);
  };
}
\`\`\`

**潜在问题**：如果你的代码依赖"每次 setState 都立即重渲染"的行为（很少见，但可能存在于旧代码），可能出问题。**解法**：用 \`flushSync\` 强制立即同步更新。

\`\`\`js
import { flushSync } from 'react-dom';
flushSync(() => setA(1));  // 立即同步渲染
setB(2);  // 这次的更新会被批处理
\`\`\`

### 五、第四步：Strict Mode 修复

启用 Strict Mode 后，你会看到副作用被双调用（前面章节讲过）。这是好事，它提前暴露了潜在 bug。

\`\`\`jsx
import { StrictMode } from 'react';

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
\`\`\`

**典型需要修复的：**

1. **没有 cleanup 的 effect**：添加 cleanup 函数
2. **fetch 请求未取消**：用 AbortController
3. **订阅未退订**：在 cleanup 中取消订阅
4. **ref 滥用**：把需要触发渲染的值改成 state

### 六、第五步：TypeScript 类型变化

React 18 的类型有几个变化：

**1. children 不再隐式包含**

React 18 的 \`FC\`（FunctionComponent）不再默认包含 \`children\` 属性。需要显式声明：

\`\`\`tsx
// React 17
const MyComp: React.FC = ({ children }) => <div>{children}</div>;

// React 18
const MyComp: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);
\`\`\`

**2. event 类型的变化**

\`React.SyntheticEvent\` 的事件类型更严格，部分类型名调整。

**3. 新增类型**

- \`useId\` 返回 \`string\`
- \`useSyncExternalStore\` 的三个参数类型
- \`useInsertionEffect\` 与 \`useEffect\` 类型一致

### 七、升级检查清单

- [ ] 升级 react、react-dom 到 18
- [ ] 升级 @types/react、@types/react-dom 到 18
- [ ] 升级 react-redux、react-router-dom 等生态库
- [ ] 替换 \`ReactDOM.render\` 为 \`createRoot\`
- [ ] 替换 \`ReactDOM.hydrate\` 为 \`hydrateRoot\`
- [ ] SSR 替换 \`renderToString\` 为 \`renderToPipeableStream\`（可选）
- [ ] 启用 \`<StrictMode>\` 检查副作用
- [ ] 修复 Strict Mode 暴露的副作用清理问题
- [ ] 检查 \`flushSync\` 的使用（避免不必要的同步渲染）
- [ ] 检查 TypeScript 类型，显式声明 children
- [ ] 测试所有异步场景（fetch、setTimeout 中的 setState）
- [ ] 检查第三方库兼容性（CSS-in-JS、状态管理、路由）
- [ ] 性能回归测试（用 Profiler 对比）

### 底层原理

React 18 的迁移之所以是"渐进式"的，是因为核心架构变化都在内部：

**1. 调度器（Scheduler）**

React 17 的调度器已经存在，但只在事件回调中起作用。React 18 让调度器在所有更新中默认启用，配合 lane 模型管理优先级。

**2. Lane 模型**

每个更新分配一个 lane（车道），高优先级 lane（如用户输入）可以打断低优先级 lane（如数据获取后的渲染）。这就是并发渲染的基础。

**3. Fiber 树复用**

并发渲染中断后，已完成的 fiber 节点会被保留，恢复时复用。这让"重渲染"的开销远小于"从头渲染"。

**4. 自动批处理的实现**

React 17 在事件处理函数执行期间设置一个全局 \`isBatching\` 标志，setState 检测到标志就排队。React 18 改用 lane 模型，所有更新都通过 lane 调度，天然支持批处理，不需要全局标志。

**5. createRoot 的作用**

\`createRoot\` 返回一个 root 对象，关联了 fiber 根节点和调度器。这是启用并发特性的"开关"——旧 API \`ReactDOM.render\` 内部走的是同步路径，新 API 走并发路径。

**6. SSR 流式渲染**

React 18 的 \`renderToPipeableStream\` 配合 Suspense 可以流式发送 HTML：先发送外壳（shell）， Suspense 内的内容准备好后再流式追加。这让用户更早看到首屏。

### 常见陷阱

1. **只升级 react 没升级 react-dom**：两者必须版本一致，否则报错或行为异常。

2. **忘记升级 @types/react**：TypeScript 项目中类型不匹配会报一堆错误。

3. **第三方库版本太旧**：旧版 react-redux 不支持 useSyncExternalStore，会有 tearing 风险。务必升级到 v8+。

4. **在 createRoot 外修改 DOM**：React 18 更严格地管理 DOM，外部直接改 DOM 可能被 React 覆盖。

5. **flushSync 滥用**：很多人看到自动批处理不习惯，到处加 flushSync。这会破坏并发特性，只在确实需要同步刷新时用（如测量 DOM）。

6. **SSR 改用流式渲染后缓存策略失效**：流式渲染的 HTML 是分块发送的，CDN 缓存策略可能要调整。

7. **Strict Mode 在测试中也会双调用**：测试用例需要适应双调用，确保 setup/cleanup 幂等。

8. **Suspense + 流式 SSR 的 hydration 顺序**：HTML 分块到达，hydration 也分阶段进行。需要确保组件能处理"部分 hydration"。

9. **Hydration mismatch 警告变多**：React 18 对 hydration 一致性更严格，原本"侥幸能跑"的代码会报警告。

### 性能提示

1. **用 createRoot 才能享受并发红利**：很多人升级了 React 包但没改 createRoot，并发特性根本没启用。

2. **Suspense 包裹路由**：路由级 Suspense 配合流式 SSR，让首屏更快。

3. **useTransition 优化大列表**：列表过滤、排序用 transition，保持输入响应。

4. **useDeferredValue 替代 debounce**：很多 debounce 场景可以用 useDeferredValue，更原生。

5. **选择性 hydration**：React 18 的 hydration 可以按需进行，用户点击某个组件时优先 hydration 它，提升交互感知。

6. **流式 SSR + Suspense 边界**：把首屏关键内容放在主 Suspense 内，次要内容放嵌套 Suspense，让关键内容先流式到达。

7. **监控 hydration 错误**：hydration mismatch 在生产环境会降级为客户端渲染，性能损失大。生产前彻底清理。

8. **Profiling 用生产构建**：开发模式的 Strict Mode 双调用会污染性能数据，性能测试一定用生产构建。
    `,
    code: `// =============================================================
// React 17 → React 18 迁移对比演示
// 用纯 JS 演示同步渲染 vs 并发渲染、批处理差异
// =============================================================

// ---------- 演示 1：挂载 API 变化 ----------
console.log('========== 演示 1：挂载 API 变化 ==========');
console.log('React 17（旧）:');
console.log(\`  import ReactDOM from 'react-dom';\`);
console.log(\`  ReactDOM.render(<App />, document.getElementById('root'));\`);
console.log('');
console.log('React 18（新）:');
console.log(\`  import { createRoot } from 'react-dom/client';\`);
console.log(\`  const root = createRoot(document.getElementById('root'));\`);
console.log(\`  root.render(<App />);\`);
console.log('');
console.log('关键：不用 createRoot 不会启用并发特性，只升级包是没用的');

// ---------- 演示 2：批处理差异 ----------
console.log('\\n========== 演示 2：自动批处理差异 ==========');

// 模拟 React 17 的批处理（只在 React 事件中批处理）
class React17Batcher {
  constructor() {
    this.state = { a: 0, b: 0 };
    this.renderCount = 0;
    this.isBatching = false;
    this.pendingUpdates = [];
  }

  setState(updater) {
    if (this.isBatching) {
      this.pendingUpdates.push(updater);
    } else {
      // 立即同步渲染
      this.state = { ...this.state, ...updater };
      this.renderCount++;
    }
  }

  // React 事件回调（批处理）
  reactEvent(fn) {
    this.isBatching = true;
    fn();
    this.isBatching = false;
    // 批量应用
    for (const u of this.pendingUpdates) {
      this.state = { ...this.state, ...u };
    }
    this.pendingUpdates = [];
    this.renderCount++;
  }

  // 异步回调（不批处理）
  asyncCallback(fn) {
    fn();  // 每次setState都立即渲染
  }
}

// 模拟 React 18 的批处理（所有更新都批处理）
class React18Batcher {
  constructor() {
    this.state = { a: 0, b: 0 };
    this.renderCount = 0;
    this.pendingUpdates = [];
    this.scheduled = false;
  }

  setState(updater) {
    this.pendingUpdates.push(updater);
    if (!this.scheduled) {
      this.scheduled = true;
      // 模拟微任务调度
      Promise.resolve().then(() => {
        for (const u of this.pendingUpdates) {
          this.state = { ...this.state, ...u };
        }
        this.pendingUpdates = [];
        this.renderCount++;
        this.scheduled = false;
      });
    }
  }

  reactEvent(fn) { fn(); }
  asyncCallback(fn) { fn(); }
}

// 对比测试
function testBatching(label, batcher) {
  const beforeRenders = batcher.renderCount;
  batcher.asyncCallback(() => {
    batcher.setState({ a: 1 });
    batcher.setState({ b: 2 });
  });
  return batcher.renderCount - beforeRenders;
}

(async () => {
  console.log('场景：在异步回调（setTimeout/promise）中两次 setState');
  console.log('');

  const r17 = new React17Batcher();
  console.log('React 17 异步回调中触发渲染次数: ' + testBatching('r17', r17));
  console.log('  → 不批处理，2 次 setState 触发 2 次渲染');

  const r18 = new React18Batcher();
  testBatching('r18', r18);
  await new Promise(r => setTimeout(r, 10));
  console.log('React 18 异步回调中触发渲染次数: ' + (r18.renderCount));
  console.log('  → 自动批处理，2 次 setState 只触发 1 次渲染 ✅');

  // ---------- 演示 3：flushSync 强制同步 ----------
  console.log('\\n========== 演示 3：flushSync 强制同步更新 ==========');
  console.log('场景：需要立即读取 DOM 时，用 flushSync 绕过批处理');
  console.log(\`  import { flushSync } from 'react-dom';\`);
  console.log(\`  flushSync(() => setA(1));  // 立即同步渲染\`);
  console.log(\`  console.log(DOM.clientHeight);  // 能读到最新值\`);
  console.log(\`  setB(2);  // 这次的更新会被批处理\`);

  // ---------- 演示 4：同步渲染 vs 并发渲染 ----------
  console.log('\\n========== 演示 4：同步 vs 并发渲染 ==========');

  // 模拟同步渲染：一旦开始就停不下来
  function syncRender(components) {
    const log = [];
    for (const c of components) {
      log.push('渲染 ' + c);
    }
    return log;
  }

  // 模拟并发渲染：可以被中断，高优先级任务先跑
  function concurrentRender(components, highPriorityAt) {
    const log = [];
    let i = 0;
    while (i < components.length) {
      // 模拟时间切片：每渲染 2 个检查是否要中断
      if (i === highPriorityAt) {
        log.push('[中断] 高优先级任务插入，暂停低优先级渲染');
        log.push('[处理] 用户输入（高优先级）');
        log.push('[恢复] 继续低优先级渲染');
      }
      log.push('渲染 ' + components[i]);
      i++;
    }
    return log;
  }

  const comps = ['List1', 'List2', 'List3', 'List4'];
  console.log('同步渲染（React 17）：');
  syncRender(comps).forEach(l => console.log('  ' + l));
  console.log('  → 必须全部渲染完才能响应用户输入');

  console.log('\\n并发渲染（React 18）：');
  concurrentRender(comps, 2).forEach(l => console.log('  ' + l));
  console.log('  → 用户输入可以中断渲染，保持响应 ✅');

  // ---------- 演示 5：SSR 变化 ----------
  console.log('\\n========== 演示 5：SSR 变化 ==========');
  console.log('React 17 SSR:');
  console.log(\`  const html = ReactDOMServer.renderToString(<App />);\`);
  console.log('  → 一次性生成完整 HTML，必须等所有数据准备好');
  console.log('');
  console.log('React 18 SSR（流式）:');
  console.log(\`  const { pipe } = renderToPipeableStream(<App />, {\`);
  console.log(\`    onShellReady() { pipe(res); },  // 外壳准备好就开始发送\`);
  console.log(\`    onShellError(e) { /* 处理错误 */ },\`);
  console.log(\`  });\`);
  console.log('  → 配合 Suspense，分块流式发送，首屏更快 ✅');

  // ---------- 演示 6：迁移检查清单 ----------
  console.log('\\n========== 迁移检查清单 ==========');
  const checklist = [
    '升级 react、react-dom 到 18',
    '升级 @types/react、@types/react-dom 到 18',
    '升级 react-redux 到 8+、react-router-dom 到 6+',
    'ReactDOM.render → createRoot',
    'ReactDOM.hydrate → hydrateRoot',
    'renderToString → renderToPipeableStream（可选）',
    '启用 <StrictMode> 检查副作用',
    '修复 Strict Mode 暴露的清理问题',
    '检查 TypeScript children 类型',
    '测试异步回调中的 setState 行为',
    '检查第三方库兼容性',
  ];
  checklist.forEach((item, i) => console.log('  [ ] ' + (i + 1) + '. ' + item));
})();
`,
  },
];
