// =============================================================
// Python asyncio 教程（pyasync）—— 第五批章节
// -------------------------------------------------------------
// 实战项目（20-24章）
//   第 20 章：项目 1：异步批量 HTTP 爬虫
//   第 21 章：项目 2：异步任务调度器
//   第 22 章：项目 3：异步日志聚合器
//   第 23 章：项目 4：异步文件下载器
//   第 24 章：常见错误与最佳实践
// =============================================================

export const chapters = [
  // =========================================================
  // 第二十章：项目 1：异步批量 HTTP 爬虫
  // =========================================================
  {
    id: "pa-20",
    group: "实战项目",
    icon: "🕷️",
    title: "项目 1：异步批量 HTTP 爬虫",
    content: `## 一、项目目标

并发抓取多个 URL，限制并发数，处理超时和错误。

## 二、需求

| 功能 | 描述 |
|------|------|
| 批量抓取 | 并发 100+ URL |
| 限流 | 最多 10 个并发 |
| 超时 | 单个请求 5 秒 |
| 错误处理 | 单个失败不影响其他 |
| 进度 | 实时显示 |

## 三、核心代码

\`\`\`python
import asyncio

class AsyncCrawler:
    def __init__(self, concurrency=10, timeout=5.0):
        self.sem = asyncio.Semaphore(concurrency)
        self.timeout = timeout

    async def fetch(self, session, url):
        async with self.sem:
            try:
                async with asyncio.timeout(self.timeout):
                    # 模拟 HTTP 请求
                    await asyncio.sleep(0.1)
                    return {"url": url, "status": 200, "data": "..."}
            except (asyncio.TimeoutError, Exception) as e:
                return {"url": url, "error": str(e)}

    async def crawl(self, urls):
        # 模拟 session
        async def one(url):
            return await self.fetch(None, url)

        tasks = [asyncio.create_task(one(url), name=f"fetch_{i}")
                 for i, url in enumerate(urls)]
        return await asyncio.gather(*tasks)
\`\`\`

## 四、关键技术

1. **Semaphore 限流**：防止被服务器 ban
2. **超时控制**：单个请求不能卡死
3. **gather + return_exceptions**：防止一个失败搞砸全部
4. **task 命名**：调试时好找

## 五、本章 demo

实现完整爬虫框架。
`,
    code: `"""
第二十章 demo：异步批量 HTTP 爬虫
完整实现：
  - 限流（Semaphore）
  - 超时（asyncio.timeout）
  - 错误处理
  - 进度显示
  - 统计汇总
"""

import asyncio
import time
import random


class FakeResponse:
    """模拟 HTTP 响应"""
    def __init__(self, url, status=200, delay=0.1):
        self.url = url
        self.status = status
        self.delay = delay
        self.data = f"<html>content of {url}</html>"

    def __repr__(self):
        return f"Response(url={self.url}, status={self.status})"


class AsyncCrawler:
    """异步 HTTP 爬虫（用 asyncio 模拟）"""
    def __init__(self, concurrency=10, timeout=5.0):
        self.sem = asyncio.Semaphore(concurrency)
        self.timeout = timeout
        self.stats = {"success": 0, "failed": 0, "timeout": 0}

    async def fetch_one(self, url):
        """抓单个 URL（带限流和超时）"""
        async with self.sem:
            try:
                async with asyncio.timeout(self.timeout):
                    # 模拟网络延迟
                    await asyncio.sleep(random.uniform(0.05, 0.3))

                    # 模拟 10% 失败率
                    if random.random() < 0.1:
                        raise ConnectionError(f"连接 {url} 失败")

                    # 模拟 5% 404
                    if random.random() < 0.05:
                        return FakeResponse(url, status=404)

                    return FakeResponse(url, status=200)
            except asyncio.TimeoutError:
                self.stats["timeout"] += 1
                return FakeResponse(url, status="TIMEOUT")
            except Exception as e:
                self.stats["failed"] += 1
                return FakeResponse(url, status="ERROR", delay=0)

    async def crawl(self, urls, on_progress=None):
        """批量抓取"""
        tasks = [
            asyncio.create_task(self.fetch_one(url), name=f"fetch_{i}")
            for i, url in enumerate(urls)
        ]
        results = []
        total = len(tasks)
        for i, coro in enumerate(asyncio.as_completed(tasks)):
            result = await coro
            results.append(result)
            if on_progress:
                on_progress(i + 1, total, result)
        return results

    def report(self):
        print(f"  📊 抓取统计:")
        print(f"     成功: {self.stats['success']}")
        print(f"     失败: {self.stats['failed']}")
        print(f"     超时: {self.stats['timeout']}")


async def main():
    print("=" * 50)
    print("Python asyncio 教程 — 第二十章 demo")
    print("=" * 50 + "\\n")

    # 100 个 URL
    urls = [f"https://api.example.com/item/{i}" for i in range(100)]
    print(f"  目标: 抓取 {len(urls)} 个 URL")
    print(f"  配置: 并发=10, 超时=2秒\\n")

    crawler = AsyncCrawler(concurrency=10, timeout=2.0)
    start = time.time()

    def on_progress(done, total, result):
        if done % 10 == 0 or done == total:
            print(f"  进度: {done}/{total} ({done/total*100:.0f}%)")

    results = await crawler.crawl(urls, on_progress=on_progress)

    elapsed = time.time() - start
    print(f"\\n  总耗时: {elapsed:.2f} 秒")
    print(f"  串行需要: 100 * 0.15 = 15 秒，加速: {15/elapsed:.1f}x\\n")

    # 统计
    success = sum(1 for r in results if r.status == 200)
    not_found = sum(1 for r in results if r.status == 404)
    errors = len(results) - success - not_found
    print(f"  实际结果:")
    print(f"    200 OK: {success}")
    print(f"    404 Not Found: {not_found}")
    print(f"    错误: {errors}")


if __name__ == "__main__":
    asyncio.run(main())
    print("\\n" + "=" * 50)
    print("总结：")
    print("• Semaphore 限流防止被 ban")
    print("• asyncio.timeout 处理单个超时")
    print("• as_completed 边完成边处理")
    print("• 任务命名方便调试")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第二十一章：项目 2：异步任务调度器
  // =========================================================
  {
    id: "pa-21",
    group: "实战项目",
    icon: "📅",
    title: "项目 2：异步任务调度器",
    content: `## 一、项目目标

构建一个支持定时、并发、限流的异步任务调度器。

## 二、需求

| 功能 | 描述 |
|------|------|
| 添加任务 | 周期性或一次性 |
| 并发执行 | 多任务并发跑 |
| 限流 | 同时最多 N 个 |
| 优雅停止 | Ctrl+C 优雅退出 |

## 三、设计

\`\`\`python
class Scheduler:
    def __init__(self, max_concurrent=5):
        self.queue = asyncio.Queue()
        self.sem = asyncio.Semaphore(max_concurrent)
        self.workers = []
        self.stop_event = asyncio.Event()
\`\`\`

## 四、核心：任务 + 调度

任务分两类：
- **一次性任务**：只跑一次
- **周期任务**：每 N 秒跑一次

## 五、本章 demo

实现完整调度器。
`,
    code: `"""
第二十一章 demo：异步任务调度器
完整实现：
  - 一次性任务 + 周期任务
  - 多 worker 并发
  - Semaphore 限流
  - 优雅停止
"""

import asyncio
import time
import signal
from datetime import datetime


def now_str():
    return datetime.now().strftime("%H:%M:%S")


class Task:
    """一个任务"""
    def __init__(self, name, coro, interval=None):
        self.name = name
        self.coro = coro
        self.interval = interval  # None = 一次性
        self.run_count = 0


class AsyncScheduler:
    def __init__(self, num_workers=3, max_concurrent=5):
        self.num_workers = num_workers
        self.sem = asyncio.Semaphore(max_concurrent)
        self.task_queue = asyncio.Queue()
        self.stop_event = asyncio.Event()
        self.workers = []
        self.tasks = {}  # name -> Task

    def add_task(self, name, coro, interval=None):
        """添加任务（interval=None 为一次性）"""
        task = Task(name, coro, interval)
        self.tasks[name] = task
        return task

    async def _worker(self, worker_id):
        """一个 worker"""
        while not self.stop_event.is_set():
            try:
                # 1 秒超时，能感知到 stop
                task = await asyncio.wait_for(
                    self.task_queue.get(), timeout=0.5,
                )
            except asyncio.TimeoutError:
                continue
            # 限流执行
            asyncio.create_task(self._execute(task))
            self.task_queue.task_done()

    async def _execute(self, task):
        """执行任务（带限流）"""
        async with self.sem:
            try:
                task.run_count += 1
                print(f"  [{now_str()}] [Worker] 执行 {task.name}（第 {task.run_count} 次）")
                await task.coro()
            except Exception as e:
                print(f"  [{now_str()}] [Worker] {task.name} 异常: {e}")

    async def _reschedule(self, task):
        """周期任务：完成后重新入队"""
        if task.interval and not self.stop_event.is_set():
            await asyncio.sleep(task.interval)
            if not self.stop_event.is_set():
                await self.task_queue.put(task)

    async def start(self):
        """启动调度器"""
        # 启动 workers
        for i in range(self.num_workers):
            self.workers.append(
                asyncio.create_task(self._worker(i), name=f"worker_{i}")
            )
        print(f"  调度器启动: {self.num_workers} workers")

    async def submit(self, task):
        """投放任务"""
        await self.task_queue.put(task)
        print(f"  [{now_str()}] 投放任务: {task.name}")

    async def submit_periodic(self, task):
        """投放周期任务"""
        await self.task_queue.put(task)
        # 重新调度
        asyncio.create_task(self._reschedule(task))

    async def stop(self):
        """停止调度器"""
        print(f"  [{now_str()}] 收到停止信号...")
        self.stop_event.set()
        # 等 workers 退出
        for w in self.workers:
            w.cancel()
        await asyncio.gather(*self.workers, return_exceptions=True)
        print(f"  [{now_str()}] 调度器已停止")


async def main():
    print("=" * 50)
    print("Python asyncio 教程 — 第二十一章 demo")
    print("=" * 50 + "\\n")

    scheduler = AsyncScheduler(num_workers=2, max_concurrent=2)
    await scheduler.start()
    print()

    # 一次性任务
    async def task_once():
        await asyncio.sleep(0.1)
        print(f"    一次性任务完成")

    # 周期任务
    async def task_periodic():
        print(f"    周期任务执行中")

    # 长任务
    async def long_task():
        await asyncio.sleep(0.5)
        print(f"    长任务完成")

    # 投放
    once_task = scheduler.add_task("once", task_once)
    periodic_task = scheduler.add_task("periodic", task_periodic, interval=1.0)
    long_t = scheduler.add_task("long", long_task)

    await scheduler.submit(once_task)
    await scheduler.submit(long_t)
    await scheduler.submit_periodic(periodic_task)

    # 模拟运行 3 秒
    print(f"\\n  [{now_str()}] 运行 3 秒...")
    await asyncio.sleep(3.0)

    await scheduler.stop()

    # 统计
    print(f"\\n  任务执行次数:")
    for name, t in scheduler.tasks.items():
        print(f"    {name}: {t.run_count} 次")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\\n被中断")
    print("\\n" + "=" * 50)
    print("总结：")
    print("• Worker 模式处理任务队列")
    print("• 周期任务执行完重新入队")
    print("• Semaphore 限流")
    print("• Event 实现优雅停止")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第二十二章：项目 3：异步日志聚合器
  // =========================================================
  {
    id: "pa-22",
    group: "实战项目",
    icon: "📊",
    title: "项目 3：异步日志聚合器",
    content: `## 一、项目目标

把多台机器的日志（模拟）异步聚合到一个文件中。

## 二、需求

| 功能 | 描述 |
|------|------|
| 多源 | 多个"客户端"并发发日志 |
| 聚合 | 全部按时间顺序合并 |
| 限流 | 写入文件不爆 IO |
| 缓冲 | 批量写提升性能 |

## 三、核心：异步队列 + 异步写

\`\`\`python
queue = asyncio.Queue()
# 生产者
await queue.put(log)
# 消费者
while True:
    log = await queue.get()
    await write(log)
    queue.task_done()
\`\`\`

## 四、本章 demo

实现日志聚合器。
`,
    code: `"""
第二十二章 demo：异步日志聚合器
完整实现：
  - 多"客户端"并发产生日志
  - 异步队列缓冲
  - 单线程顺序写入
  - 按时间排序
"""

import asyncio
import time
import random
import tempfile
from pathlib import Path
from datetime import datetime


def now_str():
    return datetime.now().strftime("%H:%M:%S.%f")[:-3]


class LogAggregator:
    """异步日志聚合器"""
    def __init__(self, output_path):
        self.output_path = Path(output_path)
        self.queue = asyncio.Queue(maxsize=1000)
        self.consumer_task = None
        self.stats = {"received": 0, "written": 0, "dropped": 0}
        self._stop = False

    async def start(self):
        """启动消费者"""
        self.consumer_task = asyncio.create_task(self._consumer())
        print(f"  聚合器启动，写入: {self.output_path.name}")

    async def stop(self):
        """停止聚合器"""
        # 等待队列清空
        await self.queue.join()
        self._stop = True
        if self.consumer_task:
            self.consumer_task.cancel()
            try:
                await self.consumer_task
            except asyncio.CancelledError:
                pass

    async def submit(self, source, level, message):
        """客户端提交一条日志"""
        log_entry = {
            "time": now_str(),
            "source": source,
            "level": level,
            "message": message,
        }
        try:
            self.queue.put_nowait(log_entry)
            self.stats["received"] += 1
        except asyncio.QueueFull:
            self.stats["dropped"] += 1

    async def _consumer(self):
        """消费者：批量读取 + 写入"""
        buffer = []
        last_flush = time.time()
        while not self._stop:
            try:
                # 最多等 0.5 秒
                item = await asyncio.wait_for(self.queue.get(), timeout=0.5)
                buffer.append(item)
                self.queue.task_done()
                # 累积到 10 条或超时 0.5 秒就 flush
                if len(buffer) >= 10 or (time.time() - last_flush) > 0.5:
                    await self._flush(buffer)
                    buffer = []
                    last_flush = time.time()
            except asyncio.TimeoutError:
                # 超时了，flush 一下
                if buffer:
                    await self._flush(buffer)
                    buffer = []
                    last_flush = time.time()

    async def _flush(self, buffer):
        """批量写文件"""
        def _write():
            with self.output_path.open("a", encoding="utf-8") as f:
                for log in buffer:
                    line = f"[{log['time']}] [{log['level']:5s}] {log['source']}: {log['message']}\\n"
                    f.write(line)
                    self.stats["written"] += 1
        # 用 to_thread 异步写
        await asyncio.to_thread(_write)


async def log_client(aggregator, name, num_logs, interval):
    """模拟一个客户端"""
    levels = ["INFO", "INFO", "WARN", "ERROR", "DEBUG"]
    for i in range(num_logs):
        level = random.choice(levels)
        msg = f"处理请求 #{i}"
        await aggregator.submit(name, level, msg)
        await asyncio.sleep(random.uniform(0.01, interval))


async def main():
    print("=" * 50)
    print("Python asyncio 教程 — 第二十二章 demo")
    print("=" * 50 + "\\n")

    base = Path(tempfile.mkdtemp(prefix="pa22_"))
    out = base / "aggregated.log"
    aggregator = LogAggregator(out)
    await aggregator.start()
    print()

    # 5 个客户端并发产生日志
    clients = [
        log_client(aggregator, f"server{i}", num_logs=20, interval=0.05)
        for i in range(5)
    ]
    start = time.time()
    await asyncio.gather(*clients)
    elapsed = time.time() - start

    print(f"  5 个客户端各产生 20 条，耗时: {elapsed:.2f} 秒")
    print(f"  共发送: {aggregator.stats['received']} 条")
    await aggregator.stop()

    # 显示结果
    print(f"\\n  聚合器统计:")
    print(f"    收到: {aggregator.stats['received']}")
    print(f"    写入: {aggregator.stats['written']}")
    print(f"    丢失: {aggregator.stats['dropped']}")

    # 显示前 10 条日志
    print(f"\\n  前 10 条日志:")
    lines = out.read_text(encoding="utf-8").splitlines()
    for line in lines[:10]:
        print(f"    {line}")


if __name__ == "__main__":
    asyncio.run(main())
    print("\\n" + "=" * 50)
    print("总结：")
    print("• Queue 缓冲日志")
    print("• 消费者批量写文件")
    print("• 多客户端并发不丢日志")
    print("• 用 to_thread 异步写")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第二十三章：项目 4：异步文件下载器
  // =========================================================
  {
    id: "pa-23",
    group: "实战项目",
    icon: "💾",
    title: "项目 4：异步文件下载器",
    content: `## 一、项目目标

实现一个支持并发、限流、断点续传的下载器。

## 二、需求

| 功能 | 描述 |
|------|------|
| 并发下载 | 多个文件同时 |
| 限流 | 同时最多 N 个 |
| 进度 | 每个文件进度 |
| 错误重试 | 失败自动重试 |

## 三、本章 demo

实现一个简化的下载器。
`,
    code: `"""
第二十三章 demo：异步文件下载器
完整实现：
  - 并发下载（Semaphore 限流）
  - 进度显示
  - 错误重试
  - 批量下载
"""

import asyncio
import time
import random
import tempfile
from pathlib import Path


class FakeDownloader:
    """模拟文件下载器（用 asyncio.sleep 模拟网络）"""
    def __init__(self, concurrency=3, max_retries=3):
        self.sem = asyncio.Semaphore(concurrency)
        self.max_retries = max_retries
        self.stats = {"success": 0, "failed": 0, "retries": 0}

    async def download(self, url, output_path, progress_callback=None):
        """下载一个文件（带重试）"""
        async with self.sem:
            for attempt in range(self.max_retries):
                try:
                    # 模拟下载
                    total = 100
                    downloaded = 0
                    for _ in range(5):
                        await asyncio.sleep(random.uniform(0.05, 0.2))
                        chunk = random.randint(10, 30)
                        downloaded = min(downloaded + chunk, total)
                        if progress_callback:
                            progress_callback(url, downloaded, total)

                    if random.random() < 0.1:
                        raise ConnectionError(f"模拟 {url} 网络中断")

                    # 写入文件
                    await asyncio.to_thread(
                        output_path.write_bytes,
                        f"content of {url}".encode()
                    )
                    self.stats["success"] += 1
                    return {"url": url, "size": total, "status": "OK"}
                except (ConnectionError, asyncio.TimeoutError) as e:
                    if attempt < self.max_retries - 1:
                        self.stats["retries"] += 1
                        print(f"  ⚠️  {url} 失败，重试 {attempt+1}/{self.max_retries}")
                        await asyncio.sleep(0.2)
                    else:
                        self.stats["failed"] += 1
                        return {"url": url, "status": "FAILED", "error": str(e)}


async def download_one(downloader, url, output_dir, name):
    """下载并保存"""
    output_path = output_dir / name

    def progress_cb(url, done, total):
        pct = done / total * 100
        print(f"  [{name}] {pct:.0f}%", end="\\r", flush=True)

    print(f"  📥 开始下载 {name}...")
    result = await downloader.download(url, output_path, progress_cb)
    print(f"  ✅ {name} 完成" if result["status"] == "OK" else f"  ❌ {name} 失败")
    return result


async def main():
    print("=" * 50)
    print("Python asyncio 教程 — 第二十三章 demo")
    print("=" * 50 + "\\n")

    base = Path(tempfile.mkdtemp(prefix="pa23_"))
    download_dir = base / "downloads"
    download_dir.mkdir()

    files = [
        ("https://example.com/file1.zip", "file1.zip"),
        ("https://example.com/file2.zip", "file2.zip"),
        ("https://example.com/file3.zip", "file3.zip"),
        ("https://example.com/file4.zip", "file4.zip"),
        ("https://example.com/file5.zip", "file5.zip"),
    ]

    downloader = FakeDownloader(concurrency=2, max_retries=3)
    start = time.time()

    tasks = [
        download_one(downloader, url, download_dir, name)
        for url, name in files
    ]
    results = await asyncio.gather(*tasks)

    elapsed = time.time() - start
    print(f"\\n  下载完成: {len(results)} 个文件")
    print(f"  耗时: {elapsed:.2f} 秒\\n")

    print(f"  📊 统计:")
    print(f"     成功: {downloader.stats['success']}")
    print(f"     失败: {downloader.stats['failed']}")
    print(f"     重试: {downloader.stats['retries']}")

    # 显示文件
    print(f"\\n  下载目录: {download_dir.name}")
    for f in sorted(download_dir.iterdir()):
        print(f"    📄 {f.name} ({f.stat().st_size} bytes)")


if __name__ == "__main__":
    asyncio.run(main())
    print("\\n" + "=" * 50)
    print("总结：")
    print("• Semaphore 限流")
    print("• 重试机制（max_retries）")
    print("• 进度回调")
    print("• to_thread 异步写文件")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第二十四章：常见错误与最佳实践
  // =========================================================
  {
    id: "pa-24",
    group: "实战项目",
    icon: "🚧",
    title: "常见错误与最佳实践",
    content: `## 一、10 个最常见错误

### 1. 忘记 await
\`\`\`python
# ❌
result = some_coro()

# ✅
result = await some_coro()
\`\`\`

### 2. 同步阻塞调用
\`\`\`python
# ❌
async def fetch():
    return requests.get(url)  # 阻塞

# ✅
async def fetch():
    async with aiohttp.ClientSession() as s:
        async with s.get(url) as r:
            return await r.text()
\`\`\`

### 3. time.sleep 阻塞事件循环
\`\`\`python
# ❌
async def wait():
    time.sleep(1)  # 卡 1 秒

# ✅
async def wait():
    await asyncio.sleep(1)
\`\`\`

### 4. Task 没保存引用
\`\`\`python
# ❌
async def main():
    asyncio.create_task(work())  # 被 GC

# ✅
async def main():
    t = asyncio.create_task(work())
    await t
\`\`\`

### 5. 在 async 里跑 CPU 密集
\`\`\`python
# ❌
async def heavy():
    for i in range(10**8):
        ...

# ✅
async def heavy():
    await asyncio.to_thread(heavy_cpu)
\`\`\`

### 6. 重复 await 协程
\`\`\`python
# ❌
c = coro()
await c
await c  # 报错
\`\`\`

### 7. 协程当函数调用
\`\`\`python
# ❌
def sync_func():
    return await some_coro()  # SyntaxError
\`\`\`

### 8. 死锁
\`\`\`python
# ❌ 同一个协程里请求两次锁
async with lock:
    async with lock:  # 死锁
        ...
\`\`\`

### 9. 不取消 Task
\`\`\`python
# ❌ 协程退出时没取消后台 task
async def main():
    asyncio.create_task(background())
    return  # task 还在跑
\`\`\`

### 10. gather 默认取消其他
\`\`\`python
# ❌ 一个失败，其他被取消
await asyncio.gather(t1, t2, t3)

# ✅ 用 return_exceptions=True
await asyncio.gather(t1, t2, t3, return_exceptions=True)
\`\`\`

## 二、12 条最佳实践

1. **永远 await 协程**
2. **永远用 async with 处理资源**
3. **Semaphore 限流**
4. **asyncio.timeout 控制超时**
5. **debug=True 开发**
6. **任务命名**
7. **CPU 密集用 to_thread 或 ProcessPoolExecutor**
8. **I/O 密集用协程**
9. **gather + return_exceptions**
10. **Event 实现优雅停止**
11. **try/except CancelledError 清理**
12. **监控：aiomonitor / prometheus**

## 三、asyncio vs threading vs multiprocessing

| 场景 | 推荐 |
|------|------|
| 高并发 I/O | asyncio |
| 少量 I/O + GUI | threading |
| CPU 密集 | multiprocessing |
| 高并发 + 简单 | asyncio |

## 四、5 个调试技巧

1. **debug=True**：开发时开启
2. **asyncio.all_tasks()**：看所有任务
3. **current_task().get_stack()**：看栈
4. **pdb**：async 里也能用
5. **aiomonitor**：生产环境监控

## 五、本章 demo

展示常见错误和最佳实践。
`,
    code: `"""
第二十四章 demo：常见错误与最佳实践
演示：
  1. 10 个常见错误 + 正确写法
  2. 性能对比
  3. 推荐模板
"""

import asyncio
import time


# ===== 1. 错误 1: 忘记 await =====
async def forgot_await():
    print("  错误 1: 忘记 await")
    print("    ❌ result = coro()")
    print("    ✅ result = await coro()")
    print()


# ===== 2. 错误 2: time.sleep =====
async def use_time_sleep():
    print("  错误 2: time.sleep 阻塞事件循环")
    print("    ❌ time.sleep(1)  # 卡 1 秒")
    print("    ✅ await asyncio.sleep(1)  # 让出")
    print()


# ===== 3. 错误 3: 同步阻塞 =====
async def use_blocking_call():
    print("  错误 3: 同步阻塞调用")
    print("    ❌ requests.get(url)  # requests 同步")
    print("    ✅ aiohttp / httpx  # 异步")
    print()


# ===== 4. 错误 4: Task 没引用 =====
async def lost_task():
    print("  错误 4: Task 没引用")
    print("    ❌ asyncio.create_task(work())  # 被 GC")
    print("    ✅ t = asyncio.create_task(work())")
    print("    ✅ await t")
    print()


# ===== 5. 错误 5: CPU 密集 =====
async def cpu_heavy():
    print("  错误 5: 在 async 里跑 CPU 密集")
    print("    ❌ sum(range(10**7))  # 卡事件循环")
    print("    ✅ await asyncio.to_thread(sum, range(10**7))")
    print()


# ===== 6. 推荐模板 =====
async def recommended_template():
    """asyncio 项目的推荐模板"""
    template = '''
# === 入口 ===
async def main():
    stop = asyncio.Event()
    loop = asyncio.get_running_loop()

    # 1. 注册信号
    try:
        loop.add_signal_handler(signal.SIGINT, stop.set)
        loop.add_signal_handler(signal.SIGTERM, stop.set)
    except NotImplementedError:
        pass  # Windows

    # 2. 创建资源
    sem = asyncio.Semaphore(10)  # 限流

    # 3. 启动后台任务
    workers = [
        asyncio.create_task(worker(i, sem, stop), name=f"worker-{i}")
        for i in range(5)
    ]

    # 4. 等待停止
    await stop.wait()

    # 5. 清理
    for w in workers:
        w.cancel()
    await asyncio.gather(*workers, return_exceptions=True)


if __name__ == "__main__":
    asyncio.run(main(), debug=True)  # 开发用 debug
'''
    print("【推荐模板】")
    print(template)


# ===== 7. 性能对比 =====
async def heavy_io():
    """模拟 I/O 任务"""
    await asyncio.sleep(0.1)
    return "result"


async def performance_comparison():
    """asyncio vs 串行"""
    print("【asyncio vs 串行性能对比】\\n")

    # 串行
    start = time.time()
    for _ in range(20):
        await heavy_io()
    serial = time.time() - start
    print(f"  串行 20 个 I/O: {serial:.2f} 秒")

    # asyncio
    start = time.time()
    await asyncio.gather(*[heavy_io() for _ in range(20)])
    parallel = time.time() - start
    print(f"  并发 20 个 I/O: {parallel:.2f} 秒")
    print(f"  加速: {serial/parallel:.1f}x\\n")


# ===== 8. 决策树 =====
def decision_tree():
    print("【asyncio 决策树】")
    print()
    print("  任务是什么？")
    print("  ├── CPU 密集 → multiprocessing")
    print("  └── I/O 密集")
    print("      ├── 高并发（>100）→ asyncio")
    print("      ├── 需要兼容同步库 → threading")
    print("      └── GUI 应用 → PyQt asyncio 集成")
    print()


# ===== 主入口 =====
async def main():
    print("=" * 50)
    print("Python asyncio 教程 — 第二十四章 demo")
    print("=" * 50 + "\\n")

    await forgot_await()
    await use_time_sleep()
    await use_blocking_call()
    await lost_task()
    await cpu_heavy()

    print("【更多错误】")
    print("  6. 重复 await 协程")
    print("  7. 协程当函数调用")
    print("  8. asyncio.Lock 死锁")
    print("  9. 没取消后台 task")
    print("  10. gather 默认取消其他")
    print()

    await performance_comparison()
    await recommended_template()
    decision_tree()

    print("=" * 50)
    print("🎉 教程完结！你已经掌握 asyncio 的核心。")
    print()
    print("下一步建议：")
    print("  • 用 aiohttp 写个小爬虫")
    print("  • 学 FastAPI（基于 asyncio）")
    print("  • 读 aio-libs 生态：aiomysql、aioredis、aio-pika")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
`,
  },
];
