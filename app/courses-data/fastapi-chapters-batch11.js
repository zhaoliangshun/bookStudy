// =============================================================
// FastAPI 应用开发实战教程 - 第 11 批章节（异步编程 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fa-async-basic     : async/await 基础
//   fa-async-db        : 异步数据库
//   fa-httpx           : 异步 HTTP 客户端 httpx
//   fa-background-tasks: 后台任务 BackgroundTasks
// ============================================================

export const chapters = [
  // =========================================================
  // 第一章：async/await 基础
  // =========================================================
  {
    id: "fa-async-basic",
    group: "异步编程",
    icon: "⚡",
    title: "async/await 基础",
    content: `

# async/await 基础

## 一、为什么 FastAPI 离不开 async

FastAPI 的"高性能"招牌，本质来自两个字——**异步**。要把异步讲清楚，先从一个生活比喻开始。

**同步模型**：你（线程）去餐厅点单，点完站在收银台等菜，10 分钟菜好了端走。这 10 分钟你啥也不干，但收银台被你占着，下一个客人进不来。要同时服务 100 个客人，餐厅就得开 100 个收银台——内存爆炸。

**异步模型**：你点完单拿到一个取餐号（挂起协程），先回去干别的活；后厨做好菜按铃（I/O 完成事件），你听到铃再去端菜。一个收银台能"同时"服务几十个客人，因为你"等菜"的时间被拿去服务别人了。

\`\`\`txt filename="同步 vs 异步的本质区别"
同步：开始 I/O → 线程阻塞死等 → I/O 完成 → 处理下一个
       ↑ 等待期间线程占着不放，资源浪费

异步：开始 I/O → 协程挂起(交出 CPU) → 去跑别的协程 → I/O 完成唤醒 → 继续
       ↑ 等待期间让出 CPU 给其他任务，单线程扛高并发
\`\`\`

Web 应用 90% 的时间花在 **I/O 等待**上：等数据库、等外部 API、等磁盘、等 Redis。异步的杀手锏就是：**I/O 等待时不让线程干等，去服务别的请求**。这就是 FastAPI 用很少线程扛住高并发的秘密。

## 二、协程、事件循环、任务：三个核心概念

异步编程绕不开三个词，先理清楚它们的关系，否则后面写代码全是懵的。

**协程（Coroutine）**：用 \`async def\` 定义的函数。调用它不会立刻执行，而是返回一个"协程对象"——可以理解成"一份待执行的执行计划"。

**事件循环（Event Loop）**：异步的"心脏"。它是一个单线程的循环，不停地：① 找出哪些协程就绪了 → ② 跑它，跑到下一个 \`await\` 处挂起 → ③ 检查 I/O 事件 → 重复。所有协程都在这个循环里被调度。

**任务（Task）**：把协程"包装"一下，让事件循环能调度它。\`asyncio.create_task(coro)\` 就是把协程变成任务并丢进事件循环。

\`\`\`txt filename="三者的关系"
async def fetch():  ← 定义协程函数
    ...

coro = fetch()      ← 调用得到协程对象（还没跑）
task = asyncio.create_task(coro)  ← 包装成任务，立即开始调度
await task          ← 等它跑完，拿到结果

事件循环：负责在背后调度所有 task
\`\`\`

理解这三者的关系后，下面所有代码都是顺水推舟。

## 三、async def 与 await：第一个异步程序

\`\`\`python filename="协程基础：第一个异步程序"
# 导入 asyncio 模块（Python 内置的异步库）
import asyncio

# async def 定义协程函数 fetch_data
# 注意：调用它不会立刻执行，而是返回协程对象
async def fetch_data():
    # 打印开始信息
    print("开始抓取数据")
    # await asyncio.sleep(1)：模拟 1 秒的异步 I/O
    # await 的语义：暂停当前协程，把 CPU 让给事件循环
    # 1 秒后事件循环唤醒本协程，继续往下执行
    await asyncio.sleep(1)
    # 打印完成信息
    print("抓取完成")
    # 返回结果
    return {"data": 42}

# 直接调用协程函数，不会执行！只返回协程对象
coro = fetch_data()
print(coro)  # 输出：<coroutine object fetch_data at 0x...>

# 必须用事件循环来跑协程
# asyncio.run() 做了三件事：
#   1. 创建一个新的事件循环
#   2. 把传入的协程跑完
#   3. 关闭事件循环
result = asyncio.run(fetch_data())
print(result)  # 输出：{'data': 42}
\`\`\`

### 两个关键字的精确语义

- **\`async def\`**：声明"这是个协程函数"。函数体内可以出现 \`await\`。调用它返回的是协程对象，**不是执行结果**。
- **\`await\`**：只能在 \`async def\` 内部使用。它的语义是"暂停当前协程，等待后面的异步操作完成；暂停期间让出 CPU，事件循环去跑别的就绪协程"。

> **\`await\` 不是"让程序变快"，而是"让程序在等待时不闲着"**。单个请求的耗时不一定会变短，但系统能同时处理更多请求，**吞吐量**显著提升。

### 常见错误 1：忘记 await

\`\`\`python filename="忘记 await 的坑"
import asyncio

async def slow_op():
    await asyncio.sleep(1)
    return "done"

async def main():
    # ❌ 错误：忘记 await，result 是协程对象，不是 "done"
    result = slow_op()
    print(result)  # <coroutine object slow_op at 0x...>
    # 而且会有 RuntimeWarning: coroutine was never awaited

    # ✅ 正确：加 await
    result = await slow_op()
    print(result)  # done

asyncio.run(main())
\`\`\`

Python 会在控制台报警告 \`coroutine 'xxx' was never awaited\`，看到这个警告就是漏了 \`await\`。

### 常见错误 2：在普通函数里用 await

\`\`\`python filename="await 必须在 async 函数内"
import asyncio

async def slow_op():
    await asyncio.sleep(1)

# ❌ 错误：普通 def 里不能用 await
def bad():
    await slow_op()  # SyntaxError: 'await' outside async function

# ✅ 正确：async def 里才能用 await
async def good():
    await slow_op()
\`\`\`

## 四、asyncio.create_task：并发执行

如果两个协程有 \`await\`，顺序 \`await\` 它们是**串行**的（总耗时 = 两者之和）。要并发，必须用 \`create_task\` 把它们包装成任务。

\`\`\`python filename="串行 vs 并发对比"
import asyncio
import time

async def fetch_user():
    # 模拟 1 秒的数据库查询
    await asyncio.sleep(1)
    return {"user": "Alice"}

async def fetch_orders():
    # 模拟 2 秒的数据库查询
    await asyncio.sleep(2)
    return [{"order": 1}, {"order": 2}]

async def serial():
    # ❌ 串行：先等 user 再等 orders，总耗时 1 + 2 = 3 秒
    start = time.time()
    user = await fetch_user()
    orders = await fetch_orders()
    print(f"串行耗时: {time.time() - start:.2f}s")  # 3.00s
    return {"user": user, "orders": orders}

async def concurrent():
    # ✅ 并发：两个任务同时开始，总耗时 = max(1, 2) = 2 秒
    start = time.time()
    # create_task 立即把协程丢进事件循环开始调度
    task1 = asyncio.create_task(fetch_user())
    task2 = asyncio.create_task(fetch_orders())
    # 两个 await 等的是已经在跑的任务，谁先完成谁先返回
    user = await task1
    orders = await task2
    print(f"并发耗时: {time.time() - start:.2f}s")  # 2.00s
    return {"user": user, "orders": orders}

async def main():
    await serial()
    await concurrent()

asyncio.run(main())
\`\`\`

**怎么想**：\`create_task\` 的核心价值是"提前排队"。一旦 \`create_task\` 调用，协程就进入事件循环开始跑，不用等 \`await\`。然后 \`await task\` 只是"等它跑完拿结果"。如果两个 \`create_task\` 之间没有别的 \`await\`，它们就并发执行了。

### 常见错误 3：create_task 后立刻 await

\`\`\`python filename="错误的并发写法"
import asyncio

async def op(n):
    await asyncio.sleep(1)
    return n * 2

async def bad():
    # ❌ 这样写还是串行！因为 create_task 后立刻 await，等于没并发
    a = await asyncio.create_task(op(1))  # 等 1 秒
    b = await asyncio.create_task(op(2))  # 再等 1 秒
    # 总耗时 2 秒

async def good():
    # ✅ 先 create_task 两个任务，再一起 await
    t1 = asyncio.create_task(op(1))
    t2 = asyncio.create_task(op(2))
    a = await t1
    b = await t2
    # 总耗时 1 秒（并发）
\`\`\`

**口诀**：先 \`create_task\` 把所有任务排队，再统一 \`await\` 拿结果，才能并发。

## 五、asyncio.gather：批量并发神器

\`gather\` 是最常用的批量并发工具，把多个协程打包成一个，等所有完成。

\`\`\`python filename="gather 批量并发"
import asyncio
import time

async def fetch(url, delay):
    # 模拟请求 url，耗时 delay 秒
    await asyncio.sleep(delay)
    return f"{url} 的结果（{delay}s）"

async def main():
    start = time.time()
    # gather 接收多个协程，返回它们的结果列表（顺序与传入顺序一致）
    results = await asyncio.gather(
        fetch("api-1", 1),
        fetch("api-2", 2),
        fetch("api-3", 1),
    )
    # 总耗时 = max(1, 2, 1) = 2 秒（并发）
    print(f"耗时: {time.time() - start:.2f}s")  # 2.00s
    print(results)
    # ['api-1 的结果（1s）', 'api-2 的结果（2s）', 'api-3 的结果（1s）']

asyncio.run(main())
\`\`\`

### gather 的异常处理

\`gather\` 默认行为：任意一个协程抛异常，整个 gather 立刻抛出，其他协程**不会被取消**（继续跑但结果丢弃）。要改这个行为，用 \`return_exceptions=True\`。

\`\`\`python filename="gather 异常处理"
import asyncio

async def good():
    await asyncio.sleep(1)
    return "成功"

async def bad():
    await asyncio.sleep(0.5)
    raise ValueError("故意失败")

async def main():
    # 默认：遇到异常立刻抛出
    try:
        await asyncio.gather(good(), bad())
    except ValueError as e:
        print(f"捕获异常: {e}")  # 捕获异常: 故意失败

    # return_exceptions=True：异常不抛出，作为结果返回
    results = await asyncio.gather(good(), bad(), return_exceptions=True)
    print(results)
    # ['成功', ValueError('故意失败')]
    # 可以遍历 results 判断每个任务是成功还是异常
    for r in results:
        if isinstance(r, Exception):
            print(f"任务失败: {r}")
        else:
            print(f"任务成功: {r}")

asyncio.run(main())
\`\`\`

**实战建议**：调用多个外部 API 时，用 \`return_exceptions=True\`，避免一个 API 挂了导致整个请求失败。然后逐个判断结果，失败的降级处理。

## 六、asyncio.wait 与 as_completed

\`gather\` 是"等所有完成"。但有时你需要"谁先完成先处理谁"，这时用 \`as_completed\`。

\`\`\`python filename="as_completed：先到先处理"
import asyncio
import random

async def fetch(url):
    # 随机耗时 1-5 秒，模拟网络抖动
    delay = random.randint(1, 5)
    await asyncio.sleep(delay)
    return f"{url}（{delay}s）"

async def main():
    # 创建多个协程（注意：as_completed 接收协程列表，不是 Task）
    coros = [fetch(f"api-{i}") for i in range(5)]
    # as_completed 返回一个迭代器，谁先完成谁先 yield
    for future in asyncio.as_completed(coros):
        # await 拿到最先完成的结果
        result = await future
        print(f"收到: {result}")
    # 输出顺序是按完成时间，不是按提交顺序

asyncio.run(main())
\`\`\`

\`asyncio.wait\` 更底层，可以设置 \`return_when\` 参数：

\`\`\`python filename="asyncio.wait 的灵活控制"
import asyncio

async def fetch(url, delay):
    await asyncio.sleep(delay)
    return url

async def main():
    # wait 返回两个集合：done（完成的）和 pending（未完成的）
    done, pending = await asyncio.wait(
        [fetch("a", 1), fetch("b", 2), fetch("c", 3)],
        return_when=asyncio.FIRST_COMPLETED  # 第一个完成就返回
    )
    print(f"完成数: {len(done)}")  # 1
    print(f"未完成数: {len(pending)}")  # 2
    # 拿到第一个完成的结果
    for task in done:
        print(f"第一个完成: {task.result()}")
    # 取消未完成的任务（避免悬挂）
    for task in pending:
        task.cancel()

asyncio.run(main())
\`\`\`

**怎么选**：
- \`gather\`：等所有完成，要所有结果 → 90% 场景用这个
- \`as_completed\`：先到先处理（流式）→ 比如多源数据聚合，谁快用谁
- \`wait\`：要精细控制（第一个完成就返回、超时控制）→ 复杂场景

## 七、async with：异步上下文管理器

数据库连接、HTTP 客户端这类资源，需要"用完释放"。同步代码用 \`with\`，异步代码用 \`async with\`。

\`\`\`python filename="自定义异步上下文管理器"
import asyncio

# 定义异步上下文管理器类
class AsyncDBConnection:
    async def __aenter__(self):
        # 进入 with 块时调用，相当于 __enter__ 的异步版
        print("建立数据库连接...")
        await asyncio.sleep(0.5)  # 模拟异步建连
        return self  # 返回 self，作为 as 后面的变量

    async def __aexit__(self, exc_type, exc, tb):
        # 离开 with 块时调用，无论是否异常
        print("关闭数据库连接...")
        await asyncio.sleep(0.2)  # 模拟异步关闭
        # 返回 False 表示不吞异常（默认行为）

    async def query(self, sql):
        await asyncio.sleep(0.3)
        return f"结果: {sql}"

async def main():
    # async with 自动管理资源的获取和释放
    async with AsyncDBConnection() as db:
        # 在 with 块内，db 是 __aenter__ 返回的 self
        result = await db.query("SELECT 1")
        print(result)
    # 离开 with 块后，__aexit__ 被调用，连接自动关闭

asyncio.run(main())
\`\`\`

**为什么需要 \`async with\`**：因为 \`__enter__\` 和 \`__exit__\` 是同步的，里面如果有 I/O 操作（比如关闭连接需要发网络包），会阻塞事件循环。 \`async with\` 的 \`__aenter__\` 和 \`__aexit__\` 可以 \`await\`，I/O 不阻塞。

后面章节的 \`httpx.AsyncClient\`、\`AsyncSession\` 都要用 \`async with\`。

## 八、async for：异步迭代器

异步生成器（\`async def\` + \`yield\`）产出数据需要 \`async for\` 来遍历，常用于流式处理。

\`\`\`python filename="异步生成器与 async for"
import asyncio

# 异步生成器：逐个产出数据
async def stream_lines():
    # 模拟从文件或网络流式读取
    for i in range(5):
        await asyncio.sleep(0.3)  # 模拟 I/O
        yield f"第 {i+1} 行"  # yield 产出

async def main():
    # async for 遍历异步生成器
    async for line in stream_lines():
        print(f"处理: {line}")
    # 输出：
    # 处理: 第 1 行
    # 处理: 第 2 行
    # ...

asyncio.run(main())
\`\`\`

应用场景：数据库大结果集分批读取、WebSocket 消息流、SSE 事件流。

## 九、阻塞调用的危害：async 的头号杀手

**最关键的坑**：在 \`async def\` 里调用同步阻塞函数（\`time.sleep\`、\`requests.get\`、同步数据库驱动），会**卡死整个事件循环**，所有协程都停不下来。

\`\`\`python filename="阻塞调用的危害"
import asyncio
import time

async def blocking_task():
    # ❌ 灾难：time.sleep 是同步阻塞，卡住整个事件循环 3 秒
    time.sleep(3)
    return "完成"

async def quick_task():
    # 这个协程本来应该 0.1 秒完成
    await asyncio.sleep(0.1)
    print("quick 完成")

async def main():
    start = time.time()
    # 同时启动两个协程
    await asyncio.gather(
        blocking_task(),
        quick_task(),  # 会被 blocking_task 卡住，3 秒后才能跑
    )
    print(f"总耗时: {time.time() - start:.2f}s")  # 3.10s（quick_task 被连累）

asyncio.run(main())
\`\`\`

### 解决方案 1：用异步替代库

| 同步（阻塞） | 异步（非阻塞） |
|------|------|
| \`time.sleep\` | \`asyncio.sleep\` |
| \`requests.get\` | \`httpx.AsyncClient\` |
| \`psycopg2\` | \`asyncpg\` / \`psycopg\` async |
| \`pymysql\` | \`aiomysql\` |
| \`open().read()\` | \`aiofiles.open()\` |

### 解决方案 2：run_in_executor 扔到线程池

如果只有同步库可用，用 \`run_in_executor\` 把阻塞调用扔到线程池，不占事件循环。

\`\`\`python filename="run_in_executor 救场"
import asyncio
import time
import requests  # 同步 HTTP 库

async def fetch_sync(url):
    # 把同步阻塞的 requests.get 扔到默认线程池跑
    # 事件循环在此期间能继续跑别的协程
    # 原理：run_in_executor 把函数交给线程池，返回 Future，await 它不阻塞事件循环
    loop = asyncio.get_event_loop()
    # 第一个参数 None 表示用默认线程池（ThreadPoolExecutor）
    # 第二个参数是要跑的函数
    # 后面的参数是传给函数的参数
    result = await loop.run_in_executor(None, requests.get, url)
    return result.status_code

async def main():
    # 这样并发调用就不会互相卡死
    # 两个 requests.get 各自在独立线程跑，主事件循环不受影响
    results = await asyncio.gather(
        fetch_sync("https://httpbin.org/delay/2"),
        fetch_sync("https://httpbin.org/delay/2"),
    )
    print(results)

asyncio.run(main())
\`\`\`

**FastAPI 的贴心设计**：如果你的路由函数写成普通 \`def\`（不是 \`async def\`），FastAPI 会自动把它扔到线程池跑，不会卡事件循环。所以**没有异步库时，写 \`def\` 路由反而比 \`async def\` + 阻塞调用更安全**。

## 十、实战：FastAPI 并发请求多个 API

把前面学的全部串起来，做一个聚合接口：并发调用 3 个外部 API，返回合并结果。

\`\`\`python filename="main.py：并发 API 聚合"
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 导入异步 HTTP 客户端 httpx
import httpx
# 导入 asyncio 用于 gather
import asyncio
# 导入时间模块
import time

# 创建 FastAPI 应用
app = FastAPI()

# 定义异步函数：获取用户信息
async def fetch_user(user_id: int):
    # async with 创建异步 HTTP 客户端，自动关闭连接
    # 注意：这里每次都新建 client，仅为演示
    # 生产环境应该用应用级单例 client（见 httpx 章节）
    async with httpx.AsyncClient() as client:
        # await 等待响应
        resp = await client.get(f"https://jsonplaceholder.typicode.com/users/{user_id}")
        # 返回 JSON
        return resp.json()

# 定义异步函数：获取用户的文章
async def fetch_posts(user_id: int):
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"https://jsonplaceholder.typicode.com/posts?userId={user_id}")
        return resp.json()

# 定义异步函数：获取用户的相册
async def fetch_albums(user_id: int):
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"https://jsonplaceholder.typicode.com/albums?userId={user_id}")
        return resp.json()

# 定义聚合接口：GET /user-profile/{user_id}
@app.get("/user-profile/{user_id}")
async def user_profile(user_id: int):
    start = time.time()
    # 并发调用 3 个 API，总耗时 = 最慢的那个（而非三者之和）
    # gather 会同时启动三个协程，等全部完成
    # 返回结果顺序与传入顺序一致（不是完成顺序）
    user, posts, albums = await asyncio.gather(
        fetch_user(user_id),
        fetch_posts(user_id),
        fetch_albums(user_id),
    )
    elapsed = time.time() - start
    # 返回聚合结果
    return {
        "user": user,
        "posts_count": len(posts),
        "albums_count": len(albums),
        "elapsed": f"{elapsed:.2f}s",
    }

# 启动：uvicorn main:app --reload
# 访问：http://127.0.0.1:8000/user-profile/1
# 三个接口并发调用，比串行快 3 倍左右
\`\`\`

如果改成串行写法（一个个 \`await\`），总耗时是三者相加；用 \`gather\` 后变成最大值。这就是异步并发的威力。

## 十一、避坑指南：异步编程的 7 个雷区

1. **\`asyncio.run()\` 不能在已有事件循环里调用**：在 FastAPI 路由里千万别写 \`asyncio.run()\`，因为 Uvicorn 已经在事件循环里跑了。直接 \`await\` 协程即可。

2. **\`create_task\` 必须保存引用**：\`asyncio.create_task(coro)\` 如果返回值没保存，任务可能被垃圾回收中途取消。最佳实践：\`task = asyncio.create_task(...)\` 然后 \`await task\`。

3. **协程没 await 不会执行**：\`coro = my_func()\` 只创建协程对象，不执行。看到 \`RuntimeWarning: coroutine was never awaited\` 就是这个原因。

4. **\`asyncio.gather\` 顺序保证**：返回结果顺序与传入顺序一致，与完成顺序无关。不用担心快慢影响结果顺序。

5. **取消任务要谨慎**：\`task.cancel()\` 会在协程的 \`await\` 处抛出 \`CancelledError\`，需要 \`try/except asyncio.CancelledError\` 捕获做清理。

6. **CPU 密集型别用 async**：加密、压缩、图像处理这类 CPU 算个不停的操作，async 帮不上忙，要用 \`ProcessPoolExecutor\` 多进程。

7. **第三方库要看是否支持 async**：用了同步库（\`requests\`、\`pymysql\`）写在 \`async def\` 里就是灾难。要么换异步库，要么 \`run_in_executor\`。

## 十二、小结

这一章打基础，重点记住：

- **协程**是 \`async def\` 定义的函数，调用返回协程对象，要事件循环跑
- **\`await\`** 暂停当前协程，让出 CPU，等异步操作完成
- **\`create_task\`** 把协程包装成任务并立即调度，是并发的关键
- **\`gather\`** 批量并发，等所有完成，最常用
- **\`async with\`** 管理异步资源（连接、客户端）
- **阻塞调用是头号杀手**，要么换异步库，要么 \`run_in_executor\`

下一章我们把这些概念用到数据库上，看异步数据库驱动和 SQLAlchemy 2.0 异步引擎怎么玩。
`,
  },

  // =========================================================
  // 第二章：异步数据库
  // =========================================================
  {
    id: "fa-async-db",
    group: "异步编程",
    icon: "🗄️",
    title: "异步数据库",
    content: `

# 异步数据库

## 一、为什么数据库要异步

回顾上一章：FastAPI 的核心是异步 I/O。数据库查询是最典型的 I/O 操作——发个 SQL，等网络往返，等数据库执行，等结果传回。这个"等"可能几十毫秒到几秒。

如果用同步数据库驱动（\`pymysql\`、\`psycopg2\`），\`cursor.execute()\` 会阻塞当前线程。在 \`async def\` 路由里调它，整个事件循环被卡住，所有其他请求都停下来等这一个查询——FastAPI 的高并发优势瞬间归零。

\`\`\`txt filename="同步数据库驱动的灾难"
请求 A 查询数据库（耗时 500ms）
  → 事件循环被卡住 500ms
  → 期间请求 B、C、D 全部排队等
  → QPS 从理论上的几千掉到几十

异步数据库驱动：
  → 协程发起查询后挂起，事件循环去服务 B、C、D
  → 查询完成回调唤醒 A，继续处理
  → 单线程扛高并发
\`\`\`

所以：**FastAPI + 同步数据库驱动 = 买跑车却加 90 号汽油**。要么换异步驱动，要么把同步驱动扔线程池（\`run_in_executor\`）。这一章讲第一种方案。

## 二、异步数据库驱动对比

Python 生态有几个主流异步数据库驱动，先看对比表，再选适合你的：

| 驱动 | 数据库 | 特点 | 适用场景 |
|------|------|------|------|
| **asyncpg** | PostgreSQL | 性能最强，原生异步 API，不兼容 DB-API | 追求极致性能，直接写 SQL |
| **aiomysql** | MySQL | 兼容 PyMySQL API，迁移成本低 | MySQL 项目，直接写 SQL |
| **psycopg** (v3) | PostgreSQL | 新版支持异步，兼容 DB-API | 同时要同步异步混用 |
| **databases** | 多种 | SQLAlchemy 风格，支持 MySQL/PostgreSQL/SQLite | 想要 ORM 风格又不绑死 |
| **SQLAlchemy 2.0 AsyncSession** | 多种 | ORM 全异步，底层用 asyncpg/aiomysql | 想用 ORM 的项目（推荐） |

**怎么选**：
- 想用 ORM（推荐大多数项目）→ **SQLAlchemy 2.0 AsyncSession**（本章重点）
- 想直接写 SQL，要极致性能 → **asyncpg**（PostgreSQL）或 **aiomysql**（MySQL）
- 老项目迁移，逐步异步化 → **psycopg v3**

### asyncpg 速览（直接 SQL 的选择）

\`\`\`python filename="asyncpg 基础示例"
# 导入 asyncpg（PostgreSQL 的原生异步驱动，性能极强）
import asyncpg
# 导入 asyncio（事件循环库）
import asyncio

async def main():
    # 异步连接 PostgreSQL
    # await 是因为建连涉及网络 I/O，必须让出 CPU
    conn = await asyncpg.connect(
        host="localhost",     # 数据库主机地址
        port=5432,            # PostgreSQL 默认端口
        user="postgres",      # 数据库用户名
        password="secret",    # 数据库密码
        database="testdb",    # 要连接的数据库名
    )
    # 执行查询，返回记录列表
    # 注意：asyncpg 用 $1, $2 作为占位符（不是 %s 也不是 ?）
    # $1 对应第二个参数 18，参数化查询防止 SQL 注入
    rows = await conn.fetch("SELECT id, name FROM users WHERE age > $1", 18)
    for row in rows:
        # row 是 Record 对象，可以用 row['name'] 或 row.name 访问
        # 两种访问方式等价，row.name 更简洁
        print(row['id'], row['name'])
    # 关闭连接（必须 await，因为关闭也是网络 I/O）
    # 实际项目建议用连接池 asyncpg.create_pool 复用连接
    await conn.close()

asyncio.run(main())
\`\`\`

asyncpg 用 \`$1, $2\` 占位符（不是 \`%s\` 也不是 \`?\`），性能极强但 API 与 PyMySQL/psycopg2 差异大，迁移成本高。

## 三、SQLAlchemy 2.0 异步引擎

SQLAlchemy 2.0 原生支持异步，是 FastAPI 项目的首选。下面从零搭一个异步数据库层。

### 3.1 安装依赖

\`\`\`bash filename="安装异步驱动"
# SQLAlchemy 2.0 核心包
pip install sqlalchemy[asyncio]
# 数据库驱动（按你的数据库二选一）
pip install asyncpg      # PostgreSQL
pip install aiomysql     # MySQL
# 如果用 SQLite（开发测试用）
pip install aiosqlite
\`\`\`

### 3.2 创建异步引擎

\`\`\`python filename="database.py：异步引擎配置"
# 从 sqlalchemy.ext.asyncio 导入异步引擎和会话
# create_async_engine 是 create_engine 的异步版，返回 AsyncEngine
# AsyncSession 是 Session 的异步版，所有 I/O 方法都要 await
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
# 导入 declarative_base（注意：2.0 推荐 DeclarativeBase，这里是兼容写法）
from sqlalchemy.orm import declarative_base
# 导入会话工厂 async_sessionmaker（sessionmaker 的异步版）
from sqlalchemy.ext.asyncio import async_sessionmaker

# 异步数据库 URL（注意驱动前缀，+ 后面是异步驱动名）
# PostgreSQL: postgresql+asyncpg://user:pass@host:port/dbname
# MySQL:      mysql+aiomysql://user:pass@host:port/dbname
# SQLite:     sqlite+aiosqlite:///./test.db
# 格式：dialect+driver://user:password@host:port/database
DATABASE_URL = "postgresql+asyncpg://postgres:secret@localhost:5432/testdb"

# 创建异步引擎
# echo=True 打印 SQL 日志（开发调试用，生产必须关掉避免日志爆炸）
# pool_size=10 连接池常驻连接数（默认 5）
# max_overflow=20 超出 pool_size 后还能临时开的连接数（默认 10）
#   实际最大连接数 = pool_size + max_overflow = 30
# pool_pre_ping=True 借连接前先发 ping，避免拿到已断开的连接
#   生产环境必开，防止数据库重启或网络抖动导致"幽灵连接"
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
)

# 创建异步会话工厂
# async_sessionmaker 类似 sessionmaker，但生成的会话是异步的
# bind=engine：会话从哪个引擎拿连接
# class_=AsyncSession：指定会话类（默认就是 AsyncSession，可省略）
# expire_on_commit=False：commit 后对象不过期，避免异步访问触发同步刷新
#   这是异步场景的必设项，原因见下方说明
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# 声明模型基类
# 所有模型继承 Base，Base.metadata 记录所有表结构
# Alembic 迁移和 create_all 都依赖这个 metadata
Base = declarative_base()
\`\`\`

**为什么 \`expire_on_commit=False\`**：默认情况下，\`commit()\` 后所有 ORM 对象过期，下次访问属性会触发同步的数据库刷新——在异步代码里这就是灾难（同步 I/O 阻塞事件循环）。设为 \`False\` 后，\`commit()\` 不让对象过期，可以安全访问。

## 四、定义模型

模型定义与同步版本完全一样，SQLAlchemy 2.0 推荐用 \`Mapped\` 类型注解。

\`\`\`python filename="models.py：文章模型"
# 从 sqlalchemy 导入列类型
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
# 导入 datetime
from datetime import datetime
# 从 database 导入 Base
from database import Base

# 定义 Article 模型（对应 articles 表）
class Article(Base):
    __tablename__ = "articles"

    # 主键 id，自增
    id = Column(Integer, primary_key=True, index=True)
    # 标题，字符串，带索引
    title = Column(String(200), nullable=False, index=True)
    # 正文，长文本
    content = Column(Text, nullable=False)
    # 作者 ID
    author_id = Column(Integer, nullable=False, index=True)
    # 是否发布
    published = Column(Boolean, default=False)
    # 创建时间
    created_at = Column(DateTime, default=datetime.utcnow)
    # 更新时间
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
\`\`\`

## 五、AsyncSession 异步 CRUD

### 5.1 异步查询（SELECT）

\`\`\`python filename="异步查询示例"
import asyncio
from sqlalchemy import select
from database import AsyncSessionLocal, engine
from models import Article, Base

async def get_articles():
    # async with 创建会话，退出块时自动关闭（释放连接回池）
    async with AsyncSessionLocal() as session:
        # 构建查询：select(Article).where(...).order_by(...)
        # select() 是 SQLAlchemy 2.0 风格（1.x 用 session.query）
        # .where() 条件：published == True（注意是 == 不是 =）
        # .order_by() 排序：.desc() 降序（最新的在前）
        stmt = select(Article).where(Article.published == True).order_by(Article.created_at.desc())
        # await session.execute 执行查询，返回 Result 对象
        # 这里必须 await，因为要等数据库返回数据（异步 I/O）
        result = await session.execute(stmt)
        # .scalars() 把每行从 Row 解包成 Article 对象
        #   不加 scalars() 得到的是 (Article,) 元组，加了得到 Article
        # .all() 返回列表（同步操作，数据已在内存，不需要 await）
        articles = result.scalars().all()
        return articles

async def get_article_by_id(article_id: int):
    async with AsyncSessionLocal() as session:
        # 按主键查询单条，最简单
        # session.get 是 session.execute(select(...).filter_by(id=...)) 的快捷方式
        # 找不到返回 None（不抛异常）
        article = await session.get(Article, article_id)
        return article

async def main():
    # 首次运行要建表
    # engine.begin() 开启一个连接级事务
    # run_sync 把同步函数放到线程里跑（create_all 是同步 API）
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # 查询
    articles = await get_articles()
    for a in articles:
        print(a.id, a.title)

asyncio.run(main())
\`\`\`

**关键点**：
- \`session.execute(stmt)\` 是 \`await\` 的，因为要等数据库返回
- \`result.scalars().all()\` 是同步的，因为数据已经在内存里
- \`session.get(Model, pk)\` 是按主键查询的快捷方式

### 5.2 异步新增（INSERT）

\`\`\`python filename="异步新增示例"
from sqlalchemy import select
from database import AsyncSessionLocal
from models import Article

async def create_article(title: str, content: str, author_id: int):
    # async with 创建会话
    async with AsyncSessionLocal() as session:
        # 创建 Article 对象（暂未入库，只在 Python 内存里）
        article = Article(
            title=title,
            content=content,
            author_id=author_id,
            published=False,
        )
        # add 把对象加入会话的 identity map（还没发 SQL）
        # SQLAlchemy 用"工作单元"模式，累积变更，commit 时统一发 SQL
        session.add(article)
        # commit 才真正发 INSERT SQL 入库
        # 必须 await，因为发 SQL 是异步 I/O
        await session.commit()
        # commit 后 article.id 已被自动填充（数据库生成的自增 ID）
        # 因为 expire_on_commit=False，可以直接访问
        # refresh 重新发一次 SELECT 拿到所有字段（如 server_default 生成的值）
        await session.refresh(article)  # 刷新获取完整字段
        return article

async def create_many(articles_data: list):
    async with AsyncSessionLocal() as session:
        # 批量新增：循环 add
        for data in articles_data:
            article = Article(**data)
            session.add(article)
        # 一次 commit 提交所有
        # 比循环里每次 commit 快得多（一次事务，一次往返）
        await session.commit()
\`\`\`

### 5.3 异步更新（UPDATE）

\`\`\`python filename="异步更新示例"
from sqlalchemy import select, update
from database import AsyncSessionLocal
from models import Article

async def update_article_title(article_id: int, new_title: str):
    async with AsyncSessionLocal() as session:
        # 方式 1：先查再改（适合需要读取旧值的场景）
        article = await session.get(Article, article_id)
        if article is None:
            return None
        # 修改属性
        article.title = new_title
        # commit 时自动发 UPDATE
        await session.commit()
        return article

async def bulk_publish(author_id: int):
    async with AsyncSessionLocal() as session:
        # 方式 2：直接 UPDATE 语句（不加载对象，性能更好）
        stmt = (
            update(Article)
            .where(Article.author_id == author_id)
            .values(published=True)
        )
        await session.execute(stmt)
        await session.commit()
\`\`\`

**两种更新的选择**：
- 需要读取旧值或业务逻辑判断 → 先 \`get\` 再改属性
- 批量更新无业务逻辑 → 直接 \`update()\` 语句，性能好

### 5.4 异步删除（DELETE）

\`\`\`python filename="异步删除示例"
from sqlalchemy import delete, select
from database import AsyncSessionLocal
from models import Article

async def delete_article(article_id: int):
    async with AsyncSessionLocal() as session:
        # 方式 1：先查再删（要先有对象才能 delete）
        article = await session.get(Article, article_id)
        if article is None:
            return False
        await session.delete(article)
        await session.commit()
        return True

async def delete_by_author(author_id: int):
    async with AsyncSessionLocal() as session:
        # 方式 2：直接 DELETE 语句
        stmt = delete(Article).where(Article.author_id == author_id)
        await session.execute(stmt)
        await session.commit()
\`\`\`

## 六、异步事务处理

事务保证"要么全成功，要么全回滚"。SQLAlchemy 异步事务有两种写法。

\`\`\`python filename="异步事务：两种写法"
from sqlalchemy import select
from database import AsyncSessionLocal
from models import Article

# 写法 1：依赖 async with 自动提交/回滚
async def transfer_articles_demo(from_author: int, to_author: int):
    async with AsyncSessionLocal() as session:
        # async with session.begin() 开启事务
        # 正常退出 → 自动 commit
        # 抛异常 → 自动 rollback
        # 比 try/except 简洁，推荐用这种
        async with session.begin():
            # 查询作者 A 的所有文章
            stmt = select(Article).where(Article.author_id == from_author)
            result = await session.execute(stmt)
            articles = result.scalars().all()
            # 把作者改成 B
            # 修改属性不会立即发 SQL，只标记为 dirty
            for a in articles:
                a.author_id = to_author
            # 不需要手动 commit，退出 begin() 块自动提交
            # SQLAlchemy 会自动比对变更，生成 UPDATE 语句
        # 退出 session 块自动关闭

# 写法 2：手动控制
async def manual_transaction():
    async with AsyncSessionLocal() as session:
        try:
            # 业务逻辑
            article = Article(title="测试", content="内容", author_id=1)
            session.add(article)
            await session.commit()  # 提交
        except Exception as e:
            # 出错回滚
            # rollback 撤销所有未提交的变更，释放事务锁
            await session.rollback()
            raise e
\`\`\`

**推荐写法 1**（\`async with session.begin()\`），异常自动回滚，代码更简洁。

## 七、异步连接池配置

生产环境必须配置连接池，避免每次请求都新建连接（建连开销大）。

\`\`\`python filename="连接池配置详解"
from sqlalchemy.ext.asyncio import create_async_engine

# 连接池参数详解
# 连接池的核心价值：复用 TCP 连接，避免每次请求都三次握手建连
engine = create_async_engine(
    "postgresql+asyncpg://postgres:secret@localhost:5432/testdb",
    # 连接池大小：常驻连接数
    # 应用启动后预建这么多连接放池里，请求来了直接借
    pool_size=20,
    # 超出 pool_size 后还能临时开的连接数
    # 实际最大连接数 = pool_size + max_overflow = 20 + 10 = 30
    # 流量高峰时临时扩容，空闲后回收
    max_overflow=10,
    # 连接超时：从池里拿连接等超过 30 秒就抛异常
    # 防止池满时请求无限等待，导致协程堆积
    # 抛的是 TimeoutError，上层可捕获降级
    pool_timeout=30,
    # 连接回收周期：连接活超过 1800 秒（30 分钟）自动重建
    # 防止数据库主动断开连接导致"幽灵连接"
    # 必须小于数据库的 wait_timeout，否则连接已被数据库踢掉你还以为有效
    pool_recycle=1800,
    # 借连接前先 ping 一下，避免拿到已断开的连接
    # 多一次 RTT 但更安全，生产环境必开
    pool_pre_ping=True,
    # echo=False 生产环境关掉 SQL 日志
    # 开了日志每个 SQL 都打印，IO 开销大
    echo=False,
)

# 应用关闭时清理连接池
async def shutdown():
    # dispose 关闭所有连接（常驻 + 临时）
    # 不调用会连接泄漏，数据库连接数涨满
    await engine.dispose()  # 关闭所有连接
\`\`\`

**配置建议**：
- \`pool_size\`：根据数据库最大连接数和应用并发量定，通常 10-50
- \`pool_recycle\`：必须小于数据库的 \`wait_timeout\`（MySQL 默认 8 小时，但云数据库可能更短）
- \`pool_pre_ping=True\`：生产环境必开，避免连接断开导致 502

## 八、同步模型 + 异步引擎的混用陷阱

老项目从同步迁移到异步时，常见误区是"模型不变只换引擎"。有几个坑要注意：

\`\`\`python filename="混用的坑"
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.ext.asyncio import AsyncSession
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    # relationship 定义关联（默认懒加载！）
    # 懒加载：访问 user.articles 时才发 SQL，而不是查 user 时一起查
    # 同步代码里这很方便，但异步代码里是灾难
    articles = relationship("Article", back_populates="author")

class Article(Base):
    __tablename__ = "articles"
    id = Column(Integer, primary_key=True)
    author_id = Column(Integer)
    author = relationship("User", back_populates="articles")

async def bad_example(session: AsyncSession):
    user = await session.get(User, 1)
    # ❌ 灾难：访问 user.articles 触发懒加载（同步 I/O）
    # 在异步上下文里会抛 MissingGreenlet 异常或卡死
    # 原因：懒加载是同步阻塞操作，但异步代码不允许同步 I/O
    print(user.articles)  # 异常！

async def good_example(session: AsyncSession):
    # ✅ 方案 1：selectinload 一次性把关联数据加载好
    # selectinload 用独立的 SELECT ... WHERE id IN (...) 查询关联数据
    # 相比 joinedload 不会产生笛卡尔积，适合一对多关系
    from sqlalchemy.orm import selectinload
    # .options(selectinload(User.articles)) 告诉 SQLAlchemy：
    #   查 User 时顺便把每个 user 的 articles 也查出来（用第二次 SELECT）
    stmt = select(User).options(selectinload(User.articles)).where(User.id == 1)
    result = await session.execute(stmt)
    user = result.scalar_one()
    # 现在 user.articles 已经加载好，访问不会触发懒加载
    # 因为数据已在内存，访问属性是同步操作，安全
    print(user.articles)

async def good_example_2(session: AsyncSession):
    # ✅ 方案 2：明确 join 查询
    # 用 join 显式关联，返回 (User, Article) 元组
    # 适合只需要部分字段或要跨表过滤的场景
    from sqlalchemy import select
    stmt = select(User, Article).join(Article, User.id == Article.author_id).where(User.id == 1)
    result = await session.execute(stmt)
    for user, article in result:
        print(user.name, article.title)
\`\`\`

**核心原则**：异步代码里**禁止懒加载**。所有关联数据必须在查询时用 \`selectinload\`、\`joinedload\` 一次性加载，或者用 join 显式查询。

## 九、实战：异步文章 CRUD API

把前面所有内容整合成一个完整的 FastAPI 异步文章 API。

\`\`\`python filename="main.py：异步文章 CRUD 完整示例"
# 导入 FastAPI 和依赖相关
from fastapi import FastAPI, Depends, HTTPException
# 导入 Pydantic 模型
from pydantic import BaseModel
# 导入 SQLAlchemy 异步工具
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
# 导入 declarative_base
from sqlalchemy.orm import declarative_base
# 导入列类型
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
# 导入 datetime
from datetime import datetime

# ============ 数据库配置 ============
DATABASE_URL = "postgresql+asyncpg://postgres:secret@localhost:5432/testdb"
# 创建异步引擎
engine = create_async_engine(DATABASE_URL, echo=False, pool_size=10, pool_pre_ping=True)
# 创建会话工厂
AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
# 模型基类
Base = declarative_base()

# ============ 模型定义 ============
class Article(Base):
    __tablename__ = "articles"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, nullable=False)
    published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# ============ Pydantic Schema ============
class ArticleCreate(BaseModel):
    title: str
    content: str
    author_id: int

class ArticleUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    published: bool | None = None

class ArticleOut(BaseModel):
    id: int
    title: str
    content: str
    author_id: int
    published: bool
    created_at: datetime
    class Config:
        from_attributes = True  # 允许从 ORM 对象读取字段

# ============ 数据库依赖 ============
async def get_db():
    # 每个请求创建独立会话，请求结束自动关闭
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# ============ FastAPI 应用 ============
app = FastAPI()

@app.on_event("startup")
async def startup():
    # 启动时建表（生产环境用 Alembic 迁移）
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# ============ CRUD 接口 ============

# 创建文章
@app.post("/articles", response_model=ArticleOut)
async def create_article(article: ArticleCreate, db: AsyncSession = Depends(get_db)):
    # 创建 ORM 对象
    new_article = Article(**article.dict())
    db.add(new_article)
    await db.commit()
    await db.refresh(new_article)  # 刷新获取 id 和 created_at
    return new_article

# 查询所有文章
@app.get("/articles", response_model=list[ArticleOut])
async def list_articles(skip: int = 0, limit: int = 20, db: AsyncSession = Depends(get_db)):
    stmt = select(Article).offset(skip).limit(limit).order_by(Article.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

# 查询单篇文章
@app.get("/articles/{article_id}", response_model=ArticleOut)
async def get_article(article_id: int, db: AsyncSession = Depends(get_db)):
    article = await db.get(Article, article_id)
    if article is None:
        raise HTTPException(status_code=404, detail="文章不存在")
    return article

# 更新文章
@app.put("/articles/{article_id}", response_model=ArticleOut)
async def update_article(article_id: int, article: ArticleUpdate, db: AsyncSession = Depends(get_db)):
    # 只更新非 None 的字段
    stmt = update(Article).where(Article.id == article_id).values(**article.dict(exclude_unset=True)).returning(Article)
    result = await db.execute(stmt)
    await db.commit()
    updated = result.scalar_one_or_none()
    if updated is None:
        raise HTTPException(status_code=404, detail="文章不存在")
    return updated

# 删除文章
@app.delete("/articles/{article_id}")
async def delete_article(article_id: int, db: AsyncSession = Depends(get_db)):
    stmt = delete(Article).where(Article.id == article_id)
    result = await db.execute(stmt)
    await db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="文章不存在")
    return {"message": "已删除"}

# 启动：uvicorn main:app --reload
\`\`\`

这个完整示例覆盖了异步引擎、会话工厂、CRUD、事务（依赖里的 \`yield\` 模式）、Pydantic Schema 转换。复制粘贴改下数据库 URL 就能跑。

## 十、避坑指南

1. **\`expire_on_commit=False\` 必设**：否则 commit 后访问属性会触发同步刷新，卡死事件循环。

2. **关联关系禁用懒加载**：异步代码里访问 \`user.articles\` 必须先用 \`selectinload\` 加载。

3. **\`session.execute()\` 要 await，\`result.scalars().all()\` 不要**：前者发 SQL 是异步的，后者处理内存数据是同步的。

4. **不要共享 session**：每个请求一个 session，用依赖注入 \`yield\` 模式。

5. **\`engine.dispose()\` 在关闭时调用**：避免连接泄漏。

6. **SQLite 异步的坑**：SQLite 默认不支持并发写，开发测试可以用，生产环境用 PostgreSQL/MySQL。

7. **\`asyncpg\` 不支持 \`%s\` 占位符**：用 SQLAlchemy 抽象掉就没问题，但直接写 SQL 要用 \`$1\`。

## 十一、小结

- **SQLAlchemy 2.0 AsyncSession** 是 FastAPI + ORM 的最佳组合
- **\`create_async_engine\` + \`async_sessionmaker\`** 创建异步引擎和会话工厂
- **CRUD 四件套**：\`select\` 查、\`add + commit\` 增、属性修改 + \`commit\` 改、\`delete\` 删
- **事务**用 \`async with session.begin()\` 自动管理
- **连接池**必配 \`pool_pre_ping\` 和 \`pool_recycle\`
- **禁止懒加载**，关联数据用 \`selectinload\` 预加载

下一章我们看异步 HTTP 客户端 httpx，把外部 API 调用也异步化。
`,
  },

  // =========================================================
  // 第三章：异步 HTTP 客户端 httpx
  // =========================================================
  {
    id: "fa-httpx",
    group: "异步编程",
    icon: "🌐",
    title: "异步 HTTP 客户端 httpx",
    content: `

# 异步 HTTP 客户端 httpx

## 一、为什么是 httpx

调用外部 API 是后端日常：查天气、调支付、获取用户信息、调用 LLM。这些"外部 HTTP 调用"在异步 FastAPI 里有个核心问题——用什么库？

老牌的 \`requests\` 库是同步的，在 \`async def\` 里调它就是阻塞事件循环的灾难。\`aiohttp\` 是异步的，但 API 设计反人类，和 \`requests\` 风格完全不兼容。

**httpx** 是新一代 HTTP 客户端，它的设计哲学是："\`requests\` 的 API + 同步异步双模式"。同一个 API，同步代码用 \`httpx.Client\`，异步代码用 \`httpx.AsyncClient\`，迁移成本几乎为零。

### httpx vs requests 对比

| 维度 | requests | httpx |
|------|----------|-------|
| 同步模式 | ✅ | ✅ |
| 异步模式 | ❌ | ✅ \`AsyncClient\` |
| API 风格 | 经典 | 几乎一致（迁移友好） |
| HTTP/2 | ❌ | ✅ |
| 连接池 | 内置 | 内置且可配置 |
| 超时控制 | 简单 | 精细（连接/读取/写入/池分别设） |
| 重试 | 需要 urllib3 | 内置 transport 重试 |
| 流式响应 | 一般 | 优秀 |
| 测试 ASGI 应用 | ❌ | ✅ 直接测 FastAPI |

**结论**：新项目直接用 httpx，老项目从 requests 迁移到 httpx 也几乎无痛。

## 二、安装和第一个请求

\`\`\`bash filename="安装 httpx"
pip install httpx
# 如果要 HTTP/2 支持
pip install httpx[http2]
\`\`\`

### 同步模式：和 requests 几乎一样

\`\`\`python filename="httpx 同步模式"
# 导入 httpx
import httpx

# 最简单的 GET 请求（一次性请求，自动管理连接）
resp = httpx.get("https://jsonplaceholder.typicode.com/posts/1")
# 状态码
print(resp.status_code)  # 200
# 响应 JSON
print(resp.json())
# 响应文本
print(resp.text)

# POST 请求
resp = httpx.post(
    "https://jsonplaceholder.typicode.com/posts",
    json={"title": "foo", "body": "bar", "userId": 1},
)
print(resp.status_code)  # 201
print(resp.json())
\`\`\`

## 三、httpx.AsyncClient：异步模式

异步模式要用 \`httpx.AsyncClient\`，并且**强烈建议用 \`async with\` 管理生命周期**——这样能复用连接池，性能远好于每次创建。

\`\`\`python filename="AsyncClient 基础"
# 导入 httpx 和 asyncio
import httpx
import asyncio

async def fetch_post(post_id: int):
    # async with 创建 AsyncClient，自动管理连接池
    # 进入 with 块时初始化连接池，退出时调用 aclose() 释放
    # 一个 client 内的多次请求会复用 TCP 连接（keep-alive）
    async with httpx.AsyncClient() as client:
        # await 等待响应（必须 await，网络 I/O 是异步的）
        # client.get 是同步方法 client.get 的异步版
        resp = await client.get(f"https://jsonplaceholder.typicode.com/posts/{post_id}")
        # 检查状态码（非 2xx 抛异常）
        # httpx 默认不抛异常，4xx/5xx 静默返回
        # raise_for_status 主动检查，把 HTTP 错误转成异常
        resp.raise_for_status()
        # resp.json() 把响应体解析成 dict（同步操作，数据已在内存）
        return resp.json()

async def main():
    post = await fetch_post(1)
    print(post)

asyncio.run(main())
\`\`\`

### 为什么必须用 \`async with\`

\`\`\`python filename="不推荐 vs 推荐"
import httpx

# ❌ 不推荐：每次请求新建 client
async def bad():
    async with httpx.AsyncClient() as client:
        resp = await client.get("https://api.example.com/a")
    async with httpx.AsyncClient() as client:
        resp = await client.get("https://api.example.com/b")
    # 每次都新建连接池，没有 keep-alive 复用，性能差
    # 每次都要 TCP 三次握手 + TLS 握手（HTTPS），耗时几百毫秒

# ✅ 推荐：一个 client 多次请求，复用连接
async def good():
    async with httpx.AsyncClient() as client:
        resp1 = await client.get("https://api.example.com/a")
        resp2 = await client.get("https://api.example.com/b")
        # 两次请求复用 TCP 连接（keep-alive），第二次快很多
        # 省去握手时间，只算数据传输，延迟降到几十毫秒
\`\`\`

## 四、GET、POST、PUT、DELETE 完整示例

\`\`\`python filename="四种 HTTP 方法"
import httpx
import asyncio

BASE_URL = "https://jsonplaceholder.typicode.com"

async def demo_all_methods():
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        # GET：查询资源
        # base_url 会和路径拼接成完整 URL
        resp = await client.get("/posts/1")
        print(f"GET 状态: {resp.status_code}")  # 200
        print(f"GET 数据: {resp.json()['title']}")

        # POST：创建资源
        resp = await client.post(
            "/posts",
            json={"title": "新文章", "body": "内容", "userId": 1},
        )
        print(f"POST 状态: {resp.status_code}")  # 201
        print(f"POST 返回 ID: {resp.json()['id']}")

        # PUT：更新资源（全量替换）
        resp = await client.put(
            "/posts/1",
            json={"id": 1, "title": "更新标题", "body": "新内容", "userId": 1},
        )
        print(f"PUT 状态: {resp.status_code}")  # 200

        # PATCH：部分更新
        resp = await client.patch(
            "/posts/1",
            json={"title": "只改标题"},
        )
        print(f"PATCH 状态: {resp.status_code}")  # 200

        # DELETE：删除资源
        resp = await client.delete("/posts/1")
        print(f"DELETE 状态: {resp.status_code}")  # 200

asyncio.run(demo_all_methods())
\`\`\`

**\`base_url\` 的妙用**：当你的应用要多次调用同一个 API 服务（比如 OpenAI、微信支付），\`base_url\` 让你只写路径，统一管理域名。

## 五、请求头、查询参数、JSON 体

\`\`\`python filename="请求参数完整示例"
import httpx
import asyncio

async def request_with_everything():
    async with httpx.AsyncClient() as client:
        # 请求头：headers 参数
        headers = {
            "Authorization": "Bearer your-token-here",
            "User-Agent": "MyApp/1.0",
            "X-Custom-Header": "custom-value",
        }
        # 查询参数：params 参数
        params = {
            "page": 1,
            "size": 20,
            "keyword": "FastAPI",
        }
        # JSON 体：json 参数（自动设置 Content-Type: application/json）
        json_body = {
            "title": "测试",
            "tags": ["python", "async"],
        }

        resp = await client.post(
            "https://httpbin.org/anything",
            headers=headers,
            params=params,
            json=json_body,
        )
        # httpbin.org/anything 会回显请求内容，方便测试
        data = resp.json()
        print(f"实际请求 URL: {data['url']}")
        print(f"实际请求头: {data['headers']}")
        print(f"实际请求体: {data['json']}")

asyncio.run(request_with_everything())
\`\`\`

### 表单数据 vs JSON

\`\`\`python filename="表单提交"
import httpx

# 表单提交（application/x-www-form-urlencoded）
resp = httpx.post(
    "https://httpbin.org/post",
    data={"username": "alice", "password": "secret"},
)
# 等价于浏览器表单提交

# 文件上传（multipart/form-data）
files = {"file": ("test.txt", b"file content", "text/plain")}
resp = httpx.post(
    "https://httpbin.org/post",
    files=files,
)
\`\`\`

**怎么选 \`data\` 还是 \`json\`**：
- API 文档说"传 JSON" → \`json=\`
- API 文档说"表单提交"或模仿 HTML form → \`data=\`
- 文件上传 → \`files=\`

## 六、超时设置：精细控制

httpx 的超时控制非常精细，可以分别设置连接、读取、写入、池超时。

\`\`\`python filename="超时精细控制"
import httpx
import asyncio

async def timeout_demo():
    # 方式 1：统一超时（所有阶段都 5 秒）
    # 简单粗暴，适合快速验证
    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.get("https://httpbin.org/delay/2")

    # 方式 2：精细控制（推荐生产用）
    # connect: 连接建立超时（TCP 握手阶段）
    # read: 等待响应数据超时（服务器处理 + 传输）
    # write: 发送请求超时（上传请求体阶段）
    # pool: 从连接池拿连接的超时（池满时等待）
    # 不同阶段用不同超时，避免某阶段卡死拖累全局
    timeout = httpx.Timeout(
        connect=5.0,    # 5 秒连不上就放弃（网络不通快速失败）
        read=10.0,      # 10 秒读不到数据就放弃（服务器慢但别死等）
        write=5.0,      # 5 秒写不完请求就放弃（上传大文件场景调大）
        pool=5.0,       # 5 秒拿不到连接就放弃（连接池满，防协程堆积）
    )
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.get("https://httpbin.org/delay/3")

    # 方式 3：单个请求覆盖超时
    # 某些慢接口单独设大超时，不影响其他请求
    async with httpx.AsyncClient(timeout=10.0) as client:
        # 这个请求用 30 秒超时（其他请求还是 10 秒）
        resp = await client.get("https://httpbin.org/delay/5", timeout=30.0)

asyncio.run(timeout_demo())
\`\`\`

### 常见错误 1：不设超时

\`\`\`python filename="不设超时的灾难"
import httpx

# ❌ 灾难：默认超时是 5 秒，但如果手动设 None 就是永不超时
# 外部 API 卡死 → 你的协程永远挂起 → 连接耗尽 → 服务雪崩
client = httpx.AsyncClient(timeout=None)  # 永不超时！

# ✅ 正确：必须设超时
client = httpx.AsyncClient(timeout=httpx.Timeout(5.0, connect=3.0))
\`\`\`

**生产环境铁律**：所有外部 HTTP 调用必须设超时，宁可超时失败也不要无限等待。

## 七、重试机制

httpx 本身不直接提供重试，要用 \`httpx.HTTPTransport\` 配置重试次数。

\`\`\`python filename="重试机制"
import httpx
import asyncio

async def retry_demo():
    # 配置 transport：最大重试 3 次
    transport = httpx.AsyncHTTPTransport(retries=3)
    # 把 transport 传给 client
    async with httpx.AsyncClient(transport=transport) as client:
        # 如果请求失败（连接错误、5xx），自动重试最多 3 次
        resp = await client.get("https://httpbin.org/status/500")
        print(resp.status_code)  # 500（重试 3 次后还是失败）

asyncio.run(retry_demo())
\`\`\`

**重试的注意事项**：
- \`retries\` 只对**连接错误**和**5xx**生效，不对 4xx 生效（4xx 是客户端错误，重试没用）
- 对 POST/PUT 这类非幂等请求要谨慎重试（可能造成重复创建）
- 复杂重试逻辑（指数退避、特定状态码）建议用 \`tenacity\` 库

\`\`\`python filename="用 tenacity 实现指数退避"
# pip install tenacity
import httpx
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

# 用装饰器定义重试策略
@retry(
    stop=stop_after_attempt(5),  # 最多重试 5 次
    wait=wait_exponential(multiplier=1, min=1, max=10),  # 指数退避 1s, 2s, 4s, 8s
    retry=retry_if_exception_type(httpx.RequestError),  # 只重试网络错误
)
async def fetch_with_retry(url: str):
    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.get(url)
        resp.raise_for_status()  # 4xx/5xx 抛异常
        return resp.json()

async def main():
    try:
        data = await fetch_with_retry("https://httpbin.org/get")
        print(data)
    except Exception as e:
        print(f"重试 5 次后仍失败: {e}")

asyncio.run(main())
\`\`\`

## 八、连接池和 keep-alive

\`\`\`python filename="连接池配置"
import httpx

# 连接池配置
# httpx.Limits 控制连接池的三条边界
limits = httpx.Limits(
    max_connections=100,        # 最大总连接数（同时活跃的连接上限）
    max_keepalive_connections=20,  # 保持的 keep-alive 连接数
    # 空闲连接超过这个数就关闭多余的，保留 20 个备用
    keepalive_expiry=30.0,      # keep-alive 连接空闲 30 秒后关闭
    # 防止连接长期闲置占用资源，到期自动回收
)

# 把 limits 传给 client
client = httpx.AsyncClient(
    limits=limits,
    timeout=httpx.Timeout(10.0),
)
\`\`\`

**keep-alive 的价值**：TCP 连接建立成本高（三次握手 + TLS 握手可能几百毫秒）。keep-alive 让连接复用，第二次请求省去握手时间。对高频调用同一 API 的场景，性能提升明显。

## 九、httpx 与 FastAPI 集成（作为依赖）

在 FastAPI 项目里，httpx client 应该是**应用级单例**，不是每个请求新建。这样能复用连接池。

\`\`\`python filename="httpx 作为 FastAPI 依赖"
from fastapi import FastAPI, Request, HTTPException
import httpx

app = FastAPI()

# 应用启动时创建 client，关闭时释放
@app.on_event("startup")
async def startup():
    # 创建全局 AsyncClient，复用连接池
    # 存在 app.state 上，所有请求共享这一个 client
    # 这样连接池能跨请求复用，性能最佳
    app.state.http_client = httpx.AsyncClient(
        timeout=httpx.Timeout(10.0, connect=5.0),
        limits=httpx.Limits(max_connections=100, max_keepalive_connections=20),
    )

@app.on_event("shutdown")
async def shutdown():
    # 关闭 client，释放连接
    # aclose 是 async 的，因为关闭连接涉及网络 I/O
    # 不关闭会连接泄漏，进程退出时操作系统才回收
    await app.state.http_client.aclose()

# 依赖函数：从 app.state 获取 client
# 通过依赖注入而不是直接用全局变量，方便测试时 mock
async def get_http_client(request: Request):
    return request.app.state.http_client

# 使用依赖
@app.get("/proxy/{post_id}")
async def proxy_post(post_id: int, client: httpx.AsyncClient = Depends(get_http_client)):
    # 复用全局 client，性能最佳
    # client 已经配好超时和连接池，这里直接用
    resp = await client.get(f"https://jsonplaceholder.typicode.com/posts/{post_id}")
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail="上游错误")
    return resp.json()

from fastapi import Depends
\`\`\`

**关键点**：
- \`app.state.http_client\` 是全局单例，所有请求复用
- \`startup\` 创建，\`shutdown\` 用 \`aclose()\` 关闭
- 依赖注入获取 client，方便测试时替换 mock

## 十、实战：天气 API 聚合服务

做一个真实场景：聚合多个天气 API，返回统一格式。用户访问 \`/weather/{city}\`，我们并发调用 3 个天气源，返回最快的结果或合并结果。

\`\`\`python filename="main.py：天气 API 聚合服务"
from fastapi import FastAPI, Request, HTTPException, Depends
from pydantic import BaseModel
import httpx
import asyncio
from datetime import datetime

app = FastAPI()

# 启动时创建全局 client
@app.on_event("startup")
async def startup():
    app.state.client = httpx.AsyncClient(
        timeout=httpx.Timeout(8.0, connect=3.0),
        limits=httpx.Limits(max_connections=50, max_keepalive_connections=10),
    )

@app.on_event("shutdown")
async def shutdown():
    await app.state.client.aclose()

# 依赖：获取 client
async def get_client(request: Request):
    return request.app.state.client

# 响应模型
class Weather(BaseModel):
    city: str
    temp: float
    humidity: float
    source: str
    fetched_at: str

# 源 1：Open-Meteo（免费，无需 key）
async def fetch_open_meteo(client: httpx.AsyncClient, city: str) -> Weather:
    # 先地理编码城市名
    geo_resp = await client.get(
        "https://geocoding-api.open-meteo.com/v1/search",
        params={"name": city, "count": 1},
    )
    geo_data = geo_resp.json()
    if not geo_data.get("results"):
        raise ValueError(f"找不到城市: {city}")
    lat = geo_data["results"][0]["latitude"]
    lon = geo_data["results"][0]["longitude"]
    # 查天气
    weather_resp = await client.get(
        "https://api.open-meteo.com/v1/forecast",
        params={"latitude": lat, "longitude": lon, "current": "temperature_2m,relative_humidity_2m"},
    )
    data = weather_resp.json()
    current = data["current"]
    return Weather(
        city=city,
        temp=current["temperature_2m"],
        humidity=current["relative_humidity_2m"],
        source="open-meteo",
        fetched_at=datetime.now().isoformat(),
    )

# 源 2：wttr.in（另一个免费天气服务）
async def fetch_wttr(client: httpx.AsyncClient, city: str) -> Weather:
    resp = await client.get(f"https://wttr.in/{city}", params={"format": "j1"})
    data = resp.json()
    current = data["current_condition"][0]
    return Weather(
        city=city,
        temp=float(current["temp_C"]),
        humidity=float(current["humidity"]),
        source="wttr.in",
        fetched_at=datetime.now().isoformat(),
    )

# 源 3：模拟源（占位，实际可接入付费 API）
async def fetch_mock(client: httpx.AsyncClient, city: str) -> Weather:
    await asyncio.sleep(0.5)  # 模拟网络延迟
    return Weather(
        city=city,
        temp=22.5,
        humidity=65.0,
        source="mock",
        fetched_at=datetime.now().isoformat(),
    )

# 接口 1：并发调用所有源，返回最快成功的结果
@app.get("/weather/fast/{city}", response_model=Weather)
async def get_weather_fast(city: str, client: httpx.AsyncClient = Depends(get_client)):
    # 用 as_completed 实现先到先用
    tasks = [
        asyncio.create_task(fetch_open_meteo(client, city)),
        asyncio.create_task(fetch_wttr(client, city)),
        asyncio.create_task(fetch_mock(client, city)),
    ]
    try:
        # as_completed 谁先完成谁先返回
        for future in asyncio.as_completed(tasks):
            try:
                result = await future
                # 取消其他任务
                for t in tasks:
                    t.cancel()
                return result
            except Exception as e:
                # 这个源失败，等下一个
                continue
        # 所有源都失败
        raise HTTPException(status_code=502, detail="所有天气源都不可用")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 接口 2：并发调用所有源，返回所有结果（对比）
@app.get("/weather/all/{city}", response_model=list[Weather])
async def get_weather_all(city: str, client: httpx.AsyncClient = Depends(get_client)):
    # gather 并发，return_exceptions 容错
    results = await asyncio.gather(
        fetch_open_meteo(client, city),
        fetch_wttr(client, city),
        fetch_mock(client, city),
        return_exceptions=True,
    )
    # 过滤掉异常
    valid = [r for r in results if not isinstance(r, Exception)]
    if not valid:
        raise HTTPException(status_code=502, detail="所有天气源都不可用")
    return valid

# 启动：uvicorn main:app --reload
# 测试：curl http://127.0.0.1:8000/weather/fast/Beijing
# 测试：curl http://127.0.0.1:8000/weather/all/Beijing
\`\`\`

这个实战覆盖了：全局 client 管理、超时配置、并发调用、容错处理、\`as_completed\` 与 \`gather\` 的选择。可以直接跑（Open-Meteo 和 wttr.in 都是免费 API）。

## 十一、避坑指南

1. **\`AsyncClient\` 必须用 \`async with\` 或显式 \`aclose()\`**：不关闭会泄漏连接。

2. **生产环境必须设超时**：\`timeout=None\` 是定时炸弹。

3. **不要每个请求新建 client**：失去连接池优势，性能差。用应用级单例。

4. **\`raise_for_status()\` 检查状态码**：httpx 默认不抛异常，4xx/5xx 静默返回，要手动检查。

5. **重试要分场景**：GET 可重试，POST/PUT 谨慎（可能重复创建）。

6. **流式响应用 \`stream()\`**：大文件下载用流式，避免一次性加载到内存。

7. **测试 FastAPI 用 \`httpx.AsyncClient(app=app)\`**：直接调 ASGI 应用，不用真起服务，超快。

## 十二、小结

- **httpx** = requests 的 API + 同步异步双模式，迁移友好
- **\`AsyncClient\` + \`async with\`** 是异步模式标准用法
- **GET/POST/PUT/DELETE** 四个方法覆盖 99% 场景
- **超时精细控制**：\`httpx.Timeout(connect, read, write, pool)\`
- **连接池**用 \`httpx.Limits\` 配置，应用级单例复用
- **FastAPI 集成**：\`startup\` 创建全局 client，依赖注入分发

下一章看 FastAPI 内置的后台任务机制 BackgroundTasks，处理"响应后还要做事"的场景。
`,
  },

  // =========================================================
  // 第四章：后台任务 BackgroundTasks
  // =========================================================
  {
    id: "fa-background-tasks",
    group: "异步编程",
    icon: "📬",
    title: "后台任务 BackgroundTasks",
    content: `

# 后台任务 BackgroundTasks

## 一、什么场景需要后台任务

Web 接口的标准流程是"接收请求 → 处理 → 返回响应"。但有些操作不该让用户等：

- **发邮件**：用户注册后发欢迎邮件，SMTP 调用要 2-5 秒，让用户等没意义
- **写日志**：记录用户行为到日志系统，不影响业务返回
- **生成缩略图**：用户上传图片后异步生成多尺寸缩略图
- **清理临时文件**：定期清理过期 session 文件
- **推送通知**：发微信、邮件、短信通知

这些操作的特点是：**用户不需要等它完成，只要最终做到就行**。如果同步做，用户多等几秒；如果用重型消息队列（Celery），又太重了。FastAPI 内置的 \`BackgroundTasks\` 就是这个中间地带的方案。

\`\`\`txt filename="BackgroundTasks 在生态中的位置"
                    用户等待时间    复杂度    适用规模
同步执行          →  长（秒级）     低        任意
BackgroundTasks   →  短（毫秒级）   低        单进程小任务
Celery/RQ         →  短（毫秒级）   中-高     分布式大规模
\`\`\`

## 二、BackgroundTasks 的原理

\`BackgroundTasks\` 的原理非常简单：

1. 你在路由函数参数里声明 \`background_tasks: BackgroundTasks\`
2. 用 \`background_tasks.add_task(func, args)\` 添加任务
3. FastAPI **先把响应返回给客户端**，然后在**同一个进程内**执行这些任务
4. 任务执行完，请求生命周期才真正结束

\`\`\`txt filename="执行时序"
普通请求：
  请求 → 处理（含耗时操作）→ 响应 → 结束
        ↑ 用户等到耗时操作完才看到响应

BackgroundTasks：
  请求 → 处理 → 响应（立刻返回）→ 后台执行任务 → 结束
                  ↑ 用户不等耗时操作          ↑ 这里才真正完事
\`\`\`

**关键理解**：后台任务不是"另一个进程"，而是"响应返回后，请求协程继续做的事"。所以：
- 任务抛异常 → 不会影响已返回的响应，但会记入日志
- 服务重启 → 未完成的任务丢失（不持久化）
- 任务里不能用 \`yield\` 依赖里的资源（如 db session），因为响应后依赖已关闭

## 三、第一个 BackgroundTasks 示例

\`\`\`python filename="main.py：第一个后台任务"
# 从 fastapi 导入 FastAPI 和 BackgroundTasks
from fastapi import FastAPI, BackgroundTasks
# 导入 time 模块
import time

# 创建 FastAPI 应用
app = FastAPI()

# 定义后台任务函数（普通函数即可，也可以是 async def）
def send_welcome_email(email: str):
    # 模拟发邮件耗时 3 秒
    time.sleep(3)
    # 实际项目这里调 SMTP 或邮件 API
    print(f"邮件已发送到 {email}")

# 定义注册接口
@app.post("/register")
def register(email: str, background_tasks: BackgroundTasks):
    # 1. 先做核心业务：保存用户到数据库（假设 50ms）
    # ... 保存用户 ...
    user_id = 123

    # 2. 添加后台任务（不会立刻执行，只是登记）
    background_tasks.add_task(send_welcome_email, email)

    # 3. 立刻返回响应（不等邮件发送）
    return {"user_id": user_id, "message": "注册成功，欢迎邮件稍后送达"}

# 启动：uvicorn main:app --reload
# 测试：curl -X POST "http://127.0.0.1:8000/register?email=test@example.com"
# 你会立刻收到响应，但控制台 3 秒后才打印"邮件已发送"
\`\`\`

**怎么想**：\`add_task\` 像是给 FastAPI 一张"待办事项清单"，FastAPI 在响应返回后逐个执行清单上的任务。你不需要管理线程或进程，FastAPI 全自动。

### \`add_task\` 的参数

\`\`\`python filename="add_task 详解"
# add_task 签名：add_task(func, *args, **kwargs)
# func: 要执行的函数（同步或异步都行）
# *args: 位置参数
# **kwargs: 关键字参数

def log_action(user_id: int, action: str, ip: str, extra: dict = None):
    # 写日志的逻辑
    pass

@app.post("/do-something")
async def do_something(background_tasks: BackgroundTasks):
    # 添加任务时直接传参
    background_tasks.add_task(
        log_action,
        user_id=123,                # 关键字参数
        action="login",
        ip="192.168.1.1",
        extra={"device": "mobile"},  # 默认参数也能覆盖
    )
    return {"ok": True}
\`\`\`

## 四、多个后台任务的执行顺序

\`BackgroundTasks\` 按添加顺序**串行**执行，不是并发。

\`\`\`python filename="多个后台任务的顺序"
from fastapi import FastAPI, BackgroundTasks
import time

app = FastAPI()

def task(name: str, delay: float):
    print(f"[{time.time():.2f}] {name} 开始")
    time.sleep(delay)
    print(f"[{time.time():.2f}] {name} 完成")

@app.get("/multi-tasks")
def multi_tasks(background_tasks: BackgroundTasks):
    # 按 A → B → C 顺序添加
    background_tasks.add_task(task, "A", 1.0)
    background_tasks.add_task(task, "B", 0.5)
    background_tasks.add_task(task, "C", 0.3)
    return {"message": "任务已排队"}

# 控制台输出：
# [1.00] A 开始
# [2.00] A 完成
# [2.00] B 开始    ← A 完成后才开始 B（串行）
# [2.50] B 完成
# [2.50] C 开始
# [2.80] C 完成
\`\`\`

**为什么要串行**：避免任务间并发问题（比如写同一个文件、数据库锁竞争）。如果需要并发，自己在任务函数里用 \`asyncio.gather\`。

### 同步任务 vs 异步任务

\`\`\`python filename="同步与异步任务混合"
from fastapi import FastAPI, BackgroundTasks
import asyncio
import time

app = FastAPI()

# 同步任务：FastAPI 扔到线程池跑
# 普通 def 函数，里面有 time.sleep 这种阻塞调用
# FastAPI 自动用 run_in_executor 把它丢到线程池，不卡事件循环
def sync_task():
    time.sleep(1)
    print("同步任务完成")

# 异步任务：FastAPI 在事件循环里 await
# async def 函数，用 await asyncio.sleep 不阻塞
async def async_task():
    await asyncio.sleep(1)
    print("异步任务完成")

@app.get("/mixed")
async def mixed(background_tasks: BackgroundTasks):
    background_tasks.add_task(sync_task)    # 同步任务
    background_tasks.add_task(async_task)   # 异步任务
    return {"ok": True}
    # 响应返回后，FastAPI 自动判断是同步还是异步，分别处理
    # sync_task → 线程池；async_task → 事件循环
\`\`\`

**怎么选**：
- 任务里有 I/O 且有异步库（\`httpx\`、\`asyncpg\`）→ \`async def\` 任务
- 任务里只能用同步库（\`smtplib\`、\`requests\`）→ 普通 \`def\` 任务（FastAPI 自动扔线程池）

## 五、后台任务的异常处理

后台任务抛异常**不会影响已返回的响应**，但异常会被 FastAPI 捕获并记入日志。

\`\`\`python filename="异常处理的两种方式"
from fastapi import FastAPI, BackgroundTasks
import logging

app = FastAPI()
# 配置日志
logger = logging.getLogger("background")

# 方式 1：任务函数内部 try/except（推荐）
# 优点：可以自定义重试、降级、写死信队列
def safe_send_email(email: str):
    try:
        # 模拟发邮件
        raise ConnectionError("SMTP 服务器不可用")
    except Exception as e:
        # 任务内部捕获，记录日志，不影响其他任务
        logger.error(f"发邮件失败 {email}: {e}")
        # 可以选择重试或写失败队列
        # 比如：把失败的邮件写入 failed_emails 表，等人工处理

@app.post("/send")
def send(email: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(safe_send_email, email)
    return {"message": "已排队"}

# 方式 2：不捕获，让 FastAPI 记日志（不推荐生产用）
def unsafe_task():
    raise ValueError("故意出错")
    # FastAPI 会捕获并记入日志，但你无法控制重试逻辑
    # 异常被 Starlette 内部捕获，只打日志，不做其他处理

@app.post("/unsafe")
def unsafe(background_tasks: BackgroundTasks):
    background_tasks.add_task(unsafe_task)
    return {"message": "已排队"}
    # 响应正常返回，但后台任务报错会出现在服务端日志
\`\`\`

**最佳实践**：任务函数内部一定要 \`try/except\`，因为：
1. 默认异常只记日志，你不知道任务失败了
2. 无法重试
3. 无法把失败任务转移到死信队列

## 六、后台任务与依赖注入

\`BackgroundTasks\` 也可以在依赖里用，FastAPI 会把依赖里的任务和路由里的任务合并执行。

\`\`\`python filename="依赖里的 BackgroundTasks"
from fastapi import FastAPI, BackgroundTasks, Depends, Request
import time

app = FastAPI()

# 依赖函数：参数声明 BackgroundTasks
def logging_dependency(background_tasks: BackgroundTasks):
    # 在依赖里添加任务
    def write_log(message: str):
        # 模拟写日志
        time.sleep(0.5)
        print(f"[LOG] {message}")

    background_tasks.add_task(write_log, "请求处理完成")

@app.post("/items", dependencies=[Depends(logging_dependency)])
def create_item(background_tasks: BackgroundTasks):
    # 路由里也添加任务
    background_tasks.add_task(write_log, "item 创建")
    return {"ok": True}
    # 执行顺序：依赖里的任务 → 路由里的任务

def write_log(message: str):
    print(f"[LOG] {message}")
\`\`\`

### 常见错误：在依赖 yield 后用资源

\`\`\`python filename="依赖资源的陷阱"
from fastapi import FastAPI, BackgroundTasks, Depends
from sqlalchemy.ext.asyncio import AsyncSession

app = FastAPI()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
        # yield 后 session 还在，但响应返回后 session 会被关闭！
        # 因为 async with 在 yield 之后的 finally 里调用 session.close()

# ❌ 错误：后台任务用了 session，但执行时 session 已关闭
def write_log_with_db(session: AsyncSession, message: str):
    # 这时 session 已被 get_db 关闭，会报错
    # 因为后台任务在响应返回后才执行，那时依赖已清理完毕
    await session.execute(...)  # Session is closed

@app.post("/bad")
async def bad(background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    # 后台任务用了 db，但响应返回后 get_db 会关闭 db
    # 任务执行时 db 已经是个关闭了的 session 对象
    background_tasks.add_task(write_log_with_db, db, "log")
    return {"ok": True}
    # 后台任务执行时报错：session closed

# ✅ 正确：后台任务自己创建 session
async def safe_write_log(message: str):
    # 任务内部新建独立 session
    # 不依赖请求级资源，生命周期完全由任务自己控制
    async with AsyncSessionLocal() as session:
        await session.execute(text("INSERT INTO logs ..."))
        await session.commit()

@app.post("/good")
async def good(background_tasks: BackgroundTasks):
    background_tasks.add_task(safe_write_log, "log")
    return {"ok": True}
\`\`\`

**核心原则**：后台任务**不能依赖请求级资源**（db session、httpx client per request）。任务要自己创建资源或用应用级单例。

## 七、BackgroundTasks vs Celery：怎么选

| 维度 | BackgroundTasks | Celery |
|------|-----------------|--------|
| 部署复杂度 | 零（FastAPI 内置） | 高（需要 broker: Redis/RabbitMQ + worker 进程） |
| 持久化 | ❌ 服务重启丢失 | ✅ 持久化到 broker |
| 重试 | 自己实现 | 内置 |
| 分布式 | ❌ 单进程 | ✅ 多 worker 多机器 |
| 监控 | 自己实现 | Flower 等工具 |
| 任务延迟 | 毫秒级（同进程） | 几十毫秒到秒级（经过 broker） |
| 适合任务量 | 小（几十/秒） | 大（几千/秒） |

**选 BackgroundTasks**：
- 单实例部署
- 任务量小
- 任务失败可容忍（不严格）
- 不想引入 Redis/RabbitMQ

**选 Celery**：
- 多实例部署
- 任务量大
- 任务必须可靠（支付、订单）
- 需要分布式调度

**实际项目**：BackgroundTasks 适合 80% 的小任务场景。只有支付、订单这类关键业务才上 Celery。

## 八、实战：邮件发送 + 日志记录后台任务

做一个用户注册接口：注册成功后，并发发欢迎邮件、写行为日志、生成用户统计——全部后台执行。

\`\`\`python filename="main.py：邮件 + 日志后台任务完整示例"
from fastapi import FastAPI, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel, EmailStr
import asyncio
import time
import logging
from datetime import datetime

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app")

app = FastAPI()

# ============ 模拟服务 ============
# 模拟用户存储
fake_users_db = {}

# 模拟邮件发送服务
def send_email_sync(to: str, subject: str, body: str):
    """同步发邮件（模拟 SMTP）"""
    # 模拟 SMTP 调用耗时
    time.sleep(2)
    logger.info(f"📧 邮件已发送 → {to} | 主题: {subject}")
    # 实际项目这里用 smtplib 或 SendGrid API
    return True

# 异步发邮件（模拟用 httpx 调邮件 API）
async def send_email_async(to: str, subject: str, body: str):
    """异步发邮件（模拟调邮件 API）"""
    # 模拟异步 HTTP 调用
    await asyncio.sleep(1.5)
    logger.info(f"📧 邮件已发送 → {to} | 主题: {subject}")
    return True

# 模拟日志服务
def write_user_log(user_id: int, action: str, ip: str):
    """写用户行为日志"""
    time.sleep(0.3)
    log_entry = {
        "user_id": user_id,
        "action": action,
        "ip": ip,
        "timestamp": datetime.now().isoformat(),
    }
    logger.info(f"📝 日志: {log_entry}")
    # 实际项目写数据库或 ELK

# 模拟统计服务
def update_user_stats(user_id: int):
    """更新用户统计"""
    time.sleep(0.5)
    logger.info(f"📊 统计已更新 → user {user_id}")

# ============ Schema ============
class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str

class RegisterResponse(BaseModel):
    user_id: int
    email: str
    username: str
    message: str

# ============ 接口 ============
@app.post("/register", response_model=RegisterResponse)
def register(
    req: RegisterRequest,
    background_tasks: BackgroundTasks,
):
    """用户注册：注册后后台发邮件、写日志、更新统计"""
    # 检查邮箱是否已注册
    if req.email in fake_users_db:
        raise HTTPException(status_code=400, detail="邮箱已注册")

    # 1. 核心业务：保存用户（快）
    user_id = len(fake_users_db) + 1
    fake_users_db[req.email] = {
        "id": user_id,
        "email": req.email,
        "username": req.username,
    }

    # 2. 添加后台任务（按顺序执行）
    # 任务 1：发欢迎邮件（同步，扔线程池）
    background_tasks.add_task(
        send_email_sync,
        to=req.email,
        subject="欢迎注册",
        body=f"你好 {req.username}，欢迎加入！",
    )
    # 任务 2：写注册日志
    background_tasks.add_task(
        write_user_log,
        user_id=user_id,
        action="register",
        ip="127.0.0.1",
    )
    # 任务 3：更新统计
    background_tasks.add_task(update_user_stats, user_id)

    # 3. 立刻返回响应（不等任务）
    return RegisterResponse(
        user_id=user_id,
        email=req.email,
        username=req.username,
        message="注册成功，欢迎邮件稍后送达",
    )

# 异步版本：用 async 任务 + 自己并发
@app.post("/register-async", response_model=RegisterResponse)
async def register_async(
    req: RegisterRequest,
    background_tasks: BackgroundTasks,
):
    """异步版注册：后台任务自己并发"""
    if req.email in fake_users_db:
        raise HTTPException(status_code=400, detail="邮箱已注册")

    user_id = len(fake_users_db) + 1
    fake_users_db[req.email] = {
        "id": user_id,
        "email": req.email,
        "username": req.username,
    }

    # 定义一个并发执行所有后台逻辑的任务
    async def run_all_background_tasks(user_id: int, email: str, username: str):
        # 三个任务并发（而不是串行）
        # send_email_async 本身是 async def，直接传入
        # write_user_log / update_user_stats 是同步函数，用 asyncio.to_thread 包装
        # asyncio.to_thread 把同步函数扔到线程池跑，返回协程
        await asyncio.gather(
            send_email_async(email, "欢迎注册", f"你好 {username}"),
            asyncio.to_thread(write_user_log, user_id, "register", "127.0.0.1"),
            asyncio.to_thread(update_user_stats, user_id),
        )

    # 添加一个 async 任务（内部并发三个子任务）
    # 这样三个子任务并发执行，而不是 BackgroundTasks 默认的串行
    background_tasks.add_task(run_all_background_tasks, user_id, req.email, req.username)

    return RegisterResponse(
        user_id=user_id,
        email=req.email,
        username=req.username,
        message="注册成功（异步版）",
    )

# 启动：uvicorn main:app --reload
# 测试：
#   curl -X POST http://127.0.0.1:8000/register \\
#     -H "Content-Type: application/json" \\
#     -d '{"email":"test@example.com","username":"alice","password":"123456"}'
# 响应立刻返回，控制台陆续打印：邮件发送 → 日志写入 → 统计更新
\`\`\`

这个实战展示了：
- 同步任务和异步任务的混合使用
- 多任务的串行执行（\`/register\`）
- 在任务内部用 \`asyncio.gather\` 实现并发（\`/register-async\`）
- 用 \`asyncio.to_thread\` 把同步函数包装成异步
- 异常处理（任务函数内部 \`try/except\`）

## 九、避坑指南

1. **任务不能依赖请求资源**：db session、request 对象在响应后失效。任务要自己创建资源。

2. **任务串行执行**：要并发自己在任务内 \`asyncio.gather\`。

3. **任务不持久化**：服务重启任务丢失。关键任务（支付、订单）必须用 Celery。

4. **任务异常要内部捕获**：默认只记日志，无法重试。

5. **长任务别用 BackgroundTasks**：超过几十秒的任务用 Celery，否则会占用 worker 太久。

6. **不要在任务里访问 \`Request\` 对象**：响应后 request 上下文已清理。

7. **生产环境限制任务数量**：单个请求添加几十个任务会拖慢响应后的清理，要克制。

8. **测试时注意任务时序**：测试客户端返回响应后任务可能还没执行完，要 \`await\` 或加等待。

## 十、小结

- **BackgroundTasks** 解决"响应后还要做事"的轻量场景
- **\`background_tasks.add_task(func, args)\`** 添加任务，响应返回后串行执行
- **同步任务**扔线程池，**异步任务**在事件循环跑
- **任务必须自己处理异常**和资源管理
- **关键业务用 Celery**，BackgroundTasks 适合小任务

异步编程这一批章节到此结束。回顾一下四个层次：
1. **async/await 基础**：理解协程、事件循环、并发原语
2. **异步数据库**：用 AsyncSession 让数据访问不阻塞
3. **httpx**：用 AsyncClient 让外部调用不阻塞
4. **BackgroundTasks**：把不急的事扔后台，提升响应速度

把这四层都用好，你的 FastAPI 应用就是真正的"高性能异步"了。
`,
  },
];
