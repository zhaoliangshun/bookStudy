// =============================================================
// Python asyncio 教程 V2（pyasync2）—— 第五批章节
// -------------------------------------------------------------
// 实战项目（20-24章）
//   第 20 章：实战 —— 异步爬虫数据采集
//   第 21 章：实战 —— 异步 Web 服务端
//   第 22 章：实战 —— 生产者-消费者队列
//   第 23 章：实战 —— 并发下载器与限速
//   第 24 章：asyncio 调试、性能优化与最佳实践
// =============================================================

export const chapters = [
  // =========================================================
  // 第二十章：实战 —— 异步爬虫数据采集
  // =========================================================
  {
    id: "pa2-20",
    group: "实战项目",
    icon: "🕷️",
    title: "实战 —— 异步爬虫数据采集",
    content: `## 一、什么是异步爬虫？

爬虫 = 自动抓取网页数据的程序。

异步爬虫 = 用 asyncio 同时发起多个请求，**不阻塞等待每个响应**。

\\\`\\\`\\\`python
import asyncio

async def fetch(url):
    await asyncio.sleep(0.5)  # 模拟网络请求
    return f"HTML of {url}"

async def main():
    urls = ["url1", "url2", "url3"]
    results = await asyncio.gather(*[fetch(u) for u in urls])
    print(results)

asyncio.run(main())
\\\`\\\`\\\`

## 二、异步爬虫的核心流程

1. **准备 URL 列表**
2. **创建任务**：每个 URL 对应一个 fetch 任务
3. **并发执行**：asyncio.gather / asyncio.as_completed
4. **解析数据**：拿到结果后提取需要的内容
5. **保存结果**：写入文件或数据库

## 三、用 asyncio.as_completed 谁先完成谁先处理

\\\`\\\`\\\`python
async def fetch(url):
    await asyncio.sleep(random.uniform(0.1, 1.0))
    return url, "data"

async def main():
    urls = ["a", "b", "c"]
    tasks = [fetch(u) for u in urls]
    for coro in asyncio.as_completed(tasks):
        url, data = await coro
        print(f"先完成: {url}")
\\\`\\\`\\\`

## 四、限速：避免请求太快被封

用 \\\`asyncio.Semaphore\\\` 控制最大并发数：

\\\`\\\`\\\`python
sem = asyncio.Semaphore(3)  # 最多同时 3 个请求

async def fetch(url):
    async with sem:
        await asyncio.sleep(0.5)
        return f"{url} ok"
\\\`\\\`\\\`

## 五、错误处理：有些页面会失败

\\\`\\\`\\\`python
results = await asyncio.gather(*tasks, return_exceptions=True)
for r in results:
    if isinstance(r, Exception):
        print("抓取失败:", r)
    else:
        print("结果:", r)
\\\`\\\`\\\`

## 六、真实环境用什么发请求？

- **aiohttp**：第三方库，功能强大
- **httpx**：支持 sync / async 两种模式

但教学 demo 里只用标准库的 \\\`asyncio.sleep\\\` 模拟，保证你在任何环境都能跑。

## 七、本章实战目标

写一个迷你爬虫：
- 10 个 URL
- 最大并发 3
- 记录成功 / 失败 / 耗时
`,
    code: `"""
第二十章 demo：异步爬虫数据采集
目标：用 asyncio 实现一个带限速、错误处理的迷你爬虫。
"""
import asyncio
import random
import time


# ===== 模拟网络请求 =====
# 真实项目中这里会用 aiohttp / httpx 发送真正的 HTTP 请求。
async def fetch(url, session_id):
    """模拟抓取一个 URL，随机耗时 0.1~0.5 秒，偶发失败。"""
    delay = random.uniform(0.1, 0.5)
    await asyncio.sleep(delay)

    # 模拟 20% 概率请求失败
    if random.random() < 0.2:
        raise ConnectionError(f"{url} 连接超时")

    return f"[session {session_id}] {url} 的 HTML 内容（{len(url)} 字符）"


# ===== 带限速的抓取 =====
async def fetch_with_limit(url, session_id, sem):
    """用信号量控制并发，并记录耗时。"""
    start = time.time()
    async with sem:
        try:
            data = await fetch(url, session_id)
            return {
                "url": url,
                "status": "success",
                "data": data,
                "cost": time.time() - start,
            }
        except Exception as e:
            return {
                "url": url,
                "status": "failed",
                "error": str(e),
                "cost": time.time() - start,
            }


# ===== 主爬虫 =====
async def crawler(urls, max_concurrent=3):
    print("=" * 50)
    print("异步爬虫实战")
    print(f"总 URL 数: {len(urls)}, 最大并发: {max_concurrent}")
    print("=" * 50 + "\\n")

    sem = asyncio.Semaphore(max_concurrent)
    tasks = [fetch_with_limit(url, i + 1, sem) for i, url in enumerate(urls)]

    start_all = time.time()
    results = await asyncio.gather(*tasks)
    total_time = time.time() - start_all

    # 统计结果
    success = [r for r in results if r["status"] == "success"]
    failed = [r for r in results if r["status"] == "failed"]

    print(f"\\n✅ 成功: {len(success)} 条")
    for r in success[:3]:
        print(f"  {r['url']}: {r['data'][:40]}... 耗时 {r['cost']:.2f}s")
    if len(success) > 3:
        print(f"  ... 还有 {len(success) - 3} 条成功结果")

    print(f"\\n❌ 失败: {len(failed)} 条")
    for r in failed:
        print(f"  {r['url']}: {r['error']}")

    print(f"\\n⏱️  总耗时: {total_time:.2f} 秒")
    print(f"   如果是顺序抓取，预计需要 {sum(r['cost'] for r in results):.2f} 秒")
    print("=" * 50)


# ===== 入口 =====
if __name__ == "__main__":
    urls = [
        "https://example.com/page1",
        "https://example.com/page2",
        "https://example.com/page3",
        "https://example.com/page4",
        "https://example.com/page5",
        "https://example.com/page6",
        "https://example.com/page7",
        "https://example.com/page8",
        "https://example.com/page9",
        "https://example.com/page10",
    ]
    asyncio.run(crawler(urls, max_concurrent=3))
`,
  },

  // =========================================================
  // 第二十一章：实战 —— 异步 Web 服务端
  // =========================================================
  {
    id: "pa2-21",
    group: "实战项目",
    icon: "🌐",
    title: "实战 —— 异步 Web 服务端",
    content: `## 一、Web 服务端为什么要异步？

传统同步服务器：
- 一个请求处理慢，会阻塞后面的请求
- 并发能力受线程数限制

异步服务器：
- 一个请求等待 I/O 时，事件循环处理其他请求
- 单线程即可支撑大量并发连接

## 二、asyncio 自带 TCP 服务器

Python 标准库提供 \\\`asyncio.start_server\\\`：

\\\`\\\`\\\`python
async def handle(reader, writer):
    data = await reader.read(1024)
    writer.write(b"HTTP/1.1 200 OK\\r\\n\\r\\nHello")
    await writer.drain()
    writer.close()

server = await asyncio.start_server(handle, "127.0.0.1", 8080)
\\\`\\\`\\\`

## 三、真实框架

生产环境常用：
- **aiohttp**：成熟的 async web 框架
- **FastAPI**：现代、高性能，底层基于 asyncio
- **Sanic**：纯异步，追求极致性能

## 四、HTTP 基本响应格式

\\\`\\\`\\\`
HTTP/1.1 200 OK\r\n
Content-Type: text/plain\r\n
Content-Length: 5\r\n
\r\n
Hello
\\\`\\\`\\\`

## 五、本章 demo 目标

用 \\\`asyncio.start_server\\\` 实现一个极简 HTTP 服务端：
- 监听 127.0.0.1:8765
- 支持 \\\`/\\\` 和 \\\`/time\\\` 两个路由
- 服务端运行 5 秒后自动关闭
`,
    code: `"""
第二十一章 demo：异步 Web 服务端
目标：用 asyncio.start_server 实现一个极简 HTTP 服务器。
"""
import asyncio
import datetime


async def handle_request(reader, writer):
    """处理每一个 TCP 连接。"""
    addr = writer.get_extra_info("peername")
    print(f"  [连接] 来自 {addr}")

    # 读取 HTTP 请求头（简单读取一行）
    data = await reader.readline()
    request_line = data.decode("utf-8").strip()
    print(f"  [请求] {request_line}")

    # 简单路由
    if request_line.startswith("GET /time"):
        body = f"当前时间: {datetime.datetime.now()}".encode("utf-8")
        status = "200 OK"
        content_type = "text/plain; charset=utf-8"
    elif request_line.startswith("GET / ") or request_line.startswith("GET / HTTP"):
        body = b"Hello, asyncio server!"
        status = "200 OK"
        content_type = "text/plain"
    else:
        body = b"404 Not Found"
        status = "404 Not Found"
        content_type = "text/plain"

    # 构造 HTTP 响应
    response = (
        f"HTTP/1.1 {status}\\r\\n"
        f"Content-Type: {content_type}\\r\\n"
        f"Content-Length: {len(body)}\\r\\n"
        f"Connection: close\\r\\n"
        f"\\r\\n"
    ).encode("utf-8") + body

    writer.write(response)
    await writer.drain()
    writer.close()
    await writer.wait_closed()
    print(f"  [断开] {addr}\\n")


async def run_server():
    """启动服务器，运行一段时间后自动关闭。"""
    server = await asyncio.start_server(
        handle_request,
        host="127.0.0.1",
        port=8765,
    )

    print("=" * 50)
    print("异步 Web 服务端已启动")
    print("请在另一个终端测试:")
    print("  curl http://127.0.0.1:8765/")
    print("  curl http://127.0.0.1:8765/time")
    print("服务器将在 5 秒后自动关闭...")
    print("=" * 50 + "\\n")

    async with server:
        # 让服务器运行 5 秒
        await asyncio.sleep(5)

    print("\\n服务器已关闭")


# ===== 入口 =====
if __name__ == "__main__":
    asyncio.run(run_server())
`,
  },

  // =========================================================
  // 第二十二章：实战 —— 生产者-消费者队列
  // =========================================================
  {
    id: "pa2-22",
    group: "实战项目",
    icon: "🔄",
    title: "实战 —— 生产者-消费者队列",
    content: `## 一、什么是生产者-消费者模式？

- **生产者**：生成数据或任务
- **消费者**：从队列取数据并处理
- **队列**：中间缓冲区，解耦生产速度和消费速度

## 二、为什么要异步化？

- 生产者不需要等消费者处理完
- 多个消费者可以并发处理
- 用 \\\`asyncio.Queue\\\` 做协程间通信

## 三、基本结构

\\\`\\\`\\\`python
queue = asyncio.Queue(maxsize=10)

async def producer():
    for i in range(20):
        await queue.put(i)
        print(f"生产: {i}")

async def consumer():
    while True:
        item = await queue.get()
        if item is None:
            break
        await process(item)
        queue.task_done()
\\\`\\\`\\\`

## 四、停止信号

通常用 \\\`None\\\` 或特殊对象作为停止标记：

\\\`\\\`\\\`python
async def producer(queue, n):
    for i in range(n):
        await queue.put(i)
    await queue.put(None)  # 结束信号
\\\`\\\`\\\`

## 五、多个生产者和消费者

\\\`\\\`\\\`python
producers = [asyncio.create_task(producer(queue, i)) for i in range(2)]
consumers = [asyncio.create_task(consumer(queue)) for _ in range(3)]
await asyncio.gather(*producers)
await queue.join()  # 等所有任务处理完
for c in consumers:
    c.cancel()
\\\`\\\`\\\`

## 六、本章实战目标

模拟一个任务处理流水线：
- 2 个生产者产生任务
- 3 个消费者并发处理
- 记录处理耗时和队列积压
`,
    code: `"""
第二十二章 demo：生产者-消费者队列
目标：用 asyncio.Queue 实现多生产者 + 多消费者的任务流水线。
"""
import asyncio
import random
import time


async def producer(queue, name, count, stop_event):
    """生产者：不断往队列里放任务。"""
    for i in range(count):
        # 模拟生产间隔
        await asyncio.sleep(random.uniform(0.05, 0.2))

        task = {
            "id": f"{name}-{i+1}",
            "payload": random.randint(1, 100),
        }
        await queue.put(task)
        print(f"  [生产者 {name}] 生产任务 {task['id']}, 队列长度: {queue.qsize()}")

    print(f"  [生产者 {name}] 完成生产")


async def consumer(queue, name, stop_event):
    """消费者：从队列取任务并处理。"""
    while not stop_event.is_set():
        try:
            # 等待 0.5 秒，没任务就退出
            task = await asyncio.wait_for(queue.get(), timeout=0.5)
        except asyncio.TimeoutError:
            continue

        # 模拟处理耗时
        process_time = random.uniform(0.1, 0.4)
        await asyncio.sleep(process_time)

        print(f"  [消费者 {name}] 处理 {task['id']} (payload={task['payload']}) 耗时 {process_time:.2f}s, 剩余队列: {queue.qsize()}")
        queue.task_done()

    print(f"  [消费者 {name}] 退出")


async def main():
    print("=" * 50)
    print("生产者-消费者队列实战")
    print("2 个生产者 + 3 个消费者")
    print("=" * 50 + "\\n")

    queue = asyncio.Queue(maxsize=20)
    stop_event = asyncio.Event()

    start = time.time()

    # 启动生产者
    producers = [
        asyncio.create_task(producer(queue, "P1", 5, stop_event)),
        asyncio.create_task(producer(queue, "P2", 5, stop_event)),
    ]

    # 启动消费者
    consumers = [
        asyncio.create_task(consumer(queue, "C1", stop_event)),
        asyncio.create_task(consumer(queue, "C2", stop_event)),
        asyncio.create_task(consumer(queue, "C3", stop_event)),
    ]

    # 等待所有生产者完成
    await asyncio.gather(*producers)
    print("\\n所有生产者已完成\\n")

    # 等待队列中所有任务被消费完
    await queue.join()
    print("\\n队列已清空\\n")

    # 通知消费者退出
    stop_event.set()
    await asyncio.gather(*consumers)

    print(f"\\n⏱️  总耗时: {time.time() - start:.2f} 秒")
    print("=" * 50)


# ===== 入口 =====
if __name__ == "__main__":
    asyncio.run(main())
`,
  },

  // =========================================================
  // 第二十三章：实战 —— 并发下载器与限速
  // =========================================================
  {
    id: "pa2-23",
    group: "实战项目",
    icon: "⬇️",
    title: "实战 —— 并发下载器与限速",
    content: `## 一、下载器为什么需要异步？

下载文件时，大部分时间都在等网络 I/O。

异步可以让 CPU 在等待时去处理其他下载任务，大幅提升效率。

## 二、并发下载的核心思路

\\\`\\\`\\\`python
async def download(url):
    await fetch(url)
    save_to_disk(url, data)

urls = [url1, url2, url3]
await asyncio.gather(*[download(u) for u in urls])
\\\`\\\`\\\`

## 三、限速防止过载

没有限速：
- 同时 1000 个连接，服务器可能拒绝服务
- 本地带宽被占满

有限速：
- 用 Semaphore 控制并发数
- 下载完一个再开始下一个

## 四、进度显示

\\\`\\\`\\\`python
completed = 0
async def download(url, sem):
    async with sem:
        ...
        completed += 1
        print(f"进度: {completed}/{total}")
\\\`\\\`\\\`

注意：多协程修改共享变量需要加锁。

## 五、重试机制

\\\`\\\`\\\`python
async def download_with_retry(url, retries=3):
    for i in range(retries):
        try:
            return await download(url)
        except Exception as e:
            print(f"第 {i+1} 次失败: {e}")
            await asyncio.sleep(1)
    raise Exception("全部重试失败")
\\\`\\\`\\\`

## 六、本章 demo 目标

模拟并发下载 8 个文件：
- 最大并发 3
- 显示实时进度
- 失败自动重试 2 次
- 统计总耗时和平均速度
`,
    code: `"""
第二十三章 demo：并发下载器与限速
目标：模拟多文件并发下载，支持限速、重试、进度显示。
"""
import asyncio
import random
import time


# ===== 模拟下载一个文件 =====
async def download_file(url, sem):
    """模拟下载：随机耗时 0.2~0.8 秒，10% 概率失败。"""
    async with sem:
        delay = random.uniform(0.2, 0.8)
        await asyncio.sleep(delay)

        if random.random() < 0.1:
            raise ConnectionError(f"{url} 下载失败")

        size = random.randint(100, 1000)
        return {"url": url, "size": size, "cost": delay}


# ===== 带重试的下载 =====
async def download_with_retry(url, sem, retries=2):
    """失败自动重试。"""
    for attempt in range(retries + 1):
        try:
            return await download_file(url, sem)
        except Exception as e:
            print(f"    {url} 第 {attempt + 1}/{retries + 1} 次失败: {e}")
            if attempt < retries:
                await asyncio.sleep(0.3)
            else:
                return {"url": url, "size": 0, "cost": 0, "error": str(e)}


# ===== 并发下载器 =====
async def downloader(urls, max_concurrent=3):
    print("=" * 50)
    print("并发下载器实战")
    print(f"总文件数: {len(urls)}, 最大并发: {max_concurrent}")
    print("=" * 50 + "\\n")

    sem = asyncio.Semaphore(max_concurrent)
    total = len(urls)
    completed = 0
    lock = asyncio.Lock()

    async def wrapped_download(url):
        nonlocal completed
        result = await download_with_retry(url, sem)

        async with lock:
            completed += 1
            progress = completed / total * 100
            status = "✅" if "error" not in result else "❌"
            print(f"  [{status}] 进度 {completed}/{total} ({progress:.0f}%) | {url} | 大小 {result.get('size', 0)} bytes")

        return result

    start = time.time()
    results = await asyncio.gather(*[wrapped_download(u) for u in urls])
    total_time = time.time() - start

    success = [r for r in results if "error" not in r]
    failed = [r for r in results if "error" in r]
    total_size = sum(r["size"] for r in success)

    print(f"\\n📦 成功: {len(success)} 个, 失败: {len(failed)} 个")
    print(f"📊 总下载大小: {total_size} bytes")
    print(f"⏱️  总耗时: {total_time:.2f} 秒")
    if total_time > 0:
        print(f"🚀 平均速度: {total_size / total_time:.0f} bytes/秒")
    print("=" * 50)


# ===== 入口 =====
if __name__ == "__main__":
    urls = [
        "https://example.com/files/report.pdf",
        "https://example.com/files/image.png",
        "https://example.com/files/video.mp4",
        "https://example.com/files/data.csv",
        "https://example.com/files/archive.zip",
        "https://example.com/files/document.docx",
        "https://example.com/files/music.mp3",
        "https://example.com/files/code.py",
    ]
    asyncio.run(downloader(urls, max_concurrent=3))
`,
  },

  // =========================================================
  // 第二十四章：asyncio 调试、性能优化与最佳实践
  // =========================================================
  {
    id: "pa2-24",
    group: "实战项目",
    icon: "🚀",
    title: "asyncio 调试、性能优化与最佳实践",
    content: `## 一、开启调试模式

\\\`\\\`\\\`python
asyncio.run(main(), debug=True)
\\\`\\\`\\\`

开启后会：
- 报告执行时间过长的回调
- 警告未被等待的协程
- 显示更多异常上下文

## 二、避免阻塞事件循环

**不要在协程里写同步阻塞代码！**

\\\`\\\`\\\`python
# ❌ 错误
async def bad():
    time.sleep(5)  # 阻塞整个线程

# ✅ 正确
async def good():
    await asyncio.sleep(5)  # 让出 CPU

# ✅ 同步代码放到线程池
async def also_good():
    await asyncio.to_thread(blocking_func)
\\\`\\\`\\\`

## 三、合理使用 gather / create_task

- \\\`await coro()\\\`：顺序执行
- \\\`asyncio.gather\\\`：并发 + 自动收集结果
- \\\`asyncio.create_task\\\`：更灵活，可取消
- \\\`asyncio.TaskGroup\\\`（3.11+）：自动管理生命周期

## 四、注意异常处理

\\\`\\\`\\\`python
results = await asyncio.gather(*tasks, return_exceptions=True)
for r in results:
    if isinstance(r, Exception):
        handle_error(r)
\\\`\\\`\\\`

## 五、资源清理

用 \\\`async with\\\` 确保资源释放：

\\\`\\\`\\\`python
async with aiohttp.ClientSession() as session:
    async with session.get(url) as resp:
        data = await resp.text()
# 自动关闭 session 和 response
\\\`\\\`\\\`

## 六、常见反模式

| 反模式 | 问题 | 正确做法 |
|--------|------|----------|
| 在协程里用 time.sleep | 阻塞事件循环 | await asyncio.sleep |
| 忘记 await 协程 | 协程不会执行 | 确保 await 或 create_task |
| main 提前 return | 子任务被取消 | await 所有任务 |
| 并发无上限 | 资源耗尽 | 用 Semaphore 限速 |
| 不处理取消 | CancelledError 导致崩溃 | 在 except 里正确清理 |

## 七、性能优化 checklist

- [ ] 只把真正的 I/O 操作异步化
- [ ] CPU 密集型任务用 \\\`asyncio.to_thread\\\` 或进程池
- [ ] 控制并发数量
- [ ] 设置合理的超时
- [ ] 使用连接池（如 aiohttp.ClientSession）
- [ ] 避免在事件循环中执行大量同步计算

## 八、学习路线总结

1. 理解协程、事件循环、async/await
2. 掌握 Task、gather、create_task
3. 学会异步 I/O 工具（sleep、Queue、to_thread）
4. 掌握并发控制（Lock、Semaphore、Event、Timeout）
5. 实战项目加深理解
6. 持续优化代码质量和性能
`,
    code: `"""
第二十四章 demo：asyncio 调试、性能优化与最佳实践
目标：总结调试技巧和常见最佳实践，通过 demo 验证。
"""
import asyncio
import time


# ===== 1. 调试模式：检测慢回调 =====
async def slow_callback():
    """模拟一个执行时间过长的回调（>100ms 会触发调试警告）。"""
    print("【1. 慢回调检测】")
    print("  这个函数阻塞了 0.15 秒")
    time.sleep(0.15)  # 故意阻塞，debug=True 会报警告
    print("  结束\\n")


# ===== 2. 正确：让出 CPU =====
async def non_blocking():
    """正确写法：让事件循环处理其他任务。"""
    print("【2. 非阻塞等待】")
    print("  开始")
    await asyncio.sleep(0.15)
    print("  结束（不阻塞其他协程）\\n")


# ===== 3. 同步代码扔到线程池 =====
def blocking_io():
    """模拟同步 I/O 操作。"""
    time.sleep(0.2)
    return "blocking result"


async def run_in_thread():
    """用 asyncio.to_thread 把同步代码放到线程池。"""
    print("【3. 同步代码放到线程池】")
    start = time.time()
    result = await asyncio.to_thread(blocking_io)
    print(f"  结果: {result}, 耗时: {time.time() - start:.2f}s\\n")


# ===== 4. 并发 vs 顺序性能对比 =====
async def work(name, delay):
    await asyncio.sleep(delay)
    return f"{name} done"


async def compare_performance():
    print("【4. 并发 vs 顺序性能对比】")

    # 顺序执行
    start = time.time()
    for i in range(5):
        await work(f"顺序-{i}", 0.2)
    sequential_time = time.time() - start
    print(f"  顺序执行 5 个任务耗时: {sequential_time:.2f}s")

    # 并发执行
    start = time.time()
    await asyncio.gather(*[work(f"并发-{i}", 0.2) for i in range(5)])
    concurrent_time = time.time() - start
    print(f"  并发执行 5 个任务耗时: {concurrent_time:.2f}s\\n")


# ===== 5. 异常处理最佳实践 =====
async def may_fail(name):
    await asyncio.sleep(0.1)
    if name == "C":
        raise ValueError(f"{name} 出错了")
    return f"{name} ok"


async def demo_exception_handling():
    print("【5. 异常处理最佳实践】")
    tasks = [may_fail(name) for name in ["A", "B", "C", "D"]]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    for r in results:
        if isinstance(r, Exception):
            print(f"  ❌ 错误: {r}")
        else:
            print(f"  ✅ 成功: {r}")
    print()


# ===== 6. 资源清理最佳实践 =====
class FakeConnection:
    """模拟一个需要关闭的连接。"""

    async def __aenter__(self):
        print("【6. 资源清理】")
        print("  建立连接")
        return self

    async def __aexit__(self, exc_type, exc, tb):
        print("  关闭连接（无论是否异常都会执行）\\n")

    async def fetch(self):
        await asyncio.sleep(0.1)
        return "data"


async def demo_resource_cleanup():
    async with FakeConnection() as conn:
        data = await conn.fetch()
        print(f"  获取数据: {data}")


# ===== 主入口 =====
async def main():
    print("=" * 50)
    print("asyncio 调试、性能优化与最佳实践")
    print("=" * 50 + "\\n")

    await slow_callback()
    await non_blocking()
    await run_in_thread()
    await compare_performance()
    await demo_exception_handling()
    await demo_resource_cleanup()

    print("=" * 50)
    print("最佳实践总结：")
    print("• 开发时开启 debug=True")
    print("• 不要在协程中调用 time.sleep 等阻塞函数")
    print("• CPU 密集型任务用 asyncio.to_thread")
    print("• 善用 gather 并发，善用 return_exceptions 处理异常")
    print("• 用 async with 管理资源生命周期")
    print("=" * 50)


# ===== 入口 =====
if __name__ == "__main__":
    # 开启调试模式，帮助发现潜在问题
    asyncio.run(main(), debug=True)
`,
  },
];
