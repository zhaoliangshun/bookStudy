// =============================================================
// Vue 源码构建教程（vuesrc）第二批章节
// -------------------------------------------------------------
// 主题：第一部分 响应式系统（第 6-10 章）
// 面向：想深入理解 Vue 底层原理的开发者
//
// 本文件包含以下章节：
//   6.  vs-trigger-update       — 触发更新：trigger 与调度
//   7.  vs-ref-shallow          — ref 与 shallowRef：基本类型响应式
//   8.  vs-computed-lazy        — computed：懒计算的响应式数据
//   9.  vs-watch-effect         — watch 与 watchEffect：侦听器
//   10. vs-reactivity-summary   — 响应式系统整合：完整版响应式模块
//
// 每个章节对象的结构：
//   id      : 唯一标识（vs- 前缀代表 vue source）
//   group   : 分组名
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解
//   code    : 可直接用 node 运行的 JS 示例代码，用 console.log 输出
//
// 代码运行环境约束：
//   - Node.js 环境中运行
//   - 没有浏览器 DOM，所以 demo 用纯 JS 对象模拟
//   - 用 console.log 输出结果
//
// 转义约定（非常重要）：
//   - code 字段中所有反引号必须转义为 \`
//   - code 字段中所有 ${} 必须转义为 \${}
//   - content 字段中的代码块用三个反引号（\`\`\`）
// =============================================================

