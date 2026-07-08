// =============================================================
// Python asyncio 教程（pyasync）—— 第三批章节
// -------------------------------------------------------------
// 异步 I/O（10-14章）
//   第 10 章：异步 HTTP 请求（urllib 异步版 + 概念）
//   第 11 章：异步文件 I/O（asyncio 配合线程）
//   第 12 章：async with 异步上下文管理器
//   第 13 章：异步迭代器与异步生成器
//   第 14 章：异步队列：asyncio.Queue
// =============================================================

export const chapters = [
  // =========================================================
  // 第十章：异步 HTTP 请求
  // =========================================================
  {
    id: "pa-10",
    group: "异步 I/O",
    icon: "🌐",
    title: "异步 HTTP 请求",
    content: `## 一、asyncio 不直接发 HTTP

asyncio 是"框架"，不包含 HTTP 客户端。常用的异步 HTTP 库：

| 库 | 特点 |
|----|------|
| \`aiohttp\` | 全异步、客户端+服务端 |
| \`httpx\` | 现代 API、async/sync 都支持 |
| \`urllib3\` | 底层、好用，但需要配 asyncio |

## 二、asyncio + 异步 HTTP 的优势

并发抓 100 个 URL：

| 方式 | 耗时 |
|------|------|
| requests 串行 | 100 秒 |
| requests + ThreadPoolExecutor(20) | 5 秒 |
| aiohttp 并发 | 1 秒 |

## 三、httpx 示例（推荐）

\`\`\`python
import httpx
import asyncio

async def fetch(client, url):
    resp = await client.get(url)
    return resp.json()

async def main():
    urls = ["https://api.example.com/data"] * 10
    async with httpx.AsyncClient() as client:
        results = await asyncio.gather(
            *[fetch(client, url) for url in urls]
        )
\`\`\`

## 四、aiohttp 示例

\`\`\`python
import aiohttp
import asyncio

async def fetch(session, url):
    async with session.get(url) as resp:
        return await resp.json()

async def main():
    urls = ["https://api.example.com"] * 10
    async with aiohttp.ClientSession() as session:
        results = await asyncio.gather(
            *[fetch(session, url) for url in urls]
        )
\`\`\`

## 五、连接池

异步 HTTP 库默认维护连接池（keep-alive），避免每次新建 TCP 连接。

## 六、超时

\`\`\`python
# httpx
async with httpx.AsyncClient(timeout=5.0) as client:
    ...

# aiohttp
async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=5)) as session:
    ...
\`\`\`

## 七、限制并发数（信号量）

不要无限制并发，会被服务器 ban：

\`\`\`python
import asyncio

sem = asyncio.Semaphore(10)  # 最多 10 个并发

async def fetch_with_limit(session, url):
    async with sem:
        async with session.get(url) as resp:
            return await resp.json()
\`\`\`

## 八、实战：抓 100 个 URL

\`\`\`python
import httpx
import asyncio

async def fetch_all(urls, concurrency=10):
    sem = asyncio.Semaphore(concurrency)
    async with httpx.AsyncClient() as client:
        async def one(url):
            async with sem:
                resp = await client.get(url)
                return resp.status_code
        return await asyncio.gather(*[one(u) for u in urls])
\`\`\`

## 九、同步 vs 异步 HTTP 的关键差别

- **连接复用**：异步库自动 keep-alive
- **并发模式**：同步用线程池，异步用协程
- **资源开销**：协程比线程轻量得多

## 十、本章 demo

下面 demo 演示用 \`urllib.request\` 配合线程池模拟异步 HTTP，或纯异步模拟。**注意**：标准库没有原生异步 HTTP 客户端，demo 用纯 asyncio 模拟。
`,
    code: `"""
第十章 demo：异步 HTTP（标准库 + 模拟）
注意：
  - 标准库没有原生 async HTTP client
  - 本 demo 用 asyncio 模拟"网络请求"
  - 真实场景推荐 httpx / aiohttp

演示：
  1. 异步模拟 HTTP 请求
  2. 串行 vs 并发对比
  3. 信号量限流
  4. 超时控制
  5. 实战模板
"""

import asyncio
import time
import random


# ===== 1. 模拟异步 HTTP 客户端 =====
class FakeAsyncClient:
    """模拟 aiohttp / httpx 的简单异步 HTTP 客户端"""

    async def __aenter__(self):
        print("  [Client] 打开（创建连接池）")
        return self

    async def __aexit__(self, *args):
        print("  [Client] 关闭（释放连接池）")
        return False

    async def get(self, url):
        async def fake_request():
            # 模拟网络延迟 0.1~0.5 秒
            delay = random.uniform(0.1, 0.3)
            await asyncio.sleep(delay)
            # 模拟偶尔的失败
            if random.random() < 0.1:
                raise ConnectionError(f"连接 {url} 失败")
            return {
                "url": url,
                "status": 200,
                "delay": round(delay, 2),
            }
        # 用 wait_for 加超时；同时捕获模拟的连接错误，避免向上抛出
        try:
            return await asyncio.wait_for(fake_request(), timeout=2.0)
        except asyncio.TimeoutError:
            return {"url": url, "status": "TIMEOUT"}
        except ConnectionError as e:
            return {"url": url, "status": "ERROR", "error": str(e)}


# ===== 2. 串行 vs 并发 =====
async def fetch_all_serial(client, urls):
    """串行抓取"""
    results = []
    for url in urls:
        r = await client.get(url)
        results.append(r)
    return results


async def fetch_all_concurrent(client, urls):
    """并发抓取"""
    return await asyncio.gather(
        *[client.get(url) for url in urls]
    )


async def demo_serial_vs_concurrent():
    print("【1. 串行 vs 并发】")
    urls = [f"https://api.example.com/item/{i}" for i in range(20)]
    print(f"  抓 {len(urls)} 个 URL\\n")

    # 串行
    print("  --- 串行 ---")
    start = time.time()
    async with FakeAsyncClient() as client:
        results = await fetch_all_serial(client, urls)
    print(f"  串行耗时: {time.time()-start:.2f} 秒\\n")

    # 并发
    print("  --- 并发 ---")
    start = time.time()
    async with FakeAsyncClient() as client:
        results = await fetch_all_concurrent(client, urls)
    print(f"  并发耗时: {time.time()-start:.2f} 秒")
    print(f"  加速: {len(urls)}x\\n")


# ===== 3. 信号量限流 =====
async def demo_semaphore():
    print("【2. 信号量限流（避免被封）】")
    sem = asyncio.Semaphore(5)  # 最多 5 个并发
    urls = [f"https://api.example.com/item/{i}" for i in range(20)]

    async def fetch_with_limit(client, url):
        async with sem:  # 限制并发
            return await client.get(url)

    start = time.time()
    async with FakeAsyncClient() as client:
        results = await asyncio.gather(
            *[fetch_with_limit(client, url) for url in urls]
        )
    print(f"  限流 5 并发，抓 {len(urls)} URL")
    print(f"  耗时: {time.time()-start:.2f} 秒\\n")


# ===== 4. 超时控制 =====
async def demo_timeout():
    print("【3. 超时控制】")
    async with FakeAsyncClient() as client:
        # 给所有请求加 0.5 秒超时
        try:
            results = await asyncio.gather(
                *[client.get(f"https://api.example.com/{i}") for i in range(10)],
                return_exceptions=True,
            )
            timeouts = [r for r in results if isinstance(r, dict) and r.get("status") == "TIMEOUT"]
            print(f"  完成: {len(results)}, 超时: {len(timeouts)}\\n")
        except Exception as e:
            print(f"  请求出错: {e}\\n")


# ===== 5. 实战模板 =====
async def batch_fetch(urls, concurrency=10, timeout=5.0):
    """通用批量抓取函数"""
    sem = asyncio.Semaphore(concurrency)

    async def one(url):
        async with sem:
            try:
                async with FakeAsyncClient() as client:
                    return await asyncio.wait_for(
                        client.get(url), timeout=timeout,
                    )
            except asyncio.TimeoutError:
                return {"url": url, "status": "TIMEOUT"}

    return await asyncio.gather(*[one(url) for url in urls])


async def demo_practical_template():
    print("【4. 实战：通用抓取模板】")
    urls = [f"https://api.example.com/item/{i}" for i in range(30)]
    start = time.time()
    results = await batch_fetch(urls, concurrency=8, timeout=2.0)
    success = [r for r in results if isinstance(r, dict) and r.get("status") == 200]
    print(f"  URL 总数: {len(urls)}")
    print(f"  成功: {len(success)}")
    print(f"  失败: {len(urls) - len(success)}")
    print(f"  耗时: {time.time()-start:.2f} 秒")
    print(f"  并发度: 8\\n")


# ===== 主入口 =====
async def main():
    print("=" * 50)
    print("Python asyncio 教程 — 第十章 demo")
    print("=" * 50 + "\\n")

    await demo_serial_vs_concurrent()
    await demo_semaphore()
    await demo_timeout()
    await demo_practical_template()

    print("=" * 50)
    print("总结：")
    print("• 标准库没有原生 async HTTP 客户端")
    print("• 推荐用 httpx（API 现代）或 aiohttp")
    print("• Semaphore 限流，避免被封")
    print("• wait_for 控制每个请求的超时")
    print("• 异步 HTTP 比 ThreadPoolExecutor 还快")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
`,
  },

  // =========================================================
  // 第十一章：异步文件 I/O
  // =========================================================
  {
    id: "pa-11",
    group: "异步 I/O",
    icon: "📁",
    title: "异步文件 I/O",
    content: `## 一、asyncio 不直接支持文件 I/O

Python 标准库的 \`open()\` 是**同步阻塞**的。

\`\`\`python
async def read_file():
    # ❌ 会阻塞整个事件循环
    with open("a.txt") as f:
        return f.read()
\`\`\`

## 二、解决方案

| 方案 | 适用 |
|------|------|
| \`aiofiles\` 库 | 推荐，标准做法 |
| \`asyncio.to_thread\` | Python 3.9+，用线程池 |
| \`loop.run_in_executor\` | 旧 API，灵活但啰嗦 |

## 三、asyncio.to_thread（3.9+）

把同步函数放到线程池跑：

\`\`\`python
import asyncio

async def read_file():
    # 把同步的 open 放到线程
    def _read():
        with open("a.txt", encoding="utf-8") as f:
            return f.read()
    # 返回协程，在线程池跑
    content = await asyncio.to_thread(_read)
    return content
\`\`\`

**优点**：标准库，零依赖。

## 四、run_in_executor

\`\`\`python
import asyncio
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=4)

async def read_file():
    loop = asyncio.get_running_loop()
    content = await loop.run_in_executor(executor, sync_read)
    return content
\`\`\`

## 五、aiofiles 库

\`\`\`python
# pip install aiofiles
import aiofiles

async def read_file():
    async with aiofiles.open("a.txt", encoding="utf-8") as f:
        content = await f.read()
    return content
\`\`\`

**优点**：原生 async API，性能更好。

## 六、什么时候用异步文件 I/O？

- **小文件**：无所谓
- **大文件 + 高并发**：值得
- **普通项目**：用 \`to_thread\` 就够

## 七、文件读写的 3 种方式

### 1. 同步（默认）
\`\`\`python
with open("a.txt") as f:
    return f.read()
\`\`\`

### 2. to_thread（3.9+）
\`\`\`python
await asyncio.to_thread(lambda: open("a.txt").read())
\`\`\`

### 3. aiofiles
\`\`\`python
async with aiofiles.open("a.txt") as f:
    return await f.read()
\`\`\`

## 八、to_thread 实战

\`\`\`python
import asyncio
import tempfile
from pathlib import Path

async def read_files_concurrently(paths):
    def read_one(path):
        return Path(path).read_text(encoding="utf-8")

    # 并发读多个文件
    return await asyncio.gather(
        *[asyncio.to_thread(read_one, p) for p in paths]
    )
\`\`\`

## 九、性能差异

| 方式 | 1000 个小文件 |
|------|---------------|
| 同步串行 | 5 秒 |
| 同步 + ThreadPool(10) | 0.5 秒 |
| asyncio.to_thread | 0.5 秒 |
| aiofiles | 0.4 秒 |

## 十、本章 demo

下面 demo 演示 \`asyncio.to_thread\` 实现异步文件 I/O。
`,
    code: `"""
第十一章 demo：异步文件 I/O
演示：
  1. asyncio.to_thread 异步读文件
  2. 并发读多个文件
  3. 异步写文件
  4. 性能对比
  5. 实战模板
"""

import asyncio
import time
import tempfile
from pathlib import Path


# ===== 1. to_thread 基本用法 =====
async def read_file_async(path):
    """用 to_thread 异步读文件"""
    def _read():
        return Path(path).read_text(encoding="utf-8")
    return await asyncio.to_thread(_read)


async def write_file_async(path, content):
    """用 to_thread 异步写文件"""
    def _write():
        Path(path).write_text(content, encoding="utf-8")
    await asyncio.to_thread(_write)


async def demo_basic():
    print("【1. asyncio.to_thread 基本用法】")
    base = Path(tempfile.mkdtemp(prefix="pa11_"))
    p = base / "test.txt"
    p.write_text("Hello 异步文件", encoding="utf-8")

    # 异步读
    content = await read_file_async(p)
    print(f"  读到: {content!r}")
    print()


# ===== 2. 并发读多个文件 =====
async def demo_concurrent_read():
    print("【2. 并发读多个文件】")
    base = Path(tempfile.mkdtemp(prefix="pa11_c_"))
    files = []
    for i in range(20):
        f = base / f"file_{i}.txt"
        f.write_text(f"content of file {i}\\n" * 100, encoding="utf-8")
        files.append(f)

    start = time.time()
    contents = await asyncio.gather(
        *[read_file_async(f) for f in files]
    )
    elapsed = time.time() - start
    print(f"  并发读 {len(files)} 个文件")
    print(f"  耗时: {elapsed:.2f} 秒")
    print(f"  字符总数: {sum(len(c) for c in contents)}\\n")


# ===== 3. 串行 vs 并发 =====
async def demo_performance():
    print("【3. 性能对比】\\n")
    base = Path(tempfile.mkdtemp(prefix="pa11_p_"))
    files = []
    for i in range(20):
        f = base / f"file_{i}.txt"
        f.write_text(f"data {i}" * 1000, encoding="utf-8")
        files.append(f)

    # 串行
    start = time.time()
    for f in files:
        await read_file_async(f)
    serial = time.time() - start
    print(f"  串行: {serial:.2f} 秒")

    # 并发
    start = time.time()
    await asyncio.gather(*[read_file_async(f) for f in files])
    parallel = time.time() - start
    print(f"  并发: {parallel:.2f} 秒")
    print(f"  加速: {serial/parallel:.1f}x\\n")


# ===== 4. 异步写文件 =====
async def demo_async_write():
    print("【4. 异步写文件】")
    base = Path(tempfile.mkdtemp(prefix="pa11_w_"))
    out = base / "output.txt"

    # 并发写
    async def write_chunk(chunk_id):
        await write_file_async(
            base / f"chunk_{chunk_id}.txt",
            f"chunk {chunk_id}",
        )
    await asyncio.gather(*[write_chunk(i) for i in range(10)])
    print(f"  创建 10 个文件")
    print(f"  文件数: {len(list(base.glob('*.txt')))}\\n")


# ===== 5. 实战：批量处理 =====
async def batch_process(files, process_fn, concurrency=10):
    """批量处理文件（用信号量限流）"""
    sem = asyncio.Semaphore(concurrency)

    async def one(file):
        async with sem:
            return await asyncio.to_thread(process_fn, file)

    return await asyncio.gather(*[one(f) for f in files])


async def demo_batch():
    print("【5. 实战：批量处理文件】")
    base = Path(tempfile.mkdtemp(prefix="pa11_b_"))
    files = []
    for i in range(30):
        f = base / f"doc_{i}.txt"
        f.write_text(f"Doc {i}: some content", encoding="utf-8")
        files.append(f)

    def count_words(path):
        content = Path(path).read_text(encoding="utf-8")
        return len(content.split())

    start = time.time()
    word_counts = await batch_process(files, count_words, concurrency=8)
    print(f"  处理 {len(files)} 个文件")
    print(f"  总词数: {sum(word_counts)}")
    print(f"  耗时: {time.time()-start:.2f} 秒\\n")


# ===== 主入口 =====
async def main():
    print("=" * 50)
    print("Python asyncio 教程 — 第十一章 demo")
    print("=" * 50 + "\\n")

    await demo_basic()
    await demo_concurrent_read()
    await demo_performance()
    await demo_async_write()
    await demo_batch()

    print("=" * 50)
    print("总结：")
    print("• 标准 open 是阻塞的，asyncio 不能直接用")
    print("• asyncio.to_thread 把同步函数丢到线程池")
    print("• aiofiles 是原生异步文件库（需安装）")
    print("• 用 Semaphore 限流，避免线程太多")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
`,
  },

  // =========================================================
  // 第十二章：async with 异步上下文管理器
  // =========================================================
  {
    id: "pa-12",
    group: "异步 I/O",
    icon: "🤝",
    title: "async with 异步上下文管理器",
    content: `## 一、什么是 async with？

\`async with\` = 异步版的 \`with\`，用于异步上下文管理器。

\`\`\`python
async with aiofiles.open("a.txt") as f:
    content = await f.read()
# 自动关闭（异步）
\`\`\`

## 二、async with vs with

| 维度 | \`with\` | \`async with\` |
|------|---------|----------------|
| 用于 | 同步对象 | 异步对象 |
| 进入时 | \`__enter__\` | \`__aenter__\` |
| 退出时 | \`__exit__\` | \`__aexit__\` |
| 返回 | self | awaitable |

## 三、内置异步上下文管理器

\`\`\`python
# asyncio.timeout
async with asyncio.timeout(3.0):
    ...

# asyncio.Lock
lock = asyncio.Lock()
async with lock:
    ...

# aiohttp ClientSession
async with aiohttp.ClientSession() as session:
    ...
\`\`\`

## 四、__aenter__ 和 __aexit__

\`\`\`python
class AsyncResource:
    async def __aenter__(self):
        # 异步获取资源
        await asyncio.sleep(0.1)
        print("  获取资源")
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        # 异步释放资源
        await asyncio.sleep(0.1)
        print("  释放资源")
        return False
\`\`\`

## 五、async with 的好处

1. **保证释放资源**（即使异常）
2. **释放过程也可以异步**（关闭连接等）
3. **代码更简洁**

## 六、用 @asynccontextmanager 装饰器

\`\`\`python
from contextlib import asynccontextmanager

@asynccontextmanager
async def my_resource():
    # 初始化（异步）
    print("  初始化")
    await asyncio.sleep(0.1)
    resource = {"data": "value"}
    try:
        yield resource
    finally:
        # 清理（异步）
        print("  清理")
        await asyncio.sleep(0.1)

async def main():
    async with my_resource() as r:
        print(f"  使用: {r}")
\`\`\`

## 七、嵌套 async with

\`\`\`python
async def main():
    # 嵌套使用（先入后出）
    async with resource1() as r1:
        async with resource2() as r2:
            # r2 关闭 → r1 关闭
            ...
\`\`\`

## 八、实战：异步数据库连接

\`\`\`python
class AsyncDBConnection:
    async def __aenter__(self):
        # 模拟连接数据库（异步）
        await asyncio.sleep(0.1)
        self.conn = {"connected": True}
        return self.conn

    async def __aexit__(self, *args):
        # 模拟关闭连接
        await asyncio.sleep(0.1)
        self.conn = None
        return False

async def main():
    async with AsyncDBConnection() as conn:
        # 模拟查询
        await asyncio.sleep(0.1)
        result = conn
    # 连接已关闭
\`\`\`

## 九、async with 异常处理

\`\`\`python
async def main():
    try:
        async with AsyncDBConnection() as conn:
            raise ValueError("查询失败")
    except ValueError as e:
        # __aexit__ 已经清理
        print(f"捕获: {e}")
\`\`\`

## 十、本章 demo

下面 demo 演示各种 \`async with\` 用法。
`,
    code: `"""
第十二章 demo：async with 异步上下文管理器
演示：
  1. 自定义 async with 类
  2. @asynccontextmanager 装饰器
  3. 嵌套 async with
  4. 异常处理
  5. 实战：异步资源管理
"""

import asyncio
from contextlib import asynccontextmanager


# ===== 1. 自定义 async with 类 =====
class AsyncDB:
    """模拟异步数据库连接"""
    def __init__(self, name):
        self.name = name
        self.connected = False

    async def __aenter__(self):
        # 模拟连接
        await asyncio.sleep(0.1)
        self.connected = True
        print(f"  [DB:{self.name}] 已连接")
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        # 模拟关闭
        await asyncio.sleep(0.05)
        self.connected = False
        if exc_type:
            print(f"  [DB:{self.name}] 异常退出: {exc_type.__name__}")
        else:
            print(f"  [DB:{self.name}] 正常关闭")
        return False  # 不吞异常

    async def query(self, sql):
        await asyncio.sleep(0.1)
        return f"[{self.name}] {sql} 的结果"


async def demo_custom_class():
    print("【1. 自定义 async with 类】")
    async with AsyncDB("main") as db:
        result = await db.query("SELECT * FROM users")
        print(f"  查询: {result}\\n")


# ===== 2. @asynccontextmanager 装饰器 =====
@asynccontextmanager
async def timer(name):
    """异步计时器"""
    print(f"  [{name}] 开始")
    start = asyncio.get_event_loop().time()
    try:
        yield {"name": name, "start": start}
    finally:
        elapsed = asyncio.get_event_loop().time() - start
        print(f"  [{name}] 结束: {elapsed:.2f} 秒")


async def demo_decorator():
    print("【2. @asynccontextmanager 装饰器】")
    async with timer("block1") as ctx:
        await asyncio.sleep(0.3)
        print(f"  ctx 内容: {ctx}")
    print()


# ===== 3. 嵌套 async with =====
async def demo_nested():
    print("【3. 嵌套 async with】")
    print("  顺序: outer 进 → inner 进 → inner 出 → outer 出\\n")
    async with AsyncDB("outer") as db1:
        async with AsyncDB("inner") as db2:
            r1 = await db1.query("SELECT 1")
            r2 = await db2.query("SELECT 2")
            print(f"  结果1: {r1}")
            print(f"  结果2: {r2}")
    print()


# ===== 4. 异常处理 =====
async def demo_exception():
    print("【4. async with 异常处理】\\n")

    # 块内异常
    print("  --- 块内异常 ---")
    try:
        async with AsyncDB("with_error") as db:
            raise ValueError("业务逻辑出错")
    except ValueError as e:
        print(f"  捕获: {e}\\n")

    # 正常退出
    print("  --- 正常退出 ---")
    async with AsyncDB("normal") as db:
        await db.query("SELECT 1")
    print()


# ===== 5. 实战：连接池 =====
class AsyncConnectionPool:
    """模拟异步连接池"""
    def __init__(self, size=3):
        self.size = size
        self.pool = asyncio.Queue(maxsize=size)
        for i in range(size):
            self.pool.put_nowait(AsyncDB(f"conn{i}"))

    @asynccontextmanager
    async def acquire(self):
        # 异步获取连接
        conn = await self.pool.get()
        try:
            yield conn
        finally:
            # 异步归还
            await self.pool.put(conn)


async def demo_connection_pool():
    print("【5. 实战：异步连接池】")
    pool = AsyncConnectionPool(size=2)

    async def worker(i):
        async with pool.acquire() as conn:
            print(f"  Worker {i} 拿到连接 {conn.name}")
            await asyncio.sleep(0.2)
            await conn.query(f"任务 {i}")

    await asyncio.gather(*[worker(i) for i in range(5)])
    print()


# ===== 6. 超时上下文 =====
async def demo_timeout_context():
    print("【6. asyncio.timeout 上下文】")
    try:
        async with asyncio.timeout(0.5):
            await asyncio.sleep(2.0)
    except (asyncio.TimeoutError, TimeoutError):
        print(f"  超时退出\\n")
    except AttributeError:
        print("  ⚠️  当前 Python 不支持 asyncio.timeout\\n")


# ===== 主入口 =====
async def main():
    print("=" * 50)
    print("Python asyncio 教程 — 第十二章 demo")
    print("=" * 50 + "\\n")

    await demo_custom_class()
    await demo_decorator()
    await demo_nested()
    await demo_exception()
    await demo_connection_pool()
    await demo_timeout_context()

    print("=" * 50)
    print("总结：")
    print("• async with 用于异步资源管理")
    print("• 自定义类实现 __aenter__ / __aexit__")
    print("• @asynccontextmanager 装饰器更简单")
    print("• 嵌套使用，先入后出")
    print("• 异常时 __aexit__ 也会执行")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
`,
  },

  // =========================================================
  // 第十三章：异步迭代器与异步生成器
  // =========================================================
  {
    id: "pa-13",
    group: "异步 I/O",
    icon: "🔄",
    title: "异步迭代器与异步生成器",
    content: `## 一、什么是异步迭代器？

普通迭代器用 \`for x in iter\`，异步迭代器用 \`async for x in iter\`。

\`\`\`python
async for x in async_iter:
    print(x)
\`\`\`

## 二、async for 的内部协议

\`\`\`python
class AsyncIterator:
    def __aiter__(self):
        return self

    async def __anext__(self):
        # 异步获取下一个值
        if no_more:
            raise StopAsyncIteration
        return value
\`\`\`

## 三、自定义异步迭代器

\`\`\`python
class AsyncCounter:
    def __init__(self, limit):
        self.limit = limit
        self.i = 0

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self.i >= self.limit:
            raise StopAsyncIteration
        await asyncio.sleep(0.1)
        self.i += 1
        return self.i

async def main():
    async for i in AsyncCounter(5):
        print(i)  # 1, 2, 3, 4, 5
\`\`\`

## 四、async for vs for

| 维度 | \`for\` | \`async for\` |
|------|---------|---------------|
| 协议 | \`__iter__\`/\`__next__\` | \`__aiter__\`/\`__anext__\` |
| 获取值 | 同步 | await |
| 结束 | \`StopIteration\` | \`StopAsyncIteration\` |
| 迭代器协议 | 同步 | 异步 |

## 五、异步生成器

用 \`async def\` + \`yield\`：

\`\`\`python
async def async_gen():
    for i in range(5):
        await asyncio.sleep(0.1)
        yield i

async def main():
    async for i in async_gen():
        print(i)
\`\`\`

**简洁！** 比手写类方便得多。

## 六、异步生成器的 5 个特性

1. **可暂停**：\`yield\` 处暂停，调用方 \`__anext__\` 唤醒
2. **支持 send**：\`gen.send(value)\`
3. **支持 throw**：\`gen.throw(exc)\`
4. **支持 close**：\`gen.close()\`
5. **可以在 yield 处 await**：

\`\`\`python
async def gen():
    await asyncio.sleep(0.1)  # ✅ async def 里可以 await
    yield 1
\`\`\`

## 七、异步列表推导式

Python 没有原生 async list comprehension，但可以用 \`async for\` 收集：

\`\`\`python
async def collect():
    results = []
    async for x in async_gen():
        results.append(x)
    return results
\`\`\`

或者用 list comprehension 包异步生成器：

\`\`\`python
async def collect():
    return [x async for x in async_gen()]
# 实际上还是异步迭代
\`\`\`

## 八、实战：异步分页

\`\`\`python
async def fetch_all_pages(api_url):
    """分页获取所有数据"""
    page = 1
    while True:
        data = await fetch_page(api_url, page)
        if not data:
            break
        for item in data:
            yield item
        page += 1

async def main():
    async for item in fetch_all_pages("/api/users"):
        process(item)
\`\`\`

## 九、内置异步迭代器

\`\`\`python
# asyncio 的 StreamReader
async for line in reader:
    print(line)
\`\`\`

## 十、本章 demo

下面 demo 演示异步迭代器和生成器。
`,
    code: `"""
第十三章 demo：异步迭代器与异步生成器
演示：
  1. 自定义异步迭代器
  2. 异步生成器
  3. async for 用法
  4. send / throw / close
  5. 实战：异步分页
"""

import asyncio


# ===== 1. 自定义异步迭代器 =====
class AsyncCounter:
    """异步计数器"""
    def __init__(self, limit, delay=0.1):
        self.limit = limit
        self.delay = delay
        self.i = 0

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self.i >= self.limit:
            raise StopAsyncIteration
        await asyncio.sleep(self.delay)
        self.i += 1
        return self.i


async def demo_custom_iterator():
    print("【1. 自定义异步迭代器】")
    async for i in AsyncCounter(5):
        print(f"  计数: {i}")
    print()


# ===== 2. 异步生成器 =====
async def async_gen_fib(limit):
    """异步生成斐波那契数列"""
    a, b = 0, 1
    while a < limit:
        await asyncio.sleep(0.1)  # 模拟异步工作
        yield a
        a, b = b, a + b


async def demo_async_gen():
    print("【2. 异步生成器（斐波那契）】")
    async for n in async_gen_fib(100):
        print(f"  {n}")
    print()


# ===== 3. 异步分页 =====
async def fetch_page(page):
    """模拟分页 API"""
    await asyncio.sleep(0.1)
    # 假设总共 3 页
    if page > 3:
        return []
    return [{"id": i, "page": page} for i in range(3)]


async def async_paginate(api_url):
    """异步分页生成器"""
    page = 1
    while True:
        data = await fetch_page(page)
        if not data:
            break
        for item in data:
            yield item
        page += 1


async def demo_paginate():
    print("【3. 实战：异步分页】")
    items = []
    async for item in async_paginate("/api/users"):
        items.append(item)
    print(f"  拿到 {len(items)} 条数据")
    print(f"  示例: {items[0]}\\n")


# ===== 4. send / throw / close =====
async def echo_gen():
    """支持 send 的生成器"""
    while True:
        try:
            value = yield
            print(f"  收到: {value}")
        except ValueError as e:
            print(f"  抛错: {e}")


async def demo_send_throw():
    print("【4. send / throw / close】")
    gen = echo_gen()
    await gen.__anext__()  # 启动
    await gen.asend("hello")
    await gen.asend("world")
    await gen.athrow(ValueError("测试抛错"))
    await gen.aclose()
    print()


# ===== 5. 异步列表 =====
async def async_list_comprehension():
    """异步列表收集"""
    return [i async for i in AsyncCounter(5)]


async def demo_async_list():
    print("【5. 异步列表收集】")
    result = await async_list_comprehension()
    print(f"  结果: {result}\\n")


# ===== 6. 并发处理异步迭代 =====
async def process_concurrent(async_iter, n_concurrent=3):
    """并发处理异步迭代器的元素"""
    sem = asyncio.Semaphore(n_concurrent)

    async def one(item):
        async with sem:
            await asyncio.sleep(0.1)  # 模拟处理
            return item * 2

    return await asyncio.gather(*[one(i) async for i in async_iter])


async def demo_concurrent_process():
    print("【6. 并发处理异步迭代器】")
    results = await process_concurrent(AsyncCounter(10, delay=0.05))
    print(f"  并发处理 10 个，结果: {results[:5]}...\\n")


# ===== 主入口 =====
async def main():
    print("=" * 50)
    print("Python asyncio 教程 — 第十三章 demo")
    print("=" * 50 + "\\n")

    await demo_custom_iterator()
    await demo_async_gen()
    await demo_paginate()
    await demo_send_throw()
    await demo_async_list()
    await demo_concurrent_process()

    print("=" * 50)
    print("总结：")
    print("• __aiter__ / __anext__ 是异步迭代协议")
    print("• async def + yield 是异步生成器")
    print("• 异步生成器支持 send / throw / close")
    print("• async for 必须用 StopAsyncIteration")
    print("• 实战中常用异步分页")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
`,
  },

  // =========================================================
  // 第十四章：异步队列：asyncio.Queue
  // =========================================================
  {
    id: "pa-14",
    group: "异步 I/O",
    icon: "🚧",
    title: "异步队列：asyncio.Queue",
    content: `## 一、生产者-消费者模式

经典场景：
- **生产者**：产生任务（爬虫 URL、订单数据）
- **消费者**：处理任务（下载、计算）
- **队列**：连接生产者和消费者

\`\`\`python
queue = asyncio.Queue()
\`\`\`

## 二、asyncio.Queue 基础

\`\`\`python
queue = asyncio.Queue(maxsize=10)  # 有界队列

# 放
await queue.put(item)

# 取
item = await queue.get()

# 队列大小
size = queue.qsize()

# 标记任务完成
queue.task_done()

# 等待所有任务完成
await queue.join()
\`\`\`

## 三、生产者-消费者示例

\`\`\`python
async def producer(queue):
    for i in range(5):
        await asyncio.sleep(0.1)
        await queue.put(i)

async def consumer(queue):
    while True:
        item = await queue.get()
        await process(item)
        queue.task_done()

async def main():
    q = asyncio.Queue()
    prod = asyncio.create_task(producer(q))
    cons = asyncio.create_task(consumer(q))
    await q.join()  # 等待队列空
    cons.cancel()  # 停掉消费者
\`\`\`

## 四、Queue 的方法

| 方法 | 行为 |
|------|------|
| \`put(item)\` | 阻塞放入（队列满时等） |
| \`put_nowait(item)\` | 不阻塞，满了抛异常 |
| \`get()\` | 阻塞取出 |
| \`get_nowait()\` | 不阻塞，空了抛异常 |
| \`task_done()\` | 标记 get 的任务完成 |
| \`join()\` | 等待所有 task_done |
| \`qsize()\` | 队列大小 |
| \`empty()\` | 是否空 |
| \`full()\` | 是否满 |

## 五、有界 vs 无界

\`\`\`python
# 无界：永远不阻塞 put（小心内存）
q = asyncio.Queue()

# 有界：put 时如果满了会阻塞
q = asyncio.Queue(maxsize=10)
\`\`\`

**推荐用有界队列**：防止内存爆炸。

## 六、LIFO 队列

\`\`\`python
q = asyncio.LifoQueue()  # 后进先出（栈）
\`\`\`

## 七、优先级队列

\`\`\`python
q = asyncio.PriorityQueue()
await q.put((1, "high priority"))
await q.put((5, "low priority"))
item = await q.get()  # (1, "high priority")
\`\`\`

## 八、Queue 的 worker 模式

\`\`\`python
async def worker(name, queue):
    while True:
        try:
            item = await asyncio.wait_for(queue.get(), timeout=1.0)
        except asyncio.TimeoutError:
            return  # 超时退出
        await process(item)
        queue.task_done()

async def main():
    q = asyncio.Queue()
    # 多个 worker 并发消费
    workers = [
        asyncio.create_task(worker(f"w{i}", q))
        for i in range(3)
    ]
    # 投放任务
    for i in range(10):
        await q.put(i)
    await q.join()
    # 取消 worker
    for w in workers:
        w.cancel()
\`\`\`

## 九、Queue 的陷阱

1. **消费者死循环**：必须找机会退出
2. **队列空时 get 阻塞**：用超时或哨兵值
3. **task_done 必须调用**：否则 join 永远阻塞
4. **maxsize 选错**：太大耗内存，太小限流

## 十、本章 demo

下面 demo 演示各种 Queue 用法。
`,
    code: `"""
第十四章 demo：asyncio.Queue 异步队列
演示：
  1. 基本生产者-消费者
  2. 多个 worker 并发
  3. 有界队列限流
  4. 优先级队列
  5. 实战：异步任务池
"""

import asyncio
import time
import random


# ===== 1. 基本生产者-消费者 =====
async def basic_producer(queue, n):
    for i in range(n):
        await asyncio.sleep(0.05)  # 模拟生产耗时
        item = f"item-{i}"
        await queue.put(item)
        print(f"  生产: {item}, 队列大小: {queue.qsize()}")


async def basic_consumer(queue, name):
    while True:
        item = await queue.get()
        print(f"  消费[{name}]: {item}")
        await asyncio.sleep(0.1)  # 模拟处理
        queue.task_done()


async def demo_basic():
    print("【1. 基本生产者-消费者】")
    queue = asyncio.Queue()
    # 启动一个消费者
    consumer_task = asyncio.create_task(basic_consumer(queue, "c1"))
    # 生产 5 个
    await basic_producer(queue, 5)
    # 等待队列清空
    await queue.join()
    consumer_task.cancel()
    try:
        await consumer_task
    except asyncio.CancelledError:
        pass
    print()


# ===== 2. 多个 worker =====
async def worker(name, queue):
    while True:
        try:
            item = await asyncio.wait_for(queue.get(), timeout=0.5)
        except asyncio.TimeoutError:
            return
        print(f"  Worker {name} 处理: {item}")
        await asyncio.sleep(random.uniform(0.05, 0.2))
        queue.task_done()


async def demo_multi_worker():
    print("【2. 多个 worker 并发消费】")
    queue = asyncio.Queue()
    # 3 个 worker
    workers = [asyncio.create_task(worker(f"w{i}", queue)) for i in range(3)]
    # 投放 10 个任务
    for i in range(10):
        await queue.put(f"job-{i}")
    # 等待完成
    await queue.join()
    # 等所有 worker 退出
    await asyncio.gather(*workers)
    print()


# ===== 3. 有界队列 =====
async def bounded_producer(queue, n):
    for i in range(n):
        # put 会等到有空位
        await queue.put(f"bounded-{i}")
        print(f"  生产: bounded-{i}")


async def bounded_consumer(queue):
    for _ in range(5):
        item = await queue.get()
        print(f"  消费: {item}")
        await asyncio.sleep(0.1)
        queue.task_done()


async def demo_bounded():
    print("【3. 有界队列（限流）】")
    print("  maxsize=3，队列满时 put 阻塞\\n")
    queue = asyncio.Queue(maxsize=3)
    # 启动消费者
    consumer_task = asyncio.create_task(bounded_consumer(queue))
    # 生产
    await bounded_producer(queue, 5)
    await queue.join()
    await consumer_task
    print()


# ===== 4. 优先级队列 =====
async def demo_priority():
    print("【4. PriorityQueue（优先级队列）】")
    q = asyncio.PriorityQueue()
    # 数字越小优先级越高
    await q.put((3, "low"))
    await q.put((1, "high"))
    await q.put((2, "mid"))
    while not q.empty():
        priority, item = await q.get()
        print(f"  取出: 优先级={priority}, {item}")
    print()


# ===== 5. 实战：异步任务池 =====
class AsyncTaskPool:
    """异步任务池：投放任务，多 worker 并发处理"""
    def __init__(self, num_workers=3, max_queue=10):
        self.num_workers = num_workers
        self.queue = asyncio.Queue(maxsize=max_queue)
        self.workers = []
        self.running = False

    async def start(self):
        self.running = True
        for i in range(self.num_workers):
            self.workers.append(
                asyncio.create_task(self._worker(f"w{i}"))
            )

    async def stop(self):
        # 放哨兵让 worker 退出
        for _ in range(self.num_workers):
            await self.queue.put(None)
        await asyncio.gather(*self.workers, return_exceptions=True)
        self.running = False

    async def submit(self, task):
        await self.queue.put(task)

    async def join(self):
        await self.queue.join()

    async def _worker(self, name):
        while True:
            task = await self.queue.get()
            if task is None:  # 哨兵
                self.queue.task_done()
                return
            try:
                if asyncio.iscoroutine(task):
                    result = await task
                    print(f"  [{name}] 完成: {result}")
                else:
                    result = task()  # 普通函数
                    print(f"  [{name}] 完成: {result}")
            except Exception as e:
                print(f"  [{name}] 异常: {e}")
            finally:
                self.queue.task_done()


async def demo_task_pool():
    print("【5. 实战：异步任务池】")
    pool = AsyncTaskPool(num_workers=3, max_queue=5)
    await pool.start()

    # 投放任务
    for i in range(10):
        async def task(i=i):
            await asyncio.sleep(random.uniform(0.05, 0.15))
            return f"task-{i}"
        await pool.submit(task)

    await pool.join()
    await pool.stop()
    print()


# ===== 主入口 =====
async def main():
    print("=" * 50)
    print("Python asyncio 教程 — 第十四章 demo")
    print("=" * 50 + "\\n")

    await demo_basic()
    await demo_multi_worker()
    await demo_bounded()
    await demo_priority()
    await demo_task_pool()

    print("=" * 50)
    print("总结：")
    print("• asyncio.Queue 是生产-消费的核心")
    print("• maxsize 限制队列大小（防内存爆炸）")
    print("• 多 worker 并发消费")
    print("• PriorityQueue 处理优先级")
    print("• 哨兵值（None）让 worker 优雅退出")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
`,
  },
];
