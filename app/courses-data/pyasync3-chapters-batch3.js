// =============================================================
// Python asyncio 教程 V3（pyasync3）—— 第三批章节，异步工具（9-12章）
// -------------------------------------------------------------
// 风格：demo 驱动，先看 demo 再讲知识点，简单简单再简单
//   第 9 章：asyncio.sleep 模拟等待
//   第 10 章：async with 异步上下文管理器
//   第 11 章：async for 异步迭代
//   第 12 章：asyncio.Queue 异步队列
// =============================================================

export const chapters = [
  // =========================================================
  // 第九章：asyncio.sleep 模拟等待
  // =========================================================
  {
    id: "pa3-09",
    group: "异步工具",
    icon: "💤",
    title: "asyncio.sleep 模拟等待",
    content: `## 先看一个 demo

3 个 \`asyncio.sleep(1)\` 同时跑，总共只要 **1 秒**：

\`\`\`python
await asyncio.gather(
    asyncio.sleep(1),
    asyncio.sleep(1),
    asyncio.sleep(1),
)
# 总耗时 ≈ 1 秒，不是 3 秒
\`\`\`

因为它们是**并发等待**，不是排队等待。就像 3 个人同时等 1 分钟外卖，总共还是 1 分钟。

## 知识点（从 demo 提炼）

1. \`asyncio.sleep\` 是**非阻塞等待**：它让出 CPU，事件循环可以跑别的协程。
2. \`time.sleep\` 是**阻塞等待**：卡住整个线程，3 个并发也会变 3 秒。
3. 为什么用 sleep 做 demo？因为真实 I/O 要装第三方库（aiohttp 等），\`sleep\` 是 stdlib 里最方便的"I/O 模拟器"。
4. 多个 \`sleep\` 用 \`gather\` 并发，总时间 ≈ 最长那个。
5. \`sleep\` 期间，事件循环可以跑后台任务。

## 对比表

| 写法 | 阻塞 | 让出 CPU | 3 个并发总耗时 |
|------|------|----------|----------------|
| \`time.sleep(1)\` | 阻塞线程 | 否 | 3 秒 |
| \`await asyncio.sleep(1)\` | 不阻塞 | 是 | 1 秒 |

## 本章 demo

5 个小 demo，体会"非阻塞等待"的威力。
`,
    code: `"""
第九章 demo：asyncio.sleep 模拟等待
目标：理解 asyncio.sleep 不阻塞事件循环，time.sleep 会阻塞。
"""
import asyncio
import time


# ===== 1. asyncio.sleep 不阻塞（两个 ticker 并发） =====
async def ticker(name, interval, count):
    """每隔 interval 秒打印一次，共打印 count 次"""
    for i in range(count):
        print(f"  [{name}] tick {i + 1}")
        await asyncio.sleep(interval)


async def main1():
    print("=== 1. asyncio.sleep 不阻塞（两个 ticker 并发） ===")
    start = time.time()
    # 两个 ticker 并发：A 每 0.2 秒 3 次，B 每 0.3 秒 3 次
    await asyncio.gather(
        ticker("A", 0.2, 3),
        ticker("B", 0.3, 3),
    )
    # 总耗时 ≈ 0.9 秒（取较慢的 B），不是 1.5 秒
    print(f"  总耗时: {time.time() - start:.2f} 秒")


asyncio.run(main1())
print()


# ===== 2. 模拟多个网页请求 =====
async def fetch(url, latency):
    """模拟一次网页请求：发请求 -> 等延迟 -> 返回内容"""
    print(f"  [请求] {url}（延迟 {latency}s）")
    await asyncio.sleep(latency)  # 非阻塞等待
    print(f"  [响应] {url} 完成")
    return f"{url} 的内容"


async def main2():
    print("=== 2. 模拟多个网页请求（并发） ===")
    start = time.time()
    results = await asyncio.gather(
        fetch("https://site-a.com", 0.3),
        fetch("https://site-b.com", 0.5),
        fetch("https://site-c.com", 0.2),
    )
    # 三个请求并发，总耗时 ≈ 0.5 秒（最慢的那个），不是 1 秒
    print(f"  结果: {results}")
    print(f"  总耗时: {time.time() - start:.2f} 秒")


asyncio.run(main2())
print()


# ===== 3. 在 async 里调 time.sleep 会阻塞 =====
async def blocking_demo():
    print("=== 3. 在 async 里调 time.sleep 会阻塞 ===")
    print("  如果用 time.sleep，三个并发也会变 3 秒：")
    start = time.time()

    async def bad_sleep(n):
        # ⚠️ time.sleep 会卡住整个事件循环，别在 async 里这么干
        time.sleep(n)

    await asyncio.gather(
        bad_sleep(1),
        bad_sleep(1),
        bad_sleep(1),
    )
    # 三个 time.sleep(1) 串行执行，总耗时 = 3 秒
    print(f"  总耗时: {time.time() - start:.2f} 秒（阻塞，变 3 秒！）")


asyncio.run(blocking_demo())
print()


# ===== 4. 倒计时 =====
async def countdown(seconds):
    """从 seconds 倒数到 0"""
    for i in range(seconds, 0, -1):
        print(f"  还剩 {i} 秒")
        await asyncio.sleep(0.2)  # 每次等 0.2 秒（演示用，加速）
    print("  时间到！")


async def main4():
    print("=== 4. 倒计时 ===")
    await countdown(3)


asyncio.run(main4())
print()


# ===== 5. sleep 期间后台任务继续 =====
async def background_task():
    """后台任务：每 0.15 秒打印一次进度"""
    for i in range(1, 6):
        print(f"    [后台] 进度 {i}/5")
        await asyncio.sleep(0.15)


async def main5():
    print("=== 5. sleep 期间后台任务继续 ===")
    # 把后台任务丢给事件循环
    task = asyncio.create_task(background_task())
    print("  [主任务] 开始等待 0.6 秒...")
    await asyncio.sleep(0.6)  # 这期间后台任务在跑
    print("  [主任务] 等待结束")
    await task  # 确保后台任务跑完
    print("  [主任务] 后台任务也完成了")


asyncio.run(main5())
`,
  },

  // =========================================================
  // 第十章：async with 异步上下文管理器
  // =========================================================
  {
    id: "pa3-10",
    group: "异步工具",
    icon: "🚪",
    title: "async with 异步上下文管理器",
    content: `## 先看一个 demo

自定义一个 \`AsyncConnection\`，进入时连接、退出时关闭，都用 \`await\`：

\`\`\`python
async with AsyncConnection("db.example.com") as conn:
    await conn.query("SELECT 1")
# 出了 with 块，连接自动关闭
\`\`\`

就像进出门刷卡：进门自动开门，出门自动关门，不用你操心。区别是这扇门是"异步的"，开关门需要等待。

## 知识点（从 demo 提炼）

1. \`async with\` 跟 \`with\` 一样，但**进入和退出都是异步的**（要 \`await\`）。
2. 类需要实现 \`__aenter__\` 和 \`__aexit__\` 两个**异步**方法。
3. 应用场景：异步数据库连接、异步文件、异步锁、异步 HTTP 会话。
4. 即使块内抛异常，\`__aexit__\` 也会被调用，资源照样释放。
5. \`__aexit__\` 返回 \`False\`（或不返回），让异常正常传播。

## 对比同步 with

| 同步 with | async with |
|-----------|------------|
| \`__enter__\` / \`__exit__\` | \`__aenter__\` / \`__aexit__\` |
| \`with x as y:\` | \`async with x as y:\` |
| 资源进出是同步的 | 资源进出要 await |

## 本章 demo

5 个小 demo：自定义连接、异常自动关闭、异步锁、模拟文件、装饰器写法。
`,
    code: `"""
第十章 demo：async with 异步上下文管理器
目标：掌握 async with 的实现与用法。
"""
import asyncio
from contextlib import asynccontextmanager


# ===== 1. 自定义 AsyncConnection =====
class AsyncConnection:
    """模拟一个异步数据库连接"""

    def __init__(self, host):
        self.host = host
        self.connected = False

    async def __aenter__(self):
        # 进入 with 块时：建立连接（异步）
        print(f"  [连接] 正在连接 {self.host}...")
        await asyncio.sleep(0.2)  # 模拟握手延迟
        self.connected = True
        print(f"  [连接] {self.host} 已连接")
        return self  # 返回 self，作为 as 后面的变量

    async def __aexit__(self, exc_type, exc, tb):
        # 退出 with 块时：关闭连接（无论是否异常都会执行）
        print(f"  [断开] 正在关闭 {self.host}...")
        await asyncio.sleep(0.1)
        self.connected = False
        print(f"  [断开] {self.host} 已关闭")
        return False  # 返回 False，让异常继续向外抛

    async def query(self, sql):
        if not self.connected:
            raise RuntimeError("未连接")
        await asyncio.sleep(0.15)  # 模拟查询耗时
        return f"[{self.host}] 执行: {sql}"


async def main1():
    print("=== 1. 自定义 AsyncConnection ===")
    async with AsyncConnection("db.example.com") as conn:
        # 进入了 with 块，连接已建立
        print(f"  连接状态: {conn.connected}")
        result = await conn.query("SELECT * FROM users")
        print(f"  查询结果: {result}")
    # 出了 with 块，连接已自动关闭
    print("  with 块结束，连接已自动关闭")


asyncio.run(main1())
print()


# ===== 2. 异常时也会自动关闭 =====
async def main2():
    print("=== 2. 异常时也会自动关闭 ===")
    try:
        async with AsyncConnection("db.example.com") as conn:
            await conn.query("SELECT 1")
            # 故意抛个异常
            raise ValueError("模拟业务出错")
    except ValueError as e:
        print(f"  捕获到异常: {e}")
    print("  结论：即使异常，__aexit__ 仍然执行，连接已关闭")


asyncio.run(main2())
print()


# ===== 3. async with + asyncio.Lock =====
class SharedCounter:
    """用异步锁保护共享计数器"""

    def __init__(self):
        self.value = 0
        self.lock = asyncio.Lock()

    async def increment(self, name):
        # async with 锁：同一时刻只有一个协程能进入
        async with self.lock:
            current = self.value
            await asyncio.sleep(0.05)  # 模拟耗时操作
            self.value = current + 1
            print(f"  [{name}] value = {self.value}")


async def main3():
    print("=== 3. async with + asyncio.Lock ===")
    counter = SharedCounter()
    await asyncio.gather(
        counter.increment("A"),
        counter.increment("B"),
        counter.increment("C"),
    )
    print(f"  最终值: {counter.value}（无竞争，等于 3）")


asyncio.run(main3())
print()


# ===== 4. 模拟异步文件 =====
class AsyncFile:
    """模拟一个异步文件对象"""

    def __init__(self, filename, mode):
        self.filename = filename
        self.mode = mode
        self.lines = []

    async def __aenter__(self):
        print(f"  [文件] 打开 {self.filename}（模式 {self.mode}）")
        await asyncio.sleep(0.1)
        return self

    async def __aexit__(self, exc_type, exc, tb):
        print(f"  [文件] 关闭 {self.filename}，共写入 {len(self.lines)} 行")
        await asyncio.sleep(0.05)
        return False

    async def write(self, line):
        await asyncio.sleep(0.05)
        self.lines.append(line)
        print(f"  [文件] 写入: {line}")


async def main4():
    print("=== 4. 模拟异步文件 ===")
    async with AsyncFile("/tmp/log.txt", "w") as f:
        await f.write("hello")
        await f.write("asyncio")
        await f.write("bye")


asyncio.run(main4())
print()


# ===== 5. @asynccontextmanager 装饰器 =====
@asynccontextmanager
async def timer(name):
    """用装饰器写异步上下文管理器，比定义类更简洁"""
    print(f"  [{name}] 计时开始")
    start = time_loop_time()
    try:
        yield  # yield 之前是 __aenter__，之后是 __aexit__
    finally:
        elapsed = time_loop_time() - start
        print(f"  [{name}] 计时结束，耗时 {elapsed:.2f} 秒")


def time_loop_time():
    """取事件循环时间"""
    return asyncio.get_event_loop().time()


async def main5():
    print("=== 5. @asynccontextmanager 装饰器 ===")
    async with timer("任务A"):
        await asyncio.sleep(0.3)
        print("  执行任务中...")


asyncio.run(main5())
`,
  },

  // =========================================================
  // 第十一章：async for 异步迭代
  // =========================================================
  {
    id: "pa3-11",
    group: "异步工具",
    icon: "🔄",
    title: "async for 异步迭代",
    content: `## 先看一个 demo

\`async def\` + \`yield\` 就能写一个**异步生成器**，用 \`async for\` 遍历：

\`\`\`python
async def async_range(n):
    for i in range(n):
        await asyncio.sleep(0.1)  # 每产生一个数等一下
        yield i

async for x in async_range(5):
    print(x)
\`\`\`

每次取数据都要等 0.1 秒，但等待期间事件循环可以干别的活。像排队取餐，每份餐要等一会儿，但你可以在等的间隙刷手机。

## 知识点（从 demo 提炼）

1. \`async for\` 用于遍历**异步产生数据**的序列（每次取数据可能要 await）。
2. 类实现需写 \`__aiter__\` 和 \`__anext__\`（注意是 \`a\` 开头，不是 \`__iter__\`）。
3. 异步生成器（\`async def\` + \`yield\`）更简单，推荐优先用。
4. 应用场景：异步分页、流式数据、消息队列消费、网络数据流。
5. 异步推导式：\`[x async for x in async_gen()]\`，必须在 async 函数里用。

## 两种实现方式

| 方式 | 代码量 | 场景 |
|------|--------|------|
| 异步生成器（\`async def\`+yield） | 少 | 大多数场景，推荐 |
| 自定义异步迭代器类 | 多 | 需要复杂状态/控制 |

## 本章 demo

6 个 demo：生成器、迭代器类、分页、流式、break、推导式。
`,
    code: `"""
第十一章 demo：async for 异步迭代
目标：掌握异步生成器、异步迭代器、异步推导式。
"""
import asyncio


# ===== 1. 异步生成器 async_range =====
async def async_range(n, delay=0.1):
    """异步版 range：每产生一个数等 delay 秒"""
    for i in range(n):
        await asyncio.sleep(delay)
        yield i


async def main1():
    print("=== 1. 异步生成器 async_range ===")
    async for i in async_range(5, 0.1):
        print(f"  拿到: {i}")


asyncio.run(main1())
print()


# ===== 2. 自定义异步迭代器（AsyncCounter 类） =====
class AsyncCounter:
    """用类实现异步迭代器：实现 __aiter__ 和 __anext__"""

    def __init__(self, limit, delay=0.05):
        self.limit = limit
        self.delay = delay
        self.i = 0

    def __aiter__(self):
        # 返回迭代器对象本身
        return self

    async def __anext__(self):
        # 每次调用返回下一个值，没有更多时抛 StopAsyncIteration
        if self.i >= self.limit:
            raise StopAsyncIteration
        await asyncio.sleep(self.delay)
        self.i += 1
        return self.i


async def main2():
    print("=== 2. 自定义异步迭代器（AsyncCounter 类） ===")
    async for value in AsyncCounter(5):
        print(f"  value = {value}")


asyncio.run(main2())
print()


# ===== 3. 异步分页读取 =====
async def fetch_page(page):
    """模拟调用分页 API"""
    await asyncio.sleep(0.15)
    # 每页 3 条数据
    return [f"page{page}-item{i}" for i in range(3)]


async def paginated_items(total_pages):
    """异步生成器：逐页拉取数据并逐条 yield"""
    for page in range(1, total_pages + 1):
        items = await fetch_page(page)
        for item in items:
            yield item


async def main3():
    print("=== 3. 异步分页读取 ===")
    count = 0
    async for item in paginated_items(3):
        count += 1
        print(f"  第 {count} 条: {item}")
    print(f"  共读到 {count} 条")


asyncio.run(main3())
print()


# ===== 4. 异步流式处理 =====
async def data_stream(n):
    """模拟一个数据流，每隔一段时间产生一个数"""
    for i in range(n):
        await asyncio.sleep(0.05)
        yield i * i  # 平方数


async def main4():
    print("=== 4. 异步流式处理 ===")
    total = 0
    async for value in data_stream(8):
        if value > 10:
            print(f"  处理: {value} -> {value * 2}")
            total += value
    print(f"  累计: {total}")


asyncio.run(main4())
print()


# ===== 5. async for + break =====
async def infinite_numbers():
    """无限异步序列"""
    i = 0
    while True:
        await asyncio.sleep(0.05)
        yield i
        i += 1


async def main5():
    print("=== 5. async for + break ===")
    async for i in infinite_numbers():
        print(f"  {i}", end=" ")
        if i >= 4:
            print()  # 换行
            print("  找到目标，停止迭代")
            break


asyncio.run(main5())
print()


# ===== 6. 异步推导式 =====
async def main6():
    print("=== 6. 异步推导式 ===")
    # 注意：异步推导式必须在 async 函数里使用
    squares = [x async for x in async_range(5, 0.05)]
    print(f"  平方列表: {squares}")

    # 带条件的异步推导式
    evens = [x async for x in async_range(10, 0.02) if x % 2 == 0]
    print(f"  偶数列表: {evens}")


asyncio.run(main6())
`,
  },

  // =========================================================
  // 第十二章：asyncio.Queue 异步队列
  // =========================================================
  {
    id: "pa3-12",
    group: "异步工具",
    icon: "📬",
    title: "asyncio.Queue 异步队列",
    content: `## 先看一个 demo

\`Queue\` 就是协程之间的"信箱"：一边放东西（put），一边取东西（get）。

\`\`\`python
queue = asyncio.Queue()
await queue.put("任务A")
item = await queue.get()  # 拿到 "任务A"
\`\`\`

更常用的是**生产者-消费者**模式：生产者造东西放进去，消费者取出来处理。消费者收到 \`None\` 这个"停止信号"就知道该下班了。

## 知识点（从 demo 提炼）

1. \`asyncio.Queue\` 是协程间传递数据的工具，**线程安全**（事件循环内）。
2. \`put\` 满了会等待，\`get\` 空了会等待——天然适合生产消费节奏不一致的场景。
3. \`task_done()\` + \`join()\` 配合：消费者每处理完一个就 \`task_done\`，\`join\` 等到所有任务都处理完。
4. \`maxsize\` 限制容量：满了 \`put\` 会等，避免生产者跑太快把内存撑爆。
5. 停止信号：生产者发 \`None\`（哨兵），消费者循环里检测到就退出。

## 核心方法表

| 方法 | 作用 |
|------|------|
| \`await put(item)\` | 放入数据，满了等待 |
| \`await get()\` | 取出数据，空了等待 |
| \`qsize()\` | 当前队列长度 |
| \`empty()\` | 是否为空 |
| \`full()\` | 是否已满 |
| \`task_done()\` | 标记一个任务处理完 |
| \`await join()\` | 等所有任务被处理完 |

## 本章 demo

5 个 demo：基本用法、生产者消费者、join、有界队列、实战分发器。
`,
    code: `"""
第十二章 demo：asyncio.Queue 异步队列
目标：掌握生产者-消费者模型和队列核心方法。
"""
import asyncio
import random


# ===== 1. 基本 Queue =====
async def main1():
    print("=== 1. 基本 Queue ===")
    queue = asyncio.Queue()

    # 放三个数据
    await queue.put("A")
    await queue.put("B")
    await queue.put("C")

    print(f"  队列大小: {queue.qsize()}")
    print(f"  是否为空: {queue.empty()}")

    # 依次取出
    while not queue.empty():
        item = await queue.get()
        print(f"  取出: {item}")
        queue.task_done()  # 标记处理完一个

    print(f"  取完后大小: {queue.qsize()}")


asyncio.run(main1())
print()


# ===== 2. 生产者-消费者（带 None 停止信号） =====
async def producer(queue, name, count):
    """生产者：生产 count 个产品放进队列"""
    for i in range(count):
        item = f"{name}-产品{i}"
        await queue.put(item)
        print(f"  [生产者 {name}] 放入: {item}")
        await asyncio.sleep(random.uniform(0.05, 0.15))
    # 生产者自己不负责发停止信号，由主流程统一发


async def consumer(queue, name):
    """消费者：循环取数据，收到 None 就下班"""
    while True:
        item = await queue.get()
        if item is None:
            # 收到停止信号，退出循环
            queue.task_done()
            print(f"  [消费者 {name}] 收到停止信号，下班")
            break
        print(f"  [消费者 {name}] 取出: {item}")
        await asyncio.sleep(random.uniform(0.1, 0.25))  # 处理耗时
        queue.task_done()


async def main2():
    print("=== 2. 生产者-消费者（带 None 停止信号） ===")
    queue = asyncio.Queue(maxsize=5)

    # 2 个生产者，每个生产 3 个
    producers = [
        asyncio.create_task(producer(queue, f"P{i}", 3))
        for i in range(2)
    ]
    # 2 个消费者
    consumers = [
        asyncio.create_task(consumer(queue, f"C{i}"))
        for i in range(2)
    ]

    # 等所有生产者完成
    await asyncio.gather(*producers)
    print("  --- 所有生产者完成 ---")

    # 给每个消费者发一个 None 停止信号（数量等于消费者数）
    for _ in consumers:
        await queue.put(None)

    # 等所有消费者处理完并退出
    await asyncio.gather(*consumers)
    print("  --- 所有消费者完成 ---")


asyncio.run(main2())
print()


# ===== 3. queue.join 等待所有任务 =====
async def worker(queue, name):
    """工人：循环处理，收到 None 就停"""
    while True:
        item = await queue.get()
        if item is None:
            queue.task_done()
            break
        print(f"  [{name}] 处理: {item}")
        await asyncio.sleep(0.1)
        queue.task_done()  # 每处理完一个就 task_done


async def main3():
    print("=== 3. queue.join 等待所有任务 ===")
    queue = asyncio.Queue()

    # 启动 2 个工人
    workers = [
        asyncio.create_task(worker(queue, f"W{i}"))
        for i in range(2)
    ]

    # 放入 6 个任务
    for i in range(6):
        await queue.put(f"任务{i}")

    # 关键：join 会等到所有 put 进来的任务都被 task_done
    print("  等待所有任务处理完...")
    await queue.join()
    print("  所有任务处理完成！")

    # 任务都处理完了，发停止信号让工人退出
    for _ in workers:
        await queue.put(None)
    await asyncio.gather(*workers)


asyncio.run(main3())
print()


# ===== 4. 有界队列 (maxsize=2) =====
async def main4():
    print("=== 4. 有界队列 (maxsize=2) ===")
    queue = asyncio.Queue(maxsize=2)  # 最多放 2 个

    async def fast_producer():
        """生产者很快，但队列满了会被 put 卡住"""
        for i in range(5):
            await queue.put(f"产品{i}")
            print(f"  [生产者] 放入 产品{i}（当前大小 {queue.qsize()}）")

    async def slow_consumer():
        """消费者很慢，每 0.3 秒取一个"""
        for _ in range(5):
            await asyncio.sleep(0.3)
            item = await queue.get()
            print(f"    [消费者] 取出 {item}")
            queue.task_done()

    # 并发跑：生产者会被 maxsize 限流，不会一次性塞 5 个
    await asyncio.gather(fast_producer(), slow_consumer())


asyncio.run(main4())
print()


# ===== 5. 实战：任务分发器 =====
async def main5():
    print("=== 5. 实战：任务分发器 ===")
    queue = asyncio.Queue()

    # 准备一批任务（类型, 目标）
    tasks = [("下载", f"url{i}") for i in range(6)]
    for t in tasks:
        await queue.put(t)

    async def handler(name):
        """工人：从队列抢任务处理，直到队列空"""
        while True:
            try:
                action, target = queue.get_nowait()
            except asyncio.QueueEmpty:
                print(f"  [{name}] 队列空了，下班")
                return
            print(f"  [{name}] {action}: {target}")
            await asyncio.sleep(0.15)  # 模拟处理
            queue.task_done()

    # 3 个工人并发抢任务
    await asyncio.gather(
        handler("worker-1"),
        handler("worker-2"),
        handler("worker-3"),
    )
    print("  所有任务分发完成")


asyncio.run(main5())
`,
  },
];
