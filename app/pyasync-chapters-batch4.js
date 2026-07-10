// =============================================================
// Python asyncio 教程（pyasync）—— 第四批章节
// -------------------------------------------------------------
// 高级特性（15-19章）
//   第 15 章：同步原语：Lock、Semaphore、Event
//   第 16 章：异步 map 与异步推导式
//   第 17 章：子进程：asyncio.create_subprocess_exec
//   第 18 章：信号处理：asyncio 优雅退出
//   第 19 章：调试 asyncio 程序
// =============================================================

export const chapters = [
  // =========================================================
  // 第十五章：同步原语：Lock、Semaphore、Event
  // =========================================================
  {
    id: "pa-15",
    group: "高级特性",
    icon: "🔐",
    title: "同步原语：Lock、Semaphore、Event",
    content: `## 一、为什么 asyncio 还要锁？

asyncio 是单线程，但**协程切换点**会引发竞争：

\`\`\`python
# 看起来没问题，其实有 bug
async def increment(counter):
    await asyncio.sleep(0)  # 切换点
    counter[0] += 1

# 多个协程并发时，会丢失更新
\`\`\`

## 二、asyncio.Lock

互斥锁，协程级别的锁：

\`\`\`python
import asyncio
lock = asyncio.Lock()

async def critical_section():
    async with lock:
        # 临界区：同时只能一个协程
        await asyncio.sleep(0.1)
        # 修改共享状态
\`\`\`

## 三、Lock 的特性

- **协程间同步**：同一时刻只有一个协程在临界区
- **可重入？**：asyncio.Lock 不可重入
- **跨线程？**：asyncio.Lock 不可跨线程（用 threading.Lock）

## 四、asyncio.Semaphore

信号量，限制并发数：

\`\`\`python
import asyncio
sem = asyncio.Semaphore(3)  # 最多 3 个并发

async def limited():
    async with sem:
        await do_work()
\`\`\`

**用途**：限流、连接池。

## 五、asyncio.Event

事件机制：

\`\`\`python
import asyncio
event = asyncio.Event()

async def waiter():
    print("等待...")
    await event.wait()  # 阻塞
    print("事件触发！")

async def setter():
    await asyncio.sleep(1)
    event.set()  # 触发
\`\`\`

**用途**：协调多个协程的状态变化。

## 六、asyncio.Condition

条件变量：

\`\`\`python
import asyncio
cond = asyncio.Condition()

async def waiter():
    async with cond:
        await cond.wait()  # 等待通知

async def notifier():
    async with cond:
        cond.notify_all()  # 通知
\`\`\`

## 七、Lock 实战：安全计数器

\`\`\`python
class AsyncCounter:
    def __init__(self):
        self.value = 0
        self.lock = asyncio.Lock()

    async def increment(self):
        async with self.lock:
            current = self.value
            await asyncio.sleep(0.01)  # 模拟工作
            self.value = current + 1
\`\`\`

## 八、Semaphore 实战：限流爬虫

\`\`\`python
import asyncio
sem = asyncio.Semaphore(5)

async def fetch(url):
    async with sem:
        # 最多 5 个并发
        return await client.get(url)
\`\`\`

## 九、Event 实战：启动信号

\`\`\`python
import asyncio
start_event = asyncio.Event()

async def worker(name):
    await start_event.wait()  # 等所有协程就绪
    print(f"{name} 起跑！")

async def main():
    workers = [asyncio.create_task(worker(f"w{i}")) for i in range(5)]
    await asyncio.sleep(1)  # 等 workers 就绪
    start_event.set()  # 起跑信号
\`\`\`

## 十、选择合适的同步原语

| 场景 | 选择 |
|------|------|
| 互斥访问 | Lock |
| 限流 | Semaphore |
| 状态通知 | Event |
| 复杂条件 | Condition |
| 跨线程 | threading.* |

## 十一、本章 demo

下面 demo 演示各种同步原语。
`,
    code: `"""
第十五章 demo：同步原语 Lock / Semaphore / Event
演示：
  1. 不加锁的并发 bug
  2. asyncio.Lock 保护临界区
  3. Semaphore 限流
  4. Event 协调启动
  5. 实战：线程安全计数器
"""

import asyncio
import time
import random


# ===== 1. 不加锁的 bug =====
async def unsafe_increment(counter, name):
    # 模拟工作
    await asyncio.sleep(0.01)
    # 切换点：counter[0] += 1 不是原子的
    val = counter[0]
    await asyncio.sleep(0.01)  # 关键：让出 CPU
    counter[0] = val + 1
    print(f"  [{name}] 写入 {counter[0]}")


async def demo_unsafe():
    print("【1. 不加锁的并发 bug】")
    counter = [0]
    await asyncio.gather(*[
        unsafe_increment(counter, f"t{i}") for i in range(5)
    ])
    print(f"  最终值: {counter[0]}（应该是 5，可能是 1~4）\\n")


# ===== 2. 加锁修复 =====
class SafeCounter:
    def __init__(self):
        self.value = 0
        self.lock = asyncio.Lock()

    async def increment(self, name):
        async with self.lock:
            val = self.value
            await asyncio.sleep(0.01)
            self.value = val + 1
            print(f"  [{name}] 写入 {self.value}")

    async def get(self):
        async with self.lock:
            return self.value


async def demo_safe():
    print("【2. 加 Lock 修复】")
    counter = SafeCounter()
    await asyncio.gather(*[
        counter.increment(f"t{i}") for i in range(5)
    ])
    print(f"  最终值: {await counter.get()}（一定是 5）\\n")


# ===== 3. Semaphore 限流 =====
async def sem_task(sem, i):
    async with sem:
        print(f"  [T{i}] 获锁，开始")
        await asyncio.sleep(0.2)
        print(f"  [T{i}] 完成，释放")


async def demo_semaphore():
    print("【3. Semaphore 限流（最多 3 个并发）】\\n")
    sem = asyncio.Semaphore(3)
    start = time.time()
    await asyncio.gather(*[sem_task(sem, i) for i in range(8)])
    print(f"\\n  8 个任务限流 3，耗时: {time.time()-start:.2f} 秒\\n")


# ===== 4. Event 协调 =====
async def race_worker(name, start_event):
    print(f"  [{name}] 准备起跑...")
    await start_event.wait()
    print(f"  [{name}] 起跑！")
    await asyncio.sleep(random.uniform(0.1, 0.3))
    print(f"  [{name}] 到达终点")


async def demo_event():
    print("【4. Event 协调（起跑信号）】")
    start_event = asyncio.Event()
    workers = [
        asyncio.create_task(race_worker(f"选手{i}", start_event))
        for i in range(5)
    ]
    # 等所有选手准备好
    await asyncio.sleep(0.5)
    print("  发令枪响！\\n")
    start_event.set()
    await asyncio.gather(*workers)
    print()


# ===== 5. 实战：异步任务调度 =====
class AsyncScheduler:
    """简单的异步任务调度器：用 Semaphore 限流"""
    def __init__(self, max_concurrent=3):
        self.sem = asyncio.Semaphore(max_concurrent)

    async def run(self, task_id):
        async with self.sem:
            print(f"  [任务{task_id}] 开始（占用并发位）")
            await asyncio.sleep(random.uniform(0.1, 0.3))
            print(f"  [任务{task_id}] 完成")
            return f"result-{task_id}"


async def demo_scheduler():
    print("【5. 实战：Semaphore 限流调度器】\\n")
    scheduler = AsyncScheduler(max_concurrent=2)
    results = await asyncio.gather(*[
        scheduler.run(i) for i in range(6)
    ])
    print(f"\\n  全部完成: {results}\\n")


# ===== 主入口 =====
async def main():
    print("=" * 50)
    print("Python asyncio 教程 — 第十五章 demo")
    print("=" * 50 + "\\n")

    await demo_unsafe()
    await demo_safe()
    await demo_semaphore()
    await demo_event()
    await demo_scheduler()

    print("=" * 50)
    print("总结：")
    print("• asyncio.Lock: 协程互斥")
    print("• asyncio.Semaphore: 限流")
    print("• asyncio.Event: 状态通知")
    print("• asyncio.Condition: 复杂协调")
    print("• 用 async with 避免忘记释放")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
`,
  },

  // =========================================================
  // 第十六章：异步 map 与异步推导式
  // =========================================================
  {
    id: "pa-16",
    group: "高级特性",
    icon: "🗺️",
    title: "异步 map 与异步推导式",
    content: `## 一、Python 没有原生 async map

\`map\` 只能处理同步函数。要"异步 map"得自己写：

\`\`\`python
# ❌ 不会工作：map 是同步的
results = map(async_func, items)

# ✅ 自己写
async def async_map(func, items):
    return await asyncio.gather(*[func(x) for x in items])

results = await async_map(fetch, urls)
\`\`\`

## 二、asyncio.gather + 列表推导式

最常见的"异步 map"模式：

\`\`\`python
results = await asyncio.gather(*[fetch(url) for url in urls])
# 顺序收集
\`\`\`

## 三、限流的"异步 map"

\`\`\`python
async def bounded_map(func, items, concurrency=10):
    sem = asyncio.Semaphore(concurrency)
    async def one(item):
        async with sem:
            return await func(item)
    return await asyncio.gather(*[one(x) for x in items])
\`\`\`

## 四、asyncio.as_completed

边完成边处理：

\`\`\`python
tasks = [asyncio.create_task(fetch(url)) for url in urls]
for coro in asyncio.as_completed(tasks):
    result = await coro
    print(result)  # 哪个先完成先处理
\`\`\`

**与 gather 的区别**：
- gather：等所有完成，按原顺序返回
- as_completed：边完成边返回

## 五、异步推导式（async comprehension）

Python 3.6+ 支持：

\`\`\`python
# 列表推导（异步）
results = [await func(x) for x in items]  # 顺序执行

# 异步迭代器
results = [x async for x in async_gen]
\`\`\`

## 六、asyncio.to_thread 处理同步函数

如果函数是同步的，用 \`asyncio.to_thread\`：

\`\`\`python
# 把同步函数并发到线程池
results = await asyncio.gather(
    *[asyncio.to_thread(sync_func, x) for x in items]
)
\`\`\`

## 七、实战：并发处理 1000 个任务

\`\`\`python
async def process_all(items, concurrency=20):
    sem = asyncio.Semaphore(concurrency)

    async def one(item):
        async with sem:
            return await process(item)

    return await asyncio.gather(*[one(x) for x in items])
\`\`\`

## 八、进度显示

\`\`\`python
import asyncio

async def with_progress(tasks):
    total = len(tasks)
    completed = 0
    for coro in asyncio.as_completed(tasks):
        result = await coro
        completed += 1
        print(f"\\r进度: {completed}/{total}", end="")
\`\`\`

## 九、as_completed vs gather 何时用？

| 场景 | 用什么 |
|------|--------|
| 需要全部结果 | gather |
| 边到边处理 | as_completed |
| 有错误早退 | wait + FIRST_EXCEPTION |
| 想知道哪些失败 | wait + return_when |

## 十、本章 demo

下面 demo 演示各种"异步 map"模式。
`,
    code: `"""
第十六章 demo：异步 map 与异步推导式
演示：
  1. asyncio.gather 当 map 用
  2. 限流的异步 map
  3. as_completed 边完成边处理
  4. 异步推导式
  5. asyncio.to_thread 并发同步函数
  6. 实战：批量处理 + 进度
"""

import asyncio
import time
import random


# ===== 1. gather 当 map 用 =====
async def fetch(i):
    await asyncio.sleep(random.uniform(0.1, 0.3))
    return f"item-{i}"


async def demo_gather_map():
    print("【1. asyncio.gather 当 map 用】")
    results = await asyncio.gather(*[fetch(i) for i in range(5)])
    print(f"  顺序收集: {results}\\n")


# ===== 2. 限流的异步 map =====
async def limited_map(func, items, concurrency):
    sem = asyncio.Semaphore(concurrency)
    async def one(item):
        async with sem:
            return await func(item)
    return await asyncio.gather(*[one(x) for x in items])


async def demo_bounded():
    print("【2. 限流的异步 map（concurrency=2）】")
    start = time.time()
    results = await limited_map(fetch, range(6), concurrency=2)
    print(f"  6 个任务限流 2，结果: {results}")
    print(f"  耗时: {time.time()-start:.2f} 秒\\n")


# ===== 3. as_completed =====
async def demo_as_completed():
    print("【3. as_completed 边完成边处理】\\n")
    tasks = [fetch(i) for i in range(5)]
    completed = []
    for coro in asyncio.as_completed(tasks):
        result = await coro
        completed.append(result)
        print(f"  收到: {result}, 已完成: {len(completed)}/5")
    print()


# ===== 4. 异步推导式 =====
async def async_gen_demo():
    """异步生成器"""
    for i in range(5):
        await asyncio.sleep(0.05)
        yield i


async def demo_comprehension():
    print("【4. 异步推导式】\\n")

    # async for 列表推导
    result = [x async for x in async_gen_demo()]
    print(f"  异步推导: {result}")

    # 嵌套 await
    result2 = [await fetch(x) for x in range(3)]
    print(f"  await 列表推导: {result2}\\n")


# ===== 5. asyncio.to_thread 并发同步 =====
def sync_task(i):
    """同步阻塞任务"""
    time.sleep(0.1)
    return f"sync-{i}"


async def demo_to_thread():
    print("【5. asyncio.to_thread 并发同步函数】")
    start = time.time()
    results = await asyncio.gather(
        *[asyncio.to_thread(sync_task, i) for i in range(5)]
    )
    print(f"  5 个同步任务并发: {results}")
    print(f"  耗时: {time.time()-start:.2f} 秒（≈0.1 而非 0.5）\\n")


# ===== 6. 实战：批量处理 + 进度 =====
async def process_with_progress(items, concurrency=5):
    """批量处理并显示进度"""
    sem = asyncio.Semaphore(concurrency)
    total = len(items)
    completed = 0

    async def one(item):
        nonlocal completed
        async with sem:
            await asyncio.sleep(random.uniform(0.05, 0.15))
            result = f"processed-{item}"
            completed += 1
            pct = completed / total * 100
            print(f"\\r  进度: {completed}/{total} ({pct:.0f}%) ", end="", flush=True)
            return result

    results = await asyncio.gather(*[one(x) for x in items])
    print()
    return results


async def demo_progress():
    print("【6. 实战：批量处理 + 进度】\\n")
    items = list(range(20))
    results = await process_with_progress(items, concurrency=5)
    print(f"  完成: {len(results)} 个\\n")


# ===== 7. wait 的高级用法 =====
async def demo_wait():
    print("【7. asyncio.wait 的返回时机】\\n")
    tasks = [asyncio.create_task(fetch(i)) for i in range(3)]

    # 等所有完成
    done, pending = await asyncio.wait(tasks, return_when=asyncio.ALL_COMPLETED)
    print(f"  ALL_COMPLETED: done={len(done)}, pending={len(pending)}")
    print()


# ===== 主入口 =====
async def main():
    print("=" * 50)
    print("Python asyncio 教程 — 第十六章 demo")
    print("=" * 50 + "\\n")

    await demo_gather_map()
    await demo_bounded()
    await demo_as_completed()
    await demo_comprehension()
    await demo_to_thread()
    await demo_progress()
    await demo_wait()

    print("=" * 50)
    print("总结：")
    print('• gather(*[coro for x in items]) 是最常用 "map"')
    print("• Semaphore 限流版 map 防止并发过多")
    print("• as_completed 边完成边处理")
    print("• 异步推导式：[x async for x in async_gen]")
    print("• to_thread 把同步函数并发到线程")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
`,
  },

  // =========================================================
  // 第十七章：子进程：asyncio.create_subprocess_exec
  // =========================================================
  {
    id: "pa-17",
    group: "高级特性",
    icon: "🖥️",
    title: "子进程：asyncio.create_subprocess_exec",
    content: `## 一、asyncio 跑子进程

\`\`\`python
proc = await asyncio.create_subprocess_exec(
    "ls", "-la",
    stdout=asyncio.subprocess.PIPE,
)
stdout, stderr = await proc.communicate()
print(stdout.decode())
\`\`\`

## 二、create_subprocess_exec vs shell

\`\`\`python
# exec：参数列表，更安全
await asyncio.create_subprocess_exec("ls", "-la")

# shell：传字符串，**有命令注入风险**
await asyncio.create_subprocess_shell("ls -la")
\`\`\`

**推荐 exec**，不要用 shell。

## 三、communicate() 等待完成

\`\`\`python
proc = await asyncio.create_subprocess_exec(...)
stdout, stderr = await proc.communicate()
# 阻塞等待进程结束
# 返回 (stdout, stderr) bytes
\`\`\`

## 四、流式读取（实时输出）

\`\`\`python
proc = await asyncio.create_subprocess_exec(
    "tail", "-f", "log.txt",
    stdout=asyncio.subprocess.PIPE,
)
while True:
    line = await proc.stdout.readline()
    if not line:
        break
    print(line.decode().rstrip())
\`\`\`

## 五、process 的方法

\`\`\`python
proc.pid              # 进程 ID
proc.returncode       # 返回码（None = 还没结束）
proc.kill()           # 发 SIGKILL
proc.send_signal()    # 发信号
proc.terminate()      # 发 SIGTERM
proc.wait()           # 等待结束
\`\`\`

## 六、并发跑多个子进程

\`\`\`python
procs = await asyncio.gather(*[
    asyncio.create_subprocess_exec("command", str(i))
    for i in range(5)
])
\`\`\`

## 七、实战：并行 grep

\`\`\`python
async def grep(pattern, path):
    proc = await asyncio.create_subprocess_exec(
        "grep", pattern, path,
        stdout=asyncio.subprocess.PIPE,
    )
    stdout, _ = await proc.communicate()
    return stdout.decode()
\`\`\`

## 八、传 stdin 给子进程

\`\`\`python
proc = await asyncio.create_subprocess_exec(
    "cat",
    stdin=asyncio.subprocess.PIPE,
    stdout=asyncio.subprocess.PIPE,
)
stdout, _ = await proc.communicate(input=b"hello")
\`\`\`

## 九、子进程的限制

1. **不能用 interactive**：stdin 持续交互很麻烦
2. **必须用绝对路径**或保证 PATH 包含
3. **windows 下需要 shell=True** 或用列表
4. **杀进程不一定真死**：要传 signal group

## 十、本章 demo

下面 demo 演示子进程的常用操作。
`,
    code: `"""
第十七章 demo：asyncio 子进程
演示：
  1. create_subprocess_exec
  2. 传 stdin
  3. 流式读取
  4. 并发子进程
  5. 实战：批量 ping
"""

import asyncio
import time


# ===== 1. 基本子进程 =====
async def demo_basic():
    print("【1. create_subprocess_exec 基本用法】")
    proc = await asyncio.create_subprocess_exec(
        "python3", "-c", "print('hello from subprocess')",
        stdout=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()
    print(f"  返回码: {proc.returncode}")
    print(f"  输出: {stdout.decode().strip()!r}\\n")


# ===== 2. 传 stdin =====
async def demo_stdin():
    print("【2. 向子进程传 stdin】")
    proc = await asyncio.create_subprocess_exec(
        "python3", "-c", "data = input(); print('收到:', data.upper())",
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
    )
    stdout, _ = await proc.communicate(input=b"hello world")
    print(f"  输出: {stdout.decode().strip()!r}\\n")


# ===== 3. 错误处理 =====
async def demo_error():
    print("【3. 子进程错误处理】")
    proc = await asyncio.create_subprocess_exec(
        "python3", "-c", "import sys; sys.stderr.write('出错了\\n'); sys.exit(1)",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()
    print(f"  返回码: {proc.returncode}（0=成功）")
    print(f"  stdout: {stdout.decode().strip()!r}")
    print(f"  stderr: {stderr.decode().strip()!r}\\n")


# ===== 4. 并发子进程 =====
async def run_subprocess(i):
    """跑一个子进程"""
    proc = await asyncio.create_subprocess_exec(
        "python3", "-c", f"import time; time.sleep(0.2); print('task {i}')",
        stdout=asyncio.subprocess.PIPE,
    )
    stdout, _ = await proc.communicate()
    return stdout.decode().strip()


async def demo_concurrent():
    print("【4. 并发跑多个子进程】")
    start = time.time()
    results = await asyncio.gather(*[run_subprocess(i) for i in range(5)])
    elapsed = time.time() - start
    print(f"  5 个并发子进程: {results}")
    print(f"  耗时: {elapsed:.2f} 秒（≈0.2 而非 1.0）\\n")


# ===== 5. 超时杀死 =====
async def demo_timeout():
    print("【5. 子进程超时】\\n")
    try:
        proc = await asyncio.create_subprocess_exec(
            "python3", "-c", "import time; time.sleep(10)",
            stdout=asyncio.subprocess.PIPE,
        )
        await asyncio.wait_for(proc.communicate(), timeout=0.5)
    except asyncio.TimeoutError:
        print("  超时，杀掉子进程")
        proc.kill()
        await proc.wait()
        print(f"  返回码: {proc.returncode}（-9 表示被 SIGKILL）\\n")


# ===== 6. 实战：并行计算 =====
async def parallel_compute(items):
    """用子进程并行计算（每个进程一个任务）"""
    async def one(item):
        proc = await asyncio.create_subprocess_exec(
            "python3", "-c",
            f"import time; time.sleep(0.1); print({item} * 2)",
            stdout=asyncio.subprocess.PIPE,
        )
        stdout, _ = await proc.communicate()
        return int(stdout.decode().strip())

    return await asyncio.gather(*[one(x) for x in items])


async def demo_parallel():
    print("【6. 实战：子进程并行计算】")
    start = time.time()
    results = await parallel_compute(range(8))
    print(f"  结果: {results}")
    print(f"  耗时: {time.time()-start:.2f} 秒\\n")


# ===== 7. 流式输出（简化版） =====
async def demo_stream():
    print("【7. 流式读取输出】")
    proc = await asyncio.create_subprocess_exec(
        "python3", "-c",
        "import time; [print(f'line {i}'); time.sleep(0.05) for i in range(3)]",
        stdout=asyncio.subprocess.PIPE,
    )
    # 逐行读
    while True:
        line = await proc.stdout.readline()
        if not line:
            break
        print(f"  收到: {line.decode().rstrip()}")
    await proc.wait()
    print()


# ===== 主入口 =====
async def main():
    print("=" * 50)
    print("Python asyncio 教程 — 第十七章 demo")
    print("=" * 50 + "\\n")

    await demo_basic()
    await demo_stdin()
    await demo_error()
    await demo_concurrent()
    await demo_timeout()
    await demo_parallel()
    await demo_stream()

    print("=" * 50)
    print("总结：")
    print("• create_subprocess_exec 比 shell 安全")
    print("• communicate() 等待结束并收集输出")
    print("• readline() 流式读实时输出")
    print("• kill() / terminate() 杀进程")
    print("• 适合 CPU 密集任务（多进程）")
    print("=" * 50)


if __name__ == "__main__":
    # 确认在 Unix 系统
    import sys
    if sys.platform == "win32":
        print("注意：Windows 上需要用 list 形式的命令")

    asyncio.run(main())
`,
  },

  // =========================================================
  // 第十八章：信号处理：asyncio 优雅退出
  // =========================================================
  {
    id: "pa-18",
    group: "高级特性",
    icon: "🛑",
    title: "信号处理：asyncio 优雅退出",
    content: `## 一、为什么需要优雅退出？

服务器收到 Ctrl+C 或 SIGTERM 时，应该：
1. 停止接收新请求
2. 等正在处理的请求完成
3. 关闭连接
4. 释放资源
5. 退出

直接死掉（kill -9）会丢数据。

## 二、asyncio 处理信号

\`\`\`python
import asyncio
loop = asyncio.get_running_loop()
stop_event = asyncio.Event()

# 注册 SIGINT 处理（Ctrl+C）
loop.add_signal_handler(
    signal.SIGINT,
    stop_event.set,  # 收到信号时调用
)
\`\`\`

## 三、等待信号优雅退出

\`\`\`python
async def main():
    # 等 Ctrl+C
    await stop_event.wait()
    # 做清理
    print("正在清理...")
    await cleanup()
\`\`\`

## 四、长跑服务模式

\`\`\`python
async def serve(stop_event):
    while not stop_event.is_set():
        # 处理一个请求
        await handle_one_request()

async def main():
    stop = asyncio.Event()
    loop = asyncio.get_running_loop()
    loop.add_signal_handler(signal.SIGINT, stop.set)
    loop.add_signal_handler(signal.SIGTERM, stop.set)
    await serve(stop)
    print("退出")
\`\`\`

## 五、Windows 限制

\`asyncio.add_signal_handler\` 在 Windows 上**不工作**。

Windows 用：

\`\`\`python
try:
    await asyncio.sleep(3600)  # 阻塞
except KeyboardInterrupt:
    # Ctrl+C 触发
    pass
\`\`\`

## 六、asyncio.wait 配合 stop_event

\`\`\`python
async def main():
    stop = asyncio.Event()
    tasks = [asyncio.create_task(work()) for _ in range(5)]
    loop = asyncio.get_running_loop()
    loop.add_signal_handler(signal.SIGINT, stop.set)

    # 等停止信号
    await stop.wait()
    # 取消所有 task
    for t in tasks:
        t.cancel()
    # 等待清理
    await asyncio.gather(*tasks, return_exceptions=True)
\`\`\`

## 七、优雅超时的退出

\`\`\`python
async def main():
    stop = asyncio.Event()
    loop = asyncio.get_running_loop()
    loop.add_signal_handler(signal.SIGINT, stop.set)
    # 5 秒后强制退出
    try:
        await asyncio.wait_for(stop.wait(), timeout=5.0)
    except asyncio.TimeoutError:
        print("超时强制退出")
\`\`\`

## 八、实战：限时常驻服务

\`\`\`python
async def main():
    stop = asyncio.Event()
    loop = asyncio.get_running_loop()
    loop.add_signal_handler(signal.SIGINT, stop.set)
    loop.add_signal_handler(signal.SIGTERM, stop.set)

    # 每秒处理一个任务
    while not stop.is_set():
        try:
            await asyncio.wait_for(process_one(), timeout=1.0)
        except asyncio.TimeoutError:
            continue
    print("优雅退出")
\`\`\`

## 九、KeyboardInterrupt 处理

\`\`\`python
async def main():
    try:
        await long_running()
    except KeyboardInterrupt:
        # Ctrl+C 在 asyncio.run 中会变成这个
        await cleanup()
\`\`\`

## 十、本章 demo

下面 demo 演示信号处理和优雅退出。
`,
    code: `"""
第十八章 demo：信号处理与优雅退出
演示：
  1. 监听 SIGINT
  2. 优雅退出模式
  3. 取消所有任务
  4. 限时常驻服务
  5. 跨平台兼容
"""

import asyncio
import signal
import sys
import time


# ===== 1. 基本信号监听 =====
async def demo_signal():
    print("【1. 监听 SIGINT（Ctrl+C）】")
    print("  实际运行时按 Ctrl+C 测试\\n")
    stop = asyncio.Event()
    loop = asyncio.get_running_loop()
    try:
        loop.add_signal_handler(signal.SIGINT, stop.set)
    except NotImplementedError:
        print("  ⚠️  Windows 不支持 add_signal_handler\\n")
        return

    print("  等待 SIGINT（模拟 0.5 秒）...")
    # 实际运行时按 Ctrl+C 触发；这里用 sleep 模拟，避免阻塞等待真实信号
    await asyncio.sleep(0.5)
    print("  （模拟：超时未收到信号）\\n")


# ===== 2. 优雅退出服务 =====
async def worker(name, stop_event):
    """长跑 worker"""
    print(f"  [Worker {name}] 启动")
    while not stop_event.is_set():
        print(f"  [Worker {name}] 处理中...")
        try:
            await asyncio.wait_for(asyncio.sleep(0.3), timeout=0.3)
        except asyncio.TimeoutError:
            pass
    print(f"  [Worker {name}] 收到停止信号，退出")


async def demo_graceful():
    print("【2. 优雅退出多个 worker】")
    stop = asyncio.Event()
    loop = asyncio.get_running_loop()

    try:
        loop.add_signal_handler(signal.SIGUSR1, stop.set)
    except (NotImplementedError, AttributeError):
        print("  ⚠️  SIGUSR1 在此系统不可用")

    # 无论信号是否可用，都用 auto_stop 模拟停止，避免阻塞等待真实信号
    async def auto_stop():
        await asyncio.sleep(1.5)
        stop.set()
    asyncio.create_task(auto_stop())

    workers = [
        asyncio.create_task(worker(f"w{i}", stop))
        for i in range(3)
    ]

    # 模拟 SIGUSR1
    print("  模拟 1.5 秒后停止...")
    await stop.wait()
    print("\\n  停止信号收到，等待 worker 完成清理...")
    await asyncio.gather(*workers, return_exceptions=True)
    print("  全部退出\\n")


# ===== 3. 取消所有任务 =====
async def long_task(i):
    try:
        await asyncio.sleep(10)
    except asyncio.CancelledError:
        print(f"  Task {i} 被取消")
        raise


async def demo_cancel_all():
    print("【3. 优雅取消所有 task】")
    tasks = [asyncio.create_task(long_task(i)) for i in range(5)]
    await asyncio.sleep(0.3)

    # 模拟停止信号
    print("  模拟停止信号...")
    # 在 Windows 上不能用 add_signal_handler，用 sleep 模拟
    await asyncio.sleep(0.5)

    print("  取消所有 task...")
    for t in tasks:
        t.cancel()
    await asyncio.gather(*tasks, return_exceptions=True)
    print(f"  全部取消，剩余: {sum(1 for t in tasks if not t.done())}\\n")


# ===== 4. 限时常驻服务 =====
async def process_one():
    """模拟一个工作单元"""
    await asyncio.sleep(0.1)
    print("    • 处理完一个任务")


async def demo_limited_service():
    print("【4. 限时常驻服务（运行 2 秒）】")
    start = time.time()
    processed = 0
    while time.time() - start < 2.0:
        await process_one()
        processed += 1
    print(f"\\n  运行 2 秒，处理 {processed} 个任务")
    print(f"  优雅退出\\n")


# ===== 5. 跨平台 =====
async def demo_cross_platform():
    print("【5. 跨平台信号处理】\\n")
    if sys.platform == "win32":
        print("  Windows 方案：用 KeyboardInterrupt 捕获")
    else:
        print("  Unix 方案：用 loop.add_signal_handler")
    print()


# ===== 6. 实战：可中断的批处理 =====
async def interruptible_batch(items):
    """可中断的批处理：收到信号就停"""
    stop = asyncio.Event()
    loop = asyncio.get_running_loop()

    # 尝试注册信号
    sig_handled = False
    try:
        if sys.platform != "win32":
            loop.add_signal_handler(signal.SIGINT, stop.set)
            sig_handled = True
    except NotImplementedError:
        pass

    if not sig_handled:
        print("  （当前平台用超时模拟）")
        # 模拟停止
        async def auto_stop():
            await asyncio.sleep(1.0)
            stop.set()
        asyncio.create_task(auto_stop())

    results = []
    for i, item in enumerate(items):
        if stop.is_set():
            print(f"  收到停止信号，已处理 {i}/{len(items)}")
            break
        await asyncio.sleep(0.1)
        results.append(f"done-{item}")
        print(f"  处理 {item} ({i+1}/{len(items)})")

    return results


async def demo_interruptible():
    print("【6. 实战：可中断的批处理】\\n")
    results = await interruptible_batch(range(20))
    print(f"\\n  最终处理: {len(results)} 个\\n")


# ===== 主入口 =====
async def main():
    print("=" * 50)
    print("Python asyncio 教程 — 第十八章 demo")
    print("=" * 50 + "\\n")

    await demo_signal()
    await demo_graceful()
    await demo_cancel_all()
    await demo_limited_service()
    await demo_cross_platform()
    await demo_interruptible()

    print("=" * 50)
    print("总结：")
    print("• Unix 用 loop.add_signal_handler")
    print("• Windows 用 KeyboardInterrupt 或 try/except")
    print("• 优雅退出 = 等正在处理的 + 清理资源")
    print("• SIGINT=Ctrl+C, SIGTERM=kill")
    print("=" * 50)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\\n被 Ctrl+C 中断")
`,
  },

  // =========================================================
  // 第十九章：调试 asyncio 程序
  // =========================================================
  {
    id: "pa-19",
    group: "高级特性",
    icon: "🐛",
    title: "调试 asyncio 程序",
    content: `## 一、asyncio 的常见 bug

1. **忘记 await**：协程对象不是结果
2. **协程没被引用**：被 GC 回收
3. **同步阻塞调用**：卡住整个事件循环
4. **死锁**：lock 死等
5. **无限递归 await**

## 二、开启 debug 模式

\`\`\`python
asyncio.run(main(), debug=True)
\`\`\`

debug 模式会：
- 检测未等待的协程
- 报告执行慢的回调（>100ms）
- 警告未取消的 task

## 三、检测未 await 的协程

\`\`\`python
import asyncio
async def main():
    some_coro()  # 没 await
asyncio.run(main(), debug=True)
# RuntimeWarning: coroutine 'some_coro' was never awaited
\`\`\`

## 四、asyncio 的 3 个警告

1. **coroutine was never awaited**：协程没 await
2. **Task was destroyed but it is pending**：task 没 await 就被 GC
3. **Executing <Task> took too long**：回调慢

## 五、慢回调检测

\`\`\`python
import time
import asyncio

async def slow_callback():
    # 同步阻塞操作
    time.sleep(1)  # > 100ms 会被警告
asyncio.run(slow_callback(), debug=True)
\`\`\`

## 六、获取当前 task

\`\`\`python
import asyncio
task = asyncio.current_task()
print(f"当前 task: {task.get_name()}")
print(f"栈: {task.get_stack()}")
\`\`\`

## 七、asyncio.all_tasks

\`\`\`python
import asyncio
tasks = asyncio.all_tasks()
for t in tasks:
    print(f"{t.get_name()}: {t.done()}")
\`\`\`

## 八、pdb 调试

\`\`\`python
import pdb

async def main():
    # 在 async 里也可以用 pdb
    pdb.set_trace()
    await some_work()
\`\`\`

## 九、aiomonitor 第三方监控

\`\`\`python
# pip install aiomonitor
from aiomonitor import Monitor

async def main():
    with Monitor():
        await app.run()
# 启动后可用 telnet localhost 50101 监控
\`\`\`

## 十、5 个调试技巧

1. **永远开 debug 模式开发**
2. **给 task 命名**（\`create_task(coro, name=...\`））
3. **关键位置加 print**
4. **用 logging 替代 print**
5. **怀疑死锁时打栈**

## 十一、本章 demo

下面 demo 演示各种调试方法。
`,
    code: `"""
第十九章 demo：asyncio 调试
演示：
  1. debug 模式
  2. 检测未 await 的协程
  3. 慢回调检测
  4. 任务命名
  5. all_tasks 查看
  6. 获取栈
"""

import asyncio
import time
import warnings


# ===== 1. debug 模式 =====
def demo_debug_mode():
    print("【1. 启动时开 debug 模式】")
    print("  asyncio.run(main(), debug=True)")
    print("  作用: 检测未等待的协程、慢回调、警告\\n")


# ===== 2. 未 await 警告 =====
async def never_awaited():
    await asyncio.sleep(0.1)
    return "result"


async def demo_unawaited():
    print("【2. 检测未 await 的协程】")
    print("  ⚠️  协程被调用但没 await\\n")
    # 抑制警告以便继续
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        coro = never_awaited()  # 没 await
        # 模拟执行
        try:
            await asyncio.wait_for(coro, timeout=0.5)
        except asyncio.TimeoutError:
            pass
    print("  ✅ 实际开发中开启 debug=True 会立即警告\\n")


# ===== 3. 慢回调检测 =====
async def slow_callback():
    """模拟慢回调（同步阻塞）"""
    # 同步 sleep 阻塞事件循环
    time.sleep(0.15)  # > 100ms
    return "slow"


async def demo_slow():
    print("【3. 慢回调检测】")
    print("  同步阻塞 time.sleep(0.15) 超过 100ms 阈值\\n")
    result = await slow_callback()
    print(f"  结果: {result!r}")
    print(f"  （debug=True 模式下会有警告）\\n")


# ===== 4. 任务命名 =====
async def work(name, delay):
    print(f"  [{name}] 工作中")
    await asyncio.sleep(delay)
    return f"{name}_done"


async def demo_naming():
    print("【4. 任务命名（调试时很有用）】")
    t1 = asyncio.create_task(work("fetch_user", 0.2), name="fetch_user_task")
    t2 = asyncio.create_task(work("fetch_data", 0.1), name="fetch_data_task")
    print(f"  任务 1 名称: {t1.get_name()}")
    print(f"  任务 2 名称: {t2.get_name()}")
    await asyncio.gather(t1, t2)
    print()


# ===== 5. all_tasks =====
async def demo_all_tasks():
    print("【5. asyncio.all_tasks()】\\n")

    async def background():
        await asyncio.sleep(1.0)

    bg = asyncio.create_task(background(), name="background_task")
    print(f"  启动后台 task: {bg.get_name()}")
    await asyncio.sleep(0.1)
    # 列出所有 task
    tasks = asyncio.all_tasks()
    for t in tasks:
        print(f"    - {t.get_name()}, done={t.done()}")
    print(f"  共 {len(tasks)} 个 task\\n")
    await bg


# ===== 6. 获取当前 task 和栈 =====
async def deep_work(depth):
    if depth > 0:
        await deep_work(depth - 1)
    else:
        # 在最深处的协程里
        task = asyncio.current_task()
        print(f"  当前 task: {task.get_name()}")
        print(f"  调用栈深度: {len(task.get_stack())}")
        # 不打印栈（太长），只演示用法
        # for frame in task.get_stack():
        #     print(f"    {frame.f_code.co_name}")


async def demo_get_task():
    print("【6. current_task() 和 get_stack()】")
    await deep_work(3)
    print()


# ===== 7. 模拟死锁检测 =====
async def demo_deadlock_check():
    print("【7. 死锁检测思路】\\n")
    lock = asyncio.Lock()

    async def worker(name, hold_time):
        async with lock:
            print(f"  [{name}] 获锁")
            await asyncio.sleep(hold_time)
            print(f"  [{name}] 释放")

    # 短时间的锁，正常
    print("  --- 正常 ---")
    await asyncio.gather(worker("A", 0.1), worker("B", 0.2))
    print("  ✅ 正常结束\\n")

    # 演示：如果忘了释放会怎样
    print("  --- 模拟 lock 死等 ---")
    print("  在调试中，stack trace 能看到在哪里卡住\\n")


# ===== 8. 调试模板 =====
async def debug_template():
    """推荐的调试模板"""
    print("【8. 推荐的调试模板】\\n")
    code = """
import asyncio

async def main():
    # 业务代码
    ...

if __name__ == "__main__":
    # 开发时：debug=True
    asyncio.run(main(), debug=True)
    # 生产时：debug=False
    asyncio.run(main())
"""
    print(code)


# ===== 主入口 =====
async def main():
    print("=" * 50)
    print("Python asyncio 教程 — 第十九章 demo")
    print("=" * 50 + "\\n")

    demo_debug_mode()
    await demo_unawaited()
    await demo_slow()
    await demo_naming()
    await demo_all_tasks()
    await demo_get_task()
    await demo_deadlock_check()
    await debug_template()

    print("=" * 50)
    print("总结：")
    print("• 开发时用 debug=True")
    print("• 永远 await 协程")
    print("• 给 task 命名")
    print("• all_tasks() 查看所有任务")
    print("• 用 aiomonitor 监控生产")
    print("=" * 50)


if __name__ == "__main__":
    # 注释 debug=True 看你想要的效果
    try:
        asyncio.run(main(), debug=False)
    except RuntimeError as e:
        print(f"运行错误: {e}")
`,
  },
];
