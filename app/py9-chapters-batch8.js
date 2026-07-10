// =============================================================
// Python 逐层深入教程 - batch8
// 章节 71-82：类型与现代特性 + 测试与调试
//   类型进阶 / async await / 模块包 / 测试 / 调试 / 性能分析
// =============================================================

export const chapters = [
  // -----------------------------------------------------------
  // 第 71 章：类型提示进阶
  // -----------------------------------------------------------
  {
    id: "py9-71",
    group: "类型与现代特性",
    icon: "🔬",
    title: "类型提示进阶：泛型、协变、重载",
    content: `## 进阶类型工具

第 67 章学了基础类型提示。这章深入：泛型类、协变/逆变、函数重载、Literal、Final、ClassVar。

## Generic：泛型类

\`\`\`python
from typing import TypeVar, Generic  # 从 typing 导入 TypeVar, Generic

T = TypeVar("T")  # 赋值变量 T

class Stack(Generic[T]):  # 定义类 Stack
    def __init__(self):  # 定义函数 __init__，参数：self
        self.items: list[T] = []  # 执行操作
    def push(self, x: T) -> None:  # 定义函数 push，参数：self, x: T
        self.items.append(x)  # 执行操作
    def pop(self) -> T:  # 定义函数 pop，参数：self
        return self.items.pop()  # 返回 self.items.pop()

s: Stack[int] = Stack()  # 执行操作
s.push(1)  # 调用 s.push()
\`\`\`

\`Stack[int]\` 表示"装 int 的栈"。类型检查器能验证只放 int。

## Literal：字面量类型

\`\`\`python
from typing import Literal  # 从 typing 导入 Literal

def set_mode(mode: Literal["r", "w", "a"]) -> None: ...  # 定义函数 set_mode，参数：mode: Literal["r", "w", "a"]
\`\`\`

参数只能是 "r"、"w"、"a" 之一，传别的字符串类型检查会报错。

## Final：不可变

\`\`\`python
from typing import Final  # 从 typing 导入 Final

MAX_SIZE: Final[int] = 100    # 不应被修改
\`\`\`

## ClassVar：类变量

\`\`\`python
class User:  # 定义类 User
    count: ClassVar[int] = 0    # 类变量，不是实例变量
    name: str                   # 实例变量
\`\`\`

## 函数重载

\`\`\`python
from typing import overload  # 从 typing 导入 overload

@overload  # 应用装饰器 overload
def parse(x: int) -> int: ...  # 定义函数 parse，参数：x: int
@overload  # 应用装饰器 overload
def parse(x: str) -> str: ...  # 定义函数 parse，参数：x: str
def parse(x):  # 定义函数 parse，参数：x
    if isinstance(x, int):  # 如果 isinstance(x, int)
        return x * 2  # 返回 x * 2
    return x.upper()  # 返回 x.upper()
\`\`\`

让类型检查器知道不同输入对应不同输出。

## Protocol：结构子类型

\`\`\`python
from typing import Protocol  # 从 typing 导入 Protocol

class Closeable(Protocol):  # 定义类 Closeable
    def close(self) -> None: ...  # 定义函数 close，参数：self
\`\`\`

不继承，只要有 \`close\` 方法就算 \`Closeable\`。鸭子类型的类型化。

## 本章 demo

demo 演示进阶类型用法。`,
    code: `# ============================================
# 第 71 章：类型提示进阶
# ============================================
from typing import (
    TypeVar, Generic, Literal, Final, ClassVar,
    overload, Protocol, Type, Iterable, Iterator,
    List, Dict, Optional, Callable
)

# --- 1. Generic 泛型类 ---
print("=== 1. Generic ===")
T = TypeVar("T")

class Stack(Generic[T]):
    """泛型栈"""
    def __init__(self) -> None:
        self.items: List[T] = []
    
    def push(self, x: T) -> None:
        self.items.append(x)
    
    def pop(self) -> T:
        if not self.items:
            raise IndexError("栈空")
        return self.items.pop()
    
    def __len__(self) -> int:
        return len(self.items)
    
    def __repr__(self) -> str:
        return f"Stack({self.items})"

# int 栈
s: Stack[int] = Stack()
s.push(1)
s.push(2)
s.push(3)
print(f"  int 栈: {s}, pop → {s.pop()}")

# str 栈
s2: Stack[str] = Stack()
s2.push("a")
s2.push("b")
print(f"  str 栈: {s2}, pop → {s2.pop()!r}")

# --- 2. 多类型参数 ---
print("\\n=== 2. 多类型参数 ===")
K = TypeVar("K")
V = TypeVar("V")

class Dict2(Generic[K, V]):
    """简化版字典"""
    def __init__(self):
        self._data: List[tuple] = []
    
    def set(self, key: K, value: V) -> None:
        for i, (k, _) in enumerate(self._data):
            if k == key:
                self._data[i] = (key, value)
                return
        self._data.append((key, value))
    
    def get(self, key: K, default: Optional[V] = None) -> Optional[V]:
        for k, v in self._data:
            if k == key:
                return v
        return default

d: Dict2[str, int] = Dict2()
d.set("a", 1)
d.set("b", 2)
print(f"  d.get('a') = {d.get('a')}")
print(f"  d.get('c') = {d.get('c')}")
print(f"  d.get('c', -1) = {d.get('c', -1)}")

# --- 3. Literal ---
print("\\n=== 3. Literal ===")
def open_file(path: str, mode: Literal["r", "w", "a"] = "r") -> str:
    """mode 只能是 r/w/a"""
    return f"以 {mode} 模式打开 {path}"

print(f"  {open_file('a.txt')}")
print(f"  {open_file('b.txt', 'w')}")
# open_file('c.txt', 'x')  # 类型检查会报错（运行时不强制）

# 用 Literal 做状态机
def process(action: Literal["start", "stop", "restart"]) -> str:
    actions = {"start": "启动", "stop": "停止", "restart": "重启"}
    return actions[action]

for a in ["start", "stop", "restart"]:
    print(f"  process('{a}') = {process(a)}")

# --- 4. Final ---
print("\\n=== 4. Final ===")
MAX_CONNECTIONS: Final[int] = 100
DEFAULT_TIMEOUT: Final[float] = 30.0
APP_NAME: Final[str] = "MyApp"

print(f"  MAX_CONNECTIONS = {MAX_CONNECTIONS}")
print(f"  DEFAULT_TIMEOUT = {DEFAULT_TIMEOUT}")
print(f"  APP_NAME = {APP_NAME}")
# 运行时可改，但类型检查器会警告
# MAX_CONNECTIONS = 200  # mypy 会报错

# --- 5. ClassVar ---
print("\\n=== 5. ClassVar ===")
class Counter:
    # 类变量：所有实例共享
    instance_count: ClassVar[int] = 0
    
    def __init__(self, name: str):
        self.name = name    # 实例变量
        Counter.instance_count += 1
    
    @classmethod
    def get_count(cls) -> int:
        return cls.instance_count

c1 = Counter("a")
c2 = Counter("b")
c3 = Counter("c")
print(f"  实例数: {Counter.get_count()}")
print(f"  c1.name = {c1.name}")
print(f"  c2.name = {c2.name}")

# --- 6. 函数重载 ---
print("\\n=== 6. overload ===")
@overload
def process_value(x: int) -> int: ...
@overload
def process_value(x: str) -> str: ...
@overload
def process_value(x: list) -> int: ...

def process_value(x):
    """实际实现"""
    if isinstance(x, int):
        return x * 2
    elif isinstance(x, str):
        return x.upper()
    elif isinstance(x, list):
        return len(x)
    raise TypeError

print(f"  process_value(5) = {process_value(5)}")
print(f"  process_value('hi') = {process_value('hi')!r}")
print(f"  process_value([1,2,3]) = {process_value([1, 2, 3])}")

# --- 7. Protocol ---
print("\\n=== 7. Protocol ===")
class Iterable2(Protocol):
    def __iter__(self): ...
    def __len__(self) -> int: ...

class Closeable(Protocol):
    def close(self) -> None: ...

def close_all(items: List[Closeable]) -> int:
    """关闭所有可关闭对象"""
    count = 0
    for item in items:
        item.close()
        count += 1
    return count

# 不继承 Protocol，但实现接口就算
class FileLike:
    def close(self) -> None:
        print("    文件关闭")

class ConnLike:
    def close(self) -> None:
        print("    连接关闭")

count = close_all([FileLike(), ConnLike()])
print(f"  关闭了 {count} 个")

# --- 8. Type ---
print("\\n=== 8. Type ===")
class Animal:
    @classmethod
    def create(cls) -> "Animal":
        return cls()

class Dog(Animal):
    def speak(self) -> str:
        return "汪"

class Cat(Animal):
    def speak(self) -> str:
        return "喵"

def make_animal(cls: Type[Animal]) -> Animal:
    """根据类创建实例"""
    return cls.create()

for cls in [Dog, Cat]:
    a = make_animal(cls)
    print(f"  {cls.__name__}: {a.speak()}")

# --- 9. 泛型函数 ---
print("\\n=== 9. 泛型函数 ===")
T2 = TypeVar("T2")

def first(items: Iterable[T2]) -> Optional[T2]:
    """取第一个"""
    for item in items:
        return item
    return None

def last(items: Iterable[T2]) -> Optional[T2]:
    """取最后一个"""
    result = None
    for item in items:
        result = item
    return result

print(f"  first([1,2,3]) = {first([1, 2, 3])}")
print(f"  first('abc') = {first('abc')!r}")
print(f"  first([]) = {first([])}")
print(f"  last([1,2,3]) = {last([1, 2, 3])}")
print(f"  last(range(5)) = {last(range(5))}")

# --- 10. 实用：类型化数据管道 ---
print("\\n=== 10. 类型化管道 ===")
class Pipeline(Generic[T]):
    """类型化数据处理管道"""
    def __init__(self, source: Iterable[T]):
        self._source = source
    
    def map(self, func: Callable[[T], T]) -> "Pipeline[T]":
        return Pipeline(func(x) for x in self._source)
    
    def filter(self, pred: Callable[[T], bool]) -> "Pipeline[T]":
        return Pipeline(x for x in self._source if pred(x))
    
    def take(self, n: int) -> List[T]:
        result = []
        for i, x in enumerate(self._source):
            if i >= n:
                break
            result.append(x)
        return result
    
    def to_list(self) -> List[T]:
        return list(self._source)

# 1-20 → 平方 → 偶数 → 前5
result = (
    Pipeline(range(1, 21))
    .map(lambda x: x ** 2)
    .filter(lambda x: x % 2 == 0)
    .take(5)
)
print(f"  1-20 平方偶数前5: {result}")

# 字符串处理
words = Pipeline(["apple", "banana", "cherry", "date"])
result = words.map(str.upper).filter(lambda s: len(s) > 5).to_list()
print(f"  长度>5大写: {result}")`
  },

  // -----------------------------------------------------------
  // 第 72 章：异步编程入门
  // -----------------------------------------------------------
  {
    id: "py9-72",
    group: "类型与现代特性",
    icon: "🔄",
    title: "异步编程入门：asyncio 基础",
    content: `## 同步 vs 异步

**同步**：代码一行行执行，遇到耗时操作（IO）就等。
**异步**：遇到耗时操作先去做别的，等好了再回来继续。

异步适合 **IO 密集型**任务：网络请求、文件读写、数据库。不适合 CPU 密集型。

## asyncio 基础

\`\`\`python
import asyncio  # 导入模块 asyncio

async def hello():  # 定义异步函数 hello
    print("hello")  # 打印输出到屏幕
    await asyncio.sleep(1)    # 模拟耗时
    print("world")  # 打印输出到屏幕

asyncio.run(hello())  # 调用 asyncio.run()：运行
\`\`\`

## async def 与 await

- \`async def\`：定义异步函数（协程）
- \`await\`：等待另一个协程完成

\`\`\`python
import asyncio
async def task():  # 定义异步函数 task
    await asyncio.sleep(1)    # 等待

asyncio.run(task())  # 调用 asyncio.run()：运行
\`\`\`

⚠️ 协程不会自动执行，必须 \`await\` 或用 \`asyncio.run\`。

## 并发执行：gather

\`\`\`python
async def t1(): await asyncio.sleep(1)  # 定义异步函数 t1
async def t2(): await asyncio.sleep(1)  # 定义异步函数 t2

# 串行：2秒
await t1()  # 执行操作
await t2()  # 执行操作

# 并发：1秒
await asyncio.gather(t1(), t2())  # 执行操作
\`\`\`

## 创建任务：create_task

\`\`\`python
task = asyncio.create_task(t1())  # 赋值变量 task
# 做别的事
await task    # 等待完成
\`\`\`

## 事件循环

\`asyncio.run()\` 启动事件循环，是异步程序的入口。事件循环负责调度协程。

## 本章 demo

demo 演示异步基础、并发对比。`,
    code: `# ============================================
# 第 72 章：异步编程入门
# ============================================
import asyncio
import time

# --- 1. 第一个协程 ---
print("=== 1. 协程 ===")
async def hello():
    print("  hello")
    await asyncio.sleep(0.1)
    print("  world")

# asyncio.run 启动事件循环
asyncio.run(hello())

# --- 2. 串行 vs 并发 ---
print("\\n=== 2. 串行 vs 并发 ===")
async def task(name, duration):
    print(f"  [{name}] 开始")
    await asyncio.sleep(duration)
    print(f"  [{name}] 完成 (耗时 {duration}s)")
    return name

async def serial():
    """串行执行"""
    start = time.time()
    await task("A", 0.3)
    await task("B", 0.3)
    await task("C", 0.3)
    return time.time() - start

async def concurrent():
    """并发执行"""
    start = time.time()
    await asyncio.gather(
        task("A", 0.3),
        task("B", 0.3),
        task("C", 0.3),
    )
    return time.time() - start

async def main():
    t1 = await serial()
    print(f"  串行总耗时: {t1:.2f}s")
    
    t2 = await concurrent()
    print(f"  并发总耗时: {t2:.2f}s")

asyncio.run(main())

# --- 3. create_task ---
print("\\n=== 3. create_task ===")
async def main2():
    # 创建任务（立即开始调度）
    t1 = asyncio.create_task(task("X", 0.2))
    t2 = asyncio.create_task(task("Y", 0.2))
    
    # 在等待期间，t1 t2 并发执行
    print("  主任务做其他事...")
    await asyncio.sleep(0.1)
    print("  主任务继续")
    
    # 等待两个任务完成
    r1 = await t1
    r2 = await t2
    print(f"  结果: {r1}, {r2}")

asyncio.run(main2())

# --- 4. gather 收集结果 ---
print("\\n=== 4. gather ===")
async def fetch(url, delay):
    """模拟请求"""
    await asyncio.sleep(delay)
    return f"{url} 的响应"

async def main3():
    # gather 返回结果列表，顺序和传入一致
    results = await asyncio.gather(
        fetch("api/users", 0.1),
        fetch("api/posts", 0.2),
        fetch("api/comments", 0.15),
    )
    for r in results:
        print(f"  {r}")

asyncio.run(main3())

# --- 5. wait_for 超时 ---
print("\\n=== 5. 超时 ===")
async def slow_task():
    await asyncio.sleep(2)
    return "完成"

async def main4():
    try:
        result = await asyncio.wait_for(slow_task(), timeout=0.3)
        print(f"  结果: {result}")
    except asyncio.TimeoutError:
        print("  超时了")

asyncio.run(main4())

# --- 6. 异步迭代 ---
print("\\n=== 6. 异步迭代 ===")
async def async_range(n, delay=0.05):
    """异步产生数字"""
    for i in range(n):
        await asyncio.sleep(delay)
        yield i

async def main5():
    async for x in async_range(5):
        print(f"  收到: {x}")

asyncio.run(main5())

# --- 7. asyncio.wait ---
print("\\n=== 7. wait ===")
async def main6():
    # wait 返回 (done, pending) 两个集合
    tasks = [
        asyncio.create_task(task("P", 0.1)),
        asyncio.create_task(task("Q", 0.2)),
        asyncio.create_task(task("R", 0.15)),
    ]
    done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
    print(f"  第一个完成: {[t.result() for t in done]}")
    # 等其余完成
    await asyncio.wait(pending)
    print(f"  全部完成")

asyncio.run(main6())

# --- 8. 实用：并发请求 ---
print("\\n=== 8. 并发请求模拟 ===")
async def fake_request(url):
    """模拟 HTTP 请求"""
    delay = 0.05 + (hash(url) % 10) * 0.02
    await asyncio.sleep(delay)
    return {"url": url, "status": 200, "data": f"<html>{url}</html>"}

async def main7():
    urls = [
        "https://api.example.com/users",
        "https://api.example.com/posts",
        "https://api.example.com/comments",
        "https://api.example.com/likes",
        "https://api.example.com/shares",
    ]
    
    # 串行
    start = time.time()
    results_serial = []
    for url in urls:
        results_serial.append(await fake_request(url))
    t_serial = time.time() - start
    
    # 并发
    start = time.time()
    results_concurrent = await asyncio.gather(*[fake_request(u) for u in urls])
    t_concurrent = time.time() - start
    
    print(f"  串行 {len(urls)} 个请求: {t_serial:.2f}s")
    print(f"  并发 {len(urls)} 个请求: {t_concurrent:.2f}s")
    print(f"  加速: {t_serial/t_concurrent:.1f}x")

asyncio.run(main7())

# --- 9. 信号量限制并发 ---
print("\\n=== 9. 限制并发 ===")
async def worker(name, sem):
    async with sem:    # 信号量限制同时执行数
        print(f"  [{name}] 开始")
        await asyncio.sleep(0.1)
        print(f"  [{name}] 完成")
        return name

async def main8():
    sem = asyncio.Semaphore(3)    # 同时最多3个
    tasks = [worker(f"W{i}", sem) for i in range(10)]
    results = await asyncio.gather(*tasks)
    print(f"  完成: {len(results)} 个")

asyncio.run(main8())

# --- 10. 综合实战 ---
print("\\n=== 10. 综合：异步爬虫 ===")
async def crawl(url, depth=0):
    """模拟爬虫"""
    indent = "  " * (depth + 1)
    print(f"{indent}爬取: {url}")
    await asyncio.sleep(0.05)
    
    # 模拟找到子链接
    if depth < 2:
        children = [f"{url}/{i}" for i in range(2)]
        # 并发爬取子链接
        sub_results = await asyncio.gather(*[crawl(c, depth+1) for c in children])
        return {url: sub_results}
    return url

async def main9():
    start = time.time()
    result = await crawl("https://example.com")
    elapsed = time.time() - start
    print(f"\\n  爬虫完成，耗时 {elapsed:.2f}s")
    print(f"  结果: {result}")

asyncio.run(main9())`
  },

  // -----------------------------------------------------------
  // 第 73 章：async/await 进阶
  // -----------------------------------------------------------
  {
    id: "py9-73",
    group: "类型与现代特性",
    icon: "⚡",
    title: "async/await 进阶：队列、锁、异步上下文",
    content: `## 进阶异步工具

第 72 章学了基础。这章学：异步队列、锁、事件、条件、异步上下文管理器、异步生成器。

## 异步队列：asyncio.Queue

\`\`\`python
import asyncio  # 导入模块 asyncio

async def producer(q):  # 定义异步函数 producer，参数：q
    for i in range(5):  # 遍历 range(5)，取值给 i
        await q.put(i)  # 执行操作
        await asyncio.sleep(0.1)  # 执行操作

async def consumer(q):  # 定义异步函数 consumer，参数：q
    while True:  # 当 True 时循环
        item = await q.get()  # 赋值变量 item
        print(item)  # 打印输出到屏幕
        q.task_done()  # 调用 q.task_done()：标记任务完成

q = asyncio.Queue()  # 赋值变量 q
\`\`\`

生产者-消费者模式，解耦生产与消费。

## 异步锁：asyncio.Lock

\`\`\`python
lock = asyncio.Lock()  # 赋值变量 lock
async with lock:  # 执行操作
    # 临界区，同时只有一个协程
    ...  # 执行操作
\`\`\`

## 异步事件：asyncio.Event

\`\`\`python
event = asyncio.Event()  # 赋值变量 event
await event.wait()    # 等待事件
event.set()           # 触发事件
\`\`\`

## 异步上下文管理器

\`\`\`python
class AsyncResource:  # 定义类 AsyncResource
    async def __aenter__(self):  # 定义异步函数 __aenter__，参数：self
        await self.connect()  # 执行操作
        return self  # 返回 self
    async def __aexit__(self, *args):  # 定义异步函数 __aexit__，参数：self, *args
        await self.close()  # 执行操作

async with AsyncResource() as r:  # 执行操作
    ...  # 执行操作
\`\`\`

## 异步生成器

\`\`\`python
async def agen():  # 定义异步函数 agen
    for i in range(5):  # 遍历 range(5)，取值给 i
        await asyncio.sleep(0.1)  # 执行操作
        yield i  # 生成值：i

async for x in agen():  # 执行操作
    print(x)  # 打印输出到屏幕
\`\`\`

## 异步迭代器类

\`\`\`python
class AsyncCounter:  # 定义类 AsyncCounter
    def __init__(self, n):  # 定义函数 __init__，参数：self, n
        self.n = n  # 执行操作
    def __aiter__(self):  # 定义函数 __aiter__，参数：self
        self.i = 0  # 执行操作
        return self  # 返回 self
    async def __anext__(self):  # 定义异步函数 __anext__，参数：self
        if self.i >= self.n:  # 如果 self.i >= self.n
            raise StopAsyncIteration  # 抛出异常：StopAsyncIteration
        await asyncio.sleep(0.1)  # 执行操作
        self.i += 1  # 执行操作
        return self.i  # 返回 self.i
\`\`\`

## 本章 demo

demo 演示进阶异步工具。`,
    code: `# ============================================
# 第 73 章：async/await 进阶
# ============================================
import asyncio
import time

# --- 1. 异步队列 ---
print("=== 1. 异步队列 ===")
async def producer(q, name):
    """生产者"""
    for i in range(3):
        item = f"{name}-item{i}"
        await q.put(item)
        print(f"  [生产者{name}] 放入 {item}")
        await asyncio.sleep(0.05)
    return f"{name}完成"

async def consumer(q, name):
    """消费者"""
    items = []
    while True:
        try:
            item = await asyncio.wait_for(q.get(), timeout=0.3)
            print(f"  [消费者{name}] 取出 {item}")
            items.append(item)
            q.task_done()
            await asyncio.sleep(0.02)
        except asyncio.TimeoutError:
            break
    return items

async def main():
    q = asyncio.Queue(maxsize=5)
    
    # 2生产者 + 2消费者
    producers = [producer(q, "A"), producer(q, "B")]
    consumers = [consumer(q, "X"), consumer(q, "Y")]
    
    # 先启动消费者（作为任务），否则 q.join() 会死锁
    c_tasks = [asyncio.create_task(c) for c in consumers]
    p_results = await asyncio.gather(*producers)
    await q.join()    # 等队列处理完
    c_results = await asyncio.gather(*c_tasks)
    
    print(f"  生产者结果: {p_results}")
    print(f"  消费者结果: {c_results}")

asyncio.run(main())

# --- 2. 异步锁 ---
print("\\n=== 2. 异步锁 ===")
counter = 0

async def unsafe_inc(name, n):
    """不安全的自增"""
    global counter
    for _ in range(n):
        old = counter
        await asyncio.sleep(0)    # 让出控制权
        counter = old + 1
    return counter

async def safe_inc(lock, name, n):
    """用锁安全自增"""
    global counter
    for _ in range(n):
        async with lock:
            old = counter
            await asyncio.sleep(0)
            counter = old + 1
    return counter

async def main2():
    global counter
    counter = 0
    # 不安全
    await asyncio.gather(unsafe_inc("A", 100), unsafe_inc("B", 100))
    print(f"  不安全: counter = {counter} (期望 200)")
    
    counter = 0
    lock = asyncio.Lock()
    await asyncio.gather(safe_inc(lock, "A", 100), safe_inc(lock, "B", 100))
    print(f"  加锁: counter = {counter} (期望 200)")

asyncio.run(main2())

# --- 3. 异步事件 ---
print("\\n=== 3. 异步事件 ===")
async def waiter(event, name):
    """等待事件"""
    print(f"  [{name}] 等待事件...")
    await event.wait()
    print(f"  [{name}] 收到事件，继续")

async def setter(event):
    """触发事件"""
    await asyncio.sleep(0.2)
    print("  [setter] 触发事件！")
    event.set()

async def main3():
    event = asyncio.Event()
    # 3个等待者
    waiters = [waiter(event, f"W{i}") for i in range(3)]
    await asyncio.gather(*waiters, setter(event))

asyncio.run(main3())

# --- 4. 异步上下文管理器 ---
print("\\n=== 4. 异步上下文 ===")
class AsyncDB:
    """模拟异步数据库连接"""
    def __init__(self, name):
        self.name = name
        self.connected = False
    
    async def __aenter__(self):
        await asyncio.sleep(0.05)
        self.connected = True
        print(f"  [{self.name}] 连接成功")
        return self
    
    async def __aexit__(self, exc_type, exc, tb):
        await asyncio.sleep(0.05)
        self.connected = False
        print(f"  [{self.name}] 连接关闭")
        if exc:
            print(f"  [{self.name}] 异常: {exc}")
    
    async def query(self, sql):
        if not self.connected:
            raise RuntimeError("未连接")
        await asyncio.sleep(0.05)
        return f"{self.name}: 结果({sql})"

async def main4():
    async with AsyncDB("主库") as db:
        result = await db.query("SELECT 1")
        print(f"  查询: {result}")
    
    # 多个连接
    async with AsyncDB("主库") as db1, AsyncDB("从库") as db2:
        r1, r2 = await asyncio.gather(db1.query("SELECT 1"), db2.query("SELECT 2"))
        print(f"  多库: {r1}, {r2}")

asyncio.run(main4())

# --- 5. 异步生成器 ---
print("\\n=== 5. 异步生成器 ===")
async def async_stream(n):
    """异步产生数据流"""
    for i in range(n):
        await asyncio.sleep(0.05)    # 模拟 IO
        yield i * 2

async def main5():
    print("  异步生成:")
    async for x in async_stream(5):
        print(f"    收到: {x}")
    
    # 用 async comprehension
    results = [x async for x in async_stream(5)]
    print(f"  异步推导式: {results}")

asyncio.run(main5())

# --- 6. 异步迭代器类 ---
print("\\n=== 6. 异步迭代器类 ===")
class AsyncTimer:
    """每秒产生一个时间戳"""
    def __init__(self, count):
        self.count = count
        self.i = 0
    
    def __aiter__(self):
        return self
    
    async def __anext__(self):
        if self.i >= self.count:
            raise StopAsyncIteration
        await asyncio.sleep(0.05)
        self.i += 1
        return time.time()

async def main6():
    print("  异步迭代器:")
    start = time.time()
    async for ts in AsyncTimer(5):
        print(f"    第 {ts - start:.2f}s")
    print(f"  总耗时 {time.time()-start:.2f}s")

asyncio.run(main6())

# --- 7. 异步队列实战：爬虫调度 ---
print("\\n=== 7. 爬虫调度 ===")
async def crawl_worker(q, results, name):
    """爬虫工作协程"""
    while True:
        try:
            url = await asyncio.wait_for(q.get(), timeout=0.2)
        except asyncio.TimeoutError:
            break
        
        # 模拟爬取
        await asyncio.sleep(0.05)
        results.append(f"[{name}]{url}")
        q.task_done()

async def main7():
    q = asyncio.Queue()
    # 加入 URL
    for i in range(10):
        await q.put(f"https://example.com/{i}")
    
    results = []
    # 3 个 worker
    workers = [crawl_worker(q, results, f"W{i}") for i in range(3)]
    await asyncio.gather(*workers)
    
    print(f"  爬取 {len(results)} 个:")
    for r in results:
        print(f"    {r}")

asyncio.run(main7())

# --- 8. gather 异常处理 ---
print("\\n=== 8. 异常处理 ===")
async def may_fail(name, fail_prob):
    await asyncio.sleep(0.05)
    import random
    if random.random() < fail_prob:
        raise ValueError(f"{name} 失败")
    return f"{name} 成功"

async def main8():
    # 默认：任一失败 gather 失败
    try:
        results = await asyncio.gather(
            may_fail("A", 0),
            may_fail("B", 1),
            may_fail("C", 0),
        )
    except ValueError as e:
        print(f"  默认模式失败: {e}")
    
    # return_exceptions=True：异常作为结果返回
    results = await asyncio.gather(
        may_fail("A", 0),
        may_fail("B", 1),
        may_fail("C", 0),
        return_exceptions=True
    )
    print(f"  return_exceptions:")
    for r in results:
        if isinstance(r, Exception):
            print(f"    异常: {r}")
        else:
            print(f"    成功: {r}")

asyncio.run(main8())

# --- 9. asyncio.create_task vs 直接 await ---
print("\\n=== 9. 任务调度 ===")
async def main9():
    # 直接 await：串行
    start = time.time()
    r1 = await may_fail("T1", 0)
    r2 = await may_fail("T2", 0)
    print(f"  串行: {time.time()-start:.2f}s, {r1}, {r2}")
    
    # create_task：并发
    start = time.time()
    t1 = asyncio.create_task(may_fail("T1", 0))
    t2 = asyncio.create_task(may_fail("T2", 0))
    r1 = await t1
    r2 = await t2
    print(f"  并发: {time.time()-start:.2f}s, {r1}, {r2}")

asyncio.run(main9())

# --- 10. 综合实战 ---
print("\\n=== 10. 综合：限流请求 ===")
async def rate_limited_fetch(urls, rate_limit=3):
    """限流并发请求"""
    sem = asyncio.Semaphore(rate_limit)
    results = []
    
    async def fetch_one(url):
        async with sem:
            await asyncio.sleep(0.05)    # 模拟请求
            return f"OK {url}"
    
    results = await asyncio.gather(*[fetch_one(u) for u in urls])
    return results

async def main10():
    urls = [f"url_{i}" for i in range(10)]
    start = time.time()
    results = await rate_limited_fetch(urls, rate_limit=3)
    elapsed = time.time() - start
    print(f"  10 个请求，限流3，耗时 {elapsed:.2f}s")
    print(f"  预期: {10//3 * 0.05:.2f}s ~ {(10/3)*0.05:.2f}s")

asyncio.run(main10())`
  },

  // -----------------------------------------------------------
  // 第 74 章：模块与包
  // -----------------------------------------------------------
  {
    id: "py9-74",
    group: "类型与现代特性",
    icon: "📦",
    title: "模块与包：组织你的代码",
    content: `## 模块是什么

一个 \`.py\` 文件就是一个模块。\`import\` 用来加载模块。

\`\`\`python
# math_utils.py
def add(a, b):  # 定义函数 add，参数：a, b
    return a + b  # 返回 a + b

# main.py
import math_utils  # 导入模块 math_utils
math_utils.add(1, 2)  # 调用 math_utils.add()：添加元素
\`\`\`

## 导入方式

\`\`\`python
import math                    # 整个模块
import math as m               # 别名
from math import sqrt          # 导入特定名字
from math import sqrt as sq    # 别名
from math import *             # 全部（不推荐）
\`\`\`

## 包是什么

包（package）是含 \`__init__.py\` 的目录，可以有多层：

\`\`\`
myproject/
├── main.py
└── utils/
    ├── __init__.py
    ├── math_tools.py
    └── string_tools.py
\`\`\`

\`\`\`python
from utils.math_tools import add  # 从 utils.math_tools 导入 add
from utils.string_tools import capitalize  # 从 utils.string_tools 导入 capitalize
\`\`\`

## __init__.py 的作用

- 标识一个目录是包
- 控制 \`from package import *\` 导入什么
- 执行包的初始化代码

Python 3.3+ 有"命名空间包"，可以没有 \`__init__.py\`。

## __name__ == "__main__"

\`\`\`python
# mymodule.py
def main():  # 定义函数 main
    print("运行")  # 打印输出到屏幕

if __name__ == "__main__":  # 如果 __name__ == "__main__"
    main()  # 调用 main()
\`\`\`

- 直接运行：\`__name__\` 是 \`"__main__"\`，会执行
- 被 import：\`__name__\` 是模块名，不执行

## sys.path 与搜索路径

Python 找模块的顺序：
1. 当前目录
2. 环境变量 \`PYTHONPATH\`
3. 标准库
4. 第三方库（site-packages）

\`\`\`python
import sys  # 导入模块 sys
print(sys.path)  # 打印输出到屏幕
\`\`\`

## 相对导入

包内部用：

\`\`\`python
from . import other_module    # 当前包
from .. import parent_module  # 父包
\`\`\`

## 本章 demo

demo 用临时目录演示模块和包。`,
    code: `# ============================================
# 第 74 章：模块与包
# ============================================
import os
import sys
import tempfile
import importlib

# --- 1. 模块基本 ---
print("=== 1. 模块 ===")
# 标准库模块
import math
print(f"  math.pi = {math.pi}")
print(f"  math.sqrt(16) = {math.sqrt(16)}")

# 导入特定名字
from math import sqrt, pi, factorial
print(f"  sqrt(25) = {sqrt(25)}")
print(f"  pi = {pi}")
print(f"  factorial(5) = {factorial(5)}")

# 别名
import math as m
print(f"  m.log(100, 10) = {m.log(100, 10)}")

# --- 2. 模块属性 ---
print("\\n=== 2. 模块属性 ===")
print(f"  math.__name__ = {math.__name__}")
print(f"  math.__file__ = {math.__file__}")
print(f"  math.__doc__[:50] = {math.__doc__[:50] if math.__doc__ else '无'}...")
print(f"  math.__dict__ 的键数: {len(math.__dict__)}")

# dir 看模块内容
attrs = [x for x in dir(math) if not x.startswith("_")]
print(f"  math 公开属性前10: {attrs[:10]}")

# --- 3. 创建临时模块 ---
print("\\n=== 3. 自定义模块 ===")
# 在临时目录建一个模块
tmp = tempfile.mkdtemp()
module_path = os.path.join(tmp, "mytools.py")
with open(module_path, "w") as f:
    f.write('''
# 自定义模块 mytools
PI = 3.14159

def add(a, b):
    """加法"""
    return a + b

def multiply(a, b):
    """乘法"""
    return a * b

def circle_area(r):
    """圆面积"""
    return PI * r * r

class Calculator:
    def __init__(self, name):
        self.name = name
    def compute(self, op, a, b):
        ops = {"add": add, "multiply": multiply}
        return ops[op](a, b)

if __name__ == "__main__":
    print("直接运行 mytools")
else:
    print("mytools 被导入")
''')

# 加入搜索路径
sys.path.insert(0, tmp)

# 导入
import mytools
print(f"  mytools.PI = {mytools.PI}")
print(f"  mytools.add(3, 4) = {mytools.add(3, 4)}")
print(f"  mytools.circle_area(5) = {mytools.circle_area(5):.2f}")

calc = mytools.Calculator("我的计算器")
print(f"  calc.compute('add', 10, 20) = {calc.compute('add', 10, 20)}")

# --- 4. from ... import ---
print("\\n=== 4. from import ===")
from mytools import add, multiply, Calculator
print(f"  add(1, 2) = {add(1, 2)}")
print(f"  multiply(3, 4) = {multiply(3, 4)}")

# 导入所有（不推荐，可能冲突）
# from mytools import *

# 别名
from mytools import circle_area as area
print(f"  area(3) = {area(3):.2f}")

# --- 5. __name__ === __main__ ---
print("\\n=== 5. __name__ ===")
print(f"  当前 __name__ = {__name__}")
print(f"  mytools.__name__ = {mytools.__name__}")

# 直接运行 mytools 看效果
import subprocess
result = subprocess.run([sys.executable, module_path], capture_output=True, text=True)
print(f"  直接运行: {result.stdout.strip()}")

# --- 6. 创建包 ---
print("\\n=== 6. 包 ===")
pkg_dir = os.path.join(tmp, "mypackage")
os.makedirs(pkg_dir)

# __init__.py
with open(os.path.join(pkg_dir, "__init__.py"), "w") as f:
    f.write('''
# mypackage/__init__.py
print("mypackage 初始化")

# 控制 from mypackage import * 导入什么
__all__ = ["math_tools", "string_tools"]

VERSION = "1.0.0"
''')

# 子模块 math_tools
with open(os.path.join(pkg_dir, "math_tools.py"), "w") as f:
    f.write('''
def square(x):
    return x ** 2

def cube(x):
    return x ** 3
''')

# 子模块 string_tools
with open(os.path.join(pkg_dir, "string_tools.py"), "w") as f:
    f.write('''
def shout(s):
    return s.upper() + "!"

def whisper(s):
    return s.lower() + "..."
''')

# 子包
sub_pkg = os.path.join(pkg_dir, "advanced")
os.makedirs(sub_pkg)
with open(os.path.join(sub_pkg, "__init__.py"), "w") as f:
    f.write('print("advanced 子包初始化")')
with open(os.path.join(sub_pkg, "stats.py"), "w") as f:
    f.write('''
def mean(nums):
    return sum(nums) / len(nums)
''')

# 导入包
import mypackage
print(f"  mypackage.VERSION = {mypackage.VERSION}")

from mypackage.math_tools import square, cube
print(f"  square(5) = {square(5)}")
print(f"  cube(3) = {cube(3)}")

from mypackage.string_tools import shout, whisper
print(f"  shout('hello') = {shout('hello')!r}")
print(f"  whisper('HELLO') = {whisper('HELLO')!r}")

# 子包
from mypackage.advanced.stats import mean
print(f"  mean([1,2,3,4,5]) = {mean([1, 2, 3, 4, 5])}")

# --- 7. importlib 动态导入 ---
print("\\n=== 7. 动态导入 ===")
# 模块名是字符串时用 importlib
mod = importlib.import_module("mypackage.math_tools")
print(f"  动态导入: {mod}")
print(f"  mod.square(4) = {mod.square(4)}")

# 字符串变量作为模块名
mod_name = "mypackage.string_tools"
mod = importlib.import_module(mod_name)
print(f"  {mod_name}.shout('hi') = {mod.shout('hi')!r}")

# --- 8. 重新加载 ---
print("\\n=== 8. reload ===")
# 修改模块文件
with open(module_path, "a") as f:
    f.write('\\ndef new_func():\\n    return "我是新加的"\\n')

# 重新加载
importlib.reload(mytools)
print(f"  重新加载后:")
print(f"  mytools.new_func() = {mytools.new_func()!r}")

# --- 9. sys.path ---
print("\\n=== 9. sys.path ===")
print(f"  搜索路径数: {len(sys.path)}")
print(f"  前3:")
for p in sys.path[:3]:
    print(f"    {p}")
print(f"  我们的临时目录在不在: {tmp in sys.path}")

# --- 10. 实用：插件系统 ---
print("\\n=== 10. 插件系统 ===")
# 在 mypackage 下建 plugins 目录
plugins_dir = os.path.join(pkg_dir, "plugins")
os.makedirs(plugins_dir)
with open(os.path.join(plugins_dir, "__init__.py"), "w") as f:
    f.write('')

# 两个插件
with open(os.path.join(plugins_dir, "upper.py"), "w") as f:
    f.write('def process(text): return text.upper()')

with open(os.path.join(plugins_dir, "reverse.py"), "w") as f:
    f.write('def process(text): return text[::-1]')

# 动态发现并加载所有插件
def load_plugins(pkg_name):
    """加载一个包里所有插件"""
    pkg = importlib.import_module(pkg_name)
    pkg_path = os.path.dirname(pkg.__file__)
    
    plugins = {}
    for filename in os.listdir(pkg_path):
        if filename.endswith(".py") and not filename.startswith("_"):
            name = filename[:-3]
            full_name = f"{pkg_name}.{name}"
            mod = importlib.import_module(full_name)
            if hasattr(mod, "process"):
                plugins[name] = mod.process
    return plugins

plugins = load_plugins("mypackage.plugins")
print(f"  发现 {len(plugins)} 个插件: {list(plugins.keys())}")

text = "Hello World"
for name, func in plugins.items():
    print(f"  {name}: {text!r} → {func(text)!r}")

# 清理
sys.path.remove(tmp)
import shutil
shutil.rmtree(tmp)
print("\\n  临时文件已清理")`
  },

  // -----------------------------------------------------------
  // 第 75 章：异常处理进阶
  // -----------------------------------------------------------
  {
    id: "py9-75",
    group: "类型与现代特性",
    icon: "🛡️",
    title: "异常处理进阶：自定义异常、上下文",
    content: `## 异常层次

所有异常都是 \`BaseException\` 的子类。常用：

\`\`\`
BaseException
├── SystemExit             # sys.exit()
├── KeyboardInterrupt      # Ctrl+C
└── Exception              # 大部分异常的父类
    ├── ValueError
    ├── TypeError
    ├── KeyError
    ├── IndexError
    ├── AttributeError
    ├── FileNotFoundError
    └── ...
\`\`\`

## 自定义异常

\`\`\`python
class AppError(Exception):  # 定义类 AppError
    """应用基础异常"""  # 执行操作
    pass  # 空操作，占位符

class NotFoundError(AppError):  # 定义类 NotFoundError
    """找不到"""  # 执行操作
    pass  # 空操作，占位符

class DatabaseError(AppError):  # 定义类 DatabaseError
    """数据库错误"""  # 执行操作
    def __init__(self, message, query=None):  # 定义函数 __init__，参数：self, message, query=None
        super().__init__(message)  # 调用父类
        self.query = query  # 执行操作
\`\`\`

自定义异常让错误处理更清晰、更有针对性。

## 异常链：raise from

\`\`\`python
try:  # 尝试执行可能出错的代码
    int("abc")  # 转为整数
except ValueError as e:  # 捕获异常 ValueError
    raise AppError("解析失败") from e    # 保留原因
\`\`\`

\`from e\` 把原始异常作为 \`__cause__\`，链式显示。

## 异常组（Python 3.11+）

\`\`\`python
try:  # 尝试执行可能出错的代码
    raise ExceptionGroup("多个错误", [  # 抛出异常：ExceptionGroup("多个错误", [
        ValueError("值错"),  # 调用 ValueError()
        TypeError("类型错"),  # 调用 TypeError()
    ])
except* ValueError: ...  # 捕获异常
except* TypeError: ...  # 捕获异常
\`\`\`

\`except*\` 同时处理多种异常。

## finally 与资源清理

\`\`\`python
try:  # 尝试执行可能出错的代码
    f = open("f.txt")  # 赋值变量 f
    # ...
finally:  # 无论是否异常都执行
    f.close()    # 无论是否异常都执行
\`\`\`

更推荐用 \`with\`：

\`\`\`python
with open("f.txt") as f:  # 使用上下文管理器：open("f.txt") as f
    # ...
# 自动 close
\`\`\`

## 上下文管理器实现异常抑制

\`__exit__\` 返回 True 会抑制异常：

\`\`\`python
class Suppressor:  # 定义类 Suppressor
    def __enter__(self):  # 定义函数 __enter__，参数：self
        return self  # 返回 self
    def __exit__(self, exc_type, exc, tb):  # 定义函数 __exit__，参数：self, exc_type, exc, tb
        return True    # 吞掉异常
\`\`\`

## 本章 demo

demo 演示自定义异常、异常链、上下文。`,
    code: `# ============================================
# 第 75 章：异常处理进阶
# ============================================

# --- 1. 异常层次 ---
print("=== 1. 异常层次 ===")
print(f"  ValueError 的父类: {ValueError.__bases__}")
print(f"  Exception 的父类: {Exception.__bases__}")
print(f"  BaseException 的父类: {BaseException.__bases__}")

# isinstance 检查
e = ValueError("test")
print(f"  isinstance(ValueError, Exception): {isinstance(e, Exception)}")
print(f"  isinstance(ValueError, BaseException): {isinstance(e, BaseException)}")

# 常见异常
common_exceptions = [
    ValueError, TypeError, KeyError, IndexError,
    AttributeError, FileNotFoundError, ZeroDivisionError,
    RuntimeError, NotImplementedError, StopIteration,
]
print(f"  常见异常:")
for exc in common_exceptions:
    print(f"    {exc.__name__}: {exc.__doc__[:50] if exc.__doc__ else '无'}...")

# --- 2. 自定义异常 ---
print("\\n=== 2. 自定义异常 ===")
class AppError(Exception):
    """应用基础异常"""
    pass

class ValidationError(AppError):
    """数据验证错误"""
    def __init__(self, field, message):
        super().__init__(f"{field}: {message}")
        self.field = field
        self.message = message

class NotFoundError(AppError):
    """资源不存在"""
    def __init__(self, resource, resource_id):
        super().__init__(f"{resource} {resource_id} 不存在")
        self.resource = resource
        self.resource_id = resource_id

class DatabaseError(AppError):
    """数据库错误"""
    def __init__(self, message, query=None):
        super().__init__(message)
        self.query = query

# 使用
def validate_age(age):
    if not isinstance(age, int):
        raise ValidationError("age", "必须是整数")
    if age < 0 or age > 150:
        raise ValidationError("age", f"{age} 不在 0-150 范围")

def get_user(user_id):
    users = {1: "小明", 2: "小红"}
    if user_id not in users:
        raise NotFoundError("用户", user_id)
    return users[user_id]

# 捕获
for age in [18, -5, "abc"]:
    try:
        validate_age(age)
        print(f"  age={age} 合法")
    except ValidationError as e:
        print(f"  age={age} 错误: {e} (字段: {e.field})")

for uid in [1, 99]:
    try:
        user = get_user(uid)
        print(f"  用户 {uid}: {user}")
    except NotFoundError as e:
        print(f"  用户 {uid}: {e} (资源: {e.resource})")

# 用父类捕获
try:
    validate_age("x")
except AppError as e:
    print(f"  用父类 AppError 捕获: {e}")

# --- 3. 异常链 raise from ---
print("\\n=== 3. 异常链 ===")
def parse_int(s):
    """把字符串转 int，失败抛自定义异常"""
    try:
        return int(s)
    except ValueError as e:
        raise ValidationError("number", f"无法解析 '{s}'") from e

try:
    parse_int("abc")
except ValidationError as e:
    print(f"  捕获: {e}")
    print(f"  原因 __cause__: {e.__cause__}")

# 不用 from，隐式链
def parse_int_implicit(s):
    try:
        return int(s)
    except ValueError as e:
        raise ValidationError("number", f"无法解析 '{s}'")

try:
    parse_int_implicit("xyz")
except ValidationError as e:
    print(f"  隐式 __context__: {e.__context__}")

# --- 4. try-except-else-finally ---
print("\\n=== 4. 完整结构 ===")
def safe_divide(a, b):
    """演示完整 try 结构"""
    print(f"  divide({a}, {b})")
    try:
        result = a / b
    except ZeroDivisionError:
        print("    → except: 除零错误")
        return None
    except TypeError as e:
        print(f"    → except: 类型错误 {e}")
        return None
    else:
        # 没异常时执行（放成功逻辑）
        print(f"    → else: 成功 {result}")
        return result
    finally:
        # 总是执行
        print("    → finally: 清理")

safe_divide(10, 2)
safe_divide(10, 0)
safe_divide("a", 2)

# --- 5. 自定义 __str__ ---
print("\\n=== 5. 自定义 __str__ ===")
class HTTPError(Exception):
    """HTTP 错误"""
    def __init__(self, status, message, url=""):
        self.status = status
        self.message = message
        self.url = url
        super().__init__(message)
    
    def __str__(self):
        return f"HTTP {self.status}: {self.message} (url={self.url})"

try:
    raise HTTPError(404, "Not Found", "/api/users/99")
except HTTPError as e:
    print(f"  {e}")
    print(f"  status={e.status}, message={e.message}, url={e.url}")

# --- 6. 异常抑制 ---
print("\\n=== 6. 异常抑制 ===")
class IgnoreErrors:
    """上下文管理器：吞掉指定异常"""
    def __init__(self, *exceptions):
        self.exceptions = exceptions
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc, tb):
        if exc_type and issubclass(exc_type, self.exceptions):
            print(f"  抑制: {exc_type.__name__}: {exc}")
            return True    # 吞掉
        return False    # 其他异常继续抛

# 抑制 ValueError
with IgnoreErrors(ValueError):
    int("abc")
    print("  这行不会执行")

print("  外层继续")

# 抑制多种
with IgnoreErrors(ValueError, TypeError):
    int("abc")

with IgnoreErrors(ValueError, TypeError):
    [1, 2] + "abc"

# 不抑制的会抛
try:
    with IgnoreErrors(ValueError):
        1 / 0    # ZeroDivisionError 不在抑制范围
except ZeroDivisionError:
    print("  ZeroDivisionError 没被抑制，正常抛出")

# --- 7. 断言 ---
print("\\n=== 7. assert ===")
def sqrt(x):
    """平方根，要求 x >= 0"""
    assert x >= 0, f"x 必须非负，得到 {x}"
    return x ** 0.5

print(f"  sqrt(16) = {sqrt(16)}")

try:
    sqrt(-1)
except AssertionError as e:
    print(f"  sqrt(-1) → {e}")

# assert 可以被 -O 优化掉，不要用于生产环境检查
# 生产用 if + raise

# --- 8. 异常处理最佳实践 ---
print("\\n=== 8. 最佳实践 ===")

# ❌ 不要裸 except
def bad_practice():
    try:
        x = int("abc")
    except:    # 会捕获 SystemExit, KeyboardInterrupt 等
        pass

# ✅ 指定异常类型
def good_practice():
    try:
        x = int("abc")
    except ValueError as e:
        print(f"  好: {e}")

good_practice()

# ✅ 不要捕获后吞掉
def log_and_reraise():
    try:
        return int("abc")
    except ValueError as e:
        print(f"  记录日志: {e}")
        raise    # 重新抛出

try:
    log_and_reraise()
except ValueError:
    print("  上层处理")

# --- 9. 实用：重试装饰器 ---
print("\\n=== 9. 重试装饰器 ===")
import time
import random

def retry(times=3, delay=0.1, exceptions=(Exception,)):
    """重试装饰器"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            last_error = None
            for i in range(times):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_error = e
                    print(f"    [重试 {i+1}/{times}] {func.__name__} 失败: {e}")
                    if i < times - 1:
                        time.sleep(delay)
            raise last_error
        return wrapper
    return decorator

@retry(times=3, delay=0.05, exceptions=(ValueError,))
def unreliable():
    """模拟不稳定操作"""
    if random.random() < 0.7:
        raise ValueError("随机失败")
    return "成功"

random.seed(42)
try:
    result = unreliable()
    print(f"  结果: {result}")
except ValueError as e:
    print(f"  最终失败: {e}")

# --- 10. 综合实战 ---
print("\\n=== 10. 综合实战 ===")
class BankAccount:
    """银行账户，演示异常处理"""
    def __init__(self, owner, balance=0):
        if balance < 0:
            raise ValidationError("balance", "不能为负")
        self.owner = owner
        self.balance = balance
    
    def deposit(self, amount):
        if amount <= 0:
            raise ValidationError("amount", "必须为正")
        self.balance += amount
        return self.balance
    
    def withdraw(self, amount):
        if amount <= 0:
            raise ValidationError("amount", "必须为正")
        if amount > self.balance:
            raise InsufficientFundsError(self.balance, amount)
        self.balance -= amount
        return self.balance

class InsufficientFundsError(AppError):
    def __init__(self, balance, requested):
        super().__init__(f"余额不足: 有 {balance}, 要取 {requested}")
        self.balance = balance
        self.requested = requested

# 演示
try:
    acc = BankAccount("小明", 100)
    print(f"  开户: {acc.owner}, 余额 {acc.balance}")
    
    acc.deposit(50)
    print(f"  存50: 余额 {acc.balance}")
    
    acc.withdraw(200)    # 这里会抛
except InsufficientFundsError as e:
    print(f"  取款失败: {e}")
except ValidationError as e:
    print(f"  验证失败: {e}")
except AppError as e:
    print(f"  其他错误: {e}")
finally:
    print("  操作结束")`
  },

  // -----------------------------------------------------------
  // 第 76 章：虚拟环境
  // -----------------------------------------------------------
  {
    id: "py9-76",
    group: "类型与现代特性",
    icon: "🌿",
    title: "虚拟环境与依赖管理",
    content: `## 为什么需要虚拟环境

每个项目可能依赖不同版本的库。如果都装在系统 Python，会冲突。虚拟环境隔离每个项目的依赖。

## venv：标准库

\`\`\`bash
# 创建虚拟环境
python3 -m venv .venv

# 激活（Mac/Linux）
source .venv/bin/activate

# 激活（Windows）
.venv\\Scripts\\activate

# 退出
deactivate
\`\`\`

激活后 \`pip install\` 只装到当前虚拟环境。

## pip：包管理

\`\`\`bash
pip install requests           # 安装
pip install requests==2.28.0   # 指定版本
pip install "requests>=2.28"   # 最低版本
pip uninstall requests         # 卸载
pip list                       # 已装列表
pip freeze > requirements.txt  # 导出依赖
pip install -r requirements.txt # 安装依赖
\`\`\`

## requirements.txt

\`\`\`
requests==2.28.0
flask>=2.0
pandas~=1.5
\`\`\`

版本运算符：
- \`==\`：精确版本
- \`>=\`：最低版本
- \`<=\`：最高版本
- \`~=\`：兼容版本（同 major.minor）
- \`!=\`：排除版本

## pyproject.toml（现代方式）

\`\`\`toml
[project]
name = "myproject"
version = "0.1.0"
dependencies = [
    "requests>=2.28",
    "flask",
]
\`\`\`

## 包管理工具

- **pip**：标准库的包管理器
- **pip-tools**：生成确定性 requirements
- **poetry**：现代依赖管理 + 打包
- **uv**：超快的 Rust 实现（推荐）
- **conda**：数据科学常用

## 常用命令

\`\`\`bash
# 看包信息
pip show requests

# 看依赖树
pip show requests  # 列出依赖

# 升级
pip install --upgrade requests

# 搜索（已废弃，用 pypi.org 搜）
\`\`\`

## 本章 demo

demo 用 Python 代码演示 venv 和 pip（通过 subprocess）。`,
    code: `# ============================================
# 第 76 章：虚拟环境与依赖管理
# ============================================
# 注意：演示环境不实际执行 pip/venv 命令（避免网络下载超时）
# 用模拟函数演示 subprocess.run 的用法和预期输出
import subprocess  # 教学保留：实际项目用 subprocess.run 执行命令
import sys
import os
import tempfile
import shutil

# --- 模拟 subprocess.run（演示环境用） ---
_installed_packages = set()  # 模拟已安装的包

class _MockResult:
    """模拟 subprocess.CompletedResult"""
    def __init__(self, stdout="", stderr="", returncode=0):
        self.stdout = stdout
        self.stderr = stderr
        self.returncode = returncode

def _mock_run(cmd, **kwargs):
    """模拟 subprocess.run，返回预设结果（不实际执行命令）"""
    cmd_str = " ".join(str(c) for c in cmd)
    print(f"  [模拟执行] {cmd_str}")
    if "pip" in cmd and "--version" in cmd:
        return _MockResult("pip 23.0.1 from .../pip (python 3.11)\\n")
    if "venv" in cmd:
        return _MockResult("", "", 0)
    if "-c" in cmd:
        return _MockResult("版本: 3.11.0\\nprefix: /tmp/demo/venv\\nbase: /usr\\n在虚拟环境: True\\n")
    if "install" in cmd:
        # 记录"已安装"的包
        for i, arg in enumerate(cmd):
            if arg == "install" and i + 1 < len(cmd):
                _installed_packages.add(cmd[i + 1])
        return _MockResult("", "", 0)
    if "freeze" in cmd:
        lines = [f"{pkg}==2.28.0" for pkg in sorted(_installed_packages)]
        return _MockResult("\\n".join(lines) + ("\\n" if lines else ""))
    if "show" in cmd:
        return _MockResult(
            "Name: requests\\n"
            "Version: 2.28.0\\n"
            "Summary: Python HTTP for Humans.\\n"
            "Home-page: https://requests.readthedocs.io\\n"
            "Author: Kenneth Reitz\\n"
            "Author-email: me@kennethreitz.org\\n"
            "License: Apache 2.0\\n"
            "Location: /tmp/demo/venv/lib/python3.11/site-packages\\n"
        )
    if "list" in cmd:
        base_lines = ["Package    Version", "---------- -------", "pip        23.0.1", "setuptools 65.5.0"]
        for pkg in sorted(_installed_packages):
            base_lines.append(f"{pkg:<10} 2.28.0")
        return _MockResult("\\n".join(base_lines) + "\\n")
    return _MockResult("", "", 0)

# --- 1. Python 版本信息 ---
print("=== 1. Python 信息 ===")
print(f"  版本: {sys.version}")
print(f"  可执行文件: {sys.executable}")
print(f"  平台: {sys.platform}")
print(f"  前缀: {sys.prefix}")
print(f"  base 前缀: {sys.base_prefix}")
print(f"  在虚拟环境中: {sys.prefix != sys.base_prefix}")

# --- 2. pip 命令 ---
print("\\n=== 2. pip ===")
# 看 pip 版本（模拟）
result = _mock_run(
    [sys.executable, "-m", "pip", "--version"],
    capture_output=True, text=True
)
print(f"  {result.stdout.strip()}")

# 列出已装的包（模拟）
result = _mock_run(
    [sys.executable, "-m", "pip", "list"],
    capture_output=True, text=True
)
lines = result.stdout.strip().split("\\n")
print(f"  已装包数: {len(lines) - 2}")    # 减去标题行
print(f"  前5个:")
for line in lines[:7]:
    print(f"    {line}")

# --- 3. 创建虚拟环境 ---
print("\\n=== 3. 创建虚拟环境 ===")
venv_dir = os.path.join(tempfile.mkdtemp(), "venv")
print(f"  位置: {venv_dir}")

# python -m venv <path>（模拟，不实际创建）
result = _mock_run(
    [sys.executable, "-m", "venv", venv_dir],
    capture_output=True, text=True
)
if result.returncode == 0:
    print(f"  创建成功（模拟）")
else:
    print(f"  创建失败: {result.stderr}")

# 看结构（模拟 venv 目录内容）
print(f"  目录结构:")
for item in ["bin", "lib", "include", "pyvenv.cfg"]:
    print(f"    {item}")

# --- 4. 虚拟环境的 Python ---
print("\\n=== 4. 虚拟环境 Python ===")
if sys.platform == "win32":
    venv_python = os.path.join(venv_dir, "Scripts", "python.exe")
else:
    venv_python = os.path.join(venv_dir, "bin", "python")

print(f"  Python 路径: {venv_python}")
print(f"  存在: True（模拟）")

# 运行虚拟环境的 Python（模拟）
result = _mock_run(
    [venv_python, "-c",
     "import sys; print('版本:', sys.version.split()[0]); "
     "print('prefix:', sys.prefix); "
     "print('base:', sys.base_prefix); "
     "print('在虚拟环境:', sys.prefix != sys.base_prefix)"],
    capture_output=True, text=True
)
print(f"  虚拟环境 Python 输出:")
for line in result.stdout.strip().split("\\n"):
    print(f"    {line}")

# --- 5. 虚拟环境的 pip ---
print("\\n=== 5. 虚拟环境 pip ===")
# 看虚拟环境里有哪些包（应该很少）
result = _mock_run(
    [venv_python, "-m", "pip", "list"],
    capture_output=True, text=True
)
print(f"  虚拟环境已装包:")
for line in result.stdout.strip().split("\\n"):
    print(f"    {line}")

# --- 6. 安装包到虚拟环境 ---
print("\\n=== 6. 安装包 ===")
# 装一个小包（模拟，不实际下载）
result = _mock_run(
    [venv_python, "-m", "pip", "install", "requests", "--quiet"],
    capture_output=True, text=True
)
print(f"  安装 requests: {'成功' if result.returncode == 0 else '失败'}（模拟）")

# 再列
result = _mock_run(
    [venv_python, "-m", "pip", "list"],
    capture_output=True, text=True
)
print(f"  安装后:")
for line in result.stdout.strip().split("\\n")[:10]:
    print(f"    {line}")

# --- 7. freeze 导出依赖 ---
print("\\n=== 7. freeze ===")
result = _mock_run(
    [venv_python, "-m", "pip", "freeze"],
    capture_output=True, text=True
)
print(f"  freeze 输出:")
for line in result.stdout.strip().split("\\n"):
    print(f"    {line}")

# 写入 requirements.txt
req_path = os.path.join(os.path.dirname(venv_dir), "requirements.txt")
with open(req_path, "w") as f:
    f.write(result.stdout)
print(f"  写入 {req_path}")

# --- 8. show 包信息 ---
print("\\n=== 8. show ===")
result = _mock_run(
    [venv_python, "-m", "pip", "show", "requests"],
    capture_output=True, text=True
)
print(f"  requests 信息:")
for line in result.stdout.strip().split("\\n")[:8]:
    print(f"    {line}")

# --- 9. requirements.txt 格式 ---
print("\\n=== 9. requirements 格式 ===")
# 演示各种版本指定
sample = '''
# 精确版本
requests==2.28.0

# 最低版本
flask>=2.0.0

# 范围
django>=3.0,<4.0

# 兼容版本（同 major.minor）
pandas~=1.5.0

# 排除版本
numpy!=1.20.0

# 从 URL
# git+https://github.com/user/repo.git

# 从文件
# -r other-requirements.txt
'''
print(sample)

# --- 10. pyproject.toml 示例 ---
print("\\n=== 10. pyproject.toml ===")
sample_toml = '''[project]
name = "myproject"
version = "0.1.0"
description = "我的项目"
requires-python = ">=3.9"
dependencies = [
    "requests>=2.28",
    "flask>=2.0",
]

[project.optional-dependencies]
dev = [
    "pytest",
    "black",
    "mypy",
]

[project.scripts]
myapp = "myproject.cli:main"
'''
print(sample_toml)

# --- 11. 实用：检查 import 是否可用 ---
print("\\n=== 11. 检查依赖 ===")
def check_import(module_name):
    """检查模块能否导入"""
    try:
        __import__(module_name)
        return True
    except ImportError:
        return False

modules = ["os", "sys", "json", "requests", "flask", "numpy", "pandas"]
for m in modules:
    status = "✓" if check_import(m) else "✗"
    print(f"  {status} {m}")

# --- 12. 清理 ---
print("\\n=== 12. 清理 ===")
parent = os.path.dirname(venv_dir)
shutil.rmtree(parent)
print(f"  临时目录已清理")

# 总结
print("\\n" + "=" * 50)
print("虚拟环境要点：")
print("=" * 50)
print("• 每个项目用独立虚拟环境")
print("• venv 是标准库，python -m venv .venv")
print("• pip install 装包，pip freeze 导出")
print("• requirements.txt 锁定依赖")
print("• pyproject.toml 是现代标准")
print("• 工具：poetry / uv / pip-tools")`
  },

  // -----------------------------------------------------------
  // 第 77 章：unittest
  // -----------------------------------------------------------
  {
    id: "py9-77",
    group: "测试与调试",
    icon: "🧪",
    title: "unittest：单元测试",
    content: `## 单元测试是什么

单元测试是对**单个函数/类**的输入输出验证。Python 标准库 \`unittest\` 提供框架。

## 基本结构

\`\`\`python
import unittest  # 导入模块 unittest

class TestStringMethods(unittest.TestCase):  # 定义类 TestStringMethods
    def test_upper(self):  # 定义函数 test_upper，参数：self
        self.assertEqual("hello".upper(), "HELLO")  # 调用 self.assertEqual()
    
    def test_split(self):  # 定义函数 test_split，参数：self
        s = "hello world"  # 定义字符串 s
        self.assertEqual(s.split(), ["hello", "world"])  # 调用 self.assertEqual()

if __name__ == "__main__":  # 如果 __name__ == "__main__"
    unittest.main()  # 调用 unittest.main()
\`\`\`

## 测试类规则

- 继承 \`unittest.TestCase\`
- 方法名以 \`test_\` 开头
- 用 \`assertXxx\` 断言

## 常用断言

\`\`\`python
self.assertEqual(a, b)       # a == b
self.assertNotEqual(a, b)    # a != b
self.assertTrue(x)           # x 为真
self.assertFalse(x)          # x 为假
self.assertIs(a, b)          # a is b
self.assertIsNot(a, b)       # a is not b
self.assertIn(a, b)          # a in b
self.assertNotIn(a, b)       # a not in b
self.assertIsNone(x)         # x is None
self.assertIsInstance(a, B)  # isinstance(a, B)
self.assertRaises(ValueError)  # 期望抛异常
\`\`\`

## setUp / tearDown

\`\`\`python
class TestXxx(unittest.TestCase):  # 定义类 TestXxx
    def setUp(self):  # 定义函数 setUp，参数：self
        # 每个测试前执行
        self.data = []  # 执行操作
    
    def tearDown(self):  # 定义函数 tearDown，参数：self
        # 每个测试后执行
        pass  # 空操作，占位符
\`\`\`

## setUpClass / tearDownClass

类级别，所有测试共享一次：

\`\`\`python
@classmethod  # 应用装饰器 classmethod
def setUpClass(cls):  # 定义函数 setUpClass，参数：cls
    cls.db = connect()  # 执行操作
\`\`\`

## 异常测试

\`\`\`python
with self.assertRaises(ValueError):  # 使用上下文管理器：self.assertRaises(ValueError)
    int("abc")  # 转为整数
\`\`\`

## 测试发现

\`\`\`bash
python -m unittest discover
\`\`\`

自动发现 \`test_*.py\` 文件。

## 本章 demo

demo 用 unittest 测试一个工具模块。`,
    code: `# ============================================
# 第 77 章：unittest 单元测试
# ============================================
import unittest
import io
import sys

# ============================================================
# 被测试的模块
# ============================================================
def add(a, b):
    return a + b

def divide(a, b):
    if b == 0:
        raise ValueError("除数不能为 0")
    return a / b

def is_palindrome(s):
    """是否回文"""
    s = str(s).lower()
    return s == s[::-1]

class Stack:
    """栈"""
    def __init__(self):
        self.items = []
    def push(self, x):
        self.items.append(x)
    def pop(self):
        if not self.items:
            raise IndexError("栈空")
        return self.items.pop()
    def peek(self):
        if not self.items:
            raise IndexError("栈空")
        return self.items[-1]
    def is_empty(self):
        return len(self.items) == 0
    def size(self):
        return len(self.items)

# ============================================================
# 测试用例
# ============================================================
class TestAdd(unittest.TestCase):
    """测试 add 函数"""
    
    def test_positive(self):
        self.assertEqual(add(1, 2), 3)
        self.assertEqual(add(100, 200), 300)
    
    def test_negative(self):
        self.assertEqual(add(-1, -2), -3)
        self.assertEqual(add(-1, 1), 0)
    
    def test_zero(self):
        self.assertEqual(add(0, 0), 0)
        self.assertEqual(add(5, 0), 5)
    
    def test_float(self):
        self.assertAlmostEqual(add(0.1, 0.2), 0.3, places=7)
    
    def test_string(self):
        self.assertEqual(add("a", "b"), "ab")

class TestDivide(unittest.TestCase):
    """测试 divide 函数"""
    
    def test_normal(self):
        self.assertEqual(divide(10, 2), 5)
        self.assertEqual(divide(9, 3), 3)
    
    def test_float(self):
        self.assertAlmostEqual(divide(1, 3), 0.3333, places=3)
    
    def test_divide_by_zero(self):
        with self.assertRaises(ValueError) as ctx:
            divide(10, 0)
        self.assertIn("除数", str(ctx.exception))
    
    def test_negative(self):
        self.assertEqual(divide(-10, 2), -5)
        self.assertEqual(divide(10, -2), -5)

class TestIsPalindrome(unittest.TestCase):
    """测试 is_palindrome"""
    
    def test_palindrome(self):
        self.assertTrue(is_palindrome("level"))
        self.assertTrue(is_palindrome("racecar"))
        self.assertTrue(is_palindrome("Level"))    # 大小写不敏感
        self.assertTrue(is_palindrome("上海自来水来自海上"))
    
    def test_not_palindrome(self):
        self.assertFalse(is_palindrome("hello"))
        self.assertFalse(is_palindrome("python"))
    
    def test_empty(self):
        self.assertTrue(is_palindrome(""))    # 空字符串是回文
    
    def test_single(self):
        self.assertTrue(is_palindrome("a"))
        self.assertTrue(is_palindrome("中"))

class TestStack(unittest.TestCase):
    """测试 Stack 类"""
    
    def setUp(self):
        """每个测试前执行"""
        self.stack = Stack()
    
    def tearDown(self):
        """每个测试后执行"""
        pass
    
    def test_empty(self):
        self.assertTrue(self.stack.is_empty())
        self.assertEqual(self.stack.size(), 0)
    
    def test_push_pop(self):
        self.stack.push(1)
        self.stack.push(2)
        self.stack.push(3)
        self.assertEqual(self.stack.size(), 3)
        self.assertFalse(self.stack.is_empty())
        
        self.assertEqual(self.stack.pop(), 3)
        self.assertEqual(self.stack.pop(), 2)
        self.assertEqual(self.stack.pop(), 1)
        self.assertTrue(self.stack.is_empty())
    
    def test_peek(self):
        self.stack.push("a")
        self.stack.push("b")
        self.assertEqual(self.stack.peek(), "b")
        self.assertEqual(self.stack.size(), 2)    # peek 不删除
    
    def test_pop_empty(self):
        with self.assertRaises(IndexError):
            self.stack.pop()
    
    def test_peek_empty(self):
        with self.assertRaises(IndexError):
            self.stack.peek()

# ============================================================
# 运行测试
# ============================================================
print("=" * 50)
print("运行单元测试")
print("=" * 50)

# 创建测试套件
def run_tests():
    """运行所有测试并报告"""
    # 加载测试
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # 添加测试类
    suite.addTests(loader.loadTestsFromTestCase(TestAdd))
    suite.addTests(loader.loadTestsFromTestCase(TestDivide))
    suite.addTests(loader.loadTestsFromTestCase(TestIsPalindrome))
    suite.addTests(loader.loadTestsFromTestCase(TestStack))
    
    # 运行
    runner = unittest.TextTestRunner(verbosity=2, stream=sys.stdout)
    result = runner.run(suite)
    
    return result

result = run_tests()

print(f"\\n测试结果:")
print(f"  运行: {result.testsRun}")
print(f"  失败: {len(result.failures)}")
print(f"  错误: {len(result.errors)}")
print(f"  跳过: {len(result.skipped)}")
print(f"  成功: {result.testsRun - len(result.failures) - len(result.errors)}")
print(f"  {'✓ 全部通过' if result.wasSuccessful() else '✗ 有失败'}")

# ============================================================
# 演示：失败测试的样子
# ============================================================
print("\\n" + "=" * 50)
print("演示失败测试")
print("=" * 50)

class TestFailing(unittest.TestCase):
    """故意失败的测试"""
    
    def test_wrong(self):
        self.assertEqual(1, 2, "1 不等于 2")    # 失败
    
    def test_error(self):
        raise RuntimeError("运行时错误")    # 错误

# 运行失败的测试
suite = unittest.TestLoader().loadTestsFromTestCase(TestFailing)
runner = unittest.TextTestRunner(verbosity=2, stream=sys.stdout)
result2 = runner.run(suite)

print(f"\\n失败测试的详情:")
for test, traceback in result2.failures:
    print(f"  失败: {test}")
    print(f"  原因: {traceback.split('AssertionError:')[-1].strip() if 'AssertionError:' in traceback else '见上'}")
for test, traceback in result2.errors:
    print(f"  错误: {test}")
    print(f"  原因: {traceback.split('Error:')[-1].strip() if 'Error:' in traceback else '见上'}")`
  },

  // -----------------------------------------------------------
  // 第 78 章：pytest
  // -----------------------------------------------------------
  {
    id: "py9-78",
    group: "测试与调试",
    icon: "✅",
    title: "pytest：现代测试框架",
    content: `## pytest vs unittest

\`pytest\` 是第三方测试框架，比 \`unittest\` 简洁强大：

- 不用写类（普通函数即可）
- 用 \`assert\` 而不是 \`self.assertEqual\`
- 更好的失败信息
- 丰富的插件

## 安装

\`\`\`bash
pip install pytest
\`\`\`

## 基本用法

\`\`\`python
# test_xxx.py
def test_add():  # 定义函数 test_add
    assert add(1, 2) == 3  # 断言：add(1, 2) == 3

def test_divide():  # 定义函数 test_divide
    assert divide(10, 2) == 5  # 断言：divide(10, 2) == 5
\`\`\`

运行：\`pytest\` 或 \`pytest test_xxx.py\`

## assert 的魔法

pytest 重写 \`assert\`，失败时显示详细对比：

\`\`\`python
def test_list():  # 定义函数 test_list
    assert [1, 2, 3] == [1, 2, 4]  # 断言：[1, 2, 3] == [1, 2, 4]
\`\`\`

失败会显示哪个元素不同。

## 断言异常：raises

\`\`\`python
import pytest  # 导入模块 pytest

def test_zero_division():  # 定义函数 test_zero_division
    with pytest.raises(ZeroDivisionError):  # 使用上下文管理器：pytest.raises(ZeroDivisionError)
        1 / 0  # 执行操作

def test_value_error():  # 定义函数 test_value_error
    with pytest.raises(ValueError, match="invalid"):  # 使用上下文管理器：pytest.raises(ValueError, match="invalid")
        int("abc")  # 转为整数
\`\`\`

\`match\` 用正则匹配异常消息。

## fixture：测试夹具

\`\`\`python
@pytest.fixture  # 应用装饰器 pytest
def sample_data():  # 定义函数 sample_data
    return [1, 2, 3, 4, 5]  # 返回 [1, 2, 3, 4, 5]

def test_sum(sample_data):  # 定义函数 test_sum，参数：sample_data
    assert sum(sample_data) == 15  # 断言：sum(sample_data) == 15
\`\`\`

fixture 是测试的"准备工作"，自动注入。

## fixture 作用域

\`\`\`python
@pytest.fixture(scope="function")  # 默认，每个测试
@pytest.fixture(scope="class")     # 每个类
@pytest.fixture(scope="module")    # 每个模块
@pytest.fixture(scope="session")   # 整个测试会话
\`\`\`

## yield fixture（带清理）

\`\`\`python
@pytest.fixture  # 应用装饰器 pytest
def db():  # 定义函数 db
    conn = connect()  # 赋值变量 conn
    yield conn    # 测试用
    conn.close()  # 测试后清理
\`\`\`

## 参数化测试

\`\`\`python
@pytest.mark.parametrize("a,b,expected", [  # 应用装饰器 pytest
    (1, 2, 3),  # 执行操作
    (10, 20, 30),  # 执行操作
    (-1, 1, 0),  # 执行操作
])
def test_add(a, b, expected):  # 定义函数 test_add，参数：a, b, expected
    assert add(a, b) == expected  # 断言：add(a, b) == expected
\`\`\`

一个测试函数测多组数据。

## mark 标记

\`\`\`python
@pytest.mark.slow  # 应用装饰器 pytest
def test_big():  # 定义函数 test_big
    ...  # 执行操作

@pytest.mark.skip(reason="还没实现")  # 应用装饰器 pytest
def test_todo():  # 定义函数 test_todo
    ...  # 执行操作

# 运行：pytest -m "not slow"
\`\`\`

## 本章 demo

demo 模拟 pytest 用法（不依赖 pytest，用 unittest 模拟）。`,
    code: `# ============================================
# 第 78 章：pytest 测试框架
# ============================================
# 注意：本 demo 用 unittest 模拟 pytest 风格
# 实际使用需 pip install pytest
import unittest
import sys

# ============================================================
# 被测代码
# ============================================================
def factorial(n):
    """阶乘"""
    if n < 0:
        raise ValueError("负数没有阶乘")
    if n <= 1:
        return 1
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

def is_prime(n):
    """是否素数"""
    if n < 2:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    for i in range(3, int(n**0.5) + 1, 2):
        if n % i == 0:
            return False
    return True

def fibonacci(n):
    """斐波那契数列前 n 项"""
    if n <= 0:
        return []
    if n == 1:
        return [1]
    fib = [1, 1]
    while len(fib) < n:
        fib.append(fib[-1] + fib[-2])
    return fib

class Counter:
    """计数器"""
    def __init__(self):
        self.value = 0
    def inc(self, n=1):
        self.value += n
    def dec(self, n=1):
        self.value -= n
    def reset(self):
        self.value = 0

# ============================================================
# pytest 风格的测试（用 unittest 实现）
# ============================================================

print("=" * 50)
print("pytest 风格测试（用 unittest 模拟）")
print("=" * 50)

# --- 1. 简单 assert ---
print("\\n--- 1. 简单测试 ---")

# pytest 风格（如果装了 pytest）：
# def test_factorial():
#     assert factorial(5) == 120
#     assert factorial(0) == 1
#     assert factorial(1) == 1

# unittest 风格：
class TestFactorial(unittest.TestCase):
    """测试阶乘"""
    
    def test_normal(self):
        self.assertEqual(factorial(5), 120)
        self.assertEqual(factorial(10), 3628800)
    
    def test_edge(self):
        self.assertEqual(factorial(0), 1)
        self.assertEqual(factorial(1), 1)
    
    def test_negative(self):
        with self.assertRaises(ValueError):
            factorial(-1)
    
    def test_large(self):
        self.assertEqual(factorial(20), 2432902008176640000)

# --- 2. 参数化测试 ---
print("\\n--- 2. 参数化 ---")

# pytest 风格：
# @pytest.mark.parametrize("n,expected", [
#     (1, False),
#     (2, True),
#     (3, True),
#     (4, False),
#     (5, True),
#     (6, False),
# ])
# def test_is_prime(n, expected):
#     assert is_prime(n) == expected

# unittest 风格（用 subTest）：
class TestIsPrime(unittest.TestCase):
    """测试素数判断"""
    
    def test_primes(self):
        cases = [
            (2, True), (3, True), (5, True), (7, True),
            (11, True), (13, True), (17, True), (19, True),
        ]
        for n, expected in cases:
            with self.subTest(n=n):
                self.assertEqual(is_prime(n), expected)
    
    def test_not_primes(self):
        cases = [
            (1, False), (4, False), (6, False), (8, False),
            (9, False), (10, False), (15, False), (21, False),
        ]
        for n, expected in cases:
            with self.subTest(n=n):
                self.assertEqual(is_prime(n), expected)
    
    def test_large_prime(self):
        self.assertTrue(is_prime(97))
        self.assertFalse(is_prime(100))

# --- 3. fixture 模拟 ---
print("\\n--- 3. fixture ---")

# pytest 风格：
# @pytest.fixture
# def counter():
#     c = Counter()
#     return c
#
# def test_counter(counter):
#     counter.inc(5)
#     assert counter.value == 5

# unittest 风格：
class TestCounter(unittest.TestCase):
    """测试计数器"""
    
    def setUp(self):
        """相当于 fixture"""
        self.counter = Counter()
    
    def test_inc(self):
        self.counter.inc()
        self.assertEqual(self.counter.value, 1)
        self.counter.inc(5)
        self.assertEqual(self.counter.value, 6)
    
    def test_dec(self):
        self.counter.inc(10)
        self.counter.dec(3)
        self.assertEqual(self.counter.value, 7)
    
    def test_reset(self):
        self.counter.inc(100)
        self.counter.reset()
        self.assertEqual(self.counter.value, 0)

# --- 4. yield fixture 模拟（带清理）---
print("\\n--- 4. fixture 带清理 ---")

# pytest 风格：
# @pytest.fixture
# def db_connection():
#     conn = connect()
#     yield conn
#     conn.close()

# unittest 风格：
class TestWithCleanup(unittest.TestCase):
    """演示 fixture 清理"""
    
    def setUp(self):
        self.temp_file = "/tmp/test_data.txt"
        with open(self.temp_file, "w") as f:
            f.write("test data")
    
    def tearDown(self):
        """清理"""
        import os
        if os.path.exists(self.temp_file):
            os.unlink(self.temp_file)
    
    def test_read(self):
        with open(self.temp_file) as f:
            self.assertEqual(f.read(), "test data")

# --- 5. 异常测试 ---
print("\\n--- 5. 异常测试 ---")

# pytest:
# with pytest.raises(ValueError, match="负数"):
#     factorial(-1)

class TestExceptions(unittest.TestCase):
    def test_factorial_negative(self):
        with self.assertRaises(ValueError) as ctx:
            factorial(-5)
        self.assertIn("负数", str(ctx.exception))
    
    def test_factorial_zero(self):
        # 0 应该不抛异常
        self.assertEqual(factorial(0), 1)

# --- 6. 测试斐波那契 ---
print("\\n--- 6. 斐波那契 ---")

class TestFibonacci(unittest.TestCase):
    def test_small(self):
        self.assertEqual(fibonacci(0), [])
        self.assertEqual(fibonacci(1), [1])
        self.assertEqual(fibonacci(2), [1, 1])
    
    def test_normal(self):
        self.assertEqual(fibonacci(5), [1, 1, 2, 3, 5])
        self.assertEqual(fibonacci(10), [1, 1, 2, 3, 5, 8, 13, 21, 34, 55])
    
    def test_property(self):
        """测试性质：每项是前两项之和"""
        fib = fibonacci(20)
        for i in range(2, len(fib)):
            self.assertEqual(fib[i], fib[i-1] + fib[i-2])

# ============================================================
# 运行所有测试
# ============================================================
print("\\n" + "=" * 50)
print("运行所有测试")
print("=" * 50)

loader = unittest.TestLoader()
suite = unittest.TestSuite()

for test_class in [
    TestFactorial, TestIsPrime, TestCounter,
    TestWithCleanup, TestExceptions, TestFibonacci
]:
    suite.addTests(loader.loadTestsFromTestCase(test_class))

runner = unittest.TextTestRunner(verbosity=2, stream=sys.stdout)
result = runner.run(suite)

print(f"\\n{'='*50}")
print(f"测试统计:")
print(f"  总数: {result.testsRun}")
print(f"  失败: {len(result.failures)}")
print(f"  错误: {len(result.errors)}")
success = result.testsRun - len(result.failures) - len(result.errors)
print(f"  通过: {success}")
print(f"  {'✓ 全部通过' if result.wasSuccessful() else '✗ 有失败'}")

# ============================================================
# 演示 pytest 命令行用法
# ============================================================
print(f"\\n{'='*50}")
print("pytest 命令行用法（参考）")
print(f"{'='*50}")

commands = """
# 安装
pip install pytest

# 运行所有测试
pytest

# 详细输出
pytest -v

# 运行特定文件
pytest test_math.py

# 运行特定测试
pytest test_math.py::test_add

# 只运行名字匹配的测试
pytest -k "prime"

# 失败时停止
pytest -x

# 失败时进入 pdb
pytest --pdb

# 显示打印
pytest -s

# 生成报告
pytest --tb=short

# 运行标记的测试
pytest -m slow

# 并行运行
pytest -n 4    # 4进程（需 pytest-xdist）

# 覆盖率
pytest --cov=myproject
"""
print(commands)`
  },

  // -----------------------------------------------------------
  // 第 79 章：调试技巧
  // -----------------------------------------------------------
  {
    id: "py9-79",
    group: "测试与调试",
    icon: "🐛",
    title: "调试技巧：print、pdb、日志",
    content: `## 调试方法

1. **print**：最简单，临时加打印
2. **logging**：比 print 强大，可分级
3. **pdb**：交互式调试器，可断点、单步
4. **IDE 调试**：PyCharm/VS Code 可视化调试
5. **traceback**：分析异常堆栈

## print 调试

\`\`\`python
def buggy(x):  # 定义函数 buggy，参数：x
    print(f"DEBUG: x = {x}, type = {type(x)}")  # 打印输出到屏幕
    result = x * 2  # 赋值变量 result
    print(f"DEBUG: result = {result}")  # 打印输出到屏幕
    return result  # 返回 result
\`\`\`

简单有效，但要记得调试完删掉。

## logging 调试

\`\`\`python
import logging  # 导入模块 logging
logging.basicConfig(level=logging.DEBUG)  # 调用 logging.basicConfig()
logger = logging.getLogger(__name__)  # 赋值变量 logger

def buggy(x):  # 定义函数 buggy，参数：x
    logger.debug(f"x = {x}")  # 调用 logger.debug()
    ...  # 执行操作
\`\`\`

比 print 好：可控制级别、可写到文件。

## pdb：命令行调试器

\`\`\`python
import pdb; pdb.set_trace()    # 断点
\`\`\`

或 Python 3.7+：

\`\`\`python
breakpoint()    # 自动调用 pdb
\`\`\`

### pdb 命令

| 命令 | 作用 |
|---|---|
| n | next，下一步（不进函数）|
| s | step，下一步（进函数）|
| c | continue，继续到下个断点 |
| p x | print x |
| l | list，显示代码 |
| w | where，调用栈 |
| b | breakpoint，设断点 |
| q | quit，退出 |

## 异常堆栈分析

\`\`\`python
import traceback  # 导入模块 traceback
try:  # 尝试执行可能出错的代码
    ...  # 执行操作
except:  # 捕获异常
    traceback.print_exc()  # 调用 traceback.print_exc()
\`\`\`

看堆栈定位问题。

## 常见 bug 模式

1. **可变默认参数**：\`def f(x=[]):\` 共享列表
2. **浅拷贝**：嵌套结构改一个影响另一个
3. **整数除法**：\`/\` 返回浮点，\`//\` 整数
4. **None 比较**：用 \`is None\` 不用 \`== None\`
5. **作用域**：函数内改全局变量

## 本章 demo

demo 演示各种调试技巧。`,
    code: `# ============================================
# 第 79 章：调试技巧
# ============================================
import logging
import sys
import traceback

# --- 1. print 调试 ---
print("=== 1. print 调试 ===")
def calculate_average(numbers):
    """计算平均，用 print 调试"""
    print(f"  [DEBUG] 输入: {numbers}")
    print(f"  [DEBUG] 长度: {len(numbers)}")
    
    if not numbers:
        print(f"  [DEBUG] 空列表，返回 0")
        return 0
    
    total = sum(numbers)
    print(f"  [DEBUG] 总和: {total}")
    
    avg = total / len(numbers)
    print(f"  [DEBUG] 平均: {avg}")
    return avg

result = calculate_average([85, 92, 78, 95])
print(f"  结果: {result}")

# --- 2. 格式化 print ---
print("\\n=== 2. 格式化 ===")
def debug_var(name, value):
    """格式化打印变量"""
    print(f"  {name} = {value!r} (type={type(value).__name__})")

debug_var("x", 42)
debug_var("s", "hello")
debug_var("lst", [1, 2, 3])
debug_var("d", {"a": 1})

# --- 3. logging 调试 ---
print("\\n=== 3. logging 调试 ===")
# 配置 logger
logger = logging.getLogger("debug_demo")
logger.setLevel(logging.DEBUG)
logger.handlers = []
h = logging.StreamHandler(sys.stdout)
h.setFormatter(logging.Formatter("[%(levelname)s] %(message)s"))
logger.addHandler(h)
logger.propagate = False

def process_data(data):
    """用 logging 调试"""
    logger.debug(f"开始处理，数据长度 {len(data)}")
    
    cleaned = [x for x in data if x is not None]
    logger.debug(f"清理后: {cleaned}")
    
    try:
        total = sum(cleaned)
        logger.debug(f"总和: {total}")
        avg = total / len(cleaned)
        logger.info(f"平均: {avg}")
        return avg
    except ZeroDivisionError:
        logger.error("数据为空，无法计算平均")
        return None

print("  正常处理:")
process_data([1, 2, 3, None, 5])
print("\\n  异常处理:")
process_data([None, None])

# --- 4. traceback 分析 ---
print("\\n=== 4. traceback ===")
def level3():
    """最里层"""
    return 1 / 0

def level2():
    """中间层"""
    return level3()

def level1():
    """最外层"""
    return level2()

try:
    level1()
except ZeroDivisionError:
    print("  捕获异常，打印堆栈:")
    traceback.print_exc(file=sys.stdout)

# --- 5. sys.exc_info ---
print("\\n=== 5. sys.exc_info ===")
try:
    int("abc")
except:
    exc_type, exc_value, exc_tb = sys.exc_info()
    print(f"  类型: {exc_type.__name__}")
    print(f"  值: {exc_value}")
    print(f"  文件: {exc_tb.tb_frame.f_code.co_filename}")
    print(f"  行号: {exc_tb.tb_lineno}")

# --- 6. assert 调试 ---
print("\\n=== 6. assert ===")
def divide(a, b):
    """用 assert 检查前置条件"""
    assert isinstance(a, (int, float)), f"a 必须是数字，得到 {type(a)}"
    assert isinstance(b, (int, float)), f"b 必须是数字，得到 {type(b)}"
    assert b != 0, "b 不能为 0"
    return a / b

print(f"  divide(10, 2) = {divide(10, 2)}")

try:
    divide(10, 0)
except AssertionError as e:
    print(f"  assert 触发: {e}")

try:
    divide("a", 2)
except AssertionError as e:
    print(f"  assert 触发: {e}")

# --- 7. 模拟 pdb 调试 ---
print("\\n=== 7. pdb 模拟 ===")
print("  # 代码里加:")
print("  # import pdb; pdb.set_trace()")
print("  # 或 Python 3.7+:")
print("  # breakpoint()")
print("  #")
print("  # pdb 常用命令:")
print("  #   n (next) - 下一步")
print("  #   s (step) - 进入函数")
print("  #   c (continue) - 继续")
print("  #   p x - 打印变量 x")
print("  #   l - 显示代码")
print("  #   w - 调用栈")
print("  #   b - 设断点")
print("  #   q - 退出")

# --- 8. 调试常见 bug ---
print("\\n=== 8. 常见 bug ===")

# Bug 1: 可变默认参数
print("  Bug 1: 可变默认参数")
def buggy_append(x, lst=[]):
    lst.append(x)
    return lst

print(f"    buggy_append(1) = {buggy_append(1)}")
print(f"    buggy_append(2) = {buggy_append(2)}    ← 默认值被共享！")

# 修复
def safe_append(x, lst=None):
    if lst is None:
        lst = []
    lst.append(x)
    return lst

print(f"    safe_append(1) = {safe_append(1)}")
print(f"    safe_append(2) = {safe_append(2)}    ← 修复")

# Bug 2: 浅拷贝
print("\\n  Bug 2: 浅拷贝")
import copy
original = [[1, 2], [3, 4]]
shallow = original.copy()
shallow[0][0] = 99
print(f"    改 shallow 后 original: {original}    ← 浅拷贝影响原数据")

original = [[1, 2], [3, 4]]
deep = copy.deepcopy(original)
deep[0][0] = 99
print(f"    改 deep 后 original: {original}    ← 深拷贝不影响")

# Bug 3: None 比较
print("\\n  Bug 3: None 比较")
x = None
print(f"    x == None: {x == None}    ← 能用但不推荐")
print(f"    x is None: {x is None}    ← 推荐用 is")

# Bug 4: 整数除法
print("\\n  Bug 4: 整数除法")
print(f"    7 / 2 = {7 / 2}    ← 浮点")
print(f"    7 // 2 = {7 // 2}    ← 整数")

# --- 9. 性能调试 ---
print("\\n=== 9. 性能调试 ===")
import time

def slow_function():
    """慢函数"""
    total = 0
    for i in range(1000000):
        total += i
    return total

def fast_function():
    """快函数"""
    return sum(range(1000000))

# 计时
start = time.time()
slow_function()
t_slow = time.time() - start

start = time.time()
fast_function()
t_fast = time.time() - start

print(f"  慢函数: {t_slow:.4f}s")
print(f"  快函数: {t_fast:.4f}s")
print(f"  差距: {t_slow/t_fast:.1f}x")

# --- 10. 综合调试实战 ---
print("\\n=== 10. 综合调试 ===")
def find_buggy_max(numbers):
    """有 bug 的找最大值函数"""
    # BUG: 假设 numbers 非空
    max_val = numbers[0]
    for n in numbers[1:]:
        if n > max_val:
            max_val = n
    return max_val

# 测试
test_cases = [
    ([1, 2, 3, 4, 5], 5),
    ([5, 4, 3, 2, 1], 5),
    ([1], 1),
    ([], None),    # 这个会触发 bug
]

for nums, expected in test_cases:
    try:
        result = find_buggy_max(nums)
        status = "✓" if result == expected else "✗"
        print(f"  {status} find_buggy_max({nums}) = {result}, 期望 {expected}")
    except IndexError as e:
        print(f"  ✗ find_buggy_max({nums}) 抛异常: {e}")
        print(f"    → BUG: 空列表未处理")

# 修复版
def find_max_safe(numbers):
    """修复版"""
    if not numbers:
        return None
    return max(numbers)

print("\\n  修复版:")
for nums, expected in test_cases:
    result = find_max_safe(nums)
    status = "✓" if result == expected else "✗"
    print(f"  {status} find_max_safe({nums}) = {result}")`
  },

  // -----------------------------------------------------------
  // 第 80 章：性能分析
  // -----------------------------------------------------------
  {
    id: "py9-80",
    group: "测试与调试",
    icon: "📊",
    title: "性能分析：找瓶颈",
    content: `## 性能分析工具

1. **time.time()**：简单计时
2. **timeit**：精确测小代码片段
3. **cProfile**：函数级性能分析
4. **memory_profiler**：内存分析
5. **functools.lru_cache**：缓存优化

## 简单计时

\`\`\`python
import time  # 导入模块 time
start = time.time()  # 赋值变量 start
# 代码
elapsed = time.time() - start  # 赋值变量 elapsed
\`\`\`

\`time.perf_counter()\` 更精确（纳秒级）。

## timeit

\`\`\`python
import timeit  # 导入模块 timeit
timeit.timeit("sum(range(100))", number=10000)  # 调用 timeit.timeit()
timeit.timeit("[i**2 for i in range(100)]", number=10000)  # 调用 timeit.timeit()
\`\`\`

测试小代码片段，自动重复。

## cProfile

\`\`\`python
import cProfile  # 导入模块 cProfile
cProfile.run("my_function()")  # 调用 cProfile.run()：运行
\`\`\`

输出每个函数的调用次数、耗时。

\`\`\`bash
python -m cProfile -s cumtime my_script.py
\`\`\`

## 装饰器计时

\`\`\`python
import time  # 导入模块 time
from functools import wraps  # 从 functools 导入 wraps

def timed(func):  # 定义函数 timed，参数：func
    @wraps(func)  # 应用装饰器 wraps
    def wrapper(*args, **kwargs):  # 定义函数 wrapper，参数：*args, **kwargs
        start = time.time()  # 赋值变量 start
        result = func(*args, **kwargs)  # 赋值变量 result
        print(f"{func.__name__}: {time.time()-start:.4f}s")  # 打印输出到屏幕
        return result  # 返回 result
    return wrapper  # 返回 wrapper
\`\`\`

## 性能优化思路

1. **找瓶颈**：先分析，别瞎优化
2. **算法**：换更好的算法（O(n²) → O(n log n)）
3. **数据结构**：用对的（list → set 查找）
4. **缓存**：重复计算用 lru_cache
5. **向量化**：用 numpy 处理数组
6. **C 扩展**：极端性能用 Cython/C

## lru_cache 缓存

\`\`\`python
from functools import lru_cache  # 从 functools 导入 lru_cache

@lru_cache(maxsize=128)  # 应用装饰器 lru_cache
def fib(n):  # 定义函数 fib，参数：n
    if n < 2: return n  # 如果 n < 2
    return fib(n-1) + fib(n-2)  # 返回 fib(n-1) + fib(n-2)
\`\`\`

重复调用同一参数直接返回缓存结果。

## 本章 demo

demo 演示性能分析和优化。`,
    code: `# ============================================
# 第 80 章：性能分析
# ============================================
import time
import timeit
import cProfile
import pstats
import io
import sys
from functools import wraps, lru_cache
from collections import Counter

# --- 1. 简单计时 ---
print("=== 1. 计时 ===")
def sum_loop(n):
    """循环求和"""
    total = 0
    for i in range(n):
        total += i
    return total

def sum_builtin(n):
    """内置函数求和"""
    return sum(range(n))

N = 1_000_000

# time.time
start = time.time()
sum_loop(N)
t1 = time.time() - start

start = time.time()
sum_builtin(N)
t2 = time.time() - start

print(f"  循环求和 {N}: {t1:.4f}s")
print(f"  内置求和 {N}: {t2:.4f}s")
print(f"  内置快 {t1/t2:.1f}x")

# perf_counter 更精确
start = time.perf_counter()
sum_loop(N)
t1 = time.perf_counter() - start
print(f"  perf_counter: {t1:.6f}s")

# --- 2. timeit ---
print("\\n=== 2. timeit ===")
# 测试小代码片段
t_list_comp = timeit.timeit("[i**2 for i in range(100)]", number=10000)
t_map = timeit.timeit("list(map(lambda i: i**2, range(100)))", number=10000)
t_for = timeit.timeit("""
result = []
for i in range(100):
    result.append(i**2)
""", number=10000)

print(f"  列表推导式: {t_list_comp:.4f}s")
print(f"  map:        {t_map:.4f}s")
print(f"  for 循环:   {t_for:.4f}s")

# repeat 多次取最好
results = timeit.repeat("sum(range(100))", number=10000, repeat=3)
print(f"  repeat 3 次: {results}")
print(f"  最好: {min(results):.4f}s")

# --- 3. 装饰器计时 ---
print("\\n=== 3. 计时装饰器 ===")
def timed(func):
    """计时装饰器"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"    {func.__name__}: {elapsed:.6f}s")
        return result
    return wrapper

@timed
def slow_sum(n):
    return sum(range(n))

@timed
def slow_sort(n):
    return sorted(range(n, 0, -1))

print("  调用被计时的函数:")
slow_sum(1_000_000)
slow_sort(10000)

# --- 4. cProfile 分析 ---
print("\\n=== 4. cProfile ===")
def profile_demo():
    """演示 cProfile"""
    # 一些函数调用
    for _ in range(100):
        sum(range(1000))
    for _ in range(50):
        sorted(range(500))
    [i**2 for i in range(1000)]

# 用 cProfile 分析
profiler = cProfile.Profile()
profiler.enable()
profile_demo()
profiler.disable()

# 输出统计
s = io.StringIO()
ps = pstats.Stats(profiler, stream=s).sort_stats("cumulative")
ps.print_stats(10)
print(s.getvalue()[:500])

# --- 5. 找瓶颈 ---
print("\\n=== 5. 找瓶颈 ===")
def process_data():
    """模拟数据处理"""
    # 步骤1：生成
    data = list(range(10000))
    
    # 步骤2：过滤
    filtered = [x for x in data if x % 2 == 0]
    
    # 步骤3：变换
    transformed = [x ** 2 for x in filtered]
    
    # 步骤4：排序
    sorted_data = sorted(transformed, reverse=True)
    
    # 步骤5：统计
    total = sum(sorted_data)
    
    return total

# 分析每步耗时
def process_data_detailed():
    """详细分析每步"""
    data = list(range(10000))
    
    start = time.perf_counter()
    filtered = [x for x in data if x % 2 == 0]
    t1 = time.perf_counter() - start
    
    start = time.perf_counter()
    transformed = [x ** 2 for x in filtered]
    t2 = time.perf_counter() - start
    
    start = time.perf_counter()
    sorted_data = sorted(transformed, reverse=True)
    t3 = time.perf_counter() - start
    
    start = time.perf_counter()
    total = sum(sorted_data)
    t4 = time.perf_counter() - start
    
    print(f"  过滤: {t1:.6f}s")
    print(f"  变换: {t2:.6f}s")
    print(f"  排序: {t3:.6f}s")
    print(f"  求和: {t4:.6f}s")
    print(f"  → 排序最慢，是优化重点")

process_data_detailed()

# --- 6. lru_cache 缓存 ---
print("\\n=== 6. lru_cache ===")
# 无缓存的递归斐波那契
def fib_slow(n):
    if n < 2: return n
    return fib_slow(n-1) + fib_slow(n-2)

# 有缓存的
@lru_cache(maxsize=128)
def fib_fast(n):
    if n < 2: return n
    return fib_fast(n-1) + fib_fast(n-2)

start = time.time()
result1 = fib_slow(30)
t_slow = time.time() - start

start = time.time()
result2 = fib_fast(30)
t_fast = time.time() - start

print(f"  fib(30) = {result1}")
print(f"  无缓存: {t_slow:.4f}s")
print(f"  有缓存: {t_fast:.6f}s")
print(f"  加速: {t_slow/t_fast:.0f}x")

# 看缓存信息
print(f"  缓存信息: {fib_fast.cache_info()}")

# --- 7. 算法对比 ---
print("\\n=== 7. 算法对比 ===")
# 查找：list vs set
import random
data_list = list(range(10000))
random.shuffle(data_list)
data_set = set(data_list)

# 在 list 中查找
start = time.time()
for _ in range(1000):
    9999 in data_list
t_list_find = time.time() - start

# 在 set 中查找
start = time.time()
for _ in range(1000):
    9999 in data_set
t_set_find = time.time() - start

print(f"  1000次查找:")
print(f"  list: {t_list_find:.4f}s")
print(f"  set:  {t_set_find:.6f}s")
print(f"  set 快 {t_list_find/t_set_find:.0f}x    ← 哈希查找 O(1)")

# --- 8. 字符串拼接 ---
print("\\n=== 8. 字符串拼接 ===")
words = ["hello"] * 1000

# 用 + 拼接（慢）
start = time.time()
s = ""
for w in words:
    s += w
t_plus = time.time() - start

# 用 join（快）
start = time.time()
s = "".join(words)
t_join = time.time() - start

# 用推导式 + join
start = time.time()
s = "".join([w for w in words])
t_comp = time.time() - start

print(f"  拼接 1000 个字符串:")
print(f"  + 循环: {t_plus:.6f}s")
print(f"  join:   {t_join:.6f}s")
print(f"  推导+join: {t_comp:.6f}s")
print(f"  join 比 + 快 {t_plus/t_join:.0f}x")

# --- 9. 生成器 vs 列表 ---
print("\\n=== 9. 生成器 vs 列表 ===")
import sys

# 列表
big_list = [x ** 2 for x in range(100000)]
# 生成器
big_gen = (x ** 2 for x in range(100000))

print(f"  列表大小: {sys.getsizeof(big_list):,} 字节")
print(f"  生成器大小: {sys.getsizeof(big_gen):,} 字节")
print(f"  列表 / 生成器 = {sys.getsizeof(big_list) // sys.getsizeof(big_gen)}x")

# 求和性能
start = time.time()
total1 = sum([x ** 2 for x in range(100000)])
t_list_sum = time.time() - start

start = time.time()
total2 = sum(x ** 2 for x in range(100000))
t_gen_sum = time.time() - start

print(f"\\n  求和:")
print(f"  列表推导式: {t_list_sum:.6f}s")
print(f"  生成器:     {t_gen_sum:.6f}s")

# --- 10. 综合优化实战 ---
print("\\n=== 10. 综合优化 ===")

# 原始版本
def count_words_slow(text):
    """慢速词频统计"""
    words = text.split()
    result = {}
    for word in words:
        # 每次都遍历一遍重新计数（O(n²)）
        result[word] = words.count(word)
    return result

# 优化版本1：用 get
def count_words_v1(text):
    words = text.split()
    result = {}
    for word in words:
        result[word] = result.get(word, 0) + 1
    return result

# 优化版本2：用 defaultdict
def count_words_v2(text):
    from collections import defaultdict
    words = text.split()
    result = defaultdict(int)
    for word in words:
        result[word] += 1
    return dict(result)

# 优化版本3：用 Counter
def count_words_v3(text):
    return dict(Counter(text.split()))

# 测试
text = "the quick brown fox jumps over the lazy dog the fox runs " * 100

start = time.time()
r1 = count_words_slow(text)
t1 = time.time() - start

start = time.time()
r2 = count_words_v1(text)
t2 = time.time() - start

start = time.time()
r3 = count_words_v3(text)
t3 = time.time() - start

print(f"  词频统计（{len(text.split())} 词）:")
print(f"  原始（count）: {t1:.4f}s")
print(f"  v1（get）:     {t2:.6f}s    ← 快 {t1/t2:.0f}x")
print(f"  v3（Counter）: {t3:.6f}s    ← 快 {t1/t3:.0f}x")
print(f"  结果一致: {r1 == r2 == r3}")`
  },

  // -----------------------------------------------------------
  // 第 81 章：上下文管理器进阶
  // -----------------------------------------------------------
  {
    id: "py9-81",
    group: "测试与调试",
    icon: "🔧",
    title: "上下文管理器与 with 深入",
    content: `## with 语句的本质

\`with\` 调用对象的 \`__enter__\` 和 \`__exit__\`：

\`\`\`python
with obj as x:  # 使用上下文管理器：obj as x
    # __enter__ 已调用，x 是返回值
    ...  # 执行操作
# __exit__ 自动调用，即使异常
\`\`\`

## 自定义上下文管理器

\`\`\`python
class MyContext:  # 定义类 MyContext
    def __enter__(self):  # 定义函数 __enter__，参数：self
        print("进入")  # 打印输出到屏幕
        return self    # as 变量接收的值
    def __exit__(self, exc_type, exc, tb):  # 定义函数 __exit__，参数：self, exc_type, exc, tb
        print("退出")  # 打印输出到屏幕
        return False    # 不抑制异常
\`\`\`

## __exit__ 处理异常

\`__exit__\` 接收异常信息：

\`\`\`python
def __exit__(self, exc_type, exc, tb):  # 定义函数 __exit__，参数：self, exc_type, exc, tb
    if exc_type is not None:  # 如果 exc_type is not None
        # 有异常
        print(f"异常: {exc}")  # 打印输出到屏幕
    return False    # False: 不抑制；True: 抑制
\`\`\`

## contextlib.contextmanager

用生成器简化：

\`\`\`python
from contextlib import contextmanager  # 从 contextlib 导入 contextmanager

@contextmanager  # 应用装饰器 contextmanager
def my_context():  # 定义函数 my_context
    print("进入")  # 打印输出到屏幕
    try:  # 尝试执行可能出错的代码
        yield "value"    # with 块执行
    finally:  # 无论是否异常都执行
        print("退出")  # 打印输出到屏幕
\`\`\`

yield 的值是 \`as\` 接收的。

## contextlib 其他工具

- \`suppress(*exceptions)\`：抑制指定异常
- \`redirect_stdout/stderr\`：重定向输出
- \`ExitStack\`：动态管理多个上下文
- \`closing(thing)\`：自动调 close

## 多个 with

\`\`\`python
with open("a") as a, open("b") as b:  # 使用上下文管理器：open("a") as a, open("b") as b
    ...  # 执行操作

# 等价
with ExitStack() as stack:  # 使用上下文管理器：ExitStack() as stack
    a = stack.enter_context(open("a"))  # 赋值变量 a
    b = stack.enter_context(open("b"))  # 赋值变量 b
\`\`\`

## 异步上下文管理器

\`\`\`python
class AsyncCtx:  # 定义类 AsyncCtx
    async def __aenter__(self): ...  # 定义异步函数 __aenter__，参数：self
    async def __aexit__(self, *args): ...  # 定义异步函数 __aexit__，参数：self, *args

async with AsyncCtx() as x:  # 执行操作
    ...  # 执行操作
\`\`\`

## 本章 demo

demo 演示上下文管理器各种用法。`,
    code: `# ============================================
# 第 81 章：上下文管理器进阶
# ============================================
import time
import os
import tempfile
import sys
from contextlib import contextmanager, suppress, redirect_stdout, redirect_stderr, ExitStack, closing

# --- 1. 自定义上下文管理器 ---
print("=== 1. 自定义 ===")
class Timer:
    """计时器上下文"""
    def __enter__(self):
        self.start = time.time()
        print("  [进入] 开始计时")
        return self    # as 接收的值
    
    def __exit__(self, exc_type, exc, tb):
        self.elapsed = time.time() - self.start
        print(f"  [退出] 耗时 {self.elapsed:.4f}s")
        if exc_type:
            print(f"  [异常] {exc_type.__name__}: {exc}")
        return False    # 不抑制异常

with Timer() as t:
    print("  执行中...")
    time.sleep(0.1)
    print("  完成")

# 带异常
print("\\n  带异常:")
try:
    with Timer():
        print("  执行中...")
        raise ValueError("测试异常")
except ValueError:
    print("  外层捕获")

# --- 2. contextmanager 装饰器 ---
print("\\n=== 2. contextmanager ===")
@contextmanager
def timer(name="block"):
    """用生成器实现的计时器"""
    start = time.time()
    print(f"  [{name}] 开始")
    try:
        yield    # with 块在这里执行
    finally:
        elapsed = time.time() - start
        print(f"  [{name}] 结束，耗时 {elapsed:.4f}s")

with timer("处理1"):
    time.sleep(0.05)
    print("  正在处理")

# yield 一个值
@contextmanager
def open_db(name):
    """模拟数据库连接"""
    print(f"  连接 {name}")
    conn = {"name": name, "connected": True}
    try:
        yield conn
    finally:
        conn["connected"] = False
        print(f"  关闭 {name}")

with open_db("主库") as db:
    print(f"  使用: {db}")
    print(f"  连接状态: {db['connected']}")

# --- 3. 抑制异常 ---
print("\\n=== 3. suppress ===")
# 手动实现
class IgnoreError:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc, tb):
        if exc_type is ValueError:
            print(f"  抑制 ValueError: {exc}")
            return True
        return False

with IgnoreError():
    int("abc")    # ValueError 被抑制
print("  外层继续")

# 用 contextlib.suppress
with suppress(ValueError, TypeError):
    int("abc")    # 被抑制
    [1] + "a"     # 被抑制
print("  suppress 后继续")

# --- 4. 重定向输出 ---
print("\\n=== 4. redirect ===")
# 重定向 stdout
output = io.StringIO() if (io := __import__("io")) else None

import io
buffer = io.StringIO()
with redirect_stdout(buffer):
    print("这行到 buffer")
    print("这行也到 buffer")
print(f"  buffer 内容: {buffer.getvalue()!r}")

# 实用：捕获 print
@contextmanager
def capture_print():
    """捕获 print 输出"""
    buffer = io.StringIO()
    with redirect_stdout(buffer):
        yield buffer

with capture_print() as out:
    print("hello")
    print("world")
print(f"  捕获: {out.getvalue().split()}")

# --- 5. ExitStack 动态管理 ---
print("\\n=== 5. ExitStack ===")
class Resource:
    def __init__(self, name):
        self.name = name
    def __enter__(self):
        print(f"    获取 {self.name}")
        return self
    def __exit__(self, *args):
        print(f"    释放 {self.name}")
        return False

# 静态多个
print("  静态:")
with Resource("A") as a, Resource("B") as b:
    print("    使用 A B")

# 动态多个
print("\\n  动态:")
with ExitStack() as stack:
    resources = [stack.enter_context(Resource(name)) for name in ["X", "Y", "Z"]]
    print("    使用所有")

# --- 6. 实用：临时文件管理 ---
print("\\n=== 6. 临时文件 ===")
@contextmanager
def temp_file(content=""):
    """创建临时文件，用完删除"""
    path = tempfile.mktemp()
    with open(path, "w") as f:
        f.write(content)
    try:
        yield path
    finally:
        if os.path.exists(path):
            os.unlink(path)
        print(f"  删除 {path}")

with temp_file("hello") as path:
    print(f"  文件: {path}")
    with open(path) as f:
        print(f"  内容: {f.read()!r}")
print(f"  存在: {os.path.exists(path)}")

# --- 7. 实用：切换目录 ---
print("\\n=== 7. 切换目录 ===")
@contextmanager
def cd(path):
    """临时切换工作目录"""
    old = os.getcwd()
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(old)

print(f"  当前: {os.getcwd()}")
tmp = tempfile.mkdtemp()
with cd(tmp):
    print(f"  切换后: {os.getcwd()}")
    # 在新目录建文件
    with open("test.txt", "w") as f:
        f.write("test")
    print(f"  文件存在: {os.path.exists('test.txt')}")
print(f"  回到: {os.getcwd()}")
import shutil
shutil.rmtree(tmp)

# --- 8. 实用：计时装饰器 ---
print("\\n=== 8. 计时 ===")
@contextmanager
def timeit(name=""):
    """计时上下文"""
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        print(f"  [{name or 'block'}] {elapsed:.6f}s")

# 对比两种方法
with timeit("列表推导式"):
    result = [x ** 2 for x in range(100000)]

with timeit("map"):
    result = list(map(lambda x: x ** 2, range(100000)))

# --- 9. 嵌套上下文 ---
print("\\n=== 9. 嵌套 ===")
@contextmanager
def tag(name):
    """HTML 标签"""
    print(f"  <{name}>")
    yield
    print(f"  </{name}>")

with tag("html"):
    with tag("body"):
        with tag("p"):
            print("    Hello World")

# --- 10. 综合实战 ---
print("\\n=== 10. 综合 ===")
class Transaction:
    """模拟数据库事务"""
    def __init__(self, db_name):
        self.db_name = db_name
        self.committed = False
    
    def __enter__(self):
        print(f"  [{self.db_name}] BEGIN")
        self.queries = []
        return self
    
    def __exit__(self, exc_type, exc, tb):
        if exc_type:
            print(f"  [{self.db_name}] ROLLBACK (异常: {exc})")
        else:
            print(f"  [{self.db_name}] COMMIT ({len(self.queries)} 条)")
        return False
    
    def execute(self, sql):
        self.queries.append(sql)
        print(f"  [{self.db_name}] EXEC: {sql}")

# 正常事务
print("  正常:")
with Transaction("主库") as tx:
    tx.execute("INSERT INTO users VALUES (1, '小明')")
    tx.execute("INSERT INTO logs VALUES (now, 'create user')")

# 异常事务
print("\\n  异常:")
try:
    with Transaction("主库") as tx:
        tx.execute("INSERT INTO users VALUES (2, '小红')")
        raise RuntimeError("网络断开")
        tx.execute("这条不会执行")
except RuntimeError:
    print("  外层捕获")

# 嵌套事务
print("\\n  嵌套:")
with ExitStack() as stack:
    tx1 = stack.enter_context(Transaction("主库"))
    tx2 = stack.enter_context(Transaction("从库"))
    tx1.execute("UPDATE users SET active=1")
    tx2.execute("INSERT INTO backup SELECT * FROM users")`
  },

  // -----------------------------------------------------------
  // 第 82 章：测试与调试综合实战
  // -----------------------------------------------------------
  {
    id: "py9-82",
    group: "测试与调试",
    icon: "🎯",
    title: "测试与调试综合实战",
    content: `## 综合运用测试与调试

把 unittest、pytest、调试技巧、性能分析综合起来，做一个完整的项目。

## 项目：学生成绩管理系统

需求：
- 添加学生
- 录入成绩
- 统计分析
- 导入导出

## 开发流程

1. 写代码
2. 写单元测试
3. 调试修复
4. 性能优化
5. 集成测试

## 测试覆盖

- 正常情况
- 边界情况（空数据、最大值）
- 异常情况（错误输入）
- 性能（大数据量）

## 调试技巧

- print 验证逻辑
- logging 记录流程
- assert 检查不变量
- 异常堆栈定位

## 本章 demo

完整实现 + 测试 + 调试。`,
    code: `# ============================================
# 第 82 章：测试与调试综合实战
# ============================================
import unittest
import sys
import logging
import time
from collections import defaultdict

# ============================================================
# 被测代码：学生成绩管理系统
# ============================================================
class StudentNotFoundError(Exception):
    """学生不存在"""
    pass

class DuplicateStudentError(Exception):
    """学生已存在"""
    pass

class InvalidScoreError(Exception):
    """无效成绩"""
    pass

class GradeSystem:
    """学生成绩管理系统"""
    
    def __init__(self):
        self.students = {}    # name -> {subject: score}
    
    def add_student(self, name):
        """添加学生"""
        if name in self.students:
            raise DuplicateStudentError(f"学生 {name} 已存在")
        self.students[name] = {}
        return True
    
    def add_score(self, name, subject, score):
        """录入成绩"""
        if name not in self.students:
            raise StudentNotFoundError(f"学生 {name} 不存在")
        if not isinstance(score, (int, float)):
            raise InvalidScoreError(f"成绩必须是数字，得到 {type(score).__name__}")
        if score < 0 or score > 100:
            raise InvalidScoreError(f"成绩必须在 0-100，得到 {score}")
        self.students[name][subject] = score
        return True
    
    def get_score(self, name, subject):
        """查询成绩"""
        if name not in self.students:
            raise StudentNotFoundError(f"学生 {name} 不存在")
        return self.students[name].get(subject)
    
    def get_average(self, name):
        """学生平均分"""
        if name not in self.students:
            raise StudentNotFoundError(f"学生 {name} 不存在")
        scores = self.students[name].values()
        if not scores:
            return 0
        return sum(scores) / len(scores)
    
    def get_subject_average(self, subject):
        """科目平均分"""
        total = 0
        count = 0
        for scores in self.students.values():
            if subject in scores:
                total += scores[subject]
                count += 1
        return total / count if count else 0
    
    def get_ranking(self, subject=None):
        """排名（按平均分或指定科目）"""
        if subject:
            ranked = sorted(
                [(name, scores.get(subject, 0)) for name, scores in self.students.items()],
                key=lambda x: -x[1]
            )
        else:
            ranked = sorted(
                [(name, sum(scores.values())/len(scores) if scores else 0) 
                 for name, scores in self.students.items()],
                key=lambda x: -x[1]
            )
        return ranked
    
    def get_stats(self):
        """整体统计"""
        all_scores = []
        for scores in self.students.values():
            all_scores.extend(scores.values())
        
        if not all_scores:
            return {"count": 0, "students": 0}
        
        return {
            "students": len(self.students),
            "scores": len(all_scores),
            "max": max(all_scores),
            "min": min(all_scores),
            "avg": sum(all_scores) / len(all_scores),
        }

# ============================================================
# 单元测试
# ============================================================
class TestGradeSystem(unittest.TestCase):
    """成绩系统测试"""
    
    def setUp(self):
        """每个测试前"""
        self.system = GradeSystem()
        # 添加一些学生
        for name in ["小明", "小红", "小刚"]:
            self.system.add_student(name)
    
    def tearDown(self):
        """每个测试后"""
        pass
    
    # --- 添加学生 ---
    def test_add_student(self):
        """测试添加学生"""
        self.assertIn("小明", self.system.students)
        self.assertEqual(len(self.system.students), 3)
    
    def test_add_duplicate(self):
        """测试重复添加"""
        with self.assertRaises(DuplicateStudentError):
            self.system.add_student("小明")
    
    # --- 录入成绩 ---
    def test_add_score(self):
        """测试录入成绩"""
        self.system.add_score("小明", "数学", 90)
        self.assertEqual(self.system.students["小明"]["数学"], 90)
    
    def test_add_score_nonexistent_student(self):
        """测试给不存在的学生录入"""
        with self.assertRaises(StudentNotFoundError):
            self.system.add_score("小王", "数学", 90)
    
    def test_add_score_invalid_type(self):
        """测试无效成绩类型"""
        with self.assertRaises(InvalidScoreError):
            self.system.add_score("小明", "数学", "abc")
    
    def test_add_score_out_of_range(self):
        """测试成绩范围"""
        with self.assertRaises(InvalidScoreError):
            self.system.add_score("小明", "数学", 101)
        with self.assertRaises(InvalidScoreError):
            self.system.add_score("小明", "数学", -1)
    
    # --- 查询 ---
    def test_get_score(self):
        """测试查询成绩"""
        self.system.add_score("小明", "数学", 90)
        self.assertEqual(self.system.get_score("小明", "数学"), 90)
        self.assertIsNone(self.system.get_score("小明", "物理"))
    
    def test_get_score_nonexistent(self):
        """测试查询不存在学生"""
        with self.assertRaises(StudentNotFoundError):
            self.system.get_score("小王", "数学")
    
    # --- 统计 ---
    def test_get_average(self):
        """测试平均分"""
        self.system.add_score("小明", "数学", 90)
        self.system.add_score("小明", "语文", 80)
        self.assertEqual(self.system.get_average("小明"), 85)
    
    def test_get_average_no_scores(self):
        """测试无成绩的平均"""
        self.assertEqual(self.system.get_average("小明"), 0)
    
    def test_get_subject_average(self):
        """测试科目平均"""
        self.system.add_score("小明", "数学", 90)
        self.system.add_score("小红", "数学", 80)
        self.assertEqual(self.system.get_subject_average("数学"), 85)
    
    def test_get_ranking(self):
        """测试排名"""
        self.system.add_score("小明", "数学", 90)
        self.system.add_score("小红", "数学", 95)
        self.system.add_score("小刚", "数学", 85)
        
        ranking = self.system.get_ranking("数学")
        self.assertEqual(ranking[0], ("小红", 95))
        self.assertEqual(ranking[1], ("小明", 90))
        self.assertEqual(ranking[2], ("小刚", 85))
    
    def test_get_stats(self):
        """测试统计"""
        self.system.add_score("小明", "数学", 90)
        self.system.add_score("小红", "数学", 80)
        
        stats = self.system.get_stats()
        self.assertEqual(stats["students"], 3)
        self.assertEqual(stats["scores"], 2)
        self.assertEqual(stats["max"], 90)
        self.assertEqual(stats["min"], 80)
        self.assertEqual(stats["avg"], 85)

# ============================================================
# 运行测试
# ============================================================
print("=" * 50)
print("学生成绩管理系统 - 测试")
print("=" * 50)

loader = unittest.TestLoader()
suite = loader.loadTestsFromTestCase(TestGradeSystem)
runner = unittest.TextTestRunner(verbosity=2, stream=sys.stdout)
result = runner.run(suite)

print(f"\\n  测试: {result.testsRun}, 通过: {result.testsRun - len(result.failures) - len(result.errors)}")
print(f"  {'✓ 全部通过' if result.wasSuccessful() else '✗ 有失败'}")

# ============================================================
# 实际使用演示
# ============================================================
print(f"\\n{'='*50}")
print("实际使用")
print(f"{'='*50}")

system = GradeSystem()

# 添加学生
students_data = [
    ("小明", {"数学": 90, "语文": 85, "英语": 88}),
    ("小红", {"数学": 95, "语文": 92, "英语": 90}),
    ("小刚", {"数学": 78, "语文": 85, "英语": 82}),
    ("小亮", {"数学": 88, "语文": 90, "英语": 95}),
]

for name, scores in students_data:
    system.add_student(name)
    for subject, score in scores.items():
        system.add_score(name, subject, score)

# 统计
print("\\n--- 学生平均分 ---")
for name in system.students:
    avg = system.get_average(name)
    print(f"  {name}: {avg:.1f}")

print("\\n--- 科目平均分 ---")
for subject in ["数学", "语文", "英语"]:
    avg = system.get_subject_average(subject)
    print(f"  {subject}: {avg:.1f}")

print("\\n--- 数学排名 ---")
for i, (name, score) in enumerate(system.get_ranking("数学"), 1):
    print(f"  {i}. {name}: {score}")

print("\\n--- 整体统计 ---")
stats = system.get_stats()
for k, v in stats.items():
    print(f"  {k}: {v}")

# ============================================================
# 调试演示
# ============================================================
print(f"\\n{'='*50}")
print("调试演示")
print(f"{'='*50}")

# 模拟发现 bug
print("\\n--- 模拟调试 ---")
def buggy_ranking(system, subject):
    """有 bug 的排名（漏了未参加考试的）"""
    # 这个版本只排有成绩的，但其实应该处理无成绩的
    ranked = sorted(
        [(name, scores[subject]) for name, scores in system.students.items() if subject in scores],
        key=lambda x: -x[1]
    )
    return ranked

# 添加一个没考数学的学生
system.add_student("小美")
system.add_score("小美", "语文", 70)

print("  数学排名（含未参加的）:")
ranking = system.get_ranking("数学")
for i, (name, score) in enumerate(ranking, 1):
    print(f"    {i}. {name}: {score}")

# 性能测试
print(f"\\n{'='*50}")
print("性能测试")
print(f"{'='*50}")

# 大数据量
big_system = GradeSystem()
start = time.time()
for i in range(1000):
    big_system.add_student(f"student_{i}")
    for j in range(5):
        big_system.add_score(f"student_{i}", f"subject_{j}", 50 + (i + j) % 50)
t_add = time.time() - start

start = time.time()
stats = big_system.get_stats()
t_stats = time.time() - start

start = time.time()
ranking = big_system.get_ranking("subject_0")
t_rank = time.time() - start

print(f"  1000 学生，5 科目:")
print(f"  录入: {t_add:.4f}s")
print(f"  统计: {t_stats:.4f}s")
print(f"  排名: {t_rank:.4f}s")
print(f"  统计结果: {stats}")`
  }
];
