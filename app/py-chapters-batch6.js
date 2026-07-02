// =============================================================
// Python 交互式教程 —— 第六批章节（函数式与并发组，共 6 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. py-functional           — 函数式编程深入
//   2. py-threading            — 多线程编程
//   3. py-multiprocessing      — 多进程编程
//   4. py-asyncio              — asyncio 异步编程深入
//   5. py-concurrency-patterns — 并发设计模式
//   6. py-subprocess-system    — 子进程与系统交互
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（统一为「函数式与并发」）
//   content : Markdown 格式的详细讲解（文字量大，含大量示例与对比）
//   code    : 可运行的 Python 代码（python3 直接执行，print 输出）
//
// 注意事项：
//   - 所有注释和讲解使用简体中文
//   - code 字段为纯 Python 代码，不含反引号与 ${ 字符
//   - 多线程 / 多进程 / asyncio / subprocess demo 均为安全短任务
//   - asyncio 一律使用 asyncio.run() 入口
//   - subprocess 一律使用 sys.executable -c "print(1)" 安全命令
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：函数式编程深入
  // =========================================================
  {
    id: "py-functional",
    group: "函数式与并发",
    icon: "🧮",
    title: "函数式编程深入",
    content: `## 函数式编程深入

**函数式编程（Functional Programming，FP）** 是一种以**函数**为核心组织逻辑的编程范式。它的核心思想是：**程序由一系列函数组合而成，函数是一等公民，数据是不可变的，副作用被严格控制**。Python 虽然不是纯函数式语言（像 Haskell 那样），但它从 1.0 起就内置了 lambda、map、filter、reduce 等函数式工具，并在后续版本中通过 functools、operator 等模块提供了丰富的支持。掌握函数式思维，能让你写出更简洁、更可测试、更易于并发的代码。

本章将从「函数是一等公民」讲起，逐步深入到闭包、functools 全家桶、柯里化、纯函数、函数组合等内容，最后通过命令式与函数式的对比，帮助你建立完整的函数式思维。

### 函数是一等公民

在 Python 中，**函数是一等公民（First-Class Citizen）**。这意味着函数和整数、字符串一样，是一种**可以像数据一样被操作的对象**。具体表现为四种能力：

1. **可以被赋值给变量**
2. **可以作为参数传递给另一个函数**
3. **可以作为另一个函数的返回值**
4. **可以被存储在数据结构（列表、字典）中**

\`\`\`python
# 1. 赋值给变量
def shout(text):                   # 定义函数 shout，参数：text
    return text.upper()            # 返回 text.upper()

speak = shout          # speak 现在指向同一个函数对象
print(speak("hello"))  # HELLO

# 2. 作为参数传递
def apply(func, value):            # 定义函数 apply，参数：func, value
    return func(value)             # 返回 func(value)

print(apply(shout, "hi"))         # HI
print(apply(str.lower, "WORLD"))  # world

# 3. 作为返回值
def make_multiplier(n):            # 定义函数 make_multiplier，参数：n
    def multiply(x):               # 定义函数 multiply，参数：x
        return x * n               # 返回 x * n
    return multiply                # 返回 multiply

times3 = make_multiplier(3)        # 将 make_multiplier(3) 赋给 times3
print(times3(10))  # 30

# 4. 存储在数据结构中
operations = {                     # 将 { 赋给 operations
    "add": lambda a, b: a + b,
    "sub": lambda a, b: a - b,
    "mul": lambda a, b: a * b,
}
print(operations["add"](3, 4))  # 7
\`\`\`

函数在 Python 中本质上是 \`function\` 类型的对象，和 \`int\`、\`str\` 没有本质区别：

\`\`\`python
def foo():                         # 定义函数 foo，无参数
    pass                           # 空操作，占位

print(type(foo))      # <class 'function'>
print(isinstance(foo, object))  # True，函数是对象
print(foo.__name__)   # foo，函数对象有属性
\`\`\`

这种「函数即对象」的设计是 Python 函数式编程的基石。

### 高阶函数

**高阶函数（Higher-Order Function）** 指的是**接收函数作为参数**或**返回函数作为结果**的函数。前面例子里的 \`apply\` 和 \`make_multiplier\` 都是高阶函数。Python 内置了几个经典的高阶函数：

#### map —— 对每个元素应用函数

\`map(func, iterable)\` 把 \`func\` 依次应用到可迭代对象的每个元素，返回一个迭代器。

\`\`\`python
nums = [1, 2, 3, 4, 5]             # 创建列表并赋给 nums
squares = list(map(lambda x: x ** 2, nums))  # 将 list(map(lambda x: x ** 2, nums)) 赋给 squares
print(squares)  # [1, 4, 9, 16, 25]

# 等价的列表推导式（更 Pythonic）
squares2 = [x ** 2 for x in nums]  # 创建列表并赋给 squares2
\`\`\`

\`map\` 可以接收多个可迭代对象，函数接收对应位置的参数：

\`\`\`python
result = list(map(lambda a, b: a + b, [1, 2, 3], [10, 20, 30]))  # 将 list(map(lambda a, b: a + b, [1, 2, 3], [10, 20, 30])) 赋给 result
print(result)  # [11, 22, 33]
\`\`\`

#### filter —— 过滤元素

\`filter(func, iterable)\` 保留 \`func(x)\` 为真的元素：

\`\`\`python
nums = [1, 2, 3, 4, 5, 6]          # 创建列表并赋给 nums
evens = list(filter(lambda x: x % 2 == 0, nums))  # 将 list(filter(lambda x: x % 2 == 0, nums)) 赋给 evens
print(evens)  # [2, 4, 6]

# None 作为函数时，保留真值元素
truthy = list(filter(None, [0, 1, "", "a", None, [], [1]]))  # 将 list(filter(None, [0, 1, "", "a", None, [], [1]])) 赋给 truthy
print(truthy)  # [1, 'a', [1]]
\`\`\`

#### sorted —— 用 key 函数排序

\`sorted\` 接收一个 \`key\` 函数，根据该函数的返回值排序：

\`\`\`python
words = ["banana", "apple", "cherry"]  # 创建列表并赋给 words
print(sorted(words, key=len))              # 按长度
print(sorted(words, key=str.lower))        # 忽略大小写

students = [("张三", 88), ("李四", 95), ("王五", 72)]  # 创建列表并赋给 students
print(sorted(students, key=lambda s: s[1], reverse=True))  # 输出 sorted(students, key=lambda s: s[1], reverse=True)
# 按分数降序：[('李四', 95), ('张三', 88), ('王五', 72)]
\`\`\`

> **风格建议**：对于简单的 map/filter，Python 社区更推荐使用**列表推导式 / 生成器表达式**，因为它们更易读。但理解 map/filter 是理解函数式思维的重要一步。

### 闭包深入

**闭包（Closure）** 是函数式编程的核心概念之一。简单说，闭包是**携带了外部变量（自由变量）的函数**。当一个内部函数引用了它外部作用域的变量时，就形成了闭包。

#### 变量捕获与自由变量

\`\`\`python
def make_counter():                # 定义函数 make_counter，无参数
    count = 0           # 外部变量
    def counter():                 # 定义函数 counter，无参数
        nonlocal count  # 声明 count 是外部变量
        count += 1                 # count 加 1
        return count               # 返回 count
    return counter                 # 返回 counter

c = make_counter()                 # 将 make_counter() 赋给 c
print(c())  # 1
print(c())  # 2
print(c())  # 3
\`\`\`

这里 \`counter\` 函数「记住」了 \`count\` 这个变量。即使 \`make_counter\` 已经执行完毕返回了，\`count\` 依然存活在闭包里。被捕获的变量称为**自由变量（Free Variable）**。

可以用 \`__code__.co_freevars\` 查看一个函数的自由变量：

\`\`\`python
print(c.__code__.co_freevars)  # ('count',)
\`\`\`

#### 闭包陷阱：循环变量

经典陷阱——在循环中创建闭包，所有闭包捕获的是同一个变量：

\`\`\`python
funcs = []                         # 创建列表并赋给 funcs
for i in range(3):                 # 遍历 range(3)，每次取值赋给 i
    funcs.append(lambda: i)        # 对 funcs 调用 追加 方法，参数 lambda: i

print([f() for f in funcs])  # [2, 2, 2]，不是 [0, 1, 2]！
\`\`\`

原因：所有 lambda 共享同一个 \`i\`，循环结束时 \`i = 2\`。解决方法是用**默认参数**或 \`functools.partial\` 立即绑定当前值：

\`\`\`python
funcs = [lambda i=i: i for i in range(3)]  # 创建列表并赋给 funcs
print([f() for f in funcs])  # [0, 1, 2]

# 或者用默认参数
funcs = []                         # 创建列表并赋给 funcs
for i in range(3):                 # 遍历 range(3)，每次取值赋给 i
    funcs.append(lambda i=i: i)    # 对 funcs 调用 追加 方法，参数 lambda i=i: i
\`\`\`

#### 闭包 vs 类

闭包可以替代简单的类——它把状态「封装」在函数里：

\`\`\`python
# 闭包实现
def make_accumulator():            # 定义函数 make_accumulator，无参数
    total = 0                      # 将整数 0 赋给 total
    def add(x):                    # 定义函数 add，参数：x
        nonlocal total
        total += x                 # total 加 x
        return total               # 返回 total
    return add                     # 返回 add

acc = make_accumulator()           # 将 make_accumulator() 赋给 acc
print(acc(10))  # 10
print(acc(20))  # 30

# 类实现（等价）
class Accumulator:                 # 定义类 Accumulator
    def __init__(self):            # 定义函数 __init__，参数：self
        self.total = 0
    def add(self, x):              # 定义函数 add，参数：self, x
        self.total += x
        return self.total          # 返回 self.total

acc2 = Accumulator()               # 将 Accumulator() 赋给 acc2
print(acc2.add(10))  # 10
print(acc2.add(20))  # 30
\`\`\`

闭包更轻量，类更结构化。状态简单时用闭包，状态复杂或需要多个方法时用类。

### functools 全家桶

\`functools\` 模块是 Python 函数式编程的核心工具箱。下面逐一讲解。

#### partial —— 偏函数

\`functools.partial(func, *args, **kwargs)\` 固定一个函数的部分参数，返回一个新函数。这是**偏应用（Partial Application）** 的实现。

\`\`\`python
from functools import partial      # 从 functools 导入 partial

def power(base, exponent):         # 定义函数 power，参数：base, exponent
    return base ** exponent        # 返回 base ** exponent

# 固定 exponent=2，得到「平方」函数
square = partial(power, exponent=2)  # 将 partial(power, exponent=2) 赋给 square
print(square(5))  # 25

# 固定 exponent=3，得到「立方」函数
cube = partial(power, exponent=3)  # 将 partial(power, exponent=3) 赋给 cube
print(cube(3))    # 27

# 固定 base=2，得到「2 的 n 次方」
pow2 = partial(power, 2)           # 将 partial(power, 2) 赋给 pow2
print(pow2(10))   # 1024
\`\`\`

实际用途：简化重复参数。

\`\`\`python
import int as _  # 假设场景
# 把字符串转成 int 并指定进制
from functools import partial      # 从 functools 导入 partial
basetwo = partial(int, base=2)     # 将 partial(int, base=2) 赋给 basetwo
print(basetwo("1010"))  # 10，二进制 1010 = 十进制 10
\`\`\`

#### lru_cache —— LRU 缓存

\`functools.lru_cache(maxsize=128, typed=False)\` 是装饰器，用 LRU（Least Recently Used）算法缓存函数结果，避免重复计算。

\`\`\`python
from functools import lru_cache    # 从 functools 导入 lru_cache

@lru_cache(maxsize=128)
def fib(n):                        # 定义函数 fib，参数：n
    if n < 2:                      # 如果 n < 2 成立
        return n                   # 返回 n
    return fib(n-1) + fib(n-2)     # 返回 fib(n-1) + fib(n-2)

print(fib(100))  # 瞬间算出，无缓存时会指数级慢
\`\`\`

不加 \`lru_cache\` 时，\`fib(100)\` 需要计算天文数字的递归次数；加上后每个 \`n\` 只算一次。

查看缓存信息：

\`\`\`python
print(fib.cache_info())            # 输出 fib.cache_info()
# CacheInfo(hits=98, misses=101, maxsize=128, currsize=101)
\`\`\`

- \`typed=True\` 时，\`3\` 和 \`3.0\` 会被视为不同的键。

**适用场景**：
- 纯函数（同样输入永远同样输出）
- 计算昂贵、调用频繁的函数
- 函数参数必须是**可哈希**的（list、dict 不能作为参数）

**不适用**：
- 有副作用的函数
- 返回可变对象且调用方会修改的场景（缓存会被污染）

#### cache —— 简化版缓存

Python 3.9+ 提供了 \`functools.cache\`，等价于 \`lru_cache(maxsize=None)\`（无上限缓存）：

\`\`\`python
from functools import cache        # 从 functools 导入 cache

@cache
def factorial(n):                  # 定义函数 factorial，参数：n
    return 1 if n < 2 else n * factorial(n-1)  # 返回 1 if n < 2 else n * factorial(n-1)

print(factorial(50))               # 输出 factorial(50)
\`\`\`

#### cmp_to_key —— 旧式比较函数转 key

在 Python 2 中，排序用「比较函数」\`cmp(a, b)\`（返回负数/0/正数）。Python 3 改用 \`key\` 函数。如果手头只有旧的 \`cmp\` 函数，可以用 \`cmp_to_key\` 转换：

\`\`\`python
from functools import cmp_to_key   # 从 functools 导入 cmp_to_key

# 比较函数：按「奇偶性优先，再按大小」
def compare(a, b):                 # 定义函数 compare，参数：a, b
    if a % 2 != b % 2:             # 如果 a % 2 != b % 2 成立
        return -1 if a % 2 == 1 else 1   # 奇数排前
    return a - b                   # 返回 a - b

nums = [5, 2, 8, 1, 6, 3]          # 创建列表并赋给 nums
print(sorted(nums, key=cmp_to_key(compare)))  # 输出 sorted(nums, key=cmp_to_key(compare))
# [1, 3, 5, 2, 6, 8]  奇数升序在前，偶数升序在后
\`\`\`

#### reduce —— 归约

\`functools.reduce(func, iterable, initializer)\` 把一个二元函数累积地应用到可迭代对象上，最终归约为一个值。

\`\`\`python
from functools import reduce       # 从 functools 导入 reduce

# 求和
nums = [1, 2, 3, 4, 5]             # 创建列表并赋给 nums
total = reduce(lambda a, b: a + b, nums)  # 将 reduce(lambda a, b: a + b, nums) 赋给 total
print(total)  # 15

# 求阶乘
factorial = reduce(lambda a, b: a * b, range(1, 6))  # 将 reduce(lambda a, b: a * b, range(1, 6)) 赋给 factorial
print(factorial)  # 120

# 找最大值
maximum = reduce(lambda a, b: a if a > b else b, nums)  # 将 reduce(lambda a, b: a if a > b else b, nums) 赋给 maximum
print(maximum)  # 5

# 带 initializer
total = reduce(lambda a, b: a + b, nums, 100)  # 将 reduce(lambda a, b: a + b, nums, 100) 赋给 total
print(total)  # 115
\`\`\`

reduce 的执行过程：\`reduce(f, [a, b, c, d])\` 等价于 \`f(f(f(a, b), c), d)\`。

> **注意**：Guido 本人不怎么喜欢 reduce，认为大部分场景用 \`sum\`、\`max\`、\`min\` 或循环更清晰。reduce 适合「累积」语义明确的场景。

#### singledispatch —— 单分派泛型函数

\`functools.singledispatch\` 实现**基于第一个参数类型的函数重载**。Python 不支持传统重载，singledispatch 是替代方案。

\`\`\`python
from functools import singledispatch  # 从 functools 导入 singledispatch

@singledispatch
def to_json(obj):                  # 定义函数 to_json，参数：obj
    raise TypeError(f"不支持类型: {type(obj)}")  # 抛出异常：TypeError(f"不支持类型: {type(obj)}")

@to_json.register
def _(obj: str):                   # 定义函数 _，参数：obj: str
    return f'"{obj}"'              # 返回 f'"{obj}"'

@to_json.register
def _(obj: int):                   # 定义函数 _，参数：obj: int
    return str(obj)                # 返回 str(obj)

@to_json.register
def _(obj: list):                  # 定义函数 _，参数：obj: list
    return "[" + ", ".join(to_json(x) for x in obj) + "]"  # 返回 "[" + ", ".join(to_json(x) for x in obj) + "]"

print(to_json("hello"))      # "hello"
print(to_json(42))           # 42
print(to_json([1, "a", 2]))  # [1, "a", 2]
\`\`\`

也可以用类型注解直接注册，或用 \`@to_json.register(dict)\` 显式指定类型。它还支持**按子类分派**（MRO）。

### reduce 的实现原理

理解 reduce 的本质，自己实现一个：

\`\`\`python
def my_reduce(func, iterable, initializer=None):  # 定义函数 my_reduce，参数：func, iterable, initializer=None
    it = iter(iterable)            # 将 iter(iterable) 赋给 it
    if initializer is None:        # 如果 initializer is None 成立
        try:                       # 尝试执行以下代码块
            accumulator = next(it) # 将 next(it) 赋给 accumulator
        except StopIteration:      # 捕获 StopIteration 异常
            raise TypeError("reduce() of empty seq with no initial value")  # 抛出异常：TypeError("reduce() of empty seq with no initial value")
    else:                          # 否则
        accumulator = initializer  # 将 initializer 赋给 accumulator
    for item in it:                # 遍历 it，每次取值赋给 item
        accumulator = func(accumulator, item)  # 将 func(accumulator, item) 赋给 accumulator
    return accumulator             # 返回 accumulator

print(my_reduce(lambda a, b: a + b, [1, 2, 3, 4]))  # 10
\`\`\`

### 柯里化与偏应用

**柯里化（Currying）** 是把「接收多个参数的函数」转成「一系列接收单个参数的函数」的过程。**偏应用（Partial Application）** 是固定部分参数得到新函数。二者常被混淆。

\`\`\`python
# 原始：三参数函数
def add3(a, b, c):                 # 定义函数 add3，参数：a, b, c
    return a + b + c               # 返回 a + b + c

# 柯里化版本：每次只接收一个参数
def curry_add3(a):                 # 定义函数 curry_add3，参数：a
    def inner1(b):                 # 定义函数 inner1，参数：b
        def inner2(c):             # 定义函数 inner2，参数：c
            return a + b + c       # 返回 a + b + c
        return inner2              # 返回 inner2
    return inner1                  # 返回 inner1

print(curry_add3(1)(2)(3))  # 6

# 偏应用：固定部分参数
from functools import partial      # 从 functools 导入 partial
add_1_2 = partial(add3, 1, 2)      # 将 partial(add3, 1, 2) 赋给 add_1_2
print(add_1_2(3))  # 6
\`\`\`

Python 没有内置柯里化，但可以写一个通用的柯里化装饰器（见代码示例）。

### 不可变数据思维

函数式编程强调**不可变性（Immutability）**：数据一旦创建就不修改，需要变化时返回新数据。这样可以避免共享状态带来的 bug，也是并发安全的基础。

\`\`\`python
# 可变思维（命令式）
def add_one_mut(nums):             # 定义函数 add_one_mut，参数：nums
    result = []                    # 创建列表并赋给 result
    for n in nums:                 # 遍历 nums，每次取值赋给 n
        result.append(n + 1)       # 对 result 调用 追加 方法，参数 n + 1
    return result                  # 返回 result

# 不可变思维（函数式）
def add_one_imm(nums):             # 定义函数 add_one_imm，参数：nums
    return tuple(n + 1 for n in nums)  # 返回不可变的 tuple

# 不可变更新字典
def update(d, key, value):         # 定义函数 update，参数：d, key, value
    new = dict(d)        # 拷贝
    new[key] = value     # 修改副本
    return new                     # 返回 new

config = {"host": "localhost", "port": 8080}  # 创建字典并赋给 config
new_config = update(config, "port", 9000)  # 将 update(config, "port", 9000) 赋给 new_config
print(config)      # 原字典不变
print(new_config)                  # 输出 new_config
\`\`\`

Python 的 \`tuple\`、\`frozenset\`、\`str\`、\`bytes\` 是内置的不可变类型。第三方库 \`dataclasses\`（frozen=True）和 \`pyrsistent\` 提供更强大的不可变数据结构。

### 纯函数

**纯函数（Pure Function）** 满足两个条件：
1. **相同的输入永远产生相同的输出**（无随机性、不依赖外部可变状态）
2. **没有副作用**（不修改外部状态、不读写文件、不打印——除了返回值什么也不做）

\`\`\`python
# 纯函数
def add(a, b):                     # 定义函数 add，参数：a, b
    return a + b                   # 返回 a + b

# 非纯函数：依赖外部状态
total = 0                          # 将整数 0 赋给 total
def add_to_total(x):               # 定义函数 add_to_total，参数：x
    global total
    total += x                     # total 加 x
    return total                   # 返回 total

# 非纯函数：有副作用
def greet(name):                   # 定义函数 greet，参数：name
    print(f"Hello, {name}")  # 打印是副作用
    return name                    # 返回 name
\`\`\`

纯函数的好处：
- **可测试**：不需要 mock 外部状态
- **可缓存**：因为结果只依赖输入
- **可并行**：无共享状态，天然线程安全
- **可推理**：调用多少次、什么顺序都不影响结果

### 函数组合

**函数组合（Function Composition）** 是把多个函数串联起来，前一个的输出作为后一个的输入，形成新函数。这是函数式编程组织逻辑的核心方式。

\`\`\`python
def compose(*funcs):               # 定义函数 compose，参数：*funcs
    """从右向左组合函数：compose(f, g, h)(x) = f(g(h(x)))"""
    def composed(x):               # 定义函数 composed，参数：x
        for f in reversed(funcs):  # 遍历 reversed(funcs)，每次取值赋给 f
            x = f(x)               # 将 f(x) 赋给 x
        return x                   # 返回 x
    return composed                # 返回 composed

# 组合：先 +1，再 *2，再转字符串
pipeline = compose(str, lambda x: x * 2, lambda x: x + 1)  # 将 compose(str, lambda x: x * 2, lambda x: x + 1) 赋给 pipeline
print(pipeline(3))  # str((3+1)*2) = "8"
\`\`\`

也可以做从左向右的管道（pipe）：

\`\`\`python
def pipe(*funcs):                  # 定义函数 pipe，参数：*funcs
    """从左向右组合：pipe(f, g, h)(x) = h(g(f(x)))"""
    def piped(x):                  # 定义函数 piped，参数：x
        for f in funcs:            # 遍历 funcs，每次取值赋给 f
            x = f(x)               # 将 f(x) 赋给 x
        return x                   # 返回 x
    return piped                   # 返回 piped

pipeline = pipe(lambda x: x + 1, lambda x: x * 2, str)  # 将 pipe(lambda x: x + 1, lambda x: x * 2, str) 赋给 pipeline
print(pipeline(3))  # "8"
\`\`\`

### 函数式 vs 命令式对比

下面用同一个问题展示两种风格的差异。

**问题：给定一个数字列表，取出所有偶数，每个平方，再求和。**

\`\`\`python
nums = range(1, 11)                # 将 range(1, 11) 赋给 nums

# 命令式：一步步描述怎么做
result = 0                         # 将整数 0 赋给 result
for n in nums:                     # 遍历 nums，每次取值赋给 n
    if n % 2 == 0:                 # 如果 n % 2 == 0 成立
        result += n ** 2           # result 加 n ** 2
print(result)  # 220

# 函数式：描述「是什么」
from functools import reduce       # 从 functools 导入 reduce
result = sum(n ** 2 for n in nums if n % 2 == 0)  # 将 sum(n ** 2 for n in nums if n % 2 == 0) 赋给 result
print(result)  # 220

# 纯函数式链式
result = reduce(                   # 将 reduce( 赋给 result
    lambda a, b: a + b,
    map(lambda x: x ** 2, filter(lambda x: x % 2 == 0, nums))  # 调用 映射，参数 lambda x: x ** 2, filter(lambda x: x % 2 == 0, nums)
)
print(result)  # 220
\`\`\`

| 维度 | 命令式 | 函数式 |
| --- | --- | --- |
| 关注点 | 怎么做（控制流） | 是什么（数据流） |
| 状态 | 修改变量 | 避免修改，返回新值 |
| 可读性 | 接近机器执行 | 接近数学表达 |
| 并发 | 需加锁 | 天然友好（无共享状态） |
| 调试 | 容易跟踪变量 | 需理解数据流 |

### operator 模块

\`operator\` 模块把运算符封装成函数，避免到处写 lambda。

#### itemgetter —— 按索引/键取值

\`\`\`python
from operator import itemgetter    # 从 operator 导入 itemgetter

students = [("张三", 88), ("李四", 95), ("王五", 72)]  # 创建列表并赋给 students
# 取第二个元素（分数）
get_score = itemgetter(1)          # 将 itemgetter(1) 赋给 get_score
print(get_score(students[0]))  # 88

# 排序
print(sorted(students, key=itemgetter(1)))  # 输出 sorted(students, key=itemgetter(1))
# 等价于 key=lambda s: s[1]

# 多级排序
data = [("a", 2), ("b", 1), ("a", 1)]  # 创建列表并赋给 data
print(sorted(data, key=itemgetter(0, 1)))  # 输出 sorted(data, key=itemgetter(0, 1))
# [('a', 1), ('a', 2), ('b', 1)]
\`\`\`

#### attrgetter —— 按属性取值

\`\`\`python
from operator import attrgetter    # 从 operator 导入 attrgetter

class Point:                       # 定义类 Point
    def __init__(self, x, y):      # 定义函数 __init__，参数：self, x, y
        self.x = x
        self.y = y
    def __repr__(self):            # 定义函数 __repr__，参数：self
        return f"Point({self.x}, {self.y})"  # 返回 f"Point({self.x}, {self.y})"

points = [Point(3, 4), Point(1, 9), Point(2, 1)]  # 创建列表并赋给 points
print(sorted(points, key=attrgetter("x")))  # 输出 sorted(points, key=attrgetter("x"))
# [Point(1, 9), Point(2, 1), Point(3, 4)]

# 多属性
print(sorted(points, key=attrgetter("x", "y")))  # 输出 sorted(points, key=attrgetter("x", "y"))
\`\`\`

#### methodcaller —— 调用方法

\`\`\`python
from operator import methodcaller  # 从 operator 导入 methodcaller

words = ["Hello", "WORLD", "Python"]  # 创建列表并赋给 words
# 等价于 lambda s: s.lower()
lowers = list(map(methodcaller("lower"), words))  # 将 list(map(methodcaller("lower"), words)) 赋给 lowers
print(lowers)  # ['hello', 'world', 'python']

# 带参数
s = "hello world"                  # 将字符串 "hello world" 赋给 s
f = methodcaller("replace", "world", "python")  # 将 methodcaller("replace", "world", "python") 赋给 f
print(f(s))  # hello python

# 用于排序：按 split 后的第一段
paths = ["a/b/c", "x/y", "m/n/o"]  # 创建列表并赋给 paths
print(sorted(paths, key=methodcaller("split", "/")))  # 输出 sorted(paths, key=methodcaller("split", "/"))
\`\`\`

#### 其他常用运算符函数

\`\`\`python
from operator import add, mul, sub, truediv, mod, pow  # 从 operator 导入 add, mul, sub, truediv, mod, pow
from operator import eq, ne, lt, le, gt, ge  # 从 operator 导入 eq, ne, lt, le, gt, ge
from operator import and_, or_, xor, not_  # 从 operator 导入 and_, or_, xor, not_
from operator import contains      # 从 operator 导入 contains

print(add(2, 3))      # 5，等价 2 + 3
print(mul(4, 5))      # 20
print(truediv(7, 2))  # 3.5
print(gt(3, 2))       # True
print(contains([1,2,3], 2))  # True，等价 2 in [1,2,3]

# 配合 reduce
from functools import reduce       # 从 functools 导入 reduce
print(reduce(add, [1, 2, 3, 4]))   # 10
print(reduce(mul, [1, 2, 3, 4]))   # 24
\`\`\`

### 本章小结

| 概念 | 关键点 | 工具 |
| --- | --- | --- |
| 一等公民 | 函数可赋值、传参、返回、存储 | lambda、def |
| 高阶函数 | 接收或返回函数 | map/filter/sorted |
| 闭包 | 携带自由变量的函数 | nonlocal |
| 偏函数 | 固定部分参数 | functools.partial |
| 缓存 | 记忆化避免重复计算 | lru_cache / cache |
| 归约 | 累积归并为单值 | functools.reduce |
| 单分派 | 按类型分派 | singledispatch |
| 柯里化 | 拆成单参数链 | 自定义装饰器 |
| 不可变 | 不修改，返回新值 | tuple/frozenset |
| 纯函数 | 无副作用，结果可预测 | 编程习惯 |
| 函数组合 | 串联函数成管道 | compose/pipe |
| 运算符函数 | 替代 lambda | operator 模块 |

函数式编程不是要完全替代命令式，而是提供另一种组织代码的视角。在数据处理、并发、测试驱动场景下，函数式思维尤其有价值。下面的代码示例将完整演示这些概念。
`,
    code: `# ============================================================
# 第一章代码：函数式编程深入演示
# ============================================================
# 涵盖：一等公民、高阶函数、闭包、functools、operator、组合、纯函数

from functools import (
    partial, lru_cache, cache, cmp_to_key, reduce, singledispatch, wraps
)
from operator import (
    itemgetter, attrgetter, methodcaller,
    add, mul, sub, truediv, mod, pow as op_pow,
    eq, ne, lt, le, gt, ge, contains,
)
import time

print("=" * 60)
print("1. 函数是一等公民")
print("=" * 60)

# 函数可以被赋值、传参、返回、存储
def shout(text):
    return text.upper()

def whisper(text):
    return text.lower()

speak = shout  # 赋值
print("赋值后调用:", speak("hello"))

def apply_twice(func, value):  # 作为参数
    return func(func(value))

print("apply_twice(shout, 'hi'):", apply_twice(shout, "hi"))

def make_greeter(greeting):  # 返回函数（闭包）
    def greet(name):
        return f"{greeting}, {name}!"
    return greet

hello = make_greeter("你好")
hi = make_greeter("嗨")
print(hello("张三"))
print(hi("李四"))

# 存储在数据结构中
ops = {"shout": shout, "whisper": whisper}
print("字典调用:", ops["shout"]("world"))

print()
print("=" * 60)
print("2. 高阶函数：map / filter / sorted")
print("=" * 60)

nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# map：对每个元素应用函数
squares = list(map(lambda x: x ** 2, nums))
print("平方:", squares)

# 多个可迭代对象
sums = list(map(lambda a, b: a + b, [1, 2, 3], [10, 20, 30]))
print("对应相加:", sums)

# filter：过滤
evens = list(filter(lambda x: x % 2 == 0, nums))
print("偶数:", evens)

# None 作为过滤函数，保留真值
truthy = list(filter(None, [0, 1, "", "a", None, [], [1], {}]))
print("真值:", truthy)

# sorted 带 key
words = ["banana", "apple", "Cherry", "date"]
print("按长度:", sorted(words, key=len))
print("忽略大小写:", sorted(words, key=str.lower))

students = [("张三", 88), ("李四", 95), ("王五", 72), ("赵六", 95)]
print("按分数降序:", sorted(students, key=lambda s: s[1], reverse=True))

# 多条件排序
print("分数降序+姓名升序:", sorted(students, key=lambda s: (-s[1], s[0])))

print()
print("=" * 60)
print("3. 闭包深入")
print("=" * 60)

# 计数器闭包
def make_counter(start=0):
    count = start
    def counter():
        nonlocal count
        count += 1
        return count
    return counter

c1 = make_counter()
c2 = make_counter(100)
print("c1:", c1(), c1(), c1())  # 1 2 3
print("c2:", c2(), c2())        # 101 102
print("自由变量:", c1.__code__.co_freevars)

# 闭包陷阱：循环变量
bad = [lambda: i for i in range(3)]
print("陷阱（都返回2）:", [f() for f in bad])

good = [lambda i=i: i for i in range(3)]
print("修复（默认参数）:", [f() for f in good])

# 闭包实现累加器
def make_accumulator():
    total = 0
    def add(x):
        nonlocal total
        total += x
        return total
    return add

acc = make_accumulator()
print("累加:", acc(10), acc(20), acc(5))  # 10 30 35

print()
print("=" * 60)
print("4. functools.partial 偏函数")
print("=" * 60)

def power(base, exponent):
    return base ** exponent

square = partial(power, exponent=2)
cube = partial(power, exponent=3)
pow2 = partial(power, 2)
print("square(5):", square(5))
print("cube(3):", cube(3))
print("pow2(10):", pow2(10))

# 实用：固定 print 的参数
debug = partial(print, "[DEBUG]")
debug("这", "是", "调试信息")

# 二进制转换
basetwo = partial(int, base=2)
print("二进制 1010 =", basetwo("1010"))

print()
print("=" * 60)
print("5. lru_cache / cache 缓存")
print("=" * 60)

# 递归斐波那契 + 缓存
@lru_cache(maxsize=128)
def fib(n):
    if n < 2:
        return n
    return fib(n-1) + fib(n-2)

t0 = time.time()
result = fib(50)
t1 = time.time()
print("fib(50) =", result)
print("耗时: %.4f 秒" % (t1 - t0))
print("缓存信息:", fib.cache_info())
fib.cache_clear()
print("清空后:", fib.cache_info())

# cache（无上限）
@cache
def factorial(n):
    return 1 if n < 2 else n * factorial(n-1)

print("factorial(20) =", factorial(20))

# typed 选项
@lru_cache(typed=True)
def typed_cache(x):
    return x

typed_cache(1)
typed_cache(1.0)
print("typed=True 时 1 和 1.0 分别缓存:", typed_cache.cache_info())

print()
print("=" * 60)
print("6. cmp_to_key")
print("=" * 60)

def compare_parity(a, b):
    # 奇数在前，偶数在后；同类按升序
    if a % 2 != b % 2:
        return -1 if a % 2 == 1 else 1
    return a - b

nums = [5, 2, 8, 1, 6, 3, 7, 4]
print("奇偶排序:", sorted(nums, key=cmp_to_key(compare_parity)))

print()
print("=" * 60)
print("7. reduce 归约")
print("=" * 60)

nums = [1, 2, 3, 4, 5]
print("求和:", reduce(add, nums))
print("求积:", reduce(mul, nums))
print("最大值:", reduce(lambda a, b: a if a > b else b, nums))
print("带初值:", reduce(add, nums, 100))
print("拼接:", reduce(lambda a, b: a + b, ["a", "b", "c", "d"]))

# 自己实现 reduce
def my_reduce(func, iterable, initializer=None):
    it = iter(iterable)
    if initializer is None:
        try:
            acc = next(it)
        except StopIteration:
            raise TypeError("reduce() of empty seq with no initial value")
    else:
        acc = initializer
    for item in it:
        acc = func(acc, item)
    return acc

print("my_reduce 求和:", my_reduce(add, nums))

print()
print("=" * 60)
print("8. singledispatch 单分派")
print("=" * 60)

@singledispatch
def to_json(obj):
    return str(obj)

@to_json.register
def _(obj: str):
    return '"' + obj + '"'

@to_json.register
def _(obj: int):
    return str(obj)

@to_json.register
def _(obj: float):
    return f"{obj}"

@to_json.register
def _(obj: list):
    return "[" + ", ".join(to_json(x) for x in obj) + "]"

@to_json.register
def _(obj: dict):
    items = ", ".join(to_json(k) + ": " + to_json(v) for k, v in obj.items())
    return "{" + items + "}"

@to_json.register
def _(obj: bool):
    return "true" if obj else "false"

@to_json.register
def _(obj: type(None)):
    return "null"

print(to_json("hello"))
print(to_json(42))
print(to_json([1, "a", True, None]))
print(to_json({"name": "张三", "age": 28, "scores": [90, 85]}))

print()
print("=" * 60)
print("9. 柯里化与偏应用")
print("=" * 60)

def add3(a, b, c):
    return a + b + c

# 柯里化
def curry_add3(a):
    def inner1(b):
        def inner2(c):
            return a + b + c
        return inner2
    return inner1

print("柯里化:", curry_add3(1)(2)(3))

# 偏应用
add_1_2 = partial(add3, 1, 2)
print("偏应用:", add_1_2(3))

# 通用柯里化装饰器
def curry(func):
    arity = func.__code__.co_argcount
    def wrapper(*args):
        if len(args) >= arity:
            return func(*args)
        return lambda *more: wrapper(*(args + more))
    return wrapper

@curry
def add3c(a, b, c):
    return a + b + c

print("通用柯里化:", add3c(1)(2)(3))
print("部分应用:", add3c(1, 2)(3))

print()
print("=" * 60)
print("10. 不可变数据思维")
print("=" * 60)

# tuple 替代 list
coords = (3, 4)
# coords[0] = 5  # 报错：tuple 不可变

# 不可变更新字典
def update_dict(d, key, value):
    new = dict(d)
    new[key] = value
    return new

config = {"host": "localhost", "port": 8080}
new_config = update_dict(config, "port", 9000)
print("原配置:", config)
print("新配置:", new_config)

# frozenset
fs = frozenset([1, 2, 3, 2, 1])
print("frozenset:", fs)

print()
print("=" * 60)
print("11. 纯函数与副作用对比")
print("=" * 60)

# 纯函数
def pure_add(a, b):
    return a + b

# 非纯：依赖全局状态
counter = 0
def impure_increment():
    global counter
    counter += 1
    return counter

print("纯函数:", pure_add(2, 3), pure_add(2, 3))
print("非纯:", impure_increment(), impure_increment())

# 纯函数：不修改输入
def pure_sort(lst):
    return sorted(lst)  # 返回新列表

original = [3, 1, 2]
sorted_list = pure_sort(original)
print("原列表不变:", original, sorted_list)

print()
print("=" * 60)
print("12. 函数组合")
print("=" * 60)

def compose(*funcs):
    """从右向左: compose(f, g, h)(x) = f(g(h(x)))"""
    def composed(x):
        for f in reversed(funcs):
            x = f(x)
        return x
    return composed

def pipe(*funcs):
    """从左向右: pipe(f, g, h)(x) = h(g(f(x)))"""
    def piped(x):
        for f in funcs:
            x = f(x)
        return x
    return piped

# 管道：+1 -> *2 -> 转字符串
pipeline = pipe(lambda x: x + 1, lambda x: x * 2, str)
print("pipe:", pipeline(3))  # "8"

pipeline2 = compose(str, lambda x: x * 2, lambda x: x + 1)
print("compose:", pipeline2(3))  # "8"

# 多函数组合处理文本
process_text = pipe(
    str.strip,
    methodcaller("lower"),
    lambda s: s.replace("  ", " "),
)
print("文本处理:", process_text("  Hello   WORLD  "))

print()
print("=" * 60)
print("13. 函数式 vs 命令式对比")
print("=" * 60)

nums = list(range(1, 11))

# 命令式
def imperative_solution(nums):
    result = 0
    for n in nums:
        if n % 2 == 0:
            result += n ** 2
    return result

# 函数式（生成器表达式）
def functional_solution(nums):
    return sum(n ** 2 for n in nums if n % 2 == 0)

# 纯函数式链
def pure_functional(nums):
    return reduce(add, map(lambda x: x ** 2, filter(lambda x: x % 2 == 0, nums)))

print("命令式:", imperative_solution(nums))
print("函数式:", functional_solution(nums))
print("纯链式:", pure_functional(nums))

print()
print("=" * 60)
print("14. operator 模块")
print("=" * 60)

# itemgetter
students = [("张三", 88), ("李四", 95), ("王五", 72)]
get_score = itemgetter(1)
print("itemgetter 取分:", get_score(students[0]))
print("按分数排序:", sorted(students, key=itemgetter(1)))

data = [("a", 2), ("b", 1), ("a", 1)]
print("多级排序:", sorted(data, key=itemgetter(0, 1)))

# attrgetter
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def __repr__(self):
        return "Point(%d, %d)" % (self.x, self.y)

points = [Point(3, 4), Point(1, 9), Point(2, 1)]
print("按 x 排序:", sorted(points, key=attrgetter("x")))
print("按 x,y 排序:", sorted(points, key=attrgetter("x", "y")))

# methodcaller
words = ["Hello", "WORLD", "Python"]
print("methodcaller lower:", list(map(methodcaller("lower"), words)))

s = "hello world"
replace_world = methodcaller("replace", "world", "python")
print("带参数:", replace_world(s))

# 运算符函数
print("add(2,3):", add(2, 3))
print("mul(4,5):", mul(4, 5))
print("truediv(7,2):", truediv(7, 2))
print("mod(7,3):", mod(7, 3))
print("op_pow(2,10):", op_pow(2, 10))
print("gt(3,2):", gt(3, 2))
print("contains([1,2,3], 2):", contains([1, 2, 3], 2))

# 配合 reduce
print("reduce add:", reduce(add, [1, 2, 3, 4, 5]))
print("reduce mul:", reduce(mul, [1, 2, 3, 4, 5]))

print()
print("=" * 60)
print("15. 综合实战：函数式数据处理流水线")
print("=" * 60)

# 模拟订单数据
orders = [
    {"id": 1, "customer": "张三", "amount": 120, "status": "paid"},
    {"id": 2, "customer": "李四", "amount": 80, "status": "pending"},
    {"id": 3, "customer": "张三", "amount": 200, "status": "paid"},
    {"id": 4, "customer": "王五", "amount": 50, "status": "paid"},
    {"id": 5, "customer": "李四", "amount": 300, "status": "paid"},
    {"id": 6, "customer": "张三", "amount": 90, "status": "refunded"},
]

# 函数式：找出已支付的，按客户分组求总额，取金额超过 100 的客户
def analyze(orders):
    paid = filter(lambda o: o["status"] == "paid", orders)
    by_amount = map(lambda o: (o["customer"], o["amount"]), paid)

    totals = {}
    for customer, amount in by_amount:
        totals[customer] = totals.get(customer, 0) + amount

    big = filter(lambda kv: kv[1] > 100, totals.items())
    return dict(sorted(big, key=itemgetter(1), reverse=True))

print("高消费客户:", analyze(orders))

# 用纯函数组合
get_amount = itemgetter("amount")
get_customer = itemgetter("customer")
get_status = itemgetter("status")

print()
print("=" * 60)
print("全部函数式编程演示完成！")
print("=" * 60)
`,
  },

  // =========================================================
  // 第二章：多线程编程
  // =========================================================
  {
    id: "py-threading",
    group: "函数式与并发",
    icon: "🧵",
    title: "多线程编程",
    content: `## 多线程编程

**多线程（Multithreading）** 是并发编程的重要方式。它允许在**同一个进程**内运行多个**线程**，线程之间共享内存，可以并发执行任务。Python 通过 \`threading\` 模块提供多线程支持，通过 \`concurrent.futures.ThreadPoolExecutor\` 提供线程池。本章将系统讲解多线程的创建、同步、通信、线程池，以及绕不开的 **GIL（全局解释器锁）**。

### 线程 vs 进程：先理清概念

在深入代码前，先理清几个核心概念：

| 概念 | 进程（Process） | 线程（Thread） |
| --- | --- | --- |
| 内存 | 独立地址空间，互不共享 | 共享所属进程的内存 |
| 创建开销 | 大（需复制内存空间） | 小（共享内存） |
| 通信方式 | 管道、队列、共享内存（复杂） | 直接读写共享变量（简单但需同步） |
| 切换成本 | 高 | 低 |
| 安全性 | 一个进程崩溃不影响其他 | 一个线程崩溃可能拖垮整个进程 |
| 并行 | 可真正并行（多核） | Python 受 GIL 限制，IO 并发为主 |

一句话总结：**进程是资源分配的单位，线程是 CPU 调度的单位**。

### threading 模块基础

#### 创建线程的三种方式

\`\`\`python
import threading                   # 导入 threading 模块
import time                        # 导入 time 模块

# 方式一：函数 + Thread
def worker(name, delay):           # 定义函数 worker，参数：name, delay
    for i in range(3):             # 遍历 range(3)，每次取值赋给 i
        time.sleep(delay)          # 对 time 调用 sleep 方法，参数 delay
        print(f"[{name}] 第 {i+1} 次")  # 输出 f"[{name}] 第 {i+1} 次"

t = threading.Thread(target=worker, args=("A", 0.1))  # 将 threading.Thread(target=worker, args=("A", 0.1)) 赋给 t
t.start()                          # 对 t 调用 start 方法
t.join()                           # 对 t 调用 连接 方法

# 方式二：继承 Thread 类
class MyThread(threading.Thread):  # 定义类 MyThread，继承自 threading.Thread
    def __init__(self, name):      # 定义函数 __init__，参数：self, name
        super().__init__(name=name)  # 调用 super，参数 ).__init__(name=name
    def run(self):                 # 定义函数 run，参数：self
        print(f"线程 {self.name} 运行中")  # 输出 f"线程 {self.name} 运行中"

t2 = MyThread("自定义线程")             # 将 MyThread("自定义线程") 赋给 t2
t2.start()                         # 对 t2 调用 start 方法
t2.join()                          # 对 t2 调用 连接 方法

# 方式三：lambda
t3 = threading.Thread(target=lambda: print("lambda 线程"))  # 将 threading.Thread(target=lambda: print("lambda 线程")) 赋给 t3
t3.start()                         # 对 t3 调用 start 方法
t3.join()                          # 对 t3 调用 连接 方法
\`\`\`

#### Thread 的常用参数

\`\`\`python
threading.Thread(
    group=None,        # 保留参数，未使用
    target=None,       # 线程执行的函数
    name=None,         # 线程名（用于调试）
    args=(),           # 位置参数
    kwargs={},         # 关键字参数
    daemon=None,       # 是否为守护线程
)
\`\`\`

#### start / join / is_alive

\`\`\`python
t = threading.Thread(target=time.sleep, args=(0.5,))  # 将 threading.Thread(target=time.sleep, args=(0.5,)) 赋给 t
print("启动前 is_alive:", t.is_alive())  # False
t.start()                          # 对 t 调用 start 方法
print("启动后 is_alive:", t.is_alive())  # True
t.join()  # 等待线程结束
print("join 后 is_alive:", t.is_alive())  # False
\`\`\`

- \`start()\`：启动线程（只能调用一次，重复调用报错）
- \`join(timeout=None)\`：等待线程结束，可设超时
- \`is_alive()\`：线程是否还在运行

#### daemon 守护线程

**守护线程（Daemon Thread）** 是「后台」线程：当主线程退出时，守护线程会被强制终止（不会等待它完成）。非守护线程会阻止主程序退出。

\`\`\`python
# 守护线程
def background():                  # 定义函数 background，无参数
    while True:                    # 当 True 为真时重复执行
        print("后台运行...")           # 输出 "后台运行..."
        time.sleep(1)              # 对 time 调用 sleep 方法，参数 1

t = threading.Thread(target=background, daemon=True)  # 将 threading.Thread(target=background, daemon=True) 赋给 t
t.start()                          # 对 t 调用 start 方法
# 主线程结束时，t 被立即终止
\`\`\`

设置守护线程的两种方式：
- 创建时 \`daemon=True\`
- 启动前 \`t.daemon = True\`

### 线程安全问题

多个线程访问共享数据时会出现**竞态条件（Race Condition）**：

\`\`\`python
# 经典竞态条件：自增
counter = 0                        # 将整数 0 赋给 counter
def increment():                   # 定义函数 increment，无参数
    global counter
    for _ in range(100000):        # 遍历 range(100000)，每次取值赋给 _
        counter += 1   # 非原子操作！

threads = [threading.Thread(target=increment) for _ in range(5)]  # 创建列表并赋给 threads
for t in threads: t.start()
for t in threads: t.join()
print(counter)  # 预期 500000，实际可能远小于（数据竞争）
\`\`\`

为什么 \`counter += 1\` 不安全？它实际是三步：①读取 counter ②加 1 ③写回 counter。线程可能在任一步切换，导致「丢失更新」。

解决方法：用**锁（Lock）**。

### Lock 互斥锁

\`threading.Lock\` 是最基础的同步原语，保证同一时刻只有一个线程进入临界区：

\`\`\`python
lock = threading.Lock()            # 将 threading.Lock() 赋给 lock
counter = 0                        # 将整数 0 赋给 counter

def safe_increment():              # 定义函数 safe_increment，无参数
    global counter
    for _ in range(100000):        # 遍历 range(100000)，每次取值赋给 _
        lock.acquire()   # 获取锁
        try:                       # 尝试执行以下代码块
            counter += 1           # counter 加 1
        finally:                   # 无论是否异常都执行
            lock.release()  # 释放锁（必须放在 finally）
\`\`\`

更推荐用 \`with\` 上下文管理器，自动释放锁：

\`\`\`python
def safe_increment():              # 定义函数 safe_increment，无参数
    global counter
    for _ in range(100000):        # 遍历 range(100000)，每次取值赋给 _
        with lock:                 # 使用上下文管理器 lock
            counter += 1           # counter 加 1
\`\`\`

### RLock 可重入锁

\`threading.RLock\`（Reentrant Lock）允许**同一个线程多次获取同一把锁**。普通 Lock 如果同一线程重复 acquire 会死锁，RLock 不会。

\`\`\`python
rlock = threading.RLock()          # 将 threading.RLock() 赋给 rlock

def outer():                       # 定义函数 outer，无参数
    with rlock:                    # 使用上下文管理器 rlock
        print("outer 获取锁")         # 输出 "outer 获取锁"
        inner()  # inner 也需要锁，RLock 允许

def inner():                       # 定义函数 inner，无参数
    with rlock:  # 同一线程再次获取，OK
        print("inner 再次获取锁")       # 输出 "inner 再次获取锁"

outer()                            # 调用 outer
\`\`\`

**适用场景**：递归函数、可重入的方法调用链。

### Semaphore 信号量

\`threading.Semaphore(n)\` 允许**最多 n 个线程**同时访问某资源。常用于限流（如限制并发连接数）。

\`\`\`python
# 限制同时只有 3 个线程访问
sem = threading.Semaphore(3)       # 将 threading.Semaphore(3) 赋给 sem

def access_resource(tid):          # 定义函数 access_resource，参数：tid
    with sem:                      # 使用上下文管理器 sem
        print(f"线程 {tid} 正在访问")    # 输出 f"线程 {tid} 正在访问"
        time.sleep(0.5)            # 对 time 调用 sleep 方法，参数 0.5
        print(f"线程 {tid} 完成")      # 输出 f"线程 {tid} 完成"

threads = [threading.Thread(target=access_resource, args=(i,)) for i in range(10)]  # 创建列表并赋给 threads
for t in threads: t.start()
for t in threads: t.join()
\`\`\`

- \`Semaphore(1)\` 等价于 \`Lock\`
- \`BoundedSemaphore\`：释放次数不能超过获取次数，更安全

### Event 事件

\`threading.Event\` 用于线程间简单的事件通知。Event 内部有一个标志位，\`set()\` 置为真，\`clear()\` 置为假，\`wait()\` 阻塞直到为真。

\`\`\`python
event = threading.Event()          # 将 threading.Event() 赋给 event

def waiter():                      # 定义函数 waiter，无参数
    print("等待事件...")               # 输出 "等待事件..."
    event.wait()          # 阻塞直到 event 被 set
    print("事件已触发！")                # 输出 "事件已触发！"

def setter():                      # 定义函数 setter，无参数
    time.sleep(1)                  # 对 time 调用 sleep 方法，参数 1
    print("触发事件")                  # 输出 "触发事件"
    event.set()                    # 对 event 调用 set 方法

t1 = threading.Thread(target=waiter)  # 将 threading.Thread(target=waiter) 赋给 t1
t2 = threading.Thread(target=setter)  # 将 threading.Thread(target=setter) 赋给 t2
t1.start(); t2.start()             # 对 t1 调用 start 方法，参数 ); t2.start(
t1.join(); t2.join()               # 对 t1 调用 连接 方法，参数 ); t2.join(
\`\`\`

\`wait(timeout)\` 可设超时，返回值表示是否等到（True/False）。

### Condition 条件变量

\`threading.Condition\` 比 Event 更强大，结合了锁和通知机制，适合**生产者-消费者**等场景。

\`\`\`python
cond = threading.Condition()       # 将 threading.Condition() 赋给 cond
items = []                         # 创建列表并赋给 items

def producer():                    # 定义函数 producer，无参数
    with cond:                     # 使用上下文管理器 cond
        items.append("商品")         # 对 items 调用 追加 方法，参数 "商品"
        cond.notify()  # 通知一个等待的线程
        # cond.notify_all()  通知所有

def consumer():                    # 定义函数 consumer，无参数
    with cond:                     # 使用上下文管理器 cond
        while not items:  # 必须用 while 防止虚假唤醒
            cond.wait()   # 释放锁并等待，被唤醒后重新获取锁
        print("消费:", items.pop())  # 输出 "消费:", items.pop()
\`\`\`

经典三步：①获取锁 ②检查条件不满足则 \`wait()\` ③满足则处理并 \`notify()\`。

### Queue 线程安全队列

\`queue.Queue\` 是**线程安全**的 FIFO 队列，内部已用锁保护，是多线程通信的推荐方式（比手动加锁更安全）。

\`\`\`python
from queue import Queue            # 从 queue 导入 Queue

q = Queue(maxsize=10)              # 将 Queue(maxsize=10) 赋给 q

# 生产者
q.put("任务")      # 满了会阻塞
# 消费者
item = q.get()     # 空了会阻塞
q.task_done()      # 标记任务完成
q.join()           # 等待所有任务被处理完
\`\`\`

Queue 的几种变体：
- \`Queue\`：FIFO 先进先出
- \`LifoQueue\`：LIFO 后进先出（栈）
- \`PriorityQueue\`：按优先级（元素需可比较）

\`put\` 和 \`get\` 都支持 \`block\` 和 \`timeout\` 参数：

\`\`\`python
q.put(item, block=False)       # 不阻塞，满了抛 queue.Full
q.get(timeout=2)               # 最多等 2 秒，超时抛 queue.Empty
\`\`\`

### 线程局部变量 threading.local

当多个线程需要各自的「私有」变量副本时，用 \`threading.local()\`：

\`\`\`python
local_data = threading.local()     # 将 threading.local() 赋给 local_data

def worker():                      # 定义函数 worker，无参数
    local_data.value = threading.current_thread().name
    time.sleep(0.1)                # 对 time 调用 sleep 方法，参数 0.1
    print(f"{threading.current_thread().name}: {local_data.value}")  # 输出 f"{threading.current_thread().name}: {local_data.value}"

# 每个线程看到的 local_data.value 都是自己的，互不干扰
\`\`\`

常用于：数据库连接、请求上下文（如 Flask 的 \`g\` 对象）。

### ThreadPoolExecutor 线程池

手动管理线程麻烦且低效（频繁创建销毁开销大）。\`concurrent.futures.ThreadPoolExecutor\` 提供线程池，复用线程。

\`\`\`python
from concurrent.futures import ThreadPoolExecutor  # 从 concurrent.futures 导入 ThreadPoolExecutor

def fetch(url):                    # 定义函数 fetch，参数：url
    time.sleep(0.5)  # 模拟网络请求
    return f"{url} 的内容"            # 返回 f"{url} 的内容"

with ThreadPoolExecutor(max_workers=5) as executor:  # 使用上下文管理器 ThreadPoolExecutor(max_workers=5)，绑定到 executor
    # submit：提交单个任务，返回 Future
    future = executor.submit(fetch, "http://a.com")  # 将 executor.submit(fetch, "http://a.com") 赋给 future
    print(future.result())  # 阻塞获取结果

    # map：批量提交，按顺序返回结果
    urls = ["http://a.com", "http://b.com", "http://c.com"]  # 创建列表并赋给 urls
    for result in executor.map(fetch, urls):  # 遍历 executor.map(fetch, urls)，每次取值赋给 result
        print(result)              # 输出 result
\`\`\`

#### submit + as_completed

\`as_completed\` 返回一个迭代器，**哪个任务先完成就先返回哪个**：

\`\`\`python
from concurrent.futures import as_completed  # 从 concurrent.futures 导入 as_completed

with ThreadPoolExecutor(max_workers=5) as executor:  # 使用上下文管理器 ThreadPoolExecutor(max_workers=5)，绑定到 executor
    futures = {executor.submit(fetch, url): url for url in urls}  # 创建字典并赋给 futures
    for future in as_completed(futures):  # 遍历 as_completed(futures)，每次取值赋给 future
        url = futures[future]      # 将 futures[future] 赋给 url
        try:                       # 尝试执行以下代码块
            print(future.result()) # 输出 future.result()
        except Exception as e:     # 捕获 Exception 异常并绑定到 e
            print(f"{url} 出错: {e}")  # 输出 f"{url} 出错: {e}"
\`\`\`

#### Future 对象

\`Future\` 表示一个异步操作的未来结果：
- \`result(timeout)\`：获取结果（阻塞，可设超时）
- \`exception()\`：获取异常（如果有）
- \`done()\`：是否完成
- \`add_done_callback(fn)\`：完成时回调
- \`cancel()\`：尝试取消（未开始的才能取消）

### GIL 全局解释器锁

**GIL（Global Interpreter Lock）** 是 CPython 的一个实现细节：**同一时刻，只有一个线程能执行 Python 字节码**。这意味着 Python 的多线程**无法利用多核 CPU 做真正的并行计算**。

#### 为什么有 GIL？

CPython 的内存管理（引用计数）不是线程安全的。为了简化实现，CPython 用一把全局锁保护整个解释器。这样虽然牺牲了多线程的并行性，但让 C 扩展开发简单很多。

#### GIL 的影响

- **CPU 密集型任务**：多线程**没有加速**，甚至比单线程慢（线程切换开销）。应该用多进程。
- **IO 密集型任务**：多线程**有效**。线程在等待 IO（网络、文件、sleep）时会释放 GIL，其他线程可以运行。

\`\`\`python
# CPU 密集：多线程不快
def cpu_task(n):                   # 定义函数 cpu_task，参数：n
    total = 0                      # 将整数 0 赋给 total
    for i in range(n):             # 遍历 range(n)，每次取值赋给 i
        total += i * i             # total 加 i * i
    return total                   # 返回 total

# 单线程
# 多线程：由于 GIL，两个线程串行执行 CPU 代码，反而更慢
\`\`\`

#### GIL 的释放时机

- IO 操作（文件读写、网络请求、time.sleep）
- 每执行一定数量的字节码（Python 3 中按时间片，约 5ms）会主动释放
- 调用 C 扩展中显式释放 GIL 的代码

#### Python 3.13 的自由线程

Python 3.13 引入了实验性的 **PEP 703 自由线程（Free-threaded / No-GIL）** 构建，可以禁用 GIL 实现真正的多线程并行。但目前还是实验阶段，许多扩展尚未适配。

### CPU 密集 vs IO 密集选型

| 任务类型 | 特点 | 推荐方案 |
| --- | --- | --- |
| CPU 密集 | 大量计算，少 IO | 多进程（multiprocessing）|
| IO 密集 | 网络请求、文件读写、数据库 | 多线程 / asyncio |
| 混合型 | 既有计算又有 IO | 拆分，计算用进程、IO 用线程/协程 |

### 线程间通信

线程间通信的推荐方式（从简单到复杂）：
1. **queue.Queue**：最推荐，线程安全，自动同步
2. **Event / Condition**：简单的事件通知
3. **共享变量 + Lock**：手动同步，容易出错

### 死锁与避免

**死锁（Deadlock）** 是两个或多个线程互相等待对方释放锁，导致永久阻塞。

\`\`\`python
# 经典死锁：两个锁互相等待
lock1 = threading.Lock()           # 将 threading.Lock() 赋给 lock1
lock2 = threading.Lock()           # 将 threading.Lock() 赋给 lock2

def task_a():                      # 定义函数 task_a，无参数
    with lock1:                    # 使用上下文管理器 lock1
        time.sleep(0.1)            # 对 time 调用 sleep 方法，参数 0.1
        with lock2:  # 等 lock2，但 task_b 持有它
            print("A")             # 输出 "A"

def task_b():                      # 定义函数 task_b，无参数
    with lock2:                    # 使用上下文管理器 lock2
        time.sleep(0.1)            # 对 time 调用 sleep 方法，参数 0.1
        with lock1:  # 等 lock1，但 task_a 持有它
            print("B")             # 输出 "B"
# 死锁！
\`\`\`

**避免死锁的策略**：
1. **统一锁顺序**：所有线程按相同顺序获取锁（如总是先 lock1 后 lock2）
2. **设置超时**：\`lock.acquire(timeout=5)\`，超时放弃
3. **避免嵌套锁**：尽量不在持锁时再获取其他锁
4. **用更高层抽象**：Queue、Condition 等

### 本章小结

| 工具 | 用途 |
| --- | --- |
| Thread | 创建线程 |
| Lock / RLock | 互斥同步 |
| Semaphore | 限流 |
| Event | 事件通知 |
| Condition | 条件等待 + 通知 |
| Queue | 线程安全通信 |
| local | 线程私有变量 |
| ThreadPoolExecutor | 线程池 |

核心原则：**IO 密集用线程，CPU 密集用进程；能用 Queue 就别手动加锁**。下面代码将完整演示这些概念。
`,
    code: `# ============================================================
# 第二章代码：多线程编程演示
# ============================================================
# 涵盖：Thread、Lock、RLock、Semaphore、Event、Condition、
#       Queue、local、ThreadPoolExecutor、GIL 影响、死锁避免
# 注意：所有 demo 均为短任务，确保安全运行

import threading
import time
from queue import Queue, LifoQueue, PriorityQueue
from concurrent.futures import ThreadPoolExecutor, as_completed

print("=" * 60)
print("1. 线程创建与基本操作")
print("=" * 60)

def worker(name, count):
    for i in range(count):
        time.sleep(0.05)
        print("  [%s] 第 %d 次" % (name, i + 1))

# 方式一：函数 + Thread
t1 = threading.Thread(target=worker, args=("A", 3), name="Thread-A")
t1.start()
t1.join()
print("t1 是否存活:", t1.is_alive())

# 方式二：继承 Thread
class MyThread(threading.Thread):
    def __init__(self, value):
        super().__init__()
        self.value = value
    def run(self):
        time.sleep(0.05)
        print("  自定义线程，value =", self.value)

t2 = MyThread(42)
t2.start()
t2.join()

# 方式三：lambda
t3 = threading.Thread(target=lambda: print("  lambda 线程"))
t3.start()
t3.join()

# 查看线程信息
print("当前线程:", threading.current_thread().name)
print("存活线程数:", threading.active_count())

print()
print("=" * 60)
print("2. daemon 守护线程")
print("=" * 60)

# 演示守护线程（主线程结束即被终止）
def daemon_task():
    for i in range(100):
        time.sleep(0.01)
    print("  守护线程结束（通常看不到这句）")

d = threading.Thread(target=daemon_task, daemon=True)
d.start()
print("主线程不等守护线程，立即继续")

print()
print("=" * 60)
print("3. 线程安全问题与竞态条件")
print("=" * 60)

# 不安全的自增
counter_unsafe = 0
def unsafe_increment(n):
    global counter_unsafe
    for _ in range(n):
        counter_unsafe += 1

threads = [threading.Thread(target=unsafe_increment, args=(20000,)) for _ in range(5)]
for t in threads: t.start()
for t in threads: t.join()
print("不安全: 预期 100000, 实际", counter_unsafe)

print()
print("=" * 60)
print("4. Lock 互斥锁")
print("=" * 60)

lock = threading.Lock()
counter_safe = 0
def safe_increment(n):
    global counter_safe
    for _ in range(n):
        with lock:
            counter_safe += 1

threads = [threading.Thread(target=safe_increment, args=(20000,)) for _ in range(5)]
for t in threads: t.start()
for t in threads: t.join()
print("Lock 安全: 预期 100000, 实际", counter_safe)

# acquire with timeout
lock2 = threading.Lock()
lock2.acquire()
got = lock2.acquire(timeout=0.1)
print("已持有锁时再获取（超时）:", got)  # False
lock2.release()

print()
print("=" * 60)
print("5. RLock 可重入锁")
print("=" * 60)

rlock = threading.RLock()

def outer():
    with rlock:
        print("  outer 获取锁")
        inner()

def inner():
    with rlock:
        print("  inner 再次获取锁（RLock 允许）")

outer()

# 普通 Lock 同线程重复获取会死锁，这里不演示

print()
print("=" * 60)
print("6. Semaphore 信号量（限流）")
print("=" * 60)

sem = threading.Semaphore(3)  # 最多 3 个同时
current = 0
max_concurrent = 0
stat_lock = threading.Lock()

def limited_task(tid):
    global current, max_concurrent
    with sem:
        with stat_lock:
            current += 1
            if current > max_concurrent:
                max_concurrent = current
        time.sleep(0.05)
        with stat_lock:
            current -= 1
    print("  任务 %d 完成" % tid)

threads = [threading.Thread(target=limited_task, args=(i,)) for i in range(8)]
for t in threads: t.start()
for t in threads: t.join()
print("最大并发数（应 <= 3）:", max_concurrent)

print()
print("=" * 60)
print("7. Event 事件通知")
print("=" * 60)

event = threading.Event()

def waiter_event(name):
    print("  %s 等待事件..." % name)
    ok = event.wait(timeout=2)
    if ok:
        print("  %s 收到事件，继续" % name)
    else:
        print("  %s 超时" % name)

def setter_event():
    time.sleep(0.3)
    print("  触发事件！")
    event.set()

threads = [
    threading.Thread(target=waiter_event, args=("W1",)),
    threading.Thread(target=waiter_event, args=("W2",)),
    threading.Thread(target=setter_event),
]
for t in threads: t.start()
for t in threads: t.join()
event.clear()

print()
print("=" * 60)
print("8. Condition 条件变量（生产者消费者）")
print("=" * 60)

cond = threading.Condition()
buffer = []
MAX_BUF = 3

def producer_cond():
    for i in range(5):
        with cond:
            while len(buffer) >= MAX_BUF:
                print("  [生产者] 缓冲区满，等待...")
                cond.wait()
            buffer.append(i)
            print("  [生产者] 生产 %d, 缓冲区 %s" % (i, buffer))
            cond.notify_all()

def consumer_cond():
    for _ in range(5):
        with cond:
            while not buffer:
                print("  [消费者] 缓冲区空，等待...")
                cond.wait()
            item = buffer.pop(0)
            print("  [消费者] 消费 %d, 缓冲区 %s" % (item, buffer))
            cond.notify_all()
        time.sleep(0.02)

tp = threading.Thread(target=producer_cond)
tc = threading.Thread(target=consumer_cond)
tp.start(); tc.start()
tp.join(); tc.join()

print()
print("=" * 60)
print("9. Queue 线程安全队列")
print("=" * 60)

# FIFO Queue
q = Queue(maxsize=5)

def producer_q():
    for i in range(5):
        q.put("任务%d" % i)
        print("  [生产] 任务%d" % i)
        time.sleep(0.02)
    q.put(None)  # 哨兵

def consumer_q():
    while True:
        item = q.get()
        if item is None:
            q.task_done()
            break
        print("  [消费] %s" % item)
        q.task_done()
        time.sleep(0.02)

tp = threading.Thread(target=producer_q)
tc = threading.Thread(target=consumer_q)
tp.start(); tc.start()
tp.join(); tc.join()
q.join()

# LifoQueue
lq = LifoQueue()
for i in range(3):
    lq.put(i)
print("LifoQueue 出队顺序:", [lq.get() for _ in range(3)])

# PriorityQueue
pq = PriorityQueue()
pq.put((3, "低优先"))
pq.put((1, "高优先"))
pq.put((2, "中优先"))
print("PriorityQueue 出队顺序:", [pq.get()[1] for _ in range(3)])

print()
print("=" * 60)
print("10. threading.local 线程局部变量")
print("=" * 60)

local_data = threading.local()

def worker_local():
    local_data.value = threading.current_thread().name
    time.sleep(0.1)
    print("  %s 看到的 value = %s" % (threading.current_thread().name, local_data.value))

threads = [threading.Thread(target=worker_local, name="T%d" % i) for i in range(3)]
for t in threads: t.start()
for t in threads: t.join()

print()
print("=" * 60)
print("11. ThreadPoolExecutor 线程池")
print("=" * 60)

def fetch(url):
    time.sleep(0.1)
    return "%s -> 200 OK" % url

# submit 单个任务
with ThreadPoolExecutor(max_workers=3) as executor:
    future = executor.submit(fetch, "http://a.com")
    print("  是否完成:", future.done())
    print("  结果:", future.result())
    print("  是否完成:", future.done())

# map 批量任务（按提交顺序返回）
urls = ["http://%d.com" % i for i in range(5)]
with ThreadPoolExecutor(max_workers=5) as executor:
    for i, result in enumerate(executor.map(fetch, urls)):
        print("  map 结果 %d: %s" % (i, result))

# as_completed 哪个先完成先返回
def fetch_random(url):
    delay = hash(url) % 5 * 0.05 + 0.02
    time.sleep(delay)
    return "%s (%.2fs)" % (url, delay)

with ThreadPoolExecutor(max_workers=5) as executor:
    futures = {executor.submit(fetch_random, url): url for url in urls}
    for future in as_completed(futures):
        url = futures[future]
        try:
            print("  完成: %s -> %s" % (url, future.result()))
        except Exception as e:
            print("  %s 出错: %s" % (url, e))

# Future 回调
print("\\n  -- Future 回调 --")
def callback(fut):
    print("  回调触发: %s" % fut.result())

with ThreadPoolExecutor(max_workers=2) as executor:
    future = executor.submit(fetch, "http://callback.com")
    future.add_done_callback(callback)
    # with 块结束时会等待所有任务完成

print()
print("=" * 60)
print("12. GIL 影响对比（CPU 密集 vs IO 密集）")
print("=" * 60)

# CPU 密集：单线程 vs 多线程（多线程不会更快）
def cpu_task(n):
    total = 0
    for i in range(n):
        total += i * i
    return total

N = 2_000_000
t0 = time.time()
cpu_task(N)
cpu_task(N)
t1 = time.time()
print("  CPU 单线程 2 次: %.3f 秒" % (t1 - t0))

t0 = time.time()
threads = [threading.Thread(target=cpu_task, args=(N,)) for _ in range(2)]
for t in threads: t.start()
for t in threads: t.join()
t1 = time.time()
print("  CPU 多线程 2 次: %.3f 秒（GIL 限制，不会更快）" % (t1 - t0))

# IO 密集：多线程明显更快
def io_task():
    time.sleep(0.3)

t0 = time.time()
io_task(); io_task(); io_task()
t1 = time.time()
print("  IO 单线程 3 次: %.3f 秒" % (t1 - t0))

t0 = time.time()
threads = [threading.Thread(target=io_task) for _ in range(3)]
for t in threads: t.start()
for t in threads: t.join()
t1 = time.time()
print("  IO 多线程 3 次: %.3f 秒（IO 等待释放 GIL，并发生效）" % (t1 - t0))

print()
print("=" * 60)
print("13. 死锁避免：统一锁顺序")
print("=" * 60)

# 用 timeout 演示避免死锁
lock_a = threading.Lock()
lock_b = threading.Lock()
deadlock_happened = False

def task_ordered():
    # 按固定顺序获取：先 lock_a 后 lock_b
    with lock_a:
        time.sleep(0.02)
        with lock_b:
            print("  task_ordered 完成")

def task_ordered2():
    with lock_a:
        time.sleep(0.02)
        with lock_b:
            print("  task_ordered2 完成")

t1 = threading.Thread(target=task_ordered)
t2 = threading.Thread(target=task_ordered2)
t1.start(); t2.start()
t1.join(); t2.join()
print("  统一锁顺序，无死锁")

# 演示超时获取避免永久死锁
def task_with_timeout():
    got_a = lock_a.acquire(timeout=0.3)
    if not got_a:
        print("  task_with_timeout: 拿不到 lock_a，放弃")
        return
    try:
        time.sleep(0.1)
        got_b = lock_b.acquire(timeout=0.3)
        if not got_b:
            print("  task_with_timeout: 拿不到 lock_b，放弃（避免死锁）")
            return
        try:
            print("  task_with_timeout: 拿到两把锁")
        finally:
            lock_b.release()
    finally:
        lock_a.release()

task_with_timeout()

print()
print("=" * 60)
print("14. 综合实战：多线程并发下载模拟")
print("=" * 60)

def download(url):
    delay = 0.1 + (hash(url) % 10) * 0.03
    time.sleep(delay)
    return "%s (%.2fs, %d bytes)" % (url, delay, int(delay * 1000))

urls = ["http://example.com/page%d" % i for i in range(8)]

t0 = time.time()
# 单线程
results_serial = [download(url) for url in urls]
t1 = time.time()
print("  单线程耗时: %.3f 秒" % (t1 - t0))

t0 = time.time()
# 多线程
with ThreadPoolExecutor(max_workers=8) as executor:
    results_parallel = list(executor.map(download, urls))
t1 = time.time()
print("  8 线程耗时: %.3f 秒" % (t1 - t0))
print("  结果数: %d (串行), %d (并行)" % (len(results_serial), len(results_parallel)))

print()
print("=" * 60)
print("全部多线程演示完成！")
print("=" * 60)
`,
  },

  // =========================================================
  // 第三章：多进程编程
  // =========================================================
  {
    id: "py-multiprocessing",
    group: "函数式与并发",
    icon: "⚙️",
    title: "多进程编程",
    content: `## 多进程编程

由于 Python 的 **GIL** 限制，多线程无法利用多核做真正的并行计算。当你需要**真正的并行**（CPU 密集型任务），答案是**多进程（Multiprocessing）**。每个进程有独立的 Python 解释器和内存空间，不受 GIL 约束，可以真正并行运行在多个 CPU 核心上。Python 的 \`multiprocessing\` 模块提供了完整的多进程支持。

### 为什么需要多进程

回顾 GIL 的影响：多线程在 CPU 密集任务上不快反慢。多进程绕开 GIL：

\`\`\`python
# CPU 密集任务：多线程 vs 多进程
def cpu_heavy(n):                  # 定义函数 cpu_heavy，参数：n
    total = 0                      # 将整数 0 赋给 total
    for i in range(n):             # 遍历 range(n)，每次取值赋给 i
        total += i * i             # total 加 i * i
    return total                   # 返回 total

# 多线程：GIL 导致串行，2 个线程 ≈ 2 倍单线程时间
# 多进程：真正并行，2 个进程 ≈ 单线程时间（理想情况）
\`\`\`

### multiprocessing 基础

#### Process 创建进程

\`multiprocessing.Process\` 和 \`threading.Thread\` API 几乎一致：

\`\`\`python
import multiprocessing             # 导入 multiprocessing 模块
import time                        # 导入 time 模块

def worker(name):                  # 定义函数 worker，参数：name
    print(f"进程 {name}，PID={multiprocessing.current_process().pid}")  # 输出 f"进程 {name}，PID={multiprocessing.current_process().pid}"
    time.sleep(0.5)                # 对 time 调用 sleep 方法，参数 0.5
    print(f"进程 {name} 结束")         # 输出 f"进程 {name} 结束"

if __name__ == "__main__":         # 如果 __name__ == "__main__" 成立
    p = multiprocessing.Process(target=worker, args=("A",))  # 将 multiprocessing.Process(target=worker, args=("A",)) 赋给 p
    p.start()                      # 对 p 调用 start 方法
    p.join()                       # 对 p 调用 连接 方法
    print("主进程 PID:", multiprocessing.current_process().pid)  # 输出 "主进程 PID:", multiprocessing.current_process().pid
\`\`\`

> **重要**：多进程代码必须放在 \`if __name__ == "__main__":\` 下（尤其在 Windows / macOS spawn 模式下）。否则子进程导入主模块时会重复执行，导致无限递归创建进程。

#### start / join / is_alive

和线程一样：
- \`p.start()\`：启动进程
- \`p.join(timeout)\`：等待进程结束
- \`p.is_alive()\`：是否存活

#### Process 的常用属性

\`\`\`python
p = multiprocessing.Process(target=worker, args=("A",), name="MyProcess")  # 将 multiprocessing.Process(target=worker, args=("A",), name="MyProcess") 赋给 p
print(p.pid)      # 进程 ID（start 前为 None）
print(p.name)     # 进程名
print(p.daemon)   # 是否守护进程
p.daemon = True   # 设为守护进程（主进程退出时被终止）
\`\`\`

### Pool 进程池

手动创建进程开销大，实际多用 \`multiprocessing.Pool\` 进程池：

\`\`\`python
from multiprocessing import Pool   # 从 multiprocessing 导入 Pool

def square(x):                     # 定义函数 square，参数：x
    return x * x                   # 返回 x * x

if __name__ == "__main__":         # 如果 __name__ == "__main__" 成立
    with Pool(processes=4) as pool:  # 使用上下文管理器 Pool(processes=4)，绑定到 pool
        # map：批量并行，按顺序返回
        results = pool.map(square, range(10))  # 将 pool.map(square, range(10)) 赋给 results
        print(results)             # 输出 results
\`\`\`

#### Pool 的几种方法

| 方法 | 说明 |
| --- | --- |
| \`map(func, iterable)\` | 并行 + 按顺序返回，阻塞直到全部完成 |
| \`imap(func, iterable)\` | 惰性版 map，返回迭代器，可提前取结果 |
| \`imap_unordered\` | 不保证顺序，谁先完成谁先返回 |
| \`apply(func, args)\` | 同步执行单个任务（阻塞） |
| \`apply_async(func, args)\` | 异步执行，返回 AsyncResult |
| \`starmap(func, iterable)\` | 参数是元组，自动解包 |
| \`starmap_async\` | 异步版 starmap |

\`\`\`python
# apply_async 异步
with Pool(4) as pool:              # 使用上下文管理器 Pool(4)，绑定到 pool
    result = pool.apply_async(square, (5,))  # 将 pool.apply_async(square, (5,)) 赋给 result
    print(result.get(timeout=5))  # 25

# starmap：参数解包
def add(a, b):                     # 定义函数 add，参数：a, b
    return a + b                   # 返回 a + b
pairs = [(1, 2), (3, 4), (5, 6)]   # 创建列表并赋给 pairs
print(pool.starmap(add, pairs))  # [3, 7, 11]

# imap_unordered：无序
for r in pool.imap_unordered(square, range(10)):  # 遍历 pool.imap_unordered(square, range(10))，每次取值赋给 r
    print(r)  # 顺序不定
\`\`\`

#### AsyncResult 对象

\`apply_async\` 返回 \`AsyncResult\`：
- \`get(timeout)\`：获取结果（阻塞）
- \`ready()\`：是否完成
- \`successful()\`：是否成功（无异常）
- \`wait(timeout)\`：等待完成

### 进程间通信

进程内存隔离，不能像线程那样直接共享变量。需要专门的通信机制。

#### Queue 进程间通信

\`multiprocessing.Queue\` 是进程安全的队列（和 \`queue.Queue\` 不同，内部用管道和锁实现）：

\`\`\`python
from multiprocessing import Process, Queue  # 从 multiprocessing 导入 Process, Queue

def producer(q):                   # 定义函数 producer，参数：q
    q.put("hello from child")      # 对 q 调用 put 方法，参数 "hello from child"
    q.put(None)  # 结束信号

if __name__ == "__main__":         # 如果 __name__ == "__main__" 成立
    q = Queue()                    # 将 Queue() 赋给 q
    p = Process(target=producer, args=(q,))  # 将 Process(target=producer, args=(q,)) 赋给 p
    p.start()                      # 对 p 调用 start 方法
    print(q.get())  # hello from child
    p.join()                       # 对 p 调用 连接 方法
\`\`\`

#### Pipe 管道

\`Pipe()\` 返回两个连接对象，分别给两端进程：

\`\`\`python
from multiprocessing import Process, Pipe  # 从 multiprocessing 导入 Process, Pipe

def child(conn):                   # 定义函数 child，参数：conn
    conn.send("来自子进程")             # 对 conn 调用 send 方法，参数 "来自子进程"
    msg = conn.recv()              # 将 conn.recv() 赋给 msg
    print("子进程收到:", msg)           # 输出 "子进程收到:", msg
    conn.close()                   # 对 conn 调用 close 方法

if __name__ == "__main__":         # 如果 __name__ == "__main__" 成立
    parent_conn, child_conn = Pipe()
    p = Process(target=child, args=(child_conn,))  # 将 Process(target=child, args=(child_conn,)) 赋给 p
    p.start()                      # 对 p 调用 start 方法
    print("父进程收到:", parent_conn.recv())  # 输出 "父进程收到:", parent_conn.recv()
    parent_conn.send("来自父进程")      # 对 parent_conn 调用 send 方法，参数 "来自父进程"
    p.join()                       # 对 p 调用 连接 方法
\`\`\`

- \`Pipe(duplex=True)\`：双向（默认）
- \`Pipe(duplex=False)\`：单向，\`conn1\` 只读，\`conn2\` 只写

### 共享内存 Value / Array

\`multiprocessing.Value\` 和 \`Array\` 创建**真正共享**的内存（用 C 类型），性能比 Queue 高：

\`\`\`python
from multiprocessing import Process, Value, Array  # 从 multiprocessing 导入 Process, Value, Array

def worker(n, arr):                # 定义函数 worker，参数：n, arr
    n.value += 1
    for i in range(len(arr)):      # 遍历 range(len(arr))，每次取值赋给 i
        arr[i] *= 2

if __name__ == "__main__":         # 如果 __name__ == "__main__" 成立
    num = Value("i", 0)       # 整数，初始 0
    arr = Array("i", [1, 2, 3, 4])  # 整数数组

    p = Process(target=worker, args=(num, arr))  # 将 Process(target=worker, args=(num, arr)) 赋给 p
    p.start()                      # 对 p 调用 start 方法
    p.join()                       # 对 p 调用 连接 方法
    print(num.value)     # 1
    print(arr[:])        # [2, 4, 6, 8]
\`\`\`

类型代码：\`i\`=int, \`d\`=double, \`f\`=float, \`c\`=char, \`b\`=signed char 等。

> 注意：\`Value\` / \`Array\` 的操作本身**带锁**（原子），但复合操作（如 \`n.value += 1\` 实际是读-改-写）仍需自己加锁保证安全。

### Manager 代理对象

\`Manager\` 创建一个**服务进程**，代理 list、dict、Namespace 等对象，让多个进程能共享访问：

\`\`\`python
from multiprocessing import Process, Manager  # 从 multiprocessing 导入 Process, Manager

def worker(d, l):                  # 定义函数 worker，参数：d, l
    d["key"] = "value"
    l.append(42)                   # 对 l 调用 追加 方法，参数 42

if __name__ == "__main__":         # 如果 __name__ == "__main__" 成立
    with Manager() as manager:     # 使用上下文管理器 Manager()，绑定到 manager
        shared_dict = manager.dict()  # 将 manager.dict() 赋给 shared_dict
        shared_list = manager.list()  # 将 manager.list() 赋给 shared_list
        p = Process(target=worker, args=(shared_dict, shared_list))  # 将 Process(target=worker, args=(shared_dict, shared_list)) 赋给 p
        p.start()                  # 对 p 调用 start 方法
        p.join()                   # 对 p 调用 连接 方法
        print(shared_dict)  # {'key': 'value'}
        print(shared_list)  # [42]
\`\`\`

Manager 支持的对象：\`dict\`、\`list\`、\`Namespace\`、\`Value\`、\`Array\`、\`Queue\`、\`Lock\`、\`Semaphore\`、\`Event\`、\`Condition\` 等。

- **优点**：灵活，支持任意 Python 对象
- **缺点**：每次访问都经过 IPC（进程间通信），比 Value/Array 慢

### 进程同步

进程间也需要同步（虽然内存隔离，但共享资源如文件、Manager 对象仍需保护）。multiprocessing 提供了和 threading 类似的同步原语：

\`\`\`python
from multiprocessing import Process, Lock  # 从 multiprocessing 导入 Process, Lock

def worker(lock, f):               # 定义函数 worker，参数：lock, f
    with lock:  # 互斥访问文件
        with open(f, "a") as fp:   # 使用上下文管理器 open(f, "a")，绑定到 fp
            fp.write("进程写入\\n")    # 对 fp 调用 write 方法，参数 "进程写入\\n"

if __name__ == "__main__":         # 如果 __name__ == "__main__" 成立
    lock = Lock()                  # 将 Lock() 赋给 lock
    ps = [Process(target=worker, args=(lock, "log.txt")) for _ in range(3)]  # 创建列表并赋给 ps
    for p in ps: p.start()
    for p in ps: p.join()
\`\`\`

同步原语：\`Lock\`、\`RLock\`、\`Semaphore\`、\`Event\`、\`Condition\`、\`Barrier\`。

### fork vs spawn 启动方式

multiprocessing 启动子进程有三种方式：

| 方式 | 说明 | 平台 |
| --- | --- | --- |
| \`fork\` | 复制父进程内存（快），继承所有状态 | Unix（Linux/macOS 旧版） |
| \`spawn\` | 启动全新进程，重新导入主模块（慢，干净） | Windows（默认）、macOS（Python 3.8+ 默认） |
| \`forkserver\` | 启动一个服务进程，按需 fork | Unix |

\`\`\`python
import multiprocessing as mp       # 导入 multiprocessing 模块并取别名 mp
# 设置启动方式（必须在创建任何 Process 之前）
mp.set_start_method("spawn")       # 对 mp 调用 set_start_method 方法，参数 "spawn"
\`\`\`

**为什么 macOS 默认改用 spawn？** fork 在多线程程序中不安全（子进程只有调用 fork 的线程，其他线程状态丢失，可能导致死锁）。

**spawn 的注意事项**：
- 子进程会重新导入主模块，所以顶层代码要能被安全导入
- 全局变量不会继承（spawn 的子进程是新进程）
- 必须用 \`if __name__ == "__main__":\` 保护启动代码

### 僵尸进程

**僵尸进程（Zombie）**：子进程已结束，但父进程没有调用 \`join()\` 或 \`wait()\` 回收，导致子进程的进程描述符残留。

\`\`\`python
# 不 join 会导致僵尸进程
p = Process(target=worker)         # 将 Process(target=worker) 赋给 p
p.start()                          # 对 p 调用 start 方法
# 忘记 p.join()  -> p 变成僵尸
\`\`\`

避免方法：
1. 始终调用 \`join()\`
2. 使用 \`with Pool(...) as pool:\` 上下文管理器
3. 设置守护进程（父进程退出时自动回收）

### 进程 vs 线程对比

| 维度 | 进程 | 线程 |
| --- | --- | --- |
| 内存 | 独立 | 共享 |
| 创建开销 | 大 | 小 |
| 通信 | Queue/Pipe/Manager（IPC） | 直接共享变量 |
| 同步 | Lock 等（进程版） | Lock 等（线程版） |
| GIL | 不受影响，真并行 | 受 GIL 限制 |
| 适用 | CPU 密集 | IO 密集 |
| 稳定性 | 进程隔离，崩溃不影响其他 | 一崩全崩 |

### 内存隔离

进程内存隔离是双刃剑：
- **好处**：无数据竞争，天然安全
- **坏处**：通信复杂，数据需序列化（pickle）传输

\`\`\`python
# 子进程修改全局变量不影响父进程
g_var = 0                          # 将整数 0 赋给 g_var
def child():                       # 定义函数 child，无参数
    global g_var
    g_var = 100                    # 将整数 100 赋给 g_var
    print("子进程 g_var =", g_var)  # 100

if __name__ == "__main__":         # 如果 __name__ == "__main__" 成立
    p = Process(target=child)      # 将 Process(target=child) 赋给 p
    p.start()                      # 对 p 调用 start 方法
    p.join()                       # 对 p 调用 连接 方法
    print("父进程 g_var =", g_var)  # 0，不受影响
\`\`\`

### CPU 密集型任务实战

经典例子：并行计算大量数字的平方和：

\`\`\`python
from multiprocessing import Pool   # 从 multiprocessing 导入 Pool

def heavy(n):                      # 定义函数 heavy，参数：n
    return sum(i * i for i in range(n))  # 返回 sum(i * i for i in range(n))

if __name__ == "__main__":         # 如果 __name__ == "__main__" 成立
    tasks = [10_000_000] * 4       # 将 [10_000_000] * 4 赋给 tasks
    with Pool(4) as pool:          # 使用上下文管理器 Pool(4)，绑定到 pool
        results = pool.map(heavy, tasks)  # 将 pool.map(heavy, tasks) 赋给 results
    print(results)                 # 输出 results
\`\`\`

4 个进程并行，理想情况下接近单进程的 1/4 时间。

### 本章小结

| 工具 | 用途 |
| --- | --- |
| Process | 创建进程 |
| Pool | 进程池（map/apply/starmap） |
| Queue | 进程间通信 |
| Pipe | 双向管道 |
| Value/Array | 共享内存 |
| Manager | 代理对象（dict/list 等） |
| Lock 等 | 进程同步 |
| set_start_method | fork/spawn 启动方式 |

核心原则：**CPU 密集用进程，注意序列化开销和 \`if __name__ == "__main__"\`**。下面代码将完整演示。
`,
    code: `# ============================================================
# 第三章代码：多进程编程演示
# ============================================================
# 涵盖：Process、Pool、Queue、Pipe、Value/Array、Manager、
#       同步原语、启动方式、内存隔离、CPU 密集实战
# 注意：必须放在 if __name__ == "__main__" 下运行

import multiprocessing as mp
import time
import os

# macOS 默认 spawn 会重新导入主模块导致递归创建子进程，
# 教学演示统一用 fork 启动方式避免此问题。
try:
    mp.set_start_method("fork")
except RuntimeError:
    pass

print("=" * 60)
print("1. Process 进程创建")
print("=" * 60)

def worker(name, delay):
    print("  [进程 %s] PID=%d, 父PID=%d" % (name, os.getpid(), os.getppid()))
    time.sleep(delay)
    print("  [进程 %s] 结束" % name)

def demo_process():
    p = mp.Process(target=worker, args=("A", 0.1), name="Proc-A")
    print("  启动前 is_alive:", p.is_alive())
    p.start()
    print("  启动后 is_alive:", p.is_alive())
    p.join()
    print("  join 后 is_alive:", p.is_alive())
    print("  主进程 PID:", os.getpid())

demo_process()

print()
print("=" * 60)
print("2. 继承 Process 类")
print("=" * 60)

class MyProcess(mp.Process):
    def __init__(self, value):
        super().__init__()
        self.value = value
    def run(self):
        time.sleep(0.05)
        print("  自定义进程，value =", self.value, "PID =", os.getpid())

def demo_subclass():
    p = MyProcess(42)
    p.start()
    p.join()

demo_subclass()

print()
print("=" * 60)
print("3. Pool 进程池")
print("=" * 60)

def square(x):
    return x * x

def add(a, b):
    return a + b

def demo_pool():
    with mp.Pool(processes=4) as pool:
        # map
        print("  map:", pool.map(square, range(10)))

        # apply / apply_async
        print("  apply:", pool.apply(square, (5,)))
        result = pool.apply_async(square, (7,))
        print("  apply_async:", result.get(timeout=5))

        # starmap
        print("  starmap:", pool.starmap(add, [(1, 2), (3, 4), (5, 6)]))

        # imap_unordered（无序）
        print("  imap_unordered:", sorted(pool.imap_unordered(square, range(8))))

demo_pool()

print()
print("=" * 60)
print("4. 进程间通信：Queue")
print("=" * 60)

def producer_q(q):
    for i in range(5):
        q.put("数据%d" % i)
        time.sleep(0.02)
    q.put(None)  # 结束信号

def consumer_q(q):
    while True:
        item = q.get()
        if item is None:
            break
        print("  消费:", item)

def demo_queue():
    q = mp.Queue()
    p1 = mp.Process(target=producer_q, args=(q,))
    p2 = mp.Process(target=consumer_q, args=(q,))
    p1.start(); p2.start()
    p1.join(); p2.join()

demo_queue()

print()
print("=" * 60)
print("5. 进程间通信：Pipe 管道")
print("=" * 60)

def pipe_child(conn):
    conn.send("来自子进程的问候")
    msg = conn.recv()
    print("  子进程收到:", msg)
    conn.close()

def demo_pipe():
    parent_conn, child_conn = mp.Pipe()
    p = mp.Process(target=pipe_child, args=(child_conn,))
    p.start()
    print("  父进程收到:", parent_conn.recv())
    parent_conn.send("来自父进程的回应")
    p.join()

demo_pipe()

print()
print("=" * 60)
print("6. 共享内存 Value / Array")
print("=" * 60)

def shared_worker(n, arr):
    n.value += 1
    for i in range(len(arr)):
        arr[i] *= 2

def demo_shared():
    num = mp.Value("i", 0)
    arr = mp.Value  # 占位
    arr = mp.Array("i", [1, 2, 3, 4])
    p = mp.Process(target=shared_worker, args=(num, arr))
    p.start()
    p.join()
    print("  Value:", num.value)
    print("  Array:", arr[:])

demo_shared()

print()
print("=" * 60)
print("7. Value 加锁保证复合操作安全")
print("=" * 60)

def increment(n, lock):
    for _ in range(5000):
        with lock:
            n.value += 1

def demo_value_lock():
    num = mp.Value("i", 0)
    lock = mp.Lock()
    ps = [mp.Process(target=increment, args=(num, lock)) for _ in range(4)]
    for p in ps: p.start()
    for p in ps: p.join()
    print("  预期 20000, 实际:", num.value)

demo_value_lock()

print()
print("=" * 60)
print("8. Manager 代理对象")
print("=" * 60)

def manager_worker(d, l):
    d["key"] = "value"
    d["count"] = d.get("count", 0) + 1
    l.append(os.getpid())

def demo_manager():
    with mp.Manager() as manager:
        shared_dict = manager.dict()
        shared_list = manager.list()
        ps = [mp.Process(target=manager_worker, args=(shared_dict, shared_list))
              for _ in range(3)]
        for p in ps: p.start()
        for p in ps: p.join()
        print("  共享 dict:", dict(shared_dict))
        print("  共享 list:", list(shared_list))

demo_manager()

print()
print("=" * 60)
print("9. 进程同步原语")
print("=" * 60)

def sync_worker(lock, results, idx):
    with lock:
        results.append("进程 %d 获得锁" % idx)
        time.sleep(0.02)

def demo_sync():
    lock = mp.Lock()
    with mp.Manager() as mgr:
        results = mgr.list()
        ps = [mp.Process(target=sync_worker, args=(lock, results, i))
              for i in range(3)]
        for p in ps: p.start()
        for p in ps: p.join()
        for r in results:
            print("  ", r)

demo_sync()

print()
print("=" * 60)
print("10. Event 跨进程通知")
print("=" * 60)

def event_waiter(ev, idx):
    ev.wait()
    print("  等待者 %d 被唤醒" % idx)

def demo_event():
    ev = mp.Event()
    ps = [mp.Process(target=event_waiter, args=(ev, i)) for i in range(3)]
    for p in ps: p.start()
    time.sleep(0.2)
    print("  主进程触发事件")
    ev.set()
    for p in ps: p.join()

demo_event()

print()
print("=" * 60)
print("11. 内存隔离演示")
print("=" * 60)

g_var = 0

def child_isolated():
    global g_var
    g_var = 100
    print("  子进程 g_var =", g_var)

def demo_isolation():
    global g_var
    g_var = 0
    p = mp.Process(target=child_isolated)
    p.start()
    p.join()
    print("  父进程 g_var =", g_var, "(不受子进程影响)")

demo_isolation()

print()
print("=" * 60)
print("12. 启动方式 fork vs spawn")
print("=" * 60)

def demo_start_method():
    try:
        current = mp.get_start_method()
        print("  当前启动方式:", current)
        print("  可用方式:", mp.get_all_start_methods())
    except Exception as e:
        print("  查询失败:", e)

demo_start_method()

print()
print("=" * 60)
print("13. CPU 密集型：单进程 vs 多进程")
print("=" * 60)

def cpu_heavy(n):
    total = 0
    for i in range(n):
        total += i * i
    return total

def demo_cpu():
    N = 2_000_000
    # 单进程：4 次串行
    t0 = time.time()
    serial = [cpu_heavy(N) for _ in range(4)]
    t1 = time.time()
    print("  单进程 4 次: %.3f 秒, 总和=%d" % (t1 - t0, sum(serial)))

    # 多进程：4 个进程并行
    t0 = time.time()
    with mp.Pool(processes=4) as pool:
        parallel = pool.map(cpu_heavy, [N] * 4)
    t1 = time.time()
    print("  4 进程并行: %.3f 秒, 总和=%d" % (t1 - t0, sum(parallel)))
    print("  加速比: %.2f x" % ((t1 - t0) and (t1 - t0) / 0.001 or 0))
    # 注意：多进程应明显快于单进程

demo_cpu()

print()
print("=" * 60)
print("14. 实战：并行计算矩阵行和")
print("=" * 60)

def row_sum(row):
    return sum(row)

def demo_matrix():
    # 生成一个 8x100000 的矩阵
    matrix = [[i * 100000 + j for j in range(100000)] for i in range(8)]

    # 串行
    t0 = time.time()
    serial = [row_sum(r) for r in matrix]
    t1 = time.time()
    print("  串行: %.3f 秒" % (t1 - t0))

    # 并行
    t0 = time.time()
    with mp.Pool(processes=4) as pool:
        parallel = pool.map(row_sum, matrix)
    t1 = time.time()
    print("  4 进程并行: %.3f 秒" % (t1 - t0))
    print("  结果一致:", serial == parallel)

demo_matrix()

print()
print("=" * 60)
print("15. 实战：进程池 + 回调")
print("=" * 60)

def compute(x):
    time.sleep(0.1)
    return x * x

def demo_callback():
    with mp.Pool(processes=2) as pool:
        results = []
        def callback(r):
            results.append(r)
            print("  回调收到:", r)

        for i in range(5):
            pool.apply_async(compute, (i,), callback=callback)

        pool.close()
        pool.join()
        print("  回调收集结果:", sorted(results))

demo_callback()

print()
print("=" * 60)
print("全部多进程演示完成！")
print("=" * 60)
`,
  },

  // =========================================================
  // 第四章：asyncio 异步编程深入
  // =========================================================
  {
    id: "py-asyncio",
    group: "函数式与并发",
    icon: "⏱️",
    title: "asyncio 异步编程深入",
    content: `## asyncio 异步编程深入

**asyncio** 是 Python 3.4 引入、3.5+ 正式稳定的**异步 IO 编程框架**。它用**单线程 + 协程**的方式实现并发，特别适合 IO 密集型任务（网络请求、数据库、文件 IO）。相比多线程，asyncio 更轻量（一个线程能管理成千上万个协程）、无 GIL 切换开销、无锁竞争。本章深入讲解 asyncio 的核心概念与用法。

### 同步 vs 异步：为什么需要 asyncio

先理解「阻塞」的问题。传统同步代码遇到 IO 会**阻塞**当前线程，CPU 空闲等待：

\`\`\`python
# 同步：3 个请求各 1 秒，总共 3 秒
import time                        # 导入 time 模块
def fetch(url):                    # 定义函数 fetch，参数：url
    time.sleep(1)  # 模拟网络
    return url                     # 返回 url

t0 = time.time()                   # 将 time.time() 赋给 t0
fetch("a"); fetch("b"); fetch("c") # 调用 fetch，参数 "a"); fetch("b"); fetch("c"
print(time.time() - t0)  # ~3 秒
\`\`\`

多线程能并发，但每个线程有内存开销（约 8MB 栈），且 GIL 限制。asyncio 用**单线程事件循环**，IO 等待时切换到其他任务：

\`\`\`python
# 异步：3 个请求并发，总共约 1 秒
import asyncio                     # 导入 asyncio 模块
async def fetch(url):              # 定义异步函数 fetch，参数：url
    await asyncio.sleep(1)
    return url                     # 返回 url

async def main():                  # 定义异步函数 main
    await asyncio.gather(fetch("a"), fetch("b"), fetch("c"))
\`\`\`

| 方案 | 并发数上限 | 内存开销 | 适用 |
| --- | --- | --- | --- |
| 同步 | 1 | - | 简单场景 |
| 多线程 | 数十~数百 | 每线程约 8MB | IO 密集，中低并发 |
| asyncio | 数千~数万 | 每协程约 KB | IO 密集，高并发 |

### async def 协程定义

\`async def\` 定义一个**协程函数**，调用它返回一个**协程对象**（不立即执行）：

\`\`\`python
async def hello():                 # 定义异步函数 hello
    return "hello"                 # 返回 "hello"

coro = hello()      # 创建协程对象，未执行
print(coro)         # <coroutine object hello at 0x...>
# 必须用 await 或事件循环驱动才会执行
\`\`\`

> Python 3.10 之前，直接调用 \`async\` 函数会有 RuntimeWarning。3.12 起变成更明确的错误提示。

### await 等待

\`await\` 暂停当前协程，等待一个**可等待对象（Awaitable）**完成，期间事件循环可以运行其他协程：

\`\`\`python
async def fetch(url):              # 定义异步函数 fetch，参数：url
    await asyncio.sleep(1)   # await 一个协程
    return url                     # 返回 url

async def main():                  # 定义异步函数 main
    result = await fetch("http://x")  # await 等待结果
    print(result)                  # 输出 result
\`\`\`

可等待对象包括：协程、Task、Future。

### asyncio.run 入口

\`asyncio.run(coro)\` 是运行协程的**标准入口**（Python 3.7+）。它会：
1. 创建新事件循环
2. 运行协程直到完成
3. 关闭事件循环

\`\`\`python
async def main():                  # 定义异步函数 main
    print("hello")                 # 输出 "hello"

asyncio.run(main())                # 对 asyncio 调用 run 方法，参数 main()
\`\`\`

注意：
- 一个程序通常只调用一次 \`asyncio.run\`
- 不能在已有事件循环内调用 \`asyncio.run\`（会报错）
- 旧的 \`loop.run_until_complete\` 方式已不推荐

### 事件循环 event loop

**事件循环**是 asyncio 的心脏，它不断：①检查就绪的任务 ②运行它们 ③等待新事件。可以理解为「任务调度器」。

\`\`\`python
# 一般不直接操作事件循环，asyncio.run 已封装
loop = asyncio.new_event_loop()    # 将 asyncio.new_event_loop() 赋给 loop
loop.run_until_complete(main())    # 对 loop 调用 run_until_complete 方法，参数 main()
loop.close()                       # 对 loop 调用 close 方法
\`\`\`

可以用 \`asyncio.get_running_loop()\` 获取当前运行的事件循环。

### Task 任务创建

\`asyncio.create_task(coro)\` 把协程包装成 **Task**，立即调度执行（不等待）：

\`\`\`python
async def main():                  # 定义异步函数 main
    task = asyncio.create_task(fetch("http://x"))  # 立即开始调度
    # 这里可以干别的事
    result = await task  # 需要结果时再 await
\`\`\`

- **直接 await 协程**：串行，等到这个完成才执行下一个
- **create_task + await**：并发，任务已开始，可以做其他事

\`\`\`python
# 串行：3 秒
await fetch("a")  # 等 1 秒
await fetch("b")  # 等 1 秒
await fetch("c")  # 等 1 秒

# 并发：约 1 秒
t1 = asyncio.create_task(fetch("a"))  # 将 asyncio.create_task(fetch("a")) 赋给 t1
t2 = asyncio.create_task(fetch("b"))  # 将 asyncio.create_task(fetch("b")) 赋给 t2
t3 = asyncio.create_task(fetch("c"))  # 将 asyncio.create_task(fetch("c")) 赋给 t3
await t1; await t2; await t3
\`\`\`

### Future

\`Future\` 是一个**低层**对象，表示「将来会有结果」的占位。Task 是 Future 的子类。日常编程很少直接用 Future，但理解它有助于理解 asyncio 内部。

\`\`\`python
future = asyncio.Future()          # 将 asyncio.Future() 赋给 future
# future.set_result(42)  设置结果
# future.result()        获取结果
# await future           等待结果
\`\`\`

### gather 并发收集

\`asyncio.gather(*aws)\` 并发运行多个可等待对象，按**输入顺序**返回结果列表：

\`\`\`python
async def main():                  # 定义异步函数 main
    results = await asyncio.gather(  # 将 await asyncio.gather( 赋给 results
        fetch("a"),
        fetch("b"),
        fetch("c"),
    )
    print(results)  # ['a', 'b', 'c']，顺序与输入一致
\`\`\`

- \`return_exceptions=False\`（默认）：任一任务抛异常，整个 gather 抛出
- \`return_exceptions=True\`：异常作为结果返回，不中断其他

### wait 等待多个

\`asyncio.wait(aws)\` 更灵活，返回两个集合：完成的和未完成的：

\`\`\`python
done, pending = await asyncio.wait(
    [task1, task2, task3],
    return_when=asyncio.FIRST_COMPLETED,  # 第一个完成就返回
)
\`\`\`

\`return_when\` 选项：
- \`ALL_COMPLETED\`（默认）：全部完成
- \`FIRST_COMPLETED\`：任一完成
- \`FIRST_EXCEPTION\`：任一抛异常或全部完成

> 注意：Python 3.8+ 不推荐把协程直接传给 \`wait\`，应先 \`create_task\`。

### wait_for 超时

\`asyncio.wait_for(aw, timeout)\` 等待可等待对象，超时抛 \`asyncio.TimeoutError\`：

\`\`\`python
async def slow():                  # 定义异步函数 slow
    await asyncio.sleep(10)

async def main():                  # 定义异步函数 main
    try:                           # 尝试执行以下代码块
        await asyncio.wait_for(slow(), timeout=1)
    except asyncio.TimeoutError:
        print("超时！")               # 输出 "超时！"
\`\`\`

超时会**取消**被等待的协程。

### as_completed

\`asyncio.as_completed(aws)\` 返回一个迭代器，**谁先完成谁先返回**：

\`\`\`python
async def main():                  # 定义异步函数 main
    tasks = [fetch(url) for url in urls]  # 创建列表并赋给 tasks
    for coro in asyncio.as_completed(tasks):  # 遍历 asyncio.as_completed(tasks)，每次取值赋给 coro
        result = await coro        # 将 await coro 赋给 result
        print("完成:", result)  # 顺序不定
\`\`\`

### async with 异步上下文管理器

\`async with\` 用于支持异步 \`__aenter__\` / \`__aexit__\` 的对象，如异步锁、异步 HTTP 连接：

\`\`\`python
class AsyncResource:               # 定义类 AsyncResource
    async def __aenter__(self):    # 定义异步函数 __aenter__，参数：self
        await asyncio.sleep(0.1)  # 异步获取
        return self                # 返回 self
    async def __aexit__(self, *exc):  # 定义异步函数 __aexit__，参数：self, *exc
        await asyncio.sleep(0.1)  # 异步释放

async def main():                  # 定义异步函数 main
    async with AsyncResource() as r:
        print("使用资源")              # 输出 "使用资源"
\`\`\`

### async for 异步迭代

\`async for\` 遍历**异步迭代器**（实现 \`__aiter__\` / \`__anext__\`）：

\`\`\`python
async def async_range(n):          # 定义异步函数 async_range，参数：n
    for i in range(n):             # 遍历 range(n)，每次取值赋给 i
        await asyncio.sleep(0.1)
        yield i                    # 产出值 i（生成器）

async def main():                  # 定义异步函数 main
    async for i in async_range(3):
        print(i)                   # 输出 i
\`\`\`

支持 \`yield\` 的协程称为**异步生成器**。

### asyncio.Queue 异步队列

\`asyncio.Queue\` 是协程版的生产者-消费者队列：

\`\`\`python
async def producer(q):             # 定义异步函数 producer，参数：q
    for i in range(3):             # 遍历 range(3)，每次取值赋给 i
        await q.put(i)
        await asyncio.sleep(0.1)

async def consumer(q):             # 定义异步函数 consumer，参数：q
    while True:                    # 当 True 为真时重复执行
        item = await q.get()       # 将 await q.get() 赋给 item
        print("消费:", item)         # 输出 "消费:", item
        q.task_done()              # 对 q 调用 task_done 方法

async def main():                  # 定义异步函数 main
    q = asyncio.Queue()            # 将 asyncio.Queue() 赋给 q
    p = asyncio.create_task(producer(q))  # 将 asyncio.create_task(producer(q)) 赋给 p
    c = asyncio.create_task(consumer(q))  # 将 asyncio.create_task(consumer(q)) 赋给 c
    await q.join()  # 等所有任务处理完
    c.cancel()      # 取消消费者
\`\`\`

### asyncio.Lock / Semaphore / Event

asyncio 提供协程版的同步原语（用法类似 threading，但用 \`async with\`）：

\`\`\`python
lock = asyncio.Lock()              # 将 asyncio.Lock() 赋给 lock
async with lock:
    # 临界区

sem = asyncio.Semaphore(3)  # 最多 3 个并发
async with sem:
    # 限流

event = asyncio.Event()            # 将 asyncio.Event() 赋给 event
await event.wait()
event.set()                        # 对 event 调用 set 方法
\`\`\`

### sleep

\`asyncio.sleep(delay)\` 是非阻塞睡眠，会**让出控制权**给事件循环：

\`\`\`python
await asyncio.sleep(1)   # 非阻塞
# 对比 time.sleep(1) 是阻塞的，会卡住整个事件循环！
\`\`\`

> **大坑**：在协程里用 \`time.sleep\` 会阻塞事件循环，所有协程都卡住。务必用 \`asyncio.sleep\`。

### create_task vs ensure_future

- \`create_task\`（Python 3.7+）：推荐，把协程包装成 Task
- \`ensure_future\`（旧）：更通用，接受协程/Future/Task

\`\`\`python
# 推荐
task = asyncio.create_task(coro)   # 将 asyncio.create_task(coro) 赋给 task
# 旧
task = asyncio.ensure_future(coro) # 将 asyncio.ensure_future(coro) 赋给 task
\`\`\`

### 协程 vs 线程

| 维度 | 协程 | 线程 |
| --- | --- | --- |
| 调度 | 用户态，事件循环 | 操作系统抢占 |
| 切换 | 极轻（无内核开销） | 较重（内核切换） |
| 并发数 | 数万 | 数百 |
| 共享状态 | 单线程，无竞争 | 需加锁 |
| 编程 | 需 async/await 传染性 | 普通 |
| 阻塞 | 一个阻塞全卡 | 只卡一个线程 |
| 库支持 | 需异步库（aiohttp 等） | 通用 |

asyncio 的「传染性」：一旦用了 async，调用链上的函数都得是 async，这是它最大的工程负担。

### aiohttp 概念

\`aiohttp\` 是 asyncio 生态最流行的 HTTP 客户端/服务端库。概念示例（不依赖实际安装）：

\`\`\`python
# import aiohttp
# async def fetch(session, url):
#     async with session.get(url) as resp:
#         return await resp.text()
#
# async def main():
#     async with aiohttp.ClientSession() as session:
#         html = await fetch(session, "http://example.com")
\`\`\`

本教程代码不依赖第三方库，用 \`asyncio.sleep\` 模拟网络延迟。

### 异步爬虫示例

\`\`\`python
async def fetch(url):              # 定义异步函数 fetch，参数：url
    await asyncio.sleep(0.5)  # 模拟网络
    return "%s 的内容" % url          # 返回 "%s 的内容" % url

async def crawl(urls):             # 定义异步函数 crawl，参数：urls
    tasks = [asyncio.create_task(fetch(url)) for url in urls]  # 创建列表并赋给 tasks
    results = await asyncio.gather(*tasks)  # 将 await asyncio.gather(*tasks) 赋给 results
    return results                 # 返回 results

async def main():                  # 定义异步函数 main
    urls = ["http://%d.com" % i for i in range(10)]  # 创建列表并赋给 urls
    results = await crawl(urls)    # 将 await crawl(urls) 赋给 results
    print(results)                 # 输出 results

asyncio.run(main())                # 对 asyncio 调用 run 方法，参数 main()
\`\`\`

### 取消 cancellation

Task 可以被取消，被取消的协程会收到 \`asyncio.CancelledError\`：

\`\`\`python
async def long_running():          # 定义异步函数 long_running
    try:                           # 尝试执行以下代码块
        await asyncio.sleep(100)
    except asyncio.CancelledError:
        print("被取消，清理资源")          # 输出 "被取消，清理资源"
        raise  # 建议重新抛出

task = asyncio.create_task(long_running())  # 将 asyncio.create_task(long_running()) 赋给 task
await asyncio.sleep(0.1)
task.cancel()                      # 对 task 调用 cancel 方法
try:                               # 尝试执行以下代码块
    await task
except asyncio.CancelledError:
    print("任务已取消")                 # 输出 "任务已取消"
\`\`\`

### 异常处理

\`\`\`python
async def main():                  # 定义异步函数 main
    # gather 默认任一异常即抛
    results = await asyncio.gather(  # 将 await asyncio.gather( 赋给 results
        fetch("a"),
        fetch("b"),
        return_exceptions=True,  # 异常作为结果
    )
    for r in results:              # 遍历 results，每次取值赋给 r
        if isinstance(r, Exception):  # 如果 isinstance(r, Exception) 成立
            print("出错的:", r)       # 输出 "出错的:", r
        else:                      # 否则
            print("成功:", r)        # 输出 "成功:", r
\`\`\`

### 本章小结

| 工具 | 用途 |
| --- | --- |
| async def / await | 定义/等待协程 |
| asyncio.run | 运行入口 |
| create_task | 调度协程并发 |
| gather | 并发收集结果 |
| wait / wait_for | 等待/超时 |
| as_completed | 先完成先返回 |
| async with / async for | 异步上下文/迭代 |
| Queue/Lock/Semaphore | 协程同步 |
| sleep | 非阻塞睡眠 |

核心原则：**asyncio 适合高并发 IO；协程里千万别用阻塞调用**。下面代码完整演示。
`,
    code: `# ============================================================
# 第四章代码：asyncio 异步编程演示
# ============================================================
# 涵盖：协程、await、create_task、gather、wait、wait_for、
#       as_completed、async with/for、Queue、Lock、Semaphore、
#       取消、异常、异步爬虫
# 注意：统一用 asyncio.run() 入口；用 sleep 模拟 IO

import asyncio
import time

print("=" * 60)
print("1. 协程基础与 asyncio.run")
print("=" * 60)

async def hello():
    print("  hello 协程开始")
    await asyncio.sleep(0.1)
    print("  hello 协程结束")
    return "done"

def demo_basic():
    result = asyncio.run(hello())
    print("  返回:", result)

demo_basic()

print()
print("=" * 60)
print("2. await 串行 vs create_task 并发")
print("=" * 60)

async def fetch(url, delay=0.3):
    await asyncio.sleep(delay)
    return "%s ok" % url

async def demo_serial_vs_concurrent():
    # 串行
    t0 = time.time()
    await fetch("a"); await fetch("b"); await fetch("c")
    t1 = time.time()
    print("  串行 3 次: %.3f 秒" % (t1 - t0))

    # 并发（create_task）
    t0 = time.time()
    t1c = asyncio.create_task(fetch("a"))
    t2c = asyncio.create_task(fetch("b"))
    t3c = asyncio.create_task(fetch("c"))
    r1 = await t1c
    r2 = await t2c
    r3 = await t3c
    t1 = time.time()
    print("  并发 3 次: %.3f 秒" % (t1 - t0))
    print("  结果:", r1, r2, r3)

asyncio.run(demo_serial_vs_concurrent())

print()
print("=" * 60)
print("3. gather 并发收集")
print("=" * 60)

async def demo_gather():
    results = await asyncio.gather(
        fetch("a", 0.3),
        fetch("b", 0.2),
        fetch("c", 0.4),
    )
    print("  gather 结果（按输入顺序）:", results)

    # 带异常
    async def failing():
        await asyncio.sleep(0.1)
        raise ValueError("出错了")

    # return_exceptions=True
    results = await asyncio.gather(
        fetch("ok", 0.1),
        failing(),
        return_exceptions=True,
    )
    print("  带异常（return_exceptions=True）:", results)

asyncio.run(demo_gather())

print()
print("=" * 60)
print("4. wait 等待多个")
print("=" * 60)

async def demo_wait():
    tasks = [asyncio.create_task(fetch("task%d" % i, 0.1 * (i + 1))) for i in range(4)]

    done, pending = await asyncio.wait(
        tasks, return_when=asyncio.FIRST_COMPLETED
    )
    print("  FIRST_COMPLETED: 完成 %d 个" % len(done))
    for t in done:
        print("    完成:", t.result())

    # 等待剩余
    if pending:
        done2, _ = await asyncio.wait(pending)
        print("  剩余也完成")

asyncio.run(demo_wait())

print()
print("=" * 60)
print("5. wait_for 超时")
print("=" * 60)

async def slow_task():
    await asyncio.sleep(2)
    return "slow done"

async def demo_timeout():
    try:
        result = await asyncio.wait_for(slow_task(), timeout=0.3)
        print("  结果:", result)
    except asyncio.TimeoutError:
        print("  超时！任务被取消")

    # 不超时的情况
    try:
        result = await asyncio.wait_for(fetch("fast", 0.1), timeout=1)
        print("  快任务结果:", result)
    except asyncio.TimeoutError:
        print("  不应超时")

asyncio.run(demo_timeout())

print()
print("=" * 60)
print("6. as_completed 先完成先返回")
print("=" * 60)

async def demo_as_completed():
    tasks = [asyncio.create_task(fetch("url%d" % i, 0.1 * (5 - i))) for i in range(5)]
    for coro in asyncio.as_completed(tasks):
        result = await coro
        print("  完成:", result)

asyncio.run(demo_as_completed())

print()
print("=" * 60)
print("7. async with 异步上下文管理器")
print("=" * 60)

class AsyncResource:
    def __init__(self, name):
        self.name = name
    async def __aenter__(self):
        print("  获取资源:", self.name)
        await asyncio.sleep(0.05)
        return self
    async def __aexit__(self, exc_type, exc, tb):
        print("  释放资源:", self.name)
        await asyncio.sleep(0.05)

async def demo_async_with():
    async with AsyncResource("DB连接") as r:
        print("  使用:", r.name)
        await asyncio.sleep(0.05)

asyncio.run(demo_async_with())

print()
print("=" * 60)
print("8. async for 异步迭代")
print("=" * 60)

async def async_range(n, delay=0.05):
    for i in range(n):
        await asyncio.sleep(delay)
        yield i

async def demo_async_for():
    async for i in async_range(5):
        print("  收到:", i)

asyncio.run(demo_async_for())

print()
print("=" * 60)
print("9. asyncio.Queue 异步队列（生产者消费者）")
print("=" * 60)

async def producer(q, n):
    for i in range(n):
        await asyncio.sleep(0.03)
        await q.put("数据%d" % i)
        print("  [生产] 数据%d" % i)
    await q.put(None)  # 结束信号

async def consumer(q):
    while True:
        item = await q.get()
        if item is None:
            q.task_done()
            break
        print("  [消费] %s" % item)
        await asyncio.sleep(0.05)
        q.task_done()

async def demo_queue():
    q = asyncio.Queue(maxsize=5)
    p = asyncio.create_task(producer(q, 5))
    c = asyncio.create_task(consumer(q))
    await p
    await q.join()
    c.cancel()
    try:
        await c
    except asyncio.CancelledError:
        pass
    print("  队列演示完成")

asyncio.run(demo_queue())

print()
print("=" * 60)
print("10. asyncio.Lock / Semaphore / Event")
print("=" * 60)

async def demo_lock():
    lock = asyncio.Lock()
    async def worker(idx):
        async with lock:
            print("    worker %d 进入临界区" % idx)
            await asyncio.sleep(0.05)
            print("    worker %d 离开" % idx)
    await asyncio.gather(*[worker(i) for i in range(3)])
    print("  Lock 演示完成")

asyncio.run(demo_lock())

async def demo_semaphore():
    sem = asyncio.Semaphore(2)  # 最多 2 个并发
    current = 0
    max_c = 0
    async def limited(idx):
        nonlocal current, max_c
        async with sem:
            current += 1
            max_c = max(max_c, current)
            print("    任务 %d 运行中" % idx)
            await asyncio.sleep(0.05)
            current -= 1
    await asyncio.gather(*[limited(i) for i in range(5)])
    print("  最大并发（应<=2）:", max_c)

asyncio.run(demo_semaphore())

async def demo_event():
    event = asyncio.Event()
    async def waiter(idx):
        print("    等待者 %d 等待" % idx)
        await event.wait()
        print("    等待者 %d 被唤醒" % idx)
    async def setter():
        await asyncio.sleep(0.1)
        print("    设置事件")
        event.set()
    await asyncio.gather(waiter(1), waiter(2), setter())

asyncio.run(demo_event())

print()
print("=" * 60)
print("11. asyncio.sleep vs time.sleep（阻塞危害）")
print("=" * 60)

async def demo_sleep():
    # asyncio.sleep 非阻塞，并发
    t0 = time.time()
    await asyncio.gather(asyncio.sleep(0.2), asyncio.sleep(0.2))
    t1 = time.time()
    print("  两个 asyncio.sleep 并发: %.3f 秒（应~0.2）" % (t1 - t0))

asyncio.run(demo_sleep())

print()
print("=" * 60)
print("12. 取消 cancellation")
print("=" * 60)

async def long_running():
    try:
        print("  长任务开始")
        await asyncio.sleep(10)
        print("  长任务完成（不应看到）")
    except asyncio.CancelledError:
        print("  长任务被取消，清理资源")
        raise

async def demo_cancel():
    task = asyncio.create_task(long_running())
    await asyncio.sleep(0.1)
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print("  主协程捕获到取消")

asyncio.run(demo_cancel())

print()
print("=" * 60)
print("13. 异常处理")
print("=" * 60)

async def task_ok():
    await asyncio.sleep(0.1)
    return "ok"

async def task_fail():
    await asyncio.sleep(0.1)
    raise ValueError("任务失败")

async def demo_exception():
    # 方式一：try/except 单个 await
    try:
        await task_fail()
    except ValueError as e:
        print("  捕获:", e)

    # 方式二：gather return_exceptions
    results = await asyncio.gather(
        task_ok(), task_fail(), task_ok(),
        return_exceptions=True,
    )
    for i, r in enumerate(results):
        if isinstance(r, Exception):
            print("  任务 %d 失败: %s" % (i, r))
        else:
            print("  任务 %d 成功: %s" % (i, r))

asyncio.run(demo_exception())

print()
print("=" * 60)
print("14. 异步爬虫实战（模拟）")
print("=" * 60)

async def crawl_page(url):
    delay = 0.1 + (hash(url) % 10) * 0.03
    await asyncio.sleep(delay)
    return "%s (%.2fs)" % (url, delay)

async def crawl_all(urls):
    tasks = [asyncio.create_task(crawl_page(url)) for url in urls]
    return await asyncio.gather(*tasks)

async def demo_crawler():
    urls = ["http://page%d.com" % i for i in range(8)]

    # 串行
    t0 = time.time()
    serial = []
    for url in urls:
        serial.append(await crawl_page(url))
    t1 = time.time()
    print("  串行: %.3f 秒" % (t1 - t0))

    # 并发
    t0 = time.time()
    parallel = await crawl_all(urls)
    t1 = time.time()
    print("  并发: %.3f 秒" % (t1 - t0))
    print("  结果数: %d" % len(parallel))

asyncio.run(demo_crawler())

print()
print("=" * 60)
print("15. 综合实战：超时 + 限流 + 异常处理")
print("=" * 60)

async def fetch_with_timeout(url, timeout=0.3):
    try:
        await asyncio.wait_for(crawl_page(url), timeout=timeout)
        return (url, "ok")
    except asyncio.TimeoutError:
        return (url, "timeout")

async def demo_comprehensive():
    sem = asyncio.Semaphore(3)  # 限制并发 3
    urls = ["http://x%d.com" % i for i in range(10)]

    async def limited_fetch(url):
        async with sem:
            return await fetch_with_timeout(url, timeout=0.25)

    results = await asyncio.gather(*[limited_fetch(u) for u in urls])
    ok = sum(1 for _, s in results if s == "ok")
    timeout = sum(1 for _, s in results if s == "timeout")
    print("  成功: %d, 超时: %d" % (ok, timeout))
    for url, status in results:
        print("    %s -> %s" % (url, status))

asyncio.run(demo_comprehensive())

print()
print("=" * 60)
print("全部 asyncio 演示完成！")
print("=" * 60)
`,
  },

  // =========================================================
  // 第五章：并发设计模式
  // =========================================================
  {
    id: "py-concurrency-patterns",
    group: "函数式与并发",
    icon: "🔄",
    title: "并发设计模式",
    content: `## 并发设计模式

掌握了线程、进程、协程这些「工具」后，本章关注**如何用它们组织并发程序**——即**并发设计模式（Concurrency Patterns）**。模式是前人总结的、针对常见并发问题的成熟解决方案。掌握它们能让你写出更清晰、更健壮、更高性能的并发代码。

### 生产者消费者模式

**生产者消费者**是最经典的并发模式：一些线程/协程**生产**数据放入队列，另一些**消费**数据。两者通过队列解耦，互不等待。

#### Queue 实现（多线程）

\`\`\`python
import threading                   # 导入 threading 模块
from queue import Queue            # 从 queue 导入 Queue

def producer(q):                   # 定义函数 producer，参数：q
    for i in range(10):            # 遍历 range(10)，每次取值赋给 i
        q.put(i)        # 生产
    q.put(None)         # 哨兵表示结束

def consumer(q):                   # 定义函数 consumer，参数：q
    while True:                    # 当 True 为真时重复执行
        item = q.get()             # 将 q.get() 赋给 item
        if item is None:           # 如果 item is None 成立
            break                  # 跳出循环
        print("处理:", item)         # 输出 "处理:", item
        q.task_done()              # 对 q 调用 task_done 方法

q = Queue()                        # 将 Queue() 赋给 q
pt = threading.Thread(target=producer, args=(q,))  # 将 threading.Thread(target=producer, args=(q,)) 赋给 pt
ct = threading.Thread(target=consumer, args=(q,))  # 将 threading.Thread(target=consumer, args=(q,)) 赋给 ct
pt.start(); ct.start()             # 对 pt 调用 start 方法，参数 ); ct.start(
pt.join(); ct.join()               # 对 pt 调用 连接 方法，参数 ); ct.join(
\`\`\`

优点：
- **解耦**：生产者消费者不直接依赖
- **缓冲**：队列削峰填谷，应对速度不匹配
- **扩展**：可多生产者多消费者

#### asyncio 实现

\`\`\`python
import asyncio                     # 导入 asyncio 模块

async def producer(q):             # 定义异步函数 producer，参数：q
    for i in range(10):            # 遍历 range(10)，每次取值赋给 i
        await q.put(i)
    await q.put(None)

async def consumer(q):             # 定义异步函数 consumer，参数：q
    while True:                    # 当 True 为真时重复执行
        item = await q.get()       # 将 await q.get() 赋给 item
        if item is None:           # 如果 item is None 成立
            break                  # 跳出循环
        print("处理:", item)         # 输出 "处理:", item
        q.task_done()              # 对 q 调用 task_done 方法

async def main():                  # 定义异步函数 main
    q = asyncio.Queue()            # 将 asyncio.Queue() 赋给 q
    await asyncio.gather(producer(q), consumer(q))

asyncio.run(main())                # 对 asyncio 调用 run 方法，参数 main()
\`\`\`

### 读写锁思想

**读写锁（Read-Write Lock）** 区分读和写：
- 多个读者可同时读（读不修改数据）
- 写者必须独占（写会修改数据）
- 写者优先或读者优先（不同实现）

Python 没有内置读写锁，但可以用 \`threading\` 实现。一个简化思路：

\`\`\`python
import threading                   # 导入 threading 模块

class ReadWriteLock:               # 定义类 ReadWriteLock
    def __init__(self):            # 定义函数 __init__，参数：self
        self._read_lock = threading.Lock()
        self._write_lock = threading.Lock()
        self._readers = 0

    def acquire_read(self):        # 定义函数 acquire_read，参数：self
        with self._read_lock:      # 使用上下文管理器 self._read_lock
            self._readers += 1
            if self._readers == 1: # 如果 self._readers == 1 成立
                self._write_lock.acquire()  # 第一个读者锁住写

    def release_read(self):        # 定义函数 release_read，参数：self
        with self._read_lock:      # 使用上下文管理器 self._read_lock
            self._readers -= 1
            if self._readers == 0: # 如果 self._readers == 0 成立
                self._write_lock.release()  # 最后一个读者释放写

    def acquire_write(self):       # 定义函数 acquire_write，参数：self
        self._write_lock.acquire()

    def release_write(self):       # 定义函数 release_write，参数：self
        self._write_lock.release()
\`\`\`

适用：**读多写少**的场景（如缓存）。

### 限流器（Semaphore）

用 \`Semaphore\` 限制并发数，保护下游资源：

\`\`\`python
import threading                   # 导入 threading 模块

sem = threading.Semaphore(5)  # 最多 5 个并发

def fetch(url):                    # 定义函数 fetch，参数：url
    with sem:                      # 使用上下文管理器 sem
        # 实际请求
        pass                       # 空操作，占位
\`\`\`

协程版：

\`\`\`python
import asyncio                     # 导入 asyncio 模块

async def limited_fetch(urls, max_concurrent=5):  # 定义异步函数 limited_fetch，参数：urls, max_concurrent=5
    sem = asyncio.Semaphore(max_concurrent)  # 将 asyncio.Semaphore(max_concurrent) 赋给 sem
    async def fetch(url):          # 定义异步函数 fetch，参数：url
        async with sem:
            await asyncio.sleep(0.1)
            return url             # 返回 url
    return await asyncio.gather(*[fetch(u) for u in urls])  # 返回 await asyncio.gather(*[fetch(u) for u in urls])
\`\`\`

### 超时控制

**超时控制**防止任务永远卡住。三种方式：

\`\`\`python
# 线程：join timeout
t.join(timeout=5)                  # 对 t 调用 连接 方法，参数 timeout=5
if t.is_alive():                   # 如果 t.is_alive() 成立
    print("超时，线程还在跑")  # 但无法强制停止 Python 线程！

# asyncio：wait_for
try:                               # 尝试执行以下代码块
    await asyncio.wait_for(coro, timeout=5)
except asyncio.TimeoutError:
    print("超时")                    # 输出 "超时"

# concurrent.futures：result timeout
future.result(timeout=5)  # 超时抛 TimeoutError
\`\`\`

> 注意：Python 线程**无法被强制杀死**（没有 \`Thread.kill\`）。超时只能让主线程不再等待，子线程可能仍在后台跑。协程和进程可以被取消/终止。

### 线程安全的单例

单例模式在多线程下要小心——多个线程同时首次访问可能创建多个实例。用锁保证：

\`\`\`python
import threading                   # 导入 threading 模块

class Singleton:                   # 定义类 Singleton
    _instance = None               # 将 None 赋给 _instance
    _lock = threading.Lock()       # 将 threading.Lock() 赋给 _lock

    def __new__(cls):              # 定义函数 __new__，参数：cls
        if cls._instance is None:          # 双重检查
            with cls._lock:        # 使用上下文管理器 cls._lock
                if cls._instance is None:  # 再次检查
                    cls._instance = super().__new__(cls)
        return cls._instance       # 返回 cls._instance
\`\`\`

**双重检查锁（Double-Checked Locking）**：先无锁检查，没有再上锁创建，避免每次都加锁。

### 并行下载示例

\`\`\`python
from concurrent.futures import ThreadPoolExecutor  # 从 concurrent.futures 导入 ThreadPoolExecutor

def download(url):                 # 定义函数 download，参数：url
    # 模拟下载
    import time                    # 导入 time 模块
    time.sleep(0.5)                # 对 time 调用 sleep 方法，参数 0.5
    return "%s done" % url         # 返回 "%s done" % url

urls = ["http://a", "http://b", "http://c"]  # 创建列表并赋给 urls
with ThreadPoolExecutor(max_workers=3) as executor:  # 使用上下文管理器 ThreadPoolExecutor(max_workers=3)，绑定到 executor
    results = list(executor.map(download, urls))  # 将 list(executor.map(download, urls)) 赋给 results
\`\`\`

### 流水线模式

**流水线（Pipeline）** 把任务分成多个阶段，每个阶段一个线程/协程，数据像流水线一样流过：

\`\`\`python
# 下载 -> 解析 -> 存储
def stage(in_q, out_q, transform): # 定义函数 stage，参数：in_q, out_q, transform
    while True:                    # 当 True 为真时重复执行
        item = in_q.get()          # 将 in_q.get() 赋给 item
        if item is None:           # 如果 item is None 成立
            out_q.put(None)        # 对 out_q 调用 put 方法，参数 None
            break                  # 跳出循环
        out_q.put(transform(item)) # 对 out_q 调用 put 方法，参数 transform(item)

q1 = Queue(); q2 = Queue(); q3 = Queue()  # 将 Queue(); q2 = Queue(); q3 = Queue() 赋给 q1
# 阶段1：下载 -> q1
# 阶段2：q1 -> 解析 -> q2
# 阶段3：q2 -> 存储 -> q3
\`\`\`

每个阶段并发执行，整体吞吐量提升。

### 扇出扇入 fan-out / fan-in

- **扇出（Fan-out）**：一个任务分发到多个 worker 并行处理
- **扇入（Fan-in）**：多个 worker 的结果汇集到一个消费者

\`\`\`python
import asyncio                     # 导入 asyncio 模块

async def worker(q_in, q_out, wid):  # 定义异步函数 worker，参数：q_in, q_out, wid
    while True:                    # 当 True 为真时重复执行
        item = await q_in.get()    # 将 await q_in.get() 赋给 item
        if item is None:           # 如果 item is None 成立
            break                  # 跳出循环
        result = item * 2  # 处理
        await q_out.put((wid, result))
        q_in.task_done()           # 对 q_in 调用 task_done 方法

async def fan_out_fan_in():        # 定义异步函数 fan_out_fan_in
    q_in = asyncio.Queue()         # 将 asyncio.Queue() 赋给 q_in
    q_out = asyncio.Queue()        # 将 asyncio.Queue() 赋给 q_out

    # 扇出：3 个 worker
    workers = [asyncio.create_task(worker(q_in, q_out, i)) for i in range(3)]  # 创建列表并赋给 workers

    # 投入任务
    for i in range(9):             # 遍历 range(9)，每次取值赋给 i
        await q_in.put(i)
    for _ in workers:              # 遍历 workers，每次取值赋给 _
        await q_in.put(None)  # 结束信号

    # 扇入：收集结果
    results = []                   # 创建列表并赋给 results
    for _ in range(9):             # 遍历 range(9)，每次取值赋给 _
        results.append(await q_out.get())  # 对 results 调用 追加 方法，参数 await q_out.get()

    await asyncio.gather(*workers)
    return results                 # 返回 results
\`\`\`

### Future 结果回调

\`concurrent.futures\` 的 Future 支持完成回调：

\`\`\`python
from concurrent.futures import ThreadPoolExecutor  # 从 concurrent.futures 导入 ThreadPoolExecutor

def on_done(future):               # 定义函数 on_done，参数：future
    try:                           # 尝试执行以下代码块
        print("完成:", future.result())  # 输出 "完成:", future.result()
    except Exception as e:         # 捕获 Exception 异常并绑定到 e
        print("出错:", e)            # 输出 "出错:", e

with ThreadPoolExecutor() as executor:  # 使用上下文管理器 ThreadPoolExecutor()，绑定到 executor
    fut = executor.submit(lambda: 42)  # 将 executor.submit(lambda: 42) 赋给 fut
    fut.add_done_callback(on_done) # 对 fut 调用 add_done_callback 方法，参数 on_done
\`\`\`

回调在**提交任务的线程**还是**执行任务的线程**？在 CPython 中，回调由持有 Future 的线程调用（通常是工作线程）。asyncio 的 Task 回调则在事件循环线程。

### concurrent.futures 统一接口

\`concurrent.futures\` 提供了线程池和进程池的**统一接口**：

\`\`\`python
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor  # 从 concurrent.futures 导入 ThreadPoolExecutor, ProcessPoolExecutor

# 线程池（IO 密集）
with ThreadPoolExecutor() as executor:  # 使用上下文管理器 ThreadPoolExecutor()，绑定到 executor
    ...

# 进程池（CPU 密集）—— 只需换类名！
with ProcessPoolExecutor() as executor:  # 使用上下文管理器 ProcessPoolExecutor()，绑定到 executor
    ...
\`\`\`

统一的 API：\`submit\`、\`map\`、\`shutdown\`，便于切换。

### 协程 vs 线程 vs 进程选型决策树

\`\`\`
任务类型？
├─ CPU 密集？
│   └─ 用多进程（multiprocessing / ProcessPoolExecutor）
├─ IO 密集？
│   ├─ 并发数 < 100？→ 多线程（ThreadPoolExecutor，简单通用）
│   ├─ 并发数 > 1000？→ asyncio（轻量高并发）
│   └─ 需要兼容同步库？→ 多线程
└─ 混合？
    └─ IO 用协程/线程，CPU 部分用进程池（run_in_executor）
\`\`\`

决策要点：
1. **CPU 密集** → 多进程（绕开 GIL）
2. **IO 密集 + 低并发** → 多线程（简单）
3. **IO 密集 + 高并发** → asyncio（轻量）
4. **已有同步代码** → 多线程（asyncio 需要全链路改造）
5. **需要真正并行 + 共享状态少** → 多进程

### asyncio 混合：run_in_executor

asyncio 可以用 \`run_in_executor\` 把阻塞任务（CPU 密集或同步 IO）丢到线程池/进程池：

\`\`\`python
import asyncio                     # 导入 asyncio 模块
from concurrent.futures import ProcessPoolExecutor  # 从 concurrent.futures 导入 ProcessPoolExecutor

def cpu_heavy(n):                  # 定义函数 cpu_heavy，参数：n
    return sum(i * i for i in range(n))  # 返回 sum(i * i for i in range(n))

async def main():                  # 定义异步函数 main
    loop = asyncio.get_running_loop()  # 将 asyncio.get_running_loop() 赋给 loop
    # 丢到进程池执行，不阻塞事件循环
    result = await loop.run_in_executor(  # 将 await loop.run_in_executor( 赋给 result
        ProcessPoolExecutor(), cpu_heavy, 10_000_000
    )
    print(result)                  # 输出 result

asyncio.run(main())                # 对 asyncio 调用 run 方法，参数 main()
\`\`\`

这是「协程 + 进程」混合并发的标准做法。

### 实战案例

#### 案例 1：并发请求（限流 + 超时）

\`\`\`python
async def fetch_all(urls, max_concurrent=10, timeout=5):  # 定义异步函数 fetch_all，参数：urls, max_concurrent=10, timeout=5
    sem = asyncio.Semaphore(max_concurrent)  # 将 asyncio.Semaphore(max_concurrent) 赋给 sem
    async def one(url):            # 定义异步函数 one，参数：url
        async with sem:
            try:                   # 尝试执行以下代码块
                return await asyncio.wait_for(do_fetch(url), timeout)  # 返回 await asyncio.wait_for(do_fetch(url), timeout)
            except asyncio.TimeoutError:
                return None        # 返回 None
    return await asyncio.gather(*[one(u) for u in urls])  # 返回 await asyncio.gather(*[one(u) for u in urls])
\`\`\`

#### 案例 2：并行计算（CPU 密集）

\`\`\`python
from multiprocessing import Pool   # 从 multiprocessing 导入 Pool
def chunk_process(chunk):          # 定义函数 chunk_process，参数：chunk
    return sum(x * x for x in chunk)  # 返回 sum(x * x for x in chunk)

with Pool(4) as pool:              # 使用上下文管理器 Pool(4)，绑定到 pool
    chunks = [range(0, 2500000), range(2500000, 5000000), ...]  # 创建列表并赋给 chunks
    results = pool.map(chunk_process, chunks)  # 将 pool.map(chunk_process, chunks) 赋给 results
    total = sum(results)           # 将 sum(results) 赋给 total
\`\`\`

#### 案例 3：任务队列（生产者消费者）

见前面的生产者消费者模式。

### 本章小结

| 模式 | 适用 | 工具 |
| --- | --- | --- |
| 生产者消费者 | 解耦生产与消费 | Queue |
| 读写锁 | 读多写少 | 自实现 |
| 限流器 | 保护下游 | Semaphore |
| 超时控制 | 防卡死 | wait_for / timeout |
| 线程安全单例 | 全局唯一 | 双重检查锁 |
| 流水线 | 分阶段处理 | 多 Queue |
| 扇出扇入 | 并行处理+汇总 | Queue + gather |
| run_in_executor | 协程混合阻塞任务 | asyncio + futures |

核心：**先选对工具（线程/进程/协程），再用对模式**。下面代码完整演示。
`,
    code: `# ============================================================
# 第五章代码：并发设计模式演示
# ============================================================
# 涵盖：生产者消费者、读写锁、限流、超时、单例、流水线、
#       扇出扇入、Future 回调、concurrent.futures、混合并发
# 注意：所有 demo 为短任务，确保安全运行

import threading
import time
import asyncio
from queue import Queue
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed
import multiprocessing as _mp

# macOS 默认 spawn 会重新导入主模块，教学演示用 fork 启动方式。
try:
    _mp.set_start_method("fork")
except RuntimeError:
    pass

print("=" * 60)
print("1. 生产者消费者（多线程 Queue）")
print("=" * 60)

def producer(q, name, count):
    for i in range(count):
        time.sleep(0.02)
        item = "%s-%d" % (name, i)
        q.put(item)
        print("  [生产] %s" % item)
    q.put(None)  # 结束信号

def consumer(q, name):
    while True:
        item = q.get()
        if item is None:
            q.task_done()
            break
        print("  [%s 消费] %s" % (name, item))
        time.sleep(0.03)
        q.task_done()

def demo_pc():
    q = Queue(maxsize=10)
    producers = [threading.Thread(target=producer, args=(q, "P%d" % i, 3)) for i in range(2)]
    consumers = [threading.Thread(target=consumer, args=(q, "C%d" % i)) for i in range(2)]
    for t in producers + consumers:
        t.start()
    for t in producers:
        t.join()
    # 给每个消费者发结束信号
    for _ in consumers:
        q.put(None)
    for t in consumers:
        t.join()
    print("  生产者消费者完成")

demo_pc()

print()
print("=" * 60)
print("2. 生产者消费者（asyncio.Queue）")
print("=" * 60)

async def aproducer(q, name, count):
    for i in range(count):
        await asyncio.sleep(0.02)
        item = "%s-%d" % (name, i)
        await q.put(item)
        print("  [生产] %s" % item)
    await q.put(None)

async def aconsumer(q, name):
    while True:
        item = await q.get()
        if item is None:
            q.task_done()
            break
        print("  [%s 消费] %s" % (name, item))
        await asyncio.sleep(0.03)
        q.task_done()

async def demo_pc_async():
    q = asyncio.Queue(maxsize=10)
    await asyncio.gather(
        aproducer(q, "P", 4),
        aconsumer(q, "C"),
    )
    print("  asyncio 生产者消费者完成")

asyncio.run(demo_pc_async())

print()
print("=" * 60)
print("3. 读写锁（简化实现）")
print("=" * 60)

class ReadWriteLock:
    def __init__(self):
        self._read_lock = threading.Lock()
        self._write_lock = threading.Lock()
        self._readers = 0

    def acquire_read(self):
        with self._read_lock:
            self._readers += 1
            if self._readers == 1:
                self._write_lock.acquire()

    def release_read(self):
        with self._read_lock:
            self._readers -= 1
            if self._readers == 0:
                self._write_lock.release()

    def acquire_write(self):
        self._write_lock.acquire()

    def release_write(self):
        self._write_lock.release()

def demo_rwlock():
    rwlock = ReadWriteLock()
    log_lock = threading.Lock()
    logs = []

    def reader(idx):
        rwlock.acquire_read()
        try:
            with log_lock:
                logs.append("读者 %d 读取" % idx)
            time.sleep(0.02)
        finally:
            rwlock.release_read()

    def writer(idx):
        rwlock.acquire_write()
        try:
            with log_lock:
                logs.append("写者 %d 写入" % idx)
            time.sleep(0.02)
        finally:
            rwlock.release_write()

    threads = []
    for i in range(3):
        threads.append(threading.Thread(target=reader, args=(i,)))
    for i in range(2):
        threads.append(threading.Thread(target=writer, args=(i,)))
    for t in threads: t.start()
    for t in threads: t.join()
    print("  读写锁演示完成，操作数:", len(logs))
    for line in logs:
        print("   ", line)

demo_rwlock()

print()
print("=" * 60)
print("4. 限流器（Semaphore）")
print("=" * 60)

def demo_rate_limit():
    sem = threading.Semaphore(3)
    current = 0
    max_c = 0
    stat_lock = threading.Lock()

    def task(tid):
        nonlocal current, max_c
        with sem:
            with stat_lock:
                current += 1
                max_c = max(max_c, current)
            print("  任务 %d 运行中" % tid)
            time.sleep(0.05)
            with stat_lock:
                current -= 1

    threads = [threading.Thread(target=task, args=(i,)) for i in range(8)]
    for t in threads: t.start()
    for t in threads: t.join()
    print("  最大并发（应<=3）:", max_c)

demo_rate_limit()

print()
print("=" * 60)
print("5. 超时控制")
print("=" * 60)

def demo_timeout():
    # 线程 join 超时（无法真正停止线程）
    def long_task():
        time.sleep(2)

    t = threading.Thread(target=long_task, daemon=True)
    t.start()
    t.join(timeout=0.2)
    if t.is_alive():
        print("  线程 join 超时，线程仍在后台（daemon 会随主进程退出）")

    # concurrent.futures result 超时
    with ThreadPoolExecutor(max_workers=2) as executor:
        fut = executor.submit(time.sleep, 2)
        try:
            fut.result(timeout=0.2)
            print("  future 完成")
        except Exception as e:
            print("  future 超时:", type(e).__name__)

demo_timeout()

async def demo_timeout_async():
    async def slow():
        await asyncio.sleep(2)
        return "done"

    try:
        await asyncio.wait_for(slow(), timeout=0.2)
        print("  asyncio 未超时")
    except asyncio.TimeoutError:
        print("  asyncio 超时（任务被取消）")

asyncio.run(demo_timeout_async())

print()
print("=" * 60)
print("6. 线程安全的单例（双重检查锁）")
print("=" * 60)

class Singleton:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    time.sleep(0.01)  # 模拟初始化耗时
                    cls._instance = super().__new__(cls)
                    cls._instance.value = 0
        return cls._instance

    def add(self):
        self.value += 1
        return self.value

def demo_singleton():
    instances = []
    def worker():
        instances.append(Singleton())

    threads = [threading.Thread(target=worker) for _ in range(10)]
    for t in threads: t.start()
    for t in threads: t.join()

    # 所有线程拿到的是同一个实例
    ids = set(id(i) for i in instances)
    print("  创建实例数:", len(instances), "唯一实例数:", len(ids))

    s = Singleton()
    print("  线程安全累加:", s.add(), s.add(), s.add())

demo_singleton()

print()
print("=" * 60)
print("7. 流水线模式（多阶段处理）")
print("=" * 60)

def demo_pipeline():
    q1 = Queue()
    q2 = Queue()
    q3 = Queue()
    SENTINEL = None

    def stage_download(in_q, out_q):
        for i in range(5):
            time.sleep(0.02)
            out_q.put("page%d.html" % i)
        out_q.put(SENTINEL)

    def stage_parse(in_q, out_q):
        while True:
            item = in_q.get()
            if item is None:
                out_q.put(SENTINEL)
                break
            time.sleep(0.02)
            out_q.put(item.replace(".html", ".txt"))

    def stage_save(in_q, out_q):
        saved = []
        while True:
            item = in_q.get()
            if item is None:
                out_q.put(SENTINEL)
                break
            time.sleep(0.02)
            saved.append(item)
        out_q.put(saved)

    t1 = threading.Thread(target=stage_download, args=(None, q1))
    t2 = threading.Thread(target=stage_parse, args=(q1, q2))
    t3 = threading.Thread(target=stage_save, args=(q2, q3))
    t1.start(); t2.start(); t3.start()
    t1.join(); t2.join(); t3.join()
    saved = q3.get()
    print("  流水线保存结果:", saved)

demo_pipeline()

print()
print("=" * 60)
print("8. 扇出扇入（fan-out / fan-in）")
print("=" * 60)

async def demo_fan_out_fan_in():
    q_in = asyncio.Queue()
    q_out = asyncio.Queue()

    async def worker(wid):
        while True:
            item = await q_in.get()
            if item is None:
                q_in.task_done()
                break
            await asyncio.sleep(0.03)
            await q_out.put((wid, item * 2))
            q_in.task_done()

    # 扇出：3 个 worker 并行
    workers = [asyncio.create_task(worker(i)) for i in range(3)]

    # 投入 9 个任务
    for i in range(9):
        await q_in.put(i)
    for _ in workers:
        await q_in.put(None)

    # 扇入：收集结果
    results = []
    for _ in range(9):
        results.append(await q_out.get())

    await asyncio.gather(*workers)
    results.sort(key=lambda x: x[1] // 2)
    print("  扇出扇入结果:", results)

asyncio.run(demo_fan_out_fan_in())

print()
print("=" * 60)
print("9. Future 结果回调")
print("=" * 60)

def demo_callback():
    results = []
    lock = threading.Lock()

    def task(x):
        time.sleep(0.05)
        return x * x

    def on_done(fut):
        try:
            with lock:
                results.append(fut.result())
                print("  回调收到:", fut.result())
        except Exception as e:
            print("  回调出错:", e)

    with ThreadPoolExecutor(max_workers=3) as executor:
        futs = [executor.submit(task, i) for i in range(5)]
        for f in futs:
            f.add_done_callback(on_done)

    print("  回调收集:", sorted(results))

demo_callback()

print()
print("=" * 60)
print("10. concurrent.futures 统一接口")
print("=" * 60)

def cpu_work(n):
    total = 0
    for i in range(n):
        total += i * i
    return total

def demo_unified():
    N = 500_000
    # 线程池（IO 密集场景演示）
    with ThreadPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(cpu_work, [N] * 4))
    print("  线程池结果:", results)

    # 进程池（CPU 密集场景演示）—— API 完全一致
    with ProcessPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(cpu_work, [N] * 4))
    print("  进程池结果:", results)
    print("  两者 API 一致，只换类名")

demo_unified()

print()
print("=" * 60)
print("11. asyncio 混合并发：run_in_executor")
print("=" * 60)

async def demo_mixed():
    loop = asyncio.get_running_loop()

    # 阻塞任务丢到线程池（不卡事件循环）
    def blocking_io(n):
        time.sleep(0.1)
        return n * n

    # 同时跑一个协程任务
    async def coro_task():
        for i in range(3):
            await asyncio.sleep(0.03)
            print("    协程任务心跳 %d" % i)
        return "coro done"

    # 并发：阻塞任务在线程池 + 协程在事件循环
    t0 = time.time()
    fut = loop.run_in_executor(None, blocking_io, 42)
    coro_result = await asyncio.gather(coro_task(), fut)
    t1 = time.time()
    print("  混合并发结果:", coro_result, "耗时 %.2fs" % (t1 - t0))

asyncio.run(demo_mixed())

print()
print("=" * 60)
print("12. 综合实战：并发请求（限流 + 超时 + 异常）")
print("=" * 60)

async def demo_comprehensive():
    sem = asyncio.Semaphore(3)  # 限流 3

    async def fetch(url):
        async with sem:
            delay = 0.05 + (hash(url) % 5) * 0.04
            try:
                await asyncio.wait_for(asyncio.sleep(delay), timeout=0.15)
                return (url, "ok", delay)
            except asyncio.TimeoutError:
                return (url, "timeout", delay)

    urls = ["http://u%d.com" % i for i in range(10)]
    results = await asyncio.gather(*[fetch(u) for u in urls])

    ok = sum(1 for _, s, _ in results if s == "ok")
    timeout = sum(1 for _, s, _ in results if s == "timeout")
    print("  成功: %d, 超时: %d" % (ok, timeout))
    for url, status, delay in results:
        print("    %s -> %s (delay=%.2f)" % (url, status, delay))

asyncio.run(demo_comprehensive())

print()
print("=" * 60)
print("13. 选型决策对比")
print("=" * 60)

def cpu_task(n):
    return sum(i * i for i in range(n))

def demo_decision():
    print("  CPU 密集任务对比:")
    N = 1_000_000
    # 单线程
    t0 = time.time()
    s1 = cpu_task(N) + cpu_task(N) + cpu_task(N) + cpu_task(N)
    t1 = time.time()
    print("    单线程 4 次: %.3f s" % (t1 - t0))

    # 多线程（GIL 限制，不快）
    t0 = time.time()
    with ThreadPoolExecutor(max_workers=4) as ex:
        results = list(ex.map(cpu_task, [N] * 4))
    t1 = time.time()
    print("    多线程 4 次: %.3f s (GIL 限制)" % (t1 - t0))

    # 多进程（真并行，应更快）
    t0 = time.time()
    with ProcessPoolExecutor(max_workers=4) as ex:
        results = list(ex.map(cpu_task, [N] * 4))
    t1 = time.time()
    print("    多进程 4 次: %.3f s (真并行)" % (t1 - t0))

demo_decision()

print()
print("=" * 60)
print("全部并发设计模式演示完成！")
print("=" * 60)
`,
  },

  // =========================================================
  // 第六章：子进程与系统交互
  // =========================================================
  {
    id: "py-subprocess-system",
    group: "函数式与并发",
    icon: "💻",
    title: "子进程与系统交互",
    content: `## 子进程与系统交互

很多时候，Python 程序需要**调用外部命令**：执行 git、npm、运行另一个 Python 脚本、获取系统信息等。Python 标准库的 \`subprocess\` 模块就是为此而生——它是「Python 调用外部进程」的官方推荐方案，比 \`os.system\`、\`os.popen\` 更安全、更强大、更灵活。本章系统讲解 subprocess 的用法、安全注意事项，以及与系统交互的相关工具。

### 为什么需要 subprocess

常见场景：
- 调用 \`git\`、\`npm\`、\`pip\` 等命令行工具
- 运行其他语言写的程序（编译后的二进制、shell 脚本）
- 获取命令输出（如 \`date\`、\`whoami\`、\`ifconfig\`）
- 在 Python 中编排多个工具的流水线
- 后台运行服务进程

\`\`\`python
# 在 Python 中执行 shell 命令
import subprocess                  # 导入 subprocess 模块
result = subprocess.run(["echo", "hello"], capture_output=True, text=True)  # 将 subprocess.run(["echo", "hello"], capture_output=True, text=True) 赋给 result
print(result.stdout)  # hello
\`\`\`

### subprocess.run —— 推荐入口

\`subprocess.run()\`（Python 3.5+）是执行子进程的**推荐方式**，它封装了常用操作，返回 \`CompletedProcess\` 对象。

\`\`\`python
subprocess.run(
    args,               # 命令（列表或字符串）
    capture_output=False,  # 是否捕获 stdout/stderr
    text=False,         # 是否以文本模式（而非字节）返回
    check=False,        # 非零退出码是否抛 CalledProcessError
    timeout=None,       # 超时秒数
    env=None,           # 环境变量字典
    cwd=None,           # 工作目录
    input=None,         # 传给 stdin 的数据
    shell=False,        # 是否通过 shell 执行
)
\`\`\`

#### 基本示例

\`\`\`python
import subprocess                  # 导入 subprocess 模块

# 最简单的调用
result = subprocess.run(["echo", "hello"], capture_output=True, text=True)  # 将 subprocess.run(["echo", "hello"], capture_output=True, text=True) 赋给 result
print(result.stdout)        # hello
print(result.returncode)    # 0
print(result.args)          # ['echo', 'hello']

# check=True：非零退出码抛异常
try:                               # 尝试执行以下代码块
    subprocess.run(["false"], check=True)  # 对 subprocess 调用 run 方法，参数 ["false"], check=True
except subprocess.CalledProcessError as e:
    print("命令失败，退出码:", e.returncode)  # 输出 "命令失败，退出码:", e.returncode
\`\`\`

#### capture_output 与 text

- \`capture_output=True\`：等价于 \`stdout=PIPE, stderr=PIPE\`，捕获输出
- \`text=True\`（或 \`universal_newlines=True\`）：输出为字符串而非字节

\`\`\`python
# 字节模式（默认）
r1 = subprocess.run(["echo", "hi"], capture_output=True)  # 将 subprocess.run(["echo", "hi"], capture_output=True) 赋给 r1
print(type(r1.stdout))  # <class 'bytes'>
print(r1.stdout)        # b'hi\\n'

# 文本模式
r2 = subprocess.run(["echo", "hi"], capture_output=True, text=True)  # 将 subprocess.run(["echo", "hi"], capture_output=True, text=True) 赋给 r2
print(type(r2.stdout))  # <class 'str'>
print(r2.stdout)        # hi\\n
\`\`\`

#### timeout 超时

\`\`\`python
try:                               # 尝试执行以下代码块
    subprocess.run(["sleep", "10"], timeout=2)  # 对 subprocess 调用 run 方法，参数 ["sleep", "10"], timeout=2
except subprocess.TimeoutExpired as e:
    print("超时:", e)                # 输出 "超时:", e
\`\`\`

超时后子进程会被杀死。

### 参数列表 vs 字符串

subprocess 的 \`args\` 可以是**列表**或**字符串**：

\`\`\`python
# 列表（推荐，安全）
subprocess.run(["ls", "-l", "/tmp"])  # 对 subprocess 调用 run 方法，参数 ["ls", "-l", "/tmp"]

# 字符串 + shell=True
subprocess.run("ls -l /tmp", shell=True)  # 对 subprocess 调用 run 方法，参数 "ls -l /tmp", shell=True
\`\`\`

**强烈推荐用列表**：避免 shell 注入风险。

### Popen 类

\`run()\` 是同步的（等子进程结束才返回）。需要更细粒度控制（如边运行边读取输出、与子进程交互）时，用 \`Popen\`。

\`\`\`python
import subprocess                  # 导入 subprocess 模块

p = subprocess.Popen(              # 将 subprocess.Popen( 赋给 p
    ["python", "-c", "print(1)"],
    stdout=subprocess.PIPE,        # 将 subprocess.PIPE, 赋给 stdout
    stderr=subprocess.PIPE,        # 将 subprocess.PIPE, 赋给 stderr
    text=True,                     # 将 True, 赋给 text
)
stdout, stderr = p.communicate()  # 等待结束，获取输出
print("输出:", stdout)               # 输出 "输出:", stdout
print("退出码:", p.returncode)        # 输出 "退出码:", p.returncode
\`\`\`

#### communicate 方法

\`p.communicate(input=None, timeout=None)\` 是与子进程交互的标准方法：
- 读取 stdout/stderr 直到结束
- 可向 stdin 写入数据
- 避免死锁（同时读写管道）

\`\`\`python
# 向子进程 stdin 传数据
p = subprocess.Popen(              # 将 subprocess.Popen( 赋给 p
    ["python", "-c", "x = input(); print('got', x)"],
    stdin=subprocess.PIPE,         # 将 subprocess.PIPE, 赋给 stdin
    stdout=subprocess.PIPE,        # 将 subprocess.PIPE, 赋给 stdout
    text=True,                     # 将 True, 赋给 text
)
out, err = p.communicate(input="hello")
print(out)  # got hello
\`\`\`

> **死锁陷阱**：如果用 \`p.stdout.read()\` 读取大量输出，而 stderr 缓冲区满了，子进程会阻塞写 stderr，导致死锁。用 \`communicate()\` 可避免。

### stdin / stdout / stderr 管道

\`Popen\` 的管道参数：

\`\`\`python
p = subprocess.Popen(              # 将 subprocess.Popen( 赋给 p
    ["cat"],
    stdin=subprocess.PIPE,   # 管道，可写入
    stdout=subprocess.PIPE,  # 管道，可读取
    stderr=subprocess.DEVNULL,  # 丢弃
    text=True,                     # 将 True, 赋给 text
)
\`\`\`

特殊值：
- \`subprocess.PIPE\`：创建管道
- \`subprocess.DEVNULL\`：丢弃（重定向到 /dev/null）
- \`subprocess.STDOUT\`：把 stderr 合并到 stdout
- 文件对象：重定向到文件

### returncode 退出码

子进程的退出码：0 通常表示成功，非 0 表示失败。

\`\`\`python
r = subprocess.run(["ls", "/nonexistent"], capture_output=True, text=True)  # 将 subprocess.run(["ls", "/nonexistent"], capture_output=True, text=True) 赋给 r
print(r.returncode)  # 非 0
print(r.stderr)      # 错误信息
\`\`\`

### call / check_call / check_output

这是更早的 API（run 出现前常用）：

| 函数 | 行为 |
| --- | --- |
| \`call(args)\` | 等待结束，返回退出码 |
| \`check_call(args)\` | 等待结束，非 0 抛 CalledProcessError |
| \`check_output(args)\` | 捕获 stdout，非 0 抛异常，返回 stdout |

\`\`\`python
# 等价写法
rc = subprocess.call(["echo", "hi"])  # 返回 0
subprocess.check_call(["echo", "hi"])  # 非 0 抛异常
out = subprocess.check_output(["echo", "hi"], text=True)  # 返回 "hi\\n"
\`\`\`

> 新代码推荐用 \`run()\`，这三个函数保留是为了向后兼容。

### shell=True 的风险

\`shell=True\` 会通过 shell 解析命令字符串，带来**命令注入风险**：

\`\`\`python
# 危险！如果 filename 来自用户输入
filename = "a.txt; rm -rf /"       # 将字符串 "a.txt; rm -rf /" 赋给 filename
subprocess.run("cat " + filename, shell=True)  # 灾难性！
\`\`\`

\`shell=True\` 时，字符串被 shell 解析，\`; rm -rf /\` 会被当作新命令执行。

**安全做法**：用列表 + \`shell=False\`（默认）：

\`\`\`python
filename = "a.txt; rm -rf /"       # 将字符串 "a.txt; rm -rf /" 赋给 filename
subprocess.run(["cat", filename])  # filename 作为单个参数，安全
# cat 会尝试打开名为 "a.txt; rm -rf /" 的文件（报错），不会执行 rm
\`\`\`

**何时必须 shell=True**：需要 shell 特性（管道 \`|\`、通配 \`*\`、重定向 \`>\`、环境变量展开 \`$\`）时。这时务必对输入做严格校验。

### 环境变量 env

\`\`\`python
import os                          # 导入 os 模块
env = os.environ.copy()            # 将 os.environ.copy() 赋给 env
env["MY_VAR"] = "custom"
subprocess.run(["env"], env=env, capture_output=True, text=True)  # 对 subprocess 调用 run 方法，参数 ["env"], env=env, capture_output=True, text=True
\`\`\`

- \`env=None\`：继承父进程环境
- \`env=dict\`：使用指定环境（完全替换）

### cwd 工作目录

\`\`\`python
subprocess.run(["ls"], cwd="/tmp", capture_output=True, text=True)  # 对 subprocess 调用 run 方法，参数 ["ls"], cwd="/tmp", capture_output=True, text=True
\`\`\`

子进程会在 \`/tmp\` 下执行 \`ls\`。

### 信号发送：terminate / kill

\`Popen\` 对象可以发送信号：

\`\`\`python
p = subprocess.Popen(["sleep", "100"])  # 将 subprocess.Popen(["sleep", "100"]) 赋给 p
p.terminate()  # 发送 SIGTERM（优雅终止）
p.kill()       # 发送 SIGKILL（强制杀死）
p.send_signal(signal.SIGTERM)  # 发送指定信号
\`\`\`

- \`terminate()\`：发 SIGTERM（Unix）/ TerminateProcess（Windows）
- \`kill()\`：发 SIGKILL（Unix）/ 强制终止（Windows）
- \`send_signal(sig)\`：发任意信号

### 管道串联

用 \`Popen\` 可以把多个命令的管道串联起来（类似 shell 的 \`|\`）：

\`\`\`python
# 等价于：echo "hello world" | tr a-z A-Z
p1 = subprocess.Popen(["echo", "hello world"], stdout=subprocess.PIPE, text=True)  # 将 subprocess.Popen(["echo", "hello world"], stdout=subprocess.PIPE, text=True) 赋给 p1
p2 = subprocess.Popen(["tr", "a-z", "A-Z"], stdin=p1.stdout, stdout=subprocess.PIPE, text=True)  # 将 subprocess.Popen(["tr", "a-z", "A-Z"], stdin=p1.stdout, stdout=subprocess.PIPE, text=True) 赋给 p2
p1.stdout.close()  # 让 p1 在写完后收到 SIGPIPE
output = p2.communicate()[0]       # 将 p2.communicate()[0] 赋给 output
print(output)  # HELLO WORLD
\`\`\`

### os.system 对比

\`os.system(cmd)\` 是最古老的方式，但它：
- 返回退出状态码（不是输出）
- 通过 shell 执行（有注入风险）
- 无法捕获输出

\`\`\`python
import os                          # 导入 os 模块
os.system("echo hello")  # 直接打印到终端，返回 0
# 不推荐，新代码用 subprocess.run
\`\`\`

### os.popen

\`os.popen(cmd)\` 返回一个文件对象，可读取输出：

\`\`\`python
output = os.popen("echo hello").read()  # 将 os.popen("echo hello").read() 赋给 output
print(output)  # hello
# 也不推荐，用 subprocess
\`\`\`

### platform 模块检测系统

\`platform\` 模块提供系统信息，编写跨平台代码时有用：

\`\`\`python
import platform                    # 导入 platform 模块
print(platform.system())    # Darwin / Linux / Windows
print(platform.platform())  # macOS-10.15-x86_64-i386-64bit
print(platform.machine())   # x86_64 / arm64
print(platform.python_version())  # 3.13.0
\`\`\`

\`\`\`python
# 跨平台：根据系统选命令
if platform.system() == "Windows": # 如果 platform.system() == "Windows" 成立
    cmd = ["cmd", "/c", "dir"]     # 创建列表并赋给 cmd
else:                              # 否则
    cmd = ["ls", "-la"]            # 创建列表并赋给 cmd
subprocess.run(cmd)                # 对 subprocess 调用 run 方法，参数 cmd
\`\`\`

### 实际案例

#### 案例 1：调用 git 获取版本

\`\`\`python
r = subprocess.run(                # 将 subprocess.run( 赋给 r
    ["git", "--version"], capture_output=True, text=True
)
print(r.stdout.strip())            # 输出 r.stdout.strip()
\`\`\`

#### 案例 2：调用 Python 子进程

\`\`\`python
import sys                         # 导入 sys 模块
r = subprocess.run(                # 将 subprocess.run( 赋给 r
    [sys.executable, "-c", "print(1 + 2)"],
    capture_output=True, text=True,  # 将 True, text=True, 赋给 capture_output
)
print(r.stdout)  # 3
\`\`\`

> 用 \`sys.executable\` 而非 \`"python"\`，确保用的是同一个解释器。

#### 案例 3：获取命令输出并处理

\`\`\`python
r = subprocess.run(["echo", "hello world"], capture_output=True, text=True)  # 将 subprocess.run(["echo", "hello world"], capture_output=True, text=True) 赋给 r
lines = r.stdout.strip().split("\\n")  # 将 r.stdout.strip().split("\\n") 赋给 lines
for line in lines:                 # 遍历 lines，每次取值赋给 line
    print("行:", line)              # 输出 "行:", line
\`\`\`

### 安全最佳实践

1. **永远优先用列表参数**（\`shell=False\`）
2. **不要用 shell=True 拼接用户输入**
3. **用 sys.executable 调用 Python**，而非硬编码 "python"
4. **设置 timeout**，防止子进程挂起
5. **用 check=True**，及时发现命令失败
6. **跨平台**：用 platform 检测，避免硬编码平台命令

### 本章小结

| 工具 | 用途 |
| --- | --- |
| run | 执行子进程（推荐） |
| Popen | 细粒度控制 |
| communicate | 交互并避免死锁 |
| call/check_call/check_output | 旧 API |
| env | 自定义环境变量 |
| cwd | 工作目录 |
| terminate/kill | 终止进程 |
| platform | 系统检测 |

核心：**用列表参数、避免 shell=True、设置 timeout、用 sys.executable**。下面代码完整演示。
`,
    code: `# ============================================================
# 第六章代码：子进程与系统交互演示
# ============================================================
# 涵盖：run、Popen、communicate、管道、env、cwd、terminate、
#       platform、安全演示、实际案例
# 注意：所有子进程命令均为安全演示，使用 sys.executable -c

import subprocess
import sys
import os
import platform
import time

print("=" * 60)
print("1. subprocess.run 基础")
print("=" * 60)

# 最基本的调用（用 sys.executable 安全调用 Python）
r = subprocess.run(
    [sys.executable, "-c", "print('hello from subprocess')"],
    capture_output=True, text=True,
)
print("  stdout:", r.stdout.strip())
print("  returncode:", r.returncode)
print("  args:", r.args)

# 字节模式 vs 文本模式
r_bytes = subprocess.run(
    [sys.executable, "-c", "print('hi')"],
    capture_output=True,
)
print("  字节模式类型:", type(r_bytes.stdout).__name__)

r_text = subprocess.run(
    [sys.executable, "-c", "print('hi')"],
    capture_output=True, text=True,
)
print("  文本模式类型:", type(r_text.stdout).__name__)

print()
print("=" * 60)
print("2. check=True 检查退出码")
print("=" * 60)

# 成功的命令
r = subprocess.run(
    [sys.executable, "-c", "print('ok')"],
    capture_output=True, text=True, check=True,
)
print("  成功命令通过 check")

# 失败的命令（sys.exit(1)）
try:
    subprocess.run(
        [sys.executable, "-c", "import sys; sys.exit(1)"],
        capture_output=True, text=True, check=True,
    )
except subprocess.CalledProcessError as e:
    print("  失败命令抛异常，退出码:", e.returncode)

print()
print("=" * 60)
print("3. timeout 超时控制")
print("=" * 60)

try:
    subprocess.run(
        [sys.executable, "-c", "import time; time.sleep(10)"],
        timeout=0.5,
    )
except subprocess.TimeoutExpired as e:
    print("  超时捕获:", e.timeout, "秒")

print()
print("=" * 60)
print("4. Popen 类与 communicate")
print("=" * 60)

# 基本 Popen
p = subprocess.Popen(
    [sys.executable, "-c", "print('from popen')"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
)
stdout, stderr = p.communicate()
print("  stdout:", stdout.strip())
print("  returncode:", p.returncode)

# 向 stdin 传数据
p = subprocess.Popen(
    [sys.executable, "-c", "x = input(); print('got:', x)"],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    text=True,
)
out, err = p.communicate(input="hello-stdin")
print("  交互结果:", out.strip())

print()
print("=" * 60)
print("5. stdin / stdout / stderr 管道控制")
print("=" * 60)

# DEVNULL 丢弃 stderr
p = subprocess.Popen(
    [sys.executable, "-c", "import sys; print('to stdout'); print('to stderr', file=sys.stderr)"],
    stdout=subprocess.PIPE,
    stderr=subprocess.DEVNULL,
    text=True,
)
out, _ = p.communicate()
print("  stdout:", out.strip())
print("  stderr 被丢弃")

# STDOUT 合并 stderr 到 stdout
p = subprocess.Popen(
    [sys.executable, "-c", "import sys; print('out'); print('err', file=sys.stderr)"],
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
)
out, _ = p.communicate()
print("  合并后输出:", out.strip().replace("\\n", " + "))

print()
print("=" * 60)
print("6. returncode 退出码")
print("=" * 60)

# 成功
r = subprocess.run([sys.executable, "-c", "pass"], capture_output=True)
print("  成功 returncode:", r.returncode)

# 不同退出码
for code in [0, 1, 42]:
    r = subprocess.run(
        [sys.executable, "-c", "import sys; sys.exit(%d)" % code],
        capture_output=True,
    )
    print("  sys.exit(%d) -> returncode:" % code, r.returncode)

print()
print("=" * 60)
print("7. call / check_call / check_output（旧 API）")
print("=" * 60)

# call：返回退出码
rc = subprocess.call([sys.executable, "-c", "print('call')"])
print("  call 返回:", rc)

# check_call：非 0 抛异常
subprocess.check_call([sys.executable, "-c", "print('check_call')"])
print("  check_call 通过")

# check_output：返回 stdout
out = subprocess.check_output(
    [sys.executable, "-c", "print('check_output')"], text=True,
)
print("  check_output 返回:", out.strip())

print()
print("=" * 60)
print("8. 环境变量 env")
print("=" * 60)

# 自定义环境变量
env = os.environ.copy()
env["MY_CUSTOM_VAR"] = "hello-env"

r = subprocess.run(
    [sys.executable, "-c", "import os; print(os.environ.get('MY_CUSTOM_VAR', '未设置'))"],
    capture_output=True, text=True, env=env,
)
print("  自定义 env 输出:", r.stdout.strip())

# 不传 env 时继承父进程
r = subprocess.run(
    [sys.executable, "-c", "import os; print('PATH' in os.environ)"],
    capture_output=True, text=True,
)
print("  继承父进程 PATH:", r.stdout.strip())

print()
print("=" * 60)
print("9. cwd 工作目录")
print("=" * 60)

import tempfile
with tempfile.TemporaryDirectory() as tmpdir:
    # 在临时目录创建一个文件
    test_file = os.path.join(tmpdir, "marker.txt")
    with open(test_file, "w") as f:
        f.write("marker")

    # 在 tmpdir 下执行
    r = subprocess.run(
        [sys.executable, "-c", "import os; print(os.listdir('.'))"],
        capture_output=True, text=True, cwd=tmpdir,
    )
    print("  在 %s 下执行:" % os.path.basename(tmpdir), r.stdout.strip())

print()
print("=" * 60)
print("10. terminate / kill 终止进程")
print("=" * 60)

# 启动一个长时间运行的子进程并终止
p = subprocess.Popen(
    [sys.executable, "-c", "import time; print('开始'); time.sleep(100)"],
    stdout=subprocess.PIPE, text=True,
)
time.sleep(0.1)
print("  子进程 PID:", p.pid, "存活:", p.poll() is None)
p.terminate()
try:
    p.wait(timeout=2)
except subprocess.TimeoutExpired:
    p.kill()
    p.wait()
print("  终止后 returncode:", p.returncode)
print("  (负数表示被信号终止)")

print()
print("=" * 60)
print("11. 管道串联（多个命令）")
print("=" * 60)

# 模拟：echo "hello world" | python 大写转换
p1 = subprocess.Popen(
    [sys.executable, "-c", "print('hello world')"],
    stdout=subprocess.PIPE, text=True,
)
p2 = subprocess.Popen(
    [sys.executable, "-c", "import sys; print(sys.stdin.read().upper(), end='')"],
    stdin=p1.stdout, stdout=subprocess.PIPE, text=True,
)
p1.stdout.close()
output = p2.communicate()[0]
p1.wait()
print("  管道串联结果:", output.strip())

print()
print("=" * 60)
print("12. os.system / os.popen 对比")
print("=" * 60)

# os.system：返回状态码，输出到终端
rc = os.system('%s -c "print(42)"' % sys.executable)
print("  os.system 返回码:", rc)

# os.popen：返回文件对象
output = os.popen('%s -c "print(99)"' % sys.executable).read()
print("  os.popen 输出:", output.strip())

# 推荐用 subprocess
r = subprocess.run(
    [sys.executable, "-c", "print('subprocess output')"],
    capture_output=True, text=True,
)
print("  subprocess 输出:", r.stdout.strip())

print()
print("=" * 60)
print("13. platform 模块检测系统")
print("=" * 60)

print("  system:", platform.system())
print("  platform:", platform.platform())
print("  machine:", platform.machine())
print("  processor:", platform.processor())
print("  python_version:", platform.python_version())
print("  python_implementation:", platform.python_implementation())

# 跨平台命令选择
sys_name = platform.system()
print("  当前系统:", sys_name)

print()
print("=" * 60)
print("14. 实战案例：调用 Python 子进程计算")
print("=" * 60)

# 让子进程计算并返回结果
r = subprocess.run(
    [sys.executable, "-c", "print(sum(range(101)))"],
    capture_output=True, text=True,
)
print("  1+2+...+100 =", r.stdout.strip())

# 传入更复杂的代码
code = """
import math
result = math.factorial(10)
print("10! =", result)
print("pi =", math.pi)
"""
r = subprocess.run(
    [sys.executable, "-c", code],
    capture_output=True, text=True,
)
print("  子进程输出:")
for line in r.stdout.strip().split("\\n"):
    print("    ", line)

print()
print("=" * 60)
print("15. 实战案例：批量执行命令并收集结果")
print("=" * 60)

# 并发执行多个子进程
from concurrent.futures import ThreadPoolExecutor, as_completed

def run_python_task(task_id, expr):
    r = subprocess.run(
        [sys.executable, "-c", "print(%s)" % expr],
        capture_output=True, text=True, timeout=5,
    )
    return (task_id, expr, r.stdout.strip(), r.returncode)

tasks = [
    (1, "2 ** 10"),
    (2, "sum(range(100))"),
    (3, "len('hello world')"),
    (4, "max(3, 7, 1)"),
    (5, "'A' * 5"),
]

t0 = time.time()
with ThreadPoolExecutor(max_workers=5) as executor:
    futures = [executor.submit(run_python_task, tid, expr) for tid, expr in tasks]
    for fut in as_completed(futures):
        tid, expr, out, rc = fut.result()
        print("  任务 %d: %s = %s (rc=%d)" % (tid, expr, out, rc))
t1 = time.time()
print("  并发执行耗时: %.3f 秒" % (t1 - t0))

print()
print("=" * 60)
print("16. 安全演示：列表参数 vs shell=True")
print("=" * 60)

# 安全：列表参数，恶意字符串只是个普通参数
malicious = "1; import os; os.remove('/nonexistent')"
r = subprocess.run(
    [sys.executable, "-c", "print(%r)" % malicious],
    capture_output=True, text=True,
)
print("  列表参数（安全）:", r.stdout.strip())
print("  returncode:", r.returncode)

# shell=True 的危险（演示，但不执行危险命令）
# 如果 filename = "x; rm -rf /"，shell=True 会执行 rm
# 这里只演示 shell=True 的行为，用安全命令
r = subprocess.run(
    '%s -c "print(777)"' % sys.executable,
    shell=True, capture_output=True, text=True,
)
print("  shell=True 输出:", r.stdout.strip())
print("  （实际项目应避免 shell=True + 用户输入拼接）")

print()
print("=" * 60)
print("全部子进程与系统交互演示完成！")
print("=" * 60)
`,
  },
];