export const chapters = [
  // ===========================================================
  // 第 6 章：触发更新：trigger 与调度
  // ===========================================================
  {
    id: "vs-trigger-update",
    group: "第一部分 响应式系统",
    icon: "🔄",
    title: "触发更新：trigger 与调度",
    content: `
# 第 6 章 触发更新：trigger 与调度

## 一、开篇：从「记录依赖」到「通知更新」

上一章我们实现了 \`effect\` 和 \`track\`，搞定了响应式系统的「左半边」——**依赖收集**。当 effect 执行时读取了响应式数据，\`track\` 会把这个 effect 记录到数据对应的依赖集合里。但这只是故事的一半：如果数据发生了变化，谁来通知这些 effect 重新执行？

这就是本章的核心：**\`trigger\`——触发更新**。

### 1.1 生活类比：快递员与收件人

想象一个快递系统：

| 角色 | 对应概念 |
|------|----------|
| 寄件人（发包裹） | 修改数据的 \`set\` 操作 |
| 快递分拣中心 | \`trigger\` 函数 |
| 收件人名单 | 依赖集合（dep Set） |
| 快递员送货 | 执行 effect 函数 |
| 收件人签收 | effect 重新运行 |

当你（寄件人）把包裹交给快递公司（触发 \`set\`），分拣中心（\`trigger\`）会查收件人名单（dep），然后派快递员逐一送达（执行每个 effect）。上一章我们做的是「登记收件人名单」（\`track\`），本章做的是「派快递员送货」（\`trigger\`）。

### 1.2 trigger 的职责

\`trigger\` 的职责可以用一句话概括：

> **当某个数据的某个属性被修改时，找到所有依赖这个属性的 effect，并执行它们。**

签名大致是：

\`\`\`js
function trigger(target, key) {
  // 从 targetMap 中找到 target.key 对应的 dep
  // 遍历 dep，执行每个 effect
}
\`\`\`

- \`target\`：被修改的对象（原始对象，不是 Proxy）
- \`key\`：被修改的属性名

## 二、trigger 函数：找出依赖并执行

### 2.1 从 targetMap 中取出依赖

上一章我们用三层结构存储依赖：

\`\`\`js
// 结构：WeakMap<target, Map<key, Set<effect>>>
const targetMap = new WeakMap();
\`\`\`

\`trigger\` 要做的就是逆向查找：\`target → key → dep\`。

\`\`\`js
function trigger(target, key) {
  // 第一层：取出 target 对应的 depsMap
  const depsMap = targetMap.get(target);
  if (!depsMap) return; // 没有被 track 过，直接返回

  // 第二层：取出 key 对应的 dep（依赖集合）
  const dep = depsMap.get(key);
  if (!dep) return; // 这个属性没有依赖，直接返回

  // 第三层：遍历 dep，执行每个 effect
  const effects = [...dep]; // 关键：复制一份！
  effects.forEach(effect => {
    effect.run();
  });
}
\`\`\`

### 2.2 为什么复制一份再遍历？

注意上面代码中的 \`const effects = [...dep]\`。为什么不让直接遍历原始的 Set？

因为 effect 执行时**可能又会修改数据**，导致 \`trigger\` 被递归调用，往 dep 里添加或删除 effect。如果在遍历同一个 Set 的同时修改它，JavaScript 的迭代器行为会变得不可预期（可能跳过某些元素，也可能死循环）。

复制一份再遍历，就隔离了「遍历」和「修改」两个操作，保证安全。

### 2.3 在 Proxy 的 set 中调用 trigger

\`\`\`js
function reactive(target) {
  return new Proxy(target, {
    get(obj, key) {
      track(obj, key);       // 读取时收集依赖
      return Reflect.get(obj, key);
    },
    set(obj, key, value) {
      const result = Reflect.set(obj, key, value); // 先设值
      trigger(obj, key);     // 再触发更新
      return result;
    }
  });
}
\`\`\`

注意顺序：**先设值，再触发**。因为 effect 重新执行时会读取数据，如果先触发再设值，effect 读到的还是旧值。

## 三、effect 去重与避免无限循环

### 3.1 为什么会无限循环？

考虑这个场景：

\`\`\`js
const state = reactive({ count: 0 });

effect(() => {
  state.count++; // 等价于 state.count = state.count + 1
});
\`\`\`

在 effect 执行时：
1. 读取 \`state.count\`（触发 \`track\`，收集依赖）
2. 修改 \`state.count\`（触发 \`trigger\`，又要执行 effect）
3. effect 再次执行 → 回到步骤 1 → 无限循环！

这就像快递员自己也是收件人：送包裹给自己 → 打开包裹 → 发现又是给自己的包裹 → 再送 → 再打开……

### 3.2 解决方案：跳过当前正在执行的 effect

核心思路：在 \`trigger\` 遍历 effect 时，**如果某个 effect 就是当前正在执行的 \`activeEffect\`，就跳过它**。

\`\`\`js
function trigger(target, key) {
  // ... 取出 dep ...
  const effects = [...dep];
  effects.forEach(effect => {
    // 关键：跳过当前正在执行的 effect
    if (effect === activeEffect) return;
    effect.run();
  });
}
\`\`\`

这样上面的例子就正常了：effect 执行时修改 \`count\`，\`trigger\` 发现要执行的 effect 就是 \`activeEffect\`，跳过它，不会无限循环。

### 3.3 生活类比：不要自己通知自己

你写了一篇文章，系统自动通知所有订阅者。但如果「你自己也是订阅者」，你会收到自己的通知，然后你又写了一篇，又通知自己……死循环。解决方案很简单：**发通知时跳过发通知的人自己**。

## 四、嵌套 effect 的处理

### 4.1 为什么需要 effectStack？

考虑嵌套场景：

\`\`\`js
effect(() => {           // 外层 effect A
  console.log(state.a);  // A 依赖 a
  effect(() => {         // 内层 effect B
    console.log(state.b); // B 依赖 b
  });
  console.log(state.a);  // A 又读了一次 a
});
\`\`\`

如果只用一个 \`activeEffect\` 变量，当内层 effect B 执行完后，\`activeEffect\` 变成 \`null\`。此时外层 effect A 继续执行，读取 \`state.a\` 时 \`track\` 发现 \`activeEffect\` 是 \`null\`，就不会收集依赖了——A 对 \`a\` 的依赖丢失了！

### 4.2 栈的工作原理

解决方案：用**栈**来管理 \`activeEffect\`。

\`\`\`js
const effectStack = [];

function effect(fn) {
  const _effect = {
    run() {
      activeEffect = _effect;      // 设为当前 effect
      effectStack.push(_effect);   // 压栈
      try {
        return fn();
      } finally {
        effectStack.pop();         // 弹栈
        // 恢复为栈顶 effect（外层 effect）
        activeEffect = effectStack[effectStack.length - 1] || null;
      }
    }
  };
  _effect.run();
  return _effect;
}
\`\`\`

执行流程：
1. 外层 A 开始 → 压栈 → 栈：[A] → \`activeEffect = A\`
2. 内层 B 开始 → 压栈 → 栈：[A, B] → \`activeEffect = B\`
3. 内层 B 结束 → 弹栈 → 栈：[A] → \`activeEffect = A\`（恢复！）
4. 外层 A 继续读取 \`state.a\` → \`track\` 把 A 收集到 \`a\` 的依赖中 ✓
5. 外层 A 结束 → 弹栈 → 栈：[] → \`activeEffect = null\`

### 4.3 生活类比：俄罗斯套娃

嵌套 effect 就像俄罗斯套娃：打开大套娃（外层 effect）时发现里面有个小套娃（内层 effect），处理完小套娃后，你要**回到大套娃继续处理**，而不是扔掉大套娃。栈结构就是「记住你打开到哪一层」的机制。

## 五、调度执行：scheduler 选项

### 5.1 为什么需要 scheduler？

到目前为止，\`trigger\` 触发 effect 时是**同步立即执行**的。但有些场景我们希望**控制执行时机**：

| 场景 | 需求 |
|------|------|
| 批量更新 | 连续修改 3 次数据，只渲染 1 次 |
| 异步更新 | 数据变化后等一会儿再执行 |
| 节流/防抖 | 高频修改时降低执行频率 |
| Vue 组件更新 | 把 effect 放入微任务队列，避免同步重复渲染 |

\`scheduler\` 就是为此设计的：让用户**自定义 effect 的执行时机**。

### 5.2 scheduler 的工作原理

\`\`\`js
function effect(fn, options = {}) {
  const _effect = {
    run() { /* ... */ },
    scheduler: options.scheduler // 可选的调度函数
  };
  _effect.run();
  return _effect;
}

function trigger(target, key) {
  // ...
  effects.forEach(effect => {
    if (effect === activeEffect) return;
    if (effect.scheduler) {
      // 有 scheduler：调用 scheduler，由用户决定何时执行
      effect.scheduler();
    } else {
      // 没有 scheduler：直接执行
      effect.run();
    }
  });
}
\`\`\`

关键点：
- effect **首次执行**（注册时）始终调用 \`run()\`，用于收集依赖
- 后续 **trigger 触发**时，如果有 \`scheduler\`，调用 \`scheduler\` 而不是 \`run()\`
- \`scheduler\` 内部可以决定何时调用 \`effect.run()\`

### 5.3 批量更新的实现

\`scheduler\` 最经典的用法是**批量更新**：

\`\`\`js
const jobQueue = new Set();  // 用 Set 去重
let isFlushing = false;

function flushJob() {
  if (isFlushing) return;
  isFlushing = true;
  Promise.resolve().then(() => {
    // 微任务中统一执行所有 job
    jobQueue.forEach(job => job.run());
    jobQueue.clear();
    isFlushing = false;
  });
}

effect(() => {
  console.log(state.count);
}, {
  scheduler() {
    jobQueue.add(effect);  // 放入队列（Set 自动去重）
    flushJob();            // 触发刷新
  }
});

// 连续修改 3 次
state.count = 1;  // scheduler 调用，effect 入队
state.count = 2;  // scheduler 调用，effect 已在队中（Set 去重）
state.count = 3;  // scheduler 调用，effect 已在队中
// 同步代码结束后，微任务执行：effect 只跑 1 次，读到 count = 3
\`\`\`

### 5.4 生活类比：快递分拣中心

没有 \`scheduler\` 时，每来一个包裹就派一个快递员送货——效率极低。有了 \`scheduler\`，就像有了分拣中心：所有包裹先堆到仓库（\`jobQueue\`），等这波快递到齐了（微任务时机），一次性派送。同一个收件人有多件包裹（Set 去重），只送一次。

## 六、本章完整 demo 说明

下面的 demo 包含四个演示：

1. **基本 trigger 行为**：修改数据 → effect 自动执行
2. **避免无限循环**：effect 内修改自己依赖的数据，不会死循环
3. **嵌套 effect**：外层和内层 effect 的依赖互不干扰
4. **scheduler 调度**：连续修改三次数据，effect 只执行一次（批量更新）

每个演示都有详细注释，请仔细阅读代码理解每一步的原理。

## 七、本章小结

| 知识点 | 核心内容 |
|--------|----------|
| \`trigger\` | 从 \`targetMap\` 取出依赖，遍历执行 |
| 复制再遍历 | 避免 effect 执行时修改 Set 导致迭代异常 |
| 去重 | 跳过 \`activeEffect\`，避免无限循环 |
| \`effectStack\` | 用栈管理嵌套 effect，内层结束后恢复外层 |
| \`scheduler\` | 让用户控制 effect 的执行时机 |
| 批量更新 | 用 Set + 微任务队列合并多次修改 |

下一章我们将解决 \`Proxy\` 无法代理基本类型的问题——实现 \`ref\` 和 \`shallowRef\`。
`,
    code: `// ============================================
// 第 6 章 demo：trigger 与调度
// 运行方式：node vuesrc-ch6.js
// 本 demo 实现 trigger 函数、effect 去重、嵌套 effect、scheduler
// ============================================

// ------------------------------------------------------------
// 第一部分：响应式基础设施
// 包含 reactive、effect、track、trigger 的完整实现
// 这是本章的核心代码，每个函数都有极其详细的注释
// ------------------------------------------------------------

// 当前正在执行的 effect，用于依赖收集
// 当 effect.run() 执行时，activeEffect 被设为该 effect
// effect 执行完毕后，activeEffect 恢复为栈顶的 effect（或 null）
let activeEffect = null;

// effect 栈，用于处理嵌套 effect
// 当外层 effect 内部创建内层 effect 时：
//   - 内层 effect 压栈，activeEffect = 内层 effect
//   - 内层 effect 执行完毕，弹栈，activeEffect 恢复为外层 effect
// 这保证了外层 effect 在内层 effect 前后的依赖都能被正确收集
const effectStack = [];

// 依赖存储结构：WeakMap<target, Map<key, Set<effect>>>
// 三层结构：
//   第一层 WeakMap：target（原始对象）→ depsMap
//   第二层 Map：key（属性名）→ dep（依赖集合）
//   第三层 Set：effect 的集合
// 用 WeakMap 是因为 target 可能会被垃圾回收，WeakMap 不阻止回收
const targetMap = new WeakMap();

/**
 * track：收集依赖
 * 在 Proxy 的 get 拦截器中调用
 * 把当前 activeEffect 记录到 target.key 的依赖集合中
 *
 * @param {object} target - 原始对象（不是 Proxy）
 * @param {string} key - 属性名
 */
function track(target, key) {
  // 如果没有正在执行的 effect，不需要收集依赖
  // 场景：在 effect 外部直接读取响应式数据
  if (!activeEffect) return;

  // 取出 target 对应的 depsMap（属性 → 依赖集合的映射）
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    // 第一次访问这个对象，创建新的 Map
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  // 取出 key 对应的 dep（依赖集合）
  let dep = depsMap.get(key);
  if (!dep) {
    // 第一次访问这个属性，创建新的 Set
    dep = new Set();
    depsMap.set(key, dep);
  }

  // 把当前 effect 加入依赖集合
  // Set 会自动去重，同一个 effect 不会被重复添加
  dep.add(activeEffect);
}

/**
 * trigger：触发更新（本章核心！）
 * 在 Proxy 的 set 拦截器中调用
 * 找出 target.key 的所有依赖并执行
 *
 * @param {object} target - 原始对象
 * @param {string} key - 被修改的属性名
 */
function trigger(target, key) {
  // 取出 target 对应的 depsMap
  const depsMap = targetMap.get(target);
  if (!depsMap) return; // 这个对象从未被 track 过，直接返回

  // 取出 key 对应的依赖集合
  const dep = depsMap.get(key);
  if (!dep) return; // 这个属性没有依赖，直接返回

  // 关键：复制一份再遍历！
  // 为什么？因为 effect 执行时可能又会修改数据，导致 trigger 再次被调用
  // 如果直接遍历原始 Set，边遍历边修改会导致迭代器行为异常
  // 复制一份就隔离了「遍历」和「修改」两个操作
  const effects = [...dep];

  effects.forEach(effect => {
    // 关键：避免无限循环！
    // 如果当前要执行的 effect 就是正在执行的 activeEffect，跳过
    // 场景：effect(() => { state.count++ }) 中修改了自己依赖的值
    // 如果不跳过，会形成：执行 → 修改 → 触发 → 执行 → 修改 → ... 无限循环
    if (effect === activeEffect) return;

    // 如果 effect 配置了 scheduler，调用 scheduler
    // scheduler 让用户可以控制 effect 的执行时机
    // 典型用途：批量更新、异步执行、组件渲染调度
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      // 没有 scheduler，直接同步执行
      effect.run();
    }
  });
}

/**
 * effect：注册副作用函数
 * @param {Function} fn - 副作用函数（读取响应式数据的函数）
 * @param {Object} options - 配置项
 *   - scheduler: 自定义调度函数，控制 effect 被 trigger 时的执行时机
 *   - lazy: 是否延迟执行（不立即运行第一次），用于 computed
 * @returns {Object} effect 对象，包含 run 方法和 scheduler
 */
function effect(fn, options = {}) {
  // 创建 effect 对象
  const _effect = {
    // run 方法：执行副作用函数
    run() {
      // 把当前 effect 设为 activeEffect
      // 这样在 fn 执行期间，所有 track 调用都会收集这个 effect
      activeEffect = _effect;
      // 压入 effectStack，用于嵌套 effect 的正确恢复
      effectStack.push(_effect);
      try {
        // 执行函数，期间触发的 get 会收集依赖
        // fn 的返回值就是 effect 的返回值
        return fn();
      } finally {
        // finally 块确保无论 fn 是否抛异常，都会弹出栈
        effectStack.pop();
        // 恢复为栈顶的 effect（外层 effect）
        // 如果栈为空，说明没有外层 effect，设为 null
        activeEffect = effectStack[effectStack.length - 1] || null;
      }
    },
    // scheduler：可选的调度函数
    // 当 trigger 触发时，如果有 scheduler，调用 scheduler 而不是 run
    scheduler: options.scheduler
  };

  // 如果不是 lazy，立即执行一次（收集依赖）
  // lazy 模式用于 computed：第一次访问时才计算
  if (!options.lazy) {
    _effect.run();
  }

  return _effect;
}

/**
 * reactive：创建响应式对象
 * 用 Proxy 代理 target 的 get 和 set
 * @param {object} target - 要代理的原始对象
 * @returns {Proxy} 代理后的响应式对象
 */
function reactive(target) {
  return new Proxy(target, {
    // get 拦截器：读取属性时收集依赖
    get(obj, key) {
      track(obj, key);           // 收集依赖
      return Reflect.get(obj, key); // 返回属性值
    },
    // set 拦截器：修改属性时触发更新
    set(obj, key, value) {
      // 先设置值（Reflect.set 会调用底层 [[Set]] 操作）
      const result = Reflect.set(obj, key, value);
      // 再触发更新（通知所有依赖这个属性的 effect）
      trigger(obj, key);
      return result; // set 必须返回 true/false 表示成功与否
    }
  });
}

// ------------------------------------------------------------
// 第二部分：演示
// ------------------------------------------------------------

console.log("=== 演示 1：基本 trigger 行为 ===");
console.log("创建响应式对象 state = { count: 0 }");

// 创建响应式对象
const state = reactive({ count: 0 });

console.log("注册 effect，读取 state.count");
// 注册 effect：读取 state.count，建立依赖
// effect 首次执行时，activeEffect = _effect
// state.count 的读取触发 track，把 _effect 加入 count 的依赖集合
effect(() => {
  console.log("  [effect 执行] count =", state.count);
});
// 首次立即执行，输出：[effect 执行] count = 0

console.log("修改 state.count = 10");
state.count = 10;
// set 拦截器调用 trigger，找到 count 的依赖集合，执行 effect
// 输出：[effect 执行] count = 10

console.log("修改 state.count = 20");
state.count = 20;
// 输出：[effect 执行] count = 20


console.log();
console.log("=== 演示 2：避免无限循环 ===");
console.log("场景：effect 内部修改自己依赖的数据");

// 创建新的响应式对象
const state2 = reactive({ num: 0 });

effect(() => {
  // 在 effect 中读取 num（建立依赖）并修改 num（触发更新）
  // 如果没有去重逻辑，这会导致无限循环：
  //   effect 执行 → 读取 num(track) → 修改 num(trigger) → effect 执行 → ...
  // 去重逻辑：trigger 时跳过 activeEffect，所以不会无限循环
  if (state2.num < 3) {
    state2.num++;  // 修改自己依赖的值
  }
  console.log("  [effect 执行] num =", state2.num);
});
// 执行过程：
// 1. 首次执行：num=0，0<3 成立，num++→1，trigger 跳过 activeEffect
//    输出：num = 1
// 2. set 触发 trigger，但 trigger 跳过了 activeEffect
//    等等——实际上 trigger 是在 set 中调用的，此时 activeEffect 就是这个 effect
//    所以 trigger 跳过它，不会再次执行
// 但 set 执行后，count 从 0 变 1，trigger 被调用
// trigger 中的 if (effect === activeEffect) return 跳过了
// 所以 effect 只执行一次，输出 num = 1

// 让我们手动验证：
console.log("手动修改 num = 5");
state2.num = 5;
// trigger 此时 activeEffect 是 null（不在 effect 中）
// 所以 effect 被执行：5 < 3 不成立，不修改
// 输出：num = 5


console.log();
console.log("=== 演示 3：嵌套 effect 与 effectStack ===");
console.log("外层 effect 依赖 a，内层 effect 依赖 b");

const state3 = reactive({ a: 1, b: 1 });

// 外层 effect：读取 a
effect(() => {
  console.log("  [外层 effect] a =", state3.a);

  // 内层 effect：读取 b
  // 当内层 effect 执行时：
  //   1. activeEffect = 内层 effect（压栈）
  //   2. 读取 state.b，track 把内层 effect 收集到 b 的依赖中
  //   3. 内层 effect 结束（弹栈），activeEffect 恢复为外层 effect
  effect(() => {
    console.log("    [内层 effect] b =", state3.b);
  });
});
// 首次执行输出：
//   [外层 effect] a = 1
//     [内层 effect] b = 1

console.log("--- 修改 a（应该只触发外层 effect）---");
state3.a = 2;
// trigger 找到 a 的依赖（外层 effect），执行它
// 外层 effect 重新执行，又创建了内层 effect
// 输出：
//   [外层 effect] a = 2
//     [内层 effect] b = 1

console.log("--- 修改 b（应该只触发内层 effect）---");
state3.b = 2;
// trigger 找到 b 的依赖（内层 effect），执行它
// 注意：由于外层 effect 重新执行时又创建了一个内层 effect
// 所以 b 的依赖集合里有两个内层 effect（第一次和第二次创建的）
// 输出：
//     [内层 effect] b = 2
//     [内层 effect] b = 2
// 这是 effect 没有清理旧依赖的副作用，Vue 通过 cleanup 机制解决


console.log();
console.log("=== 演示 4：scheduler 调度执行 ===");
console.log("连续修改三次数据，effect 只执行一次（批量更新）");

const state4 = reactive({ val: 0 });

// 模拟任务队列：用 Set 去重
// 同一个 effect 被多次入队时，Set 只保留一份
const jobQueue = new Set();
let isFlushing = false;

/**
 * flushJob：刷新任务队列
 * 把队列中的所有 effect 一次性执行
 * 用 Promise.resolve().then() 把执行放到微任务队列
 * 这样所有同步代码执行完后，才统一执行 effect
 */
function flushJob() {
  if (isFlushing) return; // 正在刷新，跳过（防止重复刷新）
  isFlushing = true;
  // Promise.resolve().then() 把回调放入微任务队列
  // 微任务会在当前同步代码全部执行完后才执行
  Promise.resolve().then(() => {
    // 遍历队列，执行每个 effect
    jobQueue.forEach(job => job.run());
    // 清空队列，为下一批做准备
    jobQueue.clear();
    isFlushing = false;
  });
}

// 声明 effect4 变量，后续在 scheduler 中引用
let effect4;

effect4 = effect(() => {
  console.log("  [effect 执行] val =", state4.val);
}, {
  // scheduler：当 trigger 触发时，不立即执行 effect
  // 而是把 effect 放入队列，等微任务时统一执行
  scheduler() {
    console.log("  [scheduler] 被调用，effect 入队");
    // Set.add 会自动去重
    // 如果 effect4 已经在队列中，不会重复添加
    jobQueue.add(effect4);
    // 触发刷新（微任务）
    flushJob();
  }
});
// 首次执行（run），输出：[effect 执行] val = 0

console.log("同步修改 val = 1");
state4.val = 1;
// set → trigger → 调用 scheduler
// scheduler 输出：[scheduler] 被调用，effect 入队
// effect4 入队，flushJob 触发微任务

console.log("同步修改 val = 2");
state4.val = 2;
// set → trigger → 调用 scheduler
// scheduler 输出：[scheduler] 被调用，effect 入队
// effect4 已在队列中（Set 去重），不会重复添加

console.log("同步修改 val = 3");
state4.val = 3;
// 同上，effect4 已在队列中

console.log("同步代码执行完毕，等待微任务...");
// 微任务执行：遍历 jobQueue，执行 effect4.run()
// effect4 读取 state4.val，此时 val = 3
// 输出：[effect 执行] val = 3
// 只执行了一次！三次修改合并为一次 effect 执行
`
  },

  // ===========================================================
  // 第 7 章：ref 与 shallowRef：基本类型响应式
  // ===========================================================
  {
    id: "vs-ref-shallow",
    group: "第一部分 响应式系统",
    icon: "📦",
    title: "ref 与 shallowRef：基本类型响应式",
    content: `
# 第 7 章 ref 与 shallowRef：基本类型响应式

## 一、开篇：Proxy 的局限性

前面几章我们用 \`Proxy\` 实现了 \`reactive\`，可以让对象变成响应式的。但有一个问题：**Proxy 无法代理基本类型**。

\`\`\`js
const num = 42;
const proxy = new Proxy(num, {}); // TypeError: Cannot create proxy with a non-object as target
\`\`\`

Proxy 的 target 必须是对象。那数字、字符串、布尔值这些基本类型怎么变成响应式的？

### 1.1 生活类比：包装盒

你买了一颗钻石（基本类型值），想给它装上报警器（响应式追踪）。但报警器只能装在盒子上，不能装在钻石本身上。怎么办？

**把钻石放进一个盒子里，给盒子装报警器。**

- 钻石 = 基本类型值（42, "hello", true）
- 盒子 = ref 对象（\`{ value: 42 }\`）
- 报警器 = get/set 拦截（track/trigger）
- 取钻石 = \`ref.value\`（打开盒子）

这就是 \`ref\` 的核心思想：**用对象包装基本类型，通过 \`.value\` 属性访问**。

### 1.2 为什么不用对象而要用 ref？

你可能会想：为什么不直接把基本类型放到对象里，用 \`reactive\` 包装？

\`\`\`js
// 方案 A：用 reactive 包装
const state = reactive({ count: 0 });
state.count++;  // 响应式 ✓

// 方案 B：用 ref
const count = ref(0);
count.value++;  // 响应式 ✓
\`\`\`

两种方案都能实现响应式，但 ref 有以下优势：

| 对比项 | reactive | ref |
|--------|----------|-----|
| 基本类型 | 不支持 | 支持 |
| 整体替换 | 不支持（\`state = newObj\` 丢失响应式） | 支持（\`count.value = newVal\`） |
| 解构 | 丢失响应式 | \`toRef\` 可保持 |
| 语义 | 表示「对象」 | 表示「单个值」 |

## 二、ref 的实现

### 2.1 用 .value 包装

ref 的实现思路：创建一个对象，用 getter/setter 拦截 \`value\` 属性的读写。

\`\`\`js
class RefImpl {
  constructor(value) {
    this._value = value;  // 存储原始值
  }
  get value() {
    track(this, 'value');  // 读取时收集依赖
    return this._value;
  }
  set value(newVal) {
    if (newVal !== this._value) {  // 值变化才触发
      this._value = newVal;        // 先设值
      trigger(this, 'value');      // 再触发更新
    }
  }
}

function ref(value) {
  return new RefImpl(value);
}
\`\`\`

关键点：
- \`track(this, 'value')\`：\`this\` 是 ref 对象本身，作为 target
- \`trigger(this, 'value')\`：修改时通知依赖
- **值变化才触发**：\`newVal !== this._value\` 避免不必要的更新

### 2.2 为什么用 class 而不用普通对象？

用 class 有几个好处：
1. **封装性好**：\`_value\` 是私有属性，外部只能通过 \`.value\` 访问
2. **类型标记**：可以加 \`_isRef\` 属性，方便判断是否是 ref
3. **接近 Vue 实现**：Vue 3 的源码也是用 class 实现的

### 2.3 使用示例

\`\`\`js
const count = ref(0);

effect(() => {
  console.log(count.value);  // 0
});

count.value = 10;  // 触发 effect，输出 10
count.value = 10;  // 值没变，不触发（浅比较）
\`\`\`

## 三、ref 内部对对象的 reactive 转换

### 3.1 为什么需要自动转换？

如果 ref 的值是对象，你可能会这样用：

\`\`\`js
const state = ref({ count: 0 });
state.value.count++;  // 会触发更新吗？
\`\`\`

如果 ref 只是简单存储对象，\`state.value.count\` 读取的是原始对象，\`count++\` 修改的也是原始对象——**没有经过 Proxy，不会触发更新**！

### 3.2 解决方案：自动调用 reactive

ref 在存储值时，如果值是对象，自动用 \`reactive\` 包装：

\`\`\`js
function convert(val) {
  // 只有对象才需要 reactive 包装
  // 基本类型直接返回
  return (typeof val === 'object' && val !== null) ? reactive(val) : val;
}

class RefImpl {
  constructor(value) {
    this._value = convert(value);  // 对象自动转 reactive
  }
  get value() {
    track(this, 'value');
    return this._value;  // 返回的是 reactive 后的对象
  }
  set value(newVal) {
    if (newVal !== this._value) {
      this._value = convert(newVal);  // 新值也转换
      trigger(this, 'value');
    }
  }
}
\`\`\`

这样 \`state.value\` 拿到的是 reactive 对象，\`state.value.count++\` 会触发更新。

### 3.3 生活类比：快递保险

你寄一个包裹（ref），里面如果装的是易碎品（对象），快递公司自动给你套一层保护膜（reactive）。如果装的是普通物品（基本类型），直接原样寄出。

## 四、shallowRef：只代理 .value 不深入

### 4.1 什么是 shallowRef？

有时候你不希望 ref 内部做深层响应式转换——可能出于性能考虑，或者你知道内部数据不需要响应式。这时用 \`shallowRef\`：

\`\`\`js
const state = shallowRef({ count: 0 });
state.value.count++;  // 不会触发更新！
state.value = { count: 1 };  // 会触发更新（替换整个 value）
\`\`\`

\`shallowRef\` 只追踪 \`.value\` 本身的变化，不关心 \`.value\` 内部属性的变化。

### 4.2 实现差异

\`\`\`js
class RefImpl {
  constructor(value, shallow) {
    this._shallow = shallow;
    // shallow 为 true 时不调用 convert
    this._value = shallow ? value : convert(value);
  }
  // ... getter/setter 同上
  set value(newVal) {
    if (newVal !== this._value) {
      this._value = this._shallow ? newVal : convert(newVal);
      trigger(this, 'value');
    }
  }
}

function ref(value) {
  return new RefImpl(value, false);    // 深层响应式
}
function shallowRef(value) {
  return new RefImpl(value, true);     // 浅层响应式
}
\`\`\`

### 4.3 shallowRef 的使用场景

| 场景 | 为什么用 shallowRef |
|------|---------------------|
| 大型配置对象 | 内部不会修改，只整体替换 |
| 第三方库实例 | 不需要深层代理（可能破坏功能） |
| 性能优化 | 避免深层递归代理的开销 |
| Canvas/WebGL 数据 | 数据量大，深层代理不现实 |

### 4.4 生活类比：保鲜盒 vs 透明袋

- \`ref\` = 保鲜盒：每个格子都有盖子（深层响应式），打开任何格子都有感应
- \`shallowRef\` = 透明袋：只关心袋子整体换没换，里面的东西随便动不报警

## 五、ref vs reactive 选择指南

| 场景 | 推荐 | 原因 |
|------|------|------|
| 单个基本类型 | \`ref\` | reactive 不支持基本类型 |
| 需要整体替换的对象 | \`ref\` | \`obj.value = newObj\` 简单 |
| 表单状态对象 | \`reactive\` | 不用每次写 \`.value\` |
| 从函数返回响应式数据 | \`ref\` | 避免解构丢失响应式 |
| 大型不可变数据 | \`shallowRef\` | 性能优化 |

## 六、本章完整 demo 说明

demo 包含三个演示：
1. **基本类型响应式**：用 ref 实现数字的响应式
2. **对象自动转换**：ref 内部对对象自动调用 reactive
3. **shallowRef 对比**：shallowRef 不深入代理的区别

## 七、本章小结

| 知识点 | 核心内容 |
|--------|----------|
| 为什么需要 ref | Proxy 无法代理基本类型 |
| ref 实现 | 用 \`.value\` getter/setter 包装 |
| 自动 reactive | ref 内部对对象值调用 reactive |
| shallowRef | 只追踪 \`.value\` 变化，不深入 |
| 值比较 | 新旧值不同才触发更新 |

下一章我们实现 \`computed\`——懒计算的响应式数据，它只在实际被读取时才计算，且会缓存结果。
`,
    code: `// ============================================
// 第 7 章 demo：ref 与 shallowRef
// 运行方式：node vuesrc-ch7.js
// 本 demo 实现 ref 和 shallowRef，演示基本类型响应式
// ============================================

// ------------------------------------------------------------
// 第一部分：响应式基础设施（复用前几章的代码）
// ------------------------------------------------------------

// 当前正在执行的 effect
let activeEffect = null;

// effect 栈，处理嵌套 effect
const effectStack = [];

// 依赖存储：WeakMap<target, Map<key, Set<effect>>>
const targetMap = new WeakMap();

/**
 * track：收集依赖
 */
function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  dep.add(activeEffect);
}

/**
 * trigger：触发更新
 */
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (!dep) return;
  const effects = [...dep];
  effects.forEach(effect => {
    // 跳过当前正在执行的 effect，避免无限循环
    if (effect === activeEffect) return;
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  });
}

/**
 * effect：注册副作用函数
 */
function effect(fn, options = {}) {
  const _effect = {
    run() {
      activeEffect = _effect;
      effectStack.push(_effect);
      try {
        return fn();
      } finally {
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1] || null;
      }
    },
    scheduler: options.scheduler
  };
  if (!options.lazy) {
    _effect.run();
  }
  return _effect;
}

/**
 * reactive：创建响应式对象
 */
function reactive(target) {
  return new Proxy(target, {
    get(obj, key) {
      track(obj, key);
      return Reflect.get(obj, key);
    },
    set(obj, key, value) {
      const result = Reflect.set(obj, key, value);
      trigger(obj, key);
      return result;
    }
  });
}

// ------------------------------------------------------------
// 第二部分：ref 和 shallowRef 的实现（本章核心！）
// ------------------------------------------------------------

/**
 * convert：值转换函数
 * 如果值是对象（非 null），用 reactive 包装
 * 如果是基本类型，直接返回
 *
 * 为什么需要转换？
 *   ref 可以包装任何类型的值
 *   当值是对象时，我们希望对象的属性也是响应式的
 *   所以自动用 reactive 包装对象
 *
 * @param {*} val - 要转换的值
 * @returns {*} 转换后的值
 */
function convert(val) {
  // typeof null === 'object'，所以要额外判断 val !== null
  // 数组也是对象，也会被 reactive 包装
  return (typeof val === 'object' && val !== null) ? reactive(val) : val;
}

/**
 * RefImpl：ref 的实现类
 *
 * 生活类比：包装盒
 *   - _value 是盒子里的东西
 *   - get value() 是打开盒子（同时登记谁打开了）
 *   - set value() 是替换盒子里的东西（同时通知所有登记过的人）
 *
 * @property {boolean} _isRef - 标记是否是 ref 对象
 * @property {boolean} _shallow - 是否是浅层响应式
 * @property {*} _value - 存储的值（可能经过 convert 转换）
 */
class RefImpl {
  constructor(value, shallow) {
    // 标记这是一个 ref 对象
    // 外部可以通过这个属性判断是否是 ref
    this._isRef = true;

    // 是否是浅层响应式
    // true = shallowRef：不转换对象，只追踪 .value 变化
    // false = ref：对象值会自动用 reactive 包装
    this._shallow = shallow;

    // 存储值
    // 如果是 shallow，直接存储原始值
    // 如果不是 shallow，调用 convert 转换（对象会被 reactive 包装）
    this._value = shallow ? value : convert(value);
  }

  /**
   * value 的 getter
   * 读取 ref.value 时触发
   * 1. 收集依赖（把当前 effect 记录到 this 的 'value' 依赖中）
   * 2. 返回存储的值
   */
  get value() {
    // this 是 ref 对象本身，作为 target
    // 'value' 作为 key
    track(this, 'value');
    return this._value;
  }

  /**
   * value 的 setter
   * 设置 ref.value = newVal 时触发
   * 1. 比较新旧值，只有不同才更新
   * 2. 更新值（如果是 ref 不是 shallowRef，自动转换）
   * 3. 触发更新
   */
  set value(newVal) {
    // 只有新旧值不同才需要更新
    // 这是浅比较，用 !== 判断
    // 对于对象，比较的是引用；如果修改对象内部属性，不会触发这里
    if (newVal !== this._value) {
      // 更新值
      // shallowRef 直接存储新值
      // ref 会对新值调用 convert（如果是对象，会被 reactive 包装）
      this._value = this._shallow ? newVal : convert(newVal);
      // 触发更新，通知所有依赖 'value' 的 effect
      trigger(this, 'value');
    }
  }
}

/**
 * ref：创建深层响应式引用
 * @param {*} value - 初始值
 * @returns {RefImpl} ref 对象
 */
function ref(value) {
  return new RefImpl(value, false);  // shallow = false
}

/**
 * shallowRef：创建浅层响应式引用
 * @param {*} value - 初始值
 * @returns {RefImpl} shallowRef 对象
 */
function shallowRef(value) {
  return new RefImpl(value, true);   // shallow = true
}

// ------------------------------------------------------------
// 第三部分：演示
// ------------------------------------------------------------

console.log("=== 演示 1：基本类型响应式 ===");
console.log("用 ref 包装数字，实现基本类型的响应式");

// 创建一个 ref，初始值为 0
const count = ref(0);
console.log("创建 ref(0)");
console.log("count.value =", count.value);  // 0

// 注册 effect，读取 count.value
effect(() => {
  console.log("  [effect 执行] count =", count.value);
});
// 首次执行，输出：count = 0

console.log("修改 count.value = 10");
count.value = 10;
// set value 触发 trigger，effect 重新执行
// 输出：count = 10

console.log("修改 count.value = 10（值没变，不触发）");
count.value = 10;
// 新旧值相同（10 === 10），不触发更新

console.log("修改 count.value = 20");
count.value = 20;
// 输出：count = 20


console.log();
console.log("=== 演示 2：ref 内部对对象的 reactive 转换 ===");
console.log("ref 包装对象时，自动调用 reactive");

// 创建一个 ref，值是对象
const state = ref({ name: "Vue", version: 3 });
console.log("创建 ref({ name: 'Vue', version: 3 })");

// 检查 state.value 是否是 reactive 对象
// reactive 对象是 Proxy，可以通过特殊方式检测
// 这里简单验证：修改内部属性能否触发更新
effect(() => {
  console.log("  [effect 执行] name =", state.value.name, "version =", state.value.version);
});
// 首次执行，输出：name = Vue version = 3

console.log("修改 state.value.name = 'Vue.js'");
state.value.name = "Vue.js";
// state.value 返回的是 reactive 对象
// 修改 name 属性触发 reactive 的 set → trigger
// 输出：name = Vue.js version = 3

console.log("修改 state.value.version = 3.4");
state.value.version = 3.4;
// 输出：name = Vue.js version = 3.4

console.log("整体替换 state.value = { name: 'React', version: 18 }");
state.value = { name: "React", version: 18 };
// ref 的 set value 被调用
// 新值是对象，会被 convert（reactive）包装
// trigger 触发，effect 重新执行
// 输出：name = React version = 18


console.log();
console.log("=== 演示 3：shallowRef 只代理 .value ===");
console.log("shallowRef 不会对内部属性做响应式转换");

// 创建一个 shallowRef
const shallowState = shallowRef({ count: 0 });
console.log("创建 shallowRef({ count: 0 })");

let triggerCount = 0;
effect(() => {
  triggerCount++;
  console.log("  [effect 执行] triggerCount =", triggerCount, "count =", shallowState.value.count);
});
// 首次执行，输出：triggerCount = 1 count = 0

console.log("修改 shallowState.value.count = 1（不会触发！）");
shallowState.value.count = 1;
// shallowRef 不做深层转换
// shallowState.value 返回的是原始对象，不是 reactive
// 修改 count 不会触发 trigger
// effect 不会重新执行！

console.log("triggerCount 仍然是", triggerCount, "(没有增加)");

console.log("整体替换 shallowState.value = { count: 99 }");
shallowState.value = { count: 99 };
// set value 被调用，新旧值不同（对象引用不同）
// trigger 触发，effect 重新执行
// 输出：triggerCount = 2 count = 99

console.log();
console.log("=== 总结 ===");
console.log("ref：基本类型用 .value，对象自动转 reactive（深层响应式）");
console.log("shallowRef：只追踪 .value 替换，不深入（浅层响应式）");
`
  },

  // ===========================================================
  // 第 8 章：computed：懒计算的响应式数据
  // ===========================================================
  {
    id: "vs-computed-lazy",
    group: "第一部分 响应式系统",
    icon: "🧮",
    title: "computed：懒计算的响应式数据",
    content: `
# 第 8 章 computed：懒计算的响应式数据

## 一、开篇：为什么需要 computed？

### 1.1 生活类比：缓存冰箱

假设你每天早上要喝一杯混合果汁，配方是：2 个苹果 + 1 个橙子 + 半个柠檬。你有两种做法：

**做法 A（每次现榨）**：每次想喝就去拿水果、洗、切、榨。如果一天想喝 5 次，就要做 5 遍同样的工作。

**做法 B（缓存冰箱）**：第一次榨好一大壶放冰箱。每次想喝直接倒一杯。只有当水果换了（比如苹果从红富士换成青苹果），才重新榨一壶。

| 做法 | 对应概念 |
|------|----------|
| 水果 | 响应式数据（reactive/ref） |
| 榨果汁 | 计算过程（getter 函数） |
| 做法A | 每次访问都重新计算（普通函数） |
| 做法B | computed（懒计算 + 缓存） |
| 水果没换 | 依赖没变，返回缓存 |
| 水果换了 | 依赖变了，标记为脏，下次访问时重算 |

\`computed\` 就是那个**缓存冰箱**：只在依赖变化时才重新计算，否则直接返回缓存结果。

### 1.2 computed 的核心特性

computed 有两个核心特性：

1. **懒计算（Lazy）**：只在被访问时才计算，不主动计算
2. **缓存（Cache）**：依赖不变时返回缓存值，不重复计算

对比 \`effect\`：

| 特性 | effect | computed |
|------|--------|----------|
| 执行时机 | 立即执行 + 数据变化时执行 | 被访问时才执行 |
| 缓存 | 无 | 有（依赖不变时返回缓存） |
| 返回值 | 不关心 | 关心（计算结果） |
| 用途 | 副作用（DOM 操作、日志等） | 派生状态 |

### 1.3 使用示例

\`\`\`js
const count = ref(0);

// computed：返回 count 的两倍
const double = computed(() => count.value * 2);

console.log(double.value); // 0（第一次访问，计算）
count.value = 10;
console.log(double.value); // 20（依赖变了，重新计算）
console.log(double.value); // 20（依赖没变，返回缓存）
\`\`\`

## 二、dirty 标志位：脏数据需要重新计算

### 2.1 什么是 dirty？

\`dirty\` 是一个布尔标志，表示「计算结果是否过期」：

- \`dirty = true\`：数据脏了，需要重新计算
- \`dirty = false\`：数据干净，可以返回缓存

工作流程：
1. 初始状态：\`dirty = true\`（还没计算过）
2. 第一次访问 \`.value\`：dirty 为 true → 执行计算 → 存储结果 → \`dirty = false\`
3. 再次访问 \`.value\`：dirty 为 false → 直接返回缓存
4. 依赖变化：\`dirty = true\`（标记为脏，但不立即计算！）
5. 下次访问 \`.value\`：dirty 为 true → 重新计算 → \`dirty = false\`

### 2.2 生活类比：备忘录上的便签

你有一张便签，上面写着「苹果价格 × 2 = ?」：

- **便签空白**（dirty = true）：需要算一遍，写上答案
- **便签有答案**（dirty = false）：直接看答案
- **苹果价格变了**：把答案划掉（dirty = true），但**不立刻重算**
- **下次有人问**：发现答案被划掉了，重新算一遍，写上新答案

关键：**划掉答案不等于重新计算**。只有下次有人问的时候才算。这就是「懒」。

### 2.3 依赖变化时只标记 dirty

这是 computed 性能优势的关键：**依赖变化时只标记 dirty，不立即计算**。

\`\`\`js
// 如果立即计算：
count.value = 1;  // 立即计算 double = 2
count.value = 2;  // 立即计算 double = 4
count.value = 3;  // 立即计算 double = 6
console.log(double.value); // 6
// 计算了 3 次，但只用了最后 1 次

// 如果懒计算：
count.value = 1;  // 只标记 dirty = true
count.value = 2;  // dirty 已经是 true，不用重复标记
count.value = 3;  // 同上
console.log(double.value); // dirty = true → 计算一次 → 6
// 只计算了 1 次！
\`\`\`

## 三、computed 本身也是 effect

### 3.1 为什么 computed 是 effect？

computed 需要知道自己的 getter 依赖了哪些响应式数据。怎么知道？**让 getter 在一个 effect 中执行**，这样 \`track\` 就会自动收集依赖。

\`\`\`js
const _effect = effect(getter, {
  lazy: true,  // 不立即执行（computed 是懒的）
  scheduler: () => {
    // 当依赖变化时，scheduler 被调用
    // 不执行 getter，只标记 dirty
    this._dirty = true;
  }
});
\`\`\`

### 3.2 computed effect 的特殊之处

普通 effect 和 computed effect 的区别：

| 对比项 | 普通 effect | computed effect |
|--------|-------------|-----------------|
| 首次执行 | 立即执行 | 延迟执行（lazy） |
| trigger 时 | 重新执行 | 只标记 dirty |
| 返回值 | 忽略 | 作为 computed 的值 |
| 用途 | 副作用 | 派生状态 |

### 3.3 完整工作流程

\`\`\`js
class ComputedRefImpl {
  constructor(getter) {
    this._dirty = true;    // 初始为脏
    this._value = undefined; // 缓存值

    // 创建一个 lazy effect
    this._effect = effect(getter, {
      lazy: true,  // 不立即执行
      scheduler: () => {
        // 依赖变化时，只标记 dirty
        // 不立即计算！这就是「懒」的体现
        if (!this._dirty) {
          this._dirty = true;
          // 通知依赖这个 computed 的 effect
          trigger(this, 'value');
        }
      }
    });
  }

  get value() {
    if (this._dirty) {
      // 脏数据：重新计算
      this._value = this._effect.run();
      this._dirty = false; // 标记为干净
    }
    // 收集依赖（让外层 effect 也依赖这个 computed）
    track(this, 'value');
    return this._value;
  }
}
\`\`\`

### 3.4 为什么 getter 中要 track？

当外层 effect 读取 \`computed.value\` 时，需要让外层 effect 也依赖这个 computed。这样当 computed 的值变化时（dirty 从 false 变 true），外层 effect 也能被触发重新执行。

流程：
1. 外层 effect 读取 \`computed.value\` → \`track(this, 'value')\` 收集外层 effect
2. computed 的依赖变化 → scheduler 执行 → \`_dirty = true\` → \`trigger(this, 'value')\`
3. \`trigger\` 找到 'value' 的依赖（外层 effect）→ 执行外层 effect
4. 外层 effect 重新读取 \`computed.value\` → \`_dirty = true\` → 重新计算

## 四、缓存效果详解

### 4.1 缓存命中（不重算）

\`\`\`js
const count = ref(0);
const double = computed(() => {
  console.log('计算了！');  // 只有真正计算时才打印
  return count.value * 2;
});

console.log(double.value); // 计算了！ → 0
console.log(double.value); // （不打印）→ 0（缓存命中）
console.log(double.value); // （不打印）→ 0（缓存命中）
\`\`\`

### 4.2 缓存失效（重算）

\`\`\`js
count.value = 10;
// scheduler 被调用 → _dirty = true
// 但不立即计算！

console.log(double.value); // 计算了！ → 20（重新计算）
console.log(double.value); // （不打印）→ 20（缓存命中）
\`\`\`

### 4.3 多次修改只算一次

\`\`\`js
count.value = 1;  // _dirty = true
count.value = 2;  // _dirty 已经是 true
count.value = 3;  // 同上
console.log(double.value); // 计算了！→ 6（只算一次）
\`\`\`

### 4.4 生活类比：缓存冰箱再解释

- 冰箱空了（dirty=true）→ 要榨果汁
- 冰箱有果汁（dirty=false）→ 直接倒
- 水果换了 → 把冰箱里的果汁倒掉（dirty=true），但**不立刻榨新的**
- 有人来倒果汁 → 发现冰箱空了 → 现榨 → 倒给他
- 连续换了 3 次水果 → 冰箱还是空的（dirty 已经是 true）→ 只在有人来时榨 1 次

## 五、computed 嵌套

computed 可以依赖另一个 computed：

\`\`\`js
const count = ref(1);
const double = computed(() => count.value * 2);
const quadruple = computed(() => double.value * 2);

console.log(quadruple.value); // 4
count.value = 10;
console.log(quadruple.value); // 40
\`\`\`

工作原理：
1. \`quadruple.value\` 被访问 → dirty → 执行 \`double.value * 2\`
2. 读取 \`double.value\` → double 也 dirty → 执行 \`count.value * 2\`
3. 链式计算，每层都正确更新

## 六、本章完整 demo 说明

demo 包含以下演示：
1. **懒计算**：computed 在被访问前不会计算
2. **缓存效果**：依赖不变时返回缓存，不重复计算
3. **依赖变化**：修改数据后，下次访问才重新计算
4. **多次修改只算一次**：连续修改数据，只计算一次
5. **computed 嵌套**：computed 依赖另一个 computed

## 七、本章小结

| 知识点 | 核心内容 |
|--------|----------|
| 懒计算 | 只在被访问时才计算 |
| 缓存 | 依赖不变时返回缓存值 |
| dirty 标志 | true=需要重算，false=可返回缓存 |
| 依赖变化 | 只标记 dirty，不立即计算 |
| computed 是 effect | 用 lazy effect 收集依赖 |
| 通知外层 | getter 中 track，scheduler 中 trigger |

下一章我们实现 \`watch\` 和 \`watchEffect\`——侦听器，让用户可以在数据变化时执行自定义逻辑。
`,
    code: `// ============================================
// 第 8 章 demo：computed 懒计算
// 运行方式：node vuesrc-ch8.js
// 本 demo 实现 computed，演示懒计算和缓存效果
// ============================================

// ------------------------------------------------------------
// 第一部分：响应式基础设施
// ------------------------------------------------------------

// 当前正在执行的 effect
let activeEffect = null;

// effect 栈，处理嵌套 effect
const effectStack = [];

// 依赖存储：WeakMap<target, Map<key, Set<effect>>>
const targetMap = new WeakMap();

/**
 * track：收集依赖
 */
function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  dep.add(activeEffect);
}

/**
 * trigger：触发更新
 */
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (!dep) return;
  const effects = [...dep];
  effects.forEach(effect => {
    if (effect === activeEffect) return;
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  });
}

/**
 * effect：注册副作用函数
 * 新增 lazy 选项：如果为 true，不立即执行（用于 computed）
 */
function effect(fn, options = {}) {
  const _effect = {
    run() {
      activeEffect = _effect;
      effectStack.push(_effect);
      try {
        return fn();
      } finally {
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1] || null;
      }
    },
    scheduler: options.scheduler
  };
  // lazy 模式：不立即执行，由调用方决定何时执行
  // computed 用 lazy=true，在第一次访问 .value 时才执行
  if (!options.lazy) {
    _effect.run();
  }
  return _effect;
}

/**
 * reactive：创建响应式对象
 */
function reactive(target) {
  return new Proxy(target, {
    get(obj, key) {
      track(obj, key);
      return Reflect.get(obj, key);
    },
    set(obj, key, value) {
      const result = Reflect.set(obj, key, value);
      trigger(obj, key);
      return result;
    }
  });
}

/**
 * ref：创建响应式引用
 */
function convert(val) {
  return (typeof val === 'object' && val !== null) ? reactive(val) : val;
}

class RefImpl {
  constructor(value, shallow) {
    this._isRef = true;
    this._shallow = shallow;
    this._value = shallow ? value : convert(value);
  }
  get value() {
    track(this, 'value');
    return this._value;
  }
  set value(newVal) {
    if (newVal !== this._value) {
      this._value = this._shallow ? newVal : convert(newVal);
      trigger(this, 'value');
    }
  }
}

function ref(value) {
  return new RefImpl(value, false);
}

// ------------------------------------------------------------
// 第二部分：computed 的实现（本章核心！）
// ------------------------------------------------------------

/**
 * ComputedRefImpl：computed 的实现类
 *
 * 生活类比：缓存冰箱
 *   - _dirty = true  → 冰箱空了，需要榨果汁
 *   - _dirty = false → 冰箱有果汁，直接倒
 *   - 依赖变化       → 把果汁倒掉（_dirty = true），但不立刻榨新的
 *   - 访问 .value    → 发现冰箱空了，现榨一杯
 *
 * @property {boolean} _dirty - 脏标志，true 表示需要重新计算
 * @property {*} _value - 缓存的计算结果
 * @property {Object} _effect - 内部的 lazy effect
 */
class ComputedRefImpl {
  constructor(getter) {
    // 初始为脏：还没计算过，第一次访问时需要计算
    this._dirty = true;

    // 缓存值：存储上次计算的结果
    this._value = undefined;

    // 创建一个 lazy effect 来执行 getter
    // lazy: true 表示不立即执行（computed 是懒的）
    // scheduler: 当依赖变化时，不执行 getter，只标记 dirty
    this._effect = effect(getter, {
      lazy: true,
      scheduler: () => {
        // 当依赖变化时，这个 scheduler 被 trigger 调用
        // 关键：不立即执行 getter！只标记为脏
        // 这样即使依赖连续变化多次，也只标记一次 dirty
        if (!this._dirty) {
          this._dirty = true;  // 标记为脏
          // 通知依赖这个 computed 的外层 effect
          // 外层 effect 会重新执行，读取 .value，发现 dirty，重新计算
          trigger(this, 'value');
        }
      }
    });
  }

  /**
   * value 的 getter
   * 访问 computed.value 时触发
   */
  get value() {
    // 如果是脏数据，需要重新计算
    if (this._dirty) {
      // 执行 effect.run()，内部会调用 getter
      // run() 返回 getter 的返回值
      // 此时 activeEffect = this._effect，getter 中的响应式读取会收集依赖
      this._value = this._effect.run();
      // 计算完成，标记为干净
      this._dirty = false;
    }

    // 收集依赖：让读取这个 computed 的外层 effect 也依赖它
    // 这样当 computed 变化时（scheduler 中 trigger），外层 effect 会被通知
    track(this, 'value');

    return this._value;
  }
}

/**
 * computed：创建懒计算的响应式数据
 * @param {Function} getter - 计算函数
 * @returns {ComputedRefImpl} computed 对象
 */
function computed(getter) {
  return new ComputedRefImpl(getter);
}

// ------------------------------------------------------------
// 第三部分：演示
// ------------------------------------------------------------

console.log("=== 演示 1：懒计算（不被访问不计算）===");

const count = ref(0);
let computeCount = 0;  // 记录计算次数

// 创建 computed
const double = computed(() => {
  computeCount++;
  console.log("  [computed 计算了] 第", computeCount, "次");
  return count.value * 2;
});

console.log("创建了 computed，但还没访问");
console.log("computeCount =", computeCount, "（还是 0，因为懒计算）");

console.log();
console.log("=== 演示 2：缓存效果（依赖不变不重算）===");

console.log("第一次访问 double.value");
console.log("  double.value =", double.value);  // 计算第 1 次 → 0
console.log("  computeCount =", computeCount);

console.log("第二次访问 double.value");
console.log("  double.value =", double.value);  // 缓存命中，不计算
console.log("  computeCount =", computeCount, "（没增加！）");

console.log("第三次访问 double.value");
console.log("  double.value =", double.value);  // 缓存命中
console.log("  computeCount =", computeCount, "（还是没增加！）");


console.log();
console.log("=== 演示 3：依赖变化后重新计算 ===");

console.log("修改 count.value = 10");
count.value = 10;
// trigger 调用 scheduler → _dirty = true
// 但不立即计算！
console.log("computeCount =", computeCount, "（仍然没增加，因为还没访问）");

console.log("访问 double.value");
console.log("  double.value =", double.value);  // dirty=true → 计算第 2 次 → 20
console.log("  computeCount =", computeCount);

console.log("再次访问 double.value");
console.log("  double.value =", double.value);  // 缓存命中
console.log("  computeCount =", computeCount, "（没增加）");


console.log();
console.log("=== 演示 4：多次修改只算一次 ===");

console.log("连续修改 count = 1, 2, 3, 4, 5");
count.value = 1;   // _dirty = true
count.value = 2;   // _dirty 已经是 true，scheduler 里 if(!this._dirty) 不成立
count.value = 3;   // 同上
count.value = 4;   // 同上
count.value = 5;   // 同上
console.log("computeCount =", computeCount, "（没增加，因为还没访问）");

console.log("访问 double.value");
console.log("  double.value =", double.value);  // 只计算 1 次 → 10
console.log("  computeCount =", computeCount, "（只增加了 1！）");


console.log();
console.log("=== 演示 5：computed 嵌套 ===");

const baseCount = ref(1);
// double 依赖 baseCount
const doubleCount = computed(() => {
  console.log("  [doubleCount 计算了]");
  return baseCount.value * 2;
});
// quadruple 依赖 doubleCount（computed 依赖 computed）
const quadrupleCount = computed(() => {
  console.log("  [quadrupleCount 计算了]");
  return doubleCount.value * 2;
});

console.log("访问 quadrupleCount.value");
console.log("  quadrupleCount.value =", quadrupleCount.value);
// 输出：
//   [quadrupleCount 计算了]
//   [doubleCount 计算了]
//   quadrupleCount.value = 4

console.log("再次访问 quadrupleCount.value（缓存命中）");
console.log("  quadrupleCount.value =", quadrupleCount.value);
// 不会打印「计算了」（两个 computed 都命中缓存）

console.log("修改 baseCount = 10");
baseCount.value = 10;
// doubleCount 的 scheduler 被调用 → _dirty = true
// quadrupleCount 的 scheduler 被调用 → _dirty = true

console.log("访问 quadrupleCount.value");
console.log("  quadrupleCount.value =", quadrupleCount.value);
// 两个 computed 都重新计算
// 输出：
//   [quadrupleCount 计算了]
//   [doubleCount 计算了]
//   quadrupleCount.value = 40


console.log();
console.log("=== 演示 6：computed 在 effect 中使用 ===");

const price = ref(100);
const quantity = ref(3);
// computed 计算总价
const total = computed(() => {
  console.log("  [total 计算了]");
  return price.value * quantity.value;
});

// 在 effect 中使用 computed
effect(() => {
  console.log("  [effect 执行] 总价 =", total.value);
});
// 首次执行：
//   [effect 执行] 总价 = 300（total 被访问，触发计算）

console.log("修改 price = 200");
price.value = 200;
// total 的依赖变化 → scheduler → _dirty = true → trigger(total, 'value')
// effect 被触发 → 读取 total.value → dirty → 重新计算
// 输出：
//   [total 计算了]
//   [effect 执行] 总价 = 600

console.log("修改 quantity = 5");
quantity.value = 5;
// 输出：
//   [total 计算了]
//   [effect 执行] 总价 = 1000

console.log();
console.log("=== 总结 ===");
console.log("computed = 懒计算 + 缓存");
console.log("懒：不被访问不计算");
console.log("缓存：依赖不变返回旧值");
console.log("高效：多次修改只算一次");
`
  },

  // ===========================================================
  // 第 9 章：watch 与 watchEffect：侦听器
  // ===========================================================
  {
    id: "vs-watch-effect",
    group: "第一部分 响应式系统",
    icon: "👁️",
    title: "watch 与 watchEffect：侦听器",
    content: `
# 第 9 章 watch 与 watchEffect：侦听器

## 一、开篇：侦听器的角色

前面几章我们实现了 \`reactive\`、\`ref\`、\`effect\`、\`computed\`。\`effect\` 是最基础的副作用机制，但直接用 \`effect\` 有两个问题：

1. **无法获取旧值**：effect 只在新数据变化后执行，不知道变化前是什么
2. **无法停止**：effect 一旦注册，无法取消

\`watch\` 和 \`watchEffect\` 就是解决这些问题的高级 API。

### 1.1 生活类比：侦探

想象你是一个侦探，要监视嫌疑人：

| 侦探行为 | 对应 API |
|----------|----------|
| 派助手盯梢，发现任何风吹草动就报告 | \`watchEffect\` |
| 只关心嫌疑人有没有换车，换车时报告新旧车牌 | \`watch\` |
| 撤回助手，停止监视 | \`stop()\` |
| 每次盯梢前，先取消上一次的盯梢计划 | \`cleanup\` |

### 1.2 watch vs watchEffect

| 对比项 | watchEffect | watch |
|--------|-------------|-------|
| 依赖收集 | 自动（执行时收集） | 显式指定侦听源 |
| 执行时机 | 立即执行一次 | 默认不立即执行（可配置 immediate） |
| 旧值 | 不提供 | 提供新旧值 |
| 侦听源 | 函数内部读取的响应式数据 | ref / 函数 / 数组 |
| 适用场景 | 不需要旧值，自动追踪 | 需要新旧值，精确控制 |

## 二、watchEffect：立即执行 + 自动收集依赖

### 2.1 基本用法

\`\`\`js
const count = ref(0);

watchEffect(() => {
  console.log("count 变了:", count.value);
});
// 立即输出：count 变了: 0

count.value = 10;
// 输出：count 变了: 10
\`\`\`

\`watchEffect\` 的特点：
1. **立即执行**：注册时就执行一次（收集依赖）
2. **自动追踪**：函数内读取了哪些响应式数据，就追踪哪些
3. **响应变化**：追踪的数据变化时，函数重新执行

### 2.2 实现

\`watchEffect\` 本质上就是一个 \`effect\`，但加了 cleanup 和 stop 功能：

\`\`\`js
function watchEffect(fn) {
  let cleanupFn = null;

  // onCleanup：用户调用来注册清理函数
  const onCleanup = (fn) => {
    cleanupFn = fn;
  };

  // 包装函数：执行前先清理上一次的副作用
  const wrappedFn = () => {
    // 如果有上一次的清理函数，先执行
    if (cleanupFn) {
      cleanupFn();
      cleanupFn = null;
    }
    // 执行用户函数，传入 onCleanup
    fn(onCleanup);
  };

  // 创建 effect（立即执行，收集依赖）
  const _effect = effect(wrappedFn, {
    scheduler: () => {
      // 数据变化时，重新执行
      wrappedFn();
    }
  });

  // 返回停止函数
  return () => {
    // 停止时执行清理
    if (cleanupFn) cleanupFn();
  };
}
\`\`\`

### 2.3 为什么用 effect 的 lazy 模式？

实际上 \`watchEffect\` 不用 lazy 模式，因为它需要立即执行一次来收集依赖。但我们需要对执行过程做包装（cleanup 逻辑），所以把 fn 包在 wrappedFn 里。

## 三、watch：明确指定侦听源

### 3.1 基本用法

\`\`\`js
const count = ref(0);

watch(count, (newVal, oldVal) => {
  console.log("count 从", oldVal, "变成", newVal);
});
// 默认不立即执行

count.value = 10;
// 输出：count 从 0 变成 10
\`\`\`

\`watch\` 的特点：
1. **明确指定侦听源**：第一个参数是 ref 或函数
2. **获取新旧值**：回调参数 \`newVal\` 和 \`oldVal\`
3. **默认不立即执行**：只在数据变化后才执行（可配 \`immediate: true\`）

### 3.2 实现

\`\`\`js
function watch(source, cb, options = {}) {
  let oldValue;

  // 把 source 统一成 getter 函数
  const getter = typeof source === 'function'
    ? source
    : () => source.value;  // ref 的情况

  // 创建 lazy effect（不立即执行）
  const _effect = effect(getter, {
    lazy: true,
    scheduler: () => {
      // 数据变化时，获取新值
      const newValue = _effect.run();
      // 值变化才触发回调
      if (newValue !== oldValue) {
        cb(newValue, oldValue);
        oldValue = newValue;
      }
    }
  });

  // 手动执行一次，获取初始值
  oldValue = _effect.run();

  // 如果配置了 immediate，立即执行回调
  if (options.immediate) {
    cb(oldValue, undefined);
  }

  // 返回停止函数
  return () => {
    _effect.active = false;
  };
}
\`\`\`

### 3.3 侦听源的类型

\`\`\`js
// 1. ref
watch(count, (newVal, oldVal) => { ... });

// 2. getter 函数
watch(() => state.count, (newVal, oldVal) => { ... });

// 3. 多个源（数组）
watch([count, () => state.name], ([newCount, newName], [oldCount, oldName]) => { ... });
\`\`\`

### 3.4 生活类比：指定监视目标

- \`watchEffect\` = 便衣警察在街上巡逻，看到什么可疑就报告
- \`watch\` = 指定监视某个特定嫌疑人，只有他换车时才报告，而且告诉你旧车牌和新车牌

## 四、cleanup 清理副作用

### 4.1 为什么需要 cleanup？

考虑这个场景：

\`\`\`js
watchEffect((onCleanup) => {
  const timer = setTimeout(() => {
    console.log("定时器执行了，count =", count.value);
  }, 1000);
});
\`\`\`

如果 \`count\` 在 1 秒内变了 3 次，会注册 3 个定时器，3 个都会执行。但你只想保留最后一个。

\`\`\`js
watchEffect((onCleanup) => {
  const timer = setTimeout(() => {
    console.log("定时器执行了，count =", count.value);
  }, 1000);

  // 注册清理函数：下次执行前清除这个定时器
  onCleanup(() => {
    clearTimeout(timer);
  });
});
\`\`\`

这样每次 effect 重新执行前，先清除上一个定时器，只有最后一个会执行。

### 4.2 生活类比：备忘录

你让助手「10 分钟后提醒我开会」。如果你改了开会时间，你希望助手：
- **没有 cleanup**：10 分钟后助手提醒你（用的是旧时间），然后又过了 10 分钟又提醒你（用的是新时间）
- **有 cleanup**：每次设新提醒前，先取消旧提醒

### 4.3 cleanup 的执行时机

cleanup 在 **effect 重新执行之前** 被调用：

1. 第一次执行：fn(onCleanup) → 注册 cleanup
2. 数据变化：**调用 cleanup** → fn(onCleanup) → 注册新的 cleanup
3. 数据变化：**调用 cleanup** → fn(onCleanup) → ...
4. stop()：**调用 cleanup** → 结束

## 五、stop 停止侦听

### 5.1 为什么需要 stop？

\`\`\`js
const stop = watchEffect(() => {
  console.log(count.value);
});

// 不想再监听了
stop();  // 停止侦听
\`\`\`

组件卸载时需要停止侦听，避免内存泄漏。

### 5.2 实现

\`\`\`js
function watchEffect(fn) {
  // ...
  const _effect = effect(wrappedFn, { ... });

  return () => {
    // 执行最后一次清理
    if (cleanupFn) cleanupFn();
    // 标记 effect 为非活跃
    _effect.active = false;
  };
}
\`\`\`

当 \`_effect.active = false\` 后，\`trigger\` 调用时不会执行这个 effect。

## 六、watch 的 immediate 选项

### 6.1 默认行为

\`\`\`js
const count = ref(0);

// 默认不立即执行
watch(count, (newVal, oldVal) => {
  console.log("变化:", oldVal, "→", newVal);
});

count.value = 10;
// 输出：变化: 0 → 10
\`\`\`

### 6.2 immediate 选项

\`\`\`js
// immediate: true 立即执行一次
watch(count, (newVal, oldVal) => {
  console.log("变化:", oldVal, "→", newVal);
}, { immediate: true });
// 立即输出：变化: undefined → 0

count.value = 10;
// 输出：变化: 0 → 10
\`\`\`

## 七、本章完整 demo 说明

demo 包含以下演示：
1. **watchEffect 基本用法**：自动收集依赖
2. **watch 基本用法**：获取新旧值
3. **watch 的 immediate 选项**
4. **cleanup 清理副作用**
5. **stop 停止侦听**

## 八、本章小结

| 知识点 | watchEffect | watch |
|--------|-------------|-------|
| 依赖收集 | 自动 | 显式指定 |
| 执行时机 | 立即执行 | 默认不执行（immediate 可配） |
| 新旧值 | 不提供 | 提供 |
| cleanup | 支持 | 支持 |
| stop | 支持 | 支持 |
| 本质 | effect + cleanup + stop | lazy effect + 比较新旧值 |

下一章是响应式系统的整合章节，我们会把 \`reactive\`、\`ref\`、\`effect\`、\`computed\`、\`watch\` 整合成完整的响应式模块。
`,
    code: `// ============================================
// 第 9 章 demo：watch 与 watchEffect
// 运行方式：node vuesrc-ch9.js
// 本 demo 实现 watchEffect 和 watch，演示侦听逻辑
// ============================================

// ------------------------------------------------------------
// 第一部分：响应式基础设施
// ------------------------------------------------------------

// 当前正在执行的 effect
let activeEffect = null;

// effect 栈，处理嵌套 effect
const effectStack = [];

// 依赖存储：WeakMap<target, Map<key, Set<effect>>>
const targetMap = new WeakMap();

/**
 * track：收集依赖
 */
function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  dep.add(activeEffect);
}

/**
 * trigger：触发更新
 * 新增：检查 effect.active，非活跃的 effect 不执行
 */
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (!dep) return;
  const effects = [...dep];
  effects.forEach(effect => {
    // 跳过非活跃的 effect（已被 stop 的）
    if (!effect.active) return;
    if (effect === activeEffect) return;
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  });
}

/**
 * effect：注册副作用函数
 * 新增 active 标志，用于 stop 功能
 */
function effect(fn, options = {}) {
  const _effect = {
    // active 标志：true 表示活跃，false 表示已停止
    active: true,
    run() {
      // 如果已停止，直接执行 fn（但不收集依赖）
      if (!this.active) return fn();
      activeEffect = _effect;
      effectStack.push(_effect);
      try {
        return fn();
      } finally {
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1] || null;
      }
    },
    scheduler: options.scheduler
  };
  if (!options.lazy) {
    _effect.run();
  }
  return _effect;
}

/**
 * reactive：创建响应式对象
 */
function reactive(target) {
  return new Proxy(target, {
    get(obj, key) {
      track(obj, key);
      return Reflect.get(obj, key);
    },
    set(obj, key, value) {
      const result = Reflect.set(obj, key, value);
      trigger(obj, key);
      return result;
    }
  });
}

/**
 * ref：创建响应式引用
 */
function convert(val) {
  return (typeof val === 'object' && val !== null) ? reactive(val) : val;
}

class RefImpl {
  constructor(value, shallow) {
    this._isRef = true;
    this._shallow = shallow;
    this._value = shallow ? value : convert(value);
  }
  get value() {
    track(this, 'value');
    return this._value;
  }
  set value(newVal) {
    if (newVal !== this._value) {
      this._value = this._shallow ? newVal : convert(newVal);
      trigger(this, 'value');
    }
  }
}

function ref(value) {
  return new RefImpl(value, false);
}

// ------------------------------------------------------------
// 第二部分：watchEffect 的实现（本章核心！）
// ------------------------------------------------------------

/**
 * watchEffect：立即执行 + 自动收集依赖
 *
 * 生活类比：便衣侦探
 *   - 派一个侦探去巡逻（立即执行）
 *   - 侦探在巡逻中看到什么可疑的东西（读取响应式数据）
 *     就记住这些地方（自动收集依赖）
 *   - 这些地方有变化时，侦探重新去巡逻（重新执行）
 *   - 可以随时撤回侦探（stop）
 *
 * @param {Function} fn - 副作用函数，接收 onCleanup 参数
 * @returns {Function} stop 停止函数
 */
function watchEffect(fn) {
  // 存储用户注册的清理函数
  let cleanupFn = null;

  /**
   * onCleanup：用户调用此函数注册清理函数
   * 清理函数会在下次 effect 执行前被调用
   * 典型用途：清除定时器、取消网络请求、移除事件监听
   */
  const onCleanup = (fn) => {
    cleanupFn = fn;
  };

  /**
   * wrappedFn：包装函数
   * 在用户函数执行前，先执行上一次的清理函数
   * 这样确保每次执行前，上一次的副作用被清理掉
   */
  const wrappedFn = () => {
    // 如果有上一次的清理函数，先执行
    if (cleanupFn) {
      cleanupFn();
      cleanupFn = null;  // 清空，防止重复执行
    }
    // 执行用户函数，传入 onCleanup
    fn(onCleanup);
  };

  // 创建 effect
  // wrappedFn 会立即执行一次（收集依赖）
  const _effect = effect(wrappedFn, {
    // 数据变化时的调度函数
    scheduler: () => {
      // 重新执行 wrappedFn（会先 cleanup，再执行 fn）
      wrappedFn();
    }
  });

  /**
   * stop：停止侦听
   * 1. 执行最后一次清理
   * 2. 标记 effect 为非活跃
   */
  const stop = () => {
    if (cleanupFn) {
      cleanupFn();  // 执行清理
      cleanupFn = null;
    }
    _effect.active = false;  // 标记为非活跃
  };

  return stop;
}

// ------------------------------------------------------------
// 第三部分：watch 的实现
// ------------------------------------------------------------

/**
 * watch：明确指定侦听源 + 获取新旧值
 *
 * 生活类比：指定目标侦探
 *   - 你告诉侦探「只盯着嫌疑人的车」（指定侦听源）
 *   - 嫌疑人换车时，侦探报告「旧车是 A，新车是 B」（新旧值）
 *   - 默认不立即报告（immediate = false）
 *   - 可以配置 immediate = true，立即报告一次
 *
 * @param {*} source - 侦听源（ref 或 getter 函数）
 * @param {Function} cb - 回调函数 (newVal, oldVal) => {}
 * @param {Object} options - 配置项 { immediate: boolean }
 * @returns {Function} stop 停止函数
 */
function watch(source, cb, options = {}) {
  let oldValue;

  // 把 source 统一成 getter 函数
  // source 可能是 ref（有 .value）或函数
  const getter = typeof source === 'function'
    ? source                           // 函数：直接用
    : () => source.value;              // ref：包装成 () => ref.value

  // 创建 lazy effect（不立即执行）
  // lazy: true 因为 watch 不需要立即执行，只需要在数据变化时执行
  const _effect = effect(getter, {
    lazy: true,
    scheduler: () => {
      // 数据变化时，scheduler 被 trigger 调用
      // 重新执行 getter 获取新值
      const newValue = _effect.run();
      // 只有值真的变了才触发回调
      // （浅比较，对象比较引用）
      if (newValue !== oldValue) {
        // 调用用户回调，传入新值和旧值
        cb(newValue, oldValue);
        // 更新 oldValue
        oldValue = newValue;
      }
    }
  });

  // 手动执行一次，获取初始值
  // 这会收集依赖（getter 中读取的响应式数据）
  oldValue = _effect.run();

  // 如果配置了 immediate，立即执行回调
  if (options.immediate) {
    cb(oldValue, undefined);  // 第一次没有旧值，传 undefined
  }

  // 返回停止函数
  const stop = () => {
    _effect.active = false;
  };

  return stop;
}

// ------------------------------------------------------------
// 第四部分：演示
// ------------------------------------------------------------

console.log("=== 演示 1：watchEffect 自动收集依赖 ===");

const count = ref(0);

console.log("注册 watchEffect");
const stop1 = watchEffect(() => {
  // 函数内读取了 count.value，自动建立依赖
  console.log("  [watchEffect 执行] count =", count.value);
});
// 立即执行一次，输出：count = 0

console.log("修改 count = 10");
count.value = 10;
// watchEffect 被触发，输出：count = 10

console.log("修改 count = 20");
count.value = 20;
// 输出：count = 20


console.log();
console.log("=== 演示 2：watch 获取新旧值 ===");

const name = ref("Vue");

console.log("注册 watch（默认不立即执行）");
watch(name, (newVal, oldVal) => {
  console.log("  [watch 回调] 名称从", oldVal, "变为", newVal);
});
// 默认不执行

console.log("修改 name = 'Vue.js'");
name.value = "Vue.js";
// 输出：名称从 Vue 变为 Vue.js

console.log("修改 name = 'Vue 3'");
name.value = "Vue 3";
// 输出：名称从 Vue.js 变为 Vue 3


console.log();
console.log("=== 演示 3：watch 的 immediate 选项 ===");

const age = ref(18);

console.log("注册 watch（immediate: true）");
watch(age, (newVal, oldVal) => {
  console.log("  [watch 回调] 年龄:", oldVal, "->", newVal);
}, { immediate: true });
// 立即执行，输出：年龄: undefined -> 18

console.log("修改 age = 20");
age.value = 20;
// 输出：年龄: 18 -> 20


console.log();
console.log("=== 演示 4：cleanup 清理副作用 ===");

const searchQuery = ref("hello");
let searchCount = 0;

console.log("注册 watchEffect，模拟搜索（带 cleanup）");
const stop4 = watchEffect((onCleanup) => {
  searchCount++;
  const currentSearch = searchCount;
  console.log("  [搜索 #" + currentSearch + "] 查询:", searchQuery.value);

  // 模拟异步搜索
  const timer = setTimeout(() => {
    console.log("  [搜索结果 #" + currentSearch + "] 完成，查询:", searchQuery.value);
  }, 50);

  // 注册清理函数：下次执行前取消这个定时器
  onCleanup(() => {
    console.log("  [cleanup] 取消搜索 #" + currentSearch);
    clearTimeout(timer);
  });
});
// 立即执行，输出：搜索 #1 查询: hello

console.log("快速修改 searchQuery = 'world'");
searchQuery.value = "world";
// cleanup 取消搜索 #1
// 然后执行搜索 #2

console.log("快速修改 searchQuery = 'vue'");
searchQuery.value = "vue";
// cleanup 取消搜索 #2
// 然后执行搜索 #3

console.log("等待 100ms 让定时器执行...");
// 只有搜索 #3 的定时器会执行（前两个被 cleanup 取消了）
setTimeout(() => {
  console.log();
  console.log("=== 演示 5：stop 停止侦听 ===");

  const data = ref(0);
  const stop5 = watchEffect(() => {
    console.log("  [watchEffect 执行] data =", data.value);
  });
  // 输出：data = 0

  console.log("修改 data = 1");
  data.value = 1;
  // 输出：data = 1

  console.log("调用 stop()");
  stop5();
  // effect 被标记为非活跃

  console.log("修改 data = 2");
  data.value = 2;
  // 不会触发！因为 effect 已停止

  console.log("修改 data = 3");
  data.value = 3;
  // 不会触发！

  console.log();
  console.log("=== 总结 ===");
  console.log("watchEffect：立即执行 + 自动追踪依赖 + cleanup + stop");
  console.log("watch：指定侦听源 + 新旧值 + immediate + stop");
}, 100);
`
  },

  // ===========================================================
  // 第 10 章：响应式系统整合：完整版响应式模块
  // ===========================================================
  {
    id: "vs-reactivity-summary",
    group: "第一部分 响应式系统",
    icon: "✨",
    title: "响应式系统整合：完整版响应式模块",
    content: `
# 第 10 章 响应式系统整合：完整版响应式模块

## 一、开篇：从碎片到整体

过去几章我们分别实现了 \`reactive\`、\`effect\`、\`trigger\`、\`ref\`、\`shallowRef\`、\`computed\`、\`watch\`、\`watchEffect\`。每个都是独立的零件，本章我们要把它们**组装成一台完整的机器**。

### 1.1 生活类比：组装一辆汽车

| 汽车零件 | 对应响应式 API |
|----------|----------------|
| 发动机 | \`effect\`（动力来源） |
| 传动轴 | \`track\` + \`trigger\`（传递动力） |
| 车轮 | \`reactive\`（接触地面） |
| 备用轮胎 | \`ref\` / \`shallowRef\`（基本类型） |
| 导航仪 | \`computed\`（计算路线） |
| 后视镜 | \`watch\` / \`watchEffect\`（观察变化） |
| 完整的汽车 | 整合后的响应式系统 |

单独的零件不能开，组装在一起才能上路。本章就是组装的过程。

## 二、完整响应式系统代码回顾

### 2.1 核心架构

\`\`\`
                     ┌─────────────┐
                     │  targetMap  │  依赖存储
                     │ (WeakMap)   │
                     └──────┬──────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
         ┌────▼────┐   ┌───▼───┐   ┌────▼────┐
         │  track  │   │trigger│   │ effect  │
         │ (收集)  │   │ (触发)│   │ (副作用)│
         └────┬────┘   └───┬───┘   └────┬────┘
              │            │            │
    ┌─────────┼────────────┼────────────┼─────────┐
    │         │            │            │         │
┌───▼───┐ ┌──▼──┐ ┌───────▼──────┐ ┌──▼──┐ ┌────▼────┐
│reactive│ │ ref │ │  computed   │ │watch│ │watchEffect│
│(对象)  │ │(基本)│ │ (懒计算缓存)│ │(侦听)│ │ (自动追踪)│
└───────┘ └─────┘ └────────────┘ └─────┘ └─────────┘
\`\`\`

### 2.2 各模块职责

| 模块 | 职责 | 关键实现 |
|------|------|----------|
| \`targetMap\` | 存储依赖关系 | WeakMap → Map → Set |
| \`track\` | 收集依赖 | get 拦截器中调用 |
| \`trigger\` | 触发更新 | set 拦截器中调用 |
| \`effect\` | 副作用管理 | effectStack + active |
| \`reactive\` | 对象响应式 | Proxy get/set |
| \`ref\` | 基本类型响应式 | class + getter/setter |
| \`shallowRef\` | 浅层响应式 | 不调用 convert |
| \`computed\` | 懒计算 + 缓存 | dirty 标志 + lazy effect |
| \`watch\` | 侦听特定源 | lazy effect + 新旧值比较 |
| \`watchEffect\` | 自动追踪侦听 | effect + cleanup + stop |

## 三、依赖关系图

### 3.1 API 之间的调用关系

\`\`\`
reactive ──使用──→ Proxy
              │
              ├──get──→ track ──使用──→ activeEffect
              │
              └──set──→ trigger ──调用──→ effect.run() 或 effect.scheduler()

ref ──内部使用──→ reactive（通过 convert）
    └──get/set──→ track / trigger

computed ──内部使用──→ effect（lazy + scheduler）
        └──get──→ track（让外层 effect 依赖 computed）

watch ──内部使用──→ effect（lazy + scheduler）
      └──scheduler──→ 比较新旧值 → 调用回调

watchEffect ──内部使用──→ effect（立即执行）
            └──scheduler──→ 重新执行 + cleanup
\`\`\`

### 3.2 数据流

\`\`\`
用户代码
  │
  ├── 读取数据 ──→ Proxy.get ──→ track ──→ dep.add(activeEffect)
  │
  ├── 修改数据 ──→ Proxy.set ──→ trigger ──→ 遍历 dep
  │                                           │
  │                          ┌────────────────┤
  │                          │                │
  │                     有 scheduler      无 scheduler
  │                          │                │
  │                     调用 scheduler    调用 effect.run()
  │                          │
  │              ┌───────────┼───────────┐
  │              │           │           │
  │          computed     watch     watchEffect
  │          (标记dirty)  (比较值)   (cleanup+重跑)
  │
  └── 访问 computed.value ──→ dirty? ──→ 重算 or 缓存
\`\`\`

## 四、与真实 Vue 3 reactivity 的对比

### 4.1 我们实现 vs Vue 3 源码

| 特性 | 我们的实现 | Vue 3 实际实现 | 差异 |
|------|-----------|---------------|------|
| 依赖存储 | WeakMap → Map → Set | 相同 | ✓ |
| track | dep.add(activeEffect) | 相同 + cleanup 旧 deps | Vue 多了 cleanup |
| trigger | 遍历 + 执行 | 相同 + ADD/DELETE/SET 类型 | Vue 区分操作类型 |
| effect | effectStack | 相同 + scope 管理 | Vue 有 effectScope |
| reactive | Proxy get/set | 相同 + has/ownKeys/deleteProperty | Vue 拦截更多操作 |
| ref | class + getter/setter | 相同 | ✓ |
| computed | dirty 标志 | 相同 + ref 标记 | 基本一致 |
| watch | lazy effect | 相同 + traverse + multiSource | Vue 支持更多源 |
| watchEffect | effect + cleanup | 相同 | ✓ |

### 4.2 Vue 3 多做了什么？

Vue 3 的 reactivity 模块比我们的实现多了以下功能：

1. **更多 Proxy 拦截器**：\`has\`、\`ownKeys\`、\`deleteProperty\`
2. **数组特殊处理**：\`push\`、\`pop\`、\`splice\` 等方法
3. **Map/Set 支持**：集合类型的响应式
4. **effectScope**：批量管理 effect 的生命周期
5. **toRef/toRefs**：把 reactive 属性转成 ref
6. **readonly/shallowReadonly**：只读代理
7. **customRef**：自定义 ref 的依赖追踪逻辑
8. **isRef/isReactive/isProxy**：类型判断工具
9. **markRaw**：标记对象不被转成 reactive
10. **unref**：获取 ref 的值（如果是 ref）

### 4.3 为什么我们的实现更简单？

教学目的下，我们省略了：
- 性能优化（cleanup 旧依赖避免内存泄漏）
- 边界情况（数组、Map/Set 的特殊处理）
- 类型系统（TypeScript 类型推导）
- 开发者工具集成（DevTools 支持）

但**核心原理完全一致**：Proxy + WeakMap + Set + effect。

## 五、完整 demo：状态管理示例

下面的 demo 用我们实现的完整响应式系统，构建一个类似 Pinia/Vuex 的**状态管理 store**：

\`\`\`js
// store 定义
const useStore = createStore({
  state: () => ({
    count: 0,
    todos: [],
    filter: 'all'
  }),
  getters: {
    doubleCount: (state) => state.count * 2,
    filteredTodos: (state) => {
      if (state.filter === 'done') return state.todos.filter(t => t.done);
      if (state.filter === 'todo') return state.todos.filter(t => !t.done);
      return state.todos;
    }
  },
  actions: {
    increment(state) { state.count++; },
    addTodo(state, text) { state.todos.push({ text, done: false }); },
    toggleTodo(state, index) { state.todos[index].done = !state.todos[index].done; }
  }
});

// 使用
const store = useStore();
console.log(store.state.count);        // 0
console.log(store.getters.doubleCount); // 0
store.actions.increment();
console.log(store.state.count);        // 1
console.log(store.getters.doubleCount); // 2
\`\`\`

这个 demo 展示了响应式系统的实际应用：
- \`state\` 用 \`reactive\` 创建
- \`getters\` 用 \`computed\` 创建（自动缓存）
- \`actions\` 直接修改 \`state\`（触发响应式更新）
- 可以用 \`watch\` 监听状态变化

## 六、本章小结

| 知识点 | 核心内容 |
|--------|----------|
| 系统架构 | track/trigger + effect + 各 API |
| API 关系 | 所有 API 都建立在 effect + track/trigger 之上 |
| 与 Vue 3 对比 | 核心原理一致，Vue 多了边界处理和优化 |
| 实际应用 | 可以构建状态管理、数据绑定等高级功能 |

## 七、全教程响应式部分总结

回顾第 3-10 章，我们完整实现了 Vue 3 的响应式系统：

| 章节 | 内容 | 核心代码 |
|------|------|----------|
| 第 3 章 | 响应式原理 | 概念入门 |
| 第 4 章 | reactive | Proxy get/set |
| 第 5 章 | effect + track | 依赖收集 |
| 第 6 章 | trigger + scheduler | 触发更新 + 调度 |
| 第 7 章 | ref + shallowRef | 基本类型响应式 |
| 第 8 章 | computed | 懒计算 + 缓存 |
| 第 9 章 | watch + watchEffect | 侦听器 |
| 第 10 章 | 整合 | 完整系统 |

**一句话总结 Vue 响应式**：用 Proxy 拦截数据读写，读时收集依赖（track），写时触发更新（trigger），用 effect 管理副作用，用 effectStack 处理嵌套，用 scheduler 控制执行时机，用 dirty 实现懒计算缓存。
`,
    code: `// ============================================
// 第 10 章 demo：响应式系统整合 + 状态管理示例
// 运行方式：node vuesrc-ch10.js
// 本 demo 把 reactive、ref、effect、computed、watch 整合成
// 完整的响应式系统，并用它实现一个状态管理 store
// ============================================

// =============================================================
// 第一部分：完整响应式系统
// 包含所有 API：reactive、ref、shallowRef、effect、
// computed、watch、watchEffect
// =============================================================

// ------------------------------------------------------------
// 1.1 全局状态
// ------------------------------------------------------------

// 当前正在执行的 effect
let activeEffect = null;

// effect 栈，处理嵌套 effect
const effectStack = [];

// 依赖存储：WeakMap<target, Map<key, Set<effect>>>
const targetMap = new WeakMap();

// ------------------------------------------------------------
// 1.2 track：收集依赖
// ------------------------------------------------------------
function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  dep.add(activeEffect);
}

// ------------------------------------------------------------
// 1.3 trigger：触发更新
// ------------------------------------------------------------
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (!dep) return;
  const effects = [...dep];
  effects.forEach(effect => {
    if (!effect.active) return;
    if (effect === activeEffect) return;
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  });
}

// ------------------------------------------------------------
// 1.4 effect：注册副作用函数
// ------------------------------------------------------------
function effect(fn, options = {}) {
  const _effect = {
    active: true,
    run() {
      if (!this.active) return fn();
      activeEffect = _effect;
      effectStack.push(_effect);
      try {
        return fn();
      } finally {
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1] || null;
      }
    },
    scheduler: options.scheduler
  };
  if (!options.lazy) {
    _effect.run();
  }
  return _effect;
}

// ------------------------------------------------------------
// 1.5 reactive：创建响应式对象
// ------------------------------------------------------------
function reactive(target) {
  return new Proxy(target, {
    get(obj, key) {
      track(obj, key);
      return Reflect.get(obj, key);
    },
    set(obj, key, value) {
      const result = Reflect.set(obj, key, value);
      trigger(obj, key);
      return result;
    }
  });
}

// ------------------------------------------------------------
// 1.6 ref / shallowRef：基本类型响应式
// ------------------------------------------------------------
function convert(val) {
  return (typeof val === 'object' && val !== null) ? reactive(val) : val;
}

class RefImpl {
  constructor(value, shallow) {
    this._isRef = true;
    this._shallow = shallow;
    this._value = shallow ? value : convert(value);
  }
  get value() {
    track(this, 'value');
    return this._value;
  }
  set value(newVal) {
    if (newVal !== this._value) {
      this._value = this._shallow ? newVal : convert(newVal);
      trigger(this, 'value');
    }
  }
}

function ref(value) {
  return new RefImpl(value, false);
}

function shallowRef(value) {
  return new RefImpl(value, true);
}

// ------------------------------------------------------------
// 1.7 computed：懒计算 + 缓存
// ------------------------------------------------------------
class ComputedRefImpl {
  constructor(getter) {
    this._dirty = true;
    this._value = undefined;
    this._effect = effect(getter, {
      lazy: true,
      scheduler: () => {
        if (!this._dirty) {
          this._dirty = true;
          trigger(this, 'value');
        }
      }
    });
  }
  get value() {
    if (this._dirty) {
      this._value = this._effect.run();
      this._dirty = false;
    }
    track(this, 'value');
    return this._value;
  }
}

function computed(getter) {
  return new ComputedRefImpl(getter);
}

// ------------------------------------------------------------
// 1.8 watchEffect：立即执行 + 自动追踪
// ------------------------------------------------------------
function watchEffect(fn) {
  let cleanupFn = null;
  const onCleanup = (fn) => { cleanupFn = fn; };
  const wrappedFn = () => {
    if (cleanupFn) {
      cleanupFn();
      cleanupFn = null;
    }
    fn(onCleanup);
  };
  const _effect = effect(wrappedFn, {
    scheduler: () => { wrappedFn(); }
  });
  return () => {
    if (cleanupFn) cleanupFn();
    _effect.active = false;
  };
}

// ------------------------------------------------------------
// 1.9 watch：指定侦听源 + 新旧值
// ------------------------------------------------------------
function watch(source, cb, options = {}) {
  let oldValue;
  const getter = typeof source === 'function'
    ? source
    : () => source.value;
  const _effect = effect(getter, {
    lazy: true,
    scheduler: () => {
      const newValue = _effect.run();
      if (newValue !== oldValue) {
        cb(newValue, oldValue);
        oldValue = newValue;
      }
    }
  });
  oldValue = _effect.run();
  if (options.immediate) {
    cb(oldValue, undefined);
  }
  return () => { _effect.active = false; };
}

// =============================================================
// 第二部分：状态管理 store 实现
// 用完整响应式系统构建一个类似 Pinia 的 store
// =============================================================

/**
 * createStore：创建状态管理 store
 *
 * 生活类比：便利店管理
 *   state   = 仓库里的货物（响应式数据）
 *   getters = 货物统计报表（computed，自动缓存）
 *   actions = 进出货操作（修改 state 的方法）
 *
 * @param {Object} options - store 配置
 *   - state: () => 返回初始状态的函数
 *   - getters: { [name]: (state) => value } 计算属性
 *   - actions: { [name]: (state, ...args) => void } 操作方法
 * @returns {Function} useStore 函数
 */
function createStore(options) {
  // 解构配置
  const { state: stateFn, getters: gettersOpt, actions: actionsOpt } = options;

  // 创建响应式 state
  const state = reactive(stateFn());

  // 创建 getters（用 computed 实现懒计算 + 缓存）
  const getters = {};
  for (const key in gettersOpt) {
    // 每个 getter 都是一个 computed
    // 这样 getter 的结果会被缓存，只有依赖变化时才重新计算
    getters[key] = computed(() => gettersOpt[key](state));
  }

  // 创建 actions（直接修改 state）
  const actions = {};
  for (const key in actionsOpt) {
    // action 接收 state 作为第一个参数
    // 调用时传入额外的参数
    actions[key] = (...args) => actionsOpt[key](state, ...args);
  }

  // 返回 useStore 函数（Pinia 风格，单例模式）
  // 多次调用 useStore() 返回同一个 store 实例
  const store = { state, getters, actions };
  return () => store;
}

// =============================================================
// 第三部分：演示
// =============================================================

console.log("================================================");
console.log("  完整响应式系统演示");
console.log("================================================");

console.log();
console.log("=== 演示 1：reactive + effect 基本响应式 ===");

const user = reactive({ name: "张三", age: 25 });

effect(() => {
  console.log("  用户信息:", user.name, user.age, "岁");
});
// 输出：用户信息: 张三 25 岁

user.name = "李四";
// 输出：用户信息: 李四 25 岁

user.age = 30;
// 输出：用户信息: 李四 30 岁


console.log();
console.log("=== 演示 2：ref 基本类型响应式 ===");

const theme = ref("light");

effect(() => {
  console.log("  当前主题:", theme.value);
});
// 输出：当前主题: light

theme.value = "dark";
// 输出：当前主题: dark


console.log();
console.log("=== 演示 3：computed 懒计算缓存 ===");

const price = ref(100);
const quantity = ref(3);
const total = computed(() => {
  console.log("  [computed 计算]");
  return price.value * quantity.value;
});

console.log("总价:", total.value);  // 计算 → 300
console.log("总价:", total.value);  // 缓存 → 300（不计算）

price.value = 200;
console.log("总价:", total.value);  // 重新计算 → 600


console.log();
console.log("=== 演示 4：watch 侦听器 ===");

const notification = ref("");

watch(notification, (newVal, oldVal) => {
  console.log("  通知变更:", oldVal, "->", newVal);
});

notification.value = "你有新消息";
// 输出：通知变更: -> 你有新消息

notification.value = "消息已读";
// 输出：通知变更: 你有新消息 -> 消息已读


console.log();
console.log("=== 演示 5：watchEffect 自动追踪 ===");

const settings = reactive({ volume: 50, brightness: 80 });

watchEffect(() => {
  console.log("  设置更新 - 音量:", settings.volume, "亮度:", settings.brightness);
});
// 立即输出

settings.volume = 75;
// 输出

settings.brightness = 90;
// 输出


console.log();
console.log("=== 演示 6：状态管理 store（综合应用）===");
console.log("创建一个 Todo List Store");

// 定义 store
const useTodoStore = createStore({
  // 初始状态
  state: () => ({
    todos: [
      { text: "学习 Vue 响应式", done: true },
      { text: "写 Mini Vue", done: false },
      { text: "分享给朋友", done: false }
    ],
    filter: "all"  // all / done / todo
  }),

  // 计算属性
  getters: {
    // 已完成的 todo 数量
    doneCount: (state) => state.todos.filter(t => t.done).length,

    // 未完成的 todo 数量
    todoCount: (state) => state.todos.filter(t => !t.done).length,

    // 过滤后的 todo 列表
    filteredTodos: (state) => {
      if (state.filter === "done") return state.todos.filter(t => t.done);
      if (state.filter === "todo") return state.todos.filter(t => !t.done);
      return state.todos;
    },

    // 进度百分比
    progress: (state) => {
      const total = state.todos.length;
      const done = state.todos.filter(t => t.done).length;
      return total === 0 ? 0 : Math.round(done / total * 100);
    }
  },

  // 操作方法
  actions: {
    addTodo(state, text) {
      state.todos.push({ text: text, done: false });
    },
    toggleTodo(state, index) {
      const todo = state.todos[index];
      if (todo) todo.done = !todo.done;
    },
    removeTodo(state, index) {
      state.todos.splice(index, 1);
    },
    setFilter(state, filter) {
      state.filter = filter;
    }
  }
});

// 创建 store 实例
const store = useTodoStore();

console.log();
console.log("--- 初始状态 ---");
console.log("  所有 Todo:");
store.state.todos.forEach((t, i) => {
  console.log("    " + i + ". [" + (t.done ? "x" : " ") + "] " + t.text);
});
console.log("  已完成:", store.getters.doneCount.value);
console.log("  未完成:", store.getters.todoCount.value);
console.log("  进度:", store.getters.progress.value + "%");

console.log();
console.log("--- 用 watch 监听进度变化 ---");
watch(
  () => store.getters.progress.value,
  (newVal, oldVal) => {
    console.log("  进度变化:", oldVal + "%", "->", newVal + "%");
  }
);

console.log();
console.log("--- 切换第二个 todo 为已完成 ---");
store.actions.toggleTodo(1);
// "写 Mini Vue" 从未完成变为已完成
// progress 从 33% 变为 67%

console.log();
console.log("--- 添加新 Todo ---");
store.actions.addTodo("复习响应式原理");
// todos 增加一项

console.log();
console.log("--- 过滤：只看未完成 ---");
store.actions.setFilter("todo");
console.log("  过滤后:");
store.getters.filteredTodos.value.forEach((t, i) => {
  console.log("    " + i + ". [" + (t.done ? "x" : " ") + "] " + t.text);
});

console.log();
console.log("--- 过滤：只看已完成 ---");
store.actions.setFilter("done");
console.log("  过滤后:");
store.getters.filteredTodos.value.forEach((t, i) => {
  console.log("    " + i + ". [" + (t.done ? "x" : " ") + "] " + t.text);
});

console.log();
console.log("--- 过滤：全部 ---");
store.actions.setFilter("all");
console.log("  过滤后:");
store.getters.filteredTodos.value.forEach((t, i) => {
  console.log("    " + i + ". [" + (t.done ? "x" : " ") + "] " + t.text);
});

console.log();
console.log("=== 最终状态 ===");
console.log("  总数:", store.state.todos.length);
console.log("  已完成:", store.getters.doneCount.value);
console.log("  未完成:", store.getters.todoCount.value);
console.log("  进度:", store.getters.progress.value + "%");

console.log();
console.log("================================================");
console.log("  响应式系统整合完成！");
console.log("  reactive + ref + effect + computed + watch");
console.log("  = 完整的 Vue 3 响应式核心");
console.log("================================================");
`
  },
];
