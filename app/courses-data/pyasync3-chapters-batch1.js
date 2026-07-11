// =============================================================
// Python asyncio 教程 V3（pyasync3）—— 第一批章节，基础入门（1-4章）
// -------------------------------------------------------------
// 风格：demo 驱动，先看 demo 再讲知识点，简单简单再简单。
//   第 1 章：第一个 asyncio 程序（同步 vs 异步）
//   第 2 章：async 和 await 两个关键字
//   第 3 章：协程对象到底是什么
//   第 4 章：事件循环 event loop
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：第一个 asyncio 程序
  // =========================================================
  {
    id: "pa3-01",
    group: "基础入门",
    icon: "🚀",
    title: "第一个 asyncio 程序",
    content: `## 先看一个 demo

让 3 个任务各自"睡" 0.3 秒（模拟网络等待）：

- 同步写法：一个一个等，总耗时 ≈ 0.9 秒
- 异步写法：一起等，总耗时 ≈ 0.3 秒

跑一下下面的代码，你会看到 asyncio 快了 3 倍。

## 从 demo 里学到了什么

| 现象 | 原因 |
|------|------|
| 同步慢 | \`time.sleep\` 阻塞，CPU 干等 |
| 异步快 | \`asyncio.sleep\` 等待时让出 CPU，去跑别的任务 |
| 代码几乎一样 | 只多了 \`async\` / \`await\` 两个关键字 |

## 生活类比：餐厅服务员

- **同步服务员**：A 桌点完菜，站厨房门口等，B 桌喊破喉咙也不理
- **asyncio 服务员**：A 桌点完菜，说"好了叫你"，立刻去服务 B 桌、C 桌

asyncio 的核心就一句话：**等待时让出 CPU，去干别的。**

## 知识点小结

- 为什么要学 asyncio：I/O 等待时 CPU 闲着，太浪费
- 同步阻塞 vs 异步非阻塞：\`time.sleep\` vs \`asyncio.sleep\`
- asyncio 核心思想：等待时让出 CPU
`,
    code: `"""
第一章 demo：同步 vs 异步，跑 3 个任务比谁快
目标：用眼睛看到 asyncio 比 sync 快。
"""
import asyncio
import time


# 模拟一次网络请求（耗时 0.3 秒）
def sync_task(name):
    """同步任务：用 time.sleep 阻塞"""
    print(f"  [{name}] 开始")
    time.sleep(0.3)  # 阻塞：整个程序卡住，CPU 啥也不干
    print(f"  [{name}] 结束")


async def async_task(name):
    """异步任务：用 asyncio.sleep 等待"""
    print(f"  [{name}] 开始")
    await asyncio.sleep(0.3)  # 非阻塞：告诉事件循环"我先等 0.3 秒"，CPU 去跑别人
    print(f"  [{name}] 结束")


# ===== 1. 同步执行 3 个任务 =====
print("=== 1. 同步：一个一个来 ===")
start = time.time()
sync_task("A")  # 等 0.3 秒
sync_task("B")  # 再等 0.3 秒
sync_task("C")  # 再等 0.3 秒
print(f"  同步总耗时: {time.time() - start:.2f} 秒（预期 ≈ 0.9 秒）")
print()


# ===== 2. 异步执行 3 个任务 =====
async def main():
    print("=== 2. 异步：一起来 ===")
    start = time.time()
    await asyncio.gather(  # gather = 把多个任务一起跑
        async_task("A"),
        async_task("B"),
        async_task("C"),
    )
    print(f"  异步总耗时: {time.time() - start:.2f} 秒（预期 ≈ 0.3 秒）")


asyncio.run(main())  # 程序入口：启动事件循环，跑 main
print()


# ===== 3. 为什么异步快？=====
print("=== 3. 原理：等待时让出 CPU ===")
print("""
  time.sleep(0.3)          -> 整个程序卡住 0.3 秒，CPU 发呆
  await asyncio.sleep(0.3) -> 告诉事件循环"我先等 0.3 秒"，CPU 去跑别的任务
                              0.3 秒到了，事件循环再回来叫我
""")
print()


# ===== 4. 生活类比：餐厅服务员 =====
print("=== 4. 餐厅服务员 ===")
print("""
  同步服务员：  点完 A 桌的菜 -> 站厨房等 -> 上菜 -> 才去 B 桌
                3 桌客人 = 3 倍时间

  asyncio 服务员：点完 A 桌 -> "好了叫我" -> 立刻去 B 桌 -> 再去 C 桌
                  三桌的菜同时在厨房做，总时间 ≈ 最慢的那一桌
""")
`,
  },

  // =========================================================
  // 第二章：async 和 await 两个关键字
  // =========================================================
  {
    id: "pa3-02",
    group: "基础入门",
    icon: "⚡",
    title: "async 和 await 两个关键字",
    content: `## 先看一个 demo

定义一个 \`async def\` 函数，调用它，看看返回什么：

\`\`\`python
async def hello():
    return "hi"

obj = hello()        # 返回的不是 "hi"，是一个协程对象
print(obj)           # <coroutine object hello at 0x...>
await obj            # 这里才真正执行，拿到 "hi"
\`\`\`

跑下面的 demo，你会看到"调用 ≠ 执行"。

## 从 demo 里学到的

| 现象 | 说明 |
|------|------|
| \`hello()\` 不打印东西 | 调用协程函数只产生协程对象，不执行 |
| \`await obj\` 才执行 | await 是"启动开关" |
| \`asyncio.run(main())\` | 程序的最外层入口 |

## 生活类比：打电话

- \`async def\` = 电话号码（定义好不代表打通了）
- \`hello()\` = 拨号，听到彩铃（拿到协程对象，但还没人接）
- \`await\` = 真正接通，开始说话（执行）

## 知识点小结

- \`async def\` 定义协程函数
- 调用它返回**协程对象**，不是结果
- \`await\` 才真正执行
- \`asyncio.run\` 是程序入口（最外层）
- \`await\` 只能写在 \`async\` 函数里
`,
    code: `"""
第二章 demo：async 和 await 两个关键字
目标：搞懂"定义协程"、"调用得到对象"、"await 才执行"。
"""
import asyncio


# ===== 1. 协程函数 vs 协程对象 =====
async def hello():
    """一个协程函数：用 async def 定义"""
    print("  你好，asyncio！")
    return "done"


print("=== 1. 调用协程函数，得到的是对象 ===")
obj = hello()  # 注意：这里没有打印 "你好"，因为还没执行！
print(f"  obj 的类型: {type(obj).__name__}")  # coroutine
print(f"  obj 本身: {obj}")
print(f"  是协程对象吗: {asyncio.iscoroutine(obj)}")
obj.close()  # 只演示类型，不运行；关掉避免 RuntimeWarning: coroutine was never awaited
print()


# ===== 2. asyncio.run 是入口 =====
async def main():
    """程序的异步入口"""
    print("=== 2. asyncio.run 入口 ===")
    result = await hello()  # await 才真正执行协程
    print(f"  收到返回值: {result}")


asyncio.run(main())  # 最外层入口：启动事件循环跑 main
print()


# ===== 3. 协程可以返回值 =====
async def add(a, b):
    await asyncio.sleep(0.1)  # 假装在算
    return a + b


async def calc():
    print("=== 3. 协程返回值 ===")
    x = await add(2, 3)  # await 拿到 return 的值
    print(f"  2 + 3 = {x}")
    y = await add(10, 20)
    print(f"  10 + 20 = {y}")


asyncio.run(calc())
print()


# ===== 4. await 让出 CPU =====
async def task(name, n):
    print(f"  [{name}] 开始")
    await asyncio.sleep(n)  # 等待时让出 CPU，别人能跑
    print(f"  [{name}] 结束（等了 {n} 秒）")


async def concurrent():
    print("=== 4. await 让出 CPU ===")
    await asyncio.gather(
        task("A", 0.3),
        task("B", 0.1),
    )
    # B(0.1) 先结束，A(0.3) 后结束——说明等待时 CPU 没闲着


asyncio.run(concurrent())
print()


# ===== 5. 常见错误演示 =====
print("=== 5. 常见错误 ===")
print("""
  错误 1：在普通函数里 await
    def normal():
        await hello()   # SyntaxError: 'await' outside async function
                        # 修复：把 def 改成 async def

  错误 2：调用协程函数却不 await
    async def main():
        hello()         # RuntimeWarning: coroutine was never awaited
                        # 修复：await hello()

  错误 3：在 async 函数里再调 asyncio.run
    async def main():
        asyncio.run(hello())  # RuntimeError: cannot be called from a running event loop
                        # 修复：await hello()
""")
`,
  },

  // =========================================================
  // 第三章：协程对象到底是什么
  // =========================================================
  {
    id: "pa3-03",
    group: "基础入门",
    icon: "🌀",
    title: "协程对象到底是什么",
    content: `## 先看一个 demo

创建一个协程对象，看看它到底是什么：

\`\`\`python
async def foo():
    return 1

coro = foo()
print(type(coro))                  # <class 'coroutine'>
print(asyncio.iscoroutine(coro))   # True
\`\`\`

跑下面 demo，你会看到：协程对象很轻，10000 个不在话下。

## 从 demo 里学到的

| 现象 | 说明 |
|------|------|
| \`type(coro)\` 是 coroutine | 协程对象是一种独立类型 |
| \`iscoroutine(coro)\` 为 True | 用来判断是不是协程 |
| 一个协程对象只能 await 一次 | 用完就废 |
| 10000 个协程很轻松 | 协程轻量，不像线程那么重 |

## 生活类比：电影票

- 协程对象 = 一张电影票（买了不代表看完了）
- \`await\` = 检票进场（执行）
- 一张票只能检一次（协程一次性）

## 知识点小结

- 协程 = **可以暂停的函数**
- 协程对象 vs 普通函数调用：调用不执行，await 才执行
- 协程一次性：await 完不能再用
- 协程轻量：单线程能跑成千上万个
- 协程不是线程（单线程内切换，用户态）
`,
    code: `"""
第三章 demo：协程对象到底是什么
目标：把"协程对象"这个抽象概念看清楚。
"""
import asyncio
import threading


# ===== 1. 协程对象的类型 =====
async def foo():
    await asyncio.sleep(0.1)
    return 42


print("=== 1. 协程对象是什么类型 ===")
coro = foo()  # 创建协程对象（还没执行）
print(f"  coro = {coro}")
print(f"  type(coro) = {type(coro)}")
print(f"  是协程对象: {asyncio.iscoroutine(coro)}")
coro.close()  # 只看类型不运行，关掉避免警告
print()


# ===== 2. iscoroutine 检查 =====
async def bar():
    pass


def normal():
    pass


print("=== 2. 用 iscoroutine 判断 ===")
c = bar()
print(f"  bar() 是协程: {asyncio.iscoroutine(c)}")        # True（协程对象）
print(f"  bar 是协程: {asyncio.iscoroutine(bar)}")         # False（是函数，不是对象）
print(f"  normal() 是协程: {asyncio.iscoroutine(normal())}")  # False（普通返回值 None）
c.close()
print()


# ===== 3. 协程是一次性的 =====
async def one():
    return "结果"


print("=== 3. 协程只能 await 一次 ===")
coro1 = one()
r = asyncio.run(coro1)  # 第一次 await：正常
print(f"  第一次 await: {r}")
try:
    asyncio.run(coro1)  # 同一个对象再 await 一次
except RuntimeError as e:
    print(f"  第二次 await 报错: {type(e).__name__}")
    print(f"  错误信息: {e}")
print()


# ===== 4. 创建 10000 个协程，对比轻量 =====
async def tiny():
    await asyncio.sleep(0.01)
    return 1


async def many():
    print("=== 4. 一次跑 10000 个协程 ===")
    coros = [tiny() for _ in range(10000)]  # 10000 个协程对象
    results = await asyncio.gather(*coros)  # 一起跑
    print(f"  完成 {len(results)} 个，结果总和: {sum(results)}")
    print(f"  （要是线程，10000 个基本爆掉；协程轻轻松松）")


asyncio.run(many())
print()


# ===== 5. 协程可以嵌套 =====
async def inner():
    await asyncio.sleep(0.1)
    return "内层结果"


async def outer():
    print("=== 5. 协程嵌套 ===")
    print("  outer 开始")
    x = await inner()  # 在协程里 await 另一个协程
    print(f"  outer 收到: {x}")
    return f"outer 基于 {x} 完成"


print(asyncio.run(outer()))
print()


# ===== 6. 协程不是线程 =====
async def show_threads():
    print("=== 6. 协程不是线程 ===")
    print(f"  跑了这么多协程，当前线程数: {threading.active_count()}")
    print("  （说明协程都在同一个线程里切换）")


asyncio.run(show_threads())
print("""
  协程：单线程内切换，用户态，轻量，需要 await 让出
  线程：操作系统调度，内核态，较重，随时可能被切换
  10000 个协程：轻松
  10000 个线程：基本不可能（默认线程栈就几 GB）
""")
`,
  },

  // =========================================================
  // 第四章：事件循环 event loop
  // =========================================================
  {
    id: "pa3-04",
    group: "基础入门",
    icon: "🔄",
    title: "事件循环 event loop",
    content: `## 先看一个 demo

\`\`\`python
import asyncio

async def main():
    print("hello")

# 方式一：用 asyncio.run（推荐）
asyncio.run(main())

# 方式二：手动创建事件循环（看内部）
loop = asyncio.new_event_loop()
loop.run_until_complete(main())
loop.close()
\`\`\`

跑下面 demo，你会看到 \`asyncio.run\` 内部到底做了什么。

## 从 demo 里学到的

| 现象 | 说明 |
|------|------|
| \`asyncio.run\` 三步走 | 创建 loop → 运行 → 关闭 |
| 手动 loop 也能跑 | 本质和 run 一样 |
| 协程里能拿到当前 loop | \`asyncio.get_event_loop()\` |
| 不能嵌套 \`asyncio.run\` | 会报 RuntimeError |

## 事件循环 = 调度员

> 事件循环像餐厅经理：手下一堆服务员（协程），谁有空就叫谁上菜。

简化 6 步：

1. 创建事件循环
2. 把 main 协程放进去
3. 跑协程，遇到 await 暂停
4. 暂停的进等待队列
5. I/O/定时好了，唤醒对应协程
6. 全部完成，关闭循环

## 知识点小结

- 事件循环是 asyncio 的心脏（调度员）
- \`asyncio.run\` 内部：创建 loop → 运行 → 关闭
- \`asyncio.get_event_loop()\` 获取当前 loop
- 不能嵌套 \`asyncio.run\`
`,
    code: `"""
第四章 demo：事件循环 event loop
目标：看清 asyncio.run 内部，理解事件循环是调度核心。
"""
import asyncio


# ===== 1. asyncio.run 启动事件循环 =====
async def hello():
    print("  Hello from event loop!")
    await asyncio.sleep(0.1)
    print("  Done")


print("=== 1. asyncio.run 启动 ===")
asyncio.run(hello())  # 内部自动创建/运行/关闭事件循环
print()


# ===== 2. 手动创建事件循环（看 asyncio.run 内部） =====
print("=== 2. 手动创建 loop（等价于 asyncio.run 内部） ===")
loop = asyncio.new_event_loop()  # 第 1 步：创建事件循环
try:
    loop.run_until_complete(hello())  # 第 2 步：运行协程直到完成
finally:
    loop.close()  # 第 3 步：关闭事件循环
    print("  loop 已关闭")
print()


# ===== 3. 获取当前事件循环 =====
async def show_loop():
    loop = asyncio.get_event_loop()  # 在协程里拿当前正在用的 loop
    print(f"  当前 loop: {loop}")
    print(f"  正在运行吗: {loop.is_running()}")  # True


print("=== 3. 获取当前事件循环 ===")
asyncio.run(show_loop())
print()


# ===== 4. 事件循环调度多个任务 =====
async def worker(name, delay):
    print(f"  [{name}] 开始")
    await asyncio.sleep(delay)  # 等待时让出，别人能跑
    print(f"  [{name}] 结束（等了 {delay} 秒）")


async def scheduler():
    print("=== 4. 事件循环调度多个任务 ===")
    await asyncio.gather(
        worker("A", 0.3),
        worker("B", 0.1),
        worker("C", 0.2),
    )
    # B(0.1) 先结束，然后 C(0.2)，最后 A(0.3)


asyncio.run(scheduler())
print()


# ===== 5. 事件循环工作流程图示 =====
print("=== 5. 事件循环工作流程 ===")
print("""
  1. 创建事件循环
  2. 把 main() 协程放进去
  3. 运行协程，遇到 await 暂停
  4. 暂停的协程进等待队列
  5. I/O/定时器好了，唤醒对应协程
  6. 所有协程完成，关闭循环

  就像餐厅经理：
    手下一堆服务员（协程），谁有空就叫谁上菜。
""")
print()


# ===== 6. 嵌套 asyncio.run 会报错 =====
print("=== 6. 不能嵌套 asyncio.run ===")
print("""
  # 错误写法：在 async 函数里再调 asyncio.run
  async def main():
      asyncio.run(other())   # RuntimeError: cannot be called from a running event loop

  # 正确写法：里面用 await
  async def main():
      await other()
""")
`,
  },
];
