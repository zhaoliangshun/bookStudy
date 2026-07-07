// =============================================================
// Python 多进程教程（pyprocess）—— 第四批章节
// batch4（14-18章）：进程池与高级特性
//   第14章：  Pool 进程池：多进程的瑞士军刀
//   第15章：  apply / apply_async：单个任务的两种提交方式
//   第16章：  map / map_async：批量任务的并行处理
//   第17章：  imap / imap_unordered：惰性迭代与乱序
//   第18章：  回调函数、错误处理与超时控制
// =============================================================

export const chapters = [
  // =========================================================
  // 第十四章：Pool 进程池：多进程的瑞士军刀
  // =========================================================
  {
    id: "mp-14",
    group: "进程池与高级特性",
    icon: "🏊",
    title: "Pool 进程池：多进程的瑞士军刀",
    content: `## 一、为什么需要 Pool？

直接用 \`Process\` 启动子进程，简单但有限制：

\`\`\`python
# 直接用 Process
processes = []
for i in range(100):
    p = Process(target=work, args=(i,))
    processes.append(p)
    p.start()
# 100 个进程同时跑，机器可能扛不住
\`\`\`

**问题**：
- 100 个进程同时启动 → CPU 切换开销大
- 进程数超过 CPU 核数 → 反而更慢
- 一个个手动管理 → 代码冗长

**Pool 的解法**：固定数量的工作进程，任务来一个就处理一个，处理完再接下一个。

## 二、Pool 是什么？

\`multiprocessing.Pool\` 维护**一组固定数量的工作进程**（默认是 CPU 核数）：

\`\`\`text
        ┌─ 任务 1 ─┐
        ├─ 任务 2 ─┤
任务队列  ├─ 任务 3 ─┤ → [进程1, 进程2, 进程3, 进程4] → 结果队列
        ├─ 任务 4 ─┤
        └─ 任务 5 ─┘
\`\`\`

- 任务来了，分配给空闲的进程
- 进程跑完一个任务，回到池里等下一个
- 不会同时跑超过 \`processes\` 数的进程

## 三、Pool 的 4 种构造方式

\`\`\`python
import multiprocessing

# 方式 1：默认进程数（= CPU 核数）
pool = multiprocessing.Pool()

# 方式 2：指定进程数
pool = multiprocessing.Pool(processes=4)

# 方式 3：用指定启动方式（推荐 spawn 跨平台）
ctx = multiprocessing.get_context("spawn")
pool = ctx.Pool(processes=4)

# 方式 4：自定义 maxtasksperchild（每个进程跑多少任务后重启）
# 适合：处理任务有内存泄漏的场景
pool = multiprocessing.Pool(processes=4, maxtasksperchild=10)
\`\`\`

## 四、Pool 的 4 个核心方法

| 方法 | 返回 | 阻塞 | 用途 |
|------|------|------|------|
| \`apply(func, args)\` | 单个结果 | ✅ | 单个任务，等结果 |
| \`apply_async(func, args)\` | AsyncResult | ❌ | 单个任务，不阻塞 |
| \`map(func, iterable)\` | list | ✅ | 批量任务，保留顺序 |
| \`map_async(func, iterable)\` | AsyncResult | ❌ | 批量任务，不阻塞 |
| \`imap(func, iterable)\` | 迭代器 | ❌ | 惰性迭代，保留顺序 |
| \`imap_unordered(func, iterable)\` | 迭代器 | ❌ | 惰性迭代，乱序 |
| \`starmap(func, iterable)\` | list | ✅ | 多参数批量任务 |
| \`starmap_async(func, iterable)\` | AsyncResult | ❌ | 多参数批量任务，不阻塞 |

**经验**：
- 想立即拿结果 → \`apply\` / \`map\`（阻塞）
- 想提交完继续干别的 → \`apply_async\` / \`map_async\`
- 任务很多，怕占内存 → \`imap\` / \`imap_unordered\`

## 五、Pool 的 5 个管理方法

\`\`\`python
pool.apply(func, args)        # 提交一个任务（阻塞）
pool.apply_async(func, args)  # 提交一个任务（异步）
pool.map(func, iterable)      # 批量任务（阻塞，按顺序返回）
pool.close()                  # 不再接受新任务，等现有任务完成
pool.terminate()              # 立即终止所有工作进程
pool.join()                   # 等待所有工作进程退出（必须先 close/terminate）
\`\`\`

**典型流程**：

\`\`\`python
with multiprocessing.Pool(4) as pool:
    results = pool.map(work, range(100))
# with 块结束自动 close + join
\`\`\`

## 六、Pool vs Process 怎么选？

| 场景 | 推荐 |
|------|------|
| 任务数远大于进程数 | ✅ Pool |
| 任务数 ≤ 10 个 | 直接 Process 也行 |
| 任务需要**长期运行** | ❌ 不要用 Pool（Pool 适合"短任务"） |
| 任务之间需要**复杂通信** | ❌ 用 Process + Queue |
| 单纯"批量分发-收集" | ✅ Pool 最合适 |

## 七、本章 demo

下面 demo 演示：
- Pool 进程池基本用法
- 默认进程数 vs 指定进程数
- with 语句自动管理
- maxtasksperchild 防内存泄漏
- 提交大量任务观察负载
`,
    code: `"""
第十四章 demo：multiprocessing.Pool 进程池
演示：
  1. Pool 基本用法
  2. 默认进程数 vs 指定进程数
  3. with 语句自动管理
  4. maxtasksperchild 防内存泄漏
  5. 大量任务批量处理
"""

import multiprocessing
import os
import time
import random


def cpu_task(x: int) -> int:
    """模拟一个 CPU 密集任务"""
    pid = os.getpid()
    # 故意做点计算
    total = 0
    for i in range(x * 100_000):
        total += i
    return f"pid={pid} x={x} total={total % 10000}"


# ===== Demo 1：基本 Pool =====
def demo_basic_pool():
    print("=== Demo 1: 基本 Pool 用法 ===")
    print(f"本机 CPU 核数: {multiprocessing.cpu_count()}\\n")

    with multiprocessing.Pool(processes=4) as pool:
        # 提交 8 个任务，4 个进程处理
        results = pool.map(cpu_task, [1, 2, 3, 4, 5, 6, 7, 8])

    for r in results:
        print(f"  {r}")
    print()


# ===== Demo 2：默认进程数 =====
def demo_default_workers():
    print("=== Demo 2: 默认进程数 ===")
    with multiprocessing.Pool() as pool:
        # 不指定 processes，默认是 CPU 核数
        # 打印实际工作进程数
        print(f"  默认进程数 = {pool._processes}")
    print()


# ===== Demo 3：with vs 手动 close/join =====
def demo_with_statement():
    print("=== Demo 3: with 语句 vs 手动管理 ===")

    # 推荐写法
    with multiprocessing.Pool(2) as pool:
        results = pool.map(cpu_task, [1, 2, 3])
    print(f"  with 自动 close + join: {len(results)} 个结果")

    # 手动写法（不推荐）
    pool = multiprocessing.Pool(2)
    results = pool.map(cpu_task, [1, 2, 3])
    pool.close()  # 不再接受新任务
    pool.join()   # 等所有任务完成
    print(f"  手动 close + join: {len(results)} 个结果\\n")


# ===== Demo 4：maxtasksperchild =====
def leaky_task(x: int) -> int:
    """模拟一个会"泄漏内存"的任务"""
    pid = os.getpid()
    # 每次分配 10MB 内存（Python 局部变量会被 GC，但这里模拟泄漏）
    leak = [0] * (10 * 1024 * 1024 // 8)  # 10MB 的 int list
    return f"pid={pid} x={x} leak_size={len(leak)}"


def demo_maxtasksperchild():
    print("=== Demo 4: maxtasksperchild 防内存泄漏 ===")
    print("  每个子进程最多跑 5 个任务，跑完就重启")

    # 不设 maxtasksperchild：进程一直跑
    # 设 maxtasksperchild=5：每跑 5 个任务重启
    with multiprocessing.Pool(processes=2, maxtasksperchild=5) as pool:
        # 提交 12 个任务，会观察到 pid 变化（因为子进程重启了）
        results = pool.map(leaky_task, range(12))

    pids = set()
    for r in results:
        # 提取 pid
        pid = int(r.split("pid=")[1].split(" ")[0])
        pids.add(pid)
        print(f"  {r}")
    print(f"  观察到 {len(pids)} 个不同的 pid（说明子进程被重启过）\\n")


# ===== Demo 5：大量任务批量处理 =====
def demo_bulk():
    print("=== Demo 5: 批量处理大量任务 ===")
    NUM_TASKS = 50

    with multiprocessing.Pool(processes=4) as pool:
        start = time.time()
        results = pool.map(cpu_task, range(NUM_TASKS))
        elapsed = time.time() - start

    print(f"  处理 {NUM_TASKS} 个任务，耗时 {elapsed:.2f}s")
    print(f"  平均每个任务 {elapsed / NUM_TASKS * 1000:.1f}ms\\n")


# ===== 主程序 =====
if __name__ == "__main__":
    print(f"主进程 pid = {os.getpid()}\\n")

    demo_basic_pool()
    demo_default_workers()
    demo_with_statement()
    demo_maxtasksperchild()
    demo_bulk()

    print("=== 总结 ===")
    print("• Pool 维护固定数量的工作进程，避免频繁创建/销毁")
    print("• 默认进程数 = CPU 核数")
    print("• 优先用 with 语句管理 Pool 生命周期")
    print("• maxtasksperchild=N：每 N 个任务重启子进程（防内存泄漏）")
    print("• 适合大量短任务的批量处理")
`,
  },

  // =========================================================
  // 第十五章：apply / apply_async：单个任务的两种提交方式
  // =========================================================
  {
    id: "mp-15",
    group: "进程池与高级特性",
    icon: "📤",
    title: "apply / apply_async：单个任务的两种提交方式",
    content: `## 一、apply：阻塞版本

\`pool.apply(func, args=())\`：提交一个任务，**等它跑完**才返回。结果直接是函数返回值。

\`\`\`python
with Pool(4) as pool:
    result = pool.apply(work, (10,))  # 同步等结果
    print(result)  # 直接拿到 work(10) 的返回值
\`\`\`

**特点**：
- 同步：必须等这个任务结束
- 拿到的是**真实结果**，不是包装对象
- 多个 apply 按顺序执行（虽然有 4 个进程，但 apply 一次只提交一个）

## 二、apply_async：异步版本

\`pool.apply_async(func, args=())\`：提交一个任务，**立刻返回**，不等它跑完。返回的是 \`AsyncResult\` 对象。

\`\`\`python
with Pool(4) as pool:
    async_result = pool.apply_async(work, (10,))
    # 这里可以干别的事
    result = async_result.get()  # 需要时再 get，等结果
    print(result)
\`\`\`

**AsyncResult 的方法**：
- \`.get(timeout=None)\`：拿结果。timeout=None 一直等
- \`.ready()\`：是否已完成
- \`.successful()\`：是否成功完成
- \`.wait(timeout=None)\`：等待完成（不返回结果）

## 三、apply vs apply_async 对比

| 维度 | apply | apply_async |
|------|-------|-------------|
| 是否阻塞 | ✅ 阻塞 | ❌ 不阻塞 |
| 返回 | 函数返回值 | AsyncResult |
| 适用 | 必须同步拿结果 | 想并发提交多个任务 |
| 性能 | 慢（浪费多进程优势） | 快（真正并发） |

## 四、apply_async 的回调

\`apply_async\` 可以传 \`callback\` 和 \`error_callback\`：

\`\`\`python
def my_callback(result):
    print(f"任务完成，结果: {result}")

def my_error_callback(e):
    print(f"任务出错: {e}")

async_result = pool.apply_async(work, args=(10,), callback=my_callback, error_callback=my_error_callback)
\`\`\`

**注意**：callback 在**主进程**里执行（不是子进程）。所以 callback 里不要做太重的事。

## 五、什么时候用哪个？

| 场景 | 用 |
|------|---|
| 任务数 = 1，提交完等结果 | \`apply\` 也行，\`apply_async\` 也行 |
| 任务数 ≥ 2，要并发 | \`apply_async\` |
| 任务数 ≥ 2，要按顺序 | \`map\`（第 16 章） |
| 任务数很多，惰性迭代 | \`imap\`（第 17 章） |

## 六、批量提交技巧

要并发提交多个任务，不要用循环调 \`apply_async\` 然后**立刻 get**（那跟 apply 没区别）：

\`\`\`python
# ❌ 错误：顺序等结果，没并发
for x in tasks:
    result = pool.apply_async(work, (x,)).get()  # 每个 get 都阻塞

# ✅ 正确：先全部提交，再 get
async_results = [pool.apply_async(work, (x,)) for x in tasks]
results = [r.get() for r in async_results]  # 一起等
\`\`\`

## 七、本章 demo

下面 demo 演示：
- apply 同步用法
- apply_async 异步用法
- AsyncResult 的 get/ready/wait
- 回调函数
- 批量提交真正并发
`,
    code: `"""
第十五章 demo：apply / apply_async
演示：
  1. apply 同步用法
  2. apply_async 异步用法
  3. AsyncResult 的方法
  4. 回调函数
  5. 批量提交实现真并发
"""

import multiprocessing
import os
import time


def slow_task(x: int) -> str:
    """一个慢任务，方便观察阻塞行为"""
    pid = os.getpid()
    time.sleep(0.5)  # 模拟耗时
    return f"pid={pid} x={x} done at {time.time():.2f}"


# ===== Demo 1：apply 同步 =====
def demo_apply():
    print("=== Demo 1: apply 同步用法 ===")
    start = time.time()
    with multiprocessing.Pool(processes=4) as pool:
        for i in range(4):
            r = pool.apply(slow_task, (i,))
            print(f"  {r}")
    elapsed = time.time() - start
    print(f"  总耗时: {elapsed:.2f}s（4 个任务 × 0.5s = 2s，串行）\\n")


# ===== Demo 2：apply_async 异步 =====
def demo_apply_async():
    print("=== Demo 2: apply_async 异步用法 ===")
    start = time.time()
    with multiprocessing.Pool(processes=4) as pool:
        asyncs = []
        for i in range(4):
            ar = pool.apply_async(slow_task, (i,))
            asyncs.append(ar)
            print(f"  已提交任务 {i}")

        print("  4 个任务都提交完了，开始收集结果...")
        for i, ar in enumerate(asyncs):
            print(f"  任务 {i} 结果: {ar.get()}")

    elapsed = time.time() - start
    print(f"  总耗时: {elapsed:.2f}s（4 个任务并行 ≈ 0.5s）\\n")


# ===== Demo 3：AsyncResult 的方法 =====
def demo_async_result():
    print("=== Demo 3: AsyncResult 的方法 ===")
    with multiprocessing.Pool(processes=2) as pool:
        ar = pool.apply_async(slow_task, (99,))

        print(f"  提交后: ready={ar.ready()}, successful={ar.successful()}")
        time.sleep(0.2)
        print(f"  0.2s 后: ready={ar.ready()}")

        ar.wait()  # 等完成
        print(f"  wait 后: ready={ar.ready()}, successful={ar.successful()}")
        print(f"  结果: {ar.get()}")
    print()


# ===== Demo 4：回调函数 =====
def my_callback(result):
    print(f"  [callback] 收到结果: {result}")


def my_error_callback(e):
    print(f"  [error_callback] 出错了: {e}")


def good_task(x):
    return f"成功处理 {x}"


def bad_task(x):
    raise ValueError(f"故意出错，参数是 {x}")


def demo_callback():
    print("=== Demo 4: 回调函数 ===")

    with multiprocessing.Pool(2) as pool:
        # 成功任务
        ar1 = pool.apply_async(good_task, (1,), callback=my_callback)
        ar1.get()

        # 失败任务
        ar2 = pool.apply_async(bad_task, (2,), callback=my_callback, error_callback=my_error_callback)
        try:
            ar2.get()
        except Exception as e:
            print(f"  [主进程] get 抛异常: {e}")
    print()


# ===== Demo 5：批量提交实现真并发 =====
def demo_batch_submit():
    print("=== Demo 5: 批量提交真并发 ===")

    tasks = list(range(8))

    # 错误示范：顺序 get
    start = time.time()
    with multiprocessing.Pool(4) as pool:
        results = []
        for x in tasks:
            r = pool.apply_async(slow_task, (x,)).get()  # 顺序 get，浪费时间
            results.append(r)
    wrong_time = time.time() - start
    print(f"  顺序 get: {wrong_time:.2f}s")

    # 正确示范：先全部提交，再 get
    start = time.time()
    with multiprocessing.Pool(4) as pool:
        asyncs = [pool.apply_async(slow_task, (x,)) for x in tasks]
        results = [ar.get() for ar in asyncs]
    right_time = time.time() - start
    print(f"  批量提交: {right_time:.2f}s（快了 {wrong_time / right_time:.1f}x）\\n")


# ===== 主程序 =====
if __name__ == "__main__":
    print(f"主进程 pid = {os.getpid()}\\n")

    demo_apply()
    demo_apply_async()
    demo_async_result()
    demo_callback()
    demo_batch_submit()

    print("=== 总结 ===")
    print("• apply：阻塞，一次只跑一个")
    print("• apply_async：不阻塞，返回 AsyncResult")
    print("• AsyncResult 有 get/ready/wait/successful 等方法")
    print("• callback 在主进程执行，任务完成自动调用")
    print("• 批量提交：先全部 apply_async，再 get（不要循环 apply_async + get）")
`,
  },

  // =========================================================
  // 第十六章：map / map_async：批量任务的并行处理
  // =========================================================
  {
    id: "mp-16",
    group: "进程池与高级特性",
    icon: "🗺️",
    title: "map / map_async：批量任务的并行处理",
    content: `## 一、map：批量任务，按顺序返回

\`pool.map(func, iterable)\`：把 iterable 里每个元素作为参数传给 func，**并行执行**，**按输入顺序**返回结果列表。

\`\`\`python
with Pool(4) as pool:
    results = pool.map(square, [1, 2, 3, 4, 5])
    # results = [1, 4, 9, 16, 25]
    # 即使某个任务先完成，结果也按 [1,2,3,4,5] 的顺序
\`\`\`

**特点**：
- 阻塞：等所有任务完成才返回
- 顺序保留：results[i] 对应 iterable[i]
- chunksize：可以一次分多个任务给一个进程

## 二、map_async：异步批量

\`pool.map_async(func, iterable)\`：异步版 map，**立刻返回** AsyncResult。

\`\`\`python
with Pool(4) as pool:
    ar = pool.map_async(square, [1, 2, 3, 4, 5])
    # 这里可以干别的
    results = ar.get()  # 等所有任务完成
\`\`\`

## 三、starmap：多参数批量

\`pool.starmap(func, iterable)\`：iterable 里每个元素是一个**参数元组**，解包后传给 func。

\`\`\`python
def add(x, y, z):
    return x + y + z

with Pool(4) as pool:
    results = pool.starmap(add, [(1, 2, 3), (4, 5, 6), (7, 8, 9)])
    # results = [6, 15, 24]
\`\`\`

类似的有 \`starmap_async\`。

## 四、chunksize：批处理的性能优化

\`map\` 默认把任务**一个一个**分给进程，进程间通信频繁。\`chunksize\` 控制"一次发多少个任务"：

\`\`\`python
# 默认 chunksize
pool.map(work, range(1000))  # 一个一个分

# 大任务用大 chunksize
pool.map(work, range(1000), chunksize=10)  # 一次分 10 个
\`\`\`

**chunksize 选择**：
- 任务耗时大（秒级）→ 大 chunksize（10-100）
- 任务耗时小（毫秒级）→ 小 chunksize（1-4）
- 任务数远小于进程数 → chunksize=1 也行

## 五、map vs apply_async 批量

| 维度 | map | apply_async 多次 |
|------|-----|-----------------|
| 代码量 | 一行 | 循环 |
| 顺序 | 按输入顺序 | 按完成顺序（手动控制） |
| 阻塞 | 是 | 否（更灵活） |
| chunksize | 支持 | 不支持 |
| 适合 | 简单批量 | 需要单独处理每个任务时 |

## 六、本章 demo

下面 demo 演示：
- map 同步批量
- map_async 异步批量
- starmap 多参数
- chunksize 性能优化
- map_async 配合 callback
`,
    code: `"""
第十六章 demo：map / map_async
演示：
  1. map 同步批量
  2. map_async 异步批量
  3. starmap 多参数
  4. chunksize 性能优化
  5. map_async 配合 callback
"""

import multiprocessing
import os
import time


def square(x: int) -> int:
    """简单的平方"""
    return x * x


def slow_square(x: int) -> int:
    """慢一点的平方，方便观察并行"""
    time.sleep(0.3)
    return x * x


def add_three(x, y, z):
    """starmap 演示用"""
    return x + y + z


# ===== Demo 1：map 同步批量 =====
def demo_map():
    print("=== Demo 1: map 同步批量 ===")
    inputs = [1, 2, 3, 4, 5]
    with multiprocessing.Pool(4) as pool:
        start = time.time()
        results = pool.map(square, inputs)
        elapsed = time.time() - start

    print(f"  输入: {inputs}")
    print(f"  输出: {results}")
    print(f"  耗时: {elapsed:.2f}s\\n")


# ===== Demo 2：map_async 异步批量 =====
def demo_map_async():
    print("=== Demo 2: map_async 异步批量 ===")
    with multiprocessing.Pool(4) as pool:
        ar = pool.map_async(slow_square, [1, 2, 3, 4, 5, 6, 7, 8])
        print("  任务已提交，等 1 秒做点别的...")
        time.sleep(1)
        print("  现在 get 结果...")
        results = ar.get(timeout=10)

    print(f"  结果: {results}\\n")


# ===== Demo 3：starmap 多参数 =====
def demo_starmap():
    print("=== Demo 3: starmap 多参数 ===")
    # iterable 里每个元素是一个参数元组
    args_list = [(1, 2, 3), (4, 5, 6), (7, 8, 9)]

    with multiprocessing.Pool(3) as pool:
        results = pool.starmap(add_three, args_list)

    print(f"  输入: {args_list}")
    print(f"  输出: {results}  # [6, 15, 24]\\n")


# ===== Demo 4：chunksize 性能优化 =====
def quick_task(x: int) -> int:
    """非常快的任务（1ms）"""
    time.sleep(0.001)
    return x * 2


def demo_chunksize():
    print("=== Demo 4: chunksize 性能优化 ===")
    NUM_TASKS = 200

    for chunksize in [1, 10, 50]:
        with multiprocessing.Pool(4) as pool:
            start = time.time()
            results = pool.map(quick_task, range(NUM_TASKS), chunksize=chunksize)
            elapsed = time.time() - start
        print(f"  chunksize={chunksize:3d}: {elapsed:.3f}s")
    print()


# ===== Demo 5：map_async 配合 callback =====
def collect_partial(results_chunk):
    """每完成一批任务，调用一次 callback"""
    print(f"  [callback] 收到 {len(results_chunk)} 个结果: {results_chunk}")


def demo_callback():
    print("=== Demo 5: map_async 配合 callback ===")
    with multiprocessing.Pool(2) as pool:
        ar = pool.map_async(
            slow_square,
            [1, 2, 3, 4, 5, 6],
            callback=collect_partial
        )
        ar.get()
    print()


# ===== 主程序 =====
if __name__ == "__main__":
    print(f"主进程 pid = {os.getpid()}\\n")

    demo_map()
    demo_map_async()
    demo_starmap()
    demo_chunksize()
    demo_callback()

    print("=== 总结 ===")
    print("• map(func, iterable)：批量任务，按输入顺序返回")
    print("• map_async：异步版 map，返回 AsyncResult")
    print("• starmap(func, iterable)：每个元素是参数元组")
    print("• chunksize：一次发给进程的任务数，影响性能")
    print("• map_async 配合 callback：每批完成时调用")
`,
  },

  // =========================================================
  // 第十七章：imap / imap_unordered：惰性迭代与乱序
  // =========================================================
  {
    id: "mp-17",
    group: "进程池与高级特性",
    icon: "🔄",
    title: "imap / imap_unordered：惰性迭代与乱序",
    content: `## 一、imap：惰性版的 map

\`pool.imap(func, iterable)\`：返回一个**迭代器**，每完成一个任务就 yield 一个结果。**不是等所有任务完成**。

\`\`\`python
with Pool(4) as pool:
    for result in pool.imap(work, range(100)):
        print(result)  # 一边处理一边输出
        # 不会等 100 个都跑完才开始
\`\`\`

**和 map 的区别**：
- \`map\`：阻塞，攒齐所有结果才返回
- \`imap\`：惰性迭代，边跑边返回

**好处**：
- 任务多时省内存（不会一次性把所有结果存起来）
- 第一个结果最快返回（适合"先到先处理"）

## 二、imap_unordered：不保证顺序

\`pool.imap_unordered(func, iterable)\`：也是惰性迭代，但**哪个任务先完成就先 yield 哪个**。

\`\`\`python
with Pool(4) as pool:
    for result in pool.imap_unordered(slow_work, [1, 2, 3, 4]):
        print(result)  # 完成顺序不确定
\`\`\`

**什么时候用**：
- 任务之间**没有依赖**
- 顺序不重要
- 想尽快处理每个完成的结果

## 三、imap 的 chunksize

\`imap\` 也有 chunksize 参数，控制一次发给进程多少任务：

\`\`\`python
pool.imap(work, range(1000), chunksize=10)
\`\`\`

imap 默认 chunksize 比 map 大（imap 内部有优化）。

## 四、imap vs imap_unordered 性能

理论上 \`imap_unordered\` 略快，因为它不需要维护"结果队列的顺序"。但实际差异不大。

## 五、3 个 map 系列的对比

| 方法 | 阻塞 | 顺序 | 内存 |
|------|------|------|------|
| \`map\` | ✅ 阻塞 | 按输入顺序 | 一次性占 |
| \`imap\` | ❌ 迭代 | 按输入顺序 | 迭代器，懒 |
| \`imap_unordered\` | ❌ 迭代 | 不保证 | 迭代器，懒 |

## 六、什么时候用 imap？

| 场景 | 推荐 |
|------|------|
| 任务数很多（万级以上） | ✅ imap / imap_unordered |
| 任务结果要逐个处理 | ✅ imap / imap_unordered |
| 任务结果需要按输入顺序 | imap |
| 任务结果顺序无所谓 | imap_unordered（略快） |
| 任务数少 | map 也行 |

## 七、本章 demo

下面 demo 演示：
- map vs imap 的差异（什么时候开始 yield）
- imap 保留输入顺序
- imap_unordered 不保证顺序
- 大量任务时 imap 内存优势
- chunksize 对 imap 的影响
`,
    code: `"""
第十七章 demo：imap / imap_unordered
演示：
  1. map vs imap 的差异
  2. imap 保留输入顺序
  3. imap_unordered 不保证顺序
  4. 大量任务 imap 内存优势
  5. chunksize 对 imap 的影响
"""

import multiprocessing
import os
import time
import random


def variable_task(x: int) -> str:
    """每个任务耗时不一样，方便观察输出顺序"""
    sleep_time = random.uniform(0.1, 0.5)
    time.sleep(sleep_time)
    return f"x={x} (slept {sleep_time:.2f}s) at {time.time():.2f}"


def memory_intensive_task(x: int) -> str:
    """模拟一个会返回较大结果的任务"""
    time.sleep(0.001)
    return f"result-{x}" * 10  # 返回较长字符串


# ===== Demo 1：map vs imap =====
def demo_map_vs_imap():
    print("=== Demo 1: map vs imap ===")

    # map：阻塞，等所有完成
    print("  -- map 模式 --")
    start = time.time()
    with multiprocessing.Pool(4) as pool:
        results = pool.map(variable_task, [1, 2, 3, 4])
    for r in results:
        print(f"    {r}")
    print(f"    map 总耗时: {time.time() - start:.2f}s\\n")

    # imap：惰性迭代
    print("  -- imap 模式 --")
    start = time.time()
    with multiprocessing.Pool(4) as pool:
        for r in pool.imap(variable_task, [1, 2, 3, 4]):
            print(f"    {r}")
    print(f"    imap 总耗时: {time.time() - start:.2f}s\\n")


# ===== Demo 2：imap 保留顺序 =====
def demo_imap_ordered():
    print("=== Demo 2: imap 保留输入顺序 ===")
    with multiprocessing.Pool(4) as pool:
        for r in pool.imap(variable_task, [1, 2, 3, 4, 5, 6, 7, 8]):
            # 输出的 x 应该和输入顺序一致
            print(f"    {r}")
    print("  （x 的顺序与输入一致）\\n")


# ===== Demo 3：imap_unordered 不保证顺序 =====
def demo_imap_unordered():
    print("=== Demo 3: imap_unordered 不保证顺序 ===")
    with multiprocessing.Pool(4) as pool:
        for r in pool.imap_unordered(variable_task, [1, 2, 3, 4, 5, 6, 7, 8]):
            print(f"    {r}")
    print("  （x 的顺序与输入不一致，看谁先完成）\\n")


# ===== Demo 4：imap 的内存优势 =====
def demo_memory_efficient():
    print("=== Demo 4: imap 内存优势（流式处理） ===")
    NUM_TASKS = 1000
    processed = 0

    with multiprocessing.Pool(4) as pool:
        for result in pool.imap(memory_intensive_task, range(NUM_TASKS)):
            # 流式处理每个结果，不需要一次性存下所有
            processed += 1
            if processed % 200 == 0:
                print(f"  已处理 {processed}/{NUM_TASKS}")

    print(f"  ✅ 处理完成，共 {processed} 个\\n")


# ===== Demo 5：chunksize 影响 =====
def demo_chunksize():
    print("=== Demo 5: imap 的 chunksize ===")

    def fast_task(x):
        time.sleep(0.001)
        return x

    NUM = 500
    for cs in [1, 10, 50]:
        with multiprocessing.Pool(4) as pool:
            start = time.time()
            count = sum(1 for _ in pool.imap(fast_task, range(NUM), chunksize=cs))
            elapsed = time.time() - start
        print(f"  chunksize={cs:3d}: {elapsed:.3f}s (处理 {count} 个)")
    print()


# ===== 主程序 =====
if __name__ == "__main__":
    print(f"主进程 pid = {os.getpid()}\\n")

    demo_map_vs_imap()
    demo_imap_ordered()
    demo_imap_unordered()
    demo_memory_efficient()
    demo_chunksize()

    print("=== 总结 ===")
    print("• imap：惰性迭代，按输入顺序 yield")
    print("• imap_unordered：惰性迭代，谁先完成谁先 yield")
    print("• 任务数大时 imap 更省内存（不用一次性存所有结果）")
    print("• chunksize 影响性能：短任务用大 chunksize")
    print("• 没有顺序需求时 imap_unordered 略快")
`,
  },

  // =========================================================
  // 第十八章：回调函数、错误处理与超时控制
  // =========================================================
  {
    id: "mp-18",
    group: "进程池与高级特性",
    icon: "🛠️",
    title: "回调函数、错误处理与超时控制",
    content: `## 一、回调函数（Callback）

\`apply_async\` / \`map_async\` / \`imap_unordered\` 都可以传 \`callback\`：

\`\`\`python
def my_cb(result):
    print(f"任务完成: {result}")

pool.apply_async(work, (x,), callback=my_cb)
\`\`\`

**回调的特点**：
- 在**主进程**里执行
- 任务完成自动调用（不需要 .get()）
- 多个任务完成时按完成顺序调用 callback

### 错误回调（error_callback）

\`\`\`python
def my_err_cb(e):
    print(f"任务失败: {e}")

pool.apply_async(work, (x,), error_callback=my_err_cb)
\`\`\`

### 回调的 4 个常见用途

1. **进度报告**：每个任务完成打印进度
2. **结果持久化**：每个任务完成立即写文件/数据库
3. **触发后续任务**：完成一个任务就提交下一个
4. **限流控制**：根据完成速度动态调整

## 二、错误处理

### 错误 1：任务里抛异常

子进程抛异常时：
- \`apply\`：异常**会传到主进程**
- \`apply_async\` + \`.get()\`：异常**会传到主进程**
- \`apply_async\` + callback：异常**不会**触发 callback，会触发 \`error_callback\`

### 错误 2：怎么在主进程拿到异常

\`\`\`python
ar = pool.apply_async(work, (x,))
try:
    result = ar.get()
except Exception as e:
    print(f"子进程报错: {e}")
\`\`\`

### 错误 3：worker 函数本身有 bug

\`\`\`python
def buggy_task(x):
    if x == 5:
        raise ValueError(f"我不喜欢 {x}")
    return x * 2

# 主进程能正常拿到异常
with Pool(4) as pool:
    ar = pool.apply_async(buggy_task, (5,))
    try:
        ar.get()
    except ValueError as e:
        print(f"捕获到: {e}")
\`\`\`

### 错误 4：一个任务失败不影响其他任务

Pool 默认行为：**一个任务失败不影响其他任务**。失败的任务把异常存在 AsyncResult 里，调 \`.get()\` 才抛。

## 三、超时控制

### \`get(timeout=N)\`：等结果限时

\`\`\`python
ar = pool.apply_async(slow_task, (x,))
try:
    result = ar.get(timeout=5)
except multiprocessing.TimeoutError:
    print("5 秒内没跑完")
\`\`\`

**注意**：超时后子进程**还在跑**（Python 3.3+ get 不再 cancel 子进程）。子进程会继续跑完，结果被丢弃。

### \`wait(timeout=N)\`：等待完成限时

\`\`\`python
ar = pool.apply_async(slow_task, (x,))
ar.wait(timeout=5)
if not ar.ready():
    print("还没跑完")
\`\`\`

### 主动终止超时任务

想真正停止超时任务：

\`\`\`python
import multiprocessing

def long_task():
    while True:
        print("工作中...")
        time.sleep(1)

if __name__ == "__main__":
    with multiprocessing.Pool(1) as pool:
        ar = pool.apply_async(long_task)
        ar.wait(timeout=3)
        if not ar.ready():
            print("超时了，强制终止")
            pool.terminate()  # 杀掉所有工作进程
            pool.join()
\`\`\`

\`terminate()\` 比较暴力，会杀掉整个 Pool。一般用 close() 等现有任务完成。

## 四、AsyncResult 状态

| 方法 | 含义 |
|------|------|
| \`.ready()\` | 是否已完成（成功或失败） |
| \`.successful()\` | 是否成功完成（无异常） |
| \`.get(timeout)\` | 拿结果，失败抛异常 |
| \`.wait(timeout)\` | 等待完成（不抛异常） |

## 五、本章 demo

下面 demo 演示：
- 回调函数基础
- 错误回调
- 进度报告回调
- 超时控制
- 错误传播（子进程异常传到主进程）
`,
    code: `"""
第十八章 demo：回调、错误处理、超时
演示：
  1. 回调函数基础
  2. error_callback 错误回调
  3. 进度报告回调
  4. 错误传播（get 抛异常）
  5. 超时控制
  6. 主动终止超时任务
"""

import multiprocessing
import os
import time
import random


# ===== Demo 1：基本回调 =====
def work_with_cb(x: int) -> int:
    time.sleep(0.3)
    return x * 2


def demo_callback_basic():
    print("=== Demo 1: 回调函数基础 ===")
    results = []

    def collect(result):
        results.append(result)
        print(f"  [callback] 收到: {result}")

    with multiprocessing.Pool(4) as pool:
        asyncs = [pool.apply_async(work_with_cb, (i,), callback=collect) for i in range(4)]
        for ar in asyncs:
            ar.wait()
    print(f"  收集到 {len(results)} 个结果\\n")


# ===== Demo 2：错误回调 =====
def sometimes_fails(x: int) -> int:
    time.sleep(0.2)
    if x == 3:
        raise ValueError(f"任务 {x} 故意失败")
    return x * 10


def demo_error_callback():
    print("=== Demo 2: 错误回调 ===")

    def on_success(r):
        print(f"  [success] {r}")

    def on_error(e):
        print(f"  [error] {type(e).__name__}: {e}")

    with multiprocessing.Pool(2) as pool:
        asyncs = [
            pool.apply_async(sometimes_fails, (i,), callback=on_success, error_callback=on_error)
            for i in range(5)
        ]
        for ar in asyncs:
            try:
                ar.get()
            except Exception as e:
                pass  # 已经由 error_callback 处理
    print()


# ===== Demo 3：进度报告 =====
def slow_task(x: int) -> int:
    time.sleep(random.uniform(0.1, 0.3))
    return x * x


def demo_progress():
    print("=== Demo 3: 进度报告回调 ===")
    total = 10
    done = [0]  # 用 list 包装以便闭包修改

    def on_one_done(result):
        done[0] += 1
        print(f"  [进度] {done[0]}/{total} - 收到: {result}")

    with multiprocessing.Pool(3) as pool:
        for i in range(total):
            pool.apply_async(slow_task, (i,), callback=on_one_done)
        pool.close()
        pool.join()
    print()


# ===== Demo 4：错误传播 =====
def bad_task(x: int) -> int:
    raise ValueError(f"任务 {x} 失败")


def demo_error_propagation():
    print("=== Demo 4: 错误传播（get 抛异常） ===")
    with multiprocessing.Pool(2) as pool:
        ar = pool.apply_async(bad_task, (1,))
        try:
            ar.get()
        except ValueError as e:
            print(f"  主进程捕获到: {e}")
        except Exception as e:
            print(f"  其他异常: {type(e).__name__}: {e}")
    print()


# ===== Demo 5：超时控制 =====
def slow_for_long():
    time.sleep(10)
    return "done"


def demo_timeout():
    print("=== Demo 5: 超时控制 ===")
    with multiprocessing.Pool(1) as pool:
        ar = pool.apply_async(slow_for_long)
        print("  任务提交，最多等 2 秒...")
        try:
            result = ar.get(timeout=2)
            print(f"  结果: {result}")
        except multiprocessing.TimeoutError:
            print("  ⏱️  超时了！")
            print("  ⚠️  子进程还在跑（get 不会自动取消）")
            # 这里不能优雅地只取消一个任务，只能 terminate 整个 pool
            pool.terminate()
            pool.join()
            print("  已经 terminate 整个 Pool")
    print()


# ===== Demo 6：异常处理 + 健壮的任务函数 =====
def robust_task(x: int) -> dict:
    """健壮的任务：内部捕获异常，返回错误信息而不是抛"""
    try:
        if x == 0:
            raise ZeroDivisionError("不能除以 0")
        result = 100 / x
        return {"success": True, "x": x, "result": result}
    except Exception as e:
        return {"success": False, "x": x, "error": str(e)}


def demo_robust():
    print("=== Demo 6: 健壮任务函数（不抛异常）===")
    with multiprocessing.Pool(3) as pool:
        results = pool.map(robust_task, [1, 2, 0, 4, 0, 5])
    for r in results:
        if r["success"]:
            print(f"  ✅ {r['x']} / 1 = {r['result']}")
        else:
            print(f"  ❌ {r['x']} 失败: {r['error']}")
    print()


# ===== 主程序 =====
if __name__ == "__main__":
    print(f"主进程 pid = {os.getpid()}\\n")

    demo_callback_basic()
    demo_error_callback()
    demo_progress()
    demo_error_propagation()
    demo_timeout()
    demo_robust()

    print("=== 总结 ===")
    print("• callback：任务完成时主进程里调用")
    print("• error_callback：任务异常时调用")
    print("• get() 会把子进程异常传到主进程")
    print("• get(timeout=N) 超时抛 TimeoutError，但不取消子进程")
    print("• 真正取消超时任务要 terminate() 整个 Pool")
    print("• 健壮做法：任务内部捕获异常，返回错误结果")
`,
  },
];
