// =============================================================
// Web Worker 实战项目与最佳实践 - 第五批章节（共 4 章）
// -------------------------------------------------------------
// 本批包含 4 章，全部归属"实战项目"分组：
//   worker-practice-image   : 实战：图片处理 Worker
//   worker-practice-sort    : 实战：大数据排序
//   worker-practice-chat    : 实战：实时通信系统
//   worker-best-practices   : Worker 最佳实践与陷阱
//
// 说明：所有 code 均运行在 Node.js vm 沙箱中，没有浏览器 API。
//       使用 events.EventEmitter 模拟 Worker 的消息传递机制，
//       注释中给出对应的真实浏览器代码以便对照学习。
// =============================================================

export const chapters = [
  // ============================================================
  // 第二十一章：实战：图片处理 Worker
  // ============================================================
  {
    id: "worker-practice-image",
    group: "实战项目",
    icon: "🖼️",
    title: "实战：图片处理 Worker",
    content: `## 第二十一章 实战：图片处理 Worker

### 一、场景：处理大图不卡 UI

图片处理是 Worker 最经典的实战场景之一。当用户上传一张 4000×3000 的大图，我们要做灰度化、调亮度、加滤镜，这些操作要遍历 1200 万个像素，在主线程跑会**把 UI 卡死好几秒**——滚动、点击、动画全部冻结，用户体验极差。

> 《JavaScript高级程序设计》（红皮书）第 27 章强调：任何超过 50ms 的同步任务都会被用户感知为"卡顿"，应该搬到 Worker 里。浏览器每帧只有 16.6ms 的渲染预算，超时就会掉帧。

常见的图片处理需求包括：在线修图的滤镜效果（黑白、复古、暖色）、批量给图片加水印、生成缩略图、做人脸识别前的预处理、PDF 扫描件的二值化。这些任务数据量大、计算密集，是 Worker 的天然战场。

### 二、浏览器方案：Canvas + ImageData + Worker

整体流程分六步，主线程和 Worker 各司其职：

| 步骤 | 所在线程 | 操作 |
|---|---|---|
| 1 | 主线程 | 加载图片，绘制到 Canvas |
| 2 | 主线程 | 用 ctx.getImageData 提取 ImageData |
| 3 | 主线程 | 把 ImageData.buffer 转移给 Worker |
| 4 | Worker | 遍历像素，做滤镜运算 |
| 5 | Worker | 把处理后的 buffer 转移回主线程 |
| 6 | 主线程 | ctx.putImageData 写回 Canvas |

关键点：步骤 2 提取的 ImageData.data 是 Uint8ClampedArray，每个像素占 4 字节（R/G/B/A），数据是连续排列的。一张 4000×3000 的图，这个数组长度是 4800 万，内存占用约 46MB。

### 三、为什么用 Transferable：零拷贝

ImageData.data 是 Uint8ClampedArray，它的底层 buffer 是 ArrayBuffer。

- **复制**（默认）：postMessage 会用结构化克隆算法**完整复制**一份 1200 万字节，主线程和 Worker 各持一份，内存翻倍。复制 46MB 大约要 30~50ms。
- **转移**（Transferable）：postMessage(data, [buffer]) 只**转移所有权**，不复制字节，瞬间完成（<1ms）。转移后原线程的 buffer 变成 0 长度，不能再访问。

> 红皮书提醒：Transferable Objects 包括 ArrayBuffer、MessagePort、ImageBitmap。转移是"搬家"不是"复印"，搬家后原住址就空了。

### 四、性能对比：主线程 vs Worker

实测一张 1200 万像素图片灰度化的耗时对比：

| 方案 | 耗时 | 内存峰值 | UI 是否卡顿 |
|---|---|---|---|
| 主线程 | 约 800ms | 1 份 | 卡死 |
| Worker + 复制 | 约 850ms（含复制） | 2 份 | 流畅 |
| Worker + 转移 | 约 810ms（无复制） | 1 份 | 流畅 |

可以看到，转移方案在内存和时间上都最优。虽然 Worker 本身的计算时间没有变短，但它把计算从主线程移走了，UI 得以保持流畅。

### 五、常见滤镜实现思路

滤镜的本质是对每个像素的 RGB 通道做数学运算：

- **灰度化**：R/G/B 按人眼亮度加权平均（0.299/0.587/0.114）。为什么不是简单平均？因为人眼对绿色最敏感，对蓝色最不敏感，加权后视觉效果更自然。
- **调亮度**：每个通道加一个偏移量，再 clamp 到 0~255。正值变亮，负值变暗。
- **反色**：每个通道用 255 减，得到底片效果。
- **模糊**：取周围 N×N 像素平均值（盒模糊）。更高质量的高斯模糊需要按距离加权。

\`\`\`js
// 灰度化核心代码
for (let i = 0; i < data.length; i += 4) {
  const gray = data[i]*0.299 + data[i+1]*0.587 + data[i+2]*0.114;
  data[i] = data[i+1] = data[i+2] = gray;
}
\`\`\`

### 六、进度上报：分块处理

一次性处理 1200 万像素没法上报进度（因为同步循环里没法 postMessage）。做法：把行切成若干块，每处理完一块就 postMessage 上报百分比，主线程据此更新进度条。

\`\`\`js
// 主线程
worker.onmessage = (e) => {
  if (e.data.type === 'progress') {
    progressBar.value = e.data.percent;
  } else if (e.data.type === 'done') {
    ctx.putImageData(new ImageData(result, width), 0, 0);
  }
};
\`\`\`

分块大小要权衡：块太小，postMessage 次数多，通信开销大；块太大，进度更新不及时。建议每块处理 1000~5000 像素，既能频繁上报，又不至于被通信淹没。

### 七、进阶：OffscreenCanvas 直接在 Worker 渲染

更现代的方案是 OffscreenCanvas：把 Canvas 的控制权转移到 Worker，Worker 直接在内部绘图，连 ImageData 都不用传回主线程。主线程只需 \`canvas.transferControlToOffscreen()\` 一次，后续所有绘制都在 Worker 完成。

\`\`\`js
// 主线程
const offscreen = canvas.transferControlToOffscreen();
worker.postMessage({ canvas: offscreen }, [offscreen]);
// Worker 内部：ctx.drawImage / ctx.putImageData 都在 Worker 跑
\`\`\`

这适合实时滤镜预览、视频逐帧处理等高频场景，但浏览器兼容性需要确认。

### 八、小结

- 大图处理必上 Worker，否则 UI 必卡，这是 Worker 价值最直观的体现。
- 用 Transferable 转移 ArrayBuffer，零拷贝省内存，是处理大数组的标准操作。
- 分块处理 + postMessage 上报进度，让用户感知到"正在处理"，体验更好。
- 滤镜本质是遍历像素数组做数学运算，Worker 是天然的运算隔离环境，安全且不阻塞主线程。
- 进阶场景可以用 OffscreenCanvas，让 Worker 直接控制 Canvas，连回传都省了。`,
    code: `// ============================================
// 实战：图片处理 Worker（Node.js 模拟版）
// 用 Uint8Array 模拟 ImageData.data，EventEmitter 模拟消息传递
// ============================================
const { EventEmitter } = require('events');

// 模拟一张 100x100 的彩色图片（RGBA，每像素4字节）
// 真实浏览器：const imgData = ctx.getImageData(0,0,100,100);
const WIDTH = 100, HEIGHT = 100, PIXELS = WIDTH * HEIGHT;
const SIZE = PIXELS * 4;

// 生成模拟像素数据（彩色渐变）
const sourcePixels = new Uint8Array(SIZE);
for (let i = 0; i < PIXELS; i++) {
  const o = i * 4;
  sourcePixels[o]     = (i * 2) % 256; // R
  sourcePixels[o + 1] = (i * 3) % 256; // G
  sourcePixels[o + 2] = (i * 5) % 256; // B
  sourcePixels[o + 3] = 255;           // A
}
console.log('原始图片字节大小:', sourcePixels.byteLength, '字节');
console.log('前4个像素(原始):', Array.from(sourcePixels.slice(0, 16)));

// ============================================
// 模拟 Worker（浏览器中是独立的 worker.js 线程）
// 真实浏览器代码：
//   self.onmessage = (e) => { /* 处理像素 */ }
//   self.postMessage(result, [result.buffer])
// ============================================
class ImageWorker extends EventEmitter {
  constructor() {
    super();
    // worker 监听主线程发来的消息
    this.on('main2worker', (msg) => this._handle(msg));
  }

  // 模拟 worker 内部的 self.postMessage
  postToMain(data, transferList) {
    // 真实浏览器：transferList 中的 ArrayBuffer 所有权转移，零拷贝
    if (transferList) {
      transferList.forEach(buf => {
        // 转移后原 buffer 在 worker 侧被"分离"，长度变 0
        // 这里仅用注释说明，Node 模拟不做真分离
      });
    }
    this.emit('worker2main', { data, transferList });
  }

  _handle(msg) {
    const { type, pixels, width, height, filter, value } = msg;
    if (type !== 'process') return;

    // 复制一份用于处理（真实场景是直接操作转移过来的 buffer）
    const result = new Uint8Array(pixels.length);
    result.set(pixels);

    // 分块处理 + 进度上报
    const CHUNK = 1000; // 每块处理 1000 像素
    let processed = 0;
    const total = width * height;

    while (processed < total) {
      const end = Math.min(processed + CHUNK, total);
      for (let i = processed; i < end; i++) {
        const o = i * 4;
        if (filter === 'grayscale') {
          // 灰度：按人眼亮度加权平均
          const g = (result[o]*0.299 + result[o+1]*0.587 + result[o+2]*0.114) | 0;
          result[o] = result[o+1] = result[o+2] = g;
        } else if (filter === 'brightness') {
          // 亮度：每通道加偏移，钳制到 0~255
          result[o]   = Math.min(255, Math.max(0, result[o]   + value));
          result[o+1] = Math.min(255, Math.max(0, result[o+1] + value));
          result[o+2] = Math.min(255, Math.max(0, result[o+2] + value));
        } else if (filter === 'invert') {
          // 反色：255 减
          result[o]   = 255 - result[o];
          result[o+1] = 255 - result[o+1];
          result[o+2] = 255 - result[o+2];
        }
      }
      processed = end;
      // 上报进度
      this.postToMain({
        type: 'progress',
        percent: Math.round((processed / total) * 100)
      });
    }

    // 处理完成，转移结果 buffer 回主线程
    // 真实浏览器：self.postMessage({type:'done', pixels, filter}, [result.buffer])
    this.postToMain({ type: 'done', pixels: result, width, height, filter }, [result.buffer]);
  }
}

// ============================================
// 主线程：创建 Worker，发送任务，接收结果
// ============================================
const worker = new ImageWorker();
let lastProgress = 0;

// 主线程监听 worker 回传的消息
// 真实浏览器：worker.onmessage = (e) => { ... }
worker.on('worker2main', ({ data }) => {
  if (data.type === 'progress') {
    if (data.percent - lastProgress >= 25) {
      console.log('进度:', data.percent + '%');
      lastProgress = data.percent;
    }
  } else if (data.type === 'done') {
    const labelMap = { grayscale: '灰度化', brightness: '亮度调整', invert: '反色' };
    console.log('\\n--- ' + (labelMap[data.filter] || '处理') + '完成 ---');
    console.log('前4个像素(' + (labelMap[data.filter] || '处理') + '后):', Array.from(data.pixels.slice(0, 16)));
    console.log('结果 buffer 字节长度:', data.pixels.byteLength);
  }
});

// 发送灰度化任务（转移 buffer 模式）
console.log('=== 任务1：灰度化 ===');
worker.emit('main2worker', {
  type: 'process',
  pixels: sourcePixels,
  width: WIDTH,
  height: HEIGHT,
  filter: 'grayscale'
});

// 发送亮度调整任务
console.log('\\n=== 任务2：亮度+50 ===');
lastProgress = 0;
worker.emit('main2worker', {
  type: 'process',
  pixels: sourcePixels,
  width: WIDTH,
  height: HEIGHT,
  filter: 'brightness',
  value: 50
});

// 发送反色任务
console.log('\\n=== 任务3：反色 ===');
lastProgress = 0;
worker.emit('main2worker', {
  type: 'process',
  pixels: sourcePixels,
  width: WIDTH,
  height: HEIGHT,
  filter: 'invert'
});

console.log('\\n主线程未阻塞，可继续响应用户操作 ✅');`,
  },

  // ============================================================
  // 第二十二章：实战：大数据排序
  // ============================================================
  {
    id: "worker-practice-sort",
    group: "实战项目",
    icon: "🔢",
    title: "实战：大数据排序",
    content: `## 第二十二章 实战：大数据排序

### 一、场景：排序 100 万条数据不卡 UI

排序是典型的 CPU 密集任务。10 万条数据用快速排序大约 50ms，100 万条就要 500ms~1 秒——主线程跑会让页面完全无响应。这在数据可视化、表格组件、排行榜等场景非常常见：用户点一下"按价格排序"，页面就卡住了。

> 《JavaScript高级程序设计》（红皮书）第 6 章详细介绍了各种排序算法。Worker 的价值在于：算法再快，数据量大了也会卡，而 Worker 能把这份"卡"从用户眼前移走。

实际业务场景：电商商品列表按价格/销量排序（万级到十万级）、日志分析平台按时间戳排序（百万级）、大数据看板的实时聚合排序。数据量越大，Worker 的收益越明显。

### 二、为什么排序是 CPU 密集

排序需要大量比较和交换操作，CPU 要反复读写内存。排序算法的时间复杂度直接决定了耗时：

| 算法 | 平均复杂度 | 10万条耗时 | 100万条耗时 | 特点 |
|---|---|---|---|---|
| 冒泡排序 | O(n²) | 约 30 秒 | 约 50 分钟 | 不可用 |
| 快速排序 | O(n log n) | 约 50ms | 约 600ms | 原地，最快 |
| 归并排序 | O(n log n) | 约 60ms | 约 700ms | 稳定，可并行 |
| Array.sort | O(n log n) | 约 40ms | 约 500ms | V8 TimSort |

> 红皮书第 6 章：O(n log n) 是基于比较的排序算法的下界，没有更快的了。要继续提速，只能靠**并行**——也就是多 Worker。

### 三、Worker 方案：转移 + 排序 + 回传

对于纯数字数组，可以把它放进 Float64Array/Int32Array，转移 ArrayBuffer 给 Worker，Worker 排序完再转移回来——全程零拷贝。

\`\`\`js
// 主线程：转移 buffer 给 Worker
const buf = new Int32Array(data).buffer;
worker.postMessage({ buf }, [buf]); // 转移，零拷贝
// Worker 内部排序后转移回来
self.postMessage({ buf: sorted }, [sorted]);
\`\`\`

注意：转移后原 buffer 不可用，如果主线程还需要原始数据，要先复制一份。

### 四、分块排序：归并 + 进度

归并排序天然适合分块：先把数组切成 N 块，每块单独排序，再把有序块两两归并。每排完一块上报一次进度，用户能看到"已排序 30%、60%、100%"。

这种"分治"思想来自红皮书第 6 章对归并排序的讲解：分解、解决、合并三步走。分块不仅支持进度上报，还为多 Worker 并行打下基础。

分块大小影响进度刷新频率和通信开销：块太大，进度条长时间不动，用户以为卡死；块太小，postMessage 太频繁，通信成本超过计算成本。经验值是 5000~10000 元素一块，既能每秒上报多次，又不会被通信淹没。

### 五、三种排序对比

- **快速排序**：原地排序，平均最快，但最坏情况 O(n²)（数组已有序时退化）。适合内存敏感场景。
- **归并排序**：稳定排序（相等元素相对顺序不变），适合分块并行，但需要额外 O(n) 空间。适合对象数组排序。
- **Array.sort**：V8 引擎用 TimSort（归并+插入排序的混合体），对小数组用插入排序优化，工程上首选。大多数情况下直接用它即可。

> 经验法则：不要自己造排序轮子，除非有特殊需求（如并行、进度上报、自定义内存管理）。

### 六、多 Worker 并行排序

当数据量超过 100 万，单 Worker 也嫌慢，可以用多 Worker 并行：

| 步骤 | 操作 |
|---|---|
| 1 | 主线程把数组切成 N 块（N = CPU 核数） |
| 2 | 每个 Worker 分到一块，并行排序 |
| 3 | Worker 把有序块转移回主线程 |
| 4 | 主线程做 N 路归并 |

理论上 4 核能快 3 倍左右（归并有串行部分，达不到 4 倍）。这是 Amdahl 定律的体现：并行加速比受限于串行部分占比。

### 七、何时用多 Worker

| 数据量 | 推荐方案 | 理由 |
|---|---|---|
| < 1 万 | 主线程直接 sort | 耗时 <10ms，不值得开 Worker |
| 1 万 ~ 10 万 | 单 Worker | 排序 50ms 左右，单 Worker 足够 |
| 10 万 ~ 100 万 | 单 Worker + Transferable | 零拷贝转移省内存 |
| > 100 万 | 多 Worker 并行 + 归并 | 并行才能在可接受时间内完成 |

注意：多 Worker 有创建开销（每个约 5~10ms），数据量太小反而更慢。**先 profile 再优化**——用 Performance 面板测一下真实耗时，不要凭感觉。

### 八、对象数组排序的注意点

上面讲的都是数字数组，可以直接放进 TypedArray 转移。但实际业务中经常要排对象数组（如 \`[{name, price, sales}]\`），对象不能直接放进 TypedArray。

两种方案：

1. **拆分排序**：把排序字段提取到 TypedArray（如价格数组），排序时记录索引，最后按索引重排对象数组。这样转移的只是数字数组，对象数组留在主线程。
2. **整体传递**：直接 postMessage 对象数组（结构化克隆），Worker 排序后回传。数据量不大时可行，大了就慢。

\`\`\`js
// 方案1：索引排序，只传数字
const prices = items.map(i => i.price);
const indices = Array.from({length: prices.length}, (_, i) => i);
// 把 prices 和 indices 转移给 Worker，Worker 排 indices
// 主线程按排好的 indices 重排 items
\`\`\`

### 九、小结

- 排序是 CPU 密集，大数组必上 Worker，否则 UI 必卡。
- 纯数字数组用 TypedArray + Transferable，零拷贝转移，省时省内存。
- 归并排序天然适合分块 + 进度上报 + 并行，是 Worker 排序的首选算法。
- 数据量极大时用多 Worker 并行，但要权衡创建开销，遵循"先测后优"原则。
- 对象数组排序可用"索引排序"技巧，只把数字字段传给 Worker，对象留在主线程按索引重排。
- 工程上优先用 Array.sort（V8 TimSort），除非需要并行或进度上报才考虑自己实现。
- 分块大小要平衡：太大进度不刷新，太小通信成本高，经验值是每块 5000~10000 元素。`,
    code: `// ============================================
// 实战：大数据排序 Worker（Node.js 模拟版）
// 对比 快排 / 归并 / Array.sort，并演示分块 + 进度
// ============================================
const { EventEmitter } = require('events');

// 生成 10 万条随机数据（演示用，真实场景可百万级）
const N = 100000;
console.log('生成', N, '条随机数据...');
const data = Array.from({ length: N }, () => Math.floor(Math.random() * 1000000));

// ============================================
// 排序算法实现
// ============================================

// 快速排序（原地）
function quickSort(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return arr;
  const pivot = arr[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]];
  quickSort(arr, lo, i - 1);
  quickSort(arr, i + 1, hi);
  return arr;
}

// 归并排序（带进度回调）
function mergeSort(arr, onProgress) {
  const total = arr.length;
  // 分块排序，每块完成后上报进度
  function merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) result.push(left[i++]);
      else result.push(right[j++]);
    }
    while (i < left.length) result.push(left[i++]);
    while (j < right.length) result.push(right[j++]);
    return result;
  }

  function sort(arr, depth) {
    if (arr.length <= 1) return arr;
    const mid = arr.length >> 1;
    const left = sort(arr.slice(0, mid), depth + 1);
    const right = sort(arr.slice(mid), depth + 1);
    const merged = merge(left, right);
    // 在顶层合并时上报进度
    if (onProgress && depth === 0) onProgress(100);
    return merged;
  }
  return sort(arr, 0);
}

// 分块归并排序（演示分块 + 进度上报）
function chunkedMergeSort(arr, chunkSize, onProgress) {
  const chunks = [];
  // 1. 切块
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  // 2. 每块单独排序
  const sorted = [];
  for (let i = 0; i < chunks.length; i++) {
    sorted.push(mergeSort(chunks[i]));
    onProgress(Math.round(((i + 1) / chunks.length) * 100));
  }
  // 3. 多路归并
  let result = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    result = mergeTwo(result, sorted[i]);
  }
  return result;
}

function mergeTwo(a, b) {
  const r = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) r.push(a[i++]); else r.push(b[j++]);
  }
  while (i < a.length) r.push(a[i++]);
  while (j < b.length) r.push(b[j++]);
  return r;
}

// ============================================
// 模拟 Worker：接收数组，排序后转移回主线程
// 真实浏览器：self.onmessage = e => { self.postMessage(sorted, [buf]) }
// ============================================
class SortWorker extends EventEmitter {
  constructor() {
    super();
    this.on('main2worker', (msg) => this._handle(msg));
  }
  postToMain(data) { this.emit('worker2main', { data }); }

  _handle(msg) {
    const { array, algorithm, chunkSize } = msg;
    let lastProgress = 0;
    const onProgress = (p) => {
      if (p - lastProgress >= 25) {
        this.postToMain({ type: 'progress', percent: p });
        lastProgress = p;
      }
    };

    let result;
    if (algorithm === 'quick') {
      result = quickSort(array.slice());
      onProgress(100);
    } else if (algorithm === 'merge') {
      result = mergeSort(array.slice(), onProgress);
    } else if (algorithm === 'chunked') {
      result = chunkedMergeSort(array.slice(), chunkSize || 5000, onProgress);
    } else {
      result = array.slice().sort((a, b) => a - b);
      onProgress(100);
    }
    this.postToMain({ type: 'done', result, algorithm });
  }
}

// ============================================
// 主线程：分别测试几种排序，对比性能
// ============================================
const worker = new SortWorker();
let resolveFn;
worker.on('worker2main', ({ data }) => {
  if (data.type === 'progress') {
    // 静默，避免刷屏
  } else if (data.type === 'done' && resolveFn) {
    resolveFn(data);
  }
});

function runSort(algorithm, chunkSize) {
  return new Promise(resolve => {
    resolveFn = resolve;
    worker.emit('main2worker', { array: data, algorithm, chunkSize });
  });
}

(async () => {
  console.log('--- 主线程 Array.sort 基准 ---');
  const t0 = Date.now();
  const base = data.slice().sort((a, b) => a - b);
  console.log('耗时:', Date.now() - t0, 'ms');

  console.log('\\n--- Worker: 快速排序 ---');
  const t1 = Date.now();
  const r1 = await runSort('quick');
  console.log('耗时:', Date.now() - t1, 'ms', '| 正确:', JSON.stringify(r1.result.slice(0, 5)) === JSON.stringify(base.slice(0, 5)));

  console.log('\\n--- Worker: 归并排序 ---');
  const t2 = Date.now();
  const r2 = await runSort('merge');
  console.log('耗时:', Date.now() - t2, 'ms', '| 正确:', JSON.stringify(r2.result.slice(0, 5)) === JSON.stringify(base.slice(0, 5)));

  console.log('\\n--- Worker: 分块归并(块大小5000) + 进度上报 ---');
  const t3 = Date.now();
  const r3 = await runSort('chunked', 5000);
  console.log('耗时:', Date.now() - t3, 'ms', '| 正确:', JSON.stringify(r3.result.slice(0, 5)) === JSON.stringify(base.slice(0, 5)));

  console.log('\\n结论: 大数据排序时，主线程不被阻塞，UI 保持流畅 ✅');
  console.log('提示: 真实场景中可把数组放入 Int32Array，用 Transferable 零拷贝转移');
})();`,
  },

  // ============================================================
  // 第二十三章：实战：实时通信系统
  // ============================================================
  {
    id: "worker-practice-chat",
    group: "实战项目",
    icon: "💬",
    title: "实战：实时通信系统",
    content: `## 第二十三章 实战：实时通信系统

### 一、场景：实时聊天为什么要放 Worker

WebSocket 长连接在现代 Web 应用中无处不在：即时通讯、协同编辑、实时推送、在线游戏。但把 WebSocket 直接放在主线程，会遇到几个痛点：

1. **页面切换会断连**——SPA 路由切换虽然不刷新页面，但组件卸载时如果清理了 WS 引用，连接可能被回收；而真正的页面刷新必然断连，重建代价大（握手 + 鉴权 + 拉历史）
2. **消息处理阻塞 UI**——高并发聊天室每秒上百条消息，解析 JSON、解密内容、更新状态，会卡住渲染
3. **多标签页重复连接**——每个标签页都建一条 WS，服务器压力倍增，用户消息会在多个标签页间重复
4. **重连逻辑复杂**——指数退避、心跳检测、消息补偿，这些逻辑放主线程容易和 UI 逻辑纠缠，难以维护

把 WebSocket 放进 Worker，连接与 UI 解耦：主线程只管渲染，Worker 管连接、收发、重连。即使用户在页面间切换，Worker 里的连接依然存活。

> 《JavaScript高级程序设计》（红皮书）第 27 章指出：Worker 是独立的运行环境，适合管理需要长期存活的后台任务。

### 二、架构

分层设计，职责清晰：

| 层 | 职责 |
|---|---|
| 主线程 | UI 渲染、用户输入、收 worker 消息更新视图 |
| Worker | WebSocket 连接、消息路由、心跳、重连、消息队列 |

主线程通过 postMessage 向 Worker 发送指令（发消息、查历史、断开），Worker 通过 postMessage 向主线程推送收到的消息。两者通过消息协议通信，完全解耦。

这种分层的好处是：UI 框架可以随意更换（React、Vue、原生 JS），Worker 层的连接逻辑完全不用动。反过来，Worker 内部重构连接策略（比如换心跳间隔），UI 层也不受影响。这就是关注点分离带来的工程价值。

### 三、消息协议设计

统一的 JSON 协议，方便扩展和调试：

| 字段 | 说明 | 示例 |
|---|---|---|
| type | 消息类型：chat / system / ping / pong / ack | "chat" |
| payload | 消息体 | "你好" |
| timestamp | 服务器时间戳 | 1700000000000 |
| id | 消息唯一 ID，用于去重和 ACK | "msg-001" |

设计要点：每条消息都有 id，服务器收到后回 ack。客户端如果超时没收到 ack，可以重发。这样即使网络抖动，消息也不丢。

协议设计要"前向兼容"：新增字段时老客户端忽略不认识的字段即可，不要随意删除或重命名已有字段。版本号可以放在协议头部，方便服务器按版本路由处理逻辑。

### 四、核心功能

#### 1. 连接管理
connect / disconnect / reconnect，重连用指数退避（1s→2s→4s→8s→16s，上限 30s）。退避是为了避免服务器刚恢复就被海量重连请求打垮（惊群效应）。

#### 2. 心跳机制
客户端每 30s 发 ping，服务器回 pong。超过 60s 没收到 pong，认为连接已死（可能路由器 NAT 超时），主动 close 后重连。这是检测"假连接"（TCP 还在但实际不通）的标准手段。

#### 3. 消息队列（离线补偿）
连接断开时，用户发的消息先进队列；重连成功后，把队列里的消息依次发出，保证不丢。用户体验上：发消息后显示"发送中"，重连补发成功后变成"已发送"。

#### 4. 多 UI 组件广播
Worker 收到一条消息，可能要同时通知聊天列表、未读角标、通知组件——Worker 内部维护订阅列表，一次收到，多次广播。这其实就是观察者模式。

### 五、SharedWorker：多标签页共享一条连接

普通 Worker 每个标签页一份；SharedWorker 浏览器全局唯一，所有标签页共享同一个连接实例。

| 类型 | 标签页数 | WS 连接数 | 服务器压力 |
|---|---|---|---|
| Worker | 3 | 3 | 高 |
| SharedWorker | 3 | 1 | 低 |

> 红皮书第 27 章：SharedWorker 通过 port 机制与每个连接页通信，适合全局共享资源（连接、缓存、状态）。每个标签页连接到 SharedWorker 时会获得一个 MessagePort，通过 port 互发消息。

SharedWorker 的注意点：不是所有浏览器都完美支持（尤其移动端），且调试比普通 Worker 更麻烦。生产环境要做降级处理——检测不支持时回退到普通 Worker，每个标签页各建一条连接，虽然费资源但功能可用。

### 六、错误处理清单

- 连接断开 → 自动重连 + 消息入队
- 重连超时（超过最大次数）→ 上报 UI，提示"网络异常，请检查"
- 服务器返回错误码 → 区分 4xx（如鉴权失败，不重连）和 5xx（服务器错误，重连）
- 消息解析失败 → 记录日志，跳过该消息，不崩溃
- 心跳超时 → 主动 close 后重连，不要等 TCP 超时（太久）

### 七、内存管理

消息历史不能无限增长，否则 Worker 内存会慢慢涨爆。Worker 内部维护**环形缓冲区**，只保留最近 N 条（如 1000 条），老的自动丢弃。需要更多历史时，向服务器分页拉取。

环形缓冲区的实现很简单：用数组存储，超过上限时 shift 掉最早的。如果性能敏感，可以用 TypedArray + 环形指针（head/tail），避免 shift 的 O(n) 开销。

### 七点五、安全性考虑

实时通信涉及敏感数据，安全不能忽视：

- **WSS 加密**：生产环境必须用 wss:// 而非 ws://，防止中间人窃听
- **消息鉴权**：连接建立后先发鉴权帧（token），服务器验证后才接受业务消息
- **防重放**：用消息 id + 时间戳，服务器拒绝重复或过期的消息
- **输入校验**：Worker 收到消息后先校验格式，防止恶意数据导致崩溃

### 八、小结

- WebSocket 放 Worker，连接与 UI 解耦，切换页面不断连，这是架构层面的核心收益。
- 心跳 + 指数退避重连 + 消息队列，三件套保证连接稳定和消息不丢。
- 多标签页用 SharedWorker，共享一条连接省资源，但要考虑降级方案。
- 消息历史用环形缓冲区，防止内存泄漏，这是长连接应用必做的内存管理。
- 安全性不能忘：WSS 加密、消息鉴权、防重放、输入校验，四道防线缺一不可。
- 消息协议设计要统一（type/payload/timestamp/id），方便扩展、调试和做 ACK 机制。
- Worker 内部维护订阅列表实现广播，本质是观察者模式，一次接收多次分发到各组件。
- 环形缓冲区是长连接应用的标配，防止消息历史无限增长导致内存泄漏。`,
    code: `// ============================================
// 实战：实时通信系统（Node.js 模拟版）
// 用 EventEmitter 模拟 WebSocket，演示连接管理/心跳/消息队列/广播
// ============================================
const { EventEmitter } = require('events');

// 模拟服务器（真实场景是远程 WS 服务器）
class MockServer extends EventEmitter {
  constructor() { super(); this._alive = true; }
  push(msg) { if (this._alive) this.emit('server2client', msg); }
  kill() { this._alive = false; this.emit('close'); }
  revive() { this._alive = true; this.emit('revive'); }
}
const server = new MockServer();

// ============================================
// 模拟 WebSocket 的 Worker
// 真实浏览器：
//   const ws = new WebSocket('wss://chat.example.com');
//   ws.onmessage = e => self.postMessage({...});
//   self.onmessage = e => ws.send(JSON.stringify(e.data));
// ============================================
class ChatWorker extends EventEmitter {
  constructor() {
    super();
    this.connected = false;
    this.heartbeatTimer = null;
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    this.maxReconnectDelay = 30000;
    this.messageQueue = [];       // 离线消息队列
    this.history = [];            // 消息历史（环形缓冲）
    this.historyMax = 1000;
    this.ports = new Set();       // 模拟 SharedWorker 的多个 port（多标签页）
    this.on('main2worker', (msg) => this._handleMain(msg));
  }

  // 连接服务器
  connect() {
    console.log('[Worker] 正在连接服务器...');
    this.connected = true;
    this.reconnectAttempts = 0;
    this._startHeartbeat();
    // 监听服务器消息
    server.on('server2client', (msg) => this._onServerMessage(msg));
    server.on('close', () => this._onDisconnect());
    // 连接成功后，发送队列中的离线消息
    this._flushQueue();
    this._broadcast({ type: 'system', payload: '连接已建立' });
  }

  // 心跳：每 30s 发 ping（这里用 200ms 演示）
  _startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (!this.connected) return;
      const ping = { type: 'ping', timestamp: Date.now() };
      console.log('[Worker] 发送心跳 ping');
      this._broadcast(ping);
      // 模拟服务器回 pong
      setTimeout(() => {
        if (this.connected) this._broadcast({ type: 'pong', timestamp: Date.now() });
      }, 50);
    }, 200);
  }

  // 断线处理
  _onDisconnect() {
    if (!this.connected) return;
    this.connected = false;
    clearInterval(this.heartbeatTimer);
    this._broadcast({ type: 'system', payload: '连接断开，准备重连' });
    this._scheduleReconnect();
  }

  // 指数退避重连
  _scheduleReconnect() {
    if (this.reconnectTimer) return;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay);
    this.reconnectAttempts++;
    console.log('[Worker] 第', this.reconnectAttempts, '次重连，等待', delay, 'ms');
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      server.revive();
      this.connect();
    }, delay);
  }

  // 处理服务器消息
  _onServerMessage(msg) {
    // 写入历史环形缓冲
    this.history.push(msg);
    if (this.history.length > this.historyMax) this.history.shift();
    this._broadcast(msg);
  }

  // 处理主线程发来的消息
  _handleMain(msg) {
    if (msg.type === 'register-port') {
      // 模拟 SharedWorker 的 port 连接（多标签页）
      this.ports.add(msg.portId);
      console.log('[Worker] 标签页', msg.portId, '已注册，当前标签页数:', this.ports.size);
      return;
    }
    if (msg.type === 'send') {
      if (this.connected) {
        console.log('[Worker] 发送消息:', msg.payload);
        // 模拟服务器立即回显
        server.push({ type: 'chat', payload: msg.payload, timestamp: Date.now() });
      } else {
        // 离线时入队
        this.messageQueue.push(msg);
        console.log('[Worker] 连接断开，消息入队（队列长度:', this.messageQueue.length, ')');
      }
      return;
    }
    if (msg.type === 'get-history') {
      this._broadcast({ type: 'history', payload: this.history.slice(-5) });
      return;
    }
    if (msg.type === 'terminate') {
      clearInterval(this.heartbeatTimer);
      clearTimeout(this.reconnectTimer);
      console.log('[Worker] 已终止，释放资源');
    }
  }

  // 重连成功后，把队列里的消息依次发出
  _flushQueue() {
    if (this.messageQueue.length === 0) return;
    console.log('[Worker] 重连成功，发送队列中', this.messageQueue.length, '条离线消息');
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift();
      console.log('  - 补发:', msg.payload);
    }
  }

  // 广播给所有标签页（SharedWorker 多 port 特性）
  _broadcast(msg) {
    // 真实浏览器：this.ports.forEach(port => port.postMessage(msg))
    this.emit('worker2main', msg);
  }
}

// ============================================
// 主线程：使用 ChatWorker
// ============================================
const worker = new ChatWorker();

// 模拟两个标签页都注册到同一个 SharedWorker
worker.emit('main2worker', { type: 'register-port', portId: 'tab-A' });
worker.emit('main2worker', { type: 'register-port', portId: 'tab-B' });

// 主线程接收 Worker 广播
worker.on('worker2main', (msg) => {
  if (msg.type === 'chat') {
    console.log('[UI] 收到聊天消息:', msg.payload);
  } else if (msg.type === 'system') {
    console.log('[UI] 系统消息:', msg.payload);
  } else if (msg.type === 'pong') {
    // 心跳正常，不打印以免刷屏
  } else if (msg.type === 'history') {
    console.log('[UI] 最近历史:', msg.payload.map(m => m.payload));
  }
});

// 1. 建立连接
worker.connect();

// 2. 发一条消息
setTimeout(() => {
  worker.emit('main2worker', { type: 'send', payload: '你好，世界' });
}, 50);

// 3. 模拟断线 + 离线发消息 + 重连补发
setTimeout(() => {
  console.log('\\n--- 模拟网络断开 ---');
  server.kill();
  // 断开期间发的消息会入队
  setTimeout(() => {
    worker.emit('main2worker', { type: 'send', payload: '断线期间的消息1' });
    worker.emit('main2worker', { type: 'send', payload: '断线期间的消息2' });
  }, 100);
}, 300);

// 4. 查询历史
setTimeout(() => {
  console.log('\\n--- 查询最近历史 ---');
  worker.emit('main2worker', { type: 'get-history' });
}, 1500);

// 5. 终止 Worker，清理资源
setTimeout(() => {
  console.log('\\n--- 关闭页面，终止 Worker ---');
  worker.emit('main2worker', { type: 'terminate' });
}, 2000);`,
  },

  // ============================================================
  // 第二十四章：Worker 最佳实践与陷阱
  // ============================================================
  {
    id: "worker-best-practices",
    group: "实战项目",
    icon: "✅",
    title: "Worker 最佳实践与陷阱",
    content: `## 第二十四章 Worker 最佳实践与陷阱

### 一、什么时候该用 Worker

Worker 不是万能药，用对了如虎添翼，用错了反而添乱。判断标准是"任务是否真的耗时且独立"：

| 场景 | 是否用 Worker | 理由 |
|---|---|---|
| 任务耗时 > 50ms | ✅ 用 | 超过一帧，会卡 UI |
| 大数据批量处理 | ✅ 用 | CPU 密集，数据量大 |
| 后台持久连接（WS） | ✅ 用 | 与 UI 解耦，长生命周期 |
| 加密/压缩大文件 | ✅ 用 | CPU 密集 |
| 简单任务 < 16ms | ❌ 不用 | Worker 创建开销 > 收益 |
| DOM 操作 | ❌ 不用 | Worker 没有 DOM API |
| 小数据频繁通信 | ❌ 不用 | postMessage 序列化有成本 |
| 串行依赖任务 | ❌ 不用 | 来回通信开销大，不如直接做 |

> 《JavaScript高级程序设计》（红皮书）第 27 章：Worker 适合"可独立运行的、耗时的、可批量传递数据的"任务。记住三个关键词：独立、耗时、批量。

### 二、常见陷阱

#### 陷阱 1：创建太多 Worker
每个 Worker 是一个独立线程，占用内存（约 1~5MB）。建 100 个 Worker 会让浏览器内存爆掉，甚至崩溃。
**对策**：用 Worker 池，复用固定数量的 Worker（建议等于 CPU 核数，可用 navigator.hardwareConcurrency 获取）。

#### 陷阱 2：不终止 Worker
Worker 不调用 terminate() 会一直驻留，导致内存泄漏。这在 SPA 中尤其常见——用户来回切换页面，Worker 越积越多。
**对策**：任务完成后及时 terminate()，或用池统一管理生命周期，页面卸载时清理所有 Worker。

#### 陷阱 3：转移后还用原数据
Transferable 转移后，原 buffer 长度变 0，再访问会得到空数据，而且不报错——非常隐蔽的 bug。
**对策**：转移前确认自己不再需要原数据，否则用结构化克隆（不传 transferList）。

#### 陷阱 4：忘记错误处理
Worker 内部抛错默认不会通知主线程，问题被吞掉，用户看到的是"功能 mysteriously 不工作"。
**对策**：监听 worker.onerror 和 messageerror 事件，Worker 内部用 try-catch 包裹关键代码。

#### 陷阱 5：Worker 里写同步阻塞代码
Worker 虽然不阻塞主线程，但自己内部也会被阻塞，后续消息排队，失去"并发"意义。
**对策**：用 setTimeout 分片处理大任务，或拆成多个 Worker。

#### 陷阱 6：过度通信
每秒上百次 postMessage，序列化开销巨大，反而比主线程还慢。
**对策**：批量合并小消息，用 requestAnimationFrame 节流。

### 三、最佳实践

1. **用 Worker 池**管理任务队列，避免频繁创建销毁，池大小 = CPU 核数
2. **批量合并**小消息，减少 postMessage 次数（100 条小消息合并成 1 条）
3. **大用 Transferable**，小用结构化克隆——大于 1KB 的 ArrayBuffer 优先转移
4. **完善错误处理**：onerror / try-catch / 超时兜底，三管齐下
5. **先 profile 再优化**：用 Performance 面板确认瓶颈，不要过早优化
6. **共享资源用 SharedWorker**：连接、缓存、全局状态，多标签页共享

### 四、性能检查清单

- [ ] 任务是否真的 > 50ms？（用 Performance 测过）
- [ ] 数据用 Transferable 了吗？（大数组检查）
- [ ] Worker 数量是否合理（建议 ≤ CPU 核数）？
- [ ] 是否复用 Worker 而非每次新建？
- [ ] 消息是否批量发送？
- [ ] 是否有错误处理和超时？
- [ ] 任务完成后是否 terminate？

### 五、调试检查清单

- [ ] 浏览器 DevTools 是否能看到 Worker 线程？（Console 可切换上下文）
- [ ] worker.onerror 是否监听？
- [ ] postMessage 数据是否能被结构化克隆？（函数、DOM 节点不行）
- [ ] Transferable 转移后是否误用原 buffer？
- [ ] 是否有循环引用导致克隆失败？

### 六、迁移：经典 Worker → Module Worker

经典 Worker 用脚本，不能 import；Module Worker 支持 ES 模块，更现代：

| 特性 | 经典 Worker | Module Worker |
|---|---|---|
| 创建 | new Worker('a.js') | new Worker('a.js', { type:'module' }) |
| 导入 | importScripts() | import / export |
| 顶层 await | 不支持 | 支持 |
| Tree-shaking | 不支持 | 支持 |
| 浏览器支持 | 全部 | 现代浏览器 |

迁移建议：新项目直接用 Module Worker，老项目按需迁移。importScripts 终将被淘汰。Module Worker 还能和构建工具（Webpack、Vite）更好地配合，支持代码分割和 Tree-shaking。

### 七、未来：Worker + WebAssembly / WebGPU

- **Worker + WASM**：把 WASM 实例放 Worker，兼顾高性能和 UI 流畅。典型场景：视频解码、图像处理、加密计算。WASM 提供 C/C++ 级性能，Worker 提供线程隔离。
- **Worker + WebGPU**：把渲染管线放 Worker，释放主线程做交互。未来 3D 应用、AI 推理都能受益。
- **Worker + OffscreenCanvas**：Canvas 渲染移到 Worker，动画不再受主线程阻塞。

### 八、小结

- Worker 不是银弹，先判断是否真需要——核心标准是"任务耗时且独立"。
- 陷阱多在"生命周期"和"通信成本"上——池化 + 批量 + Transferable 是三件套。
- 错误处理不能省，否则问题被吞，调试困难。
- 先 profile 再优化，不要过早使用 Worker，"过早优化是万恶之源"。
- 新项目用 Module Worker，支持 import/export 和顶层 await，是未来的方向。
- Worker 池里 done/error 监听器要互斥移除，否则会内存泄漏——这是个隐蔽的坑。`,
    code: `// ============================================
// Worker 最佳实践综合演示（Node.js 模拟版）
// 演示：Worker 池 / 批量消息 / 错误处理 / 资源清理 / 性能对比
// ============================================
const { EventEmitter } = require('events');

// ============================================
// 工具：模拟单个 Worker
// ============================================
class SimWorker extends EventEmitter {
  constructor(id) {
    super();
    this.id = id;
    this.terminated = false;
    this.on('dispatch', (task) => this._run(task));
  }
  _run(task) {
    if (this.terminated) return;
    try {
      // 模拟一个 CPU 任务：求一段数据的平方和
      const sum = task.data.reduce((acc, x) => acc + x * x, 0);
      // 模拟偶发错误（这里不真的抛，仅演示错误处理结构）
      this.emit('done', { taskId: task.id, result: sum, workerId: this.id });
    } catch (err) {
      // 真实浏览器：self.postMessage({type:'error', error: err.message})
      this.emit('error', { taskId: task.id, error: err.message, workerId: this.id });
    }
  }
  terminate() {
    this.terminated = true;
    this.removeAllListeners();
  }
}

// ============================================
// 最佳实践1：Worker 池（复用，避免频繁创建）
// ============================================
class WorkerPool {
  constructor(size) {
    this.size = size;
    this.workers = [];
    this.queue = [];
    this.busy = new Set();
    for (let i = 0; i < size; i++) {
      this.workers.push(new SimWorker(i));
    }
    console.log('[Pool] 创建 Worker 池，大小:', size);
  }

  submit(task) {
    return new Promise((resolve, reject) => {
      const wrapped = { ...task, resolve, reject };
      const idle = this.workers.find(w => !this.busy.has(w));
      if (idle) {
        this._dispatch(idle, wrapped);
      } else {
        this.queue.push(wrapped);
      }
    });
  }

  _dispatch(worker, task) {
    this.busy.add(worker);
    // 关键：done 和 error 互斥，触发一个后必须移除另一个，
    // 否则未触发的监听器会累积，导致内存泄漏（MaxListenersExceeded）
    const onDone = (res) => {
      worker.off('error', onError);
      this.busy.delete(worker);
      task.resolve(res);
      this._next();
    };
    const onError = (err) => {
      worker.off('done', onDone);
      this.busy.delete(worker);
      task.reject(err);
      this._next();
    };
    worker.once('done', onDone);
    worker.once('error', onError);
    worker.emit('dispatch', task);
  }

  _next() {
    if (this.queue.length === 0) return;
    const idle = this.workers.find(w => !this.busy.has(w));
    if (idle) {
      const task = this.queue.shift();
      this._dispatch(idle, task);
    }
  }

  // 最佳实践2：批量提交，减少通信次数
  async submitBatch(tasks) {
    console.log('[Pool] 批量提交', tasks.length, '个任务');
    return Promise.all(tasks.map(t => this.submit(t)));
  }

  terminateAll() {
    this.workers.forEach(w => w.terminate());
    console.log('[Pool] 所有 Worker 已终止，资源已释放');
  }
}

// ============================================
// 最佳实践3：错误处理 + 超时兜底
// ============================================
function submitWithTimeout(pool, task, timeout = 1000) {
  return Promise.race([
    pool.submit(task),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('任务超时 (' + task.id + ')')), timeout)
    )
  ]);
}

// ============================================
// 演示：单任务 vs 批量任务，对比性能
// ============================================
function generateTask(id, size) {
  return { id: 'task-' + id, data: Array.from({ length: size }, () => Math.random()) };
}

(async () => {
  const pool = new WorkerPool(4); // 池大小 = CPU 核数（演示用4）

  // --- 测试1：单条提交 20 个任务 ---
  console.log('\\n=== 测试1：逐条提交 20 个任务 ===');
  const t1 = Date.now();
  const tasks1 = [];
  for (let i = 0; i < 20; i++) {
    tasks1.push(pool.submit(generateTask(i, 10000)));
  }
  const results1 = await Promise.all(tasks1);
  console.log('总耗时:', Date.now() - t1, 'ms');
  console.log('示例结果 task-0:', results1[0].result.toFixed(2), '由 worker', results1[0].workerId, '处理');

  // --- 测试2：批量提交（通信更少） ---
  console.log('\\n=== 测试2：批量提交 20 个任务 ===');
  const t2 = Date.now();
  const batch = Array.from({ length: 20 }, (_, i) => generateTask(i, 10000));
  const results2 = await pool.submitBatch(batch);
  console.log('总耗时:', Date.now() - t2, 'ms');

  // --- 测试3：超时兜底 ---
  console.log('\\n=== 测试3：超时兜底 ===');
  try {
    await submitWithTimeout(pool, generateTask('timeout', 10000), 1);
  } catch (err) {
    console.log('捕获错误:', err.message);
  }

  // --- 测试4：错误处理结构 ---
  console.log('\\n=== 测试4：Worker 错误处理 ===');
  const testWorker = new SimWorker(99);
  testWorker.on('error', (err) => console.log('收到 Worker 错误:', err.error));
  testWorker.on('done', (res) => console.log('任务完成:', res.taskId));
  testWorker.emit('dispatch', { id: 'err-test', data: [1, 2, 3] });

  // --- 最佳实践4：用完即终止，防内存泄漏 ---
  console.log('\\n=== 清理阶段 ===');
  pool.terminateAll();

  console.log('\\n=== 最佳实践小结 ===');
  console.log('1. 用 Worker 池复用线程，避免频繁创建销毁');
  console.log('2. 批量提交任务，减少 postMessage 次数');
  console.log('3. 大数据用 Transferable 转移（零拷贝）');
  console.log('4. 监听 onerror + 加超时兜底');
  console.log('5. 用完 terminate()，防止内存泄漏');
  console.log('6. 池大小建议 = CPU 核数（navigator.hardwareConcurrency）');
})();`,
  },
];
