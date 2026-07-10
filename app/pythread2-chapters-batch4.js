// =============================================================
// Python 多线程入门（pythread2）—— 第四批章节
// -------------------------------------------------------------
// 章节 16-20：Barrier / Queue / threadlocal / 线程池 / 实战
// =============================================================
//
// 每个章节包含：
//   id      : 唯一标识
//   group   : 分组名（线程同步 / 线程通信 / 线程池 / 实战案例）
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解（含表格、代码块、列表、比喻）
//   code    : 可运行、带详细中文注释的 Python 示例代码
//
// 代码运行环境约束：
//   - 用 python3 直接运行，10 秒超时
//   - 仅使用 Python 标准库（threading, queue, concurrent.futures, time, random）
//   - 通过 print 输出结果
//   - 代码必须是单文件可独立运行的脚本
// =============================================================

export const chapters = [
  // =========================================================
  // 第十六章：Barrier 栅栏
  // =========================================================
  {
    id: "py2-16",
    group: "线程同步",
    icon: "🚧",
    title: "Barrier 栅栏：等多线程到齐",
    content: `## 一、什么是 Barrier（栅栏）

\`Barrier\` 翻译过来就是"栅栏"、"障碍物"。它的作用非常形象：**让多个线程在某个点集合，等所有人到齐后再一起继续往下走**。

### 生活比喻

想象公司组织团建去爬山：

1. 大家从不同地点出发，到达山脚下的集合点时间不一样。
2. 先到的人**必须在集合点等着**，不能自己先上山。
3. 等**所有人都到了**，大家再一起开始爬。

\`Barrier\` 就是这个"集合点"。先到的线程阻塞等待，直到所有线程都调用了 \`wait()\`，才一起放行。

\`\`\`text
线程1 ──┐
线程2 ──┼──→ Barrier（5人集合点）──→ 一起继续
线程3 ──┤
线程4 ──┤
线程5 ──┘
\`\`\`

## 二、基本用法

\`\`\`python
from threading import Barrier

# 创建一个 3 个线程的栅栏
barrier = Barrier(3)

def worker():
    # 每个线程到达这里会阻塞，直到 3 个线程都调用了 wait()
    barrier.wait()
    # 3 个线程一起继续往下执行

\`\`\`

### 核心方法

| 方法 | 说明 |
|------|------|
| \`Barrier(n)\` | 创建一个需要 n 个线程到齐的栅栏 |
| \`wait(timeout=None)\` | 当前线程到达栅栏并等待，返回 0~n-1 的编号 |
| \`reset()\` | 重置栅栏到初始状态（已在 wait 的线程会收到 BrokenBarrierError） |
| \`abort()\` | 把栅栏设为破损状态，所有 wait 的线程立即抛 BrokenBarrierError |

\`wait()\` 的返回值很有用：它返回当前线程是第几个到达栅栏的（从 0 开始）。最后一个到达的线程返回 \`n-1\`，可以用来做"放行前的准备工作"。

## 三、与 Join 的区别

初学者容易把 \`Barrier\` 和 \`join()\` 搞混，它们的"等"方向完全不同：

| 比较项 | \`join()\` | \`Barrier\` |
|--------|-----------|-------------|
| 谁等谁 | 主线程等子线程结束 | 子线程**互相**等到齐 |
| 等什么 | 等子线程**完全执行完** | 等所有线程**到达某个点** |
| 之后做什么 | 主线程继续 | 所有线程**一起继续** |
| 典型场景 | 收集子线程结果 | 多线程同步开始/同步推进 |

简单记：**join 是"等死"，Barrier 是"等齐"**。

\`\`\`text
join 模式：               Barrier 模式：
主线程                    线程A ─┐
  │                       线程B ─┼─→ 一起继续
  ├─ 子线程1 ──→ 结束      线程C ─┘
  ├─ 子线程2 ──→ 结束
  └─ join 等所有子线程结束
\`\`\`

## 四、典型应用场景

### 1. 赛跑式启动

多个线程需要"同时"开始干活，避免有的先跑有的后跑。

\`\`\`python
from threading import Barrier
barrier = Barrier(3)
def runner():
    barrier.wait()   # 都到齐了再跑
    print("起跑！")
\`\`\`

### 2. 多阶段任务同步

任务分多个阶段，每个阶段所有线程都要完成后才能进入下一阶段。

\`\`\`text
阶段1 → Barrier → 阶段2 → Barrier → 阶段3
\`\`\`

比如数据处理的"读取→处理→写入"三阶段，每个阶段所有线程同步推进。

### 3. 并行计算同步

矩阵运算中，先各自算一部分，同步后再合并，再算下一轮。

## 五、timeout 与 BrokenBarrierError

\`wait()\` 可以设置 \`timeout\`：

\`\`\`python
barrier.wait(timeout=2.0)   # 最多等 2 秒
\`\`\`

如果超时仍有线程没到齐，栅栏会进入"破损"状态：

- 正在 wait 的所有线程抛出 \`BrokenBarrierError\`。
- 后续调用 \`wait()\` 也会立即抛错。
- 需要调用 \`reset()\` 才能恢复。

这能防止"某个线程挂了导致大家死等"的情况。

### 为什么需要破损机制？

假设 5 个线程约好在栅栏集合，但其中 1 个线程因为异常永远来不了。如果没有破损机制，另外 4 个线程会**永远阻塞**下去——这就是死锁。BrokenBarrierError 让大家能感知到问题并退出。

## 六、本章 demo 说明

**demo1**：3 个线程模拟赛跑，全部就绪后同时起跑。你会看到 3 个线程先后到达起跑线（间隔约 1 秒），然后**几乎同时**打印"起跑"。

**demo2**：3 个线程完成阶段 1 后同步，再一起进入阶段 2。每个阶段都有 Barrier 拦截，你会看到清晰的"阶段式推进"输出，每个阶段所有线程一起跳到下一阶段。

## 七、运行结果预期

demo1 大致输出：

\`\`\`text
[选手1] 已就绪，等待发令
[选手2] 已就绪，等待发令
[选手3] 已就绪，等待发令
[选手1] 起跑！
[选手3] 起跑！
[选手2] 起跑！
\`\`\`

注意：3 个"起跑"几乎在同一时刻打印，因为它们是被 Barrier 同时放行的。

demo2 大致输出：

\`\`\`text
[阶段1] 线程A 完成
[阶段1] 线程B 完成
[阶段1] 线程C 完成
=== 所有线程完成阶段1，进入阶段2 ===
[阶段2] 线程A 完成
[阶段2] 线程B 完成
[阶段2] 线程C 完成
=== 所有线程完成阶段2 ===
\`\`\`

你会看到阶段 1 全部完成后，所有线程才一起进入阶段 2，这就是 Barrier 的同步效果。`,
    code: `# -*- coding: utf-8 -*-
# 第十六章演示代码：Barrier 栅栏
# demo1: 3 个线程模拟赛跑，全部就绪后同时起跑
# demo2: 3 个线程多阶段任务同步
import threading
import time
import random

print("=" * 60)
print("Barrier 栅栏演示")
print("=" * 60)

# ========================================================
# demo1：3 个选手赛跑，全部就绪后同时起跑
# ========================================================
print("\\n【demo1】赛跑式启动：3 个选手全部就绪后同时起跑")

# 创建一个 3 个线程的栅栏
barrier = threading.Barrier(3)


def runner(name):
    # 模拟选手走到起跑线的时间（随机 0~2 秒）
    time.sleep(random.uniform(0, 2))
    print(f"[{name}] 已就绪，等待发令")
    # 到达栅栏，阻塞等待，直到 3 个线程都调用 wait()
    barrier.wait()
    # 3 个线程一起被放行，几乎同时打印"起跑"
    print(f"[{name}] 起跑！")


# 启动 3 个选手线程
threads = []
for i in range(1, 4):
    t = threading.Thread(target=runner, args=(f"选手{i}",))
    threads.append(t)
    t.start()

for t in threads:
    t.join()

print("→ 3 个选手几乎同时起跑，因为 Barrier 让它们等齐了")

# ========================================================
# demo2：多阶段任务同步
# ========================================================
print("\\n【demo2】多阶段任务：3 个线程每个阶段都同步")

# 两个阶段的栅栏，每个阶段都需要 3 个线程到齐
barrier_phase1 = threading.Barrier(3)   # 阶段1的栅栏
barrier_phase2 = threading.Barrier(3)   # 阶段2的栅栏


def worker(name):
    # 阶段 1：每个线程做自己的工作
    time.sleep(random.uniform(0, 1))
    print(f"[阶段1] {name} 完成")
    # 在阶段1的栅栏处等齐，所有线程到齐后才能进入阶段2
    barrier_phase1.wait()
    # 所有线程一起进入阶段 2
    time.sleep(random.uniform(0, 1))
    print(f"[阶段2] {name} 完成")
    # 在阶段2的栅栏处等齐
    # wait() 返回 0~n-1，表示当前线程是第几个到达的，最后一个是 n-1
    num = barrier_phase2.wait()
    # 让最后一个到达的线程负责打印汇总信息
    if num == 2:
        print("=== 所有线程完成阶段2 ===")


# 启动 3 个工作线程
threads = []
for name in ["线程A", "线程B", "线程C"]:
    t = threading.Thread(target=worker, args=(name,))
    threads.append(t)
    t.start()

# 主线程用一个临时栅栏等待阶段1结束（用 barrier_phase1 的状态判断）
# 简单做法：主线程也 join 子线程
for t in threads:
    t.join()

print("\\n" + "=" * 60)
print("Barrier 核心要点：")
print("  1. Barrier(n) 创建 n 个线程的栅栏")
print("  2. wait() 阻塞，等所有线程到齐后一起放行")
print("  3. 与 join 不同：Barrier 是子线程互等，join 是主线程等子线程")
print("  4. wait(timeout=) 超时会触发 BrokenBarrierError")
print("=" * 60)
`,
  },

  // =========================================================
  // 第十七章：Queue 队列
  // =========================================================
  {
    id: "py2-17",
    group: "线程通信",
    icon: "📋",
    title: "Queue 队列：线程安全的通信",
    content: `## 一、为什么需要 Queue

多线程协作时，线程之间经常需要**传递数据**：生产者生产数据，消费者处理数据。如果直接用 \`list\` 共享数据：

\`\`\`python
# 危险写法：共享 list 不加锁
shared_list = []
# 线程A：shared_list.append(item)
# 线程B：shared_list.pop()
\`\`\`

\`list\` 的 \`append\` 和 \`pop\` 虽然单独是原子的，但组合起来不安全，而且没法优雅地"等待数据到来"。要正确做就得自己加 \`Lock\` + \`Condition\`，代码又长又容易出错。

\`queue.Queue\` 就是为解决这个问题而生：**它内部自带锁，所有操作都是线程安全的，开箱即用**。

### Queue 的优势

| 优势 | 说明 |
|------|------|
| **线程安全** | 内部自动加锁，无需手动同步 |
| **阻塞接口** | \`get()\` 没数据时自动等待，\`put()\` 满了自动等待 |
| **任务追踪** | \`task_done()\` + \`join()\` 自动跟踪任务完成情况 |
| **多种队列** | FIFO、LIFO、优先级三种队列满足不同需求 |

## 二、核心方法

### 常用方法表

| 方法 | 说明 |
|------|------|
| \`Queue(maxsize=0)\` | 创建队列，\`maxsize\` 限制最大容量（0=无限） |
| \`put(item, block=True, timeout=None)\` | 入队，满了会阻塞 |
| \`get(block=True, timeout=None)\` | 出队，空了会阻塞 |
| \`task_done()\` | 消费者取走并处理完一个元素后调用，标记任务完成 |
| \`join()\` | 阻塞直到队列中所有元素都被 \`task_done()\` |
| \`qsize()\` | 队列当前大小（不绝对准确） |
| \`empty()\` / \`full()\` | 是否空 / 是否满 |

### put 和 get 的阻塞行为

\`\`\`python
from queue import Queue
q = Queue(maxsize=2)

# 阻塞模式（默认）
q.put(item)        # 队列满了就等，直到有空位
q.get()            # 队列空了就等，直到有数据

# 非阻塞模式
q.put(item, block=False)   # 满了立即抛 queue.Full
q.get(block=False)         # 空了立即抛 queue.Empty

# 超时模式
q.put(item, timeout=2)     # 最多等 2 秒，超时抛 queue.Full
q.get(timeout=2)           # 最多等 2 秒，超时抛 queue.Empty
\`\`\`

### task_done 与 join 的配合

这是 Queue 最巧妙的设计：

- 生产者 \`put()\` 一个任务，未完成任务计数 +1。
- 消费者 \`get()\` 取出任务，处理完后调用 \`task_done()\`，计数 -1。
- 主线程调用 \`q.join()\`，会阻塞直到计数归零（所有任务都处理完了）。

\`\`\`text
put()  →  未完成 +1
get()  →  取出
task_done()  →  未完成 -1
join() →  等到未完成 = 0
\`\`\`

这样主线程就能精确知道"所有任务都被消费完了"，不用自己计数。

## 三、三种队列

Python 的 \`queue\` 模块提供三种队列：

| 类 | 出队顺序 | 用途 |
|----|----------|------|
| \`Queue\` | FIFO（先进先出） | 普通任务队列，公平处理 |
| \`LifoQueue\` | LIFO（后进先出） | 类似栈，处理最近任务 |
| \`PriorityQueue\` | 按优先级（小的先出） | 重要任务优先处理 |

\`\`\`python
from queue import Queue, LifoQueue, PriorityQueue

q1 = Queue()           # 先进先出
q2 = LifoQueue()       # 后进先出
q3 = PriorityQueue()   # 优先级队列
\`\`\`

### PriorityQueue 的元素要求

\`PriorityQueue\` 的元素必须是**可比较的元组** \`(priority, item)\`，按优先级从小到大出队：

\`\`\`python
from queue import PriorityQueue
pq = PriorityQueue()
pq.put((2, "普通任务"))
pq.put((1, "紧急任务"))
pq.put((3, "低优先级"))
pq.get()   # → (1, "紧急任务")，优先级数字小的先出
\`\`\`

注意：优先级数字**小**的先出（默认最小堆）。

## 四、经典模式：生产者-消费者

生产者-消费者是多线程最经典的协作模式：

\`\`\`text
生产者线程 ──→ [ Queue ] ──→ 消费者线程
  生产数据      缓冲区        处理数据
\`\`\`

### 用 Queue 实现的优势

对比之前用 \`Condition\` 实现的生产者-消费者，用 \`Queue\` 代码量少一半：

- 不用手动加锁（Queue 内部有锁）。
- 不用手动 \`notify\`/\`wait\`（\`put\`/\`get\` 自动阻塞）。
- 不用手动计数（\`task_done\`/\`join\` 自动跟踪）。

\`\`\`python
from queue import Queue
q = Queue()

def producer():
    for i in range(10):
        q.put(i)        # 生产
    q.put(None)         # 哨兵，通知消费者结束

def consumer():
    while True:
        item = q.get()  # 自动等待
        if item is None:
            break
        # 处理 item
        q.task_done()
\`\`\`

### 哨兵模式

消费者通常用 \`while True\` 死循环取数据，如何让它**优雅退出**？常见做法是放一个特殊值（哨兵）作为结束信号。比如 \`None\`、\`"STOP"\`、\`EOF\`。

多个消费者时，要给每个消费者都放一个哨兵。

## 五、阻塞 vs 非阻塞的选择

| 场景 | 推荐用法 |
|------|----------|
| 消费者等数据到来 | \`get()\` 阻塞（默认） |
| 想知道有没有数据，没有就跳过 | \`get(block=False)\` 捕获 \`Empty\` |
| 最多等一会儿 | \`get(timeout=2)\` |
| 控制生产速度（背压） | \`put()\` 队列满时阻塞 |

阻塞 \`get()\` 是最常用的：消费者线程启动后就 \`while True: q.get()\`，没数据就安静等着，不占 CPU。

## 六、本章 demo 说明

**demo1**：1 个生产者 + 2 个消费者用 \`Queue\` 实现。生产者生产 6 个任务，2 个消费者并行消费。你会看到生产者快速放入数据，消费者交替取出处理，最后主线程通过 \`join()\` 等到所有任务完成。

**demo2**：\`PriorityQueue\` 演示。往优先级队列里放 5 个不同优先级的任务，按优先级顺序取出。你会看到任务**不按放入顺序**，而是按优先级数字从小到大出队。

## 七、运行结果预期

demo1 大致输出：

\`\`\`text
[生产者] 放入任务0
[生产者] 放入任务1
[消费者1] 处理任务0
[消费者2] 处理任务1
[生产者] 放入任务2
...
[生产者] 放入结束信号
所有任务处理完成
\`\`\`

注意：生产者和消费者的输出会**交错**出现，因为它们并发执行。

demo2 大致输出：

\`\`\`text
放入: (优先级3, 写日志)
放入: (优先级1, 紧急报警)
放入: (优先级2, 发邮件)
放入: (优先级5, 清理临时文件)
放入: (优先级1, 系统告警)
取出: (优先级1, 紧急报警)   ← 优先级最高先出
取出: (优先级2, 发邮件)
取出: (优先级3, 写日志)
取出: (优先级5, 清理临时文件)
\`\`\`

可以看到，虽然"写日志"先放入，但"紧急报警"优先级更高（数字更小），所以先被取出。注意：当两个任务优先级相同时，\`PriorityQueue\` 会进一步比较元组的第二个元素（任务描述字符串）来决定顺序，所以同优先级的顺序不一定等于放入顺序。如果需要严格保证同优先级 FIFO，可以在元组里加一个自增计数器作为第二位：\`(priority, counter, item)\`。`,
    code: `# -*- coding: utf-8 -*-
# 第十七章演示代码：Queue 队列
# demo1: 生产者-消费者用 Queue 实现
# demo2: PriorityQueue 按优先级处理任务
import threading
import queue
import time
import random

print("=" * 60)
print("Queue 队列演示")
print("=" * 60)

# ========================================================
# demo1：生产者-消费者用 Queue 实现
# ========================================================
print("\\n【demo1】生产者-消费者模式（1 生产者 + 2 消费者）")

# 创建一个线程安全的队列，maxsize=10 限制最多放 10 个任务
task_queue = queue.Queue(maxsize=10)


def producer(name, count):
    """生产者：往队列里放 count 个任务"""
    for i in range(count):
        item = f"任务{i}"
        task_queue.put(item)   # 入队，队列满会自动阻塞
        print(f"[{name}] 放入 {item}（当前队列大小 {task_queue.qsize()}）")
        time.sleep(random.uniform(0, 0.3))   # 模拟生产耗时
    # 放入哨兵，每个消费者一个，通知它们结束
    for _ in range(2):
        task_queue.put(None)
    print(f"[{name}] 生产完毕，已放入结束信号")


def consumer(name):
    """消费者：从队列取任务处理"""
    while True:
        item = task_queue.get()   # 出队，队列空会自动阻塞
        if item is None:          # 收到结束信号
            print(f"[{name}] 收到结束信号，退出")
            task_queue.task_done()
            break
        print(f"[{name}] 处理 {item}")
        time.sleep(random.uniform(0.1, 0.5))   # 模拟处理耗时
        task_queue.task_done()   # 标记这个任务处理完成


# 启动 1 个生产者 + 2 个消费者
producer_thread = threading.Thread(target=producer, args=("生产者", 6))
consumer_threads = [
    threading.Thread(target=consumer, args=(f"消费者{i}",))
    for i in range(1, 3)
]

producer_thread.start()
for t in consumer_threads:
    t.start()

# 主线程等待生产者结束
producer_thread.join()
# 等待队列中所有任务被处理完（task_done 计数归零）
task_queue.join()
# 等待消费者退出
for t in consumer_threads:
    t.join()

print("→ 所有任务处理完成，生产者-消费者优雅退出")

# ========================================================
# demo2：PriorityQueue 按优先级处理任务
# ========================================================
print("\\n【demo2】PriorityQueue 优先级队列")

# 创建优先级队列
pq = queue.PriorityQueue()

# 放入 5 个任务，每个是 (优先级数字, 任务描述) 元组
# 优先级数字越小，优先级越高，越先出队
tasks = [
    (3, "写日志"),
    (1, "紧急报警"),
    (2, "发邮件"),
    (5, "清理临时文件"),
    (1, "系统告警"),
]

print("按随机顺序放入任务：")
for priority, desc in tasks:
    pq.put((priority, desc))
    print(f"  放入: (优先级{priority}, {desc})")

print("\\n按优先级顺序取出：")
while not pq.empty():
    priority, desc = pq.get()
    print(f"  取出: (优先级{priority}, {desc})")

print("→ 优先级数字小的先出；同优先级时按元组第二元素比较")

# 演示非阻塞 get 和超时 get
print("\\n【补充】非阻塞 get 与超时 get：")
empty_q = queue.Queue()
try:
    empty_q.get(block=False)   # 队列空，立即抛 Empty
except queue.Empty:
    print("  get(block=False) 队列空 → 抛 queue.Empty")

try:
    empty_q.get(timeout=0.5)   # 等 0.5 秒
except queue.Empty:
    print("  get(timeout=0.5) 超时 → 抛 queue.Empty")

print("\\n" + "=" * 60)
print("Queue 核心要点：")
print("  1. Queue 自带锁，线程安全，无需手动同步")
print("  2. put/get 默认阻塞，可设 block=False 或 timeout")
print("  3. task_done() + join() 自动跟踪任务完成")
print("  4. 三种队列：Queue(FIFO) / LifoQueue(LIFO) / PriorityQueue")
print("  5. 生产者-消费者模式是 Queue 最经典应用")
print("=" * 60)
`,
  },

  // =========================================================
  // 第十八章：全局变量共享与 threadlocal
  // =========================================================
  {
    id: "py2-18",
    group: "线程通信",
    icon: "🌐",
    title: "全局变量共享与 threadlocal",
    content: `## 一、多线程共享全局变量

Python 多线程的一个特点是：**同一个进程里的所有线程共享同一份全局变量**。这是双刃剑——既方便，又危险。

### 共享的便利

\`\`\`python
# 全局配置，所有线程都能读
CONFIG = {"host": "localhost", "port": 3306}

def worker():
    print(CONFIG["host"])   # 直接读，不用传参
\`\`\`

不用把配置一个个传给线程函数，全局变量直接可读，方便。

### 共享的危险

\`\`\`python
# 全局计数器
counter = 0

def increment():
    global counter
    for _ in range(100000):
        counter += 1   # 危险！这其实不是原子操作
\`\`\`

\`counter += 1\` 看起来是一行，实际是三步：读 counter、加 1、写回。多线程同时执行时，会互相覆盖，导致**结果小于预期**——这就是**竞态条件**（Race Condition）。

### 竞态条件回顾

\`\`\`text
线程A 读 counter = 0
                线程B 读 counter = 0
线程A 计算 0+1 = 1
                线程B 计算 0+1 = 1
线程A 写 counter = 1
                线程B 写 counter = 1
最终 counter = 1（应该是 2）
\`\`\`

两个线程各加一次，结果应该是 2，但因为读写交错，最终是 1。

## 二、为什么需要同步

解决竞态条件的根本办法是**加锁**，让"读-改-写"成为原子操作：

\`\`\`python
from threading import Lock

counter = 0
lock = Lock()

def increment():
    global counter
    for _ in range(100000):
        with lock:        # 加锁
            counter += 1  # 这段同一时刻只有一个线程执行
\`\`\`

加锁后结果正确，但代价是性能损失（线程串行执行临界区）。

### 共享 vs 同步的权衡

| 方式 | 优点 | 缺点 |
|------|------|------|
| 共享变量不加锁 | 快 | 数据错乱 |
| 共享变量加锁 | 正确 | 性能损失、可能死锁 |
| 不共享（threadlocal） | 无需锁、无线程冲突 | 不能跨线程传递 |

## 三、threadlocal：每个线程一份副本

有时候我们希望**每个线程有自己独立的一份变量**，互不干扰。这就是 \`threadlocal\` 的作用。

### 生活比喻

把全局变量想象成公司**公共会议室**：所有人共用，要预约（加锁）。
\`threadlocal\` 则是每个人**自己的工位**：不用预约，互不影响。

\`\`\`text
全局变量：    所有线程 → [同一份数据]  ← 需要加锁
threadlocal： 每个线程 → [自己独立的数据] ← 无需锁
\`\`\`

### threading.local() 的使用

\`\`\`python
import threading

# 创建一个 threadlocal 对象
local_data = threading.local()

def worker():
    # 每个线程看到的 local_data.value 是独立的
    local_data.value = threading.current_thread().name
    print(local_data.value)   # 自己设置的名字
\`\`\`

\`local_data\` 看起来是个全局对象，但**每个线程访问 \`local_data.value\` 看到的是自己独立的那份**。线程 A 设置的值，线程 B 看不到。

### 工作原理

\`threading.local()\` 内部维护一个字典，**以线程 ID 为 key**：

\`\`\`text
local_data.__dicts__ = {
    thread_id_A: {value: "A的值"},
    thread_id_B: {value: "B的值"},
}
\`\`\`

当线程访问 \`local_data.value\` 时，它会自动用当前线程的 ID 去查对应的字典。所以每个线程拿到的都是自己的那份。

## 四、典型应用场景

### 1. 数据库连接

每个线程维护自己的数据库连接，避免多线程共用一个连接出错。

\`\`\`python
import threading
local_conn = threading.local()

def get_conn():
    if not hasattr(local_conn, "conn"):
        local_conn.conn = create_connection()   # 每个线程独立创建
    return local_conn.conn
\`\`\`

### 2. 请求上下文

Web 框架里，每个请求在一个线程里处理，可以用 threadlocal 保存当前请求的用户、请求 ID 等。

\`\`\`python
import threading
local_ctx = threading.local()

def handle_request(request):
    local_ctx.user = request.user
    local_ctx.request_id = request.id
    # 后续调用任何函数都能从 local_ctx 拿到当前请求信息
\`\`\`

### 3. 用户身份

每个线程处理不同用户的请求，用 threadlocal 保存"当前线程在处理谁"。

### 4. 日志上下文

每个线程的日志带上自己的请求 ID，方便追踪。

## 五、threadlocal vs 全局变量

| 比较项 | 全局变量 + Lock | threadlocal |
|--------|----------------|-------------|
| 数据共享 | 所有线程共享一份 | 每个线程独立一份 |
| 同步 | 需要加锁 | 不需要锁 |
| 数据传递 | 自动（共享） | 不传递（线程隔离） |
| 适合场景 | 全局计数器、共享状态 | 线程私有资源（连接、上下文） |
| 生命周期 | 进程级 | 线程级 |

**简单原则**：

- 需要**所有线程汇总**的数据 → 全局变量 + 锁。
- 需要**每个线程独立**的数据 → threadlocal。

## 六、注意事项：内存泄漏风险

\`threadlocal\` 有个**坑**：线程结束后，它里面的数据**不会自动清理**。

### 为什么会泄漏？

在线程池场景下，线程是**复用**的，不会真正销毁。如果一个请求设置了 \`local_data.user = big_object\`，下个请求没清理，这个大对象就一直留着。线程池有几十个线程，每个都积攒一些，内存就慢慢涨上去了。

### 解决办法

1. **手动清理**：用完之后 \`del local_data.xxx\` 或 \`local_data.__dict__.clear()\`。
2. **try/finally**：确保异常情况下也清理。

\`\`\`python
def handle():
    try:
        local_data.user = load_user()
        do_work()
    finally:
        # 无论是否异常，都清理
        del local_data.user
\`\`\`

3. **避免存大对象**：threadlocal 只存必要的标识（如 user_id），需要时再加载。

## 七、本章 demo 说明

**demo1**：共享全局变量 + Lock 保护，模拟多线程累加。你会看到：不加锁时结果小于预期（竞态条件），加锁后结果正确。

**demo2**：用 threadlocal 为每个线程维护独立的"用户身份"。3 个线程各自设置自己的用户名，互相看不到对方的数据，演示线程隔离效果。

## 八、运行结果预期

demo1 大致输出：

\`\`\`text
不加锁，2 个线程各加 100000 次：
最终 counter = 134567（应为 200000，发生了竞态条件）

加锁，2 个线程各加 100000 次：
最终 counter = 200000（结果正确）
\`\`\`

不加锁的结果每次都不一样，且通常小于 200000——这就是竞态条件。加锁后结果总是 200000。

demo2 大致输出：

\`\`\`text
[线程A] 设置用户 = Alice
[线程B] 设置用户 = Bob
[线程C] 设置用户 = Charlie
[线程A] 我的用户 = Alice
[线程B] 我的用户 = Bob
[线程C] 我的用户 = Charlie
\`\`\`

每个线程看到的都是自己设置的用户名，互不干扰——这就是 threadlocal 的线程隔离效果。`,
    code: `# -*- coding: utf-8 -*-
# 第十八章演示代码：全局变量共享与 threadlocal
# demo1: 共享全局变量 + Lock 保护，模拟多线程累加
# demo2: 用 threadlocal 为每个线程维护独立的用户身份
import sys
import threading
import time

# 缩短 GIL 切换间隔，让竞态条件更容易出现（默认 5ms 太长，演示效果不明显）
# 这样线程切换更频繁，不加锁时的数据错乱更容易被观察到
sys.setswitchinterval(0.00005)

print("=" * 60)
print("全局变量共享与 threadlocal 演示")
print("=" * 60)

# ========================================================
# demo1：共享全局变量 + Lock 保护
# ========================================================
print("\\n【demo1】多线程累加：不加锁 vs 加锁")

# 不加锁的版本
counter_unsafe = 0


def increment_unsafe(n):
    """不加锁，会出现竞态条件
    故意拆成"读-改-写"三步，让竞态条件更容易出现
    （一行 counter += 1 也是非原子的，但拆开更容易触发）
    """
    global counter_unsafe
    for _ in range(n):
        current = counter_unsafe        # 步骤1：读当前值
        current = current + 1           # 步骤2：加 1
        counter_unsafe = current        # 步骤3：写回


# 加锁的版本
counter_safe = 0
lock = threading.Lock()


def increment_safe(n):
    """加锁，保证原子性"""
    global counter_safe
    for _ in range(n):
        with lock:             # 加锁
            counter_safe += 1  # 临界区，同一时刻只有一个线程执行


N = 100000   # 每个线程累加次数

# 测试不加锁
t1 = threading.Thread(target=increment_unsafe, args=(N,))
t2 = threading.Thread(target=increment_unsafe, args=(N,))
t1.start()
t2.start()
t1.join()
t2.join()
print(f"不加锁，2 个线程各加 {N} 次：")
print(f"  最终 counter = {counter_unsafe}（应为 {2*N}，发生了竞态条件）")

# 测试加锁
t1 = threading.Thread(target=increment_safe, args=(N,))
t2 = threading.Thread(target=increment_safe, args=(N,))
t1.start()
t2.start()
t1.join()
t2.join()
print(f"加锁，2 个线程各加 {N} 次：")
print(f"  最终 counter = {counter_safe}（结果正确）")

# ========================================================
# demo2：threadlocal 为每个线程维护独立用户身份
# ========================================================
print("\\n【demo2】threadlocal：每个线程独立的用户身份")

# 创建 threadlocal 对象
local_data = threading.local()


def worker(username):
    """每个线程设置自己的用户名，互不干扰"""
    # 每个线程看到的 local_data.user 是自己独立的那份
    local_data.user = username
    print(f"[{threading.current_thread().name}] 设置用户 = {local_data.user}")
    time.sleep(0.2)   # 让其他线程也设置好自己的值
    # 验证：每个线程看到的还是自己设置的用户名
    print(f"[{threading.current_thread().name}] 我的用户 = {local_data.user}")
    # 清理（防止线程池场景下的内存泄漏）
    try:
        del local_data.user
    except AttributeError:
        pass


# 启动 3 个线程，每个设置不同的用户名
threads = []
for name in ["Alice", "Bob", "Charlie"]:
    t = threading.Thread(target=worker, args=(name,), name=f"线程{name}")
    threads.append(t)
    t.start()

for t in threads:
    t.join()

print("→ 每个线程看到的都是自己设置的用户名，互不干扰")

# ========================================================
# 补充：threadlocal 在线程池中的内存泄漏演示
# ========================================================
print("\\n【补充】threadlocal 在线程池场景的清理：")
from concurrent.futures import ThreadPoolExecutor

local_ctx = threading.local()


def task_with_cleanup(task_id):
    """演示 try/finally 清理 threadlocal"""
    try:
        local_ctx.task_id = task_id
        # 模拟工作
        time.sleep(0.05)
        return f"任务{local_ctx.task_id} 完成"
    finally:
        # 关键：无论是否异常，都清理 threadlocal
        # 否则在线程池场景下，线程复用会导致数据残留
        if hasattr(local_ctx, "task_id"):
            del local_ctx.task_id


with ThreadPoolExecutor(max_workers=3) as executor:
    results = list(executor.map(task_with_cleanup, range(5)))
    for r in results:
        print(f"  {r}")

# 验证清理：所有线程结束后，threadlocal 应该是空的
print(f"  清理后 local_ctx 是否还有 task_id: {hasattr(local_ctx, 'task_id')}")

print("\\n" + "=" * 60)
print("threadlocal 核心要点：")
print("  1. 全局变量共享方便但危险，竞态条件需用 Lock 解决")
print("  2. threading.local() 让每个线程有独立的变量副本")
print("  3. 适合场景：数据库连接、请求上下文、用户身份")
print("  4. 注意：线程池场景必须手动清理，否则内存泄漏")
print("=" * 60)
`,
  },

  // =========================================================
  // 第十九章：ThreadPoolExecutor 线程池
  // =========================================================
  {
    id: "py2-19",
    group: "线程池",
    icon: "🏊",
    title: "ThreadPoolExecutor 线程池",
    content: `## 一、为什么需要线程池

前面我们创建线程都是 \`threading.Thread(...).start()\`，每次手动建线程。这种方式有几个问题：

### 手动建线程的痛点

1. **开销大**：每个线程创建、销毁都有系统开销，频繁创建很浪费。
2. **数量失控**：一下子开 1000 个线程，CPU 切换开销比干活还多，甚至把系统搞崩。
3. **管理麻烦**：要自己跟踪哪些线程还活着、结果怎么收集、异常怎么处理。

### 线程池的思路

\`\`\`text
传统：来一个任务 → 建一个线程 → 干完销毁
池化：预先建好 N 个线程 → 任务排队 → 线程复用
\`\`\`

**线程池**就像出租车公司：养一批车（线程）待命，来一个客人（任务）就派一辆车，干完车回来继续接下一单，而不是每次都买新车再报废。

### 线程池的优势

| 优势 | 说明 |
|------|------|
| **复用线程** | 避免频繁创建销毁的开销 |
| **控制并发数** | 限制最大线程数，防止资源耗尽 |
| **统一管理** | 提交任务、获取结果、异常处理都封装好 |
| **优雅退出** | 上下文管理器自动关闭池 |

## 二、ThreadPoolExecutor 基础

\`ThreadPoolExecutor\` 在 \`concurrent.futures\` 模块里，是 Python 官方推荐的线程池实现。

\`\`\`python
from concurrent.futures import ThreadPoolExecutor

# 创建一个最多 4 个线程的线程池
with ThreadPoolExecutor(max_workers=4) as executor:
    # 提交任务，自动调度到池里的线程执行
    future = executor.submit(my_func, arg1, arg2)
    result = future.result()
\`\`\`

### max_workers 怎么选？

\`max_workers\` 是池子里最多同时运行的线程数。常见选择：

| 任务类型 | 推荐 max_workers |
|----------|-----------------|
| CPU 密集 | 不超过 CPU 核心数（其实该用 ProcessPoolExecutor） |
| IO 密集 | CPU 核心数的 2~5 倍，或更高 |
| 混合 | 实测调优 |

Python 3.8+ 默认值是 \`min(32, os.cpu_count() + 4)\`，对大多数 IO 场景够用。

**关键**：线程数不是越多越好。线程太多会导致上下文切换开销大，反而变慢。

## 三、submit() 与 Future

\`submit()\` 是最常用的提交方式，它**立即返回一个 Future 对象**，代表"未来的结果"。

\`\`\`python
future = executor.submit(my_func, arg1)
# future 此刻可能还没结果，但承诺"以后会有"
result = future.result()   # 阻塞直到任务完成，拿到结果
\`\`\`

### Future 的常用方法

| 方法 | 说明 |
|------|------|
| \`result(timeout=None)\` | 阻塞获取结果，可设超时 |
| \`done()\` | 任务是否已完成（不阻塞） |
| \`cancelled()\` | 任务是否被取消 |
| \`cancel()\` | 尝试取消（未开始的才能取消） |
| \`exception()\` | 获取任务抛出的异常（没有则返回 None） |
| \`add_done_callback(fn)\` | 任务完成后回调 \`fn(future)\` |

\`\`\`python
future = executor.submit(do_something)

# 方式1：阻塞等结果
result = future.result()

# 方式2：轮询是否完成
while not future.done():
    time.sleep(0.1)
print(future.result())

# 方式3：回调
future.add_done_callback(lambda f: print("完成了:", f.result()))
\`\`\`

### result() 的超时与异常

- \`result(timeout=2)\`：最多等 2 秒，超时抛 \`TimeoutError\`。
- 如果任务里抛了异常，\`result()\` 会**重新抛出那个异常**，方便在主线程处理。

## 四、map() 批量提交

\`map()\` 一次性提交多个任务，**按提交顺序返回结果**：

\`\`\`python
urls = ["url1", "url2", "url3"]
results = executor.map(download, urls)
# results 是按顺序的迭代器
for r in results:
    print(r)
\`\`\`

\`map()\` 的特点：

- **顺序保证**：返回顺序和输入顺序一致，哪怕后提交的先完成。
- **简洁**：一行代码批量提交，比循环 \`submit()\` 简洁。
- **异常**：某个任务抛异常时，迭代到那个结果时才抛出。

## 五、as_completed()：谁完成谁返回

如果你**不想等慢任务拖累快任务**，想"谁完成就先处理谁"，用 \`as_completed()\`：

\`\`\`python
from concurrent.futures import as_completed

futures = [executor.submit(download, url) for url in urls]
# as_completed 返回一个迭代器，哪个 future 先完成就先 yield
for future in as_completed(futures):
    result = future.result()
    print(result)
\`\`\`

### map vs as_completed 对比

| 比较项 | \`map()\` | \`as_completed()\` |
|--------|----------|-------------------|
| 返回顺序 | 按提交顺序 | 按完成顺序 |
| 适合场景 | 顺序重要、批量处理 | 顺序无所谓、先到先处理 |
| 异常处理 | 迭代到时才抛 | 每个 future 独立处理 |
| 灵活性 | 简单 | 灵活 |

**选择建议**：

- 任务耗时差不多、需要按顺序拿结果 → \`map()\`。
- 任务耗时差异大、想尽快处理完成的 → \`as_completed()\`。

## 六、with 上下文管理器

强烈推荐用 \`with\` 语句：

\`\`\`python
from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor(max_workers=4) as executor:
    # 提交任务
    executor.submit(...)
    executor.submit(...)
# 离开 with 块时自动调用 executor.shutdown(wait=True)
# 会等所有任务完成才继续往下走
\`\`\`

如果不用 \`with\`，要手动调 \`shutdown()\`：

\`\`\`python
from concurrent.futures import ThreadPoolExecutor
executor = ThreadPoolExecutor(max_workers=4)
try:
    executor.submit(...)
finally:
    executor.shutdown(wait=True)
\`\`\`

## 七、常见模式

### 模式1：批量提交 + 收集结果

\`\`\`python
from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor(max_workers=8) as executor:
    futures = [executor.submit(process, item) for item in items]
    results = [f.result() for f in futures]
\`\`\`

### 模式2：先到先处理

\`\`\`python
from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor(max_workers=8) as executor:
    futures = {executor.submit(process, item): item for item in items}
    for future in as_completed(futures):
        item = futures[future]
        try:
            result = future.result()
            print(f"{item} → {result}")
        except Exception as e:
            print(f"{item} 失败: {e}")
\`\`\`

### 模式3：回调链

\`\`\`python
from concurrent.futures import ThreadPoolExecutor
def on_done(fut):
    print("完成:", fut.result())

with ThreadPoolExecutor() as executor:
    fut = executor.submit(do_work)
    fut.add_done_callback(on_done)
\`\`\`

## 八、本章 demo 说明

**demo1**：用 \`submit()\` 提交 3 个任务（每个模拟不同耗时），用 \`Future.result()\` 获取结果，演示 \`done()\`、\`add_done_callback()\` 的用法。你会看到 3 个任务并发执行，总耗时约等于最慢的那个任务。

**demo2**：用 \`map()\` 批量"下载"（用 sleep 模拟）5 个 URL，对比 \`as_completed()\` 的输出顺序。你会看到 \`map()\` 按提交顺序返回，而 \`as_completed()\` 按完成顺序返回。

## 九、运行结果预期

demo1 大致输出：

\`\`\`text
提交任务 task1（耗时 1.0 秒）
提交任务 task2（耗时 0.5 秒）
提交任务 task3（耗时 1.5 秒）
[回调] task2 完成，结果 = task2结果
[回调] task1 完成，结果 = task1结果
[回调] task3 完成，结果 = task3结果
所有任务完成，总耗时 1.5 秒
\`\`\`

注意：3 个任务并发，总耗时约等于最慢的 1.5 秒，而不是 1.0+0.5+1.5=3 秒。回调按完成顺序触发（task2 最先完成）。

demo2 大致输出：

\`\`\`text
=== map() 按 URL 顺序返回 ===
URL1 → URL1内容
URL2 → URL2内容
URL3 → URL3内容
URL4 → URL4内容
URL5 → URL5内容

=== as_completed() 按完成顺序返回 ===
URL2 → URL2内容   ← 耗时最短的最先完成
URL4 → URL4内容
URL1 → URL1内容
URL5 → URL5内容
URL3 → URL3内容   ← 耗时最长的最后完成
\`\`\`

\`map()\` 的输出顺序和提交顺序一致，\`as_completed()\` 则按完成快慢返回。`,
    code: `# -*- coding: utf-8 -*-
# 第十九章演示代码：ThreadPoolExecutor 线程池
# demo1: submit() + Future 获取结果
# demo2: map() vs as_completed() 对比
import threading
import time
import random
from concurrent.futures import ThreadPoolExecutor, as_completed

print("=" * 60)
print("ThreadPoolExecutor 线程池演示")
print("=" * 60)

# ========================================================
# demo1：submit() + Future
# ========================================================
print("\\n【demo1】submit() 提交任务，Future 获取结果")


def do_task(name, duration):
    """模拟一个耗时任务"""
    print(f"[{name}] 开始执行（耗时 {duration:.1f} 秒）")
    time.sleep(duration)
    return f"{name}结果"


def on_complete(future):
    """任务完成回调函数"""
    try:
        result = future.result()
        print(f"[回调] {result} 完成")
    except Exception as e:
        print(f"[回调] 任务失败: {e}")


# 创建线程池（最多 3 个线程）
with ThreadPoolExecutor(max_workers=3) as executor:
    # 提交 3 个任务，立即返回 Future 对象
    tasks = [
        ("task1", 1.0),
        ("task2", 0.5),
        ("task3", 1.5),
    ]
    futures = []
    for name, duration in tasks:
        fut = executor.submit(do_task, name, duration)
        # 注册回调，任务完成时自动调用
        fut.add_done_callback(on_complete)
        futures.append(fut)
        print(f"提交任务 {name}（耗时 {duration:.1f} 秒）")

    # 在任务执行过程中，可以检查是否完成
    time.sleep(0.3)
    for fut, (name, _) in zip(futures, tasks):
        print(f"  {name} 是否完成: {fut.done()}")

    # 阻塞等待所有结果
    start = time.time()
    results = [fut.result() for fut in futures]
    elapsed = time.time() - start
    print(f"所有任务完成，结果: {results}")
    print(f"总耗时: {elapsed:.2f} 秒（并发执行，约等于最慢任务的耗时）")

# ========================================================
# demo2：map() vs as_completed() 对比
# ========================================================
print("\\n【demo2】map() 批量下载 vs as_completed()")


def download(url):
    """模拟下载一个 URL，耗时随机"""
    duration = random.uniform(0.3, 1.2)
    time.sleep(duration)
    return f"{url}内容（耗时 {duration:.2f} 秒）"


urls = [f"URL{i}" for i in range(1, 6)]

# 方式1：map() 按提交顺序返回结果
print("=== map() 按 URL 顺序返回 ===")
with ThreadPoolExecutor(max_workers=5) as executor:
    # map 一次性提交所有任务，按输入顺序返回结果
    results = executor.map(download, urls)
    for url, result in zip(urls, results):
        print(f"  {url} → {result}")

# 方式2：as_completed() 谁完成谁返回
print("\\n=== as_completed() 按完成顺序返回 ===")
with ThreadPoolExecutor(max_workers=5) as executor:
    # 用列表推导提交所有任务
    future_to_url = {executor.submit(download, url): url for url in urls}
    # as_completed 返回的迭代器，哪个 future 先完成就先 yield
    for future in as_completed(future_to_url):
        url = future_to_url[future]
        try:
            result = future.result()
            print(f"  {url} → {result}")
        except Exception as e:
            print(f"  {url} 下载失败: {e}")

# ========================================================
# 补充：异常处理演示
# ========================================================
print("\\n【补充】任务异常处理：")


def risky_task(x):
    """可能抛异常的任务"""
    if x == 2:
        raise ValueError(f"任务 {x} 故意出错")
    time.sleep(0.1)
    return x * 10


with ThreadPoolExecutor(max_workers=3) as executor:
    futures = [executor.submit(risky_task, i) for i in range(4)]
    for fut in futures:
        try:
            # result() 会重新抛出任务里的异常
            result = fut.result()
            print(f"  任务成功: {result}")
        except ValueError as e:
            print(f"  任务异常: {e}")

print("\\n" + "=" * 60)
print("ThreadPoolExecutor 核心要点：")
print("  1. 线程池复用线程，避免频繁创建销毁")
print("  2. max_workers 控制并发数，防资源耗尽")
print("  3. submit() 返回 Future，可拿结果/查状态/加回调")
print("  4. map() 按提交顺序返回，as_completed() 按完成顺序返回")
print("  5. with 语句自动 shutdown，强烈推荐")
print("=" * 60)
`,
  },

  // =========================================================
  // 第二十章：实战：并发下载网页
  // =========================================================
  {
    id: "py2-20",
    group: "实战案例",
    icon: "🌐",
    title: "实战：并发下载网页",
    content: `## 一、需求分析

本章用一个完整实战收尾：**并发下载多个网页，对比串行 vs 并发的耗时差异**。

### 业务场景

爬虫、批量接口调用、日志采集……这类"IO 密集"任务非常多。它们的共同特点是：

- **单次耗时长**：每次请求要等网络响应，几百毫秒到几秒。
- **CPU 闲着**：等待期间 CPU 几乎不工作。
- **任务独立**：多个 URL 之间互不依赖。

这正是多线程的**主场**——IO 密集 + 任务独立 = 多线程完美场景。

### 为什么用线程而不是协程？

- 线程上手简单，标准库 \`ThreadPoolExecutor\` 几行代码搞定。
- 协程（asyncio）性能更好，但要改写函数为 \`async\`，学习成本高。
- 对于几十到几百个并发，线程池完全够用。

## 二、设计思路

\`\`\`text
URL 列表 → [下载函数] → 线程池并发执行 → 收集结果 → 统计耗时
\`\`\`

### 核心组件

1. **URL 列表**：要下载的网页地址列表。
2. **下载函数**：接收一个 URL，返回内容（这里用 \`time.sleep\` 模拟，避免真的发网络请求）。
3. **线程池**：\`ThreadPoolExecutor\` 并发执行下载函数。
4. **结果收集**：用 \`as_completed\` 谁完成谁收集。
5. **耗时统计**：记录开始和结束时间。

### 为什么用 time.sleep 模拟？

真实下载需要 \`requests\` 等第三方库，依赖网络环境，结果不稳定。本章聚焦**多线程并发**本身，所以用 \`time.sleep\` 模拟网络延迟：

- 每个网页"下载"耗时 0.8~1.2 秒，符合真实场景。
- 可重复运行，结果稳定。
- 你可以把 \`time.sleep\` 替换成真实的 \`requests.get(url).text\`，代码结构完全一样。

## 三、串行 vs 并发对比

### 串行下载

\`\`\`text
URL1 (1秒) → URL2 (1秒) → URL3 (1秒) → URL4 (1秒) → URL5 (1秒)
总耗时 = 1 + 1 + 1 + 1 + 1 = 5 秒
\`\`\`

一个接一个下载，总耗时是所有任务耗时**之和**。

### 并发下载

\`\`\`text
URL1 ─┐
URL2 ─┤
URL3 ─┼─→ 5 个线程同时跑 → 总耗时 ≈ 1 秒
URL4 ─┤
URL5 ─┘
总耗时 = max(1, 1, 1, 1, 1) = 1 秒
\`\`\`

5 个线程同时下载，总耗时约等于**最慢的那个任务**。

### 加速比

| 方式 | 5 个任务总耗时 | 加速比 |
|------|---------------|--------|
| 串行 | ~5 秒 | 1x |
| 并发（5 线程） | ~1 秒 | ~5x |

理论上 N 个任务并发能加速 N 倍。实际受 GIL、网络带宽、CPU 等限制，加速比会低一些，但 IO 密集任务通常能接近 N 倍。

## 四、实现步骤

### 步骤 1：定义下载函数

\`\`\`python
def download(url):
    start = time.time()
    time.sleep(random.uniform(0.8, 1.2))   # 模拟网络延迟
    elapsed = time.time() - start
    return {"url": url, "size": 1024, "time": elapsed}
\`\`\`

每个任务返回一个字典，包含 URL、内容大小、耗时，方便统计。

### 步骤 2：串行版本

\`\`\`python
def serial_download(urls):
    results = []
    for url in urls:
        results.append(download(url))
    return results
\`\`\`

简单的 for 循环，逐个下载。

### 步骤 3：并发版本

\`\`\`python
def concurrent_download(urls):
    results = []
    with ThreadPoolExecutor(max_workers=len(urls)) as executor:
        future_to_url = {executor.submit(download, url): url for url in urls}
        for future in as_completed(future_to_url):
            results.append(future.result())
    return results
\`\`\`

用 \`as_completed\` 谁完成谁收集，能尽快处理结果。

### 步骤 4：统计耗时

\`\`\`python
import time
start = time.time()
results = concurrent_download(urls)
elapsed = time.time() - start
print(f"并发下载 {len(urls)} 个网页，耗时 {elapsed:.2f} 秒")
\`\`\`

## 五、改进：错误处理与超时

### 错误处理

网络请求随时可能失败（超时、404、连接拒绝）。用 \`try/except\` 包住每个任务：

\`\`\`python
def download(url):
    try:
        # 真实场景：resp = requests.get(url, timeout=5)
        time.sleep(random.uniform(0.5, 1.5))
        if random.random() < 0.1:   # 模拟 10% 失败率
            raise ConnectionError(f"{url} 连接失败")
        return {"url": url, "status": "ok"}
    except Exception as e:
        return {"url": url, "status": "error", "error": str(e)}
\`\`\`

**关键原则**：任务函数**自己捕获异常**，不要让线程池里的任务挂掉。否则一个任务失败会影响其他任务的回收。

### 超时控制

\`\`\`python
# 给每个任务设超时
future.result(timeout=3)   # 最多等 3 秒
\`\`\`

超时会抛 \`TimeoutError\`，可以单独处理。

### 进度显示

\`\`\`python
from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor(max_workers=5) as executor:
    futures = [executor.submit(download, url) for url in urls]
    done_count = 0
    for future in as_completed(futures):
        done_count += 1
        print(f"进度: {done_count}/{len(urls)}")
\`\`\`

用 \`as_completed\` 的特性，每完成一个就更新进度，用户体验好。

## 六、实际项目建议

### 1. 用 requests + 线程池

\`\`\`python
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

def download(url):
    resp = requests.get(url, timeout=5)
    return {"url": url, "status": resp.status_code, "size": len(resp.content)}

with ThreadPoolExecutor(max_workers=10) as executor:
    futures = [executor.submit(download, url) for url in urls]
    for f in as_completed(futures):
        print(f.result())
\`\`\`

把本章的 \`time.sleep\` 换成 \`requests.get\` 就是真实可用的下载器。

### 2. 超高并发用 aiohttp

如果并发量到几百上千，线程切换开销变大，建议用协程：

\`\`\`python
import aiohttp
import asyncio

async def download(session, url):
    async with session.get(url) as resp:
        return await resp.text()

async def main(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [download(session, url) for url in urls]
        return await asyncio.gather(*tasks)
\`\`\`

协程性能更好，但代码风格要改成 \`async/await\`。

### 3. 限制并发数

无论线程还是协程，都要**限制并发数**，否则会：
- 把目标服务器打挂（被封 IP）。
- 自己机器资源耗尽（内存、文件描述符）。

用 \`max_workers\` 或 \`asyncio.Semaphore\` 控制。

### 4. 加重试机制

网络不稳定，失败的任务可以重试：

\`\`\`python
def download_with_retry(url, retries=3):
    for i in range(retries):
        try:
            return download(url)
        except Exception:
            if i == retries - 1:
                raise
            time.sleep(1)
\`\`\`

## 七、本章 demo 说明

**demo1**：串行下载 5 个网页（用 sleep 模拟），耗时约 5 秒。你会看到下载一个接一个进行，总耗时是各任务耗时之和。

**demo2**：用 \`ThreadPoolExecutor\` 并发下载同样的 5 个网页，耗时约 1 秒。你会看到 5 个任务几乎同时开始，总耗时约等于最慢的那个。

两个 demo 用同样的 URL 列表和同样的下载函数，方便对比。

## 八、运行结果预期

demo1 大致输出：

\`\`\`text
[串行] 开始下载 5 个网页
下载 URL1 完成（耗时 1.02 秒）
下载 URL2 完成（耗时 0.95 秒）
下载 URL3 完成（耗时 1.10 秒）
下载 URL4 完成（耗时 0.88 秒）
下载 URL5 完成（耗时 1.05 秒）
[串行] 总耗时 5.00 秒
\`\`\`

串行下载一个接一个，总耗时约 5 秒。

demo2 大致输出：

\`\`\`text
[并发] 开始下载 5 个网页（5 个线程）
下载 URL2 完成（耗时 0.95 秒）
下载 URL4 完成（耗时 0.88 秒）
下载 URL1 完成（耗时 1.02 秒）
下载 URL5 完成（耗时 1.05 秒）
下载 URL3 完成（耗时 1.10 秒）
[并发] 总耗时 1.12 秒
加速比: 4.46x
\`\`\`

并发下载几乎同时开始，完成顺序按各任务耗时（短的先完成），总耗时约等于最慢的 1.1 秒，加速比接近 5 倍。`,
    code: `# -*- coding: utf-8 -*-
# 第二十章演示代码：实战——并发下载网页
# demo1: 串行下载 5 个网页（模拟）
# demo2: 用 ThreadPoolExecutor 并发下载
import time
import random
from concurrent.futures import ThreadPoolExecutor, as_completed

print("=" * 60)
print("实战：并发下载网页演示")
print("=" * 60)

# 模拟要下载的 5 个网页
URLS = [f"http://example.com/page{i}" for i in range(1, 6)]


def download(url):
    """模拟下载一个网页
    真实场景下，把 time.sleep 换成 requests.get(url).text 即可
    """
    start = time.time()
    # 模拟网络延迟（0.8~1.2 秒，符合真实网页下载耗时）
    duration = random.uniform(0.8, 1.2)
    time.sleep(duration)
    elapsed = time.time() - start
    # 返回下载结果：URL、内容大小、耗时
    return {
        "url": url,
        "size": random.randint(50000, 200000),   # 模拟内容字节数
        "time": round(elapsed, 2),
    }


def serial_download(urls):
    """串行下载：一个接一个"""
    print(f"[串行] 开始下载 {len(urls)} 个网页")
    results = []
    total_start = time.time()
    for url in urls:
        result = download(url)
        print(f"  下载 {url} 完成（耗时 {result['time']:.2f} 秒，"
              f"大小 {result['size']} 字节）")
        results.append(result)
    total_elapsed = time.time() - total_start
    print(f"[串行] 总耗时 {total_elapsed:.2f} 秒")
    return total_elapsed


def concurrent_download(urls):
    """并发下载：用线程池同时下载"""
    print(f"\\n[并发] 开始下载 {len(urls)} 个网页（{len(urls)} 个线程）")
    results = []
    total_start = time.time()
    # 创建线程池，max_workers 等于 URL 数量
    with ThreadPoolExecutor(max_workers=len(urls)) as executor:
        # 提交所有下载任务，建立 future → url 的映射
        future_to_url = {
            executor.submit(download, url): url
            for url in urls
        }
        # as_completed 谁完成谁返回，可以尽快处理
        for future in as_completed(future_to_url):
            url = future_to_url[future]
            try:
                result = future.result()
                print(f"  下载 {url} 完成（耗时 {result['time']:.2f} 秒，"
                      f"大小 {result['size']} 字节）")
                results.append(result)
            except Exception as e:
                print(f"  下载 {url} 失败: {e}")
    total_elapsed = time.time() - total_start
    print(f"[并发] 总耗时 {total_elapsed:.2f} 秒")
    return total_elapsed


# ========================================================
# 运行对比
# ========================================================
random.seed(42)   # 固定随机种子，让结果可复现

# demo1：串行下载
print("\\n" + "=" * 50)
print("【demo1】串行下载")
print("=" * 50)
serial_time = serial_download(URLS)

# demo2：并发下载
print("\\n" + "=" * 50)
print("【demo2】并发下载")
print("=" * 50)
concurrent_time = concurrent_download(URLS)

# 对比结果
print("\\n" + "=" * 50)
print("【对比结果】")
print("=" * 50)
print(f"  串行下载耗时:  {serial_time:.2f} 秒")
print(f"  并发下载耗时:  {concurrent_time:.2f} 秒")
print(f"  加速比:        {serial_time / concurrent_time:.2f}x")
print(f"  提速:          {(1 - concurrent_time / serial_time) * 100:.1f}%")

# ========================================================
# 改进版：带错误处理和进度显示
# ========================================================
print("\\n" + "=" * 50)
print("【改进版】带错误处理和进度显示")
print("=" * 50)


def download_safe(url):
    """带错误处理的下载函数"""
    try:
        duration = random.uniform(0.8, 1.2)
        time.sleep(duration)
        # 模拟 10% 的失败率
        if random.random() < 0.1:
            raise ConnectionError(f"{url} 连接失败")
        return {"url": url, "status": "ok", "time": round(duration, 2)}
    except Exception as e:
        return {"url": url, "status": "error", "error": str(e)}


def concurrent_download_with_progress(urls, max_workers=5):
    """带进度显示的并发下载"""
    print(f"开始下载 {len(urls)} 个网页（并发数 {max_workers}）")
    start = time.time()
    success, failed = 0, 0
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(download_safe, url) for url in urls]
        done = 0
        for future in as_completed(futures):
            result = future.result()
            done += 1
            if result["status"] == "ok":
                success += 1
                print(f"  [{done}/{len(urls)}] ✓ {result['url']} "
                      f"（{result['time']} 秒）")
            else:
                failed += 1
                print(f"  [{done}/{len(urls)}] ✗ {result['url']} "
                      f"失败: {result['error']}")
    elapsed = time.time() - start
    print(f"完成: 成功 {success}，失败 {failed}，总耗时 {elapsed:.2f} 秒")


# 多放几个 URL 让进度显示更明显
more_urls = [f"http://example.com/page{i}" for i in range(1, 11)]
concurrent_download_with_progress(more_urls, max_workers=5)

print("\\n" + "=" * 60)
print("实战总结：")
print("  1. IO 密集任务用多线程能显著提速，加速比接近并发数")
print("  2. 串行总耗时 = 各任务耗时之和；并发总耗时 ≈ 最慢任务耗时")
print("  3. 真实项目把 time.sleep 换成 requests.get 即可")
print("  4. 务必加错误处理，单个任务失败不影响其他任务")
print("  5. 用 as_completed 能做进度显示，先完成的先处理")
print("=" * 60)
`,
  },
];
