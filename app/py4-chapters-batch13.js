// =============================================================
// Batch 13：并发编程（4 章）
// 49. py4-threading       threading、GIL、Lock、ThreadPool
// 50. py4-multiproc       multiprocessing、ProcessPool、Queue
// 51. py4-asyncio         async/await、Task、gather
// 52. py4-asyncio-adv     asyncio 高级：Queue、Semaphore、超时
// =============================================================

export const chapters = [
  {
    id: "py4-threading",
    group: "并发编程",
    icon: "🧵",
    title: "线程：threading、GIL、Lock",
    content: `
## 一、概念解释

### 1.1 什么是线程
线程（Thread）是操作系统能够进行运算调度的最小单位，被包含在进程之中。一个进程可以包含多个线程，**线程之间共享进程的内存空间**（堆、全局变量、文件描述符等），但各自拥有独立的栈、寄存器和程序计数器。Python 标准库 \`threading\` 提供了面向对象的高层线程 API。

### 1.2 GIL（Global Interpreter Lock，全局解释器锁）
GIL 是 CPython 解释器层面的一把互斥锁，**保证同一时刻只有一个线程执行 Python 字节码**。即使你启动 10 个线程跑 Python 代码，任一具体时刻 CPU 也只能执行其中一个线程的字节码，其余线程只能等待这把锁。

## 二、设计原理：为什么有 GIL？

### 2.1 简化 CPython 内存管理
CPython 使用 **引用计数（reference counting）** 管理对象生命周期：每个对象内部都有 \`ob_refcnt\` 计数器，引用 +1、删除 -1，归零时回收内存。

如果多个线程同时修改同一对象的引用计数，会出现竞态条件（race condition），导致计数错乱、内存泄漏或重复释放。GIL 用一把全局锁串行化字节码执行，**让引用计数的增减天然线程安全**，极大简化了 CPython 的实现。

### 2.2 单线程性能权衡
GIL 让 CPython 单线程实现更简单更快（无锁开销），代价是多线程无法真正利用多核 CPU 跑 Python 代码。这是 CPython 的历史性取舍，Jython、IronPython 没有 GIL，但生态不如 CPython。

## 三、GIL 的影响

| 场景 | 多线程效果 | 原因 |
|------|-----------|------|
| I/O 密集（网络、文件、数据库） | ✅ 能明显提速 | I/O 阻塞时（\`socket.recv\`、\`time.sleep\`、文件读写）会主动释放 GIL，其他线程可运行 |
| CPU 密集（纯计算、加密、图像处理） | ❌ 几乎无收益，甚至更慢 | 持续执行字节码不释放 GIL，多线程串行执行 + 切换开销 |

## 四、threading.Thread 创建线程

\`\`\`python
import threading, time

def worker(n):
    print(f"thread {n} start")
    time.sleep(0.1)
    print(f"thread {n} end")

t = threading.Thread(target=worker, args=(1,))
t.start()   # 启动底层线程并开始执行
t.join()    # 阻塞主线程直到该线程结束
\`\`\`

- \`target\`：线程要执行的函数
- \`args\`：传给函数的位置参数（必须是元组，单元素要写成 \`(1,)\`）
- \`start()\`：真正创建 OS 线程并执行 \`target(*args)\`，**不要重复调用**
- \`join()\`：阻塞调用者直到该线程结束；可传 \`timeout\` 避免永久等待

## 五、Lock 互斥锁保护临界区

当多个线程访问共享可变状态时，必须加锁：

\`\`\`python
import threading

counter = 0
lock = threading.Lock()

def inc(n):
    global counter
    for _ in range(n):
        with lock:        # 进入临界区，自动 acquire
            counter += 1  # 退出 with 块时自动 release
\`\`\`

- \`with lock:\` 是 \`lock.acquire()\` / \`lock.release()\` 的语法糖，**即使中间抛异常也能正确释放锁**，强烈推荐
- 不加锁时 \`counter += 1\` 不是原子操作（读-改-写三步），多线程并发会丢失更新
- \`threading.RLock\` 是可重入锁，**同一线程可多次 acquire**，适合递归加锁场景

## 六、concurrent.futures.ThreadPoolExecutor 高层线程池

\`\`\`python
import concurrent.futures

with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
    results = list(ex.map(io_task, range(10)))
\`\`\`

- \`max_workers\`：线程池大小（默认 = min(32, cpu_count + 4)）
- \`ex.map(fn, iterable)\`：批量提交，按输入顺序返回结果
- \`ex.submit(fn, *args)\`：提交单个任务，返回 \`Future\`，用 \`future.result()\` 取结果
- \`with\` 块结束时自动 \`shutdown(wait=True)\`，等待所有任务完成

## 七、Event 线程信号

\`threading.Event\` 用于线程间简单的"通知"机制，内部维护一个布尔标志：

\`\`\`python
event = threading.Event()  # 初始为 False
def waiter():
    event.wait()       # 阻塞直到被 set，可传 timeout
    print("got signal!")

event.set()    # 置 True，唤醒所有 wait 的线程
event.clear()  # 重置为 False
event.is_set() # 查询状态
\`\`\`

适合"一个线程等条件、另一个线程触发条件"的场景，比 \`time.sleep\` 轮询更高效。

## 八、什么时候用多线程

✅ **I/O 密集型任务**：网络爬虫、HTTP API 调用、数据库查询、文件读写、日志处理
❌ **CPU 密集型任务**：请用 \`multiprocessing\` 或 C 扩展（numpy、Cython）

## 九、代码逐行讲解（对应 code 字段）

\`\`\`python
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
    results = list(ex.map(io_task, range(10)))
\`\`\`
创建 5 线程池，把 10 个任务交给池调度；I/O 里的 \`time.sleep\` 会释放 GIL，5 线程并发执行，总耗时 ≈ 10/5 × 0.1s = 0.2s，而非串行的 1.0s。

\`\`\`python
with lock:
    counter += 1
\`\`\`
临界区只有一行，但 \`+=\` 非原子，必须加锁；加锁后最终等于 40000，不加锁可能只有 30000 多（丢失更新）。

\`\`\`python
event.set()
\`\`\`
主线程发信号，waiter 线程从 \`event.wait()\` 返回并打印 \`got signal!\`。

## 十、易错点小结

| 易错点 | 说明 | 正确做法 |
|--------|------|----------|
| 不加锁访问共享变量 | 多线程 \`counter += 1\` 丢更新 | 用 \`with lock:\` 保护临界区 |
| \`Lock\` 忘记释放 | \`acquire\` 后异常导致死锁 | 用 \`with lock:\` 自动释放 |
| 忘记 \`join()\` | 主线程退出可能让子线程异常终止 | 关键路径上线程要 \`join\` |
| CPU 密集用多线程 | 受 GIL 限制无法多核加速 | 改用 \`multiprocessing\` |
| 守护线程误用 | \`daemon=True\` 主线程结束被强杀，资源未释放 | 关键清理不要放守护线程 |
| 线程数过多 | 创建/调度开销大，OS 线程有上限 | 用 \`ThreadPoolExecutor\` 控制池大小 |
| \`args\` 写成数字 | \`args=(1)\` 是 int 不是元组 | 写成 \`args=(1,)\` |
`,
    code: `import time, threading, concurrent.futures

# 1) 线程池：I/O 模拟
def io_task(n, delay=0.1):
    time.sleep(delay)
    return f"task-{n} done"

t0 = time.perf_counter()
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
    results = list(ex.map(io_task, range(10)))
print("thread pool cost:", time.perf_counter() - t0)
print("results sample:", results[:3])

# 2) Lock 保护共享变量
counter = 0
lock = threading.Lock()

def inc(n):
    global counter
    for _ in range(n):
        with lock:
            counter += 1

threads = [threading.Thread(target=inc, args=(10000,)) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
print("counter:", counter)  # 40000

# 3) Event：线程信号
event = threading.Event()
def waiter():
    event.wait()
    print("got signal!")
threading.Thread(target=waiter).start()
time.sleep(0.05)
event.set()
time.sleep(0.05)
print("done")
`,
  },
  {
    id: "py4-multiproc",
    group: "并发编程",
    icon: "⚙️",
    title: "多进程：multiprocessing、ProcessPool",
    content: `
## 一、概念解释：为什么需要多进程？

### 1.1 GIL 的限制
上一章提到 CPython 的 GIL 让多线程无法真正利用多核 CPU 跑 Python 字节码。**多进程（multiprocessing）是绕开 GIL 的标准方案**：每个进程都有自己独立的 Python 解释器实例、独立的 GIL、独立的内存空间，因此多个进程可以真正并行地在多个 CPU 核心上执行 Python 代码。

### 1.2 进程 vs 线程的本质区别
- **进程**：操作系统资源分配的基本单位，内存独立、互不干扰
- **线程**：CPU 调度的基本单位，共享所属进程的内存

Python 的 \`multiprocessing\` 模块通过 \`fork\`（Unix）/ \`spawn\`（Windows/macOS 默认）创建子进程，每个子进程都是完整的 Python 解释器。

## 二、multiprocessing.Process 创建进程

\`\`\`python
import multiprocessing, time

def worker(n):
    print(f"process {n} pid={multiprocessing.current_process().pid}")
    time.sleep(0.1)

if __name__ == "__main__":
    p = multiprocessing.Process(target=worker, args=(1,))
    p.start()   # 创建子进程并执行
    p.join()    # 等待子进程结束
\`\`\`

- API 和 \`threading.Thread\` 几乎一致：\`target\` / \`args\` / \`start()\` / \`join()\`
- 但底层是**全新进程**而非线程，开销远大于线程

## 三、ProcessPoolExecutor 进程池

\`\`\`python
import concurrent.futures

with concurrent.futures.ProcessPoolExecutor() as ex:
    results = list(ex.map(cpu_task, [N] * 4))
\`\`\`

- 接口与 \`ThreadPoolExecutor\` 完全一致，**只是把线程换成进程**
- 默认 \`max_workers = os.cpu_count()\`，充分利用多核
- 任务函数必须可被 pickle 序列化（顶层函数，不能用 lambda / 闭包）

## 四、进程间内存不共享

每个子进程是独立的 Python 解释器，**全局变量在子进程里是 fork/spawn 时刻的副本**，修改不会影响主进程：

\`\`\`python
counter = 0
def inc():
    global counter
    counter += 1   # 只改子进程自己的副本
\`\`\`

主进程 \`counter\` 永远是 0。要共享状态必须用通信机制。

## 五、进程间通信：Queue / Pipe

### 5.1 multiprocessing.Queue（进程安全队列）
\`\`\`python
from multiprocessing import Process, Queue

def producer(q):
    q.put("hello")   # 任意 pickle-able 对象
def consumer(q):
    print(q.get())   # 阻塞直到有数据

q = Queue()
Process(target=producer, args=(q,)).start()
Process(target=consumer, args=(q,)).start()
\`\`\`
底层用管道 + pickle 传递，**自动跨进程**。

### 5.2 multiprocessing.Pipe（双向管道）
\`\`\`python
from multiprocessing import Pipe
parent_conn, child_conn = Pipe()
parent_conn.send([1, 2, 3])
print(child_conn.recv())  # [1, 2, 3]
\`\`\`
适合两个进程间点对点通信，比 Queue 轻量。

### 5.3 共享内存（高级）
\`multiprocessing.Value\` / \`multiprocessing.Manager\` 可在进程间共享基本类型或容器，但有同步开销，一般优先用 Queue。

## 六、if __name__ == "__main__" 保护（关键！）

### 6.1 为什么必须写
Windows 和 macOS 默认用 \`spawn\` 模式创建子进程：子进程启动时会**重新 import 主模块**。如果不加保护，子进程 import 时会再次执行 \`Process(...).start()\`，导致**无限递归创建进程**，最终触发 \`RuntimeError\` 或崩溃。

### 6.2 正确写法
\`\`\`python
def cpu_task(n):
    ...

if __name__ == "__main__":
    # 在这里创建 Process / Pool
    with concurrent.futures.ProcessPoolExecutor() as ex:
        ...
\`\`\`

Unix 用 \`fork\` 模式理论上不需要，但**为了跨平台兼容，强烈建议永远写**。

## 七、多进程开销比线程大

| 维度 | 线程 | 进程 |
|------|------|------|
| 启动时间 | 微秒级 | 毫秒级（要启动解释器） |
| 内存占用 | 共享进程内存，约 8MB 栈上限 | 每个几十 MB 起步 |
| 通信成本 | 直接读共享变量（要加锁） | 必须用 Queue/Pipe，需 pickle 序列化 |
| 切换成本 | 内核态切换 | 内核态切换，TLB 失效更多 |

所以进程数不是越多越好，**通常等于 CPU 核心数**即可。

## 八、什么时候用多进程

✅ **CPU 密集型任务**：数值计算、图像处理、加密解密、视频编码、机器学习推理（绕开 GIL）
❌ **I/O 密集型任务**：用线程或 asyncio 更合适（进程开销大且通信麻烦）

## 九、线程 vs 进程对比表

| 对比维度 | threading | multiprocessing |
|---------|-----------|-----------------|
| 是否受 GIL 限制 | ✅ 受限 | ❌ 不受限 |
| 是否真并行 | ❌（仅并发） | ✅（多核并行） |
| 内存是否共享 | ✅ 共享 | ❌ 独立 |
| 通信方式 | 共享变量 + Lock | Queue/Pipe/共享内存 |
| 启动开销 | 小 | 大 |
| 适用场景 | I/O 密集 | CPU 密集 |
| 跨平台陷阱 | 较少 | Windows/macOS 需 \`__main__\` 保护 |
| 调试难度 | 中（竞态难复现） | 高（pickle 报错、僵尸进程） |

## 十、代码逐行讲解（对应 code 字段）

\`\`\`python
def cpu_task(n):
    s = 0
    for i in range(n):
        s += i * i
    return s
\`\`\`
纯 Python 计算，受 GIL 限制严重，是测试多进程价值的典型场景。

\`\`\`python
with concurrent.futures.ProcessPoolExecutor() as ex:
    results = list(ex.map(cpu_task, [N] * 4))
\`\`\`
4 个任务分给 4 个进程并行执行，**总耗时 ≈ 单任务耗时**（理想情况下），而非 4 倍。

\`\`\`python
with concurrent.futures.ThreadPoolExecutor(2) as ex:
    list(ex.map(cpu_bench, [N, N]))
\`\`\`
对比组：同样 2 个 CPU 任务用线程池，受 GIL 限制变成串行，耗时 ≈ 2 倍单任务。

\`\`\`python
with concurrent.futures.ProcessPoolExecutor(2) as ex:
    list(ex.map(cpu_bench, [N, N]))
\`\`\`
进程池版本：2 个进程真并行，耗时 ≈ 1 倍单任务，明显快于线程版。

## 十一、易错点小结

| 易错点 | 说明 | 正确做法 |
|--------|------|----------|
| 缺 \`if __name__ == "__main__":\` | Windows/macOS 上递归创建进程崩溃 | 创建进程的代码全部放进该保护块 |
| 任务函数用了 lambda/闭包 | \`spawn\` 模式无法 pickle | 改成顶层 \`def\` 函数 |
| 以为全局变量能跨进程共享 | 子进程拿到的是副本，修改无效 | 用 \`Queue\`/\`Manager\` 通信 |
| 进程池 \`max_workers\` 过大 | 内存爆炸、上下文切换频繁 | 设为 \`os.cpu_count()\` |
| I/O 任务用进程池 | 启动开销远超收益 | I/O 用线程/asyncio |
| 子进程异常被吞 | \`Process\` 异常不会自动传到主进程 | 用 \`ProcessPoolExecutor\` 的 \`Future.result()\` 拿异常 |
| \`Queue\` 死锁 | put 满了/消费端没启动 | 设 \`maxsize\` 或用 \`put_nowait\` 配合异常处理 |
| 子进程没 \`join\` | 主进程退出可能留下僵尸进程 | \`Process\` 要 \`join\`，池子用 \`with\` 自动关闭 |
`,
    code: `import time, concurrent.futures, multiprocessing

# CPU 密集：多进程加速
def cpu_task(n):
    s = 0
    for i in range(n):
        s += i * i
    return s

if __name__ == "__main__":
    N = 200_000
    t0 = time.perf_counter()
    with concurrent.futures.ProcessPoolExecutor() as ex:
        results = list(ex.map(cpu_task, [N] * 4))
    print("process pool cost:", time.perf_counter() - t0)
    print("results sample:", results[:2])

# 线程 vs 进程对比（CPU 密集）
def cpu_bench(n):
    s = 0
    for i in range(n):
        s += i
    return s

if __name__ == "__main__":
    N = 5_000_000
    t0 = time.perf_counter()
    cpu_bench(N)
    print("serial:", time.perf_counter() - t0)

    t0 = time.perf_counter()
    with concurrent.futures.ThreadPoolExecutor(2) as ex:
        list(ex.map(cpu_bench, [N, N]))
    print("threads:", time.perf_counter() - t0, "(GIL 限制)")

    t0 = time.perf_counter()
    # ProcessPool 在 Windows 需要 __main__ 保护
    with concurrent.futures.ProcessPoolExecutor(2) as ex:
        list(ex.map(cpu_bench, [N, N]))
    print("process:", time.perf_counter() - t0)
`,
  },
  {
    id: "py4-asyncio",
    group: "并发编程",
    icon: "⚡",
    title: "asyncio：async/await 基础",
    content: `
## 一、概念解释

### 1.1 什么是协程
协程（coroutine）是一种**用户态的轻量并发单元**，由事件循环（event loop）在单线程内调度。与线程不同，协程的"挂起/恢复"完全由程序员通过 \`await\` 显式控制，**没有内核态切换开销**，也不需要锁。

### 1.2 async def 定义协程函数
\`\`\`python
async def say(msg, delay):
    await asyncio.sleep(delay)
    return msg
\`\`\`

- 用 \`async def\` 定义的函数叫**协程函数**，**调用它不会立即执行**，而是返回一个**协程对象**（coroutine object）
- 协程对象必须交给事件循环调度才能跑起来；直接 \`say("hi", 0.1)\` 不会执行任何代码，只会得到一个未启动的协程对象
- 协程函数内部可以用 \`await\` 等待其他协程

### 1.3 await 挂起等待
\`await\` 表示**让出控制权**给事件循环，直到被等待的协程/未来完成：

\`\`\`python
result = await some_coro()
\`\`\`

- 执行到 \`await\` 时，当前协程**挂起**，事件循环可以去调度其他就绪的协程
- 被等待对象完成后，事件循环**恢复**当前协程，\`await\` 表达式返回结果
- 只能在 \`async def\` 函数内部使用 \`await\`（顶层 await 仅在 3.8+ 的某些环境支持）

## 二、asyncio.run(main()) 入口（3.7+）

\`\`\`python
async def main():
    await asyncio.gather(...)

asyncio.run(main())
\`\`\`

- \`asyncio.run\` 是 3.7+ 推荐的入口，**自动创建事件循环**、运行 \`main()\` 协程、循环结束后清理关闭
- 一个程序里通常只调用一次 \`asyncio.run\`，不要嵌套调用
- 3.7 之前需要手动 \`loop = asyncio.get_event_loop(); loop.run_until_complete(main())\`

## 三、asyncio.create_task(coro) 调度协程并发

\`\`\`python
task = asyncio.create_task(say("A", 0.1))
# 此时 say 已经被事件循环调度，主协程继续执行
result = await task  # 等待 task 完成
\`\`\`

- \`create_task\` 把协程**包装成 Task 对象并立即提交事件循环调度**
- 不 await 它也会在后台执行（只要事件循环在跑）
- 区别：\`await coro()\` 是**串行等待**；\`task = create_task(coro()); await task\` 是**先调度再等待**，中间可插其他逻辑

## 四、asyncio.gather(*coros) 并发等待多个协程

\`\`\`python
# 串行：总耗时 = 0.1 + 0.1 = 0.2s
a = await say("A", 0.1)
b = await say("B", 0.1)

# 并发：总耗时 ≈ max(0.1, 0.1) = 0.1s
a, b = await asyncio.gather(say("A", 0.1), say("B", 0.1))
\`\`\`

- \`gather\` 同时启动多个协程，**等全部完成**返回结果列表（顺序与输入一致）
- \`return_exceptions=True\` 时异常作为结果返回，不抛出；默认任一协程抛异常会向上传播
- 是 asyncio 中最常用的并发原语

## 五、协程不是线程

| 维度 | 协程（asyncio） | 线程（threading） |
|------|----------------|------------------|
| 调度方 | 用户态事件循环 | 操作系统内核 |
| 并发模型 | 单线程内协作式 | 多线程抢占式 |
| 切换成本 | 极低（仅保存少量寄存器） | 高（内核态切换） |
| 是否需要锁 | 一般不需要（单线程无竞态） | 需要 Lock |
| 数量上限 | 单进程可跑数万协程 | 通常几百到几千 |
| 抢占 | 不可抢占（必须 await 让出） | 可被内核随时打断 |

**关键：协程是单线程内的并发**，所有协程共享一个线程的栈，靠 \`await\` 主动让出，因此**不需要 Lock 保护共享变量**（只要不在 await 之间发生竞态）。

## 六、适合 I/O 密集场景

✅ **适合**：HTTP 请求（aiohttp）、数据库查询（asyncpg）、Redis（aioredis）、文件 I/O（aiofiles）、WebSocket
❌ **不适合**：CPU 密集（依然受 GIL，且会阻塞事件循环），应用 \`multiprocessing\` 或 \`run_in_executor\`

## 七、和线程的区别（核心）

1. **更轻量**：单进程可创建数万协程，线程通常几百就到上限
2. **无锁**：单线程 + 协作式调度，访问共享变量无需 Lock
3. **单线程**：协程跑在同一线程，**任何阻塞调用都会卡死整个事件循环**——必须用 \`await\` 版本的异步库
4. **协作式**：协程必须主动 \`await\` 让出 CPU；如果一个协程死循环不让出，其他协程全部饿死

## 八、代码逐行讲解（对应 code 字段）

\`\`\`python
async def say(msg, delay):
    await asyncio.sleep(delay)
    return f"{msg} after {delay}s"
\`\`\`
\`asyncio.sleep\` 是 \`time.sleep\` 的异步版本，**会挂起协程并让出事件循环**，期间其他协程可运行。绝不要在协程里调 \`time.sleep\`，那会阻塞整个循环。

\`\`\`python
a = await say("A", 0.1)
b = await say("B", 0.1)
\`\`\`
串行 await：必须等 A 完成才发起 B，总耗时 0.2s。

\`\`\`python
a, b = await asyncio.gather(say("A", 0.1), say("B", 0.1))
\`\`\`
gather 并发：A 和 B 同时挂起，总耗时 ≈ 0.1s。**这是 asyncio 最常见的优化模式**。

\`\`\`python
tasks = [asyncio.create_task(worker(i)) for i in range(3)]
tasks[1].cancel()
results = await asyncio.gather(*tasks, return_exceptions=True)
\`\`\`
- \`create_task\` 立即调度 3 个任务
- \`tasks[1].cancel()\` 给 1 号任务发取消信号，\`worker\` 内部 \`await\` 处会抛 \`CancelledError\`
- \`return_exceptions=True\` 让被取消的任务以异常对象形式返回，不让整个 gather 失败

\`\`\`python
except asyncio.CancelledError:
    print(f"task {n} cancelled")
    raise   # 重要：捕获后要重新抛出，否则取消会被吞掉
\`\`\`

\`\`\`python
results = await asyncio.gather(
    *[fake_fetch(f"http://x/{i}") for i in range(10)]
)
\`\`\`
并发抓 10 个 URL，总耗时 ≈ 0.1s（而非串行的 1.0s），这是高并发爬虫/批量 API 调用的核心收益。

## 九、易错点小结

| 易错点 | 说明 | 正确做法 |
|--------|------|----------|
| 调用协程不 await | \`coro()\` 只返回对象不执行 | 必须 \`await coro()\` 或 \`create_task(coro())\` |
| 协程里用 \`time.sleep\` | 阻塞整个事件循环 | 用 \`await asyncio.sleep\` |
| 协程里调阻塞 I/O | \`requests.get\` 卡死循环 | 用 aiohttp / \`asyncio.to_thread\` |
| 忘记 \`asyncio.run\` | 协程永远不执行 | 入口用 \`asyncio.run(main())\` |
| \`gather\` 异常处理 | 默认任一失败全停 | 用 \`return_exceptions=True\` 收集异常 |
| \`CancelledError\` 被吞 | \`except\` 后不 \`raise\` 导致取消无效 | 捕获后重新 \`raise\` |
| 嵌套 \`asyncio.run\` | 在已有循环里再开循环报错 | 全程只用一个 \`run\`，内部用 \`create_task\`/\`gather\` |
| 顶层 await | 在普通函数里 \`await\` 语法错误 | \`await\` 只能出现在 \`async def\` 内 |
| Task 未保留引用 | 被 GC 回收任务莫名消失 | \`tasks = [create_task(...)]\` 持有引用 |
`,
    code: `import asyncio, time

# 基础协程
async def say(msg, delay):
    await asyncio.sleep(delay)
    return f"{msg} after {delay}s"

async def main_basic():
    # 串行
    t0 = time.perf_counter()
    a = await say("A", 0.1)
    b = await say("B", 0.1)
    print("serial:", a, b, "cost:", time.perf_counter() - t0)
    
    # 并发
    t0 = time.perf_counter()
    a, b = await asyncio.gather(say("A", 0.1), say("B", 0.1))
    print("gather:", a, b, "cost:", time.perf_counter() - t0)

asyncio.run(main_basic())

# Task 生命周期
async def worker(n):
    try:
        await asyncio.sleep(1)
        return n * 2
    except asyncio.CancelledError:
        print(f"task {n} cancelled")
        raise

async def main_task():
    tasks = [asyncio.create_task(worker(i)) for i in range(3)]
    await asyncio.sleep(0.05)
    tasks[1].cancel()
    results = await asyncio.gather(*tasks, return_exceptions=True)
    print("results:", results)

asyncio.run(main_task())

# 异步 HTTP 模拟
async def fake_fetch(url, delay=0.1):
    await asyncio.sleep(delay)
    return {"url": url, "status": 200}

async def main_fetch():
    t0 = time.perf_counter()
    results = await asyncio.gather(
        *[fake_fetch(f"http://x/{i}") for i in range(10)]
    )
    print("fetch cost:", time.perf_counter() - t0)
    print("first:", results[0])

asyncio.run(main_fetch())
`,
  },
  {
    id: "py4-asyncio-adv",
    group: "并发编程",
    icon: "🚀",
    title: "asyncio 高级：Queue、Semaphore、超时",
    content: `
## 一、概念解释

本章讲解 asyncio 进阶原语：用于协程间通信、限流、超时控制、互斥、桥接同步代码、结构化并发。它们让 asyncio 能应对真实生产场景（高并发爬虫、批处理、限流保护等）。

## 二、asyncio.Queue 异步生产者/消费者

\`asyncio.Queue\` 是协程间通信的标准工具，API 与 \`queue.Queue\` 类似但**全部方法都是协程**：

\`\`\`python
q = asyncio.Queue(maxsize=10)

async def producer(q):
    for i in range(5):
        await q.put(i)        # 满了会挂起等待
    await q.put(None)         # 哨兵表示结束

async def consumer(q):
    while True:
        item = await q.get()  # 空了会挂起等待
        if item is None:
            break
        print(item)
        q.task_done()         # 通知队列任务完成
\`\`\`

- \`put\` / \`get\` 都是 \`async\`，会**让出事件循环**而非阻塞线程
- \`maxsize\` 可背压（backpressure），防止生产过快消费不过来
- 哨兵（None）是常见的"结束信号"约定
- 配合 \`q.join()\` 可等待所有 \`task_done\` 被调用

## 三、asyncio.Semaphore 限制并发数

防止打爆下游服务（数据库连接池、API 限流）：

\`\`\`python
sem = asyncio.Semaphore(3)   # 同时最多 3 个协程进入

async def bounded_fetch(url):
    async with sem:           # 超过 3 个会等待
        return await fetch(url)

await asyncio.gather(*[bounded_fetch(u) for u in urls])
\`\`\`

- \`async with sem\` 是 \`await sem.acquire()\` / \`sem.release()\` 的语法糖
- 即使抛异常也会正确 release
- 10 个请求 + Semaphore(3) → 总耗时 ≈ ceil(10/3) × 单次耗时
- **区别于 Semaphore 的同步版本**：这里是协程级，单线程内生效

## 四、asyncio.wait_for(coro, timeout) 超时取消

\`\`\`python
try:
    result = await asyncio.wait_for(slow(), timeout=0.5)
except asyncio.TimeoutError:
    print("超时！")
\`\`\`

- 超时后 \`wait_for\` 会**自动取消**被等待的协程（向其 \`await\` 处抛 \`CancelledError\`）
- 协程内部的 \`try/except CancelledError\` 不该吞掉这个异常（除非有清理需要并重新 raise）
- Python 3.11+ 超时异常类型为 \`asyncio.TimeoutError\`（实际就是 \`TimeoutError\` 别名）
- 注意：\`timeout=0\` 表示"立即超时"，\`timeout=None\` 表示不限时

## 五、asyncio.Lock 异步锁

虽然单线程协程通常无需锁，但**当多个协程在 await 之间访问共享资源**时仍可能竞态：

\`\`\`python
lock = asyncio.Lock()
async def update():
    async with lock:
        # 临界区：多个 await 之间不会被其他协程插入
        await read()
        await write()
\`\`\`

- \`async with lock\` 是 \`await lock.acquire()\` / \`lock.release()\` 的语法糖
- 与 \`threading.Lock\` 区别：\`asyncio.Lock\` 不阻塞线程，只阻塞协程
- 大多数纯内存操作无需 Lock，**只有跨多个 await 的复合操作才需要**

## 六、asyncio.to_thread() 桥接同步阻塞代码（3.9+）

在协程里调用同步阻塞函数（\`requests.get\`、\`time.sleep\`、旧 SDK）会卡死事件循环，\`to_thread\` 把它丢到线程池：

\`\`\`python
import asyncio, requests

async def fetch(url):
    # 同步 requests.get 在独立线程跑，不阻塞循环
    return await asyncio.to_thread(requests.get, url)
\`\`\`

- 3.9+ 标准库，等价于 \`loop.run_in_executor(None, fn, *args)\` 但更简洁
- 适合**没有异步版本的库**或一次性兼容旧代码
- 长期方案仍建议换用原生异步库（aiohttp 等）

## 七、asyncio.TaskGroup 结构化并发（3.11+）

\`TaskGroup\` 是 3.11 引入的**结构化并发**原语，比 \`gather\` 更安全：

\`\`\`python
async with asyncio.TaskGroup() as tg:
    for i in range(5):
        tg.create_task(task(i))
# 退出 with 块时自动等待所有任务完成
\`\`\`

- **任一任务抛异常 → 整组任务自动取消**，避免任务泄漏
- \`with\` 块结束时保证所有任务已结束（成功/失败/取消）
- 异常会以 **ExceptionGroup** 形式抛出，用 \`except*\` 处理：

\`\`\`python
try:
    async with asyncio.TaskGroup() as tg:
        tg.create_task(task(0))
        tg.create_task(task(1))   # 假设抛 ValueError
except* ValueError as eg:
    # eg 是 ExceptionGroup，eg.exceptions 是异常列表
    print("captured:", [str(e) for e in eg.exceptions])
except* TypeError as eg:
    # 可以分别捕获不同类型
    ...
\`\`\`

### 7.1 except\* 语法（3.11+）
\`except*\` 是配合 ExceptionGroup 的新语法，**按类型分别匹配**组内异常，每个分支收到一个 ExceptionGroup 子组。可以同时处理多种异常而不互相屏蔽。

### 7.2 TaskGroup vs gather

| 对比项 | \`asyncio.gather\` | \`asyncio.TaskGroup\` |
|--------|-------------------|----------------------|
| Python 版本 | 3.7+ | 3.11+ |
| 任一失败时其他任务 | 默认继续（除非异常传播） | **自动全部取消** |
| 异常形式 | 单个异常 | ExceptionGroup |
| 推荐度 | 兼容旧代码用 | **新代码首选** |
| 结构化保证 | 弱（需手动管理） | 强（with 块内必完成） |

## 八、代码逐行讲解（对应 code 字段）

\`\`\`python
async def producer(q):
    for i in range(5):
        await q.put(i)
        await asyncio.sleep(0.01)
    for _ in range(2):
        await q.put(None)   # 2 个哨兵对应 2 个消费者
\`\`\`
2 个消费者各收到一个 \`None\` 才会同时退出，避免一个消费者提前结束导致另一个永远等不到哨兵。

\`\`\`python
sem = asyncio.Semaphore(3)
async with sem:
    await asyncio.sleep(0.05)
\`\`\`
10 个任务 + Semaphore(3)：每批 3 个并发，总耗时 ≈ ceil(10/3) × 0.05s ≈ 0.2s。

\`\`\`python
await asyncio.wait_for(slow(), timeout=0.05)
\`\`\`
\`slow()\` 要 sleep 10s，0.05s 后被取消并抛 \`TimeoutError\`。

\`\`\`python
async with asyncio.TaskGroup() as tg:
    for i in range(5):
        tg.create_task(task(i))
except* ValueError as eg:
    print("TaskGroup errors:", [str(e) for e in eg.exceptions])
\`\`\`
\`task(1)\` 抛 ValueError → 整组其他任务被取消 → 异常以 ExceptionGroup 形式抛出，\`except*\` 捕获并打印所有 ValueError。

## 九、易错点小结

| 易错点 | 说明 | 正确做法 |
|--------|------|----------|
| \`Queue\` 哨兵数量错 | 消费者数 ≠ 哨兵数导致死锁 | 哨兵数 = 消费者数 |
| \`Semaphore\` 用成 \`threading.Semaphore\` | 阻塞线程 | 用 \`asyncio.Semaphore\` |
| \`wait_for\` 超时后未清理资源 | 协程被取消但连接未关闭 | 在 \`finally\` 里释放资源 |
| \`TimeoutError\` 类型混淆 | 3.11 前后类型略有差异 | 用 \`asyncio.TimeoutError\` 兼容 |
| 滥用 \`asyncio.Lock\` | 纯内存操作过度加锁 | 仅跨多个 await 的复合操作才用 |
| \`to_thread\` 用了 CPU 密集 | 仍受 GIL，意义不大 | CPU 密集用 \`ProcessPoolExecutor\` |
| \`TaskGroup\` 在 3.10 用 | 语法报错 | 3.11+ 才支持，旧版本用 \`gather\` |
| \`except*\` 漏掉异常类型 | 未匹配的异常会重新抛出 | 列出所有可能异常或用 \`except BaseExceptionGroup\` 兜底 |
| 任务异常被吞 | TaskGroup 任一失败应让全组停 | 不要在任务内吞 \`CancelledError\` |
| \`Queue\` 不限 \`maxsize\` | 生产过快内存爆炸 | 设 \`maxsize\` 实现背压 |
`,

    code: `import asyncio

# 1) Queue：生产者/消费者
async def producer(q):
    for i in range(5):
        await q.put(i)
        await asyncio.sleep(0.01)
    for _ in range(2):
        await q.put(None)  # 哨兵

async def consumer(q, name):
    while True:
        item = await q.get()
        if item is None:
            break
        print(f"consumer {name}: {item}")
        await asyncio.sleep(0.02)

async def main_queue():
    q = asyncio.Queue()
    await asyncio.gather(producer(q), consumer(q, "A"), consumer(q, "B"))

asyncio.run(main_queue())

# 2) Semaphore：限流
sem = asyncio.Semaphore(3)

async def bounded_fetch(url):
    async with sem:
        await asyncio.sleep(0.05)
        return f"fetched {url}"

async def main_sem():
    t0 = asyncio.get_event_loop().time()
    await asyncio.gather(*[bounded_fetch(f"u{i}") for i in range(10)])
    print("bounded cost:", asyncio.get_event_loop().time() - t0)

asyncio.run(main_sem())

# 3) 超时
async def slow():
    await asyncio.sleep(10)

async def main_timeout():
    try:
        await asyncio.wait_for(slow(), timeout=0.05)
    except TimeoutError:
        print("timeout!")

asyncio.run(main_timeout())

# 4) TaskGroup（3.11+）
async def task(n):
    await asyncio.sleep(0.01)
    if n == 1:
        raise ValueError(f"task {n} failed")
    return n

async def main_tg():
    results = []
    try:
        async with asyncio.TaskGroup() as tg:
            for i in range(5):
                tg.create_task(task(i))
    except* ValueError as eg:
        print("TaskGroup errors:", [str(e) for e in eg.exceptions])

asyncio.run(main_tg())
`,
  },
];