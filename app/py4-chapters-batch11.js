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
## 一、概念解释

- **map(fn, iter)**：把函数 fn 依次应用到可迭代对象的每个元素，返回一个**惰性迭代器**（不是列表），只有在被消费（如 list()、for 循环）时才真正计算，节省内存。
- **filter(fn, iter)**：用谓词函数（返回布尔值）过滤元素，保留返回真值的元素，同样返回**惰性迭代器**；fn 传 None 时按真值过滤（去掉 0/""/None/[] 等 falsy 值）。
- **functools.reduce(fn, iter, init)**：从左到右两两合并——先取前两个元素用 fn 合并得到中间结果，再与第三个元素合并，依此类推，最终得到一个累计值。init 为可选初始值。
- **all(iterable)**：所有元素为真才返回 True，**空序列返回 True**。
- **any(iterable)**：任一元素为真即返回 True，**空序列返回 False**。

## 二、设计原理

- 这些函数源于函数式编程思想：把"循环 + 累加变量"的命令式写法抽象为"高阶函数 + 谓词"，让数据流转更清晰。
- map/filter 返回迭代器而非列表，体现 Python3 的惰性求值理念，处理大数据集时不占用额外内存。
- reduce 在 Python3 中从 builtins 移到 functools 模块，作者 Guido 认为它可读性不如显式循环，容易被滥用，故降级。

## 三、使用场景

