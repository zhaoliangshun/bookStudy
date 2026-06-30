// =============================================================
// Batch 3：函数（4 章）
//  9. py4-def          def 定义、参数、返回值、docstring
// 10. py4-args         位置/默认/keyword-only/*args/**kwargs
// 11. py4-lambda       lambda 表达式、高阶函数
// 12. py4-scope        作用域 LEGB、global/nonlocal、闭包
// =============================================================

export const chapters = [
  {
    id: "py4-def",
    group: "函数",
    icon: "🧩",
    title: "函数定义：def、返回值、docstring",
    content: `
- 定义：\`def fn_name(args): ...\`
- 返回值：\`return\` 一个值；无 return 返回 \`None\`
- 多返回值用逗号：\`return a, b\`（实际是 tuple）
- **docstring**：函数下一行三引号，会被 \`help()\` 显示
- 函数是**一等公民**：可赋值给变量、可当参数、可当返回值
- 支持类型注解：\`def f(x: int) -> str:\`
`,
    code: `# 基础函数
def greet(name, greeting="Hello"):
    """返回问候语。这是 docstring，help(greet) 会显示。"""
    return f"{greeting}, {name}!"

print(greet("Alice"))
print(greet("Bob", greeting="Hi"))

# 多返回值
def min_max(nums):
    return min(nums), max(nums)

lo, hi = min_max([3, 1, 4, 1, 5, 9, 2, 6])
print("min =", lo, "max =", hi)

# 函数是对象
def add(a, b):
    return a + b
fn = add
print(fn(3, 5), fn.__name__)    # 8 add

# 类型注解
def combine(a: int, b: int) -> str:
    return str(a + b)

print(combine(1, 2))

# 无 return 返回 None
def noop():
    pass
print(noop())                    # None
`,
  },
  {
    id: "py4-args",
    group: "函数",
    icon: "📥",
    title: "参数：位置、默认、*args、**kwargs",
    content: `
- **位置参数**：按顺序传
- **默认参数**：\`def f(x=1):\`（注意默认值不要用可变对象）
- **仅关键字参数**：\`def f(*, key):\` 星号后必须用关键字传
- \`*args\`：收集多余位置参数为 tuple
- \`**kwargs\`：收集多余关键字参数为 dict
- 参数顺序：\`位置 \` > \`*args\` > \`仅关键字\` > \`**kwargs\`
- 解包：\`f(*[1,2])\` / \`f(**{"a":1})\`
`,
    code: `# 默认参数（注意：默认值不要用可变对象）
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Alice"), greet("Bob", greeting="Hi"))

# *args / **kwargs
def log(*args, prefix="[LOG]", **kwargs):
    print(prefix, args, kwargs)

log("a", "b", prefix="[INFO]", level=2, user="alice")

# 仅关键字参数
def create_user(name, *, age, role="user"):
    return {"name": name, "age": age, "role": role}

print(create_user("alice", age=30))
print(create_user("alice", age=30, role="admin"))

# 解包传参
def add3(a, b, c):
    return a + b + c

print(add3(*[1, 2, 3]))
print(add3(**{"a": 1, "b": 2, "c": 3}))

# 可变默认值的陷阱
def bad(x, items=[]):
    items.append(x)
    return items

print(bad(1), bad(2))               # [1] [1, 2] ← 共享同一个列表！

# 正确写法
def good(x, items=None):
    if items is None:
        items = []
    items.append(x)
    return items
print(good(1), good(2))             # [1] [2]
`,
  },
  {
    id: "py4-lambda",
    group: "函数",
    icon: "λ",
    title: "lambda 表达式与高阶函数",
    content: `
- lambda：单表达式匿名函数，\`lambda x: x * x\`
- 适用场景：sorted 的 key、map/filter 的参数、回调
- 不适合：复杂逻辑（超过 1 行 → 用 def）
- 高阶函数：接收/返回函数的函数
- 闭包：内层函数访问外层变量
`,
    code: `# lambda 基础
square = lambda x: x * x
add = lambda a, b: a + b
print(square(7), add(3, 5))

# sorted 的 key 参数
users = [
    {"name": "bob", "age": 30},
    {"name": "alice", "age": 25},
    {"name": "carol", "age": 28},
]
by_age = sorted(users, key=lambda u: u["age"])
by_name = sorted(users, key=lambda u: u["name"])
print("by_age:", [u["name"] for u in by_age])
print("by_name:", [u["name"] for u in by_name])

# 高阶函数：返回函数
def make_multiplier(n):
    return lambda x: x * n

double = make_multiplier(2)
triple = make_multiplier(3)
print(double(5), triple(5))    # 10 15

# 闭包
def counter():
    count = 0
    def inc():
        nonlocal count
        count += 1
        return count
    return inc

c = counter()
print(c(), c(), c())           # 1 2 3
`,
  },
  {
    id: "py4-scope",
    group: "函数",
    icon: "🔭",
    title: "作用域：LEGB、global、nonlocal",
    content: `
- **LEGB** 规则：Local → Enclosing → Global → Built-in
- \`global\`：在函数内修改全局变量
- \`nonlocal\`：在内层函数修改外层（非全局）变量
- 函数内只读不写 → 不需要 global/nonlocal
- 尽量少用 global/nonlocal，用返回值或类代替
`,
    code: `x = "global"

def outer():
    x = "outer"
    def inner():
        # 只读：可以访问外层 x，不需要 nonlocal
        print("inner read:", x)
    inner()

outer()

# global：修改全局变量
counter = 0
def inc():
    global counter
    counter += 1

inc()
inc()
print("counter:", counter)          # 2

# nonlocal：修改外层（非全局）变量
def make_counter():
    count = 0
    def inc():
        nonlocal count
        count += 1
        return count
    return inc

c = make_counter()
print(c(), c(), c())               # 1 2 3

# 内置作用域
print("built-in len:", len)
print("built-in max:", max([1, 2, 3]))

# 演示 LEGB 查找顺序
def demo():
    x = "local"
    print("local x:", x)           # 先找 local

x = "global"
demo()
print("global x:", x)              # 找 global
`,
  },
];