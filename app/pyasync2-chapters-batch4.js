// =============================================================
// Python asyncio 教程 V2（pyasync2）—— 第四批章节
// -------------------------------------------------------------
// 并发控制与高级特性（15-19章）
//   第 15 章：asyncio.Lock 互斥锁
//   第 16 章：asyncio.Semaphore 信号量限流
//   第 17 章：asyncio.Event 事件通知
//   第 18 章：超时处理 asyncio.wait_for / timeout
//   第 19 章：取消任务与 shield
// =============================================================

export const chapters = [
  // =========================================================
  // 第十五章：asyncio.Lock 互斥锁
  // =========================================================
  {
    id: "pa2-15",
    group: "并发控制与高级特性",
    icon: "🔒",
    title: "asyncio.Lock 互斥锁",
    content: `## 一、为什么需要锁？

asyncio 虽然是单线程，但多个协程会交替执行。如果它们同时修改同一个变量，就会产生**竞态条件**。

## 二、asyncio.Lock

\`\`\`python
lock = asyncio.Lock()

async def increment():
    async with lock:
        # 同一时刻只有一个协程能执行这里
        current = counter
        await asyncio.sleep(0.01)
        counter = current + 1
\`\`\`

## 三、锁 vs 线程锁

| 锁类型 | 使用场景 |
|--------|----------|
| \`asyncio.Lock\` | 协程之间 |
| \`threading.Lock\` | 线程之间 |
| \`multiprocessing.Lock\` | 进程之间 |

## 四、锁的注意事项

- 锁会**串行化**代码，降低并发度
- 只在必须保护的临界区使用
- 避免死锁

## 五、本章 demo

演示 asyncio.Lock 的用法。
`,
    code: `"""
第十五章 demo：asyncio.Lock 互斥锁
目标：理解协程间共享资源的保护。
"""
import asyncio


# ===== 1. 无锁时的竞态条件 =====
class UnsafeCounter:
    """不安全的计数器"""

    def __init__(self):
        self.value = 0

    async def increment(self, name):
        current = self.value
        await asyncio.sleep(0.001)  # 模拟 I/O，让出 CPU
        self.value = current + 1
        print(f"  [{name}] value = {self.value}")


async def unsafe_demo():
    print("=== 1. 无锁：结果可能不正确 ===")
    counter = UnsafeCounter()
    await asyncio.gather(*[counter.increment(f"T{i}") for i in range(20)])
    print(f"  预期: 20, 实际: {counter.value}")


asyncio.run(unsafe_demo())
print()


# ===== 2. 有锁的计数器 =====
class SafeCounter:
    """安全的计数器"""

    def __init__(self):
        self.value = 0
        self.lock = asyncio.Lock()

    async def increment(self, name):
        async with self.lock:
            current = self.value
            await asyncio.sleep(0.001)  # 即使让出 CPU，锁也保护临界区
            self.value = current + 1
            print(f"  [{name}] value = {self.value}")


async def safe_demo():
    print("=== 2. 有锁：结果正确 ===")
    counter = SafeCounter()
    await asyncio.gather(*[counter.increment(f"T{i}") for i in range(20)])
    print(f"  预期: 20, 实际: {counter.value}")


asyncio.run(safe_demo())
print()


# ===== 3. 锁阻塞时的行为 =====
async def lock_queue():
    print("=== 3. 锁的等待队列 ===")
    lock = asyncio.Lock()

    async def worker(name):
        print(f"  [{name}] 尝试获取锁")
        async with lock:
            print(f"  [{name}] 获得锁")
            await asyncio.sleep(0.2)
            print(f"  [{name}] 释放锁")

    await asyncio.gather(
        worker("A"),
        worker("B"),
        worker("C"),
    )


asyncio.run(lock_queue())
print()


# ===== 4. 嵌套锁的风险 =====
async def deadlock_risk():
    print("=== 4. 不要嵌套使用同一把锁 ===")
    lock = asyncio.Lock()

    async def bad():
        async with lock:
            print("  外层获得锁")
            # async with lock:  # 同一把锁不能重入，会死锁！
            #     print("内层")

    await bad()
    print("  asyncio.Lock 不是可重入锁")


asyncio.run(deadlock_risk())
print()


# ===== 5. 实战：限制并发写日志 =====
class AsyncLogger:
    """异步日志器"""

    def __init__(self):
        self.logs = []
        self.lock = asyncio.Lock()

    async def write(self, message):
        async with self.lock:
            self.logs.append(message)
            await asyncio.sleep(0.01)


async def logger_demo():
    print("=== 5. 实战：异步日志器 ===")
    logger = AsyncLogger()
    await asyncio.gather(*[
        logger.write(f"日志 {i}")
        for i in range(10)
    ])
    print(f"  写入 {len(logger.logs)} 条日志")


asyncio.run(logger_demo())
print()


# ===== 6. try-finally 释放锁 =====
async def manual_lock():
    print("=== 6. 手动获取和释放锁 ===")
    lock = asyncio.Lock()
    await lock.acquire()
    try:
        print("  获得锁，执行任务")
        await asyncio.sleep(0.1)
    finally:
        lock.release()
        print("  释放锁")


asyncio.run(manual_lock())
`,
  },

  // =========================================================
  // 第十六章：asyncio.Semaphore 信号量限流
  // =========================================================
  {
    id: "pa2-16",
    group: "并发控制与高级特性",
    icon: "🚦",
    title: "asyncio.Semaphore 信号量限流",
    content: `## 一、什么是信号量？

信号量允许同时有**固定数量**的协程进入临界区。

\`\`\`python
sem = asyncio.Semaphore(3)  # 最多 3 个协程同时执行

async def fetch():
    async with sem:
        # 最多 3 个协程同时在这里
        await asyncio.sleep(1)
\`\`\`

## 二、应用场景

- 限制并发请求数（防刷）
- 限制同时打开的连接数
- 限制数据库连接数

## 三、与 Lock 的区别

| 类型 | 同时进入数量 |
|------|--------------|
| \`Lock\` | 1 个 |
| \`Semaphore\` | N 个 |

## 四、本章 demo

演示 asyncio.Semaphore 的用法。
`,
    code: `"""
第十六章 demo：asyncio.Semaphore 信号量限流
目标：学会控制最大并发数。
"""
import asyncio
import time


# ===== 1. 无限制并发 =====
async def fetch_unlimited(url):
    print(f"  [开始] {url}")
    await asyncio.sleep(0.5)
    print(f"  [完成] {url}")
    return url


async def unlimited():
    print("=== 1. 无限制并发（10 个同时） ===")
    urls = [f"url{i}" for i in range(10)]
    start = time.time()
    await asyncio.gather(*[fetch_unlimited(u) for u in urls])
    print(f"  总耗时: {time.time() - start:.2f} 秒")


asyncio.run(unlimited())
print()


# ===== 2. 限制为 3 个并发 =====
sem = asyncio.Semaphore(3)


async def fetch_limited(url):
    async with sem:
        print(f"  [开始] {url}（当前并发受限）")
        await asyncio.sleep(0.5)
        print(f"  [完成] {url}")
        return url


async def limited():
    print("=== 2. 限制最多 3 个并发 ===")
    urls = [f"url{i}" for i in range(10)]
    start = time.time()
    await asyncio.gather(*[fetch_limited(u) for u in urls])
    print(f"  总耗时: {time.time() - start:.2f} 秒")


asyncio.run(limited())
print()


# ===== 3. 封装为类 =====
class RateLimitedClient:
    """带并发限制的客户端"""

    def __init__(self, max_concurrent):
        self.sem = asyncio.Semaphore(max_concurrent)

    async def request(self, url):
        async with self.sem:
            print(f"  [请求] {url}")
            await asyncio.sleep(0.5)
            return f"{url} 响应"


async def client_demo():
    print("=== 3. 封装为客户端类 ===")
    client = RateLimitedClient(2)
    urls = [f"https://api.example.com/{i}" for i in range(6)]
    results = await asyncio.gather(*[client.request(u) for u in urls])
    print(f"  完成 {len(results)} 个请求")


asyncio.run(client_demo())
print()


# ===== 4. 信号量的计数 =====
async def sem_count():
    print("=== 4. 信号量的内部计数 ===")
    sem = asyncio.Semaphore(2)
    print(f"  初始可用: {sem._value}")

    await sem.acquire()
    print(f"  acquire 后: {sem._value}")

    await sem.acquire()
    print(f"  再 acquire 后: {sem._value}")

    sem.release()
    print(f"  release 后: {sem._value}")


asyncio.run(sem_count())
print()


# ===== 5. 实战：限流爬虫 =====
async def crawl(url):
    """模拟爬取"""
    await asyncio.sleep(0.3)
    return f"{url} 内容"


async def limited_crawler(urls, max_concurrent=3):
    print("=== 5. 实战：限流爬虫 ===")
    sem = asyncio.Semaphore(max_concurrent)

    async def fetch_one(url):
        async with sem:
            return await crawl(url)

    results = await asyncio.gather(*[fetch_one(u) for u in urls])
    return results


urls = [f"page{i}" for i in range(8)]
results = asyncio.run(limited_crawler(urls, 3))
for u, r in zip(urls, results):
    print(f"  {u}: {r}")
print()


# ===== 6. BoundedSemaphore =====
async def bounded_sem():
    print("=== 6. BoundedSemaphore 防止释放过多 ===")
    sem = asyncio.BoundedSemaphore(2)
    await sem.acquire()
    await sem.acquire()
    print(f"  当前值: {sem._value}")
    sem.release()
    print(f"  release 后: {sem._value}")
    # 如果继续 release 超过初始值会报错
    try:
        sem.release()
        sem.release()  # 多释放一次
    except ValueError as e:
        print(f"  捕获: {e}")


asyncio.run(bounded_sem())
`,
  },

  // =========================================================
  // 第十七章：asyncio.Event 事件通知
  // =========================================================
  {
    id: "pa2-17",
    group: "并发控制与高级特性",
    icon: "📢",
    title: "asyncio.Event 事件通知",
    content: `## 一、什么是 asyncio.Event？

Event 是一个**信号标志**：
- 一个协程等待事件被设置
- 另一个协程在合适的时机设置事件

\`\`\`python
event = asyncio.Event()

# 等待方
await event.wait()  # 阻塞，直到 event 被 set

# 通知方
event.set()  # 唤醒所有等待者
\`\`\`

## 二、应用场景

- 启动多个 worker，等初始化完成再开始工作
- 一个任务通知其它任务状态变化
- 优雅关闭

## 三、Event vs Condition

| 类型 | 说明 |
|------|------|
| \`Event\` | 一次性通知，所有等待者都被唤醒 |
| \`Condition\` | 更复杂，可以精确控制 |

## 四、本章 demo

演示 asyncio.Event 的用法。
`,
    code: `"""
第十七章 demo：asyncio.Event 事件通知
目标：掌握协程间的事件通知机制。
"""
import asyncio


# ===== 1. 基本 Event =====
async def basic_event():
    print("=== 1. 基本 Event ===")
    event = asyncio.Event()

    async def waiter(name):
        print(f"  [{name}] 等待事件...")
        await event.wait()
        print(f"  [{name}] 被唤醒！")

    async def setter():
        await asyncio.sleep(0.5)
        print("  [setter] 设置事件")
        event.set()

    await asyncio.gather(
        waiter("A"),
        waiter("B"),
        setter(),
    )


asyncio.run(basic_event())
print()


# ===== 2. 初始化完成通知 =====
async def init_notify():
    print("=== 2. 初始化完成后通知所有 worker ===")
    ready = asyncio.Event()

    async def worker(name):
        await ready.wait()
        print(f"  [{name}] 开始工作")
        await asyncio.sleep(0.2)
        print(f"  [{name}] 完成")

    async def initializer():
        print("  [初始化] 资源准备中...")
        await asyncio.sleep(0.5)
        print("  [初始化] 完成，通知 worker")
        ready.set()

    await asyncio.gather(
        initializer(),
        worker("worker-1"),
        worker("worker-2"),
        worker("worker-3"),
    )


asyncio.run(init_notify())
print()


# ===== 3. 优雅关闭 =====
async def graceful_shutdown():
    print("=== 3. 优雅关闭 ===")
    stop_event = asyncio.Event()

    async def service():
        while not stop_event.is_set():
            print("  [服务] 运行中...")
            try:
                await asyncio.wait_for(stop_event.wait(), timeout=0.3)
            except asyncio.TimeoutError:
                pass
        print("  [服务] 收到关闭信号，正在退出")

    async def shutdown():
        await asyncio.sleep(1)
        print("  [控制] 发送关闭信号")
        stop_event.set()

    await asyncio.gather(service(), shutdown())


asyncio.run(graceful_shutdown())
print()


# ===== 4. 等待多个事件 =====
async def multi_events():
    print("=== 4. 等待多个事件完成 ===")
    events = {
        "db": asyncio.Event(),
        "cache": asyncio.Event(),
        "queue": asyncio.Event(),
    }

    async def prepare(name, delay):
        await asyncio.sleep(delay)
        print(f"  [{name}] 就绪")
        events[name].set()

    async def main_service():
        print("  [主服务] 等待所有依赖就绪...")
        await asyncio.gather(*[e.wait() for e in events.values()])
        print("  [主服务] 所有依赖就绪，启动！")

    await asyncio.gather(
        main_service(),
        prepare("db", 0.3),
        prepare("cache", 0.1),
        prepare("queue", 0.5),
    )


asyncio.run(multi_events())
print()


# ===== 5. Event 是一次性的 =====
async def event_once():
    print("=== 5. Event 是一次性的 ===")
    event = asyncio.Event()
    event.set()
    print(f"  is_set: {event.is_set()}")
    event.clear()
    print(f"  clear 后 is_set: {event.is_set()}")


asyncio.run(event_once())
print()


# ===== 6. 实战：并发下载触发器 =====
async def download_trigger():
    print("=== 6. 实战：下载触发器 ===")
    start_event = asyncio.Event()

    async def downloader(name, url):
        await start_event.wait()
        print(f"  [{name}] 开始下载 {url}")
        await asyncio.sleep(0.2)
        print(f"  [{name}] 下载完成")

    downloaders = [
        asyncio.create_task(downloader(f"D{i}", f"file{i}.txt"))
        for i in range(4)
    ]

    print("  准备倒计时...")
    for i in range(3, 0, -1):
        print(f"  {i}...")
        await asyncio.sleep(0.2)
    print("  开始！")
    start_event.set()

    await asyncio.gather(*downloaders)


asyncio.run(download_trigger())
`,
  },

  // =========================================================
  // 第十八章：超时处理 asyncio.wait_for / timeout
  // =========================================================
  {
    id: "pa2-18",
    group: "并发控制与高级特性",
    icon: "⏰",
    title: "超时处理 asyncio.wait_for / timeout",
    content: `## 一、为什么要超时？

网络请求可能卡住，数据库查询可能变慢。如果不设置超时，协程可能永远等待。

## 二、asyncio.wait_for

\`\`\`python
try:
    result = await asyncio.wait_for(slow_task(), timeout=3.0)
except asyncio.TimeoutError:
    print("超时了")
\`\`\`

## 三、asyncio.timeout（Python 3.11+）

\`\`\`python
async with asyncio.timeout(3.0):
    result = await slow_task()
\`\`\`

## 四、超时的注意点

- 超时后任务会被取消
- 被超时的协程内部会收到 CancelledError
- 要做好清理工作

## 五、本章 demo

演示超时处理。
`,
    code: `"""
第十八章 demo：超时处理
目标：学会给异步任务设置超时。
"""
import asyncio
import sys


# ===== 1. asyncio.wait_for =====
async def slow_task(name, delay):
    print(f"  [{name}] 开始")
    await asyncio.sleep(delay)
    print(f"  [{name}] 完成")
    return f"{name} 的结果"


async def wait_for_demo():
    print("=== 1. asyncio.wait_for ===")
    try:
        result = await asyncio.wait_for(slow_task("快任务", 0.2), timeout=1.0)
        print(f"  成功: {result}")
    except asyncio.TimeoutError:
        print("  超时")

    try:
        result = await asyncio.wait_for(slow_task("慢任务", 2.0), timeout=0.5)
        print(f"  成功: {result}")
    except asyncio.TimeoutError:
        print("  慢任务超时")


asyncio.run(wait_for_demo())
print()


# ===== 2. 超时后的清理 =====
async def task_with_cleanup(name, delay):
    print(f"  [{name}] 开始")
    try:
        await asyncio.sleep(delay)
        print(f"  [{name}] 正常完成")
        return f"{name} 结果"
    except asyncio.CancelledError:
        print(f"  [{name}] 收到取消信号，执行清理...")
        await asyncio.sleep(0.1)
        print(f"  [{name}] 清理完成")
        raise


async def cleanup_demo():
    print("=== 2. 超时后的清理 ===")
    try:
        await asyncio.wait_for(task_with_cleanup("清理任务", 2.0), timeout=0.3)
    except asyncio.TimeoutError:
        print("  任务超时，但清理已完成")


asyncio.run(cleanup_demo())
print()


# ===== 3. Python 3.11+ 的 asyncio.timeout =====
async def timeout_context():
    print("=== 3. asyncio.timeout 上下文管理器 ===")
    if sys.version_info >= (3, 11):
        try:
            async with asyncio.timeout(0.5):
                await slow_task("上下文任务", 2.0)
        except asyncio.TimeoutError:
            print("  上下文超时")
    else:
        print("  当前 Python 版本低于 3.11，跳过 asyncio.timeout")


asyncio.run(timeout_context())
print()


# ===== 4. 超时后 shield =====
async def important_task():
    print("  [重要任务] 开始")
    try:
        await asyncio.sleep(1.0)
    except asyncio.CancelledError:
        print("  [重要任务] 被取消")
        raise
    print("  [重要任务] 完成")


async def shield_timeout():
    print("=== 4. wait_for + shield ===")
    try:
        await asyncio.wait_for(
            asyncio.shield(important_task()),
            timeout=0.3
        )
    except asyncio.TimeoutError:
        print("  wait_for 超时，但 shield 保护的任务继续运行")
        # 等待 shield 的任务真正完成
        await asyncio.sleep(1.0)


asyncio.run(shield_timeout())
print()


# ===== 5. 批量任务分别超时 =====
async def batch_with_timeouts():
    print("=== 5. 批量任务分别设置超时 ===")
    tasks = [
        asyncio.wait_for(slow_task(f"任务{i}", 0.1 * i), timeout=0.25)
        for i in range(1, 6)
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    for i, r in enumerate(results):
        if isinstance(r, asyncio.TimeoutError):
            print(f"  任务{i+1} 超时")
        elif isinstance(r, Exception):
            print(f"  任务{i+1} 异常: {r}")
        else:
            print(f"  任务{i+1} 成功: {r}")


asyncio.run(batch_with_timeouts())
print()


# ===== 6. 实战：API 调用超时 =====
async def call_api(endpoint, delay):
    print(f"  [API] 调用 {endpoint}")
    await asyncio.sleep(delay)
    return f"{endpoint} 响应"


async def api_client():
    print("=== 6. 实战：API 超时重试 ===")
    endpoints = ["users", "orders", "products"]
    for ep in endpoints:
        try:
            result = await asyncio.wait_for(call_api(ep, 0.4), timeout=0.3)
            print(f"  {ep}: {result}")
        except asyncio.TimeoutError:
            print(f"  {ep}: 请求超时，使用默认值")


asyncio.run(api_client())
`,
  },

  // =========================================================
  // 第十九章：取消任务与 shield
  // =========================================================
  {
    id: "pa2-19",
    group: "并发控制与高级特性",
    icon: "🛡️",
    title: "取消任务与 shield",
    content: `## 一、为什么取消任务？

- 用户点击取消
- 任务超时
- 不再需要结果

## 二、task.cancel()

\`\`\`python
task.cancel()
try:
    await task
except asyncio.CancelledError:
    print("任务已取消")
\`\`\`

## 三、CancelledError

被取消的协程内部会收到 \`CancelledError\`，可以：
- 忽略它（让异常传播）
- 捕获它做清理

## 四、asyncio.shield

\`shield\` 保护任务不被取消：

\`\`\`python
await asyncio.shield(important_task())
\`\`\`

即使外部 \`wait_for\` 超时，被 shield 的任务也会继续跑。

## 五、取消的注意事项

- 取消不是强制的，协程可以选择不响应
- 取消可能发生在任何 await 处
- 要做好状态清理

## 六、本章 demo

演示取消和 shield。
`,
    code: `"""
第十九章 demo：取消任务与 shield
目标：掌握任务取消和保护机制。
"""
import asyncio


# ===== 1. 基本取消 =====
async def cancellable_task():
    print("  [任务] 开始")
    try:
        await asyncio.sleep(10)
        print("  [任务] 完成")
    except asyncio.CancelledError:
        print("  [任务] 收到取消信号，正在清理")
        await asyncio.sleep(0.1)
        print("  [任务] 清理完成")
        raise


async def cancel_demo():
    print("=== 1. 基本取消 ===")
    task = asyncio.create_task(cancellable_task())
    await asyncio.sleep(0.1)
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print("  任务已取消")


asyncio.run(cancel_demo())
print()


# ===== 2. 取消所有任务 =====
async def cancel_all():
    print("=== 2. 取消多个任务 ===")
    tasks = [
        asyncio.create_task(cancellable_task())
        for _ in range(3)
    ]
    await asyncio.sleep(0.1)

    for task in tasks:
        task.cancel()

    await asyncio.gather(*tasks, return_exceptions=True)
    print("  所有任务已取消")


asyncio.run(cancel_all())
print()


# ===== 3. shield 保护任务 =====
async def important_task():
    print("  [重要任务] 开始")
    try:
        await asyncio.sleep(1.0)
    except asyncio.CancelledError:
        print("  [重要任务] 居然被取消了")
        raise
    print("  [重要任务] 完成")


async def shield_demo():
    print("=== 3. shield 保护 ===")
    shielded = asyncio.shield(important_task())
    try:
        await asyncio.wait_for(shielded, timeout=0.3)
    except asyncio.TimeoutError:
        print("  wait_for 超时")
        # 被 shield 的任务仍在继续
        await asyncio.sleep(0.8)
        print("  shield 的任务应该已经完成")


asyncio.run(shield_demo())
print()


# ===== 4. 取消子任务 =====
async def child():
    print("  [子任务] 开始")
    try:
        await asyncio.sleep(5)
    except asyncio.CancelledError:
        print("  [子任务] 被取消")
        raise


async def parent():
    print("  [父任务] 开始")
    child_task = asyncio.create_task(child())
    try:
        await asyncio.sleep(5)
    except asyncio.CancelledError:
        print("  [父任务] 被取消，同时取消子任务")
        child_task.cancel()
        try:
            await child_task
        except asyncio.CancelledError:
            pass
        raise


async def parent_child_cancel():
    print("=== 4. 父任务取消时取消子任务 ===")
    task = asyncio.create_task(parent())
    await asyncio.sleep(0.2)
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print("  父任务已取消")


asyncio.run(parent_child_cancel())
print()


# ===== 5. 取消后检查状态 =====
async def check_status():
    print("=== 5. 取消后检查状态 ===")
    task = asyncio.create_task(cancellable_task())
    await asyncio.sleep(0.1)
    task.cancel()
    await asyncio.sleep(0.1)
    print(f"  cancelled: {task.cancelled()}")
    print(f"  done: {task.done()}")


asyncio.run(check_status())
print()


# ===== 6. 实战：超时取消慢查询 =====
async def slow_query():
    print("  [查询] 开始执行")
    try:
        await asyncio.sleep(10)
        return "查询结果"
    except asyncio.CancelledError:
        print("  [查询] 被取消，回滚事务")
        await asyncio.sleep(0.1)
        raise


async def query_with_timeout():
    print("=== 6. 实战：超时取消慢查询 ===")
    try:
        result = await asyncio.wait_for(slow_query(), timeout=0.5)
        print(f"  结果: {result}")
    except asyncio.TimeoutError:
        print("  查询超时")


asyncio.run(query_with_timeout())
`,
  },
];
