// =============================================================
// Python 逐层深入教程 - batch6
// 章节 49-58：函数式编程与高级特性
//   装饰器进阶 / 上下文管理器 / 描述符 / 元类 / 拷贝 / 哈希 / 反射
// =============================================================

export const chapters = [
  // -----------------------------------------------------------
  // 第 49 章：函数式编程思想
  // -----------------------------------------------------------
  {
    id: "py9-49",
    group: "函数式与高级特性",
    icon: "λ",
    title: "函数式编程思想：纯函数与不可变",
    content: `## 函数式编程是什么

Python 不是纯函数式语言，但支持函数式风格。核心思想：

1. **函数是一等公民**：能赋值、传参、返回
2. **纯函数**：同样的输入永远同样的输出，不修改外部状态
3. **不可变数据**：不修改原数据，返回新数据
4. **声明式**：说"要什么"，不说"怎么做"

## 纯函数 vs 有副作用

\`\`\`python
# 纯函数：只依赖输入，不改外部
def add(a, b):  # 定义函数 add，参数：a, b
    return a + b  # 返回 a + b

# 有副作用：改了全局变量
total = 0  # 定义数值 total
def add_to_total(x):  # 定义函数 add_to_total，参数：x
    global total  # 声明全局变量 total
    total += x    # 改外部状态，有副作用
\`\`\`

纯函数好处：好测试、好调试、可并行、可缓存。

## 不可变数据

\`\`\`python
# 不可变风格：不改原列表，返回新的
nums = [3, 1, 4, 1, 5]  # 定义列表 nums
new_nums = sorted(nums)    # sorted 返回新的，不改原的
# nums 还是 [3, 1, 4, 1, 5]

# 可变风格（不推荐）
nums.sort()                # 改原列表
\`\`\`

函数式偏好"返回新数据"，而不是"修改原数据"。

## 函数组合

把小函数组合成大函数：

\`\`\`python
def compose(f, g):  # 定义函数 compose，参数：f, g
    """f(g(x))"""  # 执行操作
    return lambda x: f(g(x))  # 返回 lambda x: f(g(x))

add_one = lambda x: x + 1  # 定义 lambda 函数，赋给 add_one
double = lambda x: x * 2  # 定义 lambda 函数，赋给 double
add_one_then_double = compose(double, add_one)  # 赋值变量 add_one_then_double
add_one_then_double(3)    # 8 = (3+1)*2
\`\`\`

## 偏函数 functools.partial

固定部分参数，造个新函数：

\`\`\`python
from functools import partial  # 从 functools 导入 partial
int2 = partial(int, base=2)      # 固定 base=2
int2("1010")                     # 10
\`\`\`

## 不可变数据结构

元组是不可变列表，\`frozenset\` 是不可变集合。第三方库 \`pyrsistent\` 提供不可变字典等。

## 函数式 vs 命令式

\`\`\`python
# 命令式：怎么做
result = []  # 定义列表 result
for x in nums:  # 遍历 nums，取值给 x
    if x > 0:  # 如果 x > 0
        result.append(x ** 2)  # 调用 result.append()：向列表末尾添加元素

# 函数式：要什么
result = list(map(lambda x: x**2, filter(lambda x: x > 0, nums)))  # 赋值变量 result

# Pythonic：推导式（融合两者）
result = [x**2 for x in nums if x > 0]  # 定义列表 result
\`\`\`

Python 推荐**推导式**，既有函数式的简洁，又好读。

## 本章 demo

demo 演示纯函数、不可变、组合、partial。`,
    code: `# ============================================
# 第 49 章：函数式编程思想
# ============================================
from functools import partial, reduce

# --- 1. 纯函数 vs 副作用 ---
print("=== 1. 纯函数 ===")
def add_pure(a, b):
    """纯函数：不改外部"""
    return a + b

total = 0
def add_side_effect(x):
    """有副作用：改全局"""
    global total
    total += x
    return total

print(f"  纯函数 add(2,3) 多次调用: {add_pure(2,3)}, {add_pure(2,3)}, {add_pure(2,3)}    ← 结果稳定")
print(f"  副作用函数 第一次: {add_side_effect(5)}")
print(f"  副作用函数 第二次: {add_side_effect(5)}    ← 结果变了！")

# --- 2. 不可变风格 ---
print("\\n=== 2. 不可变 ===")
nums = [3, 1, 4, 1, 5, 9, 2, 6]

# 不可变：返回新的
sorted_nums = sorted(nums)
print(f"  原始: {nums}")
print(f"  sorted 返回新的: {sorted_nums}    ← 原始没变: {nums}")

# 可变：改原数据
nums_copy = nums.copy()
nums_copy.sort()
print(f"  sort 改原数据: {nums_copy}")

# 函数式风格：不改原数据，每步返回新的
def square_list(lst):
    return [x**2 for x in lst]    # 返回新的

def filter_positive(lst):
    return [x for x in lst if x > 0]

original = [-2, 3, -1, 4]
step1 = filter_positive(original)
step2 = square_list(step1)
print(f"  原始: {original} → 过滤: {step1} → 平方: {step2}")
print(f"  原始始终没变: {original}")

# --- 3. 函数组合 ---
print("\\n=== 3. 函数组合 ===")
def compose(*funcs):
    """从右到左组合: compose(f, g, h)(x) = f(g(h(x)))"""
    def composed(x):
        return reduce(lambda acc, f: f(acc), reversed(funcs), x)
    return composed

def add_one(x): return x + 1
def double(x): return x * 2
def square(x): return x ** 2

# square(double(add_one(x)))
pipeline = compose(square, double, add_one)
print(f"  compose(square, double, add_one)(3) = {pipeline(3)}")
print(f"    计算: 3 → +1=4 → *2=8 → ²=64")

# --- 4. 偏函数 partial ---
print("\\n=== 4. partial ===")
# 固定部分参数
int2 = partial(int, base=2)       # 二进制转 int
int8 = partial(int, base=8)       # 八进制
int16 = partial(int, base=16)     # 十六进制

print(f"  int2('1010') = {int2('1010')}    ← 二进制 1010")
print(f"  int8('17') = {int8('17')}    ← 八进制 17")
print(f"  int16('FF') = {int16('FF')}    ← 十六进制 FF")

# 固定 print 的参数
debug = partial(print, "[DEBUG]")
debug("开始处理")
debug("处理完成")

# 造乘法器
multiply_by_10 = partial(lambda a, b: a * b, 10)
print(f"  multiply_by_10(5) = {multiply_by_10(5)}")

# --- 5. 三种风格对比 ---
print("\\n=== 5. 风格对比 ===")
nums = [-3, 1, -5, 2, -1, 4, -2, 5]

# 命令式
result1 = []
for x in nums:
    if x > 0:
        result1.append(x ** 2)

# 函数式
result2 = list(map(lambda x: x**2, filter(lambda x: x > 0, nums)))

# Pythonic（推荐）
result3 = [x**2 for x in nums if x > 0]

print(f"  命令式: {result1}")
print(f"  函数式: {result2}")
print(f"  推导式: {result3}    ← 推荐")

# --- 6. 高阶函数组合实战 ---
print("\\n=== 6. 组合实战 ===")
def process_data(data, *operations):
    """对数据依次应用多个操作"""
    result = data
    for op in operations:
        result = op(result)
    return result

data = [1, -2, 3, -4, 5, -6]
result = process_data(
    data,
    partial(filter, lambda x: x > 0),   # 留正数
    partial(map, lambda x: x ** 2),      # 平方
    list,                                 # 转列表
    partial(sorted, reverse=True),        # 降序
)
print(f"  原始: {data}")
print(f"  正数→平方→降序: {result}")

# --- 7. 不可变更新（模拟）---
print("\\n=== 7. 不可变更新 ===")
def update_dict(d, **changes):
    """返回新字典，不改原的"""
    new = dict(d)
    new.update(changes)
    return new

user = {"name": "小明", "age": 18}
user2 = update_dict(user, age=19, city="北京")
print(f"  原始: {user}    ← 没变")
print(f"  新的: {user2}    ← 改了")

# --- 8. 函数式工具：pipe 风格 ---
print("\\n=== 8. pipe 风格 ===")
class Pipe:
    """让函数链式调用像管道"""
    def __init__(self, value):
        self.value = value
    def __or__(self, func):
        return Pipe(func(self.value))
    def __ror__(self, func):
        return Pipe(func(self.value))
    def result(self):
        return self.value

# 用 | 把函数串起来
result = (
    Pipe([-3, 1, -5, 2, -1, 4])
    | (lambda xs: [x for x in xs if x > 0])    # 过滤
    | (lambda xs: [x ** 2 for x in xs])        # 平方
    | sum                                       # 求和
    | (lambda x: x * 2)                         # 翻倍
).result()
print(f"  pipe: [-3,1,-5,2,-1,4] → 正数 → 平方 → 求和 → 翻倍 = {result}")`
  },

  // -----------------------------------------------------------
  // 第 50 章：装饰器进阶
  // -----------------------------------------------------------
  {
    id: "py9-50",
    group: "函数式与高级特性",
    icon: "🎀",
    title: "装饰器进阶：类装饰器、带参、堆叠",
    content: `## 装饰器不只是函数装饰器

第 29 章讲了基础装饰器。这章深入：类装饰器、带参装饰器、装饰类、堆叠、常见模式。

## 类装饰器

用类实现装饰器，\`__init__\` 接收被装饰函数，\`__call__\` 实现 wrapper：

\`\`\`python
class CallCount:  # 定义类 CallCount
    def __init__(self, func):  # 定义函数 __init__，参数：self, func
        self.func = func  # 执行操作
        self.count = 0  # 执行操作
    def __call__(self, *args, **kwargs):  # 定义函数 __call__，参数：self, *args, **kwargs
        self.count += 1  # 执行操作
        print(f"第 {self.count} 次调用")  # 打印输出到屏幕
        return self.func(*args, **kwargs)  # 返回 self.func(*args, **kwargs)

@CallCount  # 应用装饰器 CallCount
def hello():  # 定义函数 hello
    print("hi")  # 打印输出到屏幕
\`\`\`

类装饰器好处：能存状态（\`self.count\`）。

## 装饰类（给类加功能）

装饰器也能装饰类：

\`\`\`python
def add_repr(cls):  # 定义函数 add_repr，参数：cls
    def __repr__(self):  # 定义函数 __repr__，参数：self
        return f"{cls.__name__}({vars(self)})"  # 返回 f"{cls.__name__}({vars(self)})"
    cls.__repr__ = __repr__  # 执行操作
    return cls  # 返回 cls

@add_repr  # 应用装饰器 add_repr
class Point:  # 定义类 Point
    def __init__(self, x, y):  # 定义函数 __init__，参数：self, x, y
        self.x, self.y = x, y  # 执行操作
\`\`\`

## 带参数的装饰器（回顾+深入）

三层嵌套：

\`\`\`python
def repeat(n):              # 第1层：接收参数
    def decorator(func):    # 第2层：接收函数
        def wrapper(*a, **kw):  # 第3层：实际包装
            for _ in range(n):  # 遍历 range(n)，取值给 _
                func(*a, **kw)  # 调用 func()
        return wrapper  # 返回 wrapper
    return decorator  # 返回 decorator

@repeat(3)  # 应用装饰器 repeat
def hi(): print("hi")  # 定义函数 hi
\`\`\`

## 装饰器堆叠顺序

\`\`\`python
@A  # 应用装饰器 A
@B  # 应用装饰器 B
@C  # 应用装饰器 C
def f(): pass  # 定义函数 f

# 等价于：f = A(B(C(f)))
\`\`\`

**从下往上装饰，从上往下执行**。调用 \`f\` 时，A 的 wrapper 先跑，再调 B 的，再调 C 的，最后才是原函数。

## 常见模式

### 1. 重试

\`\`\`python
def retry(times):  # 定义函数 retry，参数：times
    def decorator(func):  # 定义函数 decorator，参数：func
        @wraps(func)  # 应用装饰器 wraps
        def wrapper(*a, **kw):  # 定义函数 wrapper，参数：*a, **kw
            for i in range(times):  # 遍历 range(times)，取值给 i
                try:  # 尝试执行可能出错的代码
                    return func(*a, **kw)  # 返回 func(*a, **kw)
                except Exception:  # 捕获异常 Exception:
                    if i == times - 1:  # 如果 i == times - 1
                        raise  # 重新抛出异常
        return wrapper  # 返回 wrapper
    return decorator  # 返回 decorator
\`\`\`

### 2. 限流

\`\`\`python
def rate_limit(calls, period):  # 定义函数 rate_limit，参数：calls, period
    """每 period 秒最多 calls 次"""  # 执行操作
    ...  # 执行操作
\`\`\`

### 3. 类型检查

\`\`\`python
def type_check(**types):  # 定义函数 type_check，参数：**types
    def decorator(func):  # 定义函数 decorator，参数：func
        @wraps(func)  # 应用装饰器 wraps
        def wrapper(*a, **kw):  # 定义函数 wrapper，参数：*a, **kw
            for (name, val), (_, typ) in zip(zip(func.__code__.co_varnames, a), types.items()):  # 调用 for()
                if not isinstance(val, typ):  # 如果 not isinstance(val, typ)
                    raise TypeError(f"{name} 必须是 {typ}")  # 抛出异常：TypeError(f"{name} 必须是 {typ}")
            return func(*a, **kw)  # 返回 func(*a, **kw)
        return wrapper  # 返回 wrapper
    return decorator  # 返回 decorator
\`\`\`

## 本章 demo

demo 演示类装饰器、带参、堆叠、重试。`,
    code: `# ============================================
# 第 50 章：装饰器进阶
# ============================================
import time
from functools import wraps

# --- 1. 类装饰器（带状态）---
print("=== 1. 类装饰器 ===")
class CallCount:
    """统计函数被调用几次"""
    def __init__(self, func):
        self.func = func
        self.count = 0
        wraps(func)(self)    # 保留原函数信息

    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"  [第 {self.count} 次调用 {self.func.__name__}]")
        return self.func(*args, **kwargs)

@CallCount
def greet(name):
    """打招呼"""
    return f"你好，{name}"

greet("小明")
greet("小红")
greet("小刚")
print(f"  总共调用了 {greet.count} 次")

# --- 2. 装饰类 ---
print("\\n=== 2. 装饰类 ===")
def add_repr(cls):
    """给类加 __repr__"""
    def __repr__(self):
        attrs = ", ".join(f"{k}={v!r}" for k, v in vars(self).items())
        return f"{cls.__name__}({attrs})"
    cls.__repr__ = __repr__
    return cls

@add_repr
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(3, 4)
print(f"  {p}    ← 自动加了 __repr__")

# --- 3. 带参装饰器：重试 ---
print("\\n=== 3. 重试装饰器 ===")
def retry(times=3, delay=0):
    """失败重试"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_error = None
            for i in range(times):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_error = e
                    print(f"  第 {i+1} 次失败: {e}")
                    if delay:
                        time.sleep(delay)
            raise last_error
        return wrapper
    return decorator

import random

@retry(times=5)
def unreliable():
    """50% 概率失败"""
    if random.random() < 0.5:
        raise ValueError("随机失败")
    return "成功"

for i in range(3):
    try:
        result = unreliable()
        print(f"  尝试 {i+1}: {result}")
    except ValueError:
        print(f"  尝试 {i+1}: 全部失败")

# --- 4. 装饰器堆叠 ---
print("\\n=== 4. 堆叠顺序 ===")
def deco_a(func):
    @wraps(func)
    def wrapper(*a, **kw):
        print("  A 前", end=" → ")
        result = func(*a, **kw)
        print(" → A 后")
        return result
    return wrapper

def deco_b(func):
    @wraps(func)
    def wrapper(*a, **kw):
        print("  B 前", end=" → ")
        result = func(*a, **kw)
        print(" → B 后", end="")
        return result
    return wrapper

def deco_c(func):
    @wraps(func)
    def wrapper(*a, **kw):
        print("  C 前", end=" → ")
        result = func(*a, **kw)
        print(" → C 后", end="")
        return result
    return wrapper

@deco_a
@deco_b
@deco_c
def hi():
    print("  原函数", end="")

print("  调用 hi():")
hi()
print("\\n  → 装饰从下往上（C先套），执行从外到内（A先跑）")

# --- 5. 类型检查装饰器 ---
print("\\n=== 5. 类型检查 ===")
def type_check(**types):
    """检查参数类型"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # 检查位置参数
            for (name, val), (arg_name, typ) in zip(
                zip(func.__code__.co_varnames, args), types.items()
            ):
                if not isinstance(val, typ):
                    raise TypeError(f"{arg_name} 应为 {typ.__name__}，收到 {type(val).__name__}")
            return func(*args, **kwargs)
        return wrapper
    return decorator

@type_check(a=int, b=int)
def add_ints(a, b):
    return a + b

print(f"  add_ints(1, 2) = {add_ints(1, 2)}")
try:
    add_ints(1, "2")
except TypeError as e:
    print(f"  add_ints(1, '2') → {e}")

# --- 6. 缓存装饰器（带 TTL）---
print("\\n=== 6. 带 TTL 的缓存 ===")
def cached(ttl=10):
    """带过期时间的缓存（ttl 秒）"""
    def decorator(func):
        cache = {}
        @wraps(func)
        def wrapper(*args):
            now = time.time()
            if args in cache:
                result, ts = cache[args]
                if now - ts < ttl:
                    print(f"    [缓存命中 {args}]")
                    return result
            print(f"    [重新计算 {args}]")
            result = func(*args)
            cache[args] = (result, now)
            return result
        return wrapper
    return decorator

@cached(ttl=10)
def slow_compute(x):
    time.sleep(0.1)    # 模拟慢计算
    return x ** 2

print("  第一次 slow_compute(5):")
print(f"    = {slow_compute(5)}")
print("  第二次 slow_compute(5):")
print(f"    = {slow_compute(5)}    ← 命中缓存")

# --- 7. 实用：日志装饰器 ---
print("\\n=== 7. 日志装饰器 ===")
def log(level="INFO"):
    """带日志级别的装饰器"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            print(f"  [{level}] 调用 {func.__name__}({args}, {kwargs})")
            try:
                result = func(*args, **kwargs)
                print(f"  [{level}] {func.__name__} 返回 {result}")
                return result
            except Exception as e:
                print(f"  [ERROR] {func.__name__} 抛出 {e}")
                raise
        return wrapper
    return decorator

@log("DEBUG")
def divide(a, b):
    return a / b

print(divide(10, 2))
try:
    divide(10, 0)
except ZeroDivisionError:
    pass

# --- 8. functools.wraps 详解 ---
print("\\n=== 8. wraps 的作用 ===")
def no_wraps(func):
    def wrapper(*a, **kw):
        return func(*a, **kw)
    return wrapper

@no_wraps
def func1():
    """func1 的文档"""
    pass

def with_wraps(func):
    @wraps(func)
    def wrapper(*a, **kw):
        return func(*a, **kw)
    return wrapper

@with_wraps
def func2():
    """func2 的文档"""
    pass

print(f"  不用 wraps: __name__={func1.__name__}, __doc__={func1.__doc__}")
print(f"  用 wraps:   __name__={func2.__name__}, __doc__={func2.__doc__}")`
  },

  // -----------------------------------------------------------
  // 第 51 章：上下文管理器
  // -----------------------------------------------------------
  {
    id: "py9-51",
    group: "函数式与高级特性",
    icon: "📥",
    title: "上下文管理器：with 语句的本质",
    content: `## with 不只是用来开文件

\`with\` 语句保证"进入"和"退出"时各做一件事，**即使出错也会做退出操作**。最常见是文件：

\`\`\`python
with open("file.txt") as f:  # 使用上下文管理器：open("file.txt") as f
    data = f.read()  # 赋值变量 data
# 即使 read 出错，文件也会关闭
\`\`\`

\`with\` 的本质是**上下文管理器协议**：实现 \`__enter__\` 和 \`__exit__\`。

## 协议

\`\`\`python
class MyContext:  # 定义类 MyContext
    def __enter__(self):  # 定义函数 __enter__，参数：self
        print("进入")  # 打印输出到屏幕
        return self           # as 变量接到的值
    def __exit__(self, exc_type, exc_val, exc_tb):  # 定义函数 __exit__，参数：self, exc_type, exc_val, exc_tb
        print("退出")  # 打印输出到屏幕
        return False          # 不吞异常

with MyContext() as x:  # 使用上下文管理器：MyContext() as x
    print("块内")  # 打印输出到屏幕
\`\`\`

输出：
\`\`\`
进入
块内
退出
\`\`\`

## __exit__ 的参数

\`\`\`python
def __exit__(self, exc_type, exc_val, exc_tb):  # 定义函数 __exit__，参数：self, exc_type, exc_val, exc_tb
    # exc_type: 异常类型（None 表示没异常）
    # exc_val: 异常对象
    # exc_tb: traceback
\`\`\`

- 返回 \`False\`（或 None）：异常继续传播
- 返回 \`True\`：**吞掉异常**（一般别这么干）

## contextlib：用生成器写

不用写类，用 \`@contextmanager\` 装饰器：

\`\`\`python
from contextlib import contextmanager  # 从 contextlib 导入 contextmanager

@contextmanager  # 应用装饰器 contextmanager
def my_context():  # 定义函数 my_context
    print("进入")  # 打印输出到屏幕
    try:  # 尝试执行可能出错的代码
        yield "资源"        # yield 前是 __enter__，后是 __exit__
    finally:  # 无论是否异常都执行
        print("退出")  # 打印输出到屏幕

with my_context() as x:  # 使用上下文管理器：my_context() as x
    print(f"拿到 {x}")  # 打印输出到屏幕
\`\`\`

简单场景用 \`contextmanager\` 更方便。

## 实用场景

1. **文件**（自带）
2. **数据库连接/事务**
3. **锁**（\`threading.Lock\`）
4. **重定向 stdout**
5. **计时**

\`\`\`python
import time
from contextlib import contextmanager
@contextmanager  # 应用装饰器 contextmanager
def timer(name):  # 定义函数 timer，参数：name
    start = time.time()  # 赋值变量 start
    try:  # 尝试执行可能出错的代码
        yield  # 生成器
    finally:  # 无论是否异常都执行
        print(f"{name} 耗时 {time.time()-start:.3f}s")  # 打印输出到屏幕

with timer("处理"):  # 使用上下文管理器：timer("处理")
    time.sleep(0.5)  # 调用 time.sleep()：休眠
\`\`\`

## 嵌套 with

\`\`\`python
with open("in") as fin, open("out", "w") as fout:  # 使用上下文管理器：open("in") as fin, open("out", "w") as fout
    fout.write(fin.read())  # 调用 fout.write()：写入
\`\`\`

等价于两个嵌套 \`with\`。

## 本章 demo

demo 实现自定义上下文管理器、计时器、临时重定向。`,
    code: `# ============================================
# 第 51 章：上下文管理器
# ============================================
import time
import sys
from contextlib import contextmanager

# --- 1. with 的本质 ---
print("=== 1. with 协议 ===")
class MyContext:
    def __init__(self, name):
        self.name = name
    def __enter__(self):
        print(f"  [进入] {self.name}")
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        print(f"  [退出] {self.name}")
        if exc_type:
            print(f"  [异常] {exc_type.__name__}: {exc_val}")
        return False    # 不吞异常

print("  正常情况:")
with MyContext("A") as ctx:
    print(f"    块内，拿到 {ctx.name}")

print("\\n  出错情况:")
try:
    with MyContext("B") as ctx:
        print(f"    块内")
        raise ValueError("故意的")
except ValueError:
    print("  异常被捕获（__exit__ 还是执行了）")

# --- 2. contextmanager 装饰器 ---
print("\\n=== 2. contextmanager ===")
@contextmanager
def my_context(name):
    """用生成器写上下文管理器"""
    print(f"  [进入] {name}")
    try:
        yield f"资源-{name}"    # yield 前是 __enter__，yield 的值给 as
    finally:
        print(f"  [退出] {name}")

with my_context("X") as x:
    print(f"  拿到 {x}")

# --- 3. 计时器 ---
print("\\n=== 3. 计时器 ===")
@contextmanager
def timer(name):
    """计时上下文"""
    start = time.time()
    try:
        yield
    finally:
        elapsed = time.time() - start
        print(f"  ⏱ {name} 耗时 {elapsed:.4f}s")

with timer("累加 100 万"):
    total = sum(range(1_000_000))
print(f"  结果: {total}")

# --- 4. 数据库模拟 ---
print("\\n=== 4. 数据库事务模拟 ===")
class FakeDB:
    def __init__(self):
        self.connected = False
    def connect(self):
        self.connected = True
        print("  [DB] 已连接")
    def close(self):
        self.connected = False
        print("  [DB] 已关闭")
    def query(self, sql):
        if not self.connected:
            raise RuntimeError("未连接")
        print(f"  [DB] 执行: {sql}")
        return f"结果({sql})"

@contextmanager
def db_transaction(db):
    """事务：出错就回滚"""
    db.connect()
    try:
        yield db
        print("  [DB] 提交事务")
    except Exception as e:
        print(f"  [DB] 回滚事务: {e}")
        raise
    finally:
        db.close()

db = FakeDB()
print("  正常:")
with db_transaction(db) as conn:
    conn.query("SELECT 1")
    conn.query("SELECT 2")

print("\\n  出错:")
try:
    with db_transaction(db) as conn:
        conn.query("SELECT 1")
        raise ValueError("业务出错")
except ValueError:
    pass

# --- 5. 临时重定向 stdout ---
print("\\n=== 5. 临时重定向 ===")
@contextmanager
def redirect_stdout(new_target):
    """临时把 print 重定向到别处"""
    old = sys.stdout
    sys.stdout = new_target
    try:
        yield
    finally:
        sys.stdout = old

import io
buffer = io.StringIO()
print("  这行正常显示")
with redirect_stdout(buffer):
    print("  这行被重定向到 buffer")
    print("  这行也是")
print("  这行又正常了")
print(f"  buffer 内容: {buffer.getvalue().strip()}")

# --- 6. 锁模拟 ---
print("\\n=== 6. 锁模拟 ===")
class FakeLock:
    def __init__(self, name):
        self.name = name
        self.locked = False
    def acquire(self):
        self.locked = True
        print(f"  [锁] {self.name} 已获取")
    def release(self):
        self.locked = False
        print(f"  [锁] {self.name} 已释放")

@contextmanager
def locked(lock):
    lock.acquire()
    try:
        yield lock
    finally:
        lock.release()

lock = FakeLock("资源A")
with locked(lock):
    print(f"  使用资源（锁定={lock.locked}）")
print(f"  退出后（锁定={lock.locked}）")

# --- 7. 嵌套 with ---
print("\\n=== 7. 嵌套 ===")
import tempfile, os

# 一行写嵌套
in_path = tempfile.mktemp(suffix=".in")
out_path = tempfile.mktemp(suffix=".out")
with open(in_path, "w") as f:
    f.write("hello\\nworld\\n")

with open(in_path) as fin, open(out_path, "w") as fout:
    for line in fin:
        fout.write(line.upper())

with open(out_path) as f:
    print(f"  转大写后: {f.read().strip()}")
os.unlink(in_path)
os.unlink(out_path)

# --- 8. 临时改变工作目录 ---
print("\\n=== 8. 临时改变状态 ===")
@contextmanager
def temporary_value(obj, attr, new_value):
    """临时改对象属性，退出恢复"""
    old = getattr(obj, attr)
    setattr(obj, attr, new_value)
    try:
        yield
    finally:
        setattr(obj, attr, old)

class Config:
    debug = False

print(f"  原始 debug: {Config.debug}")
with temporary_value(Config, "debug", True):
    print(f"  临时 debug: {Config.debug}    ← 改了")
print(f"  退出后 debug: {Config.debug}    ← 恢复了")

# --- 9. contextlib 其他工具 ---
print("\\n=== 9. contextlib 其他 ===")
from contextlib import suppress, ExitStack

# suppress：忽略特定异常
print("  suppress:")
with suppress(FileNotFoundError):
    os.remove("/不存在/的/文件")
    print("    不会执行")
print("    → FileNotFoundError 被忽略，继续执行")

# ExitStack：动态管理多个上下文
print("  ExitStack:")
files = []
with ExitStack() as stack:
    for i in range(3):
        f = stack.enter_context(open(tempfile.mktemp(), "w"))
        f.write(f"文件 {i}")
        files.append(f.name)
    print(f"    创建了 {len(files)} 个文件")
    # 退出时自动全部关闭
print("    退出后所有文件已关闭")`
  },

  // -----------------------------------------------------------
  // 第 52 章：描述符
  // -----------------------------------------------------------
  {
    id: "py9-52",
    group: "函数式与高级特性",
    icon: "🔬",
    title: "描述符：property 的底层原理",
    content: `## 描述符是什么

\`property\` 的底层就是描述符。**描述符**是一个类，实现 \`__get__\`、\`__set__\`、\`__delete__\` 中的至少一个，作为**类属性**使用时能控制访问。

\`\`\`python
class Validated:  # 定义类 Validated
    def __set_name__(self, owner, name):  # 定义函数 __set_name__，参数：self, owner, name
        self.name = name  # 执行操作
    def __get__(self, obj, objtype):  # 定义函数 __get__，参数：self, obj, objtype
        return obj.__dict__.get(self.name)  # 返回 obj.__dict__.get(self.name)
    def __set__(self, obj, value):  # 定义函数 __set__，参数：self, obj, value
        if value < 0:  # 如果 value < 0
            raise ValueError("不能为负")  # 抛出异常：ValueError("不能为负")
        obj.__dict__[self.name] = value  # 执行操作

class Student:  # 定义类 Student
    score = Validated()    # 描述符作为类属性

s = Student()  # 赋值变量 s
s.score = 90              # 调 __set__
s.score                   # 调 __get__
s.score = -1              # 抛 ValueError
\`\`\`

## 协议方法

\`\`\`python
class Descriptor:  # 定义类 Descriptor
    def __get__(self, obj, objtype=None):  # 定义函数 __get__，参数：self, obj, objtype=None
        # 访问 obj.attr 时调用
        # obj 是实例（None 表示通过类访问）
    def __set__(self, obj, value):  # 定义函数 __set__，参数：self, obj, value
        # obj.attr = value 时调用
    def __delete__(self, obj):  # 定义函数 __delete__，参数：self, obj
        # del obj.attr 时调用
\`\`\`

- 同时有 \`__get__\` 和 \`__set__\`：**数据描述符**（优先级最高）
- 只有 \`__get__\`：**非数据描述符**（被实例属性覆盖）

## 为什么用描述符

1. **复用校验逻辑**：写一个 \`Validated\`，多个属性都能用
2. **实现 ORM**：Django/SQLAlchemy 的字段就是描述符
3. **理解 property**：property 是描述符的语法糖

## property 等价的描述符

\`\`\`python
class Property:  # 定义类 Property
    def __init__(self, fget=None, fset=None):  # 定义函数 __init__，参数：self, fget=None, fset=None
        self.fget = fget  # 执行操作
        self.fset = fset  # 执行操作
    def __get__(self, obj, objtype=None):  # 定义函数 __get__，参数：self, obj, objtype=None
        if obj is None:  # 如果 obj is None
            return self  # 返回 self
        return self.fget(obj)  # 返回 self.fget(obj)
    def __set__(self, obj, value):  # 定义函数 __set__，参数：self, obj, value
        if self.fset is None:  # 如果 self.fset is None
            raise AttributeError("不可设置")  # 抛出异常：AttributeError("不可设置")
        self.fset(obj, value)  # 调用 self.fset()
\`\`\`

## __set_name__

Python 3.6+ 的 \`__set_name__\` 让描述符知道自己叫什么名字（不用手动传名字）。

## 本章 demo

demo 实现校验描述符、类型检查描述符。`,
    code: `# ============================================
# 第 52 章：描述符
# ============================================

# --- 1. 最简单的描述符 ---
print("=== 1. 基本描述符 ===")
class NonNegative:
    """非负数描述符"""
    def __set_name__(self, owner, name):
        # 创建时自动调用，name 是属性名
        self.name = name
        self.internal = f"_{name}"

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self    # 类访问返回描述符自己
        return getattr(obj, self.internal, 0)

    def __set__(self, obj, value):
        if value < 0:
            raise ValueError(f"{self.name} 不能为负，收到 {value}")
        setattr(obj, self.internal, value)

class Student:
    score = NonNegative()      # 描述符作为类属性
    age = NonNegative()

s = Student()
s.score = 90                   # 调 __set__
s.age = 18
print(f"  s.score = {s.score}")
print(f"  s.age = {s.age}")

try:
    s.score = -10
except ValueError as e:
    print(f"  s.score = -10 → {e}")

# --- 2. 类型检查描述符 ---
print("\\n=== 2. 类型检查 ===")
class TypedField:
    """类型检查描述符"""
    def __init__(self, expected_type):
        self.expected_type = expected_type

    def __set_name__(self, owner, name):
        self.name = name
        self.internal = f"_{name}"

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.internal, None)

    def __set__(self, obj, value):
        if not isinstance(value, self.expected_type):
            raise TypeError(
                f"{self.name} 应为 {self.expected_type.__name__}，"
                f"收到 {type(value).__name__}"
            )
        setattr(obj, self.internal, value)

class User:
    name = TypedField(str)
    age = TypedField(int)
    email = TypedField(str)

u = User()
u.name = "小明"
u.age = 18
u.email = "xm@example.com"
print(f"  {u.name}, {u.age}岁, {u.email}")

try:
    u.age = "十八"
except TypeError as e:
    print(f"  u.age = '十八' → {e}")

try:
    u.name = 123
except TypeError as e:
    print(f"  u.name = 123 → {e}")

# --- 3. 复用：多个属性用同一描述符 ---
print("\\n=== 3. 复用 ===")
class RangeField:
    """范围检查描述符"""
    def __init__(self, low, high):
        self.low = low
        self.high = high
    def __set_name__(self, owner, name):
        self.name = name
        self.internal = f"_{name}"
    def __get__(self, obj, objtype=None):
        if obj is None: return self
        return getattr(obj, self.internal, None)
    def __set__(self, obj, value):
        if not (self.low <= value <= self.high):
            raise ValueError(f"{self.name} 应在 [{self.low}, {self.high}]")
        setattr(obj, self.internal, value)

class Exam:
    chinese = RangeField(0, 100)
    math = RangeField(0, 100)
    english = RangeField(0, 100)

    def __init__(self, c, m, e):
        self.chinese = c
        self.math = m
        self.english = e

    def total(self):
        return self.chinese + self.math + self.english

exam = Exam(90, 85, 92)
print(f"  成绩: 语文{exam.chinese}, 数学{exam.math}, 英语{exam.english}")
print(f"  总分: {exam.total()}")

try:
    exam.math = 120
except ValueError as e:
    print(f"  exam.math = 120 → {e}")

# --- 4. 模拟 property ---
print("\\n=== 4. 模拟 property ===")
class MyProperty:
    """自己实现 property"""
    def __init__(self, fget=None, fset=None):
        self.fget = fget
        self.fset = fset
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        if self.fget:
            return self.fget(obj)
        raise AttributeError("不可读")
    def __set__(self, obj, value):
        if self.fset:
            self.fset(obj, value)
        else:
            raise AttributeError("不可写")
    def setter(self, fset):
        return MyProperty(self.fget, fset)

class Circle:
    def __init__(self, r):
        self._r = r

    @MyProperty
    def radius(self):
        return self._r

    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("半径不能为负")
        self._r = value

    @MyProperty
    def area(self):
        import math
        return math.pi * self._r ** 2

c = Circle(5)
print(f"  半径: {c.radius}")
print(f"  面积: {c.area:.2f}")
c.radius = 10
print(f"  改后面积: {c.area:.2f}")
try:
    c.area = 100    # 没设 setter，不可写
except AttributeError as e:
    print(f"  c.area = 100 → {e}")

# --- 5. 缓存描述符 ---
print("\\n=== 5. 缓存 ===")
class CachedField:
    """第一次访问计算，之后缓存"""
    def __init__(self, func):
        self.func = func
        self.name = func.__name__
        self.internal = f"_{func.__name__}_cache"
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        if not hasattr(obj, self.internal) or getattr(obj, self.internal) is None:
            # 计算
            value = self.func(obj)
            setattr(obj, self.internal, value)
        return getattr(obj, self.internal)

class DataProcessor:
    def __init__(self, data):
        self.data = data

    @CachedField
    def sum(self):
        print("    [计算 sum]")
        return sum(self.data)

    @CachedField
    def avg(self):
        print("    [计算 avg]")
        return sum(self.data) / len(self.data)

dp = DataProcessor([1, 2, 3, 4, 5])
print(f"  第一次 sum: {dp.sum}")
print(f"  第二次 sum: {dp.sum}    ← 缓存了")
print(f"  第一次 avg: {dp.avg}")`
  },

  // -----------------------------------------------------------
  // 第 53 章：元类入门
  // -----------------------------------------------------------
  {
    id: "py9-53",
    group: "函数式与高级特性",
    icon: "🎭",
    title: "元类入门：类的类",
    content: `## 类也是对象

在 Python 里，**类本身也是对象**——是 \`type\` 的实例。\`type\` 是"元类"，用来创建类。

\`\`\`python
class Foo: pass  # 定义类 Foo
type(Foo)         # <class 'type'>
type(Foo())       # <class '__main__.Foo'>
\`\`\`

\`type\` 创造类，类创造实例。所以 \`type\` 是"类的类"——元类。

## type 的两种用法

\`\`\`python
# 1. 查看类型
type(obj)  # 获取类型

# 2. 动态创建类
type("类名", (父类,), {属性字典})  # 获取类型

# 等价于：
# class 类名(父类):
#     属性字典里的内容
\`\`\`

\`\`\`python
# 动态创建
Dog = type("Dog", (), {"bark": lambda self: print("汪")})  # 赋值变量 Dog
d = Dog()  # 赋值变量 d
d.bark()    # 汪
\`\`\`

## 自定义元类

继承 \`type\`，控制类的创建：

\`\`\`python
class MyMeta(type):  # 定义类 MyMeta
    def __new__(mcs, name, bases, namespace):  # 定义函数 __new__，参数：mcs, name, bases, namespace
        # 创建类时调用
        print(f"创建类 {name}")  # 打印输出到屏幕
        return super().__new__(mcs, name, bases, namespace)  # 返回 super().__new__(mcs, name, bases, namespace)

class Foo(metaclass=MyMeta):  # 定义类 Foo
    pass  # 空操作，占位符
# 打印"创建类 Foo"
\`\`\`

## 元类能做什么

1. **拦截类创建**：自动加方法、改属性
2. **强制规范**：比如要求所有子类必须实现某方法
3. **注册类**：自动把创建的类注册到字典
4. **ORM**：Django 的 Model 用元类把字段映射到数据库

## __init_subclass__：更简单的替代

Python 3.6+ 的 \`__init_subclass__\` 能做很多元类的事，更简单：

\`\`\`python
class Base:  # 定义类 Base
    def __init_subclass__(cls, **kwargs):  # 定义函数 __init_subclass__，参数：cls, **kwargs
        super().__init_subclass__(**kwargs)  # 调用父类
        print(f"{cls.__name__} 被创建")  # 打印输出到屏幕

class Child(Base): pass    # 打印"Child 被创建"
\`\`\`

## 什么时候用元类

**很少用**。Django、SQLAlchemy 这种框架才用。普通场景：
- 想拦截类创建 → 先考虑 \`__init_subclass__\`
- 想加方法 → 用装饰器或 mixin
- 想注册 → 用装饰器 + 字典

## 本章 demo

demo 演示 type 创建类、自定义元类、__init_subclass__。`,
    code: `# ============================================
# 第 53 章：元类入门
# ============================================

# --- 1. 类也是对象 ---
print("=== 1. 类是对象 ===")
class Foo:
    pass

print(f"  Foo 的类型: {type(Foo)}")
print(f"  Foo() 的类型: {type(Foo())}")
print(f"  type 的类型: {type(type)}    ← type 自己也是 type 的实例")

# 内置类的元类都是 type
print(f"  int 的类型: {type(int)}")
print(f"  str 的类型: {type(str)}")
print(f"  list 的类型: {type(list)}")

# --- 2. type 动态创建类 ---
print("\\n=== 2. type 创建类 ===")
# type(类名, 父类元组, 属性字典)
Dog = type("Dog", (), {
    "species": "犬科",
    "bark": lambda self: print(f"  {self.name}: 汪！"),
    "init_name": lambda self, name: setattr(self, "name", name),
})

print(f"  Dog 类型: {type(Dog)}")
print(f"  Dog.species: {Dog.species}")

d = Dog()
d.init_name("旺财")
d.bark()

# 带继承
class Animal:
    def eat(self):
        print(f"  {self.name} 在吃")

Cat = type("Cat", (Animal,), {
    "meow": lambda self: print(f"  {self.name}: 喵"),
})

c = Cat()
c.init_name = lambda n: setattr(c, "name", n)    # 简化
c.name = "咪咪"
c.eat()        # 继承自 Animal
c.meow()

# --- 3. 自定义元类 ---
print("\\n=== 3. 自定义元类 ===")
class LoggedMeta(type):
    """创建类时打印日志的元类"""
    def __new__(mcs, name, bases, namespace):
        print(f"  [元类] 正在创建类 {name}")
        print(f"    方法: {[k for k in namespace if not k.startswith('_')]}")
        cls = super().__new__(mcs, name, bases, namespace)
        return cls

class Base(metaclass=LoggedMeta):
    """用 LoggedMeta 作为元类"""
    pass

print("  --- 创建子类 ---")
class MyClass(Base):
    def foo(self): pass
    def bar(self): pass

# --- 4. 元类自动加方法 ---
print("\\n=== 4. 自动加方法 ===")
class ReprMeta(type):
    """自动给类加 __repr__"""
    def __new__(mcs, name, bases, namespace):
        if "__repr__" not in namespace and "__init__" in namespace:
            # 没有自定义 __repr__ 就加一个
            def auto_repr(self):
                attrs = ", ".join(
                    f"{k}={v!r}" for k, v in vars(self).items()
                )
                return f"{name}({attrs})"
            namespace["__repr__"] = auto_repr
        return super().__new__(mcs, name, bases, namespace)

class Point(metaclass=ReprMeta):
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(3, 4)
print(f"  {p}    ← __repr__ 是元类自动加的")

class Person(metaclass=ReprMeta):
    def __init__(self, name, age):
        self.name = name
        self.age = age

person = Person("小明", 18)
print(f"  {person}")

# --- 5. 注册元类 ---
print("\\n=== 5. 注册元类 ===")
registry = {}

class RegistryMeta(type):
    """自动注册所有子类"""
    def __new__(mcs, name, bases, namespace):
        cls = super().__new__(mcs, name, bases, namespace)
        if bases:    # 不注册基类自己
            registry[name] = cls
        return cls

class Plugin(metaclass=RegistryMeta):
    """插件基类"""
    pass

class AuthPlugin(Plugin):
    pass

class CachePlugin(Plugin):
    pass

class LogPlugin(Plugin):
    pass

print(f"  已注册的插件: {list(registry.keys())}")

# --- 6. __init_subclass__（更简单）---
print("\\n=== 6. __init_subclass__ ===")
class PluginBase:
    """用 __init_subclass__ 替代元类"""
    _plugins = []

    def __init_subclass__(cls, name=None, **kwargs):
        super().__init_subclass__(**kwargs)
        cls.plugin_name = name or cls.__name__
        PluginBase._plugins.append(cls)
        print(f"  [注册] {cls.plugin_name} ({cls.__name__})")

class EmailPlugin(PluginBase, name="邮件"):
    def send(self, msg): return f"邮件: {msg}"

class SmsPlugin(PluginBase, name="短信"):
    def send(self, msg): return f"短信: {msg}"

print(f"  所有插件: {[p.plugin_name for p in PluginBase._plugins]}")
for plugin_cls in PluginBase._plugins:
    p = plugin_cls()
    print(f"  {p.send('你好')}")

# --- 7. 强制实现接口 ---
print("\\n=== 7. 强制接口 ===")
class InterfaceMeta(type):
    """要求子类必须实现 process 方法"""
    def __new__(mcs, name, bases, namespace):
        cls = super().__new__(mcs, name, bases, namespace)
        if bases:    # 不是基类
            if "process" not in namespace:
                raise TypeError(f"{name} 必须实现 process 方法")
        return cls

class Handler(metaclass=InterfaceMeta):
    """处理者基类"""
    pass

class GoodHandler(Handler):
    def process(self, data):
        return f"处理: {data}"

print(f"  GoodHandler 实例化: {GoodHandler().process('数据')}")

try:
    class BadHandler(Handler):
        pass
except TypeError as e:
    print(f"  BadHandler → {e}")

# --- 8. 元类 vs __init_subclass__ vs 装饰器 ---
print("\\n=== 8. 选型 ===")
print("  简单需求 → __init_subclass__（推荐）")
print("  复杂需求（改属性、加方法）→ 元类")
print("  只想加几个方法 → 装饰器")
print("  99% 场景不需要元类")`
  },

  // -----------------------------------------------------------
  // 第 54 章：拷贝与引用
  // -----------------------------------------------------------
  {
    id: "py9-54",
    group: "函数式与高级特性",
    icon: "📋",
    title: "拷贝与引用：浅拷贝 vs 深拷贝",
    content: `## 变量是引用，不是盒子

第 4 章说过"变量是标签"。赋值 \`b = a\` 不是复制数据，是让 \`b\` 也指向同一份数据。

\`\`\`python
a = [1, 2, 3]  # 定义列表 a
b = a            # b 和 a 指向同一份
b.append(4)  # 调用 b.append()：向列表末尾添加元素
print(a)         # [1, 2, 3, 4]  ← a 也变了！
\`\`\`

## 三种"复制"

\`\`\`python
import copy  # 导入模块 copy

a = [1, 2, [3, 4]]  # 定义列表 a

# 1. 赋值（不复制）
b = a  # 赋值变量 b

# 2. 浅拷贝（复制外层，内层共享）
c = a.copy()           # 或 list(a) 或 copy.copy(a)

# 3. 深拷贝（完全独立）
d = copy.deepcopy(a)  # 赋值变量 d
\`\`\`

## 浅拷贝的坑

\`\`\`python
a = [1, 2, [3, 4]]  # 定义列表 a
c = a.copy()           # 浅拷贝
c[0] = 100             # 改外层
c[2].append(5)         # 改内层（嵌套列表）
print(a)               # [1, 2, [3, 4, 5]]  ← 内层被改了！
\`\`\`

浅拷贝只复制最外层，**嵌套对象还是共享的**。

## 深拷贝

\`\`\`python
import copy
d = copy.deepcopy(a)  # 赋值变量 d
d[2].append(6)  # 执行操作
print(a)    # [1, 2, [3, 4]]  ← 完全独立
\`\`\`

深拷贝递归复制所有层级。

## 各种容器的浅拷贝

\`\`\`python
lst.copy()           # 列表
list(lst)            # 列表
lst[:]               # 列表切片
dict(d).copy()       # 字典
set(s).copy()        # 集合
\`\`\`

元组没有 \`copy\`，但 \`tuple(t)\` 返回同一份（不可变不需要复制）。

## 自定义对象的拷贝

实现 \`__copy__\` 和 \`__deepcopy__\` 控制拷贝行为：

\`\`\`python
class MyClass:  # 定义类 MyClass
    def __copy__(self):  # 定义函数 __copy__，参数：self
        # 浅拷贝逻辑
    def __deepcopy__(self, memo):  # 定义函数 __deepcopy__，参数：self, memo
        # 深拷贝逻辑
\`\`\`

## 什么时候要拷贝

- **函数参数**：不想函数内修改影响外部 → 传拷贝
- **默认参数**：可变默认值要用 None + 内部拷贝
- **缓存**：返回内部数据前拷贝一份

## 本章 demo

demo 演示引用、浅拷贝、深拷贝、嵌套结构。`,
    code: `# ============================================
# 第 54 章：拷贝与引用
# ============================================
import copy

# --- 1. 赋值是引用 ---
print("=== 1. 引用 ===")
a = [1, 2, 3]
b = a                # 不是复制！同一份
b.append(4)
print(f"  a = {a}, b = {b}    ← 改 b，a 也变")
print(f"  a is b: {a is b}    ← 同一个对象")

# --- 2. 浅拷贝 ---
print("\\n=== 2. 浅拷贝 ===")
a = [1, 2, 3]
c = a.copy()         # 浅拷贝
c.append(4)
print(f"  a = {a}, c = {c}    ← 改 c，a 不变")
print(f"  a is c: {a is c}    ← 不是同一对象")

# 三种浅拷贝方式等价
a = [1, 2, 3]
print(f"  a.copy(): {a.copy() is a}")
print(f"  list(a): {list(a) is a}")
print(f"  a[:]: {a[:] is a}")

# --- 3. 浅拷贝的坑 ---
print("\\n=== 3. 浅拷贝嵌套 ===")
a = [1, 2, [3, 4]]
c = a.copy()                  # 浅拷贝
c[0] = 100                    # 改外层
c[2].append(5)                # 改内层（嵌套列表）
print(f"  原始 a: {a}")
print(f"  浅拷贝 c: {c}")
print(f"  ← 外层独立，但内层 [3,4] 被共享，改 c[2] 影响 a[2]")

# 看是不是同一对象
print(f"  a[2] is c[2]: {a[2] is c[2]}    ← 内层是同一对象")

# --- 4. 深拷贝 ---
print("\\n=== 4. 深拷贝 ===")
a = [1, 2, [3, 4]]
d = copy.deepcopy(a)          # 深拷贝
d[0] = 100
d[2].append(5)
print(f"  原始 a: {a}    ← 完全没变")
print(f"  深拷贝 d: {d}")
print(f"  a[2] is d[2]: {a[2] is d[2]}    ← 内层也独立了")

# --- 5. 字典浅拷贝 ---
print("\\n=== 5. 字典拷贝 ===")
d1 = {"a": [1, 2], "b": [3, 4]}
d2 = d1.copy()                # 浅拷贝
d2["a"].append(99)
print(f"  d1 = {d1}    ← 内层列表被共享")
print(f"  d2 = {d2}")

d3 = copy.deepcopy(d1)
d3["a"].append(100)
print(f"  deepcopy 后 d1 = {d1}    ← 没变")
print(f"  d3 = {d3}")

# --- 6. 函数参数的引用 ---
print("\\n=== 6. 函数参数 ===")
def add_item(lst, item):
    """直接改传入的列表（有副作用）"""
    lst.append(item)
    return lst

def add_item_safe(lst, item):
    """返回新列表，不改原的"""
    new_lst = lst.copy()
    new_lst.append(item)
    return new_lst

original = [1, 2, 3]
result1 = add_item(original, 4)
print(f"  add_item: original={original}    ← 被改了")

original = [1, 2, 3]
result2 = add_item_safe(original, 4)
print(f"  add_item_safe: original={original}    ← 没变")

# --- 7. 默认参数的坑（回顾）---
print("\\n=== 7. 默认参数 ===")
def append_to(item, lst=None):
    """安全写法"""
    if lst is None:
        lst = []        # 每次新列表
    lst.append(item)
    return lst

print(f"  第一次: {append_to(1)}")
print(f"  第二次: {append_to(2)}    ← 独立的")

# --- 8. 深拷贝循环引用 ---
print("\\n=== 8. 循环引用 ===")
class Node:
    def __init__(self, value):
        self.value = value
        self.parent = None
        self.children = []
    def add_child(self, child):
        self.children.append(child)
        child.parent = self    # 循环引用
    def __repr__(self):
        return f"Node({self.value})"

root = Node("root")
child1 = Node("child1")
root.add_child(child1)

# deepcopy 能处理循环引用
root_copy = copy.deepcopy(root)
print(f"  原始: {root}, 子节点: {root.children}")
print(f"  拷贝: {root_copy}, 子节点: {root_copy.children}")
print(f"  子节点的 parent 是拷贝的 root: {root_copy.children[0].parent is root_copy}    ← 正确")
print(f"  不是原始的 root: {root_copy.children[0].parent is root}")

# --- 9. 自定义拷贝 ---
print("\\n=== 9. 自定义拷贝 ===")
class Connection:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.connected = False

    def __copy__(self):
        """浅拷贝：返回新对象，状态重置"""
        new = Connection(self.host, self.port)
        return new

    def __deepcopy__(self, memo):
        """深拷贝"""
        new = Connection(self.host, self.port)
        memo[id(self)] = new
        return new

    def __repr__(self):
        return f"Connection({self.host}:{self.port})"

conn = Connection("localhost", 8080)
conn.connected = True
conn_copy = copy.copy(conn)
print(f"  原始: {conn}, connected={conn.connected}")
print(f"  拷贝: {conn_copy}, connected={conn_copy.connected}    ← 状态重置")

# --- 10. 性能 ---
print("\\n=== 10. 性能 ===")
import time

big_nested = [[list(range(100)) for _ in range(100)] for _ in range(10)]
print(f"  深嵌套结构大小: {len(big_nested)}x{len(big_nested[0])}x100")

start = time.time()
shallow = big_nested.copy()
t_shallow = time.time() - start

start = time.time()
deep = copy.deepcopy(big_nested)
t_deep = time.time() - start

print(f"  浅拷贝: {t_shallow:.6f}s")
print(f"  深拷贝: {t_deep:.6f}s    ← 慢得多，因为递归复制")`
  },

  // -----------------------------------------------------------
  // 第 55 章：哈希与可哈希
  // -----------------------------------------------------------
  {
    id: "py9-55",
    group: "函数式与高级特性",
    icon: "#️⃣",
    title: "哈希与可哈希：字典/集合的底层",
    content: `## 字典和集合为什么快

字典和集合的查找是 O(1)——靠**哈希**。每个 key 通过 \`hash()\` 函数算出一个数字，存到对应位置，查找时直接定位。

\`\`\`python
hash("abc")    # 一个固定数字
hash(42)       # 42
hash([1, 2])   # ❌ 列表不可哈希
\`\`\`

## 可哈希的条件

一个对象可哈希，需要：
1. 实现 \`__hash__\` 方法
2. 实现 \`__eq__\` 方法
3. **哈希值不变**（生命周期内）

## 什么不可哈希

**可变对象不可哈希**：列表、字典、集合。因为内容变了哈希就变了，字典/集合会找不到它。

\`\`\`python
{[1, 2]: "v"}    # TypeError: 列表不能当 key
{[1, 2]}         # TypeError: 列表不能放集合
\`\`\`

元组可哈希（不可变）。但**元组里装了列表**也不行：

\`\`\`python
hash((1, 2))         # ✅
hash((1, [2]))       # ❌ 内部有列表
\`\`\`

## 自定义对象的哈希

默认情况，自定义对象按 \`id\`（内存地址）哈希：

\`\`\`python
class Point:  # 定义类 Point
    def __init__(self, x, y): ...  # 定义函数 __init__，参数：self, x, y
p1 = Point(1, 2)  # 赋值变量 p1
p2 = Point(1, 2)  # 赋值变量 p2
p1 == p2          # False（默认比 id）
{p1, p2}          # 两个元素（按 id 区分）
\`\`\`

想让"值相同就相等"，重写 \`__eq__\` 和 \`__hash__\`：

\`\`\`python
class Point:  # 定义类 Point
    def __init__(self, x, y): self.x, self.y = x, y  # 定义函数 __init__，参数：self, x, y
    def __eq__(self, other):  # 定义函数 __eq__，参数：self, other
        return self.x == other.x and self.y == other.y  # 返回 self.x == other.x and self.y == other.y
    def __hash__(self):  # 定义函数 __hash__，参数：self
        return hash((self.x, self.y))  # 返回 hash((self.x, self.y))
\`\`\`

## 重要规则

**重写 \`__eq__\` 会导致 \`__hash__\` 变 None**（不可哈希），除非同时重写 \`__hash__\`：

\`\`\`python
class A:  # 定义类 A
    def __eq__(self, other): return True  # 定义函数 __eq__，参数：self, other

hash(A())    # ❌ TypeError，因为只重写了 __eq__
\`\`\`

规则：**相等的对象必须哈希相同**（反过来不必）。否则字典/集合会出 bug。

## frozenset：不可变集合

\`set\` 可变不可哈希，\`frozenset\` 不可变可哈希：

\`\`\`python
s = {1, 2, 3}            # set，不能当 key
fs = frozenset({1, 2})   # 可哈希，能当 key
\`\`\`

## 本章 demo

demo 演示哈希、可哈希判断、自定义哈希。`,
    code: `# ============================================
# 第 55 章：哈希与可哈希
# ============================================

# --- 1. hash 函数 ---
print("=== 1. hash ===")
# 数字、字符串、元组可哈希
print(f"  hash(42) = {hash(42)}")
print(f"  hash(3.14) = {hash(3.14)}")
print(f"  hash('abc') = {hash('abc')}")
print(f"  hash((1, 2, 3)) = {hash((1, 2, 3))}")
print(f"  hash(None) = {hash(None)}")
print(f"  hash(True) = {hash(True)}    ← True 等于 1")

# 同样的值哈希相同
print(f"  hash('abc') == hash('abc'): {hash('abc') == hash('abc')}")

# --- 2. 不可哈希的对象 ---
print("\\n=== 2. 不可哈希 ===")
unhashable = [[1, 2], {"a": 1}, {1, 2}]
for obj in unhashable:
    try:
        hash(obj)
        print(f"  {type(obj).__name__} 可哈希")
    except TypeError as e:
        print(f"  {type(obj).__name__} 不可哈希: {e}")

# 不能当字典 key
try:
    d = {[1, 2]: "value"}
except TypeError as e:
    print(f"  {{[1,2]: 'v'}} → {e}")

# 不能放集合
try:
    s = {[1, 2]}
except TypeError as e:
    print(f"  {{[1,2]}} → {e}")

# --- 3. 元组的特殊 ---
print("\\n=== 3. 元组 ===")
# 纯元组可哈希
print(f"  hash((1, 2)) = {hash((1, 2))}")
print(f"  hash(('a', 'b')) = {hash(('a', 'b'))}")

# 但元组里有列表就不行
try:
    hash((1, [2, 3]))
    print("  (1, [2,3]) 可哈希")
except TypeError as e:
    print(f"  (1, [2,3]) 不可哈希: {e}")

# 全是不可变的就行
print(f"  hash((1, (2, 3))) = {hash((1, (2, 3)))}    ← 元组嵌套元组可以")

# --- 4. 自定义对象默认哈希 ---
print("\\n=== 4. 默认对象哈希 ===")
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

p1 = Point(1, 2)
p2 = Point(1, 2)    # 值相同，但是不同对象
print(f"  p1 == p2: {p1 == p2}    ← 默认按 id 比，不相等")
print(f"  p1 is p2: {p1 is p2}")
print(f"  hash(p1) == hash(p2): {hash(p1) == hash(p2)}    ← 不同")
print(f"  set([p1, p2]) 长度: {len({p1, p2})}    ← 当成两个")

# --- 5. 重写 __eq__ 和 __hash__ ---
print("\\n=== 5. 值相等 ===")
class PointV2:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __eq__(self, other):
        """值相等"""
        if not isinstance(other, PointV2):
            return NotImplemented
        return self.x == other.x and self.y == other.y

    def __hash__(self):
        """基于值的哈希"""
        return hash((self.x, self.y))

    def __repr__(self):
        return f"Point({self.x}, {self.y})"

p1 = PointV2(1, 2)
p2 = PointV2(1, 2)
p3 = PointV2(3, 4)
print(f"  p1 == p2: {p1 == p2}    ← 值相等")
print(f"  hash(p1) == hash(p2): {hash(p1) == hash(p2)}    ← 哈希相同")
print(f"  set([p1, p2, p3]) = {set([p1, p2, p3])}    ← p1 和 p2 合并成一个")

# 能当字典 key
locations = {PointV2(0, 0): "原点", PointV2(1, 1): "对角"}
print(f"  locations[PointV2(0,0)] = {locations[PointV2(0, 0)]}    ← 用值的 key 查")

# --- 6. 只重写 __eq__ 的坑 ---
print("\\n=== 6. __eq__ 的坑 ===")
class BadPoint:
    def __init__(self, x):
        self.x = x
    def __eq__(self, other):
        return self.x == other.x
    # 没重写 __hash__！

bp = BadPoint(1)
try:
    hash(bp)
    print("  可哈希")
except TypeError as e:
    print(f"  不可哈希: {e}")
    print("  → 重写 __eq__ 会让 __hash__ 自动变 None")

# 修复
class GoodPoint:
    def __init__(self, x):
        self.x = x
    def __eq__(self, other):
        return self.x == other.x
    def __hash__(self):
        return hash(self.x)

gp = GoodPoint(1)
print(f"  GoodPoint(1) hash = {hash(gp)}    ← 重写 __hash__ 修复")

# --- 7. frozenset ---
print("\\n=== 7. frozenset ===")
fs = frozenset([1, 2, 3])
print(f"  frozenset([1,2,3]) = {fs}")
print(f"  hash = {hash(fs)}    ← 可哈希")
print(f"  能当 key: {dict([(fs, '集合1')])}")

# 普通 set 不行
try:
    hash({1, 2, 3})
except TypeError as e:
    print(f"  set 不可哈希: {e}")

# --- 8. 哈希冲突 ---
print("\\n=== 8. 哈希冲突 ===")
# 不同对象可能哈希相同
class SameHash:
    """所有实例哈希都相同"""
    def __init__(self, val):
        self.val = val
    def __eq__(self, other):
        return self.val == other.val
    def __hash__(self):
        return 42    # 故意全一样

# 哈希相同但值不同，字典能正常工作（用 __eq__ 区分）
d = {SameHash(1): "一", SameHash(2): "二"}
print(f"  哈希全 42 的字典: {d}")
print(f"  查 SameHash(1): {d[SameHash(1)]}")
print("  → 哈希冲突时用 __eq__ 区分，但性能退化")

# --- 9. 实用：缓存 key ---
print("\\n=== 9. 实用缓存 ===")
def memoize(func):
    """用可哈希参数做缓存"""
    cache = {}
    def wrapper(*args):
        if args in cache:    # args 是元组，可哈希
            return cache[args]
        result = func(*args)
        cache[args] = result
        return result
    return wrapper

@memoize
def fib(n):
    if n < 2: return n
    return fib(n-1) + fib(n-2)

print(f"  fib(30) = {fib(30)}    ← 用元组当 cache key")`
  },

  // -----------------------------------------------------------
  // 第 56 章：反射与内省
  // -----------------------------------------------------------
  {
    id: "py9-56",
    group: "函数式与高级特性",
    icon: "🔍",
    title: "反射与内省：运行时检查对象",
    content: `## 反射是什么

**反射**（reflection）/ **内省**（introspection）：在运行时检查对象的类型、属性、方法，甚至动态调用。

## 常用函数

\`\`\`python
type(obj)              # 类型
isinstance(obj, cls)   # 是不是某类（含子类）
issubclass(A, B)       # A 是不是 B 的子类
id(obj)                # 对象唯一 id（内存地址）
dir(obj)               # 所有属性和方法
hasattr(obj, name)     # 有没有某属性
getattr(obj, name)     # 取属性
setattr(obj, name, v)  # 设属性
delattr(obj, name)     # 删属性
callable(obj)          # 能不能调用
\`\`\`

## getattr / setattr / hasattr

\`\`\`python
class User:  # 定义类 User
    def __init__(self):  # 定义函数 __init__，参数：self
        self.name = "小明"  # 执行操作

u = User()  # 赋值变量 u
hasattr(u, "name")       # True
getattr(u, "name")       # "小明"
getattr(u, "age", 0)     # 0，不存在用默认
setattr(u, "age", 18)  # 设置属性
getattr(u, "age")        # 18
\`\`\`

\`getattr\` 像 \`u.name\`，但属性名是字符串，能动态指定。

## 动态调用方法

\`\`\`python
method_name = "upper"  # 定义字符串 method_name
getattr("abc", method_name)()    # "ABC"
\`\`\`

字符串 \`method_name\` 可以是用户输入、配置——非常灵活。

## inspect 模块

\`\`\`python
import inspect  # 导入模块 inspect
inspect.signature(func)     # 函数签名
inspect.getmembers(obj)     # 所有成员
inspect.isfunction(obj)     # 是不是函数
inspect.isclass(obj)        # 是不是类
\`\`\`

## __dict__ 与 __slots__

\`\`\`python
obj.__dict__    # 对象的所有实例属性（字典）
\`\`\`

\`__slots__\` 限制能有哪些属性，省内存：

\`\`\`python
class Point:  # 定义类 Point
    __slots__ = ("x", "y")    # 只能有 x 和 y
\`\`\`

## 实用场景

1. **序列化**：把对象转字典
2. **插件系统**：动态加载、调用
3. **ORM**：根据字段名操作
4. **调试**：查看对象状态

## 本章 demo

demo 演示 type/dir/getattr/inspect。`,
    code: `# ============================================
# 第 56 章：反射与内省
# ============================================
import inspect

# --- 1. type 和 isinstance ---
print("=== 1. 类型检查 ===")
print(f"  type(42) = {type(42)}")
print(f"  type('abc') = {type('abc')}")
print(f"  type([1,2]) = {type([1,2])}")

# isinstance 考虑继承
class Animal: pass
class Dog(Animal): pass
d = Dog()
print(f"  isinstance(d, Dog) = {isinstance(d, Dog)}")
print(f"  isinstance(d, Animal) = {isinstance(d, Animal)}    ← 子类也算")
print(f"  type(d) == Animal = {type(d) == Animal}    ← type 不算子类")

# isinstance 支持元组
print(f"  isinstance(42, (int, float, str)) = {isinstance(42, (int, float, str))}")

# issubclass
print(f"  issubclass(Dog, Animal) = {issubclass(Dog, Animal)}")
print(f"  issubclass(int, object) = {issubclass(int, object)}    ← 所有类都是 object 子类")

# --- 2. dir 看属性 ---
print("\\n=== 2. dir ===")
class User:
    """用户类"""
    role = "user"    # 类属性
    def __init__(self, name, age):
        self.name = name
        self.age = age
    def greet(self):
        return f"Hi, {self.name}"

u = User("小明", 18)
# 所有属性（包括继承的）
all_attrs = dir(u)
print(f"  dir(User实例) 前10个: {all_attrs[:10]}...")
# 只看自己的
own = [a for a in dir(u) if not a.startswith("_")]
print(f"  非私有属性: {own}")

# --- 3. hasattr / getattr / setattr ---
print("\\n=== 3. 动态属性 ===")
u = User("小明", 18)
print(f"  hasattr(u, 'name') = {hasattr(u, 'name')}")
print(f"  hasattr(u, 'email') = {hasattr(u, 'email')}")
print(f"  getattr(u, 'name') = {getattr(u, 'name')}")
print(f"  getattr(u, 'email', '无') = {getattr(u, 'email', '无')}    ← 默认值")

# 动态加属性
setattr(u, "email", "xm@example.com")
print(f"  setattr 后 u.email = {u.email}")

# 动态删
delattr(u, "email")
print(f"  delattr 后 hasattr(u, 'email') = {hasattr(u, 'email')}")

# --- 4. 动态调用方法 ---
print("\\n=== 4. 动态调用 ===")
class Calculator:
    def add(self, a, b): return a + b
    def sub(self, a, b): return a - b
    def mul(self, a, b): return a * b

calc = Calculator()
# 用户输入方法名
for method_name in ["add", "sub", "mul"]:
    method = getattr(calc, method_name)    # 动态取方法
    result = method(10, 3)                 # 调用
    print(f"  calc.{method_name}(10, 3) = {result}")

# 字符串方法也能动态调
text = "Hello World"
for op in ["upper", "lower", "title", "swapcase"]:
    print(f"  '{text}'.{op}() = {getattr(text, op)()}")

# --- 5. __dict__ ---
print("\\n=== 5. __dict__ ===")
u = User("小明", 18)
print(f"  实例 __dict__: {u.__dict__}")
print(f"  类 __dict__ 的键: {list(User.__dict__.keys())[:5]}...")

# 修改 __dict__ 等于改属性
u.__dict__["age"] = 20
print(f"  改 __dict__ 后 u.age = {u.age}")

# --- 6. __slots__ ---
print("\\n=== 6. __slots__ ===")
import sys

class PointDict:
    """普通类，用 __dict__"""
    def __init__(self, x, y):
        self.x = x
        self.y = y

class PointSlots:
    """用 __slots__，省内存"""
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x = x
        self.y = y

p1 = PointDict(1, 2)
p2 = PointSlots(1, 2)
print(f"  PointDict 大小: {sys.getsizeof(p1) + sys.getsizeof(p1.__dict__)} 字节")
print(f"  PointSlots 大小: {sys.getsizeof(p2)} 字节    ← 更省")
print(f"  PointSlots 有 __dict__: {hasattr(p2, '__dict__')}    ← 没有")

try:
    p2.z = 3    # slots 不允许加其他属性
except AttributeError as e:
    print(f"  p2.z = 3 → {e}")

# --- 7. callable ---
print("\\n=== 7. callable ===")
def func(): pass
class C:
    def __call__(self): pass
    def method(self): pass

print(f"  callable(func) = {callable(func)}")
print(f"  callable(C) = {callable(C)}    ← 类可调用（实例化）")
print(f"  callable(C()) = {callable(C())}    ← 有 __call__")
print(f"  callable(C.method) = {callable(C.method)}")
print(f"  callable(42) = {callable(42)}")

# --- 8. inspect 模块 ---
print("\\n=== 8. inspect ===")
def greet(name, greeting="你好", *args, **kwargs):
    """打招呼"""
    return f"{greeting}，{name}"

# 函数签名
sig = inspect.signature(greet)
print(f"  签名: {sig}")
for name, param in sig.parameters.items():
    print(f"    {name}: {param}")

# 文档
print(f"  文档: {inspect.getdoc(greet)}")

# 判断类型
print(f"  isfunction(greet) = {inspect.isfunction(greet)}")
print(f"  isclass(User) = {inspect.isclass(User)}")
print(f"  ismethod(User.greet) = {inspect.isfunction(User.greet)}")

# --- 9. getmembers ---
print("\\n=== 9. getmembers ===")
class MyClass:
    """演示类"""
    class_attr = "类属性"
    def __init__(self):
        self.inst_attr = "实例属性"
    def method(self): pass
    @staticmethod
    def static_method(): pass
    @classmethod
    def class_method(cls): pass

obj = MyClass()
members = inspect.getmembers(obj)
# 只看自定义的
custom = [(n, type(v).__name__) for n, v in members
          if not n.startswith("_") and not n in ("class_attr",)]
print(f"  自定义成员:")
for name, typ in custom[:8]:
    print(f"    {name}: {typ}")

# --- 10. 实用：对象转字典 ---
print("\\n=== 10. 对象转字典 ===")
def to_dict(obj):
    """把对象属性转字典（序列化用）"""
    return {k: v for k, v in vars(obj).items()
            if not k.startswith("_") and not callable(v)}

class Product:
    def __init__(self, name, price, stock):
        self.name = name
        self.price = price
        self.stock = stock
    def _internal(self): pass
    def total_value(self):
        return self.price * self.stock

p = Product("手机", 2999, 100)
print(f"  对象: {p.name}, {p.price}, {p.stock}")
print(f"  转字典: {to_dict(p)}")`
  },

  // -----------------------------------------------------------
  // 第 57 章：字符串与编码深入
  // -----------------------------------------------------------
  {
    id: "py9-57",
    group: "函数式与高级特性",
    icon: "🔤",
    title: "字符串与编码：Unicode、字节、编解码",
    content: `## 字符串 vs 字节

Python 3 严格区分：
- **字符串 \`str\`**：Unicode 文本，给人看
- **字节 \`bytes\`**：二进制数据，给机器/网络用

\`\`\`python
s = "你好"          # str
b = s.encode("utf-8")  # bytes
b                   # b'\\xe4\\xbd\\xa0\\xe5\\xa5\\xbd'
b.decode("utf-8")   # "你好"
\`\`\`

## 编码与解码

\`\`\`python
str.encode(encoding)    # 字符串 → 字节
bytes.decode(encoding)  # 字节 → 字符串
\`\`\`

常见编码：
- **UTF-8**：变长，最常用，兼容 ASCII
- **UTF-16**：定长 2 字节
- **GBK**：中文 Windows 常用
- **ASCII**：英文，1 字节

## Unicode 码点

每个字符在 Unicode 表里有个编号（码点）：

\`\`\`python
ord("A")    # 65
ord("中")   # 20013
chr(65)     # "A"
chr(20013)  # "中"
\`\`\`

## 字节字面量

\`\`\`python
b"abc"          # bytes
b"\\x41"         # b"A"（十六进制）
b"\\x41\\x42"     # b"AB"
\`\`\`

## 读写文件的编码

\`\`\`python
# 文本模式（默认用系统编码）
open("f.txt", "r")                    # ⚠️ 可能乱码
open("f.txt", "r", encoding="utf-8")  # ✅ 明确指定

# 二进制模式
open("f.bin", "rb")    # 读字节
open("f.bin", "wb")    # 写字节
\`\`\`

读图片、视频、压缩包要用二进制模式。

## 常见乱码原因

\`\`\`python
# 用 UTF-8 编码，用 GBK 解码 → 乱码
s = "你好"  # 定义字符串 s
b = s.encode("utf-8")  # 赋值变量 b
b.decode("gbk")    # 乱码或 UnicodeDecodeError
\`\`\`

**读写用同一种编码**就不会乱码。统一用 UTF-8 最安全。

## 字符串格式化回顾

\`\`\`python
"{} {}".format(a, b)        # format
"%s %s" % (a, b)            # 老式
f"{a} {b}"                  # f-string（推荐）
f"{a:>10}"                  # 右对齐宽10
f"{a:.2f}"                  # 两位小数
f"{a:,}"                    # 千分位
f"{a!r}"                    # repr
\`\`\`

## 本章 demo

demo 演示编解码、码点、文件编码。`,
    code: `# ============================================
# 第 57 章：字符串与编码
# ============================================
import tempfile, os

# --- 1. str vs bytes ---
print("=== 1. str vs bytes ===")
s = "你好"
b = s.encode("utf-8")
print(f"  str: {s!r}, 类型 {type(s).__name__}")
print(f"  bytes: {b!r}, 类型 {type(b).__name__}")
print(f"  长度: str={len(s)}, bytes={len(b)}    ← 一个中文 UTF-8 占3字节")

# 解码回来
print(f"  decode: {b.decode('utf-8')!r}")

# bytes 字面量
print(f"  b'abc': {b'abc'}, 类型 {type(b'abc').__name__}")
print(f"  b'\\\\x41': {b'\\x41'}    ← 十六进制")

# --- 2. 各种编码 ---
print("\\n=== 2. 编码对比 ===")
text = "A中"
for enc in ["ascii", "utf-8", "utf-16", "gbk", "big5"]:
    try:
        b = text.encode(enc)
        print(f"  {enc:8}: {b!r}, 长度 {len(b)}")
    except UnicodeEncodeError as e:
        print(f"  {enc:8}: 编码失败 - {e}")

# UTF-8 是变长
print("\\n  UTF-8 变长编码:")
for c in ["A", "中", "😀"]:
    b = c.encode("utf-8")
    print(f"    '{c}' → {b!r} ({len(b)} 字节)")

# --- 3. 码点 ord / chr ---
print("\\n=== 3. 码点 ===")
print(f"  ord('A') = {ord('A')}")
print(f"  ord('a') = {ord('a')}")
print(f"  ord('0') = {ord('0')}")
print(f"  ord('中') = {ord('中')}")
print(f"  ord('🎉') = {ord('🎉')}    ← emoji 也有码点")

# chr 反向
print(f"  chr(65) = {chr(65)!r}")
print(f"  chr(20013) = {chr(20013)!r}")
print(f"  chr(0x1F389) = {chr(0x1F389)!r}    ← 十六进制码点")

# --- 4. 编解码错误 ---
print("\\n=== 4. 编解码错误 ===")
# 解码时遇到无效字节
bad_bytes = b'\\xff\\xfe'
try:
    bad_bytes.decode("utf-8")
except UnicodeDecodeError as e:
    print(f"  严格模式: {e}")

# 不同错误处理
print(f"  ignore: {bad_bytes.decode('utf-8', errors='ignore')!r}    ← 跳过")
print(f"  replace: {bad_bytes.decode('utf-8', errors='replace')!r}    ← 替换")

# --- 5. 乱码演示 ---
print("\\n=== 5. 乱码 ===")
original = "你好世界"
utf8_bytes = original.encode("utf-8")
print(f"  原始: {original}")
print(f"  UTF-8 字节: {utf8_bytes!r}")

# 用错误编码解码 → 乱码
try:
    wrong = utf8_bytes.decode("gbk")
    print(f"  用 GBK 解 UTF-8: {wrong}    ← 乱码")
except UnicodeDecodeError:
    print(f"  用 GBK 解 UTF-8 失败")

# 修复：用正确编码
right = utf8_bytes.decode("utf-8")
print(f"  用 UTF-8 解: {right}    ← 正确")

# --- 6. 文件编码 ---
print("\\n=== 6. 文件编码 ===")
# 写中文文件
path = tempfile.mktemp(suffix=".txt")
with open(path, "w", encoding="utf-8") as f:
    f.write("你好，世界！\\nHello World!\\n")

# 看字节
with open(path, "rb") as f:
    raw = f.read()
print(f"  文件字节: {raw!r}")

# 正确读
with open(path, "r", encoding="utf-8") as f:
    content = f.read()
print(f"  UTF-8 读: {content.strip()!r}")

# 错误编码读 → 乱码
with open(path, "r", encoding="gbk", errors="replace") as f:
    wrong = f.read()
print(f"  GBK 读: {wrong.strip()!r}    ← 乱码")

os.unlink(path)

# --- 7. 二进制文件 ---
print("\\n=== 7. 二进制文件 ===")
# 写二进制
path = tempfile.mktemp(suffix=".bin")
data = bytes([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A])    # PNG 文件头
with open(path, "wb") as f:
    f.write(data)

# 读二进制
with open(path, "rb") as f:
    read_data = f.read()
print(f"  写入: {data!r}")
print(f"  读出: {read_data!r}")
print(f"  相同: {data == read_data}")
os.unlink(path)

# --- 8. 字符串格式化（完整）---
print("\\n=== 8. 格式化 ===")
name, age, score = "小明", 18, 95.678

# f-string
print(f"  f-string: {name}, {age}岁, {score:.2f}分")

# 对齐
print(f"  左对齐: |{name:<10}|")
print(f"  右对齐: |{name:>10}|")
print(f"  居中: |{name:^10}|")
print(f"  填充: |{name:*>10}|")

# 数字格式
n = 1234567.891
print(f"  千分位: {n:,}")
print(f"  科学计数: {n:e}")
print(f"  百分比: {0.856:.1%}")
print(f"  二进制: {42:b}")
print(f"  十六进制: {255:x}")
print(f"  八进制: {42:o}")

# repr vs str
s = "hello\\nworld"
print(f"  str: {s}")          # 解释转义
print(f"  repr: {s!r}    ← 原样显示")
print(f"  ascii: {s!a}")

# --- 9. 字符串方法回顾 ---
print("\\n=== 9. 字符串方法 ===")
s = "  Hello, World  "
print(f"  原始: {s!r}")
print(f"  strip: {s.strip()!r}")
print(f"  upper: {s.upper().strip()!r}")
print(f"  replace: {s.replace('World', 'Python').strip()!r}")

# split 和 join
csv = "a,b,c,d"
parts = csv.split(",")
print(f"  split(','): {parts}")
print(f"  join: {'-'.join(parts)}")

# 查找
text = "Hello Python"
print(f"  find('Python'): {text.find('Python')}    ← 找到返回下标")
print(f"  find('Java'): {text.find('Java')}    ← 没找到返回 -1")
print(f"  count('l'): {text.count('l')}")
print(f"  startswith('Hello'): {text.startswith('Hello')}")`
  },

  // -----------------------------------------------------------
  // 第 58 章：函数式综合实战
  // -----------------------------------------------------------
  {
    id: "py9-58",
    group: "函数式与高级特性",
    icon: "🏆",
    title: "函数式综合实战：数据处理管道",
    content: `## 用函数式风格写数据处理

把函数式编程、装饰器、闭包、迭代器全用上，写一个数据处理管道。

## 需求

读取销售数据（模拟），经过清洗、过滤、变换、聚合，输出报告。

## 设计

每一步是纯函数或生成器，通过组合串联：

\`\`\`
load → clean → filter → transform → aggregate → report
\`\`\`

## 函数式原则

1. **纯函数**：不改外部状态，相同输入相同输出
2. **不可变**：返回新数据，不改原数据
3. **组合**：小函数组合成大功能
4. **惰性**：用生成器处理大数据
5. **高阶函数**：函数当参数

## 涉及知识

- 纯函数、不可变
- 装饰器（日志、缓存、计时）
- 闭包（配置化）
- 高阶函数（map/filter/reduce）
- 生成器（流式处理）
- 推导式
- functools.partial
- collections.Counter

## 本章 demo

完整数据处理管道。`,
    code: `# ============================================
# 第 58 章：函数式综合实战 - 数据处理管道
# ============================================
import json
import time
from functools import wraps, reduce, partial
from collections import Counter, defaultdict
from itertools import groupby

# ============================================================
# 装饰器
# ============================================================
def log_step(func):
    """记录每一步"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        print(f"    [执行] {func.__name__}")
        result = func(*args, **kwargs)
        return result
    return wrapper

def timed(func):
    """计时"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"    ⏱ {func.__name__} 耗时 {time.time()-start:.4f}s")
        return result
    return wrapper

# ============================================================
# 1. 数据加载（生成器）
# ============================================================
@log_step
def load_records(raw_data):
    """流式加载，每行一个记录"""
    for line in raw_data:
        yield dict(line)    # 返回副本（不可变思想）

# ============================================================
# 2. 清洗（纯函数，返回新记录）
# ============================================================
@log_step
def clean_record(record):
    """清洗单条记录（纯函数）"""
    # 不改原 record，返回新的
    cleaned = {}
    for k, v in record.items():
        if k in ("name", "product"):
            cleaned[k] = str(v).strip() if v else ""
        elif k in ("price", "quantity"):
            try:
                cleaned[k] = float(v) if k == "price" else int(v)
            except (ValueError, TypeError):
                cleaned[k] = 0
        elif k == "date":
            cleaned[k] = str(v).strip() if v else ""
    return cleaned

def clean_all(records):
    """清洗所有"""
    for r in records:
        yield clean_record(r)

# ============================================================
# 3. 过滤（高阶函数）
# ============================================================
def make_filter(predicate):
    """闭包：造一个过滤器"""
    def filter_func(records):
        for r in records:
            if predicate(r):
                yield r
    return filter_func

# ============================================================
# 4. 变换（纯函数 + 闭包配置）
# ============================================================
def make_transform(extras):
    """造一个变换器，加计算字段"""
    def transform(records):
        for r in records:
            new = dict(r)    # 不改原的
            new["total"] = r.get("price", 0) * r.get("quantity", 0)
            new["level"] = "高" if new["total"] > 1000 else "中" if new["total"] > 100 else "低"
            yield new
    return transform

# ============================================================
# 5. 聚合
# ============================================================
def aggregate_by(records, key_func, agg_func):
    """按 key 聚合"""
    groups = defaultdict(list)
    for r in records:
        groups[key_func(r)].append(r)
    return {k: agg_func(v) for k, v in groups.items()}

# ============================================================
# 6. 组合工具
# ============================================================
def compose(*funcs):
    """从右到左组合"""
    def composed(x):
        return reduce(lambda acc, f: f(acc), reversed(funcs), x)
    return composed

def pipe_through(data, *steps):
    """让数据依次通过每个处理步骤"""
    result = data
    for step in steps:
        result = step(result)
    return result

# ============================================================
# 主程序
# ============================================================
print("=" * 55)
print("销售数据处理管道")
print("=" * 55)

# 原始数据（模拟脏数据）
raw_data = [
    {"name": " Alice ", "product": " Laptop ", "price": "5999", "quantity": "2", "date": "2024-01-15"},
    {"name": "Bob", "product": "Mouse", "price": "99", "quantity": "10", "date": "2024-01-16"},
    {"name": "Charlie", "product": "Keyboard", "price": "299", "quantity": "5", "date": "2024-01-15"},
    {"name": "", "product": "Monitor", "price": "1999", "quantity": "3", "date": "2024-01-17"},  # 空名字
    {"name": "Alice", "product": "Mouse", "price": "99", "quantity": "20", "date": "2024-01-16"},
    {"name": "Bob", "product": "Laptop", "price": "5999", "quantity": "1", "date": "2024-01-18"},
    {"name": "David", "product": "USB Cable", "price": "invalid", "quantity": "50", "date": "2024-01-19"},  # 无效价格
    {"name": "Eve", "product": "Headphone", "price": "899", "quantity": "4", "date": "2024-01-15"},
]

# 管道步骤
print("\\n--- 1. 加载与清洗 ---")
loaded = list(load_records(raw_data))
print(f"  加载 {len(loaded)} 条")
cleaned = list(clean_all(load_records(raw_data)))
for c in cleaned:
    print(f"    {c}")

print("\\n--- 2. 过滤：有名字的 ---")
filter_named = make_filter(lambda r: r["name"])    # 闭包造过滤器
named = list(filter_named(clean_all(load_records(raw_data))))
print(f"  过滤后 {len(named)} 条（去掉空名字的）")

print("\\n--- 3. 变换：加 total 和 level ---")
transformer = make_transform(extras=True)
transformed = list(transformer(filter_named(clean_all(load_records(raw_data)))))
for t in transformed:
    print(f"    {t['name']}: {t['product']} x{t['quantity']} = {t['total']} ({t['level']})")

print("\\n--- 4. 聚合：按销售员 ---")
by_sales = aggregate_by(
    transformed,
    key_func=lambda r: r["name"],
    agg_func=lambda rs: {
        "订单数": len(rs),
        "总金额": sum(r["total"] for r in rs),
        "产品": [r["product"] for r in rs],
    }
)
for name, stats in sorted(by_sales.items(), key=lambda x: -x[1]["总金额"]):
    print(f"  {name}: {stats}")

print("\\n--- 5. 聚合：按产品 ---")
by_product = aggregate_by(
    transformed,
    key_func=lambda r: r["product"],
    agg_func=lambda rs: {
        "销量": sum(r["quantity"] for r in rs),
        "收入": sum(r["total"] for r in rs),
    }
)
for product, stats in sorted(by_product.items(), key=lambda x: -x[1]["收入"]):
    print(f"  {product}: {stats}")

print("\\n--- 6. 总体统计 ---")
total_revenue = sum(t["total"] for t in transformed)
total_orders = len(transformed)
avg_order = total_revenue / total_orders if total_orders else 0
print(f"  总订单: {total_orders}")
print(f"  总收入: {total_revenue:.2f}")
print(f"  平均订单: {avg_order:.2f}")

print("\\n--- 7. 用组合简化 ---")
# 把多步组合成一个函数
pipeline = compose(
    list,                                              # 最后转列表
    make_transform(extras=True),                       # 加字段
    make_filter(lambda r: r["name"]),                  # 过滤
    clean_all,                                         # 清洗
    load_records,                                      # 加载
)
result = pipeline(raw_data)
print(f"  组合管道结果: {len(result)} 条")
for r in result[:3]:
    print(f"    {r['name']}: {r['total']}")

print("\\n--- 8. 高阶统计：按 level 分组 ---")
level_stats = aggregate_by(
    result,
    key_func=lambda r: r["level"],
    agg_func=lambda rs: {
        "count": len(rs),
        "total": sum(r["total"] for r in rs),
    }
)
for level in ["高", "中", "低"]:
    if level in level_stats:
        print(f"  {level}级: {level_stats[level]}")

print("\\n" + "=" * 55)
print("函数式知识点回顾")
print("=" * 55)
print("• 纯函数（无副作用）")
print("• 不可变数据（返回新数据）")
print("• 函数组合 compose")
print("• 偏函数 partial")
print("• 装饰器（日志、计时、缓存）")
print("• 闭包（配置化）")
print("• 高阶函数 + 生成器（流式处理）")
print("• 管道模式（每步独立可组合）")`
  }
];
