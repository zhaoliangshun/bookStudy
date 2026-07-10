// =============================================================
// Python asyncio 教程 V2（pyasync2）—— 第三批章节
// -------------------------------------------------------------
// 异步 I/O 和工具（10-14章）
//   第 10 章：asyncio.sleep 模拟 I/O
//   第 11 章：异步上下文管理器 async with
//   第 12 章：异步迭代器 async for
//   第 13 章：asyncio.to_thread 运行同步代码
//   第 14 章：异步队列 asyncio.Queue
// =============================================================

export const chapters = [
  // =========================================================
  // 第十章：asyncio.sleep 模拟 I/O
  // =========================================================
  {
    id: "pa2-10",
    group: "异步 I/O 和工具",
    icon: "💤",
    title: "asyncio.sleep 模拟 I/O",
    content: `## 一、asyncio.sleep 是什么？

\`asyncio.sleep(delay)\` 是 asyncio 里**非阻塞的等待**。

\`\`\`python
await asyncio.sleep(1)  # 让出 CPU 1 秒
\`\`\`

它不会阻塞整个线程，只是让当前协程暂停，事件循环可以执行其它任务。

## 二、与时间模块 sleep 的区别

| 写法 | 是否阻塞 | 是否让出 CPU |
|------|----------|--------------|
| \`time.sleep(1)\` | 阻塞线程 | 否 |
| \`await asyncio.sleep(1)\` | 不阻塞 | 是 |

## 三、为什么用 asyncio.sleep 做 demo？

因为真实的网络 I/O 需要外部依赖（如 aiohttp），为了教学方便，我们用 \`asyncio.sleep\` 来模拟等待时间。

## 四、基本用法

\`\`\`python
async def work():
    print("开始")
    await asyncio.sleep(1)  # 模拟 1 秒 I/O
    print("结束")
\`\`\`

## 五、多个 sleep 并发

\`\`\`python
await asyncio.gather(
    asyncio.sleep(1),
    asyncio.sleep(1),
    asyncio.sleep(1),
)
# 总耗时 1 秒，不是 3 秒
\`\`\`

## 六、本章 demo

演示 asyncio.sleep 的行为。
`,
    code: `"""
第十章 demo：asyncio.sleep 模拟 I/O
目标：理解 asyncio.sleep 不阻塞事件循环。
"""
import asyncio
import time


# ===== 1. asyncio.sleep 不阻塞 =====
async def ticker(name, interval, count):
    """定时打印"""
    for i in range(count):
        print(f"  [{name}] tick {i+1}")
        await asyncio.sleep(interval)


async def main1():
    print("=== 1. asyncio.sleep 不阻塞 ===")
    start = time.time()
    await asyncio.gather(
        ticker("A", 0.2, 3),
        ticker("B", 0.3, 3),
    )
    print(f"  总耗时: {time.time() - start:.2f} 秒")


asyncio.run(main1())
print()


# ===== 2. 模拟网络请求延迟 =====
async def fetch(url, latency):
    """模拟网页请求"""
    print(f"  [请求] {url}")
    await asyncio.sleep(latency)
    print(f"  [响应] {url}（延迟 {latency} 秒）")
    return f"{url} 内容"


async def main2():
    print("=== 2. 模拟多个网页请求 ===")
    start = time.time()
    results = await asyncio.gather(
        fetch("https://site-a.com", 0.5),
        fetch("https://site-b.com", 0.3),
        fetch("https://site-c.com", 0.8),
    )
    print(f"  结果: {results}")
    print(f"  总耗时: {time.time() - start:.2f} 秒")


asyncio.run(main2())
print()


# ===== 3. time.sleep 会阻塞 =====
def blocking_task(name, delay):
    """同步阻塞任务"""
    print(f"  [{name}] 开始阻塞")
    time.sleep(delay)
    print(f"  [{name}] 阻塞结束")


async def mixed():
    print("=== 3. 在 async 里调用 time.sleep 会阻塞 ===")
    start = time.time()
    blocking_task("同步任务", 0.5)
    await asyncio.sleep(0.1)
    print(f"  总耗时: {time.time() - start:.2f} 秒")


asyncio.run(mixed())
print()


# ===== 4. 倒计时 =====
async def countdown(seconds):
    print(f"=== 4. 倒计时 {seconds} 秒 ===")
    for i in range(seconds, 0, -1):
        print(f"  还剩 {i} 秒")
        await asyncio.sleep(1)
    print("  时间到！")


asyncio.run(countdown(3))
print()


# ===== 5. sleep 期间可以做其它事 =====
async def background():
    print("  [后台任务] 开始")
    for i in range(5):
        await asyncio.sleep(0.2)
        print(f"  [后台任务] 进度 {i+1}/5")
    print("  [后台任务] 完成")


async def main5():
    print("=== 5. 主任务等待时，后台任务继续 ===")
    task = asyncio.create_task(background())
    print("  [主任务] 开始等待 1 秒")
    await asyncio.sleep(1)
    print("  [主任务] 等待结束")
    await task


asyncio.run(main5())
`,
  },

  // =========================================================
  // 第十一章：异步上下文管理器 async with
  // =========================================================
  {
    id: "pa2-11",
    group: "异步 I/O 和工具",
    icon: "🚪",
    title: "异步上下文管理器 async with",
    content: `## 一、什么是异步上下文管理器？

和 \`with\` 类似，但进入和退出都是异步的：

\`\`\`python
async with resource as r:
    await r.do_something()
\`\`\`

## 二、实现方法

类需要实现 \`__aenter__\` 和 \`__aexit__\`：

\`\`\`python
class AsyncResource:
    async def __aenter__(self):
        await self.connect()
        return self

    async def __aexit__(self, exc_type, exc, tb):
        await self.close()
\`\`\`

## 三、应用场景

- 异步数据库连接
- 异步文件操作
- 异步锁
- 异步 HTTP 会话

## 四、对比同步 with

| 同步 | 异步 |
|------|------|
| \`__enter__\` / \`__exit__\` | \`__aenter__\` / \`__aexit__\` |
| \`with\` | \`async with\` |
| 同步资源 | 异步资源 |

## 五、本章 demo

演示 async with 的用法。
`,
    code: `"""
第十一章 demo：异步上下文管理器
目标：理解 async with 的用法和实现。
"""
import asyncio


# ===== 1. 自定义异步资源 =====
class AsyncConnection:
    """模拟异步连接"""

    def __init__(self, host):
        self.host = host
        self.connected = False

    async def __aenter__(self):
        print(f"  [连接] 正在连接 {self.host}...")
        await asyncio.sleep(0.3)
        self.connected = True
        print(f"  [连接] {self.host} 已连接")
        return self

    async def __aexit__(self, exc_type, exc, tb):
        print(f"  [断开] 正在关闭 {self.host}...")
        await asyncio.sleep(0.2)
        self.connected = False
        print(f"  [断开] {self.host} 已关闭")
        # 返回 False 让异常继续传播
        return False

    async def query(self, sql):
        if not self.connected:
            raise RuntimeError("未连接")
        await asyncio.sleep(0.2)
        return f"[{self.host}] {sql} 的查询结果"


async def main1():
    print("=== 1. async with 基本用法 ===")
    async with AsyncConnection("db.example.com") as conn:
        result = await conn.query("SELECT * FROM users")
        print(f"  {result}")
    print("  with 块结束，连接自动关闭")


asyncio.run(main1())
print()


# ===== 2. 异常时也会关闭 =====
async def main2():
    print("=== 2. 异常时自动释放资源 ===")
    try:
        async with AsyncConnection("db.example.com") as conn:
            result = await conn.query("SELECT * FROM users")
            print(f"  {result}")
            raise ValueError("模拟查询失败")
    except ValueError as e:
        print(f"  捕获异常: {e}")
        print("  连接仍然被正确关闭")


asyncio.run(main2())
print()


# ===== 3. 异步锁 =====
class SharedCounter:
    """使用异步锁保护共享资源"""

    def __init__(self):
        self.value = 0
        self.lock = asyncio.Lock()

    async def increment(self, name):
        # async with 锁：同一时间只有一个协程能进入
        async with self.lock:
            current = self.value
            await asyncio.sleep(0.01)  # 模拟一些操作
            self.value = current + 1
            print(f"  [{name}] value = {self.value}")


async def main3():
    print("=== 3. async with asyncio.Lock ===")
    counter = SharedCounter()
    await asyncio.gather(
        counter.increment("A"),
        counter.increment("B"),
        counter.increment("C"),
    )
    print(f"  最终值: {counter.value}")


asyncio.run(main3())
print()


# ===== 4. 模拟异步文件 =====
class AsyncFile:
    """模拟异步文件读写"""

    def __init__(self, filename, mode):
        self.filename = filename
        self.mode = mode

    async def __aenter__(self):
        print(f"  [文件] 打开 {self.filename}")
        await asyncio.sleep(0.1)
        self.content = []
        return self

    async def __aexit__(self, exc_type, exc, tb):
        print(f"  [文件] 关闭 {self.filename}")
        if self.mode == "w":
            # 模拟写入
            print(f"  [文件] 写入 {len(self.content)} 行")
        await asyncio.sleep(0.1)

    async def write(self, line):
        await asyncio.sleep(0.05)
        self.content.append(line)
        print(f"  [文件] 写入: {line}")


async def main4():
    print("=== 4. 模拟异步文件 ===")
    async with AsyncFile("/tmp/test.txt", "w") as f:
        await f.write("Hello")
        await f.write("asyncio")


asyncio.run(main4())
print()


# ===== 5. 上下文管理器工厂 =====
# 注意：旧版 Python 用 @asyncio.coroutine 装饰生成器协程，3.11 起已移除；
# 现在统一用 async def 即可，无需装饰器。
async def timed_context(name):
    """用 asynccontextmanager 装饰器（Python 3.7+）"""
    from contextlib import asynccontextmanager

    @asynccontextmanager
    async def timer(n):
        print(f"  [{n}] 开始计时")
        start = asyncio.get_event_loop().time()
        try:
            yield
        finally:
            elapsed = asyncio.get_event_loop().time() - start
            print(f"  [{n}] 结束计时，耗时 {elapsed:.2f} 秒")

    return timer(name)


async def main5():
    print("=== 5. @asynccontextmanager ===")
    from contextlib import asynccontextmanager

    @asynccontextmanager
    async def timer(name):
        print(f"  [{name}] 开始计时")
        start = asyncio.get_event_loop().time()
        try:
            yield
        finally:
            elapsed = asyncio.get_event_loop().time() - start
            print(f"  [{name}] 结束计时，耗时 {elapsed:.2f} 秒")

    async with timer("任务"):
        await asyncio.sleep(0.3)
        print("  执行任务中...")


asyncio.run(main5())
`,
  },

  // =========================================================
  // 第十二章：异步迭代器 async for
  // =========================================================
  {
    id: "pa2-12",
    group: "异步 I/O 和工具",
    icon: "🔄",
    title: "异步迭代器 async for",
    content: `## 一、什么是异步迭代器？

\`async for\` 用于遍历**异步产生数据**的序列。

\`\`\`python
async for item in async_generator:
    print(item)
\`\`\`

## 二、实现异步迭代器

类需要实现 \`__aiter__\` 和 \`__anext__\`：

\`\`\`python
class AsyncCounter:
    def __init__(self, limit):
        self.limit = limit
        self.i = 0

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self.i >= self.limit:
            raise StopAsyncIteration
        await asyncio.sleep(0.1)
        self.i += 1
        return self.i
\`\`\`

## 三、异步生成器

更简单的方式：

\`\`\`python
async def async_range(n):
    for i in range(n):
        await asyncio.sleep(0.1)
        yield i
\`\`\`

## 四、应用场景

- 异步分页读取数据库
- 异步读取消息队列
- 异步流式处理数据
- 异步网络数据流

## 五、本章 demo

演示 async for 的用法。
`,
    code: `"""
第十二章 demo：异步迭代器 async for
目标：掌握 async for 和异步生成器。
"""
import asyncio
import time


# ===== 1. 异步生成器 =====
async def async_range(n, delay=0.1):
    """异步 range"""
    for i in range(n):
        await asyncio.sleep(delay)
        yield i


async def main1():
    print("=== 1. async for 遍历异步生成器 ===")
    async for i in async_range(5, 0.1):
        print(f"  拿到: {i}")


asyncio.run(main1())
print()


# ===== 2. 自定义异步迭代器 =====
class AsyncCounter:
    """异步计数器"""

    def __init__(self, limit):
        self.limit = limit
        self.i = 0

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self.i >= self.limit:
            raise StopAsyncIteration
        await asyncio.sleep(0.05)
        self.i += 1
        return self.i


async def main2():
    print("=== 2. 自定义异步迭代器 ===")
    counter = AsyncCounter(5)
    async for value in counter:
        print(f"  value = {value}")


asyncio.run(main2())
print()


# ===== 3. 异步分页读取 =====
async def fetch_page(page_number):
    """模拟分页 API"""
    await asyncio.sleep(0.2)
    # 每页 3 条，模拟数据
    items = [f"page{page_number}-item{i}" for i in range(3)]
    return items


async def paginated_items(total_pages):
    """异步生成分页数据"""
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


asyncio.run(main3())
print()


# ===== 4. 异步流式处理 =====
async def data_stream():
    """模拟数据流"""
    for i in range(10):
        await asyncio.sleep(0.05)
        yield i * i


async def process_stream():
    print("=== 4. 异步流式处理 ===")
    async for value in data_stream():
        if value > 10:
            print(f"  处理: {value} -> {value * 2}")


asyncio.run(process_stream())
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
            print("\\n  找到目标，停止迭代")
            break


asyncio.run(main5())
print()


# ===== 6. 异步推导式 =====
async def main6():
    print("=== 6. 异步推导式 ===")
    # 注意：异步推导式需要在 async 函数里
    squares = [x async for x in async_range(5, 0.05)]
    print(f"  平方列表: {squares}")


asyncio.run(main6())
`,
  },

  // =========================================================
  // 第十三章：asyncio.to_thread 运行同步代码
  // =========================================================
  {
    id: "pa2-13",
    group: "异步 I/O 和工具",
    icon: "🧵",
    title: "asyncio.to_thread 运行同步代码",
    content: `## 一、为什么要 to_thread？

asyncio 是单线程事件循环，如果跑同步阻塞代码（如 \`time.sleep\`、大量计算），会卡住整个循环。

\`asyncio.to_thread\` 把同步函数放到**线程池**里跑，不阻塞事件循环。

## 二、基本用法

\`\`\`python
result = await asyncio.to_thread(sync_function, arg1, arg2)
\`\`\`

## 三、使用场景

- 调用第三方同步库
- 文件 I/O（某些库没有异步版本）
- CPU 密集型计算
- 阻塞的数据库驱动

## 四、与多线程的区别

\`asyncio.to_thread\` 内部用一个线程池，但你的主逻辑还是 asyncio 风格。

## 五、注意事项

- 函数必须是同步的
- 参数正常传递
- 返回值会返回给协程

## 六、本章 demo

演示 to_thread 的用法。
`,
    code: `"""
第十三章 demo：asyncio.to_thread
目标：在 asyncio 里安全地运行同步阻塞代码。
"""
import asyncio
import time


# ===== 1. 同步阻塞函数 =====
def blocking_add(a, b):
    """同步函数：阻塞 0.5 秒"""
    time.sleep(0.5)
    return a + b


# ===== 2. 直接调用会卡住事件循环 =====
async def bad_example():
    print("=== 1. 直接调用同步函数（不好） ===")
    start = time.time()
    result = blocking_add(2, 3)  # 阻塞整个事件循环！
    elapsed = time.time() - start
    print(f"  结果: {result}")
    print(f"  耗时: {elapsed:.2f} 秒")


asyncio.run(bad_example())
print()


# ===== 3. 用 to_thread 不阻塞 =====
async def good_example():
    print("=== 2. 用 to_thread 调用同步函数（好） ===")
    start = time.time()
    result = await asyncio.to_thread(blocking_add, 2, 3)
    elapsed = time.time() - start
    print(f"  结果: {result}")
    print(f"  耗时: {elapsed:.2f} 秒")


asyncio.run(good_example())
print()


# ===== 4. to_thread 的真正价值：并发 =====
async def concurrent_threads():
    print("=== 3. 并发运行多个同步函数 ===")
    start = time.time()
    results = await asyncio.gather(
        asyncio.to_thread(blocking_add, 1, 1),
        asyncio.to_thread(blocking_add, 2, 2),
        asyncio.to_thread(blocking_add, 3, 3),
    )
    elapsed = time.time() - start
    print(f"  结果: {results}")
    print(f"  总耗时: {elapsed:.2f} 秒（≈ 0.5 秒，不是 1.5 秒）")


asyncio.run(concurrent_threads())
print()


# ===== 5. CPU 密集型计算 =====
def heavy_compute(n):
    """CPU 密集型"""
    total = 0
    for i in range(n):
        total += i * i
    return total


async def cpu_task():
    print("=== 4. CPU 密集型计算 ===")
    start = time.time()
    result = await asyncio.to_thread(heavy_compute, 1000000)
    elapsed = time.time() - start
    print(f"  结果: {result}")
    print(f"  耗时: {elapsed:.2f} 秒")


asyncio.run(cpu_task())
print()


# ===== 6. 与异步任务混合 =====
async def async_task(name, delay):
    print(f"  [{name}] 异步任务开始")
    await asyncio.sleep(delay)
    print(f"  [{name}] 异步任务结束")
    return name


async def mixed():
    print("=== 5. 异步任务 + to_thread 同步任务 ===")
    start = time.time()
    results = await asyncio.gather(
        async_task("A", 0.3),
        asyncio.to_thread(blocking_add, 10, 20),
        async_task("B", 0.2),
    )
    elapsed = time.time() - start
    print(f"  结果: {results}")
    print(f"  总耗时: {elapsed:.2f} 秒")


asyncio.run(mixed())
print()


# ===== 7. 实战：异步里读同步文件 =====
def read_sync_file(path):
    """模拟同步文件读取"""
    time.sleep(0.2)
    return f"{path} 的内容"


async def file_demo():
    print("=== 6. 异步里读同步文件 ===")
    files = ["/tmp/a.txt", "/tmp/b.txt", "/tmp/c.txt"]
    results = await asyncio.gather(
        *[asyncio.to_thread(read_sync_file, f) for f in files]
    )
    for f, r in zip(files, results):
        print(f"  {f}: {r}")


asyncio.run(file_demo())
`,
  },

  // =========================================================
  // 第十四章：异步队列 asyncio.Queue
  // =========================================================
  {
    id: "pa2-14",
    group: "异步 I/O 和工具",
    icon: "📬",
    title: "异步队列 asyncio.Queue",
    content: `## 一、什么是 asyncio.Queue？

异步队列是**线程安全**的生产者-消费者模型工具。

\`\`\`python
queue = asyncio.Queue()
await queue.put(item)  # 放数据
item = await queue.get()  # 取数据
\`\`\`

## 二、核心方法

| 方法 | 作用 |
|------|------|
| \`put(item)\` | 放入数据，满了就等待 |
| \`get()\` | 取出数据，空了就等待 |
| \`qsize()\` | 当前大小 |
| \`empty()\` | 是否为空 |
| \`full()\` | 是否已满 |
| \`task_done()\` | 标记一个任务完成 |
| \`join()\` | 等待所有任务完成 |

## 三、生产者-消费者模式

\`\`\`python
async def producer(queue):
    for i in range(5):
        await queue.put(i)

async def consumer(queue):
    while True:
        item = await queue.get()
        if item is None:  # 结束信号
            break
        # 处理 item
        queue.task_done()
\`\`\`

## 四、Queue 的容量

\`\`\`python
queue = asyncio.Queue(maxsize=10)  # 最多 10 个
\`\`\`

## 五、本章 demo

演示 asyncio.Queue 的用法。
`,
    code: `"""
第十四章 demo：异步队列 asyncio.Queue
目标：掌握生产者-消费者模型。
"""
import asyncio
import random


# ===== 1. 基本 Queue =====
async def basic_queue():
    print("=== 1. 基本 Queue ===")
    queue = asyncio.Queue()

    await queue.put("A")
    await queue.put("B")
    await queue.put("C")

    print(f"  队列大小: {queue.qsize()}")
    while not queue.empty():
        item = await queue.get()
        print(f"  取出: {item}")


asyncio.run(basic_queue())
print()


# ===== 2. 生产者-消费者 =====
async def producer(queue, name, count):
    for i in range(count):
        item = f"{name}-产品{i}"
        await queue.put(item)
        print(f"  [生产者 {name}] 生产: {item}")
        await asyncio.sleep(random.uniform(0.05, 0.2))


async def consumer(queue, name):
    while True:
        item = await queue.get()
        if item is None:  # 结束信号
            queue.task_done()
            break
        print(f"  [消费者 {name}] 消费: {item}")
        await asyncio.sleep(random.uniform(0.1, 0.3))
        queue.task_done()


async def producer_consumer():
    print("=== 2. 生产者-消费者 ===")
    queue = asyncio.Queue(maxsize=5)

    producers = [
        asyncio.create_task(producer(queue, f"P{i}", 3))
        for i in range(2)
    ]
    consumers = [
        asyncio.create_task(consumer(queue, f"C{i}"))
        for i in range(2)
    ]

    # 等待所有生产者完成
    await asyncio.gather(*producers)
    print("  所有生产者完成")

    # 发送结束信号
    for _ in consumers:
        await queue.put(None)

    # 等待消费者处理完
    await asyncio.gather(*consumers)
    print("  所有消费者完成")


asyncio.run(producer_consumer())
print()


# ===== 3. queue.join 等待所有任务 =====
async def worker_with_join(queue, name):
    while True:
        item = await queue.get()
        if item is None:
            queue.task_done()
            break
        await asyncio.sleep(0.1)
        print(f"  [{name}] 处理 {item}")
        queue.task_done()


async def join_demo():
    print("=== 3. queue.join 等待所有任务 ===")
    queue = asyncio.Queue()

    workers = [
        asyncio.create_task(worker_with_join(queue, f"W{i}"))
        for i in range(2)
    ]

    for i in range(6):
        await queue.put(f"任务{i}")

    print("  等待所有任务被处理...")
    await queue.join()  # 等所有 task_done()
    print("  所有任务处理完成")

    for _ in workers:
        await queue.put(None)
    await asyncio.gather(*workers)


asyncio.run(join_demo())
print()


# ===== 4. 有界队列 =====
async def bounded_queue_demo():
    print("=== 4. 有界队列 (maxsize=2) ===")
    queue = asyncio.Queue(maxsize=2)

    async def fast_producer():
        for i in range(5):
            await queue.put(f"产品{i}")  # 满了会等待
            print(f"  放入: 产品{i}")

    async def slow_consumer():
        for _ in range(5):
            await asyncio.sleep(0.3)
            item = await queue.get()
            print(f"  取出: {item}")
            queue.task_done()

    await asyncio.gather(fast_producer(), slow_consumer())


asyncio.run(bounded_queue_demo())
print()


# ===== 5. 实战：任务分发器 =====
async def task_dispatcher():
    print("=== 5. 实战：任务分发器 ===")
    queue = asyncio.Queue()

    # 生成任务
    tasks = [("下载", f"url{i}") for i in range(5)]
    for t in tasks:
        await queue.put(t)

    async def handler(name):
        while not queue.empty():
            action, target = await queue.get()
            print(f"  [{name}] {action}: {target}")
            await asyncio.sleep(0.1)
            queue.task_done()

    await asyncio.gather(
        handler("worker-1"),
        handler("worker-2"),
    )


asyncio.run(task_dispatcher())
`,
  },
];
