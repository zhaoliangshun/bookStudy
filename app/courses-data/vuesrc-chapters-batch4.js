// =============================================================
// Vue 源码构建教程（vuesrc）第四批章节
// -------------------------------------------------------------
// 主题：Diff 算法与组件系统（第 16-20 章）
// 面向：想从源码层面理解 Vue 3 虚拟 DOM 比对与组件机制的开发者
//
// 第四批（16-20章）：
//   vs-diff-core        ：Diff 算法核心：同层比较与首尾扫描
//   vs-diff-keyed       ：未知子序列处理：key 映射与移动
//   vs-component-mount  ：组件挂载：setup 与渲染上下文
//   vs-component-update ：组件更新：props 变化与重渲染
//   vs-lifecycle        ：生命周期：注册与执行时机
//
// 每个章节对象的结构：
//   id      : 唯一标识（vs- 前缀代表 vue source）
//   group   : 分组名
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解（含表格、代码块、列表）
//   code    : 可直接用 node 运行的 JS 示例代码，用 console.log 输出
//
// 代码运行环境约束：
//   - Node.js 沙箱中执行
//   - 仅使用 Node.js 内置模块，不依赖第三方包
//   - 所有 demo 单文件可独立运行
//   - 用 console.log 输出结果，每步都有中文注释
//
// 转义约定（非常重要）：
//   - code 字段中所有反引号必须转义为 \`
//   - code 字段中所有 ${} 必须转义为 \${}
//   - content 字段中的代码块用三个反引号（\`\`\`）
// =============================================================

