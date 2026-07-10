// =============================================================
// Python vs JavaScript/TypeScript/Node.js 深度对比 —— 第 5 批
// -------------------------------------------------------------
// 转义规则：content 内部反引号写作 \`，${ 写作 \$\{
// =============================================================

export const chapters = [
  {
    id: "pyvsjs-concurrency",
    icon: "🔀",
    title: "并发模型总览",
    group: "并发与异步",
    content: `# 并发模型总览

## 一、并发 vs 并行：先理清概念

在对比 Python 和 JavaScript 的并发模型之前，必须先把两个经常被混淆的概念分清楚：**并发（Concurrency）** 和 **并行（Parallelism）**。

- **并发**：程序的结构能够"同时"处理多个任务。这些任务可能在同一时刻并不真正同时执行，而是通过快速切换（调度）让人感觉在同时进行。比如一个人同时写文档、回邮件、喝咖啡——实际上是交替做，但宏观上是"并发"。
- **并行**：多个任务在**同一物理时刻**真正同时执行，通常需要多核 CPU。比如四个人同时各写一份文档。

Rob Pike（Go 语言作者）的名言：**并发是关于"处理"很多事情，并行是关于"做"很多事情**。一个并发程序可以在单核上跑（通过时间片切换），但一个并行程序必须有多核才能真正"并行"。

| 概念 | 是否需要多核 | 是否同时执行 | 典型实现 |
|------|--------------|--------------|----------|
| 串行 | ❌ | ❌ | 一个任务做完再做下一个 |
| 并发 | ❌（可单核） | ❌（交替） | 协程、线程调度 |
| 并行 | ✅（多核） | ✅ | 多进程、多线程真并行 |

## 二、Python 的并发三件套

Python 提供了**三种**风格迥异的并发工具，每种适用场景不同：

### 1. threading —— 多线程

\`\`\`python
import threading
import time

def worker(name):
    for i in range(3):
        print(f"[{name}] tick {i}")
        time.sleep(0.1)

t1 = threading.Thread(target=worker, args=("A",))
t2 = threading.Thread(target=worker, args=("B",))
t1.start(); t2.start()
t1.join(); t2.join()
\`\`\`

Python 的线程是**真正的操作系统线程**（POSIX thread / Windows thread），由内核调度。但由于 GIL 的存在，同一时刻只有一个线程能执行 Python 字节码——所以 Python 多线程**不能真正并行 CPU 密集型任务**，但可以并发处理 I/O（I/O 时会释放 GIL）。

### 2. multiprocessing —— 多进程

\`\`\`python
from multiprocessing import Process

def worker(name):
    for i in range(3):
        print(f"[{name}] tick {i}")

if __name__ == "__main__":
    p1 = Process(target=worker, args=("A",))
    p2 = Process(target=worker, args=("B",))
    p1.start(); p2.start()
    p1.join(); p2.join()
\`\`\`

每个进程有独立的 Python 解释器和内存空间，**各自有自己的 GIL**，所以能真正并行执行 CPU 密集型任务。代价是进程创建开销大、进程间通信（IPC）复杂。

### 3. asyncio —— 协程

\`\`\`python
import asyncio

async def worker(name):
    for i in range(3):
        print(f"[{name}] tick {i}")
        await asyncio.sleep(0.1)

async def main():
    await asyncio.gather(worker("A"), worker("B"))

asyncio.run(main())
\`\`\`

asyncio 是**单线程并发**模型，用事件循环调度协程。协程在 \`await\` 点主动让出控制权，没有线程切换开销，适合超高并发的 I/O 场景（如 Web 服务器、爬虫）。

| 方案 | 并行能力 | 适用场景 | 开销 |
|------|----------|----------|------|
| threading | 受 GIL 限制（仅 I/O 并发） | I/O 密集 | 中（线程切换） |
| multiprocessing | ✅ 真并行 | CPU 密集 | 高（进程创建 + IPC） |
| asyncio | ❌（单线程并发） | 超高 I/O 并发 | 低（协程切换） |

## 三、JavaScript/Node.js 的并发模型

JavaScript 从诞生起就被设计成**单线程**语言——浏览器中只有一个主线程负责 DOM 和 JS 执行，多线程会带来严重的竞态问题（两个线程同时改一个 DOM 节点？灾难）。

### 1. 单线程事件循环

Node.js 继承了这个模型：一个主线程跑事件循环，所有 I/O 操作交给底层的 **libuv** 库（用 C 写的线程池）异步处理。

\`\`\`javascript
console.log("1");
setTimeout(() => console.log("3"), 0);
Promise.resolve().then(() => console.log("2"));
console.log("1.5");
// 输出顺序：1 → 1.5 → 2 → 3
\`\`\`

主线程永不阻塞（理想情况下），通过回调/Promise/async-await 处理异步结果。**I/O 是真异步的**，由 libuv 的线程池（默认 4 线程）在后台处理，完成后回调进入主线程队列。

### 2. Worker Threads

Node.js 10+ 引入 \`worker_threads\` 模块，允许创建真正的多线程来处理 CPU 密集型任务：

\`\`\`javascript
const { Worker } = require("worker_threads");

const worker = new Worker(\`
  const { parentPort } = require("worker_threads");
  let sum = 0;
  for (let i = 0; i < 1e9; i++) sum += i;
  parentPort.postMessage(sum);
\`, { eval: true });

worker.on("message", (v) => console.log("结果:", v));
\`\`\`

Worker 是真正的 OS 线程，有自己的 V8 实例和事件循环，**和主线程并行**。

### 3. cluster 模块

\`\`\`javascript
const cluster = require("cluster");
const os = require("os");

if (cluster.isPrimary) {
    for (let i = 0; i < os.cpus().length; i++) cluster.fork();
} else {
    require("http").createServer((req, res) => res.end("hi")).listen(3000);
}
\`\`\`

cluster 通过 fork 多个 Node 进程来利用多核，常用于 Web 服务器横向扩展。

## 四、为什么 Python 有 GIL 而 JS 没有

这是一个经典误解：很多人以为"Python 和 JS 都是单线程，所以都应该有/没有 GIL"。**大错特错**。

**关键区别**：Python 的线程是**操作系统级真线程**，多个线程可以同时跑在多个 CPU 核上。如果没有 GIL，多个线程会同时修改 Python 对象的引用计数，导致内存管理崩溃。GIL 是为了保护 CPython 的内存管理（引用计数机制）而存在的妥协。

**JavaScript** 的主线程**真的只有一个**，根本没有"多个线程同时执行 JS 字节码"的情况，自然不需要 GIL。Worker Threads 虽然是多线程，但每个 Worker 有自己独立的 V8 实例和堆内存，**不共享 JS 对象**，所以也不需要全局锁。

| 维度 | Python | JavaScript(Node.js) |
|------|--------|---------------------|
| 主线程是否真单线程 | ❌ 线程是 OS 线程，可多核 | ✅ 真单线程 |
| 多线程是否共享内存 | ✅ 共享对象 | ❌ Worker 隔离 |
| 是否需要 GIL | ✅ 需要（保护引用计数） | ❌ 不需要 |
| CPU 密集并行方案 | multiprocessing | worker_threads |
| I/O 并发方案 | threading / asyncio | 事件循环 + libuv |

## 五、并发哲学对比

Python 的并发哲学是**"提供多种工具，各司其职"**：
- I/O 密集？用 threading 或 asyncio
- CPU 密集？用 multiprocessing
- 想要简单？用 concurrent.futures 统一接口

代价是**选择困难**——新手不知道该用哪个，而且三种模型的 API 风格不统一（线程用 \`threading.Thread\`，协程用 \`async def\`，进程用 \`Process\`）。

JavaScript 的并发哲学是**"事件循环一统天下"**：
- 默认所有 I/O 都异步，事件循环处理一切
- CPU 密集？才用 Worker Threads（少数场景）
- 代码风格统一（全是 async/await）

代价是**CPU 密集任务天然弱**——一个死循环会卡死整个 Node.js 进程，必须显式开 Worker。

## 六、选型决策矩阵

| 任务类型 | Python 推荐 | Node.js 推荐 |
|----------|-------------|--------------|
| 高并发网络 I/O | asyncio（uvloop） | 原生事件循环 |
| CPU 密集计算 | multiprocessing | worker_threads |
| 混合负载 | multiprocessing + asyncio | cluster + worker_threads |
| 快速脚本 | threading（简单） | 原生异步 |
| 需要共享大量数据 | multiprocessing + 共享内存 | worker_threads + SharedArrayBuffer |

## 七、本章总结

- **并发 ≠ 并行**：并发是结构能力，并行需要多核。
- **Python 线程是 OS 线程**，所以需要 GIL；**JS 主线程真单线程**，不需要 GIL。
- Python 提供三种并发模型（线程/进程/协程），各有适用场景；Node.js 以事件循环为主，Worker Threads 为辅。
- Python 的并发是"多选一"的烦恼，Node.js 的并发是"默认异步"的便利但 CPU 密集任务麻烦。

接下来三章会深入 GIL、线程/进程、asyncio 的底层实现，最后对比 JS 的异步演进和 Worker Threads。`,
  },
  {
    id: "pyvsjs-gil",
    icon: "🔒",
    title: "GIL 深度剖析",
    group: "并发与异步",
    content: `# GIL 深度剖析

GIL（Global Interpreter Lock，全局解释器锁）是 Python 并发编程绕不开的话题，也是 Python 被"性能党"批评最多的点。这一章我们彻底搞清楚：GIL 到底是什么、为什么存在、怎么绕过、以及它的未来。

## 一、GIL 是什么

GIL 是 **CPython 解释器**内部的一把互斥锁，确保**同一时刻只有一个线程能执行 Python 字节码**。注意：是 CPython 才有 GIL，Jython、IronPython 没有（它们用 JVM/CLR 的线程模型），PyPy 也有 GIL（因为它也是 CPython 的实现思路）。

\`\`\`python
# 看起来是多线程，实际同一时刻只有一个线程在跑 Python 代码
import threading

def count(n):
    while n > 0:
        n -= 1

t1 = threading.Thread(target=count, args=(10**8,))
t2 = threading.Thread(target=count, args=(10**8,))
t1.start(); t2.start()
t1.join(); t2.join()
# 两个线程跑这个，几乎和单线程一样慢（甚至更慢，因为切换开销）
\`\`\`

## 二、GIL 为什么存在

GIL 的根本原因：**CPython 的内存管理使用引用计数，而引用计数不是线程安全的**。

Python 中每个对象都有一个 \`ob_refcnt\` 字段记录被引用的次数，归零时立即回收：

\`\`\`c
// CPython 源码（简化）
typedef struct _object {
    int ob_refcnt;       // 引用计数
    PyTypeObject *ob_type;
} PyObject;

#define Py_INCREF(op) ((op)->ob_refcnt++)
#define Py_DECREF(op) \\
    if (--((op)->ob_refcnt) == 0) { \\
        _Py_Dealloc(op); \\
    }
\`\`\`

假设没有 GIL，两个线程同时执行 \`obj.refcnt++\`：

1. 线程 A 读 refcnt=1
2. 线程 B 读 refcnt=1
3. 线程 A 写 refcnt=2
4. 线程 B 写 refcnt=2（应该是 3！）

结果引用计数丢失，对象被提前回收，导致内存损坏。

**解决方案有两条路**：
- 给每个对象的引用计数操作加细粒度锁（性能差，锁竞争严重）
- 用一把全局锁（GIL）保护整个解释器（简单，锁开销小）

CPython 在 1992 年选择了后者——那时单核 CPU 是主流，多核罕见，GIL 是合理的工程妥协。这个决定影响至今。

## 三、GIL 对性能的影响

### 1. CPU 密集型任务无法并行

\`\`\`python
import threading, time

def cpu_bound():
    total = 0
    for i in range(10**7):
        total += i ** 0.5

# 单线程
start = time.time()
cpu_bound(); cpu_bound()
print(f"单线程: {time.time() - start:.2f}s")

# 双线程
start = time.time()
t1 = threading.Thread(target=cpu_bound)
t2 = threading.Thread(target=cpu_bound)
t1.start(); t2.start(); t1.join(); t2.join()
print(f"双线程: {time.time() - start:.2f}s")  # 不会更快，甚至更慢
\`\`\`

在多核机器上，双线程版本和单线程几乎一样慢，甚至**更慢**（GIL 争抢和线程切换开销）。这是 Python 多线程被诟病的核心原因。

### 2. I/O 密集型任务能并发

\`\`\`python
import threading, urllib.request, time

def fetch(url):
    urllib.request.urlopen(url).read()

urls = ["https://example.com"] * 10

# 单线程
start = time.time()
for u in urls: fetch(u)
print(f"单线程: {time.time() - start:.2f}s")

# 多线程
start = time.time()
threads = [threading.Thread(target=fetch, args=(u,)) for u in urls]
for t in threads: t.start()
for t in threads: t.join()
print(f"多线程: {time.time() - start:.2f}s")  # 显著更快
\`\`\`

因为 I/O 操作（socket read、file read 等）会**主动释放 GIL**，其他线程可以趁机执行。

## 四、GIL 的释放时机

GIL 不是"一直持有"，而是周期性释放：

### 1. 按 tick 释放（CPU 密集）

CPython 维护一个 \`_Py_Ticker\` 计数器（默认 100），每执行一定数量的字节码指令（tick）就检查是否要释放 GIL，给其他线程机会。

\`\`\`python
import sys
sys.getswitchinterval()  # 0.005（5ms，Python 3.2+）
sys.setswitchinterval(0.005)
\`\`\`

Python 3.2 之前按指令计数切换（每 100 条指令），3.2 之后改为按时间间隔（默认 5ms），避免 CPU 密集线程饿死 I/O 线程。

### 2. I/O 操作释放

所有阻塞型 I/O 系统调用（read、write、recv、select 等）在调用前会释放 GIL，调用结束后重新获取。这就是 I/O 密集任务能并发的原因。

### 3. C 扩展可手动释放

写 C 扩展时，可以用 \`Py_BEGIN_ALLOW_THREADS\` / \`Py_END_ALLOW_THREADS\` 宏手动释放 GIL，常用于 C 层面的耗时计算：

\`\`\`c
Py_BEGIN_ALLOW_THREADS
// 这里执行不需要访问 Python 对象的耗时 C 代码
heavy_c_computation();
Py_END_ALLOW_THREADS
\`\`\`

NumPy 的矩阵运算就是这么做的，所以 NumPy 的多线程能真并行。

## 五、为什么 multiprocessing 能绕过 GIL

multiprocessing 创建的是**独立进程**，每个进程有自己的 Python 解释器实例和内存空间，自然有**自己独立的 GIL**。多个进程的 GIL 互不影响，所以能真正并行。

\`\`\`python
from multiprocessing import Pool
import time

def cpu_bound(n):
    return sum(i ** 0.5 for i in range(n))

if __name__ == "__main__":
    start = time.time()
    with Pool(4) as p:
        results = p.map(cpu_bound, [10**7] * 4)
    print(f"4 进程: {time.time() - start:.2f}s")  # 真正 ~4 倍加速
\`\`\`

代价是：
- **进程创建开销大**（fork/spawn + 内存复制）
- **进程间通信（IPC）开销大**（数据要序列化通过管道/队列传输）
- **内存占用高**（每个进程独立加载解释器和库）

## 六、Python 3.13 的 free-threaded 模式

PEP 703 提议在 CPython 中**可选移除 GIL**，Python 3.13（2024）首次以实验性形式提供 **free-threaded 构建**（即 "no-GIL" 模式）。

### 启用方式

\`\`\`bash
# 安装 free-threaded 版本（python3.13t）
python3.13t -X gil=0 your_script.py

# 或在代码中查询
import sys
print(sys._is_gil_enabled())  # False
\`\`\`

### 实现原理

free-threaded 模式的核心改动：
1. **引用计数改为线程安全**：用原子操作（atomic）替代普通自增，避免加锁。
2. **对象分配器改进**：线程局部分配，减少锁竞争。
3. **全局结构加细粒度锁**：解释器内部的各种全局结构拆分为多锁。

### 性能权衡

- 单线程性能下降 **~10-40%**（原子操作开销 + 数据结构变胖）
- 多线程 CPU 密集任务**真正并行**，多核可加速

\`\`\`python
# free-threaded 模式下，多线程终于能加速 CPU 密集任务
import threading

def cpu_bound():
    total = 0
    for i in range(10**8):
        total += i ** 0.5

threads = [threading.Thread(target=cpu_bound) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()  # 4 核 ~3.5 倍加速
\`\`\`

目前仍是实验性，第三方库（NumPy/PyTorch 等）的适配还在进行中。

## 七、JS 为什么没有 GIL

JavaScript 主线程**真正单线程**——事件循环只有一个，没有"多个线程同时执行 JS"的情况，自然不需要 GIL。

\`\`\`javascript
// Node.js 主线程，一个死循环直接卡死
while (true) {}  // 整个进程僵死，事件循环永远不转
\`\`\`

Worker Threads 虽然是多线程，但每个 Worker 是**完全隔离**的 V8 实例，不共享 JS 对象（只能通过 \`postMessage\` 传值拷贝，或用 \`SharedArrayBuffer\` 共享二进制缓冲区）。既然不共享对象，就没有引用计数竞争问题，不需要 GIL。

| 维度 | Python（有 GIL） | JavaScript（无 GIL） |
|------|------------------|---------------------|
| 线程模型 | OS 线程，共享对象内存 | 主线程单线程 + Worker 隔离 |
| 内存管理 | 引用计数 + 共享堆 | 每个 V8 实例独立堆 |
| 是否需要全局锁 | ✅ 需要 GIL | ❌ 不需要 |
| CPU 密集并行 | multiprocessing（进程） | worker_threads（隔离线程） |

## 八、本章总结

- **GIL 保护引用计数**：CPython 的内存管理依赖引用计数，非线程安全，GIL 是最简单的保护方案。
- **GIL 影响 CPU 并行**：多线程跑 CPU 密集任务无法加速，但 I/O 密集任务能并发（I/O 释放 GIL）。
- **GIL 释放时机**：每 5ms tick 检查 + I/O 操作前主动释放 + C 扩展手动释放。
- **multiprocessing 绕过 GIL**：每进程独立 GIL，代价是高开销。
- **Python 3.13 free-threaded**：实验性移除 GIL，用原子操作替代，单线程略慢但多线程真并行。
- **JS 不需要 GIL**：主线程真单线程，Worker 隔离不共享对象。

理解 GIL 后，下一章我们深入 Python 的多线程与多进程 API，看实际工程中怎么用。`,
  },
  {
    id: "pyvsjs-threading",
    icon: "🧵",
    title: "Python 多线程与多进程",
    group: "并发与异步",
    content: `# Python 多线程与多进程

这一章深入 Python 标准库的并发原语：threading 模块的同步工具、concurrent.futures 的统一抽象、multiprocessing 的进程池与共享内存，并和 Node.js 的单线程+Worker 模型对比。

## 一、threading 模块

### 1. Thread 基础

\`\`\`python
import threading

def worker(name, delay):
    for i in range(3):
        print(f"[{name}] {i}")
        import time; time.sleep(delay)

# 方式一：传 target
t = threading.Thread(target=worker, args=("A", 0.1), daemon=True)

# 方式二：继承
class MyThread(threading.Thread):
    def run(self):
        worker("B", 0.2)

t1 = MyThread()
t1.start()   # 启动
t1.join()    # 等待结束
\`\`\`

\`daemon=True\` 表示守护线程，主线程退出时会被强制杀死（不会阻止程序退出）。

### 2. Lock —— 互斥锁

\`\`\`python
import threading
lock = threading.Lock()
balance = 0

def deposit(n):
    global balance
    for _ in range(100000):
        lock.acquire()
        try:
            balance += 1
        finally:
            lock.release()

# 不加锁的话，balance += 1 不是原子操作（读-改-写），会丢更新
\`\`\`

更推荐的上下文管理器写法：

\`\`\`python
def deposit(n):
    global balance
    for _ in range(100000):
        with lock:
            balance += 1
\`\`\`

### 3. RLock —— 可重入锁

普通 Lock 如果同一线程二次 acquire 会死锁。RLock 允许同一线程多次获取，需对应次数释放：

\`\`\`python
import threading
rlock = threading.RLock()

def recursive(n):
    with rlock:
        if n > 0:
            print(n)
            recursive(n - 1)  # 同线程再次获取 RLock，OK
\`\`\`

### 4. Condition —— 条件变量

用于"等待某个条件成立"的场景，经典生产者-消费者：

\`\`\`python
import threading
condition = threading.Condition()
queue = []

def producer():
    with condition:
        queue.append("item")
        condition.notify()  # 通知一个等待者

def consumer():
    with condition:
        while not queue:    # 必须用 while 防虚假唤醒
            condition.wait()  # 释放锁并等待
        item = queue.pop(0)
\`\`\`

### 5. Semaphore —— 信号量

限制同时访问的资源数（如数据库连接池）：

\`\`\`python
import threading
sem = threading.Semaphore(3)  # 最多 3 个并发

def use_resource():
    with sem:
        # 同时最多 3 个线程进入这里
        do_db_work()
\`\`\`

### 6. Event —— 事件标志

用于线程间简单通知：

\`\`\`python
import threading
event = threading.Event()

def waiter():
    event.wait()       # 阻塞直到 event.set()
    print("收到信号")

def setter():
    import time; time.sleep(1)
    event.set()
\`\`\`

## 二、concurrent.futures 统一接口

threading 模块偏底层，concurrent.futures 提供更高层的线程池/进程池抽象：

\`\`\`python
from concurrent.futures import ThreadPoolExecutor, as_completed
import urllib.request

def fetch(url):
    return urllib.request.urlopen(url).read()

with ThreadPoolExecutor(max_workers=8) as executor:
    # map：保持顺序
    results = list(executor.map(fetch, urls))

    # submit + as_completed：谁先完成谁先处理
    futures = {executor.submit(fetch, url): url for url in urls}
    for fut in as_completed(futures):
        url = futures[fut]
        try:
            data = fut.result()
        except Exception as e:
            print(f"{url} 失败: {e}")
\`\`\`

\`ThreadPoolExecutor\` 用于 I/O 密集任务，\`ProcessPoolExecutor\` 用于 CPU 密集任务，API 完全一致——这是 Python 并发 API 设计的亮点。

## 三、multiprocessing 模块

### 1. Process 基础

\`\`\`python
from multiprocessing import Process, current_process

def worker():
    print(f"{current_process().name} pid={current_process().pid}")

if __name__ == "__main__":
    p = Process(target=worker, name="worker-1")
    p.start()
    p.join()
\`\`\`

**关键注意**：multiprocessing 代码必须放在 \`if __name__ == "__main__":\` 下，否则 Windows（spawn 模式）会递归 fork 导致崩溃。

### 2. 启动方式：fork vs spawn

| 模式 | 行为 | 平台 |
|------|------|------|
| fork | 复制父进程内存（快，但可能死锁锁） | Unix 默认 |
| spawn | 全新进程，重新 import 父模块（慢，干净） | Windows/macOS 默认 |
| forkserver | fork 服务进程，再 spawn | Unix 可选 |

Python 3.14 计划默认改 spawn（fork 在多线程下不安全）。

### 3. Pool —— 进程池

\`\`\`python
from multiprocessing import Pool

def heavy(x):
    return sum(i ** 0.5 for i in range(x))

if __name__ == "__main__":
    with Pool(processes=4) as pool:
        # map 自动分块
        results = pool.map(heavy, [10**7] * 8)
        # imap：惰性，流式处理
        for r in pool.imap(heavy, [10**7] * 8):
            print(r)
\`\`\`

### 4. 进程间通信（IPC）

\`\`\`python
from multiprocessing import Process, Queue, Pipe

# Queue：多生产多消费
def producer(q):
    q.put("data")
def consumer(q):
    print(q.get())

q = Queue()
Process(target=producer, args=(q,)).start()
Process(target=consumer, args=(q,)).start()

# Pipe：一对一双向
parent_conn, child_conn = Pipe()
def child(conn):
    print(conn.recv())
    conn.send("hi back")
\`\`\`

### 5. 共享内存

进程不共享内存，但可以用 \`Value\`/\`Array\` 或 \`Manager\` 共享数据：

\`\`\`python
from multiprocessing import Process, Value, Array

def worker(n, arr):
    n.value += 1
    for i in range(len(arr)):
        arr[i] *= 2

if __name__ == "__main__":
    num = Value("i", 0)         # 共享 int
    arr = Array("i", [1, 2, 3]) # 共享数组
    p = Process(target=worker, args=(num, arr))
    p.start(); p.join()
    print(num.value, arr[:])  # 1 [2,4,6]
\`\`\`

Python 3.8+ 还有 \`multiprocessing.shared_memory\` 模块，可共享真正的内存块（无需拷贝）。

## 四、多进程的开销

多进程的开销远大于多线程：

| 开销项 | threading | multiprocessing |
|--------|-----------|-----------------|
| 创建成本 | ~微秒 | ~毫秒（fork）~秒（spawn） |
| 内存占用 | 共享，低 | 独立解释器+库，高 |
| 通信成本 | 直接访问对象 | IPC 序列化，慢 |
| GIL 影响 | 有 | 无 |

实测：spawn 启动一个进程通常 50-200ms，而启动一个线程只要几十微秒。所以多进程适合**长时运行**的 CPU 任务，不适合频繁创建销毁的短任务。

## 五、何时用多线程，何时用多进程

### 多线程适用：I/O 密集

\`\`\`python
import urllib
from concurrent.futures import ThreadPoolExecutor
# 网络/磁盘 I/O 为主，CPU 空闲等待
with ThreadPoolExecutor(16) as ex:
    ex.map(urllib.request.urlopen, urls)
\`\`\`

### 多进程适用：CPU 密集

\`\`\`python
from concurrent.futures import ProcessPoolExecutor
# 纯计算，需要多核并行
with ProcessPoolExecutor(4) as ex:
    results = list(ex.map(heavy_compute, chunks))
\`\`\`

### 决策流程

\`\`\`
任务类型？
├─ I/O 密集（网络/磁盘）
│   └─ 线程池 / asyncio
└─ CPU 密集（计算）
    └─ 进程池 / free-threaded
\`\`\`

## 六、对比 Node.js 的单线程+Worker 模型

Node.js 的并发模型和 Python 完全不同：**默认单线程 + 事件循环**，需要时才开 Worker。

\`\`\`javascript
const { Worker } = require("worker_threads");

// 主线程：I/O 用事件循环，天然异步
const fs = require("fs").promises;
async function ioTask() {
    const data = await fs.readFile("big.txt");
    return data.length;
}

// CPU 密集：开 Worker
function cpuTask() {
    return new Promise((resolve) => {
        const worker = new Worker("./worker.js");
        worker.on("message", resolve);
    });
}
\`\`\`

### 对比总结

| 维度 | Python | Node.js |
|------|--------|---------|
| I/O 并发 | threading / asyncio | 事件循环（默认异步） |
| CPU 并行 | multiprocessing | worker_threads |
| 共享内存 | 进程间用 Value/Array | SharedArrayBuffer |
| 通信方式 | Queue/Pipe（序列化） | postMessage（结构化克隆） |
| 编程心智 | 三套 API 要选 | 默认 async，CPU 才开 Worker |
| 默认 I/O 模型 | 同步阻塞 | 异步非阻塞 |

Node.js 的优势是**默认异步**——所有 I/O API 天然非阻塞，写起来连贯。Python 的 threading 是同步阻塞 API，要并发就得显式开线程池，心智负担更重。但 Python 有 asyncio 提供异步能力（下一章详解），算是补齐了这块。

## 七、本章总结

- **threading**：Thread/Lock/RLock/Condition/Semaphore/Event，适合 I/O 密集，受 GIL 限制无法 CPU 并行。
- **concurrent.futures**：ThreadPoolExecutor / ProcessPoolExecutor，统一高层接口。
- **multiprocessing**：Process/Pool/Queue/Pipe/Value/Array，绕过 GIL 真并行，代价是高开销。
- **fork vs spawn**：fork 快但多线程不安全，spawn 干净但慢，Python 3.14 将默认 spawn。
- **选型**：I/O 密集用线程/asyncio，CPU 密集用进程，混合用 ProcessPool+asyncio。
- **vs Node.js**：Node 默认异步省心，Python 多套 API 灵活但选择困难。

下一章我们看 Python 异步 I/O 的现代方案——asyncio 协程与事件循环。`,
  },
  {
    id: "pyvsjs-asyncio",
    icon: "🌊",
    title: "asyncio：协程与事件循环",
    group: "并发与异步",
    content: `# asyncio：协程与事件循环

asyncio 是 Python 3.4 引入、3.5+ 用 async/await 语法完善的异步 I/O 框架。它和 Node.js 的事件循环同源——都是单线程协作式并发，但 API 设计和实现细节差异很大。这一章深入 asyncio 的核心机制。

## 一、核心概念

asyncio 有 5 个核心概念：

| 概念 | 类比 | 说明 |
|------|------|------|
| Event Loop | CPU 调度器 | 调度协程执行，监听 I/O 事件 |
| Coroutine | 函数 | async def 定义的函数，调用返回协程对象 |
| Task | 线程 | 被事件循环调度的协程，"运行中的协程" |
| Future | Promise | 表示异步结果的低层对象 |
| await | yield | 暂停协程，等待结果 |

### 1. 协程（Coroutine）

\`\`\`python
import asyncio
async def fetch_data():
    print("开始")
    await asyncio.sleep(1)  # 遇到 await 主动让出
    print("结束")
    return "data"

# 直接调用不会执行，只是创建协程对象
coro = fetch_data()
# 必须用事件循环驱动
asyncio.run(fetch_data())
\`\`\`

### 2. Task

\`\`\`python
async def main():
    # create_task 把协程包装成 Task，立即调度
    task = asyncio.create_task(fetch_data())
    # 此时 task 已在后台运行
    do_something_else()
    result = await task  # 等待完成
\`\`\`

### 3. Future

Future 是更底层的"将来才有结果"的对象，Task 是 Future 的子类。日常编码很少直接用 Future，主要是库作者用。

## 二、async/await 语法

Python 的 async/await 和 JS 几乎一模一样（Python 3.5 比 JS 早一年引入）：

\`\`\`python
import asyncio
async def fetch_user(uid):
    data = await db.get(uid)   # await 暂停，等结果
    return data

async def main():
    user = await fetch_user(1)
    print(user)

asyncio.run(main())
\`\`\`

对比 JavaScript：

\`\`\`javascript
async function fetchUser(uid) {
    const data = await db.get(uid);
    return data;
}
async function main() {
    const user = await fetchUser(1);
    console.log(user);
}
main();
\`\`\`

语法层面几乎可以一一对应，差异主要在 API（\`asyncio.run\` vs 自动运行）和库生态。

## 三、并发执行：create_task + gather

### 1. 串行 await（慢）

\`\`\`python
async def main():
    a = await fetch(1)  # 1s
    b = await fetch(2)  # 1s
    # 总耗时 2s，没有并发
\`\`\`

### 2. create_task 并发

\`\`\`python
async def main():
    t1 = asyncio.create_task(fetch(1))
    t2 = asyncio.create_task(fetch(2))
    a = await t1
    b = await t2
    # 总耗时 ~1s，并发执行
\`\`\`

### 3. gather 批量并发

\`\`\`python
async def main():
    results = await asyncio.gather(
        fetch(1), fetch(2), fetch(3),
        return_exceptions=True  # 异常作为结果返回，不抛出
    )
\`\`\`

\`gather\` 对应 JS 的 \`Promise.all\`，等所有完成。

### 4. 其他并发原语

\`\`\`python
# as_completed：谁先完成谁先返回
for coro in asyncio.as_completed([fetch(i) for i in range(5)]):
    result = await coro

# wait：更底层，返回 (done, pending)
done, pending = await asyncio.wait(
    [fetch(i) for i in range(5)],
    return_when=asyncio.FIRST_COMPLETED,
    timeout=2.0
)

# TaskGroup（Python 3.11+，推荐）
async with asyncio.TaskGroup() as tg:
    t1 = tg.create_task(fetch(1))
    t2 = tg.create_task(fetch(2))
# 退出 with 时自动等所有任务完成，任一异常会取消其他
\`\`\`

\`TaskGroup\` 是 Python 3.11 引入的现代写法，比 gather 更安全（自动取消、结构化并发）。

## 四、协程 vs 线程

| 维度 | 协程（asyncio） | 线程（threading） |
|------|-----------------|-------------------|
| 调度方式 | 协作式（await 主动让出） | 抢占式（OS 时间片） |
| 切换成本 | ~纳秒（用户态栈切换） | ~微秒（内核态切换） |
| 数量上限 | 数十万（轻量） | 数千（受栈内存限制） |
| 数据安全 | 单线程，无需锁 | 需要锁保护共享状态 |
| 阻塞影响 | 一个阻塞全卡死 | 一个阻塞不影响其他 |
| 调试难度 | 调用栈不连续，难 | 相对直观 |

**协作式调度**是协程的关键：协程自己决定何时让出（在 await 点），所以协程间不会被打断，天然无需锁。但代价是**一旦某个协程不 await 而是死循环，整个事件循环卡死**。

## 五、事件循环与 I/O 模型

asyncio 的事件循环底层依赖操作系统的**多路复用 I/O**：

| 平台 | 系统调用 | 特点 |
|------|----------|------|
| Linux | epoll | O(1)，支持边缘触发 |
| macOS/BSD | kqueue | O(1)，类似 epoll |
| Windows | IOCP | I/O Completion Port |

\`\`\`python
# 事件循环的工作循环（简化）
def run_forever(loop):
    while True:
        # 1. 等待 I/O 事件（epoll_wait）
        events = loop._selector.select(timeout)
        # 2. 处理就绪的 I/O 回调
        for cb in events:
            cb()
        # 3. 执行就绪的 Task（运行到下一个 await）
        run_ready_tasks()
\`\`\`

所有 \`await\` 本质都是注册一个 I/O 事件到 selector，然后让出控制权。事件循环监听到 I/O 就绪后，把对应 Task 重新放回就绪队列。

## 六、uvloop 加速

uvloop 是用 Cython 写的 asyncio 事件循环替代品，底层用 libuv（和 Node.js 同款），性能比原生 asyncio 快 2-4 倍。

\`\`\`bash
pip install uvloop
\`\`\`

\`\`\`python
import asyncio
import uvloop

uvloop.install()  # 全局替换事件循环（Python 3.10 之前）

# Python 3.11+ 推荐写法
asyncio.run(main(), loop_factory=uvloop.EventLoopPolicy().new_event_loop)
\`\`\`

uvloop 把 asyncio 的性能拉到接近 Go/Node.js 水平，生产环境的异步 Web 服务（FastAPI/aiohttp）几乎都会用 uvloop。

| 事件循环 | QPS（基准） | 备注 |
|----------|-------------|------|
| asyncio（原生） | ~15000 | Python 实现 |
| uvloop | ~45000 | libuv 实现 |
| Node.js | ~50000 | libuv 原生 |

## 七、常见陷阱

### 1. 阻塞调用卡住事件循环

\`\`\`python
async def bad():
    time.sleep(5)  # ❌ 同步阻塞，整个循环卡 5s
    requests.get(url)  # ❌ 同步 HTTP，阻塞

async def good():
    await asyncio.sleep(5)  # ✅ 异步 sleep
    await aiohttp.get(url)  # ✅ 异步 HTTP
\`\`\`

如果必须调用同步阻塞代码，用 \`run_in_executor\` 扔进线程池：

\`\`\`python
async def hybrid():
    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(None, requests.get, url)
    # 在线程池跑同步代码，不阻塞事件循环
\`\`\`

### 2. 忘记 await

\`\`\`python
async def main():
    coro = fetch_data()  # ❌ 没await，协程没执行
    # 会有 "coroutine was never awaited" 警告
\`\`\`

### 3. 在异步代码里用同步锁

\`\`\`python
import asyncio
import threading
lock = threading.Lock()

async def bad():
    with lock:  # ❌ 阻塞事件循环
        await asyncio.sleep(1)

# 应该用 asyncio.Lock
lock = asyncio.Lock()
async def good():
    async with lock:  # ✅ 异步锁，不阻塞
        await asyncio.sleep(1)
\`\`\`

asyncio 有完整的异步同步原语：\`asyncio.Lock\`、\`asyncio.Semaphore\`、\`asyncio.Event\`、\`asyncio.Queue\`，对应 threading 的同名工具，但都是非阻塞的。

### 4. 混用 asyncio 和 trio/curio

asyncio 是标准库，但第三方有 trio（结构化并发更安全）、curio（更纯粹）。它们的事件循环不兼容，库选择时要看清楚支持哪个。

## 八、对比 JS 的事件循环

asyncio 和 JS 事件循环都是单线程协作式，但实现细节不同：

| 维度 | Python asyncio | JavaScript |
|------|----------------|------------|
| 运行入口 | \`asyncio.run(main())\` 显式启动 | 事件循环始终运行 |
| 微任务 | 无明确概念 | Promise.then 是微任务 |
| 宏任务 | Task 队列 | setTimeout/setInterval |
| 调度粒度 | 每个 await 让出 | 每个 then 回调 |
| 默认 I/O 库 | 较少（aiohttp/aiomysql） | 全部异步（fs/http/db） |
| 性能 | 原生慢，uvloop 快 | libuv 原生快 |

JS 的优势是**所有 I/O 库默认异步**，asyncio 的痛点是**同步库太多，要找异步替代品**（比如 requests 不能用，得换 aiohttp；pymysql 不能用，得换 aiomysql）。

## 九、本章总结

- **核心概念**：Event Loop 调度、Coroutine 函数、Task 运行中协程、Future 异步结果、await 让出。
- **并发执行**：create_task + gather / TaskGroup（3.11+ 推荐结构化并发）。
- **协程 vs 线程**：协作式 vs 抢占式，协程轻量无需锁但怕阻塞。
- **I/O 模型**：epoll/kqueue/IOCP 多路复用，uvloop 用 libuv 加速 2-4 倍。
- **陷阱**：阻塞调用卡死循环、忘 await、用同步锁、混用异步库。
- **vs JS**：语法相似，生态差异大——JS 默认全异步，Python 要主动选异步库。

下一章我们看 JS 这边的异步演进史，对比两套事件循环的设计哲学。`,
  },
  {
    id: "pyvsjs-js-async",
    icon: "🔄",
    title: "JS 异步演进史",
    group: "并发与异步",
    content: `# JS 异步演进史

JavaScript 的异步编程经历了**回调 → Promise → async/await** 三代演进，背后是 Node.js 的 libuv 事件循环。这一章梳理完整演进路径，并和 Python asyncio 的事件循环深度对比。

## 一、回调地狱时代

早期 JS（ES5 及以前）所有异步操作都靠回调：

\`\`\`javascript
// Node.js 早期读文件
const fs = require("fs");
fs.readFile("a.txt", (err, dataA) => {
    if (err) return console.error(err);
    fs.readFile("b.txt", (err, dataB) => {
        if (err) return console.error(err);
        fs.readFile("c.txt", (err, dataC) => {
            if (err) return console.error(err);
            console.log(dataA + dataB + dataC);  // 三层嵌套
        });
    });
});
\`\`\`

这就是臭名昭著的**回调地狱（Callback Hell）**——嵌套深、错误处理分散、控制流难以组合。对比 Python 同期：

\`\`\`python
# Python 同期是同步阻塞，没有回调地狱，但也没有并发
a = open("a.txt").read()
b = open("b.txt").read()
c = open("c.txt").read()
print(a + b + c)
\`\`\`

Python 的"简单"是以性能为代价的——三个文件串行读，而 Node.js 回调至少能并发（虽然写起来丑）。

## 二、Promise 时代

ES6（2015）正式引入 Promise，把"未来的值"包装成对象，链式调用：

\`\`\`javascript
fs.promises.readFile("a.txt")
    .then(dataA => fs.promises.readFile("b.txt"))
    .then(dataB => fs.promises.readFile("c.txt"))
    .then(dataC => console.log("done"))
    .catch(err => console.error(err));  // 统一错误处理
\`\`\`

Promise 三种状态：pending → fulfilled / rejected，状态不可逆。链式调用解决了嵌套问题，但代码仍然是"then 链"，逻辑流不直观。

### Promise 组合器

\`\`\`javascript
// all：全部成功才成功，任一失败则失败
await Promise.all([p1, p2, p3]);

// race：第一个完成（成功或失败）的结果
await Promise.race([p1, timeout(5000)]);  // 超时控制

// allSettled：等所有完成，不管成功失败，返回 [{status, value/reason}]
await Promise.allSettled([p1, p2, p3]);

// any：第一个成功的值，全部失败才失败（AggregateError）
await Promise.any([p1, p2, p3]);
\`\`\`

| 组合器 | 对应 Python | 行为 |
|--------|-------------|------|
| Promise.all | asyncio.gather | 全部成功 |
| Promise.race | asyncio.wait(FIRST_COMPLETED) | 第一个完成 |
| Promise.allSettled | gather(return_exceptions=True) | 全部结束 |
| Promise.any | 无原生对应 | 第一个成功 |

## 三、async/await 时代

ES2017 引入 async/await，本质是 Promise 的语法糖：

\`\`\`javascript
async function readAll() {
    try {
        const a = await fs.promises.readFile("a.txt");
        const b = await fs.promises.readFile("b.txt");
        const c = await fs.promises.readFile("c.txt");
        console.log(a + b + c);  // 终于像同步代码了
    } catch (err) {
        console.error(err);
    }
}
\`\`\`

async/await 让异步代码**看起来像同步**，控制流（if/for/try-catch）都能正常用。这是异步编程的"终极形态"，Python 的 async/await（2015）比 JS 早两年。

## 四、Node.js 事件循环的 6 个阶段

Node.js 事件循环由 libuv 实现，每轮（tick）按顺序经过 6 个阶段：

\`\`\`
┌───────────────────────────┐
│   timers                  │  1. 执行 setTimeout/setInterval 到期回调
├───────────────────────────┤
│   pending callbacks       │  2. 系统级回调（TCP errno 等）
├───────────────────────────┤
│   idle, prepare           │  3. 内部使用
├───────────────────────────┤
│   poll                    │  4. I/O 事件（最关键，阻塞等 I/O）
├───────────────────────────┤
│   check                   │  5. setImmediate 回调
├───────────────────────────┤
│   close callbacks         │  6. close 事件（socket.on('close')）
└───────────────────────────┘
\`\`\`

每个阶段有自己的回调队列，当前阶段队列清空后进入下一阶段。**微任务（microtask）在每个阶段切换之间清空**。

### 1. timers 阶段

执行到期的 \`setTimeout\` / \`setInterval\` 回调。注意 timers 是"不早于指定时间"执行——如果前面的 poll 阶段阻塞了，会延迟。

### 2. poll 阶段

最重要的阶段：用 epoll/kqueue/IOCP 等待 I/O 事件，执行就绪的 I/O 回调。如果没有定时器到期且没有 I/O 回调，会在这里阻塞（等待事件）。

### 3. check 阶段

执行 \`setImmediate\` 回调。setImmediate 比 setTimeout(0) 更"立即"，因为它在当前 tick 的 check 阶段执行，而 setTimeout 至少要下一 tick 的 timers 阶段。

## 五、微任务 vs 宏任务

JS 把回调分两类：

| 类型 | 例子 | 执行时机 |
|------|------|----------|
| 宏任务（macrotask） | setTimeout、setInterval、setImmediate、I/O | 每个阶段队列 |
| 微任务（microtask） | Promise.then、queueMicrotask、process.nextTick | 每个宏任务后、阶段切换前 |

\`\`\`javascript
console.log("1");
setTimeout(() => console.log("5"));        // 宏任务
setImmediate(() => console.log("6"));      // 宏任务
Promise.resolve().then(() => console.log("3"));  // 微任务
queueMicrotask(() => console.log("4"));    // 微任务
process.nextTick(() => console.log("2"));  // nextTick（比微任务还优先）
console.log("1.5");
// 输出：1 → 1.5 → 2 → 3 → 4 → 5/6（5和6顺序不定）
\`\`\`

### process.nextTick vs queueMicrotask vs setImmediate

\`\`\`javascript
// 优先级：nextTick > 微任务 > setImmediate
process.nextTick(() => console.log("nextTick"));    // 最优先
queueMicrotask(() => console.log("microtask"));     // 次优先
setImmediate(() => console.log("immediate"));       // 下一阶段
\`\`\`

- **process.nextTick**：Node.js 特有，在微任务之前执行，滥用会饿死 I/O。
- **queueMicrotask**：标准微任务，和 Promise.then 同级。
- **setImmediate**：宏任务，在 check 阶段执行。

## 六、libuv 实现

Node.js 事件循环由 libuv（C 库）驱动，和 Python uvloop 用的是同一个底层：

\`\`\`c
// libuv 主循环（简化）
int uv_run(uv_loop_t* loop, uv_run_mode mode) {
    while (/* 还有活跃 handle */) {
        uv__update_time(loop);
        uv__run_timers(loop);          // timers 阶段
        uv__run_pending(loop);         // pending callbacks
        uv__run_idle(loop);            // idle
        uv__run_prepare(loop);         // prepare
        uv__io_poll(loop, timeout);    // poll 阶段（epoll_wait）
        uv__run_check(loop);           // check 阶段
        uv__run_closing_handles(loop); // close callbacks
    }
}
\`\`\`

libuv 还维护一个**线程池**（默认 4 线程）处理无法异步的 I/O（如文件系统操作在 Linux 上无真异步，靠线程池模拟）：

\`\`\`javascript
// fs.readFile 内部用线程池
// UV_THREADPOOL_SIZE=8 node server.js  可调整
\`\`\`

## 七、对比 Python asyncio 的事件循环

两套事件循环设计哲学相似（单线程 + 多路复用 I/O），但实现细节差异明显：

| 维度 | Python asyncio | Node.js |
|------|----------------|---------|
| 实现 | Python（uvloop 用 libuv） | libuv 原生 |
| 阶段划分 | 单一就绪队列 | 6 阶段 |
| 微任务 | 无明确概念 | Promise.then / queueMicrotask |
| 立即调度 | call_soon | setImmediate / process.nextTick |
| 默认 I/O | 同步阻塞 API 多 | 全部异步 |
| 线程池 | run_in_executor | libuv 内置 4 线程 |
| 启动方式 | asyncio.run 显式 | 自动运行 |

### 关键差异：微任务模型

JS 有明确的"微任务"概念——每个宏任务后清空所有微任务。这意味着：

\`\`\`javascript
async function f() {
    console.log("A");
    await Promise.resolve();
    console.log("C");  // 这个在微任务执行
}
console.log("start");
f();  // 输出 A，然后 await 让出
console.log("B");
// 输出：start → A → B → C
\`\`\`

Python asyncio **没有微任务**——每个 await 让出后，控制权回到事件循环，其他 Task 才有机会跑：

\`\`\`python
async def f():
    print("A")
    await asyncio.sleep(0)  # 让出，让其他 Task 跑
    print("C")

async def main():
    task = asyncio.create_task(f())
    print("B")  # 这里在 create_task 后立即执行
    await task

# 输出：A → B → C（和 JS 类似，但机制不同）
\`\`\`

Python 用 \`asyncio.sleep(0)\` 模拟"让出一次"，相当于 JS 的 \`await Promise.resolve()\`，但底层是事件循环调度，不是微任务队列。

## 八、错误处理对比

\`\`\`javascript
// JS：try-catch 自动 unwrap Promise rejection
async function f() {
    try {
        const data = await fetch(url);
    } catch (err) {
        // fetch 失败会到这里
    }
}
\`\`\`

\`\`\`python
# Python：同样 try-catch
async def f():
    try:
        data = await aiohttp.get(url)
    except Exception as err:
        # 异常会到这里
\`\`\`

两边的 try-catch 语义一致，这是 async/await 设计的成功之处。

## 九、本章总结

- **演进**：回调地狱（嵌套深）→ Promise（链式）→ async/await（像同步），三代解决同一问题。
- **Promise 组合器**：all（全成功）、race（第一个）、allSettled（全结束）、any（第一个成功）。
- **事件循环 6 阶段**：timers → pending → idle → poll → check → close，每阶段切换清微任务。
- **微任务 vs 宏任务**：微任务（Promise/nextTick）优先于宏任务（setTimeout/setImmediate）。
- **libuv**：Node.js 和 uvloop 共用底层，libuv 还有 4 线程池模拟同步 I/O 异步化。
- **vs asyncio**：JS 有明确微任务模型，Python 用事件循环调度模拟；JS 默认全异步，Python 要选异步库。

下一章看 Node.js 怎么用 Worker Threads 处理 CPU 密集任务，对比 Python multiprocessing。`,
  },
  {
    id: "pyvsjs-workers",
    icon: "👷",
    title: "Node.js Worker Threads",
    group: "并发与异步",
    content: `# Node.js Worker Threads

Node.js 默认单线程，CPU 密集任务会卡死事件循环。Worker Threads（Node.js 10+）是官方的"多线程"方案，这一章深入它的用法、通信机制，并和 Python multiprocessing 对比。

## 一、为什么 Node.js 需要 Worker Threads

单线程事件循环对 I/O 友好，但 CPU 密集任务是致命伤：

\`\`\`javascript
// 主线程跑 CPU 密集任务，事件循环直接卡死
function heavy() {
    let sum = 0;
    for (let i = 0; i < 1e10; i++) sum += i;
    return sum;
}
heavy();  // 这几秒内，所有请求、定时器、I/O 回调全部阻塞
\`\`\`

Python 也有同样问题（虽然原因不同——GIL），解决思路都是"把 CPU 任务移出主线程"。Python 用 multiprocessing，Node.js 用 worker_threads。

## 二、worker_threads 基础

### 1. 创建 Worker

\`\`\`javascript
const { Worker } = require("worker_threads");

// 方式一：从文件加载
const worker = new Worker("./worker.js", { workerData: { n: 1e9 } });

// 方式二：内联代码
const worker2 = new Worker(\`
  const { parentPort, workerData } = require("worker_threads");
  let sum = 0;
  for (let i = 0; i < workerData.n; i++) sum += i;
  parentPort.postMessage(sum);
\`, { eval: true, workerData: { n: 1e9 } });

worker.on("message", (result) => console.log("结果:", result));
worker.on("error", (err) => console.error("错误:", err));
worker.on("exit", (code) => console.log("退出:", code));
\`\`\`

### 2. worker.js

\`\`\`javascript
const { parentPort, workerData } = require("worker_threads");

// 接收主线程数据
const { n } = workerData;

// 计算
let sum = 0;
for (let i = 0; i < n; i++) sum += i;

// 发送结果
parentPort.postMessage({ sum });

// 监听主线程消息
parentPort.on("message", (msg) => {
    console.log("主线程说:", msg);
});
\`\`\`

每个 Worker 是**真正的 OS 线程**，有独立的 V8 实例、事件循环和内存堆——和主线程完全隔离。

## 三、通信机制

### 1. postMessage（结构化克隆）

默认通信方式，数据通过**结构化克隆算法**复制传递：

\`\`\`javascript
// 主线程
worker.postMessage({ data: [1, 2, 3] });

// Worker
parentPort.on("message", (msg) => {
    console.log(msg.data);  // 收到的是副本，不是引用
});
\`\`\`

结构化克隆支持对象、数组、Map、Set、ArrayBuffer 等，但**不支持函数、DOM 节点、Class 实例**。大对象复制开销大。

### 2. MessageChannel（双向通信）

\`\`\`javascript
const { Worker, MessageChannel } = require("worker_threads");

const { port1, port2 } = new MessageChannel();
const worker = new Worker("./worker.js");

// 把一端传给 Worker
worker.postMessage({ port: port2 }, [port2]);  // 转移所有权

// 主线程用 port1
port1.on("message", (msg) => console.log("Worker:", msg));
port1.postMessage("hello");
\`\`\`

\`[port2]\` 是"转移列表"，把 ArrayBuffer/MessagePort 的所有权转移给对方，避免拷贝。

### 3. SharedArrayBuffer（真共享内存）

\`\`\`javascript
const { Worker } = require("worker_threads");

// 创建共享内存
const shared = new SharedArrayBuffer(1024);  // 1KB
const buffer = new Int32Array(shared);

const worker = new Worker("./worker.js", { workerData: shared });

// 主线程和 Worker 看到的是同一块内存
buffer[0] = 42;
worker.postMessage("update");
\`\`\`

\`\`\`javascript
// worker.js
const { parentPort, workerData } = require("worker_threads");
const buffer = new Int32Array(workerData);

parentPort.on("message", () => {
    buffer[0] = 100;  // 直接改，主线程能看到
    parentPort.postMessage("done");
});
\`\`\`

SharedArrayBuffer 是**真正的共享内存**，零拷贝。但多线程同时读写会竞态，必须用 **Atomics** API 保证原子性。

## 四、Atomics API

\`\`\`javascript
const shared = new SharedArrayBuffer(4);
const view = new Int32Array(shared);

// 原子操作，线程安全
Atomics.store(view, 0, 42);       // 原子写
const v = Atomics.load(view, 0);  // 原子读
Atomics.add(view, 0, 1);          // 原子加
Atomics.compareExchange(view, 0, 42, 100);  // CAS

// 等待 + 通知（线程间同步）
Atomics.wait(view, 0, 0);  // 如果 view[0] === 0，阻塞等待
Atomics.notify(view, 0, 1);  // 唤醒 1 个等待者
\`\`\`

Atomics 实现经典的"生产者-消费者"：

\`\`\`javascript
// 主线程：生产者
const shared = new SharedArrayBuffer(4);
const flag = new Int32Array(shared);
const worker = new Worker("./worker.js", { workerData: shared });

setTimeout(() => {
    Atomics.store(flag, 0, 1);
    Atomics.notify(flag, 0);  // 唤醒 Worker
}, 1000);
\`\`\`

\`\`\`javascript
// worker.js：消费者
const { parentPort, workerData } = require("worker_threads");
const flag = new Int32Array(workerData);

Atomics.wait(flag, 0, 0);  // 等 flag 变成非 0
console.log("收到通知:", flag[0]);
\`\`\`

## 五、cluster 模块 vs worker_threads

Node.js 有两个"多进程/多线程"方案：

| 维度 | cluster | worker_threads |
|------|---------|----------------|
| 单位 | 进程 | 线程 |
| 共享内存 | ❌ | ✅（SharedArrayBuffer） |
| 通信 | IPC（序列化） | postMessage / 共享内存 |
| 典型用途 | Web 服务器多核扩展 | CPU 密集任务 |
| 开销 | 高（进程） | 中（线程） |

\`\`\`javascript
// cluster：开 N 个进程跑同一个 HTTP 服务
const cluster = require("cluster");
const os = require("os");

if (cluster.isPrimary) {
    for (let i = 0; i < os.cpus().length; i++) cluster.fork();
} else {
    require("http").createServer((req, res) => res.end("hi")).listen(3000);
}

// worker_threads：主线程接请求，Worker 算
const { Worker } = require("worker_threads");
http.createServer((req, res) => {
    const worker = new Worker("./compute.js");
    worker.on("message", (result) => res.end(String(result)));
});
\`\`\`

实际生产：**cluster 做多核负载均衡，worker_threads 处理单请求内的 CPU 密集计算**，两者互补。

## 六、对比 Python multiprocessing

两个方案目标相似（让 CPU 密集任务不阻塞主流程），但实现差异大：

| 维度 | Node.js worker_threads | Python multiprocessing |
|------|------------------------|------------------------|
| 单位 | 线程（OS 线程） | 进程 |
| 共享内存 | SharedArrayBuffer | Value/Array/shared_memory |
| 通信 | postMessage（结构化克隆） | Queue/Pipe（pickle 序列化） |
| 创建开销 | 中（线程 + V8 实例） | 高（进程 + 解释器） |
| GIL/锁 | 无（V8 实例隔离） | 各进程独立 GIL |
| 主线程影响 | 主线程事件循环独立 | 主进程独立 |
| 典型场景 | CPU 任务 + I/O 服务混用 | 纯 CPU 并行计算 |

### 关键差异：进程 vs 线程

\`\`\`python
# Python multiprocessing：进程隔离，崩溃不影响主进程
from multiprocessing import Process

def worker():
    raise Exception("崩了")  # Worker 进程崩，主进程没事

p = Process(target=worker)
p.start(); p.join()  # 主进程继续跑
\`\`\`

\`\`\`javascript
// Node.js worker_threads：线程，但 V8 隔离，崩溃也不影响主线程
const { Worker } = require("worker_threads");
const worker = new Worker("./worker.js");
worker.on("error", (err) => console.error("Worker 崩了:", err));
// 主线程继续跑
\`\`\`

两者都是"隔离的执行单元"，崩溃不传染。但 Python 进程开销更大（独立解释器+库），Node.js Worker 是线程但 V8 实例也重，**实际开销两者接近**。

### 通信对比

\`\`\`python
# Python：Queue 用 pickle 序列化，大对象慢
from multiprocessing import Queue
q = Queue()
q.put({"big": [0] * 1000000})  # 序列化 + 反序列化

# shared_memory：真共享，零拷贝
from multiprocessing import shared_memory
shm = shared_memory.SharedMemory(create=True, size=1024)
\`\`\`

\`\`\`javascript
// Node.js：postMessage 用结构化克隆，大对象慢
worker.postMessage({ big: new Array(1000000).fill(0) });

// SharedArrayBuffer：真共享，零拷贝
const shared = new SharedArrayBuffer(1024);
\`\`\`

两边都是"消息传递慢，共享内存快"的权衡，API 设计惊人相似。

## 七、实战：CPU 密集 Web 服务

场景：HTTP 服务接收请求，每个请求要算 1 秒的 CPU 任务。

### Node.js 方案

\`\`\`javascript
const http = require("http");
const { Worker } = require("worker_threads");

const workerPool = [];  // 预创建 Worker 池
for (let i = 0; i < 4; i++) {
    workerPool.push(new Worker("./compute.js"));
}

http.createServer((req, res) => {
    const worker = workerPool.pop();
    worker.once("message", (result) => {
        res.end(String(result));
        workerPool.push(worker);  // 归还
    });
}).listen(3000);
// 主线程不阻塞，能继续接请求
\`\`\`

### Python 方案

\`\`\`python
from concurrent.futures import ProcessPoolExecutor
from fastapi import FastAPI

app = FastAPI()
pool = ProcessPoolExecutor(4)

def compute(n):
    return sum(i ** 0.5 for i in range(n))

@app.get("/")
async def handler():
    loop = __import__("asyncio").get_running_loop()
    result = await loop.run_in_executor(pool, compute, 10**7)
    return {"result": result}
# 主进程事件循环不阻塞，CPU 任务在子进程跑
\`\`\`

两者思路一致：**主线程/进程跑 I/O，CPU 任务丢给 Worker/子进程**。Python 的 \`run_in_executor\` 把进程池无缝接入 asyncio，是相当优雅的设计。

## 八、本章总结

- **Worker Threads**：Node.js 的多线程方案，每个 Worker 是独立 V8 实例的 OS 线程，处理 CPU 密集任务。
- **通信**：postMessage（结构化克隆，慢）vs SharedArrayBuffer（真共享，零拷贝）。
- **Atomics**：SharedArrayBuffer 上的原子操作，实现线程安全 + wait/notify 同步。
- **cluster vs worker_threads**：cluster 多进程做负载均衡，worker_threads 多线程做 CPU 计算，互补。
- **vs multiprocessing**：进程 vs 线程，但都是隔离执行单元；通信都是"消息慢、共享内存快"。
- **实战模式**：主线程跑 I/O 事件循环 + Worker 池跑 CPU 任务，Python 用 run_in_executor 无缝接入 asyncio。

至此，并发与异步部分完结。Python 和 JavaScript 的并发模型虽然实现不同（Python 多套 API、JS 默认异步），但核心理念殊途同归：**用事件循环处理 I/O 并发，用隔离执行单元处理 CPU 并行**。理解了这一点，两门语言的并发代码就能融会贯通。`,
  },
];
