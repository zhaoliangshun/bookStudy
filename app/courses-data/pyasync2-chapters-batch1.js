// =============================================================
// Python asyncio 教程 V2（pyasync2）—— 第一批章节
// -------------------------------------------------------------
// 基础概念（1-4章）
//   第 1 章：为什么要学 asyncio？同步阻塞的痛点
//   第 2 章：async / await 最基础语法
//   第 3 章：coroutine 到底是什么？
//   第 4 章：event loop 事件循环
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：为什么要学 asyncio？同步阻塞的痛点
  // =========================================================
  {
    id: "pa2-01",
    group: "基础概念",
    icon: "🐢",
    title: "为什么要学 asyncio？同步阻塞的痛点",
    content: `## 一、从一个生活例子开始

假设你去餐厅吃饭，点完菜后服务员就在你旁边站着等厨房做好，**啥也不干**，其它客人来了也不接待。

这就是 **同步阻塞**：一个人（线程）在等待时，CPU 啥也不干。

## 二、计算机里的 I/O 等待

程序里最常见的等待：

- 请求网页（网络 I/O）
- 读写文件（磁盘 I/O）
- 连接数据库
- 调用外部 API

这些操作 99% 的时间都在等对方响应，CPU 其实闲着。

\`\`\`python
import time
import requests

# 同步写法：串行请求 3 个网页
def fetch(url):
    return requests.get(url)

urls = ["https://a.com", "https://b.com", "https://c.com"]
for url in urls:
    fetch(url)  # 每个等 1 秒，总共 3 秒
\`\`\`

## 三、两种解决方案

| 方案 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| 多线程 | 一个线程卡住，其它线程继续 | 简单 | GIL、上下文切换开销 |
| asyncio | 单线程内切换任务 | 轻量、高效 | 需要 async/await |

## 四、asyncio 的核心思想

> 当一个任务要等待 I/O 时，主动让出 CPU，去执行其它任务。

就像优秀的服务员：你点完菜，他去服务下一位客人，等菜好了再回来找你。

## 五、适合 asyncio 的场景

✅ 适合：
- 网络爬虫
- Web 服务器
- 聊天程序
- 大量 I/O 操作

❌ 不适合：
- 纯 CPU 计算（用多进程）
- 大量同步阻塞代码

## 六、asyncio vs 多线程

\`\`\`python
# 多线程：开 1000 个线程很重
# asyncio：开 10000 个协程很轻松
\`\`\`

## 七、本章 demo

对比同步和异步执行多个任务的时间差异。
`,
    code: `"""
第一章 demo：同步 vs 异步的时间对比
目标：直观感受 asyncio 在 I/O 等待场景下的优势。
"""
import asyncio
import time


# 模拟一个需要 1 秒钟的网络 I/O 操作
async def async_fetch(name):
    """异步获取：等待时让出 CPU"""
    print(f"  [async] 开始获取 {name}")
    await asyncio.sleep(1)  # 模拟 I/O 等待
    print(f"  [async] 完成获取 {name}")
    return f"{name} 的数据"


def sync_fetch(name):
    """同步获取：阻塞等待"""
    print(f"  [sync] 开始获取 {name}")
    time.sleep(1)  # 阻塞 1 秒
    print(f"  [sync] 完成获取 {name}")
    return f"{name} 的数据"


# ===== 1. 同步执行 =====
print("=== 1. 同步执行 3 个任务 ===")
tasks = ["页面 A", "页面 B", "页面 C"]
start = time.time()
for t in tasks:
    sync_fetch(t)
print(f"  总耗时: {time.time() - start:.2f} 秒（预期 ≈ 3 秒）")
print()


# ===== 2. 异步执行 =====
async def main():
    print("=== 2. 异步执行 3 个任务 ===")
    start = time.time()
    await asyncio.gather(
        async_fetch("页面 A"),
        async_fetch("页面 B"),
        async_fetch("页面 C"),
    )
    print(f"  总耗时: {time.time() - start:.2f} 秒（预期 ≈ 1 秒）")


asyncio.run(main())
print()


# ===== 3. 生活例子：餐厅服务员 =====
print("=== 3. 生活例子 ===")
print("""
  同步阻塞：服务员点完 A 桌的菜，站在厨房门口干等，
            B 桌和 C 桌的客人没人理，CPU（服务员）利用率低。

  asyncio：  服务员点完 A 桌的菜，说“好了我叫你”，
            立刻去服务 B 桌、C 桌。A 桌菜好了再回来上菜。
""")
print()


# ===== 4. 任务数量放大 =====
async def fetch_many():
    """并发获取 10 个页面"""
    print("=== 4. 并发获取 10 个页面 ===")
    start = time.time()
    results = await asyncio.gather(
        *[async_fetch(f"页面 {i}") for i in range(1, 11)]
    )
    elapsed = time.time() - start
    print(f"  完成 {len(results)} 个任务，总耗时: {elapsed:.2f} 秒")
    print(f"  平均每个任务: {elapsed / len(results):.2f} 秒")


asyncio.run(fetch_many())
`,
  },

  // =========================================================
  // 第二章：async / await 最基础语法
  // =========================================================
  {
    id: "pa2-02",
    group: "基础概念",
    icon: "⚡",
    title: "async / await 最基础语法",
    content: `## 一、两个关键字

- \`async\`: 定义一个**协程函数**
- \`await\`: 等待一个**可等待对象**，期间让出 CPU

\`\`\`python
async def hello():
    print("Hello")
    await asyncio.sleep(1)
    print("World")
\`\`\`

## 二、调用协程函数不会立即执行

\`\`\`python
async def foo():
    print("foo")

coro = foo()      # 得到一个协程对象，不是结果
print(coro)       # <coroutine object foo at 0x...>
await coro        # 这里才真正执行
\`\`\`

## 三、asyncio.run 是入口

\`\`\`python
import asyncio

async def main():
    await hello()

asyncio.run(main())  # 程序的入口
\`\`\`

\`asyncio.run\` 会：
1. 创建事件循环
2. 运行传入的协程
3. 关闭事件循环

## 四、await 只能出现在 async 函数里

\`\`\`python
# ❌ 错误
async def a():
    pass

await a()  # SyntaxError
\`\`\`

\`\`\`python
# ✅ 正确
async def main():
    await a()
\`\`\`

## 五、常见的可等待对象

| 类型 | 例子 |
|------|------|
| 协程 | \`await some_coro()\` |
| Task | \`await some_task\` |
| Future | \`await some_future\` |

## 六、async 函数内部可以写同步代码

\`\`\`python
async def compute():
    x = 1 + 1          # 同步代码没问题
    await asyncio.sleep(1)
    return x
\`\`\`

## 七、async 函数返回什么？

返回协程对象，调用方需要 await：

\`\`\`python
async def add(a, b):
    return a + b

result = await add(1, 2)  # result = 3
\`\`\`

## 八、asyncio.run 只能调用一次

\`\`\`python
import asyncio
asyncio.run(main())
asyncio.run(main())  # 通常不建议，会重新创建事件循环
\`\`\`

## 九、本章 demo

练习 async/await 基础语法。
`,
    code: `"""
第二章 demo：async / await 基础语法
目标：理解协程函数、协程对象、asyncio.run 三者的关系。
"""
import asyncio


# ===== 1. 定义和调用协程函数 =====
async def say_hello():
    """一个普通的协程函数"""
    print("  Hello")
    await asyncio.sleep(0.5)
    print("  World")


print("=== 1. 协程函数 vs 协程对象 ===")
coro = say_hello()  # 注意：这里没有执行！
print(f"  coro 的类型: {type(coro).__name__}")
print(f"  coro 是协程对象: {asyncio.iscoroutine(coro)}")

# 需要 await 才会执行
asyncio.run(coro)
print()


# ===== 2. asyncio.run 作为入口 =====
async def main():
    """程序的异步入口"""
    print("=== 2. asyncio.run 入口 ===")
    await say_hello()
    print("  完成")


asyncio.run(main())
print()


# ===== 3. 协程可以返回值 =====
async def add(a, b):
    await asyncio.sleep(0.1)  # 假装在思考
    return a + b


async def compute():
    print("=== 3. 协程返回值 ===")
    x = await add(2, 3)
    y = await add(10, 20)
    print(f"  2 + 3 = {x}")
    print(f"  10 + 20 = {y}")
    print(f"  总和 = {x + y}")


asyncio.run(compute())
print()


# ===== 4. await 让出 CPU =====
async def task(name, n):
    print(f"  [{name}] 开始")
    await asyncio.sleep(n)  # 等待时，其它任务可以执行
    print(f"  [{name}] 结束（等了 {n} 秒）")


async def concurrent():
    print("=== 4. await 让出 CPU ===")
    await asyncio.gather(
        task("短任务", 0.3),
        task("长任务", 0.6),
    )


asyncio.run(concurrent())
print()


# ===== 5. 常见错误演示 =====
print("=== 5. 为什么不能在普通函数里 await ===")
print("""
  # 错误写法：
  def normal():
      await say_hello()  # SyntaxError

  # 正确写法：
  async def wrapper():
      await say_hello()
""")


# ===== 6. 嵌套 await =====
async def step1():
    await asyncio.sleep(0.1)
    return "步骤 1 完成"


async def step2(prev_result):
    await asyncio.sleep(0.1)
    return f"{prev_result} -> 步骤 2 完成"


async def pipeline():
    print("=== 6. 嵌套 await 流水线 ===")
    r1 = await step1()
    r2 = await step2(r1)
    print(f"  {r2}")


asyncio.run(pipeline())
`,
  },

  // =========================================================
  // 第三章：coroutine 到底是什么？
  // =========================================================
  {
    id: "pa2-03",
    group: "基础概念",
    icon: "🌀",
    title: "coroutine 到底是什么？",
    content: `## 一、协程 = 可以暂停的函数

普通函数：

\`\`\`python
def foo():
    print("A")
    print("B")
    print("C")

foo()  # 一次执行完
\`\`\`

协程函数：

\`\`\`python
async def bar():
    print("A")
    await asyncio.sleep(1)  # 暂停，让别人先跑
    print("B")
    await asyncio.sleep(1)  # 再暂停
    print("C")
\`\`\`

## 二、协程对象 vs 普通对象

\`\`\`python
async def foo():
    return 1

obj = foo()  # 协程对象，不是结果
\`\`\`

协程对象保存了函数的执行状态，可以随时恢复。

## 三、asyncio.iscoroutine

\`\`\`python
import asyncio
asyncio.iscoroutine(foo())   # True
asyncio.iscoroutine(foo)     # False
asyncio.iscoroutine(lambda: None)  # False
\`\`\`

## 四、协程的运行状态

一个协程对象有 3 个状态：

1. **创建**：\`coro = foo()\`
2. **运行**：\`await coro\`
3. **完成**：返回结果或抛出异常

## 五、协程不是线程

| 协程 | 线程 |
|------|------|
| 单线程内切换 | 操作系统调度 |
| 用户态切换 | 内核态切换 |
| 轻量 | 较重 |
| 需要 await 让出 | 任意时刻切换 |

## 六、为什么协程高效？

- 切换成本低：不需要保存寄存器、栈等完整上下文
- 一个线程可以跑成千上万个协程
- 没有锁的问题（单线程内切换）

## 七、协程的底层本质

Python 的协程基于 **生成器改进而来**，有自己的栈帧，可以在 await 处挂起。

## 八、本章 demo

深入理解协程对象和状态。
`,
    code: `"""
第三章 demo：coroutine 到底是什么？
目标：理解协程对象、状态、以及与线程的区别。
"""
import asyncio
import inspect


# ===== 1. 协程对象 =====
async def simple():
    await asyncio.sleep(0.1)
    return "done"


print("=== 1. 协程对象 ===")
coro = simple()
print(f"  coro = {coro}")
print(f"  类型: {type(coro).__name__}")
print(f"  是协程对象: {asyncio.iscoroutine(coro)}")
print(f"  是协程函数: {asyncio.iscoroutinefunction(simple)}")
coro.close()  # 仅演示类型/状态，关闭避免 RuntimeWarning: coroutine was never awaited
print()


# ===== 2. 手动驱动协程（理解 await 本质） =====
print("=== 2. 手动驱动协程 ===")


async def two_step():
    print("  步骤 1")
    await asyncio.sleep(0)  # sleep(0) 走快路径（仅 yield），手动 send 驱动时无需运行中的事件循环
    print("  步骤 2")
    await asyncio.sleep(0)
    print("  步骤 3")
    return "finished"


coro = two_step()
loop = asyncio.new_event_loop()

try:
    # 第一次 send(None) 启动协程
    result = coro.send(None)
    print(f"  send(None) 返回: {result}")  # 返回需要等待的 Future

    # 模拟等待完成后再驱动
    while True:
        try:
            result = coro.send(None)
            print(f"  继续驱动，返回: {result}")
            # 这里简化处理：直接再 send 一次
        except StopIteration as e:
            print(f"  协程完成，返回值: {e.value}")
            break
finally:
    loop.close()
print()


# ===== 3. 协程的代码对象 =====
print("=== 3. 协程的代码对象 ===")
print(f"  协程代码名: {simple.__code__.co_name}")
print(f"  是否是协程标志: {bool(simple.__code__.co_flags & inspect.CO_COROUTINE)}")
print()


# ===== 4. 协程 vs 线程的数量对比 =====
async def tiny():
    await asyncio.sleep(0.01)
    return 1


async def many_coroutines():
    print("=== 4. 创建 10000 个协程 ===")
    tasks = [tiny() for _ in range(10000)]
    results = await asyncio.gather(*tasks)
    print(f"  完成 {len(results)} 个协程")


asyncio.run(many_coroutines())
print()


# ===== 5. 协程不能多次运行 =====
print("=== 5. 协程是一次性的 ===")
coro1 = simple()
print(f"  第一次 await: {asyncio.run(coro1)}")
# coro1 已经用完了，不能再 await
try:
    asyncio.run(coro1)
except RuntimeError as e:
    print(f"  再次 await 报错: {type(e).__name__}: {e}")
print()


# ===== 6. 协程可以嵌套 =====
async def inner():
    await asyncio.sleep(0.1)
    return "inner result"


async def outer():
    print("  outer 开始")
    x = await inner()
    print(f"  收到: {x}")
    return f"outer result based on {x}"


print("=== 6. 协程嵌套 ===")
print(asyncio.run(outer()))
`,
  },

  // =========================================================
  // 第四章：event loop 事件循环
  // =========================================================
  {
    id: "pa2-04",
    group: "基础概念",
    icon: "🔄",
    title: "event loop 事件循环",
    content: `## 一、什么是事件循环？

事件循环是 asyncio 的**心脏**。

它负责：
- 管理所有协程
- 决定哪个协程现在跑
- 在 I/O 准备好时唤醒协程

## 二、生活例子

事件循环就像一个**调度员**：

> 有很多任务要处理，调度员把它们排好队，谁的任务可以做了就叫谁。

## 三、asyncio.run 内部做了什么？

\`\`\`python
asyncio.run(main())
\`\`\`

等价于：

\`\`\`python
import asyncio
loop = asyncio.new_event_loop()
try:
    loop.run_until_complete(main())
finally:
    loop.close()
\`\`\`

## 四、获取当前事件循环

\`\`\`python
import asyncio
loop = asyncio.get_event_loop()
print(loop)
\`\`\`

## 五、事件循环的工作原理

简化版：

1. 把要运行的协程放入队列
2. 从队列取出一个协程，让它运行
3. 遇到 \`await\` 暂停，把它挂起
4. 检查有没有 I/O 完成
5. I/O 完成了，唤醒对应协程
6. 重复直到所有协程完成

## 六、为什么不能自己创建 loop？

在普通脚本里，推荐用 \`asyncio.run\`，它会自动管理。

在以下场景需要手动获取 loop：
- 库开发
- 与已有事件循环集成
- 测试框架

## 七、事件循环策略

\`\`\`python
# Windows 默认用 SelectorEventLoop
# Linux 默认用 EpollSelector
\`\`\`

## 八、本章 demo

观察事件循环的行为。
`,
    code: `"""
第四章 demo：event loop 事件循环
目标：理解事件循环是 asyncio 的调度核心。
"""
import asyncio


# ===== 1. asyncio.run 内部就是事件循环 =====
async def hello():
    print("  Hello from event loop!")
    await asyncio.sleep(0.1)
    print("  Done!")


print("=== 1. asyncio.run 启动事件循环 ===")
asyncio.run(hello())
print()


# ===== 2. 手动创建和关闭事件循环 =====
print("=== 2. 手动创建事件循环 ===")
loop = asyncio.new_event_loop()
try:
    loop.run_until_complete(hello())
finally:
    loop.close()
    print("  事件循环已关闭")
print()


# ===== 3. 获取当前事件循环 =====
async def show_loop():
    loop = asyncio.get_event_loop()
    print(f"  当前事件循环: {loop}")
    print(f"  是否在运行: {loop.is_running()}")


print("=== 3. 获取当前事件循环 ===")
asyncio.run(show_loop())
print()


# ===== 4. 事件循环调度多个任务 =====
async def worker(name, delay):
    print(f"  [{name}] 进入事件循环")
    await asyncio.sleep(delay)
    print(f"  [{name}] 完成（等待了 {delay} 秒）")


async def scheduler_demo():
    print("=== 4. 事件循环调度任务 ===")
    await asyncio.gather(
        worker("A", 0.3),
        worker("B", 0.1),
        worker("C", 0.2),
    )


asyncio.run(scheduler_demo())
print()


# ===== 5. 事件循环的简化示意图 =====
print("=== 5. 事件循环工作流程 ===")
print("""
  1. 创建事件循环
  2. 把 main() 协程放进循环
  3. 运行协程，直到遇到 await
  4. await 的对象进入等待队列
  5. 循环去执行其它已就绪的协程
  6. I/O/定时器到期后，唤醒等待的协程
  7. 所有协程完成后，关闭循环
""")


# ===== 6. 嵌套事件循环会报错 =====
print("=== 6. 不要在已有 loop 里调用 asyncio.run ===")
print("""
  # 错误写法：
  async def main():
      asyncio.run(other())  # RuntimeError

  # 正确写法：
  async def main():
      await other()
""")


# ===== 7. 任务优先级模拟 =====
async def priority_task(name, priority):
    print(f"  [优先级 {priority}] {name} 开始")
    await asyncio.sleep(0.1)
    print(f"  [优先级 {priority}] {name} 结束")


async def priority_demo():
    print("=== 7. 事件循环按就绪顺序执行 ===")
    # 创建顺序不代表执行顺序
    t1 = asyncio.create_task(priority_task("任务 1", 1))
    t2 = asyncio.create_task(priority_task("任务 2", 2))
    t3 = asyncio.create_task(priority_task("任务 3", 3))
    await t1
    await t2
    await t3


asyncio.run(priority_demo())
`,
  },
];
