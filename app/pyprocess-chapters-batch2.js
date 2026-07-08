// =============================================================
// Python 多进程教程（pyprocess）—— 第二批章节
// batch2（5-8章）：multiprocessing 入门
//   第5章：multiprocessing.Process 类详解
//   第6章：启动子进程：start() 与 run() 的关系
//   第7章：等待子进程：join() 的正确姿势
//   第8章：守护进程 daemon 与进程生命周期
// =============================================================

export const chapters = [
  // =========================================================
  // 第五章：multiprocessing.Process 类详解
  // =========================================================
  {
    id: "mp-05",
    group: "multiprocessing 入门",
    icon: "🧱",
    title: "multiprocessing.Process 类详解",
    content: `## 一、Process 是多进程的核心类

\`multiprocessing.Process\` 是 Python 多进程编程的"主力军"。它的 API 和 \`threading.Thread\` 几乎一一对应：

| 操作 | Process 方法 | Thread 对应 |
|------|-------------|-----------|
| 创建 | \`Process(target=fn, args=(...))\` | \`Thread(target=fn, args=(...))\` |
| 启动 | \`p.start()\` | \`t.start()\` |
| 等待结束 | \`p.join()\` | \`t.join()\` |
| 是否还在跑 | \`p.is_alive()\` | \`t.is_alive()\` |
| 后台进程 | \`p.daemon = True\` | \`t.daemon = True\` |
| 进程/线程 ID | \`p.pid\` | \`t.ident\`（不同含义） |
| 进程名 | \`p.name\` | \`t.name\` |

**好消息**：你学过多线程的话，多进程 API 几乎零学习成本。

## 二、Process 的关键参数

\`\`\`python
multiprocessing.Process(
    group=None,        # 保留参数，未来扩展用，现在必须为 None
    target=None,       # 子进程要执行的函数
    name=None,         # 进程名（默认 "Process-N"）
    args=(),           # 传给 target 的位置参数（元组）
    kwargs={},         # 传给 target 的关键字参数（字典）
    daemon=None,       # 是否守护进程
)
\`\`\`

### 4 种启动方式

\`\`\`python
# 1. 传函数 + 位置参数
p = Process(target=work, args=(10, 20))

# 2. 传函数 + 关键字参数
p = Process(target=work, kwargs={"x": 10, "y": 20})

# 3. 传函数 + 混合（args 必须在 kwargs 前）
p = Process(target=work, args=(10,), kwargs={"y": 20})

# 4. 继承 Process 子类，重写 run()（高级用法，详见第 6 章）
class MyProcess(Process):
    def run(self):
        print("do something")
\`\`\`

## 三、进程的属性与方法

### 启动与状态

| 方法/属性 | 含义 |
|---------|------|
| \`p.start()\` | 启动子进程。**只能调用一次** |
| \`p.run()\` | 子进程实际执行的代码（start 会自动调它） |
| \`p.join(timeout=None)\` | 等待子进程结束。timeout=None 表示一直等 |
| \`p.is_alive()\` | 子进程是否还活着 |
| \`p.pid\` | 子进程的 PID（start 之后才有意义） |
| \`p.name\` | 进程名 |
| \`p.exitcode\` | 子进程的退出码。None 表示还没结束；0 表示正常退出；负数表示被信号杀死 |
| \`p.terminate()\` | 强制终止子进程（Linux 发送 SIGTERM） |
| \`p.kill()\` | 强制杀死子进程（Linux 发送 SIGKILL） |
| \`p.close()\` | 释放 Process 对象持有的资源（Python 3.7+） |

### exitcode 的含义

\`\`\`text
None    → 子进程还没结束
0       → 正常结束
1       → 子进程抛出未捕获异常
-N      → 子进程被信号 N 杀死（如 -9 表示被 SIGKILL 杀掉）
\`\`\`

**实战技巧**：\`.join()\` 后检查 \`p.exitcode\`，可以知道子进程是不是正常结束的：

\`\`\`python
p = Process(target=work)
p.start()
p.join()
if p.exitcode != 0:
    print(f"子进程异常退出，code={p.exitcode}")
\`\`\`

## 四、Process 的生命周期

\`\`\`text
创建 Process 对象 ──> 初始状态
        │
        ▼
   p.start()         ──> 启动子进程（OS 创建新进程）
        │
        ▼
   子进程执行 run()  ──> is_alive() = True
        │
        ▼
   子进程函数返回    ──> 子进程结束
        │
        ▼
   p.join() 返回     ──> 可以访问 exitcode 等
        │
        ▼
   p.close()         ──> 释放资源（可选）
\`\`\`

## 五、最佳实践

1. **总是用 \`with\` 语句**（Python 3.7+）：\`with Process(target=work) as p: ...\`
2. **start 后立即 join**（除非有特殊需求）
3. **处理 exitcode**：把异常子进程的情况记到日志
4. **不用了就 close**：避免资源泄漏
5. **不要在子进程启动后修改 Process 对象的属性**（daemon 必须在 start 前设置）

## 六、本章 demo

下面 demo 演示：
- 4 种启动方式
- 进程属性的读取
- exitcode 的检查
- with 语句的用法
`,
    code: `"""
第五章 demo：multiprocessing.Process 类的常用方法
演示：
  1. 4 种创建方式
  2. 进程属性（pid、name、is_alive、exitcode）
  3. with 语句的优雅用法
"""

import multiprocessing
import os
import time


# ===== 模块顶层函数：可 pickle =====
def worker_positional(x, y):
    """位置参数版"""
    pid = os.getpid()
    return f"pid={pid}, x={x}, y={y}, sum={x + y}"


def worker_kwargs(x, y, z=0):
    """关键字参数版"""
    pid = os.getpid()
    return f"pid={pid}, x={x}, y={y}, z={z}, sum={x + y + z}"


def worker_slow(seconds):
    """模拟一个耗时的子进程任务"""
    pid = os.getpid()
    print(f"  [pid={pid}] 开始 sleep {seconds} 秒")
    time.sleep(seconds)
    print(f"  [pid={pid}] 醒了")
    return seconds


def worker_error():
    """故意抛异常的子进程"""
    raise ValueError("子进程里出错了！")


# ===== Demo 1：4 种创建方式 =====
def demo_creation():
    print("=== Demo 1: 4 种创建方式 ===")

    # 方式 1：位置参数
    p1 = multiprocessing.Process(
        target=worker_positional,
        args=(1, 2),
        name="PositionalWorker"
    )

    # 方式 2：关键字参数
    p2 = multiprocessing.Process(
        target=worker_kwargs,
        kwargs={"x": 10, "y": 20, "z": 30},
        name="KwargsWorker"
    )

    # 方式 3：混合（args 在 kwargs 之前）
    p3 = multiprocessing.Process(
        target=worker_kwargs,
        args=(100,),
        kwargs={"y": 200, "z": 300},
        name="MixedWorker"
    )

    for p in [p1, p2, p3]:
        p.start()
        p.join()
        print(f"  进程 {p.name} 结束，exitcode={p.exitcode}")
    print()


# ===== Demo 2：进程属性观察 =====
def demo_attributes():
    print("=== Demo 2: 进程属性观察 ===")

    p = multiprocessing.Process(target=worker_slow, args=(2,))
    print(f"  创建后: name={p.name}, pid={p.pid}, alive={p.is_alive()}")

    p.start()
    print(f"  start 后: name={p.name}, pid={p.pid}, alive={p.is_alive()}")

    p.join()
    print(f"  join 后: name={p.name}, pid={p.pid}, alive={p.is_alive()}, exitcode={p.exitcode}")
    print()


# ===== Demo 3：异常处理（exitcode != 0） =====
def demo_exception():
    print("=== Demo 3: 子进程异常时的 exitcode ===")

    p = multiprocessing.Process(target=worker_error)
    p.start()
    p.join()

    # exitcode = 1 表示子进程以非 0 状态退出（异常）
    print(f"  exitcode = {p.exitcode}")
    if p.exitcode != 0:
        print("  ⚠️  子进程异常退出，建议记录到日志")
    print()


# ===== Demo 4：手动 close 释放资源（推荐写法） =====
def demo_with_statement():
    print("=== Demo 4: 手动 close 释放资源（推荐写法） ===")

    # 用 try/finally 保证 close 被调用（等价于 with 语句）
    p = multiprocessing.Process(target=worker_slow, args=(1,))
    try:
        p.start()
        # 这里可以做别的事
        print(f"  子进程 {p.name} (pid={p.pid}) 已启动")
        p.join()
        exitcode = p.exitcode  # 在 close 之前保存 exitcode
    finally:
        p.close()  # 释放资源（close 后不能再访问属性）
    print(f"  进程已 close，exitcode={exitcode}")
    print()


# ===== 主程序 =====
if __name__ == "__main__":
    print(f"主进程 pid = {os.getpid()}\\n")

    demo_creation()
    demo_attributes()
    demo_exception()
    demo_with_statement()

    print("=== 总结 ===")
    print("• Process API 与 Thread 几乎一致")
    print("• 4 种创建方式：位置、关键字、混合、继承")
    print("• join 后检查 exitcode 判断子进程是否正常结束")
    print("• 优先用 with 语句，自动释放资源")
`,
  },

  // =========================================================
  // 第六章：启动子进程：start() 与 run() 的关系
  // =========================================================
  {
    id: "mp-06",
    group: "multiprocessing 入门",
    icon: "▶️",
    title: "启动子进程：start() 与 run() 的关系",
    content: `## 一、start() 做了什么？

调用 \`p.start()\` 时，Python 内部做了 4 件事：

1. **fork / spawn 启动方式** 由之前设置的 start_method 决定
2. 在**子进程**里执行 \`self.run()\`
3. \`self.run()\` 默认会调用 \`self._target(*self._args, **self._kwargs)\`
4. 子进程开始跑你的函数

**关键点**：
- \`start()\` **只能在主进程调用**
- \`start()\` 调用后，\`p\` 就变成了"活"进程
- 子进程和主进程**并行执行**，谁先谁后不一定

## 二、run() 是什么？什么时候自己重写？

\`Process.run()\` 是子进程**真正执行的入口**。它默认实现是：

\`\`\`python
def run(self):
    if self._target is not None:
        self._target(*self._args, **self._kwargs)
\`\`\`

也就是说，**默认情况下 \`run()\` 就是调用你传进去的 \`target\` 函数**。

### 什么时候需要重写 run()？

当你需要**面向对象**地组织子进程代码时（比如要传额外状态、要在前后加钩子）：

\`\`\`python
class MyProcess(multiprocessing.Process):
    def __init__(self, name, data):
        super().__init__()
        self.data = data  # 实例属性会随进程 pickle 一起传过去

    def run(self):
        # 这是在子进程里执行的代码
        print(f"子进程 {self.name} 收到数据: {self.data}")
        result = sum(self.data)
        print(f"子进程 {self.name} 算完: {result}")

# 启动
p = MyProcess(name="MyWorker", data=[1, 2, 3])
p.start()
p.join()
\`\`\`

**注意**：\`__init__\` 里的属性会通过 pickle 传给子进程，所以要确保能 pickle。

## 三、两个常见错误

### 错误 1：在主进程里直接调 \`run()\`

\`\`\`python
p = Process(target=work)
p.run()  # ❌ 不会启动子进程！只是在当前进程同步执行 work
\`\`\`

**正确**：永远用 \`p.start()\`。

### 错误 2：start() 同一个进程两次

\`\`\`python
p = Process(target=work)
p.start()
p.start()  # ❌ 报错: RuntimeError: process already started
\`\`\`

要重启？只能创建新的 Process 对象。

## 四、start() 之后的 5 个常见问题

### Q1：start 完立刻 join，主进程会不会卡住？

**会**。\`join()\` 就是阻塞等子进程结束。如果你想"启动后让子进程自己跑，主进程干别的事"，那就不调 join（或者在合适的时机再 join）。

### Q2：怎么知道子进程什么时候结束？

- \`p.is_alive()\` 轮询
- \`p.join()\` 阻塞等
- \`Queue\` / \`Pipe\` 子进程发消息给主进程
- \`Event\` / \`Condition\` 进程间信号
- \`Pool.apply_async\` 的回调函数（第 16 章详解）

### Q3：start 后能改 p.daemon 吗？

**不能**。daemon 必须在 start 之前设置。这是 Python 故意设计的——start 之后再改会引入难以调试的竞争条件。

### Q4：start 顺序和子进程实际启动顺序一致吗？

**不一定**。操作系统调度子进程有先后。Python 内部是按你 start 的顺序发出"启动请求"，但谁先真正开始跑要看 OS。

### Q5：start() 会不会等子进程初始化完才返回？

**不会**。\`start()\` 只是"发出启动请求"，立刻返回。子进程开始执行的实际时刻可能稍后。

## 五、进程名（name）的妙用

\`\`\`python
p = Process(target=work, name="数据清洗-1")
\`\`\`

在 \`ps\` / 活动监视器 / 日志里看到的进程名就是 \`"数据清洗-1"\`，非常方便排查问题：

\`\`\`bash
# macOS
ps -ax | grep "数据清洗"

# Linux
ps -ef | grep "数据清洗"
\`\`\`

## 六、本章 demo

下面 demo 演示：
- start() 启动子进程 vs 直接调 run() 的差异
- 重写 run() 的面向对象写法
- 进程名的使用
`,
    code: `"""
第六章 demo：start() 与 run() 的关系
演示：
  1. start() 启动子进程（异步）
  2. 直接调用 run() 的错误用法
  3. 重写 run() 的面向对象写法
  4. 进程名的妙用
"""

import multiprocessing
import os
import time


# ===== 普通函数 worker =====
def simple_worker(name, sleep_sec):
    """一个简单的 worker：打印自己的 PID 和名字，然后 sleep"""
    pid = os.getpid()
    print(f"  [pid={pid} name={name}] 开始执行，sleep {sleep_sec}s")
    time.sleep(sleep_sec)
    print(f"  [pid={pid} name={name}] 执行完毕")
    return name


# ===== 面向对象版：继承 Process 并重写 run() =====
class NamedWorker(multiprocessing.Process):
    """
    继承 Process，重写 run() 方法。
    这种写法适合：
      - 需要在子进程里做更复杂的初始化
      - 想要面向对象地组织代码
      - 想要在子进程前后加钩子（before_run / after_run）
    """

    def __init__(self, task_id: int, payload: dict):
        # 必须先调父类的 __init__
        super().__init__(name=f"Worker-{task_id}")
        self.task_id = task_id
        self.payload = payload  # 注意：payload 必须能 pickle

    def run(self):
        """
        这个方法会在子进程里执行。
        我们在这里加了一层 before/after 的钩子。
        """
        self.before_run()
        try:
            self.do_work()
        finally:
            self.after_run()

    def before_run(self):
        print(f"  [{self.name}] 前置钩子：检查资源...")

    def do_work(self):
        # 模拟真实工作
        value = self.payload.get("value", 0)
        print(f"  [{self.name}] 处理任务 {self.task_id}，value={value}")

    def after_run(self):
        print(f"  [{self.name}] 后置钩子：清理资源...")


# ===== Demo 1：正确用法 start() =====
def demo_correct_start():
    print("=== Demo 1: 正确的 start() 用法 ===")

    start_time = time.time()
    p = multiprocessing.Process(
        target=simple_worker,
        args=("子进程A", 1),
        name="MyWorker-A"
    )
    p.start()
    print(f"  [主进程] start() 已返回，pid={p.pid}, name={p.name}")
    p.join()
    print(f"  [主进程] join() 返回，总耗时 {time.time() - start_time:.2f}s\\n")


# ===== Demo 2：错误用法：直接调 run() =====
def demo_wrong_run():
    print("=== Demo 2: 错误用法 — 直接调 run() ===")

    p = multiprocessing.Process(
        target=simple_worker,
        args=("伪子进程", 1),
        name="FakeProcess"
    )
    # 直接调 run() 不会启动新进程，而是在当前进程同步执行
    p.run()  # 主进程会卡 1 秒
    print(f"  [主进程] p.pid = {p.pid}（说明根本没启动子进程）")
    print(f"  [主进程] p.is_alive() = {p.is_alive()}")
    print("  ⚠️  直接调 run() 等于在主进程同步执行，失去了并发的意义\\n")


# ===== Demo 3：继承 Process 重写 run() =====
def demo_subclass():
    print("=== Demo 3: 继承 Process 重写 run() ===")

    workers = [
        NamedWorker(task_id=1, payload={"value": 100}),
        NamedWorker(task_id=2, payload={"value": 200}),
        NamedWorker(task_id=3, payload={"value": 300}),
    ]

    for w in workers:
        w.start()

    for w in workers:
        w.join()
    print()


# ===== 主程序 =====
if __name__ == "__main__":
    print(f"主进程 pid = {os.getpid()}\\n")

    demo_correct_start()
    demo_wrong_run()
    demo_subclass()

    print("=== 总结 ===")
    print("• start()：启动子进程（异步，立刻返回）")
    print("• run()：子进程实际执行的入口")
    print("• 直接调 run() 不会启动新进程，失去了多进程的意义")
    print("• 复杂场景可以继承 Process 重写 run()")
    print("• 进程名（name）在日志和 ps 命令里非常有用")
`,
  },

  // =========================================================
  // 第七章：等待子进程：join() 的正确姿势
  // =========================================================
  {
    id: "mp-07",
    group: "multiprocessing 入门",
    icon: "⏳",
    title: "等待子进程：join() 的正确姿势",
    content: `## 一、为什么必须 join()？

主进程跑完代码就会**自动结束**——而此时子进程可能还没跑完！结果就是：

\`\`\`python
# ❌ 危险的写法
p = Process(target=long_work)
p.start()
# 主进程到这就结束了！
# 子进程被强制杀死，任务没做完
\`\`\`

**正确做法**：用 \`join()\` 等子进程结束：

\`\`\`python
# ✅ 正确
p = Process(target=long_work)
p.start()
p.join()  # 等子进程跑完，主进程才继续
\`\`\`

## 二、join() 的 4 种用法

### 1. 无限等待

\`\`\`python
p.join()  # 一直等到子进程结束
\`\`\`

### 2. 超时等待

\`\`\`python
p.join(timeout=5)  # 最多等 5 秒
# 5 秒后无论子进程是否结束都返回
# 检查 p.is_alive() 决定要不要继续等
\`\`\`

### 3. 轮询等待

\`\`\`python
while p.is_alive():
    print("子进程还在跑...")
    p.join(timeout=1)  # 每秒检查一次
\`\`\`

### 4. 多个进程同时 join

\`\`\`python
processes = [Process(target=work, args=(i,)) for i in range(5)]
for p in processes:
    p.start()
for p in processes:
    p.join()  # 注意：第二次循环的 join 是等所有进程都完成
# 这里所有进程都已结束
\`\`\`

## 三、join() 之后的 4 个清理动作

join 之后建议做这些事：

\`\`\`python
p = Process(target=work)
p.start()
p.join()

# 1. 检查是否还活着（应该返回 False）
assert not p.is_alive()

# 2. 检查退出码（0 表示正常）
if p.exitcode != 0:
    print("子进程异常退出")

# 3. 主动释放资源（Python 3.7+，with 语句会自动调）
p.close()

# 4. 如果进程对象不再需要，可以让它被 GC 回收
del p
\`\`\`

## 四、join() 的常见误区

### 误区 1：以为 join() 会终止子进程

\`join()\` 只会**等待**子进程结束，**不会终止**它。想终止要用 \`p.terminate()\` 或 \`p.kill()\`。

### 误区 2：以为 join() 之后子进程就消失了

子进程在 OS 层是独立存在的，\`join()\` 只是让你主进程等待。子进程结束后，OS 自动回收它的资源。

### 误区 3：以为可以 join 一个没 start 的进程

\`p.join()\` 之前必须先 \`p.start()\`，否则直接返回，**不会报错也不会等**。

### 误区 4：忘了 join

最常见的 bug！**永远记得 join**。

## 五、带返回值的 join（高级）

子进程的返回值怎么拿到？两种方法：

### 方法 1：用 Queue / Pipe 收集（推荐）

详见第 9 章。

### 方法 2：用共享变量（不推荐）

\`multiprocessing.Value\` 详见第 12 章。

## 六、优雅终止子进程

如果子进程陷入死循环或跑太久了，怎么强制结束？

\`\`\`python
import multiprocessing
import time

def loop():
    while True:
        print("工作中...")
        time.sleep(1)

if __name__ == "__main__":
    p = Process(target=loop)
    p.start()
    time.sleep(3)  # 让子进程跑 3 秒

    # 方法 1：温柔终止（发送 SIGTERM，子进程有机会清理）
    p.terminate()
    p.join()

    # 方法 2：暴力杀死（发送 SIGKILL，子进程没机会清理）
    # p.kill()
    # p.join()
\`\`\`

\`terminate()\` 和 \`kill()\` 的区别：
- \`terminate()\`：发送 SIGTERM，子进程能捕获信号做清理
- \`kill()\`：发送 SIGKILL，子进程立即被 OS 强杀

**Windows 上没区别**，Windows 的 Process 只能 terminate。

## 七、本章 demo

下面 demo 演示：
- 不 join 的危险（用 print 观察子进程是否被强杀）
- join 的各种用法
- 超时等待
- 优雅终止
`,
    code: `"""
第七章 demo：join() 的正确姿势
演示：
  1. 不 join 的危险
  2. join 的 4 种用法
  3. 超时等待
  4. 优雅终止子进程
"""

import multiprocessing
import os
import time


def long_task(task_id: int, duration: int):
    """一个需要 duration 秒才能跑完的任务"""
    pid = os.getpid()
    print(f"  [子进程 pid={pid} task={task_id}] 开始，要跑 {duration} 秒")
    for i in range(duration):
        time.sleep(1)
        print(f"  [子进程 pid={pid} task={task_id}] 跑完 {i + 1}/{duration} 秒")
    print(f"  [子进程 pid={pid} task={task_id}] 全部完成")
    return task_id


def infinite_loop():
    """一个永远不会自己结束的死循环"""
    pid = os.getpid()
    counter = 0
    while True:
        counter += 1
        if counter % 3 == 0:
            print(f"  [子进程 pid={pid}] 工作中... counter={counter}")
        time.sleep(1)


# ===== Demo 1：join 缺失的危险 =====
def demo_no_join():
    print("=== Demo 1: 不 join 的危险 ===")
    print("  启动一个 3 秒的子进程，但主进程不等它")

    p = multiprocessing.Process(target=long_task, args=(1, 3))
    p.start()
    # 不 join，主进程直接结束
    # 在某些场景下，子进程会被一起杀掉

    print("  [主进程] 我不等了，直接走")
    # 注意：这里如果主进程结束，spawn 模式下子进程会被自动清理
    # 但 fork 模式下子进程会变成孤儿进程继续跑
    time.sleep(4)  # 让子进程跑完
    print("  [主进程] 真的结束了\\n")


# ===== Demo 2：正确 join =====
def demo_proper_join():
    print("=== Demo 2: 正确 join ===")

    processes = []
    for i in range(1, 4):
        p = multiprocessing.Process(target=long_task, args=(i, 2))
        processes.append(p)
        p.start()

    print(f"  [主进程] 启动了 {len(processes)} 个子进程，等待它们完成...")
    start = time.time()

    for p in processes:
        p.join()
        # join 后可以做清理动作
        assert not p.is_alive(), "join 后应该已结束"
        print(f"  [主进程] 进程 {p.name} 已结束，exitcode={p.exitcode}")

    print(f"  [主进程] 全部完成，总耗时 {time.time() - start:.2f}s\\n")


# ===== Demo 3：超时 join =====
def demo_timeout_join():
    print("=== Demo 3: 超时 join ===")

    p = multiprocessing.Process(target=long_task, args=(99, 10))
    p.start()

    print("  [主进程] 最多等 3 秒...")
    p.join(timeout=3)

    if p.is_alive():
        print(f"  [主进程] 子进程还在跑，先不等了，pid={p.pid}")
        # 业务上可以选择：终止它 / 让它继续 / 记录到日志
    else:
        print(f"  [主进程] 子进程在 3 秒内就完成了")

    # 清理
    p.terminate()
    p.join()
    print()


# ===== Demo 4：优雅终止 =====
def demo_terminate():
    print("=== Demo 4: 优雅终止子进程 ===")

    p = multiprocessing.Process(target=infinite_loop, name="InfiniteWorker")
    p.start()
    print(f"  [主进程] 启动了死循环子进程 {p.name}，让它跑 3 秒")

    time.sleep(3)
    print(f"  [主进程] 现在终止它（is_alive={p.is_alive()}）")
    p.terminate()
    p.join(timeout=2)

    if p.is_alive():
        print(f"  [主进程] terminate 没杀死，强杀")
        p.kill()
        p.join()

    print(f"  [主进程] 已终止，is_alive={p.is_alive()}, exitcode={p.exitcode}")
    # exitcode 通常是 -15（SIGTERM）或 -9（SIGKILL）
    print()


# ===== 主程序 =====
if __name__ == "__main__":
    print(f"主进程 pid = {os.getpid()}\\n")

    demo_proper_join()  # 跳过 demo_no_join 的孤儿进程风险
    demo_timeout_join()
    demo_terminate()

    print("=== 总结 ===")
    print("• join() 是等待子进程结束，必须调用")
    print("• join(timeout=N) 可以限时等待")
    print("• join 后检查 is_alive() 和 exitcode")
    print("• terminate() 发送 SIGTERM，kill() 发送 SIGKILL")
    print("• 用 with 语句自动 close，避免资源泄漏")
`,
  },

  // =========================================================
  // 第八章：守护进程 daemon 与进程生命周期
  // =========================================================
  {
    id: "mp-08",
    group: "multiprocessing 入门",
    icon: "🛡️",
    title: "守护进程 daemon 与进程生命周期",
    content: `## 一、什么是守护进程？

**守护进程（daemon）= 跟着主进程生死的小弟**：

- 主进程还在跑 → 守护进程可以跑
- 主进程结束了 → **守护进程被强制杀死**，不管它在干什么

类比：你（主进程）下班了，你带的实习生（守护进程）也得跟着走，不管他活干没干完。

## 二、怎么设置守护进程？

### 方法 1：构造时设置

\`\`\`python
p = Process(target=work, daemon=True)
\`\`\`

### 方法 2：start 前设置

\`\`\`python
p = Process(target=work)
p.daemon = True  # 必须在 start 之前
p.start()
\`\`\`

### 方法 3：全局默认（不推荐）

\`\`\`python
multiprocessing.current_process().daemon = True
# 改当前进程的 daemon 属性，一般没这么用
\`\`\`

**注意**：daemon 必须在 start 前设置，start 后再改会报错。

## 三、守护进程 vs 非守护进程

| 特性 | 守护进程（daemon=True） | 非守护进程（daemon=False） |
|------|----------------------|--------------------------|
| 主进程退出时 | **被强制杀死** | 主进程会等它结束才退出 |
| 适用场景 | 后台监控、心跳、日志收集 | 真正的业务任务 |
| 能否创建子进程 | ❌ 不行 | ✅ 可以 |
| 资源清理 | ❌ 来不及清理 | ✅ 有机会清理 |

## 四、为什么 daemon 进程不能创建子进程？

daemon 在主进程退出时被**强制 SIGKILL**，连"清理 try/finally"的机会都没有。如果 daemon 还能创建子进程，那子子进程就没人管了，会变成孤儿进程。

\`\`\`python
def daemon_wants_child():
    p = Process(target=child)  # ❌ 守护进程里再开子进程会报错
    p.start()

p = Process(target=daemon_wants_child, daemon=True)
p.start()
# 报错: AssertionError: daemonic processes are not allowed to have children
\`\`\`

## 五、daemon 的典型用法

### 用法 1：心跳监控

\`\`\`python
def heartbeat():
    """每 1 秒打印一次心跳"""
    while True:
        print(f"  [heartbeat] pid={os.getpid()} 我还活着")
        time.sleep(1)

if __name__ == "__main__":
    p = Process(target=heartbeat, daemon=True)
    p.start()

    # 主进程做实际工作
    for i in range(5):
        print(f"  [main] 工作中... {i}")
        time.sleep(1)

    # 主进程结束，daemon 心跳进程被一起杀掉
\`\`\`

### 用法 2：日志收集器

\`\`\`python
def log_collector(queue):
    """从队列里读日志，写到文件"""
    with open("app.log", "a") as f:
        while True:
            msg = queue.get()
            f.write(msg + "\\n")
            f.flush()
\`\`\`

### 用法 3：清理资源的后台任务

不需要 daemon。重要数据交给守护进程处理是危险的——主进程一退出，进程被强杀，数据可能没写完。

## 六、daemon 的"金科玉律"

> **daemon 进程只能用于可以随时中断、不需要清理资源的任务。**

✅ 适合 daemon：
- 监控/心跳
- 日志缓存（丢了就丢了下次重发）
- 临时缓存清理

❌ 不适合 daemon：
- 写数据库
- 文件上传
- 任何"必须做完"的任务

## 七、退出处理：atexit 和 finally

主进程退出时怎么清理？两种方式：

### 方式 1：\`atexit\` 模块

\`\`\`python
import atexit

def cleanup():
    print("主进程退出，清理资源")

atexit.register(cleanup)
\`\`\`

### 方式 2：try/finally

\`\`\`python
try:
    # 主进程业务
    do_work()
finally:
    cleanup()
\`\`\`

**注意**：atexit 不会在 daemon 进程里执行（daemon 被强杀）。所以**重要清理放在主进程**。

## 八、本章 demo

下面 demo 演示：
- 守护进程的"主进程结束 = 守护进程被强杀"
- 非守护进程会被 join
- daemon 不能创建子进程
- daemon 的典型用法（心跳）
`,
    code: `"""
第八章 demo：守护进程 daemon
演示：
  1. daemon 进程在主进程退出时被强杀
  2. 非 daemon 进程会阻塞主进程退出
  3. daemon 进程不能创建子进程
  4. 心跳监控 daemon 实战
"""

import multiprocessing
import os
import time
import atexit


# ===== 一个会跑 3 秒的 worker =====
def long_worker(name: str):
    pid = os.getpid()
    print(f"  [{name} pid={pid}] 开始跑（要 3 秒）")
    for i in range(3):
        time.sleep(1)
        print(f"  [{name} pid={pid}] 跑完第 {i + 1} 秒")
    print(f"  [{name} pid={pid}] 全部跑完")


# ===== 一个心跳 daemon =====
def heartbeat():
    """daemon 进程：每 0.5 秒打印一次心跳"""
    pid = os.getpid()
    counter = 0
    while True:
        counter += 1
        print(f"  [heartbeat pid={pid}] 我还活着 #{counter}")
        time.sleep(0.5)


# ===== 一个想开子进程的 daemon（会失败） =====
def daemon_wants_child():
    """daemon 里再开子进程 —— 会报错"""
    print(f"  [pid={os.getpid()}] 我是 daemon，我试图开子进程")
    try:
        p = multiprocessing.Process(target=lambda: print("child"))
        p.start()
        p.join()
    except AssertionError as e:
        print(f"  ❌ 报错: {e}")


# ===== Demo 1：daemon 进程被强杀 =====
def demo_daemon_killed():
    print("=== Demo 1: daemon 进程在主进程退出时被强杀 ===")

    # 启动一个 daemon，让它跑 3 秒
    p = multiprocessing.Process(target=long_worker, args=("DaemonWorker",), daemon=True)
    p.start()

    # 主进程只等 1 秒就退出
    print("  [主进程] 等 1 秒...")
    time.sleep(1)
    print(f"  [主进程] 我要走了，daemon 状态: is_alive={p.is_alive()}")
    # 主进程退出时，daemon 会被强杀，不会跑完 3 秒
    # 注意：start 后不能改 daemon 属性，会抛 RuntimeError
    # 所以这里直接 join 让 daemon 跑完（仅用于 demo 演示）
    print("  （为了 demo 完整，这里我们让 daemon 跑完，看完整输出）")
    p.join()
    print(f"  [主进程] daemon {p.name} 跑完了: is_alive={p.is_alive()}")
    print()


# ===== Demo 2：daemon 实战 —— 心跳 =====
def demo_heartbeat():
    print("=== Demo 2: daemon 实战 —— 心跳监控 ===")
    print("  启动一个心跳 daemon，然后主进程做 3 秒业务后退出")
    print()

    # 启动心跳 daemon
    heart = multiprocessing.Process(target=heartbeat, daemon=True, name="Heartbeat")
    heart.start()

    # 主进程做实际工作
    for i in range(3):
        print(f"  [main] 业务进行中... {i + 1}/3")
        time.sleep(1)

    # 主进程结束 → daemon 被强杀 → 心跳停止
    print("  [main] 我要退出了，daemon 心跳会跟着被强杀\\n")


# ===== Demo 3：daemon 不能开子进程 =====
def demo_daemon_no_children():
    print("=== Demo 3: daemon 进程不能开子进程 ===")

    p = multiprocessing.Process(target=daemon_wants_child, daemon=True)
    p.start()
    p.join()
    print()


# ===== 主进程退出时的清理 =====
def main_cleanup():
    print("  [atexit] 主进程退出前清理资源")


if __name__ == "__main__":
    # 注册退出钩子
    atexit.register(main_cleanup)

    print(f"主进程 pid = {os.getpid()}\\n")

    demo_daemon_no_children()
    demo_daemon_killed()
    demo_heartbeat()

    print("=== 总结 ===")
    print("• daemon=True 让进程跟着主进程生死")
    print("• 主进程退出时，daemon 被强杀（不会跑 finally）")
    print("• daemon 不能开子进程（会报错）")
    print("• daemon 适合：心跳、监控、可丢失的临时任务")
    print("• 重要清理放在主进程，用 atexit 或 try/finally")
`,
  },
];
