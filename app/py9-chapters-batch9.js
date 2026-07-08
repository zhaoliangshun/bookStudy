// =============================================================
// Python 逐层深入教程 - batch9
// 章节 83-92：性能优化 + 实战进阶
//   性能优化 / 内存GC / 并发 / 多线程 / 多进程 /
//   Web开发入门 / 数据库 / API设计 / 项目结构 / 综合实战
// =============================================================

export const chapters = [
  // -----------------------------------------------------------
  // 第 83 章：性能优化策略
  // -----------------------------------------------------------
  {
    id: "py9-83",
    group: "性能优化",
    icon: "🚀",
    title: "性能优化策略：从算法到实现",
    content: `## 优化的黄金法则

1. **先测量，再优化**：别瞎猜，用工具找瓶颈
2. **算法优先**：O(n) 比 O(n²) 重要得多
3. **数据结构**：用对的工具
4. **避免重复**：缓存、记忆化
5. **少做功**：惰性求值、提前退出

## 时间复杂度

| 复杂度 | 名字 | 例子 |
|---|---|---|
| O(1) | 常数 | 字典查找 |
| O(log n) | 对数 | 二分查找 |
| O(n) | 线性 | 遍历列表 |
| O(n log n) | 线性对数 | 排序 |
| O(n²) | 平方 | 双重循环 |

## 常见优化点

### 1. 用内置函数

\`\`\`python
# 慢
total = 0  # 定义数值 total
for x in nums:  # 遍历 nums，取值给 x
    total += x  # total 累加

# 快
total = sum(nums)  # 赋值变量 total
\`\`\`

内置函数用 C 实现，比 Python 循环快得多。

### 2. 用集合查找

\`\`\`python
# 慢 O(n)
if x in big_list:  # 如果 x in big_list

# 快 O(1)
if x in big_set:  # 如果 x in big_set
\`\`\`

### 3. 推导式比循环快

\`\`\`python
# 慢
result = []  # 定义列表 result
for x in range(n):  # 遍历 range(n)，取值给 x
    result.append(x ** 2)  # 调用 result.append()：向列表末尾添加元素

# 快
result = [x ** 2 for x in range(n)]  # 定义列表 result
\`\`\`

### 4. 字符串用 join

\`\`\`python
# 慢
s = ""  # 定义字符串 s
for w in words:  # 遍历 words，取值给 w
    s += w  # s 累加

# 快
s = "".join(words)  # 定义字符串 s
\`\`\`

### 5. 缓存

\`\`\`python
from functools import lru_cache  # 从 functools 导入 lru_cache

@lru_cache  # 应用装饰器 lru_cache
def expensive(x): ...  # 定义函数 expensive，参数：x
\`\`\`

### 6. 局部变量更快

\`\`\`python
# 慢
def f():  # 定义函数 f
    for i in range(n):  # 遍历 range(n)，取值给 i
        global_var[i]  # 全局查找慢

# 快
def f():  # 定义函数 f
    local = global_var  # 先局部化
    for i in range(n):  # 遍历 range(n)，取值给 i
        local[i]  # 执行操作
\`\`\`

## 何时优化

- **不要过早优化**：先写对再优化
- **瓶颈在哪优化哪**：80/20 法则
- **测量验证**：优化后看是否真的快了

## 本章 demo

demo 演示各种优化技巧的对比。`,
    code: `# ============================================
# 第 83 章：性能优化策略
# ============================================
import time
import sys
from functools import lru_cache
from collections import Counter

# --- 1. 内置函数 vs 循环 ---
print("=== 1. 内置 vs 循环 ===")
N = 1_000_000
nums = list(range(N))

# 循环求和
start = time.perf_counter()
total1 = 0
for x in nums:
    total1 += x
t_loop = time.perf_counter() - start

# 内置 sum
start = time.perf_counter()
total2 = sum(nums)
t_builtin = time.perf_counter() - start

print(f"  N = {N:,}")
print(f"  循环: {t_loop:.4f}s")
print(f"  sum:  {t_builtin:.4f}s    ← 快 {t_loop/t_builtin:.1f}x")

# --- 2. 列表查找 ---
print("\\n=== 2. 查找 ===")
import random
data_list = list(range(10000))
random.shuffle(data_list)
data_set = set(data_list)
test_items = random.sample(range(10000), 1000)

# list 查找 O(n)
start = time.perf_counter()
for x in test_items:
    x in data_list
t_list = time.perf_counter() - start

# set 查找 O(1)
start = time.perf_counter()
for x in test_items:
    x in data_set
t_set = time.perf_counter() - start

print(f"  1000 次查找（10000 元素）:")
print(f"  list: {t_list:.4f}s")
print(f"  set:  {t_set:.6f}s    ← 快 {t_list/t_set:.0f}x")

# --- 3. 推导式 vs 循环 ---
print("\\n=== 3. 推导式 ===")
N = 500_000

# for 循环
start = time.perf_counter()
result1 = []
for i in range(N):
    result1.append(i ** 2)
t_for = time.perf_counter() - start

# 推导式
start = time.perf_counter()
result2 = [i ** 2 for i in range(N)]
t_comp = time.perf_counter() - start

# map
start = time.perf_counter()
result3 = list(map(lambda x: x ** 2, range(N)))
t_map = time.perf_counter() - start

print(f"  N = {N:,}")
print(f"  for 循环: {t_for:.4f}s")
print(f"  推导式:   {t_comp:.4f}s    ← 快 {t_for/t_comp:.1f}x")
print(f"  map:      {t_map:.4f}s")

# --- 4. 字符串拼接 ---
print("\\n=== 4. 字符串 ===")
words = ["hello"] * 10000

# + 拼接
start = time.perf_counter()
s1 = ""
for w in words:
    s1 += w
t_plus = time.perf_counter() - start

# join
start = time.perf_counter()
s2 = "".join(words)
t_join = time.perf_counter() - start

print(f"  拼接 10000 个字符串:")
print(f"  +:    {t_plus:.4f}s")
print(f"  join: {t_join:.6f}s    ← 快 {t_plus/t_join:.0f}x")

# --- 5. 缓存 ---
print("\\n=== 5. 缓存 ===")
def fib_slow(n):
    """无缓存递归"""
    if n < 2: return n
    return fib_slow(n-1) + fib_slow(n-2)

@lru_cache(maxsize=128)
def fib_fast(n):
    """有缓存"""
    if n < 2: return n
    return fib_fast(n-1) + fib_fast(n-2)

start = time.perf_counter()
r1 = fib_slow(30)
t_slow = time.perf_counter() - start

start = time.perf_counter()
r2 = fib_fast(30)
t_fast = time.perf_counter() - start

print(f"  fib(30) = {r1}")
print(f"  无缓存: {t_slow:.4f}s")
print(f"  有缓存: {t_fast:.6f}s    ← 快 {t_slow/t_fast:.0f}x")
print(f"  缓存信息: {fib_fast.cache_info()}")

# --- 6. 局部变量 ---
print("\\n=== 6. 局部变量 ===")
global_data = list(range(10000))

def use_global(n):
    """用全局变量"""
    total = 0
    for i in range(n):
        total += global_data[i % len(global_data)]
    return total

def use_local(n):
    """用局部变量"""
    data = global_data    # 先局部化
    size = len(data)
    total = 0
    for i in range(n):
        total += data[i % size]
    return total

n = 100000
start = time.perf_counter()
use_global(n)
t_global = time.perf_counter() - start

start = time.perf_counter()
use_local(n)
t_local = time.perf_counter() - start

print(f"  {n} 次访问:")
print(f"  全局: {t_global:.4f}s")
print(f"  局部: {t_local:.4f}s    ← 快 {t_global/t_local:.1f}x")

# --- 7. 算法对比 ===
print("\\n=== 7. 算法 ===")
# 在有序列表找值
import bisect

sorted_data = sorted(range(100000))

# 线性查找 O(n)
def linear_search(data, target):
    for i, x in enumerate(data):
        if x == target:
            return i
    return -1

# 二分查找 O(log n)
def binary_search(data, target):
    lo, hi = 0, len(data) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if data[mid] == target:
            return mid
        elif data[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

target = 99999
start = time.perf_counter()
linear_search(sorted_data, target)
t_linear = time.perf_counter() - start

start = time.perf_counter()
binary_search(sorted_data, target)
t_binary = time.perf_counter() - start

start = time.perf_counter()
bisect.bisect_left(sorted_data, target)
t_bisect = time.perf_counter() - start

print(f"  在 100000 有序列表中找 {target}:")
print(f"  线性 O(n):     {t_linear:.6f}s")
print(f"  二分 O(log n): {t_binary:.6f}s    ← 快 {t_linear/t_binary:.0f}x")
print(f"  bisect:        {t_bisect:.6f}s")

# --- 8. 生成器省内存 ---
print("\\n=== 8. 生成器 ===")
# 列表：占内存
big_list = [x ** 2 for x in range(100000)]
# 生成器：省内存
big_gen = (x ** 2 for x in range(100000))

print(f"  列表大小: {sys.getsizeof(big_list):,} 字节")
print(f"  生成器大小: {sys.getsizeof(big_gen):,} 字节")
print(f"  节省: {sys.getsizeof(big_list) / sys.getsizeof(big_gen):.0f}x")

# 求和性能差不多
start = time.perf_counter()
sum([x ** 2 for x in range(100000)])
t_list = time.perf_counter() - start

start = time.perf_counter()
sum(x ** 2 for x in range(100000))
t_gen = time.perf_counter() - start

print(f"\\n  求和:")
print(f"  列表: {t_list:.6f}s")
print(f"  生成器: {t_gen:.6f}s")

# --- 9. 避免不必要的工作 ---
print("\\n=== 9. 避免重复 ===")
text = "the quick brown fox jumps over the lazy dog " * 100

# 慢：每次都 count
start = time.perf_counter()
result1 = {w: text.count(w) for w in set(text.split())}
t_slow = time.perf_counter() - start

# 快：用 Counter
start = time.perf_counter()
result2 = dict(Counter(text.split()))
t_fast = time.perf_counter() - start

print(f"  词频统计:")
print(f"  text.count: {t_slow:.4f}s    ← O(n²)")
print(f"  Counter:    {t_fast:.6f}s    ← O(n), 快 {t_slow/t_fast:.0f}x")

# --- 10. 综合优化 ===
print("\\n=== 10. 综合 ===")

# 优化前：找两个列表的交集
def intersect_slow(list1, list2):
    """O(n*m)"""
    result = []
    for x in list1:
        if x in list2:    # list2 是列表，O(m)
            result.append(x)
    return result

# 优化后：用集合
def intersect_fast(list1, list2):
    """O(n+m)"""
    set2 = set(list2)
    return [x for x in list1 if x in set2]

list1 = list(range(5000))
list2 = list(range(3000, 8000))

start = time.perf_counter()
r1 = intersect_slow(list1, list2)
t_slow = time.perf_counter() - start

start = time.perf_counter()
r2 = intersect_fast(list1, list2)
t_fast = time.perf_counter() - start

print(f"  交集（5000 vs 5000）:")
print(f"  慢 O(n*m): {t_slow:.4f}s")
print(f"  快 O(n+m): {t_fast:.6f}s    ← 快 {t_slow/t_fast:.0f}x")
print(f"  结果一致: {r1 == r2}")`
  },

  // -----------------------------------------------------------
  // 第 84 章：内存管理与垃圾回收
  // -----------------------------------------------------------
  {
    id: "py9-84",
    group: "性能优化",
    icon: "♻️",
    title: "内存管理与垃圾回收",
    content: `## Python 的内存管理

Python 用**引用计数** + **垃圾回收**管理内存。

## 引用计数

每个对象有个引用计数，记录有多少变量指向它：

\`\`\`python
a = [1, 2, 3]    # 引用计数 = 1
b = a            # 引用计数 = 2
del a            # 引用计数 = 1
del b            # 引用计数 = 0 → 回收
\`\`\`

\`\`\`python
import sys  # 导入模块 sys
sys.getrefcount(obj)    # 查引用计数（注意：传参会 +1）
\`\`\`

## 引用计数的问题：循环引用

\`\`\`python
a = []  # 定义列表 a
b = [a]  # 定义列表 b
a.append(b)  # 调用 a.append()：向列表末尾添加元素
del a, b    # 引用计数都不为 0，但已无外部引用
\`\`\`

引用计数无法处理循环引用，需要垃圾回收器。

## 垃圾回收器

Python 的 GC 用**分代回收**：
- **第 0 代**：新对象，频繁检查
- **第 1 代**：经过 1 次 GC 存活
- **第 2 代**：经过 2 次 GC 存活

老对象检查频率低，提升性能。

\`\`\`python
import gc  # 导入模块 gc
gc.collect()       # 手动触发
gc.get_stats()     # GC 统计
gc.disable()       # 禁用（谨慎）
\`\`\`

## __del__ 析构

\`\`\`python
class Resource:  # 定义类 Resource
    def __del__(self):  # 定义函数 __del__，参数：self
        # 对象被回收时调用
        self.close()  # 调用 self.close()：关闭
\`\`\`

⚠️ \`__del__\` 不可靠（循环引用时不一定调用），用 \`with\` 更安全。

## weakref 弱引用

\`\`\`python
import weakref  # 导入模块 weakref
ref = weakref.ref(obj)  # 赋值变量 ref
ref()    # 返回对象，被回收了返回 None
\`\`\`

弱引用不增加引用计数，适合缓存、观察者。

## 内存优化

1. **用 __slots__**：省去 __dict__，省内存
2. **用生成器**：不一次建大列表
3. **用 array**：同类型数据省内存
4. **及时释放**：大对象用完 del

## 本章 demo

demo 演示引用计数、GC、weakref。`,
    code: `# ============================================
# 第 84 章：内存管理与垃圾回收
# ============================================
import sys
import gc
import weakref
import time

# --- 1. 引用计数 ---
print("=== 1. 引用计数 ===")
a = [1, 2, 3]
# getrefcount 传参会 +1，所以实际 = 结果 - 1
print(f"  a 的引用计数: {sys.getrefcount(a) - 1}")

b = a
print(f"  b = a 后: {sys.getrefcount(a) - 1}")

c = [a, a]
print(f"  c = [a, a] 后: {sys.getrefcount(a) - 1}")

del b
print(f"  del b 后: {sys.getrefcount(a) - 1}")

del c
print(f"  del c 后: {sys.getrefcount(a) - 1}")

# --- 2. 小整数缓存 ---
print("\\n=== 2. 整数缓存 ===")
# Python 缓存 -5 ~ 256 的整数
a = 100
b = 100
print(f"  100 is 100: {a is b}    ← 小整数缓存")

a = 1000
b = 1000
print(f"  1000 is 1000: {a is b}    ← 超出范围，可能不同对象")

# 字符串驻留
s1 = "hello"
s2 = "hello"
print(f"  'hello' is 'hello': {s1 is s2}    ← 字符串驻留")

# --- 3. 循环引用 ---
print("\\n=== 3. 循环引用 ===")
class Node:
    def __init__(self, name):
        self.name = name
        self.parent = None
        self.children = []
    
    def __repr__(self):
        return f"Node({self.name})"

# 创建循环引用
root = Node("root")
child = Node("child")
root.children.append(child)
child.parent = root

# 引用计数
print(f"  root 引用计数: {sys.getrefcount(root) - 1}")
print(f"  child 引用计数: {sys.getrefcount(child) - 1}")

# 即使 del，引用计数也不为 0
del root
del child
# 但 GC 能处理
collected = gc.collect()
print(f"  GC 回收: {collected} 个对象")

# --- 4. GC 分代 ---
print("\\n=== 4. GC 分代 ===")
print(f"  GC 阈值: {gc.get_threshold()}")
print(f"  GC 计数: {gc.get_count()}")

# 触发 GC
for i in range(10):
    x = [1, 2, 3]
    y = [x]

gc.collect()
print(f"  collect 后计数: {gc.get_count()}")

# GC 统计
stats = gc.get_stats()
print(f"  GC 统计:")
for i, s in enumerate(stats):
    print(f"    第{i}代: collections={s['collections']}, collected={s['collected']}")

# --- 5. __del__ 析构 ===
print("\\n=== 5. __del__ ===")
class TempFile:
    def __init__(self, name):
        self.name = name
        print(f"    [{self.name}] 创建")
    
    def __del__(self):
        print(f"    [{self.name}] 销毁")

print("  创建对象:")
f = TempFile("a.txt")
print(f"  引用计数: {sys.getrefcount(f) - 1}")
print("  del:")
del f
print("  (销毁消息应在上面)")

# --- 6. weakref 弱引用 ===
print("\\n=== 6. weakref ===")
class Big:
    def __init__(self, name):
        self.name = name

obj = Big("大数据")
ref = weakref.ref(obj)

print(f"  obj 存在: {ref() is not None}")
print(f"  ref() = {ref()}")

# 删除原对象
del obj
gc.collect()
print(f"  del 后 ref() = {ref()}    ← None，已被回收")

# WeakValueDictionary
cache = weakref.WeakValueDictionary()
obj2 = Big("缓存对象")
cache["key"] = obj2
print(f"\\n  WeakValueDictionary: {list(cache.keys())}")
del obj2
gc.collect()
print(f"  del 原对象后: {list(cache.keys())}    ← 自动清除")

# --- 7. __slots__ 省内存 ---
print("\\n=== 7. __slots__ ===")
class PointDict:
    """普通类"""
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

class PointSlots:
    """用 __slots__"""
    __slots__ = ("x", "y", "z")
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

p1 = PointDict(1, 2, 3)
p2 = PointSlots(1, 2, 3)

# 内存对比
size1 = sys.getsizeof(p1) + sys.getsizeof(p1.__dict__)
size2 = sys.getsizeof(p2)
print(f"  PointDict 大小: {size1} 字节（含 __dict__）")
print(f"  PointSlots 大小: {size2} 字节")
print(f"  节省: {size1 - size2} 字节 ({(size1-size2)/size1*100:.0f}%)")

# __slots__ 限制属性
try:
    p2.w = 4
except AttributeError as e:
    print(f"  p2.w = 4 → {e}")

# --- 8. 生成器省内存 ---
print("\\n=== 8. 生成器 ===")
# 列表：全部在内存
big_list = [x ** 2 for x in range(100000)]
# 生成器：惰性
big_gen = (x ** 2 for x in range(100000))

print(f"  列表（100000）: {sys.getsizeof(big_list):,} 字节")
print(f"  生成器: {sys.getsizeof(big_gen):,} 字节")
print(f"  节省: {(sys.getsizeof(big_list) - sys.getsizeof(big_gen)):,} 字节")

# --- 9. array 省内存 ---
print("\\n=== 9. array ===")
import array

# list 存整数
lst = list(range(10000))
# array 存整数（C 类型）
arr = array.array("i", range(10000))    # i = int

print(f"  list[int] 10000: {sys.getsizeof(lst):,} 字节")
print(f"  array[int] 10000: {sys.getsizeof(arr):,} 字节")
print(f"  节省: {sys.getsizeof(lst) - sys.getsizeof(arr):,} 字节")

# 操作类似
print(f"  arr[0] = {arr[0]}, arr[-1] = {arr[-1]}")
arr.append(10000)
print(f"  append 后: {arr[-1]}")

# --- 10. 内存泄漏排查 ---
print("\\n=== 10. 内存检查 ===")
import tracemalloc

# 启动内存跟踪
tracemalloc.start()

# 模拟内存使用
def create_data():
    return [list(range(100)) for _ in range(100)]

snapshot1 = tracemalloc.take_snapshot()
data = create_data()
snapshot2 = tracemalloc.take_snapshot()

# 对比
stats = snapshot2.compare_to(snapshot1, "lineno")
print("  内存增长 top 3:")
for s in stats[:3]:
    print(f"    {s}")

# 清理
del data
gc.collect()

snapshot3 = tracemalloc.take_snapshot()
stats = snapshot3.compare_to(snapshot2, "lineno")
print("\\n  清理后:")
for s in stats[:3]:
    print(f"    {s}")

tracemalloc.stop()
print("\\n  → tracemalloc 能定位内存分配位置")`
  },

  // -----------------------------------------------------------
  // 第 85 章：并发与并行
  // -----------------------------------------------------------
  {
    id: "py9-85",
    group: "性能优化",
    icon: "🔀",
    title: "并发与并行：概念与选择",
    content: `## 并发 vs 并行

- **并发（Concurrency）**：多个任务交替执行（看起来同时）
- **并行（Parallelism）**：多个任务真正同时执行（多核）

打个比方：
- 并发：一个厨师同时做几道菜（切换着做）
- 并行：多个厨师各做一道菜

## Python 的并发方案

| 方案 | 适用 | 特点 |
|---|---|---|
| threading | IO 密集 | 受 GIL 限制，不能真并行 |
| multiprocessing | CPU 密集 | 真并行，进程独立 |
| asyncio | IO 密集 | 单线程协程，轻量 |
| concurrent.futures | 通用 | 高层接口 |

## IO 密集 vs CPU 密集

**IO 密集**：大部分时间在等待（网络、文件、数据库）
- 用 threading / asyncio

**CPU 密集**：大部分时间在计算
- 用 multiprocessing

## GIL（全局解释器锁）

CPython 的 GIL 让同一时刻只有一个线程执行 Python 字节码。所以：
- 多线程**不能**加速 CPU 密集任务
- 多线程**能**加速 IO 密集任务（IO 时释放 GIL）

## 选择建议

\`\`\`python
# 1. IO 密集（网络请求、文件读写）
# 优先 asyncio（最高效）
# 或 threading（简单）

# 2. CPU 密集（计算）
# 用 multiprocessing

# 3. 不确定
# 用 concurrent.futures（接口统一）
\`\`\`

## concurrent.futures

\`\`\`python
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor  # 从 concurrent.futures 导入 ThreadPoolExecutor, ProcessPoolExecutor

# 线程池
with ThreadPoolExecutor(max_workers=4) as executor:  # 使用上下文管理器：ThreadPoolExecutor(max_workers=4) as executor
    results = list(executor.map(func, items))  # 赋值变量 results

# 进程池
with ProcessPoolExecutor() as executor:  # 使用上下文管理器：ProcessPoolExecutor() as executor
    results = list(executor.map(func, items))  # 赋值变量 results
\`\`\`

## 本章 demo

demo 对比并发方案。`,
    code: `# ============================================
# 第 85 章：并发与并行
# ============================================
import time
import threading
import multiprocessing
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed
from functools import partial

# --- 1. 同步基线 ---
print("=== 1. 同步 ===")
def io_task(n):
    """模拟 IO 任务"""
    import time
    time.sleep(0.05)
    return n * 2

def cpu_task(n):
    """CPU 密集任务"""
    total = 0
    for i in range(n):
        total += i * i
    return total

# 同步执行 IO
start = time.time()
results = [io_task(i) for i in range(10)]
t_sync = time.time() - start
print(f"  同步 10 个 IO 任务: {t_sync:.2f}s")

# 同步执行 CPU
start = time.time()
results = [cpu_task(500_000) for _ in range(4)]
t_sync_cpu = time.time() - start
print(f"  同步 4 个 CPU 任务: {t_sync_cpu:.2f}s")

# --- 2. 多线程 ---
print("\\n=== 2. 多线程 ===")
# IO 任务：多线程有效
start = time.time()
with ThreadPoolExecutor(max_workers=10) as executor:
    results = list(executor.map(io_task, range(10)))
t_thread_io = time.time() - start
print(f"  多线程 10 个 IO: {t_thread_io:.2f}s    ← 比 {t_sync:.2f}s 快")

# CPU 任务：多线程无效（GIL）
start = time.time()
with ThreadPoolExecutor(max_workers=4) as executor:
    results = list(executor.map(cpu_task, [500_000] * 4))
t_thread_cpu = time.time() - start
print(f"  多线程 4 个 CPU: {t_thread_cpu:.2f}s    ← GIL 限制，没加速")

# --- 3. 多进程 ---
print("\\n=== 3. 多进程 ===")
# CPU 任务：多进程有效
# 注意：Windows/Mac 用 spawn，需用 if __name__ == "__main__" 保护
if __name__ == "__main__":
    start = time.time()
    with ProcessPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(cpu_task, [500_000] * 4))
    t_proc_cpu = time.time() - start
    print(f"  多进程 4 个 CPU: {t_proc_cpu:.2f}s    ← 比 {t_sync_cpu:.2f}s 快")

# --- 4. 线程基础 ---
print("\\n=== 4. threading ===")
def worker(name, duration):
    """线程工作函数"""
    print(f"  [{name}] 开始")
    time.sleep(duration)
    print(f"  [{name}] 完成")
    return name

threads = []
for i in range(3):
    t = threading.Thread(target=worker, args=(f"T{i}", 0.05))
    threads.append(t)
    t.start()

# 等所有完成
for t in threads:
    t.join()
print("  全部完成")

# --- 5. 线程锁 ---
print("\\n=== 5. 线程锁 ===")
counter = 0
lock = threading.Lock()

def unsafe_increment(n):
    global counter
    for _ in range(n):
        counter += 1    # 不安全

def safe_increment(lock, n):
    global counter
    for _ in range(n):
        with lock:
            counter += 1

# 不安全
counter = 0
t1 = threading.Thread(target=unsafe_increment, args=(10000,))
t2 = threading.Thread(target=unsafe_increment, args=(10000,))
t1.start(); t2.start()
t1.join(); t2.join()
print(f"  不安全: {counter} (期望 20000)")

# 安全
counter = 0
t1 = threading.Thread(target=safe_increment, args=(lock, 10000))
t2 = threading.Thread(target=safe_increment, args=(lock, 10000))
t1.start(); t2.start()
t1.join(); t2.join()
print(f"  加锁: {counter} (期望 20000)")

# --- 6. as_completed ---
print("\\n=== 6. as_completed ===")
def fetch(url):
    """模拟请求"""
    time.sleep(0.03 + (hash(url) % 5) * 0.01)
    return f"{url}: OK"

urls = [f"url_{i}" for i in range(8)]

with ThreadPoolExecutor(max_workers=4) as executor:
    # 提交所有任务
    future_to_url = {executor.submit(fetch, url): url for url in urls}
    
    # 按完成顺序获取结果
    for future in as_completed(future_to_url):
        url = future_to_url[future]
        result = future.result()
        print(f"  {result}")

# --- 7. 进程基础 ---
print("\\n=== 7. multiprocessing ===")
def square(x):
    return x ** 2

if __name__ == "__main__":
    # 进程池
    with multiprocessing.Pool(processes=4) as pool:
        # map
        results = pool.map(square, range(10))
        print(f"  pool.map: {results}")
        
        # apply_async
        result = pool.apply_async(square, (100,))
        print(f"  apply_async: {result.get()}")

# --- 8. 对比总结 ---
print("\\n=== 8. 总结 ===")
print("  IO 密集任务对比:")
print(f"    同步:        {t_sync:.2f}s")
print(f"    多线程:      {t_thread_io:.2f}s    ← 加速 {t_sync/t_thread_io:.1f}x")

if __name__ == "__main__":
    print("\\n  CPU 密集任务对比:")
    print(f"    同步:        {t_sync_cpu:.2f}s")
    print(f"    多线程:      {t_thread_cpu:.2f}s    ← GIL 限制")
    print(f"    多进程:      {t_proc_cpu:.2f}s    ← 加速 {t_sync_cpu/t_proc_cpu:.1f}x")

# --- 9. 实用：批量下载 ---
print("\\n=== 9. 批量任务 ===")
def process_item(item):
    """模拟处理"""
    time.sleep(0.03)
    return item * 2

items = list(range(10))

# 同步
start = time.time()
sync_results = [process_item(i) for i in items]
t_sync = time.time() - start

# 多线程
start = time.time()
with ThreadPoolExecutor(max_workers=5) as executor:
    thread_results = list(executor.map(process_item, items))
t_thread = time.time() - start

print(f"  10 个任务:")
print(f"  同步:   {t_sync:.2f}s")
print(f"  5线程:  {t_thread:.2f}s    ← 加速 {t_sync/t_thread:.1f}x")
print(f"  结果一致: {sync_results == thread_results}")

# --- 10. 选择指南 ---
print("\\n=== 10. 选择指南 ===")
print("  ┌─────────────────┬──────────────────┐")
print("  │ 任务类型        │ 推荐方案          │")
print("  ├─────────────────┼──────────────────┤")
print("  │ IO 密集（少量）  │ threading         │")
print("  │ IO 密集（大量）  │ asyncio           │")
print("  │ CPU 密集        │ multiprocessing   │")
print("  │ 混合            │ concurrent.futures│")
print("  │ 简单            │ 先同步，再优化    │")
print("  └─────────────────┴──────────────────┘")
print("  原则：先测量找瓶颈，再选方案")`
  },

  // -----------------------------------------------------------
  // 第 86 章：多线程深入
  // -----------------------------------------------------------
  {
    id: "py9-86",
    group: "性能优化",
    icon: "🧵",
    title: "多线程深入：锁、条件变量、队列",
    content: `## threading 模块

\`\`\`python
import threading  # 导入模块 threading
\`\`\`

## Thread 对象

\`\`\`python
t = threading.Thread(target=func, args=(1, 2))  # 赋值变量 t
t.start()    # 启动
t.join()     # 等待完成
t.daemon = True    # 守护线程（主线程退出时自动结束）
\`\`\`

## 线程安全

多线程共享内存，操作共享数据需要同步：

\`\`\`python
lock = threading.Lock()  # 赋值变量 lock
with lock:  # 使用上下文管理器：lock
    # 临界区
    balance += amount  # balance 累加
\`\`\`

## 各种锁

- **Lock**：基本锁
- **RLock**：可重入锁（同一线程可多次 acquire）
- **Semaphore**：信号量（允许多个线程）
- **Event**：事件（通知）
- **Condition**：条件变量（等待/通知）

## Condition 条件变量

\`\`\`python
cond = threading.Condition()  # 赋值变量 cond

# 等待方
with cond:  # 使用上下文管理器：cond
    cond.wait()    # 释放锁，等待通知

# 通知方
with cond:  # 使用上下文管理器：cond
    cond.notify()    # 唤醒一个
    cond.notify_all()    # 唤醒所有
\`\`\`

## Queue：线程安全队列

\`\`\`python
from queue import Queue  # 从 queue 导入 Queue

q = Queue()  # 赋值变量 q
q.put(item)    # 入队（阻塞）
q.get()        # 出队（阻塞）
\`\`\`

Queue 内部有锁，多线程安全。

## 生产者-消费者

\`\`\`python
def producer(q):  # 定义函数 producer，参数：q
    for i in range(10):  # 遍历 range(10)，取值给 i
        q.put(i)  # 调用 q.put()：入队

def consumer(q):  # 定义函数 consumer，参数：q
    while True:  # 当 True 时循环
        item = q.get()  # 赋值变量 item
        process(item)  # 调用 process()
        q.task_done()  # 调用 q.task_done()：标记任务完成

q = Queue()  # 赋值变量 q
# 启动生产者消费者线程
\`\`\`

## 本章 demo

demo 演示线程同步工具。`,
    code: `# ============================================
# 第 86 章：多线程深入
# ============================================
import threading
import time
from queue import Queue
import random

# --- 1. Thread 基础 ---
print("=== 1. Thread ===")
def worker(name, duration):
    print(f"  [{name}] 开始")
    time.sleep(duration)
    print(f"  [{name}] 完成")

# 创建并启动
threads = []
for i in range(3):
    t = threading.Thread(target=worker, args=(f"T{i}", 0.1))
    threads.append(t)
    t.start()

# 当前线程
print(f"  主线程: {threading.current_thread().name}")
print(f"  活跃线程数: {threading.active_count()}")

# 等待所有完成
for t in threads:
    t.join()
print("  全部完成")

# --- 2. daemon 守护线程 ---
print("\\n=== 2. daemon ===")
def background():
    while True:
        print("  [后台] 运行中...")
        time.sleep(0.05)

# daemon=True，主线程退出时自动结束
t = threading.Thread(target=background, daemon=True)
t.start()
time.sleep(0.15)
print("  主线程结束，daemon 线程会被强制结束")

# --- 3. Lock ---
print("\\n=== 3. Lock ===")
counter = 0
lock = threading.Lock()

def unsafe_inc(n):
    global counter
    for _ in range(n):
        counter += 1

def safe_inc(n):
    global counter
    for _ in range(n):
        with lock:
            counter += 1

# 不安全
counter = 0
t1 = threading.Thread(target=unsafe_inc, args=(50000,))
t2 = threading.Thread(target=unsafe_inc, args=(50000,))
t1.start(); t2.start()
t1.join(); t2.join()
print(f"  不安全: {counter} (期望 100000)")

# 安全
counter = 0
t1 = threading.Thread(target=safe_inc, args=(50000,))
t2 = threading.Thread(target=safe_inc, args=(50000,))
t1.start(); t2.start()
t1.join(); t2.join()
print(f"  加锁: {counter} (期望 100000)")

# --- 4. RLock 可重入锁 ---
print("\\n=== 4. RLock ===")
rlock = threading.RLock()

def func_a():
    with rlock:
        print("  func_a 获取锁")
        func_b()    # 同一线程再次获取，RLock 允许

def func_b():
    with rlock:
        print("  func_b 获取锁（重入）")

func_a()

# Lock 不行
lock2 = threading.Lock()
# def func_a2():
#     with lock2:
#         with lock2:    # 死锁！
#             pass

# --- 5. Semaphore 信号量 ---
print("\\n=== 5. Semaphore ===")
# 限制同时 3 个线程
sem = threading.Semaphore(3)

def limited_worker(name):
    with sem:
        print(f"  [{name}] 获取信号量")
        time.sleep(0.1)
        print(f"  [{name}] 释放")

threads = [threading.Thread(target=limited_worker, args=(f"W{i}",)) for i in range(6)]
start_time = time.time()
for t in threads:
    t.start()
for t in threads:
    t.join()
elapsed = time.time() - start_time
print(f"  6 任务，限 3 并发，耗时 {elapsed:.2f}s（预期约 0.2s）")

# --- 6. Event ---
print("\\n=== 6. Event ===")
event = threading.Event()

def waiter(name):
    print(f"  [{name}] 等待事件")
    event.wait()    # 阻塞直到 set
    print(f"  [{name}] 收到事件")

# 启动 3 个等待者
threads = [threading.Thread(target=waiter, args=(f"W{i}",)) for i in range(3)]
for t in threads:
    t.start()

time.sleep(0.1)
print("  [main] 触发事件")
event.set()    # 触发

for t in threads:
    t.join()

# --- 7. Condition ---
print("\\n=== 7. Condition ===")
cond = threading.Condition()
items = []

def producer_cond():
    """生产者"""
    for i in range(5):
        with cond:
            items.append(i)
            print(f"  [生产] {i}")
            cond.notify()    # 通知一个等待者
        time.sleep(0.05)

def consumer_cond():
    """消费者"""
    with cond:
        while len(items) < 3:
            print(f"  [消费] 等待（当前 {len(items)}）")
            cond.wait()
        print(f"  [消费] 凑齐 3 个: {items[:]}")

# 启动消费者先
tc = threading.Thread(target=consumer_cond)
tc.start()
time.sleep(0.05)

# 启动生产者
tp = threading.Thread(target=producer_cond)
tp.start()

tp.join()
tc.join()

# --- 8. Queue 线程安全 ---
print("\\n=== 8. Queue ===")
q = Queue(maxsize=5)

def producer_q(name, count):
    """生产者"""
    for i in range(count):
        item = f"{name}-{i}"
        q.put(item)    # 队列满会阻塞
        print(f"  [生产 {name}] {item}")
        time.sleep(0.02)

def consumer_q(name):
    """消费者"""
    while True:
        item = q.get()    # 队列空会阻塞
        if item is None:    # 结束信号
            q.task_done()
            break
        print(f"  [消费 {name}] {item}")
        time.sleep(0.03)
        q.task_done()

# 启动消费者
consumers = []
for i in range(2):
    t = threading.Thread(target=consumer_q, args=(f"C{i}",))
    t.start()
    consumers.append(t)

# 启动生产者
producers = []
for i in range(2):
    t = threading.Thread(target=producer_q, args=(f"P{i}", 5))
    t.start()
    producers.append(t)

# 等生产者完成
for t in producers:
    t.join()

# 发送结束信号
for _ in consumers:
    q.put(None)

for t in consumers:
    t.join()
print("  全部完成")

# --- 9. 线程局部存储 ---
print("\\n=== 9. ThreadLocal ===")
local_data = threading.local()

def worker_tl(name):
    local_data.value = name    # 每个线程独立
    time.sleep(0.05)
    print(f"  [{name}] local = {local_data.value}")

threads = [threading.Thread(target=worker_tl, args=(f"T{i}",)) for i in range(3)]
for t in threads:
    t.start()
for t in threads:
    t.join()

# --- 10. 综合实战：爬虫调度 ---
print("\\n=== 10. 综合：爬虫 ===")
class Crawler:
    """简化的爬虫调度器"""
    def __init__(self, max_workers=3):
        self.q = Queue()
        self.results = []
        self.results_lock = threading.Lock()
        self.max_workers = max_workers
    
    def crawl(self, urls):
        # 启动 worker
        threads = []
        for i in range(self.max_workers):
            t = threading.Thread(target=self._worker, args=(f"W{i}",))
            t.start()
            threads.append(t)
        
        # 加入任务
        for url in urls:
            self.q.put(url)
        
        # 等所有任务完成
        self.q.join()
        
        # 停止 worker
        for _ in range(self.max_workers):
            self.q.put(None)
        for t in threads:
            t.join()
        
        return self.results
    
    def _worker(self, name):
        while True:
            url = self.q.get()
            if url is None:
                self.q.task_done()
                break
            
            # 模拟爬取
            time.sleep(0.05)
            result = f"[{name}] {url}: OK"
            
            with self.results_lock:
                self.results.append(result)
            
            self.q.task_done()

crawler = Crawler(max_workers=3)
urls = [f"https://example.com/{i}" for i in range(10)]

start = time.time()
results = crawler.crawl(urls)
elapsed = time.time() - start

print(f"  爬取 {len(urls)} 个 URL，3 并发:")
print(f"  耗时: {elapsed:.2f}s")
print(f"  结果:")
for r in results:
    print(f"    {r}")`
  },

  // -----------------------------------------------------------
  // 第 87 章：多进程编程
  // -----------------------------------------------------------
  {
    id: "py9-87",
    group: "性能优化",
    icon: "⚙️",
    title: "多进程编程：绕过 GIL",
    content: `## multiprocessing 模块

\`\`\`python
import multiprocessing  # 导入模块 multiprocessing
\`\`\`

多进程是 Python 实现 CPU 并行的唯一方式（因为 GIL）。

## Process 对象

\`\`\`python
p = multiprocessing.Process(target=func, args=(1, 2))  # 赋值变量 p
p.start()  # 调用 p.start()：启动
p.join()  # 调用 p.join()：等待所有任务完成
\`\`\`

## Pool 进程池

\`\`\`python
with multiprocessing.Pool(processes=4) as pool:  # 使用上下文管理器：multiprocessing.Pool(processes=4) as pool
    results = pool.map(func, items)  # 赋值变量 results
    # 或
    results = pool.starmap(func, [(1, 2), (3, 4)])  # 赋值变量 results
\`\`\`

## 进程间通信

进程不共享内存，需要用：
- **Queue**：多进程安全的队列
- **Pipe**：管道
- **Value/Array**：共享内存
- **Manager**：共享对象

\`\`\`python
# Queue
q = multiprocessing.Queue()  # 赋值变量 q
q.put(item)  # 调用 q.put()：入队
q.get()  # 调用 q.get()：出队

# Pipe
parent_conn, child_conn = multiprocessing.Pipe()  # 多重赋值：parent_conn, child_conn
parent_conn.send(x)  # 调用 parent_conn.send()：发送
child_conn.recv()  # 调用 child_conn.recv()：接收
\`\`\`

## 进程 vs 线程

| | 进程 | 线程 |
|---|---|---|
| 内存 | 独立 | 共享 |
| 通信 | 需 IPC | 直接共享 |
| 创建开销 | 大 | 小 |
| GIL | 不受限 | 受限 |
| 适用 | CPU 密集 | IO 密集 |

## 注意事项

1. Windows/Mac 用 spawn，需 \`if __name__ == "__main__":\` 保护
2. 参数必须可 pickle
3. 进程开销大，别频繁创建销毁
4. 用 Pool 复用进程

## 本章 demo

demo 演示多进程各种用法。`,
    code: `# ============================================
# 第 87 章：多进程编程
# ============================================
import multiprocessing as mp
import time
import os
from concurrent.futures import ProcessPoolExecutor

# --- 1. Process 基础 ---
print("=== 1. Process ===")
def worker(name):
    print(f"  [{name}] PID={os.getpid()}, 父PID={os.getppid()}")
    time.sleep(0.1)
    print(f"  [{name}] 完成")

if __name__ == "__main__":
    processes = []
    for i in range(3):
        p = mp.Process(target=worker, args=(f"P{i}",))
        processes.append(p)
        p.start()
    
    for p in processes:
        p.join()
    print(f"  主进程 PID={os.getpid()}")

# --- 2. Pool ---
print("\\n=== 2. Pool ===")
def square(x):
    return x ** 2

def add(a, b):
    return a + b

if __name__ == "__main__":
    with mp.Pool(processes=4) as pool:
        # map
        results = pool.map(square, range(10))
        print(f"  map: {results}")
        
        # 异步
        result = pool.apply_async(square, (100,))
        print(f"  apply_async: {result.get()}")
        
        # starmap：多参数
        results = pool.starmap(add, [(1, 2), (3, 4), (5, 6)])
        print(f"  starmap: {results}")

# --- 3. CPU 密集对比 ---
print("\\n=== 3. CPU 密集 ===")
def cpu_heavy(n):
    """CPU 密集任务"""
    total = 0
    for i in range(n):
        total += i * i
    return total

if __name__ == "__main__":
    N = 2_000_000
    n_tasks = 4
    
    # 单进程
    start = time.time()
    results = [cpu_heavy(N) for _ in range(n_tasks)]
    t_single = time.time() - start
    
    # 多进程
    start = time.time()
    with mp.Pool(processes=n_tasks) as pool:
        results = pool.map(cpu_heavy, [N] * n_tasks)
    t_multi = time.time() - start
    
    print(f"  {n_tasks} 个 CPU 任务，每个 {N:,} 次循环:")
    print(f"  单进程: {t_single:.2f}s")
    print(f"  {n_tasks} 进程: {t_multi:.2f}s    ← 加速 {t_single/t_multi:.1f}x")

# --- 4. 进程间通信 Queue ---
print("\\n=== 4. Queue ===")
def producer_q(q):
    """生产者进程"""
    for i in range(5):
        q.put(f"item-{i}")
        time.sleep(0.05)
    q.put(None)    # 结束信号

def consumer_q(q):
    """消费者进程"""
    while True:
        item = q.get()
        if item is None:
            break
        print(f"  [消费] {item} (PID={os.getpid()})")

if __name__ == "__main__":
    q = mp.Queue()
    p1 = mp.Process(target=producer_q, args=(q,))
    p2 = mp.Process(target=consumer_q, args=(q,))
    p1.start()
    p2.start()
    p1.join()
    p2.join()

# --- 5. Pipe ---
print("\\n=== 5. Pipe ===")
def sender(conn):
    """发送端"""
    for i in range(3):
        conn.send(f"消息 {i}")
        time.sleep(0.05)
    conn.send(None)    # 结束
    conn.close()

def receiver(conn):
    """接收端"""
    while True:
        msg = conn.recv()
        if msg is None:
            break
        print(f"  [收到] {msg}")
    conn.close()

if __name__ == "__main__":
    parent_conn, child_conn = mp.Pipe()
    p1 = mp.Process(target=sender, args=(parent_conn,))
    p2 = mp.Process(target=receiver, args=(child_conn,))
    p1.start()
    p2.start()
    p1.join()
    p2.join()

# --- 6. 共享内存 ---
print("\\n=== 6. 共享内存 ===")
def increment(counter, lock, n):
    """增加共享计数器"""
    for _ in range(n):
        with lock:
            counter.value += 1

if __name__ == "__main__":
    counter = mp.Value("i", 0)    # 共享整数
    lock = mp.Lock()
    
    processes = []
    for _ in range(4):
        p = mp.Process(target=increment, args=(counter, lock, 10000))
        processes.append(p)
        p.start()
    
    for p in processes:
        p.join()
    
    print(f"  4 进程各加 10000: counter = {counter.value} (期望 40000)")

# --- 7. Manager 共享对象 ---
print("\\n=== 7. Manager ===")
def add_item(shared_list, item):
    shared_list.append(item)

if __name__ == "__main__":
    with mp.Manager() as manager:
        shared_list = manager.list()
        
        processes = []
        for i in range(5):
            p = mp.Process(target=add_item, args=(shared_list, f"item-{i}"))
            processes.append(p)
            p.start()
        
        for p in processes:
            p.join()
        
        print(f"  共享列表: {list(shared_list)}")

# --- 8. ProcessPoolExecutor ===
print("\\n=== 8. ProcessPoolExecutor ===")
def process_data(data):
    """处理数据"""
    time.sleep(0.05)
    return sum(data)

if __name__ == "__main__":
    data_chunks = [list(range(100)) for _ in range(10)]
    
    start = time.time()
    with ProcessPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(process_data, data_chunks))
    t = time.time() - start
    
    print(f"  10 个任务，4 进程: {t:.2f}s")
    print(f"  结果: {results}")

# --- 9. 进程 vs 线程 对比 ---
print("\\n=== 9. 对比 ===")
def io_task(n):
    time.sleep(0.1)
    return n

def cpu_task(n):
    return sum(i * i for i in range(n))

if __name__ == "__main__":
    import threading
    
    # IO 任务
    print("  IO 任务（10个，每个 0.1s）:")
    
    start = time.time()
    for i in range(10):
        io_task(i)
    print(f"    同步: {time.time()-start:.2f}s")
    
    start = time.time()
    threads = [threading.Thread(target=io_task, args=(i,)) for i in range(10)]
    for t in threads: t.start()
    for t in threads: t.join()
    print(f"    10线程: {time.time()-start:.2f}s    ← IO 适合线程")
    
    # CPU 任务
    print("\\n  CPU 任务（4个，每个 200万）:")
    
    start = time.time()
    for _ in range(4):
        cpu_task(2_000_000)
    t_sync = time.time() - start
    print(f"    同步: {t_sync:.2f}s")
    
    start = time.time()
    threads = [threading.Thread(target=cpu_task, args=(2_000_000,)) for _ in range(4)]
    for t in threads: t.start()
    for t in threads: t.join()
    t_thread = time.time() - start
    print(f"    4线程: {t_thread:.2f}s    ← GIL 限制")
    
    start = time.time()
    with mp.Pool(4) as pool:
        pool.map(cpu_task, [2_000_000] * 4)
    t_proc = time.time() - start
    print(f"    4进程: {t_proc:.2f}s    ← 真并行")

# --- 10. 综合实战 ===
print("\\n=== 10. 综合：并行数据处理 ===")
def analyze_chunk(chunk):
    """分析数据块"""
    time.sleep(0.05)    # 模拟计算
    return {
        "count": len(chunk),
        "sum": sum(chunk),
        "max": max(chunk) if chunk else 0,
        "min": min(chunk) if chunk else 0,
    }

if __name__ == "__main__":
    # 模拟大数据
    big_data = list(range(10000))
    # 分块
    chunk_size = 1000
    chunks = [big_data[i:i+chunk_size] for i in range(0, len(big_data), chunk_size)]
    
    print(f"  数据: {len(big_data)} 项，分 {len(chunks)} 块")
    
    # 串行
    start = time.time()
    results_serial = [analyze_chunk(c) for c in chunks]
    t_serial = time.time() - start
    
    # 并行
    start = time.time()
    with ProcessPoolExecutor(max_workers=4) as executor:
        results_parallel = list(executor.map(analyze_chunk, chunks))
    t_parallel = time.time() - start
    
    print(f"  串行: {t_serial:.2f}s")
    print(f"  并行: {t_parallel:.2f}s    ← 加速 {t_serial/t_parallel:.1f}x")
    
    # 合并结果
    total_count = sum(r["count"] for r in results_parallel)
    total_sum = sum(r["sum"] for r in results_parallel)
    print(f"  总数: {total_count}, 总和: {total_sum}")`
  },

  // -----------------------------------------------------------
  // 第 88 章：Web 开发入门
  // -----------------------------------------------------------
  {
    id: "py9-88",
    group: "实战进阶",
    icon: "🌐",
    title: "Web 开发入门：HTTP 与框架",
    content: `## Web 应用基础

浏览器（客户端）和服务器通过 HTTP 协议通信：

\`\`\`
浏览器 --请求--> 服务器
浏览器 <--响应-- 服务器
\`\`\`

## HTTP 请求方法

- **GET**：获取资源
- **POST**：提交数据
- **PUT**：更新资源
- **DELETE**：删除资源

## HTTP 状态码

- 2xx：成功（200 OK）
- 3xx：重定向（302）
- 4xx：客户端错误（404 Not Found, 400 Bad Request）
- 5xx：服务器错误（500 Internal Server Error）

## Python Web 框架

- **Flask**：轻量，简单
- **Django**：全功能，大项目
- **FastAPI**：现代，异步，带类型
- **Tornado**：异步，长连接

## Flask 示例

\`\`\`python
from flask import Flask, request, jsonify  # 从 flask 导入 Flask, request, jsonify

app = Flask(__name__)  # 赋值变量 app

@app.route("/")  # 应用装饰器 app
def home():  # 定义函数 home
    return "Hello"  # 返回 "Hello"

@app.route("/api/users/<int:user_id>")  # 应用装饰器 app
def get_user(user_id):  # 定义函数 get_user，参数：user_id
    return jsonify({"id": user_id, "name": "小明"})  # 返回 jsonify({"id": user_id, "name": "小明"})

@app.route("/api/users", methods=["POST"])  # 应用装饰器 app
def create_user():  # 定义函数 create_user
    data = request.get_json()  # 赋值变量 data
    return jsonify(data), 201  # 返回 jsonify(data), 201

if __name__ == "__main__":  # 如果 __name__ == "__main__"
    app.run(debug=True)  # 调用 app.run()：运行
\`\`\`

## WSGI 与 ASGI

- **WSGI**：同步接口（Flask, Django）
- **ASGI**：异步接口（FastAPI, 新 Django）

## 本章 demo

demo 用标准库 http.server 写简单 Web 服务。`,
    code: `# ============================================
# 第 88 章：Web 开发入门
# ============================================
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import time
import urllib.request
import urllib.parse

# --- 1. HTTP 基础 ---
print("=== 1. HTTP 基础 ===")
print("  HTTP 方法:")
methods = {
    "GET": "获取资源",
    "POST": "提交数据",
    "PUT": "更新资源",
    "DELETE": "删除资源",
    "PATCH": "部分更新",
    "HEAD": "只取头",
    "OPTIONS": "查询支持的方法",
}
for m, d in methods.items():
    print(f"    {m}: {d}")

print("\\n  状态码:")
codes = {
    "200": "OK",
    "201": "Created",
    "204": "No Content",
    "301": "Moved Permanently",
    "302": "Found",
    "304": "Not Modified",
    "400": "Bad Request",
    "401": "Unauthorized",
    "403": "Forbidden",
    "404": "Not Found",
    "405": "Method Not Allowed",
    "500": "Internal Server Error",
    "502": "Bad Gateway",
    "503": "Service Unavailable",
}
for c, d in codes.items():
    print(f"    {c}: {d}")

# --- 2. 简单 HTTP 服务器 ---
print("\\n=== 2. HTTP 服务器 ===")

# 模拟数据库
users_db = {
    1: {"id": 1, "name": "小明", "age": 18},
    2: {"id": 2, "name": "小红", "age": 20},
}

class APIHandler(BaseHTTPRequestHandler):
    """简单 REST API"""
    
    def log_message(self, format, *args):
        """简化日志"""
        pass
    
    def _send_json(self, data, status=200):
        """发送 JSON 响应"""
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))
    
    def do_GET(self):
        """处理 GET"""
        parsed = urlparse(self.path)
        
        if parsed.path == "/":
            self._send_json({"message": "API 服务运行中", "version": "1.0"})
        
        elif parsed.path == "/api/users":
            # 列出所有用户
            self._send_json(list(users_db.values()))
        
        elif parsed.path.startswith("/api/users/"):
            # 获取单个用户
            try:
                user_id = int(parsed.path.split("/")[-1])
                if user_id in users_db:
                    self._send_json(users_db[user_id])
                else:
                    self._send_json({"error": "用户不存在"}, 404)
            except ValueError:
                self._send_json({"error": "无效 ID"}, 400)
        
        elif parsed.path == "/api/search":
            # 搜索
            query = parse_qs(parsed.query)
            keyword = query.get("q", [""])[0]
            results = [u for u in users_db.values() if keyword in u["name"]]
            self._send_json(results)
        
        else:
            self._send_json({"error": "Not Found"}, 404)
    
    def do_POST(self):
        """处理 POST"""
        if self.path == "/api/users":
            # 创建用户
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            try:
                data = json.loads(body)
                new_id = max(users_db.keys()) + 1
                user = {"id": new_id, "name": data.get("name", ""), "age": data.get("age", 0)}
                users_db[new_id] = user
                self._send_json(user, 201)
            except json.JSONDecodeError:
                self._send_json({"error": "无效 JSON"}, 400)
        else:
            self._send_json({"error": "Not Found"}, 404)
    
    def do_DELETE(self):
        """处理 DELETE"""
        if self.path.startswith("/api/users/"):
            try:
                user_id = int(self.path.split("/")[-1])
                if user_id in users_db:
                    del users_db[user_id]
                    self._send_json({"message": "已删除"})
                else:
                    self._send_json({"error": "用户不存在"}, 404)
            except ValueError:
                self._send_json({"error": "无效 ID"}, 400)

# 启动服务器（后台）
server = HTTPServer(("localhost", 8888), APIHandler)
server_thread = threading.Thread(target=server.serve_forever, daemon=True)
server_thread.start()
print("  服务器运行在 http://localhost:8888")
time.sleep(0.2)

# --- 3. 客户端请求 ---
print("\\n=== 3. 客户端请求 ===")
def request(url, method="GET", data=None):
    """发 HTTP 请求"""
    if data:
        body = json.dumps(data).encode("utf-8")
        req = urllib.request.Request(
            url, data=body, method=method,
            headers={"Content-Type": "application/json"}
        )
    else:
        req = urllib.request.Request(url, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            body = response.read().decode("utf-8")
            return status, json.loads(body)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        return e.code, json.loads(body)

# GET /
status, data = request("http://localhost:8888/")
print(f"  GET / → {status}")
print(f"    {data}")

# GET /api/users
status, data = request("http://localhost:8888/api/users")
print(f"\\n  GET /api/users → {status}")
for u in data:
    print(f"    {u}")

# GET /api/users/1
status, data = request("http://localhost:8888/api/users/1")
print(f"\\n  GET /api/users/1 → {status}")
print(f"    {data}")

# GET 不存在的用户
status, data = request("http://localhost:8888/api/users/99")
print(f"\\n  GET /api/users/99 → {status}")
print(f"    {data}")

# --- 4. POST 创建 ---
print("\\n=== 4. POST 创建 ===")
status, data = request(
    "http://localhost:8888/api/users",
    method="POST",
    data={"name": "小刚", "age": 22}
)
print(f"  POST /api/users → {status}")
print(f"    {data}")

# 查看所有
status, data = request("http://localhost:8888/api/users")
print(f"\\n  现在所有用户:")
for u in data:
    print(f"    {u}")

# --- 5. 搜索 ---
print("\\n=== 5. 搜索 ===")
status, data = request("http://localhost:8888/api/search?q=" + urllib.parse.quote("小"))
print(f"  GET /api/search?q=小 → {status}")
for u in data:
    print(f"    {u}")

# --- 6. DELETE 删除 ---
print("\\n=== 6. DELETE ===")
status, data = request("http://localhost:8888/api/users/1", method="DELETE")
print(f"  DELETE /api/users/1 → {status}")
print(f"    {data}")

# 再查
status, data = request("http://localhost:8888/api/users")
print(f"\\n  剩余用户:")
for u in data:
    print(f"    {u}")

# --- 7. RESTful 设计 ---
print("\\n=== 7. RESTful ===")
print("  RESTful API 设计:")
routes = [
    ("GET",    "/api/users",        "获取用户列表"),
    ("GET",    "/api/users/:id",    "获取单个用户"),
    ("POST",   "/api/users",        "创建用户"),
    ("PUT",    "/api/users/:id",    "更新用户"),
    ("PATCH",  "/api/users/:id",    "部分更新"),
    ("DELETE", "/api/users/:id",    "删除用户"),
    ("GET",    "/api/users/:id/posts", "获取用户的文章"),
]
print(f"  {'方法':<8} {'路径':<30} {'说明'}")
for method, path, desc in routes:
    print(f"  {method:<8} {path:<30} {desc}")

# --- 8. 框架对比 ---
print("\\n=== 8. 框架 ===")
frameworks = [
    ("Flask", "轻量，灵活", "小中型项目，快速原型"),
    ("Django", "全功能，ORM", "大项目，内容管理"),
    ("FastAPI", "异步，类型", "API 服务，高性能"),
    ("Tornado", "异步，长连接", "WebSocket，实时"),
    ("Bottle", "单文件", "极简项目"),
]
print(f"  {'框架':<10} {'特点':<20} {'适用'}")
for name, feature, use in frameworks:
    print(f"  {name:<10} {feature:<20} {use}")

# 关闭服务器
server.shutdown()
print("\\n  服务器已关闭")`
  },

  // -----------------------------------------------------------
  // 第 89 章：数据库操作
  // -----------------------------------------------------------
  {
    id: "py9-89",
    group: "实战进阶",
    icon: "🗄️",
    title: "数据库操作：SQLite 与 ORM",
    content: `## SQLite：Python 自带

\`\`\`python
import sqlite3  # 导入模块 sqlite3
conn = sqlite3.connect("test.db")  # 赋值变量 conn
cursor = conn.cursor()  # 赋值变量 cursor
cursor.execute("CREATE TABLE ...")  # 调用 cursor.execute()
conn.commit()  # 调用 conn.commit()
conn.close()  # 调用 conn.close()：关闭
\`\`\`

SQLite 是文件型数据库，无需安装服务，适合小项目和学习。

## 基本操作

\`\`\`python
# 建表
cursor.execute("""
    CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        name TEXT,
        age INTEGER
    )
""")

# 插入
cursor.execute("INSERT INTO users (name, age) VALUES (?, ?)", ("小明", 18))  # 调用 cursor.execute()

# 查询
cursor.execute("SELECT * FROM users")  # 调用 cursor.execute()
rows = cursor.fetchall()  # 赋值变量 rows

# 更新
cursor.execute("UPDATE users SET age = ? WHERE id = ?", (20, 1))  # 调用 cursor.execute()

# 删除
cursor.execute("DELETE FROM users WHERE id = ?", (1,))  # 调用 cursor.execute()
\`\`\`

⚠️ 用参数化查询 \`?\` 防止 SQL 注入，不要用字符串拼接。

## 上下文管理器

\`\`\`python
with sqlite3.connect("test.db") as conn:  # 使用上下文管理器：sqlite3.connect("test.db") as conn
    # 自动 commit / rollback
    conn.execute("...")  # 调用 conn.execute()
\`\`\`

## Row 对象

\`\`\`python
conn.row_factory = sqlite3.Row  # 执行操作
row = cursor.fetchone()  # 赋值变量 row
row["name"]    # 像字典一样访问
\`\`\`

## 事务

\`\`\`python
try:  # 尝试执行可能出错的代码
    cursor.execute(...)  # 调用 cursor.execute()
    conn.commit()  # 调用 conn.commit()
except:  # 捕获异常
    conn.rollback()  # 调用 conn.rollback()
\`\`\`

## ORM：SQLAlchemy

\`\`\`python
from sqlalchemy import create_engine, Column, Integer, String  # 从 sqlalchemy 导入 create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, Session  # 从 sqlalchemy.orm 导入 declarative_base, Session

Base = declarative_base()  # 赋值变量 Base

class User(Base):  # 定义类 User
    __tablename__ = "users"  # 定义字符串 __tablename__
    id = Column(Integer, primary_key=True)  # 赋值变量 id
    name = Column(String)  # 赋值变量 name

engine = create_engine("sqlite:///test.db")  # 赋值变量 engine
Base.metadata.create_all(engine)  # 执行操作

with Session(engine) as session:  # 使用上下文管理器：Session(engine) as session
    user = User(name="小明")  # 赋值变量 user
    session.add(user)  # 调用 session.add()：添加元素
    session.commit()  # 调用 session.commit()
\`\`\`

## 本章 demo

demo 用 SQLite 实现完整 CRUD。`,
    code: `# ============================================
# 第 89 章：数据库操作
# ============================================
import sqlite3
import tempfile
import os

# --- 1. 连接与建表 ---
print("=== 1. 建表 ===")
db_path = tempfile.mktemp(suffix=".db")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 建表
cursor.execute("""
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    grade TEXT,
    score REAL
)
""")

# 看表结构
cursor.execute("PRAGMA table_info(students)")
print("  表结构:")
for col in cursor.fetchall():
    print(f"    {col}")

conn.commit()

# --- 2. 插入数据 ---
print("\\n=== 2. 插入 ===")
# 单条
cursor.execute(
    "INSERT INTO students (name, age, grade, score) VALUES (?, ?, ?, ?)",
    ("小明", 18, "高三", 90.5)
)
print(f"  插入小明，ID = {cursor.lastrowid}")

# 多条
students = [
    ("小红", 17, "高三", 95.0),
    ("小刚", 18, "高三", 78.5),
    ("小亮", 17, "高二", 88.0),
    ("小美", 18, "高三", 92.5),
]
cursor.executemany(
    "INSERT INTO students (name, age, grade, score) VALUES (?, ?, ?, ?)",
    students
)
print(f"  批量插入 {len(students)} 条")
conn.commit()

# --- 3. 查询 ---
print("\\n=== 3. 查询 ===")
# 全部
cursor.execute("SELECT * FROM students")
rows = cursor.fetchall()
print(f"  所有学生 ({len(rows)}):")
for r in rows:
    print(f"    {r}")

# 条件查询
cursor.execute("SELECT name, score FROM students WHERE score >= ?", (90,))
print(f"\\n  90分以上:")
for r in cursor.fetchall():
    print(f"    {r}")

# 排序
cursor.execute("SELECT name, score FROM students ORDER BY score DESC")
print(f"\\n  按分数降序:")
for r in cursor.fetchall():
    print(f"    {r}")

# 限制
cursor.execute("SELECT name, score FROM students ORDER BY score DESC LIMIT 3")
print(f"\\n  前三名:")
for r in cursor.fetchall():
    print(f"    {r}")

# 聚合
cursor.execute("""
    SELECT grade, COUNT(*) as count, AVG(score) as avg_score
    FROM students
    GROUP BY grade
""")
print(f"\\n  按年级分组:")
for r in cursor.fetchall():
    print(f"    {r}")

# --- 4. Row 对象 ---
print("\\n=== 4. Row ===")
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

cursor.execute("SELECT * FROM students WHERE name = ?", ("小明",))
row = cursor.fetchone()
print(f"  类型: {type(row).__name__}")
print(f"  row['name'] = {row['name']}")
print(f"  row['score'] = {row['score']}")
print(f"  row.keys() = {row.keys()}")

# --- 5. 更新 ---
print("\\n=== 5. 更新 ===")
cursor.execute("UPDATE students SET score = ? WHERE name = ?", (95.5, "小明"))
print(f"  更新了 {cursor.rowcount} 行")
conn.commit()

# 验证
cursor.execute("SELECT name, score FROM students WHERE name = ?", ("小明",))
print(f"  小明现在: {cursor.fetchone()}")

# --- 6. 删除 ---
print("\\n=== 6. 删除 ===")
cursor.execute("DELETE FROM students WHERE score < ?", (80.0,))
print(f"  删除了 {cursor.rowcount} 行（80 分以下）")
conn.commit()

# 查看剩余
cursor.execute("SELECT name, score FROM students ORDER BY score DESC")
print(f"  剩余:")
for r in cursor.fetchall():
    print(f"    {r['name']}: {r['score']}")

# --- 7. 事务 ---
print("\\n=== 7. 事务 ===")
try:
    cursor.execute("INSERT INTO students (name, age) VALUES (?, ?)", ("测试1", 18))
    cursor.execute("INSERT INTO students (name, age) VALUES (?, ?)", ("测试2", 18))
    # 故意制造错误（重复 ID）
    cursor.execute("INSERT INTO students (id, name) VALUES (?, ?)", (1, "重复ID"))
    conn.commit()
except sqlite3.IntegrityError as e:
    print(f"  事务失败: {e}")
    conn.rollback()
    print("  已回滚")

# 验证回滚
cursor.execute("SELECT COUNT(*) FROM students WHERE name LIKE '测试%'")
print(f"  测试数据数量: {cursor.fetchone()[0]}（应为 0，已回滚）")

# --- 8. SQL 注入防护 ---
print("\\n=== 8. SQL 注入 ===")
# ❌ 危险：字符串拼接
# name = "'; DROP TABLE students; --"
# cursor.execute(f"SELECT * FROM students WHERE name = '{name}'")  # 危险！

# ✅ 安全：参数化
name = "小明"
cursor.execute("SELECT * FROM students WHERE name = ?", (name,))
print(f"  参数化查询安全")

# 演示
malicious = "'; DROP TABLE students; --"
cursor.execute("SELECT * FROM students WHERE name = ?", (malicious,))
print(f"  恶意输入被当字符串: 找到 {len(cursor.fetchall())} 条")

# --- 9. 实用：封装数据库类 ---
print("\\n=== 9. 封装 ===")
class StudentDB:
    """学生数据库封装"""
    def __init__(self, db_path):
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        self._init_db()
    
    def _init_db(self):
        """初始化表"""
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                age INTEGER,
                score REAL
            )
        """)
        self.conn.commit()
    
    def add(self, name, age, score):
        """添加学生"""
        cursor = self.conn.execute(
            "INSERT INTO students (name, age, score) VALUES (?, ?, ?)",
            (name, age, score)
        )
        self.conn.commit()
        return cursor.lastrowid
    
    def get(self, student_id):
        """查询单个"""
        cursor = self.conn.execute(
            "SELECT * FROM students WHERE id = ?", (student_id,)
        )
        return cursor.fetchone()
    
    def get_all(self):
        """查询所有"""
        cursor = self.conn.execute("SELECT * FROM students ORDER BY id")
        return cursor.fetchall()
    
    def update_score(self, student_id, score):
        """更新成绩"""
        cursor = self.conn.execute(
            "UPDATE students SET score = ? WHERE id = ?",
            (score, student_id)
        )
        self.conn.commit()
        return cursor.rowcount
    
    def delete(self, student_id):
        """删除"""
        cursor = self.conn.execute(
            "DELETE FROM students WHERE id = ?", (student_id,)
        )
        self.conn.commit()
        return cursor.rowcount
    
    def search(self, keyword):
        """搜索"""
        cursor = self.conn.execute(
            "SELECT * FROM students WHERE name LIKE ?", (f"%{keyword}%",)
        )
        return cursor.fetchall()
    
    def close(self):
        self.conn.close()

# 使用
db_path2 = tempfile.mktemp(suffix=".db")
db = StudentDB(db_path2)

# 添加
id1 = db.add("张三", 18, 85.5)
id2 = db.add("李四", 19, 92.0)
id3 = db.add("张伟", 18, 78.0)
print(f"  添加 3 个学生: ID = {id1}, {id2}, {id3}")

# 查询
print(f"\\n  所有学生:")
for s in db.get_all():
    print(f"    {s['id']}: {s['name']}, {s['age']}岁, {s['score']}分")

# 更新
db.update_score(id1, 90.0)
print(f"\\n  更新后:")
print(f"    {dict(db.get(id1))}")

# 搜索
print(f"\\n  搜索 '张':")
for s in db.search("张"):
    print(f"    {s['name']}: {s['score']}分")

# 删除
db.delete(id3)
print(f"\\n  删除后剩余 {len(db.get_all())} 个")

db.close()

# --- 10. 清理 ---
conn.close()
os.unlink(db_path)
os.unlink(db_path2)
print("\\n  数据库已清理")

# --- 11. 其他数据库 ---
print("\\n=== 11. 其他数据库 ===")
dbs = [
    ("SQLite", "sqlite3", "文件型，无需服务"),
    ("MySQL", "pymysql / mysqlclient", "服务型，Web 常用"),
    ("PostgreSQL", "psycopg2", "功能强大"),
    ("Redis", "redis-py", "内存数据库，缓存"),
    ("MongoDB", "pymongo", "文档型 NoSQL"),
]
print(f"  {'数据库':<15} {'驱动':<25} {'特点'}")
for name, driver, feature in dbs:
    print(f"  {name:<15} {driver:<25} {feature}")`
  },

  // -----------------------------------------------------------
  // 第 90 章：API 设计
  // -----------------------------------------------------------
  {
    id: "py9-90",
    group: "实战进阶",
    icon: "📐",
    title: "API 设计原则与实践",
    content: `## 什么是好 API

- **一致**：命名、参数顺序、返回格式统一
- **简单**：容易上手，少概念
- **可预测**：行为符合直觉
- **完整**：覆盖常见需求
- **容错**：错误信息清晰

## RESTful API 设计

### URL 设计

\`\`\`
GET    /api/users          # 列表
GET    /api/users/:id      # 详情
POST   /api/users          # 创建
PUT    /api/users/:id      # 更新（整体）
PATCH  /api/users/:id      # 更新（部分）
DELETE /api/users/:id      # 删除
\`\`\`

规则：
- 用名词复数
- 用 HTTP 方法表示操作
- 层级表示关系：\`/users/:id/posts\`

### 返回格式

\`\`\`json
{
    "code": 0,
    "message": "success",
    "data": {...}
}
\`\`\`

或 RESTful 风格直接返回数据，用 HTTP 状态码表示结果。

### 分页

\`\`\`
GET /api/users?page=1&page_size=20
\`\`\`

返回：

\`\`\`json
{
    "data": [...],
    "total": 100,
    "page": 1,
    "page_size": 20
}
\`\`\`

### 错误处理

\`\`\`json
{
    "error": {
        "code": "NOT_FOUND",
        "message": "用户不存在",
        "details": {"id": 99}
    }
}
\`\`\`

## API 版本

\`\`\`
/api/v1/users
/api/v2/users
\`\`\`

## Python API 设计

### 函数 API

\`\`\`python
def sort(items, key=None, reverse=False):  # 定义函数 sort，参数：items, key=None, reverse=False
    """参数顺序：必填在前，可选在后"""  # 执行操作
    ...  # 执行操作
\`\`\`

### 类 API

\`\`\`python
class DataFrame:  # 定义类 DataFrame
    def __init__(self, data):  # 定义函数 __init__，参数：self, data
        ...  # 执行操作
    def head(self, n=5):  # 定义函数 head，参数：self, n=5
        ...  # 执行操作
    def filter(self, condition):  # 定义函数 filter，参数：self, condition
        ...  # 执行操作
\`\`\`

## 本章 demo

demo 设计一个完整的 RESTful API。`,
    code: `# ============================================
# 第 90 章：API 设计
# ============================================
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import time
import urllib.request
import urllib.error

# ============================================================
# 数据模型
# ============================================================
class Task:
    """任务模型"""
    def __init__(self, id, title, description="", completed=False):
        self.id = id
        self.title = title
        self.description = description
        self.completed = completed
        self.created_at = time.time()
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "completed": self.completed,
            "created_at": self.created_at,
        }

# ============================================================
# API 响应格式
# ============================================================
def success_response(data, status=200):
    """成功响应"""
    return {
        "code": 0,
        "message": "success",
        "data": data
    }, status

def error_response(code, message, status=400, details=None):
    """错误响应"""
    return {
        "code": code,
        "message": message,
        "details": details
    }, status

# ============================================================
# API 服务器
# ============================================================
class TaskAPIHandler(BaseHTTPRequestHandler):
    """任务 API"""
    
    # 模拟存储
    tasks = {}
    next_id = 1
    
    def log_message(self, format, *args):
        pass
    
    def _send_json(self, data, status=200):
        """发送 JSON"""
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))
    
    def _read_body(self):
        """读请求体"""
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        body = self.rfile.read(length)
        try:
            return json.loads(body)
        except json.JSONDecodeError:
            return None
    
    def do_OPTIONS(self):
        """处理 CORS 预检"""
        self._send_json({}, 200)
    
    def do_GET(self):
        """GET: 获取资源"""
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)
        
        # GET /api/tasks - 列表（支持分页、过滤）
        if path == "/api/tasks":
            tasks = list(self.tasks.values())
            
            # 过滤
            if "completed" in query:
                completed = query["completed"][0].lower() == "true"
                tasks = [t for t in tasks if t["completed"] == completed]
            
            # 搜索
            if "q" in query:
                keyword = query["q"][0]
                tasks = [t for t in tasks if keyword in t["title"]]
            
            # 排序
            sort_by = query.get("sort_by", ["created_at"])[0]
            tasks.sort(key=lambda t: t.get(sort_by, 0), reverse=True)
            
            # 分页
            page = int(query.get("page", ["1"])[0])
            page_size = int(query.get("page_size", ["10"])[0])
            total = len(tasks)
            start = (page - 1) * page_size
            end = start + page_size
            page_tasks = tasks[start:end]
            
            data = {
                "items": page_tasks,
                "total": total,
                "page": page,
                "page_size": page_size,
            }
            self._send_json(*success_response(data))
            return
        
        # GET /api/tasks/:id - 单个
        if path.startswith("/api/tasks/"):
            try:
                task_id = int(path.split("/")[-1])
                if task_id in self.tasks:
                    self._send_json(*success_response(self.tasks[task_id]))
                else:
                    self._send_json(*error_response("NOT_FOUND", "任务不存在", 404))
            except ValueError:
                self._send_json(*error_response("INVALID_ID", "无效的任务 ID", 400))
            return
        
        # GET /api/stats - 统计
        if path == "/api/stats":
            all_tasks = list(self.tasks.values())
            stats = {
                "total": len(all_tasks),
                "completed": sum(1 for t in all_tasks if t["completed"]),
                "pending": sum(1 for t in all_tasks if not t["completed"]),
            }
            self._send_json(*success_response(stats))
            return
        
        self._send_json(*error_response("NOT_FOUND", "路径不存在", 404))
    
    def do_POST(self):
        """POST: 创建资源"""
        parsed = urlparse(self.path)
        
        if parsed.path == "/api/tasks":
            body = self._read_body()
            if body is None:
                self._send_json(*error_response("INVALID_JSON", "无效的 JSON", 400))
                return
            
            # 验证
            if not body.get("title"):
                self._send_json(*error_response("MISSING_TITLE", "title 必填", 400))
                return
            
            task = Task(
                id=TaskAPIHandler.next_id,
                title=body["title"],
                description=body.get("description", ""),
                completed=body.get("completed", False),
            )
            self.tasks[TaskAPIHandler.next_id] = task.to_dict()
            TaskAPIHandler.next_id += 1
            
            self._send_json(*success_response(task.to_dict(), 201))
            return
        
        self._send_json(*error_response("NOT_FOUND", "路径不存在", 404))
    
    def do_PUT(self):
        """PUT: 更新（整体）"""
        parsed = urlparse(self.path)
        
        if parsed.path.startswith("/api/tasks/"):
            try:
                task_id = int(parsed.path.split("/")[-1])
                if task_id not in self.tasks:
                    self._send_json(*error_response("NOT_FOUND", "任务不存在", 404))
                    return
                
                body = self._read_body()
                if body is None:
                    self._send_json(*error_response("INVALID_JSON", "无效的 JSON", 400))
                    return
                
                # PUT 替换整个资源
                task = Task(
                    id=task_id,
                    title=body.get("title", ""),
                    description=body.get("description", ""),
                    completed=body.get("completed", False),
                )
                self.tasks[task_id] = task.to_dict()
                
                self._send_json(*success_response(task.to_dict()))
            except ValueError:
                self._send_json(*error_response("INVALID_ID", "无效的任务 ID", 400))
            return
        
        self._send_json(*error_response("NOT_FOUND", "路径不存在", 404))
    
    def do_PATCH(self):
        """PATCH: 部分更新"""
        parsed = urlparse(self.path)
        
        if parsed.path.startswith("/api/tasks/"):
            try:
                task_id = int(parsed.path.split("/")[-1])
                if task_id not in self.tasks:
                    self._send_json(*error_response("NOT_FOUND", "任务不存在", 404))
                    return
                
                body = self._read_body()
                if body is None:
                    self._send_json(*error_response("INVALID_JSON", "无效的 JSON", 400))
                    return
                
                # PATCH 只更新提供的字段
                task = self.tasks[task_id]
                for key in ("title", "description", "completed"):
                    if key in body:
                        task[key] = body[key]
                
                self._send_json(*success_response(task))
            except ValueError:
                self._send_json(*error_response("INVALID_ID", "无效的任务 ID", 400))
            return
        
        self._send_json(*error_response("NOT_FOUND", "路径不存在", 404))
    
    def do_DELETE(self):
        """DELETE: 删除"""
        parsed = urlparse(self.path)
        
        if parsed.path.startswith("/api/tasks/"):
            try:
                task_id = int(parsed.path.split("/")[-1])
                if task_id in self.tasks:
                    del self.tasks[task_id]
                    self._send_json(*success_response({"deleted": task_id}))
                else:
                    self._send_json(*error_response("NOT_FOUND", "任务不存在", 404))
            except ValueError:
                self._send_json(*error_response("INVALID_ID", "无效的任务 ID", 400))
            return
        
        self._send_json(*error_response("NOT_FOUND", "路径不存在", 404))

# --- 启动服务器 ---
print("=== 任务管理 API ===")
server = HTTPServer(("localhost", 8889), TaskAPIHandler)
server_thread = threading.Thread(target=server.serve_forever, daemon=True)
server_thread.start()
print("  API 运行在 http://localhost:8889")
time.sleep(0.2)

# --- 客户端测试 ---
def api_request(path, method="GET", data=None):
    """API 请求"""
    url = f"http://localhost:8889{path}"
    if data:
        body = json.dumps(data).encode("utf-8")
        req = urllib.request.Request(
            url, data=body, method=method,
            headers={"Content-Type": "application/json"}
        )
    else:
        req = urllib.request.Request(url, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))

# --- 1. 创建任务 ---
print("\\n=== 1. 创建任务 ===")
tasks_to_create = [
    {"title": "学习 Python", "description": "完成 py9 教程"},
    {"title": "写代码", "description": "实现 API"},
    {"title": "测试", "description": "写单元测试"},
    {"title": "部署", "description": "上线服务"},
]
for t in tasks_to_create:
    status, resp = api_request("/api/tasks", "POST", t)
    print(f"  创建 '{t['title']}': {status} → ID={resp.get('data', {}).get('id')}")

# --- 2. 查询列表 ---
print("\\n=== 2. 查询列表 ===")
status, resp = api_request("/api/tasks")
print(f"  GET /api/tasks → {status}")
print(f"  总数: {resp['data']['total']}")
for t in resp['data']['items']:
    print(f"    [{t['id']}] {t['title']} - {t['description']} ({'完成' if t['completed'] else '待办'})")

# --- 3. 分页 ---
print("\\n=== 3. 分页 ===")
status, resp = api_request("/api/tasks?page=1&page_size=2")
print(f"  GET /api/tasks?page=1&page_size=2 → {status}")
print(f"  本页 {len(resp['data']['items'])} 条，共 {resp['data']['total']} 条")

# --- 4. 单个查询 ---
print("\\n=== 4. 单个查询 ===")
status, resp = api_request("/api/tasks/1")
print(f"  GET /api/tasks/1 → {status}")
print(f"  {resp['data']}")

status, resp = api_request("/api/tasks/99")
print(f"  GET /api/tasks/99 → {status}")
print(f"  {resp}")

# --- 5. 更新 ---
print("\\n=== 5. 更新 ===")
# PATCH 部分更新
status, resp = api_request("/api/tasks/1", "PATCH", {"completed": True})
print(f"  PATCH /api/tasks/1 {{completed: true}} → {status}")
print(f"  {resp['data']['title']}: {'完成' if resp['data']['completed'] else '待办'}")

# PUT 整体更新
status, resp = api_request("/api/tasks/2", "PUT", {
    "title": "写代码（更新）",
    "description": "实现 RESTful API",
    "completed": True
})
print(f"  PUT /api/tasks/2 → {status}")
print(f"  {resp['data']['title']}")

# --- 6. 过滤 ---
print("\\n=== 6. 过滤 ===")
status, resp = api_request("/api/tasks?completed=true")
print(f"  已完成 ({resp['data']['total']}):")
for t in resp['data']['items']:
    print(f"    [{t['id']}] {t['title']}")

status, resp = api_request("/api/tasks?completed=false")
print(f"  未完成 ({resp['data']['total']}):")
for t in resp['data']['items']:
    print(f"    [{t['id']}] {t['title']}")

# --- 7. 搜索 ---
print("\\n=== 7. 搜索 ===")
status, resp = api_request("/api/tasks?q=Python")
print(f"  搜索 'Python' ({resp['data']['total']}):")
for t in resp['data']['items']:
    print(f"    [{t['id']}] {t['title']}")

# --- 8. 统计 ---
print("\\n=== 8. 统计 ===")
status, resp = api_request("/api/stats")
print(f"  GET /api/stats → {status}")
print(f"  {resp['data']}")

# --- 9. 删除 ---
print("\\n=== 9. 删除 ===")
status, resp = api_request("/api/tasks/3", "DELETE")
print(f"  DELETE /api/tasks/3 → {status}")
print(f"  {resp['data']}")

status, resp = api_request("/api/tasks")
print(f"  剩余 {resp['data']['total']} 个任务")

# --- 10. API 设计总结 ---
print("\\n=== 10. API 设计总结 ===")
print("  RESTful 原则:")
principles = [
    "用名词复数（/users 不是 /user）",
    "用 HTTP 方法表示操作（GET/POST/PUT/DELETE）",
    "用状态码表示结果（200/201/400/404/500）",
    "返回一致的 JSON 格式",
    "支持分页、过滤、排序",
    "清晰的错误信息",
    "版本化（/api/v1/）",
    "无状态（每次请求独立）",
]
for p in principles:
    print(f"    • {p}")

# 关闭服务器
server.shutdown()
print("\\n  服务器已关闭")`
  },

  // -----------------------------------------------------------
  // 第 91 章：项目结构最佳实践
  // -----------------------------------------------------------
  {
    id: "py9-91",
    group: "实战进阶",
    icon: "🏗️",
    title: "项目结构最佳实践",
    content: `## 标准项目结构

\`\`\`
myproject/
├── pyproject.toml        # 项目配置
├── README.md             # 说明文档
├── .gitignore            # Git 忽略
├── src/                  # 源代码
│   └── myproject/
│       ├── __init__.py
│       ├── main.py
│       ├── models/
│       │   ├── __init__.py
│       │   └── user.py
│       ├── services/
│       │   ├── __init__.py
│       │   └── user_service.py
│       └── utils/
│           ├── __init__.py
│           └── helpers.py
├── tests/                # 测试
│   ├── __init__.py
│   ├── conftest.py       # pytest fixture
│   ├── test_models.py
│   └── test_services.py
├── docs/                 # 文档
└── scripts/              # 脚本
\`\`\`

## 分层架构

- **models**：数据模型（实体）
- **services**：业务逻辑
- **controllers/api**：接口层
- **utils**：工具函数
- **config**：配置

## 命名规范

- **文件**：\`snake_case.py\`
- **类**：\`PascalCase\`
- **函数/变量**：\`snake_case\`
- **常量**：\`UPPER_CASE\`
- **私有**：\`_leading_underscore\`

## pyproject.toml

\`\`\`toml
[project]
name = "myproject"
version = "0.1.0"
requires-python = ">=3.9"
dependencies = ["requests"]

[project.optional-dependencies]
dev = ["pytest", "black", "mypy"]

[project.scripts]
myapp = "myproject.cli:main"
\`\`\`

## .gitignore

\`\`\`
__pycache__/
*.pyc
.venv/
*.egg-info/
dist/
build/
.pytest_cache/
.mypy_cache/
.env
\`\`\`

## 配置管理

- **开发/测试/生产** 不同配置
- 用环境变量 + \`.env\` 文件
- 敏感信息不放代码里

## 本章 demo

demo 展示项目结构和代码组织。`,
    code: `# ============================================
# 第 91 章：项目结构最佳实践
# ============================================
import os
import sys
import tempfile
import shutil

# --- 1. 创建示例项目结构 ---
print("=== 1. 项目结构 ===")
project_root = tempfile.mkdtemp(prefix="myproject_")

# 创建目录结构
dirs = [
    "src/myproject/models",
    "src/myproject/services",
    "src/myproject/api",
    "src/myproject/utils",
    "src/myproject/config",
    "tests",
    "docs",
    "scripts",
]
for d in dirs:
    os.makedirs(os.path.join(project_root, d), exist_ok=True)

# 创建 __init__.py
for d in dirs:
    if d.startswith("src/") or d == "tests":
        init_path = os.path.join(project_root, d, "__init__.py")
        with open(init_path, "w") as f:
            f.write('"""包初始化"""\\n')

# 打印结构
def print_tree(path, prefix=""):
    """打印目录树"""
    items = sorted(os.listdir(path))
    items = [i for i in items if not i.startswith(".")]
    for i, item in enumerate(items):
        full = os.path.join(path, item)
        is_last = i == len(items) - 1
        connector = "└── " if is_last else "├── "
        print(f"{prefix}{connector}{item}")
        if os.path.isdir(full):
            new_prefix = prefix + ("    " if is_last else "│   ")
            print_tree(full, new_prefix)

print(f"  项目根: {project_root}")
print_tree(project_root, "  ")

# --- 2. 写入示例代码 ---
print("\\n=== 2. 示例代码 ===")

# models/user.py
with open(os.path.join(project_root, "src/myproject/models/user.py"), "w") as f:
    f.write('''"""用户模型"""
from dataclasses import dataclass, field
from typing import List


@dataclass
class User:
    """用户实体"""
    id: int
    name: str
    email: str
    age: int = 0
    roles: List[str] = field(default_factory=list)
    
    def is_admin(self) -> bool:
        return "admin" in self.roles
    
    def __repr__(self):
        return f"User(id={self.id}, name={self.name!r})"
''')

# services/user_service.py
with open(os.path.join(project_root, "src/myproject/services/user_service.py"), "w") as f:
    f.write('''"""用户服务"""
from typing import List, Optional
from myproject.models.user import User


class UserService:
    """用户业务逻辑"""
    
    def __init__(self):
        self._users = {}
        self._next_id = 1
    
    def create(self, name: str, email: str, age: int = 0) -> User:
        """创建用户"""
        user = User(
            id=self._next_id,
            name=name,
            email=email,
            age=age,
        )
        self._users[self._next_id] = user
        self._next_id += 1
        return user
    
    def get(self, user_id: int) -> Optional[User]:
        """查询用户"""
        return self._users.get(user_id)
    
    def get_all(self) -> List[User]:
        """所有用户"""
        return list(self._users.values())
    
    def update(self, user_id: int, **kwargs) -> Optional[User]:
        """更新用户"""
        user = self.get(user_id)
        if not user:
            return None
        for key, value in kwargs.items():
            if hasattr(user, key):
                setattr(user, key, value)
        return user
    
    def delete(self, user_id: int) -> bool:
        """删除用户"""
        if user_id in self._users:
            del self._users[user_id]
            return True
        return False
    
    def find_by_email(self, email: str) -> Optional[User]:
        """按邮箱查找"""
        for user in self._users.values():
            if user.email == email:
                return user
        return None
''')

# utils/helpers.py
with open(os.path.join(project_root, "src/myproject/utils/helpers.py"), "w") as f:
    f.write('''"""工具函数"""
import re
from typing import Any, Dict


def validate_email(email: str) -> bool:
    """验证邮箱格式"""
    pattern = r"^[\\w.+-]+@[\\w-]+\\.[\\w.]+$"
    return bool(re.match(pattern, email))


def validate_age(age: Any) -> bool:
    """验证年龄"""
    try:
        n = int(age)
        return 0 <= n <= 150
    except (ValueError, TypeError):
        return False


def to_dict(obj: Any) -> Dict:
    """对象转字典"""
    if hasattr(obj, "__dict__"):
        return {k: v for k, v in vars(obj).items() if not k.startswith("_")}
    return {}


def format_user(user: Any) -> str:
    """格式化用户显示"""
    return f"#{user.id} {user.name} <{user.email}>"
''')

# config/settings.py
with open(os.path.join(project_root, "src/myproject/config/settings.py"), "w") as f:
    f.write('''"""配置"""
import os


class Settings:
    """应用配置"""
    # 从环境变量读取，有默认值
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"
    DB_URL = os.getenv("DATABASE_URL", "sqlite:///app.db")
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    API_V1_PREFIX = "/api/v1"
    PAGE_SIZE = 20


settings = Settings()
''')

# api/routes.py
with open(os.path.join(project_root, "src/myproject/api/routes.py"), "w") as f:
    f.write('''"""API 路由"""
from myproject.services.user_service import UserService
from myproject.utils.helpers import validate_email, validate_age


class UserAPI:
    """用户 API"""
    
    def __init__(self):
        self.service = UserService()
    
    def create_user(self, data: dict) -> dict:
        """POST /users"""
        # 验证
        if not data.get("name"):
            return {"error": "name 必填"}, 400
        if not validate_email(data.get("email", "")):
            return {"error": "邮箱格式错误"}, 400
        if "age" in data and not validate_age(data["age"]):
            return {"error": "年龄无效"}, 400
        
        user = self.service.create(
            name=data["name"],
            email=data["email"],
            age=data.get("age", 0),
        )
        return {"data": user.__dict__}, 201
    
    def get_user(self, user_id: int) -> dict:
        """GET /users/:id"""
        user = self.service.get(user_id)
        if not user:
            return {"error": "用户不存在"}, 404
        return {"data": user.__dict__}, 200
''')

# main.py
with open(os.path.join(project_root, "src/myproject/main.py"), "w") as f:
    f.write('''"""应用入口"""
from myproject.config.settings import settings
from myproject.api.routes import UserAPI


def main():
    """主函数"""
    print(f"应用启动 (DEBUG={settings.DEBUG})")
    api = UserAPI()
    
    # 创建用户
    result, status = api.create_user({
        "name": "小明",
        "email": "xm@example.com",
        "age": 18,
    })
    print(f"创建用户: {status}, {result}")
    
    # 查询
    result, status = api.get_user(1)
    print(f"查询用户: {status}, {result}")


if __name__ == "__main__":
    main()
''')

# pyproject.toml
with open(os.path.join(project_root, "pyproject.toml"), "w") as f:
    f.write('''[project]
name = "myproject"
version = "0.1.0"
description = "示例项目"
requires-python = ">=3.9"
dependencies = [
    "requests>=2.28",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0",
    "black",
    "mypy",
]

[project.scripts]
myapp = "myproject.main:main"

[tool.pytest.ini_options]
testpaths = ["tests"]

[tool.black]
line-length = 88
''')

# .gitignore
with open(os.path.join(project_root, ".gitignore"), "w") as f:
    f.write('''__pycache__/
*.pyc
*.pyo
.venv/
*.egg-info/
dist/
build/
.pytest_cache/
.mypy_cache/
.env
*.db
''')

# README.md
with open(os.path.join(project_root, "README.md"), "w") as f:
    f.write('''# MyProject

## 安装

~~~bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
~~~

## 运行

~~~bash
myapp
~~~

## 测试

~~~bash
pytest
~~~
''')

print("  文件已创建:")
for root, dirs, files in os.walk(project_root):
    rel = os.path.relpath(root, project_root)
    for f in files:
        path = os.path.join(rel, f) if rel != "." else f
        print(f"    {path}")

# --- 3. 测试代码 ---
print("\\n=== 3. 测试代码 ===")
test_code = '''"""用户服务测试"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from myproject.services.user_service import UserService
from myproject.utils.helpers import validate_email, validate_age


def test_create_user():
    service = UserService()
    user = service.create("小明", "xm@example.com", 18)
    assert user.id == 1
    assert user.name == "小明"
    assert user.email == "xm@example.com"
    assert user.age == 18


def test_get_user():
    service = UserService()
    service.create("小明", "xm@example.com")
    user = service.get(1)
    assert user is not None
    assert service.get(99) is None


def test_validate_email():
    assert validate_email("xm@example.com")
    assert not validate_email("invalid")


def test_validate_age():
    assert validate_age(18)
    assert validate_age("20")
    assert not validate_age(-1)
    assert not validate_age(200)


if __name__ == "__main__":
    # 简单运行
    test_create_user()
    print("  test_create_user 通过")
    test_get_user()
    print("  test_get_user 通过")
    test_validate_email()
    print("  test_validate_email 通过")
    test_validate_age()
    print("  test_validate_age 通过")
    print("  全部通过！")
'''

with open(os.path.join(project_root, "tests/test_user.py"), "w") as f:
    f.write(test_code)

# 运行测试
import subprocess
result = subprocess.run(
    [sys.executable, os.path.join(project_root, "tests/test_user.py")],
    capture_output=True, text=True,
    cwd=project_root
)
print(result.stdout.strip())
if result.stderr:
    print(f"  stderr: {result.stderr[:200]}")

# --- 4. 运行主程序 ---
print("\\n=== 4. 运行主程序 ===")
# 把 src 加入路径
sys.path.insert(0, os.path.join(project_root, "src"))

# 导入并运行
from myproject.config.settings import settings
from myproject.api.routes import UserAPI

print(f"  DEBUG = {settings.DEBUG}")
print(f"  DB_URL = {settings.DB_URL}")

api = UserAPI()

# 创建用户
result, status = api.create_user({
    "name": "小明",
    "email": "xm@example.com",
    "age": 18,
})
print(f"\\n  创建用户: status={status}")
print(f"  {result}")

# 错误情况
result, status = api.create_user({"name": "", "email": "bad"})
print(f"\\n  错误创建: status={status}")
print(f"  {result}")

# --- 5. 命名规范 ---
print("\\n=== 5. 命名规范 ===")
naming = [
    ("文件", "snake_case.py", "user_service.py"),
    ("类", "PascalCase", "UserService"),
    ("函数/变量", "snake_case", "create_user"),
    ("常量", "UPPER_CASE", "MAX_SIZE"),
    ("私有", "_leading_underscore", "_internal_cache"),
    ("双下方法", "__dunder__", "__init__"),
]
print(f"  {'类型':<12} {'规范':<25} {'例子'}")
for t, r, e in naming:
    print(f"  {t:<12} {r:<25} {e}")

# --- 6. 分层架构 ---
print("\\n=== 6. 分层架构 ===")
print("  ┌─────────────────────────────────────┐")
print("  │ API / Controller 层（接口）          │")
print("  │   - 接收请求，返回响应              │")
print("  │   - 参数验证                        │")
print("  ├─────────────────────────────────────┤")
print("  │ Service 层（业务逻辑）              │")
print("  │   - 业务规则                        │")
print("  │   - 调用多个 Model                  │")
print("  ├─────────────────────────────────────┤")
print("  │ Model 层（数据）                    │")
print("  │   - 数据结构                        │")
print("  │   - 简单验证                        │")
print("  ├─────────────────────────────────────┤")
print("  │ Utils 层（工具）                    │")
print("  │   - 通用函数                        │")
print("  └─────────────────────────────────────┘")

# --- 7. 最佳实践总结 ---
print("\\n=== 7. 最佳实践 ===")
practices = [
    "源代码放 src/ 下，避免命名冲突",
    "测试放 tests/ 下，与源码分离",
    "用 pyproject.toml 配置项目",
    "敏感信息用环境变量",
    "函数单一职责",
    "类型提示提升可读性",
    "docstring 说明用途",
    "用 .gitignore 排除无关文件",
    "依赖锁定版本",
    "持续测试",
]
for p in practices:
    print(f"  • {p}")

# 清理
sys.path.remove(os.path.join(project_root, "src"))
shutil.rmtree(project_root)
print("\\n  临时项目已清理")`
  },

  // -----------------------------------------------------------
  // 第 92 章：综合实战项目
  // -----------------------------------------------------------
  {
    id: "py9-92",
    group: "实战进阶",
    icon: "🏆",
    title: "综合实战：博客系统后端",
    content: `## 综合运用所有知识

把前面学的全部串起来，做一个完整的博客系统后端。

## 涉及知识

- 数据类（dataclass）
- 数据库（SQLite）
- 异常处理
- 装饰器
- 上下文管理器
- 类型提示
- 单元测试
- API 设计
- 配置管理
- 日志

## 功能

- 用户管理（注册、登录）
- 文章管理（CRUD）
- 评论系统
- 标签系统
- 搜索

## 架构

\`\`\`
API 层 → Service 层 → Model 层 → Database
\`\`\`

## 本章 demo

完整实现一个博客系统。`,
    code: `# ============================================
# 第 92 章：综合实战 - 博客系统后端
# ============================================
import sqlite3
import json
import time
import hashlib
import logging
import sys
import tempfile
import os
from dataclasses import dataclass, field, asdict
from typing import List, Optional, Dict, Any
from functools import wraps
from contextlib import contextmanager

# ============================================================
# 配置
# ============================================================
class Config:
    DEBUG = True
    DB_PATH = tempfile.mktemp(suffix=".blog.db")
    SECRET = "blog-secret-key"
    SALT = "blog-salt"

config = Config()

# ============================================================
# 日志
# ============================================================
logger = logging.getLogger("blog")
logger.setLevel(logging.DEBUG)
logger.handlers = []
h = logging.StreamHandler(sys.stdout)
h.setFormatter(logging.Formatter("[%(levelname)s] %(message)s"))
logger.addHandler(h)
logger.propagate = False

# ============================================================
# 数据模型
# ============================================================
@dataclass
class User:
    id: int = 0
    username: str = ""
    email: str = ""
    password_hash: str = ""
    created_at: float = field(default_factory=time.time)
    
    def to_dict(self, include_hash=False):
        d = asdict(self)
        if not include_hash:
            d.pop("password_hash")
        return d

@dataclass
class Post:
    id: int = 0
    title: str = ""
    content: str = ""
    author_id: int = 0
    tags: List[str] = field(default_factory=list)
    views: int = 0
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)
    
    def to_dict(self):
        return asdict(self)

@dataclass
class Comment:
    id: int = 0
    post_id: int = 0
    author_id: int = 0
    content: str = ""
    created_at: float = field(default_factory=time.time)
    
    def to_dict(self):
        return asdict(self)

# ============================================================
# 异常
# ============================================================
class BlogError(Exception):
    """博客基础异常"""
    pass

class UserNotFoundError(BlogError):
    pass

class DuplicateUserError(BlogError):
    pass

class AuthError(BlogError):
    pass

class PostNotFoundError(BlogError):
    pass

class ValidationError(BlogError):
    pass

# ============================================================
# 数据库
# ============================================================
class Database:
    """数据库管理"""
    
    def __init__(self, db_path):
        self.db_path = db_path
        self._init_db()
    
    @contextmanager
    def get_conn(self):
        """获取连接（上下文管理器）"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
    
    def _init_db(self):
        """初始化表"""
        with self.get_conn() as conn:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at REAL
                );
                
                CREATE TABLE IF NOT EXISTS posts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content TEXT,
                    author_id INTEGER,
                    tags TEXT,
                    views INTEGER DEFAULT 0,
                    created_at REAL,
                    updated_at REAL,
                    FOREIGN KEY (author_id) REFERENCES users(id)
                );
                
                CREATE TABLE IF NOT EXISTS comments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    post_id INTEGER,
                    author_id INTEGER,
                    content TEXT,
                    created_at REAL,
                    FOREIGN KEY (post_id) REFERENCES posts(id),
                    FOREIGN KEY (author_id) REFERENCES users(id)
                );
            """)
    
    def execute(self, sql, params=()):
        """执行 SQL"""
        with self.get_conn() as conn:
            cursor = conn.execute(sql, params)
            return cursor.rowcount
    
    def fetchone(self, sql, params=()):
        """查询单条"""
        with self.get_conn() as conn:
            cursor = conn.execute(sql, params)
            return cursor.fetchone()
    
    def fetchall(self, sql, params=()):
        """查询多条"""
        with self.get_conn() as conn:
            cursor = conn.execute(sql, params)
            return cursor.fetchall()

# ============================================================
# 服务层
# ============================================================
def hash_password(password: str) -> str:
    """密码哈希"""
    return hashlib.sha256(
        (password + config.SALT).encode()
    ).hexdigest()

def verify_password(password: str, password_hash: str) -> bool:
    """验证密码"""
    return hash_password(password) == password_hash

class UserService:
    """用户服务"""
    
    def __init__(self, db: Database):
        self.db = db
    
    def register(self, username: str, email: str, password: str) -> User:
        """注册"""
        # 验证
        if not username or len(username) < 3:
            raise ValidationError("用户名至少 3 个字符")
        if "@" not in email:
            raise ValidationError("邮箱格式错误")
        if len(password) < 6:
            raise ValidationError("密码至少 6 位")
        
        # 检查重复
        existing = self.db.fetchone(
            "SELECT id FROM users WHERE username = ? OR email = ?",
            (username, email)
        )
        if existing:
            raise DuplicateUserError("用户名或邮箱已存在")
        
        # 创建
        user = User(
            username=username,
            email=email,
            password_hash=hash_password(password),
        )
        
        cursor = self.db.execute(
            "INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
            (user.username, user.email, user.password_hash, user.created_at)
        )
        user.id = cursor if isinstance(cursor, int) else 0
        # 获取真实 ID
        row = self.db.fetchone(
            "SELECT id FROM users WHERE username = ?", (username,)
        )
        if row:
            user.id = row["id"]
        
        logger.info(f"用户注册: {username}")
        return user
    
    def login(self, username: str, password: str) -> User:
        """登录"""
        row = self.db.fetchone(
            "SELECT * FROM users WHERE username = ?", (username,)
        )
        if not row:
            raise UserNotFoundError("用户不存在")
        
        if not verify_password(password, row["password_hash"]):
            raise AuthError("密码错误")
        
        user = User(
            id=row["id"],
            username=row["username"],
            email=row["email"],
            password_hash=row["password_hash"],
            created_at=row["created_at"],
        )
        logger.info(f"用户登录: {username}")
        return user
    
    def get(self, user_id: int) -> User:
        """获取用户"""
        row = self.db.fetchone(
            "SELECT * FROM users WHERE id = ?", (user_id,)
        )
        if not row:
            raise UserNotFoundError("用户不存在")
        return User(
            id=row["id"],
            username=row["username"],
            email=row["email"],
            created_at=row["created_at"],
        )

class PostService:
    """文章服务"""
    
    def __init__(self, db: Database):
        self.db = db
    
    def create(self, title: str, content: str, author_id: int, tags: List[str] = None) -> Post:
        """创建文章"""
        if not title:
            raise ValidationError("标题不能为空")
        
        tags_str = json.dumps(tags or [], ensure_ascii=False)
        now = time.time()
        
        post = Post(
            title=title,
            content=content,
            author_id=author_id,
            tags=tags or [],
            created_at=now,
            updated_at=now,
        )
        
        self.db.execute(
            "INSERT INTO posts (title, content, author_id, tags, views, created_at, updated_at) VALUES (?, ?, ?, ?, 0, ?, ?)",
            (title, content, author_id, tags_str, now, now)
        )
        
        # 获取 ID
        row = self.db.fetchone(
            "SELECT * FROM posts WHERE title = ? AND author_id = ? ORDER BY id DESC LIMIT 1",
            (title, author_id)
        )
        if row:
            post.id = row["id"]
        
        logger.info(f"创建文章: {title}")
        return post
    
    def get(self, post_id: int) -> Post:
        """获取文章"""
        row = self.db.fetchone("SELECT * FROM posts WHERE id = ?", (post_id,))
        if not row:
            raise PostNotFoundError("文章不存在")
        
        # 增加浏览量
        self.db.execute(
            "UPDATE posts SET views = views + 1 WHERE id = ?", (post_id,)
        )
        
        return Post(
            id=row["id"],
            title=row["title"],
            content=row["content"],
            author_id=row["author_id"],
            tags=json.loads(row["tags"]) if row["tags"] else [],
            views=row["views"] + 1,
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )
    
    def get_all(self, limit: int = 10, offset: int = 0) -> List[Post]:
        """所有文章"""
        rows = self.db.fetchall(
            "SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?",
            (limit, offset)
        )
        return [self._row_to_post(r) for r in rows]
    
    def update(self, post_id: int, **kwargs) -> Post:
        """更新"""
        row = self.db.fetchone("SELECT * FROM posts WHERE id = ?", (post_id,))
        if not row:
            raise PostNotFoundError("文章不存在")
        
        sets = []
        params = []
        for key in ("title", "content"):
            if key in kwargs:
                sets.append(f"{key} = ?")
                params.append(kwargs[key])
        if "tags" in kwargs:
            sets.append("tags = ?")
            params.append(json.dumps(kwargs["tags"], ensure_ascii=False))
        
        sets.append("updated_at = ?")
        params.append(time.time())
        params.append(post_id)
        
        self.db.execute(
            f"UPDATE posts SET {', '.join(sets)} WHERE id = ?",
            params
        )
        return self.get(post_id)
    
    def delete(self, post_id: int) -> bool:
        """删除"""
        row = self.db.fetchone("SELECT id FROM posts WHERE id = ?", (post_id,))
        if not row:
            raise PostNotFoundError("文章不存在")
        
        self.db.execute("DELETE FROM posts WHERE id = ?", (post_id,))
        self.db.execute("DELETE FROM comments WHERE post_id = ?", (post_id,))
        logger.info(f"删除文章: {post_id}")
        return True
    
    def search(self, keyword: str) -> List[Post]:
        """搜索"""
        rows = self.db.fetchall(
            "SELECT * FROM posts WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC",
            (f"%{keyword}%", f"%{keyword}%")
        )
        return [self._row_to_post(r) for r in rows]
    
    def _row_to_post(self, row) -> Post:
        return Post(
            id=row["id"],
            title=row["title"],
            content=row["content"],
            author_id=row["author_id"],
            tags=json.loads(row["tags"]) if row["tags"] else [],
            views=row["views"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )

class CommentService:
    """评论服务"""
    
    def __init__(self, db: Database):
        self.db = db
    
    def add(self, post_id: int, author_id: int, content: str) -> Comment:
        """添加评论"""
        if not content:
            raise ValidationError("评论内容不能为空")
        
        # 检查文章存在
        post_row = self.db.fetchone("SELECT id FROM posts WHERE id = ?", (post_id,))
        if not post_row:
            raise PostNotFoundError("文章不存在")
        
        now = time.time()
        self.db.execute(
            "INSERT INTO comments (post_id, author_id, content, created_at) VALUES (?, ?, ?, ?)",
            (post_id, author_id, content, now)
        )
        
        row = self.db.fetchone(
            "SELECT * FROM comments WHERE post_id = ? AND author_id = ? ORDER BY id DESC LIMIT 1",
            (post_id, author_id)
        )
        
        return Comment(
            id=row["id"],
            post_id=post_id,
            author_id=author_id,
            content=content,
            created_at=now,
        )
    
    def get_by_post(self, post_id: int) -> List[Comment]:
        """文章的所有评论"""
        rows = self.db.fetchall(
            "SELECT * FROM comments WHERE post_id = ? ORDER BY created_at",
            (post_id,)
        )
        return [Comment(
            id=r["id"],
            post_id=r["post_id"],
            author_id=r["author_id"],
            content=r["content"],
            created_at=r["created_at"],
        ) for r in rows]

# ============================================================
# API 层
# ============================================================
class BlogAPI:
    """博客 API"""
    
    def __init__(self, db_path):
        self.db = Database(db_path)
        self.users = UserService(self.db)
        self.posts = PostService(self.db)
        self.comments = CommentService(self.db)
    
    def _response(self, data, status=200):
        """统一响应"""
        return {"code": 0, "data": data, "status": status}, status
    
    def _error(self, message, status=400):
        """统一错误"""
        return {"code": 1, "error": message, "status": status}, status
    
    def register(self, username, email, password):
        """注册"""
        try:
            user = self.users.register(username, email, password)
            return self._response(user.to_dict(), 201)
        except (ValidationError, DuplicateUserError) as e:
            return self._error(str(e))
    
    def login(self, username, password):
        """登录"""
        try:
            user = self.users.login(username, password)
            return self._response(user.to_dict())
        except (UserNotFoundError, AuthError) as e:
            return self._error(str(e), 401)
    
    def create_post(self, title, content, author_id, tags=None):
        """创建文章"""
        try:
            post = self.posts.create(title, content, author_id, tags)
            return self._response(post.to_dict(), 201)
        except (ValidationError, UserNotFoundError) as e:
            return self._error(str(e))
    
    def get_post(self, post_id):
        """获取文章"""
        try:
            post = self.posts.get(post_id)
            comments = self.comments.get_by_post(post_id)
            data = post.to_dict()
            data["comments"] = [c.to_dict() for c in comments]
            return self._response(data)
        except PostNotFoundError as e:
            return self._error(str(e), 404)
    
    def list_posts(self, page=1, page_size=10):
        """文章列表"""
        offset = (page - 1) * page_size
        posts = self.posts.get_all(limit=page_size, offset=offset)
        return self._response({
            "items": [p.to_dict() for p in posts],
            "page": page,
            "page_size": page_size,
        })
    
    def add_comment(self, post_id, author_id, content):
        """添加评论"""
        try:
            comment = self.comments.add(post_id, author_id, content)
            return self._response(comment.to_dict(), 201)
        except (ValidationError, PostNotFoundError) as e:
            return self._error(str(e))

# ============================================================
# 演示
# ============================================================
print("=" * 55)
print("博客系统后端演示")
print("=" * 55)

api = BlogAPI(config.DB_PATH)

# --- 1. 用户注册与登录 ---
print("\\n--- 1. 用户 ---")

# 注册
resp, status = api.register("alice", "alice@example.com", "password123")
print(f"  注册 alice: {status}, {resp['data']['username']}")
alice_id = resp["data"]["id"]

resp, status = api.register("bob", "bob@example.com", "password456")
print(f"  注册 bob: {status}, {resp['data']['username']}")
bob_id = resp["data"]["id"]

# 重复注册
resp, status = api.register("alice", "alice2@example.com", "x")
print(f"  重复注册: {status}, {resp['error']}")

# 登录
resp, status = api.login("alice", "password123")
print(f"  登录 alice: {status}")

# 错误密码
resp, status = api.login("alice", "wrong")
print(f"  错误密码: {status}, {resp['error']}")

# --- 2. 创建文章 ---
print("\\n--- 2. 文章 ---")

resp, status = api.create_post(
    "Python 学习笔记",
    "Python 是一门优雅的语言...",
    alice_id,
    ["python", "学习"]
)
print(f"  创建文章: {status}, ID={resp['data']['id']}")
post1_id = resp['data']['id']

resp, status = api.create_post(
    "Web 开发入门",
    "HTTP 是 Web 的基础...",
    bob_id,
    ["web", "http"]
)
print(f"  创建文章: {status}, ID={resp['data']['id']}")
post2_id = resp['data']['id']

resp, status = api.create_post(
    "Python 异步编程",
    "asyncio 是 Python 的异步框架...",
    alice_id,
    ["python", "async"]
)
print(f"  创建文章: {status}, ID={resp['data']['id']}")
post3_id = resp['data']['id']

# --- 3. 文章列表 ---
print("\\n--- 3. 列表 ---")
resp, _ = api.list_posts(page=1, page_size=10)
print(f"  文章列表 ({len(resp['data']['items'])} 篇):")
for p in resp['data']['items']:
    print(f"    [{p['id']}] {p['title']} (标签: {p['tags']}, 浏览: {p['views']})")

# --- 4. 查看文章 ---
print("\\n--- 4. 查看文章 ---")
resp, _ = api.get_post(post1_id)
post_data = resp['data']
print(f"  标题: {post_data['title']}")
print(f"  内容: {post_data['content'][:30]}...")
print(f"  标签: {post_data['tags']}")
print(f"  浏览: {post_data['views']}")

# --- 5. 评论 ---
print("\\n--- 5. 评论 ---")

resp, status = api.add_comment(post1_id, bob_id, "写得很好！")
print(f"  bob 评论: {status}")

resp, status = api.add_comment(post1_id, alice_id, "谢谢！")
print(f"  alice 回复: {status}")

# 查看文章+评论
resp, _ = api.get_post(post1_id)
print(f"\\n  文章 '{resp['data']['title']}' 的评论:")
for c in resp['data']['comments']:
    author = "alice" if c['author_id'] == alice_id else "bob"
    print(f"    [{author}] {c['content']}")

# --- 6. 搜索 ---
print("\\n--- 6. 搜索 ---")
results = api.posts.search("Python")
print(f"  搜索 'Python' ({len(results)} 篇):")
for p in results:
    print(f"    [{p.id}] {p.title}")

# --- 7. 统计 ---
print("\\n--- 7. 统计 ---")
all_posts = api.posts.get_all(limit=100)
all_comments = []
for p in all_posts:
    all_comments.extend(api.comments.get_by_post(p.id))

print(f"  用户: 2")
print(f"  文章: {len(all_posts)}")
print(f"  评论: {len(all_comments)}")
print(f"  总浏览: {sum(p.views for p in all_posts)}")

# 标签统计
from collections import Counter
tag_counter = Counter()
for p in all_posts:
    tag_counter.update(p.tags)
print(f"  标签: {dict(tag_counter)}")

# --- 8. 知识点回顾 ---
print("\\n" + "=" * 55)
print("知识点回顾（92 章教程）")
print("=" * 55)
topics = [
    "1-10: 起步（变量、类型、字符串、运算符）",
    "11-20: 数据结构（列表、元组、字典、集合、流程）",
    "21-30: 函数（参数、闭包、装饰器、作用域）",
    "31-40: OOP（类、继承、多态、特殊方法、异常文件）",
    "41-48: 迭代器与生成器（yield、itertools、管道）",
    "49-58: 函数式（纯函数、装饰器进阶、描述符、元类）",
    "59-70: 标准库（os/sys/pathlib/datetime/json/re/collections）",
    "71-76: 类型与现代特性（泛型、async、模块、异常）",
    "77-82: 测试与调试（unittest、pytest、性能分析）",
    "83-87: 性能优化（GC、并发、多线程、多进程）",
    "88-92: 实战（Web、数据库、API、项目结构、综合）",
]
for t in topics:
    print(f"  • {t}")

# 清理
os.unlink(config.DB_PATH)
print(f"\\n  数据库已清理: {config.DB_PATH}")
print("\\n  恭喜完成 Python 逐层深入教程！🎉")`
  }
];
