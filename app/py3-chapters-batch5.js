// =============================================================
// 第五批章节（函数式与并发，4 章）
// 17. functional       map/filter/reduce、functools、operator
// 18. threading        线程、GIL、Lock、ThreadPoolExecutor
// 19. asyncio          async/await、Task、gather、asyncio.Queue
// 20. concurrency      并发模型对比、aiohttp、httpx
// =============================================================

export const chapters = [
  {
    id: "py3-functional",
    group: "函数式与并发",
    icon: "🧮",
    title: "函数式：map / filter / reduce / operator",
    content: `
# 函数式工具

- **map(fn, iter)**：逐个应用函数，返回迭代器
- **filter(fn, iter)**：按谓词过滤
- **functools.reduce(fn, iter, init)**：累积
- **itertools.accumulate**：累积（默认累加）
- **operator** 模块：把运算符当函数（\`itemgetter / attrgetter / methodcaller\`）
- **functools.partial**：偏函数（固定部分参数）
- Python 风格：能用推导时优先推导，map/filter 多用于和已存在的函数组合
`,
    code: `import functools, operator

nums = [1, 2, 3, 4, 5]

# 1) map / filter
print("map square:", list(map(lambda x: x * x, nums)))
print("filter even:", list(filter(lambda x: x % 2 == 0, nums)))
print("map+filter:", list(map(lambda x: x * 2, filter(lambda x: x > 2, nums))))

# 2) reduce
print("reduce sum:", functools.reduce(operator.add, nums, 0))    # 15
print("reduce max:", functools.reduce(lambda a, b: a if a > b else b, nums))

# 3) operator：替代 lambda
users = [{"name": "bob", "age": 30}, {"name": "alice", "age": 25}, {"name": "carol", "age": 28}]
by_age = sorted(users, key=operator.itemgetter("age"))
by_name = sorted(users, key=operator.itemgetter("name"))
print("by_age:", by_age)
print("by_name:", by_name)

# 4) partial：固定参数
def power(base, exp):
    return base ** exp

square = functools.partial(power, exp=2)
cube = functools.partial(power, exp=3)
print("square(5):", square(5), "cube(2):", cube(2))

# 5) 链式：把多个函数串起来
def compose(*fns):
    def composed(x):
        for fn in fns:
            x = fn(x)
        return x
    return composed

inc = lambda x: x + 1
dbl = lambda x: x * 2
sq  = lambda x: x * x
f = compose(inc, dbl, sq)         # 顺序：先 sq，再 dbl，再 inc
print("compose(3):", f(3))        # sq=9, dbl=18, inc=19

# 6) 任意 all/any
print(all(x > 0 for x in nums), any(x > 4 for x in nums))
`,
  },

  {
    id: "py3-threading",
    group: "函数式与并发",
    icon: "🧵",
    title: "线程与多进程：GIL、Lock、ProcessPool",
    content: `
# 线程与多进程

- **GIL**（Global Interpreter Lock）：同一时刻只有一个线程执行 Python 字节码
  - I/O 密集型（网络/磁盘）：多线程能提速（GIL 释放）
  - CPU 密集型（计算）：多线程几乎无收益，要用多进程
- **threading**：线程，共享内存，需 Lock 保护临界区
- **multiprocessing**：多进程，绕开 GIL，但通信靠 Queue/Pipe，内存不共享
- **concurrent.futures**：高层 API（ThreadPoolExecutor / ProcessPoolExecutor）
`,
    code: `import time, threading, concurrent.futures, multiprocessing

# 1) 线程基础：跑 I/O 模拟
def io_task(n, delay=0.1):
    time.sleep(delay)
    return f"task-{n} done"

t0 = time.perf_counter()
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
    results = list(ex.map(io_task, range(10)))
print("thread pool cost:", time.perf_counter() - t0, "results sample:", results[:3])

# 2) Lock 保护共享变量
counter = 0
lock = threading.Lock()

def inc(n):
    global counter
    for _ in range(n):
        with lock:
            counter += 1

threads = [threading.Thread(target=inc, args=(10000,)) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
print("counter after threads:", counter)  # 应为 40000

# 3) ProcessPoolExecutor：CPU 密集
def cpu_task(n):
    s = 0
    for i in range(n):
        s += i * i
    return s

if __name__ == "__main__":
    # 注意：在脚本里 multiprocessing 可能需要 __main__ 保护
    N = 200_000
    t0 = time.perf_counter()
    with concurrent.futures.ProcessPoolExecutor() as ex:
        list(ex.map(cpu_task, [N] * 4))
    print("process pool cost:", time.perf_counter() - t0)

# 4) threading.Event：简单信号
event = threading.Event()

def waiter():
    event.wait()
    print("got signal!")

threading.Thread(target=waiter).start()
time.sleep(0.05)
event.set()
`,
  },

  {
    id: "py3-asyncio",
    group: "函数式与并发",
    icon: "⚡",
    title: "asyncio：async / await / Task / gather",
    content: `
# asyncio

- \`async def fn()\` 定义协程函数，调用返回协程对象
- \`await\` 挂起等异步操作完成
- **运行入口**：\`asyncio.run(main())\`（3.7+）
- **Task**：\`asyncio.create_task(coro)\` 调度协程并发执行
- **gather**：\`asyncio.gather(*coros)\` 并发等待多个协程
- **asyncio.Queue / Lock / Semaphore**：异步原语
- **async for** / **async with**：异步迭代和上下文
- 不要在同步代码里 \`await\`；不要在异步里阻塞（\`<3.11\`，3.11+ 有 \`asyncio.to_thread\`）
`,
    code: `import asyncio, time

# 1) 基础协程
async def say(msg, delay):
    await asyncio.sleep(delay)
    return f"{msg} after {delay}s"

async def main_basic():
    t0 = time.perf_counter()
    # 串行
    a = await say("A", 0.1)
    b = await say("B", 0.1)
    print("serial:", a, b, "cost:", time.perf_counter() - t0)

    # 并发
    t0 = time.perf_counter()
    a, b = await asyncio.gather(say("A", 0.1), say("B", 0.1))
    print("gather:", a, b, "cost:", time.perf_counter() - t0)

asyncio.run(main_basic())

# 2) Task 生命周期
async def worker(n):
    try:
        await asyncio.sleep(1)
        return n * 2
    except asyncio.CancelledError:
        print(f"task {n} cancelled")
        raise

async def main_task():
    tasks = [asyncio.create_task(worker(i)) for i in range(3)]
    await asyncio.sleep(0.05)
    tasks[1].cancel()                                # 取消第 2 个
    results = await asyncio.gather(*tasks, return_exceptions=True)
    print("gather results:", results)

asyncio.run(main_task())

# 3) asyncio.Queue：生产者/消费者
async def producer(q):
    for i in range(3):
        await q.put(i)
        await asyncio.sleep(0.01)
    await q.put(None)                                # 哨兵

async def consumer(q):
    while True:
        item = await q.get()
        if item is None:
            break
        print("consumed:", item)

async def main_queue():
    q = asyncio.Queue()
    await asyncio.gather(producer(q), consumer(q))

asyncio.run(main_queue())

# 4) 超时
async def slow():
    await asyncio.sleep(10)

async def main_timeout():
    try:
        await asyncio.wait_for(slow(), timeout=0.05)
    except TimeoutError:
        print("timeout!")

asyncio.run(main_timeout())
`,
  },

  {
    id: "py3-concurrency",
    group: "函数式与并发",
    icon: "🌐",
    title: "并发实战：httpx 异步抓取、模型选择",
    content: `
# 并发模型选择

- **同步 requests**：简单，I/O 慢
- **多线程 ThreadPool**：I/O 密集，但 GIL 限制
- **asyncio + httpx**：高并发 I/O，推荐现代写法
- **多进程 ProcessPool**：CPU 密集
- 选用口诀：
  - 网络/磁盘 → asyncio 或 ThreadPool
  - 计算/压缩/图像 → ProcessPool
  - 混合 → asyncio 内 \`to_thread\`
`,
    code: `import asyncio, time

# 模拟一个异步 HTTP 客户端（不依赖真实网络）
async def fake_fetch(url, delay=0.1):
    await asyncio.sleep(delay)
    return {"url": url, "len": delay * 1000}

# 1) 串行 vs 并发
async def serial():
    t0 = time.perf_counter()
    results = []
    for i in range(10):
        results.append(await fake_fetch(f"http://x/{i}"))
    print("serial cost:", time.perf_counter() - t0)
    return results

async def parallel():
    t0 = time.perf_counter()
    results = await asyncio.gather(*[fake_fetch(f"http://x/{i}") for i in range(10)])
    print("parallel cost:", time.perf_counter() - t0)
    return results

async def main():
    await serial()
    await parallel()

asyncio.run(main())

# 2) Semaphore 限流：最多 3 个并发
sem = asyncio.Semaphore(3)

async def bounded_fetch(url):
    async with sem:
        await fake_fetch(url, 0.05)

async def main_bounded():
    t0 = time.perf_counter()
    await asyncio.gather(*[bounded_fetch(f"u{i}") for i in range(10)])
    print("bounded cost:", time.perf_counter() - t0)

asyncio.run(main_bounded())

# 3) 混合 CPU+I/O：asyncio 内 to_thread
import asyncio

def cpu_bound(n):
    return sum(i * i for i in range(n))

async def main_mix():
    t0 = time.perf_counter()
    # 用 to_thread 把 CPU 任务丢到默认线程池
    results = await asyncio.gather(*[
        asyncio.to_thread(cpu_bound, 200_000) for _ in range(4)
    ])
    print("mix cost:", time.perf_counter() - t0, "sums:", results)

asyncio.run(main_mix())

# 4) httpx 异步示例（仅 import 演示；运行环境可能没装）
try:
    import httpx
    print("httpx version:", httpx.__version__)
except ImportError:
    print("httpx 未安装；可用 pip install httpx 装上后用 AsyncClient")

# 5) 选择指南（注释）
print(""\"选型速记:
  - 客户端只发少量请求 → 同步 requests 最简单
  - 高并发抓取 / 大量连接 → asyncio + httpx.AsyncClient
  - 后台服务需 CPU 计算 → ProcessPoolExecutor
  - WebSocket 长连接 → asyncio + websockets
\"\"\")
`,
  },
];
