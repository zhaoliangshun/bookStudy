// =============================================================
// Batch 11：函数式编程（4 章）
// 41. py4-map-filter   map/filter/reduce、all/any
// 42. py4-operator     operator 模块：itemgetter/attrgetter
// 43. py4-functools    functools：partial、lru_cache、reduce
// 44. py4-fp-adv       函数式实战：compose、pipe、curry
// =============================================================

export const chapters = [
  {
    id: "py4-map-filter",
    group: "函数式编程",
    icon: "🧮",
    title: "map / filter / reduce / all / any",
    content: `
- \`map(fn, iter)\`：逐个应用函数，返回迭代器
- \`filter(fn, iter)\`：按谓词过滤
- \`functools.reduce(fn, iter, init)\`：累积
- \`all/any\`：批量判断
- Python 风格：能用推导时优先推导，map/filter 多用于组合已存在函数
`,
    code: `import functools

nums = [1, 2, 3, 4, 5]

# map
print("map square:", list(map(lambda x: x * x, nums)))
print("map str:", list(map(str, nums)))

# filter
print("filter even:", list(filter(lambda x: x % 2 == 0, nums)))
print("filter truthy:", list(filter(None, [0, 1, "", "a", None, [], [1]])))

# reduce
print("sum:", functools.reduce(lambda a, b: a + b, nums, 0))
print("max:", functools.reduce(lambda a, b: a if a > b else b, nums))
print("concat:", functools.reduce(lambda a, b: f"{a}-{b}", nums))

# all / any
print("all > 0:", all(x > 0 for x in nums))
print("any > 3:", any(x > 3 for x in nums))
print("all + any:", all([True, True]), any([False, False, True]))

# map + filter 链式
result = list(map(lambda x: x * 2, filter(lambda x: x > 2, nums)))
print("map+filter:", result)
`,
  },
  {
    id: "py4-operator",
    group: "函数式编程",
    icon: "🎛️",
    title: "operator 模块：itemgetter 等",
    content: `
- \`operator.itemgetter\`：取字典/列表元素
- \`operator.attrgetter\`：取对象属性
- \`operator.methodcaller\`：调用方法
- 运算符函数：\`add / sub / mul / truediv / floordiv / mod / pow\`
- 比较函数：\`eq / ne / lt / le / gt / ge\`
- 替代 lambda，可读性更好
`,
    code: `import operator, functools

# itemgetter：取字典/列表元素
users = [
    {"name": "bob", "age": 30},
    {"name": "alice", "age": 25},
    {"name": "carol", "age": 28},
]
by_age = sorted(users, key=operator.itemgetter("age"))
by_name = sorted(users, key=operator.itemgetter("name"))
print("by_age:", [u["name"] for u in by_age])
print("by_name:", [u["name"] for u in by_name])

# attrgetter：取对象属性
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __repr__(self):
        return f"Point({self.x},{self.y})"

points = [Point(3, 4), Point(1, 2), Point(5, 1)]
by_x = sorted(points, key=operator.attrgetter("x"))
print("by_x:", by_x)

# 运算符函数
nums = [1, 2, 3, 4, 5]
print("add:", list(map(operator.add, nums, nums)))
print("mul:", list(map(operator.mul, nums, nums)))
print("reduce mul:", functools.reduce(operator.mul, nums, 1))

# 比较函数
print("lt:", operator.lt(1, 2), operator.eq(1, 1))
`,
  },
  {
    id: "py4-functools",
    group: "函数式编程",
    icon: "🧰",
    title: "functools：partial、lru_cache、wraps",
    content: `
- \`partial(fn, *args, **kwargs)\`：固定部分参数
- \`lru_cache(maxsize=128)\`：缓存函数结果（Memoization）
- \`wraps(fn)\`：保留原函数元信息（装饰器必用）
- \`reduce\`：累计
- \`singledispatch\`：函数重载（按第一个参数类型分发）
`,
    code: `import functools, time

# partial：固定参数
def power(base, exp):
    return base ** exp

square = functools.partial(power, exp=2)
cube = functools.partial(power, exp=3)
print("square:", square(5), "cube:", cube(2))

# lru_cache：缓存
@functools.lru_cache(maxsize=128)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

t0 = time.perf_counter()
print("fib(35):", fib(35))
print("cost:", time.perf_counter() - t0)
print("cache info:", fib.cache_info())

# wraps：保留元信息
def my_decorator(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs)
    return wrapper

@my_decorator
def hello(name):
    """say hello"""
    return f"hi, {name}"

print(hello("alice"), hello.__name__, hello.__doc__)

# singledispatch：按类型分发
@functools.singledispatch
def format_value(val):
    return str(val)

@format_value.register(list)
def _(val):
    return "[ " + ", ".join(format_value(v) for v in val) + " ]"

@format_value.register(dict)
def _(val):
    return "{ " + ", ".join(f"{k}: {v}" for k, v in val.items()) + " }"

print(format_value(42))
print(format_value([1, 2, 3]))
print(format_value({"a": 1, "b": 2}))
`,
  },
  {
    id: "py4-fp-adv",
    group: "函数式编程",
    icon: "🔄",
    title: "函数式实战：compose、pipe",
    content: `
- compose：\`f(g(h(x)))\`，从右向左组合
- pipe：\`x | h | g | f\`，从左向右组合
- 偏函数、柯里化
- 函数式风格适合数据处理的 pipeline
`,
    code: `import functools

# compose：从右向左
def compose(*fns):
    def composed(x):
        for fn in reversed(fns):
            x = fn(x)
        return x
    return composed

# pipe：从左向右
def pipe(*fns):
    def piped(x):
        for fn in fns:
            x = fn(x)
        return x
    return piped

inc = lambda x: x + 1
dbl = lambda x: x * 2
sq  = lambda x: x * x

f1 = compose(inc, dbl, sq)        # inc(dbl(sq(x)))
f2 = pipe(inc, dbl, sq)          # sq(dbl(inc(x)))
print("compose(3):", f1(3))       # inc(dbl(sq(3))) = inc(dbl(9)) = inc(18) = 19
print("pipe(3):", f2(3))         # sq(dbl(inc(3))) = sq(dbl(4)) = sq(8) = 64

# 实战：数据处理 pipeline
def parse_csv(s):
    return [line.split(",") for line in s.strip().split("\\n")]

def to_dicts(rows):
    headers = rows[0]
    return [dict(zip(headers, row)) for row in rows[1:]]

def filter_adults(users):
    return [u for u in users if int(u["age"]) >= 18]

csv_data = "name,age\\nalice,30\\nbob,15\\ncarol,28\\n"
process = pipe(parse_csv, to_dicts, filter_adults)
print("adults:", process(csv_data))

# 实战：使用 partial 定制 pipeline
import operator
strip = lambda s: s.strip()
upper = lambda s: s.upper()
exclaim = lambda s: s + "!"

shout = pipe(strip, upper, exclaim)
print("shout:", shout("  hello  "))
`,
  },
];