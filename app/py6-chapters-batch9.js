export const chapters = [
  {
    id: "py6-threading-basic",
    group: "并发网络",
    icon: "🧵",
    title: "线程基础",
    content: `## 线程基础（Thread类/创建线程/start/join/守护线程/线程名）

### 什么是线程？
线程是操作系统能够进行运算调度的最小单位，被包含在进程之中。一个进程可以拥有多个线程，这些线程共享进程的内存空间。

Python 通过 \`threading\` 模块提供多线程支持。

### 核心概念
- **Thread 类**：创建线程的基础类
- **start()**：启动线程，开始执行 run() 方法
- **join()**：等待线程执行完毕
- **daemon（守护线程）**：随主线程退出而退出，不阻塞程序结束
- **name**：线程名称，方便调试识别

### 创建线程的两种方式
1. 直接实例化 \`Thread\`，传入 target 函数
2. 继承 \`Thread\` 类，重写 \`run()\` 方法

### 注意事项
- 线程共享全局变量，存在竞态条件风险
- Python 的线程受 GIL 限制，CPU 密集型场景效率不高
- 主线程退出时，守护线程会被强制终止
- 非守护线程会阻塞程序直到执行完成`,
    code: `import threading
import time

# 线程工作函数：每个线程启动后会调用此函数
# 注意：所有线程共享同一个进程的内存空间，因此可访问全局变量
def worker(name, delay):
    """线程工作函数"""
    print(f"[线程 {name}] 开始执行")
    time.sleep(delay)  # 模拟IO等待，此时GIL会释放，其他线程可运行
    print(f"[线程 {name}] 执行结束，耗时 {delay} 秒")

print("=== 线程基础演示 ===")
# threading.current_thread() 返回当前线程对象，主线程名默认为 MainThread
print(f"主线程: {threading.current_thread().name}")

# 方式1：直接创建 Thread 对象
# target：线程要执行的函数（不是函数调用结果）
# args：传给 target 的位置参数，必须是元组
# name：线程名，方便调试识别
t1 = threading.Thread(target=worker, args=("A", 0.3), name="Worker-A")
t2 = threading.Thread(target=worker, args=("B", 0.2), name="Worker-B")

# 守护线程示例：daemon=True 表示主线程退出时该线程会被强制终止
# 适用场景：后台心跳、日志刷盘、监控等不希望阻塞程序退出的任务
t_daemon = threading.Thread(
    target=worker, args=("守护", 2), name="Daemon", daemon=True
)

print("\\n启动线程...")
# start() 启动线程，开始执行 target 函数，只能调用一次
t1.start()
t2.start()
t_daemon.start()

# threading.active_count() 返回当前存活的线程数（含主线程）
print(f"活动线程数: {threading.active_count()}")
# threading.enumerate() 返回所有存活线程对象列表
print(f"线程列表: {[t.name for t in threading.enumerate()]}")

print("\\n等待非守护线程结束...")
# join() 阻塞当前线程直到目标线程结束，确保子线程执行完再继续
t1.join()
t2.join()
# 注意：未对 t_daemon 调用 join，主线程结束时它会被强制终止

print(f"\\n非守护线程执行完毕，主线程结束")
print(f"守护线程可能还在运行但会随主线程退出")

# 线程 vs 进程的关键区别：
# - 线程：共享内存，通信简单但有竞态风险，受GIL限制
# - 进程：独立内存，通信需IPC，可绕过GIL实现真正并行
`,
  },
  {
    id: "py6-threading-lock",
    group: "并发网络",
    icon: "🔒",
    title: "线程锁与同步",
    content: `## 线程锁与同步（Lock/RLock/死锁/可重入锁/with语句使用锁）

### 为什么需要锁？
多个线程同时访问共享资源时，可能出现**竞态条件**（Race Condition），导致数据不一致。锁是最基本的同步机制。

### Lock（互斥锁）
- \`acquire()\`：获取锁，若已被占用则阻塞等待
- \`release()\`：释放锁
- 同一把锁 acquire 两次会死锁

### RLock（可重入锁）
- 同一个线程可以多次 acquire，不会死锁
- 内部维护计数器，acquire 和 release 必须成对出现
- 适合递归调用或嵌套锁场景

### with 语句
锁对象支持上下文管理器（with 语句），自动管理 acquire/release，推荐使用。

### 死锁
两个或多个线程互相持有对方需要的锁，导致永久阻塞。
- 避免策略：固定加锁顺序、使用超时、尽量减少锁持有时间`,
    code: `import threading
import time

counter = 0
# Lock（互斥锁）：最基础的同步原语，同一时刻只允许一个线程持有
# 缺点：同一线程再次 acquire 会死锁，无法重入
lock = threading.Lock()
# RLock（可重入锁）：同一线程可多次 acquire，内部用计数器记录
# 适用：递归函数、嵌套调用场景，避免自己锁死自己
rlock = threading.RLock()

def add_without_lock():
    """无锁累加演示（有竞态风险）"""
    global counter
    # 读取-修改-写入不是原子操作，多线程并发时会被打断
    temp = counter        # 步骤1：读取当前值
    time.sleep(0.01)      # 模拟线程切换（让其他线程也读到旧值）
    counter = temp + 1    # 步骤2：写回，此时可能覆盖其他线程的更新

def add_with_lock():
    """使用 Lock 累加"""
    global counter
    # with lock 等价于 lock.acquire() + try/finally: lock.release()
    # 确保即使发生异常也能正确释放锁，推荐用 with 语句
    with lock:
        temp = counter
        time.sleep(0.01)
        counter = temp + 1

def rlock_demo():
    """RLock 可重入演示"""
    def nested():
        # RLock 允许同一线程再次 acquire，计数器+1
        rlock.acquire()
        print("  内层获取锁成功")
        rlock.release()  # 计数器-1

    # 外层先 acquire（计数器=1）
    rlock.acquire()
    print("  外层获取锁成功")
    nested()  # 内层再 acquire（计数器=2），不会死锁；若用 Lock 此处会永久阻塞
    rlock.release()  # 计数器=0，真正释放
    print("  RLock 可重入测试完成")

print("=== 线程锁与同步演示 ===")

print("\\n1. 无锁累加（10个线程各+1）:")
counter = 0
threads = [threading.Thread(target=add_without_lock) for _ in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()
# 由于竞态条件，结果通常 < 10，每次运行可能不同
print(f"结果: {counter}（期望10，可能不等于10）")

print("\\n2. 有锁累加（10个线程各+1）:")
counter = 0
threads = [threading.Thread(target=add_with_lock) for _ in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()
# Lock 保证了读取-修改-写入的原子性，结果恒为 10
print(f"结果: {counter}（期望10）")

print("\\n3. RLock 可重入测试:")
rlock_demo()

print("\\n4. 死锁演示（概念）:")
print("死锁场景：线程A持有锁1等待锁2，线程B持有锁2等待锁1")
print("解决方案：统一加锁顺序、使用超时、try/finally确保释放")

# Lock vs RLock 选型建议：
# - 普通互斥场景优先用 Lock，性能略好（无需维护计数器）
# - 递归调用、嵌套加锁场景必须用 RLock，否则会自死锁
`,
  },
  {
    id: "py6-threading-event-condition",
    group: "并发网络",
    icon: "🚦",
    title: "线程同步原语",
    content: `## 线程同步原语（Event/条件变量Condition/线程通信）

### Event（事件）
Event 是最简单的线程通信机制，用于一个线程通知其他线程某件事已发生：
- \`set()\`：将事件设为 True
- \`clear()\`：将事件设为 False
- \`wait()\`：阻塞直到事件为 True
- \`is_set()\`：检查事件是否被设置

典型场景：启动信号、停止信号、完成通知。

### Condition（条件变量）
Condition 用于复杂的线程等待/通知场景，总是与某种锁关联：
- \`wait()\`：等待通知，释放锁并阻塞
- \`notify()\`：唤醒一个等待线程
- \`notify_all()\`：唤醒所有等待线程
- 必须在 acquire/release 之间使用（或使用 with）

典型场景：生产者-消费者模式、线程间状态协调。

### Semaphore（信号量）
控制同时访问资源的线程数量，内部维护计数器。`,
    code: `import threading
import time
import random

print("=== Event 事件演示 ===")
# Event 内部维护一个布尔标志，所有线程可共享
# 典型用途：发令枪、启动/停止信号、一次性完成通知
start_event = threading.Event()

def runner(name):
    """等待发令枪"""
    print(f"运动员 {name} 准备就绪")
    # wait() 阻塞直到 set() 被调用，可设 timeout 避免永久等待
    start_event.wait()
    print(f"运动员 {name} 起跑！")

# 创建3个运动员线程，它们都会在 wait() 处阻塞等待发令
runners = [threading.Thread(target=runner, args=(i,)) for i in range(3)]
for t in runners:
    t.start()

time.sleep(0.2)
print("\\n各就各位...预备...")
time.sleep(0.2)
print("跑！")
# set() 将标志设为 True，所有正在 wait() 的线程会被同时唤醒
start_event.set()

for t in runners:
    t.join()

print("\\n=== Condition 条件变量演示（生产者消费者）===")
# Condition 总是与一把锁关联（默认创建一把 RLock）
# 用于复杂的"等待某个条件成立"的场景，比 Event 更灵活
condition = threading.Condition()
queue = []
MAX_SIZE = 3

def producer():
    for i in range(5):
        with condition:
            # 必须用 while 而非 if 检查条件（防止虚假唤醒）
            while len(queue) >= MAX_SIZE:
                # wait() 会释放锁并阻塞，被 notify 唤醒后重新获取锁
                condition.wait(timeout=2)
            item = f"产品{i}"
            queue.append(item)
            print(f"生产者生产: {item}, 当前队列: {queue}")
            # notify_all() 唤醒所有等待的消费者，notify() 只唤醒一个
            condition.notify_all()
        time.sleep(0.05)

def consumer(name, count):
    for _ in range(count):
        with condition:
            while not queue:
                condition.wait(timeout=2)
                if not queue:
                    return  # 超时仍未拿到产品则退出
            item = queue.pop(0)
            print(f"消费者{name}消费: {item}, 当前队列: {queue}")
            condition.notify_all()  # 通知可能等待的消费者/生产者
        time.sleep(0.1)

p = threading.Thread(target=producer)
c1 = threading.Thread(target=consumer, args=("A", 3))
c2 = threading.Thread(target=consumer, args=("B", 2))

p.start()
c1.start()
c2.start()
p.join()
c1.join(timeout=3)
c2.join(timeout=3)
print("生产者消费者演示结束")

# Event vs Condition 选型：
# - Event：一次性广播信号（开始/停止），简单场景
# - Condition：基于状态的等待/通知（队列非空、缓冲可用），复杂协调
`,
  },
  {
    id: "py6-threading-queue",
    group: "并发网络",
    icon: "📬",
    title: "线程队列",
    content: `## 线程队列（Queue/LifoQueue/PriorityQueue/生产者消费者）

### queue 模块
\`queue\` 模块提供了线程安全的队列实现，内置锁机制，是多线程间数据传递的首选方式。

### 三种队列
1. **Queue(maxsize)**：FIFO（先进先出）队列
2. **LifoQueue(maxsize)**：LIFO（后进先出），类似栈
3. **PriorityQueue(maxsize)**：优先级队列，按优先级出队

### 常用方法
- \`put(item)\`：放入元素，队列满时阻塞
- \`get()\`：获取元素，队列空时阻塞
- \`put_nowait()/get_nowait()\`：不阻塞，满/空时抛异常
- \`task_done()\`：标记任务完成
- \`join()\`：阻塞直到所有任务处理完
- \`qsize()/empty()/full()\`：队列状态查询

### 为什么用队列？
- 自动处理锁，无需手动管理 Lock
- 优雅实现生产者消费者模式
- 支持阻塞等待，避免轮询消耗CPU`,
    code: `import threading
import queue
import time

# queue 模块的队列内部已加锁，多线程 put/get 无需额外加锁
# 这是多线程间数据传递的首选方式，比手动 Lock + list 更安全简洁

print("=== FIFO 队列演示 ===")
# Queue：先进先出（First In First Out），最常用的队列类型
q = queue.Queue(maxsize=3)  # maxsize 限制队列容量，put 满时会阻塞

q.put("A")
q.put("B")
q.put("C")
print(f"队列大小: {q.qsize()}, 是否满: {q.full()}")
print(f"取出: {q.get()}")  # 取出最早放入的 "A"
print(f"取出: {q.get()}")  # 取出 "B"
print(f"取出: {q.get()}")  # 取出 "C"
print(f"是否空: {q.empty()}")

print("\\n=== LifoQueue 栈演示 ===")
# LifoQueue：后进先出（Last In First Out），类似栈结构
lifo = queue.LifoQueue()
for i in range(1, 4):
    lifo.put(f"第{i}个")
while not lifo.empty():
    print(f"取出: {lifo.get()}")  # 先取出最后放入的 "第3个"

print("\\n=== PriorityQueue 优先级队列 ===")
# PriorityQueue：按优先级出队，元素必须是可比较的元组 (priority, data)
# 数字越小优先级越高（先出队）
pq = queue.PriorityQueue()
pq.put((3, "普通任务"))
pq.put((1, "紧急任务"))  # 优先级1最高，会最先取出
pq.put((2, "重要任务"))
while not pq.empty():
    priority, task = pq.get()
    print(f"优先级{priority}: {task}")

print("\\n=== 生产者消费者（Queue 版）===")
task_queue = queue.Queue(maxsize=5)

def producer():
    for i in range(6):
        task_queue.put(f"任务{i}")  # 队列满时自动阻塞等待
        print(f"生产: 任务{i}")
        time.sleep(0.05)
    # 放入结束标志（哨兵），通知消费者退出
    task_queue.put(None)

def consumer():
    while True:
        # get() 队列空时自动阻塞等待生产者放入，避免轮询消耗CPU
        item = task_queue.get()
        if item is None:
            # 多消费者场景：把结束标志传给下一个消费者
            task_queue.put(None)
            break
        print(f"消费: {item}")
        time.sleep(0.08)
        # task_done() 标记一个任务处理完成，配合 join() 使用
        task_queue.task_done()

p = threading.Thread(target=producer)
c = threading.Thread(target=consumer)
p.start()
c.start()
p.join()
c.join()
# task_queue.join() 会阻塞直到所有 put 的元素都被 task_done()
# 这里未调用，因为用了哨兵 None 控制退出
print("队列版生产者消费者完成")

# threading.local：线程本地存储，每个线程有独立的变量副本
# 适合存放连接对象、事务上下文等线程私有数据，无需加锁
# 示例：
#   local_data = threading.local()
#   local_data.user = "张三"  # 仅当前线程可见，其他线程读取会报错或得到自己的副本
`,
  },
  {
    id: "py6-threading-pool",
    group: "并发网络",
    icon: "🏊",
    title: "线程池",
    content: `## 线程池（concurrent.futures.ThreadPoolExecutor/map/submit/as_completed）

### 为什么用线程池？
手动创建/销毁线程开销大，线程池可以：
- 复用线程，减少创建销毁开销
- 控制并发数量，防止资源耗尽
- 提供简洁的任务提交和结果获取接口

### concurrent.futures 模块
- **ThreadPoolExecutor(max_workers)**：创建线程池
- **submit(fn, *args)**：提交单个任务，返回 Future 对象
- **map(fn, iterable)**：批量提交，按输入顺序返回结果
- **as_completed(futures)**：迭代已完成的任务（先完成先返回）
- **Future.result(timeout)**：获取任务结果，可设超时

### Future 对象
代表异步执行的操作：
- \`result()\`：获取结果
- \`done()\`：是否完成
- \`exception()\`：获取异常（如果有）
- \`add_done_callback()\`：完成回调

### 最佳实践
- max_workers 不宜过大，IO 密集型可设为 CPU核数*5 左右
- 使用 with 语句自动管理线程池生命周期`,
    code: `from concurrent.futures import ThreadPoolExecutor, as_completed
import time
import math

# concurrent.futures 是 Python 推荐的线程池/进程池高层 API
# 比手动 threading.Thread 更易用，自动管理线程复用和结果收集

def fetch_data(url_id):
    """模拟IO操作（如网络请求）"""
    time.sleep(0.2)  # IO等待时GIL释放，线程池可并发执行
    return f"数据{url_id}"

def compute(x):
    """简单计算"""
    return x * x

print("=== ThreadPoolExecutor 演示 ===")

# map 方式：批量提交任务，结果按输入顺序返回（不管完成先后）
# 适合任务耗时相近、需要保持顺序的场景
print("\\n1. map 方式（按输入顺序返回）:")
with ThreadPoolExecutor(max_workers=3) as pool:
    start = time.time()
    # pool.map 返回生成器，按输入顺序逐个产出结果
    results = pool.map(fetch_data, range(5))
    for r in results:
        print(f"  得到: {r}")
    print(f"  map 耗时: {time.time()-start:.2f}秒（串行需1秒以上）")

# submit + as_completed：更灵活，先完成的先返回
# 适合任务耗时差异大、想尽快处理已完成任务的场景
print("\\n2. submit + as_completed（先完成先返回）:")
with ThreadPoolExecutor(max_workers=3) as pool:
    # submit 返回 Future 对象，代表一个异步执行的操作
    futures = [pool.submit(compute, i) for i in range(1, 6)]
    # as_completed 返回迭代器，哪个 Future 先完成就先产出
    for future in as_completed(futures):
        print(f"  计算结果: {future.result()}")

print("\\n3. 异常处理示例:")
def might_fail(x):
    if x == 3:
        raise ValueError(f"数字{x}出错了")
    return x * 10

with ThreadPoolExecutor(max_workers=2) as pool:
    # 用字典建立 future -> 原始参数 的映射，便于结果对应
    futures = {pool.submit(might_fail, i): i for i in range(1, 6)}
    for future in as_completed(futures):
        num = futures[future]
        try:
            # Future.result() 会阻塞直到任务完成
            # 如果任务抛了异常，这里会重新抛出
            print(f"  {num} -> {future.result()}")
        except Exception as e:
            print(f"  {num} 异常: {e}")

print("\\n线程池演示完成")

# Future 对象核心方法：
# - result(timeout)：获取结果，超时抛 TimeoutError，任务异常会重新抛出
# - done()：是否已完成
# - exception()：获取异常对象（无异常返回 None）
# - add_done_callback(fn)：注册完成回调，任务结束后自动调用
# - cancel()：尝试取消（已开始的无法取消）
# - running()/cancelled()：状态查询
`,
  },
  {
    id: "py6-multiprocessing-basic",
    group: "并发网络",
    icon: "🏭",
    title: "多进程基础",
    content: `## 多进程基础（Process类/创建进程/进程vs线程/跨进程通信Pipe/Queue概念）

### 进程 vs 线程
| 特性 | 进程 | 线程 |
|------|------|------|
| 内存空间 | 独立地址空间 | 共享进程内存 |
| 开销 | 创建开销大 | 创建开销小 |
| 通信 | IPC（管道/队列/共享内存） | 直接共享变量 |
| GIL | 不受GIL限制 | 受GIL限制 |
| 适用场景 | CPU密集型 | IO密集型 |

### Process 类
- \`Process(target, args, name, daemon)\`：创建进程
- \`start()\`：启动进程
- \`join()\`：等待进程结束
- \`pid/name/is_alive()\`：进程属性

### 跨进程通信（IPC）
- **Pipe()**：管道，双向通信，返回两个连接端
- **Queue()**：进程安全队列，类似 threading.Queue
- **共享内存**：Value/Array，直接共享内存变量
- **Manager**：更灵活的共享对象（dict/list等）

### 注意
多进程代码必须放在 \`if __name__ == '__main__'\` 保护下，防止无限递归创建进程。`,
    code: `import multiprocessing
import time
import os

# 多进程：每个进程有独立的内存空间和Python解释器，因此不受GIL限制
# 可真正利用多核CPU并行计算，但创建进程开销大，进程间通信需IPC

def worker(name, delay):
    """进程工作函数"""
    # os.getpid() 返回当前进程ID，os.getppid() 返回父进程ID
    print(f"[子进程 {name}] PID: {os.getpid()}, 父PID: {os.getppid()}")
    time.sleep(delay)
    result = sum(range(1000))
    print(f"[子进程 {name}] 计算结果: {result}")
    return result

def pipe_demo():
    """Pipe 通信演示（概念+顺序执行版）"""
    print("\\n=== Pipe 通信演示（顺序执行模拟）===")
    print("Pipe() 返回 (conn1, conn2)，两个连接端可互发消息")
    print("conn.send(data) 发送，conn.recv() 接收")
    print("示例：父子进程通过 Pipe 发送消息")

    # Pipe() 返回两个 Connection 对象，分别给父子进程使用
    # 数据通过管道在两端传递，是双向通信
    parent_conn, child_conn = multiprocessing.Pipe()
    parent_conn.send("来自主进程的消息")
    msg = child_conn.recv()
    print(f"子连接端收到: {msg}")
    child_conn.send("子连接端回复")
    msg2 = parent_conn.recv()
    print(f"父连接端收到: {msg2}")
    parent_conn.close()
    child_conn.close()

print("=== 多进程基础演示 ===")
print(f"主进程 PID: {os.getpid()}")
print(f"CPU核心数: {multiprocessing.cpu_count()}")

print("\\n=== 创建子进程（顺序执行版，避免沙箱问题）===")
# 重要：多进程代码必须放在 if __name__ == '__main__' 保护下！
# 原因：Windows/macOS 用 spawn 方式启动子进程，会重新 import 主模块
#       若无保护，子进程 import 时会再次执行创建进程代码，导致无限递归
# Linux 默认用 fork，不重新 import，但为跨平台兼容仍建议加保护
print("标准多进程写法（需 if __name__ == '__main__' 保护）:")
print("""
if __name__ == '__main__':
    p = multiprocessing.Process(target=worker, args=('X', 0.5))
    p.start()
    p.join()
""")

print("\\n在主线程中模拟多进程工作（避免沙箱进程问题）:")
worker("模拟进程1", 0.1)
worker("模拟进程2", 0.1)

pipe_demo()

print("\\n=== Process vs Thread 总结 ===")
print("1. 多进程：独立内存，绕过GIL，适合CPU密集计算")
print("2. 多线程：共享内存，受GIL限制，适合IO密集等待")
print("3. 进程间通过 Pipe/Queue/Manager 通信")
print("4. Windows/macOS下多进程代码必须加 if __name__ == '__main__'")
print("5. IPC 通信方式：Pipe(双向管道)、Queue(进程安全队列)、")
print("   Manager(共享dict/list)、Value/Array(共享内存)")
`,
  },
  {
    id: "py6-multiprocessing-pool",
    group: "并发网络",
    icon: "🏊‍♂️",
    title: "进程池",
    content: `## 进程池（ProcessPoolExecutor/map/CPU密集型演示）

### 为什么用进程池？
- 和线程池类似，复用进程减少创建开销
- 真正利用多核CPU并行计算
- 适合 CPU 密集型任务（数学计算、图像处理、数据处理）

### ProcessPoolExecutor
和 ThreadPoolExecutor 接口完全一致：
- \`ProcessPoolExecutor(max_workers)\`
- \`submit()/map()/as_completed()\`
- max_workers 通常设为 CPU核心数

### 注意事项
- 进程间数据传递需要序列化（pickle），大对象开销大
- 必须在 \`if __name__ == '__main__'\` 中运行
- 不适合IO密集型（线程池/异步更高效）

### 何时用哪种？
- **CPU密集** → ProcessPoolExecutor
- **IO密集** → ThreadPoolExecutor 或 asyncio
- **超大量IO** → asyncio 协程最省资源`,
    code: `import math
import time
import os
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor, as_completed

# ProcessPoolExecutor 与 ThreadPoolExecutor 接口完全一致
# 区别：进程池真正并行执行（绕过GIL），但进程间数据需 pickle 序列化

def cpu_intensive(n):
    """CPU密集型计算：求素数个数（小数据量快速演示）"""
    count = 0
    for num in range(2, n):
        is_prime = True
        for i in range(2, int(math.sqrt(num)) + 1):
            if num % i == 0:
                is_prime = False
                break
        if is_prime:
            count += 1
    return count

def io_simulation(n):
    """模拟IO操作"""
    time.sleep(0.1)  # IO等待时GIL释放，线程池也能并发
    return n * n

print("=== 进程池 vs 线程池 演示 ===")
print(f"主进程 PID: {os.getpid()}")

numbers = [500, 800, 1000, 600]

print("\\n1. CPU密集型 - 顺序执行:")
start = time.time()
for n in numbers:
    cpu_intensive(n)
print(f"   耗时: {time.time()-start:.3f}秒")

# 线程池执行CPU密集任务：受GIL限制，同一时刻只有一个线程跑Python代码
# 因此多线程对CPU密集任务几乎无加速，甚至可能因切换开销变慢
print("\\n2. CPU密集型 - ThreadPoolExecutor(4):")
print("   （受GIL限制，可能并不比顺序快）")
start = time.time()
with ThreadPoolExecutor(max_workers=4) as pool:
    list(pool.map(cpu_intensive, numbers))
print(f"   耗时: {time.time()-start:.3f}秒")

# 进程池执行CPU密集任务：每个进程有独立GIL，可真正多核并行
# 注意：必须放在 if __name__ == '__main__' 中，否则 spawn 启动会递归
print("\\n=== ProcessPoolExecutor 标准写法说明 ===")
print("标准代码需要 if __name__ == '__main__' 保护:")
print("""
if __name__ == '__main__':
    start = time.time()
    with ProcessPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(cpu_intensive, numbers))
    print(f"进程池耗时: {time.time()-start:.3f}秒")
    print(f"素数个数: {results}")
""")

# IO密集任务：线程池性价比最高，无需进程开销即可并发
print("\\n3. IO密集型 - ThreadPoolExecutor 演示:")
start = time.time()
with ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(io_simulation, range(1, 11)))
print(f"   结果: {results}")
print(f"   耗时: {time.time()-start:.3f}秒（10次IO串行需1秒）")

print("\\n=== 选型总结 ===")
print("- CPU密集计算: ProcessPoolExecutor（多核并行）")
print("- IO密集等待: ThreadPoolExecutor（简单易用）")
print("- 大量IO连接: asyncio（协程最省资源）")
# 注意：进程间传递的参数和返回值必须可 pickle 序列化
# 函数、lambda、打开的文件、socket 等无法 pickle，不能跨进程传递
`,
  },
  {
    id: "py6-asyncio-basic",
    group: "并发网络",
    icon: "⚡",
    title: "asyncio异步基础",
    content: `## asyncio异步基础（事件循环概念/协程/async/await基础）

### 什么是异步编程？
异步编程允许程序在等待IO操作时不阻塞CPU，而是去执行其他任务，等待完成后再回来处理。这是单线程并发的方式。

### 核心概念
- **协程（Coroutine）**：用 \`async def\` 定义的函数，调用后返回协程对象，不会立即执行
- **事件循环（Event Loop）**：asyncio 的核心，负责调度协程、监听事件、分发任务
- **async/await**：定义协程和等待异步操作的关键字

### asyncio 工作流程
1. 创建事件循环
2. 将协程交给事件循环
3. 事件循环在所有任务间切换执行
4. 遇到 await 时挂起当前协程，执行其他就绪协程
5. IO完成后恢复挂起的协程

### 为什么用 asyncio？
- 单线程处理上万并发连接
- 极低的资源消耗（无线程切换开销）
- 特别适合网络IO密集场景（Web爬虫、聊天服务器）

### 运行协程
- \`asyncio.run(coro)\`：最高层API，创建循环运行协程直到完成`,
    code: `import asyncio
import time

# async def 定义的函数叫"协程函数"，调用它返回一个"协程对象"
# 协程对象不会立即执行，必须交给事件循环调度或在 await 中执行
async def hello(name, delay):
    """定义一个协程"""
    print(f"  [{name}] 开始执行...")
    # await 暂停当前协程，把控制权交还事件循环
    # asyncio.sleep 是异步sleep，等待时不阻塞事件循环
    await asyncio.sleep(delay)
    print(f"  [{name}] 执行结束，等待了 {delay} 秒")
    return f"{name}的结果"

async def main():
    """主协程"""
    print("=== asyncio 基础演示 ===")
    print(f"开始时间: {time.strftime('%H:%M:%S')}")

    # 直接 await 协程：串行执行，前一个完成才开始下一个
    # 这里两个各等0.3秒，总耗时约0.6秒（无并发）
    print("\\n1. 串行 await（一个接一个执行）:")
    start = time.time()
    await hello("A", 0.3)
    await hello("B", 0.3)
    print(f"串行总耗时: {time.time()-start:.2f}秒")

    # 关键区别：协程中绝不能用 time.sleep()！
    # time.sleep 会阻塞整个事件循环，所有协程都被卡住
    # asyncio.sleep 是非阻塞的，等待时事件循环可执行其他就绪协程
    print("\\n2. await asyncio.sleep() vs time.sleep() 区别:")
    print("   - await asyncio.sleep(): 非阻塞，让出控制权给其他协程")
    print("   - time.sleep(): 阻塞，卡住整个事件循环，绝不要在协程中用！")

    # 协程对象 vs 协程执行
    # 直接调用 async 函数只返回协程对象，不执行
    # 必须用 await、create_task 或 asyncio.run 来驱动它
    print("\\n3. 协程对象不会自动执行:")
    coro = hello("未运行", 0.1)
    print(f"   直接调用返回: {type(coro)}，需要await或放进事件循环")
    await coro  # 这里才真正执行

    print(f"\\n结束时间: {time.strftime('%H:%M:%S')}")

# asyncio.run() 是最高层API：创建事件循环、运行协程、关闭事件循环
# 一个程序通常只调用一次 asyncio.run，作为整个异步程序的入口
asyncio.run(main())
`,
  },
  {
    id: "py6-asyncio-await",
    group: "并发网络",
    icon: "⏳",
    title: "async/await详解",
    content: `## async/await详解（awaitable对象/asyncio.sleep/异步任务串联）

### await 关键字
\`await\` 只能在 \`async def\` 函数内使用，后面必须跟一个 **awaitable 对象**。

### 三种 awaitable 对象
1. **协程（Coroutine）**：async def 函数调用返回的对象
2. **Task（任务）**：\`asyncio.create_task()\` 包装后的协程
3. **Future**：底层异步结果对象（通常不直接使用）

### await 的作用
1. 暂停当前协程的执行
2. 将控制权交还给事件循环
3. 等待 awaitable 对象完成并获取其返回值
4. 如果await的对象抛异常，await 处会重新抛出

### asyncio.sleep() vs time.sleep()
- \`await asyncio.sleep()\`：异步等待，不阻塞事件循环
- \`time.sleep()\`：同步阻塞，会卡住所有协程

### 异步任务串联
多个异步操作可以按顺序 await，也可以组合成复杂流程。`,
    code: `import asyncio
import random

# await 只能在 async def 函数内使用，用于等待一个 awaitable 对象
# 三种 awaitable：协程、Task、Future
async def fetch_data(source):
    """模拟异步获取数据"""
    delay = random.uniform(0.1, 0.3)
    # await 暂停当前协程，等异步操作完成后再继续
    await asyncio.sleep(delay)
    return f"来自{source}的数据(耗时{delay:.2f}s)"

async def process_data(data):
    """模拟异步处理数据"""
    await asyncio.sleep(0.1)
    return f"处理后: {data.upper()}"

async def save_result(result):
    """模拟异步保存"""
    await asyncio.sleep(0.05)
    return f"已保存: {result}"

# 异步管道：多个异步操作串行连接
# 每个 await 都会暂停，等待前一步完成才执行下一步
async def sequential_pipeline(source):
    """串行异步管道：获取 -> 处理 -> 保存"""
    data = await fetch_data(source)
    processed = await process_data(data)
    saved = await save_result(processed)
    return saved

async def main():
    print("=== async/await 详解 ===")

    print("\\n1. 串联异步操作（一个完成后再下一个）:")
    result = await sequential_pipeline("API-A")
    print(f"   最终结果: {result}")

    # await 可以获取协程的返回值（return 语句的值）
    print("\\n2. await 获取返回值:")
    value = await fetch_data("数据库")
    print(f"   获取到: {value}")

    # 协程中抛出的异常会在 await 处重新抛出，可用 try/except 捕获
    print("\\n3. await 异常传播:")
    async def might_fail():
        await asyncio.sleep(0.1)
        raise ValueError("异步操作失败！")

    try:
        await might_fail()
    except ValueError as e:
        print(f"   捕获到异步异常: {e}")

    # 循环中 await 是串行的：每个 await 都要等前一个完成
    # 若要并发，需用 asyncio.gather 或 create_task（见下一章）
    print("\\n4. 多个 await 顺序执行演示:")
    results = []
    sources = ["源1", "源2", "源3"]
    for src in sources:
        r = await fetch_data(src)
        results.append(r)
    for r in results:
        print(f"   {r}")

    # 验证协程对象的类型：直接调用 async 函数返回的是 coroutine 对象
    print("\\n5. awaitable 类型说明:")
    coro = fetch_data("测试")
    print(f"   协程类型: {type(coro)}")
    await coro

asyncio.run(main())
`,
  },
  {
    id: "py6-asyncio-task",
    group: "并发网络",
    icon: "🎯",
    title: "asyncio任务",
    content: `## asyncio任务（create_task/gather/wait/超时wait_for/并发执行）

### Task（任务）
\`asyncio.create_task(coro)\` 将协程包装为 Task 并立即调度执行，实现真正的并发。

### 并发执行方式
1. **asyncio.gather(*aws)**：并发运行多个awaitable，按顺序返回结果列表
   - return_exceptions=True：异常作为结果返回，不中断其他任务
2. **asyncio.wait(aws, timeout)**：等待任务完成，返回(完成集合, 未完成集合)
   - 可指定 return_when: FIRST_COMPLETED/ALL_COMPLETED
3. **asyncio.as_completed(aws)**：迭代器，按完成顺序产生 Future
4. **asyncio.wait_for(aw, timeout)**：添加超时控制，超时抛TimeoutError
5. **asyncio.timeout(delay)**（Python 3.11+）：用 async with 管理超时，更优雅

### 关键区别
- 直接 \`await coro\`：串行执行，一个结束才下一个
- \`create_task()\`：立即调度并发执行
- \`gather()\`：批量并发并收集结果

### 取消任务
\`task.cancel()\` 可以取消正在运行的任务，会抛 CancelledError。

### asyncio 同步原语
- **asyncio.Semaphore(n)**：限制同时运行的协程数，控制并发量
- **asyncio.Event**：协程间事件通知，set/wait/clear
- **asyncio.Lock**：协程互斥锁（单线程内一般不需要，跨协程共享资源时可用）
- **asyncio.Condition**：协程条件变量

注意：asyncio 同步原语与 threading 的同名类接口类似，但是给协程用的，\`await\` 等待。`,
    code: `import asyncio
import random

async def task(name, delay):
    await asyncio.sleep(delay)
    if name == "失败任务":
        raise RuntimeError(f"{name}出错了")
    return f"{name}完成(耗时{delay:.2f}s)"

async def main():
    print("=== asyncio Task 与并发 ===")

    # create_task：把协程包装成 Task 并立即调度执行
    # 这是 asyncio 并发的关键：多个 Task 由事件循环交替执行
    print("\\n1. create_task 并发执行:")
    t1 = asyncio.create_task(task("A", 0.2), name="任务A")
    t2 = asyncio.create_task(task("B", 0.3), name="任务B")
    t3 = asyncio.create_task(task("C", 0.1), name="任务C")
    print(f"   任务已创建，开始并发执行...")
    # 注意：await 已调度的 Task，总耗时≈最慢的那个（0.3s），而非累加（0.6s）
    r1 = await t1
    r2 = await t2
    r3 = await t3
    print(f"   结果: {r1}, {r2}, {r3}")

    # gather：批量并发，结果按传入顺序返回（非完成顺序）
    print("\\n2. gather 并发收集结果（按输入顺序返回）:")
    results = await asyncio.gather(
        task("X", 0.2),
        task("Y", 0.1),
        task("Z", 0.15),
    )
    print(f"   gather结果: {results}")

    # 默认情况下任一任务抛异常，gather 立即抛出
    # return_exceptions=True 把异常作为结果返回，不中断其他任务
    print("\\n3. gather 捕获异常（return_exceptions=True）:")
    results = await asyncio.gather(
        task("正常任务", 0.1),
        task("失败任务", 0.1),
        task("另一任务", 0.1),
        return_exceptions=True,
    )
    for i, r in enumerate(results):
        if isinstance(r, Exception):
            print(f"   任务{i}异常: {r}")
        else:
            print(f"   任务{i}成功: {r}")

    # wait_for：给单个 awaitable 加超时，超时会取消任务并抛 TimeoutError
    print("\\n4. wait_for 超时控制:")
    async def slow_task():
        await asyncio.sleep(1)
        return "太慢了"

    try:
        result = await asyncio.wait_for(slow_task(), timeout=0.2)
        print(f"   结果: {result}")
    except asyncio.TimeoutError:
        print(f"   超时了！任务被取消")

    # asyncio.timeout（Python 3.11+）：async with 形式，可同时管理多个任务
    # 比 wait_for 更灵活，超时后作用域内的 await 都会被取消
    print("\\n5. asyncio.timeout（Python 3.11+）:")
    async def another_slow():
        await asyncio.sleep(1)
        return "完成"
    try:
        async with asyncio.timeout(0.2):
            await another_slow()
    except TimeoutError:
        print(f"   asyncio.timeout 超时触发（3.11+ 写法）")

    # as_completed：哪个任务先完成就先产出，适合处理耗时不确定的任务
    print("\\n6. as_completed 按完成顺序处理:")
    tasks = [task(f"任务{i}", random.uniform(0.05, 0.25)) for i in range(4)]
    for idx, coro in enumerate(asyncio.as_completed(tasks)):
        res = await coro
        print(f"   第{idx+1}个完成: {res}")

    # asyncio.Semaphore：限制同时运行的协程数量
    # 场景：爬虫限制并发数防止被封、数据库连接池限流
    print("\\n7. asyncio.Semaphore 限流:")
    sem = asyncio.Semaphore(2)  # 最多同时2个协程进入临界区

    async def limited(n):
        async with sem:  # 获取许可，离开时自动释放
            print(f"   任务{n} 开始（并发数受 Semaphore 控制）")
            await asyncio.sleep(0.1)
            return f"任务{n}完成"

    results = await asyncio.gather(*(limited(i) for i in range(4)))
    print(f"   结果: {results}")

    # asyncio.Event：协程间事件通知
    print("\\n8. asyncio.Event 事件通知:")
    ready = asyncio.Event()

    async def waiter(n):
        await ready.wait()  # 协程等待事件被 set
        print(f"   等待者{n} 收到事件")

    async def setter():
        await asyncio.sleep(0.1)
        ready.set()  # 唤醒所有等待的协程

    await asyncio.gather(waiter(1), waiter(2), setter())

asyncio.run(main())
`,
  },
  {
    id: "py6-gil",
    group: "并发网络",
    icon: "🔗",
    title: "GIL全局解释器锁",
    content: `## GIL全局解释器锁（原理/对多线程影响/什么时候用多进程vs多线程vs异步）

### 什么是 GIL？
GIL（Global Interpreter Lock）是 CPython 解释器中的一把全局互斥锁，确保同一时刻只有一个线程执行 Python 字节码。

### 为什么有 GIL？
- CPython 的内存管理（引用计数）不是线程安全的
- GIL 简化了 CPython 的实现，避免了复杂的细粒度锁
- 历史原因：Python 诞生时多线程还不普及，GIL 让实现更简单

### GIL 的影响
- **CPU 密集型**：多线程无法利用多核，因为同一时刻只有一个线程执行Python代码
- **IO 密集型**：影响很小！IO等待时（如网络/文件读写）GIL会被释放，其他线程可以运行
- **C扩展**：NumPy等C扩展在计算时会主动释放GIL，可以实现真正并行

### 并发模型选择
| 场景 | 推荐方案 | 原因 |
|------|----------|------|
| CPU密集计算 | multiprocessing | 绕过GIL，利用多核 |
| 少量IO（<100） | threading | 代码简单直观 |
| 大量IO（高并发） | asyncio | 单线程高并发，资源消耗最低 |

### 常见误区
- ❌ "Python多线程没用" → IO密集场景非常有用
- ❌ "Python不能并行" → 多进程可以真正并行
- ❌ "GIL是bug" → 是设计权衡，CPython核心开发者认为利大于弊`,
    code: `import math
import time
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

# GIL（全局解释器锁）：CPython 实现细节，确保同一时刻只有一个线程执行 Python 字节码
# 后果：多线程无法利用多核并行执行 Python 代码（CPU密集任务无法加速）
# 例外：IO等待（sleep/网络/文件）和C扩展（如NumPy）会主动释放GIL

def cpu_work(n):
    """CPU密集：纯Python计算"""
    total = 0
    for i in range(n):
        total += math.sqrt(i) * math.sin(i)
    return total

def io_work(n):
    """IO密集：sleep模拟网络等待"""
    # time.sleep 期间 GIL 会被释放，其他线程可以运行
    time.sleep(n)
    return n

print("=== GIL 影响演示 ===")
work_amount = 200000

print("\\n--- CPU密集型任务对比 ---")
print("单线程执行两次:")
start = time.time()
cpu_work(work_amount)
cpu_work(work_amount)
single_time = time.time() - start
print(f"  耗时: {single_time:.3f}秒")

# 多线程执行CPU密集任务：因GIL存在，两线程实际上是串行执行Python代码
# 不会比单线程快，甚至可能因线程切换略慢
print("2个线程执行（受GIL限制）:")
start = time.time()
with ThreadPoolExecutor(max_workers=2) as pool:
    list(pool.map(cpu_work, [work_amount, work_amount]))
thread_time = time.time() - start
print(f"  耗时: {thread_time:.3f}秒")
print(f"  线程/单线程比: {thread_time/single_time:.2f}x（接近1.0，说明没加速）")

print("\\n--- IO密集型任务对比 ---")
print("单线程执行4次IO（每次0.2秒）:")
start = time.time()
for _ in range(4):
    io_work(0.2)
print(f"  耗时: {time.time()-start:.3f}秒（串行≈0.8秒）")

# 多线程执行IO任务：sleep 时 GIL 释放，其他线程可同时 sleep
# 4个线程并发等待，总耗时≈单次IO时间，而非累加
print("4个线程并发执行IO:")
start = time.time()
with ThreadPoolExecutor(max_workers=4) as pool:
    list(pool.map(io_work, [0.2]*4))
print(f"  耗时: {time.time()-start:.3f}秒（≈0.2秒，加速明显！）")

print("\\n=== 并发选型总结 ===")
print("""
任务类型     推荐方案        原因
─────────────────────────────────────────
CPU计算     多进程          绕过GIL，多核并行
少量IO      多线程          代码简单，易理解
大量网络IO  asyncio协程    单线程万级并发，开销极小

关键：GIL只阻止Python字节码并行执行，
     IO等待或C扩展计算时GIL会释放！
""")
# 想要CPU并行：用 multiprocessing / ProcessPoolExecutor
# 想要IO并发：用 threading / asyncio（asyncio 资源开销最小）
`,
  },
  {
    id: "py6-concurrency-choice",
    group: "并发网络",
    icon: "🤔",
    title: "并发选择指南",
    content: `## 并发选择指南（IO密集vsCPU密集/选型决策树）

### 三种并发模型对比

| 特性 | 多线程 threading | 多进程 multiprocessing | 异步 asyncio |
|------|------------------|------------------------|--------------|
| 执行方式 | 线程切换 | 多核并行 | 协程切换 |
| GIL | 受限制 | 不受限制 | 单线程 |
| 内存 | 共享 | 独立（拷贝开销） | 共享 |
| 并发数 | 百级 | 十级（核数） | 万级 |
| 代码复杂度 | 低 | 中 | 较高 |
| 调试难度 | 中 | 高 | 高 |
| 数据共享 | 直接共享 | IPC通信 | 直接共享 |
| 适用 | 少量IO | CPU计算 | 大量网络IO |

### 决策树
1. 是否CPU密集？→ 是 → 多进程
2. 是否需要超高并发？→ 是 → asyncio
3. 代码是否需要简单？→ 是 → 多线程
4. 是否有大量回调/状态机？→ asyncio
5. 是否要跨进程隔离？→ 多进程

### 混合方案
实际项目中常混合使用：
- asyncio 处理高并发网络连接
- 把CPU密集任务丢给 ProcessPoolExecutor（loop.run_in_executor）
- 简单IO任务用 ThreadPoolExecutor`,
    code: `import asyncio
import time
import math
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

# 并发模型选择核心：CPU密集用多进程，IO密集用多线程/asyncio
# asyncio 单线程可处理万级并发，资源开销最小

def simulate_io(task_id):
    """模拟IO操作（如数据库查询、API调用）"""
    time.sleep(0.1)  # IO等待时 GIL 释放，线程可并发
    return f"IO-{task_id}"

def simulate_cpu(n):
    """模拟CPU密集计算"""
    result = 0
    for i in range(n):
        result += i ** 0.5
    return result

print("=== 并发模式选择演示 ===")

print("\\n1. 场景分析：")
print("   - 爬取10个网页（IO密集）      → 多线程/asyncio")
print("   - 处理图片/视频（CPU密集）    → 多进程")
print("   - 聊天服务器（万级连接）      → asyncio")
print("   - 简单批量文件处理            → 多线程")

# 少量IO任务：线程池代码简单，开箱即用
print("\\n2. 多线程演示（少量IO任务）:")
start = time.time()
with ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(simulate_io, range(8)))
print(f"   8个IO任务耗时: {time.time()-start:.3f}秒")
print(f"   结果: {results[:3]}...")

# 大量并发用 asyncio：每个协程开销远小于线程，适合万级连接
print("\\n3. asyncio演示（大量并发IO）:")
async def async_io(task_id):
    await asyncio.sleep(0.1)
    return f"async-IO-{task_id}"

async def main_async():
    start = time.time()
    # gather 把20个协程并发执行，总耗时≈单次IO时间而非累加
    tasks = [async_io(i) for i in range(20)]
    results = await asyncio.gather(*tasks)
    print(f"   20个协程耗时: {time.time()-start:.3f}秒")
    print(f"   结果数: {len(results)}")

asyncio.run(main_async())

# CPU密集任务：多线程因GIL无加速，多进程才能真正并行
print("\\n4. CPU计算演示（对比线程和概念上的进程）:")
print("   计算量: 求1-100000平方根和（纯Python，受GIL影响）")
calc_n = 50000

start = time.time()
simulate_cpu(calc_n)
simulate_cpu(calc_n)
print(f"   单线程两次: {time.time()-start:.3f}秒")

# 2线程执行CPU密集任务：GIL 导致两线程串行执行 Python 代码
start = time.time()
with ThreadPoolExecutor(max_workers=2) as pool:
    list(pool.map(simulate_cpu, [calc_n, calc_n]))
print(f"   2线程: {time.time()-start:.3f}秒（GIL导致无明显加速）")
print("   → CPU密集请用 ProcessPoolExecutor（需__main__保护）")

print("\\n=== 最终选型口诀 ===")
print("""
IO少量线程池，
CPU密集多进程，
海量连接用异步，
混合搭配最灵活。
""")

# 混合方案（loop.run_in_executor 把阻塞任务丢给线程/进程池）：
#   async def main():
#       loop = asyncio.get_running_loop()
#       # CPU密集丢给进程池，不阻塞事件循环
#       result = await loop.run_in_executor(process_pool, cpu_func, data)
#       # 阻塞IO丢给线程池
#       data = await loop.run_in_executor(thread_pool, blocking_io)
`,
  },
  {
    id: "py6-socket-basic",
    group: "并发网络",
    icon: "🌐",
    title: "Socket基础",
    content: `## Socket基础（TCP socket客户端/connect/send/recv简单演示、服务端仅概念讲解）

### 什么是 Socket？
Socket 是网络编程的抽象层，提供了进程间网络通信的接口。可以理解为"网络上的文件描述符"。

### TCP Socket 核心概念
- **服务端**：bind() → listen() → accept() → recv()/send() → close()
- **客户端**：socket() → connect() → send()/recv() → close()
- **TCP**：面向连接、可靠传输、流式协议

### 核心函数
- \`socket.socket(family, type)\`：创建套接字
  - family: AF_INET(IPv4) / AF_INET6(IPv6)
  - type: SOCK_STREAM(TCP) / SOCK_DGRAM(UDP)
- \`connect((host, port))\`：连接服务器
- \`send(bytes)\` / \`sendall(bytes)\`：发送数据（sendall 保证全部发出）
- \`recv(bufsize)\`：接收数据，返回 bytes
- \`bind((host, port))\`：绑定地址端口
- \`listen(backlog)\`：开始监听，backlog 是等待队列长度
- \`accept()\`：接受客户端连接，返回 (conn, addr)

### SO_REUSEADDR 选项
\`setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)\` 允许端口立即重用：
- 服务器重启时可立即绑定上次占用的端口，避免 "Address already in use"
- 没有 SO_REUSEADDR 时，TIME_WAIT 状态的端口会阻塞几十秒到几分钟
- 服务端几乎必加此选项

### 注意事项
- 发送接收的都是 bytes，字符串需要 encode()/decode()
- recv() 可能一次收不完，需要循环接收（TCP是字节流，无消息边界）
- 网络编程要处理各种异常（连接断开、超时等）
- 端口范围 0-65535，<1024 需要管理员权限`,
    code: `import socket
import threading
import time

# Socket 是网络编程的底层抽象，所有HTTP库都基于它构建
# TCP Socket 通信流程：服务端 bind/listen/accept，客户端 connect

def run_demo_server():
    """在后台线程启动一个极简测试服务器"""
    # AF_INET: IPv4, SOCK_STREAM: TCP流式套接字
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # SO_REUSEADDR: 允许端口立即重用，避免 "Address already in use"
    # 服务端几乎必加，否则重启后端口处于 TIME_WAIT 会阻塞很久
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(('127.0.0.1', 19999))  # 绑定本地回环地址和端口
    server.listen(1)  # 开始监听，参数为等待队列长度
    server.settimeout(3)  # 设置超时，防止 accept 永久阻塞

    def serve():
        try:
            # accept() 阻塞等待客户端连接，返回 (连接对象, 客户端地址)
            conn, addr = server.accept()
            # recv 必须传最大字节数，TCP是字节流，一次不一定收完
            data = conn.recv(1024)
            # 响应必须是 bytes，HTTP协议用 \\r\\n 作为换行
            response = b"HTTP/1.1 200 OK\\r\\nContent-Length: 13\\r\\n\\r\\nHello, Socket!"
            # sendall 确保全部数据发出（send 可能只发一部分）
            conn.sendall(response)
            conn.close()
        except:
            pass
        finally:
            server.close()

    t = threading.Thread(target=serve, daemon=True)
    t.start()
    time.sleep(0.2)  # 等待服务器就绪
    return t

print("=== Socket 基础演示 ===")

print("\\n--- Socket 概念 ---")
print("""
服务端流程:
  socket() → bind(地址端口) → listen() → accept() → recv/send → close()

客户端流程:
  socket() → connect(服务器地址) → send/recv → close()
""")

print("--- 启动本地测试服务器 ---")
server_thread = run_demo_server()
print("  测试服务器已在 127.0.0.1:19999 启动")

print("\\n--- TCP 客户端演示（连接本地回环）---")
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(2)  # 设置超时，防止网络异常时永久阻塞
    print(f"  创建socket: {s}")

    # connect 建立TCP连接，参数为 (host, port) 元组
    s.connect(('127.0.0.1', 19999))
    print("  连接成功！")

    # 发送的数据必须是 bytes，字符串前加 b 或用 encode()
    request = b"GET / HTTP/1.1\\r\\nHost: localhost\\r\\n\\r\\n"
    s.sendall(request)
    print(f"  发送 {len(request)} 字节请求")

    # recv 返回 bytes，需 decode 成字符串才能打印
    # 注意：实际应用中 recv 可能一次收不全，需循环接收直到收完
    response = s.recv(4096)
    print(f"  收到 {len(response)} 字节响应")
    print(f"  响应内容:\\n{response.decode('utf-8', errors='replace')}")

    s.close()  # 主动关闭连接，释放资源
    print("  连接已关闭")
except Exception as e:
    print(f"  连接异常（服务器可能未就绪）: {e}")

server_thread.join(timeout=1)

print("\\n--- 常用Socket属性 ---")
print("AF_INET   =", socket.AF_INET, "(IPv4)")
print("SOCK_STREAM =", socket.SOCK_STREAM, "(TCP)")
print("SOCK_DGRAM  =", socket.SOCK_DGRAM, "(UDP)")

print("\\n=== Socket 总结 ===")
print("1. TCP是可靠流式协议，需先建立连接")
print("2. 数据收发都是 bytes，注意编码解码")
print("3. 服务器需要 bind/listen/accept 三步")
print("4. 注意异常处理和超时设置")
print("5. 实际开发推荐用更高层封装（http.client、requests等）")
`,
  },
  {
    id: "py6-http-client",
    group: "并发网络",
    icon: "📡",
    title: "HTTP客户端",
    content: `## HTTP客户端（urllib.request发送GET/POST请求概念、headers、解析响应——只做简单演示不实际联网，用http.server启动临时服务测试）

### HTTP 基础
- 请求方法：GET（获取）、POST（提交）、PUT（更新）、DELETE（删除）
- 状态码：200成功、301重定向、404未找到、500服务器错误
- Headers：Content-Type、User-Agent、Cookie 等

### urllib.request 模块
Python 标准库 HTTP 客户端：
- \`urlopen(url, data=None, timeout)\`：发送请求
- \`Request(url, data, headers, method)\`：构造请求对象
- data 参数不为 None 时自动变为 POST 请求
- 返回响应对象：read()、status、headers、getheader()

### http.server 模块
快速搭建测试用HTTP服务器：
- \`HTTPServer((addr, port), handler)\`
- \`BaseHTTPRequestHandler\`：自定义处理
- 适合测试，不适合生产

### 注意
- 生产环境推荐用 requests 库（第三方，更易用）
- POST 数据需要 URL 编码（urllib.parse.urlencode）
- JSON 请求需要 Content-Type: application/json

### urllib vs requests 对比
| 特性 | urllib.request（标准库） | requests（第三方） |
|------|--------------------------|--------------------|
| 安装 | 无需安装 | 需 pip install requests |
| 代码量 | 较多，需手动编码/解码 | 极简，自动处理 |
| JSON | 需 json.loads(resp.read()) | resp.json() 一行搞定 |
| 表单 | urlencode + Request | data=dict 参数 |
| Session | 较繁琐 | requests.Session() 简单 |
| 超时 | urlopen(timeout=) | timeout= 参数 |
| 异常 | urllib.error.URLError | requests.exceptions.* |

urllib 示例：
\`\`\`python
import urllib.request, json
req = urllib.request.Request(url, headers={"Content-Type": "application/json"}, data=json.dumps(data).encode())
with urllib.request.urlopen(req, timeout=5) as resp:
    result = json.loads(resp.read().decode())
\`\`\`

requests 示例（更简洁）：
\`\`\`python
import requests
resp = requests.post(url, json=data, timeout=5)
result = resp.json()
\`\`\`

总结：标准库够用但繁琐；生产环境优先 requests，代码更清晰、维护更简单。`,
    code: `import http.server
import threading
import time
import urllib.request
import urllib.parse
import json

# 用 http.server 搭建本地测试服务器，避免联网，可复现
# urllib.request 是 Python 标准库 HTTP 客户端，无需安装

class DemoHandler(http.server.BaseHTTPRequestHandler):
    """极简测试HTTP服务器"""
    def do_GET(self):
        if self.path == "/api/user":
            self.send_response(200)  # 发送状态码
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()  # 结束响应头
            # 响应体必须是 bytes，json.dumps 后 .encode()
            data = json.dumps({"name": "张三", "age": 25, "city": "北京"}).encode()
            self.wfile.write(data)  # wfile 是写入响应体的文件对象
        else:
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write("GET 请求成功！".encode())

    def do_POST(self):
        # 读取请求体：先从 Content-Length 头得知长度
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        resp = json.dumps({"received": body.decode("utf-8"), "status": "ok"}).encode()
        self.wfile.write(resp)

    def log_message(self, format, *args):
        pass  # 屏蔽默认的请求日志输出

def start_test_server(port=18888):
    server = http.server.HTTPServer(("127.0.0.1", port), DemoHandler)
    # 用 daemon 线程跑服务器，主程序退出时自动结束
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    time.sleep(0.3)  # 等待服务器就绪
    return server

print("=== HTTP 客户端演示 ===")

print("\\n启动本地测试服务器...")
port = 18888
server = start_test_server(port)
base_url = f"http://127.0.0.1:{port}"
print(f"服务器运行在 {base_url}")

# GET 请求：urlopen 直接传 URL，最简单
# with 语句会自动关闭响应对象，释放连接
print("\\n--- 1. 简单 GET 请求 ---")
try:
    with urllib.request.urlopen(f"{base_url}/", timeout=2) as resp:
        print(f"  状态码: {resp.status}")
        print(f"  响应头 Content-Type: {resp.getheader('Content-Type')}")
        # resp.read() 返回 bytes，需 decode 成字符串
        body = resp.read().decode("utf-8")
        print(f"  响应内容: {body}")
except Exception as e:
    print(f"  请求失败: {e}")

# 需要自定义请求头时，用 Request 对象封装
print("\\n--- 2. GET 获取 JSON 数据 ---")
try:
    req = urllib.request.Request(f"{base_url}/api/user")
    req.add_header("User-Agent", "Python-Demo/1.0")  # 添加请求头
    with urllib.request.urlopen(req, timeout=2) as resp:
        # JSON 响应需手动 read + decode + json.loads
        data = json.loads(resp.read().decode("utf-8"))
        print(f"  JSON数据: {data}")
        print(f"  用户名: {data['name']}, 城市: {data['city']}")
except Exception as e:
    print(f"  请求失败: {e}")

# POST 表单：数据需 urlencode 编码为 application/x-www-form-urlencoded
print("\\n--- 3. POST 提交表单数据 ---")
try:
    # urlencode 把字典转成 "key=value&key2=value2" 格式，再 encode 成 bytes
    params = urllib.parse.urlencode({"username": "test", "password": "123456"}).encode()
    req = urllib.request.Request(
        f"{base_url}/login",
        data=params,  # data 不为 None 时，urlopen 自动用 POST
        method="POST",
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    with urllib.request.urlopen(req, timeout=2) as resp:
        result = json.loads(resp.read().decode("utf-8"))
        print(f"  POST响应: {result}")
except Exception as e:
    print(f"  请求失败: {e}")

# POST JSON：手动 json.dumps + 设置 Content-Type: application/json
print("\\n--- 4. POST 提交 JSON 数据 ---")
try:
    json_data = json.dumps({"title": "测试", "content": "Hello HTTP"}).encode()
    req = urllib.request.Request(
        f"{base_url}/api/posts",
        data=json_data,
        method="POST",
        headers={"Content-Type": "application/json"}  # 关键：声明JSON格式
    )
    with urllib.request.urlopen(req, timeout=2) as resp:
        result = json.loads(resp.read().decode("utf-8"))
        print(f"  JSON POST响应: {result}")
except Exception as e:
    print(f"  请求失败: {e}")

server.shutdown()
print("\\n测试服务器已关闭")

print("\\n=== HTTP 客户端总结 ===")
print("1. urllib.request 是标准库，无需安装")
print("2. GET用urlopen直接请求，POST需要data参数")
print("3. 请求头用 Request.add_header() 添加")
print("4. JSON请求需设置 Content-Type: application/json")
print("5. 生产环境可用 requests 库（更简洁）")
print("   requests.post(url, json=data) 等价于上面的 JSON POST 流程")
`,
  },
  {
    id: "py6-email",
    group: "并发网络",
    icon: "📧",
    title: "邮件发送",
    content: `## 邮件发送（smtplib/email.mime构造邮件/概念讲解+简单打印示例，不真的发邮件）

### 邮件发送原理
SMTP（Simple Mail Transfer Protocol）是发送邮件的标准协议，默认端口25，加密端口465(SSL)/587(TLS)。

### smtplib 模块
- \`SMTP(host, port)\`：连接SMTP服务器
- \`starttls()\`：启用TLS加密
- \`login(user, password)\`：登录（注意：很多服务商要求用授权码而非密码）
- \`sendmail(from, to, msg)\`：发送邮件
- \`quit()\`：关闭连接

### email.mime 模块（构造邮件内容）
- **MIMEText**：纯文本/HTML内容
- **MIMEImage**：图片附件
- **MIMEMultipart**：混合邮件（文本+附件+图片）
- **MIMEBase**：通用MIME对象
- Header：编码中文主题/发件人名

### 常用邮箱SMTP
- QQ邮箱: smtp.qq.com（端口465/587）
- 163邮箱: smtp.163.com
- Gmail: smtp.gmail.com（需应用专用密码）

### 注意事项
- 实际发送前通常需要开启SMTP服务并获取授权码
- 不要硬编码密码，使用环境变量或配置文件
- 本演示仅构造邮件内容并打印，不实际连接SMTP服务器`,
    code: `import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from email.header import Header
import os

# smtplib：负责连接SMTP服务器并发送邮件
# email.mime：负责构造邮件内容（纯文本/HTML/附件）
# 本演示只构造邮件对象并打印，不实际连接SMTP服务器

print("=== 邮件发送概念演示 ===")

print("\\n--- SMTP 发送流程 ---")
print("""
1. 连接SMTP服务器  smtplib.SMTP(smtp_server, port)
2. 启用加密       starttls() 或 SMTP_SSL()
3. 登录认证       login(邮箱, 授权码)
4. 构造邮件       email.mime 模块创建MIME对象
5. 发送邮件       sendmail(发件人, 收件人, 邮件字符串)
6. 关闭连接       quit()
""")

# MIMEText 构造纯文本/HTML邮件
# 参数：内容、subtype（plain/html）、字符编码
print("--- 1. 构造纯文本邮件 ---")
text_msg = MIMEText("这是邮件的正文内容，你好！\\n这是第二行文字。", "plain", "utf-8")
# 中文发件人名/主题需用 Header 编码，避免乱码
text_msg["From"] = Header("发送者昵称", "utf-8").encode() + " <s****@*********>"
text_msg["To"] = "r******@*********"
text_msg["Subject"] = Header("这是测试邮件主题", "utf-8").encode()
print("纯文本邮件构造完成:")
print("-" * 50)
# as_string() 把MIME对象转成符合RFC标准的邮件字符串
print(text_msg.as_string())
print("-" * 50)

# HTML邮件：MIMEText 第二个参数改为 "html"，邮件客户端会渲染HTML
print("\\n--- 2. 构造HTML邮件 ---")
html_content = """
<html>
<body>
<h2 style="color: blue;">HTML邮件示例</h2>
<p>这是一封<b>HTML格式</b>的邮件。</p>
<p>可以包含 <a href="https://python.org">链接</a> 和各种样式。</p>
<ul>
    <li>列表项1</li>
    <li>列表项2</li>
</ul>
</body>
</html>
"""
html_msg = MIMEText(html_content, "html", "utf-8")
html_msg["Subject"] = Header("HTML邮件主题", "utf-8")
html_msg["From"] = "p****@**********"
html_msg["To"] = "u***@**********"
print("HTML邮件已构造（省略HTML源码）")

# 带附件邮件：用 MIMEMultipart 作为容器，attach 各部分内容
print("\\n--- 3. 构造带附件的邮件（概念演示）---")
msg = MIMEMultipart()
msg["From"] = "s****@*********"
msg["To"] = "r******@*********"
msg["Subject"] = Header("带附件的邮件", "utf-8")

# 正文部分
body = MIMEText("这是邮件正文，请查看附件。", "plain", "utf-8")
msg.attach(body)  # 把正文 attach 到容器

# 附件添加方式（附件需Base64编码后嵌入邮件）
print("附件添加方式:")
print("""
from email.mime.base import MIMEBase
from email import encoders

attachment = MIMEBase("application", "octet-stream")
with open("file.pdf", "rb") as f:
    attachment.set_payload(f.read())  # 读取二进制内容
encoders.encode_base64(attachment)  # Base64编码，邮件只能传ASCII
attachment.add_header(
    "Content-Disposition",
    "attachment",
    filename=("utf-8", "", "报告.pdf")  # 处理中文文件名
)
msg.attach(attachment)
""")

# 实际发送模板：用环境变量存授权码，避免硬编码
print("\\n--- 4. SMTP 发送代码模板（不实际执行）---")
smtp_template = '''
import smtplib
import os
from email.mime.text import MIMEText

smtp_server = "smtp.qq.com"
smtp_port = 465
sender = "y*******@******"
password = os.environ.get("SMTP_PASSWORD")  # 从环境变量读取授权码
receiver = "r******@*********"

msg = MIMEText("邮件内容", "plain", "utf-8")
msg["From"] = sender
msg["To"] = receiver
msg["Subject"] = "邮件主题"

# with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
#     server.login(sender, password)
#     server.sendmail(sender, receiver, msg.as_string())
#     print("邮件发送成功！")
'''
print(smtp_template)

print("=== 邮件发送注意事项 ===")
print("1. 大多数邮箱需开启SMTP服务并获取授权码")
print("2. 不要在代码中硬编码密码，用环境变量")
print("3. 中文主题/发件人需用 Header 编码")
print("4. 附件文件名中文需特殊处理")
print("5. 群发邮件收件人用列表，To字段用逗号分隔")
print("6. 敏感操作（生产环境）建议用事务邮件服务")
`,
  },
];
