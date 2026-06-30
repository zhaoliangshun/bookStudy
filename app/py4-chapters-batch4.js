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
- 可变有序，\`[1, 2, 3]\`
- 增：\`append(x)\` / \`insert(i, x)\` / \`extend(iter)\`
- 删：\`pop(i)\` / \`remove(x)\` / \`del lst[i]\` / \`clear()\`
- 查：\`lst[i]\` / \`lst.index(x)\` / \`count(x)\` / \`len(lst)\`
- 切片：\`lst[start:stop:step]\`，赋值切片可批量替换
- 排序：\`lst.sort()\` 原地 / \`sorted(lst)\` 返回新
- 浅复制：\`lst.copy()\` / \`lst[:]\` / \`list(lst)\`
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
- 不可变有序，\`(1, 2, 3)\`，单元素要写 \`(1,)\`
- 可哈希（可作 dict key / set 元素）
- 支持切片、索引、count、index
- **解包**：\`a, b, c = t\` / \`first, *rest = t\`
- **NamedTuple**：有名字的 tuple，轻量数据类
- 适合：函数多返回值、不可变数据容器
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
- 可变键值对，3.7+ 保证插入顺序
- 创建：\`{"k": v}\` / \`dict(k=v)\` / \`dict([(k, v)])\`
- 取值：\`d["key"]\` / \`d.get("key", default)\`（防 KeyError）
- 增改：\`d["k"] = v\` / \`d.update(d2)\`
- 合并（3.9+）：\`d1 | d2\`（后覆盖前）
- 遍历：\`for k, v in d.items():\`
- 常用：\`keys()\` / \`values()\` / \`items()\` / \`setdefault()\`
- 视图对象：动态反映 dict 变化
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
- 无序去重，\`{1, 2, 3}\`，空集合用 \`set()\` 而非 \`{}\`
- 元素必须可哈希（不可变）
- 集合运算：\`| & - ^\`（并、交、差、对称差）
- 方法：\`add / remove / discard / pop / update\`
- **frozenset**：不可变集合，可哈希
- 适用：去重、成员判断、集合运算
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