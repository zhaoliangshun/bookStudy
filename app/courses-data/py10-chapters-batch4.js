// =============================================================
// Python 从入门到精通大全（终极版）—— 第4批章节
// 第四部分 数据结构（共 5 章）
// =============================================================

export const chapters = [
  // -----------------------------------------------------------
  // 第十六章：列表高级技巧
  // -----------------------------------------------------------
  {
    id: "py10-ch16",
    group: "第四部分 数据结构",
    icon: "📚",
    title: "第十六章 列表高级技巧",
    content: `## 为什么需要"高级技巧"

列表是你前面学过最常用的数据结构。但很多开发者只会 \`append\`、\`for\` 遍历——这远不够。真实项目里你经常要排序、去重、分组、切片、做栈和队列。掌握这些技巧，你的代码会**更短、更快、更 Pythonic**。

本章把列表的进阶用法一次讲透，每段代码都能直接跑。学完你会发现自己以前写的几十行循环，其实一两行就能搞定。

## 排序：sort() 与 sorted()

Python 提供两种排序方式，先搞清楚区别——这是面试和实战的高频考点。

### sort() —— 原地排序

\`\`\`python
nums = [3, 1, 4, 1, 5, 9, 2, 6]   # 一个无序列表
nums.sort()                        # sort() 原地排序，直接修改原列表
print(nums)                        # 输出 [1, 1, 2, 3, 4, 5, 6, 9]
# 注意：sort() 返回 None，不能写 nums = nums.sort()
\`\`\`

\`sort()\` 的特点是**原地修改**——不创建新列表，直接在原列表上动刀。好处是省内存，坏处是原列表被改了，如果你还需要原始顺序就麻烦了。

### sorted() —— 返回新列表

\`\`\`python
nums = [3, 1, 4, 1, 5, 9, 2, 6]
new_nums = sorted(nums)            # sorted() 返回一个新列表，原列表不变
print(nums)                        # 原列表仍是 [3, 1, 4, 1, 5, 9, 2, 6]
print(new_nums)                    # 新列表是 [1, 1, 2, 3, 4, 5, 6, 9]
\`\`\`

\`sorted()\` 是内置函数，可以接受任何可迭代对象（不只是列表），返回一个**新的列表**。原对象完全不动。

### 两者对比

| 特性 | \`list.sort()\` | \`sorted()\` |
|------|---------------|-------------|
| 修改原列表 | ✅ 是 | ❌ 否 |
| 返回值 | \`None\` | 新列表 |
| 适用对象 | 只有列表 | 任何可迭代对象 |
| 内存 | 省 | 多一份 |
| 链式调用 | 不支持 | 支持 |

**经验法则**：如果你不再需要原列表，用 \`sort()\` 省内存；如果需要保留原顺序，用 \`sorted()\`。

## key 参数：按什么排序

默认排序是"按值从小到大"。但实际中你经常要"按对象的某个属性"或"按自定义规则"排序，这就靠 \`key\` 参数。

\`\`\`python
# 按字符串长度排序
words = ["banana", "apple", "kiwi", "pear"]
words.sort(key=len)                # key=len 表示用 len 函数的结果作为排序依据
print(words)                       # ['kiwi', 'pear', 'apple', 'banana']
\`\`\`

\`key\` 接收一个函数，列表里每个元素都会被这个函数处理，排序时比较的是**函数的返回值**，但最终列表里还是原来的元素。

### 排序字典列表

实战中最常见的需求：一个列表里装着字典，按字典某个字段排序。

\`\`\`python
students = [
    {"name": "小明", "score": 88},
    {"name": "小红", "score": 95},
    {"name": "小刚", "score": 72},
]
# 按 score 从低到高排序
students.sort(key=lambda s: s["score"])   # lambda 定义匿名函数，取 score 字段
print(students)
\`\`\`

\`lambda s: s["score"]\` 是匿名函数，等价于：

\`\`\`python
def get_score(s):
    return s["score"]
students.sort(key=get_score)
\`\`\`

lambda 写法更简洁，适合这种"用一次就扔"的小函数。

### 多条件排序

让 key 函数返回一个 tuple，Python 会按 tuple 的顺序逐项比较：

\`\`\`python
students = [
    {"name": "小明", "score": 88, "age": 18},
    {"name": "小红", "score": 88, "age": 20},
    {"name": "小刚", "score": 95, "age": 17},
]
# 先按 score 升序，score 相同再按 age 升序
students.sort(key=lambda s: (s["score"], s["age"]))
\`\`\`

第一个元素相同就比较第二个，依此类推。这是处理"主排序 + 次排序"的标准做法。

### reverse 参数：降序

\`\`\`python
nums = [3, 1, 4, 1, 5]
nums.sort(reverse=True)            # reverse=True 降序（从大到小）
print(nums)                        # [5, 4, 3, 1, 1]
\`\`\`

如果只想让某个字段降序，其他字段升序，可以在 key 里对数字取负：

\`\`\`python
# score 降序（取负），age 升序（不取负）
students.sort(key=lambda s: (-s["score"], s["age"]))
\`\`\`

注意：取负只对数字有效，字符串不行。字符串要降序得用 \`functools.cmp_to_key\`。

## 自定义比较：cmp_to_key

Python 3 取消了 \`cmp\` 参数（老式比较函数），改用 \`key\`。但有时候你的比较逻辑没法用一个 key 函数表达，这时用 \`functools.cmp_to_key\` 把老式比较函数转成 key：

\`\`\`python
from functools import cmp_to_key

# 比较函数：返回负数表示 a<b，正数表示 a>b，0 表示相等
def compare(a, b):
    if a % 2 != b % 2:             # 奇偶性不同
        return -1 if a % 2 == 1 else 1   # 奇数排前面
    return a - b                   # 奇偶性相同，按数值排

nums = [4, 1, 3, 2, 5, 6]
nums.sort(key=cmp_to_key(compare)) # 奇数在前且升序，偶数在后且升序
print(nums)                        # [1, 3, 5, 2, 4, 6]
\`\`\`

这个用法不常见，但遇到"复杂排序规则"时很有用。

## bisect 模块：保持列表有序

如果你要往一个**已经排好序**的列表里插元素，还保持有序，怎么做？如果每次插完都 sort，效率很低。\`bisect\` 模块用二分查找快速定位插入位置，O(log n) 找位置，比线性查找快得多。

\`\`\`python
import bisect

scores = [60, 70, 80, 90]          # 已排序的列表
# bisect_left 找插入位置：相同元素时插在左边
pos = bisect.bisect_left(scores, 75)   # 75 应该插在 70 和 80 之间，位置是 2
print(pos)                          # 2

# insort 直接插入并保持有序
bisect.insort(scores, 75)           # 插入 75
print(scores)                       # [60, 70, 75, 80, 90]
\`\`\`

### bisect_left vs bisect_right

\`\`\`python
nums = [1, 2, 2, 2, 3]             # 里面有 3 个 2
print(bisect.bisect_left(nums, 2))  # 1  —— 插在最左边的 2 之前
print(bisect.bisect_right(nums, 2)) # 4  —— 插在最右边的 2 之后
\`\`\`

\`bisect_left\` 返回"插在相同元素的左边"的位置，\`bisect_right\` 返回"插在右边"的位置。区别仅在元素重复时才体现。

### 实战：成绩分级

bisect 最经典的用法是"分级"——给定一个分数，判断属于哪个等级：

\`\`\`python
import bisect

breakpoints = [60, 70, 80, 90]     # 分级线
grades = ['F', 'D', 'C', 'B', 'A']  # 对应等级

def get_grade(score):
    # bisect.bisect 返回 score 应该插入的位置，正好对应 grades 的索引
    i = bisect.bisect(breakpoints, score)
    return grades[i]

print(get_grade(55))   # F（不及格）
print(get_grade(65))   # D
print(get_grade(85))   # B
print(get_grade(95))   # A
\`\`\`

这个模式比写一堆 if-else 优雅得多。

## deque：双端队列

列表在**尾部**增删是 O(1)，但在**头部**增删是 O(n)（要移动所有元素）。如果你频繁在头部操作，列表会很慢。\`collections.deque\` 是双端队列，**两端都是 O(1)**。

\`\`\`python
from collections import deque

d = deque([1, 2, 3])               # 创建 deque
d.append(4)                        # 尾部添加：O(1)
d.appendleft(0)                    # 头部添加：O(1) —— 列表做不到这么快
print(d)                           # deque([0, 1, 2, 3, 4])

d.pop()                            # 尾部弹出：O(1)
d.popleft()                        # 头部弹出：O(1)
print(d)                           # deque([1, 2, 3])
\`\`\`

### deque 做队列（FIFO）

队列是"先进先出"：从一端进，另一端出。

\`\`\`python
from collections import deque

queue = deque()
queue.append("任务1")              # 入队
queue.append("任务2")
queue.append("任务3")
# popleft 从头部取出，先进先出
print(queue.popleft())             # 任务1
print(queue.popleft())             # 任务2
\`\`\`

如果用列表做队列（\`pop(0)\`），每次都是 O(n)，元素一多就慢。deque 永远是 O(1)。

### deque 做栈（LIFO）

栈是"后进先出"：同一端进出。

\`\`\`python
from collections import deque

stack = deque()
stack.append("A")                  # 压栈
stack.append("B")
stack.append("C")
print(stack.pop())                 # C（后进先出）
print(stack.pop())                 # B
\`\`\`

### deque 的扩展方法

\`\`\`python
from collections import deque

d = deque([1, 2, 3])
d.extend([4, 5])                   # 尾部扩展多个
d.extendleft([0, -1])              # 头部扩展（注意顺序会反）
print(d)                           # deque([-1, 0, 1, 2, 3, 4, 5])

d.rotate(2)                        # 向右旋转 2 步：尾部元素移到头部
print(d)                           # deque([4, 5, -1, 0, 1, 2, 3])
\`\`\`

\`rotate(n)\` 是 deque 独有的方法，正数向右转，负数向左转。

### 固定长度 deque：自动丢弃

\`\`\`python
from collections import deque

# maxlen=3 限制长度，超出时自动丢弃另一端
recent = deque(maxlen=3)
recent.append(1)
recent.append(2)
recent.append(3)
recent.append(4)                   # 超出，自动丢弃最左边的 1
print(recent)                      # deque([2, 3, 4], maxlen=3)
\`\`\`

这非常适合做"最近 N 条记录"的功能。

## 列表切片技巧

切片是 Python 列表的精髓，掌握这些技巧能少写很多循环。

### 反转列表

\`\`\`python
nums = [1, 2, 3, 4, 5]
reversed_nums = nums[::-1]         # 步长 -1，从尾到头，得到反转
print(reversed_nums)               # [5, 4, 3, 2, 1]
\`\`\`

\`[::-1]\` 是反转列表的"惯用法"，比 \`list(reversed(nums))\` 更简洁。

### 复制列表

\`\`\`python
original = [1, 2, 3]
copy = original[:]                 # [:] 创建一个新列表，是浅拷贝
copy.append(4)
print(original)                    # [1, 2, 3] —— 原列表没变
\`\`\`

注意：这是**浅拷贝**。如果列表里装的是可变对象（如嵌套列表），内层对象还是共享的。深拷贝要用 \`copy.deepcopy\`。

### 步长切片

\`\`\`python
nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
print(nums[::2])                   # [0, 2, 4, 6, 8]  —— 每隔一个取
print(nums[1::2])                  # [1, 3, 5, 7, 9]  —— 从索引1开始每隔一个
print(nums[::-2])                  # [9, 7, 5, 3, 1]  —— 反向每隔一个
\`\`\`

### 删除一段

\`\`\`python
nums = [0, 1, 2, 3, 4, 5]
del nums[1:4]                      # 删除索引 1 到 3 的元素
print(nums)                        # [0, 4, 5]
\`\`\`

### 用切片替换

\`\`\`python
nums = [0, 1, 2, 3, 4, 5]
nums[1:3] = [10, 20, 30]           # 用新列表替换一段，长度可以不同
print(nums)                        # [0, 10, 20, 30, 3, 4, 5]
\`\`\`

## 列表展平

把嵌套列表"压平"成一维，是常见需求。

### 一层嵌套：列表推导式

\`\`\`python
nested = [[1, 2], [3, 4], [5, 6]]
flat = [item for sublist in nested for item in sublist]
print(flat)                        # [1, 2, 3, 4, 5, 6]
\`\`\`

这个双层推导式的读法：\`for sublist in nested\` 先遍历外层，\`for item in sublist\` 再遍历内层，\`item\` 是最终收集的值。等价于：

\`\`\`python
flat = []
for sublist in nested:
    for item in sublist:
        flat.append(item)
\`\`\`

### 多层嵌套：递归

如果嵌套层数不确定，要用递归：

\`\`\`python
def flatten(nested):
    result = []
    for item in nested:
        if isinstance(item, list):  # 如果还是列表，递归
            result.extend(flatten(item))
        else:
            result.append(item)     # 不是列表，直接收集
    return result

deep = [1, [2, [3, [4, 5]]], 6]
print(flatten(deep))                # [1, 2, 3, 4, 5, 6]
\`\`\`

\`isinstance(item, list)\` 判断元素是不是列表。是就递归处理，不是就直接收集。

## 列表分块

把一个长列表切成固定大小的块，处理分页、批量任务时常用。

\`\`\`python
def chunk(lst, size):
    """把列表分成大小为 size 的块"""
    return [lst[i:i + size] for i in range(0, len(lst), size)]

nums = list(range(1, 11))           # [1, 2, ..., 10]
print(chunk(nums, 3))               # [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
\`\`\`

原理：\`range(0, len(lst), size)\` 生成起始位置 0, 3, 6, 9，每个位置切 size 个。最后一块可能不足 size，切片会自动处理。

## 列表作为栈和队列

### 栈（LIFO 后进先出）

列表天生适合做栈——\`append\` 压栈，\`pop\` 出栈，都是尾部操作 O(1)。

\`\`\`python
stack = []
stack.append("A")                  # 压栈
stack.append("B")
stack.append("C")
print(stack.pop())                 # C —— 后进先出
print(stack.pop())                 # B
print(stack)                       # ['A']
\`\`\`

栈的应用：函数调用栈、撤销操作（Undo）、括号匹配、表达式求值。

### 队列（FIFO 先进先出）

列表做队列**不推荐**——\`pop(0)\` 是 O(n)。应该用 \`deque\`：

\`\`\`python
from collections import deque

queue = deque()
queue.append("任务1")              # 入队
queue.append("任务2")
print(queue.popleft())             # 任务1 —— 先进先出
\`\`\`

## 实战演示

下面的 demo 综合本章所有技巧，每段都配详细注释。`,
  },
  // -----------------------------------------------------------
  // 第十七章：字典高级技巧
  // -----------------------------------------------------------
  {
    id: "py10-ch17",
    group: "第四部分 数据结构",
    icon: "🗂️",
    title: "第十七章 字典高级技巧",
    content: `## 字典的高级用法远超你想象

字典是 Python 最强大的数据结构之一。基础用法（创建、取值、改值）你已经会了，但实战中你会遇到这些需求：统计词频、按默认值分组、合并多个字典、保持插入顺序、做配置回退……这些都需要本章的"高级技巧"。

学完本章，你处理数据的能力会上一个台阶。

## defaultdict：带默认值的字典

普通字典访问不存在的 key 会报 \`KeyError\`：

\`\`\`python
d = {}
print(d["name"])                   # KeyError: 'name'
\`\`\`

每次都要先判断 key 在不在，很烦。\`collections.defaultdict\` 解决这个问题——访问不存在的 key 时，自动创建一个默认值。

\`\`\`python
from collections import defaultdict

# defaultdict(int) —— 不存在的 key 默认值是 0
counts = defaultdict(int)
words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
for word in words:
    counts[word] += 1              # 第一次访问时自动初始化为 0，然后 +1
print(dict(counts))                # {'apple': 3, 'banana': 2, 'cherry': 1}
\`\`\`

如果用普通字典，得写成：

\`\`\`python
counts = {}
for word in words:
    if word not in counts:         # 先判断在不在
        counts[word] = 0           # 不在就初始化
    counts[word] += 1
\`\`\`

defaultdict 省掉了判断和初始化，代码更简洁。

### defaultdict 的工厂函数

\`defaultdict(工厂函数)\` 里的"工厂函数"是无参函数，调用它产生默认值：

| 工厂 | 默认值 | 用途 |
|------|--------|------|
| \`int\` | 0 | 计数 |
| \`list\` | \`[]\` 空列表 | 分组 |
| \`set\` | \`set()\` 空集合 | 去重分组 |
| \`str\` | \`''\` 空字符串 | 拼接 |

### 实战：按字段分组

\`\`\`python
from collections import defaultdict

students = [
    {"name": "小明", "class": "A"},
    {"name": "小红", "class": "B"},
    {"name": "小刚", "class": "A"},
    {"name": "小丽", "class": "B"},
]
# 按 class 分组
groups = defaultdict(list)
for s in students:
    groups[s["class"]].append(s["name"])   # 第一次访问自动创建空列表
print(dict(groups))                # {'A': ['小明', '小刚'], 'B': ['小红', '小丽']}
\`\`\`

这是 defaultdict 最经典的用法——**分组**。比手写判断优雅太多。

## Counter：计数器

\`collections.Counter\` 是专门为"计数"设计的字典子类，比 defaultdict(int) 还方便。

\`\`\`python
from collections import Counter

words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
counter = Counter(words)           # 一行完成计数
print(counter)                     # Counter({'apple': 3, 'banana': 2, 'cherry': 1})
print(counter["apple"])            # 3 —— 像字典一样访问
print(counter["orange"])           # 0 —— 不存在的 key 返回 0，不报错
\`\`\`

### most_common：取前 N 个

\`\`\`python
print(counter.most_common(2))      # [('apple', 3), ('banana', 2)] —— 出现最多的 2 个
\`\`\`

这是 Counter 最有用的方法——快速找"Top N"。比如统计热搜词、销量排行、访问最多的页面。

### Counter 的运算

Counter 支持加减运算，这是普通字典没有的：

\`\`\`python
c1 = Counter(a=3, b=2, c=1)
c2 = Counter(a=1, b=2, d=4)

print(c1 + c2)                     # Counter({'a': 4, 'b': 4, 'd': 4, 'c': 1}) —— 相加
print(c1 - c2)                     # Counter({'a': 2, 'c': 1}) —— 相减（只保留正数）
\`\`\`

### 统计字符频率

\`\`\`python
text = "hello world"
char_count = Counter(text)         # 直接对字符串计数
print(char_count.most_common(3))   # [('l', 3), ('o', 2), ('h', 1)]
\`\`\`

## OrderedDict：有序字典

Python 3.7+ 的普通 \`dict\` 已经**保持插入顺序**了，那 \`OrderedDict\` 还有用吗？有用——它提供了普通 dict 没有的方法。

\`\`\`python
from collections import OrderedDict

od = OrderedDict()
od["a"] = 1
od["b"] = 2
od["c"] = 3
print(list(od.keys()))             # ['a', 'b', 'c'] —— 按插入顺序
\`\`\`

### move_to_end：移动到末尾

\`\`\`python
od = OrderedDict(a=1, b=2, c=3)
od.move_to_end("a")                # 把 a 移到末尾
print(list(od.keys()))             # ['b', 'c', 'a']

od.move_to_end("c", last=False)    # last=False 移到开头
print(list(od.keys()))             # ['c', 'b', 'a']
\`\`\`

### popitem：弹出首尾

\`\`\`python
od = OrderedDict(a=1, b=2, c=3)
print(od.popitem())                # ('c', 3) —— 弹出最后一个
print(od.popitem(last=False))      # ('a', 1) —— last=False 弹出第一个
\`\`\`

### LRU 缓存的实现

OrderedDict 最经典的用途是实现 LRU（最近最少使用）缓存：

\`\`\`python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key):
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)   # 访问后移到末尾（最近使用）
        return self.cache[key]

    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)  # 淘汰最久没用的（头部）
\`\`\`

LRU 缓存的核心：访问的移到末尾，满了就淘汰头部。OrderedDict 完美支持这个逻辑。

## ChainMap：合并字典的视图

\`collections.ChainMap\` 把多个字典"串联"起来，访问时按顺序查找，像是一个合并后的大字典——但**不真的合并**，原字典独立。

\`\`\`python
from collections import ChainMap

defaults = {"theme": "light", "lang": "zh", "timeout": 30}
user_config = {"theme": "dark"}    # 用户只改了主题

config = ChainMap(user_config, defaults)   # user_config 优先
print(config["theme"])             # dark —— 从 user_config 找到
print(config["lang"])              # zh —— user_config 没有，从 defaults 找
print(config["timeout"])           # 30 —— 从 defaults 找到
\`\`\`

### ChainMap vs {**d1, **d2}

\`{**defaults, **user_config}\` 也能合并，但会创建一个新字典，占用内存。ChainMap 是"视图"，不复制数据，更省内存，而且原字典改了 ChainMap 能看到。

\`\`\`python
defaults["timeout"] = 60           # 改原字典
print(config["timeout"])           # 60 —— ChainMap 立即看到变化
\`\`\`

### 实战：配置回退

ChainMap 最适合"多层级配置"——优先级从高到低：命令行参数 > 环境变量 > 配置文件 > 默认值。

\`\`\`python
from collections import ChainMap

cli_args = {"debug": True}                          # 命令行参数
env_vars = {"host": "0.0.0.0"}                      # 环境变量
config_file = {"host": "127.0.0.1", "port": 8080}   # 配置文件
defaults = {"host": "localhost", "port": 8000, "debug": False}  # 默认值

# 优先级：cli_args > env_vars > config_file > defaults
config = ChainMap(cli_args, env_vars, config_file, defaults)
print(config["host"])               # 0.0.0.0（来自 env_vars）
print(config["port"])               # 8080（来自 config_file）
print(config["debug"])              # True（来自 cli_args）
\`\`\`

## 字典视图：keys / values / items

\`dict.keys()\`、\`dict.values()\`、\`dict.items()\` 返回的不是列表，是**视图对象**——动态反映字典的变化。

\`\`\`python
d = {"a": 1, "b": 2, "c": 3}
keys = d.keys()
print(keys)                        # dict_keys(['a', 'b', 'c'])

d["d"] = 4                         # 改动字典
print(keys)                        # dict_keys(['a', 'b', 'c', 'd']) —— 视图自动更新
\`\`\`

视图不占用额外内存（不复制数据），所以即使字典很大，取 keys/values 也很轻量。

### 集合运算

keys 和 items 视图支持集合运算（因为 key 唯一）：

\`\`\`python
d1 = {"a": 1, "b": 2, "c": 3}
d2 = {"b": 20, "c": 30, "d": 40}

# 交集：两个字典都有的 key
print(d1.keys() & d2.keys())       # {'b', 'c'}
# 并集
print(d1.keys() | d2.keys())       # {'a', 'b', 'c', 'd'}
# 差集：d1 有但 d2 没有的
print(d1.keys() - d2.keys())       # {'a'}
\`\`\`

这个特性在做"找出两个字典共同的 key"时特别方便。

## 字典常用模式

### 反转字典

key 和 value 互换：

\`\`\`python
original = {"a": 1, "b": 2, "c": 3}
reversed_d = {v: k for k, v in original.items()}
print(reversed_d)                  # {1: 'a', 2: 'b', 3: 'c'}
\`\`\`

注意：如果 value 有重复，后写的会覆盖前面的。

### 合并字典（Python 3.9+）

\`\`\`python
d1 = {"a": 1, "b": 2}
d2 = {"b": 20, "c": 30}
merged = d1 | d2                   # | 运算符合并，d2 优先
print(merged)                      # {'a': 1, 'b': 20, 'c': 30}

d1 |= d2                           # 原地合并
print(d1)                          # {'a': 1, 'b': 20, 'c': 30}
\`\`\`

\`|\` 是 Python 3.9 加的字典合并运算符，比 \`{**d1, **d2}\` 更直观。

### 按 value 排序

\`\`\`python
scores = {"小明": 88, "小红": 95, "小刚": 72}
# 按 value（分数）降序
sorted_scores = dict(sorted(scores.items(), key=lambda x: x[1], reverse=True))
print(sorted_scores)               # {'小红': 95, '小明': 88, '小刚': 72}
\`\`\`

### 过滤字典

\`\`\`python
scores = {"小明": 88, "小红": 95, "小刚": 72, "小丽": 55}
# 只保留及格的（>= 60）
passed = {k: v for k, v in scores.items() if v >= 60}
print(passed)                      # {'小明': 88, '小红': 95, '小刚': 72}
\`\`\`

## 字典性能要点

字典基于哈希表，**查找/插入/删除平均 O(1)**，这是它快的根本原因。

但有几个性能陷阱要注意：

1. **key 必须可哈希**：列表、字典、集合不能做 key（会报错），因为它们可变。元组、字符串、数字、frozenset 可以。

\`\`\`python
d = {}
# d[[1, 2]] = "x"   # TypeError: unhashable type: 'list'
d[(1, 2)] = "x"     # 元组可以
\`\`\`

2. **哈希冲突**：极端情况下（恶意构造的 key）字典会退化成 O(n)，但日常使用几乎遇不到。

3. **遍历时不要修改**：遍历字典时增删 key 会报 RuntimeError。要先收集要删的 key，遍历完再删：

\`\`\`python
d = {"a": 1, "b": 2, "c": 3}
# 错误：for k in d: if d[k] < 2: del d[k]
# 正确：
to_delete = [k for k, v in d.items() if v < 2]
for k in to_delete:
    del d[k]
\`\`\`

## 实战演示

下面的 demo 综合演示 defaultdict、Counter、OrderedDict、ChainMap 的用法。`,
  },
  // -----------------------------------------------------------
  // 第十八章：集合高级应用
  // -----------------------------------------------------------
  {
    id: "py10-ch18",
    group: "第四部分 数据结构",
    icon: "🔷",
    title: "第十八章 集合高级应用",
    content: `## 集合不只是去重

很多人对集合的印象停留在"去重"——\`set(lst)\` 去掉重复元素。但集合真正的威力在于**集合运算**：并集、交集、差集、对称差。这些运算用列表写要好几层循环，用集合一行搞定，而且快得多。

本章带你从"会去重"升级到"用集合解决实际问题"。

## 集合运算回顾

先快速回顾四种基本运算，这是集合的核心。

### 并集（Union）

两个集合的所有元素（去重）：

\`\`\`python
a = {1, 2, 3}
b = {3, 4, 5}
print(a | b)                       # {1, 2, 3, 4, 5} —— | 是并集运算符
print(a.union(b))                  # 等价写法，返回新集合
\`\`\`

### 交集（Intersection）

两个集合都有的元素：

\`\`\`python
print(a & b)                       # {3} —— & 是交集运算符
print(a.intersection(b))           # 等价写法
\`\`\`

### 差集（Difference）

a 有但 b 没有的：

\`\`\`python
print(a - b)                       # {1, 2} —— - 是差集运算符
print(a.difference(b))             # 等价写法
\`\`\`

注意：差集不对称，\`a - b\` 和 \`b - a\` 不同。

### 对称差（Symmetric Difference）

只在其中一个集合里的元素（并集减交集）：

\`\`\`python
print(a ^ b)                       # {1, 2, 4, 5} —— ^ 是对称差运算符
print(a.symmetric_difference(b))   # 等价写法
\`\`\`

### 运算符 vs 方法

运算符（\`| & - ^\`）和方法（\`union\`、\`intersection\` 等）的区别：

- 运算符**两边都必须是集合**
- 方法可以接受任何可迭代对象

\`\`\`python
a = {1, 2, 3}
# a & [3, 4]    # 报错：运算符右边必须是 set
a.intersection([3, 4])            # {3} —— 方法可以接受列表
\`\`\`

## 集合的关系判断

### issubset：是否是子集

\`\`\`python
a = {1, 2}
b = {1, 2, 3, 4}
print(a.issubset(b))               # True —— a 的元素都在 b 里
print(a <= b)                      # True —— 运算符写法
\`\`\`

### issuperset：是否是超集

\`\`\`python
print(b.issuperset(a))             # True —— b 包含 a 的所有元素
print(b >= a)                      # True
\`\`\`

### isdisjoint：是否不相交

\`\`\`python
a = {1, 2}
b = {3, 4}
print(a.isdisjoint(b))             # True —— 没有共同元素
\`\`\`

\`isdisjoint\` 在判断"两组数据有没有交集"时很有用，比如检查两个用户群体的兴趣是否完全不同。

### 真子集

\`<\` 和 \`>\` 表示**真子集/真超集**（不等于自身）：

\`\`\`python
a = {1, 2}
b = {1, 2}
print(a <= b)                      # True —— 子集（可以相等）
print(a < b)                       # False —— 真子集（必须严格小于）
\`\`\`

## 去重的艺术

### 基本去重

\`\`\`python
nums = [1, 2, 2, 3, 3, 3, 4]
unique = list(set(nums))
print(unique)                      # [1, 2, 3, 4] —— 顺序丢失
\`\`\`

\`set\` 去重快，但**不保留顺序**（集合无序）。如果要保留顺序：

### 保留顺序的去重

\`\`\`python
def dedup(lst):
    seen = set()
    result = []
    for item in lst:
        if item not in seen:       # set 的 in 是 O(1)，比 list 快
            seen.add(item)
            result.append(item)
    return result

nums = [3, 1, 2, 2, 3, 4, 1]
print(dedup(nums))                 # [3, 1, 2, 4] —— 保留首次出现顺序
\`\`\`

### Python 3.7+ 的偷懒写法

dict 保持插入顺序，可以利用这点去重：

\`\`\`python
nums = [3, 1, 2, 2, 3, 4, 1]
unique = list(dict.fromkeys(nums)) # dict.fromkeys 自动去重，保留顺序
print(unique)                      # [3, 1, 2, 4]
\`\`\`

\`dict.fromkeys(nums)\` 创建一个字典，key 是 nums 的元素（重复的会覆盖），值都是 None。转成 list 就是去重后的 key 列表。

### 按字段去重

列表里装字典，按某个字段去重：

\`\`\`python
students = [
    {"name": "小明", "score": 88},
    {"name": "小红", "score": 95},
    {"name": "小明", "score": 72},   # name 重复
]
seen = set()
unique = []
for s in students:
    if s["name"] not in seen:
        seen.add(s["name"])
        unique.append(s)
print(unique)                       # 只保留第一个"小明"
\`\`\`

## 成员测试：set vs list 的性能差距

这是集合最重要的实战价值——**成员测试 O(1)**。

\`\`\`python
# 假设要检查 10000 个元素是否在一个集合里
data = list(range(100000))         # 10万个元素
test = list(range(50000, 150000))  # 测试 10万个，一半在里面

# 用列表：每次 in 都是 O(n)，慢
lst = data
# 用集合：每次 in 是 O(1)，快
st = set(data)

import time
start = time.time()
count = sum(1 for x in test if x in lst)   # 列表查找
print(f"列表耗时: {time.time() - start:.3f}s, 找到 {count}")

start = time.time()
count = sum(1 for x in test if x in st)    # 集合查找
print(f"集合耗时: {time.time() - start:.3f}s, 找到 {count}")
\`\`\`

集合会快几十倍甚至上百倍。**经验法则**：如果你要频繁查"某元素在不在"，把它转成 set。

### 实战：找出两个列表的共同元素

\`\`\`python
list1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
list2 = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14]

# 错误做法：双重循环 O(n*m)
common = [x for x in list1 if x in list2]   # list2 的 in 是 O(n)

# 正确做法：转成集合 O(n+m)
common = list(set(list1) & set(list2))      # 交集，快得多
print(common)                      # [5, 6, 7, 8, 9, 10]
\`\`\`

## frozenset：不可变集合

\`set\` 是可变的，不能做字典的 key，也不能放进另一个 set。\`frozenset\` 是不可变版本，创建后不能增删，但可以哈希，所以能做 key。

\`\`\`python
fs = frozenset([1, 2, 3])
# fs.add(4)                        # 报错：frozenset 不可变

# frozenset 可以做字典的 key
d = {frozenset([1, 2]): "一组", frozenset([3, 4]): "二组"}
print(d[frozenset([1, 2])])        # 一组
\`\`\`

### 用 frozenset 做"无序缓存"

有时你想把一组数据作为 key，但顺序不重要。\`[1, 2]\` 和 \`[2, 1]\` 是不同的 key，但 \`frozenset([1, 2])\` 和 \`frozenset([2, 1])\` 是同一个：

\`\`\`python
cache = {}
def get_result(params):
    key = frozenset(params.items())   # 把参数转成 frozenset，顺序无关
    if key not in cache:
        cache[key] = expensive_compute(params)
    return cache[key]
\`\`\`

这样 \`(a=1, b=2)\` 和 \`(b=2, a=1)\` 会命中同一个缓存。

## 集合运算的实战案例

### 案例 1：找出两门课都选了的学生

\`\`\`python
math_students = {"小明", "小红", "小刚", "小丽"}
english_students = {"小红", "小刚", "小强", "小王"}

# 两门都选的：交集
both = math_students & english_students
print("两门都选:", both)             # {'小红', '小刚'}

# 只选了数学的：差集
only_math = math_students - english_students
print("只选数学:", only_math)         # {'小明', '小丽'}

# 至少选了一门的：并集
any_course = math_students | english_students
print("至少选一门:", any_course)

# 只选了一门的：对称差
only_one = math_students ^ english_students
print("只选一门:", only_one)
\`\`\`

### 案例 2：标签系统

\`\`\`python
article1_tags = {"Python", "教程", "入门"}
article2_tags = {"Python", "进阶", "实战"}

# 共同标签：推荐相关文章
common = article1_tags & article2_tags
print("共同标签:", common)            # {'Python'}

# 所有标签
all_tags = article1_tags | article2_tags
print("所有标签:", all_tags)
\`\`\`

### 案例 3：权限检查

\`\`\`python
user_permissions = {"read", "write"}
required_permissions = {"read", "write", "delete"}

# 检查用户是否有所有需要的权限：required 是 user 的子集
if required_permissions.issubset(user_permissions):
    print("权限足够")
else:
    print("权限不足")                # 这里会输出，因为缺少 delete
\`\`\`

## 集合的注意事项

1. **集合无序**：不能按下标访问，\`s[0]\` 会报错。

2. **元素必须可哈希**：列表、字典、集合不能做元素。

\`\`\`python
# s = {[1, 2], [3, 4]}  # 报错：列表不可哈希
s = {(1, 2), (3, 4)}    # 元组可以
\`\`\`

3. **空集合要用 set()**：\`{}\` 创建的是空字典，不是空集合。

\`\`\`python
empty_dict = {}                    # 这是字典！
empty_set = set()                  # 这才是空集合
print(type(empty_dict))            # <class 'dict'>
print(type(empty_set))             # <class 'set'>
\`\`\`

4. **集合推导式**：和列表推导式类似，用 \`{}\`：

\`\`\`python
nums = [1, 2, 2, 3, 3, 3]
s = {x * 2 for x in nums}         # 集合推导式，自动去重
print(s)                           # {2, 4, 6}
\`\`\`

## 实战演示

下面的 demo 综合演示集合运算、去重、成员测试、frozenset 的用法。`,
  },
  // -----------------------------------------------------------
  // 第十九章：collections 模块
  // -----------------------------------------------------------
  {
    id: "py10-ch19",
    group: "第四部分 数据结构",
    icon: "🧰",
    title: "第十九章 collections 模块",
    content: `## collections：Python 的数据结构工具箱

\`collections\` 是 Python 标准库里的一个模块，专门提供"增强版"的数据结构。前面几章你已经零散接触过 \`defaultdict\`、\`Counter\`、\`deque\`、\`OrderedDict\`、\`ChainMap\`，本章把它们系统讲一遍，再补充 \`namedtuple\` 和 \`UserDict\` 等工具。

掌握 collections，你能用更少的代码写出更清晰、更高效的程序。它是 Python 程序员的**必备工具箱**。

## namedtuple：具名元组

普通元组用下标访问：\`t[0]\`、\`t[1]\`，读到 \`t[2]\` 时你根本不知道这是啥。\`namedtuple\` 给每个位置起个名字，用 \`t.name\` 访问，代码可读性大增。

\`\`\`python
from collections import namedtuple

# 定义一个 Point 类型，有 x 和 y 两个字段
Point = namedtuple("Point", ["x", "y"])

p = Point(3, 4)
print(p.x)                         # 3 —— 用名字访问
print(p.y)                         # 4
print(p[0])                        # 3 —— 也能用下标访问
\`\`\`

\`namedtuple("Point", ["x", "y"])\` 创建一个新类型，第一个参数是类型名，第二个是字段名列表。它返回的是一个类，可以像普通类一样实例化。

### 为什么用 namedtuple

对比三种方式存一个点：

\`\`\`python
# 方式1：元组 —— 简洁但不可读
p = (3, 4)
print(p[0])                        # 这是 x 还是 y？看代码猜

# 方式2：字典 —— 可读但啰嗦
p = {"x": 3, "y": 4}
print(p["x"])

# 方式3：namedtuple —— 兼具简洁和可读
from collections import namedtuple
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
print(p.x)                         # 一目了然
\`\`\`

namedtuple 的优点：
- **不可变**：像元组一样，创建后不能改（\`p.x = 5\` 会报错）
- **省内存**：比字典省（没有 hash 表开销）
- **可读**：用名字访问
- **兼容元组**：能用下标、能解包

### namedtuple 的方法

\`\`\`python
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)

# _asdict：转成字典
print(p._asdict())                 # {'x': 3, 'y': 4}

# _replace：替换某些字段，返回新实例（原实例不变）
p2 = p._replace(x=10)
print(p2)                          # Point(x=10, y=4)
print(p)                           # Point(x=3, y=4) —— 原实例没变

# _fields：查看所有字段名
print(Point._fields)               # ('x', 'y')
\`\`\`

### 实战：用 namedtuple 表示记录

\`\`\`python
from collections import namedtuple

Student = namedtuple("Student", ["name", "age", "score"])

students = [
    Student("小明", 18, 88),
    Student("小红", 19, 95),
    Student("小刚", 18, 72),
]

# 按分数排序
students.sort(key=lambda s: s.score, reverse=True)
for s in students:
    print(f"{s.name}: {s.score}分")   # 用名字访问，清晰
\`\`\`

对比用字典或元组，namedtuple 让代码自文档化——看到 \`s.score\` 就懂，不用记"score 是第几个字段"。

## deque：双端队列

第十六章已详细介绍，这里补充几个要点。

\`\`\`python
from collections import deque

d = deque([1, 2, 3], maxlen=5)     # maxlen 限制最大长度
d.append(4)
d.appendleft(0)
print(d)                           # deque([0, 1, 2, 3, 4], maxlen=5)

d.append(5)                        # 超过 maxlen，左边自动弹出
print(d)                           # deque([1, 2, 3, 4, 5], maxlen=5)
\`\`\`

\`maxlen\` 让 deque 自动维持固定长度，非常适合做"滑动窗口"、"最近 N 条记录"。

### deque vs list 性能对比

\`\`\`python
from collections import deque
import time

# 在头部插入 10 万个元素
n = 100000

# 列表：头部插入是 O(n)，非常慢
start = time.time()
lst = []
for i in range(n):
    lst.insert(0, i)               # insert(0) 头部插入
print(f"list 头部插入 {n} 次: {time.time() - start:.3f}s")

# deque：头部插入是 O(1)，飞快
start = time.time()
dq = deque()
for i in range(n):
    dq.appendleft(i)               # appendleft 头部插入
print(f"deque 头部插入 {n} 次: {time.time() - start:.3f}s")
\`\`\`

列表会慢几十倍。**结论**：频繁头部操作用 deque，尾部操作列表和 deque 都行。

## ChainMap：字典链

第十七章已介绍，这里强调一个易错点：

\`\`\`python
from collections import ChainMap

d1 = {"a": 1, "b": 2}
d2 = {"b": 20, "c": 30}
cm = ChainMap(d1, d2)

# 写入操作只影响第一个字典
cm["a"] = 100
print(d1)                          # {'a': 100, 'b': 2} —— d1 被改了
print(d2)                          # {'b': 20, 'c': 30} —— d2 没变

# 删除也只影响第一个字典
del cm["a"]                        # 删除 d1 的 a
# del cm["c"]                      # KeyError: 'c' —— 第一个字典没有 c
\`\`\`

ChainMap 的写入和删除**只作用于第一个字典**，读取时才按顺序查找。这点和真正的"合并字典"不同。

## Counter：计数器

第十七章已详细介绍，这里补充几个方法：

\`\`\`python
from collections import Counter

c = Counter("abracadabra")
print(c)                           # Counter({'a': 5, 'b': 2, 'r': 2, 'c': 1, 'd': 1})

# elements：返回所有元素（按出现次数重复）
print(list(c.elements()))          # ['a', 'a', 'a', 'a', 'a', 'b', 'b', 'r', 'r', 'c', 'd']

# total：所有计数之和（Python 3.10+）
print(c.total())                   # 11

# update：增加计数
c.update("aaa")
print(c["a"])                      # 8

# subtract：减少计数
c.subtract("aa")
print(c["a"])                      # 6
\`\`\`

## OrderedDict：有序字典

第十七章已介绍 LRU 缓存实现，这里补充一个点——Python 3.7+ 普通 dict 也保持顺序，那什么时候还用 OrderedDict？

\`\`\`python
from collections import OrderedDict

# 1. 需要 move_to_end / popitem(last=False) 时
# 2. 需要明确表达"顺序很重要"的意图时
# 3. 需要相等判断考虑顺序时

d1 = {"a": 1, "b": 2}
d2 = {"b": 2, "a": 1}
print(d1 == d2)                    # True —— 普通 dict 不考虑顺序

od1 = OrderedDict(a=1, b=2)
od2 = OrderedDict(b=2, a=1)
print(od1 == od2)                  # False —— OrderedDict 考虑顺序
\`\`\`

这是 OrderedDict 和普通 dict 的本质区别——**OrderedDict 的相等判断考虑顺序**。

## defaultdict：带默认值的字典

第十七章已详细介绍，这里再给一个实战例子——**多值字典**：

\`\`\`python
from collections import defaultdict

# 一个 key 对应多个值
multi = defaultdict(list)
pairs = [("fruit", "apple"), ("fruit", "banana"), ("veg", "carrot"), ("fruit", "cherry")]
for key, value in pairs:
    multi[key].append(value)       # 第一次访问自动创建空列表
print(dict(multi))                 # {'fruit': ['apple', 'banana', 'cherry'], 'veg': ['carrot']}
\`\`\`

对比手写：

\`\`\`python
multi = {}
for key, value in pairs:
    if key not in multi:
        multi[key] = []
    multi[key].append(value)
\`\`\`

defaultdict 省掉了 3 行样板代码。

## UserDict：自定义字典

如果你想写一个"行为像字典但有特殊逻辑"的类，继承 \`dict\` 会有坑（有些方法不会调用你重写的 \`__getitem__\`）。\`UserDict\` 解决这个问题。

\`\`\`python
from collections import UserDict

class CaseInsensitiveDict(UserDict):
    """key 不区分大小写的字典"""
    def __setitem__(self, key, value):
        super().__setitem__(key.lower(), value)   # 存储时转小写

    def __getitem__(self, key):
        return super().__getitem__(key.lower())   # 取时也转小写

d = CaseInsensitiveDict()
d["Name"] = "小明"
print(d["name"])                   # 小明 —— 大小写都能取到
print(d["NAME"])                   # 小明
\`\`\`

\`UserDict\` 内部用一个 \`data\` 属性存数据，所有操作都通过你重写的方法，行为一致。继承 \`dict\` 做不到这点。

同理还有 \`UserList\` 和 \`UserString\`，用于自定义列表和字符串行为。

## 各工具速查表

| 工具 | 用途 | 典型场景 |
|------|------|----------|
| \`namedtuple\` | 具名元组 | 替代小类，存记录 |
| \`deque\` | 双端队列 | 队列、栈、滑动窗口 |
| \`ChainMap\` | 字典链 | 多层配置回退 |
| \`Counter\` | 计数器 | 词频、Top N |
| \`OrderedDict\` | 有序字典 | LRU 缓存、顺序敏感 |
| \`defaultdict\` | 默认值字典 | 分组、计数、多值字典 |
| \`UserDict\` | 自定义字典 | 特殊逻辑的字典 |

## 如何选择

- 要计数 → Counter
- 要分组 → defaultdict(list)
- 要队列/栈 → deque
- 要合并配置 → ChainMap
- 要不可变记录 → namedtuple
- 要 LRU 缓存 → OrderedDict
- 要自定义字典 → UserDict

## 实战演示

下面的 demo 综合演示 collections 各工具的用法，每段都有详细注释。`,
  },
  // -----------------------------------------------------------
  // 第二十章：数据结构选型与性能
  // -----------------------------------------------------------
  {
    id: "py10-ch20",
    group: "第四部分 数据结构",
    icon: "📊",
    title: "第二十章 数据结构选型与性能",
    content: `## 选对数据结构，比优化代码更重要

写代码时你会反复面对一个问题："这个数据该用什么存？"——列表？字典？集合？还是 deque？

选错了，代码可能慢几十倍；选对了，不用优化就很快。本章教你**如何选**，并给出 Python 各操作的时间复杂度速查表，配 \`timeit\` 实测对比。

## 先理解时间复杂度 Big-O

Big-O 描述"数据量变大时，操作时间怎么增长"。它不关心具体几秒，只关心**增长趋势**。

| 复杂度 | 名称 | 数据量 x10 时 | 直觉 |
|--------|------|---------------|------|
| O(1) | 常数 | 不变 | 神速，不管数据多大 |
| O(log n) | 对数 | +一点 | 很快，二分查找 |
| O(n) | 线性 | 慢 10 倍 | 还行，遍历一遍 |
| O(n log n) | 线性对数 | 慢约 11 倍 | 排序的极限 |
| O(n²) | 平方 | 慢 100 倍 | 嵌套循环，慎用 |
| O(2ⁿ) | 指数 | 爆炸 | 别碰 |

关键认知：**O(1) 和 O(n) 的差距，在数据量大时是天壤之别**。100 万个元素，O(1) 是 1 次操作，O(n) 是 100 万次。

## Python 操作的时间复杂度速查表

### 列表 list

| 操作 | 复杂度 | 说明 |
|------|--------|------|
| \`lst[i]\` 索引访问 | O(1) | 直接算地址 |
| \`lst.append(x)\` | O(1) | 尾部追加 |
| \`lst.pop()\` | O(1) | 尾部弹出 |
| \`lst.insert(0, x)\` | O(n) | 头部插入要移动 |
| \`lst.pop(0)\` | O(n) | 头部弹出要移动 |
| \`x in lst\` | O(n) | 要遍历 |
| \`lst.sort()\` | O(n log n) | 排序 |
| \`lst[i:j]\` 切片 | O(k) | k 是切片长度 |

**关键点**：列表的 \`insert(0)\`、\`pop(0)\`、\`in\` 都是 O(n)，数据量大时慢。需要频繁这些操作，换 deque 或 set。

### 字典 dict

| 操作 | 复杂度 | 说明 |
|------|--------|------|
| \`d[key]\` | O(1) | 哈希查找 |
| \`d[key] = val\` | O(1) | 哈希插入 |
| \`del d[key]\` | O(1) | 哈希删除 |
| \`key in d\` | O(1) | 哈希查找 |
| \`d.keys()\` | O(1) | 返回视图 |
| 遍历 | O(n) | 每个元素一次 |

**关键点**：字典的查找/插入/删除都是 O(1)，这是它快的根本。

### 集合 set

| 操作 | 复杂度 | 说明 |
|------|--------|------|
| \`x in s\` | O(1) | 哈希查找 |
| \`s.add(x)\` | O(1) | 哈希插入 |
| \`s.remove(x)\` | O(1) | 哈希删除 |
| \`s \| t\` 并集 | O(len(s)+len(t)) | 要遍历两个 |
| \`s & t\` 交集 | O(min(len(s),len(t))) | 遍历小的 |
| \`s - t\` 差集 | O(len(s)) | 遍历 s |

**关键点**：集合的成员测试 O(1)，比列表的 O(n) 快得多。

### deque

| 操作 | 复杂度 | 说明 |
|------|--------|------|
| \`d.append(x)\` | O(1) | 尾部追加 |
| \`d.appendleft(x)\` | O(1) | 头部追加 |
| \`d.pop()\` | O(1) | 尾部弹出 |
| \`d.popleft()\` | O(1) | 头部弹出 |
| \`d[i]\` 索引 | O(n) | 中间访问慢 |
| \`x in d\` | O(n) | 遍历 |

**关键点**：deque 两端都 O(1)，但中间访问是 O(n)，比列表慢。所以 deque 适合"两端操作"，不适合"随机访问"。

## 如何选择数据结构

按"主要操作"来选：

### 需要按下标随机访问 → list

\`\`\`python
# 读多写少，按下标访问
data = [1, 2, 3, 4, 5]
print(data[2])                     # 3，O(1)
\`\`\`

### 需要键值映射 → dict

\`\`\`python
# 按 key 查找、修改
user = {"name": "小明", "age": 18}
print(user["name"])                # O(1)
\`\`\`

### 需要去重或成员测试 → set

\`\`\`python
# 频繁查"在不在"
valid_ids = {1001, 1002, 1003}
if user_id in valid_ids:           # O(1)
    print("有效")
\`\`\`

### 需要队列（FIFO）→ deque

\`\`\`python
from collections import deque
# 先进先出
queue = deque()
queue.append("任务1")
queue.popleft()                    # O(1)，列表 pop(0) 是 O(n)
\`\`\`

### 需要栈（LIFO）→ list 就行

\`\`\`python
stack = []
stack.append("A")
stack.pop()                        # O(1)，列表尾部操作快
\`\`\`

### 需要计数 → Counter

\`\`\`python
from collections import Counter
words = ["a", "b", "a", "c", "a"]
c = Counter(words)                 # 一行计数
\`\`\`

### 需要不可变记录 → namedtuple

\`\`\`python
from collections import namedtuple
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)                    # 不可变，省内存
\`\`\`

## 性能陷阱与优化

### 陷阱 1：用列表做成员测试

\`\`\`python
# 慢：列表的 in 是 O(n)
data = list(range(1000000))
if 999999 in data:                 # 要遍历 100 万次
    pass

# 快：转成集合，in 是 O(1)
data_set = set(data)
if 999999 in data_set:             # 1 次哈希查找
    pass
\`\`\`

### 陷阱 2：用列表做队列

\`\`\`python
# 慢：pop(0) 是 O(n)
queue = [1, 2, 3]
queue.append(4)
queue.pop(0)                       # 要移动所有元素

# 快：用 deque
from collections import deque
queue = deque([1, 2, 3])
queue.append(4)
queue.popleft()                    # O(1)
\`\`\`

### 陷阱 3：字符串拼接

\`\`\`python
# 慢：每次 + 都创建新字符串
parts = []
for i in range(1000):
    parts.append(f"行{i}")
result = ""
for p in parts:
    result = result + p            # 每次都复制整个字符串，O(n²)

# 快：用 join
result = "".join(parts)            # 一次性拼接，O(n)
\`\`\`

### 陷阱 4：嵌套循环

\`\`\`python
# 慢：O(n²)
list1 = [1, 2, 3, 4, 5]
list2 = [4, 5, 6, 7, 8]
common = []
for x in list1:
    for y in list2:                # 双重循环
        if x == y:
            common.append(x)

# 快：用集合，O(n)
common = list(set(list1) & set(list2))
\`\`\`

## timeit：精准测量性能

\`timeit\` 模块专门用来测量小代码片段的执行时间，比 \`time.time()\` 更准（自动重复多次取平均）。

\`\`\`python
import timeit

# 测量列表头部插入
t1 = timeit.timeit("lst.insert(0, 1)", setup="lst = []", number=10000)
print(f"列表头部插入 10000 次: {t1:.3f}s")

# 测量 deque 头部插入
t2 = timeit.timeit("dq.appendleft(1)", setup="from collections import deque; dq = deque()", number=10000)
print(f"deque 头部插入 10000 次: {t2:.3f}s")
\`\`\`

### 命令行用 timeit

\`\`\`bash
python3 -m timeit "'-'.join(str(n) for n in range(100))"
python3 -m timeit "'-'.join([str(n) for n in range(100)])"
\`\`\`

命令行直接对比两种写法，输出平均每次耗时。

### timeit 实战：对比不同写法

\`\`\`python
import timeit

# 对比：列表推导式 vs for 循环
setup = ""
code1 = "[x*2 for x in range(1000)]"
code2 = """
result = []
for x in range(1000):
    result.append(x*2)
"""

t1 = timeit.timeit(code1, number=10000)
t2 = timeit.timeit(code2, number=10000)
print(f"列表推导式: {t1:.3f}s")
print(f"for 循环: {t2:.3f}s")
\`\`\`

通常列表推导式更快——它在 C 层面优化过，少了一堆 Python 层的方法调用。

## 内存使用

除了速度，内存也是考量。Python 对象的内存开销不小：

\`\`\`python
import sys

# 一个整数占多少内存
print(sys.getsizeof(0))            # 28 字节（不是 4！）
print(sys.getsizeof(1))            # 28 字节

# 列表 vs 元组
lst = [1, 2, 3]
tup = (1, 2, 3)
print(sys.getsizeof(lst))          # 比元组大
print(sys.getsizeof(tup))          # 元组更省（不可变，不需要额外空间）

# 字典
d = {"a": 1, "b": 2}
print(sys.getsizeof(d))            # 字典有哈希表开销
\`\`\`

\`sys.getsizeof()\` 查看对象的"浅层"内存。注意它不递归计算内部对象——列表本身的大小不包含元素的内存。

### 省内存的技巧

1. **用元组替代列表**（如果不需要修改）
2. **用 generator 替代列表**（如果只遍历一次）
3. **用 array 模块**（如果存的是同类型数字）

\`\`\`python
import sys
from array import array

# 列表存 1000 个整数
lst = list(range(1000))
print(sys.getsizeof(lst))          # 较大

# array 存 1000 个整数（C 数组）
arr = array('i', range(1000))
print(sys.getsizeof(arr))          # 小得多
\`\`\`

\`array\` 模块用 C 数组存储，比列表省内存，但只能存同类型数字。

## 综合对比实验

下面的 demo 用 timeit 实测各种数据结构的性能差距，让你直观感受"选对数据结构"的威力。`,
  },
];