export const chapters = [
  // =========================================================
  // 第十六章：Diff 算法核心：同层比较与首尾扫描
  // =========================================================
  {
    id: "vs-diff-core",
    group: "第三部分 虚拟 DOM",
    icon: "⚡",
    title: "Diff 算法核心：同层比较与首尾扫描",
    content: `
# Diff 算法核心：同层比较与首尾扫描

## 一、为什么需要 Diff 算法

在前面的章节中，我们已经能够把响应式数据渲染成虚拟 DOM，再挂载成真实 DOM。但这只是"第一次渲染"。真正的挑战在于**后续更新**——当数据变化时，会生成一棵新的虚拟 DOM 树，我们需要用某种方式把这棵新树和老树进行比对，找出差异，然后用最小的代价更新到真实 DOM 上。这个"比对"的过程，就是 **Diff 算法**。

### 1.1 为什么不能直接替换

最暴力的更新方式是：直接把老的 DOM 全部删掉，用新的虚拟 DOM 重新创建一遍。这种方式逻辑上没错，但性能上不可接受。原因有三：

1. **DOM 操作昂贵**：创建一个 DOM 节点比创建一个普通 JS 对象慢几十倍，涉及样式计算、布局重排、事件绑定等大量副作用。
2. **丢失状态**：输入框的焦点、滚动条位置、动画进度等状态会全部丢失——用户会看到页面"闪一下"。
3. **浪费可复用节点**：如果新旧树有 90% 的节点是相同的，只有 10% 不同，那 90% 的重建就是纯浪费。

所以 Diff 算法的核心目标是：**尽可能复用旧节点，只对真正变化的部分做最小化操作**。

### 1.2 生活类比：快递分拣中心

把 Diff 算法想象成一个**快递分拣中心**。

每天早上，分拣中心会收到一批"昨天的旧包裹"（旧虚拟 DOM）和"今天的新包裹清单"（新虚拟 DOM）。分拣员要做的事情是：

- 看看哪些包裹**昨天和今天都有**（相同节点）→ 直接复用，不重新打包
- 看看哪些包裹是**今天新增的**（新节点）→ 打包贴标签，送上流水线（挂载）
- 看看哪些包裹**今天没有了**（旧节点被删除）→ 退回销毁（卸载）
- 看看哪些包裹**位置变了**（顺序变化）→ 挪到新位置（移动）

分拣员不可能把所有包裹都倒出来重新分一遍——那样太慢了。他会用一套**高效的比对策略**，用最少的动作完成分拣。Vue 的 Diff 算法就是这套"分拣策略"。

## 二、Diff 的两个基础前提

在深入算法之前，必须先理解 Vue Diff 的两个基础前提，它们决定了算法的设计方向。

### 2.1 同层比较

Vue 的 Diff 是**同层比较**的——只比对同一层级的节点，不跨层级移动。

\`\`\`text
旧树:                新树:
  div                  div
  ├── ul               ├── ul
  │   ├── li           │   ├── li
  │   └── li           │   └── span   ← 新增
  └── p                └── p
\`\`\`

如果在新树中，某个节点从 \`div\` 下移动到了 \`ul\` 下（跨层级），Vue 不会"智能地"把它搬过去，而是：在旧位置卸载它，在新位置重新创建它。这看起来"不智能"，但这是有意为之的取舍：

| 方案 | 优点 | 缺点 |
| --- | --- | --- |
| 同层比较 | 算法复杂度低（O(n)），实现简单 | 跨层级移动会重建节点 |
| 跨层比较 | 能复用跨层移动的节点 | 复杂度爆炸（O(n³)），实际不可行 |

经典的树 Diff 算法复杂度是 O(n³)，对于 1000 个节点要做 10 亿次比较，完全不可用。同层比较把它降到了 O(n)，代价就是放弃跨层级复用。在实际开发中，跨层级移动节点本来就极少见，这个取舍非常划算。

### 2.2 用 key 标识节点身份

同层比较解决了"在哪一层比"的问题，但还有一个更微妙的问题：**怎么判断两个节点是"同一个节点"？**

最直觉的判断方式是看 \`type\`——如果旧节点的 type 是 \`li\`，新节点的 type 也是 \`li\`，就认为是同一个节点。但这不够：

\`\`\`text
旧: li(key=A) li(key=B) li(key=C)
新: li(key=C) li(key=B) li(key=A)
\`\`\`

如果只看 type，三个 \`li\` 看起来都一样，Vue 会认为"没变化"，直接复用——但实际上顺序完全反了，每个 \`li\` 内部的内容都不一样。这就是为什么需要 **key**。

key 的作用是给每个节点一个**稳定的身份标识**。有了 key，Vue 就能知道"这个 li 是 A，那个 li 是 C"，从而做出正确的复用和移动决策。

> **为什么不能用 index 作为 key？** 因为 index 是按位置编号的，节点顺序变化时，index 会"跟着位置走"而不是"跟着节点走"。比如 \`[A, B, C]\` 变成 \`[C, A, B]\`，用 index 做 key 的话，三个节点的 key 还是 0/1/2，Vue 会认为"没变化"，导致错误复用。用唯一 id 做 key 才能让 Vue 正确识别节点的身份。

## 三、Vue 3 Diff 的三步走策略

Vue 3 的 Diff 算法（\`patchKeyedChildren\`）是一个非常精巧的过程，它分为五个步骤。本章先讲前三步——**首尾扫描**，下一章再讲最复杂的中间未知子序列处理。

### 3.1 整体流程概览

\`\`\`text
第 1 步：从头同步（sync from start）
         从新旧列表的头部开始，逐个比对相同节点
第 2 步：从尾同步（sync from end）
         从新旧列表的尾部开始，逐个比对相同节点
第 3 步：仅新增（add new）
         旧列表已遍历完，新列表还有剩余 → 挂载剩余新节点
第 4 步：仅卸载（remove old）
         新列表已遍历完，旧列表还有剩余 → 卸载剩余旧节点
第 5 步：未知子序列（unknown sequence）
         首尾都不匹配的中间部分 → 用 key 映射 + LIS 处理
\`\`\`

为什么要分这么多步？因为**大部分实际场景下，变化只发生在列表的头部或尾部**。比如：

- 列表末尾追加一条数据 → 只有尾部变化
- 列表头部插入一条数据 → 只有头部变化
- 列表倒序 → 头尾交叉

首尾扫描能用最少的比较处理这些常见场景。只有当变化发生在中间、且节点顺序混乱时，才需要走最复杂的第 5 步。

### 3.2 生活类比：两队人马对齐

把新旧节点列表想象成两支**排队等候的队伍**。分拣员（Diff 算法）要做的，是让两队人逐个对齐：

1. **从队首开始对**：两队最前面的人如果是同一个人（key 相同），让他出列，两队各前进一位。一直对到队首不匹配为止。
2. **从队尾开始对**：两队最后面的人如果是同一个人，让他出列，两队各后退一位。一直对到队尾不匹配为止。
3. **如果旧队空了**：新队剩下来的人都是新来的 → 让他们入队（挂载）。
4. **如果新队空了**：旧队剩下来的人都是要走的 → 让他们离队（卸载）。
5. **如果两队都有剩余**：剩余的人里顺序混乱 → 用更复杂的策略处理（下一章讲）。

## 四、第 1 步：从头同步（sync from start）

\`\`\`text
旧: A B C D E
新: A B C F G
         ↑
     这里开始不匹配
\`\`\`

从索引 0 开始，逐个比较旧节点和新节点：

- i=0：旧 A vs 新 A → key 相同 → patch（更新属性/子节点）→ i++
- i=1：旧 B vs 新 B → key 相同 → patch → i++
- i=2：旧 C vs 新 C → key 相同 → patch → i++
- i=3：旧 D vs 新 F → key 不同 → **停止**，头部同步结束

这一步处理了 A、B、C 三个相同节点，它们只需要做属性和子节点的 patch，不需要移动。非常高效。

### 为什么从头开始？

因为"在列表头部追加或删除"是仅次于"末尾追加"的最常见操作。比如分页器的"上一页"按钮、聊天列表的最新消息。从头扫描能立刻命中这些场景。

## 五、第 2 步：从尾同步（sync from end）

\`\`\`text
旧: A B C D E
新: X Y C D E
         ↑
     这里开始不匹配（从尾部看）
\`\`\`

头部同步停止后（i 停在 D vs F 不匹配处），开始从尾部扫描：

- e1=4, e2=4：旧 E vs 新 E → key 相同 → patch → e1--, e2--
- e1=3, e2=3：旧 D vs 新 D → key 相同 → patch → e1--, e2--
- e1=2, e2=2：旧 C vs 新 C → key 相同 → patch → e1--, e2--
- e1=1, e2=1：旧 B vs 新 Y → key 不同 → **停止**，尾部同步结束

这一步处理了 E、D、C 三个相同节点。

### 为什么从尾开始？

"在列表末尾追加"是最常见的列表操作（无限滚动、加载更多）。从尾部扫描能立刻识别出"末尾新增"的情况，避免走复杂的中间处理。

## 六、第 3 步与第 4 步：纯新增与纯卸载

首尾扫描结束后，有两种特殊情况：

### 6.1 仅新增（旧列表遍历完）

如果 \`i > e1\`（旧列表已经全部处理完）但 \`i <= e2\`（新列表还有剩余），说明剩余的新节点都是**新增**的：

\`\`\`text
旧: A B C
新: A B C D E
         ↑↑ 新增

i=3, e1=2, e2=4
i > e1 → 旧列表遍历完
i <= e2 → 新列表还有 D, E
→ 挂载 D, E
\`\`\`

### 6.2 仅卸载（新列表遍历完）

如果 \`i > e2\`（新列表已经全部处理完）但 \`i <= e1\`（旧列表还有剩余），说明剩余的旧节点都是**要删除**的：

\`\`\`text
旧: A B C D E
新: A B C
         ↑↑ 要卸载

i=3, e1=4, e2=2
i > e2 → 新列表遍历完
i <= e1 → 旧列表还有 D, E
→ 卸载 D, E
\`\`\`

这两步处理了"纯增删"的简单场景，避免了不必要的复杂比对。

## 七、头尾交叉的场景

首尾扫描还有一个隐藏的优势——它能处理**头尾交叉**的场景，这在"列表倒序"时特别有用：

\`\`\`text
旧: A B C D E
新: E D C B A
\`\`\`

- 从头扫：旧 A vs 新 E → 不匹配 → 停止（i=0）
- 从尾扫：旧 E vs 新 A → 不匹配 → 停止（e1=4, e2=4）

这种情况下首尾扫描"失败"了，会走到第 5 步处理中间未知子序列。但如果场景是：

\`\`\`text
旧: A B C D
新: D A B C
\`\`\`

- 从头扫：旧 A vs 新 D → 不匹配 → 停止（i=0）
- 从尾扫：旧 D vs 新 C → 不匹配... 等等，再看看
  - 实际上从尾扫：旧 D vs 新 C 不匹配，停止

嗯，这个例子首尾扫描也帮不上忙。但如果是：

\`\`\`text
旧: A B C D
新: A B C D E
→ 从头扫到 D，从尾扫 E，发现是新增
\`\`\`

## 八、本章 Demo 说明

下面的 demo 会用代码实现 Vue 3 Diff 的**首尾扫描**核心逻辑：

1. 定义虚拟节点结构（简化版，用 key 和 type 标识）
2. 实现 \`patchKeyedChildren\` 的前 4 步：从头同步、从尾同步、纯新增、纯卸载
3. 用操作日志记录每一步的决策（patch / mount / unmount）
4. 演示三种典型场景：头部变化、尾部变化、纯增删

第 5 步（未知子序列处理）会在下一章实现。这个 demo 会让你直观理解：首尾扫描不是"炫技"，而是基于真实场景统计做出的性能优化。`,
    code: `// ============================================================
// 第十六章 demo：Diff 算法核心 —— 同层比较与首尾扫描
// 演示内容：
//   1. 定义简化的虚拟节点结构（type + key + children）
//   2. 实现 patchKeyedChildren 的前四步：
//      - 从头同步（sync from start）
//      - 从尾同步（sync from end）
//      - 仅新增（add new）
//      - 仅卸载（remove old）
//   3. 用操作日志记录每一步的决策（patch / mount / unmount）
//   4. 演示三种典型场景：尾部追加、头部删除、纯增删
// 注意：第 5 步（未知子序列）在下一章实现
// ============================================================

console.log("=".repeat(60));                            // 打印分隔线
console.log("Vue 源码精读 — 第十六章：Diff 算法核心（首尾扫描）"); // 打印章节标题
console.log("=".repeat(60));                            // 打印分隔线
console.log();                                          // 打印空行

// ===== 第一部分：定义虚拟节点结构 =====
console.log("【第一部分：定义虚拟节点结构】");            // 打印小节标题

// 创建一个简化的虚拟节点
// 真实 Vue 中 VNode 结构更复杂，这里只保留 Diff 需要的字段
function h(type, key, children) {
  // type    : 节点类型（'div'、'li'、'span' 等标签名，或组件）
  // key     : 节点的唯一标识，Diff 算法用它判断"是不是同一个节点"
  // children: 子节点数组或文本
  return { type: type, key: key, children: children };
}

// 操作日志数组 —— 记录 Diff 过程中的所有操作
// 每个 log 是一个描述操作的字符串，让我们能直观看到 Diff 做了什么
var ops = [];

// patch 操作：复用旧节点，只更新内容（不重新创建）
function patch(oldVNode, newVNode) {
  // oldVNode 和 newVNode 的 key 相同、type 相同，认为是同一个节点
  // 只需要更新它的 children（真实 Vue 中还会更新 props、class 等）
  ops.push("patch: " + oldVNode.key + " (复用节点，更新内容)");
  // 把旧节点的内容更新为新节点的内容
  oldVNode.children = newVNode.children;
}

// mount 操作：创建新节点（旧节点中没有这个 key）
function mount(vNode, anchor) {
  // anchor 是挂载位置的标记，真实 Vue 中是真实 DOM 的参考节点
  ops.push("mount: " + vNode.key + " (新增节点，插入到" + (anchor || "末尾") + ")");
}

// unmount 操作：卸载旧节点（新节点中没有这个 key）
function unmount(vNode) {
  ops.push("unmount: " + vNode.key + " (卸载节点)");
}

console.log("  虚拟节点结构: { type, key, children }");   // 打印结构说明
console.log("  patch  = 复用旧节点，只更新内容");          // 打印操作说明
console.log("  mount  = 创建新节点");                      // 打印操作说明
console.log("  unmount= 卸载旧节点");                      // 打印操作说明
console.log();                                          // 打印空行

// ===== 第二部分：实现首尾扫描 Diff 的前四步 =====
console.log("【第二部分：实现首尾扫描 Diff（前四步）】");  // 打印小节标题

// patchKeyedChildren：带 key 的子节点 Diff 核心函数
// 对应 Vue 源码中的 patchKeyedChildren（renderer.ts）
// 参数：
//   c1 = 旧子节点数组
//   c2 = 新子节点数组
function patchKeyedChildren(c1, c2) {
  // i  : 从头扫描的指针，初始指向新旧列表的第 0 个
  // e1 : 旧列表的尾指针，初始指向最后一个元素
  // e2 : 新列表的尾指针，初始指向最后一个元素
  var i = 0;
  var e1 = c1.length - 1;                               // 旧列表最后一个元素的索引
  var e2 = c2.length - 1;                               // 新列表最后一个元素的索引

  // ---------- 第 1 步：从头同步（sync from start）----------
  // 从头部开始，逐个比较旧节点和新节点
  // 如果 key 相同，说明是同一个节点，做 patch 复用
  // 如果 key 不同，立即停止，交给后续步骤处理
  console.log("  [第1步] 从头同步 (i=" + i + ")");
  while (i <= e1 && i <= e2) {
    var oldVNode = c1[i];                               // 取旧列表第 i 个节点
    var newVNode = c2[i];                               // 取新列表第 i 个节点
    if (oldVNode.key === newVNode.key) {
      // key 相同 → 是同一个节点 → patch（复用，更新内容）
      patch(oldVNode, newVNode);
      i++;                                              // 指针后移，继续比较下一个
    } else {
      // key 不同 → 头部同步结束，跳出循环
      console.log("    头部不匹配: 旧[" + oldVNode.key + "] vs 新[" + newVNode.key + "]，停止");
      break;                                            // 跳出 while 循环
    }
  }
  console.log("    头部同步结束，i=" + i);                // 打印头部同步结束后的指针位置

  // ---------- 第 2 步：从尾同步（sync from end）----------
  // 从尾部开始，逐个比较旧节点和新节点
  // 如果 key 相同，做 patch 复用
  // 如果 key 不同，立即停止
  console.log("  [第2步] 从尾同步 (e1=" + e1 + ", e2=" + e2 + ")");
  while (i <= e1 && i <= e2) {
    var oldVNode = c1[e1];                              // 取旧列表第 e1 个（从尾往前）
    var newVNode = c2[e2];                              // 取新列表第 e2 个（从尾往前）
    if (oldVNode.key === newVNode.key) {
      // key 相同 → 是同一个节点 → patch
      patch(oldVNode, newVNode);
      e1--;                                             // 旧列表尾指针前移
      e2--;                                             // 新列表尾指针前移
    } else {
      // key 不同 → 尾部同步结束
      console.log("    尾部不匹配: 旧[" + oldVNode.key + "] vs 新[" + newVNode.key + "]，停止");
      break;                                            // 跳出 while 循环
    }
  }
  console.log("    尾部同步结束，e1=" + e1 + ", e2=" + e2); // 打印尾部同步结束后的指针位置

  // ---------- 第 3 步：仅新增（旧列表遍历完，新列表还有剩余）----------
  // 条件：i > e1（旧列表的头部指针已经超过尾部指针 → 旧列表全部处理完）
  //       且 i <= e2（新列表还有剩余节点）
  // 这些剩余的新节点都是要新增挂载的
  if (i > e1) {
    // 旧列表遍历完了，新列表 [i, e2] 范围内的节点都是新增的
    console.log("  [第3步] 仅新增: 新列表 [" + i + ".." + e2 + "] 范围内是新增节点");
    // 确定挂载锚点：如果 e2 + 1 超出新列表范围，挂载到末尾；否则挂载到 c2[e2+1] 之前
    var anchor = (e2 + 1 < c2.length) ? c2[e2 + 1].key : null;
    while (i <= e2) {
      mount(c2[i], anchor);                             // 挂载新节点
      i++;                                              // 指针后移
    }
  }
  // ---------- 第 4 步：仅卸载（新列表遍历完，旧列表还有剩余）----------
  // 条件：i > e2（新列表全部处理完）
  //       且 i <= e1（旧列表还有剩余节点）
  // 这些剩余的旧节点都是要卸载删除的
  else if (i > e2) {
    console.log("  [第4步] 仅卸载: 旧列表 [" + i + ".." + e1 + "] 范围内是要卸载的节点");
    while (i <= e1) {
      unmount(c1[i]);                                   // 卸载旧节点
      i++;                                              // 指针后移
    }
  }
  // ---------- 第 5 步：未知子序列（中间部分首尾都不匹配）----------
  // 这是首尾扫描无法处理的复杂情况，需要用 key 映射 + LIS 处理
  // 本章暂不实现，下一章详细讲解
  else {
    console.log("  [第5步] 未知子序列: i=" + i + ", e1=" + e1 + ", e2=" + e2 + " (下一章实现)");
    ops.push("(第5步: 未知子序列处理 — 下一章实现)");
  }
}

console.log("  patchKeyedChildren 函数已定义");            // 打印提示
console.log();                                          // 打印空行

// ===== 第三部分：场景一 —— 尾部追加 =====
console.log("【场景一：尾部追加（最常见的列表更新）】");   // 打印小节标题

// 旧列表：A B C
// 新列表：A B C D E
// 预期：A B C 被 patch（复用），D E 被 mount（新增）
var old1 = [h("li", "A", "A"), h("li", "B", "B"), h("li", "C", "C")];
var new1 = [h("li", "A", "A"), h("li", "B", "B"), h("li", "C", "C"), h("li", "D", "D"), h("li", "E", "E")];
ops = [];                                               // 清空操作日志
patchKeyedChildren(old1, new1);                         // 执行 Diff
console.log("  操作日志:");
ops.forEach(function (op) { console.log("    " + op); }); // 逐行打印操作日志
console.log("  结果: A B C 被复用(patch)，D E 被新增(mount)"); // 打印结论
console.log();                                          // 打印空行

// ===== 第四部分：场景二 —— 尾部删除 =====
console.log("【场景二：尾部删除】");                      // 打印小节标题

// 旧列表：A B C D E
// 新列表：A B C
// 预期：A B C 被 patch，D E 被 unmount
var old2 = [h("li", "A", "A"), h("li", "B", "B"), h("li", "C", "C"), h("li", "D", "D"), h("li", "E", "E")];
var new2 = [h("li", "A", "A"), h("li", "B", "B"), h("li", "C", "C")];
ops = [];                                               // 清空操作日志
patchKeyedChildren(old2, new2);                         // 执行 Diff
console.log("  操作日志:");
ops.forEach(function (op) { console.log("    " + op); }); // 逐行打印操作日志
console.log("  结果: A B C 被复用(patch)，D E 被卸载(unmount)"); // 打印结论
console.log();                                          // 打印空行

// ===== 第五部分：场景三 —— 头部变化 =====
console.log("【场景三：头部变化】");                      // 打印小节标题

// 旧列表：A B C D
// 新列表：B C D
// 从头扫：A vs B 不匹配 → 停止
// 从尾扫：D vs D, C vs C, B vs B 匹配 → 全部 patch
// 第4步：旧列表还剩 A → unmount
var old3 = [h("li", "A", "A"), h("li", "B", "B"), h("li", "C", "C"), h("li", "D", "D")];
var new3 = [h("li", "B", "B"), h("li", "C", "C"), h("li", "D", "D")];
ops = [];                                               // 清空操作日志
patchKeyedChildren(old3, new3);                         // 执行 Diff
console.log("  操作日志:");
ops.forEach(function (op) { console.log("    " + op); }); // 逐行打印操作日志
console.log("  结果: B C D 被复用(patch)，A 被卸载(unmount)"); // 打印结论
console.log();                                          // 打印空行

// ===== 第六部分：场景四 —— 头尾交叉（倒序）=====
console.log("【场景四：头尾交叉（部分倒序）】");           // 打印小节标题

// 旧列表：A B C D E
// 新列表：A B E C D
// 从头扫：A=A, B=B 匹配 → patch → i=2
// 从尾扫：D=D, C=C 匹配 → patch → e1=2, e2=2
// 此时 i=2, e1=2, e2=2 → 第5步未知子序列
var old4 = [h("li", "A", "A"), h("li", "B", "B"), h("li", "C", "C"), h("li", "D", "D"), h("li", "E", "E")];
var new4 = [h("li", "A", "A"), h("li", "B", "B"), h("li", "E", "E"), h("li", "C", "C"), h("li", "D", "D")];
ops = [];                                               // 清空操作日志
patchKeyedChildren(old4, new4);                         // 执行 Diff
console.log("  操作日志:");
ops.forEach(function (op) { console.log("    " + op); }); // 逐行打印操作日志
console.log("  结果: A B 和 C D 被首尾扫描复用，E 进入第5步（未知子序列）"); // 打印结论
console.log();                                          // 打印空行

// ===== 第七部分：场景五 —— 纯新增 =====
console.log("【场景五：纯新增（空列表变非空）】");         // 打印小节标题

// 旧列表：空
// 新列表：A B C
// 预期：全部 mount
var old5 = [];
var new5 = [h("li", "A", "A"), h("li", "B", "B"), h("li", "C", "C")];
ops = [];                                               // 清空操作日志
patchKeyedChildren(old5, new5);                         // 执行 Diff
console.log("  操作日志:");
ops.forEach(function (op) { console.log("    " + op); }); // 逐行打印操作日志
console.log("  结果: A B C 全部新增(mount)");            // 打印结论
console.log();                                          // 打印空行

// ===== 总结 =====
console.log("【总结】");
console.log("  1. Diff 的目标是复用旧节点，做最小化 DOM 操作");
console.log("  2. 同层比较 + key 标识身份，把复杂度从 O(n^3) 降到 O(n)");
console.log("  3. 从头同步：处理头部相同节点（常见于头部增删）");
console.log("  4. 从尾同步：处理尾部相同节点（常见于尾部增删，最常见场景）");
console.log("  5. 纯新增 / 纯卸载：处理一边遍历完的简单情况");
console.log("  6. 首尾扫描无法处理的情况（中间未知子序列）交给第5步，下一章实现");`
  },

  // =========================================================
  // 第十七章：未知子序列处理：key 映射与移动
  // =========================================================
  {
    id: "vs-diff-keyed",
    group: "第三部分 虚拟 DOM",
    icon: "🔑",
    title: "未知子序列处理：key 映射与移动",
    content: `
# 未知子序列处理：key 映射与移动

## 一、回顾：首尾扫描的局限

上一章我们实现了 Diff 的前四步——从头同步、从尾同步、纯新增、纯卸载。这四步能处理大部分简单场景（头部增删、尾部增删）。但当变化发生在**列表中间**、且节点顺序混乱时，首尾扫描会"卡住"：

\`\`\`text
旧: A B [C D E] F G
新: A B [E C D] F G
         ↑↑↑
     这一段首尾都不匹配
\`\`\`

- 从头扫：A=A, B=B 匹配 → i 停在 2
- 从尾扫：G=G, F=F 匹配 → e1 停在 4, e2 停在 4
- 中间剩下旧 [C, D, E] vs 新 [E, C, D]，首尾都不匹配

这就是**未知子序列**——首尾扫描无法处理的中间部分。本章我们就来攻克 Vue 3 Diff 中最精巧的部分：未知子序列的处理。

### 1.1 生活类比：快递分拣中心的"疑难件"

继续用上一章的快递分拣类比。首尾扫描就像分拣员从队列两头开始，把能对上的包裹先处理掉。但总有一些"疑难件"留在中间——它们的收件人都在，但顺序完全乱了：

\`\`\`text
旧队列（昨天）：... C D E ...
新队列（今天）：... E C D ...
\`\`\`

分拣员不能用"全部退回重新打包"的暴力方式（性能太差），也不能用"逐个查找"的笨办法（O(n²) 太慢）。他需要一套更聪明的策略：

1. **建索引**：把今天新队列里每个包裹的编号（key）和位置记下来，做成一张速查表
2. **逐个核对**：拿昨天队列里的每个包裹，去速查表里查"今天还在不在？在新队列的哪个位置？"
3. **找最长不动线**：找出那些"位置没变"的包裹，它们完全不用挪动
4. **移动最少的**：只挪动那些真正需要挪的包裹

这就是 Vue 3 处理未知子序列的核心思路。

## 二、第 5 步的整体流程

未知子序列的处理分为四个子步骤：

\`\`\`text
5.1 为新节点建立 key → 索引映射表（newIndexToOldIndexMap 的前置）
5.2 遍历旧子序列，逐个查映射表：
    - 找不到 → 旧节点在新列表中已删除 → 卸载
    - 找得到 → 记录旧节点在新列表中的位置
5.3 求最长递增子序列（LIS）：找出不需要移动的节点
5.4 从后向前遍历新子序列：
    - 在 LIS 中 → 不移动，只 patch
    - 不在 LIS 中 → 移动到正确位置
    - 没有旧节点对应 → 新增挂载
\`\`\`

下面逐步详解。

## 三、5.1 建立 key 映射表

### 3.1 为什么要建映射表

未知子序列中，旧节点和新节点的顺序可能完全不同。如果对每个旧节点都去新列表里线性查找，复杂度是 O(n²)。为了把查找降到 O(1)，Vue 用了一个 Map：

\`\`\`javascript
// 建立 key → 新列表索引 的映射
var keyToNewIndex = new Map();
for (var j = s2; j <= e2; j++) {
  keyToNewIndex.set(c2[j].key, j);
}
\`\`\`

这样，给定一个旧节点的 key，就能 O(1) 查到它在新列表中的位置。

### 3.2 为什么用 Map 而不是对象

| 方案 | 优点 | 缺点 |
| --- | --- | --- |
| 普通对象 | 兼容性好 | key 只能是字符串，数字 key 会被转成字符串，可能有冲突 |
| Map | key 可以是任意类型（数字、字符串、对象），查找 O(1) | 需要 ES2015+（Vue 3 要求 ES2015，没问题） |

Vue 3 的目标是现代浏览器，用 Map 更合适。注意 key 如果是数字 1，用对象的话会被转成字符串 "1"，和 key "1" 冲突；Map 不会。

## 四、5.2 遍历旧子序列，填充映射数组

### 4.1 newIndexToOldIndexMap

除了 key→新索引 的 Map，Vue 还维护了一个关键数组 \`newIndexToOldIndexMap\`：

\`\`\`text
newIndexToOldIndexMap[newIndex] = oldIndex + 1
\`\`\`

- 索引是新列表中的位置（0 开始）
- 值是旧列表中对应节点的位置 + 1（为什么 +1 后面解释）
- 如果新节点在旧列表中不存在（纯新增），值为 0

这个数组是后面求 LIS 的输入。

### 4.2 遍历过程

\`\`\`text
遍旧子序列 [s1, e1] 的每个 oldVNode：
  1. 用 oldVNode.key 查 keyToNewIndex，得到 newIndex
  2. 如果 newIndex 未定义 → 旧节点在新列表中已不存在 → unmount
  3. 如果 newIndex 已定义 →
     a. 记录 newIndexToOldIndexMap[newIndex] = oldIndex + 1
     b. patch(oldVNode, newVNode)（复用节点，更新内容）
\`\`\`

### 4.3 为什么值是 oldIndex + 1 而不是 oldIndex

因为 oldIndex 可以是 0（旧列表的第一个元素），如果直接用 0，就无法区分"这个新节点对应旧列表的第 0 个元素"和"这个新节点是纯新增的（旧列表没有）"。+1 之后，0 就专门表示"新增"，1 表示旧列表第 0 个，2 表示旧列表第 1 个……

这是一个经典的"哨兵值"技巧——用 0 作为特殊标记。

### 4.4 为什么要记录"已 patched"的数量

遍历时还有一个计数器 \`patched\`，记录已经处理（patch）的节点数。如果 \`patched > 待处理新节点总数\`，说明出现了异常（不应该发生），会触发卸载。这是防御性编程。

## 五、5.3 最长递增子序列（LIS）

这是整个 Diff 算法中最精妙的一步。

### 5.1 什么是 LIS

**最长递增子序列**（Longest Increasing Subsequence）是指：在一个序列中，找到一个最长的子序列，使得子序列中的元素**严格递增**，且**保持原有的相对顺序**。

\`\`\`text
序列: [3, 1, 2, 5, 4, 6]
LIS : [1, 2, 4, 6] 或 [1, 2, 5, 6]（长度都是 4）
\`\`\`

注意：子序列不要求连续，只要求相对顺序不变。

### 5.2 为什么 Diff 要用 LIS

回到 \`newIndexToOldIndexMap\`。这个数组记录了"新列表第 j 个节点，对应旧列表的第几个节点"。

\`\`\`text
新列表:    E   C   D
map    :   3   1   2   （旧列表中 E 是第 3 个，C 是第 1 个，D 是第 2 个，+1 后）
\`\`\`

如果 map 中有一个**递增子序列**，意味着这些节点在旧列表中的相对顺序和新列表中一致——它们**不需要移动**！

\`\`\`text
map: [3, 1, 2]
     E  C  D
LIS:    1  2     → C D 在旧列表中也是 C 在 D 前面 → 不需要移动
         ↓
     只需要移动 E！
\`\`\`

**核心思想**：找出最长递增子序列，这些节点保持不动，只移动不在 LIS 中的节点。这样移动次数最少。

### 5.3 生活类比：排队最少调整

想象一排学生按学号站队，但站乱了：

\`\`\`text
预期顺序: 1 2 3 4 5
实际顺序: 3 1 2 5 4
\`\`\`

老师要让队伍排好，但希望"挪动最少的人"。怎么做？

- 找出"已经按相对顺序排好"的最长一组：1, 2, 5（它们的相对顺序是对的）
- 这三个人不动
- 只挪动 3 和 4

这就是 LIS 的应用——**让尽量多的人不动，只动尽量少的人**。

### 5.4 Vue 的 LIS 实现特点

经典的 LIS 算法用动态规划，复杂度 O(n²)。Vue 用了一个更优的版本，基于**贪心 + 二分查找**，复杂度 O(n log n)。

但 Vue 的 LIS 有一个特殊点：它返回的不是"最长递增子序列的值"，而是**"最长递增子序列在原数组中的索引"**。因为 Diff 需要知道"哪些位置（索引）的节点不需要移动"，而不是"哪些值组成了 LIS"。

\`\`\`text
map:       [3, 1, 2]
LIS 值:    [1, 2]
LIS 索引:  [1, 2]   ← Vue 返回这个，表示 map[1] 和 map[2] 在 LIS 中
\`\`\`

## 六、5.4 从后向前移动和挂载

拿到 LIS 索引后，最后一步是**从后向前**遍历新子序列，执行移动和挂载：

\`\`\`javascript
for (var j = e2; j >= s2; j--) {
  var newVNode = c2[j];
  // 判断是否需要移动：j 是否在 LIS 中
  if (lisSet.has(j)) {
    // 在 LIS 中 → 不需要移动
    continue;
  }
  // 不在 LIS 中 → 需要移动或挂载
  if (newIndexToOldIndexMap[j] === 0) {
    // 值为 0 → 纯新增 → 挂载
    mount(newVNode, anchor);
  } else {
    // 值非 0 → 已存在但位置不对 → 移动
    move(newVNode, anchor);
  }
  // 更新锚点
  anchor = newVNode.el;
}
\`\`\`

### 6.1 为什么从后向前

因为 DOM 的 \`insertBefore(newNode, referenceNode)\` 需要"参考节点"。从后向前遍历时，当前节点的下一个节点（更靠后的）已经处理好了，可以作为参考节点。如果从前向后，参考节点还没就位。

### 6.2 锚点（anchor）的作用

anchor 是"当前节点应该插在谁前面"的参考。遍历时，每处理完一个节点，它就成为下一个（更靠前的）节点的 anchor。

## 七、完整流程示例

\`\`\`text
旧: A B C D E F
新: A B E C D X F

第1步（从头）: A=A, B=B → patch → i=2
第2步（从尾）: F=F → patch → e1=4, e2=4
第5步（未知子序列）: 旧 [C,D,E] vs 新 [E,C,D,X]
  5.1 keyToNewIndex: {E:0, C:1, D:2, X:3}
  5.2 遍历旧 [C,D,E]：
      C → newIndex=1 → map[1]=3(oldIndex+1)
      D → newIndex=2 → map[2]=4
      E → newIndex=0 → map[0]=5
      map = [5, 3, 4, 0]  （X 没有旧节点，值为 0）
  5.3 LIS([5,3,4,0]) = [3,4] → 索引 [1,2] → C,D 不动
  5.4 从后向前遍历新 [E,C,D,X]：
      X(j=3): map[3]=0 → mount（新增）
      D(j=2): 在 LIS → 不动
      C(j=1): 在 LIS → 不动
      E(j=0): 不在 LIS → move（移动）
\`\`\`

结果：只移动 E，新增 X，C/D 不动。这就是 LIS 优化的威力。

## 八、本章 Demo 说明

下面的 demo 会实现完整的 keyed Diff（包含第 5 步），并演示 LIS 优化：

1. 实现首尾扫描（复用上一章）
2. 实现 key 映射表（Map）
3. 实现 newIndexToOldIndexMap 的填充
4. 实现 LIS 算法（贪心 + 二分，返回索引）
5. 实现从后向前的移动和挂载
6. 演示"倒序"场景，对比有无 LIS 的移动次数

这个 demo 会让你直观理解：LIS 不是数学游戏，而是实实在在减少 DOM 移动次数的工程优化。`,
    code: `// ============================================================
// 第十七章 demo：未知子序列处理 —— key 映射与 LIS
// 演示内容：
//   1. 完整实现 patchKeyedChildren（含第5步未知子序列）
//   2. 建立 key → 新索引 的 Map 映射
//   3. 填充 newIndexToOldIndexMap 数组
//   4. 实现最长递增子序列（LIS）算法（贪心+二分，返回索引）
//   5. 从后向前执行移动和挂载
//   6. 演示"倒序"场景，展示 LIS 如何减少移动次数
// ============================================================

console.log("=".repeat(60));                            // 打印分隔线
console.log("Vue 源码精读 — 第十七章：未知子序列与 LIS"); // 打印章节标题
console.log("=".repeat(60));                            // 打印分隔线
console.log();                                          // 打印空行

// ===== 第一部分：辅助函数和虚拟节点 =====
console.log("【第一部分：辅助函数和虚拟节点】");          // 打印小节标题

// 创建简化的虚拟节点
function h(type, key, children) {
  return { type: type, key: key, children: children };  // 返回节点对象
}

// 操作日志
var ops = [];
var moveCount = 0;                                      // 统计移动次数（用于对比 LIS 优化效果）

function patch(old, vn) { ops.push("  patch: " + old.key); }
function mount(vn) { ops.push("  mount: " + vn.key); }
function unmount(vn) { ops.push("  unmount: " + vn.key); }
function move(vn) { moveCount++; ops.push("  move: " + vn.key + " (第" + moveCount + "次移动)"); }

console.log("  辅助函数已定义");                          // 打印提示
console.log();                                          // 打印空行

// ===== 第二部分：实现最长递增子序列（LIS）=====
console.log("【第二部分：实现最长递增子序列（LIS）】");    // 打印小节标题

// getSequence：求最长递增子序列
// 对应 Vue 源码中的 getSequence（renderer.ts）
// 算法：贪心 + 二分查找，复杂度 O(n log n)
// 返回值：LIS 元素在原数组中的【索引】数组（不是值！）
function getSequence(arr) {
  // arr: 要求解的数组，比如 [5, 3, 4, 0]
  // 返回: LIS 元素的索引，比如 [1, 2]（对应值 3, 4）

  var p = arr.slice();                                 // p[i] 记录 arr[i] 的前驱索引（用于回溯路径）
  var result = [0];                                    // result 存储 LIS 的索引，初始包含第 0 个元素
  var i, j, lo, hi, mid, last;
  var len = arr.length;                                // 数组长度
  var resultLastIndex;                                 // result 最后一个元素

  for (i = 0; i < len; i++) {                          // 遍历数组的每个元素
    var arrI = arr[i];                                 // 取当前元素的值
    if (arrI !== 0) {                                  // 跳过 0（0 在 Diff 中表示"新增节点"，不参与 LIS）
      resultLastIndex = result.length - 1;             // result 当前最后一个元素的索引

      // 如果当前值 > result 末尾对应的值 → 可以接在 LIS 后面
      if (arr[resultLastIndex] < arrI) {
        p[i] = result[resultLastIndex];                // 记录前驱：当前元素接在 result 末尾元素之后
        result.push(i);                                // 把当前索引加入 result
        continue;                                      // 继续下一个元素
      }

      // 否则，用二分查找在 result 中找到第一个 >= arrI 的位置，替换它
      // 这就是贪心策略：让 LIS 每个位置的值尽可能小，以便后续能接更多元素
      lo = 0;                                          // 二分查找左边界
      hi = resultLastIndex;                            // 二分查找右边界
      while (lo < hi) {                                // 二分查找循环
        mid = (lo + hi) >> 1;                          // 取中间位置（右移1位 = 除以2取整）
        if (arr[result[mid]] < arrI) {                 // 中间值 < 当前值
          lo = mid + 1;                                // 右半部分查找
        } else {                                       // 中间值 >= 当前值
          hi = mid;                                    // 左半部分查找（含 mid）
        }
      }

      // 循环结束后 lo == hi，就是第一个 >= arrI 的位置
      if (arr[result[lo]] > arrI) {                    // 如果找到的位置的值 > 当前值（严格大于才替换）
        if (lo > 0) {                                  // 如果不是第一个位置
          p[i] = result[lo - 1];                       // 记录前驱
        }
        result[lo] = i;                                // 替换该位置的索引为当前索引
      }
    }
  }

  // 回溯：通过 p 数组还原完整的 LIS 索引路径
  // result 此时存储的是"每一步的最优尾索引"，需要通过 p 回溯
  var u = result.length;                               // LIS 的长度
  var v = result[u - 1];                               // LIS 最后一个元素的索引
  while (u-- > 0) {                                    // 从后向前回溯
    result[u] = v;                                     // 填入正确的索引
    v = p[v];                                          // 找前驱
  }

  return result;                                       // 返回 LIS 的索引数组
}

// 测试 LIS
console.log("  测试 LIS 算法:");
console.log("    [3, 1, 2, 5, 4, 6] 的 LIS 索引:", getSequence([3, 1, 2, 5, 4, 6])); // 期望 [1, 2, 4, 5] 对应值 [1,2,4,6]
console.log("    [5, 3, 4, 0] 的 LIS 索引:", getSequence([5, 3, 4, 0]));   // 期望 [1, 2] 对应值 [3, 4]
console.log("    [2, 2, 2] 的 LIS 索引:", getSequence([2, 2, 2]));         // 期望 [0] （非严格递增，只取第一个）
console.log();                                          // 打印空行

// ===== 第三部分：完整实现 patchKeyedChildren =====
console.log("【第三部分：完整实现 patchKeyedChildren（含第5步）】"); // 打印小节标题

function patchKeyedChildren(c1, c2) {
  var i = 0;                                           // 从头扫描的指针
  var e1 = c1.length - 1;                              // 旧列表尾指针
  var e2 = c2.length - 1;                              // 新列表尾指针

  // 第 1 步：从头同步
  while (i <= e1 && i <= e2 && c1[i].key === c2[i].key) {
    patch(c1[i], c2[i]);                               // 复用节点
    i++;                                               // 指针后移
  }

  // 第 2 步：从尾同步
  while (i <= e1 && i <= e2 && c1[e1].key === c2[e2].key) {
    patch(c1[e1], c2[e2]);                             // 复用节点
    e1--;                                              // 旧尾指针前移
    e2--;                                              // 新尾指针前移
  }

  // 第 3 步：仅新增（旧列表遍历完，新列表还有剩余）
  if (i > e1) {
    while (i <= e2) {
      mount(c2[i]);                                    // 挂载新节点
      i++;
    }
    return;                                            // 结束
  }

  // 第 4 步：仅卸载（新列表遍历完，旧列表还有剩余）
  if (i > e2) {
    while (i <= e1) {
      unmount(c1[i]);                                  // 卸载旧节点
      i++;
    }
    return;                                            // 结束
  }

  // 第 5 步：未知子序列处理
  // 此时 i..e1 是旧的未知子序列，i..e2 是新的未知子序列
  var s1 = i;                                          // 旧未知子序列的起点
  var s2 = i;                                          // 新未知子序列的起点
  var toBePatched = e2 - s2 + 1;                       // 需要处理的新节点数量
  console.log("  [第5步] 未知子序列: 旧[" + s1 + ".." + e1 + "], 新[" + s2 + ".." + e2 + "]");

  // 5.1 建立 key → 新索引 的 Map
  var keyToNewIndex = new Map();                       // 创建 Map
  for (var j = s2; j <= e2; j++) {                     // 遍历新子序列
    keyToNewIndex.set(c2[j].key, j - s2);              // 记录 key → 相对索引（0 开始）
  }

  // 5.2 遍历旧子序列，填充 newIndexToOldIndexMap
  var newIndexToOldIndexMap = new Array(toBePatched).fill(0); // 初始化为 0（0 表示新增）
  for (var j = s1; j <= e1; j++) {                     // 遍历旧子序列
    var oldVNode = c1[j];                              // 取旧节点
    var newIndex = keyToNewIndex.get(oldVNode.key);    // 查 key 映射，找新位置
    if (newIndex === undefined) {
      // 旧节点在新列表中不存在 → 卸载
      unmount(oldVNode);
    } else {
      // 旧节点在新列表中存在 → 记录映射（值 = 旧索引 + 1，+1 是为了让 0 表示"新增"）
      newIndexToOldIndexMap[newIndex] = j + 1;         // j+1 是因为 0 是哨兵值
      patch(oldVNode, c2[s2 + newIndex]);              // patch 复用节点
    }
  }
  console.log("  newIndexToOldIndexMap:", newIndexToOldIndexMap);

  // 5.3 求最长递增子序列（LIS）
  // LIS 中的索引对应的节点不需要移动
  var lis = getSequence(newIndexToOldIndexMap);        // 返回的是索引数组
  var lisSet = new Set(lis);                           // 转成 Set 方便 O(1) 查找
  console.log("  LIS 索引:", lis, "→ 这些位置的节点不需要移动");

  // 5.4 从后向前遍历新子序列，执行移动和挂载
  // 为什么从后向前？因为 insertBefore 需要参考节点，从后向前时下一个节点已就位
  for (var j = toBePatched - 1; j >= 0; j--) {         // 从后向前
    var newVNode = c2[s2 + j];                         // 取新节点
    if (newIndexToOldIndexMap[j] === 0) {
      // 值为 0 → 纯新增 → 挂载
      mount(newVNode);
    } else if (!lisSet.has(j)) {
      // 不在 LIS 中 → 需要移动
      move(newVNode);
    }
    // 在 LIS 中 → 不需要移动，什么都不做
  }
}

console.log("  patchKeyedChildren 已定义");              // 打印提示
console.log();                                          // 打印空行

// ===== 第四部分：场景一 —— 中间节点倒序 =====
console.log("【场景一：中间节点倒序（LIS 优化的典型场景）】"); // 打印小节标题

// 旧: A B C D E F
// 新: A B E C D F
// 首尾扫描后：中间旧 [C,D,E] vs 新 [E,C,D]
// newIndexToOldIndexMap: E→0(旧idx2+1=3), C→1(旧idx... )
// 让我们看实际输出
var old1 = [h("li","A","A"), h("li","B","B"), h("li","C","C"), h("li","D","D"), h("li","E","E"), h("li","F","F")];
var new1 = [h("li","A","A"), h("li","B","B"), h("li","E","E"), h("li","C","C"), h("li","D","D"), h("li","F","F")];
ops = []; moveCount = 0;                                // 清空日志和计数器
patchKeyedChildren(old1, new1);                         // 执行 Diff
console.log("  操作日志:");
ops.forEach(function (op) { console.log("  " + op); }); // 打印操作日志
console.log("  移动次数:", moveCount, "（LIS 优化后只移动 E）"); // 打印移动次数
console.log();                                          // 打印空行

// ===== 第五部分：场景二 —— 完全倒序 =====
console.log("【场景二：完全倒序】");                      // 打印小节标题

// 旧: A B C D E
// 新: E D C B A
var old2 = [h("li","A","A"), h("li","B","B"), h("li","C","C"), h("li","D","D"), h("li","E","E")];
var new2 = [h("li","E","E"), h("li","D","D"), h("li","C","C"), h("li","B","B"), h("li","A","A")];
ops = []; moveCount = 0;                                // 清空日志和计数器
patchKeyedChildren(old2, new2);                         // 执行 Diff
console.log("  操作日志:");
ops.forEach(function (op) { console.log("  " + op); }); // 打印操作日志
console.log("  移动次数:", moveCount, "（C 在 LIS 中不需要移动，其他都要移动）"); // 打印移动次数
console.log();                                          // 打印空行

// ===== 第六部分：场景三 —— 新增节点在中间 =====
console.log("【场景三：中间新增节点】");                  // 打印小节标题

// 旧: A B C D
// 新: A B X C D
// 首尾扫描：A=A, B=B, D=D, C=C → 中间只剩新 [X]
// X 在旧列表不存在 → mount
var old3 = [h("li","A","A"), h("li","B","B"), h("li","C","C"), h("li","D","D")];
var new3 = [h("li","A","A"), h("li","B","B"), h("li","X","X"), h("li","C","C"), h("li","D","D")];
ops = []; moveCount = 0;                                // 清空日志和计数器
patchKeyedChildren(old3, new3);                         // 执行 Diff
console.log("  操作日志:");
ops.forEach(function (op) { console.log("  " + op); }); // 打印操作日志
console.log("  移动次数:", moveCount, "（X 是纯新增，其他被首尾扫描处理）"); // 打印移动次数
console.log();                                          // 打印空行

// ===== 第七部分：场景四 —— 删除中间节点 =====
console.log("【场景四：删除中间节点】");                  // 打印小节标题

// 旧: A B C D E
// 新: A B D E
// 首尾扫描：A=A, B=B, E=E, D=D → 中间旧 [C] 在新列表不存在 → unmount
var old4 = [h("li","A","A"), h("li","B","B"), h("li","C","C"), h("li","D","D"), h("li","E","E")];
var new4 = [h("li","A","A"), h("li","B","B"), h("li","D","D"), h("li","E","E")];
ops = []; moveCount = 0;                                // 清空日志和计数器
patchKeyedChildren(old4, new4);                         // 执行 Diff
console.log("  操作日志:");
ops.forEach(function (op) { console.log("  " + op); }); // 打印操作日志
console.log("  移动次数:", moveCount, "（C 被卸载，其他被首尾扫描处理）"); // 打印移动次数
console.log();                                          // 打印空行

// ===== 总结 =====
console.log("【总结】");
console.log("  1. 未知子序列 = 首尾扫描无法处理的中间部分");
console.log("  2. 用 Map 建立 key→新索引 映射，把查找降到 O(1)");
console.log("  3. newIndexToOldIndexMap 记录新节点对应的旧位置（+1，0 表示新增）");
console.log("  4. LIS（最长递增子序列）找出不需要移动的节点，最小化移动次数");
console.log("  5. 从后向前遍历，用 insertBefore 的参考节点执行移动和挂载");
console.log("  6. LIS 不是数学游戏，而是实实在在减少 DOM 操作的工程优化");`
  },

  // =========================================================
  // 第十八章：组件挂载：setup 与渲染上下文
  // =========================================================
  {
    id: "vs-component-mount",
    group: "第四部分 组件系统",
    icon: "🧩",
    title: "组件挂载：setup 与渲染上下文",
    content: `
# 组件挂载：setup 与渲染上下文

## 一、从普通元素到组件

在前面的章节中，我们处理的虚拟节点都是"原生元素"——\`div\`、\`span\`、\`li\` 这些直接对应 DOM 标签的节点。但 Vue 真正强大的地方在于**组件**——一种可复用的、有自己状态和逻辑的"自定义元素"。

### 1.1 组件 VNode 的特殊性

当一个虚拟节点的 \`type\` 不是字符串（标签名），而是一个**对象或函数**时，它就是一个组件 VNode：

\`\`\`javascript
// 原生元素 VNode
{ type: "div", props: {...}, children: [...] }

// 组件 VNode
{ type: { setup() {...}, render() {...} }, props: {...} }
\`\`\`

组件 VNode 不能直接"渲染成 DOM"——它需要先**实例化**：执行 setup 函数、创建渲染上下文、调用 render 函数获取子树、再递归挂载子树。这个"实例化"的过程，就是**组件挂载**。

### 1.2 生活类比：工厂组装线

把组件挂载想象成一条**工厂组装线**：

- **原生元素**（div、span）= 标准零件，直接从仓库拿出来装上去就行
- **组件** = 一个"子组装车间"，它有自己的图纸（setup）、自己的工具箱（状态）、自己的半成品（子树）

当总装线遇到一个"子组装车间"的订单时，它不会自己动手组装，而是：

1. **建车间**：创建组件实例（instance），分配工位
2. **读图纸**：执行 setup 函数，初始化状态和副作用
3. **开工具箱**：把 setup 返回的东西放进渲染上下文
4. **组装半成品**：调用 render 函数，拿到这个车间生产的子树（也是 VNode）
5. **递归组装**：把子树送到总装线上继续处理

理解了这个类比，组件挂载的每一步都有了对应的"工程含义"。

## 二、组件实例的数据结构

Vue 3 的组件实例（instance）是一个非常重要的对象，它存储了组件运行时的所有信息。我们来看它的核心字段：

\`\`\`javascript
var instance = {
  // ===== 标识 =====
  uid: 0,                    // 唯一 ID
  type: ComponentOptions,    // 组件定义对象（你写的那个对象）
  parent: null,              // 父组件实例

  // ===== 输入 =====
  props: {},                 // 从父组件接收的 props（只读）
  attrs: {},                 // 未在 props 中声明的属性（fallthrough）
  slots: {},                 // 插槽内容

  // ===== 状态 =====
  setupState: {},            // setup 返回的对象（暴露给模板的状态）
  ctx: {},                   // 渲染上下文（代理对象）
  data: {},                  // Options API 的 data（如果有）

  // ===== 渲染 =====
  subTree: null,             // 组件 render 返回的子树（VNode）
  render: null,              // 编译后的 render 函数
  vnode: null,               // 组件自己的 VNode

  // ===== 生命周期 =====
  isMounted: false,          // 是否已挂载（区分首次挂载和更新）
  mounted: [],               // onMounted 钩子队列
  updated: [],               // onUpdated 钩子队列
  unmounted: [],             // onUnmounted 钩子队列
};
\`\`\`

### 2.1 为什么需要这么多的字段

每个字段都对应一个具体的运行时需求：

| 字段 | 作用 | 为什么需要 |
| --- | --- | --- |
| \`props\` | 存储父组件传入的数据 | props 是组件的"输入接口"，只读 |
| \`setupState\` | 存储 setup 返回的状态 | Composition API 的状态来源 |
| \`ctx\` | 渲染上下文代理对象 | 让 render 函数能同时访问 props 和 setupState |
| \`subTree\` | 组件渲染的子树 | 更新时需要和新子树做 Diff |
| \`isMounted\` | 是否已挂载 | 首次挂载和更新的处理逻辑不同 |
| \`mounted\` 等 | 生命周期钩子队列 | 一个组件可能注册多个 onMounted |

## 三、setup 函数：组件的"初始化车间"

\`setup\` 是 Composition API 的入口，也是 Vue 3 组件最核心的函数。它在组件挂载时**最先执行**，早于任何生命周期钩子。

### 3.1 setup 的执行时机

\`\`\`text
组件挂载流程：
  1. 创建 instance
  2. 执行 setup(props, setupContext)  ← 这里
  3. 处理 setup 返回值
  4. 创建渲染上下文 ctx
  5. 执行 render → 获取 subTree
  6. 递归挂载 subTree
  7. 触发 onMounted 钩子
\`\`\`

### 3.2 setup 的两个参数

\`\`\`javascript
setup(props, setupContext) {
  // props: 父组件传入的属性（只读响应式对象）
  // setupContext: { attrs, emit, slots, expose }
  return { count: ref(0) };  // 返回的对象会暴露给模板
}
\`\`\`

- \`props\`：父组件传入的数据，是只读的响应式对象
- \`setupContext\`：包含 \`attrs\`（未声明的属性）、\`emit\`（触发事件）、\`slots\`（插槽）、\`expose\`（暴露公共属性）

### 3.3 setup 的返回值

setup 可以返回两种东西：

1. **对象**：对象的属性会被合并到渲染上下文，模板中可以直接访问
2. **函数**：这个函数会作为组件的 render 函数

\`\`\`javascript
// 返回对象（最常见）
setup() {
  var count = ref(0);
  return { count };  // 模板中可以用 {{ count }}
}

// 返回渲染函数
setup() {
  var count = ref(0);
  return () => h('div', null, count.value);  // 直接作为 render
}
\`\`\`

## 四、渲染上下文（renderContext）的代理

这是组件系统中最精巧的设计之一。

### 4.1 为什么要代理

render 函数在执行时，需要访问组件的各种数据来源：

\`\`\`javascript
render() {
  return h('div', null, this.count + this.msg + this.$props.title);
}
\`\`\`

这里的 \`this.count\` 可能来自 setup 返回值，\`this.msg\` 可能来自 data，\`this.$props.title\` 来自 props。如果让开发者自己记住"这个变量从哪来"，太容易出错。

Vue 用一个**代理对象**（Proxy）把所有数据源统一到 \`this\` 上：

\`\`\`javascript
var ctx = new Proxy(instance, {
  get(target, key) {
    if (key in setupState) return setupState[key];    // 先查 setupState
    if (key in props) return props[key];              // 再查 props
    if (key in data) return data[key];                // 再查 data
    // ...其他来源
  },
  set(target, key, value) {
    if (key in setupState) { setupState[key] = value; return true; }
    // ...只能设置 setupState 和 data，props 只读
  }
});
\`\`\`

### 4.2 生活类比：统一服务窗口

把渲染上下文想象成政务大厅的**统一服务窗口**。

以前你要办事，得自己搞清楚"这个证去 A 局办、那个章去 B 局盖、这个表去 C 处领"——三个地方跑断腿。统一服务窗口的做法是：你只管把材料递给窗口，窗口内部自己判断"这个归 A 局、那个归 B 局"，帮你路由到正确的部门。

渲染上下文就是这个"统一窗口"——render 函数只管 \`this.xxx\`，代理对象内部自己判断 \`xxx\` 在 setupState 还是 props 还是 data。

### 4.3 访问优先级

当多个数据源有同名属性时，Vue 的查找顺序是：

1. \`setupState\`（Composition API 返回的）
2. \`data\`（Options API 的）
3. \`props\`（父组件传入的）
4. \`ctx\` 上的其他属性（如 \`$emit\`、\`$attrs\`）

这个顺序意味着 setupState 优先级最高——这也是 Vue 3 鼓励用 Composition API 的体现。

## 五、组件挂载的完整流程

把前面的知识点串起来，组件挂载的完整流程是：

\`\`\`text
1. 创建组件实例 instance
   - 分配 uid
   - 设置 type、parent、vnode
   - 初始化 props（从 VNode.props 解析）

2. 执行 setup 函数
   - 传入 props 和 setupContext
   - 拿到返回值 setupResult

3. 处理 setup 返回值
   - 如果是函数 → 作为 render
   - 如果是对象 → 存入 setupState

4. 创建渲染上下文 ctx
   - 用 Proxy 代理 instance
   - 统一访问 setupState、props、data

5. 执行 render 函数
   - 用 ctx 作为 this
   - 返回子树 VNode（subTree）

6. 递归挂载 subTree
   - patch(null, subTree) → 子树可能是原生元素，也可能是子组件
   - 子组件会递归走同样的流程

7. 标记 isMounted = true

8. 触发 onMounted 钩子队列
\`\`\`

## 六、props 的初始化

### 6.1 propsOptions 与 props

Vue 在编译时会分析组件的 \`props\` 选项，区分"声明的 props"和"未声明的 attrs"：

\`\`\`javascript
var ComponentOptions = {
  props: ['title', 'count'],  // 声明的 props
  // ...
};

// 父组件传入 <MyComp title="hello" foo="bar" />
// 解析后：
instance.props = { title: "hello" };          // 声明的
instance.attrs = { foo: "bar" };              // 未声明的（fallthrough）
\`\`\`

### 6.2 为什么 props 是只读的

props 是父组件的数据"流下来"给子组件的。如果子组件能直接修改 props，会导致数据流混乱——父组件不知道子组件改了什么，调试困难。所以 Vue 强制 props 只读，子组件要修改数据只能：

- 通过 \`emit\` 通知父组件修改（单向数据流）
- 用 props 的值初始化一个本地 ref（\`var localCount = ref(props.count)\`）

## 七、本章 Demo 说明

下面的 demo 会实现组件挂载的核心流程：

1. 定义组件实例的数据结构
2. 实现 setup 函数的执行和返回值处理
3. 实现渲染上下文的 Proxy 代理
4. 实现组件的 mountComponent 流程
5. 演示 setupState、props、data 的访问优先级
6. 用模拟的 DOM 节点输出挂载结果

这个 demo 会让你直观理解：组件不是一个"特殊的标签"，而是一个有完整生命周期的"运行时单元"。`,
    code: `// ============================================================
// 第十八章 demo：组件挂载 —— setup 与渲染上下文
// 演示内容：
//   1. 定义组件实例的数据结构（instance）
//   2. 实现 setup 函数的执行和返回值处理
//   3. 实现渲染上下文（renderContext）的 Proxy 代理
//   4. 实现组件的 mountComponent 完整流程
//   5. 演示 setupState、props、data 的访问优先级
//   6. 用模拟的 DOM 节点输出挂载结果
// ============================================================

console.log("=".repeat(60));                            // 打印分隔线
console.log("Vue 源码精读 — 第十八章：组件挂载与渲染上下文"); // 打印章节标题
console.log("=".repeat(60));                            // 打印空行
console.log();                                          // 打印空行

// ===== 第一部分：模拟响应式 ref（简化版）=====
console.log("【第一部分：模拟 ref（简化版响应式）】");    // 打印小节标题

// ref：创建一个响应式引用
// 真实 Vue 中 ref 会触发依赖收集，这里简化为带 .value 的对象
function ref(value) {
  return {                                              // 返回一个对象
    _isRef: true,                                       // 标记是 ref（简化版，真实 Vue 用 RefImpl 类）
    _value: value,                                      // 存储实际值
    get value() { return this._value; },                // 读取时返回 _value
    set value(v) { this._value = v; }                   // 设置时更新 _value
  };
}

console.log("  ref 函数已定义");                          // 打印提示
console.log();                                          // 打印空行

// ===== 第二部分：模拟 DOM 节点 =====
console.log("【第二部分：模拟 DOM 节点】");               // 打印小节标题

// createDomNode：模拟创建真实 DOM 节点
// 真实 Vue 中会调用 document.createElement，这里用对象模拟
function createDomNode(tag) {
  return {
    tag: tag,                                           // 标签名
    children: [],                                       // 子节点列表
    text: null,                                         // 文本内容（叶子节点）
    el: null,                                           // 真实 DOM 引用（模拟）
    appendChild(child) { this.children.push(child); },  // 添加子节点
    setText(text) { this.text = text; }                 // 设置文本
  };
}

console.log("  createDomNode 函数已定义");                // 打印提示
console.log();                                          // 打印空行

// ===== 第三部分：创建组件实例 =====
console.log("【第三部分：创建组件实例】");                // 打印小节标题

// 全局 UID 计数器，给每个组件实例分配唯一 ID
var uid = 0;

// createComponentInstance：创建组件实例
// 对应 Vue 源码中的 createComponentInstance（component.ts）
// 参数：
//   vnode   : 组件的 VNode（type 是组件定义对象）
//   parent  : 父组件实例（用于 provide/inject 等）
function createComponentInstance(vnode, parent) {
  var instance = {
    // ===== 标识 =====
    uid: uid++,                                         // 分配唯一 ID
    type: vnode.type,                                   // 组件定义对象
    parent: parent,                                     // 父实例

    // ===== 输入 =====
    props: {},                                          // 初始化 props（稍后填充）
    attrs: {},                                          // 未声明的属性
    vnode: vnode,                                       // 组件自己的 VNode

    // ===== 状态 =====
    setupState: {},                                     // setup 返回的状态
    ctx: null,                                          // 渲染上下文（Proxy，稍后创建）

    // ===== 渲染 =====
    subTree: null,                                      // render 返回的子树
    render: null,                                       // render 函数
    proxy: null,                                        // 渲染上下文代理

    // ===== 生命周期 =====
    isMounted: false,                                   // 是否已挂载
    mounted: [],                                        // onMounted 钩子队列
  };
  console.log("  创建实例: uid=" + instance.uid + ", type=" + (vnode.type.name || "匿名"));
  return instance;                                      // 返回实例
}

console.log("  createComponentInstance 函数已定义");      // 打印提示
console.log();                                          // 打印空行

// ===== 第四部分：初始化 props =====
console.log("【第四部分：初始化 props】");                // 打印小节标题

// initProps：从 VNode 中解析 props
// 对应 Vue 源码中的 initProps（componentProps.ts）
function initProps(instance, rawProps) {
  var propsOptions = instance.type.props || [];         // 组件声明的 props 列表
  var props = {};                                       // 解析后的 props
  var attrs = {};                                       // 未声明的 attrs

  // 遍历父组件传入的所有属性
  for (var key in rawProps) {
    var value = rawProps[key];                          // 取属性值
    if (propsOptions.indexOf(key) !== -1) {
      // 属性在 props 选项中声明了 → 放入 props
      props[key] = value;
    } else {
      // 属性未声明 → 放入 attrs（fallthrough）
      attrs[key] = value;
    }
  }

  instance.props = props;                               // 设置 instance.props
  instance.attrs = attrs;                               // 设置 instance.attrs
  console.log("  props:", JSON.stringify(props), "attrs:", JSON.stringify(attrs));
}

console.log("  initProps 函数已定义");                    // 打印提示
console.log();                                          // 打印空行

// ===== 第五部分：执行 setup =====
console.log("【第五部分：执行 setup 函数】");             // 打印小节标题

// setupStatefulComponent：执行 setup 函数并处理返回值
// 对应 Vue 源码中的 setupStatefulComponent（component.ts）
function setupStatefulComponent(instance) {
  var Component = instance.type;                        // 取组件定义对象
  var setup = Component.setup;                          // 取 setup 函数

  if (setup) {
    // 构建 setupContext：{ attrs, emit, slots, expose }
    var setupContext = {
      attrs: instance.attrs,                            // 未声明的属性
      emit: function (event) {                          // 事件触发函数（简化版）
        console.log("    [emit] 触发事件:", event);
      },
      slots: {},                                        // 插槽（简化版）
      expose: function () {}                            // 暴露公共属性（简化版）
    };

    console.log("  执行 setup...");
    // 执行 setup，传入 props 和 context
    var setupResult = setup(instance.props, setupContext);

    // 处理 setup 返回值
    if (typeof setupResult === "function") {
      // 返回函数 → 作为 render 函数
      instance.render = setupResult;
      console.log("  setup 返回函数 → 作为 render");
    } else if (setupResult && typeof setupResult === "object") {
      // 返回对象 → 存入 setupState
      instance.setupState = setupResult;
      console.log("  setup 返回对象 → 存入 setupState:", Object.keys(setupResult));
    }
  }

  // 如果组件没有 setup 但有 render 选项，直接用
  if (!instance.render && Component.render) {
    instance.render = Component.render;
  }
}

console.log("  setupStatefulComponent 函数已定义");       // 打印提示
console.log();                                          // 打印空行

// ===== 第六部分：创建渲染上下文（Proxy 代理）=====
console.log("【第六部分：创建渲染上下文（Proxy 代理）】"); // 打印小节标题

// createRenderContext：创建渲染上下文代理
// 对应 Vue 源码中的 PublicInstanceProxyHandlers（componentPublicInstance.ts）
// 这是组件模板/render 中 this 能访问各种数据来源的关键
function createRenderContext(instance) {
  // 用 Proxy 代理 instance，统一访问 setupState、props、data 等
  var proxy = new Proxy(instance, {
    // get 拦截：当访问 proxy.xxx 时触发
    get: function (target, key) {
      var setupState = target.setupState;               // setup 返回的状态
      var props = target.props;                         // props

      // 访问优先级：setupState > props > 其他
      if (key in setupState) {
        // 如果在 setupState 中，返回 setupState[key]
        // 如果是 ref，自动解包 .value
        var val = setupState[key];
        return (val && val._isRef) ? val.value : val;
      } else if (key in props) {
        // 如果在 props 中，返回 props[key]
        return props[key];
      } else if (key === "$props") {
        // 特殊属性 $props → 返回整个 props 对象
        return props;
      } else if (key === "$emit") {
        // 特殊方法 $emit
        return function (e) { console.log("    [$emit]", e); };
      } else {
        console.log("    [ctx.get] 未找到:", key);
        return undefined;
      }
    },
    // set 拦截：当设置 proxy.xxx = yyy 时触发
    set: function (target, key, value) {
      var setupState = target.setupState;
      if (key in setupState) {
        // 只允许设置 setupState（props 只读！）
        var val = setupState[key];
        if (val && val._isRef) {
          val.value = value;                            // ref 自动设置 .value
        } else {
          setupState[key] = value;                      // 普通值直接设置
        }
        return true;                                    // 返回 true 表示设置成功
      } else {
        console.log("    [ctx.set] 警告: 不能设置未声明的属性:", key);
        return true;
      }
    }
  });

  instance.proxy = proxy;                               // 存入 instance
  return proxy;                                         // 返回代理对象
}

console.log("  createRenderContext 函数已定义");          // 打印提示
console.log();                                          // 打印空行

// ===== 第七部分：组件挂载 =====
console.log("【第七部分：组件挂载 mountComponent】");      // 打印小节标题

// mountComponent：组件挂载的完整流程
// 对应 Vue 源码中的 mountComponent（renderer.ts）
function mountComponent(vnode, parent) {
  console.log("--- 开始挂载组件 ---");

  // 1. 创建组件实例
  var instance = createComponentInstance(vnode, parent);

  // 2. 初始化 props
  console.log("  [步骤2] 初始化 props");
  initProps(instance, vnode.props || {});

  // 3. 执行 setup 函数
  console.log("  [步骤3] 执行 setup");
  setupStatefulComponent(instance);

  // 4. 创建渲染上下文
  console.log("  [步骤4] 创建渲染上下文");
  createRenderContext(instance);

  // 5. 执行 render，获取子树
  console.log("  [步骤5] 执行 render，获取子树");
  // 用 proxy 作为 this 调用 render
  var subTree = instance.render.call(instance.proxy);
  instance.subTree = subTree;                           // 保存子树（更新时要用）
  console.log("  子树:", JSON.stringify(subTree));

  // 6. 递归挂载子树（简化版，只处理原生元素）
  console.log("  [步骤6] 递归挂载子树");
  var el = mountElement(subTree);
  vnode.el = el;                                        // 把 DOM 引用存回 VNode

  // 7. 标记已挂载
  instance.isMounted = true;
  console.log("  [步骤7] isMounted = true");

  // 8. 触发 onMounted 钩子
  console.log("  [步骤8] 触发 onMounted 钩子");
  instance.mounted.forEach(function (hook) { hook.call(instance.proxy); });

  console.log("--- 组件挂载完成 ---");
  return el;                                            // 返回 DOM 引用
}

// mountElement：挂载原生元素（简化版）
function mountElement(vnode) {
  var el = createDomNode(vnode.type);                   // 创建 DOM 节点
  if (typeof vnode.children === "string") {
    el.setText(vnode.children);                         // 文本子节点
  } else if (Array.isArray(vnode.children)) {
    vnode.children.forEach(function (child) {
      var childEl = mountElement(child);                // 递归挂载
      el.appendChild(childEl);
    });
  }
  return el;                                            // 返回 DOM 引用
}

console.log("  mountComponent / mountElement 函数已定义"); // 打印提示
console.log();                                          // 打印空行

// ===== 第八部分：定义组件并挂载 =====
console.log("【第八部分：定义组件并挂载】");              // 打印小节标题

// onMounted 的简化实现 —— 把钩子存入"当前实例"
// 真实 Vue 中用 setCurrentInstance 实现，这里用闭包模拟
var currentInstance = null;
function onMounted(hook) {
  if (currentInstance) {
    currentInstance.mounted.push(hook);                 // 存入钩子队列
    console.log("  [onMounted] 注册钩子");
  }
}

// 定义一个计数器组件
var Counter = {
  name: "Counter",
  // 声明的 props
  props: ["title", "initialCount"],
  // setup 函数
  setup: function (props) {
    console.log("    [setup 内] props =", JSON.stringify(props));

    // 创建响应式状态
    var count = ref(props.initialCount || 0);

    // 注册 onMounted 钩子
    onMounted(function () {
      console.log("    [onMounted] 组件已挂载！当前 count =", count.value);
    });

    // 返回对象 → 暴露给 render
    return {
      count: count,                                     // 暴露 ref
      increment: function () { count.value++; }         // 暴露方法
    };
  },
  // render 函数
  render: function () {
    // this 是渲染上下文代理，能访问 setupState 和 props
    // this.count 会自动解包 ref（通过 Proxy 的 get 拦截）
    console.log("    [render 内] this.title =", this.title, ", this.count =", this.count);
    return {
      type: "div",
      props: { class: "counter" },
      children: [
        { type: "h1", children: this.title },
        { type: "p", children: "Count: " + this.count },
      ]
    };
  }
};

// 创建组件 VNode
var vnode = {
  type: Counter,
  props: { title: "我的计数器", initialCount: 42, foo: "bar" } // foo 未声明 → attrs
};

// 设置 currentInstance 用于 onMounted 注册
// 真实 Vue 在 setupStatefulComponent 中设置
var fakeInstance = { mounted: [] };
currentInstance = fakeInstance;

// 挂载组件
var el = mountComponent(vnode, null);

// 把 onMounted 钩子从 fakeInstance 挪到真正的 instance
// （这是简化处理的副作用，真实 Vue 不需要这一步）
console.log();                                          // 打印空行
console.log("【验证：渲染上下文的访问优先级】");          // 打印小节标题

// 测试 Proxy 的访问优先级
// 如果 setupState 和 props 有同名属性，setupState 优先
var Comp2 = {
  name: "PriorityTest",
  props: ["name"],
  setup: function (props) {
    return { name: "from setup" };                      // setupState 也有 name
  },
  render: function () {
    // this.name 应该是 "from setup"（setupState 优先）
    return { type: "div", children: "name = " + this.name };
  }
};

var vnode2 = { type: Comp2, props: { name: "from props" } };
mountComponent(vnode2, null);                           // 挂载并观察输出

console.log();                                          // 打印空行
console.log("【验证：props 是只读的】");                  // 打印小节标题
var Comp3 = {
  name: "ReadOnlyProps",
  props: ["title"],
  setup: function (props) {
    // 尝试修改 props（应该失败或警告）
    try {
      props.title = "hacked";
      console.log("  props 被修改了？:", props.title);   // 真实 Vue 会警告
    } catch (e) {
      console.log("  props 修改失败:", e.message);
    }
    return {};
  },
  render: function () { return { type: "div", children: this.title }; }
};
mountComponent({ type: Comp3, props: { title: "原始标题" } }, null);

console.log();                                          // 打印空行
// ===== 总结 =====
console.log("【总结】");
console.log("  1. 组件 VNode 的 type 是对象/函数，需要'实例化'才能渲染");
console.log("  2. 组件实例(instance)存储了组件运行时的所有信息");
console.log("  3. setup 是 Composition API 入口，最先执行，返回值暴露给模板");
console.log("  4. 渲染上下文用 Proxy 代理，统一访问 setupState/props/data");
console.log("  5. 访问优先级：setupState > props > data");
console.log("  6. 挂载流程：创建实例 → initProps → setup → 创建ctx → render → 挂载子树 → onMounted");`
  },

  // =========================================================
  // 第十九章：组件更新：props 变化与重渲染
  // =========================================================
  {
    id: "vs-component-update",
    group: "第四部分 组件系统",
    icon: "🔄",
    title: "组件更新：props 变化与重渲染",
    content: `
# 组件更新：props 变化与重渲染

## 一、组件什么时候需要更新

组件挂载之后，并不是一劳永逸的。有两种情况会触发组件更新：

1. **props 变化**：父组件重新渲染时，传给子组件的 props 可能变了
2. **自身状态变化**：组件内部的 ref/reactive 数据被修改

本章重点关注 **props 变化触发的更新**，自身状态变化的更新机制类似（都是重新执行 render + Diff）。

### 1.1 生活类比：工厂车间的"返工"

把组件更新想象成工厂车间的**返工流程**。

车间第一次生产时（挂载），按图纸组装出产品。但后来客户改了需求（props 变化）：

- 客户说"颜色改成红色" → 车间需要重新调整（更新）
- 车间不会把整个产品拆掉重做（太浪费），而是**在现有产品上修改**
- 车间主任（instance）不变，工位不变，工具箱不变，只是重新执行一遍组装流程（render）
- 拿到新的半成品（新 subTree），和上次的半成品（旧 subTree）比对，只改不同的部分（patch）

这就是组件更新的本质：**复用组件实例，重新执行 render，对新旧子树做 Diff**。

### 1.2 为什么要复用实例

不复用实例意味着：每次更新都创建新实例、重新执行 setup、重新初始化所有状态。这会导致：

- **状态丢失**：setup 里的 ref/reactive 会被重新创建，之前的值全没了
- **副作用重复执行**：onMounted 等钩子会再次触发（但组件并没有重新挂载）
- **性能浪费**：创建实例、初始化 props、执行 setup 都有开销

所以组件更新的核心原则是：**实例复用，只更新必要部分**。

## 二、组件更新的触发条件

### 2.1 父组件 render → 子组件 props 变化

最常见的更新场景：

\`\`\`text
父组件 state 变了 → 父组件重新 render → 生成新的子组件 VNode
→ Vue 发现子组件 VNode 的 props 和上次不同
→ 触发子组件更新
\`\`\`

### 2.2 patchComponent 的判断

当 Vue 在 patch 过程中遇到一个组件 VNode，且旧 VNode 也是组件时，会走 \`patchComponent\`：

\`\`\`javascript
function patchComponent(n1, n2, instance) {
  // n1 是旧 VNode，n2 是新 VNode
  // 如果 type 相同（同一个组件），复用实例
  if (n1.type === n2.type) {
    // 复用旧实例
    instance.next = n2;           // 把新 VNode 存起来
    updateComponent(instance);    // 触发更新
  } else {
    // type 不同 → 卸载旧的，挂载新的
    unmount(n1);
    mount(n2);
  }
}
\`\`\`

注意：这里用 \`type\` 判断"是不是同一个组件"，而不是用 key。因为组件的复用粒度是"组件类型"，key 主要用于列表中区分同类组件的不同实例。

## 三、props 的更新对比

### 3.1 为什么要对比 props

父组件每次 render 都会生成新的 props 对象。但新 props 和旧 props 可能完全相同（父组件状态没变但仍然 re-render），也可能只有部分属性变化。

如果直接把新 props 整个赋值给 instance.props，会丢失"哪些变了"的信息。而且 props 是响应式的，直接赋值会触发所有依赖 props 的副作用，即使 props 没变。

所以需要**逐个对比**新旧 props，只更新真正变化的属性。

### 3.2 updateProps 的逻辑

\`\`\`text
遍历新 props 的每个 key：
  if (newProps[key] !== oldProps[key]) {
    instance.props[key] = newProps[key];  // 更新变化的属性
    hasChange = true;
  }
遍历旧 props 的每个 key：
  if (!(key in newProps)) {
    delete instance.props[key];  // 删除新 props 中没有的属性
    hasChange = true;
  }
if (hasChange) triggerComponentUpdate(instance);  // 有变化才触发更新
\`\`\`

### 3.3 浅比较（shallow equal）

Vue 的 props 对比是**浅比较**——只比较第一层属性值，不递归比较对象内部。比如：

\`\`\`javascript
oldProps = { style: { color: "red" } };
newProps = { style: { color: "red" } };
// oldProps.style !== newProps.style → 认为变了（即使内容相同）
\`\`\`

这是因为深层比较太昂贵，而且 props 通常是基本类型或引用稳定的对象。

## 四、子树 patch：旧子树 vs 新子树

### 4.1 重新执行 render

props 更新后，需要重新执行 render 获取新的子树：

\`\`\`javascript
function updateComponent(instance) {
  // 1. 更新 props
  updateProps(instance, instance.next.props);
  // 2. 重新执行 render，获取新子树
  var nextTree = instance.render.call(instance.proxy);
  // 3. 保存旧子树
  var prevTree = instance.subTree;
  // 4. 更新 instance.subTree
  instance.subTree = nextTree;
  // 5. patch 新旧子树
  patch(prevTree, nextTree);
  // 6. 触发 onUpdated 钩子
  instance.updated.forEach(function (hook) { hook(); });
}
\`\`\`

### 4.2 为什么要 patch 而不是重新挂载

子树可能包含大量 DOM 节点，重新挂载会全部销毁重建，性能差且丢失状态。patch（Diff）能复用旧节点，只更新差异部分——这正是我们在第 16-17 章学到的 Diff 算法的用武之地。

### 4.3 子树 patch 的递归性

组件的子树可能包含子组件，子组件的子树又可能包含子子组件……所以 patch 是**递归**的：

\`\`\`text
patch(旧子树, 新子树)
  → 遇到原生元素 → patchElement（更新属性/子节点）
  → 遇到组件 → patchComponent（递归更新子组件）
    → patch(子组件旧子树, 子组件新子树)
      → ...
\`\`\`

## 五、组件实例的复用

### 5.1 哪些被复用

组件更新时，以下内容**不会重新创建**：

| 字段 | 是否复用 | 原因 |
| --- | --- | --- |
| instance 本身 | ✅ 复用 | 实例是组件的"身份"，不能换 |
| setupState | ✅ 复用 | setup 只执行一次，状态要保留 |
| render 函数 | ✅ 复用 | 同一个组件定义，render 不变 |
| proxy（渲染上下文） | ✅ 复用 | 代理对象可以重复使用 |
| props | ❌ 更新 | 父组件传入的数据可能变化 |
| subTree | ❌ 更新 | 重新 render 生成新子树 |
| isMounted | ✅ 复用 | 已经是 true，不变 |

### 5.2 为什么 setup 只执行一次

setup 的职责是"初始化"——创建响应式状态、注册生命周期、返回暴露给模板的数据。这些事情只需要做一次：

- 响应式状态创建一次就够了，后续靠 .value 修改
- 生命周期注册一次就够了，钩子存在 instance 的队列里
- setup 的返回值存入 setupState，后续 render 直接用

如果每次更新都重新执行 setup，ref 会被重新创建（值丢失）、onMounted 会重复注册（钩子重复执行）——完全错误。

## 六、更新流程的完整步骤

\`\`\`text
1. 父组件 re-render，生成新的子组件 VNode（n2）
2. patch 阶段发现 n1.type === n2.type → patchComponent
3. patchComponent 复用 instance，设置 instance.next = n2
4. updateComponent(instance):
   a. 更新 props：对比新旧 props，更新变化的属性
   b. 重新执行 render → 获取新子树 nextTree
   c. 获取旧子树 prevTree = instance.subTree
   d. 更新 instance.subTree = nextTree
   e. patch(prevTree, nextTree) → 递归 Diff 新旧子树
   f. 更新 vnode.el = nextTree.el（更新 DOM 引用）
   g. 触发 onUpdated 钩子队列
\`\`\`

## 七、优化：shouldComponentUpdate 与 bailout

### 7.1 props 没变时跳过更新

如果新旧 props 完全相同（浅比较），组件其实不需要更新——render 的结果不会变。Vue 3 有一个 \`hasPropsChanged\` 的检查：

\`\`\`javascript
function hasPropsChanged(prevProps, nextProps) {
  var nextKeys = Object.keys(nextProps);
  // 数量不同 → 变了
  if (nextKeys.length !== Object.keys(prevProps).length) return true;
  // 逐个比较值
  for (var i = 0; i < nextKeys.length; i++) {
    var key = nextKeys[i];
    if (nextProps[key] !== prevProps[key]) return true;
  }
  return false;  // 完全相同 → 不需要更新
}
\`\`\`

如果 \`!hasPropsChanged\`，直接 return，不触发更新——这就是 **bailout 优化**。

### 7.2 生活类比：质检员的"免检"

工厂的质检员（hasPropsChanged）检查原料（props）：

- 原料和上次一样 → "免检通过"，车间不用返工（bailout）
- 原料有变化 → "需要返工"，触发更新流程

这个优化能避免大量不必要的 re-render，是 Vue 性能的关键。

## 八、本章 Demo 说明

下面的 demo 会实现组件更新的完整流程：

1. 复用上一章的组件实例和挂载逻辑
2. 实现 patchComponent（复用实例）
3. 实现 updateProps（浅比较 + 更新）
4. 实现子树 patch（简化版 Diff）
5. 演示 props 变化触发重渲染
6. 演示 bailout 优化（props 没变时跳过）

这个 demo 会让你直观理解：组件更新不是"重新挂载"，而是"复用实例 + 重新 render + Diff 子树"。`,
    code: `// ============================================================
// 第十九章 demo：组件更新 —— props 变化与重渲染
// 演示内容：
//   1. 复用组件实例和挂载逻辑（基于第十八章）
//   2. 实现 patchComponent（复用实例，不重新创建）
//   3. 实现 updateProps（浅比较 + 更新变化的属性）
//   4. 实现子树 patch（简化版 Diff，复用旧 DOM）
//   5. 演示 props 变化触发重渲染
//   6. 演示 bailout 优化（props 没变时跳过更新）
// ============================================================

console.log("=".repeat(60));                            // 打印分隔线
console.log("Vue 源码精读 — 第十九章：组件更新与重渲染"); // 打印章节标题
console.log("=".repeat(60));                            // 打印空行
console.log();                                          // 打印空行

// ===== 第一部分：基础设施（复用第十八章的简化版）=====
console.log("【第一部分：基础设施】");                    // 打印小节标题

// 简化版 ref
function ref(value) {
  return { _isRef: true, _value: value, get value() { return this._value; }, set value(v) { this._value = v; } };
}

// 简化版 DOM 节点
function createDomNode(tag) {
  return {
    tag: tag, children: [], text: null,
    appendChild(c) { this.children.push(c); },
    setText(t) { this.text = t; }
  };
}

// 操作日志
var ops = [];
var uid = 0;                                            // 实例 ID 计数器

console.log("  基础设施已定义");                          // 打印提示
console.log();                                          // 打印空行

// ===== 第二部分：组件实例与挂载（简化版）=====
console.log("【第二部分：组件实例与挂载（简化版）】");    // 打印小节标题

// 创建组件实例
function createComponentInstance(vnode, parent) {
  var instance = {
    uid: uid++,                                         // 唯一 ID
    type: vnode.type,                                   // 组件定义
    parent: parent,
    props: {},                                          // props（稍后初始化）
    attrs: {},
    setupState: {},                                     // setup 返回的状态
    proxy: null,                                        // 渲染上下文代理
    subTree: null,                                      // render 返回的子树
    render: null,                                       // render 函数
    vnode: vnode,                                       // 当前 VNode
    next: null,                                         // 下一次更新的 VNode
    isMounted: false,                                   // 是否已挂载
    mounted: [],                                        // onMounted 钩子队列
    updated: [],                                        // onUpdated 钩子队列
  };
  return instance;                                      // 返回实例
}

// 初始化 props
function initProps(instance, rawProps) {
  var propsOptions = instance.type.props || [];
  var props = {};
  for (var key in rawProps) {
    if (propsOptions.indexOf(key) !== -1) {
      props[key] = rawProps[key];                       // 声明的 → props
    }
  }
  instance.props = props;
}

// 创建渲染上下文（Proxy 代理）
function createRenderContext(instance) {
  var proxy = new Proxy(instance, {
    get: function (target, key) {
      var setupState = target.setupState;
      var props = target.props;
      if (key in setupState) {
        var val = setupState[key];
        return (val && val._isRef) ? val.value : val;   // ref 自动解包
      } else if (key in props) {
        return props[key];
      } else if (key === "$props") {
        return props;
      }
      return undefined;
    },
    set: function (target, key, value) {
      var setupState = target.setupState;
      if (key in setupState) {
        var val = setupState[key];
        if (val && val._isRef) { val.value = value; }   // ref 设置 .value
        else { setupState[key] = value; }
      }
      return true;
    }
  });
  instance.proxy = proxy;
  return proxy;
}

// 执行 setup
function setupStatefulComponent(instance) {
  var Component = instance.type;
  if (Component.setup) {
    var ctx = { attrs: instance.attrs, emit: function () {}, slots: {}, expose: function () {} };
    var result = Component.setup(instance.props, ctx);
    if (result && typeof result === "object") {
      instance.setupState = result;                     // 对象 → setupState
    } else if (typeof result === "function") {
      instance.render = result;                         // 函数 → render
    }
  }
  if (!instance.render && Component.render) {
    instance.render = Component.render;
  }
}

// 挂载原生元素
function mountElement(vnode) {
  var el = createDomNode(vnode.type);
  if (typeof vnode.children === "string") {
    el.setText(vnode.children);
  } else if (Array.isArray(vnode.children)) {
    vnode.children.forEach(function (c) {
      el.appendChild(mountElement(c));
    });
  }
  vnode.el = el;                                        // 存 DOM 引用
  return el;
}

// 挂载组件
function mountComponent(vnode, parent) {
  var instance = createComponentInstance(vnode, parent);
  vnode.component = instance;                           // 把实例存入 VNode（更新时要用）
  initProps(instance, vnode.props || {});
  setupStatefulComponent(instance);
  createRenderContext(instance);
  var subTree = instance.render.call(instance.proxy);
  instance.subTree = subTree;                           // 保存子树
  mountElement(subTree);                                // 挂载子树
  vnode.el = subTree.el;                                // DOM 引用
  instance.isMounted = true;                            // 标记已挂载
  instance.mounted.forEach(function (h) { h.call(instance.proxy); }); // 触发 onMounted
  return instance;
}

console.log("  组件实例与挂载函数已定义");                // 打印提示
console.log();                                          // 打印空行

// ===== 第三部分：实现组件更新 =====
console.log("【第三部分：实现组件更新】");                // 打印小节标题

// hasPropsChanged：检查 props 是否变化（浅比较）
// 对应 Vue 源码中的 hasPropsChanged（componentProps.ts）
function hasPropsChanged(prevProps, nextProps) {
  var nextKeys = Object.keys(nextProps);
  var prevKeys = Object.keys(prevProps);

  // 1. 属性数量不同 → 变了
  if (nextKeys.length !== prevKeys.length) {
    return true;
  }
  // 2. 逐个比较值（浅比较，用 !== 而不是深度比较）
  for (var i = 0; i < nextKeys.length; i++) {
    var key = nextKeys[i];
    if (nextProps[key] !== prevProps[key]) {
      return true;                                      // 有任何一个不同 → 变了
    }
  }
  return false;                                         // 全部相同 → 没变
}

// updateProps：更新 props，返回是否有变化
function updateProps(instance, rawProps) {
  var propsOptions = instance.type.props || [];
  var newProps = {};
  for (var key in rawProps) {
    if (propsOptions.indexOf(key) !== -1) {
      newProps[key] = rawProps[key];
    }
  }
  var changed = hasPropsChanged(instance.props, newProps);
  if (changed) {
    ops.push("  updateProps: props 变化 " + JSON.stringify(instance.props) + " → " + JSON.stringify(newProps));
    instance.props = newProps;                          // 更新 props
  }
  return changed;                                       // 返回是否有变化
}

// patchElement：更新原生元素（简化版 Diff）
// 对比新旧 VNode，更新文本内容
function patchElement(n1, n2) {
  var el = n1.el;                                       // 复用旧 DOM 节点
  n2.el = el;                                           // 把 DOM 引用传给新 VNode

  // 如果文本内容变了，更新文本
  if (typeof n2.children === "string" && n1.children !== n2.children) {
    ops.push("  patchElement: " + n2.type + " 文本更新 '" + n1.children + "' → '" + n2.children + "'");
    el.setText(n2.children);
  } else if (Array.isArray(n2.children)) {
    // 子节点数组：简化处理，只 patch 文本叶子节点
    var oldChildren = Array.isArray(n1.children) ? n1.children : [];
    n2.children.forEach(function (child, i) {
      if (oldChildren[i]) {
        patchElement(oldChildren[i], child);            // 递归 patch
      } else {
        mountElement(child);                            // 新增的子节点
        el.appendChild(child.el);
      }
    });
  }
}

// updateComponent：组件更新的核心
// 对应 Vue 源码中的 updateComponent（renderer.ts）
function updateComponent(instance) {
  var nextVNode = instance.next;                        // 取出待更新的 VNode
  instance.next = null;                                 // 清空 next

  // 1. 更新 props
  var propsChanged = updateProps(instance, nextVNode.props || {});

  // 2. 如果 props 没变 → bailout 优化，跳过更新
  if (!propsChanged) {
    ops.push("  bailout: props 未变化，跳过更新");
    // 仍然要更新 el 引用
    nextVNode.el = instance.vnode.el;
    instance.vnode = nextVNode;
    nextVNode.component = instance;                      // 把实例引用存入新 VNode（下次 patchComponent 要用）
    return;                                             // 直接返回，不重新 render
  }

  ops.push("  updateComponent: 重新 render");
  // 3. 重新执行 render，获取新子树
  var nextTree = instance.render.call(instance.proxy);
  // 4. 获取旧子树
  var prevTree = instance.subTree;
  // 5. 更新 instance.subTree
  instance.subTree = nextTree;
  // 6. patch 新旧子树（Diff）
  ops.push("  patch 子树:");
  patchElement(prevTree, nextTree);
  // 7. 更新 DOM 引用
  nextVNode.el = nextTree.el;
  instance.vnode = nextVNode;
  nextVNode.component = instance;                        // 把实例引用存入新 VNode（下次 patchComponent 要用）
  // 8. 触发 onUpdated 钩子
  instance.updated.forEach(function (hook) {
    hook.call(instance.proxy);
  });
}

// patchComponent：判断是更新还是替换
function patchComponent(n1, n2, parent) {
  var instance = n1.component;                          // 取旧 VNode 的组件实例
  if (n1.type === n2.type) {
    // type 相同 → 复用实例，触发更新
    ops.push("patchComponent: 复用实例 uid=" + instance.uid);
    instance.next = n2;                                 // 存入新 VNode
    updateComponent(instance);                           // 执行更新
  } else {
    // type 不同 → 卸载旧的，挂载新的（本章不演示）
    ops.push("patchComponent: type 不同，替换组件");
  }
}

console.log("  组件更新函数已定义");                      // 打印提示
console.log();                                          // 打印空行

// ===== 第四部分：定义组件 =====
console.log("【第四部分：定义组件并首次挂载】");          // 打印小节标题

var currentInstance = null;
function onMounted(hook) { if (currentInstance) currentInstance.mounted.push(hook); }
function onUpdated(hook) { if (currentInstance) currentInstance.updated.push(hook); }

// 定义一个显示标题和消息的组件
var Message = {
  name: "Message",
  props: ["title", "content"],
  setup: function (props) {
    var renderCount = ref(0);                           // 记录 render 次数
    onMounted(function () {
      console.log("    [onMounted] Message 组件挂载，title =", props.title);
    });
    onUpdated(function () {
      console.log("    [onUpdated] Message 组件更新，render 次数 =", renderCount.value);
    });
    return { renderCount: renderCount };
  },
  render: function () {
    this.renderCount++;                                 // render 次数 +1（通过 proxy 的 set）
    return {
      type: "div",
      children: [
        { type: "h1", children: this.title },           // 访问 props.title
        { type: "p", children: this.content },          // 访问 props.content
      ]
    };
  }
};

// 创建并挂载组件
var vnode1 = {
  type: Message,
  props: { title: "标题一", content: "内容 A" }
};

// 模拟 currentInstance 设置（简化处理）
var inst = createComponentInstance(vnode1, null);
currentInstance = inst;
initProps(inst, vnode1.props);
setupStatefulComponent(inst);
createRenderContext(inst);
var sub = inst.render.call(inst.proxy);
inst.subTree = sub;
mountElement(sub);
vnode1.el = sub.el;
vnode1.component = inst;
inst.isMounted = true;
inst.mounted.forEach(function (h) { h.call(inst.proxy); });
console.log("  首次挂载完成，render 次数:", inst.setupState.renderCount.value);
console.log();                                          // 打印空行

// ===== 第五部分：场景一 —— props 变化触发更新 =====
console.log("【场景一：props 变化触发更新】");            // 打印小节标题

// 父组件 re-render，生成新的 VNode，title 和 content 都变了
var vnode2 = {
  type: Message,
  props: { title: "标题二", content: "内容 B" }
};

ops = [];
patchComponent(vnode1, vnode2, null);
console.log("  操作日志:");
ops.forEach(function (op) { console.log(op); });
console.log("  更新后 render 次数:", inst.setupState.renderCount.value, "（增加了1次）");
console.log();                                          // 打印空行

// ===== 第六部分：场景二 —— bailout（props 没变跳过更新）=====
console.log("【场景二：bailout（props 没变，跳过更新）】"); // 打印小节标题

// 父组件 re-render，但 props 完全相同
var vnode3 = {
  type: Message,
  props: { title: "标题二", content: "内容 B" }          // 和 vnode2 完全相同
};

ops = [];
patchComponent(vnode2, vnode3, null);
console.log("  操作日志:");
ops.forEach(function (op) { console.log(op); });
console.log("  更新后 render 次数:", inst.setupState.renderCount.value, "（没变，bailout 生效）");
console.log();                                          // 打印空行

// ===== 第七部分：场景三 —— 部分 props 变化 =====
console.log("【场景三：部分 props 变化】");               // 打印小节标题

// 只有 content 变了，title 没变
var vnode4 = {
  type: Message,
  props: { title: "标题二", content: "内容 C（新）" }
};

ops = [];
patchComponent(vnode3, vnode4, null);
console.log("  操作日志:");
ops.forEach(function (op) { console.log(op); });
console.log("  更新后 render 次数:", inst.setupState.renderCount.value, "（增加了1次）");
console.log();                                          // 打印空行

// ===== 第八部分：场景四 —— 自身状态变化 =====
console.log("【场景四：自身状态变化触发更新】");          // 打印小节标题

// 组件内部 ref 变化也会触发更新（和 props 变化的机制类似）
// 这里演示 setupState 的 ref 修改后重新 render
ops = [];
console.log("  修改 setupState.renderCount.value = 99");
inst.setupState.renderCount.value = 99;                 // 修改 ref（真实 Vue 会自动触发更新）
// 真实 Vue 中 ref 的 set 会触发 effect，重新执行 render
// 这里手动模拟重新 render
var nextTree = inst.render.call(inst.proxy);
var prevTree = inst.subTree;
inst.subTree = nextTree;
ops.push("  patch 子树（自身状态变化）:");
patchElement(prevTree, nextTree);
console.log("  操作日志:");
ops.forEach(function (op) { console.log(op); });
console.log("  更新后 render 次数:", inst.setupState.renderCount.value);
console.log();                                          // 打印空行

// ===== 总结 =====
console.log("【总结】");
console.log("  1. 组件更新由 props 变化或自身状态变化触发");
console.log("  2. patchComponent 复用实例，不重新创建（保留状态和钩子）");
console.log("  3. updateProps 浅比较新旧 props，只更新变化的属性");
console.log("  4. 重新执行 render 获取新子树，patch 新旧子树（Diff）");
console.log("  5. bailout 优化：props 没变时跳过更新，避免不必要的 re-render");
console.log("  6. setup 只执行一次，实例的 setupState/render/proxy 都被复用");`
  },

  // =========================================================
  // 第二十章：生命周期：注册与执行时机
  // =========================================================
  {
    id: "vs-lifecycle",
    group: "第四部分 组件系统",
    icon: "🌱",
    title: "生命周期：注册与执行时机",
    content: `
# 生命周期：注册与执行时机

## 一、生命周期是什么

生命周期（Lifecycle）是 Vue 组件从**创建**到**挂载**到**更新**到**销毁**的整个过程中，Vue 在特定时机自动调用的**钩子函数**。开发者通过注册这些钩子，在合适的时机执行自定义逻辑。

### 1.1 为什么需要生命周期

组件的运行过程不是一步完成的，而是分阶段的：

\`\`\`text
创建 → 挂载 → 更新（可能多次）→ 卸载
\`\`\`

不同阶段适合做不同的事情：

| 阶段 | 适合做的事 | 不适合做的事 |
| --- | --- | --- |
| 创建时（setup） | 初始化状态、注册副作用 | 操作 DOM（还没挂载） |
| 挂载后（onMounted） | 操作 DOM、发起请求、启动定时器 | 修改会触发更新的状态（避免循环） |
| 更新后（onUpdated） | 读取更新后的 DOM、同步外部状态 | 修改会触发更新的状态（可能死循环） |
| 卸载前（onUnmounted） | 清理定时器、取消请求、解绑事件 | 操作已卸载的 DOM |

如果没有生命周期，你没办法在"DOM 挂载完成后"这个时机做事——因为 setup 执行时 DOM 还不存在。生命周期就是 Vue 给你提供的"时间窗口"。

### 1.2 生活类比：植物的生长周期

把组件的生命周期想象成一棵**植物的生长过程**：

\`\`\`text
种子（setup）       → 播种：决定种什么、准备土壤（初始化状态）
发芽（onBeforeMount）→ 即将破土：最后的准备
长成（onMounted）    → 破土见光：可以浇水施肥了（操作 DOM）
生长（onUpdated）    → 长出新叶：植物在变化（DOM 更新了）
枯萎（onUnmounted）  → 生命结束：清理花盆（清理副作用）
\`\`\`

每个阶段都有特定的事情要做——你不能在播种时就浇水（没有根吸收），也不能在植物枯萎后才施肥（已经晚了）。生命周期就是 Vue 告诉你"现在到了哪个阶段"，你按阶段做事。

## 二、Vue 3 的生命周期全景

Vue 3 的生命周期分为**选项式 API**和**组合式 API**两套。本章重点关注组合式 API（Composition API）的钩子。

### 2.1 组合式 API 的生命周期钩子

| 钩子函数 | 执行时机 | 对应 Options API |
| --- | --- | --- |
| \`onBeforeMount\` | 组件挂载到 DOM 之前 | beforeMount |
| \`onMounted\` | 组件挂载到 DOM 之后 | mounted |
| \`onBeforeUpdate\` | 响应式数据变化，DOM 更新之前 | beforeUpdate |
| \`onUpdated\` | DOM 更新之后 | updated |
| \`onBeforeUnmount\` | 组件卸载之前 | beforeUnmount |
| \`onUnmounted\` | 组件卸载之后 | unmounted |

### 2.2 执行顺序

\`\`\`text
首次渲染：
  setup()
  onBeforeMount()
  → 挂载 DOM
  onMounted()

后续更新（数据变化时）：
  onBeforeUpdate()
  → 重新 render + patch DOM
  onUpdated()

卸载：
  onBeforeUnmount()
  → 清理 DOM
  onUnmounted()
\`\`\`

## 三、生命周期的本质：注册与触发

### 3.1 注册：在 setup 中调用 onXxx

组合式 API 的生命周期钩子是在 \`setup\` 函数中"注册"的：

\`\`\`javascript
setup() {
  onMounted(function () {
    console.log("挂载完成！");
  });
  onUpdated(function () {
    console.log("更新完成！");
  });
}
\`\`\`

"注册"的意思是：你把一个函数交给 Vue，Vue 在合适的时机帮你调用。注意 \`onMounted\` 不是立即执行的——它只是把函数存起来，等组件真正挂载完成后才调用。

### 3.2 触发：在渲染流程中调用

Vue 的渲染流程（mountComponent、updateComponent、unmountComponent）中，会在特定位置触发对应的钩子队列：

\`\`\`javascript
function mountComponent() {
  // ...setup 执行时注册了 onMounted 钩子
  // ...挂载 DOM
  // 触发 onMounted 钩子队列
  instance.mounted.forEach(function (hook) { hook(); });
}

function updateComponent() {
  // ...重新 render + patch
  // 触发 onUpdated 钩子队列
  instance.updated.forEach(function (hook) { hook(); });
}

function unmountComponent() {
  // 触发 onBeforeUnmount
  // ...清理 DOM
  // 触发 onUnmounted 钩子队列
  instance.unmounted.forEach(function (hook) { hook(); });
}
\`\`\`

### 3.3 生活类比：快递取件通知

把生命周期注册想象成**快递取件通知**：

- 你在网购下单时（setup 执行时），勾选了"到货通知"和"签收通知"（注册 onMounted 和 onUpdated）
- 快递公司（Vue）把你的通知方式记下来（存入 instance 的队列）
- 快递到货时（挂载完成），快递公司按你留的通知方式通知你（触发 onMounted）
- 你每次买新东西签收时（更新完成），快递公司都会通知你（触发 onUpdated）

关键点：**注册和触发是分离的**。注册在 setup 时完成，触发在渲染流程的特定时机。

## 四、钩子存储：组件实例中的队列

### 4.1 为什么用队列而不是单个函数

一个组件可能注册**多个**同类型的钩子：

\`\`\`javascript
setup() {
  onMounted(function () { console.log("钩子1"); });
  onMounted(function () { console.log("钩子2"); });
  onMounted(function () { console.log("钩子3"); });
}
\`\`\`

所以钩子不能是单个函数，必须是**队列**（数组）。Vue 在触发时按注册顺序逐个调用。

### 4.2 实例中的钩子队列

组件实例中有以下钩子队列：

\`\`\`javascript
instance = {
  mounted: [],      // onMounted 钩子队列
  updated: [],      // onUpdated 钩子队列
  unmounted: [],    // onUnmounted 钩子队列
  beforeMount: [],  // onBeforeMount 钩子队列
  beforeUpdate: [], // onBeforeUpdate 钩子队列
  beforeUnmount: [] // onBeforeUnmount 钩子队列
};
\`\`\`

### 4.3 onXxx 函数的实现

\`\`\`javascript
function onMounted(hook) {
  // 把钩子加入当前实例的 mounted 队列
  currentInstance.mounted.push(hook);
}

function onUpdated(hook) {
  currentInstance.updated.push(hook);
}
\`\`\`

关键在于 \`currentInstance\`——Vue 在执行 setup 时，会把"当前正在处理的实例"存到一个全局变量里，这样 \`onMounted\` 才知道把钩子存到哪个实例的队列中。

## 五、currentInstance：当前实例的全局指针

### 5.1 为什么需要 currentInstance

\`onMounted\` 等函数是在 setup 中调用的，但它们没有接收 instance 参数。那它怎么知道把钩子存到哪个实例？

答案是用一个**全局变量** \`currentInstance\`：

\`\`\`javascript
var currentInstance = null;

function setupStatefulComponent(instance) {
  currentInstance = instance;        // 设置当前实例
  var result = instance.type.setup(instance.props, ctx);  // 执行 setup
  currentInstance = null;            // 清空
}

function onMounted(hook) {
  if (currentInstance) {
    currentInstance.mounted.push(hook);  // 存入当前实例的队列
  }
}
\`\`\`

### 5.2 生活类比：车间的"工位牌"

把 currentInstance 想象成车间门口挂的**工位牌**：

- 工人（setup 函数）进车间工作时，门口挂上"当前是 A 车间"的牌子（设置 currentInstance）
- 工人在车间里领材料（注册钩子）时，看门口的牌子知道"我在 A 车间，材料放 A 车间的柜子"
- 工人下班后，牌子取下来（清空 currentInstance）
- 下一个工人进 B 车间时，牌子换成"当前是 B 车间"

如果没有这个牌子，工人不知道材料该放哪个柜子——就像 \`onMounted\` 不知道钩子该存到哪个实例。

### 5.3 为什么不用参数传递

你可能会问：为什么不直接把 instance 作为参数传给 setup？

\`\`\`javascript
// 假想方案
setup(instance, props, ctx) {
  instance.onMounted(function () { ... });
}
\`\`\`

这样确实可以，但有两个问题：

1. **API 不简洁**：开发者每次都要写 \`instance.onMounted\`，比 \`onMounted\` 啰嗦
2. **破坏封装**：开发者能访问整个 instance 对象，可能误操作内部字段

用全局变量 + 闭包的方式，既保持了 API 简洁，又隐藏了 instance 的内部结构。这是 Vue 的设计取舍。

## 六、生命周期的完整执行时机

### 6.1 挂载阶段

\`\`\`text
1. createComponentInstance → 创建实例
2. currentInstance = instance → 设置当前实例
3. setup(props, ctx) 执行：
   - onBeforeMount(hook) → hook 存入 instance.beforeMount
   - onMounted(hook) → hook 存入 instance.mounted
4. currentInstance = null → 清空当前实例
5. createRenderContext → 创建渲染上下文
6. instance.render() → 获取子树
7. 触发 instance.beforeMount 队列
8. mountElement(subTree) → 挂载 DOM
9. instance.isMounted = true
10. 触发 instance.mounted 队列 ← onMounted 在这里执行
\`\`\`

### 6.2 更新阶段

\`\`\`text
1. props 变化或自身状态变化
2. 触发 instance.beforeUpdate 队列 ← onBeforeUpdate 在这里执行
3. 重新执行 render → 获取新子树
4. patch(旧子树, 新子树) → 更新 DOM
5. 触发 instance.updated 队列 ← onUpdated 在这里执行
\`\`\`

### 6.3 卸载阶段

\`\`\`text
1. 组件被移除（v-if=false、列表删除等）
2. 触发 instance.beforeUnmount 队列 ← onBeforeUnmount 在这里执行
3. unmountElement(subTree) → 清理 DOM
4. 触发 instance.unmounted 队列 ← onUnmounted 在这里执行
5. 清理副作用（停止响应式依赖、取消 watch 等）
\`\`\`

## 七、onMounted 为什么能操作 DOM

这是初学者最常问的问题：setup 执行时 DOM 还不存在，为什么在 onMounted 里就能操作 DOM？

答案在于**执行时机**：

- \`setup\` 在**挂载 DOM 之前**执行，此时 DOM 不存在
- \`onMounted\` 的回调在**挂载 DOM 之后**执行，此时 DOM 已经存在

\`\`\`text
setup() {
  console.log(document.querySelector('.box'));  // null！DOM 还没挂载
  onMounted(function () {
    console.log(document.querySelector('.box'));  // DOM 元素！已经挂载了
  });
}
\`\`\`

\`onMounted\` 的回调不是立即执行的——它被存入队列，等到挂载流程的最后一步才被调用。这就是"注册"和"触发"分离的意义。

## 八、本章 Demo 说明

下面的 demo 会实现生命周期的注册和触发机制：

1. 实现 currentInstance 全局指针
2. 实现 onMounted / onUpdated / onUnmounted 注册函数
3. 在挂载/更新/卸载流程中触发对应钩子
4. 演示多个同类钩子的注册和顺序执行
5. 演示钩子中访问 DOM 的正确时机
6. 演示卸载时的清理流程

这个 demo 会让你直观理解：生命周期不是"魔法"，而是"注册函数 + 队列 + 时机触发"的简单机制。`,
    code: `// ============================================================
// 第二十章 demo：生命周期 —— 注册与执行时机
// 演示内容：
//   1. 实现 currentInstance 全局指针
//   2. 实现 onMounted / onUpdated / onUnmounted 注册函数
//   3. 在挂载/更新/卸载流程中触发对应钩子
//   4. 演示多个同类钩子的注册和顺序执行
//   5. 演示钩子中访问 DOM 的正确时机
//   6. 演示卸载时的清理流程
// ============================================================

console.log("=".repeat(60));                            // 打印分隔线
console.log("Vue 源码精读 — 第二十章：生命周期注册与触发"); // 打印章节标题
console.log("=".repeat(60));                            // 打印空行
console.log();                                          // 打印空行

// ===== 第一部分：currentInstance 与生命周期注册函数 =====
console.log("【第一部分：currentInstance 与生命周期注册】"); // 打印小节标题

// currentInstance：全局指针，指向"当前正在执行 setup 的组件实例"
// 这是 onXxx 函数能找到正确实例的关键
var currentInstance = null;

// setCurrentInstance：设置当前实例（在 setup 执行前调用）
function setCurrentInstance(instance) {
  currentInstance = instance;                           // 设置全局指针
}

// getCurrentInstance：获取当前实例（供 onXxx 使用）
function getCurrentInstance() {
  return currentInstance;                               // 返回全局指针
}

// ===== 生命周期注册函数 =====
// 每个 onXxx 函数的原理都一样：
//   1. 通过 getCurrentInstance() 拿到当前实例
//   2. 把钩子函数 push 到实例对应的队列中
//   3. 等到特定时机，Vue 会遍历队列逐个调用

// onBeforeMount：注册"挂载前"钩子
function onBeforeMount(hook) {
  var instance = getCurrentInstance();                  // 获取当前实例
  if (instance) {
    instance.beforeMount.push(hook);                    // 存入 beforeMount 队列
  }
}

// onMounted：注册"挂载后"钩子（最常用）
function onMounted(hook) {
  var instance = getCurrentInstance();                  // 获取当前实例
  if (instance) {
    instance.mounted.push(hook);                        // 存入 mounted 队列
  }
}

// onBeforeUpdate：注册"更新前"钩子
function onBeforeUpdate(hook) {
  var instance = getCurrentInstance();                  // 获取当前实例
  if (instance) {
    instance.beforeUpdate.push(hook);                   // 存入 beforeUpdate 队列
  }
}

// onUpdated：注册"更新后"钩子
function onUpdated(hook) {
  var instance = getCurrentInstance();                  // 获取当前实例
  if (instance) {
    instance.updated.push(hook);                        // 存入 updated 队列
  }
}

// onBeforeUnmount：注册"卸载前"钩子
function onBeforeUnmount(hook) {
  var instance = getCurrentInstance();                  // 获取当前实例
  if (instance) {
    instance.beforeUnmount.push(hook);                  // 存入 beforeUnmount 队列
  }
}

// onUnmounted：注册"卸载后"钩子
function onUnmounted(hook) {
  var instance = getCurrentInstance();                  // 获取当前实例
  if (instance) {
    instance.unmounted.push(hook);                      // 存入 unmounted 队列
  }
}

console.log("  currentInstance 和生命周期注册函数已定义"); // 打印提示
console.log("  可用钩子: onBeforeMount, onMounted, onBeforeUpdate,");
console.log("             onUpdated, onBeforeUnmount, onUnmounted");
console.log();                                          // 打印空行

// ===== 第二部分：触发生命周期的工具函数 =====
console.log("【第二部分：触发生命周期的工具函数】");      // 打印小节标题

// flushHooks：依次调用队列中的所有钩子
// "flush"（冲刷）的意思是：把队列里的钩子全部执行完
function flushHooks(queue, instance) {
  if (queue && queue.length > 0) {
    queue.forEach(function (hook) {
      // 用 instance.proxy 作为 this 调用钩子
      // 这样钩子内部能用 this 访问组件数据
      hook.call(instance.proxy);
    });
  }
}

console.log("  flushHooks 函数已定义");                    // 打印提示
console.log();                                          // 打印空行

// ===== 第三部分：组件实例与挂载流程 =====
console.log("【第三部分：组件实例与挂载流程（含生命周期触发）】"); // 打印小节标题

var uid = 0;                                            // 实例 ID 计数器

// 创建组件实例（包含所有生命周期队列）
function createComponentInstance(vnode, parent) {
  var instance = {
    uid: uid++,                                         // 唯一 ID
    type: vnode.type,                                   // 组件定义
    parent: parent,
    props: {},
    setupState: {},
    proxy: null,
    subTree: null,
    render: null,
    vnode: vnode,
    isMounted: false,                                   // 是否已挂载

    // ===== 生命周期钩子队列 =====
    beforeMount: [],                                    // onBeforeMount 队列
    mounted: [],                                        // onMounted 队列
    beforeUpdate: [],                                   // onBeforeUpdate 队列
    updated: [],                                        // onUpdated 队列
    beforeUnmount: [],                                  // onBeforeUnmount 队列
    unmounted: [],                                      // onUnmounted 队列
  };
  return instance;
}

// 简化的 DOM 模拟
var domStore = {};                                      // 模拟 DOM 存储

// mountComponent：挂载组件，触发 beforeMount 和 mounted
function mountComponent(vnode, parent) {
  console.log("--- 挂载组件 ---");

  // 1. 创建实例
  var instance = createComponentInstance(vnode, parent);
  vnode.component = instance;

  // 2. 初始化 props
  instance.props = vnode.props || {};

  // 3. 设置当前实例 → 执行 setup → 清空当前实例
  //    setup 执行时会注册生命周期钩子（通过 onXxx）
  setCurrentInstance(instance);                         // 设置当前实例
  var Component = instance.type;
  if (Component.setup) {
    var ctx = { attrs: {}, emit: function () {}, slots: {}, expose: function () {} };
    var result = Component.setup(instance.props, ctx);  // 执行 setup（注册钩子）
    if (result && typeof result === "object") {
      instance.setupState = result;
    } else if (typeof result === "function") {
      instance.render = result;
    }
  }
  if (!instance.render && Component.render) {
    instance.render = Component.render;
  }
  setCurrentInstance(null);                             // 清空当前实例（重要！）

  // 4. 创建渲染上下文
  instance.proxy = new Proxy(instance, {
    get: function (t, k) {
      if (k in t.setupState) return t.setupState[k];
      if (k in t.props) return t.props[k];
      return undefined;
    }
  });

  // 5. 触发 onBeforeMount（挂载 DOM 之前）
  console.log("  [触发 beforeMount 队列]");
  flushHooks(instance.beforeMount, instance);

  // 6. 执行 render，获取子树
  var subTree = instance.render.call(instance.proxy);
  instance.subTree = subTree;

  // 7. 挂载 DOM（模拟）
  domStore[instance.uid] = subTree;
  console.log("  [DOM 已挂载]");

  // 8. 标记已挂载
  instance.isMounted = true;

  // 9. 触发 onMounted（挂载 DOM 之后）
  console.log("  [触发 mounted 队列]");
  flushHooks(instance.mounted, instance);

  console.log("--- 挂载完成 ---");
  return instance;
}

// updateComponent：更新组件，触发 beforeUpdate 和 updated
function updateComponent(instance) {
  console.log("--- 更新组件 ---");

  // 1. 触发 onBeforeUpdate（更新 DOM 之前）
  console.log("  [触发 beforeUpdate 队列]");
  flushHooks(instance.beforeUpdate, instance);

  // 2. 重新 render
  var nextTree = instance.render.call(instance.proxy);
  var prevTree = instance.subTree;                       // 旧子树
  instance.subTree = nextTree;                           // 更新子树

  // 3. patch 新旧子树（模拟 DOM 更新）
  console.log("  [DOM 已更新]");

  // 4. 触发 onUpdated（更新 DOM 之后）
  console.log("  [触发 updated 队列]");
  flushHooks(instance.updated, instance);

  console.log("--- 更新完成 ---");
}

// unmountComponent：卸载组件，触发 beforeUnmount 和 unmounted
function unmountComponent(instance) {
  console.log("--- 卸载组件 ---");

  // 1. 触发 onBeforeUnmount（卸载 DOM 之前）
  console.log("  [触发 beforeUnmount 队列]");
  flushHooks(instance.beforeUnmount, instance);

  // 2. 清理 DOM（模拟）
  delete domStore[instance.uid];
  console.log("  [DOM 已清理]");

  // 3. 触发 onUnmounted（卸载 DOM 之后）
  console.log("  [触发 unmounted 队列]");
  flushHooks(instance.unmounted, instance);

  console.log("--- 卸载完成 ---");
}

console.log("  mountComponent / updateComponent / unmountComponent 已定义"); // 打印提示
console.log();                                          // 打印空行

// ===== 第四部分：定义组件并演示完整生命周期 =====
console.log("【第四部分：定义组件并演示完整生命周期】");    // 打印小节标题

// 定义一个带定时器的组件，演示 onMounted 和 onUnmounted 的清理
var Timer = {
  name: "Timer",
  props: ["label"],
  setup: function (props) {
    // 模拟一个定时器 ID（真实场景中是 setInterval 的返回值）
    var timerId = "timer-" + Math.random().toString(36).slice(2, 8);
    var tickCount = 0;

    // 注册 onBeforeMount：DOM 挂载前的准备
    onBeforeMount(function () {
      console.log("  [onBeforeMount] 即将挂载，DOM 还不存在");
    });

    // 注册 onMounted：DOM 挂载后，可以操作 DOM、启动定时器
    onMounted(function () {
      console.log("  [onMounted] 已挂载！label =", this.label);
      console.log("  [onMounted] 启动定时器:", timerId);
      console.log("  [onMounted] 可以操作 DOM 了");
    });

    // 注册多个 onMounted（演示队列）
    onMounted(function () {
      console.log("  [onMounted #2] 第二个 mounted 钩子，按注册顺序执行");
    });

    // 注册 onBeforeUpdate：更新前的钩子
    onBeforeUpdate(function () {
      console.log("  [onBeforeUpdate] 即将更新 DOM");
    });

    // 注册 onUpdated：更新后的钩子
    onUpdated(function () {
      console.log("  [onUpdated] DOM 已更新");
    });

    // 注册 onBeforeUnmount：卸载前的清理准备
    onBeforeUnmount(function () {
      console.log("  [onBeforeUnmount] 即将卸载");
    });

    // 注册 onUnmounted：卸载后清理定时器
    onUnmounted(function () {
      console.log("  [onUnmounted] 已卸载！清理定时器:", timerId);
      console.log("  [onUnmounted] tickCount =", tickCount);
    });

    // 返回状态和方法
    return {
      tickCount: tickCount,
      tick: function () { tickCount++; },
      timerId: timerId,
    };
  },
  render: function () {
    // 渲染函数返回模拟的子树
    return { type: "div", children: "Timer: " + this.label };
  }
};

// 创建组件 VNode 并挂载
var vnode = { type: Timer, props: { label: "计时器A" } };
var instance = mountComponent(vnode, null);
console.log();                                          // 打印空行

// ===== 第五部分：演示更新流程 =====
console.log("【第五部分：演示更新流程（触发 beforeUpdate 和 updated）】"); // 打印小节标题
// 模拟 props 变化触发更新
instance.props = { label: "计时器B（已更新）" };
updateComponent(instance);
console.log();                                          // 打印空行

// ===== 第六部分：演示卸载流程 =====
console.log("【第六部分：演示卸载流程（触发 beforeUnmount 和 unmounted）】"); // 打印小节标题
unmountComponent(instance);
console.log();                                          // 打印空行

// ===== 第七部分：演示钩子中访问 DOM 的正确时机 =====
console.log("【第七部分：演示钩子中访问 DOM 的正确时机】"); // 打印小节标题

var domAvailable = false;                               // 模拟 DOM 是否可用

var DomTest = {
  name: "DomTest",
  setup: function () {
    // setup 执行时 DOM 还不存在
    console.log("  [setup] 执行时 domAvailable =", domAvailable, "（DOM 不存在）");

    onBeforeMount(function () {
      console.log("  [onBeforeMount] domAvailable =", domAvailable, "（DOM 还没挂载）");
    });

    onMounted(function () {
      // onMounted 执行时 DOM 已经存在
      console.log("  [onMounted] domAvailable =", domAvailable, "（DOM 已存在，可以操作）");
    });

    return {};
  },
  render: function () { return { type: "div", children: "test" }; }
};

console.log("  挂载前 domAvailable =", domAvailable);
// 模拟挂载流程（简化版，直接调用关键步骤）
var inst2 = createComponentInstance({ type: DomTest, props: {} }, null);
inst2.props = {};
setCurrentInstance(inst2);                              // 设置当前实例
DomTest.setup(inst2.props, {});                         // 执行 setup（注册钩子）
setCurrentInstance(null);                               // 清空
inst2.render = DomTest.render;
inst2.proxy = new Proxy(inst2, { get: function (t, k) { return t.setupState[k]; } });
// 触发 beforeMount
flushHooks(inst2.beforeMount, inst2);
// 挂载 DOM（模拟：设置 domAvailable = true）
domAvailable = true;
// 触发 mounted
flushHooks(inst2.mounted, inst2);
console.log();                                          // 打印空行

// ===== 总结 =====
console.log("【总结】");
console.log("  1. 生命周期 = 在特定时机调用的钩子函数");
console.log("  2. 注册：在 setup 中调用 onXxx，钩子存入 instance 的队列");
console.log("  3. 触发：在挂载/更新/卸载流程的特定位置 flushHooks");
console.log("  4. currentInstance 全局指针让 onXxx 找到正确的实例");
console.log("  5. onMounted 能操作 DOM 是因为回调在 DOM 挂载后才执行");
console.log("  6. 注册和触发分离：setup 时注册，渲染流程中触发");`
  },

  // =========================================================
  // 教程文件结束
  // =========================================================
];