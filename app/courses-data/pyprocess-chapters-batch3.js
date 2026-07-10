// =============================================================
// Python 多进程教程（pyprocess）—— 第三批章节
// batch3（9-13章）：进程间通信
//   第9章：   Queue 队列：进程间最常用的通信方式
//   第10章：  Pipe 管道：双向通信
//   第11章：  Manager：跨进程共享复杂对象
//   第12章：  Value / Array 共享内存：最快速的共享方式
//   第13章：  Lock 锁：保护共享资源的并发安全
// =============================================================

export const chapters = [
  // =========================================================
  // 第九章：Queue 队列：进程间最常用的通信方式
  // =========================================================
  {
    id: "mp-09",
    group: "进程间通信",
    icon: "📬",
    title: "Queue 队列：进程间最常用的通信方式",
    content: `## 一、为什么需要 Queue？

子进程跑完了，结果怎么拿回主进程？直接 return 没用——**子进程是独立的 Python 进程，它 return 的值传不出来**。

\`\`\`python
from multiprocessing import Process
# ❌ 这样拿不到子进程的返回值
def worker():
    return 42

p = Process(target=worker)
p.start()
p.join()
# 这里的 worker() 的 42 在子进程里被丢弃了，主进程拿不到
\`\`\`

所以需要**进程间通信（IPC，Inter-Process Communication）**。最常用的方式就是 **Queue 队列**。

## 二、Queue 是什么？

\`multiprocessing.Queue\` 是一个**进程安全的队列**：

- **put(item)**：往队列里塞数据
- **get()**：从队列里取数据（队列空就阻塞等）
- **qsize()**：当前队列长度
- **empty()** / **full()**：是否为空/满
- **task_done()** / **join()**：标记任务完成、等待所有任务被消费

**底层实现**（简化版）：
\`\`\`text
主进程                  子进程
   │                       │
   ├─ Queue.put(data) ───>│
   │                       │ (数据通过 pipe + lock 传递)
   │<─ Queue.get() ───────┤
\`\`\`

## 三、Queue 的基本用法

\`\`\`python
import multiprocessing

def worker(q, name):
    for i in range(3):
        msg = f"{name}-任务{i}"
        q.put(msg)
        print(f"  [{name}] 放入: {msg}")

if __name__ == "__main__":
    q = multiprocessing.Queue()
    processes = [multiprocessing.Process(target=worker, args=(q, f"P{i}")) for i in range(2)]
    for p in processes:
        p.start()
    for p in processes:
        p.join()

    # 从队列里取所有结果
    results = []
    while not q.empty():
        results.append(q.get())
    print(f"收到 {len(results)} 条: {results}")
\`\`\`

## 四、Queue 的 5 个关键点

### 1. put 的 3 种模式

\`\`\`python
q.put(item)              # 默认：队列满就阻塞等
q.put(item, block=False) # 满了直接抛 queue.Full 异常
q.put(item, timeout=3)   # 最多等 3 秒
\`\`\`

### 2. get 的 3 种模式

\`\`\`python
q.get()                  # 默认：队列空就阻塞等
q.get(block=False)       # 空了直接抛 queue.Empty
q.get(timeout=3)         # 最多等 3 秒
\`\`\`

### 3. 优雅终止：poison pill（毒丸）

用一个特殊的"结束标记"让消费者知道该停了：

\`\`\`python
SENTINEL = None  # 约定 None 表示结束

# 生产者
for task in tasks:
    q.put(work(task))
q.put(SENTINEL)

# 消费者
while True:
    item = q.get()
    if item is SENTINEL:
        break
    process(item)
\`\`\`

### 4. task_done() 和 join()

标记"我已经处理完一个任务"，让生产者知道：

\`\`\`python
q.put(task)
# ... 消费者处理完 ...
q.task_done()

# 生产者可以等所有任务被处理完
q.join()  # 等到 task_done() 被调用的次数 == put 次数
\`\`\`

**注意**：这个 join 跟 Process.join 没关系，别搞混。

### 5. Queue 序列化

Queue 里传输的数据要**能 pickle**。能传：数字、字符串、列表、字典、numpy 数组（需 import 后能 pickle）等等。不能传：文件句柄、数据库连接、socket、lambda 等。

## 五、Queue vs Pipe vs 共享内存

| 方式 | 适用场景 | 速度 | 复杂度 |
|------|---------|------|--------|
| **Queue** | 任务分发、结果收集、流式数据 | 中等 | 低（推荐） |
| **Pipe** | 两个进程间双向通信 | 中等 | 低 |
| **Manager** | 共享复杂可变对象（dict、list） | 慢 | 中 |
| **Value/Array** | 共享少量基础类型数据（int、float） | **最快** | 低 |

## 六、本章 demo

下面 demo 演示：
- Queue 基础用法（put/get）
- 阻塞/超时模式
- 多生产者多消费者
- poison pill 优雅终止
- task_done + join
`,
    code: `"""
第九章 demo：multiprocessing.Queue 队列
演示：
  1. 基本 put/get
  2. 阻塞与非阻塞模式
  3. 多生产者多消费者
  4. poison pill 优雅终止
  5. task_done + join
"""

import multiprocessing
import os
import time
import random


# ===== 生产者 =====
def producer(q: multiprocessing.Queue, producer_id: int, num_items: int):
    """生产 num_items 个数据"""
    pid = os.getpid()
    for i in range(num_items):
        item = f"P{producer_id}-item-{i}"
        q.put(item)
        print(f"  [生产者 {producer_id} pid={pid}] 生产: {item}")
        time.sleep(random.uniform(0.1, 0.3))


# ===== 消费者 =====
def consumer(q: multiprocessing.Queue, consumer_id: int, sentinel):
    """消费数据，遇到 sentinel 停止"""
    pid = os.getpid()
    while True:
        try:
            item = q.get(timeout=2)
        except Exception:
            # 队列空了且没有更多数据，退出
            print(f"  [消费者 {consumer_id} pid={pid}] 队列空了，退出")
            break

        if item is sentinel:
            print(f"  [消费者 {consumer_id} pid={pid}] 收到结束标记")
            # 把 sentinel 放回去，让其他消费者也能退出
            q.put(sentinel)
            break

        # 模拟处理
        time.sleep(random.uniform(0.2, 0.5))
        print(f"  [消费者 {consumer_id} pid={pid}] 消费: {item}")


# ===== Demo 1 的模块顶层 worker =====
def basic_queue_worker(q):
    """子进程往队列里放数据（必须模块顶层定义才能 pickle）"""
    q.put("hello from child")
    q.put(42)
    q.put([1, 2, 3])


# ===== Demo 1：基本 put/get =====
def demo_basic():
    print("=== Demo 1: 基本 put/get ===")
    q = multiprocessing.Queue()

    p = multiprocessing.Process(target=basic_queue_worker, args=(q,))
    p.start()
    p.join()

    # 注意：macOS 上 q.qsize() 不可用（NotImplementedError），用 empty() 判断
    count = 0
    while not q.empty():
        print(f"  取出: {q.get()}")
        count += 1
    print(f"  共取出 {count} 个元素")
    print()


# ===== Demo 2：阻塞/非阻塞模式 =====
def demo_block_modes():
    print("=== Demo 2: 阻塞/非阻塞模式 ===")
    q = multiprocessing.Queue(maxsize=2)

    # 模拟"队列已满"的情况
    q.put("A")
    q.put("B")
    print(f"  队列已满（maxsize=2，已放 2 个）")

    # 非阻塞 put：满了直接抛异常
    try:
        q.put("C", block=False)
    except Exception as e:
        print(f"  ❌ 非阻塞 put 报错: {type(e).__name__}: {e}")

    # 阻塞 put with timeout：3 秒后放弃
    try:
        q.put("C", timeout=1)
    except Exception as e:
        print(f"  ⏱️  1 秒后放弃: {type(e).__name__}")

    # 非阻塞 get
    q.get()
    q.get()
    try:
        q.get(block=False)
    except Exception as e:
        print(f"  ❌ 非阻塞 get 报错: {type(e).__name__}: {e}")
    print()


# ===== Demo 3：多生产者多消费者（poison pill） =====
def demo_producer_consumer():
    print("=== Demo 3: 多生产者多消费者（poison pill） ===")

    SENTINEL = "STOP"
    q = multiprocessing.Queue(maxsize=5)

    # 2 个生产者，每个生产 3 个
    producers = [
        multiprocessing.Process(target=producer, args=(q, i, 3))
        for i in range(2)
    ]
    # 2 个消费者
    consumers = [
        multiprocessing.Process(target=consumer, args=(q, i, SENTINEL))
        for i in range(2)
    ]

    # 启动所有进程
    for p in producers + consumers:
        p.start()

    # 等所有生产者完成，再放哨兵
    for p in producers:
        p.join()
    q.put(SENTINEL)  # 一个哨兵就够了，消费者会把它转给其他消费者

    # 等所有消费者完成
    for p in consumers:
        p.join()
    print()


# ===== Demo 4 的模块顶层 consumer =====
def consumer_with_done(q):
    """从队列消费 3 个任务并标记完成"""
    for _ in range(3):
        item = q.get()
        print(f"  [consumer] 消费: {item}")
        q.task_done()  # 标记完成


# ===== Demo 4：task_done + join =====
def demo_task_done():
    print("=== Demo 4: task_done + join ===")

    q = multiprocessing.JoinableQueue()  # 注意：JoinableQueue 才有 task_done

    cons = multiprocessing.Process(target=consumer_with_done, args=(q,))
    cons.start()

    # 主进程生产
    for i in range(3):
        q.put(f"task-{i}")

    q.join()  # 等所有 task_done 被调用
    print("  [main] 所有任务都被消费完")

    cons.join()
    print()


# ===== 主程序 =====
if __name__ == "__main__":
    print(f"主进程 pid = {os.getpid()}\\n")

    demo_basic()
    demo_block_modes()
    demo_producer_consumer()
    demo_task_done()

    print("=== 总结 ===")
    print("• Queue 是进程间最常用的通信方式")
    print("• put/get 都有阻塞/非阻塞/超时三种模式")
    print("• 用 poison pill（SENTINEL）让消费者优雅退出")
    print("• JoinableQueue 配合 task_done() 可以等所有任务完成")
    print("• Queue 里的数据要能 pickle")
`,
  },

  // =========================================================
  // 第十章：Pipe 管道：双向通信
  // =========================================================
  {
    id: "mp-10",
    group: "进程间通信",
    icon: "🔌",
    title: "Pipe 管道：双向通信",
    content: `## 一、什么是 Pipe？

\`multiprocessing.Pipe()\` 返回**两个连接对象**（通常叫 \`conn_a\` 和 \`conn_b\`），每个连接都能 send 和 recv：

\`\`\`text
子进程 A                          子进程 B
   │                                 │
   ▼                                 ▼
conn_a ────OS 内部管道──── conn_b
send("hi") ─────────────> recv() = "hi"
recv() <──send("回复")────
\`\`\`

**和 Queue 的区别**：
- Queue 是**多对多**（多个进程可以 put，多个可以 get）
- Pipe 是**点对点**（两个连接对象之间通信）

## 二、两种模式

### duplex=True（默认）：双向

\`\`\`python
from multiprocessing import Pipe
conn_a, conn_b = Pipe(duplex=True)
conn_a.send("a 发给 b")
msg = conn_b.recv()  # 收到 "a 发给 b"
conn_b.send("b 回复 a")
msg = conn_a.recv()
\`\`\`

### duplex=False：单向

\`\`\`python
from multiprocessing import Pipe
# conn_a 只能发，conn_b 只能收
parent_conn, child_conn = Pipe(duplex=False)
parent_conn.send("单向")
child_conn.recv()  # OK
child_conn.send("不能发")  # ❌ 报错
\`\`\`

## 三、recv() 的阻塞行为

- 队列没数据 → **阻塞**等
- 连接关闭 → 抛 \`EOFError\`
- 设置 \`timeout\` → 超时抛 \`queue.Empty\`（不是 EOFError）

## 四、什么时候用 Pipe？

| 场景 | 推荐 |
|------|------|
| 两个进程来回对话（请求-响应） | ✅ Pipe |
| 多个生产者多个消费者 | ❌ 用 Queue |
| 一对多广播 | ❌ 用 Queue 或 Manager.list |
| 简单 A→B 单向传数据 | ✅ Pipe(duplex=False) |

## 五、send 什么数据？

和 Queue 一样，**要能 pickle**。

\`\`\`python
conn.send([1, 2, 3])          # ✅
conn.send({"key": "value"})   # ✅
conn.send(MyClass())          # ✅ 类实例（如果能 pickle）
conn.send(open("file.txt"))   # ❌ 文件对象
\`\`\`

## 六、本章 demo

下面 demo 演示：
- Pipe 双向通信
- 客户端-服务器模式（Pipe 模拟 RPC）
- recv() 的阻塞和超时
`,
    code: `"""
第十章 demo：multiprocessing.Pipe 管道
演示：
  1. 双向 Pipe（duplex=True）
  2. 单向 Pipe（duplex=False）
  3. 客户端-服务器模式模拟
  4. recv 的阻塞和超时
"""

import multiprocessing
import os
import time


# ===== 简单双向通信的子进程 worker =====
def pipe_basic_child(conn):
    """双向 Pipe 子进程：收消息后回复"""
    msg = conn.recv()
    print(f"  [子进程] 收到: {msg}")
    conn.send(f"你好，父进程！我是 pid={os.getpid()}")
    conn.close()


# ===== 简单双向通信 =====
def demo_basic_pipe():
    print("=== Demo 1: 双向 Pipe ===")

    parent_conn, child_conn = multiprocessing.Pipe()

    p = multiprocessing.Process(target=pipe_basic_child, args=(child_conn,))
    p.start()

    parent_conn.send("你好，子进程")
    print(f"  [主进程] 收到: {parent_conn.recv()}")

    p.join()
    print()


# ===== 单向 Pipe 的子进程 worker =====
def pipe_oneway_child(conn):
    """单向 Pipe 子进程：只能 recv，收到 STOP 退出"""
    while True:
        try:
            msg = conn.recv()
            print(f"  [子进程] 收到: {msg}")
            if msg == "STOP":
                break
        except EOFError:
            print("  [子进程] 父进程关闭了连接")
            break


# ===== 单向 Pipe =====
def demo_one_way():
    print("=== Demo 2: 单向 Pipe ===")

    # Pipe(duplex=False): 第一个 conn 只能 recv，第二个只能 send
    # 父进程要 send（用第二个），子进程要 recv（用第一个）
    child_conn, parent_conn = multiprocessing.Pipe(duplex=False)

    p = multiprocessing.Process(target=pipe_oneway_child, args=(child_conn,))
    p.start()

    # 父进程只发不收
    for i in range(3):
        parent_conn.send(f"单向消息 {i}")
        time.sleep(0.2)
    parent_conn.send("STOP")
    parent_conn.close()  # 关闭后子进程 recv 会抛 EOFError

    p.join()
    print()


# ===== RPC 模拟的模块顶层 server =====
def pipe_rpc_server(conn):
    """RPC 服务器进程：接收请求，处理，返回结果（必须模块顶层定义才能 pickle）"""
    while True:
        try:
            request = conn.recv()
        except EOFError:
            break
        if request is None:
            break
        op, x, y = request
        print(f"  [服务器] 收到请求: {op}({x}, {y})")
        if op == "add":
            result = x + y
        elif op == "mul":
            result = x * y
        else:
            result = None
        conn.send(result)
    conn.close()


# ===== 客户端-服务器模拟 =====
def demo_rpc_style():
    print("=== Demo 3: Pipe 模拟 RPC（请求-响应） ===")

    parent_conn, child_conn = multiprocessing.Pipe()
    srv = multiprocessing.Process(target=pipe_rpc_server, args=(child_conn,))
    srv.start()

    # 客户端发请求
    requests = [("add", 3, 5), ("mul", 4, 7), ("add", 10, 20)]
    for req in requests:
        parent_conn.send(req)
        result = parent_conn.recv()
        print(f"  [客户端] {req} = {result}")

    # 通知服务器退出
    parent_conn.send(None)
    parent_conn.close()
    srv.join()
    print()


# ===== recv 的阻塞和超时 =====
def demo_recv_timeout():
    print("=== Demo 4: recv 的超时 ===")

    parent_conn, child_conn = multiprocessing.Pipe()

    # 故意不启动子进程，演示父进程 recv 会阻塞
    print("  [主进程] 试图 recv，但没有任何子进程发数据...")

    # 注意：Connection.recv() 没有 timeout 参数，会一直阻塞！
    # 正确做法：用 poll(timeout) 先检查是否有数据

    # 方式 1：poll(timeout=0) 非阻塞检查
    has_data = parent_conn.poll(timeout=0)
    if not has_data:
        print("  poll(0) 非阻塞: 没有数据可读")
    else:
        msg = parent_conn.recv()

    # 方式 2：poll(timeout=2) 等 2 秒
    start = time.time()
    has_data = parent_conn.poll(timeout=2)
    elapsed = time.time() - start
    if not has_data:
        print(f"  poll(2) 超时: 没有数据（等了 {elapsed:.1f} 秒）")
    else:
        msg = parent_conn.recv()

    parent_conn.close()
    child_conn.close()
    print()


# ===== 主程序 =====
if __name__ == "__main__":
    print(f"主进程 pid = {os.getpid()}\\n")

    demo_basic_pipe()
    demo_one_way()
    demo_rpc_style()
    demo_recv_timeout()

    print("=== 总结 ===")
    print("• Pipe 是点对点通信，Queue 是多对多")
    print("• duplex=True 双向，duplex=False 单向")
    print("• recv() 默认阻塞，可设 timeout 超时")
    print("• 连接关闭后 recv 抛 EOFError")
    print("• 适合：两个进程来回对话（RPC 模式）")
`,
  },

  // =========================================================
  // 第十一章：Manager：跨进程共享复杂对象
  // =========================================================
  {
    id: "mp-11",
    group: "进程间通信",
    icon: "🗂️",
    title: "Manager：跨进程共享复杂对象",
    content: `## 一、Manager 是什么？

\`multiprocessing.Manager()\` 创建一个**进程间共享的代理对象**。子进程拿到的是**代理**，所有操作都通过代理转发到主进程的真实对象。

\`\`\`python
import multiprocessing

manager = multiprocessing.Manager()
shared_list = manager.list()        # 共享 list
shared_dict = manager.dict()        # 共享 dict
shared_lock = manager.Lock()       # 共享 lock
shared_ns = manager.Namespace()    # 共享命名空间（属性可任意设）
\`\`\`

## 二、能共享哪些对象？

| 共享对象 | 用途 |
|---------|------|
| \`list\` | 共享列表 |
| \`dict\` | 共享字典 |
| \`Value\` | 共享单个值（int、float、string） |
| \`Array\` | 共享数组 |
| \`Lock\`、\`RLock\` | 共享锁 |
| \`Semaphore\` | 共享信号量 |
| \`Condition\` | 共享条件变量 |
| \`Event\` | 共享事件 |
| \`Queue\`、\`JoinableQueue\` | 共享队列 |
| \`Namespace\` | 自定义属性集合 |

## 三、为什么不用普通 list？

\`\`\`python
from multiprocessing import Process
# ❌ 主进程传的普通 list，子进程拿到的是副本
def worker(lst):
    lst.append("modified")  # 只改了子进程里的副本

my_list = []
p = Process(target=worker, args=(my_list,))
p.start()
p.join()
# my_list 还是 []  ← 没变
\`\`\`

\`\`\`python
import multiprocessing
# ✅ Manager 的 list 是共享的
def worker(lst):
    lst.append("modified")

manager = multiprocessing.Manager()
shared = manager.list()
p = Process(target=worker, args=(shared,))
p.start()
p.join()
# shared == ["modified"]  ✅
\`\`\`

## 四、性能权衡

**Manager 的代价是慢**——每次操作都要走"代理 → 主进程 → 真实对象 → 代理返回"的网络（虽然实际是 RPC，但开销类似）。所以：

| 共享方式 | 速度 | 适用 |
|---------|------|------|
| **Manager.list/dict** | 慢 | 共享复杂可变对象，频率不高 |
| **Value/Array** | **最快** | 共享基础类型数据，高频访问 |
| **Queue** | 中 | 流式数据、任务分发 |

**经验法则**：
- 高频读写的简单数据 → Value/Array（第 12 章）
- 大型、复杂、不常改的对象 → Manager
- 流式/任务型数据 → Queue

## 五、Manager 的锁机制

Manager 内部的 list/dict 已经是**进程安全**的（自带锁），所以简单的 \`append\` / \`set\` / \`get\` 不需要额外加锁。

但**复合操作**不是原子的，需要额外加锁：

\`\`\`python
# ❌ 复合操作不是原子的
if shared_dict.get("counter", 0) > 0:  # 读
    shared_dict["counter"] -= 1         # 写
    # 两个操作之间可能被别的进程打断

# ✅ 用 lock 保护复合操作
with shared_lock:
    if shared_dict.get("counter", 0) > 0:
        shared_dict["counter"] -= 1
\`\`\`

## 六、Manager 的清理

Manager 是个独立进程（负责代理转发）。用完后必须 \`manager.shutdown()\`：

\`\`\`python
import multiprocessing
manager = multiprocessing.Manager()
try:
    shared = manager.list()
    # ... 用 ...
finally:
    manager.shutdown()
\`\`\`

或用 with（Python 3.7+ Manager 不直接支持 with，需要手动管理）。

## 七、本章 demo

下面 demo 演示：
- Manager 共享 list
- Manager 共享 dict
- Manager.Namespace 自定义属性
- Manager 锁保护复合操作
- Manager 的性能开销
`,
    code: `"""
第十一章 demo：multiprocessing.Manager
演示：
  1. Manager.list 跨进程共享
  2. Manager.dict 跨进程共享
  3. Manager.Namespace 自定义属性
  4. Manager.Lock 保护复合操作
"""

import multiprocessing
import os
import time


# ===== 共享 list =====
def append_to_list(shared_list, n: int):
    """子进程往共享 list 里加数据"""
    pid = os.getpid()
    for i in range(n):
        shared_list.append(f"from-pid-{pid}-item-{i}")
        time.sleep(0.1)


def demo_shared_list():
    print("=== Demo 1: Manager.list 共享 ===")
    with multiprocessing.Manager() as manager:
        shared = manager.list()
        print(f"  初始: {list(shared)}")

        processes = [
            multiprocessing.Process(target=append_to_list, args=(shared, 3))
            for _ in range(2)
        ]
        for p in processes:
            p.start()
        for p in processes:
            p.join()

        print(f"  最终: {list(shared)}")
        print(f"  长度: {len(shared)}\\n")


# ===== 共享 dict =====
def increment_counter(shared_dict, n: int):
    pid = os.getpid()
    for _ in range(n):
        # 简单赋值是原子的，Manager 内部加锁了
        shared_dict["counter"] = shared_dict.get("counter", 0) + 1
        shared_dict.setdefault("pids", set()).add(pid)


def demo_shared_dict():
    print("=== Demo 2: Manager.dict 共享 ===")
    with multiprocessing.Manager() as manager:
        shared = manager.dict()
        shared["counter"] = 0
        shared["pids"] = set()

        processes = [
            multiprocessing.Process(target=increment_counter, args=(shared, 100))
            for _ in range(4)
        ]
        for p in processes:
            p.start()
        for p in processes:
            p.join()

        print(f"  counter = {shared['counter']}（期望 400）")
        print(f"  参与的 PID 数 = {len(shared['pids'])}\\n")


# ===== Namespace =====
def modify_namespace(ns, key, value):
    """子进程修改 namespace 的属性"""
    pid = os.getpid()
    print(f"  [pid={pid}] 修改前: {key}={getattr(ns, key, None)}")
    setattr(ns, key, value)
    time.sleep(0.2)
    print(f"  [pid={pid}] 修改后: {key}={getattr(ns, key, None)}")


def demo_namespace():
    print("=== Demo 3: Manager.Namespace ===")
    with multiprocessing.Manager() as manager:
        ns = manager.Namespace()
        ns.x = 0
        ns.y = "hello"

        processes = [
            multiprocessing.Process(target=modify_namespace, args=(ns, "x", i))
            for i in range(3)
        ]
        for p in processes:
            p.start()
        for p in processes:
            p.join()

        print(f"  最终 ns.x = {ns.x}（被最后一个进程覆盖）")
        print(f"  最终 ns.y = {ns.y}\\n")


# ===== 复合操作的锁 =====
def compound_with_lock(shared_dict, lock, n: int):
    """复合操作：读-改-写，必须加锁"""
    for _ in range(n):
        with lock:
            current = shared_dict["counter"]
            # 故意加一点延迟，模拟业务逻辑
            time.sleep(0.001)
            shared_dict["counter"] = current + 1


def compound_without_lock(shared_dict, n: int):
    """复合操作：没加锁，可能丢更新"""
    for _ in range(n):
        current = shared_dict["counter"]
        time.sleep(0.001)
        shared_dict["counter"] = current + 1


def demo_lock_needed():
    print("=== Demo 4: 复合操作需要 lock ===")
    with multiprocessing.Manager() as manager:
        lock = manager.Lock()

        # 有锁版本
        d1 = manager.dict()
        d1["counter"] = 0
        procs = [
            multiprocessing.Process(target=compound_with_lock, args=(d1, lock, 50))
            for _ in range(4)
        ]
        for p in procs:
            p.start()
        for p in procs:
            p.join()
        print(f"  有锁版本: counter = {d1['counter']}（期望 200）")

        # 无锁版本
        d2 = manager.dict()
        d2["counter"] = 0
        procs = [
            multiprocessing.Process(target=compound_without_lock, args=(d2, 50))
            for _ in range(4)
        ]
        for p in procs:
            p.start()
        for p in procs:
            p.join()
        print(f"  无锁版本: counter = {d2['counter']}（通常 < 200，丢了更新）\\n")


# ===== 主程序 =====
if __name__ == "__main__":
    print(f"主进程 pid = {os.getpid()}\\n")

    demo_shared_list()
    demo_shared_dict()
    demo_namespace()
    demo_lock_needed()

    print("=== 总结 ===")
    print("• Manager 提供跨进程共享的 list/dict/Namespace 等")
    print("• 简单操作是原子的；复合操作需要 lock")
    print("• 性能比 Value/Array 慢（要走代理）")
    print("• 用完要 manager.shutdown()（with 块自动调）")
    print("• 适合：复杂对象的共享，频率不高的场景")
`,
  },

  // =========================================================
  // 第十二章：Value / Array 共享内存：最快速的共享方式
  // =========================================================
  {
    id: "mp-12",
    group: "进程间通信",
    icon: "⚡",
    title: "Value / Array 共享内存：最快速的共享方式",
    content: `## 一、为什么 Value/Array 更快？

Manager 的共享要走**网络代理**，慢。Value/Array 直接在**共享内存**里放数据——所有进程读写的都是同一块物理内存。

\`\`\`text
Manager 路线：  子进程 → 代理 → 主进程 → 真实对象
               （每次操作都跨进程，慢）

Value/Array 路线：子进程 → 共享内存（同一块物理地址）
                  （直接读写，快 10-100 倍）
\`\`\`

## 二、Value：共享单个值

\`\`\`python
import multiprocessing

# typecode 是 array 用的类型码
# 'i' = signed int, 'd' = double, 'c' = char
shared_int = multiprocessing.Value('i', 0)        # 共享一个 int
shared_float = multiprocessing.Value('d', 0.0)    # 共享一个 float

# 使用
shared_int.value = 10
print(shared_int.value)
\`\`\`

### 常用 typecode

| typecode | C 类型 | Python 类型 |
|----------|--------|-------------|
| \`'i'\` | signed int | int |
| \`'l'\` | signed long | int |
| \`'f'\` | float | float |
| \`'d'\` | double | float |
| \`'c'\` | char | 长度为 1 的 bytes |

## 三、Array：共享数组

\`\`\`python
import multiprocessing
shared_array = multiprocessing.Array('i', 10)  # 10 个 int
shared_array[0] = 100
shared_array[1:4] = [1, 2, 3]
\`\`\`

可以用 \`.tolist()\` 转成 Python list（要 import numpy 或手动转）：

\`\`\`python
# 简单用法
for i in range(len(shared_array)):
    print(shared_array[i])
\`\`\`

## 四、Value/Array 的锁

默认情况下 Value/Array **不带锁**。多个进程同时写会出问题。

\`\`\`python
from multiprocessing import Value
# 带锁
v = Value('i', 0, lock=True)   # 默认就是 True

# 不带锁（更快，但不安全）
v = Value('i', 0, lock=False)
\`\`\`

带锁的 Value/Array 操作是**原子的**——读、写、加减都是。

## 五、复合操作仍然需要 lock

即使 Value 自带锁，**复合操作**仍然不是原子的：

\`\`\`python
# ❌ 复合操作：读 → 算 → 写
current = v.value
v.value = current + 1
# 两个操作之间可能被别的进程打断，丢更新
\`\`\`

\`\`\`python
# ✅ 显式加锁
with v.get_lock():
    current = v.value
    v.value = current + 1
\`\`\`

## 六、Value/Array 的限制

| 限制 | 说明 |
|------|------|
| 只能存基础类型 | int、float、char，不能存字符串、对象 |
| 不像 list 那样灵活 | 数组长度固定 |
| 跨机器不行 | 只能在**同一台机器**的进程间共享 |

## 七、什么时候用 Value/Array？

✅ **适合**：
- 共享计数器、累加器
- 共享标志位、状态
- 共享小的数值数组
- 高频读写（每次操作都很快）

❌ **不适合**：
- 共享字符串、字典、复杂对象 → 用 Manager
- 大量数据流 → 用 Queue
- 跨机器通信 → 用 socket / 消息队列

## 八、ctypes 高级用法

如果想共享字符串或更复杂的 C 类型，可以用 ctypes：

\`\`\`python
import ctypes
import multiprocessing

# 共享一个 100 字节的 char 数组（类似字符串）
shared_str = multiprocessing.Array(ctypes.c_char, 100)
shared_str.value = b"hello world"

# 共享一个自定义结构
class Point(ctypes.Structure):
    _fields_ = [("x", ctypes.c_double), ("y", ctypes.c_double)]

shared_point = multiprocessing.Value(Point, (0.0, 0.0))
shared_point.value.x = 1.5
shared_point.value.y = 2.5
\`\`\`

## 九、本章 demo

下面 demo 演示：
- Value 共享 int
- Array 共享数组
- 自带锁的原子操作
- 复合操作的锁保护
- 性能对比（Value vs Manager）
`,
    code: `"""
第十二章 demo：multiprocessing.Value / Array
演示：
  1. Value 共享 int
  2. Array 共享数组
  3. 原子操作（+= 不会丢）
  4. 复合操作的锁保护
  5. 性能对比：Value vs Manager.dict
"""

import multiprocessing
import os
import time


# ===== 共享 int 计数器 =====
def increment_value(shared_counter, n: int):
    """用 Value 的原子 +="""
    for _ in range(n):
        shared_counter.value += 1  # Value 内部已经加锁，这个是原子的


def demo_value():
    print("=== Demo 1: Value 共享 int ===")
    counter = multiprocessing.Value('i', 0)

    processes = [
        multiprocessing.Process(target=increment_value, args=(counter, 1000))
        for _ in range(4)
    ]
    for p in processes:
        p.start()
    for p in processes:
        p.join()

    print(f"  counter = {counter.value}（期望 4000，无丢失）\\n")


# ===== 共享数组 =====
def fill_array(shared_arr, start_idx):
    """子进程填数组的一段"""
    pid = os.getpid()
    for i in range(5):
        shared_arr[start_idx + i] = (start_idx + i) * 10
    print(f"  [pid={pid}] 填充 [{start_idx}:{start_idx+5}]")


def demo_array():
    print("=== Demo 2: Array 共享数组 ===")
    shared = multiprocessing.Array('i', 20)  # 20 个 int

    # 4 个进程，每个填充 5 个位置
    processes = [
        multiprocessing.Process(target=fill_array, args=(shared, i * 5))
        for i in range(4)
    ]
    for p in processes:
        p.start()
    for p in processes:
        p.join()

    print(f"  最终数组: {list(shared)}\\n")


# ===== 复合操作的锁 =====
def compound_increment(shared, n):
    """复合操作：读-改-写"""
    for _ in range(n):
        with shared.get_lock():
            current = shared.value
            # 模拟业务
            time.sleep(0.0001)
            shared.value = current + 1


def compound_no_lock(shared, n):
    """无锁的复合操作：用于演示丢失更新（必须模块顶层定义才能 pickle）"""
    for _ in range(n):
        current = shared.value
        time.sleep(0.0001)
        shared.value = current + 1


def demo_compound_lock():
    print("=== Demo 3: 复合操作需要 lock ===")

    # 带锁的复合操作
    v1 = multiprocessing.Value('i', 0)
    procs = [multiprocessing.Process(target=compound_increment, args=(v1, 50)) for _ in range(4)]
    for p in procs:
        p.start()
    for p in procs:
        p.join()
    print(f"  带锁复合: {v1.value}（期望 200）")

    # 不带锁的复合操作
    v2 = multiprocessing.Value('i', 0, lock=False)  # 关闭内部锁
    procs = [multiprocessing.Process(target=compound_no_lock, args=(v2, 50)) for _ in range(4)]
    for p in procs:
        p.start()
    for p in procs:
        p.join()
    print(f"  无锁复合: {v2.value}（通常 < 200，丢失更新）\\n")


# ===== 性能对比 =====
def bench_value(shared, n):
    for _ in range(n):
        with shared.get_lock():
            shared.value += 1


def bench_manager(shared_dict, n):
    for _ in range(n):
        with shared_dict["lock"]:
            shared_dict["counter"] += 1


def demo_perf():
    print("=== Demo 4: 性能对比 Value vs Manager ===")
    N = 500
    REPEAT = 2

    # Value 测速
    v = multiprocessing.Value('i', 0)
    start = time.time()
    procs = [multiprocessing.Process(target=bench_value, args=(v, N)) for _ in range(REPEAT)]
    for p in procs:
        p.start()
    for p in procs:
        p.join()
    value_time = time.time() - start
    print(f"  Value:     {value_time:.3f}s (counter={v.value})")

    # Manager 测速
    with multiprocessing.Manager() as manager:
        d = manager.dict()
        d["counter"] = 0
        d["lock"] = manager.Lock()
        start = time.time()
        procs = [multiprocessing.Process(target=bench_manager, args=(d, N)) for _ in range(REPEAT)]
        for p in procs:
            p.start()
        for p in procs:
            p.join()
        manager_time = time.time() - start
        print(f"  Manager:   {manager_time:.3f}s (counter={d['counter']})")
        print(f"  Value 比 Manager 快约 {manager_time / value_time:.1f}x\\n")


# ===== 主程序 =====
if __name__ == "__main__":
    print(f"主进程 pid = {os.getpid()}\\n")

    demo_value()
    demo_array()
    demo_compound_lock()
    demo_perf()

    print("=== 总结 ===")
    print("• Value/Array 用共享内存，速度比 Manager 快 10-100x")
    print("• 适合共享基础类型（int、float、bytes）")
    print("• 单操作是原子的；复合操作要显式 get_lock()")
    print("• 大量数据流用 Queue，复杂对象用 Manager")
    print("• 只能在同一台机器的进程间共享")
`,
  },

  // =========================================================
  // 第十三章：Lock 锁：保护共享资源的并发安全
  // =========================================================
  {
    id: "mp-13",
    group: "进程间通信",
    icon: "🔒",
    title: "Lock 锁：保护共享资源的并发安全",
    content: `## 一、什么是竞态条件（Race Condition）？

当多个进程/线程**同时**操作同一个共享资源，结果**不确定**时，就是竞态条件。

\`\`\`python
# 经典的"丢更新"问题
counter = 0

def increment():
    global counter
    current = counter  # 读
    counter = current + 1  # 写

# 两个进程同时跑
# 进程 A 读到 current=0，准备写 1
# 进程 B 读到 current=0（还在 A 写之前），准备写 1
# 结果：counter=1，而不是 2
\`\`\`

**本质**：读 → 算 → 写 这三步不是原子的，中间被打断就会出问题。

## 二、Lock 怎么解决？

Lock 让**同一时刻只有一个进程能进入临界区**：

\`\`\`python
import multiprocessing
lock = multiprocessing.Lock()

def increment():
    global counter
    with lock:  # 进入临界区前加锁
        current = counter
        counter = current + 1
    # with 块结束自动释放锁
\`\`\`

## 三、Lock 的 4 个操作

\`\`\`python
import multiprocessing
lock = multiprocessing.Lock()

# 方法 1：上下文管理器（推荐）
with lock:
    do_something()

# 方法 2：手动 acquire/release
lock.acquire()
try:
    do_something()
finally:
    lock.release()

# 方法 3：非阻塞 acquire
if lock.acquire(block=False):
    try:
        do_something()
    finally:
        lock.release()
else:
    print("锁被占用，跳过")

# 方法 4：超时 acquire
if lock.acquire(timeout=3):
    try:
        do_something()
    finally:
        lock.release()
else:
    print("3 秒内没拿到锁")
\`\`\`

## 四、死锁（Deadlock）

死锁 = 两个锁互相等对方释放，导致都卡住。

\`\`\`python
from threading import Lock
# 经典死锁
lock_a = Lock()
lock_b = Lock()

def worker1():
    with lock_a:
        time.sleep(0.1)  # 让 worker2 有机会抢 lock_b
        with lock_b:  # 等 lock_b，但 worker2 持有 lock_b
            pass

def worker2():
    with lock_b:
        time.sleep(0.1)  # 让 worker1 有机会抢 lock_a
        with lock_a:  # 等 lock_a，但 worker1 持有 lock_a
            pass
# → 死锁！
\`\`\`

### 死锁的 4 个必要条件（全部满足才会死锁）

1. **互斥**：锁一次只能被一个进程持有
2. **持有并等待**：进程持有一个锁的同时等另一个锁
3. **不可抢占**：不能强制从进程手里抢锁
4. **循环等待**：A 等 B 释放，B 等 A 释放

**打破任一条件**就能避免死锁。最常用的方法是**按固定顺序加锁**（所有进程都先 lock_a 再 lock_b）。

## 五、避免死锁的 4 个原则

1. **按固定顺序加锁**：所有进程都先锁 A 再锁 B
2. **一次性获取所有锁**：用 \`acquire(blocking=False)\` 全锁一起加
3. **用 try/finally 确保释放**：不用 with 也能保证 release
4. **减少锁的持有时间**：临界区尽量短，不在锁里做 IO

## 六、RLock：可重入锁

\`multiprocessing.RLock\` 允许**同一个进程多次 acquire**：

\`\`\`python
import multiprocessing
rlock = multiprocessing.RLock()

def recursive_func(n):
    with rlock:
        print(f"  level {n}")
        if n > 0:
            recursive_func(n - 1)  # 同一进程再 acquire 不会死锁

recursive_func(3)
# 普通 Lock 会死锁；RLock 正常
\`\`\`

## 七、本章 demo

下面 demo 演示：
- 竞态条件：无锁导致丢更新
- Lock 修复：原子操作
- 死锁的产生
- 死锁的解决（固定顺序）
- RLock 可重入锁
`,
    code: `"""
第十三章 demo：multiprocessing.Lock 锁
演示：
  1. 竞态条件：无锁导致丢更新
  2. Lock 修复：原子操作
  3. 死锁的产生
  4. 死锁的解决（固定顺序）
  5. RLock 可重入锁
"""

import multiprocessing
import time
import os


# ===== 共享计数器 =====
def increment_no_lock(shared, n):
    """无锁的复合操作：read-modify-write"""
    for _ in range(n):
        current = shared.value
        # 模拟业务处理时间
        time.sleep(0.0001)
        shared.value = current + 1


def increment_with_lock(shared, n):
    """加锁的复合操作"""
    for _ in range(n):
        with shared.get_lock():
            current = shared.value
            time.sleep(0.0001)
            shared.value = current + 1


# ===== Demo 1：竞态条件 =====
def demo_race_condition():
    print("=== Demo 1: 竞态条件 ===")
    shared = multiprocessing.Value('i', 0, lock=False)  # 关闭 Value 内部锁

    procs = [multiprocessing.Process(target=increment_no_lock, args=(shared, 50)) for _ in range(4)]
    for p in procs:
        p.start()
    for p in procs:
        p.join()
    print(f"  无锁: counter = {shared.value}（期望 200，通常 < 200）\\n")


# ===== Demo 2：Lock 修复 =====
def demo_lock_fix():
    print("=== Demo 2: Lock 修复 ===")
    shared = multiprocessing.Value('i', 0)  # 默认带锁

    procs = [multiprocessing.Process(target=increment_with_lock, args=(shared, 50)) for _ in range(4)]
    for p in procs:
        p.start()
    for p in procs:
        p.join()
    print(f"  加锁: counter = {shared.value}（期望 200）\\n")


# ===== Demo 3：死锁 =====
def deadlock_worker1(lock_a, lock_b):
    """按 A→B 顺序加锁"""
    with lock_a:
        print(f"  [pid={os.getpid()}] 拿到 lock_a")
        time.sleep(0.5)
        print(f"  [pid={os.getpid()}] 等待 lock_b...")
        with lock_b:
            print(f"  [pid={os.getpid()}] 拿到 lock_b")


def deadlock_worker2(lock_b, lock_a):
    """按 B→A 顺序加锁（反向！）→ 死锁"""
    with lock_b:
        print(f"  [pid={os.getpid()}] 拿到 lock_b")
        time.sleep(0.5)
        print(f"  [pid={os.getpid()}] 等待 lock_a...")
        with lock_a:
            print(f"  [pid={os.getpid()}] 拿到 lock_a")


def safe_deadlock_worker1(la, lb):
    """死锁演示 worker1（必须模块顶层定义才能 pickle）"""
    try:
        with la:
            time.sleep(0.3)
            with lb:
                pass
    except Exception as e:
        print(f"  worker1 异常: {e}")


def safe_deadlock_worker2(lb, la):
    """死锁演示 worker2（必须模块顶层定义才能 pickle）"""
    try:
        with lb:
            time.sleep(0.3)
            with la:
                pass
    except Exception as e:
        print(f"  worker2 异常: {e}")


def demo_deadlock():
    print("=== Demo 3: 死锁（反向加锁）===")
    lock_a = multiprocessing.Lock()
    lock_b = multiprocessing.Lock()

    # 用 timeout 避免 demo 卡住
    p1 = multiprocessing.Process(target=safe_deadlock_worker1, args=(lock_a, lock_b))
    p2 = multiprocessing.Process(target=safe_deadlock_worker2, args=(lock_b, lock_a))
    p1.start()
    p2.start()
    p1.join(timeout=2)
    p2.join(timeout=2)

    if p1.is_alive() or p2.is_alive():
        print("  ⚠️  死锁了！两个进程都在等对方的锁")
        # 强杀
        p1.terminate()
        p2.terminate()
        p1.join()
        p2.join()
    else:
        print("  没死锁（不应该）")
    print()


# ===== Demo 4 worker：统一加锁顺序 =====
def deadlock_fixed_worker(order, la, lb):
    """统一顺序加锁的 worker（必须模块顶层定义才能 pickle）"""
    # 按相同顺序加锁
    with la:
        with lb:
            print(f"  [pid={os.getpid()} order={order}] 拿到 a 和 b")


# ===== Demo 4：死锁解决 =====
def demo_deadlock_fixed():
    print("=== Demo 4: 死锁的解决（统一顺序）===")
    lock_a = multiprocessing.Lock()
    lock_b = multiprocessing.Lock()

    # 两个进程都按 A→B 顺序加锁
    p1 = multiprocessing.Process(target=deadlock_fixed_worker, args=("A→B", lock_a, lock_b))
    p2 = multiprocessing.Process(target=deadlock_fixed_worker, args=("A→B", lock_a, lock_b))
    p1.start()
    p2.start()
    p1.join()
    p2.join()
    print("  ✅ 没死锁！\\n")


# ===== Demo 5：RLock 可重入 =====
def recursive_worker(rlock, depth, name):
    """递归函数多次 acquire 同一个锁"""
    if depth <= 0:
        return
    with rlock:
        print(f"  [{name}] depth={depth}, 拿到锁")
        time.sleep(0.1)
        recursive_worker(rlock, depth - 1, name)


def demo_rlock():
    print("=== Demo 5: RLock 可重入锁 ===")
    rlock = multiprocessing.RLock()

    p1 = multiprocessing.Process(target=recursive_worker, args=(rlock, 3, "RLock进程"))
    p1.start()
    p1.join()
    print("  ✅ RLock 允许同一进程多次 acquire\\n")


# ===== 主程序 =====
if __name__ == "__main__":
    print(f"主进程 pid = {os.getpid()}\\n")

    demo_race_condition()
    demo_lock_fix()
    demo_deadlock()
    demo_deadlock_fixed()
    demo_rlock()

    print("=== 总结 ===")
    print("• Lock 解决竞态条件：保证临界区原子性")
    print("• 死锁的 4 个条件：互斥、持有等待、不可抢占、循环等待")
    print("• 解决死锁：按固定顺序加锁、减少锁粒度")
    print("• RLock 可重入锁：同一进程可多次 acquire")
    print("• with 上下文管理器是最安全的用法")
`,
  },
];
