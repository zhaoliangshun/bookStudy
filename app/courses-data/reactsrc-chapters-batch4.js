// =============================================================
// React 源码构建教程 —— 第四批章节（第16-20章）
// -------------------------------------------------------------
// 主题：类组件与 Hooks 系统基础
// 面向：想从源码层面理解 React 组件机制的开发者
//
// 第四批（16-20章）：
//   rs-class-component  ：类组件的本质：Component 基类与 isReactComponent
//   rs-setstate-flow    ：setState 更新流程：批量更新与更新队列
//   rs-hook-linkedlist  ：Hook 链表结构：fiber.memoizedState 的秘密
//   rs-usestate         ：useState 源码精读：dispatchAction 与环形队列
//   rs-useeffect        ：useEffect 源码精读：依赖对比与 cleanup 执行时机
//
// 每个章节包含：
//   id      : 唯一标识
//   group   : 分组名
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解（含表格、代码块、列表）
//   code    : 可运行、带详细中文注释的 Node.js 示例代码
//
// 代码运行环境约束：
//   - 在 Node.js 沙箱中执行（推荐 14+）
//   - 仅使用 Node.js 内置模块，不依赖第三方包
//   - 所有 demo 单文件可独立运行
//   - 用 console.log 输出结果，每步都有中文注释
// =============================================================

