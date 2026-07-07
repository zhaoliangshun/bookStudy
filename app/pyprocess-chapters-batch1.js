// =============================================================
// Python 多进程教程（pyprocess）—— 第一批章节
// -------------------------------------------------------------
// 专注讲解 Python multiprocessing 多进程的工作原理与日常开发应用。
// 共 24 章，分 5 批：
//   batch1（1-4章）：  基础概念（多进程 vs 多线程、为什么需要多进程、os.fork、跨平台）
//   batch2（5-8章）：  multiprocessing 入门（Process、start、join、守护进程）
//   batch3（9-13章）： 进程间通信（Queue、Pipe、Manager、共享内存、Lock）
//   batch4（14-18章）：进程池与高级特性（Pool、apply_async、map、回调、超时）
//   batch5（19-24章）：实战与陷阱（CPU 密集实战、混合、子进程、陷阱、最佳实践）
//
// 每个章节包含：
//   id      : 唯一标识
//   group   : 分组名
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解（含表格、代码块、列表）
//   code    : 可运行、带详细中文注释的 Python 示例代码
//
// 代码运行环境约束：
//   - 用 python3 直接运行，10 秒超时
//   - 仅使用 Python 标准库（multiprocessing, os, time 等）
//   - 所有跨平台代码在 macOS / Linux / Windows 都能跑
//   - 代码必须是单文件可独立运行的脚本
//   - print 输出结果，print 之前会带 [主进程/子进程 pid=xxx] 前缀方便观察
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：什么是多进程？和多线程什么关系？
  // =========================================================
  {
    id: "mp-01",
    group: "基础概念",
    icon: "🚀",
    title: "什么是多进程？和多线程什么关系？",
    content: `## 一、从餐厅点餐说起

想象你开了一家小餐厅，只有一个服务员（**单线程**）。他必须先给 1 号桌点完菜，再去给 2 号桌点菜，3 号、4 号桌只能干等——顾客不耐烦，可能就走了。

**多线程**：还是这一个服务员，但他可以"一心多用"——给 1 号桌点菜的同时，眼睛瞄一下 3 号桌的招手，然后切回去给 1 号桌下单。看上去快了，但他**只有一个人**，脑子（CPU）切换上下文是要花时间的。

**多进程**：直接**多雇几个服务员**（开多个子进程），每个服务员独立给一桌点菜互不干扰。每人都有自己的"小本本"（独立内存），所以不需要共享，沟通要靠"对讲机"（进程间通信）。

## 二、进程 vs 线程：一图看懂

| 维度 | 进程（Process） | 线程（Thread） |
|------|----------------|----------------|
| **本质** | 操作系统资源分配的基本单位 | CPU 调度的基本单位 |
| **内存** | **独立**（每个进程有自己的内存空间） | **共享**（同一进程内所有线程共享） |
| **开销** | 大（创建慢、切换慢、占内存多） | 小（创建快、切换快、共享资源） |
| **数量** | 通常几十到几百 | 同一进程内可上千 |
| **通信** | 复杂（需 IPC：Queue/Pipe/共享内存） | 简单（直接共享变量，但要注意锁） |
| **稳定性** | 一个崩溃不影响其他 | 一个线程崩溃可能搞垮整个进程 |
| **比喻** | 多家分店，每家独立经营 | 一家店里的多个员工 |

## 三、Python 的特殊背景：GIL

Python（特指 CPython 解释器）有一个**全局解释器锁（GIL）**：

- 一个进程内**同一时刻**只有一个线程能执行 Python 字节码
- 这意味着：**CPU 密集型**任务用多线程**不会**真正并行（GIL 反复切换，反而更慢）
- **IO 密集型**任务用多线程**有用**（等 IO 时 GIL 释放，别的线程能跑）

**多进程没有 GIL 限制**：每个进程是独立的 Python 解释器实例，各自有自己的 GIL。所以**多进程能真正利用多核 CPU**。

## 四、什么时候该用多进程？

| 任务类型 | 推荐方案 | 原因 |
|---------|---------|------|
| **CPU 密集型**（计算、加密、压缩、图像处理） | ✅ 多进程 | 真正利用多核，绕过 GIL |
| **IO 密集型**（网络请求、文件读写、数据库） | ✅ 多线程 / 异步 | 进程创建开销大，线程/协程更轻 |
| **混合型** | 视情况 | 复杂的可分两层处理 |

**简单口诀**：
- 计算吃 CPU → **多进程**
- 等 IO → **多线程 / asyncio**
- 都要 → 进程池 + 线程池组合

## 五、Python 多进程的两条路

Python 提供两条路实现多进程：

1. **multiprocessing 模块**（**本章重点**）
   - 标准库，开箱即用
   - API 友好，类似 threading
   - 跨平台（macOS / Linux / Windows）

2. **subprocess 模块**（第 22 章简述）
   - 启动外部命令（别的程序、shell 脚本）
   - 适合"调用现成程序"而不是"自己写并发逻辑"

## 六、常见误解

| 误解 | 真相 |
|------|------|
| "多进程一定比多线程快" | 不一定。IO 密集场景下多线程更轻量、占用资源更少 |
| "进程越多越好" | 进程创建开销大，太多反而拖慢（一般 CPU 核数 + 几个就够） |
| "多进程 = 多个程序" | 错。多进程是在**同一个 Python 程序内**启动多个解释器实例 |
| "多进程共享内存" | 错。默认完全隔离，要共享必须显式用 Queue/Pipe/共享内存 |

## 七、一句话总结

> **多进程 = 多个独立 Python 解释器**。每个进程有自己的内存和 GIL，能真正利用多核 CPU，适合 CPU 密集型任务。

## 八、本章 demo 说明

下面这个 demo 演示了**单进程 vs 多进程**的差异：
- 串行做 4 个 CPU 密集任务
- 然后用多进程并行做同样的 4 个任务
- 观察总耗时差异
`,
    code: `"""
第一章 demo：单进程 vs 多进程处理 CPU 密集任务
本 demo 不依赖任何第三方库，所有代码在 macOS/Linux/Windows 上都能运行。
运行后会观察：多进程能让总耗时大幅缩短。
"""

import multiprocessing  # Python 多进程标准库
import time            # 用于计时
import os              # 用于获取进程 id


def cpu_heavy_task(n: int) -> int:
    """
    一个 CPU 密集型任务：累加 1..n。
    故意写得慢一点（n 比较大），方便观察耗时。
    """
    # 把任务绑定到当前进程上，方便看到"是哪个进程在跑"
    pid = os.getpid()
    print(f"  [子进程 pid={pid}] 开始处理 n={n}")

    total = 0
    # 用纯 Python 做大量加减法，模拟 CPU 密集计算
    for i in range(1, n + 1):
        total += i

    print(f"  [子进程 pid={pid}] 处理完 n={n}，结果={total}")
    return total


def run_serial():
    """串行执行：在一个进程里顺序做 4 个任务"""
    print("【串行模式】开始")
    start = time.time()
    # 一个接一个执行，第二个会等第一个完全结束才开始
    cpu_heavy_task(2_000_000)
    cpu_heavy_task(2_000_000)
    cpu_heavy_task(2_000_000)
    cpu_heavy_task(2_000_000)
    print(f"【串行模式】总耗时: {time.time() - start:.2f} 秒\\n")


def run_multiprocess():
    """多进程执行：开 4 个子进程同时做 4 个任务"""
    print("【多进程模式】开始")
    start = time.time()

    # 创建一个进程池，指定 4 个工作进程
    # Pool(4) 表示同时跑 4 个进程
    with multiprocessing.Pool(processes=4) as pool:
        # map 会把任务平均分给 4 个进程并行执行
        results = pool.map(cpu_heavy_task, [2_000_000] * 4)

    print(f"【多进程模式】收集到结果: {results}")
    print(f"【多进程模式】总耗时: {time.time() - start:.2f} 秒")


if __name__ == "__main__":
    # Windows 和 macOS（Python 3.8+）上必须把启动代码放在 if __name__ == "__main__" 里
    # 否则子进程会无限递归启动
    print(f"主进程 pid = {os.getpid()}")
    print(f"本机 CPU 核数 = {multiprocessing.cpu_count()}\\n")

    run_serial()
    run_multiprocess()

    print("\\n=== 结论 ===")
    print("多进程模式下，4 个任务并行执行，总耗时明显比串行少。")
    print("这就是多进程最核心的价值：突破 GIL，利用多核 CPU 并行计算。")
`,
  },

  // =========================================================
  // 第二章：进程的工作原理 —— 从 fork 到 spawn
  // =========================================================
  {
    id: "mp-02",
    group: "基础概念",
    icon: "🔍",
    title: "进程的工作原理 —— 从 fork 到 spawn",
    content: `## 一、操作系统眼中的进程

在操作系统（OS）层面，**进程 = 程序 + 数据 + 执行上下文**。每个进程有：

- **独立的虚拟内存空间**（代码段、数据段、堆、栈）
- **独立的系统资源**（打开的文件、网络连接、信号量等）
- **一个或多个线程**（主线程 + 可能的工作线程）
- **唯一的进程 ID（PID）**
- **父进程 PID（PPID）**：除了 init，每个进程都有一个"父亲"

## 二、操作系统怎么创建新进程？

POSIX 系统（Linux / macOS）有两个核心系统调用：

### 1. fork() ——"克隆"当前进程

\`\`\`text
父进程  ───fork()───>  子进程（几乎一模一样的副本）
\`\`\`

- **复制**：子进程得到父进程内存的**完整副本**（早期是真实复制，后改为"写时复制 COW"优化）
- **执行点**：子进程从 fork 返回处继续执行
- **返回值**：在父进程中返回子进程 PID；在子进程中返回 0
- **特点**：速度**极快**，但只支持 POSIX（Windows 没有）

### 2. exec() ——"变身"为另一个程序

\`\`\`text
当前进程  ───exec("python")───>  同一个 PID，但跑的是 python 程序
\`\`\`

- **替换**：把当前进程的代码段、数据段**全部替换**为新程序
- **PID 不变**：是"变身"不是"新建"
- **典型用法**：fork 完，子进程 exec 加载 Python 解释器

### 3. spawn ——"全新启动"（Windows 风格）

Windows 没有 fork。Windows 的做法是：
1. 启动一个全新的 Python 解释器进程
2. 把要执行的函数/参数通过 pickle 序列化传过去
3. 子进程反序列化后执行

**Python 3.4+ 引入 start_method 机制**，让你选择怎么"开"子进程：

| 启动方式 | 平台支持 | 原理 | 速度 | 安全性 |
|---------|---------|------|------|--------|
| **fork** | 仅 POSIX | 克隆父进程内存 | 最快 | 子进程继承父进程全部状态（包括未释放的锁） |
| **spawn** | 全平台 | 新启 Python + pickle 参数 | 较慢 | 最干净，从零开始 |
| **forkserver** | 仅 POSIX | 先建一个 server 进程，后续 fork 它 | 中等 | 比 fork 安全，比 spawn 快 |

## 三、Python multiprocessing 的"启动方式"

\`\`\`python
import multiprocessing

# 在程序最开始（必须早于任何进程相关代码）选择启动方式
multiprocessing.set_start_method("spawn")  # 或 "fork" / "forkserver"
\`\`\`

**macOS 的特殊情况**：从 **Python 3.8 起**，macOS 上 multiprocessing **默认改用 spawn**（之前是 fork）。这是因为 macOS 的 fork 行为有 bug。所以你在 macOS 上看到子进程 PID 跟主进程没关系——那是新启的 Python。

## 四、写跨平台多进程代码的 3 条铁律

1. **永远把启动代码放在 \`if __name__ == "__main__":\` 块里**
   - spawn 模式下，子进程会重新 import 主模块
   - 如果不挡在 main 块里，子进程会递归启动，最终崩溃

2. **子进程的函数必须能 pickle**
   - 函数定义要放在模块顶层（不要嵌在另一个函数里）
   - 不能用 lambda、不能引用闭包变量

3. **避免在子进程启动时共享太多状态**
   - fork 会继承父进程内存（看起来方便，但有隐藏 bug）
   - spawn 必须显式传参，更安全

## 五、本章 demo

下面 demo 演示：
- 打印主进程和子进程的 PID/PPID
- 验证主进程和子进程**内存独立**（子进程改 list，主进程看不到）
- 演示 \`if __name__ == "__main__":\` 的必要性
`,
    code: `"""
第二章 demo：进程的工作原理
演示：
  1. 打印主进程和子进程的 PID/PPID
  2. 验证子进程有独立的内存
  3. 演示 spawn 模式下必须用 if __name__ == "__main__":
"""

import multiprocessing
import os
import time


def show_info(name: str):
    """子进程任务：打印自己的 PID/PPID/启动方式"""
    pid = os.getpid()
    ppid = os.getppid()
    print(f"  [{name}] pid={pid}, ppid={ppid}")

    # 查看当前进程用了什么启动方式（macOS 是 spawn，Linux 默认 fork）
    # get_start_method 在子进程里也能调用
    method = multiprocessing.get_start_method()
    print(f"  [{name}] 启动方式 = {method}")


def modify_shared_data(shared_list):
    """
    子进程任务：修改传入的 list，验证子进程是否能改父进程的数据。
    答案：不能！子进程拿到的 list 是它自己内存里的副本。
    """
    pid = os.getpid()
    print(f"  [子进程 pid={pid}] 收到 list = {shared_list}")
    print(f"  [子进程 pid={pid}] list 对象 id = {id(shared_list)}")

    # 子进程在 list 里追加元素
    shared_list.append("子进程添加的")

    # 关键：子进程修改的是它自己内存里的副本
    # 父进程里的 list 不会受影响
    print(f"  [子进程 pid={pid}] 修改后 list = {shared_list}")


if __name__ == "__main__":
    # === 第一部分：查看进程关系 ===
    print("=== 第一部分：查看主进程和子进程的关系 ===")
    main_pid = os.getpid()
    main_ppid = os.getppid()
    print(f"主进程 pid={main_pid}, ppid={main_ppid}")
    print(f"本机 CPU 核数 = {multiprocessing.cpu_count()}")

    # 启动一个子进程
    p = multiprocessing.Process(target=show_info, args=("子进程 A",))
    p.start()
    p.join()  # 等待子进程结束
    print()

    # === 第二部分：验证内存独立 ===
    print("=== 第二部分：验证子进程有独立的内存 ===")
    my_list = ["原始数据"]
    print(f"主进程:  list = {my_list}, id = {id(my_list)}")

    p2 = multiprocessing.Process(target=modify_shared_data, args=(my_list,))
    p2.start()
    p2.join()

    print(f"主进程:  list = {my_list}, id = {id(my_list)}")
    print("【结论】子进程修改 list 后，主进程的 list 没变，说明内存是独立的\\n")

    # === 第三部分：演示 if __name__ == "__main__" 的必要性 ===
    print("=== 第三部分：if __name__ == \"__main__\" 保护 ===")
    print("spawn 模式下，子进程会重新 import 主模块。")
    print("如果没有 if __name__ == \"__main__\" 保护，")
    print("子进程会再次执行启动代码 → 无限递归 → 崩溃。")
    print()
    print("本 demo 中所有 Process() 调用都在 if __name__ == \"__main__\" 里，")
    print("所以运行是安全的。✅")
`,
  },

  // =========================================================
  // 第三章：为什么需要多进程？GIL 与 CPU 密集场景
  // =========================================================
  {
    id: "mp-03",
    group: "基础概念",
    icon: "💡",
    title: "为什么需要多进程？GIL 与 CPU 密集场景",
    content: `## 一、GIL 是什么？

GIL（Global Interpreter Lock，全局解释器锁）是 CPython 解释器的一把**全局大锁**：

\`\`\`text
┌──────────────────────────────┐
│        一个 Python 进程       │
│  ┌──────┐  ┌──────┐  ┌──────┐│
│  │线程1 │  │线程2 │  │线程3 ││
│  └──────┘  └──────┘  └──────┘│
│         ↘   ↓   ↙            │
│        【 GIL 大锁 】         │  ← 同一时刻只有一个线程能拿到
│              ↓               │
│         Python 解释器         │
└──────────────────────────────┘
\`\`\`

- **同一时刻**，一个 Python 进程内**只有一个线程**能执行 Python 字节码
- 线程要执行代码，必须先**抢到 GIL**
- 没抢到的线程只能等（或让出）

### 为什么要有 GIL？

历史原因：CPython 的内存管理用了**引用计数**。如果多线程同时改引用计数，不加锁会出问题。GIL 是最简单粗暴的解决方案——直接让线程串行化。

**注意**：GIL 只在 **CPython** 里存在。Jython（Java 版的 Python）、PyPy（带 GIL 的实验版本）、Cython 写扩展时都可以绕过。但你日常用的 \`python\` 命令 99% 是 CPython。

## 二、GIL 对多线程的实际影响

### 场景 1：IO 密集任务（多线程**有用**）

\`\`\`python
# 下载 10 个网页：每个要等 1 秒
# 多线程：等网页 A 的时候，线程去发请求 B、发请求 C
# 总耗时 ≈ 1 秒
\`\`\`

**为什么有效？** 等 IO 时线程会**主动释放 GIL**（C 标准库的 IO 函数会这么做），别的线程就能拿到 GIL 继续跑。

### 场景 2：CPU 密集任务（多线程**无效**）

\`\`\`python
# 4 个 CPU 密集任务：每个要算 2 秒
# 多线程：4 个线程轮流抢 GIL，一个跑 100 字节码让出，下一个接着跑
# 总耗时 ≈ 8 秒（甚至比串行 8 秒还略慢，因为有切换开销）
\`\`\`

**为什么无效？** 计算用的是纯 Python 字节码，线程不会主动释放 GIL。结果就是 4 个线程**轮流使用一个 CPU 核心**。

## 三、多进程为什么能突破 GIL？

每个进程有**独立的 Python 解释器实例**，每个实例有**自己的 GIL**：

\`\`\`text
主进程（GIL #1）─── 启动 ───> 子进程 1（GIL #2）
主进程（GIL #1）─── 启动 ───> 子进程 2（GIL #3）
主进程（GIL #1）─── 启动 ───> 子进程 3（GIL #4）
                                  ↓
                          4 个 GIL 互不干扰
                          4 个 CPU 核心真正并行
\`\`\`

- 4 个进程可以在 **4 个 CPU 核心**上**真正同时**跑
- 不存在 GIL 竞争
- 计算任务能拿到 4 倍速度（理想情况下）

## 四、什么时候用多进程？决策表

| 任务特征 | 推荐方案 | 理由 |
|---------|---------|------|
| 网络请求、文件读写、数据库查询（**IO 密集**） | **多线程** / asyncio | 多线程能并发等待 IO；进程开销大没必要 |
| 数学计算、图像处理、视频编码、数据分析（**CPU 密集**） | **多进程** | 必须多核并行才能快 |
| 任务之间需要**共享大量数据** | **多线程**（加锁） | 进程间共享数据麻烦（要 IPC） |
| 任务之间**完全独立** | **多进程** | 隔离好，崩溃不影响其他 |
| 任务**需要长期运行**（守护服务） | **多进程** | 进程稳定，子进程死了不影响主进程 |

## 五、实际开发的"经验法则"

1. **先看 CPU 核数**：\`multiprocessing.cpu_count()\`，一般开 4-16 个进程就够了
2. **进程不是越多越好**：进程切换、内存占用、IPC 都有开销
3. **先用单进程实现，再考虑并行**：过早优化是万恶之源
4. **能不用就不用**：很多"以为要并行"的场景，单进程 + 异步 IO 就够了

## 六、本章 demo

下面 demo 用一个"计算斐波那契数列"的 CPU 密集任务，对比单进程 / 多线程 / 多进程的耗时。
`,
    code: `"""
第三章 demo：GIL 影响下的多线程 vs 多进程
对比三种方案处理 4 个 CPU 密集任务的总耗时：
  1. 串行（一个进程，一个线程）
  2. 多线程（一个进程，4 个线程）
  3. 多进程（4 个进程）
"""

import multiprocessing
import threading
import time
import os


def fib(n: int) -> int:
    """
    计算斐波那契数列第 n 项（递归版，故意慢）。
    这是个典型的 CPU 密集型任务：纯计算，无 IO。
    """
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)


def run_in_process(n: int):
    """子进程入口：算 fib 并打印进程 ID"""
    pid = os.getpid()
    result = fib(n)
    print(f"  [进程 pid={pid}] fib({n}) = {result}")


def run_in_thread(n: int):
    """线程入口：算 fib 并打印线程名"""
    name = threading.current_thread().name
    result = fib(n)
    print(f"  [线程 {name}] fib({n}) = {result}")


def run_serial():
    """方案 1：串行"""
    print("【1. 串行】开始")
    start = time.time()
    for n in [30, 30, 30, 30]:
        run_in_process(n)  # 这里直接调用，不开新进程
    print(f"【1. 串行】总耗时: {time.time() - start:.2f} 秒\\n")


def run_with_threads():
    """方案 2：多线程（受 GIL 限制）"""
    print("【2. 多线程】开始（GIL 限制）")
    start = time.time()
    threads = []
    for n in [30, 30, 30, 30]:
        t = threading.Thread(target=run_in_thread, args=(n,))
        threads.append(t)
        t.start()
    for t in threads:
        t.join()
    print(f"【2. 多线程】总耗时: {time.time() - start:.2f} 秒\\n")


def run_with_processes():
    """方案 3：多进程（突破 GIL）"""
    print("【3. 多进程】开始（每个进程独立的 GIL）")
    start = time.time()
    processes = []
    for n in [30, 30, 30, 30]:
        p = multiprocessing.Process(target=run_in_process, args=(n,))
        processes.append(p)
        p.start()
    for p in processes:
        p.join()
    print(f"【3. 多进程】总耗时: {time.time() - start:.2f} 秒\\n")


if __name__ == "__main__":
    print(f"本机 CPU 核数: {multiprocessing.cpu_count()}")
    print(f"注意：fib(30) 是 CPU 密集型任务，不涉及 IO\\n")

    run_serial()
    run_with_threads()
    run_with_processes()

    print("=== 结论 ===")
    print("• 串行：基准耗时")
    print("• 多线程：因为 GIL，多个线程轮流使用一个 CPU，耗时 ≈ 串行（甚至略慢）")
    print("• 多进程：每个进程独立 GIL，4 个任务并行，耗时 ≈ 串行 / 核数")
    print("\\n这就是为什么 CPU 密集型任务必须用多进程。")
`,
  },

  // =========================================================
  // 第四章：跨平台多进程的 5 个常见坑
  // =========================================================
  {
    id: "mp-04",
    group: "基础概念",
    icon: "⚠️",
    title: "跨平台多进程的 5 个常见坑",
    content: `## 一、坑 1：忘了 \`if __name__ == "__main__":\`

**症状**：在 macOS 或 Windows 上跑代码报 \`RuntimeError: An attempt has been made to start a new process before the current process has finished its bootstrap\`。

**原因**：spawn 启动方式下，子进程会重新 import 主模块。如果启动代码不在 main 块里，子进程会再次启动子进程……**无限递归**。

\`\`\`python
# ❌ 错误写法
import multiprocessing
def work():
    print("hello")
p = multiprocessing.Process(target=work)
p.start()

# ✅ 正确写法
import multiprocessing
def work():
    print("hello")
if __name__ == "__main__":
    p = multiprocessing.Process(target=work)
    p.start()
    p.join()
\`\`\`

**经验**：从今天起，**所有多进程代码都包在 \`if __name__ == "__main__":\` 里**。

## 二、坑 2：子进程函数不能 pickle

**症状**：\`AttributeError: Can't pickle local object\` 或 \`PicklingError\`。

**原因**：spawn 模式下，子进程函数的代码需要通过 pickle 序列化传到子进程。能 pickle 的必须是**模块顶层定义的**：

- ✅ 普通函数：\`def work(): ...\`
- ✅ 类方法（在类外面定义的类）
- ❌ lambda 表达式
- ❌ 嵌套函数（函数里再 def 一个）
- ❌ 闭包引用了外部变量
- ❌ 用 \`@functools.partial\` / 装饰器闭包包裹的函数

\`\`\`python
# ❌ 不能 pickle
def main():
    multiplier = 10
    def work(x):
        return x * multiplier  # 闭包！
    p = multiprocessing.Process(target=work, args=(5,))

# ✅ 能 pickle：提到模块顶层，或用类封装
MULTIPLIER = 10
def work(x):
    return x * MULTIPLIER
\`\`\`

## 三、坑 3：fork 模式下子进程继承了未释放的锁

**症状**：程序**偶尔**死锁或卡住，难以复现。

**原因**：POSIX 的 fork 会克隆父进程**全部状态**。如果父进程持有一个锁，fork 后子进程**也"持有"同一个锁**（但实际上没人在等）。子进程再去 acquire 这个锁 → 死锁。

\`\`\`python
import multiprocessing
import threading

lock = threading.Lock()
lock.acquire()  # 父进程持有了锁

# fork 模式下，子进程也"持有"这个锁
p = multiprocessing.Process(target=some_func, args=(lock,))
# 子进程在 some_func 里 lock.acquire() → 死锁！
\`\`\`

**解决**：用 spawn 模式（默认在 macOS / Windows 上），或确保 fork 前**不持有任何锁**。

## 四、坑 4：在子进程里 print 没输出（或乱序）

**症状**：子进程的 print 没显示，或者和主进程的 print 混在一起乱七八糟。

**原因**：
1. 主进程没等子进程结束（没调用 \`p.join()\`），主进程退出后子进程也被强杀
2. 多进程并发 print 到同一个终端，输出缓冲区互相覆盖

**解决**：
- 总是 \`p.start()\` 后调用 \`p.join()\`
- 或者用 \`multiprocessing.Pool\` 让框架帮你 join
- 如果需要严格有序输出，把结果收集到 \`Queue\` 里，由主进程统一 print

## 五、坑 5：macOS / Linux / Windows 行为不一致

**症状**：开发机（macOS）跑得好好的，部署到 Linux 服务器上崩了。

**原因对比**：

| 行为 | Linux 默认（fork） | macOS 默认（spawn，3.8+） | Windows（spawn） |
|------|-------------------|--------------------------|------------------|
| 启动速度 | ⚡ 极快 | 🐢 较慢 | 🐢 较慢 |
| 继承父进程内存 | ✅ 是 | ❌ 否 | ❌ 否 |
| 继承未释放的锁 | ⚠️ 危险 | ✅ 安全 | ✅ 安全 |
| 跨平台一致性 | ❌ 差 | ✅ 好 | ✅ 好 |
| 启动方式可改 | ✅ | ✅ | ❌ 只能 spawn |

**建议**：
- 开发期固定用 spawn（通过 \`multiprocessing.set_start_method("spawn")\`）保持跨平台一致
- Linux 部署时如果对启动速度敏感，可以改回 fork，但要小心锁问题
- 使用 \`get_context("spawn")\` 局部指定，比全局设置更安全

\`\`\`python
import multiprocessing
ctx = multiprocessing.get_context("spawn")  # 局部用 spawn
p = ctx.Process(target=work, args=(1,))
\`\`\`

## 六、本章 demo

下面 demo 演示**坑 1**（忘了 main 块）和**坑 2**（lambda 不能 pickle），并展示**正确写法**。
`,
    code: `"""
第四章 demo：跨平台多进程的常见坑
演示两个最常见的错误和正确写法：
  坑 1：子进程函数不能 pickle（lambda、嵌套函数）
  坑 2：spawn 模式下必须用 if __name__ == "__main__":
"""

import multiprocessing
import os
import time


# ===== 正确写法：模块顶层定义的函数 =====
def good_worker(x: int) -> int:
    """一个标准的、可 pickle 的工作函数"""
    pid = os.getpid()
    result = x * x
    print(f"  [pid={pid}] good_worker({x}) = {result}")
    return result


# ===== 演示坑 1：lambda 不能 pickle =====
def try_lambda_worker():
    """
    尝试用 lambda 作为子进程函数 —— 会失败。
    在 spawn 模式下 lambda 无法被 pickle 序列化。
    """
    print("--- 坑 1 演示：lambda 不能 pickle ---")
    try:
        # lambda 函数没有 __name__ 属性（或者名字是 <lambda>），
        # pickle 无法定位它的定义
        p = multiprocessing.Process(
            target=lambda x: x * 2,  # ❌ lambda
            args=(5,)
        )
        p.start()
        p.join()
    except Exception as e:
        print(f"  ❌ 失败: {type(e).__name__}: {e}")
    print()


# ===== 演示坑 1 的修复 =====
def try_lambda_fix():
    """修复方案：用普通函数替代 lambda"""
    print("--- 坑 1 修复：用普通函数替代 lambda ---")

    def double(x):  # ✅ 普通函数，能 pickle
        return x * 2

    p = multiprocessing.Process(target=double, args=(5,))
    p.start()
    p.join()
    print("  ✅ 成功！\\n")


# ===== 演示坑 2：嵌套函数 =====
def try_nested_worker():
    """
    嵌套函数（def in def）也不能 pickle。
    """
    print("--- 坑 1 延伸：嵌套函数也不能 pickle ---")

    def outer():
        multiplier = 10

        def inner(x):  # ❌ inner 是 outer 的局部函数
            return x * multiplier

        p = multiprocessing.Process(target=inner, args=(5,))
        p.start()
        p.join()

    try:
        outer()
    except Exception as e:
        print(f"  ❌ 失败: {type(e).__name__}: {e}")
    print()


# ===== 演示正确的多进程写法 =====
def correct_demo():
    """标准、跨平台、安全的写法"""
    print("--- 正确写法 ---")
    processes = []
    for i in range(3):
        p = multiprocessing.Process(target=good_worker, args=(i + 1,))
        processes.append(p)
        p.start()

    # 等待所有子进程完成
    for p in processes:
        p.join()

    print("  ✅ 3 个子进程都成功执行并结束\\n")


# ===== 主程序入口 =====
if __name__ == "__main__":
    # 如果没有这层保护，下面的 try_lambda_worker 等调用
    # 在 spawn 模式下会导致子进程递归启动而崩溃
    print(f"主进程 pid = {os.getpid()}\\n")

    try_lambda_worker()
    try_lambda_fix()
    try_nested_worker()
    correct_demo()

    print("=== 总结 ===")
    print("1. 子进程函数必须是模块顶层定义的普通函数")
    print("2. 不要用 lambda、嵌套函数、闭包")
    print("3. 启动代码必须放在 if __name__ == \"__main__\" 里")
    print("4. 启动后必须 join() 等子进程结束")
`,
  },
];
