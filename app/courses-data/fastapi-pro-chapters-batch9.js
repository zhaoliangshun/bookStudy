// =============================================================
// FastAPI 现代开发全书 - 第 9 批章节
// -------------------------------------------------------------
// 本批包含 5 章：
//   fp-async-basic       : async/await 基础与事件循环（异步编程）
//   fp-async-db-http     : 异步数据库与 HTTP 客户端（异步编程）
//   fp-background-tasks  : 后台任务与消息队列（异步编程）
//   fp-websocket-basic   : WebSocket 基础（WebSocket 实时通信）
//   fp-websocket-rooms   : 房间管理与广播系统（WebSocket 实时通信）
// ============================================================

export const chapters = [
  {
    id: "fp-async-basic",
    group: "异步编程",
    icon: "⚡",
    title: "async/await 基础与事件循环",
    content: `# async/await 基础与事件循环

## 一、同步 vs 异步：本质区别在哪里

在讲异步之前，我们先想清楚一个问题：**为什么需要异步？同步到底慢在哪里？**

想象一家餐厅。同步模式就像只有一个服务员（线程），他接到一桌的点单后，必须亲自去厨房等菜做完、端上桌，然后才能去下一桌服务。如果厨房做菜要 10 分钟，这 10 分钟服务员就傻站着，什么也干不了。

异步模式呢？同一个服务员，接到点单后把单子递给厨房（发起 I/O），然后**立刻**去下一桌服务。等菜做好了，厨房按铃（I/O 完成），服务员再回来端菜。整个过程中服务员几乎没有空闲，一个人就能服务很多桌。

这就是异步的核心：**在等待 I/O 的时间里，去做别的事情**。I/O 包括什么？数据库查询、HTTP 请求、文件读写、网络等待——凡是需要"等"的操作都是 I/O。

在 Web 服务里，一个请求的生命周期大概是这样的：

1. 接收请求（CPU，极快）
2. 查数据库（I/O，可能几十毫秒到几秒）
3. 调外部 API（I/O，可能几百毫秒）
4. 组装数据返回（CPU，极快）

步骤 2 和 3 占了 99% 的时间，但在这段时间里 CPU 是闲着的。同步模式下，一个线程被一个请求占住，等 I/O 的时候啥也干不了。异步模式下，一个线程可以在等 I/O 的间隙处理几百个请求。

**类比总结**：同步 = 一个请求占一个线程，等 I/O 时线程睡觉。异步 = 一个线程服务多个请求，等 I/O 时去处理别的请求。这就是 FastAPI 性能高的根本原因。

## 二、事件循环：异步的"心脏"

异步编程的核心是**事件循环（Event Loop）**。你可以把它理解成一个无限循环的调度器：

1. 检查有没有准备好执行的任务（I/O 完成了、定时器到了）
2. 有就拿出来执行
3. 执行遇到 await（又要等 I/O），就挂起这个任务，去执行下一个
4. 循环往复

\`\`\`python
# 事件循环的伪代码，帮助你理解它的工作原理
# 真实的事件循环（asyncio）比这复杂得多，但核心思想一致

# 这是一个简化的示意，不是真实代码
# 定义函数 event_loop，参数: tasks
def event_loop(tasks):
    # tasks 是一个任务队列，每个任务是一个协程
    # 事件循环不断轮询，直到所有任务完成
    while tasks:
        # 从队列里取出一个准备好的任务
        # 定义变量 task，赋值为 tasks.pop(0)
        task = tasks.pop(0)
        # 尝试执行这个任务
        try:
            # 执行到下一个 await 点，返回控制权
            # 这里用 next 模拟协程的恢复执行
            task.send(None)
            # 如果没有报错，说明任务还没结束（遇到 await 挂起了）
            # 把它重新放回队列，等下一轮再执行
            tasks.append(task)
        except StopIteration:
            # StopIteration 表示协程执行完毕，不再放回队列
            # 这就是任务正常结束的信号
            pass

# 怎么想：事件循环本质就是「轮询 + 调度」
# 它不停地问：「谁准备好了？谁能跑了？」
# 然后把准备好任务拿出来跑一小段，跑到下一个 await 再挂起
# 这样一个线程就能同时管理成千上万个协程
\`\`\`

事件循环的关键能力是**协作式多任务**：协程主动用 await 让出控制权，事件循环调度其他协程。这跟线程的抢占式多任务不同——线程是被操作系统强制切换的，你控制不了时机；协程是你自己决定在哪里让出（await 的位置），切换成本极低。

## 三、async def：定义协程

在 Python 里，用 \`async def\` 定义的函数叫**协程函数**。调用它不会立即执行，而是返回一个**协程对象**。必须用 await 或事件循环来驱动它才会真正执行。

\`\`\`python
# 导入 asyncio 模块，这是 Python 内置的异步库
# asyncio 提供了事件循环、协程调度、异步 I/O 等基础设施
import asyncio

# 用 async def 定义一个协程函数
# 注意：async def 定义的函数，调用后返回的是「协程对象」而非结果
# 定义协程函数 say_hello，参数: name
async def say_hello(name):
    # 这里的代码不会立即执行，只有在被 await 或事件循环调度时才执行
    # 打印
    print(f"开始打招呼: {name}")
    # await asyncio.sleep(1) 表示「暂停 1 秒，期间让出控制权给事件循环」
    # 这 1 秒里事件循环可以去执行其他协程
    # 注意：time.sleep(1) 是同步阻塞的，不能用！后面会详细讲
    await asyncio.sleep(1)
    # 1 秒后恢复执行
    # 打印
    print(f"你好, {name}!")

# 直接调用协程函数，得到的是一个协程对象，不会执行
# 定义变量 coro，赋值为 say_hello("小明")
coro = say_hello("小明")
# 打印 coro 的类型，会显示 <class 'coroutine'>
# print(type(coro))  # <class 'coroutine'>

# 要真正执行协程，有两种方式：
# 方式 1：用 asyncio.run()（推荐，Python 3.7+）
# asyncio.run 会创建事件循环、运行协程、关闭事件循环，一步到位
# 调用 asyncio.run(say_hello("小明"))
asyncio.run(say_hello("小明"))

# 方式 2：在已有事件循环中用 await
# 在另一个 async 函数里：await say_hello("小明")
\`\`\`

**关键区别**：\`def\` 定义的普通函数，调用就执行，返回结果。\`async def\` 定义的协程函数，调用返回协程对象，必须被 await 或事件循环驱动才执行。这是初学者最容易混淆的点。

## 四、await：等待异步操作

await 只能在 async def 函数里使用。它的作用是：**等待一个可等待对象（awaitable）完成，期间让出控制权给事件循环**。

可等待对象包括：协程对象、Task 对象、Future 对象。最常见的就是 await 另一个 async 函数的调用。

\`\`\`python
# 导入 asyncio 模块
import asyncio
# 导入 time 模块，用于对比同步和异步的耗时
import time

# 定义协程函数 fetch_data，参数: id, delay
# 模拟一个异步 I/O 操作（比如查数据库）
async def fetch_data(id, delay):
    # 打印开始
    print(f"[{id}] 开始获取数据...")
    # await asyncio.sleep(delay) 模拟 I/O 等待
    # 这期间事件循环可以执行其他协程
    await asyncio.sleep(delay)
    # 打印完成
    print(f"[{id}] 数据获取完成")
    # 返回结果
    return {"id": id, "data": f"数据_{id}"}

# 定义协程函数 main，演示 await 的顺序执行
async def main():
    # 记录开始时间
    # 定义变量 start，赋值为 time.time()
    start = time.time()

    # 顺序 await：第一个完成才开始第二个
    # 这里的 await 是「等这个完成再继续」的意思
    # 定义变量 r1，赋值为 await fetch_data(1, 2)
    # 等 fetch_data(1, 2) 完成（2 秒），结果赋给 r1
    r1 = await fetch_data(1, 2)
    # 再等 fetch_data(2, 1) 完成（1 秒），结果赋给 r2
    # 定义变量 r2，赋值为 await fetch_data(2, 1)
    r2 = await fetch_data(2, 1)

    # 总耗时约 3 秒（2 + 1），因为是顺序等待
    # 打印耗时
    print(f"总耗时: {time.time() - start:.2f}秒")
    # 打印结果
    print(f"结果: {r1}, {r2}")

# 运行主协程
# 调用 asyncio.run(main())
asyncio.run(main())
\`\`\`

注意：上面的代码虽然是异步的，但用了两次顺序 await，所以总耗时是 2+1=3 秒，并没有比同步快。**异步不等于并行**——要真正并发，需要用 \`asyncio.gather\` 或 \`asyncio.create_task\`（下一章详解）。

## 五、asyncio.gather：并发执行多个协程

\`asyncio.gather\` 可以同时启动多个协程，等它们全部完成。这是异步编程真正发挥威力的地方。

\`\`\`python
# 导入 asyncio 模块
import asyncio
# 导入 time 模块
import time

# 定义协程函数 fetch_data，参数: id, delay
async def fetch_data(id, delay):
    # 打印开始
    print(f"[{id}] 开始获取数据...")
    # 模拟 I/O 等待
    await asyncio.sleep(delay)
    # 打印完成
    print(f"[{id}] 数据获取完成")
    # 返回结果
    return {"id": id, "data": f"数据_{id}"}

# 定义协程函数 main，演示并发执行
async def main():
    # 记录开始时间
    start = time.time()

    # asyncio.gather 同时启动多个协程，并发执行
    # 传入多个协程对象，gather 会把它们都加入事件循环
    # 返回一个聚合的 awaitable，await 后得到结果列表
    # 定义变量 results，赋值为 await asyncio.gather(fetch_data(1, 2), fetch_data(2, 1), fetch_data(3, 3))
    # 三个协程同时开始，总耗时 = max(2, 1, 3) = 3 秒，而不是 2+1+3=6 秒
    results = await asyncio.gather(
        fetch_data(1, 2),  # 耗时 2 秒
        fetch_data(2, 1),  # 耗时 1 秒
        fetch_data(3, 3),  # 耗时 3 秒
    )

    # 总耗时约 3 秒（取最长的那个），而不是 6 秒
    # 打印耗时
    print(f"总耗时: {time.time() - start:.2f}秒")
    # 打印结果，results 是一个列表，顺序跟传入的协程顺序一致
    # 打印结果
    print(f"结果: {results}")

# 运行
# 调用 asyncio.run(main())
asyncio.run(main())
\`\`\`

这就是异步的核心优势：**I/O 密集型任务并发执行，总耗时约等于最慢的那个**。如果你要调 10 个外部 API，每个 200ms，同步要 2 秒，异步只要 200ms。提升 10 倍。

## 六、FastAPI 中 async def vs def：什么时候用哪个

FastAPI 有一个非常贴心的设计：路由函数你可以用 \`async def\` 也可以用普通 \`def\`。

- **async def**：函数在事件循环里执行，你可以在里面 await。但如果里面调用了同步阻塞代码（如 \`time.sleep\`、同步数据库驱动），会阻塞整个事件循环，所有请求都卡住。
- **def**（普通函数）：FastAPI 会自动把它丢到**线程池**里执行，不会阻塞事件循环。适合调用同步阻塞库（如 requests、同步数据库驱动 psycopg2）。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 导入 time 模块
import time
# 导入 asyncio 模块
import asyncio

# 创建 FastAPI 应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 情况 1：用 async def + 纯异步操作（推荐）
# 这个路由调用的是异步 I/O（asyncio.sleep），不会阻塞事件循环
# 定义 async 函数 async_endpoint
@app.get("/async-good")
async def async_endpoint():
    # asyncio.sleep 是非阻塞的，等待期间事件循环能处理其他请求
    await asyncio.sleep(1)
    # 返回结果
    return {"msg": "异步处理完成"}

# 情况 2：用 async def + 同步阻塞代码（灾难！绝对不要这样）
# 这个路由会阻塞整个事件循环，所有其他请求都会卡住
# 定义 async 函数 async_bad
@app.get("/async-bad")
async def async_bad():
    # time.sleep 是同步阻塞的！它会占住事件循环 2 秒
    # 这 2 秒里，所有其他请求（包括 /async-good）都无法处理
    # 这是异步编程最常见的陷阱
    time.sleep(2)
    # 返回结果
    return {"msg": "我阻塞了所有人"}

# 情况 3：用普通 def + 同步阻塞代码（安全）
# FastAPI 会自动把普通 def 函数放到线程池执行
# 线程池有多个线程，一个被阻塞不影响事件循环
# 定义函数 sync_endpoint
@app.get("/sync-good")
def sync_endpoint():
    # 虽然是 time.sleep，但在线程池里执行，不阻塞事件循环
    time.sleep(2)
    # 返回结果
    return {"msg": "线程池里阻塞，不影响别人"}

# 怎么选？记住这条规则：
# - 如果你的函数里要 await 异步库（asyncpg、httpx.AsyncClient）→ async def
# - 如果你的函数调用同步阻塞库（requests、psycopg2）→ 普通 def
# - 不确定就用普通 def，FastAPI 自动处理，安全保底
\`\`\`

## 七、异步陷阱：在 async 中调用同步阻塞代码

这是新手最容易踩的坑，也是异步 bug 里最难排查的。一旦踩中，表现是：**整个服务卡顿，所有请求变慢，好像只有一个线程在工作**。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 导入 time 模块
import time
# 导入 asyncio 模块
import asyncio
# 导入 requests（同步 HTTP 库，会阻塞）
import requests

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 陷阱 1：在 async 函数里用 time.sleep
# 定义 async 函数 trap1
@app.get("/trap1")
async def trap1():
    # time.sleep 会阻塞事件循环！
    # 这 3 秒里，整个服务无法处理任何其他请求
    # 即使其他路由是 async 的也会卡住
    time.sleep(3)
    # 返回结果
    return {"msg": "我卡住了所有人 3 秒"}

# 陷阱 2：在 async 函数里用 requests.get
# 定义 async 函数 trap2
@app.get("/trap2")
async def trap2():
    # requests.get 是同步阻塞的 HTTP 请求
    # 它会占住事件循环，直到响应返回
    # 如果目标网站慢，整个服务跟着慢
    # 定义变量 r，赋值为 requests.get("https://httpbin.org/delay/2")
    r = requests.get("https://httpbin.org/delay/2")
    # 返回结果
    return r.json()

# 正确做法 1：改用普通 def（让 FastAPI 自动放线程池）
# 定义函数 correct1
@app.get("/correct1")
def correct1():
    # 普通 def 函数，FastAPI 放进线程池执行
    # time.sleep 只阻塞线程池里的一个线程，不影响事件循环
    time.sleep(3)
    # 返回结果
    return {"msg": "线程池里阻塞，安全"}

# 正确做法 2：改用异步库（最佳方案）
# 需要安装 httpx: pip install httpx
# 定义 async 函数 correct2
@app.get("/correct2")
async def correct2():
    # 导入 httpx 的异步客户端
    # httpx 是 requests 的异步替代品，API 几乎一样
    # 定义变量 client，赋值为 httpx.AsyncClient()
    async with httpx.AsyncClient() as client:
        # await client.get 是非阻塞的，等待期间事件循环能处理其他请求
        # 定义变量 r，赋值为 await client.get("https://httpbin.org/delay/2")
        r = await client.get("https://httpbin.org/delay/2")
    # 返回结果
    return r.json()

# 如果非要在 async 函数里调用同步阻塞代码，可以用 run_in_executor
# 定义 async 函数 correct3
@app.get("/correct3")
async def correct3():
    # asyncio.to_thread（Python 3.9+）把同步函数丢到线程池执行
    # 定义变量 result，赋值为 await asyncio.to_thread(time.sleep, 3)
    # 这等价于在线程池里执行 time.sleep(3)，不阻塞事件循环
    await asyncio.to_thread(time.sleep, 3)
    # 返回结果
    return {"msg": "用 to_thread 在线程池里阻塞"}

# 导入 httpx（放在这里是为了演示，实际应该在文件顶部）
import httpx
\`\`\`

**记住这条铁律**：在 \`async def\` 函数里，绝对不能直接调用同步阻塞代码。\`time.sleep\`、\`requests.get\`、\`open().read()\`（大文件）、同步数据库查询——这些都是定时炸弹。要么换成异步库，要么用 \`asyncio.to_thread\` 丢到线程池，要么干脆用普通 \`def\` 让 FastAPI 自动处理。

## 八、asyncio.create_task：创建后台任务

\`asyncio.create_task\` 可以把协程包装成 Task，立刻在事件循环里开始执行，不需要 await 就能跑。适合「启动后不用等结果」的场景。

\`\`\`python
# 导入 asyncio 模块
import asyncio

# 定义协程函数 background_work，参数: name
async def background_work(name):
    # 打印开始
    print(f"[{name}] 后台任务开始")
    # 模拟耗时操作
    await asyncio.sleep(2)
    # 打印完成
    print(f"[{name}] 后台任务完成")
    # 返回结果
    return f"{name}的结果"

# 定义协程函数 main
async def main():
    # create_task 立刻把协程加入事件循环，返回 Task 对象
    # Task 一创建就开始执行，不需要 await
    # 定义变量 task1，赋值为 asyncio.create_task(background_work("任务A"))
    task1 = asyncio.create_task(background_work("任务A"))
    # 定义变量 task2，赋值为 asyncio.create_task(background_work("任务B"))
    task2 = asyncio.create_task(background_work("任务B"))

    # 此时 task1 和 task2 已经在后台并发执行了
    # 我们可以做别的事情
    # 打印
    print("主协程做其他事...")
    await asyncio.sleep(1)
    # 打印
    print("主协程继续...")

    # 等两个任务都完成，收集结果
    # 定义变量 r1，赋值为 await task1
    r1 = await task1
    # 定义变量 r2，赋值为 await task2
    r2 = await task2
    # 打印结果
    print(f"结果: {r1}, {r2}")

# 运行
# 调用 asyncio.run(main())
asyncio.run(main())
\`\`\`

\`create_task\` 和 \`gather\` 的区别：gather 是「同时启动并等全部完成」，create_task 是「启动后可以先干别的，之后再等结果」。后者更灵活，适合需要先启动任务、中间做其他事、最后收集结果的场景。

## 九、设计思想：异步不是银弹

异步编程能大幅提升 I/O 密集型场景的吞吐量，但它不是万能的：

1. **CPU 密集型任务不适合**：异步优势在 I/O 等待期间切换任务。如果是纯 CPU 计算（图片处理、加密运算），没有 I/O 等待，异步反而比多线程/多进程更慢（协程切换也有开销）。CPU 密集用多进程（ProcessPoolExecutor）。

2. **代码复杂度增加**：async/await 会「传染」——一个函数用了 async，调用它的函数也得 async。整个调用链都要异步化，否则在 async 函数里调同步函数又会阻塞。这就是为什么异步生态需要一整套异步库（asyncpg、aioredis、httpx）。

3. **调试更难**：异步代码的执行顺序不是线性的，异常堆栈可能跨协程，调试比同步代码复杂。幸好 Python 3.x 的 asyncio 调试模式（\`asyncio.run(main(), debug=True)\`）能帮上忙。

**选型建议**：
- I/O 密集 + 高并发（API 网关、聊天室、爬虫）→ 异步
- CPU 密集（数据分析、机器学习）→ 多进程
- 混合型 → 异步处理 I/O + 进程池处理 CPU（\`asyncio.get_event_loop().run_in_executor(ProcessPoolExecutor(), fn)\`）

FastAPI 的优势在于**两种模式都支持**：async def 走事件循环，def 走线程池。你可以按路由特性灵活选择，不必全盘异步化。这也是 FastAPI 比纯异步框架（如 Sanic）更易用的原因。
`
  },
  {
    id: "fp-async-db-http",
    group: "异步编程",
    icon: "🔌",
    title: "异步数据库与 HTTP 客户端",
    content: `# 异步数据库与 HTTP 客户端

## 一、为什么需要异步数据库和 HTTP 客户端

上一章我们讲了 async/await 的基础。但光知道语法不够——如果你的数据库驱动是同步的，在 async 函数里调用它照样阻塞事件循环。**异步编程要发挥威力，整个调用链都必须是异步的**。

这一章解决两个核心问题：
1. **异步数据库**：用 asyncpg / SQLAlchemy 异步模式查询数据库，不阻塞事件循环。
2. **异步 HTTP 客户端**：用 httpx 异步调用外部 API，并发请求提速 10 倍。

类比：如果你的餐厅服务员（事件循环）很高效，但厨房（数据库）和供应商（外部 API）还是同步的——服务员下单后还得傻等——那服务员再快也没用。必须让厨房和供应商也「异步化」（下单后按铃通知），整个链路才真正高效。

## 二、asyncpg：高性能异步 PostgreSQL 驱动

asyncpg 是 PostgreSQL 最快的 Python 异步驱动，直接使用 PostgreSQL 协议，比 psycopg2 快 3-5 倍。

\`\`\`python
# 导入 asyncpg 模块（需要安装: pip install asyncpg）
# asyncpg 是专门为 PostgreSQL 设计的异步驱动
# 它不兼容 DB-API 2.0 规范，API 是自己设计的，更高效
import asyncpg
# 导入 asyncio 模块
import asyncio

# 定义协程函数 main，演示 asyncpg 基本用法
async def main():
    # 创建连接池：asyncpg.create_pool
    # 连接池会维护多个数据库连接，复用避免反复建连
    # 参数: host、port、user、password、database、min_size（最小连接数）、max_size（最大连接数）
    # async with 确保使用完毕后正确关闭连接池
    async with asyncpg.create_pool(
        host="localhost",
        port=5432,
        user="postgres",
        password="secret",
        database="mydb",
        min_size=5,   # 最少保持 5 个连接
        max_size=20,  # 最多 20 个连接
    ) as pool:
        # 从连接池获取一个连接
        # async with 确保用完归还连接
        async with pool.acquire() as conn:
            # 执行 SQL（不需要 commit，asyncpg 默认自动提交）
            # conn.execute 返回状态字符串（如 'INSERT 0 1'）
            # 创建表
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    age INT
                )
            """)

            # 插入数据：用 $1, $2 占位符（asyncpg 不用 %s 或 ?）
            # $1, $2 是 PostgreSQL 原生参数化语法，防 SQL 注入
            await conn.execute(
                "INSERT INTO users (name, age) VALUES ($1, $2)",
                "小明", 25
            )

            # 查询单行：conn.fetchrow 返回一个 Record 对象（像字典）
            # 定义变量 row，赋值为 await conn.fetchrow("SELECT * FROM users WHERE name=$1", "小明")
            row = await conn.fetchrow("SELECT * FROM users WHERE name=$1", "小明")
            # 打印
            print(f"单行: {dict(row)}")  # {'id': 1, 'name': '小明', 'age': 25}

            # 查询多行：conn.fetch 返回列表
            rows = await conn.fetch("SELECT * FROM users")
            for r in rows:
                # 打印每一行
                print(f"行: {dict(r)}")

# 运行
# 调用 asyncio.run(main())
asyncio.run(main())
\`\`\`

asyncpg 的三个核心查询方法：
- \`fetchrow\`：查一行，返回 Record 或 None
- \`fetch\`：查多行，返回 List[Record]
- \`fetchval\`：查单个值（如 COUNT），返回标量

## 三、SQLAlchemy 异步模式

如果你用 SQLAlchemy ORM（大多数人会用），从 1.4 版本开始原生支持异步。需要用 \`asyncpg\` 作为底层驱动。

\`\`\`python
# 导入 SQLAlchemy 异步相关模块
# 需要 SQLAlchemy 1.4+ 和 asyncpg
from sqlalchemy.ext.asyncio import (
    AsyncSession,           # 异步 Session，替代同步的 Session
    async_sessionmaker,     # 异步 Session 工厂
    create_async_engine,    # 异步引擎，替代 create_engine
)
# 导入 ORM 声明式基类
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
# 导入 select 用于查询
from sqlalchemy import select
# 导入 asyncio
import asyncio

# 定义声明式基类
class Base(DeclarativeBase):
    pass

# 定义 User 模型
class User(Base):
    # 表名
    __tablename__ = "users"
    # id 列：主键、自增
    id: Mapped[int] = mapped_column(primary_key=True)
    # name 列：字符串、非空
    name: Mapped[str]
    # age 列：整数、可空
    age: Mapped[int] = mapped_column(nullable=True)

# 创建异步引擎
# create_async_engine 的 URL 用 postgresql+asyncpg:// 开头
# 表示用 asyncpg 作为异步驱动
# echo=True 会打印 SQL 日志，方便调试
engine = create_async_engine(
    "postgresql+asyncpg://postgres:secret@localhost/mydb",
    echo=True,
    pool_size=10,      # 连接池大小
    max_overflow=20,   # 超出 pool_size 后还能创建的连接数
)

# 创建异步 Session 工厂
# async_sessionmaker 是 Session 工厂，每次调用生成一个 AsyncSession
# 定义变量 AsyncSessionLocal，赋值为 async_sessionmaker(engine, expire_on_commit=False)
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # commit 后对象不过期，避免再次查询触发同步 I/O
)

# 定义协程函数 create_tables，创建表
async def create_tables():
    # 用 engine.begin() 开启事务，自动 commit/rollback
    async with engine.begin() as conn:
        # 创建所有表
        await conn.run_sync(Base.metadata.create_all)

# 定义协程函数 create_user，参数: name, age
async def create_user(name: str, age: int):
    # 创建 Session
    async with AsyncSessionLocal() as session:
        # 创建 User 对象
        user = User(name=name, age=age)
        # 添加到 Session
        session.add(user)
        # 提交事务
        await session.commit()
        # 刷新以获取自增 id
        await session.refresh(user)
        # 返回
        return user

# 定义协程函数 get_users，查询所有用户
async def get_users():
    async with AsyncSessionLocal() as session:
        # select(User) 构建查询语句
        # await session.execute 执行查询
        # .scalars() 把结果转成 User 对象（而非 Row 元组）
        # .all() 转成列表
        result = await session.execute(select(User))
        return result.scalars().all()

# 定义协程函数 main
async def main():
    # 创建表
    await create_tables()
    # 创建用户
    await create_user("小明", 25)
    await create_user("小红", 22)
    # 查询所有用户
    users = await get_users()
    for u in users:
        # 打印
        print(f"用户: {u.id} - {u.name} - {u.age}")
    # 关闭引擎
    await engine.dispose()

# 运行
# 调用 asyncio.run(main())
asyncio.run(main())
\`\`\`

**SQLAlchemy 异步的关键点**：
1. 用 \`create_async_engine\` 而非 \`create_engine\`
2. 用 \`AsyncSession\` 而非 \`Session\`
3. 所有 I/O 操作都要 await（\`session.execute\`、\`session.commit\`、\`session.refresh\`）
4. URL 前缀是 \`postgresql+asyncpg://\` 或 \`mysql+aiomysql://\` 或 \`sqlite+aiosqlite://\`

## 四、httpx：异步 HTTP 客户端

httpx 是 requests 的现代替代品，支持同步和异步两种模式。在 FastAPI 里调用外部 API，httpx 是首选。

\`\`\`python
# 导入 httpx 模块（需要安装: pip install httpx）
import httpx
# 导入 asyncio 模块
import asyncio

# 定义协程函数 fetch_user，参数: user_id
# 演示异步 GET 请求
async def fetch_user(user_id):
    # httpx.AsyncClient 是异步客户端
    # async with 确保用完关闭连接池
    # 可以复用连接，比每次新建连接快得多
    async with httpx.AsyncClient() as client:
        # await client.get 发起异步 GET 请求
        # 不阻塞事件循环，等待期间可以处理其他协程
        # 定义变量 r，赋值为 await client.get(f"https://jsonplaceholder.typicode.com/users/{user_id}")
        r = await client.get(f"https://jsonplaceholder.typicode.com/users/{user_id}")

        # r.status_code 是 HTTP 状态码
        # r.json() 把响应体解析成字典
        # 打印状态码
        print(f"状态码: {r.status_code}")
        # 返回 JSON 数据
        return r.json()

# 定义协程函数 create_post
# 演示异步 POST 请求
async def create_post():
    async with httpx.AsyncClient() as client:
        # POST 请求：json 参数自动序列化 body 并设置 Content-Type
        # 定义变量 r，赋值为 await client.post(url, json=payload)
        r = await client.post(
            "https://jsonplaceholder.typicode.com/posts",
            json={
                "title": "FastAPI 异步",
                "body": "httpx 真好用",
                "userId": 1
            }
        )
        # 返回结果
        return r.json()

# 定义协程函数 main
async def main():
    # 调用 fetch_user
    user = await fetch_user(1)
    # 打印用户
    print(f"用户: {user['name']}")

    # 调用 create_post
    post = await create_post()
    # 打印帖子
    print(f"帖子: {post}")

# 运行
# 调用 asyncio.run(main())
asyncio.run(main())
\`\`\`

## 五、asyncio.gather 并发请求：10 倍提速

这是异步 HTTP 客户端最有价值的场景——同时发起多个请求，总耗时约等于最慢的那个。

\`\`\`python
# 导入 httpx 和 asyncio
import httpx
import asyncio
# 导入 time 用于计时
import time

# 定义协程函数 fetch_user，参数: client, user_id
# 注意：传入共享的 client，复用连接池，性能更好
async def fetch_user(client, user_id):
    # 打印开始
    print(f"[{user_id}] 开始请求...")
    # 发起请求
    r = await client.get(f"https://jsonplaceholder.typicode.com/users/{user_id}")
    # 打印完成
    print(f"[{user_id}] 完成")
    # 返回 JSON
    return r.json()

# 定义协程函数 fetch_all_sync，顺序请求（慢）
async def fetch_all_sync():
    # 记录开始时间
    start = time.time()
    async with httpx.AsyncClient() as client:
        results = []
        # 顺序请求 10 个用户：一个完成才请求下一个
        for i in range(1, 11):
            # await 一个一个等
            user = await fetch_user(client, i)
            results.append(user)
        # 打印耗时
        print(f"顺序请求耗时: {time.time() - start:.2f}秒")
        return results

# 定义协程函数 fetch_all_concurrent，并发请求（快）
async def fetch_all_concurrent():
    # 记录开始时间
    start = time.time()
    async with httpx.AsyncClient() as client:
        # 用列表推导创建 10 个协程任务
        tasks = [fetch_user(client, i) for i in range(1, 11)]
        # asyncio.gather 同时启动所有任务，并发执行
        # 10 个请求同时发出，总耗时 ≈ 单个请求的耗时
        results = await asyncio.gather(*tasks)
        # 打印耗时
        print(f"并发请求耗时: {time.time() - start:.2f}秒")
        return results

# 定义协程函数 main
async def main():
    # 对比两种方式
    # 打印分隔线
    print("===== 顺序请求 =====")
    await fetch_all_sync()
    # 打印分隔线
    print("===== 并发请求 =====")
    await fetch_all_concurrent()

# 运行
# 调用 asyncio.run(main())
asyncio.run(main())
\`\`\`

如果每个请求 200ms，10 个请求：顺序 = 2 秒，并发 = 200ms。**10 倍差距**。这就是为什么高并发 API 必须用异步。

## 六、超时控制：防止无限等待

外部 API 可能会卡住、超慢、不响应。如果不设超时，你的请求会永远等下去，耗尽资源。

\`\`\`python
# 导入 httpx 和 asyncio
import httpx
import asyncio

# 方式 1：全局超时（推荐）
# 定义协程函数 fetch_with_timeout，参数: url
async def fetch_with_timeout(url):
    # timeout 参数设置超时
    # httpx.Timeout(connect=5, read=10, write=5, pool=5)
    # connect: 建立连接超时
    # read: 读取响应超时
    # write: 发送请求超时
    # pool: 从连接池获取连接超时
    async with httpx.AsyncClient(
        timeout=httpx.Timeout(10.0)  # 所有阶段统一 10 秒超时
    ) as client:
        try:
            # 发起请求
            r = await client.get(url)
            # 返回 JSON
            return r.json()
        except httpx.TimeoutException:
            # 超时异常，httpx.TimeoutException 是所有超时异常的基类
            # 打印
            print("请求超时！")
            return None
        except httpx.HTTPError as e:
            # 其他 HTTP 错误（连接错误、解析错误等）
            # 打印错误
            print(f"HTTP 错误: {e}")
            return None

# 方式 2：单次请求超时
# 定义协程函数 fetch_one_with_timeout，参数: url
async def fetch_one_with_timeout(url):
    async with httpx.AsyncClient() as client:
        try:
            # 单次请求设置超时，覆盖客户端默认值
            r = await client.get(url, timeout=5.0)
            # 返回 JSON
            return r.json()
        except httpx.TimeoutException:
            # 打印
            print("单次请求超时")
            return None

# 方式 3：用 asyncio.wait_for（适用于任何协程）
# 定义协程函数 fetch_with_waitfor，参数: url
async def fetch_with_waitfor(url):
    async with httpx.AsyncClient() as client:
        try:
            # asyncio.wait_for 给任何协程设置超时
            # 定义变量 r，赋值为 await asyncio.wait_for(client.get(url), timeout=5.0)
            r = await asyncio.wait_for(client.get(url), timeout=5.0)
            # 返回 JSON
            return r.json()
        except asyncio.TimeoutError:
            # asyncio.TimeoutError 是 asyncio.wait_for 的超时异常
            # 打印
            print("asyncio 超时")
            return None

# 定义协程函数 main
async def main():
    # 测试超时（访问一个会延迟的接口）
    # 定义变量 result，赋值为 await fetch_with_timeout("https://httpbin.org/delay/15")
    result = await fetch_with_timeout("https://httpbin.org/delay/15")
    # 打印结果
    print(f"结果: {result}")

# 运行
# 调用 asyncio.run(main())
asyncio.run(main())
\`\`\`

**超时设计原则**：永远设置超时！没有超时的网络请求是生产事故的温床。一般 API 调用设 5-10 秒，数据库查询设 3-5 秒。宁可超时重试，也不要无限等待。

## 七、连接池复用：性能优化的关键

每次 HTTP 请求都建立 TCP 连接（三次握手）开销很大。连接池复用 TCP 连接，大幅提升性能。

\`\`\`python
# 导入 httpx 和 asyncio
import httpx
import asyncio
# 导入 time 用于计时
import time

# 错误做法：每次请求新建客户端（慢）
# 定义协程函数 bad_practice
async def bad_practice():
    start = time.time()
    for i in range(10):
        # 每次循环都新建 AsyncClient，每次都要 TCP 握手
        async with httpx.AsyncClient() as client:
            await client.get(f"https://jsonplaceholder.typicode.com/users/{i+1}")
    # 打印耗时
    print(f"每次新建客户端: {time.time() - start:.2f}秒")

# 正确做法 1：共享客户端（推荐）
# 定义协程函数 good_practice
async def good_practice():
    start = time.time()
    # 一个客户端复用所有连接
    async with httpx.AsyncClient() as client:
        for i in range(10):
            await client.get(f"https://jsonplaceholder.typicode.com/users/{i+1}")
    # 打印耗时
    print(f"共享客户端: {time.time() - start:.2f}秒")

# 正确做法 2：应用级全局客户端（最佳）
# 在 FastAPI 应用中，通常创建一个全局 client，所有请求共享
# 定义全局变量 app_client，初始为 None
app_client = None

# 定义协程函数 init_client，初始化全局客户端
async def init_client():
    # 用 global 声明修改全局变量
    global app_client
    # 创建客户端，设置连接池参数
    app_client = httpx.AsyncClient(
        limits=httpx.Limits(
            max_connections=100,        # 最大连接数
            max_keepalive_connections=20,  # 保持的空闲连接数
            keepalive_expiry=30,        # 空闲连接 30 秒后关闭
        ),
        timeout=httpx.Timeout(10.0),
    )

# 定义协程函数 close_client，关闭全局客户端
async def close_client():
    global app_client
    if app_client:
        # 关闭客户端，释放连接
        await app_client.aclose()
        app_client = None

# 在 FastAPI 中使用：
# from fastapi import FastAPI
# 定义变量 app，赋值为 FastAPI()
# app.on_event("startup")(init_client)
# app.on_event("shutdown")(close_client)
# 然后在路由里直接用 app_client 发请求

# 定义协程函数 main
async def main():
    # 打印分隔线
    print("===== 对比测试 =====")
    await bad_practice()
    await good_practice()

# 运行
# 调用 asyncio.run(main())
asyncio.run(main())
\`\`\`

连接池复用在 FastAPI 中的最佳实践：在 startup 事件创建全局 \`AsyncClient\`，在 shutdown 事件关闭，所有路由共享这一个客户端。这样 TCP 连接被复用，省去了反复握手的时间。

## 八、异步上下文管理器：async with

\`async with\` 是异步版本的上下文管理器，用于管理需要异步初始化和清理的资源（如数据库连接、HTTP 客户端）。

\`\`\`python
# 导入 asyncio
import asyncio

# 定义类 AsyncDBConnection，模拟异步数据库连接
class AsyncDBConnection:
    # 定义 __aenter__，异步进入上下文（替代 __enter__）
    async def __aenter__(self):
        # 模拟异步建立连接
        print("正在连接数据库...")
        await asyncio.sleep(0.5)
        print("连接成功")
        # 返回 self，赋值给 as 后面的变量
        return self

    # 定义 __aexit__，异步退出上下文（替代 __exit__）
    # 参数: exc_type, exc_val, exc_tb（异常信息，无异常时为 None）
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        # 模拟异步关闭连接
        print("正在关闭连接...")
        await asyncio.sleep(0.3)
        print("连接已关闭")
        # 返回 False 表示不吞异常（异常会继续抛出）

    # 定义方法 query，参数: sql
    async def query(self, sql):
        # 模拟异步查询
        print(f"执行查询: {sql}")
        await asyncio.sleep(0.2)
        return f"结果: {sql}"

# 使用 async with
# 定义协程函数 main
async def main():
    # async with 会自动调用 __aenter__ 和 __aexit__
    # 即使中间抛异常，__aexit__ 也会被调用（确保资源释放）
    async with AsyncDBConnection() as db:
        # 在这里使用 db
        result = await db.query("SELECT * FROM users")
        # 打印结果
        print(result)

    # 离开 async with 后，连接已自动关闭
    # 打印
    print("操作完成")

# 运行
# 调用 asyncio.run(main())
asyncio.run(main())
\`\`\`

\`async with\` 的核心价值：**资源安全释放**。无论中间是否抛异常，\`__aexit__\` 都会被调用，连接一定会被关闭。这比手动 try/finally 更简洁可靠。asyncpg 的连接池、httpx 的 AsyncClient、SQLAlchemy 的 AsyncSession 都是用 \`async with\` 管理的。

## 九、设计思想：异步全链路

异步编程的核心原则是**全链路异步**——从 HTTP 请求到数据库到外部 API，每一个 I/O 环节都必须是异步的。一个同步阻塞点就会让整个事件循环卡住，前面所有的异步优化全部白费。

这就像高速公路：整条路都是高速，但中间有一个红绿灯路口，整条路的平均车速就被那个路口拉下来了。异步编程容不下任何「同步阻塞路口」。

所以选库的时候要注意：用 asyncpg 不用 psycopg2，用 httpx.AsyncClient 不用 requests，用 aioredis 不用 redis-py 的同步模式。**生态决定成败**——Python 的异步生态已经比较成熟，主流数据库和中间件都有异步驱动，但一些小众库可能只有同步版本，这时候要么换库，要么用 \`asyncio.to_thread\` 兜底。

最后提醒：**不要为了异步而异步**。如果你的 QPS 不高（比如内部管理系统），同步代码更简单、更好维护，性能完全够用。异步是高并发场景的优化手段，不是默认选择。先写对，再写快。
`
  },
  {
    id: "fp-background-tasks",
    group: "异步编程",
    icon: "📬",
    title: "后台任务与消息队列",
    content: `# 后台任务与消息队列

## 一、为什么需要后台任务

Web 请求有一个黄金法则：**快速响应**。用户发起请求，服务器应该在几百毫秒内返回结果。但有些操作天生就慢：

- 发邮件（SMTP 握手 + 传输，可能 2-5 秒）
- 生成 PDF 报告（渲染可能 10 秒）
- 处理视频/图片（几十秒到几分钟）
- 批量数据导入（可能几分钟）
- 调用慢速第三方 API（不可控）

如果这些操作放在请求里同步执行，用户要等十几秒甚至超时。**后台任务的核心思想**：把这些慢操作丢到后台，请求立刻返回「已接受」，用户不用等。

类比：你去快递柜寄件。前台扫码登记（请求处理），秒级完成。真正的运输（发邮件、处理数据）由快递员在后台慢慢做。你不用站在那里等包裹送到目的地。

FastAPI 提供了两种后台任务方案：
1. **BackgroundTasks**：轻量级，内置，适合简单场景（发邮件、写日志）。
2. **Celery**：重量级，专业消息队列，适合复杂场景（定时任务、重试、分布式）。

## 二、BackgroundTasks 基本用法

FastAPI 内置的 \`BackgroundTasks\` 非常简单——把函数传进去，请求返回后自动执行。

\`\`\`python
# 从 fastapi 导入 FastAPI, BackgroundTasks
from fastapi import FastAPI, BackgroundTasks

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 定义函数 send_email，参数: email, content
# 注意：这是普通函数（也可以是 async def）
# BackgroundTasks 支持两种函数
def send_email(email: str, content: str):
    # 模拟发邮件（实际用 smtplib 或 SendGrid API）
    # 打印
    print(f"正在发送邮件到 {email}...")
    # 模拟耗时（实际代码用 time.sleep 或 SMTP 操作）
    import time
    time.sleep(3)
    # 打印
    print(f"邮件已发送: {email} - {content}")

# 定义路由 POST /send
# 参数: background_tasks: BackgroundTasks（FastAPI 自动注入）
@app.post("/send")
# 定义函数 send_notification，参数: email: str, background_tasks: BackgroundTasks
def send_notification(email: str, background_tasks: BackgroundTasks):
    # 把 send_email 函数添加到后台任务队列
    # add_task 的参数: 函数 + 函数的参数
    # 这个任务不会立即执行，而是在响应返回之后执行
    background_tasks.add_task(send_email, email, "欢迎注册！")

    # 立刻返回响应，不等邮件发送完成
    # 用户瞬间得到响应，邮件在后台慢慢发
    return {"message": f"已安排发送邮件到 {email}"}

# 执行流程：
# 1. 客户端 POST /send?email=a@b.com
# 2. FastAPI 处理请求，把 send_email 加入后台队列
# 3. FastAPI 返回 {"message": "已安排发送邮件到 a@b.com"}（瞬间）
# 4. 响应发送给客户端后，FastAPI 在后台执行 send_email（3 秒）
# 5. 客户端已经拿到响应了，不用等邮件发完
\`\`\`

**关键点**：\`background_tasks.add_task\` 不阻塞请求。任务在响应返回**之后**才执行。如果任务抛异常，FastAPI 会记录日志但不会影响已返回的响应。

## 三、后台任务执行顺序

\`BackgroundTasks\` 里的任务是**顺序执行**的，不是并发。按添加顺序一个接一个跑。

\`\`\`python
# 从 fastapi 导入 FastAPI, BackgroundTasks
from fastapi import FastAPI, BackgroundTasks
# 导入 time 模块
import time

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 定义函数 task1
def task1():
    # 打印开始
    print("任务1 开始")
    # 模拟耗时
    time.sleep(2)
    # 打印完成
    print("任务1 完成")

# 定义函数 task2
def task2():
    # 打印开始
    print("任务2 开始")
    # 模拟耗时
    time.sleep(1)
    # 打印完成
    print("任务2 完成")

# 定义函数 task3
def task3():
    # 打印开始
    print("任务3 开始")
    # 打印完成
    print("任务3 完成")

# 定义路由
@app.get("/tasks")
# 定义函数 run_tasks，参数: background_tasks: BackgroundTasks
def run_tasks(background_tasks: BackgroundTasks):
    # 按顺序添加三个任务
    # 它们会按添加顺序执行：task1 -> task2 -> task3
    # 总耗时 = 2 + 1 + 0 = 3 秒（不是并发，是顺序）
    background_tasks.add_task(task1)
    background_tasks.add_task(task2)
    background_tasks.add_task(task3)

    # 立刻返回
    return {"message": "任务已安排"}

# 执行顺序：
# task1 完成（2秒）-> task2 完成（1秒）-> task3 完成（瞬间）
# 后台总共 3 秒，但客户端早已收到响应
\`\`\`

**重要**：BackgroundTasks 是**单次执行**的，没有重试机制。如果任务失败了，就失败了，不会重跑。如果需要重试、定时、分布式，得用 Celery。

## 四、BackgroundTasks 的依赖注入用法

BackgroundTasks 也可以通过依赖注入使用，这在需要复用后台任务逻辑时很方便。

\`\`\`python
# 从 fastapi 导入 FastAPI, BackgroundTasks, Depends
from fastapi import FastAPI, BackgroundTasks, Depends
# 导入 time
import time

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 定义函数 write_log，参数: message
def write_log(message: str):
    # 模拟写日志文件
    # 打印
    print(f"[LOG] {message}")
    # 实际代码: with open("app.log", "a") as f: f.write(message + "\\n")

# 定义函数 process_image，参数: image_id
def process_image(image_id: str):
    # 模拟图片处理
    # 打印开始
    print(f"开始处理图片 {image_id}")
    # 模拟耗时
    time.sleep(5)
    # 打印完成
    print(f"图片 {image_id} 处理完成")

# 定义依赖函数 get_background_tasks，参数: background_tasks: BackgroundTasks
# 把 BackgroundTasks 包在依赖里，方便复用
def get_background_tasks(background_tasks: BackgroundTasks):
    # 返回一个封装了任务添加逻辑的对象或函数
    # 这里直接返回 background_tasks，也可以封装成自定义类
    return background_tasks

# 定义路由 POST /upload
@app.post("/upload")
# 定义函数 upload_image，参数: image_id: str, tasks: BackgroundTasks = Depends(get_background_tasks)
def upload_image(image_id: str, tasks: BackgroundTasks = Depends(get_background_tasks)):
    # 通过依赖注入获取 BackgroundTasks
    # 添加日志任务
    tasks.add_task(write_log, f"用户上传了图片 {image_id}")
    # 添加图片处理任务
    tasks.add_task(process_image, image_id)

    # 立刻返回
    return {"message": f"图片 {image_id} 已上传，正在后台处理"}

# 定义路由 POST /batch-upload
@app.post("/batch-upload")
# 定义函数 batch_upload，参数: tasks: BackgroundTasks = Depends(get_background_tasks)
def batch_upload(tasks: BackgroundTasks = Depends(get_background_tasks)):
    # 批量上传，每个图片都添加处理任务
    for i in range(5):
        # 为每个图片添加后台任务
        tasks.add_task(process_image, f"img_{i}")
        tasks.add_task(write_log, f"批量上传: img_{i}")

    # 立刻返回
    return {"message": "5 张图片已安排处理"}
\`\`\`

## 五、Celery 集成：专业消息队列

Celery 是 Python 最流行的分布式任务队列。它通过 **broker**（消息中间件，如 Redis/RabbitMQ）分发任务，通过 **backend** 存储结果。

\`\`\`python
# ============================================================
# Celery 集成示例 —— 需要安装 celery 和 redis
# pip install celery redis
# 还需要运行 Redis 服务: docker run -d -p 6379:6379 redis
# ============================================================

# ---------- celery_app.py ----------
# 从 celery 导入 Celery
from celery import Celery

# 创建 Celery 实例
# broker: 任务消息队列地址（用 Redis）
# backend: 结果存储地址（用 Redis）
# 定义变量 celery_app，赋值为 Celery("myapp", broker="redis://localhost:6379/0", backend="redis://localhost:6379/1")
celery_app = Celery(
    "myapp",
    broker="redis://localhost:6379/0",   # broker 用 0 号库
    backend="redis://localhost:6379/1",  # backend 用 1 号库
)

# 配置 Celery
celery_app.conf.update(
    # 任务序列化格式
    task_serializer="json",
    # 结果序列化格式
    result_serializer="json",
    # 时区
    timezone="Asia/Shanghai",
    # 任务超时（秒）
    task_time_limit=300,
    # 软超时（秒），超时后抛 SoftTimeLimitExceeded，任务可以捕获
    task_soft_time_limit=240,
)

# 用 @celery_app.task 装饰器定义任务
# bind=True 让任务函数能访问 self（任务实例）
# 定义任务 send_welcome_email，参数: self, user_email
@celery_app.task(bind=True)
def send_welcome_email(self, user_email):
    # self 是任务实例，可以访问任务信息（如 self.request.id）
    # 打印任务 ID
    print(f"任务 {self.request.id}: 给 {user_email} 发欢迎邮件")
    # 模拟发邮件
    import time
    time.sleep(5)
    # 打印完成
    print(f"邮件已发送到 {user_email}")
    # 返回结果（会存到 backend）
    return {"email": user_email, "status": "sent"}

# 定义任务 generate_report，参数: report_id
@celery_app.task
def generate_report(report_id):
    # 模拟生成报表
    import time
    # 打印开始
    print(f"开始生成报表 {report_id}")
    time.sleep(10)
    # 打印完成
    print(f"报表 {report_id} 生成完成")
    # 返回结果
    return {"report_id": report_id, "url": f"/reports/{report_id}.pdf"}

# ---------- main.py（FastAPI 应用）----------
# from fastapi import FastAPI
# 定义变量 app，赋值为 FastAPI()
# app = FastAPI()
# 导入任务
# from celery_app import send_welcome_email, generate_report

# 定义路由 POST /register
# @app.post("/register")
# 定义函数 register，参数: email: str
# def register(email: str):
#     # 调用 .delay() 把任务发到 Celery 队列
#     # .delay() 立刻返回一个 AsyncResult，不等任务执行
#     result = send_welcome_email.delay(email)
#     # 返回任务 ID，客户端可以用来查询状态
#     return {"message": "注册成功", "task_id": result.id}

# 定义路由 GET /task/{task_id}
# @app.get("/task/{task_id}")
# 定义函数 get_task_status，参数: task_id: str
# def get_task_status(task_id: str):
#     # 从 backend 查询任务状态
#     from celery.result import AsyncResult
#     result = AsyncResult(task_id, app=celery_app)
#     # 返回状态和结果
#     return {
#         "task_id": task_id,
#         "status": result.status,  # PENDING / STARTED / SUCCESS / FAILURE / RETRY
#         "result": result.result if result.ready() else None
#     }

# ---------- 启动 Celery Worker（单独的终端）----------
# celery -A celery_app worker --loglevel=info
# 这会启动一个 worker 进程，监听 broker，执行任务
\`\`\`

**Celery 的核心概念**：
- **broker**：消息队列，FastAPI 把任务消息发到这里，worker 从这里取任务。常用 Redis 或 RabbitMQ。
- **backend**：结果存储，worker 执行完把结果存这里，FastAPI 可以查询。常用 Redis 或数据库。
- **worker**：独立进程，从 broker 取任务执行。可以启动多个 worker 分布式执行。
- **task**：用 @celery_app.task 定义的任务函数，调用 .delay() 异步执行。

## 六、任务重试与错误处理

生产环境中任务可能失败（网络抖动、第三方 API 超时）。Celery 提供了强大的重试机制。

\`\`\`python
# 从 celery 导入 Celery
from celery import Celery
# 导入 time
import time

# 创建 Celery 实例
# 定义变量 celery_app，赋值为 Celery("myapp", broker="redis://localhost:6379/0")
celery_app = Celery("myapp", broker="redis://localhost:6379/0")

# 定义任务 call_external_api，参数: self, api_url
# bind=True: 获取 self；max_retries=3: 最多重试 3 次
@celery_app.task(bind=True, max_retries=3)
def call_external_api(self, api_url):
    try:
        # 模拟调用外部 API
        # 打印尝试
        print(f"尝试调用 API: {api_url}")
        # 模拟随机失败
        import random
        if random.random() < 0.7:  # 70% 概率失败
            raise ConnectionError("API 连接失败")
        # 成功
        # 打印成功
        print("API 调用成功")
        return {"status": "ok"}

    except ConnectionError as e:
        # 捕获异常，安排重试
        # self.retry 会重新把任务放回队列，延迟执行
        # countdown: 延迟秒数（指数退避：第1次等4秒，第2次8秒，第3次16秒）
        # exc: 传递异常信息
        # 打印重试信息
        print(f"失败，{self.request.retries + 1} 次重试，等待 {2 ** self.request.retries} 秒")
        raise self.retry(
            exc=e,
            countdown=2 ** self.request.retries,  # 指数退避: 1, 2, 4 秒
        )

# 定义任务 process_data，参数: self, data
# 演示不同异常的不同处理
@celery_app.task(bind=True, autoretry_for=(TimeoutError, ConnectionError), retry_backoff=True, retry_backoff_max=60, retry_jitter=True, max_retries=5)
def process_data(self, data):
    # autoretry_for: 自动重试这些异常
    # retry_backoff=True: 指数退避（自动计算延迟）
    # retry_backoff_max=60: 最大退避 60 秒
    # retry_jitter=True: 加随机抖动，防止多个任务同时重试
    # max_retries=5: 最多重试 5 次

    # 模拟处理
    # 打印处理
    print(f"处理数据: {data}")
    # 模拟可能失败
    if not data:
        raise ValueError("数据不能为空")  # 这个异常不在 autoretry_for 里，不会重试
    # 返回
    return {"processed": True, "data": data}

# 定义任务链：多个任务串联执行
# celery chain: task1 -> task2 -> task3
# 前一个的结果作为后一个的参数
# 定义任务 step1，参数: value
@celery_app.task
def step1(value):
    # 第一步
    result = value + 10
    # 打印
    print(f"step1: {value} -> {result}")
    return result

# 定义任务 step2，参数: value
@celery_app.task
def step2(value):
    # 第二步
    result = value * 2
    # 打印
    print(f"step2: {value} -> {result}")
    return result

# 定义任务 step3，参数: value
@celery_app.task
def step3(value):
    # 第三步
    result = f"最终结果: {value}"
    # 打印
    print(f"step3: {value} -> {result}")
    return result

# 在 FastAPI 中使用 chain：
# from celery import chain
# 定义变量 workflow，赋值为 chain(step1.s(5), step2.s(), step3.s())
# workflow.delay()  # 5 -> 15 -> 30 -> "最终结果: 30"
\`\`\`

## 七、BackgroundTasks vs Celery：怎么选

| 特性 | BackgroundTasks | Celery |
|------|----------------|--------|
| 依赖 | 无（FastAPI 内置） | 需要 Redis/RabbitMQ |
| 复杂度 | 极低 | 中高 |
| 重试 | 无 | 支持自动重试、指数退避 |
| 定时任务 | 不支持 | 支持（Celery Beat） |
| 分布式 | 不支持（单进程） | 支持（多 worker 分布式） |
| 任务状态查询 | 不支持 | 支持（通过 backend） |
| 任务链/编排 | 不支持 | 支持（chain、group、chord） |
| 适合场景 | 简单后台操作 | 复杂任务调度 |

\`\`\`python
# 决策示例：根据任务复杂度选择方案
# 从 fastapi 导入 FastAPI, BackgroundTasks
from fastapi import FastAPI, BackgroundTasks

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 场景 1：简单发邮件 -> 用 BackgroundTasks
# 定义函数 send_simple_email，参数: to
def send_simple_email(to: str):
    # 简单的邮件发送，失败也无所谓
    # 打印
    print(f"发送邮件到 {to}")

# 定义路由
@app.post("/register")
# 定义函数 register，参数: email: str, bg: BackgroundTasks
def register(email: str, bg: BackgroundTasks):
    # 简单任务，用 BackgroundTasks
    bg.add_task(send_simple_email, email)
    return {"message": "注册成功"}

# 场景 2：生成大型报表 -> 用 Celery
# 需要重试、需要查询状态、耗时长
# 定义路由
# @app.post("/reports/generate")
# 定义函数 generate_report_api，参数: report_type: str
# def generate_report_api(report_type: str):
#     # 复杂任务，用 Celery
#     from celery_app import generate_report_task
#     result = generate_report_task.delay(report_type)
#     return {"task_id": result.id, "message": "报表生成中"}

# 场景 3：视频处理 -> 用 Celery
# 耗时极长、需要重试、需要进度查询
# 场景 4：写日志 -> 用 BackgroundTasks
# 简单、快、失败无所谓
# 场景 5：定时数据同步 -> 用 Celery Beat
# 需要定时触发（每天凌晨同步）

# 选型口诀：
# 「简单快用 Background，复杂重用 Celery」
# 不需要重试、不需要查询状态、耗时 < 30 秒 -> BackgroundTasks
# 需要重试、需要查询状态、耗时 > 30 秒、需要定时 -> Celery
\`\`\`

## 八、设计思想：异步与解耦

后台任务的本质是**解耦**——把「用户感知的响应」和「实际的工作执行」分开。用户不需要知道也不需要等待后台工作完成，只要知道「已提交」就行。

这种解耦带来三个好处：
1. **用户体验好**：请求秒回，不用等。
2. **系统弹性好**：后台任务可以排队，高峰期积压了慢慢消化，不会压垮系统。
3. **可靠性高**：Celery 的重试机制能处理临时故障，比同步调用更健壮。

但解耦也有代价：**调试更难**。后台任务失败不会直接反馈给用户，需要完善的日志和监控。**数据一致性**也更复杂——「已提交但还没处理」的中间状态需要妥善处理。

实践建议：从小开始，先用 BackgroundTasks 解决简单场景。当任务变复杂（需要重试、定时、分布式）时再引入 Celery。不要一上来就上 Celery——它的运维成本（Redis/RabbitMQ、worker 进程、监控）不低。
`
  },
  {
    id: "fp-websocket-basic",
    group: "WebSocket 实时通信",
    icon: "🔌",
    title: "WebSocket 基础",
    content: `# WebSocket 基础

## 一、WebSocket 协议原理：为什么 HTTP 不够用

HTTP 是「请求-响应」模型：客户端发请求，服务器返响应，连接就断了。服务器**不能主动**给客户端推消息。这在很多场景下是硬伤：

- **聊天室**：别人发消息，你希望立刻看到，而不是你不停刷新。
- **实时通知**：服务器有新消息，要主动推给客户端。
- **股票行情**：价格每秒都在变，不可能每秒发 HTTP 请求。
- **协同编辑**：多人同时编辑文档，需要实时同步。

为了解决「服务器主动推送」的问题，早期有一些 hack 方案：
1. **轮询（Polling）**：客户端每隔几秒发一次 HTTP 请求问「有新消息吗？」。浪费带宽，延迟高。
2. **长轮询（Long Polling）**：客户端发请求，服务器 hold 住不返回，有消息了才返回。比轮询好，但每次还是要重建 HTTP 连接。
3. **SSE（Server-Sent Events）**：服务器能推，但只能单向（服务器→客户端），客户端不能通过 SSE 发消息。

**WebSocket** 是真正的全双工解决方案：一次握手后，连接保持打开，双方随时可以互发消息。就像打电话——拨通后双方随时可以说话，不用每说一句就重新拨号。

## 二、WebSocket 握手过程

WebSocket 连接的建立过程：

1. 客户端发一个 HTTP GET 请求，带 \`Upgrade: websocket\` 头，表示想升级协议。
2. 服务器返回 \`101 Switching Protocols\`，同意升级。
3. 之后 TCP 连接从 HTTP 协议「升级」为 WebSocket 协议，双方可以自由收发消息。

\`\`\`python
# WebSocket 握手的简化示意（不是真实代码，帮你理解原理）
# 客户端发的 HTTP 请求长这样:
# GET /ws HTTP/1.1
# Upgrade: websocket
# Connection: Upgrade
# Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
# Sec-WebSocket-Version: 13

# 服务器返回:
# HTTP/1.1 101 Switching Protocols
# Upgrade: websocket
# Connection: Upgrade
# Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=

# 之后这个 TCP 连接就不再是 HTTP 了，而是 WebSocket 协议
# 双方通过 WebSocket 帧格式收发消息

# 怎么想：WebSocket = HTTP 握手 + 之后的自由双向通信
# 握手是 HTTP（走 80/443 端口，能穿防火墙）
# 握手后升级为 WebSocket 协议（自定义帧格式，全双工）
\`\`\`

WebSocket 的优势：
- **全双工**：服务器和客户端都能随时发消息。
- **低延迟**：连接保持打开，不用反复握手。
- **低开销**：WebSocket 帧头只有 2-10 字节，比 HTTP 头小得多。
- **跨域友好**：WebSocket 不受同源策略限制（但有自定义的 Origin 检查机制）。

## 三、@app.websocket() 装饰器

FastAPI（通过 Starlette）内置 WebSocket 支持。用 \`@app.websocket()\` 定义 WebSocket 路由。

\`\`\`python
# 从 fastapi 导入 FastAPI, WebSocket
from fastapi import FastAPI, WebSocket

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 用 @app.websocket() 定义 WebSocket 路由
# 路径可以是 /ws 或 /ws/{client_id} 等
@app.websocket("/ws")
# 定义 async 函数 websocket_endpoint，参数: websocket: WebSocket
# WebSocket 处理函数必须是 async def（因为收发消息都是异步 I/O）
async def websocket_endpoint(websocket: WebSocket):
    # 第一步：接受连接
    # websocket.accept() 完成 WebSocket 握手，返回 101 响应
    # 在 accept 之前，连接还是 HTTP 状态，不能收发消息
    await websocket.accept()

    # 第二步：循环接收消息
    while True:
        # websocket.receive_text() 阻塞等待客户端发来的文本消息
        # await 是必须的，因为要异步等待
        # 定义变量 data，赋值为 await websocket.receive_text()
        data = await websocket.receive_text()
        # 打印收到的消息
        print(f"收到: {data}")

        # 第三步：发送消息
        # websocket.send_text() 发送文本消息给客户端
        # await 是必须的
        await websocket.send_text(f"你说了: {data}")

# 客户端测试（JavaScript）:
# const ws = new WebSocket("ws://localhost:8000/ws");
# ws.onopen = () => ws.send("你好");
# ws.onmessage = (e) => console.log(e.data);  // "你说了: 你好"
\`\`\`

**三个核心 API**：
- \`websocket.accept()\`：接受连接，完成握手。
- \`websocket.receive_text()\`：接收文本消息（阻塞等待）。
- \`websocket.send_text()\`：发送文本消息。

除了文本，还可以收发二进制数据：\`receive_bytes()\` / \`send_bytes()\`，以及 JSON：\`receive_json()\` / \`send_json()\`。

## 四、accept / recv / send / close 完整流程

一个完整的 WebSocket 连接生命周期：接受 → 循环收发 → 关闭。

\`\`\`python
# 从 fastapi 导入 FastAPI, WebSocket
from fastapi import FastAPI, WebSocket

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 定义 WebSocket 路由
@app.websocket("/ws/{client_id}")
# 定义 async 函数 websocket_endpoint，参数: websocket: WebSocket, client_id: str
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    # 1. 接受连接
    # accept 之前可以做一些检查（比如认证），不符合就拒绝
    # 这里我们直接接受
    await websocket.accept()
    # 打印连接信息
    print(f"客户端 {client_id} 已连接")

    # 发送欢迎消息
    await websocket.send_text(f"欢迎，客户端 {client_id}！")

    try:
        # 2. 循环收发消息
        while True:
            # 接收消息
            # 定义变量 message，赋值为 await websocket.receive_text()
            message = await websocket.receive_text()
            # 打印消息
            print(f"[{client_id}] 收到: {message}")

            # 根据消息内容做不同处理
            if message == "ping":
                # 回复 pong
                await websocket.send_text("pong")
            elif message == "time":
                # 返回当前时间
                import datetime
                now = datetime.datetime.now().strftime("%H:%M:%S")
                await websocket.send_text(f"当前时间: {now}")
            elif message == "quit":
                # 客户端要求退出
                await websocket.send_text("再见！")
                break  # 跳出循环，准备关闭
            else:
                # 默认回显
                await websocket.send_text(f"你说: {message}")

    except Exception as e:
        # 3. 异常处理（客户端断开连接等）
        # 打印异常
        print(f"[{client_id}] 异常: {e}")

    finally:
        # 4. 关闭连接
        # websocket.close() 发送关闭帧，关闭连接
        # close 接受一个 code 参数，默认 1000（正常关闭）
        # 常用 code: 1000 正常关闭、1001 端点离开、1002 协议错误、1003 不支持的数据类型
        await websocket.close()
        # 打印关闭信息
        print(f"客户端 {client_id} 已断开")
\`\`\`

## 五、WebSocketDisconnect 异常处理

客户端断开连接时（关闭浏览器、网络中断），\`receive_text()\` 会抛出 \`WebSocketDisconnect\` 异常。必须捕获它，否则服务器会报错。

\`\`\`python
# 从 fastapi 导入 FastAPI, WebSocket, WebSocketDisconnect
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 定义 WebSocket 路由
@app.websocket("/ws")
# 定义 async 函数 websocket_endpoint，参数: websocket: WebSocket
async def websocket_endpoint(websocket: WebSocket):
    # 接受连接
    await websocket.accept()

    try:
        # 循环接收消息
        while True:
            data = await websocket.receive_text()
            # 回显消息
            await websocket.send_text(f"Echo: {data}")

    except WebSocketDisconnect:
        # 客户端主动断开时，receive_text 抛 WebSocketDisconnect
        # 这里清理资源、记录日志
        # 打印断开信息
        print("客户端已断开连接")

    # 注意：不要在 WebSocketDisconnect 之后再 close()
    # 因为连接已经断了，再 close 会报错
\`\`\`

**WebSocketDisconnect 的常见触发场景**：
- 用户关闭浏览器标签页
- 用户刷新页面（旧连接断开）
- 网络中断（WiFi 断了、切网络了）
- 客户端主动调用 \`ws.close()\`

捕获 \`WebSocketDisconnect\` 是 WebSocket 编程的标配，不捕获会导致服务器 500 错误。

## 六、连接管理器：管理多个 WebSocket 连接

实际应用中，服务器要同时管理很多 WebSocket 连接（比如聊天室有 100 个用户同时在线）。需要一个**连接管理器**来统一管理。

\`\`\`python
# 从 fastapi 导入 FastAPI, WebSocket, WebSocketDisconnect
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 定义类 ConnectionManager，管理所有 WebSocket 连接
class ConnectionManager:
    # 定义 __init__
    def __init__(self):
        # active_connections 存储所有活跃的 WebSocket 连接
        # 定义实例变量 active_connections，赋值为 []
        self.active_connections: list[WebSocket] = []

    # 定义 async 方法 accept_connection，参数: websocket
    async def accept_connection(self, websocket: WebSocket):
        # 接受连接
        await websocket.accept()
        # 加入活跃连接列表
        self.active_connections.append(websocket)

    # 定义 async 方法 disconnect，参数: websocket
    def disconnect(self, websocket: WebSocket):
        # 从活跃列表移除
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    # 定义 async 方法 send_personal_message，参数: message, websocket
    async def send_personal_message(self, message: str, websocket: WebSocket):
        # 给指定连接发消息
        await websocket.send_text(message)

    # 定义 async 方法 broadcast，参数: message
    async def broadcast(self, message: str):
        # 广播：给所有连接发消息
        # 遍历所有活跃连接
        for connection in self.active_connections:
            try:
                # 发送消息
                await connection.send_text(message)
            except Exception:
                # 发送失败说明连接已断开，跳过
                pass

# 创建全局连接管理器实例
# 定义变量 manager，赋值为 ConnectionManager()
manager = ConnectionManager()

# 定义 WebSocket 路由
@app.websocket("/ws/{client_id}")
# 定义 async 函数 websocket_endpoint，参数: websocket, client_id
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    # 接受连接并加入管理器
    await manager.accept_connection(websocket)
    # 通知所有人：有人加入了
    await manager.broadcast(f"客户端 {client_id} 加入了聊天")

    try:
        # 循环接收消息
        while True:
            data = await websocket.receive_text()
            # 广播消息给所有人
            await manager.broadcast(f"[{client_id}] {data}")

    except WebSocketDisconnect:
        # 客户端断开，从管理器移除
        manager.disconnect(websocket)
        # 通知所有人：有人离开了
        await manager.broadcast(f"客户端 {client_id} 离开了聊天")
\`\`\`

这个连接管理器是最基础的版本——广播给所有人。下一章我们会扩展它，支持「房间」功能（只给同一个房间的用户广播）。

## 七、收发 JSON 数据

实际应用中，消息通常是结构化的 JSON（而不是纯文本），比如聊天消息包含用户名、内容、时间戳。

\`\`\`python
# 从 fastapi 导入 FastAPI, WebSocket, WebSocketDisconnect
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 定义 WebSocket 路由，演示 JSON 收发
@app.websocket("/ws/json")
# 定义 async 函数 websocket_endpoint，参数: websocket
async def websocket_endpoint(websocket: WebSocket):
    # 接受连接
    await websocket.accept()

    try:
        while True:
            # receive_json() 接收 JSON 消息，自动解析成 Python 字典
            # 定义变量 data，赋值为 await websocket.receive_json()
            data = await websocket.receive_json()
            # 打印收到的 JSON
            print(f"收到 JSON: {data}")

            # 根据 type 字段做不同处理
            if data.get("type") == "chat":
                # 构造回复
                response = {
                    "type": "chat",
                    "user": data.get("user", "匿名"),
                    "message": data.get("message", ""),
                    "timestamp": "2024-01-01 12:00:00"  # 实际用 datetime
                }
                # send_json 发送 JSON 消息，自动序列化
                await websocket.send_json(response)

            elif data.get("type") == "ping":
                # 回复 pong
                await websocket.send_json({"type": "pong"})

            else:
                # 未知类型
                await websocket.send_json({"type": "error", "message": "未知消息类型"})

    except WebSocketDisconnect:
        # 打印断开
        print("客户端断开")

# 客户端测试（JavaScript）:
# ws.send(JSON.stringify({type: "chat", user: "小明", message: "你好"}))
# ws.onmessage = (e) => console.log(JSON.parse(e.data))
\`\`\`

## 八、设计思想：WebSocket 改变了什么

WebSocket 把 Web 从「拉」模式变成了「推」模式。HTTP 时代，客户端不问，服务器就不说；WebSocket 时代，服务器有新消息可以主动推。

这不只是技术升级，更是交互模式的变革：
- **实时性**：从「分钟级延迟」到「毫秒级延迟」
- **效率**：从「反复建连」到「长连接复用」
- **能力**：从「只能客户端发起」到「双向自由通信」

但 WebSocket 也有挑战：
1. **连接管理**：服务器要维护大量长连接，内存和文件描述符是瓶颈。
2. **并发安全**：多个协程可能同时操作连接列表，需要加锁（下一章详解）。
3. **心跳保活**：长连接可能被中间代理/防火墙断开，需要定期心跳。
4. **负载均衡**：WebSocket 是有状态连接，Nginx 需要特殊配置（ip_hash）才能保证同一用户连到同一服务器。

这些挑战我们在下一章「房间管理与广播系统」中逐一解决。
`
  },
  {
    id: "fp-websocket-rooms",
    group: "WebSocket 实时通信",
    icon: "🏠",
    title: "房间管理与广播系统",
    content: `# 房间管理与广播系统

## 一、为什么需要房间管理

上一章的连接管理器把消息广播给**所有人**。但实际场景中，我们通常需要**分组广播**：

- **聊天室**：用户 A 在「技术交流」群，用户 B 在「闲聊」群，A 的消息不该发给 B。
- **多人游戏**：每局游戏是一个独立的房间，玩家只收到同局的消息。
- **协同编辑**：每个文档是一个房间，编辑同一文档的人互相同步。
- **客服系统**：每个客服-客户对话是一个房间。

这就是「房间」概念：**把连接分组，消息只在自己的房间内广播**。

类比：连接管理器像一个广场大喇叭，所有人都能听到。房间管理像酒店的多间会议室——每间会议室里的人互相能听到，但不会听到其他会议室的对话。

## 二、多房间管理：RoomManager 设计

核心数据结构：\`dict[房间名, list[WebSocket]]\`——用字典把房间名映射到连接列表。

\`\`\`python
# 从 fastapi 导入 FastAPI, WebSocket, WebSocketDisconnect
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 定义类 RoomManager，管理多房间 WebSocket 连接
class RoomManager:
    # 定义 __init__
    def __init__(self):
        # rooms 是字典: {房间名: [WebSocket, WebSocket, ...]}
        # 定义实例变量 rooms，赋值为 {}
        self.rooms: dict[str, list[WebSocket]] = {}

    # 定义 async 方法 join_room，参数: room_id, websocket
    async def join_room(self, room_id: str, websocket: WebSocket):
        # 接受连接
        await websocket.accept()
        # 如果房间不存在，创建房间
        if room_id not in self.rooms:
            # 创建空列表
            self.rooms[room_id] = []
        # 把连接加入房间
        self.rooms[room_id].append(websocket)

    # 定义方法 leave_room，参数: room_id, websocket
    def leave_room(self, room_id: str, websocket: WebSocket):
        # 从房间移除连接
        if room_id in self.rooms:
            if websocket in self.rooms[room_id]:
                # 移除
                self.rooms[room_id].remove(websocket)
            # 如果房间空了，删除房间
            if not self.rooms[room_id]:
                # 删除空房间，释放内存
                del self.rooms[room_id]

    # 定义 async 方法 broadcast_to_room，参数: room_id, message
    async def broadcast_to_room(self, room_id: str, message: str):
        # 只给指定房间的连接发消息
        if room_id in self.rooms:
            # 遍历房间内所有连接
            for websocket in self.rooms[room_id]:
                try:
                    # 发送消息
                    await websocket.send_text(message)
                except Exception:
                    # 发送失败，跳过（连接可能已断开）
                    pass

    # 定义方法 get_room_users，参数: room_id
    def get_room_users(self, room_id: str) -> int:
        # 返回房间内用户数
        return len(self.rooms.get(room_id, []))

# 创建全局房间管理器
# 定义变量 manager，赋值为 RoomManager()
manager = RoomManager()

# 定义 WebSocket 路由
@app.websocket("/ws/{room_id}/{client_id}")
# 定义 async 函数 websocket_endpoint，参数: websocket, room_id, client_id
async def websocket_endpoint(websocket: WebSocket, room_id: str, client_id: str):
    # 加入房间（内部会 accept）
    await manager.join_room(room_id, websocket)
    # 获取当前房间人数
    user_count = manager.get_room_users(room_id)
    # 广播加入通知
    await manager.broadcast_to_room(room_id, f"客户端 {client_id} 加入了房间 {room_id}（当前 {user_count} 人）")

    try:
        # 循环接收消息
        while True:
            data = await websocket.receive_text()
            # 广播消息到房间
            await manager.broadcast_to_room(room_id, f"[{client_id}] {data}")

    except WebSocketDisconnect:
        # 断开连接，离开房间
        manager.leave_room(room_id, websocket)
        # 广播离开通知
        await manager.broadcast_to_room(room_id, f"客户端 {client_id} 离开了房间 {room_id}")
\`\`\`

现在不同房间的消息互不干扰：连接 \`/ws/room1/alice\` 和 \`/ws/room2/bob\` 的用户收不到对方房间的消息。

## 三、加入/离开房间：完整流程

实际应用中，用户可能切换房间（从房间 A 跳到房间 B）。需要正确处理加入和离开。

\`\`\`python
# 从 fastapi 导入 FastAPI, WebSocket, WebSocketDisconnect
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
# 导入 asyncio 用于锁
import asyncio

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 定义类 RoomManager，增强版
class RoomManager:
    # 定义 __init__
    def __init__(self):
        # rooms: {房间名: {client_id: WebSocket}}
        # 用字典而非列表，方便按 client_id 查找
        self.rooms: dict[str, dict[str, WebSocket]] = {}
        # asyncio.Lock 用于并发安全
        # 多个协程可能同时修改 rooms，需要加锁
        self.lock = asyncio.Lock()

    # 定义 async 方法 join_room，参数: room_id, client_id, websocket
    async def join_room(self, room_id: str, client_id: str, websocket: WebSocket):
        # 加锁，防止并发修改导致数据不一致
        async with self.lock:
            # 接受连接
            await websocket.accept()
            # 创建房间（如果不存在）
            if room_id not in self.rooms:
                self.rooms[room_id] = {}
            # 把连接加入房间，用 client_id 做 key
            self.rooms[room_id][client_id] = websocket

    # 定义 async 方法 leave_room，参数: room_id, client_id
    async def leave_room(self, room_id: str, client_id: str):
        # 加锁
        async with self.lock:
            # 从房间移除
            if room_id in self.rooms:
                if client_id in self.rooms[room_id]:
                    # 删除
                    del self.rooms[room_id][client_id]
                # 房间空了就删除
                if not self.rooms[room_id]:
                    del self.rooms[room_id]

    # 定义 async 方法 broadcast_to_room，参数: room_id, message, exclude_id=None
    async def broadcast_to_room(self, room_id: str, message: str, exclude_id: str = None):
        # 加锁读取连接列表（读取时也加锁，防止读到不一致状态）
        async with self.lock:
            if room_id not in self.rooms:
                return
            # 复制一份连接列表，避免遍历时被修改
            connections = list(self.rooms[room_id].items())

        # 在锁外发送消息（避免长时间持锁）
        for cid, websocket in connections:
            # 排除指定用户（比如不发给自己）
            if exclude_id and cid == exclude_id:
                continue
            try:
                await websocket.send_text(message)
            except Exception:
                # 发送失败跳过
                pass

    # 定义 async 方法 get_online_users，参数: room_id
    async def get_online_users(self, room_id: str) -> list[str]:
        # 返回房间内在线用户 ID 列表
        async with self.lock:
            if room_id not in self.rooms:
                return []
            return list(self.rooms[room_id].keys())

# 创建管理器
# 定义变量 manager，赋值为 RoomManager()
manager = RoomManager()

# 定义 WebSocket 路由
@app.websocket("/ws/{room_id}/{client_id}")
# 定义 async 函数 websocket_endpoint，参数: websocket, room_id, client_id
async def websocket_endpoint(websocket: WebSocket, room_id: str, client_id: str):
    # 加入房间
    await manager.join_room(room_id, client_id, websocket)

    # 获取在线用户
    online_users = await manager.get_online_users(room_id)
    # 广播加入通知
    await manager.broadcast_to_room(
        room_id,
        f"系统: {client_id} 加入了房间（在线: {', '.join(online_users)}）"
    )

    try:
        while True:
            # 接收消息
            data = await websocket.receive_text()

            # 特殊命令：查询在线用户
            if data == "/online":
                users = await manager.get_online_users(room_id)
                # 只发给当前用户
                await websocket.send_text(f"在线用户: {', '.join(users)}")
                continue

            # 正常消息：广播给房间内所有人（排除自己）
            await manager.broadcast_to_room(
                room_id,
                f"[{client_id}] {data}",
                exclude_id=client_id  # 不发给自己
            )
            # 给自己也发一份（确认消息已发送）
            await websocket.send_text(f"[我] {data}")

    except WebSocketDisconnect:
        # 离开房间
        await manager.leave_room(room_id, client_id)
        # 广播离开通知
        await manager.broadcast_to_room(room_id, f"系统: {client_id} 离开了房间")
\`\`\`

## 四、并发安全：为什么需要 asyncio.Lock

WebSocket 服务器是高并发的——多个协程可能同时操作 \`rooms\` 字典。如果不加锁，可能出现数据竞争。

\`\`\`python
# 演示并发安全问题（不安全的版本）
# 导入 asyncio
import asyncio

# 定义类 UnsafeManager，演示不加锁的问题
class UnsafeManager:
    # 定义 __init__
    def __init__(self):
        # 定义实例变量 rooms，赋值为 {}
        self.rooms = {}

    # 定义 async 方法 add_user，参数: room_id, client_id
    async def add_user(self, room_id: str, client_id: str):
        # 不加锁的危险操作
        # 场景：两个用户同时加入同一个房间
        if room_id not in self.rooms:
            # 如果协程 A 在这里被挂起（await 点）
            # 协程 B 也进来，发现房间不存在，也准备创建
            await asyncio.sleep(0.001)  # 模拟协程切换
            # 两个协程都执行创建，后者覆盖前者
            self.rooms[room_id] = {}
        # 添加用户
        self.rooms[room_id][client_id] = "connected"

# 定义类 SafeManager，演示加锁的正确做法
class SafeManager:
    # 定义 __init__
    def __init__(self):
        # 定义实例变量 rooms，赋值为 {}
        self.rooms = {}
        # 创建锁
        self.lock = asyncio.Lock()

    # 定义 async 方法 add_user，参数: room_id, client_id
    async def add_user(self, room_id: str, client_id: str):
        # async with self.lock 获取锁
        # 同一时间只有一个协程能进入这个代码块
        # 其他协程会在 async with 处等待
        async with self.lock:
            if room_id not in self.rooms:
                # 即使这里被 await（虽然这段代码里没有），锁也不会释放
                # 因为 async with 的范围内，锁一直被持有
                self.rooms[room_id] = {}
            self.rooms[room_id][client_id] = "connected"

# 怎么想：asyncio.Lock 就像厕所的门锁
# 一个人进去后锁门，外面的人排队等
# 里面的人出来（离开 async with）后，下一个人才能进
# 这样保证同一时间只有一个人在操作共享数据（rooms 字典）

# 锁的使用原则：
# 1. 保护共享数据（字典、列表的读写）
# 2. 持锁时间尽量短（不要在锁里做 I/O，比如 send_text）
# 3. 读取也要加锁（防止读到写了一半的数据）
\`\`\`

**锁的最佳实践**：在锁内只做数据的读写，不做 I/O 操作（如 \`send_text\`）。因为 I/O 耗时不确定，持锁太久会阻塞其他协程。正确做法是：加锁读取数据副本 → 释放锁 → 在锁外遍历副本发送消息。

## 五、心跳检测：检测断线连接

WebSocket 连接可能因为网络中断、代理超时等原因"假死"——连接没正常关闭，但实际已经断了。服务器不知道，还以为客户端在线。**心跳检测**就是定期检查连接是否还活着。

\`\`\`python
# 从 fastapi 导入 FastAPI, WebSocket, WebSocketDisconnect
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
# 导入 asyncio
import asyncio

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 定义类 HeartbeatManager，带心跳检测的连接管理器
class HeartbeatManager:
    # 定义 __init__
    def __init__(self):
        # connections: {client_id: {"ws": WebSocket, "last_ping": float}}
        self.connections = {}
        self.lock = asyncio.Lock()

    # 定义 async 方法 add_connection，参数: client_id, websocket
    async def add_connection(self, client_id: str, websocket: WebSocket):
        async with self.lock:
            await websocket.accept()
            # 记录连接和最后一次心跳时间
            import time
            self.connections[client_id] = {
                "ws": websocket,
                "last_ping": time.time()
            }

    # 定义 async 方法 remove_connection，参数: client_id
    async def remove_connection(self, client_id: str):
        async with self.lock:
            if client_id in self.connections:
                del self.connections[client_id]

    # 定义 async 方法 update_heartbeat，参数: client_id
    async def update_heartbeat(self, client_id: str):
        async with self.lock:
            if client_id in self.connections:
                import time
                self.connections[client_id]["last_ping"] = time.time()

    # 定义 async 方法 broadcast，参数: message
    async def broadcast(self, message: str):
        async with self.lock:
            connections = list(self.connections.values())
        for conn in connections:
            try:
                await conn["ws"].send_text(message)
            except Exception:
                pass

    # 定义 async 方法 check_heartbeats，参数: timeout=30
    # 定期检查，超时未心跳的连接关闭掉
    async def check_heartbeats(self, timeout: int = 30):
        while True:
            # 每 10 秒检查一次
            await asyncio.sleep(10)
            import time
            now = time.time()
            # 找出超时的连接
            async with self.lock:
                dead_clients = []
                for client_id, conn in self.connections.items():
                    # 如果超过 timeout 秒没有心跳，判定为死连接
                    if now - conn["last_ping"] > timeout:
                        dead_clients.append(client_id)

            # 关闭死连接
            for client_id in dead_clients:
                async with self.lock:
                    if client_id in self.connections:
                        try:
                            await self.connections[client_id]["ws"].close()
                        except Exception:
                            pass
                        del self.connections[client_id]
                        # 打印清理信息
                        print(f"心跳超时，清理连接: {client_id}")

# 创建管理器
# 定义变量 manager，赋值为 HeartbeatManager()
manager = HeartbeatManager()

# 启动心跳检测后台任务（在 FastAPI startup 事件中启动）
# @app.on_event("startup")
# async def startup():
#     asyncio.create_task(manager.check_heartbeats(timeout=30))

# 定义 WebSocket 路由
@app.websocket("/ws/{client_id}")
# 定义 async 函数 websocket_endpoint，参数: websocket, client_id
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.add_connection(client_id, websocket)
    # 打印连接
    print(f"{client_id} 已连接")

    try:
        while True:
            data = await websocket.receive_text()

            # 客户端发 "ping"，服务器回 "pong"，并更新心跳时间
            if data == "ping":
                # 更新心跳时间
                await manager.update_heartbeat(client_id)
                # 回复 pong
                await websocket.send_text("pong")

            # 正常消息
            else:
                await manager.broadcast(f"[{client_id}] {data}")

    except WebSocketDisconnect:
        await manager.remove_connection(client_id)
        # 打印断开
        print(f"{client_id} 已断开")

# 客户端心跳实现（JavaScript）:
# const ws = new WebSocket("ws://localhost:8000/ws/alice");
# // 每 15 秒发一次心跳
# setInterval(() => {
#     if (ws.readyState === WebSocket.OPEN) {
#         ws.send("ping");
#     }
# }, 15000);
# ws.onmessage = (e) => {
#     if (e.data === "pong") {
#         console.log("收到心跳回复");
#     }
# };
\`\`\`

**心跳机制的工作原理**：
1. 客户端每隔 15 秒发一个 \`ping\` 消息。
2. 服务器收到 \`ping\` 后更新该连接的「最后心跳时间」，回复 \`pong\`。
3. 服务器后台每 10 秒检查所有连接，如果某个连接超过 30 秒没心跳，判定为死连接，强制关闭。
4. 客户端如果连续几次没收到 \`pong\`，也可以主动重连。

## 六、在线用户列表：实时维护

聊天室通常需要显示「当前在线用户」。这需要维护用户信息（不只是 WebSocket 连接）。

\`\`\`python
# 从 fastapi 导入 FastAPI, WebSocket, WebSocketDisconnect
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
# 导入 asyncio 和 time
import asyncio
import time

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 定义类 ChatRoom，完整的聊天室管理器
class ChatRoom:
    # 定义 __init__
    def __init__(self):
        # users: {client_id: {"ws": WebSocket, "name": str, "joined_at": float}}
        self.users: dict[str, dict] = {}
        self.lock = asyncio.Lock()

    # 定义 async 方法 join，参数: client_id, name, websocket
    async def join(self, client_id: str, name: str, websocket: WebSocket):
        async with self.lock:
            await websocket.accept()
            # 记录用户信息
            self.users[client_id] = {
                "ws": websocket,
                "name": name,
                "joined_at": time.time()
            }
            # 复制用户列表（在锁内复制，锁外使用）
            return list(self.users.values())

    # 定义 async 方法 leave，参数: client_id
    async def leave(self, client_id: str):
        async with self.lock:
            if client_id in self.users:
                del self.users[client_id]

    # 定义 async 方法 get_online_list
    # 返回在线用户列表（名字 + 加入时间）
    async def get_online_list(self):
        async with self.lock:
            return [
                {"name": u["name"], "joined_at": u["joined_at"]}
                for u in self.users.values()
            ]

    # 定义 async 方法 broadcast，参数: message, exclude_id=None
    async def broadcast(self, message: str, exclude_id: str = None):
        async with self.lock:
            users = list(self.users.items())
        for cid, user in users:
            if exclude_id and cid == exclude_id:
                continue
            try:
                await user["ws"].send_text(message)
            except Exception:
                pass

# 创建聊天室
# 定义变量 room，赋值为 ChatRoom()
room = ChatRoom()

# 定义 WebSocket 路由
@app.websocket("/ws/{client_id}")
# 定义 async 函数 websocket_endpoint，参数: websocket, client_id, name
async def websocket_endpoint(websocket: WebSocket, client_id: str, name: str):
    # 加入聊天室
    await room.join(client_id, name, websocket)

    # 广播系统消息：有人加入
    await room.broadcast(f"系统: {name} 加入了聊天室")

    # 给新用户发送在线列表
    online = await room.get_online_list()
    names = [u["name"] for u in online]
    await websocket.send_text(f"系统: 当前在线 {len(names)} 人: {', '.join(names)}")

    try:
        while True:
            data = await websocket.receive_text()

            # 查询在线用户命令
            if data == "/online":
                online = await room.get_online_list()
                # 格式化用户列表
                user_list = "\\n".join([
                    f"  - {u['name']}（加入于 {time.strftime('%H:%M:%S', time.localtime(u['joined_at']))}）"
                    for u in online
                ])
                await websocket.send_text(f"在线用户:\\n{user_list}")
                continue

            # 正常聊天消息
            await room.broadcast(f"[{name}] {data}", exclude_id=client_id)
            # 给自己确认
            await websocket.send_text(f"[我] {data}")

    except WebSocketDisconnect:
        # 离开
        await room.leave(client_id)
        # 广播离开
        await room.broadcast(f"系统: {name} 离开了聊天室")

# 定义 HTTP 路由：查询在线人数（方便监控）
@app.get("/online/count")
# 定义函数 get_online_count
def get_online_count():
    # 返回在线人数（同步路由，从 room.users 读取）
    # 注意：这里读取不加锁，因为只是取长度，风险低
    # 严格来说也应该加锁，但这里简化处理
    return {"online_count": len(room.users)}
\`\`\`

## 七、设计思想：有状态连接的挑战

WebSocket 编程和 HTTP 编程有本质区别：**HTTP 是无状态的，WebSocket 是有状态的**。

HTTP 时代，每个请求是独立的，服务器不需要记住「上一个请求是谁发的」。负载均衡很简单——随便转发给哪台服务器都行。

WebSocket 时代，连接是长久的、有状态的。服务器必须记住「这个连接属于哪个用户、在哪个房间」。这带来三个挑战：

1. **内存管理**：每个连接占用内存，1 万个连接就是 1 万份状态。要定期清理死连接（心跳检测）。
2. **并发安全**：多个协程同时操作连接字典，必须加锁。但锁用不好会死锁或性能下降。
3. **水平扩展**：如果一台服务器扛不住，要扩到多台。但用户 A 连在服务器 1，用户 B 连在服务器 2，A 给 B 发消息怎么跨服务器？这需要 **Redis Pub/Sub** 或 **消息队列** 做跨服务器广播——这是分布式 WebSocket 的核心难题。

实践建议：
- **小规模（< 1万连接）**：单机 + RoomManager 足够。
- **中规模（1-10万连接）**：单机优化 + 异步框架，注意文件描述符限制（\`ulimit -n\`）。
- **大规模（> 10万连接）**：多机 + Redis Pub/Sub 跨服务器广播，Nginx ip_hash 负载均衡。

WebSocket 编程的核心思路：**把连接当资源管理，用锁保护共享状态，用心跳检测死连接，用房间实现分组广播**。这套模式掌握了，聊天室、通知系统、协同编辑都能搞定。
`
  },
];
