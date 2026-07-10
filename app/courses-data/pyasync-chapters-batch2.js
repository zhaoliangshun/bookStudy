// =============================================================
// Python asyncio 教程（pyasync）—— 第二批章节
// -------------------------------------------------------------
// asyncio 入门（5-9章）
//   第 5 章：asyncio.run() 与基本运行模型
//   第 6 章：创建任务：asyncio.create_task
//   第 7 章：并发执行：asyncio.gather
//   第 8 章：超时控制：asyncio.wait_for
//   第 9 章：Task 生命周期与取消
// =============================================================

export const chapters = [
  // =========================================================
  // 第五章：asyncio.run() 与基本运行模型
  // =========================================================
  {
    id: "pa-05",
    group: "asyncio 入门",
    icon: "🏁",
    title: "asyncio.run() 与基本运行模型",
    content: `## 一、asyncio.run 是入口

\`\`\`python
import asyncio

async def main():
    print("Hello async")

asyncio.run(main())  # 启动事件循环，运行 main，结束
\`\`\`

## 二、asyncio.run 内部做了什么？

1. **创建**事件循环
2. **运行**主协程到完成
3. **关闭**事件循环
4. **取消**所有剩余任务

## 三、asyncio.run 的限制

- 一个程序只能调用 **一次** \`asyncio.run\`
- 不能在协程内部调用 \`asyncio.run\`
- 主入口用 \`asyncio.run(main())\`

\`\`\`python
async def main():
    # ❌ 不能在协程里再 asyncio.run
    # asyncio.run(another_coro())
    pass
\`\`\`

## 四、asyncio.run 的参数

\`\`\`python
asyncio.run(main(), debug=False, loop_factory=None)
\`\`\`

- \`debug=True\`：开启调试模式（开发时推荐）
- \`loop_factory\`：自定义循环实现

## 五、底层 API（了解即可）

如果你需要更多控制：

\`\`\`python
import asyncio
loop = asyncio.new_event_loop()
try:
    loop.run_until_complete(main())
finally:
    loop.close()
\`\`\`

**但是**：99% 的时候用 \`asyncio.run\` 就够了。

## 六、Python 3.7 之前的写法（旧）

\`\`\`python
import asyncio
# ❌ Python 3.7 之前
loop = asyncio.get_event_loop()
loop.run_until_complete(main())
loop.close()
\`\`\`

现在统一用 \`asyncio.run\`。

## 七、入口函数的命名

惯例：**入口协程叫 \`main\`**。

\`\`\`python
import asyncio
async def main():
    ...

if __name__ == "__main__":
    asyncio.run(main())
\`\`\`

## 八、为什么 main 函数要 await 完？

\`\`\`python
async def main():
    task1 = asyncio.create_task(work1())
    task2 = asyncio.create_task(work2())
    # main 直接 return 的话，task1 task2 会被取消！
    return  # ❌
    
    # ✅ 正确：等待所有任务
    await task1
    await task2
\`\`\`

或者用 \`asyncio.gather\`：

\`\`\`python
async def main():
    await asyncio.gather(work1(), work2())
    # gather 会等所有任务完成
\`\`\`

## 九、main 函数的 3 种写法

\`\`\`python
# 写法 1: 直接 await
async def main():
    await fetch_data()
    await process_data()

# 写法 2: gather
async def main():
    await asyncio.gather(
        fetch_data(),
        process_data(),
    )

# 写法 3: create_task + 显式等待
async def main():
    t1 = asyncio.create_task(fetch_data())
    t2 = asyncio.create_task(process_data())
    await t1
    await t2
\`\`\`

## 十、本章 demo

下面 demo 演示 \`asyncio.run\` 的基本使用和 main 函数的最佳实践。
`,
    code: `"""
第五章 demo：asyncio.run 与基本运行模型
演示：
  1. asyncio.run 的基本用法
  2. main 函数的 3 种写法
  3. 错误：main 提前 return
  4. debug 模式
"""

import asyncio
import time


# ===== 1. 简单入口 =====
async def hello():
    """最简单的协程"""
    print("  Hello, async!")
    await asyncio.sleep(0.2)
    print("  After 0.2s")
    return "done"


def run_simple():
    """同步入口调用 asyncio.run"""
    print("【1. asyncio.run 基本用法】")
    print("  开始：同步代码")
    result = asyncio.run(hello())
    print(f"  结束：协程返回 {result!r}\\n")


# ===== 2. main 的 3 种写法 =====
async def fetch_data(name, delay):
    print(f"  [{name}] 开始抓取")
    await asyncio.sleep(delay)
    print(f"  [{name}] 完成")
    return f"data_{name}"


async def main_v1():
    """写法 1: 直接 await"""
    print("【2. 写法 1: 顺序 await】")
    start = time.time()
    r1 = await fetch_data("A", 0.5)
    r2 = await fetch_data("B", 0.5)
    print(f"  耗时: {time.time()-start:.2f} 秒, 结果: [{r1}, {r2}]\\n")


async def main_v2():
    """写法 2: gather 并发"""
    print("【3. 写法 2: asyncio.gather 并发】")
    start = time.time()
    results = await asyncio.gather(
        fetch_data("A", 0.5),
        fetch_data("B", 0.5),
    )
    print(f"  耗时: {time.time()-start:.2f} 秒, 结果: {results}\\n")


async def main_v3():
    """写法 3: create_task"""
    print("【4. 写法 3: create_task 显式等待】")
    start = time.time()
    t1 = asyncio.create_task(fetch_data("A", 0.5))
    t2 = asyncio.create_task(fetch_data("B", 0.5))
    print("  任务已创建，主协程继续")
    print(f"  t1 完成? {t1.done()}")
    await t1
    await t2
    print(f"  耗时: {time.time()-start:.2f} 秒\\n")


# ===== 3. 错误：main 提前 return =====
async def long_task():
    print("  [长任务] 开始")
    await asyncio.sleep(1.0)
    print("  [长任务] 完成（但 main 已 return，看不到）")


async def main_wrong():
    """main 提前 return：长任务被取消"""
    print("【5. 错误：main 提前 return】")
    t = asyncio.create_task(long_task())
    return  # 立即返回，t 会被取消
    # ✅ 正确写法: await t


# ===== 4. 调试模式 =====
async def debug_demo():
    print("【6. debug 模式（开发时推荐）】")
    print("  asyncio.run(main(), debug=True)")
    print("  调试模式下，未等待的协程会收到警告")
    print("  慢回调（>100ms）会报警")
    print()


# ===== 主入口 =====
if __name__ == "__main__":
    print("=" * 50)
    print("Python asyncio 教程 — 第五章 demo")
    print("=" * 50 + "\\n")

    run_simple()
    asyncio.run(main_v1())
    asyncio.run(main_v2())
    asyncio.run(main_v3())
    asyncio.run(main_wrong())  # 长任务会被取消
    asyncio.run(debug_demo())

    print("=" * 50)
    print("总结：")
    print("• asyncio.run = 入口，一次程序只能调一次")
    print("• main 函数必须 await 所有任务")
    print("• 推荐: gather 并发，或 create_task + await")
    print("• 开发时用 debug=True")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第六章：创建任务：asyncio.create_task
  // =========================================================
  {
    id: "pa-06",
    group: "asyncio 入门",
    icon: "📌",
    title: "创建任务：asyncio.create_task",
    content: `## 一、什么是 Task？

**Task** = 调度运行的协程包装器。

\`\`\`python
# 协程不会自动跑
coro = fetch_data()  # 还没跑

# Task 会"立刻"被事件循环调度
task = asyncio.create_task(coro)  # 已加入事件循环
\`\`\`

## 二、create_task vs 直接 await

\`\`\`python
# 方式 1: 直接 await（不会"并发"）
await fetch_a()  # 等 A 完成
await fetch_b()  # 才能开始 B
# 顺序执行，2 倍时间

# 方式 2: create_task（并发）
ta = asyncio.create_task(fetch_a())
tb = asyncio.create_task(fetch_b())
# 两个任务几乎同时开始
await ta
await tb
# 并发执行，1 倍时间
\`\`\`

## 三、create_task 的返回值

\`\`\`python
import asyncio
task = asyncio.create_task(coro)
# Task 对象有这些属性/方法:
task.done()       # 是否完成
task.cancelled()  # 是否被取消
task.result()     # 获取结果（如果完成）
task.exception()  # 获取异常
task.cancel()     # 取消任务
\`\`\`

## 四、Task 的 3 个状态

| 状态 | 含义 |
|------|------|
| \`PENDING\` | 待执行 |
| \`RUNNING\` | 正在执行 |
| \`FINISHED\` | 已完成 |

## 五、Task 的命名（Python 3.8+）

\`\`\`python
import asyncio
task = asyncio.create_task(coro, name="fetch_user_data")
print(task.get_name())  # "fetch_user_data"
\`\`\`

调试时很有用。

## 六、什么时候用 create_task？

- 需要"并发"跑多个协程
- 协程可能要"取消"
- 协程的结果后面用

## 七、什么时候不用 create_task？

- 只要顺序执行一个：用 \`await\`
- 想并发 + 自动收集结果：用 \`asyncio.gather\`

## 八、TaskGroup（Python 3.11+）

\`\`\`python
async with asyncio.TaskGroup() as tg:
    t1 = tg.create_task(work1())
    t2 = tg.create_task(work2())
# with 块结束时自动 await 所有
\`\`\`

更优雅的并发方式。

## 九、Task 的常见错误

### 1. 忘记保存 task 引用

\`\`\`python
async def main():
    asyncio.create_task(work())  # ❌ 没保存引用
    # main 立即返回，task 会被取消

# ✅ 正确
async def main():
    t = asyncio.create_task(work())
    await t
\`\`\`

### 2. Task 重复 await

\`\`\`python
t = asyncio.create_task(coro)
await t
await t  # ❌ 报错
\`\`\`

## 十、本章 demo

下面 demo 演示 create_task 的各种用法。
`,
    code: `"""
第六章 demo：asyncio.create_task
演示：
  1. create_task vs await
  2. Task 的状态
  3. 命名 Task
  4. 错误：忘记保存 task
  5. TaskGroup（3.11+）
"""

import asyncio
import time


# ===== 1. create_task vs await =====
async def work(name, delay):
    print(f"  [{name}] 开始")
    await asyncio.sleep(delay)
    print(f"  [{name}] 完成")
    return f"{name}_result"


async def compare_await_vs_task():
    print("【1. await 顺序 vs create_task 并发】\\n")

    # await 顺序：3 秒
    print("  --- await 顺序 ---")
    start = time.time()
    await work("A", 1)
    await work("B", 1)
    await work("C", 1)
    print(f"  总耗时: {time.time()-start:.2f} 秒\\n")

    # create_task 并发：1 秒
    print("  --- create_task 并发 ---")
    start = time.time()
    ta = asyncio.create_task(work("A", 1))
    tb = asyncio.create_task(work("B", 1))
    tc = asyncio.create_task(work("C", 1))
    await ta
    await tb
    await tc
    print(f"  总耗时: {time.time()-start:.2f} 秒\\n")


# ===== 2. Task 的状态 =====
async def demo_task_state():
    print("【2. Task 的状态】")
    task = asyncio.create_task(work("demo", 0.3), name="my_task")
    print(f"  刚创建: done={task.done()}, name={task.get_name()}")
    await asyncio.sleep(0.1)
    print(f"  0.1 秒后: done={task.done()}")
    await task
    print(f"  await 后: done={task.done()}, result={task.result()!r}\\n")


# ===== 3. 错误：忘记保存 task =====
async def forgot_to_keep_ref():
    print("【3. 错误：忘记保存 task 引用】")
    print("  ❌  asyncio.create_task(work())  # 没保存")
    print("      main 立即 return，task 被取消")
    print("  ✅  t = asyncio.create_task(work())")
    print("      await t  # 或保存到列表\\n")


# ===== 4. 收集所有任务 =====
async def demo_collect_tasks():
    print("【4. 收集所有任务到列表】")
    tasks = [asyncio.create_task(work(f"job{i}", 0.3)) for i in range(5)]
    print(f"  创建 {len(tasks)} 个任务")
    results = await asyncio.gather(*tasks)
    print(f"  收集结果: {results}\\n")


# ===== 5. TaskGroup（3.11+） =====
async def demo_task_group():
    print("【5. TaskGroup（Python 3.11+）】")
    print("  用 async with 自动管理任务")
    print("  代码更简洁，不用手动 await 每个 task\\n")
    try:
        async with asyncio.TaskGroup() as tg:
            t1 = tg.create_task(work("TG-1", 0.3))
            t2 = tg.create_task(work("TG-2", 0.3))
            t3 = tg.create_task(work("TG-3", 0.3))
        # 自动 await 所有任务
        print(f"  TaskGroup 完成, 结果: {[t.result() for t in [t1, t2, t3]]}\\n")
    except AttributeError:
        print("  ⚠️  当前 Python 版本不支持 TaskGroup（需要 3.11+）\\n")


# ===== 主入口 =====
async def main():
    print("=" * 50)
    print("Python asyncio 教程 — 第六章 demo")
    print("=" * 50 + "\\n")

    await compare_await_vs_task()
    await demo_task_state()
    await forgot_to_keep_ref()
    await demo_collect_tasks()
    await demo_task_group()

    print("=" * 50)
    print("总结：")
    print("• create_task 让协程并发执行")
    print("• 记得保存 task 引用，否则会被取消")
    print("• Task 有 done / result / exception 等属性")
    print("• 3.11+ 推荐用 TaskGroup 更优雅")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
`,
  },

  // =========================================================
  // 第七章：并发执行：asyncio.gather
  // =========================================================
  {
    id: "pa-07",
    group: "asyncio 入门",
    icon: "🎯",
    title: "并发执行：asyncio.gather",
    content: `## 一、gather 是什么？

\`asyncio.gather\` 让你**同时跑多个协程**，并收集所有结果。

\`\`\`python
results = await asyncio.gather(
    fetch(url1),
    fetch(url2),
    fetch(url3),
)
# results 是 list，按顺序
\`\`\`

## 二、gather vs 多个 await

\`\`\`python
# ❌ 顺序：6 秒
r1 = await fetch1()
r2 = await fetch2()
r3 = await fetch3()

# ✅ 并发：2 秒
r1, r2, r3 = await asyncio.gather(
    fetch1(), fetch2(), fetch3(),
)
\`\`\`

## 三、gather 的参数

\`\`\`python
import asyncio
asyncio.gather(
    *coros,           # 可变参数：多个协程
    return_exceptions=False,  # 是否把异常当结果返回
)
\`\`\`

## 四、return_exceptions 的差别

\`\`\`python
# return_exceptions=False（默认）
# 任一协程异常，其他会被取消，gather 抛出异常

# return_exceptions=True
# 异常作为结果返回，不影响其他协程
results = await asyncio.gather(
    fetch(), error_task(), another(),
    return_exceptions=True,
)
# results 里：成功的是值，失败的是 Exception
\`\`\`

## 五、gather 取消行为

\`\`\`python
# 默认：gather 内部任一 task 异常，其他 task 会被取消
await asyncio.gather(t1, t2, t3)
# 如果 t1 抛异常，t2 t3 会自动取消
\`\`\`

## 六、用 * 解包

\`\`\`python
urls = ["url1", "url2", "url3"]
tasks = [fetch(url) for url in urls]
results = await asyncio.gather(*tasks)  # 用 * 解包
\`\`\`

## 七、实战：并发抓取多个 URL

\`\`\`python
import asyncio
import aiohttp

async def fetch(session, url):
    async with session.get(url) as resp:
        return await resp.text()

async def main():
    urls = ["http://example.com"] * 10
    async with aiohttp.ClientSession() as session:
        results = await asyncio.gather(
            *[fetch(session, url) for url in urls]
        )
\`\`\`

## 八、gather 性能 vs 顺序

\`\`\`python
# 假设每个任务 1 秒
# 顺序: 10 秒
for coro in coros:
    await coro

# gather: 1 秒（同时跑）
await asyncio.gather(*coros)
\`\`\`

## 九、gather 的限制

- **不能动态添加任务**：传进去就是全部
- **想中途加新任务**：用 \`create_task\` + \`gather\`

## 十、本章 demo

下面 demo 演示 gather 的各种用法和错误处理。
`,
    code: `"""
第七章 demo：asyncio.gather 并发执行
演示：
  1. gather 基本用法
  2. gather 性能 vs 顺序
  3. return_exceptions 处理
  4. 动态任务列表
  5. gather 取消行为
"""

import asyncio
import time


# ===== 1. gather 基本用法 =====
async def work(name, delay):
    print(f"  [{name}] 开始")
    await asyncio.sleep(delay)
    print(f"  [{name}] 完成")
    return f"{name}_result"


async def demo_basic():
    print("【1. gather 基本用法】")
    results = await asyncio.gather(
        work("A", 0.3),
        work("B", 0.3),
        work("C", 0.3),
    )
    print(f"  收集结果: {results}\\n")


# ===== 2. 顺序 vs gather =====
async def demo_performance():
    print("【2. 性能对比：顺序 vs gather】\\n")
    # 顺序
    start = time.time()
    for i in range(5):
        await work(f"seq-{i}", 0.2)
    print(f"  顺序 5 个任务: {time.time()-start:.2f} 秒\\n")

    # gather
    start = time.time()
    coros = [work(f"gather-{i}", 0.2) for i in range(5)]
    await asyncio.gather(*coros)
    print(f"  gather 5 个任务: {time.time()-start:.2f} 秒\\n")


# ===== 3. return_exceptions =====
async def may_fail(name, delay, fail=False):
    await asyncio.sleep(delay)
    if fail:
        raise ValueError(f"{name} 出错了")
    return f"{name}_ok"


async def demo_exceptions():
    print("【3. return_exceptions 处理】\\n")

    # 默认：异常会传播
    print("  --- return_exceptions=False（默认） ---")
    try:
        await asyncio.gather(
            may_fail("A", 0.2),
            may_fail("B", 0.2, fail=True),  # 失败
            may_fail("C", 0.2),
        )
    except ValueError as e:
        print(f"  ❌ gather 抛出: {e}\\n")

    # 改为 True：异常当结果返回
    print("  --- return_exceptions=True ---")
    results = await asyncio.gather(
        may_fail("A", 0.2),
        may_fail("B", 0.2, fail=True),
        may_fail("C", 0.2),
        return_exceptions=True,
    )
    for i, r in enumerate(results):
        if isinstance(r, Exception):
            print(f"  结果 {i}: 异常 {r!r}")
        else:
            print(f"  结果 {i}: 成功 {r!r}")
    print()


# ===== 4. 动态任务 =====
async def demo_dynamic():
    print("【4. 动态任务列表】")
    tasks = []
    for i in range(3):
        tasks.append(asyncio.create_task(work(f"dyn-{i}", 0.2)))
    print(f"  创建 {len(tasks)} 个任务")
    # 动态添加
    tasks.append(asyncio.create_task(work("dyn-extra", 0.2)))
    print(f"  添加后: {len(tasks)} 个任务")
    results = await asyncio.gather(*tasks)
    print(f"  收集结果: {results}\\n")


# ===== 5. gather 取消 =====
async def demo_cancel():
    print("【5. gather 内部取消】")
    print("  默认：任一 task 异常，其他 task 会被取消\\n")

    async def long_work(name, delay):
        try:
            print(f"  [{name}] 开始")
            await asyncio.sleep(delay)
            print(f"  [{name}] 完成（不该发生）")
            return f"{name}_result"
        except asyncio.CancelledError:
            print(f"  [{name}] 被取消")
            raise

    try:
        await asyncio.gather(
            long_work("A", 1.0),
            long_work("B", 0.2),  # 立即出错
        )
    except ValueError:
        # 触发 gather 取消其他
        # B 内部出错，A 被取消
        pass
    print()


# ===== 主入口 =====
async def main():
    print("=" * 50)
    print("Python asyncio 教程 — 第七章 demo")
    print("=" * 50 + "\\n")

    await demo_basic()
    await demo_performance()
    await demo_exceptions()
    await demo_dynamic()
    await demo_cancel()

    print("=" * 50)
    print("总结：")
    print("• gather 并发跑多个协程，按顺序收集结果")
    print("• 用 * 解包动态任务列表")
    print("• return_exceptions=True 防止一个失败搞砸全部")
    print("• 默认：任一异常，其他 task 会被取消")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
`,
  },

  // =========================================================
  // 第八章：超时控制：asyncio.wait_for
  // =========================================================
  {
    id: "pa-08",
    group: "asyncio 入门",
    icon: "⏱️",
    title: "超时控制：asyncio.wait_for",
    content: `## 一、为什么需要超时？

网络请求可能很久不返回，必须有"保底"机制：

\`\`\`python
# 没有超时：等 10 分钟才报错
result = await fetch(slow_url)

# 有超时：3 秒不返回就放弃
try:
    result = await asyncio.wait_for(fetch(slow_url), timeout=3.0)
except asyncio.TimeoutError:
    print("超时啦")
\`\`\`

## 二、asyncio.wait_for

\`\`\`python
asyncio.wait_for(aw, timeout)
\`\`\`

- 超时后**取消**协程
- 抛 \`asyncio.TimeoutError\`

## 三、基本用法

\`\`\`python
async def slow_op():
    await asyncio.sleep(10)
    return "result"

try:
    result = await asyncio.wait_for(slow_op(), timeout=2.0)
except asyncio.TimeoutError:
    print("2 秒还没完成")
\`\`\`

## 四、超时后发生了什么？

1. 协程被取消（\`task.cancel()\`）
2. 协程内部 \`CancelledError\` 被抛出
3. 协程有机会做清理（finally）
4. wait_for 抛 \`TimeoutError\`

## 五、协程的清理工作

\`\`\`python
async def fetch_with_cleanup():
    try:
        result = await do_request()
        return result
    finally:
        # 超时也会执行
        await close_connection()
\`\`\`

## 六、asyncio.timeout（Python 3.11+）

更现代的写法：

\`\`\`python
async with asyncio.timeout(3.0):
    result = await fetch()
# 自动超时
\`\`\`

可以嵌套：

\`\`\`python
async with asyncio.timeout(3.0):
    async with asyncio.timeout(2.0):  # 内层优先
        result = await fetch()
# 实际 2 秒
\`\`\`

## 七、wait_for vs shield

\`\`\`python
# wait_for 会取消内部 task
await asyncio.wait_for(coro, 3)  # 超时取消

# shield 不会取消（任务继续跑）
await asyncio.shield(coro)  # 外层不取消内部
\`\`\`

## 八、实战：HTTP 超时

\`\`\`python
import aiohttp

async def fetch_with_timeout(url, timeout=5):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=timeout) as resp:
                return await resp.text()
    except asyncio.TimeoutError:
        return None
\`\`\`

## 九、超时的 4 个陷阱

1. **finally 里的慢操作**：超时清理时不要又做慢操作
2. **资源泄漏**：确保 finally 释放资源
3. **嵌套超时**：内层超时优先
4. **不要捕获后吞掉**：让 TimeoutError 传播

## 十、本章 demo

下面 demo 演示超时的各种用法。
`,
    code: `"""
第八章 demo：asyncio.wait_for 超时控制
演示：
  1. wait_for 基本超时
  2. 超时后清理
  3. asyncio.timeout（3.11+）
  4. 嵌套超时
  5. shield 防止取消
"""

import asyncio
import time


# ===== 1. wait_for 基本用法 =====
async def slow_task(name, delay):
    print(f"  [{name}] 开始")
    await asyncio.sleep(delay)
    print(f"  [{name}] 完成")
    return f"{name}_result"


async def demo_basic():
    print("【1. wait_for 基本用法】")
    # 1 秒任务
    result = await asyncio.wait_for(slow_task("fast", 1.0), timeout=2.0)
    print(f"  1 秒任务，2 秒超时: {result!r}")

    # 5 秒任务，2 秒超时
    try:
        await asyncio.wait_for(slow_task("slow", 5.0), timeout=2.0)
    except asyncio.TimeoutError:
        print(f"  5 秒任务，2 秒超时: 触发 TimeoutError\\n")


# ===== 2. 超时后清理 =====
async def task_with_cleanup(name, delay):
    print(f"  [{name}] 开始")
    try:
        await asyncio.sleep(delay)
        return f"{name}_ok"
    finally:
        # 即使被取消也执行
        print(f"  [{name}] 清理资源（finally）")


async def demo_cleanup():
    print("【2. 超时后清理】")
    try:
        await asyncio.wait_for(task_with_cleanup("with_cleanup", 5.0), timeout=1.0)
    except asyncio.TimeoutError:
        print(f"  超时了\\n")


# ===== 3. asyncio.timeout（3.11+） =====
async def demo_asyncio_timeout():
    print("【3. asyncio.timeout（3.11+ 推荐）】")
    try:
        async with asyncio.timeout(1.0):
            await slow_task("async_with", 3.0)
    except (asyncio.TimeoutError, TimeoutError):
        print(f"  async with 超时\\n")
    except AttributeError:
        print("  ⚠️  当前 Python 不支持 asyncio.timeout\\n")


# ===== 4. 嵌套超时 =====
async def demo_nested():
    print("【4. 嵌套超时（内层优先）】")
    print("  外层 5 秒，内层 1 秒")
    print("  实际: 1 秒\\n")
    try:
        async with asyncio.timeout(5.0):
            async with asyncio.timeout(1.0):
                await asyncio.sleep(3.0)
                print("  不该到这里")
    except (asyncio.TimeoutError, TimeoutError):
        print(f"  内层 1 秒超时\\n")
    except AttributeError:
        print("  ⚠️  当前 Python 不支持 asyncio.timeout\\n")


# ===== 5. shield =====
async def demo_shield():
    print("【5. asyncio.shield 防止取消】")
    print("  wait_for 超时会取消内部")
    print("  shield 包一层后，wait_for 超时不会取消内部\\n")

    async def long_task():
        try:
            print("  [inner] 开始")
            await asyncio.sleep(2.0)
            print("  [inner] 完成（wait_for 已超时，但 shield 保护）")
            return "inner_result"
        except asyncio.CancelledError:
            print("  [inner] 被取消（不应该）")
            raise

    # shield 保护：外层 wait_for 超时不会取消 inner_task
    # 注意：必须先创建 task 拿到引用，再用 shield 包一层；
    # 否则超时后 shield 返回的外层 future 已被取消，无法再 await 拿结果。
    inner_task = asyncio.ensure_future(long_task())
    try:
        await asyncio.wait_for(asyncio.shield(inner_task), timeout=0.5)
    except asyncio.TimeoutError:
        print("  外层超时")
    # inner_task 还在跑（被 shield 保护），再 await 一下拿结果
    result = await inner_task
    print(f"  inner 最终结果: {result!r}\\n")


# ===== 实战：多任务超时 =====
async def fetch_with_timeout(name, delay, timeout):
    """带超时的任务"""
    try:
        return await asyncio.wait_for(
            slow_task(name, delay),
            timeout=timeout,
        )
    except asyncio.TimeoutError:
        return f"{name} 超时"


async def demo_practical():
    print("【6. 实战：多任务统一超时】")
    start = time.time()
    results = await asyncio.gather(
        fetch_with_timeout("A", 0.5, timeout=1.0),
        fetch_with_timeout("B", 2.0, timeout=1.0),  # 超时
        fetch_with_timeout("C", 0.3, timeout=1.0),
    )
    print(f"\\n  结果: {results}")
    print(f"  总耗时: {time.time()-start:.2f} 秒（接近 2 秒，因为 B 跑满了）\\n")


# ===== 主入口 =====
async def main():
    print("=" * 50)
    print("Python asyncio 教程 — 第八章 demo")
    print("=" * 50 + "\\n")

    await demo_basic()
    await demo_cleanup()
    await demo_asyncio_timeout()
    await demo_nested()
    await demo_shield()
    await demo_practical()

    print("=" * 50)
    print("总结：")
    print("• wait_for(coro, timeout) 简单超时")
    print("• 超时后协程被取消，finally 仍执行")
    print("• 3.11+ 推荐用 asyncio.timeout 更优雅")
    print("• shield 保护内部协程不被外层取消")
    print("• 不要在 finally 里又做慢操作")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
`,
  },

  // =========================================================
  // 第九章：Task 生命周期与取消
  // =========================================================
  {
    id: "pa-09",
    group: "asyncio 入门",
    icon: "🚦",
    title: "Task 生命周期与取消",
    content: `## 一、Task 的一生

\`\`\`
PENDING → RUNNING → FINISHED
            │
            ↓
       CANCELLED
\`\`\`

## 二、Task 状态

\`\`\`python
import asyncio

task = asyncio.create_task(coro)
print(task._state)  # PENDING (0)

# 完成后
print(task._state)  # FINISHED (2)
\`\`\`

或者用公开 API：
- \`task.done()\`：已完成（含取消、异常）
- \`task.cancelled()\`：是否被取消
- \`task.result()\`：返回值
- \`task.exception()\`：异常

## 三、task.cancel()

\`\`\`python
task = asyncio.create_task(long_coro())
task.cancel()  # 取消
try:
    await task
except asyncio.CancelledError:
    print("任务被取消")
\`\`\`

## 四、CancelledError 的传播

\`\`\`python
async def task_with_cleanup():
    try:
        await asyncio.sleep(100)
    except asyncio.CancelledError:
        print("被取消，做清理")
        # 必须重新 raise，否则被吞
        raise
\`\`\`

**重要**：除非想吞掉，否则要 \`raise\`，否则会有警告。

## 五、屏蔽取消（不推荐）

\`\`\`python
try:
    await asyncio.sleep(10)
except asyncio.CancelledError:
    # 屏蔽取消（一般不推荐）
    pass
\`\`\`

## 六、task.add_done_callback

\`\`\`python
import asyncio
def callback(task):
    print(f"任务完成: {task.result()}")

task = asyncio.create_task(coro)
task.add_done_callback(callback)
\`\`\`

## 七、Task 的引用管理

Task 必须被引用，否则会被 GC 回收：

\`\`\`python
import asyncio
# ❌ 会被 GC
asyncio.create_task(work())  # 没人引用

# ✅ 保存引用
t = asyncio.create_task(work())
# 或
background_tasks = set()
task = asyncio.create_task(work())
background_tasks.add(task)
task.add_done_callback(background_tasks.discard)
\`\`\`

## 八、Task 异常处理

\`\`\`python
task = asyncio.create_task(risky_coro())
try:
    await task
except SomeError as e:
    print(f"协程报错: {e}")
\`\`\`

**如果没 await 就被 GC**：\`Task exception was never retrieved\` 警告。

## 九、cancel vs shield

\`\`\`python
# 取消
t = asyncio.create_task(coro)
t.cancel()  # 取消 t
await t  # 抛 CancelledError

# shield: 内部不取消
t = asyncio.create_task(asyncio.shield(coro))
t.cancel()  # 只取消 shield，不取消 coro
\`\`\`

## 十、本章 demo

下面 demo 演示 Task 的完整生命周期管理。
`,
    code: `"""
第九章 demo：Task 生命周期与取消
演示：
  1. Task 状态查询
  2. task.cancel 取消
  3. CancelledError 传播
  4. 任务引用管理
  5. add_done_callback
  6. 异常处理
"""

import asyncio
import time


# ===== 1. Task 状态 =====
async def work(name, delay):
    print(f"  [{name}] 开始")
    await asyncio.sleep(delay)
    print(f"  [{name}] 完成")
    return f"{name}_result"


async def demo_state():
    print("【1. Task 状态】")
    task = asyncio.create_task(work("state", 0.3), name="state_task")
    print(f"  创建后: done={task.done()}, name={task.get_name()}")
    await task
    print(f"  完成后: done={task.done()}, cancelled={task.cancelled()}")
    print(f"  result={task.result()!r}\\n")


# ===== 2. 取消任务 =====
async def demo_cancel():
    print("【2. task.cancel 取消任务】")
    task = asyncio.create_task(work("to_cancel", 5.0))
    await asyncio.sleep(0.5)
    task.cancel()
    print(f"  已发 cancel 命令")
    try:
        await task
    except asyncio.CancelledError:
        print(f"  task 抛 CancelledError")
    print(f"  task.cancelled() = {task.cancelled()}\\n")


# ===== 3. CancelledError 传播 =====
async def work_with_cleanup(name):
    print(f"  [{name}] 开始")
    try:
        await asyncio.sleep(2.0)
        print(f"  [{name}] 正常完成")
        return f"{name}_ok"
    except asyncio.CancelledError:
        print(f"  [{name}] 被取消，做清理")
        # 模拟清理
        await asyncio.sleep(0.1)
        print(f"  [{name}] 清理完成")
        raise  # 必须 raise


async def demo_propagation():
    print("【3. CancelledError 正确传播】")
    task = asyncio.create_task(work_with_cleanup("clean"))
    await asyncio.sleep(0.3)
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print(f"  外层捕获到\\n")


# ===== 4. 引用管理 =====
async def demo_reference():
    print("【4. Task 引用管理】")
    print("  ❌ asyncio.create_task(work())  # 会被 GC")
    print("  ✅ t = asyncio.create_task(work())\\n")
    background = set()
    for i in range(3):
        t = asyncio.create_task(work(f"bg-{i}", 0.2))
        background.add(t)
        t.add_done_callback(background.discard)
    print(f"  跟踪 {len(background)} 个后台任务")
    await asyncio.gather(*background)
    print(f"  完成后: {len(background)} 个\\n")


# ===== 5. add_done_callback =====
async def demo_callback():
    print("【5. add_done_callback】")
    def on_done(task):
        print(f"  回调: 任务完成, result={task.result()!r}")
    task = asyncio.create_task(work("cb", 0.2))
    task.add_done_callback(on_done)
    await task
    print()


# ===== 6. 异常处理 =====
async def fail_coro():
    await asyncio.sleep(0.1)
    raise ValueError("故意出错")


async def demo_exception():
    print("【6. Task 异常处理】")
    task = asyncio.create_task(fail_coro())
    try:
        await task
    except ValueError as e:
        print(f"  捕获到异常: {e}")
    print(f"  task.exception() = {task.exception()!r}\\n")


# ===== 7. 实战：超时取消 =====
async def long_task(name, delay):
    print(f"  [{name}] 开始")
    try:
        await asyncio.sleep(delay)
        return f"{name}_result"
    except asyncio.CancelledError:
        print(f"  [{name}] 收到取消，清理")
        # 模拟快速清理
        await asyncio.sleep(0.05)
        print(f"  [{name}] 清理完成")
        raise


async def demo_practical():
    print("【7. 实战：超时自动取消】")
    # 用 wait_for 等价：手动 cancel
    task = asyncio.create_task(long_task("practical", 3.0))
    await asyncio.sleep(0.5)
    print("  0.5 秒后取消")
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print("  已取消\\n")


# ===== 主入口 =====
async def main():
    print("=" * 50)
    print("Python asyncio 教程 — 第九章 demo")
    print("=" * 50 + "\\n")

    await demo_state()
    await demo_cancel()
    await demo_propagation()
    await demo_reference()
    await demo_callback()
    await demo_exception()
    await demo_practical()

    print("=" * 50)
    print("总结：")
    print("• task.cancel() 取消任务")
    print("• CancelledError 必须 raise，不能吞")
    print("• finally 里做清理")
    print("• Task 引用要被保留，否则被 GC")
    print("• add_done_callback 监听完成")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
`,
  },
];
