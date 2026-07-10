// =============================================================
// Node.js 运行原理教程（noderun）第 5-8 章
// -------------------------------------------------------------
// 内容：事件循环深入（微任务/宏任务、实战 demo）+ 异步编程（回调、Promise）
// =============================================================

export const chapters = [
  {
    id: "nr-microtask-macrotask",
    group: "第一部分 事件循环——Node.js 的心脏",
    icon: "🔬",
    title: "微任务与宏任务：nextTick、Promise 的执行时机",
    content: `# 微任务与宏任务：nextTick、Promise 的执行时机

上一章我们了解了事件循环的六个阶段，知道了 \`setTimeout\`、\`setImmediate\`、IO 回调分别在哪个阶段执行。但这只是故事的一半——Node.js 中还有两类"插队"任务：**微任务（microtask）** 和一个特殊的 **nextTick 队列**。它们会在每个阶段切换之间"加塞"执行，理解它们的优先级是看懂 Node.js 异步代码执行顺序的关键。

---

## 两类任务队列

Node.js 中的异步任务可以分为两大类：

### 1. 宏任务（macrotask）

宏任务是在事件循环的各个**阶段**中执行的任务，它们排在前一章讲的那些阶段队列里：

- \`setTimeout\` / \`setInterval\` —— timers 阶段
- \`setImmediate\` —— check 阶段
- IO 回调（如 \`fs.readFile\` 的回调）—— poll 阶段
- 关闭回调（如 \`socket.on('close')\`）—— close 阶段

宏任务的特点是：**它们必须等到事件循环进入对应的阶段才会被执行**。一个 \`setImmediate\` 即使立刻就准备好了，也得等到 check 阶段才能跑。

### 2. 微任务（microtask）

微任务是优先级更高的任务，它们**不会等到下一个阶段**，而是在每个阶段切换之间的"间隙"里执行：

- \`Promise.then\` / \`catch\` / \`finally\`
- \`queueMicrotask(fn)\`
- \`async/await\` 中 await 之后的代码（本质也是 Promise.then）

### 3. 特殊的 nextTick 队列

\`process.nextTick(fn)\` 是 Node.js 独有的一个队列，它的优先级**比微任务还高**。每个阶段结束时，Node.js 会先清空 nextTick 队列，再清空微任务队列，然后才进入下一个阶段。

---

## 执行优先级

记住这个顺序，它是排查异步问题的钥匙：

\`\`\`
process.nextTick  >  Promise 微任务  >  宏任务（setTimeout / setImmediate / IO）
\`\`\`

更精确地说，事件循环的完整执行模型是：

1. **进入一个阶段**（比如 timers）
2. **执行该阶段所有可执行的宏任务**（所有到期的 setTimeout 回调）
3. **执行所有 nextTick 回调**（清空 nextTick 队列）
4. **执行所有微任务**（清空微任务队列）
5. **进入下一个阶段**，重复 2-4

注意：nextTick 和微任务是在"阶段切换之间"执行的，不是在某个宏任务之后立即执行。也就是说，一个阶段里所有的宏任务会先全部跑完，然后才统一清空 nextTick 和微任务。

---

## 医院门诊类比

把事件循环想象成一家**医院门诊**：

- **宏任务**就像是**各科室的预约患者**。内科、外科、眼科……每个科室就是一个"阶段"，患者按预约时间排队，等到自己科室开门才就诊。
- **微任务**就像是**加号患者**。每个科室看完一批预约患者后，在切换到下一个科室之前，会先把当天挂的"加号"全部看完。加号患者不用等到下一个科室，但必须在当前科室的加号全部处理完。
- **nextTick**就像是 **VIP 急诊患者**。比加号还优先——科室切换前，先看 VIP 急诊，再看加号，最后才去下一个科室。

所以执行顺序永远是：VIP 急诊（nextTick）→ 加号（微任务）→ 下一个科室（下一个阶段的宏任务）。

---

## 为什么 process.nextTick 递归会饿死事件循环

看下面这段"危险"代码：

\`\`\`javascript
function recursiveTick() {
  process.nextTick(recursiveTick);
}
recursiveTick();
setTimeout(() => console.log('我永远跑不到'), 0);
\`\`\`

\`recursiveTick\` 每次 nextTick 自己，导致 nextTick 队列永远清不完。而 nextTick 优先级高于宏任务，事件循环永远无法进入 timers 阶段，那个 \`setTimeout\` 就成了"永远到不了的彼岸"。

这就是为什么 Node.js 官方**推荐用 \`queueMicrotask\` 代替 \`process.nextTick\`**——微任务优先级稍低，至少不会饿死 IO 回调（虽然微任务递归同样会卡死，但 nextTick 的优先级更高、影响更大）。

---

## 日常开发启示

1. **排查"为什么我的 setTimeout 不执行"**：检查是否有 nextTick/微任务递归把事件循环卡住了。
2. **慎用 process.nextTick**：它优先级太高，可能阻塞 IO。大部分场景下 \`queueMicrotask\` 就够了。
3. **理解执行顺序有助于阅读源码**：很多库（如 Mocha、Express 中间件）依赖 nextTick/Promise 来保证异步语义，不懂优先级会看不懂。
4. **async/await 的本质**：\`await x\` 之后的代码等价于 \`Promise.resolve(x).then(...)\`，所以它们也是微任务。

掌握这套优先级模型，你就能像看慢动作回放一样，准确预测任何异步代码的执行顺序。
`,
    code: `// ============================================
// 微任务与宏任务执行顺序演示
// ============================================

console.log('=== 1. 基础执行顺序：同步 > nextTick > Promise > setTimeout > setImmediate ===');

// ① 同步代码最先执行
console.log('1. 同步代码');

// ④ nextTick 优先级最高
process.nextTick(() => {
  console.log('2. process.nextTick');
});

// ⑤ Promise 微任务次之
Promise.resolve().then(() => {
  console.log('3. Promise.then 微任务');
});

// ⑥ setTimeout 宏任务（timers 阶段）
setTimeout(() => {
  console.log('4. setTimeout 宏任务');
}, 0);

// ⑦ setImmediate 宏任务（check 阶段）
setImmediate(() => {
  console.log('5. setImmediate 宏任务');
});

console.log('--- 同步代码结束，开始进入事件循环 ---');

// 延迟到第二圈再演示 nextTick 递归问题，避免污染上面的顺序演示
setTimeout(() => {
  console.log('');
  console.log('=== 2. nextTick 在阶段切换之间执行 ===');

  setTimeout(() => {
    console.log('  [宏] setTimeout 回调（timers 阶段）');
    // 在宏任务里再注册 nextTick 和 Promise
    process.nextTick(() => {
      console.log('  [nextTick] 阶段结束后立刻执行');
    });
    Promise.resolve().then(() => {
      console.log('  [微任务] nextTick 之后执行');
    });
    // 再注册一个 setTimeout，它会进入下一圈
    setTimeout(() => {
      console.log('  [宏] 下一圈 timers 阶段才会执行');
    }, 0);
  }, 0);
}, 50);

// 演示 nextTick 递归会饿死 setTimeout（用注释保留，默认不开启）
setTimeout(() => {
  console.log('');
  console.log('=== 3. nextTick 递归会饿死事件循环（演示用 3 次后停止）===');

  let count = 0;
  function recursiveTick() {
    count++;
    console.log('  nextTick 第 ' + count + ' 次');
    if (count < 3) {
      process.nextTick(recursiveTick);
    } else {
      console.log('  主动停止递归，否则下面的 setTimeout 永远执行不了');
    }
  }
  recursiveTick();

  // 这个 setTimeout 必须等 nextTick 队列清空后才能执行
  setTimeout(() => {
    console.log('  ✅ nextTick 清空后，setTimeout 终于执行了');
    console.log('  （如果上面不停止递归，这一行永远不会打印）');
  }, 0);
}, 100);

// queueMicrotask 与 nextTick 的对比
setTimeout(() => {
  console.log('');
  console.log('=== 4. queueMicrotask vs process.nextTick ===');
  console.log('  同步代码');

  process.nextTick(() => {
    console.log('  nextTick 先执行（优先级更高）');
  });

  queueMicrotask(() => {
    console.log('  queueMicrotask 后执行（微任务）');
  });

  Promise.resolve().then(() => {
    console.log('  Promise.then 也是微任务，和 queueMicrotask 同级');
  });
}, 150);
`
  },
  {
    id: "nr-event-loop-demo",
    group: "第一部分 事件循环——Node.js 的心脏",
    icon: "🧪",
    title: "实战演练：用 demo 看清事件循环完整顺序",
    content: `# 实战演练：用 demo 看清事件循环完整顺序

前面两章我们讲了事件循环的六个阶段、微任务与宏任务的优先级。但"纸上得来终觉浅"——这一章我们用精心设计的 demo 来**亲眼验证**这些规则。看完这些 demo 的输出，你会对事件循环有"顿悟"般的理解。

---

## Demo 1：混合任务大乱斗

我们把 \`setTimeout\`、\`setImmediate\`、\`process.nextTick\`、\`Promise.then\` 全部混在一起，看看它们的执行顺序。这是面试题的常客，也是理解事件循环最直接的实验。

### 在主模块（非 IO 回调）中：setTimeout vs setImmediate 顺序不确定

这一点很反直觉——\`setTimeout(fn, 0)\` 和 \`setImmediate(fn)\` 谁先执行，**取决于事件循环进入 timers 阶段时 setTimeout 是否已经到期**。

- 如果主模块同步代码执行得很快（通常几毫秒），事件循环第一次进入 timers 阶段时，1ms 都没到，\`setTimeout\` 不会触发，于是先进入 check 阶段执行 \`setImmediate\`，然后下一圈再执行 \`setTimeout\`。
- 如果机器负载高、同步代码耗时长，进入 timers 阶段时 1ms 已过，\`setTimeout\` 就会先执行。

所以**在主模块里**，\`setTimeout(fn, 0)\` 和 \`setImmediate()\` 的顺序是**不确定的**——这是 Node.js 官方文档明确说明的。但在 **IO 回调里**，顺序就确定了：\`setImmediate\` 一定先于 \`setTimeout\`。

### 在 IO 回调中：setImmediate 一定先于 setTimeout

为什么？因为 IO 回调在 poll 阶段执行。poll 阶段之后紧接着就是 check 阶段（执行 setImmediate），而 timers 阶段要到**下一圈**才会再回来。所以在 IO 回调里注册的 \`setTimeout\` 必然晚于 \`setImmediate\`。

---

## Demo 2：IO 回调中的确定顺序

我们用 \`fs.readFile\` 模拟一个 IO 操作，在它的回调里同时注册 \`setTimeout\` 和 \`setImmediate\`，验证上面的结论。

\`\`\`javascript
const fs = require('fs');
fs.readFile(__filename, () => {
  setTimeout(() => console.log('setTimeout'));
  setImmediate(() => console.log('setImmediate'));
});
// 输出几乎一定是：setImmediate 在前，setTimeout 在后
\`\`\`

这是判断"代码是否在 IO 回调里"的一个实用技巧。

---

## Demo 3：多轮事件循环

事件循环不是只跑一圈就结束的——只要还有未完成的任务（定时器、IO 监听、setImmediate），它就会**一圈一圈地转下去**。我们用 \`setTimeout\` 嵌套来展示多圈循环：

- 第一圈：执行外层 setTimeout，注册内层 setTimeout 和 setImmediate
- 阶段切换：先执行 nextTick，再执行微任务
- 第二圈：执行内层 setTimeout / setImmediate

每一圈都会经历"宏任务 → nextTick → 微任务 → 下一圈"的完整流程。

---

## 事件循环执行顺序速查表

把前面所有知识浓缩成一张表，遇到顺序问题查这一张表就够了：

| 优先级 | 类型 | API | 执行时机 |
|--------|------|-----|----------|
| 1（最高） | 同步代码 | 普通代码、require | 主线程，最先执行 |
| 2 | nextTick 队列 | \`process.nextTick\` | 每个阶段结束、微任务之前 |
| 3 | 微任务队列 | \`Promise.then\`、\`queueMicrotask\` | 每个阶段结束、nextTick 之后 |
| 4 | 宏任务-timers | \`setTimeout\`、\`setInterval\` | timers 阶段 |
| 5 | 宏任务-pending | 待处理回调 | pending 阶段（系统级，很少用） |
| 6 | 宏任务-poll | IO 回调、\`fs.readFile\` 回调 | poll 阶段 |
| 7 | 宏任务-check | \`setImmediate\` | check 阶段 |
| 8 | 宏任务-close | \`socket.on('close')\` | close 阶段 |

**关键规则**：
- 每个阶段的所有宏任务执行完后，才会清空 nextTick 和微任务队列。
- nextTick 优先级永远高于微任务。
- IO 回调里 \`setImmediate\` 永远先于 \`setTimeout\`。

---

## 日常开发启示

1. **遇到"代码执行顺序不符合预期"**：先按速查表分类——这是同步、nextTick、微任务还是宏任务？属于哪个阶段？
2. **不要依赖 setTimeout(0) 和 setImmediate 的顺序**：在主模块里它们不稳定，跨平台、跨版本可能不同。
3. **在 IO 回调里需要"延后执行"时优先用 setImmediate**：它语义更明确，且一定在当前圈的 check 阶段执行。
4. **调试异步问题时**：在关键位置打 \`console.log\` 加序号，对比预期顺序，能快速定位哪一步"插队"了。

把这几个 demo 跑一遍，对照输出反复琢磨，事件循环就不再神秘了。
`,
    code: `// ============================================
// 事件循环完整顺序实战 demo
// ============================================

const fs = require('fs');

console.log('=== Demo 1: 混合任务大乱斗（主模块）===');
console.log('预期顺序：同步 → nextTick → Promise → setTimeout/setImmediate（后两个顺序不确定）');

// ① 同步代码
console.log('1. [同步] main');

// ③ nextTick
process.nextTick(() => {
  console.log('3. [nextTick]');
});

// ④ 微任务
Promise.resolve().then(() => {
  console.log('4. [微任务] Promise.then');
});

// ⑤ 宏任务 setTimeout
setTimeout(() => {
  console.log('5. [宏-timers] setTimeout');
}, 0);

// ⑥ 宏任务 setImmediate
setImmediate(() => {
  console.log('6. [宏-check] setImmediate');
});

console.log('2. [同步] main 结束，即将进入事件循环');

// --------------------------------------------
// Demo 2: IO 回调中 setImmediate 一定先于 setTimeout
// --------------------------------------------
setTimeout(() => {
  console.log('');
  console.log('=== Demo 2: IO 回调中的确定顺序 ===');
  console.log('在 fs.readFile 回调里注册 setTimeout 和 setImmediate');

  fs.readFile(__filename, () => {
    // IO 回调在 poll 阶段执行，之后紧接 check 阶段
    setTimeout(() => {
      console.log('  [IO回调内] setTimeout（下一圈 timers）');
    }, 0);
    setImmediate(() => {
      console.log('  [IO回调内] setImmediate（当前圈 check）');
    });
    console.log('  [IO回调内] readFile 回调本身（poll 阶段）');
  });
}, 200);

// --------------------------------------------
// Demo 3: 多轮事件循环演示
// --------------------------------------------
setTimeout(() => {
  console.log('');
  console.log('=== Demo 3: 多轮事件循环 ===');

  // 第一圈：外层 setTimeout 执行
  console.log('【第1圈 timers】外层 setTimeout');
  process.nextTick(() => {
    console.log('  【第1圈 阶段切换】nextTick');
  });
  Promise.resolve().then(() => {
    console.log('  【第1圈 阶段切换】微任务');
  });

  // 注册第二圈的任务
  setTimeout(() => {
    console.log('【第2圈 timers】内层 setTimeout');
    process.nextTick(() => {
      console.log('  【第2圈 阶段切换】nextTick');
    });
    Promise.resolve().then(() => {
      console.log('  【第2圈 阶段切换】微任务');
    });
  }, 0);

  setImmediate(() => {
    console.log('【第1圈 check】setImmediate');
    process.nextTick(() => {
      console.log('  【第1圈 check 后】nextTick');
    });
  });
}, 400);

// --------------------------------------------
// Demo 4: 嵌套 nextTick 与微任务的细致顺序
// --------------------------------------------
setTimeout(() => {
  console.log('');
  console.log('=== Demo 4: nextTick 与微任务的嵌套 ===');
  console.log('注意：nextTick 队列清空后才会清空微任务队列');

  process.nextTick(() => {
    console.log('  nextTick A');
    // 在 nextTick 里再注册 nextTick 和 Promise
    process.nextTick(() => {
      console.log('  nextTick C（A 里注册的，先清完 nextTick 队列）');
    });
    Promise.resolve().then(() => {
      console.log('  微任务 X（A 里注册的，等 nextTick 全部清完）');
    });
  });

  process.nextTick(() => {
    console.log('  nextTick B');
  });

  Promise.resolve().then(() => {
    console.log('  微任务 Y（外层注册的）');
  });
}, 600);
`
  },
  {
    id: "nr-callback",
    group: "第二部分 异步编程原理",
    icon: "📞",
    title: "回调函数与错误优先约定：异步编程的起点",
    content: `# 回调函数与错误优先约定：异步编程的起点

在现代 JavaScript 里，大家都在用 \`async/await\`，似乎"回调函数"已经是上古时代的东西了。但要真正理解 Node.js 的异步模型、理解为什么 Promise 会被发明出来，就必须从回调讲起。回调是 Node.js 异步编程的**起点**，也是所有后续方案的基石。

---

## 异步编程的演进史

Node.js 异步编程经历了三代演进：

1. **回调函数（Callback）**：最原始的方案。把"将来要做的事"作为函数参数传进去，异步操作完成后调用它。
2. **Promise**：为了解决回调地狱而诞生。用链式调用代替嵌套，用状态机保证一次性的结果传递。
3. **async/await**：Promise 的语法糖。让异步代码看起来像同步代码，可读性最好。

这三代方案不是"取代"关系，而是"叠加"关系——async/await 底层还是 Promise，Promise 的 then 回调本质还是回调函数。理解回调，就是理解整条演进链的根。

---

## 回调函数的本质

回调函数的核心思想非常简单：**"我现在没空处理结果，等我忙完了我会主动叫你"**。

\`\`\`javascript
// 同步：你站在门口等快递员，啥也干不了
const data = readFileSync('a.txt');

// 异步：你留个电话（回调），快递员送到了打你电话
readFile('a.txt', (err, data) => {
  // 快递员打你电话时，你在这里处理快递
});
\`\`\`

异步回调的本质就是**把"将来要做的事"打包成一个函数，传给异步操作，让它完成后替你调用**。这样主线程就不用傻等，可以继续干别的活——这就是 Node.js 单线程高并发的秘诀。

---

## Node.js 的错误优先约定（error-first callback）

Node.js 有一个贯穿所有核心模块的约定：**回调函数的第一个参数永远是错误对象，第二个参数才是结果**。

\`\`\`javascript
fs.readFile('a.txt', (err, data) => {
  // 第一个参数 err：如果出错，err 是一个 Error 对象；没出错就是 null
  // 第二个参数 data：成功时的结果
  if (err) {
    console.error('出错了：', err);
    return;
  }
  console.log('读到了：', data);
});
\`\`\`

### 为什么要有这个约定？

因为**异步操作不能用 try/catch 捕获错误**。看这个反面教材：

\`\`\`javascript
try {
  fs.readFile('不存在的文件.txt', (err, data) => {
    // 错误发生在这里——但此时 try/catch 早就退出了！
    // 抛出的错误没人接，会变成未捕获异常
  });
} catch (e) {
  // 这里的 catch 永远抓不到上面的异步错误
  console.error(e);
}
\`\`\`

为什么 catch 抓不到？因为 \`fs.readFile\` 是**立即返回**的——它只是"派了个快递员去取文件"，主线程马上往下走，try/catch 块就结束了。等快递员回来发现文件不存在时，try/catch 早就没了，错误往哪抛？

所以 Node.js 必须通过**回调参数**来传递错误：异步操作完成后，无论成功还是失败，都调用回调函数，用第一个参数告诉你是成功还是失败。这是异步错误传递的唯一可靠方式。

---

## 回调地狱（Callback Hell）

回调方案的致命问题是：**当你需要串行执行多个异步操作时，代码会层层嵌套**，形成臭名昭著的"回调地狱"。

比如"先读用户配置 → 再根据配置读数据文件 → 再把数据写入结果文件"，用回调写就是：

\`\`\`javascript
readFile('config.json', (err, config) => {
  if (err) return handleError(err);
  readFile(config.dataFile, (err, data) => {
    if (err) return handleError(err);
    writeFile('result.txt', processData(data), (err) => {
      if (err) return handleError(err);
      console.log('完成');
      // 想再加一步？继续往里嵌...
    });
  });
});
\`\`\`

这种"俄罗斯套娃"式的代码有三大罪状：
1. **难以阅读**：代码向右凹陷，逻辑被嵌套结构淹没。
2. **难以维护**：想插入一步、改一个步骤，要在层层缩进里小心挪动。
3. **错误处理重复**：每层都要写 \`if (err)\`，漏掉一个就可能吞掉错误。

回调地狱的根源不是"回调函数"本身，而是**"用嵌套来表达串行依赖"**这个思路。Promise 用链式调用解决了它，async/await 用同步语法解决了它——但它们解决的正是回调留下的问题。

---

## 寄快递类比

把异步回调想象成**寄快递**：

- **回调函数**就是你在快递单上留的**联系电话**。快递员送达后打你电话通知你，你不用一直守在快递柜旁边等。
- **错误优先约定**就是快递员打电话来时，**先说"快递丢了"还是"快递到了"**。先报状态（err 是否为空），再说详情（data 是什么）。这样你接起电话第一句就知道是好消息还是坏消息，不会一头雾水。
- **回调地狱**就是你**同时寄了三个互相依赖的快递**：第二个快递的内容取决于第一个快递送达什么，第三个取决于第二个。你只能留"嵌套的电话"——"第一个送到后，再寄第二个，第二个送到后，再寄第三个"……电话里套电话，谁听了都头晕。

---

## 日常开发启示

1. **永远要处理回调中的 error 参数**：哪怕你"觉得不会出错"，IO 永远可能失败（磁盘满、权限不足、网络断）。忽略 error 就是埋雷。
2. **理解为什么 try/catch 抓不到异步错误**：这是面试常考题，也是理解 Promise 为什么用 .catch 的基础。
3. **理解回调地狱的根源**：不是回调函数的错，是"用嵌套表达串行依赖"的错。Promise 用 .then 链把嵌套拍平，async/await 用同步语法彻底消除嵌套。
4. **老代码维护**：很多 Node.js 核心模块和第三方老库还在用回调风格（如 fs、crypto 的部分 API），看不懂回调就看不懂这些代码。

回调是异步编程的"原点"，从这里出发，下一章我们看 Promise 是如何优雅地解决这些问题的。
`,
    code: `// ============================================
// 回调函数与错误优先约定演示
// ============================================

// ---------- 1. 模拟一个错误优先风格的异步函数 ----------
// 约定：回调第一个参数是 err，第二个是 result
function asyncReadConfig(filename, callback) {
  console.log('  [异步函数] 开始读取 ' + filename + ' ...');
  // 用 setTimeout 模拟 IO 延迟
  setTimeout(() => {
    // 模拟：文件名包含 "error" 就当作读取失败
    if (filename.includes('error')) {
      // 出错时：第一个参数传 Error 对象，第二个传 null
      callback(new Error('文件不存在：' + filename), null);
    } else {
      // 成功时：第一个参数传 null，第二个传结果
      callback(null, { filename, content: '这是 ' + filename + ' 的内容' });
    }
  }, 100);
}

console.log('=== 1. 错误优先回调的标准写法 ===');

asyncReadConfig('config.json', (err, result) => {
  // 永远先检查 err
  if (err) {
    console.error('  ❌ 出错了：', err.message);
    return;  // 出错就 return，不要继续往下处理
  }
  console.log('  ✅ 成功：', result);
});

asyncReadConfig('error-file.txt', (err, result) => {
  if (err) {
    console.error('  ❌ 出错了：', err.message);
    return;
  }
  console.log('  ✅ 成功：', result);
});

// ---------- 2. try/catch 无法捕获异步错误 ----------
setTimeout(() => {
  console.log('');
  console.log('=== 2. try/catch 抓不到异步错误 ===');

  try {
    console.log('  [try 块] 调用异步函数...');
    asyncReadConfig('error-file.txt', (err, result) => {
      // 错误在这里产生，但此时 try/catch 早已退出
      if (err) {
        console.log('  [回调内] 收到错误：', err.message);
        console.log('  [回调内] 但外面的 catch 根本抓不到这个错误');
      }
    });
    console.log('  [try 块] 异步函数已"返回"（其实是派了任务），try 块结束');
  } catch (e) {
    // 这里永远跑不到，因为错误是在回调里产生的，那时 try 块早结束了
    console.log('  [catch] 抓到了？', e.message);
  }

  console.log('  [主线程] 继续干别的活，不等异步结果');
}, 300);

// ---------- 3. 回调地狱演示 ----------
setTimeout(() => {
  console.log('');
  console.log('=== 3. 回调地狱：串行执行 3 个异步操作 ===');
  console.log('看这缩进有多深……');

  // 第一步：读配置
  asyncReadConfig('step1.json', (err1, result1) => {
    if (err1) {
      console.error('  第1步失败：', err1.message);
      return;
    }
    console.log('  第1步完成：', result1.content);

    // 第二步：依赖第一步的结果
    asyncReadConfig('step2.json', (err2, result2) => {
      if (err2) {
        console.error('  第2步失败：', err2.message);
        return;
      }
      console.log('  第2步完成：', result2.content);

      // 第三步：依赖第二步的结果
      asyncReadConfig('step3.json', (err3, result3) => {
        if (err3) {
          console.error('  第3步失败：', err3.message);
          return;
        }
        console.log('  第3步完成：', result3.content);
        console.log('  🎉 全部完成（再深一层就要疯了）');
        // 想加第四步？继续往里嵌套……
      });
    });
  });
}, 600);

// ---------- 4. 正确的错误处理 vs 忽略错误 ----------
setTimeout(() => {
  console.log('');
  console.log('=== 4. 忽略 error 参数是常见隐患 ===');

  // ❌ 错误写法：忽略 error，直接用 result
  asyncReadConfig('error-file.txt', (err, result) => {
    // 忘了检查 err，result 是 null，下面会报错或得到 undefined
    console.log('  ❌ 忽略 err 直接用 result：', result);
    console.log('     （result 是 null，业务逻辑会出问题）');
  });

  // ✅ 正确写法：永远先检查 err
  asyncReadConfig('ok-file.json', (err, result) => {
    if (err) {
      console.error('  ✅ 检查到错误：', err.message);
      return;
    }
    console.log('  ✅ 正确处理：', result.content);
  });
}, 900);
`
  },
  {
    id: "nr-promise",
    group: "第二部分 异步编程原理",
    icon: "🤝",
    title: "Promise 原理：状态机与微任务队列",
    content: `# Promise 原理：状态机与微任务队列

上一章我们看到回调地狱的痛苦，这一章来看救星——**Promise**。Promise 不只是"更好的回调"，它的背后是一套精巧的**状态机模型**和**微任务调度机制**。理解了这套原理，你就能真正掌控异步代码，而不是被异步代码牵着鼻子走。

---

## Promise 是什么

Promise 字面意思是"承诺"。在 JavaScript 里，Promise 是一个**对象**，它代表一个"未来会有值"的异步操作的结果。

\`\`\`javascript
const p = new Promise((resolve, reject) => {
  // 这里写异步操作
  // 成功了调 resolve(结果)
  // 失败了调 reject(错误)
});
\`\`\`

注意：Promise 是**立即执行**的——\`new Promise\` 时传入的函数会同步执行，但 \`resolve\`/\`reject\` 之后的结果是通过 \`then\` 在**微任务**里拿到的。

---

## 三种状态

Promise 是一个状态机，有三种状态：

1. **pending（等待中）**：初始状态，异步操作还没完成。
2. **fulfilled（已完成）**：操作成功完成，\`resolve\` 被调用。
3. **rejected（已拒绝）**：操作失败，\`reject\` 被调用。

### 状态转换是单向不可逆的

这是 Promise 最重要的规则：**状态一旦从 pending 变成 fulfilled 或 rejected，就再也不会变了**。

\`\`\`javascript
const p = new Promise((resolve, reject) => {
  resolve('成功');
  reject('失败');  // 这一行无效，状态已经是 fulfilled，改不回去了
  resolve('再成功');  // 也无效
});
\`\`\`

这就像"承诺"——你答应了一件事，就不能反悔。这个"不可逆"的特性保证了异步结果的可靠性：拿到 Promise 的人可以确信，一旦它有了结果，就不会再变。

---

## then / catch / finally 的本质

\`then\`、\`catch\`、\`finally\` 做的事情其实一样：**注册回调函数**，并**返回一个新的 Promise**。

- \`then(onFulfilled, onRejected)\`：注册成功和失败的回调。
- \`catch(onRejected)\`：是 \`then(null, onRejected)\` 的语法糖。
- \`finally(fn)\`：无论成功失败都执行，且不改变传递的值。

**链式调用**之所以能工作，就是因为 \`then\` 返回了一个新的 Promise。下一个 \`then\` 等的是这个新 Promise 的结果。

### then 返回新 Promise 的规则

\`then\` 的回调里可以 \`return\` 一个值，这个值决定了 \`then\` 返回的新 Promise 的状态：

1. **返回普通值**（数字、字符串、对象等）：新 Promise 状态为 \`fulfilled\`，值就是返回值。
2. **返回另一个 Promise**：新 Promise 的状态和值**跟随**返回的那个 Promise。
3. **抛出错误**（\`throw\` 或代码报错）：新 Promise 状态为 \`rejected\`，值是错误对象。
4. **什么都不返回**：新 Promise 状态为 \`fulfilled\`，值为 \`undefined\`。

\`\`\`javascript
Promise.resolve(1)
  .then(v => v + 1)              // 返回 2，新 Promise fulfilled(2)
  .then(v => Promise.resolve(v * 10))  // 返回另一个 Promise，跟随它 → fulfilled(20)
  .then(v => { throw new Error('炸了') })  // 抛错，新 Promise rejected
  .catch(e => '恢复')            // catch 返回普通值，新 Promise fulfilled('恢复')
  .then(v => console.log(v));    // 输出 '恢复'
\`\`\`

理解这套规则，你就能解释"为什么我的 then 拿不到值"——多半是上一步返回了一个 Promise 而你以为是普通值，或者上一步抛了错而你没 catch。

---

## Promise 的微任务特性

\`then\` 的回调**不是同步执行**的，而是被放进**微任务队列**，在当前同步代码和 nextTick 清空后才执行。

\`\`\`javascript
console.log('1. 同步');
Promise.resolve().then(() => console.log('3. 微任务'));
console.log('2. 同步');
// 输出顺序：1 → 2 → 3
\`\`\`

这一点至关重要：**then 回调永远是异步的**，哪怕 Promise 已经是 fulfilled 状态。这是为了保证"一致性"——不管 Promise 是同步 resolve 还是异步 resolve，then 回调的执行时机都一样，不会有时同步有时异步让人抓狂。

---

## 外卖订单类比

把 Promise 想象成**外卖订单**：

- **pending**：下单后骑手还没送到——订单"等待中"。
- **fulfilled**：骑手送达——订单"已完成"，你能拿到外卖（值）。
- **rejected**：骑手说送不到（餐厅关门、地址错误）——订单"已拒绝"，你能拿到失败原因（错误）。
- **不可逆**：订单一旦显示"已送达"，就不会再变成"配送中"或"已取消"。
- **then**：你在订单上备注"送达后打电话给我"——这个备注不会**立刻**执行，而是等状态变成 fulfilled 后，由系统（微任务队列）在合适的时候触发。
- **链式调用**：你备注"送达后打电话给我，打完电话后发短信给我"——第二个动作依赖第一个动作的结果，\`then\` 链把这种依赖串起来。
- **catch**：你备注"如果送不到，给我退款"——只在 rejected 时触发。

---

## Promise.all 和 Promise.race

这两个是处理"多个 Promise 并发"的利器：

- **Promise.all([p1, p2, p3])**：所有都成功才成功，返回值数组；**任意一个失败就立刻失败**。适合"必须全部完成"的场景（如并行加载多个资源）。
- **Promise.race([p1, p2, p3])**：返回第一个完成的 Promise（无论成功失败）。适合"超时控制"——把业务 Promise 和一个定时器 Promise 赛跑，定时器先完成就当作超时。

---

## 日常开发启示

1. **理解 then 链的值传递**：then 返回普通值→下一个 then 拿到该值；返回 Promise→下一个 then 等待它；抛错→跳到 catch。这是排查"then 拿不到值"的核心。
2. **Promise.resolve() / Promise.reject()** 是快捷用法：当你需要"把一个值包装成 Promise"或"快速创建一个失败的 Promise"时用它们，不用每次都 new Promise。
3. **Promise.all 用于并发**：比如同时请求 3 个接口，等全部返回再渲染——比串行 await 快得多。
4. **永远记得 catch**：未捕获的 Promise rejection 在新版 Node.js 里会让进程崩溃。
5. **then 回调是微任务**：这意味着它会在同步代码之后、setTimeout 之前执行——遇到顺序问题记得这一点。

下一章我们会手写一个简化版 Promise，把状态机和微任务调度的原理彻底看透。
`,
    code: `// ============================================
// Promise 原理演示：状态机 + 微任务 + 链式调用
// ============================================

console.log('=== 1. 手写简化版 Promise（展示状态机原理）===');

class MyPromise {
  // 三种状态
  static PENDING = 'pending';
  static FULFILLED = 'fulfilled';
  static REJECTED = 'rejected';

  constructor(executor) {
    this.state = MyPromise.PENDING;  // 初始状态
    this.value = undefined;          // 成功的值
    this.reason = undefined;         // 失败的原因
    this.onFulfilledCallbacks = [];  // 成功回调队列（pending 时注册的）
    this.onRejectedCallbacks = [];   // 失败回调队列

    // resolve：把状态从 pending → fulfilled
    const resolve = (value) => {
      if (this.state !== MyPromise.PENDING) return;  // 状态不可逆！
      this.state = MyPromise.FULFILLED;
      this.value = value;
      // 清空成功回调队列（用微任务执行，模拟原生 then 的异步性）
      this.onFulfilledCallbacks.forEach(fn => fn());
    };

    // reject：把状态从 pending → rejected
    const reject = (reason) => {
      if (this.state !== MyPromise.PENDING) return;  // 状态不可逆！
      this.state = MyPromise.REJECTED;
      this.reason = reason;
      this.onRejectedCallbacks.forEach(fn => fn());
    };

    try {
      executor(resolve, reject);  // 立即执行 executor
    } catch (e) {
      reject(e);  // executor 抛错自动 reject
    }
  }

  then(onFulfilled, onRejected) {
    // 返回新的 Promise，这是链式调用的关键
    const promise2 = new MyPromise((resolve, reject) => {
      const handleFulfilled = () => {
        // 用 queueMicrotask 模拟 then 回调的微任务特性
        queueMicrotask(() => {
          try {
            if (typeof onFulfilled !== 'function') {
              resolve(this.value);  // 值穿透
            } else {
              const x = onFulfilled(this.value);
              // 如果返回的是 Promise，跟随它
              if (x instanceof MyPromise) {
                x.then(resolve, reject);
              } else {
                resolve(x);  // 返回普通值，新 Promise fulfilled
              }
            }
          } catch (e) {
            reject(e);  // 回调抛错，新 Promise rejected
          }
        });
      };

      const handleRejected = () => {
        queueMicrotask(() => {
          try {
            if (typeof onRejected !== 'function') {
              reject(this.reason);
            } else {
              const x = onRejected(this.reason);
              if (x instanceof MyPromise) {
                x.then(resolve, reject);
              } else {
                resolve(x);
              }
            }
          } catch (e) {
            reject(e);
          }
        });
      };

      // 根据当前状态决定怎么处理
      if (this.state === MyPromise.FULFILLED) {
        handleFulfilled();
      } else if (this.state === MyPromise.REJECTED) {
        handleRejected();
      } else {
        // pending 状态：先存起来，等 resolve/reject 时再调
        this.onFulfilledCallbacks.push(handleFulfilled);
        this.onRejectedCallbacks.push(handleRejected);
      }
    });

    return promise2;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }
}

// 测试手写 Promise
const p1 = new MyPromise((resolve) => {
  setTimeout(() => resolve('异步结果'), 100);
});
p1.then(v => {
  console.log('  手写 Promise 成功：', v);
  return v + '，再加工一下';
}).then(v => {
  console.log('  链式调用第二步：', v);
});

// ---------- 2. then 链式调用的值传递 ----------
setTimeout(() => {
  console.log('');
  console.log('=== 2. then 链的值传递规则 ===');

  // 规则1：返回普通值 → 下一个 then 拿到该值
  Promise.resolve(1)
    .then(v => { console.log('  规则1 返回普通值:', v + 1); return v + 1; })
    // 规则2：返回另一个 Promise → 下一个 then 等待它
    .then(v => {
      console.log('  规则2 收到:', v, '，返回一个新 Promise');
      return new Promise(r => setTimeout(() => r(v * 10), 50));
    })
    // 规则3：抛出错误 → 跳到 catch
    .then(v => { console.log('  规则3 收到:', v); throw new Error('故意抛错'); })
    // catch 后再 then，状态恢复成 fulfilled
    .catch(e => { console.log('  catch 捕获:', e.message); return '恢复了'; })
    .then(v => console.log('  catch 之后的 then:', v));
}, 200);

// ---------- 3. Promise.all 与 Promise.race ----------
setTimeout(() => {
  console.log('');
  console.log('=== 3. Promise.all（全部成功才成功）===');

  const makeTask = (name, delay) => new Promise(resolve => {
    setTimeout(() => {
      console.log('  [' + name + '] 完成');
      resolve(name + '的结果');
    }, delay);
  });

  Promise.all([makeTask('A', 30), makeTask('B', 60), makeTask('C', 90)])
    .then(results => {
      console.log('  Promise.all 全部完成：', results);
    });
}, 700);

setTimeout(() => {
  console.log('');
  console.log('=== 4. Promise.race（第一个完成即返回）===');

  // 用 race 实现超时控制
  const task = new Promise(resolve => {
    setTimeout(() => resolve('任务完成'), 100);  // 慢任务
  });
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('超时')), 50);  // 50ms 超时
  });

  Promise.race([task, timeout])
    .then(v => console.log('  race 结果：', v))
    .catch(e => console.log('  race 结果：', e.message));
}, 1000);

// ---------- 5. 微任务特性 ----------
setTimeout(() => {
  console.log('');
  console.log('=== 5. Promise 微任务特性（对比同步执行）===');
  console.log('  1. [同步]');

  Promise.resolve().then(() => {
    console.log('  3. [微任务] Promise.then（同步代码全部跑完才执行）');
  });

  console.log('  2. [同步]');
  // 输出顺序：1 → 2 → 3，证明 then 回调是异步的微任务
}, 1200);
`
  }
];
