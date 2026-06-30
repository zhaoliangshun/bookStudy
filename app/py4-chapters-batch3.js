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
## 概念解释

\`def\` 是 Python 定义函数的关键字。函数把一段可复用逻辑"打包"起来：给定名字、接收输入(参数)、产出输出(返回值)。它解决的核心问题是**避免重复代码、提升可读性、便于测试与维护**。

基本语法：

\`\`\`python
def 函数名(参数列表):
    """docstring(可选)"""
    函数体
    return 返回值(可选)
\`\`\`

- **return 返回值**：\`return\` 把对象返回给调用方；执行后函数立即结束。
- **无 return 返回 None**：函数体执行完没遇到 return，Python 自动 \`return None\`。
- **多返回值**：\`return a, b\` 看似返回多个值，实际返回**一个 tuple**，配合 \`lo, hi = f(...)\` 解包使用。
- **docstring**：函数体第一行的三引号字符串，存入 \`fn.__doc__\`，被 \`help(fn)\` 显示。常用风格有 **Google 风格**和 **Sphinx/reST 风格**。
- **函数是一等公民**：可赋值给变量、可当参数传递、可当返回值，因为函数本质是 \`function\` 对象。
- **类型注解**：\`def f(x: int) -> str:\` 标注参数与返回类型；注解只是元信息，运行时**不强制检查**，需配合 mypy/pyright 做静态检查。

## 设计原理

- **为什么用 \`def\` 而非匿名语法**：显式关键字让函数定义视觉突出、便于扫描；函数体是语句块(可多行)，比 lambda 单表达式更强大。
- **为什么 return 是显式的**：Python 不自动把"最后一个表达式"作为返回值，而要求 \`return\`，让"是否返回、返回什么"完全由开发者控制，语义清晰。
- **为什么无 return 返回 None**：统一函数返回值类型，调用方不必猜测，任何函数调用都是表达式、永远有值。
- **为什么函数是一等公民**：函数本质是对象，和数字、字符串一样可赋值、传参、返回，这支撑了函数式编程与高阶函数。
- **为什么注解不强制运行时检查**：保持运行时性能与灵活性，把类型检查交给静态工具，避免破坏动态语言特性。

## 使用场景

- **用**：逻辑被复用 ≥ 2 次；一段代码超过 20 行需要拆分；需要给一段逻辑命名以提升可读性；作为回调传给高阶函数。
- **不用**：一次性、3-5 行的简单脚本；性能敏感的内层循环(函数调用有开销)，可考虑内联或用局部变量缓存。

## 代码逐行讲解

\`\`\`python
def greet(name, greeting="Hello"):
    """返回问候语。这是 docstring，help(greet) 会显示。"""
    return f"{greeting}, {name}!"
\`\`\`
- \`def greet(name, greeting="Hello"):\` 定义函数 \`greet\`，\`name\` 是位置参数，\`greeting\` 有默认值 \`"Hello"\`。
- 紧贴函数体第一行的三引号字符串是 **docstring**，存入 \`greet.__doc__\`，\`help(greet)\` 会显示。
- \`return f"{greeting}, {name}!"\` 用 f-string 拼接并返回；执行 return 后函数立即结束。

\`\`\`python
print(greet("Alice"))
print(greet("Bob", greeting="Hi"))
\`\`\`
- 第一行只传位置参数，\`greeting\` 取默认值。
- 第二行用关键字方式给 \`greeting\` 赋值，与位置无关。

\`\`\`python
def min_max(nums):
    return min(nums), max(nums)

lo, hi = min_max([3, 1, 4, 1, 5, 9, 2, 6])
\`\`\`
- \`return min(nums), max(nums)\` 实际返回**一个 tuple** \`(min, max)\`。
- \`lo, hi = ...\` 是 **tuple 解包**，把 tuple 两个元素分别赋给 lo、hi，本质是"返回 tuple + 解包"的语法糖。

\`\`\`python
def add(a, b):
    return a + b
fn = add
print(fn(3, 5), fn.__name__)    # 8 add
\`\`\`
- \`fn = add\` 把函数对象赋给新变量 \`fn\`，**没有调用**函数(无括号)。
- \`fn(3, 5)\` 通过新名字调用同一个函数对象。
- \`fn.__name__\` 仍是 \`"add"\`，函数对象本身没变，只是多了一个引用。

\`\`\`python
def combine(a: int, b: int) -> str:
    return str(a + b)
\`\`\`
- \`a: int\` 标注参数 a 期望为 int；\`-> str\` 标注返回值期望为 str。
- 注解**只是元信息**，运行时 Python **不检查**类型，\`combine("a", "b")\` 不会报错。
- 注解存于 \`combine.__annotations__\`，供 mypy/pyright 等静态检查工具使用。

\`\`\`python
def noop():
    pass
print(noop())                    # None
\`\`\`
- \`pass\` 是空语句，函数体执行完没有 return，Python 自动 \`return None\`。
- 调用结果为 \`None\`，print 打印 \`None\`。

## 对比：def vs lambda

| 特性 | def 函数 | lambda |
|---|---|---|
| 语句/表达式 | 语句(可多行) | 表达式(单行) |
| 函数名 | 必须有 | 匿名(可赋值) |
| docstring | 支持 | 不支持 |
| 适合逻辑 | 复杂逻辑 | 简单单表达式 |
| 复用性 | 强 | 弱(一次性) |

## 易错点小结

| 坑 | 错误写法 | 正确做法 |
|---|---|---|
| 忘记 return | \`def f(): x=1\` 期望返回 x | 显式 \`return x\` |
| 多返回值误解 | 把 \`return a, b\` 当成两个对象 | 记住它是一个 tuple |
| 注解当运行时检查 | 期望 \`f("x")\` 报错 | 用 mypy 静态检查 |
| docstring 位置错 | 放在函数体第二行 | 必须是函数体第一条语句 |
| 调用 vs 引用混淆 | \`fn = add()\` 调用了 | \`fn = add\` 只引用 |
| 可变默认值 | \`def f(x, ls=[])\` | \`def f(x, ls=None)\`(见下章) |
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
## 概念解释

Python 函数参数有 **5 种形态**，这是 Python 参数系统比很多语言更灵活(也更复杂)的地方：

1. **位置参数(positional)**：\`def f(a, b)\` —— 按顺序传，调用 \`f(1, 2)\`。
2. **默认参数(default)**：\`def f(a, b=10)\` —— 有默认值，可不传。
3. **仅关键字参数(keyword-only)**：\`def f(a, *, key)\` —— \`*\` 之后的参数必须用 \`key=value\` 传。
4. **\`*args\`**：收集多余的位置参数为 tuple。
5. **\`**kwargs\`**：收集多余的关键字参数为 dict。

**参数顺序规则**(从左到右，违反则 SyntaxError)：

\`\`\`python
def f(位置参数, 默认参数, *args, 仅关键字参数(可带默认), **kwargs):
    ...
\`\`\`

记忆口诀：**位置 → *args → 仅关键字 → **kwargs**。

**解包传参**：\`f(*[1,2])\` 把列表展开为位置参数；\`f(**{"a":1})\` 把字典展开为关键字参数。

## 设计原理

- **为什么允许默认值**：让 API 向后兼容，新参数加默认值不破坏旧调用。
- **为什么有 keyword-only**：强制调用方写出参数名，避免位置参数过多时传错位。如 \`sorted(lst, key=..., reverse=True)\` 用关键字更清晰。
- **为什么 *args/**kwargs 是 tuple/dict 而非 list**：tuple 不可变，避免函数内修改影响调用方；dict 是天然的关键字容器。
- **为什么默认值在定义时求值**：Python 在 \`def\` 执行时一次性求值默认表达式并存入 \`__defaults__\`，所有调用共享同一对象——这是性能与简洁的权衡，但带来了"可变默认值陷阱"。

## 使用场景

- **默认参数**：大多数可选配置(如 \`print(*args, sep=' ', end='\\n')\`)。
- **仅关键字**：参数多、易混淆的 API；后续要扩展参数不破坏旧位置调用。
- **\`*args\`**：参数数量不固定(如 \`max(1,2,3)\`、\`print\`)。
- **\`**kwargs\`**：透传配置(如 wrapper 装饰器、\`dict.update\`)。
- **不用**：参数固定且少时直接用位置参数最简单，不要滥用 *args。

## 代码逐行讲解

\`\`\`python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"
print(greet("Alice"), greet("Bob", greeting="Hi"))
\`\`\`
- \`greeting="Hello"\` 是默认参数，必须放在非默认参数 \`name\` **之后**。
- \`greet("Alice")\` 省略 greeting 取默认值；\`greet("Bob", greeting="Hi")\` 用关键字覆盖。

\`\`\`python
def log(*args, prefix="[LOG]", **kwargs):
    print(prefix, args, kwargs)
log("a", "b", prefix="[INFO]", level=2, user="alice")
\`\`\`
- \`*args\` 收集所有"多余位置参数"为 tuple \`("a", "b")\`。
- \`prefix="[INFO]"\` 是 keyword-only 默认参数(在 \`*args\` 之后)，必须用关键字传。
- \`**kwargs\` 收集所有"多余关键字参数"为 dict \`{"level": 2, "user": "alice"}\`。
- 输出：\`[INFO] ('a', 'b') {'level': 2, 'user': 'alice'}\`。

\`\`\`python
def create_user(name, *, age, role="user"):
    return {"name": name, "age": age, "role": role}
print(create_user("alice", age=30))
\`\`\`
- \`*\` 之后的是仅关键字参数，\`age\`、\`role\` 必须用关键字传。
- \`create_user("alice", 30)\` 会报 \`TypeError\`——强制 API 清晰，避免 30 被误当 role。
- 在布尔参数易混淆、参数多的场景尤其有用。

\`\`\`python
def add3(a, b, c):
    return a + b + c
print(add3(*[1, 2, 3]))                   # 等价 add3(1, 2, 3)
print(add3(**{"a": 1, "b": 2, "c": 3}))   # 等价 add3(a=1, b=2, c=3)
\`\`\`
- \`*list\` 把列表元素展开为位置参数；\`**dict\` 把字典展开为关键字参数。
- 键名必须与形参名匹配，否则 \`TypeError\`。

\`\`\`python
# 可变默认值的陷阱
def bad(x, items=[]):
    items.append(x)
    return items
print(bad(1), bad(2))               # [1] [1, 2] ← 共享同一个列表！
\`\`\`
- 默认值 \`[]\` 在 \`def bad\` 执行时**创建一次**，之后所有调用复用**同一个列表对象**。
- 第一次 \`bad(1)\` 返回 \`[1]\`，但这个列表存在 \`bad.__defaults__\` 里；第二次 \`bad(2)\` 在**同一个列表**上 append，变成 \`[1, 2]\`。
- 这是 Python 最经典的坑之一。

\`\`\`python
# 正确写法：用 None 哨兵
def good(x, items=None):
    if items is None:
        items = []
    items.append(x)
    return items
print(good(1), good(2))             # [1] [2]
\`\`\`
- 默认值用 \`None\`(不可变，所有调用共享同一个 None 无副作用)。
- 函数体内判断 \`items is None\` 时**新建**空 list，每次调用独立。
- 用 \`is None\` 而非 \`== None\`，因为 \`==\` 可能被自定义 \`__eq__\` 干扰。

## 对比：5 种参数类型

| 参数类型 | 调用方式 | 收集/展开 | 典型用途 |
|---|---|---|---|
| 位置参数 | \`f(1)\` | — | 必填核心参数 |
| 默认参数 | \`f()\` 或 \`f(1)\` | — | 可选配置 |
| 仅关键字 | \`f(key=1)\` | — | API 清晰、防误用 |
| *args | \`f(1,2,3)\` | 收成 tuple | 变长位置 |
| **kwargs | \`f(a=1,b=2)\` | 收成 dict | 变长关键字/透传 |

## 易错点小结

| 坑 | 错误写法 | 正确做法 |
|---|---|---|
| 可变默认值 | \`def f(ls=[])\` | \`def f(ls=None)\` + 内部新建 |
| 默认参数顺序 | \`def f(a=1, b)\` | 默认参数放后面 \`def f(b, a=1)\` |
| 仅关键字忘了 \`*\` | \`def f(a, key)\` 想强制关键字 | \`def f(a, *, key)\` |
| 解包键名不匹配 | \`add3(**{"x":1})\` | 键名必须等于形参名 |
| \`== None\` 判断 | \`if items == None:\` | \`if items is None:\` |
| 滥用 *args | 固定参数也用 *args | 固定参数显式声明 |
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
## 概念解释

\`lambda\` 是 Python 的**匿名函数表达式**，语法：

\`\`\`python
lambda 参数列表: 表达式
\`\`\`

它等价于一个只有 \`return 表达式\` 的 \`def\`，但**没有名字、只能是单个表达式、不能含语句**(如 if/for/while 语句块、赋值语句)。

- **高阶函数**：接收函数作为参数、或返回函数的函数。Python 中函数是一等公民，所以高阶函数很自然。
- **闭包**：内层函数引用了外层函数的变量，即使外层已返回，内层仍能访问那些变量——这种"携带了环境的函数"叫闭包。

## 设计原理

- **为什么 lambda 限单表达式**：Python 有意限制 lambda 能力，鼓励复杂逻辑用 \`def\` 命名，让代码更可读、可调试、可测试。Guido 多次反对给 lambda 加多行能力。
- **为什么需要匿名函数**：在 \`sorted\`、\`map\`、\`filter\` 等场景下只需要一个"一次性小函数"，专门起名反而冗余。
- **为什么闭包能"记住"外层变量**：函数对象内部维护 \`__closure__\`(一个 cell 引用元组)，指向被捕获的自由变量，使外层栈帧变量不被回收。

## 使用场景

- **适合 lambda**：\`sorted(key=...)\`、\`map\`、\`filter\`、\`functools.reduce\`、回调(\`Button(command=...)\`)、字典排序的简单 key。
- **不适合 lambda**：逻辑超过 1 行；需要循环/异常处理/多语句；会被多处复用；需要 docstring；可读性差——这些一律用 \`def\`。
- **高阶函数典型**：装饰器、\`sorted\`、\`map/filter/reduce\`、回调注册、工厂函数(返回函数)。

## 代码逐行讲解

\`\`\`python
square = lambda x: x * x
add = lambda a, b: a + b
print(square(7), add(3, 5))    # 49 8
\`\`\`
- \`lambda x: x * x\` 定义匿名函数并赋给 \`square\`，之后可像普通函数调用。
- 也可直接传给高阶函数而不命名：\`sorted(lst, key=lambda x: -x)\`。
- 注意：给 lambda 起名(\`square = lambda...\`)通常不如 \`def square(x): return x*x\`，后者有名字和 docstring。

\`\`\`python
users = [
    {"name": "bob", "age": 30},
    {"name": "alice", "age": 25},
    {"name": "carol", "age": 28},
]
by_age = sorted(users, key=lambda u: u["age"])
by_name = sorted(users, key=lambda u: u["name"])
\`\`\`
- \`sorted\` 是高阶函数，\`key\` 参数接收一个函数，对每个元素调用得到"排序键"。
- \`lambda u: u["age"]\` 从每个用户字典取出 age 作为排序依据。
- 不用 lambda 的话要单独 \`def get_age(u): return u["age"]\`，对一次性逻辑偏重。

\`\`\`python
def make_multiplier(n):
    return lambda x: x * n

double = make_multiplier(2)
triple = make_multiplier(3)
print(double(5), triple(5))    # 10 15
\`\`\`
- \`make_multiplier\` 是高阶函数：**返回一个函数**。
- \`make_multiplier(2)\` 返回的 lambda 捕获了外层变量 \`n=2\`，形成闭包。
- \`double(5)\` 调用时 \`x=5, n=2\`(从闭包环境取)，返回 10。

\`\`\`python
def counter():
    count = 0
    def inc():
        nonlocal count
        count += 1
        return count
    return inc

c = counter()
print(c(), c(), c())           # 1 2 3
\`\`\`
- \`counter()\` 执行后返回内层 \`inc\`，但 \`inc\` 仍持有对外层 \`count\` 的引用(闭包)。
- \`nonlocal count\` 声明：内层要**修改**外层 \`count\`(不是新建局部变量)。没有这句会 \`UnboundLocalError\`。
- 每次 \`c()\` 都修改同一个 count，实现"计数器"状态，是闭包携带可变状态的经典用法。

## 闭包陷阱：延迟绑定

\`\`\`python
fs = [lambda: i for i in range(3)]
print([f() for f in fs])   # [2, 2, 2] 不是 [0, 1, 2]！
\`\`\`
- lambda 捕获的是变量 \`i\` 的**引用**，不是值。
- for 循环结束时 \`i == 2\`，所有 lambda 调用时都读到 2。
- 正确写法：\`lambda i=i: i\`(用默认参数在定义时绑定值)。

## 对比：lambda vs def

| 特性 | lambda | def |
|---|---|---|
| 形式 | 表达式 | 语句 |
| 函数体 | 单表达式 | 多语句 |
| 名字 | 匿名(可赋值) | 必须命名 |
| docstring | 无 | 有 |
| 复杂逻辑 | 不支持 | 支持 |
| 适用 | 一次性小函数 | 命名/复杂逻辑 |

## 易错点小结

| 坑 | 错误写法 | 正确做法 |
|---|---|---|
| lambda 写复杂逻辑 | \`lambda x: (a=x; ...)\` | 改用 def |
| 闭包延迟绑定 | \`lambda: i\` 在循环里 | \`lambda i=i: i\` |
| 给 lambda 起名 | \`f = lambda x: x\` | \`def f(x): return x\` |
| 忘记 nonlocal | 闭包内改外层变量报错 | 加 \`nonlocal\` |
| 误以为 lambda 慢 | 性能和 def 一样 | 按可读性选 |
| map/filter 滥用 | 嵌套 map/filter 难读 | 简单场景用列表推导 |
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
## 概念解释

**作用域(scope)**：变量名在哪些范围内可见。Python 用 **LEGB** 规则决定查找顺序：

- **L (Local)**：当前函数内部的局部变量。
- **E (Enclosing)**：外层嵌套函数的变量(闭包场景)。
- **G (Global)**：模块顶层定义的全局变量。
- **B (Built-in)**：Python 内置名(\`len\`、\`print\`、\`int\`、\`Exception\` 等)。

查找顺序：**L → E → G → B**，找到就停；全找不到则 \`NameError\`。

- **\`global\`**：在函数内声明"我要修改的是全局变量"，而非新建局部变量。
- **\`nonlocal\`**：在内层函数声明"我要修改的是外层(非全局)变量"。
- **只读不需要声明**：读操作只是按 LEGB 查找，不涉及"在哪里创建"，所以无需声明。
- **尽量少用 global/nonlocal**：用返回值或类封装状态代替，避免共享可变状态带来的难以推理、难以测试、不可重入问题。

## 设计原理

- **为什么默认函数内赋值是局部**：避免函数内意外污染外部状态，让函数行为可预测、可重入，这是 Python 默认的安全策略。
- **为什么需要 global/nonlocal 声明**：既然默认局部，就需要显式声明来"覆盖"默认行为，表明"我确实要改外层"，遵循显式优于隐式。
- **为什么只读不需要声明**：读操作只是查找 LEGB，不涉及"在哪里创建变量"，所以无需声明。
- **为什么尽量少用 global**：全局可变状态让程序难以推理、难以测试、不可重入；函数式风格(返回值)或面向对象(类封装状态)更安全。

## 使用场景

- **global**：模块级配置、单例计数器(但更推荐用类)。函数内确实需要修改模块全局时。
- **nonlocal**：闭包维护私有状态(如计数器、装饰器中包装函数的调用次数)。
- **不用 global/nonlocal 的替代**：
  - 用返回值：\`def inc(c): return c+1\` 而非 \`global c; c+=1\`。
  - 用类：\`class Counter: ...\` 把状态封装在实例。
  - 用可变容器(列表/dict)作为闭包变量，无需 nonlocal 也能改其内容(因为没有重新赋值)。

## 代码逐行讲解

\`\`\`python
x = "global"

def outer():
    x = "outer"
    def inner():
        # 只读：可以访问外层 x，不需要 nonlocal
        print("inner read:", x)
    inner()

outer()
\`\`\`
- 顶层 \`x = "global"\` 是 G(全局)。
- \`outer\` 内 \`x = "outer"\` 是 L(outer 的局部)。
- \`inner\` 内 \`print(x)\` 是**读**：按 LEGB 查找，先 L(inner 无)→ E(outer 的 x="outer")，读到 "outer"。
- 因为只读不写，不需要 \`nonlocal\`。

\`\`\`python
# global：修改全局变量
counter = 0
def inc():
    global counter
    counter += 1

inc()
inc()
print("counter:", counter)          # 2
\`\`\`
- 顶层 \`counter = 0\` 是全局。
- \`global counter\` 声明：函数内 \`counter\` 指向全局那个，**赋值会改全局**，而非新建局部。
- 没有 \`global\` 的话，\`counter += 1\` 会因"局部 counter 未赋值就读取"而 \`UnboundLocalError\`。
- 两次调用后全局 counter 变 2。

\`\`\`python
# nonlocal：修改外层(非全局)变量
def make_counter():
    count = 0
    def inc():
        nonlocal count
        count += 1
        return count
    return inc

c = make_counter()
print(c(), c(), c())               # 1 2 3
\`\`\`
- \`make_counter\` 的 \`count\` 是 inc 的 **E(enclosing)** 变量，不是全局。
- \`nonlocal count\` 让内层 inc 能**修改**外层 count(而非新建局部)。
- \`nonlocal\` 与 \`global\` 区别：\`nonlocal\` 找最近的外层函数变量(跳过全局)；\`global\` 直接指模块全局。
- 注意：\`nonlocal\` 不能用在模块顶层(没有外层函数)。

\`\`\`python
# 内置作用域
print("built-in len:", len)
print("built-in max:", max([1, 2, 3]))
\`\`\`
- \`len\`、\`max\` 是 B(built-in)，在 \`builtins\` 模块里，LEGB 最后查找。
- 危险做法：在模块顶层 \`len = 5\` 会**遮蔽**内置 len，本模块后续 \`len([1,2])\` 报错(因为 G 优先于 B)。避免用内置名作变量名。

\`\`\`python
# 演示 LEGB 查找顺序
def demo():
    x = "local"
    print("local x:", x)           # 先找 local

x = "global"
demo()
print("global x:", x)              # 找 global
\`\`\`
- \`demo\` 内有局部 \`x = "local"\`，print 时 L 命中，打印 "local"。
- 模块顶层 \`x = "global"\` 是 G，函数外打印 "global"。
- 若 demo 内未定义 x，则查找会到 G(打印 "global")；若 G 也没有，再到 B。

## 闭包原理

闭包 = 函数 + 它引用的外层变量环境。

\`\`\`python
def make_adder(n):
    def add(x):
        return x + n      # n 是自由变量，来自外层
    return add

add5 = make_adder(5)
print(add5(10))           # 15
\`\`\`
- \`add\` 引用了外层 \`n\`，即使 \`make_adder\` 已返回，\`n\` 仍存活。
- \`add5.__closure__\` 是一个 cell 元组，\`add5.__closure__[0].cell_contents == 5\`。
- 这就是"函数携带环境"的本质。

## 变量查找完整流程(以 \`print(x)\` 为例)

1. 在当前函数 L 查找 \`x\`。
2. 找不到 → 逐层向外层函数 E 查找。
3. 还找不到 → 在模块全局 G 查找。
4. 最后到 builtins B 查找。
5. 全部找不到 → \`NameError: name 'x' is not defined\`。

## 对比：global vs nonlocal

| 特性 | global | nonlocal |
|---|---|---|
| 作用对象 | 模块全局变量 | 外层函数变量(非全局) |
| 使用位置 | 函数内 | 内层函数内 |
| 顶层可用 | 是 | 否(无外层函数) |
| 典型场景 | 模块级配置/单例 | 闭包维护状态 |
| 推荐度 | 少用 | 闭包中合理用 |

## 易错点小结

| 坑 | 错误做法 | 正确做法 |
|---|---|---|
| 函数内改全局未声明 | \`def f(): c+=1\` 报错 | \`global c\` |
| 误用 global 改外层函数变量 | 闭包里用 \`global\` | 用 \`nonlocal\` |
| nonlocal 在顶层用 | 模块级 \`nonlocal x\` | nonlocal 只能在内层函数 |
| 遮蔽内置名 | \`list = [1,2]\` 覆盖 list() | 改名 \`my_list\` |
| 以为读外层要声明 | 读也加 \`global\` | 只读无需声明 |
| 滥用 global | 到处 global 共享状态 | 用返回值/类封装 |
| 闭包延迟绑定 | 循环里 \`lambda: i\` | \`lambda i=i: i\` |
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