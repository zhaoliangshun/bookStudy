export const chapters = [
  {
    id: "py5-map-filter",
    group: "函数式工具",
    icon: "🗺️",
    title: "map/filter/reduce",
    content: `
## 概述
map/filter/reduce 是函数式编程三大核心工具，分别对应映射、过滤与归约，配合 all/any 与生成器表达式可构建声明式、惰性求值的数据处理管道，是 Python 数据处理的基础设施。

## 核心要点
- **map(func, iterable)**: \`list(map(str, [1,2,3]))\` - 对每个元素应用函数，返回迭代器（Python 3 起）
- **filter(func, iterable)**: \`list(filter(lambda x: x%2==0, nums))\` - 保留 func 返回 True 的元素
- **functools.reduce(func, iterable, initial)**: \`reduce(lambda a,b: a+b, nums)\` - 从左到右累积归约为单值
- **all(iterable)**: \`all(x>0 for x in nums)\` - 全为 True 则 True，空集返回 True
- **any(iterable)**: \`any(x%2==0 for x in nums)\` - 任一为 True 则 True，空集返回 False
- **map 多迭代器**: \`list(map(lambda a,b: a+b, [1,2],[3,4]))\` - 并行处理，按最短截断
- **reduce 三参数**: \`reduce(f, iter, initial)\` - initial 作初始累加器，空序列也能工作
- **生成器表达式**: \`(x*x for x in nums)\` - 比 map/filter 更省内存的惰性方案
- **filter(None, iter)**: \`list(filter(None, [0,1,'',2]))\` - 过滤所有假值，等价 \`filter(bool, iter)\`
- **sum/max/min 内建**: 求和优先 \`sum(nums)\`，最大值优先 \`max(nums)\`，比 reduce 更清晰

## 原理与机制
- **惰性求值**: map/filter 返回迭代器，仅在消费时计算，节省内存，但只能迭代一次
- **reduce 累积**: 每步将上次结果与下一元素传入 func；无 initial 时取首元素作初值
- **短路求值**: all 遇 False 立即返回，any 遇 True 立即返回，避免遍历整个序列
- **可迭代协议**: 接受任意可迭代对象（生成器、文件、字典视图、range 等）
- **迭代器协议**: map/filter 对象实现 \`__next__\` 与 \`__iter__\`，可被 for/sum/list 等消费

## 易错点与陷阱
- **忘记 list() 转换**: Python 3 中 \`map(...)\` 返回迭代器，print 显示 \`<map object>\`，且只能消费一次
- **reduce 默认无 initial**: 空序列调用 \`reduce(f, [])\` 抛 TypeError，需显式传 initial
- **all([]) 为 True**: 数学约定（空真命题），但易引发逻辑错误，需显式判断空集
- **lambda 闭包变量**: 循环里创建 lambda 时变量是引用，可能捕获到最后的值，需用默认参数绑定

## 实战建议
- **优先列表推导**: 简单场景用 \`[x*2 for x in nums]\` 比 map 更 Pythonic、更可读
- **大数据用生成器**: 处理大文件用 \`map(str.strip, file)\` 配合迭代，避免一次性载入
- **reduce 慎用**: 求和优先 \`sum(nums)\`、求积优先 \`math.prod(nums)\`（3.8+），reduce 留给复杂归约
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
## 概述
operator 模块把 Python 运算符封装成可调用函数，避免临时 lambda，在排序、归约、数据选取等场景下既快又可读，且可被 pickle 序列化，是函数式数据处理的常配库。

## 核心要点
- **算术函数**: \`operator.add(10,3)\` 等价 \`+\`，还有 sub/mul/truediv/floordiv/mod/pow
- **比较函数**: \`operator.lt(a,b)\` 等价 \`<\`，含 le/eq/ne/gt/ge，可用于 sorted key
- **itemgetter(key)**: \`sorted(rows, key=itemgetter('score'))\` - 按字典/列表项取值或排序
- **attrgetter(attr)**: \`sorted(objs, key=attrgetter('x'))\` - 按对象属性取值/排序
- **methodcaller(name)**: \`methodcaller('strip')(' abc ')\` - 等价调用对象方法
- **多键 itemgetter**: \`itemgetter('a','b')(d)\` - 一次取多项，返回元组
- **inplace 运算**: \`operator.iadd\`、\`operator.isub\` 对应 \`+=\`、\`-=\`，用于原地修改
- **reduce 配合**: \`reduce(operator.add, nums)\` 比等价 lambda 更清晰
- **逻辑运算**: \`operator.and_\`、\`operator.or_\`、\`operator.xor\`、\`operator.not_\` 对应位/逻辑运算
- **truth/is_/index**: \`truth(x)\` 转 bool，\`is_(a,b)\` 等价 \`a is b\`，\`index(x)\` 调用 \`__index__\`
- **set 操作**: \`operator.concat\` 等价 \`+\` 用于列表拼接，\`operator.contains(a,b)\` 等价 \`b in a\`

## 原理与机制
- **C 实现**: operator 函数底层是 C 实现，比等价 lambda 略快且无 Python 函数调用开销
- **可 pickle**: operator 函数可序列化，lambda 不行，多进程场景必需
- **协议对接**: itemgetter 调用 \`__getitem__\`，attrgetter 调用 \`__getattribute__\`
- **属性链**: \`attrgetter('point.x')\` 支持点路径取嵌套属性
- **多键性能**: 多键 itemgetter 一次取多项，比多次 lambda 取值更快

## 易错点与陷阱
- **attrgetter 不支持计算**: 只能取直接属性，不能写 \`attrgetter('x*2')\` 之类表达式
- **itemgetter vs attrgetter 混用**: 字典用 itemgetter，对象用 attrgetter，错用抛 AttributeError
- **truediv vs floordiv**: \`/\` 返回 float，\`//\` 返回 int，需求不同别选错
- **index vs getitem**: \`operator.index(x)\` 用于切片下标转换，与 \`__getitem__\` 含义不同

## 实战建议
- **排序优先用 operator**: \`sorted(rows, key=itemgetter('age'))\` 比 lambda 更快更易读
- **多字段排序**: \`itemgetter('score','age')\` 一次取多键，配合 sorted 实现稳定多级排序
- **并行/序列化场景**: 多进程 Pool.map 传函数时，优先 operator 函数避免 pickle 失败
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
## 概述
functools 是 Python 高阶函数工具箱，提供偏函数、缓存、装饰器元信息、单分派等，是函数式编程与性能优化的核心库，与 operator 模块常配合使用。

## 核心要点
- **partial(func, *args)**: \`square = partial(pow, exp=2)\` - 冻结部分参数生成偏函数
- **@lru_cache(maxsize)**: \`@lru_cache(maxsize=128)\` - LRU 记忆化缓存，加速重复调用
- **@cache**: \`@cache\` - 3.9+ 等价 \`@lru_cache(maxsize=None)\`，无界缓存
- **@cached_property**: \`@cached_property\` - 3.8+，把方法结果缓存为实例属性，首次访问后不再计算
- **@wraps**: 装饰器内用 \`@wraps(func)\` 保留原函数 \`__name__\`/\`__doc__\` 元信息
- **@singledispatch**: 按第一个参数类型分派，实现面向对象的"方法重载"
- **@singledispatchmethod**: 3.8+，方法版单分派，支持类方法按类型分派
- **cmp_to_key**: \`sorted(xs, key=cmp_to_key(cmp))\` - 老 cmp 函数转 key 函数
- **cache_info/cache_clear**: \`fib.cache_info()\` 查命中，\`fib.cache_clear()\` 清空
- **total_ordering**: 类只定义 \`__eq__\`+一个比较方法，自动补齐其余比较运算符

## 原理与机制
- **lru_cache 历史**: 3.2+ 引入，3.8 起 \`maxsize=None\` 无界缓存，3.9+ 新增 \`@cache\` 简写
- **底层哈希**: lru_cache 用 dict + 双向链表，键必须可哈希，不可变参数才能缓存
- **partial 原理**: 包装原函数并在调用时拼接已冻结参数与新参数，不复制函数体
- **singledispatch 注册表**: 维护 \`{类型: 函数}\` 字典，按 \`type(arg).__mro__\` 顺序查找
- **线程安全**: lru_cache 内部加锁，多线程调用安全

## 易错点与陷阱
- **可变参数不可缓存**: \`fib([1,2])\` 抛 TypeError，列表/字典不能作为被缓存函数的参数
- **缓存依赖副作用**: 缓存基于"相同参数永远返回相同结果"假设，函数依赖外部状态时缓存会失效
- **partial 签名**: \`partial(func, x)\` 后再传 \`x\` 会 TypeError，无法覆盖已绑定位置参数
- **singledispatch 不分派子类**: 默认按精确类型注册，子类需显式 \`register\` 或走 mro 查找

## 实战建议
- **递归必加缓存**: 斐波那契、迷宫计数等递归优先 \`@lru_cache\`，性能从 O(2^n) 降到 O(n)
- **装饰器必加 @wraps**: 自定义装饰器一定要 \`@wraps\`，否则调试/反射会丢元信息
- **3.9+ 优先 @cache**: 无需限定大小时用 \`@cache\` 更简洁；需 LRU 淘汰策略用 \`@lru_cache(maxsize=N)\`
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
## 概述
函数组合、管道、柯里化是函数式编程核心范式，Python 虽无内置支持，但用几十行代码即可实现，让数据处理逻辑更声明式、可复用、可测试。

## 核心要点
- **compose(*funcs)**: \`compose(g, f)(x) = g(f(x))\` - 从右向左组合函数
- **pipe(*funcs)**: \`pipe(f, g)(x) = g(f(x))\` - 从左向右，类似 Unix 管道 \`echo | f | g\`
- **curry(func)**: \`curry(add)(1)(2)(3)\` - 多参函数转单参链式调用
- **部分应用**: \`partial(add, 1)(2)\` - 与柯里化相关但更灵活，可一次传多个参数
- **数据管道**: \`pipe(filter, map, sum)\` - 链式处理，类似 Unix 管道组合
- **point-free 风格**: 不显式提参数名，如 \`process = pipe(strip, lower)\` 更声明式
- **恒等函数**: \`identity = lambda x: x\` - 常用作占位或调试断点
- **flip 调整参数**: 自定义 flip 翻转前两个参数，便于偏函数组合
- **tap 调试**: \`tap = lambda f: lambda x: (f(x), x)[1]\` - 副作用观察点，不破坏管道

## 原理与机制
- **闭包捕获**: compose/pipe/curry 都依赖闭包捕获 funcs 列表，返回内部函数
- **柯里化递归**: 每次接收部分参数，未满 arity 则返回新 curried 函数等待剩余
- **arity 推断**: \`func.__code__.co_argcount\` 读取参数个数，决定何时调用原函数
- **惰性链式**: pipe 内部按顺序 for 循环调用，每个函数处理上一步输出
- **reduce 实现**: compose 可用 \`reduce(lambda f,g: lambda x: g(f(x)), funcs)\` 一行实现

## 易错点与陷阱
- **compose 方向**: \`compose(f,g,h)(x) = f(g(h(x)))\` 从右向左，与 pipe 相反，容易写反
- **类型必须匹配**: 上一个函数输出类型必须可作为下一个函数输入，否则运行时 TypeError
- **curry 与默认参数**: 依赖 \`co_argcount\`，含 *args/**kwargs 或默认值的函数 arity 推断不准
- **调试困难**: 多函数组合出错时定位困难，可在管道中插入 \`lambda x: (print(x), x)[1]\` 调试

## 实战建议
- **优先 pipe**: 从左向右更符合阅读习惯，可读性优于 compose
- **简单场景不必引入**: 单次链式调用直接写 \`sum(map(sq, filter(is_even, nums)))\` 即可
- **复用 partial/toolz**: 频繁组合可考虑 \`functools.partial\` 或第三方库 toolz/funcy
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
