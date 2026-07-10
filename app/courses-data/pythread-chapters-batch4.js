// =============================================================
// Python 线程与进程教程 - batch4
// 章节 29-38：性能选型 + subprocess + 综合实战 + 最佳实践
// =============================================================

export const chapters = [
  // -----------------------------------------------------------
  // 第 29 章：CPU 密集型 vs IO 密集型
  // -----------------------------------------------------------
  {
    id: "pythread-29",
    group: "性能与选型",
    icon: "⚖️",
    title: "CPU 密集型 vs IO 密集型任务",
    content: `## 任务分两类：CPU 密集 vs IO 密集

判断任务类型是选线程还是进程的第一步。

### CPU 密集型（CPU-bound）
任务**主要是计算**，CPU 一直在算，很少等待。GIL 对这类任务影响最大。

- 数学计算、加密解密、压缩解压
- 图像/视频处理（非 C 扩展部分）
- 大量数据排序、搜索
- 机器学习推理（纯 Python 部分）

特征：CPU 占用率高，几乎没有等待。

### IO 密集型（IO-bound）
任务**主要是等待**——等网络、等磁盘、等用户输入。CPU 大部分时间闲着。GIL 对这类任务几乎无影响。

- 网络请求（HTTP、爬虫）
- 文件读写
- 数据库查询
- 等待用户输入

特征：CPU 占用率低，大量时间在 sleep/等待。

## 如何判断？

看任务运行时：
- **CPU 占用接近 100%** → CPU 密集
- **CPU 占用很低但程序在等** → IO 密集

代码层面：
- 大量 \`for\` 循环、数学运算 → CPU 密集
- 大量 \`requests.get\`、\`open()\`、\`time.sleep\` → IO 密集

## 选型决策表

| 任务类型 | 推荐 | 原因 |
|---------|------|------|
| CPU 密集 | **多进程** | 绕开 GIL，真正多核并行 |
| IO 密集 | **多线程** | 等待时释放 GIL，线程开销小 |
| 超高并发 IO | **asyncio** | 单线程协程，无切换开销 |
| 混合型 | 拆分：IO 用线程，计算用进程 | 各取所长 |

## 为什么 IO 密集用线程就够？

IO 操作（\`time.sleep\`、\`requests.get\`、\`file.read\`）会**主动释放 GIL**。所以多线程做 IO 时：
- 线程A 等网络 → 释放 GIL
- 线程B 拿到 GIL 执行
- 线程A 网络回来 → 排队等 GIL

效果和"真并行"差不多，且线程比进程轻量得多。所以 IO 密集用线程**性价比最高**。

## 混合型任务的处理

真实任务常是混合的：先读文件（IO），再处理数据（CPU），再写回（IO）。

策略：
\`\`\`python
from concurrent.futures import ThreadPoolExecutor
# IO 部分用线程池
with ThreadPoolExecutor(8) as io_pool:
    data = list(io_pool.map(read_file, files))

# CPU 部分用进程池
with ProcessPoolExecutor(4) as cpu_pool:
    results = list(cpu_pool.map(process, data))

# IO 部分再用线程池写回
with ThreadPoolExecutor(8) as io_pool:
    list(io_pool.map(write_file, results))
\`\`\`

## demo：用代码区分两类任务

下面 demo 用同一段"工作量"，分别用纯计算和 sleep 模拟两种任务，观察多线程/多进程的表现差异。`,
    code: `# 第二十九章 demo：CPU 密集 vs IO 密集
# 本 demo 对比"纯计算"和"纯等待"两种任务在串行/多线程/多进程下的耗时差异，
# 直观展示 GIL 对 CPU 密集任务的限制，以及 IO 密集任务用线程即可并发的原理。
import threading                    # 线程模块：创建和管理线程
import multiprocessing as mp        # 进程模块：创建子进程，绕开 GIL 实现真正并行
import time                         # 时间模块：time.time() 获取时间戳用于计时

# 显式指定 fork 启动方式：子进程继承父进程内存空间，启动快、不重新导入主模块。
# macOS 自 Python 3.8 起默认 spawn（会重新导入主模块，stdin 运行时易失败），
# 所以这里显式切回 fork 以保证 demo 在各种运行方式下都能正常工作。
ctx = mp.get_context("fork")

# ============================================================
# 任务1：CPU 密集（纯计算）
# ============================================================
def cpu_work(n):
    """CPU 密集：累加 n 次——纯计算，全程占用 CPU，不等待任何 IO"""
    total = 0                        # 初始化累加器
    for i in range(n):               # 循环 n 次，每次都是纯 CPU 运算
        total += i                   # 累加：GIL 限制最典型的操作（同一时刻只有一个线程能执行）
    return total

N_CPU = 3_000_000                    # 每个 worker 累加 300 万次（工作量足够大才能看出耗时差异）
print("=" * 55)
print("任务1：CPU 密集（每个累加 300万次）")
print("=" * 55)

# 串行：在主线程里依次执行两次，总耗时 ≈ 2 倍单次耗时
start = time.time()                  # 记录开始时间戳
cpu_work(N_CPU); cpu_work(N_CPU)     # 串行调用两次：第一次跑完才开始第二次
serial = time.time() - start         # 计算串行总耗时

# 多线程（GIL 限制，≈串行）：两个线程同时跑，但 GIL 只让一个线程执行 Python 字节码
start = time.time()
# 创建 2 个线程：target 指定要跑的函数，args 传参数（必须是元组，所以尾部逗号不能少）
ts = [threading.Thread(target=cpu_work, args=(N_CPU,)) for _ in range(2)]
for t in ts: t.start()               # 启动两个线程（理论上同时开始）
for t in ts: t.join()                # 主线程阻塞，等两个子线程都跑完再继续
thread_t = time.time() - start       # 多线程总耗时（因 GIL 限制，约等于串行）

# 多进程（真正并行）：两个进程各有独立 GIL，能真正同时跑在不同 CPU 核上
start = time.time()
with ctx.Pool(2) as p:               # 创建含 2 个 worker 的进程池
    p.map(cpu_work, [N_CPU, N_CPU])  # 把两个任务分发给两个进程并行执行
proc_t = time.time() - start         # 多进程总耗时（≈ 串行的一半，真正并行）

print(f"  串行:   {serial:.3f}s")
print(f"  多线程: {thread_t:.3f}s  (受 GIL 限制，没变快)")
print(f"  多进程: {proc_t:.3f}s  (真正并行，更快)")
print(f"  >>> CPU 密集任务：多进程明显胜出\\n")

# ============================================================
# 任务2：IO 密集（sleep 模拟等待）
# ============================================================
def io_work(secs):
    """IO 密集：sleep 模拟网络/文件等待——CPU 空闲，只是在等"""
    time.sleep(secs)                 # sleep 期间会主动释放 GIL，其他线程可以执行
    return secs                      # 返回等待的秒数

SECS = 1                             # 每个 worker 等待 1 秒
print("=" * 55)
print("任务2：IO 密集（每个 sleep 1秒模拟等待）")
print("=" * 55)

# 串行：两次 sleep 依次执行，总耗时 ≈ 2 秒
start = time.time()
io_work(SECS); io_work(SECS)         # 串行等待：第一次等完才开始第二次
serial = time.time() - start

# 多线程：sleep 释放 GIL，两个线程可以"同时"等待
start = time.time()
ts = [threading.Thread(target=io_work, args=(SECS,)) for _ in range(2)]
for t in ts: t.start()               # 启动两个线程
for t in ts: t.join()                # 等两个线程都完成
thread_t = time.time() - start       # 总耗时 ≈ 1 秒（并发等待，不是 2 秒）

# 多进程：也能并发，但创建进程开销比线程大
start = time.time()
with ctx.Pool(2) as p:               # 2 个进程的进程池
    p.map(io_work, [SECS, SECS])     # 两个进程同时 sleep
proc_t = time.time() - start         # 总耗时 ≈ 1 秒，但进程创建开销更大

print(f"  串行:   {serial:.3f}s")
print(f"  多线程: {thread_t:.3f}s  (等待时释放GIL，并发)")
print(f"  多进程: {proc_t:.3f}s  (也能并发，但进程开销大)")
print(f"  >>> IO 密集任务：多线程就够，多进程浪费\\n")

print("=" * 55)
print("选型结论")
print("=" * 55)
print("• CPU 密集 → 用多进程（绕开 GIL 真并行）")
print("• IO 密集  → 用多线程（等待释放 GIL，开销小）")
print("• 混合型   → IO 用线程池，计算用进程池，各取所长")`,
  },

  // -----------------------------------------------------------
  // 第 30 章：性能实测对比
  // -----------------------------------------------------------
  {
    id: "pythread-30",
    group: "性能与选型",
    icon: "📊",
    title: "多线程 vs 多进程性能实测对比",
    content: `## 实测才是硬道理

前面几章反复说"CPU 密集用进程，IO 密集用线程"，这一章我们**用数据说话**：跑一组对照实验，量化不同方案的性能差异。

## 实验设计

固定总工作量，改变并发方式和并发数，测耗时：

1. **任务A（CPU 密集）**：每个 worker 累加 N 次
2. **任务B（IO 密集）**：每个 worker sleep S 秒

对每种任务测：串行、2线程、2进程、4线程、4进程 的耗时。

## 预期结果

| 任务 | 串行 | 2线程 | 2进程 | 4线程 | 4进程 |
|------|------|-------|-------|-------|-------|
| CPU 密集 | T | ≈T（GIL） | ≈T/2 | ≈T（GIL） | ≈T/4 |
| IO 密集 | T | ≈T/2 | ≈T/2 | ≈T/4 | ≈T/4 |

关键观察：
- CPU 密集：线程数再多也没用（GIL），进程数 = 加速比（受核数限制）
- IO 密集：线程和进程效果接近，但线程开销小

## 加速比（Speedup）

\`加速比 = 串行耗时 / 并发耗时\`。理想情况下 N 个 worker 加速比 = N，实际受开销和资源限制会打折扣。

## 为什么进程加速比到不了核数？

1. **进程创建/通信开销**：数据要在进程间复制
2. **CPU 核数限制**：8核机器，8进程已经是上限
3. **内存带宽瓶颈**：多核同时访问内存会争抢
4. **系统调度**：OS 还要调度其他进程

## demo：实测对比

下面 demo 跑完整对照实验，输出表格化结果。`,
    code: `# 第三十章 demo：多线程 vs 多进程 性能实测
# 本 demo 跑一组对照实验：固定总工作量，改变并发方式和并发数，
# 量化对比串行/2线程/4线程/2进程/4进程 的耗时和加速比。
import multiprocessing as mp        # 进程模块
import time                         # 计时
from concurrent.futures import ThreadPoolExecutor  # 线程池：控制并发线程数

# 显式用 fork 上下文：避免 macOS 默认 spawn 在 stdin 运行时重新导入主模块失败
ctx = mp.get_context("fork")

def cpu_work(n):
    """CPU 密集任务：累加 n 次"""
    total = 0                        # 初始化累加器
    for i in range(n):               # 纯 CPU 循环
        total += i                   # 每次累加都占用 CPU
    return total

def io_work(secs):
    """IO 密集任务：sleep 模拟等待"""
    time.sleep(secs)                 # sleep 期间释放 GIL，CPU 空闲
    return secs

def measure_serial(func, args_list):
    """串行执行所有任务，返回总耗时（作为加速比的 baseline）"""
    start = time.time()              # 记录开始时间
    for a in args_list:              # 逐个执行，一个跑完才跑下一个
        func(a)
    return time.time() - start       # 返回总耗时

def measure_threads(func, args_list, n):
    """用 n 个线程并发处理 args_list，返回总耗时
    用线程池控制并发数为 n（而非每个任务开一个线程），
    这样 '2线程' 才真的是 2 个 worker 在跑，便于公平对比"""
    start = time.time()
    with ThreadPoolExecutor(n) as ex:  # 创建 n 个线程的线程池
        list(ex.map(func, args_list))   # map 自动把任务分配给线程池中的线程
    return time.time() - start       # with 结束时等所有任务完成，返回总耗时

def measure_processes(func, args_list, n):
    """n 个进程并发，返回耗时"""
    start = time.time()
    with ctx.Pool(n) as p:           # 创建 n 个进程的进程池
        p.map(func, args_list)       # map 自动把任务分配给进程池中的进程
    return time.time() - start       # 返回总耗时

def run_benchmark(name, func, single_arg, counts):
    """跑一组对照实验：固定 counts 个任务的工作负载，改变并发方式和并发数
    参数：
      name       测试名称（用于打印标题）
      func       任务函数（cpu_work 或 io_work）
      single_arg 单个任务的参数（累加次数 或 sleep 秒数）
      counts     任务总数（也是工作负载大小）
    """
    print(f"\\n{'='*55}")
    print(f"基准测试：{name}")
    print(f"{'='*55}")
    print(f"  {'方式':<12} {'耗时':>8}  {'加速比':>6}")
    print(f"  {'-'*32}")
    # 固定 counts 个任务作为工作负载，串行耗时作为 baseline（加速比 = 1.0x）
    args = [single_arg] * counts     # 生成 counts 个相同的参数（如 4 个 300万）
    serial_t = measure_serial(func, args)  # 串行跑完所有任务，作为基准
    serial_label = f"串行({counts}个)"
    print(f"  {serial_label:<12} {serial_t:>7.3f}s  {'1.00x':>6}")
    # 2 线程处理同样的 counts 个任务，加速比 = 串行耗时 / 并发耗时
    t2 = measure_threads(func, args, 2)
    print(f"  {'2线程':<12} {t2:>7.3f}s  {serial_t/t2:>5.2f}x")
    # 4 线程处理 counts 个任务（线程数 = 任务数时理论上能达到最大并发）
    t4 = measure_threads(func, args, 4)
    print(f"  {'4线程':<12} {t4:>7.3f}s  {serial_t/t4:>5.2f}x")
    # 2 进程处理 counts 个任务
    p2 = measure_processes(func, args, 2)
    print(f"  {'2进程':<12} {p2:>7.3f}s  {serial_t/p2:>5.2f}x")
    # 4 进程处理 counts 个任务
    p4 = measure_processes(func, args, 4)
    print(f"  {'4进程':<12} {p4:>7.3f}s  {serial_t/p4:>5.2f}x")

# CPU 密集：累加 300万次（4 个任务，对比不同并发方式的加速效果）
run_benchmark("CPU 密集（累加300万）", cpu_work, 3_000_000, 4)

# IO 密集：sleep 0.5秒（4 个任务，对比不同并发方式的加速效果）
run_benchmark("IO 密集（sleep 0.5s）", io_work, 0.5, 4)

print(f"\\n{'='*55}")
print("分析")
print(f"{'='*55}")
print("• CPU 密集：线程加速比≈1（GIL），进程加速比接近 worker 数")
print("• IO 密集：线程和进程都能接近线性加速")
print("• 进程数上限受 CPU 核数限制，超过会因切换开销变慢")
print("• 实测结果会因机器配置、系统负载略有波动")`,
  },

  // -----------------------------------------------------------
  // 第 31 章：concurrent.futures 统一接口
  // -----------------------------------------------------------
  {
    id: "pythread-31",
    group: "性能与选型",
    icon: "🔌",
    title: "concurrent.futures 统一接口",
    content: `## 统一接口的价值

\`concurrent.futures\` 模块提供 \`ThreadPoolExecutor\` 和 \`ProcessPoolExecutor\`，两者 **API 完全一致**。这意味着：

> **同一份代码，只需改类名就能在多线程/多进程间切换**

\`\`\`python
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

# 根据任务类型选 Executor
def run(tasks, use_process=False):
    Executor = ProcessPoolExecutor if use_process else ThreadPoolExecutor
    with Executor(max_workers=4) as ex:
        return list(ex.map(worker, tasks))
\`\`\`

> ⚠️ **关于 ProcessPoolExecutor 的启动方式**：它默认用 spawn 启动子进程，子进程会重新导入主模块。在受限环境（比如本教程通过 \`python3 -\` 从 stdin 执行代码）下 spawn 会失败。解决办法是显式指定 fork 上下文：
> \`\`\`python
> import multiprocessing as mp
> from functools import partial
> # 用 partial 包装出一个强制使用 fork 的进程池工厂
> ForkProcessPool = partial(ProcessPoolExecutor, mp_context=mp.get_context("fork"))
> with ForkProcessPool(max_workers=4) as ex:
>     ...
> \`\`\`
> 本教程所有进程池 demo 都采用这个写法。日常脚本（直接 \`python xxx.py\`）用默认 spawn 即可，记得把启动代码放进 \`if __name__ == "__main__":\`。

## 模块结构

\`\`\`
concurrent.futures
├── ThreadPoolExecutor      # 线程池
├── ProcessPoolExecutor     # 进程池
├── Future                  # 未来结果对象
├── as_completed(futures)   # 谁先完成谁先yield
├── wait(futures)           # 等待，返回 (done, not_done)
└── FIRST_COMPLETED / FIRST_EXCEPTION / ALL_COMPLETED  # wait 的策略
\`\`\`

## Executor 的生命周期

\`\`\`python
from concurrent.futures import ThreadPoolExecutor
# 推荐：用 with 自动管理
with ThreadPoolExecutor(4) as ex:
    ex.submit(task)

# 等价于手动管理
ex = ThreadPoolExecutor(4)
try:
    ex.submit(task)
finally:
    ex.shutdown(wait=True)    # 等所有任务完成
\`\`\`

\`with\` 结束时会调 \`shutdown(wait=True)\`，主线程会等所有提交的任务完成。

## Future：统一的"未来结果"

\`submit\` 返回 \`Future\`——一个"未来会有结果"的对象。无论线程池还是进程池，Future 的 API 一致：

| 方法 | 作用 |
|------|------|
| \`f.result(timeout)\` | 阻塞取结果 |
| \`f.exception()\` | 取异常（无异常返回 None） |
| \`f.done()\` | 是否完成 |
| \`f.cancel()\` | 尝试取消（未开始才能取消） |
| \`f.add_done_callback(fn)\` | 完成回调 |

## 一个实用的"自动选型"函数

\`\`\`python
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

def parallel_map(func, items, task_type="io", workers=None):
    """自动选择线程池或进程池的并行 map"""
    if task_type == "cpu":
        Executor = ProcessPoolExecutor
        workers = workers or os.cpu_count()
    else:
        Executor = ThreadPoolExecutor
        workers = workers or min(32, os.cpu_count() * 2)
    with Executor(max_workers=workers) as ex:
        return list(ex.map(func, items))
\`\`\`

## demo：统一接口实战

下面 demo 用同一个 Executor 抽象，跑 CPU 和 IO 两种任务。`,
    code: `# 第三十一章 demo：concurrent.futures 统一接口
# 本 demo 展示 ThreadPoolExecutor 和 ProcessPoolExecutor 的 API 一致性，
# 用同一个 parallel_map 函数自动选型，以及 Future 对象的各种方法。
import os                           # os.cpu_count() 获取 CPU 核数
import time                         # 计时
import multiprocessing as mp        # 进程模块
from functools import partial       # partial：预绑定部分参数，生成新的可调用对象
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed

# ProcessPoolExecutor 默认用 spawn 启动子进程：子进程会重新 import 主模块。
# 但本教程通过 python3 - 从 stdin 读代码运行，主模块不是磁盘文件，spawn 无法重新导入 → 报错。
# 解决办法：显式指定 fork 上下文（子进程直接继承父进程内存，无需重新导入主模块）。
# 用 functools.partial 把 mp_context 参数预绑死，之后调用 ForkProcessPool(max_workers=4)
# 等价于 ProcessPoolExecutor(max_workers=4, mp_context=mp.get_context("fork"))。
# 日常脚本（python xxx.py）用默认 spawn 即可，记得把启动代码放进 if __name__ == "__main__":。
ForkProcessPool = partial(ProcessPoolExecutor, mp_context=mp.get_context("fork"))

def cpu_task(n):
    """CPU 密集"""
    total = 0                        # 初始化累加器
    for i in range(n):               # 纯 CPU 循环
        total += i                   # 累加
    return total

def io_task(secs):
    """IO 密集"""
    time.sleep(secs)                 # sleep 期间释放 GIL，模拟 IO 等待
    return secs

# ============================================================
# 工具函数：自动选型
# ============================================================
def parallel_map(func, items, task_type="io", workers=None):
    """根据任务类型自动选择线程池或进程池"""
    if task_type == "cpu":
        Executor = ForkProcessPool            # 进程池用 fork 上下文版
        workers = workers or os.cpu_count()   # CPU 密集：进程数 = CPU 核数
        print(f"  → 选择进程池 (workers={workers})")
    else:
        Executor = ThreadPoolExecutor         # IO 密集：用线程池
        workers = workers or min(8, (os.cpu_count() or 4) * 2)  # 线程数可以多于核数
        print(f"  → 选择线程池 (workers={workers})")
    with Executor(max_workers=workers) as ex:  # 创建池，max_workers 控制并发数
        return list(ex.map(func, items))       # map 并发执行，list 收集结果

# ============================================================
# 实验1：CPU 任务用进程池
# ============================================================
print("=" * 55)
print("实验1：CPU 任务 → 自动选进程池")
print("=" * 55)
items = [2_000_000, 2_000_000, 2_000_000, 2_000_000]  # 4 个 CPU 任务，每个累加 200 万
start = time.time()
results = parallel_map(cpu_task, items, task_type="cpu")  # task_type="cpu" 触发进程池选型
print(f"  耗时 {time.time()-start:.3f}s，结果 {results}\\n")

# ============================================================
# 实验2：IO 任务用线程池
# ============================================================
print("=" * 55)
print("实验2：IO 任务 → 自动选线程池")
print("=" * 55)
items = [0.5, 0.5, 0.5, 0.5]           # 4 个 IO 任务，每个 sleep 0.5 秒
start = time.time()
results = parallel_map(io_task, items, task_type="io")  # task_type="io" 触发线程池选型
print(f"  耗时 {time.time()-start:.3f}s，结果 {results}\\n")

# ============================================================
# 实验3：同一份代码切换线程/进程
# ============================================================
print("=" * 55)
print("实验3：同代码，只改 Executor 类名")
print("=" * 55)
def run_with(Executor, name):
    """用同一段代码跑不同的 Executor：切换类名即可换并发模型"""
    start = time.time()
    with Executor(max_workers=4) as ex:
        # submit 提交 4 个任务，返回 4 个 Future（"未来结果"对象，非阻塞）
        futures = [ex.submit(cpu_task, 2_000_000) for _ in range(4)]
        # f.result() 阻塞取每个任务的结果（任务未完成时会等待）
        results = [f.result() for f in futures]
    print(f"  {name}: {time.time()-start:.3f}s")
    return results

run_with(ThreadPoolExecutor, "线程池")    # CPU 任务用线程池：受 GIL 限制，≈串行
run_with(ForkProcessPool, "进程池")       # CPU 任务用进程池：真正并行，更快
print()

# ============================================================
# 实验4：Future 的各种方法
# ============================================================
print("=" * 55)
print("实验4：Future 对象的方法")
print("=" * 55)
with ThreadPoolExecutor(2) as ex:
    f = ex.submit(io_task, 0.3)        # 提交一个 sleep 0.3 秒的任务
    print(f"  提交后 done={f.done()}")  # 刚提交，还没完成 → False
    time.sleep(0.1)                    # 等 0.1 秒
    print(f"  0.1s后 done={f.done()}") # 可能还没完成（任务要 0.3 秒）
    result = f.result()                # 阻塞等待结果（最多再等 0.2 秒）
    print(f"  结果={result}, done={f.done()}")  # 已完成 → True
    print(f"  异常={f.exception()}")   # 无异常 → None

# 带异常的 Future
def boom():
    raise ValueError("爆炸")           # 故意抛异常
with ThreadPoolExecutor(1) as ex:
    f = ex.submit(boom)                # 提交会抛异常的任务
    try:
        f.result()                     # result() 会重新抛出任务中的异常
    except ValueError as e:
        print(f"  捕获异常: {e}")
    print(f"  exception(): {f.exception()}")  # exception() 返回异常对象（不抛出）

print("\\n要点：")
print("• ThreadPoolExecutor 和 ProcessPoolExecutor API 完全一致")
print("• 切换线程/进程只需改类名，便于根据任务类型选择")
print("• Future 统一抽象：result/exception/done/cancel/add_done_callback")
print("• 推荐 with 写法，自动 shutdown 等所有任务完成")`,
  },

  // -----------------------------------------------------------
  // 第 32 章：as_completed / wait / Future 详解
  // -----------------------------------------------------------
  {
    id: "pythread-32",
    group: "性能与选型",
    icon: "🎯",
    title: "as_completed / wait / Future 进阶",
    content: `## 三种等待结果的策略

提交一批任务后，如何拿结果？有三种策略：

### 策略1：map（按提交顺序）
\`\`\`python
results = list(ex.map(func, items))   # 第1个完成的不一定先返回
\`\`\`
结果顺序 = 输入顺序。简单，但慢任务会"卡住"后续快任务的结果。

### 策略2：as_completed（谁先完成谁先返回）
\`\`\`python
from concurrent.futures import as_completed
for f in as_completed(futures):
    print(f.result())   # 哪个先完成先处理
\`\`\`
适合"结果逐个处理"，不依赖顺序。

### 策略3：wait（阻塞等待，返回两组）
\`\`\`python
done, not_done = wait(futures, timeout=10, return_when=ALL_COMPLETED)
\`\`\`
更底层，可控制等待策略和超时。

## wait 的 return_when 策略

| 常量 | 含义 |
|------|------|
| \`FIRST_COMPLETED\` | 有一个完成就返回 |
| \`FIRST_EXCEPTION\` | 有一个抛异常就返回（或全部完成） |
| \`ALL_COMPLETED\`（默认） | 全部完成才返回 |

\`\`\`python
from concurrent.futures import wait, FIRST_COMPLETED

futures = [ex.submit(task, i) for i in range(10)]
# 只要有一个完成就继续
done, not_done = wait(futures, return_when=FIRST_COMPLETED)
print(f"完成 {len(done)} 个，未完成 {len(not_done)} 个")
\`\`\`

## as_completed 的 timeout

\`\`\`python
from concurrent.futures import as_completed
for f in as_completed(futures, timeout=5):
    print(f.result())
# 超时未完成的会抛 TimeoutError
\`\`\`

## 实用模式：超时取消未完成任务

\`\`\`python
futures = [ex.submit(task, i) for i in range(100)]
done, not_done = wait(futures, timeout=3, return_when=ALL_COMPLETED)
for f in not_done:
    f.cancel()   # 取消还没开始的任务
\`\`\`

## Future.add_done_callback 回调

\`\`\`python
def on_done(future):
    try:
        print(f"完成: {future.result()}")
    except Exception as e:
        print(f"失败: {e}")

f = ex.submit(task, 1)
f.add_done_callback(on_done)   # 完成时在主线程调用
\`\`\`

回调在**哪个线程**执行？
- \`ThreadPoolExecutor\`：在某个 worker 线程
- \`ProcessPoolExecutor\`：在主进程

## demo：三种策略对比

下面 demo 用不同耗时的任务，演示三种策略的结果返回顺序差异。`,
    code: `# 第三十二章 demo：as_completed / wait / Future 进阶
# 本 demo 用不同耗时的任务，演示三种拿结果的策略：
#   map（按顺序）、as_completed（谁先完成谁先返回）、wait（阻塞等待+策略控制）
import time
from concurrent.futures import (
    ThreadPoolExecutor,
    as_completed, wait, FIRST_COMPLETED, ALL_COMPLETED
)

# 不同耗时的任务（输入越大耗时越长）：模拟真实场景中各任务执行时间不同
def variable_task(x):
    secs = x * 0.15                   # x 越大，sleep 越久（模拟工作量不同）
    time.sleep(secs)                  # IO 密集：sleep 期间释放 GIL
    return f"任务{x}(耗时{secs:.2f}s)"  # 返回描述字符串，方便观察返回顺序

# ============================================================
# 实验1：map 按顺序返回
# ============================================================
print("=" * 55)
print("策略1：map —— 按输入顺序返回")
print("=" * 55)
with ThreadPoolExecutor(4) as ex:
    # 输入顺序：3,1,4,2（3最慢，1最快）
    # map 的特点：结果顺序 = 输顺序，即使后面的任务先完成也要等前面的
    results = list(ex.map(variable_task, [3, 1, 4, 2]))
    for r in results:
        print(f"  {r}")
print("  → 结果顺序 = 输入顺序，慢任务会卡住后面\\n")

# ============================================================
# 实验2：as_completed 谁先完成谁先返回
# ============================================================
print("=" * 55)
print("策略2：as_completed —— 谁先完成谁先返回")
print("=" * 55)
with ThreadPoolExecutor(4) as ex:
    # 用字典把 future 映射到输入值，方便后续查是哪个任务
    futures = {ex.submit(variable_task, x): x for x in [3, 1, 4, 2]}
    # as_completed：哪个 future 先完成就先 yield，不按提交顺序
    for f in as_completed(futures):
        print(f"  ✓ {f.result()}")     # f.result() 取结果（已完成，不会阻塞）
print("  → 最快的（任务1）先返回\\n")

# ============================================================
# 实验3：wait + FIRST_COMPLETED
# ============================================================
print("=" * 55)
print("策略3：wait(FIRST_COMPLETED) —— 有一个完成就继续")
print("=" * 55)
with ThreadPoolExecutor(4) as ex:
    futures = [ex.submit(variable_task, x) for x in [3, 1, 4, 2]]
    # 有一个完成就返回：返回 (done集合, not_done集合)
    done, not_done = wait(futures, return_when=FIRST_COMPLETED)
    print(f"  已完成 {len(done)} 个，未完成 {len(not_done)} 个")
    for f in done:
        print(f"  ✓ {f.result()}")     # 打印已完成任务的结果
    # 继续等剩下的
    print("  继续等剩余的...")
    done2, not_done2 = wait(not_done, return_when=ALL_COMPLETED)  # 等全部完成
    for f in done2:
        print(f"  ✓ {f.result()}")     # 打印剩余任务的结果
print()

# ============================================================
# 实验4：wait + timeout 超时取消
# ============================================================
print("=" * 55)
print("策略4：wait(timeout) 超时后取消未完成任务")
print("=" * 55)
with ThreadPoolExecutor(4) as ex:
    futures = [ex.submit(variable_task, x) for x in [1, 2, 3, 4]]
    # 最多等0.5秒：超时后返回当时已完成的和未完成的两组
    done, not_done = wait(futures, timeout=0.5, return_when=ALL_COMPLETED)
    print(f"  0.5秒内完成: {len(done)} 个")
    for f in done:
        print(f"    ✓ {f.result()}")
    print(f"  未完成: {len(not_done)} 个，尝试取消")
    cancelled = 0
    for f in not_done:
        # cancel() 只能取消"还没开始执行"的任务，已开始或已完成的返回 False
        if f.cancel():
            cancelled += 1
    print(f"  成功取消: {cancelled} 个（未开始的才能取消）")
print()

# ============================================================
# 实验5：add_done_callback 回调
# ============================================================
print("=" * 55)
print("策略5：add_done_callback 完成回调")
print("=" * 55)
def on_success(future):
    """回调函数：任务完成时自动调用（在 worker 线程中执行）"""
    try:
        print(f"  [回调] 成功: {future.result()}")  # 取结果，成功则打印
    except Exception as e:
        print(f"  [回调] 失败: {e}")                # 有异常则打印失败

with ThreadPoolExecutor(2) as ex:
    for x in [1, 2, 3]:
        f = ex.submit(variable_task, x)  # 提交任务
        f.add_done_callback(on_success)  # 注册回调：任务完成时自动调 on_success
    # with 结束会等所有任务完成（含回调执行完毕）

print("\\n要点：")
print("• map 按顺序返回，as_completed 谁先完成谁先返回")
print("• wait(return_when) 控制等待策略，timeout 控制超时")
print("• 未开始的任务可 cancel()，已开始/完成的不能取消")
print("• add_done_callback 在任务完成时触发回调")`,
  },

  // -----------------------------------------------------------
  // 第 33 章：subprocess 入门与 run
  // -----------------------------------------------------------
  {
    id: "pythread-33",
    group: "subprocess 子进程",
    icon: "🐚",
    title: "subprocess 入门与 run",
    content: `## subprocess 是什么？

\`subprocess\` 模块用来**在 Python 里启动外部程序**（系统命令、其他可执行文件）。它和 \`multiprocessing\` 不同：

| 模块 | 启动的是 | 通信方式 |
|------|---------|---------|
| \`multiprocessing\` | Python 子进程（跑 Python 代码） | Queue/Pipe/共享内存 |
| \`subprocess\` | 任意外部程序（ls、git、python、sh...） | 标准输入输出管道 |

典型用途：
- 调用系统命令（\`ls\`、\`git\`、\`ffmpeg\`）
- 调用其他语言写的程序
- 执行 shell 脚本
- 本教程的代码运行 API 就是用 subprocess 调 python3！

## subprocess.run（推荐）

\`run\` 是最常用的高层接口，阻塞执行命令并返回 \`CompletedProcess\`：

\`\`\`python
import subprocess

result = subprocess.run(["ls", "-l"], capture_output=True, text=True)
print(result.stdout)         # 标准输出
print(result.returncode)     # 退出码（0=成功）
\`\`\`

## run 的常用参数

| 参数 | 作用 |
|------|------|
| \`args\` | 命令列表，如 \`["ls", "-l"]\`，或字符串（配合 shell=True） |
| \`capture_output=True\` | 捕获 stdout/stderr（等价于 stdout=PIPE, stderr=PIPE） |
| \`text=True\` | 输出按文本返回（默认是 bytes） |
| \`check=True\` | 返回码非0时抛 \`CalledProcessError\` |
| \`timeout=10\` | 超时秒数，超时抛 \`TimeoutExpired\` |
| \`input="..."\` | 传给子进程 stdin 的内容 |
| \`shell=True\` | 通过 shell 执行（⚠️ 有注入风险，慎用） |
| \`cwd="/path"\` | 子进程工作目录 |
| \`env={...}\` | 子进程环境变量 |

## run 取代了旧的 API

\`run\` 是 Python 3.5+ 引入的高层接口，**取代了**早期的几个函数，新代码统一用 \`run\` 即可（旧函数底层也是调 Popen，仍可用）：

| 旧 API | 等价 run 写法 |
|--------|--------------|
| \`subprocess.call(args)\` | \`run(args).returncode\` |
| \`subprocess.check_call(args)\` | \`run(args, check=True)\` |
| \`subprocess.check_output(args)\` | \`run(args, check=True, capture_output=True, text=True).stdout\` |
| \`subprocess.getoutput(cmd)\` | \`run(cmd, shell=True, stdout=PIPE, stderr=STDOUT, text=True).stdout\`（注意 getoutput 会合并 stderr 到 stdout） |

## 列表 vs shell=True

**推荐用列表**（安全）：
\`\`\`python
subprocess.run(["ls", "-l", "/tmp"])    # 参数分开，无注入风险
\`\`\`

**shell=True 慎用**（有注入风险）：
\`\`\`python
import subprocess
# 危险！如果 filename 来自用户输入，可能注入命令
subprocess.run(f"ls {filename}", shell=True)
# 用户输入 "a; rm -rf /" → 执行了 rm -rf /！
\`\`\`

只有需要 shell 特性（管道 \`|\`、通配 \`*\`、变量 \`$VAR\`）时才用 \`shell=True\`，且**绝不拼用户输入**。

## 捕获输出

\`\`\`python
import subprocess
# capture_output + text：最简单
r = subprocess.run(["echo", "hello"], capture_output=True, text=True)
print(r.stdout)   # "hello\\n"

# 分别拿 stdout 和 stderr
r = subprocess.run(["python3", "-c", "import sys; print('out'); print('err', file=sys.stderr)"],
                   capture_output=True, text=True)
print(r.stdout)   # out
print(r.stderr)   # err
\`\`\`

还有两个常用常量：
- \`stdout=subprocess.DEVNULL\`：丢弃输出（不想看）
- \`stderr=subprocess.STDOUT\`：把 stderr 合并进 stdout（统一捕获）

\`\`\`python
import subprocess
# 丢弃 stdout，把 stderr 合并进 stdout
r = subprocess.run(["python3", "-c", "import sys; print('err', file=sys.stderr)"],
                   stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT, text=True)
print(r.stdout)   # err（被合并过来了）
\`\`\`

## check=True 处理失败

\`\`\`python
import subprocess
try:
    subprocess.run(["false"], check=True)   # false 命令返回1
except subprocess.CalledProcessError as e:
    print(f"命令失败，返回码 {e.returncode}")
\`\`\`

## demo：subprocess.run 各种用法

下面 demo 用 run 调用各种命令（本环境用 echo、python3 等通用命令）。`,
    code: `# 第三十三章 demo：subprocess.run 入门
# 本 demo 演示 subprocess.run 的各种用法：
#   捕获输出、调用 python3、check 检测失败、input 传数据、timeout 超时、shell=True
import subprocess                      # subprocess 模块：在 Python 中启动外部程序

# ============================================================
# 实验1：基本调用，捕获输出
# ============================================================
print("=" * 55)
print("实验1：调用 echo，捕获输出")
print("=" * 55)
# args 用列表：["命令", "参数1", "参数2"]
# capture_output=True 捕获 stdout/stderr
# text=True 输出为文本（默认是 bytes）
r = subprocess.run(["echo", "Hello from subprocess"], capture_output=True, text=True)
print(f"  stdout: {r.stdout!r}")
print(f"  stderr: {r.stderr!r}")
print(f"  返回码: {r.returncode}")
print()

# ============================================================
# 实验2：调用 python3 执行代码
# ============================================================
print("=" * 55)
print("实验2：调用 python3 执行一段代码")
print("=" * 55)
# python3 -c "代码" ：直接执行一段 Python 代码字符串
code = "print(1+1); import sys; print('to stderr', file=sys.stderr)"
r = subprocess.run(["python3", "-c", code], capture_output=True, text=True)
print(f"  stdout: {r.stdout.strip()}")   # stdout：print(1+1) 的输出 "2"
print(f"  stderr: {r.stderr.strip()}")   # stderr：print('to stderr') 的输出
print(f"  返回码: {r.returncode}")        # 0 = 成功
print()

# ============================================================
# 实验3：check=True 检测失败
# ============================================================
print("=" * 55)
print("实验3：check=True 检测命令失败")
print("=" * 55)
# python3 -c "import sys; sys.exit(3)" 会返回码 3（非0 = 失败）
# check=True：返回码非0时自动抛 CalledProcessError
try:
    subprocess.run(["python3", "-c", "import sys; sys.exit(3)"],
                   check=True, capture_output=True, text=True)
    print("  命令成功")                  # 返回码0才会走到这里
except subprocess.CalledProcessError as e:
    print(f"  命令失败！返回码={e.returncode}")  # e.returncode 拿到退出码
    print(f"  stdout={e.stdout!r}, stderr={e.stderr!r}")  # 异常对象也带输出
print()

# ============================================================
# 实验4：用 input 给子进程传数据
# ============================================================
print("=" * 55)
print("实验4：用 input 传数据给子进程 stdin")
print("=" * 55)
# 子进程从 stdin 读，反转后输出
# input 参数：把字符串写入子进程的 stdin（子进程用 sys.stdin.read() 读取）
r = subprocess.run(
    ["python3", "-c", "import sys; data=sys.stdin.read(); print(data[::-1])"],
    input="Hello subprocess",          # 这段文本会传给子进程的 stdin
    capture_output=True, text=True
)
print(f"  输入: 'Hello subprocess'")
print(f"  反转: {r.stdout.strip()}")    # data[::-1] 把字符串反转
print()

# ============================================================
# 实验5：timeout 超时
# ============================================================
print("=" * 55)
print("实验5：timeout 超时控制")
print("=" * 55)
try:
    # sleep 5 秒的命令，但只给 1 秒超时 → 1 秒后强制终止子进程
    subprocess.run(["python3", "-c", "import time; time.sleep(5)"],
                   timeout=1, capture_output=True)
except subprocess.TimeoutExpired as e:
    print(f"  超时！命令被终止（超时 {e.timeout} 秒）")  # e.timeout 是设置的超时值
print()

# ============================================================
# 实验6：shell=True（演示，慎用）
# ============================================================
print("=" * 55)
print("实验6：shell=True 执行带管道的命令")
print("=" * 55)
# 只有需要 shell 特性（管道 |、通配 *）时才用 shell=True
# 这里用了管道 "echo hello | tr a-z A-Z"：echo 输出小写，tr 转大写
r = subprocess.run("echo hello | tr a-z A-Z", shell=True,
                   capture_output=True, text=True)
print(f"  管道处理结果: {r.stdout.strip()}")  # "HELLO"
print("  注意：shell=True 有注入风险，绝不拼用户输入！")

print("\\n要点：")
print("• subprocess.run 执行外部命令，返回 CompletedProcess")
print("• capture_output=True 捕获输出，text=True 返回文本")
print("• check=True 失败抛异常，timeout=N 超时控制")
print("• 推荐用列表传参（安全），shell=True 慎用（有注入风险）")`,
  },

  // -----------------------------------------------------------
  // 第 34 章：subprocess Popen
  // -----------------------------------------------------------
  {
    id: "pythread-34",
    group: "subprocess 子进程",
    icon: "🧩",
    title: "subprocess Popen 与管道通信",
    content: `## Popen vs run

\`run\` 是"一次性"的——启动命令、等它结束、拿结果。但有些场景需要**更细粒度的控制**：
- 边运行边读输出（实时日志）
- 和子进程持续交互（发一条读一条）
- 同时管理多个子进程

这时用 \`Popen\`——它是 \`run\` 的底层，提供**非阻塞、可交互**的接口。

\`\`\`python
from subprocess import Popen, PIPE

p = Popen(["python3", "-u", "-c", "for i in range(5): print(i)"],
          stdout=PIPE, stderr=PIPE, text=True)
# 此时子进程在跑，主进程可以做别的
\`\`\`

## Popen 的核心方法

| 方法 | 作用 |
|------|------|
| \`p.communicate(input=None, timeout=None)\` | 一次性发输入并等结束，返回 (stdout, stderr) |
| \`p.stdout.readline()\` | 读一行（阻塞） |
| \`p.stdout.read()\` | 读全部（阻塞到 EOF） |
| \`p.stdin.write(s)\` | 写入 stdin |
| \`p.poll()\` | 查退出码（未结束返回 None） |
| \`p.wait(timeout)\` | 等待结束 |
| \`p.terminate()\` | 发 SIGTERM |
| \`p.kill()\` | 发 SIGKILL |
| \`p.pid\` | 进程 ID |

> 💡 \`Popen\` 也支持 \`with\` 语句（\`with Popen(...) as p:\`），退出时会自动关闭管道并回收资源，推荐使用。
>
> **平台差异**：\`terminate()\` / \`kill()\` 在 Unix 上分别发 \`SIGTERM\` / \`SIGKILL\`；在 Windows 上两者都调用 \`TerminateProcess\`（都是强制结束，没有"礼貌终止"的区别）。跨平台代码别依赖 SIGTERM 的"可被捕获"语义。

## 实时读取输出

\`\`\`python
from subprocess import PIPE
from subprocess import Popen
p = Popen(["python3", "-u", "-c", "import time; [print(i, flush=True) or time.sleep(0.2) for i in range(5)]"],
          stdout=PIPE, text=True)
for line in p.stdout:          # 逐行读，有就返回
    print("收到:", line.strip())
p.wait()
\`\`\`

> ⚠️ 子进程输出要 **flush**（\`print(x, flush=True)\`）或加 \`-u\` 用无缓冲模式，否则输出被缓冲，主进程读不到。

## communicate：安全的交互

\`communicate\` 一次性发完输入、读完输出，**避免死锁**：

\`\`\`python
from subprocess import PIPE
from subprocess import Popen
p = Popen(["python3", "-c", "print(input()[::-1])"], stdin=PIPE, stdout=PIPE, text=True)
out, err = p.communicate(input="hello")
print(out)   # olleh
\`\`\`

> 为什么不用 \`p.stdin.write\` + \`p.stdout.read\`？因为如果同时写大量数据到 stdin 并从 stdout 读，**管道缓冲区满会死锁**。\`communicate\` 内部用线程/选择机制避免这个问题。

## 与子进程持续交互

\`\`\`python
from subprocess import PIPE
from subprocess import Popen
p = Popen(["python3", "-u", "-i"], stdin=PIPE, stdout=PIPE, text=True)
p.stdin.write("print(1+1)\\n")
p.stdin.flush()                # 写完要 flush
print(p.stdout.readline())     # 读响应
\`\`\`

这种交互容易死锁，**复杂场景推荐用 pexpect 库**。

## demo：Popen 实时读输出

下面 demo 用 Popen 实时读取子进程的逐行输出，演示"边跑边看"。`,
    code: `# 第三十四章 demo：Popen 实时通信
# 本 demo 演示 Popen 的非阻塞、可交互能力：
#   communicate 一次性交互、实时逐行读输出、poll 非阻塞检查、terminate 终止、模拟在线运行
import subprocess
from subprocess import Popen, PIPE    # Popen：底层子进程控制；PIPE：创建管道
import time

# ============================================================
# 实验1：Popen 基本用法 + communicate
# ============================================================
print("=" * 55)
print("实验1：Popen + communicate 一次性交互")
print("=" * 55)
# 子进程：读一行，反转后输出
# stdin=PIPE：创建 stdin 管道，主进程可以写数据给子进程
# stdout=PIPE：创建 stdout 管道，主进程可以读子进程的输出
p = Popen(["python3", "-c", "print(input()[::-1])"],
          stdin=PIPE, stdout=PIPE, stderr=PIPE, text=True)
# communicate 一次性发输入并等结束，返回 (stdout, stderr)
# 内部用线程/选择机制避免管道缓冲区满导致死锁
out, err = p.communicate(input="Hello Popen")  # 把 "Hello Popen" 写入子进程 stdin
print(f"  输入: 'Hello Popen'")
print(f"  反转: {out.strip()}")          # input()[::-1] 反转字符串 → "nepoP olleH"
print(f"  返回码: {p.returncode}")        # 0 = 正常结束
print()

# ============================================================
# 实验2：实时逐行读输出
# ============================================================
print("=" * 55)
print("实验2：实时读取子进程逐行输出")
print("=" * 55)
# -u 启用无缓冲模式：Python 默认按块缓冲 stdout，管道场景下数据会积在缓冲区，
# 主进程 for line 读不到实时输出。-u 等价于 PYTHONUNBUFFERED=1，强制行缓冲。
# 代码里同时加了 flush=True，双保险确保每行 print 立刻可见。
code = "import time\\nfor i in range(5):\\n    print(f'行 {i}', flush=True)\\n    time.sleep(0.2)"
p = Popen(["python3", "-u", "-c", code], stdout=PIPE, text=True)
# for line 逐行读：迭代 p.stdout 会在有数据时立刻 yield 一行，未到 EOF 时阻塞等待下一行
for line in p.stdout:
    print(f"  [收到] {line.strip()}  ({time.strftime('%H:%M:%S')})")
p.wait()
print(f"  子进程结束，返回码={p.returncode}")
print()

# ============================================================
# 实验3：poll 检查状态（非阻塞）
# ============================================================
print("=" * 55)
print("实验3：poll 非阻塞检查子进程状态")
print("=" * 55)
p = Popen(["python3", "-c", "import time; time.sleep(0.8)"], stdout=PIPE)
for i in range(5):
    time.sleep(0.2)                  # 每 0.2 秒检查一次
    code = p.poll()       # poll()：未结束返回 None，结束返回退出码（非阻塞）
    status = "运行中" if code is None else f"已结束(码={code})"
    print(f"  {(i+1)*0.2:.1f}s: {status}")
    if code is not None:             # 已结束，跳出循环
        break
if p.poll() is None:                 # 如果循环结束进程还在跑，等它结束
    p.wait()
print()

# ============================================================
# 实验4：terminate / kill 终止子进程
# ============================================================
print("=" * 55)
print("实验4：terminate 终止子进程")
print("=" * 55)
p = Popen(["python3", "-c", "import time; print('开始'); time.sleep(10); print('结束')"],
          stdout=PIPE, text=True)
time.sleep(0.3)                      # 等子进程启动
print(f"  poll={p.poll()} (None=运行中)")  # 此时子进程在 sleep，poll 返回 None
p.terminate()             # 发 SIGTERM，礼貌终止（子进程可以捕获处理）
p.wait(timeout=2)                   # 等待子进程真正退出（最多2秒）
print(f"  terminate 后 poll={p.returncode} (负数=被信号终止)")  # 负数表示被信号杀死
print()

# ============================================================
# 实验5：模拟"本教程的代码运行 API"原理
# ============================================================
print("=" * 55)
print("实验5：模拟在线运行 Python 代码（本教程 API 的原理）")
print("=" * 55)
user_code = "print('我在子进程里运行！'); print(6 * 7)"
# 这正是 app/api/run-py 的核心：python3 - 从 stdin 读代码
# python3 - 表示从标准输入读取代码并执行（而非从文件）
p = Popen(["python3", "-"], stdin=PIPE, stdout=PIPE, stderr=PIPE, text=True)
out, err = p.communicate(input=user_code, timeout=5)  # 传入代码，5秒超时
print(f"  执行的代码: {user_code}")
print(f"  stdout: {out.strip()}")      # 代码的输出
print(f"  stderr: {err.strip()}")      # 错误输出（正常为空）
print(f"  返回码: {p.returncode}")      # 0 = 执行成功

print("\\n要点：")
print("• Popen 提供非阻塞、可交互的子进程控制")
print("• communicate() 一次性交互，避免管道死锁")
print("• 逐行读要 flush=True 或 -u 无缓冲")
print("• poll() 非阻塞查状态，terminate()/kill() 终止")
print("• 本教程的 run-py API 就是用 Popen(['python3','-']) 实现")`,
  },

  // -----------------------------------------------------------
  // 第 35 章：实战——多线程并发下载器
  // -----------------------------------------------------------
  {
    id: "pythread-35",
    group: "综合实战",
    icon: "⬇️",
    title: "实战：多线程并发下载器（模拟）",
    content: `## 实战目标

模拟一个"多线程并发下载器"——同时下载多个 URL，对比串行下载的提速效果。由于在线环境无法真实联网，用 \`time.sleep\` 模拟网络延迟，但**代码结构和真实下载器完全一致**——把 sleep 换成 \`requests.get\` 就是真实可用版本。

## 真实下载器长什么样

\`\`\`python
import requests
from concurrent.futures import ThreadPoolExecutor

def download(url):
    r = requests.get(url, timeout=10)
    return len(r.content)

urls = ["http://example.com/1", "http://example.com/2", ...]
with ThreadPoolExecutor(8) as ex:
    sizes = list(ex.map(download, urls))
\`\`\`

核心就这几行。本实战在其基础上增加：进度显示、超时处理、失败重试、统计。

## 关键设计点

1. **用线程池而非进程池**：下载是 IO 密集（等网络），线程就够
2. **限并发数**：太多并发会被服务器封 IP，用 \`max_workers\` 控制
3. **异常处理**：单个下载失败不影响其他
4. **进度反馈**：用 \`as_completed\` 边完成边汇报
5. **超时控制**：每个任务设超时，避免卡死

## 完整代码结构

\`\`\`
download(url)
  ├─ 模拟网络延迟（sleep）
  ├─ 模拟随机失败（小概率抛异常）
  └─ 返回下载大小

download_all(urls, workers)
  ├─ ThreadPoolExecutor(workers)
  ├─ submit 所有任务
  ├─ as_completed 边完成边汇报
  └─ 统计成功/失败

主流程
  ├─ 生成一批 URL
  ├─ 串行下载（对比基准）
  └─ 并发下载（对比提速）
\`\`\`

## demo：并发下载器

下面 demo 实现完整的并发下载器，对比串行 vs 并发的耗时。`,
    code: `# 第三十五章 demo：多线程并发下载器（模拟）
# 本 demo 模拟多线程并发下载：用 sleep 模拟网络延迟，随机失败模拟网络错误，
# 对比串行 vs 4线程并发的耗时差异。代码结构和真实下载器完全一致。
import time
import random
from concurrent.futures import ThreadPoolExecutor, as_completed

def download(url):
    """模拟下载一个 URL（真实版把 sleep 换成 requests.get）
    返回：(url, size, secs) 三元组
    可能抛异常：模拟网络失败
    """
    # 模拟下载耗时：0.3~0.8 秒（真实版这里是 requests.get(url).content）
    secs = random.uniform(0.3, 0.8)
    time.sleep(secs)                 # IO 密集：sleep 期间释放 GIL，其他线程可以并发
    # 模拟 10% 概率失败（真实版这里可能是网络超时、服务器错误等）
    if random.random() < 0.1:
        raise ConnectionError(f"{url} 下载失败")
    # 模拟下载内容大小（真实版这里是 len(r.content)）
    size = int(secs * 1000)
    return (url, size, secs)         # 返回三元组：URL、大小、耗时

def download_all(urls, workers):
    """并发下载所有 URL，返回 (成功列表, 失败列表)"""
    successes = []                    # 成功下载的结果列表
    failures = []                     # 失败的 URL 列表
    completed = 0                     # 已完成计数（用于进度显示）
    total = len(urls)                # 总任务数
    start = time.time()              # 记录开始时间

    with ThreadPoolExecutor(max_workers=workers) as ex:
        # 提交所有任务：submit 返回 Future，用字典映射 Future→url 方便后续查找
        future_to_url = {ex.submit(download, url): url for url in urls}
        # 谁先完成谁先处理：as_completed 按完成顺序 yield Future
        for future in as_completed(future_to_url):
            completed += 1
            url = future_to_url[future]  # 通过 Future 反查对应的 URL
            try:
                result = future.result()  # 取结果（如果任务抛了异常，这里会重新抛出）
                successes.append(result)
                print(f"  ✓ [{completed}/{total}] {result[0]} "
                      f"({result[2]:.2f}s, {result[1]}B)")
            except Exception as e:
                failures.append(url)     # 记录失败的 URL
                print(f"  ✗ [{completed}/{total}] {e}")

    elapsed = time.time() - start     # 总耗时
    return successes, failures, elapsed

# ============================================================
# 主流程
# ============================================================
random.seed(42)   # 固定随机种子，输出可复现
urls = [f"http://example.com/file_{i}.zip" for i in range(12)]  # 生成 12 个模拟 URL

print("=" * 55)
print("并发下载器（模拟）")
print("=" * 55)
print(f"  共 {len(urls)} 个 URL\\n")

# 串行下载（对比基准）：一个下完才下下一个，总耗时 = 所有下载时间之和
print("-" * 40)
print("方式1：串行下载")
print("-" * 40)
start = time.time()
serial_ok = 0                       # 成功计数
serial_fail = 0                     # 失败计数
for url in urls:
    try:
        download(url)               # 串行调用，一个接一个
        serial_ok += 1
    except Exception:               # 单个失败不影响后续
        serial_fail += 1
serial_time = time.time() - start
print(f"  成功 {serial_ok}，失败 {serial_fail}，耗时 {serial_time:.2f}s\\n")

# 并发下载
# 重置随机种子：注意多线程下 random 调用顺序由线程调度决定，无法完全复现串行的失败模式，
# 因此并发与串行的成功/失败数可能略有差异——这是线程非确定性的正常表现，不影响性能对比。
random.seed(42)
print("-" * 40)
print("方式2：4 线程并发下载")
print("-" * 40)
ok, fail, t = download_all(urls, workers=4)  # 4 线程并发下载
total_bytes = sum(r[1] for r in ok)          # 统计总下载字节数
print(f"\\n  成功 {len(ok)}，失败 {len(fail)}，耗时 {t:.2f}s")
print(f"  总下载 {total_bytes}B\\n")

print("=" * 55)
print("对比结论")
print("=" * 55)
print(f"  串行:   {serial_time:.2f}s")
print(f"  4线程:  {t:.2f}s")
print(f"  提速:   {serial_time/t:.1f}x")
print("\\n要点：")
print("• 下载是 IO 密集，用线程池（ThreadPoolExecutor）")
print("• as_completed 边完成边汇报，体验好")
print("• 单个任务失败用 try/except 隔离，不影响其他")
print("• max_workers 控制并发数，避免被封 IP")`,
  },

  // -----------------------------------------------------------
  // 第 36 章：实战——多进程批量数据处理
  // -----------------------------------------------------------
  {
    id: "pythread-36",
    group: "综合实战",
    icon: "🔢",
    title: "实战：多进程批量数据处理",
    content: `## 实战目标

模拟"批量数据处理"——对一批数据做 CPU 密集计算（如统计、加密、转换），用多进程并行加速。这是数据分析、图像处理、机器学习预处理等场景的典型模式。

## 场景设定

假设有 8 个大数据块，每块要对 200 万个数字做"平方和"统计。这是纯 CPU 计算，**必须用多进程**才能多核加速。

## 关键设计点

1. **用进程池**：CPU 密集，多线程无意义（GIL）
2. **数据分块**：把大数据切成块，每块一个任务，并行处理
3. **进程数 = CPU 核数**：多了因切换开销变慢
4. **结果汇总**：各进程返回部分结果，主进程合并
5. **chunksize**：任务多时批量分发减少通信开销

## 数据分块策略

\`\`\`
大数据 [1,2,3,...,1000万]
   │ 切成 N 块
   ▼
块1 ─┐
块2 ─┼─→ 进程池(N个worker) ─→ [结果1, 结果2, ..., 结果N] ─→ 汇总
块N ─┘
\`\`\`

每块独立处理，无共享状态，无需加锁——这是最理想的并行模式。

## 真实场景映射

- **数据分析**：每个块是一个 CSV 分片，统计后合并
- **图像处理**：每个块是一张图，处理后合并结果
- **机器学习**：每个块是一个 batch，计算梯度后聚合
- **加密**：每个块是一段数据，加密后拼接

## demo：批量计算平方和

下面 demo 对比串行 vs 4 进程并行的耗时。`,
    code: `# 第三十六章 demo：多进程批量数据处理
# 本 demo 模拟"批量数据分析"：对 8 个数据块分别做平方和计算（CPU 密集），
# 对比串行 vs 4进程并行 vs 4进程+chunksize 的耗时差异。
import multiprocessing as mp        # 进程模块
import time                         # 计时

# 显式用 fork 上下文：避免 macOS 默认 spawn 在 stdin 运行时重新导入主模块失败
ctx = mp.get_context("fork")

def process_chunk(chunk_id, size):
    """处理一个数据块：计算 size 个数字的平方和
    纯 CPU 计算，模拟数据分析
    """
    total = 0
    for i in range(size):           # 循环 size 次
        total += i * i          # 平方和：i² 的累加（纯 CPU 运算，GIL 限制大）
    return (chunk_id, total)        # 返回 (块ID, 平方和) 方便后续识别

# ============================================================
# 实验1：串行处理 8 个数据块
# ============================================================
print("=" * 55)
print("批量数据处理：8 块 × 200万数字的平方和")
print("=" * 55)

NUM_CHUNKS = 8                       # 8 个数据块
CHUNK_SIZE = 2_000_000              # 每块 200 万个数字

# 串行：在主进程里逐块处理，总耗时 ≈ 8 倍单块耗时
print("\\n方式1：串行处理")
start = time.time()
serial_results = []
for cid in range(NUM_CHUNKS):       # 逐块处理
    r = process_chunk(cid, CHUNK_SIZE)
    serial_results.append(r)
serial_time = time.time() - start
serial_total = sum(r[1] for r in serial_results)  # 汇总所有块的平方和
print(f"  耗时 {serial_time:.3f}s，总和 {serial_total}")

# ============================================================
# 实验2：4 进程并行
# ============================================================
print("\\n方式2：4 进程并行处理")
start = time.time()
# starmap 用于多参数：每个元素是参数元组 (chunk_id, size)
# 与 map 的区别：map 传单参数，starmap 把元组拆成多个参数
tasks = [(cid, CHUNK_SIZE) for cid in range(NUM_CHUNKS)]  # 生成 8 个任务参数元组
with ctx.Pool(4) as pool:           # 创建 4 进程的进程池
    parallel_results = pool.starmap(process_chunk, tasks)  # 并行执行，自动分发任务
parallel_time = time.time() - start
parallel_total = sum(r[1] for r in parallel_results)  # 汇总
print(f"  耗时 {parallel_time:.3f}s，总和 {parallel_total}")

# ============================================================
# 实验3：chunksize 批量分发
# ============================================================
print("\\n方式3：4 进程 + chunksize=2")
start = time.time()
with ctx.Pool(4) as pool:
    # chunksize=2：每 2 个任务打包成一个工作单元分发给进程，
    # 减少主进程与子进程之间的通信次数（任务多时收益更明显）
    results3 = pool.starmap(process_chunk, tasks, chunksize=2)
chunk_time = time.time() - start
print(f"  耗时 {chunk_time:.3f}s")

# ============================================================
# 对比
# ============================================================
print(f"\\n{'='*55}")
print("对比")
print(f"{'='*55}")
print(f"  串行:        {serial_time:.3f}s")
print(f"  4进程:       {parallel_time:.3f}s  (加速 {serial_time/parallel_time:.2f}x)")
print(f"  4进程+chunk: {chunk_time:.3f}s")
print(f"  结果一致: {serial_total == parallel_total}")

print("\\n要点：")
print("• CPU 密集批量处理用进程池（绕开 GIL 真并行）")
print("• 数据分块并行：每块独立处理，无共享状态最理想")
print("• 进程数 ≈ CPU 核数，chunksize 减少通信开销")
print("• starmap 处理多参数，map 处理单参数")`,
  },

  // -----------------------------------------------------------
  // 第 37 章：实战——线程池 + 队列任务调度
  // -----------------------------------------------------------
  {
    id: "pythread-37",
    group: "综合实战",
    icon: "📋",
    title: "实战：线程池 + 队列任务调度",
    content: `## 实战目标

实现一个"任务调度系统"：用**队列接收任务，线程池消费处理**，支持动态添加任务、优先级、失败重试。这是后台任务系统（如 Celery 简化版）的核心模式。

## 架构

\`\`\`
[提交任务] → [优先级队列] → [线程池(N个worker)] → [结果队列]
                                   │
                                   ├─ 成功 → 结果队列
                                   └─ 失败 → 重试（最多3次）
\`\`\`

## 关键设计点

1. **队列解耦**：提交方和执行方通过队列解耦，互不阻塞
2. **优先级**：用 \`PriorityQueue\`，紧急任务先处理
3. **失败重试**：任务带 \`retry_count\`，失败重试到上限
4. **优雅停止**：放结束信号，worker 收到就退出
5. **结果收集**：单独的结果队列，主线程统计

## 任务对象设计

\`\`\`python
# 任务用元组 (优先级, 序号, 任务数据, 重试次数)
# PriorityQueue 按元组比较，优先级小的先出
task = (1, 0, "处理订单#1001", 0)   # 优先级1，序号0
\`\`\`

序号的作用：当优先级相同时，按提交顺序出队（避免比较字符串报错）。

## 优雅关闭

\`\`\`python
# 主线程提交完任务后，放 N 个 None（N=worker数）
for _ in range(num_workers):
    q.put(None)
# worker 收到 None 就退出
\`\`\`

> ⚠️ **PriorityQueue 的坑**：\`None\` 在普通 \`queue.Queue\` 里作停止信号没问题，但 \`PriorityQueue\` 会对元素排序比较，\`None\` 与元组无法比较会抛 \`TypeError\`。所以**优先级队列里的停止信号也必须是可比较的元组**，比如 \`(99, seq, "STOP", 0)\`（优先级设很大、排最后）。本节 demo 就采用这种方式，详见代码里的 \`STOP\` 标记。

## 应用场景

- **订单处理**：新订单进队列，worker 处理（扣库存、生成记录）
- **邮件发送**：邮件任务进队列，worker 发送
- **日志处理**：日志进队列，worker 批量写盘
- **消息推送**：推送任务进队列，worker 发送

## demo：任务调度系统

下面 demo 实现一个简化的任务调度系统，演示优先级、重试、并发处理。`,
    code: `# 第三十七章 demo：线程池 + 队列任务调度
# 本 demo 实现一个简化的"任务调度系统"：
#   优先级队列接收任务 → 3个worker线程消费处理 → 支持失败重试 → 优雅关闭
import threading                      # 线程模块
import queue                          # 队列模块：Queue（FIFO）、PriorityQueue（优先级）
import time                           # 计时/sleep
import random                         # 随机数（模拟失败）

# 优先级队列：任务格式 (优先级, 序号, 任务名, 重试次数)
# 优先级数字小的先处理
# 注意：PriorityQueue 不能放 None（两个 None 无法比较大小），
#   所以停止信号也用元组，优先级设为 99（排最后），任务名用 STOP 标记。
STOP = "__STOP__"                     # 停止信号标记：worker 收到就退出
task_queue = queue.PriorityQueue()    # 优先级队列：worker 从这里取任务
result_queue = queue.Queue()          # 普通队列：worker 把结果放这里
seq_counter = 0                       # 全局序号计数器（保证同优先级任务按提交顺序出队）
seq_lock = threading.Lock()           # 保护 seq_counter 的锁（多线程自增必须加锁）

def next_seq():
    """生成全局唯一序号（PriorityQueue 优先级相同时按序号排序，避免比较字符串）"""
    global seq_counter                # 声明使用全局变量
    with seq_lock:                    # 加锁：防止多线程同时自增导致序号重复
        seq = seq_counter
        seq_counter += 1
    return seq

def submit_task(priority, name):
    """提交一个任务到队列"""
    seq = next_seq()                  # 生成唯一序号
    # PriorityQueue 按元组比较：先比优先级，相同则比序号
    task_queue.put((priority, seq, name, 0))  # 重试次数初始为 0
    print(f"  📤 提交 [{name}] 优先级={priority}")

def worker(worker_id):
    """worker 线程：从队列取任务处理"""
    while True:
        # get() 阻塞等待，直到队列有任务可取
        priority, seq, name, retries = task_queue.get()
        if name == STOP:               # 结束信号：收到就退出
            print(f"  [W{worker_id}] 收到结束信号，退出")
            return
        try:
            # 模拟处理：20% 概率失败（模拟真实场景中的偶发错误）
            if random.random() < 0.2:
                raise RuntimeError("处理失败")
            time.sleep(random.uniform(0.1, 0.3))  # 模拟处理耗时
            result_queue.put((name, "成功", worker_id))  # 成功：结果放入结果队列
            print(f"  ✓ [W{worker_id}] 完成 [{name}]")
        except Exception as e:
            # 失败重试：最多3次
            if retries < 3:
                print(f"  ↻ [W{worker_id}] [{name}] 失败，重试({retries+1}/3)")
                # 放回队列，重试次数+1，优先级降低（数字变大，排更后）
                task_queue.put((priority + 1, seq, name, retries + 1))
            else:
                # 超过重试上限：标记为放弃
                result_queue.put((name, f"放弃(重试{retries}次)", worker_id))
                print(f"  ✗ [W{worker_id}] [{name}] 放弃")
        finally:
            task_queue.task_done()     # 通知队列：这个任务处理完了（join 依赖此计数）

print("=" * 55)
print("任务调度系统（优先级队列 + 3 worker + 重试）")
print("=" * 55)
random.seed(7)                       # 固定随机种子，让失败模式可复现

NUM_WORKERS = 3
# 启动 worker：daemon=True 表示主线程退出时自动回收（但这里我们用 STOP 优雅关闭）
workers = [threading.Thread(target=worker, args=(i,), daemon=True)
           for i in range(NUM_WORKERS)]
for w in workers: w.start()          # 启动 3 个 worker 线程，开始从队列取任务

# 提交一批任务（不同优先级）
print("\\n--- 提交任务 ---")
submit_task(2, "普通任务-A")
submit_task(1, "紧急任务-B")     # 优先级1，应先处理
submit_task(3, "低优任务-C")
submit_task(1, "紧急任务-D")
submit_task(2, "普通任务-E")
submit_task(2, "普通任务-F")

# 等所有任务处理完：join 阻塞直到所有 put 的任务都 task_done()
task_queue.join()
print("\\n--- 所有任务处理完，发送结束信号 ---")
# 每个工作线程发一个 STOP（用元组，优先级99排最后，序号保证唯一不冲突）
for _ in range(NUM_WORKERS):
    task_queue.put((99, next_seq(), STOP, 0))
for w in workers: w.join(timeout=2)   # 等 worker 线程退出（最多2秒）

# 统计结果
print("\\n--- 结果统计 ---")
results = []
while not result_queue.empty():       # 从结果队列取出所有结果
    results.append(result_queue.get())
success = sum(1 for r in results if r[1] == "成功")  # 统计成功数
failed = len(results) - success                          # 统计失败/放弃数
print(f"  总计 {len(results)} 个任务：成功 {success}，失败/放弃 {failed}")
for name, status, wid in results:    # 逐个打印结果
    print(f"    [{name}] → {status} (W{wid})")

print("\\n要点：")
print("• 队列解耦提交方和执行方，互不阻塞")
print("• PriorityQueue 实现优先级，紧急任务先处理")
print("• 失败重试：任务带 retry_count，放回队列重试")
print("• 优雅关闭：放 N 个停止信号通知 worker 退出")
print("• 注意：PriorityQueue 不能放 None（无法比较），停止信号也要是元组")
print("• 这是 Celery 等任务系统的核心模式")`,
  },

  // -----------------------------------------------------------
  // 第 38 章：并发陷阱与最佳实践
  // -----------------------------------------------------------
  {
    id: "pythread-38",
    group: "综合实战",
    icon: "⚠️",
    title: "并发陷阱与最佳实践总结",
    content: `## 并发编程的"坑"比语法多

学完前面 37 章（含 asyncio 异步编程），你已经掌握了工具。但并发编程真正的难点在于**陷阱**——很多代码"看起来对，跑起来错"。这一章总结常见陷阱和最佳实践。

## 陷阱1：竞态条件（最常见）

**症状**：多线程/进程下结果不稳定，偶尔出错。

**原因**：共享变量"读-改-写"不是原子的。

**修复**：用 Lock 保护，或用线程安全的 Queue。

\`\`\`python
from itertools import count
# ❌ 错误
count += 1

# ✓ 正确
with lock:
    count += 1
\`\`\`

## 陷阱2：死锁

**症状**：程序卡住不动。

**常见原因**：
1. 忘记 release 锁 → 用 \`with lock\` 解决
2. 持有锁 A 时等锁 B，对方持有 B 等 A → 统一加锁顺序
3. 同线程对 Lock 重复 acquire → 改用 RLock

**预防**：加锁顺序全局统一、用 \`with\`、设超时 \`acquire(timeout)\`。

## 陷阱3：GIL 误用

**症状**：多线程跑 CPU 密集任务不提速。

**修复**：CPU 密集用多进程，IO 密集用多线程。

## 陷阱4：守护进程/线程的资源泄漏

**症状**：守护线程被强杀，文件/连接没关闭，数据损坏。

**修复**：不要在守护线程做关键操作；关键任务用非守护。

## 陷阱5：全局变量在多进程里不共享

**症状**：子进程改了全局变量，主进程看不到。

**原因**：进程内存独立。

**修复**：用 Queue/Value/Manager 通信，别指望全局变量。

## 陷阱6：spawn 模式下代码无限递归

**症状**：spawn 启动时子进程重新导入主模块，启动代码又创建子进程，无限循环。

**修复**：启动代码放 \`if __name__ == "__main__":\` 里。

## 陷阱7：Queue 在 Pool 里的坑

**症状**：\`multiprocessing.Queue\` 在 \`Pool\` 里有时卡死。

**修复**：Pool 里用 \`Manager().Queue()\` 或直接用 \`pool.map\` 返回结果。

## 陷阱8：Manager 嵌套修改不同步

**症状**：\`d['list'].append(x)\` 改了，但其他进程看不到。

**修复**：整体重新赋值 \`d['list'] = new_list\`。

## 陷阱9：子线程/子进程异常被吞

**症状**：手动 \`Thread/Process\` 的子任务抛异常，主线程不知道，静默失败。

**修复**：用 \`ThreadPoolExecutor/ProcessPoolExecutor\`，异常在 \`future.result()\` 抛出；或手动 try/except 传回主线程。

## 陷阱10：线程数/进程数过多

**症状**：开几千个线程，系统卡顿，比串行还慢。

**原因**：线程切换有开销；进程太多吃内存。

**修复**：用线程池/进程池，\`max_workers\` 有限制（线程 ≤ 几十，进程 ≤ CPU 核数）。

## 最佳实践总结

### 选型
1. **IO 密集** → \`ThreadPoolExecutor\` 或 \`asyncio\`
2. **CPU 密集** → \`ProcessPoolExecutor\` 或 \`multiprocessing.Pool\`
3. **不确定** → 先测，用 \`time\` 对比

### 同步
4. **优先用 Queue**，少用 Lock——Queue 内部已加锁
5. **Lock 用 \`with\`**，避免忘记 release
6. **加锁顺序全局统一**，防死锁
7. **能用无共享设计就别共享**——每个 worker 独立处理，结果汇总

### 资源管理
8. **用线程池/进程池**，别手动建大量 Thread/Process
9. **with 管理池**，自动 shutdown
10. **设超时**：\`acquire(timeout)\`、\`get(timeout)\`、\`join(timeout)\`、\`wait(timeout)\`

### 健壮性
11. **子任务 try/except**，异常传回主线程，别静默吞
12. **关键操作别在守护线程**做
13. **优雅关闭**：用结束信号（None/STOP）通知 worker 退出

### 性能
14. **进程数 = CPU 核数**，线程数根据 IO 比例定
15. **chunksize** 批量分发减少通信开销
16. **大数据用共享内存**（Value/Array），少用 pickle 传输

## 决策流程图

\`\`\`
任务来了
  │
  ├─ 主要是等待（网络/文件）？
  │     ├─ 是 → IO 密集 → ThreadPoolExecutor
  │     └─ 否 ↓
  ├─ 主要是计算？
  │     ├─ 是 → CPU 密集 → ProcessPoolExecutor
  │     └─ 否 ↓
  ├─ 需要超高并发（万级连接）？
  │     └─ asyncio
  ├─ 需要调用外部程序？
  │     └─ subprocess
  └─ 任务间需要共享大量数据？
        ├─ 简单数据 → Value/Array
        └─ 复杂对象 → Manager
\`\`\`

## 恭喜！

学完这 38 章（含 asyncio 异步编程），你已经掌握了 Python 并发编程的核心。剩下的就是在实战中积累经验——并发编程的"感觉"只能靠踩坑练出来。多写、多测、多对比，你会越来越得心应手。

最后送一句话：**"过早优化是万恶之源"**。先写正确的串行代码，确认是性能瓶颈后再用并发优化，并用实测数据验证效果。`,
    code: `# 第三十八章 demo：综合检查清单 + 速查
# 这个 demo 不执行复杂逻辑，而是一份可运行的"并发速查表"
# 涵盖常见模式的正确写法，方便日后查阅

import threading                       # 线程模块：Thread、Lock、Event
import multiprocessing as mp           # 进程模块
import queue                           # 队列模块：Queue、PriorityQueue
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed

print("=" * 55)
print("Python 并发速查表（可运行验证）")
print("=" * 55)

# ============================================================
# 1. 线程安全计数器（Lock 正确用法）
# ============================================================
print("\\n1. 线程安全计数器：")
count = 0                             # 共享变量：多线程同时修改会有竞态条件
lock = threading.Lock()               # 创建锁：保护 count 的"读-改-写"操作
def safe_inc():
    global count                      # 声明使用全局变量
    for _ in range(1000):
        with lock:              # ✓ 用 with，不用手动 acquire/release（异常时也能释放）
            count += 1          # 加锁后自增：保证原子性，不会丢失更新
ts = [threading.Thread(target=safe_inc) for _ in range(10)]  # 10 个线程各加 1000
for t in ts: t.start()               # 启动所有线程
for t in ts: t.join()                # 等所有线程完成
print(f"   期望10000，实际{count} ✓")  # 不加锁会小于 10000（丢失更新）

# ============================================================
# 2. 生产者消费者（Queue，推荐模式）
# ============================================================
print("\\n2. 生产者消费者（Queue）：")
q = queue.Queue()                     # 线程安全队列：内部已加锁，无需手动同步
def producer():
    for i in range(3):
        q.put(f"产品{i}")             # 生产者放入数据
    q.put(None)                 # 结束信号：消费者收到 None 就退出循环
def consumer():
    while True:
        item = q.get()                # 阻塞等待，队列有数据就取
        if item is None: break        # 收到结束信号，退出
        q.task_done()                 # 通知队列：这个 item 处理完了
    q.task_done()                     # None 也要 task_done（平衡 get 计数）
threading.Thread(target=producer).start()              # 启动生产者
threading.Thread(target=consumer, daemon=True).start() # 启动消费者（daemon=True 随主线程退出）
q.join()                              # 等所有 put 的数据都被 task_done
print("   完成 ✓")

# ============================================================
# 3. 线程池（IO 密集推荐）
# ============================================================
print("\\n3. 线程池 map：")
def io_task(x):
    import time; time.sleep(0.01)      # 模拟 IO 等待（sleep 释放 GIL）
    return x * 2                       # 返回 x 的两倍
with ThreadPoolExecutor(4) as ex:      # 4 线程的线程池
    results = list(ex.map(io_task, range(5)))  # map 并发处理 0~4，返回结果列表
print(f"   结果: {results} ✓")          # [0, 2, 4, 6, 8]

# ============================================================
# 4. 优先级队列
# ============================================================
print("\\n4. 优先级队列（紧急任务先处理）：")
pq = queue.PriorityQueue()            # 优先级队列：元素按大小排序，小的先出
pq.put((2, "普通"))                   # 优先级 2
pq.put((1, "紧急"))                   # 优先级 1（最小，最先出队）
pq.put((3, "低优"))                   # 优先级 3（最大，最后出队）
order = []
while not pq.empty():                 # 逐个取出
    order.append(pq.get()[1])         # get() 返回元组，[1] 取任务名
print(f"   出队顺序: {order}（紧急优先）✓")  # ['紧急', '普通', '低优']

# ============================================================
# 5. Event 优雅停止
# ============================================================
print("\\n5. Event 优雅停止：")
stop = threading.Event()              # Event：线程间信号量，set() 后 is_set() 变 True
def bg():
    while not stop.is_set():          # 检查是否收到停止信号
        if stop.wait(0.05): break     # wait(0.05)：等0.05秒或被set()唤醒，返回True表示被唤醒
t = threading.Thread(target=bg, daemon=True)
t.start()                             # 启动后台线程
stop.set()                            # 发送停止信号：Event 被 set，wait 立即返回 True
print("   已停止 ✓")

# ============================================================
# 6. 决策速查
# ============================================================
print("\\n" + "=" * 55)
print("决策速查")
print("=" * 55)
print("  IO 密集（网络/文件）  → ThreadPoolExecutor / asyncio")
print("  CPU 密集（计算）      → ProcessPoolExecutor")
print("  超高并发 IO（万级）   → asyncio（协程比线程轻量）")
print("  调用外部程序          → subprocess")
print("  任务间共享简单数据    → Value / Array")
print("  任务间共享复杂对象    → Manager")
print("  生产者消费者          → queue.Queue（线程）/ mp.Queue（进程）/ asyncio.Queue（协程）")
print("  asyncio 里调阻塞函数 → asyncio.to_thread / run_in_executor")
print()
print("  黄金法则：")
print("  • 先写正确的串行代码，确认瓶颈后再并发优化")
print("  • 优先用池（Pool/Executor），别手动建大量线程/进程")
print("  • 优先用 Queue，少用 Lock")
print("  • Lock 用 with，加锁顺序统一，设超时")
print("  • 子任务异常要传回，别静默吞")
print("  • 用实测数据验证并发效果，别靠猜")

print("\\n🎉 教程完结！恭喜你学完了 Python 线程 / 进程 / asyncio 的全部内容！")`,
  },
];
