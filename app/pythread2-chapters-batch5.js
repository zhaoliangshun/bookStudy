// =============================================================
// Python 多线程入门（pythread2）—— 第五批章节
// -------------------------------------------------------------
// 章节 21-24：实战案例 + 陷阱与最佳实践（收尾）
//
// 每个章节包含：
//   id      : 唯一标识
//   group   : 分组名（实战案例 / 陷阱与最佳实践）
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解（含表格、代码块、列表、比喻）
//   code    : 可运行、带详细中文注释的 Python 示例代码
//
// 代码运行环境约束：
//   - 用 python3 直接运行
//   - 仅使用 Python 标准库（threading, queue, concurrent.futures, time, os, tempfile 等）
//   - 通过 print 输出结果
//   - 代码必须是单文件可独立运行的脚本
//   - 死锁 demo 用 timeout 避免真的卡死
//   - 文件处理 demo 用 tempfile 避免污染环境
// =============================================================

export const chapters = [
  // =========================================================
  // 第二十一章：实战：批量文件处理
  // =========================================================
  {
    id: "py2-21",
    group: "实战案例",
    icon: "📁",
    title: "实战：批量文件处理",
    content: `## 一、场景导入

日常开发中，"批量处理一堆文件"是非常常见的任务：日志分析、批量重命名、数据迁移、配置采集……这些任务有一个共同特点——**每个文件的处理都是独立的 IO 操作**。

回忆一下前面学过的核心结论：

> **IO 密集型任务，多线程能大幅提速。**

文件读写就是典型的 IO 操作——CPU 闲着等磁盘，磁盘闲着等 CPU。如果串行处理 100 个文件，每个文件读 0.1 秒，总共 10 秒；如果用 10 个线程并发，理想情况下 1 秒就能搞定。

## 二、串行 vs 并发：先看一张图

\`\`\`text
串行处理（一个一个来）：
  文件1 [读0.1s] → 文件2 [读0.1s] → 文件3 [读0.1s] → ...
  总耗时 = N × 单文件耗时

并发处理（多线程同时来）：
  线程1: 文件1 [读0.1s]
  线程2: 文件2 [读0.1s]
  线程3: 文件3 [读0.1s]
  ... 同时进行 ...
  总耗时 ≈ 单文件耗时（理想情况）
\`\`\`

当然实际不会这么完美——磁盘有 IO 上限、线程调度有开销、CPU 也要参与解析。但相比串行，提速依然非常明显。

## 三、设计思路

我们用 \`concurrent.futures.ThreadPoolExecutor\` 这个高层工具来实现。设计步骤：

| 步骤 | 说明 |
|------|------|
| 1. 生成测试文件 | 用 \`tempfile\` 创建临时目录和文件，避免污染环境 |
| 2. 串行处理 | for 循环一个一个读，统计总耗时 |
| 3. 并发处理 | 用线程池 \`map\` 并发读，统计总耗时 |
| 4. 对比结果 | 验证两种方式结果一致，对比耗时差异 |

### 为什么用 tempfile？

\`tempfile.mkdtemp()\` 会创建一个临时目录，操作系统会在合适时机清理。这样写 demo 时不用担心留下垃圾文件，也不会污染用户的工作目录。用完之后用 \`shutil.rmtree()\` 主动清理更整洁。

### 为什么用 ThreadPoolExecutor 而不是手动 threading？

线程池帮我们管理了一堆麻烦事：

- **线程复用**：避免频繁创建/销毁线程的开销
- **任务队列**：自动分配任务给空闲线程
- **结果收集**：\`map\` 按输入顺序返回结果，简单好用
- **异常处理**：任务抛异常会被封装到结果里，调用方能感知

## 四、注意事项

### 1. 文件打开数限制

操作系统对每个进程能同时打开的文件数有限制（Linux 默认 1024）。如果一次性提交上万个文件任务，可能把文件描述符耗尽。

**应对**：控制线程池大小（如 \`max_workers=10\`），让同时打开的文件数受控。

### 2. 错误处理

文件可能不存在、权限不足、编码错误……必须用 try/except 兜底，否则一个文件失败会导致整个任务崩掉：

\`\`\`python
def safe_read(path):
    try:
        with open(path, encoding="utf-8") as f:
            return sum(1 for _ in f)
    except OSError as e:
        print(f"读取 {path} 失败: {e}")
        return 0
\`\`\`

### 3. 线程数不是越多越好

线程数过多反而会拖慢——线程切换有开销，磁盘 IO 也有上限。**经验值**：IO 密集型任务，线程数 = CPU 核数 × 2~5 就够了。

## 五、适用场景

| 场景 | 说明 |
|------|------|
| **日志分析** | 批量解析 Nginx / 应用日志，统计 PV/UV |
| **批量重命名** | 给一堆文件加前缀、改后缀 |
| **数据迁移** | 把旧系统的 CSV 导入新数据库 |
| **图片批处理** | 生成缩略图、加水印（PIL 操作） |
| **配置采集** | 遍历多台机器的配置文件做检查 |
| **爬虫结果整理** | 大量 HTML 文件提取关键信息 |

## 六、本章代码说明

下面的代码做两件事：

1. **Demo1**：用 \`tempfile\` 生成 10 个测试文件（每个文件 10000 行），然后**串行**读取并统计总行数，记录耗时。
2. **Demo2**：用 \`ThreadPoolExecutor\` 并发读取同样 10 个文件，对比耗时。

### 运行结果预期

你应该看到类似这样的输出（具体耗时取决于机器）：

\`\`\`text
[Demo1] 串行读取 10 个文件
  共读取 100000 行，耗时 0.05s

[Demo2] 并发读取 10 个文件（max_workers=5）
  共读取 100000 行，耗时 0.02s
  提速约 2.5 倍
\`\`\`

文件越多、单文件越大、IO 越慢，并发优势越明显。如果是 CPU 密集型任务（比如读完后还要做大量计算），多线程不会有这么好的效果，那就该考虑多进程了。`,
    code: `# -*- coding: utf-8 -*-
# 第二十一章演示代码：批量文件处理
# 用 tempfile 生成测试文件，对比串行 vs 线程池并发的读取耗时
import os
import time
import tempfile
import shutil
from concurrent.futures import ThreadPoolExecutor

print("=" * 60)
print("实战：批量文件处理（串行 vs 并发）")
print("=" * 60)

# ===== 1. 生成 10 个测试文件 =====
print("\\n[1] 生成 10 个测试文件（每个 10000 行）：")
# 创建临时目录，避免污染当前工作目录
tmp_dir = tempfile.mkdtemp(prefix="pythread2_21_")
file_paths = []  # 保存所有文件路径
for i in range(10):
    # 拼接路径：log_00.txt, log_01.txt, ...
    path = os.path.join(tmp_dir, f"log_{i:02d}.txt")
    with open(path, "w", encoding="utf-8") as f:
        # 每个文件写 10000 行模拟日志
        for line_no in range(10000):
            f.write(f"file-{i} line-{line_no} 这是模拟日志\\n")
    file_paths.append(path)
print(f"    临时目录: {tmp_dir}")
print(f"    生成文件数: {len(file_paths)}")


# ===== 工具函数：安全读取一个文件并统计行数 =====
def count_lines(path):
    """读取单个文件并返回行数。出错返回 0。"""
    try:
        with open(path, "r", encoding="utf-8") as f:
            # 生成器逐行读，内存占用低（不会一次性 load 整个文件）
            return sum(1 for _ in f)
    except OSError as e:
        # 兜底：文件不存在 / 权限不足 / 编码错误
        print(f"    读取 {path} 失败: {e}")
        return 0


# ===== Demo1：串行读取 =====
print("\\n[Demo1] 串行读取 10 个文件：")
t1_start = time.time()           # 开始计时
total_lines_serial = 0
for p in file_paths:             # 一个一个读，完全顺序执行
    total_lines_serial += count_lines(p)
t1_end = time.time()
serial_time = t1_end - t1_start
print(f"    共读取 {total_lines_serial} 行，耗时 {serial_time:.4f}s")


# ===== Demo2：线程池并发读取 =====
print("\\n[Demo2] 并发读取 10 个文件（max_workers=5）：")
t2_start = time.time()
# 用 with 自动管理线程池的创建和关闭
with ThreadPoolExecutor(max_workers=5) as executor:
    # map 会按输入顺序返回结果，但内部并发执行
    # 5 个 worker 同时干活，10 个文件分两批跑完
    results = list(executor.map(count_lines, file_paths))
total_lines_concurrent = sum(results)
t2_end = time.time()
concurrent_time = t2_end - t2_start
print(f"    共读取 {total_lines_concurrent} 行，耗时 {concurrent_time:.4f}s")


# ===== 对比结果 =====
print("\\n[对比] 串行 vs 并发：")
print(f"    串行耗时:   {serial_time:.4f}s")
print(f"    并发耗时:   {concurrent_time:.4f}s")
print(f"    结果一致:   {total_lines_serial == total_lines_concurrent}")
if concurrent_time > 0:
    speedup = serial_time / concurrent_time
    print(f"    提速倍数:   {speedup:.2f}x")
print("    → 文件越多、IO 越慢，并发优势越明显")

# ===== 清理临时目录 =====
shutil.rmtree(tmp_dir)
print(f"\\n[清理] 已删除临时目录: {tmp_dir}")

print("\\n" + "=" * 60)
print("结论：IO 密集型文件操作 → 用线程池可显著提速")
print("=" * 60)`,
  },

  // =========================================================
  // 第二十二章：实战：定时任务调度器
  // =========================================================
  {
    id: "py2-22",
    group: "实战案例",
    icon: "📅",
    title: "实战：定时任务调度器",
    content: `## 一、场景导入

很多业务都需要"过一段时间执行某个任务"：

- **每小时同步一次数据**
- **每天凌晨清理过期日志**
- **每 10 秒检查一次队列长度**
- **30 分钟后给用户发提醒**

这些"定时任务"看似简单，但要考虑：周期执行、可取消、多任务并行、优雅停止……自己实现一套并不容易。

## 二、两种实现思路

### 思路一：threading.Timer

\`threading.Timer\` 是标准库提供的"延迟执行"工具——N 秒后跑一个函数：

\`\`\`python
from threading import Timer

def hello():
    print("hi")

t = Timer(2.0, hello)  # 2 秒后执行
t.start()              # 启动（不阻塞主线程）
\`\`\`

但 \`Timer\` 只执行**一次**。要实现"周期执行"，可以在回调里再启动一个 \`Timer\`，形成**递归调用**：

\`\`\`python
def run_periodic():
    print("tick")
    # 在任务结束时启动下一次
    Timer(2.0, run_periodic).start()

Timer(2.0, run_periodic).start()
\`\`\`

### 思路二：Event + 循环

更灵活的方式是用 \`threading.Event\` 做停止信号，配合 \`Event.wait(timeout)\` 实现"等 N 秒或被停止就退出"：

\`\`\`python
stop_event = Event()

def worker():
    while not stop_event.wait(2.0):  # 等 2 秒，被 set 就立即返回 True
        print("tick")

Thread(target=worker).start()
# 想停止时：stop_event.set()
\`\`\`

\`wait(timeout)\` 的妙处：**既能定时，又能被立刻唤醒**。这比 \`time.sleep\` 强多了——\`sleep\` 期间没法中断。

## 三、两种思路对比

| 维度 | 递归 Timer | Event + 循环 |
|------|------------|--------------|
| 实现复杂度 | 简单 | 稍复杂 |
| 周期执行 | 递归实现 | while 循环 |
| 优雅停止 | 难（要追踪当前 Timer） | 简单（\`event.set()\`） |
| 任务漂移 | 有（执行时间会累加） | 可控（用绝对时间计算下次触发） |
| 多任务调度 | 需自己管理 | 天然支持 |

**推荐**：单任务用 Timer 够了；多任务或需要优雅停止，用 Event + 循环。

## 四、设计一个简易调度器

我们设计一个 \`TaskScheduler\` 类，支持：

- \`add(name, interval, func)\`：添加周期任务
- \`start()\`：启动所有任务
- \`stop()\`：优雅停止所有任务

\`\`\`text
TaskScheduler
  ├── tasks: {name: (interval, func, stop_event, thread)}
  ├── add(name, interval, func)   # 注册任务
  ├── start()                      # 启动所有任务的线程
  └── stop()                       # set 所有 stop_event，等线程退出
\`\`\`

每个任务在自己的线程里循环执行，\`stop_event\` 控制何时退出。

## 五、实际项目建议

如果生产环境真要做定时任务，**别自己造轮子**，用成熟的库：

| 库 | 特点 | 适用 |
|----|------|------|
| **APScheduler** | Python 最流行的调度库，支持 cron / interval / date 触发器 | 通用定时任务 |
| **celery beat** | 分布式任务队列 + 定时调度 | 大型项目 |
| **schedule** | 极简 API，链式调用 | 简单脚本 |

\`\`\`python
# APScheduler 示例（生产推荐）
from apscheduler.schedulers.background import BackgroundScheduler

sched = BackgroundScheduler()
sched.add_job(my_func, 'interval', seconds=2)
sched.start()
\`\`\`

但理解底层原理很重要——APScheduler 内部也是用线程 + Event 实现的，懂了原理才能调试问题。

## 六、本章代码说明

- **Demo1**：用递归 \`Timer\` 实现每 2 秒打印一次"tick"，跑 7 秒后用 \`cancel\` 停止。
- **Demo2**：实现 \`TaskScheduler\` 类，添加 2 个周期任务（不同间隔），运行几秒后优雅停止。

### 运行结果预期

\`\`\`text
[Demo1] 递归 Timer 周期任务
  [tick] 2.0s
  [tick] 4.0s
  [tick] 6.0s
  已取消递归 Timer

[Demo2] 简易任务调度器
  [heartbeat] 已启动，间隔 1.0s
  [report] 已启动，间隔 2.0s
  [心跳] 1.0s
  [报告] 2.0s 生成报告
  [心跳] 2.0s
  ...
  调度器已停止
\`\`\`

注意 Demo1 的 tick 之间间隔基本是 2 秒，Demo2 的心跳和报告会交错出现，这就是多任务并行的效果。`,
    code: `# -*- coding: utf-8 -*-
# 第二十二章演示代码：定时任务调度器
# Demo1: 递归 Timer 周期任务  Demo2: 简易 TaskScheduler
import time
import threading
from threading import Thread, Timer, Event

print("=" * 60)
print("实战：定时任务调度器")
print("=" * 60)


# ===== Demo1：递归 Timer 实现周期任务 =====
print("\\n[Demo1] 递归 Timer 周期任务（每 2 秒一次）：")

demo1_start = time.time()
current_timer = None  # 保存当前 Timer 对象，方便取消


def tick():
    """周期执行的回调函数：打印时间并启动下一次 Timer。"""
    global current_timer
    elapsed = time.time() - demo1_start
    print(f"  [tick] {elapsed:.1f}s")
    # 递归：启动下一次 Timer（2 秒后再调 tick）
    current_timer = Timer(2.0, tick)
    current_timer.daemon = True  # 设为守护线程，主线程退出时自动结束
    current_timer.start()


# 启动第一次（2 秒后开始）
current_timer = Timer(2.0, tick)
current_timer.daemon = True
current_timer.start()

# 主线程等 7 秒后取消（这期间会触发 3 次 tick：2s/4s/6s）
time.sleep(7)
current_timer.cancel()  # 取消还没触发的 Timer（第 4 次还没到时间）
print("  已取消递归 Timer")


# ===== Demo2：简易任务调度器 =====
print("\\n[Demo2] 简易任务调度器（支持多任务、优雅停止）：")


class TaskScheduler:
    """简易周期任务调度器。

    每个任务在自己的线程里循环执行，stop_event 控制退出。
    """

    def __init__(self):
        # tasks 字典：name -> 任务信息
        self.tasks = {}

    def add(self, name, interval, func):
        """添加一个周期任务。

        name: 任务名（唯一标识）
        interval: 执行间隔（秒）
        func: 要执行的函数（无参）
        """
        stop_event = Event()  # 每个任务自己的停止信号
        self.tasks[name] = {
            "interval": interval,
            "func": func,
            "stop_event": stop_event,
            "thread": None,  # 线程对象，start() 时填充
        }

    def _run_loop(self, name):
        """任务线程的循环体：执行 func，然后等 interval 或被停止。"""
        task = self.tasks[name]
        while not task["stop_event"].wait(task["interval"]):
            # wait 返回 False 表示超时（到点了，继续执行）
            # wait 返回 True 表示被 set（收到停止信号，退出循环）
            try:
                task["func"]()
            except Exception as e:
                # 兜底：单个任务异常不影响调度器
                print(f"  [{name}] 任务异常: {e}")

    def start(self):
        """启动所有已添加的任务。"""
        for name, task in self.tasks.items():
            # 每个任务一个线程，命名为 sched-<name> 方便调试
            t = Thread(target=self._run_loop, args=(name,), name=f"sched-{name}")
            task["thread"] = t
            t.start()
            print(f"  [{name}] 已启动，间隔 {task['interval']}s")

    def stop(self):
        """优雅停止所有任务（发出信号后等待线程退出）。"""
        for name, task in self.tasks.items():
            task["stop_event"].set()  # 通知线程退出
        for name, task in self.tasks.items():
            # 等线程结束，最多 1 秒（防止卡死）
            task["thread"].join(timeout=1.0)
            print(f"  [{name}] 已停止")


# 创建调度器
sched = TaskScheduler()
demo2_start = time.time()


def heartbeat():
    """模拟心跳任务（每秒执行）。"""
    print(f"  [心跳] {time.time() - demo2_start:.1f}s")


def report():
    """模拟定期报告任务（每 2 秒执行）。"""
    print(f"  [报告] {time.time() - demo2_start:.1f}s 生成报告")


# 添加两个任务：心跳 1 秒一次，报告 2 秒一次
sched.add("heartbeat", 1.0, heartbeat)
sched.add("report", 2.0, report)

# 启动并运行 5 秒
sched.start()
time.sleep(5)
print("  --- 准备停止 ---")
sched.stop()

print("\\n" + "=" * 60)
print("结论：单任务用 Timer 够用；多任务/优雅停止用 Event + 循环")
print("生产环境推荐用 APScheduler")
print("=" * 60)`,
  },

  // =========================================================
  // 第二十三章：常见陷阱：死锁与竞态条件
  // =========================================================
  {
    id: "py2-23",
    group: "陷阱与最佳实践",
    icon: "🕳️",
    title: "常见陷阱：死锁与竞态条件",
    content: `## 一、死锁：多线程的头号杀手

死锁（Deadlock）是多线程编程最经典的坑——**两个或多个线程互相等待对方释放资源，谁也不让谁，永远卡死**。

### 生活比喻

两个人过独木桥：

- A 从东边走，已经踏上桥
- B 从西边走，已经踏上桥
- A 说："你退回去，我才走"
- B 说："你退回去，我才走"
- 结果：两人永远站在桥上

这就是死锁——双方都持有资源（站在桥上），又都等待对方让步。

## 二、死锁的四个必要条件

死锁发生必须**同时满足**四个条件（缺一不可）：

| 条件 | 含义 | 例子 |
|------|------|------|
| **互斥** | 资源同一时刻只能被一个线程占用 | 一把锁只能被一个人持有 |
| **占有等待** | 持有资源的线程还能请求新资源 | 拿着锁1 还想要锁2 |
| **不可剥夺** | 资源不能被强行夺走，只能主动释放 | 不能抢别人的锁 |
| **循环等待** | 线程间形成首尾相接的等待环 | A等B，B等A |

**破掉任何一个条件就能避免死锁**——这是后面"如何避免"的理论基础。

## 三、经典死锁场景：锁顺序不一致

最常见的死锁场景——**两个线程以不同顺序获取多把锁**：

\`\`\`text
线程A：先锁1，再锁2
线程B：先锁2，再锁1

时间线：
  A: acquire(lock1) ✓  拿到了
  B: acquire(lock2) ✓  拿到了
  A: acquire(lock2) ⏳ 等B释放
  B: acquire(lock1) ⏳ 等A释放
  → 互相等待，死锁！
\`\`\`

### 用 timeout 避免卡死

\`Lock.acquire(timeout=N)\` 可以设置超时——等 N 秒还拿不到就放弃，返回 \`False\`。这样即使出现死锁，也能"挣脱"出来，不至于永远卡住：

\`\`\`python
if lock.acquire(timeout=2.0):
    try:
        # 拿到了锁，干活
        pass
    finally:
        lock.release()
else:
    print("等了2秒还没拿到，放弃")
\`\`\`

## 四、竞态条件：再次回顾

竞态条件（Race Condition）是另一个经典陷阱——**多个线程同时读写共享数据，结果取决于执行顺序**。

\`\`\`python
# 经典例子：多线程累加
counter = 0
def add():
    global counter
    for _ in range(100000):
        counter += 1   # 这一行不是原子的！

# 启动 5 个线程各加 100000，期望 500000
# 实际结果：往往只有 30 万左右
\`\`\`

\`counter += 1\` 看着是一行，实际是三步：**读 → 加 1 → 写回**。线程 A 读到 5，还没写回，线程 B 也读到 5，结果都写 6，少了一次。

### 用 Lock 修复

\`\`\`python
lock = Lock()
def add():
    global counter
    for _ in range(100000):
        with lock:   # 一次只让一个线程进入
            counter += 1
\`\`\`

加了锁后，\`counter += 1\` 变成原子操作，结果就正确了。

## 五、活锁与饥饿

除了死锁，还有两个相关概念：

### 活锁（Livelock）

线程没卡死，但一直在"互相谦让"——A 让 B 先，B 让 A 先，结果谁也没进展。就像两个人在走廊里同时让路，结果一起左右晃动，谁也过不去。

### 饥饿（Starvation）

某个线程**一直抢不到锁**，永远在等。比如优先级低的线程总被高优先级线程插队，永远执行不到。

**应对**：公平锁（FIFO）、限制锁持有时间、避免优先级倒置。

## 六、如何避免死锁

| 方法 | 说明 | 破坏哪个条件 |
|------|------|--------------|
| **固定锁顺序** | 所有线程按相同顺序获取锁 | 循环等待 |
| **使用 timeout** | \`acquire(timeout=N)\` | 不可剥夺 |
| **使用 with** | 自动释放，避免忘记 unlock | 占有等待 |
| **减少锁的层次** | 尽量只用一把锁 | 占有等待 |
| **用高层工具** | Queue、线程池天然无死锁 | 互斥 |

### 最实用的两条建议

1. **能用 Queue 就别手动加锁**——Queue 内部已经做好了同步，不会死锁。
2. **必须用多把锁时，全程序按相同顺序获取**——比如永远先锁 A 再锁 B。

## 七、如何调试死锁

\`threading\` 模块提供了 \`dump_traceback()\`，可以打印所有线程的调用栈，帮你看到"卡在哪"：

\`\`\`python
import threading
# 怀疑死锁时调用
threading.dump_traceback()
\`\`\`

输出会列出每个线程正在执行的代码位置，一眼就能看出谁在等谁的锁。

## 八、本章代码说明

- **Demo1**：演示经典死锁——A 先锁1再锁2，B 先锁2再锁1。用 \`acquire(timeout=2)\` 避免真卡死，超时后打印提示。
- **Demo2**：演示竞态条件——5 个线程各加 100000，结果远小于 500000；用 \`Lock\` 修复后结果正确。

### 运行结果预期

\`\`\`text
[Demo1] 经典死锁演示（用 timeout 避免）
  线程A: 拿到 lock1
  线程B: 拿到 lock2
  线程A: 等 lock2 超时，放弃（避免死锁）
  线程B: 等 lock1 超时，放弃（避免死锁）
  → 死锁被 timeout 拆解，没有卡死

[Demo2] 竞态条件
  无锁: counter = 312547（期望 500000，丢了 18 万次）
  有锁: counter = 500000（正确）
\`\`\`

注意：无锁版本的每次运行结果可能不同，但几乎总是小于期望值——这就是竞态条件的典型表现。`,
    code: `# -*- coding: utf-8 -*-
# 第二十三章演示代码：死锁与竞态条件
# Demo1: 经典死锁（用 timeout 拆解）  Demo2: 竞态条件（Lock 修复）
import time
import threading
from threading import Thread, Lock

print("=" * 60)
print("常见陷阱：死锁与竞态条件")
print("=" * 60)


# ===== Demo1：经典死锁（用 timeout 避免卡死）=====
print("\\n[Demo1] 经典死锁演示（用 timeout 拆解）：")
lock1 = Lock()
lock2 = Lock()


def worker_a():
    """线程A：先锁1，再锁2（顺序：lock1 → lock2）。"""
    print("  线程A: 尝试拿 lock1")
    lock1.acquire()
    print("  线程A: 拿到 lock1")
    time.sleep(0.1)  # 故意让线程B有时间拿 lock2，制造死锁条件
    print("  线程A: 尝试拿 lock2...")
    # 关键：用 timeout=2 避免永远卡死
    if lock2.acquire(timeout=2.0):
        print("  线程A: 拿到 lock2（成功，无死锁）")
        lock2.release()
    else:
        # 超时返回 False，主动放弃，避免死锁
        print("  线程A: 等 lock2 超时，放弃（避免死锁）")
    lock1.release()


def worker_b():
    """线程B：先锁2，再锁1（顺序：lock2 → lock1，和A相反）。"""
    print("  线程B: 尝试拿 lock2")
    lock2.acquire()
    print("  线程B: 拿到 lock2")
    time.sleep(0.1)
    print("  线程B: 尝试拿 lock1...")
    if lock1.acquire(timeout=2.0):
        print("  线程B: 拿到 lock1（成功，无死锁）")
        lock1.release()
    else:
        print("  线程B: 等 lock1 超时，放弃（避免死锁）")
    lock2.release()


# 启动两个线程，它们会因锁顺序相反而互相等待
ta = Thread(target=worker_a, name="worker-A")
tb = Thread(target=worker_b, name="worker-B")
ta.start()
tb.start()
ta.join()
tb.join()
print("  → 死锁被 timeout 拆解，没有卡死")


# ===== Demo2：竞态条件（用 Lock 修复）=====
print("\\n[Demo2] 竞态条件（多线程累加）：")
counter_unsafe = 0   # 无锁的计数器（会有竞态）
counter_safe = 0     # 有锁的计数器（正确）
safe_lock = Lock()
N = 100000           # 每个线程累加次数
THREADS = 5


def unsafe_add():
    """不加锁的累加——会有竞态条件。"""
    global counter_unsafe
    for _ in range(N):
        counter_unsafe += 1   # 非原子操作：读→加→写，三步之间会被打断


def safe_add():
    """加锁的累加——原子操作。"""
    global counter_safe
    for _ in range(N):
        with safe_lock:       # with 自动 acquire/release，异常时也能释放
            counter_safe += 1


# 无锁版本
print(f"  无锁版本（{THREADS} 线程 × {N} 次，期望 {THREADS * N}）：")
threads = [Thread(target=unsafe_add) for _ in range(THREADS)]
for t in threads:
    t.start()
for t in threads:
    t.join()
print(f"    实际结果: {counter_unsafe}（少了 {THREADS * N - counter_unsafe} 次）")

# 有锁版本
print(f"  有锁版本（{THREADS} 线程 × {N} 次，期望 {THREADS * N}）：")
threads = [Thread(target=safe_add) for _ in range(THREADS)]
for t in threads:
    t.start()
for t in threads:
    t.join()
print(f"    实际结果: {counter_safe}（正确）")

print("\\n" + "=" * 60)
print("结论：避免死锁 → 固定锁顺序 / 用 timeout / 用 Queue")
print("结论：避免竞态 → 共享数据必加锁，优先用 with")
print("=" * 60)`,
  },

  // =========================================================
  // 第二十四章：最佳实践与选型建议（收尾）
  // =========================================================
  {
    id: "py2-24",
    group: "陷阱与最佳实践",
    icon: "✅",
    title: "最佳实践与选型建议",
    content: `## 一、收尾：选对工具最重要

学完前面 23 章，你已经掌握了 Python 多线程的核心知识。最后这一章我们做两件事：

1. **什么场景用什么工具**（多线程 / 多进程 / asyncio）
2. **多线程开发的 10 条最佳实践**

选对工具比写好代码更重要——用错工具，再好的代码也救不回来。

## 二、三种并发方式对比

| 维度 | 多线程 | 多进程 | asyncio |
|------|--------|--------|---------|
| **原理** | 一个进程内多线程切换 | 多个独立进程 | 单线程内协程切换 |
| **GIL** | 受限（IO 时释放） | 不受限 | 不受限 |
| **适用** | IO 密集型 | CPU 密集型 | 高并发 IO |
| **并发数** | 几十~几百 | 几十~几百 | 上万 |
| **内存** | 低（共享进程内存） | 高（每进程独立） | 极低 |
| **通信成本** | 低（直接共享变量） | 高（Queue/Pipe） | 低（同一事件循环） |
| **心智负担** | 锁、竞态 | 进程管理 | async/await 全链路 |
| **典型场景** | 文件IO、数据库、爬虫 | 计算、加密、图像 | Web服务器、海量爬虫 |

### 决策树

\`\`\`text
任务类型？
  │
  ├─ CPU 密集（计算/加密/图像）──→ 多进程（multiprocessing）
  │
  ├─ IO 密集？
  │     │
  │     ├─ 并发量小（<100）──→ 多线程（threading）
  │     │
  │     ├─ 并发量大（>1000）──→ asyncio
  │     │
  │     └─ 需要混合 CPU+IO ──→ 多进程 + 线程池
  │
  └─ 不确定 ──→ 先用线程池（最通用）
\`\`\`

### 何时用多线程

- **网络请求**：爬虫、API 调用
- **文件读写**：日志分析、批处理
- **数据库操作**：批量查询、导入导出
- **混合任务**：CPU 占比 < 30%

### 何时用多进程

- **CPU 计算**：数值计算、加密解密
- **图像处理**：PIL/Pillow 批处理
- **机器学习预处理**：数据清洗、特征提取
- **必须绕过 GIL**：纯 Python 计算密集

### 何时用 asyncio

- **Web 服务器**：FastAPI、aiohttp
- **海量爬虫**：同时爬上千个页面
- **聊天服务器**：大量长连接
- **WebSocket 服务**：实时推送

## 三、多线程 10 条最佳实践

### 1. 优先用高层工具（Queue / 线程池）

不要一上来就 \`Thread\` + \`Lock\` 手搓——能用 \`Queue\` 就用 \`Queue\`，能用 \`ThreadPoolExecutor\` 就别自己管线程。

### 2. 共享数据尽量少

**最佳同步就是不同步**。能通过参数传递就别用全局变量，能不可变就别可变。共享数据越少，加锁的负担越轻。

### 3. 锁的范围尽量小

\`\`\`python
# 不好：把整个函数都锁住
with lock:
    data = load()      # 慢，没必要锁
    process(data)      # 慢，没必要锁
    save(result)       # 慢，没必要锁
    counter += 1       # 只有这一行需要锁

# 好：只锁真正需要的部分
with lock:
    counter += 1
\`\`\`

锁的范围越大，并发度越低。

### 4. 用 with 而非手动 acquire/release

\`\`\`python
# 不好：容易忘记 release
lock.acquire()
try:
    data.append(x)
finally:
    lock.release()

# 好：with 自动管理
with lock:
    data.append(x)
\`\`\`

\`with\` 即使抛异常也能保证释放。

### 5. 避免在持有锁时调用未知代码

\`\`\`python
# 危险：callback 里可能也加锁，导致死锁
with lock:
    callback()   # 未知代码，可能 acquire 别的锁
\`\`\`

**原则**：在锁内只做最简单的事情，回调放到锁外执行。

### 6. 注意线程安全的数据结构

\`list.append\`、\`dict[k] = v\` 在 CPython 里因为 GIL 是原子的，但**这是实现细节，不要依赖**。需要线程安全的队列用 \`queue.Queue\`，需要线程安全的计数器用 \`itertools.count\` + Lock。

### 7. 守护线程不要做关键资源释放

\`daemon=True\` 的线程会在主线程退出时被**强行杀死**，不会执行 \`finally\`。所以守护线程里别写"必须执行"的清理代码（关文件、刷缓冲、提交事务）。

### 8. 给线程起名字（name）

\`\`\`python
Thread(target=worker, name="crawler-1").start()
\`\`\`

调试时 \`threading.enumerate()\` 能看到名字，一眼就知道是哪个线程出问题。

### 9. 设置合理的线程数

| 任务类型 | 推荐线程数 |
|----------|-----------|
| CPU 密集 | CPU 核数 |
| IO 密集 | CPU 核数 × 2~5 |
| 纯等待（sleep） | 几十个都行 |

线程太多反而慢——切换开销 > 收益。

### 10. 优雅关闭线程池

\`\`\`python
with ThreadPoolExecutor(max_workers=5) as executor:
    executor.map(task, items)
# with 退出时自动 shutdown，等所有任务完成
\`\`\`

或手动：\`shutdown(wait=True)\`。**别用 \`os._exit()\`**——会跳过清理。

## 四、综合示例：工作队列模式

工作队列（Work Queue）是多线程最经典、最实用的模式：

\`\`\`text
生产者 → [任务队列 Queue] ← 消费者线程们
              ↑
        多个 worker 从队列取任务
\`\`\`

优点：

- **解耦**：生产者和消费者互不依赖
- **削峰**：队列缓冲，消费者按自己的节奏处理
- **天然无死锁**：Queue 内部已做好同步
- **可扩展**：加 worker 线程就能扩容

## 五、学习路径建议

\`\`\`text
1. 理解线程/进程概念           ← 已完成 ✓
2. 掌握 threading 基本用法     ← 已完成 ✓
3. 熟练用 Queue / 线程池       ← 已完成 ✓
4. 学会避免死锁/竞态           ← 已完成 ✓
5. 实战：文件/定时/爬虫        ← 本章 ✓
6. 进阶：multiprocessing       ← 下一站
7. 进阶：asyncio               ← 再下一站
8. 框架：APScheduler / Celery  ← 实战项目
\`\`\`

## 六、推荐进一步学习

| 资源 | 说明 |
|------|------|
| Python 官方文档 \`threading\` | 标准库 API 速查 |
| Python 官方文档 \`concurrent.futures\` | 线程池/进程池 |
| 《Python 并发编程实战》 | 系统深入学习 |
| APScheduler 文档 | 定时任务最佳实践 |
| Celery 文档 | 分布式任务队列 |

## 七、本章代码说明

- **Demo1**：综合示例——线程池 + Queue + 优雅关闭。生产者往 Queue 放任务，worker 线程消费，主线程发"停止信号"后等待剩余任务完成再退出。
- **Demo2**：完整的"工作队列"模式实现——封装一个 \`WorkerPool\` 类，支持动态提交任务、等待全部完成、统计结果。

### 运行结果预期

\`\`\`text
[Demo1] 线程池 + Queue + 优雅关闭
  [worker-1] 处理 task-0
  [worker-2] 处理 task-1
  ...
  所有任务处理完毕，发送停止信号
  [worker-1] 收到停止信号且队列空，退出
  结果数量: 10

[Demo2] 工作队列模式
  提交 20 个任务，4 个 worker
  处理完成 20 个
  总耗时 0.15s
  示例结果: ['job-0 by w0', 'job-1 by w1', ...]
\`\`\`

---

## 结语

恭喜你学完了整本《Python 多线程入门》！🎉

记住三句话：

1. **IO 密集用线程，CPU 密集用进程，高并发 IO 用 asyncio。**
2. **能用 Queue / 线程池就别手搓锁。**
3. **共享数据越少越好，锁的范围越小越好。**

把这些原则用到实际项目里，你的并发代码就能写得又快又稳。继续加油！🚀`,
    code: `# -*- coding: utf-8 -*-
# 第二十四章演示代码：综合示例（线程池 + Queue + 优雅关闭 + 工作队列模式）
import time
import queue
import threading
from threading import Thread
from concurrent.futures import ThreadPoolExecutor

print("=" * 60)
print("最佳实践：综合示例与工作队列模式")
print("=" * 60)


# ===== Demo1：线程池 + Queue + 优雅关闭 =====
print("\\n[Demo1] 线程池 + Queue + 优雅关闭：")

task_queue = queue.Queue()           # 任务队列（线程安全）
stop_event = threading.Event()       # 全局停止信号
results = []                         # 收集结果
results_lock = threading.Lock()      # 保护 results 列表


def worker(name):
    """工作线程：从队列取任务，处理，直到收到停止信号且队列为空。"""
    while True:
        try:
            # get(timeout=0.1) 避免永久阻塞，能周期性检查 stop_event
            task = task_queue.get(timeout=0.1)
        except queue.Empty:
            # 队列空了，检查是否要停止
            if stop_event.is_set():
                print(f"  [{name}] 收到停止信号且队列空，退出")
                return
            continue  # 没收到停止信号，继续等任务
        # 处理任务
        time.sleep(0.05)  # 模拟 IO 耗时
        with results_lock:
            results.append(task)
        print(f"  [{name}] 处理 {task}")
        task_queue.task_done()  # 标记这个任务完成（join 依赖这个计数）


# 启动 3 个 worker 线程
workers = []
for i in range(3):
    t = Thread(target=worker, args=(f"worker-{i+1}",), name=f"worker-{i+1}")
    t.start()
    workers.append(t)

# 投放 10 个任务
for i in range(10):
    task_queue.put(f"task-{i}")

# 等所有任务处理完（task_done 调用次数 = put 次数）
task_queue.join()
print("  所有任务处理完毕，发送停止信号")
stop_event.set()  # 通知 worker 可以退出了

# 等待所有 worker 退出
for t in workers:
    t.join(timeout=2.0)
print(f"  结果数量: {len(results)}")


# ===== Demo2：完整的工作队列模式 =====
print("\\n[Demo2] 工作队列模式（WorkerPool 类）：")


class WorkerPool:
    """工作队列模式封装：生产者提交任务，多个 worker 消费。

    用 None 作为"哨兵"通知 worker 退出，实现优雅关闭。
    """

    def __init__(self, num_workers=4, name="pool"):
        self.task_queue = queue.Queue()
        self.results = []
        self.results_lock = threading.Lock()
        self.name = name
        self.workers = []
        # 创建并启动所有 worker 线程
        for i in range(num_workers):
            t = Thread(target=self._worker, args=(i,), name=f"{name}-w{i}")
            t.start()
            self.workers.append(t)

    def _worker(self, wid):
        """工作线程主循环：不断取任务，遇到 None 就退出。"""
        while True:
            task = self.task_queue.get()  # 阻塞等待任务
            if task is None:
                # None 是哨兵，表示可以退出了
                self.task_queue.task_done()
                return
            try:
                result = self._handle(task, wid)
                with self.results_lock:
                    self.results.append(result)
            except Exception as e:
                # 单个任务异常不影响其他任务
                print(f"  [{self.name}-w{wid}] 任务异常: {e}")
            self.task_queue.task_done()

    def _handle(self, task, wid):
        """实际处理逻辑——可被子类重写。"""
        time.sleep(0.02)  # 模拟处理耗时
        return f"{task} by w{wid}"

    def submit(self, task):
        """提交一个任务到队列。"""
        self.task_queue.put(task)

    def wait_done(self):
        """等待所有已提交任务完成（基于 task_done 计数）。"""
        self.task_queue.join()

    def shutdown(self):
        """优雅关闭：给每个 worker 发一个 None 哨兵。"""
        for _ in self.workers:
            self.task_queue.put(None)
        for t in self.workers:
            t.join()  # 等线程真正退出

    def get_results(self):
        """线程安全地获取结果列表的副本。"""
        with self.results_lock:
            return list(self.results)


# 使用 WorkerPool
pool = WorkerPool(num_workers=4, name="demo")
start = time.time()

# 提交 20 个任务
for i in range(20):
    pool.submit(f"job-{i}")

# 等待全部完成
pool.wait_done()
elapsed = time.time() - start

# 关闭线程池（必须做，否则 worker 线程一直活着）
pool.shutdown()

print(f"  提交 20 个任务，{len(pool.workers)} 个 worker")
print(f"  处理完成 {len(pool.get_results())} 个")
print(f"  总耗时 {elapsed:.2f}s")
print(f"  示例结果: {pool.get_results()[:3]}")

print("\\n" + "=" * 60)
print("全书总结：")
print("  1. IO 密集 → 线程池；CPU 密集 → 多进程；高并发 IO → asyncio")
print("  2. 能用 Queue / 线程池就别手搓锁")
print("  3. 共享数据越少越好，锁范围越小越好")
print("=" * 60)
print("恭喜学完《Python 多线程入门》！")`,
  },
];
