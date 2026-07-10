// =============================================================
// Python asyncio 教程 V2（pyasync2）—— 第二批章节
// -------------------------------------------------------------
// 核心 API（5-9章）
//   第 5 章：asyncio.run 与入口
//   第 6 章：Task：把协程挂起来
//   第 7 章：asyncio.gather 并发执行
//   第 8 章：asyncio.wait 更灵活的控制
//   第 9 章：create_task 与 await 的区别
// =============================================================

export const chapters = [
  // =========================================================
  // 第五章：asyncio.run 与入口
  // =========================================================
  {
    id: "pa2-05",
    group: "核心 API",
    icon: "🚪",
    title: "asyncio.run 与入口",
    content: `## 一、asyncio.run 是什么？

\`asyncio.run(coro)\` 是运行协程的**推荐入口**。

它会自动：
1. 创建新的事件循环
2. 运行传入的协程
3. 关闭事件循环

## 二、基本用法

\`\`\`python
import asyncio

async def main():
    print("Hello, asyncio")

asyncio.run(main())
\`\`\`

## 三、为什么只能用一次？

\`asyncio.run\` 内部会调用 \`loop.close()\`，关闭后不能再次使用。

## 四、入口函数的作用

- 让同步世界和异步世界衔接
- 测试脚本常用
- 命令行工具的启动点

## 五、main 函数的常见写法

\`\`\`python
import asyncio
async def main():
    # 1. 初始化
    # 2. 启动任务
    # 3. 收尾
    pass

if __name__ == "__main__":
    asyncio.run(main())
\`\`\`

## 六、异常处理

\`\`\`python
try:
    asyncio.run(main())
except Exception as e:
    print(f"出错了: {e}")
\`\`\`

## 七、本章 demo

练习 asyncio.run 的用法。
`,
    code: `"""
第五章 demo：asyncio.run 与入口
目标：掌握 asyncio.run 的正确用法。
"""
import asyncio


# ===== 1. 最简单入口 =====
async def main1():
    print("  Hello, asyncio!")


print("=== 1. 最简单入口 ===")
asyncio.run(main1())
print()


# ===== 2. main 函数负责初始化 =====
async def fetch_data(name):
    await asyncio.sleep(0.5)
    return f"{name} 的数据"


async def main2():
    print("=== 2. main 里初始化并运行 ===")
    result = await fetch_data("用户")
    print(f"  结果: {result}")


asyncio.run(main2())
print()


# ===== 3. 异常处理 =====
async def buggy():
    await asyncio.sleep(0.1)
    raise ValueError("模拟错误")


async def main3():
    print("=== 3. 异常处理 ===")
    try:
        await buggy()
    except ValueError as e:
        print(f"  捕获到异常: {e}")


asyncio.run(main3())
print()


# ===== 4. 多次 run 的问题 =====
print("=== 4. 不要重复调用 asyncio.run ===")
print("""
  # 错误写法：
  asyncio.run(main())
  asyncio.run(main())  # RuntimeError: 事件循环已关闭

  # 正确写法：
  asyncio.run(run_many())  # 把所有逻辑放在一个入口里
""")


# ===== 5. __main__ 入口 =====
print("=== 5. 标准入口模板 ===")
print("""
  import asyncio

  async def main():
      # 你的异步代码
      pass

  if __name__ == "__main__":
      asyncio.run(main())
""")


# ===== 6. 入口内返回结果 =====
async def compute_sum():
    await asyncio.sleep(0.1)
    return sum(range(100))


async def main6():
    result = await compute_sum()
    return result


print("=== 6. asyncio.run 返回协程结果 ===")
result = asyncio.run(main6())
print(f"  返回值: {result}")
`,
  },

  // =========================================================
  // 第六章：Task：把协程挂起来
  // =========================================================
  {
    id: "pa2-06",
    group: "核心 API",
    icon: "📌",
    title: "Task：把协程挂起来",
    content: `## 一、什么是 Task？

Task 是 **被事件循环调度执行的协程包装**。

当你调用 \`asyncio.create_task(coro)\`，事件循环会：
1. 立即开始执行这个协程
2. 允许你继续做其它事
3. 最后再 await 它拿结果

## 二、为什么需要 Task？

普通 await 是**串行**的：

\`\`\`python
a = await fetch1()  # 等 1 秒
b = await fetch2()  # 再等 1 秒
# 总 2 秒
\`\`\`

Task 可以**并发**：

\`\`\`python
t1 = asyncio.create_task(fetch1())  # 立刻开始
t2 = asyncio.create_task(fetch2())  # 立刻开始
a = await t1  # 等两者完成
b = await t2
# 总 1 秒
\`\`\`

## 三、create_task 的返回值

\`\`\`python
import asyncio
task = asyncio.create_task(some_coro())
print(task)  # <Task pending name='Task-1' coro=<some_coro() running at ...>>
\`\`\`

## 四、Task 的状态

- pending：等待中
- done：已完成
- cancelled：已取消

## 五、常用方法

| 方法 | 作用 |
|------|------|
| \`await task\` | 等待完成并获取结果 |
| \`task.done()\` | 是否完成 |
| \`task.result()\` | 获取结果（需先 done） |
| \`task.cancel()\` | 取消任务 |
| \`task.exception()\` | 获取异常 |

## 六、本章 demo

演示 Task 的基本用法。
`,
    code: `"""
第六章 demo：Task 的使用
目标：理解 create_task 如何让协程并发执行。
"""
import asyncio
import time


async def fetch(name, delay):
    """模拟网络请求"""
    print(f"  [{name}] 开始")
    await asyncio.sleep(delay)
    print(f"  [{name}] 完成")
    return f"{name} 的结果"


# ===== 1. 串行 await =====
async def sequential():
    print("=== 1. 串行 await ===")
    start = time.time()
    a = await fetch("A", 1)
    b = await fetch("B", 1)
    print(f"  结果: {a}, {b}")
    print(f"  总耗时: {time.time() - start:.2f} 秒")


asyncio.run(sequential())
print()


# ===== 2. 并发 Task =====
async def concurrent():
    print("=== 2. 并发 Task ===")
    start = time.time()
    t1 = asyncio.create_task(fetch("A", 1))
    t2 = asyncio.create_task(fetch("B", 1))

    # 在任务执行期间，可以做点别的事
    print("  任务已启动，先做点别的...")

    a = await t1
    b = await t2
    print(f"  结果: {a}, {b}")
    print(f"  总耗时: {time.time() - start:.2f} 秒")


asyncio.run(concurrent())
print()


# ===== 3. Task 的状态 =====
async def task_state():
    print("=== 3. Task 状态 ===")
    t = asyncio.create_task(fetch("状态测试", 0.2))
    print(f"  创建后 done: {t.done()}")
    await t
    print(f"  完成后 done: {t.done()}")
    print(f"  结果: {t.result()}")


asyncio.run(task_state())
print()


# ===== 4. 批量创建 Task =====
async def many_tasks():
    print("=== 4. 批量创建 Task ===")
    start = time.time()
    tasks = [asyncio.create_task(fetch(f"任务{i}", 0.5)) for i in range(5)]
    results = [await t for t in tasks]
    print(f"  结果数: {len(results)}")
    print(f"  总耗时: {time.time() - start:.2f} 秒")


asyncio.run(many_tasks())
print()


# ===== 5. 取消 Task =====
async def long_task():
    print("  长任务开始")
    try:
        await asyncio.sleep(10)
    except asyncio.CancelledError:
        print("  长任务收到取消信号")
        raise


async def cancel_demo():
    print("=== 5. 取消 Task ===")
    t = asyncio.create_task(long_task())
    await asyncio.sleep(0.1)
    t.cancel()
    try:
        await t
    except asyncio.CancelledError:
        print("  取消成功")


asyncio.run(cancel_demo())
print()


# ===== 6. Task 名字 =====
async def named_task():
    print("=== 6. 给 Task 起名字 ===")
    t = asyncio.create_task(fetch("命名任务", 0.1), name="my-task")
    print(f"  Task 名字: {t.get_name()}")
    await t


asyncio.run(named_task())
`,
  },

  // =========================================================
  // 第七章：asyncio.gather 并发执行
  // =========================================================
  {
    id: "pa2-07",
    group: "核心 API",
    icon: "🎯",
    title: "asyncio.gather 并发执行",
    content: `## 一、什么是 gather？

\`asyncio.gather\` 同时运行多个可等待对象，**等全部完成**后返回结果列表。

\`\`\`python
results = await asyncio.gather(
    fetch("A"),
    fetch("B"),
    fetch("C"),
)
# results = ["A 的结果", "B 的结果", "C 的结果"]
\`\`\`

## 二、gather 的特点

- 并发执行
- 返回结果按传入顺序
- 一个异常会让整体失败（默认）

## 三、异常处理：return_exceptions

\`\`\`python
results = await asyncio.gather(
    fetch("A"),
    buggy(),
    fetch("B"),
    return_exceptions=True
)
# results = ["A 的结果", ValueError(...), "B 的结果"]
\`\`\`

## 四、gather 的返回值

\`\`\`python
# 传入多个参数
results = await asyncio.gather(coro1(), coro2())

# 传入列表
results = await asyncio.gather(*coros)
\`\`\`

## 五、什么时候用 gather？

- 多个任务**相互独立**
- 需要**所有结果**一起回来
- 比如批量下载、并发查询

## 六、本章 demo

演示 gather 的各种用法。
`,
    code: `"""
第七章 demo：asyncio.gather
目标：掌握并发执行多个协程并收集结果。
"""
import asyncio
import time


async def fetch(name, delay):
    """模拟请求"""
    await asyncio.sleep(delay)
    return f"{name} 的结果"


async def buggy(name):
    """会出错的协程"""
    await asyncio.sleep(0.1)
    raise ValueError(f"{name} 出错了")


# ===== 1. 基本 gather =====
async def basic():
    print("=== 1. 基本 gather ===")
    start = time.time()
    results = await asyncio.gather(
        fetch("A", 0.3),
        fetch("B", 0.2),
        fetch("C", 0.1),
    )
    print(f"  结果: {results}")
    print(f"  总耗时: {time.time() - start:.2f} 秒")


asyncio.run(basic())
print()


# ===== 2. gather 解包 =====
async def unpack():
    print("=== 2. 解包 gather 结果 ===")
    a, b, c = await asyncio.gather(
        fetch("A", 0.1),
        fetch("B", 0.2),
        fetch("C", 0.3),
    )
    print(f"  a={a}, b={b}, c={c}")


asyncio.run(unpack())
print()


# ===== 3. 批量任务 =====
async def batch():
    print("=== 3. 批量任务（用列表） ===")
    tasks = [fetch(f"任务{i}", 0.1) for i in range(10)]
    results = await asyncio.gather(*tasks)
    print(f"  完成数量: {len(results)}")
    print(f"  前 3 个: {results[:3]}")


asyncio.run(batch())
print()


# ===== 4. 异常处理（默认） =====
async def exception_default():
    print("=== 4. 默认异常处理 ===")
    try:
        await asyncio.gather(
            fetch("A", 0.1),
            buggy("B"),
            fetch("C", 0.2),
        )
    except ValueError as e:
        print(f"  捕获异常: {e}")
        print("  注意：B 出错后，其它任务可能也被取消")


asyncio.run(exception_default())
print()


# ===== 5. return_exceptions=True =====
async def exception_safe():
    print("=== 5. return_exceptions=True ===")
    results = await asyncio.gather(
        fetch("A", 0.1),
        buggy("B"),
        fetch("C", 0.2),
        return_exceptions=True,
    )
    print(f"  结果: {results}")
    for i, r in enumerate(results):
        if isinstance(r, Exception):
            print(f"    任务 {i} 异常: {r}")
        else:
            print(f"    任务 {i} 成功: {r}")


asyncio.run(exception_safe())
print()


# ===== 6. 实战：并发统计 =====
async def count_to(n):
    await asyncio.sleep(0.1)
    return sum(range(n + 1))


async def stats():
    print("=== 6. 实战：并发统计 ===")
    ns = [10, 100, 1000]
    results = await asyncio.gather(
        *[count_to(n) for n in ns]
    )
    for n, r in zip(ns, results):
        print(f"  1+...+{n} = {r}")


asyncio.run(stats())
`,
  },

  // =========================================================
  // 第八章：asyncio.wait 更灵活的控制
  // =========================================================
  {
    id: "pa2-08",
    group: "核心 API",
    icon: "⏳",
    title: "asyncio.wait 更灵活的控制",
    content: `## 一、wait 与 gather 的区别

| 特性 | gather | wait |
|------|--------|------|
| 返回 | 结果列表 | (done, pending) 集合 |
| 完成条件 | 全部完成 | 可配置 |
| 异常处理 | 自动传播 | 手动处理 |
| 超时控制 | 不支持 | 支持 |

## 二、asyncio.wait 基本用法

\`\`\`python
tasks = [asyncio.create_task(coro) for coro in coros]
done, pending = await asyncio.wait(tasks)
\`\`\`

## 三、return_when 参数

| 值 | 含义 |
|----|------|
| \`ALL_COMPLETED\` | 全部完成（默认） |
| \`FIRST_COMPLETED\` | 第一个完成 |
| \`FIRST_EXCEPTION\` | 第一个异常 |

## 四、timeout 参数

\`\`\`python
done, pending = await asyncio.wait(
    tasks,
    timeout=5.0
)
\`\`\`

超时的任务会留在 \`pending\` 集合里。

## 五、取消 pending 任务

\`\`\`python
for task in pending:
    task.cancel()
await asyncio.gather(*pending, return_exceptions=True)
\`\`\`

## 六、什么时候用 wait？

- 只需要第一个结果
- 有超时控制需求
- 需要手动处理部分完成的任务

## 七、本章 demo

演示 wait 的各种用法。
`,
    code: `"""
第八章 demo：asyncio.wait
目标：掌握更灵活的任务控制（FIRST_COMPLETED、超时等）。
"""
import asyncio
import time


async def fetch(name, delay):
    """模拟请求"""
    print(f"  [{name}] 开始")
    await asyncio.sleep(delay)
    print(f"  [{name}] 完成")
    return f"{name} 的结果"


# ===== 1. 基本 wait =====
async def basic_wait():
    print("=== 1. 基本 wait ===")
    tasks = [
        asyncio.create_task(fetch("A", 0.3)),
        asyncio.create_task(fetch("B", 0.2)),
        asyncio.create_task(fetch("C", 0.1)),
    ]
    done, pending = await asyncio.wait(tasks)
    print(f"  完成: {len(done)}, 等待中: {len(pending)}")
    for task in done:
        print(f"    {task.result()}")


asyncio.run(basic_wait())
print()


# ===== 2. FIRST_COMPLETED =====
async def first_completed():
    print("=== 2. 第一个完成 ===")
    tasks = [
        asyncio.create_task(fetch("慢 A", 1.0)),
        asyncio.create_task(fetch("快 B", 0.1)),
        asyncio.create_task(fetch("中 C", 0.5)),
    ]
    done, pending = await asyncio.wait(
        tasks,
        return_when=asyncio.FIRST_COMPLETED
    )
    print(f"  第一个完成: {done.pop().result()}")
    print(f"  还有 {len(pending)} 个在运行")

    # 取消剩余任务
    for task in pending:
        task.cancel()
    await asyncio.gather(*pending, return_exceptions=True)
    print("  已取消剩余任务")


asyncio.run(first_completed())
print()


# ===== 3. 超时控制 =====
async def timeout_demo():
    print("=== 3. 超时控制 ===")
    tasks = [
        asyncio.create_task(fetch("快任务", 0.2)),
        asyncio.create_task(fetch("慢任务", 1.0)),
    ]
    done, pending = await asyncio.wait(
        tasks,
        timeout=0.5,
        return_when=asyncio.ALL_COMPLETED,
    )
    print(f"  完成: {len(done)}, 超时: {len(pending)}")

    for task in done:
        print(f"    完成: {task.result()}")

    for task in pending:
        print(f"    超时未完成的取消: {task.get_name()}")
        task.cancel()

    await asyncio.gather(*pending, return_exceptions=True)


asyncio.run(timeout_demo())
print()


# ===== 4. 竞赛：谁先返回用谁 =====
async def race():
    print("=== 4. 竞速：取第一个结果 ===")
    sources = ["源 A", "源 B", "源 C"]
    tasks = [
        asyncio.create_task(fetch(s, i * 0.1))
        for i, s in enumerate(sources)
    ]

    done, pending = await asyncio.wait(
        tasks,
        return_when=asyncio.FIRST_COMPLETED
    )
    winner = done.pop()
    print(f"  获胜者: {winner.result()}")

    for task in pending:
        task.cancel()
    await asyncio.gather(*pending, return_exceptions=True)


asyncio.run(race())
print()


# ===== 5. 分批处理 =====
async def process_batch(tasks, timeout):
    """处理一批任务，超时的放入下一轮"""
    done, pending = await asyncio.wait(
        tasks,
        timeout=timeout,
        return_when=asyncio.ALL_COMPLETED,
    )
    for task in done:
        print(f"    完成: {task.result()}")

    for task in pending:
        task.cancel()
    await asyncio.gather(*pending, return_exceptions=True)
    return len(done), len(pending)


async def batch_demo():
    print("=== 5. 分批处理任务 ===")
    tasks = [asyncio.create_task(fetch(f"任务{i}", i * 0.2)) for i in range(5)]
    completed, timeout_count = await process_batch(tasks, 0.7)
    print(f"  本批完成: {completed}, 超时: {timeout_count}")


asyncio.run(batch_demo())
`,
  },

  // =========================================================
  // 第九章：create_task 与 await 的区别
  // =========================================================
  {
    id: "pa2-09",
    group: "核心 API",
    icon: "🔄",
    title: "create_task 与 await 的区别",
    content: `## 一、await 协程 = 立即执行并等待

\`\`\`python
result = await fetch("A")
# 直接执行 fetch("A")，并等它完成
\`\`\`

## 二、create_task = 交给事件循环调度

\`\`\`python
task = asyncio.create_task(fetch("A"))
# 立即开始执行，但你可以先干别的
result = await task  # 等需要的时候再拿结果
\`\`\`

## 三、关键区别

| 写法 | 是否并发 | 使用场景 |
|------|----------|----------|
| \`await coro()\` | 否 | 串行依赖 |
| \`create_task + await\` | 是 | 并发执行 |

## 四、常见错误

\`\`\`python
# ❌ 这样不是并发
await fetch("A")
await fetch("B")

# ✅ 这样才是并发
t1 = asyncio.create_task(fetch("A"))
t2 = asyncio.create_task(fetch("B"))
await t1
await t2
\`\`\`

## 五、create_task 是火还是药？

- 是**启动器**：创建任务并立即开始
- 不是**执行器**：只有事件循环在运行，任务才会跑

## 六、await 多个 Task 的顺序

\`\`\`python
t1 = asyncio.create_task(fetch("A", 0.5))
t2 = asyncio.create_task(fetch("B", 0.1))

await t1
await t2
# 总耗时 0.5 秒，不是 0.6 秒
\`\`\`

## 七、什么时候不需要 create_task？

- 只需要顺序执行
- 不需要并发
- 用 \`await asyncio.gather\` 更简洁

## 八、本章 demo

对比不同写法的时间差异。
`,
    code: `"""
第九章 demo：create_task 与 await 的区别
目标：彻底理解串行 await 和并发 Task 的差异。
"""
import asyncio
import time


async def fetch(name, delay):
    """模拟请求"""
    print(f"  [{name}] 开始")
    await asyncio.sleep(delay)
    print(f"  [{name}] 完成")
    return f"{name} 的结果"


# ===== 1. await 协程：串行 =====
async def serial_await():
    print("=== 1. await 协程（串行） ===")
    start = time.time()
    a = await fetch("A", 0.3)
    b = await fetch("B", 0.3)
    print(f"  结果: {a}, {b}")
    print(f"  总耗时: {time.time() - start:.2f} 秒（预期 ≈ 0.6 秒）")


asyncio.run(serial_await())
print()


# ===== 2. create_task + await：并发 =====
async def concurrent_task():
    print("=== 2. create_task + await（并发） ===")
    start = time.time()
    t1 = asyncio.create_task(fetch("A", 0.3))
    t2 = asyncio.create_task(fetch("B", 0.3))

    # 这里可以做别的事，两个任务在后台跑
    print("  任务已创建，准备 await 结果...")

    a = await t1
    b = await t2
    print(f"  结果: {a}, {b}")
    print(f"  总耗时: {time.time() - start:.2f} 秒（预期 ≈ 0.3 秒）")


asyncio.run(concurrent_task())
print()


# ===== 3. gather：最简洁的并发 =====
async def gather_version():
    print("=== 3. gather（简洁并发） ===")
    start = time.time()
    a, b = await asyncio.gather(
        fetch("A", 0.3),
        fetch("B", 0.3),
    )
    print(f"  结果: {a}, {b}")
    print(f"  总耗时: {time.time() - start:.2f} 秒")


asyncio.run(gather_version())
print()


# ===== 4. 顺序 await Task 仍然是并发 =====
async def sequential_await_but_concurrent():
    print("=== 4. 顺序 await 但底层并发 ===")
    start = time.time()
    t1 = asyncio.create_task(fetch("A", 0.5))
    t2 = asyncio.create_task(fetch("B", 0.1))

    # 虽然 await t1 先写，但 B 也会同时完成
    a = await t1
    b = await t2
    print(f"  结果: {a}, {b}")
    print(f"  总耗时: {time.time() - start:.2f} 秒（预期 ≈ 0.5 秒，以慢者为准）")


asyncio.run(sequential_await_but_concurrent())
print()


# ===== 5. 错误写法：以为并发其实没有 =====
print("=== 5. 常见错误 ===")
print("""
  # 错误：以为这样是并发
  await asyncio.create_task(fetch("A", 0.3))
  await asyncio.create_task(fetch("B", 0.3))

  # 正确：先全部创建，再 await
  t1 = asyncio.create_task(fetch("A", 0.3))
  t2 = asyncio.create_task(fetch("B", 0.3))
  await t1
  await t2
""")


# ===== 6. 实战：同时预热多个服务 =====
async def warm_up(service, delay):
    await asyncio.sleep(delay)
    return f"{service} 已就绪"


async def main():
    print("=== 6. 实战：预热多个服务 ===")
    services = {
        "数据库": 0.2,
        "缓存": 0.1,
        "消息队列": 0.3,
    }
    tasks = {
        name: asyncio.create_task(warm_up(name, delay))
        for name, delay in services.items()
    }
    results = {name: await task for name, task in tasks.items()}
    for name, result in results.items():
        print(f"  {result}")


asyncio.run(main())
`,
  },
];
