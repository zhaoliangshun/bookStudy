// =============================================================
// Batch 3：容器（4 章）
// 5. py5-list    list 列表
// 6. py5-tuple   tuple 元组
// 7. py5-dict    dict 字典
// 8. py5-set     set/frozenset 集合
// =============================================================

export const chapters = [
  {
    id: "py5-list",
    group: "容器",
    icon: "📋",
    title: "list 列表",
    content: `
## 概述
列表是 Python 中最常用的可变有序序列，支持任意类型元素混存，是处理有序数据集合的首选容器，几乎所有 Python 程序都会用到。

## 核心要点
- **创建**: \`[1, 2, 3]\` 或 \`list(range(5))\`，元素可混合不同类型
- **尾部添加**: \`append(x)\` 加单个元素、\`extend(iter)\` 批量拼接、\`+=\` 等价 extend
- **位置插入**: \`insert(i, x)\` 在索引 i 前插入（O(n)，慎用于大列表头部）
- **删除**: \`pop(i)\` 弹出并返回（默认末尾）、\`remove(x)\` 按值删首个匹配、\`clear()\` 清空
- **查询**: \`index(x)\` 首次索引、\`count(x)\` 计数、\`x in lst\` 成员判断（O(n)）
- **切片**: \`lst[start:end:step]\`，支持负索引，\`lst[::-1]\` 逆序，\`lst[::2]\` 隔位取
- **列表推导式**: \`[x**2 for x in seq if cond]\`，可嵌套生成矩阵
- **排序**: \`lst.sort()\` 原地、\`sorted(lst)\` 返回新列表，均支持 \`key=\` 和 \`reverse=True\`
- **反转**: \`lst.reverse()\` 原地、\`reversed(lst)\` 返回迭代器、\`lst[::-1]\` 新列表
- **拷贝**: \`lst.copy() / lst[:] / list(lst)\` 三种等价浅拷贝写法

## 原理与机制
- **动态数组**: 列表底层是动态数组，按需扩容（过度分配），append 均摊 O(1)
- **引用语义**: 列表存储的是对象引用而非值本身，赋值是共享同一列表
- **浅拷贝局限**: \`copy()\` 仅复制外层容器，内嵌可变对象仍共享同一引用
- **推导式作用域**: Python 3 列表推导式有独立作用域，循环变量不泄露到外部
- **排序稳定**: \`sort()\` 采用 Timsort，稳定排序，相等元素相对顺序不变

## 易错点与陷阱
- **浅拷贝陷阱**: 嵌套 list 修改时副本也受影响，需用 \`copy.deepcopy()\` 深拷贝
- **remove 找不到值**: 抛出 \`ValueError\`，建议先 \`if x in lst\` 判断或用 try/except
- **遍历中修改**: for 循环里增删元素会导致索引错乱，应遍历副本 \`for x in lst[:]\`
- **append vs extend**: \`append([4,5])\` 加一个子列表，\`extend([4,5])\` 加两个元素

## 实战建议
- **优先推导式**: 简单映射/过滤场景用列表推导式，比 for+append 更简洁可读
- **深拷贝嵌套结构**: 多层嵌套用 \`copy.deepcopy()\`，避免共享引用引发的隐蔽 bug
- **多字段排序**: \`lst.sort(key=lambda x: (x.age, x.name))\` 用元组实现复合排序
`,
    code: `# 基础创建
lst = [1, 2, 3]
lst.append(4)
lst.extend([5, 6])
lst.insert(0, 0)
print("添加后:", lst)

# pop / remove
print("pop():", lst.pop(), "->", lst)
print("pop(0):", lst.pop(0), "->", lst)
lst.remove(3)
print("remove(3):", lst)

# index / count
print("index(5):", lst.index(5))
print("count(2):", lst.count(2))

# 切片
nums = [0, 1, 2, 3, 4, 5]
print("切片 [1:4]:", nums[1:4])
print("切片 [::2]:", nums[::2])
print("逆序 [::-1]:", nums[::-1])

# 列表推导式
squares = [x ** 2 for x in range(6)]
evens = [x for x in range(10) if x % 2 == 0]
matrix = [[i * j for j in range(1, 4)] for i in range(1, 4)]
print("squares:", squares)
print("evens:", evens)
print("matrix:", matrix)

# 引用 vs 拷贝
a = [1, 2, [3, 4]]
b = a.copy()
a[0] = 99
a[2].append(5)
print("a:", a, "b:", b, "（浅拷贝：内嵌列表仍共享）")

# sorted vs sort
unsorted = [3, 1, 4, 1, 5, 9, 2]
print("sorted():", sorted(unsorted), "原:", unsorted)
unsorted.sort(reverse=True)
print(".sort() 原地:", unsorted)
`,
  },
  {
    id: "py5-tuple",
    group: "容器",
    icon: "🔒",
    title: "tuple 元组",
    content: `
## 概述
元组是不可变有序序列，创建后无法增删改元素，常用于固定数据组合、函数多返回值与字典键，比列表更轻量安全。

## 核心要点
- **创建**: \`(1, 2, 3)\`，无括号 \`1, 2, 3\` 也可，空元组 \`()\`
- **单元素**: \`(1,)\` 必须有尾随逗号，\`(1)\` 只是整数 1
- **不可变性**: 不能重新赋值元素，也无 append/remove 等方法
- **解包**: \`a, b, c = t\` 按位置赋值，\`a, *rest, b = seq\` 用 \`*\` 收集中间
- **变量交换**: \`a, b = b, a\` 无需临时变量，背后即元组打包+解包
- **方法**: 仅 \`count(x)\` 计数和 \`index(x)\` 查索引，比 list 少很多
- **namedtuple**: \`collections.namedtuple("P", ["x","y"])\` 带字段名的元组子类
- **可哈希**: 元组本身可哈希，可作 dict key 或放入 set
- **拼接**: \`t1 + t2\` 拼接、\`t * 3\` 重复，均生成新元组

## 原理与机制
- **定长存储**: 元组创建后长度固定，底层比 list 更紧凑，访问略快
- **可哈希条件**: 元组本身实现 \`__hash__\`，但若含 list/dict 等不可哈希元素则失去可哈希性
- **解包原理**: 右侧先构造元组，再按位置依次赋值给左侧目标，数量必须匹配
- **namedtuple 实质**: 是 tuple 子类，通过 \`__slots__\` 与属性描述符提供字段访问，内存友好
- **不可变≠元素不可变**: 元组仅保证引用不变，若元素是 list，list 内部仍可改

## 易错点与陷阱
- **单元素漏逗号**: \`(1)\` 是整数而非元组，必须写 \`(1,)\`，易导致返回值类型错误
- **含可变元素的元组**: 元组里有 list 时仍可改 list 内容，但此元组不再可哈希
- **解包数量不匹配**: 左右元素数量不一致抛 \`ValueError: too many values to unpack\`，需用 \`*\` 收集
- **namedtuple 字段名限制**: 字段名不能以 \`_\` 开头，也不能与内置方法重名

## 实战建议
- **多返回值**: 函数 \`return a, b\` 实际返回元组，调用方按需解包使用更直观
- **替代小类**: 简单数据聚合优先 \`namedtuple\` 或 \`dataclass\`，可读性远超下标访问
- **常量保护**: 用元组存放不应被修改的配置或常量序列，避免误改带来的 bug
`,
    code: `from collections import namedtuple

# 创建
t = (1, 2, 3)
single = (42,)
empty = ()
print("tuple:", t, "单元素:", single, "空:", empty)
print("无括号也可以:", 1, 2, 3)

# 不可变
try:
    t[0] = 99
except TypeError as e:
    print("不能修改:", e)

# 解包
a, b, c = t
print("解包 a,b,c:", a, b, c)

# 交换变量（无需临时变量）
x, y = 10, 20
x, y = y, x
print("交换后:", x, y)

# *rest 收集
first, *middle, last = [1, 2, 3, 4, 5]
print("first:", first, "middle:", middle, "last:", last)

# namedtuple
Point = namedtuple("Point", ["x", "y", "z"])
p = Point(1, 2, 3)
print("Point:", p, "x=", p.x, "z=", p.z)
print("_make:", Point._make([4, 5, 6]))
print("_asdict:", p._asdict())

# 元组作为 dict key（因为可哈希）
locations = {
    (39.9, 116.4): "北京",
    (31.2, 121.5): "上海",
}
print("北京坐标:", locations[(39.9, 116.4)])

# count / index
t2 = (1, 2, 2, 3, 2)
print("count(2):", t2.count(2), "index(3):", t2.index(3))
`,
  },
  {
    id: "py5-dict",
    group: "容器",
    icon: "📖",
    title: "dict 字典",
    content: `
## 概述
字典是键值对映射容器，平均 O(1) 查找，Python 3.7+ 保证按插入顺序遍历，是高频使用的核心数据结构。

## 核心要点
- **创建**: \`{"k": v}\`、\`dict(k=v)\`、\`dict([(k, v)])\`、字典推导式
- **访问**: \`d[key]\` 不存在抛 \`KeyError\`；\`d.get(key, default)\` 安全访问返回默认值
- **设置**: \`d[key] = v\` 覆盖已有键；\`d.setdefault(key, default)\` 仅键不存在时插入
- **更新**: \`d.update(other)\` 批量合并，可接 dict 或 (k,v) 序列
- **删除**: \`del d[key]\`、\`d.pop(key, default)\`、\`d.popitem()\` 弹出末项
- **合并运算符**: Python 3.9+ 支持 \`d1 | d2\` 返回新 dict、\`d1 |= d2\` 原地合并
- **视图对象**: \`keys() / values() / items()\` 动态反映原 dict 变化（非快照）
- **字典推导式**: \`{k: v for k, v in pairs if cond}\` 灵活构造与过滤
- **3.7+ 有序**: 自 3.7 起插入顺序进入语言规范，3.6 仅为 CPython 实现细节
- **解包合并**: \`{**d1, **d2}\` 解包合并，后者覆盖前者

## 原理与机制
- **哈希表**: dict 基于哈希表实现，平均 O(1) 查找，键必须可哈希（实现 \`__hash__\`）
- **插入顺序**: 内部维护独立插入链表，迭代时按链表顺序遍历
- **视图动态性**: keys/values/items 是视图对象而非拷贝，dict 变动后视图立即反映
- **键可哈希要求**: 不可变类型（str/int/tuple）可作 key，list/dict/set 不可
- **空间换时间**: 相比 list 的 O(n) 查找，dict 用更多内存换取 O(1) 访问

## 易错点与陷阱
- **遍历中修改**: 遍历时增删键会抛 \`RuntimeError: dictionary changed size during iteration\`
- **get 误用**: \`get()\` 不存在返回 \`None\`，若需区分"键不存在"与"值为 None"应显式传 default
- **合并优先级**: \`d1 | d2\` 中 d2 的键覆盖 d1，左右顺序决定最终值
- **可变键失效**: 用 list 作 key 会抛 \`TypeError: unhashable type\`

## 实战建议
- **优先 get/setdefault**: 避免显式 \`if key in d\` 判断，代码更简洁也更 Pythonic
- **3.9+ 用 | 合并**: 合并多个 dict 用 \`d1 | d2\` 比 \`{**d1, **d2}\` 更清晰，原地用 \`|=\`
- **计数用 Counter**: \`collections.Counter\` 比 \`setdefault\` 更适合频次统计场景
`,
    code: `# 创建与基本访问
d = {"name": "Alice", "age": 30, "city": "Beijing"}
print("dict:", d)
print("name:", d["name"])
print("get 不存在:", d.get("email", "N/A"))

# setdefault
d.setdefault("email", "alice@example.com")
d.setdefault("age", 99)
print("setdefault 后:", d)

# update
d.update({"age": 31, "lang": "Python"})
print("update:", d)

# 3.9+ | 合并运算符合并
d1 = {"a": 1, "b": 2}
d2 = {"b": 20, "c": 3}
merged = d1 | d2
print("d1|d2:", merged, "（b 取右边值）")
d1 |= {"d": 4}
print("d1 |=:", d1)

# 视图：keys / values / items
keys = d.keys()
print("keys:", list(keys))
print("items:")
for k, v in d.items():
    print(f"  {k}: {v}")

# 视图动态反映原 dict
d["new_key"] = "new_val"
print("添加后 keys:", list(keys))

# 字典推导式
words = ["apple", "banana", "cherry"]
word_lens = {w: len(w) for w in words}
print("word_lens:", word_lens)

# 反转键值
squares = {x: x ** 2 for x in range(5)}
print("squares:", squares)

# 删除
del d["new_key"]
popped = d.pop("city")
print("pop city:", popped, "剩余 keys:", list(d.keys()))
`,
  },
  {
    id: "py5-set",
    group: "容器",
    icon: "🔗",
    title: "set 集合与 frozenset",
    content: `
## 概述
集合是无序、不重复元素的容器，擅长去重与集合运算（并交差补），\`frozenset\` 是其不可变版本，可作 dict 键。

## 核心要点
- **创建**: \`{1, 2, 3}\`、\`set(iterable)\`；空集必须用 \`set()\`（\`{}\` 是空 dict）
- **特性**: 无序、元素唯一、元素必须可哈希
- **增删**: \`add(x)\` 添加、\`remove(x)\` 不存在报错、\`discard(x)\` 不存在不报错
- **弹出**: \`pop()\` 随机弹出（因无序）、\`clear()\` 清空集合
- **并集**: \`a | b\` 或 \`a.union(b)\`，可接任意 iterable
- **交集**: \`a & b\` 或 \`a.intersection(b)\`
- **差集**: \`a - b\` 或 \`a.difference(b)\`（仅在 a 中不在 b 中）
- **对称差**: \`a ^ b\` 只在一边出现的元素，等价 \`a.symmetric_difference(b)\`
- **判断**: \`issubset / issuperset / isdisjoint\` 子集、超集、是否不相交
- **frozenset**: 不可变集合，可哈希，可作 dict key 或嵌套进其他 set
- **集合推导式**: \`{x for x in seq if cond}\` 构造去重集合

## 原理与机制
- **哈希表实现**: set 基于 hash 表，查找/插入平均 O(1)，远快于 list 的 \`in\`（O(n)）
- **去重原理**: 插入时计算 hash，相同元素直接被忽略，保留首个
- **无序性**: 元素遍历顺序由 hash 值决定，不保证插入顺序（不同于 dict）
- **frozenset 可哈希**: 内容不可变使 hash 可缓存，故可哈希，能嵌套使用
- **运算符 vs 方法**: \`|\` 要求两侧都是 set，\`union()\` 可接任意 iterable

## 易错点与陷阱
- **空集合**: \`{}\` 创建的是空 dict，空集合必须 \`set()\`
- **remove vs discard**: \`remove()\` 不存在抛 \`KeyError\`，遍历删除建议用 \`discard\` 更安全
- **去重丢顺序**: \`list(set(lst))\` 顺序不保证，保序去重用 \`list(dict.fromkeys(lst))\`
- **元素须可哈希**: list/dict 不能放进 set，需先转 tuple 再放入

## 实战建议
- **去重用 set**: 大规模去重 \`set()\` 远快于 list 的 \`in\` 判断，是最常用场景
- **保序去重**: 利用 dict 有序性，\`list(dict.fromkeys(lst))\` 既去重又保序
- **集合运算替代循环**: 用 \`& / | / -\` 表达业务上的"同时存在""任一存在""只在 A 中"，比循环更直观
`,
    code: `# 创建
s = {1, 2, 3, 2, 1}
print("set:", s, "len:", len(s))

# add / remove / discard
s.add(4)
s.add(2)
s.discard(99)
try:
    s.remove(99)
except KeyError as e:
    print("remove 不存在报错:", e)
print("discard 不报错")
print("修改后:", s)

# pop (随机弹出，因为无序)
popped = s.pop()
print("pop:", popped, "->", s)

# frozenset 不可变
fs = frozenset([1, 2, 3])
print("frozenset:", fs)
try:
    fs.add(4)
except AttributeError as e:
    print("frozenset 不能 add:", e)

# 集合运算
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
print("a | b 并集:", a | b)
print("a & b 交集:", a & b)
print("a - b 差集:", a - b)
print("a ^ b 对称差:", a ^ b)

# 方法形式
print("union():", a.union(b))
print("intersection():", a.intersection(b))

# 子集/超集/不相交
print("{1,2} 是子集:", {1, 2}.issubset(a))
print("a 是超集:", a.issuperset({1, 2}))
print("{1,5} 与 {2,3} 不相交:", {1, 5}.isdisjoint({2, 3}))

# 集合推导式
evens = {x for x in range(10) if x % 2 == 0}
print("偶数 set:", evens)

# 去重应用
data = [1, 2, 2, 3, 3, 3, 4]
unique = list(set(data))
print("去重:", unique, "（顺序不保证）")
`,
  },
];
