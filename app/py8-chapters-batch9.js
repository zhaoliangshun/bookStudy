// =============================================================
// py8-chapters-batch9.js
// 模块：并发与网络（共 10 章）
// 全新制作，简单易懂，demo 多，难代码逐行讲解
// =============================================================

export const chapters = [
  {
    id: "py8-threading",
    group: "并发与网络",
    icon: "🧵",
    title: "threading 多线程",
    content: `## 什么是线程

线程是操作系统能够进行运算调度的**最小单位**。一个进程可以包含多个线程，它们共享进程的内存空间，但各自独立执行。

### 为什么需要多线程

想象你在厨房做饭：
- 一边烧水（等待水开）
- 一边切菜（切菜不需要等水开）

如果只用一个"线程"（单线程），你必须先烧水，水开了再切菜，浪费时间。多线程让你**同时做多件事**，尤其在等待 I/O 操作时（网络请求、文件读写）可以切换到其他任务。

### Python 线程的特点

- **共享内存**：所有线程可以访问同一进程的变量
- **GIL 限制**：Python 的全局解释器锁（GIL）确保同一时刻只有一个线程执行 Python 字节码
- **适合 I/O 密集型**：网络请求、文件读写等场景
- **不适合 CPU 密集型**：计算密集的任务用多进程更好

### threading 模块核心 API

| 方法 | 说明 |
|------|------|
| \`Thread(target=func)\` | 创建线程，target 指定要执行的函数 |
| \`t.start()\` | 启动线程 |
| \`t.join()\` | 等待线程执行完毕 |
| \`t.daemon = True\` | 设为守护线程，主线程退出时自动结束 |
| \`t.name\` | 线程名称 |
| \`threading.active_count()\` | 当前活跃线程数 |

### 创建线程的两种方式

**方式一：直接传 target 函数**

\`\`\`python
import threading  # 导入模块 threading

def worker():  # 定义函数 worker
    print("线程工作中")  # 打印输出到屏幕

t = threading.Thread(target=worker)  # 赋值变量 t
t.start()  # 调用 t.start()：启动
t.join()  # 调用 t.join()：等待所有任务完成
\`\`\`

**方式二：子类化 Thread**

\`\`\`python
class MyThread(threading.Thread):  # 定义类 MyThread
    def run(self):  # 定义函数 run，参数：self
        print("自定义线程运行中")  # 打印输出到屏幕

t = MyThread()  # 赋值变量 t
t.start()  # 调用 t.start()：启动
t.join()  # 调用 t.join()：等待所有任务完成
\`\`\`

### 守护线程（daemon）

守护线程是一种"后台线程"，当主线程结束时，守护线程会自动终止，不用等它执行完。

\`\`\`python
t = threading.Thread(target=worker, daemon=True)  # 赋值变量 t
\`\`\`

### 共享数据竞争

多线程共享变量时，如果多个线程同时修改同一个变量，可能产生**竞态条件**（race condition），导致数据错乱。下一章会讲如何用锁来解决。

下面的 demo 全面演示线程创建、守护线程、子类化、以及共享数据竞争问题。`,
    code: `# ==========================================
# threading 多线程完整演示
# ==========================================
import threading
import time

# ============ 1. 基本线程创建与运行 ============
print("=== 1. 基本线程：Thread(target=func) ===")

def worker(name, delay):
    """模拟一个工作任务，执行指定延迟"""
    for i in range(3):
        time.sleep(delay)
        # threading.current_thread().name 获取当前线程名称
        print(f"  [{threading.current_thread().name}] {name} 第{i+1}步完成")

# 创建线程：target 指定要执行的函数，args 传入参数
t1 = threading.Thread(target=worker, args=("线程A", 0.1), name="Worker-A")
t2 = threading.Thread(target=worker, args=("线程B", 0.15), name="Worker-B")

print(f"启动前活跃线程数：{threading.active_count()}")

t1.start()  # 启动线程A
t2.start()  # 启动线程B

print(f"启动后活跃线程数：{threading.active_count()}")

# join() 等待线程执行完毕
t1.join()
t2.join()

print("两个线程都执行完毕")
print(f"结束后活跃线程数：{threading.active_count()}")

# ============ 2. 守护线程 daemon ============
print()
print("=== 2. 守护线程 daemon ===")

def daemon_worker():
    """守护线程：如果主线程结束，它也会被强制终止"""
    for i in range(5):
        time.sleep(0.1)
        print(f"  守护线程工作中... 第{i+1}次")

# daemon=True 设为守护线程
dt = threading.Thread(target=daemon_worker, daemon=True, name="Daemon")
dt.start()
time.sleep(0.25)  # 主线程等0.25秒后结束
print("主线程即将结束，守护线程会被自动终止")

# ============ 3. 子类化 Thread ============
print()
print("=== 3. 子类化 Thread ===")

class MyWorker(threading.Thread):
    """自定义线程类：重写 run() 方法"""

    def __init__(self, name, count):
        super().__init__()  # 必须调用父类 __init__
        self.worker_name = name
        self.count = count

    def run(self):
        """线程启动后自动调用 run()"""
        for i in range(self.count):
            time.sleep(0.05)
            print(f"  [MyWorker] {self.worker_name} 执行 {i+1}/{self.count}")

wt = MyWorker("自定义线程", 3)
wt.start()
wt.join()

# ============ 4. 共享数据竞争演示 ============
print()
print("=== 4. 共享数据竞争（race condition）===")

# 共享变量：所有线程都可以访问和修改
shared_counter = 0

def increment():
    """不加锁地自增共享变量 —— 演示竞争问题"""
    global shared_counter
    for _ in range(100000):
        # 这三步不是原子操作：
        # 1. 读取 shared_counter 的值
        # 2. 计算 shared_counter + 1
        # 3. 写回 shared_counter
        # 线程切换可能发生在任意两步之间，导致丢失更新
        shared_counter += 1

def safe_increment(lock):
    """加锁自增 —— 安全版本"""
    global shared_counter
    for _ in range(100000):
        with lock:
            shared_counter += 1

# 演示不加锁的竞争
shared_counter = 0
threads = []
for i in range(5):
    t = threading.Thread(target=increment)
    threads.append(t)
    t.start()
for t in threads:
    t.join()

print(f"不加锁，5个线程各加10万次，期望50万，实际：{shared_counter}")
print("  （实际结果可能小于50万，因为存在竞争）")

# 演示加锁版本
shared_counter = 0
lock = threading.Lock()
threads = []
for i in range(5):
    t = threading.Thread(target=safe_increment, args=(lock,))
    threads.append(t)
    t.start()
for t in threads:
    t.join()

print(f"加锁后，5个线程各加10万次，期望50万，实际：{shared_counter}")

# ============ 5. 简单卖票模拟 ============
print()
print("=== 5. 简单卖票模拟（多线程抢票）===")

tickets = 10  # 总票数
tickets_lock = threading.Lock()

def sell_ticket(seller_name):
    """卖票函数：模拟多个窗口同时卖票"""
    global tickets
    while True:
        with tickets_lock:
            if tickets > 0:
                time.sleep(0.01)  # 模拟出票操作耗时
                print(f"  {seller_name} 卖出一张票，剩余 {tickets - 1} 张")
                tickets -= 1
            else:
                break
        time.sleep(0.02)  # 模拟间隔

# 3个窗口同时卖票
sellers = []
for i in range(3):
    t = threading.Thread(target=sell_ticket, args=(f"窗口{i+1}",))
    sellers.append(t)
    t.start()

for t in sellers:
    t.join()

print(f"最终剩余票数：{tickets}")

print()
print("=" * 40)
print("  threading 多线程基础演示完毕")
print("=" * 40)`
  },
  {
    id: "py8-lock",
    group: "并发与网络",
    icon: "🔒",
    title: "锁与线程安全",
    content: `## 为什么需要锁

多个线程共享数据时，如果不加控制，会出现**竞态条件**（race condition）。锁的作用就是确保同一时刻只有一个线程访问共享资源。

### 生活中的类比

公共厕所只有一个坑位，门上有个锁：
- 有人进去 → 锁门（**acquire 获取锁**）
- 其他人排队等待
- 里面的人出来 → 开门（**release 释放锁**）
- 下一个人进去

### Lock 互斥锁

最基本的锁，只能被一个线程持有：

\`\`\`python
import threading  # 导入模块 threading

lock = threading.Lock()  # 赋值变量 lock

# 方式一：手动 acquire/release
lock.acquire()  # 调用 lock.acquire()：获取锁
try:  # 尝试执行可能出错的代码
    # 临界区：操作共享数据
    shared_data += 1  # shared_data 累加
finally:  # 无论是否异常都执行
    lock.release()  # 必须释放，否则死锁！

# 方式二：with 语句（推荐，自动释放）
with lock:  # 使用上下文管理器：lock
    shared_data += 1  # shared_data 累加
\`\`\`

### RLock 可重入锁

普通 Lock 在同一线程中重复 acquire 会**死锁**。RLock 允许同一线程多次获取：

\`\`\`python
rlock = threading.RLock()  # 赋值变量 rlock
rlock.acquire()  # 调用 rlock.acquire()：获取锁
rlock.acquire()  # 同一线程再次获取，OK
rlock.release()  # 调用 rlock.release()：释放锁
rlock.release()  # 获取几次就要释放几次
\`\`\`

### 死锁（Deadlock）

两个线程互相等待对方释放锁，永远卡住：

\`\`\`python
# 线程 A：先获取 lock1，再获取 lock2
# 线程 B：先获取 lock2，再获取 lock1
# 如果 A 拿到 lock1，B 拿到 lock2，然后互相等待 → 死锁
\`\`\`

### GIL 全局解释器锁

GIL（Global Interpreter Lock）是 CPython 解释器的一个机制：
- 同一时刻**只有一个线程执行 Python 字节码**
- 即使多核 CPU，Python 多线程也无法并行执行 Python 代码
- **I/O 操作会释放 GIL**，所以多线程对 I/O 密集型任务仍然有效
- **CPU 密集型任务**应该用多进程（multiprocessing）绕过 GIL

### 线程安全概念

- **线程安全**：多个线程同时访问也不会出错的代码
- **原子操作**：不可分割的操作，执行中不会被中断
- Python 中 \`list.append()\`、\`dict[key] = value\` 等是原子操作，但 \`x += 1\` 不是

### Condition 条件变量

比 Lock 更高级，允许线程等待某个条件满足：

\`\`\`python
cond = threading.Condition()  # 赋值变量 cond

# 消费者：等待条件
with cond:  # 使用上下文管理器：cond
    while not data_ready:  # 当 not data_ready 时循环
        cond.wait()   # 释放锁并等待
    # 消费数据

# 生产者：通知条件满足
with cond:  # 使用上下文管理器：cond
    data_ready = True  # 赋值变量 data_ready
    cond.notify_all()  # 唤醒所有等待的线程
\`\`\`

### Semaphore 信号量

控制同时访问资源的线程数量上限：

\`\`\`python
# 最多允许 3 个线程同时访问
sem = threading.Semaphore(3)  # 赋值变量 sem

with sem:  # 使用上下文管理器：sem
    # 最多3个线程能同时进入这里
    do_work()  # 调用 do_work()
\`\`\`

下面的 demo 演示 Lock、RLock、死锁、Condition、Semaphore 的完整用法。`,
    code: `# ==========================================
# 锁与线程安全 完整演示
# ==========================================
import threading
import time

# ============ 1. Lock 基本用法 ============
print("=== 1. Lock 互斥锁 ===")

balance = 1000  # 共享银行余额
lock = threading.Lock()

def deposit(amount, name):
    """存款操作：必须加锁保证原子性"""
    global balance
    with lock:  # 推荐使用 with 语句，自动 acquire/release
        # 临界区：读取 → 修改 → 写回，必须原子执行
        current = balance
        time.sleep(0.01)  # 模拟处理延迟，放大竞争
        balance = current + amount
        print(f"  {name} 存入 {amount} 元，余额 {balance} 元")

# 两个线程同时存款
t1 = threading.Thread(target=deposit, args=(500, "小明"))
t2 = threading.Thread(target=deposit, args=(300, "小红"))
t1.start()
t2.start()
t1.join()
t2.join()
print(f"最终余额（期望 1800）：{balance}")

# ============ 2. RLock 可重入锁 ============
print()
print("=== 2. RLock 可重入锁 ===")

rlock = threading.RLock()

def outer():
    """外层函数获取 RLock"""
    with rlock:
        print("  进入 outer()，获取锁")
        inner()  # 调用内层函数，它也会尝试获取同一个锁

def inner():
    """内层函数再次获取同一个 RLock —— 不会死锁"""
    with rlock:
        print("  进入 inner()，再次获取同一把锁（RLock 允许）")

outer()
print("RLock 可重入演示完成")

# 对比：普通 Lock 重复获取会死锁
print()
print("--- 对比：普通 Lock 重复获取会死锁 ---")
dead_lock = threading.Lock()

def try_reenter():
    """尝试用普通 Lock 重入 —— 会死锁"""
    with dead_lock:
        print("  第一次获取 lock 成功")
        # 如果用普通 Lock 尝试再次获取，会永远卡住
        # 这里用 acquire(blocking=False) 来检测，避免真的死锁
        result = dead_lock.acquire(blocking=False)
        if result:
            print("  第二次获取也成功（不太可能）")
            dead_lock.release()
        else:
            print("  第二次获取失败！普通 Lock 不支持重入")

try_reenter()

# ============ 3. 死锁演示 ============
print()
print("=== 3. 死锁演示 ===")

lock_a = threading.Lock()
lock_b = threading.Lock()
deadlock_occurred = threading.Event()

def worker_a():
    """线程A：先拿 lock_a，再拿 lock_b"""
    with lock_a:
        print("  [A] 获取 lock_a")
        time.sleep(0.1)
        print("  [A] 尝试获取 lock_b...")
        if lock_b.acquire(timeout=0.5):  # 最多等0.5秒
            print("  [A] 获取 lock_b 成功")
            lock_b.release()
        else:
            print("  [A] 获取 lock_b 超时（可能死锁）")
            deadlock_occurred.set()

def worker_b():
    """线程B：先拿 lock_b，再拿 lock_a —— 与A相反！"""
    with lock_b:
        print("  [B] 获取 lock_b")
        time.sleep(0.1)
        print("  [B] 尝试获取 lock_a...")
        if lock_a.acquire(timeout=0.5):
            print("  [B] 获取 lock_a 成功")
            lock_a.release()
        else:
            print("  [B] 获取 lock_a 超时（可能死锁）")
            deadlock_occurred.set()

ta = threading.Thread(target=worker_a)
tb = threading.Thread(target=worker_b)
ta.start()
tb.start()
ta.join()
tb.join()

if deadlock_occurred.is_set():
    print("⚠️  检测到死锁风险！两个线程互相等待对方的锁")
    print("   避免死锁：始终按相同顺序获取锁")

# ============ 4. Condition 条件变量 ============
print()
print("=== 4. Condition 条件变量（生产者-消费者）===")

condition = threading.Condition()
items = []  # 共享缓冲区

def producer():
    """生产者：生产数据并通知消费者"""
    for i in range(5):
        time.sleep(0.1)
        with condition:
            items.append(f"产品{i}")
            print(f"  [生产者] 生产了 产品{i}")
            condition.notify()  # 通知一个等待的消费者

def consumer(name):
    """消费者：等待数据并消费"""
    with condition:
        while len(items) == 0:
            print(f"  [{name}] 等待产品...")
            condition.wait()  # 释放锁并等待通知
        item = items.pop(0)
        print(f"  [{name}] 消费了 {item}")

# 生产者 + 2个消费者
prod = threading.Thread(target=producer)
cons = [threading.Thread(target=consumer, args=(f"消费者{i}",)) for i in range(1, 3)]
prod.start()
for c in cons:
    c.start()
prod.join()
for c in cons:
    c.join()

# ============ 5. Semaphore 信号量 ============
print()
print("=== 5. Semaphore 信号量（限制并发数）===")

# 最多允许 2 个线程同时"使用打印机"
printer_sem = threading.Semaphore(2)

def print_document(doc_id):
    """模拟打印文档，信号量限制同时打印数"""
    with printer_sem:
        print(f"  [文档{doc_id}] 开始打印...")
        time.sleep(0.2)
        print(f"  [文档{doc_id}] 打印完成 ✓")

# 5个文档同时请求打印，但只有2个能同时进行
docs = []
for i in range(5):
    t = threading.Thread(target=print_document, args=(i+1,))
    docs.append(t)
    t.start()

for t in docs:
    t.join()

print("所有文档打印完毕")

# ============ 6. GIL 说明演示 ============
print()
print("=== 6. GIL 的影响演示 ===")

def cpu_bound_work():
    """CPU密集型任务：GIL 下多线程无法加速"""
    total = 0
    for i in range(5000000):
        total += i
    return total

# 单线程执行
start = time.time()
cpu_bound_work()
single_time = time.time() - start
print(f"单线程 CPU 密集任务耗时：{single_time:.3f} 秒")

# 双线程执行（GIL 下可能反而更慢）
start = time.time()
t1 = threading.Thread(target=cpu_bound_work)
t2 = threading.Thread(target=cpu_bound_work)
t1.start()
t2.start()
t1.join()
t2.join()
multi_time = time.time() - start
print(f"双线程 CPU 密集任务耗时：{multi_time:.3f} 秒")
print(f"加速比：{single_time / multi_time:.2f}x（理想是2x，但GIL限制了并行）")

print()
print("=" * 40)
print("  锁与线程安全演示完毕")
print("  I/O密集型用多线程，CPU密集型用多进程")
print("=" * 40)`
  },
  {
    id: "py8-concurrent-futures",
    group: "并发与网络",
    icon: "⚡",
    title: "concurrent.futures 线程池进程池",
    content: `## 线程池与进程池

手动管理线程/进程的创建和销毁很繁琐。\`concurrent.futures\` 模块提供了**线程池**和**进程池**，让你把任务提交到池子里，由池子统一管理线程/进程的生命周期。

### 核心概念

| 概念 | 说明 |
|------|------|
| **Executor** | 执行器，管理线程/进程池 |
| **Future** | 代表一个异步任务的结果，可以查询状态、获取结果 |
| **submit(fn, *args)** | 提交一个任务，返回 Future |
| **map(fn, iterable)** | 批量提交，返回结果的迭代器 |

### ThreadPoolExecutor 线程池

\`\`\`python
from concurrent.futures import ThreadPoolExecutor  # 从 concurrent.futures 导入 ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=4) as executor:  # 使用上下文管理器：ThreadPoolExecutor(max_workers=4) as executor
    # 方式一：submit 提交单个任务
    future = executor.submit(download, url)  # 赋值变量 future
    result = future.result()  # 阻塞等待结果

    # 方式二：map 批量提交
    results = executor.map(download, urls)  # 赋值变量 results
\`\`\`

### ProcessPoolExecutor 进程池

用法和线程池几乎一样，只是把 \`ThreadPoolExecutor\` 换成 \`ProcessPoolExecutor\`：

\`\`\`python
from concurrent.futures import ProcessPoolExecutor  # 从 concurrent.futures 导入 ProcessPoolExecutor

with ProcessPoolExecutor(max_workers=4) as executor:  # 使用上下文管理器：ProcessPoolExecutor(max_workers=4) as executor
    results = executor.map(cpu_heavy, data)  # 赋值变量 results
\`\`\`

### as_completed 按完成顺序获取

\`\`\`python
from concurrent.futures import as_completed  # 从 concurrent.futures 导入 as_completed

futures = {executor.submit(task, i): i for i in range(10)}  # 定义字典 futures
for future in as_completed(futures):  # 遍历 as_completed(futures)，取值给 future
    result = future.result()  # 谁先完成就先处理谁
\`\`\`

### Future 对象

\`\`\`python
future = executor.submit(func, arg)  # 赋值变量 future
future.done()       # 是否完成
future.result()     # 获取结果（阻塞）
future.cancel()     # 尝试取消
future.add_done_callback(fn)  # 完成时回调
\`\`\`

### 线程池 vs 进程池选择

| 场景 | 选择 | 原因 |
|------|------|------|
| I/O 密集型（网络、文件） | ThreadPoolExecutor | 线程切换开销小，I/O 会释放 GIL |
| CPU 密集型（计算、加密） | ProcessPoolExecutor | 绕过 GIL，真正并行 |
| 需要共享大量数据 | 线程池 | 进程间数据传输有序列化开销 |
| 任务数不确定 | 线程池 | 进程创建销毁开销大 |

下面的 demo 同时演示线程池和进程池的用法，包括 submit、map、as_completed、回调等。`,
    code: `# ==========================================
# concurrent.futures 线程池/进程池 完整演示
# ==========================================
from concurrent.futures import (
    ThreadPoolExecutor, ProcessPoolExecutor,
    as_completed, wait, FIRST_COMPLETED
)
import time
import math
import os

# ============ 1. ThreadPoolExecutor 基本用法 ============
print("=== 1. ThreadPoolExecutor 线程池 ===")

def io_task(task_id, delay):
    """模拟 I/O 密集型任务（如网络请求）"""
    time.sleep(delay)
    return f"任务{task_id}完成（耗时{delay}s）"

# submit 方式：逐个提交任务
start = time.time()
with ThreadPoolExecutor(max_workers=3) as executor:
    # 提交多个任务，返回 Future 列表
    futures = []
    for i in range(5):
        future = executor.submit(io_task, i+1, 0.5 - i*0.08)
        futures.append(future)
        print(f"  提交任务{i+1}")

    # 按提交顺序获取结果
    print()
    print("  按提交顺序获取结果：")
    for i, future in enumerate(futures):
        result = future.result()  # 阻塞等待
        print(f"    {result}")

print(f"submit 方式总耗时：{time.time() - start:.2f}s")

# ============ 2. as_completed 按完成顺序获取 ============
print()
print("=== 2. as_completed 按完成顺序 ===")

start = time.time()
with ThreadPoolExecutor(max_workers=3) as executor:
    # 提交任务，key 是 future
    future_to_id = {}
    delays = [0.5, 0.1, 0.4, 0.2, 0.3]
    for i, delay in enumerate(delays):
        future = executor.submit(io_task, i+1, delay)
        future_to_id[future] = i + 1

    # as_completed：谁先完成就先处理谁
    for future in as_completed(future_to_id):
        task_id = future_to_id[future]
        result = future.result()
        print(f"  {result}（先完成的先输出）")

print(f"as_completed 总耗时：{time.time() - start:.2f}s")

# ============ 3. executor.map 批量处理 ============
print()
print("=== 3. executor.map 批量处理 ===")

def square(x):
    """计算平方（模拟任务）"""
    time.sleep(0.05)
    return x * x

with ThreadPoolExecutor(max_workers=4) as executor:
    # map 返回结果的迭代器，保持输入顺序
    results = executor.map(square, range(1, 11))
    print("  1~10 的平方：", list(results))

# ============ 4. 回调函数 add_done_callback ============
print()
print("=== 4. Future 回调函数 ===")

results_collected = []

def on_done(future):
    """任务完成时的回调"""
    result = future.result()
    results_collected.append(result)
    print(f"  [回调] 收集到结果：{result}")

with ThreadPoolExecutor(max_workers=3) as executor:
    futures = []
    for i in range(5):
        future = executor.submit(square, i+1)
        future.add_done_callback(on_done)  # 注册回调
        futures.append(future)

    # 等所有任务完成
    for f in futures:
        f.result()

print(f"  回调收集到的所有结果：{results_collected}")

# ============ 5. ProcessPoolExecutor 进程池 ============
print()
print("=== 5. ProcessPoolExecutor 进程池 ===")

def cpu_heavy(n):
    """CPU 密集型任务：计算质数"""
    count = 0
    for num in range(2, n + 1):
        is_prime = True
        for i in range(2, int(math.sqrt(num)) + 1):
            if num % i == 0:
                is_prime = False
                break
        if is_prime:
            count += 1
    return (n, count, os.getpid())  # 返回上限、质数个数、进程ID

if __name__ == "__main__":
    print("  计算不同范围内的质数数量（进程池并行）：")
    ranges = [10000, 20000, 30000, 40000]

    start = time.time()
    with ProcessPoolExecutor(max_workers=4) as executor:
        # 用 map 批量提交
        results = executor.map(cpu_heavy, ranges)

        for n, count, pid in results:
            print(f"    1~{n} 内有 {count} 个质数（进程ID: {pid}）")

    print(f"  进程池总耗时：{time.time() - start:.2f}s")

    # 对比单进程
    print()
    print("  单进程对比：")
    start = time.time()
    for r in ranges:
        n, count, pid = cpu_heavy(r)
        print(f"    1~{n} 内有 {count} 个质数（进程ID: {pid}）")
    print(f"  单进程总耗时：{time.time() - start:.2f}s")

# ============ 6. 线程池 vs 进程池选择指南 ============
print()
print("=== 6. 线程池 vs 进程池 对比演示 ===")

def io_bound(task_id):
    """I/O 密集型：模拟网络请求"""
    time.sleep(0.1)
    return f"IO任务{task_id}"

def cpu_bound(n):
    """CPU 密集型：计算"""
    return sum(i * i for i in range(n))

# 线程池处理 I/O 任务
start = time.time()
with ThreadPoolExecutor(max_workers=8) as executor:
    list(executor.map(io_bound, range(8)))
print(f"线程池 8个 I/O 任务耗时：{time.time() - start:.2f}s（快！）")

# 线程池处理 CPU 任务（GIL 限制）
start = time.time()
with ThreadPoolExecutor(max_workers=4) as executor:
    list(executor.map(cpu_bound, [3000000] * 4))
print(f"线程池 4个 CPU 任务耗时：{time.time() - start:.2f}s（受GIL限制）")

# 进程池处理 CPU 任务（绕过 GIL）
if __name__ == "__main__":
    start = time.time()
    with ProcessPoolExecutor(max_workers=4) as executor:
        list(executor.map(cpu_bound, [3000000] * 4))
    print(f"进程池 4个 CPU 任务耗时：{time.time() - start:.2f}s（真正并行）")

print()
print("=" * 40)
print("  concurrent.futures 演示完毕")
print("=" * 40)`
  },
  {
    id: "py8-multiprocessing",
    group: "并发与网络",
    icon: "🔄",
    title: "multiprocessing 多进程",
    content: `## 多进程 vs 多线程

**进程**是操作系统分配资源的**独立单位**，每个进程有自己独立的内存空间。Python 的 \`multiprocessing\` 模块可以创建多个进程，每个进程都有独立的 Python 解释器和 GIL，因此可以实现**真正的并行计算**。

### 核心区别

| 对比维度 | 多线程 (threading) | 多进程 (multiprocessing) |
|----------|-------------------|-------------------------|
| 内存 | 共享内存 | 独立内存（不共享） |
| GIL | 受限于 GIL | 每个进程独立 GIL |
| 通信 | 直接访问共享变量 | 需要 Queue/Pipe 等 IPC |
| 创建开销 | 小 | 大 |
| 适用场景 | I/O 密集型 | CPU 密集型 |
| 数据共享 | 简单但有竞争 | 需要序列化传输 |

### Process 创建与使用

\`\`\`python
from multiprocessing import Process  # 从 multiprocessing 导入 Process

def worker(name):  # 定义函数 worker，参数：name
    print(f"进程 {name} 工作中")  # 打印输出到屏幕

p = Process(target=worker, args=("A",))  # 赋值变量 p
p.start()  # 调用 p.start()：启动
p.join()  # 调用 p.join()：等待所有任务完成
\`\`\`

### 进程间通信（IPC）

因为进程间不共享内存，需要专门的通信机制：

**Queue（队列）**：线程安全的 FIFO 队列

\`\`\`python
from multiprocessing import Queue  # 从 multiprocessing 导入 Queue

q = Queue()  # 赋值变量 q
q.put("数据")       # 放入
data = q.get()       # 取出
\`\`\`

**Pipe（管道）**：双向通信管道

\`\`\`python
from multiprocessing import Pipe  # 从 multiprocessing 导入 Pipe

parent_conn, child_conn = Pipe()  # 多重赋值：parent_conn, child_conn
parent_conn.send("hello")   # 一端发送
msg = child_conn.recv()     # 另一端接收
\`\`\`

### Pool 进程池

和线程池类似，管理一组工作进程：

\`\`\`python
from multiprocessing import Pool  # 从 multiprocessing 导入 Pool

with Pool(processes=4) as pool:  # 使用上下文管理器：Pool(processes=4) as pool
    # apply_async：异步提交单个任务
    result = pool.apply_async(func, args=(x,))  # 赋值变量 result
    print(result.get())  # 打印输出到屏幕

    # map：批量提交
    results = pool.map(func, data)  # 赋值变量 results
\`\`\`

### 守护进程

\`\`\`python
p = Process(target=worker, daemon=True)  # 赋值变量 p
\`\`\`

### 重要注意事项

1. **\`if __name__ == "__main__"\`**：Windows 上创建进程必须放在这个判断里
2. **序列化**：进程间传递的数据必须可 pickle 序列化
3. **全局变量不共享**：每个进程有自己独立的全局变量副本

下面的 demo 演示 Process 创建、Queue/Pipe 通信、进程池、以及进程间不共享内存的对比。`,
    code: `# ==========================================
# multiprocessing 多进程 完整演示
# ==========================================
from multiprocessing import Process, Queue, Pipe, Pool, current_process
import time
import os
import threading

# 所有函数定义在模块级别，确保 macOS spawn 方式可 pickle
# （macOS 默认用 spawn 而非 fork，子进程需要导入模块级函数）

def worker(name, delay):
    """工作进程函数"""
    pid = os.getpid()  # 当前进程ID
    pname = current_process().name  # 进程名称
    for i in range(3):
        time.sleep(delay)
        print(f"  [{pname} PID:{pid}] {name} 第{i+1}步完成")

# 用于演示进程间不共享内存
shared_list = [1, 2, 3]

def modify_list():
    """子进程修改全局变量的副本 —— 不影响主进程"""
    shared_list.append(99)
    print(f"  子进程中：shared_list = {shared_list}")

def producer_proc(q):
    """生产者进程：向队列放数据"""
    for i in range(5):
        time.sleep(0.05)
        item = f"产品{i}"
        q.put(item)
        print(f"  [生产者] 放入：{item}")

def consumer_proc(q):
    """消费者进程：从队列取数据"""
    for _ in range(5):
        item = q.get()  # 阻塞等待
        print(f"  [消费者] 取出：{item}")

def pipe_sender(conn):
    """通过管道发送数据"""
    messages = ["你好", "Hello", "Bonjour"]
    for msg in messages:
        conn.send(msg)
        print(f"  [发送端] 发送：{msg}")
        time.sleep(0.05)
    conn.send("DONE")  # 发送结束信号
    conn.close()

def pipe_receiver(conn):
    """通过管道接收数据"""
    while True:
        msg = conn.recv()
        print(f"  [接收端] 收到：{msg}")
        if msg == "DONE":
            break
    conn.close()

def compute_square(x):
    """计算平方（模拟 CPU 密集型）"""
    time.sleep(0.1)
    return x * x

def power(base, exp):
    """计算幂"""
    return base ** exp

def cpu_task(n):
    """CPU 密集型任务"""
    total = 0
    for i in range(n):
        total += i * i
    return total

# ============ 主程序入口 ============
if __name__ == "__main__":
    # ============ 1. Process 基本创建与运行 ============
    print("=== 1. Process 基本创建与运行 ===")
    print(f"主进程 PID：{os.getpid()}")

    # 创建子进程
    p1 = Process(target=worker, args=("进程A", 0.1), name="Worker-A")
    p2 = Process(target=worker, args=("进程B", 0.15), name="Worker-B")

    # 守护进程：主进程退出时自动终止
    p3 = Process(target=worker, args=("守护进程", 0.2), daemon=True, name="Daemon")

    p1.start()
    p2.start()
    p3.start()

    print(f"子进程已启动，PID：{p1.pid}, {p2.pid}, {p3.pid}")
    print(f"p1 是否存活：{p1.is_alive()}")

    p1.join()
    p2.join()
    # p3 是守护进程，不 join，主进程退出时自动终止

    print("p1 和 p2 已完成")

    # ============ 2. 进程间不共享内存 ============
    print()
    print("=== 2. 进程间不共享内存（重要！）===")

    p = Process(target=modify_list)
    p.start()
    p.join()
    print(f"  主进程中：shared_list = {shared_list}（没变！）")

    # ============ 3. Queue 进程间通信 ============
    print()
    print("=== 3. Queue 进程间通信 ===")

    q = Queue()
    prod = Process(target=producer_proc, args=(q,))
    cons = Process(target=consumer_proc, args=(q,))
    prod.start()
    cons.start()
    prod.join()
    cons.join()

    # ============ 4. Pipe 管道通信 ============
    print()
    print("=== 4. Pipe 管道通信 ===")

    parent_conn, child_conn = Pipe()
    sender = Process(target=pipe_sender, args=(parent_conn,))
    receiver = Process(target=pipe_receiver, args=(child_conn,))
    sender.start()
    receiver.start()
    sender.join()
    receiver.join()

    # ============ 5. Pool 进程池 ============
    print()
    print("=== 5. Pool 进程池 ===")

    with Pool(processes=4) as pool:
        # apply_async：异步提交单个任务
        print("  apply_async 异步提交：")
        async_result = pool.apply_async(compute_square, (10,))
        print(f"  10^2 = {async_result.get()}")

        # map：批量提交
        print()
        print("  map 批量计算 1~8 的平方：")
        results = pool.map(compute_square, range(1, 9))
        print(f"  结果：{results}")

        # starmap：传多个参数
        print()
        print("  starmap 计算幂：")
        tasks = [(2, 3), (3, 3), (4, 3), (5, 2)]
        results = pool.starmap(power, tasks)
        for (b, e), r in zip(tasks, results):
            print(f"    {b}^{e} = {r}")

    # ============ 6. 多进程 vs 多线程 CPU 任务对比 ============
    print()
    print("=== 6. 多进程 vs 多线程 性能对比 ===")

    N = 5000000

    # 单进程
    start = time.time()
    cpu_task(N)
    single_time = time.time() - start
    print(f"单进程耗时：{single_time:.3f}s")

    # 多线程（受 GIL 限制）
    start = time.time()
    threads = [threading.Thread(target=cpu_task, args=(N,)) for _ in range(4)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    multi_thread_time = time.time() - start
    print(f"4线程耗时：{multi_thread_time:.3f}s（GIL限制，没加速）")

    # 多进程（绕过 GIL）
    start = time.time()
    with Pool(processes=4) as pool:
        pool.map(cpu_task, [N] * 4)
    multi_proc_time = time.time() - start
    print(f"4进程耗时：{multi_proc_time:.3f}s（真正并行加速）")

    print()
    print("=" * 40)
    print("  multiprocessing 多进程演示完毕")
    print("=" * 40)`
  },
  {
    id: "py8-asyncio-basic",
    group: "并发与网络",
    icon: "🌀",
    title: "asyncio 异步编程基础",
    content: `## 异步编程是什么

异步编程是一种**单线程并发**模型。它不像多线程那样同时执行多个任务，而是通过**事件循环**（event loop）在任务之间切换，当一个任务在等待时（如网络 I/O），CPU 去执行其他任务。

### 关键概念对比

| 概念 | 同步 | 异步 |
|------|------|------|
| 执行方式 | 排队一个个执行 | 遇到等待就切换 |
| 阻塞 | 会阻塞当前线程 | 不阻塞，让出控制权 |
| 并发模型 | 需要多线程 | 单线程 + 事件循环 |

### 生活中的类比

**同步（阻塞）**：你在餐厅点餐，站在柜台前等厨师做完，期间什么也干不了。

**异步（非阻塞）**：你点完餐拿到号牌，坐到座位上刷手机，等叫号了再去取餐。这期间你可以做其他事。

### async / await 语法

\`\`\`python
# async def 定义协程函数（不是普通函数）
async def fetch_data():  # 定义异步函数 fetch_data
    # await 挂起当前协程，等待异步操作完成
    result = await some_async_operation()  # 赋值变量 result
    return result  # 返回 result
\`\`\`

- **\`async def\`**：定义一个**协程函数**（coroutine function），调用它返回的是协程对象，不是普通返回值
- **\`await\`**：暂停当前协程的执行，等待一个可等待对象（awaitable）完成，期间事件循环可以执行其他任务

### 事件循环（Event Loop）

事件循环是 asyncio 的核心，它不停地检查哪些任务可以执行：

\`\`\`python
import asyncio  # 导入模块 asyncio

async def main():  # 定义异步函数 main
    print("Hello")  # 打印输出到屏幕
    await asyncio.sleep(1)  # 异步等待1秒，不阻塞
    print("World")  # 打印输出到屏幕

asyncio.run(main())  # 创建事件循环并运行
\`\`\`

### asyncio 核心函数

| 函数 | 说明 |
|------|------|
| \`asyncio.run(coro)\` | 创建事件循环，运行协程 |
| \`asyncio.sleep(n)\` | 异步睡眠 n 秒（不阻塞） |
| \`asyncio.gather(*coros)\` | 并发运行多个协程，等待全部完成 |
| \`asyncio.create_task(coro)\` | 将协程包装成 Task 并调度执行 |

### gather 并行执行

\`\`\`python
async def main():  # 定义异步函数 main
    # 同时发起3个请求，总耗时取决于最慢的那个
    results = await asyncio.gather(  # 赋值变量 results
        fetch("url1"),  # 调用 fetch()
        fetch("url2"),  # 调用 fetch()
        fetch("url3"),  # 调用 fetch()
    )
\`\`\`

### create_task 创建任务

\`\`\`python
async def main():  # 定义异步函数 main
    # 创建任务（立即开始执行，不等待）
    task1 = asyncio.create_task(fetch("url1"))  # 赋值变量 task1
    task2 = asyncio.create_task(fetch("url2"))  # 赋值变量 task2

    # 做其他事情...
    await asyncio.sleep(0.5)  # 执行操作

    # 最后等待任务完成
    result1 = await task1  # 赋值变量 result1
    result2 = await task2  # 赋值变量 result2
\`\`\`

### 重要规则

1. **协程函数不能直接调用**：\`fetch()\` 返回协程对象，必须用 \`await\` 或 \`asyncio.run()\` 执行
2. **await 只能在 async 函数里用**
3. **asyncio.run() 只能调用一次**（一个事件循环中）
4. **不要在协程里用 time.sleep()**，要用 \`asyncio.sleep()\`

下面的 demo 全面演示 async/await、gather、create_task、以及异步 vs 同步的性能对比。`,
    code: `# ==========================================
# asyncio 异步编程基础 完整演示
# ==========================================
import asyncio
import time

# ============ 1. 协程函数基础 ============
print("=== 1. 协程函数基础 ===")

# async def 定义协程函数
async def greet(name):
    """协程函数：打招呼"""
    return f"你好，{name}！"

# 调用协程函数返回的是协程对象，不是结果
coro = greet("小明")
print(f"协程对象类型：{type(coro).__name__}")
print(f"协程对象：{coro}")

# 用 asyncio.run() 运行协程并获取结果
result = asyncio.run(greet("小明"))
print(f"运行结果：{result}")

# ============ 2. await 和 asyncio.sleep ============
print()
print("=== 2. await 和 asyncio.sleep ===")

async def make_coffee():
    """模拟煮咖啡（异步任务）"""
    print("  开始煮咖啡...")
    await asyncio.sleep(1)  # 异步等待，不阻塞
    print("  咖啡煮好了！")
    return "☕ 咖啡"

async def make_toast():
    """模拟烤面包（异步任务）"""
    print("  开始烤面包...")
    await asyncio.sleep(0.5)  # 面包比咖啡快
    print("  面包烤好了！")
    return "🍞 面包"

async def make_breakfast_sync():
    """同步方式做早餐：一件一件做"""
    start = time.time()
    coffee = await make_coffee()   # 等咖啡
    toast = await make_toast()     # 等面包
    elapsed = time.time() - start
    print(f"  同步早餐完成：{coffee} + {toast}，耗时 {elapsed:.1f}s")
    return coffee, toast

async def make_breakfast_async():
    """异步方式做早餐：同时做"""
    start = time.time()
    # gather 并发执行，总耗时 = 最慢任务的时间
    coffee, toast = await asyncio.gather(
        make_coffee(),
        make_toast(),
    )
    elapsed = time.time() - start
    print(f"  异步早餐完成：{coffee} + {toast}，耗时 {elapsed:.1f}s")
    return coffee, toast

print("同步方式：")
asyncio.run(make_breakfast_sync())
print()
print("异步方式（gather 并发）：")
asyncio.run(make_breakfast_async())

# ============ 3. asyncio.gather 详解 ============
print()
print("=== 3. asyncio.gather 详解 ===")

async def download_file(file_id, delay):
    """模拟下载文件（异步）"""
    print(f"  开始下载文件{file_id}...")
    await asyncio.sleep(delay)
    print(f"  文件{file_id}下载完成")
    return f"文件{file_id}内容"

async def download_all():
    """同时下载多个文件"""
    start = time.time()
    # gather 同时发起，返回所有结果的列表
    results = await asyncio.gather(
        download_file(1, 0.3),
        download_file(2, 0.5),
        download_file(3, 0.2),
        download_file(4, 0.4),
    )
    elapsed = time.time() - start
    print(f"  全部下载完成：{results}")
    print(f"  总耗时 {elapsed:.1f}s（约等于最慢的0.5s，而非总和1.4s）")

asyncio.run(download_all())

# ============ 4. create_task 创建任务 ============
print()
print("=== 4. create_task 创建任务 ===")

async def long_task(name, delay):
    """长时间任务"""
    print(f"  [{name}] 开始执行...")
    await asyncio.sleep(delay)
    print(f"  [{name}] 执行完毕")
    return f"{name}结果"

async def task_manager():
    """任务管理器：创建任务后可以先做其他事"""
    # create_task 立即调度任务，返回 Task 对象
    task1 = asyncio.create_task(long_task("任务A", 0.5), name="Task-A")
    task2 = asyncio.create_task(long_task("任务B", 0.3), name="Task-B")

    print("  任务已创建，主协程可以做其他事情...")
    await asyncio.sleep(0.1)
    print("  主协程处理其他事务中...")

    # 等待特定任务完成
    result2 = await task2
    print(f"  任务B的结果：{result2}")

    # 等待任务A
    result1 = await task1
    print(f"  任务A的结果：{result1}")

asyncio.run(task_manager())

# ============ 5. 查看 Task 状态 ============
print()
print("=== 5. Task 状态查询 ===")

async def task_status_demo():
    """演示 Task 的各种状态"""
    async def slow_work():
        await asyncio.sleep(0.3)
        return "完成"

    task = asyncio.create_task(slow_work())
    print(f"  刚创建：done={task.done()}, cancelled={task.cancelled()}")
    await asyncio.sleep(0.1)
    print(f"  执行中：done={task.done()}, cancelled={task.cancelled()}")
    result = await task
    print(f"  完成后：done={task.done()}, cancelled={task.cancelled()}")
    print(f"  结果：{result}")

asyncio.run(task_status_demo())

# ============ 6. 异步 vs 同步性能对比 ============
print()
print("=== 6. 异步 vs 同步 性能对比 ===")

async def async_io_task(task_id):
    """异步 I/O 任务"""
    await asyncio.sleep(0.1)
    return task_id

def sync_io_task(task_id):
    """同步 I/O 任务"""
    time.sleep(0.1)
    return task_id

async def run_async_benchmark():
    """异步方式：并发执行"""
    start = time.time()
    results = await asyncio.gather(*[async_io_task(i) for i in range(20)])
    elapsed = time.time() - start
    print(f"  异步方式 20个任务耗时：{elapsed:.2f}s（几乎等于单个任务时间）")

def run_sync_benchmark():
    """同步方式：顺序执行"""
    start = time.time()
    results = [sync_io_task(i) for i in range(20)]
    elapsed = time.time() - start
    print(f"  同步方式 20个任务耗时：{elapsed:.2f}s（每个任务累加）")

asyncio.run(run_async_benchmark())
run_sync_benchmark()

print()
print("=" * 40)
print("  asyncio 异步编程基础演示完毕")
print("=" * 40)`
  },
  {
    id: "py8-asyncio-adv",
    group: "并发与网络",
    icon: "🏃",
    title: "asyncio 进阶与实战",
    content: `## 进阶异步编程

基础篇学习了 async/await 和事件循环，现在深入更高级的异步工具。

### asyncio.wait_for 超时控制

设置任务的最大执行时间，超时则抛出 \`TimeoutError\`：

\`\`\`python
try:  # 尝试执行可能出错的代码
    result = await asyncio.wait_for(slow_task(), timeout=5.0)  # 赋值变量 result
except asyncio.TimeoutError:  # 捕获异常 asyncio.TimeoutError:
    print("任务超时了！")  # 打印输出到屏幕
\`\`\`

### asyncio.shield 保护任务

防止任务被取消，即使外部操作被取消，被保护的任务也会继续执行：

\`\`\`python
# 取消 outer 不会影响 inner 的执行
await asyncio.shield(inner_task)  # 执行操作
\`\`\`

### asyncio.Queue 异步队列

生产者-消费者模式的异步版本，队列满时 put 会等待，空时 get 会等待：

\`\`\`python
queue = asyncio.Queue(maxsize=10)  # 赋值变量 queue
await queue.put(item)   # 放入（可能等待）
item = await queue.get()  # 取出（可能等待）
queue.task_done()        # 标记任务完成
\`\`\`

### asyncio.Lock 异步锁

异步版的互斥锁，保护共享资源：

\`\`\`python
lock = asyncio.Lock()  # 赋值变量 lock

async def critical_section():  # 定义异步函数 critical_section
    async with lock:  # 执行操作
        # 同一时刻只有一个协程能进入
        await modify_shared_data()  # 执行操作
\`\`\`

### asyncio.Semaphore 异步信号量

限制并发协程数量：

\`\`\`python
sem = asyncio.Semaphore(3)  # 最多3个并发

async def limited_task():  # 定义异步函数 limited_task
    async with sem:  # 执行操作
        await do_work()  # 执行操作
\`\`\`

### 生产者-消费者模式

异步版本的经典模式，用 Queue 解耦生产者和消费者：

\`\`\`python
async def producer(queue):  # 定义异步函数 producer，参数：queue
    for i in range(10):  # 遍历 range(10)，取值给 i
        await queue.put(f"产品{i}")  # 执行操作
        await asyncio.sleep(0.1)  # 执行操作

async def consumer(queue, name):  # 定义异步函数 consumer，参数：queue, name
    while True:  # 当 True 时循环
        item = await queue.get()  # 赋值变量 item
        # 处理 item
        queue.task_done()  # 调用 queue.task_done()：标记任务完成
\`\`\`

### async with 与 async for

**async with**：异步上下文管理器，用于需要异步初始化/清理的资源：

\`\`\`python
async with some_async_resource() as res:  # 执行操作
    await res.use()  # 执行操作
\`\`\`

**async for**：异步迭代器，每次迭代都可能 await：

\`\`\`python
async for item in async_generator():  # 执行操作
    print(item)  # 打印输出到屏幕
\`\`\`

### 异步生成器

用 \`async def\` + \`yield\` 定义异步生成器：

\`\`\`python
async def async_range(n):  # 定义异步函数 async_range，参数：n
    for i in range(n):  # 遍历 range(n)，取值给 i
        await asyncio.sleep(0.1)  # 执行操作
        yield i  # 生成值：i
\`\`\`

下面的 demo 综合演示 wait_for、shield、Queue、Lock、Semaphore、生产者消费者、async with/for 等进阶用法。`,
    code: `# ==========================================
# asyncio 进阶与实战 完整演示
# ==========================================
import asyncio
import time

# ============ 1. wait_for 超时控制 ============
print("=== 1. wait_for 超时控制 ===")

async def slow_operation(delay):
    """模拟耗时操作"""
    await asyncio.sleep(delay)
    return f"操作完成（耗时{delay}s）"

async def timeout_demo():
    # 正常完成的任务
    try:
        result = await asyncio.wait_for(slow_operation(0.2), timeout=1.0)
        print(f"  正常完成：{result}")
    except asyncio.TimeoutError:
        print("  超时了（不应该发生）")

    # 会超时的任务
    try:
        result = await asyncio.wait_for(slow_operation(0.5), timeout=0.2)
        print(f"  结果：{result}")
    except asyncio.TimeoutError:
        print("  任务超时！被取消了")

asyncio.run(timeout_demo())

# ============ 2. asyncio.shield 保护任务 ============
print()
print("=== 2. asyncio.shield 保护任务 ===")

async def important_task():
    """重要任务：即使外部取消也要完成"""
    try:
        await asyncio.sleep(0.2)
        print("  重要任务执行完毕")
        return "重要数据"
    except asyncio.CancelledError:
        print("  重要任务被取消了（但 shield 保护了它）")
        raise

async def shield_demo():
    task = asyncio.create_task(important_task())
    # shield 保护：取消外层不影响被保护的任务
    try:
        await asyncio.wait_for(asyncio.shield(task), timeout=0.05)
    except asyncio.TimeoutError:
        print("  外层超时了，但内层任务被 shield 保护，继续执行...")

    # 等待被保护的任务真正完成
    result = await task
    print(f"  最终获取到结果：{result}")

asyncio.run(shield_demo())

# ============ 3. asyncio.Queue 异步队列 ============
print()
print("=== 3. asyncio.Queue 异步队列 ===")

async def async_producer(queue, n):
    """异步生产者"""
    for i in range(n):
        await asyncio.sleep(0.1)
        item = f"产品{i}"
        await queue.put(item)
        print(f"  [生产者] 生产了 {item}")

async def async_consumer(queue, name):
    """异步消费者"""
    while True:
        item = await queue.get()
        print(f"  [消费者{name}] 消费了 {item}")
        await asyncio.sleep(0.15)  # 模拟消费耗时
        queue.task_done()
        if item == "产品4":  # 最后一个产品
            break

async def queue_demo():
    q = asyncio.Queue(maxsize=3)  # 最多存3个
    # 生产者和消费者并发运行
    await asyncio.gather(
        async_producer(q, 5),
        async_consumer(q, "A"),
    )

asyncio.run(queue_demo())

# ============ 4. asyncio.Lock 异步锁 ============
print()
print("=== 4. asyncio.Lock 异步锁 ===")

shared_counter = 0
async_lock = asyncio.Lock()

async def safe_increment(name, n):
    """异步加锁自增"""
    global shared_counter
    for _ in range(n):
        async with async_lock:
            current = shared_counter
            await asyncio.sleep(0.001)  # 模拟微小延迟
            shared_counter = current + 1

async def lock_demo():
    global shared_counter
    shared_counter = 0
    # 10个协程同时自增100次
    await asyncio.gather(*[safe_increment(f"worker{i}", 100) for i in range(10)])
    print(f"  10个协程各加100次，期望1000，实际：{shared_counter}")

asyncio.run(lock_demo())

# ============ 5. asyncio.Semaphore 异步信号量 ============
print()
print("=== 5. asyncio.Semaphore 限制并发 ===")

# 限制同时最多3个"API请求"
api_sem = asyncio.Semaphore(3)

async def api_call(task_id):
    """模拟 API 调用，信号量控制并发数"""
    async with api_sem:
        print(f"  [请求{task_id}] 开始 (当前并发可能已达上限)")
        await asyncio.sleep(0.2)
        print(f"  [请求{task_id}] 完成")
        return f"响应{task_id}"

async def semaphore_demo():
    # 10个请求，但最多3个同时进行
    tasks = [api_call(i) for i in range(1, 11)]
    results = await asyncio.gather(*tasks)
    print(f"  全部完成，结果数：{len(results)}")

asyncio.run(semaphore_demo())

# ============ 6. 生产者-消费者完整模式 ============
print()
print("=== 6. 生产者-消费者完整模式 ===")

async def producer_worker(queue, n):
    """生产者：生产n个任务"""
    for i in range(n):
        await asyncio.sleep(0.05)
        await queue.put(f"任务{i}")
    # 发送结束信号（None 表示结束）
    await queue.put(None)

async def consumer_worker(queue, name, results):
    """消费者：处理任务直到收到结束信号"""
    while True:
        item = await queue.get()
        if item is None:
            # 把结束信号放回去，让其他消费者也能收到
            await queue.put(None)
            break
        # 处理任务
        await asyncio.sleep(0.1)
        results.append(f"{name}处理了{item}")
        print(f"  [{name}] 处理了 {item}")

async def pc_demo():
    queue = asyncio.Queue()
    results = []

    await asyncio.gather(
        producer_worker(queue, 10),
        consumer_worker(queue, "消费者A", results),
        consumer_worker(queue, "消费者B", results),
    )
    print(f"  共处理了 {len(results)} 个任务")

asyncio.run(pc_demo())

# ============ 7. 异步生成器 async for ============
print()
print("=== 7. 异步生成器 async for ===")

async def async_counter(n):
    """异步生成器：每次 yield 前可以 await"""
    for i in range(1, n + 1):
        await asyncio.sleep(0.05)
        yield i

async def async_for_demo():
    print("  异步迭代：", end=" ")
    async for num in async_counter(5):
        print(num, end=" ", flush=True)
    print()

asyncio.run(async_for_demo())

# ============ 8. async with 异步上下文管理器 ============
print()
print("=== 8. async with 异步上下文管理器 ===")

class AsyncResource:
    """异步资源：需要异步初始化和清理"""

    async def __aenter__(self):
        print("  [AsyncResource] 正在异步初始化...")
        await asyncio.sleep(0.1)
        print("  [AsyncResource] 初始化完成")
        return self

    async def __aexit__(self, *args):
        print("  [AsyncResource] 正在异步清理...")
        await asyncio.sleep(0.05)
        print("  [AsyncResource] 清理完成")

    async def do_work(self):
        await asyncio.sleep(0.1)
        return "工作完成"

async def async_with_demo():
    async with AsyncResource() as res:
        result = await res.do_work()
        print(f"  使用资源的结果：{result}")

asyncio.run(async_with_demo())

# ============ 9. 任务取消 ============
print()
print("=== 9. 任务取消 ===")

async def cancellable_task():
    """可取消的任务"""
    try:
        print("  任务开始，将运行1.5秒...")
        for i in range(5):
            await asyncio.sleep(0.3)
            print(f"  ...已运行 {i+1} 轮")
    except asyncio.CancelledError:
        print("  任务被取消了！进行清理工作...")
        await asyncio.sleep(0.1)  # 清理
        print("  清理完成")
        raise  # 重新抛出 CancelledError

async def cancel_demo():
    task = asyncio.create_task(cancellable_task())
    await asyncio.sleep(0.1)  # 等一会儿
    task.cancel()  # 取消任务
    try:
        await task
    except asyncio.CancelledError:
        print("  已确认任务取消")

asyncio.run(cancel_demo())

print()
print("=" * 40)
print("  asyncio 进阶与实战演示完毕")
print("=" * 40)`
  },
  {
    id: "py8-http-client",
    group: "并发与网络",
    icon: "🌍",
    title: "urllib 与 HTTP 客户端",
    content: `## HTTP 协议简介

HTTP（HyperText Transfer Protocol）是 Web 的基石，浏览器和服务器之间通过 HTTP 传输数据。Python 的 \`urllib\` 模块是标准库中的 HTTP 客户端，无需安装第三方库。

### urllib 模块组成

| 子模块 | 功能 |
|--------|------|
| \`urllib.request\` | 发送 HTTP 请求 |
| \`urllib.parse\` | URL 解析和编码 |
| \`urllib.error\` | 异常处理 |
| \`urllib.robotparser\` | robots.txt 解析 |

### GET 请求

\`\`\`python
from urllib.request import urlopen  # 从 urllib.request 导入 urlopen

# 最简单的 GET
with urlopen("https://httpbin.org/get") as response:  # 使用上下文管理器：urlopen("https://httpbin.org/get") as response
    data = response.read()  # 读取响应体（bytes）
    text = data.decode("utf-8")  # 解码为字符串
\`\`\`

### POST 请求

\`\`\`python
from urllib.request import urlopen, Request  # 从 urllib.request 导入 urlopen, Request
from urllib.parse import urlencode  # 从 urllib.parse 导入 urlencode

data = urlencode({"name": "小明", "age": "18"}).encode()  # 赋值变量 data
req = Request("https://httpbin.org/post", data=data, method="POST")  # 赋值变量 req
with urlopen(req) as response:  # 使用上下文管理器：urlopen(req) as response
    print(response.read().decode())  # 打印输出到屏幕
\`\`\`

### Request 对象详解

\`\`\`python
req = Request(  # 赋值变量 req
    url="https://api.example.com/data",  # 定义字符串 url
    data=post_data,      # POST 请求体
    headers={            # 自定义请求头
        "User-Agent": "MyApp/1.0",  # 执行操作
        "Content-Type": "application/json",  # 执行操作
    },
    method="POST",  # 定义字符串 method
)
\`\`\`

### 响应处理

\`\`\`python
with urlopen(req) as resp:  # 使用上下文管理器：urlopen(req) as resp
    resp.status       # 状态码（200, 404, 500...）
    resp.getheaders() # 响应头列表
    resp.getheader("Content-Type")  # 获取特定响应头
    body = resp.read()  # 读取响应体
\`\`\`

### urllib.parse 常用函数

\`\`\`python
from urllib.parse import urlencode, quote, unquote, urlparse  # 从 urllib.parse 导入 urlencode, quote, unquote, urlparse

urlencode({"q": "python教程"}))  # q=python%E6%95%99%E7%A8%8B
quote("你好世界")                # 对URL编码
unquote("%E4%BD%A0%E5%A5%BD")   # URL解码
urlparse("https://a.com/path?q=1")  # 解析URL各部分
\`\`\`

### 异常处理

\`\`\`python
from urllib.error import URLError, HTTPError  # 从 urllib.error 导入 URLError, HTTPError

try:  # 尝试执行可能出错的代码
    with urlopen("https://httpbin.org/status/404") as resp:  # 使用上下文管理器：urlopen("https://httpbin.org/status/404") as resp
        pass  # 空操作，占位符
except HTTPError as e:  # 捕获异常 HTTPError
    print(f"HTTP错误：{e.code} {e.reason}")  # 打印输出到屏幕
except URLError as e:  # 捕获异常 URLError
    print(f"URL错误：{e.reason}")  # 打印输出到屏幕
\`\`\`

### JSON 响应处理

\`\`\`python
import json  # 导入模块 json

with urlopen("https://api.example.com/data") as resp:  # 使用上下文管理器：urlopen("https://api.example.com/data") as resp
    data = json.loads(resp.read().decode())  # 赋值变量 data
    print(data["key"])  # 打印输出到屏幕
\`\`\`

下面的 demo 演示 urllib 的 GET/POST 请求、URL 编码、响应处理、异常处理等常用操作。`,
    code: `# ==========================================
# urllib HTTP 客户端 完整演示
# ==========================================
from urllib.request import urlopen, Request
from urllib.parse import urlencode, quote, unquote, urlparse, urljoin
from urllib.error import URLError, HTTPError
import json

# ============ 1. URL 解析与编码 ============
print("=== 1. URL 解析与编码 ===")

# urlparse 解析 URL 各部分
url = "https://www.example.com:8080/search?q=python&page=1#section"
parsed = urlparse(url)
print(f"  原始URL：{url}")
print(f"  协议(scheme)：{parsed.scheme}")
print(f"  主机(netloc)：{parsed.netloc}")
print(f"  路径(path)：{parsed.path}")
print(f"  查询参数(params)：{parsed.params}")
print(f"  查询字符串(query)：{parsed.query}")
print(f"  片段(fragment)：{parsed.fragment}")

# urlencode 编码查询参数
params = {"q": "Python教程", "page": "1", "sort": "newest"}
encoded = urlencode(params)
print()
print(f"  原始参数：{params}")
print(f"  URL编码后：{encoded}")

# quote / unquote 编码解码
original = "你好，世界！"
encoded_str = quote(original)
decoded_str = unquote(encoded_str)
print(f"  quote编码：'{original}' -> '{encoded_str}'")
print(f"  unquote解码：'{encoded_str}' -> '{decoded_str}'")

# urljoin 拼接URL
base = "https://api.example.com/v1/"
print()
print(f"  urljoin: {urljoin(base, 'users')}")
print(f"  urljoin: {urljoin(base, '../images/logo.png')}")

# ============ 2. 构建 Request 对象 ============
print()
print("=== 2. 构建 Request 对象 ===")

# GET 请求的 Request
get_req = Request(
    url="https://httpbin.org/get?name=test&value=123",
    headers={
        "User-Agent": "Python-urllib/3.x",
        "Accept": "application/json",
    },
)
print(f"  GET Request URL：{get_req.full_url}")
print(f"  GET Request Method：{get_req.get_method()}")
print(f"  GET Request Headers：{dict(get_req.headers)}")

# POST 请求的 Request（表单数据）
post_data = urlencode({"username": "小明", "password": "123456"}).encode("utf-8")
post_req = Request(
    url="https://httpbin.org/post",
    data=post_data,
    headers={"Content-Type": "application/x-www-form-urlencoded"},
    method="POST",
)
print()
print(f"  POST Request URL：{post_req.full_url}")
print(f"  POST Request Method：{post_req.get_method()}")
print(f"  POST Request Body：{post_data.decode()}")

# JSON POST 请求
json_data = json.dumps({"name": "小明", "score": 95}).encode("utf-8")
json_req = Request(
    url="https://httpbin.org/post",
    data=json_data,
    headers={"Content-Type": "application/json"},
    method="POST",
)
print()
print(f"  JSON POST Body：{json_data.decode()}")

# ============ 3. 发送请求并处理响应 ============
print()
print("=== 3. 发送 HTTP 请求 ===")

def safe_request(url, max_retries=2):
    """安全请求：带重试和异常处理"""
    for attempt in range(max_retries):
        try:
            with urlopen(url, timeout=5) as response:
                status = response.status
                content_type = response.getheader("Content-Type", "unknown")
                body = response.read().decode("utf-8")
                return status, content_type, body
        except HTTPError as e:
            print(f"  HTTP错误 {e.code}：{e.reason}")
            if attempt == max_retries - 1:
                return e.code, None, str(e)
        except URLError as e:
            print(f"  URL错误：{e.reason}")
            if attempt == max_retries - 1:
                return None, None, str(e)
    return None, None, "未知错误"

# 尝试发送 GET 请求（网络可能不可用）
print("  尝试 GET 请求 httpbin.org/get ...")
status, content_type, body = safe_request("https://httpbin.org/get")
if status:
    print(f"  状态码：{status}")
    print(f"  Content-Type：{content_type}")
    # 尝试解析 JSON
    try:
        data = json.loads(body)
        print(f"  响应JSON键：{list(data.keys())}")
        print(f"  origin：{data.get('origin', 'N/A')}")
        if "headers" in data:
            print(f"  服务器看到的请求头：")
            for k, v in list(data["headers"].items())[:3]:
                print(f"    {k}: {v}")
    except json.JSONDecodeError:
        print(f"  响应前200字符：{body[:200]}...")
else:
    print("  网络不可用，跳过实际请求")

# ============ 4. 模拟 REST API 调用 ============
print()
print("=== 4. 模拟 REST API 调用 ===")

# 由于网络可能不可用，用本地模拟演示 API 调用流程
class MockResponse:
    """模拟 HTTP 响应"""
    def __init__(self, status, data, headers=None):
        self.status = status
        self._data = data
        self.headers = headers or {}

    def read(self):
        return json.dumps(self._data).encode("utf-8")

    def getheader(self, name, default=None):
        return self.headers.get(name, default)

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass

# 模拟一个简单的 API 客户端
def simulate_api_call():
    """模拟 REST API 调用流程"""
    # 模拟 GET /users
    users = [
        {"id": 1, "name": "小明", "email": "xiaoming@example.com"},
        {"id": 2, "name": "小红", "email": "xiaohong@example.com"},
        {"id": 3, "name": "小刚", "email": "xiaogang@example.com"},
    ]

    print("  GET /users")
    resp = MockResponse(200, {"users": users, "total": len(users)},
                        {"Content-Type": "application/json"})
    data = json.loads(resp.read())
    print(f"  状态码：{resp.status}")
    print(f"  用户总数：{data['total']}")
    for u in data["users"]:
        print(f"    ID:{u['id']} {u['name']} ({u['email']})")

    # 模拟 POST /users
    print()
    print("  POST /users (创建新用户)")
    new_user = {"name": "小李", "email": "xiaoli@example.com"}
    resp = MockResponse(201, {"id": 4, **new_user},
                        {"Content-Type": "application/json"})
    data = json.loads(resp.read())
    print(f"  状态码：{resp.status} (已创建)")
    print(f"  新用户：ID:{data['id']} {data['name']}")

    # 模拟 404 错误
    print()
    print("  GET /users/999 (不存在)")
    resp = MockResponse(404, {"error": "用户不存在"},
                        {"Content-Type": "application/json"})
    data = json.loads(resp.read())
    print(f"  状态码：{resp.status}")
    print(f"  错误信息：{data['error']}")

simulate_api_call()

# ============ 5. 异常处理总结 ============
print()
print("=== 5. 常见异常处理 ===")

error_scenarios = [
    ("HTTPError", "服务器返回了错误状态码（如 404, 500）"),
    ("URLError", "网络不可达或 URL 格式错误"),
    ("TimeoutError", "请求超时"),
    ("json.JSONDecodeError", "响应不是有效的 JSON"),
]

for err_type, desc in error_scenarios:
    print(f"  {err_type}: {desc}")

print()
print("=" * 40)
print("  urllib HTTP 客户端演示完毕")
print("=" * 40)`
  },
  {
    id: "py8-socket",
    group: "并发与网络",
    icon: "🔌",
    title: "socket 网络编程",
    content: `## Socket 是什么

Socket（套接字）是网络通信的**端点**，可以理解为两台计算机之间的"电话"。一台"拨号"（connect），另一台"接听"（accept），然后双方就可以通话（send/recv）。

### TCP vs UDP

| 特性 | TCP | UDP |
|------|-----|-----|
| 连接 | 面向连接（三次握手） | 无连接 |
| 可靠性 | 保证送达、有序 | 不保证送达 |
| 速度 | 较慢 | 较快 |
| 适用场景 | 网页、文件、邮件 | 视频、直播、游戏 |
| 类比 | 打电话（确认接通） | 发短信（直接发送） |

### socket 编程流程

**服务器端：**
\`\`\`python
import socket  # 导入模块 socket

# 1. 创建 socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  # 赋值变量 s

# 2. 绑定地址和端口
s.bind(("localhost", 8888))  # 调用 s.bind()：绑定

# 3. 开始监听
s.listen(5)  # 调用 s.listen()：监听

# 4. 接受连接
conn, addr = s.accept()  # 多重赋值：conn, addr

# 5. 收发数据
data = conn.recv(1024)  # 赋值变量 data
conn.send(b"Hello!")  # 调用 conn.send()：发送

# 6. 关闭连接
conn.close()  # 调用 conn.close()：关闭
s.close()  # 调用 s.close()：关闭
\`\`\`

**客户端：**
\`\`\`python
import socket  # 导入模块 socket

# 1. 创建 socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  # 赋值变量 s

# 2. 连接服务器
s.connect(("localhost", 8888))  # 调用 s.connect()：连接

# 3. 发送数据
s.send(b"Hello Server!")  # 调用 s.send()：发送

# 4. 接收数据
data = s.recv(1024)  # 赋值变量 data

# 5. 关闭
s.close()  # 调用 s.close()：关闭
\`\`\`

### 关键参数说明

- **AF_INET**：IPv4 地址族
- **AF_INET6**：IPv6 地址族
- **SOCK_STREAM**：TCP 协议
- **SOCK_DGRAM**：UDP 协议
- **recv(1024)**：一次最多接收 1024 字节
- **send(data)**：发送数据（必须是 bytes）

### 常用函数

| 函数 | 说明 |
|------|------|
| \`socket.gethostname()\` | 获取本机主机名 |
| \`socket.gethostbyname(host)\` | 主机名 → IP 地址 |
| \`socket.getaddrinfo(host, port)\` | 获取地址信息 |
| \`s.setsockopt(level, opt, val)\` | 设置 socket 选项 |
| \`SO_REUSEADDR\` | 允许重用地址（服务器重启后快速绑定） |

### 网络字节序

不同 CPU 架构的字节序可能不同（大端 vs 小端）。网络传输统一使用**大端字节序**（network byte order）：

\`\`\`python
import socket  # 导入模块 socket
socket.htonl(12345)   # host to network (long)
socket.ntohl(x)       # network to host (long)
socket.htons(8080)    # host to network (short) — 用于端口号
socket.ntohs(x)        # network to host (short)
\`\`\`

下面的 demo 在本地创建 TCP echo 服务器和客户端，完整演示 socket 通信流程。`,
    code: `# ==========================================
# socket 网络编程 完整演示
# ==========================================
import socket
import threading
import time

# ============ 1. 主机名与 IP 地址 ============
print("=== 1. 主机名与 IP 地址 ===")

hostname = socket.gethostname()
print(f"  本机主机名：{hostname}")

try:
    ip = socket.gethostbyname(hostname)
    print(f"  本机 IP 地址：{ip}")
except socket.gaierror:
    print(f"  无法获取本机 IP")

# 获取 localhost 的 IP
localhost_ip = socket.gethostbyname("localhost")
print(f"  localhost IP：{localhost_ip}")

# getaddrinfo 获取详细地址信息
print()
print("  获取 localhost:80 的地址信息：")
try:
    addrinfo = socket.getaddrinfo("localhost", 80, socket.AF_INET, socket.SOCK_STREAM)
    for family, socktype, proto, canonname, sockaddr in addrinfo:
        print(f"    family={family}, type={socktype}, addr={sockaddr}")
except socket.gaierror as e:
    print(f"    获取失败：{e}")

# ============ 2. TCP Echo 服务器 ============
print()
print("=== 2. TCP Echo 服务器与客户端 ===")

# 用队列收集服务器收到的消息
server_log = []
server_ready = threading.Event()

def run_echo_server():
    """运行一个简单的 Echo 服务器（在独立线程中）"""
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # SO_REUSEADDR：允许重用地址，避免重启时 "Address already in use" 错误
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    # 绑定到 localhost 和一个随机可用端口
    server_socket.bind(("127.0.0.1", 0))  # 端口0表示系统自动分配
    host, port = server_socket.getsockname()
    server_socket.listen(2)
    server_log.append(f"服务器启动在 {host}:{port}")

    # 通知主线程服务器已就绪，并传递端口号
    server_ready.port = port
    server_ready.set()

    try:
        # 接受客户端连接
        server_socket.settimeout(2)  # 2秒超时，避免永久阻塞
        conn, addr = server_socket.accept()
        server_log.append(f"接受连接来自 {addr}")

        # 接收数据
        data = conn.recv(1024)
        server_log.append(f"收到：{data.decode()}")

        # 回显（Echo）
        response = b"ECHO: " + data
        conn.send(response)
        server_log.append(f"回显：{response.decode()}")

        conn.close()
    except socket.timeout:
        server_log.append("等待连接超时")
    finally:
        server_socket.close()
        server_log.append("服务器关闭")

# 启动服务器线程
server_thread = threading.Thread(target=run_echo_server, daemon=True)
server_thread.start()

# 等待服务器就绪
server_ready.wait(timeout=3)

if hasattr(server_ready, "port"):
    port = server_ready.port
    print(f"  服务器端口：{port}")

    # 客户端连接
    time.sleep(0.1)  # 确保服务器已启动
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    try:
        client_socket.connect(("127.0.0.1", port))
        print(f"  客户端已连接到 127.0.0.1:{port}")

        # 发送消息
        message = b"Hello, TCP Echo Server!"
        client_socket.send(message)
        print(f"  客户端发送：{message.decode()}")

        # 接收回显
        response = client_socket.recv(1024)
        print(f"  客户端收到：{response.decode()}")

    except ConnectionRefusedError:
        print("  连接被拒绝")
    finally:
        client_socket.close()

    # 等待服务器线程结束
    server_thread.join(timeout=3)

    # 打印服务器日志
    print()
    print("  服务器日志：")
    for log in server_log:
        print(f"    - {log}")

# ============ 3. TCP vs UDP 概念对比 ============
print()
print("=== 3. TCP vs UDP 对比 ===")

# TCP Socket
tcp_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
print(f"  TCP Socket 类型：{tcp_socket.type} (SOCK_STREAM={socket.SOCK_STREAM})")
tcp_socket.close()

# UDP Socket
udp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
print(f"  UDP Socket 类型：{udp_socket.type} (SOCK_DGRAM={socket.SOCK_DGRAM})")
udp_socket.close()

# ============ 4. setsockopt 常用选项 ============
print()
print("=== 4. setsockopt 常用选项 ===")

demo_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# SO_REUSEADDR：允许重用地址
demo_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
print(f"  已设置 SO_REUSEADDR（允许重用地址）")

# SO_KEEPALIVE：TCP 保活
demo_socket.setsockopt(socket.SOL_SOCKET, socket.SO_KEEPALIVE, 1)
print(f"  已设置 SO_KEEPALIVE（TCP保活）")

# 获取 socket 选项
reuse = demo_socket.getsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR)
print(f"  SO_REUSEADDR 当前值：{reuse}")

demo_socket.close()

# ============ 5. 网络字节序 ============
print()
print("=== 5. 网络字节序转换 ===")

# 网络传输统一使用大端字节序
host_port = 8080
net_port = socket.htons(host_port)  # host to network short
back_port = socket.ntohs(net_port)  # network to host short

print(f"  主机端口号：{host_port}")
print(f"  网络字节序：{net_port} (htons)")
print(f"  转回主机序：{back_port} (ntohs)")

# 32位整数转换
host_int = 0x12345678
net_int = socket.htonl(host_int)
back_int = socket.ntohl(net_int)
print()
print(f"  主机32位整数：{hex(host_int)}")
print(f"  网络字节序：{hex(net_int)} (htonl)")
print(f"  转回主机序：{hex(back_int)} (ntohl)")

# ============ 6. Socket 通信流程总结 ============
print()
print("=== 6. Socket 通信流程总结 ===")

print("  服务器端流程：")
print("    socket() -> bind() -> listen() -> accept() -> recv/send() -> close()")
print()
print("  客户端流程：")
print("    socket() -> connect() -> send/recv() -> close()")

print()
print("=" * 40)
print("  socket 网络编程演示完毕")
print("=" * 40)`
  },
  {
    id: "py8-email-smtp",
    group: "并发与网络",
    icon: "📧",
    title: "email 与 SMTP 邮件处理",
    content: `## 邮件处理概述

Python 的 \`email\` 模块用于**构建和解析**邮件，\`smtplib\` 用于**发送**邮件。两个模块配合使用可以完成邮件的完整处理。

### email 模块核心类

| 类 | 说明 |
|-----|------|
| \`MIMEText\` | 纯文本邮件正文 |
| \`MIMEImage\` | 图片附件 |
| \`MIMEMultipart\` | 混合内容（正文+附件） |
| \`Header\` | 邮件头（处理中文等非 ASCII 字符） |

### 构建一封简单邮件

\`\`\`python
from email.mime.text import MIMEText  # 从 email.mime.text 导入 MIMEText

# 创建纯文本邮件
msg = MIMEText("你好，这是邮件正文。", "plain", "utf-8")  # 赋值变量 msg
msg["Subject"] = "测试邮件"  # 执行操作
msg["From"] = "sender@example.com"  # 执行操作
msg["To"] = "receiver@example.com"  # 执行操作

print(msg.as_string())  # 转为字符串
\`\`\`

### 构建带附件的邮件

\`\`\`python
from email.mime.multipart import MIMEMultipart  # 从 email.mime.multipart 导入 MIMEMultipart
from email.mime.text import MIMEText  # 从 email.mime.text 导入 MIMEText
from email.mime.base import MIMEBase  # 从 email.mime.base 导入 MIMEBase

msg = MIMEMultipart()  # 赋值变量 msg
msg["Subject"] = "带附件的邮件"  # 执行操作
msg["From"] = "sender@example.com"  # 执行操作
msg["To"] = "receiver@example.com"  # 执行操作

# 添加正文
msg.attach(MIMEText("这是邮件正文", "plain", "utf-8"))  # 调用 msg.attach()

# 添加附件
att = MIMEBase("application", "octet-stream")  # 赋值变量 att
att.set_payload(file_data)  # 调用 att.set_payload()
att.add_header("Content-Disposition", "attachment", filename="report.pdf")  # 调用 att.add_header()
msg.attach(att)  # 调用 msg.attach()
\`\`\`

### smtplib 发送邮件

\`\`\`python
import smtplib  # 导入模块 smtplib

# 连接 SMTP 服务器
server = smtplib.SMTP("smtp.gmail.com", 587)  # 赋值变量 server
server.starttls()  # 启用 TLS 加密
server.login("user@gmail.com", "password")  # 调用 server.login()
server.send_message(msg)  # 调用 server.send_message()
server.quit()  # 调用 server.quit()
\`\`\`

### 解析邮件

\`\`\`python
from email.parser import Parser  # 从 email.parser 导入 Parser

# 解析原始邮件字符串
parser = Parser()  # 赋值变量 parser
msg = parser.parsestr(raw_email)  # 赋值变量 msg

print(msg["Subject"])  # 获取主题
print(msg["From"])     # 获取发件人

# 获取正文
for part in msg.walk():  # 遍历 msg.walk()，取值给 part
    if part.get_content_type() == "text/plain":  # 如果 part.get_content_type() == "text/plain"
        body = part.get_payload(decode=True).decode()  # 赋值变量 body
\`\`\`

### 邮件地址格式

\`\`\`python
# 标准格式
"张三 <zhangsan@example.com>"  # 执行操作

# 使用 email.utils 处理
from email.utils import formataddr, parseaddr  # 从 email.utils 导入 formataddr, parseaddr

formataddr(("张三", "zhangsan@example.com"))  # 调用 formataddr()
# 输出：'张三 <zhangsan@example.com>'

parseaddr("张三 <zhangsan@example.com>")  # 调用 parseaddr()
# 输出：('张三', 'zhangsan@example.com')
\`\`\`

### base64 编码

邮件中的附件和二进制数据通常用 base64 编码传输：

\`\`\`python
import base64  # 导入模块 base64

encoded = base64.b64encode(b"Hello World")  # 赋值变量 encoded
decoded = base64.b64decode(encoded)  # 赋值变量 decoded
\`\`\`

下面的 demo 演示构建邮件、解析邮件、处理附件、base64 编码等操作（不实际发送邮件，避免网络依赖）。`,
    code: `# ==========================================
# email 与 SMTP 邮件处理 完整演示
# ==========================================
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.image import MIMEImage
from email.header import Header
from email.utils import formataddr, parseaddr, formatdate
from email.parser import Parser, BytesParser
from email import policy
import base64

# ============ 1. 构建纯文本邮件 ============
print("=== 1. 构建纯文本邮件 ===")

# MIMEText：纯文本邮件正文
msg = MIMEText("你好，这是一封测试邮件。\\n\\n祝好！", "plain", "utf-8")

# 设置邮件头
msg["Subject"] = Header("测试邮件 - 纯文本", "utf-8")
msg["From"] = formataddr(("张三", "zhangsan@example.com"))
msg["To"] = formataddr(("李四", "lisi@example.com"))
msg["Date"] = formatdate(localtime=True)

print("  邮件头信息：")
print(f"    Subject: {msg['Subject']}")
print(f"    From: {msg['From']}")
print(f"    To: {msg['To']}")
print(f"    Date: {msg['Date']}")
print(f"    Content-Type: {msg.get_content_type()}")

# 获取邮件原始字符串
raw = msg.as_string()
print(f"\\n  邮件原始大小：{len(raw)} 字节")
print(f"  邮件前150字符：{raw[:150]}...")

# ============ 2. 构建 HTML 邮件 ============
print()
print("=== 2. 构建 HTML 邮件 ===")

html_content = """
<html>
  <body>
    <h2>欢迎订阅</h2>
    <p>你好，<b>用户</b>！</p>
    <p>感谢你注册我们的服务，请点击下方链接激活账号：</p>
    <a href="https://example.com/activate">激活账号</a>
    <p style="color: gray; font-size: 12px;">此邮件由系统自动发送，请勿回复</p>
  </body>
</html>
"""

html_msg = MIMEText(html_content, "html", "utf-8")
html_msg["Subject"] = Header("欢迎注册 - 请激活账号", "utf-8")
html_msg["From"] = formataddr(("系统通知", "noreply@example.com"))
html_msg["To"] = "user@example.com"

print(f"  邮件类型：{html_msg.get_content_type()}")
print(f"  HTML 内容长度：{len(html_content)} 字符")

# ============ 3. 构建带附件的邮件（MIMEMultipart） ============
print()
print("=== 3. 构建带附件的邮件 ===")

# MIMEMultipart 用于混合内容（正文 + 附件）
multi_msg = MIMEMultipart()
multi_msg["Subject"] = Header("月度报告 - 带附件", "utf-8")
multi_msg["From"] = formataddr(("报告系统", "report@example.com"))
multi_msg["To"] = formataddr(("经理", "manager@example.com"))
multi_msg["Date"] = formatdate(localtime=True)

# 添加正文
body = MIMEText("您好，\\n\\n请查收本月度报告，详见附件。\\n\\n此致", "plain", "utf-8")
multi_msg.attach(body)

# 添加文本附件（如 CSV 数据）
csv_content = "姓名,部门,销售额\\n张三,销售部,50000\\n李四,市场部,45000\\n王五,技术部,60000"
csv_attachment = MIMEText(csv_content, "csv", "utf-8")
csv_attachment.add_header(
    "Content-Disposition", "attachment",
    filename=Header("月度销售报告.csv", "utf-8").encode()
)
multi_msg.attach(csv_attachment)

# 添加二进制附件（用 MIMEBase）
pdf_data = b"%PDF-1.4 mock pdf content for demonstration"
pdf_attachment = MIMEBase("application", "pdf")
pdf_attachment.set_payload(pdf_data)
# 对二进制附件进行 base64 编码
from email import encoders
encoders.encode_base64(pdf_attachment)
pdf_attachment.add_header(
    "Content-Disposition", "attachment",
    filename=Header("详细报告.pdf", "utf-8").encode()
)
multi_msg.attach(pdf_attachment)

# 查看邮件结构
print("  邮件结构（walk 遍历）：")
for i, part in enumerate(multi_msg.walk()):
    content_type = part.get_content_type()
    filename = part.get_filename()
    payload = part.get_payload()
    if isinstance(payload, str):
        desc = f"文本 {len(payload)} 字符"
    elif isinstance(payload, bytes):
        desc = f"二进制 {len(payload)} 字节"
    else:
        desc = f"嵌套 {len(payload)} 个子部分"
    print(f"    部分{i}: {content_type} | 文件名:{filename} | {desc}")

# ============ 4. 解析邮件 ============
print()
print("=== 4. 解析邮件 ===")

# 模拟一封收到的原始邮件
raw_email = """From: zhangsan@example.com
To: lisi@example.com
Subject: =?utf-8?B?5rWL6K+V6YKu5Lu2?=
Date: Mon, 30 Jun 2025 10:00:00 +0800
Content-Type: text/plain; charset="utf-8"
Content-Transfer-Encoding: base64

5L2g5aW977yM6L+Z5piv5LiA5bCB5rWL6K+V6YKu5Lu244CCCg==
"""

# 使用 Parser 解析
parser = Parser(policy=policy.default)
parsed = parser.parsestr(raw_email)

print(f"  发件人：{parsed['From']}")
print(f"  收件人：{parsed['To']}")
print(f"  主题：{parsed['Subject']}")
print(f"  日期：{parsed['Date']}")

# 获取正文（base64 解码）
body_bytes = parsed.get_payload(decode=True)
if body_bytes:
    body_text = body_bytes.decode("utf-8")
    print(f"  正文：{body_text}")

# ============ 5. 邮件地址处理 ============
print()
print("=== 5. 邮件地址处理 ===")

# formataddr：格式化地址
formatted = formataddr(("王五", "wangwu@example.com"))
print(f"  formataddr 格式化：{formatted}")

# parseaddr：解析地址
name, addr = parseaddr("赵六 <zhaoliu@example.com>")
print(f"  parseaddr 解析：姓名='{name}' 地址='{addr}'")

# 多个收件人
to_list = [
    formataddr(("张三", "zhangsan@example.com")),
    formataddr(("李四", "lisi@example.com")),
]
to_header = ", ".join(to_list)
print(f"  多个收件人：{to_header}")

# ============ 6. base64 编码 ============
print()
print("=== 6. base64 编码 ===")

original = b"Hello, World! Python email demo."
encoded = base64.b64encode(original)
decoded = base64.b64decode(encoded)

print(f"  原始数据：{original}")
print(f"  Base64编码：{encoded.decode()}")
print(f"  Base64解码：{decoded}")
print(f"  解码正确：{original == decoded}")

# 中文 base64 编码
chinese_text = "你好，世界！"
chinese_bytes = chinese_text.encode("utf-8")
chinese_b64 = base64.b64encode(chinese_bytes)
print(f"\\n  中文原文：{chinese_text}")
print(f"  UTF-8字节：{chinese_bytes}")
print(f"  Base64编码：{chinese_b64.decode()}")

# ============ 7. smtplib 发送流程演示（不实际发送） ============
print()
print("=== 7. SMTP 发送流程（演示，不实际发送）===")

print("  SMTP 发送邮件的典型流程：")
print("    1. smtplib.SMTP('smtp.example.com', 587)  # 连接服务器")
print("    2. server.starttls()                      # 启用TLS加密")
print("    3. server.login('user', 'password')       # 登录认证")
print("    4. server.send_message(msg)               # 发送邮件")
print("    5. server.quit()                          # 断开连接")

print()
print("  常用 SMTP 服务器配置：")
smtp_configs = [
    ("Gmail", "smtp.gmail.com", 587),
    ("QQ邮箱", "smtp.qq.com", 587),
    ("163邮箱", "smtp.163.com", 25),
    ("Outlook", "smtp.office365.com", 587),
]
for name, host, port in smtp_configs:
    print(f"    {name:10} {host:25} 端口:{port}")

print()
print("=" * 40)
print("  email 与 SMTP 邮件处理演示完毕")
print("=" * 40)`
  },
  {
    id: "py8-ssl-tls",
    group: "并发与网络",
    icon: "🔐",
    title: "SSL/TLS 与加密基础",
    content: `## 加密基础概念

### 为什么需要加密

在互联网上传输数据时，如果不加密，任何人（中间人）都能看到你的密码、银行卡号等敏感信息。加密就是给数据"上锁"。

### 加密类型

| 类型 | 说明 | 例子 |
|------|------|------|
| **对称加密** | 加密和解密用同一把钥匙 | AES, DES |
| **非对称加密** | 公钥加密，私钥解密 | RSA, ECC |
| **哈希（摘要）** | 单向函数，不可逆 | MD5, SHA-256 |
| **消息认证码** | 带密钥的哈希 | HMAC |

### SSL/TLS 是什么

SSL（Secure Sockets Layer）/ TLS（Transport Layer Security）是网络传输层的加密协议。当你访问 \`https://\` 网站时，就是通过 TLS 加密通信。

### Python 加密相关模块

| 模块 | 功能 |
|------|------|
| \`ssl\` | SSL/TLS 加密通信 |
| \`hashlib\` | 哈希摘要（MD5, SHA-1, SHA-256, SHA-512） |
| \`hmac\` | 基于密钥的消息认证码 |
| \`secrets\` | 安全的随机数生成 |
| \`base64\` | Base64 编解码 |

### hashlib 哈希摘要

哈希（也叫摘要）是把任意长度数据变成固定长度的"指纹"：

\`\`\`python
import hashlib  # 导入模块 hashlib

# MD5（128位，已不安全，不推荐用于密码）
h = hashlib.md5(b"hello")  # 赋值变量 h
print(h.hexdigest())  # 32个十六进制字符

# SHA-256（256位，目前安全）
h = hashlib.sha256(b"hello")  # 赋值变量 h
print(h.hexdigest())  # 64个十六进制字符

# 支持增量更新
h = hashlib.sha256()  # 赋值变量 h
h.update(b"hello ")  # 调用 h.update()：更新
h.update(b"world")  # 调用 h.update()：更新
print(h.hexdigest())  # 打印输出到屏幕
\`\`\`

### hmac 消息认证

HMAC 结合了哈希和密钥，用于验证消息的完整性和来源：

\`\`\`python
import hmac  # 导入模块 hmac

key = b"secret_key"  # 定义字节串 key
msg = b"important message"  # 定义字节串 msg
signature = hmac.new(key, msg, "sha256").hexdigest()  # 赋值变量 signature

# 验证：重新计算签名并比较
# 使用 compare_digest 防止时序攻击
hmac.compare_digest(signature, expected_signature)  # 调用 hmac.compare_digest()
\`\`\`

### secrets 安全随机

\`random\` 模块的随机数**不适合安全场景**，用 \`secrets\` 代替：

\`\`\`python
import secrets  # 导入模块 secrets

token = secrets.token_hex(16)        # 32字符的随机十六进制
password = secrets.token_urlsafe(16)  # URL安全的随机字符串
choice = secrets.choice(["a", "b"])   # 安全随机选择
\`\`\`

### base64 编码

Base64 把二进制数据转换为可打印的 ASCII 字符，常用于邮件、URL、JSON 等场景：

\`\`\`python
import base64  # 导入模块 base64

encoded = base64.b64encode(b"hello")  # 赋值变量 encoded
decoded = base64.b64decode(encoded)  # 赋值变量 decoded
\`\`\`

### ssl 模块

创建 SSL 上下文用于安全通信：

\`\`\`python
import ssl  # 导入模块 ssl

# 创建客户端 SSL 上下文
context = ssl.create_default_context()  # 赋值变量 context
# 或者用 ssl.SSLContext 自定义
context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)  # 赋值变量 context
context.check_hostname = True  # 执行操作
context.verify_mode = ssl.CERT_REQUIRED  # 执行操作
\`\`\`

### 数字签名概念

1. 发送方对消息计算哈希
2. 用私钥对哈希加密 → 数字签名
3. 接收方用公钥解密签名 → 得到哈希
4. 接收方重新计算消息哈希 → 对比
5. 一致 → 消息未被篡改且来自发送方

下面的 demo 演示 hashlib、hmac、secrets、base64、ssl 上下文等加密相关操作。`,
    code: `# ==========================================
# SSL/TLS 与加密基础 完整演示
# ==========================================
import hashlib
import hmac
import secrets
import base64
import ssl
import os

# ============ 1. hashlib 哈希摘要 ============
print("=== 1. hashlib 哈希摘要 ===")

# 各种哈希算法对比
data = b"Hello, Python Cryptography!"

algorithms = [
    ("MD5", hashlib.md5),
    ("SHA-1", hashlib.sha1),
    ("SHA-256", hashlib.sha256),
    ("SHA-512", hashlib.sha512),
    ("SHA-3-256", hashlib.sha3_256),
    ("BLAKE2b", hashlib.blake2b),
]

print(f"  原始数据：{data}")
print()
for name, algo_fn in algorithms:
    try:
        h = algo_fn(data)
        digest = h.hexdigest()
        print(f"  {name:12} ({h.digest_size * 8}位) -> {digest[:40]}...")
    except Exception as e:
        print(f"  {name:12} -> 不支持 ({e})")

# 增量更新（分块计算大文件的哈希）
print()
print("  增量更新示例：")
h = hashlib.sha256()
h.update(b"Hello, ")
h.update(b"Python ")
h.update(b"Cryptography!")
print(f"  分3次 update 后 SHA-256：{h.hexdigest()[:40]}...")

# 一次性计算
h2 = hashlib.sha256(b"Hello, Python Cryptography!")
print(f"  一次性计算 SHA-256：{h2.hexdigest()[:40]}...")
print(f"  两者相同：{h.digest() == h2.digest()}")

# ============ 2. HMAC 消息认证 ============
print()
print("=== 2. HMAC 消息认证码 ===")

# HMAC = 哈希 + 密钥，用于验证消息完整性和来源
secret_key = b"my-secret-key-2025"
message = b"transfer: account=12345, amount=1000"

# 发送方：计算 HMAC
signature = hmac.new(secret_key, message, hashlib.sha256).hexdigest()
print(f"  消息：{message.decode()}")
print(f"  密钥：{secret_key.decode()}")
print(f"  HMAC-SHA256 签名：{signature[:40]}...")

# 接收方：验证 HMAC
# 方式一：重新计算并比较
expected = hmac.new(secret_key, message, hashlib.sha256).hexdigest()
is_valid = hmac.compare_digest(signature, expected)
print(f"  签名验证（正确密钥）：{is_valid}")

# 方式二：使用错误的密钥
wrong_key = b"wrong-key"
wrong_sig = hmac.new(wrong_key, message, hashlib.sha256).hexdigest()
is_valid = hmac.compare_digest(signature, wrong_sig)
print(f"  签名验证（错误密钥）：{is_valid}")

# 方式三：篡改的消息
tampered_msg = b"transfer: account=12345, amount=99999"
tampered_sig = hmac.new(secret_key, tampered_msg, hashlib.sha256).hexdigest()
is_valid = hmac.compare_digest(signature, tampered_sig)
print(f"  签名验证（篡改消息）：{is_valid}")

# ============ 3. secrets 安全随机数 ============
print()
print("=== 3. secrets 安全随机数 ===")

# 生成安全令牌
token_hex = secrets.token_hex(16)     # 16字节 = 32个十六进制字符
token_url = secrets.token_urlsafe(16)  # URL安全
token_bytes = secrets.token_bytes(16)  # 原始字节

print(f"  token_hex(16)：{token_hex}")
print(f"  token_urlsafe(16)：{token_url}")
print(f"  token_bytes(16) 长度：{len(token_bytes)}字节")

# 安全随机选择
options = ["苹果", "香蕉", "橙子", "葡萄", "西瓜"]
choice = secrets.choice(options)
print(f"  安全随机选择：{choice}")

# 安全随机整数（用于密码学场景）
rand_below = secrets.randbelow(1000000)
print(f"  安全随机数（0~999999）：{rand_below}")

# 生成随机密码
import string
alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
password = "".join(secrets.choice(alphabet) for _ in range(16))
print(f"  生成的安全密码：{password}")

# ============ 4. base64 编解码 ============
print()
print("=== 4. base64 编解码 ===")

original = b"Python SSL/TLS demo with base64 encoding!"

# 标准 base64
std_encoded = base64.b64encode(original)
std_decoded = base64.b64decode(std_encoded)
print(f"  原始数据：{original}")
print(f"  标准Base64：{std_encoded.decode()}")
print(f"  解码正确：{std_decoded == original}")

# URL 安全的 base64（替换 +/ 为 -_）
url_encoded = base64.urlsafe_b64encode(original)
url_decoded = base64.urlsafe_b64decode(url_encoded)
print(f"  URL安全Base64：{url_encoded.decode()}")
print(f"  解码正确：{url_decoded == original}")

# 二进制数据 base64 编码
binary_data = os.urandom(8)  # 8字节随机数据
b64_binary = base64.b64encode(binary_data)
print(f"\\n  随机二进制({len(binary_data)}字节) -> Base64：{b64_binary.decode()}")

# ============ 5. SSL 上下文 ============
print()
print("=== 5. SSL 上下文创建 ===")

# 创建默认 SSL 上下文（客户端）
try:
    client_ctx = ssl.create_default_context()
    print(f"  客户端 SSL 上下文已创建")
    print(f"  协议：{client_ctx.protocol}")
    print(f"  验证模式：{client_ctx.verify_mode}")
    print(f"  检查主机名：{client_ctx.check_hostname}")
except Exception as e:
    print(f"  创建 SSL 上下文失败：{e}")

# 自定义 SSL 上下文
try:
    custom_ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    custom_ctx.check_hostname = True
    custom_ctx.verify_mode = ssl.CERT_REQUIRED
    # 可以加载自定义证书
    # custom_ctx.load_verify_locations(cafile="/path/to/cert.pem")
    print()
    print(f"  自定义 SSL 上下文已创建")
    print(f"  协议：{custom_ctx.protocol}")
    print(f"  验证模式：{custom_ctx.verify_mode}")
except Exception as e:
    print(f"  创建自定义 SSL 上下文失败：{e}")

# SSL/TLS 版本信息
print()
print("  SSL/TLS 协议版本：")
try:
    print(f"    PROTOCOL_TLS_CLIENT: {ssl.PROTOCOL_TLS_CLIENT}")
    print(f"    PROTOCOL_TLS_SERVER: {ssl.PROTOCOL_TLS_SERVER}")
    print(f"    PROTOCOL_TLSv1_2: {ssl.PROTOCOL_TLSv1_2}")
    # Python 3.6+ 支持 TLS 1.3
    if hasattr(ssl, 'PROTOCOL_TLSv1_3'):
        print(f"    PROTOCOL_TLSv1_3: {ssl.PROTOCOL_TLSv1_3}")
except AttributeError as e:
    print(f"    部分协议版本不可用：{e}")

# ============ 6. 密码哈希（PBKDF2 模拟） ============
print()
print("=== 6. 密码存储最佳实践 ===")

# 使用 hashlib.pbkdf2_hmac 进行密码哈希
password_str = "MySecurePassword123"
salt = os.urandom(16)  # 随机盐值

# PBKDF2：对密码进行多次哈希，防止暴力破解
hashed = hashlib.pbkdf2_hmac(
    "sha256",                    # 哈希算法
    password_str.encode("utf-8"), # 密码
    salt,                         # 盐值
    100000,                       # 迭代次数（越大越安全，也越慢）
)

print(f"  原始密码：{password_str}")
print(f"  盐值（base64）：{base64.b64encode(salt).decode()}")
print(f"  PBKDF2 哈希（base64）：{base64.b64encode(hashed).decode()}")

# 验证密码（实际应用中）
def verify_password(input_password, stored_salt, stored_hash):
    """验证密码是否正确"""
    new_hash = hashlib.pbkdf2_hmac(
        "sha256",
        input_password.encode("utf-8"),
        stored_salt,
        100000,
    )
    return hmac.compare_digest(new_hash, stored_hash)

print(f"  验证正确密码：{verify_password(password_str, salt, hashed)}")
print(f"  验证错误密码：{verify_password('WrongPassword', salt, hashed)}")

# ============ 7. 数字签名概念演示 ============
print()
print("=== 7. 数字签名概念演示（简化版）===")

# 用 HMAC 模拟数字签名的概念
# 实际中数字签名用非对称加密（如 RSA），这里用 HMAC 演示思想

# 发送方
private_key = b"alice-private-key"  # 实际中这是私钥
original_msg = b"contract: pay $1000 to Bob"

# 1. 计算消息哈希
msg_hash = hashlib.sha256(original_msg).digest()
# 2. 用私钥"签名"（实际中用私钥加密哈希，这里用 HMAC 模拟）
digital_sig = hmac.new(private_key, msg_hash, hashlib.sha256).digest()

print(f"  原始消息：{original_msg.decode()}")
print(f"  消息哈希(SHA-256)：{msg_hash[:10].hex()}...")
print(f"  数字签名(HMAC)：{digital_sig[:10].hex()}...")

# 接收方
# 3. 重新计算消息哈希
received_msg = original_msg  # 假设消息未被篡改
received_hash = hashlib.sha256(received_msg).digest()
# 4. 用公钥验证签名（实际中用公钥解密签名，这里用 HMAC 验证）
expected_sig = hmac.new(private_key, received_hash, hashlib.sha256).digest()
is_valid = hmac.compare_digest(digital_sig, expected_sig)

print(f"\\n  接收方验证：")
print(f"  消息哈希一致：{msg_hash == received_hash}")
print(f"  签名验证通过：{is_valid}")
print(f"  → 消息未被篡改，且来自 Alice")

# 如果消息被篡改
tampered = b"contract: pay $99999 to Bob"
tampered_hash = hashlib.sha256(tampered).digest()
tampered_sig = hmac.new(private_key, tampered_hash, hashlib.sha256).digest()
is_valid = hmac.compare_digest(digital_sig, tampered_sig)
print(f"\\n  篡改消息后验证签名：{is_valid}")
print(f"  → 签名无效，消息被篡改！")

# ============ 8. 常见加密场景总结 ============
print()
print("=== 8. 常见加密场景总结 ===")

scenarios = [
    ("用户密码存储", "hashlib.pbkdf2_hmac + salt", "不可逆哈希，加盐防彩虹表"),
    ("API 请求认证", "HMAC-SHA256", "密钥签名，验证请求来源"),
    ("HTTPS 通信", "SSL/TLS", "传输层加密，防窃听篡改"),
    ("文件完整性校验", "SHA-256 哈希", "比对文件摘要，检测篡改"),
    ("Token 生成", "secrets.token_hex", "安全随机，防预测"),
    ("二进制数据传输", "base64 编码", "二进制转文本，方便传输"),
    ("数字签名", "RSA + SHA-256", "非对称加密，防抵赖"),
]

for scene, method, reason in scenarios:
    print(f"  {scene:14} -> {method:25} -> {reason}")

print()
print("=" * 40)
print("  SSL/TLS 与加密基础演示完毕")
print("=" * 40)`
  }
];