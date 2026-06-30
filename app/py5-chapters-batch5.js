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
- 使用 \`def\` 定义函数，\`return\` 返回值（多返回值自动打包为 tuple）
- 文档字符串 \`"""..."""\` 用 \`help()\` 或 \`__doc__\` 访问
- 类型提示（PEP 484）：\`def add(a: int, b: int) -> int\`
- 类型提示是注解，运行时不强制检查
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
- 位置参数、关键字参数；默认参数必须在位置参数之后
- **可变默认参数陷阱**：不要用 list/dict 做默认值，用 \`None\`
- \`*args\` 收集多余位置参数为 tuple；\`**kwargs\` 收集多余关键字参数为 dict
- \`*\` 之后的参数是**仅限关键字参数**；\`/\` 之前是仅限位置参数
- 解包：\`f(*list)\`, \`f(**dict)\`
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
- \`lambda args: expr\` 是匿名函数，只能有一个表达式
- 常用在 \`sorted(key=...)\` / \`map()\` / \`filter()\` 中
- **闭包**：内部函数引用外部函数的变量，外部变量被"记住"
- 闭包常见陷阱：循环变量捕获（用默认参数绑定当前值）
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
- 高阶函数：接受函数作为参数，或返回函数
- \`functools.partial\` 偏应用：固定部分参数，生成新函数
- \`functools.reduce\` 累积：\`reduce(f, [a,b,c]) = f(f(a,b),c)\`
- 函数组合：\`compose(f,g)(x) = f(g(x))\` 简单实现
- Python 中函数是一等公民（first-class citizen）
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
