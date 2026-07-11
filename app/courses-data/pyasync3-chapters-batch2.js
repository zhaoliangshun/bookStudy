// =============================================================
// Python asyncio 教程 V3（pyasync3）—— 第二批章节，核心 API（5-8章）
// -------------------------------------------------------------
// demo 驱动学 asyncio：每一章都从一个可运行的完整 demo 开始，
// 通过逐行中文注释 + 从 demo 提取知识点，让你「看代码就懂原理」。
//
//   第 5 章：asyncio.run 程序入口
//   第 6 章：Task 任务并发
//   第 7 章：asyncio.gather 批量并发
//   第 8 章：asyncio.wait 灵活控制
// =============================================================

export const chapters = [
  // =========================================================
  // 第五章：asyncio.run 程序入口
  // =========================================================
  {
    id: "pa3-05",
    group: "核心 API",
    icon: "🚪",
    title: "asyncio.run 程序入口",
    content: `## 先看一个 demo

\`\`\`python
import asyncio

async def main():
    print("你好，asyncio！")

asyncio.run(main())
\`\`\`

\`asyncio.run\` 就是 asyncio 的**总开关**——按下它，异步世界才开始运转。

## 生活类比

\`asyncio.run\` 像剧场管理员，做三件事：
1. 开门（创建事件循环）
2. 演出（运行 main）
3. 关门（关闭循环）

## 从 demo 提取的知识点

| 知识点 | 说明 |
|--------|------|
| 做了三件事 | 创建循环 → 运行协程 → 关闭循环 |
| 只能调一次 | 关闭后循环不可复用 |
| 返回值 | main 的 return 会传出来 |
| 异常处理 | 在 main 内部 try/except |

## main 的常见写法

\`\`\`python
async def main():
    # 1. 初始化
    # 2. 干活
    # 3. 收尾

if __name__ == "__main__":
    asyncio.run(main())
\`\`\`

看下面的代码，逐行感受 run 的用法。
`,
    code: `"""
第五章 demo：asyncio.run 程序入口
目标：掌握 asyncio.run 这个"总开关"的正确用法。
"""
import asyncio
import time


# ===== 1. 最简入口 =====
async def main1():
    # 最简单的 main：只打印一行
    print("  你好，asyncio！")  # 这行会在事件循环里执行


print("=== 1. 最简入口 ===")
asyncio.run(main1())  # 启动事件循环 → 跑 main1 → 关闭循环
print()  # 空行分隔每个 demo


# ===== 2. main 负责初始化 + 运行 + 收尾 =====
async def fetch_data(name):
    # 模拟一个异步操作（比如查数据库）
    await asyncio.sleep(0.3)  # 假装耗时 0.3 秒
    return f"{name}的数据"  # 返回结果


async def main2():
    # main 就像"总指挥"：先准备、再干活、最后收尾
    print("  [1] 初始化：连接数据库...")  # 第一步：初始化
    result = await fetch_data("用户A")  # 第二步：干活（await 等结果）
    print(f"  [2] 拿到结果：{result}")  # 打印拿到的结果
    print("  [3] 收尾：关闭连接")  # 第三步：收尾


print("=== 2. main 负责初始化 + 运行 + 收尾 ===")
asyncio.run(main2())  # 一个 run 跑完整个流程
print()


# ===== 3. 异常处理 =====
async def buggy():
    # 这个协程会抛异常
    await asyncio.sleep(0.1)  # 先睡一会儿
    raise ValueError("模拟出错了")  # 主动抛 ValueError


async def main3():
    # 在 main 里用 try/except 接住异常，程序不会崩
    try:
        await buggy()  # 调用会出错的协程
    except ValueError as e:
        print(f"  捕获到异常：{e}")  # 异常被接住，正常打印


print("=== 3. 异常处理 ===")
asyncio.run(main3())
print()


# ===== 4. 不要重复调用 asyncio.run =====
print("=== 4. 不要重复调用 asyncio.run ===")
print("""
  # 错误写法：
  asyncio.run(main1())
  asyncio.run(main1())  # RuntimeError: Event loop is closed（循环已关闭）

  # 正确写法：把所有逻辑放进一个 main 里
  async def main():
      await task_a()
      await task_b()
  asyncio.run(main())  # 只调一次
""")
print()


# ===== 5. 标准入口模板 =====
print("=== 5. 标准入口模板 ===")
print("""
  import asyncio

  async def main():
      # 你的异步逻辑写在这里
      pass

  if __name__ == "__main__":
      asyncio.run(main())  # 唯一入口
""")
print()


# ===== 6. asyncio.run 的返回值 =====
async def compute():
    # 一个会返回结果的协程
    await asyncio.sleep(0.1)  # 假装在计算
    return sum(range(101))  # 0+1+...+100 = 5050


async def main6():
    # main 自己也 return，run 会把这个值传出来
    result = await compute()  # 拿到 compute 的结果
    return result  # main 把结果返回给 run


print("=== 6. asyncio.run 返回结果 ===")
final = asyncio.run(main6())  # run 的返回值 = main 的返回值
print(f"  run 返回的结果：{final}")  # 打印 5050
`,
  },

  // =========================================================
  // 第六章：Task 任务并发
  // =========================================================
  {
    id: "pa3-06",
    group: "核心 API",
    icon: "📌",
    title: "Task 任务并发",
    content: `## 先看一个 demo

\`\`\`python
import asyncio, time

async def fetch(name, delay):
    await asyncio.sleep(delay)
    return f"{name}的结果"

# 串行：约 2 秒
a = await fetch("A", 1.0)
b = await fetch("B", 1.0)

# 并发：约 1 秒
t1 = asyncio.create_task(fetch("A", 1.0))
t2 = asyncio.create_task(fetch("B", 1.0))
a = await t1
b = await t2
\`\`\`

同样的两个任务，串行要 2 秒，并发只要 1 秒——这就是 Task 的威力。

## 生活类比

- 串行 \`await\` = 排队买饭，等第一家买完才去第二家
- \`create_task\` = 同时点两份外卖，两边同时做

## 从 demo 提取的知识点

| 知识点 | 说明 |
|--------|------|
| Task 是什么 | 被事件循环调度的协程包装 |
| create_task | 立刻开始执行，返回 Task 对象 |
| await task | 等它完成并拿结果 |
| 状态 | pending → done / cancelled |

## 常用方法

| 方法 | 作用 |
|------|------|
| \`await task\` | 等待并取结果 |
| \`task.done()\` | 是否完成 |
| \`task.result()\` | 取结果 |
| \`task.cancel()\` | 取消任务 |
| \`task.exception()\` | 取异常 |

看下面代码，对比串行和并发的速度差。
`,
    code: `"""
第六章 demo：Task 任务并发
目标：看懂串行 await 和并发 Task 的速度差异，掌握 Task 常用方法。
"""
import asyncio
import time


async def fetch(name, delay):
    # 模拟一个耗时请求（比如网络下载）
    print(f"  [{name}] 开始")  # 任务开始
    await asyncio.sleep(delay)  # 假装耗时 delay 秒
    print(f"  [{name}] 完成")  # 任务完成
    return f"{name}的结果"  # 返回结果


# ===== 1. 串行 await（排队干，慢） =====
async def serial():
    print("=== 1. 串行 await（像排队买饭） ===")
    start = time.time()  # 记录开始时间
    a = await fetch("A", 1.0)  # 等 A 跑完（1 秒）
    b = await fetch("B", 1.0)  # A 完了才开始 B（再 1 秒）
    print(f"  结果：{a}, {b}")
    cost = time.time() - start  # 计算总耗时
    print(f"  总耗时：{cost:.2f} 秒（预期 ≈ 2 秒）")


asyncio.run(serial())
print()


# ===== 2. 并发 Task（同时干，快） =====
async def concurrent():
    print("=== 2. 并发 Task（像同时点两份外卖） ===")
    start = time.time()  # 记录开始时间
    t1 = asyncio.create_task(fetch("A", 1.0))  # 立刻派 A 去跑
    t2 = asyncio.create_task(fetch("B", 1.0))  # 立刻派 B 去跑
    print("  两个任务已派出，等结果...")  # 它们在后台同时跑
    a = await t1  # 等 A 完成（同时 B 也在跑）
    b = await t2  # B 此时已完成或快完成
    print(f"  结果：{a}, {b}")
    cost = time.time() - start  # 计算总耗时
    print(f"  总耗时：{cost:.2f} 秒（预期 ≈ 1 秒）")


asyncio.run(concurrent())
print()


# ===== 3. Task 的状态 =====
async def state_demo():
    print("=== 3. Task 的状态 ===")
    t = asyncio.create_task(fetch("状态", 0.2))  # 创建任务，立刻开始
    print(f"  创建后 done()? {t.done()}")  # False：还没跑完
    await t  # 等它跑完
    print(f"  完成后 done()? {t.done()}")  # True：跑完了
    print(f"  result()? {t.result()}")  # 可以安全取结果


asyncio.run(state_demo())
print()


# ===== 4. 批量创建 Task =====
async def batch_tasks():
    print("=== 4. 批量创建 Task ===")
    start = time.time()
    # 用列表推导式一次性创建 5 个任务，全部立刻开始跑
    tasks = [asyncio.create_task(fetch(f"任务{i}", 0.5)) for i in range(5)]
    # 依次 await 每个任务拿结果（它们是并发的，所以总耗时 ≈ 0.5 秒）
    results = [await t for t in tasks]
    print(f"  完成数量：{len(results)}")
    print(f"  总耗时：{time.time() - start:.2f} 秒（预期 ≈ 0.5 秒）")


asyncio.run(batch_tasks())
print()


# ===== 5. 取消 Task =====
async def long_task():
    # 一个会跑很久的任务
    print("  长任务开始，要跑 10 秒...")
    try:
        await asyncio.sleep(10)  # 假装要 10 秒
    except asyncio.CancelledError:
        # 被取消时会抛 CancelledError
        print("  长任务收到取消信号！")
        raise  # 重新抛出，让外界知道被取消了


async def cancel_demo():
    print("=== 5. 取消 Task ===")
    t = asyncio.create_task(long_task())  # 派出长任务
    await asyncio.sleep(0.1)  # 让它跑一会儿
    t.cancel()  # 发送取消信号
    try:
        await t  # 等它处理取消
    except asyncio.CancelledError:
        print("  成功取消任务")


asyncio.run(cancel_demo())
print()


# ===== 6. 给 Task 命名 =====
async def named_demo():
    print("=== 6. 给 Task 起名字 ===")
    # name 参数给任务起名，方便调试和日志
    t = asyncio.create_task(fetch("命名", 0.1), name="my-task-001")
    print(f"  任务名字：{t.get_name()}")  # 取出名字
    await t  # 等它完成


asyncio.run(named_demo())
`,
  },

  // =========================================================
  // 第七章：asyncio.gather 批量并发
  // =========================================================
  {
    id: "pa3-07",
    group: "核心 API",
    icon: "🎯",
    title: "asyncio.gather 批量并发",
    content: `## 先看一个 demo

\`\`\`python
import asyncio

async def fetch(name, delay):
    await asyncio.sleep(delay)
    return f"{name}的结果"

results = await asyncio.gather(
    fetch("A", 0.3),
    fetch("B", 0.2),
    fetch("C", 0.1),
)
# results = ["A的结果", "B的结果", "C的结果"]
# 总耗时 ≈ 0.3 秒（最慢的那个）
\`\`\`

\`gather\` = 一次性派出多个任务，等全部回来，结果**按传入顺序**排好。

## 生活类比

gather 像开会：所有人到齐才开始，签到表按通知顺序排，不是谁先到谁排前面。

## 从 demo 提取的知识点

| 知识点 | 说明 |
|--------|------|
| 同时运行 | 多个协程并发跑 |
| 结果顺序 | 按传入顺序，不是完成顺序 |
| 总耗时 | ≈ 最慢任务的时间 |
| 异常 | 默认一个出错全挂 |

## return_exceptions 用法

\`\`\`python
results = await asyncio.gather(
    fetch("A", 0.1),
    buggy("B"),          # 会出错
    fetch("C", 0.2),
    return_exceptions=True,
)
# results = ["A的结果", ValueError(...), "C的结果"]
\`\`\`

## 什么时候用 gather？

- 任务相互独立
- 需要所有结果一起回来
- 比如批量下载、并发查询

看下面代码，感受 gather 的简洁。
`,
    code: `"""
第七章 demo：asyncio.gather 批量并发
目标：用 gather 一次跑完多个任务，按顺序收结果，学会处理异常。
"""
import asyncio
import time


async def fetch(name, delay):
    # 模拟请求：睡 delay 秒后返回结果
    await asyncio.sleep(delay)  # 假装网络耗时
    return f"{name}的结果"  # 返回结果


async def buggy(name):
    # 这个协程会出错（用来演示异常处理）
    await asyncio.sleep(0.1)  # 先睡一会儿
    raise ValueError(f"{name}出错了")  # 抛 ValueError


# ===== 1. 基本 gather =====
async def basic_gather():
    print("=== 1. 基本 gather ===")
    start = time.time()
    # gather 同时启动 3 个请求，等全部完成
    results = await asyncio.gather(
        fetch("A", 0.3),  # 最慢
        fetch("B", 0.2),
        fetch("C", 0.1),  # 最快
    )
    print(f"  结果：{results}")  # 按传入顺序返回，不是完成顺序
    print(f"  总耗时：{time.time() - start:.2f} 秒（预期 ≈ 0.3 秒 = 最慢的）")


asyncio.run(basic_gather())
print()


# ===== 2. 解包结果 =====
async def unpack_demo():
    print("=== 2. 解包 gather 的结果 ===")
    # 结果顺序和传入顺序一致，可以放心解包
    a, b, c = await asyncio.gather(
        fetch("甲", 0.1),
        fetch("乙", 0.2),
        fetch("丙", 0.3),
    )
    print(f"  a={a}")  # 甲的结果
    print(f"  b={b}")  # 乙的结果
    print(f"  c={c}")  # 丙的结果


asyncio.run(unpack_demo())
print()


# ===== 3. 批量任务（列表解包） =====
async def batch_demo():
    print("=== 3. 批量任务（用列表） ===")
    # 生成 10 个协程，用 * 解包传给 gather
    coros = [fetch(f"任务{i}", 0.1) for i in range(10)]
    results = await asyncio.gather(*coros)  # * 解包列表
    print(f"  完成数量：{len(results)}")
    print(f"  前 3 个：{results[:3]}")


asyncio.run(batch_demo())
print()


# ===== 4. 默认异常处理（一个出错全挂） =====
async def default_exception():
    print("=== 4. 默认异常处理 ===")
    try:
        # 默认：任意一个出错，gather 立刻抛异常
        await asyncio.gather(
            fetch("A", 0.1),
            buggy("B"),  # 这个会出错
            fetch("C", 0.2),
        )
    except ValueError as e:
        print(f"  捕获到异常：{e}")
        print("  注意：B 出错后，整个 gather 失败")


asyncio.run(default_exception())
print()


# ===== 5. return_exceptions=True（出错不挂） =====
async def safe_exception():
    print("=== 5. return_exceptions=True ===")
    # 加上 return_exceptions=True：出错的变成异常对象，不影响其它
    results = await asyncio.gather(
        fetch("A", 0.1),
        buggy("B"),  # 这个会出错
        fetch("C", 0.2),
        return_exceptions=True,  # 关键参数
    )
    print(f"  结果：{results}")
    # 遍历区分成功和失败
    for i, r in enumerate(results):
        if isinstance(r, Exception):  # 是异常对象
            print(f"    任务{i} 失败：{r}")
        else:  # 是正常结果
            print(f"    任务{i} 成功：{r}")


asyncio.run(safe_exception())
print()


# ===== 6. 实战：并发统计 =====
async def count_to(n):
    # 计算 0+1+...+n
    await asyncio.sleep(0.1)  # 假装计算耗时
    return sum(range(n + 1))  # 返回求和


async def stats_demo():
    print("=== 6. 实战：并发统计 ===")
    ns = [10, 100, 1000]  # 三组数据
    # 并发计算三组，结果按顺序返回
    results = await asyncio.gather(*[count_to(n) for n in ns])
    for n, r in zip(ns, results):  # 配对输出
        print(f"  1+2+...+{n} = {r}")


asyncio.run(stats_demo())
`,
  },

  // =========================================================
  // 第八章：asyncio.wait 灵活控制
  // =========================================================
  {
    id: "pa3-08",
    group: "核心 API",
    icon: "⏳",
    title: "asyncio.wait 灵活控制",
    content: `## 先看一个 demo

\`\`\`python
import asyncio

async def fetch(name, delay):
    await asyncio.sleep(delay)
    return f"{name}的结果"

tasks = [
    asyncio.create_task(fetch("A", 1.0)),
    asyncio.create_task(fetch("B", 0.1)),
    asyncio.create_task(fetch("C", 0.5)),
]

# gather：等全部完成
results = await asyncio.gather(*tasks)

# wait：第一个完成就返回，可取消其余
done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
\`\`\`

\`wait\` 比 \`gather\` 更灵活：可以"只要第一个""设超时""分批处理"。

## wait vs gather 区别

| 特性 | gather | wait |
|------|--------|------|
| 返回 | 结果列表 | (done, pending) 集合 |
| 完成条件 | 全部完成 | 可配置 |
| 超时 | 不支持 | 支持 |
| 异常 | 自动传播 | 手动处理 |

## return_when 参数

| 值 | 含义 |
|----|------|
| \`ALL_COMPLETED\` | 全部完成（默认） |
| \`FIRST_COMPLETED\` | 第一个完成 |
| \`FIRST_EXCEPTION\` | 第一个异常 |

## 什么时候用 wait？

- 只需要第一个结果（竞速）
- 要超时控制
- 分批处理任务

看下面代码，体验 wait 的灵活玩法。
`,
    code: `"""
第八章 demo：asyncio.wait 灵活控制
目标：用 wait 实现"取第一个""超时控制""分批处理"等灵活玩法。
"""
import asyncio
import time


async def fetch(name, delay):
    # 模拟请求
    print(f"  [{name}] 开始")  # 任务开始
    await asyncio.sleep(delay)  # 假装耗时
    print(f"  [{name}] 完成")  # 任务完成
    return f"{name}的结果"  # 返回结果


# ===== 1. 基本 wait（和 gather 对比） =====
async def basic_wait():
    print("=== 1. 基本 wait ===")
    # wait 返回 (done, pending) 两个集合，不是结果列表
    tasks = [
        asyncio.create_task(fetch("A", 0.3)),  # 先建任务
        asyncio.create_task(fetch("B", 0.2)),
        asyncio.create_task(fetch("C", 0.1)),
    ]
    done, pending = await asyncio.wait(tasks)  # 默认等全部完成
    print(f"  完成：{len(done)} 个，等待：{len(pending)} 个")
    for t in done:  # 从 done 集合里逐个取结果
        print(f"    {t.result()}")


asyncio.run(basic_wait())
print()


# ===== 2. FIRST_COMPLETED：谁先完成就返回 =====
async def first_completed():
    print("=== 2. FIRST_COMPLETED（谁先完成用谁） ===")
    tasks = [
        asyncio.create_task(fetch("慢A", 1.0)),
        asyncio.create_task(fetch("快B", 0.1)),  # 这个最快
        asyncio.create_task(fetch("中C", 0.5)),
    ]
    done, pending = await asyncio.wait(
        tasks,
        return_when=asyncio.FIRST_COMPLETED,  # 第一个完成就返回
    )
    winner = done.pop()  # 从 done 里拿出第一个完成的
    print(f"  第一个完成：{winner.result()}")
    print(f"  还有 {len(pending)} 个在跑，取消它们")
    for t in pending:  # 取消剩余的任务
        t.cancel()
    # 收尾：等待被取消的任务真正结束，屏蔽 CancelledError 警告
    await asyncio.gather(*pending, return_exceptions=True)


asyncio.run(first_completed())
print()


# ===== 3. 超时控制 =====
async def timeout_demo():
    print("=== 3. 超时控制 ===")
    tasks = [
        asyncio.create_task(fetch("快任务", 0.2), name="快任务"),
        asyncio.create_task(fetch("慢任务", 1.0), name="慢任务"),  # 这个会超时
    ]
    done, pending = await asyncio.wait(
        tasks,
        timeout=0.5,  # 最多等 0.5 秒
        return_when=asyncio.ALL_COMPLETED,
    )
    print(f"  完成：{len(done)}，超时：{len(pending)}")
    for t in done:
        print(f"    完成：{t.result()}")
    for t in pending:
        print(f"    超时，取消：{t.get_name()}")
        t.cancel()  # 取消超时任务
    await asyncio.gather(*pending, return_exceptions=True)  # 屏蔽取消警告


asyncio.run(timeout_demo())
print()


# ===== 4. 竞速：多个源取最快的一个 =====
async def race_demo():
    print("=== 4. 竞速：取第一个返回的源 ===")
    # 比如同时问 3 个接口，谁先回用谁
    sources = ["源A", "源B", "源C"]
    tasks = [
        asyncio.create_task(fetch(s, i * 0.1 + 0.1), name=s)
        for i, s in enumerate(sources)
    ]
    done, pending = await asyncio.wait(
        tasks,
        return_when=asyncio.FIRST_COMPLETED,  # 第一个完成就返回
    )
    winner = done.pop()  # 拿出获胜者
    print(f"  获胜者：{winner.get_name()} → {winner.result()}")
    for t in pending:  # 取消其它还在跑的
        t.cancel()
    await asyncio.gather(*pending, return_exceptions=True)  # 屏蔽警告


asyncio.run(race_demo())
print()


# ===== 5. 分批处理 =====
async def process_batch(tasks, timeout):
    # 处理一批任务，超时的留下并取消
    done, pending = await asyncio.wait(
        tasks,
        timeout=timeout,  # 超时时间
        return_when=asyncio.ALL_COMPLETED,
    )
    for t in done:  # 打印完成的
        print(f"    完成：{t.result()}")
    for t in pending:  # 取消超时的
        t.cancel()
    await asyncio.gather(*pending, return_exceptions=True)  # 屏蔽警告
    return len(done), len(pending)  # 返回完成数和超时数


async def batch_demo():
    print("=== 5. 分批处理 ===")
    # 5 个任务，延迟递增，用 0.7 秒超时
    tasks = [
        asyncio.create_task(fetch(f"任务{i}", i * 0.2), name=f"任务{i}")
        for i in range(5)
    ]
    done_count, timeout_count = await process_batch(tasks, 0.7)
    print(f"  本批完成：{done_count}，超时：{timeout_count}")


asyncio.run(batch_demo())
`,
  },
];
