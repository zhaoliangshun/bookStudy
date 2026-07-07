// =============================================================
// Python vs Java 深度对比 —— 第 5 批
// -------------------------------------------------------------
// 转义规则：content 内部反引号写作 \`，${ 写作 \$\{
// =============================================================

export const chapters = [
  {
    id: "pyvsjava-concurrency-overview",
    icon: "🌀",
    title: "并发模型总览",
    group: "并发与异步",
    content: `# 并发模型总览

## 一、为什么并发这么难

并发是编程世界里"难度天花板"——它把原本线性的代码执行顺序打乱，引入了"同时发生"的概念。一旦多个执行流开始共享状态，bug 就从"必现"变成"偶现"，从"本地能复现"变成"只在生产环境凌晨三点出现"。

Python 和 Java 都提供了完整的并发工具链，但它们的底层模型差异巨大，这源于一个核心事实：**Python 有 GIL，Java 没有**。这一句话几乎解释了两门语言在并发领域所有的设计分歧。

本章是"并发与异步"分组的开篇，我们将从最基本的概念开始，建立一张全景图。后续章节（GIL、线程与锁、多进程、asyncio、java.util.concurrent）会逐个深入。

## 二、并发 vs 并行：先分清这两个概念

很多人混用"并发（concurrency）"和"并行（parallelism）"，但它们是不同的东西。

- **并发（Concurrency）**：程序**结构**上能处理多个任务。任务可以在同一时刻"被推进"，但不一定"同时执行"。比如一个 CPU 单核通过时间片轮转，让多个任务交替前进——这是并发不是并行。
- **并行（Parallelism）**：程序**执行**上真的同时跑多个任务。需要多核 CPU 或多台机器，每个核独立跑一个任务。

Rob Pike（Go 语言之父）的名言：**并发是关于"处理"很多事情，并行是关于"做"很多事情**。

\`\`\`
单核 CPU：
  并发 ✓（时间片轮转）  并行 ✗（只有一个核）

多核 CPU：
  并发 ✓                 并行 ✓（多核同时跑）
\`\`\`

### 一个通俗的比喻

- **并发**：一个厨师同时做三道菜——炒菜时等油热，趁机切葱花，葱花切完回来翻锅。一个厨师在多个任务间切换。
- **并行**：三个厨师同时做三道菜——每个厨师独立做一道。真正的物理同时。

Python 和 Java 都支持并发和并行，但实现路径不同：

| 维度 | Python | Java |
|------|--------|------|
| 并发（单核轮转） | threading、asyncio | Thread、CompletableFuture |
| 并行（多核同时） | multiprocessing（绕开 GIL） | Thread、ForkJoinPool、parallelStream |
| 单核 IO 密集 | asyncio 最优 | 虚拟线程 / NIO / 反应式 |
| 多核 CPU 密集 | multiprocessing | 多线程（无 GIL 阻碍）|

## 三、Python 的三种并发方式

Python 提供了三条独立的并发路径，各有适用场景：

### 1. 多线程（threading）

\`\`\`python
import threading
import time

def worker(name, n):
    for i in range(n):
        print(f"{name}: {i}")
        time.sleep(0.1)

t1 = threading.Thread(target=worker, args=("A", 5))
t2 = threading.Thread(target=worker, args=("B", 5))
t1.start(); t2.start()
t1.join(); t2.join()
print("done")
\`\`\`

多线程在 Python 里**不能利用多核 CPU**（因为 GIL），但**适合 IO 密集任务**（网络请求、文件读写时 GIL 会释放）。

### 2. 多进程（multiprocessing）

\`\`\`python
from multiprocessing import Process
import os

def worker(name):
    print(f"{name} in PID {os.getpid()}")

if __name__ == "__main__":
    p1 = Process(target=worker, args=("A",))
    p2 = Process(target=worker, args=("B",))
    p1.start(); p2.start()
    p1.join(); p2.join()
\`\`\`

每个进程有独立的 Python 解释器和 GIL，所以**多进程能真正利用多核**——这是 Python 跑 CPU 密集任务并行的**唯一原生方案**。代价是进程开销大（启动慢、内存占用高、IPC 麻烦）。

### 3. 异步 IO（asyncio）

\`\`\`python
import asyncio

async def worker(name, n):
    for i in range(n):
        print(f"{name}: {i}")
        await asyncio.sleep(0.1)

async def main():
    await asyncio.gather(worker("A", 5), worker("B", 5))

asyncio.run(main())
\`\`\`

asyncio 用**单线程 + 事件循环**实现高并发 IO——一个线程能同时"挂起"成千上万个协程，等 IO 完成后恢复。它不是并行（只用一个核），但是极高吞吐的并发。

### Python 三种方式对比

| 方式 | 利用多核？ | 适合场景 | 开销 | 编程模型 |
|------|-----------|---------|------|---------|
| threading | ✗（GIL） | IO 密集 | 中（OS 线程） | 抢占式 |
| multiprocessing | ✓ | CPU 密集 | 高（独立进程） | 抢占式 |
| asyncio | ✗（单线程） | 超高并发 IO | 低（协程） | 协作式 |

## 四、Java 的三种并发方式

Java 没有类似 GIL 的全局锁，所以**多线程本身就是真并行**——这是 Java 相对 Python 最大的并发优势。

### 1. 多线程（Thread / Runnable / Callable）

\`\`\`java
public class Worker implements Runnable {
    private final String name;
    public Worker(String name) { this.name = name; }
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(name + ": " + i);
            try { Thread.sleep(100); } catch (InterruptedException e) {}
        }
    }
    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(new Worker("A"));
        Thread t2 = new Thread(new Worker("B"));
        t1.start(); t2.start();
        t1.join(); t2.join();
        System.out.println("done");
    }
}
\`\`\`

Java 的 \`Thread\` 直接映射到操作系统线程（1:1 模型），多核 CPU 上多个线程能真正并行执行。

### 2. ForkJoinPool / parallelStream

\`\`\`java
import java.util.concurrent.*;
import java.util.stream.*;

// parallelStream：内部用 ForkJoinPool
long sum = LongStream.range(0, 10_000_000L)
    .parallel()
    .map(x -> x * x)
    .sum();

// 显式 ForkJoinPool
ForkJoinPool pool = new ForkJoinPool(8);
long result = pool.submit(() ->
    LongStream.range(0, 1_000_000L).parallel().sum()
).get();
\`\`\`

ForkJoinPool 是 Java 7 引入的"分治并行"框架，工作窃取算法（work-stealing）让空闲线程偷别人的任务，提高 CPU 利用率。\`parallelStream\` 是它的语法糖。

### 3. CompletableFuture / 反应式

\`\`\`java
import java.util.concurrent.*;

CompletableFuture<String> f1 = CompletableFuture.supplyAsync(() -> {
    // 异步任务 1
    return "result1";
});
CompletableFuture<String> f2 = CompletableFuture.supplyAsync(() -> "result2");

// 链式编排
f1.thenCombine(f2, (a, b) -> a + "+" + b)
  .thenAccept(System.out::println);

// 反应式（Reactor）
// Flux<String> flux = Flux.just("a", "b", "c").map(String::toUpperCase);
\`\`\`

CompletableFuture 是 Java 8 引入的异步编排工具，类似 JavaScript 的 Promise。更激进的是反应式流（Reactor、RxJava），用"流"模型处理异步数据，但学习曲线陡峭。

### Java 三种方式对比

| 方式 | 利用多核？ | 适合场景 | 开销 | 编程模型 |
|------|-----------|---------|------|---------|
| Thread/ExecutorService | ✓ | 通用 | 中（OS 线程）| 抢占式 |
| ForkJoinPool/parallelStream | ✓ | CPU 密集（分治）| 中 | 分治 |
| CompletableFuture/反应式 | ✓ | 异步编排、IO | 低（基于线程池）| 链式/流 |
| 虚拟线程（Java 21+）| ✓ | 高并发 IO | 极低 | 同步风格写异步 |

## 五、CPU 密集 vs IO 密集：选型第一原则

并发选型的第一个问题永远是：**你的任务是 CPU 密集还是 IO 密集？**

### CPU 密集任务

特征：CPU 一直在算，几乎不等待。比如数值计算、加密、压缩、图像处理。

- **Python**：**必须用 multiprocessing**。因为 GIL 让多线程跑 CPU 任务不仅不能并行，反而因线程切换更慢。
- **Java**：**用多线程或 ForkJoinPool**。Java 无 GIL，多线程直接并行。

\`\`\`python
# Python：CPU 密集必须多进程
from multiprocessing import Pool
import math

def cpu_task(n):
    return sum(math.factorial(i) for i in range(1000))

if __name__ == "__main__":
    with Pool(8) as p:
        results = p.map(cpu_task, range(100))  # 8 核真并行
\`\`\`

\`\`\`java
// Java：CPU 密集用 parallelStream
long sum = IntStream.range(0, 100).parallel()
    .mapToLong(i -> {
        long s = 0;
        for (int j = 0; j < 1000; j++) s += factorial(j);
        return s;
    }).sum();
\`\`\`

### IO 密集任务

特征：CPU 大部分时间在等——等网络、等磁盘、等数据库。比如 HTTP 服务、爬虫、数据库查询。

- **Python**：**asyncio 最优**（单线程高并发），或 threading（简单场景）。
- **Java**：**虚拟线程（Java 21+）最优**，或 CompletableFuture、反应式。

\`\`\`python
# Python：asyncio 处理 1000 个 HTTP 请求
import asyncio
import aiohttp

async def fetch(session, url):
    async with session.get(url) as resp:
        return await resp.text()

async def main():
    urls = [f"https://api.example.com/{i}" for i in range(1000)]
    async with aiohttp.ClientSession() as session:
        results = await asyncio.gather(*[fetch(session, u) for u in urls])

asyncio.run(main())
\`\`\`

\`\`\`java
// Java 21：虚拟线程，同步风格写高并发
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<String>> futures = new ArrayList<>();
    for (int i = 0; i < 1000; i++) {
        final int idx = i;
        futures.add(executor.submit(() -> fetch("https://api.example.com/" + idx)));
    }
    for (var f : futures) System.out.println(f.get());
}
\`\`\`

## 六、Python GIL vs Java 无 GIL：根本分歧

### 什么是 GIL

GIL（Global Interpreter Lock，全局解释器锁）是 CPython 实现的一个**互斥锁**，它保证**同一时刻只有一个线程在执行 Python 字节码**。这不是 Python 语言规范的要求，而是 CPython 实现的妥协——为了让引用计数式 GC 在多线程下安全。

### GIL 的影响

\`\`\`python
# Python：多线程跑 CPU 任务，比单线程还慢
import threading, time

def count(n):
    while n > 0:
        n -= 1

start = time.time()
t1 = threading.Thread(target=count, args=(10**8,))
t2 = threading.Thread(target=count, args=(10**8,))
t1.start(); t2.start(); t1.join(); t2.join()
print(f"双线程: {time.time()-start:.2f}s")  # ~6s

start = time.time()
count(10**8); count(10**8)
print(f"单线程: {time.time()-start:.2f}s")  # ~5s（更快！）
\`\`\`

同样的逻辑在 Java 上：

\`\`\`java
// Java：双线程真并行，比单线程快接近一倍
public class Count implements Runnable {
    static long N = 100_000_000L;
    public void run() { long n = N; while (n > 0) n--; }
    public static void main(String[] args) throws Exception {
        long start = System.currentTimeMillis();
        Thread t1 = new Thread(new Count());
        Thread t2 = new Thread(new Count());
        t1.start(); t2.start(); t1.join(); t2.join();
        System.out.println("双线程: " + (System.currentTimeMillis()-start) + "ms");
    }
}
\`\`\`

### 为什么 Python 有 GIL

GIL 存在的核心原因：**CPython 用引用计数做内存管理**。每个对象的引用计数（\`ob_refcnt\`）在多线程下会被多个线程同时修改，如果不加锁就会出竞态。最简单的方案是加一把全局锁——GIL。

C 扩展生态也是 GIL 难以移除的原因——大量 C 扩展依赖 GIL 保证线程安全，移除 GIL 会让它们全部变成不安全代码。

### 为什么 Java 不需要 GIL

JVM 的 GC **不用引用计数**（用分代追踪式 GC），所以对象引用不需要全局锁。Java 对象的内存布局和访问模型从设计之初就考虑了多线程，每个对象头有 Mark Word 支持 \`synchronized\` 锁，但这是**对象级**的细粒度锁，不是全局锁。

| 维度 | Python (CPython) | Java (JVM) |
|------|------------------|------------|
| 全局锁 | 有 GIL | 无 |
| GC 机制 | 引用计数为主 + 分代 | 分代追踪 |
| 多线程 CPU 并行 | 不行 | 可以 |
| C/C++ 扩展依赖 GIL | 是 | 否（JNI 独立）|
| 移除难度 | 极高（PEP 703 实验）| 不存在此问题 |

## 七、并发模型对比图

下面这张图概括了 Python 和 Java 的并发全景：

\`\`\`
                ┌─────────────────────────────────────────┐
                │            并发模型全景                  │
                └─────────────────────────────────────────┘

   Python                                       Java
   ┌──────────────────────┐                    ┌─────────────────────────┐
   │ threading            │  IO 密集           │ Thread/ExecutorService  │
   │  (受 GIL 限制)        │                    │  (无 GIL，真并行)        │
   ├──────────────────────┤                    ├─────────────────────────┤
   │ multiprocessing      │  CPU 密集          │ ForkJoinPool            │
   │  (绕开 GIL 真并行)    │                    │  parallelStream         │
   ├──────────────────────┤                    ├─────────────────────────┤
   │ asyncio              │  超高并发 IO       │ CompletableFuture       │
   │  (单线程事件循环)     │                    │ Reactor/RxJava (反应式) │
   │                      │                    │ Virtual Thread (Java21) │
   └──────────────────────┘                    └─────────────────────────┘

        GIL 是 Python 的天花板                  JVM 无此限制
\`\`\`

## 八、并发安全：两门语言的共同战场

无论 Python 还是 Java，只要多个线程/协程**共享可变状态**，就有并发安全问题。

\`\`\`python
# Python：threading 也有竞态（GIL 不能保证复合操作原子）
import threading
counter = 0
def increment():
    global counter
    for _ in range(100000):
        counter += 1   # 非原子，read-modify-write

t1 = threading.Thread(target=increment)
t2 = threading.Thread(target=increment)
t1.start(); t2.start(); t1.join(); t2.join()
print(counter)  # 不是 200000，是某个中间值
\`\`\`

\`\`\`java
// Java：同样的竞态
public class Counter {
    static int counter = 0;
    public static void main(String[] args) throws Exception {
        Runnable r = () -> { for (int i = 0; i < 100000; i++) counter++; };
        Thread t1 = new Thread(r), t2 = new Thread(r);
        t1.start(); t2.start(); t1.join(); t2.join();
        System.out.println(counter);  // 不是 200000
    }
}
\`\`\`

注意：**Python 的 GIL 并不能消除上面的竞态**。\`counter += 1\` 在字节码层面是 \`LOAD\` / \`ADD\` / \`STORE\` 三步，GIL 会在字节码之间释放，所以两个线程可能读到相同的 \`counter\` 值再各自加 1，丢失一次更新。

解决方式两门语言都一样：用锁。

\`\`\`python
lock = threading.Lock()
def increment():
    global counter
    for _ in range(100000):
        with lock:
            counter += 1   # 现在安全
\`\`\`

\`\`\`java
Lock lock = new ReentrantLock();
Runnable r = () -> {
    for (int i = 0; i < 100000; i++) {
        lock.lock();
        try { counter++; } finally { lock.unlock(); }
    }
};
\`\`\`

或者用 \`synchronized\`：

\`\`\`java
public synchronized void increment() { counter++; }
\`\`\`

## 九、选型决策树

最后给一个实战的选型决策树：

\`\`\`
你的任务是？
│
├─ CPU 密集
│   ├─ Python → multiprocessing / ProcessPoolExecutor
│   └─ Java   → Thread + ExecutorService / parallelStream / ForkJoinPool
│
├─ IO 密集
│   ├─ Python
│   │   ├─ 超高并发（>1000 连接）→ asyncio
│   │   └─ 中低并发 → threading
│   └─ Java
│       ├─ Java 21+ → Virtual Thread（推荐）
│       ├─ Java 8-17 → CompletableFuture + 线程池
│       └─ 反应式需求 → Reactor/RxJava
│
└─ 混合（CPU + IO）
    ├─ Python → multiprocessing 跑 CPU，asyncio 跑 IO，分开
    └─ Java   → 一个 ExecutorService 即可（多线程通吃）
\`\`\`

## 十、一句话总结

**Python 受 GIL 限制，多线程只能并发不能并行，CPU 密集必须靠多进程；Java 无 GIL，多线程天然并行，但 IO 高并发需要虚拟线程或反应式来应对。** 下一章我们将深入剖析 GIL 的工作原理，以及 JVM 的线程模型如何避开这个全局锁的诅咒。

---

> **下一章**：进入 GIL vs JVM 线程模型——为什么 Python 有这把让所有线程串行化的"全局锁"，而 Java 没有？PEP 703 和 Project Loom 又将如何改写这场博弈？`,
  },
  {
    id: "pyvsjava-gil-vs-jvm",
    icon: "🔒",
    title: "GIL vs JVM 线程模型",
    group: "并发与异步",
    content: `# GIL vs JVM 线程模型

## 一、GIL 是什么

GIL（Global Interpreter Lock，全局解释器锁）是 **CPython** 实现中的一把**互斥锁**。它的作用是：**保证同一时刻只有一个操作系统线程在执行 Python 字节码**。

注意三个关键词：
1. **CPython**——这是实现细节，不是 Python 语言规范的要求。PyPy、Jython、IronPython 都没有 GIL。但 CPython 是绝对主流（99% 的 Python 用户用 CPython），所以"GIL 是 Python 的问题"几乎成立。
2. **互斥锁**——一把全局的、跨所有线程的锁。
3. **Python 字节码**——只锁 Python 字节码执行，C 扩展可以释放 GIL 后并行执行。

### 一个简单的演示

\`\`\`python
import threading, time

def busy_loop():
    while True:
        pass  # 纯 CPU 死循环

# 启动 2 个线程跑死循环
t1 = threading.Thread(target=busy_loop)
t2 = threading.Thread(target=busy_loop)
t1.start(); t2.start()
\`\`\`

在双核 CPU 上跑这段代码，你会看到：**两个核都没跑满**——每个核大约 50%。因为 GIL 让两个线程轮流持锁，一个跑一会儿就交出 GIL，另一个才能跑。

同样代码在 Java 上：

\`\`\`java
public class BusyLoop implements Runnable {
    public void run() { while (true) {} }
    public static void main(String[] args) {
        new Thread(new BusyLoop()).start();
        new Thread(new BusyLoop()).start();
    }
}
\`\`\`

双核会被打满——两个线程真正并行执行，没有锁阻拦。

## 二、GIL 的工作原理

### 字节码循环中的 GIL

CPython 解释器的主循环大致是：**取字节码 → 执行字节码 → 检查 GIL 是否该让出 → 重复**。

\`\`\`
   ┌──────────────────────────────────────────────────────┐
   │                  CPython 字节码循环                  │
   │                                                       │
   │   线程 A 持有 GIL                                     │
   │   ┌────────────────────────────────────────┐         │
   │   │ 1. 取下一条字节码                       │         │
   │   │ 2. 执行字节码（持有 GIL）              │         │
   │   │ 3. 检查 ticks 计数（默认 100）          │         │
   │   │ 4. 检查是否有线程在等 GIL              │         │
   │   │    ├─ 有 → 释放 GIL，发送信号          │         │
   │   │    └─ 无 → 继续                       │         │
   │   └────────────────────────────────────────┘         │
   │                                                       │
   │   线程 B 被唤醒，获取 GIL，重复上述循环              │
   └──────────────────────────────────────────────────────┘
\`\`\`

历史上 GIL 的切换有两种机制：

- **Python 3.1 之前**：基于 \`sys.setcheckinterval\`，每执行 100 条字节码就强制释放 GIL。问题是 IO 线程可能等很久才拿到 GIL。
- **Python 3.2+**：基于 \`sys.setswitchinterval\`（默认 5ms），改用"等待者信号"机制。持有 GIL 的线程如果发现有线程在等 GIL，会在 5ms 后强制让出。这避免了 CPU 密集线程饿死 IO 线程。

\`\`\`python
import sys
print(sys.getswitchinterval())  # 0.005（5ms）
sys.setswitchinterval(0.001)    # 改为 1ms
\`\`\`

### GIL 的释放时机

GIL 不是全程持有的，CPython 在以下场景会释放 GIL：

1. **IO 操作**：\`read\`/\`write\`/\`recv\`/\`send\` 等系统调用前会释放 GIL，调用结束后重新获取。这就是为什么 IO 密集任务在 Python 多线程下还是有效的。
2. **时间片到期**：每 5ms 强制让出一次。
3. **C 扩展主动释放**：C 扩展可以用 \`Py_BEGIN_ALLOW_THREADS\`/\`Py_END_ALLOW_THREADS\` 宏释放 GIL 跑并行计算（NumPy 的矩阵运算就这么干）。
4. **sleep/lock 等待**：\`time.sleep()\`、\`threading.Lock.acquire()\` 阻塞时释放 GIL。

\`\`\`python
# GIL 在 IO 时释放——这是 threading 对 IO 仍有效的原因
import threading, urllib.request

def fetch(url):
    urllib.request.urlopen(url)  # 这里有系统调用，GIL 释放

# 100 个线程同时发请求，依然能并发（被 IO 等待覆盖）
\`\`\`

## 三、为什么有 GIL

### 原因 1：引用计数的线程安全

CPython 的内存管理核心是**引用计数**。每个 Python 对象头里有个 \`ob_refcnt\` 字段，每次赋值 \`+\`1，每次销毁 \`-\`1，降到 0 立即释放。

\`\`\`c
// CPython 源码（简化）
typedef struct _object {
    Py_ssize_t ob_refcnt;   // 引用计数
    PyTypeObject *ob_type;
} PyObject;

#define Py_INCREF(op) ((op)->ob_refcnt++)
#define Py_DECREF(op) \\
    if (--((op)->ob_refcnt) == 0) { \\
        _Py_Dealloc(op); \\
    }
\`\`\`

如果两个线程同时执行 \`Py_INCREF\`，\`ob_refcnt++\` 在 C 层面是"读-改-写"三步，不是原子操作。最简单的方案是给整个解释器加一把全局锁——GIL。

### 原因 2：C 扩展简化

GIL 让 C 扩展作者**不必关心线程安全**——只要你的 C 代码在执行 Python 字节码，GIL 就保护着你。这是 Python C 扩展生态繁荣的一个隐性原因（也是移除 GIL 的最大阻力）。

### 原因 3：单线程性能

加锁有开销。如果给每个对象单独加细粒度锁，单线程跑也会变慢。GIL 是一种"以多线程性能换单线程性能和实现简洁性"的妥协——在 90 年代单核 CPU 为主的时代，这是合理的。

## 四、GIL 的影响

### 多线程跑 CPU 密集任务比单线程还慢

\`\`\`python
import threading, time

def cpu_bound(n):
    total = 0
    for i in range(n):
        total += i * i
    return total

N = 5 * 10**7

# 单线程
start = time.time()
cpu_bound(N); cpu_bound(N)
print(f"单线程: {time.time()-start:.2f}s")

# 双线程
start = time.time()
t1 = threading.Thread(target=cpu_bound, args=(N,))
t2 = threading.Thread(target=cpu_bound, args=(N,))
t1.start(); t2.start(); t1.join(); t2.join()
print(f"双线程: {time.time()-start:.2f}s")  # 通常更慢
\`\`\`

输出（4 核 Mac）：

\`\`\`
单线程: 6.21s
双线程: 7.84s   ← GIL 让双线程不仅没加速，反而因切换开销变慢
\`\`\`

同样的逻辑在 Java 上：

\`\`\`java
public class CpuBound implements Runnable {
    static final long N = 50_000_000L;
    public void run() {
        long total = 0;
        for (long i = 0; i < N; i++) total += i * i;
    }
    public static void main(String[] args) throws Exception {
        long s = System.currentTimeMillis();
        new CpuBound().run(); new CpuBound().run();
        System.out.println("单线程: " + (System.currentTimeMillis()-s) + "ms");

        s = System.currentTimeMillis();
        Thread t1 = new Thread(new CpuBound());
        Thread t2 = new Thread(new CpuBound());
        t1.start(); t2.start(); t1.join(); t2.join();
        System.out.println("双线程: " + (System.currentTimeMillis()-s) + "ms");
    }
}
\`\`\`

输出（同样机器）：

\`\`\`
单线程: 380ms
双线程: 200ms   ← 真并行，接近一半时间
\`\`\`

注意 Java 本身比 Python 快很多（静态编译、JIT 优化），这里我们关注的是**多线程的加速比**：Java 双线程是单线程的 0.53 倍（接近理论 0.5），Python 双线程反而比单线程慢。

## 五、JVM 线程模型

### 一对一映射 OS 线程

JVM 的 \`java.lang.Thread\` **直接对应一个操作系统线程**（Linux 是 pthread，Windows 是 Win32 Thread）。这就是"1:1 线程模型"。

\`\`\`
   Java 层              JVM 层                OS 层
   ──────              ──────                ──────
   Thread t1  ───→  JVM Thread 结构  ───→  pthread_t
   Thread t2  ───→  JVM Thread 结构  ───→  pthread_t
                                              ↓
                                          内核调度器
                                          (多核并行)
\`\`\`

JVM 没有全局锁，多个线程的字节码可以真正并行执行。每个对象头里的 Mark Word 支持 \`synchronized\` 锁，但这是**对象级细粒度锁**，只锁单个对象，不影响其他对象。

### Thread vs threading.Thread

| 维度 | Python threading.Thread | Java Thread |
|------|------------------------|-------------|
| 底层 | OS 线程（1:1） | OS 线程（1:1） |
| 全局锁 | 受 GIL 限制 | 无 |
| CPU 并行 | 不能 | 能 |
| 创建开销 | 大（OS 线程） | 大（OS 线程）|
| 启动方式 | \`t.start()\` | \`t.start()\` |
| 等待结束 | \`t.join()\` | \`t.join()\` |
| 异常处理 | 直接传播或丢失 | 必须 \`setUncaughtExceptionHandler\` |

注意 Python 的 \`Thread\` 底层也是 OS 线程（不是用户态线程），只是被 GIL 串行化。所以 Python 多线程的**开销和 Java 一样大**，但**只能并发不能并行**——这是 Python 多线程"性价比最差"的地方。

## 六、Python 3.13 PEP 703：可选无 GIL

Python 社区经过多年讨论，PEP 703 提出在 CPython 中**移除 GIL**（称为 free-threaded 模式）。Python 3.13（2024 年 10 月发布）首次提供**实验性**的无 GIL 构建。

### 启用方式

\`\`\`bash
# 安装 free-threaded 版本
python3.13t  # 带 t 后缀表示 free-threaded

# 或在编译时启用
./configure --disable-gil
\`\`\`

### 验证

\`\`\`python
import sysconfig
print(sysconfig.get_config_var("Py_GIL_DISABLED"))  # 1 表示无 GIL
\`\`\`

### 性能对比（PEP 703 测试数据）

\`\`\`
                          有 GIL       无 GIL（单线程）  无 GIL（12 线程）
CPU 密集（纯 Python）       1.0x        0.6x（变慢）      3.5x（真并行）
CPU 密集（NumPy）          1.0x        1.0x              4.2x
IO 密集                    1.0x        1.0x              1.0x
\`\`\`

无 GIL 模式下，**单线程会变慢约 40%**（因为引用计数要改成原子操作或加细粒度锁），但**多线程 CPU 密集能真并行**。这是一个"用单线程性能换多线程并行能力"的妥协。

### 风险

1. **C 扩展兼容性**：依赖 GIL 的 C 扩展会变成不安全代码，需要重新适配。
2. **单线程性能损失**：40% 的单线程变慢对脚本场景影响很大。
3. **生态迁移时间**：估计需要 5-10 年才能让主流库适配。

## 七、Java 虚拟线程（Project Loom，Java 21）

Java 选择了另一条路：**保留 OS 线程模型，但引入"虚拟线程"** 作为轻量级线程。

### 虚拟线程是什么

虚拟线程是 **JVM 管理的用户态线程**，多个虚拟线程映射到少量 OS 线程（称为 carrier thread）上。虚拟线程的创建/切换开销极小（纳秒级），可以创建**数百万个**虚拟线程。

\`\`\`
   普通线程（1:1）              虚拟线程（M:N）
   ─────────────              ─────────────
   Thread 1 ──→ OS Thread 1   VT1 ┐
   Thread 2 ──→ OS Thread 2   VT2 ├─→ Carrier Thread 1 (OS)
   Thread 3 ──→ OS Thread 3   VT3 │
   ...                         VT4 ├─→ Carrier Thread 2 (OS)
   (上限几千)                  ... │
                               VT1_000_000
                               (上限百万级)
\`\`\`

### 用法

\`\`\`java
// Java 21：创建百万个虚拟线程
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 1_000_000; i++) {
        final int idx = i;
        executor.submit(() -> {
            // 阻塞时自动让出 carrier thread
            Thread.sleep(Duration.ofSeconds(1));
            return idx;
        });
    }
}  // 等所有虚拟线程完成
\`\`\`

### 关键特性

1. **同步风格写异步代码**：用 \`Thread.sleep\`、\`blockingIO\` 都行，JVM 在虚拟线程阻塞时自动让出 carrier thread。
2. **API 完全兼容\`java.lang.Thread\`**：现有代码几乎不用改。
3. **不适合 CPU 密集**：虚拟线程在 CPU 密集任务上和普通线程没区别（甚至更慢），它解决的是 **IO 密集高并发**问题。

### 虚拟线程 vs asyncio

| 维度 | Python asyncio | Java 虚拟线程 |
|------|---------------|---------------|
| 编程模型 | async/await 协作式 | 同步阻塞式（JVM 帮你切换）|
| 语法侵入 | 强（函数要 \`async def\`）| 无（普通函数）|
| 生态兼容 | 需要 async 库 | 现有阻塞 IO 库直接可用 |
| 上限 | 单线程内 ~10万协程 | ~百万虚拟线程 |
| CPU 并行 | 否（单线程）| 是（多 carrier）|

这是两种完全不同的哲学：**Python 选择"语言层 async/await"**，**Java 选择"运行时层虚拟线程"**。Java 的方案对老代码更友好，Python 的方案更显式。

## 八、GIL vs JVM 线程模型对比总结

| 维度 | Python (CPython) | Java (JVM) |
|------|------------------|------------|
| 全局锁 | 有 GIL | 无 |
| 线程模型 | 1:1 OS 线程 | 1:1 OS 线程 + M:N 虚拟线程 |
| 多线程 CPU 并行 | 不能（GIL 阻碍） | 能 |
| 单线程性能 | 无 GIL 模式下损失 | 不受影响 |
| 高并发 IO 方案 | asyncio（协作式）| 虚拟线程（同步风格）|
| 未来方向 | PEP 703 无 GIL | 虚拟线程成熟 |
| C 扩展/库兼容 | 移除 GIL 困难 | 虚拟线程兼容好 |

### GIL 工作原理图解（总结）

\`\`\`
线程 A                GIL                  线程 B
   │                   │                     │
   │── acquire ──→     │                     │
   │                   │                     │
   │  执行字节码         │                     │← 阻塞等 GIL
   │  (持锁 5ms)        │                     │
   │                   │                     │
   │── release ──→     │                     │
   │                   │   ── signal ──→     │
   │                   │                     │── acquire
   │← 阻塞等 GIL                              │
   │                                          │  执行字节码
   │                                          │  (持锁 5ms)
   │                                          │── release
   │── acquire ──→                            │
   ...
\`\`\`

## 九、一句话总结

**GIL 是 CPython 为引用计数 GC 付出的代价——它让 Python 多线程在 CPU 密集场景沦为摆设；JVM 用分代 GC 和对象级锁避开了这个陷阱，并通过虚拟线程在 IO 高并发上又追了回来。** 下一章我们将聚焦线程 API 本身——threading vs Thread，以及两门语言的锁、信号量、条件变量如何对照。

---

> **下一章**：进入多线程与锁——Python threading 与 Java Thread/Runnable/Callable 的对照，以及锁、条件变量、信号量、线程安全容器的实战比较，并附上死锁代码示例与解决方案。`,
  },
  {
    id: "pyvsjava-threads-locks",
    icon: "🧵",
    title: "多线程与锁",
    group: "并发与异步",
    content: `# 多线程与锁

## 一、线程的创建与启动

### Python：threading.Thread

Python 用 \`threading\` 模块创建线程，主要有两种方式：传函数、继承 \`Thread\`。

\`\`\`python
import threading

# 方式 1：传函数
def worker(name, n):
    for i in range(n):
        print(f"{name}: {i}")

t = threading.Thread(target=worker, args=("A", 5))
t.start()
t.join()

# 方式 2：继承 Thread
class MyThread(threading.Thread):
    def __init__(self, name):
        super().__init__()
        self.name = name
    def run(self):
        for i in range(5):
            print(f"{self.name}: {i}")

MyThread("B").start()
\`\`\`

### Java：Thread / Runnable / Callable

Java 有三种方式：继承 \`Thread\`、实现 \`Runnable\`、实现 \`Callable\`（带返回值）。

\`\`\`java
// 方式 1：继承 Thread
class MyThread extends Thread {
    private final String name;
    public MyThread(String name) { this.name = name; }
    public void run() {
        for (int i = 0; i < 5; i++) System.out.println(name + ": " + i);
    }
}
new MyThread("A").start();

// 方式 2：实现 Runnable（推荐，解耦任务与线程）
class Worker implements Runnable {
    private final String name;
    public Worker(String name) { this.name = name; }
    public void run() {
        for (int i = 0; i < 5; i++) System.out.println(name + ": " + i);
    }
}
new Thread(new Worker("B")).start();

// 方式 3：Lambda（Java 8+，最简洁）
new Thread(() -> {
    for (int i = 0; i < 5; i++) System.out.println("C: " + i);
}).start();

// 方式 4：Callable + FutureTask（带返回值）
Callable<Integer> task = () -> {
    int sum = 0;
    for (int i = 0; i < 5; i++) sum += i;
    return sum;
};
FutureTask<Integer> ft = new FutureTask<>(task);
new Thread(ft).start();
System.out.println(ft.get());  // 阻塞获取结果
\`\`\`

### 对比

| 维度 | Python | Java |
|------|--------|------|
| 入口函数 | \`target=\` 或 \`run()\` | \`run()\` |
| 启动 | \`t.start()\` | \`t.start()\` |
| 等待 | \`t.join()\` | \`t.join()\` |
| 返回值 | 无（需自己用 Queue）| \`Callable\` + \`Future\` |
| Lambda | 不直接支持 | 支持（Runnable 函数式接口）|
| 守护线程 | \`t.daemon = True\` | \`t.setDaemon(true)\` |

## 二、线程池

直接 \`new Thread\` 在生产代码里是反模式——线程创建/销毁开销大，且无限制创建会拖垮系统。两门语言都推荐用**线程池**。

### Python：concurrent.futures.ThreadPoolExecutor

\`\`\`python
from concurrent.futures import ThreadPoolExecutor, as_completed
import urllib.request

def fetch(url):
    with urllib.request.urlopen(url) as r:
        return r.read()

urls = ["https://example.com"] * 100

with ThreadPoolExecutor(max_workers=10) as executor:
    # 方式 1：map（保序）
    results = list(executor.map(fetch, urls))

    # 方式 2：submit + as_completed（先完成先处理）
    futures = [executor.submit(fetch, u) for u in urls]
    for f in as_completed(futures):
        print(f.result())
\`\`\`

### Java：ExecutorService / ThreadPoolExecutor

\`\`\`java
import java.util.concurrent.*;
import java.util.*;

ExecutorService pool = Executors.newFixedThreadPool(10);
// 或自定义 ThreadPoolExecutor（生产推荐）
ThreadPoolExecutor pool = new ThreadPoolExecutor(
    10, 50, 60L, TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(1000),
    Executors.defaultThreadFactory(),
    new ThreadPoolExecutor.CallerRunsPolicy()
);

// 方式 1：Callable + Future
List<Future<String>> futures = new ArrayList<>();
for (String url : urls) {
    futures.add(pool.submit(() -> fetch(url)));
}
for (Future<String> f : futures) System.out.println(f.get());

// 方式 2：invokeAll（批量提交，等全部完成）
List<Callable<String>> tasks = urls.stream()
    .map(url -> (Callable<String>) () -> fetch(url))
    .collect(Collectors.toList());
List<Future<String>> all = pool.invokeAll(tasks);

// 方式 3：CompletableFuture（更现代）
List<CompletableFuture<String>> cfs = urls.stream()
    .map(url -> CompletableFuture.supplyAsync(() -> fetch(url), pool))
    .collect(Collectors.toList());
CompletableFuture.allOf(cfs.toArray(new CompletableFuture[0])).join();

pool.shutdown();  // 必须显式关闭
\`\`\`

### 对比

| 维度 | Python ThreadPoolExecutor | Java ExecutorService |
|------|--------------------------|---------------------|
| 创建 | \`ThreadPoolExecutor(max_workers=N)\` | \`Executors.newFixedThreadPool(N)\` 或自定义 |
| 提交任务 | \`submit\` / \`map\` | \`submit\` / \`invokeAll\` / \`execute\` |
| 获取结果 | \`future.result()\` | \`future.get()\` |
| 关闭 | \`with\` 自动关闭 | \`shutdown()\` 显式 |
| 超时 | \`future.result(timeout=)\` | \`future.get(timeout, unit)\` |
| 自定义拒绝策略 | 无（队列满会阻塞） | 有（4 种内置策略）|

Java 的 \`ThreadPoolExecutor\` 提供了 7 个核心参数（核心线程数、最大线程数、空闲时间、时间单位、工作队列、线程工厂、拒绝策略），是生产级线程池的标准。Python 的 \`ThreadPoolExecutor\` 更简单，只有 \`max_workers\` 一个核心参数。

## 三、锁（Lock）

### Python：threading.Lock / RLock

\`\`\`python
import threading

counter = 0
lock = threading.Lock()

def increment():
    global counter
    for _ in range(100000):
        with lock:   # 上下文管理器，自动 acquire/release
            counter += 1

# RLock（可重入锁）：同一线程可多次 acquire
rlock = threading.RLock()
def recursive(n):
    with rlock:
        if n > 0:
            recursive(n - 1)
\`\`\`

### Java：synchronized / ReentrantLock

\`\`\`java
// 方式 1：synchronized（JVM 内置锁，对象级）
public class Counter {
    private int counter = 0;
    public synchronized void increment() {  // 锁 this
        counter++;
    }
    public void increment2() {
        synchronized (this) { counter++; }  // 等价
    }
}

// 方式 2：ReentrantLock（更灵活）
import java.util.concurrent.locks.*;
public class Counter2 {
    private int counter = 0;
    private final ReentrantLock lock = new ReentrantLock();
    public void increment() {
        lock.lock();
        try {
            counter++;
        } finally {
            lock.unlock();   // 必须在 finally 释放
        }
    }
}
\`\`\`

### 对比

| 维度 | Python Lock | Java synchronized | Java ReentrantLock |
|------|------------|-------------------|-------------------|
| 语法 | \`with lock:\` | \`synchronized(obj) {}\` | \`lock.lock()\` + \`finally\` |
| 可重入 | \`RLock\` | 默认可重入 | 默认可重入 |
| 公平锁 | 不支持 | 不支持 | \`new ReentrantLock(true)\` |
| 条件变量 | \`Condition\` | \`wait/notify\` | \`newCondition()\` |
| 可中断 | 不支持 | 不支持 | \`lockInterruptibly()\` |
| 超时 | \`acquire(timeout=)\` | 不支持 | \`tryLock(time, unit)\` |

Java 的 \`ReentrantLock\` 比 \`synchronized\` 强大得多——支持公平锁、可中断、超时、多条件变量。Python 的 \`Lock\` 功能较简单，但因为 GIL 的存在，锁的争用本身较少。

### 死锁示例

经典的"循环等待"死锁——两个线程各持一把锁，又互相等对方的锁。

\`\`\`python
# Python 死锁
import threading

lock_a = threading.Lock()
lock_b = threading.Lock()

def worker1():
    with lock_a:
        threading.sleep(0.1)  # 让 worker2 拿到 lock_b
        with lock_b:  # 等待 lock_b → 死锁
            print("worker1")

def worker2():
    with lock_b:
        threading.sleep(0.1)
        with lock_a:  # 等待 lock_a → 死锁
            print("worker2")

t1 = threading.Thread(target=worker1)
t2 = threading.Thread(target=worker2)
t1.start(); t2.start()
t1.join(); t2.join()  # 永远等不到
\`\`\`

\`\`\`java
// Java 死锁
public class Deadlock {
    private static final Object lockA = new Object();
    private static final Object lockB = new Object();

    public static void main(String[] args) {
        new Thread(() -> {
            synchronized (lockA) {
                sleep(100);
                synchronized (lockB) { System.out.println("worker1"); }
            }
        }).start();
        new Thread(() -> {
            synchronized (lockB) {
                sleep(100);
                synchronized (lockA) { System.out.println("worker2"); }
            }
        }).start();
    }
}
\`\`\`

### 死锁的解决

四个必要条件：互斥、持有等待、不可剥夺、循环等待。打破任意一个就能避免死锁。

**方案 1：固定锁顺序**（打破循环等待）

\`\`\`python
# Python：所有线程按相同顺序获取锁
def worker1():
    with lock_a:
        with lock_b:  # 顺序固定
            print("worker1")

def worker2():
    with lock_a:  # 也先拿 lock_a，不再循环
        with lock_b:
            print("worker2")
\`\`\`

\`\`\`java
// Java：同样按顺序加锁
synchronized (lockA) { synchronized (lockB) { ... } }
\`\`\`

**方案 2：超时获取**（打破不可剥夺）

\`\`\`python
# Python：trylock 风格
import time
def worker1():
    while True:
        with lock_a:
            if lock_b.acquire(timeout=0.1):
                try:
                    print("worker1")
                    return
                finally:
                    lock_b.release()
        time.sleep(0.01)  # 重试
\`\`\`

\`\`\`java
// Java：ReentrantLock.tryLock
if (lockA.tryLock(100, TimeUnit.MILLISECONDS)) {
    try {
        if (lockB.tryLock(100, TimeUnit.MILLISECONDS)) {
            try { ... } finally { lockB.unlock(); }
        }
    } finally { lockA.unlock(); }
}
\`\`\`

## 四、条件变量（Condition）

条件变量用于"等待某个条件成立"——典型场景是生产者-消费者。

\`\`\`python
# Python：threading.Condition
import threading, random, time

queue = []
MAX = 5
cond = threading.Condition()

def producer():
    while True:
        with cond:
            while len(queue) >= MAX:
                cond.wait()  # 释放锁，等待 notify
            item = random.randint(0, 100)
            queue.append(item)
            print(f"produced {item}, queue={queue}")
            cond.notify_all()

def consumer():
    while True:
        with cond:
            while not queue:
                cond.wait()
            item = queue.pop(0)
            print(f"consumed {item}")
            cond.notify_all()

threading.Thread(target=producer, daemon=True).start()
threading.Thread(target=consumer, daemon=True).start()
\`\`\`

\`\`\`java
// Java：synchronized + wait/notify
public class PC {
    private static final List<Integer> queue = new ArrayList<>();
    private static final int MAX = 5;

    static class Producer implements Runnable {
        public void run() {
            while (true) {
                synchronized (queue) {
                    while (queue.size() >= MAX) {
                        try { queue.wait(); } catch (InterruptedException e) {}
                    }
                    int item = new Random().nextInt(100);
                    queue.add(item);
                    System.out.println("produced " + item);
                    queue.notifyAll();
                }
            }
        }
    }
    static class Consumer implements Runnable {
        public void run() {
            while (true) {
                synchronized (queue) {
                    while (queue.isEmpty()) {
                        try { queue.wait(); } catch (InterruptedException e) {}
                    }
                    int item = queue.remove(0);
                    System.out.println("consumed " + item);
                    queue.notifyAll();
                }
            }
        }
    }
}
\`\`\`

Java 还有更现代的 \`java.util.concurrent.locks.Condition\`：

\`\`\`java
ReentrantLock lock = new ReentrantLock();
Condition notFull = lock.newCondition();
Condition notEmpty = lock.newCondition();
// 可以有多个 Condition，分别等待不同条件（比 wait/notifyAll 更精细）
\`\`\`

## 五、信号量（Semaphore）

信号量控制"同时访问某资源的最大数量"。

\`\`\`python
# Python：限流 3 个并发
import threading
sem = threading.Semaphore(3)

def access_resource(i):
    with sem:
        print(f"access {i}")
        threading.Event().wait(1)

for i in range(10):
    threading.Thread(target=access_resource, args=(i,)).start()
\`\`\`

\`\`\`java
// Java：java.util.concurrent.Semaphore
Semaphore sem = new Semaphore(3);
for (int i = 0; i < 10; i++) {
    final int idx = i;
    new Thread(() -> {
        try {
            sem.acquire();
            System.out.println("access " + idx);
            Thread.sleep(1000);
        } catch (InterruptedException e) {
        } finally {
            sem.release();
        }
    }).start();
}
\`\`\`

## 六、线程安全容器

### Python：queue.Queue

\`\`\`python
from queue import Queue
q = Queue(maxsize=100)

def producer():
    for i in range(100):
        q.put(i)  # 队列满时阻塞
        q.task_done()  # 标记任务完成

def consumer():
    while True:
        item = q.get()  # 队列空时阻塞
        print(item)

import threading
threading.Thread(target=producer, daemon=True).start()
threading.Thread(target=consumer, daemon=True).start()
\`\`\`

\`queue.Queue\` 内部用了锁和 Condition，是 Python 标准库的"线程安全队列"。还有 \`queue.LifoQueue\`（栈）、\`queue.PriorityQueue\`（优先级队列）。

### Java：BlockingQueue + ConcurrentHashMap

\`\`\`java
import java.util.concurrent.*;

// BlockingQueue：和 queue.Queue 对应
BlockingQueue<Integer> q = new LinkedBlockingQueue<>(100);
new Thread(() -> { for (int i = 0; i < 100; i++) q.put(i); }).start();  // 满则阻塞
new Thread(() -> { while (true) System.out.println(q.take()); }).start();  // 空则阻塞

// 具体实现：
// LinkedBlockingQueue   链表实现
// ArrayBlockingQueue    数组实现（有界）
// SynchronousQueue      直接传递（无容量）
// PriorityBlockingQueue 优先级

// ConcurrentHashMap：线程安全 HashMap
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
map.put("a", 1);
map.computeIfAbsent("b", k -> 2);  // 原子操作

// CopyOnWriteArrayList：写时复制，读极多写极少时用
CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();
\`\`\`

### 对比

| 容器 | Python | Java |
|------|--------|------|
| 阻塞队列 | \`queue.Queue\` | \`BlockingQueue\`（多种实现）|
| 并发 Map | 无（用 \`threading.Lock\` 包 dict）| \`ConcurrentHashMap\` |
| 并发 List | 无（用 \`Lock\` 包 list） | \`CopyOnWriteArrayList\` |
| 原子计数 | \`itertools.count\` + Lock | \`AtomicInteger\`、\`LongAdder\` |

Java 的并发容器库远比 Python 丰富——这是 Java 没有 GIL、必须靠细粒度数据结构支持高并发的必然结果。

## 七、volatile vs Python 无对应

Java 有 \`volatile\` 关键字解决**可见性**问题——确保一个线程对变量的写，立即对其他线程可见。

\`\`\`java
public class Flag {
    private volatile boolean running = true;  // volatile 保证可见性

    public void stop() { running = false; }
    public void run() {
        while (running) { /* 工作 */ }
    }
}
\`\`\`

不加 \`volatile\` 的话，JVM 可能会把 \`running\` 缓存到寄存器，\`stop()\` 修改了主内存的值，但 \`run()\` 线程可能一直读寄存器里的旧值，永远不退出循环。

**Python 没有对应机制**——因为 GIL 保证每次字节码执行都重新读变量，不存在"缓存到寄存器"的问题。GIL 简化了可见性，但代价是失去了多核并行。

这是 GIL 的一个"意外好处"：**Python 程序员不需要理解 memory barrier、happens-before、volatile 这些 JMM（Java Memory Model）概念**。但反过来，Python 程序员也无法写出真正的无锁并行代码。

## 八、一句话总结

**Python threading 的 API 简洁但功能弱（受 GIL 限制），Java 的并发原语丰富且强大（synchronized、ReentrantLock、Condition、BlockingQueue、volatile）——这是 Java 没有 GIL、必须自己解决线程安全的必然结果。** 下一章我们将进入多进程领域，看 Python 如何用 multiprocessing 绕开 GIL 实现真并行，而 Java 为何根本不需要"多进程并行"这个概念。

---

> **下一章**：进入多进程与并行——Python multiprocessing 如何绕过 GIL 跑 CPU 密集任务，Java 为什么用 ForkJoinPool 就够了，以及 Java 虚拟线程如何重新定义"轻量级并发"。`,
  },
  {
    id: "pyvsjava-multiprocess",
    icon: "🧬",
    title: "多进程与并行",
    group: "并发与异步",
    content: `# 多进程与并行

## 一、为什么 Python 需要多进程

回顾前两章：Python 因为 GIL，多线程跑 CPU 密集任务**不仅不能并行，反而更慢**。所以 Python 想要利用多核 CPU 跑 CPU 密集任务，**只能绕开 GIL**——而绕开 GIL 最直接的办法就是**多进程**。

每个进程有自己独立的 Python 解释器实例和 GIL，进程之间不共享 GIL，所以多进程能真正并行执行 Python 字节码。

\`\`\`
   多线程（受 GIL 限制）         多进程（绕开 GIL）
   ───────────────              ───────────────
   ┌─────────────────┐         ┌──────────────┐  ┌──────────────┐
   │ Python 进程     │         │ Python 进程1 │  │ Python 进程2 │
   │  ┌──────────┐   │         │  ┌────────┐  │  │  ┌────────┐  │
   │  │ Thread 1 │   │         │  │  GIL   │  │  │  │  GIL   │  │
   │  │   ↓      │   │         │  │   ↓    │  │  │  │   ↓    │  │
   │  │  GIL（共享）│          │  │ Thread │  │  │  │ Thread │  │
   │  │   ↓      │   │         │  └────────┘  │  │  └────────┘  │
   │  │ Thread 2 │   │         └──────────────┘  └──────────────┘
   │  └──────────┘   │               ↓                  ↓
   │  （无法并行）    │            核1 并行             核2 并行
   └─────────────────┘
\`\`\`

**Java 完全不需要多进程并行**——JVM 无 GIL，多线程本身就是真并行。Java 的"多进程"通常指启动多个 JVM 实例（用于隔离部署），不是用于计算并行。

## 二、Python multiprocessing 基础

### Process 类

\`\`\`python
from multiprocessing import Process
import os

def worker(name):
    print(f"{name} running in PID {os.getpid()}, parent {os.getppid()}")

if __name__ == "__main__":
    p1 = Process(target=worker, args=("A",))
    p2 = Process(target=worker, args=("B",))
    p1.start()
    p2.start()
    p1.join()
    p2.join()
    print(f"main PID {os.getpid()}")
\`\`\`

注意 \`if __name__ == "__main__":\` 是**必须的**——Windows 上 multiprocessing 用 spawn 方式启动子进程，会重新 import 主模块。如果没有这个保护，子进程会无限递归创建子进程。

### Pool：并行 map

\`\`\`python
from multiprocessing import Pool
import math

def cpu_task(n):
    return sum(math.factorial(i % 1000) for i in range(n))

if __name__ == "__main__":
    data = [10**5] * 8
    with Pool(8) as pool:
        results = pool.map(cpu_task, data)  # 8 个进程并行处理
    print(results)
\`\`\`

\`Pool.map\` 是最常用的并行 API——把一个可迭代对象的每个元素并行映射到函数上，类似内置 \`map\`，但是并行执行。

## 三、ProcessPoolExecutor：现代 API

\`\`\`python
from concurrent.futures import ProcessPoolExecutor, as_completed
import math

def cpu_task(n):
    return sum(math.factorial(i % 1000) for i in range(n))

if __name__ == "__main__":
    with ProcessPoolExecutor(max_workers=8) as executor:
        # map：保序
        results = list(executor.map(cpu_task, range(8)))

        # submit + as_completed：先完成先处理
        futures = [executor.submit(cpu_task, n) for n in range(8)]
        for f in as_completed(futures):
            print(f.result())
\`\`\`

\`ProcessPoolExecutor\` 和 \`ThreadPoolExecutor\` API 完全一致，只是底层换成进程——这是 \`concurrent.futures\` 抽象的威力。你可以一行代码切换线程/进程模型。

## 四、进程间通信（IPC）

进程不共享内存，所以 multiprocessing 提供了几种 IPC 机制：

### Queue（进程安全队列）

\`\`\`python
from multiprocessing import Process, Queue

def producer(q):
    for i in range(10):
        q.put(i)
    q.put(None)  # 哨兵

def consumer(q):
    while True:
        item = q.get()
        if item is None:
            break
        print(f"consumed {item}")

if __name__ == "__main__":
    q = Queue()
    p = Process(target=producer, args=(q,))
    c = Process(target=consumer, args=(q,))
    p.start(); c.start()
    p.join(); c.join()
\`\`\`

注意 \`multiprocessing.Queue\` 和 \`queue.Queue\` 不是同一个东西——前者用 pickle 序列化数据走管道，后者是纯内存队列。所以 \`multiprocessing.Queue\` 传递的对象必须**可 pickle**。

### Pipe（双向管道）

\`\`\`python
from multiprocessing import Process, Pipe

def worker(conn):
    print(conn.recv())  # 接收
    conn.send("hello from child")
    conn.close()

if __name__ == "__main__":
    parent_conn, child_conn = Pipe()
    p = Process(target=worker, args=(child_conn,))
    p.start()
    parent_conn.send("hello from parent")
    print(parent_conn.recv())  # hello from child
    p.join()
\`\`\`

\`Pipe\` 比 \`Queue\` 更轻量，但只能两点之间通信。

### Manager（共享对象）

\`\`\`python
from multiprocessing import Process, Manager

def worker(d, lst):
    d["key"] = "value"
    lst.append(42)

if __name__ == "__main__":
    with Manager() as mgr:
        shared_dict = mgr.dict()
        shared_list = mgr.list()
        p = Process(target=worker, args=(shared_dict, shared_list))
        p.start()
        p.join()
        print(shared_dict, shared_list)  # {'key': 'value'} [42]
\`\`\`

\`Manager\` 启动一个独立进程作为"对象服务器"，其他进程通过代理访问共享对象。代价是每次访问都要跨进程 RPC，性能较差——只用于低频共享状态。

### Value / Array（共享内存）

\`\`\`python
from multiprocessing import Process, Value, Array

def worker(n, arr):
    n.value = 3.14
    for i in range(len(arr)):
        arr[i] = -arr[i]

if __name__ == "__main__":
    num = Value("d", 0.0)        # double
    arr = Array("i", [1, 2, 3])  # int array
    p = Process(target=worker, args=(num, arr))
    p.start(); p.join()
    print(num.value, arr[:])  # 3.14 [-1, -2, -3]
\`\`\`

\`Value\`/\`Array\` 用真正的共享内存（mmap），性能最好，但只支持基本类型。

## 五、Java 的"并行"：ForkJoinPool + parallelStream

Java 不需要多进程——多线程就够了。Java 的并行计算主力是 \`ForkJoinPool\` 和 \`parallelStream\`。

### parallelStream

\`\`\`java
import java.util.stream.*;

// 并行流：自动分治 + 工作窃取
long sum = LongStream.range(0, 100_000_000L)
    .parallel()  // 一行变成并行
    .map(x -> x * x)
    .sum();

// 并行过滤
List<Integer> evens = IntStream.range(0, 1000)
    .parallel()
    .filter(x -> x % 2 == 0)
    .boxed()
    .collect(Collectors.toList());
\`\`\`

\`parallelStream\` 默认用公共 \`ForkJoinPool\`（线程数 = CPU 核数），自动把数据分块并行处理。

### ForkJoinPool 显式使用

\`\`\`java
import java.util.concurrent.*;

class SumTask extends RecursiveTask<Long> {
    private final long[] arr;
    private final int lo, hi;
    private static final int THRESHOLD = 10000;

    SumTask(long[] arr, int lo, int hi) {
        this.arr = arr; this.lo = lo; this.hi = hi;
    }
    protected Long compute() {
        if (hi - lo < THRESHOLD) {
            long s = 0;
            for (int i = lo; i < hi; i++) s += arr[i];
            return s;
        }
        int mid = (lo + hi) >>> 1;
        SumTask left = new SumTask(arr, lo, mid);
        SumTask right = new SumTask(arr, mid, hi);
        left.fork();  // 异步执行左半
        long rightResult = right.compute();  // 同步执行右半
        long leftResult = left.join();  // 等左半结果
        return leftResult + rightResult;
    }
}

ForkJoinPool pool = new ForkJoinPool(8);
long[] arr = new long[10_000_000];
// ... 填充数据
long sum = pool.invoke(new SumTask(arr, 0, arr.length));
\`\`\`

\`ForkJoinPool\` 用**工作窃取算法**——空闲线程从其他线程的队列尾部偷任务，提高 CPU 利用率。

## 六、性能对比：Python 多进程 vs Java 多线程

同样的 CPU 密集任务（计算大量阶乘和）：

\`\`\`python
# Python：8 进程并行
import math, time
from multiprocessing import Pool

def task(n):
    return sum(math.factorial(i % 500) for i in range(n))

if __name__ == "__main__":
    data = [500_000] * 8
    # 单进程
    start = time.time()
    serial = [task(n) for n in data]
    print(f"单进程: {time.time()-start:.2f}s")

    # 8 进程
    start = time.time()
    with Pool(8) as p:
        parallel = p.map(task, data)
    print(f"8 进程: {time.time()-start:.2f}s")
\`\`\`

\`\`\`java
// Java：8 线程并行
import java.util.concurrent.*;
import java.util.stream.*;

public class Bench {
    static long task(int n) {
        long s = 0;
        for (int i = 0; i < n; i++) s += factorial(i % 500);
        return s;
    }
    static long factorial(int n) {
        long r = 1;
        for (int i = 2; i <= n; i++) r *= i;
        return r;
    }
    public static void main(String[] args) {
        int[] data = new int[8];
        java.util.Arrays.fill(data, 500_000);

        long s = System.currentTimeMillis();
        long serial = 0;
        for (int n : data) serial += task(n);
        System.out.println("单线程: " + (System.currentTimeMillis()-s) + "ms");

        s = System.currentTimeMillis();
        long parallel = IntStream.of(data).parallel().mapToLong(Bench::task).sum();
        System.out.println("8 线程: " + (System.currentTimeMillis()-s) + "ms");
    }
}
\`\`\`

参考结果（8 核 Mac）：

\`\`\`
                  单进程/单线程    并行（8 路）   加速比
Python            18.2s            3.1s          5.9x（接近理论 8x）
Java              0.95s            0.18s         5.3x
\`\`\`

观察：
1. **Python 多进程加速比不错**——基本能用到接近多核。
2. **Java 绝对速度快 20 倍**——这是 JIT 和静态类型的优势。
3. **Java 多线程并行效率稍低**——可能因为线程创建开销和 JIT 还没热身。
4. **Python 多进程启动慢**——8 个 Python 解释器启动 + 数据 pickle 序列化有几秒开销，数据量小时不划算。

## 七、进程开销 vs 线程开销

| 维度 | Python 进程 | Java 线程 |
|------|------------|----------|
| 启动时间 | 50-200ms | 1-10ms |
| 内存占用 | 30-100MB/进程 | 1-2MB/线程（栈）|
| 通信开销 | pickle + IPC（慢）| 共享内存（快）|
| 创建上限 | 几十到几百 | 几千 |
| 错误隔离 | 好（进程崩溃不影响其他）| 差（线程崩溃可能拖垮 JVM）|

Python 进程的"重"是它最大的痛点。这也是为什么 Python 在大数据领域虽然库丰富（NumPy、pandas），但实际并行时性能不理想——数据要在进程间 pickle 来 pickle 去。

### Java 虚拟线程：解决线程开销

Java 21 的虚拟线程让"轻量级线程"成为可能——可以创建百万级虚拟线程，开销接近协程：

\`\`\`java
// 百万虚拟线程
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 1_000_000).forEach(i ->
        executor.submit(() -> {
            Thread.sleep(Duration.ofSeconds(1));
            return i;
        })
    );
}
\`\`\`

| 线程类型 | 创建开销 | 内存 | 上限 | 适用 |
|---------|---------|------|------|------|
| Java 平台线程（OS）| ~1ms | 1-2MB | 几千 | CPU 密集 |
| Java 虚拟线程 | ~1μs | 几 KB | 百万级 | IO 密集 |
| Python 协程（asyncio）| ~1μs | 几 KB | 十万级 | IO 密集 |

虚拟线程让 Java 在"IO 高并发"上有了和 Python asyncio 同等的轻量级方案，但**编程模型是同步阻塞式**，比 asyncio 的 async/await 更友好。

## 八、concurrent.futures vs CompletableFuture

Python 的 \`concurrent.futures\` 和 Java 的 \`CompletableFuture\` 都是"异步任务编排"的抽象层。

\`\`\`python
# Python：Future
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor() as ex:
    f1 = ex.submit(task1)
    f2 = ex.submit(task2)
    # 等两个都完成
    r1, r2 = f1.result(), f2.result()
    # 链式（Python 较弱）
    f3 = ex.submit(lambda: r1 + r2)
\`\`\`

\`\`\`java
// Java：CompletableFuture（功能强大得多）
CompletableFuture<Integer> f1 = CompletableFuture.supplyAsync(() -> task1());
CompletableFuture<Integer> f2 = CompletableFuture.supplyAsync(() -> task2());

// 链式：thenApply（转换）、thenCombine（合并）、thenCompose（串联）
CompletableFuture<Integer> f3 = f1.thenCombine(f2, Integer::sum);

// 异常处理
f3.exceptionally(ex -> -1)
  .thenAccept(System.out::println);

// 组合多个
CompletableFuture<Void> all = CompletableFuture.allOf(f1, f2, f3);
all.join();
\`\`\`

Java 的 \`CompletableFuture\` 是函数式风格的"Promise"——支持几十种链式组合方法（\`thenApply\`/\`thenCompose\`/\`thenCombine\`/\`exceptionally\`/\`whenComplete\`/\`handle\`...），表达力远超 Python 的 \`Future\`。Python 想要等价能力，需要用 \`asyncio\` 的 \`async/await\` + \`gather\`。

## 九、并行计算选型建议

\`\`\`
任务类型？
│
├─ CPU 密集
│   ├─ Python
│   │   ├─ 数据大、独立任务 → multiprocessing.Pool / ProcessPoolExecutor
│   │   ├─ NumPy 矩阵运算 → 直接用（C 扩展内部已并行）
│   │   └─ 需要共享状态 → Manager（谨慎，性能差）
│   └─ Java
│       ├─ 数据并行 → parallelStream / ForkJoinPool
│       ├─ 任务并行 → ExecutorService + Future
│       └─ 分治问题 → RecursiveTask
│
├─ IO 密集
│   ├─ Python → asyncio（首选）/ ThreadPoolExecutor
│   └─ Java → 虚拟线程（Java 21+）/ CompletableFuture + ExecutorService
│
└─ 跨进程/跨机器
    ├─ Python → multiprocessing（本机）/ celery（分布式）
    └─ Java → 多 JVM + 消息队列 / Akka / 项目用 Kubernetes
\`\`\`

## 十、一句话总结

**Python 用 multiprocessing 绕开 GIL 实现真并行，代价是进程开销大、IPC 麻烦；Java 无 GIL，多线程 + ForkJoinPool 即可并行，虚拟线程又把 IO 高并发的轻量级线程补齐——Java 在并行计算上的工具箱明显更完整。** 下一章我们将进入 asyncio 的世界，看 Python 如何用单线程事件循环实现超高并发 IO，以及 Java 的 CompletableFuture 和反应式如何应对。

---

> **下一章**：进入 asyncio 异步编程——Python 的 async/await 协作式并发 vs Java 的 CompletableFuture 链式编排与反应式流，以及 Java 21 虚拟线程如何让异步"回归同步"。`,
  },
  {
    id: "pyvsjava-asyncio",
    icon: "🌊",
    title: "asyncio 异步编程",
    group: "并发与异步",
    content: `# asyncio 异步编程

## 一、为什么需要异步

传统的同步阻塞 IO 模型有一个致命问题：**一个线程一次只能处理一个连接**。要处理 1 万个并发连接，就需要 1 万个线程——每个 OS 线程占 1-2MB 栈，光栈空间就要 10-20GB，再加上上下文切换开销，根本撑不住。

异步 IO 的核心思想：**用少量线程（甚至一个）处理大量并发连接**。线程发起 IO 后不阻塞，而是去处理其他连接，等 IO 完成后再回来处理结果。

\`\`\`
同步阻塞模型                     异步 IO 模型
─────────────                   ─────────────

Thread 1:                       单线程事件循环:
  send(req)                       send(req1) → 不等
  recv() ← 阻塞等                  send(req2) → 不等
  process                         send(req3) → 不等
                                  [epoll 等 IO 完成]
Thread 2:                         recv(req1) → 已完成
  send(req)                       process req1
  recv() ← 阻塞等                  recv(req2) → 已完成
  process                         process req2

1 万连接 = 1 万线程              1 万连接 = 1 线程
\`\`\`

Python 的 \`asyncio\` 和 Java 的反应式（Reactor、RxJava）、虚拟线程都在解决同一个问题，但路径完全不同。

## 二、Python asyncio 核心概念

asyncio 有三个核心概念：**事件循环（Event Loop）**、**协程（Coroutine）**、**任务（Task）**。

### 1. 协程（Coroutine）

用 \`async def\` 定义的函数就是协程。调用协程不会立即执行，而是返回一个协程对象——必须用 \`await\` 或事件循环调度才会执行。

\`\`\`python
import asyncio

async def hello():
    print("hello start")
    await asyncio.sleep(1)  # 非阻塞 sleep
    print("hello end")

# 直接调用不会执行
coro = hello()
print(type(coro))  # <class 'coroutine'>

# 必须用 await 或事件循环
asyncio.run(hello())
\`\`\`

### 2. await：让出控制权

\`await\` 是协程的"暂停点"——遇到 \`await\` 时，协程把控制权交回事件循环，事件循环可以调度其他协程。等 \`await\` 的对象完成后，协程恢复执行。

\`\`\`python
async def fetch(url):
    # await 让出控制权，事件循环去处理其他协程
    data = await http_get(url)
    return data

async def main():
    # 三个 fetch 并发执行（不是顺序）
    results = await asyncio.gather(
        fetch("url1"),
        fetch("url2"),
        fetch("url3"),
    )
\`\`\`

### 3. 事件循环（Event Loop）

事件循环是 asyncio 的"心脏"——它不停地"取就绪任务 → 执行到下一个 await → 取下一个就绪任务"。

\`\`\`python
import asyncio

# 获取/创建事件循环
loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)

# Python 3.7+ 推荐用 asyncio.run()
asyncio.run(main())  # 自动创建循环、运行、关闭
\`\`\`

底层的事件循环用 OS 提供的异步 IO 多路复用：Linux 是 \`epoll\`，macOS 是 \`kqueue\`，Windows 是 \`IOCP\`。这些系统调用让一个线程能同时监视成千上万个文件描述符。

## 三、并发执行：gather / TaskGroup

### asyncio.gather

\`\`\`python
import asyncio
import aiohttp

async def fetch(session, url):
    async with session.get(url) as resp:
        return await resp.text()

async def main():
    urls = [f"https://example.com/{i}" for i in range(100)]
    async with aiohttp.ClientSession() as session:
        # gather：并发执行所有协程，等全部完成
        results = await asyncio.gather(*[
            fetch(session, url) for url in urls
        ])
        print(f"fetched {len(results)} pages")

asyncio.run(main())
\`\`\`

\`gather\` 类似 JavaScript 的 \`Promise.all\`——并发执行，全部完成后返回结果列表。

### asyncio.TaskGroup（Python 3.11+）

\`\`\`python
async def main():
    async with asyncio.TaskGroup() as tg:
        # 在 with 块内创建任务，退出时自动等全部完成
        t1 = tg.create_task(fetch(session, "url1"))
        t2 = tg.create_task(fetch(session, "url2"))
    # 这里所有任务已完成
    print(t1.result(), t2.result())
\`\`\`

\`TaskGroup\` 比 \`gather\` 更现代——支持结构化并发（structured concurrency），任何任务抛异常都会取消同组其他任务。

### asyncio.wait_for（超时）

\`\`\`python
try:
    result = await asyncio.wait_for(fetch(url), timeout=5.0)
except asyncio.TimeoutError:
    print("timeout")
\`\`\`

### asyncio.as_completed（先完成先处理）

\`\`\`python
for coro in asyncio.as_completed([fetch(u) for u in urls]):
    result = await coro
    print(result)  # 哪个先完成就先打印
\`\`\`

## 四、协程 vs 线程 vs 虚拟线程

\`\`\`
   协程（Python asyncio）       虚拟线程（Java 21）
   ────────────────            ────────────────
   单线程内调度                  多 carrier 线程上调度
   显式 await 才会切换           阻塞时 JVM 自动切换
   非抢占式（协作式）            抢占式（被 carrier 抢占）
   不能在协程里跑 CPU 密集       可以（但有 carrier 限制）
   生态需要 async 库            现有阻塞库直接可用
\`\`\`

### Python 协程的"传染性"

asyncio 最大的痛点是**async 的传染性**——一旦你的某个函数是 \`async def\`，所有调用它的函数也必须 \`async def\`，整个调用链都要 async 化。

\`\`\`python
# 这段代码会报错
async def fetch_user():
    return await db.get_user()

def handle_request():  # 同步函数
    user = fetch_user()  # 错！必须 await
    # 但同步函数里不能 await
\`\`\`

这导致 Python 生态分裂成两套——同步库（requests、psycopg2）和异步库（aiohttp、asyncpg）。混用极其痛苦。

### Java 虚拟线程：无侵入

\`\`\`java
// Java 21：虚拟线程里直接写同步代码
public static void main(String[] args) throws InterruptedException {
    try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
        for (int i = 0; i < 10000; i++) {
            final int idx = i;
            executor.submit(() -> {
                // 阻塞调用，JVM 自动让出 carrier
                var resp = httpClient.send(req, BodyHandlers.ofString());
                var user = db.queryUser(idx);
                return user;
            });
        }
    }
}
\`\`\`

Java 虚拟线程不需要 \`async/await\` 关键字，**所有现有同步阻塞代码直接跑在虚拟线程上即可**。这是 Java 相对 Python asyncio 的巨大优势——没有生态分裂。

## 五、aiohttp vs Java 异步 HTTP

### Python：aiohttp

\`\`\`python
import asyncio
import aiohttp

async def fetch(session, url):
    async with session.get(url) as resp:
        return await resp.text()

async def main():
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, f"https://api.example.com/{i}") for i in range(100)]
        results = await asyncio.gather(*tasks)
        for r in results:
            print(r[:50])

asyncio.run(main())
\`\`\`

### Java：HttpClient（Java 11+，异步）

\`\`\`java
import java.net.http.*;
import java.util.*;
import java.util.concurrent.*;

var client = HttpClient.newBuilder()
    .version(HttpClient.Version.HTTP_2)
    .build();

List<CompletableFuture<String>> futures = new ArrayList<>();
for (int i = 0; i < 100; i++) {
    var req = HttpRequest.newBuilder()
        .uri(URI.create("https://api.example.com/" + i))
        .build();
    futures.add(client.sendAsync(req, HttpResponse.BodyHandlers.ofString())
        .thenApply(HttpResponse::body));
}

CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
for (var f : futures) System.out.println(f.get().substring(0, 50));
\`\`\`

### Java 21：虚拟线程 + 同步 HttpClient

\`\`\`java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<String>> futures = new ArrayList<>();
    for (int i = 0; i < 100; i++) {
        final int idx = i;
        futures.add(executor.submit(() -> {
            var req = HttpRequest.newBuilder()
                .uri(URI.create("https://api.example.com/" + idx))
                .build();
            // 同步阻塞调用，但跑在虚拟线程上不会阻塞 carrier
            var resp = client.send(req, HttpResponse.BodyHandlers.ofString());
            return resp.body();
        }));
    }
    for (var f : futures) System.out.println(f.get().substring(0, 50));
}
\`\`\`

虚拟线程让"同步代码 + 高并发"成为可能——这是 Java 在异步领域的最新答案。

## 六、为什么 Python 需要 asyncio

Python 有 GIL，多线程跑 CPU 密集没用。但 IO 密集场景下，GIL 在 IO 系统调用时会释放，所以多线程理论上也能处理 IO 并发。

那为什么还需要 asyncio？**因为线程开销太大**。

\`\`\`
场景：处理 1 万个并发 HTTP 连接

方案 1：threading
  1 万 OS 线程 × 1MB 栈 = 10GB 内存（撑不住）
  1 万线程的上下文切换开销巨大

方案 2：asyncio
  1 个线程 × 1 万协程
  每个协程几 KB → 总共几十 MB
  无线程切换开销
\`\`\`

所以 Python asyncio 的核心价值是**轻量级并发**——在 GIL 限制下，单线程 + 协程是处理高并发 IO 的唯一可行方案。

## 七、为什么 Java 转向虚拟线程

Java 历史上有过几个异步方案：

1. **Future（Java 5）**：太弱，只能 \`get()\` 阻塞。
2. **CompletableFuture（Java 8）**：链式编排强大，但代码仍然是"回调式"的。
3. **反应式（Reactor、RxJava）**：流式抽象，学习曲线极陡。

\`\`\`java
// 反应式（Reactor）—— 强大但难懂
Flux.range(1, 100)
    .flatMap(i -> Mono.fromCallable(() -> fetch(i))
                      .subscribeOn(Schedulers.boundedElastic()))
    .collectList()
    .doOnNext(list -> System.out.println("got " + list.size()))
    .block();
\`\`\`

反应式代码的问题是：**调试困难、错误栈不可读、思维模型复杂**。Java 社区用了很多年，最终发现："为什么我们不直接用同步代码？"

**Project Loom（虚拟线程）就是答案**——让程序员写普通的同步阻塞代码，JVM 在底层自动把它变成异步非阻塞的。这是"运行时承担复杂性"的哲学，和 Python asyncio"语言层显式 async/await"完全不同。

\`\`\`java
// 虚拟线程版本：和普通同步代码一模一样
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(1, 101).forEach(i ->
        executor.submit(() -> fetch(i))
    );
}
\`\`\`

## 八、asyncio.gather vs CompletableFuture.allOf

\`\`\`python
# Python：gather
async def main():
    results = await asyncio.gather(
        fetch("a"), fetch("b"), fetch("c")
    )
    # results 是 [resultA, resultB, resultC]
\`\`\`

\`\`\`java
// Java：allOf + 手动收集
CompletableFuture<String> f1 = CompletableFuture.supplyAsync(() -> fetch("a"));
CompletableFuture<String> f2 = CompletableFuture.supplyAsync(() -> fetch("b"));
CompletableFuture<String> f3 = CompletableFuture.supplyAsync(() -> fetch("c"));

CompletableFuture<Void> all = CompletableFuture.allOf(f1, f2, f3);
all.join();
List<String> results = List.of(f1.join(), f2.join(), f3.join());
\`\`\`

\`gather\` 更简洁——直接返回结果列表。Java 的 \`allOf\` 只返回 \`CompletableFuture<Void>\`，要自己再 \`join\` 每个未来拿结果。Java 21 之后用虚拟线程 + \`ExecutorService.invokeAll\` 会更接近 \`gather\` 的简洁度。

## 九、错误处理对比

\`\`\`python
# Python：gather 的异常处理
async def main():
    try:
        results = await asyncio.gather(
            fetch("a"), fetch("b"), fetch("c"),
            return_exceptions=False  # 默认：第一个异常立即抛出
        )
    except Exception as e:
        print(f"first error: {e}")

    # return_exceptions=True：异常作为结果返回
    results = await asyncio.gather(
        fetch("a"), fetch("b"),
        return_exceptions=True
    )
    for r in results:
        if isinstance(r, Exception):
            print(f"error: {r}")
\`\`\`

\`\`\`java
// Java：CompletableFuture 的异常处理
CompletableFuture<String> f1 = CompletableFuture.supplyAsync(() -> fetch("a"))
    .exceptionally(ex -> { System.out.println("error: " + ex); return null; });

CompletableFuture<String> f2 = CompletableFuture.supplyAsync(() -> fetch("b"))
    .handle((result, ex) -> {
        if (ex != null) { System.out.println("error: " + ex); return null; }
        return result;
    });
\`\`\`

\`exceptionally\` 和 \`handle\` 是函数式的错误处理，比 \`gather(return_exceptions=True)\` 更细粒度——可以每个 Future 单独处理异常。Python 想要等价能力需要写更多代码。

## 十、对比总结

| 维度 | Python asyncio | Java CompletableFuture | Java 反应式 | Java 虚拟线程 |
|------|---------------|----------------------|------------|--------------|
| 编程模型 | async/await 协作式 | 链式编排 | 流式 | 同步阻塞 |
| 语法侵入 | 强（async 传染） | 中（返回 Future） | 强（全是流）| 无 |
| 学习曲线 | 中（要理解事件循环） | 高（链式 API 复杂） | 极高 | 低 |
| 生态兼容 | 需 async 库 | 兼容现有库 | 需反应式库 | 完全兼容 |
| CPU 并行 | 否 | 是（多线程） | 是 | 是（多 carrier）|
| 调试难度 | 中（栈跟踪较清晰） | 高（链式调用栈乱） | 极高 | 低（同步栈）|
| 上限 | ~10 万协程 | ~几千 Future | ~百万 Flux | ~百万虚拟线程 |

### 哲学差异

- **Python**：语言层显式异步（async/await）——程序员必须理解协程，但代码意图清晰。
- **Java（旧）**：库层异步（CompletableFuture、反应式）——语言不变，但库 API 复杂。
- **Java（新）**：运行时层异步（虚拟线程）——程序员写同步代码，JVM 帮你异步。

这是两种截然不同的哲学：**Python 选择"显式优于隐式"**（Python 之禅），**Java 选择"运行时承担复杂性"**（Loom 的核心思想）。哪一种更好，至今没有定论——但 Java 21 之后，虚拟线程正在快速吞噬反应式的领地。

## 十一、一句话总结

**Python asyncio 用单线程 + async/await 实现超高并发 IO，代价是 async 传染整个生态；Java 用 CompletableFuture 和反应式提供强大的异步编排，但最终用虚拟线程让异步"回归同步"——两种哲学的取舍，正是两门语言性格的缩影。** 下一章我们将系统对比 Java 的并发工具包 \`java.util.concurrent\` 全家桶与 Python 对应工具，看 Java 的"工业级并发库"完整到什么程度。

---

> **下一章**：进入 Java 并发工具包 vs Python——\`java.util.concurrent\` 全家桶（Executor、CountDownLatch、CyclicBarrier、Phaser、Semaphore、Exchanger、并发容器、原子类、ForkJoinPool、读写锁、CompletableFuture、反应式）vs Python 对应物，看 Java 并发库的"工业级"完整度。`,
  },
  {
    id: "pyvsjava-java-concurrent",
    icon: "🛠️",
    title: "Java 并发工具包 vs Python",
    group: "并发与异步",
    content: `# Java 并发工具包 vs Python

## 一、java.util.concurrent 全家桶

Java 在 2004 年（Java 5）引入了 \`java.util.concurrent\`（简称 JUC）包，由 Doug Lea 设计。这是工业级并发库的标杆——经过 20 年迭代，覆盖了并发编程几乎所有场景。

Python 的并发工具则分散在 \`threading\`、\`multiprocessing\`、\`asyncio\`、\`queue\`、\`concurrent.futures\` 等多个模块，功能远不如 JUC 完整。这一章我们系统对比。

### JUC 核心组件

\`\`\`
java.util.concurrent 全景
├── 执行器      Executor, ExecutorService, ThreadPoolExecutor, ScheduledExecutorService, ForkJoinPool
├── 同步器      CountDownLatch, CyclicBarrier, Phaser, Semaphore, Exchanger
├── 并发容器    ConcurrentHashMap, CopyOnWriteArrayList, BlockingQueue, ConcurrentSkipListMap
├── 原子类      AtomicInteger, AtomicLong, LongAdder, AtomicReference, AtomicStampedReference
├── 锁          ReentrantLock, ReentrantReadWriteLock, StampedLock, Condition
├── Future      Future, CompletableFuture, FutureTask
└── 反应式      Flow（Java 9+，反应式流标准）
\`\`\`

## 二、同步器对比

### 1. CountDownLatch（一次性倒计时门闩）

等待 N 个事件发生后才继续——一次性使用。

\`\`\`java
// Java：等待 3 个 worker 准备就绪
CountDownLatch latch = new CountDownLatch(3);

for (int i = 0; i < 3; i++) {
    final int idx = i;
    new Thread(() -> {
        init(idx);
        latch.countDown();  // 减一
    }).start();
}
latch.await();  // 等到 0
System.out.println("all ready");
\`\`\`

\`\`\`python
# Python：用 threading.Barrier 或 Event 模拟
import threading

latch_count = 3
lock = threading.Lock()
event = threading.Event()

def count_down():
    global latch_count
    with lock:
        latch_count -= 1
        if latch_count == 0:
            event.set()

for i in range(3):
    threading.Thread(target=lambda: (init(i), count_down())).start()
event.wait()
print("all ready")

# 更直接：Barrier（但语义略不同）
barrier = threading.Barrier(3)
\`\`\`

Python 没有内置的 CountDownLatch，要自己用 Lock + Event 模拟，或者用 \`Barrier\`（语义略不同——Barrier 是"等到 N 个都到，然后一起通过"，CountDownLatch 是"等到 N 个事件发生，主线程继续"）。

### 2. CyclicBarrier（可重用屏障）

N 个线程都到达屏障后，一起继续——可重用。

\`\`\`java
// Java：3 个线程，每次都等到齐再继续
CyclicBarrier barrier = new CyclicBarrier(3, () -> {
    System.out.println("all reached, continue");
});

for (int i = 0; i < 3; i++) {
    final int idx = i;
    new Thread(() -> {
        for (int round = 0; round < 5; round++) {
            doWork(idx, round);
            try { barrier.await(); } catch (Exception e) {}
        }
    }).start();
}
\`\`\`

\`\`\`python
# Python：threading.Barrier 完全对应
barrier = threading.Barrier(3, action=lambda: print("all reached"))

def worker(idx):
    for round in range(5):
        do_work(idx, round)
        barrier.wait()  # 等 3 个都到

for i in range(3):
    threading.Thread(target=worker, args=(i,)).start()
\`\`\`

Python 的 \`Barrier\` 和 Java 的 \`CyclicBarrier\` 几乎一一对应——这是 Python 唯一比 Java 简洁的同步器。

### 3. Phaser（阶段器，多阶段同步）

Java 独有，Python 无对应。支持动态注册、多阶段同步。

\`\`\`java
// Java：多阶段任务，每阶段参与者数量可变
Phaser phaser = new Phaser(3);  // 3 个参与方
phaser.register();  // 动态加一个 → 4

for (int phase = 0; phase < 5; phase++) {
    // ... 各方做任务
    phaser.arriveAndAwaitAdvance();  // 等所有方到达
    System.out.println("phase " + phase + " done");
}
\`\`\`

Phaser 是 CyclicBarrier 的"超级版"——支持多阶段、动态增减参与方、层级结构。Python 想要等价功能，只能自己用 \`Barrier\` + 计数器组合实现，相当繁琐。

### 4. Exchanger（线程间交换数据）

两个线程在屏障点交换数据——Java 独有。

\`\`\`java
// Java：生产者和消费者交换缓冲区
Exchanger<List<String>> exchanger = new Exchanger<>();

// 线程 A：填满缓冲区后和 B 交换
new Thread(() -> {
    List<String> buf = new ArrayList<>();
    while (true) {
        buf.add(produce());
        if (buf.size() == 10) buf = exchanger.exchange(buf);  // 交换
    }
}).start();

// 线程 B：拿到 A 的满缓冲区，给 A 空缓冲区
new Thread(() -> {
    List<String> buf = new ArrayList<>();
    while (true) {
        buf = exchanger.exchange(buf);  // 交换
        for (String s : buf) consume(s);
        buf.clear();
    }
}).start();
\`\`\`

Python 没有等价的 \`Exchanger\`，需要用 \`Queue\` 双向传递模拟。

## 三、并发容器对比

### 1. ConcurrentHashMap

Java 的 \`ConcurrentHashMap\` 是高并发 Map 的标杆——分段锁（Java 7）/ CAS + synchronized（Java 8+），读完全无锁，写粒度细。

\`\`\`java
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();

// 原子操作
map.put("a", 1);
map.putIfAbsent("b", 2);  // 不存在才放
map.compute("a", (k, v) -> v + 1);  // 原子更新
map.merge("counter", 1, Integer::sum);  // 原子合并

// 并发安全的遍历（弱一致性）
map.forEach((k, v) -> System.out.println(k + "=" + v));
\`\`\`

Python 没有内置的并发 dict——普通 dict 在 CPython 下靠 GIL 保护，单个操作是原子的（但复合操作不是），多线程下用 \`Lock\` 包装：

\`\`\`python
import threading

class ConcurrentDict:
    def __init__(self):
        self._data = {}
        self._lock = threading.Lock()
    def put(self, k, v):
        with self._lock:
            self._data[k] = v
    def compute(self, k, fn):
        with self._lock:
            self._data[k] = fn(self._data.get(k))
    def get(self, k, default=None):
        with self._lock:
            return self._data.get(k, default)
\`\`\`

这是 GIL 的"双刃剑"——单操作原子性让简单 dict 在 CPython 下"凑合能用"，但一旦无 GIL（Python 3.13 free-threaded），就必须自己加锁。这也是 Python 移除 GIL 难的原因之一。

### 2. CopyOnWriteArrayList

Java 独有，写时复制——读极多写极少的场景。

\`\`\`java
CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();
list.add("a");  // 复制整个数组
list.add("b");
for (String s : list) { ... }  // 读无锁，迭代器是不可变快照
\`\`\`

Python 无对应，可以用 \`tuple\` 替换 + Lock 模拟。

### 3. BlockingQueue 全家桶

\`\`\`java
// Java：7 种 BlockingQueue 实现
BlockingQueue<Integer> q1 = new LinkedBlockingQueue<>();     // 链表，可选有界
BlockingQueue<Integer> q2 = new ArrayBlockingQueue<>(100);   // 数组，有界
BlockingQueue<Integer> q3 = new SynchronousQueue<>();        // 直接传递，无容量
BlockingQueue<Integer> q4 = new PriorityBlockingQueue<>();   // 优先级
BlockingQueue<Integer> q5 = new DelayQueue<>();              // 延迟
BlockingQueue<Integer> q6 = new LinkedTransferQueue<>();     // TransferQueue
BlockingQueue<Integer> q7 = new LinkedBlockingDeque<>();     // 双向
\`\`\`

\`\`\`python
# Python：queue 模块
from queue import Queue, LifoQueue, PriorityQueue, SimpleQueue
q = Queue(maxsize=100)
q.put(1); q.get()
\`\`\`

Python 的 \`queue\` 模块功能远不如 JUC 丰富——没有 DelayQueue、TransferQueue、SynchronousQueue 这些特种队列。

## 四、原子类

### Java：AtomicInteger / LongAdder / AtomicReference

\`\`\`java
import java.util.concurrent.atomic.*;

AtomicInteger counter = new AtomicInteger(0);
counter.incrementAndGet();   // ++i（原子）
counter.compareAndSet(0, 1); // CAS：如果是 0 就设为 1

LongAdder adder = new LongAdder();  // 高并发计数器，比 AtomicLong 快
adder.increment();
adder.sum();

AtomicReference<String> ref = new AtomicReference<>("init");
ref.updateAndGet(s -> s + "+1");

AtomicStampedReference<String> stamped = new AtomicStampedReference<>("v", 0);
// 带版本号，防 ABA 问题
\`\`\`

### Python：无原子类型

Python 没有原子类型。两种应对方式：

1. **靠 GIL**——CPython 下简单赋值/读是原子的（字节码层面），但复合操作（\`counter += 1\`）不是。
2. **用 Lock 包装**：

\`\`\`python
import threading
lock = threading.Lock()
counter = 0

def increment():
    global counter
    with lock:
        counter += 1
\`\`\`

性能远不如 Java 的 \`AtomicInteger\`（CAS 无锁）。Python 3.13 无 GIL 模式下，正在讨论引入原子类型，但短期内不会有。

## 五、ForkJoinPool + parallelStream vs multiprocessing.Pool

\`\`\`java
// Java：parallelStream 内部用 ForkJoinPool
long sum = LongStream.range(0, 100_000_000L)
    .parallel()
    .filter(n -> n % 2 == 0)
    .map(n -> n * n)
    .sum();

// 自定义 ForkJoinPool（避免用公共池）
ForkJoinPool pool = new ForkJoinPool(8);
int result = pool.submit(() ->
    IntStream.range(0, 1000).parallel().map(this::heavyCompute).sum()
).get();
\`\`\`

\`\`\`python
# Python：multiprocessing.Pool
from multiprocessing import Pool

def heavy_compute(n):
    return n * n

if __name__ == "__main__":
    with Pool(8) as pool:
        results = pool.map(heavy_compute, range(1000))
        total = sum(results)
\`\`\`

| 维度 | Java ForkJoinPool | Python multiprocessing.Pool |
|------|------------------|---------------------------|
| 底层 | 多线程（无 GIL）| 多进程（绕开 GIL）|
| 通信 | 共享内存（快）| pickle + IPC（慢）|
| 启动开销 | 毫秒级 | 秒级（启动 N 个解释器）|
| 内存 | 共享 JVM | 每进程独立内存 |
| 错误隔离 | 无（一个崩全崩）| 有（进程独立）|

Java ForkJoinPool 优势巨大——共享内存让数据并行计算零开销，Python multiprocessing 每次任务派发都要 pickle 序列化数据，对大数据集是噩梦。

## 六、读写锁：ReentrantReadWriteLock / StampedLock

Java 独有，Python 无内置读写锁。

\`\`\`java
// Java：ReentrantReadWriteLock
ReadWriteLock rwLock = new ReentrantReadWriteLock();
rwLock.readLock().lock();   // 多个读可同时持锁
try { readData(); } finally { rwLock.readLock().unlock(); }

rwLock.writeLock().lock();  // 写锁独占
try { writeData(); } finally { rwLock.writeLock().unlock(); }

// Java 8+：StampedLock（乐观读，更快）
StampedLock stamped = new StampedLock();
long stamp = stamped.tryOptimisticRead();  // 乐观读（不加锁）
int x = data;
if (!stamped.validate(stamp)) {  // 校验期间是否被写
    stamp = stamped.readLock();  // 升级为悲观读
    try { x = data; } finally { stamped.unlockRead(stamp); }
}
\`\`\`

Python 想要读写锁，要自己实现：

\`\`\`python
import threading

class ReadWriteLock:
    def __init__(self):
        self._read_lock = threading.Lock()
        self._write_lock = threading.Lock()
        self._readers = 0
    def acquire_read(self):
        with self._read_lock:
            self._readers += 1
            if self._readers == 1:
                self._write_lock.acquire()
    def release_read(self):
        with self._read_lock:
            self._readers -= 1
            if self._readers == 0:
                self._write_lock.release()
    def acquire_write(self):
        self._write_lock.acquire()
    def release_write(self):
        self._write_lock.release()
\`\`\`

这是 Python 并发库"残缺"的典型例子——读多写少是极常见场景，Python 竟然没有内置读写锁。

## 七、CompletableFuture vs asyncio.gather / TaskGroup

\`\`\`java
// Java：CompletableFuture 链式编排
CompletableFuture<String> f1 = CompletableFuture
    .supplyAsync(() -> "hello")
    .thenApply(s -> s + " world")
    .thenApply(String::toUpperCase);

CompletableFuture<String> f2 = CompletableFuture
    .supplyAsync(() -> "java");

// 组合两个
f1.thenCombine(f2, (a, b) -> a + " " + b)
  .thenAccept(System.out::println);  // HELLO WORLD java

// 任一完成
CompletableFuture.anyOf(
    CompletableFuture.supplyAsync(() -> fetch("fast")),
    CompletableFuture.supplyAsync(() -> fetch("slow"))
).thenAccept(System.out::println);

// 全部完成
CompletableFuture.allOf(f1, f2).join();
\`\`\`

\`\`\`python
# Python：asyncio.gather / TaskGroup
async def fetch_a():
    await asyncio.sleep(0.1)
    return "hello"

async def fetch_b():
    await asyncio.sleep(0.2)
    return "world"

async def main():
    # 全部完成
    results = await asyncio.gather(fetch_a(), fetch_b())

    # 任一完成（Python 3.11+）
    winner = await asyncio.wait(
        [asyncio.create_task(fetch_a()), asyncio.create_task(fetch_b())],
        return_when=asyncio.FIRST_COMPLETED
    )

    # TaskGroup（结构化并发）
    async with asyncio.TaskGroup() as tg:
        t1 = tg.create_task(fetch_a())
        t2 = tg.create_task(fetch_b())
    print(t1.result(), t2.result())
\`\`\`

| 维度 | Java CompletableFuture | Python asyncio |
|------|----------------------|---------------|
| 编排能力 | 极强（几十种链式方法）| 中（gather/wait/TaskGroup）|
| 异常处理 | exceptionally/handle/whenComplete | try/except + return_exceptions |
| 取消 | future.cancel(true) | task.cancel() + CancelledError |
| 超时 | orTimeout/completeOnTimeout | wait_for/wait_for |
| 重试 | 自己写 | tenacity 库 |

CompletableFuture 在"任务编排"上更强，asyncio 在"代码可读性"上更好。

## 八、反应式：Reactor / RxJava vs Python 无主流

### Java 反应式生态

\`\`\`java
// Reactor（Spring WebFlux 默认）
Flux<String> flux = Flux.just("a", "b", "c", "d")
    .map(String::toUpperCase)
    .filter(s -> s.length() == 1)
    .delayElements(Duration.ofMillis(100));

flux.subscribe(
    s -> System.out.println("got: " + s),
    err -> err.printStackTrace(),
    () -> System.out.println("done")
);

// 背压（backpressure）
Flux.range(1, 1000)
    .onBackpressureBuffer(100)
    .subscribe(new BaseSubscriber<Integer>() {
        protected void hookOnNext(Integer v) {
            request(1);  // 一次只请求一个
        }
    });
\`\`\`

\`\`\`java
// RxJava
Observable<String> obs = Observable.fromArray("a", "b", "c")
    .map(String::toUpperCase)
    .subscribeOn(Schedulers.io())
    .observeOn(Schedulers.single());
obs.subscribe(System.out::println);
\`\`\`

### Python 反应式

Python 没有主流的反应式库——虽然有人移植过 RxPY，但用得极少。原因：**asyncio 已经足够**。

\`\`\`python
# Python：用 asyncio 模拟流式处理
import asyncio

async def stream():
    for i in range(10):
        await asyncio.sleep(0.1)
        yield i  # 异步生成器

async def main():
    async for item in stream():
        print(item)

asyncio.run(main())
\`\`\`

异步生成器（\`async def\` + \`yield\`）加上 \`async for\` 已经能表达"流"的概念，再叠加 \`asyncio.gather\`、\`asyncio.Queue\` 就能实现背压控制。Python 社区认为"不需要再发明一套反应式抽象"。

这是两种不同的判断：
- **Java**：认为 IO 高并发场景复杂，需要专门的"流"抽象（Reactor/RxJava）。
- **Python**：认为 asyncio + async 生成器已经够用，反应式是过度设计。

随着 Java 21 虚拟线程普及，Java 反应式可能也会萎缩——虚拟线程让"流"模型不再必要，"同步代码 + 高并发"更简单。

## 九、综合对比表

| 工具 | Java | Python | 备注 |
|------|------|--------|------|
| 线程池 | ThreadPoolExecutor（7 参数） | ThreadPoolExecutor（1 参数） | Java 更灵活 |
| 同步器-CountDownLatch | ✓ | 自己模拟 | |
| 同步器-CyclicBarrier | ✓ | ✓（Barrier） | 唯一对等的 |
| 同步器-Phaser | ✓ | ✗ | Java 独有 |
| 同步器-Exchanger | ✓ | ✗ | Java 独有 |
| 并发 Map | ConcurrentHashMap | ✗（用 Lock 包 dict） | Java 完胜 |
| 并发 List | CopyOnWriteArrayList | ✗ | Java 独有 |
| BlockingQueue | 7 种 | 4 种 | Java 更丰富 |
| 原子类 | AtomicInteger/LongAdder/... | ✗ | Java 完胜 |
| 读写锁 | ReentrantReadWriteLock/StampedLock | ✗（自己实现） | Java 完胜 |
| ForkJoin | ForkJoinPool + parallelStream | ✗（用 multiprocessing） | Java 更轻量 |
| CompletableFuture | ✓（极强） | ✗（用 asyncio） | 编排能力 Java 强 |
| 反应式 | Reactor/RxJava/Mutiny | ✗（asyncio 够用） | 哲学差异 |
| 虚拟线程 | ✓（Java 21） | ✗（asyncio 是另一种方案） | |
| 调度任务 | ScheduledExecutorService | threading.Timer / sched | |

**结论：Java 的 JUC 在工具完整性上完胜 Python**——这是 Java 没有 GIL、必须提供完整并发工具的必然结果。Python 因为有 GIL，并发场景相对简单（IO 用 asyncio、CPU 用 multiprocessing），对工具完整性的需求没 Java 那么强烈。

## 十、何时用哪个

\`\`\`
你的场景？
│
├─ Java 项目
│   ├─ CPU 密集并行 → ForkJoinPool / parallelStream
│   ├─ IO 高并发 → 虚拟线程（Java 21+）/ CompletableFuture（旧版）
│   ├─ 任务编排 → CompletableFuture
│   ├─ 高并发 Map → ConcurrentHashMap
│   ├─ 读多写少 → CopyOnWriteArrayList / StampedLock
│   ├─ 高并发计数 → LongAdder
│   ├─ 多阶段同步 → Phaser
│   └─ 反应式需求 → Reactor（Spring WebFlux 生态）
│
└─ Python 项目
    ├─ CPU 密集 → multiprocessing.Pool / ProcessPoolExecutor
    ├─ IO 高并发 → asyncio + aiohttp
    ├─ 简单并发 → ThreadPoolExecutor
    ├─ 共享状态 → threading.Lock + dict（CPython 下凑合用）
    └─ 多进程协作 → multiprocessing.Manager / Queue
\`\`\`

## 十一、一句话总结

**Java 的 \`java.util.concurrent\` 是工业级并发库的标杆——同步器、并发容器、原子类、读写锁、ForkJoin、CompletableFuture、反应式，应有尽有；Python 的并发工具分散在多个模块、功能残缺，但 asyncio 在 IO 高并发上自成一派——这正是 GIL 让 Python"被迫精简"的结果。** 至此，并发与异步分组结束——后续章节我们将进入性能与生态等其他维度的对比。

---

> **下一章**：本批"并发与异步"至此收尾。下一批我们将进入新的分组，继续从性能、生态、工程化等维度，深度对比 Python 与 Java 的差异。`,
  },
];
