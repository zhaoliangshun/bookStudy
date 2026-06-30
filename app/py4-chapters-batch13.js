// =============================================================
// Batch 13：并发编程（4 章）
// 49. py4-threading       threading、GIL、Lock、ThreadPool
// 50. py4-multiproc       multiprocessing、ProcessPool、Queue
// 51. py4-asyncio         async/await、Task、gather
// 52. py4-asyncio-adv     asyncio 高级：Queue、Semaphore、超时
// =============================================================

export const chapters = [
  {
    id: "py4-threading",
    group: "并发编程",
    icon: "🧵",
    title: "线程：threading、GIL、Lock",
    content: `
- **GIL**：同一时刻只有一个线程执行 Python 字节码
- I/O 密集 → 多线程能提速；CPU 密集 → 多线程几乎无收益
- \`threading.Thread\`：线程对象
- \`Lock\`：互斥锁，保护临界区
- \`concurrent.futures.ThreadPoolExecutor\`：高层线程池 API
`,
    code: `import time, threading, concurrent.futures

# 1) 线程池：I/O 模拟
def io_task(n, delay=0.1):
    time.sleep(delay)
    return f"task-{n} done"

t0 = time.perf_counter()
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
    results = list(ex.map(io_task, range(10)))
print("thread pool cost:", time.perf_counter() - t0)
print("results sample:", results[:3])

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
print("counter:", counter)  # 40000

# 3) Event：线程信号
event = threading.Event()
def waiter():
    event.wait()
    print("got signal!")
threading.Thread(target=waiter).start()
time.sleep(0.05)
event.set()
time.sleep(0.05)
print("done")
`,
  },
  {
    id: "py4-multiproc",
    group: "并发编程",
    icon: "⚙️",
    title: "多进程：multiprocessing、ProcessPool",
    content: `
- 绕开 GIL，每个进程有独立内存空间
- \`multiprocessing.Process\`：进程对象
- \`concurrent.futures.ProcessPoolExecutor\`：高层进程池 API
- 通信靠 \`Queue\` / \`Pipe\`，内存不共享
- 注意：\`if __name__ == "__main__":\` 保护
`,
    code: `import time, concurrent.futures

# CPU 密集任务
def cpu_task(n):
    s = 0
    for i in range(n):
        s += i * i
    return s

if __name__ == "__main__":
    N = 200_000
    t0 = time.perf_counter()
    # 沙箱通过 stdin 传代码，子进程无法重新导入 __main__，ProcessPoolExecutor
    # 会卡住超时。这里改用线程池演示同样的 .map 接口；真实 CPU 密集场景应
    # 使用 ProcessPoolExecutor（需把代码保存为 .py 文件运行）。
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
        results = list(ex.map(cpu_task, [N] * 4))
    print("pool cost:", time.perf_counter() - t0)
    print("results sample:", results[:2])

# 串行 vs 线程对比（CPU 密集，受 GIL 限制几乎无加速）
def cpu_bench(n):
    s = 0
    for i in range(n):
        s += i
    return s

if __name__ == "__main__":
    N = 1_000_000
    t0 = time.perf_counter()
    cpu_bench(N)
    print("serial:", time.perf_counter() - t0)

    t0 = time.perf_counter()
    with concurrent.futures.ThreadPoolExecutor(2) as ex:
        list(ex.map(cpu_bench, [N, N]))
    print("threads:", time.perf_counter() - t0, "(GIL 限制)")

    # 概念说明：ProcessPoolExecutor 与 ThreadPoolExecutor 接口完全一致，
    # 但每个任务在独立进程运行，绕开 GIL，适合真正的 CPU 密集并行。
    # 进程间通信靠 multiprocessing.Queue / Pipe（内存不共享）。
    print("提示: ProcessPoolExecutor 接口相同，需独立进程运行环境")
`,
  },
  {
    id: "py4-asyncio",
    group: "并发编程",
    icon: "⚡",
    title: "asyncio：async/await 基础",
    content: `
- \`async def\` 定义协程函数，调用返回协程对象
- \`await\` 挂起等异步操作完成
- \`asyncio.run(main())\`：入口（3.7+）
- \`asyncio.create_task(coro)\`：调度协程并发
- \`asyncio.gather(*coros)\`：并发等待多个协程
- 适合 I/O 密集：网络请求、数据库查询、文件读写
`,
    code: `import asyncio, time

# 基础协程
async def say(msg, delay):
    await asyncio.sleep(delay)
    return f"{msg} after {delay}s"

async def main_basic():
    # 串行
    t0 = time.perf_counter()
    a = await say("A", 0.1)
    b = await say("B", 0.1)
    print("serial:", a, b, "cost:", time.perf_counter() - t0)
    
    # 并发
    t0 = time.perf_counter()
    a, b = await asyncio.gather(say("A", 0.1), say("B", 0.1))
    print("gather:", a, b, "cost:", time.perf_counter() - t0)

asyncio.run(main_basic())

# Task 生命周期
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
    tasks[1].cancel()
    results = await asyncio.gather(*tasks, return_exceptions=True)
    print("results:", results)

asyncio.run(main_task())

# 异步 HTTP 模拟
async def fake_fetch(url, delay=0.1):
    await asyncio.sleep(delay)
    return {"url": url, "status": 200}

async def main_fetch():
    t0 = time.perf_counter()
    results = await asyncio.gather(
        *[fake_fetch(f"http://x/{i}") for i in range(10)]
    )
    print("fetch cost:", time.perf_counter() - t0)
    print("first:", results[0])

asyncio.run(main_fetch())
`,
  },
  {
    id: "py4-asyncio-adv",
    group: "并发编程",
    icon: "🚀",
    title: "asyncio 高级：Queue、Semaphore、超时",
    content: `
- \`asyncio.Queue\`：异步生产者/消费者
- \`asyncio.Semaphore\`：限制并发数
- \`asyncio.wait_for(coro, timeout)\`：超时
- \`asyncio.Lock\`：异步锁
- \`asyncio.to_thread()\`：在异步里跑同步代码
- \`asyncio.TaskGroup\`（3.11+）：结构化并发
`,
    code: `import asyncio

# 1) Queue：生产者/消费者
async def producer(q):
    for i in range(5):
        await q.put(i)
        await asyncio.sleep(0.01)
    for _ in range(2):
        await q.put(None)  # 哨兵

async def consumer(q, name):
    while True:
        item = await q.get()
        if item is None:
            break
        print(f"consumer {name}: {item}")
        await asyncio.sleep(0.02)

async def main_queue():
    q = asyncio.Queue()
    await asyncio.gather(producer(q), consumer(q, "A"), consumer(q, "B"))

asyncio.run(main_queue())

# 2) Semaphore：限流
sem = asyncio.Semaphore(3)

async def bounded_fetch(url):
    async with sem:
        await asyncio.sleep(0.05)
        return f"fetched {url}"

async def main_sem():
    t0 = asyncio.get_event_loop().time()
    await asyncio.gather(*[bounded_fetch(f"u{i}") for i in range(10)])
    print("bounded cost:", asyncio.get_event_loop().time() - t0)

asyncio.run(main_sem())

# 3) 超时
async def slow():
    await asyncio.sleep(10)

async def main_timeout():
    try:
        await asyncio.wait_for(slow(), timeout=0.05)
    except TimeoutError:
        print("timeout!")

asyncio.run(main_timeout())

# 4) TaskGroup（3.11+）
async def task(n):
    await asyncio.sleep(0.01)
    if n == 1:
        raise ValueError(f"task {n} failed")
    return n

async def main_tg():
    results = []
    try:
        async with asyncio.TaskGroup() as tg:
            for i in range(5):
                tg.create_task(task(i))
    except* ValueError as eg:
        print("TaskGroup errors:", [str(e) for e in eg.exceptions])

asyncio.run(main_tg())
`,
  },
];