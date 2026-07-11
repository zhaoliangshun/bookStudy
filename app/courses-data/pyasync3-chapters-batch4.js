// =============================================================
// Python asyncio 教程 V3（pyasync3）—— 第四批章节
// -------------------------------------------------------------
// 并发控制（13-16章）
//   第 13 章：asyncio.Lock 互斥锁
//   第 14 章：asyncio.Semaphore 信号量限流
//   第 15 章：asyncio.Event 事件通知
//   第 16 章：超时和取消任务
// =============================================================

export const chapters = [
  // =========================================================
  // 第十三章：asyncio.Lock 互斥锁
  // =========================================================
  {
    id: "pa3-13",
    group: "并发控制",
    icon: "🔒",
    title: "asyncio.Lock 互斥锁",
    content: `## 先看一个 demo

20 个协程同时给计数器 +1，结果居然不是 20？因为协程在 \`await\` 时会切换，多个协程读到同一个旧值，互相覆盖。

\`\`\`python
# 无锁写法（有 bug）
current = self.value        # 20 个协程都读到 0
await asyncio.sleep(0.001)  # 让出 CPU，其他协程上场
self.value = current + 1    # 都写 1，结果远小于 20
\`\`\`

加上 \`asyncio.Lock\`，一次只让一个协程进入临界区，结果就正确了。就像公共厕所的门锁，进去的人锁门，外面的人排队等。

## 从 demo 学到的知识点

- **单线程也有竞态条件**：协程在 \`await\` 处切换，共享变量会被打断
- **asyncio.Lock 保护临界区**：\`async with lock:\` 一次只放一个
- **锁会串行化**：降低并发度，只保护必要的部分
- **不要嵌套同一把锁**：asyncio.Lock 不可重入，会死锁

## 锁的对比

| 锁类型 | 适用场景 |
|--------|----------|
| \`asyncio.Lock\` | 协程之间 |
| \`threading.Lock\` | 线程之间 |
| \`multiprocessing.Lock\` | 进程之间 |
`,
    code: `"""
第十三章 demo：asyncio.Lock 互斥锁
目标：通过 demo 理解为什么协程也需要锁，以及怎么用锁。
"""
import asyncio


# ===== 1. 无锁时的竞态条件（20 并发）=====
# 生活类比：20 个人同时往一个箱子里放苹果，
# 每个人都是"看一眼数量 → 放一个 → 写回数量"，
# 如果中间被打断，多个人看到同样的数量，最后只多了 1 个。
class UnsafeCounter:
    """不安全的计数器：不加锁，并发下会丢更新"""

    def __init__(self):
        self.value = 0

    async def increment(self, name):
        # 三步操作中间有 await，会被其他协程打断
        current = self.value            # 第 1 步：读当前值
        await asyncio.sleep(0.001)      # 第 2 步：模拟 I/O（让出 CPU）
        self.value = current + 1        # 第 3 步：写回新值
        # 20 个协程可能都读到 0，最后都写 1


async def unsafe_demo():
    print("=== 1. 无锁：20 个协程并发 +1 ===")
    counter = UnsafeCounter()
    # 20 个协程同时跑 increment
    await asyncio.gather(*[counter.increment(f"T{i}") for i in range(20)])
    print(f"  预期: 20, 实际: {counter.value}  ← 丢更新了！")


asyncio.run(unsafe_demo())
print()


# ===== 2. 有锁的计数器（结果正确）=====
# 加锁后，一次只允许一个协程执行"读-改-写"三步，
# 就像厕所的门锁，进去锁门，出来下一个人。
class SafeCounter:
    """安全的计数器：用 asyncio.Lock 保护临界区"""

    def __init__(self):
        self.value = 0
        self.lock = asyncio.Lock()  # 创建一把锁

    async def increment(self, name):
        async with self.lock:           # 获取锁（拿不到就等）
            current = self.value        # 临界区：同一时刻只有一个协程
            await asyncio.sleep(0.001)  # 即使让出 CPU，别人也进不来
            self.value = current + 1    # 安全地写回


async def safe_demo():
    print("=== 2. 有锁：20 个协程并发 +1 ===")
    counter = SafeCounter()
    await asyncio.gather(*[counter.increment(f"T{i}") for i in range(20)])
    print(f"  预期: 20, 实际: {counter.value}  ← 正确！")


asyncio.run(safe_demo())
print()


# ===== 3. 锁的等待队列（先进先出）=====
# 三个协程抢一把锁，观察它们的排队顺序。
async def lock_queue_demo():
    print("=== 3. 锁的等待队列 ===")
    lock = asyncio.Lock()

    async def worker(name):
        print(f"  [{name}] 尝试获取锁...")
        async with lock:
            print(f"  [{name}] ✓ 获得锁，开始工作")
            await asyncio.sleep(0.2)    # 模拟工作
            print(f"  [{name}] ✗ 释放锁")

    # A/B/C 依次请求锁，B 和 C 必须等 A 释放
    await asyncio.gather(worker("A"), worker("B"), worker("C"))


asyncio.run(lock_queue_demo())
print()


# ===== 4. 不要嵌套同一把锁（会死锁）=====
# asyncio.Lock 不是"可重入锁"，同一个协程再次获取同一把锁会卡死。
async def nested_lock_demo():
    print("=== 4. 不要嵌套同一把锁 ===")
    lock = asyncio.Lock()

    async def bad_func():
        async with lock:
            print("  外层获得锁")
            # 如果这里再 async with lock:  → 死锁！
            # 因为外层还没释放，内层又来抢，永远等不到
            print("  （这里不能再获取同一把锁）")

    await bad_func()
    print("  asyncio.Lock 不可重入，嵌套会死锁")


asyncio.run(nested_lock_demo())
print()


# ===== 5. 实战：异步日志器 =====
# 多个协程同时写日志，用锁保证日志不交错、不丢失。
class AsyncLogger:
    """线程/协程安全的异步日志器"""

    def __init__(self):
        self.logs = []
        self.lock = asyncio.Lock()

    async def write(self, message):
        async with self.lock:           # 保护 self.logs
            self.logs.append(message)
            await asyncio.sleep(0.01)   # 模拟写文件 I/O


async def logger_demo():
    print("=== 5. 实战：异步日志器 ===")
    logger = AsyncLogger()
    # 10 个协程同时写日志
    await asyncio.gather(*[logger.write(f"日志 {i}") for i in range(10)])
    print(f"  共写入 {len(logger.logs)} 条日志")
    print(f"  前 3 条: {logger.logs[:3]}")


asyncio.run(logger_demo())
print()


# ===== 6. 手动 acquire / release（try-finally）=====
# async with 是语法糖，底层就是 acquire + try-finally + release。
async def manual_lock_demo():
    print("=== 6. 手动 acquire / release ===")
    lock = asyncio.Lock()
    await lock.acquire()        # 手动获取锁
    try:
        print("  获得锁，执行任务...")
        await asyncio.sleep(0.1)
        print("  任务完成")
    finally:
        lock.release()          # 无论是否异常，都要释放
        print("  已释放锁（finally 中执行）")


asyncio.run(manual_lock_demo())
`,
  },

  // =========================================================
  // 第十四章：asyncio.Semaphore 信号量限流
  // =========================================================
  {
    id: "pa3-14",
    group: "并发控制",
    icon: "🚦",
    title: "asyncio.Semaphore 信号量限流",
    content: `## 先看一个 demo

10 个请求同时发出 → 服务器扛不住。用 \`Semaphore(3)\` 限制最多 3 个同时执行，节奏就稳了。

\`\`\`python
sem = asyncio.Semaphore(3)   # 最多 3 个协程同时进入
async with sem:
    await fetch(url)          # 同时最多 3 个在这里
\`\`\`

生活类比：停车场入口的"剩余车位"牌。进去一辆减一，出来一辆加一，满了就等。

## 从 demo 学到的知识点

- **信号量 = 计数器**：允许 N 个协程同时进入
- **应用场景**：限流、限制连接数、限制并发数
- **vs Lock**：Lock 就是 N=1 的 Semaphore
- **BoundedSemaphore**：防止 release 次数超过 acquire

## Lock vs Semaphore

| 类型 | 同时进入 |
|------|----------|
| \`Lock\` | 1 个 |
| \`Semaphore\` | N 个 |
`,
    code: `"""
第十四章 demo：asyncio.Semaphore 信号量限流
目标：通过 demo 学会控制最大并发数，保护下游服务。
"""
import asyncio
import time


# ===== 1. 无限制并发（10 个同时上场）=====
# 不加限制，10 个请求瞬间全部发出。
async def fetch_unlimited(url):
    print(f"  [开始] {url}")
    await asyncio.sleep(0.5)      # 模拟网络请求
    print(f"  [完成] {url}")
    return url


async def unlimited_demo():
    print("=== 1. 无限制并发（10 个同时） ===")
    urls = [f"url{i}" for i in range(10)]
    start = time.time()
    await asyncio.gather(*[fetch_unlimited(u) for u in urls])
    elapsed = time.time() - start
    print(f"  总耗时: {elapsed:.2f}s  ← 10 个几乎同时完成")


asyncio.run(unlimited_demo())
print()


# ===== 2. 限制为 3 个并发 =====
# 用 Semaphore(3)，同一时刻最多 3 个协程进入。
# 生活类比：停车场只剩 3 个车位，一次只能进 3 辆。
async def fetch_limited(url, sem):
    async with sem:               # 获取信号量（满了就等）
        print(f"  [开始] {url}")
        await asyncio.sleep(0.5)
        print(f"  [完成] {url}")
        return url


async def limited_demo():
    print("=== 2. 限制最多 3 个并发 ===")
    sem = asyncio.Semaphore(3)    # 只允许 3 个同时执行
    urls = [f"url{i}" for i in range(10)]
    start = time.time()
    await asyncio.gather(*[fetch_limited(u, sem) for u in urls])
    elapsed = time.time() - start
    print(f"  总耗时: {elapsed:.2f}s  ← 分批执行，耗时更长")


asyncio.run(limited_demo())
print()


# ===== 3. 封装为客户端类 =====
# 把信号量封装进客户端，对外暴露 request 方法，
# 调用者不用关心限流逻辑。
class RateLimitedClient:
    """自带限流的异步客户端"""

    def __init__(self, max_concurrent):
        self.sem = asyncio.Semaphore(max_concurrent)

    async def request(self, url):
        async with self.sem:      # 限流在内部完成
            print(f"  [请求] {url}")
            await asyncio.sleep(0.3)
            return f"{url} 的响应"


async def client_demo():
    print("=== 3. 封装为客户端类 ===")
    client = RateLimitedClient(2)  # 最多 2 个并发
    urls = [f"https://api.example.com/{i}" for i in range(6)]
    results = await asyncio.gather(*[client.request(u) for u in urls])
    print(f"  完成 {len(results)} 个请求")


asyncio.run(client_demo())
print()


# ===== 4. 信号量的内部计数 =====
# 每次 acquire 计数 -1，每次 release 计数 +1。
# 计数到 0 时，再 acquire 就要等。
async def sem_count_demo():
    print("=== 4. 信号量的内部计数 ===")
    sem = asyncio.Semaphore(2)    # 初始 2 个名额
    print(f"  初始可用: {sem._value}")

    await sem.acquire()
    print(f"  acquire 后: {sem._value}  ← -1")

    await sem.acquire()
    print(f"  再 acquire: {sem._value}  ← -1，现在满了")

    sem.release()
    print(f"  release 后: {sem._value}  ← +1")

    sem.release()
    print(f"  再 release: {sem._value}  ← 回到初始")


asyncio.run(sem_count_demo())
print()


# ===== 5. 实战：限流爬虫 =====
# 真实场景：爬取多个页面，但不能把对方服务器搞垮。
async def crawl_page(url):
    """模拟爬取一个页面"""
    await asyncio.sleep(0.3)
    return f"<html>{url}</html>"


async def limited_crawler(urls, max_concurrent=3):
    print("=== 5. 实战：限流爬虫 ===")
    sem = asyncio.Semaphore(max_concurrent)

    async def fetch_one(url):
        async with sem:           # 控制并发
            return await crawl_page(url)

    results = await asyncio.gather(*[fetch_one(u) for u in urls])
    return results


urls = [f"page{i}" for i in range(8)]
results = asyncio.run(limited_crawler(urls, max_concurrent=3))
for u, r in zip(urls, results):
    print(f"  {u}: {r}")
print()


# ===== 6. BoundedSemaphore（防止多释放）=====
# 普通 Semaphore 可以 release 超过初始值，不会报错。
# BoundedSemaphore 会在多 release 时抛 ValueError。
async def bounded_demo():
    print("=== 6. BoundedSemaphore 防止多释放 ===")
    sem = asyncio.BoundedSemaphore(2)
    await sem.acquire()
    await sem.acquire()
    print(f"  两次 acquire 后: {sem._value}")

    sem.release()
    print(f"  release 后: {sem._value}")

    # 多释放一次会报错
    try:
        sem.release()             # 已经超过初始值 2
        sem.release()             # 再多一次
    except ValueError as e:
        print(f"  捕获异常: {e}")
    print("  BoundedSemaphore 帮你发现 release bug")


asyncio.run(bounded_demo())
`,
  },

  // =========================================================
  // 第十五章：asyncio.Event 事件通知
  // =========================================================
  {
    id: "pa3-15",
    group: "并发控制",
    icon: "📢",
    title: "asyncio.Event 事件通知",
    content: `## 先看一个 demo

2 个服务员等开门，老板到点了喊一声"开门"，所有人同时开始工作。这就是 Event。

\`\`\`python
event = asyncio.Event()
await event.wait()   # 服务员等开门（阻塞）
event.set()          # 老板喊开门，所有等待者同时醒来
\`\`\`

生活类比：餐厅的"营业"灯牌。灯亮 = 开门营业，所有等着的顾客一起进去。

## 从 demo 学到的知识点

- **Event = 信号标志**：\`set\` 表示"亮了"，\`clear\` 表示"灭了"
- **一次性通知所有等待者**：\`set\` 后所有 \`wait\` 都返回
- **应用场景**：等初始化完成、优雅关闭、状态变化通知
- **set / clear / is_set / wait**：四个核心方法

## Event vs Condition

| 类型 | 特点 |
|------|------|
| \`Event\` | 简单，一次性通知所有等待者 |
| \`Condition\` | 复杂，可精确控制唤醒谁 |
`,
    code: `"""
第十五章 demo：asyncio.Event 事件通知
目标：通过 demo 掌握协程间的"通知"机制。
"""
import asyncio


# ===== 1. 基本 Event（2 个等待者 + 1 个通知者）=====
# 两个服务员等开门，老板到点 set()，两人同时醒来。
async def basic_event_demo():
    print("=== 1. 基本 Event ===")
    event = asyncio.Event()

    async def waiter(name):
        print(f"  [{name}] 等待开门...")
        await event.wait()        # 阻塞，直到 event.set()
        print(f"  [{name}] 门开了，开始工作！")

    async def setter():
        await asyncio.sleep(0.5)  # 老板 0.5 秒后到
        print("  [老板] 开门！")
        event.set()               # 唤醒所有等待者

    await asyncio.gather(waiter("A"), waiter("B"), setter())


asyncio.run(basic_event_demo())
print()


# ===== 2. 初始化完成，通知所有 worker =====
# 主进程先初始化资源（连数据库、加载配置），
# 完成后 set()，所有 worker 同时开始。
async def init_notify_demo():
    print("=== 2. 初始化完成后通知所有 worker ===")
    ready = asyncio.Event()

    async def worker(name):
        print(f"  [{name}] 等待初始化...")
        await ready.wait()        # 等初始化完成
        print(f"  [{name}] 开始工作")
        await asyncio.sleep(0.2)
        print(f"  [{name}] 完成")

    async def initializer():
        print("  [初始化] 准备资源中...")
        await asyncio.sleep(0.5)  # 模拟初始化
        print("  [初始化] 完成！通知所有 worker")
        ready.set()               # 一次性唤醒 3 个 worker

    await asyncio.gather(
        initializer(),
        worker("worker-1"),
        worker("worker-2"),
        worker("worker-3"),
    )


asyncio.run(init_notify_demo())
print()


# ===== 3. 优雅关闭（stop_event）=====
# 服务循环检查 stop_event，收到信号后退出。
async def graceful_shutdown_demo():
    print("=== 3. 优雅关闭 ===")
    stop_event = asyncio.Event()

    async def service():
        while not stop_event.is_set():    # 没收到停止信号就继续
            print("  [服务] 运行中...")
            try:
                # 要么等到 stop_event，要么 0.3 秒后超时继续循环
                await asyncio.wait_for(stop_event.wait(), timeout=0.3)
            except asyncio.TimeoutError:
                pass
        print("  [服务] 收到关闭信号，正在退出...")

    async def controller():
        await asyncio.sleep(1.0)          # 运行 1 秒后关闭
        print("  [控制] 发送关闭信号")
        stop_event.set()

    await asyncio.gather(service(), controller())


asyncio.run(graceful_shutdown_demo())
print()


# ===== 4. 等待多个事件（db / cache / queue）=====
# 主服务要等三个依赖都就绪才能启动。
async def multi_events_demo():
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
        # gather 等所有 event.wait() 返回
        await asyncio.gather(*[e.wait() for e in events.values()])
        print("  [主服务] 所有依赖就绪，启动！")

    await asyncio.gather(
        main_service(),
        prepare("db", 0.3),
        prepare("cache", 0.1),
        prepare("queue", 0.5),
    )


asyncio.run(multi_events_demo())
print()


# ===== 5. Event 的 set / clear / is_set =====
# Event 可以反复 set 和 clear，像开关一样。
async def set_clear_demo():
    print("=== 5. Event 的 set / clear ===")
    event = asyncio.Event()

    print(f"  初始 is_set: {event.is_set()}")
    event.set()
    print(f"  set 后 is_set: {event.is_set()}    ← 亮了")
    event.clear()
    print(f"  clear 后 is_set: {event.is_set()}  ← 灭了")


asyncio.run(set_clear_demo())
print()


# ===== 6. 实战：下载触发器（倒计时后 set）=====
# 4 个下载任务先创建好，倒计时 3 秒后统一触发。
async def download_trigger_demo():
    print("=== 6. 实战：下载触发器 ===")
    start_event = asyncio.Event()

    async def downloader(name, url):
        await start_event.wait()         # 等触发信号
        print(f"  [{name}] 开始下载 {url}")
        await asyncio.sleep(0.2)
        print(f"  [{name}] 下载完成")

    # 先创建 4 个下载任务，它们都在等 start_event
    downloaders = [
        asyncio.create_task(downloader(f"D{i}", f"file{i}.zip"))
        for i in range(4)
    ]

    # 倒计时
    print("  准备倒计时...")
    for i in range(3, 0, -1):
        print(f"  {i}...")
        await asyncio.sleep(0.2)
    print("  开始！")
    start_event.set()                    # 触发！4 个任务同时开始

    await asyncio.gather(*downloaders)


asyncio.run(download_trigger_demo())
`,
  },

  // =========================================================
  // 第十六章：超时和取消任务
  // =========================================================
  {
    id: "pa3-16",
    group: "并发控制",
    icon: "⏰",
    title: "超时和取消任务",
    content: `## 先看一个 demo

一个任务 2 秒才能完成，但你只等 0.5 秒。\`wait_for\` 超时后会取消任务，抛出 \`TimeoutError\`。

\`\`\`python
try:
    result = await asyncio.wait_for(slow_task(), timeout=0.5)
except asyncio.TimeoutError:
    print("超时了")  # 任务被自动取消
\`\`\`

生活类比：等外卖 30 分钟，超时就取消订单，不能一直傻等。

## 从 demo 学到的知识点

- **为什么要超时**：网络卡住、数据库慢，不能永远等
- **wait_for**：超时后自动取消任务，抛 \`TimeoutError\`
- **CancelledError**：被取消的协程内部收到这个异常
- **asyncio.shield**：保护重要任务不被取消
- **取消后做清理**：catch \`CancelledError\` → 清理 → re-raise

## 超时工具对比

| 工具 | 版本 | 用法 |
|------|------|------|
| \`wait_for\` | 全版本 | \`await wait_for(coro, timeout)\` |
| \`asyncio.timeout\` | 3.11+ | \`async with timeout(t):\` |
`,
    code: `"""
第十六章 demo：超时和取消任务
目标：通过 demo 学会给任务设置超时、处理取消、保护重要任务。
"""
import asyncio
import sys


# ===== 1. wait_for 的成功 / 超时 =====
# 快任务能在超时前完成 → 正常返回
# 慢任务来不及完成 → 抛 TimeoutError，任务被取消
async def slow_task(name, delay):
    print(f"  [{name}] 开始（需要 {delay}s）")
    await asyncio.sleep(delay)
    print(f"  [{name}] 完成")
    return f"{name} 的结果"


async def wait_for_demo():
    print("=== 1. wait_for 成功 / 超时 ===")
    # 快任务：0.2s 完成，超时 1.0s，来得及
    try:
        result = await asyncio.wait_for(slow_task("快任务", 0.2), timeout=1.0)
        print(f"  ✓ 成功: {result}")
    except asyncio.TimeoutError:
        print("  ✗ 超时")

    # 慢任务：2.0s 才完成，超时 0.5s，来不及
    try:
        result = await asyncio.wait_for(slow_task("慢任务", 2.0), timeout=0.5)
        print(f"  ✓ 成功: {result}")
    except asyncio.TimeoutError:
        print("  ✗ 慢任务超时，已被取消")


asyncio.run(wait_for_demo())
print()


# ===== 2. 超时后做清理（catch CancelledError）=====
# wait_for 超时会取消任务，任务内部会收到 CancelledError。
# 在 except 中做清理（关闭连接、回滚事务），然后 re-raise。
async def task_with_cleanup(name, delay):
    print(f"  [{name}] 开始")
    try:
        await asyncio.sleep(delay)
        print(f"  [{name}] 正常完成")
        return f"{name} 结果"
    except asyncio.CancelledError:
        # 被取消时做清理工作
        print(f"  [{name}] 收到取消信号，正在清理...")
        await asyncio.sleep(0.1)     # 模拟清理（关连接、回滚）
        print(f"  [{name}] 清理完成")
        raise                        # 重新抛出，让调用者知道被取消了


async def cleanup_demo():
    print("=== 2. 超时后的清理 ===")
    try:
        await asyncio.wait_for(task_with_cleanup("清理任务", 2.0), timeout=0.3)
    except asyncio.TimeoutError:
        print("  任务超时，但清理已完成")


asyncio.run(cleanup_demo())
print()


# ===== 3. asyncio.timeout 上下文管理器（3.11+）=====
# Python 3.11 新增的上下文管理器，比 wait_for 更灵活。
# 可以用 sys.version_info 判断版本。
async def timeout_context_demo():
    print("=== 3. asyncio.timeout 上下文（3.11+） ===")
    if sys.version_info >= (3, 11):
        try:
            async with asyncio.timeout(0.5):    # 0.5 秒超时
                await slow_task("上下文任务", 2.0)
        except asyncio.TimeoutError:
            print("  ✗ 上下文超时")
    else:
        print("  当前 Python < 3.11，跳过 asyncio.timeout 演示")
        print("  （可以用 wait_for 代替）")


asyncio.run(timeout_context_demo())
print()


# ===== 4. shield 保护重要任务 =====
# wait_for 超时会取消任务。但有些任务很重要（如写数据库），
# 不希望被取消。asyncio.shield 可以保护它。
# 注意：shield 保护内部任务不被取消，但 wait_for 仍然会超时。
# 超时后内部任务继续跑，需要 await 等它完成。
async def important_task():
    """重要任务：必须完成，不能被中途取消"""
    print("  [重要任务] 开始")
    try:
        await asyncio.sleep(1.0)    # 需要 1 秒
    except asyncio.CancelledError:
        print("  [重要任务] 被取消了！")  # shield 保护下不会走到这里
        raise
    print("  [重要任务] ✓ 完成")
    return "重要结果"


async def shield_demo():
    print("=== 4. shield 保护重要任务 ===")
    # 先创建任务，再用 shield 保护
    task = asyncio.ensure_future(important_task())
    try:
        # wait_for 0.3 秒超时，但 shield 保护内部任务
        await asyncio.wait_for(asyncio.shield(task), timeout=0.3)
    except asyncio.TimeoutError:
        print("  wait_for 超时了")
        print("  但 shield 保护的任务继续运行...")
        # 等待被保护的任务真正完成
        await asyncio.sleep(1.5)    # 给它足够时间跑完
        print(f"  任务是否完成: {task.done()}")  # True


asyncio.run(shield_demo())
print()


# ===== 5. 批量任务分别超时 =====
# 用 gather + return_exceptions=True，
# 每个任务独立超时，一个超时不影响其他。
async def batch_timeout_demo():
    print("=== 5. 批量任务分别超时 ===")
    # 5 个任务，耗时 0.1~0.5 秒，超时都设 0.25 秒
    tasks = [
        asyncio.wait_for(slow_task(f"任务{i}", 0.1 * i), timeout=0.25)
        for i in range(1, 6)
    ]
    # return_exceptions=True：异常作为结果返回，不中断 gather
    results = await asyncio.gather(*tasks, return_exceptions=True)
    for i, r in enumerate(results):
        if isinstance(r, asyncio.TimeoutError):
            print(f"  任务{i+1}: ✗ 超时")
        elif isinstance(r, Exception):
            print(f"  任务{i+1}: ✗ 异常: {r}")
        else:
            print(f"  任务{i+1}: ✓ 成功: {r}")


asyncio.run(batch_timeout_demo())
print()


# ===== 6. 实战：API 调用超时 =====
# 真实场景：调用第三方 API，超时就用默认值，不阻塞主流程。
async def call_api(endpoint, delay):
    print(f"  [API] 调用 {endpoint}（需要 {delay}s）")
    await asyncio.sleep(delay)
    return f"{endpoint} 响应"


async def api_client_demo():
    print("=== 6. 实战：API 调用超时 ===")
    endpoints = [
        ("users", 0.2),     # 快，能完成
        ("orders", 0.5),    # 慢，会超时
        ("products", 0.2),  # 快，能完成
    ]
    for ep, delay in endpoints:
        try:
            result = await asyncio.wait_for(call_api(ep, delay), timeout=0.3)
            print(f"  {ep}: ✓ {result}")
        except asyncio.TimeoutError:
            print(f"  {ep}: ✗ 超时，使用默认值")


asyncio.run(api_client_demo())
`,
  },
];
