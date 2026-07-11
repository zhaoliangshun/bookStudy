"""
第十一章 demo：async for 异步迭代
目标：掌握异步生成器、异步迭代器、异步推导式。
"""
import asyncio


# ===== 1. 异步生成器 async_range =====
async def async_range(n, delay=0.1):
    """异步版 range：每产生一个数等 delay 秒"""
    for i in range(n):
        await asyncio.sleep(delay)
        yield i


async def main1():
    print("=== 1. 异步生成器 async_range ===")
    async for i in async_range(5, 0.1):
        print(f"  拿到: {i}")


asyncio.run(main1())
print()


# ===== 2. 自定义异步迭代器（AsyncCounter 类） =====
class AsyncCounter:
    """用类实现异步迭代器：实现 __aiter__ 和 __anext__"""

    def __init__(self, limit, delay=0.05):
        self.limit = limit
        self.delay = delay
        self.i = 0

    def __aiter__(self):
        # 返回迭代器对象本身
        return self

    async def __anext__(self):
        # 每次调用返回下一个值，没有更多时抛 StopAsyncIteration
        if self.i >= self.limit:
            raise StopAsyncIteration
        await asyncio.sleep(self.delay)
        self.i += 1
        return self.i


async def main2():
    print("=== 2. 自定义异步迭代器（AsyncCounter 类） ===")
    async for value in AsyncCounter(5):
        print(f"  value = {value}")


asyncio.run(main2())
print()


# ===== 3. 异步分页读取 =====
async def fetch_page(page):
    """模拟调用分页 API"""
    await asyncio.sleep(0.15)
    # 每页 3 条数据
    return [f"page{page}-item{i}" for i in range(3)]


async def paginated_items(total_pages):
    """异步生成器：逐页拉取数据并逐条 yield"""
    for page in range(1, total_pages + 1):
        items = await fetch_page(page)
        for item in items:
            yield item


async def main3():
    print("=== 3. 异步分页读取 ===")
    count = 0
    async for item in paginated_items(3):
        count += 1
        print(f"  第 {count} 条: {item}")
    print(f"  共读到 {count} 条")


asyncio.run(main3())
print()


# ===== 4. 异步流式处理 =====
async def data_stream(n):
    """模拟一个数据流，每隔一段时间产生一个数"""
    for i in range(n):
        await asyncio.sleep(0.05)
        yield i * i  # 平方数


async def main4():
    print("=== 4. 异步流式处理 ===")
    total = 0
    async for value in data_stream(8):
        if value > 10:
            print(f"  处理: {value} -> {value * 2}")
            total += value
    print(f"  累计: {total}")


asyncio.run(main4())
print()


# ===== 5. async for + break =====
async def infinite_numbers():
    """无限异步序列"""
    i = 0
    while True:
        await asyncio.sleep(0.05)
        yield i
        i += 1


async def main5():
    print("=== 5. async for + break ===")
    async for i in infinite_numbers():
        print(f"  {i}", end=" ")
        if i >= 4:
            print()  # 换行
            print("  找到目标，停止迭代")
            break


asyncio.run(main5())
print()


# ===== 6. 异步推导式 =====
async def main6():
    print("=== 6. 异步推导式 ===")
    # 注意：异步推导式必须在 async 函数里使用
    squares = [x async for x in async_range(5, 0.05)]
    print(f"  平方列表: {squares}")

    # 带条件的异步推导式
    evens = [x async for x in async_range(10, 0.02) if x % 2 == 0]
    print(f"  偶数列表: {evens}")


asyncio.run(main6())
