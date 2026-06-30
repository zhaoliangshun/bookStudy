// =============================================================
// 第二批章节（核心，4 章）
// 5. controlflow         if/for/while/match-case
// 6. functions           def / lambda / 参数 / 装饰器入门
// 7. collections         list / tuple / dict / set
// 8. comprehensions      列表/字典/集合推导 + 生成器表达式
// =============================================================

export const chapters = [
  {
    id: "py3-controlflow",
    group: "核心",
    icon: "🔀",
    title: "控制流：if / for / while / match-case",
    content: `
# 控制流

- **if / elif / else**：注意 \`elif\`，不是 \`else if\`
- **for**：遍历可迭代对象（list / str / dict / range / 文件句柄）
- **while**：条件循环
- **break / continue / pass**：break 跳出、continue 跳到下次、pass 占位
- **match-case**（3.10+）：模式匹配，比一长串 if/elif 更清晰
- **range(start, stop, step)**：惰性整数序列
- **enumerate**：同时拿索引和元素；**zip**：并行遍历多个序列
`,
    code: `# if / elif / else
score = 85
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 60:
    grade = "C"
else:
    grade = "F"
print(f"score={score}, grade={grade}")

# for + range / enumerate / zip
for i in range(3):
    print("i =", i)

names = ["alice", "bob", "carol"]
for idx, name in enumerate(names, start=1):
    print(f"{idx}. {name}")

ages = [30, 25, 28]
for name, age in zip(names, ages):
    print(f"{name} is {age}")

# while + break/continue
n = 0
while n < 10:
    n += 1
    if n % 2 == 0:
        continue
    if n > 7:
        break
    print("odd:", n)

# match-case（3.10+）：结构模式匹配
def http_status(code):
    match code:
        case 200:
            return "OK"
        case 301 | 302:
            return "Redirect"
        case 404:
            return "Not Found"
        case 500:
            return "Server Error"
        case _:
            return "Unknown"

for c in [200, 301, 404, 418, 500]:
    print(c, "->", http_status(c))

# match + 解构（list/tuple/dict 模式）
def describe(point):
    match point:
        case (0, 0):
            return "origin"
        case (x, 0):
            return f"x-axis at {x}"
        case (0, y):
            return f"y-axis at {y}"
        case (x, y):
            return f"point ({x}, {y})"

print(describe((0, 0)))
print(describe((3, 0)))
print(describe((1, 2)))
`,
  },

  {
    id: "py3-functions",
    group: "核心",
    icon: "🧩",
    title: "函数：def / lambda / 参数 / 返回",
    content: `
# 函数

- 定义：\`def fn(a, b=1, *args, **kwargs): ...\`
- 参数类型：
  - 位置参数、默认参数
  - \`*args\` 收集多余位置参数为 tuple
  - \`**kwargs\` 收集多余关键字参数为 dict
  - 仅关键字参数 \`def f(*, key)\` 之后必须用关键字传
- 返回：\`return\` 一个值（元组自动解包可返回多个）
- **类型注解**（3.5+，3.12+ 新语法 PEP 695）：\`def f(x: int) -> str: ...\`
- **lambda**：匿名单表达式函数
- **文档字符串**：函数下用三引号写 docstring
`,
    code: `# 基础函数
def greet(name, greeting="Hello"):
    """返回问候语（docstring，会被 help() 显示）"""
    return f"{greeting}, {name}!"

print(greet("Alice"))
print(greet("Bob", greeting="Hi"))

# *args / **kwargs
def log(*args, prefix="[LOG]", **kwargs):
    print(prefix, args, kwargs)

log("a", "b", prefix="[INFO]", level=2, user="alice")

# 仅关键字参数
def create_user(name, *, age, role="user"):
    return {"name": name, "age": age, "role": role}

# print(create_user("alice", 30))              # TypeError: 缺少关键字参数 age
print(create_user("alice", age=30))
print(create_user("alice", age=30, role="admin"))

# 类型注解（3.12+ 新风格在 PEP 695 章单独讲）
def add(a: int, b: int) -> int:
    return a + b

print(add(1, 2))

# 多返回值（实际是 tuple）
def min_max(nums):
    return min(nums), max(nums)

lo, hi = min_max([3, 1, 4, 1, 5, 9, 2, 6])
print("min=", lo, "max=", hi)

# lambda
square = lambda x: x * x
print(square(7))

# lambda + sorted
users = [{"name": "bob", "age": 30}, {"name": "alice", "age": 25}, {"name": "carol", "age": 28}]
print(sorted(users, key=lambda u: u["age"]))
`,
  },

  {
    id: "py3-collections",
    group: "核心",
    icon: "🗂️",
    title: "集合类型：list / tuple / dict / set",
    content: `
# 集合类型

- **list**：可变有序，\`[1, 2, 3]\`
- **tuple**：不可变有序，\`(1, 2, 3)\`，单元素要写 \`(1,)\`
- **dict**：键值对，3.7+ 保证插入顺序
- **set**：无序去重，\`{1, 2, 3}\`
- 公共操作：\`len / in / min / max / sorted\`
- 不可变版：\`frozenset\`、命名元组 \`NamedTuple\`
`,
    code: `# list
lst = [3, 1, 4, 1, 5, 9, 2, 6]
lst.append(5)
lst.extend([3, 5])
lst.insert(0, 0)
print(lst, lst[2:5], lst[::-1])  # 切片 / 倒序
lst.sort()
print(lst)

# tuple（不可变，可哈希）
t = (1, 2, 3)
single = (1,)        # 注意逗号
print(t, single, t.count(2), t.index(3))

# 解包
a, b, c = t
print(a, b, c)
first, *mid, last = [1, 2, 3, 4, 5]
print(first, mid, last)

# dict
d = {"name": "alice", "age": 30, "city": "Beijing"}
d["email"] = "alice@example.com"   # 新增/覆盖
print(d["name"], d.get("phone", "N/A"))  # get 防止 KeyError
print({k: v for k, v in d.items() if len(str(v)) < 10})

# 合并 dict（3.9+）
d2 = {"age": 31, "city": "Shanghai"}
merged = d | d2
print(merged)

# set（去重 + 集合运算）
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
print(a | b, a & b, a - b, a ^ b)  # 并 交 差 对称差

# frozenset（不可变集合，可哈希）
fs = frozenset([1, 2, 3])
print(fs, isinstance(fs, frozenset))
`,
  },

  {
    id: "py3-comprehensions",
    group: "核心",
    icon: "✨",
    title: "推导式：list/dict/set + 生成器",
    content: `
# 推导式

- **列表推导**：\`[expr for x in iter if cond]\`
- **字典推导**：\`{k: v for ...}\`
- **集合推导**：\`{expr for ...}\`
- **生成器表达式**：\`(expr for ...)\`，惰性求值、节省内存
- **嵌套**：可多层 for，但避免过深（影响可读性）
`,
    code: `# 列表推导
nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
squares = [x * x for x in nums]
evens = [x for x in nums if x % 2 == 0]
print(squares, evens)

# 嵌套
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [v for row in matrix for v in row]
print(flat)

# 字典推导
names = ["alice", "bob", "carol"]
lengths = {n: len(n) for n in names}
print(lengths)

# 集合推导（去重）
words = ["hello", "world", "hello", "python"]
unique_lens = {len(w) for w in words}
print(unique_lens)

# 生成器表达式（惰性，省内存）
gen = (x * x for x in range(10_000_000))
print(type(gen), next(gen), next(gen))
# 适合和 sum/max/min 配合
print(sum(x * x for x in range(100)))   # 328350
print(max(x for x in range(100) if x % 7 == 0))

# 推导 vs map/filter（推导更 Pythonic）
nums = [1, 2, 3, 4]
squares_lambda = list(map(lambda x: x * x, nums))
evens_lambda = list(filter(lambda x: x % 2 == 0, nums))
print(squares_lambda, evens_lambda)
`,
  },
];
