// =============================================================
// Python 多线程入门（pythread2）—— 第三批章节
// -------------------------------------------------------------
// 章节 11-15：线程同步工具（RLock / Semaphore / Event / Condition / Timer）
// =============================================================
// 每个章节包含：
//   id      : 唯一标识（py2-11 ~ py2-15）
//   group   : 分组名（线程同步）
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解（含表格、代码块、列表、生活比喻）
//   code    : 可运行、带详细中文注释的 Python 示例代码（仅用标准库）
//
// 代码运行环境约束：
//   - 用 python3 直接运行
//   - 仅使用 Python 标准库（threading / time / random 等）
//   - 通过 print 输出结果，不使用 input()
//   - 演示死锁场景时用 timeout 机制避免真的卡住
//   - 生产者-消费者 demo 用计数器限制循环次数，保证程序能正常结束
// =============================================================

export const chapters = [
  // =========================================================
  // 第十一章：RLock 可重入锁
  // =========================================================
  {
    id: "py2-11",
    group: "线程同步",
    icon: "🔁",
    title: "RLock 可重入锁：同一线程多次获取",
    content: `## 一、先看一个"自找麻烦"的场景

上一章我们学了 \`Lock\` 互斥锁，它有个硬规则：**同一线程对同一把锁只能 acquire 一次**。如果再 acquire 第二次，线程会**永远卡住等自己释放锁**——可它自己正在等锁，根本不会去 release，这就是经典的**死锁**。

这种事什么时候会真的发生？最常见的就是**递归函数里加锁**。比如：

\`\`\`python
lock = threading.Lock()

def save_tree(node):
    lock.acquire()              # 进入函数先加锁
    # ... 处理当前节点 ...
    for child in node.children:
        save_tree(child)        # 递归调用：又会执行 lock.acquire()
    lock.release()              # 释放锁

save_tree(root)                 # 第二层递归时就死锁了
\`\`\`

第一次 \`acquire\` 成功后，递归进入第二层又调 \`acquire\`——锁已经被自己占着，第二次 acquire 永远拿不到，线程就这么僵死。**还有一类场景是"回调里再加锁"**：你持着锁调了一个回调，回调内部又去 acquire 同一把锁，同样死锁。

## 二、RLock 可重入锁的工作原理

\`RLock\`（Reentrant Lock，可重入锁）就是为解决上面这个问题而生的。它的规则很贴心：**同一个线程可以多次 acquire 同一把 RLock，不会死锁**。

它的内部用一个**计数器**实现：

\`\`\`text
RLock 内部状态 = (owner 线程, 计数器 count)

acquire():
    如果 当前线程 == owner        → count += 1（重入，直接放行）
    如果 锁空闲（owner 为 None）  → owner = 当前线程, count = 1
    否则（别的线程持有）           → 阻塞等待

release():
    count -= 1
    如果 count == 0               → owner = None，锁真正释放
\`\`\`

打个比方：\`Lock\` 像公共厕所的单间门锁，**你自己进了也得重新排队**；\`RLock\` 像酒店的房卡，**同一间房你可以反复刷卡进出**，只要最后离开时把门锁好就行。关键是 RLock 会"记住"是谁在持有它——只有持有者才能重入，别的线程想插队照样得等。

所以**计数器归零才真正释放**，这是理解 RLock 的核心：acquire 3 次就必须 release 3 次，少一次锁就一直被占着，别的线程都进不来。

## 三、RLock vs Lock 对比

| 对比维度 | \`Lock\` | \`RLock\` |
|----------|---------|-----------|
| 同线程多次 acquire | 第二次死锁 | 允许，计数器 +1 |
| 释放条件 | 一次 release 即释放 | acquire 多少次就要 release 多少次，归零才释放 |
| 性能 | 略快（无计数开销） | 略慢（要维护 owner + count） |
| 内部结构 | 一个原子标志 | 一个 Lock + owner + count |
| 典型场景 | 保护简单临界区 | 递归函数、回调嵌套、装饰器加锁 |
| 推荐程度 | 默认首选 | 只在需要重入时用 |

**选型建议**：默认用 \`Lock\`（更简单、更快）；当你发现"同一线程需要多次获取同一把锁"时再换 \`RLock\`。不要无脑全用 RLock——它会掩盖你代码里 acquire/release 没配对的 bug。

## 四、典型应用场景

### 1. 递归函数加锁

像上面的 \`save_tree\` 例子，遍历树/图/嵌套结构时，把 \`Lock\` 换成 \`RLock\` 就能安全递归。

### 2. 装饰器加锁

写一个 \`@synchronized\` 装饰器给函数自动加锁，如果被装饰的函数内部又调了另一个被装饰的函数（用同一把锁），就必须用 \`RLock\`。

\`\`\`python
rlock = threading.RLock()

def synchronized(func):
    def wrapper(*args, **kwargs):
        with rlock:                 # 加锁
            return func(*args, **kwargs)  # 执行函数
    return wrapper

@synchronized
def outer():
    inner()                         # inner 也加了 @synchronized，会再次 acquire
@synchronized
def inner():
    ...
\`\`\`

### 3. 回调嵌套

持着锁时调用外部回调，回调内部又可能加同一把锁——用 RLock 防止意外死锁。

## 五、注意事项

1. **acquire 和 release 必须严格配对**。acquire 了 N 次就得 release N 次，否则锁永远不释放，别的线程全部饿死。**强烈推荐用 \`with rlock:\`**，Python 会在进入时 acquire、离开时（即使异常）自动 release，但注意 \`with\` 只算一次 acquire。
2. **不要跨线程 release**。RLock 记住了 owner，只有持有者线程 release 才有效，别的线程 release 会抛 \`RuntimeError\`。
3. **能不重入就别重入**。如果你发现"必须用 RLock 才行"，先想想能不能把锁的范围缩小、或者把递归改成迭代——往往代码结构更清晰。

## 六、demo1：递归加锁——Lock 死锁 vs RLock 解决

第一个 demo 对比两种锁在递归场景下的表现：

- **第一段**用普通 \`Lock\`：第二次 \`acquire\` 用 \`timeout=1.0\` 限时等待（避免真卡死），1 秒后返回 \`False\`，证明同线程重入会失败。
- **第二段**用 \`RLock\`：同一线程连续 acquire 两次都成功，最后配对 release 两次。

**预期运行结果**：第一段打印"第二次 acquire 返回 False"，第二段打印"第二次 acquire 成功"。

## 七、demo2：RLock 计数器机制观察

第二个 demo 直接观察计数器行为：

- 主线程连续 acquire 3 次，然后只 release 2 次（计数器还剩 1）。
- 启动一个子线程尝试 acquire——拿不到，因为锁仍被主线程持有。
- 主线程再 release 1 次（计数器归零），子线程立即能拿到。

**预期运行结果**：计数器=1 时子线程 acquire 返回 \`False\`，归零后返回 \`True\`。这直观印证了"归零才释放"。`,
    code: `# -*- coding: utf-8 -*-
# 第11章 demo1 + demo2：RLock 可重入锁
# demo1：递归加锁——Lock 死锁 vs RLock 解决
# demo2：RLock 计数器机制观察
import threading
import time

print("=" * 60)
print("第11章 RLock 可重入锁演示")
print("=" * 60)

# ============== demo1：递归加锁对比 ==============
print("\\n[demo1] 递归加锁：Lock 死锁 vs RLock 解决")

# 1. 用普通 Lock：同线程第二次 acquire 会失败（这里用 timeout 避免真死锁）
lock = threading.Lock()                   # 创建普通锁

def recursive_with_lock(level):
    """用普通 Lock 在递归中加锁——同线程第二次 acquire 会卡住"""
    lock.acquire()                        # 第一次 acquire：成功
    try:
        print(f"  [Lock] 进入第 {level} 层，第一次 acquire 成功")
        if level > 0:
            # 同一线程再次 acquire 同一把 Lock：会永远阻塞
            # 这里用 timeout=1.0 限时，1 秒后返回 False，避免真卡死
            ok = lock.acquire(timeout=1.0)
            print(f"  [Lock] 第 {level} 层第二次 acquire 返回 {ok}（普通锁不允许重入）")
            if ok:
                lock.release()
    finally:
        lock.release()                    # 释放第一次的 acquire
        print(f"  [Lock] 第 {level} 层 release 完成")

recursive_with_lock(1)

# 2. 用 RLock：同线程可以多次 acquire，不会死锁
rlock = threading.RLock()                 # 创建可重入锁

def recursive_with_rlock(level):
    """用 RLock 在递归中加锁——同线程可多次 acquire，计数器累加"""
    rlock.acquire()                       # 第一次 acquire，计数器 0 → 1
    try:
        print(f"  [RLock] 进入第 {level} 层，第一次 acquire 成功（计数器=1）")
        if level > 0:
            rlock.acquire()               # 同线程第二次 acquire，计数器 1 → 2，不会阻塞
            try:
                print(f"  [RLock] 第 {level} 层第二次 acquire 成功（计数器=2，允许重入）")
            finally:
                rlock.release()           # 计数器 2 → 1
    finally:
        rlock.release()                   # 计数器 1 → 0，锁真正释放
        print(f"  [RLock] 第 {level} 层 release 完成（计数器归零，锁释放）")

recursive_with_rlock(1)

print("\\n→ demo1 结论：递归/回调场景里同线程需要多次获取锁时，必须用 RLock")

# ============== demo2：RLock 计数器机制观察 ==============
print("\\n[demo2] RLock 计数器机制观察：acquire 多少次就要 release 多少次")

rlock2 = threading.RLock()                # 新建一把 RLock 观察

# 主线程连续 acquire 3 次
rlock2.acquire()                          # 计数器 0 → 1
print("  主线程第 1 次 acquire（计数器=1）")
rlock2.acquire()                          # 计数器 1 → 2
print("  主线程第 2 次 acquire（计数器=2）")
rlock2.acquire()                          # 计数器 2 → 3
print("  主线程第 3 次 acquire（计数器=3）")

# 只 release 2 次，计数器还剩 1，锁仍被主线程持有
rlock2.release()                          # 计数器 3 → 2
print("  主线程第 1 次 release（计数器=2，锁仍被持有）")
rlock2.release()                          # 计数器 2 → 1
print("  主线程第 2 次 release（计数器=1，锁仍被持有）")

# 启动子线程尝试 acquire——计数器还没归零，子线程拿不到
result = []
def try_acquire_from_thread():
    """子线程尝试获取 RLock"""
    ok = rlock2.acquire(timeout=0.5)      # 限时 0.5 秒
    result.append(ok)
    if ok:
        rlock2.release()

t = threading.Thread(target=try_acquire_from_thread)
t.start()
t.join()
print(f"  计数器=1 时，子线程 acquire 结果: {result[0]}（拿不到，锁仍被主线程持有）")

# 最后再 release 1 次，计数器归零，锁真正释放
rlock2.release()                          # 计数器 1 → 0，锁真正释放
print("  主线程第 3 次 release（计数器=0，锁真正释放）")

# 再让子线程尝试——这次能拿到了
result2 = []
def try_acquire_from_thread2():
    """子线程再次尝试获取 RLock"""
    ok = rlock2.acquire(timeout=1.0)      # 限时 1 秒
    result2.append(ok)
    if ok:
        rlock2.release()

t2 = threading.Thread(target=try_acquire_from_thread2)
t2.start()
t2.join()
print(f"  计数器=0 后，子线程 acquire 结果: {result2[0]}（成功获取，锁已释放）")

print("\\n→ demo2 结论：RLock 内部用计数器记录 acquire 次数，必须 release 相同次数才真正释放")
print("\\n" + "=" * 60)
print("RLock 要点：同线程可多次 acquire；acquire/release 必须配对；递归场景首选")
print("=" * 60)
`,
  },

  // =========================================================
  // 第十二章：Semaphore 信号量
  // =========================================================
  {
    id: "py2-12",
    group: "线程同步",
    icon: "🎟️",
    title: "Semaphore 信号量：限制并发数",
    content: `## 一、从"限量入场券"说起

\`Lock\` 是"一夫当关"——同一时刻只放 1 个线程进临界区。但现实里很多资源不是只能给 1 个人用，而是**给 N 个人用**：

- 数据库连接池有 10 个连接，最多 10 个线程同时查
- 爬虫要限速，最多 5 个请求并发
- 文件句柄、license 数、第三方 API 配额……

这种"限量但不止 1 个"的场景，就用 \`Semaphore\`（信号量）。可以把它想象成**一沓限量入场券**：

\`\`\`text
Semaphore(3)  →  一开始有 3 张券

线程来了：
    acquire()  →  拿一张券（剩余 2 张），进去干活
    干完活
    release()  →  还一张券（剩余 3 张）

第 4 个线程来时没券了 → 排队等，直到有人还券
\`\`\`

## 二、内部计数器机制

\`Semaphore\` 内部维护一个**整数计数器**，和 \`Lock\` 的"开/关"二态不同，它是个数字：

\`\`\`text
Semaphore(N) 初始计数器 = N

acquire():
    如果 计数器 > 0  → 计数器 -= 1，立即返回
    如果 计数器 == 0 → 阻塞等待，直到有人 release

release():
    计数器 += 1
    如果有等待的线程 → 唤醒其中一个
\`\`\`

| 对比 | \`Lock\` | \`Semaphore(N)\` |
|------|---------|------------------|
| 允许并发的线程数 | 1 | N |
| 计数器范围 | 0 或 1 | 0 ~ N |
| 适用场景 | 互斥保护临界区 | 限制并发数量 |
| 特殊变体 | 无 | \`BoundedSemaphore\` |

\`Semaphore(1)\` 在效果上等价于 \`Lock\`，但 \`Lock\` 性能更好、语义更明确，单线程互斥优先用 \`Lock\`。

## 三、Semaphore vs BoundedSemaphore

普通 \`Semaphore\` 有个小坑：**release 次数可以超过 acquire 次数**，计数器会被加到超过初始值，这通常是 bug 的信号（比如你多 release 了一次，实际放进了超过限额的线程）。

\`BoundedSemaphore\`（有界信号量）在 release 时会检查：**如果计数器已经达到初始值，再 release 就抛 \`ValueError\`**。它能帮你发现"release 比 acquire 多"的错误。

\`\`\`python
sem = threading.BoundedSemaphore(3)   # 初始 3
sem.acquire()                          # → 2
sem.acquire()                          # → 1
sem.acquire()                          # → 0
sem.release()                          # → 1
sem.release()                          # → 2
sem.release()                          # → 3
sem.release()                          # 抛 ValueError！已超过初始值 3
\`\`\`

**建议**：除非你有意要"凭空增加券"，否则优先用 \`BoundedSemaphore\`，它能在出 bug 时第一时间报错。

## 四、典型应用场景

### 1. 限制数据库连接池

\`\`\`python
pool = threading.Semaphore(10)   # 最多 10 个连接

def query(sql):
    pool.acquire()               # 占一个连接位
    try:
        # 执行查询
    finally:
        pool.release()           # 释放连接位
\`\`\`

### 2. 爬虫限速

\`\`\`python
rate = threading.Semaphore(5)    # 最多 5 个并发请求
def fetch(url):
    with rate:
        requests.get(url)
\`\`\`

### 3. 资源配额控制

API 调用配额、license 数、文件描述符等"限量但共享"的资源，都适合用信号量。

## 五、注意事项

1. **acquire 和 release 要配对**，最好用 \`with sem:\` 上下文管理器（进入 acquire、离开自动 release，即使异常也不漏 release）。
2. **release 可以在任意线程**——不一定是 acquire 的那个线程。这和 RLock 不同，信号量不记 owner。这个特性让信号量可以用于"一个线程发券、另一个线程收券"的协调模式。
3. **初始值 N 要合理**。N 太大起不到限流作用，N 太小浪费资源。可以根据压测结果调整。
4. **信号量只管数量，不管资源本身**。它不会帮你创建/销毁真正的连接，你还得自己管理连接对象。如果想要"连接池 + 自动管理"，用 \`queue.Queue\` 存连接对象更合适。

## 六、demo1：模拟数据库连接池

第一个 demo 模拟一个最多 3 个连接的数据库连接池：启动 8 个线程同时查询，但同一时刻最多只有 3 个能"获得连接"。用一个 \`active_count\` 变量跟踪当前并发数，并加锁保护它，方便观察。

**预期运行结果**：你会看到并发数始终 ≤ 3，超过的线程在等待，前一个 release 后下一个才进。

## 七、demo2：模拟爬虫并发下载

第二个 demo 用 \`BoundedSemaphore\` 限制爬虫最多 5 个并发请求，下载 12 个 URL。演示 \`BoundedSemaphore\` 的典型用法和 \`with\` 上下文管理。

**预期运行结果**：12 个任务分批完成，任意时刻并发不超过 5 个。`,
    code: `# -*- coding: utf-8 -*-
# 第12章 demo1 + demo2：Semaphore 信号量
# demo1：模拟数据库连接池（最多 3 个并发）
# demo2：模拟爬虫并发下载（最多 5 个并发，用 BoundedSemaphore）
import threading
import time
import random

print("=" * 60)
print("第12章 Semaphore 信号量演示")
print("=" * 60)

# ============== demo1：模拟数据库连接池 ==============
print("\\n[demo1] 模拟数据库连接池（最多 3 个并发连接）")

MAX_CONN = 3
pool = threading.Semaphore(MAX_CONN)      # 创建信号量，初始 3 张券
active_lock = threading.Lock()            # 保护 active_count 的锁
active_count = 0                          # 当前正在使用连接的线程数

def query_db(thread_id):
    """模拟查询数据库：先获取连接券，查询完归还"""
    global active_count
    print(f"  线程{thread_id} 等待获取数据库连接...")
    pool.acquire()                        # 获取信号量（拿一张券），计数器 -1
    with active_lock:                     # 加锁保护 active_count
        active_count += 1
        cur = active_count
    try:
        print(f"  线程{thread_id} 获得连接，开始查询（当前并发数={cur}）")
        time.sleep(random.uniform(0.3, 0.8))  # 模拟查询耗时
        print(f"  线程{thread_id} 查询完成")
    finally:
        with active_lock:
            active_count -= 1
        pool.release()                    # 归还信号量（还一张券），计数器 +1
        print(f"  线程{thread_id} 归还连接")

# 启动 8 个线程，但同一时刻只有 3 个能查
threads = []
for i in range(8):
    t = threading.Thread(target=query_db, args=(i,))
    threads.append(t)
    t.start()

for t in threads:
    t.join()

print("→ demo1 结论：并发数始终 ≤ 3，超出部分排队等待")

# ============== demo2：模拟爬虫并发下载 ==============
print("\\n[demo2] 模拟爬虫并发下载（BoundedSemaphore 限制最多 5 个并发）")

MAX_CONCURRENT = 5
# 用 BoundedSemaphore：release 次数超过 acquire 会报错，更安全
sem = threading.BoundedSemaphore(MAX_CONCURRENT)
done_lock = threading.Lock()
done_count = 0                            # 已完成的下载数

def download(url, idx):
    """模拟下载一个 URL：用 with 自动管理 acquire/release"""
    global done_count
    with sem:                              # 进入 with 自动 acquire，离开自动 release
        print(f"  [{idx}] 开始下载 {url}")
        time.sleep(random.uniform(0.2, 0.6))  # 模拟下载耗时
        print(f"  [{idx}] 完成 {url}")
    with done_lock:
        done_count += 1

# 生成 12 个 URL 并下载
urls = [f"https://example.com/page/{i}" for i in range(12)]
threads = []
for i, url in enumerate(urls):
    t = threading.Thread(target=download, args=(url, i))
    threads.append(t)
    t.start()
    time.sleep(0.02)                      # 错开一点启动，便于观察并发

for t in threads:
    t.join()

print(f"→ demo2 结论：12 个任务全部完成，任意时刻并发不超过 {MAX_CONCURRENT}")

# 演示 BoundedSemaphore 的保护机制
print("\\n[附加] BoundedSemaphore 防止 release 超额：")
guard = threading.BoundedSemaphore(2)
guard.acquire()                           # 计数器 2 → 1
guard.acquire()                           # 计数器 1 → 0
guard.release()                           # 计数器 0 → 1
guard.release()                           # 计数器 1 → 2（回到初始值）
try:
    guard.release()                       # 计数器已到初始值，再 release 会报错
    print("  第三次 release 成功（不应该发生）")
except ValueError as e:
    print(f"  第三次 release 报错: {e}")
    print("  → BoundedSemaphore 检测到了 release 次数超过 acquire，及时报错")

print("\\n" + "=" * 60)
print("Semaphore 要点：限量入场券；acquire -1 / release +1；配对使用优先用 BoundedSemaphore")
print("=" * 60)
`,
  },

  // =========================================================
  // 第十三章：Event 事件
  // =========================================================
  {
    id: "py2-13",
    group: "线程同步",
    icon: "📢",
    title: "Event 事件：线程间通知",
    content: `## 一、Event 是"红绿灯"

前面学的 \`Lock\` / \`Semaphore\` 都是为了"互斥"——抢着用资源。但有时候线程之间不是抢资源，而是要**通知**：

- 主线程初始化完了，工作线程才能开始
- 用户点了"停止"，所有工作线程要退出
- 定时任务：到点了一起跑

这种"一个线程发信号、其他线程等信号"的场景，用 \`threading.Event\`。它就像一个**红绿灯**：

\`\`\`text
Event 初始 = False（红灯）

工作线程：event.wait()  →  红灯时阻塞，绿灯时立即通过

主线程：
    event.set()    →  变绿灯，所有 wait 的线程被唤醒
    event.clear()  →  变回红灯
    event.is_set() →  查当前是绿灯还是红灯
\`\`\`

打个比方：\`Lock\` 是公共厕所单间（抢着用），\`Event\` 是路口的红绿灯（统一调度）。Event 不互斥，它只负责"通知"——多个线程可以同时"看到绿灯"。

## 二、四个核心方法

| 方法 | 作用 | 类比 |
|------|------|------|
| \`set()\` | 把标志设为 \`True\` | 红灯变绿灯 |
| \`clear()\` | 把标志设为 \`False\` | 绿灯变红灯 |
| \`is_set()\` | 查询当前标志状态 | 看现在是红还是绿 |
| \`wait(timeout=None)\` | 标志为 \`True\` 立即返回；为 \`False\` 阻塞，直到 \`set\` 或超时 | 红灯时停车等 |

\`\`\`python
event = threading.Event()         # 初始为 False（红灯）

# 工作线程
def worker():
    print("等待开工信号...")
    event.wait()                  # 红灯时阻塞，绿灯时立即通过
    print("开工！")

# 主线程
event.set()                       # 变绿灯，所有 wait 的线程被唤醒
\`\`\`

\`wait(timeout=5)\` 可以限时等待，5 秒内没等到 \`set\` 就返回 \`False\`（不抛异常），可以用来做"等一会就放弃"的逻辑。

## 三、Event vs Lock

| 对比 | \`Lock\` | \`Event\` |
|------|---------|-----------|
| 目的 | 互斥（抢资源） | 通知（发信号） |
| 状态 | 被持有 / 空闲 | True / False |
| 谁能改变状态 | 持有者 release | 任何线程都能 set/clear |
| 唤醒几个 | 一次只放 1 个 | \`set()\` 一次唤醒所有 wait 的线程 |
| 典型场景 | 保护临界区 | 开始/停止信号、初始化完成通知 |

关键区别：\`Lock\` 是"我占了你就别来"，\`Event\` 是"我说开始大家才开始"。Event 没有"占有"的概念，谁都能 set/clear。

## 四、典型应用场景

### 1. 等待初始化完成

\`\`\`python
ready = threading.Event()

def worker():
    ready.wait()                  # 等主线程初始化完
    # 开始干活

# 主线程
init_system()
ready.set()                       # 通知所有工作线程：可以开始了
\`\`\`

### 2. 优雅停止

\`\`\`python
stop = threading.Event()

def worker():
    while not stop.is_set():      # 每轮检查停止信号
        do_task()
    # 退出

# 主线程
stop.set()                        # 发出停止信号，工作线程下轮循环时退出
\`\`\`

### 3. 定时启动

\`\`\`python
start_event = threading.Event()
# 到点后
start_event.set()                 # 所有等 start_event 的线程一起跑
\`\`\`

### 4. 生产者通知消费者

生产者生产完一批数据，\`set()\` 通知消费者"有货了"。不过这种场景更推荐用 \`Condition\`（下一章），因为 Condition 能配合"条件判断"。

## 五、wait 的两种用法

### 用法一：阻塞等待

\`\`\`python
event.wait()            # 一直等到 set
\`\`\`

### 用法二：限时等待 + 替代 sleep

\`\`\`python
if event.wait(timeout=2.0):   # 等 2 秒，期间 set 了返回 True
    print("收到了信号")
else:
    print("2 秒内没收到信号")
\`\`\`

这个写法常用来替代 \`time.sleep()\`：\`stop.wait(1.0)\` 既能"睡 1 秒"，又能"睡期间一旦 set 立即醒来"，比 \`time.sleep(1.0)\` 灵活得多——后者 set 了也得傻睡完。

\`\`\`python
# 推荐写法：能立即响应停止
while not stop.is_set():
    do_work()
    stop.wait(1.0)       # 间隔 1 秒，但 set 后立即醒
\`\`\`

## 六、注意事项

1. **Event 是"全局开关"**：\`set()\` 会唤醒**所有** \`wait()\` 的线程，没法只唤醒一个。要"唤醒一个"用 \`Condition.notify()\`。
2. **clear 后要重新 set 才能再次唤醒**。如果你想做"每次通知只放行一轮"，记得通知完后 \`clear()\` 复位。
3. **wait 不释放锁**（因为 Event 内部不是基于你持有的锁）。但 \`wait\` 内部会释放 Event 自己的内部锁，所以不会死锁。
4. **is_set() 是非阻塞查询**，适合在循环里频繁检查；\`wait()\` 是阻塞等待，省 CPU。循环里用 \`while not event.is_set(): time.sleep(0.1)\` 是"轮询"，不如直接 \`event.wait()\` 高效。

## 七、demo1：红绿灯

第一个 demo 用 Event 实现红绿灯：主线程控制灯的颜色，3 辆"汽车"线程一开始 \`wait()\` 等绿灯，\`set()\` 后全部通过。然后再 \`clear()\` 复位，演示第二轮。

**预期运行结果**：3 辆车同时等待，\`set()\` 后全部立即通过；\`clear()\` 后新一轮的车又要等。

## 八、demo2：优雅停止

第二个 demo 用 Event 实现优雅停止：3 个工作线程循环处理任务，每轮检查 \`stop.is_set()\`。主线程睡 1.5 秒后 \`set()\`，工作线程在下次检查时退出。

**预期运行结果**：工作线程收到信号后整齐退出，并报告自己处理了几个任务。`,
    code: `# -*- coding: utf-8 -*-
# 第13章 demo1 + demo2：Event 事件
# demo1：用 Event 实现红绿灯
# demo2：用 Event 实现优雅停止
import threading
import time

print("=" * 60)
print("第13章 Event 事件演示")
print("=" * 60)

# ============== demo1：红绿灯 ==============
print("\\n[demo1] 用 Event 实现红绿灯（主线程控灯，汽车线程等绿灯）")

green = threading.Event()                 # 创建事件，初始为 False（红灯）

def car(car_id):
    """汽车线程：等绿灯后通行"""
    print(f"  汽车{car_id} 到达路口，等待绿灯...")
    green.wait()                          # 阻塞直到事件被 set（绿灯）
    print(f"  汽车{car_id} 看到绿灯，通过路口")

# 第一轮：启动 3 辆汽车
print("[主线程] 第一轮：红灯亮着，3 辆车在等")
cars = []
for i in range(3):
    t = threading.Thread(target=car, args=(i,))
    cars.append(t)
    t.start()

time.sleep(1)                             # 红灯持续 1 秒
print("[主线程] 绿灯亮起！（event.set）")
green.set()                               # 设置事件 = 绿灯，唤醒所有等待的汽车

for t in cars:
    t.join()

# 第二轮：clear 复位，重新变红灯
print("\\n[主线程] 红灯复位（event.clear），新一轮汽车又要等了")
green.clear()

cars2 = []
for i in range(2):
    t = threading.Thread(target=car, args=(i + 10,))
    cars2.append(t)
    t.start()

time.sleep(0.8)                           # 红灯持续 0.8 秒
print("[主线程] 绿灯再次亮起！（event.set）")
green.set()
for t in cars2:
    t.join()

print("→ demo1 结论：event.set() 一次唤醒所有 wait() 的线程")

# ============== demo2：优雅停止 ==============
print("\\n[demo2] 用 Event 实现优雅停止")

stop = threading.Event()                  # 停止信号，初始为 False

def worker(worker_id):
    """工作线程：循环处理任务，检测到停止信号就退出"""
    count = 0
    # 每轮检查 stop.is_set()；wait(0.3) 既能当间隔又能立即响应停止
    while not stop.is_set():
        count += 1
        print(f"  工人{worker_id} 处理第 {count} 个任务")
        # 用 stop.wait 替代 time.sleep：set 后立即醒，不用傻睡完
        stop.wait(0.3)
    print(f"  工人{worker_id} 收到停止信号，已处理 {count} 个任务，优雅退出")

# 启动 3 个工作线程
workers = []
for i in range(3):
    t = threading.Thread(target=worker, args=(i,))
    workers.append(t)
    t.start()

time.sleep(1.5)                           # 让工人工作一段时间
print("\\n[主线程] 发送停止信号！（event.set）")
stop.set()                                # 发出停止信号

for t in workers:
    t.join()

print("\\n→ demo2 结论：用 Event 做停止信号，线程能在下次检查时优雅退出")
print("  （用 stop.wait(间隔) 替代 time.sleep，响应更及时）")

# ============== 附加：wait 限时等待 ==============
print("\\n[附加] Event.wait(timeout) 限时等待：")
ev = threading.Event()
# 不 set，直接限时等待
result = ev.wait(timeout=0.5)             # 0.5 秒内没人 set，返回 False
print(f"  等待 0.5 秒（期间未 set）返回: {result}（超时返回 False）")
ev.set()
result2 = ev.wait(timeout=0.5)            # 已经是 set 状态，立即返回 True
print(f"  set 后再 wait 返回: {result2}（已 set 立即返回 True）")

print("\\n" + "=" * 60)
print("Event 要点：红绿灯通知；set 唤醒所有 wait；clear 复位；wait 可限时")
print("=" * 60)
`,
  },

  // =========================================================
  // 第十四章：Condition 条件变量
  // =========================================================
  {
    id: "py2-14",
    group: "线程同步",
    icon: "🤝",
    title: "Condition 条件变量：生产者-消费者",
    content: `## 一、Condition = Lock + 通知机制

上一章的 \`Event\` 能"通知"，但它是个全局开关——要么通知所有人，要么不通知。很多时候我们需要更精细的协调：**等某个条件满足**才继续，而不是单纯等信号。

经典例子就是**生产者-消费者**：

- 消费者要等"缓冲区非空"才能消费
- 生产者要等"缓冲区非满"才能生产
- 生产后要通知消费者"有货了"
- 消费后要通知生产者"有空位了"

这种"检查条件 → 不满足就等 → 被唤醒后再检查"的模式，正是 \`Condition\` 的主场。\`Condition\` 内部 = 一把 \`Lock\` + 一个等待队列，**既能互斥保护共享数据，又能通知等待的线程**。

\`\`\`python
cond = threading.Condition()

with cond:                       # 1. 加锁
    while not condition:         # 2. 检查条件（用 while 不用 if！）
        cond.wait()              # 3. 不满足就 wait：释放锁 + 阻塞 + 被唤醒后重新拿锁
    # 4. 条件满足，干活
    cond.notify()                # 5. 通知其他等待的线程
\`\`\`

## 二、三个核心方法

| 方法 | 作用 | 前提 |
|------|------|------|
| \`wait()\` | 释放锁、阻塞等待，被唤醒后重新获取锁 | 必须先 acquire（或 with） |
| \`notify(n=1)\` | 唤醒 n 个等待的线程（默认 1 个） | 必须先 acquire |
| \`notify_all()\` | 唤醒所有等待的线程 | 必须先 acquire |

**关键规则**：\`wait\` / \`notify\` / \`notify_all\` **必须在持有锁的情况下调用**，否则抛 \`RuntimeError\`。用 \`with cond:\` 是最省心的方式，进入自动 acquire、离开自动 release。

\`wait()\` 内部做了三件事：**释放锁 → 阻塞等待 → 被唤醒后重新获取锁**。这样别的线程才能进入临界区修改条件，唤醒你后你再重新拿锁继续。

## 三、为什么用 while 不用 if

这是 \`Condition\` 最经典的坑：

\`\`\`python
# 错误写法（用 if）
with cond:
    if not buffer:
        cond.wait()        # 被唤醒后不会重新检查
    buffer.pop()           # 可能 buffer 还是空的！

# 正确写法（用 while）
with cond:
    while not buffer:
        cond.wait()        # 被唤醒后重新检查条件
    buffer.pop()           # 这时 buffer 一定非空
\`\`\`

原因叫**虚假唤醒（spurious wakeup）**或**竞态唤醒**：你被 \`notify\` 唤醒时，可能另一个消费者比你先拿到锁、把货消费光了。所以醒来后**必须重新检查条件**，用 \`while\` 循环检查最安全。这是面试常考点，也是写生产者-消费者的铁律。

## 四、notify vs notify_all

- \`notify()\`：随机唤醒**一个**等待的线程。省资源，但可能唤醒"不对"的线程（比如唤醒了生产者但实际该唤醒消费者）。
- \`notify_all()\`：唤醒**所有**等待的线程，它们一起抢锁，抢到的检查条件、抢不到的继续等。

经验法则：

- 如果所有等待者等的是**同一个条件**，用 \`notify()\` 就够（唤醒一个就行）。
- 如果等待者等的是**不同条件**（比如生产者等"非满"、消费者等"非空"），用 \`notify_all()\` 更稳，避免唤醒错了。

## 五、Condition vs Event

| 对比 | \`Event\` | \`Condition\` |
|------|----------|--------------|
| 目的 | 单纯通知 | 等待条件满足 |
| 唤醒 | set 一次唤醒所有 | notify 可唤醒一个或所有 |
| 条件检查 | 无 | 配合 while 检查条件 |
| 是否互斥 | 否 | 是（内部有锁） |
| 复位 | 手动 clear | 自动（wait 醒来后重新检查） |
| 适用 | 开始/停止信号 | 生产者-消费者、复杂协调 |

一句话：\`Event\` 是"信号灯"，\`Condition\` 是"等条件满足"。需要"等某个状态成立"就用 Condition。

## 六、经典模式：生产者-消费者

\`\`\`python
buffer = []
MAX_SIZE = 5
cond = threading.Condition()

def producer():
    with cond:
        while len(buffer) >= MAX_SIZE:   # 缓冲区满，等
            cond.wait()
        buffer.append(item)              # 生产
        cond.notify()                    # 通知消费者

def consumer():
    with cond:
        while not buffer:                # 缓冲区空，等
            cond.wait()
        item = buffer.pop(0)             # 消费
        cond.notify()                    # 通知生产者
\`\`\`

生产者等"非满"，消费者等"非空"，互相通知，缓冲区自动维持在 0~MAX_SIZE 之间。

## 七、注意事项

1. **wait/notify 必须在 with 块或 acquire 之后调用**，否则报 \`RuntimeError: release unlocked lock\` 之类。
2. **wait 用 while 包裹**，不要用 if，防止虚假唤醒。
3. **notify 在 release 之前调用**（在 with 块内调用即可），唤醒的线程要等你 release 才能真正拿到锁。
4. **配对要清晰**：有几个等待条件，notify 时就要考虑是 notify 一个还是全部。
5. **避免漏 notify**：如果生产了数据却忘了 notify，消费者会一直傻等。用 \`with\` 能保证不漏 release，但 notify 还是要你自己写。

## 八、demo1：生产者-消费者

第一个 demo 用 \`Condition\` 实现经典生产者-消费者：2 个生产者各生产 3 个、2 个消费者各消费 3 个，缓冲区上限 3。生产者发现满了就 \`wait\`，消费者发现空了也 \`wait\`，互相 \`notify\` 协调。

**预期运行结果**：缓冲区始终维持在 0~3 之间，生产/消费交替进行，最后所有任务完成、缓冲区为空（生产总数=消费总数）。

## 九、demo2：多个消费者 + notify_all

第二个 demo 演示多消费者场景：3 个消费者循环取任务，主线程分 2 批投放任务，每批用 \`notify_all()\` 唤醒**所有**等待的消费者。最后用 \`Event\` 配合 \`notify_all\` 发送结束信号，让消费者整齐退出。

**预期运行结果**：每批任务投放后，3 个消费者都被唤醒、各取一个任务；收到结束信号后全部退出。`,
    code: `# -*- coding: utf-8 -*-
# 第14章 demo1 + demo2：Condition 条件变量
# demo1：生产者-消费者
# demo2：多个消费者 + notify_all
import threading
import time
import random

print("=" * 60)
print("第14章 Condition 条件变量演示")
print("=" * 60)

# ============== demo1：生产者-消费者 ==============
print("\\n[demo1] 用 Condition 实现生产者-消费者")

buffer = []                                # 共享缓冲区
MAX_SIZE = 3                               # 缓冲区上限
cond = threading.Condition()              # 创建条件变量（内含一把锁）

def producer(prod_id, total):
    """生产者：生产 total 个物品放入缓冲区"""
    for i in range(total):
        with cond:                        # 加锁（with 自动 acquire/release）
            # 缓冲区满就等——必须用 while，防止虚假唤醒
            while len(buffer) >= MAX_SIZE:
                print(f"  生产者{prod_id}: 缓冲区满({len(buffer)})，等待消费...")
                cond.wait()               # 释放锁 + 阻塞，被唤醒后重新拿锁
            item = f"P{prod_id}-{i}"
            buffer.append(item)           # 生产物品放入缓冲区
            print(f"  生产者{prod_id}: 生产 {item}（缓冲区={buffer}）")
            cond.notify()                 # 通知一个等待的消费者：有货了
        # 离开 with 自动 release
        time.sleep(random.uniform(0.05, 0.2))  # 模拟生产耗时

def consumer(con_id, total):
    """消费者：消费 total 个物品"""
    for i in range(total):
        with cond:
            # 缓冲区空就等——用 while 重新检查
            while not buffer:
                print(f"  消费者{con_id}: 缓冲区空，等待生产...")
                cond.wait()
            item = buffer.pop(0)          # 从缓冲区取出物品
            print(f"  消费者{con_id}: 消费 {item}（剩余={buffer}）")
            cond.notify()                 # 通知一个等待的生产者：有空位了
        time.sleep(random.uniform(0.05, 0.2))  # 模拟消费耗时

# 2 个生产者各生产 3 个，2 个消费者各消费 3 个（总生产=总消费=6）
prod_total = 3
con_total = 3
threads = []
for i in range(2):
    threads.append(threading.Thread(target=producer, args=(i, prod_total)))
    threads.append(threading.Thread(target=consumer, args=(i, con_total)))

for t in threads:
    t.start()
for t in threads:
    t.join()

print(f"\\n→ demo1 结论：最终缓冲区={buffer}（生产{prod_total*2}个=消费{con_total*2}个，已全部协调完成）")

# ============== demo2：多个消费者 + notify_all ==============
print("\\n[demo2] 多个消费者 + notify_all 唤醒所有")

cond2 = threading.Condition()
queue = []                                 # 任务队列
done = threading.Event()                  # 结束信号

def consumer2(con_id):
    """消费者：循环取任务，队列空就 wait，收到结束信号就退出"""
    while True:
        with cond2:
            # 队列空且没收到结束信号 → 等待
            while not queue and not done.is_set():
                print(f"  消费者{con_id}: 队列空，wait 等待...")
                cond2.wait()
            # 醒来后再次检查：队列还是空 + 收到结束信号 → 退出
            if not queue and done.is_set():
                print(f"  消费者{con_id}: 收到结束信号，退出")
                return
            task = queue.pop(0)           # 取任务
        print(f"  消费者{con_id}: 处理任务 {task}")
        time.sleep(0.1)

# 启动 3 个消费者
consumers = []
for i in range(3):
    t = threading.Thread(target=consumer2, args=(i,))
    consumers.append(t)
    t.start()

# 分 2 批投放任务，每批用 notify_all 唤醒所有等待的消费者
for batch in range(2):
    time.sleep(0.2)                       # 等消费者都进入 wait
    with cond2:
        for j in range(3):                # 每批 3 个任务，正好一人一个
            queue.append(f"批次{batch}-任务{j}")
        print(f"\\n  [主线程] 投放批次{batch}的 3 个任务，notify_all 唤醒所有消费者")
        cond2.notify_all()                # 唤醒所有等待的消费者

time.sleep(0.5)                           # 等消费者处理完
# 发送结束信号：set + notify_all，让所有消费者醒来检查并退出
with cond2:
    done.set()
    cond2.notify_all()                    # 唤醒所有，让它们检查 done 并退出

for t in consumers:
    t.join()

print("\\n→ demo2 结论：notify_all 唤醒所有等待线程，适合'一次通知多人'的场景")
print("  （单 notify 只叫醒一个，可能叫错人；notify_all 最稳）")

# ============== 附加：wait/notify 必须持锁 ==============
print("\\n[附加] wait/notify 必须在持锁状态下调用：")
cond3 = threading.Condition()
try:
    cond3.notify()                        # 没加锁就 notify
    print("  未加锁 notify 成功（不应该）")
except RuntimeError as e:
    print(f"  未加锁 notify 报错: {e}")
    print("  → 必须在 with cond 或 cond.acquire() 之后才能 wait/notify")

print("\\n" + "=" * 60)
print("Condition 要点：Lock+通知；wait 用 while 包裹防虚假唤醒；notify_all 唤醒所有")
print("=" * 60)
`,
  },

  // =========================================================
  // 第十五章：Timer 定时器
  // =========================================================
  {
    id: "py2-15",
    group: "线程同步",
    icon: "⏰",
    title: "Timer 定时器：延迟执行",
    content: `## 一、Timer 是什么

\`threading.Timer\` 是一个**延迟执行**的工具：指定 n 秒后，执行一次你给的函数。可以理解为"带闹钟的线程"。

\`\`\`python
import threading

def alarm():
    print("时间到！")

t = threading.Timer(5.0, alarm)   # 5 秒后执行 alarm
t.start()                         # 启动定时器
# 主线程可以继续干别的，5 秒后子线程自动执行 alarm
\`\`\`

\`Timer\` 本质上是 \`Thread\` 的子类，它内部就是把"睡 n 秒 → 调函数"封装好了。所以它**不阻塞调用线程**——start 之后主线程该干嘛干嘛，到点了 Timer 线程自己醒来执行。

## 二、构造函数与生命周期

\`\`\`python
threading.Timer(interval, function, args=None, kwargs=None)
\`\`\`

| 参数 | 说明 |
|------|------|
| \`interval\` | 延迟秒数（float） |
| \`function\` | 到点要执行的函数 |
| \`args\` | 传给函数的位置参数（元组） |
| \`kwargs\` | 传给函数的关键字参数（字典） |

### 两个关键方法

| 方法 | 作用 |
|------|------|
| \`start()\` | 启动定时器，开始倒计时 |
| \`cancel()\` | 取消定时器（必须在执行前调用，执行了就取消不了） |

\`\`\`python
t = threading.Timer(3.0, hello, args=("world",))
t.start()        # 3 秒后会执行 hello("world")
t.cancel()       # 在 3 秒内取消，hello 不会执行
\`\`\`

\`cancel()\` 只能在"还没执行"的时候取消。如果函数已经开始跑了，\`cancel\` 没用——好在它也不会报错，只是无效。

## 三、Timer 是 Thread 的子类

\`\`\`python
issubclass(threading.Timer, threading.Thread)
True
\`\`\`

这意味着：

1. **Timer 是个线程**：\`start()\` 后会创建一个新线程执行。
2. **默认不是守护线程**：\`daemon=False\`。所以如果你的主线程退出了，但还有未执行的 Timer，**程序会等 Timer 执行完才退出**。想让 Timer 不阻挡程序退出，可以 \`t.daemon = True\`（在 start 之前设）。
3. **可以 join**：\`t.join()\` 等待 Timer 执行完，和普通线程一样。
4. **可以传 args/kwargs**：像普通 Thread 一样给目标函数传参。

\`\`\`python
t = threading.Timer(2.0, greet, args=("张三",), kwargs={"punct": "!"})
t.daemon = True        # 设为守护线程，主线程退出时跟着退出
t.start()
\`\`\`

## 四、一次性 vs 周期性

\`Timer\` 是**一次性**的——执行完就结束，不会重复。如果想要"每隔 N 秒执行一次"的周期任务，有两种思路：

### 思路一：递归 Timer（推荐简单场景）

在 Timer 的回调函数里，再启动下一个 Timer：

\`\`\`python
def tick():
    print("滴答")
    # 在回调里启动下一个 Timer，形成周期循环
    threading.Timer(2.0, tick).start()

threading.Timer(2.0, tick).start()   # 启动第一个
\`\`\`

这样每 2 秒执行一次 \`tick\`，每次执行完再约 2 秒后的下一次。**优点**：简单、不阻塞、间隔准确（误差不会累积）。**缺点**：每次新建一个线程对象，长期跑有轻微开销；要手动管理"停止"（保存当前 Timer 引用，cancel 它）。

### 思路二：循环 + sleep（阻塞线程）

\`\`\`python
def loop():
    while not stop.is_set():
        print("滴答")
        stop.wait(2.0)        # 用 Event.wait 替代 sleep，能立即响应停止
threading.Thread(target=loop).start()
\`\`\`

**优点**：一个线程长期跑，开销小；**缺点**：要专门开一个线程被它占着。需要周期任务能被停止时，配合 \`Event\` 用 \`wait\` 替代 \`sleep\`。

### 两种思路对比

| 对比 | 递归 Timer | 循环 + wait |
|------|-----------|-------------|
| 实现复杂度 | 简单 | 简单 |
| 线程开销 | 每次新建线程 | 一个常驻线程 |
| 间隔准确性 | 准（不累积误差） | 可能累积漂移 |
| 停止方式 | cancel 当前 Timer | set Event |
| 适用场景 | 轻量、短期、次数有限 | 长期、高频、需精确停止 |

如果要做"每天凌晨执行"这种复杂的定时任务，建议直接用标准库的 \`schedule\` 第三方库，或者系统的 cron——别用裸 Timer 硬撸。

## 五、典型应用场景

### 1. 超时处理

\`\`\`python
# 5 秒后如果还没完成，强制结束
def timeout():
    print("操作超时！")
threading.Timer(5.0, timeout).start()
\`\`\`

### 2. 延迟初始化

\`\`\`python
# 程序启动 10 秒后再预加载缓存
threading.Timer(10.0, preload_cache).start()
\`\`\`

### 3. 定时提醒

\`\`\`python
# 30 分钟后提醒休息
threading.Timer(30 * 60, remind_rest).start()
\`\`\`

### 4. 防抖动（debounce）

用户连续操作时，等他停下来再执行：

\`\`\`python
timer = None
def on_input():
    global timer
    if timer:
        timer.cancel()              # 取消上一次的延迟
    timer = threading.Timer(0.5, save)  # 0.5 秒后再保存
    timer.start()
\`\`\`

## 六、注意事项

1. **cancel 要及时**：在执行前 cancel 才有效。如果你不确定是否已执行，cancel 调一下也无害（不会报错）。
2. **回调里的异常不会抛到主线程**——Timer 线程自己崩了自己结束，主线程毫无察觉。所以回调里要自己 try/except，至少 log 一下。
3. **别忘了 join 或 daemon**：如果主线程要等 Timer 跑完，记得 \`t.join()\`；如果不想被 Timer 拖住退出，设 \`t.daemon = True\`。
4. **周期任务要能停止**：递归 Timer 一定要保存"当前那个 Timer"的引用，否则没法 cancel；最好配合一个 \`stop\` 标志，避免 cancel 后又有新的 Timer 被启动。
5. **Timer 不适合精确计时**：它的"n 秒后"是大概值，受线程调度影响，可能有几十毫秒误差。需要毫秒级精度请用专门的定时器或硬件计时。

## 七、demo1：5 秒后执行 + cancel 取消

第一个 demo 启动两个 Timer：t1 在 5 秒后执行，t2 在 3 秒后执行。但 1.5 秒时把 t2 cancel 掉，所以 t2 不会执行，只有 t1 会响。主线程用 \`join\` 等 t1 跑完。

**预期运行结果**：1.5 秒时打印"取消了 t2"，3 秒时 t2 不响（已取消），5 秒时 t1 响起"闹钟响了"。

## 八、demo2：递归 Timer 实现周期任务

第二个 demo 用递归 Timer 实现"每 2 秒打印一次时间"的周期任务，触发 5 次后自动停止。每次 tick 里再启动下一个 Timer，并用一个锁保护"当前 Timer 引用"，便于在需要时 cancel。

**预期运行结果**：每隔约 2 秒打印一次 \`[Tick N]\` 和当前时间，共 5 次，然后打印"达到最大次数，停止"。`,
    code: `# -*- coding: utf-8 -*-
# 第15章 demo1 + demo2：Timer 定时器
# demo1：5 秒后执行 + cancel 提前取消
# demo2：用递归 Timer 实现周期性定时任务
import threading
import time

print("=" * 60)
print("第15章 Timer 定时器演示")
print("=" * 60)

# ============== demo1：0.5 秒后执行 + cancel 取消 ==============
print("\\n[demo1] Timer 定时器与 cancel 取消")

def alarm(name):
    """定时任务：被 Timer 调用时执行"""
    print(f"  [{name}] 闹钟响了！现在时间 {time.strftime('%H:%M:%S')}")

print(f"开始时间: {time.strftime('%H:%M:%S')}")

# t1：0.5 秒后执行 alarm("t1")
t1 = threading.Timer(0.5, alarm, args=("t1",))
t1.start()
print(f"[1] 启动 Timer t1，0.5 秒后执行（线程名={t1.name}）")

# t2：0.3 秒后执行 alarm("t2")，但 0.15 秒后会被取消
t2 = threading.Timer(0.3, alarm, args=("t2",))
t2.start()
print(f"[2] 启动 Timer t2，0.3 秒后执行（线程名={t2.name}）")

time.sleep(0.15)                          # 主线程睡 0.15 秒
t2.cancel()                               # 取消 t2，它不会再执行
print(f"[3] 在 0.15 秒时取消了 t2（cancel 成功，t2 不会执行）")

print(f"[4] 主线程等待 t1 执行完毕...")
t1.join()                                 # 等 t1 跑完
print(f"结束时间: {time.strftime('%H:%M:%S')}")

print("→ demo1 结论：Timer 在指定延迟后执行一次；cancel 可在执行前取消")

# ============== demo2：递归 Timer 实现周期任务 ==============
print("\\n[demo2] 用递归 Timer 实现周期性定时任务（每 0.2 秒一次，共 5 次）")

tick_count = 0                            # 已触发次数
MAX_TICKS = 5                             # 最大触发次数
timer_lock = threading.Lock()             # 保护 current_timer 和 tick_count
current_timer = None                      # 保存当前 Timer 引用，便于 cancel

def tick():
    """周期任务：每次执行后再启动下一个 Timer，形成循环"""
    global tick_count, current_timer
    with timer_lock:
        tick_count += 1
        print(f"  [Tick {tick_count}] 时间 {time.strftime('%H:%M:%S')}")
        if tick_count < MAX_TICKS:
            # 递归：再启动一个 0.2 秒后的 Timer，形成周期循环
            current_timer = threading.Timer(0.2, tick)
            current_timer.start()
            print(f"           已安排下一次 Tick（0.2 秒后）")
        else:
            print(f"           达到最大次数 {MAX_TICKS}，停止周期任务")

print(f"开始时间: {time.strftime('%H:%M:%S')}")
print(f"每 0.2 秒触发一次，共 {MAX_TICKS} 次：")

# 启动第一个 Timer
with timer_lock:
    current_timer = threading.Timer(0.2, tick)
    current_timer.start()

# 主线程等待所有 tick 完成
while True:
    time.sleep(0.1)
    with timer_lock:
        if tick_count >= MAX_TICKS:
            break

# 等待最后一次 tick 完全结束
time.sleep(0.1)
print(f"\\n结束时间: {time.strftime('%H:%M:%S')}")
print("→ demo2 结论：在回调里再启动下一个 Timer，即可实现周期性触发")

# ============== 附加：Timer 是 Thread 的子类 ==============
print("\\n[附加] Timer 是 Thread 的子类：")
print(f"  issubclass(threading.Timer, threading.Thread) = {issubclass(threading.Timer, threading.Thread)}")

# 演示 daemon 属性 + 传参
result = []
def greet(name, punct="!"):
    """带参数的定时任务"""
    result.append(f"Hello {name}{punct}")

# 设为守护线程，主线程退出时不会等它
t = threading.Timer(0.1, greet, args=("世界",), kwargs={"punct": "。"})
t.daemon = True                           # 守护线程，不阻挡主线程退出
t.start()
t.join()                                  # 这里显式等它跑完看结果
print(f"  带参 Timer 执行结果: {result[0]}")

print("\\n" + "=" * 60)
print("Timer 要点：延迟执行一次；cancel 可取消；周期任务用递归 Timer；是 Thread 子类")
print("=" * 60)
`,
  },
];
