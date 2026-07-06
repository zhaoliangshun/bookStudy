// =============================================================
// Python 多线程入门（pythread2）—— 第二批章节
// -------------------------------------------------------------
// 章节 6-10：threading 基础 + 线程同步入门
//
// 每个章节包含：
//   id      : 唯一标识
//   group   : 分组名（threading 基础 / 线程同步）
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解（含表格、代码块、列表、比喻）
//   code    : 可运行、带详细中文注释的 Python 示例代码
//
// 代码运行环境约束：
//   - 用 python3 直接运行
//   - 仅使用 Python 标准库（threading, time, os, queue 等）
//   - 通过 print 输出结果
//   - 代码必须是单文件可独立运行的脚本
// =============================================================

export const chapters = [
  // =========================================================
  // 第六章：线程的生命周期
  // =========================================================
  {
    id: "py2-06",
    group: "threading 基础",
    icon: "🔄",
    title: "线程的生命周期：start / run / join / is_alive",
    content: `## 一、从一个生活比喻说起

把线程想象成公司里的一个**员工**，从入职到离职要经历几个阶段：

1. **新建**：你刚把员工招进来（\`Thread()\` 创建对象），还没让他干活。
2. **就绪**：员工准备好了，等老板安排（已经调用 \`start()\`，等 CPU 调度）。
3. **运行**：员工正在干活（拿到了 CPU 时间片，正在执行代码）。
4. **阻塞**：员工在等某个东西（等 IO、等锁、\`time.sleep()\`），暂时干不了活。
5. **终止**：员工离职了（线程函数执行完毕，线程退出）。

线程在这 5 个状态间不断切换，直到最终终止。理解状态转换，是掌握线程的基础。

## 二、线程的 5 个状态

\`\`\`text
       创建 Thread()
          │
          │  start()
          ↓
   ┌──────────┐  调度获得CPU  ┌──────┐
   │   就绪   │ ────────────→ │ 运行 │
   └──────────┘               └──────┘
        ↑                        │
        │ 时间片用完 / yield      │ sleep / IO等待 / 等锁
        │                        ↓
        │                     ┌──────┐
        └──────────────────── │ 阻塞 │
           等待结束,资源就绪   └──────┘
                                 │
                                 │ 等待结束
                                 ↓
                              ┌──────┐
                              │ 终止 │  线程函数返回
                              └──────┘
\`\`\`

| 状态 | 说明 | 触发条件 |
|------|------|----------|
| 新建（New） | 已创建对象，未启动 | \`t = Thread(target=...)\` |
| 就绪（Ready） | 等待 CPU 调度 | 调用了 \`start()\` |
| 运行（Running） | 正在执行 | 调度器选中该线程 |
| 阻塞（Blocked） | 暂停执行，等待资源 | \`sleep()\`、\`acquire()\`、IO 等 |
| 终止（Terminated） | 线程退出 | 函数返回或抛异常 |

## 三、start()：启动线程

\`start()\` 的作用是让线程进入"就绪"状态，等待 CPU 调度后执行 \`run()\` 方法。

\`\`\`python
import threading

def worker():
    print("子线程运行中")

t = threading.Thread(target=worker)
t.start()   # 启动线程，进入就绪状态
\`\`\`

**关键约束**：

- 一个线程的 \`start()\` **只能调用一次**！第二次会抛 \`RuntimeError: threads can only be started once\`。
- 如果想再跑一次，必须重新 \`Thread()\` 创建一个新对象。

\`\`\`python
t = threading.Thread(target=worker)
t.start()
t.start()   # ❌ RuntimeError！
\`\`\`

为什么这样设计？因为线程结束后操作系统资源已经回收，没法"重启"。就像员工离职了不能直接复活，得重新招聘一个。

## 四、run()：线程执行的代码

\`run()\` 是线程真正执行的代码。默认实现会调用你传入的 \`target\` 函数。

**重要**：**永远不要直接调用 \`t.run()\`**！直接调用会在**当前线程**同步执行，相当于普通函数调用，根本不会创建新线程：

\`\`\`python
t = threading.Thread(target=worker)
t.run()    # ❌ 在当前线程执行，没有创建新线程
t.start()  # ✅ 启动新线程，由新线程调用 run()
\`\`\`

如果你需要自定义线程行为，可以继承 \`Thread\` 重写 \`run()\`：

\`\`\`python
class MyThread(threading.Thread):
    def run(self):
        print(f"{self.name} 自定义 run 执行")

t = MyThread()
t.start()   # 会调用重写的 run()
\`\`\`

## 五、join(timeout)：等待线程结束

\`join()\` 让主线程**阻塞等待**子线程执行完毕，再继续往下走。

\`\`\`text
主线程:  ────────┐
                 │ join() 阻塞
                 │
子线程:    ──────────→  执行完毕
主线程:                       ──────→  继续
\`\`\`

| 用法 | 说明 |
|------|------|
| \`t.join()\` | 一直等，直到 \`t\` 结束 |
| \`t.join(timeout=2)\` | 最多等 2 秒，超时不再等 |
| \`t.join(0.5)\` | 位置参数也行，等 0.5 秒 |

**常见用法**：等待所有子线程完成再退出主线程：

\`\`\`python
threads = [Thread(target=task) for _ in range(5)]
for t in threads:
    t.start()
for t in threads:
    t.join()      # 等每个线程结束
print("所有子线程都完成了")
\`\`\`

\`join(timeout)\` 超时后**不会杀掉**子线程，子线程仍在后台跑。只是主线程不再等了。

## 六、is_alive()：判断线程是否还在运行

\`is_alive()\` 返回 \`True\` 表示线程**正在运行或就绪或阻塞**（即"还没终止"）；返回 \`False\` 表示线程已终止。

\`\`\`python
t = Thread(target=task)
print(t.is_alive())   # False，还没 start
t.start()
print(t.is_alive())   # True，运行中
t.join()
print(t.is_alive())   # False，已结束
\`\`\`

注意：\`is_alive()\` 返回 \`True\` 不一定代表"正在执行"，也可能在 \`sleep\` 或等锁。它只是说"线程没结束"。

## 七、demo 1：用 is_alive() 观察状态变化

下面这个 demo 创建一个子线程，在主线程里多次调用 \`is_alive()\` 观察它的状态变化：

- \`start()\` 之前：\`is_alive()\` 是 \`False\`
- \`start()\` 之后：\`is_alive()\` 是 \`True\`（线程在跑）
- \`join()\` 之后：\`is_alive()\` 是 \`False\`（线程结束）

运行后你应该看到 \`is_alive()\` 在不同时刻返回不同的值，直观地反映线程状态。

## 八、demo 2：join(timeout) 超时演示

下面这个 demo 启动一个要跑 3 秒的子线程，主线程用 \`t.join(timeout=1)\` 只等 1 秒：

- 1 秒后超时，主线程继续执行
- 但子线程还在后台运行
- 主线程结束时，Python 解释器会等所有非守护线程结束才真正退出

通过这个 demo 你能清楚看到 \`join(timeout)\` 的行为：**超时是放弃等待，不是杀死子线程**。

## 九、小结

| 方法 | 作用 | 注意 |
|------|------|------|
| \`start()\` | 启动线程 | 只能调用一次 |
| \`run()\` | 线程执行体 | 不要直接调用 |
| \`join(timeout)\` | 等待线程结束 | 超时不杀线程 |
| \`is_alive()\` | 判断是否还在运行 | \`True\` 不等于"在执行" |

掌握这 4 个方法，你就能基本控制线程的"生老病死"。下一章我们会讲怎么给线程传参数、怎么拿到结果。`,
    code: `# -*- coding: utf-8 -*-
# 第六章 demo：线程的生命周期 start / run / join / is_alive
# 演示线程的 5 个状态、is_alive 观察状态、join 阻塞等待、join(timeout) 超时
import threading
import time

print("=" * 60)
print("第六章 demo：线程的生命周期")
print("=" * 60)


# ===== demo 1：用 is_alive() 观察线程状态变化 =====
print("\\n[demo 1] 用 is_alive() 观察线程状态变化：")


def worker(name, seconds):
    """子线程要执行的函数：sleep 一段时间模拟干活。"""
    print(f"    [{name}] 子线程开始执行，需要 {seconds} 秒")
    time.sleep(seconds)                       # 模拟耗时操作（阻塞状态）
    print(f"    [{name}] 子线程执行完毕")


# 创建线程对象（此时是"新建"状态，还没启动）
t = threading.Thread(target=worker, args=("工作线程A", 1))
print(f"    start() 之前 is_alive: {t.is_alive()}")   # False：还没启动

# 启动线程（进入"就绪"状态，等待 CPU 调度后变"运行"）
t.start()
print(f"    start() 之后 is_alive: {t.is_alive()}")   # True：正在运行（或就绪）

# 主线程稍微等一下，让子线程跑一会儿（此时子线程在 sleep，处于阻塞状态）
time.sleep(0.3)
print(f"    子线程 sleep 中 is_alive: {t.is_alive()}")  # True：阻塞也是"活着"

# 主线程等待子线程结束
t.join()
print(f"    join() 之后 is_alive: {t.is_alive()}")   # False：已终止


# ===== demo 2：join(timeout) 超时演示 =====
print("\\n[demo 2] join(timeout) 超时演示：")

# 创建一个要跑 3 秒的子线程
t2 = threading.Thread(target=worker, args=("工作线程B", 3))
t2.start()
print(f"    子线程 B 已启动，需要 3 秒才能结束")

# 主线程只等 1 秒
start = time.time()
t2.join(timeout=1)                       # 最多等 1 秒
elapsed = time.time() - start
print(f"    join(timeout=1) 返回，已等 {elapsed:.2f} 秒")
print(f"    此时 t2.is_alive(): {t2.is_alive()}")   # True：子线程还在跑

# 主线程继续干别的事
print("    主线程不等了，继续做其他事...")
time.sleep(0.5)
print(f"    0.5 秒后 t2.is_alive(): {t2.is_alive()}")   # 还是 True

# 最终再等它结束（不指定 timeout 会一直等）
print("    主线程最终 join() 等待 B 结束...")
t2.join()
print(f"    t2.is_alive(): {t2.is_alive()}（B 已结束）")


# ===== 验证 start() 只能调用一次 =====
print("\\n[补充] 验证 start() 只能调用一次：")
t3 = threading.Thread(target=worker, args=("线程C", 0))
t3.start()
t3.join()
try:
    t3.start()    # 再次调用 start()
except RuntimeError as e:
    print(f"    再次 start() 报错: {e}")
    print("    → 结论：线程结束后不能重启，需要重新创建 Thread 对象")

print("\\n" + "=" * 60)
print("生命周期总结：")
print("  新建 → start() → 就绪 → CPU调度 → 运行 → sleep/IO → 阻塞 → 就绪 → ... → 终止")
print("  join() 等待结束，is_alive() 判断是否还在运行")
print("=" * 60)
`,
  },

  // =========================================================
  // 第七章：线程的参数传递与返回值
  // =========================================================
  {
    id: "py2-07",
    group: "threading 基础",
    icon: "📦",
    title: "线程的参数传递与返回值",
    content: `## 一、给线程函数传参数：args 和 kwargs

创建线程时，函数往往需要参数。比如 \`download(url)\` 需要传 URL，\`process(file, mode)\` 需要传文件名和模式。threading 提供两种传参方式：\`args\` 和 \`kwargs\`。

### 1. args：位置参数

\`args\` 是一个**元组**，按位置传给 \`target\` 函数：

\`\`\`python
def download(url, save_path):
    print(f"下载 {url} 到 {save_path}")

t = threading.Thread(target=download, args=("https://example.com", "/tmp/file"))
# 等价于调用 download("https://example.com", "/tmp/file")
t.start()
\`\`\`

注意：**单参数时必须加逗号**：\`args=("url",)\`，否则 \`args\` 就是一个字符串而不是元组。

### 2. kwargs：关键字参数

\`kwargs\` 是一个**字典**，按键名传给函数：

\`\`\`python
t = threading.Thread(
    target=download,
    kwargs={"url": "https://example.com", "save_path": "/tmp/file"}
)
t.start()
\`\`\`

\`args\` 和 \`kwargs\` 可以混用：

\`\`\`python
def task(a, b, c=10, d=20):
    print(a, b, c, d)

t = threading.Thread(target=task, args=(1, 2), kwargs={"c": 3, "d": 4})
# 等价于 task(1, 2, c=3, d=4)
t.start()
\`\`\`

## 二、Thread 不能直接返回值

这是新手最容易踩的坑：**Thread 没有\`get_result()\` 方法**！

\`\`\`python
def compute():
    return 42

t = Thread(target=compute)
t.start()
t.join()
print(t.result)   # ❌ AttributeError，Thread 没这个属性
\`\`\`

为什么？因为线程函数的返回值**被丢弃**了。Thread 设计上不关心返回值，只关心"函数执行完了没"。

## 三、三种获取结果的方式

### 方式 1：修改全局变量（不推荐，仅演示）

\`\`\`python
result = None

def compute():
    global result
    result = 42

t = Thread(target=compute)
t.start()
t.join()
print(result)   # 42
\`\`\`

**问题**：

- 多个线程同时改全局变量会有竞态条件（第 9 章详解）
- 全局变量污染命名空间
- 难以扩展到多线程汇总结果

仅做演示理解原理，**实际不要这么写**。

### 方式 2：修改可变对象（推荐用于简单场景）

Python 中列表、字典是**可变对象**，传给线程函数后，线程对其的修改对主线程可见：

\`\`\`python
def compute(results, idx):
    results[idx] = idx * idx

results = {}
threads = []
for i in range(5):
    t = Thread(target=compute, args=(results, i))
    threads.append(t)
    t.start()

for t in threads:
    t.join()

print(results)   # {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}
\`\`\`

**关键点**：

- 每个线程写**不同的 key**，所以不会有竞态
- 如果多个线程写同一个 key，仍需加锁
- 主线程必须在 \`join()\` 之后再读 \`results\`，否则可能还没写完

### 方式 3：用 queue.Queue 传递结果（推荐）

\`queue.Queue\` 是线程安全的队列，专门为线程间传递数据设计：

\`\`\`python
import queue
import threading

def compute(q, idx):
    q.put(idx * idx)   # 线程把结果放进队列

q = queue.Queue()
threads = [Thread(target=compute, args=(q, i)) for i in range(5)]
for t in threads:
    t.start()
for t in threads:
    t.join()

results = []
while not q.empty():
    results.append(q.get())
print(results)   # [0, 1, 4, 9, 16]
\`\`\`

\`Queue\` 内部已经加了锁，多线程 \`put/get\` 都安全。后续章节会详解。

## 四、实际开发建议

如果你需要"提交任务，拿到结果"，**不要直接用 \`Thread\`**，用**线程池** \`concurrent.futures.ThreadPoolExecutor\`：

\`\`\`python
from concurrent.futures import ThreadPoolExecutor

def compute(x):
    return x * x

with ThreadPoolExecutor(max_workers=4) as executor:
    futures = [executor.submit(compute, i) for i in range(5)]
    results = [f.result() for f in futures]   # 直接拿到返回值！

print(results)   # [0, 1, 4, 9, 16]
\`\`\`

线程池支持 \`future.result()\` 直接拿返回值，自动管理线程的创建和回收，是生产环境的首选。本教程后续章节会专门讲。

## 五、demo 1：用 args 和 kwargs 传参

下面这个 demo 展示三种传参方式：

1. 只用 \`args\` 传位置参数
2. 只用 \`kwargs\` 传关键字参数
3. \`args\` + \`kwargs\` 混用

每个线程会打印自己的参数，你可以看到参数确实传进去了。运行结果应该看到三行输出，每行显示不同的参数组合。

## 六、demo 2：用共享 list 收集多个线程的计算结果

下面这个 demo 创建 5 个子线程，每个线程计算一个数的平方，把结果存到一个共享的 \`list\` 里。主线程 \`join()\` 所有子线程后，从 list 中读取结果。

关键点：

- 每个线程往 list 的**不同位置**写入（用 \`results[i] = ...\`），所以不需要加锁
- 主线程必须在所有 \`join()\` 完成后再读 \`results\`，否则可能读到不完整的数据
- 运行结果应该看到 \`[0, 1, 4, 9, 16]\` 这样的列表

## 七、小结

| 传参方式 | 语法 | 适用 |
|----------|------|------|
| \`args\` | \`args=(1, 2)\` | 位置参数 |
| \`kwargs\` | \`kwargs={"x": 1}\` | 关键字参数 |
| 混用 | \`args=(1,), kwargs={"y": 2}\` | 复杂参数 |

| 获取结果方式 | 安全性 | 推荐度 |
|--------------|--------|--------|
| 全局变量 | ❌ 不安全 | 仅演示 |
| 可变对象 | ⚠️ 写不同 key 才安全 | 简单场景可用 |
| \`queue.Queue\` | ✅ 线程安全 | 推荐 |
| 线程池 \`future.result()\` | ✅ 线程安全 | **生产首选** |

下一章我们会讲**守护线程**——一种特殊的线程，主线程退出时它会自动结束。`,
    code: `# -*- coding: utf-8 -*-
# 第七章 demo：线程的参数传递与返回值
# 演示 args/kwargs 传参、Thread 不能返回值、用共享 list 收集结果
import threading
import time

print("=" * 60)
print("第七章 demo：线程的参数传递与返回值")
print("=" * 60)


# ===== demo 1：用 args 和 kwargs 传参 =====
print("\\n[demo 1] 用 args 和 kwargs 传参：")


def task(name, mode, level=1, verbose=False):
    """演示接收各种参数的线程函数。
    - name, mode 是位置参数
    - level, verbose 是关键字参数（带默认值）
    """
    print(f"    [{name}] 收到参数：")
    print(f"        name    = {name!r}")
    print(f"        mode    = {mode!r}")
    print(f"        level   = {level}")
    print(f"        verbose = {verbose}")


# 方式 1：只用 args 传位置参数（按顺序对应 name, mode）
t1 = threading.Thread(
    target=task,
    args=("线程A", "fast"),           # name="线程A", mode="fast"
)
t1.start()
t1.join()

# 方式 2：只用 kwargs 传关键字参数（按键名对应）
t2 = threading.Thread(
    target=task,
    kwargs={                          # 按键名传，顺序无所谓
        "name": "线程B",
        "mode": "slow",
        "level": 5,
        "verbose": True,
    },
)
t2.start()
t2.join()

# 方式 3：args + kwargs 混用（args 传位置参数，kwargs 传关键字参数）
t3 = threading.Thread(
    target=task,
    args=("线程C", "normal"),         # name, mode
    kwargs={"level": 3, "verbose": True},  # 剩下的用 kwargs
)
t3.start()
t3.join()

# 单参数陷阱演示：args=("xxx",) 必须带逗号
print("\\n    [注意] 单参数时 args 必须带逗号：")
print('    args=("url",)   ← 正确：元组')
print('    args=("url")    ← 错误：被当成字符串')


# ===== demo 2：用共享 list 收集多个线程的计算结果 =====
print("\\n[demo 2] 用共享 list 收集多个线程的计算结果：")


def compute_square(n, results, idx):
    """计算 n 的平方，结果存入 results[idx]。
    关键：每个线程写不同位置（不同 idx），所以不需要加锁。
    """
    print(f"    [线程 {idx}] 开始计算 {n} 的平方")
    time.sleep(0.3)                  # 模拟耗时计算
    results[idx] = n * n             # 把结果写到 list 的指定位置
    print(f"    [线程 {idx}] 完成：{n}^2 = {n * n}")


# 预先分配好 list 的长度（用 None 占位），方便用索引赋值
numbers = [0, 1, 2, 3, 4]
results = [None] * len(numbers)      # [None, None, None, None, None]
threads = []

# 为每个数创建一个子线程
for i, n in enumerate(numbers):
    t = threading.Thread(
        target=compute_square,
        args=(n, results, i),        # 传值、结果列表、索引
    )
    threads.append(t)
    t.start()

# 主线程在 join 之前读 results，会看到都是 None（还没算完）
print("\\n    主线程趁子线程还在跑，先看一眼 results：")
print(f"    results = {results}")    # 大概率看到很多 None

# 等所有子线程结束
for t in threads:
    t.join()

# join 完成后，所有结果都已写入 list
print("\\n    所有子线程结束，主线程读取最终结果：")
print(f"    results = {results}")
print(f"    平方和 = {sum(results)}")

# 验证结果正确性
expected = [n * n for n in numbers]
print(f"    期望结果 = {expected}")
print(f"    结果正确：{results == expected}")

# ===== Thread 不能直接返回值的演示 =====
print("\\n[补充] Thread 不能直接返回值：")


def compute():
    """线程函数虽然有 return，但 Thread 不保存返回值。"""
    return 42


t = threading.Thread(target=compute)
t.start()
t.join()
# t 没有任何 "result" 属性可以拿到 42
try:
    _ = t.result
except AttributeError as e:
    print(f"    t.result 报错: {e}")
    print("    → Thread 设计上不保存返回值，需要用共享对象或 Queue 传递结果")

print("\\n" + "=" * 60)
print("参数与返回值总结：")
print("  传参：args（位置）/ kwargs（关键字）/ 混用")
print("  返回值：用共享 list/dict 或 queue.Queue，生产用线程池")
print("=" * 60)
`,
  },

  // =========================================================
  // 第八章：daemon 守护线程
  // =========================================================
  {
    id: "py2-08",
    group: "threading 基础",
    icon: "👻",
    title: "daemon 守护线程",
    content: `## 一、什么是守护线程

想象一下：你是公司老板（主线程），雇了一个保洁阿姨（守护线程）每天定时打扫卫生。某天你决定关门大吉（主线程退出），阿姨的工作自然也就停了——**公司都没了，保洁还有啥意义**？

这就是**守护线程（daemon thread）**：

- 主线程退出时，**所有守护线程会被强制结束**
- 守护线程**不能阻止主程序退出**

与之对应的是**非守护线程（默认）**：

- 主线程必须等所有非守护线程结束，程序才会退出
- 即使主线程的代码跑完了，也要等

## 二、Python 程序的退出条件

Python 解释器退出的条件是：**所有非守护线程都结束**。

\`\`\`text
非守护线程（默认）：       守护线程（daemon=True）：
  主线程                     主线程
    │                          │
    ├─ 子线程A（非守护）       ├─ 子线程C（守护）
    │                          │
    └─ 主线程代码结束          └─ 主线程代码结束
       ↓                         ↓
       等子线程A结束             子线程C被强制结束
       ↓                         ↓
       程序退出                  程序立即退出
\`\`\`

## 三、daemon 属性的设置

守护线程通过 \`daemon=True\` 设置：

\`\`\`python
# 方式 1：创建时指定
t = threading.Thread(target=worker, daemon=True)

# 方式 2：创建后设置
t = threading.Thread(target=worker)
t.daemon = True
t.start()
\`\`\`

**关键约束：\`daemon\` 必须在 \`start()\` 之前设置！**

\`\`\`python
t = threading.Thread(target=worker)
t.start()
t.daemon = True   # ❌ RuntimeError: cannot set daemon status of active thread
\`\`\`

为什么？因为线程一旦启动，操作系统就已经分配资源了，无法改变它的"性质"。

## 四、守护线程的典型用途

守护线程适合"**程序活着它就活，程序退出它就死**"的辅助任务：

| 用途 | 例子 |
|------|------|
| **后台监控** | 定期检查系统状态、内存使用 |
| **心跳信号** | 每隔几秒向服务器报告"我还活着" |
| **日志刷新** | 把内存中的日志定期刷到磁盘 |
| **缓存清理** | 定期清理过期缓存 |
| **统计收集** | 后台累计请求数、错误数 |
| **进度显示** | 命令行旋转进度条、心跳指示器 |

这些任务都有一个共同特点：**它们是辅助性的，没了它们主程序也能正常工作**。所以主程序退出时让它们一起死，是合理的。

## 五、守护线程的注意事项

### 1. 不会执行 finally

守护线程被强制结束时，**不会执行 \`finally\` 块**：

\`\`\`python
def daemon_worker():
    try:
        while True:
            time.sleep(1)
    finally:
        print("清理资源")   # ❌ 主程序退出时这行不会执行！
\`\`\`

### 2. 不会正确释放资源

文件没关闭、数据库连接没释放、锁没解开——这些在守护线程中都是潜在的"坑"。

### 3. 不要用守护线程做关键工作

涉及数据持久化、外部状态修改的任务，**绝对不要**用守护线程。否则程序一退出，可能写到一半的数据损坏了。

## 六、主线程等待 vs 不等待

| 情景 | 结果 |
|------|------|
| 主线程不 \`join\` 守护线程 | 主线程代码跑完，守护线程被强杀 |
| 主线程 \`join()\` 守护线程 | 主线程会等到守护线程结束（如果守护线程有结束） |
| 守护线程是死循环 | 必须主线程不 \`join\`，否则主线程永远等不到 |

实际用法：守护线程通常是死循环（\`while True\`），主线程**不 \`join\` 它**，让它随主程序一起死。

## 七、demo 1：非守护线程 vs 守护线程

下面这个 demo 对比两种线程在主线程退出时的行为差异：

- **非守护线程**：主线程代码结束后，会等它执行完才退出
- **守护线程**：主线程代码结束，立即被强杀，即使它还在 \`sleep\`

运行后你应该看到：非守护线程的 \`finally\` 执行了，守护线程的 \`finally\` 没执行。这就是守护线程的"狠"——直接被杀，没机会收尾。

## 八、demo 2：用守护线程实现后台心跳监控

下面这个 demo 用守护线程实现一个"心跳监控"：

- 主线程模拟主业务（执行 3 秒）
- 守护线程每 0.5 秒打印一次心跳
- 主线程结束时，守护线程自动停止

这是守护线程最经典的用法——后台辅助任务。运行后你会看到心跳日志在主业务期间不断打印，主业务一结束，心跳也立即停止。

## 九、小结

| 属性 | 非守护线程（默认） | 守护线程（daemon=True） |
|------|--------------------|------------------------|
| 主线程退出时 | 等它结束 | 立即强杀 |
| 是否阻止程序退出 | ✅ 阻止 | ❌ 不阻止 |
| \`finally\` 执行 | ✅ 执行 | ❌ 不一定执行 |
| 适用场景 | 关键业务任务 | 辅助/后台任务 |
| \`daemon\` 设置时机 | - | 必须 \`start()\` 前 |

**一句话记忆**：守护线程 = "主程序活着我就活，主程序死我就死"。

下一章我们会进入线程同步的话题，讲讲为什么多线程访问共享数据会出问题。`,
    code: `# -*- coding: utf-8 -*-
# 第八章 demo：daemon 守护线程
# 演示守护线程的特性、非守护 vs 守护的对比、心跳监控的典型用法
import threading
import time

print("=" * 60)
print("第八章 demo：daemon 守护线程")
print("=" * 60)


# ===== demo 1：非守护线程 vs 守护线程 =====
print("\\n[demo 1] 非守护线程 vs 守护线程：")


def worker(name, sleep_sec):
    """模拟一个会执行 try/finally 的线程。"""
    print(f"    [{name}] 开始执行")
    try:
        time.sleep(sleep_sec)        # 模拟干活
        print(f"    [{name}] 正常完成")
    except Exception as e:
        print(f"    [{name}] 抛异常: {e}")
    finally:
        # 关键观察点：守护线程被强杀时，finally 不一定会执行
        print(f"    [{name}] finally 执行（清理资源）")


# 非守护线程（默认 daemon=False）：主线程会等它
t_normal = threading.Thread(
    target=worker,
    args=("非守护线程", 1),
    daemon=False,                    # 显式指定非守护（其实默认就是 False）
)

# 守护线程（daemon=True）：主线程退出时被强杀
t_daemon = threading.Thread(
    target=worker,
    args=("守护线程", 5),             # 要跑 5 秒，但主线程 1 秒后就退出了
    daemon=True,
)

t_normal.start()
t_daemon.start()

# 主线程只等 1 秒，然后退出
print("    [主线程] 主线程开始等待 1 秒...")
time.sleep(1)
print("    [主线程] 主线程代码结束，准备退出")
print("    [主线程] 注意：守护线程 sleep(5) 还没完，但主线程退出会强杀它")

# 注意：主线程不 join t_daemon，否则会一直等
t_normal.join()   # 等非守护线程结束（其实 1 秒已经够了）
# 不 join t_daemon，让它随主线程一起死

print("\\n    [观察] 主线程结束后，你应该看到：")
print("      - 非守护线程的 finally 执行了")
print("      - 守护线程的 finally 没执行（被强杀）")
print("      - 整个程序退出（因为非守护线程都结束了）")


# ===== demo 2：用守护线程实现后台心跳监控 =====
print("\\n[demo 2] 用守护线程实现后台心跳监控：")


def heartbeat(stop_event, interval=0.5):
    """后台心跳线程：每隔 interval 秒打印一次心跳。
    用 Event 控制优雅停止（虽然守护线程被强杀时不一定用得上，
    但养成好习惯，方便非守护场景下使用）。
    """
    count = 0
    while not stop_event.is_set():   # 检查停止信号
        count += 1
        print(f"    [心跳] 第 {count} 次心跳 @{time.strftime('%H:%M:%S')}")
        # wait() 比 sleep() 好：可以立即响应 stop_event
        stop_event.wait(timeout=interval)
    print(f"    [心跳] 收到停止信号，共发送 {count} 次心跳")


# 主业务函数（模拟主线程在干活）
def main_business(duration=3):
    """模拟主业务：执行 duration 秒。"""
    print(f"    [主业务] 开始执行，预计 {duration} 秒")
    for i in range(duration):
        time.sleep(1)
        print(f"    [主业务] 完成第 {i + 1} 秒")
    print("    [主业务] 主业务完成")


# 创建停止信号 Event（线程间通信工具，后续章节详解）
stop_event = threading.Event()

# 创建心跳守护线程
heartbeat_thread = threading.Thread(
    target=heartbeat,
    args=(stop_event,),
    kwargs={"interval": 0.5},
    daemon=True,                    # 守护线程：主线程退出时自动停止
)
heartbeat_thread.start()
print("    [主线程] 心跳守护线程已启动")

# 主线程执行主业务
main_business(3)

# 主业务完成后，发送停止信号（优雅停止心跳）
# 注意：即使不发这个信号，因为心跳线程是守护线程，
# 主线程退出时它也会被强杀
stop_event.set()

# 这里故意不 join heartbeat_thread，演示守护线程的特性
# 如果是普通线程，主线程退出前必须 join，否则程序不会退出
print("    [主线程] 主线程结束，守护心跳线程会随主程序一起退出")

print("\\n" + "=" * 60)
print("守护线程总结：")
print("  - daemon=True 必须在 start() 前设置")
print("  - 主线程退出时守护线程被强杀，finally 不一定执行")
print("  - 适合后台辅助任务：心跳、监控、日志、统计")
print("  - 不要用守护线程做关键数据持久化")
print("=" * 60)
`,
  },

  // =========================================================
  // 第九章：线程安全问题
  // =========================================================
  {
    id: "py2-09",
    group: "线程同步",
    icon: "⚠️",
    title: "线程安全问题：为什么需要同步",
    content: `## 一、从一个售票问题说起

假设有一个演唱会票务系统，剩 100 张票，4 个窗口同时卖票。每个窗口的逻辑都是：

\`\`\`text
1. 查看剩余票数（比如 50）
2. 卖出一张，票数减 1（变成 49）
3. 写回剩余票数
\`\`\`

直觉上没问题，但多线程并发跑时，**可能出大问题**：

\`\`\`text
窗口A: 读到票数=50
                窗口B: 读到票数=50   ← 注意！A 还没写回，B 读到的也是 50
窗口A: 50-1=49，写回 49
                窗口B: 50-1=49，写回 49   ← 期望是 48，实际变成 49
\`\`\`

结果：两张票被卖出，但票数只减了 1。**少卖了一张票的库存**！如果卖出更多，甚至可能出现"票数变成负数"（超卖）。

这就是**线程安全问题**。

## 二、什么是线程安全

**线程安全**：多线程并发访问共享数据时，结果始终正确，不会出现数据丢失、损坏、不一致。

\`\`\`text
线程安全 = 多线程并发执行的结果 == 单线程串行执行的结果
\`\`\`

如果上面那个等式不成立，就是线程不安全。

### 哪些操作是线程安全的？

| 操作 | 是否线程安全 | 原因 |
|------|--------------|------|
| 读取不可变对象 | ✅ 安全 | 没人改它 |
| \`list.append()\` | ✅ 安全（CPython GIL 保证） | 单条字节码原子执行 |
| \`dict.get()\` | ✅ 安全 | 同上 |
| \`count += 1\` | ❌ 不安全 | 读-改-写三步，中间会断 |
| \`dict[k] = v\` 然后 \`dict[k]\` 读取 | ❌ 不安全 | 多步操作之间会被打断 |
| 多步逻辑（先查再改） | ❌ 不安全 | 中间有"窗口期" |

注意：CPython 的 **GIL**（全局解释器锁）保证单条字节码原子执行，所以 \`list.append()\` 是安全的。但**多步操作不安全**，因为 GIL 会在每条字节码之间释放。

## 三、为什么 \`count -= 1\` 不是原子操作

\`count -= 1\` 看起来是一行代码，但 Python 解释器要执行**三条字节码**：

\`\`\`text
1. LOAD_GLOBAL count      # 把 count 的值加载到栈顶
2. LOAD_CONST 1           # 把常量 1 加载到栈顶
3. INPLACE_SUBTRACT       # 弹出栈顶两个值，相减
4. STORE_GLOBAL count     # 把结果存回 count
\`\`\`

GIL 在每条字节码之间**可能切换到其他线程**。所以：

\`\`\`text
线程A: LOAD_GLOBAL count (读到 50)
                线程B: LOAD_GLOBAL count (也读到 50！)
线程A: 50 - 1 = 49
                线程B: 50 - 1 = 49
线程A: STORE_GLOBAL count (写回 49)
                线程B: STORE_GLOBAL count (写回 49)
                ← 期望 48，实际 49，少了 1！
\`\`\`

这种"多个线程竞争同一资源，导致结果不正确"的现象叫**竞态条件（Race Condition）**。

## 四、临界区与临界资源

- **临界资源**：被多个线程共享、必须串行访问的资源（比如 \`count\`、共享 list、数据库连接）
- **临界区**：访问临界资源的代码段

\`\`\`python
# 下面这两行就是临界区
count = count - 1    # 读取并修改共享变量 count
# 临界区结束
\`\`\`

**解决思路**：让临界区"互斥"——同一时刻只有一个线程能进。这就是下一章要讲的 \`Lock\`。

## 五、解决线程安全问题的工具预览

Python \`threading\` 模块提供了多种同步工具：

| 工具 | 作用 | 适用场景 |
|------|------|----------|
| \`Lock\` | 互斥锁，一次只一个进 | 保护临界区（最常用） |
| \`RLock\` | 可重入锁，同一线程可多次 acquire | 递归调用、嵌套加锁 |
| \`Semaphore\` | 信号量，限制同时 N 个 | 限流（如最多 5 个连接） |
| \`Event\` | 事件信号，通知线程 | 等待某个条件成立 |
| \`Condition\` | 条件变量，等待/通知 | 生产者-消费者模型 |
| \`Queue\` | 线程安全队列 | 线程间传递数据 |

下一章我们会重点讲 \`Lock\`，其他工具后续章节介绍。

## 六、demo 1：模拟售票，结果不正确

下面这个 demo 模拟售票：100 张票，5 个窗口（线程）同时卖，每个窗口卖 20 张。理论上 5×20=100，卖完后票数应该是 0。

实际运行后你会看到：

- 卖出的总票数 = 100
- 但剩余票数 ≠ 0（通常是几个到几十个不等）
- 甚至可能为负数（超卖）

每次运行结果都不一样，这就是竞态条件的"随机性"。

## 七、demo 2：用 sleep 放大竞态条件

竞态条件有时很难复现（因为窗口期太短），demo 2 在"读"和"写"之间加 \`sleep\`，**人为放大窗口期**，让问题必然出现：

\`\`\`python
def sell():
    global tickets
    if tickets > 0:                  # 1. 读
        time.sleep(0.001)            # 人为放大窗口期
        tickets -= 1                 # 2. 改 + 写
        sold.append(1)
\`\`\`

这样运行后，几乎 100% 能看到超卖（票数变成负数）。这种"加 sleep 复现 bug"是调试竞态条件的常用技巧。

## 八、思考题

在进入下一章之前，先想想：

1. 如果不卖 100 张，而是卖 1 张（每个线程卖 1 张），还会出错吗？
2. 如果只开 1 个线程卖票，会出错吗？
3. 为什么 \`list.append()\` 安全但 \`count += 1\` 不安全？

提示：思考"操作是不是原子的"。

## 九、小结

| 概念 | 一句话 |
|------|--------|
| 线程安全 | 多线程并发结果 == 串行结果 |
| 竞态条件 | 多线程竞争共享资源导致结果错乱 |
| 临界资源 | 被多线程共享、必须串行访问的资源 |
| 临界区 | 访问临界资源的代码段 |
| 原子操作 | 不会被中断的操作（如 \`list.append\`） |
| 非原子操作 | 会被中断的操作（如 \`count += 1\`） |

**核心结论**：只要多个线程**同时修改共享数据**，就可能有线程安全问题。解决办法是**加锁**，下一章我们就来学 \`Lock\`。`,
    code: `# -*- coding: utf-8 -*-
# 第九章 demo：线程安全问题
# 演示售票问题、竞态条件、用 sleep 放大竞态条件
import threading
import time

print("=" * 60)
print("第九章 demo：线程安全问题")
print("=" * 60)


# ===== demo 1：模拟售票，多个线程同时减库存 =====
print("\\n[demo 1] 模拟售票：100 张票，5 个窗口各卖 20 张")

# 共享变量：剩余票数（临界资源）
tickets = 100
# 共享变量：已卖出的票数（用于统计）
sold_count = 0


def sell_tickets(window_name, num_to_sell):
    """窗口卖票函数：每个窗口要卖 num_to_sell 张票。
    典型的"读-改-写"非原子操作，多线程下会出错。
    """
    global tickets, sold_count
    for _ in range(num_to_sell):
        # 临界区开始 ─────────────────────────────
        if tickets > 0:              # 1. 读：检查是否还有票
            # 注意：这里没有加任何同步措施
            # 多个线程可能同时通过这个判断，然后各自减 1
            tickets -= 1             # 2. 改+写：卖出一张，票数减 1
            sold_count += 1          # 同样不安全
        # 临界区结束 ─────────────────────────────


# 创建 5 个窗口（线程），每个卖 20 张
windows = []
for i in range(5):
    t = threading.Thread(
        target=sell_tickets,
        args=(f"窗口{i + 1}", 20),
        name=f"Window-{i + 1}",
    )
    windows.append(t)
    t.start()

# 等所有窗口结束
for t in windows:
    t.join()

print(f"    初始票数: 100")
print(f"    5 个窗口各卖 20 张，预期总卖出: 100")
print(f"    实际剩余票数: {tickets}")
print(f"    实际总卖出: {sold_count}")
print(f"    期望剩余: 0, 实际剩余: {tickets}")
print(f"    差异: {100 - sold_count - tickets}（理论应为 0）")
print("    → 如果剩余票数 ≠ 0，说明发生了竞态条件！")


# ===== demo 2：用 sleep 放大竞态条件 =====
print("\\n[demo 2] 用 sleep 放大竞态条件（必现超卖）：")

# 重置共享变量
tickets2 = 50
oversold_count = 0


def sell_slow(window_name, num_to_sell):
    """在"读"和"写"之间加 sleep，放大竞态窗口期。
    这样几乎所有线程都会同时通过 if tickets > 0 的判断，
    然后各自减 1，导致超卖。
    """
    global tickets2, oversold_count
    for _ in range(num_to_sell):
        if tickets2 > 0:             # 1. 读
            time.sleep(0.001)        # 人为放大窗口期：让其他线程也读到这个值
            tickets2 -= 1            # 2. 改+写
            oversold_count += 1


# 5 个窗口各卖 12 张，总共 60 张，但只有 50 张票
windows2 = []
for i in range(5):
    t = threading.Thread(
        target=sell_slow,
        args=(f"窗口{i + 1}", 12),
    )
    windows2.append(t)
    t.start()

for t in windows2:
    t.join()

print(f"    初始票数: 50")
print(f"    5 个窗口各卖 12 张，理论最多卖出: 50")
print(f"    实际卖出: {oversold_count}")
print(f"    剩余票数: {tickets2}")
print(f"    超卖: {oversold_count - 50} 张（应为 0）")
if tickets2 < 0:
    print(f"    → 票数为负数！发生了超卖！")
elif oversold_count > 50:
    print(f"    → 卖出比票数还多！发生了超卖！")
else:
    print(f"    → 这次运气好没超卖，但逻辑上仍是不安全的")


# ===== 验证：单线程没问题 =====
print("\\n[补充] 验证：单线程下不会出错")

tickets3 = 100
sold3 = 0


def sell_single(num_to_sell):
    """单线程卖票，不存在竞态条件。"""
    global tickets3, sold3
    for _ in range(num_to_sell):
        if tickets3 > 0:
            tickets3 -= 1
            sold3 += 1


# 单线程串行卖 5 轮，每轮 20 张
for _ in range(5):
    sell_single(20)

print(f"    初始票数: 100，单线程卖 5 轮 × 20 张")
print(f"    剩余: {tickets3}, 卖出: {sold3}")
print(f"    → 单线程结果完全正确，证明问题出在并发，不在逻辑")

print("\\n" + "=" * 60)
print("线程安全总结：")
print("  - 共享数据的 读-改-写 不是原子操作")
print("  - 多线程同时修改 → 竞态条件 → 数据错误")
print("  - 解决方案：用 Lock 保护临界区（下一章）")
print("=" * 60)
`,
  },

  // =========================================================
  // 第十章：Lock 互斥锁
  // =========================================================
  {
    id: "py2-10",
    group: "线程同步",
    icon: "🔒",
    title: "Lock 互斥锁：最基本的同步工具",
    content: `## 一、Lock 的概念：一把钥匙，谁拿到谁能进

接着上一章的售票问题。问题的根源是"读-改-写"中间有窗口期，多个线程同时进入这段代码。

解决思路很直观：**给临界区装一把锁**。

\`\`\`text
                    ┌─────────────────┐
                    │   临界区代码     │
锁🔒 ────────┐      │  count -= 1     │
            │      │                 │
            └──────│                 │
                   └─────────────────┘

线程A 拿到锁 → 进入临界区 → 线程B 想进 → 等待 → A 出来 → B 进
\`\`\`

**Lock 的核心规则**：

- 同一时刻**只有一个线程**能持有锁
- 其他想拿锁的线程**必须等待**（阻塞）
- 持有者**主动释放**后，等待的线程才能竞争

就像公共厕所：门一锁，外面的人就得排队等。

## 二、Lock 的基本用法

### 1. 创建锁

\`\`\`python
import threading
lock = threading.Lock()
\`\`\`

### 2. acquire() 和 release()

\`\`\`python
lock.acquire()        # 获取锁（拿不到就阻塞等待）
# 临界区开始
count += 1
# 临界区结束
lock.release()        # 释放锁（让其他线程能拿）
\`\`\`

完整例子：

\`\`\`python
import threading

count = 0
lock = threading.Lock()

def increment():
    global count
    for _ in range(100000):
        lock.acquire()       # 获取锁
        count += 1           # 临界区
        lock.release()       # 释放锁

threads = [threading.Thread(target=increment) for _ in range(5)]
for t in threads:
    t.start()
for t in threads:
    t.join()

print(count)   # 一定是 500000
\`\`\`

## 三、推荐：用 with 上下文管理器

手动 \`acquire/release\` 容易忘记 \`release\`（特别是在异常情况下），导致死锁。**强烈推荐用 \`with\` 语句**：

\`\`\`python
lock = threading.Lock()

def increment():
    global count
    for _ in range(100000):
        with lock:           # 进入时自动 acquire，离开时自动 release
            count += 1       # 即使这里抛异常，锁也会被释放
\`\`\`

\`with\` 的好处：

1. **自动释放**：即使临界区抛异常，锁也会被释放
2. **代码简洁**：少写两行 \`acquire/release\`
3. **避免死锁**：不会因为忘记 \`release\` 而死锁

## 四、Lock 是非重入的

**Lock 同一个线程不能 acquire 两次**！第二次 acquire 会**永远阻塞**，造成死锁。

\`\`\`python
lock = threading.Lock()
lock.acquire()
lock.acquire()   # ❌ 死锁！永远等不到，因为锁被自己拿着
\`\`\`

为什么会这样？因为 \`Lock\` 不知道"持有者是自己"，它只知道"锁已经被拿走了"。

如果需要"同一线程多次 acquire"，用 \`RLock\`（可重入锁，下一章讲），它内部记录了持有者线程。

## 五、用 Lock 修复售票问题

上一章的售票 demo 加锁后：

\`\`\`python
lock = threading.Lock()

def sell_tickets(window, num):
    global tickets, sold
    for _ in range(num):
        with lock:                    # 进入临界区
            if tickets > 0:
                tickets -= 1
                sold += 1
            # 离开 with 块时自动释放锁
\`\`\`

加锁后：

- 同一时刻只有一个窗口能进入临界区
- \`if tickets > 0\` 和 \`tickets -= 1\` 之间不会被其他线程打断
- 结果**始终正确**：卖出 100 张，剩余 0

## 六、Lock 的性能影响

加锁后，临界区变成**串行执行**：

\`\`\`text
不加锁：   ┌─T1─┐
           │    │ ┌─T2─┐
           │    │ │    │ ┌─T3─┐
           └────┘ └────┘ └────┘   （并行）

加锁后：   ┌─T1─┐┌─T2─┐┌─T3─┐
           └────┘└────┘└────┘      （串行）
\`\`\`

**权衡**：

- 临界区越短，性能影响越小（**只锁必要的代码**）
- 临界区越长，并发度越低（多个线程排队等）
- 不要"为了安全"把整个函数都锁上——那就退化成串行了

**经验法则**：

1. 只锁"读-改-写"那几行，不要锁整个函数
2. 锁内不要做耗时操作（IO、网络、sleep）
3. 锁内不要调用未知代码（可能也会去拿锁，导致死锁）

## 七、常见错误：忘记 release 导致死锁

\`\`\`python
lock = threading.Lock()

def bad():
    lock.acquire()
    if some_error:
        return              # ❌ 忘了 release！锁永远拿不回来了
    lock.release()
\`\`\`

后续所有想拿这把锁的线程都会**永远阻塞**——这就是死锁。

**解决方案**：用 \`with lock:\` 永远不要手动 \`acquire/release\`。

## 八、demo 1：用 Lock 修复售票问题

下面这个 demo 重做上一章的售票实验，但这次给临界区加锁：

\`\`\`python
with lock:
    if tickets > 0:
        tickets -= 1
        sold_count += 1
\`\`\`

运行后你会看到：

- 卖出总票数 = 100
- 剩余票数 = 0
- 每次运行结果都一样（不再有随机性）

这就是线程安全的代码——**结果可预期，与并发度无关**。

## 九、demo 2：演示 Lock 死锁

下面这个 demo 演示同一线程对 Lock 二次 \`acquire\` 导致的死锁。**为了避免程序真的卡死**，我们用 \`acquire(timeout=2)\` 设置超时：

\`\`\`python
lock.acquire()
print("第一次 acquire 成功")
ok = lock.acquire(timeout=2)   # 等待 2 秒
print(f"第二次 acquire 结果: {ok}")   # False，超时失败
\`\`\`

如果不用 \`timeout\`，第二次 \`acquire()\` 会**永远阻塞**。你可以试着把 \`timeout\` 去掉，然后用 \`Ctrl+C\` 终止程序来验证。

## 十、Lock 的常用方法

| 方法 | 说明 |
|------|------|
| \`lock.acquire(blocking=True)\` | 阻塞获取锁（默认） |
| \`lock.acquire(blocking=False)\` | 非阻塞获取，失败返回 \`False\` |
| \`lock.acquire(timeout=2)\` | 限时获取，超时返回 \`False\` |
| \`lock.release()\` | 释放锁 |
| \`lock.locked()\` | 查询锁是否被持有（返回 \`True/False\`） |

非阻塞获取的用法：

\`\`\`python
if lock.acquire(blocking=False):
    try:
        # 拿到锁了，干活
        do_work()
    finally:
        lock.release()
else:
    # 没拿到锁，干别的
    print("锁被占用，稍后再试")
\`\`\`

## 十一、小结

| 概念 | 一句话 |
|------|--------|
| Lock | 互斥锁，同一时刻只有一个线程能持有 |
| \`acquire/release\` | 手动获取/释放（不推荐） |
| \`with lock:\` | 自动获取/释放（**强烈推荐**） |
| 非重入 | 同一线程不能二次 acquire |
| 死锁原因 | 忘 release / 二次 acquire / 循环等待 |
| 性能影响 | 临界区串行化，要尽量短 |

**核心建议**：

1. **永远用 \`with lock:\`，不要手动 \`acquire/release\`**
2. **临界区尽量短**，只锁必要的代码
3. **锁内不要做 IO/网络/sleep**
4. 需要同一线程多次加锁，用 \`RLock\`（下一章）

到这里，你已经掌握了线程同步的基础。后续章节我们会讲更高级的同步工具：\`RLock\`、\`Semaphore\`、\`Condition\`、\`Event\`、\`Queue\`。`,
    code: `# -*- coding: utf-8 -*-
# 第十章 demo：Lock 互斥锁
# 演示用 Lock 修复售票问题、Lock 死锁（用 timeout 避免卡死）、with 上下文管理
import threading
import time

print("=" * 60)
print("第十章 demo：Lock 互斥锁")
print("=" * 60)


# ===== demo 1：用 Lock 修复售票问题 =====
print("\\n[demo 1] 用 Lock 修复售票问题：")

# 共享变量
tickets = 100
sold_count = 0
# 创建互斥锁
lock = threading.Lock()


def sell_tickets_safe(window_name, num_to_sell):
    """加锁版的售票函数：临界区被 with lock 保护。
    同一时刻只有一个线程能进入临界区，
    所以"读-改-写"不会被其他线程打断。
    """
    global tickets, sold_count
    for _ in range(num_to_sell):
        # with 语句：进入时自动 acquire，离开时自动 release
        # 即使中间抛异常，锁也会被释放
        with lock:
            # 临界区开始 ─────────────────────────
            if tickets > 0:           # 检查（不会被其他线程打断）
                tickets -= 1          # 修改
                sold_count += 1       # 统计
            # 临界区结束 ─────────────────────────
        # 离开 with 块，锁自动释放，其他线程可以获取


# 创建 5 个窗口，各卖 20 张
windows = []
for i in range(5):
    t = threading.Thread(
        target=sell_tickets_safe,
        args=(f"窗口{i + 1}", 20),
    )
    windows.append(t)
    t.start()

for t in windows:
    t.join()

print(f"    初始票数: 100")
print(f"    5 个窗口各卖 20 张")
print(f"    剩余票数: {tickets}（应为 0）")
print(f"    总卖出: {sold_count}（应为 100）")
print(f"    结果正确: {tickets == 0 and sold_count == 100}")
print("    → 加锁后，每次运行结果都一样，不再有竞态条件")


# ===== 对比：不加锁 vs 加锁 =====
print("\\n[对比] 不加锁 vs 加锁（同样的逻辑跑 10 次对比）：")


def unsafe_increment(counter_list, n):
    """不加锁版本：count += 1 在多线程下会出错。"""
    for _ in range(n):
        counter_list[0] += 1


def safe_increment(local_lock, counter_list, n):
    """加锁版本：count += 1 不会被打断。"""
    for _ in range(n):
        with local_lock:
            counter_list[0] += 1


N_THREADS = 5
N_INCREMENTS = 10000
EXPECTED = N_THREADS * N_INCREMENTS

unsafe_results = []
safe_results = []

for round_num in range(5):
    # 不加锁
    counter = [0]
    threads = [
        threading.Thread(target=unsafe_increment, args=(counter, N_INCREMENTS))
        for _ in range(N_THREADS)
    ]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    unsafe_results.append(counter[0])

    # 加锁
    counter = [0]
    test_lock = threading.Lock()
    threads = [
        threading.Thread(target=safe_increment, args=(test_lock, counter, N_INCREMENTS))
        for _ in range(N_THREADS)
    ]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    safe_results.append(counter[0])

print(f"    期望值: {EXPECTED}")
print(f"    不加锁 5 次结果: {unsafe_results}")
print(f"    加锁 5 次结果: {safe_results}")
print(f"    不加锁全部正确: {all(r == EXPECTED for r in unsafe_results)}")
print(f"    加锁全部正确: {all(r == EXPECTED for r in safe_results)}")


# ===== demo 2：演示 Lock 死锁（用 timeout 避免卡死）=====
print("\\n[demo 2] 演示 Lock 死锁（用 timeout 避免卡死）：")

dead_lock = threading.Lock()

# 第一次 acquire：成功
dead_lock.acquire()
print("    第一次 acquire() 成功，锁已被当前线程持有")

# 第二次 acquire：会死锁！但用 timeout 避免永久阻塞
# 如果不加 timeout，这一行会永远卡住
print("    尝试第二次 acquire(timeout=2)...")
start = time.time()
ok = dead_lock.acquire(timeout=2)   # 最多等 2 秒
elapsed = time.time() - start

if not ok:
    print(f"    第二次 acquire 失败（等待 {elapsed:.2f} 秒超时）")
    print("    → 这就是死锁！同一线程对非重入 Lock 二次 acquire 会永远等不到")
    print("    → 如果不设 timeout，程序会永久卡在这里")
    print("    → 实际调试时可以用 Ctrl+C 终止程序")
else:
    print("    第二次 acquire 成功（不应该发生）")

# 释放第一次获取的锁
dead_lock.release()
print("    release() 第一次持有的锁")

# 死锁的另一种典型场景：忘记 release
print("\\n    [场景] 忘记 release 导致死锁（用 timeout 演示）：")
forget_lock = threading.Lock()


def forget_release():
    """演示忘记 release 的错误写法。"""
    forget_lock.acquire()
    if True:
        # 假设这里出错提前 return，忘了 release
        return
    forget_lock.release()   # 永远不会执行


# 用 with 语句可以避免这种问题
def safe_with_lock():
    """用 with 自动管理锁，避免忘记 release。"""
    with forget_lock:
        if True:
            return    # 离开 with 块时锁会自动释放


print("    错误写法：acquire() 后 return，忘了 release → 锁永远拿不回")
print("    正确写法：with lock: + return，自动 release")
print("    → 结论：永远用 with lock，不要手动 acquire/release")


# ===== 非阻塞 acquire 演示 =====
print("\\n[补充] 非阻塞 acquire(blocking=False) 演示：")
test_lock2 = threading.Lock()
test_lock2.acquire()   # 主线程先拿走锁

# 子线程尝试非阻塞获取
def try_get_lock():
    if test_lock2.acquire(blocking=False):
        try:
            print("    [子线程] 拿到锁了，开始干活")
        finally:
            test_lock2.release()
    else:
        print("    [子线程] 锁被占用，跳过本次（不阻塞）")


t = threading.Thread(target=try_get_lock)
t.start()
t.join()

# 主线程释放
test_lock2.release()
print("    [主线程] 释放锁后，子线程再试：")

t2 = threading.Thread(target=try_get_lock)
t2.start()
t2.join()

print("\\n" + "=" * 60)
print("Lock 总结：")
print("  - with lock: 自动 acquire/release，强烈推荐")
print("  - Lock 非重入：同一线程不能二次 acquire（会死锁）")
print("  - acquire(timeout=N) 避免永久阻塞，便于调试")
print("  - 临界区尽量短，锁内不做 IO/sleep")
print("=" * 60)
`,
  },
];
