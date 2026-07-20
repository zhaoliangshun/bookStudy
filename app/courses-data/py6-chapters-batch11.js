export const chapters = [
  {
    id: "py6-deque",
    group: "数据结构进阶",
    icon: "📖",
    title: "双端队列 deque",
    content: `## 双端队列 deque（collections.deque）

### 什么是双端队列
\`deque\`（Double-Ended Queue）是 Python 标准库 \`collections\` 模块提供的一种双向队列数据结构。它支持在队列两端高效地添加和删除元素，两端操作的时间复杂度都是 **O(1)**，而列表 \`list\` 在头部插入/删除却是 O(n)。

### deque 与 list 的核心区别

| 操作 | list | deque | 说明 |
|------|------|-------|------|
| \`append(x)\` 尾部添加 | O(1) | O(1) | 两者都很快 |
| \`appendleft(x)\` 头部添加 | 不支持 | O(1) | deque 独有 |
| \`pop()\` 尾部弹出 | O(1) | O(1) | 两者都很快 |
| \`popleft()\` 头部弹出 | O(n) | O(1) | list 用 pop(0) 是 O(n) |
| \`insert(0, x)\` 头部插入 | O(n) | O(1) | deque 用 appendleft |
| 随机访问 \`d[i]\` | O(1) | O(n) | list 更快 |
| 切片 \`d[a:b]\` | 支持 | 不支持 | list 独有 |
| 内存占用 | 较小 | 较大（双向链表式） | list 更省 |

### deque 的核心方法

#### 基本操作
\`\`\`python
from collections import deque

d = deque([1, 2, 3])
d.append(4)        # 右端添加: deque([1,2,3,4])
d.appendleft(0)    # 左端添加: deque([0,1,2,3,4])
d.pop()            # 右端弹出: 4
d.popleft()        # 左端弹出: 0
\`\`\`

#### 批量操作
\`\`\`python
from collections import deque
d = deque([1, 2, 3])
d.extend([4, 5])        # 右端扩展: deque([1,2,3,4,5])
d.extendleft([0, -1])   # 左端扩展（注意顺序反转）: deque([-1,0,1,2,3,4,5])
\`\`\`

#### 旋转操作 rotate
\`rotate(n)\` 把队列右旋 n 步（n 为负则左旋）：
\`\`\`python
from collections import deque
d = deque([1, 2, 3, 4, 5])
d.rotate(2)    # deque([4, 5, 1, 2, 3])  右旋2步
d.rotate(-1)   # deque([5, 1, 2, 3, 4])  左旋1步
\`\`\`

#### maxlen 自动丢弃的妙用
设置 \`maxlen\` 后，deque 满后新增元素会自动从另一端丢弃旧元素，**无需手动判断长度**：
\`\`\`python
from collections import deque
d = deque(maxlen=3)
for i in range(5):
    d.append(i)
# 最终 deque([2, 3, 4])，0 和 1 被自动丢弃
\`\`\`

### 业务场景

#### 1. 滑动窗口
在流式数据中维护最近 N 个元素，做均值/最大值统计：
\`\`\`python
from collections import deque
def moving_average(stream, window=3):
    win = deque(maxlen=window)
    for x in stream:
        win.append(x)
        if len(win) == window:
            yield sum(win) / window

list(moving_average([1, 2, 3, 4, 5]))  # [2.0, 3.0, 4.0]
\`\`\`

#### 2. 最近 N 条记录（日志/历史）
\`\`\`python
from collections import deque
recent_logs = deque(maxlen=100)  # 只保留最近100条
recent_logs.appendleft(new_log)  # 新日志放最前
\`\`\`

#### 3. 广度优先搜索（BFS）
BFS 天然需要 FIFO 队列，deque 的 popleft 是 O(1)：
\`\`\`python
def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for nxt in graph[node]:
            if nxt not in visited:
                visited.add(nxt)
                queue.append(nxt)
\`\`\`

#### 4. 固定大小缓冲区
生产者-消费者模型中作为有界缓冲区，自动淘汰最老数据。

### 时间复杂度对比表

| 操作 | list | deque |
|------|------|-------|
| 索引访问 | O(1) | O(n) |
| 头部插入 | O(n) | O(1) |
| 尾部插入 | O(1) 均摊 | O(1) |
| 头部删除 | O(n) | O(1) |
| 尾部删除 | O(1) | O(1) |
| 中间插入 | O(n) | O(n) |
| 查找 \`in\` | O(n) | O(n) |

> 💡 **提示**：deque 内部是「块状双向链表」（block-based doubly linked list），每个块存储 64 个 PyObject 指针，既保证两端 O(1) 操作，又比纯链表节省内存。

### 避坑指南

> ⚠️ **警告 1**：\`extendleft\` 会反转输入顺序！
> \`deque([1,2]).extendleft([3,4])\` 得到 \`deque([4,3,1,2])\`，因为每次都从左端插入。

> ⚠️ **警告 2**：deque **不支持切片** \`d[1:3]\`，也不支持 \`d[i] = x\` 的快速修改（虽然索引可读，但 O(n)）。

> ⚠️ **警告 3**：随机访问场景（频繁 \`d[i]\`）请用 list，deque 是为两端操作优化的。

### 最佳实践总结
1. **频繁头插/头删**：用 deque，不要用 list 的 \`insert(0,x)\` 或 \`pop(0)\`
2. **固定容量场景**：用 \`maxlen=N\` 自动淘汰，省去手动判断
3. **BFS / 层序遍历**：始终用 deque 的 popleft
4. **随机访问多**：仍然用 list
5. **线程安全**：deque 的 append/pop 是原子的，但多步操作仍需加锁`,
    code: `from collections import deque
import time

print("=== 双端队列 deque 演示 ===\\n")

print("--- 1. 基本操作 ---")
# deque 支持两端 O(1) 添加/删除
d = deque([1, 2, 3])
print(f"初始: {d}")
d.append(4)          # 右端添加
d.appendleft(0)      # 左端添加
print(f"append(4)+appendleft(0): {d}")
print(f"pop() 弹出右端: {d.pop()}")        # 右端弹出
print(f"popleft() 弹出左端: {d.popleft()}")  # 左端弹出
print(f"结果: {d}")

print("\\n--- 2. extend / extendleft ---")
d = deque([1, 2, 3])
d.extend([4, 5])           # 右端批量添加
print(f"extend([4,5]): {d}")
d.extendleft([0, -1])      # 左端批量添加（注意顺序反转）
print(f"extendleft([0,-1]): {d}  <- 注意 0,-1 变成 -1,0")

print("\\n--- 3. rotate 旋转 ---")
d = deque([1, 2, 3, 4, 5])
print(f"初始: {d}")
d.rotate(2)    # 右旋2步
print(f"rotate(2): {d}")
d.rotate(-1)   # 左旋1步
print(f"rotate(-1): {d}")

print("\\n--- 4. maxlen 自动丢弃（业务场景：最近N条记录）---")
recent = deque(maxlen=3)   # 只保留最近3条
for i in range(1, 6):
    recent.append(f"日志#{i}")
    print(f"  添加日志#{i} -> {list(recent)}")
print(f"最终 recent = {recent}")
# 演示 maxlen 的妙用：无需手动判断 len，自动淘汰最老的

print("\\n--- 5. 业务场景：滑动窗口求移动平均 ---")
def moving_average(stream, window=3):
    """使用 deque(maxlen=window) 实现高效滑动窗口"""
    win = deque(maxlen=window)
    for x in stream:
        win.append(x)
        if len(win) == window:
            yield round(sum(win) / window, 2)

data = [10, 20, 30, 40, 50, 60]
print(f"原始数据: {data}")
print(f"3日移动平均: {list(moving_average(data, 3))}")

print("\\n--- 6. 业务场景：BFS 广度优先搜索 ---")
def bfs(graph, start):
    """使用 deque 做 BFS，popleft 是 O(1)"""
    visited = set([start])
    queue = deque([start])
    order = []
    while queue:
        node = queue.popleft()   # 关键：popleft O(1)
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order

graph = {
    "A": ["B", "C"],
    "B": ["A", "D", "E"],
    "C": ["A", "F"],
    "D": ["B"],
    "E": ["B", "F"],
    "F": ["C", "E"],
}
print(f"图: {graph}")
print(f"从 A 出发 BFS 顺序: {bfs(graph, 'A')}")

print("\\n--- 7. 性能对比：list.pop(0) vs deque.popleft() ---")
n = 100000

# list 的 pop(0) 是 O(n)，因为要整体前移
lst = list(range(n))
t1 = time.time()
while lst:
    lst.pop(0)
t_list = time.time() - t1

# deque 的 popleft 是 O(1)
dq = deque(range(n))
t2 = time.time()
while dq:
    dq.popleft()
t_deque = time.time() - t2

print(f"弹出 {n} 个头部元素：")
print(f"  list.pop(0) 耗时: {t_list:.4f}s (O(n) 每次操作)")
print(f"  deque.popleft() 耗时: {t_deque:.4f}s (O(1) 每次操作)")
print(f"  deque 快约 {t_list / t_deque:.0f} 倍")

print("\\n--- 8. 避坑演示：extendleft 顺序反转 ---")
d = deque([1, 2, 3])
d.extendleft([4, 5, 6])
print(f"deque([1,2,3]).extendleft([4,5,6]) = {list(d)}")
print("提示：extendleft 是逐个从左端插入，所以 4 先插、5 再插到4左边、6 再插到5左边")

print("\\n=== deque 总结 ===")
print("1. 两端 O(1) 添加/删除，比 list 的 insert(0)/pop(0) 快得多")
print("2. maxlen=N 实现固定容量，自动淘汰旧元素")
print("3. BFS / 滑动窗口 / 历史记录场景首选")
print("4. 不支持切片，随机访问慢，频繁 d[i] 用 list")
print("5. extendleft 会反转顺序，要小心")
`,
  },
  {
    id: "py6-heapq",
    group: "数据结构进阶",
    icon: "⛰️",
    title: "heapq 堆队列与优先队列",
    content: `## heapq 堆队列与优先队列

### 堆的概念
堆（Heap）是一种特殊的完全二叉树：
- **小顶堆**（Python 默认）：每个父节点的值 ≤ 子节点的值，堆顶是最小值
- **大顶堆**：每个父节点的值 ≥ 子节点的值，堆顶是最大值
- **完全二叉树**：除最后一层外全满，最后一层从左到右排布

Python 的 \`heapq\` 模块默认实现**小顶堆**，底层用一个普通 list 存储，对索引为 \`i\` 的节点：
- 左子节点索引：\`2*i + 1\`
- 右子节点索引：\`2*i + 2\`
- 父节点索引：\`(i-1) // 2\`

### heapq 核心函数

| 函数 | 时间复杂度 | 说明 |
|------|-----------|------|
| \`heapify(lst)\` | O(n) | 把列表原地转成堆 |
| \`heappush(heap, x)\` | O(log n) | 添加元素并维持堆性质 |
| \`heappop(heap)\` | O(log n) | 弹出堆顶最小值 |
| \`heapreplace(heap, x)\` | O(log n) | 弹出最小值同时压入新值（比 pop+push 快） |
| \`heappushpop(heap, x)\` | O(log n) | 先压入再弹出最小值 |
| \`nsmallest(n, it)\` | O(n log k) | 取最小的 n 个 |
| \`nlargest(n, it)\` | O(n log k) | 取最大的 n 个 |

### 基础用法
\`\`\`python
import heapq

# 1. 建堆
nums = [5, 2, 8, 1, 9, 3]
heapq.heapify(nums)      # [1, 2, 3, 5, 9, 8]
print(nums[0])            # 1（堆顶是最小值）

# 2. 入堆 / 出堆
heapq.heappush(nums, 0)   # 加入 0
print(heapq.heappop(nums)) # 0（弹出最小）

# 3. 取 top K
print(heapq.nlargest(3, nums))   # 最大的3个
print(heapq.nsmallest(3, nums))  # 最小的3个
\`\`\`

### 大顶堆技巧（取负数）
Python heapq 默认小顶堆，要实现大顶堆只需把元素取负：
\`\`\`python
import heapq
max_heap = []
for x in [5, 2, 8, 1]:
    heapq.heappush(max_heap, -x)   # 存负数
print(-heapq.heappop(max_heap))    # 8（实际最大值）
\`\`\`

### 实现优先队列（含同优先级处理）
任务调度场景：优先级数字越小越优先，相同优先级按插入顺序。
\`\`\`python
import heapq
import itertools

class PriorityQueue:
    def __init__(self):
        self._heap = []
        self._counter = itertools.count()  # 自增计数器
    def push(self, item, priority=0):
        # 元组比较：(priority, count, item)
        # count 防止 item 不可比较时报错，也保证 FIFO
        heapq.heappush(self._heap, (priority, next(self._counter), item))
    def pop(self):
        return heapq.heappop(self._heap)[2]
\`\`\`

> 💡 **提示**：直接用元组 \` (priority, item) \` 时，如果优先级相同，会去比较 item，item 若不可比较（如字典）会抛 \`TypeError\`。加一个自增 count 是经典解决套路。

### 业务场景

#### 1. Top K 问题
找海量数据中最大/最小的 K 个元素。**不要排序！** 排序是 O(n log n)，堆是 O(n log k)：
\`\`\`python
import heapq
# 找最大的 3 个
heapq.nlargest(3, huge_list)
# 或手动维护大小为 K 的小顶堆
\`\`\`

#### 2. 任务调度
\`\`\`python
import heapq
tasks = [(2, '低优先'), (0, '紧急'), (1, '普通')]
heapq.heapify(tasks)
print(heapq.heappop(tasks))  # (0, '紧急') 先执行
\`\`\`

#### 3. 合并 K 个有序流
\`heapq.merge\` 把多个已排序的迭代器合并成一个有序迭代器（**惰性求值，省内存**）：
\`\`\`python
import heapq
a = [1, 3, 5]
b = [2, 4, 6]
c = [0, 7, 8]
merged = list(heapq.merge(a, b, c))  # [0,1,2,3,4,5,6,7,8]
\`\`\`
应用场景：合并多个日志文件、外排序、K 路归并。

### heapq vs queue.PriorityQueue 对比

| 特性 | heapq | queue.PriorityQueue |
|------|-------|---------------------|
| 类型 | 模块（操作 list） | 类（封装 heapq） |
| 线程安全 | 否 | 是（带锁） |
| 阻塞操作 | 不支持 | 支持 put/get 阻塞 |
| 性能 | 高（无锁开销） | 略低（同步开销） |
| 适用场景 | 单线程算法 | 多线程生产者-消费者 |

> ⚠️ **警告**：\`heapq\` 不是线程安全的！多线程环境请用 \`queue.PriorityQueue\`。

### 时间复杂度分析
- \`heapify\` 看似 n 次 sift，实际复杂度是 **O(n)** 而非 O(n log n)（数学证明：底层节点多但下沉少）
- \`heappush\` / \`heappop\`：O(log n)，因为堆高 log n
- \`nsmallest\` / \`nlargest\`：O(n log k)，k 是返回数量，远快于 sort 的 O(n log n)

### 最佳实践总结
1. **只要 Top K**：用 \`nlargest/nsmallest\`，不要 \`sorted()[:k]\`
2. **大顶堆**：存负数，弹出时再取负
3. **优先队列**：元组加 count 防同优先级比较失败
4. **合并有序流**：用 \`heapq.merge\`，惰性且省内存
5. **多线程**：用 \`queue.PriorityQueue\`，不要直接用 heapq`,
    code: `import heapq
import itertools
import time
import random

print("=== heapq 堆队列与优先队列演示 ===\\n")

print("--- 1. 基础：建堆 / 入堆 / 出堆 ---")
nums = [5, 2, 8, 1, 9, 3, 7]
print(f"原始列表: {nums}")
heapq.heapify(nums)         # 原地转成小顶堆，O(n)
print(f"heapify 后: {nums}  <- 堆顶(索引0)是最小值 {nums[0]}")
heapq.heappush(nums, 0)     # 入堆 O(log n)
print(f"heappush(0) 后: {nums}")
print(f"heappop() 弹出: {heapq.heappop(nums)}")  # 出堆 O(log n)
print(f"弹出后: {nums}")

print("\\n--- 2. nsmallest / nlargest（Top K 问题）---")
data = [random.randint(1, 100) for _ in range(20)]
print(f"随机20个数: {data}")
print(f"最小的3个: {heapq.nsmallest(3, data)}")
print(f"最大的3个: {heapq.nlargest(3, data)}")

print("\\n--- 3. 大顶堆技巧（取负数）---")
# Python heapq 是小顶堆，存负数即可模拟大顶堆
max_heap = []
for x in [5, 2, 8, 1, 9, 3]:
    heapq.heappush(max_heap, -x)
print("按从大到小顺序弹出（大顶堆）：")
while max_heap:
    print(f"  弹出: {-heapq.heappop(max_heap)}")

print("\\n--- 4. 优先队列实现（含同优先级处理）---")
class PriorityQueue:
    """线程不安全的优先队列（单线程用 heapq 即可）"""
    def __init__(self):
        self._heap = []
        self._counter = itertools.count()  # 自增计数器
    def push(self, item, priority=0):
        # (priority, count, item) 三元组
        # priority 控制优先级，count 防止同优先级时比较 item 报错
        heapq.heappush(self._heap, (priority, next(self._counter), item))
    def pop(self):
        return heapq.heappop(self._heap)[2]
    def __len__(self):
        return len(self._heap)

pq = PriorityQueue()
# 模拟任务调度：priority 越小越先执行
pq.push("写周报", priority=2)
pq.push("修复线上bug", priority=0)
pq.push("回复邮件", priority=1)
pq.push("紧急告警", priority=0)  # 与 bug 同优先级
print("任务执行顺序（按优先级，同优先级按插入顺序）：")
while len(pq) > 0:
    print(f"  执行: {pq.pop()}")

print("\\n--- 5. 合并 K 个有序流 ---")
a = [1, 3, 5, 7]
b = [2, 4, 6, 8]
c = [0, 9, 10, 11]
merged = list(heapq.merge(a, b, c))  # 惰性迭代器，省内存
print(f"a={a}")
print(f"b={b}")
print(f"c={c}")
print(f"merge 后: {merged}")

print("\\n--- 6. heapreplace / heappushpop 对比 ---")
h = [1, 3, 5, 7, 9]
heapq.heapify(h)
print(f"堆: {h}")
# heapreplace: 先弹出最小，再压入新值（堆大小不变）
replaced = heapq.heapreplace(h, 4)
print(f"heapreplace(h, 4) 弹出: {replaced}, 堆变成: {h}")
# heappushpop: 先压入新值，再弹出最小
popped = heapq.heappushpop(h, 0)
print(f"heappushpop(h, 0) 弹出: {popped}, 堆变成: {h}")

print("\\n--- 7. 性能对比：Top K 用 nlargest vs sorted ---")
big = [random.randint(1, 10**6) for _ in range(10**6)]
k = 10

t1 = time.time()
for _ in range(5):
    _ = heapq.nlargest(k, big)
t_heap = (time.time() - t1) / 5

t2 = time.time()
for _ in range(5):
    _ = sorted(big, reverse=True)[:k]
t_sort = (time.time() - t2) / 5

print(f"从 {len(big)} 个数中取最大的 {k} 个：")
print(f"  heapq.nlargest: {t_heap:.4f}s (O(n log k))")
print(f"  sorted()[:k]:    {t_sort:.4f}s (O(n log n))")
print(f"  nlargest 快约 {t_sort / t_heap:.1f} 倍")

print("\\n--- 8. 业务场景：动态维护数据流的中位数 ---")
# 用两个堆：大顶堆存较小一半，小顶堆存较大一半
class MedianFinder:
    def __init__(self):
        self.left = []   # 大顶堆（存负数）
        self.right = []  # 小顶堆
    def add(self, num):
        # 先加入 right，再把 right 最小推到 left
        heapq.heappush(self.right, num)
        heapq.heappush(self.left, -heapq.heappop(self.right))
        # 平衡：left 不能比 right 多超过 1
        if len(self.left) > len(self.right):
            heapq.heappush(self.right, -heapq.heappop(self.left))
    def median(self):
        if len(self.left) == len(self.right):
            return (-self.left[0] + self.right[0]) / 2
        return self.right[0]

mf = MedianFinder()
for x in [1, 2, 3, 4, 5, 6, 7]:
    mf.add(x)
    print(f"  加入 {x} 后中位数: {mf.median()}")

print("\\n=== heapq 总结 ===")
print("1. heapq 是小顶堆，操作普通 list")
print("2. 大顶堆存负数即可")
print("3. Top K 用 nlargest/nsmallest，比 sort 快")
print("4. 优先队列加 count 防同优先级比较失败")
print("5. 合并有序流用 heapq.merge，惰性省内存")
print("6. 多线程用 queue.PriorityQueue，单线程用 heapq")
`,
  },
  {
    id: "py6-bisect",
    group: "数据结构进阶",
    icon: "🎯",
    title: "bisect 二分查找",
    content: `## bisect 二分查找（维护有序列表的利器）

### 二分查找原理
二分查找（Binary Search）要求序列**已排序**，每次取中间元素比较，把搜索范围缩小一半：
- 序列长度 n → 比较 1 次后剩 n/2 → log₂n 次后剩 1
- 时间复杂度：**O(log n)**

对比线性查找 \`in\` / \`index()\` 的 O(n)，二分查找在长序列中快成百上千倍。

### bisect 模块函数

| 函数 | 返回值 | 说明 |
|------|--------|------|
| \`bisect_left(a, x)\` | 插入位置索引 | x 应插在哪个位置以保持有序；若 x 已存在，插在**左侧** |
| \`bisect_right(a, x)\` | 插入位置索引 | 同上，但插在**右侧** |
| \`insort_left(a, x)\` | None | 在左侧位置插入 x（原地修改） |
| \`insort_right(a, x)\` | None | 在右侧位置插入 x（原地修改） |
| \`bisect(a, x, lo=0, hi=None)\` | 索引 | \`bisect_right\` 的别名 |

### left vs right 的区别
当 x 已存在于序列中：
\`\`\`python
import bisect
a = [1, 2, 2, 2, 3]
print(bisect.bisect_left(a, 2))   # 1（插在第一个 2 的左边）
print(bisect.bisect_right(a, 2))  # 4（插在最后一个 2 的右边）
\`\`\`

### 业务场景

#### 1. 维护有序列表
频繁插入 + 需要保持有序时，用 \`insort\` 比 \`append + sort\` 高效：
\`\`\`python
import bisect
scores = []
bisect.insort(scores, 85)   # 自动插入到正确位置
bisect.insort(scores, 92)
bisect.insort(scores, 78)
# scores 始终保持升序
\`\`\`
**适用场景**：实时排行榜、增量插入的有序数据。

#### 2. 查找插入位置
判断新元素应该插在哪里，不实际插入：
\`\`\`python
pos = bisect.bisect_left(sorted_list, target)
\`\`\`

#### 3. 分数等级判定
用有序切分点 + bisect 替代多重 if-else：
\`\`\`python
def grade(score):
    breakpoints = [60, 70, 80, 90]
    grades = 'FDCBA'
    i = bisect.bisect(breakpoints, score)
    return grades[i]
\`\`\`
**经典应用**：分数段、年龄分组、税率档位、物流时效分级。

#### 4. 区间查找
查找某值落在哪个区间：
\`\`\`python
import bisect
ranges = [0, 100, 500, 1000, 5000]  # 区间边界
# 0-99, 100-499, 500-999, 1000-4999
idx = bisect.bisect_right(ranges, 250) - 1
\`\`\`

### 时间复杂度分析

| 操作 | bisect | list.index / in |
|------|--------|-----------------|
| 查找位置 | O(log n) | O(n) |
| 插入（含移动元素） | O(n)（查找 O(log n) + 移动 O(n)） | O(n) |
| 适合场景 | 有序列表 + 频繁查询 | 无序列表 |

> 💡 **提示**：\`insort\` 的查找是 O(log n)，但因为 list 是连续数组，**实际插入仍需移动后面所有元素，是 O(n)**。所以 insort 整体仍是 O(n)，比 append+sort 快在「不用每次重新排全部」。

### 与自定义二分查找的对比
\`\`\`python
# 手写二分查找（容易写错：边界、left<=right 还是 <）
def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

# bisect 等价实现（标准库，无 bug）
import bisect
def binary_search_std(arr, target):
    i = bisect.bisect_left(arr, target)
    return i if i < len(arr) and arr[i] == target else -1
\`\`\`

> ⚠️ **警告**：手写二分查找极其容易写错！常见的 bug：
> 1. 循环条件 \`lo <= hi\` 还是 \`lo < hi\`？
> 2. \`hi = mid\` 还是 \`hi = mid - 1\`？
> 3. 整数溢出 \`mid = (lo + hi) // 2\`（Python 不会溢出，其他语言会）
> **优先用标准库 bisect，别自己造轮子。**

### 最佳实践总结
1. **维护有序列表**：用 \`insort\`，比每次 \`sort\` 高效
2. **查找插入位置**：用 \`bisect_left/right\`，O(log n)
3. **分段判定**：用 \`bisect\` + 切分点列表替代 if-else 链
4. **区间归属**：\`bisect_right(boundaries, x) - 1\` 求区间索引
5. **手写二分要谨慎**：能用 bisect 就用 bisect`,
    code: `import bisect
import time
import random

print("=== bisect 二分查找演示 ===\\n")

print("--- 1. bisect_left vs bisect_right ---")
a = [1, 2, 2, 2, 3, 4]
print(f"序列: {a}")
print(f"bisect_left(a, 2)  = {bisect.bisect_left(a, 2)}   <- 插在第一个2的左边")
print(f"bisect_right(a, 2) = {bisect.bisect_right(a, 2)}  <- 插在最后一个2的右边")
print(f"bisect_left(a, 5)  = {bisect.bisect_left(a, 5)}   <- 不存在的元素，返回插入位置")
print(f"bisect_left(a, 0)  = {bisect.bisect_left(a, 0)}   <- 比所有元素都小，返回0")

print("\\n--- 2. insort 维护有序列表 ---")
scores = []
for s in [85, 92, 78, 90, 88, 70, 95]:
    bisect.insort(scores, s)   # 自动插入到正确位置
    print(f"  insort({s}) -> {scores}")
print(f"最终有序列表: {scores}")

print("\\n--- 3. 业务场景：分数等级判定（替代 if-else 链）---")
def grade(score):
    """用 bisect 把分数映射到等级"""
    breakpoints = [60, 70, 80, 90]   # 切分点
    grades = 'FDCBA'                  # F:<60, D:60-69, C:70-79, B:80-89, A:>=90
    i = bisect.bisect(breakpoints, score)
    return grades[i]

test_scores = [45, 65, 75, 85, 95, 60, 90]
for s in test_scores:
    print(f"  分数 {s} -> 等级 {grade(s)}")

print("\\n--- 4. 业务场景：区间归属查找 ---")
# 物流时效分级：0-99元=普通, 100-499=标准, 500-999=快速, 1000+=加急
price_boundaries = [0, 100, 500, 1000]
level_names = ["普通", "标准", "快速", "加急"]

def shipping_level(price):
    # bisect_right 找右边界，减1得到区间索引
    idx = bisect.bisect_right(price_boundaries, price) - 1
    return level_names[idx]

for p in [50, 150, 600, 2000, 100]:
    print(f"  运费 {p} 元 -> {shipping_level(p)}")

print("\\n--- 5. 实现自定义二分查找（对比标准库）---")
def binary_search_std(arr, target):
    """用 bisect 实现二分查找"""
    i = bisect.bisect_left(arr, target)
    if i < len(arr) and arr[i] == target:
        return i
    return -1

sorted_list = [1, 3, 5, 7, 9, 11, 13, 15]
print(f"有序列表: {sorted_list}")
for target in [7, 8, 1, 15, 0]:
    pos = binary_search_std(sorted_list, target)
    print(f"  查找 {target}: 位置 {pos}")

print("\\n--- 6. 性能对比：bisect vs 线性查找 ---")
n = 10**6
big_sorted = list(range(n))
target = n - 1  # 查找最后一个

# bisect: O(log n)
t1 = time.time()
for _ in range(1000):
    _ = bisect.bisect_left(big_sorted, target)
t_bisect = time.time() - t1

# list.index: O(n)
t2 = time.time()
for _ in range(10):  # 太慢只跑10次
    _ = big_sorted.index(target)
t_linear = (time.time() - t2) / 10

print(f"在 {n} 个元素的有序列表中查找：")
print(f"  bisect 1000次耗时: {t_bisect:.4f}s (每次 O(log n))")
print(f"  list.index 1次耗时: {t_linear:.6f}s (每次 O(n))")
print(f"  bisect 单次快约 {t_linear * 1000 / t_bisect:.0f} 倍")

print("\\n--- 7. 业务场景：实时排行榜插入 ---")
# 排行榜：分数越高排名越前，需要频繁插入新分数并保持有序
leaderboard = []
# 初始数据
for s in [100, 90, 85, 70, 60]:
    bisect.insort(leaderboard, s)
print(f"初始排行榜（升序）: {leaderboard}")

# 新选手加入
new_scores = [95, 80, 110, 50]
for s in new_scores:
    bisect.insort(leaderboard, s)
    print(f"  插入 {s}: {leaderboard}")

# 查询第 K 名（分数最高的第 K 个）
k = 3
top_k_score = leaderboard[-k]   # 倒数第K个就是第K名
print(f"第 {k} 名的分数: {top_k_score}")

print("\\n--- 8. 用 bisect 实现 floor / ceil ---")
def floor_ceil(arr, x):
    """查找 x 的下取整和上取整元素"""
    n = len(arr)
    i = bisect.bisect_left(arr, x)
    # floor: 严格小于 x 的最大元素
    floor = arr[i-1] if i > 0 else None
    # ceil: 大于等于 x 的最小元素
    ceil = arr[i] if i < n else None
    return floor, ceil

arr = [1, 3, 5, 7, 9]
for x in [4, 5, 0, 10]:
    f, c = floor_ceil(arr, x)
    print(f"  x={x}: floor={f}, ceil={c}")

print("\\n=== bisect 总结 ===")
print("1. bisect 要求序列已排序，时间复杂度 O(log n)")
print("2. bisect_left/right 区别在于同值元素的插入侧")
print("3. insort 维护有序列表，比 append+sort 高效")
print("4. 分段判定用 bisect 替代 if-else 链，优雅")
print("5. 手写二分容易写错，优先用标准库")
print("6. 区间归属: bisect_right(boundaries, x) - 1")
`,
  },
  {
    id: "py6-array",
    group: "数据结构进阶",
    icon: "📊",
    title: "array 数组模块",
    content: `## array 数组模块（同质类型的高效存储）

### array.array 是什么
\`array\` 模块提供一种**同质类型**的数组结构，类似 C 语言的数组。与 \`list\` 的核心区别：
- **list**：存储任意类型的对象引用（指针），每个元素都是 PyObject*
- **array.array**：存储同一种 C 类型（如 int/float），**连续内存**，无指针开销

### 类型码（Type Code）

| 类型码 | C 类型 | Python 类型 | 最小字节数 |
|--------|--------|-------------|-----------|
| \`'b'\` | signed char | int | 1 |
| \`'B'\` | unsigned char | int | 1 |
| \`'h'\` | signed short | int | 2 |
| \`'H'\` | unsigned short | int | 2 |
| \`'i'\` | signed int | int | 2 |
| \`'I'\` | unsigned int | int | 2 |
| \`'l'\` | signed long | int | 4 |
| \`'f'\` | float | float | 4 |
| \`'d'\` | double | float | 8 |

### 基础用法
\`\`\`python
import array

# 创建整数数组（类型码 'i'）
a = array.array('i', [1, 2, 3, 4, 5])
a.append(6)
a.extend([7, 8])
print(a[0])        # 索引访问 O(1)
print(len(a))

# 创建浮点数组
f = array.array('d', [1.5, 2.5, 3.5])
\`\`\`

### 业务场景

#### 1. 大量数值数据节省内存
存储 100 万个整数：
- \`list\`：每个 int 是 PyObject（约 28 字节）+ 指针 8 字节 = ~36 MB
- \`array('i')\`：每个 int 4 字节 = ~4 MB

**节省约 9 倍内存！** 适合传感器数据、日志数值、统计样本等。

#### 2. 二进制文件读写
\`array\` 支持 \`tofile\` / \`fromfile\`，**直接读写二进制文件，速度极快**：
\`\`\`python
import array
a = array.array('i', range(1000000))
with open('data.bin', 'wb') as f:
    a.tofile(f)

b = array.array('i')
with open('data.bin', 'rb') as f:
    b.fromfile(f, 1000000)
\`\`\`
应用场景：机器学习数据集、图像像素、音频采样、二进制协议。

#### 3. 与 C 库交互
\`array\` 的内存布局和 C 数组一致，可以通过 \`ctypes\` / \`memoryview\` 直接传给 C 函数。

### 与 bytes / bytearray 的关系

| 类型 | 元素类型 | 可变 | 用途 |
|------|---------|------|------|
| \`bytes\` | 0-255 整数 | 否 | 二进制数据（只读） |
| \`bytearray\` | 0-255 整数 | 是 | 可变二进制数据 |
| \`array.array('b')\` | -128~127 | 是 | 等价 bytearray（带符号） |
| \`array.array('B')\` | 0-255 | 是 | 等价 bytearray |
| \`array.array('i'/'f'/'d')\` | int/float | 是 | 多字节类型 |

> 💡 **提示**：\`bytearray\` 本质就是 \`array('B')\` 的特例。\`array\` 通用性更强，支持任意 C 类型。

### 性能对比演示
\`\`\`python
import array
import sys

# 内存对比
lst = list(range(1000000))
arr = array.array('i', range(1000000))
print(sys.getsizeof(lst))   # ~8 MB（仅指针）
print(sys.getsizeof(arr))   # ~4 MB（紧凑数据）
# 加上元素本身：list 总占用 ~36 MB，array 仅 4 MB
\`\`\`

### 避坑指南

> ⚠️ **警告 1**：array 是**同质**的，混入其他类型会报错
> \`array.array('i', [1, 2.5])\` → \`TypeError\`
> 即使是 \`1.0\` 也不行（'i' 类型不接受 float）。

> ⚠️ **警告 2**：array **不支持多维**。要矩阵/张量请用 \`numpy\`。
> array 是一维的，模拟二维要手动计算索引。

> ⚠️ **警告 3**：超出类型范围的值会截断或报错
> \`array.array('b', [200])\` → \`OverflowError\`（'b' 范围 -128~127）

> ⚠️ **警告 4**：\`append\` / \`insert\` 时类型不匹配会抛错
> 不像 list 任意加，array 加错类型当场炸。

### array vs list vs numpy 对比

| 特性 | list | array.array | numpy.ndarray |
|------|------|-------------|---------------|
| 元素类型 | 任意 | 单一 C 类型 | 单一类型 |
| 内存占用 | 高 | 低 | 低 |
| 多维支持 | 嵌套 | 不支持 | 原生支持 |
| 数值运算 | 慢 | 慢（仍是逐元素） | 向量化极快 |
| 依赖 | 内置 | 内置 | 第三方 |
| 二进制读写 | 不便 | 原生支持 | 支持 |
| 适用场景 | 通用 | 大量同质数值 + 二进制 | 科学计算 |

### 最佳实践总结
1. **大量同质数值**：用 array 比 list 省 5-10 倍内存
2. **二进制文件 I/O**：用 \`tofile/fromfile\`，比 pickle 快
3. **多维数据**：用 numpy，别用 array 嵌套
4. **混合类型**：用 list，array 不允许
5. **数值计算密集**：用 numpy，array 不支持向量化`,
    code: `import array
import sys
import time
import os

print("=== array 数组模块演示 ===\\n")

print("--- 1. 创建与基本操作 ---")
# 类型码 'i' = signed int (4字节)
a = array.array('i', [1, 2, 3, 4, 5])
print(f"整数数组 a: {a}")
print(f"类型码: {a.typecode}")
print(f"元素个数: {len(a)}")
print(f"索引访问 a[0]={a[0]}, a[-1]={a[-1]}")

a.append(6)         # 尾部添加
a.extend([7, 8])    # 批量添加
print(f"append(6)+extend([7,8]): {a}")
print(f"pop() 弹出: {a.pop()}")

# 浮点数组 'd' = double (8字节)
f = array.array('d', [1.5, 2.5, 3.5])
print(f"浮点数组 f: {f}")

print("\\n--- 2. 内存占用对比（list vs array）---")
n = 1000000
lst = list(range(n))
arr = array.array('i', range(n))

# getsizeof 只测容器本身（list 只算指针，array 算紧凑数据）
print(f"存储 {n} 个整数：")
print(f"  list 容器本身: {sys.getsizeof(lst) / 1024 / 1024:.2f} MB (仅指针)")
print(f"  array 容器:    {sys.getsizeof(arr) / 1024 / 1024:.2f} MB (含数据)")
# list 还要算每个 int 对象，array 已经包含数据
# 实际 list 总占用 ≈ 8MB(指针) + 28MB(int对象) = 36MB
# array 总占用 ≈ 4MB
print(f"  list 实际总占用约 36MB（指针+int对象），array 仅 4MB")
print(f"  array 节省约 9 倍内存！")

print("\\n--- 3. 类型限制（避坑演示）---")
print("array 是同质的，类型必须匹配：")
try:
    bad = array.array('i', [1, 2, 3.5])  # 'i' 不接受 float
except TypeError as e:
    print(f"  array('i', [1,2,3.5]) 报错: {e}")

try:
    bad = array.array('b', [200])  # 'b' 范围 -128~127
except OverflowError as e:
    print(f"  array('b', [200]) 报错: {e}")

# 但是 'i' 数组添加 float 会自动截断（隐式转换）
a = array.array('i', [1, 2, 3])
try:
    a.append(4.9)  # 浮点数会被截断为整数
    print(f"  append(4.9) 后: {a}  <- 浮点被截断为 4")
except TypeError as e:
    print(f"  append(4.9) 报错: {e}")

print("\\n--- 4. 二进制文件读写（业务场景）---")
# array 的 tofile/fromfile 直接读写二进制，速度极快
filename = '/tmp/array_demo.bin'
data = array.array('i', range(100000))

# 写入二进制文件
with open(filename, 'wb') as fp:
    data.tofile(fp)
file_size = os.path.getsize(filename)
print(f"写入 {len(data)} 个 int 到二进制文件")
print(f"  文件大小: {file_size} 字节 = {len(data)} * 4字节/int")

# 从二进制文件读回
loaded = array.array('i')
with open(filename, 'rb') as fp:
    loaded.fromfile(fp, len(data))
print(f"  读回 {len(loaded)} 个元素，前5个: {loaded[:5].tolist()}")
print(f"  数据一致: {data == loaded}")

# 对比 pickle 写入
import pickle
pickle_file = '/tmp/array_pickle.pkl'
t1 = time.time()
with open(pickle_file, 'wb') as fp:
    pickle.dump(list(data), fp)
pickle_size = os.path.getsize(pickle_file)
print(f"  pickle 写同样数据: {pickle_size} 字节 (约 {pickle_size / file_size:.1f} 倍)")

# 清理
os.remove(filename)
os.remove(pickle_file)

print("\\n--- 5. bytes / bytearray 与 array 的关系 ---")
# bytearray 等价于 array('B')
ba = bytearray([65, 66, 67, 97, 98, 99])
print(f"bytearray: {ba}")
print(f"  转字符串: {ba.decode('ascii')}")  # 'ABCabc'

# array('B') 也是 0-255
arr_b = array.array('B', [65, 66, 67])
print(f"array('B'): {arr_b}")
print(f"  转字符串: {bytes(arr_b).decode('ascii')}")

print("\\n--- 6. 切片与遍历 ---")
a = array.array('i', [10, 20, 30, 40, 50])
print(f"数组: {a}")
print(f"切片 a[1:4]: {a[1:4]}")
print(f"反转 a[::-1]: {a[::-1]}")
print(f"遍历:", end=" ")
for x in a:
    print(x, end=" ")
print()

# array 支持 + 拼接和 * 重复
b = a + array.array('i', [60, 70])
print(f"a + [60,70]: {b}")

print("\\n--- 7. fromlist / tolist 转换 ---")
# 从 list 转 array
src_list = [100, 200, 300, 400]
arr = array.array('i')
arr.fromlist(src_list)
print(f"fromlist({src_list}): {arr}")
# 从 array 转 list
back = arr.tolist()
print(f"tolist(): {back}, 类型: {type(back).__name__}")

print("\\n--- 8. 业务场景：模拟传感器数据采集 ---")
# 模拟温度传感器：每秒采一个 float，存储 1 小时数据
import random
temperatures = array.array('d')
for _ in range(3600):  # 1小时 = 3600 秒
    temp = 25.0 + random.gauss(0, 2)  # 均值25，标准差2
    temperatures.append(temp)

print(f"采集 1 小时温度数据（3600 个采样）:")
print(f"  内存占用: {sys.getsizeof(temperatures) / 1024:.1f} KB")
print(f"  如果用 list: 约 {sys.getsizeof(list(temperatures)) / 1024 + 3600 * 24 / 1024:.1f} KB")
print(f"  最高温度: {max(temperatures):.2f}°C")
print(f"  最低温度: {min(temperatures):.2f}°C")
print(f"  平均温度: {sum(temperatures) / len(temperatures):.2f}°C")

# 持久化到二进制文件（可重新加载分析）
filename = '/tmp/temperature.bin'
with open(filename, 'wb') as fp:
    temperatures.tofile(fp)
print(f"  已保存到 {filename}, 大小 {os.path.getsize(filename)} 字节")
os.remove(filename)

print("\\n=== array 总结 ===")
print("1. array 是同质类型数组，内存紧凑，比 list 省内存")
print("2. 类型码决定元素类型：'i'整数 'f'/'d'浮点 'b'字节")
print("3. tofile/fromfile 高速二进制 I/O")
print("4. 不支持多维，需要矩阵用 numpy")
print("5. 类型严格，混入其他类型会报错")
print("6. 大量同质数值 + 节省内存场景首选")
`,
  },
  {
    id: "py6-list-performance",
    group: "数据结构进阶",
    icon: "⚡",
    title: "列表性能分析与选择",
    content: `## 列表性能分析与选择

### 列表底层实现
Python 的 \`list\` 本质是一个**动态数组**，存储的是 PyObject 指针（不是对象本身）：
- **连续内存**存储指针数组
- 每个指针 8 字节（64 位系统）
- 实际对象分散在堆上

这种设计让 list **随机访问 O(1)**，但插入/删除中间元素需要移动后续指针。

### 列表各操作时间复杂度

| 操作 | 时间复杂度 | 说明 |
|------|-----------|------|
| \`lst[i]\` 索引访问 | O(1) | 直接算地址偏移 |
| \`lst.append(x)\` | O(1) 均摊 | 末尾添加，偶尔扩容 |
| \`lst.pop()\` | O(1) | 末尾弹出 |
| \`lst.insert(0, x)\` | O(n) | 头部插入，所有元素后移 |
| \`lst.pop(0)\` | O(n) | 头部弹出，所有元素前移 |
| \`lst.insert(i, x)\` | O(n) | 中间插入 |
| \`del lst[i]\` | O(n) | 中间删除 |
| \`lst.remove(x)\` | O(n) | 查找+删除 |
| \`x in lst\` | O(n) | 线性查找 |
| \`lst.index(x)\` | O(n) | 线性查找 |
| \`lst.sort()\` | O(n log n) | Timsort |
| \`len(lst)\` | O(1) | 维护长度属性 |

### 为什么 insert(0, x) 慢？
list 是连续数组，头部插入要把后面所有元素**整体后移一位**：
- 100 万元素插入头部 → 移动 100 万次指针
- 时间复杂度 O(n)

如果频繁头部插入，请用 \`collections.deque\`，它是 O(1)。

### 列表推导 vs for 循环 vs map 性能
\`\`\`python
# 1. 列表推导（最快，Python 字节码专门优化）
squares = [x*x for x in range(1000)]

# 2. for 循环（中等，有 append 方法查找开销）
squares = []
for x in range(1000):
    squares.append(x*x)

# 3. map 函数（快，但返回迭代器，需要 list 转换）
squares = list(map(lambda x: x*x, range(1000)))
\`\`\`

实测对比（生成 100 万个平方数）：
- 列表推导：~80 ms
- for 循环：~120 ms
- map + lambda：~140 ms
- map + 内置函数：~60 ms（最快，无 lambda 开销）

> 💡 **提示**：列表推导不仅快，还更 Pythonic，能用就用。但**超过 2 层嵌套**的可读性差，建议改用 for 循环。

### 内存布局：连续数组 + 指针数组
\`\`\`
list 容器:
+--------+--------+--------+--------+
| ptr0   | ptr1   | ptr2   | ptr3   |   <- 指针数组（连续内存）
+--------+--------+--------+--------+
   |       |       |       |
   v       v       v       v
[obj 0] [obj 1] [obj 2] [obj 3]    <- 实际对象（堆上分散）
\`\`\`

### 扩容机制
list 预分配多余空间，append 时通常无需扩容：
- 扩容策略：\`new_size = old_size + (old_size >> 3) + 6\`（约 1.125 倍 + 偏移）
- 均摊 O(1)：扩容虽是 O(n)，但摊到 n 次 append 上仍是 O(1)

### 何时该用 deque / array / numpy 替代 list

| 场景 | 推荐数据结构 | 原因 |
|------|------------|------|
| 频繁头部插入/删除 | \`deque\` | O(1) vs list O(n) |
| 大量同质数值 | \`array.array\` | 省 5-10 倍内存 |
| 多维数值计算 | \`numpy.ndarray\` | 向量化运算 |
| 频繁成员判断 | \`set\` | O(1) vs list O(n) |
| 键值映射 | \`dict\` | O(1) 查找 |
| 有序 + 频繁插入 | \`bisect\` + list | O(log n) 查找 |
| 不可变序列 | \`tuple\` | 更省内存，可哈希 |

### 性能测试代码思路
\`\`\`python
import time

def benchmark(func, n=100000):
    start = time.time()
    func(n)
    return time.time() - start

# 头部插入对比
def list_insert_head(n):
    lst = []
    for i in range(n):
        lst.insert(0, i)   # O(n) 每次

def deque_appendleft(n):
    from collections import deque
    dq = deque()
    for i in range(n):
        dq.appendleft(i)   # O(1) 每次
\`\`\`

### 避坑指南

> ⚠️ **警告 1**：\`lst1 + lst2\` 创建新列表，O(n+m)
> 大量拼接用 \`lst.extend(other)\` 或 \`itertools.chain\`，避免反复创建新对象。

> ⚠️ **警告 2**：\`[[0]*n]*n\` 是坑！所有行共享同一列表
> 正确写法：\`[[0]*n for _ in range(n)]\`

> ⚠️ **警告 3**：遍历列表时增删元素会错乱
> 遍历副本 \`for x in lst[:]\` 或倒序遍历。

> ⚠️ **警告 4**：\`is\` 比较的是身份，\`==\` 比较的是值
> 小整数缓存 \`a is b\` 可能 True，但不要依赖。

### 最佳实践总结
1. **随机访问 / 末尾增删**：list 性能足够
2. **头部增删频繁**：用 deque
3. **大量数值**：用 array 或 numpy
4. **生成列表**：用列表推导，可读性 + 性能
5. **大量拼接**：用 extend，不要 \`+\`
6. **成员查找频繁**：转 set 再查
7. **预先知道大小**：\`[0]*n\` 比 append 快（避免扩容）`,
    code: `import time
from collections import deque

print("=== 列表性能分析与选择 演示 ===\\n")

print("--- 1. 列表推导 vs for 循环 vs map ---")
n = 1000000

# 列表推导
t1 = time.time()
squares_lc = [x * x for x in range(n)]
t_lc = time.time() - t1

# for 循环
t2 = time.time()
squares_for = []
for x in range(n):
    squares_for.append(x * x)
t_for = time.time() - t2

# map + lambda
t3 = time.time()
squares_map = list(map(lambda x: x * x, range(n)))
t_map = time.time() - t3

# map + 内置函数（无 lambda 开销）
t4 = time.time()
squares_map_builtin = list(map(abs, range(-n, 0)))
t_map_builtin = time.time() - t4

print(f"生成 {n} 个平方数：")
print(f"  列表推导 [x*x for ...]:  {t_lc:.4f}s")
print(f"  for 循环 + append:      {t_for:.4f}s")
print(f"  map + lambda:           {t_map:.4f}s")
print(f"  map + 内置函数 abs:      {t_map_builtin:.4f}s (含 2n 次循环仅供参考)")
print(f"  数据一致: {squares_lc == squares_for == squares_map}")

print("\\n--- 2. insert(0) vs deque.appendleft（头部插入）---")
n = 100000

# list.insert(0, x) 是 O(n)
t1 = time.time()
lst = []
for i in range(n):
    lst.insert(0, i)
t_list = time.time() - t1

# deque.appendleft 是 O(1)
t2 = time.time()
dq = deque()
for i in range(n):
    dq.appendleft(i)
t_deque = time.time() - t2

print(f"头部插入 {n} 次：")
print(f"  list.insert(0, x): {t_list:.4f}s (每次 O(n))")
print(f"  deque.appendleft:  {t_deque:.4f}s (每次 O(1))")
print(f"  deque 快约 {t_list / t_deque:.0f} 倍")

print("\\n--- 3. pop(0) vs deque.popleft（头部弹出）---")
n = 100000

lst = list(range(n))
t1 = time.time()
while lst:
    lst.pop(0)
t_list_pop = time.time() - t1

dq = deque(range(n))
t2 = time.time()
while dq:
    dq.popleft()
t_deque_pop = time.time() - t2

print(f"头部弹出 {n} 次：")
print(f"  list.pop(0):      {t_list_pop:.4f}s")
print(f"  deque.popleft:    {t_deque_pop:.4f}s")
print(f"  deque 快约 {t_list_pop / t_deque_pop:.0f} 倍")

print("\\n--- 4. 成员查找：list vs set ---")
n = 1000000
big_list = list(range(n))
big_set = set(big_list)

# 在末尾查找（最坏情况 O(n)）
target = n - 1

t1 = time.time()
for _ in range(100):
    _ = target in big_list
t_in_list = time.time() - t1

t2 = time.time()
for _ in range(10000):
    _ = target in big_set
t_in_set = time.time() - t2

print(f"在 {n} 元素中查找末尾元素：")
print(f"  list 'in' 100次:   {t_in_list:.4f}s (每次 O(n))")
print(f"  set  'in' 10000次: {t_in_set:.4f}s (每次 O(1))")
print(f"  set 单次查找快约 {(t_in_list / 100) / (t_in_set / 10000):.0f} 倍")

print("\\n--- 5. 避坑演示：[[0]*n]*n 共享引用 ---")
print("错误写法 [[0]*3]*3: 所有行共享同一个列表")
bad = [[0] * 3] * 3
bad[0][0] = 99
print(f"  bad[0][0]=99 后: {bad}  <- 所有行第0列都变了！")

print("正确写法 [[0]*3 for _ in range(3)]: 每行独立")
good = [[0] * 3 for _ in range(3)]
good[0][0] = 99
print(f"  good[0][0]=99 后: {good}  <- 只有第一行变了")

print("\\n--- 6. 避坑：遍历列表时删除元素 ---")
print("错误：正向遍历 + remove 会跳过元素")
lst = [1, 2, 2, 3, 4, 2]
print(f"  原: {lst}")
# 想删除所有 2，但正向遍历会跳过相邻的 2
lst_wrong = [1, 2, 2, 3, 4, 2]
for x in lst_wrong[:]:  # 遍历副本
    if x == 2:
        lst_wrong.remove(x)
print(f"  正向遍历副本删除 2: {lst_wrong}  <- 正确")

# 错误写法：直接遍历原列表
lst_bad = [1, 2, 2, 3, 4, 2]
for x in lst_bad:  # 直接遍历原列表，会错乱
    if x == 2:
        lst_bad.remove(x)
print(f"  直接遍历删除 2: {lst_bad}  <- 错误！漏删")

print("正确：列表推导过滤")
lst = [1, 2, 2, 3, 4, 2]
filtered = [x for x in lst if x != 2]
print(f"  [x for x in lst if x!=2]: {filtered}")

print("\\n--- 7. append 预分配 vs 逐个 append ---")
n = 1000000

# 逐个 append（可能多次扩容）
t1 = time.time()
lst1 = []
for i in range(n):
    lst1.append(i)
t_append = time.time() - t1

# 预分配 + 赋值（避免扩容）
t2 = time.time()
lst2 = [0] * n
for i in range(n):
    lst2[i] = i
t_prealloc = time.time() - t2

# 列表推导（最快）
t3 = time.time()
lst3 = [i for i in range(n)]
t_lc = time.time() - t3

print(f"生成 {n} 个元素的列表：")
print(f"  逐个 append:           {t_append:.4f}s")
print(f"  预分配 [0]*n + 赋值:    {t_prealloc:.4f}s")
print(f"  列表推导 [i for ...]:   {t_lc:.4f}s (最快)")

print("\\n--- 8. 列表拼接：+ vs extend vs chain ---")
import itertools

parts = [list(range(1000)) for _ in range(100)]

# + 创建新列表
t1 = time.time()
result = []
for p in parts:
    result = result + p
t_plus = time.time() - t1

# extend 原地扩展
t2 = time.time()
result = []
for p in parts:
    result.extend(p)
t_extend = time.time() - t2

# itertools.chain 惰性
t3 = time.time()
result = list(itertools.chain.from_iterable(parts))
t_chain = time.time() - t3

print(f"拼接 {len(parts)} 个长度1000的列表：")
print(f"  result = result + p: {t_plus:.4f}s (每次创建新列表)")
print(f"  result.extend(p):    {t_extend:.4f}s (原地扩展)")
print(f"  chain.from_iterable: {t_chain:.4f}s (惰性)")
print(f"  extend 比 + 快约 {t_plus / t_extend:.0f} 倍")

print("\\n=== 列表性能总结 ===")
print("1. 索引访问 O(1)，末尾增删 O(1)，中间/头部 O(n)")
print("2. 头部频繁增删用 deque，不要 insert(0)/pop(0)")
print("3. 列表推导比 for + append 快 30-50%")
print("4. 大量成员查找先转 set")
print("5. 大量拼接用 extend，不要 +")
print("6. 大量同质数值用 array/numpy")
print("7. [[0]*n]*n 是坑，要用推导式创建独立行")
print("8. 遍历时删除元素要遍历副本或用推导式过滤")
`,
  },
  {
    id: "py6-dict-internals",
    group: "数据结构进阶",
    icon: "🔓",
    title: "字典实现原理（哈希表）",
    content: `## 字典实现原理（哈希表）

### 哈希表基本原理
Python \`dict\` 底层是**哈希表**（Hash Table），通过哈希函数把键映射到存储位置：
1. **hash(key)**：计算键的哈希值（一个整数）
2. **取模定位**：\`hash(key) % table_size\` 得到桶索引
3. **存储**：键值对存入对应桶

理想情况下查找/插入/删除都是 **O(1)**！

### 哈希表结构（Python 3.6+）
Python 3.6 起采用**紧凑字典**（Compact Dict），分两部分存储：

\`\`\`
┌─────────────────────────┐
│  indices 数组 (稀疏)     │  <- 只存条目索引
├─────────────────────────┤
│ 0 │ 1 │ - │ 2 │ - │ - │  │
├─────────────────────────┤
│  entries 数组 (紧凑)     │  <- 实际存 hash/key/value
├─────────────────────────┤
│ [hash0, key0, value0]   │
│ [hash1, key1, value1]   │
│ [hash2, key2, value2]   │
└─────────────────────────┘
\`\`\`

优点：内存占用减少 20-25%，且**保留插入顺序**。

### Python 3.7+ 字典有序保证
从 Python 3.7 起，\`dict\` **保证按插入顺序遍历**（3.6 是实现细节，3.7 是语言规范）：
\`\`\`python
d = {'b': 2, 'a': 1, 'c': 3}
d['d'] = 4
print(list(d))  # ['b', 'a', 'c', 'd']  按插入顺序
\`\`\`

### 哈希冲突解决：开放寻址法
两个不同键可能哈希到同一个桶（冲突）。Python 用**开放寻址法**（Open Addressing）：
- 冲突时按探测序列找下一个空桶
- Python 5.4+ 使用斐波那契哈希 + 朴素线性探测
- 删除时用"dummy"标记占位（不能直接清空，否则查找链断裂）

探测过程：
\`\`\`python
def lookup(key):
    h = hash(key)
    idx = h % table_size
    while table[idx] is not EMPTY:
        if table[idx].hash == h and table[idx].key == key:
            return table[idx].value
        idx = (idx + 1) % table_size  # 线性探测
    raise KeyError
\`\`\`

### 扩容与 rehash
当条目数 > 容量 * 2/3 时触发扩容：
- 新容量 ≈ 旧容量的 2-4 倍
- 所有条目重新计算桶位置（rehash）
- 均摊 O(1) 仍成立

### 为什么字典键必须可哈希？
键必须满足：
1. 实现 \`__hash__()\` 返回稳定整数
2. 实现 \`__eq__()\` 判断相等
3. **哈希值生命周期内不变**（不可变）

| 类型 | 可哈希？ | 说明 |
|------|---------|------|
| \`int\`, \`float\`, \`str\`, \`tuple\` | ✅ | 不可变，可哈希 |
| \`frozenset\` | ✅ | 不可变集合 |
| \`list\`, \`dict\`, \`set\` | ❌ | 可变，不可哈希 |
| 自定义类实例 | ✅ 默认 | 默认按 id 哈希 |

\`\`\`python
d = {}
d[[1, 2]] = 'x'  # TypeError: unhashable type: 'list'
d[(1, 2)] = 'x'  # OK，tuple 可哈希
\`\`\`

### 自定义对象的 __hash__ 和 __eq__
默认情况下，自定义类按 \`id()\` 哈希，按 \`is\` 比较。若想用作字典键并按值相等：
\`\`\`python
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __hash__(self):
        return hash((self.x, self.y))
    def __eq__(self, other):
        return (self.x, self.y) == (other.x, other.y)
\`\`\`

> ⚠️ **警告**：实现了 \`__eq__\` 的类若没实现 \`__hash__\`，会变成**不可哈希**（Python 显式置为 None）。**两者必须同时实现**。

### 时间复杂度

| 操作 | 平均 | 最坏（大量冲突） |
|------|------|----------------|
| \`d[key]\` 查找 | O(1) | O(n) |
| \`d[key] = v\` 插入 | O(1) 均摊 | O(n) |
| \`del d[key]\` | O(1) | O(n) |
| \`key in d\` | O(1) | O(n) |
| \`len(d)\` | O(1) | O(1) |
| 遍历 \`for k in d\` | O(n) | O(n) |

### dict vs OrderedDict vs set 内存对比

| 类型 | 顺序保证 | 内存占用 | 适用 |
|------|---------|---------|------|
| \`dict\` | 3.7+ 插入顺序 | 中 | 通用键值映射 |
| \`OrderedDict\` | 插入顺序（早期） | 较高 | 老版本兼容 / 需要 move_to_end |
| \`set\` | 无序 | 中 | 仅键，去重/成员判断 |

> 💡 **提示**：3.7+ 大多数场景用 \`dict\` 即可。\`OrderedDict\` 仅在需要 \`move_to_end\` / \`popitem(last=False)\` 等 LRU 特性时使用。

### 避坑指南

> ⚠️ **警告 1**：遍历字典时不能修改大小
> \`for k in d: del d[k]\` 会抛 \`RuntimeError\`。先收集要删的键再删，或用 \`{k:v for k,v in d.items() if ...}\`。

> ⚠️ **警告 2**：\`dict.get(key)\` 默认返回 None，不要和 \`None\` 值混淆
> 用 \`d.setdefault(key, default)\` 或 \`collections.defaultdict\`。

> ⚠️ **警告 3**：可变对象作键"看似有效实则危险"
> 如果对象哈希后被修改，会找不到。键必须是不可变的。

### 最佳实践总结
1. **键必须可哈希**：用 tuple 替代 list 作复合键
2. **自定义类作键**：同时实现 \`__hash__\` 和 \`__eq__\`
3. **3.7+ 顺序保证**：可用 dict 实现 LRU、配置项有序存储
4. **避免遍历中修改**：用字典推导或先收集键
5. **缺键处理**：\`get\` / \`setdefault\` / \`defaultdict\` 三选一
6. **海量键值**：内存敏感场景考虑 \`dict\` 紧凑表示的优化`,
    code: `import sys
from collections import OrderedDict, defaultdict

print("=== 字典实现原理 哈希表 演示 ===\\n")

print("--- 1. 哈希函数与可哈希性 ---")
# 可哈希类型：int, str, tuple, frozenset, 自定义类实例
print(f"hash(42)       = {hash(42)}")
print(f"hash('hello')  = {hash('hello')}")
print(f"hash((1, 2))   = {hash((1, 2))}")

# 不可哈希类型：list, dict, set
print("\\n不可哈希类型演示：")
for obj in [[1, 2], {'a': 1}, {1, 2}]:
    try:
        hash(obj)
    except TypeError as e:
        print(f"  hash({obj!r}) 报错: {e}")

# 用 list 作键会报错
try:
    d = {}
    d[[1, 2]] = 'x'
except TypeError as e:
    print(f"  d[[1,2]] = 'x' 报错: {e}")

# 用 tuple 作键 OK
d = {(1, 2): '坐标A', (3, 4): '坐标B'}
print(f"  d[(1,2)] = {d[(1, 2)]}  <- tuple 可以作键")

print("\\n--- 2. Python 3.7+ 字典有序保证 ---")
d = {}
d['banana'] = 2
d['apple'] = 5
d['cherry'] = 8
print(f"按插入顺序遍历: {list(d.keys())}")
print(f"items: {list(d.items())}")

# 演示：3.6+ 是实现细节，3.7+ 是语言保证
import sys as _sys
print(f"Python 版本: {_sys.version_info[:2]}  <- 3.7+ 保证字典有序")

print("\\n--- 3. 自定义对象作字典键 ---")
class Point:
    """同时实现 __hash__ 和 __eq__ 才能正确作键"""
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __hash__(self):
        # 基于元组哈希，保证相同坐标哈希相同
        return hash((self.x, self.y))
    def __eq__(self, other):
        # 值相等判断（否则默认按 id 比较）
        return (self.x, self.y) == (other.x, other.y)
    def __repr__(self):
        return f"Point({self.x},{self.y})"

cache = {}
p1 = Point(1, 2)
p2 = Point(1, 2)  # 不同对象，但值相同
cache[p1] = "计算结果A"
print(f"cache[p1] = '计算结果A'")
print(f"cache[p2] = {cache[p2]!r}  <- p2 值相同，能找到 p1 存的结果")
print(f"p1 is p2: {p1 is p2}, p1 == p2: {p1 == p2}")
print(f"hash(p1) == hash(p2): {hash(p1) == hash(p2)}")

print("\\n--- 4. 仅实现 __eq__ 会让对象不可哈希 ---")
class BadPoint:
    """只实现 __eq__ 不实现 __hash__，Python 会自动设为不可哈希"""
    def __init__(self, x):
        self.x = x
    def __eq__(self, other):
        return self.x == other.x

try:
    hash(BadPoint(1))
except TypeError as e:
    print(f"  只实现 __eq__ 的实例不可哈希: {e}")
print("  -> 实现 __eq__ 时必须同时实现 __hash__")

print("\\n--- 5. 字典 vs OrderedDict 内存对比 ---")
n = 100000
d = {i: i for i in range(n)}
od = OrderedDict((i, i) for i in range(n))

print(f"存储 {n} 个键值对：")
print(f"  dict 容器占用:        {sys.getsizeof(d) / 1024:.1f} KB")
print(f"  OrderedDict 容器占用: {sys.getsizeof(od) / 1024:.1f} KB")
print(f"  OrderedDict 多用约 {sys.getsizeof(od) / sys.getsizeof(d):.2f} 倍")

print("\\n--- 6. defaultdict 自动初始化缺失键 ---")
# 统计词频
words = ['apple', 'banana', 'apple', 'cherry', 'banana', 'apple']
freq = defaultdict(int)  # 缺失键默认返回 int() = 0
for w in words:
    freq[w] += 1   # 缺失键自动初始化为 0
print(f"词频统计: {dict(freq)}")

# 分组：按首字母分组
words = ['apple', 'ant', 'banana', 'cat', 'cherry', 'dog']
groups = defaultdict(list)
for w in words:
    groups[w[0]].append(w)
print(f"按首字母分组: {dict(groups)}")

print("\\n--- 7. 避坑：遍历字典时修改大小 ---")
d = {'a': 1, 'b': 2, 'c': 3, 'd': 4}
print(f"原字典: {d}")

# 错误：遍历时删除会 RuntimeError
print("错误：直接遍历删除会报错")
try:
    for k in d:
        if d[k] % 2 == 0:
            del d[k]
except RuntimeError as e:
    print(f"  RuntimeError: {e}")

# 正确1：遍历副本 list(d)
d = {'a': 1, 'b': 2, 'c': 3, 'd': 4}
for k in list(d.keys()):
    if d[k] % 2 == 0:
        del d[k]
print(f"  删除偶数值 (list副本): {d}")

# 正确2：字典推导式过滤
d = {'a': 1, 'b': 2, 'c': 3, 'd': 4}
d = {k: v for k, v in d.items() if v % 2 == 1}
print(f"  字典推导式保留奇数值: {d}")

print("\\n--- 8. setdefault vs get vs defaultdict ---")
# get: 不修改字典，返回默认值
d = {'a': 1}
v = d.get('b', 0)   # 'b' 不存在返回 0，但 d 不变
print(f"d.get('b', 0) = {v}, d = {d}")

# setdefault: 不存在则插入默认值，返回当前值
v = d.setdefault('b', 0)  # 'b' 不存在则 d['b']=0，返回 0
print(f"d.setdefault('b', 0) = {v}, d = {d}  <- 已插入 'b'")

# defaultdict: 类级别默认值
dd = defaultdict(list)
dd['users'].append('Alice')  # 自动初始化 'users' 为 []
print(f"defaultdict(list) 添加后: {dict(dd)}")

print("\\n--- 9. 业务场景：LRU 缓存（用 OrderedDict 实现）---")
class LRUCache:
    """OrderedDict.move_to_end 实现 LRU"""
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = OrderedDict()
    def get(self, key):
        if key not in self.cache:
            return -1
        # 命中：移到末尾（最近使用）
        self.cache.move_to_end(key)
        return self.cache[key]
    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            # 弹出最久未使用（头部）
            self.cache.popitem(last=False)

cache = LRUCache(2)
cache.put(1, 'A')
cache.put(2, 'B')
print(f"put(1,'A'), put(2,'B'): {dict(cache.cache)}")
print(f"get(1) = {cache.get(1)}  <- 命中1，1变成最近使用")
print(f"  当前顺序: {list(cache.cache.keys())}")
cache.put(3, 'C')   # 容量满，淘汰最久未使用的 2
print(f"put(3,'C') 后: {dict(cache.cache)}  <- 淘汰了 2")
print(f"get(2) = {cache.get(2)}  <- 已被淘汰")

print("\\n=== 字典原理总结 ===")
print("1. dict 底层是哈希表，平均 O(1) 查找")
print("2. Python 3.6+ 紧凑字典省内存，3.7+ 保证插入顺序")
print("3. 键必须可哈希（不可变）：tuple 可，list 不可")
print("4. 自定义类作键要同时实现 __hash__ 和 __eq__")
print("5. 遍历时不能修改字典大小，用副本或推导式")
print("6. defaultdict/setdefault 优雅处理缺键")
print("7. OrderedDict 适合 LRU 场景（move_to_end）")
`,
  },
  {
    id: "py6-set-internals",
    group: "数据结构进阶",
    icon: "🌀",
    title: "集合实现原理与应用",
    content: `## 集合实现原理与应用

### 集合是什么
\`set\` 是一种**无序、不重复、可变**的容器，底层和 \`dict\` 一样是**哈希表**，只是只存键不存值：
- 元素必须**可哈希**（不可变）
- 查找/插入/删除平均 **O(1)**
- 不保留插入顺序（虽然 3.7+ 实现上元素遍历顺序较稳定，但仍**不保证**）

### 集合的哈希表实现
set 用一个稀疏哈希表存储元素本身（而非键值对）：
\`\`\`
table[空] table[空] table['apple'] table[空] table['banana'] ...
\`\`\`
- 添加元素：\`hash(elt) % size\` 找桶，冲突则开放寻址
- 查找元素：同上，O(1) 平均
- 这就是为什么 \`x in set\` 比 \`x in list\` 快得多

### 集合运算及时间复杂度

| 运算 | 操作符 | 方法 | 时间复杂度 |
|------|--------|------|-----------|
| 成员判断 | \`x in s\` | \`__contains__\` | O(1) 平均 |
| 交集 | \`s & t\` | \`s.intersection(t)\` | O(min(len(s), len(t))) |
| 并集 \| \`s | t\` | \`s.union(t)\` | O(len(s) + len(t)) |
| 差集 | \`s - t\` | \`s.difference(t)\` | O(len(s)) |
| 对称差 | \`s ^ t\` | \`s.symmetric_difference(t)\` | O(len(s) + len(t)) |
| 子集判断 | \`s <= t\` | \`s.issubset(t)\` | O(len(s)) |
| 超集判断 | \`s >= t\` | \`s.issuperset(t)\` | O(len(t)) |

> 💡 **提示**：求交集时，**遍历较小的集合**去判断是否在较大的集合中，所以复杂度是 \`O(min(m, n))\` 而不是 O(m+n)。

### 基础用法
\`\`\`python
# 创建
s = {1, 2, 3}
s = set([1, 2, 2, 3])   # 自动去重: {1, 2, 3}
s.add(4)
s.discard(10)   # 不存在不报错（remove 会报错）

# 运算
a = {1, 2, 3}
b = {2, 3, 4}
a & b   # {2, 3}  交集
a | b   # {1, 2, 3, 4}  并集
a - b   # {1}  差集
a ^ b   # {1, 4}  对称差
\`\`\`

### frozenset 不可变集合
\`frozenset\` 是 set 的不可变版本：
- 创建后不能添加/删除元素
- **可哈希**，可以作字典键、其他集合的元素
\`\`\`python
fs = frozenset([1, 2, 3])
d = {fs: 'value'}   # OK，frozenset 可哈希
s = {fs}            # OK，可以放进另一个 set
\`\`\`

应用：缓存键、配置项不可变集合、防止意外修改。

### 业务场景

#### 1. 去重
\`\`\`python
data = [1, 2, 2, 3, 3, 3, 4]
unique = list(set(data))      # 顺序丢失
unique = list(dict.fromkeys(data))  # 3.7+ 保留顺序去重
\`\`\`

#### 2. 成员判断（高频！）
\`\`\`python
VALID_USERS = {'alice', 'bob', 'charlie'}  # 配置成 set
if username in VALID_USERS:   # O(1)
    ...
\`\`\`
**对比**：100 万用户的列表，\`in list\` 是 O(n)，\`in set\` 是 O(1)，差距 100 万倍。

#### 3. 关系运算（标签/权限系统）
\`\`\`python
user_tags = {'python', 'java', 'sql'}
required_tags = {'python', 'sql'}
if required_tags <= user_tags:   # 子集判断
    print("权限满足")
\`\`\`

#### 4. 集合运算（数据分析）
\`\`\`python
yesterday_users = {1, 2, 3, 4}
today_users = {3, 4, 5, 6}
new_users = today_users - yesterday_users       # 新增: {5, 6}
lost_users = yesterday_users - today_users      # 流失: {1, 2}
retained = today_users & yesterday_users        # 留存: {3, 4}
\`\`\`

### 集合 vs 列表的 in 性能对比

| 数据规模 | list \`in\` | set \`in\` | 倍数 |
|---------|-----------|----------|------|
| 100 | ~1 μs | ~0.1 μs | 10x |
| 10,000 | ~100 μs | ~0.1 μs | 1000x |
| 1,000,000 | ~10 ms | ~0.1 μs | 100000x |

**结论**：成员判断超过 100 个元素就应转 set。

### 避坑指南

> ⚠️ **警告 1**：set **无序**，不要依赖遍历顺序
> \`list({3, 1, 2})\` 可能是 \`[1, 2, 3]\` 也可能不是。需要顺序请用 list 或 dict。

> ⚠️ **警告 2**：set 元素必须**可哈希**
> \`{[1, 2], [3, 4]}\` → \`TypeError\`。要存可变集合用 frozenset 或 tuple。

> ⚠️ **警告 3**：\`remove\` vs \`discard\`
> \`s.remove(x)\` 不存在抛 \`KeyError\`，\`s.discard(x)\` 不存在静默返回。一般用 discard 更安全。

> ⚠️ **警告 4**：遍历集合时不能增删
> \`for x in s: s.remove(x)\` 会 RuntimeError。要先收集或复制：\`for x in list(s): ...\`

> ⚠️ **警告 5**：\`{}\` 是空字典不是空集合！
> 空集合必须用 \`set()\` 创建。

### set vs frozenset vs dict 对比

| 特性 | set | frozenset | dict |
|------|-----|-----------|------|
| 可变 | 是 | 否 | 是 |
| 可哈希 | 否 | 是 | 否 |
| 顺序 | 无 | 无 | 插入顺序(3.7+) |
| 存储内容 | 元素 | 元素 | 键值对 |
| 元素可哈希 | 必须 | 必须 | 键必须 |
| 成员判断 | O(1) | O(1) | O(1) |

### 最佳实践总结
1. **去重**：\`set()\` 一行搞定；保留顺序用 \`dict.fromkeys()\`
2. **成员判断**：超过 10 个元素就转 set
3. **关系运算**：用集合运算符 \`& | - ^ <= >=\` 表达更清晰
4. **不可变集合**：用 frozenset，可作字典键
5. **删除元素**：用 discard 比 remove 安全
6. **遍历增删**：先 \`list(s)\` 复制再操作
7. **空集合**：用 \`set()\`，不是 \`{}\``,
    code: `import sys
import time
from collections import OrderedDict

print("=== 集合实现原理与应用 演示 ===\\n")

print("--- 1. 集合基础：创建 / 增删 / 去重 ---")
# 创建方式
s1 = {1, 2, 3, 4}
s2 = set([1, 2, 2, 3, 3, 3])  # 自动去重
print(f"{{1,2,3,4}}: {s1}")
print(f"set([1,2,2,3,3,3]) 去重: {s2}")

# 增删
s = {1, 2, 3}
s.add(4)        # 添加
s.add(2)        # 已存在，无变化
print(f"add(4), add(2): {s}")
s.discard(10)   # 不存在不报错
print(f"discard(10): {s}  <- 不报错")
s.remove(1)     # 不存在会报 KeyError
print(f"remove(1): {s}")
print(f"len(s) = {len(s)}")

# 空集合必须用 set()，不能用 {}
empty_set = set()
empty_dict = {}
print(f"set() 类型: {type(empty_set).__name__}")
print(f"{{}} 类型: {type(empty_dict).__name__}  <- 注意是 dict！")

print("\\n--- 2. 集合运算 ---")
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
print(f"a = {a}")
print(f"b = {b}")
print(f"a & b  交集: {a & b}")
print(f"a | b  并集: {a | b}")
print(f"a - b  差集: {a - b}")
print(f"a ^ b  对称差: {a ^ b}")
print(f"a <= b 子集判断: {a <= b}")
print(f"{1,2} <= a 子集: { {1, 2} <= a }")
print(f"a.issuperset({3,4}): {a.issuperset({3, 4})}")

print("\\n--- 3. 集合运算方法形式 ---")
print("方法形式（接受任意可迭代对象，比操作符更灵活）：")
print(f"a.intersection([3,4,5]): {a.intersection([3, 4, 5])}  <- 接受 list")
print(f"a.union(range(7, 10)): {a.union(range(7, 10))}  <- 接受 range")

print("\\n--- 4. 集合 vs 列表 in 性能对比 ---")
n = 1000000
big_list = list(range(n))
big_set = set(big_list)
target = n - 1  # 查找末尾元素

# list in: O(n)
t1 = time.time()
for _ in range(100):
    _ = target in big_list
t_list = time.time() - t1

# set in: O(1)
t2 = time.time()
for _ in range(100000):  # 太快多跑几次
    _ = target in big_set
t_set = time.time() - t2

print(f"在 {n} 元素中查找末尾元素：")
print(f"  list 'in' 100次:    {t_list:.4f}s (每次 O(n))")
print(f"  set  'in' 100000次: {t_set:.4f}s (每次 O(1))")
print(f"  set 单次查找快约 {(t_list / 100) / (t_set / 100000):.0f} 倍！")

print("\\n--- 5. 业务场景：去重（保留顺序 vs 不保留）---")
data = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
print(f"原始数据: {data}")

# set 去重，不保留顺序
unique_set = list(set(data))
print(f"list(set(...)): {unique_set}  <- 顺序丢失")

# dict.fromkeys 保留顺序（3.7+）
unique_ordered = list(dict.fromkeys(data))
print(f"dict.fromkeys:  {unique_ordered}  <- 保留首次出现顺序")

# 传统保留顺序去重
unique_old = []
for x in data:
    if x not in unique_old:  # O(n) 查找，慢
        unique_old.append(x)
print(f"传统 for+in:    {unique_old}  <- 保留顺序但慢")

print("\\n--- 6. 业务场景：用户留存分析 ---")
yesterday_users = {1, 2, 3, 4, 5, 6}
today_users = {3, 4, 5, 6, 7, 8, 9}

new_users = today_users - yesterday_users     # 新增用户
lost_users = yesterday_users - today_users    # 流失用户
retained = today_users & yesterday_users      # 留存用户
reactivated = yesterday_users & today_users   # 留存（同上）

print(f"昨日用户: {sorted(yesterday_users)}")
print(f"今日用户: {sorted(today_users)}")
print(f"新增用户 (today - yesterday): {sorted(new_users)}")
print(f"流失用户 (yesterday - today): {sorted(lost_users)}")
print(f"留存用户 (today & yesterday): {sorted(retained)}")
print(f"留存率: {len(retained) / len(yesterday_users) * 100:.1f}%")

print("\\n--- 7. frozenset 不可变集合 ---")
fs = frozenset([1, 2, 3])
print(f"frozenset: {fs}")
print(f"  类型: {type(fs).__name__}")

# frozenset 可哈希，可作字典键
d = {fs: 'value'}
print(f"  作字典键: {d}")

# frozenset 可作集合元素
nested_set = {frozenset([1, 2]), frozenset([3, 4])}
print(f"  集合嵌套 frozenset: {nested_set}")

# frozenset 不可变
try:
    fs.add(4)
except AttributeError as e:
    print(f"  fs.add(4) 报错: {e}  <- 不可变")

print("\\n--- 8. 业务场景：权限校验（子集判断）---")
# 用户拥有的权限
user_perms = {'read', 'write', 'execute', 'delete'}
# 操作需要的权限
required = {'read', 'write'}

if required <= user_perms:   # required 是 user_perms 的子集
    print(f"权限校验通过：需要 {required}，拥有 {user_perms}")
else:
    missing = required - user_perms
    print(f"权限不足，缺少: {missing}")

# 多角色权限合并（并集）
role_admin = {'read', 'write', 'delete', 'manage'}
role_editor = {'read', 'write'}
combined_perms = role_admin | role_editor
print(f"角色合并权限: {combined_perms}")

print("\\n--- 9. 避坑：remove vs discard ---")
s = {1, 2, 3}
print(f"集合: {s}")
s.discard(99)  # 不存在也不报错
print(f"  discard(99): {s}  <- 静默返回")
try:
    s.remove(99)
except KeyError as e:
    print(f"  remove(99) 报错: KeyError({e})  <- remove 严格")

print("\\n--- 10. 避坑：遍历时增删 ---")
s = {1, 2, 3, 4, 5}
print(f"原集合: {s}")
# 错误：直接遍历删除会 RuntimeError
try:
    for x in s:
        if x % 2 == 0:
            s.remove(x)
except RuntimeError as e:
    print(f"  直接遍历删除报错: {e}")

# 正确1：遍历副本
s = {1, 2, 3, 4, 5}
for x in list(s):
    if x % 2 == 0:
        s.remove(x)
print(f"  遍历 list(s) 删除偶数: {s}")

# 正确2：集合推导式
s = {1, 2, 3, 4, 5}
s = {x for x in s if x % 2 == 1}
print(f"  集合推导式保留奇数: {s}")

print("\\n=== 集合总结 ===")
print("1. set 底层是哈希表（只存键），成员判断 O(1)")
print("2. 元素必须可哈希：tuple 可，list/dict/set 不可")
print("3. frozenset 不可变且可哈希，可作字典键")
print("4. 集合运算 & | - ^ 复杂度 O(n) 平均")
print("5. 去重 + 保留顺序用 dict.fromkeys")
print("6. 大量成员判断转 set，性能提升成千上万倍")
print("7. remove 不存在报错，discard 安全")
print("8. 遍历时增删要先复制 list(s) 或用推导式")
`,
  },
  {
    id: "py6-stack-queue",
    group: "数据结构进阶",
    icon: "📚",
    title: "栈与队列实现",
    content: `## 栈与队列实现

### 栈（Stack）— LIFO 后进先出
栈是一种**只能在一端（栈顶）操作**的线性结构：
- **压入 push**：元素入栈顶
- **弹出 pop**：从栈顶移除元素
- **后进先出**（LIFO, Last In First Out）

类比：一摞盘子，只能从顶部放/取。

### 队列（Queue）— FIFO 先进先出
队列是**一端进、另一端出**的线性结构：
- **入队 enqueue**：元素加到队尾
- **出队 dequeue**：从队头移除
- **先进先出**（FIFO, First In First Out）

类比：排队买饭，先来的先服务。

### 栈的三种实现

#### 1. 用 list 实现（最简单）
\`\`\`python
stack = []
stack.append(x)   # push
stack.pop()       # pop
stack[-1]         # peek 栈顶
\`\`\`
- 优点：简单，末尾 O(1)
- 缺点：**不是线程安全**；语义不明确（list 太通用）

#### 2. 用 collections.deque 实现（推荐）
\`\`\`python
from collections import deque
stack = deque()
stack.append(x)   # push
stack.pop()       # pop
stack[-1]         # peek
\`\`\`
- 优点：两端 O(1)，性能稳定
- 缺点：仍非线程安全

#### 3. 用 queue.LifoQueue 实现（线程安全）
\`\`\`python
from queue import LifoQueue
stack = LifoQueue()
stack.put(x)      # push
stack.get()       # pop（阻塞）
\`\`\`
- 优点：**线程安全**（带锁），支持阻塞、超时
- 缺点：性能开销大（每次操作加锁）

### 队列的两种实现

#### 1. 用 collections.deque 实现（推荐）
\`\`\`python
from collections import deque
q = deque()
q.append(x)      # 入队（队尾）
q.popleft()      # 出队（队头）
\`\`\`
- 单线程首选，popleft 是 O(1)

#### 2. 用 queue.Queue 实现（线程安全）
\`\`\`python
from queue import Queue
q = Queue()
q.put(x)         # 入队
q.get()          # 出队（阻塞）
\`\`\`
- 多线程生产者-消费者首选

### 各实现的线程安全性

| 实现 | 线程安全 | 阻塞 | 适用场景 |
|------|---------|------|---------|
| \`list\` | ❌ | ❌ | 单线程简单栈 |
| \`collections.deque\` | ❌（操作原子，但组合不安全） | ❌ | 单线程高性能 |
| \`queue.LifoQueue\` | ✅ | ✅ | 多线程栈 |
| \`queue.Queue\` | ✅ | ✅ | 多线程队列 |
| \`queue.PriorityQueue\` | ✅ | ✅ | 多线程优先队列 |

> 💡 **提示**：deque 的单个 \`append\` / \`popleft\` 在 CPython 中是**原子操作**（GIL 保护），简单场景"看似线程安全"。但 \`if not q: q.append(x)\` 这种**组合操作**不是原子的，多线程仍需加锁。

### 业务场景

#### 1. 函数调用栈
Python 解释器本身用栈管理函数调用：每次调用压栈，return 弹栈。递归过深会 \`RecursionError\`。

#### 2. 撤销操作（Undo）
编辑器/IDE 的撤销功能：每次操作 push，撤销时 pop：
\`\`\`python
undo_stack = []
undo_stack.append(current_state)   # 操作前保存
# Ctrl+Z
prev_state = undo_stack.pop()
\`\`\`

#### 3. 回溯算法
DFS、迷宫求解、八皇后、括号匹配等用栈：
\`\`\`python
# 括号匹配
def is_valid(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for c in s:
        if c in pairs.values():
            stack.append(c)
        elif c in pairs:
            if not stack or stack.pop() != pairs[c]:
                return False
    return not stack
\`\`\`

#### 4. 表达式求值
中缀转后缀、后缀表达式求值，都用栈。

#### 5. BFS 广度优先搜索
队列天然适合层序遍历、最短路径（无权图）。

#### 6. 生产者-消费者模型
多线程任务队列：
\`\`\`python
from queue import Queue
from threading import Thread

task_queue = Queue()
def producer():
    for i in range(100):
        task_queue.put(f'task-{i}')
def consumer():
    while True:
        task = task_queue.get()  # 阻塞等待
        process(task)
        task_queue.task_done()
\`\`\`

### 完整的栈和队列类实现（带类型注解）

\`\`\`python
from typing import TypeVar, Generic, List
from collections import deque

T = TypeVar('T')

class Stack(Generic[T]):
    """泛型栈，基于 deque 实现"""
    def __init__(self) -> None:
        self._items: deque[T] = deque()
    def push(self, item: T) -> None:
        self._items.append(item)
    def pop(self) -> T:
        if self.is_empty():
            raise IndexError("pop from empty stack")
        return self._items.pop()
    def peek(self) -> T:
        if self.is_empty():
            raise IndexError("peek from empty stack")
        return self._items[-1]
    def is_empty(self) -> bool:
        return len(self._items) == 0
    def __len__(self) -> int:
        return len(self._items)

class Queue(Generic[T]):
    """泛型队列，基于 deque 实现"""
    def __init__(self) -> None:
        self._items: deque[T] = deque()
    def enqueue(self, item: T) -> None:
        self._items.append(item)
    def dequeue(self) -> T:
        if self.is_empty():
            raise IndexError("dequeue from empty queue")
        return self._items.popleft()
    def is_empty(self) -> bool:
        return len(self._items) == 0
\`\`\`

### 避坑指南

> ⚠️ **警告 1**：栈空时 \`pop\` 会抛 \`IndexError\`，要先判断
> 用 \`if stack:\` 或自定义类抛更清晰的异常。

> ⚠️ **警告 2**：用 list 实现队列的 \`pop(0)\` 是 O(n)！
> 必须用 \`deque.popleft\` 或 \`Queue.get\`。

> ⚠️ **警告 3**：\`Queue.get()\` 默认**阻塞**等待
> 多线程场景是好事，单线程会"卡死"。设置 \`timeout\` 或用 \`get_nowait()\`。

> ⚠️ **警告 4**：递归过深会栈溢出
> Python 默认递归深度 1000，可 \`sys.setrecursionlimit\` 调整，但更深用迭代+显式栈。

### 最佳实践总结
1. **单线程栈**：用 \`deque\`（性能 + 语义清晰），list 也行
2. **单线程队列**：必须用 \`deque.popleft\`，不要 list.pop(0)
3. **多线程**：用 \`queue.LifoQueue\` / \`queue.Queue\` / \`queue.PriorityQueue\`
4. **业务封装**：自定义类抛清晰异常，比裸用 list/deque 友好
5. **递归过深**：转迭代 + 显式栈
6. **生产者-消费者**：\`Queue\` + 守护线程是经典模式`,
    code: `from collections import deque
from queue import Queue, LifoQueue
from typing import TypeVar, Generic, List, Optional
import time

print("=== 栈与队列实现 演示 ===\\n")

print("--- 1. 用 list 实现栈 ---")
stack_list = []
stack_list.append('A')   # push
stack_list.append('B')
stack_list.append('C')
print(f"push A, B, C 后: {stack_list}")
print(f"  peek 栈顶 stack[-1]: {stack_list[-1]}")
print(f"  pop: {stack_list.pop()}  <- 后进先出")
print(f"  pop: {stack_list.pop()}")
print(f"  剩余: {stack_list}")

print("\\n--- 2. 用 deque 实现栈（推荐）---")
stack_deque = deque()
stack_deque.append('X')
stack_deque.append('Y')
stack_deque.append('Z')
print(f"push X, Y, Z 后: {list(stack_deque)}")
print(f"  pop: {stack_deque.pop()}")
print(f"  pop: {stack_deque.pop()}")
print(f"  剩余: {list(stack_deque)}")

print("\\n--- 3. 用 deque 实现队列（推荐）---")
q = deque()
q.append('A')     # 入队（队尾）
q.append('B')
q.append('C')
print(f"入队 A, B, C 后: {list(q)}")
print(f"  出队 popleft: {q.popleft()}  <- 先进先出")
print(f"  出队 popleft: {q.popleft()}")
print(f"  剩余: {list(q)}")

print("\\n--- 4. 完整的栈类（带类型注解）---")
T = TypeVar('T')

class Stack(Generic[T]):
    """泛型栈，基于 deque，带类型注解"""
    def __init__(self) -> None:
        self._items: deque = deque()
    def push(self, item: T) -> None:
        self._items.append(item)
    def pop(self) -> T:
        if self.is_empty():
            raise IndexError("pop from empty stack")
        return self._items.pop()
    def peek(self) -> T:
        if self.is_empty():
            raise IndexError("peek from empty stack")
        return self._items[-1]
    def is_empty(self) -> bool:
        return len(self._items) == 0
    def __len__(self) -> int:
        return len(self._items)
    def __repr__(self) -> str:
        return f"Stack({list(self._items)})"

# 使用栈
s: Stack[int] = Stack()
for x in [1, 2, 3, 4, 5]:
    s.push(x)
print(f"压入 1-5: {s}")
print(f"  peek: {s.peek()}")
print(f"  pop: {s.pop()}")
print(f"  pop: {s.pop()}")
print(f"  len: {len(s)}")
# 空栈 pop 抛异常
try:
    empty = Stack()
    empty.pop()
except IndexError as e:
    print(f"  空栈 pop 报错: {e}")

print("\\n--- 5. 完整的队列类（带类型注解）---")
class Queue_(Generic[T]):
    """泛型队列，基于 deque"""
    def __init__(self) -> None:
        self._items: deque = deque()
    def enqueue(self, item: T) -> None:
        self._items.append(item)
    def dequeue(self) -> T:
        if self.is_empty():
            raise IndexError("dequeue from empty queue")
        return self._items.popleft()
    def front(self) -> T:
        if self.is_empty():
            raise IndexError("front from empty queue")
        return self._items[0]
    def is_empty(self) -> bool:
        return len(self._items) == 0
    def __len__(self) -> int:
        return len(self._items)
    def __repr__(self) -> str:
        return f"Queue({list(self._items)})"

q: Queue_[str] = Queue_()
for name in ['Alice', 'Bob', 'Charlie']:
    q.enqueue(name)
print(f"入队: {q}")
print(f"  front: {q.front()}")
print(f"  dequeue: {q.dequeue()}  <- 先进先出")
print(f"  dequeue: {q.dequeue()}")
print(f"  剩余: {q}")

print("\\n--- 6. 业务场景：括号匹配（栈的经典应用）---")
def is_valid_parentheses(s: str) -> bool:
    """用栈检查括号是否匹配"""
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for c in s:
        if c in pairs.values():   # 左括号入栈
            stack.append(c)
        elif c in pairs:           # 右括号匹配
            if not stack or stack.pop() != pairs[c]:
                return False
    return not stack   # 栈空才算匹配

test_cases = ['()', '()[]{}', '(]', '([)]', '{[]}', '(((']
for case in test_cases:
    result = is_valid_parentheses(case)
    print(f"  '{case}' -> {result}")

print("\\n--- 7. 业务场景：撤销操作（Undo）---")
class TextEditor:
    """简易文本编辑器，支持撤销"""
    def __init__(self):
        self.content = ''
        self.undo_stack: Stack[str] = Stack()
    def type_text(self, text: str):
        self.undo_stack.push(self.content)  # 保存修改前状态
        self.content += text
        print(f"  输入 '{text}' -> 当前: '{self.content}'")
    def undo(self):
        if not self.undo_stack.is_empty():
            self.content = self.undo_stack.pop()
            print(f"  撤销 -> 当前: '{self.content}'")
        else:
            print("  无法撤销（栈空）")

editor = TextEditor()
editor.type_text("Hello")
editor.type_text(" World")
editor.type_text("!")
editor.undo()
editor.undo()
editor.undo()

print("\\n--- 8. 业务场景：BFS 广度优先搜索（队列经典应用）---")
def bfs_shortest_path(graph, start, end):
    """用队列找最短路径（无权图）"""
    visited = {start}
    queue = deque([(start, [start])])   # (当前节点, 路径)
    while queue:
        node, path = queue.popleft()
        if node == end:
            return path
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
    return None

graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'F'],
    'D': ['B'],
    'E': ['B', 'F'],
    'F': ['C', 'E', 'G'],
    'G': ['F'],
}
print(f"图: {graph}")
path = bfs_shortest_path(graph, 'A', 'G')
print(f"  A -> G 最短路径: {path}")

print("\\n--- 9. 多线程队列：Queue / LifoQueue ---")
from threading import Thread

# Queue 是线程安全的，多线程生产者-消费者
task_q = Queue(maxsize=10)
results = []

def producer():
    for i in range(5):
        task_q.put(f'task-{i}')
        print(f"  [生产者] put task-{i}")

def consumer():
    while True:
        task = task_q.get()
        if task == 'STOP':
            break
        print(f"  [消费者] 处理 {task}")
        results.append(task)
        task_q.task_done()

t1 = Thread(target=producer)
t2 = Thread(target=consumer)
t1.start()
t1.join()
task_q.put('STOP')   # 发送停止信号
t2.start()
t2.join()
print(f"  处理结果: {results}")

print("\\n--- 10. 性能对比：list 栈 vs deque 栈 vs LifoQueue ---")
n = 1000000

# list 栈
t1 = time.time()
lst = []
for i in range(n):
    lst.append(i)
while lst:
    lst.pop()
t_list = time.time() - t1

# deque 栈
t2 = time.time()
dq = deque()
for i in range(n):
    dq.append(i)
while dq:
    dq.pop()
t_deque = time.time() - t2

# LifoQueue 栈（带锁开销）
t3 = time.time()
lq = LifoQueue()
for i in range(100000):  # 量减半，否则太慢
    lq.put(i)
while not lq.empty():
    lq.get()
t_lifoq = (time.time() - t3) * 10  # 折算到 100w

print(f"push+pop {n} 次：")
print(f"  list 栈:        {t_list:.4f}s")
print(f"  deque 栈:       {t_deque:.4f}s (推荐)")
print(f"  LifoQueue(折算): {t_lifoq:.4f}s (线程安全但慢)")

print("\\n=== 栈与队列总结 ===")
print("1. 栈 LIFO：list/deque 都行，deque 更推荐")
print("2. 队列 FIFO：必须用 deque.popleft，不要 list.pop(0)")
print("3. 单线程用 deque，多线程用 queue.Queue/LifoQueue")
print("4. 业务场景：调用栈/撤销/DFS/括号匹配用栈")
print("5. 业务场景：BFS/任务调度/生产者消费者用队列")
print("6. 自定义类带类型注解，比裸用容器更安全清晰")
print("7. 递归过深可转迭代+显式栈")
print("8. Queue.get 默认阻塞，单线程要小心")
`,
  },
];
