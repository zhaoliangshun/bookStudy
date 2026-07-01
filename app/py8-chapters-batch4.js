// =============================================================
// py8-chapters-batch4.js
// 模块：数据结构（共 10 章）
// 全新制作，简单易懂，demo 多，难代码逐行讲解
// =============================================================

export const chapters = [
  {
    id: "py8-list-basic",
    group: "数据结构",
    icon: "📋",
    title: "列表 list 基础与方法",
    content: `## 列表是什么

\`list\` 是 Python 最常用的**可变、有序**数据结构，用方括号 \`[]\` 表示，元素之间用逗号分隔。它可以放任意类型的数据，长度可变。

### 创建列表的几种方式

\`\`\`python
# 1. 直接用方括号
nums = [1, 2, 3, 4, 5]
mixed = [1, "hello", True, 3.14]   # 可以混合类型

# 2. 用 list() 转换其他可迭代对象
chars = list("abc")      # ['a', 'b', 'c']
nums2 = list(range(5))   # [0, 1, 2, 3, 4]

# 3. 空列表
empty1 = []
empty2 = list()
\`\`\`

### 索引访问

列表元素从 \`0\` 开始编号，也支持负索引（从末尾倒数）：

\`\`\`python
fruits = ["apple", "banana", "cherry"]
fruits[0]    # 'apple'  正向索引
fruits[-1]   # 'cherry' 负索引（最后一个）
\`\`\`

### 增删改查方法对照表

| 操作 | 方法 | 示例 |
|------|------|------|
| 末尾追加 | \`append(x)\` | \`lst.append(4)\` |
| 批量追加 | \`extend(it)\` | \`lst.extend([5,6])\` |
| 指定位置插入 | \`insert(i,x)\` | \`lst.insert(0, 9)\` |
| 按值删除 | \`remove(x)\` | \`lst.remove(3)\` |
| 按索引弹出 | \`pop(i)\` | \`lst.pop()\` 弹末尾 |
| 按索引删除 | \`del lst[i]\` | \`del lst[0]\` |
| 清空 | \`clear()\` | \`lst.clear()\` |
| 修改 | 赋值 | \`lst[0] = 99\` |
| 查位置 | \`index(x)\` | \`lst.index(3)\` |
| 计次数 | \`count(x)\` | \`lst.count(2)\` |
| 判断存在 | \`in\` | \`3 in lst\` |

### sort 与 sorted 的区别（重点）

\`\`\`python
# sorted()：内置函数，返回新列表，不改原列表
new = sorted([3, 1, 2])

# list.sort()：列表方法，原地排序，返回 None
lst = [3, 1, 2]
lst.sort()      # lst 变成 [1, 2, 3]
\`\`\`

| 对比 | \`sorted()\` | \`list.sort()\` |
|------|------------|----------------|
| 类型 | 内置函数 | 列表方法 |
| 是否改原列表 | 否 | 是 |
| 返回值 | 新列表 | \`None\` |
| 适用范围 | 任何可迭代对象 | 仅列表 |

### 常见陷阱

- **\`sort()\` 返回 None**：不能写 \`lst = lst.sort()\`，这样 lst 会变 None
- **\`append\` vs \`extend\`**：\`append([1,2])\` 是把整个列表当一个元素加进去
- **遍历时修改**：循环中增删元素容易出 bug，建议先收集再修改

下面的 demo 完整演示列表的增删改查与排序方法。`,
    code: `# ==========================================
# 列表 list 基础方法完整演示
# ==========================================

print("=" * 45)
print("       列表 list 基础方法演示")
print("=" * 45)

# 1. 创建列表的多种方式
print()
print("=== 1. 创建列表 ===")
a = [1, 2, 3, 4, 5]            # 方括号直接创建
b = list("hello")              # 把字符串转成字符列表
c = list(range(1, 6))         # range 对象转列表
d = []                         # 空列表
print(f"方括号: {a}")
print(f"list('hello'): {b}")
print(f"list(range(1,6)): {c}")
print(f"空列表: {d}")

# 2. 索引访问（含负索引）
print()
print("=== 2. 索引访问 ===")
fruits = ["apple", "banana", "cherry", "date"]
print(f"列表: {fruits}")
print(f"fruits[0]  = {fruits[0]}")    # 第一个
print(f"fruits[1]  = {fruits[1]}")    # 第二个
print(f"fruits[-1] = {fruits[-1]}")   # 最后一个
print(f"fruits[-2] = {fruits[-2]}")   # 倒数第二个

# 3. 增加元素
print()
print("=== 3. 增加元素 ===")
lst = [1, 2, 3]
lst.append(4)                  # 末尾追加单个元素
print(f"append(4) -> {lst}")
lst.append([5, 6])             # append 把列表当一个元素加入
print(f"append([5,6]) -> {lst}")
lst.extend([7, 8, 9])          # extend 把列表展开追加
print(f"extend([7,8,9]) -> {lst}")
lst.insert(0, 0)               # 在索引 0 处插入 0
print(f"insert(0, 0) -> {lst}")

# 4. 删除元素
print()
print("=== 4. 删除元素 ===")
lst = [10, 20, 30, 40, 50, 30]
removed = lst.pop()            # 弹出末尾元素并返回它
print(f"pop() 弹出 {removed} -> {lst}")
popped = lst.pop(0)            # 弹出指定索引
print(f"pop(0) 弹出 {popped} -> {lst}")
lst.remove(30)                 # 删除第一个值为 30 的元素
print(f"remove(30) -> {lst}")
del lst[0]                     # 按索引删除
print(f"del lst[0] -> {lst}")
lst.clear()                    # 清空整个列表
print(f"clear() -> {lst}")

# 5. 修改元素
print()
print("=== 5. 修改元素 ===")
lst = ["a", "b", "c"]
lst[0] = "A"                   # 修改单个
lst[1:3] = ["B", "C", "D"]     # 切片修改（一次改多个）
print(f"修改后: {lst}")

# 6. 查询：index / count / in
print()
print("=== 6. 查询方法 ===")
lst = [1, 2, 3, 2, 4, 2]
print(f"列表: {lst}")
print(f"index(2)  首次出现位置: {lst.index(2)}")
print(f"count(2)  出现次数: {lst.count(2)}")
print(f"3 in lst  是否存在: {3 in lst}")
print(f"9 in lst  是否存在: {9 in lst}")

# 7. sort 与 sorted 的区别（重点）
print()
print("=== 7. sort 与 sorted 的区别 ===")
nums = [3, 1, 4, 1, 5, 9, 2, 6]
new_sorted = sorted(nums)      # 不改原列表，返回新列表
print(f"原列表 nums: {nums}")
print(f"sorted(nums) 新列表: {new_sorted}")

ret = nums.sort()              # 原地排序，返回 None
print(f"nums.sort() 返回值: {ret}")
print(f"nums 排序后: {nums}")

# 降序排序
nums.sort(reverse=True)
print(f"sort(reverse=True): {nums}")

# 8. reverse 反转
print()
print("=== 8. reverse 反转 ===")
lst = [1, 2, 3, 4, 5]
lst.reverse()                 # 原地反转
print(f"reverse() -> {lst}")
print(f"reversed() 新列表: {list(reversed(lst))}")

# 9. copy 浅拷贝
print()
print("=== 9. copy 浅拷贝 ===")
original = [1, 2, 3]
copied = original.copy()       # 也可以用 original[:] 或 list(original)
copied.append(4)
print(f"original: {original}")   # 不受影响
print(f"copied: {copied}")

# 10. 列表嵌套（二维列表）
print()
print("=== 10. 二维列表 ===")
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
print(f"矩阵: {matrix}")
print(f"matrix[0]    = {matrix[0]}")
print(f"matrix[1][2]  = {matrix[1][2]}")    # 第 2 行第 3 列
# 遍历二维列表
print("遍历矩阵:")
for i, row in enumerate(matrix):
    print(f"  第{i}行: {row}")

# 11. 注意事项演示
print()
print("=== 11. 常见陷阱 ===")
# 陷阱1: sort 返回 None
lst = [3, 1, 2]
wrong = lst.sort()
print(f"陷阱1 sort 返回 None: {wrong}, lst 已排序: {lst}")
# 陷阱2: append 加列表 vs extend
lst = [1, 2, 3]
lst.append([4, 5])            # 把 [4,5] 当一个元素
print(f"陷阱2 append([4,5]): {lst}")
lst = [1, 2, 3]
lst.extend([4, 5])            # 展开追加
print(f"对比  extend([4,5]): {lst}")`
  },
  {
    id: "py8-list-slice",
    group: "数据结构",
    icon: "✂️",
    title: "列表切片与推导式",
    content: `## 切片是什么

切片（slice）让你**取出列表的一段**，语法：

\`\`\`python
lst[start:stop:step]
\`\`\`

- \`start\`：起始索引（包含），默认 0
- \`stop\`：结束索引（**不包含**），默认到末尾
- \`step\`：步长，默认 1

### 基本切片

\`\`\`python
nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

nums[2:5]    # [2, 3, 4]      从索引 2 到 4
nums[:3]     # [0, 1, 2]      从开头到 2
nums[7:]     # [7, 8, 9]      从 7 到末尾
nums[:]      # 整个列表的副本
\`\`\`

### 步长 step

\`\`\`python
nums[::2]    # [0, 2, 4, 6, 8]  步长 2，隔一个取
nums[1::2]   # [1, 3, 5, 7, 9]  从 1 开始步长 2
\`\`\`

### 负步长：反转列表

\`\`\`python
nums[::-1]   # [9, 8, 7, ..., 0]  反转
\`\`\`

这是 Python 最优雅的反转技巧。

### 切片赋值

切片还可以作为**左值**被赋值，会原地修改：

\`\`\`python
lst = [1, 2, 3, 4, 5]
lst[1:3] = [20, 30, 40]    # [1, 20, 30, 40, 4, 5]
\`\`\`

### del 删除切片

\`\`\`python
lst = [1, 2, 3, 4, 5]
del lst[1:3]    # [1, 4, 5]
\`\`\`

### 浅拷贝：\`lst[:]\`

\`\`\`python
new = lst[:]    # 等价于 lst.copy()
\`\`\`

### 列表推导式

推导式是 Python 用一行生成列表的优雅写法：

\`\`\`python
# 基本形式
[表达式 for 变量 in 可迭代对象]

# 带条件
[表达式 for 变量 in 可迭代对象 if 条件]

# 示例
squares = [x*x for x in range(5)]          # [0, 1, 4, 9, 16]
evens = [x for x in range(10) if x % 2 == 0]
\`\`\`

### 二维列表

\`\`\`python
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
matrix[1][2]    # 6
\`\`\`

### 致命陷阱：可变默认参数

\`\`\`python
# 错误！默认值在函数定义时只创建一次，所有调用共享
def add_item(item, lst=[]):
    lst.append(item)
    return lst

add_item(1)    # [1]
add_item(2)    # [1, 2]  不是 [2]！lst 一直是同一个
\`\`\`

正确写法用 \`None\`：

\`\`\`python
def add_item(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst
\`\`\`

下面的 demo 完整演示切片、推导式和陷阱。`,
    code: `# ==========================================
# 列表切片与推导式完整演示
# ==========================================

print("=" * 45)
print("      列表切片与推导式演示")
print("=" * 45)

# 1. 基本切片
print()
print("=== 1. 基本切片 ===")
nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
print(f"原列表: {nums}")
print(f"nums[2:5]  -> {nums[2:5]}")    # 索引 2,3,4
print(f"nums[:3]   -> {nums[:3]}")     # 前 3 个
print(f"nums[7:]   -> {nums[7:]}")     # 从 7 到末尾
print(f"nums[:]    -> {nums[:]}")      # 整个副本

# 2. 负索引切片
print()
print("=== 2. 负索引切片 ===")
print(f"nums[-3:]  -> {nums[-3:]}")    # 最后 3 个
print(f"nums[-5:-2]-> {nums[-5:-2]}")  # 倒数 5 到 倒数 3
print(f"nums[:-3]  -> {nums[:-3]}")    # 除最后 3 个外全部

# 3. 步长 step
print()
print("=== 3. 步长 step ===")
print(f"nums[::2]  -> {nums[::2]}")    # 隔一个取
print(f"nums[1::2] -> {nums[1::2]}")  # 从 1 开始隔一个
print(f"nums[2:8:2]-> {nums[2:8:2]}") # 2 到 7 步长 2

# 4. 负步长：反转
print()
print("=== 4. 负步长反转 ===")
print(f"nums[::-1] -> {nums[::-1]}")    # 经典反转
print(f"nums[8:2:-1] -> {nums[8:2:-1]}")  # 从 8 倒着到 3

# 5. 切片赋值
print()
print("=== 5. 切片赋值 ===")
lst = [1, 2, 3, 4, 5]
lst[1:3] = [20, 30, 40]                # 用更多元素替换
print(f"lst[1:3]=[20,30,40] -> {lst}")
lst = [1, 2, 3, 4, 5]
lst[1:4] = [99]                        # 用更少元素替换
print(f"lst[1:4]=[99] -> {lst}")

# 6. del 删除切片
print()
print("=== 6. del 删除切片 ===")
lst = [1, 2, 3, 4, 5, 6, 7]
del lst[1:4]                            # 删除索引 1,2,3
print(f"del lst[1:4] -> {lst}")

# 7. 浅拷贝对比
print()
print("=== 7. 浅拷贝对比 ===")
original = [1, 2, 3]
copy1 = original[:]                     # 切片拷贝
copy2 = original.copy()                 # 方法拷贝
copy3 = list(original)                  # 构造函数拷贝
copy1.append(4)
print(f"original: {original}")          # 不变
print(f"copy1: {copy1}")
print(f"三个拷贝都独立? {copy1 is not original and copy2 is not original and copy3 is not original}")

# 8. 列表推导式
print()
print("=== 8. 列表推导式 ===")
squares = [x * x for x in range(6)]
print(f"平方: {squares}")
evens = [x for x in range(10) if x % 2 == 0]
print(f"偶数: {evens}")
upper_words = [w.upper() for w in ["hello", "world"]]
print(f"大写: {upper_words}")
# 嵌套循环推导式
pairs = [(x, y) for x in range(2) for y in range(2)]
print(f"组合对: {pairs}")
# 带条件的表达式
labels = ["偶" if x % 2 == 0 else "奇" for x in range(5)]
print(f"奇偶标签: {labels}")

# 9. 推导式结合切片
print()
print("=== 9. 推导式结合切片 ===")
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
# 取每行第一个元素
first_col = [row[0] for row in matrix]
print(f"第一列: {first_col}")
# 取每行最后两个
last_two = [row[-2:] for row in matrix]
print(f"每行最后两个: {last_two}")

# 10. 二维列表
print()
print("=== 10. 二维列表 ===")
grid = [[0] * 3 for _ in range(3)]      # 正确：每行独立
grid[0][0] = 9
print(f"二维列表: {grid}")
print(f"grid[0][0] = {grid[0][0]}, grid[1][0] = {grid[1][0]}")

# 11. 陷阱：可变默认参数
print()
print("=== 11. 陷阱：可变默认参数 ===")

# 错误写法（演示问题）
def add_bad(item, lst=[]):
    lst.append(item)
    return lst

r1 = add_bad(1)
r2 = add_bad(2)
print(f"错误写法 add_bad(1)={r1}, add_bad(2)={r2}")
print("问题：两次调用共享同一个默认列表！")

# 正确写法
def add_good(item, lst=None):
    if lst is None:                     # 每次调用都是新列表
        lst = []
    lst.append(item)
    return lst

g1 = add_good(1)
g2 = add_good(2)
print(f"正确写法 add_good(1)={g1}, add_good(2)={g2}")
print("修复：每次调用都是独立列表")

# 12. 陷阱：[[0]*3]*3 错误创建二维
print()
print("=== 12. 陷阱：[[0]*3]*3 共享行 ===")
bad_grid = [[0] * 3] * 3                # 三行其实是同一个列表
bad_grid[0][0] = 9
print(f"错误创建后改 [0][0]: {bad_grid}")
print("三行都被改了！因为是同一行对象")`
  },
  {
    id: "py8-tuple",
    group: "数据结构",
    icon: "🔒",
    title: "元组 tuple 与命名元组",
    content: `## 元组是什么

\`tuple\` 是**不可变、有序**的序列，用圆括号 \`()\` 表示。一旦创建，**不能增删改**元素。

\`\`\`python
t = (1, 2, 3)
t[0] = 99    # 报错！元组不可变
\`\`\`

### 创建元组

\`\`\`python
t1 = (1, 2, 3)       # 圆括号
t2 = 1, 2, 3          # 不加括号也行
t3 = tuple([1, 2])    # 从列表转换
t4 = ()               # 空元组
\`\`\`

### 致命陷阱：单元素元组

\`\`\`python
x = (5)        # 这不是元组！这是整数 5
y = (5,)       # 这才是单元素元组，注意那个逗号
\`\`\`

\`(5)\` 只是括号里的 5，**逗号才是定义元组的关键**。

### 不可变性的真正含义

元组本身不可变，但**里面的可变对象可以改**：

\`\`\`python
t = (1, [2, 3], 4)
t[1].append(99)    # 合法！改的是列表，不是元组
# t[1] = [9]       # 报错！不能替换元组的元素
\`\`\`

### 打包与解包

\`\`\`python
# 打包：多个值装进一个元组
point = 3, 4

# 解包：把元组拆开赋给多个变量
x, y = point
\`\`\`

### 多变量交换

Python 的交换本质就是元组打包解包：

\`\`\`python
a, b = 1, 2
a, b = b, a      # 等价于先打包成 (b, a) 再解包给 a, b
\`\`\`

### 函数返回多值

\`\`\`python
def min_max(nums):
    return min(nums), max(nums)   # 实际返回元组

lo, hi = min_max([3, 1, 4, 1, 5])
\`\`\`

### namedtuple 具名元组

普通元组只能用索引 \`t[0]\`、\`t[1]\` 访问，可读性差。\`namedtuple\` 给每个位置起名字：

\`\`\`python
from collections import namedtuple

Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
p.x       # 3，按名字访问
p.y       # 4
p[0]      # 3，仍然可以按索引
\`\`\`

| 对比 | 普通元组 | namedtuple |
|------|---------|------------|
| 访问方式 | \`t[0]\` 索引 | \`p.x\` 名字 |
| 可读性 | 差 | 好 |
| 内存 | 小 | 略大 |
| 可变性 | 不可变 | 不可变 |

### namedtuple 常用方法

\`\`\`python
p._fields              # ('x', 'y') 所有字段名
p._replace(x=99)       # 返回替换后的新元组（不改原元组）
p._asdict()            # 转成字典 OrderedDict
\`\`\`

### 元组 vs 列表怎么选

| 场景 | 推荐 |
|------|------|
| 数据不变（坐标、配置） | 元组 |
| 数据要增删改 | 列表 |
| 字典的键 | 元组（列表不行） |
| 函数返回多值 | 元组 |
| 性能敏感、元素少 | 元组（更省内存） |

下面的 demo 完整演示元组与命名元组。`,
    code: `# ==========================================
# 元组 tuple 与命名元组演示
# ==========================================
from collections import namedtuple

print("=" * 45)
print("      元组 tuple 与命名元组演示")
print("=" * 45)

# 1. 创建元组
print()
print("=== 1. 创建元组 ===")
t1 = (1, 2, 3)
t2 = 4, 5, 6                      # 不加括号也是元组
t3 = tuple([7, 8, 9])             # 从列表转换
t4 = ()                            # 空元组
print(f"圆括号: {t1}")
print(f"无括号: {t2}")
print(f"tuple(): {t3}")
print(f"空元组: {t4}, 长度: {len(t4)}")

# 2. 单元素元组陷阱（重要）
print()
print("=== 2. 单元素元组陷阱 ===")
not_tuple = (5)                    # 只是整数 5
real_tuple = (5,)                  # 这才是元组
print(f"(5)    类型: {type(not_tuple).__name__}, 值: {not_tuple}")
print(f"(5,)   类型: {type(real_tuple).__name__}, 值: {real_tuple}")
print("关键：逗号才是元组的标志，不是括号！")

# 3. 不可变性
print()
print("=== 3. 不可变性 ===")
t = (1, 2, 3)
print(f"元组: {t}")
print(f"t[0] = {t[0]}")
try:
    t[0] = 99                      # 尝试修改
except TypeError as e:
    print(f"尝试 t[0]=99 报错: {e}")

# 4. 不可变性 vs 内部可变对象
print()
print("=== 4. 内部可变对象可以改 ===")
t = (1, [2, 3], 4)
print(f"原元组: {t}")
t[1].append(99)                    # 改的是列表，不是元组位置
print(f"改列表后: {t}")
print("元组本身没变，变得是里面的列表对象")

# 5. 打包与解包
print()
print("=== 5. 打包与解包 ===")
point = 3, 4                       # 打包
print(f"打包 point = {point}, 类型: {type(point).__name__}")
x, y = point                       # 解包
print(f"解包 x={x}, y={y}")

# 解包扩展
a, b, c, d = 10, 20, 30, 40
print(f"多变量解包: a={a} b={b} c={c} d={d}")

# 星号解包：收集剩余
first, *rest = [1, 2, 3, 4, 5]
print(f"first={first}, rest={rest}")

# 6. 多变量交换
print()
print("=== 6. 多变量交换 ===")
a, b = 1, 2
print(f"交换前: a={a} b={b}")
a, b = b, a                        # 本质是元组打包解包
print(f"交换后: a={a} b={b}")

# 三变量轮换
a, b, c = 1, 2, 3
a, b, c = b, c, a
print(f"三变量轮换: a={a} b={b} c={c}")

# 7. 函数返回多值
print()
print("=== 7. 函数返回多值 ===")
def min_max(nums):
    """返回最小值和最大值（实际是元组）"""
    return min(nums), max(nums)

result = min_max([3, 1, 4, 1, 5, 9, 2, 6])
print(f"返回值: {result}, 类型: {type(result).__name__}")
lo, hi = result                    # 解包接收
print(f"最小={lo}, 最大={hi}")

# 8. namedtuple 命名元组
print()
print("=== 8. namedtuple 命名元组 ===")
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
print(f"创建: {p}")
print(f"按名字访问 p.x={p.x}, p.y={p.y}")
print(f"按索引访问 p[0]={p[0]}, p[1]={p[1]}")

# 应用：表示一条记录
Student = namedtuple("Student", ["name", "age", "score"])
stu = Student("小明", 18, 95.5)
print(f"学生: {stu}")
print(f"姓名: {stu.name}, 年龄: {stu.age}, 成绩: {stu.score}")

# 9. namedtuple 的常用方法
print()
print("=== 9. namedtuple 常用方法 ===")
print(f"_fields 字段名: {stu._fields}")
new_stu = stu._replace(score=99.0)         # 返回新的，不改原
print(f"_replace(score=99): {new_stu}")
print(f"原元组未变: {stu}")
d = stu._asdict()                            # 转成字典
print(f"_asdict(): {dict(d)}")

# 10. 元组作为字典的键（列表不行）
print()
print("=== 10. 元组作为字典键 ===")
locations = {
    (39.9, 116.4): "北京",
    (31.2, 121.5): "上海",
}
print(f"地点字典: {locations}")
print(f"查询 (39.9, 116.4): {locations[(39.9, 116.4)]}")

# 11. 元组 vs 列表性能对比
print()
print("=== 11. 元组 vs 列表 ===")
import sys
lst = [1, 2, 3, 4, 5]
tup = (1, 2, 3, 4, 5)
print(f"列表内存: {sys.getsizeof(lst)} 字节")
print(f"元组内存: {sys.getsizeof(tup)} 字节")
print("元组更省内存，因为不需要为可变性预留空间")`
  },
  {
    id: "py8-dict-basic",
    group: "数据结构",
    icon: "🗂️",
    title: "字典 dict 基础",
    content: `## 字典是什么

\`dict\` 是 **键值对（key-value）** 的可变容器，用花括号 \`{}\` 表示。通过键快速查找值，查找速度几乎与大小无关。

\`\`\`python
person = {"name": "小明", "age": 18}
person["name"]    # '小明'
\`\`\`

### 创建字典

\`\`\`python
# 1. 花括号
d1 = {"a": 1, "b": 2}

# 2. dict() 构造函数
d2 = dict(a=1, b=2)            # 关键字参数
d3 = dict([("a", 1), ("b", 2)])  # 列表对
d4 = dict(zip(["a", "b"], [1, 2]))

# 3. 空字典
empty = {}
empty2 = dict()
\`\`\`

### 增改查删

\`\`\`python
d = {}
d["name"] = "小明"      # 增：键不存在则新增
d["age"] = 18
d["age"] = 20           # 改：键存在则覆盖
d["name"]               # 查
del d["age"]            # 删
\`\`\`

### 键必须可哈希

字典的键必须是**不可变类型**（可哈希）：

| 类型 | 能否做键 |
|------|----------|
| 字符串、数字、元组 | ✅ 可以 |
| 列表、字典、集合 | ❌ 不行 |

\`\`\`python
d = {}
d[[1, 2]] = "x"     # 报错！列表不可哈希
d[(1, 2)] = "x"     # 可以，元组可哈希
\`\`\`

### in 判断键是否存在

\`\`\`python
"name" in d     # True / False
\`\`\`

**判断的是键，不是值**！这是初学者常犯的错。

### keys / values / items 视图

\`\`\`python
d = {"a": 1, "b": 2}
d.keys()     # dict_keys(['a', 'b'])
d.values()   # dict_values([1, 2])
d.items()    # dict_items([('a', 1), ('b', 2)])
\`\`\`

这些是**视图对象**，会随字典变化而更新。

### 遍历字典

\`\`\`python
# 遍历键
for k in d:
    print(k)

# 遍历键值对（最常用）
for k, v in d.items():
    print(k, v)
\`\`\`

### 字典保持插入顺序

Python 3.7+ 起，字典**保证按插入顺序**输出。早期版本（3.6 前）不保证。

### 嵌套字典

\`\`\`python
school = {
    "class1": {"teacher": "张老师", "students": 30},
    "class2": {"teacher": "李老师", "students": 25},
}
school["class1"]["teacher"]    # '张老师'
\`\`\`

### 常见陷阱

- **键必须唯一**：后写覆盖先写 \`{"a":1, "a":2}\` 结果是 \`{"a":2}\`
- **直接索引不存在键会 KeyError**：用 \`d.get(k)\` 更安全
- **遍历时修改大小**：会报错，应先收集再改

下面的 demo 完整演示字典基础用法。`,
    code: `# ==========================================
# 字典 dict 基础完整演示
# ==========================================

print("=" * 45)
print("        字典 dict 基础演示")
print("=" * 45)

# 1. 创建字典的多种方式
print()
print("=== 1. 创建字典 ===")
d1 = {"name": "小明", "age": 18}
d2 = dict(name="小红", age=20)            # 关键字参数
d3 = dict([("a", 1), ("b", 2)])            # 列表对
d4 = dict(zip(["x", "y"], [10, 20]))       # zip 配对
print(f"花括号: {d1}")
print(f"dict(关键字): {d2}")
print(f"dict(列表对): {d3}")
print(f"dict(zip): {d4}")

# 2. 增改查删
print()
print("=== 2. 增改查删 ===")
user = {}
user["name"] = "小明"                       # 增
user["age"] = 18
user["city"] = "北京"
print(f"增加后: {user}")
user["age"] = 20                            # 改：键存在则覆盖
print(f"改 age=20: {user}")
print(f"查 user['name']: {user['name']}")
del user["city"]                            # 删
print(f"删 city: {user}")

# 3. 键必须可哈希
print()
print("=== 3. 键必须可哈希 ===")
d = {}
d["字符串"] = "可以"
d[123] = "数字也可以"
d[(1, 2)] = "元组也可以"
print(f"有效键: {d}")
try:
    d[[1, 2]] = "列表不行"                  # 列表不可哈希
except TypeError as e:
    print(f"列表做键报错: {e}")

# 4. in 判断键（注意是键不是值）
print()
print("=== 4. in 判断键 ===")
d = {"name": "小明", "age": 18}
print(f"字典: {d}")
print(f"'name' in d: {'name' in d}")        # True
print(f"'小明' in d: {'小明' in d}")        # False！判断的是键
print(f"'age' in d: {'age' in d}")          # True

# 5. keys / values / items 视图
print()
print("=== 5. keys / values / items ===")
d = {"a": 1, "b": 2, "c": 3}
print(f"keys():   {list(d.keys())}")
print(f"values(): {list(d.values())}")
print(f"items():  {list(d.items())}")

# 视图是动态的
print()
keys_view = d.keys()
print(f"添加前 keys_view: {list(keys_view)}")
d["d"] = 4
print(f"添加后 keys_view: {list(keys_view)}")   # 视图自动更新

# 6. len 与遍历
print()
print("=== 6. len 与遍历 ===")
d = {"apple": 5, "banana": 3, "cherry": 8}
print(f"长度: {len(d)}")
print("遍历键:")
for k in d:
    print(f"  {k}")
print("遍历键值对:")
for k, v in d.items():
    print(f"  {k} = {v}")

# 7. 字典保持插入顺序（3.7+）
print()
print("=== 7. 插入顺序 ===")
order = {}
for ch in "hello":
    order[ch] = order.get(ch, 0) + 1
print(f"按插入顺序: {list(order.keys())}")   # h, e, l, o

# 8. 嵌套字典
print()
print("=== 8. 嵌套字典 ===")
school = {
    "class1": {"teacher": "张老师", "students": 30},
    "class2": {"teacher": "李老师", "students": 25},
}
print(f"学校: {school}")
print(f"class1 老师: {school['class1']['teacher']}")
print(f"class2 学生数: {school['class2']['students']}")

# 遍历嵌套字典
print("各班级信息:")
for cls, info in school.items():
    print(f"  {cls}: {info['teacher']} 带 {info['students']} 人")

# 9. 常见陷阱
print()
print("=== 9. 常见陷阱 ===")
# 陷阱1: 键重复，后者覆盖
dup = {"a": 1, "a": 2, "a": 3}
print(f"陷阱1 键重复: {dup}")    # {'a': 3}

# 陷阱2: 直接索引不存在键会 KeyError
d = {"a": 1}
try:
    val = d["b"]                            # 不存在直接报错
except KeyError as e:
    print(f"陷阱2 d['b'] 报错: KeyError: {e}")
print(f"  安全写法 d.get('b'): {d.get('b')}")     # 返回 None
print(f"  d.get('b', 0): {d.get('b', 0)}")        # 返回默认值

# 陷阱3: 遍历时修改大小
d = {"a": 1, "b": 2, "c": 3}
print(f"陷阱3 遍历时修改:")
try:
    for k in d:
        if k == "b":
            del d[k]                        # 遍历时改大小，报错
except RuntimeError as e:
    print(f"  报错: {e}")
# 正确做法：先收集要删的键
d = {"a": 1, "b": 2, "c": 3}
to_del = [k for k in d if k == "b"]
for k in to_del:
    del d[k]
print(f"  正确做法后: {d}")`
  },
  {
    id: "py8-dict-methods",
    group: "数据结构",
    icon: "🧰",
    title: "字典方法与推导式",
    content: `## get 方法：安全取值

直接用 \`d[key]\` 取值，键不存在会抛 \`KeyError\`。\`get()\` 更安全：

\`\`\`python
d = {"a": 1}
d.get("a")         # 1
d.get("b")          # None（不报错）
d.get("b", 0)       # 0（指定默认值）
\`\`\`

| 写法 | 键存在 | 键不存在 |
|------|--------|----------|
| \`d[key]\` | 返回值 | **报错 KeyError** |
| \`d.get(key)\` | 返回值 | 返回 \`None\` |
| \`d.get(key, default)\` | 返回值 | 返回 \`default\` |

### setdefault：取值或设置默认

\`\`\`python
d.setdefault(key, default)
\`\`\`

- 键存在：返回对应值，**不改字典**
- 键不存在：插入 \`key:default\`，返回 \`default\`

\`\`\`python
d = {"a": 1}
d.setdefault("a", 99)    # 返回 1，字典不变
d.setdefault("b", 99)     # 返回 99，字典变成 {"a":1, "b":99}
\`\`\`

### pop / popitem

\`\`\`python
d.pop("a")           # 删除并返回 a 的值
d.pop("b", 0)        # 不存在返回 0，不报错
d.popitem()          # 弹出最后一个键值对（3.7+ 是插入顺序最后）
\`\`\`

### update：合并字典

\`\`\`python
d1 = {"a": 1}
d2 = {"b": 2, "a": 99}
d1.update(d2)         # d1 变成 {"a": 99, "b": 2}
\`\`\`

键冲突时，**参数里的覆盖原字典**。

### fromkeys：批量创建

\`\`\`python
keys = ["a", "b", "c"]
d = dict.fromkeys(keys, 0)    # {"a": 0, "b": 0, "c": 0}
\`\`\`

⚠️ 默认值若是可变对象（如 \`[]\`），所有键**共享同一个对象**！

### 字典推导式

\`\`\`python
{键: 值 for 变量 in 可迭代对象 if 条件}

# 示例：平方映射
squares = {x: x*x for x in range(4)}    # {0:0, 1:1, 2:4, 3:9}

# 反转字典
inv = {v: k for k, v in d.items()}
\`\`\`

### 合并运算符 | （3.9+）

\`\`\`python
d1 = {"a": 1}
d2 = {"b": 2}
merged = d1 | d2           # {"a": 1, "b": 2}
d1 |= d2                   # 原地合并，等价于 d1.update(d2)
\`\`\`

### 反转字典

把"键值"对调，注意值要可哈希且唯一：

\`\`\`python
d = {"a": 1, "b": 2}
inv = {v: k for k, v in d.items()}    # {1: 'a', 2: 'b'}
\`\`\`

下面的 demo 完整演示字典方法与推导式。`,
    code: `# ==========================================
# 字典方法与推导式完整演示
# ==========================================

print("=" * 45)
print("      字典方法与推导式演示")
print("=" * 45)

# 1. get 安全取值
print()
print("=== 1. get 方法 ===")
d = {"name": "小明", "age": 18}
print(f"字典: {d}")
print(f"d.get('name'): {d.get('name')}")
print(f"d.get('phone'): {d.get('phone')}")          # None
print(f"d.get('phone', '未填'): {d.get('phone', '未填')}")  # 默认值

# 2. setdefault
print()
print("=== 2. setdefault ===")
d = {"a": 1}
print(f"原字典: {d}")
r1 = d.setdefault("a", 99)               # 键存在，返回旧值
print(f"setdefault('a', 99) 返回: {r1}, 字典: {d}")
r2 = d.setdefault("b", 99)               # 键不存在，插入并返回
print(f"setdefault('b', 99) 返回: {r2}, 字典: {d}")

# setdefault 经典应用：分组
print()
print("setdefault 分组应用:")
words = ["apple", "ant", "banana", "bee", "cat"]
groups = {}
for w in words:
    key = w[0]                            # 按首字母分组
    groups.setdefault(key, []).append(w)
print(f"按首字母分组: {groups}")

# 3. pop / popitem
print()
print("=== 3. pop / popitem ===")
d = {"a": 1, "b": 2, "c": 3}
val = d.pop("a")                          # 删除并返回值
print(f"pop('a') 返回 {val}, 字典: {d}")
val = d.pop("z", 0)                       # 不存在返回默认
print(f"pop('z', 0) 返回: {val}")
item = d.popitem()                        # 弹出最后一项
print(f"popitem() 返回: {item}, 字典: {d}")

# 4. update 合并
print()
print("=== 4. update 合并 ===")
d1 = {"a": 1, "b": 2}
d2 = {"b": 99, "c": 3}
d1.update(d2)                             # d2 覆盖 d1 的冲突键
print(f"d1.update(d2): {d1}")

# update 也接受键值对列表
d = {"x": 1}
d.update([("y", 2), ("z", 3)])
print(f"update 列表对: {d}")

# 5. fromkeys 批量创建
print()
print("=== 5. fromkeys ===")
keys = ["a", "b", "c"]
d = dict.fromkeys(keys, 0)                # 所有键值都是 0
print(f"fromkeys(默认0): {d}")

# 陷阱：可变默认值共享
print("陷阱：默认值是列表会共享")
d = dict.fromkeys(["a", "b"], [])
d["a"].append(1)
print(f"d['a'].append(1) 后: {d}")        # a 和 b 都有 1！
print("修复：用推导式各创建独立列表")
d = {k: [] for k in ["a", "b"]}
d["a"].append(1)
print(f"推导式版本: {d}")

# 6. 字典推导式
print()
print("=== 6. 字典推导式 ===")
squares = {x: x * x for x in range(5)}
print(f"平方: {squares}")
evens = {x: x*x for x in range(10) if x % 2 == 0}
print(f"偶数平方: {evens}")

# 推导式应用：统计字符频次
text = "hello world"
freq = {ch: text.count(ch) for ch in set(text) if ch != " "}
print(f"字符频率: {freq}")

# 7. in 判断键
print()
print("=== 7. in 判断键 ===")
d = {"name": "小明", "age": 18}
print(f"'name' in d: {'name' in d}")
print(f"'小明' in d (这是值，不是键): {'小明' in d}")
print(f"'小明' in d.values(): {'小明' in d.values()}")

# 8. 反转字典
print()
print("=== 8. 反转字典 ===")
d = {"apple": 5, "banana": 3, "cherry": 8}
print(f"原字典: {d}")
inv = {v: k for k, v in d.items()}
print(f"反转后: {inv}")                    # {5: 'apple', 3: 'banana', 8: 'cherry'}

# 9. 合并运算符 | （3.9+）
print()
print("=== 9. 合并运算符 | ===")
import sys
if sys.version_info >= (3, 9):
    d1 = {"a": 1, "b": 2}
    d2 = {"b": 99, "c": 3}
    merged = d1 | d2                        # 新字典，d2 覆盖 d1
    print(f"d1 | d2 = {merged}")
    d1 |= d2                                # 原地合并
    print(f"d1 |= d2 后 d1 = {d1}")
else:
    print("当前 Python < 3.9，用 update 模拟")
    d1 = {"a": 1, "b": 2}
    d2 = {"b": 99, "c": 3}
    merged = {**d1, **d2}
    print(f"合并结果: {merged}")

# 10. 综合应用：单词计数排序
print()
print("=== 10. 综合应用：词频排序 ===")
sentence = "the cat sat on the mat the cat"
word_count = {}
for word in sentence.split():
    word_count[word] = word_count.get(word, 0) + 1
print(f"词频统计: {word_count}")
# 按频率排序
sorted_words = sorted(word_count.items(), key=lambda x: -x[1])
print("按频率从高到低:")
for word, count in sorted_words:
    print(f"  {word}: {count}")`
  },
  {
    id: "py8-defaultdict",
    group: "数据结构",
    icon: "🗃️",
    title: "defaultdict 与 Counter 与 OrderedDict",
    content: `## collections 模块

Python 标准库 \`collections\` 提供了几个增强版字典，解决常见痛点：

| 类型 | 解决什么问题 |
|------|------------|
| \`defaultdict\` | 键不存在时自动创建默认值 |
| \`Counter\` | 计数统计 |
| \`OrderedDict\` | 有序字典（3.7 前用） |
| \`ChainMap\` | 合并多个字典查找 |
| \`deque\` | 双端队列 |

## defaultdict：自动默认值

普通字典访问不存在的键会 \`KeyError\`，\`defaultdict\` 通过**工厂函数**自动创建：

\`\`\`python
from collections import defaultdict

# 工厂函数：list / int / str / set / dict
d = defaultdict(list)        # 默认值是空列表
d["a"].append(1)             # 键不存在自动建空列表
d["a"].append(2)
# {"a": [1, 2]}

d = defaultdict(int)         # 默认值是 0
d["count"] += 1              # 不存在自动建 0 再加
\`\`\`

### 常见工厂函数

| 工厂 | 默认值 | 用途 |
|------|--------|------|
| \`list\` | \`[]\` | 分组 |
| \`int\` | \`0\` | 计数 |
| \`set\` | \`set()\` | 去重分组 |
| \`str\` | \`''\` | 拼接 |

### 经典应用：分组

\`\`\`python
students = [("一班", "小明"), ("二班", "小红"), ("一班", "小刚")]
groups = defaultdict(list)
for cls, name in students:
    groups[cls].append(name)
# {"一班": ["小明", "小刚"], "二班": ["小红"]}
\`\`\`

## Counter：计数器

专门用于统计元素出现次数：

\`\`\`python
from collections import Counter

c = Counter("abracadabra")     # 从可迭代对象统计
c["a"]                        # 5
c.most_common(2)               # [('a', 5), ('b', 2)]
\`\`\`

### Counter 常用方法

\`\`\`python
c.most_common(n)     # 频次最高的 n 个
c.most_common()      # 全部按频率排序
c.total()            # 总数（3.10+）
list(c.elements())   # 展开所有元素
c.update(...)        # 追加统计
c.subtract(...)      # 减去统计
\`\`\`

### Counter 算术

\`\`\`python
c1 = Counter(a=3, b=1)
c2 = Counter(a=1, b=2)
c1 + c2    # Counter({'a': 4, 'b': 3})  加
c1 - c2    # Counter({'a': 2})          减（结果只保留正数）
c1 & c2    # 交集（取最小）
c1 | c2    # 并集（取最大）
\`\`\`

## OrderedDict

Python 3.7+ 普通字典已保持插入顺序，\`OrderedDict\` 主要用于：

- 兼容 3.7 之前的老代码
- 需要 \`move_to_end\` / \`popitem(last=False)\` 等额外方法

\`\`\`python
from collections import OrderedDict
od = OrderedDict()
od["a"] = 1
od["b"] = 2
od.move_to_end("a")    # 把 a 移到末尾
\`\`\`

## ChainMap：链式查找

把多个字典"串"起来，查找时按顺序找：

\`\`\`python
from collections import ChainMap

defaults = {"theme": "light", "lang": "en"}
user = {"lang": "zh"}                    # 用户覆盖
config = ChainMap(user, defaults)
config["theme"]    # 'light'（user 没有则查 defaults）
config["lang"]     # 'zh'（user 优先）
\`\`\`

## deque 简介

\`deque\` 是双向队列，两端增删都是 O(1)，比列表头插快：

\`\`\`python
from collections import deque
dq = deque([1, 2, 3])
dq.appendleft(0)     # 左端追加
dq.append(4)         # 右端追加
dq.popleft()         # 左端弹出
\`\`\`

下面的 demo 完整演示这些工具。`,
    code: `# ==========================================
# defaultdict / Counter / OrderedDict / ChainMap 演示
# ==========================================
from collections import defaultdict, Counter, OrderedDict, ChainMap, deque

print("=" * 45)
print("   collections 增强字典工具演示")
print("=" * 45)

# 1. defaultdict 自动默认值
print()
print("=== 1. defaultdict ===")

# 用 list 作工厂：键不存在自动建空列表
groups = defaultdict(list)
students = [
    ("一班", "小明"), ("二班", "小红"),
    ("一班", "小刚"), ("二班", "小丽"),
    ("三班", "小强"),
]
for cls, name in students:
    groups[cls].append(name)             # 不存在自动建 []
print(f"按班级分组: {dict(groups)}")

# 用 int 作工厂：默认 0，常用于计数
word_count = defaultdict(int)
text = "the cat sat on the mat the cat"
for word in text.split():
    word_count[word] += 1                # 不存在自动建 0
print(f"词频统计: {dict(word_count)}")

# 用 set 作工厂：分组去重
d = defaultdict(set)
pairs = [("a", 1), ("a", 2), ("a", 1), ("b", 3)]
for k, v in pairs:
    d[k].add(v)                          # 自动去重
print(f"分组去重: {dict(d)}")

# 2. Counter 计数器
print()
print("=== 2. Counter ===")
c = Counter("abracadabra")
print(f"统计 'abracadabra': {dict(c)}")
print(f"c['a'] = {c['a']}")
print(f"c['z'] = {c['z']}")              # 不存在的键返回 0（不报错）

# most_common 取前 N
print()
print(f"most_common(2): {c.most_common(2)}")
print(f"most_common(): {c.most_common()}")

# elements 展开
print(f"list(elements()): {sorted(c.elements())}")

# Counter 算术
print()
c1 = Counter(a=3, b=1, c=4)
c2 = Counter(a=1, b=2, d=5)
print(f"c1 = {dict(c1)}")
print(f"c2 = {dict(c2)}")
print(f"c1 + c2: {dict(c1 + c2)}")       # 加
print(f"c1 - c2: {dict(c1 - c2)}")       # 减（只保留正数）
print(f"c1 & c2: {dict(c1 & c2)}")       # 交集：取最小
print(f"c1 | c2: {dict(c1 | c2)}")       # 并集：取最大

# 应用：统计单词
print()
article = "python is great python is fun python rocks"
counter = Counter(article.split())
print(f"文章词频: {counter.most_common()}")
print(f"出现最多的词: {counter.most_common(1)}")

# 3. OrderedDict
print()
print("=== 3. OrderedDict ===")
od = OrderedDict()
od["a"] = 1
od["b"] = 2
od["c"] = 3
print(f"原顺序: {list(od.keys())}")
od.move_to_end("a")                     # 把 a 移到末尾
print(f"move_to_end('a') 后: {list(od.keys())}")
od.move_to_end("c", last=False)          # 把 c 移到开头
print(f"move_to_end('c', last=False) 后: {list(od.keys())}")
print(f"弹出最后: {od.popitem()}")      # 默认弹最后一个

# 4. ChainMap 链式查找
print()
print("=== 4. ChainMap ===")
defaults = {"theme": "light", "lang": "en", "timeout": 30}
user_prefs = {"lang": "zh"}             # 用户配置
runtime = {"timeout": 60}              # 运行时配置

config = ChainMap(runtime, user_prefs, defaults)   # 查找顺序：runtime -> user -> defaults
print(f"config['theme']   = {config['theme']}")     # defaults 提供
print(f"config['lang']    = {config['lang']}")      # user_prefs 覆盖
print(f"config['timeout'] = {config['timeout']}")   # runtime 覆盖
print(f"所有键: {list(config.keys())}")

# 5. deque 简介
print()
print("=== 5. deque 简介 ===")
dq = deque([1, 2, 3])
dq.appendleft(0)                        # 左端追加
dq.append(4)                            # 右端追加
print(f"appendleft(0), append(4) 后: {list(dq)}")
left = dq.popleft()                    # 左端弹出
right = dq.pop()                        # 右端弹出
print(f"popleft()={left}, pop()={right} 后: {list(dq)}")

# rotate 旋转
dq = deque([1, 2, 3, 4, 5])
dq.rotate(2)                            # 右转 2 位
print(f"rotate(2): {list(dq)}")
dq.rotate(-1)                           # 左转 1 位
print(f"rotate(-1): {list(dq)}")

# 6. defaultdict vs 普通字典对比
print()
print("=== 6. defaultdict vs dict ===")
print("普通字典分组需要手动判断:")
words = ["apple", "ant", "banana", "bee"]
groups1 = {}
for w in words:
    key = w[0]
    if key not in groups1:              # 手动判断
        groups1[key] = []
    groups1[key].append(w)
print(f"  普通字典: {groups1}")

print("defaultdict 更简洁:")
groups2 = defaultdict(list)
for w in words:
    groups2[w[0]].append(w)            # 不用判断
print(f"  defaultdict: {dict(groups2)}")`
  },
  {
    id: "py8-set",
    group: "数据结构",
    icon: "🎲",
    title: "集合 set 与运算",
    content: `## 集合是什么

\`set\` 是**无序、不重复**的可变容器，用花括号 \`{1, 2, 3}\` 表示。最大特点：**自动去重** + **快速判断成员**。

\`\`\`python
s = {1, 2, 3, 2, 1}    # {1, 2, 3}，重复自动去
3 in s                  # True，O(1) 查找
\`\`\`

### 创建集合

\`\`\`python
# 1. 花括号
s1 = {1, 2, 3}

# 2. set() 函数（空集合只能用 set()，{} 是空字典）
s2 = set([1, 2, 2, 3])   # {1, 2, 3}
s3 = set("hello")         # {'h', 'e', 'l', 'o'}

# 3. 空集合
empty = set()             # 不能用 {}！
\`\`\`

⚠️ **\`{}\` 是空字典，不是空集合！** 空集合只能用 \`set()\`。

### 集合运算

集合论运算用运算符或方法：

| 运算 | 运算符 | 方法 | 含义 |
|------|--------|------|------|
| 交集 | \`&\` | \`intersection\` | 共有的 |
| 并集 | \`\\\|\` | \`union\` | 合并去重 |
| 差集 | \`-\` | \`difference\` | A 有 B 没有 |
| 对称差 | \`^\` | \`symmetric_difference\` | 不同时有的 |

\`\`\`python
a = {1, 2, 3}
b = {2, 3, 4}
a & b    # {2, 3}     交集
a | b    # {1, 2, 3, 4} 并集
a - b    # {1}        差集
a ^ b    # {1, 4}     对称差
\`\`\`

### 子集与超集

\`\`\`python
{1, 2} <= {1, 2, 3}     # True，子集
{1, 2} <  {1, 2, 3}     # True，真子集
{1, 2, 3} >= {1, 2}     # True，超集
{1, 2, 3} >  {1, 2}     # True，真超集
\`\`\`

| 关系 | 运算符 | 方法 |
|------|--------|------|
| 子集 | \`<=\` | \`issubset\` |
| 真子集 | \`<\` | - |
| 超集 | \`>=\` | \`issuperset\` |
| 真超集 | \`>\` | - |
| 无交集 | - | \`isdisjoint\` |

### 增删元素

\`\`\`python
s = {1, 2, 3}
s.add(4)            # 添加
s.remove(2)         # 删除，不存在报错
s.discard(99)       # 删除，不存在不报错
s.pop()             # 随机弹出一个
s.clear()           # 清空
\`\`\`

| 方法 | 不存在时 |
|------|----------|
| \`remove(x)\` | **报错 KeyError** |
| \`discard(x)\` | 不报错 |
| \`pop()\` | 随机弹 |

### frozenset：不可变集合

\`frozenset\` 是不可变的集合，可以作为字典的键：

\`\`\`python
fs = frozenset([1, 2, 3])
fs.add(4)           # 报错！不可变
d = {fs: "value"}   # 可以做字典键
\`\`\`

### 集合推导式

\`\`\`python
s = {x*x for x in range(5)}    # {0, 1, 4, 9, 16}
\`\`\`

### 应用场景

| 场景 | 示例 |
|------|------|
| 去重 | \`list(set(lst))\` |
| 判断成员 | \`x in big_set\` 比 \`x in big_list\` 快 |
| 集合运算 | 求两班共同学生 |
| 过滤 | 用差集去掉黑名单 |

下面的 demo 完整演示集合运算。`,
    code: `# ==========================================
# 集合 set 与运算完整演示
# ==========================================

print("=" * 45)
print("        集合 set 与运算演示")
print("=" * 45)

# 1. 创建集合
print()
print("=== 1. 创建集合 ===")
s1 = {1, 2, 3}
s2 = set([1, 2, 2, 3, 3])                # 自动去重
s3 = set("hello")                         # 字符去重
empty = set()                              # 空集合只能用 set()
print(f"花括号: {s1}")
print(f"set([1,2,2,3,3]): {s2}")
print(f"set('hello'): {s3}")
print(f"空集合: {empty}, 类型: {type(empty).__name__}")

# 陷阱：{} 是空字典不是空集合
wrong = {}
print(f"陷阱：{{}} 的类型是 {type(wrong).__name__}")

# 2. 去重应用
print()
print("=== 2. 去重应用 ===")
nums = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
unique = list(set(nums))                  # 去重
print(f"原列表: {nums}")
print(f"去重后: {unique}")
# 注意：集合无序，去重后顺序可能变。要保序用 dict：
preserve = list(dict.fromkeys(nums))
print(f"保序去重: {preserve}")

# 3. 集合运算
print()
print("=== 3. 集合运算 ===")
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
print(f"a = {a}")
print(f"b = {b}")
print(f"a & b  交集: {a & b}")            # {3, 4}
print(f"a | b  并集: {a | b}")            # {1,2,3,4,5,6}
print(f"a - b  差集: {a - b}")            # {1, 2}
print(f"a ^ b  对称差: {a ^ b}")           # {1, 2, 5, 6}

# 方法版本（结果相同）
print(f"intersection: {a.intersection(b)}")
print(f"union:        {a.union(b)}")
print(f"difference:   {a.difference(b)}")

# 4. 子集与超集
print()
print("=== 4. 子集与超集 ===")
big = {1, 2, 3, 4, 5}
small = {1, 2}
print(f"big = {big}")
print(f"small = {small}")
print(f"small <= big  子集: {small <= big}")           # True
print(f"small < big  真子集: {small < big}")            # True
print(f"big >= small 超集: {big >= small}")             # True
print(f"big > small 真超集: {big > small}")             # True
print(f"small.issubset(big): {small.issubset(big)}")
print(f"big.issuperset(small): {big.issuperset(small)}")
# isdisjoint：是否无交集
print(f"{1,2}.isdisjoint({3,4}): {small.isdisjoint({3, 4})}")    # True 无交集

# 5. 增删元素
print()
print("=== 5. 增删元素 ===")
s = {1, 2, 3}
s.add(4)                                  # 添加
print(f"add(4): {s}")
s.add(4)                                  # 重复添加无效
print(f"add(4) 再加: {s}")

# remove vs discard
try:
    s.remove(99)                          # 不存在会报错
except KeyError as e:
    print(f"remove(99) 报错: KeyError: {e}")
s.discard(99)                            # 不存在不报错
print(f"discard(99) 不报错: {s}")

popped = s.pop()                         # 随机弹一个
print(f"pop() 弹出 {popped}, 剩 {s}")

s.clear()
print(f"clear(): {s}")

# 6. frozenset 不可变集合
print()
print("=== 6. frozenset ===")
fs = frozenset([1, 2, 3])
print(f"frozenset: {fs}")
try:
    fs.add(4)                            # 不可变
except AttributeError as e:
    print(f"fs.add(4) 报错: {e}")
# 可以做字典的键
d = {fs: "value"}
print(f"作字典键: {d}")

# 7. 集合推导式
print()
print("=== 7. 集合推导式 ===")
squares = {x * x for x in range(5)}
print(f"平方集合: {squares}")
evens = {x for x in range(20) if x % 2 == 0}
print(f"偶数集合: {evens}")

# 8. 应用场景
print()
print("=== 8. 应用场景 ===")
# 场景1: 求两班共同学生
class_a = {"小明", "小红", "小刚"}
class_b = {"小红", "小刚", "小丽"}
common = class_a & class_b
print(f"两班共同学生: {common}")
only_a = class_a - class_b
print(f"只在 A 班: {only_a}")
all_students = class_a | class_b
print(f"所有学生: {all_students}")

# 场景2: 黑名单过滤
all_words = {"good", "bad", "ok", "evil"}
blacklist = {"bad", "evil"}
allowed = all_words - blacklist
print(f"过滤黑名单后: {allowed}")

# 场景3: 快速成员判断（大集合时优势明显）
import time
big_list = list(range(100000))
big_set = set(big_list)

start = time.time()
for _ in range(100):
    _ = 99999 in big_list
t_list = time.time() - start

start = time.time()
for _ in range(100):
    _ = 99999 in big_set
t_set = time.time() - start

print(f"100 次查找：列表 {t_list*1000:.2f}ms，集合 {t_set*1000:.3f}ms")
print("集合 O(1) 远快于列表 O(n)")`
  },
  {
    id: "py8-copy",
    group: "数据结构",
    icon: "♻️",
    title: "深浅拷贝 copy",
    content: `## 三种"复制"方式

Python 复制对象有三种层次，理解它们能避开 90% 的可变对象陷阱。

### 1. 赋值 \`=\`：共享引用

\`\`\`python
a = [1, 2, 3]
b = a            # b 和 a 指向同一个对象
b.append(4)
print(a)         # [1, 2, 3, 4]  a 也变了！
\`\`\`

\`b = a\` 没有创建新对象，只是给同一个对象贴了第二个标签。

### 2. 浅拷贝 \`copy.copy\`

复制外层容器，但**内部元素仍是共享引用**：

\`\`\`python
import copy
a = [[1, 2], [3, 4]]
b = copy.copy(a)        # 外层新列表
b[0][0] = 99
print(a)                 # [[99, 2], [3, 4]]  内层共享！
\`\`\`

浅拷贝的几种方式：

\`\`\`python
# 列表
new = lst.copy()
new = lst[:]
new = list(lst)
new = copy.copy(lst)

# 字典
new = d.copy()
new = dict(d)
\`\`\`

### 3. 深拷贝 \`copy.deepcopy\`

递归复制所有层级，完全独立：

\`\`\`python
import copy
a = [[1, 2], [3, 4]]
b = copy.deepcopy(a)
b[0][0] = 99
print(a)    # [[1, 2], [3, 4]]  完全不受影响
\`\`\`

### 三者对比

| 方式 | 外层 | 内层 | 修改内层互影响吗 |
|------|------|------|------------------|
| \`=\` 赋值 | 共享 | 共享 | **会** |
| \`copy\` 浅拷贝 | 独立 | 共享 | **会** |
| \`deepcopy\` 深拷贝 | 独立 | 独立 | **不会** |

### 用 id() 验证

\`\`\`python
a = [1, 2]
b = a
print(id(a) == id(b))    # True，同一对象

b = a.copy()
print(id(a) == id(b))    # False，外层独立
print(id(a[0]) == id(b[0]))   # True，内层共享
\`\`\`

### 何时需要深拷贝

- **嵌套的可变结构**（二维列表、字典套字典）修改要隔离 → 深拷贝
- **一维简单结构** → 浅拷贝就够
- **不可变对象**（数字、字符串、元组）→ 赋值即可，反正改不了

### 自定义 __copy__

让自定义类支持拷贝：

\`\`\`python
class MyClass:
    def __init__(self, data):
        self.data = data

    def __copy__(self):
        # 浅拷贝：新对象，但 data 共享
        new = MyClass(self.data)
        return new

    def __deepcopy__(self, memo):
        # 深拷贝：连 data 也复制
        import copy
        new = MyClass(copy.deepcopy(self.data, memo))
        return new
\`\`\`

### 常见陷阱

1. **函数默认参数是可变对象**：所有调用共享
2. **嵌套列表用 \`*\` 创建**：\`[[0]*3]*3\` 三行同一对象
3. **浅拷贝以为独立了**：嵌套结构改一处影响另一处

下面的 demo 用 \`id()\` 把三种拷贝可视化。`,
    code: `# ==========================================
# 深浅拷贝 copy 完整演示
# ==========================================
import copy

print("=" * 45)
print("       深浅拷贝 copy 演示")
print("=" * 45)

# 1. 赋值 = 共享引用
print()
print("=== 1. 赋值 = 共享引用 ===")
a = [1, 2, 3]
b = a                                    # 只是贴新标签，不创建对象
b.append(4)
print(f"a = {a}")
print(f"b = {b}")
print(f"id(a) == id(b): {id(a) == id(b)}")   # True，同一对象
print("b 改了，a 也跟着变！因为是同一个列表")

# 2. 浅拷贝 copy
print()
print("=== 2. 浅拷贝 copy ===")
a = [1, 2, 3]
b = a.copy()                             # 外层新列表
b.append(4)
print(f"a = {a}")                        # 不受影响
print(f"b = {b}")
print(f"id(a) == id(b): {id(a) == id(b)}")   # False 外层独立

# 三种浅拷贝方式
c1 = a.copy()
c2 = a[:]
c3 = list(a)
c4 = copy.copy(a)
print(f"四种浅拷贝都独立: {all(id(x) != id(a) for x in [c1, c2, c3, c4])}")

# 3. 浅拷贝的陷阱：嵌套结构内层共享
print()
print("=== 3. 浅拷贝的陷阱 ===")
a = [[1, 2], [3, 4]]
b = a.copy()                             # 浅拷贝
print(f"原 a = {a}")
b[0][0] = 99                             # 改内层元素
print(f"改 b[0][0]=99 后:")
print(f"  a = {a}")                      # a 也被改了！
print(f"  b = {b}")
print(f"外层独立? {id(a) != id(b)}")
print(f"内层共享? {id(a[0]) == id(b[0])}")   # True 内层共享

# 4. 深拷贝 deepcopy
print()
print("=== 4. 深拷贝 deepcopy ===")
a = [[1, 2], [3, 4]]
b = copy.deepcopy(a)                     # 递归复制所有层
print(f"原 a = {a}")
b[0][0] = 99
print(f"改 b[0][0]=99 后:")
print(f"  a = {a}")                      # 完全不变
print(f"  b = {b}")
print(f"外层独立? {id(a) != id(b)}")
print(f"内层独立? {id(a[0]) != id(b[0])}")   # True 内层也独立

# 5. 字典的深浅拷贝
print()
print("=== 5. 字典深浅拷贝 ===")
d1 = {"list": [1, 2, 3], "info": {"name": "小明"}}
d2 = d1.copy()                           # 浅拷贝
d3 = copy.deepcopy(d1)                   # 深拷贝

d2["list"].append(99)
print(f"浅拷贝改 d2['list'].append(99):")
print(f"  d1['list'] = {d1['list']}")    # 被影响

d1 = {"list": [1, 2, 3], "info": {"name": "小明"}}
d3 = copy.deepcopy(d1)
d3["list"].append(99)
print(f"深拷贝改 d3['list'].append(99):")
print(f"  d1['list'] = {d1['list']}")    # 不受影响

# 6. id 验证三种拷贝
print()
print("=== 6. id 验证三种拷贝 ===")
original = [[1], [2], [3]]

ref = original                           # 赋值
shallow = original.copy()                # 浅拷贝
deep = copy.deepcopy(original)           # 深拷贝

print(f"赋值：    外层同 id? {id(ref) == id(original)}, 内层同 id? {id(ref[0]) == id(original[0])}")
print(f"浅拷贝：  外层同 id? {id(shallow) == id(original)}, 内层同 id? {id(shallow[0]) == id(original[0])}")
print(f"深拷贝：  外层同 id? {id(deep) == id(original)}, 内层同 id? {id(deep[0]) == id(original[0])}")

# 7. 不可变对象：拷贝无意义
print()
print("=== 7. 不可变对象 ===")
s = "hello"
s2 = s.copy() if hasattr(s, "copy") else s   # 字符串没有 copy 方法
print(f"字符串 s = {s}, s2 = {s2}, 同 id? {id(s) == id(s2)}")
print("不可变对象反正改不了，赋值即够用")

# 元组：浅拷贝返回自己（因为不可变）
t = (1, 2, 3)
t_shallow = copy.copy(t)
print(f"元组浅拷贝同 id? {id(t) == id(t_shallow)}")   # True，因为不可变

# 8. 陷阱1: [[0]*3]*3 共享行
print()
print("=== 8. 陷阱：[[0]*3]*3 ===")
bad = [[0] * 3] * 3                      # 三行同一对象
bad[0][0] = 9
print(f"bad[0][0]=9 后: {bad}")          # 三行都被改
print("修复：用推导式每行独立")
good = [[0] * 3 for _ in range(3)]
good[0][0] = 9
print(f"good[0][0]=9 后: {good}")        # 只改一行

# 9. 自定义类的 __copy__ 与 __deepcopy__
print()
print("=== 9. 自定义类拷贝 ===")
class Box:
    def __init__(self, items):
        self.items = items

    def __copy__(self):
        # 浅拷贝：新对象，items 共享
        new = Box(self.items)
        return new

    def __deepcopy__(self, memo):
        # 深拷贝：连 items 也复制
        new = Box(copy.deepcopy(self.items, memo))
        return new

    def __repr__(self):
        return f"Box({self.items})"

box1 = Box([1, 2, 3])
box2 = copy.copy(box1)                  # 浅拷贝
box3 = copy.deepcopy(box1)             # 深拷贝

box2.items.append(99)
print(f"浅拷贝改 box2.items.append(99):")
print(f"  box1 = {box1}")              # 被影响

box1 = Box([1, 2, 3])
box3 = copy.deepcopy(box1)
box3.items.append(99)
print(f"深拷贝改 box3.items.append(99):")
print(f"  box1 = {box1}")              # 不受影响

# 10. 总结
print()
print("=== 10. 三种拷贝总结 ===")
print("= 赋值     : 完全共享，改一处影响另一处")
print("copy 浅拷贝: 外层独立，内层共享")
print("deepcopy  : 完全独立，最安全但最慢")
print("选择原则：嵌套可变结构用 deepcopy，一维用 copy")`
  },
  {
    id: "py8-deque-counter",
    group: "数据结构",
    icon: "📬",
    title: "deque 与 Counter 实战",
    content: `## deque 双向队列

\`collections.deque\` 是**双向队列**，两端增删都是 O(1)。列表在头部插入是 O(n)，所以频繁头插时用 \`deque\`。

\`\`\`python
from collections import deque
dq = deque([1, 2, 3])
dq.appendleft(0)      # 左端追加
dq.append(4)          # 右端追加
dq.popleft()          # 左端弹出
dq.pop()              # 右端弹出
\`\`\`

### deque vs list 性能

| 操作 | list | deque |
|------|------|-------|
| 末尾追加 \`append\` | O(1) | O(1) |
| 头部插入 \`insert(0,x)\` | **O(n)** | O(1) \`appendleft\` |
| 末尾弹出 \`pop\` | O(1) | O(1) |
| 头部弹出 \`pop(0)\` | **O(n)** | O(1) \`popleft\` |
| 随机索引 \`lst[i]\` | O(1) | O(n) |

结论：**需要频繁头插/头弹时用 deque，需要随机访问用 list**。

### 常用方法

\`\`\`python
dq.append(x)          # 右端追加
dq.appendleft(x)      # 左端追加
dq.pop()              # 右端弹出
dq.popleft()          # 左端弹出
dq.extend(it)         # 右端批量追加
dq.extendleft(it)     # 左端批量追加（注意顺序倒过来）
dq.rotate(n)          # 旋转：正数右转，负数左转
dq.reverse()          # 反转
dq.clear()            # 清空
\`\`\`

### maxlen 固定长度

设置 \`maxlen\` 后，超长会自动丢弃另一端：

\`\`\`python
dq = deque(maxlen=3)
dq.append(1); dq.append(2); dq.append(3)
dq.append(4)          # 自动丢弃 1，变成 [2, 3, 4]
\`\`\`

非常适合做**滑动窗口**、**最近 N 条记录**。

### rotate 旋转

\`\`\`python
dq = deque([1, 2, 3, 4, 5])
dq.rotate(2)          # 右转 2 位：[4, 5, 1, 2, 3]
dq.rotate(-1)         # 左转 1 位
\`\`\`

## Counter 实战

\`Counter\` 是计数器，专门统计元素频次。

\`\`\`python
from collections import Counter
c = Counter("abracadabra")
c.most_common(2)      # [('a', 5), ('b', 2)]
\`\`\`

### 实战应用

1. **词频统计**：分析文章高频词
2. **投票统计**：数选票
3. **库存计数**：商品数量管理
4. **找众数**：\`c.most_common(1)\`

### 算术运算

\`\`\`python
c1 + c2    # 相加
c1 - c2    # 相减（结果只保留正数）
c1 & c2    # 交集（取最小）
c1 | c2    # 并集（取最大）
\`\`\`

下面的 demo 用 deque 和 Counter 解决实际问题。`,
    code: `# ==========================================
# deque 与 Counter 实战演示
# ==========================================
from collections import deque, Counter
import time

print("=" * 45)
print("       deque 与 Counter 实战演示")
print("=" * 45)

# 1. deque 基本操作
print()
print("=== 1. deque 基本操作 ===")
dq = deque([1, 2, 3])
print(f"初始: {list(dq)}")
dq.append(4)                            # 右端追加
print(f"append(4): {list(dq)}")
dq.appendleft(0)                        # 左端追加
print(f"appendleft(0): {list(dq)}")
right = dq.pop()                        # 右端弹出
print(f"pop() 弹出 {right}: {list(dq)}")
left = dq.popleft()                     # 左端弹出
print(f"popleft() 弹出 {left}: {list(dq)}")

# 2. extend 与 extendleft
print()
print("=== 2. extend 与 extendleft ===")
dq = deque([1, 2, 3])
dq.extend([4, 5])                       # 右端批量
print(f"extend([4,5]): {list(dq)}")
dq.extendleft([0, -1])                  # 左端批量，注意顺序
print(f"extendleft([0,-1]): {list(dq)}")
print("注意：extendleft 是逐个从左端加，所以顺序倒过来")

# 3. rotate 旋转
print()
print("=== 3. rotate 旋转 ===")
dq = deque([1, 2, 3, 4, 5])
print(f"初始: {list(dq)}")
dq.rotate(2)                            # 右转 2 位
print(f"rotate(2) 右转: {list(dq)}")
dq = deque([1, 2, 3, 4, 5])
dq.rotate(-2)                           # 左转 2 位
print(f"rotate(-2) 左转: {list(dq)}")

# 4. maxlen 固定长度（滑动窗口）
print()
print("=== 4. maxlen 固定长度 ===")
dq = deque(maxlen=3)
for i in range(1, 6):
    dq.append(i)
    print(f"  append({i}) -> {list(dq)}")
print("超过 maxlen 自动丢弃最老的元素")

# 5. deque vs list 性能对比
print()
print("=== 5. deque vs list 性能 ===")
N = 100000

# 头插性能
lst = []
start = time.time()
for i in range(N):
    lst.insert(0, i)                    # list 头插 O(n)
t_list = time.time() - start

dq = deque()
start = time.time()
for i in range(N):
    dq.appendleft(i)                   # deque 头插 O(1)
t_deque = time.time() - start

print(f"头插 {N} 次：list {t_list*1000:.1f}ms，deque {t_deque*1000:.1f}ms")
print(f"deque 比 list 快 {t_list/max(t_deque, 1e-6):.1f} 倍")

# 6. 应用：固定长度日志
print()
print("=== 6. 应用：最近 N 条日志 ===")
class RecentLog:
    def __init__(self, n):
        self.logs = deque(maxlen=n)

    def add(self, msg):
        self.logs.append(msg)

    def show(self):
        return list(self.logs)

log = RecentLog(3)
log.add("启动")
log.add("加载配置")
log.add("连接数据库")
log.add("查询数据")
log.add("关闭")
print(f"最近 3 条日志: {log.show()}")
print("超过 3 条自动丢弃最老的")

# 7. 应用：队列 BFS 广度优先搜索
print()
print("=== 7. 应用：BFS 广搜 ===")
graph = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": ["D", "E"],
    "D": ["F"],
    "E": ["F"],
    "F": [],
}
def bfs(start):
    visited = set()
    queue = deque([start])
    order = []
    while queue:
        node = queue.popleft()         # 从左端取
        if node in visited:
            continue
        visited.add(node)
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                queue.append(neighbor)  # 从右端加
    return order

print(f"从 A 开始 BFS: {bfs('A')}")

# 8. Counter 词频统计
print()
print("=== 8. Counter 词频统计 ===")
article = """
python is great python is fun
python rocks python is awesome
I love python python python
""".split()
counter = Counter(article)
print(f"词频: {dict(counter)}")
print(f"出现最多的 3 个词: {counter.most_common(3)}")
print(f"'python' 出现次数: {counter['python']}")
print(f"总词数: {sum(counter.values())}")

# 9. Counter 算术
print()
print("=== 9. Counter 算术 ===")
shop_a = Counter(apple=5, banana=3, cherry=8)
shop_b = Counter(apple=2, banana=7, date=4)
print(f"店 A: {dict(shop_a)}")
print(f"店 B: {dict(shop_b)}")
total = shop_a + shop_b                  # 合并库存
print(f"合并库存 A+B: {dict(total)}")
diff = shop_a - shop_b                   # A 比 B 多的
print(f"A 多于 B: {dict(diff)}")
common = shop_a & shop_b                 # 都有的（取小）
print(f"都有(取小): {dict(common)}")
union = shop_a | shop_b                  # 合并取大
print(f"并集(取大): {dict(union)}")

# 10. 应用：投票统计
print()
print("=== 10. 应用：投票统计 ===")
votes = ["小明", "小红", "小明", "小刚", "小红", "小明", "小红", "小红"]
result = Counter(votes)
print(f"投票记录: {votes}")
print(f"得票统计: {dict(result)}")
print("排名:")
for name, count in result.most_common():
    print(f"  {name}: {count} 票")
winner = result.most_common(1)[0]
print(f"当选者: {winner[0]}（{winner[1]} 票）")

# 找众数
data = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
mode = Counter(data).most_common(1)[0]
print(f"数据 {data} 的众数: {mode[0]}（出现 {mode[1]} 次）")`
  },
  {
    id: "py8-heapq-bisect",
    group: "数据结构",
    icon: "⛰️",
    title: "heapq 堆与 bisect 二分",
    content: `## heapq 堆

\`heapq\` 是 Python 标准库的**最小堆**模块。堆是一种特殊的二叉树，**堆顶永远是最小值**。

\`\`\`python
import heapq
nums = [3, 1, 4, 1, 5, 9, 2, 6]
heapq.heapify(nums)    # 原地把列表变堆
heapq.heappop(nums)    # 弹出最小值 1
heapq.heappush(nums, 0)  # 插入新元素
\`\`\`

### 常用函数

| 函数 | 作用 | 复杂度 |
|------|------|--------|
| \`heapify(lst)\` | 列表原地变堆 | O(n) |
| \`heappush(lst, x)\` | 加入元素 | O(log n) |
| \`heappop(lst)\` | 弹出最小值 | O(log n) |
| \`heappushpop(lst, x)\` | 先推后弹 | O(log n) |
| \`heapreplace(lst, x)\` | 先弹后推 | O(log n) |
| \`nlargest(n, it)\` | 取最大的 n 个 | - |
| \`nsmallest(n, it)\` | 取最小的 n 个 | - |

### 最小堆特性

\`\`\`python
import heapq
h = []
heapq.heappush(h, 3)
heapq.heappush(h, 1)
heapq.heappush(h, 4)
heapq.heappop(h)    # 1（永远弹最小）
\`\`\`

### 最大堆技巧：取负

Python 的堆是最小堆，要做最大堆就把元素**取负**：

\`\`\`python
h = []
for x in [3, 1, 4, 1, 5]:
    heapq.heappush(h, -x)
max_val = -heapq.heappop(h)    # 5（最大值）
\`\`\`

或者用元组 \`(-priority, item)\` 做优先队列。

### 优先队列应用

\`\`\`python
import heapq
pq = []
heapq.heappush(pq, (2, "低优先级"))
heapq.heappush(pq, (1, "高优先级"))
heapq.heappop(pq)    # (1, "高优先级")，优先级数字小的先出
\`\`\`

## bisect 二分查找

\`bisect\` 模块在**有序列表**上做二分查找，复杂度 O(log n)。

\`\`\`python
import bisect
lst = [1, 3, 3, 5, 7, 9]
bisect.bisect_left(lst, 3)    # 1，左侧插入位置
bisect.bisect_right(lst, 3)   # 3，右侧插入位置
bisect.insort(lst, 4)         # 插入 4 保持有序
\`\`\`

### bisect_left vs bisect_right

对有重复元素的列表：

\`\`\`python
lst = [1, 3, 3, 3, 5]
bisect.bisect_left(lst, 3)    # 1，第一个 3 的位置
bisect.bisect_right(lst, 3)   # 4，最后一个 3 之后
\`\`\`

| 函数 | 返回 | 含义 |
|------|------|------|
| \`bisect_left\` | 最左插入点 | 相等元素左侧插 |
| \`bisect_right\` | 最右插入点 | 相等元素右侧插 |
| \`insort_left\` | 插入并保持有序 | 左侧插 |
| \`insort_right\` | 插入并保持有序 | 右侧插 |

### 有序列表维护

\`\`\`python
import bisect
scores = []
for s in [85, 92, 78, 90, 88]:
    bisect.insort(scores, s)    # 每次插入都保持有序
# [78, 85, 88, 90, 92]
\`\`\`

比每次 \`append\` + \`sort\` 高效。

### 应用：成绩分级

\`\`\`python
breakpoints = [60, 80, 90]
grades = "FDCBA"
score = 85
i = bisect.bisect(breakpoints, score)
grade = grades[i]    # 'B'
\`\`\`

下面的 demo 完整演示堆和二分查找。`,
    code: `# ==========================================
# heapq 堆与 bisect 二分查找演示
# ==========================================
import heapq
import bisect

print("=" * 45)
print("     heapq 堆与 bisect 二分查找演示")
print("=" * 45)

# 1. heapify 把列表变堆
print()
print("=== 1. heapify ===")
nums = [3, 1, 4, 1, 5, 9, 2, 6]
print(f"原列表: {nums}")
heapq.heapify(nums)                      # 原地变堆
print(f"heapify 后: {nums}")
print("注意：堆不是完全排序，只是保证堆顶是最小值")

# 2. heappush 与 heappop
print()
print("=== 2. heappush / heappop ===")
h = []
heapq.heappush(h, 3)
heapq.heappush(h, 1)
heapq.heappush(h, 4)
heapq.heappush(h, 1)
heapq.heappush(h, 5)
print(f"依次 push 3,1,4,1,5: {h}")
print(f"堆顶（最小）: {h[0]}")            # 不弹，只看
popped = heapq.heappop(h)                # 弹出最小
print(f"heappop 弹出: {popped}, 剩: {h}")
popped = heapq.heappop(h)
print(f"再弹: {popped}, 剩: {h}")

# 3. heappushpop 与 heapreplace
print()
print("=== 3. heappushpop / heapreplace ===")
h = [1, 3, 5]
heapq.heapify(h)
# heappushpop：先 push 再 pop（弹最小）
ret = heapq.heappushpop(h, 0)            # push 0 再 pop，弹 0
print(f"heappushpop(0) 弹 {ret}: {h}")
# heapreplace：先 pop 再 push
h = [1, 3, 5]
heapq.heapify(h)
ret = heapq.heapreplace(h, 2)           # 先弹 1 再 push 2
print(f"heapreplace(2) 弹 {ret}: {h}")

# 4. nlargest / nsmallest
print()
print("=== 4. nlargest / nsmallest ===")
nums = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
print(f"列表: {nums}")
print(f"最大的 3 个: {heapq.nlargest(3, nums)}")
print(f"最小的 3 个: {heapq.nsmallest(3, nums)}")
# 带键函数
students = [("小明", 85), ("小红", 92), ("小刚", 78), ("小丽", 90)]
top = heapq.nlargest(2, students, key=lambda x: x[1])
print(f"成绩最高的 2 个: {top}")

# 5. 最大堆技巧：取负
print()
print("=== 5. 最大堆技巧 ===")
h = []
for x in [3, 1, 4, 1, 5, 9, 2, 6]:
    heapq.heappush(h, -x)                # 取负存
print(f"存负数堆: {h}")
max_val = -heapq.heappop(h)              # 取负还原
print(f"弹出最大值: {max_val}")
max_val = -heapq.heappop(h)
print(f"再弹最大值: {max_val}")

# 6. 优先队列应用
print()
print("=== 6. 优先队列应用 ===")
tasks = [
    (3, "写邮件"),
    (1, "紧急修复 bug"),
    (2, "开会"),
    (1, "处理报警"),
    (3, "整理文档"),
]
pq = []
for priority, task in tasks:
    heapq.heappush(pq, (priority, task))  # 元组按第一元素比较

print("按优先级处理（数字小先处理）:")
while pq:
    priority, task = heapq.heappop(pq)
    print(f"  优先级 {priority}: {task}")

# 7. 堆排序
print()
print("=== 7. 堆排序 ===")
def heap_sort(arr):
    """用堆实现排序"""
    h = []
    for x in arr:
        heapq.heappush(h, x)
    result = []
    while h:
        result.append(heapq.heappop(h))  # 每次弹最小
    return result

nums = [5, 2, 8, 1, 9, 3, 7, 4, 6]
print(f"原列表: {nums}")
print(f"堆排序: {heap_sort(nums)}")

# 8. bisect 二分查找
print()
print("=== 8. bisect 二分查找 ===")
lst = [1, 3, 3, 3, 5, 7, 9]
print(f"有序列表: {lst}")
print(f"bisect_left(lst, 3)  = {bisect.bisect_left(lst, 3)}")   # 1
print(f"bisect_right(lst, 3) = {bisect.bisect_right(lst, 3)}")  # 4
print(f"bisect_left(lst, 4)  = {bisect.bisect_left(lst, 4)}")   # 4 (不存在)
print(f"bisect_left(lst, 0)  = {bisect.bisect_left(lst, 0)}")   # 0 (开头)
print(f"bisect_left(lst, 10) = {bisect.bisect_left(lst, 10)}")  # 7 (末尾)

# 9. insort 插入保持有序
print()
print("=== 9. insort 插入保持有序 ===")
scores = []
for s in [85, 92, 78, 90, 88, 95, 70]:
    bisect.insort(scores, s)             # 每次插入保持有序
    print(f"  插入 {s}: {scores}")
print(f"最终有序列表: {scores}")

# 10. 应用：成绩分级
print()
print("=== 10. 应用：成绩分级 ===")
def grade(score):
    breakpoints = [60, 80, 90]           # 分界线
    grades = "FDCBA"                     # 对应等级
    i = bisect.bisect(breakpoints, score)
    return grades[i]

test_scores = [55, 65, 75, 85, 95]
for s in test_scores:
    print(f"  {s} 分 -> {grade(s)} 等")

# 11. 应用：维护 top K
print()
print("=== 11. 应用：维护 Top K ===")
def top_k(stream, k):
    """用大小为 k 的堆维护前 K 大"""
    h = []
    for x in stream:
        if len(h) < k:
            heapq.heappush(h, x)         # 没满直接加
        elif x > h[0]:
            heapq.heapreplace(h, x)      # 比最小的大，替换
    return sorted(h, reverse=True)       # 返回降序

data = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
print(f"数据: {data}")
print(f"Top 3: {top_k(data, 3)}")
print(f"Top 5: {top_k(data, 5)}")`
  }
];
