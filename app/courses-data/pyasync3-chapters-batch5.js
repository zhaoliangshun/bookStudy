// =============================================================
// Python asyncio 教程 V3（pyasync3）—— 第五批章节
// -------------------------------------------------------------
// 实战项目（17-20章）
//   第 17 章：asyncio.to_thread 跑同步代码
//   第 18 章：实战 —— 异步爬虫
//   第 19 章：实战 —— 生产者消费者队列
//   第 20 章：最佳实践与总结
// =============================================================

export const chapters = [
  // =========================================================
  // 第十七章：asyncio.to_thread 跑同步代码
  // =========================================================
  {
    id: "pa3-17",
    group: "实战项目",
    icon: "🧵",
    title: "asyncio.to_thread 跑同步代码",
    content: `## 一、先看一个 demo

同步函数里写了 \`time.sleep(0.5)\`，在协程里直接调用 vs 用 \`asyncio.to_thread\` 包一下：

\`\`\`python
import asyncio, time

def blocking():
    time.sleep(0.5)

async def main():
    blocking()                          # 直接调：卡住循环
    await asyncio.to_thread(blocking)   # 放线程池：不卡

asyncio.run(main())
\`\`\`

差距在哪？直接调用时，整个事件循环被 \`time.sleep\` 冻住；用 \`to_thread\` 后，阻塞被丢到线程池，循环还能继续跑别的协程。

## 二、为什么要 to_thread？

生活类比：你在厨房做菜（事件循环），突然要烧一锅水（阻塞 5 分钟）。

- 直接等：你站那儿盯着水壶，啥也干不了。
- to_thread：让小弟（线程）去烧水，你继续炒菜。

## 三、知识点（从 demo 提取）

| 知识点 | 说明 |
|--------|------|
| 同步阻塞会卡住循环 | \`time.sleep\` / \`requests.get\` 会冻住整个事件循环 |
| 把同步函数放线程池 | \`await asyncio.to_thread(func, *args)\` |
| 使用场景 | 第三方同步库、文件 IO、CPU 计算 |
| 参数传递 | \`to_thread(func, arg1, arg2)\` 自动传给 func |
| 返回值 | \`await\` 拿到 func 的返回值 |
| 与多线程区别 | to_thread 只借线程池跑一个函数，不手动管线程 |

## 四、demo 目标

6 个小 demo 跑一遍，体会 to_thread 的作用。
`,
    code: `"""
第十七章 demo：asyncio.to_thread 跑同步代码
目标：把同步阻塞函数丢到线程池，不卡住事件循环。
"""
import asyncio
import time


# ===== 1. 直接调用同步函数（阻塞事件循环）=====
def blocking_func():
    """一个会阻塞 0.5 秒的同步函数。"""
    time.sleep(0.5)


async def demo1_direct_call():
    print("【1. 直接调用同步函数（会阻塞）】")
    start = time.time()
    # 直接调用：整个事件循环被卡住 0.5 秒
    blocking_func()
    print(f"  直接调用耗时: {time.time() - start:.2f}s")
    print("  ⚠️  这 0.5 秒里，事件循环什么都干不了\\n")


# ===== 2. to_thread 不阻塞 =====
async def demo2_to_thread():
    print("【2. 用 to_thread 不阻塞】")
    start = time.time()
    # 把同步函数丢到线程池，await 期间循环可以跑别的
    await asyncio.to_thread(blocking_func)
    print(f"  to_thread 耗时: {time.time() - start:.2f}s")
    print("  ✅ 事件循环没有被冻住\\n")


# ===== 3. 并发运行多个同步函数 =====
async def demo3_concurrent():
    print("【3. 并发运行 3 个同步函数】")
    start = time.time()
    # 3 个 to_thread 并发：总共约 0.5s，而不是 1.5s
    await asyncio.gather(
        asyncio.to_thread(blocking_func),
        asyncio.to_thread(blocking_func),
        asyncio.to_thread(blocking_func),
    )
    print(f"  3 个并发耗时: {time.time() - start:.2f}s（顺序的话要 1.5s）\\n")


# ===== 4. CPU 密集型计算 =====
def cpu_heavy(n):
    """模拟 CPU 密集型计算。"""
    total = 0
    for i in range(n):
        total += i * i
    return total


async def demo4_cpu():
    print("【4. CPU 密集型计算丢线程池】")
    start = time.time()
    # 参数 5_000_000 会自动传给 cpu_heavy
    result = await asyncio.to_thread(cpu_heavy, 5_000_000)
    print(f"  计算结果: {result}, 耗时: {time.time() - start:.2f}s\\n")


# ===== 5. 异步任务 + to_thread 混合 =====
async def async_task(name):
    await asyncio.sleep(0.3)
    return f"{name} done"


async def demo5_mixed():
    print("【5. 异步任务 + to_thread 混合】")
    start = time.time()
    results = await asyncio.gather(
        async_task("A"),
        asyncio.to_thread(blocking_func),
        async_task("B"),
    )
    print(f"  结果: {results}")
    print(f"  总耗时: {time.time() - start:.2f}s（并发跑完）\\n")


# ===== 6. 异步里读同步文件 IO =====
def read_file_sync(path):
    """同步读文件。"""
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


async def demo6_file_io():
    print("【6. 同步文件 IO 丢线程池】")
    import tempfile
    import os

    # 先写一个临时文件
    tmp = tempfile.NamedTemporaryFile(
        mode="w", suffix=".txt", delete=False, encoding="utf-8"
    )
    tmp.write("hello asyncio to_thread\\n" * 1000)
    tmp.close()

    try:
        # 把同步读文件丢到线程池
        content = await asyncio.to_thread(read_file_sync, tmp.name)
        print(f"  读到 {len(content)} 字符")
    finally:
        os.unlink(tmp.name)
    print()


# ===== 主入口 =====
async def main():
    print("=" * 50)
    print("asyncio.to_thread 跑同步代码")
    print("=" * 50 + "\\n")

    await demo1_direct_call()
    await demo2_to_thread()
    await demo3_concurrent()
    await demo4_cpu()
    await demo5_mixed()
    await demo6_file_io()

    print("=" * 50)


# ===== 入口 =====
if __name__ == "__main__":
    asyncio.run(main())
`,
  },

  // =========================================================
  // 第十八章：实战 —— 异步爬虫
  // =========================================================
  {
    id: "pa3-18",
    group: "实战项目",
    icon: "🕷️",
    title: "实战 —— 异步爬虫",
    content: `## 一、先看一个 demo

一个迷你爬虫：10 个 URL，最多同时 3 个请求，统计成功 / 失败 / 耗时。

\`\`\`python
sem = asyncio.Semaphore(3)

async def fetch(url):
    async with sem:
        await asyncio.sleep(0.3)
        return url

results = await asyncio.gather(*[fetch(u) for u in urls])
\`\`\`

10 个 URL 并发跑，比一个个顺序抓快多了。

## 二、知识点（从 demo 提取）

| 知识点 | 说明 |
|--------|------|
| 异步爬虫核心流程 | 准备 URL → 创建任务 → 并发执行 → 统计结果 |
| asyncio.gather 并发 | 所有任务一起跑，等最慢的那个 |
| Semaphore 限速防封 | 控制最大并发数，别把服务器打挂 |
| return_exceptions 错误处理 | 失败的任务返回异常对象，不炸掉整个 gather |
| 真实环境 | 用 aiohttp / httpx，demo 用 sleep 模拟保证可跑 |

## 三、demo 目标

写一个完整的迷你爬虫：10 URL、Semaphore(3)、20% 失败率、统计耗时、和顺序抓取做对比。
`,
    code: `"""
第十八章 demo：异步爬虫
目标：用 asyncio 实现带限速、错误处理的迷你爬虫。
"""
import asyncio
import random
import time


# ===== 模拟网络请求 =====
# 真实项目中这里会用 aiohttp / httpx 发送真正的 HTTP 请求。
async def fetch(url, session_id):
    """模拟抓取一个 URL：随机耗时 0.1~0.5 秒，20% 概率失败。"""
    delay = random.uniform(0.1, 0.5)
    await asyncio.sleep(delay)

    # 模拟 20% 概率请求失败
    if random.random() < 0.2:
        raise ConnectionError(f"{url} 连接超时")

    return f"[session {session_id}] {url} 的 HTML 内容（{len(url)} 字符）"


# ===== 带限速的抓取 =====
async def fetch_with_limit(url, session_id, sem):
    """用信号量控制并发，捕获异常，记录耗时。"""
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
    print(f"   如果顺序抓取，预计需要 {sum(r['cost'] for r in results):.2f} 秒")
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
  // 第十九章：实战 —— 生产者消费者队列
  // =========================================================
  {
    id: "pa3-19",
    group: "实战项目",
    icon: "🔄",
    title: "实战 —— 生产者消费者队列",
    content: `## 一、先看一个 demo

2 个生产者往队列塞任务，3 个消费者从队列取任务处理。

\`\`\`python
queue = asyncio.Queue(maxsize=20)

async def producer():
    for i in range(5):
        await queue.put({"id": i})

async def consumer():
    while not stop_event.is_set():
        task = await asyncio.wait_for(queue.get(), timeout=0.5)
        queue.task_done()
\`\`\`

生产者和消费者各跑各的，队列做缓冲。

## 二、为什么要队列？

生活类比：食堂打饭。

- 生产者 = 炒菜师傅，炒好一盘就放到取餐台（队列）。
- 消费者 = 学生，从取餐台端走吃掉。
- 取餐台 = 队列，缓冲师傅和学生的速度差。

师傅不用等学生吃完才炒下一盘，学生也不用等师傅炒完才来端。

## 三、知识点（从 demo 提取）

| 知识点 | 说明 |
|--------|------|
| 生产者-消费者模式 | 生产者造数据，消费者处理数据，解耦速度 |
| asyncio.Queue 解耦 | 队列做缓冲，生产快了排队，消费快了等着 |
| 多生产者 + 多消费者 | gather 启动多个生产者 / 消费者并发 |
| 停止信号 stop_event | 用 Event 通知消费者退出循环 |
| queue.join | 等所有任务被 task_done，确保不丢任务 |

## 四、demo 目标

2 生产者 + 3 消费者，Queue(maxsize=20)，stop_event 退出，queue.join 等清空，统计耗时。
`,
    code: `"""
第十九章 demo：生产者消费者队列
目标：用 asyncio.Queue 实现多生产者 + 多消费者的任务流水线。
"""
import asyncio
import random
import time


# ===== 生产者 =====
async def producer(queue, name, count, stop_event):
    """生产者：往队列放 dict 任务，随机间隔。"""
    for i in range(count):
        # 模拟生产间隔
        await asyncio.sleep(random.uniform(0.05, 0.2))

        task = {
            "id": f"{name}-{i+1}",
            "payload": random.randint(1, 100),
        }
        await queue.put(task)
        print(f"  [生产者 {name}] 生产 {task['id']}, 队列长度: {queue.qsize()}")

    print(f"  [生产者 {name}] 完成生产")


# ===== 消费者 =====
async def consumer(queue, name, stop_event):
    """消费者：循环取任务，stop_event 触发后退出。"""
    while not stop_event.is_set():
        try:
            # 等 0.5 秒没拿到就重试，避免永远阻塞
            task = await asyncio.wait_for(queue.get(), timeout=0.5)
        except asyncio.TimeoutError:
            continue

        # 模拟处理耗时
        process_time = random.uniform(0.1, 0.4)
        await asyncio.sleep(process_time)

        print(
            f"  [消费者 {name}] 处理 {task['id']} "
            f"(payload={task['payload']}) 耗时 {process_time:.2f}s, "
            f"剩余队列: {queue.qsize()}"
        )
        queue.task_done()

    print(f"  [消费者 {name}] 退出")


# ===== 主入口 =====
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
  // 第二十章：最佳实践与总结
  // =========================================================
  {
    id: "pa3-20",
    group: "实战项目",
    icon: "🚀",
    title: "最佳实践与总结",
    content: `## 一、先看一个 demo

一个综合 demo 展示最佳实践：调试模式、非阻塞、to_thread、并发 vs 顺序、异常处理、资源清理。

\`\`\`python
asyncio.run(main(), debug=True)
\`\`\`

## 二、知识点（从 demo 提取）

| 知识点 | 说明 |
|--------|------|
| 开启调试模式 | \`asyncio.run(main(), debug=True)\`，慢回调会报警告 |
| 避免阻塞事件循环 | \`time.sleep\` → \`await asyncio.sleep\` |
| 同步代码放线程池 | \`await asyncio.to_thread(func)\` |
| 并发 vs 顺序 | gather 并发远快于顺序 await |
| 异常处理 | \`gather(..., return_exceptions=True)\` 不让一个失败炸全部 |
| 资源清理 | \`async with\` 确保连接 / 文件被关闭 |

## 三、常见反模式

| 反模式 | 问题 | 正确做法 |
|--------|------|----------|
| 协程里 \`time.sleep\` | 阻塞循环 | \`await asyncio.sleep\` |
| 忘记 await | 协程不执行 | 确保 await / create_task |
| main 提前 return | 子任务被取消 | await 所有任务 |
| 并发无上限 | 资源耗尽 | Semaphore 限速 |
| 不处理取消 | CancelledError 崩溃 | except 里清理 |

## 四、性能优化 checklist

- [ ] 只把真正的 I/O 异步化
- [ ] CPU 密集型用 to_thread 或进程池
- [ ] 控制并发数量
- [ ] 设置合理超时
- [ ] 用 async with 管理资源
- [ ] 开发时开 debug=True

## 五、学习路线总结

1. 协程 / 事件循环 / async-await
2. Task / gather / create_task
3. 异步 I/O 工具（sleep / Queue / to_thread）
4. 并发控制（Lock / Semaphore / Event / Timeout）
5. 实战项目
6. 持续优化
`,
    code: `"""
第二十章 demo：最佳实践与总结
目标：通过 6 个小 demo 展示 asyncio 最佳实践。
"""
import asyncio
import time


# ===== 1. 慢回调检测（debug 模式）=====
async def slow_callback():
    """故意阻塞 0.15 秒，debug=True 会报警告。"""
    print("【1. 慢回调检测（debug）】")
    print("  这个函数阻塞了 0.15 秒")
    time.sleep(0.15)  # 故意阻塞，触发 debug 警告
    print("  结束\\n")


# ===== 2. 非阻塞等待 =====
async def non_blocking():
    """正确写法：让出 CPU。"""
    print("【2. 非阻塞等待】")
    print("  开始")
    await asyncio.sleep(0.15)
    print("  结束（不阻塞其他协程）\\n")


# ===== 3. 同步代码放线程池 =====
def blocking_io():
    """模拟同步 I/O。"""
    time.sleep(0.2)
    return "blocking result"


async def run_in_thread():
    """用 asyncio.to_thread 把同步代码丢线程池。"""
    print("【3. 同步代码放线程池】")
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


# ===== 6. 资源清理（async with）=====
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
    print("最佳实践与总结")
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
