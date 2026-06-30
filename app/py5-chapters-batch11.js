export const chapters = [
  {
    id: "py5-map-filter",
    group: "函数式工具",
    icon: "🗺️",
    title: "map/filter/reduce",
    content: `
- **map(func, iterable)**：对每个元素应用函数，返回迭代器
- **filter(func, iterable)**：保留 func 返回 True 的元素
- **functools.reduce(func, iterable, initial)**：累积计算，将序列归约为单个值
- **all(iterable)**：所有元素为 True 则返回 True（空集返回 True）
- **any(iterable)**：任一元素为 True 则返回 True（空集返回 False）
- Python 3 中 map/filter 返回迭代器而非列表，需 list() 转换
- 列表推导往往比 map/filter 更 Pythonic，但在函数式管道中很有用
    `.trim(),
    code: `
from functools import reduce

nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
print("=== map: 对每个元素应用函数 ===")
doubled = list(map(lambda x: x * 2, nums))
print(f"  原数组: {nums}")
print(f"  翻倍:   {doubled}")
print(f"  str映射: {list(map(str, nums[:3]))}")

print("\\n=== filter: 过滤元素 ===")
evens = list(filter(lambda x: x % 2 == 0, nums))
odds = list(filter(lambda x: x % 2 == 1, nums))
print(f"  偶数: {evens}")
print(f"  奇数: {odds}")

print("\\n=== reduce: 累积归约 ===")
total = reduce(lambda a, b: a + b, nums)
product = reduce(lambda a, b: a * b, nums, 1)
max_val = reduce(lambda a, b: a if a > b else b, nums)
print(f"  求和: {total}")
print(f"  阶乘(10!): {product}")
print(f"  最大值: {max_val}")

print("\\n=== all / any ===")
print(f"  all([True, True, False]): {all([True, True, False])}")
print(f"  all([1, 2, 3]): {all([1, 2, 3])}")
print(f"  any([False, False, True]): {any([False, False, True])}")
print(f"  all([]): {all([])}  (空集为True)")
print(f"  any([]): {any([])}  (空集为False)")
print(f"  所有数 > 0: {all(x > 0 for x in nums)}")
print(f"  存在偶数: {any(x % 2 == 0 for x in nums)}")
    `.trim()
  },
  {
    id: "py5-operator",
    group: "函数式工具",
    icon: "➕",
    title: "operator 模块",
    content: `
- **operator 模块**：提供 Python 运算符对应的函数形式
- **itemgetter(key)**：获取项，常用于 sorted/map 按键排序/取值
- **attrgetter(attr)**：获取属性，用于按对象属性排序
- **methodcaller(method, ...)**：调用方法
- **算术运算符函数**：add, sub, mul, truediv, floordiv, mod, pow
- **比较运算符**：lt, le, eq, ne, gt, ge
- 使用 operator 函数替代 lambda 通常更快更可读
    `.trim(),
    code: `
import operator
from functools import reduce
from dataclasses import dataclass

print("=== 算术运算符函数 ===")
a, b = 10, 3
ops = [
    ("add", operator.add, a + b),
    ("sub", operator.sub, a - b),
    ("mul", operator.mul, a * b),
    ("truediv", operator.truediv, a / b),
    ("floordiv", operator.floordiv, a // b),
    ("mod", operator.mod, a % b),
    ("pow", operator.pow, a ** b),
]
for name, func, expected in ops:
    result = func(a, b)
    print(f"  {name}({a}, {b}) = {result}")

print("\\n=== itemgetter: 按键取值/排序 ===")
students = [
    {"name": "Alice", "score": 85, "age": 20},
    {"name": "Bob", "score": 92, "age": 19},
    {"name": "Charlie", "score": 85, "age": 21},
]
by_score = sorted(students, key=operator.itemgetter("score"), reverse=True)
print(f"  按分数排序: {[s['name'] for s in by_score]}")
by_age_score = sorted(students, key=operator.itemgetter("score", "age"))
print(f"  按分数+年龄: {[(s['name'], s['score'], s['age']) for s in by_age_score]}")
first_two = operator.itemgetter(0, 1)
print(f"  itemgetter(0,1) on [10,20,30]: {first_two([10,20,30])}")

print("\\n=== attrgetter 和 methodcaller ===")
@dataclass
class Point:
    x: int
    y: int
    def dist_from_origin(self):
        return (self.x ** 2 + self.y ** 2) ** 0.5

points = [Point(3, 4), Point(1, 1), Point(0, 5)]
points_sorted = sorted(points, key=operator.attrgetter("x"))
print(f"  按x排序: {[(p.x, p.y) for p in points_sorted]}")
dist_caller = operator.methodcaller("dist_from_origin")
p = Point(3, 4)
print(f"  Point(3,4) 距原点: {dist_caller(p):.1f}")

print("\\n=== reduce + operator ===")
nums = [1, 2, 3, 4, 5]
print(f"  reduce(add): {reduce(operator.add, nums)}")
print(f"  reduce(mul): {reduce(operator.mul, nums)}")
    `.trim()
  },
  {
    id: "py5-functools",
    group: "函数式工具",
    icon: "🔧",
    title: "functools 高阶函数",
    content: `
- **functools.partial(func, ...)**：冻结部分参数，创建偏函数
- **@functools.lru_cache(maxsize)**：记忆化缓存，加速重复调用
- **@functools.wraps**：保留被装饰函数的元信息（__name__/__doc__）
- **@functools.singledispatch**：单分派泛型函数，按第一个参数类型分派
- **functools.cmp_to_key**：将老式比较函数（返回-1/0/1）转为 key 函数
- partial 绑定参数后仍保持原函数的签名感知
    `.trim(),
    code: `
import functools
import time

print("=== partial: 偏函数 ===")
def power(base, exp):
    return base ** exp
square = functools.partial(power, exp=2)
cube = functools.partial(power, exp=3)
print(f"  square(5) = {square(5)}")
print(f"  cube(3) = {cube(3)}")

def greet(greeting, name):
    return f"{greeting}, {name}!"
say_hello = functools.partial(greet, "Hello")
print(f"  say_hello('World') = {say_hello('World')}")

print("\\n=== lru_cache: 缓存装饰器 ===")
@functools.lru_cache(maxsize=128)
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

start = time.perf_counter()
result = fib(100)
elapsed = time.perf_counter() - start
print(f"  fib(100) = {result}")
print(f"  计算耗时: {elapsed*1000:.4f}ms")
print(f"  缓存信息: {fib.cache_info()}")

print("\\n=== singledispatch: 单分派泛型 ===")
@functools.singledispatch
def describe(obj):
    return f"未知类型: {type(obj).__name__}"

@describe.register(int)
def _(obj):
    if obj > 0:
        sign = "正"
    elif obj < 0:
        sign = "负"
    else:
        sign = "零"
    return f"整数: {obj} ({sign})"

@describe.register(str)
def _(obj):
    return f"字符串: '{obj}' (长度={len(obj)})"

@describe.register(list)
def _(obj):
    first = obj[0] if obj else "空"
    return f"列表: {len(obj)} 个元素, 首元素={first}"

print(f"  {describe(42)}")
print(f"  {describe('hello')}")
print(f"  {describe([1,2,3])}")
print(f"  {describe(3.14)}")

print("\\n=== cmp_to_key: 老式比较函数 ===")
def compare_len(a, b):
    return (len(a) > len(b)) - (len(a) < len(b))
words = ["banana", "apple", "cherry", "kiwi", "strawberry"]
sorted_words = sorted(words, key=functools.cmp_to_key(compare_len))
print(f"  按长度排序: {sorted_words}")
    `.trim()
  },
  {
    id: "py5-composition",
    group: "函数式工具",
    icon: "🔗",
    title: "函数组合与柯里化",
    content: `
- **函数组合 (composition)**：将多个函数组合成新函数 h(x) = g(f(x))
- **管道 (pipe)**：数据依次流经多个函数，类似 Unix 管道
- **柯里化 (currying)**：将多参数函数转为单参数链式调用 f(a,b,c) -> f(a)(b)(c)
- 这些模式不是 Python 内置，但可用简单方式实现
- 函数组合让代码更声明式，减少中间变量
- 结合 map/filter/reduce 可以构建强大的数据处理管道
    `.trim(),
    code: `
from functools import reduce

def compose(*funcs):
    def composed(x):
        for f in reversed(funcs):
            x = f(x)
        return x
    return composed

def pipe(*funcs):
    def piped(x):
        for f in funcs:
            x = f(x)
        return x
    return piped

def curry(func, arity=None):
    if arity is None:
        arity = func.__code__.co_argcount
    def curried(*args):
        if len(args) >= arity:
            return func(*args)
        return curry(lambda *more: func(*(args + more)), arity - len(args))
    return curried

print("=== 函数组合 compose ===")
def add1(x): return x + 1
def double(x): return x * 2
def square(x): return x * x

f = compose(square, double, add1)
print("  compose(square, double, add1)(3)")
print(f"  = square(double(add1(3))) = square(double(4)) = square(8) = {f(3)}")

print("\\n=== 管道 pipe ===")
def strip(s): return s.strip()
def lower(s): return s.lower()
def split_comma(s): return s.split(",")
def clean_list(lst): return [x for x in lst if x]

process = pipe(strip, lower, split_comma, clean_list)
text = "  Apple, Banana, , Cherry , DATE  "
print(f"  输入: '{text}'")
print(f"  输出: {process(text)}")

print("\\n=== 柯里化 curry ===")
@curry
def add3(a, b, c):
    return a + b + c

print(f"  add3(1)(2)(3) = {add3(1)(2)(3)}")
print(f"  add3(1, 2)(3) = {add3(1, 2)(3)}")
print(f"  add3(1)(2, 3) = {add3(1)(2, 3)}")

@curry
def replace(old, new, s):
    return s.replace(old, new)

censor = replace("bad")("***")
bad_text = "this is bad"
censored = censor(bad_text)
print(f"  censor('{bad_text}') = '{censored}'")

print("\\n=== 实用管道示例 ===")
nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
pipeline = pipe(
    lambda xs: filter(lambda x: x % 2 == 0, xs),
    lambda xs: map(lambda x: x * x, xs),
    sum
)
print(f"  偶数平方和: {pipeline(nums)}")
    `.trim()
  }
];
