// =============================================================
// Python 从入门到精通大全（终极版）—— 第13批章节
// 第十三部分 异步编程 asyncio（共 5 章）
// =============================================================

const chapters = [
  {
    id: "py10-ch61",
    group: "第十三部分 异步编程 asyncio",
    icon: "🌊",
    title: "第六十一章 asyncio 入门",
    content: `

# 第六十一章 asyncio 入门

## 一、为什么需要异步编程

传统的同步程序在执行 I/O 操作（如网络请求、文件读写、数据库查询）时，整个线程会被阻塞，CPU 处于等待状态，造成资源浪费。异步编程允许程序在等待 I/O 完成时去做其他事情，从而极大提升并发性能。

asyncio 是 Python 3.4 引入的标准库，使用单线程协程（coroutine）实现并发。它特别适合 I/O 密集型任务，例如：

- 高并发 HTTP 爬虫
- 即时通讯服务器
- 数据库连接池
- 实时数据流处理

\`\`\`python
# 演示同步代码与异步代码在 I/O 等待上的差异
# 这里用 time.sleep 模拟"同步阻塞"，asyncio.sleep 模拟"异步非阻塞"
import time
import asyncio


# 同步版本：三个任务串行执行，总耗时约 3 秒
def sync_worker(name: str, seconds: float) -> None:
    # time.sleep 会霸占整个线程，期间无法做其他事
    # WHY: 同步阻塞调用让 CPU 空转等待，效率低下
    print(f"[同步] {name} 开始工作")
    time.sleep(seconds)
    print(f"[同步] {name} 完成工作")


def sync_main() -> None:
    start = time.perf_counter()
    sync_worker("A", 1.0)
    sync_worker("B", 1.0)
    sync_worker("C", 1.0)
    print(f"同步总耗时: {time.perf_counter() - start:.2f}s")


# 异步版本：三个任务并发执行，总耗时约 1 秒
async def async_worker(name: str, seconds: float) -> None:
    # await asyncio.sleep 会让出执行权给事件循环
    # WHY: 主动让出 CPU，事件循环可以调度其他协程，实现并发
    print(f"[异步] {name} 开始工作")
    await asyncio.sleep(seconds)
    print(f"[异步] {name} 完成工作")


async def async_main() -> None:
    start = time.perf_counter()
    # asyncio.gather 同时调度三个协程，它们并发运行
    await asyncio.gather(
        async_worker("A", 1.0),
        async_worker("B", 1.0),
        async_worker("C", 1.0),
    )
    print(f"异步总耗时: {time.perf_counter() - start:.2f}s")


# 先运行同步版本
sync_main()
# 再运行异步版本：asyncio.run 会创建事件循环并运行顶层协程
asyncio.run(async_main())

\`\`\`

## 二、协程与事件循环

协程（coroutine）是用 \`async def\` 定义的函数，调用它返回一个协程对象，必须由事件循环调度执行。事件循环（event loop）是 asyncio 的核心，负责在协程之间切换、监控 I/O 完成事件。

\`\`\`python
import asyncio


# async def 定义的就是协程函数
async def hello() -> str:
    # 直接调用 hello() 不会执行函数体，只返回协程对象
    # WHY: 协程需要事件循环驱动才能运行，这是协程的关键特性
    print("hello 协程开始")
    await asyncio.sleep(0.1)
    return "hello, asyncio"


# 观察协程对象的真面目
coro = hello()
print(f"协程对象: {coro}")          # <coroutine object hello at 0x...>
print(f"是否协程: {asyncio.iscoroutine(coro)}")  # True
print(f"已关闭: {coro.done()}")     # False（还没运行）

# 正确的运行方式：交给事件循环
result = asyncio.run(hello())
print(f"返回值: {result}")

# 也可以手动获取事件循环（兼容旧代码，新代码建议用 asyncio.run）
async def demo() -> None:
    print("在事件循环里运行")


# asyncio.run 是 Python 3.7+ 推荐的入口，它会：
# 1. 创建新的事件循环
# 2. 运行传入的协程直到完成
# 3. 关闭事件循环并清理资源
asyncio.run(demo())

\`\`\`

## 三、await 关键字

\`await\` 只能在 \`async def\` 函数内部使用，用于暂停当前协程，等待一个可等待对象（awaitable）完成。可等待对象包括：协程、Task、Future。

\`\`\`python
import asyncio


async def fetch_data(id_: int) -> dict:
    # 模拟网络请求
    # WHY: await 让出控制权，事件循环可以处理其他协程
    await asyncio.sleep(0.2)
    return {"id": id_, "data": f"payload-{id_}"}


async def process(id_: int) -> str:
    # 串行 await：每个 await 都会等待前一个完成
    data = await fetch_data(id_)
    await asyncio.sleep(0.1)
    return f"已处理 {data['id']}: {data['data']}"


async def main() -> None:
    # 串行执行：总耗时约 0.3 秒
    r1 = await process(1)
    r2 = await process(2)
    print(r1)
    print(r2)


asyncio.run(main())

\`\`\`

## 四、同步与异步对比

理解何时该用异步、何时不该用，是入门的关键。下表对比两种风格：

| 维度 | 同步代码 | 异步代码 |
|------|---------|---------|
| 阻塞 | 会阻塞线程 | 不阻塞线程 |
| 并发方式 | 多线程/多进程 | 单线程协程 |
| 适合场景 | CPU 密集 | I/O 密集 |
| 调试难度 | 简单 | 较复杂 |
| 库支持 | 几乎所有库 | 需 async 版本 |

\`\`\`python
import asyncio
import time


# CPU 密集型任务：异步帮不上忙
def cpu_heavy(n: int) -> int:
    # 纯计算无法 await，协程无法在计算时让出 CPU
    # WHY: 协程是协作式调度，必须主动 await 才能切换
    total = 0
    for i in range(n):
        total += i * i
    return total


# I/O 密集型任务：异步大显身手
async def io_task(name: str, delay: float) -> str:
    await asyncio.sleep(delay)
    return f"{name} 完成（耗时 {delay}s）"


async def benchmark_io() -> None:
    start = time.perf_counter()
    # 10 个 I/O 任务并发，总耗时约等于最慢的那个
    results = await asyncio.gather(*[io_task(f"任务{i}", 0.5) for i in range(10)])
    print(f"I/O 并发耗时: {time.perf_counter() - start:.2f}s")
    print(f"完成数量: {len(results)}")


asyncio.run(benchmark_io())

\`\`\`

## 五、协程的链式调用

协程可以调用其他协程，形成调用链。每层 await 都会传递控制权给事件循环。

\`\`\`python
import asyncio


async def step_one() -> str:
    await asyncio.sleep(0.1)
    return "步骤一完成"


async def step_two(prev: str) -> str:
    await asyncio.sleep(0.1)
    return f"{prev} -> 步骤二完成"


async def step_three(prev: str) -> str:
    await asyncio.sleep(0.1)
    return f"{prev} -> 步骤三完成"


async def pipeline() -> str:
    # 协程链式调用：每一步依赖前一步的结果
    r1 = await step_one()
    r2 = await step_two(r1)
    r3 = await step_three(r2)
    return r3


result = asyncio.run(pipeline())
print(result)

\`\`\`

## 六、协程取消与异常

协程可以被取消，也会抛出异常。正确处理这两者能让程序更健壮。

\`\`\`python
import asyncio


async def long_task() -> None:
    try:
        print("长任务启动")
        # shield 防止内部协程被外层取消立即终止
        # WHY: 某些关键操作不希望被打断，如数据库提交
        await asyncio.sleep(10)
        print("长任务完成")
    except asyncio.CancelledError:
        # 捕获取消异常，做清理工作
        print("长任务被取消，正在清理...")
        raise  # 推荐重新抛出，让调用方知道已被取消


async def main() -> None:
    task = asyncio.create_task(long_task())
    await asyncio.sleep(0.3)
    task.cancel()  # 发出取消信号
    try:
        await task
    except asyncio.CancelledError:
        print("主协程收到取消信号")


asyncio.run(main())

\`\`\`

## 七、asyncio.run 的细节

\`asyncio.run\` 是 Python 3.7+ 推荐的运行入口，它会做完整的事件循环生命周期管理。

\`\`\`python
import asyncio


async def check_loop() -> None:
    # 获取当前运行的事件循环
    # WHY: 很多 API 需要显式传入 loop，这里展示如何拿到它
    loop = asyncio.get_running_loop()
    print(f"事件循环: {loop}")
    print(f"是否运行中: {loop.is_running()}")
    print(f"当前任务: {asyncio.current_task()}")


# 注意：asyncio.run 不能在已有事件循环里调用
asyncio.run(check_loop())

# 如果想在已有循环里调度协程，用 create_task
async def parent() -> None:
    child = asyncio.create_task(check_loop())
    await child


asyncio.run(parent())

\`\`\`

## 小结

本章介绍了 asyncio 的基本概念：

- **协程**：\`async def\` 定义，必须由事件循环驱动
- **事件循环**：调度协程、监控 I/O 的核心
- **await**：暂停当前协程等待可等待对象
- **asyncio.run**：推荐的应用入口
- **适用场景**：I/O 密集型任务，CPU 密集型应使用多进程

掌握这些基础后，下一章我们将学习 Task 与并发，让协程真正并行起来。
`
  },
  {
    id: "py10-ch62",
    group: "第十三部分 异步编程 asyncio",
    icon: "📋",
    title: "第六十二章 Task 与并发",
    content: `

# 第六十二章 Task 与并发

## 一、Task 是什么

Task 是对协程的包装，让协程可以被事件循环独立调度。直接 \`await\` 一个协程是串行的，而用 \`asyncio.create_task\` 创建的 Task 会被立即调度，可以与其他任务并发执行。

\`\`\`python
import asyncio
import time


async def work(name: str, seconds: float) -> str:
    print(f"[{name}] 开始")
    await asyncio.sleep(seconds)
    print(f"[{name}] 结束")
    return f"{name}-ok"


async def serial_demo() -> None:
    # 串行：两次 await 累加耗时
    # WHY: await 会等当前协程完成才继续，无法并发
    start = time.perf_counter()
    await work("A", 0.5)
    await work("B", 0.5)
    print(f"串行耗时: {time.perf_counter() - start:.2f}s")


async def concurrent_demo() -> None:
    # 并发：两个任务同时调度，总耗时约 0.5s
    # WHY: create_task 立即把协程包装成 Task 投入调度
    start = time.perf_counter()
    t1 = asyncio.create_task(work("A", 0.5))
    t2 = asyncio.create_task(work("B", 0.5))
    await t1
    await t2
    print(f"并发耗时: {time.perf_counter() - start:.2f}s")


asyncio.run(serial_demo())
asyncio.run(concurrent_demo())

\`\`\`

## 二、asyncio.gather 批量并发

\`asyncio.gather\` 是最常用的批量并发工具，可以同时运行多个可等待对象，并按输入顺序返回结果列表。

\`\`\`python
import asyncio


async def fetch(url: str, delay: float) -> str:
    await asyncio.sleep(delay)
    return f"来自 {url} 的数据（{delay}s）"


async def main() -> None:
    # gather 接收多个协程，返回结果列表，顺序与输入一致
    # WHY: 即使后完成的协程先返回，gather 仍按输入顺序整理结果
    results = await asyncio.gather(
        fetch("url-A", 0.3),
        fetch("url-B", 0.1),
        fetch("url-C", 0.2),
    )
    for r in results:
        print(r)


asyncio.run(main())

\`\`\`

\`gather\` 的 \`return_exceptions\` 参数控制异常处理方式：

\`\`\`python
import asyncio


async def may_fail(name: str, fail: bool) -> str:
    await asyncio.sleep(0.1)
    if fail:
        raise ValueError(f"{name} 出错了")
    return f"{name} 成功"


async def main() -> None:
    # return_exceptions=True：异常作为结果返回，不中断其他任务
    # WHY: 批量抓取时希望个别失败不影响整体，便于事后统计
    results = await asyncio.gather(
        may_fail("A", False),
        may_fail("B", True),
        may_fail("C", False),
        return_exceptions=True,
    )
    for r in results:
        if isinstance(r, Exception):
            print(f"失败: {r}")
        else:
            print(f"成功: {r}")


asyncio.run(main())

\`\`\`

## 三、asyncio.wait 等待多任务

\`asyncio.wait\` 比 \`gather\` 更灵活，可以按"先完成"或"全部完成"模式等待，并返回两个集合。

\`\`\`python
import asyncio


async def task(name: str, delay: float) -> str:
    await asyncio.sleep(delay)
    return f"{name}@{delay}s"


async def main() -> None:
    # FIRST_COMPLETED：只要有任务完成就返回
    # WHY: 适合"哪个快用哪个"的场景，如多源竞速
    tasks = [
        asyncio.create_task(task("A", 0.3)),
        asyncio.create_task(task("B", 0.1)),
        asyncio.create_task(task("C", 0.2)),
    ]
    done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
    print(f"已完成: {[t.result() for t in done]}")
    # 取消还没完成的任务，避免资源泄漏
    for p in pending:
        p.cancel()
    # 等待被取消的任务真正结束
    await asyncio.gather(*pending, return_exceptions=True)


asyncio.run(main())

\`\`\`

## 四、asyncio.wait_for 超时控制

\`asyncio.wait_for\` 给协程/Task 设置超时，超时会抛出 \`asyncio.TimeoutError\`（3.11+ 是 \`TimeoutError\`）。

\`\`\`python
import asyncio


async def slow() -> str:
    await asyncio.sleep(5)
    return "终于完成了"


async def main() -> None:
    try:
        # 1 秒内必须完成，否则取消并抛 TimeoutError
        # WHY: 网络请求必须设超时，否则会无限等待拖垮服务
        result = await asyncio.wait_for(slow(), timeout=1.0)
        print(result)
    except asyncio.TimeoutError:
        print("任务超时被取消")


asyncio.run(main())

\`\`\`

## 五、asyncio.timeout 上下文管理器（3.11+）

Python 3.11 引入 \`asyncio.timeout\`，更优雅的超时控制方式，可以包裹任意异步代码块。

\`\`\`python
import asyncio


async def fetch_chunk(n: int) -> int:
    await asyncio.sleep(n * 0.3)
    return n * 10


async def main() -> None:
    # 用 with 语法限定超时范围，比 wait_for 更灵活
    # WHY: 一个超时可以覆盖多个 await，统一控制
    try:
        async with asyncio.timeout(0.5):
            r1 = await fetch_chunk(1)  # 0.3s
            print(f"第一段: {r1}")
            r2 = await fetch_chunk(2)  # 0.6s，累计 0.9s 超时
            print(f"第二段: {r2}")
    except TimeoutError:
        print("整体超时")


asyncio.run(main())

\`\`\`

## 六、asyncio.as_completed 按完成顺序处理

\`as_completed\` 返回一个迭代器，按"谁先完成谁先产出"的顺序返回 Future，适合实时展示进度。

\`\`\`python
import asyncio


async def job(i: int) -> int:
    await asyncio.sleep(1.0 - i * 0.1)  # 后面的任务反而更快完成
    return i


async def main() -> None:
    tasks = [asyncio.ensure_future(job(i)) for i in range(5)]
    # as_completed 按完成顺序产出，不是按提交顺序
    # WHY: 实时输出可用结果，提升用户体验
    for fut in asyncio.as_completed(tasks):
        result = await fut
        print(f"完成: {result}", flush=True)


asyncio.run(main())

\`\`\`

## 七、TaskGroup 任务组（3.11+）

\`TaskGroup\` 是 Python 3.11 引入的结构化并发 API，比 \`gather\` 更安全：任一任务异常会自动取消其他任务。

\`\`\`python
import asyncio


async def worker(name: str, delay: float) -> str:
    await asyncio.sleep(delay)
    if name == "B":
        raise RuntimeError("B 故意失败")
    return f"{name}-done"


async def main() -> None:
    # TaskGroup 保证：组内任务要么全部成功，要么一起被取消
    # WHY: 结构化并发避免任务泄漏，错误传播更清晰
    try:
        async with asyncio.TaskGroup() as tg:
            t1 = tg.create_task(worker("A", 0.2))
            t2 = tg.create_task(worker("B", 0.3))
            t3 = tg.create_task(worker("C", 0.4))
        # 退出 with 块时所有任务已完成
        print(t1.result())
        print(t3.result())
    except ExceptionGroup as eg:
        # TaskGroup 把子任务异常打包成 ExceptionGroup
        print(f"任务组异常: {eg.exceptions}")


asyncio.run(main())

\`\`\`

## 八、并发工具对比

| 工具 | 返回结果 | 异常处理 | 取消传播 | 适用场景 |
|------|---------|---------|---------|---------|
| create_task | 单个 | 抛出 | 手动 | 单任务调度 |
| gather | 列表（按顺序） | 可控 | 需手动 | 批量并发 |
| wait | 集合 | 不抛 | 灵活 | 部分完成 |
| wait_for | 单个 | TimeoutError | 自动 | 超时控制 |
| timeout | 上下文 | TimeoutError | 自动 | 代码块超时 |
| as_completed | 迭代 | 抛出 | 手动 | 进度展示 |
| TaskGroup | 单个 | ExceptionGroup | 自动 | 结构化并发 |

\`\`\`python
import asyncio


# 实战：批量抓取网页，带超时和异常隔离
async def fetch_one(url: str, timeout: float = 2.0) -> str:
    try:
        # 每个请求独立超时，互不影响
        # WHY: 个别慢请求不应拖累整体进度
        await asyncio.sleep(0.5)  # 模拟请求
        return f"OK: {url}"
    except asyncio.TimeoutError:
        return f"TIMEOUT: {url}"


async def fetch_all(urls: list[str]) -> list[str]:
    # return_exceptions=True 让单个失败不影响整体
    results = await asyncio.gather(
        *[fetch_one(u) for u in urls],
        return_exceptions=True,
    )
    return [r if not isinstance(r, Exception) else f"ERR: {r}" for r in results]


urls = [f"https://example.com/{i}" for i in range(5)]
print(asyncio.run(fetch_all(urls)))

\`\`\`

## 小结

本章介绍了 asyncio 的并发原语：

- **create_task**：把协程包装成可调度 Task
- **gather**：批量并发，按输入顺序返回结果
- **wait**：灵活等待，支持多种完成策略
- **wait_for / timeout**：超时控制
- **as_completed**：按完成顺序处理
- **TaskGroup**：结构化并发，自动管理取消

下一章我们将把异步用到真实网络 IO 上，编写客户端和服务器。
`
  },
  {
    id: "py10-ch63",
    group: "第十三部分 异步编程 asyncio",
    icon: "🌐",
    title: "第六十三章 异步 IO 与网络",
    content: `

# 第六十三章 异步 IO 与网络

## 一、asyncio.sleep 异步延时

\`asyncio.sleep\` 是异步版的 \`time.sleep\`，它不阻塞线程，而是让出控制权给事件循环。

\`\`\`python
import asyncio
import time


async def tick(name: str, interval: float, count: int) -> None:
    # asyncio.sleep 让出 CPU，其他协程可以运行
    # WHY: time.sleep 会阻塞整个事件循环，asyncio 中禁用
    for i in range(count):
        print(f"[{name}] 第 {i+1} 次")
        await asyncio.sleep(interval)


async def main() -> None:
    start = time.perf_counter()
    # 两个 tick 并发运行，互不阻塞
    await asyncio.gather(
        tick("A", 0.2, 3),
        tick("B", 0.3, 2),
    )
    print(f"总耗时: {time.perf_counter() - start:.2f}s")


asyncio.run(main())

\`\`\`

## 二、asyncio.open_connection TCP 客户端

\`asyncio.open_connection\` 建立异步 TCP 连接，返回 \`StreamReader\` 和 \`StreamWriter\`。

\`\`\`python
import asyncio


async def http_get(host: str, port: int, path: str) -> str:
    # open_connection 内部用非阻塞 socket，可同时管理多个连接
    # WHY: 同步 socket.connect 会阻塞线程，asyncio 版本不会
    reader, writer = await asyncio.open_connection(host, port)
    try:
        # 构造最简单的 HTTP/1.0 请求
        request = (
            f"GET {path} HTTP/1.0\\r\\n"
            f"Host: {host}\\r\\n"
            f"Connection: close\\r\\n"
            f"\\r\\n"
        )
        writer.write(request.encode())
        await writer.drain()  # 等待发送缓冲区刷新

        # 读取全部响应（HTTP/1.0 服务器会主动关闭连接）
        data = await reader.read()
        return data.decode("utf-8", errors="replace")
    finally:
        # 必须关闭，否则连接泄漏
        writer.close()
        await writer.wait_closed()


async def main() -> None:
    # 访问 example.com 首页
    try:
        resp = await asyncio.wait_for(
            http_get("example.com", 80, "/"),
            timeout=5.0,
        )
        # 只打印前 300 字符避免刷屏
        print(resp[:300])
    except (OSError, asyncio.TimeoutError) as e:
        print(f"请求失败（可能是离线环境）: {e}")


# 注意：沙箱可能无网络，运行失败属于正常现象
asyncio.run(main())

\`\`\`

## 三、asyncio.start_server TCP 服务器

\`asyncio.start_server\` 创建异步 TCP 服务器，每个连接由独立的协程处理。

\`\`\`python
import asyncio


async def handle_client(reader: asyncio.StreamReader, writer: asyncio.StreamWriter) -> None:
    # 每个客户端连接都会调用一次这个协程
    # WHY: 异步服务器用协程而非线程处理连接，可承载更多并发
    peer = writer.get_extra_info("peername")
    print(f"[服务器] 新连接: {peer}")
    try:
        while True:
            data = await reader.read(1024)
            if not data:
                # 客户端关闭连接
                break
            text = data.decode().strip()
            print(f"[服务器] 收到: {text}")
            # 回显 + 大写
            response = f"ECHO: {text.upper()}\\n"
            writer.write(response.encode())
            await writer.drain()
    except ConnectionResetError:
        pass
    finally:
        writer.close()
        await writer.wait_closed()
        print(f"[服务器] 连接关闭: {peer}")


async def main() -> None:
    # 在随机端口启动服务器，仅本机访问
    server = await asyncio.start_server(handle_client, "127.0.0.1", 0)
    addr = server.sockets[0].getsockname()
    print(f"[服务器] 监听 {addr}")

    # 演示：客户端连接测试
    async def client() -> None:
        reader, writer = await asyncio.open_connection(*addr)
        writer.write(b"hello\\n")
        await writer.drain()
        resp = await reader.read(1024)
        print(f"[客户端] 收到: {resp.decode().strip()}")
        writer.close()
        await writer.wait_closed()

    # 启动服务器后立即跑一个客户端测试
    async with server:
        await asyncio.gather(
            server.serve_forever(),
            client(),
            return_exceptions=True,
        )


# 用超时保护，避免服务器一直运行
try:
    asyncio.run(asyncio.wait_for(main(), timeout=3.0))
except asyncio.TimeoutError:
    print("[演示] 超时退出")

\`\`\`

## 四、Stream API 详解

\`StreamReader\` 提供多种读取方法，适用于不同协议：

\`\`\`python
import asyncio


async def demo_reader() -> None:
    reader, writer = await asyncio.open_connection("127.0.0.1", 0) if False else (None, None)
    # 上面只是占位，下面展示 StreamReader 的常用方法（伪代码）
    # read(n)        读最多 n 字节
    # readexactly(n) 恰好读 n 字节，不够抛 IncompleteReadError
    # readline()     读到 \\n 为止
    # readuntil(b)   读到分隔符 b
    # read()         读到 EOF
    #
    # WHY: 不同协议有不同分隔方式，readline 适合文本协议，
    # readexactly 适合固定长度二进制协议


async def main() -> None:
    # 实战：自己实现一个简单的"行协议"客户端
    # 服务端用 start_server 演示
    async def echo_handler(reader, writer):
        # readline 按 \\n 分隔，非常适合行协议
        while line := await reader.readline():
            writer.write(line.upper())
            await writer.drain()
        writer.close()
        await writer.wait_closed()

    server = await asyncio.start_server(echo_handler, "127.0.0.1", 0)
    addr = server.sockets[0].getsockname()

    async def client():
        r, w = await asyncio.open_connection(*addr)
        # 发送多行
        w.write(b"apple\\nbanana\\ncherry\\n")
        await w.drain()
        w.write_eof()  # 通知服务端写完了
        # 逐行读取响应
        while line := await r.readline():
            print(f"收到: {line.decode().strip()}")
        w.close()
        await w.wait_closed()

    async with server:
        server_task = asyncio.create_task(server.serve_forever())
        await client()
        server_task.cancel()


asyncio.run(asyncio.wait_for(main(), timeout=3.0))

\`\`\`

## 五、并发抓取多个 URL

把前面学到的 \`gather\` + \`open_connection\` 组合起来，实现并发 HTTP 抓取。

\`\`\`python
import asyncio
import time


async def fetch_http(host: str, port: int = 80, path: str = "/") -> tuple[str, int]:
    try:
        reader, writer = await asyncio.wait_for(
            asyncio.open_connection(host, port),
            timeout=3.0,
        )
    except (OSError, asyncio.TimeoutError) as e:
        return host, -1
    try:
        req = f"GET {path} HTTP/1.0\\r\\nHost: {host}\\r\\n\\r\\n"
        writer.write(req.encode())
        await writer.drain()
        data = await asyncio.wait_for(reader.read(), timeout=5.0)
        return host, len(data)
    except (OSError, asyncio.TimeoutError):
        return host, -2
    finally:
        writer.close()
        try:
            await writer.wait_closed()
        except Exception:
            pass


async def main() -> None:
    hosts = ["example.com", "www.example.com", "www.iana.org"]
    start = time.perf_counter()
    # 并发抓取三个站点
    results = await asyncio.gather(*[fetch_http(h) for h in hosts])
    elapsed = time.perf_counter() - start
    for host, size in results:
        status = f"{size} 字节" if size > 0 else "失败"
        print(f"{host}: {status}")
    print(f"总耗时: {elapsed:.2f}s")


asyncio.run(main())

\`\`\`

## 六、aiohttp 概念说明

\`aiohttp\` 是第三方库，提供更高级的异步 HTTP 客户端/服务器，比手写 socket 方便得多。虽然沙箱只有标准库，但概念必须了解。

\`\`\`python
# 以下代码仅作概念演示，需要 pip install aiohttp 才能运行
# 在沙箱中无法运行，仅供参考

# import aiohttp
# import asyncio
#
# async def fetch(session, url):
#     async with session.get(url) as resp:
#         return await resp.text()
#
# async def main():
#     async with aiohttp.ClientSession() as session:
#         html = await fetch(session, "https://example.com")
#         print(html[:100])
#
# asyncio.run(main())

# 为什么需要 aiohttp？
# 1. 标准库 urllib 是同步的，会阻塞事件循环
# 2. aiohttp 提供连接池、cookie、重定向等高级功能
# 3. 它同时是 HTTP 服务器框架
#
# WHY: 异步生态需要"全链路异步"，一个同步调用就会让并发优势归零

# 用标准库模拟"伪异步"抓取（仍然阻塞，仅作对比）
import asyncio
import urllib.request


async def fake_async_fetch(url: str) -> str:
    # 警告：urllib 是同步阻塞的，会卡住事件循环！
    # 这里用 run_in_executor 委托给线程池，避免阻塞
    # WHY: 必须用 asyncio.to_thread/run_in_executor 包装同步 IO
    return await asyncio.to_thread(lambda: urllib.request.urlopen(url).read().decode()[:80])


async def main() -> None:
    try:
        result = await asyncio.wait_for(fake_async_fetch("https://example.com"), timeout=5)
        print(result)
    except Exception as e:
        print(f"网络不可用: {e}")


asyncio.run(main())

\`\`\`

## 七、UDP 异步 socket

asyncio 也支持 UDP，通过 \`loop.create_datagram_endpoint\`。

\`\`\`python
import asyncio


class UDPEchoProtocol(asyncio.DatagramProtocol):
    # UDP 协议类，需要实现 connection_made / datagram_received
    # WHY: UDP 无连接，用协议类回调比流式 API 更合适
    def connection_made(self, transport):
        self.transport = transport

    def datagram_received(self, data, addr):
        print(f"[UDP 收到] {addr}: {data.decode()}")
        self.transport.sendto(data, addr)  # 回显


async def main() -> None:
    loop = asyncio.get_running_loop()
    transport, protocol = await loop.create_datagram_endpoint(
        UDPEchoProtocol,
        local_addr=("127.0.0.1", 0),
    )
    addr = transport.get_extra_info("sockname")
    print(f"[UDP 服务器] 监听 {addr}")

    # 创建一个临时客户端 socket 发送数据
    sock_transport, _ = await loop.create_datagram_endpoint(
        lambda: asyncio.DatagramProtocol(),
        remote_addr=addr,
    )
    sock_transport.sendto(b"hello udp")
    await asyncio.sleep(0.2)
    sock_transport.close()
    transport.close()


try:
    asyncio.run(asyncio.wait_for(main(), timeout=2.0))
except asyncio.TimeoutError:
    print("[UDP 演示] 完成")

\`\`\`

## 小结

本章介绍了 asyncio 网络编程：

- **asyncio.sleep**：非阻塞延时，事件循环的基础
- **open_connection**：异步 TCP 客户端
- **start_server**：异步 TCP 服务器
- **Stream API**：readline/readexactly 等灵活读取
- **aiohttp 概念**：生产级异步 HTTP 库
- **UDP 支持**：通过协议类回调

下一章我们学习异步同步原语，让多个协程安全协作。
`
  },
  {
    id: "py10-ch64",
    group: "第十三部分 异步编程 asyncio",
    icon: "🔒",
    title: "第六十四章 异步同步原语",
    content: `

# 第六十四章 异步同步原语

## 一、为什么需要异步同步原语

虽然 asyncio 是单线程的，不存在数据竞争，但协程之间仍需要协调：临界区互斥、信号通知、限流、生产消费。asyncio 提供了与 \`threading\` 同名但语义不同的同步原语，全部是"async 友好"的——它们 \`await\` 而不是阻塞线程。

\`\`\`python
import asyncio


# 反例：协程交错执行导致逻辑错误
async def unsafe_increment(counter: list, name: str) -> None:
    # 即使单线程，await 之间也可能被其他协程插入
    # WHY: 协程在 await 处会切换，共享状态可能被改坏
    cur = counter[0]
    await asyncio.sleep(0.001)  # 模拟 IO，这里会切换
    counter[0] = cur + 1
    print(f"{name}: {counter[0]}")


async def main() -> None:
    counter = [0]
    await asyncio.gather(*[unsafe_increment(counter, f"T{i}") for i in range(5)])
    print(f"最终值: {counter[0]}（应该为 5，实际可能更小）")


asyncio.run(main())

\`\`\`

## 二、asyncio.Lock 互斥锁

\`asyncio.Lock\` 保护临界区，确保同一时刻只有一个协程进入。与 \`threading.Lock\` 不同，它用 \`async with\` 获取。

\`\`\`python
import asyncio


async def safe_increment(counter: list, lock: asyncio.Lock, name: str) -> None:
    # async with lock 保证临界区原子性
    # WHY: 锁内的 await 不会被其他协程插入，避免竞态
    async with lock:
        cur = counter[0]
        await asyncio.sleep(0.001)
        counter[0] = cur + 1
        print(f"{name}: {counter[0]}")


async def main() -> None:
    counter = [0]
    lock = asyncio.Lock()
    await asyncio.gather(*[safe_increment(counter, lock, f"T{i}") for i in range(5)])
    print(f"最终值: {counter[0]}（应为 5）")


asyncio.run(main())

\`\`\`

锁的非上下文用法：

\`\`\`python
import asyncio


async def worker(lock: asyncio.Lock, name: str) -> None:
    # 手动 acquire / release，必须配对，否则死锁
    # WHY: 推荐用 async with，自动处理异常时的释放
    await lock.acquire()
    try:
        print(f"{name} 获得锁")
        await asyncio.sleep(0.1)
    finally:
        lock.release()
        print(f"{name} 释放锁")


async def main() -> None:
    lock = asyncio.Lock()
    await asyncio.gather(worker(lock, "A"), worker(lock, "B"))


asyncio.run(main())

\`\`\`

## 三、asyncio.Event 事件通知

\`asyncio.Event\` 用于"等待某个条件成立"。一个协程 \`set\`，所有 \`wait\` 的协程都会被唤醒。

\`\`\`python
import asyncio


async def waiter(event: asyncio.Event, name: str) -> None:
    print(f"{name} 等待事件")
    await event.wait()  # 阻塞直到 event.set()
    print(f"{name} 收到事件，开始干活")


async def setter(event: asyncio.Event) -> None:
    await asyncio.sleep(0.5)
    print("setter 触发事件")
    event.set()  # 唤醒所有等待者


async def main() -> None:
    event = asyncio.Event()
    await asyncio.gather(
        waiter(event, "W1"),
        waiter(event, "W2"),
        setter(event),
    )


asyncio.run(main())

\`\`\`

## 四、asyncio.Condition 条件变量

\`Condition\` 结合了锁和事件，可以"等待某个谓词成立"。生产者-消费者模式常用。

\`\`\`python
import asyncio


async def consumer(cond: asyncio.Condition, queue: list, name: str) -> None:
    async with cond:
        # 等待条件满足：队列非空
        # WHY: wait_for 自动处理锁的释放和重新获取
        await cond.wait_for(lambda: len(queue) > 0)
        item = queue.pop(0)
        print(f"{name} 消费: {item}")


async def producer(cond: asyncio.Condition, queue: list) -> None:
    await asyncio.sleep(0.3)
    async with cond:
        queue.append("商品-A")
        # notify_all 唤醒所有等待者
        cond.notify_all()
        print("生产者放入商品并通知")


async def main() -> None:
    cond = asyncio.Condition()
    queue = []
    await asyncio.gather(
        consumer(cond, queue, "C1"),
        consumer(cond, queue, "C2"),
        producer(cond, queue),
    )


asyncio.run(main())

\`\`\`

## 五、asyncio.Semaphore 信号量限流

\`Semaphore\` 限制同时进入的协程数量，常用于并发限流（如限制爬虫并发数）。

\`\`\`python
import asyncio
import time


async def fetch(sem: asyncio.Semaphore, url: str) -> str:
    # 信号量限制并发，防止压垮目标服务器
    # WHY: 信号量是限流最简单有效的工具
    async with sem:
        print(f"开始抓取 {url}")
        await asyncio.sleep(0.5)
        return f"OK-{url}"


async def main() -> None:
    sem = asyncio.Semaphore(3)  # 最多 3 个并发
    urls = [f"url-{i}" for i in range(10)]
    start = time.perf_counter()
    # 10 个请求分批，每批 3 个，约需 2 秒
    results = await asyncio.gather(*[fetch(sem, u) for u in urls])
    print(f"完成 {len(results)} 个，耗时 {time.perf_counter() - start:.2f}s")


asyncio.run(main())

\`\`\`

## 六、asyncio.Queue 异步队列

\`asyncio.Queue\` 是生产者-消费者的核心，支持 \`get\` / \`put\` 异步操作，有最大容量限制。

\`\`\`python
import asyncio
import random


async def producer(queue: asyncio.Queue, name: str) -> None:
    for i in range(3):
        item = f"{name}-{i}"
        # put 在队列满时会等待
        # WHY: 队列容量限制能自动反压，防止生产过快
        await queue.put(item)
        print(f"[生产] {item}")
        await asyncio.sleep(random.uniform(0.1, 0.3))
    # 放入哨兵值表示结束
    await queue.put(None)


async def consumer(queue: asyncio.Queue, name: str) -> None:
    while True:
        item = await queue.get()
        if item is None:
            # 把哨兵传给下一个消费者
            await queue.put(None)
            break
        print(f"[消费-{name}] {item}")
        await asyncio.sleep(random.uniform(0.1, 0.3))
        queue.task_done()


async def main() -> None:
    queue: asyncio.Queue = asyncio.Queue(maxsize=5)
    await asyncio.gather(
        producer(queue, "P1"),
        producer(queue, "P2"),
        consumer(queue, "C1"),
        consumer(queue, "C2"),
    )


asyncio.run(main())

\`\`\`

## 七、asyncio.Barrier 屏障（3.11+）

\`asyncio.Barrier\` 让多个协程在某个点同步等待，凑齐 N 个才一起放行。

\`\`\`python
import asyncio


async def runner(barrier: asyncio.Barrier, name: str) -> None:
    print(f"{name} 开始跑")
    await asyncio.sleep(asyncio.get_event_loop().time() % 1)
    print(f"{name} 到达屏障")
    # 所有协程都到这一步才会一起继续
    # WHY: 多阶段流水线场景需要屏障同步
    await barrier.wait()
    print(f"{name} 冲过终点")


async def main() -> None:
    barrier = asyncio.Barrier(3)
    await asyncio.gather(*[runner(barrier, f"R{i}") for i in range(3)])


asyncio.run(main())

\`\`\`

## 八、异步上下文管理器

自定义异步上下文管理器，用 \`__aenter__\` / \`__aexit__\`，常用于资源管理。

\`\`\`python
import asyncio


class AsyncDB:
    """模拟异步数据库连接"""

    def __init__(self, dsn: str):
        self.dsn = dsn
        self.connected = False

    async def __aenter__(self):
        # async with 进入时调用，可包含 await
        # WHY: 资源获取往往涉及 IO，必须用 async 方法
        print(f"连接数据库: {self.dsn}")
        await asyncio.sleep(0.1)
        self.connected = True
        return self

    async def __aexit__(self, exc_type, exc, tb):
        # 退出时调用，做清理
        print("关闭数据库连接")
        await asyncio.sleep(0.05)
        self.connected = False

    async def query(self, sql: str) -> str:
        if not self.connected:
            raise RuntimeError("未连接")
        await asyncio.sleep(0.1)
        return f"结果: {sql}"


async def main() -> None:
    async with AsyncDB("postgres://localhost") as db:
        result = await db.query("SELECT 1")
        print(result)
    # 离开 with 块后自动关闭


asyncio.run(main())

\`\`\`

## 九、与 threading 原语对比

| 特性 | threading | asyncio |
|------|-----------|---------|
| 锁 | Lock（阻塞） | Lock（async） |
| 事件 | Event | Event |
| 条件 | Condition | Condition |
| 信号量 | Semaphore | Semaphore |
| 队列 | Queue | Queue |
| 调用方式 | 阻塞线程 | await 协程 |
| 跨线程 | 安全 | 仅同事件循环 |

\`\`\`python
import asyncio
import threading
import time


# 实战：异步队列 + 多消费者模型
async def worker(queue: asyncio.Queue, name: str, stop_event: asyncio.Event) -> int:
    processed = 0
    while not stop_event.is_set() or not queue.empty():
        try:
            # wait_for 避免永远阻塞在 get
            item = await asyncio.wait_for(queue.get(), timeout=0.1)
            print(f"[{name}] 处理 {item}")
            processed += 1
            queue.task_done()
        except asyncio.TimeoutError:
            continue
    return processed


async def main() -> None:
    queue: asyncio.Queue = asyncio.Queue()
    stop = asyncio.Event()
    # 投入任务
    for i in range(8):
        await queue.put(f"任务-{i}")
    # 启动 3 个 worker
    workers = [asyncio.create_task(worker(queue, f"W{i}", stop)) for i in range(3)]
    # 等队列处理完
    await queue.join()
    stop.set()
    results = await asyncio.gather(*workers)
    print(f"各 worker 处理数: {results}")


asyncio.run(main())

\`\`\`

## 小结

本章介绍了 asyncio 的同步原语：

- **Lock**：保护临界区，避免协程交错竞态
- **Event**：一次性事件通知
- **Condition**：谓词等待，生产消费协作
- **Semaphore**：并发限流
- **Queue**：异步队列，生产消费解耦
- **Barrier**：多协程同步点
- **异步上下文管理器**：资源管理

下一章我们进入 asyncio 进阶，学习与线程/进程混合、异步生成器、调试技巧。
`
  },
  {
    id: "py10-ch65",
    group: "第十三部分 异步编程 asyncio",
    icon: "🚀",
    title: "第六十五章 asyncio 进阶与实战",
    content: `

# 第六十五章 asyncio 进阶与实战

## 一、run_in_executor 混合线程与进程

asyncio 单线程协程无法利用多核 CPU，也无法处理阻塞调用。\`run_in_executor\` 把阻塞任务委托给线程池或进程池，让 asyncio 与传统并发模型共存。

\`\`\`python
import asyncio
import time
import concurrent.futures


# 一个 CPU 密集型函数（无法 await）
def cpu_heavy(n: int) -> int:
    # 纯计算，会阻塞事件循环
    # WHY: 必须丢给线程/进程池，否则卡死整个事件循环
    total = 0
    for i in range(n):
        total += i * i % 7
    return total


async def main() -> None:
    loop = asyncio.get_running_loop()

    # 方式1：使用默认线程池（适合 IO 阻塞调用）
    # WHY: 线程池适合 urllib、requests 等同步 IO 库
    start = time.perf_counter()
    r1 = await loop.run_in_executor(None, cpu_heavy, 2_000_000)
    print(f"线程池结果: {r1}, 耗时 {time.perf_counter() - start:.2f}s")

    # 方式2：使用进程池（适合 CPU 密集，真正并行）
    # WHY: GIL 让多线程无法真正并行计算，多进程才能用多核
    with concurrent.futures.ProcessPoolExecutor(max_workers=2) as pool:
        start = time.perf_counter()
        # 并行跑两个 CPU 任务
        tasks = [
            loop.run_in_executor(pool, cpu_heavy, 2_000_000),
            loop.run_in_executor(pool, cpu_heavy, 2_000_000),
        ]
        results = await asyncio.gather(*tasks)
        print(f"进程池结果: {results}, 耗时 {time.perf_counter() - start:.2f}s")


asyncio.run(main())

\`\`\`

Python 3.9+ 推荐用更简洁的 \`asyncio.to_thread\`：

\`\`\`python
import asyncio
import time


def blocking_io(seconds: float) -> str:
    # 模拟同步阻塞调用，如 requests.get
    # WHY: to_thread 是 run_in_executor(线程池) 的语法糖
    time.sleep(seconds)
    return f"完成 {seconds}s"


async def main() -> None:
    start = time.perf_counter()
    # 两个阻塞调用并发执行（线程池让出 GIL）
    results = await asyncio.gather(
        asyncio.to_thread(blocking_io, 0.5),
        asyncio.to_thread(blocking_io, 0.5),
    )
    print(f"结果: {results}, 总耗时 {time.perf_counter() - start:.2f}s")


asyncio.run(main())

\`\`\`

## 二、异步生成器

\`async def\` 配合 \`yield\` 定义异步生成器，可以异步产出数据流，适合处理流式数据。

\`\`\`python
import asyncio


async def async_range(start: int, stop: int, step: float = 1.0):
    # async generator：异步产出一个序列
    # WHY: 流式数据（如传感器读数、日志流）适合用异步生成器
    i = start
    while i < stop:
        await asyncio.sleep(0.1)  # 模拟异步获取
        yield i
        i += step


async def main() -> None:
    # async for 消费异步生成器
    async for value in async_range(0, 5, 1):
        print(f"收到: {value}")


asyncio.run(main())

\`\`\`

实战：模拟异步读取日志流

\`\`\`python
import asyncio
import random


async def log_stream():
    # 模拟从远程日志服务异步读取
    # WHY: 真实场景如 tail -f 文件、Kafka 流消费都用异步生成器
    for i in range(5):
        await asyncio.sleep(random.uniform(0.05, 0.2))
        yield f"[{i}] log line at {random.randint(100, 999)}ms"


async def monitor():
    async for line in log_stream():
        # 收到一行就处理一行，无需等待全部
        print(f"监控: {line}")


asyncio.run(monitor())

\`\`\`

## 三、异步推导式

Python 3.6+ 支持异步推导式，可以简洁地把异步可迭代对象收集成列表、集合、字典。

\`\`\`python
import asyncio


async def async_range(n: int):
    for i in range(n):
        await asyncio.sleep(0.05)
        yield i


async def main() -> None:
    # 异步列表推导式
    # WHY: 比显式 async for 循环更简洁，适合简单收集场景
    squares = [x async for x in async_range(5)]
    print(f"列表: {squares}")

    # 异步集合推导式
    unique = {x % 3 async for x in async_range(7)}
    print(f"集合: {unique}")

    # 异步字典推导式
    mapping = {x: x * x async for x in async_range(4)}
    print(f"字典: {mapping}")

    # 带 if 过滤
    evens = [x async for x in async_range(10) if x % 2 == 0]
    print(f"偶数: {evens}")


asyncio.run(main())

\`\`\`

## 四、asyncio 调试模式

Python 提供多种调试手段，发现"协程没 await"、"阻塞调用过长"等问题。

\`\`\`python
import asyncio
import time


# 方式1：通过环境变量 PYTHONASYNCIODEBUG=1 开启
# 方式2：通过 loop.slow_callback_duration 设置慢回调阈值
async def main() -> None:
    loop = asyncio.get_running_loop()
    # 设置慢回调阈值，超过 0.1 秒会告警
    # WHY: 协程里如果有同步阻塞，会拖慢事件循环调度
    loop.slow_callback_duration = 0.1

    async def good():
        await asyncio.sleep(0.05)
        print("好的协程")

    async def bad():
        # 同步 sleep 会触发慢回调告警
        time.sleep(0.2)
        print("坏的协程（阻塞了）")

    await good()
    # 在调试模式下，bad 会打印告警日志
    # 这里只是演示，生产环境请用 logger 捕获


asyncio.run(main())

\`\`\`

常用调试技巧：

\`\`\`python
import asyncio


async def main() -> None:
    loop = asyncio.get_running_loop()
    # 打印当前所有任务
    # WHY: 怀疑任务泄漏时，列出所有 Task 排查
    async def leaky():
        await asyncio.sleep(10)

    # 故意创建一个不 await 的任务
    task = asyncio.create_task(leaky())
    # 短暂等待
    await asyncio.sleep(0.01)

    all_tasks = asyncio.all_tasks(loop)
    print(f"当前任务数: {len(all_tasks)}")
    for t in all_tasks:
        print(f"  - {t.get_name()}: {t.get_coro()}")

    task.cancel()
    await asyncio.gather(task, return_exceptions=True)


asyncio.run(main())

\`\`\`

## 五、常见陷阱

\`\`\`python
import asyncio
import time


# 陷阱1：忘记 await
async def trap1() -> None:
    # coro = asyncio.sleep(1)  # 没 await，协程根本没运行
    # WHY: Python 3.8+ 会发 RuntimeWarning: coroutine was never awaited
    print("陷阱1：永远记得 await 协程")


# 陷阱2：在协程里用同步阻塞调用
async def trap2() -> None:
    # time.sleep(1)  # 阻塞整个事件循环！
    # WHY: 同步阻塞让所有协程都卡住，必须用 asyncio.sleep 或 to_thread
    await asyncio.sleep(1)


# 陷阱3：直接 await 协程而不是 create_task，导致串行
async def fetch(x: int) -> int:
    await asyncio.sleep(0.1)
    return x * 2


async def trap3_bad() -> None:
    # 这种写法是串行的
    start = time.perf_counter()
    r1 = await fetch(1)  # 等 0.1s
    r2 = await fetch(2)  # 再等 0.1s
    print(f"串行: {r1}, {r2}, 耗时 {time.perf_counter() - start:.2f}s")


async def trap3_good() -> None:
    # 这种写法才是并发
    start = time.perf_counter()
    r1, r2 = await asyncio.gather(fetch(1), fetch(2))
    print(f"并发: {r1}, {r2}, 耗时 {time.perf_counter() - start:.2f}s")


async def main() -> None:
    await trap1()
    await trap2()
    await trap3_bad()
    await trap3_good()


asyncio.run(main())

\`\`\`

## 六、实战模式：异步缓存

\`\`\`python
import asyncio
import time
from functools import wraps


def async_cache(ttl: float = 60.0):
    """异步缓存装饰器，带 TTL 过期"""
    # WHY: 高频 IO 调用加缓存可大幅降低延迟
    cache: dict = {}
    locks: dict = {}

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            key = (args, tuple(sorted(kwargs.items())))
            now = time.time()
            # 命中且未过期
            if key in cache:
                value, expire_at = cache[key]
                if now < expire_at:
                    return value
            # 同 key 并发请求合并（防止缓存击穿）
            if key not in locks:
                locks[key] = asyncio.Lock()
            async with locks[key]:
                # 双重检查
                if key in cache:
                    value, expire_at = cache[key]
                    if now < expire_at:
                        return value
                value = await func(*args, **kwargs)
                cache[key] = (value, now + ttl)
                return value
        return wrapper
    return decorator


@async_cache(ttl=1.0)
async def fetch_user(user_id: int) -> dict:
    await asyncio.sleep(0.3)  # 模拟数据库查询
    return {"id": user_id, "name": f"用户{user_id}"}


async def main() -> None:
    start = time.perf_counter()
    # 第一次：未命中，0.3s
    r1 = await fetch_user(1)
    # 第二次：命中缓存，瞬间返回
    r2 = await fetch_user(1)
    elapsed = time.perf_counter() - start
    print(f"{r1}, {r2}, 耗时 {elapsed:.2f}s（应约 0.3s）")

    # 等 TTL 过期
    await asyncio.sleep(1.1)
    start = time.perf_counter()
    r3 = await fetch_user(1)  # 重新查询
    print(f"过期后重新查询，耗时 {time.perf_counter() - start:.2f}s")


asyncio.run(main())

\`\`\`

## 七、实战模式：异步重试

\`\`\`python
import asyncio
import random


async def unreliable_api() -> str:
    # 模拟 70% 概率失败
    # WHY: 网络服务不稳定，重试是必备容错手段
    if random.random() < 0.7:
        raise ConnectionError("服务暂时不可用")
    return "OK"


async def retry(coro_factory, attempts: int = 5, delay: float = 0.2):
    """通用重试包装器"""
    last_exc = None
    for i in range(attempts):
        try:
            return await coro_factory()
        except Exception as e:
            last_exc = e
            print(f"第 {i+1} 次失败: {e}")
            # 指数退避，避免压垮服务
            await asyncio.sleep(delay * (2 ** i))
    raise last_exc


async def main() -> None:
    try:
        result = await retry(unreliable_api, attempts=6, delay=0.1)
        print(f"最终成功: {result}")
    except Exception as e:
        print(f"彻底失败: {e}")


asyncio.run(main())

\`\`\`

## 八、实战模式：限速器

\`\`\`python
import asyncio
import time


class AsyncRateLimiter:
    """令牌桶限速器：每秒最多 N 个请求"""

    def __init__(self, rate: float):
        self.rate = rate  # 每秒令牌数
        self.tokens = rate
        self.last_refill = time.monotonic()
        self.lock = asyncio.Lock()

    async def acquire(self) -> None:
        async with self.lock:
            now = time.monotonic()
            # 按时间差补充令牌
            # WHY: 令牌桶允许短暂突发，比固定窗口更平滑
            elapsed = now - self.last_refill
            self.tokens = min(self.rate, self.tokens + elapsed * self.rate)
            self.last_refill = now
            if self.tokens < 1:
                # 等待补齐 1 个令牌
                wait = (1 - self.tokens) / self.rate
                await asyncio.sleep(wait)
                self.tokens = 0
            else:
                self.tokens -= 1


async def worker(limiter: AsyncRateLimiter, i: int) -> None:
    await limiter.acquire()
    print(f"[{time.monotonic():.2f}] 请求 {i} 放行")


async def main() -> None:
    limiter = AsyncRateLimiter(rate=5)  # 每秒 5 个
    start = time.monotonic()
    await asyncio.gather(*[worker(limiter, i) for i in range(10)])
    print(f"10 个请求耗时 {time.monotonic() - start:.2f}s（应约 2s）")


asyncio.run(main())

\`\`\`

## 九、综合实战：异步任务调度器

\`\`\`python
import asyncio
import time
from dataclasses import dataclass, field


@dataclass
class Job:
    name: str
    coro_factory: callable
    delay: float = 0.0
    retries: int = 1


async def run_job(job: Job) -> str:
    """执行单个任务，带重试和延迟"""
    if job.delay:
        await asyncio.sleep(job.delay)
    last_exc = None
    for attempt in range(job.retries):
        try:
            result = await job.coro_factory()
            return f"{job.name}: {result}"
        except Exception as e:
            last_exc = e
            await asyncio.sleep(0.1 * attempt)
    return f"{job.name}: FAILED ({last_exc})"


async def scheduler(jobs: list[Job], concurrency: int = 3) -> list[str]:
    """并发调度器，限制最大并发数"""
    # WHY: 信号量 + as_completed 实现可控并发
    sem = asyncio.Semaphore(concurrency)
    results: list[str] = []

    async def guarded(job: Job) -> str:
        async with sem:
            return await run_job(job)

    tasks = [asyncio.create_task(guarded(j)) for j in jobs]
    for fut in asyncio.as_completed(tasks):
        result = await fut
        print(result)
        results.append(result)
    return results


async def mock_work(name: str, t: float) -> str:
    await asyncio.sleep(t)
    return f"完成({t}s)"


async def main() -> None:
    jobs = [
        Job("任务1", lambda: mock_work("A", 0.3)),
        Job("任务2", lambda: mock_work("B", 0.5)),
        Job("任务3", lambda: mock_work("C", 0.2)),
        Job("任务4", lambda: mock_work("D", 0.4)),
        Job("任务5", lambda: mock_work("E", 0.1)),
    ]
    start = time.perf_counter()
    await scheduler(jobs, concurrency=2)
    print(f"总耗时 {time.perf_counter() - start:.2f}s")


asyncio.run(main())

\`\`\`

## 小结

本章是 asyncio 进阶与实战：

- **run_in_executor / to_thread**：与线程/进程混合
- **异步生成器**：流式数据处理
- **异步推导式**：简洁收集异步迭代结果
- **调试模式**：slow_callback_duration、all_tasks
- **常见陷阱**：忘 await、同步阻塞、串行 await
- **实战模式**：缓存、重试、限速、调度器

到这里 asyncio 部分就结束了。异步编程是 Python 高并发的核心武器，但学习曲线陡峭，建议多写实战项目巩固。下一部分我们进入网络与数据库。
`
  }
];

export { chapters };
