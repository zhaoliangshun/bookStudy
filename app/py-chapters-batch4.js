// =============================================================
// Python 交互式教程 —— 第四批章节（共 4 章 · 工程化篇）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. py-decorators  — 装饰器与生成器
//   2. py-iterators   — 迭代器与协程
//   3. py-stdlib      — 标准库精选
//   4. py-tooling     — 虚拟环境与包管理
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（统一为「工程化」）
//   content : Markdown 格式的详细讲解（文字量大，含大量示例）
//   code    : 可运行的 Python 代码（python3 直接执行，print 输出）
//
// 注意事项：
//   - 所有注释和讲解使用简体中文
//   - code 字段为纯 Python 代码，不含反引号与 ${ 字符
//   - asyncio / subprocess demo 均为安全演示，不调用危险系统命令
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：装饰器与生成器
  // =========================================================
  {
    id: "py-decorators",
    group: "工程化",
    icon: "🎨",
    title: "装饰器与生成器",
    content: `# 装饰器与生成器

装饰器（Decorator）和生成器（Generator）是 Python 中两个极具威力的特性。装饰器让你能「在不修改原函数的前提下，给函数增加新能力」，是 AOP（面向切面编程）思想在 Python 中的体现；生成器则让你能用「看起来像同步」的代码写出「惰性求值」的迭代逻辑，是处理大数据流、无限序列、协程的基础。

这两个特性乍看神奇，本质上都建立在 Python 的几个核心机制之上：**函数是一等公民**、**闭包**、**迭代器协议**。本章会从这些底层机制讲起，一步步揭开它们的神秘面纱。

---

## 一、装饰器基础

### 1.1 函数是一等公民

在 Python 中，函数和整数、字符串一样，是一种**对象**。这意味着函数可以：
- 被赋值给变量
- 作为参数传给另一个函数
- 作为另一个函数的返回值
- 被存进列表、字典等数据结构

这是装饰器能够存在的根本前提。来看一个最朴素的例子：

\`\`\`python
def greet(name):                   # 定义函数 greet，参数：name
    return "hello, " + name        # 返回 "hello, " + name

# 函数对象赋值给另一个变量
say = greet                        # 将 greet 赋给 say
print(say("world"))   # hello, world
print(greet("world")) # hello, world

# 函数对象可以放进容器
funcs = [greet, str.upper, len]    # 创建列表并赋给 funcs
print(funcs[0]("abc"))  # hello, abc
\`\`\`

关键认知：当你在函数名后加括号 \`greet("world")\`，是「调用函数」；当你只写函数名 \`greet\`，是「拿到函数对象本身」。Python 里这两件事是分开的。

### 1.2 函数可以被「传来传去」

把函数当参数传，是高阶函数的基础：

\`\`\`python
def apply(func, value):            # 定义函数 apply，参数：func, value
    """把 func 应用到 value 上"""
    return func(value)             # 返回 func(value)

print(apply(len, "hello"))       # 5
print(apply(str.upper, "abc"))   # ABC
print(apply(lambda x: x * 2, 5)) # 10
\`\`\`

把函数当返回值，是闭包和装饰器的基础：

\`\`\`python
def make_adder(n):                 # 定义函数 make_adder，参数：n
    def adder(x):                  # 定义函数 adder，参数：x
        return x + n               # 返回 x + n
    return adder   # 返回的是函数对象，没调用它

add5 = make_adder(5)               # 将 make_adder(5) 赋给 add5
add10 = make_adder(10)             # 将 make_adder(10) 赋给 add10
print(add5(3))   # 8
print(add10(3))  # 13
\`\`\`

\`make_adder\` 返回的 \`adder\` 函数「记住」了创建它时的 \`n\`，这种能力叫**闭包**。

### 1.3 闭包：函数记住了它出生时的环境

**闭包（Closure）** 的定义：一个内部函数引用了它外层函数的局部变量，即使外层函数已经执行完毕返回了，内部函数依然能访问这些变量。

\`\`\`python
def make_counter():                # 定义函数 make_counter，无参数
    count = 0           # 外层函数的局部变量
    def inner():                   # 定义函数 inner，无参数
        nonlocal count  # 声明要修改外层的 count
        count += 1                 # count 加 1
        return count               # 返回 count
    return inner                   # 返回 inner

c = make_counter()                 # 将 make_counter() 赋给 c
print(c())  # 1
print(c())  # 2
print(c())  # 3
# 每次 c() 都在累加，因为 count 被 inner「捕获」了
\`\`\`

这里的关键字 \`nonlocal\` 声明「我要修改的是外层函数的 \`count\`，不是新建一个局部变量」。如果不写 \`nonlocal\`，\`count += 1\` 会报 \`UnboundLocalError\`，因为 Python 把 \`count\` 当成局部变量了。

闭包的三要素：
1. 有嵌套函数（外层 + 内层）
2. 内层函数引用了外层的变量
3. 外层函数返回内层函数对象

闭包是装饰器的「内存基础」——装饰器返回的 wrapper 函数就是一个闭包，它捕获了被装饰的原函数 \`func\`。

---

## 二、@ 语法糖与装饰器本质

### 2.1 手写一个最朴素的装饰器

不使用任何语法糖，纯手工实现「在函数前后加日志」：

\`\`\`python
def log(func):                     # 定义函数 log，参数：func
    def wrapper(*args, **kwargs):  # 定义函数 wrapper，参数：*args, **kwargs
        print("调用前:", func.__name__)  # 输出 "调用前:", func.__name__
        result = func(*args, **kwargs)  # 将 func(*args, **kwargs) 赋给 result
        print("调用后:", func.__name__)  # 输出 "调用后:", func.__name__
        return result              # 返回 result
    return wrapper                 # 返回 wrapper

def hello(name):                   # 定义函数 hello，参数：name
    return "hello, " + name        # 返回 "hello, " + name

hello = log(hello)   # 手工装饰：把 hello 换成 log 返回的 wrapper
print(hello("tom"))                # 输出 hello("tom")
# 输出：
# 调用前: hello
# 调用后: hello
# hello, tom
\`\`\`

注意 \`hello = log(hello)\` 这一行：它把原来的 \`hello\` 函数对象传给 \`log\`，\`log\` 返回了一个新的 \`wrapper\` 函数，再把这个新函数赋值回 \`hello\` 这个名字。从此以后调用 \`hello("tom")\` 实际调用的是 \`wrapper("tom")\`，而 \`wrapper\` 内部又调用了真正的 \`func("tom")\`。

这就是装饰器的全部本质：**用一个函数包装另一个函数，再把包装后的函数替换原函数**。

### 2.2 @ 语法糖

\`@decorator\` 只是上面 \`func = decorator(func)\` 的语法糖：

\`\`\`python
@log
def hello(name):                   # 定义函数 hello，参数：name
    return "hello, " + name        # 返回 "hello, " + name

# 等价于：
# def hello(name): ...
# hello = log(hello)
\`\`\`

\`@\` 让装饰器的应用「声明式」地写在函数定义上方，可读性更好，也避免了忘记写 \`hello = log(hello)\` 的风险。

### 2.3 functools.wraps：保留原函数信息

被装饰后，\`hello.__name__\` 会变成 \`"wrapper"\`，\`hello.__doc__\` 也会丢失。这是因为现在 \`hello\` 确实是 \`wrapper\` 函数。这会破坏文档生成、调试、反射等场景。

\`functools.wraps\` 装饰器的作用就是把原函数的 \`__name__\`、\`__doc__\`、\`__module__\`、\`__qualname__\` 等元信息复制到 wrapper 上：

\`\`\`python
import functools                   # 导入 functools 模块

def log(func):                     # 定义函数 log，参数：func
    @functools.wraps(func)   # 把 func 的元信息复制到 wrapper
    def wrapper(*args, **kwargs):  # 定义函数 wrapper，参数：*args, **kwargs
        print("调用前:", func.__name__)  # 输出 "调用前:", func.__name__
        result = func(*args, **kwargs)  # 将 func(*args, **kwargs) 赋给 result
        print("调用后:", func.__name__)  # 输出 "调用后:", func.__name__
        return result              # 返回 result
    return wrapper                 # 返回 wrapper

@log
def hello(name):                   # 定义函数 hello，参数：name
    """say hello to someone"""
    return "hello, " + name        # 返回 "hello, " + name

print(hello.__name__)  # hello（不是 wrapper）
print(hello.__doc__)   # say hello to someone
\`\`\`

**最佳实践**：写装饰器时，永远在 wrapper 上加 \`@functools.wraps(func)\`，养成肌肉记忆。

---

## 三、带参数的装饰器

### 3.1 三层嵌套结构

有时候我们希望装饰器本身能接收参数，比如「重复调用 N 次」「指定日志级别」。这时需要再包一层：

\`\`\`python
import functools                   # 导入 functools 模块

def repeat(times):                 # 定义函数 repeat，参数：times
    """带参数的装饰器：让函数重复执行 times 次"""
    def decorator(func):           # 定义函数 decorator，参数：func
        @functools.wraps(func)
        def wrapper(*args, **kwargs):  # 定义函数 wrapper，参数：*args, **kwargs
            result = None          # 将 None 赋给 result
            for _ in range(times): # 遍历 range(times)，每次取值赋给 _
                result = func(*args, **kwargs)  # 将 func(*args, **kwargs) 赋给 result
            return result          # 返回 result
        return wrapper             # 返回 wrapper
    return decorator               # 返回 decorator

@repeat_decorator(3)
def say(name):                     # 定义函数 say，参数：name
    print("hi,", name)             # 输出 "hi,", name

say("tom")                         # 调用 say，参数 "tom"
# hi, tom
# hi, tom
# hi, tom
\`\`\`

理解这个三层结构：
- \`repeat(3)\` 先被调用，返回 \`decorator\`（一个真正的装饰器函数）
- \`decorator(say)\` 被调用，返回 \`wrapper\`
- \`say\` 最终指向 \`wrapper\`

所以 \`@repeat(3)\` 等价于 \`say = repeat(3)(say)\`。最外层的 \`repeat\` 是「装饰器工厂」，它生产出真正的装饰器。

### 3.2 带参数装饰器的常见用途

- **日志装饰器**：指定 level（INFO/DEBUG/ERROR）
- **重试装饰器**：指定重试次数和间隔
- **权限装饰器**：指定需要的角色
- **缓存装饰器**：指定缓存大小、过期时间

\`\`\`python
import functools                   # 导入 functools 模块
import random                      # 导入 random 模块
import time                        # 导入 time 模块

def retry(times=3, delay=0.1):     # 定义函数 retry，参数：times=3, delay=0.1
    """失败自动重试"""
    def decorator(func):           # 定义函数 decorator，参数：func
        @functools.wraps(func)
        def wrapper(*args, **kwargs):  # 定义函数 wrapper，参数：*args, **kwargs
            last_exc = None        # 将 None 赋给 last_exc
            for i in range(times): # 遍历 range(times)，每次取值赋给 i
                try:               # 尝试执行以下代码块
                    return func(*args, **kwargs)  # 返回 func(*args, **kwargs)
                except Exception as e:  # 捕获 Exception 异常并绑定到 e
                    last_exc = e   # 将 e 赋给 last_exc
                    print("第 %d 次失败: %s" % (i + 1, e))  # 输出 "第 %d 次失败: %s" % (i + 1, e)
                    time.sleep(delay)  # 对 time 调用 sleep 方法，参数 delay
            raise last_exc         # 抛出异常：last_exc
        return wrapper             # 返回 wrapper
    return decorator               # 返回 decorator

@retry(times=3, delay=0.01)
def flaky():                       # 定义函数 flaky，无参数
    if random.random() < 0.7:      # 如果 random.random() < 0.7 成立
        raise RuntimeError("随机失败") # 抛出异常：RuntimeError("随机失败")
    return "success"               # 返回 "success"

# 多半会重试几次后成功（也可能 3 次都失败抛异常）
try:                               # 尝试执行以下代码块
    print(flaky())                 # 输出 flaky()
except RuntimeError as e:          # 捕获 RuntimeError 异常并绑定到 e
    print("最终失败:", e)              # 输出 "最终失败:", e
\`\`\`

---

## 四、类装饰器

### 4.1 用类来装饰函数

类只要实现 \`__call__\` 方法，它的实例就是「可调用对象」，可以当装饰器用：

\`\`\`python
import functools                   # 导入 functools 模块

class CallCount:                   # 定义类 CallCount
    """统计函数被调用了多少次"""
    def __init__(self, func):      # 定义函数 __init__，参数：self, func
        self.func = func
        self.count = 0
        functools.update_wrapper(self, func)  # 等价于 @functools.wraps

    def __call__(self, *args, **kwargs):  # 定义函数 __call__，参数：self, *args, **kwargs
        self.count += 1
        print("第 %d 次调用 %s" % (self.count, self.func.__name__))  # 输出 "第 %d 次调用 %s" % (self.count, self.func.__name__)
        return self.func(*args, **kwargs)  # 返回 self.func(*args, **kwargs)

@CallCount
def greet(name):                   # 定义函数 greet，参数：name
    return "hello, " + name        # 返回 "hello, " + name

greet("a")                         # 调用 greet，参数 "a"
greet("b")                         # 调用 greet，参数 "b"
greet("c")                         # 调用 greet，参数 "c"
# 输出：
# 第 1 次调用 greet
# 第 2 次调用 greet
# 第 3 次调用 greet
\`\`\`

类装饰器的优势：可以用实例属性保存状态（\`self.count\`），比闭包更直观。

### 4.2 装饰器装饰类

装饰器不仅能装饰函数，还能装饰类。常见用途：给类自动添加方法、注册类、给类加 mixin：

\`\`\`python
def add_repr(cls):                 # 定义函数 add_repr，参数：cls
    """给类自动加一个 __repr__ 方法"""
    def __repr__(self):            # 定义函数 __repr__，参数：self
        attrs = ", ".join("%s=%r" % (k, v) for k, v in self.__dict__.items())  # 将字符串 ", ".join("%s=%r" % (k, v) for k, v in self.__dict__.items()) 赋给 attrs
        return "%s(%s)" % (cls.__name__, attrs)  # 返回 "%s(%s)" % (cls.__name__, attrs)
    cls.__repr__ = __repr__
    return cls                     # 返回 cls

@add_repr
class Point:                       # 定义类 Point
    def __init__(self, x, y):      # 定义函数 __init__，参数：self, x, y
        self.x = x
        self.y = y

p = Point(1, 2)                    # 将 Point(1, 2) 赋给 p
print(p)  # Point(x=1, y=2)
\`\`\`

---

## 五、常用内置装饰器

### 5.1 property：把方法变成属性

\`@property\` 把一个 getter 方法变成「像属性一样访问」：

\`\`\`python
class Circle:                      # 定义类 Circle
    def __init__(self, radius):    # 定义函数 __init__，参数：self, radius
        self._radius = radius   # 约定：下划线开头表示「私有」

    @property
    def radius(self):              # 定义函数 radius，参数：self
        return self._radius        # 返回 self._radius

    @radius.setter
    def radius(self, value):       # 定义函数 radius，参数：self, value
        if value <= 0:             # 如果 value <= 0 成立
            raise ValueError("半径必须为正")  # 抛出异常：ValueError("半径必须为正")
        self._radius = value

    @property
    def area(self):                # 定义函数 area，参数：self
        return 3.14159 * self._radius ** 2  # 返回 3.14159 * self._radius ** 2

c = Circle(5)                      # 将 Circle(5) 赋给 c
print(c.radius)   # 5 —— 像属性一样访问，实际调用了 getter
print(c.area)     # 78.5...
c.radius = 10     # 触发 setter
# c.radius = -1   # 抛 ValueError
\`\`\`

\`@property\` 的好处：把「直接访问字段」和「通过方法访问」统一成一个接口，未来想加校验逻辑，不用改调用方代码。

### 5.2 classmethod 与 staticmethod

\`\`\`python
class Date:                        # 定义类 Date
    def __init__(self, year, month, day):  # 定义函数 __init__，参数：self, year, month, day
        self.year = year
        self.month = month
        self.day = day

    @classmethod
    def from_string(cls, s):       # 定义函数 from_string，参数：cls, s
        """替代构造器：从 '2024-01-01' 这种字符串构造"""
        year, month, day = map(int, s.split("-"))
        return cls(year, month, day)   # cls 是当前类

    @staticmethod
    def is_leap(year):             # 定义函数 is_leap，参数：year
        """静态方法：不依赖实例也不依赖类，只是逻辑上属于这个类"""
        return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)  # 返回 year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)

d = Date.from_string("2024-01-15") # 将 Date.from_string("2024-01-15") 赋给 d
print(d.year, d.month, d.day)   # 2024 1 15
print(Date.is_leap(2024))       # True
print(Date.is_leap(2100))       # False
\`\`\`

区别：
- \`classmethod\`：第一个参数是类本身（\`cls\`），常用于「替代构造器」
- \`staticmethod\`：没有隐式的 \`self\` 或 \`cls\`，就是个普通函数，只是放在类的命名空间里

### 5.3 lru_cache：自动记忆化

\`functools.lru_cache\` 把函数的调用结果缓存起来，相同参数下次直接返回缓存：

\`\`\`python
import functools                   # 导入 functools 模块

@functools.lru_cache(maxsize=128)
def fib(n):                        # 定义函数 fib，参数：n
    if n < 2:                      # 如果 n < 2 成立
        return n                   # 返回 n
    return fib(n - 1) + fib(n - 2) # 返回 fib(n - 1) + fib(n - 2)

print(fib(100))   # 瞬间算出，因为缓存了子问题

# 查看缓存统计
print(fib.cache_info())            # 输出 fib.cache_info()
# CacheInfo(hits=98, misses=101, maxsize=128, currsize=101)
\`\`\`

\`maxsize\` 是缓存上限（LRU 淘汰最近最少使用的）。注意：被 \`lru_cache\` 装饰的函数参数必须**可哈希**（列表、字典等不可变参不行）。

---

## 六、生成器入门

### 6.1 yield：让函数「暂停」

普通函数遇到 \`return\` 返回一个值就结束了。生成器函数用 \`yield\` 关键字，遇到 \`yield\` 会「暂停」并产出一个值，下次被调用时从上次暂停的地方继续：

\`\`\`python
def count_up_to(n):                # 定义函数 count_up_to，参数：n
    i = 1                          # 将整数 1 赋给 i
    while i <= n:                  # 当 i <= n 为真时重复执行
        yield i      # 产出 i 并暂停
        i += 1       # 下次从这里继续

gen = count_up_to(3)               # 将 count_up_to(3) 赋给 gen
print(next(gen))  # 1
print(next(gen))  # 2
print(next(gen))  # 3
print(next(gen))  # 抛 StopIteration
\`\`\`

关键点：
- 含 \`yield\` 的函数叫**生成器函数**，调用它不会执行函数体，而是返回一个「生成器对象」
- \`next(gen)\` 让函数执行到下一个 \`yield\` 处暂停，并返回 yield 后的值
- 函数执行完毕（自然结束或 return）时抛 \`StopIteration\`

### 6.2 生成器是惰性的

生成器不会一次性把所有值算出来，而是「要一个给一个」。这对处理大序列极其友好：

\`\`\`python
import sys                         # 导入 sys 模块

# 列表：一次性生成 1000 万个数，占大量内存
big_list = [x for x in range(10000000)]  # 创建列表并赋给 big_list
print(sys.getsizeof(big_list))   # ~80MB

# 生成器：几乎不占内存，只是个「配方」
big_gen = (x for x in range(10000000))  # 创建元组并赋给 big_gen
print(sys.getsizeof(big_gen))    # ~200 字节，固定大小
\`\`\`

### 6.3 生成器表达式

把列表推导式的 \`[]\` 换成 \`()\`，就得到生成器表达式：

\`\`\`python
squares_list = [x * x for x in range(10)]      # 立即算出全部
squares_gen  = (x * x for x in range(10))      # 惰性

print(squares_gen)        # <generator object ...>
print(next(squares_gen))  # 0
print(next(squares_gen))  # 1

# 生成器表达式可以直接喂给 sum/max/any 等
print(sum(x * x for x in range(10)))  # 285
\`\`\`

生成器表达式非常适合「流水线」式处理：\`sum(x for x in data if x > 0)\` 这种写法不会创建中间列表。

---

## 七、生成器的高级用法

### 7.1 send：向生成器里送值

\`next(gen)\` 是「取一个值」，\`gen.send(value)\` 是「送一个值进去并取一个值出来」。这让生成器变成了**协程**的雏形：

\`\`\`python
def echo():                        # 定义函数 echo，无参数
    while True:                    # 当 True 为真时重复执行
        received = yield   # yield 表达式的值 = send 进来的东西
        print("收到:", received)     # 输出 "收到:", received

gen = echo()                       # 将 echo() 赋给 gen
next(gen)            # 必须「启动」生成器，让它运行到第一个 yield
gen.send("hello")    # 收到: hello
gen.send("world")    # 收到: world
\`\`\`

第一次必须用 \`next(gen)\` 或 \`gen.send(None)\`「启动」生成器，让它执行到第一个 \`yield\` 处暂停，之后才能 \`send\` 真实值。

### 7.2 throw 与 close

- \`gen.throw(Exception)\`：在当前 yield 处抛出异常
- \`gen.close()\`：关闭生成器，内部抛出 \`GeneratorExit\`

\`\`\`python
def safe_gen():                    # 定义函数 safe_gen，无参数
    try:                           # 尝试执行以下代码块
        while True:                # 当 True 为真时重复执行
            x = yield              # 将 yield 赋给 x
            print("处理:", x)        # 输出 "处理:", x
    except ValueError as e:        # 捕获 ValueError 异常并绑定到 e
        print("被外部 throw 了:", e)   # 输出 "被外部 throw 了:", e
    finally:                       # 无论是否异常都执行
        print("生成器关闭")             # 输出 "生成器关闭"

g = safe_gen()                     # 将 safe_gen() 赋给 g
next(g)                            # 调用 next，参数 g
g.send("a")              # 处理: a
g.throw(ValueError("bad"))  # 被外部 throw 了: bad / 生成器关闭
\`\`\`

### 7.3 yield from：委托给子生成器

\`yield from\` 让一个生成器把「产出值」的工作委托给另一个生成器（或任何可迭代对象）：

\`\`\`python
def inner():                       # 定义函数 inner，无参数
    yield 1                        # 产出值 1（生成器）
    yield 2                        # 产出值 2（生成器）
    yield 3                        # 产出值 3（生成器）

def outer():                       # 定义函数 outer，无参数
    yield 0                        # 产出值 0（生成器）
    yield from inner()    # 等价于 for x in inner(): yield x
    yield 4                        # 产出值 4（生成器）

print(list(outer()))  # [0, 1, 2, 3, 4]
\`\`\`

\`yield from\` 还会透明地传递 \`send\` 和 \`throw\`，是协程组合的基础（在 \`async/await\` 出现前，协程就是靠 \`yield from\` 实现的）。

---

## 八、itertools 常用工具

\`itertools\` 是处理迭代器的「瑞士军刀」，全部惰性求值。

### 8.1 无限序列

\`\`\`python
from itertools import count, cycle, repeat  # 从 itertools 导入 count, cycle, repeat

# count(10): 10, 11, 12, ... 无限
for i in count(10):                # 遍历 count(10)，每次取值赋给 i
    if i > 13: break
    print(i)   # 10 11 12 13

# cycle("AB"): A B A B ... 无限循环
result = []                        # 创建列表并赋给 result
for i, c in enumerate(cycle("AB")):  # 遍历 enumerate(cycle("AB"))，每次取值赋给 i, c
    if i >= 5: break
    result.append(c)               # 对 result 调用 追加 方法，参数 c
print(result)  # ['A', 'B', 'A', 'B', 'A']

# repeat(7, 3): 7 7 7（重复 3 次）
print(list(repeat(7, 3)))  # [7, 7, 7]
\`\`\`

### 8.2 组合与拼接

\`\`\`python
from itertools import chain, islice, groupby  # 从 itertools 导入 chain, islice, groupby

# chain: 把多个可迭代对象拼起来
print(list(chain([1, 2], [3, 4], [5])))  # [1, 2, 3, 4, 5]

# islice: 切片（对任何可迭代对象）
print(list(islice(count(10), 5)))  # [10, 11, 12, 13, 14]
print(list(islice(range(100), 2, 8, 2)))  # [2, 4, 6]

# groupby: 按 key 分组（必须先排序）
data = [("a", 1), ("a", 2), ("b", 3), ("b", 4)]  # 创建列表并赋给 data
for key, group in groupby(data, key=lambda x: x[0]):  # 遍历 groupby(data, key=lambda x: x[0])，每次取值赋给 key, group
    print(key, list(group))        # 输出 key, list(group)
# a [('a', 1), ('a', 2)]
# b [('b', 3), ('b', 4)]
\`\`\`

注意 \`groupby\` 只对**相邻**的相同 key 分组，所以数据要先按 key 排好序。

### 8.3 实战：用生成器实现惰性流水线

\`\`\`python
def read_numbers():                # 定义函数 read_numbers，无参数
    """模拟读取一个大数据源"""
    for i in range(100):           # 遍历 range(100)，每次取值赋给 i
        yield i                    # 产出值 i（生成器）

def filter_even(source):           # 定义函数 filter_even，参数：source
    """过滤偶数"""
    for x in source:               # 遍历 source，每次取值赋给 x
        if x % 2 == 0:             # 如果 x % 2 == 0 成立
            yield x                # 产出值 x（生成器）

def square(source):                # 定义函数 square，参数：source
    """平方"""
    for x in source:               # 遍历 source，每次取值赋给 x
        yield x * x                # 产出值 x * x（生成器）

def take(source, n):               # 定义函数 take，参数：source, n
    """只取前 n 个"""
    for i, x in enumerate(source): # 遍历 enumerate(source)，每次取值赋给 i, x
        if i >= n:                 # 如果 i >= n 成立
            return                 # 返回 None（默认）
        yield x                    # 产出值 x（生成器）

# 流水线：读 -> 过滤偶 -> 平方 -> 取前 5 个
pipeline = take(square(filter_even(read_numbers())), 5)  # 将 take(square(filter_even(read_numbers())), 5) 赋给 pipeline
print(list(pipeline))  # [0, 4, 16, 36, 64]
\`\`\`

每一步都是惰性的，整个流水线在任何时刻内存里只持有少量数据。这种「数据流」式编程是处理大文件、流式数据的标准做法。

---

## 九、协程初步

生成器配合 \`send\` 已经具备了协程的雏形：「暂停—恢复—接收外部输入」。但用生成器写协程有诸多不便（启动顺序、异常传播、调度），所以 Python 3.5 引入了 \`async\`/\`await\` 语法，3.7 之后 \`asyncio\` 接口大幅简化。

\`\`\`python
import asyncio                     # 导入 asyncio 模块

async def fetch(name):             # 定义异步函数 fetch，参数：name
    print("开始获取", name)            # 输出 "开始获取", name
    await asyncio.sleep(0.1)   # 模拟 IO 等待
    print("完成获取", name)            # 输出 "完成获取", name
    return name + "_data"          # 返回 name + "_data"

async def main():                  # 定义异步函数 main
    # 并发执行三个协程
    results = await asyncio.gather(  # 将 await asyncio.gather( 赋给 results
        fetch("a"), fetch("b"), fetch("c")  # 调用 fetch，参数 "a"), fetch("b"), fetch("c"
    )
    print(results)                 # 输出 results

asyncio.run(main())                # 对 asyncio 调用 run 方法，参数 main()
\`\`\`

\`async def\` 定义协程函数，\`await\` 暂停当前协程把控制权交还事件循环。协程 vs 生成器：
- 协程用 \`async def\`/\`await\`，语义更清晰
- 协程由 \`asyncio\` 事件循环调度，不需要手动 \`next\`/\`send\`
- 协程天然适合 IO 密集型场景（网络请求、数据库）

下一章会深入迭代器与协程。

---

## 小结

- **装饰器**：本质是「函数包函数 + 替换原函数」，\`@\` 是语法糖，\`functools.wraps\` 保留元信息
- **带参装饰器**：三层嵌套，最外层是「装饰器工厂」
- **类装饰器**：实现 \`__call__\` 即可
- **生成器**：\`yield\` 让函数可暂停，惰性求值省内存
- **send/throw/close/yield from**：让生成器具备双向通信能力
- **itertools**：迭代器工具库，写惰性流水线的利器
- **协程**：生成器的进化版，用 \`async/await\` 配合 \`asyncio\` 处理并发

掌握装饰器和生成器，等于掌握了 Python 「元编程」和「流式处理」两把钥匙，后续无论是看 Web 框架源码、写爬虫、做数据分析，都会游刃有余。
`,
    code: `# ============================================================
# 第一章演示代码：装饰器与生成器
# 直接运行 python3 此文件即可看到全部输出
# ============================================================

import functools
import random
from itertools import count, cycle, repeat, chain, islice, groupby

# ------------------------------------------------------------
# 1. 函数是一等公民：可作为参数、返回值
# ------------------------------------------------------------
print("=" * 50)
print("1. 函数是一等公民")
print("=" * 50)

def apply(func, value):
    """把 func 应用到 value"""
    return func(value)

print(apply(len, "hello"))        # 5
print(apply(str.upper, "abc"))    # ABC
print(apply(lambda x: x * 2, 5))  # 10


# ------------------------------------------------------------
# 2. 闭包：内层函数记住外层变量
# ------------------------------------------------------------
print()
print("=" * 50)
print("2. 闭包")
print("=" * 50)

def make_adder(n):
    def adder(x):
        return x + n
    return adder

add5 = make_adder(5)
add10 = make_adder(10)
print("add5(3) =", add5(3))    # 8
print("add10(3) =", add10(3))  # 13


# ------------------------------------------------------------
# 3. 基础装饰器：用 functools.wraps 保留元信息
# ------------------------------------------------------------
print()
print("=" * 50)
print("3. 基础装饰器")
print("=" * 50)

def log(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print("  [log] 调用前:", func.__name__)
        result = func(*args, **kwargs)
        print("  [log] 调用后:", func.__name__)
        return result
    return wrapper

@log
def greet(name):
    """打招呼"""
    return "hello, " + name

print("greet('tom') =", greet("tom"))
print("greet.__name__ =", greet.__name__)
print("greet.__doc__ =", greet.__doc__)


# ------------------------------------------------------------
# 4. 带参数的装饰器：三层嵌套
# ------------------------------------------------------------
print()
print("=" * 50)
print("4. 带参数装饰器：repeat")
print("=" * 50)

def repeat_decorator(times):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            result = None
            for i in range(times):
                print("  第 %d 次执行" % (i + 1))
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat_decorator(3)
def say(name):
    print("  hi,", name)

say("tom")


# ------------------------------------------------------------
# 5. 类装饰器：用 __call__ 实现统计调用次数
# ------------------------------------------------------------
print()
print("=" * 50)
print("5. 类装饰器")
print("=" * 50)

class CallCount:
    def __init__(self, func):
        self.func = func
        self.count = 0
        functools.update_wrapper(self, func)

    def __call__(self, *args, **kwargs):
        self.count += 1
        print("  [第 %d 次调用]" % self.count)
        return self.func(*args, **kwargs)

@CallCount
def ping():
    return "pong"

print(ping())
print(ping())
print(ping())


# ------------------------------------------------------------
# 6. 内置装饰器：property / classmethod / staticmethod
# ------------------------------------------------------------
print()
print("=" * 50)
print("6. 内置装饰器")
print("=" * 50)

class Temperature:
    def __init__(self, celsius):
        self._celsius = celsius

    @property
    def celsius(self):
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError("低于绝对零度")
        self._celsius = value

    @property
    def fahrenheit(self):
        return self._celsius * 9 / 5 + 32

    @classmethod
    def from_fahrenheit(cls, f):
        return cls((f - 32) * 5 / 9)

    @staticmethod
    def is_freezing(c):
        return c <= 0

t = Temperature(25)
print("摄氏度:", t.celsius)
print("华氏度:", t.fahrenheit)
t.celsius = 30
print("修改后:", t.celsius)
t2 = Temperature.from_fahrenheit(98.6)
print("从华氏构造:", t2.celsius)
print("是否结冰:", Temperature.is_freezing(-5))


# ------------------------------------------------------------
# 7. lru_cache 缓存
# ------------------------------------------------------------
print()
print("=" * 50)
print("7. lru_cache 缓存")
print("=" * 50)

@functools.lru_cache(maxsize=128)
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print("fib(50) =", fib(50))
print("缓存信息:", fib.cache_info())


# ------------------------------------------------------------
# 8. 生成器函数：yield
# ------------------------------------------------------------
print()
print("=" * 50)
print("8. 生成器函数")
print("=" * 50)

def count_up_to(n):
    i = 1
    while i <= n:
        yield i
        i += 1

gen = count_up_to(3)
print("next:", next(gen))
print("next:", next(gen))
print("next:", next(gen))

# 用 for 遍历生成器
print("遍历:", list(count_up_to(5)))


# ------------------------------------------------------------
# 9. 生成器表达式 vs 列表推导
# ------------------------------------------------------------
print()
print("=" * 50)
print("9. 生成器表达式")
print("=" * 50)

import sys
big_list = [x for x in range(1000000)]
big_gen = (x for x in range(1000000))
print("列表大小:", sys.getsizeof(big_list), "字节")
print("生成器大小:", sys.getsizeof(big_gen), "字节")
print("sum:", sum(x * x for x in range(5)))


# ------------------------------------------------------------
# 10. send / throw / close
# ------------------------------------------------------------
print()
print("=" * 50)
print("10. 生成器 send")
print("=" * 50)

def accumulator():
    total = 0
    while True:
        x = yield total
        if x is None:
            break
        total += x

acc = accumulator()
next(acc)            # 启动，返回 0
print("send 10:", acc.send(10))   # 10
print("send 20:", acc.send(20))   # 30
print("send 5:", acc.send(5))     # 35


# ------------------------------------------------------------
# 11. yield from 委托
# ------------------------------------------------------------
print()
print("=" * 50)
print("11. yield from")
print("=" * 50)

def inner():
    yield 1
    yield 2
    yield 3

def outer():
    yield 0
    yield from inner()
    yield 4

print("结果:", list(outer()))


# ------------------------------------------------------------
# 12. itertools 工具集
# ------------------------------------------------------------
print()
print("=" * 50)
print("12. itertools")
print("=" * 50)

# count
print("count(10) 取前 5:", list(islice(count(10), 5)))

# cycle
result = []
for i, c in enumerate(cycle("AB")):
    if i >= 4:
        break
    result.append(c)
print("cycle 取前 4:", result)

# repeat
print("repeat(7, 3):", list(repeat(7, 3)))

# chain
print("chain:", list(chain([1, 2], [3, 4], [5])))

# groupby
data = [("a", 1), ("a", 2), ("b", 3), ("b", 4)]
for key, group in groupby(data, key=lambda x: x[0]):
    print("  分组:", key, list(group))


# ------------------------------------------------------------
# 13. 惰性流水线
# ------------------------------------------------------------
print()
print("=" * 50)
print("13. 惰性流水线")
print("=" * 50)

def read_numbers():
    for i in range(20):
        yield i

def filter_even(source):
    for x in source:
        if x % 2 == 0:
            yield x

def square(source):
    for x in source:
        yield x * x

def take(source, n):
    for i, x in enumerate(source):
        if i >= n:
            return
        yield x

pipeline = take(square(filter_even(read_numbers())), 5)
print("前 5 个偶数的平方:", list(pipeline))

print()
print("全部演示完成！")
`,
  },

  // =========================================================
  // 第二章：迭代器与协程
  // =========================================================
  {
    id: "py-iterators",
    group: "工程化",
    icon: "🔄",
    title: "迭代器与协程",
    content: `# 迭代器与协程

迭代器（Iterator）和协程（Coroutine）是 Python 中处理「数据流」和「并发」的两大基石。迭代器定义了「如何逐个取值」的统一协议，让 \`for\` 循环、生成器、列表、字典、文件等所有可迭代对象能用同一种方式遍历；协程则让 Python 能用「看起来像同步」的代码实现高效的异步 IO，是现代高并发网络编程的核心。

本章会从迭代器协议讲起，理解 \`for\` 循环的底层机制，再过渡到 \`async\`/\`await\` 异步编程。

---

## 一、迭代器协议

### 1.1 什么是迭代器

**迭代器（Iterator）** 是一个实现了两个特殊方法的对象：
- \`__iter__()\`：返回迭代器自身（让迭代器也能被 for 遍历）
- \`__next__()\`：返回下一个值；没有更多值时抛 \`StopIteration\`

这两个方法合称**迭代器协议（Iterator Protocol）**。任何实现了这两个方法的对象都是迭代器。

\`\`\`python
class MyIterator:                  # 定义类 MyIterator
    def __init__(self, data):      # 定义函数 __init__，参数：self, data
        self.data = data
        self.index = 0

    def __iter__(self):            # 定义函数 __iter__，参数：self
        return self   # 迭代器返回自己

    def __next__(self):            # 定义函数 __next__，参数：self
        if self.index >= len(self.data):  # 如果 self.index >= len(self.data) 成立
            raise StopIteration   # 没有了，告诉 for 循环该停了
        value = self.data[self.index]  # 将 self.data[self.index] 赋给 value
        self.index += 1
        return value               # 返回 value

it = MyIterator([10, 20, 30])      # 将 MyIterator([10, 20, 30]) 赋给 it
print(next(it))  # 10
print(next(it))  # 20
print(next(it))  # 30
# next(it)  # 抛 StopIteration
\`\`\`

### 1.2 for 循环的真相

当你写 \`for x in obj:\` 时，Python 实际做的事：

1. 调用 \`iter(obj)\`，也就是 \`obj.__iter__()\`，拿到一个迭代器
2. 反复调用 \`next(迭代器)\`，把返回值赋给 \`x\`
3. 直到抛出 \`StopIteration\`，循环结束

\`\`\`python
# for x in [1, 2, 3]:
#     print(x)
# 等价于：

it = iter([1, 2, 3])               # 将 iter([1, 2, 3]) 赋给 it
while True:                        # 当 True 为真时重复执行
    try:                           # 尝试执行以下代码块
        x = next(it)               # 将 next(it) 赋给 x
    except StopIteration:          # 捕获 StopIteration 异常
        break                      # 跳出循环
    print(x)                       # 输出 x
\`\`\`

理解了这一点，你就会明白：\`for\` 循环不关心 \`obj\` 是列表、字典、文件、生成器还是自定义对象，只要它「能产生迭代器」就行。

### 1.3 StopIteration 的作用

\`StopIteration\` 不是错误，而是「迭代结束」的信号。Python 内部捕获它来终止 \`for\` 循环。在手动用 \`next()\` 时，你需要自己处理：

\`\`\`python
it = iter([1, 2])                  # 将 iter([1, 2]) 赋给 it
print(next(it))          # 1
print(next(it))          # 2
# print(next(it))        # 抛 StopIteration

# 用默认值避免异常
it = iter([1, 2])                  # 将 iter([1, 2]) 赋给 it
print(next(it, "没了"))  # 1
print(next(it, "没了"))  # 2
print(next(it, "没了"))  # 没了
\`\`\`

\`next(it, default)\` 的第二个参数是「迭代器耗尽时返回的默认值」，加了它就不会抛异常了。

---

## 二、可迭代对象 vs 迭代器

### 2.1 两个概念的区别

这是最容易混淆的点：
- **可迭代对象（Iterable）**：实现了 \`__iter__()\` 方法（或 \`__getitem__\`），能返回一个迭代器。列表、字符串、字典都是可迭代对象。
- **迭代器（Iterator）**：实现了 \`__iter__\` + \`__next__\`，本身就是「能逐个取值的对象」。

用通俗的话说：可迭代对象是「一本书」，迭代器是「一枚书签」。书可以给你一枚书签，但书本身不是书签。

\`\`\`python
nums = [1, 2, 3]                   # 创建列表并赋给 nums
print(hasattr(nums, "__iter__"))    # True —— 列表是可迭代对象
print(hasattr(nums, "__next__"))    # False —— 列表本身不是迭代器

it = iter(nums)   # 拿到迭代器（书签）
print(hasattr(it, "__next__"))      # True —— 迭代器有 __next__
print(iter(it) is it)               # True —— 迭代器的 __iter__ 返回自己
\`\`\`

### 2.2 为什么列表不直接是迭代器

如果列表自己就是迭代器，那遍历一次之后就「耗尽」了，没法再次遍历。所以 Python 的设计是：**列表是可迭代对象，每次调 \`iter()\` 都生成一个全新的迭代器**。

\`\`\`python
nums = [1, 2, 3]                   # 创建列表并赋给 nums
it1 = iter(nums)                   # 将 iter(nums) 赋给 it1
it2 = iter(nums)                   # 将 iter(nums) 赋给 it2
print(it1 is it2)   # False —— 每次都是新迭代器
print(next(it1), next(it1))  # 1 2
print(next(it2))   # 1 —— it2 是独立的，从头开始
\`\`\`

而文件对象比较特殊：它**既是可迭代对象又是迭代器**，遍历一次就到末尾了，需要 \`seek(0)\` 回头。

### 2.3 自定义可迭代对象

让一个类同时实现 \`__iter__\`（每次返回新迭代器）：

\`\`\`python
class Range:                       # 定义类 Range
    """自定义的可迭代对象，类似 range"""
    def __init__(self, start, stop):  # 定义函数 __init__，参数：self, start, stop
        self.start = start
        self.stop = stop

    def __iter__(self):            # 定义函数 __iter__，参数：self
        # 每次调用都返回一个新迭代器
        return RangeIterator(self.start, self.stop)  # 返回 RangeIterator(self.start, self.stop)

class RangeIterator:               # 定义类 RangeIterator
    def __init__(self, start, stop):  # 定义函数 __init__，参数：self, start, stop
        self.current = start
        self.stop = stop

    def __iter__(self):            # 定义函数 __iter__，参数：self
        return self                # 返回 self

    def __next__(self):            # 定义函数 __next__，参数：self
        if self.current >= self.stop:  # 如果 self.current >= self.stop 成立
            raise StopIteration    # 抛出异常：StopIteration
        value = self.current       # 将 self.current 赋给 value
        self.current += 1
        return value               # 返回 value

r = Range(1, 4)                    # 将 Range(1, 4) 赋给 r
print(list(r))   # [1, 2, 3]
print(list(r))   # [1, 2, 3] —— 可重复遍历，因为每次 for 都新建迭代器
\`\`\`

这种「可迭代对象 + 独立迭代器」的分离设计，让一个对象可以被多次、甚至并发地遍历。

---

## 三、生成器就是迭代器

### 3.1 生成器自动实现了迭代器协议

上一章学过生成器函数（含 \`yield\`）。生成器对象**自动**实现了 \`__iter__\` 和 \`__next__\`，所以它就是迭代器：

\`\`\`python
def gen():                         # 定义函数 gen，无参数
    yield 1                        # 产出值 1（生成器）
    yield 2                        # 产出值 2（生成器）

g = gen()                          # 将 gen() 赋给 g
print(hasattr(g, "__iter__"))   # True
print(hasattr(g, "__next__"))   # True
print(iter(g) is g)             # True

# 所以生成器可以直接用 for
for x in gen():                    # 遍历 gen()，每次取值赋给 x
    print(x)                       # 输出 x
\`\`\`

这就是为什么生成器如此强大：你不用手写 \`__iter__\`/\`__next__\`/\`StopIteration\` 这套样板代码，只要写一个含 \`yield\` 的函数，Python 自动给你造出符合协议的迭代器。

### 3.2 生成器 vs 自定义迭代器

同样的「无限计数」功能，两种写法对比：

\`\`\`python
# 写法一：自定义迭代器类（啰嗦）
class Counter:                     # 定义类 Counter
    def __init__(self, start):     # 定义函数 __init__，参数：self, start
        self.cur = start
    def __iter__(self):            # 定义函数 __iter__，参数：self
        return self                # 返回 self
    def __next__(self):            # 定义函数 __next__，参数：self
        v = self.cur               # 将 self.cur 赋给 v
        self.cur += 1
        return v                   # 返回 v

# 写法二：生成器函数（简洁）
def counter(start):                # 定义函数 counter，参数：start
    cur = start                    # 将 start 赋给 cur
    while True:                    # 当 True 为真时重复执行
        yield cur                  # 产出值 cur（生成器）
        cur += 1                   # cur 加 1
\`\`\`

99% 的场景用生成器更清晰。只有在需要复杂状态管理、需要暴露多个方法时，才用类。

---

## 四、常见的迭代器陷阱

### 4.1 迭代器是一次性的

\`\`\`python
gen = (x * 2 for x in range(3))    # 创建元组并赋给 gen
print(list(gen))   # [0, 2, 4]
print(list(gen))   # [] —— 已经耗尽！
\`\`\`

生成器（以及 map、filter、zip 等返回的迭代器）只能遍历一次。要重复使用，要么转成 list，要么重新创建。

### 4.2 在迭代时修改容器

\`\`\`python
nums = [1, 2, 3, 4]                # 创建列表并赋给 nums
# for x in nums:
#     if x % 2 == 0:
#         nums.remove(x)   # 危险！会跳过元素
\`\`\`

迭代时修改正在迭代的容器，行为未定义（可能跳过元素、可能崩溃）。正确做法：先收集要删的，再统一删，或用推导式重建：

\`\`\`python
nums = [1, 2, 3, 4]                # 创建列表并赋给 nums
nums = [x for x in nums if x % 2 != 0]   # 重建
\`\`\`

### 4.3 zip 的「短板」效应

\`zip\` 在最短的可迭代对象耗尽时就停：

\`\`\`python
print(list(zip([1, 2, 3], ["a", "b"])))  # 输出 list(zip([1, 2, 3], ["a", "b"]))
# [(1, 'a'), (2, 'b')] —— 3 被丢了

# 要按最长对齐，用 itertools.zip_longest
from itertools import zip_longest  # 从 itertools 导入 zip_longest
print(list(zip_longest([1, 2, 3], ["a", "b"], fillvalue="?")))  # 输出 list(zip_longest([1, 2, 3], ["a", "b"], fillvalue="?"))
# [(1, 'a'), (2, 'b'), (3, '?')]
\`\`\`

---

## 五、协程与 async/await

### 5.1 为什么需要协程

CPU 速度极快，但 IO（磁盘、网络）很慢。一个网络请求可能要 100ms，期间 CPU 啥也不干就太浪费了。解决思路有：
- **多线程**：一个线程阻塞时切换到另一个。但 Python 有 GIL，CPU 密集型任务多线程收益有限，且线程切换有开销、有锁的问题。
- **协程**：在「单线程」内，当一个协程遇到 IO 等待时，主动让出 CPU 给另一个协程。切换是用户态的，极其轻量，可以轻松开几万个协程。

协程的本质是「可以暂停和恢复的函数」，由**事件循环（Event Loop）** 统一调度。

### 5.2 async def 与 await

\`async def\` 定义协程函数，调用它返回一个「协程对象」（不会立即执行）：

\`\`\`python
import asyncio                     # 导入 asyncio 模块

async def hello():                 # 定义异步函数 hello
    print("hello start")           # 输出 "hello start"
    await asyncio.sleep(0.1)   # await 暂停，把控制权交还事件循环
    print("hello end")             # 输出 "hello end"
    return "done"                  # 返回 "done"

# 直接调用 hello() 不会执行，只返回协程对象
coro = hello()                     # 将 hello() 赋给 coro
print(coro)  # <coroutine object hello at ...>

# 必须由事件循环来跑
asyncio.run(hello())               # 对 asyncio 调用 run 方法，参数 hello()
\`\`\`

\`await\` 只能在 \`async def\` 函数里用。它的语义是：「等这个可等待对象（awaitable）完成，等待期间把 CPU 让出去」。

### 5.3 asyncio.run：启动事件循环

\`asyncio.run(coro)\` 是 Python 3.7+ 启动 asyncio 程序的标准入口：
- 创建一个新的事件循环
- 跑传入的协程直到完成
- 关闭事件循环

一个程序里通常只调一次 \`asyncio.run\`，在最外层的 \`main()\` 协程里。

### 5.4 并发执行：asyncio.gather

\`await coro1; await coro2\` 是「串行」——等 coro1 完成再跑 coro2。\`asyncio.gather\` 是「并发」——同时启动多个协程，等它们全部完成：

\`\`\`python
import asyncio                     # 导入 asyncio 模块
import time                        # 导入 time 模块

async def task(name, seconds):     # 定义异步函数 task，参数：name, seconds
    print("开始", name)              # 输出 "开始", name
    await asyncio.sleep(seconds)
    print("完成", name)              # 输出 "完成", name
    return name                    # 返回 name

async def main():                  # 定义异步函数 main
    start = time.time()            # 将 time.time() 赋给 start
    # 三个任务各睡 0.1 秒，并发执行总共约 0.1 秒
    results = await asyncio.gather(  # 将 await asyncio.gather( 赋给 results
        task("A", 0.1),
        task("B", 0.1),
        task("C", 0.1),
    )
    print("结果:", results)          # 输出 "结果:", results
    print("耗时: %.2f 秒" % (time.time() - start))  # 输出 "耗时: %.2f 秒" % (time.time() - start)

asyncio.run(main())                # 对 asyncio 调用 run 方法，参数 main()
\`\`\`

输出会显示三个「开始」几乎同时打印，然后约 0.1 秒后三个「完成」一起打印，总耗时约 0.1 秒而不是 0.3 秒——这就是并发的威力。

### 5.5 asyncio.sleep vs time.sleep

- \`time.sleep(1)\`：阻塞整个线程，期间什么也干不了
- \`await asyncio.sleep(1)\`：只暂停当前协程，事件循环可以跑别的协程

这是异步编程的核心：**所有「等待」都必须是非阻塞的**。如果你在协程里写了 \`time.sleep\`、\`requests.get\`（同步 HTTP 库），就会阻塞整个事件循环，并发就失效了。

---

## 六、协程实战示例

### 6.1 并发「下载」多个 URL

（这里用模拟 IO，不真的发网络请求）

\`\`\`python
import asyncio                     # 导入 asyncio 模块
import random                      # 导入 random 模块

async def fetch(url):              # 定义异步函数 fetch，参数：url
    """模拟一个耗时的网络请求"""
    print("请求", url)               # 输出 "请求", url
    delay = random.uniform(0.1, 0.3)  # 将 random.uniform(0.1, 0.3) 赋给 delay
    await asyncio.sleep(delay)   # 模拟网络延迟
    print("完成", url, "耗时 %.2f" % delay)  # 输出 "完成", url, "耗时 %.2f" % delay
    return "内容 of " + url          # 返回 "内容 of " + url

async def main():                  # 定义异步函数 main
    urls = ["url1", "url2", "url3", "url4"]  # 创建列表并赋给 urls
    # 并发抓取
    results = await asyncio.gather(*[fetch(u) for u in urls])  # 将 await asyncio.gather(*[fetch(u) for u in urls]) 赋给 results
    print("全部结果:", results)        # 输出 "全部结果:", results

asyncio.run(main())                # 对 asyncio 调用 run 方法，参数 main()
\`\`\`

### 6.2 超时控制：asyncio.wait_for

\`\`\`python
import asyncio                     # 导入 asyncio 模块

async def slow():                  # 定义异步函数 slow
    await asyncio.sleep(10)
    return "finally"               # 返回 "finally"

async def main():                  # 定义异步函数 main
    try:                           # 尝试执行以下代码块
        # 最多等 0.2 秒
        result = await asyncio.wait_for(slow(), timeout=0.2)  # 将 await asyncio.wait_for(slow(), timeout=0.2) 赋给 result
        print(result)              # 输出 result
    except asyncio.TimeoutError:
        print("超时了！")              # 输出 "超时了！"

asyncio.run(main())                # 对 asyncio 调用 run 方法，参数 main()
\`\`\`

### 6.3 创建任务：asyncio.create_task

\`gather\` 适合「一批一起等」。如果想「先启动一个后台任务，过会儿再取结果」，用 \`create_task\`：

\`\`\`python
import asyncio                     # 导入 asyncio 模块

async def background_work():       # 定义异步函数 background_work
    print("后台任务开始")                # 输出 "后台任务开始"
    await asyncio.sleep(0.1)
    print("后台任务结束")                # 输出 "后台任务结束"
    return 42                      # 返回 42

async def main():                  # 定义异步函数 main
    # 启动后台任务（不立即 await）
    task = asyncio.create_task(background_work())  # 将 asyncio.create_task(background_work()) 赋给 task
    print("主任务做点别的")               # 输出 "主任务做点别的"
    await asyncio.sleep(0.05)
    print("主任务等后台结果")              # 输出 "主任务等后台结果"
    result = await task   # 等任务完成取结果
    print("后台结果:", result)         # 输出 "后台结果:", result

asyncio.run(main())                # 对 asyncio 调用 run 方法，参数 main()
\`\`\`

\`create_task\` 把协程「包装成 Task」立即交给事件循环调度，你可以晚点再 \`await\` 它。

---

## 七、协程与生成器的异同

协程（\`async def\`）和生成器（\`yield\`）都是「可暂停的函数」，但有几大区别：

| 维度 | 生成器 | 协程 |
|------|--------|------|
| 定义 | \`def\` + \`yield\` | \`async def\` + \`await\` |
| 暂停点 | \`yield\` | \`await\` |
| 驱动方式 | 手动 \`next\`/\`send\` | 事件循环自动调度 |
| 主要用途 | 迭代产出值 | 并发 IO |
| 通信方向 | 双向（yield 产出 + send 注入） | await 等待结果 |

历史脉络：Python 早期（2.5+）用 \`yield\` 实现协程（\`yield from\` + \`send\`），3.4 引入 \`asyncio\`，3.5 引入 \`async\`/\`await\` 语法糖，3.7+ \`asyncio.run\` 简化入口。现在写异步代码都用 \`async\`/\`await\`，\`yield\` 专做迭代。

---

## 八、何时用协程

协程**不是**银弹：
- **IO 密集型**（网络请求、数据库、文件读写）：协程大显身手，单机可扛几万并发
- **CPU 密集型**（数值计算、图像处理）：协程帮不上忙，应该用多进程（\`multiprocessing\`）绕开 GIL
- **简单脚本**：没必要上 asyncio，同步代码更直观

判断标准：你的程序是「大部分时间在等」还是「大部分时间在算」？在等——上协程；在算——上多进程。

---

## 小结

- **迭代器协议**：\`__iter__\` + \`__next__\` + \`StopIteration\`，是 \`for\` 循环的底层
- **可迭代对象 vs 迭代器**：前者是「书」，后者是「书签」；列表是前者，生成器是后者
- **生成器是迭代器**：自动实现协议，写法比自定义类简洁
- **迭代器是一次性的**：耗尽后无法重用，要重遍历得重建
- **协程**：\`async def\` + \`await\`，由事件循环调度，适合 IO 密集型并发
- **asyncio.run** 是入口，**gather** 并发批量，**create_task** 后台任务，**wait_for** 超时控制
- 协程里所有等待必须非阻塞（\`asyncio.sleep\` 而非 \`time.sleep\`）

掌握迭代器和协程，你就具备了处理「数据流」和「高并发 IO」的能力，为后续学 Web 框架（FastAPI/Sanic）、爬虫（aiohttp）、数据库异步驱动打下地基。
`,
    code: `# ============================================================
# 第二章演示代码：迭代器与协程
# 直接运行 python3 此文件即可看到全部输出
# ============================================================

import asyncio
import time
from itertools import zip_longest

# ------------------------------------------------------------
# 1. 自定义迭代器
# ------------------------------------------------------------
print("=" * 50)
print("1. 自定义迭代器")
print("=" * 50)

class MyIterator:
    def __init__(self, data):
        self.data = data
        self.index = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.index >= len(self.data):
            raise StopIteration
        value = self.data[self.index]
        self.index += 1
        return value

it = MyIterator([10, 20, 30])
for x in it:
    print("  ", x)


# ------------------------------------------------------------
# 2. for 循环的真相：手动 next
# ------------------------------------------------------------
print()
print("=" * 50)
print("2. for 循环的底层")
print("=" * 50)

seq = [1, 2, 3]
it = iter(seq)
while True:
    try:
        x = next(it)
        print("  取到:", x)
    except StopIteration:
        print("  迭代结束")
        break

# next 带默认值
it = iter([1, 2])
print("  next 默认:", next(it, None))
print("  next 默认:", next(it, None))
print("  next 默认:", next(it, None))


# ------------------------------------------------------------
# 3. 可迭代对象 vs 迭代器
# ------------------------------------------------------------
print()
print("=" * 50)
print("3. 可迭代对象 vs 迭代器")
print("=" * 50)

nums = [1, 2, 3]
print("  列表有 __iter__:", hasattr(nums, "__iter__"))
print("  列表有 __next__:", hasattr(nums, "__next__"))
it = iter(nums)
print("  迭代器有 __next__:", hasattr(it, "__next__"))
print("  iter(it) is it:", iter(it) is it)

# 多个独立迭代器
it1 = iter(nums)
it2 = iter(nums)
print("  it1 is it2:", it1 is it2)
print("  it1:", next(it1), next(it1))
print("  it2:", next(it2))   # 独立从头


# ------------------------------------------------------------
# 4. 自定义可迭代对象（可重复遍历）
# ------------------------------------------------------------
print()
print("=" * 50)
print("4. 可重复遍历的可迭代对象")
print("=" * 50)

class Range:
    def __init__(self, start, stop):
        self.start = start
        self.stop = stop

    def __iter__(self):
        cur = self.start
        while cur < self.stop:
            yield cur
            cur += 1

r = Range(1, 4)
print("  第一次:", list(r))
print("  第二次:", list(r))


# ------------------------------------------------------------
# 5. 生成器就是迭代器
# ------------------------------------------------------------
print()
print("=" * 50)
print("5. 生成器就是迭代器")
print("=" * 50)

def gen():
    yield 1
    yield 2

g = gen()
print("  __iter__:", hasattr(g, "__iter__"))
print("  __next__:", hasattr(g, "__next__"))
print("  iter(g) is g:", iter(g) is g)
print("  遍历:", list(g))


# ------------------------------------------------------------
# 6. 迭代器陷阱：一次性
# ------------------------------------------------------------
print()
print("=" * 50)
print("6. 迭代器陷阱")
print("=" * 50)

gen = (x * 2 for x in range(3))
print("  第一次:", list(gen))
print("  第二次:", list(gen), "(已耗尽)")

# zip 短板
print("  zip 短板:", list(zip([1, 2, 3], ["a", "b"])))
print("  zip_longest:", list(zip_longest([1, 2, 3], ["a", "b"], fillvalue="?")))


# ------------------------------------------------------------
# 7. 协程基础：async def / await
# ------------------------------------------------------------
print()
print("=" * 50)
print("7. 协程基础")
print("=" * 50)

async def hello():
    print("  hello start")
    await asyncio.sleep(0.01)
    print("  hello end")
    return "done"

result = asyncio.run(hello())
print("  返回:", result)


# ------------------------------------------------------------
# 8. 并发执行 gather
# ------------------------------------------------------------
print()
print("=" * 50)
print("8. 并发 gather")
print("=" * 50)

async def task(name, seconds):
    print("  开始", name)
    await asyncio.sleep(seconds)
    print("  完成", name)
    return name

async def main_gather():
    start = time.time()
    results = await asyncio.gather(
        task("A", 0.05),
        task("B", 0.05),
        task("C", 0.05),
    )
    print("  结果:", results)
    print("  耗时: %.3f 秒" % (time.time() - start))

asyncio.run(main_gather())


# ------------------------------------------------------------
# 9. 串行 vs 并发对比
# ------------------------------------------------------------
print()
print("=" * 50)
print("9. 串行 vs 并发")
print("=" * 50)

async def delay(n):
    await asyncio.sleep(0.05)
    return n

async def serial():
    start = time.time()
    await delay(1)
    await delay(2)
    await delay(3)
    print("  串行耗时: %.3f" % (time.time() - start))

async def concurrent():
    start = time.time()
    await asyncio.gather(delay(1), delay(2), delay(3))
    print("  并发耗时: %.3f" % (time.time() - start))

asyncio.run(serial())
asyncio.run(concurrent())


# ------------------------------------------------------------
# 10. 超时控制 wait_for
# ------------------------------------------------------------
print()
print("=" * 50)
print("10. 超时控制")
print("=" * 50)

async def slow_task():
    await asyncio.sleep(10)
    return "finally"

async def main_timeout():
    try:
        result = await asyncio.wait_for(slow_task(), timeout=0.05)
        print("  结果:", result)
    except asyncio.TimeoutError:
        print("  超时了！")

asyncio.run(main_timeout())


# ------------------------------------------------------------
# 11. create_task 后台任务
# ------------------------------------------------------------
print()
print("=" * 50)
print("11. create_task")
print("=" * 50)

async def background():
    print("  后台开始")
    await asyncio.sleep(0.01)
    print("  后台结束")
    return 42

async def main_task():
    task = asyncio.create_task(background())
    print("  主任务做别的")
    await asyncio.sleep(0.005)
    print("  主任务等结果")
    result = await task
    print("  后台结果:", result)

asyncio.run(main_task())


# ------------------------------------------------------------
# 12. 模拟并发抓取
# ------------------------------------------------------------
print()
print("=" * 50)
print("12. 模拟并发抓取")
print("=" * 50)

async def fetch(url):
    print("  请求", url)
    await asyncio.sleep(0.02)
    print("  完成", url)
    return "内容 of " + url

async def main_fetch():
    urls = ["url1", "url2", "url3"]
    results = await asyncio.gather(*[fetch(u) for u in urls])
    print("  全部结果:", results)

asyncio.run(main_fetch())

print()
print("全部演示完成！")
`,
  },

  // =========================================================
  // 第三章：标准库精选
  // =========================================================
  {
    id: "py-stdlib",
    group: "工程化",
    icon: "📚",
    title: "标准库精选",
    content: `# 标准库精选

Python 之所以被誉为「自带电池（batteries included）」，是因为它的标准库极其丰富——从操作系统接口、网络通信、数据序列化，到正则、日期、并发，几乎所有常见需求都能在标准库里找到趁手的工具，不用装任何第三方包。

本章精选工程开发中最常用的标准库模块，按功能分类讲解。学完这一章，你能解决 80% 的日常编程问题，不必动辄造轮子或引入第三方依赖。

---

## 一、os：操作系统接口

\`os\` 模块提供与操作系统交互的能力：文件路径、环境变量、进程等。

### 1.1 环境变量与进程

\`\`\`python
import os                          # 导入 os 模块

# 读取环境变量
print(os.environ.get("HOME", "/tmp"))   # 没有时用默认值
print(os.getenv("PATH"))           # 输出 os.getenv("PATH")

# 设置环境变量（仅当前进程及其子进程可见）
os.environ["MY_VAR"] = "hello"

# 当前进程 ID
print(os.getpid())                 # 输出 os.getpid()

# 当前工作目录
print(os.getcwd())                 # 输出 os.getcwd()
\`\`\`

### 1.2 路径操作（os.path）

\`\`\`python
import os.path                     # 导入 os.path 模块

p = "/home/user/docs/readme.md"    # 将字符串 "/home/user/docs/readme.md" 赋给 p
print(os.path.dirname(p))    # /home/user/docs —— 目录部分
print(os.path.basename(p))   # readme.md —— 文件名
print(os.path.splitext(p))   # ('/home/user/docs/readme', '.md') —— 拆扩展名
print(os.path.join("a", "b", "c.txt"))  # a/b/c.txt —— 跨平台拼接
print(os.path.exists(p))     # 是否存在
print(os.path.isfile(p))     # 是否是文件
print(os.path.isdir(p))      # 是否是目录
\`\`\`

现代代码更推荐用 \`pathlib\`（下面会讲），但 \`os.path\` 仍随处可见。

---

## 二、sys：解释器状态

\`sys\` 模块提供 Python 解释器本身的状态信息。

\`\`\`python
import sys                         # 导入 sys 模块

print(sys.version)          # Python 版本字符串
print(sys.version_info)     # 版本结构化信息（可比较）
print(sys.executable)       # 解释器可执行文件路径
print(sys.platform)         # 平台标识 darwin/linux/win32
print(sys.argv)             # 命令行参数列表，argv[0] 是脚本名
print(sys.path)             # 模块搜索路径
print(sys.maxsize)          # 最大整数
\`\`\`

\`sys.argv\` 在写命令行脚本时常用：

\`\`\`python
# script.py
import sys                         # 导入 sys 模块
if len(sys.argv) < 2:              # 如果 len(sys.argv) < 2 成立
    print("用法: python script.py <名字>")  # 输出 "用法: python script.py <名字>"
    sys.exit(1)                    # 对 sys 调用 exit 方法，参数 1
name = sys.argv[1]                 # 将 sys.argv[1] 赋给 name
print("你好,", name)                 # 输出 "你好,", name
\`\`\`

\`sys.exit(code)\` 退出程序，\`code=0\` 表示正常，非 0 表示出错。

---

## 三、math：数学函数

\`\`\`python
import math                        # 导入 math 模块

print(math.pi)          # 3.141592653589793
print(math.e)           # 2.718281828459045
print(math.sqrt(16))    # 4.0 —— 平方根
print(math.pow(2, 10))  # 1024.0 —— 幂
print(math.log(100, 10))# 2.0 —— 对数
print(math.log2(8))     # 3.0
print(math.ceil(3.2))   # 4 —— 向上取整
print(math.floor(3.8))  # 3 —— 向下取整
print(math.fabs(-5))    # 5.0 —— 绝对值
print(math.gcd(12, 18)) # 6 —— 最大公约数
print(math.factorial(5))# 120 —— 阶乘
\`\`\`

注意 \`math\` 处理的是浮点数。要处理大整数（任意精度）用 \`int\` 自带的运算；要处理复数用 \`cmath\` 或内置的 \`complex\` 类型。

---

## 四、random：随机数

\`\`\`python
import random                      # 导入 random 模块

random.seed(42)              # 设种子，让结果可复现

print(random.random())       # 0~1 浮点
print(random.randint(1, 100))# 1~100 整数（含两端）
print(random.randrange(0, 100, 5))  # 0~100 步长 5
print(random.choice([1,2,3]))# 从序列随机选一个
print(random.sample([1,2,3,4,5], 3))  # 不重复选 3 个
print(random.uniform(1.0, 5.0))       # 范围内浮点

lst = [1, 2, 3, 4, 5]              # 创建列表并赋给 lst
random.shuffle(lst)          # 原地打乱
print(lst)                         # 输出 lst
\`\`\`

**安全提醒**：\`random\` 模块生成的是「伪随机数」，不适合做密码、token。涉及安全用 \`secrets\` 模块：

\`\`\`python
import secrets                     # 导入 secrets 模块
print(secrets.token_hex(16))   # 32 位十六进制 token
print(secrets.choice("abcDEF123"))  # 安全随机选择
\`\`\`

---

## 五、datetime：日期与时间

\`\`\`python
from datetime import datetime, date, time, timedelta  # 从 datetime 导入 datetime, date, time, timedelta

# 当前时间
now = datetime.now()       # 本地时间
utc = datetime.utcnow()    # UTC 时间（旧 API，推荐 datetime.now(timezone.utc)）
print(now)                         # 输出 now

# 构造
d = date(2024, 1, 15)              # 将 date(2024, 1, 15) 赋给 d
t = time(14, 30, 0)                # 将 time(14, 30, 0) 赋给 t
dt = datetime(2024, 1, 15, 14, 30) # 将 datetime(2024, 1, 15, 14, 30) 赋给 dt
print(d, t, dt)                    # 输出 d, t, dt

# 字符串解析与格式化
s = dt.strftime("%Y-%m-%d %H:%M:%S")  # 格式化成字符串
print(s)   # 2024-01-15 14:30:00

parsed = datetime.strptime("2024-01-15", "%Y-%m-%d")  # 字符串解析
print(parsed)                      # 输出 parsed

# 时间差
delta = timedelta(days=7, hours=3) # 将 timedelta(days=7, hours=3) 赋给 delta
future = now + delta               # 将 now + delta 赋给 future
print(future)                      # 输出 future

# 两个日期相减得到 timedelta
diff = date(2024, 12, 31) - date(2024, 1, 1)  # 将 date(2024, 12, 31) - date(2024, 1, 1) 赋给 diff
print(diff.days)   # 365
\`\`\`

常用格式符：\`%Y\` 四位年、\`%m\` 月、\`%d\` 日、\`%H\` 时（24h）、\`%M\` 分、\`%S\` 秒、\`%A\` 星期名、\`%B\` 月名。

---

## 六、collections：高级容器

### 6.1 Counter：计数器

\`\`\`python
from collections import Counter    # 从 collections 导入 Counter

words = "the cat sat on the mat the cat".split()  # 将字符串 "the cat sat on the mat the cat".split() 赋给 words
c = Counter(words)                 # 将 Counter(words) 赋给 c
print(c)                # Counter({'the': 3, 'cat': 2, 'sat': 1, ...})
print(c["the"])         # 3 —— 不存在的键返回 0
print(c.most_common(2)) # [('the', 3), ('cat', 2)]

c.update(["dog", "cat"])           # 对 c 调用 更新 方法，参数 ["dog", "cat"]
print(c["cat"])   # 3
\`\`\`

### 6.2 defaultdict：带默认值的字典

普通 dict 访问不存在的键会 KeyError，\`defaultdict\` 会自动创建：

\`\`\`python
from collections import defaultdict  # 从 collections 导入 defaultdict

# 按首字母分组
words = ["apple", "ant", "banana", "berry", "cherry"]  # 创建列表并赋给 words
groups = defaultdict(list)         # 将 defaultdict(list) 赋给 groups
for w in words:                    # 遍历 words，每次取值赋给 w
    groups[w[0]].append(w)   # 不存在的键自动创建空 list
print(groups)                      # 输出 groups
# defaultdict(<class 'list'>, {'a': ['apple', 'ant'], 'b': ['banana', 'berry'], 'c': ['cherry']})

# 计数
count = defaultdict(int)           # 将 defaultdict(int) 赋给 count
for w in words:                    # 遍历 words，每次取值赋给 w
    count[w] += 1
\`\`\`

### 6.3 OrderedDict：有序字典

Python 3.7+ 普通 dict 已经保证插入顺序，所以 \`OrderedDict\` 用得少了。但它仍有独特功能：\`move_to_end\`、\`popitem\`：

\`\`\`python
from collections import OrderedDict  # 从 collections 导入 OrderedDict

od = OrderedDict()                 # 将 OrderedDict() 赋给 od
od["a"] = 1
od["b"] = 2
od["c"] = 3
od.move_to_end("a")   # 把 a 移到末尾
print(list(od.keys()))   # ['b', 'c', 'a']
\`\`\`

### 6.4 deque：双端队列

\`list\` 在头部插入/删除是 O(n)，\`deque\` 在两端都是 O(1)：

\`\`\`python
from collections import deque      # 从 collections 导入 deque

dq = deque([1, 2, 3])              # 将 deque([1, 2, 3]) 赋给 dq
dq.appendleft(0)      # 头部加
dq.append(4)          # 尾部加
print(dq)             # deque([0, 1, 2, 3, 4])

dq.popleft()          # 头部删
dq.pop()              # 尾部删

# 固定长度：超出自动丢弃旧的
recent = deque(maxlen=3)           # 将 deque(maxlen=3) 赋给 recent
for i in range(5):                 # 遍历 range(5)，每次取值赋给 i
    recent.append(i)               # 对 recent 调用 追加 方法，参数 i
print(recent)   # deque([2, 3, 4], maxlen=3)
\`\`\`

实现「最近 N 条记录」「滑动窗口」用 \`deque(maxlen=N)\` 极其优雅。

### 6.5 namedtuple：具名元组

普通元组只能用下标访问，\`namedtuple\` 给字段起名字：

\`\`\`python
from collections import namedtuple # 从 collections 导入 namedtuple

Point = namedtuple("Point", ["x", "y"])  # 将 namedtuple("Point", ["x", "y"]) 赋给 Point
p = Point(3, 4)                    # 将 Point(3, 4) 赋给 p
print(p.x, p.y)       # 3 4 —— 用名字访问
print(p[0], p[1])     # 3 4 —— 也能用下标
print(p._asdict())    # {'x': 3, 'y': 4} —— 转字典
\`\`\`

比 dict 省内存、不可变、可读性好。现代代码也可用 \`typing.NamedTuple\` 或 \`dataclass\`。

---

## 七、functools：函数工具

### 7.1 partial：偏函数

固定函数的部分参数，生成新函数：

\`\`\`python
from functools import partial      # 从 functools 导入 partial

def power(base, exp):              # 定义函数 power，参数：base, exp
    return base ** exp             # 返回 base ** exp

square = partial(power, exp=2)    # 固定 exp=2
cube = partial(power, exp=3)      # 固定 exp=3
print(square(5))   # 25
print(cube(2))     # 8

# 实战：把 int(x, 2) 包装成 bin2dec
bin2dec = partial(int, base=2)     # 将 partial(int, base=2) 赋给 bin2dec
print(bin2dec("1010"))   # 10
\`\`\`

### 7.2 reduce：归约

把一个二元函数依次应用到序列上，最终合并成一个值：

\`\`\`python
from functools import reduce       # 从 functools 导入 reduce

nums = [1, 2, 3, 4, 5]             # 创建列表并赋给 nums
# 等价于 ((((1+2)+3)+4)+5)
total = reduce(lambda a, b: a + b, nums)  # 将 reduce(lambda a, b: a + b, nums) 赋给 total
print(total)   # 15

# 求最大值
print(reduce(lambda a, b: a if a > b else b, nums))   # 5

# 大多数场景用 sum/max/min 更直观，reduce 适合自定义合并逻辑
\`\`\`

### 7.3 lru_cache（见第一章）

记忆化装饰器，前面已讲，这里补充：Python 3.9+ 还有 \`cache\`（无上限）。

---

## 八、re：正则表达式

\`\`\`python
import re                          # 导入 re 模块

text = "我的电话是 138-1234-5678，邮箱是 tom@example.com"  # 将字符串 "我的电话是 138-1234-5678，邮箱是 tom@example.com" 赋给 text

# 查找
m = re.search(r"\d{3}-\d{4}-\d{4}", text)  # 将 re.search(r"\d{3}-\d{4}-\d{4}", text) 赋给 m
if m:                              # 如果 m 成立
    print(m.group())   # 138-1234-5678
    print(m.start(), m.end())  # 匹配位置

# 查找全部
print(re.findall(r"\d+", "a1 b22 c333"))   # ['1', '22', '333']

# 替换
print(re.sub(r"\d", "*", "a1b2c3"))   # a*b*c*

# 分割
print(re.split(r"[\s,]+", "a, b , c  d"))   # ['a', 'b', 'c', 'd']

# 预编译（多次使用时更快）
pattern = re.compile(r"(\w+)@(\w+)\.(\w+)")  # 将 re.compile(r"(\w+)@(\w+)\.(\w+)") 赋给 pattern
m = pattern.search("contact: tom@example.com")  # 将 pattern.search("contact: tom@example.com") 赋给 m
print(m.groups())   # ('tom', 'example', 'com')

# 命名分组
m = re.search(r"(?P<user>\w+)@(?P<domain>\w+\.\w+)", "tom@example.com")  # 将 re.search(r"(?P<user>\w+)@(?P<domain>\w+\.\w+)", "tom@example.com") 赋给 m
print(m.group("user"), m.group("domain"))  # 输出 m.group("user"), m.group("domain")
\`\`\`

常用元字符：\`.\` 任意字符、\`\\d\` 数字、\`\\w\` 字母数字下划线、\`\\s\` 空白、\`+\` 一次或多次、\`*\` 零次或多次、\`?\` 零次或一次、\`{n}\` 正好 n 次、\`{n,m}\` n 到 m 次、\`[]\` 字符集、\`^\` 开头、\`$\` 结尾。

---

## 九、json：JSON 序列化

\`\`\`python
import json                        # 导入 json 模块

data = {"name": "tom", "age": 18, "scores": [90, 85, 88]}  # 创建字典并赋给 data

# 序列化成字符串
s = json.dumps(data, ensure_ascii=False, indent=2)  # 将 json.dumps(data, ensure_ascii=False, indent=2) 赋给 s
print(s)                           # 输出 s
# ensure_ascii=False 让中文正常显示
# indent=2 让输出带缩进（好看）

# 反序列化
obj = json.loads(s)                # 将 json.loads(s) 赋给 obj
print(obj["name"])                 # 输出 obj["name"]

# 读写文件
with open("data.json", "w", encoding="utf-8") as f:  # 使用上下文管理器 open("data.json", "w", encoding="utf-8")，绑定到 f
    json.dump(data, f, ensure_ascii=False, indent=2)  # 对 json 调用 dump 方法，参数 data, f, ensure_ascii=False, indent=2

with open("data.json", encoding="utf-8") as f:  # 使用上下文管理器 open("data.json", encoding="utf-8")，绑定到 f
    loaded = json.load(f)          # 将 json.load(f) 赋给 loaded
\`\`\`

注意：JSON 只支持 str/int/float/bool/None/list/dict，元组会被转成 list，set/datetime 等需要自定义转换。

---

## 十、pathlib：面向对象的路径

\`pathlib\` 比 \`os.path\` 更现代、更优雅，强烈推荐：

\`\`\`python
from pathlib import Path           # 从 pathlib 导入 Path

p = Path("/home/user/docs/readme.md")  # 将 Path("/home/user/docs/readme.md") 赋给 p
print(p.parent)        # /home/user/docs —— 父目录
print(p.name)          # readme.md —— 文件名
print(p.stem)          # readme —— 不含扩展名
print(p.suffix)        # .md —— 扩展名
print(p.parts)         # ('/', 'home', 'user', 'docs', 'readme.md')

# 拼接（用 / 运算符，很优雅）
new = Path("/home") / "user" / "file.txt"  # 将 Path("/home") / "user" / "file.txt" 赋给 new
print(new)                         # 输出 new

# 当前目录、家目录
print(Path.cwd())                  # 输出 Path.cwd()
print(Path.home())                 # 输出 Path.home()

# 遍历目录
for f in Path(".").iterdir():      # 遍历 Path(".").iterdir()，每次取值赋给 f
    print(f)                       # 输出 f

# 递归找所有 .py 文件
for f in Path(".").rglob("*.py"):  # 遍历 Path(".").rglob("*.py")，每次取值赋给 f
    print(f)                       # 输出 f

# 读写文件（小文件一把梭）
p = Path("test.txt")               # 将 Path("test.txt") 赋给 p
p.write_text("hello", encoding="utf-8")  # 对 p 调用 write_text 方法，参数 "hello", encoding="utf-8"
print(p.read_text(encoding="utf-8"))  # 输出 p.read_text(encoding="utf-8")

# 创建/删除
p = Path("newdir")                 # 将 Path("newdir") 赋给 p
p.mkdir(exist_ok=True)   # 已存在不报错
# p.rmdir()
\`\`\`

\`pathlib\` 把路径当成对象而非字符串，链式调用更安全更可读。

---

## 十一、subprocess：子进程

\`subprocess\` 用来执行外部命令。注意安全：不要把用户输入直接拼进命令，优先用列表形式：

\`\`\`python
import subprocess                  # 导入 subprocess 模块
import sys                         # 导入 sys 模块

# 安全演示：调用 Python 自己
result = subprocess.run(           # 将 subprocess.run( 赋给 result
    [sys.executable, "-c", "print(1 + 2)"],
    capture_output=True,    # 捕获输出
    text=True,              # 输出用字符串而非 bytes
)
print("返回码:", result.returncode)   # 输出 "返回码:", result.returncode
print("标准输出:", result.stdout.strip())  # 输出 "标准输出:", result.stdout.strip()
print("标准错误:", result.stderr.strip())  # 输出 "标准错误:", result.stderr.strip()

# check=True 时非 0 返回码抛 CalledProcessError
try:                               # 尝试执行以下代码块
    subprocess.run([sys.executable, "-c", "import sys; sys.exit(1)"], check=True)  # 对 subprocess 调用 run 方法，参数 [sys.executable, "-c", "import sys; sys.exit(1)"], check=True
except subprocess.CalledProcessError as e:
    print("命令失败:", e)              # 输出 "命令失败:", e
\`\`\`

**安全提醒**：\`shell=True\` 配合字符串命令很危险（命令注入），除非必要不要用，且绝不要把用户输入拼进命令字符串。

---

## 十二、logging：日志

\`print\` 适合调试，正式程序用 \`logging\`：

\`\`\`python
import logging                     # 导入 logging 模块

# 基础配置
logging.basicConfig(
    level=logging.DEBUG,    # 最低级别
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",  # 将字符串 "%(asctime)s [%(levelname)s] %(name)s: %(message)s", 赋给 format
)

log = logging.getLogger("myapp")   # 将 logging.getLogger("myapp") 赋给 log

log.debug("调试信息")                  # 对 log 调用 debug 方法，参数 "调试信息"
log.info("一般信息")                   # 对 log 调用 info 方法，参数 "一般信息"
log.warning("警告")                  # 对 log 调用 warning 方法，参数 "警告"
log.error("错误")                    # 对 log 调用 error 方法，参数 "错误"
log.critical("严重错误")               # 对 log 调用 critical 方法，参数 "严重错误"
\`\`\`

级别从低到高：DEBUG < INFO < WARNING < ERROR < CRITICAL。设了 \`level=logging.INFO\` 则 DEBUG 不输出。

生产环境通常配置 \`FileHandler\` 写文件 + \`StreamHandler\` 写控制台，并按模块拆 logger。

---

## 十三、typing：类型注解

类型注解让代码更易读、IDE 提示更智能、配合 mypy 做静态检查：

\`\`\`python
from typing import List, Dict, Optional, Tuple, Union, Any, Callable  # 从 typing 导入 List, Dict, Optional, Tuple, Union, Any, Callable

def greet(name: str, times: int = 1) -> str:  # 定义函数 greet，参数：name: str, times: int = 1，返回 str
    """name 是 str，times 默认 1，返回 str"""
    return ("hello, " + name + "! ") * times  # 返回 ("hello, " + name + "! ") * times

# 容器类型
def process(items: List[int]) -> Dict[str, int]:  # 定义函数 process，参数：items: List[int]，返回 Dict[str, int]
    return {str(x): x for x in items}  # 返回 {str(x): x for x in items}

# Optional 表示可能为 None
def find(x: int, lst: List[int]) -> Optional[int]:  # 定义函数 find，参数：x: int, lst: List[int]，返回 Optional[int]
    return x if x in lst else None # 返回 x if x in lst else None

# Union 多种类型
def double(x: Union[int, str]) -> Union[int, str]:  # 定义函数 double，参数：x: Union[int, str]，返回 Union[int, str]
    return x * 2                   # 返回 x * 2

# Callable 函数类型
def apply(func: Callable[[int], int], x: int) -> int:  # 定义函数 apply，参数：func: Callable[[int], int], x: int，返回 int
    return func(x)                 # 返回 func(x)
\`\`\`

Python 3.9+ 可以直接用 \`list[int]\` / \`dict[str, int]\` 不用 import。3.10+ 用 \`int | str\` 替代 \`Union[int, str]\`，\`int | None\` 替代 \`Optional[int]\`。

类型注解**不**在运行时强制，只是提示。要真正检查用 \`mypy\`（下一章讲）。

---

## 十四、enum：枚举

\`\`\`python
from enum import Enum, IntEnum, auto  # 从 enum 导入 Enum, IntEnum, auto

class Color(Enum):                 # 定义类 Color，继承自 Enum
    RED = 1                        # 将整数 1 赋给 RED
    GREEN = 2                      # 将整数 2 赋给 GREEN
    BLUE = 3                       # 将整数 3 赋给 BLUE

class Status(IntEnum):   # IntEnum 可与 int 比较
    PENDING = auto()     # 自动分配值 1
    RUNNING = auto()     # 2
    DONE = auto()        # 3

c = Color.RED                      # 将 Color.RED 赋给 c
print(c)            # Color.RED
print(c.name)       # RED
print(c.value)      # 1
print(c is Color.RED)   # True —— 同一性
print(Color["RED"]) # 按名字取
print(Status.RUNNING == 2)   # True

# 遍历
for s in Status:                   # 遍历 Status，每次取值赋给 s
    print(s)                       # 输出 s
\`\`\`

枚举比「魔法数字常量」更安全可读，\`Status.DONE\` 比 \`3\` 含义清晰得多。

---

## 十五、abc：抽象基类

\`abc\` 让你定义「必须被子类实现的方法」：

\`\`\`python
from abc import ABC, abstractmethod  # 从 abc 导入 ABC, abstractmethod

class Animal(ABC):                 # 定义类 Animal，继承自 ABC
    @abstractmethod
    def sound(self):               # 定义函数 sound，参数：self
        """子类必须实现"""
        pass                       # 空操作，占位

    @abstractmethod
    def legs(self):                # 定义函数 legs，参数：self
        pass                       # 空操作，占位

    def describe(self):            # 定义函数 describe，参数：self
        # 普通方法，子类可直接用
        print("我有 %d 条腿，叫声是 %s" % (self.legs(), self.sound()))  # 输出 "我有 %d 条腿，叫声是 %s" % (self.legs(), self.sound())

class Dog(Animal):                 # 定义类 Dog，继承自 Animal
    def sound(self):               # 定义函数 sound，参数：self
        return "汪汪"                # 返回 "汪汪"
    def legs(self):                # 定义函数 legs，参数：self
        return 4                   # 返回 4

# Animal()  # 报错：不能实例化抽象类
d = Dog()                          # 将 Dog() 赋给 d
d.describe()   # 我有 4 条腿，叫声是 汪汪
\`\`\`

抽象基类用于「定义接口契约」，强制子类实现关键方法，避免「忘了实现某方法导致运行时才报错」。

---

## 小结

标准库是 Python 的宝藏，本章只挑了最常用的十几个模块：
- **os / sys**：系统接口、解释器状态、命令行参数
- **math / random**：数学与随机（安全场景用 secrets）
- **datetime**：日期时间处理
- **collections**：Counter/defaultdict/deque/namedtuple 高级容器
- **functools**：partial/reduce/lru_cache 函数工具
- **re**：正则表达式
- **json / pathlib**：序列化、现代路径操作
- **subprocess**：安全的子进程调用
- **logging / typing / enum / abc**：日志、类型注解、枚举、抽象基类

养成「先查标准库再找第三方」的习惯，能让你的代码更轻、依赖更少、更稳定。
`,
    code: `# ============================================================
# 第三章演示代码：标准库精选
# 直接运行 python3 此文件即可看到全部输出
# ============================================================

import os
import sys
import math
import random
import json
import re
import logging
from datetime import datetime, date, timedelta
from collections import Counter, defaultdict, deque, namedtuple
from functools import partial, reduce, lru_cache
from pathlib import Path
from enum import Enum, auto
from abc import ABC, abstractmethod

# ------------------------------------------------------------
# 1. os 与 sys
# ------------------------------------------------------------
print("=" * 50)
print("1. os 与 sys")
print("=" * 50)

print("  当前 PID:", os.getpid())
print("  当前目录:", os.getcwd())
print("  HOME:", os.environ.get("HOME", "未知"))
print("  Python:", sys.version.split()[0])
print("  平台:", sys.platform)
print("  argv:", sys.argv[0])

# ------------------------------------------------------------
# 2. math 数学
# ------------------------------------------------------------
print()
print("=" * 50)
print("2. math 数学")
print("=" * 50)

print("  pi =", math.pi)
print("  sqrt(16) =", math.sqrt(16))
print("  log2(8) =", math.log2(8))
print("  ceil(3.2) =", math.ceil(3.2))
print("  floor(3.8) =", math.floor(3.8))
print("  gcd(12, 18) =", math.gcd(12, 18))
print("  factorial(5) =", math.factorial(5))

# ------------------------------------------------------------
# 3. random 随机
# ------------------------------------------------------------
print()
print("=" * 50)
print("3. random 随机")
print("=" * 50)

random.seed(42)
print("  random():", random.random())
print("  randint(1,100):", random.randint(1, 100))
print("  choice:", random.choice([1, 2, 3, 4, 5]))
print("  sample:", random.sample(range(1, 50), 6))
lst = [1, 2, 3, 4, 5]
random.shuffle(lst)
print("  shuffle:", lst)

# ------------------------------------------------------------
# 4. datetime 日期时间
# ------------------------------------------------------------
print()
print("=" * 50)
print("4. datetime")
print("=" * 50)

now = datetime.now()
print("  now:", now.strftime("%Y-%m-%d %H:%M:%S"))
d = date(2024, 1, 15)
print("  date:", d)
parsed = datetime.strptime("2024-06-15", "%Y-%m-%d")
print("  strptime:", parsed)
future = now + timedelta(days=7)
print("  7 天后:", future.strftime("%Y-%m-%d"))
diff = date(2024, 12, 31) - date(2024, 1, 1)
print("  年内天数:", diff.days)

# ------------------------------------------------------------
# 5. collections Counter / defaultdict
# ------------------------------------------------------------
print()
print("=" * 50)
print("5. collections")
print("=" * 50)

words = "the cat sat on the mat the cat".split()
c = Counter(words)
print("  Counter:", c)
print("  最常见 2:", c.most_common(2))

groups = defaultdict(list)
for w in ["apple", "ant", "banana"]:
    groups[w[0]].append(w)
print("  分组:", dict(groups))

count = defaultdict(int)
for w in words:
    count[w] += 1
print("  计数:", dict(count))

# ------------------------------------------------------------
# 6. deque 双端队列
# ------------------------------------------------------------
print()
print("=" * 50)
print("6. deque")
print("=" * 50)

dq = deque([1, 2, 3])
dq.appendleft(0)
dq.append(4)
print("  deque:", list(dq))
print("  popleft:", dq.popleft())
print("  pop:", dq.pop())

recent = deque(maxlen=3)
for i in range(5):
    recent.append(i)
print("  maxlen=3:", list(recent))

# ------------------------------------------------------------
# 7. namedtuple
# ------------------------------------------------------------
print()
print("=" * 50)
print("7. namedtuple")
print("=" * 50)

Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
print("  x, y:", p.x, p.y)
print("  下标:", p[0], p[1])
print("  字典:", p._asdict())

# ------------------------------------------------------------
# 8. functools partial / reduce / lru_cache
# ------------------------------------------------------------
print()
print("=" * 50)
print("8. functools")
print("=" * 50)

def power(base, exp):
    return base ** exp

square = partial(power, exp=2)
cube = partial(power, exp=3)
print("  square(5):", square(5))
print("  cube(2):", cube(2))

nums = [1, 2, 3, 4, 5]
print("  reduce sum:", reduce(lambda a, b: a + b, nums))
print("  reduce max:", reduce(lambda a, b: a if a > b else b, nums))

@lru_cache(maxsize=128)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print("  fib(50):", fib(50))
print("  cache_info:", fib.cache_info())

# ------------------------------------------------------------
# 9. re 正则
# ------------------------------------------------------------
print()
print("=" * 50)
print("9. re 正则")
print("=" * 50)

text = "电话 138-1234-5678，邮箱 tom@example.com"
m = re.search(r"\\d{3}-\\d{4}-\\d{4}", text)
print("  电话:", m.group() if m else "无")
print("  所有数字:", re.findall(r"\\d+", "a1 b22 c333"))
print("  替换:", re.sub(r"\\d", "*", "a1b2c3"))
print("  分割:", re.split(r"[\\s,]+", "a, b , c  d"))

m = re.search(r"(?P<user>\\w+)@(?P<domain>\\w+\\.\\w+)", text)
print("  用户名:", m.group("user"))
print("  域名:", m.group("domain"))

# ------------------------------------------------------------
# 10. json 序列化
# ------------------------------------------------------------
print()
print("=" * 50)
print("10. json")
print("=" * 50)

data = {"name": "张三", "age": 18, "scores": [90, 85, 88]}
s = json.dumps(data, ensure_ascii=False, indent=2)
print("  序列化:")
print(s)
obj = json.loads(s)
print("  反序列化 name:", obj["name"])

# ------------------------------------------------------------
# 11. pathlib 路径
# ------------------------------------------------------------
print()
print("=" * 50)
print("11. pathlib")
print("=" * 50)

p = Path("/home/user/docs/readme.md")
print("  parent:", p.parent)
print("  name:", p.name)
print("  stem:", p.stem)
print("  suffix:", p.suffix)
print("  parts:", p.parts)
print("  拼接:", Path("/home") / "user" / "file.txt")

# 写读小文件
fp = Path("test_stdlib_demo.txt")
fp.write_text("hello pathlib", encoding="utf-8")
print("  读回:", fp.read_text(encoding="utf-8"))
fp.unlink()   # 删除

# ------------------------------------------------------------
# 12. subprocess 子进程（安全演示）
# ------------------------------------------------------------
print()
print("=" * 50)
print("12. subprocess")
print("=" * 50)

import subprocess
result = subprocess.run(
    [sys.executable, "-c", "print(1 + 2)"],
    capture_output=True, text=True,
)
print("  返回码:", result.returncode)
print("  stdout:", result.stdout.strip())

try:
    subprocess.run([sys.executable, "-c", "import sys; sys.exit(1)"], check=True)
except subprocess.CalledProcessError as e:
    print("  命令失败，返回码:", e.returncode)

# ------------------------------------------------------------
# 13. logging 日志
# ------------------------------------------------------------
print()
print("=" * 50)
print("13. logging")
print("=" * 50)

logging.basicConfig(
    level=logging.DEBUG,
    format="  %(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("demo")
log.info("这是一条 info")
log.warning("这是一条 warning")
log.error("这是一条 error")

# ------------------------------------------------------------
# 14. enum 枚举
# ------------------------------------------------------------
print()
print("=" * 50)
print("14. enum")
print("=" * 50)

class Color(Enum):
    RED = 1
    GREEN = 2
    BLUE = 3

class Status(Enum):
    PENDING = auto()
    RUNNING = auto()
    DONE = auto()

c = Color.RED
print("  Color:", c.name, c.value)
print("  Color[RED]:", Color["RED"])
print("  Status 遍历:", [s.name for s in Status])

# ------------------------------------------------------------
# 15. abc 抽象基类
# ------------------------------------------------------------
print()
print("=" * 50)
print("15. abc 抽象基类")
print("=" * 50)

class Animal(ABC):
    @abstractmethod
    def sound(self):
        pass

    @abstractmethod
    def legs(self):
        pass

    def describe(self):
        print("    我有 %d 条腿，叫声是 %s" % (self.legs(), self.sound()))

class Dog(Animal):
    def sound(self):
        return "汪汪"
    def legs(self):
        return 4

print("  Dog:")
Dog().describe()

print()
print("全部演示完成！")
`,
  },

  // =========================================================
  // 第四章：虚拟环境与包管理
  // =========================================================
  {
    id: "py-tooling",
    group: "工程化",
    icon: "🛠️",
    title: "虚拟环境与包管理",
    content: `# 虚拟环境与包管理

写 Python 不只是写代码，还包括「管理依赖」「保证可复现」「保持代码风格一致」「测试与调试」。这些「工程化」能力是区分新手与专业开发者的分水岭。

本章覆盖：虚拟环境、pip 包管理、现代项目配置（pyproject.toml）、代码风格与类型检查、测试、调试、性能分析。学完你能把一个「能跑的脚本」升级成「可维护的项目」。

---

## 一、为什么需要虚拟环境

### 1.1 痛点：全局污染

假设你的系统装了 Python，全局 \`site-packages\` 里有一堆包。你做项目 A 用 Django 3，做项目 B 用 Django 4，全局只能装一个版本——冲突。又或者你升级了某个包，另一个项目突然挂了。

**虚拟环境（Virtual Environment）** 解决这个问题：每个项目有自己独立的 Python 环境，包互不干扰。

### 1.2 虚拟环境的本质

虚拟环境本质上就是「一个目录」，里面包含：
- 一份 Python 解释器的副本（或符号链接）
- 一个独立的 \`site-packages\`（装第三方包的地方）
- 一个 \`pip\`
- 一些激活脚本（\`activate\`）

激活虚拟环境后，\`python\` 和 \`pip\` 指向这个目录里的版本，装的包也只装到这里，与系统全局隔离。

---

## 二、venv：创建虚拟环境

\`venv\` 是 Python 3.3+ 内置的虚拟环境工具，不用安装：

\`\`\`bash
# 在项目目录下创建虚拟环境（目录名通常叫 .venv 或 venv）
python3 -m venv .venv

# 激活（macOS/Linux）
source .venv/bin/activate

# 激活（Windows PowerShell）
.venv\\Scripts\\Activate.ps1

# 激活后提示符会变成：
# (.venv) $

# 退出虚拟环境
deactivate
\`\`\`

激活后：
- \`which python\`（或 \`where python\`）指向 \`.venv/bin/python\`
- \`pip install xxx\` 装到 \`.venv/lib/python3.x/site-packages/\`
- 全局 Python 不受影响

### 2.1 .gitignore

虚拟环境目录通常叫 \`.venv\`，**不应该**提交到 git（它体积大、跨平台不通用）。在 \`.gitignore\` 里加：

\`\`\`
.venv/
venv/
__pycache__/
*.pyc
\`\`\`

要复现环境，靠 \`requirements.txt\` 或 \`pyproject.toml\` 记录依赖清单，别人拉代码后自己建虚拟环境再装。

---

## 三、pip：包管理

\`pip\` 是 Python 的包管理器，从 PyPI（Python Package Index）安装包。

### 3.1 常用命令

\`\`\`bash
# 安装最新版
pip install requests

# 安装指定版本
pip install requests==2.31.0
pip install "requests>=2.28,<3.0"

# 从 requirements 文件安装
pip install -r requirements.txt

# 升级
pip install --upgrade requests

# 卸载
pip uninstall requests

# 查看已安装的包
pip list

# 查看某个包的详细信息
pip show requests

# 导出当前环境的所有包及版本
pip freeze > requirements.txt
\`\`\`

### 3.2 requirements.txt

最简单的依赖清单格式：

\`\`\`text
requests==2.31.0
flask==3.0.0
numpy>=1.24,<2.0
\`\`\`

\`==\` 锁定精确版本（保证可复现），\`>=,<\` 给一个范围。

\`pip freeze\` 导出当前环境**所有**包（包括间接依赖），适合「精确复现某个环境」。但有时我们只想记「直接依赖」，这时手写或用 \`pipreqs\` 工具更干净。

### 3.3 镜像加速

国内访问 PyPI 较慢，可配置镜像：

\`\`\`bash
# 临时使用
pip install requests -i https://pypi.tuna.tsinghua.edu.cn/simple

# 永久配置（写入 ~/.pip/pip.conf 或 ~/.config/pip/pip.conf）
# [global]
# index-url = https://pypi.tuna.tsinghua.edu.cn/simple
\`\`\`

---

## 四、pyproject.toml：现代项目配置

\`requirements.txt\` 简单但不够强大（不能描述项目元数据、构建系统、开发依赖）。PEP 518/621 引入了 \`pyproject.toml\`，现在是 Python 项目的标准配置文件。

### 4.1 基本结构

\`\`\`toml
[project]
name = "myapp"
version = "0.1.0"
description = "一个示例项目"
requires-python = ">=3.9"
dependencies = [
    "requests>=2.28",
    "flask>=3.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0",
    "mypy>=1.0",
    "ruff>=0.1",
]

[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"
\`\`\`

\`[project]\` 描述项目元数据和运行时依赖；\`[project.optional-dependencies]\` 是「可选依赖组」（如开发工具）；\`[build-system]\` 告诉打包工具怎么构建。

安装时：\`pip install .\`（运行时依赖）或 \`pip install .[dev]\`（连开发依赖一起）。

### 4.2 与 requirements.txt 的关系

- \`requirements.txt\`：简单项目、部署环境锁定版本
- \`pyproject.toml\`：正经项目、要发布到 PyPI、需要描述元数据

两者不互斥，可以 \`pyproject.toml\` 写依赖范围，再用 \`pip-compile\` 生成锁定的 \`requirements.txt\`。

---

## 五、poetry 与 uv：现代包管理器

### 5.1 poetry

\`poetry\` 是流行的第三方包管理器，集依赖管理、虚拟环境、打包发布于一体：

\`\`\`bash
# 安装
pip install poetry

# 新建项目
poetry new myproj

# 添加依赖
poetry add requests
poetry add pytest --group dev

# 安装所有依赖
poetry install

# 在虚拟环境里跑命令
poetry run python main.py
poetry run pytest
\`\`\`

poetry 用 \`pyproject.toml\` + \`poetry.lock\`（锁定文件）管理，体验类似 Node 的 npm。

### 5.2 uv

\`uv\` 是 2024 年由 Astral（ruff 作者）推出的超快 Python 包管理器，用 Rust 写的，比 pip/poetry 快 10-100 倍：

\`\`\`bash
# 安装
curl -LsSf https://astral.sh/uv/install.sh | sh

# 创建项目
uv init myproj
cd myproj

# 添加依赖（自动建虚拟环境）
uv add requests
uv add --dev pytest

# 同步依赖
uv sync

# 跑命令
uv run python main.py
uv run pytest
\`\`\`

uv 兼容 \`pyproject.toml\`，也支持管理 Python 版本本身（\`uv python install 3.12\`）。是 2025/2026 年 Python 工具链的新趋势。

---

## 六、虚拟环境原理与字节码

### 6.1 __pycache__ 与 .pyc

你第一次跑 \`python mymod.py\` 后，目录里会多一个 \`__pycache__/mymod.cpython-314.pyc\` 文件。这是 Python 把源码编译成的**字节码缓存**：

- Python 是解释型语言，但执行前会先把 \`.py\` 编译成字节码（\`.pyc\`）
- 下次运行时如果源码没改，直接加载 \`.pyc\`，跳过编译，启动更快
- \`.pyc\` 是平台无关的字节码，但与 Python 版本绑定（\`cpython-314\` 标识）

\`__pycache__\` 不需要提交到 git，加入 \`.gitignore\`。

### 6.2 字节码与 dis 模块

可以用 \`dis\` 模块反汇编查看字节码：

\`\`\`python
import dis                         # 导入 dis 模块

def add(a, b):                     # 定义函数 add，参数：a, b
    return a + b                   # 返回 a + b

dis.dis(add)                       # 对 dis 调用 dis 方法，参数 add
# 输出类似：
#   2           0 RESUME                   0
#   3           2 LOAD_FAST                0 (a)
#               4 LOAD_FAST                1 (b)
#               6 BINARY_OP                0 (+)
#               8 RETURN_VALUE
\`\`\`

了解字节码有助于理解 Python 内部机制（变量查找、函数调用开销等），日常开发用不到。

### 6.3 虚拟环境如何隔离

激活虚拟环境后，\`sys.prefix\` 指向虚拟环境目录，\`sys.path\` 里虚拟环境的 \`site-packages\` 排在前面。所以 \`import xxx\` 优先找到虚拟环境里的包，而非全局包。

\`\`\`python
import sys                         # 导入 sys 模块
print(sys.prefix)      # 虚拟环境目录
print(sys.executable)  # 虚拟环境里的 python
\`\`\`

---

## 七、PEP 8 与代码风格

### 7.1 PEP 8 核心规则

PEP 8 是 Python 官方风格指南，核心要点：
- **缩进**：4 个空格，不用 Tab
- **行宽**：79 字符（现代项目常放宽到 100/120）
- **命名**：函数和变量用 \`snake_case\`，类用 \`CamelCase\`，常量用 \`UPPER_CASE\`，私有用 \`_leading_underscore\`
- **空行**：函数间 2 空行，方法间 1 空行
- **导入**：分三组：标准库、第三方、本地，每组间空一行
- **运算符两侧**：\`a = b + c\` 而非 \`a=b+c\`

\`\`\`python
# 好
import os                          # 导入 os 模块
import sys                         # 导入 sys 模块

def calculate_total(items):        # 定义函数 calculate_total，参数：items
    total = 0                      # 将整数 0 赋给 total
    for item in items:             # 遍历 items，每次取值赋给 item
        total += item.price        # total 加 item.price
    return total                   # 返回 total

class ShoppingCart:                # 定义类 ShoppingCart
    def __init__(self):            # 定义函数 __init__，参数：self
        self.items = []

# 不好
import os,sys
def calculateTotal(items):         # 定义函数 calculateTotal，参数：items
    total=0                        # 将整数 0 赋给 total
    for item in items:             # 遍历 items，每次取值赋给 item
        total+=item.price          # total 加 item.price
    return total                   # 返回 total
\`\`\`

### 7.2 自动格式化：black

\`black\` 是「不妥协的格式化器」，你不用纠结风格，它直接帮你改：

\`\`\`bash
pip install black
black mymodule.py
black .   # 格式化整个项目
\`\`\`

black 的哲学：争议最少的风格就是好风格。它定好的格式你接受就行，团队风格统一。

### 7.3 ruff：超快 linter + formatter

\`ruff\` 是 2023+ 的明星工具，用 Rust 写的，速度极快，一个工具替代 flake8 + isort + black + pyupgrade 等一堆：

\`\`\`bash
pip install ruff

# 检查问题
ruff check .

# 自动修复
ruff check --fix .

# 格式化
ruff format .
\`\`\`

\`ruff\` 配置在 \`pyproject.toml\`：

\`\`\`toml
[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "I", "UP"]   # 启用哪些规则
\`\`\`

---

## 八、类型检查 mypy

类型注解（上一章讲过）让代码更清晰，但要真正「检查」类型错误，需要 \`mypy\`：

\`\`\`python
# example.py
def add(a: int, b: int) -> int:    # 定义函数 add，参数：a: int, b: int，返回 int
    return a + b                   # 返回 a + b

result: str = add(1, 2)   # 类型错误：int 赋给 str
\`\`\`

\`\`\`bash
pip install mypy
mypy example.py
# 输出：error: Incompatible types in assignment (expression has type "int", variable has type "str")
\`\`\`

mypy 在**运行前**静态检查类型错误，能在开发阶段就发现 bug。大型项目通常把 mypy 加进 CI。

\`pyproject.toml\` 配置：

\`\`\`toml
[tool.mypy]
python_version = "3.12"
strict = true
\`\`\`

类型检查是可选的渐进式能力：你可以只给部分模块加注解，mypy 不会强制全项目。

---

## 九、测试：unittest 与 pytest

### 9.1 unittest（内置）

\`unittest\` 是标准库自带的测试框架：

\`\`\`python
import unittest                    # 导入 unittest 模块

def add(a, b):                     # 定义函数 add，参数：a, b
    return a + b                   # 返回 a + b

class TestAdd(unittest.TestCase):  # 定义类 TestAdd，继承自 unittest.TestCase
    def test_add_integers(self):   # 定义函数 test_add_integers，参数：self
        self.assertEqual(add(1, 2), 3)  # 对 self 调用 assertEqual 方法，参数 add(1, 2), 3

    def test_add_negative(self):   # 定义函数 test_add_negative，参数：self
        self.assertEqual(add(-1, -2), -3)  # 对 self 调用 assertEqual 方法，参数 add(-1, -2), -3

    def test_add_float(self):      # 定义函数 test_add_float，参数：self
        self.assertAlmostEqual(add(0.1, 0.2), 0.3, places=7)  # 对 self 调用 assertAlmostEqual 方法，参数 add(0.1, 0.2), 0.3, places=7

    def test_add_string(self):     # 定义函数 test_add_string，参数：self
        self.assertEqual(add("a", "b"), "ab")  # 对 self 调用 assertEqual 方法，参数 add("a", "b"), "ab"

if __name__ == "__main__":         # 如果 __name__ == "__main__" 成立
    unittest.main()                # 对 unittest 调用 main 方法
\`\`\`

运行：\`python test_example.py\` 或 \`python -m unittest discover\`。

测试方法必须以 \`test_\` 开头，断言用 \`assertEqual\`/\`assertTrue\`/\`assertRaises\` 等。

### 9.2 pytest（第三方，更流行）

\`pytest\` 语法更简洁，是社区主流：

\`\`\`python
# test_example.py
import pytest                      # 导入 pytest 模块

def add(a, b):                     # 定义函数 add，参数：a, b
    return a + b                   # 返回 a + b

def test_add_int():                # 定义函数 test_add_int，无参数
    assert add(1, 2) == 3

def test_add_string():             # 定义函数 test_add_string，无参数
    assert add("a", "b") == "ab"

def test_add_raises():             # 定义函数 test_add_raises，无参数
    with pytest.raises(TypeError): # 使用上下文管理器 pytest.raises(TypeError)
        add(1, "a")   # int + str 抛 TypeError

# 参数化测试：一组数据跑多次
@pytest.mark.parametrize("a, b, expected", [
    (1, 2, 3),
    (-1, -2, -3),
    (0, 0, 0),
    (100, 200, 300),
])
def test_add_many(a, b, expected): # 定义函数 test_add_many，参数：a, b, expected
    assert add(a, b) == expected
\`\`\`

运行：\`pytest\`（自动发现 \`test_*.py\` 里的 \`test_*\` 函数）。

pytest 的优势：
- 用普通 \`assert\`，不用 \`self.assertEqual\`
- 强大的 fixture 机制做测试前置/后置
- 参数化测试（\`@pytest.mark.parametrize\`）
- 丰富的插件生态

### 9.3 doctest：文档里的测试

把测试写在 docstring 里，既能当文档又能当测试：

\`\`\`python
def factorial(n):                  # 定义函数 factorial，参数：n
    """计算阶乘

    >>> factorial(0)
    1
    >>> factorial(5)
    120
    >>> factorial(3)
    6
    """
    result = 1                     # 将整数 1 赋给 result
    for i in range(2, n + 1):      # 遍历 range(2, n + 1)，每次取值赋给 i
        result *= i                # result 乘 i
    return result                  # 返回 result
\`\`\`

运行：\`python -m doctest mymodule.py -v\`。doctest 会执行 docstring 里 \`>>>\` 后的代码，比对输出。适合写「带示例的文档」，一举两得。

---

## 十、调试：pdb

\`pdb\` 是 Python 内置调试器。在代码里加一行：

\`\`\`python
def buggy(x):                      # 定义函数 buggy，参数：x
    y = x * 2                      # 将 x * 2 赋给 y
    import pdb; pdb.set_trace()   # 程序会停在这里，进入交互式调试
    z = y + 1                      # 将 y + 1 赋给 z
    return z                       # 返回 z
\`\`\`

Python 3.7+ 推荐用更短的 \`breakpoint()\`：

\`\`\`python
def buggy(x):                      # 定义函数 buggy，参数：x
    y = x * 2                      # 将 x * 2 赋给 y
    breakpoint()   # 等价于 pdb.set_trace()
    z = y + 1                      # 将 y + 1 赋给 z
    return z                       # 返回 z
\`\`\`

进入 pdb 后常用命令：
- \`n\` (next)：执行下一行，不进函数
- \`s\` (step)：执行下一行，进函数
- \`c\` (continue)：继续到下一个断点
- \`p 变量\` (print)：打印变量值
- \`l\` (list)：查看当前代码上下文
- \`q\` (quit)：退出调试
- \`b 行号\` (break)：设置断点

也可以命令行启动：\`python -m pdb myscript.py\`，程序从一开始就在调试器里。

---

## 十一、性能分析

### 11.1 timeit：精确测时

\`timeit\` 测量小代码片段的执行时间，会自动多次运行取平均，避免偶然波动：

\`\`\`python
import timeit                      # 导入 timeit 模块

# 测字符串拼接两种方式
t1 = timeit.timeit('"-".join(["a","b","c"])', number=100000)  # 将 timeit.timeit('"-".join(["a","b","c"])', number=100000) 赋给 t1
t2 = timeit.timeit('"a" + "-" + "b" + "-" + "c"', number=100000)  # 将 timeit.timeit('"a" + "-" + "b" + "-" + "c"', number=100000) 赋给 t2
print("join:", t1)                 # 输出 "join:", t1
print("+:", t2)                    # 输出 "+:", t2
\`\`\`

命令行也能用：\`python -m timeit -s "setup" "stmt"\`。

### 11.2 cProfile：性能剖析

\`cProfile\` 找出程序里「哪些函数耗时最多」：

\`\`\`python
import cProfile                    # 导入 cProfile 模块

def slow_func():                   # 定义函数 slow_func，无参数
    total = 0                      # 将整数 0 赋给 total
    for i in range(100000):        # 遍历 range(100000)，每次取值赋给 i
        total += i                 # total 加 i
    return total                   # 返回 total

def fast_func():                   # 定义函数 fast_func，无参数
    return sum(range(100000))      # 返回 sum(range(100000))

def main():                        # 定义函数 main，无参数
    for _ in range(100):           # 遍历 range(100)，每次取值赋给 _
        slow_func()                # 调用 slow_func
    for _ in range(100):           # 遍历 range(100)，每次取值赋给 _
        fast_func()                # 调用 fast_func

cProfile.run("main()", sort="cumulative")  # 对 cProfile 调用 run 方法，参数 "main()", sort="cumulative"
\`\`\`

输出会列出每个函数的调用次数、总耗时、每次平均耗时，按累计时间排序。瓶颈一目了然。

命令行：\`python -m cProfile -s cumulative myscript.py\`。

### 11.3 优化原则

> 「过早优化是万恶之源。」——Donald Knuth

优化流程：
1. 先写**正确**的代码
2. 用 cProfile **找到**瓶颈（别猜）
3. 只优化瓶颈部分
4. 优化后用 timeit **验证**确实变快了

常见优化方向：
- 算法/数据结构升级（O(n²) → O(n log n)）
- 用内置函数（C 实现，比手写循环快）
- 减少不必要的对象创建
- IO 密集型用协程/多线程
- CPU 密集型用多进程/NumPy/C 扩展

---

## 十二、完整项目结构示例

一个规范的 Python 项目大致结构：

\`\`\`
myapp/
├── pyproject.toml        # 项目配置与依赖
├── README.md
├── .gitignore
├── src/
│   └── myapp/
│       ├── __init__.py
│       ├── main.py
│       └── utils.py
├── tests/
│   ├── __init__.py
│   └── test_utils.py
└── .venv/                # 虚拟环境（不提交）
\`\`\`

\`src/\` 布局避免「测试时误导入当前目录的源码而非安装的包」，是现代推荐做法。

---

## 小结

- **虚拟环境**：\`python -m venv .venv\` 隔离依赖，\`source .venv/bin/activate\` 激活
- **pip**：\`install/list/freeze/show\`，用 \`requirements.txt\` 或 \`pyproject.toml\` 记录依赖
- **现代工具链**：\`pyproject.toml\` 是标准，\`poetry\`/\`uv\` 提升体验，\`uv\` 速度极快
- **字节码**：\`.pyc\` 缓存启动更快，\`__pycache__\` 不提交
- **代码风格**：PEP 8 是基础，\`black\`/\`ruff\` 自动格式化，\`mypy\` 类型检查
- **测试**：\`unittest\` 内置，\`pytest\` 更强大，\`doctest\` 文档即测试
- **调试**：\`breakpoint()\` 进 pdb，\`n/s/c/p\` 命令逐步排查
- **性能**：\`timeit\` 测小片段，\`cProfile\` 找瓶颈，先测后优

工程化能力不会让你写出更聪明的算法，但会让你写出**可维护、可复现、可协作**的代码。这些是团队开发的基础，也是从「会写 Python」到「专业 Python 工程师」的关键一步。
`,
    code: `# ============================================================
# 第四章演示代码：虚拟环境与包管理（概念演示）
# 注意：本文件演示可在代码层面体现的概念与工具用法
# 真正的 venv/pip/black/mypy/pytest 等命令行工具需在终端使用
# 直接运行 python3 此文件即可看到全部输出
# ============================================================

import sys
import os
import timeit
import cProfile
import pstats
import io
import unittest
import doctest

# ------------------------------------------------------------
# 1. 虚拟环境感知
# ------------------------------------------------------------
print("=" * 50)
print("1. 虚拟环境感知")
print("=" * 50)

print("  sys.prefix:", sys.prefix)
print("  sys.executable:", sys.executable)
print("  sys.version:", sys.version.split()[0])
print("  是否在虚拟环境(简判):", sys.prefix != sys.base_prefix)
print("  sys.path 前 3 项:")
for p in sys.path[:3]:
    print("    ", p)


# ------------------------------------------------------------
# 2. __pycache__ 与字节码演示
# ------------------------------------------------------------
print()
print("=" * 50)
print("2. 字节码与 dis")
print("=" * 50)

import dis

def add(a, b):
    return a + b

print("  add 的字节码:")
dis.dis(add)


# ------------------------------------------------------------
# 3. PEP 8 风格示例（好 vs 坏）
# ------------------------------------------------------------
print()
print("=" * 50)
print("3. PEP 8 风格")
print("=" * 50)

# 好的命名
def calculate_total(prices):
    """计算总价"""
    total = 0
    for price in prices:
        total += price
    return total

class ShoppingCart:
    """购物车"""
    MAX_ITEMS = 100   # 常量 UPPER_CASE

    def __init__(self):
        self._items = []   # 私有 _leading_underscore

    def add(self, item):
        self._items.append(item)

print("  calculate_total([10, 20, 30]):", calculate_total([10, 20, 30]))
cart = ShoppingCart()
cart.add("apple")
print("  cart._items:", cart._items)


# ------------------------------------------------------------
# 4. 类型注解示例
# ------------------------------------------------------------
print()
print("=" * 50)
print("4. 类型注解")
print("=" * 50)

from typing import List, Optional, Dict

def greet(name: str, times: int = 1) -> str:
    return ("hello, " + name + "! ") * times

def find_first(items: List[int], target: int) -> Optional[int]:
    for i, x in enumerate(items):
        if x == target:
            return i
    return None

def word_count(text: str) -> Dict[str, int]:
    counts = {}
    for w in text.split():
        counts[w] = counts.get(w, 0) + 1
    return counts

print("  greet:", greet("tom", 2))
print("  find_first:", find_first([1, 2, 3, 2], 2))
print("  word_count:", word_count("a b a c b a"))


# ------------------------------------------------------------
# 5. unittest 测试
# ------------------------------------------------------------
print()
print("=" * 50)
print("5. unittest 测试")
print("=" * 50)

def add(a, b):
    return a + b

class TestAdd(unittest.TestCase):
    def test_add_int(self):
        self.assertEqual(add(1, 2), 3)

    def test_add_negative(self):
        self.assertEqual(add(-1, -2), -3)

    def test_add_string(self):
        self.assertEqual(add("a", "b"), "ab")

    def test_add_float(self):
        self.assertAlmostEqual(add(0.1, 0.2), 0.3, places=7)

# 运行测试套件
suite = unittest.TestLoader().loadTestsFromTestCase(TestAdd)
runner = unittest.TextTestRunner(verbosity=2, stream=sys.stdout)
result = runner.run(suite)
print("  测试通过:", result.wasSuccessful())


# ------------------------------------------------------------
# 6. doctest 文档测试
# ------------------------------------------------------------
print()
print("=" * 50)
print("6. doctest")
print("=" * 50)

def factorial(n):
    """计算阶乘

    >>> factorial(0)
    1
    >>> factorial(5)
    120
    >>> factorial(3)
    6
    """
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

# 运行 doctest
results = doctest.testmod(verbose=False)
print("  doctest 尝试数:", results.attempted)
print("  doctest 失败数:", results.failed)
print("  factorial(5) =", factorial(5))


# ------------------------------------------------------------
# 7. 简易断言测试（模拟 pytest 风格）
# ------------------------------------------------------------
print()
print("=" * 50)
print("7. 简易断言测试")
print("=" * 50)

def test_add_int():
    assert add(1, 2) == 3
    print("  test_add_int 通过")

def test_add_string():
    assert add("a", "b") == "ab"
    print("  test_add_string 通过")

def test_add_raises():
    try:
        add(1, "a")
        print("  test_add_raises 失败：未抛异常")
    except TypeError:
        print("  test_add_raises 通过：正确抛 TypeError")

test_add_int()
test_add_string()
test_add_raises()


# ------------------------------------------------------------
# 8. 参数化测试（模拟）
# ------------------------------------------------------------
print()
print("=" * 50)
print("8. 参数化测试")
print("=" * 50)

cases = [
    (1, 2, 3),
    (-1, -2, -3),
    (0, 0, 0),
    (100, 200, 300),
]

for a, b, expected in cases:
    result = add(a, b)
    status = "通过" if result == expected else "失败"
    print("  add(%d, %d) == %d  %s" % (a, b, expected, status))


# ------------------------------------------------------------
# 9. timeit 测时
# ------------------------------------------------------------
print()
print("=" * 50)
print("9. timeit 测时")
print("=" * 50)

t1 = timeit.timeit('"-".join(["a","b","c"])', number=100000)
t2 = timeit.timeit('"a" + "-" + "b" + "-" + "c"', number=100000)
print("  join 方式: %.4f 秒" % t1)
print("  + 方式:   %.4f 秒" % t2)
print("  join 比 + 快 %.1f 倍" % (t2 / t1))


# ------------------------------------------------------------
# 10. cProfile 性能剖析
# ------------------------------------------------------------
print()
print("=" * 50)
print("10. cProfile")
print("=" * 50)

def slow_func():
    total = 0
    for i in range(10000):
        total += i
    return total

def fast_func():
    return sum(range(10000))

def main_profile():
    for _ in range(50):
        slow_func()
    for _ in range(50):
        fast_func()

# 剖析并打印 top 5
pr = cProfile.Profile()
pr.enable()
main_profile()
pr.disable()

s = io.StringIO()
ps = pstats.Stats(pr, stream=s).sort_stats("cumulative")
ps.print_stats(5)
print(s.getvalue())


# ------------------------------------------------------------
# 11. requirements.txt 内容示例
# ------------------------------------------------------------
print()
print("=" * 50)
print("11. requirements.txt 示例")
print("=" * 50)

requirements_content = """requests==2.31.0
flask==3.0.0
numpy>=1.24,<2.0
pytest>=7.0
mypy>=1.0
ruff>=0.1
"""
print("  典型 requirements.txt 内容:")
for line in requirements_content.strip().split("\\n"):
    print("    ", line)


# ------------------------------------------------------------
# 12. pyproject.toml 内容示例
# ------------------------------------------------------------
print()
print("=" * 50)
print("12. pyproject.toml 示例")
print("=" * 50)

pyproject_content = """[project]
name = "myapp"
version = "0.1.0"
requires-python = ">=3.9"
dependencies = [
    "requests>=2.28",
    "flask>=3.0",
]

[project.optional-dependencies]
dev = ["pytest>=7.0", "mypy>=1.0", "ruff>=0.1"]

[tool.ruff]
line-length = 100

[tool.mypy]
strict = true
"""
print("  典型 pyproject.toml 内容:")
for line in pyproject_content.strip().split("\\n"):
    print("    ", line)


# ------------------------------------------------------------
# 13. .gitignore 示例
# ------------------------------------------------------------
print()
print("=" * 50)
print("13. .gitignore 示例")
print("=" * 50)

gitignore_content = """.venv/
venv/
__pycache__/
*.pyc
*.pyo
.pytest_cache/
.mypy_cache/
.ruff_cache/
*.egg-info/
dist/
build/
"""
print("  典型 .gitignore 内容:")
for line in gitignore_content.strip().split("\\n"):
    print("    ", line)


# ------------------------------------------------------------
# 14. pdb 调试示例（不真正进入交互）
# ------------------------------------------------------------
print()
print("=" * 50)
print("14. pdb 调试概念")
print("=" * 50)

def buggy(x):
    y = x * 2
    # 实际调试时这里写 breakpoint()
    # breakpoint()
    z = y + 1
    return z

print("  buggy(5) =", buggy(5))
print("  调试时在代码里写 breakpoint() 即可进入 pdb")
print("  常用命令: n(下一步) s(步入) c(继续) p 变量(打印) q(退出)")


# ------------------------------------------------------------
# 15. 模拟优化对比
# ------------------------------------------------------------
print()
print("=" * 50)
print("15. 优化对比")
print("=" * 50)

# 慢写法：手动循环累加
def sum_loop(n):
    total = 0
    for i in range(n):
        total += i
    return total

# 快写法：内置 sum
def sum_builtin(n):
    return sum(range(n))

t_loop = timeit.timeit(lambda: sum_loop(10000), number=1000)
t_builtin = timeit.timeit(lambda: sum_builtin(10000), number=1000)
print("  手动循环: %.4f 秒" % t_loop)
print("  内置 sum: %.4f 秒" % t_builtin)
print("  内置快 %.1f 倍" % (t_loop / t_builtin))
print("  结论：优先用内置函数（C 实现）")

print()
print("全部演示完成！")
`,
  },
];
