// =============================================================
// Python asyncio 教程 V2（pyasync2）—— 第三批章节
// -------------------------------------------------------------
// 异步 I/O 和工具（10-14章）
//   第 10 章：asyncio.sleep 模拟 I/O
//   第 11 章：异步上下文管理器 async with
//   第 12 章：异步迭代器 async for
//   第 13 章：asyncio.to_thread 运行同步代码
//   第 14 章：异步队列 asyncio.Queue
// =============================================================

export const chapters = [
  // =========================================================
  // 第十章：asyncio.sleep 模拟 I/O
  // =========================================================
  {
    id: "pa2-10",
    group: "异步 I/O 和工具",
    icon: "💤",
    title: "asyncio.sleep 模拟 I/O",
    content: `## 一、asyncio.sleep 是什么？

\`asyncio.sleep(delay)\` 是 asyncio 里**非阻塞的等待**。

\`\`\`python
await asyncio.sleep(1)  # 让出 CPU 1 秒
\`\`\`

它不会阻塞整个线程，只是让当前协程暂停，事件循环可以执行其它任务。

## 二、与时间模块 sleep 的区别

| 写法 | 是否阻塞 | 是否让出 CPU |
|------|----------|--------------|
| \`time.sleep(1)\` | 阻塞线程 | 否 |
| \`await asyncio.sleep(1)\` | 不阻塞 | 是 |

## 三、为什么用 asyncio.sleep 做 demo？

因为真实的网络 I/O 需要外部依赖（如 aiohttp），为了教学方便，我们用 \`asyncio.sleep\` 来模拟等待时间。

## 四、基本用法

\`\`\`python
async def work():
    print("开始")
    await asyncio.sleep(1)  # 模拟 1 秒 I/O
    print("结束")
\`\`\`

## 五、多个 sleep 并发

\`\`\`python
await asyncio.gather(
    asyncio.sleep(1),
    asyncio.sleep(1),
    asyncio.sleep(1),
)
# 总耗时 1 秒，不是 3 秒
\`\`\`

## 六、本章 demo

演示 asyncio.sleep 的行为。
`,
    code: `"""
第十章 demo：asyncio.sleep 模拟 I/O
目标：理解 asyncio.sleep 不阻塞事件循环。
"""
import asyncio
import time


# ===== 1. asyncio.sleep 不阻塞 =====
async def ticker(name, interval, count):
    """定时打印"""
    for i in range(count):
        print(f"  [{name}] tick {i+1}")
        await asyncio.sleep(interval)


async def main1():
    print("=== 1. asyncio.sleep 不阻塞 ===")
    start = time.time()
    await asyncio.gather(
        ticker("A", 0.2, 3),
        ticker("B", 0.3, 3),
    )
    print(f"  总耗时: {time.time() - start:.2f} 秒")


asyncio.run(main1())
print()


# ===== 2. 模拟网络请求延迟 =====
async def fetch(url, latency):
    """模拟网页请求"""
    print(f"  [请求] {url}")
    await asyncio.sleep(latency)
    print(f"  [响应] {url}（延迟 {latency} 秒）")
    return f"{url} 内容"


async def main2():
    print("=== 2. 模拟多个网页请求 ===")
    start = time.time()
    results = await asyncio.gather(
        fetch("https://site-a.com", 0.5),
        fetch("https://site-b.com", 0.3),
        fetch("https://site-c.com", 0.8),
    )
    print(f"  结果: {results}")
    print(f"  总耗时: {time.time() - start:.2f} 秒")


asyncio.run(main2())
print()


# ===== 3. time.sleep 会阻塞 =====
def blocking_task(name, delay):
    """同步阻塞任务"""
    print(f"  [{name}] 开始阻塞")
    time.sleep(delay)
    print(f"  [{name}] 阻塞结束")


async def mixed():
    print("=== 3. 在 async 里调用 time.sleep 会阻塞 ===")
    start = time.time()
    blocking_task("同步任务", 0.5)
    await asyncio.sleep(0.1)
    print(f"  总耗时: {time.time() - start:.2f} 秒")


asyncio.run(mixed())
print()


# ===== 4. 倒计时 =====
async def countdown(seconds):
    print(f"=== 4. 倒计时 {seconds} 秒 ===")
    for i in range(seconds, 0, -1):
        print(f"  还剩 {i} 秒")
        await asyncio.sleep(1)
    print("  时间到！")


asyncio.run(countdown(3))
print()


# ===== 5. sleep 期间可以做其它事 =====
async def background():
    print("  [后台任务] 开始")
    for i in range(5):
        await asyncio.sleep(0.2)
        print(f"  [后台任务] 进度 {i+1}/5")
    print("  [后台任务] 完成")


async def main5():
    print("=== 5. 主任务等待时，后台任务继续 ===")
    task = asyncio.create_task(background())
    print("  [主任务] 开始等待 1 秒")
    await asyncio.sleep(1)
    print("  [主任务] 等待结束")
    await task


asyncio.run(main5())
`,
  },

  // =========================================================
  // 第十一章：异步上下文管理器 async with
  // =========================================================
  {
    id: "pa2-11",
    group: "异步 I/O 和工具",
    icon: "🚪",
    title: "异步上下文管理器 async with",
    content: `## 一、什么是异步上下文管理器？

和 \`with\` 类似，但进入和退出都是异步的：

\`\`\`python
async with resource as r:
    await r.do_something()
\`\`\`

## 二、实现方法

类需要实现 \`__aenter__\` 和 \`__aexit__\`：

\`\`\`python
class AsyncResource:
    async def __aenter__(self):
        await self.connect()
        return self

    async def __aexit__(self, exc_type, exc, tb):
        await self.close()
\`\`\`

## 三、应用场景

- 异步数据库连接
- 异步文件操作
- 异步锁
- 异步 HTTP 会话

## 四、对比同步 with

| 同步 | 异步 |
|------|------|
| \`__enter__\` / \`__exit__\` | \`__aenter__\` / \`__aexit__\` |
| \`with\` | \`async with\` |
| 同步资源 | 异步资源 |

## 五、本章 demo

演示 async with 的用法。
`,
    code: `"""
第十一章 demo：异步上下文管理器
目标：理解 async with 的用法和实现。
"""
import asyncio


# ===== 1. 自定义异步资源 =====
class AsyncConnection:
    """模拟异步连接"""

    def __init__(self, host):
        self.host = host
        self.connected = False

    async def __aenter__(self):
        print(f"  [连接] 正在连接 {self.host}...")
        await asyncio.sleep(0.3)
        self.connected = True
        print(f"  [连接] {self.host} 已连接")
        return self

    async def __aexit__(self, exc_type, exc, tb):
        print(f"  [断开] 正在关闭 {self.host}...")
        await asyncio.sleep(0.2)
        self.connected = False
        print(f"  [断开] {self.host} 已关闭")
        # 返回 False 让异常继续传播
        return False

    async def query(self, sql):
        if not self.connected:
            raise RuntimeError("未连接")
        await asyncio.sleep(0.2)
        return f"[{self.host}] {sql} 的查询结果"


async def main1():
    print("=== 1. async with 基本用法 ===")
    async with AsyncConnection("db.example.com") as conn:
        result = await conn.query("SELECT * FROM users")
        print(f"  {result}")
    print("  with 块结束，连接自动关闭")


asyncio.run(main1())
print()


# ===== 2. 异常时也会关闭 =====
async def main2():
    print("=== 2. 异常时自动释放资源 ===")
    try:
        async with AsyncConnection("db.example.com") as conn:
            result = await conn.query("SELECT * FROM users")
            print(f"  {result}")
            raise ValueError("模拟查询失败")
    except ValueError as e:
        print(f"  捕获异常: {e}")
        print("  连接仍然被正确关闭")


asyncio.run(main2())
print()


# ===== 3. 异步锁 =====
class Shared