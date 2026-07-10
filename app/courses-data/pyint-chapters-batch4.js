// =============================================================
// Python 原理图解教程 - batch4
// 章节：GIL 与并发（gil, concurrency）+ 性能与导入（import, performance）
// 共 4 章，2 个分组
// =============================================================

export const chapters = [
  // -----------------------------------------------------------
  // 第 1 章：GIL 是什么
  // -----------------------------------------------------------
  {
    id: "pyint-gil",
    group: "GIL 与并发",
    icon: "🔒",
    title: "GIL 是什么",
    content: `## 一句话理解 GIL

**GIL**（Global Interpreter Lock，全局解释器锁）是 CPython（最常用的 Python 实现）中的一个机制：**同一时刻，只有一个线程能执行 Python 字节码**。

也就是说，即使你的电脑有 8 核 CPU、开了 8 个 Python 线程，它们也只能轮流用一个核来执行 Python 代码，没法真正并行计算。

> 简单说：**GIL 是一把"全局锁"，让多线程在 Python 里没法真正同时跑。**

## 为什么要有 GIL？

Python 用**引用计数**来管理内存。每个对象内部都有一个计数器，记录"有多少个变量引用了我"，计数归零就自动回收内存。

\`\`\`
对象 obj: 引用计数 = 2
  ├── 变量 a 指向它
  └── 列表 lst[0] 指向它

当 a = None 时 → 引用计数变成 1
当 lst 清空时 → 引用计数变成 0 → 自动回收
\`\`\`

如果多个线程同时修改引用计数，会造成计数错乱：
- 线程 A 和线程 B 同时把计数 +1，结果只加了 1 次（丢失一次）
- 计数永远归不了零 → 内存泄漏
- 或者错误地提前归零 → 对象还在用就被回收 → 程序崩溃

GIL 用一把全局锁保证：**同一时刻只有一个线程在跑**，引用计数就安全了，不需要给每个对象加锁。

> 本质：**GIL 是用并发性能换取内存管理简单性的一种折中。**

## GIL 是怎么工作的

\`\`\`
             ┌─────────────────────────────┐
             │     CPython 解释器           │
             │  ┌───────────────────────┐  │
             │  │      GIL（全局锁）     │  │
             │  └───────────────────────┘  │
             │       ↑      ↑      ↑       │
             │    线程1  线程2  线程3       │
             │   （排队抢锁，一次只一个）   │
             └─────────────────────────────┘

时间线：
  线程1: ████持有GIL████释放█────等待────████持有GIL████
  线程2: ────等待██████████持有GIL████释放████──────────
  线程3: ────────────────等待██████████████持有GIL██████

  → 三个线程轮流持有 GIL，任何时刻只有一个在执行
\`\`\`

## GIL 对 CPU 密集型任务的影响

CPU 密集型任务 = 大量计算，全程执行 Python 字节码。

由于 GIL 的存在，多线程**无法利用多核**：

\`\`\`
8核 CPU，4个线程做纯计算：

  核1: ████线程1████线程3████线程2████线程4████  ← 轮流跑
  核2-8: 全部空闲（GIL 锁住了，只有一个线程能跑）

  → 4个线程的总时间 ≈ 串行执行的时间
  → 甚至更慢（因为线程切换有开销）
\`\`\`

| 执行方式 | 耗时（理论） | 耗时（实际） | 原因 |
|---------|-------------|-------------|------|
| 串行 2 次 | 2T | 2T | 依次执行 |
| 2 线程 | T（期望） | ≈2T 或更慢 | GIL 让线程排队，还有切换开销 |

## GIL 对 I/O 密集型任务的影响

I/O 密集型任务 = 大量等待（网络请求、文件读写、sleep）。

关键：**线程在等待 I/O 时会主动释放 GIL**，其他线程可以运行。

\`\`\`
3个线程，每个做 sleep(0.3)：

  线程1: ████sleep(释放GIL)████醒来████完成
  线程2: ────拿到GIL████sleep(释放GIL)████醒来████完成
  线程3: ────────拿到GIL████sleep(释放GIL)████醒来████完成

  → 三个线程的 sleep 重叠，总耗时 ≈ 0.3s（不是 0.9s）
\`\`\`

| 执行方式 | 耗时 | 原因 |
|---------|------|------|
| 串行 3 次 sleep(0.3) | 0.9s | 依次等待 |
| 3 线程 sleep(0.3) | ≈0.3s | 等待时释放 GIL，重叠等待 |

所以：**I/O 密集型任务用多线程是有效的！**

## GIL 什么时候切换

GIL 不是"一个线程独占到结束"，而是会定期切换：

| Python 版本 | 切换机制 | 说明 |
|-----------|---------|------|
| Python 2 | 每 100 条字节码 | 执行 100 条指令后强制切换 |
| Python 3.2+ | 时间片（默认 5ms） | 用 \`sys.setswitchinterval()\` 设置 |

\`\`\`python
import sys  # 导入模块 sys

# 查看当前切换间隔（秒）
print(sys.getswitchinterval())  # 默认 0.005（5毫秒）

# 修改切换间隔
sys.setswitchinterval(0.01)  # 改为 10 毫秒
\`\`\`

> 切换间隔太短：线程切换频繁，开销大
> 切换间隔太长：线程响应慢，可能饿死其他线程

## GIL 在哪些操作中会释放

GIL 不是全程锁死的，以下操作会**主动释放 GIL**：

| 操作 | 是否释放 GIL | 原因 |
|------|-------------|------|
| \`time.sleep()\` | ✅ 释放 | 纯等待，不需要 CPU |
| 文件读写 | ✅ 释放 | I/O 操作，等待磁盘 |
| 网络请求 | ✅ 释放 | I/O 操作，等待网络 |
| \`input()\` | ✅ 释放 | 等待用户输入 |
| NumPy 计算 | ✅ 释放 | C 扩展主动释放 |
| 纯 Python 计算 | ❌ 不释放 | 需要执行字节码 |
| 字符串拼接 | ❌ 不释放 | 需要执行字节码 |

> 这就是为什么 I/O 密集型多线程有效，CPU 密集型无效。

## 单线程 vs 多线程 vs 多进程

| 维度 | 单线程 | 多线程 | 多进程 |
|------|-------|-------|-------|
| **CPU 密集型** | 基准 | ❌ 不加速（GIL） | ✅ 真正并行 |
| **I/O 密集型** | 基准 | ✅ 有效（释放 GIL） | ✅ 有效但开销大 |
| **创建开销** | 无 | 小（KB 级） | 大（MB 级） |
| **内存共享** | 不涉及 | ✅ 共享（方便但需同步） | ❌ 独立（需 IPC） |
| **GIL 影响** | 无 | 严重影响 CPU 任务 | 不受影响 |
| **通信方式** | 直接调用 | 共享变量 | Queue/Pipe |
| **适用数量** | 1 | 几十到几百 | 几个到几十 |

## GIL 的争议：为什么 Python 不去掉 GIL

GIL 长期以来被批评，但 Python 官方一直没去掉，原因：

1. **去掉 GIL 会降低单线程性能**：加细粒度锁有开销，早期实验显示单线程慢 40%
2. **改动太大**：涉及 CPython 核心代码，影响所有 C 扩展
3. **现有 C 扩展依赖 GIL**：很多 C 扩展假设有 GIL 保护，去掉会出问题
4. **有替代方案**：multiprocessing、C 扩展、asyncio 都能绕过 GIL

## PEP 703：未来可能移除 GIL

**PEP 703**（2023 年提出）计划在 CPython 中**可选移除 GIL**：

| 时间 | 版本 | 进展 |
|------|------|------|
| 2024 | Python 3.13 | 实验性"自由线程"模式（需特殊编译） |
| 2025 | Python 3.14 | 改进稳定，仍非默认 |
| 未来 | Python 3.15+ | 可能成为默认 |

> 现阶段（2026 年）：绝大多数项目仍使用带 GIL 的 Python。学习并发**必须理解 GIL**。

## GIL 与 C 扩展的关系

C 扩展（如 NumPy、Pillow）可以**主动释放 GIL**，在 C 层面实现真正的并行：

\`\`\`
NumPy 矩阵运算流程：
  1. Python 调用 NumPy 函数
  2. NumPy 在 C 层释放 GIL ← 此刻其他 Python 线程可以运行
  3. NumPy 用 C 计算矩阵（不受 GIL 限制，可用多线程）
  4. 计算完成后重新获取 GIL
  5. 返回结果给 Python

→ 这就是为什么 NumPy 多线程能加速
\`\`\`

| 库 | 是否释放 GIL | 说明 |
|---|------------|------|
| NumPy | ✅ 释放 | 矩阵运算时释放 |
| Pillow | ✅ 释放 | 图像处理时释放 |
| requests | ✅ 释放 | 网络等待时释放 |
| 纯 Python 循环 | ❌ 不释放 | 全程持有 GIL |

## GIL 的常见误区

| 误区 | 真相 |
|------|------|
| "Python 多线程没用" | ❌ I/O 密集型多线程有效 |
| "GIL 让 Python 没法并发" | ❌ GIL 限制的是并行，不是并发 |
| "多线程一定比单线程快" | ❌ CPU 密集型反而更慢 |
| "GIL 马上要被移除了" | ❌ PEP 703 还在实验阶段 |
| "asyncio 不受 GIL 限制" | ❌ asyncio 仍是单线程，受 GIL 限制，但 I/O 释放 GIL |

## 如何判断你的任务受不受 GIL 影响

问自己两个问题：

1. **任务主要在计算还是在等待？**
   - 大量计算（循环、数学运算）→ CPU 密集型 → 受 GIL 影响
   - 大量等待（网络、文件、sleep）→ I/O 密集型 → GIL 影响小

2. **用的库是否释放 GIL？**
   - NumPy、Pillow 等会释放 → 多线程有效
   - 纯 Python 计算 → 受 GIL 限制

\`\`\`
判断流程：
  任务类型？
  ├── 大量计算
  │   ├── 用了 NumPy/Pillow → 多线程可能有效（释放 GIL）
  │   └── 纯 Python 计算  → 多线程无效，用多进程
  └── 大量等待
      └── 多线程/asyncio 都有效（I/O 释放 GIL）
\`\`\`

## 日常开发启示

1. **CPU 密集型任务**（大量计算、加密、图像处理）→ 用 \`multiprocessing\`
2. **I/O 密集型任务**（网络请求、文件读写、数据库查询）→ 用 \`threading\` 或 \`asyncio\`
3. **不要盲目开多线程**：CPU 任务开了反而更慢
4. **NumPy 等库不受 GIL 限制**：它们在 C 层释放 GIL，能真正并行
5. **高并发 I/O** → 优先考虑 \`asyncio\`（比线程更轻量）

> 💡 **记牢这条铁律**：在 Python 里，**CPU 密集型想加速必须用多进程**，多线程对计算无能为力。

下面用代码亲眼见证 GIL 的影响。`,
    code: `# 第一章代码：GIL 对 CPU 密集型 vs I/O 密集型任务的影响
# 通过对比实验，直观感受 GIL 的存在

import threading
import time

# ============================================================
# 实验1：CPU 密集型任务 —— 多线程无法加速（GIL 锁死）
# ============================================================
def cpu_task(name, n):
    """纯 CPU 计算：把 0 到 n-1 累加，全程执行字节码，受 GIL 限制"""
    total = 0
    for i in range(n):
        total += i                        # 纯 Python 计算，GIL 不释放
    print(f"  [{name}] 完成，结果={total}")

N = 2_000_000                             # 200万次累加，约 0.3 秒

print("=" * 55)
print("实验1：CPU 密集型任务（受 GIL 限制）")
print("=" * 55)

# 串行执行两次
start = time.time()
cpu_task("串行-1", N)
cpu_task("串行-2", N)
serial_cpu = time.time() - start
print(f"  串行耗时:   {serial_cpu:.3f}s\\n")

# 多线程执行两次
start = time.time()
t1 = threading.Thread(target=cpu_task, args=("线程-1", N))
t2 = threading.Thread(target=cpu_task, args=("线程-2", N))
t1.start()
t2.start()
# 如果没有 GIL，两个线程并行，耗时应该接近 serial_cpu 的一半
# 但由于 GIL，两个线程只能轮流执行，耗时接近串行
t1.join()
t2.join()
thread_cpu = time.time() - start
print(f"  多线程耗时: {thread_cpu:.3f}s")

if thread_cpu >= serial_cpu * 0.7:
    print("  >>> 多线程没有加速！GIL 让两个线程只能轮流执行")
else:
    print("  >>> 这次略快（受系统调度影响），但远没达到 2 倍提速")
print()

# ============================================================
# 实验2：I/O 密集型任务 —— 多线程有效（I/O 释放 GIL）
# ============================================================
def io_task(name, seconds):
    """模拟 I/O 操作：sleep 期间释放 GIL，其他线程可以运行"""
    time.sleep(seconds)                    # sleep 释放 GIL！
    print(f"  [{name}] 完成")

print("=" * 55)
print("实验2：I/O 密集型任务（I/O 释放 GIL）")
print("=" * 55)

# 串行执行三次
start = time.time()
io_task("串行-1", 0.3)
io_task("串行-2", 0.3)
io_task("串行-3", 0.3)
serial_io = time.time() - start
print(f"  串行耗时:   {serial_io:.3f}s\\n")

# 多线程执行三次
start = time.time()
threads = []
for i in range(3):
    t = threading.Thread(target=io_task, args=(f"线程-{i+1}", 0.3))
    threads.append(t)
    t.start()
for t in threads:
    t.join()
thread_io = time.time() - start
print(f"  多线程耗时: {thread_io:.3f}s")

if thread_io < serial_io * 0.7:
    print("  >>> 多线程有效加速！I/O 释放 GIL，三个任务重叠等待")
else:
    print("  >>> 多线程没加速（异常情况）")
print()

# ============================================================
# 总结对比
# ============================================================
print("=" * 55)
print("总结对比")
print("=" * 55)
print(f"  CPU 密集型: 串行={serial_cpu:.3f}s, 多线程={thread_cpu:.3f}s")
print(f"  I/O 密集型: 串行={serial_io:.3f}s, 多线程={thread_io:.3f}s")
print()
print("结论：")
print("  • CPU 密集型: GIL 锁死，多线程无法利用多核，甚至更慢")
print("    → 想加速必须用 multiprocessing（多进程，每个进程独立 GIL）")
print("  • I/O 密集型: I/O 阻塞时释放 GIL，多线程能有效加速")
print("    → 用 threading 或 asyncio 都可以")
print()
print("日常开发选择：")
print("  • 网络请求/文件读写/数据库 → threading 或 asyncio")
print("  • 大量计算/加密/图像处理  → multiprocessing")
print("  • 混合型 → I/O 用线程，计算部分用进程")`,
  },

  // -----------------------------------------------------------
  // 第 2 章：多线程/多进程/asyncio 怎么选
  // -----------------------------------------------------------
  {
    id: "pyint-concurrency",
    group: "GIL 与并发",
    icon: "🌐",
    title: "多线程/多进程/asyncio 怎么选",
    content: `## Python 的三种并发模型

Python 提供了三种主要的并发方式，各有适用场景：

| 模型 | 模块 | 原理 | 适用场景 |
|------|------|------|---------|
| **多线程** | \`threading\` | 多个线程交替执行 | I/O 密集型 |
| **多进程** | \`multiprocessing\` | 多个进程真正并行 | CPU 密集型 |
| **异步** | \`asyncio\` | 单线程事件循环 | 高并发 I/O |

## threading：多线程

\`threading\` 创建多个线程，线程间共享内存，受 GIL 限制。

\`\`\`python
import threading  # 导入模块 threading

def task(name):  # 定义函数 task，参数：name
    print(f"任务 {name}")  # 打印输出到屏幕

# 创建并启动线程
t = threading.Thread(target=task, args=("A",))  # 赋值变量 t
t.start()  # 调用 t.start()：启动
t.join()   # 等待完成
\`\`\`

**优点**：
- 创建开销小（KB 级）
- 共享内存，通信方便（直接读写变量）
- I/O 操作释放 GIL，I/O 密集型有效

**缺点**：
- CPU 密集型受 GIL 限制，无法多核并行
- 共享数据需要加锁，容易出 bug
- 线程太多时切换开销大

## multiprocessing：多进程

\`multiprocessing\` 创建多个进程，每个进程有独立的 Python 解释器和 GIL，能真正并行。

\`\`\`python
import multiprocessing as mp  # 导入模块 multiprocessing

def task(name):  # 定义函数 task，参数：name
    print(f"任务 {name}")  # 打印输出到屏幕

# 创建并启动进程
p = mp.Process(target=task, args=("A",))  # 赋值变量 p
p.start()  # 调用 p.start()：启动
p.join()   # 等待完成
\`\`\`

**优点**：
- 绕过 GIL，真正利用多核 CPU
- 进程间内存隔离，更安全
- CPU 密集型任务能加速 N 倍（N = 核心数）

**缺点**：
- 创建开销大（MB 级，要复制整个解释器）
- 内存占用高（每个进程独立内存空间）
- 进程间通信麻烦（需用 Queue/Pipe/共享内存）

## asyncio：异步 I/O

\`asyncio\` 用单线程 + 事件循环实现并发，**协程**在 I/O 等待时切换。

\`\`\`python
import asyncio  # 导入模块 asyncio

async def task(name):  # 定义协程函数
    await asyncio.sleep(0.5)  # 非阻塞等待
    print(f"任务 {name}")

async def main():
    # 并发执行多个协程
    await asyncio.gather(task("A"), task("B"), task("C"))

asyncio.run(main())  # 启动事件循环
\`\`\`

**优点**：
- 单线程，无需加锁
- 协程切换开销极小（远小于线程）
- 轻松支持上万并发连接
- 内存占用低

**缺点**：
- 需要 \`async\`/\`await\` 改造代码
- 不能调用阻塞函数（如 \`time.sleep\`、\`requests.get\`）
- 生态依赖（需要异步版本的库）

## 三者对比表

| 维度 | threading | multiprocessing | asyncio |
|------|-----------|-----------------|---------|
| **并行能力** | 受 GIL 限制 | ✅ 真正并行 | 单线程，无并行 |
| **创建开销** | 小（KB） | 大（MB） | 极小（协程） |
| **内存占用** | 共享 | 独立（高） | 最低 |
| **通信方式** | 共享变量 | Queue/Pipe | asyncio.Queue |
| **数据同步** | 需要加锁 | 天然隔离 | 不需要（单线程） |
| **CPU 密集型** | ❌ 无效 | ✅ 有效 | ❌ 无效 |
| **I/O 密集型** | ✅ 有效 | ✅ 但开销大 | ✅ 最有效 |
| **高并发** | 几百个 | 几十个 | 上万个 |
| **学习成本** | 中等 | 中等 | 较高 |
| **生态兼容** | 好（所有库） | 好 | 需要异步库 |

## 各自的代价

### 多线程的代价

1. **线程切换开销**：操作系统调度，每次切换需要保存/恢复上下文
2. **共享数据同步**：多线程读写同一变量需要加锁，容易死锁
3. **GIL 限制**：CPU 密集型无法多核并行

\`\`\`python
# 多线程的典型问题：竞态条件
import threading  # 导入模块 threading

count = 0  # 定义数值 count
def add():  # 定义函数 add
    global count  # 声明全局变量 count
    for _ in range(100000):
        count += 1     # 非原子操作！多线程同时执行会丢失更新

threads = [threading.Thread(target=add) for _ in range(5)]  # 赋值变量 threads
for t in threads: t.start()  # 遍历 threads，取值给 t
for t in threads: t.join()  # 遍历 threads，取值给 t
print(count)  # 期望 500000，实际可能小于 500000
\`\`\`

### 多进程的代价

1. **进程创建开销**：启动一个进程需要复制解释器，比线程慢 100 倍
2. **内存占用**：每个进程独立内存空间，开销大
3. **通信复杂**：进程间不共享内存，需用 Queue/Pipe/共享内存

### asyncio 的代价

1. **代码改造**：所有 I/O 函数都要改成 \`async def\`
2. **阻塞函数禁忌**：调用 \`time.sleep\` 会卡住整个事件循环
3. **生态依赖**：需要异步版本的库（\`aiohttp\` 而非 \`requests\`）

## 为什么多进程能绕过 GIL

每个进程有**独立的 Python 解释器**，自然有**独立的 GIL**：

\`\`\`
进程1: [Python解释器1] [GIL1] → 线程在核1跑
进程2: [Python解释器2] [GIL2] → 线程在核2跑
进程3: [Python解释器3] [GIL3] → 线程在核3跑

→ 3个进程各有各的 GIL，互不干扰
→ 操作系统把3个进程分配到3个核，真正并行！
\`\`\`

代价是：每个进程占独立内存（几十 MB 起），进程间通信要走 IPC。

## asyncio 的核心：事件循环 + 协程

\`\`\`
事件循环（Event Loop）
  │
  ├── 注册协程1 → 执行到 await（I/O等待）→ 挂起
  ├── 注册协程2 → 执行到 await → 挂起
  ├── 注册协程3 → 执行到 await → 挂起
  │
  ├── 某个协程的 I/O 完成了 → 唤醒它继续执行
  ├── 又一个协程的 I/O 完成了 → 唤醒它
  │
  → 单线程内轮流执行协程，I/O 等待时切换
  → 不需要多线程，没有 GIL 问题，没有锁
\`\`\`

| 概念 | 说明 |
|------|------|
| **事件循环** | 调度器，负责管理和切换协程 |
| **协程** | 用 \`async def\` 定义的函数，可暂停（\`await\`）和恢复 |
| **await** | 暂停当前协程，交出控制权给事件循环 |
| **gather** | 并发执行多个协程，等全部完成 |

## 选择决策树

根据任务类型选择合适的并发模型：

\`\`\`
你的任务是什么？
│
├── CPU 密集型（大量计算）
│   └── → multiprocessing
│       （多进程，绕过 GIL，真正并行）
│
├── I/O 密集型
│   ├── 并发量小（几十个）
│   │   └── → threading
│   │       （简单直接，兼容性好）
│   │
│   └── 并发量大（上百到上万）
│       └── → asyncio
│           （轻量高效，但需改造代码）
│
└── 混合型
    ├── I/O 部分 → threading 或 asyncio
    └── 计算部分 → multiprocessing
\`\`\`

## 日常开发启示

1. **先判断任务类型**：CPU 密集还是 I/O 密集
2. **CPU 密集型** → \`multiprocessing\`，能用多核
3. **I/O 密集型** → \`threading\`（简单）或 \`asyncio\`（高并发）
4. **不要盲目用多线程做计算**：GIL 限制，反而更慢
5. **asyncio 适合 Web 服务器**：高并发连接，如 \`aiohttp\`、\`FastAPI\`
6. **多进程注意开销**：进程池 \`Pool\` 比反复创建/销毁进程高效

下面用三种方式实现同一个 I/O 任务，对比耗时差异。`,
    code: `# 第二章代码：三种并发模型对比
# 用 threading、multiprocessing、asyncio 三种方式
# 执行同一个 I/O 任务（sleep 0.5 秒 × 3 个），对比耗时

import time
import threading
import multiprocessing as mp
import asyncio

def io_task(name):
    """模拟 I/O 任务：sleep 0.5 秒
    在真实程序中，这里可能是：
      - requests.get() 发网络请求
      - open().read() 读文件
      - 数据库查询
    这些操作都会释放 GIL，让其他线程运行
    """
    time.sleep(0.5)
    print(f"  [{name}] 完成")

# ============================================================
# 方式1：串行执行（基准）
# ============================================================
print("=" * 55)
print("方式1：串行执行")
print("=" * 55)
start = time.time()
io_task("任务1")
io_task("任务2")
io_task("任务3")
serial_time = time.time() - start
print(f"  耗时: {serial_time:.3f}s\\n")

# ============================================================
# 方式2：多线程 (threading)
# ============================================================
print("=" * 55)
print("方式2：多线程 (threading)")
print("=" * 55)
start = time.time()
threads = []
for i in range(3):
    # threading.Thread 创建线程对象
    # target 指定线程执行的函数，args 传参数（必须是元组）
    t = threading.Thread(target=io_task, args=(f"任务{i+1}",))
    threads.append(t)
    t.start()                                # start() 启动线程
for t in threads:
    t.join()                                 # join() 等待线程结束
thread_time = time.time() - start
print(f"  耗时: {thread_time:.3f}s\\n")

# ============================================================
# 方式3：多进程 (multiprocessing)
# ============================================================
print("=" * 55)
print("方式3：多进程 (multiprocessing)")
print("=" * 55)
try:
    # fork 启动方式：子进程继承父进程内存，创建较快
    # 在 macOS/Linux 上可用，spawn 方式更安全但慢
    ctx = mp.get_context("fork")
    start = time.time()
    procs = []
    for i in range(3):
        p = ctx.Process(target=io_task, args=(f"任务{i+1}",))
        procs.append(p)
        p.start()                            # start() 启动进程
    for p in procs:
        p.join()                             # join() 等待进程结束
    proc_time = time.time() - start
    print(f"  耗时: {proc_time:.3f}s\\n")
except Exception as e:
    print(f"  多进程出错: {e}")
    proc_time = -1
    print()

# ============================================================
# 方式4：异步 (asyncio)
# ============================================================
print("=" * 55)
print("方式4：异步 (asyncio)")
print("=" * 55)

# async def 定义协程函数
async def aio_task(name):
    """异步 I/O 任务
    注意：必须用 asyncio.sleep()，不能用 time.sleep()
    time.sleep() 是阻塞的，会卡住整个事件循环！
    asyncio.sleep() 是非阻塞的，会释放控制权给事件循环
    """
    await asyncio.sleep(0.5)                  # 非阻塞等待
    print(f"  [{name}] 完成")

async def main():
    # asyncio.gather() 并发执行多个协程
    # 相当于"同时启动三个任务，等它们全部完成"
    await asyncio.gather(
        aio_task("任务1"),
        aio_task("任务2"),
        aio_task("任务3")
    )

start = time.time()
# asyncio.run() 创建事件循环并运行协程
asyncio.run(main())
aio_time = time.time() - start
print(f"  耗时: {aio_time:.3f}s\\n")

# ============================================================
# 总结对比
# ============================================================
print("=" * 55)
print("总结对比")
print("=" * 55)
print(f"  串行:         {serial_time:.3f}s")
print(f"  多线程:       {thread_time:.3f}s")
if proc_time > 0:
    print(f"  多进程:       {proc_time:.3f}s")
print(f"  asyncio:      {aio_time:.3f}s")
print()
print("分析：")
print("  • 串行最慢：三个任务依次执行，总耗时 = 0.5 × 3 = 1.5s")
print("  • 多线程快：I/O 释放 GIL，三个 sleep 重叠，耗时 ≈ 0.5s")
print("  • 多进程也快：每个进程独立，真正并行，但有进程创建开销")
print("  • asyncio 最快：协程切换开销最小，单线程无需锁")
print()
print("适用场景：")
print("  • I/O 密集型 + 少量并发   → threading（简单直接）")
print("  • I/O 密集型 + 大量并发   → asyncio（高并发首选）")
print("  • CPU 密集型              → multiprocessing（绕开 GIL）")
print("  • 需要兼容同步库          → threading（asyncio 需要异步库）")`,
  },

  // -----------------------------------------------------------
  // 第 3 章：import 机制原理
  // -----------------------------------------------------------
  {
    id: "pyint-import",
    group: "性能与导入",
    icon: "📥",
    title: "import 机制原理",
    content: `## import 语句的背后

当你写 \`import os\` 时，Python 做了很多事：

\`\`\`python
import os  # 导入模块 os
\`\`\`

这简单的一行，背后经历了**五个步骤**：查找 → 加载 → 编译 → 执行 → 缓存。

## import 的五个步骤

### 完整流程图

\`\`\`
import my_module
       │
       ▼
┌───────────────────┐
│ 1. 检查 sys.modules │ ──── 已加载过？─── 是 ──→ 直接返回缓存
└───────────────────┘                      │
       │ 否                                │
       ▼                                  │
┌───────────────────┐                     │
│ 2. 查找器 Finder   │ ──── 找到模块文件？── 否 → ImportError
│   遍历 sys.meta_path│                    │
└───────────────────┘                      │
       │ 是                                │
       ▼                                  │
┌───────────────────┐                     │
│ 3. 加载器 Loader   │                     │
│   创建模块对象       │                     │
└───────────────────┘                     │
       │                                  │
       ▼                                  │
┌───────────────────┐                     │
│ 4. 执行模块顶层代码 │ ──── 执行 .py 文件 ──┘
│   （编译为字节码）   │
└───────────────────┘
       │
       ▼
┌───────────────────┐
│ 5. 加入 sys.modules │ ──── 缓存，下次直接返回
└───────────────────┘
       │
       ▼
   返回模块对象
\`\`\`

### 第1步：检查 sys.modules 缓存

Python 维护了一个字典 \`sys.modules\`，记录所有已加载的模块。import 时**先查缓存**：

\`\`\`python
import sys  # 导入模块 sys

# sys.modules 是一个字典
print(type(sys.modules))  # <class 'dict'>

# 检查某个模块是否已加载
print('os' in sys.modules)  # True（os 已被加载）

# 直接从缓存获取模块对象
os_mod = sys.modules['os']
\`\`\`

> 这就是为什么重复 \`import\` 不会重新加载——直接从缓存返回。

### 第2步：用查找器（Finder）找模块

如果缓存中没有，Python 遍历 \`sys.meta_path\` 中的查找器：

\`\`\`python
import sys  # 导入模块 sys

# sys.meta_path 是查找器列表
for finder in sys.meta_path:
    print(finder.__name__)   # sys.meta_path 中是类对象，用 __name__ 取类名
# 输出：
#   BuiltinImporter       ← 查找内置模块（如 sys、math）
#   FrozenImporter        ← 查找冻结模块
#   PathFinder            ← 查找文件系统中的模块（.py 文件）
\`\`\`

| 查找器 | 负责找什么 |
|--------|-----------|
| \`BuiltinImporter\` | 内置模块（\`sys\`、\`math\`、\`time\` 等） |
| \`FrozenImporter\` | 冻结模块（编译打包的模块） |
| \`PathFinder\` | 文件系统中的模块（\`.py\` 文件） |

\`PathFinder\` 会遍历 \`sys.path\` 中的目录，找 \`my_module.py\`。

### 第3步：用加载器（Loader）加载

找到模块后，查找器返回一个**模块规格**（ModuleSpec），加载器根据它创建模块对象：

\`\`\`python
import importlib.util  # 导入模块 importlib.util

# 手动查找模块
spec = importlib.util.find_spec('json')
print(type(spec))  # <class 'importlib.machinery.ModuleSpec'>
print(spec.name)    # json
print(spec.loader)  # 加载器对象
\`\`\`

### 第4步：执行模块顶层代码

加载器创建模块对象后，**执行模块的顶层代码**（模块里所有不在函数/类中的代码）：

\`\`\`python
# my_module.py 的内容
print("这行会执行！")        # 顶层代码，import 时执行

def func():                   # 定义函数，不执行
    print("调用时才执行")

x = 100                       # 顶层代码，import 时执行
\`\`\`

> 这就是为什么 \`import\` 时会看到模块的 print 输出。

### 第5步：加入 sys.modules

模块加载完成后，加入 \`sys.modules\` 缓存，下次 import 直接返回。

\`\`\`python
import sys  # 导入模块 sys

# 第一次 import 会执行模块代码并缓存
import json  # 执行 json 模块顶层代码

# 第二次 import 直接从缓存返回，不执行代码
import json  # 什么都不打印（已缓存）
\`\`\`

## sys.modules：模块缓存

\`sys.modules\` 是一个字典，键是模块名，值是模块对象：

\`\`\`python
import sys  # 导入模块 sys

# 查看已加载的模块数量
print(len(sys.modules))  # 几百个

# 查看某个模块对象
print(sys.modules['os'])  # <module 'os' from '/usr/lib/python3.x/os.py'>

# 查看模块的文件路径
print(sys.modules['os'].__file__)
\`\`\`

| 操作 | 代码 |
|------|------|
| 检查是否已加载 | \`'json' in sys.modules\` |
| 获取模块对象 | \`sys.modules['json']\` |
| 查看模块文件 | \`mod.__file__\` |
| 查看模块名 | \`mod.__name__\` |
| 查看模块包 | \`mod.__package__\` |

## sys.path：模块搜索路径

\`PathFinder\` 在这些目录中查找模块：

\`\`\`python
import sys  # 导入模块 sys

for path in sys.path:
    print(path)
# 输出示例：
#   /home/user/project      ← 当前目录
#   /usr/lib/python3.x      ← 标准库
#   /usr/lib/python3.x/lib  ← 标准库
#   /home/user/.local/lib   ← 第三方库
\`\`\`

| 路径来源 | 说明 |
|---------|------|
| 当前目录 | 脚本所在目录（最优先） |
| \`PYTHONPATH\` | 环境变量指定的目录 |
| 标准库目录 | Python 自带模块 |
| \`site-packages\` | pip 安装的第三方包 |

> ⚠️ **常见坑**：自己的文件名叫 \`math.py\`，\`import math\` 会导入你的文件而不是标准库！

## .pyc 缓存：编译后的字节码

Python 第一次 import \`.py\` 文件时，会编译成字节码并缓存为 \`.pyc\` 文件：

\`\`\`
my_module.py  ──编译──→  __pycache__/my_module.cpython-311.pyc
                            ↑ 缓存，下次直接加载
\`\`\`

| 文件 | 内容 | 作用 |
|------|------|------|
| \`.py\` | 源代码 | 人可读 |
| \`.pyc\` | 字节码 | 加速加载（跳过编译） |

下次 import 时，Python 检查 \`.py\` 的修改时间：
- \`.py\` 没改过 → 直接加载 \`.pyc\`（快）
- \`.py\` 改过 → 重新编译，更新 \`.pyc\`

## import 的开销

一次 import 的开销包括：

| 开销 | 说明 |
|------|------|
| 磁盘 I/O | 读取 \`.py\` 文件 |
| 编译 | 源码 → 字节码（首次） |
| 执行 | 运行模块顶层代码 |
| 缓存查找 | 查 \`sys.modules\`（很快） |

> 第一次 import 最慢（要编译+执行），后续 import 很快（缓存命中）。

## 循环导入为什么出问题

**循环导入**：模块 A import 模块 B，模块 B 又 import 模块 A。

\`\`\`
模块 A (mod_a.py)          模块 B (mod_b.py)
┌─────────────────┐       ┌─────────────────┐
│ import mod_b     │──→    │ import mod_a     │──→  mod_a 只加载了一半！
│ value_a = 100   │       │ value_b = 200   │     value_a 还没定义
│ print(mod_b.xxx)│←──     │ print(mod_a.xxx)│←──  AttributeError!
└─────────────────┘       └─────────────────┘
\`\`\`

**问题流程**：
1. \`import mod_a\` → 开始加载 mod_a
2. mod_a 第1行 \`import mod_b\` → 开始加载 mod_b
3. mod_b 第1行 \`import mod_a\` → mod_a 在 sys.modules 中（但只加载了一半！）
4. mod_b 访问 \`mod_a.value_a\` → **还没定义** → \`AttributeError\`

**解决方案**：

| 方案 | 说明 |
|------|------|
| **延迟导入** | 把 import 放到函数内部，用到时才导入 |
| **重构结构** | 把共享代码提取到第三个模块 |
| **调整导入顺序** | 在 import 之前先定义好需要的变量 |

\`\`\`python
# 方案：延迟导入
# mod_a.py
value_a = 100
def get_b():
    import mod_b      # 用到时才导入，此时 mod_a 已加载完
    return mod_b.value_b
\`\`\`

## importlib.import_module() 动态导入

用字符串动态导入模块：

\`\`\`python
import importlib  # 导入模块 importlib

# 动态导入（等价于 import math）
math_mod = importlib.import_module('math')
print(math_mod.sqrt(16))  # 4.0

# 导入子模块（等价于 from os import path）
os_path = importlib.import_module('os.path')
print(os_path.join('a', 'b'))  # a/b
\`\`\`

| 场景 | 用法 |
|------|------|
| 插件系统 | 根据配置字符串加载不同模块 |
| 延迟加载 | 用到时才导入，加快启动速度 |
| 条件导入 | 根据环境导入不同实现 |

## 日常开发启示

1. **避免循环导入**：合理规划模块结构，或用延迟导入
2. **不要用标准库名做文件名**：如 \`math.py\`、\`time.py\` 会覆盖标准库
3. **用 importlib 做插件**：动态加载，灵活扩展
4. **\`.pyc\` 缓存自动管理**：不需要手动清理，除非遇到诡异 bug
5. **首次 import 有开销**：启动慢可能是 import 太多，可用 \`python -X importtime\` 分析
6. **大量 import 影响启动速度**：考虑延迟导入或按需加载

下面用代码探索 import 的各个组件。`,
    code: `# 第三章代码：探索 import 机制
# 查看 sys.modules、sys.meta_path、sys.path
# 演示 importlib 动态导入和循环导入问题

import sys
import importlib
import os
import tempfile

# ============================================================
# 1. sys.modules：已加载模块的缓存字典
# ============================================================
print("=" * 55)
print("1. sys.modules：模块缓存")
print("=" * 55)
print(f"  类型: {type(sys.modules).__name__}")
print(f"  已加载模块数: {len(sys.modules)}")
print()

# 检查常见模块是否已加载
print("  常见模块是否在缓存中：")
for mod_name in ['os', 'sys', 'time', 'json', 'math']:
    # 'os' in sys.modules 检查是否已加载
    loaded = mod_name in sys.modules
    print(f"    '{mod_name}': {loaded}")
print()

# 看看模块对象的属性
os_mod = sys.modules['os']
print(f"  os 模块对象: {os_mod}")
print(f"  os.__file__: {os_mod.__file__}")
print(f"  os.__name__: {os_mod.__name__}")
print()

# ============================================================
# 2. sys.meta_path：查找器列表
# ============================================================
print("=" * 55)
print("2. sys.meta_path：模块查找器")
print("=" * 55)
print(f"  查找器数量: {len(sys.meta_path)}")
print()
for i, finder in enumerate(sys.meta_path):
    # sys.meta_path 中存的是类对象，用 __name__ 取类名
    name = getattr(finder, '__name__', type(finder).__name__)
    print(f"  [{i}] {name}")
print()
print("  说明：")
print("    BuiltinImporter → 查找内置模块（sys、math、time 等）")
print("    FrozenImporter  → 查找冻结模块")
print("    PathFinder      → 查找文件系统中的 .py 文件")
print()

# ============================================================
# 3. sys.path：模块搜索路径
# ============================================================
print("=" * 55)
print("3. sys.path：模块搜索路径")
print("=" * 55)
print(f"  共 {len(sys.path)} 条路径：")
for i, path in enumerate(sys.path[:5]):
    # 只显示前 5 条路径
    print(f"  [{i}] {path}")
if len(sys.path) > 5:
    print(f"  ... 还有 {len(sys.path) - 5} 条")
print()

# ============================================================
# 4. importlib.import_module：动态导入
# ============================================================
print("=" * 55)
print("4. importlib.import_module：动态导入")
print("=" * 55)

# 用字符串动态导入 math 模块（等价于 import math）
math_mod = importlib.import_module('math')
print(f"  动态导入 math: {math_mod}")
print(f"  math.sqrt(16) = {math_mod.sqrt(16)}")

# 动态导入子模块（等价于 from os import path）
os_path = importlib.import_module('os.path')
print(f"  动态导入 os.path: {os_path}")
print(f"  os.path.join('a', 'b') = {os_path.join('a', 'b')}")
print()

# ============================================================
# 5. import 缓存机制：重复 import 不会重新加载
# ============================================================
print("=" * 55)
print("5. import 缓存机制验证")
print("=" * 55)

# 第一次 import（json 已在缓存中，直接返回）
import json
json_mod1 = sys.modules['json']

# 第二次 import，仍然从缓存返回同一个对象
import json
json_mod2 = sys.modules['json']

# is 判断是否是同一个对象
print(f"  两次 import json 是同一个对象: {json_mod1 is json_mod2}")
print(f"  → 重复 import 不会重新加载，直接从缓存返回")
print()

# ============================================================
# 6. 循环导入问题演示
# ============================================================
print("=" * 55)
print("6. 循环导入问题演示")
print("=" * 55)

# 创建临时模块目录
tmpdir = tempfile.mkdtemp()
# 把临时目录加入搜索路径，让 Python 能找到模块
sys.path.insert(0, tmpdir)

# 写入有循环依赖的模块（问题版本）
# mod_a.py: import mod_b → mod_b.py: import mod_a → 访问 mod_a.value_a（未定义）
with open(os.path.join(tmpdir, 'circ_a.py'), 'w') as f:
    f.write(
        'import circ_b\\n'
        'value_a = 100\\n'
        'print("  circ_a: 加载完成, value_b =", circ_b.value_b)\\n'
    )

with open(os.path.join(tmpdir, 'circ_b.py'), 'w') as f:
    f.write(
        'import circ_a\\n'
        'value_b = 200\\n'
        'print("  circ_b: 加载完成, value_a =", circ_a.value_a)\\n'
    )

print("  尝试导入有循环依赖的模块 circ_a...")
try:
    import circ_a
    print("  竟然成功了？（不应该发生）")
except AttributeError as e:
    print(f"  循环导入失败: {e}")
    print("  原因: circ_a 还没执行到 value_a=100，circ_b 就去访问 circ_a.value_a")
print()

# 清理缓存，准备测试修复版本
for mod_name in ['circ_a', 'circ_b']:
    if mod_name in sys.modules:
        del sys.modules[mod_name]

# 写入修复版本：延迟导入（把 import 放到函数里）
print("  --- 修复方案：延迟导入（函数内 import）---")
with open(os.path.join(tmpdir, 'circ_a.py'), 'w') as f:
    f.write(
        'value_a = 100\\n'
        'def get_b():\\n'
        '    import circ_b\\n'
        '    return circ_b.value_b\\n'
        'print("  circ_a: 加载完成, get_b() =", get_b())\\n'
    )

with open(os.path.join(tmpdir, 'circ_b.py'), 'w') as f:
    f.write(
        'import circ_a\\n'
        'value_b = 200\\n'
        'print("  circ_b: 加载完成, value_a =", circ_a.value_a)\\n'
    )

print("  尝试导入修复后的模块 circ_a...")
try:
    import circ_a
    print("  循环导入修复成功！")
except Exception as e:
    print(f"  仍然失败: {e}")
print()

# 清理：从缓存和搜索路径中移除临时模块
for mod_name in ['circ_a', 'circ_b']:
    if mod_name in sys.modules:
        del sys.modules[mod_name]
sys.path.remove(tmpdir)

# ============================================================
# 总结
# ============================================================
print("=" * 55)
print("总结")
print("=" * 55)
print("• import 五步: 查缓存 → 找模块 → 创建对象 → 执行代码 → 加入缓存")
print("• sys.modules: 所有已加载模块的字典（import 先查这里）")
print("• sys.meta_path: 查找器列表（决定怎么找模块）")
print("• sys.path: 模块搜索路径（决定去哪找）")
print("• importlib.import_module(): 用字符串动态导入模块")
print("• 循环导入要避免，或用延迟导入（函数内 import）解决")`,
  },

  // -----------------------------------------------------------
  // 第 4 章：Python 性能优化原理
  // -----------------------------------------------------------
  {
    id: "pyint-performance",
    group: "性能与导入",
    icon: "⚡",
    title: "Python 性能优化原理",
    content: `## Python 为什么慢？

Python 慢的根本原因有三个：

### 1. 解释执行（非编译）

Python 代码先编译成字节码，再由虚拟机逐条解释执行。每次执行都要"翻译"：

\`\`\`
C/C++:   源码 ──编译──→ 机器码 ──→ CPU 直接执行（快）
Python:  源码 ──编译──→ 字节码 ──→ 虚拟机解释 ──→ CPU（慢）
                                  ↑ 多了一层翻译
\`\`\`

### 2. 动态类型

Python 是动态类型语言，每次操作都要**运行时类型检查**：

\`\`\`python
# C 语言：编译时就知道 a 和 b 是 int，直接用 CPU 加法指令
int a = 1, b = 2;
int c = a + b;  // 一条 CPU 指令

# Python：运行时才知道类型，每次都要检查
a = 1
b = 2
c = a + b  # 要检查 a 和 b 的类型、是否支持 __add__、是否要类型转换
\`\`\`

### 3. 对象开销

Python 中**一切都是对象**，连整数都是对象：

\`\`\`python
# C 语言：int 占 4 字节
int a = 1;  // 4 bytes

# Python：int 是对象，占 28+ 字节
a = 1       # PyObject { 引用计数 + 类型指针 + 值 } ≈ 28 bytes
\`\`\`

| 数据 | C 语言 | Python |
|------|-------|--------|
| 整数 1 | 4 字节 | 28 字节 |
| 字符串 "hello" | 6 字节 | 50+ 字节 |
| 列表 [1,2,3] | 12 字节 | 100+ 字节 |

## 每条字节码的开销

Python 执行一条字节码，背后做了很多事：

\`\`\`
执行 c = a + b 这一条语句：

1. 查找变量 a → LOAD_NAME（在命名空间中查找）
2. 查找变量 b → LOAD_NAME
3. 检查 a 的类型 → 有 __add__ 方法吗？
4. 检查 b 的类型 → 需要类型转换吗？
5. 调用 __add__ 方法 → BINARY_ADD
6. 修改 a 和 b 的引用计数（+1 / -1）
7. 存储结果到 c → STORE_NAME
8. 检查线程切换（GIL 释放检查）

→ 一条"加法"在 Python 里是十几个步骤
→ 在 C 里就是一条 CPU 指令
\`\`\`

## 常见性能陷阱

### 陷阱1：字符串拼接用 +

字符串是不可变的，每次 \`+\` 都创建新字符串：

\`\`\`python
# 慢：每次 + 都复制整个字符串
s = ""
for i in range(1000):
    s += "a"    # O(n²)：复制越来越长的字符串

# 快：用 join 一次性拼接
s = "".join(["a"] * 1000)  # O(n)：只复制一次
\`\`\`

| 方式 | 时间复杂度 | 1000 个字符耗时 |
|------|-----------|----------------|
| \`s += "a"\` 循环 | O(n²) | 慢 |
| \`"".join(list)\` | O(n) | 快 10+ 倍 |

### 陷阱2：全局变量比局部变量慢

Python 访问局部变量用 \`LOAD_FAST\`（按索引），访问全局变量用 \`LOAD_GLOBAL\`（按名字查字典）：

\`\`\`python
g = 100  # 定义全局变量 g

def use_global():  # 定义函数 use_global
    total = 0
    for i in range(1000):
        total += g      # LOAD_GLOBAL：慢（每次查全局命名空间）

def use_local():  # 定义函数 use_local
    local = g           # 先缓存到局部变量
    total = 0
    for i in range(1000):
        total += local  # LOAD_FAST：快（按索引取）
\`\`\`

| 字节码 | 操作 | 速度 |
|--------|------|------|
| \`LOAD_FAST\` | 按索引取局部变量 | 快（数组访问） |
| \`LOAD_GLOBAL\` | 按名字查全局变量 | 慢（字典查找） |
| \`LOAD_ATTR\` | 查对象属性 | 更慢（\`__dict__\` 查找） |

### 陷阱3：属性访问 dot 比局部变量慢

\`\`\`python
class Counter:  # 定义类 Counter
    def __init__(self):  # 定义函数 __init__，参数：self
        self.count = 0

c = Counter()  # 赋值变量 c
# 慢：每次都要查 c.__dict__['count']
for i in range(1000):
    c.count += 1

# 快：缓存到局部变量
count = c.count
for i in range(1000):
    count += 1
c.count = count
\`\`\`

### 陷阱4：函数调用开销

Python 函数调用有开销（创建帧对象、参数传递、作用域查找）：

\`\`\`python
# 慢：循环内频繁调用小函数
def square(x):  # 定义函数 square，参数：x
    return x * x
result = [square(i) for i in range(1000)]

# 快：直接内联
result = [i * i for i in range(1000)]
\`\`\`

## 优化技巧表

| 技巧 | 慢写法 | 快写法 | 原理 |
|------|--------|--------|------|
| 字符串拼接 | \`s += "a"\` | \`"".join(list)\` | 避免重复复制 |
| 列表构建 | for + append | 列表推导 | C 层优化 |
| 成员检查 | \`x in list\` | \`x in set\` | O(n) → O(1) |
| 变量访问 | 全局变量 | 局部变量 | LOAD_GLOBAL → LOAD_FAST |
| 属性访问 | \`obj.attr\` 循环内 | 缓存到局部变量 | 减少字典查找 |
| 内置函数 | 自己写循环 | \`sum()\`/\`max()\`/\`sorted()\` | C 实现 |
| 字符串格式 | \`"a" + str(x)\` | f-string | 减少对象创建 |

## 用内置函数（C 实现）

Python 内置函数是用 C 写的，比 Python 循环快得多：

\`\`\`python
# 慢：Python 循环求和
total = 0
for i in range(1000000):
    total += i

# 快：内置 sum（C 实现）
total = sum(range(1000000))  # 快 5-10 倍
\`\`\`

| 内置函数 | 作用 | 比循环快 |
|---------|------|---------|
| \`sum()\` | 求和 | 5-10x |
| \`max()\` / \`min()\` | 最大/最小 | 5-10x |
| \`sorted()\` | 排序 | 10x+ |
| \`map()\` / \`filter()\` | 映射/过滤 | 2-3x |
| \`any()\` / \`all()\` | 任一/全部 | 5x |

## 用列表/字典推导代替 for 循环

推导式在 C 层面执行，比 for 循环 + append 快：

\`\`\`python
# 慢：for 循环 + append
result = []
for i in range(1000):
    result.append(i * 2)

# 快：列表推导
result = [i * 2 for i in range(1000)]  # 快 30-50%
\`\`\`

## 用集合代替列表做成员检查

\`in list\` 是 O(n)（遍历），\`in set\` 是 O(1)（哈希）：

\`\`\`python
data = list(range(10000))
data_set = set(data)

# 慢：O(n)，要遍历整个列表
print(9999 in data)        # ~10000 次比较

# 快：O(1)，哈希查找
print(9999 in data_set)    # 1 次哈希计算
\`\`\`

| 操作 | list | set | dict |
|------|------|-----|------|
| \`x in container\` | O(n) | O(1) | O(1) |
| 添加元素 | O(1) | O(1) | O(1) |
| 删除元素 | O(n) | O(1) | O(1) |
| 遍历 | O(n) | O(n) | O(n) |

## 用 __slots__ 减少实例内存

默认情况下，Python 对象用 \`__dict__\` 存属性，内存开销大。用 \`__slots__\` 可以固定属性列表，节省内存：

\`\`\`python
# 默认：有 __dict__，内存大
class Point:  # 定义类 Point
    pass
p = Point()
p.x = 1
p.y = 2
p.z = 3  # 可以随意加属性

# 用 __slots__：固定属性，内存小
class SlotPoint:  # 定义类 SlotPoint
    __slots__ = ('x', 'y')  # 只允许 x 和 y 两个属性
p = SlotPoint()
p.x = 1
p.y = 2
# p.z = 3  # 报错！不允许加 __slots__ 外的属性
\`\`\`

| 方式 | 内存/实例 | 属性访问 | 能否动态加属性 |
|------|----------|---------|-------------|
| 默认（\`__dict__\`） | 大 | 稍慢 | ✅ 可以 |
| \`__slots__\` | 小 30-50% | 稍快 | ❌ 不可以 |

## 时间复杂度速查表

| 操作 | list | dict | set |
|------|------|------|-----|
| 索引访问 \`x[i]\` | O(1) | — | — |
| 按键取值 \`d[k]\` | — | O(1) | — |
| 成员检查 \`x in c\` | O(n) | O(1) | O(1) |
| 追加 \`append\` | O(1) | — | — |
| 插入 \`insert(0, x)\` | O(n) | — | — |
| 删除 \`remove\` / \`del\` | O(n) | O(1) | O(1) |
| 遍历 | O(n) | O(n) | O(n) |
| 排序 \`sorted\` | O(n log n) | — | — |

## 什么时候该用 C 扩展 / Cython / PyPy

| 方案 | 适用场景 | 加速倍数 | 代价 |
|------|---------|---------|------|
| **内置函数** | 求和/排序/查找 | 5-10x | 无 |
| **NumPy** | 数值计算 | 10-100x | 需学 NumPy API |
| **Cython** | 热点函数优化 | 10-100x | 需编译，学习成本 |
| **C 扩展** | 极致性能 | 50-100x | 开发复杂 |
| **PyPy** | 整体加速 | 3-5x | 兼容性问题 |

## profiling 工具

### cProfile：找性能瓶颈

\`\`\`python
import cProfile  # 导入模块 cProfile

def slow_func():  # 定义函数 slow_func
    total = sum(range(1000000))

# 分析函数耗时
cProfile.run('slow_func()')
\`\`\`

输出每个函数的调用次数和耗时，帮你找到**最慢的函数**。

### timeit：精确测量小代码片段

\`\`\`python
import timeit  # 导入模块 timeit

# 测量两种写法的耗时
t1 = timeit.timeit('"-".join(str(i) for i in range(100))', number=10000)
t2 = timeit.timeit('"-".join([str(i) for i in range(100)]), number=10000)
print(t1, t2)  # 第二种更快
\`\`\`

## 日常开发启示

1. **先测再优化**：用 cProfile 找到瓶颈，不要盲目优化
2. **不要过早优化**："过早优化是万恶之源"——先写对，再写快
3. **用内置函数**：\`sum()\`、\`max()\`、\`sorted()\` 是 C 实现的，优先用
4. **用推导式**：列表/字典/集合推导比 for 循环快
5. **成员检查用 set**：大量数据时 \`in set\` 比 \`in list\` 快很多
6. **缓存热点变量**：循环内频繁访问的全局/属性，先存到局部变量
7. **80/20 法则**：80% 的时间花在 20% 的代码上，优化这 20% 就够了

下面用代码验证各种优化技巧的效果。`,
    code: `# 第四章代码：Python 性能优化演示
# 用 timeit 对比各种写法的性能差异
# 用 dis 查看字节码差异，用 cProfile 分析函数耗时

import timeit
import dis
import cProfile
import pstats
from io import StringIO

# ============================================================
# 1. 字符串拼接：+ vs join
# ============================================================
print("=" * 55)
print("1. 字符串拼接：+ vs join")
print("=" * 55)

def concat_plus():
    """用 + 拼接字符串：每次 + 都创建新字符串，O(n²)"""
    s = ""
    for i in range(300):
        s += "a"                         # 每次都要复制整个字符串
    return s

def concat_join():
    """用 join 拼接：一次性拼接，O(n)"""
    return "".join(["a"] * 300)            # 只复制一次

# timeit.timeit 精确测量函数执行时间
# number=1000 表示执行 1000 次取总时间
t1 = timeit.timeit(concat_plus, number=1000)
t2 = timeit.timeit(concat_join, number=1000)
print(f"  + 拼接:   {t1:.4f}s")
print(f"  join:     {t2:.4f}s")
print(f"  join 比 + 快 {t1/t2:.1f} 倍")
print()

# ============================================================
# 2. for 循环 vs 列表推导
# ============================================================
print("=" * 55)
print("2. for 循环 vs 列表推导")
print("=" * 55)

def for_loop():
    """用 for 循环 + append 构建列表"""
    result = []
    for i in range(1000):
        result.append(i * 2)              # 每次 append 都有函数调用开销
    return result

def list_comp():
    """用列表推导：在 C 层面执行，无函数调用开销"""
    return [i * 2 for i in range(1000)]

t3 = timeit.timeit(for_loop, number=2000)
t4 = timeit.timeit(list_comp, number=2000)
print(f"  for 循环:    {t3:.4f}s")
print(f"  列表推导:    {t4:.4f}s")
speedup = (t3 - t4) / t3 * 100
print(f"  列表推导快 {speedup:.1f}%")
print()

# ============================================================
# 3. 全局变量 vs 局部变量
# ============================================================
print("=" * 55)
print("3. 全局变量 vs 局部变量")
print("=" * 55)

g_var = 100  # 全局变量

def access_global():
    """循环内访问全局变量：每次用 LOAD_GLOBAL（字典查找）"""
    total = 0
    for i in range(1000):
        total += g_var                    # LOAD_GLOBAL：慢
    return total

def access_local():
    """先缓存到局部变量：循环内用 LOAD_FAST（数组访问）"""
    local_var = g_var                     # 先把全局变量缓存到局部
    total = 0
    for i in range(1000):
        total += local_var                # LOAD_FAST：快
    return total

t5 = timeit.timeit(access_global, number=2000)
t6 = timeit.timeit(access_local, number=2000)
print(f"  访问全局变量: {t5:.4f}s")
print(f"  访问局部变量: {t6:.4f}s")
print(f"  局部变量快 {t5/t6:.1f} 倍")
print()

# 用 dis 查看字节码差异（直观看到 LOAD_GLOBAL vs LOAD_FAST）
print("  --- access_global 字节码（注意 LOAD_GLOBAL）---")
dis.dis(access_global)
print()
print("  --- access_local 字节码（注意 LOAD_FAST）---")
dis.dis(access_local)
print()

# ============================================================
# 4. 成员检查：list vs set
# ============================================================
print("=" * 55)
print("4. 成员检查：list vs set")
print("=" * 55)

# 创建包含 1000 个元素的列表和集合
big_list = list(range(1000))
big_set = set(range(1000))

def check_list():
    """在列表中查找：O(n)，要遍历"""
    return 999 in big_list               # 最坏情况：遍历 1000 个元素

def check_set():
    """在集合中查找：O(1)，哈希查找"""
    return 999 in big_set                # 一次哈希计算即可

t7 = timeit.timeit(check_list, number=10000)
t8 = timeit.timeit(check_set, number=10000)
print(f"  list 成员检查: {t7:.4f}s  (O(n))")
print(f"  set 成员检查:  {t8:.4f}s  (O(1))")
print(f"  set 快 {t7/t8:.0f} 倍")
print()

# ============================================================
# 5. 内置函数 vs 手写循环
# ============================================================
print("=" * 55)
print("5. 内置函数 vs 手写循环")
print("=" * 55)

def manual_sum():
    """手写循环求和"""
    total = 0
    for i in range(10000):
        total += i
    return total

def builtin_sum():
    """用内置 sum（C 实现）"""
    return sum(range(10000))

t9 = timeit.timeit(manual_sum, number=1000)
t10 = timeit.timeit(builtin_sum, number=1000)
print(f"  手写循环:  {t9:.4f}s")
print(f"  内置 sum:  {t10:.4f}s")
print(f"  内置函数快 {t9/t10:.1f} 倍")
print()

# ============================================================
# 6. cProfile 性能分析
# ============================================================
print("=" * 55)
print("6. cProfile 性能分析")
print("=" * 55)

def slow_function():
    """慢函数：用循环累加"""
    total = 0
    for i in range(50000):
        total += i
    return total

def fast_function():
    """快函数：用内置 sum"""
    return sum(range(50000))

def run_all():
    """模拟一个程序：调用多个函数"""
    for _ in range(30):
        slow_function()                   # 慢函数
        fast_function()                   # 快函数

# 用 cProfile 分析 run_all 的耗时
profiler = cProfile.Profile()
profiler.enable()                         # 开始分析
run_all()
profiler.disable()                        # 停止分析

# 输出分析结果（按总耗时排序，只显示前 5 个）
s = StringIO()
ps = pstats.Stats(profiler, stream=s).sort_stats('tottime')
ps.print_stats(5)
print(s.getvalue())

# ============================================================
# 总结
# ============================================================
print("=" * 55)
print("总结")
print("=" * 55)
print("优化技巧：")
print("  • 字符串拼接用 join，不用 + 循环")
print("  • 列表构建用推导式，不用 for + append")
print("  • 循环内的全局变量/属性，先缓存到局部变量")
print("  • 成员检查用 set，不用 list（O(1) vs O(n)）")
print("  • 优先用内置函数（sum/max/min/sorted，C 实现）")
print()
print("分析方法：")
print("  • timeit：精确测量小代码片段的耗时")
print("  • cProfile：分析整个程序，找最慢的函数")
print("  • dis：查看字节码，理解底层差异")
print()
print("原则：")
print("  • 先测再优化（用 cProfile 找瓶颈）")
print("  • 不要过早优化（先写对，再写快）")
print("  • 80/20 法则（80% 时间花在 20% 代码上）")`,
  },
];
