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

def worker(name, delay):
    """线程工作函数"""
    print(f"[线程 {name}] 开始执行")
    time.sleep(delay)
    print(f"[线程 {name}] 执行结束，耗时 {delay} 秒")

print("=== 线程基础演示 ===")
print(f"主线程: {threading.current_thread().name}")

# 方式1：直接创建 Thread 对象
t1 = threading.Thread(target=worker, args=("A", 0.3), name="Worker-A")
t2 = threading.Thread(target=worker, args=("B", 0.2), name="Worker-B")

# 守护线程示例：程序结束时自动终止
t_daemon = threading.Thread(
    target=worker, args=("守护", 2), name="Daemon", daemon=True
)

print("\\n启动线程...")
t1.start()
t2.start()
t_daemon.start()

print(f"活动线程数: {threading.active_count()}")
print(f"线程列表: {[t.name for t in threading.enumerate()]}")

print("\\n等待非守护线程结束...")
t1.join()
t2.join()

print(f"\\n非守护线程执行完毕，主线程结束")
print(f"守护线程可能还在运行但会随主线程退出")
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
lock = threading.Lock()
rlock = threading.RLock()

def add_without_lock():
    """无锁累加演示（有竞态风险）"""
    global counter
    temp = counter
    time.sleep(0.01)
    counter = temp + 1

def add_with_lock():
    """使用 Lock 累加"""
    global counter
    with lock:
        temp = counter
        time.sleep(0.01)
        counter = temp + 1

def rlock_demo():
    """RLock 可重入演示"""
    def nested():
        rlock.acquire()
        print("  内层获取锁成功")
        rlock.release()

    rlock.acquire()
    print("  外层获取锁成功")
    nested()
    rlock.release()
    print("  RLock 可重入测试完成")

print("=== 线程锁与同步演示 ===")