- 批量类型转换：\`map(str, nums)\`、\`map(int, str_list)\`
- 数据清洗：\`filter(None, data)\` 去除空值
- 累积运算：\`reduce(operator.mul, nums, 1)\` 求积
- 批量校验：\`all(x > 0 for x in nums)\` 检查全部为正

## 四、代码逐行讲解

\`\`\`python
print("map square:", list(map(lambda x: x * x, nums)))
# 对每个元素求平方；list() 把惰性迭代器实例化为列表
print("map str:", list(map(str, nums)))
# 直接复用内建 str，比 lambda x: str(x) 更简洁，这是 map 的最佳用法
print("filter even:", list(filter(lambda x: x % 2 == 0, nums)))
# 谓词返回 True（偶数）才保留
print("filter truthy:", list(filter(None, [0, 1, "", "a", None, [], [1]])))
# None 表示按真值过滤，去掉 0/""/None/[]，留下 1/"a"/[1]
print("sum:", functools.reduce(lambda a, b: a + b, nums, 0))
# init=0 作为初始累积值，逐步累加；推荐显式给 init 防止空序列报错
print("max:", functools.reduce(lambda a, b: a if a > b else b, nums))
# 两两比较保留较大者，最终得到最大值
result = list(map(lambda x: x * 2, filter(lambda x: x > 2, nums)))
# filter 先过滤出 >2 的元素，map 再 ×2；链式仍返回迭代器，需 list() 转换
\`\`\`

## 五、和推导式对比

- 推导式：\`[x*2 for x in nums if x > 2]\` —— 更 Pythonic，可读性强，**优先使用**。
- map/filter：适合直接复用已存在的函数（如 \`map(str, nums)\`），或函数式链式组合。
- 经验法则：能用推导式优先用推导式；当只是把已存在函数（str、int、len）映射到序列时，map 更简洁。

## 六、易错点小结

| 易错点 | 说明 |
| --- | --- |
| 忘记 list() 转换 | map/filter 返回迭代器，直接 print 只看到 \`<map object>\` |
| reduce 空序列 | 不给 init 且序列为空会抛 TypeError |
| all([]) 返回 True | 空序列"全部满足"为真，逻辑上需要特别注意 |
| 滥用 reduce | 复杂累积逻辑不如显式循环可读 |
| 迭代器只能消费一次 | map/filter 结果迭代一次后即耗尽，再次遍历为空 |
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
## 一、概念解释

- **operator 模块**：提供与 Python 运算符一一对应的函数，让运算符可以像普通函数一样被传递（给 map、sorted、reduce 等高阶函数使用）。
- **operator.itemgetter(*keys)**：返回一个可调用对象，调用它等价于 \`obj[key]\`，常用于 sorted 的 key 取字典字段或列表下标。
- **operator.attrgetter(*attrs)**：返回一个可调用对象，调用它等价于 \`obj.attr\`，用于按对象属性排序。
- **operator.methodcaller(name, *args)**：返回一个可调用对象，调用它等价于 \`obj.name(*args)\`。
- **算术运算符函数**：\`add / sub / mul / truediv / floordiv / mod / pow / neg / pos / abs\`
- **比较运算符函数**：\`eq / ne / lt / le / gt / ge\`
- **位/逻辑运算符函数**：\`and_ / or_ / xor / invert / lshift / rshift\`

## 二、设计原理

- Python 的运算符（如 \`+\`）本质是语法糖，背后调用 \`__add__\` 等特殊方法。operator 模块把这些特殊方法调用封装成普通函数，便于作为参数传递给高阶函数。
- 为什么用 operator 替代 lambda？
  - **可读性更好**：\`operator.add\` 比 \`lambda a, b: a + b\` 语义更明确，一眼即懂。
  - **速度更快**：operator 函数用 C 实现，比 lambda 执行更快。
  - **减少错误**：lambda 容易写错（如把 \`lambda a, b: a + b\` 误写成 \`lambda a, b: a + a\`），operator 是标准库稳定可靠。

## 三、使用场景

- **sorted key**：\`sorted(users, key=itemgetter("age"))\` 按字典字段排序。
- **多字段排序**：\`sorted(data, key=itemgetter("age", "name"))\` 先按 age 再按 name。
- **map 多序列运算**：\`map(operator.add, list1, list2)\` 对应位置相加。
- **reduce 累积**：\`reduce(operator.mul, nums, 1)\` 求积，比 lambda 更清晰。
- **attrgetter 排序对象**：\`sorted(points, key=attrgetter("x"))\`。

## 四、代码逐行讲解

\`\`\`python
users = [{"name": "bob", "age": 30}, {"name": "alice", "age": 25}]
by_age = sorted(users, key=operator.itemgetter("age"))
# itemgetter("age") 返回 f(obj)=obj["age"]，sorted 据此排序
by_name = sorted(users, key=operator.itemgetter("name"))
# 换成按 name 排序，复用同一个 itemgetter 模式

points = [Point(3, 4), Point(1, 2)]
by_x = sorted(points, key=operator.attrgetter("x"))
# attrgetter("x") 返回 f(obj)=obj.x，专门用于对象属性

print("add:", list(map(operator.add, nums, nums)))
# map 接收多个可迭代对象，operator.add 把对应位置的元素相加
print("reduce mul:", functools.reduce(operator.mul, nums, 1))
# 用 operator.mul 累乘，比 lambda a,b: a*b 更清晰
print("lt:", operator.lt(1, 2), operator.eq(1, 1))
# 比较函数：lt(1,2)=True，eq(1,1)=True
\`\`\`

## 五、operator vs lambda 对比

| 场景 | operator 写法 | lambda 写法 |
| --- | --- | --- |
| 加法 | \`operator.add\` | \`lambda a, b: a + b\` |
| 取字典字段 | \`itemgetter("age")\` | \`lambda x: x["age"]\` |
| 取对象属性 | \`attrgetter("x")\` | \`lambda x: x.x\` |
| 调用方法 | \`methodcaller("strip")\` | \`lambda x: x.strip()\` |
| 比较 | \`operator.lt\` | \`lambda a, b: a < b\` |

## 六、易错点小结

| 易错点 | 说明 |
| --- | --- |
| itemgetter vs attrgetter 混用 | 字典/列表用 itemgetter，对象用 attrgetter，不可互换 |
| itemgetter 多参数返回元组 | \`itemgetter("a", "b")(d)\` 返回 \`(d["a"], d["b"])\`，用于多字段排序 |
| methodcaller 参数 | \`methodcaller("replace", "a", "b")\` 等价于 \`obj.replace("a", "b")\` |
| 忘记 import operator | 模块需显式导入，不是内建 |
| 与 lambda 性能差异小 | 简单场景差异不大，优势主要体现在可读性 |
`,
    code: `import operator

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

import functools
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
## 一、概念解释

- **partial(fn, *args, **kwargs)**：固定函数的部分参数，返回一个新的可调用对象（偏函数）。本质是**柯里化（Currying）的一种**——把多参数函数拆成接受部分参数的新函数。
- **lru_cache(maxsize)**：基于 LRU（Least Recently Used）算法的缓存装饰器，自动缓存函数调用结果（Memoization），相同参数再次调用时直接返回缓存值。
- **wraps(fn)**：装饰器辅助函数，把原函数的 \`__name__\`、\`__doc__\`、\`__module__\`、\`__qualname__\` 等元信息复制到包装函数，是**自定义装饰器的必用工具**。
- **reduce(fn, iter, init)**：累积合并（同 map-filter 章节介绍）。
- **singledispatch**：基于第一个参数类型的函数分发机制（类似 C++/Java 的函数重载），是面向对象多态的函数式替代方案。

## 二、设计原理

- **partial**：源于函数式编程的偏应用（partial application），让通用函数适配特定场景，避免重复传参。
- **lru_cache**：用空间换时间，自动维护一个按访问顺序排序的字典，超出 maxsize 时淘汰最久未使用的项。对递归（如斐波那契）优化效果显著。
- **wraps**：解决装饰器"吞噬"原函数元信息的问题——没有 wraps，被装饰函数的 \`__name__\` 会变成 \`wrapper\`，影响调试和文档生成。
- **singledispatch**：把"根据类型走不同分支"的 if-elif 链改为注册式分发，符合开闭原则，新增类型不需改原函数。

## 三、使用场景

- **partial**：\`int2 = partial(int, base=2)\` 定制二进制转换；\`debug = partial(print, "[DEBUG]")\` 加前缀日志。
- **lru_cache**：递归优化（fib、背包问题）、纯函数结果缓存、HTTP 请求结果缓存。
- **wraps**：所有自定义装饰器都应该用，保留被装饰函数信息。
- **singledispatch**：根据数据类型走不同序列化/格式化逻辑，替代 if-elif type 判断。

## 四、代码逐行讲解

\`\`\`python
square = functools.partial(power, exp=2)
# 固定 power 的 exp=2，返回新函数 square(base)，调用 square(5) 等价于 power(5, exp=2)
cube = functools.partial(power, exp=3)
# 固定 exp=3，得到立方函数

@functools.lru_cache(maxsize=128)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)
# 装饰后 fib 自动缓存：fib(35) 从指数级降到线性，毫秒级完成
print("cache info:", fib.cache_info())
# cache_info() 返回命名元组，含 hits/misses/maxsize/currsize

def my_decorator(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs)
    return wrapper
# wraps 把 fn 的 __name__/__doc__ 复制到 wrapper，否则 hello.__name__ 会是 "wrapper"

@functools.singledispatch
def format_value(val):
    return str(val)
# 默认实现
@format_value.register(list)
def _(val):
    return "[ " + ", ".join(format_value(v) for v in val) + " ]"
# 注册 list 类型的专用实现，调用 format_value([1,2,3]) 自动分发到这里
\`\`\`

## 五、lru_cache 的关键限制

| 限制 | 说明 |
| --- | --- |
| 参数必须可哈希 | int/str/tuple/frozenset 可，list/dict/set 不可（会抛 TypeError） |
| 默认按所有参数做 key | 包括位置参数和关键字参数，相同参数才命中 |
| 缓存可主动清空 | 用 \`func.cache_clear()\` 清空，\`cache_info()\` 查看统计 |
| 不适合有副作用的函数 | 如打印、写文件、随机数，缓存会导致行为不一致 |
| maxsize=None 表示无限制 | 等价于普通 dict 缓存，慎用（内存可能爆炸） |

## 六、易错点小结

| 易错点 | 说明 |
| --- | --- |
| lru_cache 参数不可哈希 | 传 list/dict 会抛 TypeError，需先转 tuple/frozenset |
| 忘记 wraps | 装饰后函数 __name__ 变成 wrapper，影响调试和文档 |
| partial 是偏应用不是柯里化 | partial 一次固定多个参数；柯里化严格逐个传参 |
| singledispatch 只看第一个参数 | 不能按多参数类型分发，复杂场景需面向对象 |
| 缓存命中不更新 | 函数逻辑依赖外部可变状态时，缓存可能返回过期结果 |
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
## 一、概念解释

- **compose(*fns)**：函数组合，**从右向左**执行，等价于数学上的 \`f(g(h(x)))\`。先执行最右边的函数，结果作为下一个函数的输入。
- **pipe(*fns)**：管道组合，**从左向右**执行，等价于 \`f(x) → g → h\`，更符合从左到右的阅读习惯。
- **偏函数（partial）**：固定部分参数得到新函数，用于定制 pipeline 中的步骤。
- **柯里化（curry）**：把多参数函数拆成一系列单参数函数，逐步传参：\`f(a)(b)(c)\`。
- **函数式 pipeline**：把数据处理流程拆成多个纯函数步骤，数据像水流过管道一样依次变换。

## 二、设计原理

- **compose 源于数学**：函数组合 \`f ∘ g\` 在数学中本身就是从右向左，compose 保持了这一传统。
- **pipe 源于 Unix shell**：\`cat file | grep x | sort\` 的链式管道思想，从左到右更直观。
- **纯函数是核心**：pipeline 中每一步都应是纯函数（无副作用、相同输入相同输出），这样才能任意组合、独立测试、并行执行。
- **数据 vs 行为**：函数式把"行为"（函数）作为一等公民，数据被动流过；面向对象把"数据"和"行为"绑在对象里。两者是不同的组织代码思路。

## 三、使用场景

- **数据处理流水线**：ETL（提取-转换-加载）、CSV 解析、数据清洗、聚合统计。
- **字符串变换**：\`pipe(strip, upper, exclaim)\` 处理用户输入。
- **数值计算**：\`compose(sqrt, abs, negate)\` 组合多步数学运算。
- **配置定制**：用 partial 固定参数生成专用步骤，再组合成 pipeline。

## 四、代码逐行讲解

\`\`\`python
def compose(*fns):
    def composed(x):
        for fn in reversed(fns):
            x = fn(x)
        return x
    return composed
# reversed 让最右边的函数先执行，体现 f(g(h(x))) 的从右向左
def pipe(*fns):
    def piped(x):
        for fn in fns:
            x = fn(x)
        return x
    return piped
# 按原顺序执行，从左到右，符合阅读习惯

f1 = compose(inc, dbl, sq)        # inc(dbl(sq(x)))
# sq 先执行：3→9，dbl：9→18，inc：18→19
f2 = pipe(inc, dbl, sq)          # sq(dbl(inc(x)))
# inc 先执行：3→4，dbl：4→8，sq：8→64

process = pipe(parse_csv, to_dicts, filter_adults)
# 1) parse_csv 把 CSV 文本切成行+字段
# 2) to_dicts 把每行转成字典（用表头做 key）
# 3) filter_adults 过滤出 age>=18 的成年人
# 每步都是纯函数，可独立测试，组合后即完整数据处理流程

shout = pipe(strip, upper, exclaim)
# strip 去空白 → upper 转大写 → exclaim 加感叹号
\`\`\`

## 五、compose vs pipe vs 面向对象对比

| 维度 | compose | pipe | 面向对象 |
| --- | --- | --- | --- |
| 执行方向 | 从右向左 | 从左向右 | 方法链式调用 |
| 可读性 | 接近数学，需习惯 | 符合阅读顺序 | 直观但耦合数据 |
| 数据流转 | 函数链，数据被动流过 | 同 compose | 对象方法调用 |
| 测试性 | 每步纯函数易测试 | 同 compose | 需 mock 对象状态 |
| 适用场景 | 数学计算、函数式风格 | 数据处理 pipeline | 业务逻辑、状态管理 |

## 六、易错点小结

| 易错点 | 说明 |
| --- | --- |
| compose 方向记反 | 从右向左，和数学一致；写错会得到错误结果 |
| 管道中混入非纯函数 | 有副作用的函数（如修改全局、打印）破坏组合性 |
| 类型不匹配 | 上一个函数的输出必须是下一个函数的输入类型 |
| Python 无内置 curry | 需自己实现或用 toolz 等库，标准库不直接支持 |
| Python 不是纯函数式语言 | 没有强制不可变、没有尾递归优化，函数式只是风格选择 |
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