// =============================================================
// Python 逐层深入教程 - batch5
// 章节 41-48：迭代器与生成器
// =============================================================

export const chapters = [
  // -----------------------------------------------------------
  // 第 41 章：可迭代对象与迭代器
  // -----------------------------------------------------------
  {
    id: "py9-41",
    group: "迭代器与生成器",
    icon: "🔁",
    title: "可迭代对象与迭代器：for 循环的真相",
    content: `## for 循环背后发生了什么

你写了无数个 \`for x in [1, 2, 3]\`，但有没有想过 \`for\` 到底怎么工作的？答案藏在两个概念里：

- **可迭代对象（Iterable）**：能被 \`for\` 遍历的东西。列表、字符串、字典、文件……都是。
- **迭代器（Iterator）**：真正"产出下一个值"的对象。

\`\`\`python
lst = [1, 2, 3]
it = iter(lst)      # 用 iter() 拿到迭代器
next(it)            # 1，用 next() 取下一个
next(it)            # 2
next(it)            # 3
next(it)            # 抛 StopIteration！
\`\`\`

## for 循环的等价写法

\`\`\`python
for x in [1, 2, 3]:
    print(x)

# 等价于：
it = iter([1, 2, 3])
while True:
    try:
        x = next(it)
        print(x)
    except StopIteration:
        break
\`\`\`

所以 \`for\` 本质就是：**拿到迭代器 → 不断 next → 直到 StopIteration**。

## 两者的区别

| | 可迭代对象 | 迭代器 |
|---|---|---|
| 有 \`__iter__\` | ✅ | ✅ |
| 有 \`__next__\` | ❌ | ✅ |
| 能用 \`for\` | ✅ | ✅ |
| 能用 \`next()\` | ❌ | ✅ |
| 能重复遍历 | ✅ | ❌（一次性） |

可迭代对象有 \`__iter__\`（能产出迭代器），迭代器额外有 \`__next__\`（能取下一个值）。

## 迭代器是"一次性"的

\`\`\`python
it = iter([1, 2, 3])
list(it)    # [1, 2, 3]
list(it)    # []  ← 空了！迭代器用完即弃
\`\`\`

而列表可以反复遍历，因为每次 \`for\` 都会新调 \`iter()\` 拿一个新迭代器。

## 为什么重要

理解迭代器是理解生成器、推导式、map/filter 的基础。它们都基于这套机制。而且迭代器**惰性求值**——用的时候才算，省内存。

## 本章 demo

demo 用 \`iter\`、\`next\` 手动遍历，看清 for 的本质。`,
    code: `# ============================================
# 第 41 章：可迭代对象与迭代器
# ============================================

# --- 1. iter 和 next ---
print("=== 1. iter / next ===")
lst = [10, 20, 30]
it = iter(lst)            # 拿到迭代器
print(f"  iter({lst}) = {it}")
print(f"  next(it) = {next(it)}")
print(f"  next(it) = {next(it)}")
print(f"  next(it) = {next(it)}")
# next(it)  # 再调会抛 StopIteration

# --- 2. for 循环的真相 ---
print("\\n=== 2. for 的等价写法 ===")
def manual_for(iterable, action):
    """手动模拟 for 循环"""
    it = iter(iterable)
    while True:
        try:
            x = next(it)
            action(x)
        except StopIteration:
            break

print("  手动遍历 [1,2,3]:")
manual_for([1, 2, 3], lambda x: print(f"    得到 {x}"))

print("  手动遍历 'abc':")
manual_for("abc", lambda x: print(f"    字符 {x}"))

# --- 3. 各种可迭代对象 ---
print("\\n=== 3. 各种可迭代 ===")
iterables = [
    [1, 2, 3],           # 列表
    (1, 2, 3),           # 元组
    "abc",               # 字符串
    {1, 2, 3},           # 集合
    {"a": 1, "b": 2},    # 字典（遍历键）
    range(3),            # range
]
for it_obj in iterables:
    items = list(it_obj)
    print(f"  {type(it_obj).__name__:8} → {items}")

# --- 4. 迭代器是一次性的 ---
print("\\n=== 4. 一次性 ===")
it = iter([1, 2, 3])
print(f"  第一次 list(it) = {list(it)}")
print(f"  第二次 list(it) = {list(it)}    ← 空了！")

# 列表可以反复遍历
lst = [1, 2, 3]
print(f"  列表第一次遍历: {[x for x in lst]}")
print(f"  列表第二次遍历: {[x for x in lst]}    ← 列表可重复")

# --- 5. 判断是否可迭代 / 是否迭代器 ---
print("\\n=== 5. 判断 ===")
from collections.abc import Iterable, Iterator

lst = [1, 2, 3]
it = iter(lst)
print(f"  列表: Iterable={isinstance(lst, Iterable)}, Iterator={isinstance(lst, Iterator)}")
print(f"  迭代器: Iterable={isinstance(it, Iterable)}, Iterator={isinstance(it, Iterator)}")
print(f"  range(3): Iterable={isinstance(range(3), Iterable)}, Iterator={isinstance(range(3), Iterator)}")

# --- 6. 字典遍历的迭代器 ---
print("\\n=== 6. 字典迭代器 ===")
d = {"a": 1, "b": 2, "c": 3}
print(f"  iter(dict) 遍历键: {list(iter(d))}")
print(f"  iter(d.keys()): {list(iter(d.keys()))}")
print(f"  iter(d.values()): {list(iter(d.values()))}")
print(f"  iter(d.items()): {list(iter(d.items()))}")

# --- 7. 文件也是可迭代 ---
print("\\n=== 7. 文件迭代 ===")
import tempfile, os
tmp = tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False, encoding="utf-8")
tmp.write("第一行\\n第二行\\n第三行\\n")
tmp.close()
try:
    with open(tmp.name, encoding="utf-8") as f:
        print("  逐行读文件:")
        for i, line in enumerate(f, 1):
            print(f"    第{i}行: {line.strip()}")
finally:
    os.unlink(tmp.name)

# --- 8. enumerate 和 zip 也是迭代器 ---
print("\\n=== 8. enumerate / zip ===")
names = ["小明", "小红", "小刚"]
scores = [90, 85, 92]
print("  enumerate:")
for i, name in enumerate(names):
    print(f"    {i}: {name}")
print("  zip:")
for name, score in zip(names, scores):
    print(f"    {name}: {score}")
print(f"  zip 本身: {zip(names, scores)}")
print(f"  list(zip(...)): {list(zip(names, scores))}")`
  },

  // -----------------------------------------------------------
  // 第 42 章：生成器函数
  // -----------------------------------------------------------
  {
    id: "py9-42",
    group: "迭代器与生成器",
    icon: "⚡",
    title: "生成器函数：用 yield 按需产值",
    content: `## 生成器是什么

普通函数用 \`return\` 返回一个值就结束了。**生成器函数**用 \`yield\`，每次产出一个值后"暂停"，下次调用接着上次的暂停点继续。

\`\`\`python
def counter():
    yield 1
    yield 2
    yield 3

g = counter()       # 调用生成器函数，得到生成器对象（不是执行！）
next(g)             # 1
next(g)             # 2
next(g)             # 3
next(g)             # StopIteration
\`\`\`

## 关键点

1. **函数里有 \`yield\`，调用它返回的是"生成器对象"，不会执行函数体**
2. **\`next()\` 触发执行，遇到 \`yield\` 暂停并返回 yield 的值**
3. **下次 \`next\` 从上次暂停处继续**
4. **函数结束（或 return）抛 \`StopIteration\`**

## 生成器 vs 列表

\`\`\`python
# 列表：一次性生成所有
def squares_list(n):
    return [i**2 for i in range(n)]

# 生成器：按需生成
def squares_gen(n):
    for i in range(n):
        yield i**2
\`\`\`

生成器**省内存**——\`squares_gen(1000000)\` 不占内存，用时才算。

## yield 的执行流程

\`\`\`python
def gen():
    print("开始")
    yield 1
    print("继续")
    yield 2
    print("结束")

g = gen()           # 没打印（没执行）
next(g)             # 打印"开始"，返回 1
next(g)             # 打印"继续"，返回 2
next(g)             # 打印"结束"，抛 StopIteration
\`\`\`

## 在 for 循环里用

生成器是迭代器，能直接用 \`for\`：

\`\`\`python
for x in squares_gen(5):
    print(x)        # 0, 1, 4, 9, 16
\`\`\`

## 无限生成器

生成器惰性，能表示"无限序列"：

\`\`\`python
def naturals():
    n = 1
    while True:
        yield n
        n += 1

# 不能 list(naturals())，会无限。但能取前 N 个
for x in naturals():
    if x > 5: break
    print(x)
\`\`\`

## 本章 demo

demo 演示 yield 的暂停/继续、对比列表、无限序列。`,
    code: `# ============================================
# 第 42 章：生成器函数
# ============================================

# --- 1. 最简单的生成器 ---
print("=== 1. 基本生成器 ===")
def counter():
    """yield 三个值"""
    yield 1
    yield 2
    yield 3

g = counter()              # 不执行函数体，返回生成器
print(f"  类型: {type(g).__name__}")
print(f"  next(g) = {next(g)}")
print(f"  next(g) = {next(g)}")
print(f"  next(g) = {next(g)}")
# next(g)  # StopIteration

# --- 2. yield 的暂停/继续 ---
print("\\n=== 2. 暂停继续 ===")
def trace_gen():
    print("  [1] 开始")
    x = yield "A"          # yield 表达式能接收 send 的值
    print(f"  [2] 收到 {x}")
    y = yield "B"
    print(f"  [3] 收到 {y}")
    yield "C"
    print("  [4] 结束")

g = trace_gen()
print(f"  第一次 next: {next(g)}")        # 到第一个 yield
print(f"  send(100): {g.send(100)}")      # 把 100 给第一个 yield
print(f"  send(200): {g.send(200)}")      # 给第二个 yield
try:
    next(g)
except StopIteration:
    print("  结束")

# --- 3. 生成器 vs 列表 ---
print("\\n=== 3. 生成器 vs 列表 ===")
def squares_list(n):
    """返回列表"""
    result = []
    for i in range(n):
        result.append(i ** 2)
    return result

def squares_gen(n):
    """生成器"""
    for i in range(n):
        yield i ** 2

lst = squares_list(5)
gen = squares_gen(5)
print(f"  列表: {lst}")
print(f"  生成器: {gen}    ← 是个对象")
print(f"  list(生成器): {list(gen)}")

# --- 4. 在 for 循环里用 ---
print("\\n=== 4. for 循环 ===")
print("  squares_gen(5):")
for x in squares_gen(5):
    print(f"    {x}", end=" ")
print()

# --- 5. 无限生成器 ---
print("\\n=== 5. 无限序列 ===")
def naturals():
    """自然数 1, 2, 3, ... 无限"""
    n = 1
    while True:
        yield n
        n += 1

def fibs():
    """斐波那契无限序列"""
    a, b = 1, 1
    while True:
        yield a
        a, b = b, a + b

# 取前 5 个自然数
print("  前5个自然数:", end=" ")
for i, x in enumerate(naturals()):
    if i >= 5: break
    print(x, end=" ")
print()

# 前8个斐波那契
print("  前8个斐波那契:", end=" ")
for i, x in enumerate(fibs()):
    if i >= 8: break
    print(x, end=" ")
print()

# --- 6. 实用：读大文件 ---
print("\\n=== 6. 模拟读大文件 ===")
def fake_lines(n):
    """模拟产生 n 行数据"""
    for i in range(n):
        yield f"第 {i+1} 行数据"

# 一行行处理，不占内存
total = 0
for line in fake_lines(1000):
    total += 1
print(f"  处理了 {total} 行（用生成器，没建 1000 行的列表）")

# --- 7. 实用：累加器 ---
print("\\n=== 7. 累加器 ===")
def running_total():
    """每次 send 一个数，返回当前总和"""
    total = 0
    while True:
        x = yield total
        total += x

acc = running_total()
next(acc)                  # 启动（到 yield）
print(f"  +10 → {acc.send(10)}")
print(f"  +20 → {acc.send(20)}")
print(f"  +5  → {acc.send(5)}")

# --- 8. 生成器表达式 ---
print("\\n=== 8. 生成器表达式 ===")
# (x for x in ...) 是生成器表达式
gen = (x ** 2 for x in range(5))
print(f"  类型: {type(gen).__name__}")
print(f"  list(gen) = {list(gen)}")

# 省内存：sum 不需要先建列表
big_sum = sum(x ** 2 for x in range(1000000))
print(f"  sum(x² for x in range(1000000)) = {big_sum}")
print("  ← 用生成器表达式，没建 100万 的列表")`
  },

  // -----------------------------------------------------------
  // 第 43 章：yield from 与生成器组合
  // -----------------------------------------------------------
  {
    id: "py9-43",
    group: "迭代器与生成器",
    icon: "🔗",
    title: "yield from：生成器的委托",
    content: `## yield from 是什么

\`yield from\` 把一个可迭代对象"展开"yield 出来，相当于简化版的 \`for x in ...: yield x\`：

\`\`\`python
# 这两个等价
def gen1():
    for x in [1, 2, 3]:
        yield x

def gen2():
    yield from [1, 2, 3]
\`\`\`

## 嵌套展开

\`yield from\` 特别适合处理嵌套结构：

\`\`\`python
def flatten(nested):
    for item in nested:
        if isinstance(item, list):
            yield from flatten(item)    # 递归委托
        else:
            yield item

list(flatten([1, [2, [3, 4], 5], 6]))
# [1, 2, 3, 4, 5, 6]
\`\`\`

不用 \`yield from\` 得写成：

\`\`\`python
for x in flatten(item):
    yield x
\`\`\`

## 生成器组合

把多个生成器串起来：

\`\`\`python
def odds():
    yield 1; yield 3; yield 5
def evens():
    yield 2; yield 4; yield 6
def all_nums():
    yield from odds()
    yield from evens()

list(all_nums())    # [1, 3, 5, 2, 4, 6]
\`\`\`

## yield from 的返回值

\`yield from\` 还能接收子生成器的 return 值（通过 \`StopIteration.value\`）：

\`\`\`python
def sub_gen():
    yield 1
    yield 2
    return "完成"

def main_gen():
    result = yield from sub_gen()
    print(f"子生成器返回: {result}")
\`\`\`

这个特性在协程里用得多，普通场景用得少。

## 本章 demo

demo 演示 yield from 展平、组合、返回值。`,
    code: `# ============================================
# 第 43 章：yield from
# ============================================

# --- 1. 基本用法 ---
print("=== 1. yield from 基础 ===")
def gen1():
    """传统写法"""
    for x in [1, 2, 3]:
        yield x

def gen2():
    """yield from 写法"""
    yield from [1, 2, 3]

print(f"  gen1: {list(gen1())}")
print(f"  gen2: {list(gen2())}    ← 效果一样")

# yield from 各种可迭代对象
def gen_all():
    yield from "abc"              # 字符串
    yield from [10, 20]           # 列表
    yield from range(3)           # range
    yield from (x*100 for x in [1,2])  # 生成器表达式

print(f"  混合: {list(gen_all())}")

# --- 2. 展平嵌套 ---
print("\\n=== 2. 展平嵌套 ===")
def flatten(nested):
    """展平任意层嵌套列表"""
    for item in nested:
        if isinstance(item, list):
            yield from flatten(item)    # 递归
        else:
            yield item

nested = [1, [2, 3, [4, 5]], 6, [[7, 8], 9]]
print(f"  原始: {nested}")
print(f"  展平: {list(flatten(nested))}")

# 更深的嵌套
deep = [[[[1]]], [[2, 3]], [4, [5, [6, [7]]]]]
print(f"  深嵌套: {list(flatten(deep))}")

# --- 3. 生成器组合 ---
print("\\n=== 3. 生成器组合 ===")
def odds():
    yield 1; yield 3; yield 5; yield 7
def evens():
    yield 2; yield 4; yield 6; yield 8
def primes():
    yield 2; yield 3; yield 5; yield 7

def all_numbers():
    """把三个生成器串起来"""
    yield from odds()
    yield from evens()
    yield from primes()

print(f"  odds + evens + primes = {list(all_numbers())}")

# --- 4. 分块处理 ---
print("\\n=== 4. 分块 ===")
def chunks(items, size):
    """把列表分成 size 大小的块"""
    for i in range(0, len(items), size):
        yield items[i:i+size]

def expand_chunks(items, size):
    """先分块，再每块前面加标记"""
    for i, chunk in enumerate(chunks(items, size)):
        yield f"--- 块 {i+1} ---"
        yield from chunk

data = list(range(1, 11))
print(f"  原始: {data}")
print(f"  分块展开:")
for x in expand_chunks(data, 3):
    print(f"    {x}")

# --- 5. yield from 的返回值 ---
print("\\n=== 5. 返回值 ===")
def sub_gen():
    """子生成器：最后 return 一个值"""
    yield 1
    yield 2
    yield 3
    return "子生成器完成"

def main_gen():
    """主生成器：用 yield from 接收返回值"""
    result = yield from sub_gen()
    print(f"  [main] 收到子生成器返回: {result}")
    yield "main 结束"

g = main_gen()
print("  遍历 main_gen:")
for x in g:
    print(f"    产出: {x}")

# --- 6. 实用：树遍历 ---
print("\\n=== 6. 树遍历 ===")
def walk_tree(node):
    """遍历嵌套字典树"""
    if isinstance(node, dict):
        for key, value in node.items():
            yield f"{key}"
            if isinstance(value, (dict, list)):
                yield from (f"  {x}" for x in walk_tree(value))
            else:
                yield f"  = {value}"
    elif isinstance(node, list):
        for i, item in enumerate(node):
            yield f"[{i}]"
            yield from (f"  {x}" for x in walk_tree(item))

tree = {
    "name": "公司",
    "depts": [
        {"name": "技术部", "head": "张三"},
        {"name": "市场部", "head": "李四"},
    ],
}
print("  遍历树:")
for line in walk_tree(tree):
    print(f"    {line}")

# --- 7. 管道：生成器串联 ---
print("\\n=== 7. 管道 ===")
def numbers():
    """产生数字"""
    yield from range(1, 11)

def squared(source):
    """把上游每个平方"""
    for x in source:
        yield x ** 2

def filtered(source, predicate):
    """过滤上游"""
    for x in source:
        if predicate(x):
            yield x

def limited(source, n):
    """只取前 n 个"""
    for i, x in enumerate(source):
        if i >= n:
            return
        yield x

# 串联：numbers → squared → filtered(偶数) → limited(3)
pipeline = limited(filtered(squared(numbers()), lambda x: x % 2 == 0), 3)
print(f"  1..10 → 平方 → 偶数 → 前3个: {list(pipeline)}")`
  },

  // -----------------------------------------------------------
  // 第 44 章：自定义迭代器类
  // -----------------------------------------------------------
  {
    id: "py9-44",
    group: "迭代器与生成器",
    icon: "🏗️",
    title: "自定义迭代器类：__iter__ 与 __next__",
    content: `## 用类实现迭代器

除了生成器函数，也可以用类实现迭代器。需要实现两个方法：

- \`__iter__(self)\`：返回迭代器（通常是 \`self\`）
- \`__next__(self)\`：返回下一个值，没值了抛 \`StopIteration\`

\`\`\`python
class Counter:
    def __init__(self, low, high):
        self.current = low
        self.high = high
    def __iter__(self):
        return self
    def __next__(self):
        if self.current >= self.high:
            raise StopIteration
        x = self.current
        self.current += 1
        return x

for x in Counter(1, 5):
    print(x)    # 1 2 3 4
\`\`\`

## 可迭代对象 vs 迭代器：分开实现

上面的 Counter 既是可迭代对象又是迭代器（每次 \`iter()\` 返回 \`self\`，所以**一次性**）。

如果想**可重复遍历**，分开实现：

\`\`\`python
class CounterIterable:
    """可重复遍历的计数器"""
    def __init__(self, low, high):
        self.low = low
        self.high = high
    def __iter__(self):
        # 每次返回一个新的迭代器
        return CounterIterator(self.low, self.high)

class CounterIterator:
    def __init__(self, low, high):
        self.current = low
        self.high = high
    def __iter__(self):
        return self
    def __next__(self):
        if self.current >= self.high:
            raise StopIteration
        x = self.current
        self.current += 1
        return x
\`\`\`

这样 \`CounterIterable\` 能反复 \`for\`，因为每次都新建迭代器。**range 就是这么实现的**。

## 什么时候用类而不是生成器

- 需要维护复杂状态
- 需要多个方法配合
- 要可重复遍历

简单情况用生成器函数更简洁。

## 本章 demo

demo 实现计数器、可重复遍历的迭代器、实用例子。`,
    code: `# ============================================
# 第 44 章：自定义迭代器类
# ============================================

# --- 1. 最简单的迭代器类 ---
print("=== 1. 计数器迭代器 ===")
class Counter:
    """从 low 数到 high（不含）"""
    def __init__(self, low, high):
        self.current = low
        self.high = high

    def __iter__(self):
        return self              # 自己就是迭代器

    def __next__(self):
        if self.current >= self.high:
            raise StopIteration
        x = self.current
        self.current += 1
        return x

print("  Counter(1, 5):", end=" ")
for x in Counter(1, 5):
    print(x, end=" ")
print()

# 用 next 手动
c = Counter(10, 13)
print(f"  next: {next(c)}, {next(c)}, {next(c)}")

# --- 2. 一次性的问题 ---
print("\\n=== 2. 一次性 ===")
c = Counter(1, 4)
print(f"  第一次遍历: {list(c)}")
print(f"  第二次遍历: {list(c)}    ← 空了！状态耗尽")

# --- 3. 可重复遍历：分离可迭代对象和迭代器 ---
print("\\n=== 3. 可重复遍历 ===")
class Range2:
    """像 range 一样可重复遍历"""
    def __init__(self, start, end, step=1):
        self.start = start
        self.end = end
        self.step = step

    def __iter__(self):
        # 关键：每次返回一个新迭代器
        return Range2Iterator(self.start, self.end, self.step)

class Range2Iterator:
    def __init__(self, start, end, step):
        self.current = start
        self.end = end
        self.step = step
    def __iter__(self):
        return self
    def __next__(self):
        if self.current >= self.end:
            raise StopIteration
        x = self.current
        self.current += self.step
        return x

r = Range2(0, 10, 2)
print(f"  第一次: {list(r)}")
print(f"  第二次: {list(r)}    ← 可重复！")
print(f"  for 循环: ", end="")
for x in r:
    print(x, end=" ")
print()

# --- 4. 实用：斐波那契迭代器 ---
print("\\n=== 4. 斐波那契迭代器 ===")
class Fibonacci:
    """斐波那契数列迭代器，最多产生 n 个"""
    def __init__(self, n):
        self.n = n
        self.count = 0
        self.a, self.b = 1, 1

    def __iter__(self):
        return self

    def __next__(self):
        if self.count >= self.n:
            raise StopIteration
        x = self.a
        self.a, self.b = self.b, self.a + self.b
        self.count += 1
        return x

print(f"  前10个斐波那契: {list(Fibonacci(10))}")

# --- 5. 实用：倒计时 ---
print("\\n=== 5. 倒计时 ===")
class Countdown:
    """从 n 倒数到 1"""
    def __init__(self, start):
        self.current = start
    def __iter__(self):
        return self
    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        x = self.current
        self.current -= 1
        return x

print("  倒计时:", end=" ")
for x in Countdown(5):
    print(x, end=" ")
print()

# --- 6. 实用：读取数据（带索引）---
print("\\n=== 6. 带索引迭代 ===")
class Enumerate2:
    """自己实现 enumerate"""
    def __init__(self, iterable, start=0):
        self.iterator = iter(iterable)
        self.count = start
    def __iter__(self):
        return self
    def __next__(self):
        item = next(self.iterator)     # 可能抛 StopIteration，自动传播
        result = (self.count, item)
        self.count += 1
        return result

print("  Enumerate2(['a','b','c']):")
for i, x in Enumerate2(["a", "b", "c"], start=1):
    print(f"    {i}: {x}")

# --- 7. 实用：循环缓冲区 ---
print("\\n=== 7. 循环迭代 ===")
class Cycle:
    """无限循环遍历一个序列（像 itertools.cycle）"""
    def __init__(self, iterable):
        self.items = list(iterable)
        self.index = 0
    def __iter__(self):
        return self
    def __next__(self):
        if not self.items:
            raise StopIteration
        x = self.items[self.index]
        self.index = (self.index + 1) % len(self.items)
        return x

# 取前 7 个
c = Cycle(["A", "B", "C"])
print("  Cycle(['A','B','C']) 前7个:", end=" ")
for i, x in enumerate(c):
    if i >= 7: break
    print(x, end=" ")
print()

# --- 8. 对比：生成器函数更简洁 ---
print("\\n=== 8. 对比生成器 ===")
def counter_gen(low, high):
    """生成器版，4 行搞定"""
    current = low
    while current < high:
        yield current
        current += 1

print(f"  类版 Counter(1,5): {list(Counter(1, 5))}")
print(f"  生成器版 counter_gen(1,5): {list(counter_gen(1, 5))}")
print("  → 简单场景用生成器，复杂状态/可重复用类")`
  },

  // -----------------------------------------------------------
  // 第 45 章：itertools 精讲
  // -----------------------------------------------------------
  {
    id: "py9-45",
    group: "迭代器与生成器",
    icon: "🧰",
    title: "itertools：迭代工具箱",
    content: `## itertools 是什么

\`itertools\` 是标准库的"迭代工具箱"，提供一堆处理迭代器的高效函数。它们都是**惰性**的——按需产生，省内存。

## 无限迭代器

\`\`\`python
from itertools import count, cycle, repeat

count(10)           # 10, 11, 12, ... 无限
count(10, 2)        # 10, 12, 14, ...
cycle("ABC")        # A, B, C, A, B, C, ... 无限
repeat("x", 3)      # x, x, x（指定次数）
\`\`\`

## 累积：accumulate

\`\`\`python
from itertools import accumulate
list(accumulate([1, 2, 3, 4]))    # [1, 3, 6, 10] 累加
list(accumulate([1, 2, 3, 4], lambda a, b: a * b))  # [1, 2, 6, 24] 累乘
\`\`\`

## 链接：chain

\`\`\`python
from itertools import chain
list(chain([1, 2], [3, 4], [5]))    # [1, 2, 3, 4, 5]
\`\`\`

\`chain.from_iterable\` 接收嵌套：

\`\`\`python
list(chain.from_iterable([[1, 2], [3, 4]]))    # [1, 2, 3, 4]
\`\`\`

## 分组：groupby

按 key 分组（**必须先排序**，因为只对相邻相同元素分组）：

\`\`\`python
from itertools import groupby
data = [("A", 1), ("A", 2), ("B", 3), ("B", 4)]
for key, group in groupby(data, key=lambda x: x[0]):
    print(key, list(group))
# A [('A', 1), ('A', 2)]
# B [('B', 3), ('B', 4)]
\`\`\`

## 排列组合

\`\`\`python
from itertools import permutations, combinations, product

permutations([1, 2, 3])           # 全排列
permutations([1, 2, 3], 2)        # 选 2 排列
combinations([1, 2, 3, 4], 2)     # 选 2 组合（不重复）
product([1, 2], ["a", "b"])       # 笛卡尔积
\`\`\`

## 切片：islice

\`\`\`python
from itertools import islice
list(islice(count(), 5))           # [0, 1, 2, 3, 4] 取前 5
list(islice(range(100), 2, 8, 2))  # [2, 4, 6] 类似切片
\`\`\`

## 过滤：takewhile / dropwhile

\`\`\`python
from itertools import takewhile, dropwhile
list(takewhile(lambda x: x < 5, [1, 2, 5, 3, 4]))   # [1, 2] 取到不满足为止
list(dropwhile(lambda x: x < 5, [1, 2, 5, 3, 4]))   # [5, 3, 4] 丢弃到不满足
\`\`\`

## 本章 demo

demo 演示 itertools 常用函数。`,
    code: `# ============================================
# 第 45 章：itertools
# ============================================
from itertools import (
    count, cycle, repeat, accumulate, chain, groupby,
    permutations, combinations, product, islice,
    takewhile, dropwhile, starmap, zip_longest
)

# --- 1. 无限迭代器 ---
print("=== 1. 无限迭代器 ===")
# count
print(f"  count(10, 2) 前5个: {list(islice(count(10, 2), 5))}")
# cycle
print(f"  cycle('ABC') 前7个: {list(islice(cycle('ABC'), 7))}")
# repeat
print(f"  repeat('x', 4): {list(repeat('x', 4))}")
print(f"  repeat(5) 前3个: {list(islice(repeat(5), 3))}")

# --- 2. accumulate 累积 ---
print("\\n=== 2. accumulate ===")
nums = [1, 2, 3, 4, 5]
print(f"  原始: {nums}")
print(f"  累加: {list(accumulate(nums))}")
print(f"  累乘: {list(accumulate(nums, lambda a, b: a * b))}")
print(f"  取大: {list(accumulate(nums, max))}    ← 每步取最大")

# --- 3. chain 链接 ---
print("\\n=== 3. chain ===")
print(f"  chain([1,2],[3,4],[5]): {list(chain([1,2], [3,4], [5]))}")
print(f"  chain.from_iterable: {list(chain.from_iterable([[1,2], [3,4], [5]]))}")
# 不同类型也能链
print(f"  混合: {list(chain('ab', [1, 2], (True, False)))}")

# --- 4. groupby 分组 ---
print("\\n=== 4. groupby ===")
# 按首字母分组（必须先排序）
words = ["apple", "ant", "banana", "berry", "cat", "cherry"]
words.sort(key=lambda w: w[0])    # groupby 要求先排序
print(f"  按首字母分组:")
for first, group in groupby(words, key=lambda w: w[0]):
    print(f"    {first}: {list(group)}")

# 按奇偶分组
nums = [1, 1, 2, 2, 2, 3, 3, 3, 3]
print(f"  按值分组（连续相同）:")
for val, group in groupby(nums):
    print(f"    {val}: 重复 {len(list(group))} 次")

# --- 5. 排列组合 ---
print("\\n=== 5. 排列组合 ===")
items = [1, 2, 3]
print(f"  permutations({items}): {list(permutations(items))}")
print(f"  permutations({items}, 2): {list(permutations(items, 2))}")
print(f"  combinations({items}, 2): {list(combinations(items, 2))}")
print(f"  combinations({items}, 2) 数量: {len(list(combinations(items, 2)))}")

# 笛卡尔积
print(f"  product([1,2], ['a','b']): {list(product([1,2], ['a','b']))}")
# 多个列表
sizes = ["S", "M"]
colors = ["红", "蓝"]
print(f"  衣服组合: {list(product(sizes, colors))}")

# --- 6. islice 切片 ---
print("\\n=== 6. islice ===")
# 对无限迭代器切片
print(f"  count() 前5: {list(islice(count(), 5))}")
# 类似 list[start:stop:step]
big = list(range(20))
print(f"  range(20)[2:8:2]: {list(islice(big, 2, 8, 2))}")

# --- 7. takewhile / dropwhile ---
print("\\n=== 7. takewhile / dropwhile ===")
data = [1, 2, 3, 4, 1, 2]
print(f"  原始: {data}")
print(f"  takewhile(<4): {list(takewhile(lambda x: x < 4, data))}    ← 一旦不满足就停")
print(f"  dropwhile(<4): {list(dropwhile(lambda x: x < 4, data))}    ← 一旦不满足就开始")

# --- 8. zip_longest ---
print("\\n=== 8. zip_longest ===")
# 普通 zip 以短的为准
print(f"  zip([1,2,3], [4,5]): {list(zip([1,2,3], [4,5]))}    ← 截到短的")
# zip_longest 用 fillvalue 补齐
print(f"  zip_longest([1,2,3], [4,5]): {list(zip_longest([1,2,3], [4,5], fillvalue='?'))}")

# --- 9. starmap ---
print("\\n=== 9. starmap ===")
# starmap 把元组解包成参数
pairs = [(2, 3), (4, 5), (6, 7)]
print(f"  starmap(pow, {pairs}): {list(starmap(pow, pairs))}    ← 2³, 4⁵, 6⁷")
# 等价于 [pow(*p) for p in pairs]

# --- 10. 实用：组合管道 ---
print("\\n=== 10. 实用管道 ===")
# 生成 1-20 → 取偶数 → 平方 → 取前 5
pipeline = islice(
    (x ** 2 for x in range(1, 21) if x % 2 == 0),
    5
)
print(f"  1-20偶数平方前5: {list(pipeline)}")

# 用 itertools 重写
from itertools import filterfalse
evens = filterfalse(lambda x: x % 2, range(1, 21))   # 偶数
squared = map(lambda x: x ** 2, evens)
result = list(islice(squared, 5))
print(f"  itertools版: {result}")`
  },

  // -----------------------------------------------------------
  // 第 46 章：生成器实战
  // -----------------------------------------------------------
  {
    id: "py9-46",
    group: "迭代器与生成器",
    icon: "🎯",
    title: "生成器实战：流式处理大文件",
    content: `## 生成器的杀手锏：处理大数据

生成器最大的价值是**处理大数据时不占内存**。这章用几个实战例子展示。

## 实战1：读大文件统计

普通做法：

\`\`\`python
lines = open("big.log").readlines()    # 全读进内存
total = sum(1 for line in lines)
\`\`\`

文件 10GB 就爆内存。用生成器：

\`\`\`python
def count_lines(path):
    with open(path) as f:
        for line in f:                  # 一行行读
            yield line

total = sum(1 for _ in count_lines("big.log"))
\`\`\`

\`open()\` 本身就是可迭代的，一行行读不占内存。

## 实战2：CSV 流式处理

\`\`\`python
import csv
def process_csv(path):
    with open(path) as f:
        reader = csv.reader(f)
        next(reader)                    # 跳表头
        for row in reader:
            yield row
\`\`\`

## 实战3：日志分析管道

\`\`\`python
def read_log(path):
    with open(path) as f:
        yield from f

def parse_line(lines):
    for line in lines:
        yield line.split()

def filter_error(rows):
    for row in rows:
        if "ERROR" in row:
            yield row

# 管道：read → parse → filter → count
errors = sum(1 for _ in filter_error(parse_line(read_log("app.log"))))
\`\`\`

每一步都是生成器，数据"流"过去，不堆积。

## 实战4：分批处理

\`\`\`python
def batch(iterable, size):
    """分批，每批 size 个"""
    batch = []
    for item in iterable:
        batch.append(item)
        if len(batch) == size:
            yield batch
            batch = []
    if batch:
        yield batch

for b in batch(range(10), 3):
    print(b)    # [0,1,2], [3,4,5], [6,7,8], [9]
\`\`\`

## 实战5：滑窗

\`\`\`python
def window(iterable, n):
    """滑动窗口"""
    from collections import deque
    it = iter(iterable)
    d = deque(maxlen=n)
    for x in it:
        d.append(x)
        if len(d) == n:
            yield tuple(d)

for w in window([1,2,3,4,5], 3):
    print(w)    # (1,2,3), (2,3,4), (3,4,5)
\`\`\`

## 本章 demo

demo 模拟日志分析管道、分批、滑窗。`,
    code: `# ============================================
# 第 46 章：生成器实战
# ============================================
import tempfile
import os
from collections import deque

# ============================================================
# 实战1：模拟大日志文件 + 流式统计
# ============================================================
print("=== 1. 流式统计日志 ===")
# 造一个"大"日志文件
log_path = tempfile.mktemp(suffix=".log")
with open(log_path, "w") as f:
    for i in range(1000):
        level = "ERROR" if i % 7 == 0 else "INFO"
        f.write(f"{level} 2024-01-{i%30+1:02d} message-{i}\\n")

def read_lines(path):
    """生成器：一行行读文件"""
    with open(path, encoding="utf-8") as f:
        yield from f

def parse_log(lines):
    """解析每行"""
    for line in lines:
        parts = line.strip().split(maxsplit=1)
        if len(parts) >= 1:
            yield parts[0]    # 只取日志级别

def filter_level(levels, target):
    """过滤特定级别"""
    for level in levels:
        if level == target:
            yield level

# 管道：读 → 解析 → 过滤 ERROR → 计数
error_count = sum(1 for _ in filter_level(parse_log(read_lines(log_path)), "ERROR"))
print(f"  日志共 1000 行，ERROR 数量: {error_count}")
print(f"  (用管道，全程不把 1000 行全放内存)")

os.unlink(log_path)

# ============================================================
# 实战2：分批处理
# ============================================================
print("\\n=== 2. 分批处理 ===")
def batch(iterable, size):
    """把可迭代对象分成 size 大小的批"""
    current = []
    for item in iterable:
        current.append(item)
        if len(current) == size:
            yield current
            current = []
    if current:
        yield current

# 分批处理 1-10
print("  batch(range(1,11), 3):")
for i, b in enumerate(batch(range(1, 11), 3), 1):
    print(f"    第{i}批: {b}")

# 模拟批量插入数据库
def fake_insert(batch_data):
    print(f"    [DB] 插入 {len(batch_data)} 条: {batch_data[:3]}...")

print("\\n  模拟批量插入（每批 5 条）:")
for b in batch(range(1, 23), 5):
    fake_insert(b)

# ============================================================
# 实战3：滑动窗口
# ============================================================
print("\\n=== 3. 滑动窗口 ===")
def window(iterable, n):
    """大小为 n 的滑动窗口"""
    it = iter(iterable)
    d = deque(maxlen=n)
    for x in it:
        d.append(x)
        if len(d) == n:
            yield tuple(d)

data = [1, 2, 3, 4, 5, 6]
print(f"  原始: {data}")
print(f"  window(,3):")
for w in window(data, 3):
    print(f"    {w}")

# 移动平均
prices = [10, 12, 11, 13, 15, 14, 16]
print(f"\\n  股价: {prices}")
print(f"  3日移动平均:")
for w in window(prices, 3):
    avg = sum(w) / len(w)
    print(f"    {w} → 平均 {avg:.2f}")

# ============================================================
# 实战4：CSV 流式处理
# ============================================================
print("\\n=== 4. CSV 流式处理 ===")
csv_path = tempfile.mktemp(suffix=".csv")
with open(csv_path, "w", encoding="utf-8") as f:
    f.write("name,age,score\\n")
    for i in range(1, 21):
        f.write(f"学生{i},{18+i%5},{60+i*2}\\n")

def read_csv_rows(path):
    """流式读 CSV，跳过表头"""
    with open(path, encoding="utf-8") as f:
        lines = f.readlines()
    # 跳表头
    for line in lines[1:]:
        parts = line.strip().split(",")
        if len(parts) == 3:
            yield {"name": parts[0], "age": int(parts[1]), "score": int(parts[2])}

# 流式统计：不求平均，求最高分
max_score = 0
max_student = None
for row in read_csv_rows(csv_path):
    if row["score"] > max_score:
        max_score = row["score"]
        max_student = row["name"]

print(f"  CSV 共 20 行，最高分: {max_student} = {max_score}")
os.unlink(csv_path)

# ============================================================
# 实战5：数据管道（综合）
# ============================================================
print("\\n=== 5. 数据管道 ===")
def numbers(start, end):
    """产生数字"""
    yield from range(start, end)

def squared(source):
    """平方"""
    for x in source:
        yield x ** 2

def only_even(source):
    """只留偶数"""
    for x in source:
        if x % 2 == 0:
            yield x

def with_index(source):
    """加索引"""
    i = 0
    for x in source:
        yield (i, x)
        i += 1

def take(source, n):
    """取前 n 个"""
    for i, x in enumerate(source):
        if i >= n:
            return
        yield x

# 1-20 → 平方 → 偶数 → 加索引 → 取前5
pipeline = take(with_index(only_even(squared(numbers(1, 21)))), 5)
print("  管道: 1-20 → 平方 → 偶数 → 索引 → 前5")
for idx, val in pipeline:
    print(f"    [{idx}] {val}")

# ============================================================
# 实战6：惰性无限序列
# ============================================================
print("\\n=== 6. 无限序列取前 N ===")
def primes():
    """生成素数（无限）"""
    yield 2
    n = 3
    while True:
        is_prime = True
        for i in range(2, int(n**0.5) + 1):
            if n % i == 0:
                is_prime = False
                break
        if is_prime:
            yield n
        n += 2

# 取前 15 个素数
print("  前15个素数:", end=" ")
p = primes()
for _ in range(15):
    print(next(p), end=" ")
print()

# 用 islice
from itertools import islice
print(f"  用 islice: {list(islice(primes(), 10))}")`
  },

  // -----------------------------------------------------------
  // 第 47 章：推导式深入
  // -----------------------------------------------------------
  {
    id: "py9-47",
    group: "迭代器与生成器",
    icon: "✨",
    title: "推导式深入：嵌套、多变量、性能",
    content: `## 推导式不止是简单变换

第 19 章讲过基础推导式。这章深入：嵌套、多变量、性能权衡。

## 多变量推导式

\`\`\`python
# 遍历键值对
{v: k for k, v in pairs}
# 遍历二维
[abs(x) for row in matrix for x in row]
\`\`\`

## 嵌套推导式

\`\`\`python
# 矩阵转置
matrix = [[1, 2, 3], [4, 5, 6]]
[[row[i] for row in matrix] for i in range(len(matrix[0]))]
# [[1, 4], [2, 5], [3, 6]]
\`\`\`

外层 \`for\` 决定"行"，内层 \`for\` 决定"列"。

## 双重 for 的顺序

\`\`\`python
# 这两个等价
[x for row in matrix for x in row]
# 等价于
result = []
for row in matrix:
    for x in row:
        result.append(x)
\`\`\`

顺序：**左到右对应外到内**。\`[x for a in A for b in B]\` 相当于 \`for a: for b:\`。

## 带 if 的位置

\`\`\`python
# if 在后面：过滤
[x for x in nums if x > 0]
# if 在前面：三元表达式
[x if x > 0 else 0 for x in nums]
\`\`\`

位置不同含义不同：
- 后面 \`if\`：**要不要这个元素**
- 前面 \`if\`：**这个元素取什么值**

## 字典/集合推导式

\`\`\`python
{word: len(word) for word in words}    # 字典
{len(word) for word in words}          # 集合（去重）
\`\`\`

## 性能：推导式 vs 循环

推导式比 \`for + append\` 快 20%-30%，因为底层优化了。但**生成器表达式**更省内存（不建列表）。

\`\`\`python
# 建列表（占内存）
[x**2 for x in range(10**6)]
# 生成器（省内存）
(x**2 for x in range(10**6))
\`\`\`

规则：
- 要多次遍历 / 要下标 / 要 len → 列表推导式
- 只遍历一次（求 sum、max、传给 for）→ 生成器表达式

## 不要过度使用

\`\`\`python
# ❌ 难读
result = [f(x) for x in xs if g(x) > 0 for y in ys if h(y) ...]

# ✅ 拆开
temp = [f(x) for x in xs if g(x) > 0]
result = [do(x, y) for x in temp for y in ys if h(y)]
\`\`\`

## 本章 demo

demo 演示各种推导式和性能对比。`,
    code: `# ============================================
# 第 47 章：推导式深入
# ============================================

# --- 1. 多变量推导式 ---
print("=== 1. 多变量 ===")
# 字典反转
pairs = {"a": 1, "b": 2, "c": 3}
reversed_dict = {v: k for k, v in pairs.items()}
print(f"  原始: {pairs}")
print(f"  反转: {reversed_dict}")

# 两列表配对
names = ["小明", "小红", "小刚"]
scores = [90, 85, 92]
mapping = {n: s for n, s in zip(names, scores)}
print(f"  配对: {mapping}")

# --- 2. 双重 for ---
print("\\n=== 2. 双重 for ===")
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
print(f"  矩阵: {matrix}")

# 展平
flat = [x for row in matrix for x in row]
print(f"  展平: {flat}")

# 等价的循环写法
flat2 = []
for row in matrix:
    for x in row:
        flat2.append(x)
print(f"  循环版: {flat2}")

# --- 3. 嵌套推导式 ---
print("\\n=== 3. 嵌套推导式 ===")
# 矩阵转置
transposed = [[row[i] for row in matrix] for i in range(len(matrix[0]))]
print(f"  原始: {matrix}")
print(f"  转置: {transposed}")

# 单位矩阵
n = 4
identity = [[1 if i == j else 0 for j in range(n)] for i in range(n)]
print(f"  {n}x{n} 单位矩阵:")
for row in identity:
    print(f"    {row}")

# 乘法表
table = [[i * j for j in range(1, 6)] for i in range(1, 6)]
print(f"  乘法表:")
for row in table:
    print(f"    {row}")

# --- 4. if 的位置 ---
print("\\n=== 4. if 位置 ===")
nums = [-3, 1, -5, 2, -1, 4]

# if 在后：过滤
positives = [x for x in nums if x > 0]
print(f"  过滤正数: {positives}")

# if 在前：三元
abs_vals = [x if x > 0 else -x for x in nums]
print(f"  取绝对值: {abs_vals}")

# 组合：过滤 + 变换
squares_of_pos = [x**2 for x in nums if x > 0]
print(f"  正数的平方: {squares_of_pos}")

# 分类
labels = ["偶" if x % 2 == 0 else "奇" for x in range(1, 6)]
print(f"  奇偶标签: {labels}")

# --- 5. 字典/集合推导式 ---
print("\\n=== 5. 字典/集合 ===")
words = ["apple", "banana", "cherry", "date", "fig"]

# 字典：单词 → 长度
word_len = {w: len(w) for w in words}
print(f"  单词长度: {word_len}")

# 集合：所有长度（去重）
lengths = {len(w) for w in words}
print(f"  长度集合: {lengths}")

# 统计字符出现
text = "hello world"
char_count = {c: text.count(c) for c in set(text) if c.isalpha()}
print(f"  字符计数: {char_count}")

# --- 6. 实用：分组 ---
print("\\n=== 6. 分组 ===")
students = [("小明", 90), ("小红", 85), ("小刚", 78), ("小亮", 92), ("小美", 67)]

# 按是否及格分组
from collections import defaultdict
groups = defaultdict(list)
for name, score in students:
    key = "及格" if score >= 60 else "不及格"
    groups[key].append(name)
print(f"  按及格: {dict(groups)}")

# 用字典推导式按分数段
by_grade = {
    "优秀": [n for n, s in students if s >= 90],
    "良好": [n for n, s in students if 80 <= s < 90],
    "及格": [n for n, s in students if 60 <= s < 80],
    "不及格": [n for n, s in students if s < 60],
}
print(f"  按等级: {by_grade}")

# --- 7. 性能对比 ---
print("\\n=== 7. 性能 ===")
import time

# 列表推导式 vs 循环 vs map
N = 1_000_000

# 循环
start = time.time()
result1 = []
for i in range(N):
    result1.append(i ** 2)
t_loop = time.time() - start

# 推导式
start = time.time()
result2 = [i ** 2 for i in range(N)]
t_comp = time.time() - start

# map
start = time.time()
result3 = list(map(lambda x: x ** 2, range(N)))
t_map = time.time() - start

print(f"  N = {N:,}")
print(f"  循环:        {t_loop:.3f}s")
print(f"  推导式:      {t_comp:.3f}s")
print(f"  map:         {t_map:.3f}s")
print(f"  推导式比循环快: {t_loop/t_comp:.2f}x")

# --- 8. 生成器表达式省内存 ---
print("\\n=== 8. 内存对比 ===")
import sys

lst = [x ** 2 for x in range(10000)]
gen = (x ** 2 for x in range(10000))
print(f"  列表大小: {sys.getsizeof(lst)} 字节")
print(f"  生成器大小: {sys.getsizeof(gen)} 字节    ← 固定小")
print(f"  列表 / 生成器 = {sys.getsizeof(lst) / sys.getsizeof(gen):.0f}x")

# 求和：生成器够用
total = sum(x ** 2 for x in range(10000))    # 不加括号也行
print(f"  sum(生成器) = {total}")`
  },

  // -----------------------------------------------------------
  // 第 48 章：迭代器综合实战
  // -----------------------------------------------------------
  {
    id: "py9-48",
    group: "迭代器与生成器",
    icon: "🏆",
    title: "迭代器综合实战：日志分析系统",
    content: `## 把迭代器/生成器知识串起来

用生成器实现一个"日志分析管道"，体现惰性求值、管道组合、内存友好的优势。

## 需求

- 读日志文件（模拟）
- 解析每行
- 按级别过滤
- 统计、排序、分组
- 输出报告

## 设计：管道模式

\`\`\`
read → parse → filter → group → count → report
\`\`\`

每一步是生成器，数据"流"过去。即使日志 100GB，内存占用恒定。

## 涉及知识

- 生成器函数（yield）
- yield from
- 生成器表达式
- itertools（groupby、islice）
- collections（Counter、defaultdict）
- 推导式
- 自定义迭代器（可选）

## 优势

1. **内存友好**：不一次性读全文件
2. **可组合**：每步独立，像 Unix 管道
3. **可复用**：每个生成器能用在别处
4. **可测试**：每步输入输出明确

## 本章 demo

完整实现日志分析管道。`,
    code: `# ============================================
# 第 48 章：迭代器综合实战 - 日志分析管道
# ============================================
import tempfile
import os
from collections import Counter, defaultdict
from itertools import groupby, islice

# ============================================================
# 1. 模拟日志文件
# ============================================================
def create_log(path, n=500):
    """生成 n 行模拟日志"""
    import random
    levels = ["INFO", "WARN", "ERROR", "DEBUG"]
    weights = [50, 20, 10, 20]    # INFO 最多
    modules = ["auth", "db", "api", "cache"]
    with open(path, "w", encoding="utf-8") as f:
        for i in range(n):
            level = random.choices(levels, weights=weights)[0]
            module = random.choice(modules)
            f.write(f"2024-01-{(i%30)+1:02d} 10:{i%60:02d}:00 [{level}] {module} - 事件 #{i}\\n")

log_path = tempfile.mktemp(suffix=".log")
create_log(log_path, 500)

# ============================================================
# 2. 管道组件（每个都是生成器）
# ============================================================

def read_lines(path):
    """组件1：读文件，一行行产出"""
    with open(path, encoding="utf-8") as f:
        yield from f

def parse_log(lines):
    """组件2：解析每行为字典"""
    for line in lines:
        # 格式: 2024-01-15 10:30:00 [INFO] auth - 事件 #123
        try:
            date_part = line[:10]
            time_part = line[11:19]
            level = line.split("[")[1].split("]")[0]
            rest = line.split("]")[1].strip()
            module = rest.split(" - ")[0].strip()
            message = rest.split(" - ", 1)[1] if " - " in rest else ""
            yield {
                "date": date_part,
                "time": time_part,
                "level": level,
                "module": module,
                "message": message,
            }
        except (IndexError, ValueError):
            continue    # 跳过格式不对的

def filter_level(entries, levels):
    """组件3：过滤特定级别"""
    for e in entries:
        if e["level"] in levels:
            yield e

def filter_module(entries, module):
    """组件4：过滤特定模块"""
    for e in entries:
        if e["module"] == module:
            yield e

def extract_field(entries, field):
    """组件5：提取某字段"""
    for e in entries:
        yield e[field]

# ============================================================
# 3. 分析函数
# ============================================================

def count_by(lines_iter, key_func):
    """按 key 统计计数"""
    counter = Counter()
    for item in lines_iter:
        counter[key_func(item)] += 1
    return counter

def take(iterable, n):
    """取前 n 个"""
    return list(islice(iterable, n))

# ============================================================
# 4. 主程序：组装管道
# ============================================================
print("=" * 55)
print("日志分析系统（生成器管道）")
print("=" * 55)

# 管道1：统计各级别数量
print("\\n--- 1. 各级别日志数量 ---")
# 注意：read_lines 只能遍历一次，每次分析要重新建管道
counts = count_by(
    parse_log(read_lines(log_path)),
    lambda e: e["level"]
)
for level in ["INFO", "WARN", "ERROR", "DEBUG"]:
    print(f"  {level:6}: {counts.get(level, 0)}")

# 管道2：统计各模块错误数
print("\\n--- 2. 各模块 ERROR 数 ---")
error_counts = count_by(
    filter_level(parse_log(read_lines(log_path)), {"ERROR"}),
    lambda e: e["module"]
)
for module, count in error_counts.most_common():
    print(f"  {module:8}: {count}")

# 管道3：前 5 条 ERROR 日志
print("\\n--- 3. 前 5 条 ERROR ---")
errors = take(
    filter_level(parse_log(read_lines(log_path)), {"ERROR"}),
    5
)
for i, e in enumerate(errors, 1):
    print(f"  {i}. [{e['level']}] {e['module']}: {e['message']}")

# 管道4：按日期统计
print("\\n--- 4. 按日期统计日志数 ---")
date_counts = count_by(
    parse_log(read_lines(log_path)),
    lambda e: e["date"]
)
print("  前 5 个日期:")
for date, count in sorted(date_counts.items())[:5]:
    print(f"    {date}: {count} 条")

# 管道5：综合 - WARNING 和 ERROR 按模块分组
print("\\n--- 5. 问题日志按模块分组 ---")
problems = filter_level(parse_log(read_lines(log_path)), {"WARN", "ERROR"})
# 按 module 排序后 groupby
sorted_problems = sorted(problems, key=lambda e: e["module"])
for module, group in groupby(sorted_problems, key=lambda e: e["module"]):
    items = list(group)
    warn_count = sum(1 for g in items if g["level"] == "WARN")
    err_count = sum(1 for g in items if g["level"] == "ERROR")
    print(f"  {module:8}: WARN={warn_count}, ERROR={err_count}")

# 管道6：内存效率演示
print("\\n--- 6. 内存效率 ---")
import sys
# 直接读所有行
with open(log_path) as f:
    all_lines = f.readlines()
print(f"  文件 {len(all_lines)} 行，全读占 {sys.getsizeof(all_lines) + sum(sys.getsizeof(l) for l in all_lines):,} 字节")
print(f"  用生成器管道：内存恒定（每行处理完即丢）")

# 管道7：用生成器表达式简化
print("\\n--- 7. 生成器表达式简化 ---")
# 一行统计 ERROR 数
error_count = sum(1 for e in parse_log(read_lines(log_path)) if e["level"] == "ERROR")
print(f"  ERROR 总数（一行）: {error_count}")

# 各模块 ERROR 数（一行）
from collections import Counter
module_errors = Counter(e["module"] for e in parse_log(read_lines(log_path)) if e["level"] == "ERROR")
print(f"  各模块 ERROR: {dict(module_errors)}")

# 清理
os.unlink(log_path)

print("\\n" + "=" * 55)
print("迭代器知识点回顾")
print("=" * 55)
print("• 可迭代对象 __iter__ / 迭代器 __next__")
print("• for 循环本质：iter → next → StopIteration")
print("• 生成器函数 yield（暂停/继续）")
print("• yield from（委托/展平）")
print("• 自定义迭代器类")
print("• itertools 工具箱")
print("• 生成器表达式（省内存）")
print("• 推导式深入（嵌套/多变量）")
print("• 管道模式（流式处理大数据）")`
  }
];