print("\\n1. 无锁累加（10个线程各+1）:")
counter = 0
threads = [threading.Thread(target=add_without_lock) for _ in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()
print(f"结果: {counter}（期望10，可能不等于10）")

print("\\n2. 有锁累加（10个线程各+1）:")
counter = 0
threads = [threading.Thread(target=add_with_lock) for _ in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()
print(f"结果: {counter}（期望10）")

print("\\n3. RLock 可重入测试:")
rlock_demo()

print("\\n4. 死锁演示（概念）:")
print("死锁场景：线程A持有锁1等待锁2，线程B持有锁2等待锁1")
print("解决方案：统一加锁顺序、使用超时、try/finally确保释放")
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
start_event = threading.Event()

def runner(name):
    """等待发令枪"""
    print(f"运动员 {name} 准备就绪")
    start_event.wait()
    print(f"运动员 {name} 起跑！")

runners = [threading.Thread(target=runner, args=(i,)) for i in range(3)]
for t in runners:
    t.start()

time.sleep(0.2)
print("\\n各就各位...预备...")
time.sleep(0.2)
print("跑！")
start_event.set()

for t in runners:
    t.join()

print("\\n=== Condition 条件变量演示（生产者消费者）===")
condition = threading.Condition()
queue = []
MAX_SIZE = 3

def producer():
    for i in range(5):
        with condition:
            while len(queue) >= MAX_SIZE:
                condition.wait(timeout=2)
            item = f"产品{i}"
            queue.append(item)
            print(f"生产者生产: {item}, 当前队列: {queue}")
            condition.notify_all()
        time.sleep(0.05)

def consumer(name, count):
    for _ in range(count):
        with condition:
            while not queue:
                condition.wait(timeout=2)
                if not queue:
                    return
            item = queue.pop(0)
            print(f"消费者{name}消费: {item}, 当前队列: {queue}")
            condition.notify_all()
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

print("=== FIFO 队列演示 ===")
q = queue.Queue(maxsize=3)

q.put("A")
q.put("B")
q.put("C")
print(f"队列大小: {q.qsize()}, 是否满: {q.full()}")
print(f"取出: {q.get()}")
print(f"取出: {q.get()}")
print(f"取出: {q.get()}")
print(f"是否空: {q.empty()}")

print("\\n=== LifoQueue 栈演示 ===")
lifo = queue.LifoQueue()
for i in range(1, 4):
    lifo.put(f"第{i}个")
while not lifo.empty():
    print(f"取出: {lifo.get()}")

print("\\n=== PriorityQueue 优先级队列 ===")
pq = queue.PriorityQueue()
pq.put((3, "普通任务"))
pq.put((1, "紧急任务"))
pq.put((2, "重要任务"))
while not pq.empty():
    priority, task = pq.get()
    print(f"优先级{priority}: {task}")

print("\\n=== 生产者消费者（Queue 版）===")
task_queue = queue.Queue(maxsize=5)

def producer():
    for i in range(6):
        task_queue.put(f"任务{i}")
        print(f"生产: 任务{i}")
        time.sleep(0.05)
    task_queue.put(None)

def consumer():
    while True:
        item = task_queue.get()
        if item is None:
            task_queue.put(None)
            break
        print(f"消费: {item}")
        time.sleep(0.08)
        task_queue.task_done()

p = threading.Thread(target=producer)
c = threading.Thread(target=consumer)
p.start()
c.start()
p.join()
c.join()
print("队列版生产者消费者完成")
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

def fetch_data(url_id):
    """模拟IO操作（如网络请求）"""
    time.sleep(0.2)
    return f"数据{url_id}"

def compute(x):
    """简单计算"""
    return x * x

print("=== ThreadPoolExecutor 演示 ===")

print("\\n1. map 方式（按输入顺序返回）:")
with ThreadPoolExecutor(max_workers=3) as pool:
    start = time.time()
    results = pool.map(fetch_data, range(5))
    for r in results:
        print(f"  得到: {r}")
    print(f"  map 耗时: {time.time()-start:.2f}秒（串行需1秒以上）")

print("\\n2. submit + as_completed（先完成先返回）:")
with ThreadPoolExecutor(max_workers=3) as pool:
    futures = [pool.submit(compute, i) for i in range(1, 6)]
    for future in as_completed(futures):
        print(f"  计算结果: {future.result()}")

print("\\n3. 异常处理示例:")
def might_fail(x):
    if x == 3:
        raise ValueError(f"数字{x}出错了")
    return x * 10

with ThreadPoolExecutor(max_workers=2) as pool:
    futures = {pool.submit(might_fail, i): i for i in range(1, 6)}
    for future in as_completed(futures):
        num = futures[future]
        try:
            print(f"  {num} -> {future.result()}")
        except Exception as e:
            print(f"  {num} 异常: {e}")

print("\\n线程池演示完成")
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

def worker(name, delay):
    """进程工作函数"""
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
    time.sleep(0.1)
    return n * n

print("=== 进程池 vs 线程池 演示 ===")
print(f"主进程 PID: {os.getpid()}")

numbers = [500, 800, 1000, 600]

print("\\n1. CPU密集型 - 顺序执行:")
start = time.time()
for n in numbers:
    cpu_intensive(n)
print(f"   耗时: {time.time()-start:.3f}秒")

print("\\n2. CPU密集型 - ThreadPoolExecutor(4):")
print("   （受GIL限制，可能并不比顺序快）")
start = time.time()
with ThreadPoolExecutor(max_workers=4) as pool:
    list(pool.map(cpu_intensive, numbers))
print(f"   耗时: {time.time()-start:.3f}秒")

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

async def hello(name, delay):
    """定义一个协程"""
    print(f"  [{name}] 开始执行...")
    await asyncio.sleep(delay)
    print(f"  [{name}] 执行结束，等待了 {delay} 秒")
    return f"{name}的结果"

async def main():
    """主协程"""
    print("=== asyncio 基础演示 ===")
    print(f"开始时间: {time.strftime('%H:%M:%S')}")

    print("\\n1. 串行 await（一个接一个执行）:")
    start = time.time()
    await hello("A", 0.3)
    await hello("B", 0.3)
    print(f"串行总耗时: {time.time()-start:.2f}秒")

    print("\\n2. await asyncio.sleep() vs time.sleep() 区别:")
    print("   - await asyncio.sleep(): 非阻塞，让出控制权给其他协程")
    print("   - time.sleep(): 阻塞，卡住整个事件循环，绝不要在协程中用！")

    print("\\n3. 协程对象不会自动执行:")
    coro = hello("未运行", 0.1)
    print(f"   直接调用返回: {type(coro)}，需要await或放进事件循环")
    await coro

    print(f"\\n结束时间: {time.strftime('%H:%M:%S')}")

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

async def fetch_data(source):
    """模拟异步获取数据"""
    delay = random.uniform(0.1, 0.3)
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

    print("\\n2. await 获取返回值:")
    value = await fetch_data("数据库")
    print(f"   获取到: {value}")

    print("\\n3. await 异常传播:")
    async def might_fail():
        await asyncio.sleep(0.1)
        raise ValueError("异步操作失败！")

    try:
        await might_fail()
    except ValueError as e:
        print(f"   捕获到异步异常: {e}")

    print("\\n4. 多个 await 顺序执行演示:")
    results = []
    sources = ["源1", "源2", "源3"]
    for src in sources:
        r = await fetch_data(src)
        results.append(r)
    for r in results:
        print(f"   {r}")

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

### 关键区别
- 直接 \`await coro\`：串行执行，一个结束才下一个
- \`create_task()\`：立即调度并发执行
- \`gather()\`：批量并发并收集结果

### 取消任务
\`task.cancel()\` 可以取消正在运行的任务，会抛 CancelledError。`,
    code: `import asyncio
import random

async def task(name, delay):
    await asyncio.sleep(delay)
    if name == "失败任务":
        raise RuntimeError(f"{name}出错了")
    return f"{name}完成(耗时{delay:.2f}s)"

async def main():
    print("=== asyncio Task 与并发 ===")

    print("\\n1. create_task 并发执行:")
    t1 = asyncio.create_task(task("A", 0.2), name="任务A")
    t2 = asyncio.create_task(task("B", 0.3), name="任务B")
    t3 = asyncio.create_task(task("C", 0.1), name="任务C")
    print(f"   任务已创建，开始并发执行...")
    r1 = await t1
    r2 = await t2
    r3 = await t3
    print(f"   结果: {r1}, {r2}, {r3}")

    print("\\n2. gather 并发收集结果（按输入顺序返回）:")
    results = await asyncio.gather(
        task("X", 0.2),
        task("Y", 0.1),
        task("Z", 0.15),
    )
    print(f"   gather结果: {results}")

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

    print("\\n4. wait_for 超时控制:")
    async def slow_task():
        await asyncio.sleep(1)
        return "太慢了"

    try:
        result = await asyncio.wait_for(slow_task(), timeout=0.2)
        print(f"   结果: {result}")
    except asyncio.TimeoutError:
        print(f"   超时了！任务被取消")

    print("\\n5. as_completed 按完成顺序处理:")
    tasks = [task(f"任务{i}", random.uniform(0.05, 0.25)) for i in range(4)]
    for idx, coro in enumerate(asyncio.as_completed(tasks)):
        res = await coro
        print(f"   第{idx+1}个完成: {res}")

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

def cpu_work(n):
    """CPU密集：纯Python计算"""
    total = 0
    for i in range(n):
        total += math.sqrt(i) * math.sin(i)
    return total

def io_work(n):
    """IO密集：sleep模拟网络等待"""
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

def simulate_io(task_id):
    """模拟IO操作（如数据库查询、API调用）"""
    time.sleep(0.1)
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

print("\\n2. 多线程演示（少量IO任务）:")
start = time.time()
with ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(simulate_io, range(8)))
print(f"   8个IO任务耗时: {time.time()-start:.3f}秒")
print(f"   结果: {results[:3]}...")

print("\\n3. asyncio演示（大量并发IO）:")
async def async_io(task_id):
    await asyncio.sleep(0.1)
    return f"async-IO-{task_id}"

async def main_async():
    start = time.time()
    tasks = [async_io(i) for i in range(20)]
    results = await asyncio.gather(*tasks)
    print(f"   20个协程耗时: {time.time()-start:.3f}秒")
    print(f"   结果数: {len(results)}")

asyncio.run(main_async())

print("\\n4. CPU计算演示（对比线程和概念上的进程）:")
print("   计算量: 求1-100000平方根和（纯Python，受GIL影响）")
calc_n = 50000

start = time.time()
simulate_cpu(calc_n)
simulate_cpu(calc_n)
print(f"   单线程两次: {time.time()-start:.3f}秒")

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
- \`send(bytes)\`：发送数据
- \`recv(bufsize)\`：接收数据
- \`bind((host, port))\`：绑定地址端口
- \`listen(backlog)\`：开始监听
- \`accept()\`：接受客户端连接

### 注意事项
- 发送接收的都是 bytes，字符串需要 encode()/decode()
- recv() 可能一次收不完，需要循环接收
- 网络编程要处理各种异常（连接断开、超时等）
- 端口范围 0-65535，<1024 需要管理员权限`,
    code: `import socket
import threading
import time

def run_demo_server():
    """在后台线程启动一个极简测试服务器"""
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(('127.0.0.1', 19999))
    server.listen(1)
    server.settimeout(3)

    def serve():
        try:
            conn, addr = server.accept()
            data = conn.recv(1024)
            response = b"HTTP/1.1 200 OK\\r\\nContent-Length: 13\\r\\n\\r\\nHello, Socket!"
            conn.sendall(response)
            conn.close()
        except:
            pass
        finally:
            server.close()

    t = threading.Thread(target=serve, daemon=True)
    t.start()
    time.sleep(0.2)
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
    s.settimeout(2)
    print(f"  创建socket: {s}")

    s.connect(('127.0.0.1', 19999))
    print("  连接成功！")

    request = b"GET / HTTP/1.1\\r\\nHost: localhost\\r\\n\\r\\n"
    s.sendall(request)
    print(f"  发送 {len(request)} 字节请求")

    response = s.recv(4096)
    print(f"  收到 {len(response)} 字节响应")
    print(f"  响应内容:\\n{response.decode('utf-8', errors='replace')}")

    s.close()
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
- JSON 请求需要 Content-Type: application/json`,
    code: `import http.server
import threading
import time
import urllib.request
import urllib.parse
import json

class DemoHandler(http.server.BaseHTTPRequestHandler):
    """极简测试HTTP服务器"""
    def do_GET(self):
        if self.path == "/api/user":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            data = json.dumps({"name": "张三", "age": 25, "city": "北京"}).encode()
            self.wfile.write(data)
        else:
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write("GET 请求成功！".encode())

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        resp = json.dumps({"received": body.decode("utf-8"), "status": "ok"}).encode()
        self.wfile.write(resp)

    def log_message(self, format, *args):
        pass

def start_test_server(port=18888):
    server = http.server.HTTPServer(("127.0.0.1", port), DemoHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    time.sleep(0.3)
    return server

print("=== HTTP 客户端演示 ===")

print("\\n启动本地测试服务器...")
port = 18888
server = start_test_server(port)
base_url = f"http://127.0.0.1:{port}"
print(f"服务器运行在 {base_url}")

print("\\n--- 1. 简单 GET 请求 ---")
try:
    with urllib.request.urlopen(f"{base_url}/", timeout=2) as resp:
        print(f"  状态码: {resp.status}")
        print(f"  响应头 Content-Type: {resp.getheader('Content-Type')}")
        body = resp.read().decode("utf-8")
        print(f"  响应内容: {body}")
except Exception as e:
    print(f"  请求失败: {e}")

print("\\n--- 2. GET 获取 JSON 数据 ---")
try:
    req = urllib.request.Request(f"{base_url}/api/user")
    req.add_header("User-Agent", "Python-Demo/1.0")
    with urllib.request.urlopen(req, timeout=2) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        print(f"  JSON数据: {data}")
        print(f"  用户名: {data['name']}, 城市: {data['city']}")
except Exception as e:
    print(f"  请求失败: {e}")

print("\\n--- 3. POST 提交表单数据 ---")
try:
    params = urllib.parse.urlencode({"username": "test", "password": "123456"}).encode()
    req = urllib.request.Request(
        f"{base_url}/login",
        data=params,
        method="POST",
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    with urllib.request.urlopen(req, timeout=2) as resp:
        result = json.loads(resp.read().decode("utf-8"))
        print(f"  POST响应: {result}")
except Exception as e:
    print(f"  请求失败: {e}")

print("\\n--- 4. POST 提交 JSON 数据 ---")
try:
    json_data = json.dumps({"title": "测试", "content": "Hello HTTP"}).encode()
    req = urllib.request.Request(
        f"{base_url}/api/posts",
        data=json_data,
        method="POST",
        headers={"Content-Type": "application/json"}
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

print("--- 1. 构造纯文本邮件 ---")
text_msg = MIMEText("这是邮件的正文内容，你好！\\n这是第二行文字。", "plain", "utf-8")
text_msg["From"] = Header("发送者昵称", "utf-8").encode() + " <s****@*********>"
text_msg["To"] = "r******@*********"
text_msg["Subject"] = Header("这是测试邮件主题", "utf-8").encode()
print("纯文本邮件构造完成:")
print("-" * 50)
print(text_msg.as_string())
print("-" * 50)

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

print("\\n--- 3. 构造带附件的邮件（概念演示）---")
msg = MIMEMultipart()
msg["From"] = "s****@*********"
msg["To"] = "r******@*********"
msg["Subject"] = Header("带附件的邮件", "utf-8")

body = MIMEText("这是邮件正文，请查看附件。", "plain", "utf-8")
msg.attach(body)

print("附件添加方式:")
print("""
from email.mime.base import MIMEBase
from email import encoders

attachment = MIMEBase("application", "octet-stream")
with open("file.pdf", "rb") as f:
    attachment.set_payload(f.read())
encoders.encode_base64(attachment)
attachment.add_header(
    "Content-Disposition",
    "attachment",
    filename=("utf-8", "", "报告.pdf")  # 处理中文文件名
)
msg.attach(attachment)
""")

print("\\n--- 4. SMTP 发送代码模板（不实际执行）---")
smtp_template = '''
import smtplib
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
