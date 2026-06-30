// =============================================================
// Batch 4：数据结构（4 章）
// 13. py4-list         list 增删改查、切片、排序、复制
// 14. py4-tuple        tuple 不可变、解包、NamedTuple
// 15. py4-dict         dict 操作、合并、get、setdefault
// 16. py4-set          set 去重、集合运算、frozenset
// =============================================================

export const chapters = [
  {
    id: "py4-list",
    group: "数据结构",
    icon: "📋",
    title: "list：增删改查、切片、排序",
    content: `
## 一、概念解释：list 是什么

list（列表）是 Python 中最常用的**动态数组**，本质特征：

- **可变（mutable）**：创建后可增、删、改元素
- **有序（ordered）**：元素按插入顺序排列，可通过索引访问
- **存对象引用**：list 内部存的是对象的指针（引用），不是对象本身
- **动态扩容**：类似 C++ vector / Java ArrayList，预分配空间，超限自动扩容

\`\`\`python
lst = [1, 2, 3]      # 字面量创建
lst[0] = 99          # 可变：原地把第一个元素改为 99
lst.append(4)        # 动态扩容：末尾追加
\`\`\`

list 解决的问题：**需要一个能动态增删、按下标随机访问的有序容器**。

## 二、设计原理：为什么这样设计

### 1. 动态数组 vs C 的静态数组

| 特性 | C 数组 | Python list |
| --- | --- | --- |
| 大小 | 固定 | 动态 |
| 元素类型 | 同质 | 异质（任意对象） |
| 内存 | 连续存值 | 连续存指针 |
| 越界访问 | 未定义行为 | 抛 IndexError |

C 数组直接存值（如 \`int arr[10]\` 连续存 10 个 int），所以大小固定、类型统一。Python list 存的是 \`PyObject*\` 指针，每个槽位 8 字节（64 位机），所以可放任意类型对象，代价是间接寻址。

### 2. 为什么默认可变

Python 设计哲学：常用容器优先选可变（list/dict/set），不可变（tuple/frozenset）作为补充。这样大多数场景下"想改就改"，简洁高效。

## 三、使用场景

✅ 适合用 list：
- 顺序存储、按下标访问（待办事项、排行榜）
- 频繁**尾部**增删（append/pop 都是 O(1)）
- 元素可重复、可变

❌ 不适合用 list：
- 频繁**头部**增删（insert(0, x) / pop(0) 是 O(n)）→ 用 \`collections.deque\`
- 需要去重 → 用 set
- 需要 key→value 映射 → 用 dict
- 数据不可变、要做 dict key → 用 tuple
- 大量数值计算 → 用 \`numpy.ndarray\`

## 四、代码逐行讲解：增删改查

### 1. 增：append / insert / extend

\`\`\`python
lst = [3, 1, 4, 1, 5]
lst.append(9)          # 末尾追加 9，O(1) 均摊，lst 变成 [3,1,4,1,5,9]
lst.extend([2, 6])     # 把可迭代对象逐个追加，O(k)；等价于 lst += [2,6]
lst.insert(0, 0)       # 在索引 0 处插入 0，O(n)（后面元素全部后移）
\`\`\`

| 方法 | 时间复杂度 | 说明 |
| --- | --- | --- |
| append(x) | O(1) 均摊 | 末尾加一个 |
| insert(i, x) | O(n) | 任意位置插，越靠前越慢 |
| extend(iter) | O(k) | 批量加，比循环 append 快 |
| lst += other | O(k) | 等价 extend，原地修改 |
| lst = lst + other | O(n+k) | 创建新 list，慢 |

⚠️ 关键区别：\`append([2,6])\` 会把整个列表作为**一个元素**塞进去变成 \`[...,[2,6]]\`；\`extend([2,6])\` 才是把 2、6 分别加进去。

### 2. 删：pop / remove / del / clear

\`\`\`python
lst.pop()         # 弹出末尾元素并返回，O(1)
lst.pop(0)        # 弹出索引 0 的元素，O(n)（后面全前移）
lst.remove(1)     # 删除第一个值为 1 的元素，O(n)（要先查找）
del lst[i]        # 删除索引 i 的元素，等价 pop(i) 但不返回值
lst.clear()       # 清空，O(n)（要 decref 所有元素）
\`\`\`

| 方法 | 行为 | 不存在时 |
| --- | --- | --- |
| pop() | 弹末尾并返回 | 空 list 抛 IndexError |
| pop(i) | 弹索引 i 并返回 | 越界抛 IndexError |
| remove(x) | 删第一个等于 x 的 | 抛 ValueError |
| del lst[i] | 删索引 i | 越界抛 IndexError |
| del lst[a:b] | 删切片 | — |
| clear() | 清空 | — |

### 3. 查：索引 / count / index

\`\`\`python
lst[0]            # 取第一个，O(1)
lst[-1]           # 取最后一个，O(1)
lst.index(x)      # 返回第一个等于 x 的索引，找不到抛 ValueError，O(n)
lst.count(x)      # 统计 x 出现次数，O(n)
len(lst)          # 长度，O(1)（内部维护了长度字段）
x in lst          # 成员判断，O(n)（线性扫描）
\`\`\`

## 五、切片：规则、赋值、不会越界

### 1. 切片语法

\`\`\`python
lst[start:stop:step]   # 左闭右开 [start, stop)，step 可为负
\`\`\`

- 省略 start：默认 0
- 省略 stop：默认到末尾
- 省略 step：默认 1

### 2. 切片关键特性

- **左闭右开**：包含 start，不包含 stop
- **不会越界报错**：\`lst[2:100]\` 不会报错，自动截到末尾
- **负索引**：\`lst[-1]\` 是最后一个，\`lst[-2:]\` 是最后两个
- **切片产生新 list**：原 list 不变（浅拷贝）

\`\`\`python
lst = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
lst[2:5]      # [2, 3, 4]   索引 2、3、4
lst[:3]       # [0, 1, 2]   从开头到索引 2
lst[7:]       # [7, 8, 9]   从索引 7 到末尾
lst[::-1]     # [9, 8, ..., 0]  step=-1 反转
lst[::2]      # [0, 2, 4, 6, 8] 隔一个取一个
\`\`\`

### 3. 切片赋值：批量替换

\`\`\`python
lst[2:5] = [20, 30]    # 把索引 2、3、4 替换为 20、30
\`\`\`

切片赋值的强大之处：**长度可以不一致**！\`lst[2:5]\`（3 个位置）替换成 \`[20, 30]\`（2 个元素），list 长度会变短。

\`\`\`python
lst[2:2] = [99, 99]    # 在索引 2 处插入（替换 0 个，插入 2 个）
lst[2:4] = []          # 删除索引 2、3（替换为空）
\`\`\`

## 六、排序：sort vs sorted

\`\`\`python
nums = [3, 1, 4, 1, 5, 9, 2, 6]
nums.sort()                  # 原地排序，返回 None，修改 nums
print(nums)                  # [1, 1, 2, 3, 4, 5, 6, 9]

nums.sort(reverse=True)      # 降序原地排
print(nums)                  # [9, 6, 5, 4, 3, 2, 1, 1]

original = [3, 1, 4]
new = sorted(original)       # 返回新 list，原 list 不变
print(original, new)         # [3, 1, 4] [1, 3, 4]
\`\`\`

| 方法 | 是否原地 | 返回值 | 适用对象 |
| --- | --- | --- | --- |
| lst.sort() | 是 | None | 仅 list |
| sorted(x) | 否 | 新 list | 任意可迭代对象 |

### key 参数：自定义排序键

\`\`\`python
words = ["banana", "apple", "cherry"]
words.sort(key=len)                  # 按长度排
words.sort(key=str.lower)            # 不区分大小写排
students = [("Alice", 90), ("Bob", 85)]
students.sort(key=lambda s: s[1], reverse=True)  # 按分数降序
\`\`\`

- **稳定排序**：相等元素的相对顺序保持不变。Python 的 sort 用 Timsort，稳定。
- key 函数只对每个元素调用一次，比反复比较的 cmp 高效。

## 七、复制：浅复制 vs 深复制

### 1. 三种等价的浅复制

\`\`\`python
b = a.copy()    # 方法 1
b = a[:]        # 方法 2：切片
b = list(a)     # 方法 3：构造函数
\`\`\`

三者等价，都是**浅复制**：复制外层 list，但内部元素仍是共享引用。

### 2. 浅复制陷阱：嵌套对象共享引用

\`\`\`python
a = [1, [2, 3]]
b = a.copy()
b[0] = 99           # 不影响 a：b[0] 指向新对象 99
b[1][0] = 99        # 影响 a！b[1] 和 a[1] 是同一个内层 list
print(a)            # [1, [99, 3]]
print(b)            # [99, [99, 3]]
\`\`\`

原理：浅复制只复制最外层的"指针数组"。第一层元素（int 1、list [2,3]）的引用被复制到新 list，但内层 list 对象本身没被复制，\`a[1]\` 和 \`b[1]\` 指向同一个 list 对象。

### 3. 深复制：copy.deepcopy

\`\`\`python
import copy
b = copy.deepcopy(a)   # 递归复制所有层级
b[1][0] = 99           # 不影响 a
\`\`\`

### 4. 三种复制对比

| 方式 | 外层 | 内层 | 用途 |
| --- | --- | --- | --- |
| b = a | 共享 | 共享 | 别名（同一对象） |
| b = a.copy() | 复制 | 共享 | 一维 list 复制 |
| b = copy.deepcopy(a) | 复制 | 复制 | 嵌套结构完全独立 |

## 八、对比：list vs tuple vs set

| 特性 | list | tuple | set |
| --- | --- | --- | --- |
| 可变 | ✅ | ❌ | ✅ |
| 有序 | ✅ | ✅ | ❌ |
| 可重复 | ✅ | ✅ | ❌ |
| 可哈希 | ❌ | ✅（元素可哈希时） | ❌（frozenset 可） |
| 成员判断 | O(n) | O(n) | O(1) |
| 语法 | [1,2] | (1,2) | {1,2} |

## 九、易错点小结

| 易错点 | 错误写法 | 正确做法 |
| --- | --- | --- |
| 浅复制嵌套共享 | b = a.copy() 后改 b[1][0] | 用 copy.deepcopy |
| insert(0, x) 慢 | 头部频繁 insert | 用 deque |
| append 加整个列表 | lst.append([1,2]) | 用 lst.extend([1,2]) |
| sort 返回值 | new = lst.sort() | new = sorted(lst) |
| 切片越界 | 担心 lst[2:100] 报错 | 不会报错，自动截断 |
| 遍历时删除 | for x in lst: lst.remove(x) | 遍历副本 lst[:] 或用推导式 |
| 乘法复制嵌套 | [[0]*3]*3 共享内层 | [[0]*3 for _ in range(3)] |
| 成员判断慢 | x in big_list | 用 set(big_list) |
`,
    code: `# 创建 + 增删
lst = [3, 1, 4, 1, 5]
lst.append(9)
lst.extend([2, 6])
lst.insert(0, 0)
print("after insert:", lst)

lst.pop()          # 移除末尾
lst.pop(0)         # 移除第一个
lst.remove(1)      # 移除第一个值为 1 的
print("after remove:", lst)

# 切片
lst = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
print("lst[2:5]:", lst[2:5])
print("lst[:3]:", lst[:3])
print("lst[7:]:", lst[7:])
print("lst[::-1]:", lst[::-1])     # 反转
print("lst[::2]:", lst[::2])       # 隔一个取一个

# 切片赋值
lst[2:5] = [20, 30]
print("after slice assign:", lst)

# 排序
nums = [3, 1, 4, 1, 5, 9, 2, 6]
nums.sort()
print("sort:", nums)
nums.sort(reverse=True)
print("sort reverse:", nums)

# sorted 返回新列表
original = [3, 1, 4]
print("sorted:", sorted(original), "original:", original)

# 浅复制
a = [1, [2, 3]]
b = a.copy()
b[0] = 99            # 不影响 a
b[1][0] = 99         # 影响 a（嵌套列表是引用）
print("a:", a, "b:", b)
`,
  },
  {
    id: "py4-tuple",
    group: "数据结构",
    icon: "🔗",
    title: "tuple、解包、NamedTuple",
    content: `
## 一、概念解释：tuple 是什么

tuple（元组）是 Python 的**不可变有序序列**：

- **不可变（immutable）**：创建后长度和元素都不能改
- **有序**：按插入顺序，支持索引、切片
- **存对象引用**：和 list 一样存指针，"不可变"指 tuple 本身的引用结构不变，但内部对象本身可能可变
- **可哈希**：当所有元素都可哈希时，tuple 可作 dict key / set 元素

\`\`\`python
t = (1, 2, 3)
t[0] = 99         # TypeError！不可变
\`\`\`

tuple 解决的问题：**需要一个安全的、不可变的、可哈希的有序容器**。

## 二、设计原理：为什么不可变

### 1. 不可变的四大好处

- **安全**：函数传 tuple 进去，调用方不用担心被改
- **可哈希**：内容不变 → 哈希值不变 → 可做 dict key
- **性能**：固定大小，比 list 省内存、创建快
- **语义清晰**：表示"一组固定字段"（如坐标 (x, y)、RGB (r,g,b)）

### 2. tuple vs list 内存对比

| 维度 | tuple | list |
| --- | --- | --- |
| 内存结构 | 固定大小数组 | 动态数组 + 长度字段 |
| 预分配 | 无 | 有（扩容用） |
| 同样 3 元素 | 省约 30% 内存 | 多分配余量 |
| 创建速度 | 快（一次分配） | 慢（要预分配） |

### 3. "不可变"的精确含义

\`\`\`python
t = (1, [2, 3])
t[1].append(4)    # 合法！改的是内层 list，不是 tuple 结构
print(t)          # (1, [2, 3, 4])
\`\`\`

tuple 不可变 = 元素引用不可变（不能 \`t[0] = 99\`），但元素指向的对象本身可变。

## 三、使用场景

✅ 适合用 tuple：
- 函数多返回值（\`return a, b, c\`）
- 不可变常量数据（一周七天、坐标系）
- 需要 dict key / set 元素时
- 数据库一行记录的轻量表示
- 字符串格式化参数 \`"%s-%d" % (name, age)\`

❌ 不适合用 tuple：
- 需要增删改 → 用 list
- 需要字段名提升可读性 → 用 NamedTuple 或 dataclass
- 大量字段且需要默认值 → 用 dataclass

## 四、代码逐行讲解：创建与基本操作

### 1. 单元素逗号 (1,) 的原因

\`\`\`python
t = (1, 2, 3)     # 多元素，逗号分隔
single = (1,)     # 单元素，必须加逗号
not_tuple = (1)   # 这是 int 1，不是 tuple！
empty = ()        # 空 tuple
\`\`\`

**为什么单元素要逗号**：Python 中括号 \`()\` 既是 tuple 标记，也是数学表达式分组符。\`(1 + 2) * 3\` 中的 \`()\` 是分组，结果是 9。如果 \`(1)\` 是 tuple，那 \`(1+2)*3\` 该怎么解析？所以 Python 规定：**只有逗号才是 tuple 的本质语法**，括号只是可选的包装。

\`\`\`python
t = 1, 2, 3       # 不加括号也是 tuple！逗号是关键
x = 1,            # 单元素 tuple，加逗号即可
\`\`\`

### 2. 基本操作（和 list 共用）

\`\`\`python
t = (1, 2, 3, 1, 1)
t[0]              # 1，索引
t[1:3]            # (2, 3)，切片
t.count(1)        # 3，统计
t.index(2)        # 1，查找
len(t)            # 5
1 in t            # True
\`\`\`

tuple 没有 append/remove/sort 等修改方法。

## 五、解包：tuple 的杀手锏

### 1. 基本解包

\`\`\`python
a, b, c = (1, 2, 3)     # 一一对应
print(a, b, c)          # 1 2 3
\`\`\`

变量数必须等于元素数，否则抛 ValueError。

### 2. 星号解包 *rest

\`\`\`python
first, *mid, last = [1, 2, 3, 4, 5]
print(first, mid, last)    # 1 [2, 3, 4] 5
\`\`\`

- \`*mid\` 收集中间所有元素为 **list**（注意是 list，不是 tuple）
- 星号变量最多一个，可放任意位置
- 用途：忽略中间值 \`first, *_, last = data\`

### 3. 交换变量的原理

\`\`\`python
x, y = 10, 20
x, y = y, x         # 交换！
print(x, y)         # 20 10
\`\`\`

原理：右侧 \`y, x\` 先打包成 tuple \`(20, 10)\`，再解包给左侧 x、y。无需临时变量，是 Pythonic 的交换写法。

### 4. 解包的应用场景

\`\`\`python
# 函数多返回值
def get_stats(nums):
    return min(nums), max(nums), sum(nums) / len(nums)

lo, hi, avg = get_stats([1, 2, 3, 4, 5])

# 遍历 dict.items() 解包
for k, v in d.items():
    ...

# 忽略某些返回值
_, value = some_func()
\`\`\`

**函数多返回值的本质**：\`return a, b, c\` 实际返回的是一个 tuple，\`lo, hi, avg = ...\` 是解包。Python 没有真正的"多返回值"，靠 tuple 打包/解包实现。

## 六、可哈希：可做 dict key

\`\`\`python
d = {(1, 2): "点A", (3, 4): "点B"}
print(d[(1, 2)])    # 点A
\`\`\`

- tuple 可哈希的条件：**所有元素都可哈希**
- 含可变元素（如 list）的 tuple 不可哈希：

\`\`\`python
t = (1, [2, 3])
hash(t)    # TypeError: unhashable type: 'list'
\`\`\`

原理：哈希值由所有元素哈希组合算出，元素可变则哈希不稳，不能做 key。

## 七、NamedTuple：有名字的 tuple

### 1. 基本用法

\`\`\`python
from collections import namedtuple

Point = namedtuple("Point", "x y")              # 字段用空格分隔
User = namedtuple("User", ["name", "age", "email"])  # 或用列表

p = Point(1, 2)
u = User("alice", 30, "alice@example.com")
print(p.x, p.y)              # 1 2，按字段名访问
print(u.name, u.age)         # alice 30
print(p[0], p[1])            # 1 2，仍可按下标访问
\`\`\`

NamedTuple 既是 tuple（可索引、可解包、可哈希），又有字段名（可读性好）。

### 2. NamedTuple vs dataclass vs 普通类

| 特性 | namedtuple | dataclass | 普通类 |
| --- | --- | --- | --- |
| 可变性 | 不可变（默认） | 可变（默认） | 自由 |
| 内存 | 最省（C 实现） | 中等 | 较多 |
| 创建速度 | 快 | 中 | 慢 |
| 字段名访问 | ✅ | ✅ | ✅ |
| 可哈希 | ✅（默认） | 需 frozen=True | 自定义 __hash__ |
| 默认值 | 支持（defaults 参数） | 支持 | 支持 |
| 类型注解 | 不直接支持 | 原生支持 | 自定义 |

选择建议：
- 字段少、不可变、追求性能 → NamedTuple
- 字段多、需要默认值/方法/类型注解 → dataclass
- 复杂行为 → 普通类

## 八、对比：tuple vs list 选择

| 场景 | 选 tuple | 选 list |
| --- | --- | --- |
| 数据不变 | ✅ | — |
| 需要增删 | — | ✅ |
| 做 dict key | ✅ | — |
| 函数多返回值 | ✅ | — |
| 性能/内存敏感 | ✅ | — |
| 需要排序 | — | ✅ |

## 九、易错点小结

| 易错点 | 错误写法 | 正确做法 |
| --- | --- | --- |
| 单元素漏逗号 | (1) 想要 tuple | (1,) |
| 修改 tuple | t[0] = 99 | 转成 list 改再转回，或重新构造 |
| 含 list 不可哈希 | (1, [2,3]) 做 key | 用 (1, (2,3)) |
| 星号解包类型 | 以为 *mid 是 tuple | 实际是 list |
| 误以为括号是关键 | 必须写 (1,2) | 逗号才是关键，1,2 也是 tuple |
| NamedTuple 改字段 | p.x = 99 | 用 p._replace(x=99) 返回新实例 |
| 单元素元组在参数 | func((1,)) 误传两参 | 注意逗号 |
`,
    code: `from collections import namedtuple

# 创建 + 基本操作
t = (1, 2, 3, 1, 1)
single = (1,)          # 注意逗号
print(t, single, t.count(1), t.index(2))

# 解包
a, b, c = (1, 2, 3)
print(a, b, c)

# 星号解包
first, *mid, last = [1, 2, 3, 4, 5]
print(first, mid, last)

# 交换变量
x, y = 10, 20
x, y = y, x
print(x, y)

# 可哈希（可做 dict key）
d = {(1, 2): "point A", (3, 4): "point B"}
print(d[(1, 2)])

# NamedTuple
Point = namedtuple("Point", "x y")
User = namedtuple("User", ["name", "age", "email"])

p = Point(1, 2)
u = User("alice", 30, "alice@example.com")
print(p, p.x, p.y)
print(u, u.name, u.age)

# 常用：返回多个值
def get_stats(nums):
    return min(nums), max(nums), sum(nums) / len(nums)

lo, hi, avg = get_stats([1, 2, 3, 4, 5])
print(f"min={lo}, max={hi}, avg={avg}")
`,
  },
  {
    id: "py4-dict",
    group: "数据结构",
    icon: "📖",
    title: "dict：键值对、合并、方法",
    content: `
## 一、概念解释：dict 是什么

dict（字典）是 Python 的**哈希表实现的键值对容器**：

- **键值对**：每个元素是 (key, value) 映射
- **可变**：可增、删、改
- **键唯一**：一个 key 只出现一次
- **键必须可哈希**：int/str/tuple/frozenset 可，list/dict/set 不可
- **3.7+ 保证插入顺序**：按写入顺序遍历（3.6 是实现细节，3.7 写入语言规范）

\`\`\`python
d = {"name": "alice", "age": 30}
d["age"] = 31          # 改值
d["email"] = "..."     # 增值
\`\`\`

dict 解决的问题：**需要 O(1) 平均时间按 key 查找/插入/删除的映射容器**。

## 二、设计原理：哈希表

### 1. 哈希表原理

dict 内部是一个数组，通过 \`hash(key) % size\` 算出 key 该放哪个槽位：

\`\`\`python
# 简化原理（实际更复杂）
index = hash(key) % len(table)
table[index] = (key, value)
\`\`\`

- 查找：算 hash → 定位槽位 → 比较 key → 返回 value，平均 O(1)
- 冲突：不同 key 算出同槽位，用开放寻址法解决
- 扩容：装载因子超阈值时，分配更大数组并 rehash

### 2. 为什么 3.7+ 保证顺序

早期 dict（3.5 及以前）不保证顺序：哈希值散列导致 key 在表中位置无序。3.6 起 CPython 改用"紧凑哈希表"：主数组存 key 的稀疏哈希索引，另用一个**连续数组**按插入顺序存实际 entry。这样既保持 O(1) 查找，又能按插入顺序遍历。3.7 把这个行为写入语言规范。

### 3. 为什么键必须可哈希

哈希表靠 \`hash(key)\` 定位槽位。如果 key 可变（如 list），改了之后 hash 变了，就找不到原槽位了。所以要求 key 不可变 → 可哈希。

## 三、使用场景

✅ 适合用 dict：
- key→value 映射（用户名→用户信息、单词→词频、缓存）
- 配置项存储
- JSON 数据解析结果
- 计数器/分组聚合

❌ 不适合用 dict：
- 只存值不需要 key → 用 list/set
- 需要 1:1 双向查找 → 自建反查 dict 或用专用结构
- 顺序敏感且 key 频繁增删需注意：插入顺序保留，但删除后再插同 key 会排到末尾

## 四、代码逐行讲解：创建方式

\`\`\`python
# 1. 字面量（最常用）
d = {"name": "alice", "age": 30}

# 2. dict() 构造（key 不用引号，但必须是合法标识符）
d = dict(name="alice", age=30)

# 3. 可迭代对象
d = dict([("name", "alice"), ("age", 30)])

# 4. 字典推导式
squares = {x: x*x for x in range(6)}

# 5. fromkeys（批量同值）
d = dict.fromkeys(["a", "b", "c"], 0)   # {'a':0,'b':0,'c':0}
\`\`\`

## 五、取值：d[k] vs d.get(k, default)

\`\`\`python
d = {"name": "alice"}
print(d["name"])          # alice，存在则直接取
print(d["phone"])         # KeyError！不存在直接取会抛异常
print(d.get("phone"))     # None，不存在返回 None
print(d.get("phone", "N/A"))   # N/A，自定义默认值
\`\`\`

| 方式 | key 不存在时 | 适用 |
| --- | --- | --- |
| d[k] | 抛 KeyError | 确定存在，或想让它抛错 |
| d.get(k) | 返回 None | 可能不存在，不关心 |
| d.get(k, default) | 返回 default | 可能不存在，要兜底 |

**原则**：能用 get 就别写 try/except KeyError，代码更简洁。

## 六、增改与合并

### 1. 增改

\`\`\`python
d["new_key"] = value     # 不存在则增，存在则改
d.update({"a": 1, "b": 2})   # 批量增改
d.update(a=1, b=2)           # 也可用关键字参数
\`\`\`

### 2. 合并：3.9+ | 运算符 vs update

\`\`\`python
d1 = {"a": 1, "b": 2}
d2 = {"b": 99, "c": 3}

# 3.9+ 合并运算符（不修改原 dict，返回新 dict）
merged = d1 | d2          # {'a':1,'b':99,'c':3}，后覆盖前
new = d1 | d2             # d1、d2 不变

# 原地合并（修改 d1）
d1 |= d2                  # d1 变成合并结果，等价 d1.update(d2)

# 3.8 及以前用 update
merged = {**d1, **d2}     # 解包合并，后覆盖前
\`\`\`

| 方式 | 是否原地 | 版本 |
| --- | --- | --- |
| d1.update(d2) | 原地 | 全版本 |
| {**d1, **d2} | 新建 | 3.5+ |
| d1 | d2 | 新建 | 3.9+ |
| d1 |= d2 | 原地 | 3.9+ |

## 七、setdefault：原子操作

\`\`\`python
counter = {}
for ch in "abracadabra":
    counter.setdefault(ch, 0)    # 有则返回原值，无则设为 0
    counter[ch] += 1
\`\`\`

\`setdefault(key, default)\` 的语义：**有则返回原值，无则先设为 default 再返回 default**，是原子操作。

对比下面三种写法：

\`\`\`python
# 写法 A：笨拙
if ch not in counter:
    counter[ch] = 0
counter[ch] += 1

# 写法 B：用 setdefault
counter.setdefault(ch, 0)
counter[ch] += 1

# 写法 C：更优用 defaultdict
from collections import defaultdict
counter = defaultdict(int)    # 缺 key 自动取 int()=0
for ch in "abracadabra":
    counter[ch] += 1
\`\`\`

## 八、遍历：keys/values/items 视图对象

\`\`\`python
for k in d.keys():           # 只遍历 key
    ...
for v in d.values():         # 只遍历 value
    ...
for k, v in d.items():       # 同时遍历键值（最常用）
    ...
\`\`\`

### 视图对象的"动态反映"特性

\`\`\`python
keys = d.keys()              # 不是 list！是 view 对象
d["new"] = "value"
print(list(keys))            # 包含 'new'！视图自动反映 dict 变化
\`\`\`

- \`d.keys()\` / \`d.values()\` / \`d.items()\` 返回的是**视图对象**，不是 list
- 视图不复制数据，而是动态查询 dict
- 优点：省内存、实时反映变化
- 缺点：不能按下标访问（要先 \`list()\`）
- 集合运算：\`d.keys() & {'a', 'b'}\` 求交集

## 九、字典推导式

\`\`\`python
# 平方映射
squares = {x: x*x for x in range(6)}    # {0:0,1:1,...,5:25}

# 过滤
even_squares = {x: x*x for x in range(10) if x % 2 == 0}

# 反转 key/value
inverted = {v: k for k, v in d.items()}

# 从两个 list 构造
mapping = dict(zip(["a", "b"], [1, 2]))
\`\`\`

## 十、对比：dict vs JSON 的关系

| 维度 | dict | JSON |
| --- | --- | --- |
| 是什么 | Python 数据结构 | 文本数据格式 |
| key 类型 | 任意可哈希 | 只能字符串 |
| value 类型 | 任意 | str/num/bool/null/array/object |
| 顺序 | 3.7+ 保序 | 保序 |
| 互通 | json.loads / json.dumps |  |

\`\`\`python
import json
d = {"name": "alice", "age": 30}
s = json.dumps(d)        # dict → JSON 字符串
d2 = json.loads(s)       # JSON 字符串 → dict
\`\`\`

JSON 的 object 直接对应 dict，array 对应 list。所以 dict 是处理 JSON 的天然结构。

## 十一、对比：dict vs list vs set

| 特性 | dict | list | set |
| --- | --- | --- | --- |
| 存储 | key-value | 单值 | 单值（去重） |
| 查找 | O(1) by key | O(n) by value | O(1) by value |
| 顺序 | 插入顺序（3.7+） | 插入顺序 | 无序 |
| 可哈希 | ❌ | ❌ | ❌ |

## 十二、易错点小结

| 易错点 | 错误做法 | 正确做法 |
| --- | --- | --- |
| key 不存在直接取 | d["phone"] | d.get("phone", default) |
| 遍历时改 dict | for k in d: del d[k] | 先 list(d.keys()) 或收集后改 |
| key 必须可哈希 | 用 list 做 key | 用 tuple 做 key |
| 浅复制嵌套共享 | d.copy() 后改内层 dict | copy.deepcopy |
| 3.9 才有 \\| 运算 | 老版本用 d1\\|d2 | 用 {**d1, **d2} 或 update |
| 误用 setdefault | d.setdefault(k) 漏第二参 | 永远写默认值 setdefault(k, default) |
| 视图对象当 list | d.keys()[0] | list(d.keys())[0] |
| 计数器用 get 啰嗦 | d[k] = d.get(k,0)+1 | 用 defaultdict 或 Counter |
`,
    code: `# 创建
d = {"name": "alice", "age": 30, "city": "Beijing"}
d["email"] = "alice@example.com"
print("d:", d)

# get vs 直接取值
print(d.get("phone", "N/A"))        # 安全
try:
    print(d["phone"])               # KeyError
except KeyError as e:
    print("KeyError:", e)

# 合并（3.9+）
d1 = {"a": 1, "b": 2}
d2 = {"b": 99, "c": 3}
print(d1 | d2)                      # {'a': 1, 'b': 99, 'c': 3}

# setdefault：有则返回，无则设置
counter = {}
for ch in "abracadabra":
    counter.setdefault(ch, 0)
    counter[ch] += 1
print("counter:", counter)

# 遍历
for k, v in d.items():
    print(f"  {k}: {v}")

# 字典推导
squares = {x: x * x for x in range(6)}
print("squares:", squares)

# dict 视图
keys = d.keys()
d["new"] = "value"
print("keys after update:", list(keys))  # 视图自动反映变化
`,
  },
  {
    id: "py4-set",
    group: "数据结构",
    icon: "🎯",
    title: "set：去重、集合运算、frozenset",
    content: `
## 一、概念解释：set 是什么

set（集合）是 Python 的**无序去重哈希表**：

- **无序**：元素无插入顺序（遍历顺序不可预测）
- **去重**：同一元素只存一份
- **可变**：可增删元素
- **元素必须可哈希**：int/str/tuple 可，list/dict/set 不可
- **成员判断 O(1)**：远快于 list 的 O(n)

\`\`\`python
s = {1, 2, 3, 2, 1}     # 自动去重 → {1, 2, 3}
print(2 in s)           # True，O(1) 判断
\`\`\`

set 解决的问题：**需要快速去重 + O(1) 成员判断 + 集合运算**。

## 二、设计原理：为什么这样设计

### 1. set 本质是"只有 key 没有 value 的 dict"

CPython 中 set 就是 dict 简化版：哈希表的每个槽位只存 key，不存 value。所以 set 和 dict 共享底层机制（哈希、扩容、冲突处理），也继承了对 key 可哈希的要求。

### 2. 为什么元素必须可哈希

和 dict 的 key 一样：哈希表靠 \`hash(elem)\` 定位槽位。元素可变 → hash 不稳定 → 找不到原槽位。所以 set 不能放 list/dict/set。

### 3. 为什么无序

哈希值散列导致元素在表中位置无序（不像 dict 那样额外维护插入顺序的连续数组）。Python 没有给 set 维护顺序，是为了极致的内存效率和速度。如果需要去重又保序，用 \`dict.fromkeys(x).keys()\`（3.7+ dict 保序）。

### 4. set vs 其他语言

| 语言 | 集合类型 | 有序性 |
| --- | --- | --- |
| Python | set / frozenset | 无序 |
| Java | HashSet / TreeSet | 无序 / 排序 |
| C++ | unordered_set / set | 无序 / 排序 |
| JS | Set | 保序 |

## 三、使用场景

✅ 适合用 set：
- 去重（一组用户 ID 去重）
- 成员判断（黑名单、敏感词过滤）
- 集合运算（交集、并集、差集）
- 关系运算（A 是 B 的子集吗）

❌ 不适合用 set：
- 需要保序 → 用 list 或 \`dict.fromkeys\`
- 需要 key→value → 用 dict
- 元素本身可变（如存 list）→ 改用 tuple 或自定义可哈希包装
- 需要按下标访问 → 用 list

## 四、代码逐行讲解：创建方式

\`\`\`python
a = {1, 2, 3, 4}            # 字面量（注意：{} 是空 dict 不是空 set！）
b = {3, 4, 5, 6}
empty = set()               # 空集合必须用 set()，因为 {} 是空 dict
s = set([1, 2, 2, 3])       # 从可迭代对象去重 → {1, 2, 3}
s = set("hello")            # {'h','e','l','o'}，字符去重
\`\`\`

### ⚠️ 空集合用 set() 不是 {}

\`\`\`python
s = {}            # 这是空 dict，不是空 set！
print(type(s))    # <class 'dict'>
s = set()         # 这才是空 set
\`\`\`

原因：\`{}\` 在语法上被 dict 占用了（空 dict 字面量），所以空 set 只能用构造函数 \`set()\`。非空 set 可以用 \`{1, 2, 3}\` 字面量。

## 五、集合运算：| & - ^

\`\`\`python
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

print(a | b)    # {1,2,3,4,5,6}  并集（在 a 或 b 中）
print(a & b)    # {3,4}          交集（同时在 a 和 b 中）
print(a - b)    # {1,2}          差集（在 a 中但不在 b 中）
print(a ^ b)    # {1,2,5,6}      对称差（只在 a 或只在 b 中，不同时有）
\`\`\`

| 运算符 | 方法 | 含义 | 结果元素 |
| --- | --- | --- | --- |
| \\| | union | 并集 | a ∪ b |
| & | intersection | 交集 | a ∩ b |
| - | difference | 差集 | a - b |
| ^ | symmetric_difference | 对称差 | (a∪b) - (a∩b) |

\`\`\`python
# 运算符和方法等价
a | b == a.union(b)        # True
a & b == a.intersection(b) # True

# 方法可接收任意可迭代对象，运算符只支持 set
a.union([5, 6])            # ✅ 方法接受 list
# a | [5, 6]               # ❌ 运算符只支持 set
\`\`\`

还有判断关系的：

\`\`\`python
{1, 2}.issubset({1, 2, 3})     # True，是子集
{1, 2, 3}.issuperset({1, 2})   # True，是超集
{1, 2}.isdisjoint({3, 4})      # True，无交集
\`\`\`

## 六、增删方法：add/remove/discard

\`\`\`python
s = {1, 2, 3}
s.add(4)             # 添加元素
s.add(2)             # 已存在，无变化（不报错）
s.discard(1)         # 删除元素，不存在也不报错
s.remove(99)         # 删除元素，不存在抛 KeyError！
s.pop()              # 随机弹出一个（set 无序，不能指定）
s.clear()            # 清空
\`\`\`

### remove vs discard 的区别

| 方法 | 元素存在 | 元素不存在 |
| --- | --- | --- |
| remove(x) | 删除 | 抛 KeyError |
| discard(x) | 删除 | 静默返回 None |
| pop() | 随机弹一个 | 空 set 抛 KeyError |

**原则**：不确定元素是否存在时用 discard，确定存在时用 remove（让 bug 早暴露）。

### 批量更新

\`\`\`python
s.update([5, 6, 7])       # 并入多个元素（原地）
s.intersection_update(b)  # 原地求交
s.difference_update(b)    # 原地求差
\`\`\`

## 七、去重：list(set(x)) 失去顺序的问题

\`\`\`python
words = ["hello", "world", "hello", "python", "world"]
unique = list(set(words))     # 去重，但顺序乱了！
\`\`\`

set 无序，转回 list 后元素顺序不可预测。如果**既要去重又要保序**：

\`\`\`python
# 方法 1：用 dict.fromkeys（3.7+ dict 保序）
unique = list(dict.fromkeys(words))

# 方法 2：手动维护
seen = set()
unique = []
for w in words:
    if w not in seen:
        seen.add(w)
        unique.append(w)
\`\`\`

## 八、成员判断：O(1) 优势

\`\`\`python
big = set(range(100000))
print(99999 in big)     # True，O(1) 平均
print(100000 in big)    # False，O(1) 平均

# 对比 list
big_list = list(range(100000))
print(99999 in big_list)    # True，但要 O(n) 线性扫描！
\`\`\`

| 容器 | x in c 复杂度 | 原理 |
| --- | --- | --- |
| list / tuple | O(n) | 线性扫描 |
| set / dict | O(1) 平均 | 哈希定位 |

**性能差距**：10 万元素，list 判断要扫几万次，set 一次哈希即可。对频繁的成员判断（黑名单、敏感词、缓存命中），set 是必选。

## 九、frozenset：不可变可哈希集合

\`\`\`python
fs = frozenset([1, 2, 3])
fs.add(4)          # AttributeError！不可变
d = {fs: "frozen"} # ✅ 可作 dict key
nested = {fs, fs}  # ✅ 可作 set 元素（去重）
\`\`\`

### set vs frozenset 对比

| 特性 | set | frozenset |
| --- | --- | --- |
| 可变 | ✅ | ❌ |
| 可哈希 | ❌ | ✅ |
| 做 dict key | ❌ | ✅ |
| 做 set 元素 | ❌ | ✅ |
| 增删方法 | 有 | 无 |
| 集合运算 | 有（返回新 set） | 有（返回新 frozenset） |

类似 list/tuple 的关系：可变版本日常用，不可变版本做 key 或保证不被改时用。

## 十、集合推导式

\`\`\`python
evens = {x for x in range(20) if x % 2 == 0}    # {0,2,4,...,18}
squares = {x*x for x in range(5)}                # {0,1,4,9,16}
\`\`\`

语法：\`{expr for x in iter if cond}\`，注意是 \`{}\` 不是 \`[]\`（列表推导）或 \`()\`（生成器）。

## 十一、对比：set vs list vs dict

| 特性 | set | list | dict |
| --- | --- | --- | --- |
| 去重 | ✅ | ❌ | key 去重 |
| 顺序 | 无 | 插入顺序 | 插入顺序（3.7+） |
| 成员判断 | O(1) | O(n) | O(1) by key |
| 下标访问 | ❌ | ✅ | ❌（用 key） |
| 元素可哈希 | 必须 | 不要求 | key 必须 |

## 十二、易错点小结

| 易错点 | 错误做法 | 正确做法 |
| --- | --- | --- |
| 空集合用 {} | s = {} | s = set() |
| 去重丢顺序 | list(set(x)) | list(dict.fromkeys(x)) |
| remove 不存在 | s.remove(x) 不确定存在 | 用 s.discard(x) |
| 元素不可哈希 | { [1,2] } | { (1,2) } 用 tuple |
| 遍历改 set | for x in s: s.remove(x) | 收集后改或 s -= {...} |
| 误以为 set 有序 | 依赖遍历顺序 | 需要"有序去重"用 dict |
| 集合运算符类型 | a \\| [1,2] | a.union([1,2]) 或先 set() |
| pop 不确定 | s.pop() 以为弹指定 | set 无序，pop 随机 |
`,
    code: `# 创建
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
empty = set()              # 不是 {}（那是空 dict）

# 集合运算
print("a | b  (并):", a | b)
print("a & b  (交):", a & b)
print("a - b  (差):", a - b)
print("a ^ b  (对称差):", a ^ b)

# 方法
s = {1, 2, 3}
s.add(4)
s.add(2)                   # 已存在，无变化
s.discard(1)               # 删除（不存在也不报错）
print("s:", s)

# 去重
words = ["hello", "world", "hello", "python", "world"]
unique = list(set(words))
print("unique:", unique)

# 成员判断（O(1) 平均）
big = set(range(100000))
print(99999 in big, 100000 in big)

# frozenset：不可变，可哈希
fs = frozenset([1, 2, 3])
d = {fs: "frozen"}
print(d)

# 集合推导
evens = {x for x in range(20) if x % 2 == 0}
print("evens:", evens)
`,
  },
];