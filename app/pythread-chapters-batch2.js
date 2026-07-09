// =============================================================
// Python 线程与进程教程 - batch2
// 章节 9-18：线程同步工具 + 线程池 + Queue
// =============================================================

export const chapters = [
  // -----------------------------------------------------------
  // 第 9 章：Lock 互斥锁
  // -----------------------------------------------------------
  {
    id: "pythread-09",
    group: "threading 多线程",
    icon: "🔒",
    title: "Lock 互斥锁——解决竞态条件",
    content: `## 什么是竞态条件（Race Condition）？

当多个线程**同时读写同一个共享变量**时，由于"读-改-写"不是原子操作（中间可能被其他线程打断），会导致数据错误。这叫**竞态条件**。

经典例子：\`count += 1\` 看起来是一行代码，实际分三步：
1. 读取 \`count\` 的值
2. 加 1
3. 写回 \`count\`

如果两个线程同时执行，可能发生：
\`\`\`
线程A: 读到 count=0
                线程B: 读到 count=0
线程A: 0+1=1
                线程B: 0+1=1
线程A: 写回 count=1
                线程B: 写回 count=1   ← 期望是2，实际是1！
\`\`\`

## 解决方案：Lock 互斥锁

\`threading.Lock\` 是最基础的同步工具：同一时刻只允许一个线程持有锁，其他线程必须等待。

\`\`\`python
lock = threading.Lock()       # 创建锁

lock.acquire()                # 获取锁（拿不到就阻塞等待）
# 临界区：同一时刻只有一个线程能进这里
count += 1  # count 累加
lock.release()                # 释放锁，让其他线程能获取
\`\`\`

### 推荐：用 with 自动管理锁

\`\`\`python
lock = threading.Lock()
with lock:                    # 进入时自动 acquire，离开时自动 release
    count += 1                # 即使中间出异常，锁也会被释放
\`\`\`

\`with\` 写法更安全，**强烈推荐**——避免忘记 \`release\` 导致死锁。

## Lock 的阻塞与非阻塞

- \`lock.acquire()\`：阻塞式，拿不到锁就等（默认）
- \`lock.acquire(blocking=False)\`：非阻塞式，拿不到立即返回 \`False\`
- \`lock.acquire(timeout=5)\`：限时等待，5秒拿不到返回 \`False\`
- \`lock.locked()\`：查询锁是否被某线程持有（返回 \`True\`/\`False\`），常用于调试

## 死锁的两种常见诱因

1. **忘记 release**：\`acquire\` 后异常退出没释放 → 用 \`with\` 解决
2. **重复 acquire**：同一线程对同一把非可重入锁 acquire 两次 → 第二次永远等不到，用 \`RLock\`（下一章）

## demo：竞态条件与 Lock 的修复

下面 demo 分两部分：
1. **不加锁**：1000 个线程各对 \`count\` 加1，结果通常小于 1000
2. **加 Lock**：结果稳定是 1000`,
    code: `# 第九章 demo：竞态条件与 Lock 互斥锁
import threading
import time

count = 0                       # 共享变量

def add_without_lock():
    """不加锁：count += 1 不是原子操作，多线程下会出错"""
    global count
    # 显式拆成"读-改-写"三步，并用 sleep(0) 主动让出 GIL，
    # 大幅增加线程切换概率，让竞态条件稳定复现
    tmp = count                 # 第1步：读取当前值
    time.sleep(0)               # 主动让出 GIL，此时其他线程可能读到同样的旧值
    count = tmp + 1             # 第2步：基于旧值+1 后写回（覆盖了其他线程的写入）

def add_with_lock(lock):
    """加锁：保证'读-改-写'整个不被打断"""
    global count
    with lock:                  # 进入临界区（自动 acquire）
        count += 1              # 同一时刻只有一个线程能执行这行
    # 离开 with 自动 release，即使这里出异常锁也会释放

# ============================================================
# 实验1：不加锁，1000个线程各自 count += 1
# ============================================================
print("=" * 55)
print("实验1：不加锁（竞态条件）")
print("=" * 55)
count = 0
threads = []
for _ in range(1000):
    t = threading.Thread(target=add_without_lock)
    threads.append(t)
    t.start()
for t in threads:
    t.join()
print(f"  期望 count = 1000")
print(f"  实际 count = {count}")
print(f"  差了 {1000 - count} —— 这就是竞态条件造成的丢失\\n")

# ============================================================
# 实验2：加 Lock，1000个线程各自 count += 1
# ============================================================
print("=" * 55)
print("实验2：加 Lock 互斥锁")
print("=" * 55)
count = 0
lock = threading.Lock()         # 创建一把锁
threads = []
for _ in range(1000):
    t = threading.Thread(target=add_with_lock, args=(lock,))
    threads.append(t)
    t.start()
for t in threads:
    t.join()
print(f"  期望 count = 1000")
print(f"  实际 count = {count}")
print(f"  加锁后结果正确 ✓\\n")

# ============================================================
# 实验3：acquire 的阻塞与非阻塞
# ============================================================
print("=" * 55)
print("实验3：acquire 的 blocking=False 和 timeout")
print("=" * 55)
lock2 = threading.Lock()
lock2.acquire()                 # 主线程先拿走锁，不释放

# 非阻塞尝试：拿不到立即返回 False
got = lock2.acquire(blocking=False)
print(f"  非阻塞获取: {got} (已被占用，拿不到)")

# 限时等待：0.5秒拿不到返回 False（这里会等0.5秒）
got = lock2.acquire(timeout=0.5)
print(f"  限时0.5秒获取: {got} (超时没拿到)")

lock2.release()                 # 释放锁
got = lock2.acquire(blocking=False)
print(f"  释放后非阻塞获取: {got} (现在能拿到了)")
lock2.release()

print("\\n要点：")
print("• 竞态条件：'读-改-写'非原子，多线程下数据出错")
print("• Lock 互斥锁：同一时刻只允许一个线程进入临界区")
print("• 强烈推荐 with lock: 写法，自动 acquire/release")
print("• acquire(blocking=False) 非阻塞，acquire(timeout=n) 限时")`,
  },

  // -----------------------------------------------------------
  // 第 10 章：RLock 可重入锁
  // -----------------------------------------------------------
  {
    id: "pythread-10",
    group: "threading 多线程",
    icon: "🔁",
    title: "RLock 可重入锁——同一线程可多次加锁",
    content: `## Lock 的问题：同一线程不能重复 acquire

\`Lock\` 是"不可重入"的——同一线程对它 \`acquire\` 两次会**死锁**：

\`\`\`python
lock = threading.Lock()
lock.acquire()                # 获取锁
lock.acquire()                # 死锁！第二次 acquire 永远等不到（锁被自己占着）
\`\`\`

这看起来很蠢，谁会自己锁自己？但实际开发中很常见——**函数嵌套调用**：

\`\`\`python
lock = threading.Lock()

def outer():
    with lock:          # 加锁
        inner()         # 调 inner，inner 也要加锁 → 死锁！

def inner():
    with lock:          # 同一把锁，再 acquire → 死锁
        print("hello")
\`\`\`

\`outer\` 持有锁时调 \`inner\`，\`inner\` 又要拿同一把锁——但锁被 \`outer\` 占着，\`inner\` 永远等不到。

## RLock 解决：可重入锁

\`threading.RLock\`（Reentrant Lock）允许**同一线程**多次 \`acquire\`，不会死锁。它内部记录了"持有锁的线程"和"加锁次数"，必须 **acquire 多少次就 release 多少次**才会真正释放。

\`\`\`python
rlock = threading.RLock()
rlock.acquire()             # 获取锁（计数+1）
rlock.acquire()             # 同一线程可以再 acquire，不死锁（计数+1）
rlock.release()             # 释放锁（计数-1）
rlock.release()             # 必须 release 两次才真正释放（计数归0）
\`\`\`

用 \`with\` 更清晰，嵌套的 with 会自动配对：

\`\`\`python
rlock = threading.RLock()
with rlock:       # acquire 1次
    with rlock:   # acquire 2次（同线程，OK）
        print("hello")
    # 这里 release 1次，但锁还没真正释放
# 这里 release 第2次，锁真正释放
\`\`\`

## Lock vs RLock 对比

| 特性 | Lock | RLock |
|------|------|-------|
| 同线程多次 acquire | 死锁 | 允许（计数+1） |
| 跨线程 acquire | 互斥 | 互斥 |
| 性能 | 略快 | 略慢（要维护计数） |
| 适用场景 | 简单互斥 | 函数嵌套加锁、递归加锁 |

## 什么时候用 RLock？

- **递归函数加锁**：函数递归调用自己，每层都加锁
- **方法嵌套调用**：A 方法加锁后调 B 方法，B 也加锁
- **不确定是否会被嵌套调用**：用 RLock 更安全

## demo：Lock 死锁 vs RLock 正常

下面 demo 演示 Lock 嵌套加锁会死锁（用超时避免卡死），RLock 嵌套加锁正常工作。`,
    code: `# 第十章 demo：Lock 死锁 vs RLock 可重入
import threading
import time

# ============================================================
# 实验1：Lock 嵌套加锁会死锁（用 timeout 避免 demo 卡死）
# ============================================================
print("=" * 55)
print("实验1：Lock 同线程两次 acquire → 死锁")
print("=" * 55)

lock = threading.Lock()

def lock_deadlock():
    """用 Lock，同线程 acquire 两次会死锁"""
    with lock:                       # 第一次 acquire（成功）
        print("  已获取锁，准备再次获取同一把锁...")
        # 用 timeout=0.5 避免永远卡死，0.5秒拿不到就放弃
        got = lock.acquire(timeout=0.5)
        if got:
            print("  第二次获取成功")
            lock.release()
        else:
            print("  第二次获取失败 —— 死锁！Lock 不允许同线程重复加锁")

lock_deadlock()
print()

# ============================================================
# 实验2：RLock 同线程多次 acquire 正常工作
# ============================================================
print("=" * 55)
print("实验2：RLock 同线程多次 acquire → 正常")
print("=" * 55)

rlock = threading.RLock()

def inner():
    """内层函数也要加锁"""
    with rlock:                      # 同线程第2次 acquire，RLock 允许
        print("  [inner] 第二次加锁成功（RLock 可重入）")
        print("  [inner] 执行 inner 逻辑")

def outer():
    """外层函数加锁后调用 inner"""
    with rlock:                      # 同线程第1次 acquire
        print("  [outer] 第一次加锁成功")
        inner()                      # 调 inner，里面又加锁
        print("  [outer] inner 返回后继续执行")
    # 离开两个 with，release 两次，锁真正释放

outer()
print()

# ============================================================
# 实验3：RLock 跨线程仍然互斥
# ============================================================
print("=" * 55)
print("实验3：RLock 跨线程依然互斥（保护共享数据）")
print("=" * 55)

rlock2 = threading.RLock()
shared = []

def worker(tag):
    """不同线程对 RLock 互斥，安全操作 shared"""
    with rlock2:
        shared.append(tag)
        # 模拟在锁内做点事
        time.sleep(0.05)
        print(f"  [{tag}] 写入完成，shared={shared}")

threads = [threading.Thread(target=worker, args=(f"T{i}",)) for i in range(3)]
for t in threads: t.start()
for t in threads: t.join()

print("\\n要点：")
print("• Lock 同线程 acquire 两次会死锁")
print("• RLock 允许同线程多次 acquire，acquire 多少次就 release 多少次")
print("• RLock 跨线程依然互斥，能保护共享数据")
print("• 适用：递归加锁、方法嵌套加锁")`,
  },

  // -----------------------------------------------------------
  // 第 11 章：Semaphore 信号量
  // -----------------------------------------------------------
  {
    id: "pythread-11",
    group: "threading 多线程",
    icon: "🚦",
    title: "Semaphore 信号量——限制并发数",
    content: `## 信号量是什么？

\`Lock\` 是"同一时刻只允许1个线程"的特例。\`Semaphore\`（信号量）是更通用的版本——**允许同时有 N 个线程进入临界区**。

可以把信号量想象成"停车场"：
- 停车场有 N 个车位（初始值 N）
- 车进来：车位 -1（acquire）
- 车出去：车位 +1（release）
- 车位为 0 时，新车只能在外面等

## 基本用法

\`\`\`python
# 创建一个最多允许3个线程同时持有的信号量
sem = threading.Semaphore(3)

sem.acquire()      # 计数-1，若已是0则阻塞等待
# 临界区（最多3个线程能同时在这里）
sem.release()      # 计数+1，唤醒一个等待的线程
\`\`\`

推荐 \`with\` 写法：
\`\`\`python
sem = threading.Semaphore(3)
with sem:
    # 最多3个线程同时进入
    do_work()
\`\`\`

## 典型应用场景

1. **限制并发请求数**：爬虫同时最多 10 个连接，避免被封 IP
2. **限制数据库连接池**：最多 5 个连接同时使用
3. **限流**：接口每秒最多处理 N 个请求
4. **资源池**：固定数量的资源被多个线程复用

## BoundedSemaphore vs Semaphore

| 类型 | 特点 |
|------|------|
| \`Semaphore(n)\` | release 次数可以多于 acquire（计数能超过初始值） |
| \`BoundedSemaphore(n)\` | release 不能多于 acquire，否则报错（更安全） |

**推荐用 \`BoundedSemaphore\`**——它能帮你发现"release 多了"的 bug。

## demo：限制并发数

下面 demo 启动 10 个线程，但用信号量限制同时最多 3 个执行，观察"同时运行数"始终 ≤ 3。`,
    code: `# 第十一章 demo：Semaphore 限制并发数
import threading
import time

# ============================================================
# 实验1：Semaphore 限制同时最多3个线程
# ============================================================
print("=" * 55)
print("实验1：Semaphore(3) —— 10个线程但最多3个同时跑")
print("=" * 55)

# BoundedSemaphore 比 Semaphore 更安全：release 多了会报错
sem = threading.BoundedSemaphore(3)
current_running = 0               # 当前正在运行的线程数（用于观察）
running_lock = threading.Lock()   # 保护 current_running 的小锁

def worker(tag):
    """每个线程进入时 running+1，离开时 running-1"""
    global current_running
    with sem:                     # 获取信号量（最多3个能同时拿到）
        with running_lock:
            current_running += 1
            print(f"  [{tag}] 开始 (当前并发={current_running})")
        time.sleep(0.3)           # 模拟工作
        with running_lock:
            current_running -= 1
            print(f"  [{tag}] 结束")

threads = [threading.Thread(target=worker, args=(f"T{i}",)) for i in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()
print("  全部完成\\n")

# ============================================================
# 实验2：模拟限流——限制对"外部资源"的并发访问
# ============================================================
print("=" * 55)
print("实验2：模拟数据库连接池限流（最多2个连接）")
print("=" * 55)

# 模拟一个数据库连接池：最多2个连接
pool_sem = threading.BoundedSemaphore(2)

def query_db(sql, tag):
    """模拟查询数据库：必须先拿到'连接'才能查"""
    print(f"  [{tag}] 申请连接: {sql}")
    with pool_sem:                # 拿连接（最多2个同时）
        print(f"  [{tag}] 获得连接，开始查询...")
        time.sleep(0.4)           # 模拟查询耗时
        print(f"  [{tag}] 查询完成，归还连接")

threads = []
for i, sql in enumerate(["SELECT 1", "SELECT 2", "SELECT 3", "SELECT 4", "SELECT 5"]):
    t = threading.Thread(target=query_db, args=(sql, f"查询{i+1}"))
    threads.append(t)
    t.start()
for t in threads:
    t.join()

print("\\n要点：")
print("• Semaphore(n) 允许最多 n 个线程同时进入临界区")
print("• BoundedSemaphore 更安全（release 多了会报错）")
print("• 典型用途：限制并发连接数、限流、资源池")
print("• Lock 相当于 Semaphore(1) 的特例")`,
  },

  // -----------------------------------------------------------
  // 第 12 章：Event 事件
  // -----------------------------------------------------------
  {
    id: "pythread-12",
    group: "threading 多线程",
    icon: "📢",
    title: "Event 事件——线程间通知",
    content: `## Event 是什么？

\`threading.Event\` 是最简单的线程间通信机制：一个线程"等通知"，另一个线程"发通知"。

可以想象成一个"红绿灯"：
- Event 内部有一个标志位（True/False）
- \`wait()\`：标志为 False 时阻塞等待；为 True 时立即返回
- \`set()\`：把标志设为 True，唤醒所有等待的线程
- \`clear()\`：把标志设回 False
- \`is_set()\`：查询当前标志状态

## 基本用法

\`\`\`python
event = threading.Event()

def waiter():
    print("等待通知...")
    event.wait()          # 阻塞，直到有人 event.set()
    print("收到通知，继续")

def notifier():
    time.sleep(2)
    event.set()           # 发通知，唤醒 waiter
\`\`\`

## wait(timeout) 限时等待

\`\`\`python
event.wait(timeout=5)     # 最多等5秒，5秒内没 set 也返回
if event.is_set():
    print("收到了通知")
else:
    print("超时，没等到通知")
\`\`\`

## Event vs Lock 的区别

| 特性 | Lock | Event |
|------|------|-------|
| 目的 | 互斥（一次一个） | 通知（一对多广播） |
| 唤醒 | release 唤醒一个 | set 唤醒所有等待的 |
| 状态 | 锁住/未锁住 | 标志 True/False |
| 典型场景 | 保护共享数据 | "开始/停止"信号、就绪通知 |

## 典型应用场景

1. **启动信号**：多个工作线程等"开始"指令同时起跑
2. **优雅停止**：主线程 set 一个 stop 事件，工作线程检测后退出
3. **就绪通知**：资源准备好后通知等待的线程
4. **周期性检查**：用 \`wait(timeout)\` 实现可中断的定时检查

## demo：Event 的典型用法

下面 demo 演示：
1. 多个线程等"开始"信号同时起跑
2. 工作线程通过 Event 实现"可停止的循环"`,
    code: `# 第十二章 demo：Event 事件通知
import threading
import time
import datetime

# ============================================================
# 实验1：多个线程等"开始"信号同时起跑
# ============================================================
print("=" * 55)
print("实验1：发令枪——多个线程等 start_event 同时起跑")
print("=" * 55)

start_event = threading.Event()

def runner(tag):
    """运动员：等到发令枪响才起跑"""
    print(f"  [{tag}] 已就位，等待发令...")
    start_event.wait()                  # 阻塞等待 set()
    print(f"  [{tag}] 起跑！({datetime.datetime.now().strftime('%H:%M:%S.%f')[:-3]})")

# 3个运动员就位
threads = [threading.Thread(target=runner, args=(f"运动员{i+1}",)) for i in range(3)]
for t in threads:
    t.start()

time.sleep(1)                           # 裁判准备1秒
print("  >>> 裁判：发令枪响！")
start_event.set()                       # 发通知，所有运动员同时起跑

for t in threads:
    t.join()
print()

# ============================================================
# 实验2：可停止的循环（优雅停止工作线程）
# ============================================================
print("=" * 55)
print("实验2：stop_event —— 优雅停止后台线程")
print("=" * 55)

stop_event = threading.Event()

def background_worker():
    """后台工作线程：循环检测 stop_event，收到就停"""
    i = 0
    # wait(timeout) 既可等待 set，又不会空转浪费 CPU
    while not stop_event.is_set():      # 检查是否该停
        i += 1
        print(f"  [后台] 工作 {i}...")
        # 用 wait(timeout) 替代 sleep，好处是 set() 能立即唤醒
        if stop_event.wait(timeout=0.3):
            # wait 返回 True 表示事件被 set，即收到停止信号
            break
    print(f"  [后台] 收到停止信号，退出（共工作 {i} 次）")

t = threading.Thread(target=background_worker, daemon=True)
t.start()

time.sleep(1.2)                         # 主线程让后台跑一会儿
print("  >>> 主线程：发送停止信号")
stop_event.set()                        # 通知后台线程停止
t.join(timeout=1)
print()

# ============================================================
# 实验3：wait 超时返回值
# ============================================================
print("=" * 55)
print("实验3：wait(timeout) 的返回值")
print("=" * 55)
ev = threading.Event()
# 没人 set，wait 会等超时返回 False
result = ev.wait(timeout=0.3)
print(f"  无人 set，等0.3秒后返回: {result} (False=超时)")
ev.set()
result = ev.wait(timeout=1)
print(f"  已 set，立即返回: {result} (True=收到事件)")
ev.clear()                              # 清除标志，恢复初始

print("\\n要点：")
print("• Event 用 set/wait/clear/is_set 实现线程间通知")
print("• set() 唤醒所有 wait 的线程（一对多广播）")
print("• wait(timeout) 返回 True=收到事件，False=超时")
print("• 典型用途：启动信号、优雅停止、就绪通知")`,
  },

  // -----------------------------------------------------------
  // 第 13 章：Condition 条件变量
  // -----------------------------------------------------------
  {
    id: "pythread-13",
    group: "threading 多线程",
    icon: "🤝",
    title: "Condition 条件变量——生产消费模型",
    content: `## Condition 是什么？

\`threading.Condition\` 是更高级的同步工具：它**结合了锁和等待/通知机制**，用于"等待某个条件成立"的场景。

典型场景：**生产者-消费者模型**
- 消费者：队列空了就等，有数据了再取
- 生产者：生产数据后通知等待的消费者

\`Event\` 只能"通知一次"，\`Condition\` 能"重复通知"，且配合锁保护共享状态。

## 核心 API

\`\`\`python
cond = threading.Condition()

# 消费者：等待条件成立
with cond:
    while not has_data():           # 用 while 不用 if（防虚假唤醒）
        cond.wait()                  # 释放锁并等待，被 notify 唤醒后重新拿锁
    data = take_data()

# 生产者：改变条件后通知
with cond:
    put_data(new_data)
    cond.notify()                    # 唤醒一个等待的线程
    # cond.notify_all() 唤醒所有等待的线程
\`\`\`

## 为什么 wait 要放在 while 里？

\`wait()\` 可能有**虚假唤醒**（spurious wakeup）——线程没被 notify 也会醒。所以醒来后必须**再次检查条件**，用 \`while\` 而非 \`if\`：

\`\`\`python
with cond:
    while not has_data():    # 正确：醒来后再检查一次
        cond.wait()
    # 此时条件成立，安全取数据
\`\`\`

## notify vs notify_all

| 方法 | 作用 |
|------|------|
| \`notify(n=1)\` | 唤醒 n 个等待的线程（默认1个） |
| \`notify_all()\` | 唤醒所有等待的线程 |

- 只有一个等待线程时，用 \`notify()\`
- 多个等待线程、或条件对所有线程都有效时，用 \`notify_all()\`

## wait_for()：更简洁的条件等待

\`wait_for(predicate, timeout=None)\` 会反复调用 \`predicate()\`，直到返回 \`True\` 才继续，等价于手写 \`while + wait\`：

\`\`\`python
# 等到 buffer 非空，比手写 while + wait 更简洁
with cond:
    cond.wait_for(lambda: len(buffer) > 0)
    data = buffer.pop(0)
\`\`\`

返回 \`True\` 表示条件成立，\`False\` 表示超时。底层原理和 \`while + wait\` 相同，只是封装更简洁。

## Condition 内部的锁

\`Condition\` 内部自带一把锁（默认是 \`RLock\`）。调用 \`wait/notify\` **必须先持有这把锁**（即在 \`with cond\` 内部）。\`wait()\` 会临时释放锁让其他线程进来，被唤醒后又重新拿锁。

## demo：生产者-消费者模型

下面 demo 用 Condition 实现经典的生产者-消费者：一个共享队列，生产者往里放数据，消费者从里取数据，队列空时消费者等待，有数据时通知消费者。`,
    code: `# 第十三章 demo：Condition 实现生产者-消费者
import threading
import time
import random

# 共享缓冲区（用 list 模拟队列）
buffer = []
BUFFER_MAX = 3                       # 缓冲区最大容量

# Condition 内部自带一把锁
cond = threading.Condition()

def producer(tag):
    """生产者：往 buffer 放数据，满了就等"""
    for i in range(3):
        with cond:                   # 必须先拿锁才能 wait/notify
            # 缓冲区满时等待
            while len(buffer) >= BUFFER_MAX:
                print(f"  [{tag}] 缓冲区满，等待...")
                cond.wait()          # 释放锁并等，被 notify 后重新拿锁
            # 条件满足：缓冲区没满
            item = f"{tag}-物品{i}"
            buffer.append(item)
            print(f"  [{tag}] 生产 {item}，缓冲区={buffer}")
            cond.notify_all()        # 通知所有等待的消费者：有数据了
        time.sleep(random.uniform(0.1, 0.3))   # 模拟生产耗时（不在锁内）

def consumer(tag):
    """消费者：从 buffer 取数据，空了就等"""
    for i in range(3):
        with cond:
            # 缓冲区空时等待
            while not buffer:
                print(f"  [{tag}] 缓冲区空，等待...")
                cond.wait()
            # 条件满足：缓冲区有数据
            item = buffer.pop(0)
            print(f"  [{tag}] 消费 {item}，缓冲区={buffer}")
            cond.notify_all()        # 通知生产者：有空位了
        time.sleep(random.uniform(0.1, 0.3))   # 模拟消费耗时（不在锁内）

print("=" * 55)
print("生产者-消费者模型（Condition 实现）")
print("=" * 55)

threads = [
    threading.Thread(target=producer, args=("生产者A",)),
    threading.Thread(target=producer, args=("生产者B",)),
    threading.Thread(target=consumer, args=("消费者X",)),
    threading.Thread(target=consumer, args=("消费者Y",)),
]
for t in threads: t.start()
for t in threads: t.join()

print("\\n所有生产消费完成。")
print("\\n要点：")
print("• Condition = 锁 + 等待/通知机制，用于等待条件成立")
print("• wait() 必须在 with cond 内，且用 while 检查条件（防虚假唤醒）")
print("• notify() 唤醒一个，notify_all() 唤醒所有")
print("• wait 会临时释放锁，被唤醒后重新拿锁")
print("• 生产者-消费者是 Condition 的经典应用")`,
  },

  // -----------------------------------------------------------
  // 第 14 章：Barrier 栅栏
  // -----------------------------------------------------------
  {
    id: "pythread-14",
    group: "threading 多线程",
    icon: "🚧",
    title: "Barrier 栅栏——线程集合点",
    content: `## Barrier 是什么？

\`threading.Barrier\`（栅栏）让**多个线程到达某个点后一起等待，凑齐指定数量后同时放行**。

想象几个人约好"大家都在门口集合，人到齐了一起进去"——Barrier 就是这个"门口"。

## 基本用法

\`\`\`python
# 创建一个需要3个线程到达才放行的栅栏
barrier = threading.Barrier(3)

def worker():
    do_phase1()
    barrier.wait()       # 等3个线程都到这，才一起继续
    do_phase2()          # 3个线程同时开始 phase2
\`\`\`

\`barrier.wait()\` 会阻塞，直到指定数量的线程都调用了 \`wait\`，然后**所有等待的线程同时被唤醒**继续执行。

## 典型应用场景

1. **多阶段任务**：所有线程完成阶段1后，才能开始阶段2
2. **并行计算同步**：每个线程算一部分，到齐后合并结果再算下一步
3. **赛跑游戏**：所有玩家加载完毕才开始游戏

## Barrier 的特殊功能

### action 回调
\`\`\`python
# 凑齐后自动执行 action 函数（只执行一次）
barrier = threading.Barrier(3, action=lambda: print("人到齐了！"))
\`\`\`

### wait(timeout) 超时
\`\`\`python
barrier.wait(timeout=5)   # 5秒没凑齐就抛 BrokenBarrierError
\`\`\`

### abort() 主动破坏
\`\`\`python
barrier.abort()           # 让所有正在 wait 的线程立即抛 BrokenBarrierError
\`\`\`
用于"某个线程出错了，告诉其他线程别等了"。

## Barrier 被破坏后会怎样？

一旦 Barrier 被"打破"（超时或 abort），之后所有 \`wait()\` 都会立即抛 \`BrokenBarrierError\`，栅栏失效。这是为了"一个出错全员停止"的设计。

## demo：多阶段任务同步

下面 demo 模拟3个玩家"加载→同步开始→比赛"的过程。`,
    code: `# 第十四章 demo：Barrier 栅栏同步
import threading
import time
import random
import datetime

# ============================================================
# 实验1：3个线程在两个阶段间用 Barrier 同步
# ============================================================
print("=" * 55)
print("实验1：3个玩家加载完毕后同时开始比赛")
print("=" * 55)

# Barrier(3)：需要3个线程到达才放行
# action：凑齐后自动执行一次（只执行一次）
def all_ready():
    print("  >>> [裁判] 所有人已就位，比赛开始！")

barrier = threading.Barrier(3, action=all_ready)

def player(name):
    """玩家：先加载（耗时不一），到齐后同时开始比赛"""
    # 阶段1：加载
    load_time = random.uniform(0.3, 1.0)
    print(f"  [{name}] 开始加载（需 {load_time:.2f}s）")
    time.sleep(load_time)
    print(f"  [{name}] 加载完成，在起跑线等待其他人")
    barrier.wait()                    # 等所有人都加载完
    # 阶段2：比赛（所有人同时开始）
    print(f"  [{name}] 开始比赛！({datetime.datetime.now().strftime('%H:%M:%S.%f')[:-3]})")
    time.sleep(random.uniform(0.2, 0.5))
    print(f"  [{name}] 到达终点")

threads = [threading.Thread(target=player, args=(f"玩家{i+1}",)) for i in range(3)]
for t in threads: t.start()
for t in threads: t.join()
print()

# ============================================================
# 实验2：Barrier 超时被破坏
# ============================================================
print("=" * 55)
print("实验2：Barrier 超时 → BrokenBarrierError")
print("=" * 55)

# 需要3个线程，但只起2个，第3个永远不到 → 超时
barrier2 = threading.Barrier(3)

def runner(name, delay):
    time.sleep(delay)
    try:
        # 限时0.5秒，凑不齐3个就抛异常
        barrier2.wait(timeout=0.5)
        print(f"  [{name}] 通过栅栏")
    except threading.BrokenBarrierError:
        print(f"  [{name}] 栅栏被打破（超时没凑齐）")

# 只起2个线程，永远凑不齐3个
t1 = threading.Thread(target=runner, args=("A", 0.1))
t2 = threading.Thread(target=runner, args=("B", 0.2))
t1.start(); t2.start()
t1.join(); t2.join()
print()

# ============================================================
# 实验3：多阶段并行计算（每阶段同步一次）
# ============================================================
print("=" * 55)
print("实验3：多阶段任务，每阶段用 Barrier 同步")
print("=" * 55)

barrier3 = threading.Barrier(3)
results = {"phase1": [], "phase2": [], "phase3": []}
results_lock = threading.Lock()

def compute(worker_id):
    """3个worker，每个完成3个阶段，阶段间同步"""
    for phase in ["phase1", "phase2", "phase3"]:
        time.sleep(random.uniform(0.1, 0.3))   # 模拟计算
        val = worker_id * 10 + int(phase[-1])
        with results_lock:
            results[phase].append(val)
        print(f"  [W{worker_id}] {phase} 完成 (val={val})，等其他人")
        barrier3.wait()                # 等所有worker完成本阶段
        print(f"  [W{worker_id}] 进入下一阶段")

threads = [threading.Thread(target=compute, args=(i,)) for i in range(3)]
for t in threads: t.start()
for t in threads: t.join()
print(f"  最终结果: {results}")

print("\\n要点：")
print("• Barrier(n) 让 n 个线程在 wait() 处集合，凑齐后同时放行")
print("• action 参数：凑齐后自动执行一次的回调")
print("• 超时或 abort() 会'打破'栅栏，抛 BrokenBarrierError")
print("• 适用：多阶段任务同步、并行计算分阶段汇总")`,
  },

  // -----------------------------------------------------------
  // 第 15 章：queue.Queue
  // -----------------------------------------------------------
  {
    id: "pythread-15",
    group: "threading 多线程",
    icon: "📥",
    title: "queue.Queue 线程安全队列",
    content: `## 为什么要用 Queue？

前面我们用 \`list\` 当共享缓冲区时，每次操作都要手动加锁，容易出错。\`queue.Queue\` 是 Python 提供的**线程安全队列**，内部已经加好锁，直接用就行——**生产者消费者模型的首选**。

## 三种队列

| 类 | 特点 |
|----|------|
| \`queue.Queue\` | 先进先出（FIFO），最常用 |
| \`queue.LifoQueue\` | 后进先出（LIFO），像栈 |
| \`queue.PriorityQueue\` | 按优先级出队（值小的先出） |

## 核心 API

\`\`\`python
import queue

q = queue.Queue(maxsize=5)   # 最大容量5（默认无限）

q.put(item)                  # 入队（满了阻塞等待）
q.put(item, block=False)     # 入队（满了立即抛 Full）
q.put(item, timeout=2)       # 入队（最多等2秒）

q.get()                      # 出队（空了阻塞等待）
q.get(block=False)           # 出队（空了立即抛 Empty）
q.get(timeout=2)             # 出队（最多等2秒，超时抛 Empty）

q.qsize()                    # 当前队列长度（近似值）
q.empty()                    # 是否为空
q.full()                     # 是否满
q.task_done()                # 标记一个 put 的任务已被处理完
q.join()                     # 等所有 put 的任务都被 task_done
\`\`\`

## task_done() 和 join() 的配合

这是 Queue 最巧妙的设计，用于"等待所有任务处理完"：

\`\`\`python
q = queue.Queue()
# 生产者每 put 一次，计数器 +1
q.put(item1)
q.put(item2)
# 消费者每处理完一个，调 task_done，计数器 -1
q.get(); q.task_done()
q.get(); q.task_done()
q.join()   # 等计数器归0（所有 put 都被 task_done 了）
\`\`\`

主线程在 \`q.join()\` 处阻塞，直到所有任务都被处理完才继续。

## Queue vs 手动加锁的 list

| 方式 | 优点 | 缺点 |
|------|------|------|
| \`list + Lock\` | 灵活 | 要手动加锁，易出错 |
| \`queue.Queue\` | 线程安全、内置阻塞、有 task_done | 只能做队列操作 |

**结论**：生产者消费者场景，**优先用 \`queue.Queue\`**。

## demo：Queue 实现生产者消费者

下面 demo 用 \`Queue\` 重写第13章的生产者消费者，对比会发现**代码简洁很多**，不用手动管理 Condition。`,
    code: `# 第十五章 demo：queue.Queue 线程安全队列
import threading
import queue
import time
import random

# ============================================================
# 实验1：Queue 基本操作
# ============================================================
print("=" * 55)
print("实验1：Queue / LifoQueue / PriorityQueue 对比")
print("=" * 55)

# FIFO 先进先出
q = queue.Queue()
for x in [1, 2, 3]:
    q.put(x)
print(f"  Queue(FIFO) 出队顺序: ", end="")
while not q.empty():
    print(q.get(), end=" ")
print()

# LIFO 后进先出
lq = queue.LifoQueue()
for x in [1, 2, 3]:
    lq.put(x)
print(f"  LifoQueue 出队顺序: ", end="")
while not lq.empty():
    print(lq.get(), end=" ")
print()

# PriorityQueue 优先级（值小先出）
pq = queue.PriorityQueue()
pq.put((3, "低优先")); pq.put((1, "高优先")); pq.put((2, "中优先"))
print(f"  PriorityQueue 出队: ", end="")
while not pq.empty():
    print(pq.get()[1], end=" ")
print("\\n")

# ============================================================
# 实验2：Queue 实现生产者-消费者（比 Condition 简洁）
# ============================================================
print("=" * 55)
print("实验2：Queue 实现生产者-消费者")
print("=" * 55)

q = queue.Queue(maxsize=3)         # 容量3的队列，put 满了会阻塞

def producer(tag):
    """生产者：往队列放数据"""
    for i in range(3):
        item = f"{tag}-{i}"
        q.put(item)                # 队列满时自动阻塞等待（无需手动加锁）
        print(f"  [{tag}] 生产 {item} (队列大小={q.qsize()})")
        time.sleep(random.uniform(0.1, 0.3))
    # 放一个 None 作为"结束信号"
    q.put(None)

def consumer(tag):
    """消费者：从队列取数据"""
    while True:
        item = q.get()             # 队列空时自动阻塞等待
        if item is None:           # 收到结束信号
            q.task_done()
            break
        print(f"  [{tag}] 消费 {item}")
        time.sleep(random.uniform(0.1, 0.3))
        q.task_done()              # 标记任务处理完

threads = [
    threading.Thread(target=producer, args=("P1",)),
    threading.Thread(target=consumer, args=("C1",)),
]
for t in threads: t.start()
for t in threads: t.join()
print()

# ============================================================
# 实验3：task_done + join 等所有任务完成
# ============================================================
print("=" * 55)
print("实验3：q.join() 等所有任务处理完")
print("=" * 55)

q2 = queue.Queue()

def worker(tag):
    """处理队列里的所有任务"""
    while True:
        item = q2.get()
        if item is None:
            q2.task_done()
            break
        print(f"  [{tag}] 处理 {item}")
        time.sleep(0.1)
        q2.task_done()             # 每处理完一个就 task_done

# 启动一个 worker
threading.Thread(target=worker, args=("W",), daemon=True).start()

# 主线程放入5个任务
for i in range(5):
    q2.put(f"任务{i}")
# 放结束信号
q2.put(None)

# join 会阻塞直到所有 put 的项目都被 task_done
q2.join()
print("  >>> 所有任务处理完成！")

print("\\n要点：")
print("• Queue 线程安全，内部已加锁，生产消费首选")
print("• put/get 满了/空了会自动阻塞，可设 timeout")
print("• task_done() 标记处理完，join() 等所有任务完成")
print("• PriorityQueue 按优先级出队，LifoQueue 后进先出")`,
  },

  // -----------------------------------------------------------
  // 第 16 章：生产者消费者完整实战
  // -----------------------------------------------------------
  {
    id: "pythread-16",
    group: "threading 多线程",
    icon: "🏭",
    title: "生产者消费者模式完整实战",
    content: `## 为什么这个模式这么重要？

生产者-消费者模式是**最常用的并发设计模式**，几乎所有的"任务队列"系统都是它的变体：
- Web 服务器：请求是生产者，处理线程是消费者
- 消息队列：Kafka/RabbitMQ 本质就是生产者消费者
- 日志系统：业务线程生产日志，刷盘线程消费
- 爬虫：URL 生产者 + 下载消费者

## 模式结构

\`\`\`
[生产者1] ─┐
[生产者2] ─┼──> [ 队列 Queue ] ──> [消费者1]
[生产者3] ─┘                       [消费者2]
\`\`\`

- **生产者**：负责产生任务，放入队列
- **队列**：缓冲区，解耦生产和消费的速度差异
- **消费者**：从队列取任务处理

## 好处

1. **解耦**：生产者不用知道谁消费，消费者不用知道谁生产
2. **削峰**：生产速度 > 消费速度时，队列缓冲，消费者不被压垮
3. **并发**：多个生产者多个消费者并行工作

## 优雅关闭的关键：结束信号（毒丸）

多消费者场景下，如何通知消费者"没有新任务了，可以退出"？常用做法是放**结束信号**（poison pill）：

\`\`\`python
# 生产者放完所有任务后，放 N 个 None（N = 消费者数量）
for _ in range(num_consumers):
    q.put(None)

# 消费者取到 None 就退出
while True:
    item = q.get()
    if item is None:
        break
    process(item)
\`\`\`

## 完整实战：模拟日志处理系统

下面 demo 实现一个完整的日志处理系统：
- 多个生产者（模拟多个服务）产生日志
- 一个队列缓冲
- 多个消费者（日志处理线程）消费并"写盘"

包含：多生产者、多消费者、优雅关闭、统计处理数量。`,
    code: `# 第十六章 demo：完整的生产者-消费者实战（日志处理系统）
import threading
import queue
import time
import random

# 日志队列：缓冲生产者和消费者
log_queue = queue.Queue(maxsize=10)

# 统计：已处理多少条日志
processed_count = 0
count_lock = threading.Lock()

def log_producer(service_name, count):
    """生产者：模拟某个服务产生 count 条日志"""
    for i in range(count):
        log = f"[{service_name}] 日志#{i} 严重度={random.choice(['INFO','WARN','ERROR'])}"
        log_queue.put(log)                 # 队列满了自动阻塞
        print(f"  📤 [{service_name}] 产生: {log}")
        time.sleep(random.uniform(0.05, 0.2))

def log_consumer(consumer_id):
    """消费者：从队列取日志并'处理'（模拟写盘）"""
    global processed_count
    while True:
        log = log_queue.get()
        if log is None:                    # 结束信号（毒丸）
            log_queue.task_done()
            print(f"  📥 [消费者{consumer_id}] 收到结束信号，退出")
            return
        # 模拟写盘耗时
        time.sleep(random.uniform(0.05, 0.15))
        with count_lock:
            processed_count += 1
            print(f"  📥 [消费者{consumer_id}] 已写盘({processed_count}): {log}")
        log_queue.task_done()

print("=" * 55)
print("日志处理系统：3生产者 + 2消费者")
print("=" * 55)

NUM_CONSUMERS = 2

# 启动2个消费者
consumers = [threading.Thread(target=log_consumer, args=(i,)) for i in range(NUM_CONSUMERS)]
for t in consumers: t.start()

# 启动3个生产者
producers = [
    threading.Thread(target=log_producer, args=("Web服务", 3)),
    threading.Thread(target=log_producer, args=("DB服务", 3)),
    threading.Thread(target=log_producer, args=("缓存服务", 2)),
]
for t in producers: t.start()

# 等所有生产者完成
for t in producers:
    t.join()
print("  >>> 所有生产者完成，发送结束信号")

# 发送结束信号（每个消费者一个 None）
for _ in range(NUM_CONSUMERS):
    log_queue.put(None)

# 等所有消费者退出
for t in consumers:
    t.join()

print(f"\\n  ✅ 全部完成，共处理 {processed_count} 条日志")
print("\\n要点：")
print("• 生产者消费者模式解耦生产与消费，队列做缓冲")
print("• 多消费者场景用'结束信号(None)'通知退出（毒丸模式）")
print("• 队列满了/空了自动阻塞，无需手动加锁")
print("• task_done + join 可等待所有任务完成")`,
  },

  // -----------------------------------------------------------
  // 第 17 章：ThreadPoolExecutor 线程池
  // -----------------------------------------------------------
  {
    id: "pythread-17",
    group: "threading 多线程",
    icon: "🏊",
    title: "ThreadPoolExecutor 线程池",
    content: `## 为什么需要线程池？

手动创建线程有两个问题：
1. **创建/销毁开销**：频繁创建线程成本高
2. **数量失控**：开1万个线程会耗尽资源

**线程池**预先创建一批线程，任务来了复用空闲线程，任务完了线程不销毁而是回到池里等下一个任务。还**能拿到任务的返回值**——这是手动 \`Thread\` 做不到的。

## concurrent.futures.ThreadPoolExecutor

\`\`\`python
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=4) as executor:   # 4个线程的池
    # 提交任务，立即返回 Future 对象
    future = executor.submit(func, arg1, arg2)
    result = future.result()       # 阻塞等待结果
\`\`\`

## 三种用法

### 用法1：submit + 手动收集（最灵活）
\`\`\`python
with ThreadPoolExecutor(4) as ex:
    futures = [ex.submit(func, arg) for arg in args]
    results = [f.result() for f in futures]    # 按提交顺序等结果
\`\`\`

### 用法2：map（按顺序返回结果，最简洁）
\`\`\`python
with ThreadPoolExecutor(4) as ex:
    results = list(ex.map(func, args))    # 结果顺序和输入一致
\`\`\`

### 用法3：as_completed（谁先完成谁先处理）
\`\`\`python
from concurrent.futures import as_completed
with ThreadPoolExecutor(4) as ex:
    futures = [ex.submit(func, arg) for arg in args]
    for f in as_completed(futures):       # 谁先完成先yield
        print(f.result())
\`\`\`

## Future 对象

\`submit\` 返回的 \`Future\` 代表"未来会有结果的对象"：

| 方法 | 作用 |
|------|------|
| \`future.result(timeout=None)\` | 阻塞取结果（任务异常会在此抛出） |
| \`future.done()\` | 是否已完成 |
| \`future.running()\` | 是否正在运行 |
| \`future.cancel()\` | 尝试取消（还没开始才能取消） |
| \`future.add_done_callback(fn)\` | 完成后回调 \`fn(future)\` |

## ThreadPoolExecutor 的优势

1. **复用线程**：避免频繁创建销毁的开销
2. **限制数量**：\`max_workers\` 防止资源耗尽
3. **拿返回值**：通过 \`Future.result()\` 获取
4. **异常传播**：子线程异常在 \`result()\` 时抛出，便于处理
5. **自动管理**：\`with\` 结束自动 \`shutdown\` 等所有任务完成

## max_workers 怎么定？

- **IO 密集型**：可以多一些，如 \`2 * CPU核数\` 到几十
- **CPU 密集型**：多线程无意义（GIL），用 \`ProcessPoolExecutor\`

> **默认值**：Python 3.8+ 不传 \`max_workers\` 时默认为 \`min(32, os.cpu_count() + 4)\`。

## demo：三种用法对比

下面 demo 用三种方式并发下载"网页"（用 sleep 模拟），对比特点。`,
    code: `# 第十七章 demo：ThreadPoolExecutor 线程池三种用法
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

# 模拟"下载网页"：每个任务耗时不同
def download(url):
    """模拟下载一个URL，返回内容字符串（不同 URL 耗时不同）"""
    # 提取 URL 中的数字作为耗时因子；没有数字则用字符串长度
    digits = ''.join(c for c in url if c.isdigit())
    num = int(digits) if digits else len(url)
    secs = 0.2 + (num % 6) * 0.12
    time.sleep(secs)
    return f"{url} 的内容（耗时{secs:.2f}s）"

urls = [f"url_{i}.com" for i in range(6)]

# ============================================================
# 用法1：submit + 手动收集
# ============================================================
print("=" * 55)
print("用法1：submit + 手动收集（按提交顺序取结果）")
print("=" * 55)
start = time.time()
with ThreadPoolExecutor(max_workers=4) as ex:
    futures = [ex.submit(download, url) for url in urls]
    # 按提交顺序等结果
    for f in futures:
        print(f"  {f.result()}")
print(f"  耗时 {time.time()-start:.2f}s\\n")

# ============================================================
# 用法2：map（结果顺序与输入一致）
# ============================================================
print("=" * 55)
print("用法2：map（结果顺序与输入一致，最简洁）")
print("=" * 55)
start = time.time()
with ThreadPoolExecutor(max_workers=4) as ex:
    results = ex.map(download, urls)   # 返回迭代器，顺序与 urls 一致
    for r in results:
        print(f"  {r}")
print(f"  耗时 {time.time()-start:.2f}s\\n")

# ============================================================
# 用法3：as_completed（谁先完成谁先返回）
# ============================================================
print("=" * 55)
print("用法3：as_completed（谁先完成谁先返回）")
print("=" * 55)
start = time.time()
with ThreadPoolExecutor(max_workers=4) as ex:
    futures = {ex.submit(download, url): url for url in urls}
    for f in as_completed(futures):    # 谁先完成先yield
        print(f"  ✓ 完成: {f.result()}")
print(f"  耗时 {time.time()-start:.2f}s\\n")

# ============================================================
# Future 的方法演示
# ============================================================
print("=" * 55)
print("Future 对象的方法")
print("=" * 55)
with ThreadPoolExecutor(max_workers=2) as ex:
    f = ex.submit(download, "test.com")
    print(f"  提交后 done={f.done()}, running={f.running()}")
    result = f.result()                # 阻塞等结果
    print(f"  完成后 done={f.done()}")
    print(f"  结果: {result}")

# ============================================================
# 异常传播：子线程异常在 result() 时抛出
# ============================================================
print()
print("=" * 55)
print("异常传播：子线程的异常在 result() 抛出")
print("=" * 55)
def risky(x):
    """模拟可能出错的任务：x==3 时抛异常，演示异常传播"""
    if x == 3:
        raise ValueError(f"x={x} 出错啦！")
    return x * 2

with ThreadPoolExecutor(max_workers=3) as ex:
    futures = [ex.submit(risky, i) for i in range(5)]
    for i, f in enumerate(futures):
        try:
            print(f"  任务{i} 结果: {f.result()}")
        except ValueError as e:
            print(f"  任务{i} 异常: {e}")

print("\\n要点：")
print("• ThreadPoolExecutor 复用线程，能拿返回值，限制并发数")
print("• submit 返回 Future，result() 阻塞取结果（异常在此抛出）")
print("• map 按输入顺序返回结果，as_completed 谁先完成谁先返回")
print("• with 结束自动 shutdown，等所有任务完成")`,
  },

  // -----------------------------------------------------------
  // 第 18 章：Timer 定时器
  // -----------------------------------------------------------
  {
    id: "pythread-18",
    group: "threading 多线程",
    icon: "⏰",
    title: "Timer 定时器与重复定时",
    content: `## Timer 是什么？

\`threading.Timer\` 是 \`Thread\` 的子类，用于"**延迟一段时间后执行一次**任务"。

\`\`\`python
from threading import Timer

def hello():
    print("hello!")

# 5秒后执行 hello
t = Timer(5.0, hello)
t.start()        # 启动定时器（不会阻塞主线程）
\`\`\`

## Timer 的特点

1. **只执行一次**——不是周期性定时器
2. **可取消**——\`t.cancel()\` 在触发前取消
3. **默认非守护线程**——\`daemon\` 继承自创建它的线程（主线程是非守护，所以 Timer 默认也是非守护）。若希望主线程退出时未触发的 Timer 自动消失，可手动设 \`t.daemon = True\`
4. **可传参**——\`Timer(interval, func, args, kwargs)\`

## 如何实现"重复定时"？

Timer 本身只执行一次，要周期执行可以**递归创建**：

\`\`\`python
def repeated_task():
    print("每2秒执行一次")
    # 在任务末尾再创建一个 Timer，实现周期执行
    global timer
    timer = Timer(2.0, repeated_task)
    timer.start()

timer = Timer(2.0, repeated_task)
timer.start()
\`\`\`

更优雅的写法：用一个标志位控制是否继续。

## Timer vs sleep

| 方式 | 特点 |
|------|------|
| \`time.sleep(5); task()\` | 阻塞当前线程5秒 |
| \`Timer(5, task).start()\` | 不阻塞当前线程，5秒后在子线程执行 |

需要"延迟执行但不阻塞主流程"时，用 \`Timer\`。

## demo：Timer 的各种用法

下面 demo 演示：一次性定时、取消定时、重复定时。`,
    code: `# 第十八章 demo：Timer 定时器
import threading
import time

# ============================================================
# 实验1：一次性定时器
# ============================================================
print("=" * 55)
print("实验1：一次性定时器（2秒后执行）")
print("=" * 55)
print(f"  启动时间: {time.strftime('%H:%M:%S')}")

def say_hello(name):
    print(f"  [{time.strftime('%H:%M:%S')}] Hello, {name}! (定时触发)")

# Timer(间隔秒数, 函数, args=参数)
t = threading.Timer(2.0, say_hello, args=("Python",))
t.start()                         # 启动，主线程不阻塞
print(f"  [{time.strftime('%H:%M:%S')}] 定时器已启动，主线程继续干活")
time.sleep(0.5)
print(f"  [{time.strftime('%H:%M:%S')}] 主线程在做事...")
t.join()                          # 等定时器触发
print()

# ============================================================
# 实验2：取消定时器
# ============================================================
print("=" * 55)
print("实验2：在触发前取消定时器")
print("=" * 55)
def never_run():
    print("  这行不会打印")

t = threading.Timer(1.0, never_run)
t.start()
print(f"  [{time.strftime('%H:%M:%S')}] 定时器已启动（1秒后触发）")
time.sleep(0.3)
t.cancel()                        # 在触发前取消
print(f"  [{time.strftime('%H:%M:%S')}] 已取消定时器")
time.sleep(1)                     # 等过原定触发时间，确认不会触发
print("  确认：取消后定时器没有触发\\n")

# ============================================================
# 实验3：重复定时（递归创建 Timer）
# ============================================================
print("=" * 55)
print("实验3：重复定时（每0.4秒一次，共5次）")
print("=" * 55)

counter = {"n": 0}                # 用字典存可变状态
MAX_TIMES = 5
stop_flag = threading.Event()

def repeat_task():
    """周期任务：每次执行后再创建下一个 Timer，直到达到次数"""
    if stop_flag.is_set() or counter["n"] >= MAX_TIMES:
        print(f"  >>> 停止重复（已执行 {counter['n']} 次）")
        return
    counter["n"] += 1
    print(f"  第 {counter['n']} 次执行 ({time.strftime('%H:%M:%S')})")
    # 递归创建下一个定时器
    threading.Timer(0.4, repeat_task).start()

threading.Timer(0.4, repeat_task).start()
# 等足够时间让5次都执行完
time.sleep(3)
print()

# ============================================================
# 实验4：可中途停止的重复定时器
# ============================================================
print("=" * 55)
print("实验4：用 Event 控制重复定时器中途停止")
print("=" * 55)

stop_event = threading.Event()

def heartbeat():
    """心跳任务：每隔0.5秒一次，直到收到停止信号"""
    # 用 while 循环而非递归，避免长时间运行导致栈溢出
    while not stop_event.is_set():
        print(f"  [心跳] 嘭 ({time.strftime('%H:%M:%S')})")
        # 用 wait 替代 sleep：既能定时，又能被 set 立即唤醒
        if stop_event.wait(timeout=0.5):
            break                 # wait 返回 True 表示收到停止信号，退出循环
    print("  [心跳] 收到停止信号，停止")

threading.Thread(target=heartbeat, daemon=True).start()
time.sleep(1.8)
print("  >>> 主线程：发送停止信号")
stop_event.set()                  # 立即停止心跳
time.sleep(0.6)

print("\\n要点：")
print("• Timer(interval, func) 延迟 interval 秒执行一次 func")
print("• cancel() 在触发前可取消")
print("• 重复定时：递归创建 Timer，或用 Event.wait(timeout) 循环")
print("• sleep 阻塞当前线程，Timer 不阻塞（在子线程执行）")`,
  },
];
