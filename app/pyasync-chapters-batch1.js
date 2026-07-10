// =============================================================
// Python asyncio 教程（pyasync）—— 第一批章节
// -------------------------------------------------------------
// 专注讲解 Python asyncio 异步编程的核心概念与日常开发应用。
// 共 24 章，分 5 批：
//   batch1（1-4章）：   基础概念
//   batch2（5-9章）：   asyncio 入门
//   batch3（10-14章）： 异步 I/O
//   batch4（15-19章）： 高级特性
//   batch5（20-24章）： 实战项目
//
// 每个章节包含：
//   id      : 唯一标识
//   group   : 分组名
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解（含表格、代码块、列表）
//   code    : 可运行、带详细中文注释的 Python 示例代码
//
// 代码运行环境约束：
//   - 用 python3 直接运行（推荐 3.7+）
//   - 优先使用 Python 标准库（asyncio）
//   - 所有 demo 单文件可独立运行
//   - 用 print 输出结果
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：为什么要学 asyncio？同步 vs 异步
  // =========================================================
  {
    id: "pa-01",
    group: "基础概念",
    icon: "🌊",
    title: "为什么要学 asyncio？同步 vs 异步",
    content: `## 一、一个生活中的例子

**场景：你在咖啡店点一杯咖啡**

- **同步方式**：排队等咖啡做好 → 拿走 → 离开。下一个人才能点
- **异步方式**：点单 → 拿号 → 坐下玩手机 → 叫号取餐。新顾客继续点单

异步不是"更快"，而是"不浪费时间在等"。

## 二、程序中的"等待"

程序里大部分时间都花在"等"：
- 等网络请求返回（数据库、API、网页）
- 等文件读写
- 等用户输入

**同步代码**会卡在原地干等。**异步代码**可以在等的时候做别的事。

## 三、asyncio 是什么？

\`asyncio\` 是 Python 标准库的**异步 I/O 框架**：

- 写异步代码的关键字：\`async\` / \`await\`
- 用 **协程（coroutine）** 实现并发
- 适合 **I/O 密集** 场景（不是 CPU 密集）

## 四、同步 vs 异步的对比

\`\`\`python
import time

# 同步：3 个请求要 6 秒
def fetch(i):
    time.sleep(2)  # 模拟 I/O 等待
    return f"result {i}"

start = time.time()
results = [fetch(i) for i in range(3)]
print(f"同步耗时: {time.time() - start:.1f} 秒")  # 6.0
\`\`\`

\`\`\`python
import asyncio
import time

# 异步：3 个请求只要 2 秒
async def fetch(i):
    await asyncio.sleep(2)  # 异步等待
    return f"result {i}"

async def main():
    start = time.time()
    results = await asyncio.gather(*[fetch(i) for i in range(3)])
    print(f"异步耗时: {time.time() - start:.1f} 秒")  # 2.0

asyncio.run(main())
\`\`\`

## 五、什么时候用 asyncio？

| 场景 | 推荐 |
|------|------|
| HTTP API 请求（几十几百个） | ✅ asyncio |
| 数据库批量操作 | ✅ asyncio |
| WebSocket 长连接 | ✅ asyncio |
| Web 服务器 | ✅ asyncio（FastAPI） |
| CPU 密集（计算、压缩） | ❌ 用多进程 |
| 文件 I/O | ✅ aiofiles |
| GUI 应用 | ❌ 用线程 |

## 六、asyncio 的 4 大核心概念

1. **协程（coroutine）**：用 \`async def\` 定义的函数
2. **事件循环（event loop）**：调度协程的"调度员"
3. **任务（task）**：把协程"包"起来，可以并发
4. **Future**：占位对象，代表"将来会有结果"

## 七、asyncio 的 5 个常见误区

1. **异步 ≠ 多线程**：单线程也能异步
2. **异步 ≠ 更快**：CPU 密集下反而更慢
3. **不能 \`time.sleep\`**：要用 \`await asyncio.sleep\`
4. **不能直接调用协程**：必须 \`await\` 或 \`asyncio.run\`
5. **不要阻塞事件循环**：别在 async 里跑同步慢操作

## 八、本章 demo

下面 demo 对比同步 vs 异步的执行时间。
`,
    code: `"""
第一章 demo：同步 vs 异步的耗时对比
演示：
  1. 同步方式做 3 个"假装慢"的任务
  2. 异步方式做同样的 3 个任务
  3. 对比耗时
"""

import asyncio
import time


# ===== 同步版本 =====
def sync_task(i):
    """同步任务：用 time.sleep 模拟 I/O 等待"""
    time.sleep(1)  # 假装在做慢 I/O
    return f"sync result {i}"


def sync_main():
    print("=== 同步执行 3 个任务 ===")
    start = time.time()
    results = []
    for i in range(3):
        r = sync_task(i)
        print(f"  任务 {i} 完成: {r}")
        results.append(r)
    elapsed = time.time() - start
    print(f"  同步总耗时: {elapsed:.2f} 秒\\n")
    return results


# ===== 异步版本 =====
async def async_task(i):
    """异步任务：用 await asyncio.sleep 模拟 I/O 等待"""
    await asyncio.sleep(1)  # 异步等待，期间事件循环可以做别的
    return f"async result {i}"


async def async_main():
    print("=== 异步执行 3 个任务 ===")
    start = time.time()
    # gather 让 3 个任务并发
    results = await asyncio.gather(
        async_task(0),
        async_task(1),
        async_task(2),
    )
    for r in results:
        print(f"  任务结果: {r}")
    elapsed = time.time() - start
    print(f"  异步总耗时: {elapsed:.2f} 秒\\n")
    return results


# ===== 入口 =====
if __name__ == "__main__":
    print("=" * 50)
    print("Python asyncio 教程 — 第一章 demo")
    print("=" * 50 + "\\n")

    sync_main()
    asyncio.run(async_main())

    print("=" * 50)
    print("结论：")
    print("• 同步: 3 秒（一个一个排队等）")
    print("• 异步: 1 秒（一起等，一起完成）")
    print("• asyncio 适合 I/O 密集场景")
    print("• CPU 密集还是用多进程 multiprocessing")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第二章：协程 (coroutine) 是什么？
  // =========================================================
  {
    id: "pa-02",
    group: "基础概念",
    icon: "🧬",
    title: "协程 (coroutine) 是什么？",
    content: `## 一、什么是协程？

**协程 = 可以暂停和恢复的函数**。

普通函数：调用 → 执行 → 返回（一口气）
协程函数：调用 → 执行 → **暂停** → ... → 恢复 → 返回

## 二、定义协程

用 \`async def\` 定义：

\`\`\`python
async def hello():
    print("Hello")
    await asyncio.sleep(1)
    print("World")
\`\`\`

**注意**：调用 \`hello()\` **不会执行函数体**，而是返回一个**协程对象**：

\`\`\`python
coro = hello()  # 不会打印 Hello
print(type(coro))  # <class 'coroutine'>

# 要执行函数体，必须 await 或 asyncio.run
asyncio.run(hello())  # 打印 Hello ... 1秒后 ... World
\`\`\`

## 三、协程对象的 3 种"执行方式"

\`\`\`python
# 方式 1：asyncio.run（顶层入口）
asyncio.run(hello())

# 方式 2：在另一个协程里 await
async def main():
    await hello()

asyncio.run(main())

# 方式 3：包装成 Task
task = asyncio.create_task(hello())
await task
\`\`\`

## 四、async/await 的关系

| 关键字 | 作用 |
|--------|------|
| \`async def\` | 定义协程函数 |
| \`await\` | **等待**一个协程/任务完成 |
| \`async with\` | 异步上下文管理器 |
| \`async for\` | 异步迭代器 |
| \`asyncio.create_task\` | 把协程包装成可并发的任务 |

## 五、await 后面能接什么？

\`\`\`python
# 1. 另一个协程
await another_coro()

# 2. 一个 Task
await task

# 3. 一个 Future
await future

# 4. 实现 __await__ 的对象

# ❌ 不能接普通值
await 42  # TypeError
\`\`\`

## 六、协程 vs 函数对比

\`\`\`python
# 普通函数
def add(a, b):
    return a + b

# 协程函数
async def async_add(a, b):
    return a + b

add(1, 2)              # 3
async_add(1, 2)        # <coroutine object>（不会执行）
await async_add(1, 2)  # 3
\`\`\`

## 七、协程的状态

一个协程对象有 4 种状态：

| 状态 | 含义 |
|------|------|
| \`GEN_CREATED\` | 刚创建，未执行 |
| \`GEN_RUNNING\` | 正在执行 |
| \`GEN_SUSPENDED\` | 在 await 处暂停 |
| \`GEN_CLOSED\` | 执行完毕 |

\`\`\`python
import inspect

async def foo():
    await asyncio.sleep(1)

coro = foo()
print(inspect.getcoroutinestate(coro))  # GEN_CREATED（0）
\`\`\`

## 八、协程链式调用

\`\`\`python
import asyncio
async def step1():
    await asyncio.sleep(0.1)
    return "step1 done"

async def step2():
    r = await step1()  # 等待 step1 完成
    return f"step2 after {r}"

asyncio.run(step2())  # "step2 after step1 done"
\`\`\`

## 九、本章 demo

下面 demo 演示协程的创建、状态、和调用方式。
`,
    code: `"""
第二章 demo：协程的创建与执行
演示：
  1. async def 定义协程
  2. 调用协程不执行
  3. 三种执行方式
  4. 协程的状态
  5. 协程链式调用
"""

import asyncio
import inspect


# ===== 1. 定义协程 =====
async def greet(name):
    """最简协程"""
    print(f"  Hello, {name}")
    # 暂停一下（模拟 I/O）
    await asyncio.sleep(0.1)
    print(f"  Goodbye, {name}")
    return f"done with {name}"


# ===== 2. 协程的状态 =====
def show_state(coro, label):
    """显示协程状态"""
    if inspect.iscoroutine(coro):
        state = inspect.getcoroutinestate(coro)
        states = {
            "CORO_CREATED": "CORO_CREATED（已创建，未执行）",
            "CORO_RUNNING": "CORO_RUNNING（正在执行）",
            "CORO_SUSPENDED": "CORO_SUSPENDED（在 await 处暂停）",
            "CORO_CLOSED": "CORO_CLOSED（已结束）",
        }
        print(f"  {label}: {states[state]}")
    else:
        # Task 对象不是 coroutine，用 done() 判断
        print(f"  {label}: {'已完成' if coro.done() else '待执行（PENDING）'}")


# ===== 3. 三种执行方式 =====
async def execute_methods():
    print("  --- 方式 1: await 在另一个协程里 ---")
    r = await greet("Alice")
    print(f"  返回值: {r}")

    print("\\n  --- 方式 2: create_task 包装 ---")
    task = asyncio.create_task(greet("Bob"))
    show_state(task, "Task 刚创建")
    await task
    print(f"  Task 完成: {task.done()}")

    print("\\n  --- 方式 3: asyncio.gather 并发 ---")
    results = await asyncio.gather(
        greet("Carol"),
        greet("David"),
    )
    print(f"  收集结果: {results}")


# ===== 4. 协程链式调用 =====
async def get_user(user_id):
    await asyncio.sleep(0.1)
    return {"id": user_id, "name": f"User{user_id}"}


async def get_orders(user):
    await asyncio.sleep(0.1)
    return [{"user": user["name"], "total": 100}]


async def get_user_with_orders(user_id):
    user = await get_user(user_id)
    orders = await get_orders(user)
    return {"user": user, "orders": orders}


# ===== 入口 =====
async def main():
    print("=" * 50)
    print("Python asyncio 教程 — 第二章 demo")
    print("=" * 50 + "\\n")

    print("【1. 调用协程不执行】")
    coro = greet("Test")
    print(f"  类型: {type(coro).__name__}")
    show_state(coro, "状态")
    coro.close()  # 演示完类型和状态后关闭，避免 RuntimeWarning: coroutine was never awaited
    print()

    print("【2. 三种执行方式】")
    await execute_methods()
    print()

    print("【3. 协程链式调用】")
    result = await get_user_with_orders(1)
    print(f"  最终结果: {result}")


if __name__ == "__main__":
    asyncio.run(main())
    print("\\n" + "=" * 50)
    print("总结：")
    print("• async def 定义协程函数")
    print("• 调用返回协程对象，不执行")
    print("• 必须 await 或 create_task 才执行")
    print("• 协程可以在 await 处暂停")
    print("• 链式调用：A() 里 await B()")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第三章：事件循环 (event loop) 的工作原理
  // =========================================================
  {
    id: "pa-03",
    group: "基础概念",
    icon: "🎡",
    title: "事件循环 (event loop) 的工作原理",
    content: `## 一、事件循环是什么？

**事件循环** = asyncio 的"调度中心"，负责：
- 调度协程执行
- 处理 I/O 事件
- 唤醒暂停的协程

可以理解为"24 小时不停转的调度员"。

## 二、事件循环的工作流程

\`\`\`
事件循环永不停止：
  1. 从"待办"队列取一个任务
  2. 执行这个任务
  3. 如果遇到 await，就把任务暂停，放回"等待"队列
  4. 等待 I/O 完成后，把任务移回"待办"队列
  5. 回到 1
\`\`\`

## 三、asyncio.run 做了什么？

\`\`\`python
asyncio.run(main())
\`\`\`

底层相当于：

\`\`\`python
import asyncio
loop = asyncio.new_event_loop()  # 创建事件循环
loop.run_until_complete(main())  # 运行直到 main 完成
loop.close()                     # 关闭循环
\`\`\`

## 四、获取事件循环

\`\`\`python
import asyncio
loop = asyncio.get_event_loop()  # 旧 API（不推荐）
loop = asyncio.get_running_loop()  # 推荐在协程内用
\`\`\`

## 五、事件循环的"小红点"

\`\`\`python
async def main():
    loop = asyncio.get_running_loop()
    print(f"是否运行中: {loop.is_running()}")
    print(f"事件循环: {loop}")
\`\`\`

## 六、asyncio 的 3 个"队列"

事件循环内部维护 3 个队列：
1. **ready**：就绪队列（马上能跑）
2. **waiting**：等待队列（在 await 处暂停）
3. **scheduled**：计划队列（用 call_later 延后执行）

## 七、低层 API：loop.call_later

\`\`\`python
async def main():
    loop = asyncio.get_running_loop()
    # 0.5 秒后调用
    loop.call_later(0.5, lambda: print("0.5 秒后"))
    # 1 秒后调用
    loop.call_later(1.0, lambda: print("1.0 秒后"))
    await asyncio.sleep(1.5)
\`\`\`

## 八、asyncio 内部循环示意

\`\`\`
┌────────────────────────────┐
│      事件循环（永不停止）    │
└────────────┬───────────────┘
             │
   ┌─────────▼─────────┐
   │ 取出 ready 队列   │
   │ 第一个 task       │
   └─────────┬─────────┘
             │
   ┌─────────▼─────────┐
   │ 执行 task         │
   │ 遇到 await 暂停？ │
   └────┬──────────┬───┘
        │暂停     │完成
        ▼          ▼
   ┌─────────┐  删除 task
   │ waiting │  取结果
   │ 队列    │
   └─────────┘
   I/O 完成 → 移到 ready
\`\`\`

## 九、为什么"单线程"也能并发？

**关键**：当一个协程在 \`await asyncio.sleep(1)\` 时，它**不占用 CPU**，事件循环可以执行其他协程。

CPU 永远只跑一个协程（单线程），但在 I/O 等待时切换。

## 十、本章 demo

下面 demo 演示事件循环的工作方式。
`,
    code: `"""
第三章 demo：事件循环的工作原理
演示：
  1. 获取事件循环
  2. 多个协程在同一个循环里切换
  3. call_later 延后执行
  4. 观察协程切换顺序
"""

import asyncio
import time


# ===== 1. 观察协程切换 =====
async def worker(name, work_time):
    """模拟一个 worker"""
    print(f"  [{time.strftime('%H:%M:%S')}] {name} 开始工作")
    # 分段工作 + 等待，观察切换
    for i in range(3):
        await asyncio.sleep(work_time / 3)
        print(f"  [{time.strftime('%H:%M:%S')}] {name} 完成第 {i+1} 段")
    print(f"  [{time.strftime('%H:%M:%S')}] {name} 全部完成")
    return f"{name} result"


async def observe_event_loop():
    print("【1. 多个 worker 在同一事件循环】")
    print("  观察: 即使单线程，3 个 worker 看起来在同时跑")
    print()
    start = time.time()
    results = await asyncio.gather(
        worker("A", 1.0),
        worker("B", 1.0),
        worker("C", 1.0),
    )
    print(f"\\n  3 个 worker 总耗时: {time.time()-start:.2f} 秒")
    print(f"  实际并行：是的，都在 {time.time()-start:.2f} 秒完成")
    print(f"  结果: {results}")


# ===== 2. call_later 调度 =====
async def demo_call_later():
    print("\\n【2. loop.call_later 延后执行】")
    loop = asyncio.get_running_loop()

    # 记录要执行的事情
    loop.call_later(0.3, print, "  0.3 秒: 任务 1")
    loop.call_later(0.1, print, "  0.1 秒: 任务 2")
    loop.call_later(0.5, print, "  0.5 秒: 任务 3")

    # 等待让回调执行
    await asyncio.sleep(1.0)


# ===== 3. 手动控制 =====
async def demo_manual_control():
    print("\\n【3. 手动控制协程的暂停】")
    loop = asyncio.get_running_loop()
    print(f"  当前事件循环: {type(loop).__name__}")
    print(f"  是否运行中: {loop.is_running()}")
    print(f"  时间: {loop.time():.2f}")


# ===== 4. 主流程示意 =====
async def main():
    print("=" * 50)
    print("Python asyncio 教程 — 第三章 demo")
    print("=" * 50 + "\\n")

    await observe_event_loop()
    await demo_call_later()
    await demo_manual_control()

    print("\\n" + "=" * 50)
    print("总结：")
    print("• 事件循环 = asyncio 的调度中心")
    print("• 协程在 await 处暂停，让出 CPU")
    print("• I/O 完成时事件循环唤醒协程")
    print('• 单线程也能"并发"（靠切换）')
    print("• asyncio.run = 创建循环 + 运行 + 关闭")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
`,
  },

  // =========================================================
  // 第四章：await 关键字：让出控制权
  // =========================================================
  {
    id: "pa-04",
    group: "基础概念",
    icon: "✋",
    title: "await 关键字：让出控制权",
    content: `## 一、await 是什么？

\`await\` 做两件事：
1. **暂停**当前协程
2. **等待**右边的协程/任务完成
3. **恢复**当前协程并返回结果

## 二、await 的执行流程

\`\`\`python
async def main():
    print("1")
    await asyncio.sleep(1)  # 暂停 1 秒
    print("2")  # 1 秒后恢复
\`\`\`

详细过程：

\`\`\`
- 执行 print("1")
- 遇到 await asyncio.sleep(1)
- 当前协程暂停，事件循环记下"1 秒后唤醒"
- 事件循环去做别的事
- 1 秒后，事件循环唤醒当前协程
- 执行 print("2")
- main 结束
\`\`\`

## 三、await 后面能接什么？

\`\`\`python
# ✅ 1. 协程
await another_coroutine()

# ✅ 2. Task
await task

# ✅ 3. Future
await future

# ✅ 4. awaitable 对象（实现了 __await__）

# ❌ 5. 普通值
await 42  # TypeError
\`\`\`

## 四、await 的"非阻塞"特性

\`\`\`python
import asyncio

async def main():
    # 这两个 sleep 几乎同时开始
    await asyncio.sleep(1)
    await asyncio.sleep(1)
    # 总耗时: 2 秒（顺序）
    
    # 但 gather 是并发的
    await asyncio.gather(asyncio.sleep(1), asyncio.sleep(1))
    # 总耗时: 1 秒
\`\`\`

## 五、await 链

\`\`\`python
import asyncio
async def level1():
    await asyncio.sleep(0.1)
    return "L1"

async def level2():
    # 嵌套 await
    r = await level1()
    return f"L2({r})"

async def level3():
    r = await level2()
    return f"L3({r})"

asyncio.run(level3())  # "L3(L2(L1))"
\`\`\`

## 六、await 的 5 个常见错误

### 1. await 普通函数

\`\`\`python
def normal():
    return 1

async def main():
    await normal()  # TypeError
\`\`\`

### 2. await 同步阻塞

\`\`\`python
import time
async def main():
    time.sleep(1)  # ❌ 阻塞整个事件循环
    await asyncio.sleep(1)  # ✅ 让出控制权
\`\`\`

### 3. 在 async 里调同步慢操作

\`\`\`python
async def fetch():
    # requests.get 是同步的，会卡事件循环
    return requests.get(url)  # ❌
\`\`\`

### 4. 重复 await

\`\`\`python
coro = some_coro()
result1 = await coro
result2 = await coro  # 报错，协程不能 await 两次
\`\`\`

### 5. 忘记 await

\`\`\`python
async def main():
    some_coro()  # ❌ 警告：协程没被 await
\`\`\`

## 七、await vs yield 对比

| 维度 | \`await\` | \`yield\` |
|------|----------|----------|
| 用于 | 协程 | 生成器 |
| 暂停 | 协程 | 函数 |
| 恢复 | 事件循环 | 调用方 |
| 出现位置 | 协程体内 | 生成器函数内 |

## 八、本章 demo

下面 demo 演示 await 的用法、常见错误和正确写法。
`,
    code: `"""
第四章 demo：await 关键字详解
演示：
  1. await 的基本用法
  2. await 协程、Task、Future
  3. await 顺序 vs 并发
  4. await 的常见错误
  5. await 链
"""

import asyncio
import time


# ===== 1. await 基本用法 =====
async def slow_op(name, delay):
    """模拟一个慢操作"""
    print(f"  {name} 开始")
    await asyncio.sleep(delay)
    print(f"  {name} 完成")
    return f"{name}_result"


async def demo_basic():
    print("【1. await 基本用法】")
    # await 一个协程
    r = await slow_op("A", 0.5)
    print(f"  A 的结果: {r}\\n")


# ===== 2. await 顺序 vs 并发 =====
async def demo_concurrent():
    print("【2. await 顺序 vs 并发】")

    # 顺序：3 秒
    start = time.time()
    await slow_op("顺序-1", 1)
    await slow_op("顺序-2", 1)
    await slow_op("顺序-3", 1)
    print(f"  顺序总耗时: {time.time()-start:.2f} 秒\\n")

    # 并发：1 秒
    start = time.time()
    await asyncio.gather(
        slow_op("并发-1", 1),
        slow_op("并发-2", 1),
        slow_op("并发-3", 1),
    )
    print(f"  并发总耗时: {time.time()-start:.2f} 秒\\n")


# ===== 3. await 链 =====
async def get_token():
    await asyncio.sleep(0.1)
    return "token_xyz"


async def get_data(token):
    await asyncio.sleep(0.1)
    return {"data": "value", "token": token}


async def get_meta(data):
    await asyncio.sleep(0.1)
    return {"data": data, "meta": "info"}


async def chain_demo():
    print("【3. await 链式调用】")
    token = await get_token()
    data = await get_data(token)
    result = await get_meta(data)
    print(f"  最终结果: {result}\\n")


# ===== 4. 常见错误 =====
async def demo_mistakes():
    print("【4. await 常见错误】\\n")

    # 错误 1: await 普通值
    print("  错误 1: await 普通值")
    try:
        await 42
    except TypeError as e:
        print(f"    ❌ {e}\\n")

    # 错误 2: await 同步函数
    print("  错误 2: await 同步函数")
    def sync_func():
        return 1
    try:
        await sync_func()
    except TypeError as e:
        print(f"    ❌ {e}\\n")

    # 错误 3: 重复 await 协程
    print("  错误 3: 重复 await 协程")
    coro = slow_op("repeat", 0.1)
    try:
        await coro
        await coro  # 报错
    except RuntimeError as e:
        print(f"    ❌ {e}\\n")

    # 错误 4: 忘记 await
    print("  错误 4: 忘记 await（会出警告）")
    async def main_no_await():
        slow_op("forgot", 0.1)  # 没 await
        return "完成"
    result = await main_no_await()
    print(f"    main 返回: {result!r}")
    print("    ⚠️  会出 RuntimeWarning: coroutine was never awaited\\n")


# ===== 入口 =====
async def main():
    print("=" * 50)
    print("Python asyncio 教程 — 第四章 demo")
    print("=" * 50 + "\\n")

    await demo_basic()
    await demo_concurrent()
    await chain_demo()
    await demo_mistakes()

    print("=" * 50)
    print("总结：")
    print("• await 暂停当前协程，等待右边完成")
    print("• await 协程、Task、Future")
    print("• 不能 await 普通值、同步函数")
    print("• 协程不能 await 两次")
    print("• 别在 async 里调同步阻塞")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
`,
  },
];
