"""
第十二章 demo：asyncio.Queue 异步队列
目标：掌握生产者-消费者模型和队列核心方法。
"""
import asyncio
import random


# ===== 1. 基本 Queue =====
async def main1():
    print("=== 1. 基本 Queue ===")
    queue = asyncio.Queue()

    # 放三个数据
    await queue.put("A")
    await queue.put("B")
    await queue.put("C")

    print(f"  队列大小: {queue.qsize()}")
    print(f"  是否为空: {queue.empty()}")

    # 依次取出
    while not queue.empty():
        item = await queue.get()
        print(f"  取出: {item}")
        queue.task_done()  # 标记处理完一个

    print(f"  取完后大小: {queue.qsize()}")


asyncio.run(main1())
print()


# ===== 2. 生产者-消费者（带 None 停止信号） =====
async def producer(queue, name, count):
    """生产者：生产 count 个产品放进队列"""
    for i in range(count):
        item = f"{name}-产品{i}"
        await queue.put(item)
        print(f"  [生产者 {name}] 放入: {item}")
        await asyncio.sleep(random.uniform(0.05, 0.15))
    # 生产者自己不负责发停止信号，由主流程统一发


async def consumer(queue, name):
    """消费者：循环取数据，收到 None 就下班"""
    while True:
        item = await queue.get()
        if item is None:
            # 收到停止信号，退出循环
            queue.task_done()
            print(f"  [消费者 {name}] 收到停止信号，下班")
            break
        print(f"  [消费者 {name}] 取出: {item}")
        await asyncio.sleep(random.uniform(0.1, 0.25))  # 处理耗时
        queue.task_done()


async def main2():
    print("=== 2. 生产者-消费者（带 None 停止信号） ===")
    queue = asyncio.Queue(maxsize=5)

    # 2 个生产者，每个生产 3 个
    producers = [
        asyncio.create_task(producer(queue, f"P{i}", 3))
        for i in range(2)
    ]
    # 2 个消费者
    consumers = [
        asyncio.create_task(consumer(queue, f"C{i}"))
        for i in range(2)
    ]

    # 等所有生产者完成
    await asyncio.gather(*producers)
    print("  --- 所有生产者完成 ---")

    # 给每个消费者发一个 None 停止信号（数量等于消费者数）
    for _ in consumers:
        await queue.put(None)

    # 等所有消费者处理完并退出
    await asyncio.gather(*consumers)
    print("  --- 所有消费者完成 ---")


asyncio.run(main2())
print()


# ===== 3. queue.join 等待所有任务 =====
async def worker(queue, name):
    """工人：循环处理，收到 None 就停"""
    while True:
        item = await queue.get()
        if item is None:
            queue.task_done()
            break
        print(f"  [{name}] 处理: {item}")
        await asyncio.sleep(0.1)
        queue.task_done()  # 每处理完一个就 task_done


async def main3():
    print("=== 3. queue.join 等待所有任务 ===")
    queue = asyncio.Queue()

    # 启动 2 个工人
    workers = [
        asyncio.create_task(worker(queue, f"W{i}"))
        for i in range(2)
    ]

    # 放入 6 个任务
    for i in range(6):
        await queue.put(f"任务{i}")

    # 关键：join 会等到所有 put 进来的任务都被 task_done
    print("  等待所有任务处理完...")
    await queue.join()
    print("  所有任务处理完成！")

    # 任务都处理完了，发停止信号让工人退出
    for _ in workers:
        await queue.put(None)
    await asyncio.gather(*workers)


asyncio.run(main3())
print()


# ===== 4. 有界队列 (maxsize=2) =====
async def main4():
    print("=== 4. 有界队列 (maxsize=2) ===")
    queue = asyncio.Queue(maxsize=2)  # 最多放 2 个

    async def fast_producer():
        """生产者很快，但队列满了会被 put 卡住"""
        for i in range(5):
            await queue.put(f"产品{i}")
            print(f"  [生产者] 放入 产品{i}（当前大小 {queue.qsize()}）")

    async def slow_consumer():
        """消费者很慢，每 0.3 秒取一个"""
        for _ in range(5):
            await asyncio.sleep(0.3)
            item = await queue.get()
            print(f"    [消费者] 取出 {item}")
            queue.task_done()

    # 并发跑：生产者会被 maxsize 限流，不会一次性塞 5 个
    await asyncio.gather(fast_producer(), slow_consumer())


asyncio.run(main4())
print()


# ===== 5. 实战：任务分发器 =====
async def main5():
    print("=== 5. 实战：任务分发器 ===")
    queue = asyncio.Queue()

    # 准备一批任务（类型, 目标）
    tasks = [("下载", f"url{i}") for i in range(6)]
    for t in tasks:
        await queue.put(t)

    async def handler(name):
        """工人：从队列抢任务处理，直到队列空"""
        while True:
            try:
                action, target = queue.get_nowait()
            except asyncio.QueueEmpty:
                print(f"  [{name}] 队列空了，下班")
                return
            print(f"  [{name}] {action}: {target}")
            await asyncio.sleep(0.15)  # 模拟处理
            queue.task_done()

    # 3 个工人并发抢任务
    await asyncio.gather(
        handler("worker-1"),
        handler("worker-2"),
        handler("worker-3"),
    )
    print("  所有任务分发完成")


asyncio.run(main5())
