// =============================================================
// Python 执行代码原理（pyrun）—— 第五批章节
// -------------------------------------------------------------
// 本文件包含以下章节（group: 性能与并发原理，共 4 章）：
//   1. pyrun-21 — GIL：为什么 Python 不能真多线程
//   2. pyrun-22 — 迭代器原理：for 循环怎么工作
//   3. pyrun-23 — 异步原理：单线程怎么"同时"做多件事
//   4. pyrun-24 — import 机制：模块怎么被加载
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（本批为"性能与并发原理"）
//   content : Markdown 格式的详细讲解（大白话讲原理）
//   code    : 可运行、每行带中文注释的 Python 示例代码
//
// 代码运行环境约束：
//   - 用 python3 直接运行，5 秒超时
//   - 仅使用 Python 标准库
//   - 通过 /api/run-py 接口执行，捕获 stdout 返回
// =============================================================

export const chapters = [
  // =========================================================
  // 第21章：GIL：为什么 Python 不能真多线程
  // =========================================================
  {
    id: "pyrun-21",
    group: "性能与并发原理",
    icon: "🔒",
    title: "GIL：为什么 Python 不能真多线程",
    content: `## 一句话先说透

**GIL**（Global Interpreter Lock，全局解释器锁）是 CPython 解释器里的一把"全局大锁"：**任何时刻，只允许一个线程执行 Python 字节码**。这就是为什么大家总说"Python 不能真正多线程并行"——并不是 Python 语言本身的规定，而是 CPython 实现的一个历史选择。

> 🎯 大白话：把 CPU 想象成公司里**唯一一间会议室**，所有线程都是来开会的人。GIL 就是会议室门口那把锁，**同一时间只能有一个人进去开会**，其他人只能在门外排队。哪怕你招了 10 个员工（10 个线程），会议室也只有一个，开会效率不会变成 10 倍。

## GIL 到底是什么

GIL 是 CPython 解释器内部的一个**互斥锁（mutex）**。不管是 4 核、8 核还是 64 核的机器，只要跑的是 CPython，**同一时刻只有一个线程在执行 Python 代码**。

注意几个关键点：

- **是 CPython 的特性，不是 Python 语言的特性**。Jython、IronPython 没有 GIL；PyPy 也有 GIL。Python 3.13 开始提供实验性的"自由线程"模式（PEP 703），可以关闭 GIL，但目前还是实验阶段。
- **GIL 锁的是"Python 字节码执行"，不是整个进程**。线程在做 IO（读写文件、网络请求）或调用 C 扩展时，可以主动释放 GIL，让别的线程跑。
- **GIL 的存在让多线程在 CPU 密集型任务上几乎没有加速效果**，甚至更慢。

\`\`\`python
# 看起来开了 4 个线程"同时"算
import threading
# 但因为 GIL，实际还是一次只算一个
\`\`\`

## 为什么要有 GIL：为了引用计数的线程安全

Python 用**引用计数**来管理内存：每个对象内部有个计数器，记录被多少个变量引用。计数器归零时，对象立即被回收。

\`\`\`python
a = [1, 2, 3]   # 列表对象引用计数 = 1
b = a           # 引用计数 = 2
del a           # 引用计数 = 1
del b           # 引用计数 = 0，对象被回收
\`\`\`

如果多个线程同时修改同一个对象的引用计数，**计数器可能会出错**（比如两个线程同时 +1，结果只加了 1）。最简单的解决办法就是：**给整个解释器加一把全局锁**，任何线程执行 Python 代码前都得先拿到这把锁。

这样做的好处：

| 方面 | 好处 |
| --- | --- |
| 实现简单 | 不用给每个对象单独加锁，一把全局锁搞定 |
| 单线程性能 | 没有锁竞争开销，单线程跑得快 |
| C 扩展好写 | 扩展作者不用操心线程安全细节 |
| 内存安全 | 引用计数不会被并发破坏 |

坏处也很明显：

| 方面 | 坏处 |
| --- | --- |
| 多核利用 | CPU 密集型多线程无法利用多核 |
| 并行计算 | 想真正并行只能用多进程 |

> 🎯 大白话：引用计数就像每个物品上都挂着一个"使用人数"的牌子。如果好几个人同时改这块牌子，数字就可能改乱。最省事的办法就是——**只许一个人改牌子**（GIL）。简单粗暴，但有效。

### 为什么不直接去掉 GIL

去掉 GIL 不是不行，但难点在于：

1. **每个对象都要加细粒度锁**，单线程性能会下降（早期 Greg Stein 的 patch 让单线程慢了约 40%）。
2. **现有 C 扩展几乎都依赖 GIL 提供的隐式线程安全**，去掉 GIL 会让大量扩展出现竞态条件。
3. **替代方案（如 Jython 用 JVM 的 GC）**会改变内存模型，无法兼容 CPython 生态。

Python 3.13 的 PEP 703 终于迈出了这一步：引入"自由线程"构建模式，逐步去掉 GIL。但要真正普及还需要很多年。

## GIL 对 CPU 密集型 vs IO 密集型的影响

这是理解 GIL 最关键的一点。我们分两种情况看：

### CPU 密集型任务

CPU 密集型 = 任务主要在**做计算**（数学运算、循环、压缩、加密等），CPU 是瓶颈。

\`\`\`python
def cpu_task(n):
    total = 0
    for i in range(n):
        total += i * i
    return total
\`\`\`

多线程跑这种任务：

- 线程 A 拿到 GIL 开始算
- 线程 B、C、D 排队等
- 过一会儿（基于 ticks 或时间片），Python 强制线程 A **释放 GIL**，让 B 上场
- 但 B 也在算同样的东西，A 只能继续等
- 结果：**4 个线程轮流用 1 个核**，总时间几乎不变，甚至因为线程切换开销**更慢**

> 🎯 大白话：4 个人轮流用一间会议室算账。换人还要花时间交接（线程切换），所以 4 个人算完的时间和 1 个人差不多，甚至更久。

### IO 密集型任务

IO 密集型 = 任务主要在**等待**（网络请求、读写文件、数据库查询），CPU 大部分时间闲着。

\`\`\`python
def io_task(url):
    response = urllib.request.urlopen(url)  # 等待网络
    return response.read()
\`\`\`

多线程跑这种任务：

- 线程 A 发起网络请求，**在等待响应时主动释放 GIL**
- 线程 B 立刻拿到 GIL，也发起请求
- 线程 C、D 同样
- 4 个请求**同时在网络上飞**
- 响应回来后，各线程重新竞争 GIL 处理结果
- 结果：**总时间约等于最慢的那个请求**，接近 4 倍加速

> 🎯 大白话：4 个人各自打电话问事情。打电话的时候会议室空着（释放 GIL），别人可以进来打自己的电话。这样 4 个电话同时打，比一个一个打快多了。

### 对比表

| 任务类型 | 多线程效果 | 原因 |
| --- | --- | --- |
| CPU 密集型 | ❌ 几乎无加速，可能更慢 | GIL 让计算串行，还有切换开销 |
| IO 密集型 | ✅ 明显加速 | 等待时释放 GIL，多个 IO 可重叠 |
| 混合型 | ⚠️ 部分加速 | 取决于 IO 占比 |

## 多线程在 Python 中的实际价值

既然 CPU 密集型没用，那 Python 的多线程还有啥用？**用处大着呢**：

1. **网络爬虫**：同时发几十个请求，速度翻几十倍。
2. **Web 服务器**：处理多个客户端连接，一个等 IO 时服务另一个。
3. **GUI 程序**：后台线程做耗时操作，主线程保持界面响应。
4. **文件批量处理**：多个文件同时读写。
5. **数据库查询**：并发查询多个表或多个库。

一句话总结：**只要任务里有大量"等待"，多线程就有用**。

### CPU 密集型怎么办

如果真是 CPU 密集型，想用多核，有三个选择：

\`\`\`python
# 方案一：多进程（推荐）
from multiprocessing import Pool
# 每个进程有自己的 GIL，真正并行

# 方案二：用 C 扩展 / NumPy
# NumPy 的底层 C 计算会释放 GIL，可以多线程并行

# 方案三：等 Python 3.13+ 自由线程成熟
\`\`\`

## 释放 GIL 的场景

GIL 不是永远抓着不放，下面这些情况线程会**主动释放 GIL**：

| 场景 | 是否释放 GIL | 说明 |
| --- | --- | --- |
| \`time.sleep()\` | ✅ 释放 | 阻塞等待，没必要占着锁 |
| 文件读写 \`open/read/write\` | ✅ 释放 | 等磁盘 IO |
| 网络操作 \`socket\` | ✅ 释放 | 等网络 IO |
| \`urllib\` / \`requests\` | ✅ 释放 | 底层都是 socket |
| C 扩展主动释放 | ✅ 释放 | 用 \`Py_BEGIN_ALLOW_THREADS\` 宏 |
| 纯 Python 计算 | ❌ 不释放 | 一直占用 GIL |
| NumPy 大数组运算 | ✅ 释放 | 底层 C 实现会释放 |

### 时间片轮转

即使是纯 Python 计算，CPython 也不会让一个线程永远霸占 GIL。它用**时间片**机制：

- Python 2：每 100 条字节码检查一次是否该让出
- Python 3：默认每 5ms 检查一次（\`sys.getswitchinterval()\`）

\`\`\`python
import sys
print(sys.getswitchinterval())  # 0.005，即 5 毫秒
\`\`\`

这就是为什么 CPU 密集型多线程不会完全卡死，但也不会真正并行——线程们在频繁抢锁、切换，反而增加开销。

## 用一张图理解 GIL

\`\`\`
   线程1 ─┐
   线程2 ─┤     ┌──── GIL（只有一把）────┐
   线程3 ─┤────▶│  同一时刻只放一个线程进去  │──▶ CPU 核心
   线程4 ─┘     └────────────────────────┘

   场景1：4 个线程都在算数 → 排队进 GIL → 没加速
   场景2：4 个线程都在等网络 → 等待时不要 GIL → 真并发
\`\`\`

## 常见误区澄清

### 误区一："Python 多线程完全没用"

❌ 错。IO 密集型场景下多线程非常有用，几乎是 Python 并发的首选。

### 误区二："多线程一定比单线程快"

❌ 错。CPU 密集型任务多线程可能更慢（线程切换开销）。

### 误区三："GIL 是 Python 的缺陷"

⚠️ 不准确。GIL 是 CPython 的**工程权衡**，换来了单线程性能和 C 扩展生态。没有完美的方案。

### 误区四："asyncio 能绕过 GIL 做多核并行"

❌ 错。asyncio 还是单线程，只是用事件循环切换任务，**依然受 GIL 限制**。它的优势是 IO 并发，不是 CPU 并行。

## 本节代码演示

下面的代码做了一个**对比实验**：

1. CPU 密集型任务：串行 vs 多线程，看耗时差异（预期差不多）。
2. IO 密集型任务（用 sleep 模拟）：串行 vs 多线程，看耗时差异（预期多线程快很多）。

运行后观察输出，你就能直观感受到 GIL 的影响。`,
    code: `# ============================================================
# 第21章代码演示：GIL 对 CPU 密集型与 IO 密集型的影响
# ============================================================
# 这个实验对比"串行"和"多线程"在两种任务下的耗时：
#   - CPU 密集型：纯计算，受 GIL 限制，多线程不会更快
#   - IO 密集型：用 sleep 模拟等待，会释放 GIL，多线程明显更快

import threading  # 导入线程模块，用于创建多线程
import time       # 导入时间模块，用于计时和 sleep 模拟

# CPU 密集型任务：累加大量平方和
def cpu_bound(count):  # 定义函数 cpu_bound，参数 count 是累加上限
    total = 0  # 初始化累加器为 0
    for i in range(count):  # 循环 count 次
        total += i * i  # 把每个 i 的平方累加到 total
    return total  # 返回累加结果

# IO 密集型任务：用 sleep 模拟网络/磁盘等待
def io_bound(seconds):  # 定义函数 io_bound，参数 seconds 是休眠秒数
    time.sleep(seconds)  # 当前线程休眠，这期间会释放 GIL，让别的线程能跑
    return seconds  # 返回休眠时长

# 串行执行 CPU 任务
def run_cpu_serial(count, times):  # 定义串行 CPU 函数，count 是单次计算量，times 是执行次数
    result = 0  # 初始化结果为 0
    for _ in range(times):  # 循环 times 次
        result += cpu_bound(count)  # 一次次串行调用 cpu_bound
    return result  # 返回总结果

# 多线程执行 CPU 任务
def run_cpu_thread(count, times):  # 定义多线程 CPU 函数
    results = [0] * times  # 预分配结果列表，长度为 times
    def worker(idx):  # 定义内部工作函数，idx 是线程编号
        results[idx] = cpu_bound(count)  # 每个线程独立计算，结果写入对应位置
    threads = []  # 创建线程列表
    for i in range(times):  # 循环 times 次
        t = threading.Thread(target=worker, args=(i,))  # 创建线程对象，target 指定工作函数，args 传参
        threads.append(t)  # 把线程加入列表
        t.start()  # 启动线程
    for t in threads:  # 遍历所有线程
        t.join()  # 等待每个线程执行完毕
    return sum(results)  # 返回所有结果的和

# 串行执行 IO 任务
def run_io_serial(seconds, times):  # 定义串行 IO 函数
    for _ in range(times):  # 循环 times 次
        io_bound(seconds)  # 一次次串行休眠
    return seconds * times  # 返回总时长

# 多线程执行 IO 任务
def run_io_thread(seconds, times):  # 定义多线程 IO 函数
    threads = []  # 创建线程列表
    for i in range(times):  # 循环 times 次
        t = threading.Thread(target=io_bound, args=(seconds,))  # 创建线程，执行 io_bound
        threads.append(t)  # 加入列表
        t.start()  # 启动线程
    for t in threads:  # 遍历线程
        t.join()  # 等待完成
    return seconds * times  # 返回总时长

# 主程序入口
if __name__ == "__main__":  # 标准 main 守卫，直接运行才执行
    print("=" * 50)  # 打印分隔线
    print("GIL 影响对比实验")  # 打印实验标题
    COUNT = 600000  # CPU 任务每次计算量
    TIMES = 4  # 重复次数（也是线程数）
    IO_SEC = 0.3  # 每次 IO 模拟休眠秒数
    print("\\n【1】CPU 密集型任务串行执行：")  # 提示开始第一组实验
    t0 = time.time()  # 记录开始时间
    run_cpu_serial(COUNT, TIMES)  # 串行执行 CPU 任务
    t1 = time.time()  # 记录结束时间
    print(f"   串行耗时: {t1 - t0:.3f} 秒")  # 打印串行耗时
    print("\\n【2】CPU 密集型任务多线程执行：")  # 提示开始第二组实验
    t0 = time.time()  # 记录开始时间
    run_cpu_thread(COUNT, TIMES)  # 多线程执行 CPU 任务
    t1 = time.time()  # 记录结束时间
    print(f"   多线程耗时: {t1 - t0:.3f} 秒")  # 打印多线程耗时
    print("\\n【3】IO 密集型任务串行执行：")  # 提示开始第三组实验
    t0 = time.time()  # 记录开始时间
    run_io_serial(IO_SEC, TIMES)  # 串行执行 IO 任务
    t1 = time.time()  # 记录结束时间
    print(f"   串行耗时: {t1 - t0:.3f} 秒")  # 打印串行耗时
    print("\\n【4】IO 密集型任务多线程执行：")  # 提示开始第四组实验
    t0 = time.time()  # 记录开始时间
    run_io_thread(IO_SEC, TIMES)  # 多线程执行 IO 任务
    t1 = time.time()  # 记录结束时间
    print(f"   多线程耗时: {t1 - t0:.3f} 秒")  # 打印多线程耗时
    print("\\n结论：CPU 密集型多线程几乎没有提速（受 GIL 限制），")  # 打印结论第一句
    print("      IO 密集型多线程明显提速（sleep 期间释放 GIL）。")  # 打印结论第二句
`,
  },

  // =========================================================
  // 第22章：迭代器原理：for 循环怎么工作
  // =========================================================
  {
    id: "pyrun-22",
    group: "性能与并发原理",
    icon: "⏱️",
    title: "迭代器原理：for 循环怎么工作",
    content: `## 一句话先说透

Python 的 \`for\` 循环看起来很简单：\`for x in [1,2,3]:\` 就能把列表里的元素一个个拿出来。但背后其实调用了一套叫**迭代器协议**的机制：先调 \`__iter__\` 拿到一个迭代器，再反复调 \`__next__\` 取值，直到抛出 \`StopIteration\` 异常表示"没货了"。

> 🎯 大白话：\`for\` 循环就像在传送带前一个个拿东西。传送带（迭代器）每次吐一件给你，你说"下一件"，它就再吐一件。等它喊一声"没货了"（StopIteration），你就停手走人。

## for 循环的本质

我们平时写的 \`for x in obj:\`，其实等价于下面这段"手动"代码：

\`\`\`python
# 这两段代码做的事一模一样

# 写法一：for 循环
for x in [1, 2, 3]:
    print(x)

# 写法二：手动调用迭代器协议
_it = iter([1, 2, 3])      # 调用 obj.__iter__()，拿到迭代器
while True:
    try:
        x = next(_it)       # 调用 _it.__next__()，拿下一个值
        print(x)
    except StopIteration:   # 没货了，收到停止信号
        break
\`\`\`

也就是说，\`for\` 循环做了三件事：

1. 对对象调用 \`iter()\`，触发它的 \`__iter__\` 方法，拿到一个**迭代器**。
2. 反复调用 \`next()\`，触发迭代器的 \`__next__\` 方法，拿下一个值。
3. 一旦 \`__next__\` 抛出 \`StopIteration\`，\`for\` 就知道结束了，安静退出。

## 迭代器协议

"协议"就是一套约定。Python 的迭代器协议规定：

- **可迭代对象（Iterable）**：实现了 \`__iter__()\` 方法的对象，返回一个迭代器。
- **迭代器（Iterator）**：实现了 \`__next__()\` 方法的对象，每次返回一个值，没值了就抛 \`StopIteration\`。

并且迭代器自己的 \`__iter__()\` 通常返回它自己（\`return self\`），这样迭代器本身也是可迭代的。

\`\`\`python
from collections.abc import Iterable, Iterator

lst = [1, 2, 3]
print(isinstance(lst, Iterable))   # True，列表可迭代
print(isinstance(lst, Iterator))   # False，列表本身不是迭代器

it = iter(lst)
print(isinstance(it, Iterator))    # True，iter() 返回的是迭代器
\`\`\`

### 协议方法对照表

| 角色 | 必须实现的方法 | 作用 |
| --- | --- | --- |
| 可迭代对象 | \`__iter__()\` | 返回一个迭代器 |
| 迭代器 | \`__next__()\` | 返回下一个值，没值抛 StopIteration |
| 迭代器 | \`__iter__()\` | 返回自己（迭代器也是可迭代的） |

## 可迭代对象 vs 迭代器

这是个很容易混淆的点，我们仔细区分：

### 可迭代对象（Iterable）

**不一定是迭代器**，但能产出迭代器。常见的可迭代对象：

\`\`\`python
[1, 2, 3]          # 列表
(1, 2, 3)          # 元组
"abc"              # 字符串
{1, 2, 3}          # 集合
{"a": 1}           # 字典
range(10)          # range 对象
open('file.txt')   # 文件对象（它同时也是迭代器）
\`\`\`

它们都有 \`__iter__\` 方法，但**不一定有 \`__next__\`**。

### 迭代器（Iterator）

**一定是可迭代对象**，并且额外有 \`__next__\` 方法。

\`\`\`python
it = iter([1, 2, 3])   # 这才是迭代器
print(next(it))         # 1
print(next(it))         # 2
print(next(it))         # 3
print(next(it))         # ❌ 抛 StopIteration
\`\`\`

### 关键区别

| 特性 | 可迭代对象 | 迭代器 |
| --- | --- | --- |
| 有 \`__iter__\` | ✅ | ✅ |
| 有 \`__next__\` | ❌（通常没有） | ✅ |
| 能用 for 循环 | ✅ | ✅ |
| 能反复迭代 | ✅ 每次产出新迭代器 | ❌ 一次性的，耗尽就没了 |
| \`iter(x) is x\` | ❌ | ✅（返回自己） |

> 🎯 大白话：可迭代对象是个"仓库"，每次你去找它要货，它给你一条新的"传送带"（迭代器）。传送带用完一次就废了，但仓库还在，下次还能再要一条新传送带。

## StopIteration 异常

\`StopIteration\` 是迭代器协议里的"结束信号"。它不是真正的错误，而是一种**正常的控制流**：

\`\`\`python
it = iter([1, 2])
print(next(it))   # 1
print(next(it))   # 2
print(next(it))   # 抛出 StopIteration
\`\`\`

\`for\` 循环内部就是用 \`try/except StopIteration\` 来捕获这个信号的。所以你自己写迭代器时，**一定要在没值时抛 \`StopIteration\`**，否则 \`for\` 循环就停不下来。

\`\`\`python
class MyIterator:
    def __init__(self):
        self.data = [1, 2, 3]
        self.index = 0
    def __iter__(self):
        return self
    def __next__(self):
        if self.index >= len(self.data):
            raise StopIteration    # 没货了，必须抛这个
        value = self.data[self.index]
        self.index += 1
        return value
\`\`\`

## 生成器为什么是迭代器

**生成器（Generator）** 是创建迭代器的捷径。用 \`yield\` 关键字的函数就是生成器函数：

\`\`\`python
def my_gen():
    yield 1
    yield 2
    yield 3

g = my_gen()
print(next(g))   # 1
print(next(g))   # 2
print(next(g))   # 3
print(next(g))   # StopIteration
\`\`\`

生成器函数调用后返回一个**生成器对象**，它自动实现了迭代器协议（\`__iter__\` 和 \`__next__\`）：

- 每次 \`next()\` 执行到 \`yield\` 处**暂停**，把 \`yield\` 后的值返回。
- 下次 \`next()\` 从暂停处**恢复**执行，直到下一个 \`yield\`。
- 函数结束时（没有更多 \`yield\`），自动抛 \`StopIteration\`。

\`\`\`python
print(hasattr(g, '__iter__'))   # True
print(hasattr(g, '__next__'))   # True
from collections.abc import Iterator
print(isinstance(g, Iterator))  # True
\`\`\`

> 🎯 大白话：\`yield\` 就像在函数里装了个"暂停键"。每次 \`next\` 按一下，函数跑一段，吐个值，然后按暂停。再 \`next\` 再按，跑到下一个暂停点。跑完了自动喊"没货了"。

### 生成器表达式

除了 \`yield\` 函数，还有生成器表达式，长得像列表推导式，但用圆括号：

\`\`\`python
lst = [x*x for x in range(5)]      # 列表推导式，一次性生成所有值
gen = (x*x for x in range(5))      # 生成器表达式，惰性求值
print(next(gen))                    # 0
print(next(gen))                    # 1
\`\`\`

生成器表达式的优势是**省内存**——不会一次性把所有值算出来存着，而是用到才算。

## 迭代器的"一次性"特性

迭代器是**消耗品**，用完就没了，不能倒带：

\`\`\`python
it = iter([1, 2, 3])
for x in it:
    print(x)        # 1 2 3
for x in it:
    print(x)        # 什么都不打印！迭代器已经耗尽
\`\`\`

这一点经常让人踩坑。如果想重复迭代，要么用可迭代对象（列表等），要么重新调 \`iter()\` 创建新迭代器。

\`\`\`python
lst = [1, 2, 3]
for x in lst:       # 每次都创建新迭代器，可以反复用
    print(x)
for x in lst:
    print(x)        # 正常打印 1 2 3
\`\`\`

## 哪些地方用到了迭代器协议

迭代器协议是 Python 的基础设施，很多地方都依赖它：

| 场景 | 说明 |
| --- | --- |
| \`for\` 循环 | 内部用 \`iter()\` + \`next()\` |
| 列表推导式 | 遍历可迭代对象 |
| \`sum/max/min\` | 接受可迭代对象 |
| \`list()\` / \`tuple()\` | 把迭代器转成容器 |
| 解包 \`a, b, c = it\` | 按顺序取值 |
| \`*args\` 解包 | 展开可迭代对象 |
| \`zip\` / \`map\` / \`filter\` | 返回迭代器 |

\`\`\`python
print(sum([1, 2, 3]))        # 6，sum 内部迭代求和
print(list(range(3)))         # [0, 1, 2]，把迭代器转列表
a, b, c = [1, 2, 3]          # 解包，按 next 顺序赋值
print(*range(3))              # 0 1 2，展开可迭代对象
\`\`\`

## 本节代码演示

下面的代码会：

1. 自定义一个 \`Countdown\` 可迭代对象和对应的迭代器，**追踪 \`__iter__\` 和 \`__next__\` 的调用过程**，让你看到 \`for\` 循环背后到底发生了什么。
2. 手动调用 \`iter()\` / \`next()\` 模拟 \`for\` 循环。
3. 演示生成器也是迭代器。
4. 演示迭代器的"一次性"特性。

运行后对照输出，你会对迭代器协议有非常直观的理解。`,
    code: `# ============================================================
# 第22章代码演示：自定义迭代器，追踪 __next__ 调用过程
# ============================================================
# 这段代码把 for 循环"拆开"给你看：
#   1. 自定义可迭代对象 Countdown 和它的迭代器
#   2. 在 __iter__ / __next__ 里打印日志，观察调用顺序
#   3. 手动用 iter()/next() 模拟 for 循环
#   4. 演示生成器也是迭代器、迭代器是一次性的

# 自定义可迭代对象：倒计时
class Countdown:  # 定义类 Countdown，表示一个倒计时序列
    def __init__(self, start):  # 初始化方法，接收起始值 start
        self.start = start  # 把 start 保存为实例属性
    def __iter__(self):  # 实现 __iter__，使对象可迭代
        print(f"  [__iter__ 被调用] 返回一个迭代器，从 {self.start} 开始")  # 打印追踪信息，让你看到 __iter__ 何时被调用
        return CountdownIterator(self.start)  # 返回一个新的迭代器对象

# 自定义迭代器：实际产生值
class CountdownIterator:  # 定义迭代器类 CountdownIterator
    def __init__(self, start):  # 初始化方法
        self.current = start  # 设置当前值为 start
    def __iter__(self):  # 迭代器自身也是可迭代的，返回自己
        return self  # 返回 self，满足迭代器协议
    def __next__(self):  # 实现 __next__，返回下一个值
        print(f"  [__next__ 被调用] current = {self.current}")  # 打印追踪信息，让你看到每次取值
        if self.current <= 0:  # 如果当前值小于等于 0
            print("  [抛出 StopIteration] 没货了，迭代结束")  # 打印结束信息
            raise StopIteration  # 抛出 StopIteration，通知 for 循环结束
        self.current -= 1  # 当前值减 1
        return self.current + 1  # 返回减 1 之前的值（即这一轮应该吐出的值）

# 手动调用迭代器协议，模拟 for 循环
def manual_iterate(obj):  # 定义手动迭代函数
    print("\\n--- 手动调用 iter/next ---")  # 提示信息
    it = iter(obj)  # 调用 iter() 触发 __iter__，得到迭代器
    while True:  # 无限循环，靠 StopIteration 退出
        try:  # 尝试执行
            value = next(it)  # 调用 next() 触发 __next__
            print(f"  拿到值: {value}")  # 打印拿到的值
        except StopIteration:  # 捕获 StopIteration
            print("  收到结束信号，停止")  # 打印停止信息
            break  # 跳出循环

# 判断可迭代对象与迭代器的区别
def check_iterable():  # 定义检查函数
    print("\\n--- 可迭代对象 vs 迭代器 ---")  # 提示信息
    lst = [1, 2, 3]  # 创建一个列表
    print(f"  list 可迭代?   {hasattr(lst, '__iter__')}")  # 检查列表是否有 __iter__（可迭代）
    print(f"  list 是迭代器? {hasattr(lst, '__next__')}")  # 检查列表是否有 __next__（不是迭代器）
    it = iter(lst)  # 从列表获取迭代器
    print(f"  iter(list) 是迭代器? {hasattr(it, '__next__')}")  # 检查迭代器是否有 __next__

# 生成器函数：用 yield 暂停
def my_generator(n):  # 定义生成器函数，参数 n 是产生个数
    for i in range(n):  # 循环 n 次
        print(f"  [生成器 yield] 产生 {i}")  # 打印追踪信息
        yield i  # 暂停并返回 i，next 时从这里恢复

# 主程序入口
if __name__ == "__main__":  # main 守卫
    print("=" * 50)  # 分隔线
    print("迭代器原理演示")  # 标题
    print("\\n【1】for 循环背后发生了什么：")  # 提示
    cd = Countdown(3)  # 创建倒计时对象，从 3 开始
    for x in cd:  # for 循环遍历，背后调用 __iter__ 和 __next__
        print(f"  for 循环拿到: {x}")  # 打印 for 拿到的值
    manual_iterate(Countdown(2))  # 手动迭代一个新对象
    check_iterable()  # 检查可迭代性
    print("\\n【2】生成器也是迭代器：")  # 提示
    g = my_generator(3)  # 创建生成器对象（还没执行）
    print(f"  生成器是迭代器? {hasattr(g, '__next__')}")  # 检查生成器是否有 __next__
    for x in g:  # 遍历生成器
        print(f"  for 拿到: {x}")  # 打印
    print("\\n【3】迭代器只能前进，不能回退：")  # 提示
    it = iter([10, 20, 30])  # 从列表创建迭代器
    print(f"  第一次 next: {next(it)}")  # 取第一个值
    print(f"  第二次 next: {next(it)}")  # 取第二个值
    print("  迭代器耗尽后再取会抛 StopIteration")  # 说明一次性特性
`,
  },

  // =========================================================
  // 第23章：异步原理：单线程怎么"同时"做多件事
  // =========================================================
  {
    id: "pyrun-23",
    group: "性能与并发原理",
    icon: "🔄",
    title: "异步原理：单线程怎么“同时”做多件事",
    content: `## 一句话先说透

**异步编程**的核心思想是：**当一个任务在等待 IO（比如网络响应）时，不要傻等，先去干别的活，等 IO 好了再回来继续**。这样单线程也能"同时"处理很多任务，效率大幅提升。Python 里用 \`asyncio\` 库和 \`async/await\` 语法来实现。

> 🎯 大白话：异步就像在厨房做饭。你烧上水后不用死盯着，可以转身去切菜；菜切到一半水开了，你回来下面条，下面的时候又能去调酱汁。**一个人（单线程）同时推进好几道菜**，全靠"等待时切换任务"。

## 同步 vs 异步：生活例子

先看一个最直观的对比。

### 同步做饭（串行）

\`\`\`
1. 烧水（等 5 分钟，啥也不干）
2. 切菜（3 分钟）
3. 下面（等 3 分钟，啥也不干）
4. 调酱（2 分钟）
总计：13 分钟
\`\`\`

### 异步做饭（并发）

\`\`\`
1. 烧水（开始烧，不盯着）→ 切菜（3 分钟）→ 调酱（2 分钟）
2. 水开了 → 下面（开始煮，不盯着）→ 切剩下的菜
3. 面好了 → 装盘
总计：约 6 分钟
\`\`\`

区别在哪？**等待的时候去做别的事**。这就是异步的精髓。

## 事件循环（Event Loop）是什么

事件循环是异步编程的"总调度"，它是一个**不断循环的调度器**：

1. 看看有没有"准备好"的任务（IO 完成了、定时器到了）。
2. 有就把控制权交给那个任务，让它跑一段。
3. 任务遇到 \`await\`（等待）就**暂停**，交回控制权。
4. 事件循环继续看下一个准备好的任务。
5. 循环往复，直到所有任务完成。

\`\`\`
事件循环工作流程：
   ┌──────────────────────────────────┐
   │  检查任务队列，谁准备好了？        │
   │  ┌─────────┐                     │
   │  │ 任务A   │ ← IO 完成，可以继续  │
   │  │ 任务B   │ ← 还在等待           │
   │  │ 任务C   │ ← 新加入             │
   │  └─────────┘                     │
   │  把控制权给任务A，让它跑一段       │
   │  任务A 遇到 await，暂停，交回      │
   │  继续检查下一个...                │
   └──────────────────────────────────┘
\`\`\`

> 🎯 大白话：事件循环就像饭店的**前台经理**。他盯着所有桌子的状态，谁的水壶响了（IO 完成）就去处理谁。一个桌子点单时需要等菜（await），他不会傻站着，而是去看别的桌子。

## 协程：可以暂停的函数

普通函数一旦调用就**一路跑到底**，中间不能暂停。**协程**是特殊的函数，可以在执行中途**暂停**，过一会儿再**恢复**。

Python 里用 \`async def\` 定义协程：

\`\`\`python
async def fetch(url):
    print("开始请求")
    await asyncio.sleep(1)   # 暂停 1 秒，期间可以干别的
    print("请求完成")
    return "数据"
\`\`\`

注意几个关键点：

- \`async def\` 定义的函数，**调用后不会立即执行**，而是返回一个"协程对象"。
- 必须用 \`await\` 或在事件循环里才能真正运行。
- \`await\` 后面跟的必须是"可等待对象"（协程、Task、Future）。

\`\`\`python
async def fetch(url):
    return "数据"

coro = fetch("http://x")   # 只是创建协程对象，还没执行！
print(type(coro))           # <class 'coroutine'>
# 要执行它，必须 await coro 或 asyncio.run(coro)
\`\`\`

## async/await 的本质

\`async\` 和 \`await\` 是协程的语法糖，本质是：

- **\`async def\`**：把函数标记为协程。调用它返回协程对象，而不是直接执行。
- **\`await\`**：暂停当前协程，把控制权交回事件循环。等后面的可等待对象完成后，再恢复当前协程，并拿到结果。

\`\`\`python
async def task():
    result = await some_io()   # 暂停，等 some_io 完成
    # some_io 完成后，这里才继续执行
    return result
\`\`\`

可以理解为：\`await\` 就是**"我先歇会儿，你忙完了叫我"**。

### await 做了什么

当协程执行到 \`await\`：

1. 当前协程**暂停**，状态（局部变量、执行位置）保存起来。
2. 控制权交回**事件循环**。
3. 事件循环去跑别的就绪任务。
4. 等 \`await\` 后面的操作完成，事件循环把当前协程**恢复**，把结果交给它。

这就是协程能"同时"做多件事的秘密——**不是真的同时执行，而是快速在多个任务间切换**。

## 单线程并发的秘密：IO 时切换任务

异步并发的核心：**IO 等待时不闲着，去跑别的任务**。

\`\`\`python
import asyncio

async def fetch(name, seconds):
    print(f"{name} 开始")
    await asyncio.sleep(seconds)   # 模拟 IO 等待，此时释放控制权
    print(f"{name} 完成")
    return name

async def main():
    # 串行：一个等完再下一个
    await fetch("A", 1)   # 等 1 秒
    await fetch("B", 1)   # 再等 1 秒
    await fetch("C", 1)   # 再等 1 秒
    # 总共 3 秒

    # 并发：同时启动，IO 时切换
    await asyncio.gather(
        fetch("A", 1),
        fetch("B", 1),
        fetch("C", 1),
    )
    # 总共约 1 秒
\`\`\`

串行用时 3 秒，并发用时 1 秒——**单线程也能 3 倍提速**，就是因为等待时切换了任务。

## asyncio 的工作流程

用 \`asyncio\` 写异步代码的标准流程：

\`\`\`python
import asyncio

# 1. 定义协程
async def do_work(name):
    await asyncio.sleep(1)
    return f"{name} 完成"

# 2. 定义主协程，调度其他协程
async def main():
    # 用 create_task 或 gather 并发执行
    results = await asyncio.gather(
        do_work("A"),
        do_work("B"),
    )
    print(results)

# 3. 启动事件循环
asyncio.run(main())
\`\`\`

### 关键 API

| API | 作用 |
| --- | --- |
| \`asyncio.run(coro)\` | 启动事件循环，运行主协程 |
| \`await coro\` | 等待协程完成，拿到结果 |
| \`asyncio.create_task(coro)\` | 把协程包装成 Task，立即调度 |
| \`asyncio.gather(*coros)\` | 并发运行多个协程，等全部完成 |
| \`asyncio.sleep(n)\` | 异步休眠（不阻塞，让出控制权） |
| \`asyncio.wait_for(coro, timeout)\` | 给协程加超时 |

### create_task vs 直接 await

\`\`\`python
# 直接 await：串行，一个做完再做下一个
await fetch("A", 1)
await fetch("B", 1)
# 总共 2 秒

# create_task：并发，两个任务同时跑
task_a = asyncio.create_task(fetch("A", 1))
task_b = asyncio.create_task(fetch("B", 1))
await task_a
await task_b
# 总共约 1 秒
\`\`\`

\`create_task\` 会立即把协程加入事件循环调度，所以两个任务"同时"开始了。\`await\` 只是等它们完成。

## 异步 vs 多线程：什么时候用哪个

两者都能做 IO 并发，但机制不同：

| 方面 | asyncio | threading |
| --- | --- | --- |
| 并发模型 | 协作式（任务主动让出） | 抢占式（OS 调度） |
| 切换成本 | 极低（用户态） | 较高（内核态） |
| 数量上限 | 可轻松上万 | 几百到几千 |
| 数据安全 | 不用加锁（单线程） | 需要加锁（共享内存） |
| 学习成本 | 较高（async/await 传染性） | 较低 |
| 生态支持 | 需要异步库 | 同步库即可 |

经验法则：

- **高并发 IO（成千上万连接）**：用 asyncio（如 WebSocket、聊天服务器）。
- **普通 IO 并发（几十个）**：多线程更简单（爬虫、批量请求）。
- **CPU 密集型**：两者都不行，用 multiprocessing。

## 异步的"传染性"

一旦用了 \`async\`，调用链上所有函数都得是 \`async\`，这就是"传染性"：

\`\`\`python
import asyncio
async def fetch_data():      # 异步
    await db.query()          # db.query 也得是 async

async def handle_request():  # 异步
    data = await fetch_data() # 被 fetch_data 传染

async def main():            # 异步
    await handle_request()    # 传染到 main

asyncio.run(main())           # 在事件循环里启动
\`\`\`

在同步函数里直接 \`await\` 会报错，必须整个调用链都异步化。这是 asyncio 上手的主要难点。

## 常见误区

### 误区一："asyncio 是多线程"

❌ 错。asyncio 默认在**单线程**里跑，靠事件循环切换任务，不是多线程。

### 误区二："await sleep 会阻塞整个程序"

❌ 错。\`await asyncio.sleep()\` 会**让出控制权**，事件循环去跑别的任务。而 \`time.sleep()\` 才是真正阻塞。

### 误区三："异步一定比同步快"

❌ 不一定。如果任务全是 CPU 计算（没有 IO 等待），异步反而更慢（事件循环有开销）。异步的优势只在**有大量 IO 等待**时才体现。

## 本节代码演示

下面的代码用 \`asyncio\` 做一个对比实验：

1. **串行 await**：三个各耗时 0.5 秒的"IO 任务"一个接一个跑，预期约 1.5 秒。
2. **并发 gather**：三个任务同时启动，IO 等待时切换，预期约 0.5 秒。

运行后对比耗时，你就能看到单线程并发的威力。`,
    code: `# ============================================================
# 第23章代码演示：asyncio 并发 vs 串行性能差异
# ============================================================
# 这个实验对比两种执行方式：
#   - 串行 await：一个任务做完再做下一个，总耗时 = 各任务耗时之和
#   - 并发 gather：同时启动多个任务，IO 等待时切换，总耗时 ≈ 最慢的任务
# 用 asyncio.sleep 模拟网络/磁盘 IO 等待

import asyncio  # 导入异步 IO 标准库
import time     # 导入时间模块，用于计时

# 模拟一个 IO 操作（如发起网络请求）
async def fetch_data(name, seconds):  # 定义异步函数 fetch_data，name 是任务名，seconds 是模拟耗时
    print(f"  [{name}] 开始请求，需要 {seconds} 秒")  # 打印开始信息
    await asyncio.sleep(seconds)  # await 暂停当前协程，让出 CPU，seconds 秒后恢复
    print(f"  [{name}] 请求完成")  # 打印完成信息
    return f"{name}的数据"  # 返回模拟结果

# 串行执行：一个接一个 await
async def run_serial():  # 定义串行异步函数
    print("--- 串行执行 3 个任务 ---")  # 提示
    start = time.time()  # 记录开始时间
    results = []  # 创建结果列表
    results.append(await fetch_data("任务A", 0.5))  # 串行 await 第一个任务，必须等它完成才继续
    results.append(await fetch_data("任务B", 0.5))  # 串行 await 第二个任务
    results.append(await fetch_data("任务C", 0.5))  # 串行 await 第三个任务
    elapsed = time.time() - start  # 计算总耗时
    print(f"  串行总耗时: {elapsed:.3f} 秒")  # 打印总耗时
    return results  # 返回结果列表

# 并发执行：同时启动，IO 时切换
async def run_concurrent():  # 定义并发异步函数
    print("--- 并发执行 3 个任务 ---")  # 提示
    start = time.time()  # 记录开始时间
    tasks = [  # 创建任务列表
        asyncio.create_task(fetch_data("任务A", 0.5)),  # 创建任务 A 并立即调度
        asyncio.create_task(fetch_data("任务B", 0.5)),  # 创建任务 B 并立即调度
        asyncio.create_task(fetch_data("任务C", 0.5)),  # 创建任务 C 并立即调度
    ]  # 闭合任务列表，此时 3 个任务都已注册到事件循环等待执行
    results = await asyncio.gather(*tasks)  # gather 并发等待所有任务完成，按顺序收集结果
    elapsed = time.time() - start  # 计算总耗时
    print(f"  并发总耗时: {elapsed:.3f} 秒")  # 打印总耗时
    return results  # 返回结果列表

# 主协程：串起两组实验
async def main():  # 定义主协程
    print("=" * 50)  # 分隔线
    print("asyncio 并发 vs 串行对比")  # 标题
    print("\\n【1】串行 await：")  # 提示
    await run_serial()  # 执行串行实验
    print("\\n【2】并发 gather：")  # 提示
    await run_concurrent()  # 执行并发实验
    print("\\n结论：串行约 1.5 秒，并发约 0.5 秒。")  # 打印结论
    print("      单线程也能并发：await 让出 CPU，事件循环去跑别的任务。")  # 打印结论续

# 程序入口
if __name__ == "__main__":  # main 守卫
    asyncio.run(main())  # 启动事件循环，运行主协程直到完成
`,
  },

  // =========================================================
  // 第24章：import 机制：模块怎么被加载
  // =========================================================
  {
    id: "pyrun-24",
    group: "性能与并发原理",
    icon: "🚀",
    title: "import 机制：模块怎么被加载",
    content: `## 一句话先说透

当你写 \`import os\` 时，Python 并不是每次都去硬盘上找文件、重新执行一遍。它有一套完整的流程：**先查缓存（sys.modules）→ 没有就按搜索路径（sys.path）找文件 → 找到后编译成字节码 → 执行模块代码 → 缓存起来**。之后再 import 同一个模块，直接用缓存，不会重复执行。

> 🎯 大白话：import 就像去图书馆借书。先查借阅目录（sys.modules）看这本书借没借过；没借过就去书架（sys.path）找，找到后复印一份存档（__pycache__），下次再要直接看复印件，不用重新跑书架。

## import 做了什么

一行 \`import xxx\` 背后其实做了四件事：

\`\`\`
1. 查找：在 sys.modules 缓存里找，找不到就按 sys.path 搜索
2. 编译：找到 .py 文件后，编译成字节码（.pyc）
3. 执行：运行模块顶层代码，生成模块对象
4. 缓存：把模块对象存入 sys.modules，字节码存入 __pycache__
\`\`\`

下次再 import 同一个模块时，**第 1 步就直接命中缓存，跳过 2、3、4**。这就是为什么模块顶层代码只会执行一次。

\`\`\`python
# mymod.py
print("模块被加载了！")   # 这行只会打印一次
value = 42

# main.py
import mymod   # 打印 "模块被加载了！"
import mymod   # 什么都不打印（命中缓存）
import mymod   # 还是什么都不打印
\`\`\`

## sys.modules 缓存机制

\`sys.modules\` 是一个**字典**，记录了所有已加载的模块。key 是模块名，value 是模块对象。

\`\`\`python
import sys
print(type(sys.modules))   # <class 'dict'>
print('os' in sys.modules)  # True，os 已加载

import json
print('json' in sys.modules)  # True，刚导入

# 看模块对象
import os
print(sys.modules['os'] is os)   # True，就是同一个对象
\`\`\`

### 缓存的意义

| 好处 | 说明 |
| --- | --- |
| 避免重复执行 | 模块顶层代码只跑一次 |
| 保证唯一性 | 全局只有一个模块对象 |
| 提速 | 第二次 import 几乎零成本 |

### 缓存的副作用

- 修改模块文件后，**不重启解释器，import 不会重新加载**（命中缓存）。
- 想强制重新加载，用 \`importlib.reload(mod)\`。
- 这也是 Jupyter Notebook 里改了模块代码却"不生效"的常见原因。

\`\`\`python
import mymod          # 加载一次
import mymod          # 命中缓存，不重新加载
import importlib
importlib.reload(mymod)   # 强制重新加载
\`\`\`

## 模块搜索路径 sys.path

当 \`sys.modules\` 里找不到模块时，Python 就按 \`sys.path\` 列表里的目录顺序查找：

\`\`\`python
import sys
for p in sys.path:
    print(p)
\`\`\`

典型内容：

\`\`\`
1. 当前脚本所在目录（或交互模式的当前目录）
2. PYTHONPATH 环境变量里的目录
3. 标准库目录
4. 第三方包目录（site-packages）
\`\`\`

### sys.path 的组成

| 位置 | 来源 | 说明 |
| --- | --- | --- |
| 第一项 | 当前目录 | 运行脚本所在的目录 |
| 中间项 | PYTHONPATH | 环境变量自定义的路径 |
| 后面项 | 标准库 | Python 自带的库 |
| 最后项 | site-packages | pip 安装的第三方包 |

### 自定义搜索路径

\`\`\`python
import sys
sys.path.insert(0, '/my/custom/path')   # 加到最前面，优先查找
import my_module                          # 会从 /my/custom/path 找
\`\`\`

> 🎯 大白话：\`sys.path\` 就是一串书架编号。Python 找书时按编号顺序一个个翻，第一个翻到的就用。所以**靠前的路径优先级更高**。

### 命名陷阱

如果你的文件名和标准库重名（比如 \`math.py\`），因为当前目录在 \`sys.path\` 最前面，你的文件会**遮蔽**标准库：

\`\`\`
math.py        # 你自己的文件
import math    # 导入的是你的 math.py，不是标准库！
\`\`\`

新手常踩这个坑，文件名千万别用 \`math.py\`、\`random.py\`、\`os.py\` 这种标准库名。

## __pycache__ 目录

Python 是解释型语言，但**不是纯解释**。它会把源码先编译成"字节码"（一种中间格式），再由虚拟机执行。编译后的字节码存在 \`__pycache__\` 目录里，文件名类似 \`mymod.cpython-311.pyc\`。

### 为什么要有 .pyc

| 作用 | 说明 |
| --- | --- |
| 加速导入 | 下次 import 直接加载 .pyc，跳过编译 |
| 不影响运行 | .py 改了会重新编译 |
| 自动管理 | 不用手动清理 |

### 什么时候重新编译

Python 会比较 \`.py\` 文件的**修改时间**和 \`.pyc\` 的时间戳：

- \`.py\` 比 \`.pyc\` 新 → 重新编译，覆盖 \`.pyc\`
- \`.pyc\` 比 \`.py\` 新 → 直接用 \`.pyc\`

所以修改源码后，下次 import 会自动重新编译，不用手动删 \`__pycache__\`。

\`\`\`bash
# 项目里通常会 gitignore 这个目录
__pycache__/
*.pyc
\`\`\`

## import 的完整流程图

\`\`\`
import mymod
    │
    ▼
┌─────────────────────────┐
│ mymod 在 sys.modules?    │
└─────────────────────────┘
    │ 是                    │ 否
    ▼                       ▼
返回缓存对象            按 sys.path 查找 mymod.py
                            │
                            ▼ 找到
                    ┌──────────────┐
                    │ 有 .pyc 且新? │
                    └──────────────┘
                        │ 是        │ 否
                        ▼           ▼
                    加载 .pyc    编译 .py → .pyc
                        │           │
                        └─────┬─────┘
                              ▼
                       执行模块顶层代码
                              │
                              ▼
                    创建模块对象，存入 sys.modules
                              │
                              ▼
                       返回模块对象
\`\`\`

## 导入的几种写法

\`\`\`python
# 1. 导入整个模块
import os
os.getcwd()

# 2. 导入模块并起别名
import numpy as np
np.array([1, 2])

# 3. 从模块导入特定名字
from os import getcwd
getcwd()

# 4. 从模块导入多个名字
from os import getcwd, listdir, mkdir

# 5. 导入模块所有名字（不推荐，污染命名空间）
from os import *
\`\`\`

| 写法 | 优点 | 缺点 |
| --- | --- | --- |
| \`import mod\` | 命名清晰 | 每次要写模块名前缀 |
| \`import mod as m\` | 简短 | 别名要约定 |
| \`from mod import name\` | 用起来方便 | 可能同名冲突 |
| \`from mod import *\` | 最省事 | 污染命名空间，不推荐 |

## 模块 vs 包

- **模块（module）**：一个 \`.py\` 文件就是一个模块。
- **包（package）**：一个目录，里面有 \`__init__.py\`（Python 3.3+ 可以没有），包含多个模块。

\`\`\`
mypackage/           # 包
    __init__.py
    utils.py         # 模块 mypackage.utils
    models/
        __init__.py
        user.py      # 模块 mypackage.models.user
\`\`\`

\`\`\`python
import mypackage.utils
from mypackage.models import user
\`\`\`

## 导入钩子（Import Hooks）

Python 的 import 机制是**可扩展**的。通过 \`sys.meta_path\` 可以注册"导入钩子"，自定义模块查找逻辑。这是高级用法，很多黑科技基于它：

- 从 zip 文件、网络加载模块
- 导入时自动翻译（如 Hy 语言）
- 虚拟文件系统

\`\`\`python
import sys
print(sys.meta_path)   # 默认有三个查找器
# [BuiltinImporter, FrozenImporter, PathFinder]
\`\`\`

| 默认查找器 | 负责找什么 |
| --- | --- |
| BuiltinImporter | 内置模块（如 sys、builtins） |
| FrozenImporter | 冻结模块（编译进解释器的） |
| PathFinder | 按 sys.path 找 .py 文件 |

平时我们 import 的第三方库基本都是 PathFinder 找到的。

## 常见问题

### Q1：循环导入怎么办

A 模块 import B，B 又 import A，会报错或部分加载。解决办法：

- 重构代码，把公共部分抽到 C 模块
- 把 import 移到函数内部（延迟导入）
- 调整导入顺序

### Q2：为什么改了模块代码不生效

因为 \`sys.modules\` 缓存了旧版本。重启解释器，或用 \`importlib.reload(mod)\`。

### Q3：\`__name__ == '__main__'\` 是干嘛的

当模块被直接运行时，\`__name__\` 是 \`'__main__'\`；被 import 时是模块名。用这个判断可以做到"直接运行才执行，被导入时不执行"。

\`\`\`python
if __name__ == '__main__':
    # 只有直接运行才跑，被 import 不跑
    main()
\`\`\`

## 本节代码演示

下面的代码会：

1. 打印 \`sys.path\`，看模块搜索路径长什么样。
2. 动态创建一个临时模块文件，观察 **import 前后 \`sys.modules\` 的变化**。
3. 演示重复 import 不会重新执行模块代码（命中缓存）。
4. 用 \`importlib.reload\` 强制重新加载。
5. 查看 \`__pycache__\` 里的字节码文件。

运行后对照输出，你会对 import 的完整流程有清晰的认识。`,
    code: `# ============================================================
# 第24章代码演示：用 sys.modules 观察 import 前后变化
# ============================================================
# 这个 demo 动态创建一个临时模块文件，观察：
#   1. import 前 sys.modules 里没有这个模块
#   2. import 后模块进入缓存
#   3. 再次 import 不会重新执行模块代码（命中缓存）
#   4. importlib.reload 强制重新加载
#   5. __pycache__ 里生成字节码文件

import sys        # 导入系统模块，访问 sys.modules 和 sys.path
import os         # 导入操作系统模块，用于文件操作
import importlib  # 导入 importlib，用于 reload
import shutil     # 导入文件删除工具，用于清理临时目录

# 临时目录常量，存放动态创建的模块
TMP_DIR = "/tmp/_pyrun_demo"  # 定义临时目录路径常量

# 展示模块搜索路径
def show_sys_path():  # 定义函数，打印 sys.path
    print("--- sys.path 模块搜索路径 ---")  # 提示
    for i, p in enumerate(sys.path):  # 遍历搜索路径，带索引
        print(f"  [{i}] {p}")  # 打印每条路径

# 判断模块是否已加载到缓存
def is_loaded(name):  # 定义函数，判断模块是否在缓存中
    return name in sys.modules  # 返回 name 是否在 sys.modules 字典里

# 演示 import 缓存机制
def demo_import_cache():  # 定义函数，演示 import 缓存
    print("\\n--- import 缓存机制演示 ---")  # 提示
    os.makedirs(TMP_DIR, exist_ok=True)  # 创建临时目录，已存在不报错
    module_path = os.path.join(TMP_DIR, "mymod.py")  # 拼接模块文件完整路径
    with open(module_path, "w") as f:  # 打开模块文件写入
        f.write('value = 42\\n')  # 写入一个模块级变量 value = 42
        f.write('def hello():\\n')  # 写入函数定义首行
        f.write('    return "hi from mymod"\\n')  # 写入函数体，返回字符串
    if TMP_DIR not in sys.path:  # 如果临时目录不在搜索路径
        sys.path.insert(0, TMP_DIR)  # 插到最前面，让 import 能找到 mymod
    sys.pycache_prefix = None  # 重置字节码缓存前缀，让 __pycache__ 写到模块旁边（便于演示）
    print(f"导入前：'mymod' 已加载? {is_loaded('mymod')}")  # 打印导入前状态
    import mymod  # 导入 mymod，触发查找+编译+执行+缓存
    print(f"导入后：'mymod' 已加载? {is_loaded('mymod')}")  # 打印导入后状态
    print(f"  mymod.value = {mymod.value}")  # 访问模块变量 value
    print(f"  mymod.hello() = {mymod.hello()}")  # 调用模块函数 hello
    print("\\n修改模块文件后再次 import（命中缓存，不重新执行）：")  # 提示
    with open(module_path, "w") as f:  # 重新写模块文件
        f.write('value = 999\\n')  # 把 value 改成 999
    import mymod  # 再次 import，命中 sys.modules 缓存，不重新执行
    print(f"  再次 import 后 mymod.value = {mymod.value}（仍是旧值 42）")  # 打印，证明没重新执行
    importlib.reload(mymod)  # 强制重新加载模块，重新执行源码
    print(f"  reload 后 mymod.value = {mymod.value}（变成新值 999）")  # 打印，证明重新执行了

# 展示 __pycache__ 字节码缓存
def show_pycache():  # 定义函数，展示 __pycache__
    print("\\n--- __pycache__ 字节码缓存 ---")  # 提示
    cache_dir = os.path.join(TMP_DIR, "__pycache__")  # 拼接缓存目录路径
    if os.path.exists(cache_dir):  # 如果缓存目录存在
        files = os.listdir(cache_dir)  # 列出目录下所有文件
        print(f"  缓存目录: {cache_dir}")  # 打印缓存目录路径
        for fn in files:  # 遍历文件
            print(f"    {fn}")  # 打印每个 .pyc 文件名
    else:  # 否则
        print("  （未发现缓存目录）")  # 提示未发现

# 清理临时文件
def cleanup():  # 定义清理函数
    if os.path.exists(TMP_DIR):  # 如果临时目录存在
        shutil.rmtree(TMP_DIR)  # 递归删除整个目录（含 __pycache__）

# 主程序入口
if __name__ == "__main__":  # main 守卫
    print("=" * 50)  # 分隔线
    print("import 机制演示")  # 标题
    show_sys_path()  # 展示搜索路径
    demo_import_cache()  # 演示缓存机制
    show_pycache()  # 展示字节码缓存
    cleanup()  # 清理临时文件
    print("\\n结论：import 先查 sys.modules 缓存，没有就按 sys.path 查找，")  # 打印结论第一句
    print("      找到后编译、执行模块代码，缓存到 sys.modules 和 __pycache__。")  # 打印结论第二句
`,
  },
];
