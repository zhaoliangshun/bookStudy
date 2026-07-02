// =============================================================
// FastAPI 应用开发实战教程 - 第 11 批章节（异步编程篇，共 4 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   41. async-basics  : async/await 基础
//   42. async-db      : 异步数据库
//   43. async-httpx   : 异步 HTTP 客户端 httpx
//   44. async-tasks   : 后台任务 BackgroundTasks
//
// 技术栈：Python 3.11+ / asyncio / SQLAlchemy 2.0 AsyncSession / httpx
//
// 格式约定：
//   - content 是反引号模板字符串
//   - content 内部三反引号转义为 \`\`\`，内联反引号转义为 \`
//   - 涉及 ${ 形式统一转义为 \$\{，避免与 JS 模板字符串冲突
//   - group 统一为"异步编程"
// =============================================================

export const chapters = [
  // =========================================================
  // 第四十一章：async/await 基础
  // =========================================================
  {
    id: "async-basics",
    group: "异步编程",
    icon: "⚡",
    title: "async/await 基础",
    content: `

# async/await 基础

## 一、同步 vs 异步：一个餐厅的比喻

FastAPI 最被人称道的就是"高性能"，而性能的核心来源就是**异步（async）**。理解异步前，先用餐厅比喻看清同步的痛点。

**同步模型**：一个服务员（线程）服务一桌客人：点单 → 去后厨等菜 → 端菜 → 客人吃完结账。期间服务员全程盯着这桌，别的桌喊他听不见。要同时服务 100 桌，就得雇 100 个服务员（100 个线程）——人力（内存）成本爆炸。

**异步模型**：一个服务员服务多桌：给 A 桌点完单扔给后厨，**不等**，转身去 B 桌点单；后厨菜好了按铃，服务员再去端菜。一个服务员能同时"处理"几十桌，因为他在"等"的时候去干别的了。

\`\`\`txt filename="同步 vs 异步"
同步：开始I/O → 阻塞等待 → 完成 → 处理下一个
     ↑ 等待期间线程完全空闲，却占着不放

异步：开始I/O → 挂起(交出CPU) → 去干别的 → I/O完成被唤醒 → 继续
     ↑ 等待期间让出 CPU 给其他任务，单线程能并发处理大量 I/O
\`\`\`

Web 应用大部分时间花在 **I/O 等待**上（等数据库、等外部 API、等磁盘）。异步的本质就是：**I/O 等待时不让线程干等，去服务别的请求**。这就是 FastAPI 能用很少线程扛住高并发的秘密。

## 二、async def 与 await

Python 用 \`async def\` 定义**协程函数**，用 \`await\` 等待一个异步操作完成：

\`\`\`python filename="协程基础"
# 导入 asyncio 模块
import asyncio

# async def 定义的函数叫"协程函数"，调用它返回一个"协程对象"，不会立刻执行
# 定义异步函数 fetch_data，参数: 
async def fetch_data():
    # 调用 print()
    print("开始抓取")
    # await 把控制权交回事件循环，等待期间可以去跑别的协程
    await asyncio.sleep(1)   # 模拟 1 秒的异步 I/O（非阻塞）
    # 调用 print()
    print("抓取完成")
    # 返回 {"data": 42}
    return {"data": 42}

# 直接调用不会执行，只返回协程对象
# 定义变量 coro，赋值为 fetch_data()
coro = fetch_data()
print(coro)   # <coroutine object fetch_data at 0x...>

# 必须用事件循环来跑它
asyncio.run(fetch_data())   # asyncio.run 创建事件循环并执行到完成
\`\`\`

### 两个关键字的语义

- **\`async def\`**：声明"这个函数是协程函数"。它返回的不是结果，而是协程对象（一个"待执行的执行计划"）。
- **\`await\`**：只能在 \`async def\` 内部用。它的意思是"暂停当前协程，等这个异步操作完成；等待期间把 CPU 让给别的协程"。

\`\`\`txt filename="await 的本质"
await some_async_op()
↑ 等价于："我先歇着，你忙完了叫我"
        歇着的这段时间，事件循环去跑别的就绪协程
        而不是像 time.sleep() 那样死等占着 CPU
\`\`\`

> **\`await\` 不是"让程序变快"，而是"让程序在等待时不闲着"**。单个请求的耗时不会变短，但系统能同时处理更多请求，**吞吐量**提升。

## 三、事件循环：协程的调度器

**事件循环（Event Loop）** 是异步的"心脏"，它不停地：

1. 检查哪些协程就绪了（I/O 完成了、定时器到了），执行它们。
2. 协程遇到 \`await\` 挂起，控制权回到事件循环。
3. 继续找下一个就绪的协程……

\`\`\`txt filename="事件循环工作模型"
事件循环单线程运行：
┌──────────────────────────────────────────────┐
│  while True:                                  │
│    ready = 找出就绪的协程(I/O 完成等)          │
│    for task in ready:                         │
│      task.run()  ← 跑到下一个 await 处挂起     │
│    poll(I/O 事件)  ← 检查有没有新的 I/O 就绪   │
└──────────────────────────────────────────────┘
↑ 单线程，但通过"快速切换"模拟并发
  没有锁、没有线程切换开销、没有 GIL 争用
\`\`\`

FastAPI 跑在 ASGI 服务器（如 Uvicorn）上，Uvicorn 内部就跑着一个事件循环，调度所有请求的协程。

## 四、协程 vs 线程：为什么协程更轻

| 维度 | 线程 | 协程 |
|------|------|------|
| 调度方 | 操作系统抢占式调度 | 事件循环协作式（在 await 处主动让出） |
| 切换成本 | 内核切换，开销大（微秒级） | 用户态切换，极轻（纳秒级） |
| 内存占用 | 每线程约 8MB 栈 | 每协程约 KB 级 |
| 并发量 | 几百到几千 | 几万到几十万 |
| 数据安全 | 需要锁（多线程共享内存） | 单线程内无锁（同一时刻只跑一个） |
| GIL（Python） | 受 GIL 限制，CPU 密集型不能真并行 | 同样受 GIL 限制，但 I/O 不受影响 |
| 阻塞影响 | 一个线程阻塞不影响其他线程 | ⚠️ 一个协程阻塞会卡住整个事件循环！ |

**关键区别**：线程是"操作系统帮你切换"，你不知道什么时候被切走（所以要多线程加锁）；协程是"你自己在 await 处主动让出"（所以协程间天然无锁，因为你确切知道哪里会让出）。

## 五、什么时候该用 async

\`\`\`txt filename="async 适用场景"
✅ 适合 async（I/O 密集型）：
   - 数据库查询（等网络往返）
   - 调用外部 HTTP API（等响应）
   - 文件读写（等磁盘）
   - WebSocket 长连接

❌ 不适合 async（CPU 密集型）：
   - 大量数值计算
   - 图像处理
   - 机器学习推理
   - 加密哈希大量数据
   ↑ 这些是 CPU 算个不停，没有 I/O 等待，async 帮不上忙
   要并行只能用多进程（ProcessPoolExecutor）
\`\`\`

FastAPI 路由可以写 \`async def\` 也可以写普通 \`def\`。**不是所有路由都要 async**——如果你的路由里没有可 await 的 I/O（比如纯内存计算、或用了同步数据库驱动），写 \`def\` 反而更好（FastAPI 会把它扔到线程池跑，不占事件循环）。

## 六、async 路由与同步路由混用的坑

\`\`\`python filename="混用陷阱"
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 导入 time 模块
import time

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 GET 路由：访问 /sync-route 时触发
@app.get("/sync-route")
def sync_route():           # 同步路由
    time.sleep(2)           # 阻塞，但 FastAPI 自动放线程池跑，不卡事件循环
    # 返回 {"ok": True}
    return {"ok": True}

# 定义 GET 路由：访问 /async-bad 时触发
@app.get("/async-bad")
async def async_bad():      # 异步路由
    time.sleep(2)           # ❌ 在事件循环里阻塞 2 秒，卡住所有其他请求！
    # 返回 {"ok": True}
    return {"ok": True}

# 定义 GET 路由：访问 /async-good 时触发
@app.get("/async-good")
# 定义异步函数 async_good，参数: 
async def async_good():
    await asyncio.sleep(2)  # ✅ 异步 sleep，让出 CPU
    # 返回 {"ok": True}
    return {"ok": True}
\`\`\`

**核心规则**：\`async def\` 路由里**绝对不能调用阻塞函数**（\`time.sleep\`、\`requests.get\`、同步数据库驱动）。一旦阻塞，整个事件循环停摆，所有并发请求都卡住。这正是下一节要解决的问题。

## 七、阻塞代码怎么办：run_in_executor / to_thread

有时候你不得不用阻塞库（比如老牌的 \`requests\`、同步 ORM），又不想卡住事件循环。Python 提供了把阻塞代码扔到线程池跑的机制：

\`\`\`python filename="run_in_executor - 老写法"
# 导入 asyncio 模块
import asyncio
# 导入 requests 模块
import requests

# 定义异步函数 fetch_url，参数: url: str
async def fetch_url(url: str):
    # 定义变量 loop，赋值为 asyncio.get_event_loop()
    loop = asyncio.get_event_loop()
    # 把阻塞的 requests.get 扔到线程池跑，当前协程 await 它，期间不阻塞事件循环
    # 定义变量 response，赋值为 await loop.run_in_executor(None, requests.get...
    response = await loop.run_in_executor(None, requests.get, url)
    # 返回 response.json()
    return response.json()
\`\`\`

\`\`\`python filename="anyio.to_thread.run_sync - 新写法（推荐）"
# 导入 anyio.to_thread 模块
import anyio.to_thread

# 定义异步函数 fetch_url，参数: url: str
async def fetch_url(url: str):
    # anyio 是 FastAPI/Starlette 内部用的异步抽象层
    # to_thread.run_sync 把同步函数扔到线程池跑
    # 定义变量 response，赋值为 await anyio.to_thread.run_sync(requests.get, ...
    response = await anyio.to_thread.run_sync(requests.get, url)
    # 返回 response.json()
    return response.json()
\`\`\`

> FastAPI 内部就是用 anyio。对同步路由 \`def\`，FastAPI 自动用 \`anyio.to_thread.run_sync\` 把它扔线程池——所以同步路由里写 \`time.sleep\` 不会卡事件循环。但 \`async def\` 路由里你得自己显式用 \`to_thread\`。

## 八、并发执行多个异步任务：asyncio.gather

\`await\` 是串行等待。要并发跑多个异步任务，用 \`asyncio.gather\`：

\`\`\`python filename="并发 vs 串行"
# 导入 asyncio 模块
import asyncio
# 导入 httpx 模块
import httpx

# ❌ 串行：总耗时 = 1s + 1s + 1s = 3s
# 定义异步函数 fetch_serial，参数: 
async def fetch_serial():
    # async with httpx.AsyncClient() as client:
    async with httpx.AsyncClient() as client:
        a = await client.get("https://api.example.com/a")  # 等 1s
        b = await client.get("https://api.example.com/b")  # 等 1s
        c = await client.get("https://api.example.com/c")  # 等 1s
        # 返回 [a, b, c]
        return [a, b, c]

# ✅ 并发：总耗时 = max(1s, 1s, 1s) ≈ 1s
# 定义异步函数 fetch_concurrent，参数: 
async def fetch_concurrent():
    # async with httpx.AsyncClient() as client:
    async with httpx.AsyncClient() as client:
        # gather 同时发起三个请求，等最慢的那个完成
        # 定义变量 results，赋值为 await asyncio.gather(
        results = await asyncio.gather(
            # 调用 client.get()
            client.get("https://api.example.com/a"),
            # 调用 client.get()
            client.get("https://api.example.com/b"),
            # 调用 client.get()
            client.get("https://api.example.com/c"),
        # )
        )
        # 返回 results
        return results
\`\`\`

\`\`\`txt filename="gather 工作时序"
t=0  发起A → 挂起等响应
t=0  发起B → 挂起等响应
t=0  发起C → 挂起等响应
     （三个请求同时在网络上飞）
t=1s A响应到 → 继续
t=1s B响应到 → 继续
t=1s C响应到 → 继续
总耗时 ≈ 1s，而不是 3s
\`\`\`

## 九、asyncio.create_task：后台并发

\`gather\` 是"等所有完成"。如果只是"启动一个后台任务不等它"，用 \`create_task\`：

\`\`\`python filename="create_task 后台任务"
# 定义异步函数 background_work，参数: 
async def background_work():
    # await asyncio.sleep(10)
    await asyncio.sleep(10)
    # 调用 print()
    print("后台任务完成")

# 定义异步函数 main，参数: 
async def main():
    # 创建任务但不 await，它会并发跑
    # 定义变量 task，赋值为 asyncio.create_task(background_work())
    task = asyncio.create_task(background_work())
    # 调用 print()
    print("主流程继续，不等后台任务")
    # 之后需要时再 await
    await task   # 如果还没完成，这里等它
\`\`\`

## 十、完整的异步路由示例

\`\`\`python filename="async 路由示例"
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 导入 asyncio 模块
import asyncio
# 导入 httpx 模块
import httpx

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 GET 路由：访问 /weather 时触发
@app.get("/weather")
# 定义异步函数 get_weather，参数: city: str
async def get_weather(city: str):
    # 并发调两个 API：天气 + 空气质量
    # async with httpx.AsyncClient(timeout=5) as client:
    async with httpx.AsyncClient(timeout=5) as client:
        # weather, air = await asyncio.gather(
        weather, air = await asyncio.gather(
            # 调用 client.get()
            client.get(f"https://api.weather.com/{city}"),
            # 调用 client.get()
            client.get(f"https://api.air.com/{city}"),
        # )
        )
    # 返回 {"weather": weather.json(), "air": air.json()}
    return {"weather": weather.json(), "air": air.json()}

@app.get("/heavy")   # CPU 密集型
# 定义异步函数 heavy_compute，参数: 
async def heavy_compute():
    # 不能在 async 里直接跑 CPU 密集任务，扔进程池
    # 导入 anyio.to_thread 模块
    import anyio.to_thread
    # 定义变量 result，赋值为 await anyio.to_thread.run_sync(_fib, 35)
    result = await anyio.to_thread.run_sync(_fib, 35)
    # 返回 {"result": result}
    return {"result": result}

def _fib(n: int) -> int:   # 同步 CPU 密集函数
    # 返回 n if n < 2 else _fib(n-1) + _fib(n-2)
    return n if n < 2 else _fib(n-1) + _fib(n-2)
\`\`\`

## 十一、易错点小结

| 易错点 | 现象 | 正确做法 |
|-------|------|----------|
| \`async def\` 里调 \`time.sleep\` | 卡住整个事件循环 | 用 \`await asyncio.sleep\` 或 \`to_thread\` |
| \`async def\` 里用 \`requests\` | 阻塞事件循环 | 换 \`httpx.AsyncClient\` 或 \`to_thread\` |
| 调协程函数忘了 \`await\` | 返回协程对象而非结果 | 必须 \`await\` 它或 \`asyncio.run\` |
| CPU 密集任务用 async | 单核跑满，并发反而下降 | 扔 \`run_in_executor\`/进程池 |
| 串行 await 多个独立 I/O | 没发挥并发优势 | 用 \`asyncio.gather\` 并发 |
| 同步路由写了 \`async def\` 却无 await | 多此一举，还可能有坑 | 无 I/O 就用普通 \`def\` |
| 协程里访问共享变量加锁 | 误以为协程也要锁 | 协程单线程无锁（除非用了 to_thread） |
| 忘记 \`async with\` 管理资源 | 连接泄漏 | 异步资源用 \`async with\` |

## 十二、小结

async/await 让 Python 在 I/O 等待时让出 CPU，单线程并发处理大量请求。协程比线程轻得多。但 \`async def\` 路由里绝不能调用阻塞函数，否则卡住整个事件循环——这时用 \`anyio.to_thread.run_sync\` 把阻塞代码扔线程池。\`asyncio.gather\` 让多个独立 I/O 并发执行。下一章我们把这套异步思想用到数据库上，看看 AsyncSession 如何避免阻塞。
`
  },

  // =========================================================
  // 第四十二章：异步数据库
  // =========================================================
  {
    id: "async-db",
    group: "异步编程",
    icon: "🗄️",
    title: "异步数据库",
    content: `

# 异步数据库

## 一、同步 ORM 在 async 路由里的问题

上一章我们强调过：\`async def\` 路由里不能调用阻塞函数。但前面数据库章节用的 SQLAlchemy 是**同步的**——\`session.execute()\` 会阻塞当前线程，等数据库返回。如果在 async 路由里直接用同步 Session：

\`\`\`python filename="反面教材：async 路由里用同步 DB"
# 定义 GET 路由：访问 /users/{user_id} 时触发
@app.get("/users/{user_id}")
# 定义异步函数 read_user，参数: user_id: int
async def read_user(user_id: int):
    # ❌ db.execute() 是阻塞调用，会卡住事件循环！
    # 定义变量 user，赋值为 db.execute(select(User).where(User.id == user...
    user = db.execute(select(User).where(User.id == user_id)).scalar_one()
    # 返回 user
    return user
\`\`\`

后果：数据库查询的几十毫秒里，整个事件循环停摆，所有并发请求都排队等这一个查询完成。这等于把异步框架的并发优势全废了，性能可能还不如纯同步框架。

\`\`\`txt filename="同步 vs 异步数据库对比"
同步 ORM 在 async 路由：
  请求A 查询(50ms阻塞) → 事件循环卡死 → 请求B/C/D 全部等待
  → 吞吐量 ≈ 20 请求/秒

异步 ORM 在 async 路由：
  请求A 查询(挂起50ms) → 事件循环去跑 B/C/D → A 查询返回继续
  → 吞吐量 ≈ 数千请求/秒
\`\`\`

解决之道：用 SQLAlchemy 2.0 的**异步扩展**（AsyncSession + async_engine），让数据库操作也变成可 await 的协程。

## 二、SQLAlchemy 2.0 异步栈

\`\`\`txt filename="异步数据库栈"
应用层  AsyncSession（异步会话）
   ↕  await session.execute(...)
引擎层  create_async_engine（异步引擎）
   ↕  连接池（AsyncAdaptedQueuePool）
驱动层  asyncpg（PostgreSQL）/ aiomysql / aiosqlite
   ↕  异步 I/O
数据库  PostgreSQL / MySQL / SQLite
\`\`\`

注意三处和同步版的不同：
1. **引擎**：\`create_async_engine\`（不是 \`create_engine\`）。
2. **会话**：\`AsyncSession\` + \`async_sessionmaker\`（不是 \`Session\` + \`sessionmaker\`）。
3. **驱动**：URL 用异步驱动（\`asyncpg\` / \`aiomysql\` / \`aiosqlite\`）。

## 三、安装异步驱动

\`\`\`bash filename="按数据库装驱动"
# PostgreSQL（推荐 asyncpg，性能最好）
# 安装 Python 包: asyncpg
pip install asyncpg

# MySQL
# 安装 Python 包: aiomysql
pip install aiomysql

# SQLite（开发测试用）
# 安装 Python 包: aiosqlite
pip install aiosqlite
\`\`\`

\`\`\`txt filename="异步数据库 URL"
# PostgreSQL
postgresql+asyncpg://user:pass@localhost:5432/mydb

# MySQL
mysql+aiomysql://user:pass@localhost:3306/mydb

# SQLite
sqlite+aiosqlite:///./app.db
\`\`\`

## 四、create_async_engine 与 AsyncSession

\`\`\`python filename="database.py - 异步配置"
# 从 sqlalchemy.ext.asyncio 导入（多行）
from sqlalchemy.ext.asyncio import (
    # create_async_engine,
    create_async_engine,
    # AsyncSession,
    AsyncSession,
    # async_sessionmaker,
    async_sessionmaker,
    # AsyncAttrs,
    AsyncAttrs,
# )
)
# 从 sqlalchemy.orm 导入 DeclarativeBase
from sqlalchemy.orm import DeclarativeBase

# 定义变量 DATABASE_URL，赋值为 "postgresql+asyncpg://postgres:secret@localho...
DATABASE_URL = "postgresql+asyncpg://postgres:secret@localhost:5432/blog"

# 异步引擎（注意是 create_async_engine）
# 定义变量 engine，赋值为 create_async_engine(
engine = create_async_engine(
    # DATABASE_URL,
    DATABASE_URL,
    # 定义变量 pool_size，赋值为 5,
    pool_size=5,
    # 定义变量 max_overflow，赋值为 10,
    max_overflow=10,
    # 定义变量 pool_recycle，赋值为 3600,
    pool_recycle=3600,
    # 定义变量 echo，赋值为 False,
    echo=False,
# )
)

# 异步 Session 工厂
# 定义变量 AsyncSessionLocal，赋值为 async_sessionmaker(
AsyncSessionLocal = async_sessionmaker(
    # 定义变量 bind，赋值为 engine,
    bind=engine,
    # 定义变量 class_，赋值为 AsyncSession,
    class_=AsyncSession,
    expire_on_commit=False,   # 异步场景 commit 后访问属性会触发同步查询，必须关
    # 定义变量 autoflush，赋值为 False,
    autoflush=False,
# )
)

# 模型基类：用 AsyncAttrs 让关系属性支持异步访问
# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    # 空操作占位
    pass
\`\`\`

> **\`expire_on_commit=False\` 在异步里几乎是必须的**。默认 \`True\` 时，commit 后访问对象的任何属性都会触发一次同步刷新查询，而异步 Session 不能在同步上下文里查询，会直接报错。关掉后 commit 后属性值仍可用。

## 五、异步 get_db 依赖

\`\`\`python filename="异步依赖"
# 从 typing 导入 AsyncGenerator
from typing import AsyncGenerator
# 从 sqlalchemy.ext.asyncio 导入 AsyncSession
from sqlalchemy.ext.asyncio import AsyncSession

# 定义异步函数 get_async_db，返回: AsyncGenerator[AsyncSession, None]
async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    # """异步版 get_db：用 async yield 依赖。"""
    """异步版 get_db：用 async yield 依赖。"""
    async with AsyncSessionLocal() as session:   # 异步上下文管理器
        # 尝试执行，捕获异常
        try:
            # 生成值: session
            yield session
        # 捕获 Exception 异常
        except Exception:
            await session.rollback()   # 异步回滚
            # raise
            raise
        # 无论是否异常都执行
        finally:
            await session.close()     # 异步关闭
\`\`\`

\`\`\`txt filename="简化版（推荐）"
async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
        # async with 退出时自动 close
        # 事务边界：如果路由里 commit 了，正常；异常会自动 rollback
\`\`\`

## 六、异步 CRUD：await session.execute()

\`\`\`python filename="异步 CRUD"
# 从 sqlalchemy 导入 select, func
from sqlalchemy import select, func
# 从 sqlalchemy.ext.asyncio 导入 AsyncSession
from sqlalchemy.ext.asyncio import AsyncSession

# 定义异步函数 create_user，返回: User
async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
    # 定义变量 user，赋值为 User(name=user_in.name, email=user_in.email, ...
    user = User(name=user_in.name, email=user_in.email, hashed_password=hash_password(user_in.password))
    db.add(user)             # add 是同步的（只是登记）
    await db.commit()        # ★ commit 是异步的
    await db.refresh(user)   # ★ refresh 是异步的
    # 返回 user
    return user

# 定义异步函数 get_user，返回: User | None
async def get_user(db: AsyncSession, user_id: int) -> User | None:
    # ★ execute 是异步的，要 await
    # 定义变量 result，赋值为 await db.execute(select(User).where(User.id =...
    result = await db.execute(select(User).where(User.id == user_id))
    # 返回 result.scalar_one_or_none()
    return result.scalar_one_or_none()

# 定义异步函数 list_users，返回: list[User]
async def list_users(db: AsyncSession, skip: int = 0, limit: int = 20) -> list[User]:
    # 定义变量 result，赋值为 await db.execute(select(User).order_by(User.i...
    result = await db.execute(select(User).order_by(User.id).offset(skip).limit(limit))
    # 返回 list(result.scalars())
    return list(result.scalars())

# 定义异步函数 update_user，返回: User
async def update_user(db: AsyncSession, user: User, user_in: UserUpdate) -> User:
    # 定义变量 data，赋值为 user_in.model_dump(exclude_unset=True)
    data = user_in.model_dump(exclude_unset=True)
    # 遍历 data.items()，取 field, value
    for field, value in data.items():
        # 调用 setattr()
        setattr(user, field, value)
    # await db.commit()
    await db.commit()
    # await db.refresh(user)
    await db.refresh(user)
    # 返回 user
    return user

# 定义异步函数 delete_user，返回: None
async def delete_user(db: AsyncSession, user: User) -> None:
    await db.delete(user)    # ★ delete 也是异步的
    # await db.commit()
    await db.commit()
\`\`\`

### 同步 vs 异步 API 对照表

| 操作 | 同步 Session | 异步 AsyncSession |
|------|--------------|---------------------|
| 执行查询 | \`db.execute(stmt)\` | \`await db.execute(stmt)\` |
| 提交 | \`db.commit()\` | \`await db.commit()\` |
| 回滚 | \`db.rollback()\` | \`await db.rollback()\` |
| 刷新 | \`db.refresh(obj)\` | \`await db.refresh(obj)\` |
| 删除 | \`db.delete(obj)\` | \`await db.delete(obj)\` |
| 关闭 | \`db.close()\` | \`await db.close()\` |
| 按主键查 | \`db.get(User, id)\` | \`await db.get(User, id)\` |
| add | \`db.add(obj)\` | \`db.add(obj)\`（同步） |

> 规律：**涉及 I/O 的方法都是 async**（execute/commit/refresh/delete/get/close），**纯内存操作是同步的**（add）。漏写 \`await\` 会拿到一个协程对象而不是结果，运行时报错。

## 七、异步路由

\`\`\`python filename="异步路由"
# 从 fastapi 导入 APIRouter, Depends, HTTPException
from fastapi import APIRouter, Depends, HTTPException
# 从 sqlalchemy.ext.asyncio 导入 AsyncSession
from sqlalchemy.ext.asyncio import AsyncSession

# 创建 APIRouter 实例，设置路由前缀
router = APIRouter(prefix="/users", tags=["用户"])

# 定义 POST 路由：访问 / 时触发
@router.post("/", response_model=UserRead, status_code=201)
# 定义异步函数 create_user_endpoint，参数: user_in: UserCreate, db: AsyncSession = Depends(ge...
async def create_user_endpoint(user_in: UserCreate, db: AsyncSession = Depends(get_async_db)):
    # 查重
    # 定义变量 existing，赋值为 await db.execute(select(User).where(User.emai...
    existing = await db.execute(select(User).where(User.email == user_in.email))
    # 条件判断：如果 existing.scalar_one_or_none()
    if existing.scalar_one_or_none():
        # 抛出 HTTPException 异常: 400, "邮箱已被注册"
        raise HTTPException(400, "邮箱已被注册")
    # 定义变量 user，赋值为 await create_user(db, user_in)
    user = await create_user(db, user_in)
    # 返回 user
    return user

# 定义 GET 路由：访问 /{user_id} 时触发
@router.get("/{user_id}", response_model=UserRead)
# 定义异步函数 read_user_endpoint，参数: user_id: int, db: AsyncSession = Depends(get_async...
async def read_user_endpoint(user_id: int, db: AsyncSession = Depends(get_async_db)):
    # 定义变量 user，赋值为 await get_user(db, user_id)
    user = await get_user(db, user_id)
    # 条件判断：如果 not user
    if not user:
        # 抛出 HTTPException 异常: 404, "用户不存在"
        raise HTTPException(404, "用户不存在")
    # 返回 user
    return user

# 定义 GET 路由：访问 / 时触发
@router.get("/")
# async def list_users_endpoint(
async def list_users_endpoint(
    # 字段 skip，类型: int，默认值: 0,
    skip: int = 0,
    # 字段 limit，类型: int，默认值: Query(default=20, le=100),
    limit: int = Query(default=20, le=100),
    # 字段 db，类型: AsyncSession，默认值: Depends(get_async_db),
    db: AsyncSession = Depends(get_async_db),
# ):
):
    # users, total = await asyncio.gather(
    users, total = await asyncio.gather(
        # 调用 list_users()
        list_users(db, skip, limit),
        # 调用 count_users()
        count_users(db),
    # )
    )
    # 返回 {"items": users, "total": total}
    return {"items": users, "total": total}
\`\`\`

## 八、异步建表

\`\`\`python filename="异步建表"
# 定义异步函数 init_db，参数: 
async def init_db():
    # async with engine.begin() as conn:
    async with engine.begin() as conn:
        # 在事务里执行 DDL
        # await conn.run_sync(Base.metadata.create_all)
        await conn.run_sync(Base.metadata.create_all)

# 应用启动时调用
# 导入 asyncio 模块
import asyncio
# 调用 asyncio.run()
asyncio.run(init_db())
\`\`\`

> \`Base.metadata.create_all\` 是同步函数，不能直接在异步上下文调。用 \`conn.run_sync()\` 把它包一层异步执行。这是 SQLAlchemy 异步扩展的标准用法。

## 九、并发查询：异步 DB 的真正威力

\`\`\`python filename="并发查询多个表"
# 定义 GET 路由：访问 /dashboard/{user_id} 时触发
@app.get("/dashboard/{user_id}")
# 定义异步函数 dashboard，参数: user_id: int, db: AsyncSession = Depends(get_async...
async def dashboard(user_id: int, db: AsyncSession = Depends(get_async_db)):
    # 三个独立查询，并发执行，总耗时 ≈ 最慢的那个
    # user, posts, comments = await asyncio.gather(
    user, posts, comments = await asyncio.gather(
        # 调用 db.get()
        db.get(User, user_id),
        # 调用 db.execute()
        db.execute(select(Post).where(Post.author_id == user_id)),
        # 调用 db.execute()
        db.execute(select(Comment).where(Comment.user_id == user_id)),
    # )
    )
    # 返回 {
    return {
        # "user": user,
        "user": user,
        # "posts": list(posts.scalars()),
        "posts": list(posts.scalars()),
        # "comments": list(comments.scalars()),
        "comments": list(comments.scalars()),
    # }
    }
\`\`\`

\`\`\`txt filename="并发查询时序"
同步（串行）：3 次查询 × 50ms = 150ms
异步（并发）：max(50ms, 50ms, 50ms) ≈ 50ms
↑ 数据库连接池支持并发，三个查询同时在不同连接上跑
\`\`\`

> 注意：\`asyncio.gather\` 让三个查询并发，但它们**共用同一个 AsyncSession**。SQLAlchemy 的 AsyncSession 内部其实串行化执行（一个连接）。要真正并行，每个查询要用自己的 Session。所以并发查询提升主要来自"等待时间重叠"而非"CPU 并行"。

## 十、异步关系加载：selectinload 避免懒加载

\`\`\`python filename="关系加载陷阱"
# 定义异步函数 bad_load，参数: 
async def bad_load():
    # 定义变量 user，赋值为 await db.get(User, 1)
    user = await db.get(User, 1)
    # ❌ 访问 user.posts 会触发懒加载（同步查询），异步 Session 不支持，直接报错
    # 调用 print()
    print(user.posts)

# 定义异步函数 good_load，参数: 
async def good_load():
    # ✅ 用 selectinload 显式预加载关系
    # 定义变量 stmt，赋值为 select(User).options(selectinload(User.posts)...
    stmt = select(User).options(selectinload(User.posts)).where(User.id == 1)
    # 定义变量 user，赋值为 (await db.execute(stmt)).scalar_one()
    user = (await db.execute(stmt)).scalar_one()
    print(user.posts)   # 已经加载好了，不会再查
\`\`\`

异步场景下**禁用懒加载**，所有需要的关系必须在查询时用 \`selectinload\`/\`joinedload\` 显式预加载。否则访问关系属性会触发同步查询，AsyncSession 报错。

\`\`\`python filename="加载策略对比"
# 从 sqlalchemy.orm 导入 selectinload, joinedload
from sqlalchemy.orm import selectinload, joinedload

# selectinload：单独一条 IN 查询加载所有关联（N+1 优化首选）
# 定义变量 stmt，赋值为 select(Post).options(selectinload(Post.author...
stmt = select(Post).options(selectinload(Post.author))

# joinedload：用 JOIN 一次查回（适合一对一或必须一起取的）
# 定义变量 stmt，赋值为 select(User).options(joinedload(User.profile)...
stmt = select(User).options(joinedload(User.profile))
\`\`\`

## 十一、易错点小结

| 易错点 | 现象 | 正确做法 |
|-------|------|----------|
| async 路由用同步 Session | 阻塞事件循环 | 用 AsyncSession |
| 漏写 \`await\` | 拿到协程对象非结果 | I/O 方法都要 await |
| \`expire_on_commit=True\` | commit 后访问属性报错 | 异步设 \`False\` |
| 关系懒加载 | AsyncSession 报错 | 用 \`selectinload\` 预加载 |
| 同步和异步混用同一个 engine | 驱动不匹配崩溃 | 同步用 \`create_engine\`，异步用 \`create_async_engine\` |
| \`run_sync\` 用错 | DDL 跑不起来 | \`conn.run_sync(Base.metadata.create_all)\` |
| 一个 AsyncSession 跑并发查询 | 内部串行化 | 真并行要多个 Session |
| 忘了 \`async with\` | 连接泄漏 | 异步资源用 \`async with\` |

## 十二、小结

异步数据库让查询操作变成可 await 的协程，不阻塞事件循环。用 \`create_async_engine\` + \`async_sessionmaker\` + \`AsyncSession\`，I/O 方法都加 \`await\`。\`expire_on_commit=False\`、关系用 \`selectinload\` 预加载是异步场景的两个关键配置。\`asyncio.gather\` 让多个独立查询并发，压榨 I/O 等待时间。下一章我们看异步 HTTP 客户端 httpx，把"调外部 API"也变成不阻塞的。
`
  },

  // =========================================================
  // 第四十三章：异步 HTTP 客户端 httpx
  // =========================================================
  {
    id: "async-httpx",
    group: "异步编程",
    icon: "🌐",
    title: "异步 HTTP 客户端 httpx",
    content: `

# 异步 HTTP 客户端 httpx

## 一、为什么需要异步 HTTP 调用

后端经常要调外部 API：查天气、调支付、聚合多个数据源。这些调用是网络 I/O，一次可能耗时几百毫秒到几秒。如果在 async 路由里用同步的 \`requests\` 库：

\`\`\`python filename="反面教材"
# 定义 GET 路由：访问 /weather 时触发
@app.get("/weather")
# 定义异步函数 weather，参数: city: str
async def weather(city: str):
    # ❌ requests.get 是阻塞的，卡住事件循环
    # 定义变量 resp，赋值为 requests.get(f"https://api.weather.com/{city}...
    resp = requests.get(f"https://api.weather.com/{city}")
    # 返回 resp.json()
    return resp.json()
\`\`\`

这又掉进上一章说的陷阱：阻塞调用让事件循环停摆，所有并发请求遭殃。正确做法是用**异步 HTTP 客户端**，让"等外部 API 响应"的时间也能让出 CPU。

\`\`\`txt filename="同步 vs 异步 HTTP 调外部 API"
同步 requests：发起请求 → 阻塞等响应(300ms) → 卡住事件循环
异步 httpx：  发起请求 → 挂起 → 事件循环跑别的 → 响应到了继续
            同时还能用 gather 并发调多个 API
\`\`\`

## 二、httpx：现代 Python HTTP 客户端

**httpx** 是一个现代化的 HTTP 客户端库，号称"requests 的继承者"。它最大的亮点是**同时支持同步和异步**两套 API，接口几乎和 requests 一致，迁移成本低。

\`\`\`bash filename="安装"
# 安装 Python 包: httpx
pip install httpx
\`\`\`

| 维度 | requests | httpx |
|------|----------|-------|
| 同步 API | ✅ | ✅ |
| 异步 API | ❌ | ✅ \`AsyncClient\` |
| HTTP/2 | ❌ | ✅ |
| 连接池复用 | Session | Client / AsyncClient |
| 接口风格 | — | 几乎和 requests 一样 |
| 维护活跃度 | 维护中 | 活跃 |

迁移技巧：把 \`requests.get\` 改成 \`httpx.get\`，参数几乎不变；异步版把 \`httpx.Client\` 换成 \`httpx.AsyncClient\`，方法前加 \`await\`。

## 三、AsyncClient：异步客户端

\`\`\`python filename="基础用法"
# 导入 httpx 模块
import httpx

# 定义异步函数 fetch_user，参数: user_id: int
async def fetch_user(user_id: int):
    # async with 管理客户端生命周期（连接池）
    # async with httpx.AsyncClient() as client:
    async with httpx.AsyncClient() as client:
        # await 等待响应，期间不阻塞事件循环
        # 定义变量 response，赋值为 await client.get(f"https://api.example.com/us...
        response = await client.get(f"https://api.example.com/users/{user_id}")
        response.raise_for_status()   # 状态码非 2xx 抛异常
        # 返回 response.json()
        return response.json()
\`\`\`

### 为什么用 \`async with\` 创建客户端？

\`AsyncClient\` 内部维护一个**连接池**。如果每次请求都 \`httpx.AsyncClient()\` 新建一个，连接池就失去复用意义，每次都要 TCP 握手 + TLS 握手，慢且耗资源。

\`\`\`txt filename="客户端复用 vs 每次新建"
❌ 每次请求 new 一个 client：
   请求1: new client → 握手 → 请求 → 关闭
   请求2: new client → 握手 → 请求 → 关闭   ← 每次握手浪费

✅ 复用一个 client：
   client = AsyncClient()  ← 连接池建立
   请求1: 复用连接 → 请求 → 还回池子
   请求2: 复用连接 → 请求 → 还回池子   ← 连接复用，省握手
\`\`\`

所以最佳实践是：**应用级别持有一个长期复用的 AsyncClient**，所有请求共用它的连接池。

## 四、应用级共享客户端

\`\`\`python filename="共享客户端"
# 从 contextlib 导入 asynccontextmanager
from contextlib import asynccontextmanager
# 导入 httpx 模块
import httpx

# 全局共享客户端
# 字段 http_client，类型: httpx.AsyncClient | None，默认值: None
http_client: httpx.AsyncClient | None = None

# 装饰器：asynccontextmanager
@asynccontextmanager
# 定义异步函数 lifespan，参数: app
async def lifespan(app):
    # 应用启动：创建共享客户端
    # global http_client
    global http_client
    # 定义变量 http_client，赋值为 httpx.AsyncClient(
    http_client = httpx.AsyncClient(
        timeout=httpx.Timeout(10.0, connect=5.0),   # 总超时10s，连接超时5s
        # 定义变量 limits，赋值为 httpx.Limits(max_connections=100, max_keepali...
        limits=httpx.Limits(max_connections=100, max_keepalive_connections=20),
    # )
    )
    # yield
    yield
    # 应用关闭：关闭客户端，释放连接池
    # await http_client.aclose()
    await http_client.aclose()

# 创建 FastAPI 应用实例
app = FastAPI(lifespan=lifespan)

# 定义 GET 路由：访问 /proxy/{path:path} 时触发
@app.get("/proxy/{path:path}")
# 定义异步函数 proxy，参数: path: str
async def proxy(path: str):
    # 复用全局客户端，连接池命中
    # 定义变量 resp，赋值为 await http_client.get(f"https://api.example.c...
    resp = await http_client.get(f"https://api.example.com/{path}")
    # 返回 resp.json()
    return resp.json()
\`\`\`

\`\`\`txt filename="超时配置"
httpx.Timeout(timeout=10.0)              # 所有阶段都 10s
httpx.Timeout(10.0, connect=5.0)          # 总10s，连接5s
httpx.Timeout(10.0, connect=5.0, read=3.0)  # 总10s，连接5s，读取3s
↑ 调外部 API 一定要设超时，否则对方卡住你这边无限等待
\`\`\`

## 五、各种请求方法

\`\`\`python filename="HTTP 方法"
# async with httpx.AsyncClient() as client:
async with httpx.AsyncClient() as client:
    # GET 带查询参数
    # 定义变量 resp，赋值为 await client.get("https://api.example.com/use...
    resp = await client.get("https://api.example.com/users", params={"page": 1, "size": 20})
    # POST 带 JSON 体
    # 定义变量 resp，赋值为 await client.post("https://api.example.com/us...
    resp = await client.post("https://api.example.com/users", json={"name": "alice"})
    # POST 带表单
    # 定义变量 resp，赋值为 await client.post(url, data={"username": "ali...
    resp = await client.post(url, data={"username": "alice", "password": "..."})
    # PUT / PATCH / DELETE
    # 定义变量 resp，赋值为 await client.put(url, json={...})
    resp = await client.put(url, json={...})
    # 定义变量 resp，赋值为 await client.patch(url, json={...})
    resp = await client.patch(url, json={...})
    # 定义变量 resp，赋值为 await client.delete(url)
    resp = await client.delete(url)
    # 自定义请求头
    # 定义变量 resp，赋值为 await client.get(url, headers={"Authorization...
    resp = await client.get(url, headers={"Authorization": "Bearer xxx"})
\`\`\`

## 六、并发请求：asyncio.gather

调外部 API 最爽的是并发——同时发起多个请求，总耗时约等于最慢的那个：

\`\`\`python filename="并发聚合多个 API"
# 导入 asyncio 模块
import asyncio
# 导入 httpx 模块
import httpx

# 定义异步函数 fetch_aggregate，参数: user_id: int
async def fetch_aggregate(user_id: int):
    # """并发调三个 API 聚合成仪表盘数据。"""
    """并发调三个 API 聚合成仪表盘数据。"""
    # async with httpx.AsyncClient(timeout=5) as client:
    async with httpx.AsyncClient(timeout=5) as client:
        # 三个请求同时发，并发等待
        # profile, orders, points = await asyncio.gather(
        profile, orders, points = await asyncio.gather(
            # 调用 client.get()
            client.get(f"https://user-svc/users/{user_id}"),
            # 调用 client.get()
            client.get(f"https://order-svc/orders?user={user_id}"),
            # 调用 client.get()
            client.get(f"https://point-svc/points/{user_id}"),
        # )
        )
        # 返回 {
        return {
            # "profile": profile.json(),
            "profile": profile.json(),
            # "orders": orders.json(),
            "orders": orders.json(),
            # "points": points.json(),
            "points": points.json(),
        # }
        }

# 串行版对比：总耗时 = 0.3s + 0.4s + 0.2s = 0.9s
# 并发版：总耗时 = max(0.3s, 0.4s, 0.2s) = 0.4s
\`\`\`

## 七、异常处理

\`\`\`python filename="异常处理"
# 导入 httpx 模块
import httpx

# 定义异步函数 safe_fetch，参数: url: str
async def safe_fetch(url: str):
    # 尝试执行，捕获异常
    try:
        # async with httpx.AsyncClient() as client:
        async with httpx.AsyncClient() as client:
            # 定义变量 resp，赋值为 await client.get(url)
            resp = await client.get(url)
            resp.raise_for_status()   # 4xx/5xx 抛 HTTPStatusError
            # 返回 resp.json()
            return resp.json()
    # except httpx.TimeoutException:
    except httpx.TimeoutException:
        # 超时（连接超时、读取超时）
        # 抛出 HTTPException 异常: 504, "上游服务超时"
        raise HTTPException(504, "上游服务超时")
    # except httpx.ConnectError:
    except httpx.ConnectError:
        # 连不上（DNS 解析失败、对方拒绝连接）
        # 抛出 HTTPException 异常: 502, "无法连接上游服务"
        raise HTTPException(502, "无法连接上游服务")
    # except httpx.HTTPStatusError as e:
    except httpx.HTTPStatusError as e:
        # 上游返回了错误状态码
        # 抛出 HTTPException 异常: e.response.status_code, f"上游错误：{e.response.text}"
        raise HTTPException(e.response.status_code, f"上游错误：{e.response.text}")
    # except httpx.RequestError:
    except httpx.RequestError:
        # 其他请求错误
        # 抛出 HTTPException 异常: 500, "请求失败"
        raise HTTPException(500, "请求失败")
\`\`\`

| 异常类型 | 含义 | 建议处理 |
|----------|------|----------|
| \`ConnectError\` | 连不上服务器 | 502 Bad Gateway |
| \`TimeoutException\` | 超时 | 504 Gateway Timeout |
| \`HTTPStatusError\` | 状态码非 2xx | 透传上游状态 |
| \`RequestError\` | 其他请求异常 | 500 |

## 八、实战：BFF 聚合接口

**BFF（Backend For Frontend）** 模式：前端不直接调多个微服务，而是由一个聚合后端调多个微服务再统一返回。httpx + gather 是实现 BFF 的利器。

\`\`\`python filename="BFF 聚合"
# 从 fastapi 导入 FastAPI, HTTPException
from fastapi import FastAPI, HTTPException
# 导入 httpx 模块
import httpx

# 创建 FastAPI 应用实例
app = FastAPI()
client = httpx.AsyncClient(timeout=5)   # 全局共享

# 装饰器：app.on_event
@app.on_event("shutdown")
# 定义异步函数 shutdown，参数: 
async def shutdown():
    # await client.aclose()
    await client.aclose()

# 定义 GET 路由：访问 /dashboard/{user_id} 时触发
@app.get("/dashboard/{user_id}")
# 定义异步函数 dashboard，参数: user_id: int
async def dashboard(user_id: int):
    # 尝试执行，捕获异常
    try:
        # 并发调三个微服务
        # profile_resp, feed_resp, notif_resp = await asynci
        profile_resp, feed_resp, notif_resp = await asyncio.gather(
            # 调用 client.get()
            client.get(f"http://user-svc/users/{user_id}"),
            # 调用 client.get()
            client.get(f"http://feed-svc/feeds?user={user_id}&limit=10"),
            # 调用 client.get()
            client.get(f"http://notif-svc/unread/{user_id}"),
            return_exceptions=True,   # ★ 任意一个失败不抛，返回异常对象
        # )
        )
    # except httpx.RequestError:
    except httpx.RequestError:
        # 抛出 HTTPException 异常: 503, "聚合服务暂时不可用"
        raise HTTPException(503, "聚合服务暂时不可用")

    # 容错：某个微服务挂了不影响整体
    # 定义字典 result
    result = {"profile": None, "feed": [], "notifications": []}
    # 条件判断：如果 isinstance(profile_resp, httpx.Response) and profile_resp.status_code == 200
    if isinstance(profile_resp, httpx.Response) and profile_resp.status_code == 200:
        # result["profile"] = profile_resp.json()
        result["profile"] = profile_resp.json()
    # 条件判断：如果 isinstance(feed_resp, httpx.Response) and feed_resp.status_code == 200
    if isinstance(feed_resp, httpx.Response) and feed_resp.status_code == 200:
        # result["feed"] = feed_resp.json()
        result["feed"] = feed_resp.json()
    # 条件判断：如果 isinstance(notif_resp, httpx.Response) and notif_resp.status_code == 200
    if isinstance(notif_resp, httpx.Response) and notif_resp.status_code == 200:
        # result["notifications"] = notif_resp.json()
        result["notifications"] = notif_resp.json()
    # 返回 result
    return result
\`\`\`

> \`return_exceptions=True\` 是容错关键：某个微服务超时/报错，不会让整个聚合接口崩，而是返回异常对象让你单独处理。这是 BFF 的精髓——**部分降级而非整体失败**。

## 九、连接池与并发控制

\`\`\`python filename="连接池配置"
# 定义变量 client，赋值为 httpx.AsyncClient(
client = httpx.AsyncClient(
    # 定义变量 limits，赋值为 httpx.Limits(
    limits=httpx.Limits(
        max_connections=100,            # 最大并发连接数
        max_keepalive_connections=20,  # 最大保活连接数（连接池大小）
        keepalive_expiry=30.0,         # 保活连接空闲多久后关闭
    # ),
    ),
# )
)
\`\`\`

\`\`\`txt filename="连接池调参原则"
max_connections 太小：高并发时请求排队，吞吐受限
max_connections 太大：占对方连接数，可能被打回
keepalive 太长：空闲连接长时间不释放，占资源
keepalive 太短：频繁重建连接，失去复用优势
↑ 一般 max_keepalive_connections 设成预估并发数的 1/2~2/3
\`\`\`

## 十、易错点小结

| 易错点 | 现象 | 正确做法 |
|-------|------|----------|
| 每次请求 new AsyncClient | 连接池失效，握手开销大 | 全局共享一个 client |
| 忘了 \`aclose()\` | 连接泄漏 | \`async with\` 或 shutdown 时关 |
| 不设超时 | 上游卡死自己也卡死 | \`timeout=\` 必设 |
| 串行 await 多个独立请求 | 慢 | \`asyncio.gather\` 并发 |
| 不处理上游异常 | 自己服务 500 | try/except 转成合理状态码 |
| 不用 \`return_exceptions\` | 一个挂全挂 | BFF 模式加容错 |
| async 路由用 \`requests\` | 阻塞事件循环 | 换 \`httpx.AsyncClient\` |
| 把客户端当全局变量未初始化 | NoneType 报错 | lifespan 里创建 |

## 十一、小结

httpx 是异步 HTTP 客户端首选，API 兼容 requests 又支持 async。用 \`AsyncClient\` + \`async with\` 管理连接池，应用级共享一个客户端复用连接。\`asyncio.gather\` 让多个外部 API 并发调用，BFF 模式配 \`return_exceptions=True\` 实现部分降级。务必设超时、做异常处理，把上游故障转成合理的 HTTP 状态码。下一章讲 FastAPI 的轻量后台任务机制 BackgroundTasks。
`
  },

  // =========================================================
  // 第四十四章：后台任务 BackgroundTasks
  // =========================================================
  {
    id: "async-tasks",
    group: "异步编程",
    icon: "📋",
    title: "后台任务 BackgroundTasks",
    content: `

# 后台任务 BackgroundTasks

## 一、有些事不必在请求里做完

有些操作"耗时但用户不用等结果"：注册后发欢迎邮件、下单后写日志、缓存预热。如果让用户等这些操作完成才返回响应，体验很差——发个邮件要 2 秒，用户等 2 秒才看到"注册成功"，没意义。

\`\`\`txt filename="同步等待 vs 后台执行"
同步：注册 → 写库 → 发邮件(2s) → 返回"成功"   ← 用户等 2s
后台：注册 → 写库 → 返回"成功" → 后台发邮件    ← 用户秒回，邮件稍后到
\`\`\`

FastAPI 内置了 **BackgroundTasks** 机制：你把任务挂上去，响应**先返回给客户端**，任务在响应之后由 FastAPI 在后台执行。用户不感知，但任务还是会跑。

## 二、BackgroundTasks vs Celery

Python 后台任务有两个量级：

| 维度 | FastAPI BackgroundTasks | Celery / RQ / Dramatiq |
|------|------------------------|------------------------|
| 依赖 | 内置，零依赖 | 要装 broker（Redis/RabbitMQ） |
| 部署 | 单进程内跑 | 需要独立 worker 进程 |
| 持久化 | ❌ 进程重启任务丢失 | ✅ 持久化到 broker |
| 重试 | 需自己实现 | 内置重试机制 |
| 分布式 | ❌ 单机 | ✅ 多 worker 多机 |
| 适合任务 | 轻量、可丢失（邮件、日志、缓存） | 重任务、必须完成（订单、报表） |
| 复杂度 | 极低 | 中等 |

**选型决策**：
- 发个邮件、写个日志、更新个缓存 → **BackgroundTasks**，简单够用。
- 大数据处理、定时任务、必须保证完成的任务 → **Celery/RQ**。
- 进程重启不能丢的任务 → 千万别用 BackgroundTasks。

\`\`\`txt filename="BackgroundTasks 的本质风险"
任务存在进程内存里，没持久化：
  - 进程崩溃/重启 → 进行中的任务丢失
  - 任务排队时进程被杀 → 未开始的任务丢失
  - 部署滚动更新时旧进程退出 → 任务可能没跑完
↑ 所以只放"丢了也没事"的任务
\`\`\`

## 三、使用 BackgroundTasks

\`\`\`python filename="基础用法"
# 从 fastapi 导入 BackgroundTasks
from fastapi import BackgroundTasks

# 定义函数 send_welcome_email，参数: email: str
def send_welcome_email(email: str):
    # 模拟发邮件（这是个同步函数，FastAPI 会在线程池跑）
    # 导入 time 模块
    import time
    time.sleep(2)   # 耗时操作
    # 调用 print()
    print(f"已发送欢迎邮件给 {email}")

# 定义 POST 路由：访问 /register 时触发
@app.post("/register")
# 定义函数 register，参数: user_in: UserCreate, background_tasks: BackgroundT...
def register(user_in: UserCreate, background_tasks: BackgroundTasks):
    # 1. 主流程：创建用户
    # 定义变量 user，赋值为 create_user(user_in)
    user = create_user(user_in)
    # 2. 挂后台任务（不会立刻执行）
    # 调用 background_tasks.add_task()
    background_tasks.add_task(send_welcome_email, user_in.email)
    # 3. 立即返回响应，用户不等邮件
    # 返回 {"msg": "注册成功", "user_id": user.id}
    return {"msg": "注册成功", "user_id": user.id}
    # 4. 响应发送给客户端后，FastAPI 才在后台执行 send_welcome_email
\`\`\`

### 关键点

- \`background_tasks.add_task(func, *args, **kwargs)\`：挂一个任务，参数直接传。
- 任务函数可以是**同步函数**（FastAPI 扔线程池跑）或**异步函数**（在事件循环跑）。
- 任务在**响应返回之后**才执行，不是并行于主流程。

\`\`\`txt filename="执行时序"
t=0  register 被调用
t=0  add_task 挂任务（不执行）
t=0  return 响应 → 序列化发给客户端
t=0+ 响应发完后，FastAPI 调用 send_welcome_email
t=2  邮件发送完成
↑ 客户端在 t=0 就收到响应，没等那 2 秒
\`\`\`

## 四、同步任务 vs 异步任务

\`\`\`python filename="两种任务函数"
# 同步任务：FastAPI 自动用 anyio.to_thread 扔线程池跑（不卡事件循环）
# 定义函数 sync_task，参数: data: str
def sync_task(data: str):
    time.sleep(2)   # 阻塞，但在工作线程里，安全
    # 调用 write_log()
    write_log(data)

# 异步任务：直接在事件循环跑
# 定义异步函数 async_task，参数: data: str
async def async_task(data: str):
    await asyncio.sleep(2)   # 异步等待，更轻量
    # await async_write_log(data)
    await async_write_log(data)

# 定义 POST 路由：访问 /webhook 时触发
@app.post("/webhook")
# 定义异步函数 webhook，参数: background_tasks: BackgroundTasks
async def webhook(background_tasks: BackgroundTasks):
    # 两种都能挂，FastAPI 自动判断
    # 调用 background_tasks.add_task()
    background_tasks.add_task(sync_task, "sync data")
    # 调用 background_tasks.add_task()
    background_tasks.add_task(async_task, "async data")
    # 返回 {"status": "accepted"}
    return {"status": "accepted"}
\`\`\`

| 任务类型 | 函数签名 | 在哪跑 | 适合 |
|----------|----------|--------|------|
| 同步 | \`def task()\` | 线程池 | 阻塞 I/O（同步 ORM、文件） |
| 异步 | \`async def task()\` | 事件循环 | 异步 I/O（AsyncSession、httpx） |

> 原则：任务里用什么库，函数类型就匹配。用同步 ORM 就用 \`def\`，用 AsyncSession 就用 \`async def\`。混用会踩坑（同步函数里 await 不了，异步函数里阻塞调用卡循环）。

## 五、依赖注入里也能用 BackgroundTasks

\`\`\`python filename="依赖里挂任务"
# 定义函数 get_db_with_log，参数: background_tasks: BackgroundTasks
def get_db_with_log(background_tasks: BackgroundTasks):
    # 定义变量 db，赋值为 SessionLocal()
    db = SessionLocal()
    # 在依赖里就挂个"记录访问日志"的后台任务
    # 调用 background_tasks.add_task()
    background_tasks.add_task(write_access_log, path="/some-endpoint")
    # 尝试执行，捕获异常
    try:
        # 生成值: db
        yield db
    # 无论是否异常都执行
    finally:
        # 调用 db.close()
        db.close()

# 定义 GET 路由：访问 /items 时触发
@app.get("/items")
# 定义函数 list_items，参数: db: Session = Depends(get_db_with_log)
def list_items(db: Session = Depends(get_db_with_log)):
    # 依赖里挂的日志任务也会在响应后执行
    # 返回 [...]
    return [...]
\`\`\`

## 六、多个任务顺序执行

\`\`\`python filename="任务顺序"
# 定义 POST 路由：访问 /order 时触发
@app.post("/order")
# 定义函数 create_order，参数: background_tasks: BackgroundTasks
def create_order(background_tasks: BackgroundTasks):
    # 多个任务按添加顺序依次执行（不是并发）
    # 调用 background_tasks.add_task()
    background_tasks.add_task(send_order_confirmation, order_id)
    # 调用 background_tasks.add_task()
    background_tasks.add_task(update_inventory, order_id)
    # 调用 background_tasks.add_task()
    background_tasks.add_task(send_shipping_notification, order_id)
    # 执行顺序：确认邮件 → 更新库存 → 发货通知
    # 返回 {"order_id": order_id}
    return {"order_id": order_id}
\`\`\`

\`\`\`txt filename="任务执行特性"
- 同步任务：在线程池里串行执行（一个跑完才跑下一个）
- 异步任务：在事件循环里串行 await（一个完成才下一个）
- 同步+异步混合：先跑所有异步，再跑同步？不，按添加顺序
↑ 想要并发，任务内部自己用 asyncio.gather，或拆成 Celery
\`\`\`

## 七、任务异常处理

BackgroundTasks 的异常**不会**传给客户端（响应已经返回了）。异常会被 FastAPI 捕获并记录到日志，但客户端不知道任务失败：

\`\`\`python filename="异常处理"
# 定义函数 risky_task，参数: data: str
def risky_task(data: str):
    # 尝试执行，捕获异常
    try:
        # 定义变量 result，赋值为 call_external_api(data)
        result = call_external_api(data)
        # 条件判断：如果 not result.ok
        if not result.ok:
            # 调用 log_error()
            log_error(f"任务失败：{result.error}")
    # 捕获 Exception 异常，赋值为 e
    except Exception as e:
        # 任务内部必须自己处理异常，否则只进日志，无法重试
        # 调用 log_error()
        log_error(f"任务异常：{e}")
        # 这里可以加重试逻辑
    # 如果异常逃逸到 BackgroundTasks，FastAPI 会记录但不会重试

# 定义 POST 路由：访问 /webhook 时触发
@app.post("/webhook")
# 定义函数 webhook，参数: background_tasks: BackgroundTasks
def webhook(background_tasks: BackgroundTasks):
    # 调用 background_tasks.add_task()
    background_tasks.add_task(risky_task, "payload")
    # 返回 {"status": "ok"}
    return {"status": "ok"}
\`\`\`

\`\`\`txt filename="异常处理原则"
1. 任务函数内部 try/except 兜底，绝不让异常逃逸
2. 失败要记日志（带足够上下文：哪个任务、什么参数）
3. 关键任务考虑重试（指数退避）
4. 真正重要的任务用 Celery（有内置重试 + 持久化）
\`\`\`

## 八、实战：注册后发邮件 + 写日志

\`\`\`python filename="完整实战"
# 从 fastapi 导入 FastAPI, BackgroundTasks, Depends
from fastapi import FastAPI, BackgroundTasks, Depends
# 导入 logging 模块
import logging

# 定义变量 logger，赋值为 logging.getLogger(__name__)
logger = logging.getLogger(__name__)
# 创建 FastAPI 应用实例
app = FastAPI()

# 同步任务：发邮件
# 定义函数 send_welcome_email，参数: email: str, name: str
def send_welcome_email(email: str, name: str):
    # 尝试执行，捕获异常
    try:
        # 实际用 smtplib 或邮件服务 SDK
        # 调用 logger.info()
        logger.info(f"开始发欢迎邮件给 {email}")
        # smtp.sendmail(...)
        # 调用 logger.info()
        logger.info(f"邮件发送完成：{email}")
    # 捕获 Exception 异常，赋值为 e
    except Exception as e:
        # 调用 logger.error()
        logger.error(f"发邮件失败 {email}: {e}")

# 异步任务：用 httpx 调邮件服务
# 定义异步函数 send_email_via_api，参数: email: str, name: str
async def send_email_via_api(email: str, name: str):
    # 导入 httpx 模块
    import httpx
    # 尝试执行，捕获异常
    try:
        # async with httpx.AsyncClient() as client:
        async with httpx.AsyncClient() as client:
            # 定义变量 resp，赋值为 await client.post(
            resp = await client.post(
                # "https://mail-service/send",
                "https://mail-service/send",
                # 定义字典 json
                json={"to": email, "template": "welcome", "name": name},
                # 定义变量 timeout，赋值为 10,
                timeout=10,
            # )
            )
            # 调用 resp.raise_for_status()
            resp.raise_for_status()
    # 捕获 Exception 异常，赋值为 e
    except Exception as e:
        # 调用 logger.error()
        logger.error(f"邮件服务调用失败 {email}: {e}")

# 定义 POST 路由：访问 /register 时触发
@app.post("/register", response_model=UserRead, status_code=201)
# 定义函数 register，参数: user_in: UserCreate, db: Session = Depends(get_db)...
def register(user_in: UserCreate, db: Session = Depends(get_db), background_tasks: BackgroundTasks):
    # 业务校验
    # 条件判断：如果 db.execute(select(User).where(User.email == user_in.email)).scalar_one_or_none()
    if db.execute(select(User).where(User.email == user_in.email)).scalar_one_or_none():
        # 抛出 HTTPException 异常: 400, "邮箱已被注册"
        raise HTTPException(400, "邮箱已被注册")
    # 创建用户
    # 定义变量 user，赋值为 User(name=user_in.name, email=user_in.email, ...
    user = User(name=user_in.name, email=user_in.email, hashed_password=hash_password(user_in.password))
    # 调用 db.add()
    db.add(user)
    # 调用 db.commit()
    db.commit()
    # 调用 db.refresh()
    db.refresh(user)
    # 挂后台任务：发欢迎邮件（用户不用等）
    # 调用 background_tasks.add_task()
    background_tasks.add_task(send_email_via_api, user.email, user.name)
    # 返回 user
    return user
\`\`\`

## 九、测试 BackgroundTasks

\`\`\`python filename="测试"
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 定义函数 test_register_triggers_email，参数: client
def test_register_triggers_email(client):
    # 定义变量 response，赋值为 client.post("/register", json={"name": "alice...
    response = client.post("/register", json={"name": "alice", "email": "a@b.com", "password": "Str0ng!pw"})
    # assert response.status_code == 201
    assert response.status_code == 201
    # TestClient 会等所有后台任务执行完才返回
    # 所以这里可以断言任务已执行（如检查 mock 被调用）
    # 调用 mock_send_email.assert_called_once_with()
    mock_send_email.assert_called_once_with("a@b.com", "alice")
\`\`\`

> \`TestClient\` 默认会等待后台任务执行完才返回响应。这在测试里很方便——你能断言任务的副作用。但要注意测试里如果任务很慢会拖慢测试套件，必要时用 mock 替换真任务。

## 十、什么时候不该用 BackgroundTasks

\`\`\`txt filename="不适用场景"
❌ 任务必须完成（订单处理、支付）→ 用 Celery，有持久化和重试
❌ 任务很重（跑几分钟的报表）→ 占工作线程，用 Celery 独立 worker
❌ 需要定时调度（每天 3 点跑）→ 用 Celery Beat / APScheduler
❌ 多个服务要协调（分布式事务）→ 用消息队列 + Saga
❌ 部署时滚动更新会丢任务 → 重任务必须 Celery

✅ 适用场景：
   - 发邮件 / 发短信通知
   - 写访问日志、审计日志
   - 更新缓存、预热
   - 清理临时文件
   - 推送 webhook（丢了可重发）
\`\`\`

## 十一、易错点小结

| 易错点 | 现象 | 正确做法 |
|-------|------|----------|
| 用它跑必须完成的任务 | 进程重启任务丢失 | 用 Celery |
| 任务异常逃逸 | 客户端无感知，任务静默失败 | 内部 try/except + 日志 |
| 同步任务里阻塞调用 | 占线程池，影响其他请求 | 改异步或限制并发 |
| 异步任务里用阻塞 I/O | 卡事件循环 | 用异步库或 \`to_thread\` |
| 任务依赖请求上下文 | 请求结束上下文没了 | 任务参数自包含，别依赖 Request |
| 以为任务和响应并行 | 任务在响应后才执行 | 要并行就在请求里 await |
| 任务太多堆积 | 内存涨、响应后跑很久 | 限流或用队列 |
| 单测不等后台任务 | 断言失败 | TestClient 默认会等，或显式 mock |

## 十二、小结

BackgroundTasks 是 FastAPI 内置的轻量后台机制：响应先返回，任务在之后执行。零依赖、API 简单，适合发邮件、写日志、更新缓存等"轻量、可丢失"的任务。任务函数分同步（线程池跑）和异步（事件循环跑）两种，要和所用库匹配。务必在任务内部处理异常——响应已返回，异常传不到客户端。重任务、必须完成的任务请用 Celery。本章也是异步编程篇的收尾，下一章我们进入 WebSocket 实时通信的世界。
`
  },
];
