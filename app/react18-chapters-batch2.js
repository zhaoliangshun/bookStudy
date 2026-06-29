// =============================================================
// React 18 新特性交互式教程 —— 第二批章节（Suspense 与 SSR 组，共 6 章）
// -------------------------------------------------------------
// 覆盖：Suspense 数据获取、SuspenseList、流式 SSR、选择性注水、
// hydrateRoot、renderToPipeableStream。
// 重点：throw promise 机制、并发渲染配合、chunked 流式传输、
// 交互优先注水、hydration 差异检测、pipeable stream 回调时序。
// 所有 code 字段均为纯 JS，可在 Node 沙箱中运行（不依赖 react）。
// =============================================================

export const chapters = [
  // ---------------------------------------------------------
  // 第一章：Suspense 数据获取
  // ---------------------------------------------------------
  {
    id: "react18-suspense-data-fetching",
    title: "Suspense 数据获取",
    icon: "🎬",
    group: "Suspense 与 SSR",
    content: `## 一、为什么需要 Suspense for Data Fetching

在 React 18 之前，组件获取数据通常要手动维护一套状态机：\`loading / data / error\`，UI 里写满三元表达式，把"加载中"的展示逻辑和数据展示逻辑混在一起。一旦同一页面有多个数据源，还会出现"瀑布流请求"——上层组件拿到数据后才渲染下层，下层才开始请求，串行等待。

Suspense for Data Fetching 想解决的问题是：**让组件像读取同步变量一样读取异步数据，把"还没准备好"这件事交给框架处理**。你只管写 \`const data = resource.read()\`，至于此时该显示骨架、该挂起、还是该直接返回数据，由外层 \`<Suspense>\` 边界决定。

### 1.1 一个最小例子

\`\`\`jsx
<Suspense fallback={<Skeleton />}>
  <Profile resource={userResource} />
</Suspense>

function Profile({ resource }) {
  const user = resource.read(); // 未就绪时这里会"抛出 promise"
  return <h1>{user.name}</h1>;
}
\`\`\`

- \`Profile\` 组件本身完全不感知"加载中"这件事，它只管读数据。
- \`userResource\` 是一个带 \`read()\` 方法的资源对象，由数据层（Relay、SWR、React Query 或自封装）提供。
- 当 \`read()\` 被调用但数据未就绪时，它会 \`throw\` 一个 Promise，被外层 \`<Suspense>\` 捕获，Suspense 显示 \`fallback\`，等 Promise resolve 后重新渲染 \`Profile\`。

### 1.2 throw promise 机制

这是 Suspense 最反直觉也最精妙的地方：**用 \`throw\` 表达"我还没准备好"**。任何 JavaScript 函数都能 \`throw\` 任何值，包括 Promise。React 在渲染组件时用 try/catch 包裹子树，若捕获到一个 thenable（Promise），它就知道"这棵子树在等异步数据"，于是挂起它、挂上 fallback、注册到该 Promise 的 \`.then\` 上。

这和错误边界（Error Boundary）用的是同一套"用 throw 跨层传递信号"的机制，区别仅在于：

- 抛 Promise → Suspense 处理（显示 fallback）
- 抛普通 Error → Error Boundary 处理（显示错误 UI）

### 1.3 wrappee / wrapper 模式

社区把"内部读取数据、可能 throw promise 的组件"叫 **wrappee**，把"外面套着的 Suspense 边界"叫 **wrapper**。常见组织方式：wrapper 提供降级 UI，wrappee 只关心数据到齐后的渲染。把 Suspense 边界放得越靠近数据消费者，fallback 粒度越细；放得越靠外，UI 抖动越少但降级范围越大。

### 1.4 与并发渲染配合

React 18 的并发渲染让 Suspense 真正可用：

- 渲染是**可中断**的：React 可以开始渲染一棵子树，发现它挂起后，先去渲染别的，不阻塞主线程。
- 不会出现"渲染了一半的脏 UI"：挂起的子树渲染结果会被丢弃，只在数据就绪后整体提交。
- 多个 Suspense 边界可以各自独立挂起/恢复，互不阻塞。

在 React 17 的同步模式下，Suspense for Data Fetching 无法稳定工作，因为渲染不可中断，throw promise 会导致整棵树卡住。**并发渲染是 Suspense 数据获取的前置条件。**

### 1.5 错误边界配合

当 \`read()\` 背后的 Promise reject 时，资源对象通常会把 error 缓存下来并在下一次 \`read()\` 中 \`throw error\`，这个普通 Error 会被上层 Error Boundary 捕获。因此一个健壮的 Suspense 数据获取场景通常同时存在两层边界：外层 Error Boundary 兜底错误，内层 Suspense 兜底加载态。

## 底层原理

throw promise 的完整链路是这样的：

1. **渲染包裹**：React 渲染某棵子树时，会在外层用一个内部的 handler 包裹调用，类似 \`try { render(child) } catch (thrown) { ... }\`。
2. **识别 thenable**：捕获到值后，React 判断它是否是 thenable（\`typeof thrown.then === 'function'\`）。是 → 视为挂起信号；否 → 视为普通错误向上抛。
3. **挂起子树**：React 把当前子树标记为"挂起"，回退到最近的 \`<Suspense>\` 边界，渲染其 \`fallback\`，并把当前正在进行的渲染工作整体作废（不提交到 DOM）。
4. **监听 Promise**：React 给这个 Promise 注册 \`.then\`，resolve 后把"这次更新"重新调度为高优先级任务，再次尝试渲染该子树。
5. **重试与缓存**：资源层应在 resolve 后把结果缓存进资源对象，这样重试时 \`read()\` 直接返回同步数据，不再 throw。

关键点：throw 发生在**渲染过程中**，所以它能跨任意层级的函数调用传递——\`read()\` 在很深的子组件里调用，Suspense 边界在外层，中间组件完全无感。这正是 throw 语义比"返回特殊值"更强大的原因。

## 常见陷阱

- **每次渲染都创建新 Promise**：如果在组件内 \`const resource = createResource(fetch())\` 里直接发起请求，每次渲染都会新建资源，永远 pending、永远挂起。资源必须在组件外或 useMemo/useRef 中稳定持有。
- **把 Suspense 当成数据请求库**：Suspense 只是一种"声明挂起"的协议，它不会替你发请求。你得自己实现 \`createResource\`（或用支持 Suspense 的数据库/查询库）。
- **fallback 里又触发了同样的请求**：fallback 子树如果也读同一个未就绪资源，会再次挂起，形成无限 fallback 嵌套。fallback 必须是纯静态的。
- **在事件回调里直接 read()**：\`read()\` 抛出的 promise 只能在渲染期被 React 捕获。在 \`onClick\` 里直接 read 没有 Suspense 接住，会变成未捕获异常。
- **忘记配 Error Boundary**：Promise reject 后没有 Error Boundary 接住，整个子树会白屏。

## 性能提示

- **预取资源**：在路由切换/悬停时就创建 resource，等组件真正渲染时数据可能已就绪，\`read()\` 直接同步返回，省掉一次挂起。
- **合理切分 Suspense 边界**：太细 → fallback 频繁闪烁；太粗 → 局部慢拖累整块。按"视觉上独立的区块"切分最自然。
- **复用已 resolve 的资源**：资源对象缓存结果后，多个组件 read 同一资源只触发一次请求，且无挂起开销。
- **结合 \`useTransition\`**：把"切换到需要新数据的视图"包在 transition 里，可以让 React 在数据就绪前保留旧 UI，避免 fallback 闪烁。`,
    code: `// ============================================================
// 第一章代码演示：用纯 JS 模拟 Suspense 的 throw promise 机制
// ============================================================
// React 18 的 Suspense 核心机制：当组件读取未就绪的数据时，组件会
// "抛出一个 Promise"，Suspense 边界捕获该 Promise 并展示 fallback，
// 等 Promise resolve 后重新渲染。下面用纯 JS 模拟这一过程。

console.log("===== 1. 资源工厂 createResource：read() 在未就绪时 throw promise =====\\n");

// 资源工厂：把一个 promise 包装成带 read() 的资源对象
function createResource(promise) {
  let status = "pending"; // pending | success | error
  let result;
  let error;
  promise.then(
    (res) => { status = "success"; result = res; },
    (err) => { status = "error"; error = err; }
  );
  return {
    read() {
      if (status === "pending") throw promise;  // 关键：throw promise
      if (status === "error") throw error;      // 错误也用 throw 传递
      return result;
    }
  };
}

// 模拟一个"组件"（普通函数），内部调用 resource.read()
function Profile({ resource }) {
  const data = resource.read();
  return \`Profile(name=\${data.name}, age=\${data.age})\`;
}

// 模拟 Suspense 边界：捕获子"组件"抛出的 promise，否则正常返回渲染结果
function suspense(child, fallback) {
  try {
    return { kind: "ok", value: child() };
  } catch (thrown) {
    if (thrown && typeof thrown.then === "function") {
      return { kind: "suspended", promise: thrown, fallback };
    }
    throw thrown; // 非 promise 异常继续向上抛（交给错误边界）
  }
}

// 模拟数据请求
function fetchProfile() {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ name: "Alice", age: 28 }), 30)
  );
}

const resource = createResource(fetchProfile());

// 首次"渲染"
const first = suspense(() => Profile({ resource }), "加载中...");
console.log("首次渲染结果：", first.kind === "suspended"
  ? \`挂起 -> 显示 fallback "\${first.fallback}"\` : first.value);

// 等待 promise resolve 后重新渲染
if (first.kind === "suspended") {
  await first.promise;
  console.log("（Promise 已 resolve，React 触发重新渲染）");
  const second = suspense(() => Profile({ resource }), "加载中...");
  console.log("重新渲染结果：", second.value);
}

await new Promise((r) => setTimeout(r, 20));

console.log("\\n===== 2. 错误边界：捕获子组件抛出的普通错误 =====\\n");

function errorBoundary(child, handler) {
  try {
    return { kind: "ok", value: child() };
  } catch (err) {
    handler(err);
    return { kind: "errored" };
  }
}

// 制造一个会 reject 的资源
const badResource = createResource(Promise.reject(new Error("网络炸了")));
// 先让 reject 发生（createResource 内已挂 handler，不会有未捕获告警）
await new Promise((r) => setTimeout(r, 10));

const errResult = errorBoundary(
  () => Profile({ resource: badResource }),
  (err) => console.log("错误边界捕获到：", err.message)
);
console.log("渲染状态：", errResult.kind);

console.log("\\n===== 3. wrappee / wrapper 模式：把 Suspense 包在数据读取组件外 =====\\n");

// wrapper：负责 Suspense 边界；wrappee：负责读数据
function withSuspense(wrappee, fallback) {
  return (props) => suspense(() => wrappee(props), fallback);
}

const WrappedProfile = withSuspense(Profile, "骨架屏...");

const freshResource = createResource(
  new Promise((r) => setTimeout(() => r({ name: "Bob", age: 35 }), 30))
);

const w1 = WrappedProfile({ resource: freshResource });
console.log("wrapper 首次：", w1.kind === "suspended" ? \`挂起 -> "\${w1.fallback}"\` : w1.value);
if (w1.kind === "suspended") {
  await w1.promise;
  const w2 = WrappedProfile({ resource: freshResource });
  console.log("wrapper 二次：", w2.value);
}

console.log("\\n===== 关键观察 =====");
console.log("  * read() 未就绪时 throw promise，Suspense 接住并显示 fallback");
console.log("  * promise resolve 后 React 重渲染，read() 同步返回数据");
console.log("  * reject 时 read() throw error，由 Error Boundary 接住");`,
  },

  // ---------------------------------------------------------
  // 第二章：SuspenseList 协调多个 Suspense
  // ---------------------------------------------------------
  {
    id: "react18-suspense-list",
    title: "SuspenseList 协调多个 Suspense",
    icon: "📋",
    group: "Suspense 与 SSR",
    content: `## 一、SuspenseList 要解决的问题

当一个列表里有多个 \`<Suspense>\` 边界各自独立挂起时，它们的"揭示顺序"完全由各自数据返回速度决定。这会导致两个体验问题：

1. **布局抖动**：先就绪的先冒出来，后面的依次挤进来，列表高度反复跳动。
2. **顺序错乱**：第 3 条数据先回来，第 1 条还没回来，用户看到的是"中间先出现、开头后出现"的怪异顺序。

\`<SuspenseList>\` 就是用来**协调多个 Suspense 边界的揭示顺序**的容器组件，让它们按你期望的方式依次或一起出现。

### 1.1 基本用法

\`\`\`jsx
<SuspenseList revealOrder="forwards" tail="collapsed">
  <Suspense fallback={<Skeleton />}><Item id={1} /></Suspense>
  <Suspense fallback={<Skeleton />}><Item id={2} /></Suspense>
  <Suspense fallback={<Skeleton />}><Item id={3} /></Suspense>
</SuspenseList>
\`\`\`

两个核心属性：

- **revealOrder**：揭示顺序。
  - \`"forwards"\`：按声明顺序从前到后揭示。后面即便先就绪也得等前面。
  - \`"backwards"\`：按声明顺序从后到前揭示。
  - \`"together"\`：全部就绪后一次性揭示，期间所有 fallback 都显示。
- **tail**：控制 fallback 的展示策略。
  - \`"collapsed"\`：只显示"正在揭示的那一个"的 fallback，其余隐藏（最常用）。
  - \`"hidden"\`：完全不显示 fallback，等揭示。
  - 不设：所有未揭示的都显示 fallback。

### 1.2 使用场景

- **搜索结果列表**：希望结果从上到下依次出现，避免中间先冒。
- **feed 流**：希望多条内容"一起出现"，整体感更强（\`together\`）。
- **表格行**：希望按行号顺序揭示，保持视觉稳定。

### 1.3 仍是实验性 API

必须强调：截至 React 18 稳定版，**SuspenseList 仍标记为 experimental**，不能在稳定分支直接使用，需要切换到 \`experimental\` 渠道。它的 API（属性名、行为细节）在未来版本可能调整。在生产环境使用前务必确认当前 React 版本的官方说明。本章节侧重理解其协调思想，方便你在它稳定后立即上手。

## 底层原理

SuspenseList 本质是一个**带顺序约束的 Suspense 协调器**：

1. **收集子边界**：SuspenseList 渲染时，记录内部所有 \`<Suspense>\` 子边界的声明顺序和挂起状态。
2. **顺序约束**：根据 \`revealOrder\` 决定哪些子边界"现在可以揭示"：
   - \`forwards\`：只有当前"队首"就绪才允许揭示，揭示后队首后移；队中后续的就绪者要排队等待。
   - \`backwards\`：同上但队列反向。
   - \`together\`：所有子边界都就绪才一次性全部揭示。
3. **fallback 策略**：\`tail\` 决定那些"已就绪但不能揭示"或"未就绪"的子边界是否显示 fallback。本质是 SuspenseList 把这些子边界临时"替换"成 fallback 或空。

可以把它理解成一个"栅栏"：每个子边界在栅栏外等待，SuspenseList 按顺序放它们进来。即使第 5 个早就绪了，只要第 1 个没就绪，第 5 个也得在栅栏外等。这样最终呈现给用户的揭示顺序总是确定的、稳定的。

## 常见陷阱

- **误以为它能加速渲染**：SuspenseList 不改变数据获取速度，只改变"揭示时机"。慢的还是慢。
- **revealOrder=forwards + 慢的首项**：如果第 1 项特别慢，后面所有项都得等它，可能比不用 SuspenseList 还慢。这种场景考虑 \`together\` 或干脆不用。
- **嵌套 SuspenseList**：嵌套时顺序约束会叠加，行为难以预测，官方也不推荐。
- **把它当稳定 API 用**：experimental 渠道升级可能改行为，生产环境慎用。
- **期待它解决数据请求顺序**：它只管"揭示"，不管"请求"。请求顺序由你的数据层决定。

## 性能提示

- **配合预取**：列表项进入视口前就预取数据，到了真正渲染时多数已就绪，SuspenseList 几乎不需要等待。
- **合理选择 tail**：\`collapsed\` 比"全部显示 fallback"渲染开销低（DOM 节点更少），适合长列表。
- **避免在 together 模式下放太多项**：全部就绪才揭示，项数越多等待越长，用户感知"卡顿"。
- **大列表考虑虚拟化**：SuspenseList 不做虚拟化，上千项时仍需配合虚拟滚动方案。`,
    code: `// ============================================================
// 第二章代码演示：用纯 JS 模拟 SuspenseList 的 revealOrder 行为
// ============================================================
// SuspenseList 协调多个 Suspense 边界的"揭示顺序"。
// revealOrder: forwards（按声明顺序）/ backwards（反序）/ together（一起）。
// 下面用纯 JS 模拟三种模式的协调逻辑。

// 制造一个"内容块"：到点就 ready
function makeBlock(name, delay) {
  let ready = false;
  const promise = new Promise((r) =>
    setTimeout(() => { ready = true; r(); }, delay)
  );
  return { name, promise, isReady: () => ready };
}

// SuspenseList 协调器：根据 revealOrder 决定揭示顺序
function suspenseList(blocks, revealOrder) {
  return new Promise((resolve) => {
    const revealed = [];
    const emit = (b) => {
      revealed.push(b.name);
      console.log(\`  -> 揭示 \${b.name}\`);
    };

    if (revealOrder === "together") {
      // 全部就绪后，按声明顺序一次性揭示
      Promise.all(blocks.map((b) => b.promise)).then(() => {
        blocks.forEach(emit);
        resolve(revealed);
      });
      return;
    }

    // forwards / backwards 都是"顺序约束"：只能按某个顺序揭示
    const queue = revealOrder === "backwards" ? [...blocks].reverse() : [...blocks];

    const tick = () => {
      // 只要有"队首已就绪"，就揭示它并后移
      while (queue.length && queue[0].isReady()) {
        emit(queue.shift());
      }
      if (queue.length) {
        // 队首还没就绪，等它就绪后再尝试
        queue[0].promise.then(tick);
      } else {
        resolve(revealed);
      }
    };
    tick();
  });
}

console.log("===== 1. revealOrder=forwards（按声明顺序揭示）=====");
console.log("声明: A(60ms) B(20ms) C(40ms) —— B、C 比 A 先就绪，但必须等 A\\n");
await suspenseList([
  makeBlock("A", 60),
  makeBlock("B", 20),
  makeBlock("C", 40),
], "forwards");
console.log("  结果顺序: A -> B -> C（即便 B 更早就绪也排队等待）\\n");

console.log("===== 2. revealOrder=backwards（反序揭示）=====");
console.log("声明: X(20ms) Y(60ms) Z(40ms)，反序即 Z -> Y -> X\\n");
await suspenseList([
  makeBlock("X", 20),
  makeBlock("Y", 60),
  makeBlock("Z", 40),
], "backwards");
console.log("  结果顺序: Z -> Y -> X\\n");

console.log("===== 3. revealOrder=together（全部就绪后一起揭示）=====");
console.log("声明: P(20ms) Q(60ms) R(40ms)\\n");
await suspenseList([
  makeBlock("P", 20),
  makeBlock("Q", 60),
  makeBlock("R", 40),
], "together");
console.log("  三者几乎同时打印 -> 一起揭示（避免布局抖动）\\n");

console.log("===== 4. tail 配置示意（仅概念演示）=====");
console.log("  tail=collapsed：只显示当前正在揭示那一个的 fallback");
console.log("  tail=hidden：不显示任何 fallback，直接等揭示");
console.log("  不设 tail：所有未揭示的都显示 fallback");
console.log("\\n  注意：SuspenseList 仍为实验性 API，生产环境慎用。");`,
  },

  // ---------------------------------------------------------
  // 第三章：流式 SSR
  // ---------------------------------------------------------
  {
    id: "react18-streaming-ssr",
    title: "流式 SSR",
    icon: "🌊",
    group: "Suspense 与 SSR",
    content: `## 一、传统 SSR 的痛点

传统 SSR（\`renderToString\`）的工作方式是"一锤子买卖"：

1. 服务端收集页面需要的**所有**数据；
2. 把整棵组件树渲染成完整 HTML 字符串；
3. 一次性把 HTML 发给浏览器；
4. 浏览器收到完整 HTML 后才开始解析、显示；
5. 之后加载 JS、 hydration。

问题在于第 1 步：**必须等最慢的那个数据请求完成才能开始发送**。如果页面里有一个慢接口（比如推荐列表要 800ms），即便用户信息 50ms 就能拿到，整个页面的首字节时间（TTFB）也被拖到 800ms+。用户盯着白屏干等。

## 二、流式 SSR 的核心思想

流式 SSR 把"渲染 + 发送"拆成**增量**的：

1. 服务端**立即**渲染并发送页面外壳（shell）：\`<html><head>...</head><body><div id="root">\`，加上布局骨架。
2. 对于被 \`<Suspense>\` 挂起的慢组件，先发送它的 \`fallback\`（骨架屏）。
3. 数据陆续就绪后，服务端**继续**渲染对应内容，把结果作为一段 \`<div hidden>\` + 一段替换脚本追加到流的尾部。
4. 浏览器边收边执行脚本，把骨架替换成真实内容。

这样**首字节时间 ≈ shell 生成时间**（几乎立即），慢数据在后台慢慢追加，用户先看到骨架再看到内容，体感快得多。

### 2.1 与 chunked transfer encoding 的关系

HTTP/1.1 起就支持 \`Transfer-Encoding: chunked\`：服务端可以不写 \`Content-Length\`，把响应拆成多个 chunk 持续发送。流式 SSR 正是利用这一点：\`renderToPipeableStream\` 返回的是一个 Node \`Readable\` 流，\`pipe(res)\` 后每个渲染出的片段就作为一个 chunk 推给浏览器。浏览器收到 chunk 就能渐进解析。

### 2.2 与 Suspense 配合

\`<Suspense>\` 边界天然是流式 SSR 的"切分点"：

- shell 阶段：被挂起的 Suspense 渲染成 fallback HTML。
- 数据就绪阶段：React 把该 Suspense 的真实内容渲染出来，连同一段微替换脚本一起追加到流里。

一个页面可以有多个 Suspense 边界，各自独立流式揭示，互不阻塞。这就是 React 18 SSR 最核心的体验提升。

## 底层原理

1. **shell 渲染**：React 先尝试渲染整棵树，遇到 \`<Suspense>\` 且其子树挂起时，在对应位置输出 fallback，同时把这个 Suspense 登记到"待完成列表"，shell 部分可以立即 flush。
2. **onShellReady 回调**：外壳（不含挂起子树）渲染完成时触发，此时可以开始 \`pipe(res)\`，把 shell 发给浏览器。
3. **分块追加**：每个挂起的 Suspense 在其数据 resolve 后，React 渲染其真实内容，输出形如 \`<div hidden id="S:1">真实内容</div><script>$RC("S:1", "B:1")</script>\` 的片段到流中。脚本会把 fallback 节点替换为真实内容。
4. **onAllReady**：所有 Suspense 都完成、流结束时触发，适合静态预渲染/爬虫场景。
5. **chunked 编码**：Node 的 \`stream.pipe(res)\` 配合 HTTP server 自动以 chunked 编码发送，浏览器无需等待完整响应即可逐步渲染。

关键：流式 SSR 把"等待数据"的时间从"首字节前"挪到了"首字节后"，让用户先看到可交互外壳，慢内容渐进填充。

## 常见陷阱

- **fallback 不能依赖挂起的数据**：fallback 会被立即发送，若它本身又 throw promise，就形成无限挂起。
- **状态化组件的 hydration 顺序**：流式 SSR 下，不同块的 hydration 时序不一致，跨块共享状态要小心，避免 hydration mismatch。
- **CDN/代理缓冲**：某些反向代理（如默认配置的 Nginx）会缓冲整个响应再转发，破坏流式效果。需配置 \`X-Accel-Buffering: no\` 或关闭 proxy buffering。
- **SEO 与流式**：爬虫通常等完整 HTML，流式不影响最终 HTML 内容，但要在 \`onAllReady\` 后再返回给爬虫以保完整。
- **错误处理时机**：流式过程中错误可能发生在已发送部分内容之后，此时只能用脚本注入错误 UI 或让客户端兜底，不能改写已发送的头部状态码。

## 性能提示

- **把慢组件包进 Suspense**：这是流式 SSR 收益的前提，没包 Suspense 的慢组件仍会阻塞 shell。
- **shell 尽量轻**：shell 越简单，首字节越快，用户越早看到内容。
- **关键数据放 shell 内、非关键数据放 Suspense 内**：导航栏、用户信息直接渲染，推荐列表、评论区走 Suspense 流式。
- **合理设置 status code**：流式开始后已无法改 status code，所以对需要根据数据决定 200/404 的场景，要么把判断提前到 shell 前，要么接受用客户端跳转。
- **监控 TTFB 和 LCP**：流式 SSR 主要优化 TTFB 和首屏 LCP，配合 Good 组件设计效果显著。`,
    code: `// ============================================================
// 第三章代码演示：用纯 JS + stream 模拟流式 SSR
// ============================================================
// 传统 SSR：等服务端拿到所有数据后，一次性拼出完整 HTML 再发送。
// 流式 SSR：边生成边发送，先用骨架填充，数据就绪后追加脚本注入。
// 下面用 Node 的 stream 模拟两种模式的差异。

const { Readable } = require("stream");

console.log("===== 1. 传统 SSR：等所有数据就绪后一次性返回 =====\\n");

function fetchCritical() {
  return new Promise((r) => setTimeout(() => r("用户信息"), 40));
}
function fetchSlow() {
  return new Promise((r) => setTimeout(() => r("推荐列表"), 80));
}

async function traditionalSSR() {
  const [a, b] = await Promise.all([fetchCritical(), fetchSlow()]);
  return \`<html><body><main>\${a}</main><aside>\${b}</aside></body></html>\`;
}

const t0 = Date.now();
const html = await traditionalSSR();
console.log(\`传统 SSR 在 \${Date.now() - t0}ms 后一次性输出：\`);
console.log(html);

console.log("\\n===== 2. 流式 SSR：边生成边发送（chunked）=====\\n");

// 用 Readable 模拟 ReactDOMServer.renderToPipeableStream 的流式输出
function streamingSSR() {
  const chunks = [];
  const stream = new Readable({ read() {} });

  const push = (s) => {
    chunks.push(s);
    stream.push(Buffer.from(s));
  };
  const t1 = Date.now();
  const log = (msg) => console.log(\`  [\${Date.now() - t1}ms] \${msg}\`);

  // 1) shell 立刻发送（含 Suspense fallback）
  push(\`<html><body><main>加载中...</main>\`);
  log("发送 shell（含 fallback）");

  // 2) 关键数据就绪 -> 注入脚本替换 main 内容
  fetchCritical().then((data) => {
    push(\`<script>document.querySelector('main').textContent='\${data}'</script>\`);
    log(\`注入 critical: \${data}\`);
  });

  // 3) 慢数据就绪 -> 追加 aside 并结束
  fetchSlow().then((data) => {
    push(\`<aside>\${data}</aside></body></html>\`);
    log(\`追加 slow: \${data}\`);
    stream.push(null); // 结束流
  });

  return { stream, chunks };
}

const { stream, chunks } = streamingSSR();

// 收集流式输出（模拟 res 接收）
await new Promise((resolve) => {
  stream.on("data", () => {});
  stream.on("end", resolve);
});

console.log(\`\\n流式 SSR 完整拼接结果（最终与传统 SSR 一致）：\`);
console.log(chunks.join(""));

console.log("\\n===== 3. 关键差异 =====");
console.log("  传统 SSR：首字节时间(TTFB) ≈ 最慢数据的时间（80ms）");
console.log("  流式 SSR：首字节时间 ≈ shell 生成时间（几乎立即，0ms）");
console.log("           慢数据后续渐进注入，用户先看到骨架再看到内容");`,
  },

  // ---------------------------------------------------------
  // 第四章：选择性注水
  // ---------------------------------------------------------
  {
    id: "react18-selective-hydration",
    title: "选择性注水",
    icon: "💧",
    group: "Suspense 与 SSR",
    content: `## 一、传统 hydration 的阻塞问题

hydration（注水）是指：服务端渲染出的 HTML 已经在浏览器里显示出来了，但还没有事件绑定。React 需要把这棵 DOM 与客户端组件树对齐、复用现有 DOM 节点、 attach 事件监听器。在 React 17 及之前：

1. hydration 是**串行、不可中断**的：必须按 DOM 顺序从根开始，逐节点注水。
2. 整个过程**阻塞主线程**：hydration 没完成时，用户点击、输入都得不到响应。
3. 如果某块数据没回来，整棵树都得等：因为注水是按 DOM 顺序的，前面的没注水完，后面的也注不了。

后果是：页面看起来已经显示了，但用户点击按钮没反应（"看着能用、其实用不了"），这种"hydration gap"在复杂页面尤其明显。

## 二、选择性注水（Selective Hydration）

React 18 配合 \`hydrateRoot\` + \`<Suspense>\` 实现选择性注水：

1. **分块注水**：被 \`<Suspense>\` 包裹的块可以作为独立单元注水，不必等整棵树。
2. **并行注水**：不同块可以"同时"注水（实际是在并发调度下交替进行，不阻塞主线程）。
3. **交互优先**：当用户对某个尚未注水的块发起交互（点击、输入等）时，React 会**优先**把该块的注水任务提到最高优先级，立刻注水它，让交互尽快生效。
4. **延后慢块**：数据还没回来的块（仍在 Suspense 挂起）根本不会进入注水队列，等数据回来再注水，期间不阻塞其他块。

### 2.1 与流式 SSR 的配合

流式 SSR 让浏览器尽早收到 shell HTML，选择性注水让浏览器尽早可交互。两者结合：用户看到内容的速度↑，能操作的速度↑，慢组件拖累整体的代价↓。

### 2.2 注水错误恢复

React 18 之前，hydration mismatch（服务端 HTML 与客户端 vdom 不一致）会触发整棵子树重新客户端渲染，开销大。React 18 改为：尽可能只对**不匹配的那一小块**重新渲染，其余部分继续复用，并通过 \`onRecoverableError\` 把这些"可恢复错误"汇报出去，便于监控。

## 底层原理

1. **分块调度**：\`hydrateRoot\` 把根组件的注水工作拆成多个"块"（通常以 Suspense 边界为界），每块是一个独立的并发任务。
2. **优先级调度**：每个注水任务有基础优先级。用户交互（\`discrete\` 事件如 click）触发时，React 把目标块所在注水任务提升到最高优先级，立即中断当前正在注水的低优先级块，先注水被点击的块。
3. **Suspense 隔离**：仍挂起的 Suspense 块的注水任务根本不入队，等数据 resolve 后才创建。所以一个慢块不会阻塞其他块的注水。
4. **复用 DOM**：注水时 React 尽量复用服务端 HTML 已有的 DOM 节点，只在 mismatch 处局部重建。这是"选择性"的另一层含义——不是重新渲染，而是有选择地复用/重建。
5. **事件委托**：React 17 起事件监听挂在根容器上，所以即便某个块还没注水，发生在它上面的点击也能被根捕获，React 据此知道"用户点了哪块"，从而插队注水。这是交互优先注水能工作的底层前提。

## 常见陷阱

- **以为 hydration 完成才有交互**：选择性注水下，用户点击未注水块也能"唤醒"它，但首次响应会略慢（要等该块注水）。不要在 onMount 里假设已注水。
- **mismatch 频发**：服务端/客户端用了不同时间戳、随机数、\`window\` 检测，会导致大量局部重建，抵消选择性注水收益。尽量保证 SSR/CSR 输出一致。
- **大块不拆 Suspense**：把整页包在一个大 Suspense 里，选择性注水退化为传统注水，失去收益。
- **忽略 onRecoverableError**：可恢复错误默认静默，问题不易被发现。生产环境务必接监控。
- **在 hydration 期间读取布局**：注水前后 DOM 可能局部重建，期间 \`getBoundingClientRect\` 等读取可能拿到不稳定值。

## 性能提示

- **按交互区块拆 Suspense**：把"用户会点的区块"独立成 Suspense 块，交互优先注水才能精准命中。
- **优先注水首屏可见且可交互的块**：通过 \`<Suspense>\` 边界位置控制注水粒度，让关键交互尽快可用。
- **lazy 加载非首屏组件**：配合 \`React.lazy\` + Suspense，把非首屏大组件延后注水，首屏 hydration 更快。
- **监控 hydration mismatch 率**：通过 \`onRecoverableError\` 统计 mismatch 次数，定位并修复根因，避免局部重建开销累积。
- **避免 hydration 期间同步重排**：在 useEffect 里再读取/修改布局，不要在 render 期间触发布局同步计算。`,
    code: `// ============================================================
// 第四章代码演示：用纯 JS 模拟选择性注水（按交互优先级排序）
// ============================================================
// 传统 hydration：按 DOM 顺序串行注水，整个过程阻塞。
// 选择性注水：分块并行注水，用户交互的块优先插队。
// 下面用纯 JS 模拟两种模式的差异。

console.log("===== 1. 传统 hydration：按 DOM 顺序串行注水 =====\\n");

function makeHydrationTask(name, cost) {
  return { name, cost, priority: 0, interactive: false };
}

async function traditionalHydration(tasks) {
  const t0 = Date.now();
  for (const t of tasks) {
    await new Promise((r) => setTimeout(r, t.cost));
    console.log(\`  [\${Date.now() - t0}ms] 注水完成: \${t.name}\`);
  }
}

await traditionalHydration([
  makeHydrationTask("Header", 30),
  makeHydrationTask("Sidebar", 30),
  makeHydrationTask("Comments", 30), // 用户想点这里，但前面堵着
]);
console.log("  问题：用户点 Comments 时，前面 Header/Sidebar 还在注水，点击被延迟\\n");

console.log("===== 2. 选择性注水：用户交互的块优先插队 =====\\n");

// 模拟 React 18：把注水任务排成队列，交互发生时把对应任务优先级提高
async function selectiveHydration(tasks, interactionAt, interactionAtMs) {
  const t0 = Date.now();
  const queue = tasks.map((t) => ({ ...t, done: false }));

  // 模拟"用户交互"事件：到点把某块标记为高优先级
  setTimeout(() => {
    const target = queue.find((t) => t.name === interactionAt);
    if (target) {
      target.priority = 10;
      target.interactive = true;
      console.log(\`  >> 用户点击了 \${target.name}，提升其优先级\\n\`);
    }
  }, interactionAtMs);

  // 调度循环：每次挑优先级最高、且未完成的任务执行
  while (queue.some((t) => !t.done)) {
    // 选优先级最高的未完成任务（同等优先级按原顺序）
    let pick = null;
    for (const t of queue) {
      if (t.done) continue;
      if (!pick || t.priority > pick.priority) pick = t;
    }
    await new Promise((r) => setTimeout(r, pick.cost));
    pick.done = true;
    console.log(\`  [\${Date.now() - t0}ms] 注水完成: \${pick.name}\${pick.interactive ? "（被交互插队）" : ""}\`);
  }
}

// 三个块各 30ms。用户在 20ms 时点了 Comments。
// 第一轮（0-30ms）注水 Header；期间 20ms Comments 被提优先级；
// 第二轮选优先级最高的 Comments（10 > Sidebar 的 0），先注水它。
await selectiveHydration([
  makeHydrationTask("Header", 30),
  makeHydrationTask("Sidebar", 30),
  makeHydrationTask("Comments", 30),
], "Comments", 20);

console.log("\\n===== 3. 与 Suspense 配合：未注水的块可延后 =====");
console.log("  React 18 中，被 Suspense 挂起的块不会阻塞其他块的注水；");
console.log("  数据就绪后才开始注水，期间用户可正常交互已注水的部分。");
console.log("\\n===== 关键观察 =====");
console.log("  * 传统：Comments 必须等 Header+Sidebar 注完（90ms 后才可点）");
console.log("  * 选择性：用户点 Comments 后，Comments 在 60ms 就注完可交互");`,
  },

  // ---------------------------------------------------------
  // 第五章：hydrateRoot API
  // ---------------------------------------------------------
  {
    id: "react18-hydrate-root",
    title: "hydrateRoot API",
    icon: "🌱",
    group: "Suspense 与 SSR",
    content: `## 一、hydrateRoot 替代 ReactDOM.hydrate

React 18 之前，SSR 应用的客户端入口是：

\`\`\`js
import ReactDOM from "react-dom";
ReactDOM.hydrate(<App />, document.getElementById("root"));
\`\`\`

React 18 把这个 API 拆成了两套：

- \`createRoot(container)\`：用于纯客户端渲染（CSR），从空容器开始。
- \`hydrateRoot(container, element)\`：用于 SSR 后的注水，复用服务端已生成的 HTML。

\`hydrateRoot\` 不仅是改名，它开启了 React 18 的并发特性（并发渲染、选择性注水、Suspense 数据获取），是升级到 React 18 的关键一步。

### 1.1 基本用法

\`\`\`js
import { hydrateRoot } from "react-dom/client";
import App from "./App";

const root = hydrateRoot(document.getElementById("root"), <App />);

// 后续更新
root.render(<App />);
\`\`\`

注意点：

- 第二个参数是**初始元素**，第一次调用就要传入，不能像 \`createRoot\` 那样先建 root 再 render。
- 容器里**必须**已有服务端 HTML，否则 React 会报警告并退化为客户端渲染。
- 创建后用 \`root.render()\` 触发后续更新。

### 1.2 与 createRoot 对比

| 维度 | createRoot | hydrateRoot |
|------|-----------|-------------|
| 容器要求 | 空容器（或忽略现有内容） | 必须含服务端 HTML |
| 首次渲染 | 从零创建 DOM | 复用现有 DOM，attach 事件 |
| 适用场景 | CSR、SPA | SSR 后注水 |
| 并发特性 | 支持 | 支持 |
| 额外回调 | 无 | \`onRecoverableError\` |
| 调用方式 | \`createRoot(el).render(<App/>)\` | \`hydrateRoot(el, <App/>)\` |

### 1.3 onRecoverableError 回调

hydration 过程中可能出现"可恢复错误"：服务端 HTML 与客户端 vdom 不一致，React 修复后继续。这些错误默认静默，\`onRecoverableError\` 让你能监听并上报：

\`\`\`js
hydrateRoot(container, <App />, {
  onRecoverableError(err, errorInfo) {
    trackErrorToServer(err, errorInfo);
  }
});
\`\`\`

### 1.4 注意事项

- 第二个参数（初始元素）只在第一次调用生效，后续 \`root.render()\` 不再传容器。
- 严格模式（\`<React.StrictMode>\`）在 hydration 下会双调用某些方法，注意副作用幂等。
- 不要在 hydration 完成前手动修改容器 DOM，否则触发 mismatch。
- 升级时把所有 \`ReactDOM.hydrate\` 替换为 \`hydrateRoot\`，否则拿不到并发特性。

## 底层原理

1. **比对阶段**：\`hydrateRoot\` 内部启动一次特殊渲染——"hydration 模式"。React 遍历客户端 vdom，对每个节点查找容器中对应的 DOM 节点。
2. **复用 vs 重建**：标签、key、props 基本一致 → 复用 DOM，仅 attach 事件、设置内部状态；严重不一致（标签不同、key 错位）→ 抛弃服务端 DOM，客户端重新创建该子树。
3. **文本/属性 mismatch**：React 18 默认用客户端值覆盖服务端值，并触发 \`onRecoverableError\`（开发模式额外警告），不重建节点。
4. **事件挂载**：React 17 起事件委托到根容器，hydration 时只需在根上挂一次监听器，子节点注水时无需逐个 addEventListener。
5. **并发调度**：hydration 工作被拆成块，按优先级调度（见上一章选择性注水），可被用户交互打断。
6. **完成标志**：所有块注水完毕后，root 进入正常更新模式，后续 \`root.render()\` 走标准并发渲染路径。

## 常见陷阱

- **容器为空还用 hydrateRoot**：会丢失 SSR 收益，React 会警告并退化。CSR 场景应改用 \`createRoot\`。
- **第一次调用不传元素**：\`hydrateRoot(el)\` 不传第二参，需再调 \`root.render()\`，但这样会强制客户端渲染，浪费 SSR HTML。
- **服务端/客户端输出不一致**：日期、随机数、UA 检测、\`typeof window\` 判断都会导致 mismatch，触发局部重建和 \`onRecoverableError\`。
- **滥用 \`useId\` 之外的 id 生成**：服务端和客户端各生成一次会不一致，跨端共享 id 必须用 \`useId\`。
- **第三方脚本改 DOM**：广告、A/B 测试脚本在 hydration 前改容器 DOM，引发 mismatch。延迟到 hydration 后再注入。

## 性能提示

- **保证 SSR/CSR 一致**：减少 mismatch 是 hydration 性能的根本，每个 mismatch 都意味着一次局部重建。
- **用 \`useId\` 生成稳定 id**：跨端一致，避免 id mismatch。
- **Suspense 拆块**：让 hydration 分块进行，配合选择性注水，关键交互尽快可用。
- **接 \`onRecoverableError\` 监控**：量化 mismatch 率，定位热点。
- **延迟非首屏 hydration**：用 \`React.lazy\` 把非首屏组件延后注水，缩小首屏 hydration 工作量。
- **避免 hydration 期同步布局读取**：在 \`useEffect\` / \`useLayoutEffect\` 中再读取布局，减少强制同步重排。`,
    code: `// ============================================================
// 第五章代码演示：用纯 JS 模拟 hydration 过程与差异点检测
// ============================================================
// hydrateRoot 的核心：把"服务端生成的 HTML"与"客户端组件树"对齐，
// 复用 DOM 节点而非重新创建，并附加事件。下面模拟这个过程：
// 1) 服务端 HTML 树；2) 客户端 vdom 树；3) 逐节点比对，找出差异点。

console.log("===== 1. 服务端 HTML 与客户端 vdom 的结构 =====\\n");

// 服务端 HTML（已序列化为简单对象树）
const serverHTML = {
  tag: "div",
  props: { id: "app" },
  children: [
    { tag: "h1", props: {}, children: ["标题"] },
    { tag: "p", props: { class: "desc" }, children: ["描述文本"] },
    { tag: "button", props: { class: "btn" }, children: ["点击"] },
  ],
};

// 客户端 vdom（hydration 时构造）
const clientVDOM = {
  tag: "div",
  props: { id: "app" },
  children: [
    { tag: "h1", props: {}, children: ["标题"] },
    { tag: "p", props: { class: "desc" }, children: ["描述文本（客户端更新过）"] }, // 文本不同
    { tag: "button", props: { class: "btn", onclick: "handleClick" }, children: ["点击"] }, // 多了 onclick
  ],
};

console.log("服务端 HTML 树：");
console.log(JSON.stringify(serverHTML));
console.log("客户端 vdom 树：（p 的文本不同，button 多了 onclick）");

console.log("\\n===== 2. hydration 比对：找出差异点 =====\\n");

const diffs = [];

function hydrate(serverNode, clientNode, path) {
  // 标签必须一致，否则严重不匹配
  if (serverNode.tag !== clientNode.tag) {
    diffs.push({ path, type: "tag-mismatch", server: serverNode.tag, client: clientNode.tag });
    return;
  }

  // 比对 props（客户端可能多出事件处理等）
  const sProps = serverNode.props || {};
  const cProps = clientNode.props || {};
  for (const key of Object.keys(cProps)) {
    if (!(key in sProps)) {
      diffs.push({ path: path + "." + key, type: "prop-added", key });
    }
  }

  // 比对子节点
  const sChildren = serverNode.children || [];
  const cChildren = clientNode.children || [];
  const len = Math.max(sChildren.length, cChildren.length);
  for (let i = 0; i < len; i++) {
    const s = sChildren[i];
    const c = cChildren[i];
    if (typeof s === "string" && typeof c === "string") {
      if (s !== c) {
        diffs.push({ path: \`\${path}.children[\${i}]\`, type: "text-mismatch", server: s, client: c });
      }
    } else if (s && c) {
      hydrate(s, c, \`\${path}.children[\${i}]\`);
    }
  }
}

hydrate(serverHTML, clientVDOM, "root");
console.log("hydration 比对结果，发现差异点：");
diffs.forEach((d) => console.log("  -", JSON.stringify(d)));

console.log("\\n===== 3. hydrateRoot 对差异的处理策略 =====");
console.log("  * 文本不一致：React 18 用客户端版本覆盖（开发模式警告），不重建节点");
console.log("  * 事件属性：hydration 时 attach，不重新创建 DOM");
console.log("  * 严重不匹配（如标签不同）：抛弃该子树服务端 HTML，重新客户端渲染");
console.log("  * onRecoverableError：把可恢复的 hydration 错误回调出去，便于监控");

console.log("\\n===== 4. hydrateRoot vs createRoot 对比 =====");
console.log("  createRoot(container): 空容器，从零客户端渲染");
console.log("  hydrateRoot(container, element): 复用已有服务端 HTML，attach 事件");
console.log("  hydrateRoot 额外支持 onRecoverableError 回调，监听 hydration 中的可恢复错误");

console.log("\\n===== 5. onRecoverableError 模拟 =====\\n");

const errors = [];
function trackHydrationError(err) { errors.push(err); }

// 模拟 React 检测到 text-mismatch 后的处理
diffs.filter((d) => d.type === "text-mismatch").forEach((d) => {
  trackHydrationError({
    type: "text-mismatch",
    path: d.path,
    message: \`服务端="\${d.server}"，客户端="\${d.client}"\`,
    action: "用客户端值覆盖",
  });
});

console.log("上报的可恢复错误：");
errors.forEach((e) => console.log("  -", JSON.stringify(e)));
console.log("\\n  生产环境应把这些错误上报到监控系统，量化 mismatch 率。");`,
  },

  // ---------------------------------------------------------
  // 第六章：renderToPipeableStream
  // ---------------------------------------------------------
  {
    id: "react18-render-to-pipeable-stream",
    title: "renderToPipeableStream",
    icon: "📜",
    group: "Suspense 与 SSR",
    content: `## 一、renderToPipeableStream 是什么

\`renderToPipeableStream\` 是 React 18 替代 \`renderToNodeStream\` / \`renderToString\` 的服务端渲染入口，专门为流式 SSR 设计。它返回一个带 \`pipe\` / \`abort\` 方法的对象，并通过一组回调通知渲染生命周期的关键时刻。

\`\`\`js
import { renderToPipeableStream } from "react-dom/server";

const { pipe, abort } = renderToPipeableStream(<App />, {
  onShellReady() { /* 外壳就绪，开始 pipe 到响应 */ },
  onAllReady()   { /* 全部就绪，适合静态/爬虫场景 */ },
  onShellError(err) { /* 外壳渲染失败 */ },
  onError(err)   { /* 渲染中任意错误 */ },
});

pipe(res); // 把渲染流接到 HTTP 响应
\`\`\`

## 二、API 详解

### 2.1 返回对象

- **\`pipe(destination)\`**：把渲染流接到一个 Node Writable（通常是 \`res\`）。调用后渲染出的 HTML 片段会持续写入 destination。
- **\`abort()\`**：中止渲染。用于超时或客户端断开后及时释放服务端资源。可传 \`reason\`。

### 2.2 关键回调

| 回调 | 触发时机 | 典型用途 |
|------|---------|---------|
| \`onShellReady\` | 外壳（不含挂起 Suspense）渲染完成 | 流式 SSR 主战场：此时调用 \`pipe(res)\` 开始发送 |
| \`onAllReady\` | 所有 Suspense 完成，流结束 | 静态预渲染、爬虫场景：等完整 HTML |
| \`onShellError\` | 外壳渲染就抛错 | 回退到客户端渲染或返回错误页 |
| \`onError\` | 渲染过程中任意错误（含可恢复的 Suspense 错误） | 日志、监控 |

### 2.3 流式渲染时序

1. 调用 \`renderToPipeableStream\`，React 开始渲染。
2. shell 渲染完成 → \`onShellReady\` → 你在这里 \`pipe(res)\`，shell HTML 开始流向浏览器。
3. 各 \`<Suspense>\` 的数据陆续 resolve，React 把真实内容 + 替换脚本追加到流里。
4. 所有内容就绪 → \`onAllReady\`，流结束。

### 2.4 错误处理

- **外壳错误**（\`onShellError\`）：连外壳都没渲染出来，无法流式，应回退到客户端渲染或返回 5xx。
- **流中错误**（\`onError\`）：部分内容已发送，无法改 status code，只能通过脚本注入错误 UI 或让客户端 hydration 时处理。React 会尽量把错误限制在出错的 Suspense 块内。

### 2.5 与 renderToString 对比

| 维度 | renderToString | renderToPipeableStream |
|------|---------------|----------------------|
| 同步/异步 | 同步，一次性 | 异步，流式 |
| Suspense 支持 | 不支持（fallback 不流式） | 原生支持 |
| 选择性注水 | 不支持 | 支持 |
| TTFB | 等于完整渲染时间 | 等于 shell 渲染时间 |
| 现状 | 已不推荐用于 SSR | React 18 SSR 首选 |

## 底层原理

1. **可暂停的渲染器**：\`renderToPipeableStream\` 内部是一个可暂停的渲染循环。遇到 \`<Suspense>\` 且子树挂起时，暂停该子树，输出 fallback，继续渲染兄弟节点。
2. **shell 与 content 分离**：shell 指所有"非挂起"部分，渲染完即可 flush。content 是各 Suspense 子树的真实内容，按各自数据就绪时序 flush。
3. **chunked 输出**：底层是一个 Node \`Readable\` 流，\`pipe(res)\` 后每个 flush 的片段作为一个 HTTP chunk 发出，浏览器边收边解析。
4. **替换机制**：流中追加的 content 包裹在 \`<div hidden id="S:1">\` 中，配套一段 \`$RC("S:1","B:1")\` 脚本，把对应 fallback（id \`B:1\`）替换为真实内容。
5. **回调时序保证**：\`onShellReady\` 一定先于任何 content flush 触发；\`onAllReady\` 一定在流 \`end\` 之前触发；\`onShellError\` 与 \`onShellReady\` 互斥（外壳要么成功要么失败）。
6. **abort 行为**：\`abort()\` 触发后，未完成的 Suspense 块被强制以"客户端渲染"标记结束，浏览器会在 hydration 时补渲染这些块。

## 常见陷阱

- **在 onShellReady 里没 pipe**：忘了 \`pipe(res)\`，浏览器永远收不到内容。这是最常见的"流式 SSR 没输出"原因。
- **status code 时机**：\`onShellReady\` 前可设置 status/header，之后已开始发送 body，不能再改。需要根据数据决定状态码的逻辑要提前到 shell 前。
- **把 onAllReady 当主路径**：\`onAllReady\` 等所有 Suspense 完成，丢失流式收益，仅适合爬虫/静态生成。
- **未处理 onShellError**：外壳失败时不返回错误页，浏览器收到空响应。
- **abort 后继续 pipe**：abort 后流已结束，再 pipe 无效，要确保 abort 与 pipe 互斥。
- **代理缓冲**：反向代理缓冲整个响应会破坏流式，需配置 \`X-Accel-Buffering: no\`。

## 性能提示

- **onShellReady 立即 pipe**：这是流式 SSR 收益的关键，shell 一好就发，TTFB 最小。
- **爬虫走 onAllReady**：对爬虫请求等完整 HTML，SEO 友好；对真实用户走流式。
- **超时 abort**：设置总超时（如 2s），超时 \`abort()\` 让未完成块走客户端渲染，避免慢请求拖垮服务端。
- **shell 尽量轻**：shell 越简单，\`onShellReady\` 越早，TTFB 越低。
- **慢组件包 Suspense**：让慢组件不阻塞 shell，是流式 SSR 提速的核心手段。
- **监控 onError 频率**：高频 \`onError\` 往往意味着数据层不稳或 Suspense 边界设计有问题。
- **复用 HTTP keep-alive**：流式响应下连接复用收益更大，确保服务端开启 keep-alive。`,
    code: `// ============================================================
// 第六章代码演示：用纯 JS + stream 模拟 renderToPipeableStream 的回调时序
// ============================================================
// renderToPipeableStream 返回一个带 pipe/abort 的对象，
// 并通过 onShellReady / onAllReady / onError / onShellError 回调通知时序。
// 下面用 Node stream 模拟整个生命周期。

const { Readable, Writable } = require("stream");

// 模拟 renderToPipeableStream
function fakeRenderToPipeableStream(opts) {
  const {
    onShellReady,
    onAllReady,
    onShellError,
    onError,
  } = opts || {};

  const stream = new Readable({ read() {} });
  let shellReady = false;
  let allReady = false;
  let errored = false;

  const log = (msg) => console.log("  [stream] " + msg);

  // 1) shell 生成（同步模拟，实际是 React 把外壳渲染完）
  setTimeout(() => {
    if (errored) return;
    shellReady = true;
    stream.push(Buffer.from("<html><body><div id='root'><div class='shell'>"));
    log("shell 片段已写入");
    if (onShellReady) onShellReady();
  }, 10);

  // 2) 边渲染边推送内容块（模拟 Suspense 内容陆续就绪）
  setTimeout(() => {
    if (errored) return;
    stream.push(Buffer.from("<h1>标题</h1>"));
    log("内容块 1（标题）写入");
  }, 30);

  setTimeout(() => {
    if (errored) return;
    stream.push(Buffer.from("<p>正文...</p>"));
    log("内容块 2（正文）写入");
  }, 50);

  // 3) 全部就绪，结束流
  setTimeout(() => {
    if (errored) return;
    allReady = true;
    stream.push(Buffer.from("</div></div></body></html>"));
    stream.push(null);
    log("尾部片段写入，流结束");
    if (onAllReady) onAllReady();
  }, 70);

  return {
    pipe(destination) { stream.pipe(destination); },
    abort() {
      errored = true;
      stream.push(null);
      log("abort() 被调用，流提前结束");
    },
  };
}

console.log("===== renderToPipeableStream 回调时序演示 =====\\n");

const received = [];
const sink = new Writable({
  write(chunk, enc, cb) {
    received.push(chunk.toString());
    cb();
  },
});

const t0 = Date.now();
const stamp = () => \`\${Date.now() - t0}ms\`;

const result = fakeRenderToPipeableStream({
  onShellReady: () => console.log(\`[\${stamp()}] onShellReady -> 可以开始 pipe 到响应\`),
  onAllReady: () => {
    console.log(\`[\${stamp()}] onAllReady -> 所有内容就绪（静态预渲染/爬虫场景）\`);
    console.log("\\n  最终拼接的 HTML：");
    console.log("  " + received.join(""));
  },
  onError: (err) => console.log(\`[\${stamp()}] onError:\`, err && err.message),
  onShellError: (err) => console.log(\`[\${stamp()}] onShellError:\`, err && err.message),
});

// shell 就绪后开始 pipe（模拟把流接到 res）
result.pipe(sink);

// 等待全部完成
await new Promise((r) => setTimeout(r, 100));

console.log("\\n===== 关键回调含义 =====");
console.log("  onShellReady: 外壳就绪，立即 pipe 给浏览器（流式 SSR 主用此回调）");
console.log("  onAllReady:   全部完成，适合纯静态生成或 crawler 场景");
console.log("  onShellError: 外壳渲染就失败，需回退到客户端渲染或错误页");
console.log("  onError:      渲染中任意错误（含可恢复的 Suspense 错误）");

console.log("\\n===== 与 renderToString 对比 =====");
console.log("  renderToString: 同步、一次性、不支持流式/Suspense，已不推荐用于 SSR");
console.log("  renderToPipeableStream: 流式、支持 Suspense、选择性注水，React 18 SSR 首选");

console.log("\\n===== abort 超时演示（模拟 25ms 超时中止）=====\\n");

const received2 = [];
const sink2 = new Writable({
  write(chunk, enc, cb) { received2.push(chunk.toString()); cb(); },
});

const t1 = Date.now();
const stamp2 = () => \`\${Date.now() - t1}ms\`;
let aborted2 = false;

const result2 = fakeRenderToPipeableStream({
  onShellReady: () => {
    console.log(\`[\${stamp2()}] onShellReady -> pipe 开始\`);
    result2.pipe(sink2);
  },
  onAllReady: () => console.log(\`[\${stamp2()}] onAllReady\`),
  onError: (err) => console.log(\`[\${stamp2()}] onError:\`, err && err.message),
});

// 25ms 后 abort（此时 shell 已发，但内容块还没发完）
setTimeout(() => {
  console.log(\`[\${stamp2()}] 触发 abort()（模拟超时）\`);
  aborted2 = true;
  result2.abort();
}, 25);

await new Promise((r) => setTimeout(r, 100));

console.log(\`\\n  abort 前已收到的内容：\${received2.join("") || "(空)"}\`);
console.log("  abort 后未完成的块会在客户端 hydration 时补渲染");`,
  },
];
