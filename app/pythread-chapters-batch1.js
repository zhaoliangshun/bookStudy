// =============================================================
// Python 线程与进程教程 - batch1
// 章节 1-8：并发基础概念 + threading 多线程入门
// =============================================================

export const chapters = [
  // -----------------------------------------------------------
  // 第 1 章：什么是并发与并行
  // -----------------------------------------------------------
  {
    id: "pythread-01",
    group: "并发基础概念",
    icon: "🚀",
    title: "什么是并发与并行？为什么要学并发？",
    content: `## 从"一次做一件事"说起

我们先看一个生活中的例子：你正在写作业，突然口渴了想去倒水。你有两种做法：

1. **串行**：放下笔 → 走到饮水机 → 倒水 → 喝完 → 走回来 → 继续写作业。一件事做完再做下一件。
2. **并发**：把水壶放在火上烧水，**趁烧水的时间继续写作业**，水烧开后去倒水。在等待一件事的同时做另一件事。

计算机也是一样的道理。早期 CPU 只有一个核心，一次只能执行一条指令。但人在等待时（比如等网络响应、等磁盘读取）CPU 其实是闲着的，于是人们发明了"并发"——让 CPU 在等待时去干别的事，从而提高整体效率。

## 三个核心概念：并发、并行、串行

| 概念 | 含义 | 例子 |
|------|------|------|
| **串行 (Serial)** | 一个任务做完再做下一个，严格按顺序 | 排队买饭，前一个人买完才轮到你 |
| **并发 (Concurrency)** | 多个任务"交替"推进，同一时刻只有一个在执行，但因为切换很快，看起来像同时进行 | 一个厨师同时做三道菜：切菜→烧水→炒肉，来回切换 |
| **并行 (Parallelism)** | 多个任务"真正同时"执行，需要多核 CPU | 三个厨师各做一道菜，真正同时进行 |

> **关键区别**：并发是"交替执行"（一个 CPU 核心轮流处理多个任务），并行是"同时执行"（多个 CPU 核心各处理各的）。并发强调"同时处理多个任务的能力"，并行强调"同时执行多个任务的状态"。

## 为什么要学并发？

学习并发能帮我们解决三大问题：

### 1. 提高速度（性能）
假设你要下载 100 个网页：
- 串行下载：一个下完再下下一个，总共 100 秒
- 并发下载：10 个同时下，总共约 10 秒

### 2. 提高资源利用率
CPU 速度远快于网络和磁盘。当程序等待网络响应时，CPU 可以去处理其他任务，而不是干等。

### 3. 更好地响应交互
图形界面程序用并发后，后台处理大任务时，界面不会卡死，用户仍能点击按钮。

## Python 中的并发工具有哪些？

Python 提供了三套主要的并发工具，各有适用场景：

| 工具 | 模块 | 适用场景 | 本教程章节 |
|------|------|---------|-----------|
| **多线程** | \`threading\` | IO 密集型（网络、文件、等待） | 第 2 部分 |
| **多进程** | \`multiprocessing\` | CPU 密集型（计算、加密） | 第 3 部分 |
| **异步** | \`asyncio\` | 高并发 IO（如 Web 服务器） | 第 6 部分 |
| **子进程** | \`subprocess\` | 调用外部程序 | 第 5 部分 |

## 本教程的学习路线

1. **基础概念**（第 1-4 章）：先把并发、进程、线程、GIL 这些概念彻底搞懂
2. **threading 多线程**（第 5-18 章）：从创建线程到各种同步工具，配大量 demo
3. **multiprocessing 多进程**（第 19-28 章）：进程创建、通信、同步、进程池
4. **性能与选型**（第 29-32 章）：什么时候用线程，什么时候用进程
5. **subprocess 子进程**（第 33-34 章）：调用外部命令
6. **asyncio 异步编程**（第 39-48 章）：协程、事件循环、gather/wait、Queue、与线程池协作
7. **综合实战**（第 35-38 章）：把所学用到真实场景（含 asyncio vs threading 对比）

## 第一个 demo：感受并发的威力

下面这个 demo 用串行和并发两种方式执行同样的"等待任务"，对比耗时。我们用 \`time.sleep()\` 模拟 IO 等待（比如网络请求），用 \`threading\` 实现并发。运行后你会看到：并发版本快了很多！

> 💡 **学习建议**：每个 demo 都请点击"运行代码"实际跑一遍，观察输出顺序和耗时，这是理解并发的关键。`,
    code: `# 第一章 demo：感受并发的威力
# 用 time.sleep 模拟"耗时的等待操作"（比如网络请求、磁盘读写）
# 对比"串行执行"和"并发执行"的耗时差异

import time                      # 时间模块，用于计时和模拟等待
import threading                 # Python 标准库的线程模块

def task(name, seconds):
    """模拟一个耗时的任务：sleep seconds 秒后打印完成信息。
    在真实程序中，这里可能是：
      - 发起网络请求（requests.get）
      - 读写文件
      - 查询数据库
    这些操作的共同点是：CPU 大部分时间在"等待"，而不是在"计算"。
    """
    print(f"  [{name}] 开始执行，需要 {seconds} 秒...")
    time.sleep(seconds)          # 模拟等待：这段时间 CPU 其实是空闲的
    print(f"  [{name}] 完成！")

print("=" * 50)
print("方式一：串行执行（一个做完再做下一个）")
print("=" * 50)
start = time.time()              # 记录开始时间
task("任务A", 1)                 # 做任务A，耗时1秒
task("任务B", 1)                 # 再做任务B，耗时1秒
task("任务C", 1)                 # 再做任务C，耗时1秒
serial_time = time.time() - start
print(f"串行总耗时: {serial_time:.2f} 秒\\n")

print("=" * 50)
print("方式二：并发执行（三个任务同时开始）")
print("=" * 50)
start = time.time()
# 创建三个线程，每个线程执行一个 task
# threading.Thread(target=函数, args=参数元组) 创建线程对象
threads = []
for name in ["任务A", "任务B", "任务C"]:
    t = threading.Thread(target=task, args=(name, 1))
    threads.append(t)
    t.start()                    # start() 启动线程，开始执行 task 函数

# join() 的作用：主线程在这里等待，直到该子线程执行完毕才继续
# 如果不 join，主线程会直接往下走，可能子线程还没结束程序就退出了
for t in threads:
    t.join()

concurrent_time = time.time() - start
print(f"并发总耗时: {concurrent_time:.2f} 秒\\n")

print("=" * 50)
print("结论对比")
print("=" * 50)
print(f"串行: {serial_time:.2f}s  vs  并发: {concurrent_time:.2f}s")
print(f"并发比串行快了约 {serial_time / concurrent_time:.1f} 倍！")
print("\\n原理：三个任务都在'等待'（sleep），并发让它们同时等待，")
print("所以总耗时接近最长的一个任务，而不是三个任务之和。")`,
  },

  // -----------------------------------------------------------
  // 第 2 章：进程与线程的本质区别
  // -----------------------------------------------------------
  {
    id: "pythread-02",
    group: "并发基础概念",
    icon: "🔍",
    title: "进程与线程的本质区别",
    content: `## 一句话理解

- **进程**：程序运行起来的一个"实例"。操作系统分配资源（内存、文件句柄）的基本单位。可以理解为"一个正在运行的程序"。
- **线程**：进程内部的一个"执行流"。CPU 调度的基本单位。一个进程可以有多个线程，它们共享进程的资源。

## 用厨房打比方

把计算机比作一家餐厅：

| 概念 | 厨房比喻 | 说明 |
|------|---------|------|
| **程序** | 菜谱 | 静态的，存在硬盘上，没运行时就是一堆文件 |
| **进程** | 一个厨房 | 有独立的灶台、锅碗瓢盆（独立内存空间） |
| **线程** | 厨房里的厨师 | 厨师共享厨房的设备（共享内存），但各自做各自的菜 |

- 开一个新进程 = 新建一个厨房，**成本高**（要搬设备、装修）
- 开一个新线程 = 在现有厨房加一个厨师，**成本低**（共用设备）

## 核心区别对照表

| 维度 | 进程 | 线程 |
|------|------|------|
| **内存** | 各自独立，互不干扰 | 同一进程内的线程共享内存 |
| **创建开销** | 大（要复制内存空间） | 小（共享内存） |
| **通信方式** | 复杂（需用 Queue/Pipe/共享内存） | 简单（直接读写共享变量） |
| **安全性** | 一个进程崩溃不影响其他进程 | 一个线程崩溃可能拖垮整个进程 |
| **Python GIL** | 每个进程有独立 GIL，能真正并行 | 同一进程线程受 GIL 限制，不能真正并行 |
| **数量上限** | 几十到几百个（受内存限制） | 几百到几千个（更轻量） |

## 内存共享：最大的区别

**线程共享内存**——这是线程通信快的原因，也是产生"竞态条件"（race condition）的根源。

\`\`\`python
# 线程共享内存示例
import threading  # 导入模块 threading

count = 0                    # 全局变量，所有线程都能访问
def add():  # 定义函数 add
    global count  # 声明全局变量 count
    count += 1               # 多个线程同时修改 → 可能出错！

threads = [threading.Thread(target=add) for _ in range(1000)]  # 定义列表 threads
for t in threads: t.start()  # 遍历 threads，取值给 t
for t in threads: t.join()  # 遍历 threads，取值给 t
print(count)                 # 理论上是 1000，实际可能小于 1000！
\`\`\`

**进程内存独立**——这是进程安全的保障，也是进程通信麻烦的原因。

\`\`\`python
# 进程内存独立示例
import multiprocessing as mp  # 导入模块 multiprocessing

count = 0  # 定义数值 count
def add():  # 定义函数 add
    global count  # 声明全局变量 count
    count += 1               # 改的是子进程自己的副本，主进程看不到

p = mp.Process(target=add)  # 赋值变量 p
p.start(); p.join()  # 调用 p.start()：启动
print(count)                 # 还是 0！子进程的修改不会影响主进程
\`\`\`

## 什么时候用进程，什么时候用线程？

| 场景 | 推荐 | 原因 |
|------|------|------|
| 网络请求、文件读写、数据库查询 | **线程** | 主要是等待，GIL 不影响，线程开销小 |
| 大量数学计算、图像处理、加密 | **进程** | CPU 密集，需要绕开 GIL 才能多核并行 |
| 需要高稳定性，一个崩了不能影响其他 | **进程** | 进程隔离，崩溃不传染 |
| 任务间需要频繁共享大量数据 | **线程** | 共享内存，通信成本低 |

> ⚠️ **新手最常踩的坑**：以为"线程越多越快"。对 CPU 密集型任务，由于 GIL 的存在，Python 多线程**不能**利用多核，反而会因为线程切换开销变慢。这类任务必须用多进程。GIL 详见下一章。

## 用代码观察进程和线程

下面的 demo 启动一个进程和一个线程，分别打印它们的 PID（进程ID）和内存地址，直观感受"进程独立 vs 线程共享"。

> 💡 注意：multiprocessing 在本在线运行环境需要用 \`get_context('fork')\` 启动方式（原因见第 19 章详解）。`,
    code: `# 第二章 demo：观察进程与线程的内存隔离情况
# 用一个全局变量 counter，分别在子线程和子进程中修改它
# 看看主线程/主进程能否看到修改 —— 直观感受"线程共享 vs 进程独立"

import threading
import multiprocessing as mp
import os

# 全局变量：主进程/主线程一开始都是 0
counter = 0

def show_info(tag):
    """打印当前是哪个进程、哪个线程，以及 counter 的值"""
    pid = os.getpid()                         # 进程 ID
    tid = threading.get_ident()               # 线程 ID（一个数字）
    # 用 id() 看 counter 变量对象的内存地址
    print(f"  [{tag}] PID={pid}, 线程ID={tid}, counter={counter}, counter地址={id(counter)}")

def thread_worker():
    """子线程：直接修改全局变量 counter"""
    global counter
    counter = 100                              # 线程共享内存，改的是同一个变量
    show_info("子线程内")

def process_worker():
    """子进程：修改自己进程空间里的 counter 副本。
    fork 启动方式下，子进程继承父进程内存（写时复制），
    修改 counter 时会触发复制，产生自己独立的副本，主进程不受影响。
    """
    global counter
    counter = 100                              # 改的是子进程自己的副本！主进程看不到
    show_info("子进程内")

print("=" * 55)
print("【实验1】线程：子线程能否修改主线程的全局变量？")
print("=" * 55)
show_info("主线程-修改前")
t = threading.Thread(target=thread_worker)
t.start()
t.join()                                       # 等待子线程结束
show_info("主线程-修改后")
print("结论：counter 变成了 100 —— 线程【共享】内存\\n")

print("=" * 55)
print("【实验2】进程：子进程能否修改主进程的全局变量？")
print("=" * 55)
show_info("主进程-修改前")
# 注意：在线运行环境用 fork 启动方式（spawn 会失败，原因见第19章）
ctx = mp.get_context("fork")
p = ctx.Process(target=process_worker)
p.start()
p.join()                                       # 等待子进程结束
show_info("主进程-修改后")
print("结论：counter 还是 0 —— 进程内存【独立】\\n")

print("=" * 55)
print("总结")
print("=" * 55)
print("• 线程：同一进程内，共享内存，通信方便但有竞态风险")
print("• 进程：内存独立，安全但通信麻烦，能绕开 GIL 真正并行")`,
  },

  // -----------------------------------------------------------
  // 第 3 章：GIL 全局解释器锁
  // -----------------------------------------------------------
  {
    id: "pythread-03",
    group: "并发基础概念",
    icon: "🔒",
    title: "Python 的 GIL 全局解释器锁是什么",
    content: `## GIL 是什么？

**GIL**（Global Interpreter Lock，全局解释器锁）是 CPython（最常用的 Python 实现）中的一个机制：**同一时刻，只有一个线程能执行 Python 字节码**。

也就是说，即使你的电脑有 8 核 CPU，开了 8 个 Python 线程，它们也只能轮流用一个核来执行 Python 代码，没法真正并行计算。

## 为什么要有 GIL？

Python 用**引用计数**来管理内存（每个对象记录"被多少个变量引用"，归零就回收）。如果多个线程同时修改引用计数，会造成计数错乱、内存泄漏甚至崩溃。GIL 用一把全局锁保证：同一时刻只有一个线程在跑，引用计数就安全了。

> 简单说：**GIL 是用并发性能换取内存管理简单性的一种折中。**

## GIL 对我们的影响

GIL 只限制**执行 Python 字节码**。但有些操作会**主动释放 GIL**：

1. **IO 操作**：网络请求、文件读写、\`time.sleep()\`、\`input()\` 等。线程在等待 IO 时会释放 GIL，其他线程可以运行。
2. **调用 C 扩展**：像 NumPy 这类用 C 写的库，在执行计算时会释放 GIL。
3. **定期切换**：即使在纯 Python 计算中，解释器也会**定期释放 GIL**（默认每 5 毫秒，由 \`sys.setswitchinterval()\` 控制），让其他线程有机会运行。这就是 CPU 密集型多线程虽然不能加速、但也不会完全卡死的原因。

所以：
- **IO 密集型任务**：多线程**有效**（等待时释放 GIL，其他线程能跑）
- **CPU 密集型任务**：多线程**无效**（一直在算 Python 字节码，GIL 锁死，等于串行还多了切换开销）

## 用一张图理解

\`\`\`
8核 CPU，4个 Python 线程做 CPU 计算：

时间 →
核1: ████线程1█████████线程3███████
核2: (空闲)
核3: (空闲)
核4: (空闲)
        ↑ GIL 让线程只能排着用一个核

8核 CPU，4个 Python 进程做 CPU 计算：

时间 →
核1: ████进程1███████████████
核2: ████进程2███████████████
核3: ████进程3███████████████
核4: ████进程4███████████████
        ↑ 每个进程有独立 GIL，真正并行！
\`\`\`

## 一个经典实验：CPU 密集型对比

下面 demo 做一个纯计算任务（累加大量数字）：
- 串行执行两次
- 多线程执行两次（理论上应该快一倍）

你会发现多线程**并没有变快**，甚至更慢——这就是 GIL 的"功劳"。

## GIL 会被移除吗？

Python 3.13（2024年发布）引入了**实验性的"自由线程"模式**（PEP 703），可以禁用 GIL。但目前还是实验阶段，默认不开启，绝大多数项目仍在使用带 GIL 的 Python。所以现阶段学习并发，**必须理解 GIL 并据此选择线程还是进程**。

## GIL 的实际影响：解决思路

| 任务类型 | GIL 影响 | 解决方案 |
|---------|---------|---------|
| IO 密集（网络/文件） | 几乎无影响 | 用 \`threading\` 或 \`asyncio\` |
| CPU 密集（纯计算） | 严重影响 | 用 \`multiprocessing\` 多进程 |
| 混合型 | 视情况 | IO 用线程，计算部分用进程 |

> 💡 **记牢这条铁律**：在 Python 里，**CPU 密集型任务想加速，必须用多进程**。多线程对计算任务无能为力。

下面运行 demo 亲眼见证 GIL 的存在。`,
    code: `# 第三章 demo：亲眼见证 GIL 的存在
# 做一个 CPU 密集型任务（大量累加），对比：
#   1. 串行执行两次
#   2. 多线程并发执行两次（如果有真并行，应该快接近一倍）
# 实际结果：多线程并不会更快 —— 这就是 GIL 的证据

import threading
import time

def cpu_task(name, n):
    """一个纯 CPU 计算任务：把 0 到 n-1 累加到 result。
    这个函数没有任何 IO 操作，全程都在执行 Python 字节码。
    """
    total = 0
    for i in range(n):
        total += i                        # 纯 Python 计算，受 GIL 限制
    print(f"  [{name}] 完成，结果={total}")

N = 5_000_000                             # 计算量（500万次累加）

print("=" * 55)
print("方式一：串行执行两次")
print("=" * 55)
start = time.time()
cpu_task("串行-1", N)
cpu_task("串行-2", N)
serial_time = time.time() - start
print(f"串行耗时: {serial_time:.3f} 秒\\n")

print("=" * 55)
print("方式二：多线程并发执行两次")
print("=" * 55)
start = time.time()
t1 = threading.Thread(target=cpu_task, args=("线程-1", N))
t2 = threading.Thread(target=cpu_task, args=("线程-2", N))
t1.start(); t2.start()                    # 同时启动两个线程
# 如果没有 GIL，两个线程分别在两个核上并行，耗时应该接近 serial_time/2
# 但由于 GIL，两个线程只能轮流执行，反而多了锁竞争和切换开销
t1.join(); t2.join()                      # 等两个都结束
thread_time = time.time() - start
print(f"多线程耗时: {thread_time:.3f} 秒\\n")

print("=" * 55)
print("分析")
print("=" * 55)
print(f"串行:   {serial_time:.3f}s")
print(f"多线程: {thread_time:.3f}s")
if thread_time >= serial_time * 0.8:
    print("\\n>>> 多线程并没有变快！这就是 GIL 在起作用：")
    print(">>> 两个线程只能轮流用一个 CPU 核，反而多了切换开销。")
    print(">>> 结论：CPU 密集型任务在 Python 里用多线程是无效的。")
    print(">>>      想加速必须用多进程（multiprocessing），见第3部分。")
else:
    print("\\n>>> 这次多线程略快（可能受系统调度影响），但远未达到2倍提速。")`,
  },

  // -----------------------------------------------------------
  // 第 4 章：同步异步阻塞非阻塞
  // -----------------------------------------------------------
  {
    id: "pythread-04",
    group: "并发基础概念",
    icon: "🔀",
    title: "同步、异步、阻塞、非阻塞概念辨析",
    content: `## 四个容易混淆的词

这四个词经常被一起提到，初学者最容易搞混。我们一次性讲透：

### 同步 vs 异步（描述的是"调用方式"）

- **同步**：调用后**主动等待**结果，拿到结果才继续。像你打电话订餐，电话不挂，一直等到店家确认。
- **异步**：调用后**不等待**，先去干别的，结果出来了店家再通知你。像你下单后挂了电话去忙别的，店家做好了回电话给你。

### 阻塞 vs 非阻塞（描述的是"等待时的状态"）

- **阻塞**：等待结果时，当前线程**被挂起**，啥也干不了。像你在餐厅排队，只能站着等，不能玩手机（夸张说法）。
- **非阻塞**：等待结果时，当前线程**不被挂起**，可以继续干别的。像你拿了号去逛商场，过一会儿回来看叫号没。

## 四种组合

| 组合 | 例子 |
|------|------|
| 同步阻塞 | \`requests.get()\` —— 调用后线程卡住，直到响应返回 |
| 同步非阻塞 | 轮询检查（while循环里不停问"好了没"）—— 不卡，但要不停查 |
| 异步阻塞 | 在 async 函数里误用阻塞调用（如 \`time.sleep\`），会卡住整个事件循环——这是常见错误 |
| 异步非阻塞 | \`asyncio\` + 回调 —— 调用后不卡，结果好了通知你 |

## Python 中的对应

| 模型 | 代表 | 调用方式 | 等待状态 |
|------|------|---------|---------|
| 同步阻塞 | \`requests\`、\`time.sleep\` | 直接调用拿结果 | 阻塞 |
| 多线程 | \`threading\` | 在另一个线程阻塞，主线程自由 | "伪非阻塞" |
| 多进程 | \`multiprocessing\` | 子进程算，主进程自由 | "伪非阻塞" |
| 异步 | \`asyncio\` | \`await\` 不阻塞，事件循环调度 | 非阻塞 |

## 多线程如何实现"非阻塞"效果？

当主线程发起一个耗时操作时，把它丢给子线程去做，主线程立即返回继续干别的——这就是多线程实现"非阻塞"的原理。本质是**让阻塞发生在另一个线程**，主线程不被阻塞。

## 本教程的范围

本教程主要讲**同步模型下的并发**（多线程、多进程），即：
- 任务本身仍是"同步阻塞"的（比如 \`time.sleep\`、\`requests.get\`）
- 但通过线程/进程让"阻塞"发生在后台，主流程不被卡住

\`asyncio\`（异步非阻塞）是另一套体系，前 4 章先做概念对比，第 39-48 章会专门深入讲解。

## demo：感受三种调用方式

下面 demo 用三种方式执行同样的"等待1秒"任务，对比调用后主线程是否能立即继续：

1. **同步阻塞**：直接 \`time.sleep(1)\`，主线程卡住1秒
2. **多线程**：开个线程 sleep，主线程立即继续
3. **轮询非阻塞**：用 \`time.time()\` 自己计时，不调用阻塞函数`,
    code: `# 第四章 demo：三种调用方式的对比
# 同样是"等待1秒"的任务，用三种方式实现，观察主线程能否立即继续

import time
import threading

def do_wait():
    """模拟一个耗时1秒的操作"""
    time.sleep(1)

print("=" * 55)
print("方式一：同步阻塞（直接调用，主线程被卡住）")
print("=" * 55)
print(f"调用前时间: {time.strftime('%H:%M:%S')}")
do_wait()                                   # 主线程在这里卡住1秒
print(f"调用后时间: {time.strftime('%H:%M:%S')}  ← 整整过了1秒")
print("主线程被阻塞，期间什么都干不了\\n")

print("=" * 55)
print("方式二：多线程（把阻塞丢给子线程，主线程立即继续）")
print("=" * 55)
print(f"调用前时间: {time.strftime('%H:%M:%S')}")
t = threading.Thread(target=do_wait)
t.start()                                   # 启动子线程，主线程立即往下走
print(f"调用后时间: {time.strftime('%H:%M:%S')}  ← 几乎瞬间返回！")
print("主线程没被阻塞，可以继续干别的")
# 主线程干点别的活
print("主线程：我先做点别的事...")
time.sleep(0.3)
print("主线程：我做完了别的事，现在等子线程收尾")
t.join()                                    # 等子线程结束（如需结果再等）
print(f"子线程结束时间: {time.strftime('%H:%M:%S')}\\n")

print("=" * 55)
print("方式三：轮询非阻塞（不用阻塞函数，自己计时）")
print("=" * 55)
print(f"开始时间: {time.strftime('%H:%M:%S')}")
deadline = time.time() + 1                  # 目标结束时间
done = False
while not done:
    now = time.time()
    if now >= deadline:
        done = True
    else:
        # 没到时间，可以做点别的事（这里用 pass 模拟）
        # 真实场景：这里可以处理其他任务
        pass
print(f"结束时间: {time.strftime('%H:%M:%S')}  ← 也过了1秒")
print("特点：主线程没被阻塞，但需要不停轮询，浪费 CPU\\n")

print("=" * 55)
print("总结")
print("=" * 55)
print("• 同步阻塞：简单直接，但主线程被卡住")
print("• 多线程  ：主线程自由，但需要管理线程、注意同步")
print("• 轮询    ：主线程自由，但空转浪费 CPU（不推荐）")
print("• asyncio ：主线程自由且不空转（事件循环调度，第 39-48 章详解）")`,
  },

  // -----------------------------------------------------------
  // 第 5 章：threading 入门
  // -----------------------------------------------------------
  {
    id: "pythread-05",
    group: "threading 多线程",
    icon: "🧵",
    title: "threading 入门——两种创建线程的方式",
    content: `## threading 模块简介

\`threading\` 是 Python 标准库的线程模块，提供了面向对象的线程 API。我们日常用的 \`Thread\` 类、各种锁、事件等都在这里。

## 创建线程的两种方式

### 方式一：函数式（推荐简单场景）

把一个普通函数传给 \`Thread\` 的 \`target\` 参数：

\`\`\`python
import threading  # 导入模块 threading

def my_task(name):  # 定义函数 my_task，参数：name
    print(f"hello {name}")  # 打印输出到屏幕

t = threading.Thread(target=my_task, args=("Alice",))  # 赋值变量 t
t.start()  # 调用 t.start()：启动
\`\`\`

- \`target\`：线程要执行的函数
- \`args\`：传给函数的位置参数，**必须是元组**，单个参数要写 \`("Alice",)\`（注意逗号）
- \`kwargs\`：传给函数的关键字参数，字典形式
- \`name\`：线程名（可选），方便调试时识别，也可通过 \`t.name\` 修改
- \`daemon\`：是否为守护线程（可选，详见第7章）

### 方式二：类继承（推荐复杂场景）

继承 \`threading.Thread\`，重写 \`run()\` 方法：

\`\`\`python
import threading  # 导入模块 threading

class MyThread(threading.Thread):  # 定义类 MyThread
    def __init__(self, name):  # 定义函数 __init__，参数：self, name
        super().__init__()  # 调用父类
        self.name = name  # 执行操作
    def run(self):           # 重写 run，线程启动后执行的就是这个方法
        print(f"hello {self.name}")  # 打印输出到屏幕

t = MyThread("Alice")  # 赋值变量 t
t.start()                    # start() 会自动调用 run()
\`\`\`

## 两种方式怎么选？

| 场景 | 推荐 |
|------|------|
| 简单的一次性任务 | 函数式 |
| 任务逻辑复杂，需要维护状态 | 类继承 |
| 需要复用线程逻辑 | 类继承 |

## 关键 API 速查

| 方法/属性 | 作用 |
|----------|------|
| \`Thread(target, args, kwargs)\` | 创建线程对象 |
| \`t.start()\` | 启动线程（开始执行） |
| \`t.run()\` | 线程实际执行的代码（重写它） |
| \`t.join(timeout)\` | 等待线程结束 |
| \`t.is_alive()\` | 线程是否还在运行 |
| \`t.name\` | 线程名 |
| \`t.daemon\` | 是否为守护线程（详见第7章） |
| \`threading.current_thread()\` | 获取当前线程对象 |
| \`threading.main_thread()\` | 获取主线程对象 |
| \`threading.get_ident()\` | 获取当前线程ID |
| \`threading.active_count()\` | 当前存活线程数 |
| \`threading.enumerate()\` | 列出所有存活线程 |

## 注意事项

1. **\`start()\` 只能调用一次**，重复调用会报错。要重新跑得新建线程对象。
2. **不要直接调用 \`run()\`**——那样只是在当前线程同步执行函数，没有创建新线程。一定要用 \`start()\`。
3. **线程执行完不能拿到返回值**——\`Thread\` 不提供返回值机制。需要返回值得用全局变量、Queue 或 \`ThreadPoolExecutor\`（第17章）。

下面 demo 演示两种方式创建线程，并打印各种线程信息。`,
    code: `# 第五章 demo：创建线程的两种方式 + 线程信息查询
import threading
import time

# ============================================================
# 方式一：函数式创建线程
# ============================================================
def greet(name, times=3):
    """被线程执行的函数：打印 name 多次"""
    # threading.current_thread() 返回当前线程对象
    cur = threading.current_thread()
    print(f"  [函数式] 线程名={cur.name}, 线程ID={threading.get_ident()}")
    for i in range(times):
        print(f"  [函数式] 你好 {name}！第 {i+1} 次")
        time.sleep(0.1)

print("=" * 55)
print("方式一：函数式创建线程")
print("=" * 55)
# args 必须是元组：单元素要加逗号 ("Alice",)
# kwargs 传关键字参数
# name 设置线程名，方便调试时识别（也可通过 t.name 读取/修改）
t1 = threading.Thread(target=greet, args=("Alice",), kwargs={"times": 3},
                      name="我的线程-A")
t1.start()
t1.join()                       # 等待 t1 结束
print()

# ============================================================
# 方式二：类继承创建线程
# ============================================================
class GreetThread(threading.Thread):
    """继承 Thread 的自定义线程类"""
    def __init__(self, name, times=3):
        # 必须调用父类 __init__，否则线程对象不能正常工作
        super().__init__()
        self.name_arg = name      # 注意：不要覆盖 self.name（那是线程名）
        self.times = times

    def run(self):
        """重写 run 方法：start() 被调用后会执行这个方法
        千万不要自己调用 t.run()，那样没有创建新线程！"""
        cur = threading.current_thread()
        print(f"  [类继承] 线程名={cur.name}, 线程ID={threading.get_ident()}")
        for i in range(self.times):
            print(f"  [类继承] 你好 {self.name_arg}！第 {i+1} 次")
            time.sleep(0.1)

print("=" * 55)
print("方式二：类继承创建线程")
print("=" * 55)
t2 = GreetThread("Bob", times=3)
t2.name = "我的线程-B"            # 设置线程名（可选）
t2.start()                        # start() 会自动调用 run()
t2.join()
print()

# ============================================================
# 同时启动多个线程，观察并发
# ============================================================
print("=" * 55)
print("同时启动3个线程，观察交错输出（并发）")
print("=" * 55)
def worker(tag, n):
    for i in range(n):
        # 多个线程并发执行，输出会交错
        print(f"  [{tag}] 第{i+1}步 (线程ID={threading.get_ident()})")
        time.sleep(0.05)          # sleep 让出 GIL，其他线程得以运行

threads = []
for tag in ["X", "Y", "Z"]:
    t = threading.Thread(target=worker, args=(tag, 3))
    threads.append(t)
    t.start()

print(f"  >>> 当前存活线程数: {threading.active_count()}")
print(f"  >>> 所有线程: {[t.name for t in threading.enumerate()]}")

for t in threads:
    t.join()

print("\\n所有线程结束。")
print("\\n要点：")
print("• start() 启动线程，自动调用 run()")
print("• args 必须是元组，单元素记得加逗号")
print("• 类继承时 __init__ 要调 super().__init__()")
print("• 不要直接调 run()，那样没创建新线程")`,
  },

  // -----------------------------------------------------------
  // 第 6 章：join 与生命周期
  // -----------------------------------------------------------
  {
    id: "pythread-06",
    group: "threading 多线程",
    icon: "⏳",
    title: "线程的 join 与生命周期",
    content: `## 线程的生命周期

一个线程从创建到销毁，会经历几个状态：

\`\`\`
新建 (New)
   │ Thread() 创建对象
   ▼
就绪/运行 (Runnable) ←─────┐
   │ start() 启动          │ 时间片用完
   ▼                       │
运行中 ────────────────────┘
   │
   │ 遇到阻塞（sleep/IO/锁）
   ▼
阻塞 (Blocked/Waiting)
   │ 阻塞解除
   ▼
运行中
   │ 任务完成或异常
   ▼
终止 (Dead) —— 不可重新启动
\`\`\`

用代码表示就是：

| 状态 | 如何进入 | 如何观察 |
|------|---------|---------|
| 新建 | \`t = Thread(...)\` | \`t.is_alive()\` 返回 \`False\` |
| 运行 | \`t.start()\` | \`t.is_alive()\` 返回 \`True\` |
| 阻塞 | 线程内调 \`sleep\`、等锁、等 IO | \`t.is_alive()\` 仍是 \`True\` |
| 终止 | \`run()\` 执行完毕或抛异常 | \`t.is_alive()\` 返回 \`False\` |

## join() 的作用

\`join()\` 让**当前线程阻塞等待**目标线程结束。简单说就是："你先走，我等你完事再继续"。

\`\`\`python
t.start()       # 启动子线程
# 主线程继续干别的活...
t.join()        # 主线程在这里等 t 结束，结束后才往下走
\`\`\`

### join(timeout) 设置超时

\`\`\`python
t.join(timeout=2)    # 最多等2秒，2秒后不管 t 有没有结束都继续
if t.is_alive():  # 如果 t.is_alive()
    print("子线程还没结束，但我不等了")  # 打印输出到屏幕
\`\`\`

### join() 的常见误区

1. **join 不是"杀掉"线程**——它只是"等待"，不会中断线程。线程仍会自然执行完。
2. **join 多个线程的顺序不影响结果**——可以先 join A 再 join B，也可以反过来，总耗时取决于最慢的那个。

\`\`\`python
# 这两种写法效果一样（都是等两个都结束）
t1.join(); t2.join()  # 调用 t1.join()：等待所有任务完成
t2.join(); t1.join()  # 调用 t2.join()：等待所有任务完成
\`\`\`

## 不调用 join 会怎样？

主线程不等待子线程，会直接继续往下走，甚至直接结束程序。如果主线程结束了：
- **非守护线程**：主线程会**等所有非守护线程结束**才真正退出（Python 的默认行为）。
- **守护线程**：会随主线程一起被强制结束（详见第7章）。

虽然非守护线程不 join 也不会被强制终止，但**强烈建议显式 join**，因为：
1. 代码意图更清晰
2. 需要子线程结果时必须等
3. 便于排查异常：子线程未捕获的异常**不会传播到主线程**（\`join()\` 也不会重新抛出），而是触发 \`threading.excepthook\`（Python 3.8+ 默认打印到 stderr）。显式管理线程有助于统一异常处理

## demo：观察生命周期

下面 demo 用 \`is_alive()\` 观察线程在各阶段的状态，并演示 \`join(timeout)\` 的用法。`,
    code: `# 第六章 demo：线程生命周期与 join
import threading
import time

def slow_task(seconds, tag):
    """模拟一个耗时任务"""
    print(f"  [{tag}] 开始执行，预计 {seconds} 秒")
    time.sleep(seconds)
    print(f"  [{tag}] 执行完毕")

# ============================================================
# 实验1：观察 is_alive() 状态变化
# ============================================================
print("=" * 55)
print("实验1：观察 is_alive() 状态变化")
print("=" * 55)

t = threading.Thread(target=slow_task, args=(1, "T"))
print(f"  创建后未启动: is_alive={t.is_alive()}")   # False
t.start()
print(f"  刚 start():  is_alive={t.is_alive()}")     # True（正在运行）
time.sleep(0.5)
print(f"  运行 0.5s 后: is_alive={t.is_alive()}")     # True（还在sleep）
t.join()
print(f"  join() 后:    is_alive={t.is_alive()}")     # False（已结束）
print()

# ============================================================
# 实验2：join(timeout) 超时等待
# ============================================================
print("=" * 55)
print("实验2：join(timeout) —— 只等2秒，超时就走")
print("=" * 55)

t = threading.Thread(target=slow_task, args=(5, "慢线程"))
t.start()
print(f"  {time.strftime('%H:%M:%S')} 主线程开始 join，最多等2秒...")
t.join(timeout=2)                                    # 最多等2秒
if t.is_alive():
    print(f"  {time.strftime('%H:%M:%S')} 2秒到了，子线程还没结束！")
    print(f"  is_alive={t.is_alive()}，但主线程不再等待，继续干别的")
    # 实际项目中这里可以：强制结束（设标志位）、记录日志、或继续等
    print("  主线程：我先去做别的事，子线程让它自己跑完")
    t.join()   # 这里为了演示干净，再等它结束（真实场景可能不等）
else:
    print("  子线程在2秒内结束了")
print()

# ============================================================
# 实验3：join 多个线程的顺序无关性
# ============================================================
print("=" * 55)
print("实验3：join 多个线程，总耗时取决于最慢的")
print("=" * 55)

def task_with_time(tag, secs):
    start = time.time()
    time.sleep(secs)
    print(f"  [{tag}] 用时 {time.time()-start:.2f}s")

# A 用1秒，B 用2秒，C 用0.5秒
threads = [
    threading.Thread(target=task_with_time, args=("A", 1)),
    threading.Thread(target=task_with_time, args=("B", 2)),
    threading.Thread(target=task_with_time, args=("C", 0.5)),
]
overall_start = time.time()
for t in threads:
    t.start()
# 不管以什么顺序 join，总耗时都接近2秒（最慢的那个）
for t in threads:
    t.join()
print(f"  三个线程全部结束，总耗时 {time.time()-overall_start:.2f}s（≈最慢的B）")
print()

# ============================================================
# 实验4：不调用 join，主线程先结束会怎样
# ============================================================
print("=" * 55)
print("实验4：不 join，主线程不等子线程")
print("=" * 55)
print("  （非守护线程：Python 会自动等它结束才退出程序）")
t = threading.Thread(target=slow_task, args=(0.5, "无人等"))
t.start()
print("  主线程不 join，直接结束自己的代码")
print("  但程序不会立即退出，会等非守护子线程结束...")
# 这里没有 t.join()，但程序会等 t 结束
print("\\n要点：")
print("• is_alive() 判断线程是否在运行")
print("• join() 等待线程结束，join(timeout) 限时等待")
print("• join 顺序不影响总耗时，取决于最慢的线程")
print("• 非守护线程即使不 join，程序也会等它结束")
print("• 注意：子线程的未捕获异常不会传播到主线程，")
print("  join() 也不会重新抛出；Python 3.8+ 通过 threading.excepthook 处理")`,
  },

  // -----------------------------------------------------------
  // 第 7 章：守护线程 daemon
  // -----------------------------------------------------------
  {
    id: "pythread-07",
    group: "threading 多线程",
    icon: "👻",
    title: "守护线程 daemon 详解",
    content: `## 什么是守护线程？

守护线程（daemon thread）是一种"后台线程"——**当所有非守护线程都结束时，守护线程会被自动杀死，程序直接退出**。

可以理解为：守护线程是"配角"，只为非守护线程服务；主角都退场了，配角也就没存在的必要了。

## 守护线程 vs 非守护线程

| 特性 | 守护线程 (daemon=True) | 非守护线程 (daemon=False，默认) |
|------|----------------------|------------------------------|
| 程序退出条件 | 不影响退出 | 程序会等它结束才退出 |
| 被强制终止 | 是（主线程结束就杀） | 否（自然结束） |
| 典型用途 | 心跳检测、后台监控、定时清理 | 业务任务、需要保证完成的任务 |
| 资源清理 | 可能来不及清理（被强杀） | 能正常清理 |

## 如何设置守护线程

### 方法一：构造时设置
\`\`\`python
t = threading.Thread(target=task, daemon=True)  # 赋值变量 t
\`\`\`

### 方法二：start 前设置
\`\`\`python
t = threading.Thread(target=task)  # 赋值变量 t
t.daemon = True  # 执行操作
t.start()  # 调用 t.start()：启动
\`\`\`

### 方法三：类继承时设置
\`\`\`python
class MyThread(threading.Thread):  # 定义类 MyThread
    def __init__(self):  # 定义函数 __init__，参数：self
        super().__init__()  # 调用父类
        self.daemon = True    # 必须在 start 前设置
\`\`\`

> ⚠️ **重要**：\`daemon\` 必须在 \`start()\` **之前**设置，start 之后改会报错。

## 守护线程的典型场景

1. **心跳检测**：定期向服务端发心跳，主程序退出时心跳线程也没必要继续
2. **后台日志刷新**：定期把内存日志刷到磁盘
3. **定时清理**：定期清理过期缓存
4. **进度条刷新**：后台不停刷新进度显示

## 守护线程的注意事项

1. **不要在守护线程里做关键操作**——它可能随时被杀，导致数据不一致
2. **守护线程里不要创建文件、数据库连接而不关闭**——可能来不及关闭
3. **守护线程创建的子线程默认也是守护线程**
4. **主线程默认是非守护线程**

## 一个常见误区

"守护线程"和"守护进程"（daemon process，后台运行的系统服务）是**两个完全不同的概念**：
- 守护线程：Python 线程的 daemon 属性
- 守护进程：操作系统层面的后台服务（如 nginx、mysql）

两者只是中文翻译撞了，没有任何关系。

## demo：守护线程 vs 非守护线程

下面 demo 启动一个守护线程和一个非守护线程，都做"无限循环打印"，观察主线程结束后谁被杀、谁还在。`,
    code: `# 第七章 demo：守护线程 vs 非守护线程
# 两个线程都做无限循环，主线程只跑2秒就结束
# 观察：守护线程被杀，非守护线程会让程序等它
import threading
import time

def loop_forever(tag, interval=0.5):
    """无限循环：每隔 interval 秒打印一次"""
    i = 0
    while True:
        i += 1
        print(f"  [{tag}] 第 {i} 次循环 ({time.strftime('%H:%M:%S')})")
        time.sleep(interval)

print("=" * 55)
print("实验1：守护线程——主线程结束就被杀")
print("=" * 55)
# daemon=True 表示这是守护线程
t_daemon = threading.Thread(target=loop_forever, args=("守护", 0.4),
                            daemon=True, name="守护线程")
t_daemon.start()
print("  >>> 守护线程已启动（daemon=True）")
print("  >>> 主线程开始 sleep 2秒...")
time.sleep(2)
print("  >>> 主线程醒了，准备结束")
print("  >>> 主线程结束后，守护线程会被自动杀死\\n")

# ============================================================
# 实验2：非守护线程——程序会等它
# 这里为了不让 demo 卡死，我们让非守护线程也只循环几次
# ============================================================
print("=" * 55)
print("实验2：非守护线程——程序会等它结束")
print("=" * 55)

def loop_times(tag, n):
    """循环 n 次后退出（非无限循环，方便演示）"""
    for i in range(n):
        print(f"  [{tag}] 第 {i+1}/{n} 次 ({time.strftime('%H:%M:%S')})")
        time.sleep(0.3)
    print(f"  [{tag}] 自然结束")

# 默认 daemon=False，是非守护线程
t_normal = threading.Thread(target=loop_times, args=("非守护", 4),
                            name="非守护线程")
t_normal.start()
print("  >>> 非守护线程已启动（daemon=False）")
print("  >>> 主线程代码到此结束，但程序不会立即退出")
print("  >>> 会等非守护线程跑完才退出...")
# 不调用 join，程序也会等非守护线程
print()

# ============================================================
# 实验3：daemon 必须在 start 前设置
# ============================================================
print("=" * 55)
print("实验3：start 后修改 daemon 会报错")
print("=" * 55)
t = threading.Thread(target=lambda: None)   # lambda: None 是个空函数，线程立即结束
t.start()
t.join()
try:
    t.daemon = True          # 已经 start 过，会抛 RuntimeError
except RuntimeError as e:
    print(f"  报错: {e}")
print("\\n要点：")
print("• daemon=True 的线程是'配角'，主线程结束就被杀")
print("• daemon=False（默认）的线程，程序会等它结束")
print("• daemon 必须在 start() 之前设置")
print("• 不要在守护线程里做关键操作（可能来不及完成）")`,
  },

  // -----------------------------------------------------------
  // 第 8 章：threading.local
  // -----------------------------------------------------------
  {
    id: "pythread-08",
    group: "threading 多线程",
    icon: "📦",
    title: "threading.local 线程局部变量",
    content: `## 问题：多线程共享全局变量的麻烦

由于线程共享内存，全局变量会被所有线程读写，容易造成数据混乱。但有些数据我们希望**每个线程各自拥有一份**，互不干扰，比如：

- **数据库连接**：每个线程用各自的连接，避免多线程共用一个连接出错
- **请求上下文**：Web 框架里每个请求一个线程，请求相关的用户信息应线程隔离
- **格式化配置**：每个线程的 locale、时区设置独立

\`\`\`python
# 问题演示：所有线程共享同一个全局变量
import threading, time  # 导入模块 threading,

data = None  # 赋值变量 data
def worker():  # 定义函数 worker
    global data  # 声明全局变量 data
    data = threading.current_thread().name   # 各线程都改 data
    time.sleep(0.1)                            # 让其他线程也来改
    print(data)   # 可能打印的是别人的名字！data 被覆盖了
\`\`\`

## 解决方案：threading.local

\`threading.local()\` 创建一个"线程局部存储"对象，**每个线程对它属性的读写都是独立的**，互不可见。

\`\`\`python
import threading  # 导入模块 threading

local_data = threading.local()    # 创建线程局部对象

def worker():  # 定义函数 worker
    # 每个线程看到的 local_data.name 都是自己的那份
    local_data.name = threading.current_thread().name  # 执行操作
    print(local_data.name)        # 各线程打印各自的名字，互不干扰
\`\`\`

原理：\`local_data\` 内部维护了一个字典 \`{线程ID: 该线程的数据}\`，访问时自动按当前线程ID取对应的数据。

## 使用场景

### 场景1：每个线程独立的数据库连接
\`\`\`python
import threading, sqlite3  # 导入模块 threading,

local = threading.local()  # 赋值变量 local

def get_conn():  # 定义函数 get_conn
    if not hasattr(local, "conn"):       # 当前线程还没建连接
        local.conn = sqlite3.connect("db.sqlite")  # 执行操作
    return local.conn                    # 返回当前线程专属的连接
\`\`\`

### 场景2：Web 请求上下文
\`\`\`python
import threading  # 导入模块 threading

ctx = threading.local()  # 赋值变量 ctx

def handle_request(user_id):  # 定义函数 handle_request，参数：user_id
    ctx.user_id = user_id     # 当前线程设置用户
    # 后续调用任何函数都能从 ctx.user_id 取到，无需层层传参
    process()  # 调用 process()

def process():  # 定义函数 process
    print(f"处理用户 {ctx.user_id}")   # 自动取当前线程的 user_id
\`\`\`

## threading.local 的特点

1. **每个线程独立**：A 线程设置的值，B 线程看不到（即使访问同一个对象）
2. **随线程销毁而消失**：线程结束后，它的数据会被清理
3. **无需加锁**：因为各线程访问的是各自的数据，没有竞争
4. **属性任意**：可以设置任意属性名 \`local.xxx = ...\`

## demo：对比共享变量 vs 线程局部变量

下面 demo 启动多个线程，分别用普通全局变量和 \`threading.local\` 存储数据，观察共享带来的混乱和线程局部的隔离效果。`,
    code: `# 第八章 demo：threading.local 线程局部变量
# 对比"共享全局变量"和"线程局部变量"在多线程下的表现
import threading
import time

# ============================================================
# 问题：共享全局变量会被各线程互相覆盖
# ============================================================
shared_data = {}                        # 共享字典：所有线程读写同一份

def worker_shared(tag):
    """用共享字典存数据 —— 会互相覆盖"""
    shared_data["name"] = tag            # 写入自己的名字
    time.sleep(0.05)                     # 让其他线程也来写
    # 此时 shared_data["name"] 可能已经被别的线程改了！
    print(f"  [共享] {tag} 读到: {shared_data['name']}  (期望: {tag})")

print("=" * 55)
print("实验1：共享全局变量 —— 数据会被覆盖")
print("=" * 55)
threads = [threading.Thread(target=worker_shared, args=(f"线程{i}",))
           for i in range(3)]
for t in threads: t.start()
for t in threads: t.join()
print("  可以看到，读到的名字可能不是自己的 —— 这就是共享的隐患\\n")

# ============================================================
# 解决：threading.local 让每个线程拥有独立副本
# 原理：local 对象内部按线程ID 存储各自的数据，访问时自动取当前线程的
# ============================================================
local_data = threading.local()          # 线程局部对象：每个线程看到的属性各自独立

def worker_local(tag):
    """用 threading.local 存数据 —— 各线程独立"""
    local_data.name = tag                # 写入"自己的"那份（底层按线程ID隔离存储）
    time.sleep(0.05)                     # 等其他线程也写
    # local_data.name 取到的是当前线程自己设置的值，不会被别人影响
    print(f"  [局部] {tag} 读到: {local_data.name}  (期望: {tag}) ✓")

print("=" * 55)
print("实验2：threading.local —— 各线程数据隔离")
print("=" * 55)
threads = [threading.Thread(target=worker_local, args=(f"线程{i}",))
           for i in range(3)]
for t in threads: t.start()
for t in threads: t.join()
print("  每个线程读到的都是自己的名字，互不干扰\\n")

# ============================================================
# 实用场景：每个线程独立的"请求上下文"
# ============================================================
print("=" * 55)
print("实验3：模拟 Web 请求上下文（每线程独立用户）")
print("=" * 55)

request_ctx = threading.local()         # 请求上下文：线程隔离

def handle_request(user_id, action):
    """模拟处理一个用户请求"""
    # 把用户信息存到线程局部变量，后续函数无需传参即可拿到
    request_ctx.user_id = user_id
    request_ctx.action = action
    time.sleep(0.02)                     # 模拟处理耗时
    # 调用业务函数，里面直接读 request_ctx 就能拿到当前用户
    do_business()

def do_business():
    """业务函数：无需参数，从 request_ctx 取当前线程的用户"""
    uid = request_ctx.user_id
    act = request_ctx.action
    print(f"  处理用户 {uid} 的请求: {act} (线程={threading.current_thread().name})")

threads = []
for i in range(3):
    t = threading.Thread(target=handle_request,
                         args=(f"用户{i+1}", ["登录", "下单", "查询"][i]),
                         name=f"Thread-{i+1}")
    threads.append(t)
    t.start()
for t in threads: t.join()

print("\\n要点：")
print("• threading.local() 创建线程局部存储对象")
print("• 每个线程对该对象的属性读写都是独立的，互不可见")
print("• 适合存数据库连接、请求上下文等'每线程一份'的数据")
print("• 无需加锁，因为各线程访问各自的数据，没有竞争")`,
  },
];
