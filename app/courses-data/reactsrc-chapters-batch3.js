// =============================================================
// React 源码构建教程 —— 第三批章节（Fiber 架构与组件系统，共 5 章）
// -------------------------------------------------------------
// 覆盖 React Fiber 架构核心：Fiber 是什么、Fiber 树结构（链表）、
// 工作循环（performUnitOfWork）、双缓冲机制（current/workInProgress）、
// 函数组件的支持。是深入理解 React 内部运行机制的进阶篇章。
// =============================================================

export const chapters = [
  // =========================================================
  // 第 11 章：Fiber 是什么
  // =========================================================
  {
    id: "rs-what-is-fiber",
    group: "第三部分 Fiber 架构",
    icon: "🧵",
    title: "Fiber 是什么：可中断的渲染单元",
    content: `
# Fiber 是什么：可中断的渲染单元

## 一、为什么需要 Fiber

### 1.1 旧架构的"递归之痛"

在 React 15 及之前，渲染使用的是 **Stack Reconciler**（栈调和器）。它的核心是一棵**递归调用**的虚拟 DOM 树，一旦开始渲染就要一口气走完：

\`\`\`js
// React 15 的递归渲染（伪代码）
function render(element) {
  // 递归处理子节点：每深入一层，调用栈就多一帧
  element.children.forEach(child => {
    render(child);  // 递归调用，压入调用栈
  });
  // 处理当前节点（diff、更新 DOM）
  doWork(element);
}
\`\`\`

这个过程是**同步且不可中断**的。如果组件树很深（比如一千个节点），调用栈就会一直堆叠，直到所有节点处理完才会释放。

### 1.2 递归不可中断的本质原因

为什么递归不能中断？因为 JavaScript 是**单线程**的，递归调用栈一旦开始，就只能顺着栈顶往下走，没法在中间"暂停一下，去做点别的"。

想象你在堆叠一千块积木：

- 堆到第 500 块时，用户点击了一个按钮
- 你没法停下来响应点击，必须把剩下的 500 块堆完
- 用户点击的响应被延迟，体验卡顿

这就是 React 15 处理大型应用时面临的根本问题。动画掉帧、输入延迟，根源都在这里。

### 1.3 旧架构的三大问题

| 问题 | 描述 | 后果 |
| --- | --- | --- |
| 不可中断 | 一旦开始渲染必须走完 | 长任务阻塞主线程 |
| 不可分片 | 整棵树一次处理 | 无法按优先级调度 |
| 用户感知差 | 高优先级任务被低优先级拖累 | 输入延迟、动画卡顿 |

---

## 二、Fiber 的核心思想：把渲染拆成小任务

### 2.1 从"一口气做完"到"分批完成"

Fiber 的核心思想非常朴素：**把一个大的渲染任务，拆成很多个小的工作单元**。

生活类比 —— **工厂流水线**：

- 旧架构像一个人独自组装一台汽车，必须从头到尾做完才能休息
- Fiber 架构像一条流水线，把组装拆成"装发动机→装车轮→装座椅"等小步骤
- 每完成一个步骤，可以**看一眼时钟**，如果时间到了就先休息，下次接着做

\`\`\`
旧架构：  [============== 一口气渲染完 ==============]
                    ↑ 中间无法暂停

Fiber：   [==单元1==][==单元2==] [==单元3==][==单元4==]
                       ↑              ↑
                    检查时间        检查时间
                    （可让出）      （可让出）
\`\`\`

### 2.2 工作单元的概念

Fiber 把渲染过程拆成的每一个小任务，叫做一个**工作单元（Unit of Work）**。

- 一个工作单元 = 处理一个 Fiber 节点
- 处理完一个节点，就检查时间
- 时间不够就让出主线程，等下次空闲再继续

\`\`\`js
// Fiber 的核心循环（伪代码）
function workLoop() {
  while (nextUnitOfWork && !shouldYield()) {
    // 还有下一个工作单元，并且时间没到 → 继续处理
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
  // 时间到了或任务做完了，让出主线程
  if (nextUnitOfWork) {
    // 还有任务没做完 → 安排下一帧继续
    requestIdleCallback(workLoop);
  }
}
\`\`\`

### 2.3 Fiber 这个名字的含义

"Fiber" 本意是"纤维、丝线"。React 团队用这个词，是想表达：

- 一根丝线很细，但可以**编织**成布
- 一个 Fiber 节点很小，但可以**组合**成完整的 UI
- 像纤维一样**可拆分、可编织**，是 Fiber 架构的本质

---

## 三、Fiber 节点 = 一个工作单元

### 3.1 Fiber 节点是什么

每一个 React 元素（组件、DOM 节点）在 Fiber 架构里，都对应一个 **Fiber 节点**。这个节点不仅描述了"它是什么"，还描述了"它的父子兄弟关系"。

\`\`\`js
// 一个简化版的 Fiber 节点结构
{
  type: 'div',           // 节点类型：字符串（DOM）、函数、类
  key: null,             // key 属性
  props: { children: [] }, // 属性和子节点
  stateNode: document.createElement('div'), // 真实 DOM 引用

  // 链表关系（下一章详解）
  child: null,           // 第一个子节点
  sibling: null,         // 下一个兄弟节点
  return: null,          // 父节点（return 是关键字所以用 return）

  // 双缓冲（第 14 章详解）
  alternate: null,       // 指向另一棵树中对应的 Fiber 节点

  // 副作用
  effectTag: 'PLACEMENT', // 标记：新增/更新/删除
  effects: [],            // 副作用列表
}
\`\`\`

### 3.2 为什么 Fiber 节点要存这些字段

旧架构用递归调用栈来维护"处理到哪了"，但调用栈没法暂停。Fiber 的做法是：**把调用栈的信息存在节点里**，这样就可以随时暂停、随时恢复。

| 字段 | 作用 | 类比 |
| --- | --- | --- |
| child | 第一个子节点 | "我的大儿子是谁" |
| sibling | 下一个兄弟 | "我的二弟是谁" |
| return | 父节点 | "我爹是谁" |
| alternate | 双缓冲对应节点 | "我的镜像分身" |

有了这些字段，**不需要调用栈**也能遍历整棵树 —— 这就是 Fiber 可中断的关键。

---

## 四、时间分片：requestIdleCallback

### 4.1 浏览器一帧在做什么

浏览器渲染是按**帧**来的，理想情况下一秒 60 帧（每帧约 16.6ms）。每一帧里：

\`\`\`
一帧（16.6ms）
├── 处理用户输入事件
├── 执行 JavaScript（定时器、回调等）
├── style 计算
├── layout 布局
├── paint 绘制
└── composite 合成
        ↓
剩余的空闲时间 ← React 就想用这段时间
\`\`\`

如果一帧里 JavaScript 跑太久，绘制就来不及，就掉帧了。

### 4.2 requestIdleCallback 的设想

浏览器提供了 \`requestIdleCallback\` API，它会在浏览器空闲时调用回调，并告诉你"还剩多少时间"：

\`\`\`js
// deadline.timeRemaining() 返回当前帧剩余的空闲时间
requestIdleCallback(deadline => {
  // 还剩多少毫秒空闲
  while (deadline.timeRemaining() > 0 && tasks.length) {
    doTask(tasks.shift());
  }
  // 没做完？下一帧空闲时继续
  if (tasks.length) {
    requestIdleCallback(handler);
  }
});
\`\`\`

### 4.3 为什么 React 不直接用 requestIdleCallback

React 团队发现 \`requestIdleCallback\` 有几个问题：

1. **浏览器支持不一致**：特别是 Safari 长期不支持
2. **触发频率不稳定**：浏览器可能很久才回调一次
3. **精度不够**：对于 60fps 动画场景，触发太晚

所以 React 自己实现了一套，基于 **MessageChannel**：

\`\`\`js
// React 的时间分片简化实现
const channel = new MessageChannel();
const port = channel.port2;

// 收到消息时执行任务
channel.port1.onmessage = performWorkUntilDeadline;

function scheduleWork() {
  // 通过 postMessage 把任务推到下一个事件循环
  port.postMessage(null);
}

function performWorkUntilDeadline() {
  // 记录这一帧的截止时间（5ms 时间片）
  deadline = currentTime + 5;
  // 执行工作循环
  workLoop();
  // 如果没做完，再安排下一片
  if (nextUnitOfWork) {
    scheduleWork();
  }
}
\`\`\`

### 4.4 MessageChannel 的优势

| 特性 | requestIdleCallback | MessageChannel |
| --- | --- | --- |
| 兼容性 | Safari 等不支持 | 全平台支持 |
| 触发时机 | 浏览器决定（可能很晚） | 下一个事件循环（可控） |
| 时间片长度 | 浏览器决定（可能很长） | React 自己定（5ms） |
| 优先级 | 只有 idle | 可配合 Scheduler 分级 |

---

## 五、时间分片的生活类比

### 5.1 流水线工人的故事

把浏览器主线程想象成一个**流水线工人**：

- 他每小时要做的事：组装零件（JS）、刷漆（paint）、打包（composite）
- 如果组装一个超大零件要 50 分钟，那刷漆和打包就被推迟，整条流水线卡住
- Fiber 的做法：把超大零件拆成 5 分钟一个的小零件，每做完一个就**看一眼表**，留出时间刷漆打包

### 5.2 时间片就像番茄钟

- 一个时间片（5ms）= 一个番茄（25 分钟）
- 番茄响铃后必须休息一下，处理别的紧急事
- React 的 \`shouldYield()\` 就是"番茄响铃了吗"

\`\`\`js
// shouldYield 的简化逻辑
function shouldYield() {
  // 当前时间是否已经超过了这一帧的截止时间
  return performance.now() >= deadline;
}
\`\`\`

---

## 六、Fiber 带来的能力

有了 Fiber + 时间分片，React 获得了三种关键能力：

### 6.1 可中断与恢复

渲染到一半可以暂停，让出主线程响应用户输入，然后再接着渲染。

### 6.2 优先级调度

高优先级任务（用户输入）可以**插队**，打断低优先级任务（数据渲染）：

\`\`\`
正常：  [===低优先级渲染===] [===高优先级输入===]
              用户输入被延迟 ❌

Fiber：  [==低==] [中断] [==高优先级输入==] [==继续低==]
                  ↑ 立即响应 ✓
\`\`\`

### 6.3 并发模式（Concurrent）

React 18 的并发特性（useTransition、useDeferredValue、Suspense）都建立在 Fiber 之上。没有 Fiber，就没有并发 React。

---

## 七、本章小结

| 概念 | 一句话总结 |
| --- | --- |
| 旧架构问题 | 递归调用栈不可中断，长任务阻塞主线程 |
| Fiber 核心思想 | 把渲染拆成小工作单元，可中断可恢复 |
| Fiber 节点 | 一个工作单元，存了链表关系和副作用 |
| 时间分片 | 用 MessageChannel 实现，每片约 5ms |
| shouldYield | 判断当前时间片是否用完 |

下一章我们会深入 Fiber 节点的**链表结构**，看看它如何用 child/sibling/return 三根指针替代递归调用栈。

下面这段代码用 setTimeout 模拟时间分片，演示如何把一个大任务拆成小工作单元，让出主线程。`,
    code: `// ============================================================
// 第 11 章代码演示：用 setTimeout 模拟时间分片
// ------------------------------------------------------------
// 演示 Fiber 的核心思想：把大任务拆成小工作单元，
// 每处理完一个单元就检查时间，时间到了就让出主线程。
// 这里用 setTimeout 模拟时间分片（真实 React 用 MessageChannel）。
// ============================================================

// ---- 1. 不可中断的大任务（旧架构的痛点） ----
console.log("===== 1. 不可中断的大任务（模拟旧架构）=====");

// 模拟一个"一口气做完"的大任务：处理 1000 个节点
function renderAllAtOnce(count) {
  // 记录开始时间
  var start = Date.now();
  var i = 0;
  // 用 while 循环模拟递归调用栈（一次性走完）
  while (i < count) {
    // 模拟每个节点做一点工作（diff、更新等）
    // 这里用空循环占位，真实场景是复杂的 DOM 操作
    if (i % 100 === 0) {
      // 每 100 个打印一次，看进度（但用户看不到，因为主线程被占着）
      console.log("  旧架构处理到第", i, "个（主线程被占，无法响应输入）");
    }
    i++;
  }
  console.log("  旧架构耗时:", Date.now() - start, "ms（一口气做完）");
}

// 注意：真实场景下这个循环可能要 50ms+，期间用户输入完全无响应
// 这里为了演示快，只跑 500 次
renderAllAtOnce(500);

// ---- 2. 可中断的小任务（Fiber 的思想） ----
console.log("\\n===== 2. 可中断的小任务（模拟 Fiber）=====");

// 模拟待处理的工作单元队列
var workQueue = [];
// 往队列里塞 20 个工作单元
for (var k = 0; k < 20; k++) {
  workQueue.push({ id: k, name: "Fiber节点-" + k });
}

// 当前帧的截止时间（模拟 5ms 时间片）
var TIME_SLICE = 5; // 5ms 一个时间片
var frameDeadline = 0;

// shouldYield：判断是否需要让出主线程
function shouldYield() {
  // 当前时间是否已经超过截止时间
  return Date.now() >= frameDeadline;
}

// performUnitOfWork：处理一个工作单元
function performUnitOfWork(unit) {
  // 模拟处理一个 Fiber 节点的工作（diff、创建 DOM 等）
  // 这里用一个简单的空循环模拟 CPU 工作
  var busy = 0;
  for (var j = 0; j < 500000; j++) {
    busy++;
  }
  console.log("    处理", unit.name, "（busy:", busy, "）");
}

// workLoop：Fiber 的核心工作循环
function workLoop() {
  // 只要队列还有任务，并且时间没到，就一直处理
  while (workQueue.length > 0 && !shouldYield()) {
    // 取出下一个工作单元
    var unit = workQueue.shift();
    // 处理它
    performUnitOfWork(unit);
  }

  // 循环退出后有两种情况
  if (workQueue.length > 0) {
    // 情况一：时间到了，但任务没做完 → 让出主线程，下一帧继续
    console.log("  >> 时间片用完，让出主线程！剩余", workQueue.length, "个任务\\n");
    // 用 setTimeout 模拟"下一个事件循环"（真实 React 用 MessageChannel）
    setTimeout(scheduleNextFrame, 0);
  } else {
    // 情况二：所有任务做完了
    console.log("  >> 全部任务处理完成！");
  }
}

// scheduleNextFrame：安排下一个时间片
function scheduleNextFrame() {
  // 设置这一帧的截止时间 = 当前时间 + 时间片长度
  frameDeadline = Date.now() + TIME_SLICE;
  console.log("  【新时间片开始】截止时间:", frameDeadline);
  // 开始工作循环
  workLoop();
}

// 启动第一帧
console.log("  启动 Fiber 工作循环（每 5ms 让出一次主线程）...\\n");
scheduleNextFrame();

// ---- 3. 演示时间分片期间可以响应"用户输入" ----
console.log("===== 3. 时间分片期间响应输入（演示）=====");

// 模拟用户在渲染过程中点击按钮
setTimeout(function () {
  console.log("  [用户输入] 点击了按钮！立即响应（没有被渲染阻塞）");
}, 10);

// ---- 4. requestIdleCallback 的简化版（概念演示） ----
console.log("\\n===== 4. requestIdleCallback 简化版（概念）=====");

// 模拟 requestIdleCallback 的接口
function fakeRequestIdleCallback(callback) {
  // 用 setTimeout 模拟"浏览器空闲时调用"
  setTimeout(function () {
    // 构造一个 deadline 对象，模拟 timeRemaining
    var deadline = {
      // 假设还剩 5ms 空闲时间
      timeRemaining: function () {
        return Math.max(0, 5 - (Date.now() - deadline._startedAt));
      },
      _startedAt: Date.now()
    };
    callback(deadline);
  }, 0);
}

// 用法演示：在"空闲时间"里做任务
var pendingTasks = ["任务A", "任务B", "任务C", "任务D"];
function runIdleTasks(deadline) {
  // 只要还有空闲时间，就处理任务
  while (deadline.timeRemaining() > 0 && pendingTasks.length > 0) {
    var task = pendingTasks.shift();
    console.log("  空闲时间处理:", task, "（剩余时间:", deadline.timeRemaining().toFixed(2), "ms）");
  }
  // 没做完？继续等下一次空闲
  if (pendingTasks.length > 0) {
    console.log("  空闲时间用完，等待下一次空闲...");
    fakeRequestIdleCallback(runIdleTasks);
  } else {
    console.log("  所有任务在空闲时间处理完毕！");
  }
}

fakeRequestIdleCallback(runIdleTasks);

// ---- 5. 时间分片核心思想总结 ----
console.log("\\n===== 5. 时间分片核心思想 =====");
console.log("  1. 旧架构：递归调用栈不可中断 → 长任务阻塞主线程");
console.log("  2. Fiber：把渲染拆成小工作单元 → 可中断可恢复");
console.log("  3. 时间片：每片约 5ms，用完就让出主线程");
console.log("  4. shouldYield：判断当前时间片是否用完");
console.log("  5. 真实 React 用 MessageChannel 实现时间分片（兼容性更好）");

console.log("\\n===== Fiber 是什么演示结束 =====");`,
  },

  // =========================================================
  // 第 12 章：Fiber 树结构
  // =========================================================
  {
    id: "rs-fiber-tree",
    group: "第三部分 Fiber 架构",
    icon: "🌳",
    title: "Fiber 树结构：链表代替树",
    content: `
# Fiber 树结构：链表代替树

## 一、为什么用链表而不是树

### 1.1 树结构的天然问题

普通的树用 \`children\` 数组存子节点，遍历必须用**递归**：

\`\`\`js
// 普通树节点
{
  type: 'div',
  children: [child1, child2, child3]  // 子节点数组
}

// 遍历树只能递归
function traverse(node) {
  doWork(node);
  node.children.forEach(child => {
    traverse(child);  // 递归压栈
  });
}
\`\`\`

问题在于：递归是**调用栈驱动**的。一旦开始，调用栈就不断堆叠，**无法在中间暂停**。

### 1.2 链表结构的优势

Fiber 用**链表**代替树：每个节点只存三个指针 —— \`child\`、\`sibling\`、\`return\`。

\`\`\`
         A
         |
         B  →  C  →  D
         |           |
         E           F
\`\`\`

对应的链表结构：

- A.child = B
- B.sibling = C，C.sibling = D
- B.return = A，C.return = A，D.return = A
- D.child = F
- B.child = E

**链表的好处**：遍历可以用循环，**不需要递归**，所以可以随时暂停、随时恢复。

### 1.3 生活类比：家族族谱

把 Fiber 树想象成一个**家族**：

- \`child\`：我的**长子**（第一个孩子）
- \`sibling\`：我的**下一个弟弟/妹妹**
- \`return\`：我的**父亲**（"return"是因为处理完自己要"回到"父亲）

想遍历整个家族？不用递归，顺着这三根指针走就行：

1. 先看 A，A 的长子是 B
2. 处理 B，B 没弟弟？回到 A
3. A 的长子 B 还有弟弟 C，处理 C
4. C 没儿子，回到 A，看 C 的弟弟 D
5. D 有儿子 F，处理 F
6. ...

---

## 二、Fiber 节点的核心字段

### 2.1 完整字段一览

\`\`\`js
// Fiber 节点的核心字段
{
  // === 1. 节点身份 ===
  type: 'div',          // 类型：字符串/函数/类
  key: null,            // key
  elementType: 'div',   // JSX 中的类型

  // === 2. 属性与状态 ===
  props: {},            // 属性（含 children）
  stateNode: null,      // 真实 DOM / 类实例

  // === 3. 链表关系（核心！） ===
  return: null,         // 父 Fiber
  child: null,          // 第一个子 Fiber
  sibling: null,        // 下一个兄弟 Fiber
  index: 0,             // 在兄弟中的位置

  // === 4. 双缓冲 ===
  alternate: null,      // 对应另一棵树的 Fiber

  // === 5. 副作用 ===
  effectTag: null,      // 'PLACEMENT' | 'UPDATE' | 'DELETION'
  effects: [],          // 副作用链表
  updateQueue: null,    // 更新队列
}
\`\`\`

### 2.2 三个核心指针详解

#### child：第一个子节点

\`\`\`js
// JSX:
// <div>
//   <h1>标题</h1>    ← 这是 div 的第一个子节点
//   <p>段落</p>
// </div>

// Fiber:
divFiber.child = h1Fiber;  // 只指向第一个子节点！
\`\`\`

**注意**：child 只指向**第一个**子节点，其余子节点通过 sibling 串联。

#### sibling：下一个兄弟

\`\`\`js
h1Fiber.sibling = pFiber;  // h1 的弟弟是 p
pFiber.sibling = null;     // p 没有弟弟了
\`\`\`

#### return：父节点

\`\`\`js
h1Fiber.return = divFiber;  // h1 的父亲是 div
pFiber.return = divFiber;   // p 的父亲也是 div
\`\`\`

为什么叫 \`return\` 而不是 \`parent\`？因为处理完当前节点后，要"返回"到父节点继续处理。这是从**工作流**角度起的名字。

### 2.3 alternate：双缓冲指针

\`alternate\` 指向**另一棵树**中对应的 Fiber 节点。这个字段在第 14 章详细讲，这里先知道有这个字段即可。

\`\`\`js
// current 树的 div
currentDiv.alternate = workInProgressDiv;

// workInProgress 树的 div
workInProgressDiv.alternate = currentDiv;
\`\`\`

---

## 三、链表遍历 vs 树遍历

### 3.1 树的递归遍历

\`\`\`js
// 树遍历：必须递归
function traverseTree(node) {
  doWork(node);
  if (node.children) {
    node.children.forEach(child => {
      traverseTree(child);  // 递归！调用栈堆叠
    });
  }
}
\`\`\`

**缺点**：递归调用栈无法暂停，处理到一半想停下来？没门。

### 3.2 链表的循环遍历

\`\`\`js
// 链表遍历：用循环，可以随时暂停
function traverseFiber(root) {
  let node = root;
  while (node) {
    doWork(node);
    // 优先找长子
    if (node.child) {
      node = node.child;
      continue;
    }
    // 没儿子，找弟弟
    if (node.sibling) {
      node = node.sibling;
      continue;
    }
    // 没弟弟，回到父亲，找父亲的弟弟
    while (node && !node.sibling) {
      node = node.return;  // 一直往上找
    }
    if (node) {
      node = node.sibling;
    }
  }
}
\`\`\`

**优势**：纯循环，**没有递归调用栈**。可以在任何地方 \`return\` 暂停，下次从 \`node\` 接着走。

### 3.3 遍历顺序对比

对于这棵树：

\`\`\`
      A
     /|\\
    B C D
    |   |
    E   F
\`\`\`

**两种遍历的顺序都是**：A → B → E → C → D → F

但树遍历靠**调用栈**回溯，链表遍历靠**指针**回溯。后者可暂停，前者不行。

---

## 四、从 vdom 到 Fiber 的转换

### 4.1 vdom 的形式

React 元素（vdom）是普通的对象：

\`\`\`js
// JSX: <div><h1>Hello</h1><p>World</p></div>
const vdom = {
  type: 'div',
  props: {
    children: [
      { type: 'h1', props: { children: 'Hello' } },
      { type: 'p', props: { children: 'World' } }
    ]
  }
};
\`\`\`

### 4.2 Fiber 的形式

Fiber 把 vdom 的 \`children\` 数组，转换成 \`child\` + \`sibling\` 链表：

\`\`\`js
// 转换后的 Fiber
const divFiber = {
  type: 'div',
  child: h1Fiber,      // 指向第一个子节点
  // ...
};

const h1Fiber = {
  type: 'h1',
  return: divFiber,    // 父节点
  sibling: pFiber,     // 弟弟
  child: textFiber,    // 自己的子节点（文本）
  // ...
};

const pFiber = {
  type: 'p',
  return: divFiber,
  sibling: null,       // 没有弟弟
  child: textFiber2,
  // ...
};
\`\`\`

### 4.3 转换的核心算法

\`\`\`js
// 把 vdom 转成 Fiber 链表
function reconcileChildren(fiber, children) {
  // children 是数组，转成 Fiber 并用 sibling 串联
  let prevSibling = null;
  children.forEach((child, index) => {
    const newFiber = createFiber(child);
    newFiber.return = fiber;  // 父节点

    if (index === 0) {
      // 第一个子节点 → 作为 fiber.child
      fiber.child = newFiber;
    } else {
      // 后续子节点 → 作为前一个的 sibling
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
  });
}
\`\`\`

---

## 五、链表结构的生活类比

### 5.1 公司组织架构

把 Fiber 树想象成**公司组织架构**：

- \`child\`：你的**直接下属**（团队里第一个人）
- \`sibling\`：你的**同级同事**（隔壁团队负责人）
- \`return\`：你的**直属上司**

要遍历整个公司？不用递归：

1. 从 CEO 开始，看他的第一个下属（VP）
2. VP 有下属吗？深入到下属
3. 没下属了，看 VP 有没有同级同事（另一个 VP）
4. 都处理完了，回到 CEO

### 5.2 为什么不用数组而用链表

数组 \`children: [a, b, c]\` 看起来更直观，为什么 Fiber 偏偏用链表？

| 维度 | 数组（树） | 链表 |
| --- | --- | --- |
| 遍历方式 | 递归 | 循环 |
| 可中断性 | ❌ 无法暂停 | ✅ 随时暂停 |
| 内存开销 | 一次性分配数组 | 节点分散，按需创建 |
| 增删节点 | 要移动数组元素 | 改指针即可 |
| 复用节点 | 困难 | alternate 指针复用 |

链表的**可中断性**是关键 —— 这是 Fiber 架构能实现时间分片的物理基础。

---

## 六、本章小结

| 概念 | 一句话总结 |
| --- | --- |
| 为什么用链表 | 链表可循环遍历，可随时暂停 |
| child | 指向第一个子节点 |
| sibling | 指向下一个兄弟 |
| return | 指向父节点（处理完要"返回"） |
| alternate | 指向双缓冲的另一棵树对应节点 |
| vdom → Fiber | 把 children 数组转成 child+sibling 链表 |

下一章我们将基于这个链表结构，实现 **workLoop 工作循环**，看看 Fiber 是如何"处理一个节点、检查时间、暂停或继续"的。

下面这段代码演示如何构建 Fiber 链表，并用循环方式遍历它（对比递归遍历）。`,
    code: `// ============================================================
// 第 12 章代码演示：构建 Fiber 链表并遍历
// ------------------------------------------------------------
// 演示 Fiber 树的核心结构：
// 1. 把 vdom（树结构）转换成 Fiber（链表结构）
// 2. 用 child/sibling/return 三根指针连接
// 3. 用循环遍历 Fiber（可中断），对比递归遍历树（不可中断）
// ============================================================

// ---- 1. 定义 vdom（树结构，用 children 数组） ----
console.log("===== 1. vdom 树结构 =====");

// 一个简单的 vdom：div > [h1, p > span]
var vdom = {
  type: "div",
  props: {
    children: [
      { type: "h1", props: { children: "标题" } },
      {
        type: "p",
        props: {
          children: [{ type: "span", props: { children: "正文" } }]
        }
      }
    ]
  }
};

console.log("  vdom 结构:");
console.log("    div");
console.log("    ├── h1 (标题)");
console.log("    └── p");
console.log("        └── span (正文)");

// ---- 2. 创建 Fiber 节点 ----
console.log("\\n===== 2. 创建 Fiber 节点 =====");

// 工厂函数：创建一个 Fiber 节点
function createFiber(vdomNode, parentFiber) {
  // 处理文本节点（字符串/数字）
  var isText = typeof vdomNode === "string" || typeof vdomNode === "number";

  // 创建 Fiber 对象
  var fiber = {
    // 节点身份
    type: isText ? "TEXT" : vdomNode.type,  // 文本节点用特殊类型 "TEXT"
    props: isText ? { nodeValue: vdomNode } : vdomNode.props || {},
    stateNode: null,  // 真实 DOM（这里不创建，模拟用）

    // 链表三剑客
    child: null,      // 第一个子节点
    sibling: null,    // 下一个兄弟
    return: parentFiber, // 父节点（注意 return 是关键字，但作为属性名可以用）

    // 双缓冲（第 14 章详解）
    alternate: null,

    // 副作用标记
    effectTag: "PLACEMENT" // 标记为"新增"
  };

  return fiber;
}

// ---- 3. 把 vdom 转成 Fiber 链表（核心！） ----
console.log("\\n===== 3. vdom → Fiber 链表转换 =====");

// 递归地把 vdom 树转成 Fiber 链表
// 注意：这里转换过程用递归没问题，关键是"遍历处理"阶段用循环
function reconcileChildren(fiber, children) {
  // children 可能是单个对象、数组、字符串
  var childrenArray = [];
  if (Array.isArray(children)) {
    childrenArray = children;
  } else if (children != null) {
    childrenArray = [children];
  }

  // 前一个兄弟 Fiber，用于串联 sibling
  var prevSibling = null;

  // 遍历子节点，创建 Fiber 并用 sibling 串联
  for (var i = 0; i < childrenArray.length; i++) {
    var childVdom = childrenArray[i];
    // 创建子 Fiber，并设置 return 指向父 fiber
    var childFiber = createFiber(childVdom, fiber);

    if (i === 0) {
      // 第一个子节点 → 作为 fiber.child
      fiber.child = childFiber;
      console.log("  ", fiber.type, ".child =", childFiber.type);
    } else {
      // 后续子节点 → 作为前一个的 sibling
      prevSibling.sibling = childFiber;
      console.log("  ", prevSibling.type, ".sibling =", childFiber.type);
    }

    // 递归处理子节点的子节点
    if (!typeof childVdom === "string" && childVdom.props && childVdom.props.children) {
      reconcileChildren(childFiber, childVdom.props.children);
    }
    // 文本节点没有 children，直接处理
    if (childFiber.type !== "TEXT" && childVdom.props && childVdom.props.children) {
      reconcileChildren(childFiber, childVdom.props.children);
    }

    prevSibling = childFiber;
  }
}

// 从根 vdom 创建根 Fiber
var rootFiber = createFiber(vdom, null);
// 递归转换所有子节点
reconcileChildren(rootFiber, vdom.props.children);

console.log("\\n  Fiber 链表构建完成！");
console.log("  root.type =", rootFiber.type);
console.log("  root.child.type =", rootFiber.child.type);
console.log("  root.child.sibling.type =", rootFiber.child.sibling.type);
console.log("  root.child.sibling.child.type =", rootFiber.child.sibling.child.type);

// ---- 4. 用循环遍历 Fiber 链表（可中断！） ----
console.log("\\n===== 4. 循环遍历 Fiber（可中断）=====");

// 关键函数：用循环遍历 Fiber 树
// 返回下一个要处理的节点，可以随时暂停
function getNextFiber(fiber) {
  // 优先找长子
  if (fiber.child) {
    return fiber.child;
  }
  // 没儿子，找弟弟
  if (fiber.sibling) {
    return fiber.sibling;
  }
  // 没弟弟，回到父亲，找父亲的弟弟
  var node = fiber;
  while (node && !node.sibling) {
    node = node.return;  // 一直往上找
  }
  // 找到有弟弟的祖先，返回它的弟弟
  if (node) {
    return node.sibling;
  }
  // 全树遍历完毕
  return null;
}

// 用循环遍历整个 Fiber 树
function traverseFiberLoop(root) {
  var node = root;
  var count = 0;
  console.log("  循环遍历顺序:");
  while (node) {
    count++;
    // 处理当前节点
    var text = node.type === "TEXT" ? "(文本:" + node.props.nodeValue + ")" : node.type;
    console.log("    [" + count + "] " + text);

    // 关键：这里可以随时 return 暂停！下次从 node 接着走
    // if (shouldYield()) return node;

    // 获取下一个节点
    node = getNextFiber(node);
  }
  console.log("  遍历完成，共", count, "个节点");
}

traverseFiberLoop(rootFiber);

// ---- 5. 对比：递归遍历树（不可中断） ----
console.log("\\n===== 5. 对比：递归遍历树（不可中断）=====");

// 递归遍历：必须一口气走完，无法暂停
function traverseTreeRecursive(node, depth) {
  depth = depth || 0;
  var indent = "    " + "  ".repeat(depth);
  // 处理当前节点
  if (typeof node === "string") {
    console.log(indent + "(文本:" + node + ")");
  } else {
    console.log(indent + node.type);
    // 递归处理子节点
    var children = node.props && node.props.children;
    if (children) {
      var arr = Array.isArray(children) ? children : [children];
      for (var i = 0; i < arr.length; i++) {
        traverseTreeRecursive(arr[i], depth + 1);  // 递归！压栈
      }
    }
  }
}

console.log("  递归遍历（调用栈堆叠，无法暂停）:");
traverseTreeRecursive(vdom);

// ---- 6. 演示"可暂停"的遍历 ----
console.log("\\n===== 6. 可暂停的 Fiber 遍历（模拟中断）=====");

// 模拟：处理 2 个节点后暂停
var pausedNode = rootFiber;
var stepCount = 0;

function workStep() {
  var processed = 0;
  console.log("  --- 新的时间片 ---");
  while (pausedNode && processed < 2) {
    // 处理节点
    var text = pausedNode.type === "TEXT" ? "(文本)" : pausedNode.type;
    console.log("    处理:", text);
    pausedNode = getNextFiber(pausedNode);
    processed++;
  }

  if (pausedNode) {
    console.log("  >> 暂停！下次从", pausedNode.type, "继续");
    // 模拟下一个时间片
    setTimeout(workStep, 0);
  } else {
    console.log("  >> 全部处理完成！");
  }
}

workStep();

// ---- 7. 链表结构总结 ----
console.log("\\n===== 7. Fiber 链表结构总结 =====");
console.log("  1. Fiber 用 child/sibling/return 三根指针代替 children 数组");
console.log("  2. child：指向第一个子节点");
console.log("  3. sibling：指向下一个兄弟");
console.log("  4. return：指向父节点");
console.log("  5. 链表可循环遍历，可随时暂停（这是 Fiber 可中断的物理基础）");
console.log("  6. 树的递归遍历无法暂停，所以 Fiber 不用树结构");

console.log("\\n===== Fiber 树结构演示结束 =====");`,
  },

  // =========================================================
  // 第 13 章：工作循环
  // =========================================================
  {
    id: "rs-work-loop",
    group: "第三部分 Fiber 架构",
    icon: "🔁",
    title: "工作循环：performUnitOfWork 与时间分片",
    content: `
# 工作循环：performUnitOfWork 与时间分片

## 一、workLoop：Fiber 的心脏

### 1.1 workLoop 是什么

\`workLoop\` 是 Fiber 架构的**核心循环**，它负责：

1. 取出下一个工作单元
2. 处理它（调用 \`performUnitOfWork\`）
3. 检查是否需要让出主线程（\`shouldYield\`）
4. 让出后，下次空闲时接着干

\`\`\`js
// workLoop 的核心逻辑（简化版）
function workLoop(deadline) {
  // 还有下一个工作单元，并且时间没到 → 继续处理
  while (nextUnitOfWork && !shouldYield(deadline)) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
}
\`\`\`

短短几行代码，是整个 React 渲染的"发动机"。

### 1.2 workLoop 的生活类比：快递分拣

把 workLoop 想象成**快递分拣中心**：

- \`nextUnitOfWork\`：传送带上**下一个待分拣的包裹**
- \`performUnitOfWork\`：分拣一个包裹（扫描、分类、放上传送带）
- \`shouldYield\`：**下班铃响了吗**？响了就下班，明天接着分拣
- \`requestIdleCallback\`：明天上班的闹钟

\`\`\`
传送带：[包裹1] → [包裹2] → [包裹3] → ...
         ↓
    分拣（performUnitOfWork）
         ↓
    下班铃响？（shouldYield）
      ├─ 没响 → 继续分拣下一个
      └─ 响了 → 下班，定明天的闹钟
\`\`\`

---

## 二、performUnitOfWork：处理单个 Fiber 节点

### 2.1 它做什么

\`performUnitOfWork\` 接收一个 Fiber 节点，做三件事：

1. **创建/更新 DOM**（beginWork）
2. **diff 子节点**（reconcileChildren）
3. **返回下一个工作单元**

\`\`\`js
// performUnitOfWork 的核心逻辑
function performUnitOfWork(fiber) {
  // 1. 处理当前节点（创建 DOM、更新属性等）
  if (!fiber.stateNode) {
    fiber.stateNode = createDom(fiber);  // 创建真实 DOM
  }
  updateDomProperties(fiber);

  // 2. 处理子节点（diff，构建子 Fiber 链表）
  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);

  // 3. 返回下一个工作单元（按 child → sibling → return 顺序）
  return getNextUnitOfWork(fiber);
}
\`\`\`

### 2.2 返回下一个工作单元的算法

\`performUnitOfWork\` 处理完当前节点后，要返回**下一个该处理的节点**。顺序是：

1. 有 \`child\`？返回 child（深度优先，先深入）
2. 没 child，有 \`sibling\`？返回 sibling（处理弟弟）
3. 都没有，回到 \`return\`，找父亲的 sibling

\`\`\`js
function getNextUnitOfWork(fiber) {
  // 优先深入到子节点
  if (fiber.child) {
    return fiber.child;
  }
  // 没子节点，找兄弟
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;  // 找到兄弟
    }
    // 没兄弟，回到父亲，继续找父亲的兄弟
    nextFiber = nextFiber.return;
  }
  return null;  // 全树处理完毕
}
\`\`\`

### 2.3 这个算法为什么能遍历整棵树

对于这棵树：

\`\`\`
      A
     /|\\
    B C D
    |
    E
\`\`\`

遍历顺序：A → B → E → C → D → null

- 处理 A，返回 child B
- 处理 B，返回 child E
- 处理 E，没 child，没 sibling → 回到 B，B 没 sibling → 回到 A，A 有 sibling？没，A 是根
  - 等等，A 是根没有 sibling，但 A 的 child B 有 sibling C
  - 所以从 E 往上找：E.return = B，B.sibling = C → 返回 C ✓
- 处理 C，没 child，没 sibling → 回到 A，找 A 的其他 child...
  - C.return = A，A 有 sibling？没。继续 return = null → 但其实应该找 D
  - 哦，C.sibling = D → 返回 D ✓
- 处理 D，没 child，没 sibling → 回到 A，A 没 sibling → return null

**关键**：回到父亲后，要检查父亲**有没有 sibling**，而不是父亲本身。

---

## 三、shouldYield：判断是否让出

### 3.1 shouldYield 的逻辑

\`shouldYield\` 判断当前时间片是否用完：

\`\`\`js
// 简化版
function shouldYield(deadline) {
  // 当前时间是否超过截止时间
  return performance.now() >= deadline;
}
\`\`\`

真实 React 里更复杂，还要考虑：

- 是否有更高优先级任务插队
- 是否被暂停（paused）
- 是否超出最大连续执行时间

### 3.2 时间片长度的选择

React 默认一个时间片 **5ms**（\`5 * 1000 / 60\` 之类的计算）。为什么是 5ms？

- 一帧 16.6ms（60fps）
- 浏览器自己要用 6-8ms（paint、layout、事件处理）
- 留给 React 的安全时间约 5ms

\`\`\`js
// React Scheduler 里的时间片常量
const frameInterval = 5; // 5ms 一个时间片
\`\`\`

### 3.3 deadline 的计算

\`\`\`js
// 每次进入时间片，计算这一帧的截止时间
function computeDeadline() {
  const startTime = performance.now();
  return startTime + frameInterval; // 当前时间 + 5ms
}
\`\`\`

---

## 四、任务中断与恢复

### 4.1 中断的触发

当 \`shouldYield\` 返回 true，\`workLoop\` 的 while 循环退出，**当前 \`nextUnitOfWork\` 保留**：

\`\`\`js
function workLoop(deadline) {
  while (nextUnitOfWork && !shouldYield(deadline)) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    // ↑ 这里更新了 nextUnitOfWork
  }
  // 循环退出时，nextUnitOfWork 还指向"下一个没处理的节点"
  // 下次 workLoop 被调用时，从这里接着干
}
\`\`\`

### 4.2 恢复的机制

\`nextUnitOfWork\` 是一个**模块级变量**，它的值在两次 \`workLoop\` 调用之间**保留**：

\`\`\`js
let nextUnitOfWork = null;  // 模块级，跨调用保留

function workLoop(deadline) {
  while (nextUnitOfWork && !shouldYield(deadline)) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
  if (nextUnitOfWork) {
    // 还有任务 → 安排下一个时间片继续
    scheduleCallback(workLoop);
  }
}
\`\`\`

### 4.3 中断恢复的生活类比

想象你在**读一本很长的书**：

- 每次读 10 页（一个时间片）
- 读完 10 页，**折个角**（保存 \`nextUnitOfWork\`）
- 去做别的事（让出主线程）
- 回来后，从折角的地方接着读（恢复 \`nextUnitOfWork\`）

关键在于：**书签（nextUnitOfWork）记录了"读到哪了"**，所以能无缝继续。

### 4.4 中断点的安全性

Fiber 在**节点之间**中断，而不是**节点内部**中断。这意味着：

- 一个 Fiber 节点的处理（performUnitOfWork）是**原子的**，要么做完，要么不做
- 不会出现"处理到一半"的中间状态

这保证了渲染的**一致性**。

---

## 五、完整的 workLoop 流程

### 5.1 从 scheduleWork 到 commit

\`\`\`
1. scheduleWork(root)
   ↓
2. 设置 nextUnitOfWork = rootFiber
   ↓
3. scheduleCallback(workLoop)  ← 安排时间片
   ↓
4. 浏览器空闲 → 调用 workLoop(deadline)
   ↓
5. while (nextUnitOfWork && !shouldYield) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }
   ↓
6. shouldYield === true？
   ├─ 是 → scheduleCallback(workLoop)（安排下一片）→ 回到 4
   └─ 否（nextUnitOfWork === null）→ 渲染完毕，进入 commit
   ↓
7. commitRoot()  ← 提交所有副作用到 DOM
\`\`\`

### 5.2 performUnitOfWork 内部

\`\`\`
performUnitOfWork(fiber)
  ├─ 1. beginWork：创建/更新 fiber.stateNode（DOM）
  ├─ 2. reconcileChildren：diff 子节点，构建子 Fiber 链表
  └─ 3. return getNextUnitOfWork(fiber)
       ├─ fiber.child 存在？→ return fiber.child
       ├─ fiber.sibling 存在？→ return fiber.sibling
       └─ 都没有 → 向上找 return.sibling
\`\`\`

---

## 六、工作循环的代码实现

### 6.1 简化版 workLoop

\`\`\`js
// 模块级状态
let nextUnitOfWork = null;
let workInProgressRoot = null;

// workLoop：核心循环
function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  // 所有任务完成 → 提交
  if (!nextUnitOfWork && workInProgressRoot) {
    commitRoot();
  }
}

// performUnitOfWork：处理单个节点
function performUnitOfWork(fiber) {
  // 1. 创建 DOM
  if (!fiber.stateNode) {
    fiber.stateNode = createDom(fiber);
  }
  // 2. 构建子 Fiber 链表
  reconcileChildren(fiber, fiber.props.children);
  // 3. 返回下一个工作单元
  if (fiber.child) return fiber.child;
  let next = fiber;
  while (next) {
    if (next.sibling) return next.sibling;
    next = next.return;
  }
  return null;
}
\`\`\`

### 6.2 调度入口

\`\`\`js
// requestIdleCallback 的简化版（真实 React 用 MessageChannel）
function scheduleWork() {
  workInProgressRoot = {
    stateNode: document.getElementById('root'),
    props: { children: [vdom] }
  };
  nextUnitOfWork = workInProgressRoot;
  requestIdleCallback(workLoop);
}
\`\`\`

---

## 七、本章小结

| 概念 | 作用 |
| --- | --- |
| workLoop | 核心循环，取出工作单元并处理 |
| performUnitOfWork | 处理单个 Fiber：创建 DOM + diff 子节点 + 返回下一个 |
| shouldYield | 判断时间片是否用完 |
| nextUnitOfWork | 模块级变量，记录"处理到哪了"，实现中断恢复 |
| getNextUnitOfWork | 按 child → sibling → return 顺序找下一个 |

**核心思想**：workLoop 是一台发动机，performUnitOfWork 是气缸，shouldYield 是节流阀。三者配合，让 React 渲染**可中断、可恢复、不阻塞主线程**。

下面这段代码实现一个完整的 workLoop，模拟可中断的渲染过程。`,
    code: `// ============================================================
// 第 13 章代码演示：实现 workLoop（可中断的渲染循环）
// ------------------------------------------------------------
// 完整演示 Fiber 工作循环：
// 1. workLoop 主循环
// 2. performUnitOfWork 处理单个节点
// 3. shouldYield 判断时间片
// 4. 任务中断与恢复
// 用 setTimeout 模拟时间分片（真实 React 用 MessageChannel）
// ============================================================

// ---- 1. 准备 vdom（要渲染的虚拟 DOM） ----
console.log("===== 1. 准备 vdom =====");

// 构建一棵稍微大一点的 vdom 树
var vdom = {
  type: "div",
  props: {
    id: "app",
    children: [
      { type: "h1", props: { children: "React 源码" } },
      {
        type: "ul",
        props: {
          children: [
            { type: "li", props: { children: "第一章：vdom" } },
            { type: "li", props: { children: "第二章：Fiber" } },
            { type: "li", props: { children: "第三章：workLoop" } }
          ]
        }
      },
      { type: "p", props: { children: "学习工作循环" } }
    ]
  }
};

console.log("  vdom 结构: div > [h1, ul > [li, li, li], p]");

// ---- 2. 模块级状态（跨时间片保留） ----
console.log("\\n===== 2. 初始化模块级状态 =====");

// 关键：nextUnitOfWork 是模块级变量，记录"处理到哪了"
// 这样中断后恢复，能从上次的位置接着走
var nextUnitOfWork = null;     // 下一个要处理的工作单元
var workInProgressRoot = null; // 整棵 workInProgress 树的根
var pendingCommitFiber = null; // 处理完毕等待提交的根

console.log("  nextUnitOfWork =", nextUnitOfWork);
console.log("  workInProgressRoot =", workInProgressRoot);

// ---- 3. 创建 DOM 节点（模拟） ----
console.log("\\n===== 3. DOM 创建函数（模拟）=====");

// 模拟创建真实 DOM（这里只返回一个描述对象，不真的操作 DOM）
function createDom(fiber) {
  var dom;
  if (fiber.type === "TEXT") {
    // 文本节点
    dom = { nodeType: "TEXT", text: fiber.props.nodeValue };
  } else {
    // 元素节点
    dom = { nodeType: fiber.type, attributes: {}, children: [] };
    // 复制属性
    for (var key in fiber.props) {
      if (key !== "children" && fiber.props.hasOwnProperty(key)) {
        dom.attributes[key] = fiber.props[key];
      }
    }
  }
  return dom;
}

// ---- 4. reconcileChildren：构建子 Fiber 链表 ----
console.log("\\n===== 4. reconcileChildren（diff 子节点）=====");

function reconcileChildren(fiber, children) {
  // children 标准化成数组
  var elements = [];
  if (Array.isArray(children)) {
    elements = children;
  } else if (children != null) {
    elements = [children];
  }

  var prevSibling = null;
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    // 创建子 Fiber
    var isText = typeof element === "string" || typeof element === "number";
    var newFiber = {
      type: isText ? "TEXT" : element.type,
      props: isText ? { nodeValue: element } : (element.props || {}),
      stateNode: null,
      child: null,
      sibling: null,
      return: fiber,  // 父指针
      alternate: null,
      effectTag: "PLACEMENT"  // 标记为新增
    };

    if (i === 0) {
      // 第一个子节点 → 作为 fiber.child
      fiber.child = newFiber;
    } else {
      // 后续 → 作为前一个的 sibling
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
  }
}

// ---- 5. performUnitOfWork：处理单个 Fiber（核心！） ----
console.log("\\n===== 5. performUnitOfWork 定义 =====");

// 处理一个工作单元，返回下一个工作单元
function performUnitOfWork(fiber) {
  // 第一步：创建 DOM 节点（如果还没创建）
  if (!fiber.stateNode) {
    fiber.stateNode = createDom(fiber);
  }

  // 第二步：构建子 Fiber 链表（diff）
  if (fiber.props && fiber.props.children != null) {
    reconcileChildren(fiber, fiber.props.children);
  }

  // 第三步：返回下一个工作单元
  // 顺序：child → sibling → return.sibling
  if (fiber.child) {
    // 有长子 → 深入到子节点
    return fiber.child;
  }
  // 没长子，找兄弟或父亲的兄弟
  var next = fiber;
  while (next) {
    if (next.sibling) {
      // 有兄弟 → 处理兄弟
      return next.sibling;
    }
    // 没兄弟 → 回到父亲，继续找父亲的兄弟
    next = next.return;
  }
  // 全树处理完毕
  return null;
}

console.log("  performUnitOfWork 函数已定义");
console.log("  作用：创建 DOM + diff 子节点 + 返回下一个工作单元");

// ---- 6. shouldYield：判断是否让出主线程 ----
console.log("\\n===== 6. shouldYield 时间片判断 =====");

// 时间片长度（毫秒）
var TIME_SLICE_MS = 5;
// 当前时间片的截止时间
var deadline = 0;

// 判断当前时间片是否用完
function shouldYield() {
  return Date.now() >= deadline;
}

console.log("  TIME_SLICE_MS =", TIME_SLICE_MS, "ms");
console.log("  shouldYield() = 当前时间 >= deadline");

// ---- 7. workLoop：核心工作循环（核心！） ----
console.log("\\n===== 7. workLoop 工作循环 =====");

// 渲染开始时间
var renderStartTime = 0;
// 时间片计数
var frameCount = 0;
// 处理的节点计数
var processedCount = 0;

function workLoop() {
  frameCount++;
  console.log("  【时间片 #" + frameCount + "】开始，deadline =", deadline);

  // 核心：只要有下一个工作单元，且时间没到，就继续处理
  while (nextUnitOfWork && !shouldYield()) {
    // 取出当前工作单元
    var current = nextUnitOfWork;
    // 处理它，并获取下一个
    nextUnitOfWork = performUnitOfWork(current);

    processedCount++;
    var desc = current.type === "TEXT"
      ? "(文本:" + current.props.nodeValue + ")"
      : current.type;
    console.log("    处理 [" + processedCount + "]: " + desc);

    // 模拟每个节点做一点工作（让时间片真的会用完）
    var busy = 0;
    for (var j = 0; j < 800000; j++) busy++;
  }

  // 循环退出，判断状态
  if (nextUnitOfWork) {
    // 时间片用完，但任务没做完 → 中断，等下一片
    console.log("  >> 时间片 #" + frameCount + " 用完！中断在:",
      nextUnitOfWork.type === "TEXT" ? "(文本)" : nextUnitOfWork.type);
    console.log("  >> nextUnitOfWork 已保存，下次从这里恢复\\n");
    // 安排下一个时间片（用 setTimeout 模拟）
    setTimeout(scheduleNextFrame, 10);
  } else {
    // 所有任务处理完毕
    console.log("  >> 所有工作单元处理完毕！");
    console.log("  >> 渲染总耗时:", Date.now() - renderStartTime, "ms");
    console.log("  >> 共", frameCount, "个时间片，处理", processedCount, "个节点");
    // 进入提交阶段
    commitRoot();
  }
}

// ---- 8. scheduleNextFrame：安排下一个时间片 ----
console.log("\\n===== 8. 调度下一个时间片 =====");

function scheduleNextFrame() {
  // 计算这一帧的截止时间 = 当前时间 + 时间片长度
  deadline = Date.now() + TIME_SLICE_MS;
  // 调用 workLoop
  workLoop();
}

// ---- 9. commitRoot：提交阶段（模拟） ----
console.log("\\n===== 9. commitRoot 提交阶段 =====");

function commitRoot() {
  console.log("  进入提交阶段：把所有副作用应用到真实 DOM");
  // 遍历 workInProgressRoot，把 effectTag 应用到 DOM
  // 这里简化为打印
  var node = workInProgressRoot;
  var count = 0;
  while (node) {
    if (node.effectTag === "PLACEMENT" && node.stateNode) {
      count++;
    }
    // 获取下一个节点（同 performUnitOfWork 的逻辑）
    if (node.child) {
      node = node.child;
      continue;
    }
    var next = node;
    while (next) {
      if (next.sibling) { node = next.sibling; break; }
      next = next.return;
      if (!next) { node = null; break; }
    }
  }
  console.log("  提交完成，共新增", count, "个 DOM 节点");
  console.log("  渲染流程结束！");
}

// ---- 10. 启动渲染流程 ----
console.log("\\n===== 10. 启动渲染流程 =====");

function render(element, container) {
  // 创建根 Fiber
  workInProgressRoot = {
    type: container,  // 容器
    props: {
      children: [element]
    },
    stateNode: { nodeType: "ROOT", children: [] },
    child: null,
    sibling: null,
    return: null,
    alternate: null,
    effectTag: "PLACEMENT"
  };

  // 设置第一个工作单元为根 Fiber
  nextUnitOfWork = workInProgressRoot;

  console.log("  workInProgressRoot 已创建");
  console.log("  nextUnitOfWork 已设置");
  console.log("  开始渲染...\\n");

  renderStartTime = Date.now();
  // 安排第一个时间片
  scheduleNextFrame();
}

// 启动！
render(vdom, "root-container");

// ---- 11. workLoop 核心思想总结 ----
setTimeout(function () {
  console.log("\\n===== 11. workLoop 核心思想总结 =====");
  console.log("  1. workLoop 是 Fiber 的心脏：取出工作单元 → 处理 → 检查时间");
  console.log("  2. performUnitOfWork 处理单个节点：创建 DOM + diff + 返回下一个");
  console.log("  3. shouldYield 判断时间片是否用完（默认 5ms）");
  console.log("  4. nextUnitOfWork 是模块级变量，记录'处理到哪了'");
  console.log("  5. 中断后从 nextUnitOfWork 恢复，实现无缝继续");
  console.log("  6. 处理完所有节点后，进入 commit 阶段提交到 DOM");
  console.log("\\n===== workLoop 演示结束 =====");
}, 100);`,
  },

  // =========================================================
  // 第 14 章：双缓冲机制
  // =========================================================
  {
    id: "rs-double-buffer",
    group: "第三部分 Fiber 架构",
    icon: "double",
    title: "双缓冲机制：current 与 workInProgress",
    content: `
# 双缓冲机制：current 与 workInProgress

## 一、什么是双缓冲

### 1.1 从显卡双缓冲说起

**双缓冲（Double Buffering）** 是计算机图形学的经典技术。想象你在画一幅动画：

- **单缓冲**：直接在屏幕上画。画到一半时，用户看到"半成品"（闪烁）
- **双缓冲**：在**后台内存**里画完整幅图，然后一次性"翻页"显示到屏幕

\`\`\`
单缓冲（会闪烁）：
  屏幕上直接画 → 用户看到画的过程 → 闪烁

双缓冲（不闪烁）：
  后台内存画完整图 → 一次性复制到屏幕 → 用户看到完整图
\`\`\`

React 的双缓冲完全类比这个机制：

- **current 树**：当前屏幕上显示的 Fiber 树
- **workInProgress 树**：后台正在构建的 Fiber 树
- 构建完后**一次性切换**，用户不会看到中间状态

### 1.2 为什么 React 需要双缓冲

假设没有双缓冲，直接在 current 树上更新：

\`\`\`
渲染到一半时：
  current 树: A → B → [C 正在更新] → D 还没处理
                   ↑
              此时屏幕显示什么？
              用户看到"半更新"状态 → UI 闪烁、不一致
\`\`\`

有了双缓冲：

\`\`\`
current 树（屏幕）:    A → B → C(旧) → D(旧)  ← 用户看到的，完整稳定
workInProgress 树:     A → B → C(新) → [D 处理中]  ← 后台构建，用户看不到
                       构建完后 → 一次性替换 current
\`\`\`

---

## 二、current 树和 workInProgress 树

### 2.1 两棵树的角色

| 树 | 角色 | 对应屏幕 |
| --- | --- | --- |
| current 树 | **已显示**的 Fiber 树 | 当前屏幕 |
| workInProgress 树 | **正在构建**的 Fiber 树 | 下一帧屏幕 |

\`\`\`
     current 树（屏幕）          workInProgress 树（后台）
         root                        root
        /    \\                      /    \\
       A      B        ←复用→     A'     B'
      /      / \\                  /      / \\
     C      D   E                C'     D'  E'
\`\`\`

### 2.2 两棵树的切换

1. 初始渲染：current 为空，构建 workInProgress → 提交后 workInProgress 变成 current
2. 更新渲染：current 存在，基于 current 构建新的 workInProgress → 提交后切换

\`\`\`js
// 切换的核心代码
function commitRoot() {
  // 把 workInProgress 树作为新的 current 树
  currentRoot = workInProgressRoot;
  // 清空 workInProgress（下次更新会重建）
  workInProgressRoot = null;
}
\`\`\`

---

## 三、alternate 指针：连接两棵树

### 3.1 alternate 是什么

每个 Fiber 节点都有一个 \`alternate\` 字段，指向**另一棵树**中对应的节点：

\`\`\`js
// current 树的节点
currentA.alternate = workInProgressA;

// workInProgress 树的节点
workInProgressA.alternate = currentA;
\`\`\`

\`\`\`
current 树           workInProgress 树
   A  ←alternate→   A'
   |                |
   B  ←alternate→   B'
   |                |
   C  ←alternate→   C'
\`\`\`

### 3.2 alternate 的作用：节点复用

构建 workInProgress 树时，如果对应节点在 current 树中存在，就**复用**它的数据，避免重新创建：

\`\`\`js
// 构建 workInProgress 节点的逻辑
function createWorkInProgress(current, props) {
  // 看 current.alternate 是否存在（上次更新的 workInProgress）
  let workInProgress = current.alternate;
  if (workInProgress === null) {
    // 不存在 → 创建新的 workInProgress 节点
    workInProgress = createFiber(current.type, props);
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    // 存在 → 复用！只更新 props 等字段
    workInProgress.props = props;
    workInProgress.effectTag = null;
    // ...重置其他字段
  }
  return workInProgress;
}
\`\`\`

### 3.3 复用的好处

| 维度 | 不复用 | 复用（alternate） |
| --- | --- | --- |
| 内存 | 每次重建所有节点 | 复用节点对象 |
| 性能 | 创建对象开销大 | 直接改字段，快 |
| 状态 | state 会丢 | stateNode 保留 |

**复用是双缓冲的核心价值之一**：不是每次都重建树，而是在两棵树之间"翻面"。

---

## 四、双缓冲的完整流程

### 4.1 首次渲染

\`\`\`
1. currentRoot = null（屏幕是空的）
2. 构建 workInProgressRoot（从 vdom 创建）
   - 每个 fiber 的 alternate = null（current 不存在）
3. workLoop 处理所有 workInProgress 节点
4. commitRoot：
   - 把 workInProgressRoot 设为 currentRoot
   - DOM 操作：插入所有节点
\`\`\`

### 4.2 更新渲染

\`\`\`
1. currentRoot 存在（屏幕上有内容）
2. 触发更新（setState 等）
3. 构建 workInProgressRoot：
   - 通过 currentRoot.alternate 复用节点
   - diff 出哪些节点变了（effectTag）
4. workLoop 处理 workInProgress 节点
5. commitRoot：
   - 应用所有副作用到 DOM（插入/更新/删除）
   - workInProgressRoot → currentRoot（切换）
\`\`\`

### 4.3 中断恢复时的双缓冲

如果 workLoop 中断了：

- workInProgress 树**保留**（部分构建）
- current 树**不动**（屏幕稳定）
- 恢复后继续构建 workInProgress
- **绝不会**把半成品 workInProgress 显示出来

这就是双缓冲的**安全保障**：用户永远看不到中间状态。

---

## 五、双缓冲的生活类比

### 5.1 双面画板

想象一个画家在广场上表演画画：

- **单缓冲**：直接在画板上画，观众看到画的过程（草稿、修改、涂抹）
- **双缓冲**：画家有两块画板，一块给观众看（current），一块背对着观众画（workInProgress）
  - 画完后，"翻面"：把画好的那块转给观众看，原来的拿过来画新的

React 的双缓冲就是这块"双面画板"。

### 5.2 餐厅的菜单更新

餐厅每天更新菜单：

- **单缓冲**：直接擦掉黑板上的旧菜，写新菜 → 顾客看到"写一半"的菜单
- **双缓冲**：在另一块黑板上写好新菜单 → 写完后，把新黑板挂上去，旧黑板拿下来改

### 5.3 双缓冲的关键："翻页"

"翻页"是原子的 —— 用户**瞬间**看到新内容，看不到翻页过程。React 的 commit 阶段就是这次"翻页"。

---

## 六、提交阶段（commit）的切换

### 6.1 commit 做什么

commit 阶段是**同步的**、**不可中断的**，它做三件事：

1. **before mutation**：DOM 叹气前的准备（如 getSnapshotBeforeUpdate）
2. **mutation**：执行 DOM 操作（插入/更新/删除）
3. **layout**：DOM 叹气后的处理（如 componentDidMount、useLayoutEffect）

### 6.2 切换 current 指针

在 commit 阶段，切换 current 指针：

\`\`\`js
function commitRoot() {
  // 执行所有副作用（DOM 操作）
  commitMutationEffects(workInProgressRoot);

  // 切换：workInProgress 变成 current
  root.current = workInProgressRoot;

  // 执行 layout 阶段的副作用
  commitLayoutEffects(workInProgressRoot);
}
\`\`\`

### 6.3 为什么 commit 不可中断

因为 commit 操作的是**真实 DOM**，DOM 操作如果中断，会导致：

- UI 不一致（部分节点更新了，部分没更新）
- 事件监听器泄漏
- 状态错乱

所以 commit 必须**一口气做完**。好在 commit 阶段通常很快（只是 DOM 操作），不会阻塞太久。

---

## 七、双缓冲的代码示意

### 7.1 简化的双缓冲实现

\`\`\`js
// 全局：current 树的根
let currentRoot = null;
// 全局：workInProgress 树的根
let workInProgressRoot = null;

// 触发更新
function render(element) {
  // 创建 workInProgress 树的根
  workInProgressRoot = createWorkInProgress(currentRoot, element);
  // 开始工作循环
  nextUnitOfWork = workInProgressRoot;
  scheduleWork();
}

// 创建 workInProgress 节点（复用 alternate）
function createWorkInProgress(current, element) {
  let wip = current ? current.alternate : null;
  if (wip) {
    // 复用：只更新字段
    wip.props = element.props;
    wip.alternate = current;
  } else {
    // 新建
    wip = createFiber(element);
    wip.alternate = current;
    if (current) current.alternate = wip;
  }
  return wip;
}

// 提交：切换 current
function commitRoot() {
  commitWork(workInProgressRoot.child);
  currentRoot = workInProgressRoot;  // 切换！
  workInProgressRoot = null;
}
\`\`\`

---

## 八、本章小结

| 概念 | 作用 |
| --- | --- |
| 双缓冲 | 后台构建新树，完成后一次性切换 |
| current 树 | 当前屏幕显示的 Fiber 树 |
| workInProgress 树 | 后台正在构建的 Fiber 树 |
| alternate 指针 | 连接两棵树中对应的节点 |
| 节点复用 | 通过 alternate 复用 Fiber 对象，避免重建 |
| commit 阶段 | 切换 current，应用 DOM 副作用（同步不可中断） |

**核心思想**：双缓冲让 React 可以**安全地中断渲染**，因为中断的是 workInProgress 树，current 树（屏幕显示）始终保持完整。这就是 Fiber 架构的"安全网"。

下面这段代码模拟双缓冲机制的切换过程，演示 current 和 workInProgress 如何通过 alternate 互相关联、切换。`,
    code: `// ============================================================
// 第 14 章代码演示：双缓冲机制（current 与 workInProgress）
// ------------------------------------------------------------
// 演示 React 双缓冲的核心：
// 1. current 树和 workInProgress 树的构建
// 2. alternate 指针连接两棵树
// 3. 节点复用（不重建，改字段）
// 4. commit 阶段的切换
// ============================================================

// ---- 1. 全局状态 ----
console.log("===== 1. 全局状态初始化 =====");

// currentRoot：当前屏幕显示的 Fiber 树根
var currentRoot = null;
// workInProgressRoot：后台正在构建的 Fiber 树根
var workInProgressRoot = null;
// 副作用列表（commit 阶段要处理的节点）
var deletions = [];

console.log("  currentRoot =", currentRoot, "（屏幕上还没内容）");
console.log("  workInProgressRoot =", workInProgressRoot);

// ---- 2. 创建 Fiber 节点的工厂函数 ----
console.log("\\n===== 2. Fiber 节点工厂 =====");

// 创建一个 Fiber 节点
function createFiber(type, props) {
  return {
    type: type,            // 节点类型
    props: props || {},    // 属性
    stateNode: null,       // 真实 DOM（模拟）
    child: null,           // 第一个子节点
    sibling: null,         // 下一个兄弟
    return: null,          // 父节点
    alternate: null,       // 双缓冲对应节点（关键！）
    effectTag: null,       // 副作用标记：PLACEMENT/UPDATE/DELETION
    _debugName: type       // 调试用名字
  };
}

// ---- 3. createWorkInProgress：复用节点（双缓冲核心！） ----
console.log("\\n===== 3. createWorkInProgress（节点复用）=====");

// 关键函数：为 current 节点创建对应的 workInProgress 节点
// 如果 alternate 已存在，复用它；否则新建
function createWorkInProgress(current, props) {
  // 看 current.alternate 是否存在（上次的 workInProgress）
  var wip = current.alternate;

  if (wip !== null) {
    // alternate 存在 → 复用！只更新字段，不创建新对象
    console.log("    [复用] ", current._debugName, "→ alternate 已存在，更新字段");
    wip.props = props;
    wip.effectTag = "UPDATE";  // 标记为更新
    wip.alternate = current;
    // 清空子节点（下次会重建）
    wip.child = null;
  } else {
    // alternate 不存在 → 新建 workInProgress 节点
    console.log("    [新建] ", current._debugName, "→ 创建新的 workInProgress");
    wip = createFiber(current.type, props);
    wip.alternate = current;     // 指向 current
    current.alternate = wip;     // current 也指向 wip（双向）
    wip.effectTag = "PLACEMENT"; // 标记为新增
  }

  return wip;
}

console.log("  createWorkInProgress 函数已定义");
console.log("  作用：复用 alternate 节点，避免重建");

// ---- 4. 把 vdom 转成 Fiber 链表（基于 current 复用） ----
console.log("\\n===== 4. 构建 workInProgress 树 =====");

// 递归构建 workInProgress 树
// currentFiber 是 current 树对应的节点，element 是新的 vdom
function reconcileChildrenWip(wipFiber, elements) {
  // elements 标准化
  var arr = [];
  if (Array.isArray(elements)) arr = elements;
  else if (elements != null) arr = [elements];

  var prevSibling = null;
  // currentFiber 的第一个子节点（用于 alternate 查找）
  var currentChild = wipFiber.alternate ? wipFiber.alternate.child : null;

  for (var i = 0; i < arr.length; i++) {
    var element = arr[i];
    var isText = typeof element === "string" || typeof element === "number";
    var elementType = isText ? "TEXT" : element.type;
    var elementProps = isText ? { nodeValue: element } : (element.props || {});

    var newFiber;

    if (currentChild && currentChild.type === elementType) {
      // current 中有对应节点 → 复用
      newFiber = createWorkInProgress(currentChild, elementProps);
      newFiber.return = wipFiber;
    } else {
      // current 中没有 → 新建
      newFiber = createFiber(elementType, elementProps);
      newFiber.return = wipFiber;
      newFiber.effectTag = "PLACEMENT";
      if (currentChild) {
        // current 有但类型不同 → 标记删除
        deletions.push(currentChild);
      }
    }

    if (i === 0) {
      wipFiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;

    // 递归处理子节点
    if (!isText && element.props && element.props.children != null) {
      reconcileChildrenWip(newFiber, element.props.children);
    }

    // currentChild 往下走
    if (currentChild) currentChild = currentChild.sibling;
  }
}

console.log("  reconcileChildrenWip 函数已定义");
console.log("  作用：基于 current 树构建 workInProgress 树（带复用）");

// ---- 5. 首次渲染：current 为空 ----
console.log("\\n===== 5. 首次渲染（current 为空）=====");

// 首次的 vdom
var vdom1 = {
  type: "div",
  props: {
    children: [
      { type: "h1", props: { children: "标题 v1" } },
      { type: "p", props: { children: "段落 v1" } }
    ]
  }
};

// 首次渲染：currentRoot 是 null
function render(element) {
  // 创建 workInProgressRoot
  // 因为 currentRoot 是 null，所以 alternate 也是 null
  workInProgressRoot = createFiber("ROOT", { children: [element] });
  workInProgressRoot.effectTag = "PLACEMENT";

  console.log("  构建 workInProgressRoot（无 alternate，因为是首次）");
  reconcileChildrenWip(workInProgressRoot, [element]);

  // 进入 commit
  commitRoot();
}

render(vdom1);

// ---- 6. commitRoot：提交并切换 current ----
console.log("\\n===== 6. commitRoot 提交与切换 =====");

function commitRoot() {
  console.log("  --- commit 阶段开始 ---");
  console.log("  commit 是同步的、不可中断的！");

  // 处理删除列表
  while (deletions.length > 0) {
    var toDelete = deletions.pop();
    console.log("    [删除] " + toDelete._debugName);
  }

  // 递归应用副作用到 DOM（模拟）
  commitWork(workInProgressRoot.child);

  // 关键：切换 current 指针！
  console.log("  >> 切换：workInProgressRoot → currentRoot");
  currentRoot = workInProgressRoot;
  workInProgressRoot = null;

  console.log("  --- commit 阶段结束 ---\\n");
}

// 递归提交副作用
function commitWork(fiber) {
  if (!fiber) return;

  // 根据 effectTag 执行 DOM 操作（模拟）
  if (fiber.effectTag === "PLACEMENT") {
    var desc = fiber.type === "TEXT"
      ? "(文本:" + fiber.props.nodeValue + ")"
      : fiber.type;
    console.log("    [新增 DOM] " + desc);
    // 模拟创建 DOM
    fiber.stateNode = { type: fiber.type, mounted: true };
  } else if (fiber.effectTag === "UPDATE") {
    var desc2 = fiber.type === "TEXT"
      ? "(文本:" + fiber.props.nodeValue + ")"
      : fiber.type;
    console.log("    [更新 DOM] " + desc2);
  }

  // 递归处理子节点和兄弟节点
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

// ---- 7. 检查首次渲染后的状态 ----
console.log("===== 7. 首次渲染后的状态 =====");
console.log("  currentRoot:", currentRoot ? currentRoot._debugName : "null");
console.log("  workInProgressRoot:", workInProgressRoot ? workInProgressRoot._debugName : "null（已清空）");
console.log("  currentRoot.child.alternate:",
  currentRoot.child.alternate ? "存在（指向未来的 wip）" : "null");

// ---- 8. 更新渲染：复用 alternate ----
console.log("\\n===== 8. 更新渲染（复用 alternate）=====");

// 更新后的 vdom（修改了文本，结构相同）
var vdom2 = {
  type: "div",
  props: {
    children: [
      { type: "h1", props: { children: "标题 v2（更新）" } },  // 文本变了
      { type: "p", props: { children: "段落 v2（更新）" } }     // 文本变了
    ]
  }
};

function update(element) {
  console.log("  触发更新：基于 currentRoot 构建 new workInProgress");
  // 关键：这次 currentRoot 存在，会通过 alternate 复用！
  workInProgressRoot = createWorkInProgress(currentRoot, { children: [element] });
  // 注意：createWorkInProgress 复用了 currentRoot.alternate（如果存在）

  // 重新构建子节点
  reconcileChildrenWip(workInProgressRoot, [element]);

  // 提交
  commitRoot();
}

// 第一次更新：此时 currentRoot 的子节点 alternate 还是 null（首次渲染没设置）
// 所以这次更新会"新建" workInProgress 节点，但同时设置好 alternate 指针
console.log("  --- 第一次更新（设置 alternate 指针）---");
update(vdom2);

// ---- 9. 第二次更新：真正触发 alternate 复用 ----
console.log("\\n===== 9. 第二次更新（真正复用 alternate）=====");

// 第三次渲染的 vdom（再次修改文本）
var vdom3 = {
  type: "div",
  props: {
    children: [
      { type: "h1", props: { children: "标题 v3（再次更新）" } },
      { type: "p", props: { children: "段落 v3（再次更新）" } }
    ]
  }
};

console.log("  --- 第二次更新（alternate 已存在，触发复用）---");
console.log("  此时 currentRoot.alternate 在上次更新中已设置 → 走复用路径");
// 这次更新：currentRoot.alternate 已存在 → createWorkInProgress 复用！
update(vdom3);

console.log("\\n  注意对比：");
console.log("  - 第一次更新：[新建]（alternate 还没建立）");
console.log("  - 第二次更新：[复用]（alternate 已建立，只更新字段）");

// ---- 9.5 检查更新后的状态 ----
console.log("\\n===== 9.5 更新后的状态 =====");
console.log("  currentRoot:", currentRoot ? currentRoot._debugName : "null");
console.log("  workInProgressRoot:", workInProgressRoot ? workInProgressRoot._debugName : "null（已清空）");
console.log("  currentRoot.alternate:",
  currentRoot.alternate ? "存在（下次更新可复用）" : "null");

// ---- 10. 模拟中断场景 ----
console.log("\\n===== 10. 中断场景（双缓冲的安全保障）=====");

console.log("  场景：workLoop 在构建 workInProgress 时被中断");
console.log("  - current 树（屏幕）：完整，用户看到的还是 v1 的稳定界面");
console.log("  - workInProgress 树：部分构建（比如只处理到一半）");
console.log("  - 中断期间：用户**看不到**半成品，因为屏幕显示的是 current");
console.log("  - 恢复后：继续构建 workInProgress，构建完才 commit 切换");
console.log("  - 这就是双缓冲的安全保障：用户永远看不到中间状态");

// ---- 11. 双缓冲核心思想总结 ----
console.log("\\n===== 11. 双缓冲核心思想总结 =====");
console.log("  1. 双缓冲：后台构建新树，完成后一次性切换（类比显卡双缓冲）");
console.log("  2. current 树：当前屏幕显示的 Fiber 树（用户看到的）");
console.log("  3. workInProgress 树：后台正在构建的 Fiber 树（用户看不到）");
console.log("  4. alternate 指针：连接两棵树中对应的节点（双向）");
console.log("  5. 节点复用：通过 alternate 复用 Fiber 对象，只更新字段");
console.log("  6. commit 阶段：切换 current 指针，应用 DOM 副作用（同步不可中断）");
console.log("  7. 安全保障：中断的是 workInProgress，current 始终完整");

console.log("\\n===== 双缓冲机制演示结束 =====");`,
  },

  // =========================================================
  // 第 15 章：函数组件
  // =========================================================
  {
    id: "rs-function-component",
    group: "第四部分 组件系统",
    icon: "⚡",
    title: "函数组件：最简单的组件形式",
    content: `
# 函数组件：最简单的组件形式

## 一、函数组件的本质

### 1.1 函数组件是什么

函数组件就是一个**返回 vdom 的函数**。就这么简单。

\`\`\`js
// 一个函数组件
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

// 等价于
function Welcome(props) {
  return {
    type: 'h1',
    props: { children: 'Hello, ' + props.name }
  };
}
\`\`\`

**关键**：函数组件本身就是一个普通函数，它接收 \`props\`，返回 vdom。React 调用这个函数，拿到返回的 vdom，再继续渲染。

### 1.2 函数组件 vs 类组件

| 维度 | 函数组件 | 类组件 |
| --- | --- | --- |
| 本质 | 一个函数 | 一个类实例 |
| state | 用 Hook（useState） | this.state |
| 生命周期 | 用 Hook（useEffect） | 生命周期方法 |
| this | 没有 this | 有 this，容易踩坑 |
| 性能 | 轻量（无实例化） | 较重（要 new） |
| 代码量 | 少 | 多 |

React 团队推荐用函数组件，因为：

- 更简单：就是一个函数
- 更纯粹：输入 props，输出 vdom
- 更易测试：调用函数，断言返回值
- 更易复用：用自定义 Hook 复用逻辑

### 1.3 生活类比：工厂模具

把函数组件想象成一个**模具工厂**：

- **模具**（函数组件）：定义了产品的形状
- **原料**（props）：投入模具的材料
- **产品**（vdom）：模具压出的成品

\`\`\`
props（原料） → [模具函数] → vdom（产品）
\`\`\`

不同的原料（props），同一个模具，产出不同的产品：

\`\`\`js
function Greeting(props) {
  return { type: 'h1', props: { children: 'Hi, ' + props.name } };
}

Greeting({ name: 'Tom' });  // → { type: 'h1', props: { children: 'Hi, Tom' } }
Greeting({ name: 'Jerry' }); // → { type: 'h1', props: { children: 'Hi, Jerry' } }
\`\`\`

---

## 二、函数组件 vs 普通元素的区别

### 2.1 type 字段的差异

vdom 的 \`type\` 字段决定它是什么：

\`\`\`js
// 普通元素：type 是字符串
{ type: 'div', props: {...} }   // DOM div
{ type: 'span', props: {...} }  // DOM span

// 函数组件：type 是函数
{ type: Welcome, props: {...} }  // 函数组件

// 类组件：type 是类
{ type: Counter, props: {...} }  // 类组件
\`\`\`

### 2.2 渲染处理的差异

渲染时，根据 \`type\` 的类型决定怎么处理：

\`\`\`js
function performUnitOfWork(fiber) {
  const isFunctionComponent = typeof fiber.type === 'function';

  if (isFunctionComponent) {
    // 函数组件：调用函数，拿到返回的 vdom
    updateFunctionComponent(fiber);
  } else {
    // 普通元素：直接创建 DOM
    updateHostComponent(fiber);
  }
}

function updateFunctionComponent(fiber) {
  // 调用函数组件，传入 props
  const children = [fiber.type(fiber.props)];
  // 把返回的 vdom 作为子节点
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
  // 普通 DOM 元素：创建 DOM，子节点来自 props.children
  if (!fiber.stateNode) {
    fiber.stateNode = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}
\`\`\`

### 2.3 函数组件没有 stateNode

普通元素：\`stateNode\` 是真实 DOM 节点（如 \`<div>\`）
函数组件：\`stateNode\` 是 \`null\`（函数本身不对应 DOM）

\`\`\`js
// 普通元素
{ type: 'div', stateNode: HTMLDivElement }

// 函数组件
{ type: Welcome, stateNode: null }  // 函数组件没有自己的 DOM
\`\`\`

函数组件的 DOM 是它**返回的 vdom** 对应的 DOM，不是函数本身。

---

## 三、render 函数如何处理函数组件

### 3.1 完整的渲染流程

\`\`\`
1. JSX: <Welcome name="Tom" />
   ↓ 编译
2. vdom: { type: Welcome, props: { name: 'Tom' } }
   ↓ render
3. 创建根 Fiber: { type: ROOT, child: WelcomeFiber }
   ↓ workLoop
4. performUnitOfWork(WelcomeFiber):
   - 检测到 type 是函数 → updateFunctionComponent
   - 调用 Welcome(props) → 返回 { type: 'h1', props: {...} }
   - 把返回值作为 WelcomeFiber 的子节点
   ↓
5. performUnitOfWork(h1Fiber):
   - type 是字符串 → updateHostComponent
   - 创建 <h1> DOM
   ↓
6. commit: 把 <h1> 插入到容器
\`\`\`

### 3.2 关键：函数组件返回的 vdom 作为"子节点"

注意一个精妙的设计：**函数组件返回的 vdom，被当作函数组件 Fiber 的子节点**。

\`\`\`js
// 函数组件
function Welcome(props) {
  return <h1>Hello</h1>;
}

// Fiber 结构：
{
  type: Welcome,        // 函数组件
  stateNode: null,      // 没有 DOM
  child: {              // ← 返回的 vdom 作为 child！
    type: 'h1',
    stateNode: HTMLHeadingElement,
    child: { type: 'TEXT', props: { nodeValue: 'Hello' } }
  }
}
\`\`\`

这样设计的好处：**统一的链表遍历**。无论普通元素还是函数组件，遍历算法都一样（child → sibling → return）。

---

## 四、函数组件的 children 处理

### 4.1 props.children 的来源

JSX 的子元素会被编译成 \`props.children\`：

\`\`\`jsx
// JSX
<Welcome name="Tom">
  <span>extra</span>
</Welcome>

// 编译后
{
  type: Welcome,
  props: {
    name: 'Tom',
    children: { type: 'span', props: { children: 'extra' } }
  }
}
\`\`\`

但函数组件的 \`props.children\` **不会自动渲染** —— 必须在函数里**显式使用**：

\`\`\`js
function Welcome(props) {
  // 必须 return 里用到 props.children，才会渲染
  return (
    <div>
      <h1>Hi, {props.name}</h1>
      {props.children}  {/* ← 这里才会渲染 span */}
    </div>
  );
}
\`\`\`

如果函数组件不 \`return props.children\`，子元素就被丢弃。

### 4.2 渲染流程中的 children

\`\`\`js
function updateFunctionComponent(fiber) {
  // 1. 调用函数，传入 props（含 children）
  const returnedVdom = fiber.type(fiber.props);
  // 2. 把返回的 vdom 作为子节点
  // 注意：children 在函数内部被处理了，不用单独 reconcile
  reconcileChildren(fiber, [returnedVdom]);
}
\`\`\`

**对比普通元素**：

\`\`\`js
function updateHostComponent(fiber) {
  // 普通元素：直接把 props.children 作为子节点
  reconcileChildren(fiber, fiber.props.children);
}
\`\`\`

区别：

- 普通元素：children 直接作为 Fiber 的子节点
- 函数组件：函数**处理后**返回的 vdom 作为子节点

---

## 五、完整实现：支持函数组件的 mini React

### 5.1 代码结构

\`\`\`js
// 1. 创建 DOM
function createDom(fiber) {
  const dom = fiber.type === 'TEXT'
    ? document.createTextNode('')
    : document.createElement(fiber.type);
  updateDomProperties(dom, {}, fiber.props);
  return dom;
}

// 2. performUnitOfWork：处理单个 fiber
function performUnitOfWork(fiber) {
  const isFunctionComponent = typeof fiber.type === 'function';
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }
  // 返回下一个工作单元
  return getNextUnitOfWork(fiber);
}

// 3. 更新函数组件
function updateFunctionComponent(fiber) {
  // 调用函数，拿到返回的 vdom
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

// 4. 更新普通元素
function updateHostComponent(fiber) {
  if (!fiber.stateNode) {
    fiber.stateNode = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}
\`\`\`

### 5.2 函数组件的嵌套

函数组件可以返回另一个函数组件：

\`\`\`js
function App() {
  return <Welcome name="Tom" />;
}

function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

// 渲染流程：
// 1. App() → 返回 { type: Welcome, props: { name: 'Tom' } }
// 2. Welcome() → 返回 { type: 'h1', props: { children: 'Hello, Tom' } }
// 3. 创建 <h1> DOM
\`\`\`

对应 Fiber 树：

\`\`\`
ROOT
  └── App (function)
        └── Welcome (function)
              └── h1 (host)
                    └── TEXT
\`\`\`

每一层函数组件的返回值，都作为它的 \`child\`。

---

## 六、生活类比：俄罗斯套娃

函数组件的嵌套就像**俄罗斯套娃**：

- 最外层是大套娃（App 组件）
- 打开它，里面是中套娃（Welcome 组件）
- 再打开，是小套娃（h1 元素）
- 最里面是实心的（文本节点）

\`\`\`
App → Welcome → h1 → "Hello"
\`\`\`

每一层都是"打开"上一层的结果。React 的工作循环就是一层层"打开套娃"，直到最里面。

---

## 七、函数组件与 Hook 的预告

### 7.1 函数组件的"短板"

函数组件本身没有 state 和生命周期，这在早期是它的劣势：

\`\`\`js
// 没法有 state
function Counter() {
  // count 在哪存？每次调用都是新函数，count 会丢
  let count = 0;
  return <button>{count}</button>;
}
\`\`\`

### 7.2 Hook 解决了这个问题

React 16.8 引入 **Hook**，让函数组件也能有 state 和副作用：

\`\`\`js
function Counter() {
  // useState 返回 [当前值, 更新函数]
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
\`\`\`

Hook 的实现依赖于 Fiber 架构 —— state 存在 Fiber 节点的 \`memoizedState\` 链表里。这是后面章节的内容。

---

## 八、本章小结

| 概念 | 要点 |
| --- | --- |
| 函数组件本质 | 一个返回 vdom 的函数 |
| type 字段 | 函数组件的 type 是函数，普通元素是字符串 |
| 渲染处理 | 检测 type 是函数 → 调用函数 → 返回值作为 child |
| stateNode | 函数组件没有 stateNode（null） |
| children | 必须在函数里显式 return，否则不渲染 |
| 嵌套 | 每层函数组件的返回值作为它的 child |

**核心思想**：函数组件就是"调用函数，拿返回值当子节点"。这个简单的设计，配合 Fiber 架构，构成了现代 React 的基础。Hook 让函数组件真正强大起来，但那是建立在 Fiber 节点存 state 的基础上 —— 后面章节会深入。

下面这段代码实现一个支持函数组件的 mini React，渲染包含嵌套函数组件的界面。`,
    code: `// ============================================================
// 第 15 章代码演示：实现函数组件的支持
// ------------------------------------------------------------
// 演示如何让 mini React 支持函数组件：
// 1. 区分函数组件和普通元素（typeof fiber.type）
// 2. updateFunctionComponent：调用函数，返回值作为子节点
// 3. updateHostComponent：创建 DOM，children 作为子节点
// 4. 嵌套函数组件的处理
// 5. 完整的渲染流程
// ============================================================

// ---- 1. 定义函数组件 ----
console.log("===== 1. 定义函数组件 =====");

// 最简单的函数组件：返回一个 h1
function Welcome(props) {
  console.log("    [Welcome 被调用] props.name =", props.name);
  // 返回 vdom（这里用对象模拟 JSX）
  return {
    type: "h1",
    props: {
      children: "Hello, " + props.name + "!"
    }
  };
}

// 嵌套的函数组件：App 内部用 Welcome
function App(props) {
  console.log("    [App 被调用] props.title =", props.title);
  return {
    type: "div",
    props: {
      className: "app",
      children: [
        { type: "h1", props: { children: props.title } },
        // 嵌套使用 Welcome 函数组件
        { type: Welcome, props: { name: "Tom" } },
        { type: Welcome, props: { name: "Jerry" } },
        {
          type: "p",
          props: { children: "这是函数组件的演示" }
        }
      ]
    }
  };
}

console.log("  Welcome 组件:", typeof Welcome);
console.log("  App 组件:", typeof App);
console.log("  Welcome === function?", typeof Welcome === "function");

// ---- 2. 创建 DOM 节点（模拟） ----
console.log("\\n===== 2. DOM 创建函数（模拟）=====");

// 模拟创建真实 DOM（这里返回描述对象）
function createDom(fiber) {
  var dom;
  if (fiber.type === "TEXT") {
    // 文本节点
    dom = { nodeType: "#text", text: fiber.props.nodeValue, children: null };
    console.log("    [createDom] 文本节点:", fiber.props.nodeValue);
  } else {
    // 元素节点
    dom = { nodeType: fiber.type, attributes: {}, children: [] };
    // 复制属性（除了 children）
    for (var key in fiber.props) {
      if (key !== "children" && fiber.props.hasOwnProperty(key)) {
        dom.attributes[key] = fiber.props[key];
      }
    }
    console.log("    [createDom] 元素:", fiber.type, "属性:", JSON.stringify(dom.attributes));
  }
  return dom;
}

// ---- 3. reconcileChildren：构建子 Fiber 链表 ----
console.log("\\n===== 3. reconcileChildren =====");

// 把 vdom children 转成 Fiber 链表
function reconcileChildren(fiber, children) {
  // 标准化成数组
  var elements = [];
  if (Array.isArray(children)) {
    elements = children;
  } else if (children != null) {
    elements = [children];
  }

  var prevSibling = null;
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    // 判断是否文本
    var isText = typeof element === "string" || typeof element === "number";

    // 创建子 Fiber
    var newFiber = {
      // 关键：type 可能是字符串（普通元素）或函数（函数组件）
      type: isText ? "TEXT" : element.type,
      props: isText ? { nodeValue: element } : (element.props || {}),
      stateNode: null,
      child: null,
      sibling: null,
      return: fiber,
      alternate: null,
      effectTag: "PLACEMENT"
    };

    // 串联链表
    if (i === 0) {
      fiber.child = newFiber;  // 第一个作为 child
    } else {
      prevSibling.sibling = newFiber;  // 后续作为 sibling
    }
    prevSibling = newFiber;
  }
}

// ---- 4. updateFunctionComponent：处理函数组件（核心！） ----
console.log("\\n===== 4. updateFunctionComponent（核心）=====");

// 处理函数组件
function updateFunctionComponent(fiber) {
  console.log("  >> updateFunctionComponent:", fiber.type.name || "匿名");

  // 关键：调用函数组件，传入 props，拿到返回的 vdom
  // fiber.type 就是函数本身，fiber.props 是属性
  var returnedVdom = fiber.type(fiber.props);

  // 把返回的 vdom 作为函数组件的子节点
  // 注意：用数组包装，统一处理
  reconcileChildren(fiber, [returnedVdom]);

  // 函数组件没有 stateNode（不对应 DOM）
  // 它的 DOM 是子节点（返回的 vdom）对应的 DOM
}

console.log("  updateFunctionComponent 函数已定义");
console.log("  作用：调用函数 → 拿返回的 vdom → 作为子节点");

// ---- 5. updateHostComponent：处理普通元素 ----
console.log("\\n===== 5. updateHostComponent =====");

// 处理普通 DOM 元素
function updateHostComponent(fiber) {
  console.log("  >> updateHostComponent:", fiber.type);

  // 创建真实 DOM（如果还没创建）
  if (!fiber.stateNode) {
    fiber.stateNode = createDom(fiber);
  }

  // 子节点来自 props.children
  reconcileChildren(fiber, fiber.props.children);
}

// ---- 6. performUnitOfWork：处理单个 Fiber ----
console.log("\\n===== 6. performUnitOfWork =====");

function performUnitOfWork(fiber) {
  // 关键：根据 type 判断是函数组件还是普通元素
  var isFunctionComponent = typeof fiber.type === "function";

  if (isFunctionComponent) {
    // 函数组件：调用函数
    updateFunctionComponent(fiber);
  } else {
    // 普通元素：创建 DOM
    updateHostComponent(fiber);
  }

  // 返回下一个工作单元（child → sibling → return.sibling）
  if (fiber.child) {
    return fiber.child;
  }
  var next = fiber;
  while (next) {
    if (next.sibling) {
      return next.sibling;
    }
    next = next.return;
  }
  return null;
}

// ---- 7. commitWork：提交副作用到 DOM ----
console.log("\\n===== 7. commitWork（提交）=====");

// 递归提交：把 Fiber 树应用成"真实 DOM 树"（模拟）
function commitWork(fiber) {
  if (!fiber) return;

  // 函数组件没有 stateNode，跳过 DOM 操作
  // 但要递归处理子节点
  if (fiber.stateNode && fiber.effectTag === "PLACEMENT") {
    // 把当前 DOM 挂到父 DOM 上
    var parentFiber = fiber.return;
    // 找到最近的有 stateNode 的祖先（跳过函数组件）
    while (parentFiber && !parentFiber.stateNode) {
      parentFiber = parentFiber.return;
    }
    if (parentFiber && parentFiber.stateNode) {
      if (fiber.stateNode.nodeType === "#text") {
        parentFiber.stateNode.children = (parentFiber.stateNode.children || []);
        parentFiber.stateNode.children.push(fiber.stateNode.text);
      } else {
        parentFiber.stateNode.children.push(fiber.stateNode);
      }
    }
  }

  // 递归处理子节点和兄弟
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

// ---- 8. 完整渲染流程 ----
console.log("\\n===== 8. 完整渲染流程 =====");

// 模块级状态
var workInProgressRoot = null;
var nextUnitOfWork = null;

// render：入口
function render(element, container) {
  console.log("  开始渲染...");
  // 创建根 Fiber
  workInProgressRoot = {
    type: container,  // 容器标记
    props: { children: [element] },
    stateNode: { nodeType: container, attributes: {}, children: [] },
    child: null,
    sibling: null,
    return: null,
    alternate: null,
    effectTag: "PLACEMENT"
  };
  nextUnitOfWork = workInProgressRoot;

  // 工作循环（同步执行，简化演示）
  while (nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }

  console.log("\\n  所有工作单元处理完毕，进入 commit 阶段");
  // 提交
  commitRoot();
}

// commitRoot：提交根
function commitRoot() {
  commitWork(workInProgressRoot.child);
  console.log("\\n  === 最终 DOM 树结构 ===");
  printDomTree(workInProgressRoot.stateNode, 0);
}

// 打印 DOM 树（模拟）
function printDomTree(node, depth) {
  var indent = "    " + "  ".repeat(depth);
  if (typeof node === "string") {
    console.log(indent + "“" + node + "”");
    return;
  }
  if (!node || !node.nodeType) return;
  var attrs = node.attributes && Object.keys(node.attributes).length > 0
    ? " " + JSON.stringify(node.attributes)
    : "";
  console.log(indent + "<" + node.nodeType + attrs + ">");
  if (node.children) {
    for (var i = 0; i < node.children.length; i++) {
      printDomTree(node.children[i], depth + 1);
    }
  }
}

// ---- 9. 启动渲染！ ----
console.log("\\n===== 9. 启动渲染 =====");

// 创建 vdom：<App title="函数组件演示" />
var appVdom = {
  type: App,  // 注意：type 是函数 App
  props: { title: "函数组件演示" }
};

console.log("  准备渲染: <App title='函数组件演示' />");
console.log("  App 的 type 是函数吗?", typeof appVdom.type === "function");
console.log("");

render(appVdom, "root");

// ---- 10. 函数组件的特点总结 ----
console.log("\\n===== 10. 函数组件特点总结 =====");
console.log("  1. 本质：一个返回 vdom 的函数");
console.log("  2. type 字段：函数组件的 type 是函数，普通元素是字符串");
console.log("  3. 渲染处理：");
console.log("     - 函数组件：调用函数 → 返回值作为 child");
console.log("     - 普通元素：创建 DOM → props.children 作为 child");
console.log("  4. stateNode：函数组件没有 stateNode（null）");
console.log("  5. 嵌套：每层函数组件的返回值作为它的 child（俄罗斯套娃）");
console.log("  6. children：必须在函数里显式 return，否则不渲染");
console.log("  7. commit 时跳过函数组件的 stateNode，但递归处理子节点");

console.log("\\n===== 函数组件演示结束 =====");`,
  },
];
