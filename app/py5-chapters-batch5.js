// =============================================================
// Batch 5：函数（4 章）
// 1. py5-def     def 基础、参数、返回值、文档字符串、类型提示
// 2. py5-args    参数：位置/默认/*args/**kwargs/仅限关键字/解包
// 3. py5-lambda  lambda、sorted/map/filter、闭包、返回函数
// 4. py5-hof     高阶函数：函数作参数/返回值、偏函数、组合
// =============================================================

export const chapters = [
  {
    id: "py5-def",
    group: "函数",
    icon: "🔧",
    title: "def 基础与类型提示",
    content: `
## 概述
\`def\` 是 Python 定义函数的关键字，函数是一等公民，可作为参数传递、作为返回值。配合文档字符串（docstring）和类型提示（PEP 484），能写出可读性强、便于 IDE 与 mypy 静态检查的代码；Python 3.12+ 进一步强化了类型系统（PEP 695 引入 \`type X = ...\` 新型别名语法）。

## 核心要点
- **函数定义**：\`def name(params): body\`，缩进 4 空格决定函数体；无 \`return\` 时默认返回 \`None\`
- **多返回值**：\`return a, b\` 实际返回 tuple，可用 \`x, y = func()\` 解包
- **文档字符串**：函数体首行字符串 \`"""..."""\`，通过 \`help(f)\` 或 \`f.__doc__\` 访问；推荐 Google/NumPy 风格
- **类型提示（PEP 484）**：\`def add(a: int, b: int) -> int:\`，注解存入 \`f.__annotations__\`
- **运行时不强制**：类型提示只是元数据，传错类型不会报错；需配合 \`mypy\` / \`pyright\` 静态检查
- **PEP 695（3.12+）**：\`type Point = tuple[float, float]\` 新型别名语法；泛型直接写 \`def f[T](x: T) -> T:\` 而非 \`TypeVar\`
- **\`from __future__ import annotations\`**：让注解延迟求值（变为字符串），避免循环导入

## 原理与机制
- **函数对象**：\`def\` 执行时创建一个 \`function\` 对象并绑定到函数名，函数名只是标签
- **\`__annotations__\` 存储**：参数注解存为 dict，键为参数名，返回值注解存在 \`"return"\` 键下
- **docstring 位置**：必须是函数体第一条语句（字符串字面量），否则不会成为 \`__doc__\`
- **可调用性**：任何定义了 \`__call__\` 的对象都可像函数一样调用，\`callable(f)\` 判断

## 易错点与陷阱
- **类型提示非运行时检查**：\`add("a", "b")\` 即使注解为 \`int\` 也不会报错，仅靠 mypy 静态检查发现
- **可变默认值陷阱**：\`def f(x=[])\` 的 \`[]\` 只创建一次，多次调用共享同一个列表（详见参数章节）
- **\`return\` 漏写**：函数只写计算不 \`return\`，结果是 \`None\`，常见于新手把 \`return\` 写成 \`print\`
- **docstring 不在首行**：注释 \`# ...\` 或空行在字符串之前，\`__doc__\` 会变为 \`None\`

## 实战建议
- 公共函数必写 docstring，至少说明 \`Args\` / \`Returns\`，IDE 悬浮提示能直接展示
- 类型注解配合 \`mypy --strict\` 在 CI 中检查，能在提交前发现大量 bug
- 多返回值优先用 \`NamedTuple\` 或 \`dataclass\` 替代裸 tuple，避免调用方靠位置猜含义
- 复杂类型可从 \`typing\` 导入（\`Callable/Optional\`）或直接用 3.9+ 内置泛型（\`list[int]/dict[str, int]\`）
`,
    code: `# 基础函数定义
def greet(name: str) -> str:
    """返回问候语。

    Args:
        name: 用户名
    Returns:
        问候字符串
    """
    return f"你好, {name}!"

print(greet("小明"))
print("greet.__doc__:", greet.__doc__[:20], "...")

# 多返回值 - 自动打包为 tuple
def min_max(numbers: list[int]) -> tuple[int, int]:
    """同时返回最小值和最大值"""
    return min(numbers), max(numbers)

nums = [3, 1, 4, 1, 5, 9, 2, 6]
lo, hi = min_max(nums)
print(f"min: {lo}, max: {hi}")

# 默认返回 None
def no_return():
    x = 1 + 1

result = no_return()
print("无 return 时返回:", result)

# 类型注解存储在 __annotations__
print("注解:", greet.__annotations__)
`,
  },
  {
    id: "py5-args",
    group: "函数",
    icon: "📋",
    title: "函数参数详解",
    content: `
## 概述
Python 函数参数机制非常灵活：支持位置参数、关键字参数、默认值、\`*args\` 收集可变位置参数、\`**kwargs\` 收集可变关键字参数，以及 PEP 3102 引入的仅限关键字参数（\`*\` 之后）和 PEP 570（3.8+）的仅限位置参数（\`/\` 之前）。理解参数传递规则与可变默认值陷阱，是写出可靠函数的关键。

## 核心要点
- **位置参数与关键字参数**：\`f(1, 2)\` 按位置；\`f(a=1, b=2)\` 按名字；调用时可混用，但位置参数必须在前
- **默认值**：\`def f(a, b=10)\`，有默认值的参数必须排在无默认值参数之后
- **\`*args\` 收集**：多余的位置参数被打包成 tuple，如 \`def f(*args)\` 收 \`f(1, 2, 3)\` 为 \`(1, 2, 3)\`
- **\`**kwargs\` 收集**：多余的关键字参数被打包成 dict，如 \`def f(**kw)\` 收 \`f(x=1, y=2)\` 为 \`{"x": 1, "y": 2}\`
- **仅限关键字参数**：\`def f(a, *, b)\` 中 \`b\` 必须用关键字传递，\`f(1, b=2)\` 合法但 \`f(1, 2)\` 报错
- **仅限位置参数（3.8+）**：\`def f(a, /, b)\` 中 \`a\` 必须用位置传递，不能用 \`a=1\`
- **解包调用**：\`f(*[1, 2])\` 等价于 \`f(1, 2)\`；\`f(**{"x": 1})\` 等价于 \`f(x=1)\`

## 原理与机制
- **参数传递即赋值**：调用时实参被绑定到形参名，本质是"名字 → 对象引用"，没有 C 的值传递/引用传递之分
- **默认值只求值一次**：\`def f(x=[])\` 的 \`[]\` 在函数定义时创建，所有调用共享，这是可变默认值陷阱的根因
- **\`*args\` / \`**kwargs\` 仅在调用时打包/解包**：函数内部拿到的是 tuple / dict，修改不影响调用方
- **参数顺序规则**：\`positional / *args / keyword-only / **kwargs\`，即 位置 → 收集位置 → 仅限关键字 → 收集关键字

## 易错点与陷阱
- **可变默认值陷阱**：\`def f(x=[])\` 多次调用共享同一 list，第二次调用会看到上次的修改；改用 \`x=None\` + 函数体内 \`x = []\`
- **默认值求值时机**：\`def f(x=time.time())\` 的 \`time.time()\` 在定义时执行一次，不会每次调用都更新
- **\`**kwargs\` 必须在最后**：\`def f(**kw, a)\` 语法错误；\`*args\` 后的参数自动成为仅限关键字
- **解包 dict 时 key 必须是 str**：\`f(**{1: 2})\` 报 \`TypeError\`，因为关键字参数名必须是字符串

## 实战建议
- 配置类函数用 \`**kwargs\` 接收可变选项，配合 \`dataclass\` 做类型校验更稳健
- API 设计中用 \`*\` 强制关键字参数，提高可读性：\`plot(x, y, *, color, linestyle)\`
- 可变默认值统一改用 \`None\` 哨兵，函数体内显式创建新对象
- 仅限位置参数（\`/\`）适合简化对外 API，避免参数名变更破坏调用方
`,
    code: `# 1. 默认值陷阱（可变对象）
def bad_append(item, lst=[]):
    lst.append(item)
    return lst

print("bad 第一次:", bad_append(1))
print("bad 第二次:", bad_append(2))  # 默认 list 被复用！

def good_append(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst

print("good 第一次:", good_append(1))
print("good 第二次:", good_append(2))

# 2. *args 与 **kwargs
def variadic(a, b, *args, **kwargs):
    print(f"a={a}, b={b}")
    print(f"args={args}")
    print(f"kwargs={kwargs}")

variadic(1, 2, 3, 4, 5, x=10, y=20)

# 3. 仅限关键字参数（* 之后）
def keyword_only(a, *, b, c=3):
    print(f"a={a}, b={b}, c={c}")

keyword_only(1, b=2)

# 4. 解包
args = [10, 20]
kwargs = {"sep": " | ", "end": "!\\n"}
print("解包:", end=" ")
print(*args, **kwargs)
`,
  },
  {
    id: "py5-lambda",
    group: "函数",
    icon: "λ",
    title: "lambda 与闭包",
    content: `
## 概述
\`lambda\` 是 Python 的匿名函数语法，限制为单个表达式；常与 \`sorted/map/filter\` 等配合使用。闭包是函数式编程的核心概念：内部函数引用外部函数的变量，使外部变量在函数返回后仍能被"记住"。理解闭包的延迟绑定特性，能避免循环变量捕获陷阱。

## 核心要点
- **\`lambda\` 语法**：\`lambda args: expr\`，只能有一个表达式，不能含语句（无 \`if/for/while\` 块、无赋值）
- **典型用途**：作为 \`sorted(key=...)\`、\`map()\`、\`filter()\` 的临时小函数
- **\`sorted\` 配 \`key\`**：\`sorted(words, key=lambda w: len(w))\`，key 函数对每个元素调用一次
- **\`map(f, iter)\`**：对每个元素应用 \`f\`，返回迭代器（3.x），需 \`list()\` 取结果
- **\`filter(f, iter)\`**：保留使 \`f\` 返回真值的元素
- **闭包定义**：内部函数引用外部函数的变量；外部函数返回内部函数后，外部变量仍存活
- **\`__closure__\` 属性**：闭包函数有此属性，是 cell 对象 tuple，可查看捕获的变量

## 原理与机制
- **闭包本质**：函数对象携带对其定义环境变量的引用（\`__closure__\），即便外层函数已返回，被引用的变量也不会被回收
- **延迟绑定**：闭包捕获的是变量本身（按名查找），不是值；调用时才查当前值，导致循环变量陷阱
- **\`lambda\` 与 \`def\` 等价**：\`f = lambda x: x + 1\` 等同于 \`def f(x): return x + 1\`，但 lambda 没有名字（\`__name__\` 为 \`"<lambda>"\`）
- **\`map/filter\` 惰性求值**：3.x 中返回迭代器，不立即计算；用 \`list()\` 触发求值

## 易错点与陷阱
- **循环变量捕获陷阱**：在循环里创建 lambda 捕获循环变量，调用时所有 lambda 拿到同一个最终值；用默认参数绑定当前值：\`lambda x, i=i: x * i\`
- **\`lambda\` 不能有语句**：\`lambda x: (x += 1)\` 语法错误；需要语句请用 \`def\`
- **不要滥用 lambda**：复杂逻辑用 \`def\` 定义命名函数，可读性远胜长 lambda
- **\`map\` / \`filter\` vs 列表推导式**：\`[x**2 for x in nums]\` 比 \`list(map(lambda x: x**2, nums))\` 更 Pythonic

## 实战建议
- 简单 key 函数用 \`lambda\`，复杂逻辑用 \`def\` 命名函数
- 循环里创建闭包必须用默认参数绑定当前变量：\`lambda x, v=val: x + v\`
- 优先用列表推导式 / 生成器表达式替代 \`map\` / \`filter\`，更符合 Python 风格
- 调试闭包时可查看 \`f.__closure__\` 与 \`cell.cell_contents\`，确认捕获的值
`,
    code: `# lambda 基础
add = lambda x, y: x + y
print("lambda add:", add(3, 4))

# sorted 中使用 key
words = ["banana", "apple", "cherry", "date"]
print("按长度排序:", sorted(words, key=lambda w: len(w)))
print("按末尾字母:", sorted(words, key=lambda w: w[-1]))

# map / filter
nums = [1, 2, 3, 4, 5]
squares = list(map(lambda x: x ** 2, nums))
evens = list(filter(lambda x: x % 2 == 0, nums))
print("map squares:", squares)
print("filter evens:", evens)

# 闭包：工厂函数
def make_power(n):
    """返回一个计算 x^n 的函数"""
    def power(x):
        return x ** n
    return power

square = make_power(2)
cube = make_power(3)
print("square(5):", square(5))
print("cube(3):", cube(3))

# 闭包陷阱（循环变量）：用默认参数解决
def make_multipliers():
    funcs = []
    for i in range(3):
        funcs.append(lambda x, i=i: x * i)
    return funcs

for f in make_multipliers():
    print("x*?", f(10))
`,
  },
  {
    id: "py5-hof",
    group: "函数",
    icon: "🔗",
    title: "高阶函数",
    content: `
## 概述
高阶函数（Higher-Order Function）指接受函数作为参数、或返回函数作为结果的函数。Python 函数是一等公民（first-class citizen），可被赋值、传递、返回。\`functools\` 模块提供了 \`partial\` 偏应用、\`reduce\` 累积等工具，配合自定义组合函数可实现数据处理管道。

## 核心要点
- **一等公民**：函数可作为参数传入、作为返回值返回、赋值给变量、存入数据结构
- **函数作参数**：\`def apply_twice(f, x): return f(f(x))\`，把函数当数据传递
- **\`functools.partial\`**：偏应用，固定部分参数生成新函数，\`partial(power, exp=2)\` 返回固定 exp 的新函数
- **\`functools.reduce\`**：累积运算，\`reduce(f, [a, b, c], init) = f(f(f(init, a), b), c)\`
- **函数组合**：\`compose(f, g)(x) = f(g(x))\`，可手动实现或借助第三方库（\`toolz\` / \`funcy\`）
- **内置高阶函数**：\`sorted/map/filter/max(key=)/min(key=)\` 都接受 key 函数

## 原理与机制
- **函数对象**：\`def\` 创建 \`function\` 对象，对象携带 \`__call__\` 方法，故可被调用；可赋值给变量、放入容器
- **\`partial\` 实现**：返回一个 \`functools.partial\` 对象，存储原函数与固定参数，调用时拼接剩余参数
- **\`reduce\` 求值顺序**：从左到右累积，每次用上一步结果与下一个元素计算；空序列必须提供初始值，否则报 \`TypeError\`
- **组合的链式调用**：\`compose(f, g, h)(x) = f(g(h(x)))\`，可结合 \`functools.reduce\` 实现任意多函数组合

## 易错点与陷阱
- **\`reduce\` 空序列**：\`reduce(f, [])\` 不带初始值会 \`TypeError\`；建议总传初始值 \`reduce(f, [], init)\`
- **\`partial\` 与默认参数冲突**：如果原函数已有默认参数，\`partial\` 再次绑定同参数可能引发 \`TypeError\`
- **组合顺序易错**：\`compose(f, g)(x) = f(g(x))\`，从右向左执行；写成 \`g(f(x))\` 是反的
- **过度函数式**：Python 不是 Haskell，复杂管道用列表推导式 / 生成器表达式更易读

## 实战建议
- 配置参数固定场景用 \`partial\`：\`int_base2 = partial(int, base=2)\`，比写 lambda 更清晰
- 累积求和 / 求积用 \`reduce\`，但简单求和直接 \`sum(nums)\`、求积可用 \`math.prod(nums)\`（3.8+）
- 多函数管道可用 \`def pipe(x, *fs): return reduce(lambda v, f: f(v), fs, x)\`，或借助 \`toolz.pipe\`
- 函数式风格适合数据处理管道（pandas / polars），但优先保证可读性，必要时加注释说明数据流
`,
    code: `from functools import partial, reduce

# 1. 函数作参数
def apply_twice(f, x):
    return f(f(x))

print("apply twice:", apply_twice(lambda n: n * 2, 5))

# 2. partial 偏应用
def power(base, exp):
    return base ** exp

square = partial(power, exp=2)
cube = partial(power, exp=3)
print("partial square(7):", square(7))
print("partial cube(2):", cube(2))

# 也可以偏置位置参数
print_hello = partial(print, "Hello", sep="-")
print_hello("world", end="!\\n")

# 3. reduce 累积
nums = [1, 2, 3, 4, 5]
total = reduce(lambda acc, x: acc + x, nums, 0)
product = reduce(lambda acc, x: acc * x, nums, 1)
print("sum via reduce:", total)
print("product via reduce:", product)

# 4. 简单函数组合
def compose(f, g):
    def composed(x):
        return f(g(x))
    return composed

times2 = lambda x: x * 2
plus1 = lambda x: x + 1
pipeline = compose(times2, plus1)  # (x+1)*2
print("(3+1)*2 =", pipeline(3))
`,
  },
];
