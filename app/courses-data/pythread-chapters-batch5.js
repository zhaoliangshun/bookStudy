// =============================================================
// Python 线程与进程教程 - batch5
// 章节 39-48：asyncio 异步编程专题
// -------------------------------------------------------------
// 本批次聚焦 asyncio：协程、事件循环、Task、gather/wait、Queue、
// 同步原语、超时处理、与线程池协作、并发下载器实战、对比选型。
//
// 运行环境说明：
//   1. 在线运行通过 \`python3 -\`（stdin）执行，asyncio.run() 可正常工作。
//   2. 真实网络请求（aiohttp）在沙箱里通常不可用，demo 用 asyncio.sleep
//      模拟 IO 延迟，与真实 IO 代码结构完全一致。
//   3. 不要在顶层直接 await——必须用 asyncio.run() 包裹。
// =============================================================

export const chapters = [
  // -----------------------------------------------------------
  // 第 39 章：asyncio 入门——协程与事件循环
  // -----------------------------------------------------------
  {
    id: "pythread-39",
    group: "asyncio 异步编程",
    icon: "🌀",
    title: "asyncio 入门——协程与事件循环",
    content: `## asyncio 是什么

\`asyncio\` 是 Python 3.4 引入、3.5+ 正式稳定的标准库，用来写**单线程并发**代码。核心思想：

> **一个线程内，多个任务交替执行——遇到 IO 等待就切换到下一个，不浪费 CPU 时间。**

和 \`threading\` 的关键区别：

| 对比项 | threading | asyncio |
|--------|-----------|---------|
| 并发数 | 几十到几百 | 可以上万 |
| 切换成本 | OS 调度，较重 | 用户态切换，极轻 |
| 编程模型 | 函数被线程抢着跑 | 协程主动 \`await\` 让出 |
| GIL | 受限 | 单线程无 GIL 问题 |
| 心智负担 | 加锁防竞态 | 必须 async/await 全链路 |

## 三个核心概念

### 1. 协程（Coroutine）
用 \`async def\` 定义的函数。**调用它不会立即执行**，而是返回一个"协程对象"：

\`\`\`python
async def hello():       # 定义协程函数
    return "hi"

c = hello()              # 拿到协程对象，没执行
print(c)                 # <coroutine object hello at 0x...>
\`\`\`

要让协程真正跑起来，必须 \`await\` 它或交给事件循环调度。

### 2. 事件循环（Event Loop）
"调度中心"——不停轮询就绪的任务，执行它们，遇到 \`await\` 就挂起切到别的任务。\`asyncio.run()\` 会自动创建事件循环、跑完协程、关闭循环：

\`\`\`python
import asyncio

async def main():
    await hello()        # 在事件循环里 await 协程

asyncio.run(main())     # 启动循环，跑完 main 后关闭
\`\`\`

### 3. await
\`await\` 表示"等这个协程完成，期间把控制权让给事件循环"。**只能在 async 函数里用**。

\`\`\`python
async def work():
    await asyncio.sleep(1)   # 等 1 秒，期间循环可以跑别的任务
\`\`\`

## 同步 vs 异步：一张图看懂

\`\`\`
同步（threading 也能做，但要开线程）：
  任务A: [====sleep====] 任务B: [====sleep====]   总耗时 2s（如果串行）

异步（单线程 asyncio）：
  时间线：0s ----1s----2s
  任务A:  [====sleep====]               ← await 时让出
  任务B:         [====sleep====]        ← A 让出后立即开始
  ↑ 同一时刻只有一个在跑，但 sleep 时切走了
  ↑ 总耗时 1s（并发）
\`\`\`

## 第一个 asyncio 程序

\`\`\`python
import asyncio

async def say(name, delay):
    await asyncio.sleep(delay)        # 异步等待，不阻塞线程
    print(f"{name} 完成")

async def main():
    await say("A", 1)
    await say("B", 1)

asyncio.run(main())   # 总耗时约 2s（串行 await）
\`\`\`

注意：上面是**串行 await**，A 完了才 await B。要并发需要 \`create_task\`（下一章讲）。

## demo：感受 asyncio 的并发

下面 demo 对比"同步 sleep 串行"vs"asyncio 并发"，让你直观看到异步并发的提速效果。`,
    code: `# 第三十九章 demo：asyncio 入门——协程与事件循环
import asyncio                        # 异步编程标准库：提供协程、事件循环、Task、Queue 等
import time                           # 用于 time.sleep（阻塞等待）和 time.time()（计时）

# ============================================================
# 协程函数：async def 定义
# ============================================================
async def io_task(name, secs):
    """模拟 IO 任务：await asyncio.sleep 期间让出控制权
    真实场景里这里可能是：
      - await aiohttp.get(url)        # 异步 HTTP
      - await file.read()             # 异步文件 IO
      - await db.fetch(sql)           # 异步数据库
    """
    print(f"  [{name}] 开始，等待 {secs}s...")    # 进入协程时打印开始
    await asyncio.sleep(secs)          # 关键：异步等待，不阻塞线程——期间事件循环可跑别的协程
    print(f"  [{name}] 完成")                      # sleep 结束后协程恢复执行
    return name                                    # 协程可 return 值，通过 await 拿到

# ============================================================
# 实验1：同步串行（用 time.sleep 阻塞）
# ============================================================
print("=" * 55)
print("实验1：同步 sleep 串行（阻塞，总耗时=各任务之和）")
print("=" * 55)
start = time.time()                    # 记录开始时间，用于计算总耗时
time.sleep(0.5)                        # 任务A：阻塞整个线程 0.5 秒（期间什么都不能干）
time.sleep(0.5)                        # 任务B：必须等 A 跑完才开始，再阻塞 0.5 秒
print(f"  同步串行耗时: {time.time()-start:.3f}s\\n")   # 总耗时≈1.0s（0.5+0.5，串行）

# ============================================================
# 实验2：asyncio 串行 await（仍串行，但用 async sleep）
# ============================================================
async def serial_await():
    """两个 await 串行写——A 完了才 B，依然耗时 1s

    虽然用了 asyncio.sleep（非阻塞），但 await 是串行的：
    await io_task("A") 时 A 在 sleep，但没有别的 Task 被调度，
    循环就在干等 A 完成。等 A 完成后才 await B。
    """
    await io_task("A", 0.5)            # 先跑 A：必须等 A 完成才往下走
    await io_task("B", 0.5)            # 再跑 B：A 完成后才开始

print("=" * 55)
print("实验2：asyncio 串行 await（仍串行，演示 await 语法）")
print("=" * 55)
start = time.time()                    # 记录开始时间
asyncio.run(serial_await())            # 启动事件循环跑 serial_await，跑完自动关闭循环
print(f"  asyncio 串行耗时: {time.time()-start:.3f}s\\n")  # 总耗时≈1.0s（仍是串行）

# ============================================================
# 实验3：asyncio 并发（create_task 同时跑）
# ============================================================
async def concurrent():
    """create_task 把协程包装成 Task 同时调度

    事件循环调度原理：
    1. create_task 立即把协程注册到事件循环的就绪队列
    2. 事件循环取出第一个就绪的 Task（A）执行
    3. A 执行到 await asyncio.sleep(0.5) 时——sleep 向循环注册一个
       "0.5 秒后唤醒 A" 的回调，然后 A 让出控制权
    4. 循环立即取出下一个就绪的 Task（B）执行
    5. B 同样在 await sleep 时让出
    6. 0.5 秒后 A 和 B 的 sleep 回调触发，循环恢复它们
    → 总耗时 ≈ max(0.5, 0.5) = 0.5s，而非 0.5+0.5=1s
    """
    # create_task 把协程包装成 Task 并立即注册到事件循环
    # Task 一旦创建就开始跑，不需要 await 才启动
    t1 = asyncio.create_task(io_task("A", 0.5))   # 创建 Task A，立即开始调度
    t2 = asyncio.create_task(io_task("B", 0.5))   # 创建 Task B，立即开始调度
    # 此时 A、B 都已在事件循环里并发执行
    await t1                            # 等 A 完成（A 在 sleep 时 B 也在跑）
    await t2                            # 等 B 完成（B 可能已完成，这里立即返回）

print("=" * 55)
print("实验3：asyncio 并发 create_task（A B 同时跑）")
print("=" * 55)
start = time.time()                    # 记录开始时间
asyncio.run(concurrent())              # 启动事件循环跑 concurrent
print(f"  asyncio 并发耗时: {time.time()-start:.3f}s  ← 比串行快一倍")  # 总耗时≈0.5s

print("\\n要点：")
print("• async def 定义协程，调用它返回协程对象（不立即执行）")
print("• await 等待协程完成，只能在 async 函数里用")
print("• asyncio.run(coro) 启动事件循环，跑完关闭")
print("• 串行 await 不并发，create_task 才能并发（下一章详解）")
print("• asyncio.sleep 代替 time.sleep——前者让出，后者阻塞线程")`,
  },

  // -----------------------------------------------------------
  // 第 40 章：async/await 语法详解
  // -----------------------------------------------------------
  {
    id: "pythread-40",
    group: "asyncio 异步编程",
    icon: "📝",
    title: "async/await 语法详解",
    content: `## async def：定义协程函数

\`async def\` 定义的函数叫**协程函数**，调用它返回**协程对象**（不立即执行）：

\`\`\`python
async def add(a, b):
    return a + b

c = add(1, 2)        # 协程对象，没执行
result = await c     # 这时才真正跑
\`\`\`

## await：等待协程

\`await\` 做两件事：
1. 把控制权让给事件循环（让别的协程能跑）
2. 等被 await 的协程完成，拿到结果

\`\`\`python
async def fetch_data():
    await asyncio.sleep(0.5)   # 让出，等 0.5s
    return {"user": "tom"}

async def main():
    data = await fetch_data()   # 等 fetch_data 完成
    print(data)
\`\`\`

## await 只能在 async 函数里用

\`\`\`python
# ❌ 错：普通函数不能 await
def wrong():
    await asyncio.sleep(1)      # SyntaxError

# ✓ 对：必须是 async def
async def right():
    await asyncio.sleep(1)
\`\`\`

这就是为什么 asyncio 代码"全链路 async"——一个地方 await 就得是 async，调用它的也得是 async，层层向上直到 \`asyncio.run()\`。

## 协程函数 vs 协程对象

\`\`\`python
async def greet():           # 协程函数
    return "hi"

greet()                      # 协程对象（没执行）
await greet()                # 执行并等结果
\`\`\`

| 写法 | 结果 |
|------|------|
| \`greet\` | 函数对象本身 |
| \`greet()\` | 协程对象（未执行） |
| \`await greet()\` | 真正执行，返回结果 |

## await 链：协程调协程

协程内部 await 别的协程，形成调用链：

\`\`\`python
async def db_query(sql):
    await asyncio.sleep(0.1)
    return f"结果 of {sql}"

async def get_user(uid):
    return await db_query(f"SELECT * FROM users WHERE id={uid}")

async def main():
    user = await get_user(1)    # main → get_user → db_query
\`\`\`

## return / 异常

协程可以 \`return\` 值，也可以 raise 异常，都通过 \`await\` 拿到：

\`\`\`python
async def risky():
    if random.random() < 0.5:
        raise ValueError("失败")
    return "成功"

async def main():
    try:
        r = await risky()
    except ValueError as e:
        print(e)
\`\`\`

## 不能忘记 await

\`\`\`python
async def main():
    # ❌ 忘记 await，协程没执行，输出警告
    asyncio.sleep(1)
    # ✓
    await asyncio.sleep(1)
\`\`\`

Python 会警告 \`coroutine '...' was never awaited\`，**所有协程调用都必须 await 或包装成 Task**。

## demo：各种 async/await 用法

下面 demo 展示 await 链、协程对象、异常处理。`,
    code: `# 第四十章 demo：async/await 语法详解
import asyncio                        # 异步编程标准库：提供协程、事件循环、Task 等
import time                           # 用于 time.time() 计时

# ============================================================
# 协程函数：可以 return 值
# ============================================================
async def add(a, b):
    """最简单的协程：直接 return"""
    return a + b                       # 协程可 return 值，调用方通过 await 拿到

# ============================================================
# await 链：协程调协程
# ============================================================
async def db_query(sql, delay=0.2):
    """模拟数据库查询"""
    await asyncio.sleep(delay)         # 模拟查询耗时，期间让出控制权
    return f"⟨{sql}⟩ = 数据"            # 返回查询结果

async def get_user(uid):
    """调用 db_query——协程内部 await 别的协程"""
    sql = f"SELECT * FROM users WHERE id={uid}"   # 拼接 SQL 语句
    return await db_query(sql, 0.2)    # await 另一个协程，拿到结果后 return

async def main():
    # ---- 实验1：协程函数 vs 协程对象 ----
    print("=" * 55)
    print("实验1：协程函数 vs 协程对象 vs await")
    print("=" * 55)
    print(f"  add (函数本身): {add}")
    coro = add(1, 2)                   # 拿到协程对象（没执行）
    print(f"  add(1,2) (协程对象): {coro}")
    result = await coro                # 现在 await 才执行
    print(f"  await add(1,2): {result}")

    # ---- 实验2：await 链 ----
    print("\\n" + "=" * 55)
    print("实验2：协程调用链 main → get_user → db_query")
    print("=" * 55)
    start = time.time()                # 记录开始时间
    user = await get_user(42)          # await 链：main → get_user → db_query
    print(f"  结果: {user}")
    print(f"  耗时: {time.time()-start:.3f}s")    # 约 0.2s（db_query 的 sleep）

    # ---- 实验3：异常处理 ----
    print("\\n" + "=" * 55)
    print("实验3：协程里的异常通过 await 抛出")
    print("=" * 55)
    async def risky(fail):
        await asyncio.sleep(0.05)      # 模拟一点耗时
        if fail:
            raise ValueError("故意失败")  # 协程内 raise 异常
        return "OK"

    # 成功
    try:
        r = await risky(fail=False)    # await 拿到 return 值
        print(f"  成功: {r}")
    except ValueError as e:
        print(f"  异常: {e}")

    # 失败
    try:
        r = await risky(fail=True)     # await 时异常会被抛出
        print(f"  成功: {r}")
    except ValueError as e:
        print(f"  捕获异常: {e}")

    # ---- 实验4：忘记 await 的警告 ----
    print("\\n" + "=" * 55)
    print("实验4：忘记 await 会发生什么")
    print("=" * 55)
    # 调用但不 await——只是创建协程对象，没执行
    coro = asyncio.sleep(0.1)
    print(f"  没await时拿到: {coro}（没执行）")
    # 正确做法：await 它
    await coro                         # 现在 await 才真正执行
    print("  正确 await 后才执行完")

asyncio.run(main())

print("\\n要点：")
print("• async def 定义协程，调用返回协程对象（未执行）")
print("• await 真正执行协程并等待结果，只能用在 async 函数里")
print("• 协程可 return 值或 raise 异常，都通过 await 拿到")
print("• asyncio 代码必须全链路 async，直到 asyncio.run()")
print("• 忘记 await 会得到 RuntimeWarning: coroutine never awaited")`,
  },

  // -----------------------------------------------------------
  // 第 41 章：create_task 与并发执行
  // -----------------------------------------------------------
  {
    id: "pythread-41",
    group: "asyncio 异步编程",
    icon: "🚀",
    title: "create_task 与并发执行",
    content: `## 串行 await 的问题

\`\`\`python
async def main():
    await task_a()    # 跑完 A 才跑 B——串行
    await task_b()
\`\`\`

A 在 \`await asyncio.sleep\` 让出时，循环没事干——因为 B 还没被调度。总耗时 = A + B。

## create_task：把协程变成 Task 并发

\`asyncio.create_task(coro)\` 把协程**立刻注册到事件循环**，开始调度。返回一个 \`Task\` 对象，可以 await 拿结果：

\`\`\`python
async def main():
    ta = asyncio.create_task(task_a())   # 立刻开始跑 A
    tb = asyncio.create_task(task_b())   # 立刻开始跑 B
    # 此时 A、B 在事件循环里并发
    await ta                              # 等 A 结果
    await tb                              # 等 B 结果
\`\`\`

总耗时 ≈ \`max(A, B)\`，不是 A + B！

## 协程 vs Task 的区别

| 对象 | 何时执行 |
|------|---------|
| \`coro = async_fn()\` | 不执行，得 await 或 create_task |
| \`task = create_task(coro)\` | **立刻开始**，在事件循环里并发 |

\`\`\`python
# 协程：没 await 永远不跑
c = task_a()
# Task：已经开跑了，你不 await 它也在跑
t = asyncio.create_task(task_a())
\`\`\`

## Task 的常用方法

| 方法 | 作用 |
|------|------|
| \`await task\` | 等结果（拿到 return 值） |
| \`task.result()\` | 拿结果（已完成才行，否则异常） |
| \`task.done()\` | 是否完成 |
| \`task.cancel(msg)\` | 取消任务（在 await 处抛 CancelledError） |
| \`task.cancelled()\` | 是否被取消 |
| \`task.add_done_callback(fn)\` | 完成回调 |

## 任务取消：协作式

\`cancel()\` 不会强杀任务，而是在任务**下次 await 时**抛 \`CancelledError\`。任务可以选择捕获（不推荐）或让异常传播退出：

\`\`\`python
async def work():
    try:
        await asyncio.sleep(10)
    except asyncio.CancelledError:
        print("被取消，做点清理...")
        raise                          # 推荐：再抛出去让任务退出

t = asyncio.create_task(work())
await asyncio.sleep(0.1)
t.cancel()                            # 请求取消
try:
    await t
except asyncio.CancelledError:
    print("任务已取消")
\`\`\`

## TaskGroup（3.11+ 推荐）

Python 3.11 引入 \`asyncio.TaskGroup\`，是 \`create_task + gather\` 的现代替代品，更安全：

\`\`\`python
async def main():
    async with asyncio.TaskGroup() as tg:
        t1 = tg.create_task(task_a())      # 自动注册到组
        t2 = tg.create_task(task_b())
    # 退出 async with 块时自动 await 所有任务
    print(t1.result(), t2.result())
\`\`\`

**优势**：
- 任一任务抛异常，会自动取消其他任务（通过 \`ExceptionGroup\` 抛出）
- 退出 \`async with\` 块时自动等待所有任务完成
- 不用手动 gather，不会忘记 await

\`TaskGroup\` 是 3.11+ 推荐写法，3.10 及以下用 \`gather\`。

## demo：串行 await vs create_task 并发

下面 demo 对比两种写法的耗时差异，并演示任务取消。`,
    code: `# 第四十一章 demo：create_task 与并发执行
import asyncio                        # 异步编程标准库：提供协程、Task、事件循环等
import time                           # 用于 time.time() 计时

async def io_task(name, secs):
    """模拟 IO 任务：sleep 期间让出"""
    print(f"  [{name}] 开始 (等待 {secs}s)")   # 进入协程时打印
    await asyncio.sleep(secs)          # 异步等待——让出控制权，循环可跑别的 Task
    print(f"  [{name}] 完成")                      # sleep 结束后恢复
    return f"{name}结果"                            # return 值，通过 await task 拿到

# ============================================================
# 实验1：串行 await（不并发）
# ============================================================
async def serial():
    start = time.time()                # 记录开始时间
    r1 = await io_task("A", 0.5)       # 先跑 A：必须等 A 完成才往下走
    r2 = await io_task("B", 0.5)       # 再跑 B：A 完成后才开始
    r3 = await io_task("C", 0.5)       # 再跑 C：B 完成后才开始
    return time.time() - start         # 返回总耗时（约 1.5s）

# ============================================================
# 实验2：create_task 并发
# ============================================================
async def concurrent():
    start = time.time()                # 记录开始时间
    # create_task 把协程包装成 Task 并立即注册到事件循环
    # 三个 Task 在循环里并发执行——不是"同时"执行（单线程），
    # 而是在 await 让出点之间交替推进
    t1 = asyncio.create_task(io_task("A", 0.5))   # 创建 Task A，立即开始调度
    t2 = asyncio.create_task(io_task("B", 0.5))   # 创建 Task B，立即开始调度
    t3 = asyncio.create_task(io_task("C", 0.5))   # 创建 Task C，立即开始调度
    # await Task 拿结果——顺序不影响最终结果
    # 因为三个 Task 此刻都已注册，谁先完成谁先就绪
    r1 = await t1                      # 等 A 结果（此时 B、C 也在跑）
    r2 = await t2                      # 等 B 结果
    r3 = await t3                      # 等 C 结果
    return time.time() - start         # 返回总耗时（约 0.5s，并发）

async def main():
    print("=" * 55)
    print("实验1：串行 await（A 完了才 B）")
    print("=" * 55)
    t = await serial()
    print(f"  耗时: {t:.3f}s\\n")

    print("=" * 55)
    print("实验2：create_task 并发（A B C 同时跑）")
    print("=" * 55)
    t = await concurrent()
    print(f"  耗时: {t:.3f}s  ← 接近单任务耗时")

    # ---- 实验3：Task 的方法 ----
    print("\\n" + "=" * 55)
    print("实验3：Task 对象的方法")
    print("=" * 55)
    t = asyncio.create_task(io_task("D", 0.3))   # 创建 Task D
    print(f"  创建后 done={t.done()}")            # done() 检查是否完成（此时 False）
    result = await t                             # await 拿到结果
    print(f"  await 后 done={t.done()}, result={result}")  # done() 此时 True
    print(f"  再调 result(): {t.result()}")      # 已完成后可重复调用 result()

    # ---- 实验4：任务取消 ----
    print("\\n" + "=" * 55)
    print("实验4：cancel 取消任务（协作式）")
    print("=" * 55)
    async def long_work():
        try:
            print("  [long] 开始，将 sleep 5s")
            await asyncio.sleep(5)      # 在此 await 处会收到 CancelledError
            print("  [long] 完成（不应看到这行）")
        except asyncio.CancelledError:
            print("  [long] 收到 CancelledError，清理中...")
            raise                          # 推荐再抛出，让任务真正退出

    task = asyncio.create_task(long_work())  # 创建长任务
    await asyncio.sleep(0.2)              # 让它跑一会（进入 sleep 5s）
    task.cancel()                          # 请求取消：在下次 await 处抛 CancelledError
    try:
        await task                         # await 被取消的 task 会抛 CancelledError
    except asyncio.CancelledError:
        print(f"  外层捕获 CancelledError，done={task.done()}, cancelled={task.cancelled()}")

    # ---- 实验5：add_done_callback 回调 ----
    print("\\n" + "=" * 55)
    print("实验5：add_done_callback 完成回调")
    print("=" * 55)
    def on_done(task):
        try:
            print(f"  [回调] 完成，结果: {task.result()}")  # 任务成功时拿结果
        except Exception as e:
            print(f"  [回调] 失败: {e}")                   # 任务失败时拿异常

    t = asyncio.create_task(io_task("E", 0.2))   # 创建 Task E
    t.add_done_callback(on_done)                  # 注册完成回调（任务完成时在事件循环线程执行）
    await t                                       # 等 E 完成（回调会在 await 返回前后触发）

asyncio.run(main())

print("\\n要点：")
print("• 串行 await 不并发，create_task 把协程立刻调度才并发")
print("• Task 一旦创建就开始跑，不 await 也在跑")
print("• cancel() 协作式：下次 await 时抛 CancelledError")
print("• 被 cancel 的任务推荐 except + raise 让它真正退出")
print("• add_done_callback 在任务完成时触发（在事件循环线程）")`,
  },

  // -----------------------------------------------------------
  // 第 42 章：gather 与 wait
  // -----------------------------------------------------------
  {
    id: "pythread-42",
    group: "asyncio 异步编程",
    icon: "📦",
    title: "gather 与 wait——批量并发",
    content: `## 为什么要批量工具

上一章用多个 \`create_task + await\` 能并发，但任务多时写起来啰嗦。asyncio 提供两个批量并发的工具：

| 工具 | 返回 | 特点 |
|------|------|------|
| \`asyncio.gather(*coros)\` | 结果列表（按输入顺序） | 简单，最常用 |
| \`asyncio.wait(coros)\` | (done, pending) 两个集合 | 更灵活，可控制策略 |

## asyncio.gather

\`\`\`python
async def fetch(url):
    ...
    return data

async def main():
    # 同时发起 3 个请求
    results = await asyncio.gather(
        fetch("a"),
        fetch("b"),
        fetch("c"),
    )
    # results[0] = a 的结果，results[1] = b 的结果...
\`\`\`

结果顺序 = 输入顺序，**和完成顺序无关**——慢任务不阻塞快任务的结果位置。

## gather 的 return_exceptions

默认情况下，任一任务抛异常会让 gather 立即抛出（其他任务仍在跑但结果拿不到）。设 \`return_exceptions=True\` 后，异常会作为结果返回：

\`\`\`python
results = await asyncio.gather(
    fetch("ok"),
    fetch("fail"),
    return_exceptions=True,
)
# results[1] 是 Exception 对象，不是值
for r in results:
    if isinstance(r, Exception):
        print("失败", r)
    else:
        print("成功", r)
\`\`\`

## asyncio.wait

更底层，返回两个集合：

\`\`\`python
done, pending = await asyncio.wait(
    [fetch_a(), fetch_b(), fetch_c()],
    return_when=asyncio.FIRST_COMPLETED,   # 有一个完成就返回
    timeout=2,                               # 最多等 2 秒
)
for t in done:
    print(t.result())
# pending 里的任务还在跑，需要 cancel 或继续 await
\`\`\`

## return_when 策略

| 常量 | 含义 |
|------|------|
| \`asyncio.ALL_COMPLETED\`（默认） | 全部完成 |
| \`asyncio.FIRST_COMPLETED\` | 任一完成 |
| \`asyncio.FIRST_EXCEPTION\` | 任一抛异常（或全部完成） |

## gather vs wait 对比

| 对比 | gather | wait |
|------|--------|------|
| 返回 | 结果列表 | (done, pending) 任务集合 |
| 顺序 | 按输入顺序 | 无序 |
| 异常处理 | return_exceptions | 任务自己拿异常 |
| 灵活度 | 简单 | 可控制 return_when / timeout |
| 推荐场景 | 大多数批量并发 | 复杂等待策略 |

## demo：gather 与 wait

下面 demo 对比两种工具，演示顺序、异常处理、超时。`,
    code: `# 第四十二章 demo：gather 与 wait 批量并发
import asyncio                        # 异步编程标准库：提供 gather、wait、Task 等
import time                           # 用于 time.time() 计时

async def fetch(name, secs, fail=False):
    """模拟一个异步任务，secs 控制耗时，fail 控制是否失败"""
    print(f"  [{name}] 开始")          # 进入协程时打印
    await asyncio.sleep(secs)          # 模拟 IO 耗时，期间让出控制权
    if fail:
        raise ValueError(f"{name} 失败")   # 模拟失败：协程内 raise 异常
    print(f"  [{name}] 完成 (用时 {secs}s)")  # 成功完成时打印
    return f"{name}数据"                          # return 值

# ============================================================
# 实验1：gather 按输入顺序返回结果
# ============================================================
async def main():
    print("=" * 55)
    print("实验1：gather——结果按输入顺序（与完成顺序无关）")
    print("=" * 55)
    start = time.time()                # 记录开始时间
    # 输入顺序：最慢的在前，最快的在后
    # gather 会同时启动三个协程并发跑，但结果按输入顺序返回
    results = await asyncio.gather(
        fetch("慢C", 0.6),
        fetch("中B", 0.4),
        fetch("快A", 0.2),
    )
    print(f"  耗时 {time.time()-start:.3f}s")   # 约 0.6s（最慢的）
    print(f"  结果顺序: {results}  ← 仍是 [慢C, 中B, 快A]")
    print(f"  ↑ 慢C 在 [0] 位，但 A 先完成——gather 保证顺序\\n")

    # ---- 实验2：return_exceptions=True 不让一个失败拖垮全部 ----
    print("=" * 55)
    print("实验2：return_exceptions=True——失败作为结果返回")
    print("=" * 55)
    results = await asyncio.gather(
        fetch("ok1", 0.1),
        fetch("boom", 0.2, fail=True),
        fetch("ok2", 0.3),
        return_exceptions=True,         # 异常作为结果返回，不中断整体
    )
    for i, r in enumerate(results):
        if isinstance(r, Exception):    # 检查是否是异常对象
            print(f"  [{i}] 异常: {r}")
        else:
            print(f"  [{i}] 成功: {r}")
    print()

    # ---- 实验3：默认情况一个失败就抛 ----
    print("=" * 55)
    print("实验3：默认情况下一个失败 gather 就抛")
    print("=" * 55)
    try:
        await asyncio.gather(
            fetch("ok", 0.1),
            fetch("boom", 0.2, fail=True),
            fetch("ok2", 0.3),
        )
    except ValueError as e:
        print(f"  gather 抛出: {e}")
    # 重要：gather 抛异常后不会自动取消其他任务，ok2 仍在后台运行
    # 这里等一下让残留任务完成，避免其输出混入下一个实验
    await asyncio.sleep(0.25)
    print()

    # ---- 实验4：wait + FIRST_COMPLETED ----
    print("=" * 55)
    print("实验4：wait(FIRST_COMPLETED)——一个完成就返回")
    print("=" * 55)
    # 注意：3.8+ 建议传 Task（create_task 包装），直接传协程已废弃
    tasks = [asyncio.create_task(fetch(f"T{i}", 0.1 * i + 0.1)) for i in range(1, 4)]
    # FIRST_COMPLETED: 任一任务完成就返回，其余在 pending 里
    done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
    print(f"  完成 {len(done)} 个：")
    for t in done:
        print(f"    ✓ {t.result()}")     # 拿已完成任务的结果
    print(f"  未完成 {len(pending)} 个，继续等...")
    # 继续等剩下的
    done2, _ = await asyncio.wait(pending)   # 等剩余任务全部完成
    for t in done2:
        print(f"    ✓ {t.result()}")
    print()

    # ---- 实验5：wait + timeout ----
    print("=" * 55)
    print("实验5：wait(timeout)——超时返回，未完成的可取消")
    print("=" * 55)
    tasks = [asyncio.create_task(fetch(f"T{i}", 0.1 * (i + 1))) for i in range(5)]
    start = time.time()
    done, pending = await asyncio.wait(tasks, timeout=0.3)   # 最多等 0.3s
    print(f"  等 0.3s 后: 完成 {len(done)}，未完成 {len(pending)}")
    for t in done:
        print(f"    ✓ {t.result()}")     # 0.3s 内完成的任务
    # 取消未完成的
    for t in pending:
        t.cancel()                       # 请求取消未完成的任务
    # 等 cancel 生效
    await asyncio.wait(pending)          # 等待取消操作完成
    print(f"  已取消 {len(pending)} 个")

asyncio.run(main())

print("\\n要点：")
print("• gather 最常用，结果按输入顺序返回")
print("• return_exceptions=True 让异常作为结果返回，不中断整体")
print("• wait 返回 (done, pending)，更灵活")
print("• return_when: ALL_COMPLETED / FIRST_COMPLETED / FIRST_EXCEPTION")
print("• wait + timeout: 超时后 pending 的任务可 cancel 取消")`,
  },

  // -----------------------------------------------------------
  // 第 43 章：asyncio.sleep 与异步 IO 模拟
  // -----------------------------------------------------------
  {
    id: "pythread-43",
    group: "asyncio 异步编程",
    icon: "💤",
    title: "asyncio.sleep 与异步 IO 模拟",
    content: `## 为什么不用 time.sleep

\`time.sleep\` 是**阻塞**的——它把整个线程卡住，事件循环也跑不动。在 asyncio 代码里**绝对不要用 time.sleep**：

\`\`\`python
async def bad():
    time.sleep(1)             # ❌ 阻塞整个事件循环，所有协程都卡住

async def good():
    await asyncio.sleep(1)    # ✓ 让出控制权，循环去跑别的协程
\`\`\`

## asyncio.sleep 的原理

\`asyncio.sleep\` 不会真"睡"，而是：
1. 创建一个 future
2. 在事件循环里挂一个 "X 秒后完成这个 future" 的回调
3. await 这个 future——让出控制权

事件循环立即去跑别的就绪协程。等到 X 秒到了，future 完成，原来的协程恢复。

## 阻塞调用是 asyncio 的头号大忌

asyncio 是**单线程**的，一旦某个协程调用了阻塞函数（\`time.sleep\`、\`requests.get\`、\`open().read()\`、\`time.time()\` 短暂的可以），**所有协程都被卡住**。

| 阻塞调用 | asyncio 友好的替代 |
|---------|-------------------|
| \`time.sleep(n)\` | \`await asyncio.sleep(n)\` |
| \`requests.get(url)\` | \`await aiohttp.get(url)\` |
| \`open().read()\` | \`await aiofiles.open()\` |
| \`time.sleep + 计算\` | \`await asyncio.to_thread(函数)\` |

## 模拟真实 IO

在没法联网的环境里，用 \`asyncio.sleep\` 模拟网络/磁盘 IO 是**标准做法**。代码结构和真实版本**几乎一致**：

\`\`\`python
# 真实版本（需要 aiohttp）
async def fetch(session, url):
    async with session.get(url) as resp:
        return await resp.text()

# 模拟版本（无需联网）
async def fetch(url):
    await asyncio.sleep(0.5)        # 模拟网络延迟
    return f"内容 of {url}"
\`\`\`

只要把 sleep 换成真实 IO，剩下的并发逻辑**完全不用改**。

## 测量协程切换

下面 demo 用一个"边算边让出"的协程，让你看到事件循环如何切换：

\`\`\`python
async def mixed():
    for i in range(5):
        await asyncio.sleep(0)     # 0 秒也会让出，让循环调度别的
        print(i)
\`\`\`

\`await asyncio.sleep(0)\` 是个常用技巧——**主动让出一次**，让事件循环跑跑别的就绪任务。

## demo：阻塞 vs 非阻塞

下面 demo 对比 \`time.sleep\` 和 \`asyncio.sleep\` 在并发场景下的差异。`,
    code: `# 第四十三章 demo：asyncio.sleep 与异步 IO 模拟
import asyncio                        # 异步编程标准库：提供 asyncio.sleep（非阻塞等待）
import time                           # 用于 time.sleep（阻塞）和 time.time()（计时）

# ============================================================
# 实验1：阻塞调用卡住整个事件循环
# ============================================================
async def blocking_task():
    """模拟错误用法：time.sleep 阻塞循环"""
    print(f"  [阻塞任务] 开始 {time.strftime('%H:%M:%S')}")
    time.sleep(0.5)                       # ❌ 阻塞整个线程——事件循环和所有协程都卡住
    print(f"  [阻塞任务] 完成 {time.strftime('%H:%M:%S')}")

async def other_task():
    """另一个协程，本应能并发跑"""
    print(f"  [其他任务] 开始 {time.strftime('%H:%M:%S')}")
    await asyncio.sleep(0.1)              # 异步等待（但因为阻塞任务卡住循环，没法跑）
    print(f"  [其他任务] 完成 {time.strftime('%H:%M:%S')}")

async def main():
    print("=" * 55)
    print("实验1：错误用法——time.sleep 阻塞整个事件循环")
    print("=" * 55)
    start = time.time()
    # 同时启动阻塞任务和其他任务
    # 阻塞任务里 time.sleep(0.5) 卡住循环，其他任务根本没机会跑
    await asyncio.gather(blocking_task(), other_task())
    print(f"  总耗时 {time.time()-start:.3f}s")
    print("  ↑ 阻塞任务卡住时，其他任务只能干等\\n")

    # ---- 实验2：正确用法——asyncio.sleep 让出 ----
    print("=" * 55)
    print("实验2：正确用法——asyncio.sleep 让出控制权")
    print("=" * 55)

    async def async_task():
        print(f"  [异步任务] 开始 {time.strftime('%H:%M:%S')}")
        await asyncio.sleep(0.5)          # ✓ 让出，循环去跑别的协程
        print(f"  [异步任务] 完成 {time.strftime('%H:%M:%S')}")

    start = time.time()                  # 记录开始时间
    await asyncio.gather(async_task(), other_task())   # 两个任务并发跑
    print(f"  总耗时 {time.time()-start:.3f}s  ← 并发了")   # 约 0.5s（max(0.5, 0.1)）

    # ---- 实验3：模拟并发下载 ----
    print("\\n" + "=" * 55)
    print("实验3：模拟并发下载（asyncio.sleep 模拟网络）")
    print("=" * 55)

    async def download(url, secs):
        """模拟下载——真实版把 sleep 换成 aiohttp.get"""
        await asyncio.sleep(secs)         # 模拟网络延迟
        size = int(secs * 1000)           # 模拟下载内容大小
        return (url, size)

    urls = [f"http://example.com/{i}" for i in range(8)]   # 8 个 URL
    delays = [0.3, 0.5, 0.2, 0.4, 0.6, 0.3, 0.5, 0.4]      # 每个的耗时

    # 串行 await
    start = time.time()                  # 记录串行开始时间
    serial_results = []
    for url, d in zip(urls, delays):
        serial_results.append(await download(url, d))   # 一个下完才下下一个
    serial_t = time.time() - start
    print(f"  串行: {serial_t:.3f}s")    # 约 3.2s（所有延迟之和）

    # 并发 gather
    start = time.time()                  # 记录并发开始时间
    concurrent_results = await asyncio.gather(
        *[download(u, d) for u, d in zip(urls, delays)]   # 8 个同时发起
    )
    concurrent_t = time.time() - start
    print(f"  并发: {concurrent_t:.3f}s  (提速 {serial_t/concurrent_t:.1f}x)")   # 约 0.6s（最慢的）
    print(f"  结果数一致: {len(serial_results) == len(concurrent_results)}")

    # ---- 实验4：asyncio.sleep(0) 主动让出 ----
    print("\\n" + "=" * 55)
    print("实验4：asyncio.sleep(0) 主动让出一次")
    print("=" * 55)

    async def yielder(name):
        for i in range(3):
            print(f"  [{name}] 第 {i} 步，让出前")
            await asyncio.sleep(0)        # 0 秒也会让出一次——交还控制权给事件循环
            print(f"  [{name}] 第 {i} 步，让出后")   # 被循环重新调度后恢复
        return f"{name} 完成"

    # 两个 yielder 交替执行
    results = await asyncio.gather(yielder("A"), yielder("B"))   # A、B 交替输出
    print(f"  {results}")

asyncio.run(main())

print("\\n要点：")
print("• 绝不在 async 函数里用 time.sleep——会阻塞整个事件循环")
print("• 用 await asyncio.sleep 替代，让出期间循环跑别的协程")
print("• asyncio.sleep(0) 是主动让出一次的技巧")
print("• 模拟真实 IO：asyncio.sleep 代替网络/磁盘延迟")
print("• 真实场景：aiohttp 替代 requests，aiofiles 替代 open")`,
  },

  // -----------------------------------------------------------
  // 第 44 章：Queue 异步队列
  // -----------------------------------------------------------
  {
    id: "pythread-44",
    group: "asyncio 异步编程",
    icon: "📨",
    title: "asyncio.Queue 异步队列",
    content: `## 异步队列

\`asyncio.Queue\` 是 \`queue.Queue\` 的异步版——同样的生产者消费者模式，但 \`put/get\` 是 \`async\`：

\`\`\`python
import asyncio
q = asyncio.Queue(maxsize=10)

async def producer():
    await q.put(item)        # 满了就等
async def consumer():
    item = await q.get()    # 空了就等
\`\`\`

## 和 queue.Queue 的区别

| 对比 | queue.Queue | asyncio.Queue |
|------|-------------|---------------|
| put/get | 同步，阻塞线程 | async，等待时让出 |
| 用在 | threading 多线程 | asyncio 协程 |
| maxsize | 队列满时阻塞线程 | 队列满时挂起协程 |
| task_done/join | 有 | 有（用法一致） |

## 关键方法

| 方法 | 作用 |
|------|------|
| \`await q.put(item)\` | 入队（满了就等） |
| \`await q.get()\` | 出队（空了就等） |
| \`q.put_nowait(item)\` | 不等待，满了抛 QueueFull |
| \`q.get_nowait()\` | 不等待，空了抛 QueueEmpty |
| \`q.task_done()\` | 标记一个任务处理完 |
| \`await q.join()\` | 等所有 put 的项被 task_done |
| \`q.qsize()\` | 当前队列大小（不精确） |
| \`q.maxsize\` | 容量上限 |

## 生产者消费者模式

\`\`\`python
async def producer(q, n):
    for i in range(n):
        await asyncio.sleep(0.1)         # 模拟生产
        await q.put(f"产品{i}")
    await q.put(None)                    # 结束信号

async def consumer(q):
    while True:
        item = await q.get()
        if item is None:
            q.task_done()
            break
        await asyncio.sleep(0.2)         # 模拟处理
        q.task_done()

q = asyncio.Queue(maxsize=5)
await asyncio.gather(producer(q, 10), consumer(q))
\`\`\`

## 多生产者多消费者

协程天生轻量，开几十个生产者消费者没压力：

\`\`\`python
import asyncio
producers = [asyncio.create_task(producer(q, f"P{i}")) for i in range(3)]
consumers = [asyncio.create_task(consumer(q, f"C{i}")) for i in range(2)]
\`\`\`

## maxsize 控制反压

\`maxsize=10\` 让队列满了生产者就阻塞——这叫**反压（backpressure）**，防止生产太快消费者跟不上撑爆内存。

## demo：异步生产者消费者

下面 demo 实现多生产者多消费者，演示反压和优雅停止。`,
    code: `# 第四十四章 demo：asyncio.Queue 异步队列
import asyncio                        # 异步编程标准库：提供 Queue、Task 等
import random                         # 用于 random.uniform 生成随机耗时

# ============================================================
# 生产者：把产品放入队列
# 注意：Queue 通过参数传入，不能在模块级别创建——
#   asyncio.Queue() 会绑定创建时的事件循环，
#   模块级别创建时没有运行中的循环，会导致后续
#   "Future attached to a different loop" 错误。
# ============================================================
async def producer(q, name, count):
    for i in range(count):             # 生产 count 个产品
        secs = random.uniform(0.05, 0.2)     # 模拟生产耗时
        await asyncio.sleep(secs)      # 异步等待（让出期间消费者可消费）
        item = f"{name}-产品{i}"        # 构造产品名
        # 队列满时 put 会挂起等待——这就是反压（backpressure）
        # 生产者被自动降速，防止撑爆内存
        await q.put(item)              # 入队（满了就等消费者取走）
        print(f"  📤 [{name}] 生产 {item} (队列大小 {q.qsize()})")
    return name                        # 返回生产者名（表示完成）

# ============================================================
# 消费者：从队列取产品处理
# ============================================================
async def consumer(q, name):
    processed = 0                       # 记录本消费者处理了多少个
    while True:
        item = await q.get()            # 队列空时挂起等待（让出控制权）
        if item is None:               # None 是约定的结束信号
            q.task_done()               # 标记这个 None 也被处理（供 join 计数）
            print(f"  🛑 [{name}] 收到结束信号，退出 (处理了 {processed})")
            return (name, processed)    # 返回名字和处理数量
        secs = random.uniform(0.1, 0.3)     # 模拟处理耗时
        await asyncio.sleep(secs)      # 异步等待（让出期间生产者可生产）
        print(f"  📥 [{name}] 消费 {item}")
        processed += 1                  # 计数+1
        q.task_done()                   # 标记本项处理完，供 join 计数

# ============================================================
# 主流程
# ============================================================
async def main():
    # Queue 必须在事件循环内（async 函数里）创建，才能绑定正确的循环
    q = asyncio.Queue(maxsize=5)       # maxsize=5 控制反压：队列满时生产者等待

    print("=" * 55)
    print("异步生产者消费者（3 生产者 × 2 消费者）")
    print("=" * 55)
    random.seed(42)                    # 固定随机种子，保证每次运行结果可复现

    # 启动 3 个生产者，每个生产 4 个产品
    producers = [
        asyncio.create_task(producer(q, f"P{i}", 4))   # 每个生产者生产 4 个
        for i in range(3)
    ]
    # 启动 2 个消费者
    consumers = [
        asyncio.create_task(consumer(q, f"C{i}"))       # 消费者循环消费直到收到 None
        for i in range(2)
    ]

    # 等所有生产者完成
    await asyncio.gather(*producers)   # 3 个生产者都完成（共生产 12 个产品）
    print("\\n--- 所有生产者完成，发结束信号 ---")
    # 每个消费者发一个 None 结束信号（数量必须与消费者一致）
    for _ in consumers:
        await q.put(None)              # 发 2 个 None，每个消费者收到一个后退出

    # 等所有消费者退出（消费者收到 None 后才 return）
    consumer_results = await asyncio.gather(*consumers)
    # 此时所有 task_done 都已被调用，join 立即返回（保险写法）
    await q.join()                     # 等所有 put 的项被 task_done（这里立即返回）

    print("\\n--- 统计 ---")
    total_processed = sum(r[1] for r in consumer_results)   # 各消费者处理数之和
    print(f"  总生产: 12 (3 生产者 × 4)")
    print(f"  总消费: {total_processed}")
    for name, n in consumer_results:   # 逐个打印每个消费者的处理数
        print(f"    [{name}] 消费 {n}")

    # ---- 实验2：nowait 不等待版本 ----
    print("\\n" + "=" * 55)
    print("实验2：put_nowait / get_nowait 不等待")
    print("=" * 55)
    q2 = asyncio.Queue(maxsize=2)      # 容量 2
    # 没满可以 put_nowait
    q2.put_nowait("a")                 # 直接入队，不等（满了才抛异常）
    q2.put_nowait("b")                 # 再入队，此时满了
    print(f"  放入 a, b，qsize={q2.qsize()}")
    # 满了再 put_nowait 抛 QueueFull
    try:
        q2.put_nowait("c")             # 队列已满，抛 QueueFull
    except asyncio.QueueFull:
        print("  put_nowait('c') 抛 QueueFull（满了）")
    # 不空可以 get_nowait
    print(f"  get_nowait: {q2.get_nowait()}")   # 直接出队 'a'，不等
    # 空了再 get_nowait 抛 QueueEmpty
    try:
        q2.get_nowait()                # 出队 'b'（成功，剩空队列）
        q2.get_nowait()                # 队列空了，抛 QueueEmpty
    except asyncio.QueueEmpty:
        print("  get_nowait 抛 QueueEmpty（空了）")

asyncio.run(main())

print("\\n要点：")
print("• asyncio.Queue 用 await put/get，等待时让出")
print("• maxsize 控制反压，防止生产过快撑爆内存")
print("• None 作为结束信号通知消费者退出（每个消费者一个）")
print("• task_done + join 等所有任务处理完")
print("• put_nowait/get_nowait 不等待，满/空抛异常")`,
  },

  // -----------------------------------------------------------
  // 第 45 章：Lock / Semaphore / Event
  // -----------------------------------------------------------
  {
    id: "pythread-45",
    group: "asyncio 异步编程",
    icon: "🚦",
    title: "Lock / Semaphore / Event 同步原语",
    content: `## asyncio 的同步原语

asyncio 提供 \`Lock\`、\`Semaphore\`、\`Event\`、\`Condition\` 等，和 threading 同名，但 **API 是 async** 的：

\`\`\`python
async with lock:        # 不是 with lock，是 async with lock
    ...
await event.wait()      # 不是 event.wait()
\`\`\`

## 为什么单线程还要锁？

asyncio 单线程，但**协程切换点**仍可能让"读-改-写"被打断：

\`\`\`python
count = 0
async def inc():
    global count
    cur = count
    await asyncio.sleep(0)        # ← 这里可能切换到别的协程！
    count = cur + 1               # 用的是旧值
\`\`\`

如果中间有 \`await\`，竞态条件照样发生——需要 \`Lock\` 保护。

> **纯计算无 await 的代码不会被打断**——单线程里中间不会切换。只有 \`await\` 是切换点。

## asyncio.Lock

\`\`\`python
import asyncio
lock = asyncio.Lock()

async def safe_update():
    async with lock:               # async with！
        cur = count
        await asyncio.sleep(0)     # 锁内即使 await，别的协程也进不来
        count = cur + 1
\`\`\`

## asyncio.Semaphore——限并发

最常用！控制"同时只能有 N 个协程"做某事——比如限并发请求数：

\`\`\`python
import asyncio
sem = asyncio.Semaphore(10)        # 最多 10 个并发

async def fetch(url):
    async with sem:                # 第 11 个会等
        return await aiohttp.get(url)
\`\`\`

爬虫、API 调用必备——不限制会被服务器封 IP。

## asyncio.Event——通知

\`Event\` 用来"通知所有等待者"：

\`\`\`python
import asyncio
ready = asyncio.Event()

async def worker():
    await ready.wait()             # 等通知
    print("开始干活")

async def main():
    asyncio.create_task(worker())
    await asyncio.sleep(1)
    ready.set()                    # 通知所有等待者
\`\`\`

| 方法 | 作用 |
|------|------|
| \`await event.wait()\` | 等到 set |
| \`event.set()\` | 通知所有等待者 |
| \`event.clear()\` | 重置为未通知 |
| \`event.is_set()\` | 是否已通知 |

## asyncio.Condition

更强大——配合通知 + 锁，但 90% 场景 Event 就够了：

\`\`\`python
cond = asyncio.Condition()
async with cond:
    await cond.wait()              # 等通知（释放锁）
    # 醒来时已重新拿到锁
\`\`\`

## 注意：asyncio 同步原语不是线程安全的

\`asyncio.Lock\`、\`Semaphore\`、\`Event\` 等**只能在同一个事件循环内使用**，不能跨线程共享。如果需要跨线程通信，用 \`threading.Lock\` 或 \`asyncio.Queue\` 配合 \`run_in_executor\`。

\`\`\`python
# ❌ 错：在别的线程里用 asyncio.Lock
lock = asyncio.Lock()
def thread_func():
    async with lock:        # 出错——不在事件循环线程
        ...

# ✓ 对：跨线程用 threading.Lock，或用 asyncio.Queue 通信
\`\`\`

> asyncio 同步原语是为协程设计的，threading 同步原语是为线程设计的，**不要混用**。

## demo：限并发下载模拟

下面 demo 用 Semaphore 限制并发数，模拟"最多 3 个并发下载"。`,
    code: `# 第四十五章 demo：Lock / Semaphore / Event
import asyncio                        # 异步编程标准库：提供 Lock、Semaphore、Event 等
import time                           # 用于 time.time() 计时

# count 放模块级，供多个 task 通过 global 共享
# 注意：asyncio.Lock / Semaphore / Event 等同步原语不能放模块级——
#   它们会绑定创建时的事件循环，模块级别没有运行中的循环，
#   后续在 asyncio.run() 创建的新循环里使用会报
#   "Future attached to a different loop" 错误。
#   必须在 async 函数（事件循环内）里创建。
count = 0                              # 全局计数器，演示竞态条件

async def main():
    global count                    # 声明全局——否则下面 count=0 是局部变量，
                                    # 而 unsafe_task/safe_task 用 global 改的是模块级，
                                    # print 读到的会是 0（bug 修复）

    # Lock 必须在事件循环内创建
    lock = asyncio.Lock()           # 创建锁对象（绑定当前事件循环）

    print("=" * 55)
    print("实验1：协程竞态条件 vs Lock 保护")
    print("=" * 55)
    # 不加锁：100 个并发 task 各加 100 次
    count = 0
    async def unsafe_task():
        global count
        for _ in range(100):
            cur = count                # 读当前值
            await asyncio.sleep(0)     # ← 切换点！其他协程可能在此刻运行
            count = cur + 1            # 用的是旧值，覆盖了别人的写入
    # 100 个 task × 100 次 = 理论 10000，实际远小于（竞态丢失更新）
    tasks = [asyncio.create_task(unsafe_task()) for _ in range(100)]
    await asyncio.gather(*tasks)       # 等所有 task 完成
    print(f"  不加锁: 实际 {count} (期望 10000)")

    # 加锁版本：Lock 保证临界区内的"读-改-写"不被其他协程打断
    count = 0
    async def safe_task():
        global count
        for _ in range(100):
            async with lock:           # async with 获取锁（其他协程在此等待）
                cur = count
                await asyncio.sleep(0)  # 锁内即使 await，别的协程也进不来
                count = cur + 1        # 安全写入
    tasks = [asyncio.create_task(safe_task()) for _ in range(100)]
    await asyncio.gather(*tasks)
    print(f"  加 Lock: 实际 {count} (期望 10000) ✓\\n")

    # ---- 实验2：Semaphore 限并发 ----
    print("=" * 55)
    print("实验2：Semaphore 限制并发数为 3")
    print("=" * 55)

    sem = asyncio.Semaphore(3)          # 最多 3 个并发，第 4 个会等待

    current = 0                         # 当前并发数
    max_concurrent = 0                  # 历史最大并发
    counter_lock = asyncio.Lock()       # 保护 current 读-改-写的锁

    async def fetch(url):
        nonlocal current, max_concurrent   # 声明修改外层变量
        async with sem:                 # 超过 3 个时在此等待
            async with counter_lock:    # 用锁保护 current 的读-改-写
                current += 1
                if current > max_concurrent:
                    max_concurrent = current   # 记录历史最大并发
            print(f"  ▶ 下载 {url} (并发 {current})")
            await asyncio.sleep(0.3)     # 模拟下载
            async with counter_lock:
                current -= 1            # 下载完，并发数-1
            return url

    urls = [f"url{i}" for i in range(10)]   # 10 个 URL
    start = time.time()
    await asyncio.gather(*[fetch(u) for u in urls])   # 10 个任务并发（受 sem 限制为 3）
    print(f"  耗时 {time.time()-start:.3f}s, 最大并发 {max_concurrent} (限制=3)\\n")

    # ---- 实验3：Event 通知 ----
    print("=" * 55)
    print("实验3：Event 通知——多个 worker 等开始信号")
    print("=" * 55)

    ready = asyncio.Event()            # 创建事件对象（初始未通知）

    async def worker(name):
        print(f"  [{name}] 等待开始信号...")
        await ready.wait()              # 阻塞直到 set() 被调用（期间让出控制权）
        print(f"  [{name}] 收到信号，开始干活")

    workers = [asyncio.create_task(worker(f"W{i}")) for i in range(3)]
    await asyncio.sleep(0.2)            # 让它们都进入 wait 状态
    print("  >>> 主协程发出开始信号")
    ready.set()                          # 一次 set 唤醒所有等待者
    await asyncio.gather(*workers)       # 等所有 worker 完成

    # clear 后可以再用
    ready.clear()                        # 重置为未通知状态
    print("  Event 已 clear，可重复使用")

asyncio.run(main())

print("\\n要点：")
print("• 单线程里 await 是切换点——await 间的'读改写'会竞态")
print("• async with lock 保护临界区，锁内 await 不会被打断")
print("• Semaphore 限并发——爬虫/API 必备，防被封 IP")
print("• Event 通知多个等待者，set/clear 可重复使用")
print("• API 都是 async：async with、await wait()，不是同步版本")`,
  },

  // -----------------------------------------------------------
  // 第 46 章：as_completed 与超时处理
  // -----------------------------------------------------------
  {
    id: "pythread-46",
    group: "asyncio 异步编程",
    icon: "⏱️",
    title: "as_completed 与超时处理",
    content: `## asyncio.as_completed

和 \`concurrent.futures.as_completed\` 类似——**谁先完成谁先 yield**：

\`\`\`python
for coro in asyncio.as_completed([task_a(), task_b(), task_c()]):
    result = await coro
    print(f"完成: {result}")
\`\`\`

适合"结果逐个处理，谁快谁先"的场景。

## 超时控制：三种方式

### 方式1：asyncio.wait_for

\`\`\`python
try:
    result = await asyncio.wait_for(slow_task(), timeout=2)
except asyncio.TimeoutError:
    print("超时")
\`\`\`

超时会**取消任务**并抛 \`TimeoutError\`。最常用。

### 方式2：async with asyncio.timeout（3.11+）

\`\`\`python
try:
    async with asyncio.timeout(2):
        await slow_task()
except TimeoutError:
    print("超时")
\`\`\`

更现代的写法，作用域内所有 await 都受超时约束。

### 方式3：asyncio.wait + timeout

\`\`\`python
done, pending = await asyncio.wait(tasks, timeout=2)
for t in pending:
    t.cancel()             # 取消未完成的
\`\`\`

更灵活，能拿到"哪些完成了哪些没完成"。

## asyncio.shield——屏蔽取消

\`shield\` 保护一个任务**不被外层取消影响**：

\`\`\`python
try:
    await asyncio.wait_for(asyncio.shield(important_task()), timeout=1)
except asyncio.TimeoutError:
    print("外层超时，但任务在后台继续跑")
\`\`\`

注意：\`shield\` 只是让**外层的取消**传不进去，任务本身仍会跑完——但你拿不到结果。

## 任务取消的传播

\`\`\`python
task = asyncio.create_task(work())
await asyncio.sleep(0.1)
task.cancel()                # 请求取消
# 任务在下次 await 处抛 CancelledError
\`\`\`

如果 work 内部 await 了别的 task，**那些 task 也会被取消**（默认）。

## 实用模式：超时取消并返回已完成的结果

\`\`\`python
tasks = [asyncio.create_task(fetch(url)) for url in urls]
done, pending = await asyncio.wait(tasks, timeout=2)
for t in pending:
    t.cancel()
results = [t.result() for t in done if not t.cancelled()]
# results 是"2 秒内完成的"结果
\`\`\`

## demo：as_completed 与超时

下面 demo 演示谁先完成谁先返回、超时取消、shield 屏蔽。`,
    code: `# 第四十六章 demo：as_completed 与超时处理
import asyncio                        # 异步编程标准库：提供 as_completed、wait_for、timeout 等
import time                           # 用于 time.time() 计时

async def fetch(name, secs):
    """模拟一个任务，secs 控制耗时"""
    await asyncio.sleep(secs)          # 模拟 IO 耗时
    return f"{name}({secs}s)"          # 返回结果（含耗时信息）

# ============================================================
# 实验1：as_completed 谁先完成谁先返回
# ============================================================
async def main():
    print("=" * 55)
    print("实验1：as_completed 谁先完成谁先返回")
    print("=" * 55)
    # 不同耗时的任务，最慢的在前
    coros = [fetch("慢C", 0.6), fetch("快A", 0.2), fetch("中B", 0.4)]
    start = time.time()                # 记录开始时间
    # as_completed 返回迭代器，每个元素是协程
    for future in asyncio.as_completed(coros):
        result = await future          # 谁先完成谁先 yield 出来
        print(f"  ✓ {result} (时刻 {time.time()-start:.2f}s)")
    print()

    # ---- 实验2：wait_for 超时取消任务 ----
    print("=" * 55)
    print("实验2：wait_for 超时取消任务")
    print("=" * 55)

    async def slow():
        print("  开始执行（要 5 秒）")
        await asyncio.sleep(5)          # 模拟慢任务
        print("  完成（不应看到这行）")
        return "完成"

    start = time.time()
    try:
        await asyncio.wait_for(slow(), timeout=0.5)   # 最多等 0.5s，超时取消任务
    except asyncio.TimeoutError:       # 超时抛 TimeoutError（任务被取消）
        print(f"  超时！(在 {time.time()-start:.2f}s 抛 TimeoutError)")
    print()

    # ---- 实验3：timeout 上下文（3.11+ 推荐写法）----
    print("=" * 55)
    print("实验3：async with asyncio.timeout (3.11+)")
    print("=" * 55)
    start = time.time()
    try:
        # asyncio.timeout 是 3.11+ 新增的上下文管理器
        # 作用域内所有 await 都受超时约束，比 wait_for 更灵活
        # 3.10 及以下没有此 API，用 wait_for 替代演示相同效果
        if hasattr(asyncio, 'timeout'):
            async with asyncio.timeout(0.3):
                await asyncio.sleep(1)
        else:
            # 3.10 及以下等价写法：wait_for 包裹
            await asyncio.wait_for(asyncio.sleep(1), timeout=0.3)
    except (asyncio.TimeoutError, TimeoutError):
        # 3.11+ 中 asyncio.TimeoutError 已是内置 TimeoutError 的别名
        print(f"  timeout 上下文超时 ({time.time()-start:.2f}s)")
    print()

    # ---- 实验4：wait + timeout 拿已完成的结果 ----
    print("=" * 55)
    print("实验4：wait(timeout) 保留 2 秒内完成的结果")
    print("=" * 55)
    tasks = [
        asyncio.create_task(fetch(f"T{i}", 0.1 * i + 0.1))
        for i in range(8)               # 8 个任务，耗时 0.1~0.8s
    ]
    start = time.time()
    done, pending = await asyncio.wait(tasks, timeout=0.5)   # 最多等 0.5s
    print(f"  0.5s 内完成 {len(done)} 个:")
    for t in done:
        print(f"    ✓ {t.result()}")     # 已完成的任务结果
    print(f"  未完成 {len(pending)} 个，取消它们")
    for t in pending:
        t.cancel()                       # 取消未完成的任务
    await asyncio.wait(pending)          # 等 cancel 生效
    print()

    # ---- 实验5：shield 屏蔽外层取消 ----
    print("=" * 55)
    print("实验5：shield 让任务不被外层取消影响")
    print("=" * 55)

    shielded_result = None              # 用于存放被 shield 保护的任务结果

    async def important_work():
        """重要的任务，希望它跑完"""
        nonlocal shielded_result        # 声明修改外层变量
        await asyncio.sleep(0.5)        # 模拟耗时操作
        shielded_result = "重要数据"     # 写入结果
        return shielded_result

    async def outer():
        # wait_for 超时 0.2s，但 shield 让任务继续跑
        try:
            await asyncio.wait_for(asyncio.shield(important_work()), timeout=0.2)
        except asyncio.TimeoutError:
            print("  外层超时，但 shield 让任务继续在后台跑")

    await outer()                       # outer 在 0.2s 后超时返回
    # 等一会，让 shielded 任务跑完
    await asyncio.sleep(0.5)            # important_work 需要 0.5s，再等 0.5s 确保完成
    print(f"  shielded 任务的结果: {shielded_result}  (没被取消)")

asyncio.run(main())

print("\\n要点：")
print("• as_completed 谁先完成谁先返回，适合逐个处理")
print("• wait_for(timeout) 超时取消任务，最常用")
print("• async with asyncio.timeout 是 3.11+ 推荐写法，3.10- 用 wait_for")
print("• wait + timeout 能保留已完成的结果，取消未完成的")
print("• shield 让任务不被外层取消影响，仍在后台跑完")`,
  },

  // -----------------------------------------------------------
  // 第 47 章：run_in_executor / to_thread
  // -----------------------------------------------------------
  {
    id: "pythread-47",
    group: "asyncio 异步编程",
    icon: "🌉",
    title: "run_in_executor / to_thread——与同步代码协作",
    content: `## 问题：怎么在 asyncio 里调用阻塞函数

asyncio 是单线程，调一个阻塞函数（\`requests.get\`、\`time.sleep\`、CPU 密集计算）会卡住整个事件循环。

但现实里我们经常**必须用阻塞函数**——比如只有同步版的库（\`requests\`、\`open()\`、各种数据库驱动）。

## 解决：扔到线程池里跑

\`asyncio.run_in_executor\` 把阻塞函数扔到**线程池**里跑，async 这边 \`await\` 它——既不阻塞循环，又能用同步代码：

\`\`\`python
import requests
import asyncio
import time

def sync_fetch(url):
    """同步阻塞函数"""
    return requests.get(url).text

async def main():
    loop = asyncio.get_running_loop()
    # 扔到默认线程池跑 sync_fetch
    text = await loop.run_in_executor(None, sync_fetch, url)
\`\`\`

## asyncio.to_thread（3.9+，推荐）

\`to_thread\` 是 \`run_in_executor(None, ...)\` 的语法糖，更简洁：

\`\`\`python
text = await asyncio.to_thread(sync_fetch, url)
\`\`\`

等价于上面三行，但参数更直观。

## CPU 密集任务：扔到进程池

线程池跑 CPU 密集任务受 GIL 限制，应该用**进程池**：

\`\`\`python
from concurrent.futures import ProcessPoolExecutor

cpu_pool = ProcessPoolExecutor()

async def main():
    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(cpu_pool, cpu_heavy, data)
\`\`\`

## 三种调用对比

| 方式 | 用途 | 何时返回 |
|------|------|---------|
| \`await coro()\` | 调用协程 | 协程完成时 |
| \`await asyncio.to_thread(fn, *args)\` | 调用同步阻塞函数（IO） | 线程跑完时 |
| \`await loop.run_in_executor(cpu_pool, fn, *args)\` | 调用 CPU 密集函数 | 进程跑完时 |

## 真实场景

\`\`\`python
# 1. 在 asyncio 里用 requests（无 aiohttp 时）
async def fetch(url):
    return await asyncio.to_thread(requests.get, url, timeout=10)

# 2. 在 asyncio 里读大文件
async def read_big(path):
    return await asyncio.to_thread(open(path).read)

# 3. 在 asyncio 里跑 CPU 密集
async def process(data):
    return await loop.run_in_executor(cpu_pool, heavy_compute, data)
\`\`\`

## 注意事项

1. \`to_thread\` 的函数要**线程安全**——不要在里面用 asyncio 的对象（\`Task\`、\`Queue\` 等）
2. CPU 密集用进程池——线程池仍受 GIL 限制
3. 默认线程池大小 = \`min(32, cpu_count + 4)\`，足够大多数场景

## demo：to_thread / run_in_executor

下面 demo 在 asyncio 里调用阻塞函数和 CPU 密集任务。`,
    code: `# 第四十七章 demo：run_in_executor / to_thread
import asyncio                        # 异步编程标准库：提供 to_thread、run_in_executor 等
import time                           # 用于 time.sleep（阻塞）和 time.time()（计时）
import multiprocessing as mp          # 用于指定进程池启动方式（fork/spawn）
from concurrent.futures import ProcessPoolExecutor   # 进程池执行器
from functools import partial         # 用于 partial 创建带预设参数的可调用对象

# ============================================================
# 同步阻塞函数（不能await，会卡循环）
# ============================================================
def sync_sleep_task(name, secs):
    """模拟同步阻塞 IO——真实场景是 requests.get / open().read 等"""
    # 注意：这里用 time.sleep（阻塞），不是 asyncio.sleep
    time.sleep(secs)                   # 阻塞整个线程（在线程池里跑，不卡事件循环）
    return f"{name}结果"                # 返回结果

# ============================================================
# CPU 密集函数（线程池受 GIL，进程池才能真并行）
# ============================================================
def cpu_heavy(n):
    """CPU 密集：累加 n 次"""
    total = 0                          # 累加器
    for i in range(n):                 # 循环 n 次
        total += i                     # 累加
    return total                       # 返回总和

# ============================================================
# 进程池启动方式：macOS/Linux 默认 fork，Windows 只能 spawn
# fork 模式下子进程继承父进程内存（写时复制），启动快
# 这里显式指定 fork，避免 macOS 3.8+ 默认 spawn 导致的兼容问题
# ============================================================
ForkProcessPool = partial(ProcessPoolExecutor, mp_context=mp.get_context("fork"))

async def main():
    loop = asyncio.get_running_loop()  # 获取当前运行的事件循环

    # ---- 实验1：错误用法——直接调阻塞函数卡住循环 ----
    print("=" * 55)
    print("实验1：直接调阻塞函数（错误）会卡住循环")
    print("=" * 55)
    async def other():
        """另一个协程，看能否在阻塞任务卡住时跑"""
        print(f"  [其他] 开始 {time.strftime('%H:%M:%S')}")
        await asyncio.sleep(0.1)       # 异步等待（但因为循环被卡住，没法跑）
        print(f"  [其他] 完成 {time.strftime('%H:%M:%S')}")

    async def bad_call():
        print(f"  [阻塞] 开始 {time.strftime('%H:%M:%S')}")
        time.sleep(0.5)                      # ❌ 卡住整个循环（不应在 async 函数里用）
        print(f"  [阻塞] 完成 {time.strftime('%H:%M:%S')}")

    start = time.time()
    await asyncio.gather(bad_call(), other())   # bad_call 卡住时 other 没机会跑
    print(f"  耗时 {time.time()-start:.3f}s  ← other 被卡住，等阻塞跑完\\n")

    # ---- 实验2：to_thread 把阻塞函数扔到线程 ----
    print("=" * 55)
    print("实验2：to_thread 把阻塞函数扔到线程池")
    print("=" * 55)
    async def good_call():
        print(f"  [阻塞] 开始 {time.strftime('%H:%M:%S')}")
        # asyncio.to_thread (3.9+) 把同步函数扔到默认线程池跑，循环不卡
        # 等价于 loop.run_in_executor(None, sync_sleep_task, "T", 0.5)
        result = await asyncio.to_thread(sync_sleep_task, "T", 0.5)   # 阻塞函数在线程跑
        print(f"  [阻塞] 完成 {time.strftime('%H:%M:%S')} result={result}")

    start = time.time()
    await asyncio.gather(good_call(), other())   # good_call 在线程跑时 other 可并发
    print(f"  耗时 {time.time()-start:.3f}s  ← other 在阻塞期间并发跑\\n")

    # ---- 实验3：run_in_executor 等价写法 ----
    print("=" * 55)
    print("实验3：run_in_executor(None, fn, *args) 等价 to_thread")
    print("=" * 55)
    # None 表示用默认线程池
    result = await loop.run_in_executor(None, sync_sleep_task, "E", 0.3)   # 等价 to_thread
    print(f"  结果: {result}\\n")

    # ---- 实验4：CPU 密集任务——进程池绕开 GIL ----
    print("=" * 55)
    print("实验4：CPU 密集——进程池 vs 线程池")
    print("=" * 55)
    N = 2_000_000                     # 累加 200 万次

    # 4 个 CPU 任务
    async def cpu_with_pool(pool, name):
        start = time.time()            # 记录单任务开始时间
        result = await loop.run_in_executor(pool, cpu_heavy, N)   # 提交到线程/进程池
        return (name, result, time.time() - start)   # 返回名字、结果、耗时

    # 线程池（受 GIL，几乎串行）
    start = time.time()
    tasks = [cpu_with_pool(None, f"线程{i}") for i in range(4)]   # 4 个任务用默认线程池
    results = await asyncio.gather(*tasks)
    thread_t = time.time() - start
    print(f"  线程池: {thread_t:.3f}s")
    for name, r, t in results:
        print(f"    {name}: {t:.3f}s (sum={r})")

    # 进程池（真正并行）
    with ForkProcessPool(max_workers=4) as cpu_pool:   # 创建 4 进程的进程池
        start = time.time()
        tasks = [cpu_with_pool(cpu_pool, f"进程{i}") for i in range(4)]   # 4 个任务用进程池
        results = await asyncio.gather(*tasks)
        proc_t = time.time() - start
        print(f"  进程池: {proc_t:.3f}s  (提速 {thread_t/proc_t:.1f}x)")
        for name, r, t in results:
            print(f"    {name}: {t:.3f}s (sum={r})")

asyncio.run(main())

print("\\n要点：")
print("• asyncio 里调阻塞函数必须扔到线程池，否则卡住循环")
print("• asyncio.to_thread(fn, *args) 是 3.9+ 推荐写法")
print("• run_in_executor(None, fn, *args) 是底层等价写法")
print("• CPU 密集任务用进程池——线程池受 GIL 限制")
print("• 阻塞函数内部不能用 asyncio 对象（Task/Queue 等）")`,
  },

  // -----------------------------------------------------------
  // 第 48 章：实战——asyncio 并发下载器
  // -----------------------------------------------------------
  {
    id: "pythread-48",
    group: "asyncio 异步编程",
    icon: "🌐",
    title: "实战：asyncio 并发下载器与对比选型",
    content: `## 实战目标

实现一个完整的 asyncio 并发下载器，对比第 35 章的 \`ThreadPoolExecutor\` 版本，让你看到同样逻辑两种写法的差异。

## 关键设计点

1. **Semaphore 限并发**：和线程版 \`max_workers\` 等价
2. **gather 批量收集结果**：按输入顺序
3. **return_exceptions=True**：单个失败不影响其他
4. **进度反馈**：用回调或计数器
5. **异常隔离**：失败的任务不拖垮整体

## asyncio 版 vs 线程版

| 对比 | 线程版 | asyncio 版 |
|------|--------|------------|
| 函数定义 | \`def download(url)\` | \`async def download(url)\` |
| sleep | \`time.sleep\` | \`await asyncio.sleep\` |
| 限并发 | \`ThreadPoolExecutor(max_workers)\` | \`Semaphore(N)\` |
| 批量 | \`as_completed\` | \`asyncio.gather\` |
| 失败隔离 | \`try/except\` 在回调里 | \`return_exceptions=True\` |
| 调用 | \`ex.map(...)\` | \`await asyncio.gather(...)\` |

## 真实 asyncio 下载器（需要 aiohttp）

\`\`\`python
import aiohttp

async def download(session, url, sem):
    async with sem:
        async with session.get(url, timeout=10) as resp:
            return await resp.read()

async def main():
    sem = asyncio.Semaphore(8)
    async with aiohttp.ClientSession() as session:
        results = await asyncio.gather(
            *[download(session, url, sem) for url in urls]
        )
\`\`\`

把 \`aiohttp\` 部分换成 \`asyncio.sleep\` 就是本 demo 的模拟版。

## 何时用 asyncio，何时用 threading？

### 用 asyncio 更好
- **超高并发**：几千几万的并发连接（Web 服务器、爬虫）
- **大部分是 IO 等待**：网络、磁盘、数据库
- **想用 aiohttp/httpx/aiofiles 等异步库**
- **延迟敏感**：协程切换比线程快 10 倍以上

### 用 threading 更好
- **已有大量同步代码**：迁移成本高
- **依赖的库没有异步版**（如某些数据库驱动）
- **CPU 偶尔有计算**：threading 不强制 async/await 全链路
- **简单场景**：几条线程，不值得引入 asyncio

### 性能对比（参考）

| 指标 | threading | asyncio |
|------|-----------|---------|
| 100 并发 | 友好 | 友好 |
| 1000 并发 | 线程开销大 | 友好 |
| 10000 并发 | 资源耗尽 | 友好 |
| 100000 并发 | 不可能 | 友好（需调优） |

## demo：asyncio 并发下载器

下面 demo 实现完整的 asyncio 下载器，对比线程版本。`,
    code: `# 第四十八章 demo：asyncio 并发下载器 + 对比选型
import asyncio                        # 异步编程标准库：提供 gather、Semaphore 等
import time                           # 用于 time.sleep（阻塞）和 time.time()（计时）
import random                         # 用于 random.uniform 生成随机耗时
from concurrent.futures import ThreadPoolExecutor, as_completed   # 线程池（对比用）

# ============================================================
# asyncio 版下载器
# ============================================================
async def async_download(url, sem):
    """asyncio 版下载——真实场景把 sleep 换成 aiohttp.get"""
    async with sem:                                # 限并发：超过 workers 个时在此等待
        # 模拟下载耗时：0.3~0.8s
        secs = random.uniform(0.3, 0.8)
        await asyncio.sleep(secs)                  # 异步等待（让出期间其他任务可跑）
        # 模拟 10% 失败
        if random.random() < 0.1:
            raise ConnectionError(f"{url} 下载失败")   # 模拟失败
        size = int(secs * 1000)                    # 模拟文件大小
        return (url, size, secs)                   # 返回元组：(url, 大小, 耗时)

async def async_download_all(urls, workers):
    """asyncio 版批量下载，返回 (成功, 失败, 耗时)"""
    sem = asyncio.Semaphore(workers)               # 信号量限制并发数
    start = time.time()                            # 记录开始时间
    completed = 0                                  # 完成计数
    # return_exceptions=True 让异常作为结果返回
    results = await asyncio.gather(
        *[async_download(u, sem) for u in urls],   # 所有 URL 同时发起（受 sem 限制）
        return_exceptions=True                     # 异常不中断整体
    )
    successes, failures = [], []
    for u, r in zip(urls, results):                # URL 和结果一一对应
        if isinstance(r, Exception):               # 异常对象表示失败
            failures.append(u)
            print(f"  ✗ {u} {r}")
        else:
            successes.append(r)
            completed += 1
            print(f"  ✓ [{completed}/{len(urls)}] {r[0]} ({r[2]:.2f}s, {r[1]}B)")
    return successes, failures, time.time() - start

# ============================================================
# threading 版下载器（对比基准）
# ============================================================
def sync_download(url):
    """同步阻塞下载——time.sleep"""
    secs = random.uniform(0.3, 0.8)                # 模拟下载耗时
    time.sleep(secs)                               # 阻塞等待（在线程池里跑）
    if random.random() < 0.1:
        raise ConnectionError(f"{url} 下载失败")    # 模拟失败
    size = int(secs * 1000)                        # 模拟文件大小
    return (url, size, secs)                       # 返回元组

def sync_download_all(urls, workers):
    """ThreadPoolExecutor 版"""
    successes, failures = [], []
    completed = 0
    start = time.time()                            # 记录开始时间
    with ThreadPoolExecutor(max_workers=workers) as ex:   # 创建线程池
        future_to_url = {ex.submit(sync_download, u): u for u in urls}   # 提交所有任务
        for future in as_completed(future_to_url):   # 谁先完成谁先返回
            url = future_to_url[future]            # 找到对应的 URL
            try:
                r = future.result()                # 拿结果（可能抛异常）
                successes.append(r)
                completed += 1
                print(f"  ✓ [{completed}/{len(urls)}] {r[0]} ({r[2]:.2f}s, {r[1]}B)")
            except Exception as e:
                failures.append(url)
                print(f"  ✗ {url} {e}")
    return successes, failures, time.time() - start

# ============================================================
# 主流程
# ============================================================
async def main():
    random.seed(42)                    # 固定随机种子，保证结果可复现
    urls = [f"http://example.com/file_{i}.zip" for i in range(12)]   # 12 个 URL
    WORKERS = 4                        # 并发数/线程数

    print("=" * 55)
    print(f"asyncio 版下载器（{WORKERS} 并发）")
    print("=" * 55)
    random.seed(42)                    # 重置种子，确保和 threading 版用相同随机序列
    ok_a, fail_a, t_a = await async_download_all(urls, WORKERS)
    print(f"\\n  成功 {len(ok_a)}，失败 {len(fail_a)}，耗时 {t_a:.2f}s\\n")

    print("=" * 55)
    print(f"threading 版下载器（{WORKERS} 线程，对照）")
    print("=" * 55)
    random.seed(42)                    # 重置种子，确保和 asyncio 版用相同随机序列
    ok_t, fail_t, t_t = sync_download_all(urls, WORKERS)
    print(f"\\n  成功 {len(ok_t)}，失败 {len(fail_t)}，耗时 {t_t:.2f}s\\n")

    print("=" * 55)
    print("对比结论")
    print("=" * 55)
    print(f"  asyncio 版:   {t_a:.2f}s")
    print(f"  threading 版: {t_t:.2f}s")
    print(f"  两种方案结果一致，性能接近（IO 模拟场景）")
    print()
    print("  何时用 asyncio：")
    print("    • 超高并发（>1000）—— 协程比线程轻量得多")
    print("    • 已用 aiohttp/httpx 异步库")
    print("    • Web 服务器、爬虫等 IO 密集场景")
    print("  何时用 threading：")
    print("    • 已有大量同步代码（迁移成本高）")
    print("    • 依赖的库无异步版（如某些 DB 驱动）")
    print("    • 简单场景，不值得引入 asyncio 全链路")

asyncio.run(main())

print("\\n要点：")
print("• asyncio.gather + Semaphore = 并发 + 限流，结构最简洁")
print("• return_exceptions=True 隔离失败任务，不拖垮整体")
print("• 真实版把 asyncio.sleep 换成 aiohttp.get 即可")
print("• 低并发(<100)：threading 和 asyncio 性能接近")
print("• 高并发(>1000)：asyncio 优势明显（协程比线程轻量）")
print("• 选型看：并发量、库生态、代码迁移成本")`,
  },
];
