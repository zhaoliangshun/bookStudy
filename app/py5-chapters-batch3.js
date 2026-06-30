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
- 可变有序序列：\`append/extend/insert/pop/remove/index/count/sort/reverse\`
- 切片：\`lst[start:end:step]\`，支持负索引
- **列表推导式**：\`[x for x in seq if cond]\`（简洁高效）
- 引用 vs 副本：\`lst.copy() / lst[:] / list(lst)\` 浅拷贝
- \`sorted(lst)\` 返回新列表；\`lst.sort()\` 原地排序
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
- 不可变有序序列：创建后不能增删改
- 单元素元组：\`(1,)\`（逗号不能省）
- 解包：\`a, b = b, a\` 交换；\`a, *rest, b = seq\` 收集剩余
- \`collections.namedtuple\`：带字段名的元组
- 元组可哈希，可作字典 key
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
- 键值对映射：Python 3.7+ 保证插入顺序
- 访问：\`d[key]\`、\`d.get(key, default)\`、\`d.setdefault(key, val)\`
- 合并：3.9+ 支持 \`|\` 和 \`|=\` 运算符合并字典
- 视图对象：\`d.keys() / d.values() / d.items()\` 动态反映原 dict
- 字典推导式：\`{k: v for k, v in ...}\`
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
- 无序、不重复、可变；\`frozenset\` 不可变版本
- 增删：\`add/remove/discard/pop/clear\`
- 集合运算：\`| union\`、\`& intersection\`、\`- difference\`、\`^ symmetric_difference\`
- 判断：\`issubset / issuperset / isdisjoint\`
- 集合推导式：\`{x for x in seq if cond}\`
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
