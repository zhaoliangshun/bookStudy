// =============================================================
// Python 从入门到精通大全（终极版）—— 第12批章节
// 第十二部分 并发编程（共 5 章）
// -------------------------------------------------------------
// 沙箱约束：python3 子进程，10 秒超时，1MB 输出
// 因此所有并发 demo 都设计成"短跑型"，避免阻塞或超时
// =============================================================

const chapters = [
  // ============================================================
  // 第五十六章 进程与线程基础
  // ============================================================
  {
    id: 'py10-ch56',
    group: '第十二部分 并发编程',
    icon: '🧵',
    title: '第五十六章 进程与线程基础',
    content: `## 第五十六章 进程与线程基础

写 Python 久了你会发现：**单线程跑得不够快**。爬虫慢、计算慢、IO 卡顿。解决办法就是并发编程——进程、线程、协程。这一章先把基础概念彻底讲清楚：什么是进程、什么是线程、Python 特有的 GIL 是什么、什么时候用线程什么时候用进程。理论搞明白，后面三章的代码才看得懂。

### 一、并发 vs 并行

这两个词天天被混着用，但其实是两件事：

- **并发（Concurrency）**：多个任务"看起来"同时在跑，本质上是 CPU 在它们之间快速切换。比如单核电脑也能"同时"听音乐和写代码。
- **并行（Parallelism）**：多个任务"真的"同时跑，需要多核 CPU，每个核跑一个任务。

\`\`\`python
# 用一个比喻来理解：
# 并发 = 一个厨师同时做三道菜（切换着做）
# 并行 = 三个厨师各做一道菜（同时进行）

# Python 里：
# - threading：并发（受 GIL 限制，同一时刻只有一个线程在跑）
# - multiprocessing：并行（多进程，每个进程独立 GIL）
# - asyncio：并发（单线程协程切换，IO 密集型最有效）
\`\`\`

### 二、什么是进程

**进程 = 程序的一次运行实例**。每个进程有自己的内存空间、文件描述符、CPU 上下文。进程之间互相隔离，通信需要专门的机制（管道、队列、共享内存）。

\`\`\`python
import os
import sys

# 当前 Python 进程的 PID（进程 ID）
print(f"当前进程 PID: {os.getpid()}")

# 父进程 PID
print(f"父进程 PID: {os.getppid()}")

# 进程的 CPU 亲和性、内存等信息在 /proc/self (Linux) 可以查看
# Python 里用 os.times() 看执行时间
times = os.times()
# user: 用户态时间；system: 内核态时间；children_user: 子进程用户时间
print(f"用户态时间: {times.user:.3f}s")
print(f"内核态时间: {times.system:.3f}s")
\`\`\`

进程的特点：

- **隔离性强**：进程崩溃不影响其他进程。
- **创建开销大**：启动一个新进程要复制父进程的内存空间（写时复制 Copy-On-Write 优化）。
- **通信复杂**：要用 \`Queue\`、\`Pipe\`、\`Manager\` 等机制。
- **能利用多核**：每个进程有自己的 GIL，可以真正并行。

### 三、什么是线程

**线程 = 进程内的执行单元**。一个进程可以有多个线程，它们**共享进程的内存空间**（包括全局变量、堆上的对象）。线程切换比进程快得多，但共享内存意味着**需要同步**（锁）来避免数据竞争。

\`\`\`python
import threading
import time

# 线程是操作系统调度的最小单位
# Python 的 threading 模块是对 _thread 的高级封装

# 当前线程对象
current = threading.current_thread()
print(f"当前线程: {current.name}")  # MainThread

# 当前进程的所有线程
print(f"进程内的线程: {[t.name for t in threading.enumerate()]}")

# 一个简单例子：在主线程里读一个变量
shared_counter = 0

def worker():
    """子线程会修改共享变量。"""
    global shared_counter
    # 1000 次自增
    for _ in range(1000):
        shared_counter += 1

# 启动 5 个线程
threads = [threading.Thread(target=worker) for _ in range(5)]
for t in threads:
    t.start()
for t in threads:
    t.join()

print(f"期望值: 5000, 实际值: {shared_counter}")
# 实际值会小于 5000——这就是"数据竞争"，下一章详细讲
\`\`\`

线程的特点：

- **共享内存**：同进程内所有线程共享全局变量、堆对象。
- **创建开销小**：比进程快 10-100 倍。
- **通信简单**：直接读写共享变量就行（但要加锁）。
- **受 GIL 限制**：同一时刻只有一个线程在执行 Python 字节码。

### 四、Python 的 GIL（全局解释器锁）

这是 Python（CPython）特有的"绕不开的话题"。简单说：**GIL 是一把互斥锁，保证同一时刻只有一个线程在执行 Python 字节码**。

为什么有 GIL？因为 CPython 的内存管理（特别是引用计数）不是线程安全的。如果多个线程同时改引用计数，会出现内存泄漏或释放错误的内存。引入 GIL 是"用简单换性能"的妥协。

\`\`\`python
# 用一个 demo 直观感受 GIL 的影响
import threading
import time

def cpu_burn(n):
    """CPU 密集型任务：计算一堆数的平方和。"""
    total = 0
    for i in range(n):
        total += i * i
    return total

# 单线程跑两次
N = 5_000_000

start = time.perf_counter()
cpu_burn(N)
cpu_burn(N)
single_time = time.perf_counter() - start
print(f"单线程两次: {single_time:.3f}s")

# 双线程同时跑
start = time.perf_counter()
t1 = threading.Thread(target=cpu_burn, args=(N,))
t2 = threading.Thread(target=cpu_burn, args=(N,))
t1.start(); t2.start()
t1.join(); t2.join()
multi_time = time.perf_counter() - start
print(f"双线程两次: {multi_time:.3f}s")

# 因为 GIL 的存在，双线程并不会比单线程快
# 实际可能更慢（线程切换有开销）
# 在你电脑上跑可能看到 multi_time ≈ single_time 或更大
print(f"耗时比: {multi_time / single_time:.2f}（接近 1 说明 GIL 在拖慢）")
\`\`\`

GIL 带来的结论：

- **CPU 密集型任务用多线程没意义**（甚至更慢），要用多进程。
- **IO 密集型任务用多线程有意义**（IO 等待时 GIL 会释放，让别的线程跑）。
- **GIL 只在 CPython 上有**，Jython、IronPython 没有，但用得少。

### 五、什么时候用线程、什么时候用进程

记一个简单的决策树：

\`\`\`python
# 决策树（用代码表达）
def choose_concurrency(task_type: str) -> str:
    """根据任务类型选并发模型。"""
    if task_type == "CPU 密集":
        # CPU 密集型：计算、压缩、加密、图像处理
        # 用 multiprocessing——绕开 GIL，真正用多核
        return "multiprocessing 或 concurrent.futures.ProcessPoolExecutor"
    elif task_type == "IO 密集":
        # IO 密集型：网络请求、文件读写、数据库
        # 用 threading 或 asyncio——等待时让出 CPU
        return "threading / asyncio / concurrent.futures.ThreadPoolExecutor"
    elif task_type == "混合":
        # CPU + IO 都有：分阶段处理
        return "拆分任务，CPU 用进程，IO 用线程或协程"
    else:
        return "单线程就行，别瞎并发"

# 常见场景
print(choose_concurrency("CPU 密集"))  # 图像处理、科学计算
print(choose_concurrency("IO 密集"))   # 爬虫、API 调用
print(choose_concurrency("混合"))       # 数据处理 + 上传
\`\`\`

### 六、用 os.fork 创建进程（Linux/Mac）

Unix 系统有 \`fork()\` 系统调用，复制当前进程：

\`\`\`python
import os
import time

# 注意：fork 在 Windows 上不存在，跨平台代码要用 multiprocessing
if hasattr(os, "fork"):
    print(f"父进程 PID: {os.getpid()}")

    # fork：调用一次，返回两次
    # 在父进程里返回子进程的 PID（> 0）
    # 在子进程里返回 0
    pid = os.fork()

    if pid == 0:
        # 子进程执行这一段
        print(f"  子进程 PID: {os.getpid()}, 父进程 PID: {os.getppid()}")
        time.sleep(0.1)
        print("  子进程退出")
        os._exit(0)  # 子进程直接退出，避免影响父进程
    else:
        # 父进程执行这一段
        print(f"父进程创建了子进程 PID: {pid}")
        # waitpid 等待子进程结束
        os.waitpid(pid, 0)
        print("父进程：子进程已结束")
else:
    print("当前平台不支持 fork（Windows），请用 multiprocessing")
\`\`\`

> 实际开发**不要直接用 \`os.fork()\`**——它太底层，跨平台性差，且和 Python 的 GC、信号处理不友好。用 \`multiprocessing\` 模块。

### 七、用 subprocess 调用外部程序

虽然 \`subprocess\` 不是"并发"，但它是"启动外部进程"的标准方式：

\`\`\`python
import subprocess
import sys

# 调用系统命令，捕获输出
# 比如调用 python 自己跑一段代码
result = subprocess.run(
    [sys.executable, "-c", "print('hello from subprocess')"],
    capture_output=True,
    text=True,
    timeout=5,
)
print(f"stdout: {result.stdout.strip()}")
print(f"returncode: {result.returncode}")

# 调用系统命令（跨平台）
# Linux/Mac: ls / Windows: dir
import shutil
if sys.platform == "win32":
    cmd = ["cmd", "/c", "echo hello"]
else:
    cmd = ["echo", "hello"]

result = subprocess.run(cmd, capture_output=True, text=True)
print(f"系统命令输出: {result.stdout.strip()}")

# subprocess.run 是阻塞的
# 如果想并发启动多个外部进程，可以配合 threading 或 asyncio
\`\`\`

### 八、用 multiprocessing 创建进程（推荐）

\`multiprocessing\` 是 Python 推荐的多进程方案，**跨平台**：

\`\`\`python
from multiprocessing import Process, current_process
import os
import time

def worker(name: str, delay: float):
    """子进程的工作函数。"""
    print(f"[{current_process().name}] PID={os.getpid()}, name={name}")
    time.sleep(delay)
    print(f"[{name}] 完成")

# 创建进程对象
# target 是工作函数，args 是参数元组
p1 = Process(target=worker, args=("A", 0.2), name="ProcessA")
p2 = Process(target=worker, args=("B", 0.1), name="ProcessB")

# 注意：在沙箱环境里启动子进程要小心
# Windows 上 multiprocessing 用 spawn 启动，会重新 import 主模块
# 所以工作函数必须定义在模块顶层，不能写在 if __name__ == "__main__" 里

# 启动
p1.start()
p2.start()

# 等待结束
p1.join()
p2.join()

print(f"p1 退出码: {p1.exitcode}")
print(f"p2 退出码: {p2.exitcode}")
\`\`\`

### 九、守护进程（daemon）

守护进程在主进程退出时**自动结束**，不阻塞主进程退出：

\`\`\`python
import multiprocessing as mp
import time

def long_running():
    """一个长时间运行的任务。"""
    while True:
        print("子进程运行中...")
        time.sleep(0.2)

# daemon=True：主进程结束时自动 kill 这个子进程
p = mp.Process(target=long_running, daemon=True)
p.start()

# 主进程睡 0.5 秒后退出
# 退出时，daemon 子进程会被强制结束
time.sleep(0.5)
print("主进程退出，daemon 子进程会被强制终止")
\`\`\`

> 注意：daemon 进程不能创建子进程，也不能调用 \`join()\`。它适合"后台日志、心跳"等不需要清理的场景。

### 十、CPU 核心数

\`\`\`python
import os
import multiprocessing as mp

# 方法 1：os.cpu_count()
print(f"os.cpu_count(): {os.cpu_count()}")

# 方法 2：multiprocessing.cpu_count()
# 这个在早期 Python 上更可靠
print(f"mp.cpu_count(): {mp.cpu_count()}")

# 注意：在某些容器/Docker 环境里，os.cpu_count() 可能返回宿主机的核心数
# 而不是容器限制的核心数
# Python 3.13+ 新增 os.process_cpu_count() 返回进程可用的核心数

if hasattr(os, "process_cpu_count"):
    print(f"os.process_cpu_count(): {os.process_cpu_count()}")
\`\`\`

### 十一、并发执行的简单对比

\`\`\`python
import threading
import time

# 对比：串行 vs 并发（IO 密集型任务）
def io_task(n: int):
    """模拟 IO 等待：sleep 0.1 秒。"""
    time.sleep(0.1)
    return n * 2

# 串行：5 个任务，每个 0.1 秒，共 0.5 秒
start = time.perf_counter()
results_serial = [io_task(i) for i in range(5)]
print(f"串行耗时: {time.perf_counter() - start:.3f}s")

# 并发：5 个线程同时跑
start = time.perf_counter()
results_concurrent = []
threads = []

def run_and_collect(i):
    """线程工作函数，把结果存到列表。"""
    results_concurrent.append(io_task(i))

for i in range(5):
    t = threading.Thread(target=run_and_collect, args=(i,))
    threads.append(t)
    t.start()
for t in threads:
    t.join()

print(f"并发耗时: {time.perf_counter() - start:.3f}s")
print(f"结果一致: {sorted(results_serial) == sorted(results_concurrent)}")
# IO 密集型并发：5 个任务几乎和 1 个任务一样快
\`\`\`

### 十二、Python 并发的三大流派

| 方案 | 模块 | 适用 | 难度 |
|-----|-----|-----|-----|
| 多线程 | \`threading\` | IO 密集 | 中 |
| 多进程 | \`multiprocessing\` | CPU 密集 | 中 |
| 协程 | \`asyncio\` | 大量 IO 并发 | 高 |
| 高级封装 | \`concurrent.futures\` | 通用 | 低 |

\`\`\`python
# 选择建议：
# - 10 个并发任务、爬虫 → threading + Queue
# - 100+ 并发任务、爬虫 → asyncio
# - CPU 密集计算 → multiprocessing.Pool
# - 想要简洁统一的接口 → concurrent.futures
# - 第三方库都是异步的 → asyncio（FastAPI / aiohttp）
\`\`\`

### 十三、共享内存与进程通信

进程之间不共享内存，要通信必须用专门机制：

\`\`\`python
from multiprocessing import Process, Value, Array

# Value / Array：进程间共享的 C 类型变量
def worker(counter, arr):
    """子进程修改共享变量。"""
    for _ in range(1000):
        # 用 with 获取锁，保证原子操作
        with counter.get_lock():
            counter.value += 1
    for i in range(len(arr)):
        arr[i] += 1

# 共享一个整数和数组
counter = Value("i", 0)  # "i" 表示 int
arr = Array("i", [0, 0, 0])  # 3 个 int

p1 = Process(target=worker, args=(counter, arr))
p2 = Process(target=worker, args=(counter, arr))

p1.start(); p2.start()
p1.join(); p2.join()

print(f"counter: {counter.value} (期望 2000)")
print(f"arr: {list(arr)} (期望 [2000, 2000, 2000])")
\`\`\`

### 十四、进程池 Pool

要并发跑大量任务，用 \`Pool\` 比手动 \`Process\` 高效：

\`\`\`python
from multiprocessing import Pool

def square(x):
    return x * x

# 用 with 自动管理进程池
# processes 默认是 cpu_count()
with Pool(processes=2) as pool:
    # map：和内置 map 类似，自动分派到各进程
    results = pool.map(square, range(10))
    print(f"map 结果: {results}")

    # apply_async：异步提交单个任务
    async_result = pool.apply_async(square, (100,))
    # get 会阻塞直到结果就绪
    print(f"apply_async 结果: {async_result.get()}")

    # imap：惰性版的 map，返回迭代器
    for r in pool.imap(square, range(5)):
        print(f"  imap: {r}")
\`\`\`

## 小结

- ⭐ **并发（Concurrency）**是任务切换，**并行（Parallelism）**是真的同时执行。
- ⭐ 进程隔离强、开销大、能并行；线程共享内存、开销小、受 GIL 限制。
- ⭐ **Python 的 GIL** 让多线程无法真正并行执行 Python 字节码，CPU 密集型任务必须用多进程。
- ⭐ 决策树：CPU 密集 → \`multiprocessing\`；IO 密集 → \`threading\` / \`asyncio\`。
- ⭐ \`os.cpu_count()\` 看 CPU 核心数；\`os.getpid()\` 看进程 ID。
- ⭐ \`subprocess\` 用于调用外部程序，\`os.fork()\` 是 Unix 原生 fork（不推荐直接用）。
- ⭐ 守护进程（\`daemon=True\`）主进程退出时自动结束。
- ⭐ \`Value\` / \`Array\` 用于进程间共享 C 类型；\`Pool\` 用于批量管理进程。
- 下一章深入 \`threading\` 模块——Thread 类、daemon 线程、Timer、Event、Barrier 全套用法。`,
  },

  // ============================================================
  // 第五十七章 threading 多线程
  // ============================================================
  {
    id: 'py10-ch57',
    group: '第十二部分 并发编程',
    icon: '🧵',
    title: '第五十七章 threading 多线程',
    content: `## 第五十七章 threading 多线程

\`threading\` 是 Python 标准库的多线程模块。这一章把 \`Thread\` 类的所有用法讲透：怎么创建、怎么传参、daemon 线程、\`Timer\`、\`Event\`、\`Barrier\`、\`local\` 线程局部变量。学完你能用线程写出并发爬虫、并发 IO 处理的脚本。

### 一、Thread 类基础

\`threading.Thread\` 是线程对象，两种创建方式：

\`\`\`python
import threading
import time

# 方式 1：函数式（推荐，简单清晰）
def download(url: str):
    """模拟下载一个 URL。"""
    print(f"[{threading.current_thread().name}] 开始下载 {url}")
    time.sleep(0.1)
    print(f"[{threading.current_thread().name}] 完成 {url}")

# 创建线程：target=函数, args=参数元组
t = threading.Thread(target=download, args=("https://example.com",))
# start：启动线程（在后台运行）
t.start()
# join：等待线程结束（阻塞主线程）
t.join()
print("主线程：所有子线程结束")
\`\`\`

### 二、方式 2：继承 Thread 类

适合线程逻辑复杂、需要维护状态的场景：

\`\`\`python
import threading
import time

class DownloaderThread(threading.Thread):
    """自定义线程类：继承 Thread，重写 run。"""
    def __init__(self, url: str):
        # 必须调用父类的 __init__
        super().__init__()
        self.url = url
        self.result = None

    def run(self):
        """线程启动后执行的逻辑（不要直接调用 run，要调 start）。"""
        # start() 内部会调用 run()
        print(f"[{self.name}] 开始下载 {self.url}")
        time.sleep(0.1)
        self.result = f"<html>{self.url}</html>"
        print(f"[{self.name}] 完成 {self.url}")

t = DownloaderThread("https://example.com")
t.start()
t.join()
print(f"结果: {t.result}")
\`\`\`

> **坑**：调用 \`t.run()\` 是直接在当前线程调用函数，**不会启动新线程**；必须调用 \`t.start()\` 才会启动新线程。

### 三、传参：args 和 kwargs

\`\`\`python
import threading

def task(name, count, delay=0.1):
    """演示参数传递。"""
    for i in range(count):
        print(f"[{name}] 第 {i} 次")
        import time
        time.sleep(delay)

# args 传位置参数（必须是元组，单元素要带逗号）
t1 = threading.Thread(target=task, args=("A", 3))

# kwargs 传关键字参数
t2 = threading.Thread(target=task, args=("B", 3), kwargs={"delay": 0.2})

t1.start(); t2.start()
t1.join(); t2.join()
\`\`\`

### 四、daemon 线程

daemon 线程（守护线程）的特点：**主线程退出时，daemon 线程会被强制结束**，不会阻塞主线程退出。

\`\`\`python
import threading
import time

def background_task():
    """一个会一直跑的后台任务。"""
    while True:
        print("[daemon] 心跳...")
        time.sleep(0.2)

# daemon=True：把它设为守护线程
t = threading.Thread(target=background_task, daemon=True)
t.start()

# 主线程睡 0.5 秒后退出
# 退出时 daemon 线程被强制终止，不会 join
time.sleep(0.5)
print("主线程退出，daemon 线程自动结束")
\`\`\`

daemon 的判断：

- **用 daemon**：心跳、监控、日志刷盘、UI 后台线程——这些任务不希望阻塞程序退出。
- **不用 daemon**：需要正常清理、保存数据的任务——必须 \`join()\` 等它结束。

### 五、线程状态与常用方法

\`\`\`python
import threading
import time

def task():
    time.sleep(0.5)

t = threading.Thread(target=task)

# 启动前
print(f"启动前 is_alive: {t.is_alive()}")  # False

t.start()
print(f"启动后 is_alive: {t.is_alive()}")  # True
print(f"线程名: {t.name}")
print(f"是 daemon: {t.daemon}")
print(f"线程 ID: {t.ident}")  # 系统级线程 ID

# 修改名字（启动前）
# t.name = "MyThread"

t.join()
print(f"结束后 is_alive: {t.is_alive()}")  # False
\`\`\`

### 六、获取所有线程

\`\`\`python
import threading
import time

def task():
    time.sleep(0.3)

t = threading.Thread(target=task, name="WorkerThread")
t.start()

# enumerate 返回所有活跃线程（包括 MainThread）
print("所有活跃线程:")
for thread in threading.enumerate():
    print(f"  {thread.name} (alive={thread.is_alive()}, daemon={thread.daemon})")

# active_count 返回活跃线程数
print(f"活跃线程数: {threading.active_count()}")
# 等于 len(threading.enumerate())

t.join()
\`\`\`

### 七、主线程对象

\`\`\`python
import threading

# main_thread 返回主线程对象
main = threading.main_thread()
print(f"主线程名: {main.name}")  # MainThread
print(f"主线程是 daemon: {main.daemon}")  # False（主线程不可能是 daemon）

# current_thread 返回当前代码所在线程
current = threading.current_thread()
print(f"当前代码所在线程: {current.name}")

# 在主线程里：main_thread() is current_thread()
print(f"主线程里 main == current: {main is current}")
\`\`\`

### 八、Timer：延迟执行的线程

\`threading.Timer\` 是 \`Thread\` 的子类，**延迟一段时间后执行**：

\`\`\`python
import threading
import time

def reminder(msg: str):
    print(f"[{time.strftime('%H:%M:%S')}] 提醒: {msg}")

# Timer(间隔秒数, 函数, 参数)
# 0.3 秒后执行
timer = threading.Timer(0.3, reminder, args=("开会了！",))
timer.start()
print(f"[{time.strftime('%H:%M:%S')}] 定时器已启动")

# 可以 cancel 取消（必须在执行前）
# timer.cancel()

timer.join()
print("定时器任务完成")
\`\`\`

实际用途：

- 缓存过期后刷新
- 定时清理临时文件
- 防抖（debounce）：用户停止输入 0.5 秒后才搜索

### 九、Event：线程间事件信号

\`Event\` 是最简单的线程通信机制——**一个线程 set，另一个线程 wait**：

\`\`\`python
import threading
import time

# Event 内部维护一个 bool 标志
event = threading.Event()

def waiter(name: str):
    """等待者：等到事件被 set 才继续。"""
    print(f"[{name}] 等待事件...")
    # wait 阻塞直到 event.set() 被调用
    # 可以加 timeout 参数
    flag = event.wait(timeout=2.0)
    if flag:
        print(f"[{name}] 收到事件，继续执行")
    else:
        print(f"[{name}] 等待超时")

def setter():
    """设置者：睡一会儿后 set 事件。"""
    time.sleep(0.3)
    print("[setter] 触发事件")
    event.set()  # 触发

# 启动等待者
threads = [threading.Thread(target=waiter, args=(f"W{i}",)) for i in range(3)]
for t in threads:
    t.start()

# 启动设置者
threading.Thread(target=setter).start()

for t in threads:
    t.join()

# Event 的常用方法
print(f"event.is_set(): {event.is_set()}")  # True
event.clear()  # 重置为 False
print(f"clear 后 is_set(): {event.is_set()}")  # False
\`\`\`

Event 适合"一次性广播"——比如启动信号、停止信号。

### 十、Barrier：线程同步栅栏

\`Barrier\` 让 N 个线程都到达某个点后，再**同时继续**：

\`\`\`python
import threading
import time

# 创建一个 Barrier：3 个线程都到达后才放行
barrier = threading.Barrier(3)

def runner(name: str):
    print(f"[{name}] 准备起跑...")
    time.sleep(0.1 * (["A", "B", "C"].index(name) + 1))
    print(f"[{name}] 到达起跑线，等待其他人")
    # wait：到达栅栏，等其他线程也到达
    barrier.wait()
    print(f"[{name}] 起跑！")

threads = [threading.Thread(target=runner, args=(name,)) for name in ["A", "B", "C"]]
for t in threads:
    t.start()
for t in threads:
    t.join()
\`\`\`

实际用途：分阶段任务，每阶段所有线程都完成后才开始下一阶段。

### 十一、local：线程局部变量

\`threading.local()\` 创建的对象，**每个线程访问的是独立的副本**：

\`\`\`python
import threading

# 创建一个线程局部对象
local_data = threading.local()

def worker(name: str):
    # 每个线程看到的 local_data.user 都是独立的
    local_data.user = name
    # 模拟一些操作
    import time
    time.sleep(0.05)
    # 读出来验证
    print(f"[{threading.current_thread().name}] user={local_data.user}")

# 5 个线程，每个写入不同的值
threads = [threading.Thread(target=worker, args=(f"user{i}",)) for i in range(5)]
for t in threads:
    t.start()
for t in threads:
    t.join()

# 主线程没有设置过 user
try:
    print(f"主线程 user={local_data.user}")
except AttributeError:
    print("主线程没设置过 user，访问会报 AttributeError")
\`\`\`

实际用途：

- 数据库连接池：每个线程独立的连接
- Web 框架的 \`request\` 对象：每个请求线程独立
- 日志上下文：每个线程的 request_id 等

### 十二、线程返回值

\`Thread\` 默认没有返回值机制。要拿到结果，几种方式：

\`\`\`python
import threading

# 方式 1：用全局列表
results = []
def task1(x):
    results.append(x * x)

t = threading.Thread(target=task1, args=(5,))
t.start(); t.join()
print(f"方式1 结果: {results[0]}")

# 方式 2：用队列（推荐，下一章细讲）
from queue import Queue
q = Queue()
def task2(x):
    q.put(x * x)

t = threading.Thread(target=task2, args=(7,))
t.start(); t.join()
print(f"方式2 结果: {q.get()}")

# 方式 3：继承 Thread，存到 self
class ResultThread(threading.Thread):
    def __init__(self, x):
        super().__init__()
        self.x = x
        self.result = None
    def run(self):
        self.result = self.x * self.x

t = ResultThread(9)
t.start(); t.join()
print(f"方式3 结果: {t.result}")
\`\`\`

### 十三、实战：并发下载模拟

\`\`\`python
import threading
import time
from urllib.parse import urlparse

# 模拟下载一个 URL
def fake_download(url: str, results: list):
    """模拟下载，把结果存入 results。"""
    # 模拟网络延迟
    delay = 0.1 + (hash(url) % 100) / 1000
    time.sleep(delay)
    # 模拟下载的内容
    size = 100 + (hash(url) % 500)
    results.append({"url": url, "size": size, "delay": delay})

# 要下载的 URL 列表
urls = [
    "https://example.com/page1",
    "https://example.com/page2",
    "https://example.com/page3",
    "https://example.com/page4",
    "https://example.com/page5",
]

# 串行下载
start = time.perf_counter()
serial_results = []
for url in urls:
    fake_download(url, serial_results)
serial_time = time.perf_counter() - start
print(f"串行: {serial_time:.3f}s, 下载 {len(serial_results)} 个")

# 并发下载
start = time.perf_counter()
concurrent_results = []
threads = [threading.Thread(target=fake_download, args=(url, concurrent_results)) for url in urls]
for t in threads:
    t.start()
for t in threads:
    t.join()
concurrent_time = time.perf_counter() - start
print(f"并发: {concurrent_time:.3f}s, 下载 {len(concurrent_results)} 个")
print(f"加速比: {serial_time / concurrent_time:.2f}x")
\`\`\`

### 十四、ThreadPool：限制线程数量

大量任务时不能无脑开线程（每个线程消耗 ~8MB 栈空间）。要限制线程数：

\`\`\`python
import threading
import time

# 用信号量限制同时运行的线程数
# 这里限制最多 3 个线程同时工作
semaphore = threading.Semaphore(3)

def worker(n: int):
    with semaphore:  # 获取信号量，超出会阻塞
        print(f"[{n}] 开始")
        time.sleep(0.1)
        print(f"[{n}] 结束")

# 10 个任务，但同一时刻最多 3 个在跑
threads = [threading.Thread(target=worker, args=(i,)) for i in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()
\`\`\`

更推荐用 \`concurrent.futures.ThreadPoolExecutor\`（第 60 章详细讲）。

### 十五、线程安全：为什么需要锁

先看一个**不安全**的例子：

\`\`\`python
import threading

# 共享变量
counter = 0

def increment(n: int):
    global counter
    for _ in range(n):
        # 这一行不是原子的：读 counter、加 1、写回
        # 三个步骤之间可能被其他线程打断
        counter += 1

# 10 个线程，每个自增 10000
threads = [threading.Thread(target=increment, args=(10000,)) for _ in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()

# 期望 100000，实际通常少很多
print(f"期望: 100000, 实际: {counter}")
\`\`\`

\`counter += 1\` 在 Python 字节码层面是：

1. \`LOAD_GLOBAL\` 读 counter
2. \`LOAD_CONST\` 读 1
3. \`BINARY_ADD\` 相加
4. \`STORE_GLOBAL\` 写回

每一步之间都可能被 GIL 切换出去，导致**两个线程都读到旧值，写回时丢失更新**。下一章讲怎么用锁解决。

### 十六、active_count 与 daemon 的坑

\`\`\`python
import threading
import time

# 坑 1：daemon 线程在主线程退出时被强行 kill
# 如果 daemon 线程正在写文件，可能造成数据损坏

# 坑 2：非 daemon 线程没 join 就退出主线程
# 主线程会等所有非 daemon 线程结束
def non_daemon_task():
    time.sleep(0.3)
    print("非 daemon 线程结束")

t = threading.Thread(target=non_daemon_task)  # daemon=False 默认
t.start()
# 没 join，但主线程退出时会隐式 join 非 daemon 线程
print("主线程继续走，但程序不会结束，直到非 daemon 线程结束")
\`\`\`

## 小结

- ⭐ \`Thread\` 两种创建方式：\`target=\` 函数式（简单）、继承 \`Thread\` 重写 \`run\`（复杂逻辑）。
- ⭐ **必须 \`start()\` 启动线程**，调用 \`run()\` 只是普通函数调用。
- ⭐ \`daemon=True\` 的线程主线程退出时自动结束，适合后台任务。
- ⭐ \`Timer(n, func)\` 延迟 n 秒后执行一次。
- ⭐ \`Event\` 用于线程间一次性广播信号：\`set()\` / \`wait()\` / \`clear()\` / \`is_set()\`。
- ⭐ \`Barrier(n)\` 让 n 个线程同时到达后再一起继续。
- ⭐ \`threading.local()\` 实现线程局部变量，每个线程独立副本（DB 连接、request 上下文）。
- ⭐ \`threading.enumerate()\` 列出所有活跃线程，\`active_count()\` 返回数量。
- ⚠️ \`counter += 1\` 不是原子操作，并发会丢失更新，下一章用 \`Lock\` 解决。
- 下一章深入锁与线程同步：\`Lock\`、\`RLock\`、\`Semaphore\`、\`Condition\`、\`Queue\`、死锁。`,
  },

  // ============================================================
  // 第五十八章 锁与线程同步
  // ============================================================
  {
    id: 'py10-ch58',
    group: '第十二部分 并发编程',
    icon: '🔒',
    title: '第五十八章 锁与线程同步',
    content: `## 第五十八章 锁与线程同步

多线程最大的坑就是**数据竞争**——多个线程同时修改共享数据，导致结果不可预测。这一章彻底讲清楚：为什么 \`counter += 1\` 不安全、\`Lock\` / \`RLock\` 怎么用、\`Semaphore\` 控制并发数、\`Condition\` 实现生产者-消费者、\`Queue\` 是线程安全的最佳选择、死锁怎么避免。

### 一、为什么 counter += 1 不安全

上一章看到 \`counter += 1\` 在多线程下会丢失更新。原因：它**不是原子操作**，在 Python 字节码层面是多个步骤：

\`\`\`python
import dis

def add_one():
    counter = 0
    counter += 1

# 反汇编看 counter += 1 的字节码
# 会看到 LOAD_FAST / LOAD_CONST / BINARY_ADD / STORE_FAST 等多个指令
dis.dis(add_one)
# 每条字节码之间，GIL 都可能切换线程
# 所以 counter += 1 不是原子的
\`\`\`

虽然 GIL 保证同一时刻只有一个线程在执行字节码，但**每条字节码之间**都可能切换线程。所以 \`counter += 1\` 这种"读-改-写"操作在多线程下是不安全的。

### 二、Lock 基础用法

\`threading.Lock\` 是最基础的锁——**互斥锁**：

\`\`\`python
import threading

# 创建锁
lock = threading.Lock()

# acquire 获取锁，release 释放锁
def task_without_with():
    lock.acquire()  # 获取锁，如果已被占用会阻塞
    try:
        # 临界区：同一时刻只有一个线程能进入
        print("进入临界区")
    finally:
        # 必须在 finally 里释放，否则异常会卡死
        lock.release()

# 推荐：用 with 语句，自动 acquire / release
def task_with_with():
    with lock:
        # 进入 with 块时自动 acquire
        print("进入临界区")
        # 退出 with 块时自动 release，即使出异常也会释放
        # 这比 try/finally 更简洁安全
        pass

task_without_with()
task_with_with()
\`\`\`

> **永远用 \`with lock:\`** 而不是 \`acquire/release\`，避免忘记 release 导致死锁。

### 三、用 Lock 解决 counter 问题

\`\`\`python
import threading

counter = 0
lock = threading.Lock()

def increment(n: int):
    global counter
    for _ in range(n):
        # 用 with 锁保护临界区
        with lock:
            counter += 1

# 10 个线程，每个自增 10000
threads = [threading.Thread(target=increment, args=(10000,)) for _ in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()

# 这次结果是正确的 100000
print(f"期望: 100000, 实际: {counter}")
\`\`\`

### 四、锁的性能影响

锁是有代价的——它把并发变成串行。下面这个 demo 展示锁对性能的影响：

\`\`\`python
import threading
import time

# 不加锁的版本（结果错误，但快）
def unsafe_increment(counter_list, n):
    for _ in range(n):
        counter_list[0] += 1

# 加锁的版本（结果正确，但慢）
def safe_increment(counter_list, lock, n):
    for _ in range(n):
        with lock:
            counter_list[0] += 1

# 不加锁
counter = [0]
start = time.perf_counter()
threads = [threading.Thread(target=unsafe_increment, args=(counter, 100000)) for _ in range(5)]
for t in threads: t.start()
for t in threads: t.join()
print(f"不加锁: {time.perf_counter() - start:.3f}s, 结果: {counter[0]}")

# 加锁
counter = [0]
lock = threading.Lock()
start = time.perf_counter()
threads = [threading.Thread(target=safe_increment, args=(counter, lock, 100000)) for _ in range(5)]
for t in threads: t.start()
for t in threads: t.join()
print(f"加锁: {time.perf_counter() - start:.3f}s, 结果: {counter[0]}")
# 加锁会让程序慢很多——这是并发的代价
\`\`\`

### 五、RLock：可重入锁

普通 \`Lock\` 如果在同一线程里 acquire 两次会**死锁**：

\`\`\`python
import threading

# 普通锁：同一线程 acquire 两次会死锁
lock = threading.Lock()

# 下面这段会卡死
# lock.acquire()
# lock.acquire()  # 死锁：因为锁已被占用，但又想再获取
# lock.release()
# lock.release()

# RLock（可重入锁）：同一线程可以多次 acquire
rlock = threading.RLock()

rlock.acquire()
rlock.acquire()  # 同一线程再 acquire，OK
print("RLock 同一线程可以多次 acquire")
rlock.release()
rlock.release()  # 必须配对 release
\`\`\`

RLock 适用场景：**递归函数**、**装饰器**里调用其他加锁函数。

\`\`\`python
import threading

rlock = threading.RLock()

def recursive_factorial(n: int):
    """递归计算阶乘，每层都加锁。"""
    with rlock:
        if n <= 1:
            return 1
        # 递归调用，会再次 acquire
        # 用 Lock 会死锁，用 RLock 没问题
        return n * recursive_factorial(n - 1)

print(f"5! = {recursive_factorial(5)}")
\`\`\`

### 六、Semaphore：信号量

\`Semaphore(n)\` 允许 n 个线程同时进入临界区（Lock 是 Semaphore(1) 的特例）：

\`\`\`python
import threading
import time

# 限制最多 3 个线程同时工作
sem = threading.Semaphore(3)

def download(url: str):
    with sem:  # 获取信号量
        print(f"[{url}] 开始下载")
        time.sleep(0.1)
        print(f"[{url}] 完成")

# 10 个线程，但同时只有 3 个在跑
threads = [threading.Thread(target=download, args=(f"url{i}",)) for i in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()
\`\`\`

实际用途：

- 限制并发连接数（数据库连接池、爬虫并发数）
- 限流（API 调用频率控制）

### 七、BoundedSemaphore

\`BoundedSemaphore\` 比 \`Semaphore\` 多一个检查：**release 次数不能超过 acquire 次数**：

\`\`\`python
import threading

# 普通 Semaphore：可以多 release，不报错
sem = threading.Semaphore(3)
sem.acquire()
sem.release()
sem.release()  # 不报错，但会让信号量 +1（可能造成 bug）

# BoundedSemaphore：release 次数超过 acquire 会报错
bsem = threading.BoundedSemaphore(3)
bsem.acquire()
bsem.release()
try:
    bsem.release()  # 报 ValueError
except ValueError as e:
    print(f"BoundedSemaphore 报错: {e}")
\`\`\`

> 推荐用 \`BoundedSemaphore\`，能帮你发现 release 配对错误。

### 八、Condition：条件变量

\`Condition\` 比 \`Event\` 更强大——可以**等待某个条件成立**，由其他线程通知：

\`\`\`python
import threading
import time
import random

# 经典生产者-消费者模型
condition = threading.Condition()
data = []  # 共享数据

def producer():
    """生产者：往 data 里放数据。"""
    for i in range(5):
        with condition:
            item = f"item-{i}"
            data.append(item)
            print(f"[生产者] 生产 {item}, 当前数量: {len(data)}")
            # 通知等待的消费者
            condition.notify()  # 唤醒一个等待者
        time.sleep(random.uniform(0.05, 0.15))

def consumer():
    """消费者：从 data 里取数据。"""
    for _ in range(5):
        with condition:
            # 等待条件：data 非空
            while not data:
                # wait 会释放锁，让其他线程能修改 data
                # 被唤醒后自动重新获取锁
                condition.wait()
            item = data.pop(0)
            print(f"[消费者] 消费 {item}, 剩余: {len(data)}")
        time.sleep(random.uniform(0.05, 0.15))

# 启动
t_p = threading.Thread(target=producer)
t_c = threading.Thread(target=consumer)
t_p.start(); t_c.start()
t_p.join(); t_c.join()
\`\`\`

\`Condition\` 的方法：

- \`acquire()\` / \`release()\`：和锁一样
- \`wait()\`：释放锁，进入等待；被唤醒后重新获取锁
- \`notify(n=1)\`：唤醒 n 个等待者
- \`notify_all()\`：唤醒所有等待者

### 九、Queue：线程安全队列

\`queue.Queue\` 是**线程安全**的 FIFO 队列，**多线程通信的最佳选择**——内部已经用了锁：

\`\`\`python
import threading
import queue
import time
import random

# 创建一个有界队列：最多放 10 个元素
q = queue.Queue(maxsize=10)

def producer(name: str):
    """生产者：往队列里 put。"""
    for i in range(5):
        item = f"{name}-item-{i}"
        # put 会自动加锁
        # 队列满时会阻塞（maxsize=10）
        q.put(item)
        print(f"[{name}] 生产 {item}")
        time.sleep(random.uniform(0.05, 0.15))
    # 哨兵：告诉消费者结束了
    q.put(None)

def consumer(name: str):
    """消费者：从队列里 get。"""
    while True:
        # get 会自动加锁，队列空时阻塞
        item = q.get()
        if item is None:
            # 收到哨兵，结束
            # 再 put 一个哨兵给其他消费者
            q.put(None)
            break
        print(f"[{name}] 消费 {item}")
        # 标记任务完成
        q.task_done()
        time.sleep(random.uniform(0.05, 0.15))

# 启动生产者和消费者
producers = [threading.Thread(target=producer, args=(f"P{i}",)) for i in range(2)]
consumers = [threading.Thread(target=consumer, args=(f"C{i}",)) for i in range(3)]

for t in producers + consumers:
    t.start()
for t in producers + consumers:
    t.join()

print("所有任务完成")
\`\`\`

Queue 的优点：

- **线程安全**：内部用锁保护，不用自己加锁
- **阻塞接口**：\`put\` 满了阻塞，\`get\` 空了阻塞，自动协调
- **多种队列**：\`Queue\`（FIFO）、\`LifoQueue\`（LIFO）、\`PriorityQueue\`（优先级）

### 十、PriorityQueue：优先级队列

\`\`\`python
import queue

# PriorityQueue 元素按从小到大出队
# 元素必须是可比较的（实现 __lt__）
pq = queue.PriorityQueue()

# put 元组：(优先级, 数据)
# 优先级数字越小，越先出队
pq.put((3, "普通任务"))
pq.put((1, "紧急任务"))
pq.put((2, "重要任务"))
pq.put((1, "另一个紧急"))

# 出队顺序：按优先级
while not pq.empty():
    priority, task = pq.get()
    print(f"优先级 {priority}: {task}")
\`\`\`

### 十一、Queue 的常用方法

\`\`\`python
import queue

q = queue.Queue(maxsize=3)

# put / get 默认会阻塞
# block=False 不阻塞，会抛 queue.Full / queue.Empty
try:
    q.put(1, block=False)
    q.put(2, block=False)
    q.put(3, block=False)
    q.put(4, block=False)  # 满了，抛 queue.Full
except queue.Full:
    print("队列满了")

print(f"qsize: {q.qsize()}")
print(f"empty: {q.empty()}")
print(f"full: {q.full()}")

# get 的 timeout 参数
try:
    item = q.get(block=True, timeout=0.1)
    print(f"拿到: {item}")
except queue.Empty:
    print("队列为空")

# put 的 timeout 参数
q.get(); q.get(); q.get()  # 清空
try:
    q.get(timeout=0.1)
except queue.Empty:
    print("队列空了，超时")
\`\`\`

### 十二、死锁

死锁（Deadlock）：**两个线程互相等待对方释放锁**，永远卡死。

\`\`\`python
import threading
import time

# 死锁的经典场景：两个锁，两个线程，反向获取
lock_a = threading.Lock()
lock_b = threading.Lock()

def task1():
    """先获取 A，再获取 B。"""
    with lock_a:
        print("task1 拿到 A")
        time.sleep(0.1)  # 给 task2 时间拿到 B
        with lock_b:
            print("task1 拿到 B")

def task2():
    """先获取 B，再获取 A。"""
    with lock_b:
        print("task2 拿到 B")
        time.sleep(0.1)
        with lock_a:
            print("task2 拿到 A")

# 注意：实际跑这段会卡死！
# 这里只是演示，不真的执行
# t1 = threading.Thread(target=task1)
# t2 = threading.Thread(target=task2)
# t1.start(); t2.start()
# t1.join(); t2.join()
print("（死锁示例不会真跑，只是说明原理）")
\`\`\`

### 十三、避免死锁的方法

\`\`\`python
import threading

# 方法 1：固定锁的获取顺序
# 所有线程都按相同顺序获取锁，就不会死锁
lock_a = threading.Lock()
lock_b = threading.Lock()

def safe_task1():
    # 总是先 A 后 B
    with lock_a:
        with lock_b:
            print("safe_task1 完成")

def safe_task2():
    # 也总是先 A 后 B
    with lock_a:
        with lock_b:
            print("safe_task2 完成")

t1 = threading.Thread(target=safe_task1)
t2 = threading.Thread(target=safe_task2)
t1.start(); t2.start()
t1.join(); t2.join()

# 方法 2：用 acquire(timeout=) 设置超时
# 拿不到就放弃，避免永久等待
lock = threading.Lock()

def try_lock_task():
    # 尝试获取锁，1 秒内拿不到就返回 False
    if lock.acquire(timeout=1.0):
        try:
            print("拿到锁了")
        finally:
            lock.release()
    else:
        print("1 秒内拿不到锁，放弃")
\`\`\`

### 十四、用 with 管理多个锁

\`\`\`python
import threading

# 用 contextlib.ExitStack 动态管理多个锁
from contextlib import ExitStack

lock_a = threading.Lock()
lock_b = threading.Lock()

def task():
    # 一次性获取多个锁，自动按顺序释放
    with ExitStack() as stack:
        stack.enter_context(lock_a)
        stack.enter_context(lock_b)
        print("同时持有 A 和 B")
    # 离开 with 块后，自动按 LIFO 顺序释放

t = threading.Thread(target=task)
t.start(); t.join()
\`\`\`

### 十五、实战：线程安全的限速器

\`\`\`python
import threading
import time

class RateLimiter:
    """令牌桶限速器：每秒最多 N 次操作。"""

    def __init__(self, rate: float):
        self.rate = rate  # 每秒令牌数
        self.tokens = rate  # 初始令牌
        self.last_time = time.monotonic()
        self.lock = threading.Lock()

    def acquire(self):
        """获取一个令牌，没有就阻塞。"""
        with self.lock:
            now = time.monotonic()
            # 补充令牌：按时间差补充
            elapsed = now - self.last_time
            self.tokens = min(self.rate, self.tokens + elapsed * self.rate)
            self.last_time = now

            if self.tokens >= 1:
                self.tokens -= 1
                return True
            else:
                # 等待令牌
                wait = (1 - self.tokens) / self.rate
                time.sleep(wait)
                self.tokens = 0
                self.last_time = time.monotonic()
                return True

# 测试：每秒 5 次限速
limiter = RateLimiter(rate=5)

def make_request(i: int):
    limiter.acquire()
    print(f"[{time.strftime('%H:%M:%S.%f')[:-3]}] 请求 {i}")

# 10 个线程同时发请求
threads = [threading.Thread(target=make_request, args=(i,)) for i in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()
\`\`\`

### 十六、threading.active_count 与等待所有线程

\`\`\`python
import threading
import time

def worker(n: int):
    time.sleep(0.05 * n)

# 启动多个线程
threads = [threading.Thread(target=worker, args=(i,)) for i in range(5)]
for t in threads:
    t.start()

# 等待所有线程结束的方式
# 方式 1：显式 join 所有
for t in threads:
    t.join()
print("方式 1: 所有线程结束")

# 方式 2：用 enumerate 等（注意会包括 MainThread）
def worker2():
    time.sleep(0.05)

for _ in range(3):
    threading.Thread(target=worker2, daemon=True).start()

# 不推荐靠 daemon 自动结束，应该显式 join
\`\`\`

## 小结

- ⭐ \`counter += 1\` 在 Python 里不是原子操作，多线程下需要锁。
- ⭐ **永远用 \`with lock:\`**，不用 \`acquire/release\`，避免忘记释放。
- ⭐ \`Lock\` 互斥锁；\`RLock\` 可重入锁，适合同线程递归 acquire。
- ⭐ \`Semaphore(n)\` 允许 n 个线程同时进入；推荐 \`BoundedSemaphore\`。
- ⭐ \`Condition\` 实现生产者-消费者：\`wait()\` 释放锁等待，\`notify()\` / \`notify_all()\` 唤醒。
- ⭐ \`queue.Queue\` 是**线程安全**队列，多线程通信首选，不用手动加锁。
- ⭐ \`Queue\`（FIFO）、\`LifoQueue\`（LIFO）、\`PriorityQueue\`（优先级）。
- ⚠️ 死锁：避免方法——固定锁顺序、设置 \`timeout\`、用更高层抽象（Queue）。
- 下一章讲 \`multiprocessing\`——绕开 GIL，真正利用多核 CPU。`,
  },

  // ============================================================
  // 第五十九章 multiprocessing 多进程
  // ============================================================
  {
    id: 'py10-ch59',
    group: '第十二部分 并发编程',
    icon: '🧬',
    title: '第五十九章 multiprocessing 多进程',
    content: `## 第五十九章 multiprocessing 多进程

\`multiprocessing\` 模块是 Python 真正"并行"的方案——每个进程有自己的 GIL，可以真正利用多核 CPU。这一章把 \`Process\`、\`Pool\`、\`Queue\`、\`Pipe\`、\`Manager\` 全套用法讲透，并重点说明 Windows / macOS 上的 \`spawn\` 模式坑：\`if __name__ == "__main__"\` 不是写不写无所谓，是必须写。

### 一、为什么需要多进程

回忆上一章的实验：CPU 密集型任务用多线程不快反而更慢，因为 GIL 限制。多进程才能真正并行：

\`\`\`python
import time
import threading
import multiprocessing as mp

def cpu_task(n: int):
    """CPU 密集型：计算 n 个数的平方和。"""
    total = 0
    for i in range(n):
        total += i * i
    return total

N = 2_000_000

# 单线程
start = time.perf_counter()
cpu_task(N)
cpu_task(N)
print(f"单线程: {time.perf_counter() - start:.3f}s")

# 双线程（GIL 限制，不快）
start = time.perf_counter()
t1 = threading.Thread(target=cpu_task, args=(N,))
t2 = threading.Thread(target=cpu_task, args=(N,))
t1.start(); t2.start()
t1.join(); t2.join()
print(f"双线程: {time.perf_counter() - start:.3f}s (受 GIL 限制)")

# 双进程（真正并行）
# 注意：在沙箱环境里启动子进程可能有兼容性问题
# 这里只是为了演示，实际项目里推荐这么写
if __name__ == "__main__":
    start = time.perf_counter()
    p1 = mp.Process(target=cpu_task, args=(N,))
    p2 = mp.Process(target=cpu_task, args=(N,))
    p1.start(); p2.start()
    p1.join(); p2.join()
    print(f"双进程: {time.perf_counter() - start:.3f}s (真正并行)")
\`\`\`

在多核机器上，双进程基本能让 CPU 时间减半——这才是真正的并行。

### 二、Process 基础

\`multiprocessing.Process\` 的 API 和 \`threading.Thread\` 几乎一样：

\`\`\`python
import multiprocessing as mp
import os
import time

def worker(name: str, delay: float):
    """子进程的工作函数。"""
    print(f"[{name}] PID={os.getpid()}, PPID={os.getppid()}")
    time.sleep(delay)
    print(f"[{name}] 完成, 返回值=None")

# 必须在 if __name__ == "__main__" 里启动进程
# 在 Windows / macOS spawn 模式下尤其重要
if __name__ == "__main__":
    p1 = mp.Process(target=worker, args=("A", 0.2), name="ProcessA")
    p2 = mp.Process(target=worker, args=("B", 0.1), name="ProcessB")

    p1.start()
    p2.start()

    # join 等待子进程结束
    p1.join()
    p2.join()

    # 子进程退出码：0 表示正常退出
    print(f"{p1.name} exitcode: {p1.exitcode}")
    print(f"{p2.name} exitcode: {p2.exitcode}")
\`\`\`

> **重要**：在 Windows / macOS 上 \`multiprocessing\` 默认用 \`spawn\` 启动模式——子进程会重新 import 主模块。如果不写 \`if __name__ == "__main__":\`，会**无限递归创建子进程**，直到崩溃。

### 三、继承 Process 类

和 Thread 一样，可以继承 Process：

\`\`\`python
import multiprocessing as mp

class Worker(mp.Process):
    def __init__(self, task_name: str):
        super().__init__()
        self.task_name = task_name
        self.result = None

    def run(self):
        """重写 run 方法，start() 会调用它。"""
        import time
        # 模拟工作
        time.sleep(0.1)
        # 注意：子进程的 self.result 不会自动同步到父进程
        # 因为进程内存是隔离的
        self.result = f"完成 {self.task_name}"
        print(f"{self.task_name} 完成（在子进程里）")

if __name__ == "__main__":
    p = Worker("task1")
    p.start()
    p.join()
    # 注意：父进程看到的 self.result 还是 None
    # 因为子进程是独立的内存空间
    print(f"父进程看到的 result: {p.result}")
\`\`\`

> **关键区别**：线程共享内存，子进程修改 \`self.result\` 父线程能看到；进程不共享内存，子进程的修改父进程看不到。要传结果必须用 Queue/Pipe/Manager。

### 四、进程间通信：Queue

\`multiprocessing.Queue\` 是**进程安全**的队列（注意：不是 \`queue.Queue\`）：

\`\`\`python
import multiprocessing as mp

def producer(q: mp.Queue):
    """生产者进程：往队列里放数据。"""
    for i in range(5):
        q.put(f"item-{i}")
    # 哨兵
    q.put(None)

def consumer(q: mp.Queue, results: list):
    """消费者进程：从队列里取数据。"""
    while True:
        item = q.get()
        if item is None:
            break
        results.append(item)

if __name__ == "__main__":
    # 注意：multiprocessing.Queue 必须通过 Process 的 args 传递
    # 不能直接 pickle 传给子进程
    q = mp.Queue()
    results = mp.Manager().list()  # 进程间共享的 list

    p1 = mp.Process(target=producer, args=(q,))
    p2 = mp.Process(target=consumer, args=(q, results))

    p1.start(); p2.start()
    p1.join(); p2.join()

    print(f"消费了: {list(results)}")
\`\`\`

### 五、进程间通信：Pipe

\`Pipe\` 是双向管道——返回两个连接对象：

\`\`\`python
import multiprocessing as mp

def sender(conn):
    """发送端。"""
    conn.send("hello")
    conn.send({"key": "value"})
    conn.send([1, 2, 3])
    # 发送结束信号
    conn.send(None)
    conn.close()

def receiver(conn):
    """接收端。"""
    while True:
        data = conn.recv()
        if data is None:
            break
        print(f"收到: {data}")

if __name__ == "__main__":
    # Pipe() 返回 (parent_conn, child_conn)
    # 两端可以双向通信
    parent_conn, child_conn = mp.Pipe()

    p1 = mp.Process(target=sender, args=(child_conn,))
    p2 = mp.Process(target=receiver, args=(parent_conn,))

    p1.start(); p2.start()
    p1.join(); p2.join()
\`\`\`

Pipe vs Queue：

- **Pipe**：点对点，更快，适合两个进程通信。
- **Queue**：多对多，更通用，适合生产者-消费者。

### 六、共享内存：Value 和 Array

\`Value\` 和 \`Array\` 是 C 类型的共享变量：

\`\`\`python
import multiprocessing as mp

def increment(counter, n: int):
    """子进程对共享变量自增。"""
    for _ in range(n):
        with counter.get_lock():
            counter.value += 1

if __name__ == "__main__":
    # "i" 表示 int 类型
    counter = mp.Value("i", 0)

    # 4 个进程，每个自增 10000
    processes = [mp.Process(target=increment, args=(counter, 10000)) for _ in range(4)]
    for p in processes:
        p.start()
    for p in processes:
        p.join()

    print(f"counter: {counter.value} (期望 40000)")
\`\`\`

\`Value\` 的类型码：

- \`"i"\` / \`"l"\`：整数
- \`"f"\` / \`"d"\`：浮点数
- \`"c"\`：字符
- 其他 ctypes 类型

### 七、Manager：更灵活的共享对象

\`Manager()\` 启动一个服务进程，管理共享的 Python 对象（list、dict、Namespace 等）：

\`\`\`python
import multiprocessing as mp

def worker(shared_list, shared_dict, idx: int):
    """子进程修改共享的 list 和 dict。"""
    shared_list.append(f"worker-{idx}")
    shared_dict[f"key-{idx}"] = idx * 10

if __name__ == "__main__":
    with mp.Manager() as manager:
        # 创建共享的 list 和 dict
        shared_list = manager.list()
        shared_dict = manager.dict()

        # 启动多个进程
        processes = [
            mp.Process(target=worker, args=(shared_list, shared_dict, i))
            for i in range(5)
        ]
        for p in processes:
            p.start()
        for p in processes:
            p.join()

        # 父进程能看到子进程的修改
        print(f"shared_list: {list(shared_list)}")
        print(f"shared_dict: {dict(shared_dict)}")
\`\`\`

Manager 的代价：

- **慢**：每次访问都要 IPC（进程间通信），比 \`Value\` 慢得多。
- **灵活**：可以共享任意 Python 对象（list、dict、自定义类）。

### 八、Pool：进程池

\`Pool\` 管理一组 worker 进程，自动分派任务：

\`\`\`python
import multiprocessing as mp

def square(x: int):
    return x * x

if __name__ == "__main__":
    # 创建 4 个进程的池
    with mp.Pool(processes=4) as pool:
        # map：和内置 map 一样，自动分派
        results = pool.map(square, range(10))
        print(f"map: {results}")

        # 异步 map：不阻塞，返回 MapResult
        async_result = pool.map_async(square, range(10))
        # 可以做其他事
        print("等待异步结果...")
        async_result.wait()  # 等待完成
        print(f"map_async: {async_result.get()}")

        # imap：惰性迭代器，节省内存
        # 适合处理大数据
        for r in pool.imap(square, range(10)):
            print(f"  imap: {r}")
\`\`\`

### 九、apply 和 apply_async

\`\`\`python
import multiprocessing as mp

def task(x, y):
    import time
    time.sleep(0.1)
    return x + y

if __name__ == "__main__":
    with mp.Pool(2) as pool:
        # apply：同步，阻塞直到结果（基本不用）
        result = pool.apply(task, args=(1, 2))
        print(f"apply: {result}")

        # apply_async：异步，返回 AsyncResult
        async_result = pool.apply_async(task, args=(3, 4))
        # 可以做其他事
        # get 会阻塞直到结果就绪
        # 可以传 timeout
        result = async_result.get(timeout=2)
        print(f"apply_async: {result}")

        # 批量 apply_async：并发提交多个任务
        async_results = [pool.apply_async(task, args=(i, i)) for i in range(5)]
        # 等所有结果
        results = [r.get() for r in async_results]
        print(f"批量: {results}")
\`\`\`

### 十、Pool 的 chunksize

\`map\` 和 \`imap\` 有 \`chunksize\` 参数——把任务分批：

\`\`\`python
import multiprocessing as mp

def process(n: int):
    return n * 2

if __name__ == "__main__":
    # chunksize=1：每个任务单独发送（开销大）
    # chunksize=N：每 N 个任务打包发送（减少 IPC 开销）
    with mp.Pool(4) as pool:
        # 默认 chunksize 是 len(iterable) / (processes * 4)
        # 对于小任务，调大 chunksize 能显著提速
        results = pool.map(process, range(20), chunksize=5)
        print(f"结果: {results}")
\`\`\`

经验：

- 任务**很小很快** → chunksize 调大（10-100）
- 任务**很大很慢** → chunksize 调小（1-5）

### 十一、CPU 密集型任务实战

\`\`\`python
import multiprocessing as mp
import time
import math

def is_prime(n: int) -> bool:
    """判断 n 是否为素数（CPU 密集型）。"""
    if n < 2:
        return False
    if n < 4:
        return True
    if n % 2 == 0:
        return False
    # 试除到 sqrt(n)
    for i in range(3, int(math.sqrt(n)) + 1, 2):
        if n % i == 0:
            return False
    return True

def count_primes(start: int, end: int) -> int:
    """统计 [start, end) 内的素数。"""
    count = 0
    for n in range(start, end):
        if is_prime(n):
            count += 1
    return count

if __name__ == "__main__":
    # 把 [1, 100000) 拆成 4 段
    total_range = 100_000
    n_procs = 4
    chunk = total_range // n_procs
    ranges = [(i * chunk, (i + 1) * chunk) for i in range(n_procs)]

    # 串行
    start = time.perf_counter()
    serial = sum(count_primes(s, e) for s, e in ranges)
    print(f"串行: {time.perf_counter() - start:.3f}s, 素数 {serial} 个")

    # 并行
    start = time.perf_counter()
    with mp.Pool(n_procs) as pool:
        # starmap：参数是元组列表，会自动展开
        results = pool.starmap(count_primes, ranges)
    parallel = sum(results)
    print(f"并行: {time.perf_counter() - start:.3f}s, 素数 {parallel} 个")
    # 在多核机器上，并行会明显快
\`\`\`

### 十二、starmap：多个参数

\`map\` 只能传单参数，\`starmap\` 可以传多参数：

\`\`\`python
import multiprocessing as mp

def add(a, b):
    return a + b

if __name__ == "__main__":
    # 参数列表：每个元素是一个参数元组
    args_list = [(1, 2), (3, 4), (5, 6)]

    with mp.Pool(2) as pool:
        # starmap 会把每个元组展开成位置参数
        results = pool.starmap(add, args_list)
        print(f"starmap: {results}")  # [3, 7, 11]
\`\`\`

### 十三、CPU 亲和性

绑定进程到特定 CPU 核（Linux/Mac）：

\`\`\`python
import os
import multiprocessing as mp

def worker():
    # 在 Linux 上可以设置 CPU 亲和性
    if hasattr(os, "sched_setaffinity"):
        # 把当前进程绑定到 CPU 0
        os.sched_setaffinity(0, {0})
    print(f"PID {os.getpid()} 运行中")
    import time
    time.sleep(0.1)

if __name__ == "__main__":
    p = mp.Process(target=worker)
    p.start()
    p.join()
\`\`\`

### 十四、共享状态：Namespace

\`Manager().Namespace()\` 创建一个共享的命名空间对象：

\`\`\`python
import multiprocessing as mp

def worker(ns):
    """子进程修改 ns 的属性。"""
    ns.value = 42
    ns.list = [1, 2, 3]

if __name__ == "__main__":
    with mp.Manager() as manager:
        ns = manager.Namespace()
        ns.value = 0
        ns.list = []

        p = mp.Process(target=worker, args=(ns,))
        p.start()
        p.join()

        print(f"value: {ns.value}")  # 42
        print(f"list: {ns.list}")    # [1, 2, 3]
\`\`\`

### 十五、内存共享：shared_memory（3.8+）

\`multiprocessing.shared_memory\` 提供更高效的内存共享（绕过 pickle）：

\`\`\`python
from multiprocessing import shared_memory
import multiprocessing as mp

def worker(shm_name: str):
    """子进程通过名字访问共享内存。"""
    # 附加到已存在的共享内存
    shm = shared_memory.SharedMemory(name=shm_name)
    try:
        # 读取数据
        data = bytes(shm.buf[:5])
        print(f"子进程读到: {data}")
        # 修改数据
        shm.buf[0] = 90  # 'Z' 的 ASCII
    finally:
        # 附加的共享内存要 close（不 unlink）
        shm.close()

if __name__ == "__main__":
    # 创建共享内存
    shm = shared_memory.SharedMemory(create=True, size=10)
    try:
        # 写入数据
        shm.buf[:5] = b"hello"
        print(f"父进程写入: {bytes(shm.buf[:5])}")

        # 启动子进程
        p = mp.Process(target=worker, args=(shm.name,))
        p.start()
        p.join()

        # 看子进程的修改
        print(f"父进程读到的最终值: {bytes(shm.buf[:5])}")
    finally:
        # 父进程负责 unlink（释放共享内存）
        shm.close()
        shm.unlink()
\`\`\`

### 十六、进程异常处理

子进程的异常**不会自动传播**到父进程：

\`\`\`python
import multiprocessing as mp

def crash():
    """子进程里抛异常。"""
    raise ValueError("子进程爆炸")

def safe_run():
    """子进程正常退出，但 exitcode 表示错误。"""
    import sys
    sys.exit(1)

if __name__ == "__main__":
    # 异常会让 exitcode = 1
    p = mp.Process(target=crash)
    p.start()
    p.join()
    print(f"crash exitcode: {p.exitcode}")  # 1

    # 显式 sys.exit 也会 exitcode = 1
    p = mp.Process(target=safe_run)
    p.start()
    p.join()
    print(f"safe_run exitcode: {p.exitcode}")  # 1
\`\`\`

### 十七、Pool 的异常处理

\`\`\`python
import multiprocessing as mp

def task(n: int):
    if n == 3:
        raise ValueError(f"处理 {n} 时出错")
    return n * n

if __name__ == "__main__":
    with mp.Pool(2) as pool:
        # map_async 的异常会延迟到 get() 时抛出
        async_result = pool.map_async(task, range(5))
        try:
            results = async_result.get()
            print(f"结果: {results}")
        except ValueError as e:
            print(f"捕获到子进程异常: {e}")
\`\`\`

### 十八、spawn 和 fork 的差异

\`\`\`python
import multiprocessing as mp
import sys

# 查看当前启动方式
# Linux: fork（默认）
# macOS: spawn（Python 3.8+ 默认）
# Windows: spawn（唯一选择）
print(f"默认启动方式: {mp.get_start_method()}")
print(f"平台: {sys.platform}")

# 设置启动方式（必须在创建任何 Process 之前）
# mp.set_start_method("spawn")  # 显式设置

# 三种启动方式：
# 1. fork：复制父进程内存（Linux 默认）
#    - 优点：快，不需要重新 import
#    - 缺点：可能继承一些状态导致问题
# 2. spawn：重新启动 Python 解释器，只 import 主模块
#    - 优点：干净，跨平台
#    - 缺点：慢，需要重新 import 所有模块
# 3. forkserver：fork 一个干净的服务进程
#    - 优点：相对干净 + 快
#    - 缺点：只在 Unix 系统可用

if __name__ == "__main__":
    # 推荐写法：在 __main__ 里设置
    # mp.set_start_method("spawn")
    print("启动方式演示完成")
\`\`\`

### 十九、为什么必须 if __name__ == "__main__"

\`\`\`python
# 反面教材：不写 if __name__ == "__main__"
# 在 spawn 模式下会无限递归创建子进程

# import multiprocessing as mp
# def worker():
#     print("worker")
# 
# p = mp.Process(target=worker)  # 这里没有 if 保护
# p.start()
# p.join()
# 
# 当 spawn 模式启动子进程时：
# 1. 子进程重新 import 这个模块
# 2. 重新执行模块顶层代码
# 3. 又创建了一个子进程
# 4. 子进程又 import 自己又创建子进程...
# 5. 直到系统资源耗尽崩溃

# 正确写法：
# 把创建进程的代码放在 if __name__ == "__main__": 里
# 这样子进程 import 时，__name__ 是模块名不是 "__main__"
# 就不会执行创建子进程的代码
import multiprocessing as mp

def worker():
    print("worker")

if __name__ == "__main__":
    p = mp.Process(target=worker)
    p.start()
    p.join()
\`\`\`

## 小结

- ⭐ \`multiprocessing\` 是 Python 真正并行的方案，绕开 GIL。
- ⭐ **必须写 \`if __name__ == "__main__":\`**，否则 spawn 模式下会无限递归。
- ⭐ \`Process\` 类 API 和 \`Thread\` 几乎一样，但进程**不共享内存**。
- ⭐ \`Queue\` / \`Pipe\` 用于进程间通信；\`Value\` / \`Array\` 用于共享 C 类型。
- ⭐ \`Manager()\` 提供共享的 list / dict / Namespace，灵活但慢。
- ⭐ \`Pool\` 管理进程池：\`map\` / \`map_async\` / \`imap\` / \`apply_async\` / \`starmap\`。
- ⭐ \`starmap\` 用于多参数任务：\`pool.starmap(func, [(a, b), (c, d)])\`。
- ⭐ \`chunksize\` 影响性能：小任务调大、大任务调小。
- ⭐ \`shared_memory\`（3.8+）绕过 pickle，性能更高。
- ⚠️ 子进程异常**不会**自动传播到父进程，要用 \`get()\` 捕获。
- 下一章是 \`concurrent.futures\`——更简洁的并发抽象，统一了线程池和进程池接口。`,
  },

  // ============================================================
  // 第六十章 concurrent.futures
  // ============================================================
  {
    id: 'py10-ch60',
    group: '第十二部分 并发编程',
    icon: '⚡',
    title: '第六十章 concurrent.futures',
    content: `## 第六十章 concurrent.futures

\`concurrent.futures\` 是 Python 3.2 引入的高级并发模块——**统一了线程池和进程池的 API**。学会它，你就能用最少的代码写出最快的并发程序。这一章把 \`ThreadPoolExecutor\`、\`ProcessPoolExecutor\`、\`Future\` 对象、\`as_completed\` / \`wait\` 全套用法讲透，最后给一个生产者-消费者模式的实战 demo。

### 一、为什么需要 concurrent.futures

前面两章分别讲了 \`threading\` 和 \`multiprocessing\`，它们都有一个问题——**API 不一致**：

- 线程：\`threading.Thread\` + \`threading.Lock\` + \`queue.Queue\`
- 进程：\`multiprocessing.Process\` + \`multiprocessing.Lock\` + \`multiprocessing.Queue\`

代码换了线程/进程就要大改。\`concurrent.futures\` 提供统一的接口：

\`\`\`python
# 线程池
from concurrent.futures import ThreadPoolExecutor

# 进程池
from concurrent.futures import ProcessPoolExecutor

# 两者的 API 完全一样！
# - submit(fn, *args, **kwargs)：提交任务，返回 Future
# - map(fn, *iterables)：批量提交，返回结果迭代器
# - shutdown(wait=True)：关闭池
# - 上下文管理器：with ... as executor
\`\`\`

### 二、ThreadPoolExecutor 基础

\`\`\`python
from concurrent.futures import ThreadPoolExecutor
import time

def download(url: str) -> str:
    """模拟下载：返回 URL 内容。"""
    # IO 密集型任务，用线程池最合适
    time.sleep(0.1)
    return f"<html>{url}</html>"

# with 自动管理池的生命周期
# max_workers：最大线程数
with ThreadPoolExecutor(max_workers=4) as executor:
    # submit 提交一个任务，立即返回 Future 对象
    future = executor.submit(download, "https://example.com")
    # future.result() 阻塞直到任务完成
    print(future.result())

# with 块结束时，executor 会自动 shutdown
# 等所有已提交任务完成
\`\`\`

### 三、Future 对象

\`Future\` 是"未来某个时刻会有结果"的对象——异步编程的基石：

\`\`\`python
from concurrent.futures import ThreadPoolExecutor
import time

def task(n: int) -> int:
    time.sleep(0.1 * n)
    return n * n

with ThreadPoolExecutor(max_workers=4) as executor:
    future = executor.submit(task, 3)

    # 检查是否完成
    print(f"完成? {future.done()}")  # False

    # 可以加回调：完成时自动调用
    def on_complete(fut):
        # fut 就是 future 本身
        print(f"回调: 任务完成, 结果={fut.result()}")

    future.add_done_callback(on_complete)

    # result() 阻塞直到完成（可加 timeout）
    # 注意：result 会重新抛出任务里的异常
    result = future.result(timeout=2.0)
    print(f"结果: {result}")

    # 现在完成了
    print(f"完成? {future.done()}")  # True
\`\`\`

Future 的常用方法：

- \`result(timeout=None)\`：阻塞获取结果
- \`exception()\`：获取异常（无异常返回 None）
- \`done()\`：是否完成
- \`cancelled()\`：是否已取消
- \`cancel()\`：尝试取消（已开始的任务取消不了）
- \`add_done_callback(fn)\`：完成时回调

### 四、批量提交：submit + 循环

\`\`\`python
from concurrent.futures import ThreadPoolExecutor
import time

def task(n: int) -> int:
    time.sleep(0.1)
    return n * n

# 批量提交，把 Future 收集起来
with ThreadPoolExecutor(max_workers=4) as executor:
    # 提交 10 个任务
    futures = [executor.submit(task, i) for i in range(10)]

    # 等待所有完成并收集结果
    results = [f.result() for f in futures]
    print(f"结果: {results}")
    # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
\`\`\`

### 五、map：批量提交的简洁写法

\`executor.map\` 比手动 submit + 循环更简洁：

\`\`\`python
from concurrent.futures import ThreadPoolExecutor
import time

def task(n: int) -> int:
    time.sleep(0.1)
    return n * n

with ThreadPoolExecutor(max_workers=4) as executor:
    # map 返回的是生成器，按提交顺序返回结果
    results_iter = executor.map(task, range(10))

    # 注意：results_iter 是惰性的
    # 必须在 with 块内消费，否则 executor 已关闭
    results = list(results_iter)
    print(f"结果: {results}")
    # 顺序和输入一致：[0, 1, 4, 9, ..., 81]
\`\`\`

\`map\` vs \`submit\`：

- \`map\`：简洁，**结果按提交顺序返回**
- \`submit\`：灵活，可以用 \`as_completed\` 按完成顺序处理

### 六、as_completed：按完成顺序处理

\`as_completed\` 返回一个迭代器——**哪个 Future 先完成就先 yield**：

\`\`\`python
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

def task(n: int) -> int:
    # n 越大睡得越久，越晚完成
    time.sleep(0.1 * (10 - n))
    return n * n

with ThreadPoolExecutor(max_workers=4) as executor:
    # 提交所有任务
    futures = {executor.submit(task, i): i for i in range(5)}

    # as_completed 返回已完成的 Future
    # 按完成顺序遍历
    for future in as_completed(futures):
        idx = futures[future]
        result = future.result()
        print(f"任务 {idx} 完成, 结果 {result}")
        # 输出顺序：4, 3, 2, 1, 0（因为 4 睡得最短）
\`\`\`

**典型场景**：爬 10 个网页，哪个先下完就先处理。如果用 \`map\` 必须等所有任务完成才能开始处理，浪费时间。

### 七、wait：等待 Future 完成

\`wait\` 比 \`as_completed\` 更底层，可以等待**部分完成**：

\`\`\`python
from concurrent.futures import ThreadPoolExecutor, wait, FIRST_COMPLETED, FIRST_EXCEPTION, ALL_COMPLETED
import time

def task(n: int) -> int:
    time.sleep(0.1 * n)
    return n

with ThreadPoolExecutor(max_workers=4) as executor:
    futures = [executor.submit(task, i) for i in range(5)]

    # 等所有完成（默认）
    done, not_done = wait(futures, return_when=ALL_COMPLETED)
    print(f"完成 {len(done)}, 未完成 {len(not_done)}")

    # 任何一个完成就返回
    futures = [executor.submit(task, i + 1) for i in range(5)]
    done, not_done = wait(futures, return_when=FIRST_COMPLETED)
    print(f"FIRST_COMPLETED: 完成 {len(done)}, 未完成 {len(not_done)}")

    # 任何一个出错就返回
    # return_when=FIRST_EXCEPTION
\`\`\`

\`return_when\` 三种模式：

- \`ALL_COMPLETED\`（默认）：等所有完成
- \`FIRST_COMPLETED\`：任何一个完成就返回
- \`FIRST_EXCEPTION\`：任何一个出错就返回

### 八、ProcessPoolExecutor

API 和 \`ThreadPoolExecutor\` 完全一样，但用进程池：

\`\`\`python
from concurrent.futures import ProcessPoolExecutor
import math

def is_prime(n: int) -> bool:
    """判断素数（CPU 密集型）。"""
    if n < 2:
        return False
    if n < 4:
        return True
    if n % 2 == 0:
        return False
    for i in range(3, int(math.sqrt(n)) + 1, 2):
        if n % i == 0:
            return False
    return True

def count_primes(start: int, end: int) -> int:
    return sum(1 for n in range(start, end) if is_prime(n))

if __name__ == "__main__":
    # CPU 密集型任务，用进程池才能真正并行
    with ProcessPoolExecutor(max_workers=4) as executor:
        # 把 [1, 100000) 拆成 4 段
        chunk = 25_000
        ranges = [(i * chunk, (i + 1) * chunk) for i in range(4)]

        # starmap 没了，但可以用 submit + 解包
        # 不过更简洁的写法是用一个 lambda
        futures = [
            executor.submit(count_primes, s, e)
            for s, e in ranges
        ]
        results = [f.result() for f in futures]
        print(f"素数总数: {sum(results)}")
\`\`\`

### 九、什么时候用线程池，什么时候用进程池

\`\`\`python
# 决策树
def choose_pool(task_type: str) -> str:
    if task_type == "IO 密集":
        # 网络、磁盘、数据库
        # GIL 在 IO 等待时会释放，多线程能加速
        return "ThreadPoolExecutor"
    elif task_type == "CPU 密集":
        # 计算、压缩、加密
        # GIL 限制多线程，必须用多进程
        return "ProcessPoolExecutor"
    else:
        return "看情况"

print(choose_pool("IO 密集"))   # 爬虫、文件读写
print(choose_pool("CPU 密集"))  # 数学计算、图像处理
\`\`\`

### 十、map 的 timeout 参数

\`\`\`python
from concurrent.futures import ThreadPoolExecutor
import time

def slow_task(n: int) -> int:
    time.sleep(0.5)
    return n * n

with ThreadPoolExecutor(max_workers=2) as executor:
    try:
        # map 的 timeout：每个结果的等待时间
        # 不是总时间，是单个 result 的超时
        results = list(executor.map(slow_task, range(5), timeout=0.3))
    except TimeoutError as e:
        print(f"超时: {e}")
\`\`\`

### 十一、异常处理

任务抛出的异常会**延迟到 \`result()\` 时重新抛出**：

\`\`\`python
from concurrent.futures import ThreadPoolExecutor

def risky_task(n: int) -> int:
    if n == 2:
        raise ValueError(f"不能处理 {n}")
    return n * n

with ThreadPoolExecutor(max_workers=4) as executor:
    futures = [executor.submit(risky_task, i) for i in range(5)]

    for f in futures:
        try:
            result = f.result()
            print(f"成功: {result}")
        except ValueError as e:
            print(f"失败: {e}")
        except Exception as e:
            print(f"其他异常: {type(e).__name__}: {e}")
\`\`\`

### 十二、回调函数

\`add_done_callback\` 在任务完成时自动调用：

\`\`\`python
from concurrent.futures import ThreadPoolExecutor
import time

def task(n: int) -> int:
    time.sleep(0.1)
    return n * n

def on_complete(future):
    """任务完成时调用的回调。"""
    try:
        result = future.result()
        print(f"回调: 结果 = {result}")
    except Exception as e:
        print(f"回调: 异常 = {e}")

with ThreadPoolExecutor(max_workers=4) as executor:
    for i in range(5):
        future = executor.submit(task, i)
        # 注册回调
        future.add_done_callback(on_complete)
    # with 块结束时会等所有任务完成
\`\`\`

注意：回调在**提交任务的线程**里执行，不是 worker 线程。

### 十三、cancel 取消任务

\`\`\`python
from concurrent.futures import ThreadPoolExecutor
import time

def slow_task(n: int) -> int:
    time.sleep(0.5)
    return n * n

with ThreadPoolExecutor(max_workers=2) as executor:
    # 提交 5 个任务
    futures = [executor.submit(slow_task, i) for i in range(5)]

    # 取消还没开始的任务
    cancelled_count = 0
    for f in futures:
        if f.cancel():
            cancelled_count += 1
    print(f"取消了 {cancelled_count} 个任务")

    # 已开始的任务取消不了
    for f in futures:
        if not f.cancelled():
            try:
                result = f.result(timeout=1.0)
                print(f"结果: {result}")
            except Exception:
                pass
\`\`\`

### 十四、chunksize（仅 ProcessPoolExecutor）

\`ProcessPoolExecutor.map\` 有 \`chunksize\` 参数（\`ThreadPoolExecutor\` 没有）：

\`\`\`python
from concurrent.futures import ProcessPoolExecutor

def square(n: int) -> int:
    return n * n

if __name__ == "__main__":
    # chunksize 把任务分批发送，减少 IPC 开销
    # 默认 chunksize=1，对于小任务可以调大
    with ProcessPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(square, range(100), chunksize=10))
        print(f"前 5 个结果: {results[:5]}")
\`\`\`

### 十五、实战：并发爬虫（模拟）

\`\`\`python
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
import random

# 模拟爬虫
def fetch_url(url: str) -> dict:
    """模拟下载一个 URL，返回状态和耗时。"""
    # 模拟随机延迟
    delay = random.uniform(0.05, 0.3)
    time.sleep(delay)
    return {
        "url": url,
        "status": 200,
        "delay": delay,
    }

urls = [
    "https://example.com/page1",
    "https://example.com/page2",
    "https://example.com/page3",
    "https://example.com/page4",
    "https://example.com/page5",
    "https://example.com/page6",
    "https://example.com/page7",
    "https://example.com/page8",
]

# 串行
start = time.perf_counter()
serial_results = [fetch_url(url) for url in urls]
serial_time = time.perf_counter() - start
print(f"串行: {serial_time:.3f}s, 拿到 {len(serial_results)} 个")

# 并发：用 as_completed 处理
start = time.perf_counter()
results = []
with ThreadPoolExecutor(max_workers=4) as executor:
    # 提交所有任务
    future_to_url = {executor.submit(fetch_url, url): url for url in urls}

    # 按完成顺序处理
    for future in as_completed(future_to_url):
        url = future_to_url[future]
        try:
            result = future.result()
            results.append(result)
            # 哪个先完成就先处理
            print(f"  完成: {url}, 耗时 {result['delay']:.3f}s")
        except Exception as e:
            print(f"  失败: {url}, 错误 {e}")

concurrent_time = time.perf_counter() - start
print(f"并发: {concurrent_time:.3f}s, 拿到 {len(results)} 个")
print(f"加速比: {serial_time / concurrent_time:.2f}x")
\`\`\`

### 十六、实战：CPU 密集型任务并行化

\`\`\`python
from concurrent.futures import ProcessPoolExecutor
import time
import math

def mandelbrot(c: complex, max_iter: int = 100) -> int:
    """计算 Mandelbrot 集合中一个点的迭代次数。"""
    z = 0j
    for i in range(max_iter):
        if abs(z) > 2:
            return i
        z = z * z + c
    return max_iter

def compute_row(args):
    """计算一行像素。"""
    y, width, height, max_iter = args
    row = []
    for x in range(width):
        # 映射到复平面
        cx = (x - width / 2) * 4 / width
        cy = (y - height / 2) * 4 / height
        row.append(mandelbrot(complex(cx, cy), max_iter))
    return row

if __name__ == "__main__":
    width, height = 200, 100
    max_iter = 50

    # 串行
    start = time.perf_counter()
    serial_rows = [
        compute_row((y, width, height, max_iter))
        for y in range(height)
    ]
    print(f"串行: {time.perf_counter() - start:.3f}s")

    # 并行
    start = time.perf_counter()
    with ProcessPoolExecutor() as executor:
        # 把每行作为一个任务
        args = [(y, width, height, max_iter) for y in range(height)]
        parallel_rows = list(executor.map(compute_row, args, chunksize=10))
    print(f"并行: {time.perf_counter() - start:.3f}s")

    # 验证结果一致
    print(f"结果一致: {serial_rows == parallel_rows}")
\`\`\`

### 十七、Future 的 cancelled 和 running

\`\`\`python
from concurrent.futures import ThreadPoolExecutor
import time

def task(n: int) -> int:
    time.sleep(0.3)
    return n * n

with ThreadPoolExecutor(max_workers=1) as executor:
    # 池只有 1 个 worker，第 2 个任务会排队
    f1 = executor.submit(task, 1)
    f2 = executor.submit(task, 2)

    # f1 在运行
    time.sleep(0.05)
    print(f"f1 running? {f1.running()}")  # True
    print(f"f2 running? {f2.running()}")  # False（在排队）

    # f2 还没开始，可以取消
    print(f"f2 cancel: {f2.cancel()}")  # True
    print(f"f2 cancelled? {f2.cancelled()}")  # True

    # f1 已开始，取消不了
    print(f"f1 cancel: {f1.cancel()}")  # False

    f1.result()
\`\`\`

### 十八、Executor 的 shutdown

\`\`\`python
from concurrent.futures import ThreadPoolExecutor
import time

def task(n: int) -> int:
    time.sleep(0.1)
    return n * n

# 不用 with，手动管理
executor = ThreadPoolExecutor(max_workers=2)
futures = [executor.submit(task, i) for i in range(5)]

# shutdown(wait=True)：等待所有任务完成
# wait=False 立即返回，但任务继续在后台跑
# cancel_futures=True：取消所有未开始的任务
executor.shutdown(wait=True, cancel_futures=False)
print(f"结果: {[f.result() for f in futures]}")

# 用 with 更推荐：自动 shutdown
with ThreadPoolExecutor(max_workers=2) as executor:
    futures = [executor.submit(task, i) for i in range(5)]
    # with 块结束时自动 shutdown(wait=True)
print("with 块结束，所有任务已完成")
\`\`\`

### 十九、综合实战：批量处理文件

\`\`\`python
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed
import time
import os
import tempfile
import shutil

# 第一步：生成测试文件
def create_test_files(dir_path: str, n: int = 10):
    """在 dir_path 里生成 n 个测试文件。"""
    os.makedirs(dir_path, exist_ok=True)
    for i in range(n):
        with open(os.path.join(dir_path, f"file_{i}.txt"), "w", encoding="utf-8") as f:
            # 写入一些内容
            f.write(f"File {i}\\n" * (i + 1))

# 第二步：处理单个文件（IO 密集 + 一点 CPU）
def process_file(path: str) -> dict:
    """处理一个文件：读、统计、返回结果。"""
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    return {
        "path": os.path.basename(path),
        "size": len(content),
        "lines": content.count("\\n"),
    }

# 主函数
if __name__ == "__main__":
    # 准备测试目录
    test_dir = tempfile.mkdtemp()
    try:
        # 生成 20 个文件
        create_test_files(test_dir, 20)

        # 列出所有文件
        files = [
            os.path.join(test_dir, f)
            for f in os.listdir(test_dir)
            if f.endswith(".txt")
        ]
        print(f"共 {len(files)} 个文件")

        # 串行处理
        start = time.perf_counter()
        serial_results = [process_file(p) for p in files]
        print(f"串行: {time.perf_counter() - start:.3f}s")

        # 并发处理（IO 密集用线程池）
        start = time.perf_counter()
        with ThreadPoolExecutor(max_workers=4) as executor:
            # 提交所有任务
            futures = {executor.submit(process_file, p): p for p in files}
            results = []
            for f in as_completed(futures):
                results.append(f.result())
        print(f"并发: {time.perf_counter() - start:.3f}s")

        # 验证结果一致
        # 按 path 排序后比较
        serial_results.sort(key=lambda x: x["path"])
        results.sort(key=lambda x: x["path"])
        print(f"结果一致: {serial_results == results}")

    finally:
        # 清理
        shutil.rmtree(test_dir)
\`\`\`

### 二十、性能对比：线程 vs 进程

\`\`\`python
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import time
import math

# CPU 密集型任务
def cpu_task(n: int) -> int:
    total = 0
    for i in range(1, n):
        total += math.isqrt(i)
    return total

# IO 密集型任务
def io_task(n: int) -> int:
    time.sleep(0.05)
    return n

if __name__ == "__main__":
    N_CPU = 10

    # === CPU 密集型 ===
    print("=== CPU 密集型 ===")
    # 串行
    start = time.perf_counter()
    for i in range(N_CPU):
        cpu_task(100_000)
    print(f"串行: {time.perf_counter() - start:.3f}s")

    # 线程池（受 GIL 限制，不快）
    start = time.perf_counter()
    with ThreadPoolExecutor(max_workers=4) as executor:
        list(executor.map(cpu_task, [100_000] * N_CPU))
    print(f"线程池: {time.perf_counter() - start:.3f}s")

    # 进程池（真正并行）
    start = time.perf_counter()
    with ProcessPoolExecutor(max_workers=4) as executor:
        list(executor.map(cpu_task, [100_000] * N_CPU))
    print(f"进程池: {time.perf_counter() - start:.3f}s")

    # === IO 密集型 ===
    print("\\n=== IO 密集型 ===")
    # 串行
    start = time.perf_counter()
    for i in range(N_CPU):
        io_task(i)
    print(f"串行: {time.perf_counter() - start:.3f}s")

    # 线程池
    start = time.perf_counter()
    with ThreadPoolExecutor(max_workers=4) as executor:
        list(executor.map(io_task, range(N_CPU)))
    print(f"线程池: {time.perf_counter() - start:.3f}s")

    # 进程池（启动开销大，IO 密集型没必要）
    start = time.perf_counter()
    with ProcessPoolExecutor(max_workers=4) as executor:
        list(executor.map(io_task, range(N_CPU)))
    print(f"进程池: {time.perf_counter() - start:.3f}s")
\`\`\`

### 二十一、最佳实践

\`\`\`python
# 总结：日常并发编程的最佳实践

# 1. 优先用 concurrent.futures，不用底层 threading/multiprocessing
#    除非需要 Event/Condition 等同步原语

# 2. 用 with 自动管理资源
# with ThreadPoolExecutor() as executor: ...  # 自动 shutdown

# 3. 选对池：
#    - IO 密集 → ThreadPoolExecutor
#    - CPU 密集 → ProcessPoolExecutor

# 4. max_workers 选择：
#    - IO 密集：可以设很大（10-50）
#    - CPU 密集：等于 CPU 核心数（os.cpu_count()）
#    - 不指定时，Python 自动选合理值

# 5. 异常处理：result() 会重新抛异常，要 try/except
# 6. 批量任务：submit + as_completed 比 map 更灵活
# 7. 进程池记得写 if __name__ == "__main__":

from concurrent.futures import ThreadPoolExecutor, as_completed
import time

# 推荐模式
def best_practice_example():
    """推荐的多任务处理模式。"""
    def task(n):
        time.sleep(0.05)
        return n * n

    with ThreadPoolExecutor(max_workers=4) as executor:
        # 用 dict 关联 future 和原始参数
        future_to_arg = {
            executor.submit(task, i): i
            for i in range(10)
        }

        results = []
        # as_completed 按完成顺序处理
        for future in as_completed(future_to_arg):
            arg = future_to_arg[future]
            try:
                result = future.result()
                results.append((arg, result))
            except Exception as e:
                print(f"任务 {arg} 失败: {e}")
        return results

print(best_practice_example())
\`\`\`

## 小结

- ⭐ \`concurrent.futures\` 统一了线程池和进程池的 API：\`submit\` / \`map\` / \`shutdown\`。
- ⭐ \`ThreadPoolExecutor\` 用于 IO 密集型；\`ProcessPoolExecutor\` 用于 CPU 密集型。
- ⭐ \`Future\` 是异步结果的容器：\`result()\` 阻塞获取，\`add_done_callback\` 注册回调。
- ⭐ \`executor.submit(fn, *args)\` 提交任务，返回 Future。
- ⭐ \`executor.map(fn, iterable)\` 批量提交，按提交顺序返回结果。
- ⭐ \`as_completed(futures)\` 按完成顺序遍历——爬虫、批量处理的最佳选择。
- ⭐ \`wait(futures, return_when=FIRST_COMPLETED)\` 等部分完成。
- ⭐ 用 \`with executor:\` 自动 \`shutdown\`，不用手动关闭。
- ⚠️ \`ProcessPoolExecutor\` 必须写 \`if __name__ == "__main__":\`。
- ⚠️ 任务异常**不会自动抛出**，要调 \`future.result()\` 时才重新抛出。
- ⭐ \`max_workers\` 选择：IO 密集型可以设 10-50，CPU 密集型设为 CPU 核心数。
- 至此并发编程部分结束，下一章进入 \`asyncio\` 异步编程——单线程并发的新世界。`,
  },
];
export { chapters };