export const chapters = [
  // =========================================================
  // 第十六章：类组件的本质
  // =========================================================
  {
    id: "rs-class-component",
    group: "第四部分 组件系统",
    icon: "🏛️",
    title: "类组件的本质：Component 基类与 isReactComponent",
    content: `## 一、为什么 React 要有类组件

在 Hooks 出现之前（React 16.8 以前），类组件是 React 中**唯一能拥有状态和生命周期**的组件形式。虽然现在函数组件配合 Hooks 已经成为主流，但理解类组件的源码实现依然非常重要，因为：

1. **大量老项目仍在使用类组件**——维护遗留代码必须看懂
2. **Hooks 的设计是对类组件能力的"重新表达"**——理解类组件才能理解 Hooks 为什么这么设计
3. **类组件的 setState 机制是 React 更新流程的基石**——Hooks 的状态更新底层复用了同一套机制

### 生活类比：类组件就像"一台带操作面板的机器"

把类组件想象成一台**洗衣机**：

- **洗衣机本身**（class 组件）= 一个有内部状态的对象
- **操作面板上的按钮**（自定义方法）= 你在组件里写的方法
- **显示屏上的状态**（this.state）= 机器当前的状态（水位、模式、剩余时间）
- **出厂设定的运转流程**（生命周期）= 通电→进水→洗涤→排水→脱水
- **你按下按钮**（this.setState）= 告诉机器"我要改变状态"

React 就像是**操作员**：它负责"通电"（mount）、"按你的要求运转"（render）、"在运转过程中通知你"（生命周期回调）、"断电"（unmount）。

\`\`\`
你（开发者）        React（操作员）        组件实例（洗衣机）
    |                   |                       |
    |  写 class Counter |                       |
    |------------------>|                       |
    |                   |  new Counter()        |
    |                   |---------------------->|
    |                   |  instance.state = {}  |
    |                   |---------------------->|
    |                   |  instance.render()    |
    |                   |---------------------->|
    |                   |  返回虚拟 DOM          |
    |                   |<----------------------|
    |                   |  渲染到页面            |
    |                   |                       |
    | 用户点击按钮       |                       |
    |                   |  instance.setState()  |
    |                   |---------------------->|
    |                   |  state 变了，重新 render|
    |                   |---------------------->|
    |                   |  返回新虚拟 DOM        |
    |                   |<----------------------|
    |                   |  对比差异，更新页面     |
\`\`\`

## 二、Component 基类的源码实现

React 中所有类组件都继承自 \`React.Component\`。这个基类的源码非常简洁，但每一行都至关重要：

\`\`\`javascript
// React 源码简化版 —— ReactBaseClasses.js
function Component(props, context, updater) {
  this.props = props;        // 组件接收的属性
  this.context = context;    // 上下文
  this.refs = emptyObject;   // ref 引用集合
  this.updater = updater || ReactNoopUpdateQueue; // 更新器（核心！）
}

Component.prototype.isReactComponent = {}; // 标记：我是一个类组件

Component.prototype.setState = function (partialState, callback) {
  // 把更新操作委托给 updater
  this.updater.enqueueSetState(this, partialState, callback, 'setState');
};

Component.prototype.forceUpdate = function (callback) {
  this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
};
\`\`\`

### 为什么 setState 要委托给 updater？

这是源码中最精妙的设计之一。注意 \`this.updater\` 的默认值是 \`ReactNoopUpdateQueue\`——一个"什么都不做"的空实现：

\`\`\`javascript
var ReactNoopUpdateQueue = {
  enqueueSetState: function () {
    console.warn('setState 只能在组件已挂载后调用');
  },
  enqueueForceUpdate: function () {
    console.warn('forceUpdate 只能在组件已挂载后调用');
  },
};
\`\`\`

**为什么？** 因为 \`Component\` 基类本身不知道"怎么更新"——它不知道你用的是浏览器环境还是测试环境，不知道 fiber 架构的细节。真正知道"怎么把状态更新到页面上"的，是 React 的渲染器（react-dom、react-native 等）。

所以 React 用了一个**依赖注入**模式：

1. \`Component\` 基类提供一个"占位"的 \`updater\`
2. 当 React 真正渲染组件时，会**替换** \`updater\` 为真正的实现
3. 组件内部调用 \`this.setState()\` 时，实际执行的是 React 注入的更新逻辑

生活类比：这就像你买了一台**通用遥控器**（Component 基类）。遥控器上有"开关键"，但这个键出厂时**没有绑定任何设备**（ReactNoopUpdateQueue）。你要用它控制电视，就得先"配对"（注入真正的 updater）。配对之前按按键没反应，配对之后按键才会真正控制电视。

## 三、isReactComponent：React 如何区分类组件和函数组件

React 内部有一个关键的判断逻辑。当你写 \`<Counter />\` 时，React 需要知道 \`Counter\` 是类组件还是函数组件，因为两者的处理方式完全不同：

\`\`\`javascript
// React 源码简化版 —— 判断组件类型
function isClassComponent(type) {
  return typeof type === 'function' && !!type.prototype.isReactComponent;
}
\`\`\`

关键在于 \`type.prototype.isReactComponent\`。注意：

- **类组件**：\`Counter.prototype.isReactComponent\` 存在（因为继承了 \`Component\`）
- **函数组件**：\`function App() {}\` 的 prototype 上没有 \`isReactComponent\`

这就是为什么 React 能用**同一个标志位**区分两种组件。这个设计的好处是：

1. **零额外开销**：不需要维护一个"组件类型注册表"
2. **天然继承**：子类自动获得 \`isReactComponent\` 标记
3. **向后兼容**：第三方库只要在 prototype 上加这个标记就能被识别

### 类组件 vs 函数组件的处理差异

| 维度 | 类组件 | 函数组件 |
|------|--------|----------|
| **实例化方式** | \`new Type(props)\` | \`Type(props)\` 直接调用 |
| **状态存储** | \`instance.state\` | \`fiber.memoizedState\`（Hook 链表） |
| **更新触发** | \`instance.setState()\` | \`dispatchAction()\` |
| **生命周期** | 实例方法（didMount、didUpdate…） | useEffect、useLayoutEffect |
| **render 调用** | \`instance.render()\` | \`Type(props)\` |
| **this 指向** | 绑定到实例 | 没有 this |

## 四、类组件的挂载流程

当 React 第一次渲染一个类组件时，会经历以下步骤：

\`\`\`
1. 判断组件类型 → 发现 isReactComponent 标记 → 确定是类组件
2. new Type(props)        → 创建组件实例
3. instance.props = props → 设置属性
4. instance.state = instance.state || {} → 初始化状态
5. instance.updater = 真正的更新器 → 注入 updater
6. instance.render()      → 调用 render 获取虚拟 DOM
7. 递归处理子节点
8. instance.componentDidMount() → 触发挂载后生命周期
\`\`\`

注意第 5 步——这就是"注入 updater"的时机。在此之前调用 setState 会走空实现，在此之后才会真正触发更新。

## 五、类组件的更新流程

当调用 \`this.setState()\` 时：

\`\`\`
1. this.setState(partialState)
2. → this.updater.enqueueSetState(this, partialState)
3. → 把 partialState 加入更新队列
4. → 标记 fiber 需要更新
5. → 调度重新渲染
6. → 重新执行 instance.render()
7. → 对比新旧虚拟 DOM
8. → 更新真实 DOM
9. → instance.componentDidUpdate(prevProps, prevState)
\`\`\`

## 六、生命周期方法的本质

生命周期方法就是 React 在特定时机**回调**的实例方法。它们不是"React 调用你"，而是"你在实例上定义了这些方法，React 约定在特定时机去调用它们"：

\`\`\`javascript
// 挂载阶段
instance.componentWillMount()    // 挂载前（已废弃）
instance.render()                // 渲染
instance.componentDidMount()     // 挂载后

// 更新阶段
instance.componentWillReceiveProps()  // 接收新 props 前（已废弃）
instance.shouldComponentUpdate()      // 是否需要更新
instance.componentWillUpdate()        // 更新前（已废弃）
instance.render()                     // 重新渲染
instance.componentDidUpdate()         // 更新后

// 卸载阶段
instance.componentWillUnmount()       // 卸载前
\`\`\`

### 为什么有些生命周期被废弃？

React 16.3 引入了 Fiber 架构，带来了**异步可中断渲染**。这意味着一个组件的渲染过程可能被暂停、恢复、甚至重新开始。这就导致 \`componentWillMount\`、\`componentWillUpdate\` 等方法可能被**调用多次**，引发 bug。

React 16.3 用 \`getDerivedStateFromProps\` 和 \`getSnapshotBeforeUpdate\` 替代了它们，因为新方法都是**纯函数**或**在 DOM 更新前的单次调用**，不受中断影响。

## 七、本章 Demo 说明

下面的 demo 会用代码模拟 React 类组件的核心机制：

1. 实现 \`Component\` 基类（含 setState 委托给 updater 的设计）
2. 模拟 \`isReactComponent\` 标记和组件类型判断
3. 模拟挂载流程（实例化、注入 updater、调用 render、触发 componentDidMount）
4. 模拟更新流程（setState → enqueueSetState → 重新 render → componentDidUpdate）
5. 验证 prevState 在 componentDidUpdate 中的正确性

这个 demo 会让你直观理解：类组件本质上就是一个**有状态的对象**，React 负责管理它的生命周期和更新流程。`,
    code: `// ============================================================
// 第十六章 demo：类组件的本质 —— Component 基类与 isReactComponent
// 演示内容：
//   1. 实现 Component 基类（含 setState 委托给 updater 的依赖注入设计）
//   2. 模拟 isReactComponent 标记和组件类型判断
//   3. 模拟挂载流程（实例化 → 注入 updater → render → componentDidMount）
//   4. 模拟更新流程（setState → enqueueSetState → 重新 render → componentDidUpdate）
//   5. 验证 prevState 在 componentDidUpdate 中的正确性
// ============================================================

console.log("=".repeat(60));                            // 打印分隔线
console.log("React 源码精读 — 第十六章：类组件的本质");    // 打印章节标题
console.log("=".repeat(60));                            // 打印分隔线
console.log();                                          // 打印空行

// ===== 第一部分：实现 Component 基类 =====
console.log("【第一部分：实现 Component 基类】");          // 打印小节标题

// 空的更新队列 —— 组件未挂载时 setState 会走这个空实现
// 这就是为什么在未挂载的组件中调用 setState 会报警告
var ReactNoopUpdateQueue = {
  // 空的 enqueueSetState，什么都不做，只打印警告
  enqueueSetState: function (instance, partialState) {
    console.warn("[ReactNoopUpdateQueue] setState 被调用了，但组件还未挂载！");
  },
  // 空的 enqueueForceUpdate
  enqueueForceUpdate: function (instance) {
    console.warn("[ReactNoopUpdateQueue] forceUpdate 被调用了，但组件还未挂载！");
  },
};

// Component 基类 —— 所有类组件的父类
// 对应 React 源码中的 React.Component
function Component(props, context, updater) {
  this.props = props;        // 组件接收的属性，由外部传入
  this.context = context;    // 上下文对象（本章不深入）
  this.refs = {};            // ref 引用集合
  // updater 是核心！默认用空实现，真正渲染时会被替换
  // 这就是"依赖注入"模式：基类不知道怎么更新，由外部注入
  this.updater = updater || ReactNoopUpdateQueue;
}

// isReactComponent 标记 —— 这是 React 区分类组件和函数组件的关键
// 注意它是一个空对象 {}，用 !! 转成布尔值就是 true
// 函数组件的 prototype 上没有这个属性，所以 !!undefined === false
Component.prototype.isReactComponent = {};

// setState 方法 —— 委托给 updater.enqueueSetState
// 注意：Component 基类自己不实现更新逻辑，而是委托给 this.updater
// 这样做的好处是：基类与具体的渲染器（react-dom/react-native）解耦
Component.prototype.setState = function (partialState) {
  // 第一个参数 this 是组件实例，让 updater 知道是哪个组件要更新
  // 第二个参数 partialState 是要合并的状态
  this.updater.enqueueSetState(this, partialState);
};

// forceUpdate 方法 —— 强制更新，跳过 shouldComponentUpdate
Component.prototype.forceUpdate = function () {
  this.updater.enqueueForceUpdate(this);
};

console.log("  Component 基类已定义");                    // 打印提示
console.log("  isReactComponent 标记:", Component.prototype.isReactComponent); // 打印标记值
console.log("  !!isReactComponent:", !!Component.prototype.isReactComponent);   // 打印布尔值
console.log();                                          // 打印空行

// ===== 第二部分：组件类型判断 =====
console.log("【第二部分：isReactComponent 标记与组件类型判断】"); // 打印小节标题

// 判断一个组件是类组件还是函数组件
// 对应 React 源码中的判断逻辑
function isClassComponent(type) {
  // 两个条件：
  // 1. 必须是函数（类在 JS 中本质也是函数）
  // 2. prototype 上必须有 isReactComponent 标记
  return typeof type === "function" && !!type.prototype.isReactComponent;
}

// 定义一个类组件，继承 Component
class Counter extends Component {
  constructor(props) {
    super(props);               // 调用父类构造函数，设置 props/context/updater
    this.state = { count: 0 };  // 初始化状态
  }

  // render 方法 —— 返回虚拟 DOM
  // 这里用普通对象模拟虚拟 DOM，真实 React 中是 React.createElement 的返回值
  render() {
    return {
      type: "div",
      props: { children: "Count: " + this.state.count },
    };
  }

  // 挂载后生命周期
  componentDidMount() {
    console.log("  [componentDidMount] Counter 已挂载，初始 count =", this.state.count);
  }

  // 更新后生命周期 —— prevState 是更新前的状态
  componentDidUpdate(prevProps, prevState) {
    console.log("  [componentDidUpdate] prevState.count=" + prevState.count + " -> currentState.count=" + this.state.count);
  }
}

// 定义一个函数组件（没有继承 Component）
function App(props) {
  return {
    type: "div",
    props: { children: "Hello " + props.name },
  };
}

// 用 Boolean() 包裹，让输出更清晰（isClassComponent 返回的是对象 {}，布尔化后是 true）
console.log("  Counter 是类组件吗？", Boolean(isClassComponent(Counter))); // true，因为继承了 Component
console.log("  App 是类组件吗？", Boolean(isClassComponent(App)));         // false，普通函数
console.log();                                          // 打印空行

// ===== 第三部分：模拟挂载流程 =====
console.log("【第三部分：模拟挂载流程】");                  // 打印小节标题

// 真正的 updater 实现 —— 替换掉空的 ReactNoopUpdateQueue
// 这个 updater 知道"怎么把状态更新到页面上"
var realUpdater = {
  // enqueueSetState：把 partialState 合并到 instance.state，然后触发更新
  enqueueSetState: function (instance, partialState) {
    // 关键修复：先保存 prevState，再合并状态
    // 因为 componentDidUpdate 需要拿到"更新前"的状态
    var prevState = instance.state;                       // 保存更新前的状态
    instance.state = Object.assign({}, instance.state, partialState); // 合并新状态
    updateInstance(instance, prevState);                  // 触发重新渲染，传入 prevState
  },
  // forceUpdate：强制更新，不合并状态
  enqueueForceUpdate: function (instance) {
    var prevState = instance.state;                       // 保存更新前的状态
    updateInstance(instance, prevState);                  // 直接触发重新渲染
  },
};

// updateInstance：执行更新流程（重新 render + componentDidUpdate）
function updateInstance(instance, prevState) {
  console.log("\\n  ---------- 更新阶段 ----------");
  // 1. 重新调用 render，获取新的虚拟 DOM
  var newVdom = instance.render();
  console.log("  [render] 更新后的虚拟 DOM:", JSON.stringify(newVdom));
  // 2. 调用 componentDidUpdate 生命周期
  // prevState 是更新前的状态，this.state 是更新后的状态
  instance.componentDidUpdate(instance.props, prevState);
}

// mountClassComponent：模拟 React 挂载类组件的完整流程
function mountClassComponent(ComponentClass, props) {
  console.log("  1. 创建组件实例...");
  var instance = new ComponentClass(props);               // 实例化

  console.log("  2. 注入真正的 updater...");
  instance.updater = realUpdater;                         // 注入真正的 updater（替换空实现）

  console.log("  3. 调用 render 获取虚拟 DOM...");
  var vdom = instance.render();                           // 调用 render
  console.log("  [render] 初始虚拟 DOM:", JSON.stringify(vdom));

  console.log("  4. 触发 componentDidMount...");
  if (instance.componentDidMount) {
    instance.componentDidMount();                         // 触发挂载后生命周期
  }

  return instance;                                        // 返回实例，后续可以更新
}

console.log("  开始挂载 Counter 组件...");
var instance = mountClassComponent(Counter, { initial: 10 }); // 挂载组件
console.log("  挂载完成，instance.state =", JSON.stringify(instance.state));
console.log();                                          // 打印空行

// ===== 第四部分：模拟更新流程 =====
console.log("【第四部分：模拟更新流程（setState）】");       // 打印小节标题

console.log("\\n  --- 第一次 setState({ count: 1 }) ---");
instance.setState({ count: 1 });                          // 触发更新，count 0 → 1

console.log("\\n  --- 第二次 setState({ count: 2 }) ---");
instance.setState({ count: 2 });                          // 触发更新，count 1 → 2

console.log("\\n  --- 第三次 setState({ count: 5 }) ---");
instance.setState({ count: 5 });                          // 触发更新，count 2 → 5

console.log();                                          // 打印空行

// ===== 第五部分：验证未挂载时 setState 的行为 =====
console.log("【第五部分：验证未挂载时 setState 的行为】");   // 打印小节标题

// 创建一个新实例但不注入真正的 updater
var unmountedInstance = new Counter({ initial: 0 });
console.log("  未挂载实例的 updater 是空实现吗？",
  unmountedInstance.updater === ReactNoopUpdateQueue);    // true，还是空实现
console.log("  调用 setState（应该触发警告）：");
unmountedInstance.setState({ count: 99 });                // 会触发 ReactNoopUpdateQueue 的警告

console.log();                                          // 打印空行

// ===== 第六部分：总结 =====
console.log("【总结】");
console.log("  1. Component 基类通过 isReactComponent 标记区分类组件和函数组件");
console.log("  2. setState 委托给 updater —— 依赖注入模式，基类与渲染器解耦");
console.log("  3. 挂载流程：new → 注入 updater → render → componentDidMount");
console.log("  4. 更新流程：setState → enqueueSetState → 合并 state → render → componentDidUpdate");
console.log("  5. prevState 必须在合并状态之前保存，这样 componentDidUpdate 才能拿到正确的旧值");`
  },

  // =========================================================
  // 第十七章：setState 更新流程
  // =========================================================
  {
    id: "rs-setstate-flow",
    group: "第四部分 组件系统",
    icon: "📦",
    title: "setState 更新流程：批量更新与更新队列",
    content: `## 一、setState 是"异步"的吗

这是 React 面试中最经典的问题之一。答案是：**setState 既不是同步的，也不是异步的，它是"批量"的。**

### 生活类比：超市进货

想象你是超市的仓管员：

- **同步模式**：每来一件货，你立刻跑进仓库放好，再出来接下一件。跑来跑去效率极低。
- **异步模式**：每来一件货，你先扔在门口，等有空了再慢慢整理。但你不知道什么时候"有空"。
- **批量模式（React 的做法）**：你来一件货，先记在**进货清单**上（加入更新队列）。等这批进货告一段落（当前事件循环结束），你拿着清单**一次性**把所有货都搬进仓库。

React 的 setState 就是"批量模式"：在一个事件处理函数里多次调用 setState，React 不会每次都重新渲染，而是把所有更新收集起来，**最后统一处理**。

\`\`\`
事件处理函数开始
  ├─ setState({a: 1})  → 加入队列，不立即更新
  ├─ setState({b: 2})  → 加入队列，不立即更新
  ├─ setState({a: 3})  → 加入队列，覆盖之前的 a:1
  └─ 事件处理函数结束
     → React 统一处理队列：合并所有更新
     → 重新渲染一次（而不是三次！）
\`\`\`

## 二、React 18 的 Automatic Batching

在 React 18 之前，批量更新只在 React 事件处理函数中生效：

\`\`\`javascript
// React 17 的行为
function handleClick() {
  setCount(1);  // ✅ 批量：加入队列
  setCount(2);  // ✅ 批量：加入队列
  // 函数结束时统一处理，只渲染一次
}

// 但在 setTimeout 中不批量！
setTimeout(() => {
  setCount(1);  // ❌ 立即更新，触发一次渲染
  setCount(2);  // ❌ 立即更新，又触发一次渲染
}, 0);
\`\`\`

React 18 引入了 **Automatic Batching**（自动批量更新），无论在哪里调用 setState，都会批量处理：

\`\`\`javascript
// React 18 的行为
function handleClick() {
  setCount(1);  // ✅ 批量
  setCount(2);  // ✅ 批量
}

setTimeout(() => {
  setCount(1);  // ✅ 批量（React 18 改进！）
  setCount(2);  // ✅ 批量
}, 0);

fetch(url).then(() => {
  setCount(1);  // ✅ 批量（React 18 改进！）
  setCount(2);  // ✅ 批量
});
\`\`\`

### 为什么 React 18 能做到全自动批量？

React 18 通过 \`createRoot\` 开启了新的并发模式。在这个模式下，React 用 **Lane 模型**（优先级模型）替代了原来的 expirationTime。所有更新都会被打上优先级标签，然后被调度器统一安排执行时机。

核心流程：

\`\`\`
setState 调用
  → 创建 update 对象（包含 partialState 和优先级 lane）
  → 加入 fiber 的更新队列（环形链表）
  → 调度任务（scheduleUpdateOnFiber）
  → 调度器在合适的时机统一处理所有 update
  → 重新渲染
\`\`\`

## 三、更新队列：环形链表

React 中每个 fiber 节点都有一个更新队列 \`fiber.updateQueue\`，它是一个**环形链表**结构。为什么用环形链表？

### 生活类比：圆桌传菜

想象一张**圆桌**，服务员在传菜：

- **普通队列（直线）**：服务员从厨房出发，走到 1 号位放菜，再走到 2 号位……走到底要折返，效率低。
- **环形队列（圆桌）**：服务员站在圆桌旁，1 号位放完转到 2 号位，2 号位放完转到 3 号位……最后转回起点，不需要折返。

环形链表的好处是：

1. **O(1) 追加**：新 update 加在尾部（baseState 之前），只需修改两个指针
2. **O(1) 遍历**：从 head 开始，沿着 next 一定能走完所有节点
3. **无尾部指针**：尾部就是 head 的前一个节点，不需要单独维护 tail

\`\`\`
fiber.updateQueue 结构：

  baseState ──→ update1 ──→ update2 ──→ update3 ──┐
      ↑                                            │
      └────────────────────────────────────────────┘
                   (环形：最后一个的 next 指回 baseState 之前的位置)

实际实现中：
  updateQueue.shared.pending 指向最后一个 update
  最后一个 update.next 指向第一个 update
  形成环：
  
  pending ──→ update3 (最后)
       ↑           │
       │           ↓
       └── update1 (第一个) ←── update2
\`\`\`

## 四、update 对象的结构

每次调用 setState，React 会创建一个 update 对象：

\`\`\`javascript
// update 对象的简化结构
var update = {
  lane: lane,              // 优先级（Lane 模型）
  action: partialState,    // 要更新的状态（可以是对象或函数）
  eagerReducer: null,      // 优化用：如果多次 setState 用同一个 reducer，可以提前计算
  eagerState: null,        // 优化用：提前计算出的状态
  next: null,              // 指向下一个 update（环形链表）
};
\`\`\`

### 为什么 action 可以是函数？

React 支持**函数式更新**：

\`\`\`javascript
// 对象形式
this.setState({ count: this.state.count + 1 });

// 函数形式（推荐！）
this.setState(function (prevState) {
  return { count: prevState.count + 1 };
});
\`\`\`

函数形式的好处：它接收 \`prevState\` 作为参数，这样即使在一个事件处理函数中多次调用 setState，每次都能拿到**最新的状态**，不会因为批量更新而拿到过时的 state。

\`\`\`javascript
// 如果用对象形式，会有 bug：
this.setState({ count: this.state.count + 1 }); // 基于 state.count = 0，算出 1
this.setState({ count: this.state.count + 1 }); // 还是基于 state.count = 0，算出 1！
// 最终结果：count = 1（而不是期望的 2）

// 用函数形式，没问题：
this.setState(function (prev) { return { count: prev.count + 1 }; }); // 基于 0，算出 1
this.setState(function (prev) { return { count: prev.count + 1 }; }); // 基于上一次的 1，算出 2
// 最终结果：count = 2 ✅
\`\`\`

## 五、处理更新队列的流程

当 React 准备重新渲染组件时，会遍历更新队列：

\`\`\`
1. 取出 fiber.updateQueue
2. 从第一个 update 开始遍历
3. 对每个 update：
   a. 如果是对象 → Object.assign(baseState, update.action)
   b. 如果是函数 → baseState = update.action(baseState)
4. 遍历完所有 update 后，baseState 就是最终状态
5. 用新状态重新渲染
\`\`\`

### 优先级跳跃（Priority Interleaving）

Lane 模型下，不同优先级的更新可能交错。如果遍历到一个**比当前渲染优先级低**的 update，React 会跳过它，但会记录跳跃位置。等下次用更高优先级渲染时，再从跳跃位置重新处理。

这就像超市进货时，有些货是"急件"（高优先级），有些是"普通件"（低优先级）。先处理急件，普通件留到下一批。

## 六、Lane 模型简介

React 18 用 31 位的二进制数表示优先级，每一位代表一个"车道"：

\`\`\`javascript
// Lane 的简化表示（实际是 31 位）
var SyncLane =          0b00000001; // 同步优先级（最高）
var InputContinuousLane = 0b00000010; // 输入连续优先级
var DefaultLane =       0b00000100; // 默认优先级
var TransitionLane =    0b00001000; // Transition 优先级
var IdleLane =          0b10000000; // 空闲优先级（最低）
\`\`\`

用位运算可以快速判断优先级关系：

\`\`\`javascript
// 判断 lane A 是否比 lane B 优先级高
function isHigherPriority(laneA, laneB) {
  // 数值越小，优先级越高（最低位是最高优先级）
  return (laneA & laneB) !== 0 && laneA < laneB;
}
\`\`\`

### 为什么用二进制位而不是数字？

1. **一次可以处理多个优先级**：\`lanes = SyncLane | DefaultLane\` 表示同时有这两种优先级的更新
2. **位运算极快**：CPU 原生支持，比对象比较快几个数量级
3. **节省内存**：一个 32 位整数就能表示 31 种优先级

## 七、本章 Demo 说明

下面的 demo 会用代码模拟 setState 的完整流程：

1. 实现环形链表更新队列
2. 模拟 enqueueSetState（创建 update 对象并加入队列）
3. 模拟批量更新（遍历队列，合并所有更新）
4. 支持对象形式和函数形式的更新
5. 演示函数式更新如何解决"批量更新中的状态过时"问题

这个 demo 会让你直观理解：setState 不是"异步"，而是"批量收集 + 统一处理"。`,
    code: `// ============================================================
// 第十七章 demo：setState 更新流程 —— 批量更新与更新队列
// 演示内容：
//   1. 实现环形链表更新队列
//   2. 模拟 enqueueSetState（创建 update 对象并加入队列）
//   3. 模拟批量更新（遍历队列，合并所有更新）
//   4. 支持对象形式和函数形式的更新
//   5. 演示函数式更新如何解决"批量更新中的状态过时"问题
// ============================================================

console.log("=".repeat(60));                            // 打印分隔线
console.log("React 源码精读 — 第十七章：setState 更新流程"); // 打印章节标题
console.log("=".repeat(60));                            // 打印分隔线
console.log();                                          // 打印空行

// ===== 第一部分：实现更新队列（环形链表） =====
console.log("【第一部分：实现更新队列（环形链表）】");      // 打印小节标题

// 创建一个空的更新队列
// 对应 React 源码中的 initializeUpdateQueue
function createUpdateQueue() {
  // queue.shared.pending 指向环形链表的"最后一个"节点
  // 最后一个节点的 next 指向"第一个"节点，形成环
  // 初始时 pending 为 null，表示队列为空
  return {
    baseState: null,   // 基础状态（处理更新前的原始状态）
    firstBaseUpdate: null, // 第一个待处理的 base update
    lastBaseUpdate: null,  // 最后一个待处理的 base update
    shared: {
      pending: null,   // 环形链表的尾指针（指向最后一个 update）
    },
    effects: null,     // 副作用列表（如 callback）
  };
}

// 创建一个 update 对象
// 对应 React 源码中的 createUpdate
function createUpdate(action) {
  // action 就是要更新的内容：
  //   - 对象形式：{ count: 1 }
  //   - 函数形式：function(prevState) { return { count: prevState.count + 1 } }
  return {
    action: action,    // 更新动作（对象或函数）
    next: null,        // 指向下一个 update（环形链表用）
    lane: 1,           // 优先级（简化版，1 = 默认优先级）
  };
}

// 向更新队列中追加一个 update
// 对应 React 源码中的 enqueueUpdate
// 关键：这里用环形链表的尾插法
function enqueueUpdate(queue, update) {
  var pending = queue.shared.pending; // 获取当前的尾节点

  if (pending === null) {
    // 队列为空：update 自己指向自己，形成只有一个节点的环
    update.next = update;
  } else {
    // 队列不为空：
    // pending 是最后一个节点，pending.next 是第一个节点
    // 新节点要插在"最后"和"第一"之间
    update.next = pending.next; // 新节点的 next 指向第一个节点
    pending.next = update;      // 原来最后一个节点的 next 指向新节点
  }
  // 更新尾指针，让 pending 始终指向最后一个节点
  queue.shared.pending = update;
}

console.log("  更新队列、update 对象、enqueueUpdate 已定义");
console.log();                                          // 打印空行

// ===== 第二部分：模拟 setState =====
console.log("【第二部分：模拟 setState（enqueueSetState）】"); // 打印小节标题

// 模拟组件实例
var instance = {
  state: { count: 0, name: "React" }, // 初始状态
  updateQueue: createUpdateQueue(),   // 创建更新队列
};

// 模拟 setState
// 对应 React 源码中 classComponentUpdater.enqueueSetState
function setState(inst, partialState) {
  // 1. 创建 update 对象
  var update = createUpdate(partialState);
  // 2. 加入更新队列
  enqueueUpdate(inst.updateQueue, update);
  // 3. 标记需要重新渲染（真实 React 中会调用 scheduleUpdateOnFiber）
  console.log("  [setState] 已加入队列，action =", typeof partialState === "function" ? "(函数)" : JSON.stringify(partialState));
}

console.log("  初始 state:", JSON.stringify(instance.state));
console.log();                                          // 打印空行

// ===== 第三部分：模拟批量更新 =====
console.log("【第三部分：批量调用 setState，观察队列】");    // 打印小节标题

// 连续调用三次 setState —— 模拟在一个事件处理函数中多次调用
setState(instance, { count: 1 });                        // 对象形式
setState(instance, { name: "React 18" });                // 对象形式
setState(instance, { count: 2 });                        // 对象形式（会覆盖第一个）

// 打印队列中的所有 update
function printUpdateQueue(queue) {
  var pending = queue.shared.pending;
  if (pending === null) {
    console.log("  队列为空");
    return;
  }
  // pending 是最后一个节点，pending.next 是第一个节点
  var first = pending.next;
  var current = first;
  var i = 1;
  console.log("  队列中的 update：");
  do {
    var action = current.action;
    var actionStr = typeof action === "function" ? "(函数式更新)" : JSON.stringify(action);
    console.log("    update " + i + ": " + actionStr);
    current = current.next;
    i++;
  } while (current !== first);                          // 走一圈回到第一个就结束
}

printUpdateQueue(instance.updateQueue);                  // 打印队列
console.log();                                          // 打印空行

// ===== 第四部分：处理更新队列 =====
console.log("【第四部分：处理更新队列（processUpdateQueue）】"); // 打印小节标题

// 处理更新队列 —— 遍历所有 update，合并到 baseState
// 对应 React 源码中的 processUpdateQueue
function processUpdateQueue(queue) {
  var pending = queue.shared.pending;
  if (pending === null) {
    console.log("  队列为空，无需处理");
    return queue.baseState;
  }

  // 清空队列（取出后队列就空了）
  queue.shared.pending = null;

  // 从第一个 update 开始遍历
  var first = pending.next;
  var update = first;
  var newState = Object.assign({}, queue.baseState || {}); // 复制 baseState 作为起点

  console.log("  开始处理更新队列...");
  console.log("  初始 baseState:", JSON.stringify(newState));

  do {
    var action = update.action;
    if (typeof action === "function") {
      // 函数式更新：传入 prevState，返回新 state
      console.log("  处理函数式 update...");
      newState = Object.assign({}, newState, action(newState));
    } else {
      // 对象式更新：直接合并
      console.log("  处理对象式 update:", JSON.stringify(action));
      newState = Object.assign({}, newState, action);
    }
    console.log("    → 当前 state:", JSON.stringify(newState));
    update = update.next;
  } while (update !== first);                           // 走一圈回到第一个就结束

  // 更新 baseState
  queue.baseState = newState;
  console.log("  最终 baseState:", JSON.stringify(newState));
  return newState;
}

// 设置 baseState 为当前 instance.state
instance.updateQueue.baseState = Object.assign({}, instance.state);

// 处理队列
var newState = processUpdateQueue(instance.updateQueue);
instance.state = newState;                               // 更新实例的 state
console.log("  更新后的 instance.state:", JSON.stringify(instance.state));
console.log();                                          // 打印空行

// ===== 第五部分：函数式更新 vs 对象式更新 =====
console.log("【第五部分：函数式更新 vs 对象式更新】");      // 打印小节标题

// 创建两个实例来对比
var instanceA = { state: { count: 0 }, updateQueue: createUpdateQueue() };
var instanceB = { state: { count: 0 }, updateQueue: createUpdateQueue() };
instanceA.updateQueue.baseState = Object.assign({}, instanceA.state);
instanceB.updateQueue.baseState = Object.assign({}, instanceB.state);

console.log("  场景：连续两次 setState，每次 count + 1");
console.log("  初始 count =", instanceA.state.count);
console.log();

// 对象式更新（有 bug！）
console.log("  --- 对象式更新（基于过时的 state）---");
setState(instanceA, { count: instanceA.state.count + 1 }); // 基于 count=0，算出 1
setState(instanceA, { count: instanceA.state.count + 1 }); // 还是基于 count=0，算出 1！
var stateA = processUpdateQueue(instanceA.updateQueue);
console.log("  对象式更新结果: count =", stateA.count, "（期望 2，实际 1 ❌）");
console.log();

// 函数式更新（正确！）
console.log("  --- 函数式更新（基于最新的 prevState）---");
setState(instanceB, function (prev) { return { count: prev.count + 1 }; }); // 基于 0，算出 1
setState(instanceB, function (prev) { return { count: prev.count + 1 }; }); // 基于上一次的 1，算出 2
var stateB = processUpdateQueue(instanceB.updateQueue);
console.log("  函数式更新结果: count =", stateB.count, "（期望 2，实际 2 ✅）");
console.log();                                          // 打印空行

// ===== 第六部分：Lane 优先级模型演示 =====
console.log("【第六部分：Lane 优先级模型演示】");          // 打印小节标题

// Lane 的简化表示（实际是 31 位二进制）
var SyncLane = 1;            // 同步优先级（最高，数值最小）
var InputContinuousLane = 2; // 输入连续优先级
var DefaultLane = 4;         // 默认优先级
var TransitionLane = 8;      // Transition 优先级
var IdleLane = 64;           // 空闲优先级（最低，数值最大）

console.log("  Lane 优先级（数值越小，优先级越高）：");
console.log("    SyncLane:          ", SyncLane.toString(2).padStart(7, "0"), "(同步)");
console.log("    InputContinuousLane:", InputContinuousLane.toString(2).padStart(7, "0"), "(输入连续)");
console.log("    DefaultLane:       ", DefaultLane.toString(2).padStart(7, "0"), "(默认)");
console.log("    TransitionLane:    ", TransitionLane.toString(2).padStart(7, "0"), "(Transition)");
console.log("    IdleLane:          ", IdleLane.toString(2).padStart(7, "0"), "(空闲)");

// 用位运算合并多个 Lane
var combinedLanes = SyncLane | DefaultLane;
console.log("  SyncLane | DefaultLane =", combinedLanes.toString(2).padStart(7, "0"));
console.log("  包含 SyncLane 吗？", (combinedLanes & SyncLane) !== 0);     // true
console.log("  包含 IdleLane 吗？", (combinedLanes & IdleLane) !== 0);     // false
console.log();                                          // 打印空行

// ===== 总结 =====
console.log("【总结】");
console.log("  1. setState 不是异步，而是'批量收集 + 统一处理'");
console.log("  2. React 18 的 Automatic Batching 让所有场景都批量更新");
console.log("  3. 更新队列用环形链表实现，O(1) 追加和遍历");
console.log("  4. 函数式更新能解决批量更新中的状态过时问题");
console.log("  5. Lane 模型用二进制位表示优先级，支持位运算和批量优先级判断");`
  },

  // =========================================================
  // 第十八章：Hook 链表结构
  // =========================================================
  {
    id: "rs-hook-linkedlist",
    group: "第五部分 Hooks 系统",
    icon: "🔗",
    title: "Hook 链表结构：fiber.memoizedState 的秘密",
    content: `## 一、函数组件的状态存在哪里

类组件的状态存在 \`this.state\` 中，但函数组件没有 \`this\`，那 useState 的状态存在哪里？

答案：存在 \`fiber.memoizedState\` 指向的**单向链表**中。

### 生活类比：备忘录上的便签条

想象你在办公桌前工作，面前有一本**备忘录**（fiber 节点）：

- 类组件：你直接在备忘录的某一页写上状态（this.state）
- 函数组件：你在备忘录上贴一张张**便签条**（Hook 节点），每张便签条记录一个 Hook 的信息

每张便签条上有：

1. **这个 Hook 的状态值**（memoizedState）——比如 count 的当前值
2. **下一个便签条的位置**（next）——指向下一个 Hook
3. **这个 Hook 的更新队列**（queue）——如果有待处理的更新

便签条按你调用 Hook 的顺序排列，形成一条链：

\`\`\`
fiber.memoizedState
      ↓
  ┌───────────┐     ┌───────────┐     ┌───────────┐
  │ useState  │────→│ useEffect │────→│ useMemo   │
  │ count: 0  │     │ effect    │     │ value: x  │
  │ queue:...│     │ deps:[..] │     │ deps:[..] │
  └───────────┘     └───────────┘     └───────────┘
\`\`\`

## 二、为什么是链表而不是数组

你可能会问：为什么不用数组存 Hook？数组按下标访问不是更快吗？

原因有三个：

### 1. 链表更灵活地处理"可变数量"的 Hook

虽然 React 规定**不能在条件分支中调用 Hook**，但不同组件的 Hook 数量和类型不同。链表不需要预分配内存，每个 Hook 节点的大小可以不同（useEffect 的节点比 useState 大，因为要存 deps 和 cleanup）。

### 2. 链表天然支持"部分复用"

React 渲染分两个阶段：mount（首次）和 update（更新）。更新时，React 需要把"上一次的 Hook"和"这次的 Hook"对应起来。链表的 \`next\` 指针让这个对应过程变成简单的"同时向前走一步"。

### 3. 链表更适合 Fiber 架构

Fiber 节点本身就是树/链表结构。Hook 用链表存储，与 Fiber 的数据结构一致，方便 React 在渲染过程中暂停、恢复、回滚。

## 三、Hook 节点的结构

每个 Hook 在源码中是一个对象：

\`\`\`javascript
// Hook 对象的简化结构
var hook = {
  memoizedState: null,   // 当前 Hook 的状态值
  baseState: null,       // 基础状态（处理更新前的值）
  baseQueue: null,       // 待处理的更新队列（环形链表）
  queue: null,           // 更新队列（useState 专属）
  next: null,            // 指向下一个 Hook
};
\`\`\`

不同类型的 Hook，\`memoizedState\` 存储的内容不同：

| Hook | memoizedState 存什么 |
|------|---------------------|
| useState | 状态值（如 \`0\`） |
| useReducer | 状态值 |
| useEffect | effect 对象（包含 create、destroy、deps） |
| useRef | \`{ current: initialValue }\` |
| useMemo | \`[value, deps]\` |
| useCallback | \`[callback, deps]\` |
| useLayoutEffect | effect 对象（与 useEffect 结构相同，但执行时机不同） |

## 四、核心全局变量

React 在渲染函数组件时，会用到三个关键的全局变量（在源码中是模块级变量）：

\`\`\`javascript
// 当前正在渲染的 fiber 节点
var currentlyRenderingFiber = null;

// 当前正在处理的 Hook（work-in-progress hook）
var workInProgressHook = null;

// 当前 fiber 对应的上一次的 Hook（current hook，用于复用）
var currentHook = null;
\`\`\`

### 生活类比：装修验收

想象你是**装修验收员**（React），要检查一套房子的装修：

- **currentlyRenderingFiber** = 当前正在验收的**房子**（当前 fiber 节点）
- **currentHook** = **上一份验收报告**（上一次渲染的 Hook 链表），用来对比
- **workInProgressHook** = **当前正在写的那一页验收报告**（正在构建的新 Hook 链表）

验收流程：

1. 走到一套房子（设置 currentlyRenderingFiber）
2. 翻开上一份验收报告（currentHook 指向上次的 Hook 链表）
3. 逐项检查：每检查一项，就在新报告上写一页（workInProgressHook），同时翻到旧报告的下一页（currentHook.next）
4. 检查完毕，新报告替换旧报告

## 五、renderWithHooks：函数组件的渲染入口

React 渲染函数组件的入口是 \`renderWithHooks\`：

\`\`\`javascript
// React 源码简化版
function renderWithHooks(fiber, component, props) {
  currentlyRenderingFiber = fiber;     // 设置当前 fiber
  workInProgressHook = null;           // 重置 work-in-progress hook
  currentHook = null;                  // 重置 current hook（关键！从头开始遍历）

  // 判断是 mount 还是 update
  var isFirstRender = fiber.memoizedState === null;

  // 根据 mount/update 设置不同的 Hook 分发器
  // mount 时用 mountState/mountEffect，update 时用 updateState/updateEffect
  ReactCurrentDispatcher.current = isFirstRender
    ? HooksDispatcherOnMount
    : HooksDispatcherOnUpdate;

  // 调用函数组件，内部会调用各种 Hook
  var children = component(props);

  // 恢复空的 dispatcher
  ReactCurrentDispatcher.current = {};

  return children;
}
\`\`\`

注意 \`currentHook = null\` 的位置——它在函数**开头**重置，而不是在结尾设置。这样下一次渲染时，\`updateWorkInProgressHook\` 会从 \`fiber.memoizedState\`（链表头）开始遍历，而不是从上次结束的位置继续。

## 六、updateWorkInProgressHook：连接新旧 Hook

这是最核心的函数——它负责在渲染过程中"走到下一个 Hook"，并把旧 Hook 的状态复制到新 Hook：

\`\`\`javascript
function updateWorkInProgressHook() {
  var nextCurrentHook;
  if (currentHook === null) {
    // 第一次调用：从 fiber.memoizedState 取链表头
    nextCurrentHook = currentlyRenderingFiber.memoizedState;
  } else {
    // 后续调用：取 currentHook.next
    nextCurrentHook = currentHook.next;
  }

  // 创建新的 work-in-progress hook
  var newHook = {
    memoizedState: nextCurrentHook ? nextCurrentHook.memoizedState : null,
    queue: nextCurrentHook ? nextCurrentHook.queue : null,
    next: null,
  };

  if (workInProgressHook === null) {
    // 第一个 Hook：链表头直接挂在 fiber 上
    currentlyRenderingFiber.memoizedState = newHook;
  } else {
    // 后续 Hook：追加到链表尾部
    workInProgressHook.next = newHook;
  }
  workInProgressHook = newHook;     // 移动指针
  currentHook = nextCurrentHook;     // 移动 current 指针

  return newHook;
}
\`\`\`

### 为什么不能在条件分支中调用 Hook？

因为 \`updateWorkInProgressHook\` 是**按顺序**遍历链表的。如果你在条件分支中调用 Hook，mount 和 update 时的调用顺序可能不同，导致 Hook 链表错位：

\`\`\`javascript
// 错误示例！
function Bad(props) {
  if (props.show) {
    var [a, setA] = useState(0); // Hook 1
  }
  var [b, setB] = useState(0);   // Hook 2（或 Hook 1？取决于 props.show）
}
\`\`\`

如果第一次 \`props.show = true\`，链表是 \`[a, b]\`；第二次 \`props.show = false\`，React 从链表头开始取，取到的第一个 Hook 应该是 \`a\`，但实际调用的是 \`b\`。这就导致状态错乱。

## 七、mount vs update 的 Dispatcher 模式

React 用**分发器模式**来区分 mount 和 update：

\`\`\`javascript
// mount 时的 dispatcher
var HooksDispatcherOnMount = {
  useState: function (initialValue) {
    return mountState(initialValue);
  },
  useEffect: function (create, deps) {
    return mountEffect(create, deps);
  },
};

// update 时的 dispatcher
var HooksDispatcherOnUpdate = {
  useState: function (initialValue) {
    return updateState(initialValue);
  },
  useEffect: function (create, deps) {
    return updateEffect(create, deps);
  },
};
\`\`\`

当你在函数组件中写 \`useState(0)\` 时，实际调用的是 \`ReactCurrentDispatcher.current.useState\`。React 在 \`renderWithHooks\` 中根据 mount/update 设置不同的 dispatcher，这样同一个 \`useState\` 调用会走到不同的实现。

### 为什么用 dispatcher 模式？

1. **调用方无感知**：开发者写的 \`useState\` 代码不需要区分 mount/update
2. **避免 if 判断开销**：不需要在每次 Hook 调用时判断是 mount 还是 update
3. **方便扩展**：可以轻松添加新的 dispatcher（如 rerender、error 场景）

## 八、本章 Demo 说明

下面的 demo 会用代码模拟 Hook 链表的核心机制：

1. 实现全局变量（currentlyRenderingFiber、workInProgressHook、currentHook）
2. 实现 renderWithHooks（设置全局变量、调用组件函数）
3. 实现 updateWorkInProgressHook（连接新旧 Hook 链表）
4. 实现简化的 mountState 和 updateState
5. 演示多次渲染时 Hook 链表的复用

这个 demo 会让你直观看到：函数组件的状态确实存在 fiber.memoizedState 的链表里。`,
    code: `// ============================================================
// 第十八章 demo：Hook 链表结构 —— fiber.memoizedState 的秘密
// 演示内容：
//   1. 实现全局变量（currentlyRenderingFiber、workInProgressHook、currentHook）
//   2. 实现 renderWithHooks（设置全局变量、调用组件函数）
//   3. 实现 updateWorkInProgressHook（连接新旧 Hook 链表）
//   4. 实现简化的 mountState 和 updateState
//   5. 演示多次渲染时 Hook 链表的复用
// ============================================================

console.log("=".repeat(60));                            // 打印分隔线
console.log("React 源码精读 — 第十八章：Hook 链表结构");    // 打印章节标题
console.log("=".repeat(60));                            // 打印分隔线
console.log();                                          // 打印空行

// ===== 第一部分：全局变量 =====
console.log("【第一部分：全局变量（渲染上下文）】");        // 打印小节标题

// 当前正在渲染的 fiber 节点
// 对应 React 源码中的 currentlyRenderingFiber
var currentlyRenderingFiber = null;

// 当前正在处理的 Hook（work-in-progress）
// 对应 React 源码中的 workInProgressHook
var workInProgressHook = null;

// 当前 fiber 对应的上一次渲染的 Hook（用于复用）
// 对应 React 源码中的 currentHook
var currentHook = null;

console.log("  currentlyRenderingFiber =", currentlyRenderingFiber); // null
console.log("  workInProgressHook =", workInProgressHook);           // null
console.log("  currentHook =", currentHook);                         // null
console.log();                                          // 打印空行

// ===== 第二部分：创建 fiber 节点 =====
console.log("【第二部分：创建 fiber 节点】");              // 打印小节标题

// fiber 节点的简化结构
function createFiber() {
  return {
    memoizedState: null, // Hook 链表的头指针（初始为 null）
    type: null,          // 组件类型
    props: {},           // 组件属性
  };
}

var fiber = createFiber();                               // 创建一个 fiber
console.log("  fiber 已创建，memoizedState =", fiber.memoizedState); // null
console.log();                                          // 打印空行

// ===== 第三部分：updateWorkInProgressHook =====
console.log("【第三部分：updateWorkInProgressHook（核心函数）】"); // 打印小节标题

// 这个函数负责"走到下一个 Hook"，并把旧 Hook 的状态复制到新 Hook
// 对应 React 源码中的 updateWorkInProgressHook
function updateWorkInProgressHook() {
  var nextCurrentHook;

  if (currentHook === null) {
    // 第一次调用：从 fiber.memoizedState 取链表头
    // 这是上一次渲染保存的 Hook 链表
    nextCurrentHook = currentlyRenderingFiber.memoizedState;
  } else {
    // 后续调用：取 currentHook.next
    nextCurrentHook = currentHook.next;
  }

  // 创建新的 work-in-progress hook
  var newHook = {
    memoizedState: null,   // 当前 Hook 的状态值
    queue: null,           // 更新队列
    next: null,            // 指向下一个 Hook
  };

  if (nextCurrentHook !== null) {
    // 如果有对应的旧 Hook，复制状态和队列
    newHook.memoizedState = nextCurrentHook.memoizedState;
    newHook.queue = nextCurrentHook.queue;
  }

  if (workInProgressHook === null) {
    // 第一个 Hook：链表头直接挂在 fiber 上
    currentlyRenderingFiber.memoizedState = newHook;
  } else {
    // 后续 Hook：追加到链表尾部
    workInProgressHook.next = newHook;
  }

  // 移动指针
  workInProgressHook = newHook;       // workInProgress 指向新创建的 Hook
  currentHook = nextCurrentHook;      // current 指向对应的旧 Hook

  return newHook;
}

console.log("  updateWorkInProgressHook 已定义");
console.log();                                          // 打印空行

// ===== 第四部分：mountState 和 updateState =====
console.log("【第四部分：mountState 和 updateState】");    // 打印小节标题

// mountState：首次渲染时调用
// 对应 React 源码中的 mountState
function mountState(initialValue) {
  // 1. 创建一个新的 Hook 节点（通过 updateWorkInProgressHook）
  var hook = updateWorkInProgressHook();

  // 2. 处理初始值
  // initialValue 可以是值，也可以是函数（lazy initialization）
  if (typeof initialValue === "function") {
    hook.memoizedState = initialValue();
  } else {
    hook.memoizedState = initialValue;
  }

  // 3. 创建更新队列
  hook.queue = {
    pending: null,       // 环形链表的尾指针
    lastRenderedState: hook.memoizedState, // 上次渲染时的状态（用于 bailout 优化）
  };

  // 4. 返回 [state, dispatchAction]
  var state = hook.memoizedState;
  var dispatch = function (action) {
    // 简化版 dispatchAction：把 action 加入队列
    var update = { action: action, next: null };
    var pending = hook.queue.pending;
    if (pending === null) {
      update.next = update; // 自己指向自己，形成单节点环
    } else {
      update.next = pending.next;
      pending.next = update;
    }
    hook.queue.pending = update;
  };

  return [state, dispatch];
}

// updateState：更新渲染时调用
// 对应 React 源码中的 updateState（实际是 updateReducer 的简化版）
function updateState(initialValue) {
  // 1. 获取当前 Hook（复用上次的 Hook 节点）
  var hook = updateWorkInProgressHook();

  // 2. 处理更新队列
  var queue = hook.queue;
  var pending = queue.pending;

  if (pending !== null) {
    // 有待处理的更新
    var first = pending.next;
    var update = first;
    var newState = hook.memoizedState;

    do {
      var action = update.action;
      if (typeof action === "function") {
        // 函数式更新：传入 prevState，返回新 state
        newState = action(newState);
      } else {
        // 直接赋值：action 就是新值（支持原始类型和对象）
        newState = action;
      }
      update = update.next;
    } while (update !== first);

    // 清空队列
    queue.pending = null;
    // 更新状态
    hook.memoizedState = newState;
    queue.lastRenderedState = newState;
  }

  return [hook.memoizedState, function (action) {
    var update = { action: action, next: null };
    var pending = hook.queue.pending;
    if (pending === null) {
      update.next = update;
    } else {
      update.next = pending.next;
      pending.next = update;
    }
    hook.queue.pending = update;
  }];
}

console.log("  mountState 和 updateState 已定义");
console.log();                                          // 打印空行

// ===== 第五部分：renderWithHooks =====
console.log("【第五部分：renderWithHooks（渲染入口）】");   // 打印小节标题

// Hook 分发器 —— 决定调用 mount 还是 update 版本
var dispatcher = {
  useState: null, // 会在 renderWithHooks 中设置
};

// renderWithHooks：渲染函数组件的入口
// 对应 React 源码中的 renderWithHooks
function renderWithHooks(fiber, componentFn, props) {
  // 设置全局变量
  currentlyRenderingFiber = fiber;
  workInProgressHook = null;
  // 关键修复：在开头重置 currentHook，让 updateWorkInProgressHook 从链表头开始遍历
  // 不能在结尾设置 currentHook = isFirstRender ? null : fiber.memoizedState
  // 那会导致下次渲染时跳过第一个 Hook
  currentHook = null;

  // 判断是 mount 还是 update
  var isFirstRender = fiber.memoizedState === null;

  // 设置 dispatcher
  if (isFirstRender) {
    dispatcher.useState = function (initialValue) {
      return mountState(initialValue);
    };
  } else {
    dispatcher.useState = function (initialValue) {
      return updateState(initialValue);
    };
  }

  console.log("  [" + (isFirstRender ? "mount" : "update") + "] 开始渲染...");

  // 调用函数组件
  // 组件内部调用 useState 时，会通过 dispatcher.useState 走到 mountState 或 updateState
  var children = componentFn(props);

  // 渲染结束后，fiber.memoizedState 已经指向了新的 Hook 链表
  console.log("  渲染完成，Hook 链表已" + (isFirstRender ? "创建" : "更新"));

  return children;
}

console.log("  renderWithHooks 已定义");
console.log();                                          // 打印空行

// ===== 第六部分：演示多次渲染 =====
console.log("【第六部分：演示多次渲染（mount → update → update）】"); // 打印小节标题

// 定义一个函数组件，使用两个 useState
var renderCount = 0;                                    // 渲染次数计数
function MyComponent(props) {
  renderCount++;
  var countState = dispatcher.useState(0);              // Hook 1
  var nameState = dispatcher.useState("React");         // Hook 2
  console.log("    渲染 #" + renderCount + ": count=" + countState[0] + ", name=" + nameState[0]);
  return { count: countState[0], name: nameState[0] };
}

// 第一次渲染（mount）
console.log("  --- 第一次渲染（mount）---");
var result1 = renderWithHooks(fiber, MyComponent, {});
console.log("  结果:", JSON.stringify(result1));

// 打印 Hook 链表
function printHookChain(fiber) {
  var hook = fiber.memoizedState;
  var i = 1;
  console.log("  当前 Hook 链表：");
  while (hook !== null) {
    console.log("    Hook " + i + ": memoizedState =", JSON.stringify(hook.memoizedState));
    hook = hook.next;
    i++;
  }
}
printHookChain(fiber);
console.log();                                          // 打印空行

// 第二次渲染（update）—— 修改状态
console.log("  --- 第二次渲染（update）---");
// 先通过 dispatch 修改状态
var countHook = fiber.memoizedState;                    // 第一个 Hook
countHook.queue.pending = {                             // 模拟 dispatchAction
  action: 10,
  next: null,
};
countHook.queue.pending.next = countHook.queue.pending; // 形成环

var result2 = renderWithHooks(fiber, MyComponent, {});
console.log("  结果:", JSON.stringify(result2));
printHookChain(fiber);
console.log();                                          // 打印空行

// 第三次渲染（update）
console.log("  --- 第三次渲染（update）---");
// 再次修改状态
var countHook2 = fiber.memoizedState;
countHook2.queue.pending = {
  action: function (prev) { return prev + 5; },
  next: null,
};
countHook2.queue.pending.next = countHook2.queue.pending;

var result3 = renderWithHooks(fiber, MyComponent, {});
console.log("  结果:", JSON.stringify(result3));
printHookChain(fiber);
console.log();                                          // 打印空行

// ===== 第七部分：验证 Hook 顺序的重要性 =====
console.log("【第七部分：验证 Hook 顺序的重要性】");        // 打印小节标题
console.log("  Hook 必须按相同顺序调用，否则链表会错位");
console.log("  React 的 eslint-plugin-react-hooks 会检查这个规则");
console.log();                                          // 打印空行

// ===== 总结 =====
console.log("【总结】");
console.log("  1. 函数组件的状态存在 fiber.memoizedState 指向的单向链表中");
console.log("  2. 每个 Hook 是链表的一个节点，包含 memoizedState、queue、next");
console.log("  3. updateWorkInProgressHook 负责连接新旧 Hook，按顺序复用");
console.log("  4. mount 和 update 用 dispatcher 模式区分，调用方无感知");
console.log("  5. currentHook 必须在 renderWithHooks 开头重置为 null");`
  },

  // =========================================================
  // 第十九章：useState 源码精读
  // =========================================================
  {
    id: "rs-usestate",
    group: "第五部分 Hooks 系统",
    icon: "⚡",
    title: "useState 源码精读：dispatchAction 与环形队列",
    content: `## 一、useState 的全貌

\`useState\` 是最常用的 Hook，但它的源码实现比看起来复杂得多。一个 \`useState\` 调用，背后涉及：

1. **mountState**：首次渲染时初始化状态
2. **updateReducer**：更新渲染时处理更新队列（useState 内部用的是 useReducer）
3. **dispatchAction**：\`setState\` 函数的实际实现，负责创建 update 并加入队列

### 生活类比：银行账户

把 useState 想象成你的**银行账户**：

- **mountState** = 开户：银行给你建一个账户，初始余额是你的 initialValue
- **dispatchAction** = 存款/取款：你每次操作，银行不会立刻改余额，而是记在**流水**上（update 队列）
- **updateReducer** = 结账：银行定期处理流水，算出最新余额

关键点：你的"操作"（dispatchAction）和"结账"（updateReducer）是**分离**的。这就是为什么 setState 是"异步"的——你只是往流水上记了一笔，银行还没结账。

## 二、mountState 详解

首次渲染时，\`useState\` 走 \`mountState\`：

\`\`\`javascript
function mountState(initialValue) {
  // 1. 创建 Hook 节点，挂到 fiber.memoizedState 链表上
  var hook = mountWorkInProgressHook();

  // 2. 处理初始值（支持函数形式，即 lazy initialization）
  if (typeof initialValue === "function") {
    initialValue = initialValue();
  }
  hook.memoizedState = initialValue;
  hook.baseState = initialValue;

  // 3. 创建更新队列
  // queue 是一个对象，pending 指向环形链表的最后一个 update
  hook.queue = {
    pending: null,             // 环形链表尾指针
    interleaved: null,         // 交错更新（并发模式用）
    lanes: NoLanes,            // 优先级
    dispatch: null,            // dispatch 函数（下面会赋值）
    lastRenderedState: initialValue, // 上次渲染的状态（用于 bailout 优化）
  };

  // 4. 创建 dispatch 函数
  // dispatchAction.bind(null, currentlyRenderingFiber, hook.queue)
  // 注意：dispatch 是绑定了 fiber 和 queue 的，所以每次调用不需要传这些
  var dispatch = dispatchAction.bind(null, currentlyRenderingFiber, hook.queue);
  hook.queue.dispatch = dispatch;

  // 5. 返回 [state, dispatch]
  return [hook.memoizedState, dispatch];
}
\`\`\`

### lazy initialization（惰性初始化）

\`useState\` 支持传入函数作为初始值：

\`\`\`javascript
// 直接传值 —— 每次渲染都会计算 initialValue（即使只在 mount 时用）
useState(expensiveComputation());

// 传函数 —— 只在 mount 时调用一次
useState(function () { return expensiveComputation(); });
\`\`\`

为什么这很重要？因为 \`expensiveComputation()\` 在每次渲染时都会执行（即使结果被忽略），浪费性能。用函数形式，React 只在 mount 时调用一次。

## 三、dispatchAction 详解

当你调用 \`setCount(1)\` 时，实际调用的是 \`dispatchAction\`：

\`\`\`javascript
function dispatchAction(fiber, queue, action) {
  // 1. 创建 update 对象
  var update = {
    lane: requestUpdateLane(), // 获取当前优先级
    action: action,            // 你传入的值或函数
    eagerReducer: null,        // 优化用
    eagerState: null,          // 优化用
    next: null,                // 环形链表指针
  };

  // 2. 加入队列（环形链表尾插法）
  var pending = queue.pending;
  if (pending === null) {
    // 队列为空：update 自己成环
    update.next = update;
  } else {
    // 队列非空：插在第一个和最后一个之间
    update.next = pending.next;
    pending.next = update;
  }
  queue.pending = update;

  // 3. eagerState 优化（提前计算）
  // 如果当前没有其他更新，且 reducer 是已知的（useState 的 reducer 就是基础赋值）
  // 可以提前计算新状态，避免调度后还要等渲染才知道结果
  var lastRenderedReducer = queue.lastRenderedReducer;
  if (lastRenderedReducer !== null) {
    var prevState = queue.lastRenderedState;
    var eagerState = lastRenderedReducer(prevState, action);
    update.eagerReducer = lastRenderedReducer;
    update.eagerState = eagerState;
    // 如果新状态和旧状态一样（Object.is 比较），可以跳过调度！
    if (Object.is(eagerState, prevState)) {
      return; // bailout 优化：状态没变，不需要重新渲染
    }
  }

  // 4. 调度更新
  scheduleUpdateOnFiber(fiber, lane);
}
\`\`\`

### 环形队列的精妙之处

为什么用环形链表而不是普通队列？

1. **O(1) 追加**：只需要改两个指针（pending.next 和 update.next）
2. **O(1) 取第一个**：\`pending.next\` 就是第一个 update
3. **不需要维护 head 和 tail**：pending 既是尾，pending.next 就是头

\`\`\`
空队列：
  pending = null

加入 update1：
  pending → update1
  update1.next → update1 (自己成环)

加入 update2：
  pending → update2 (尾)
  update2.next → update1 (头)
  update1.next → update2

加入 update3：
  pending → update3 (尾)
  update3.next → update1 (头)
  update1.next → update2
  update2.next → update3

遍历：从 pending.next（update1）开始，沿着 next 走，回到起点结束
\`\`\`

## 四、updateReducer（useState 的更新逻辑）

\`useState\` 内部其实是 \`useReducer\`，它的 reducer 是：

\`\`\`javascript
// useState 的默认 reducer
function basicStateReducer(state, action) {
  if (typeof action === "function") {
    return action(state); // 函数式更新
  }
  return action;          // 直接赋值
}
\`\`\`

更新渲染时，\`updateReducer\` 处理队列：

\`\`\`javascript
function updateReducer(reducer, initialValue) {
  var hook = updateWorkInProgressHook();
  var queue = hook.queue;

  // 取出待处理的更新
  var pending = queue.pending;
  var first = pending.next;
  var update = first;

  var newState = hook.memoizedState;
  do {
    // 用 reducer 计算新状态
    newState = reducer(newState, update.action);
    update = update.next;
  } while (update !== first);

  // 清空队列
  queue.pending = null;
  // 更新状态
  hook.memoizedState = newState;
  queue.lastRenderedState = newState;

  return [hook.memoizedState, queue.dispatch];
}
\`\`\`

### 为什么 useState 用 useReducer 实现？

这是 React 源码中的一个设计决策。useState 和 useReducer 本质上是同一种 Hook——都是"状态 + 更新队列"。useState 只是 useReducer 的一个特例：

- useState 的 reducer 是 \`basicStateReducer\`（直接赋值或执行函数）
- useState 的 dispatch 就是 useReducer 的 dispatch

这样复用可以：

1. **减少代码重复**：不需要为 useState 单独写一套更新逻辑
2. **统一优化**：bailout、eagerState 等优化只需在一处实现
3. **一致性**：useState 和 useReducer 的行为完全一致（如批量更新、优先级）

## 五、bailout 优化：状态没变就不渲染

React 有一个重要优化：如果 setState 后的新状态和旧状态**完全相等**（用 \`Object.is\` 比较），React 会跳过这个组件的重新渲染。这就是 \`bailout\`（ bailout 意为"跳过"）。

\`\`\`javascript
// 这个不会触发重新渲染！
const [count, setCount] = useState(0);
setCount(0); // Object.is(0, 0) === true，跳过

// 这个也不会
const [obj, setObj] = useState({ a: 1 });
setObj({ a: 1 }); // 虽然内容一样，但 Object.is({a:1}, {a:1}) === false，会触发！
// 因为 Object.is 比较的是引用，不是内容
\`\`\`

### 为什么用 Object.is 而不是 ===？

\`Object.is\` 和 \`===\` 的区别在于处理 \`NaN\` 和 \`+0/-0\`：

\`\`\`javascript
NaN === NaN      // false
Object.is(NaN, NaN) // true ✅

+0 === -0        // true
Object.is(+0, -0) // false ✅
\`\`\`

React 用 \`Object.is\` 是为了更"直觉"的比较——\`NaN\` 等于 \`NaN\` 更符合预期。

## 六、eagerState 优化：提前计算

在 \`dispatchAction\` 中有一个 \`eagerState\` 优化：

如果当前队列中没有其他待处理更新，React 会**立刻**用 reducer 计算新状态，并和旧状态比较。如果相同，直接 return，不调度重新渲染。

\`\`\`javascript
// 简化的 eagerState 逻辑
if (queue.pending === null) {  // 没有其他更新
  var prevState = queue.lastRenderedState;
  var eagerState = basicStateReducer(prevState, action);
  if (Object.is(eagerState, prevState)) {
    return; // 状态没变，不需要渲染！
  }
}
\`\`\`

这个优化避免了"setState 相同值时仍然调度一次渲染"的开销。

### 为什么只在队列空时才优化？

因为如果有其他待处理更新，当前 action 的结果可能被后续 update 覆盖。比如：

\`\`\`javascript
setCount(1);  // update1
setCount(0);  // update2 —— 如果单独看，和初始值 0 相同
// 但实际最终结果是 0（被 update1 覆盖后又变成 0）
// 如果对 update2 做 eagerState 优化，会误判为"没变化"
\`\`\`

所以只有队列空时，eagerState 的计算才是可靠的。

## 七、本章 Demo 说明

下面的 demo 会用代码模拟 useState 的完整流程：

1. 实现 dispatchAction（含环形队列和 eagerState 优化）
2. 实现 mountState 和 updateState
3. 演示 bailout 优化（设置相同值不触发渲染）
4. 演示函数式更新
5. 对比有/无 eagerState 优化的行为

这个 demo 会让你直观理解：useState 不是一个简单的"变量赋值"，而是一套完整的更新调度系统。`,
    code: `// ============================================================
// 第十九章 demo：useState 源码精读 —— dispatchAction 与环形队列
// 演示内容：
//   1. 实现 dispatchAction（含环形队列和 eagerState 优化）
//   2. 实现 mountState 和 updateState
//   3. 演示 bailout 优化（设置相同值不触发渲染）
//   4. 演示函数式更新
//   5. 对比有/无 eagerState 优化的行为
// ============================================================

console.log("=".repeat(60));                            // 打印分隔线
console.log("React 源码精读 — 第十九章：useState 源码精读"); // 打印章节标题
console.log("=".repeat(60));                            // 打印分隔线
console.log();                                          // 打印空行

// ===== 第一部分：全局变量和基础设施 =====
console.log("【第一部分：全局变量和基础设施】");            // 打印小节标题

// 当前正在渲染的 fiber
var currentlyRenderingFiber = null;
// 当前正在处理的 Hook
var workInProgressHook = null;
// 上一次渲染的 Hook（用于复用）
var currentHook = null;

// 渲染调度计数器（模拟 scheduleUpdateOnFiber）
var renderScheduled = 0;
function scheduleUpdateOnFiber(fiber, lane) {
  renderScheduled++;
  console.log("    [scheduleUpdateOnFiber] 已调度第 " + renderScheduled + " 次渲染");
}

console.log("  全局变量和调度函数已定义");
console.log();                                          // 打印空行

// ===== 第二部分：dispatchAction（核心！） =====
console.log("【第二部分：dispatchAction（setState 的真身）】"); // 打印小节标题

// basicStateReducer：useState 的默认 reducer
// 对应 React 源码中的 basicStateReducer
function basicStateReducer(state, action) {
  if (typeof action === "function") {
    // 函数式更新：action 是函数，传入 prevState 返回新 state
    return action(state);
  }
  // 直接赋值：action 就是新值
  return action;
}

// Object.is 的 polyfill（Node.js 有内置的，这里为了演示逻辑）
// React 源码中用 Object.is 来比较状态
function is(x, y) {
  if (x === y) {
    // 处理 +0 和 -0
    return x !== 0 || 1 / x === 1 / y;
  }
  // 处理 NaN
  return x !== x && y !== y;
}

// dispatchAction：setState 函数的实际实现
// 对应 React 源码中的 dispatchAction
// 参数：fiber（组件对应的 fiber）、queue（Hook 的更新队列）、action（新值或函数）
function dispatchAction(fiber, queue, action) {
  console.log("  [dispatchAction] 收到更新请求，action =", typeof action === "function" ? "(函数)" : JSON.stringify(action));

  // 1. 创建 update 对象
  var update = {
    action: action,     // 更新内容（值或函数）
    next: null,         // 环形链表指针
    eagerState: null,   // eagerState 优化用
    hasEagerState: false, // 是否已经计算了 eagerState
  };

  // 2. 加入队列（环形链表尾插法）
  var pending = queue.pending;
  if (pending === null) {
    // 队列为空：update 自己成环
    update.next = update;
  } else {
    // 队列非空：插在第一个和最后一个之间
    update.next = pending.next; // 新节点的 next 指向第一个
    pending.next = update;      // 原尾节点的 next 指向新节点
  }
  queue.pending = update; // 更新尾指针

  // 3. eagerState 优化
  // 如果队列在这之前是空的（即这是唯一的更新），可以提前计算
  if (pending === null) {
    // 队列之前是空的，现在只有这一个 update
    var prevState = queue.lastRenderedState;
    // 用 reducer 提前计算新状态
    var eagerState = basicStateReducer(prevState, action);
    update.hasEagerState = true;
    update.eagerState = eagerState;

    // bailout 检查：如果新状态和旧状态完全相等，跳过调度！
    if (is(eagerState, prevState)) {
      console.log("    [bailout] 新状态和旧状态相同，跳过渲染！");
      return; // 不调度重新渲染
    }
  }

  // 4. 调度重新渲染
  scheduleUpdateOnFiber(fiber, 1);
}

console.log("  dispatchAction 已定义");
console.log();                                          // 打印空行

// ===== 第三部分：mountState 和 updateState =====
console.log("【第三部分：mountState 和 updateState】");    // 打印小节标题

// updateWorkInProgressHook：走到下一个 Hook
function updateWorkInProgressHook() {
  var nextCurrentHook;
  if (currentHook === null) {
    nextCurrentHook = currentlyRenderingFiber.memoizedState;
  } else {
    nextCurrentHook = currentHook.next;
  }

  var newHook = {
    memoizedState: null,
    queue: null,
    next: null,
  };

  if (nextCurrentHook !== null) {
    newHook.memoizedState = nextCurrentHook.memoizedState;
    newHook.queue = nextCurrentHook.queue;
  }

  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = newHook;
  } else {
    workInProgressHook.next = newHook;
  }

  workInProgressHook = newHook;
  currentHook = nextCurrentHook;
  return newHook;
}

// mountState：首次渲染时的 useState
function mountState(initialValue) {
  var hook = updateWorkInProgressHook();

  // 处理初始值（支持函数形式）
  if (typeof initialValue === "function") {
    hook.memoizedState = initialValue();
  } else {
    hook.memoizedState = initialValue;
  }

  // 创建更新队列
  hook.queue = {
    pending: null,
    lastRenderedState: hook.memoizedState, // 用于 bailout 比较
    dispatch: null,
  };

  // 创建 dispatch 函数（绑定 fiber 和 queue）
  var dispatch = dispatchAction.bind(null, currentlyRenderingFiber, hook.queue);
  hook.queue.dispatch = dispatch;

  return [hook.memoizedState, dispatch];
}

// updateState：更新渲染时的 useState
// 内部调用 updateReducer，reducer 是 basicStateReducer
function updateState(initialValue) {
  return updateReducer(basicStateReducer, initialValue);
}

// updateReducer：处理更新队列
function updateReducer(reducer, initialValue) {
  var hook = updateWorkInProgressHook();
  var queue = hook.queue;

  var pending = queue.pending;

  if (pending !== null) {
    // 有待处理的更新，遍历队列
    var first = pending.next;
    var update = first;
    var newState = hook.memoizedState;

    console.log("    [updateReducer] 开始处理更新队列...");
    do {
      var action = update.action;
      // 如果有 eagerState，直接用（避免重复计算）
      if (update.hasEagerState) {
        newState = update.eagerState;
        console.log("    使用 eagerState:", JSON.stringify(newState));
      } else {
        newState = reducer(newState, action);
        console.log("    用 reducer 计算，新 state:", JSON.stringify(newState));
      }
      update = update.next;
    } while (update !== first);

    // 清空队列
    queue.pending = null;
    // 更新状态
    hook.memoizedState = newState;
    queue.lastRenderedState = newState;
  }

  return [hook.memoizedState, queue.dispatch];
}

console.log("  mountState、updateState、updateReducer 已定义");
console.log();                                          // 打印空行

// ===== 第四部分：renderWithHooks =====
console.log("【第四部分：renderWithHooks】");              // 打印小节标题

var dispatcher = { useState: null };

function renderWithHooks(fiber, componentFn, props) {
  currentlyRenderingFiber = fiber;
  workInProgressHook = null;
  // 关键修复：在开头重置 currentHook
  currentHook = null;

  var isFirstRender = fiber.memoizedState === null;
  dispatcher.useState = isFirstRender ? mountState : updateState;

  console.log("  [" + (isFirstRender ? "mount" : "update") + "] 渲染开始");
  var result = componentFn(props);
  console.log("  渲染结束");
  return result;
}

console.log("  renderWithHooks 已定义");
console.log();                                          // 打印空行

// ===== 第五部分：演示完整流程 =====
console.log("【第五部分：演示 useState 完整流程】");        // 打印小节标题

// 创建 fiber
var fiber = { memoizedState: null, type: null, props: {} };

// 保存 dispatch 函数
var setCount = null;
var setName = null;

// 定义组件
function Counter(props) {
  var countState = dispatcher.useState(0);     // Hook 1: count
  var nameState = dispatcher.useState("React"); // Hook 2: name
  setCount = countState[1];                     // 保存 dispatch
  setName = nameState[1];                       // 保存 dispatch
  console.log("    count=" + countState[0] + ", name=" + nameState[0]);
  return { count: countState[0], name: nameState[0] };
}

// mount
console.log("\\n  --- 第一次渲染（mount）---");
var r1 = renderWithHooks(fiber, Counter, {});
console.log("  结果:", JSON.stringify(r1));
console.log();                                          // 打印空行

// update 1：设置 count = 5
console.log("  --- setCount(5) ---");
setCount(5);
console.log("  --- 第二次渲染（update）---");
var r2 = renderWithHooks(fiber, Counter, {});
console.log("  结果:", JSON.stringify(r2));
console.log();                                          // 打印空行

// update 2：函数式更新 count + 3
console.log("  --- setCount(prev => prev + 3) ---");
setCount(function (prev) { return prev + 3; });
console.log("  --- 第三次渲染（update）---");
var r3 = renderWithHooks(fiber, Counter, {});
console.log("  结果:", JSON.stringify(r3));
console.log();                                          // 打印空行

// ===== 第六部分：bailout 优化演示 =====
console.log("【第六部分：bailout 优化（设置相同值）】");    // 打印小节标题

var beforeSchedule = renderScheduled;
console.log("  当前调度次数:", beforeSchedule);
console.log("  --- setCount(8)（值会变，会调度）---");
setCount(8);
console.log("  调度次数:", renderScheduled, "(增加了吗？", renderScheduled > beforeSchedule, ")");
console.log();

beforeSchedule = renderScheduled;
console.log("  --- setCount(8)（值不变，应该 bailout）---");
setCount(8); // 和当前值相同，应该触发 bailout
console.log("  调度次数:", renderScheduled, "(增加了吗？", renderScheduled > beforeSchedule, ")");

// 渲染一次来清空队列
console.log("  --- 渲染（清空队列）---");
renderWithHooks(fiber, Counter, {});
console.log();                                          // 打印空行

// ===== 第七部分：批量更新演示 =====
console.log("【第七部分：批量更新演示】");                  // 打印小节标题

console.log("  连续三次 setCount，观察调度次数：");
beforeSchedule = renderScheduled;
setCount(10);
setCount(20);
setCount(30);
console.log("  三次 setCount 后调度次数:", renderScheduled, "(增加了", renderScheduled - beforeSchedule, "次)");
console.log("  注意：每次 dispatchAction 都会调度，但 React 18 的调度器会合并");
console.log("  --- 渲染 ---");
var r7 = renderWithHooks(fiber, Counter, {});
console.log("  结果:", JSON.stringify(r7), "(最终值是最后一次 30)");
console.log();                                          // 打印空行

// ===== 总结 =====
console.log("【总结】");
console.log("  1. useState 内部用 useReducer 实现，reducer 是 basicStateReducer");
console.log("  2. dispatchAction 创建 update 并加入环形队列");
console.log("  3. bailout 优化：Object.is 比较新旧状态，相同则跳过渲染");
console.log("  4. eagerState 优化：队列空时提前计算，避免不必要的调度");
console.log("  5. 函数式更新能基于最新的 prevState 计算，避免批量更新中的状态过时");`
  },

  // =========================================================
  // 第二十章：useEffect 源码精读
  // =========================================================
  {
    id: "rs-useeffect",
    group: "第五部分 Hooks 系统",
    icon: "🧹",
    title: "useEffect 源码精读：依赖对比与 cleanup 执行时机",
    content: `## 一、useEffect 到底解决了什么问题

在类组件中，副作用（订阅、定时器、DOM 操作等）分散在各种生命周期方法里，导致**逻辑割裂**：

\`\`\`javascript
// 类组件：相关逻辑被迫分散在三个生命周期里
class ChatRoom extends Component {
  componentDidMount() {
    // 订阅
    this.subscription = socket.subscribe(this.handleMessage);
  }

  componentDidUpdate(prevProps) {
    // props 变了，先取消旧订阅，再订阅新的
    if (prevProps.roomId !== this.props.roomId) {
      this.subscription.unsubscribe();
      this.subscription = socket.subscribe(this.handleMessage);
    }
  }

  componentWillUnmount() {
    // 清理
    this.subscription.unsubscribe();
  }
}
\`\`\`

\`useEffect\` 把这些相关逻辑**聚合在一起**：

\`\`\`javascript
// 函数组件：订阅、清理、重新订阅都在一个地方
function ChatRoom({ roomId }) {
  useEffect(function () {
    var subscription = socket.subscribe(handleMessage);
    // 返回的函数就是 cleanup（对应 componentWillUnmount + componentDidUpdate 的清理部分）
    return function () {
      subscription.unsubscribe();
    };
  }, [roomId]); // 依赖：roomId 变了才重新执行
}
\`\`\`

### 生活类比：装修验收清单

把 useEffect 想象成一份**装修验收清单**：

- **create 函数**（第一个参数）= 验收时要做的检查项目（如"检查水管是否漏水"）
- **cleanup 函数**（create 的返回值）= 检查完后的收尾工作（如"关上检修口盖板"）
- **deps 数组**（第二个参数）= 哪些条件变了需要重新检查（如"水管路线变了才重新检查"）

React 的执行流程：

1. 第一次渲染后：执行 create（检查水管），记住 cleanup（关盖板）
2. 依赖变了：先执行上次的 cleanup（关旧盖板），再执行新的 create（检查新水管）
3. 组件卸载：执行最后一次的 cleanup（关盖板）

## 二、useEffect 的三种形式

\`\`\`javascript
// 形式 1：每次渲染后都执行（不传 deps）
useEffect(function () {
  console.log("每次渲染后都执行");
});

// 形式 2：只在 mount 后执行一次（传空数组）
useEffect(function () {
  console.log("只执行一次");
}, []);

// 形式 3：依赖变化时执行（传依赖数组）
useEffect(function () {
  console.log("count 变了才执行");
}, [count]);
\`\`\`

这三种形式的区别在于**依赖对比逻辑**：

| 形式 | deps | 行为 |
|------|------|------|
| 每次执行 | undefined | 永远返回 false（总是需要执行） |
| 只执行一次 | [] | 第一次返回 false，之后返回 true（不再执行） |
| 依赖变化 | [a, b] | 逐项 Object.is 比较，有不同就执行 |

## 三、mountEffect 和 updateEffect

### mountEffect：首次渲染

\`\`\`javascript
function mountEffect(create, deps) {
  var hook = mountWorkInProgressHook();

  // 创建 effect 对象
  var effect = {
    tag: HookEffectTag,   // 标记：这是一个 effect
    create: create,       // 副作用函数
    destroy: null,        // cleanup 函数（create 执行后的返回值）
    deps: deps,           // 依赖数组
    next: null,           // 指向下一个 effect（环形链表）
  };

  // 把 effect 加入 fiber 的更新队列
  // 注意：effect 不是存在 hook.memoizedState，而是存在 fiber.updateQueue
  hook.memoizedState = effect;
  pushEffect(HookEffectTag | HasEffect, create, null, deps);
}
\`\`\`

### updateEffect：更新渲染

\`\`\`javascript
function updateEffect(create, deps) {
  var hook = updateWorkInProgressHook();

  // 取出上次的 effect
  var prevEffect = hook.memoizedState;

  // 对比依赖
  var areDepsEqual = areHookInputsEqual(deps, prevEffect.deps);

  if (areDepsEqual) {
    // 依赖没变：跳过这个 effect（不执行 create）
    // 但仍然要 pushEffect，保持 effect 链表结构完整
    pushEffect(HookEffectTag, create, prevEffect.destroy, deps);
    return;
  }

  // 依赖变了：创建新的 effect
  var effect = {
    tag: HookEffectTag,
    create: create,
    destroy: null,
    deps: deps,
    next: null,
  };
  hook.memoizedState = effect;
  // pushEffect 时带 HasEffect 标记，表示这个 effect 需要执行
  pushEffect(HookEffectTag | HasEffect, create, null, deps);
}
\`\`\`

### HasEffect 标记的妙用

注意 \`pushEffect\` 的第一个参数：\`HookEffectTag | HasEffect\`。

- \`HookEffectTag\`：标记这是一个 effect
- \`HasEffect\`：标记这个 effect **需要执行**

React 在 commit 阶段遍历 effect 链表时，只执行带 \`HasEffect\` 标记的 effect。这样即使依赖没变，effect 仍然在链表里（保持结构完整），但不会被执行。

\`\`\`
effect 链表：
  effect1 (HasEffect)  → effect2 (无 HasEffect) → effect3 (HasEffect)
       ↓                      ↓                       ↓
    执行 create            跳过                   执行 create
\`\`\`

## 四、areHookInputsEqual：依赖对比

这是 useEffect 最核心的函数——决定 effect 是否需要重新执行：

\`\`\`javascript
function areHookInputsEqual(nextDeps, prevDeps) {
  // 第一次渲染或无依赖数组：prevDeps 为 null/undefined，返回 false（需要执行）
  if (prevDeps === null || prevDeps === undefined) {
    return false;
  }

  // 逐项比较，用 Object.is
  for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (Object.is(nextDeps[i], prevDeps[i])) {
      continue; // 这一项相等，继续比较下一项
    }
    return false; // 有一项不等，返回 false（需要执行）
  }

  // 所有项都相等，返回 true（跳过执行）
  return true;
}
\`\`\`

### 为什么用 Object.is 而不是 ===？

和 useState 的 bailout 一样，\`Object.is\` 能正确处理 \`NaN\`：

\`\`\`javascript
// 如果依赖是 NaN
useEffect(function () {
  console.log("执行了");
}, [NaN]);

// 第一次：prevDeps = null → 执行
// 第二次：prevDeps = [NaN]，nextDeps = [NaN]
// 如果用 ===：NaN === NaN → false → 每次都执行（bug！）
// 用 Object.is：Object.is(NaN, NaN) → true → 不执行（正确！）
\`\`\`

### 依赖对比的陷阱

\`\`\`javascript
// 陷阱 1：对象引用
useEffect(function () {
  console.log("执行了");
}, [{ a: 1 }]); // 每次渲染都创建新对象 → Object.is 比较引用 → 每次都执行！

// 陷阱 2：函数引用
useEffect(function () {
  console.log("执行了");
}, [function () {}]); // 每次渲染都创建新函数 → 每次都执行！

// 陷阱 3：数组引用
useEffect(function () {
  console.log("执行了");
}, [[1, 2, 3]]); // 每次渲染都创建新数组 → 每次都执行！
\`\`\`

这就是为什么 React 的 eslint 规则要求依赖数组里只放基本类型或用 useMemo/useCallback 包裹的引用。

## 五、effect 链表：fiber.updateQueue

useEffect 的 effect 不存在 \`hook.memoizedState\`，而是存在 \`fiber.updateQueue\` 的 effect 链表中。

为什么？因为 effect 需要在 **commit 阶段**统一处理（不是渲染阶段），所以需要挂在 fiber 上而不是 hook 上。

\`\`\`
fiber.updateQueue：
  firstEffect ←→ lastEffect (环形链表)
       ↓
  ┌──────────┐     ┌──────────┐     ┌──────────┐
  │ effect1  │────→│ effect2  │────→│ effect3  │
  │ create   │     │ create   │     │ create   │
  │ destroy  │     │ destroy  │     │ destroy  │
  │ deps     │     │ deps     │     │ deps     │
  │ HasEffect│     │ (无标记) │     │ HasEffect│
  └──────────┘     └──────────┘     └──────────┘
\`\`\`

## 六、effect 的执行时机

React 的渲染分两个阶段：

1. **Render 阶段**（可中断）：执行组件函数，计算虚拟 DOM
2. **Commit 阶段**（不可中断）：更新真实 DOM，执行 effect

Commit 阶段又分三个子阶段：

\`\`\`
Commit 阶段：
  1. Before mutation：getSnapshotBeforeUpdate
  2. Mutation：DOM 更新（增删改）
  3. Layout：useLayoutEffect 的 create + 类组件的 componentDidMount/Update
  
  ──── 浏览器绘制 ────

  4. Passive：useEffect 的 create（异步！在浏览器空闲时执行）
\`\`\`

### useEffect vs useLayoutEffect

| 特性 | useEffect | useLayoutEffect |
|------|-----------|-----------------|
| 执行时机 | 浏览器绘制后（异步） | DOM 更新后、绘制前（同步） |
| 会阻塞绘制 | 不会 | 会 |
| 适合做什么 | 数据获取、订阅、日志 | DOM 测量、滚动位置调整 |
| 内部实现 | 几乎相同，只是 tag 不同 | 几乎相同，只是 tag 不同 |

useEffect 的"异步"执行是通过 \`MessageChannel\` 或 \`setTimeout\` 实现的——React 把 effect 放入队列，等浏览器空闲时再执行。

## 七、cleanup 函数的执行时机

cleanup 函数（create 的返回值）的执行时机是 useEffect 最容易搞错的地方：

\`\`\`
组件第一次渲染：
  → 执行 create → 保存返回的 destroy

依赖变化，重新渲染：
  → 先执行上一次的 destroy（cleanup）
  → 再执行新的 create → 保存新的 destroy

组件卸载：
  → 执行最后一次的 destroy（cleanup）
\`\`\`

### 为什么先执行 cleanup 再执行 create？

因为 cleanup 是"清理上一次的副作用"。如果不先清理，可能出现冲突：

\`\`\`javascript
// 假设不先 cleanup
useEffect(function () {
  var timer = setInterval(function () { console.log("tick"); }, 1000);
  return function () { clearInterval(timer); };
}, [interval]);

// interval 从 1000 变成 500：
// 不先 cleanup：两个 timer 同时运行！
// 先 cleanup：旧 timer 被清除，只有新 timer 运行 ✅
\`\`\`

### cleanup 在卸载时的执行

组件卸载时，React 会执行 effect 链表中所有 effect 的 destroy，无论是否带 HasEffect 标记：

\`\`\`javascript
// 即使依赖没变、create 没有重新执行
// 卸载时仍然要执行 destroy！
useEffect(function () {
  var subscription = socket.subscribe();
  return function () { subscription.unsubscribe(); }; // 卸载时一定会执行
}, []);
\`\`\`

这就是为什么 \`deps = []\` 的 effect 只在 mount 时执行 create，但 cleanup 仍然在 unmount 时执行。

## 八、本章 Demo 说明

下面的 demo 会用代码模拟 useEffect 的完整流程：

1. 实现 mountEffect 和 updateEffect
2. 实现 areHookInputsEqual（依赖对比，处理 undefined deps）
3. 实现 pushEffect（构建 effect 环形链表）
4. 模拟 commit 阶段的 effect 执行（先 cleanup 再 create）
5. 演示三种使用形式的执行行为
6. 演示组件卸载时的 cleanup 执行

这个 demo 会让你直观理解：useEffect 的"异步"和"依赖对比"不是魔法，而是一套精心设计的链表和标记系统。`,
    code: `// ============================================================
// 第二十章 demo：useEffect 源码精读 —— 依赖对比与 cleanup 执行时机
// 演示内容：
//   1. 实现 mountEffect 和 updateEffect
//   2. 实现 areHookInputsEqual（依赖对比，处理 undefined deps）
//   3. 实现 pushEffect（构建 effect 环形链表）
//   4. 模拟 commit 阶段的 effect 执行（先 cleanup 再 create）
//   5. 演示三种使用形式的执行行为
//   6. 演示组件卸载时的 cleanup 执行
// ============================================================

console.log("=".repeat(60));                            // 打印分隔线
console.log("React 源码精读 — 第二十章：useEffect 源码精读"); // 打印章节标题
console.log("=".repeat(60));                            // 打印空行
console.log();                                          // 打印空行

// ===== 第一部分：全局变量和基础设施 =====
console.log("【第一部分：全局变量和基础设施】");            // 打印小节标题

var currentlyRenderingFiber = null;
var workInProgressHook = null;
var currentHook = null;

// effect 标记常量
var HasEffect = 1;       // 表示这个 effect 需要执行
var LayoutEffect = 2;    // useLayoutEffect
var PassiveEffect = 4;   // useEffect

// Object.is 的实现
function is(x, y) {
  if (x === y) {
    return x !== 0 || 1 / x === 1 / y; // 区分 +0 和 -0
  }
  return x !== x && y !== y; // 处理 NaN
}

console.log("  全局变量和常量已定义");
console.log();                                          // 打印空行

// ===== 第二部分：areHookInputsEqual（依赖对比） =====
console.log("【第二部分：areHookInputsEqual（依赖对比）】"); // 打印小节标题

// 对比新旧依赖数组，决定 effect 是否需要重新执行
// 对应 React 源码中的 areHookInputsEqual
function areHookInputsEqual(nextDeps, prevDeps) {
  // 关键修复：处理 undefined deps（useEffect 不传第二个参数的情况）
  // 此时 prevDeps 或 nextDeps 可能是 undefined，不能直接访问 .length
  if (prevDeps === null || prevDeps === undefined) {
    return false; // 没有上次的依赖，需要执行
  }
  if (nextDeps === null || nextDeps === undefined) {
    return false; // 没有依赖数组（每次都执行），需要执行
  }

  // 逐项比较
  var maxLength = Math.max(nextDeps.length, prevDeps.length);
  for (var i = 0; i < maxLength; i++) {
    // 如果有一项不存在或不等，返回 false（需要执行）
    if (i >= nextDeps.length || i >= prevDeps.length) {
      return false; // 长度不同
    }
    if (is(nextDeps[i], prevDeps[i])) {
      continue; // 这一项相等，继续
    }
    return false; // 这一项不等，需要执行
  }
  return true; // 所有项都相等，跳过执行
}

// 测试依赖对比
console.log("  测试 areHookInputsEqual：");
console.log("  [1,2] vs [1,2] =", areHookInputsEqual([1, 2], [1, 2]));   // true
console.log("  [1,2] vs [1,3] =", areHookInputsEqual([1, 2], [1, 3]));   // false
console.log("  [] vs [] =", areHookInputsEqual([], []));                 // true
console.log("  [NaN] vs [NaN] =", areHookInputsEqual([NaN], [NaN]));     // true（Object.is 处理 NaN）
console.log("  undefined vs [1] =", areHookInputsEqual(undefined, [1])); // false（无依赖数组）
console.log();                                          // 打印空行

// ===== 第三部分：pushEffect（构建 effect 链表） =====
console.log("【第三部分：pushEffect（构建 effect 链表）】"); // 打印小节标题

// 把 effect 加入 fiber 的 effect 链表
// 对应 React 源码中的 pushEffect
function pushEffect(tag, create, destroy, deps) {
  // 创建 effect 对象
  var effect = {
    tag: tag,         // 标记（含 HasEffect 表示需要执行）
    create: create,   // 副作用函数
    destroy: destroy, // cleanup 函数（上次的）
    deps: deps,       // 依赖数组
    next: null,       // 环形链表指针
  };

  // 获取 fiber 的更新队列
  var updateQueue = currentlyRenderingFiber.updateQueue;
  if (updateQueue === null) {
    // 第一次：创建更新队列
    updateQueue = {
      lastEffect: null, // effect 环形链表的尾指针
    };
    currentlyRenderingFiber.updateQueue = updateQueue;
  }

  var last = updateQueue.lastEffect;
  if (last === null) {
    // 链表为空：自己成环
    effect.next = effect;
    updateQueue.lastEffect = effect;
  } else {
    // 链表非空：插在第一个和最后一个之间
    var first = last.next;
    effect.next = first;
    last.next = effect;
    updateQueue.lastEffect = effect;
  }

  return effect;
}

console.log("  pushEffect 已定义");
console.log();                                          // 打印空行

// ===== 第四部分：mountEffect 和 updateEffect =====
console.log("【第四部分：mountEffect 和 updateEffect】");  // 打印小节标题

// updateWorkInProgressHook
function updateWorkInProgressHook() {
  var nextCurrentHook;
  if (currentHook === null) {
    nextCurrentHook = currentlyRenderingFiber.memoizedState;
  } else {
    nextCurrentHook = currentHook.next;
  }

  var newHook = {
    memoizedState: null,
    queue: null,
    next: null,
  };

  if (nextCurrentHook !== null) {
    newHook.memoizedState = nextCurrentHook.memoizedState;
    newHook.queue = nextCurrentHook.queue;
  }

  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = newHook;
  } else {
    workInProgressHook.next = newHook;
  }

  workInProgressHook = newHook;
  currentHook = nextCurrentHook;
  return newHook;
}

// mountEffect：首次渲染时的 useEffect
function mountEffect(create, deps) {
  var hook = updateWorkInProgressHook();

  // pushEffect 返回创建的 effect 对象，直接存到 hook.memoizedState
  // 这样 hook.memoizedState 和 fiber.updateQueue 中的是同一个对象
  // commit 阶段更新 effect.destroy 时，hook.memoizedState.destroy 也会同步更新
  // 这是正确传递 cleanup 函数的关键
  hook.memoizedState = pushEffect(PassiveEffect | HasEffect, create, null, deps);
}

// updateEffect：更新渲染时的 useEffect
function updateEffect(create, deps) {
  var hook = updateWorkInProgressHook();
  var prevEffect = hook.memoizedState;

  // 对比依赖
  var areDepsEqual = areHookInputsEqual(deps, prevEffect.deps);

  if (areDepsEqual) {
    // 依赖没变：跳过执行，但保持链表结构
    // 传入 prevEffect.destroy 以便卸载时能正确执行 cleanup
    console.log("    [updateEffect] 依赖没变，跳过");
    pushEffect(PassiveEffect, create, prevEffect.destroy, deps);
    return;
  }

  // 依赖变了：创建新 effect，传入 prevEffect.destroy 以便先执行上一次的 cleanup
  // pushEffect 返回新 effect，存到 hook.memoizedState
  // commit 阶段会先执行 destroy（上次的 cleanup），再执行 create，再存新的 destroy
  console.log("    [updateEffect] 依赖变了，需要执行");
  hook.memoizedState = pushEffect(PassiveEffect | HasEffect, create, prevEffect.destroy, deps);
}

console.log("  mountEffect、updateEffect 已定义");
console.log();                                          // 打印空行

// ===== 第五部分：renderWithHooks 和 commit 阶段 =====
console.log("【第五部分：renderWithHooks 和 commit 阶段】"); // 打印小节标题

var dispatcher = { useEffect: null };

function renderWithHooks(fiber, componentFn, props) {
  currentlyRenderingFiber = fiber;
  workInProgressHook = null;
  // 关键修复：在开头重置 currentHook
  currentHook = null;
  // 关键修复：重置 updateQueue，让每次渲染都构建全新的 effect 链表
  // 否则上一次渲染的 effect 会累积在 updateQueue 中，导致重复执行
  fiber.updateQueue = null;

  var isFirstRender = fiber.memoizedState === null;
  dispatcher.useEffect = isFirstRender ? mountEffect : updateEffect;

  console.log("  [" + (isFirstRender ? "mount" : "update") + "] 渲染开始");
  var result = componentFn(props);
  console.log("  渲染结束");
  return result;
}

// commit 阶段：执行 effect
// 对应 React 源码中的 commitPassiveMountEffects
function commitPassiveEffects(fiber) {
  var updateQueue = fiber.updateQueue;
  if (updateQueue === null || updateQueue.lastEffect === null) {
    console.log("  [commit] 没有 effect 需要执行");
    return;
  }

  var first = updateQueue.lastEffect.next;
  var effect = first;

  console.log("  [commit] 开始执行 effect...");

  // 第一轮：先执行所有带 HasEffect 标记的 effect 的 destroy（cleanup）
  do {
    if ((effect.tag & HasEffect) !== 0 && effect.destroy !== null) {
      console.log("    [cleanup] 执行上一次的 destroy");
      effect.destroy();
      effect.destroy = null;
    }
    effect = effect.next;
  } while (effect !== first);

  // 第二轮：执行所有带 HasEffect 标记的 effect 的 create
  effect = first;
  do {
    if ((effect.tag & HasEffect) !== 0) {
      console.log("    [create] 执行副作用函数");
      var destroy = effect.create();
      effect.destroy = typeof destroy === "function" ? destroy : null;
    }
    effect = effect.next;
  } while (effect !== first);

  console.log("  [commit] effect 执行完毕");
}

// unmount：组件卸载时执行所有 destroy
function unmountFiber(fiber) {
  var updateQueue = fiber.updateQueue;
  if (updateQueue === null || updateQueue.lastEffect === null) {
    console.log("  [unmount] 没有 effect 需要清理");
    return;
  }

  var first = updateQueue.lastEffect.next;
  var effect = first;

  console.log("  [unmount] 执行所有 cleanup...");
  do {
    if (effect.destroy !== null) {
      console.log("    [cleanup] 执行 destroy");
      effect.destroy();
      effect.destroy = null;
    }
    effect = effect.next;
  } while (effect !== first);
  console.log("  [unmount] 清理完毕");
}

console.log("  renderWithHooks、commitPassiveEffects、unmountFiber 已定义");
console.log();                                          // 打印空行

// ===== 第六部分：演示三种使用形式 =====
console.log("【第六部分：演示 useEffect 三种使用形式】");    // 打印小节标题

var fiber = { memoizedState: null, updateQueue: null, type: null, props: {} };
var renderCount = 0;
var logCount = 0;

// 形式 1：每次渲染都执行（不传 deps）
function ComponentA(props) {
  renderCount++;
  dispatcher.useEffect(function () {
    logCount++;
    console.log("    [effect A] 每次渲染都执行（第 " + logCount + " 次）");
    return function () {
      console.log("    [cleanup A] 清理");
    };
  }); // 没有第二个参数
  return "A";
}

console.log("  --- 形式 1：每次渲染都执行 ---");
console.log("  第一次渲染：");
renderWithHooks(fiber, ComponentA, {});
commitPassiveEffects(fiber);

console.log("\\n  第二次渲染：");
renderWithHooks(fiber, ComponentA, {});
commitPassiveEffects(fiber);
console.log();                                          // 打印空行

// ===== 第七部分：形式 2 和 3 =====
console.log("【第七部分：形式 2（只执行一次）和形式 3（依赖变化）】"); // 打印小节标题

var fiber2 = { memoizedState: null, updateQueue: null, type: null, props: {} };
var currentCount = 0;

function ComponentB(props) {
  dispatcher.useEffect(function () {
    console.log("    [effect B1] mount 时执行一次");
    return function () {
      console.log("    [cleanup B1] 卸载时清理");
    };
  }, []); // 空数组：只执行一次

  dispatcher.useEffect(function () {
    console.log("    [effect B2] count=" + currentCount + " 变化时执行");
    return function () {
      console.log("    [cleanup B2] count 变化时清理");
    };
  }, [currentCount]); // 依赖 currentCount

  return "B";
}

console.log("  --- 第一次渲染（mount）---");
renderWithHooks(fiber2, ComponentB, {});
commitPassiveEffects(fiber2);

console.log("\\n  --- 第二次渲染（count 没变）---");
renderWithHooks(fiber2, ComponentB, {});
commitPassiveEffects(fiber2); // 两个 effect 都不应该执行

console.log("\\n  --- 第三次渲染（count 变了）---");
currentCount = 1; // 改变依赖
renderWithHooks(fiber2, ComponentB, {});
commitPassiveEffects(fiber2); // B1 跳过，B2 执行

console.log("\\n  --- 第四次渲染（count 又变了）---");
currentCount = 2;
renderWithHooks(fiber2, ComponentB, {});
commitPassiveEffects(fiber2);
console.log();                                          // 打印空行

// ===== 第八部分：组件卸载 =====
console.log("【第八部分：组件卸载时的 cleanup】");          // 打印小节标题
console.log("  --- 卸载组件 ---");
unmountFiber(fiber2);                                   // 执行所有 cleanup
console.log();                                          // 打印空行

// ===== 总结 =====
console.log("【总结】");
console.log("  1. useEffect 的 effect 存在 fiber.updateQueue 的环形链表中");
console.log("  2. areHookInputsEqual 用 Object.is 逐项比较依赖，处理 undefined deps");
console.log("  3. HasEffect 标记决定 effect 是否执行，依赖没变时跳过 create 但保留 destroy");
console.log("  4. commit 阶段先执行 destroy（cleanup）再执行 create");
console.log("  5. 卸载时执行所有 effect 的 destroy，无论是否带 HasEffect 标记");
console.log("  6. currentHook 必须在 renderWithHooks 开头重置为 null");`
  }
];
