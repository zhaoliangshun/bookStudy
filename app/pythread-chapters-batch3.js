// =============================================================
// Python 线程与进程教程 - batch3
// 章节 19-28：multiprocessing 多进程
// 注意：所有 multiprocessing demo 使用 get_context('fork') 启动方式，
//   因为在线运行环境通过 python3 -（stdin）执行代码，
//   默认的 'spawn' 方式子进程无法重新导入主模块会失败。
// =============================================================

export const chapters = [
  // -----------------------------------------------------------
  // 第 19 章：multiprocessing 入门与 fork/spawn
  // -----------------------------------------------------------
  {
    id: "pythread-19",
    group: "multiprocessing 多进程",
    icon: "🌱",
    title: "multiprocessing 入门与 fork/spawn 启动方式",
    content: `## multiprocessing 模块简介

\`multiprocessing\` 是 Python 标准库的多进程模块。每个进程有**独立的内存空间和独立的 GIL**，所以多进程能**真正利用多核 CPU 并行计算**——这是它和 \`threading\` 最大的区别。

\`\`\`python
import multiprocessing as mp

def task():
    print("子进程执行")

p = mp.Process(target=task)
p.start()       # 启动子进程
p.join()        # 等待结束
\`\`\`

API 设计上刻意和 \`threading\` 保持一致：\`Process\` 对应 \`Thread\`，\`Queue\`/\`Pipe\`/\`Lock\`/\`Pool\` 都有同名对应物，学习成本低。

## 三种启动方式

这是 multiprocessing 最容易踩坑的地方。Python 提供 3 种启动子进程的方式：

| 方式 | 原理 | 平台默认 | 特点 |
|------|------|---------|------|
| **fork** | 复制父进程内存（\`os.fork\`） | Linux/POSIX（非 macOS） | 快，但多线程下不安全；Windows 不可用 |
| **spawn** | 全新启动 Python，重新导入主模块 | macOS(3.8+)、Windows | 慢，但干净安全 |
| **forkserver** | 专门的服务进程 fork | 可选（部分 POSIX） | 折中方案，比 fork 安全 |

> ⚠️ **fork 的安全警告**：\`fork\` 会把父进程的整个状态（包括锁）复制一份给子进程，如果父进程已经有多个线程，子进程里那些锁的状态可能不一致，容易死锁或崩溃。Python 3.8 起 macOS 默认改用 \`spawn\`，官方也预告 Linux 上的默认启动方式将不再使用 \`fork\`。新代码建议显式选 \`spawn\` 或 \`forkserver\`；确实需要 \`fork\` 时用 \`mp.get_context("fork")\` 明确指定。另外 \`fork\` 仅在 POSIX（Linux/macOS）可用，**Windows 只有 \`spawn\`**。

### fork vs spawn 的关键区别

- **fork**：子进程是父进程的"克隆"，直接继承内存，**不需要重新执行代码**。
- **spawn**：子进程是一个全新的 Python 解释器，**会重新导入主模块**（即重新执行你的 .py 文件顶层代码），所以必须用 \`if __name__ == "__main__":\` 保护启动代码，否则会无限递归创建子进程。

### ⚠️ 本在线运行环境的特殊情况

本教程的代码通过 \`python3 -\`（从标准输入读取脚本）执行。这种情况下：
- **spawn 会失败**：子进程尝试重新导入 \`__main__\`，但脚本来自 stdin 没有文件，无法重新导入
- **fork 能正常工作**：子进程直接继承内存，不需要重新导入

所以**本教程所有 multiprocessing demo 都显式使用 \`fork\` 启动方式**：

\`\`\`python
ctx = mp.get_context("fork")      # 获取 fork 上下文
p = ctx.Process(target=task)      # 用这个上下文创建进程
\`\`\`

> 💡 **在你自己电脑上**：把 .py 文件存盘后运行，spawn 也能正常工作。本教程用 fork 只是为了适配在线环境。生产代码建议遵循官方推荐：macOS/Windows 用 spawn（默认），代码用 \`if __name__ == "__main__":\` 保护。

## get_context 的用法

\`mp.get_context("fork")\` 返回一个"上下文对象"，它有和 \`multiprocessing\` 一样的 \`Process\`、\`Queue\`、\`Lock\`、\`Pool\` 等方法，但都用指定的启动方式：

\`\`\`python
ctx = mp.get_context("fork")
ctx.Process(...)      # 用 fork 创建进程
ctx.Queue(...)        # 用 fork 兼容的队列
ctx.Pool(...)         # 用 fork 的进程池
\`\`\`

这样能保证同一 demo 里所有对象用同一种启动方式，避免混用出错。

## 多进程能真正并行（对比 GIL）

回顾第3章：多线程做 CPU 密集任务不会变快（GIL）。多进程则不同——每个进程独立 GIL，能真正多核并行。这正是 multiprocessing 的核心价值。

## demo：感受多进程的真正并行

下面 demo 用多进程跑同样的 CPU 密集任务，对比串行，能看到**接近 N 倍提速**（N 为进程数，受 CPU 核数限制）。`,
    code: `# 第十九章 demo：multiprocessing 入门 + 真正并行
import multiprocessing as mp   # 导入多进程模块，简称 mp
import time                     # 用于计时
import os                       # 用于获取进程 PID

def cpu_task(n):
    """纯 CPU 计算：累加 0..n-1"""
    total = 0                   # 累加器初始化为 0
    for i in range(n):          # 循环 n 次，i 从 0 到 n-1
        total += i              # 把每个 i 累加到 total（纯 CPU 运算，不涉及 IO）
    return total                # 返回最终累加结果

N = 4_000_000   # 计算量：4百万次累加，足够耗时以便观察并行加速效果

print("=" * 55)
print("查看当前系统信息")
print("=" * 55)
print(f"  CPU 核心数: {mp.cpu_count()}")                              # mp.cpu_count() 返回逻辑 CPU 核心数
print(f"  默认启动方式: {mp.get_start_method(allow_none=True) or '(未设)'}")  # 查看当前默认的进程启动方式
print()

# 使用 fork 上下文（适配在线运行环境：脚本来自 stdin，spawn 会失败）
# macOS 默认 spawn：子进程是全新 Python 解释器，会重新导入主模块，
# 必须用 if __name__ == "__main__": 保护启动代码，否则无限递归创建子进程。
# fork 则直接复制父进程内存，子进程无需重新导入，所以不需要该保护。
ctx = mp.get_context("fork")   # 获取 fork 启动方式的上下文对象

# ============================================================
# 实验1：创建一个子进程
# ============================================================
print("=" * 55)
print("实验1：创建并启动一个子进程")
print("=" * 55)
def hello(name):
    """子进程入口：打印问候和自己的 PID"""
    print(f"  子进程: 你好 {name}! PID={os.getpid()}")  # os.getpid() 获取当前进程的进程 ID

print(f"  主进程 PID: {os.getpid()}")
# name 给进程起名方便调试；args 必须是元组，单元素要加逗号
p = ctx.Process(target=hello, args=("Python",), name="我的子进程")  # 创建进程对象（此时还没启动）
print(f"  创建后 is_alive={p.is_alive()}")   # 还没 start，所以 False
p.start()                                   # 启动子进程，操作系统开始调度运行
print(f"  start 后 is_alive={p.is_alive()}")  # 已启动，正在运行
p.join()                                    # 阻塞主进程，等待子进程执行完毕
print(f"  join 后 is_alive={p.is_alive()}")   # 已结束，回到 False
print()

# ============================================================
# 实验2：多进程真正并行（对比串行）
# ============================================================
print("=" * 55)
print("实验2：多进程并行 vs 串行（CPU 密集型）")
print("=" * 55)

# 串行：执行两次（单进程内顺序执行两次 cpu_task）
start = time.time()             # 记录开始时间
r1 = cpu_task(N)                # 第一次计算
r2 = cpu_task(N)                # 第二次计算
serial_time = time.time() - start   # 串行总耗时 = 两次计算时间之和
print(f"  串行执行两次: {serial_time:.3f}s (结果 {r1}, {r2})")

# 多进程：两个 worker 进程并行执行
# ctx.Pool(2) 预创建 2 个 worker；pool.map 把任务分发并自动收集返回值
start = time.time()             # 记录并行开始时间
with ctx.Pool(2) as pool:       # 创建含 2 个 worker 的进程池（with 自动管理生命周期）
    results = pool.map(cpu_task, [N, N])   # 阻塞直到全部完成，按顺序返回结果列表
parallel_time = time.time() - start   # 并行总耗时（两个任务同时跑，理论上接近单次耗时）
print(f"  多进程并行两个: {parallel_time:.3f}s (结果 {results})")
print(f"  加速比: {serial_time/parallel_time:.2f}x（接近2倍，因真正并行）")
print()

print("要点：")
print("• multiprocessing 每个进程独立 GIL，能真正多核并行")
print("• fork 复制内存(快)，spawn 全新启动重新导入主模块(干净)")
print("• 本在线环境用 fork（脚本来自 stdin，spawn 无法重新导入）")
print("• API 设计和 threading 一致：Process/Queue/Lock/Pool")`,
  },

  // -----------------------------------------------------------
  // 第 20 章：Process 创建进程与参数传递
  // -----------------------------------------------------------
  {
    id: "pythread-20",
    group: "multiprocessing 多进程",
    icon: "⚙️",
    title: "Process 创建进程与参数传递",
    content: `## 创建 Process 的两种方式

和 \`Thread\` 一样，\`Process\` 也有两种创建方式：

### 方式一：函数式
\`\`\`python
p = mp.Process(target=func, args=(arg1,), kwargs={"key": val})
p.start()
\`\`\`

### 方式二：类继承
\`\`\`python
class MyProcess(mp.Process):
    def __init__(self, name):
        super().__init__()
        self.name_arg = name
    def run(self):
        print(f"子进程 {self.name_arg}")

p = MyProcess("Alice")
p.start()
\`\`\`

> 💡 使用 \`get_context\` 指定启动方式时，类继承应继承 \`ctx.Process\` 而非 \`mp.Process\`。若继承 \`mp.Process\`，子进程会用默认启动方式（macOS 上是 spawn），可能因重新导入主模块而报错。

## 参数传递：args 和 kwargs

- \`args\`：位置参数，**必须是元组**（单元素加逗号）
- \`kwargs\`：关键字参数，字典

\`\`\`python
def task(a, b, c=10):
    print(a, b, c)

p = mp.Process(target=task, args=(1, 2), kwargs={"c": 3})
\`\`\`

> ⚠️ 参数必须是**可序列化（pickle）的**——\`spawn\`/\`forkserver\` 启动时会 pickle 参数传给子进程；\`fork\` 靠继承内存理论上不 pickle 参数，但用 \`Pool\` 时任务参数仍会经内部队列 pickle 传输。所以养成"参数可 pickle"的习惯最稳妥。函数、lambda、文件对象、socket 等不能直接传；自定义函数要定义在**模块顶层**（\`spawn\` 才能按名字重新导入），嵌套函数/闭包无法 pickle。

## 如何拿到子进程的返回值？

\`Process\` 和 \`Thread\` 一样**不能直接返回值**。三种方法获取结果：

### 方法1：用 Queue 传回（最常用）
\`\`\`python
def task(q, n):
    q.put(n * n)           # 结果放进队列

q = mp.Queue()
p = mp.Process(target=task, args=(q, 5))
p.start()
result = q.get()           # 主进程从队列取结果
p.join()
\`\`\`

### 方法2：用共享 Value/Array（第24章）
\`\`\`python
def task(result, n):
    result.value = n * n   # 写入共享内存

result = mp.Value("i", 0)
p = mp.Process(target=task, args=(result, 5))
p.start(); p.join()
print(result.value)
\`\`\`

### 方法3：用进程池 Pool（最优雅，第27章）
\`\`\`python
with mp.Pool(2) as pool:
    result = pool.apply_async(task, (5,)).get()
\`\`\`

## 进程的属性和方法

| 方法/属性 | 作用 |
|----------|------|
| \`p.start()\` | 启动进程 |
| \`p.run()\` | 进程执行的代码（重写它） |
| \`p.join(timeout)\` | 等待结束 |
| \`p.is_alive()\` | 是否在运行 |
| \`p.pid\` | 子进程的进程ID（start 后才有） |
| \`p.exitcode\` | 退出码（0=正常，>0=异常退出，<0=被信号杀死） |
| \`p.name\` | 进程名 |
| \`p.daemon\` | 是否为守护进程 |

## demo：进程创建与参数传递

下面 demo 演示两种创建方式、参数传递、用 Queue 取返回值、查看 exitcode。`,
    code: `# 第二十章 demo：Process 创建与参数传递
import multiprocessing as mp   # 导入多进程模块
import os                       # 用于获取进程 PID 和父进程 PID

ctx = mp.get_context("fork")   # 获取 fork 启动方式上下文

# ============================================================
# 实验1：函数式创建 + args/kwargs
# ============================================================
print("=" * 55)
print("实验1：函数式创建进程，传 args 和 kwargs")
print("=" * 55)

def greet(name, greeting, times=2):
    """子进程执行的函数：name/greeting 是位置参数，times 是关键字参数"""
    print(f"  [子进程 PID={os.getpid()}] 父PID={os.getppid()}")  # getppid() 获取父进程 PID
    for i in range(times):       # 循环 times 次
        print(f"  [子进程] {greeting}, {name}! ({i+1}/{times})")

# args 传位置参数（元组），kwargs 传关键字参数（字典），name 给进程命名
p = ctx.Process(target=greet, args=("Python", "Hello"),
                kwargs={"times": 3}, name="问候进程")
print(f"  [主进程 PID={os.getpid()}] 启动子进程前")
p.start()                        # 启动子进程
print(f"  [主进程] 子进程 PID={p.pid}")  # p.pid 在 start 后才有值
p.join()                         # 等待子进程结束
print(f"  [主进程] 子进程退出码={p.exitcode} (0表示正常)")  # exitcode: 0=正常, >0=异常, <0=被信号杀
print()

# ============================================================
# 实验2：类继承方式
# ============================================================
print("=" * 55)
print("实验2：类继承创建进程")
print("=" * 55)

class Worker(ctx.Process):
    """类继承方式：重写 run() 自定义子进程逻辑（start 会自动调 run）
    注意：必须继承 ctx.Process（fork 上下文），而不是 mp.Process。
    若继承 mp.Process，macOS 默认 spawn 模式会重新导入主模块导致报错。"""
    def __init__(self, task_name, count):
        super().__init__()              # 必须调父类 __init__，初始化进程内部状态
        self.task_name = task_name      # 保存任务名（自定义属性）
        self.count = count              # 保存执行次数（自定义属性）

    def run(self):
        """重写 run：start() 会自动调用它（不要自己调 run，要调 start）"""
        print(f"  [子进程] 任务 {self.task_name} 开始")
        for i in range(self.count):     # 循环 self.count 次
            print(f"  [子进程] {self.task_name} 步骤 {i+1}")
        print(f"  [子进程] 任务 {self.task_name} 完成")

w = Worker("数据处理", 3)   # 实例化自定义进程对象
w.start()                    # start() 会自动调用 run() 方法
w.join()                     # 等待子进程结束
print()

# ============================================================
# 实验3：用 Queue 取回子进程的返回值
# ============================================================
print("=" * 55)
print("实验3：用 Queue 取回子进程返回值")
print("=" * 55)

def compute_and_return(q, x):
    """计算 x 的平方，结果通过队列返回给主进程"""
    result = x * x                # 计算平方
    q.put(result)                      # 结果放进队列（数据会被 pickle 传输）

q = ctx.Queue()                        # 进程间队列，传给子进程当通信通道
processes = []
for x in [3, 5, 7]:                    # 为每个输入值创建一个子进程
    p = ctx.Process(target=compute_and_return, args=(q, x))
    p.start()                          # 启动子进程
    processes.append(p)

# 主进程从队列取 3 次结果（get 阻塞直到有数据）
results = [q.get() for _ in range(3)]  # 列表推导：取 3 次结果
for p in processes:
    p.join()                           # 回收子进程，避免僵尸进程
print(f"  输入: [3, 5, 7]")
print(f"  平方结果: {results}")
print()

# ============================================================
# 实验4：进程异常退出时的 exitcode
# ============================================================
print("=" * 55)
print("实验4：观察 exitcode（正常/异常）")
print("=" * 55)

def normal():
    """正常结束的子进程"""
    print("  [正常进程] 我正常结束")

def crash():
    """故意抛异常的子进程：异常会被 multiprocessing 捕获，exitcode=1"""
    print("  [崩溃进程] 我要崩溃了")
    raise RuntimeError("故意崩溃")    # 抛出异常，子进程异常退出

p1 = ctx.Process(target=normal)       # 正常退出的进程
p1.start(); p1.join()                 # 启动并等待
print(f"  正常进程 exitcode={p1.exitcode} (0=正常)")

p2 = ctx.Process(target=crash)        # 会崩溃的进程
p2.start(); p2.join()                 # 启动并等待（崩溃不影响主进程）
print(f"  崩溃进程 exitcode={p2.exitcode} (1=异常退出)")
print("  (崩溃信息打印在上方，但不会影响主进程)")

print("\\n要点：")
print("• Process 创建方式和 Thread 一致：函数式 / 类继承")
print("• args 必须是元组，参数必须可 pickle")
print("• Process 无返回值，用 Queue / Value / Pool 取结果")
print("• exitcode: 0=正常, >0=异常, <0=被信号杀死")
print("• 子进程崩溃不影响主进程（进程隔离）")`,
  },

  // -----------------------------------------------------------
  // 第 21 章：进程的 join 与 daemon
  // -----------------------------------------------------------
  {
    id: "pythread-21",
    group: "multiprocessing 多进程",
    icon: "🚪",
    title: "进程的 join 与守护进程",
    content: `## 进程的 join

和线程一样，\`p.join(timeout)\` 让主进程等待子进程结束：

\`\`\`python
p.start()
p.join()              # 阻塞等 p 结束
p.join(timeout=5)     # 最多等5秒
\`\`\`

> 💡 **join 还有一个重要作用：回收子进程资源（避免僵尸进程）**。子进程结束后不会立刻消失，而是变成"僵尸进程（zombie/defunct）"，仅保留 PID 和退出码等信息，等父进程调用 \`join()\` / 查询 \`exitcode\` / 底层 \`wait()\` 后才被彻底清理。如果父进程既不 \`join\` 也不查询退出码，僵尸进程会一直占用 PID。所以养成"start 之后必 join"的习惯。守护进程（daemon）由父进程退出时自动清理，不需要担心僵尸问题。

## 守护进程 daemon

进程的 \`daemon\` 属性和线程类似——**守护进程在父进程结束时会被强制终止**。但有一个**重要的额外限制**：

> ⚠️ **守护进程不能创建子进程**（不能有自己的子进程）。这是因为守护进程随时可能被杀，如果它有子进程，子进程会变成孤儿。

\`\`\`python
p = mp.Process(target=task, daemon=True)   # 守护进程
\`\`\`

## 守护进程 vs 非守护进程

| 特性 | 守护进程 (daemon=True) | 非守护进程 (默认) |
|------|---------------------|------------------|
| 父进程结束时 | 被强制终止 | 父进程会等它结束 |
| 能否创建子进程 | **不能** | 能 |
| 典型用途 | 后台监控、心跳 | 业务任务 |

## daemon 必须在 start 前设置

和线程一样，\`daemon\` 必须在 \`start()\` 之前设置，否则报错。

## 进程终止：terminate()

进程比线程多一个能力——可以被**强制终止**：

\`\`\`python
p.terminate()      # 发送 SIGTERM，强制结束子进程
p.join()           # terminate 后仍需 join 等待清理
\`\`\`

> ⚠️ \`terminate()\` 是"粗暴"的——子进程没机会清理资源（关闭文件、数据库连接）。应作为最后手段，正常情况让任务自然结束。

## demo：进程的 join、daemon、terminate

下面 demo 演示进程等待、守护进程、强制终止。`,
    code: `# 第二十一章 demo：进程的 join / daemon / terminate
import multiprocessing as mp   # 导入多进程模块
import time                     # 用于 sleep 模拟耗时
import os                       # 用于获取进程 PID

ctx = mp.get_context("fork")   # 获取 fork 启动方式上下文

def long_task(secs, tag):
    """运行 secs 秒的任务"""
    print(f"  [{tag}] PID={os.getpid()} 开始，运行 {secs}s")
    time.sleep(secs)              # 模拟耗时操作
    print(f"  [{tag}] 正常结束")

# ============================================================
# 实验1：join 等待子进程
# ============================================================
print("=" * 55)
print("实验1：join 等待子进程结束")
print("=" * 55)
p = ctx.Process(target=long_task, args=(0.5, "子进程A"))  # 创建运行 0.5 秒的子进程
p.start()                        # 启动子进程
print(f"  [主] 子进程 PID={p.pid}, is_alive={p.is_alive()}")
p.join()                         # join() 阻塞等待子进程结束
print(f"  [主] join 后 is_alive={p.is_alive()}, exitcode={p.exitcode}")
print()

# ============================================================
# 实验2：join(timeout) 超时 + terminate
# ============================================================
print("=" * 55)
print("实验2：join(timeout) 超时 + terminate 强制终止")
print("=" * 55)
p = ctx.Process(target=long_task, args=(3, "慢进程"))  # 创建运行 3 秒的子进程
p.start()                        # 启动子进程
print(f"  [主] 等0.5秒...")
p.join(timeout=0.5)              # join(timeout) 最多等 0.5 秒，超时就返回
if p.is_alive():                 # 如果 0.5 秒后子进程还在运行
    print(f"  [主] 0.5秒到了，子进程还在跑，terminate 掉它")
    p.terminate()             # 强制终止子进程（发送 SIGTERM 信号）
    p.join()                  # terminate 后仍需 join 等清理
    print(f"  [主] 终止后 exitcode={p.exitcode} (负数=被信号杀)")
print()

# ============================================================
# 实验3：守护进程 —— 父进程结束就被杀
# ============================================================
print("=" * 55)
print("实验3：守护进程 daemon=True")
print("=" * 55)

def heartbeat():
    """守护进程：不停打印心跳（父进程退出时会被自动杀死）"""
    i = 0
    while True:                   # 无限循环，持续发送心跳
        i += 1
        # flush=True 必不可少：守护进程被强杀时不会刷新缓冲区，
        # 不加 flush 心跳输出会全部丢失（stdout 在管道下是块缓冲的）
        print(f"  [守护进程] 心跳 {i}", flush=True)
        time.sleep(0.3)           # 每 0.3 秒一次心跳

# daemon=True 必须在 start 前设置；守护进程父进程一退出就被终止
pd = ctx.Process(target=heartbeat, daemon=True, name="心跳进程")
pd.start()                        # 启动守护进程
print(f"  [主] 守护进程已启动 (PID={pd.pid})")
time.sleep(1)                     # 主进程运行 1 秒，期间守护进程持续发心跳
print("  [主] 主进程代码结束，守护进程会被自动终止")
print()

# ============================================================
# 实验4：守护进程不能创建子进程
# ============================================================
print("=" * 55)
print("实验4：守护进程不能有子进程（会报错）")
print("=" * 55)

def daemon_try_spawn():
    """守护进程里尝试创建子进程：multiprocessing 会禁止并抛 AssertionError"""
    try:
        child = ctx.Process(target=lambda: None)  # 尝试在守护进程中创建子进程
        child.start()               # 这里会抛 AssertionError: daemonic processes are not allowed to create children
        child.join()
    except Exception as e:          # 捕获异常，打印错误信息
        print(f"  [守护进程] 报错: {type(e).__name__}: {e}")

pd2 = ctx.Process(target=daemon_try_spawn, daemon=True)  # 创建一个守护进程
pd2.start()                        # 启动守护进程
pd2.join()                         # 等待守护进程结束
print()

print("要点：")
print("• join(timeout) 等待进程结束，超时可不等")
print("• terminate() 强制终止进程（粗暴，无清理机会）")
print("• daemon=True 守护进程，父进程结束就被杀")
print("• 守护进程【不能】创建子进程（限制）")
print("• 非守护进程，父进程会等它结束才真正退出")`,
  },

  // -----------------------------------------------------------
  // 第 22 章：进程间通信 Queue
  // -----------------------------------------------------------
  {
    id: "pythread-22",
    group: "multiprocessing 多进程",
    icon: "📬",
    title: "进程间通信——Queue 队列",
    content: `## 为什么进程通信比线程麻烦？

线程共享内存，直接读写全局变量就能通信。但进程**内存独立**，A 进程的变量 B 进程看不到，必须用专门的**进程间通信（IPC）**机制。

\`multiprocessing\` 提供两种主要 IPC 工具：
- **Queue**：多生产者多消费者队列（本章）
- **Pipe**：一对一管道（下一章）

## multiprocessing.Queue vs queue.Queue

| 特性 | \`queue.Queue\` | \`multiprocessing.Queue\` |
|------|----------------|--------------------------|
| 适用 | 线程间 | 进程间 |
| 原理 | 内存 + 锁 | 内存 + 管道 + 锁 |
| API | 基本相同 | 基本相同 |
| pickle | 不需要 | 需要（数据要序列化传输） |

API 几乎一样：\`put/get/put_nowait/get_nowait/qsize/empty/full/task_done/join\`。

## 基本用法

\`\`\`python
import multiprocessing as mp

q = mp.Queue(maxsize=10)
q.put("hello")           # 入队（数据会被 pickle 传输）
msg = q.get()            # 出队
\`\`\`

## 生产者-消费者：多进程版

\`\`\`python
def producer(q):
    for i in range(5):
        q.put(f"产品{i}")
    q.put(None)           # 结束信号

def consumer(q):
    while True:
        item = q.get()
        if item is None:
            break
        print(f"消费 {item}")

q = mp.Queue()
p1 = mp.Process(target=producer, args=(q,))
p2 = mp.Process(target=consumer, args=(q,))
p1.start(); p2.start()
p1.join(); p2.join()
\`\`\`

## 注意事项

1. **数据必须可 pickle**：函数、lambda、文件对象不能放 Queue
2. **Queue 要传给子进程**：通过 \`args=(q,)\` 传递，Queue 对象本身是可 pickle 的代理
3. **进程池里用 Queue**：要用 \`Manager().Queue()\` 或 \`pool.map\`，直接用 \`mp.Queue\` 在 Pool 里可能出问题（第25、27章）

## demo：多进程生产者消费者

下面 demo 用 multiprocessing.Queue 实现多进程的生产者-消费者。`,
    code: `# 第二十二章 demo：multiprocessing.Queue 进程间通信
import multiprocessing as mp   # 导入多进程模块
import time                     # 用于 sleep 模拟耗时
import os                       # 用于获取进程 PID
import queue as queue_mod       # 导入 queue 模块用于捕获 Full/Empty 异常

ctx = mp.get_context("fork")   # 获取 fork 启动方式上下文

# ============================================================
# 实验1：双向通信（用两个 Queue 避免竞态）
# ----------------------------------------------------------
# 为什么用两个队列？
#   单队列时，主进程 put 后再 get，可能把自己刚放进去的数据读回来
#   （子进程还没来得及 get），导致死锁。
#   解决：req_q（主→子）和 resp_q（子→主）分开，各读各的，不会抢。
# ============================================================
print("=" * 55)
print("实验1：主进程与子进程通过 Queue 双向通信")
print("=" * 55)

def worker(req_q, resp_q, name):
    """子进程：从 req_q 接收，处理后放回 resp_q"""
    msg = req_q.get()                   # 阻塞接收任务（队列空时等待）
    print(f"  [{name} PID={os.getpid()}] 收到: {msg}", flush=True)
    resp_q.put(f"{name} 处理完毕: {msg.upper()}")  # 结果放到响应队列（upper() 转大写）
    resp_q.put(None)                    # 结束信号：通知主进程没有更多数据了

# multiprocessing.Queue 底层用管道(pipe)+锁实现进程间通信(IPC)：
# put 时数据被 pickle 序列化写入管道，get 时反序列化读出，故数据必须可 pickle。
req_q = ctx.Queue()                     # 主→子：任务队列
resp_q = ctx.Queue()                    # 子→主：结果队列
p = ctx.Process(target=worker, args=(req_q, resp_q, "子进程A"))
p.start()                               # 启动子进程

req_q.put("hello multiprocessing")      # 主进程发任务（放入请求队列）
while True:
    result = resp_q.get()               # 主进程只从响应队列读，不会读到自己的任务
    if result is None:                  # 收到结束信号，退出循环
        break
    print(f"  [主进程] 收到结果: {result}", flush=True)
p.join()                                # 等待子进程结束
print()

# ============================================================
# 实验2：多生产者多消费者（每个消费者各发一个 STOP）
# ----------------------------------------------------------
# 注意：N 个消费者不能用"传递式 STOP"（一个 STOP 在队列里传），
#   因为 feeder 线程刷新时机不确定，可能丢信号导致死锁。
#   正确做法：生产者结束后，主进程向队列放 N 个 STOP（每消费者一个）。
# ============================================================
print("=" * 55)
print("实验2：2生产者 + 2消费者（多进程版）")
print("=" * 55)

def producer(q, tag, n):
    """生产者：生产 n 个产品"""
    for i in range(n):               # 循环生产 n 个产品
        item = f"{tag}-产品{i}"      # 生成产品名称
        time.sleep(0.1)              # 模拟生产耗时
        q.put(item)                  # 产品放入队列
        print(f"  📤 [{tag}] 生产 {item}", flush=True)

def consumer(q, tag):
    """消费者：不断消费，收到 STOP 退出"""
    while True:                      # 持续消费循环
        item = q.get()               # 从队列取产品（阻塞直到有数据）
        if item == "STOP":           # 收到停止信号
            print(f"  📥 [{tag}] 收到 STOP，退出", flush=True)
            return                       # 直接退出，不传递
        time.sleep(0.15)             # 模拟消费耗时
        print(f"  📥 [{tag}] 消费 {item}", flush=True)

q = ctx.Queue()                      # 共享队列：生产者放，消费者取
NUM_CONSUMERS = 2
consumers = [ctx.Process(target=consumer, args=(q, f"C{i}")) for i in range(NUM_CONSUMERS)]  # 创建 2 个消费者
for c in consumers: c.start()        # 启动所有消费者

producers = [ctx.Process(target=producer, args=(q, f"P{i}", 3)) for i in range(2)]  # 创建 2 个生产者，各产 3 个
for p in producers: p.start()        # 启动所有生产者
for p in producers: p.join()         # 等待所有生产者完成

print("  >>> 生产者都完成了，给每个消费者发一个 STOP", flush=True)
time.sleep(0.8)                          # 等消费者把已入队的产品消费完
for _ in range(NUM_CONSUMERS):           # 每个消费者一个 STOP
    q.put("STOP")

for c in consumers: c.join()         # 等待所有消费者退出
print()

# ============================================================
# 实验3：put_nowait / get_nowait 非阻塞
# ----------------------------------------------------------
# 注意：multiprocessing.Queue 内部有 feeder 线程，put 后数据不会
#   立刻出现在管道里，get_nowait 可能误报 Empty。所以演示 Empty
#   时用"全新的空队列"，演示 Full 时用"已满的队列"，避免时序问题。
# ============================================================
print("=" * 55)
print("实验3：put_nowait / get_nowait 非阻塞操作")
print("=" * 55)

# Full：往已满的队列 put_nowait
q_full = ctx.Queue(maxsize=2)         # 创建容量为 2 的队列
q_full.put_nowait("a")                  # 占第1个位置
q_full.put_nowait("b")                  # 占第2个位置，队列满
try:
    q_full.put_nowait("c")              # 满了再放 → 抛 Full
except queue_mod.Full:                  # 捕获 queue.Full 异常
    print("  put_nowait 满了: 抛 Full 异常")

# Empty：从全新的空队列 get_nowait
q_empty = ctx.Queue()                  # 创建空队列
try:
    q_empty.get_nowait()                # 空队列直接取 → 抛 Empty
except queue_mod.Empty:                 # 捕获 queue.Empty 异常
    print("  get_nowait 空了: 抛 Empty 异常")

print("\\n要点：")
print("• multiprocessing.Queue 用于进程间通信，API 和 queue.Queue 类似")
print("• 数据必须可 pickle，通过 args 传给子进程")
print("• put_nowait/get_nowait 非阻塞，满/空抛 Full/Empty")
print("• 多消费者结束信号：每个消费者各发一个 STOP，不要用传递式")
print("• 注意：mp.Queue 的 qsize/empty/full 在 macOS 上不完全可靠")`,
  },

  // -----------------------------------------------------------
  // 第 23 章：Pipe 管道
  // -----------------------------------------------------------
  {
    id: "pythread-23",
    group: "multiprocessing 多进程",
    icon: "🚇",
    title: "进程间通信——Pipe 管道",
    content: `## Pipe 是什么？

\`Pipe\` 是一对"连接"，数据从一端写入，从另一端读出。适合**一对一**的进程通信。底层基于操作系统的匿名管道（anonymous pipe）实现，数据在内核缓冲区中流转，不经过磁盘。

\`\`\`python
parent_conn, child_conn = mp.Pipe()
# parent_conn 和 child_conn 是管道的两端
\`\`\`

## Pipe vs Queue

| 特性 | Pipe | Queue |
|------|------|-------|
| 通信模式 | 一对一（两端） | 多对多 |
| 性能 | 更快（少一层封装） | 略慢 |
| 双向 | 默认双向 | 单向（put 一端，get 另一端） |
| 适用 | 2个进程间 | 多进程生产消费 |

## Pipe 的两种模式

### 双向管道（默认）
\`\`\`python
conn1, conn2 = mp.Pipe()       # 双向，两端都能 send/recv
\`\`\`
两端都可以 \`send\` 和 \`recv\`。但要注意避免两端同时 recv 死锁。

### 单向管道
\`\`\`python
conn1, conn2 = mp.Pipe(duplex=False)
# conn1 只能 recv，conn2 只能 send
\`\`\`

## 核心 API

\`\`\`python
conn.send(obj)        # 发送对象（可 pickle 的任意对象）
obj = conn.recv()     # 接收（无数据时阻塞）
conn.poll(timeout)    # 是否有数据可读
conn.close()          # 关闭连接
\`\`\`

## 使用模式

\`\`\`python
def child(conn):
    msg = conn.recv()         # 接收父进程消息
    conn.send("收到：" + msg)  # 回复
    conn.close()

parent_conn, child_conn = mp.Pipe()
p = mp.Process(target=child, args=(child_conn,))
p.start()

parent_conn.send("hello")     # 父发
print(parent_conn.recv())     # 父收回复
parent_conn.close()
p.join()
\`\`\`

## 注意事项

1. **关闭不用的端**：父进程拿到 child_conn 后如果不用，应该 \`child_conn.close()\`，否则对端 \`recv\` 不会收到 EOF
2. **避免两端同时 recv**：会死锁（都在等对方发）
3. **数据可 pickle**：和 Queue 一样
4. **poll 检查**：\`conn.poll()\` 返回是否有数据，避免阻塞 recv

## demo：Pipe 的一对一通信

下面 demo 演示 Pipe 的双向通信、poll 检查、关闭端口的影响。`,
    code: `# 第二十三章 demo：Pipe 管道通信
import multiprocessing as mp   # 导入多进程模块
import time                     # 用于 sleep 模拟耗时
import os                       # 用于获取进程 PID

ctx = mp.get_context("fork")   # 获取 fork 启动方式上下文

# ============================================================
# 实验1：双向 Pipe，父子进程互发消息
# ============================================================
print("=" * 55)
print("实验1：双向 Pipe，父子进程对话")
print("=" * 55)

def chat(conn, name):
    """子进程：接收消息并回复"""
    msg = conn.recv()                   # 阻塞接收父进程发来的消息
    print(f"  [{name}] 收到: {msg}")
    conn.send(f"你好父进程，我是 {name} (PID={os.getpid()})")  # 回复父进程
    msg = conn.recv()                   # 再次接收
    print(f"  [{name}] 又收到: {msg}")
    conn.send(f"{name} 收到，再见！")    # 最后的回复
    conn.close()                        # 关闭连接，释放资源

# Pipe 底层是 OS 匿名管道：数据在内核缓冲区流转，一端 send 写入，另一端 recv 读出
parent_conn, child_conn = ctx.Pipe()    # 创建双向管道，返回两个连接端
p = ctx.Process(target=chat, args=(child_conn, "子进程"))  # 把 child_conn 传给子进程
p.start()
# 重要：父进程不用 child_conn，应该关闭它
# 否则子进程关闭 child_conn 后，parent_conn.recv 不会收到 EOF
child_conn.close()

parent_conn.send("你好子进程，我是父进程")  # 父进程发送
print(f"  [父进程] 收到: {parent_conn.recv()}")  # 父进程接收回复
parent_conn.send("你还好吗？")
print(f"  [父进程] 收到: {parent_conn.recv()}")
parent_conn.close()                    # 关闭父端连接
p.join()                               # 等待子进程结束
print()

# ============================================================
# 实验2：单向 Pipe（duplex=False）
# ============================================================
print("=" * 55)
print("实验2：单向 Pipe（duplex=False）")
print("=" * 55)

def sender(conn, name):
    """只发送"""
    for i in range(3):               # 发送 3 条消息
        conn.send(f"{name} 消息{i}")  # 发送消息
        time.sleep(0.1)              # 间隔 0.1 秒
    conn.close()                     # 发送完毕关闭连接

# duplex=False 创建单向管道：recv_conn 只能接收，send_conn 只能发送
recv_conn, send_conn = ctx.Pipe(duplex=False)
p = ctx.Process(target=sender, args=(send_conn, "发送方"))  # send_conn 传给子进程
p.start()
send_conn.close()                       # 父进程不用发送端，关闭

# 注意：发送端 close() 后，接收端 poll() 仍会返回 True（表示有"EOF"可读），
# 此时 recv() 会抛 EOFError。所以要用 try/except EOFError 来判断结束。
while True:
    if recv_conn.poll(0.1):             # poll(0.1) 等 0.1 秒检查有无数据
        try:
            msg = recv_conn.recv()       # 有数据则接收
            print(f"  [父进程] 收到: {msg}")
        except EOFError:                # 发送端已关闭 → 结束
            break
    elif not p.is_alive():              # 子进程已退出且无数据
        break
recv_conn.close()                       # 关闭接收端
p.join()                                # 等待子进程结束
print()

# ============================================================
# 实验3：每个子进程一个 Pipe，主进程收集结果
# ============================================================
print("=" * 55)
print("实验3：每个子进程一个 Pipe，主进程收集结果")
print("=" * 55)

def worker(conn, x):
    """计算 x*x，结果通过自己的 pipe 返回"""
    time.sleep(0.2)              # 模拟计算耗时
    conn.send(x * x)             # 计算平方后通过管道发送结果
    conn.close()                 # 关闭连接

pipes = []
processes = []
for x in [3, 5, 7]:              # 为每个输入值创建独立的管道和进程
    parent_conn, child_conn = ctx.Pipe()  # 每个子进程一个独立管道
    p = ctx.Process(target=worker, args=(child_conn, x))
    p.start()                    # 启动子进程
    child_conn.close()           # 父进程不用 child 端，关闭
    pipes.append((x, parent_conn, p))  # 保存输入值、父端连接、进程对象

for x, conn, p in pipes:         # 遍历所有管道收集结果
    result = conn.recv()         # 阻塞等待该子进程的结果
    print(f"  输入 {x} → 结果 {result}")
    conn.close()                 # 关闭连接
    p.join()                     # 等待该子进程结束
print()

# ============================================================
# 实验4：recv 阻塞 vs poll(timeout)
# ============================================================
print("=" * 55)
print("实验4：recv 阻塞 vs poll(timeout)")
print("=" * 55)

def slow_sender(conn):
    """延迟 0.4 秒后发送一条消息，演示 poll(timeout) 的等待行为"""
    time.sleep(0.4)              # 故意延迟 0.4 秒
    conn.send("迟到的消息")      # 延迟后发送
    conn.close()                 # 关闭连接

parent_conn, child_conn = ctx.Pipe()
p = ctx.Process(target=slow_sender, args=(child_conn,))
p.start()
child_conn.close()               # 父进程不用 child 端，关闭

# poll(timeout) 在 timeout 时间内有数据就返回 True，否则返回 False
print(f"  poll(0.1) 立刻检查: {parent_conn.poll(0.1)} (还没到)")  # 0.1秒内无数据
print(f"  poll(0.5) 再等0.5秒: {parent_conn.poll(0.5)} (到了!)")  # 0.5秒内有数据
if parent_conn.poll():           # 无参数 poll 立刻检查
    print(f"  recv: {parent_conn.recv()}")  # 接收数据
parent_conn.close()              # 关闭连接
p.join()                         # 等待子进程结束

print("\\n要点：")
print("• Pipe 适合一对一进程通信，默认双向，duplex=False 单向")
print("• 不用的端口要 close()，否则对端 recv 收不到 EOF")
print("• recv 阻塞，poll(timeout) 非阻塞检查有无数据")
print("• 多对多通信用 Queue，一对一通信用 Pipe 更快")`,
  },

  // -----------------------------------------------------------
  // 第 24 章：共享内存 Value / Array
  // -----------------------------------------------------------
  {
    id: "pythread-24",
    group: "multiprocessing 多进程",
    icon: "💾",
    title: "共享内存 Value 与 Array",
    content: `## 为什么需要共享内存？

Pipe/Queue 通信是通过**序列化（pickle）传输**的——数据被复制一份传给对方。对于小数据没问题，但：
- 大数据频繁传输开销大
- 想让多个进程"看到并修改同一个变量"，Queue 做不到

\`Value\` 和 \`Array\` 提供**真正的共享内存**：多个进程访问的是**同一块物理内存**，无需复制。

## Value：共享单个值

\`\`\`python
# 'i' 表示整数（C 类型 int），初始值 0
v = mp.Value('i', 0)

# 在子进程里
v.value = 42          # 写
print(v.value)        # 读
\`\`\`

\`Value\` 内部带一把锁，\`v.value = x\` 是原子操作。

## Array：共享数组

\`\`\`python
# 'd' 表示双精度浮点，5个元素
arr = mp.Array('d', [1.0, 2.0, 3.0, 4.0, 5.0])

arr[0] = 9.9          # 写
print(arr[:])         # 读（切片返回 list）
\`\`\`

## 类型代码

| 代码 | C 类型 | Python 类型 |
|------|--------|------------|
| \`'i'\` | int | int |
| \`'l'\` | long | int |
| \`'f'\` | float | float |
| \`'d'\` | double | float |
| \`'b'\` | signed char | int |
| \`'c'\` | char | bytes(1) |

## Value 的锁

\`Value\` 默认 \`lock=True\`，自带锁。但**复合操作不是原子的**：

\`\`\`python
v = mp.Value('i', 0)
# v.value += 1 不是原子的！它是 "读 v.value → +1 → 写 v.value"
# 多进程并发执行会丢更新，要加锁
\`\`\`

用 \`with v.get_lock():\` 保护复合操作：

\`\`\`python
v = mp.Value('i', 0)
with v.get_lock():
    v.value += 1       # 现在是原子的
\`\`\`

## 共享内存 vs Queue/Pipe

| 方式 | 数据复制 | 适用 |
|------|---------|------|
| Queue/Pipe | 复制传输 | 消息传递、生产消费 |
| Value/Array | 不复制（共享内存） | 多进程共享状态、计数器 |
| Manager | 复制 + 代理 | 复杂对象（dict/list）共享 |

## demo：共享计数器

下面 demo 用 Value 实现多进程共享计数器，对比"不加锁丢更新"和"加锁正确"。`,
    code: `# 第二十四章 demo：Value 和 Array 共享内存
import multiprocessing as mp   # 导入多进程模块
import time                     # 用于 sleep（本 demo 未直接使用但保留）

ctx = mp.get_context("fork")   # 获取 fork 启动方式上下文

# ============================================================
# 实验1：Value 共享单个值（不加锁 → 丢更新）
# ============================================================
print("=" * 55)
print("实验1：Value 共享计数器（不加锁 → 丢更新）")
print("=" * 55)

def increment_no_lock(v, n):
    """每个进程对 v 加 n 次（不加锁）"""
    for _ in range(n):               # 循环 n 次
        v.value += 1                    # v.value += 1 是"读→加1→写"三步，非原子，并发会丢更新

# Value/Array 通过共享内存(mmap)实现：多个进程映射同一块物理内存，
# 与 Queue/Pipe 不同，数据不需要 pickle 复制，读写直接操作共享内存。
v = ctx.Value('i', 0)                   # 创建共享整数，'i' 表示 C 语言 int 类型，初值 0
NUM_PROCS = 4                            # 4 个进程并发
N = 2000                                 # 每个进程加 2000 次

procs = [ctx.Process(target=increment_no_lock, args=(v, N))  # 创建 4 个进程
         for _ in range(NUM_PROCS)]
for p in procs: p.start()               # 全部启动
for p in procs: p.join()                # 全部等待结束
print(f"  期望: {NUM_PROCS * N} = {NUM_PROCS*N}")   # 期望 8000
print(f"  实际: {v.value}（丢更新，小于期望）\\n")    # 实际会小于 8000

# ============================================================
# 实验2：Value 加锁，结果正确
# ============================================================
print("=" * 55)
print("实验2：Value 加锁 → 结果正确")
print("=" * 55)

def increment_with_lock(v, n):
    """加锁版：用 v.get_lock() 保护复合操作"""
    for _ in range(n):               # 循环 n 次
        with v.get_lock():              # 获取 Value 内置的锁，保证以下代码块原子执行
            v.value += 1                # 现在是原子的，不会丢更新

v2 = ctx.Value('i', 0)                   # 创建新的共享整数
procs = [ctx.Process(target=increment_with_lock, args=(v2, N))  # 创建 4 个进程
         for _ in range(NUM_PROCS)]
for p in procs: p.start()               # 全部启动
for p in procs: p.join()                # 全部等待结束
print(f"  期望: {NUM_PROCS * N}")       # 期望 8000
print(f"  实际: {v2.value} ✓\\n")       # 加锁后结果正确

# ============================================================
# 实验3：Array 共享数组
# ============================================================
print("=" * 55)
print("实验3：Array 共享数组（多进程各算一段）")
print("=" * 55)

def fill_section(arr, start, end, val):
    """每个进程填充 arr 的 [start:end) 段"""
    for i in range(start, end):       # 遍历 [start, end) 范围
        arr[i] = val * i              # arr[i] = val * i，直接写入共享内存

arr = ctx.Array('i', 10)                # 创建 10 个整数的共享数组（'i' = int）
procs = [
    ctx.Process(target=fill_section, args=(arr, 0, 5, 10)),     # 进程1填充前5个：arr[i]=10*i
    ctx.Process(target=fill_section, args=(arr, 5, 10, 100)),   # 进程2填充后5个：arr[i]=100*i
]
for p in procs: p.start()               # 启动两个进程（各写不同区间，无需加锁）
for p in procs: p.join()                # 等待结束
print(f"  共享数组结果: {list(arr)}")    # list(arr) 把共享数组转为普通列表打印
print(f"  前5个=10*i，后5个=100*i\\n")

# ============================================================
# 实验4：Array 存浮点，多进程并行求平方
# ============================================================
print("=" * 55)
print("实验4：Array 存浮点，多进程并行求平方")
print("=" * 55)

def square_range(arr, start, end):
    """把 arr[start:end] 平方"""
    for i in range(start, end):       # 遍历指定区间
        arr[i] = arr[i] ** 2          # 原地平方：读 arr[i] → 求平方 → 写回 arr[i]

data = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0]  # 原始数据
arr2 = ctx.Array('d', data)             # 'd' = double 双精度浮点，用 data 初始化
mid = len(data) // 2                    # 中点：4
procs = [
    ctx.Process(target=square_range, args=(arr2, 0, mid)),        # 进程1平方前半段 [0:4)
    ctx.Process(target=square_range, args=(arr2, mid, len(data))),# 进程2平方后半段 [4:8)
]
for p in procs: p.start()               # 启动两个进程并行计算
for p in procs: p.join()                # 等待结束
print(f"  原数据: {data}")
print(f"  平方后: {list(arr2)}")        # 验证平方结果

print("\\n要点：")
print("• Value/Array 是真正的共享内存，多进程访问同一块内存")
print("• Value('i', 0) 共享整数，Array('d', [...]) 共享数组")
print("• v.value += 1 不是原子操作，要用 with v.get_lock() 保护")
print("• 适合共享计数器、共享数组，不适合复杂对象（用 Manager）")`,
  },

  // -----------------------------------------------------------
  // 第 25 章：Manager
  // -----------------------------------------------------------
  {
    id: "pythread-25",
    group: "multiprocessing 多进程",
    icon: "👔",
    title: "Manager 管理共享对象",
    content: `## Manager 是什么？

\`Value\`/\`Array\` 只能共享简单类型（数字、数组）。要共享 dict、list 等复杂对象，用 \`multiprocessing.Manager\`。

Manager 启动一个**服务器进程**，管理一组"共享对象"。其他进程通过**代理（proxy）**访问这些对象——每次操作都是跨进程的远程调用。

\`\`\`python
with mp.Manager() as manager:
    shared_dict = manager.dict()       # 共享字典
    shared_list = manager.list()       # 共享列表
    shared_dict['x'] = 1
    shared_list.append('a')
\`\`\`

## Manager 支持的共享类型

| 方法 | 创建 |
|------|------|
| \`manager.dict()\` | 共享字典 |
| \`manager.list()\` | 共享列表 |
| \`manager.Value('i', 0)\` | 共享值（带锁） |
| \`manager.Array('i', [...])\` | 共享数组 |
| \`manager.Namespace()\` | 共享命名空间 |
| \`manager.Queue()\` | 共享队列 |
| \`manager.Lock()\` | 共享锁 |

## Manager vs Value/Array

| 特性 | Value/Array | Manager |
|------|-------------|---------|
| 支持类型 | 数字、数组 | 任意（dict/list/...） |
| 性能 | 高（直接内存） | 低（每次远程调用） |
| 启动开销 | 无 | 要启动服务器进程 |
| 适用 | 简单共享 | 复杂对象共享 |

## ⚠️ Manager 的坑：嵌套修改不触发同步

\`\`\`python
d = manager.dict()
d['list'] = []            # OK，整个赋值会同步
d['list'].append(1)       # 坑！不会同步！
\`\`\`

原因：\`d['list']\` 返回的是普通 list 的副本，修改它 Manager 不知道。要修改嵌套对象，**整体重新赋值**：

\`\`\`python
tmp = d['list']
tmp.append(1)
d['list'] = tmp           # 整体赋值，触发同步
\`\`\`

## 进程池中的共享对象

在 \`Pool\` 里跨进程共享状态，**必须用 Manager**（直接 \`mp.Queue\` 在 Pool 里有问题）：

\`\`\`python
with mp.Manager() as manager:
    shared = manager.list()
    with ctx.Pool(4) as pool:
        pool.map(worker, args)        # worker 能访问 shared
\`\`\`

## demo：Manager 共享 dict 和 list

下面 demo 用 Manager 让多个进程共同维护一个共享的 dict（统计）和 list（结果收集）。`,
    code: `# 第二十五章 demo：Manager 共享复杂对象
import multiprocessing as mp   # 导入多进程模块
import time                     # 用于 sleep 模拟耗时

ctx = mp.get_context("fork")   # 获取 fork 启动方式上下文

# ============================================================
# 实验1：Manager 共享 list（多进程收集结果）
# ============================================================
print("=" * 55)
print("实验1：Manager 共享 list（多进程收集结果）")
print("=" * 55)

def collect_results(shared_list, tag, n):
    """每个进程往共享 list 添加 n 个结果"""
    for i in range(n):               # 循环 n 次
        shared_list.append(f"{tag}-{i}")  # 往共享 list 添加元素（每次都是远程调用）
        time.sleep(0.05)             # 模拟工作耗时

# Manager 启动一个服务器进程管理共享对象，其他进程通过代理访问
with ctx.Manager() as manager:       # with 块结束时自动关闭 manager 和服务器进程
    shared_list = manager.list()     # 创建共享 list（代理对象，非普通 list）
    procs = [ctx.Process(target=collect_results,   # 创建 3 个进程
                         args=(shared_list, f"P{i}", 3))
             for i in range(3)]
    for p in procs: p.start()        # 全部启动
    for p in procs: p.join()         # 全部等待结束
    print(f"  共收集 {len(shared_list)} 个结果:")  # 应为 9 个（3进程×3结果）
    print(f"  {list(shared_list)}")  # list() 把代理对象转为普通列表打印
print()

# ============================================================
# 实验2：Manager 共享 dict（统计各进程处理数）
# ============================================================
print("=" * 55)
print("实验2：Manager 共享 dict（统计计数）")
print("=" * 55)

def worker_with_stats(shared_dict, tag, n):
    """每个进程处理 n 个任务，把计数写入共享 dict"""
    count = 0                        # 本地计数器
    for i in range(n):               # 循环 n 次
        time.sleep(0.03)             # 模拟处理耗时
        count += 1                   # 本部计数
    shared_dict[tag] = count            # 整体赋值：把结果写入共享 dict（触发同步）

with ctx.Manager() as manager:
    shared_dict = manager.dict()     # 创建共享 dict
    procs = [ctx.Process(target=worker_with_stats,   # 创建 4 个进程，处理数递增
                         args=(shared_dict, f"进程{i}", i+2))
             for i in range(4)]
    for p in procs: p.start()        # 全部启动
    for p in procs: p.join()         # 全部等待结束
    print(f"  各进程处理数: {dict(shared_dict)}")  # dict() 转为普通字典打印
    print(f"  总计: {sum(shared_dict.values())}")  # sum 求所有值的总和
print()

# ============================================================
# 实验3：嵌套修改的坑（演示 + 正确写法）
# ============================================================
print("=" * 55)
print("实验3：嵌套修改的坑（演示 + 正确写法）")
print("=" * 55)

def bad_nested(d):
    """错误：直接改嵌套 list，不同步"""
    d['items'].append('x')             # 坑：d['items'] 返回普通 list 副本，修改它 Manager 不知道！

def good_nested(d):
    """正确：整体重新赋值"""
    tmp = d['items']                   # 取出副本
    tmp.append('y')                    # 在副本上修改
    d['items'] = tmp                   # 整体赋值，触发同步（Manager 才知道变了）

with ctx.Manager() as manager:
    d = manager.dict()                 # 创建共享 dict
    d['items'] = []                    # 初始化嵌套 list
    p1 = ctx.Process(target=bad_nested, args=(d,))   # 错误写法进程
    p2 = ctx.Process(target=good_nested, args=(d,))  # 正确写法进程
    p1.start(); p2.start()             # 同时启动
    p1.join(); p2.join()               # 同时等待
    print(f"  结果: {d['items']}")
    print("  （'x' 可能丢失，'y' 一定在 —— 嵌套修改的坑）")
print()

# ============================================================
# 实验4：Manager.Namespace 共享命名空间
# ============================================================
print("=" * 55)
print("实验4：Manager.Namespace 共享多个属性")
print("=" * 55)

def modify_ns(ns, tag):
    """修改命名空间的属性（注意：ns.count += 1 是"读-改-写"，跨进程非原子）"""
    ns.count += 1                       # 可能丢更新：读 ns.count → +1 → 写回，中间可被打断
    ns.last_tag = tag                   # 单次赋值是原子的，但最后值取决于谁最后写

with ctx.Manager() as manager:
    ns = manager.Namespace()            # 创建共享命名空间（可以存任意属性）
    ns.count = 0                        # 初始化 count 属性
    ns.last_tag = "无"                  # 初始化 last_tag 属性
    procs = [ctx.Process(target=modify_ns, args=(ns, f"T{i}"))  # 创建 3 个进程
             for i in range(3)]
    for p in procs: p.start()           # 全部启动
    for p in procs: p.join()            # 全部等待结束
    # count 不一定等于 3：ns.count += 1 跨进程非原子，可能丢更新
    print(f"  count = {ns.count}（因非原子更新，可能小于 3）")
    print(f"  last_tag = {ns.last_tag}")  # 最后一个写入的 tag

print("\\n要点：")
print("• Manager 启动服务器进程，通过代理共享 dict/list 等复杂对象")
print("• 嵌套修改不触发同步，要整体重新赋值")
print("• 性能比 Value/Array 低（每次远程调用），适合复杂对象")
print("• Pool 里跨进程共享状态推荐用 Manager")`,
  },

  // -----------------------------------------------------------
  // 第 26 章：进程同步
  // -----------------------------------------------------------
  {
    id: "pythread-26",
    group: "multiprocessing 多进程",
    icon: "🚦",
    title: "进程同步——Lock / Event / Semaphore",
    content: `## 进程也需要同步

虽然进程内存独立，但仍有共享场景：共享内存（Value/Array）、共享文件、共享外设。这些场景下同样需要锁来防止并发冲突。

\`multiprocessing\` 提供和 \`threading\` 几乎一样的同步原语：

| 工具 | 作用 |
|------|------|
| \`Lock\` / \`RLock\` | 互斥锁 |
| \`Event\` | 事件通知 |
| \`Condition\` | 条件变量 |
| \`Semaphore\` | 信号量 |
| \`Barrier\` | 栅栏 |

API 和 threading 版完全一致，区别只是它们能跨进程使用（内部用信号量实现）。

## 创建方式

进程同步对象可以：
1. 直接 \`ctx.Lock()\` 创建，传给子进程
2. 通过 \`Manager\` 创建（\`manager.Lock()\`），适合 Pool

\`\`\`python
# 方式1：直接创建（传给 Process）
lock = ctx.Lock()
p = ctx.Process(target=worker, args=(lock,))

# 方式2：Manager 创建（适合 Pool）
with ctx.Manager() as m:
    lock = m.Lock()
\`\`\`

## 用 Lock 保护共享文件

经典场景：多个进程写同一个文件，不加锁会乱序：

\`\`\`python
def write_file(lock, fname, content):
    with lock:                    # 同一时刻一个进程写
        with open(fname, 'a') as f:
            f.write(content)
\`\`\`

## demo：进程同步三件套

下面 demo 演示 Lock 保护共享内存、Event 控制启停、Semaphore 限制并发。`,
    code: `# 第二十六章 demo：进程同步 Lock / Event / Semaphore
import multiprocessing as mp   # 导入多进程模块
import time                     # 用于 sleep 模拟耗时

ctx = mp.get_context("fork")   # 获取 fork 启动方式上下文

# ============================================================
# 实验1：Lock 保护共享内存（Value）
# ============================================================
print("=" * 55)
print("实验1：Lock 保护共享计数器")
print("=" * 55)

def increment(v, lock, n):
    """加锁版自增"""
    for _ in range(n):               # 循环 n 次
        with lock:                   # 获取锁，保证以下代码块原子执行
            v.value += 1             # 在锁保护下自增，不会丢更新

v = ctx.Value('i', 0)                # 共享整数，初值 0
lock = ctx.Lock()                    # 创建进程间互斥锁
NUM_PROCS = 4                        # 4 个进程
N = 3000                             # 每个进程加 3000 次

procs = [ctx.Process(target=increment, args=(v, lock, N))  # 创建 4 个进程
         for _ in range(NUM_PROCS)]
for p in procs: p.start()            # 全部启动
for p in procs: p.join()             # 全部等待结束
print(f"  期望: {NUM_PROCS*N}, 实际: {v.value} ✓")  # 加锁后结果正确
print()

# ============================================================
# 实验2：Event 控制进程启停
# ============================================================
print("=" * 55)
print("实验2：Event 控制子进程开始/停止")
print("=" * 55)

def controlled_worker(stop_event, tag):
    """受 Event 控制的工作进程"""
    print(f"  [{tag}] 开始工作")
    i = 0
    while not stop_event.is_set():    # is_set() 检查事件是否被设置（停止信号）
        i += 1                        # 工作计数
        print(f"  [{tag}] 工作 {i}")
        if stop_event.wait(timeout=0.3):  # wait(0.3) 等0.3秒，事件被set则返回True
            break                     # 收到停止信号，退出循环
    print(f"  [{tag}] 收到停止信号，退出（共 {i} 次）")

stop_event = ctx.Event()              # 创建事件对象（初始未设置）
procs = [ctx.Process(target=controlled_worker, args=(stop_event, f"P{i}"))  # 创建 2 个进程
         for i in range(2)]
for p in procs: p.start()             # 全部启动

time.sleep(1)                         # 主进程等 1 秒，让子进程工作一会
print("  >>> 主进程：发送停止信号")
stop_event.set()                      # set() 设置事件，通知所有等待的子进程停止
for p in procs: p.join()              # 等待所有子进程退出
print()

# ============================================================
# 实验3：Semaphore 限制进程并发数
# ============================================================
print("=" * 55)
print("实验3：Semaphore 限制同时运行的进程数（模拟连接池）")
print("=" * 55)

def db_query(sem, tag, shared_counter, counter_lock):
    """模拟查数据库：必须先拿到'连接'（信号量）"""
    with sem:                           # 获取信号量（最多2个进程能同时进入）
        with counter_lock:              # 加锁保护计数器
            shared_counter.value += 1   # 并发数 +1
            cur = shared_counter.value  # 记录当前并发数
        print(f"  [{tag}] 获得连接 (并发={cur})，查询中...")
        time.sleep(0.4)                 # 模拟查询耗时
        with counter_lock:              # 加锁保护计数器
            shared_counter.value -= 1   # 并发数 -1
        print(f"  [{tag}] 完成，归还连接")  # with sem 结束自动释放信号量

sem = ctx.Semaphore(2)                  # 信号量初始值2：最多2个进程同时进入
shared_counter = ctx.Value('i', 0)      # 共享计数器：记录当前并发数
counter_lock = ctx.Lock()               # 保护计数器的锁

procs = [ctx.Process(target=db_query,   # 创建 6 个查询进程
                     args=(sem, f"Q{i}", shared_counter, counter_lock))
         for i in range(6)]
for p in procs: p.start()               # 全部启动
for p in procs: p.join()                # 全部等待结束
print("  全部完成（并发始终 ≤ 2）")       # 信号量保证最多2个同时查询
print()

# ============================================================
# 实验4：Lock 保护共享输出（模拟写文件）
# ============================================================
print("=" * 55)
print("实验4：Lock 保护共享输出（模拟写文件）")
print("=" * 55)

with ctx.Manager() as manager:
    log_lines = manager.list()          # 用 Manager 创建共享 list（存日志）
    file_lock = manager.Lock()          # 用 Manager 创建共享锁

    def write_log(lock, lines, tag, n):
        """加锁写入 n 条日志，保证每行完整不被其他进程打断"""
        for i in range(n):              # 写 n 条日志
            with lock:                 # 加锁，整行 append 不被打断
                lines.append(f"[{tag}] 第 {i} 条日志")
            time.sleep(0.02)            # 模拟写文件间隔

    procs = [ctx.Process(target=write_log,   # 创建 3 个进程
                         args=(file_lock, log_lines, f"P{i}", 3))
             for i in range(3)]
    for p in procs: p.start()           # 全部启动
    for p in procs: p.join()            # 全部等待结束
    print(f"  共写入 {len(log_lines)} 条日志，内容有序:")
    for line in log_lines:              # 逐行打印日志
        print(f"    {line}")

print("\\n要点：")
print("• multiprocessing 的同步原语和 threading API 一致")
print("• Lock 保护共享内存/文件，Event 控制启停，Semaphore 限并发")
print("• 直接 ctx.Lock() 创建传给 Process，或用 Manager.Lock() 给 Pool")
print("• 即使进程内存独立，共享资源（Value/文件/外设）仍需同步")`,
  },

  // -----------------------------------------------------------
  // 第 27 章：进程池 Pool
  // -----------------------------------------------------------
  {
    id: "pythread-27",
    group: "multiprocessing 多进程",
    icon: "🏊",
    title: "进程池 Pool——map / apply / starmap",
    content: `## 为什么要用进程池？

手动 \`Process\` 的问题：
1. 进程创建开销大（比线程贵得多）
2. 难以管理大量任务
3. 拿返回值麻烦

\`Pool\` 进程池预先创建固定数量的 worker 进程，反复复用，任务来了分配给空闲 worker，还能**自动收集返回值**。

\`\`\`python
with mp.Pool(4) as pool:           # 4个worker进程
    results = pool.map(func, args) # 并行处理，自动收结果
\`\`\`

## Pool 的核心方法

| 方法 | 作用 | 是否阻塞 |
|------|------|---------|
| \`pool.map(func, iterable, chunksize)\` | 并行映射，按顺序返回 | 阻塞直到全部完成 |
| \`pool.map_async(...)\` | 异步版，返回 AsyncResult | 不阻塞 |
| \`pool.apply(func, args)\` | 执行单个任务 | 阻塞 |
| \`pool.apply_async(func, args)\` | 异步执行单个 | 不阻塞，返回 AsyncResult |
| \`pool.starmap(func, [(a1,b1), (a2,b2)])\` | 多参数映射 | 阻塞 |
| \`pool.imap(func, iterable)\` | 惰性 map（迭代器） | 按需 |
| \`pool.close()\` | 关闭池，不再接新任务 | - |
| \`pool.join()\` | 等 worker 结束 | 阻塞 |

## map vs apply vs starmap

### map：单参数，按顺序返回
\`\`\`python
def square(x):
    return x * x

with mp.Pool(4) as pool:
    print(pool.map(square, [1, 2, 3, 4]))   # [1, 4, 9, 16]
\`\`\`

### apply：单个任务
\`\`\`python
result = pool.apply(square, (5,))   # 25
\`\`\`

### starmap：多参数（每个元素是参数元组）
\`\`\`python
def add(a, b):
    return a + b

with mp.Pool(4) as pool:
    print(pool.starmap(add, [(1, 2), (3, 4), (5, 6)]))   # [3, 7, 11]
\`\`\`

## apply_async：异步 + 回调

\`\`\`python
def task(x):
    return x * 2

def callback(result):
    print(f"完成: {result}")

with mp.Pool(4) as pool:
    ar = pool.apply_async(task, (5,), callback=callback)
    result = ar.get(timeout=10)    # 也可阻塞取
\`\`\`

\`callback\` 在任务完成时被调用（在主进程），适合"完成通知"。

## chunksize 参数

\`map\` 默认把任务拆成单个分发。任务很多时，用 \`chunksize\` 批量分发减少通信开销：

\`\`\`python
pool.map(func, range(10000), chunksize=100)   # 每100个一批
\`\`\`

## demo：进程池各种用法

下面 demo 演示 map、starmap、apply_async、回调。`,
    code: `# 第二十七章 demo：进程池 Pool 的各种用法
import multiprocessing as mp   # 导入多进程模块
import time                     # 用于计时和 sleep

ctx = mp.get_context("fork")   # 获取 fork 启动方式上下文

def square(x):
    """平方（CPU 密集）"""
    return x * x                # 返回 x 的平方

def add(a, b):
    """加法（多参数）"""
    return a + b                # 返回 a + b

def slow_task(x):
    """耗时任务"""
    time.sleep(0.3)             # 模拟 0.3 秒耗时
    return x * 10               # 返回 x * 10

# ============================================================
# 实验1：map 并行映射
# ============================================================
print("=" * 55)
print("实验1：map 并行计算平方")
print("=" * 55)
data = list(range(1, 9))        # [1, 2, 3, 4, 5, 6, 7, 8]
with ctx.Pool(4) as pool:       # 创建 4 个 worker 的进程池
    results = pool.map(square, data)  # map 并行计算，按输入顺序返回结果
print(f"  输入: {data}")
print(f"  平方: {results}")      # [1, 4, 9, 16, 25, 36, 49, 64]
print()

# ============================================================
# 实验2：starmap 多参数
# ============================================================
print("=" * 55)
print("实验2：starmap 多参数")
print("=" * 55)
pairs = [(1, 2), (3, 4), (5, 6), (7, 8)]  # 每个元素是参数元组
with ctx.Pool(4) as pool:
    results = pool.starmap(add, pairs)  # starmap 把每个元组拆开作为参数传给 add
print(f"  输入: {pairs}")
print(f"  求和: {results}")      # [3, 7, 11, 15]
print()

# ============================================================
# 实验3：apply_async 异步 + 回调
# ============================================================
print("=" * 55)
print("实验3：apply_async 异步执行 + 回调")
print("=" * 55)

def callback(result):
    """任务完成时在主进程被调用"""
    print(f"  [回调] 任务完成，结果={result}")

with ctx.Pool(2) as pool:       # 创建 2 个 worker 的进程池
    # apply_async 立即返回 AsyncResult，不阻塞
    ar = pool.apply_async(slow_task, (5,), callback=callback)  # 提交任务，callback 完成时调用
    print("  [主] 已提交任务，主线程可以干别的")
    # 可以提交多个任务
    ar2 = pool.apply_async(slow_task, (8,), callback=callback)  # 再提交一个任务
    # 需要结果时用 get() 阻塞取
    print(f"  [主] 等结果1: {ar.get()}")    # get() 阻塞直到任务完成，返回结果
    print(f"  [主] 等结果2: {ar2.get()}")   # 第二个任务的结果
print()

# ============================================================
# 实验4：imap 惰性迭代（谁先完成先yield）
# ============================================================
print("=" * 55)
print("实验4：imap 惰性迭代")
print("=" * 55)
with ctx.Pool(4) as pool:
    # imap 返回迭代器，可以边算边取（谁先完成先 yield）
    for r in pool.imap(square, range(10)):  # 遍历迭代器，逐个获取结果
        print(f"  {r}", end=" ")            # 打印每个结果（不换行）
    print()                                 # 最后换行
print()

# ============================================================
# 实验5：对比串行 vs 并行（CPU 密集型）
# ============================================================
print("=" * 55)
print("实验5：串行 vs 4进程并行（CPU 密集）")
print("=" * 55)
data = [2_000_000] * 4          # 4 个相同的计算任务，每个累加 200 万次

# 串行
def cpu_heavy(n):
    """CPU 密集任务：累加 0..n-1，用来对比串行与多进程并行的耗时"""
    total = 0                    # 累加器
    for i in range(n):           # 循环 n 次
        total += i               # 累加
    return total                 # 返回结果

start = time.time()              # 记录开始时间
serial = [cpu_heavy(n) for n in data]  # 串行：列表推导逐个计算
print(f"  串行: {time.time()-start:.3f}s")  # 串行耗时（4 次顺序执行）

# 并行
start = time.time()              # 记录开始时间
with ctx.Pool(4) as pool:        # 创建 4 worker 进程池
    parallel = pool.map(cpu_heavy, data)  # 并行：4 个任务同时跑
print(f"  4进程并行: {time.time()-start:.3f}s")  # 并行耗时（接近单次时间）
print(f"  结果一致: {serial == parallel}")  # 验证结果相同

print("\\n要点：")
print("• Pool 复用进程，自动收集返回值，管理大量任务")
print("• map 单参数顺序返回，starmap 多参数，apply_async 异步+回调")
print("• chunksize 批量分发减少通信开销")
print("• CPU 密集型任务用进程池能真正多核加速")`,
  },

  // -----------------------------------------------------------
  // 第 28 章：ProcessPoolExecutor
  // -----------------------------------------------------------
  {
    id: "pythread-28",
    group: "multiprocessing 多进程",
    icon: "🏭",
    title: "ProcessPoolExecutor 进程池（统一接口）",
    content: `## ProcessPoolExecutor 是什么？

\`concurrent.futures.ProcessPoolExecutor\` 是进程池的"现代版"接口。和 \`ThreadPoolExecutor\`（第17章）**API 完全一致**——只换类名，就能在"多线程"和"多进程"间无缝切换。

\`\`\`python
from concurrent.futures import ProcessPoolExecutor

with ProcessPoolExecutor(max_workers=4) as ex:
    results = list(ex.map(func, args))
\`\`\`

## 为什么要有两套进程池？

| 工具 | 模块 | 特点 |
|------|------|------|
| \`multiprocessing.Pool\` | \`multiprocessing\` | 老牌，功能多（imap、starmap） |
| \`ProcessPoolExecutor\` | \`concurrent.futures\` | 现代，与 ThreadPoolExecutor 统一接口 |

**推荐用 \`ProcessPoolExecutor\`**：
1. 和 \`ThreadPoolExecutor\` 接口一致，线程↔进程切换只需改类名
2. 用 \`Future\` 统一抽象，便于组合
3. \`as_completed\` 等工具通用

## 三种用法（和 ThreadPoolExecutor 完全一样）

### 用法1：submit + Future
\`\`\`python
with ProcessPoolExecutor(4) as ex:
    futures = [ex.submit(func, arg) for arg in args]
    results = [f.result() for f in futures]
\`\`\`

### 用法2：map
\`\`\`python
with ProcessPoolExecutor(4) as ex:
    results = list(ex.map(func, args))
\`\`\`

### 用法3：as_completed
\`\`\`python
from concurrent.futures import as_completed
with ProcessPoolExecutor(4) as ex:
    futures = [ex.submit(func, arg) for arg in args]
    for f in as_completed(futures):
        print(f.result())
\`\`\`

## 线程池↔进程池切换

\`\`\`python
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

# IO 密集 → 用线程
# CPU 密集 → 用进程
Executor = ProcessPoolExecutor if is_cpu_intensive else ThreadPoolExecutor

with Executor(max_workers=4) as ex:
    results = list(ex.map(func, args))
\`\`\`

## 注意事项

1. **\`if __name__ == "__main__":\` 保护**：spawn 模式下必须（本教程 fork 模式可省略）
2. **参数和返回值必须可 pickle**
3. **不能在子进程里再嵌套 ProcessPoolExecutor**（容易死锁）
4. **\`max_workers\` 不超过 CPU 核数**（多了反而因切换开销变慢）

## demo：ProcessPoolExecutor 实战

下面 demo 用 ProcessPoolExecutor 跑 CPU 密集任务，并演示与 ThreadPoolExecutor 的切换。`,
    code: `# 第二十八章 demo：ProcessPoolExecutor 进程池
import time                       # 用于计时和 sleep
import multiprocessing as mp     # 用于获取 fork 上下文
from functools import partial    # partial 用于固定函数参数，创建偏函数
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor, as_completed  # 导入进程池、线程池、as_completed 工具

# ProcessPoolExecutor 默认用 spawn 启动方式，子进程要重新导入主模块。
# 在线运行时代码来自 stdin（无文件名），spawn 会报 FileNotFoundError。
# 解决：显式指定 fork 上下文（子进程直接继承内存，无需重新导入）。
# 用 partial 把 mp_context 固定下来，后面直接用 ForkProcessPool 即可。
ForkProcessPool = partial(ProcessPoolExecutor, mp_context=mp.get_context("fork"))  # 创建带 fork 上下文的进程池工厂

def cpu_heavy(n):
    """CPU 密集任务：累加"""
    total = 0                    # 累加器
    for i in range(n):           # 循环 n 次
        total += i               # 累加
    return total                 # 返回结果

def io_task(secs):
    """IO 任务：sleep 模拟"""
    time.sleep(secs)             # 模拟 IO 等待
    return secs                  # 返回等待秒数

# ============================================================
# 实验1：submit + Future 收集结果
# ============================================================
print("=" * 55)
print("实验1：submit 提交多个任务，收集结果")
print("=" * 55)
with ForkProcessPool(max_workers=4) as ex:  # 创建 4 worker 的进程池
    futures = [ex.submit(cpu_heavy, n) for n in [1_000_000, 2_000_000, 1_500_000]]  # submit 提交任务，返回 Future
    for n, f in zip([1_000_000, 2_000_000, 1_500_000], futures):  # zip 配对输入和 Future
        print(f"  输入 {n} → 结果 {f.result()}")  # f.result() 阻塞取结果
print()

# ============================================================
# 实验2：map 按顺序返回
# ============================================================
print("=" * 55)
print("实验2：map 按顺序返回结果")
print("=" * 55)
data = [1_000_000, 1_500_000, 2_000_000, 2_500_000]  # 4 个不同大小的计算任务
with ForkProcessPool(max_workers=4) as ex:  # 创建 4 worker 的进程池
    results = list(ex.map(cpu_heavy, data))  # ex.map 并行计算，list 收集所有结果
for n, r in zip(data, results):  # 配对打印输入和结果
    print(f"  {n} → {r}")
print()

# ============================================================
# 实验3：as_completed 谁先完成谁先返回
# ============================================================
print("=" * 55)
print("实验3：as_completed（谁先完成谁先返回）")
print("=" * 55)
# 不同耗时的任务
tasks = [("快", 0.3), ("中", 0.6), ("慢", 0.9), ("很快", 0.2)]  # name 和 sleep 秒数
with ForkProcessPool(max_workers=4) as ex:  # 创建 4 worker 的进程池
    # 用字典推导：Future → name，方便后续通过 Future 反查任务名
    futures = {ex.submit(io_task, secs): name for name, secs in tasks}
    # as_completed 返回已完成的 Future 迭代器，谁先完成谁先返回
    for f in as_completed(futures):
        name = futures[f]        # 通过 Future 反查任务名
        print(f"  ✓ [{name}] 完成，耗时 {f.result()}s")  # f.result() 取结果
print()

# ============================================================
# 实验4：进程池 vs 线程池（CPU 密集任务对比）
# ============================================================
print("=" * 55)
print("实验4：进程池 vs 线程池（CPU 密集任务）")
print("=" * 55)
N = 2_000_000                   # 每个任务的计算量
data = [N] * 4                  # 4 个相同的 CPU 密集任务

# 线程池（受 GIL 限制，无法真正并行）
start = time.time()              # 记录开始时间
with ThreadPoolExecutor(max_workers=4) as ex:  # 创建 4 线程的线程池
    list(ex.map(cpu_heavy, data))  # 线程池执行（GIL 限制，实际串行）
thread_time = time.time() - start  # 线程池耗时
print(f"  线程池(4): {thread_time:.3f}s（GIL 限制，≈串行）")

# 进程池（真正并行）
start = time.time()              # 记录开始时间
with ForkProcessPool(max_workers=4) as ex:  # 创建 4 进程的进程池
    list(ex.map(cpu_heavy, data))  # 进程池执行（真正并行）
process_time = time.time() - start  # 进程池耗时
print(f"  进程池(4): {process_time:.3f}s（真正并行）")
print(f"  进程池比线程池快 {thread_time/process_time:.2f}x")  # 计算加速比
print()

# ============================================================
# 实验5：异常处理
# ============================================================
print("=" * 55)
print("实验5：子进程异常在 result() 抛出")
print("=" * 55)
def risky(x):
    """x==3 时抛异常：演示子进程异常会在主进程的 f.result() 处重新抛出"""
    if x == 3:                   # 当输入为 3 时
        raise ValueError(f"x={x} 出错")  # 抛出 ValueError
    return x * 2                 # 其他情况返回 x*2

with ForkProcessPool(max_workers=3) as ex:  # 创建 3 worker 的进程池
    futures = [ex.submit(risky, i) for i in range(5)]  # 提交 5 个任务（0-4）
    for i, f in enumerate(futures):  # enumerate 带索引遍历
        try:
            # f.result() 阻塞取结果；子进程抛的异常会在这里重新抛出
            print(f"  任务{i}: {f.result()}")
        except ValueError as e:        # 捕获子进程抛出的 ValueError
            print(f"  任务{i}: 异常 {e}")

print("\\n要点：")
print("• ProcessPoolExecutor 和 ThreadPoolExecutor API 完全一致")
print("• 切换线程/进程只需改类名，便于根据任务类型选择")
print("• CPU 密集型用 ProcessPoolExecutor（真正并行），IO 用 ThreadPool")
print("• 参数和返回值必须可 pickle，max_workers 不超过 CPU 核数")`,
  },
];
