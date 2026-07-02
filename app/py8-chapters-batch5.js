// =============================================================
// py8-chapters-batch5.js
// 模块：函数编程（共 10 章）
// 全新制作，简单易懂，demo 多，难代码逐行讲解
// =============================================================

export const chapters = [
  {
    id: "py8-func-basic",
    group: "函数编程",
    icon: "🧩",
    title: "函数定义与参数",
    content: `## 什么是函数

函数是**一段可复用的代码块**，把逻辑封装起来，给它取个名字，需要时调用。函数让代码更清晰、更易维护、避免重复造轮子。

### def 定义函数

\`\`\`python
def 函数名(参数1, 参数2):  # 定义函数 函数名，参数：参数1, 参数2
    """文档字符串（可选）"""  # 执行操作
    函数体
    return 返回值  # 返回 返回值
\`\`\`

### 形参与实参

| 概念 | 说明 | 例子 |
|------|------|------|
| 形参 | 定义函数时的占位符 | \`def f(a, b)\` 中的 \`a, b\` |
| 实参 | 调用时传入的具体值 | \`f(3, 5)\` 中的 \`3, 5\` |

### 四种参数形式

\`\`\`python
def greet(name, msg="你好"):  # 定义函数 greet，参数：name, msg="你好"
    print(f"{msg}，{name}！")  # 打印输出到屏幕

greet("小明")              # 位置参数
greet("小红", "早上好")     # 位置参数覆盖默认值
greet(name="小刚", msg="嗨") # 关键字参数
\`\`\`

### 参数顺序规则（必须严格遵守）

定义函数时参数顺序：

\`\`\`
位置参数 -> 默认参数 -> *args -> 强制关键字参数 -> **kwargs
\`\`\`

| 顺序 | 写法 | 说明 |
|------|------|------|
| 1 | \`a\` | 普通位置参数，必填 |
| 2 | \`b=10\` | 默认参数，可省略 |
| 3 | \`*args\` | 收集多余位置参数 |
| 4 | \`*, c\` | 强制关键字参数（必须 \`c=...\` 传） |
| 5 | \`**kwargs\` | 收集多余关键字参数 |

### return 无值返回 None

\`\`\`python
def say():  # 定义函数 say
    print("hi")  # 打印输出到屏幕

result = say()   # result 是 None
print(result)     # None
\`\`\`

函数没有 \`return\`，或 \`return\` 后不带值，返回 \`None\`。

### 函数是一等对象

Python 的函数是**一等对象**（first-class object），意味着：

- 可以赋值给变量
- 可以作为参数传递
- 可以作为返回值
- 可以放进容器（列表、字典）

\`\`\`python
def square(x):  # 定义函数 square，参数：x
    return x * x  # 返回 x * x

f = square          # 赋值给变量
print(f(5))         # 25
funcs = [square, len]  # 放进列表
\`\`\`

### 文档字符串 docstring

\`\`\`python
def add(a, b):  # 定义函数 add，参数：a, b
    """两数相加
    
    参数：
        a: 第一个数
        b: 第二个数
    返回：
        两数之和
    """
    return a + b  # 返回 a + b

print(add.__doc__)   # 查看文档
help(add)            # 交互式查看
\`\`\`

### type hints 入门

Python 是动态类型，但可以用**类型提示**（type hints）让代码更清晰：

\`\`\`python
def multiply(x: int, y: int) -> int:  # 定义函数 multiply，参数：x: int, y: int
    return x * y  # 返回 x * y
\`\`\`

类型提示**不强制**，只是给人和工具看。运行时传字符串也不会报错。

下面的 demo 综合演示函数定义、参数类型、一等对象、docstring 和 type hints。`,
    code: `# 函数定义与参数完整演示

# 1. 最简单的函数：无参无返回值
def say_hello():
    """无参数无返回值的函数"""
    print("你好，世界！")

say_hello()   # 调用函数

# 2. 位置参数：a, b 是形参，调用时传的是实参
def add(a, b):
    """两数相加"""
    return a + b

print("3 + 5 =", add(3, 5))

# 3. 默认参数：不传时用默认值
def greet(name, msg="你好"):
    print(f"{msg}，{name}！")

greet("小明")              # msg 用默认值"你好"
greet("小红", "早上好")     # msg 用传入值

# 4. 关键字参数：按名字传，顺序无所谓
def introduce(name, age, city):
    print(f"我叫{name}，{age}岁，来自{city}")

introduce(age=20, name="小明", city="北京")

# 5. 参数顺序规则演示
def func(a, b=10, *args, c, **kwargs):
    print(f"  a={a}, b={b}, args={args}, c={c}, kwargs={kwargs}")

print("参数顺序测试:")
func(1, 2, 3, 4, c=100, x=200, y=300)

# 6. return 无值返回 None
def no_return():
    print("我什么也不返回")

result = no_return()
print("无 return 的返回值:", result)   # None

# 7. 函数是一等对象：赋值给变量
def square(x):
    return x * x

f = square   # 把函数赋值给变量 f
print("f(5) =", f(5))

# 函数可以放进容器
funcs = [square, len, abs]
print()
print("函数放进列表遍历:")
for fn in funcs:
    name = fn.__name__
    if fn is square:
        print(f"  {name}(5) = {fn(5)}")
    elif fn is len:
        print(f"  {name}('hello') = {fn('hello')}")
    else:  # abs
        print(f"  {name}(-10) = {fn(-10)}")

# 8. 文档字符串 docstring
def calc_bmi(weight, height):
    """计算 BMI 指数
    
    参数：
        weight: 体重，单位 kg
        height: 身高，单位 m
    返回：
        BMI 数值（保留一位小数）
    """
    return round(weight / (height ** 2), 1)

print()
print("BMI =", calc_bmi(60, 1.75))
print("函数文档前 20 字:", calc_bmi.__doc__[:20].strip(), "...")

# 9. type hints 类型提示入门
def multiply(x: int, y: int) -> int:
    """x: int 是类型提示，-> int 是返回类型
    
    注意：类型提示不强制，传字符串也不报错
    """
    return x * y

print("multiply(4, 5) =", multiply(4, 5))

# 类型提示不强制（演示）
print("multiply('ab', 3) =", multiply("ab", 3))   # 字符串也能跑

# 10. 用 help 查看文档
print()
print("--- help 查看 calc_bmi ---")
help(calc_bmi)`
  },
  {
    id: "py8-args-kwargs",
    group: "函数编程",
    icon: "📦",
    title: "*args 与 **kwargs",
    content: `## *args 收集位置参数

在形参前加 \`*\`，会把**多余的位置参数**收集成一个元组：

\`\`\`python
def sum_all(*args):  # 定义函数 sum_all，参数：*args
    print(args)      # (1, 2, 3) 元组
    total = 0  # 定义数值 total
    for n in args:  # 遍历 args，取值给 n
        total += n  # total 累加
    return total  # 返回 total

sum_all(1, 2, 3, 4)   # args = (1, 2, 3, 4)
\`\`\`

> \`args\` 只是约定俗成的名字，写成 \`*nums\` 也行，关键是 \`*\`。

## **kwargs 收集关键字参数

在形参前加 \`**\`，会把**多余的关键字参数**收集成一个字典：

\`\`\`python
def show_info(**kwargs):  # 定义函数 show_info，参数：**kwargs
    print(kwargs)    # {'name': '小明', 'age': 18}

show_info(name="小明", age=18)  # 调用 show_info()
\`\`\`

## 参数解包 * 和 **

调用时用 \`*\` 解包列表/元组，用 \`**\` 解包字典：

\`\`\`python
def add4(a, b, c, d):  # 定义函数 add4，参数：a, b, c, d
    return a + b + c + d  # 返回 a + b + c + d

nums = [1, 2, 3, 4]  # 定义列表 nums
add4(*nums)          # 等价 add4(1, 2, 3, 4)

config = {"a": 1, "b": 2, "c": 3, "d": 4}  # 定义字典 config
add4(**config)       # 等价 add4(a=1, b=2, c=3, d=4)
\`\`\`

## 混合参数顺序

\`\`\`
def func(普通, 默认=值, *args, 强制关键字, **kwargs)
\`\`\`

| 位置 | 参数 | 收集结果 |
|------|------|----------|
| 前 | \`a, b=10\` | 普通参数 |
| 中 | \`*args\` | 元组 |
| 后 | \`c\`（在 \`*\` 之后）| 强制关键字 |
| 末 | \`**kwargs\` | 字典 |

## 强制关键字参数 *

\`\`\`python
def connect(host, port, *, timeout=10):  # 定义函数 connect，参数：host, port, *, timeout=10
    ...  # 执行操作

connect("localhost", 8080, timeout=5)   # 正确
connect("localhost", 8080, 5)            # 报错：timeout 必须用关键字
\`\`\`

\`*\` 之后的参数必须用关键字传递，提高可读性。

## 仅位置参数 / (Python 3.8+)

\`\`\`python
def power(base, exp, /):  # 定义函数 power，参数：base, exp, /
    return base ** exp  # 返回 base ** exp

power(2, 10)           # 正确
power(base=2, exp=10)   # 报错：只能按位置传
\`\`\`

\`/\` 之前的参数只能按位置传，不能用关键字。

## *args 与 **kwargs 对比

| 特性 | *args | **kwargs |
|------|-------|----------|
| 收集 | 位置参数 | 关键字参数 |
| 类型 | 元组 tuple | 字典 dict |
| 调用解包 | \`*列表\` | \`**字典\` |
| 形参符号 | 一个 \`*\` | 两个 \`**\` |

## 应用场景

- **灵活的日志函数**：\`log(level, *msgs, **meta)\`
- **配置传递**：把字典解包成函数参数
- **装饰器**：\`def wrapper(*args, **kwargs)\` 接收任意参数
- **继承父类方法**：\`super().method(*args, **kwargs)\`

下面的 demo 演示所有参数收集与解包技巧。`,
    code: `# *args 和 **kwargs 完整演示

# 1. *args 收集位置参数成元组
def sum_all(*args):
    print("  args 类型:", type(args).__name__, "值:", args)
    total = 0
    for n in args:
        total += n
    return total

print("=== 1. *args 收集位置参数 ===")
print("总和:", sum_all(1, 2, 3, 4, 5))
print("总和:", sum_all(10, 20))

# 2. **kwargs 收集关键字参数成字典
def show_info(**kwargs):
    print("  kwargs 类型:", type(kwargs).__name__, "值:", kwargs)
    for k, v in kwargs.items():
        print(f"    {k}: {v}")

print()
print("=== 2. **kwargs 收集关键字参数 ===")
show_info(name="小明", age=18, city="北京")

# 3. 混合参数顺序
def create_user(name, age=18, *args, role="user", **kwargs):
    print(f"  name={name}")
    print(f"  age={age}")
    print(f"  args={args}")
    print(f"  role={role}")
    print(f"  kwargs={kwargs}")

print()
print("=== 3. 混合参数顺序 ===")
create_user("小明", 20, "标签1", "标签2", role="admin", email="a@b.com")

# 4. 参数解包 *
def add4(a, b, c, d):
    return a + b + c + d

nums = [1, 2, 3, 4]
print()
print("=== 4. 参数解包 ===")
print("解包列表 *nums:", add4(*nums))

tup = (10, 20, 30, 40)
print("解包元组 *tup:", add4(*tup))

# 5. 参数解包 **
config = {"a": 100, "b": 200, "c": 300, "d": 400}
print("解包字典 **config:", add4(**config))

# 6. 强制关键字参数 *
def connect(host, port, *, timeout=10, retry=3):
    print(f"  连接 {host}:{port}, 超时={timeout}s, 重试={retry}次")

print()
print("=== 6. 强制关键字参数 ===")
connect("localhost", 8080, timeout=5)
connect("localhost", 8080, retry=1, timeout=3)

# 7. 仅位置参数 / (Python 3.8+)
def power(base, exp, /):
    """base 和 exp 只能按位置传"""
    return base ** exp

print()
print("=== 7. 仅位置参数 / ===")
print("2^10 =", power(2, 10))

# 8. 综合应用：灵活的日志函数
def log(level, *messages, **metadata):
    print(f"  [{level}]", *messages)
    for k, v in metadata.items():
        print(f"    {k}={v}")

print()
print("=== 8. 应用：灵活日志函数 ===")
log("INFO", "启动成功", "监听端口", 8080, user="admin", ip="192.168.1.1")
log("ERROR", "连接失败", code=500, retry=3)

# 9. 字典解包传配置
def make_request(url, method="GET", headers=None, timeout=30):
    print(f"  {method} {url} (timeout={timeout}, headers={headers})")

print()
print("=== 9. 配置解包 ===")
settings = {
    "url": "https://api.example.com",
    "method": "POST",
    "headers": {"Content-Type": "application/json"},
    "timeout": 10,
}
make_request(**settings)`
  },
  {
    id: "py8-return",
    group: "函数编程",
    icon: "↩️",
    title: "返回值与多返回值",
    content: `## return 单值

\`\`\`python
def square(x):  # 定义函数 square，参数：x
    return x * x  # 返回 x * x

r = square(5)   # r = 25
\`\`\`

\`return\` 把结果交回调用处，函数立即结束。

## return 多值（本质返回元组）

Python 没有"多返回值"，但可以**返回元组**并自动解包：

\`\`\`python
def min_max(nums):  # 定义函数 min_max，参数：nums
    return min(nums), max(nums)   # 返回 (min, max) 元组

mn, mx = min_max([3, 1, 4])      # 解包接收
\`\`\`

\`return a, b\` 等价于 \`return (a, b)\`，逗号构造元组。

## 无 return 返回 None

\`\`\`python
def greet(name):  # 定义函数 greet，参数：name
    print(f"你好，{name}")  # 打印输出到屏幕

r = greet("小明")  # 赋值变量 r
print(r)   # None
\`\`\`

| 情况 | 返回值 |
|------|--------|
| 无 \`return\` | \`None\` |
| \`return\`（不带值）| \`None\` |
| \`return 值\` | 该值 |
| \`return a, b\` | 元组 \`(a, b)\` |

## 解包接收多返回值

\`\`\`python
def stats(nums):  # 定义函数 stats，参数：nums
    return sum(nums), len(nums), sum(nums)/len(nums)  # 返回 sum(nums), len(nums), sum(nums)/len(nums)

total, count, avg = stats([1, 2, 3])  # 多重赋值：total, count, avg
\`\`\`

返回值的数量必须与接收变量一致，否则报错。

## 提前 return

\`\`\`python
def check_age(age):  # 定义函数 check_age，参数：age
    if age < 0:  # 如果 age < 0
        return "年龄不能为负"   # 提前返回，后面不执行
    if age > 150:  # 如果 age > 150
        return "年龄不真实"  # 返回 "年龄不真实"
    return "年龄正常"  # 返回 "年龄正常"
\`\`\`

提前 \`return\` 常用于**参数校验**和**提前退出**，减少嵌套。

## return vs print 区别

| 对比 | \`return\` | \`print\` |
|------|-----------|-----------|
| 作用 | 把值交给调用者 | 在屏幕显示 |
| 能否继续计算 | 能（\`add(2,3)*10\`）| 不能 |
| 调用者拿到 | 返回值 | \`None\` |

\`\`\`python
def add_return(a, b):  # 定义函数 add_return，参数：a, b
    return a + b    # 返回值，可继续计算

print(add_return(2, 3) * 10)   # 50
\`\`\`

## yield 简介

\`yield\` 用于**生成器**，让函数"暂停"并产出一个值，下次调用从暂停处继续：

\`\`\`python
def count_up(n):  # 定义函数 count_up，参数：n
    for i in range(1, n+1):  # 遍历 range(1, n+1)，取值给 i
        yield i      # 产出 i 并暂停

list(count_up(3))     # [1, 2, 3]
\`\`\`

\`return\` 一次性返回并结束，\`yield\` 可以产出多次。

下面的 demo 演示各种返回值情况。`,
    code: `# 返回值与多返回值完整演示

# 1. return 单值
def square(x):
    return x * x

print("=== 1. return 单值 ===")
print("square(6) =", square(6))

# 2. return 多值（本质返回元组）
def min_max(nums):
    return min(nums), max(nums)   # 逗号构造元组

result = min_max([3, 1, 4, 1, 5, 9, 2, 6])
print()
print("=== 2. return 多值 ===")
print("返回结果:", result, "类型:", type(result).__name__)

# 3. 解包接收多返回值
mn, mx = min_max([3, 1, 4, 1, 5, 9, 2, 6])
print(f"解包接收：最小={mn}, 最大={mx}")

# 返回三个值
def stats(nums):
    return sum(nums), len(nums), sum(nums) / len(nums)

total, count, avg = stats([10, 20, 30])
print(f"统计：总和={total}, 个数={count}, 平均={avg}")

# 4. 无 return 返回 None
def greet(name):
    print(f"  你好，{name}")

print()
print("=== 4. 无 return 返回 None ===")
r = greet("小明")
print("greet 的返回值:", r)

# return 不带值也是 None
def early_exit():
    print("  执行到一半")
    return          # 直接结束，返回 None
    print("这行不会执行")

r2 = early_exit()
print("early_exit 返回值:", r2)

# 5. 提前 return：参数校验
def check_age(age):
    if age < 0:
        return "年龄不能为负"
    if age > 150:
        return "年龄不真实"
    return "年龄正常"

print()
print("=== 5. 提前 return ===")
print("check_age(-5):", check_age(-5))
print("check_age(200):", check_age(200))
print("check_age(20):", check_age(20))

# 6. return vs print 区别
def add_print(a, b):
    print(a + b)       # 只是打印，不返回

def add_return(a, b):
    return a + b       # 返回值，可继续计算

print()
print("=== 6. return vs print ===")
x = add_print(2, 3)
y = add_return(2, 3)
print("add_print 结果:", x)        # None
print("add_return 结果:", y)       # 5
print("add_return 可继续计算:", add_return(2, 3) * 10)   # 50

# 7. yield 简介：生成器
def count_up(n):
    for i in range(1, n + 1):
        yield i        # 产出 i 并暂停，下次调用继续

print()
print("=== 7. yield 生成器 ===")
print("list(count_up(5)):", list(count_up(5)))

# 逐个产出
gen = count_up(3)
print("next():", next(gen))
print("next():", next(gen))
print("next():", next(gen))

# 8. 返回函数（高阶函数）
def make_multiplier(factor):
    def multiply(x):
        return x * factor
    return multiply     # 返回一个函数

print()
print("=== 8. 返回函数 ===")
double = make_multiplier(2)
triple = make_multiplier(3)
print("double(5):", double(5))
print("triple(5):", triple(5))

# 9. 返回字典/列表
def make_person(name, age, city):
    return {
        "name": name,
        "age": age,
        "city": city,
        "intro": f"{name}，{age}岁，来自{city}"
    }

print()
print("=== 9. 返回字典 ===")
p = make_person("小明", 20, "北京")
for k, v in p.items():
    print(f"  {k}: {v}")`
  },
  {
    id: "py8-scope",
    group: "函数编程",
    icon: "🌐",
    title: "作用域 LEGB 规则",
    content: `## 什么是作用域

作用域是**变量可见的范围**。Python 用 **LEGB 规则**查找变量：

| 缩写 | 名称 | 说明 |
|------|------|------|
| **L** | Local | 局部作用域（函数内部）|
| **E** | Enclosing | 嵌套函数的外层作用域 |
| **G** | Global | 全局作用域（模块级）|
| **B** | Built-in | 内置作用域（\`print\`、\`len\` 等）|

查找顺序：**L → E → G → B**，找到就用，找不到报错。

## Local 局部作用域

\`\`\`python
def func():  # 定义函数 func
    x = 100       # 局部变量，函数外访问不到
    print(x)  # 打印输出到屏幕

func()  # 调用 func()
print(x)   # 报错：x 未定义
\`\`\`

## Enclosing 嵌套作用域

\`\`\`python
def outer():  # 定义函数 outer
    msg = "外层变量"  # 定义字符串 msg
    def inner():  # 定义函数 inner
        print(msg)   # 找不到局部，找外层（enclosing）
    inner()  # 调用 inner()
\`\`\`

## Global 全局作用域

\`\`\`python
g = "全局变量"  # 定义字符串 g

def read_global():  # 定义函数 read_global
    print(g)   # 函数内可以读取全局
\`\`\`

## Built-in 内置作用域

\`\`\`python
def use_builtin():  # 定义函数 use_builtin
    print(len([1, 2, 3]))   # len 是内置
\`\`\`

## LEGB 查找顺序演示

\`\`\`python
x = "global x"  # 定义字符串 x

def outer():  # 定义函数 outer
    x = "enclosing x"  # 定义字符串 x
    def inner():  # 定义函数 inner
        x = "local x"  # 定义字符串 x
        print(x)   # 找到 local x
    inner()  # 调用 inner()
    print(x)       # 找到 outer 的 local x
\`\`\`

## locals() 与 globals()

\`\`\`python
def demo():  # 定义函数 demo
    a = 1  # 定义数值 a
    b = 2  # 定义数值 b
    print(locals())    # {'a': 1, 'b': 2}

g = 10  # 定义数值 g
print(globals())   # 全局变量字典
\`\`\`

## 不可变对象在函数内修改

\`\`\`python
def try_change(n):  # 定义函数 try_change，参数：n
    n = 999        # 重新赋值，外部不变

num = 10  # 定义数值 num
try_change(num)  # 调用 try_change()
print(num)   # 还是 10
\`\`\`

整数、字符串、元组是**不可变**，函数内重新赋值不影响外部。

## 可变对象在函数内修改

\`\`\`python
def append_item(lst):  # 定义函数 append_item，参数：lst
    lst.append(99)   # 修改对象内容

my_list = [1, 2, 3]  # 定义列表 my_list
append_item(my_list)  # 调用 append_item()
print(my_list)   # [1, 2, 3, 99]  也变了
\`\`\`

列表、字典、集合是**可变**，函数内修改会影响外部。

## 可变 vs 不可变对象对比

| 类型 | 可变？ | 函数内修改影响外部？ |
|------|--------|----------------------|
| int / float / bool | 不可变 | 否 |
| str / tuple | 不可变 | 否 |
| list / dict / set | 可变 | 是 |

下面的 demo 直观演示 LEGB 规则和可变/不可变对象的差异。`,
    code: `# 作用域 LEGB 规则完整演示

# 1. Local 局部作用域
def func_local():
    x = 100   # 局部变量
    print("  函数内 x:", x)

print("=== 1. Local 局部作用域 ===")
func_local()

# 2. Global 全局作用域：函数内可读取
g = "我是全局变量"

def read_global():
    print("  函数内读取全局:", g)

print()
print("=== 2. Global 全局作用域 ===")
read_global()

# 3. Built-in 内置作用域
def use_builtin():
    print("  内置 len:", len([1, 2, 3]))
    print("  内置 print:", type(print).__name__)

print()
print("=== 3. Built-in 内置作用域 ===")
use_builtin()

# 4. Enclosing 嵌套作用域
def outer_enc():
    msg = "外层函数的变量"
    def inner_enc():
        print("  内层读取 enclosing:", msg)
    inner_enc()

print()
print("=== 4. Enclosing 嵌套作用域 ===")
outer_enc()

# 5. LEGB 查找顺序
x = "global x"

def outer_legb():
    x = "enclosing x"
    def inner_legb():
        x = "local x"
        print("  inner 内 x:", x)   # 找到 Local
    inner_legb()
    print("  outer 内 x:", x)       # 找到 outer 的 Local

print()
print("=== 5. LEGB 查找顺序 ===")
outer_legb()
print("  全局 x:", x)

# 6. locals() 和 globals()
def demo_scope():
    a = 1
    b = 2
    print("  locals():", locals())

print()
print("=== 6. locals() 与 globals() ===")
demo_scope()
print("  全局变量 g 在 globals 中:", 'g' in globals())

# 7. 不可变对象在函数内修改（不影响外部）
def try_change(n):
    print("  修改前 n:", n)
    n = 999        # 重新赋值，创建新对象
    print("  修改后 n:", n)

num = 10
print()
print("=== 7. 不可变对象修改 ===")
try_change(num)
print("  函数外 num:", num)   # 还是 10

# 8. 可变对象在函数内修改（影响外部）
def append_item(lst):
    lst.append(99)
    print("  函数内 lst:", lst)

my_list = [1, 2, 3]
print()
print("=== 8. 可变对象修改 ===")
print("  调用前 my_list:", my_list)
append_item(my_list)
print("  调用后 my_list:", my_list)   # 也变了

# 9. 函数内读取全局常量
PI = 3.14159

def circle_area(r):
    return PI * r * r     # 读取全局 PI，无需 global

print()
print("=== 9. 读取全局常量 ===")
print("  半径 2 的圆面积:", round(circle_area(2), 4))

# 10. 避免可变默认参数陷阱
def add_item(item, lst=None):
    """正确写法：默认值用 None，函数内创建"""
    if lst is None:
        lst = []
    lst.append(item)
    return lst

print()
print("=== 10. 避免可变默认参数陷阱 ===")
print("  调用1:", add_item(1))
print("  调用2:", add_item(2))   # 不会累积，每次都是新列表
print("  带初始:", add_item(3, [0]))`
  },
  {
    id: "py8-global-nonlocal",
    group: "函数编程",
    icon: "🌍",
    title: "global 与 nonlocal",
    content: `## global 声明全局变量

函数内**读取**全局变量无需声明，但**修改**（重新赋值）不可变全局变量需要 \`global\`：

\`\`\`python
counter = 0  # 定义数值 counter

def increment():  # 定义函数 increment
    global counter   # 声明使用全局 counter
    counter += 1     # 修改全局变量

increment()  # 调用 increment()
print(counter)   # 1
\`\`\`

### 不用 global 会怎样

\`\`\`python
counter = 0  # 定义数值 counter

def bad():  # 定义函数 bad
    counter = counter + 1   # 报错 UnboundLocalError
\`\`\`

Python 看到 \`counter =\` 就认为 \`counter\` 是局部变量，但还没赋值就读取，报错。

## nonlocal 声明外层函数变量

\`nonlocal\` 用于**嵌套函数**中修改外层函数的变量：

\`\`\`python
def make_counter():  # 定义函数 make_counter
    count = 0  # 定义数值 count
    def inc():  # 定义函数 inc
        nonlocal count   # 声明使用外层 count
        count += 1  # count 累加
        return count  # 返回 count
    return inc  # 返回 inc

c = make_counter()  # 赋值变量 c
c()   # 1
c()   # 2
\`\`\`

## global vs nonlocal 对比

| 关键字 | 作用对象 | 用途 |
|--------|----------|------|
| \`global\` | 模块级全局变量 | 修改全局 |
| \`nonlocal\` | 外层函数的变量 | 修改 enclosing |

## 何时需要

| 场景 | 是否需要声明 |
|------|--------------|
| 读取全局变量 | 不需要 |
| 修改不可变全局（int/str）| 需要 \`global\` |
| 修改可变全局（list/dict）| 不需要（修改内容）|
| 修改外层函数变量 | 需要 \`nonlocal\` |

## 可变对象无需 global

\`\`\`python
scores = []  # 定义列表 scores

def add_score(s):  # 定义函数 add_score，参数：s
    scores.append(s)   # 修改内容，不需要 global

add_score(90)  # 调用 add_score()
print(scores)   # [90]
\`\`\`

## nonlocal 与闭包

\`nonlocal\` 是闭包修改状态的关键：

\`\`\`python
def make_multiplier(factor):  # 定义函数 make_multiplier，参数：factor
    def multiply(x):  # 定义函数 multiply，参数：x
        return x * factor   # factor 是 enclosing 变量
    return multiply  # 返回 multiply
\`\`\`

## 避免滥用

\`global\` 让函数依赖外部状态，难以测试和维护。**能用类封装就用类**：

\`\`\`python
class Counter:  # 定义类 Counter
    def __init__(self):  # 定义函数 __init__，参数：self
        self.count = 0  # 执行操作
    def inc(self):  # 定义函数 inc，参数：self
        self.count += 1  # 执行操作
        return self.count  # 返回 self.count
\`\`\`

下面的 demo 演示 global 和 nonlocal 的各种用法。`,
    code: `# global 与 nonlocal 完整演示

# 1. 不用 global：函数内赋值创建局部变量
count = 0

def bad_increment():
    count = 1     # 只创建局部变量，不影响全局
    print("  函数内 count:", count)

print("=== 1. 不用 global（创建局部变量）===")
bad_increment()
print("  全局 count:", count)   # 还是 0

# 2. 用 global 声明：可以修改全局
counter = 0

def increment():
    global counter   # 声明使用全局 counter
    counter += 1

print()
print("=== 2. 用 global 修改全局 ===")
increment()
increment()
increment()
print("  counter:", counter)   # 3

# 3. 修改不可变全局需要 global
total = 0

def add_to_total(n):
    global total   # 整数不可变，必须 global
    total += n

add_to_total(10)
add_to_total(20)
print()
print("=== 3. 修改不可变全局 ===")
print("  total:", total)   # 30

# 4. 可变对象无需 global
scores = []

def add_score(s):
    scores.append(s)   # 修改对象内容，不需要 global

add_score(90)
add_score(85)
print()
print("=== 4. 可变对象无需 global ===")
print("  scores:", scores)

# 5. nonlocal 声明外层函数变量
def make_counter():
    count = 0          # 外层函数变量
    def inc():
        nonlocal count  # 声明使用外层的 count
        count += 1
        return count
    return inc

c = make_counter()
print()
print("=== 5. nonlocal 计数器 ===")
print("  计数:", c(), c(), c())   # 1 2 3

# 6. nonlocal 与闭包
def make_multiplier(factor):
    def multiply(x):
        return x * factor   # factor 是 enclosing 变量
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)
print()
print("=== 6. nonlocal 与闭包 ===")
print("  double(5):", double(5))
print("  triple(5):", triple(5))

# 7. nonlocal 修改外层变量
def outer():
    x = 10
    print("  outer 内 x 初始:", x)
    def inner():
        nonlocal x
        x = 20          # 修改外层 x
        print("  inner 内 x:", x)
    inner()
    print("  outer 内 x 修改后:", x)   # 20

print()
print("=== 7. nonlocal 修改外层 ===")
outer()

# 8. 避免滥用 global：用类替代
class Counter:
    """用类封装状态，比 global 更清晰"""
    def __init__(self):
        self.count = 0
    def inc(self):
        self.count += 1
        return self.count
    def reset(self):
        self.count = 0

print()
print("=== 8. 用类替代 global ===")
cnt = Counter()
print("  计数:", cnt.inc(), cnt.inc(), cnt.inc())
cnt.reset()
print("  重置后:", cnt.inc())

# 9. 多层嵌套的 nonlocal
def level1():
    x = 1
    def level2():
        x = 2
        def level3():
            nonlocal x    # 修改 level2 的 x
            x = 99
            print("  level3 修改 level2 的 x:", x)
        level3()
        print("  level2 的 x:", x)
    level2()
    print("  level1 的 x:", x)   # 不受影响

print()
print("=== 9. 多层嵌套 nonlocal ===")
level1()`
  },
  {
    id: "py8-closure",
    group: "函数编程",
    icon: "🔐",
    title: "闭包详解",
    content: `## 闭包是什么

闭包 = **函数 + 它引用的环境变量**。当一个内层函数引用了外层函数的变量，且被返回出去，就形成了闭包。

\`\`\`python
def make_adder(x):  # 定义函数 make_adder，参数：x
    def adder(y):  # 定义函数 adder，参数：y
        return x + y   # x 是自由变量，引用外层
    return adder  # 返回 adder

add5 = make_adder(5)  # 赋值变量 add5
add5(3)   # 8，x 被记住
\`\`\`

\`add5\` 即使 \`make_adder\` 已经执行完，仍"记住"了 \`x=5\`，这就是闭包。

## 自由变量

被内层函数引用、但不在内层函数定义的外层变量，叫**自由变量**。闭包会把这些自由变量"绑定"到函数上。

## __closure__ 查看闭包

\`\`\`python
add5 = make_adder(5)  # 赋值变量 add5
print(add5.__closure__)              # 显示 cell 对象
print(add5.__closure__[0].cell_contents)   # 5
\`\`\`

## 闭包陷阱：循环变量延迟绑定

\`\`\`python
funcs = []  # 定义列表 funcs
for i in range(3):  # 遍历 range(3)，取值给 i
    funcs.append(lambda: i)   # 都引用同一个 i

print([f() for f in funcs])   # [2, 2, 2] 不是 [0,1,2]！
\`\`\`

因为 lambda 在**调用时**才查找 \`i\`，那时循环已结束，\`i=2\`。

### 修复方法：用默认参数固定

\`\`\`python
funcs = []  # 定义列表 funcs
for i in range(3):  # 遍历 range(3)，取值给 i
    funcs.append(lambda i=i: i)   # 默认参数在定义时求值

print([f() for f in funcs])   # [0, 1, 2]
\`\`\`

## 闭包应用

### 计数器

\`\`\`python
def make_counter():  # 定义函数 make_counter
    count = 0  # 定义数值 count
    def counter():  # 定义函数 counter
        nonlocal count  # 声明非局部变量 count
        count += 1  # count 累加
        return count  # 返回 count
    return counter  # 返回 counter
\`\`\`

### 缓存

\`\`\`python
def memoize(fn):  # 定义函数 memoize，参数：fn
    cache = {}  # 定义字典 cache
    def wrapper(n):  # 定义函数 wrapper，参数：n
        if n not in cache:  # 如果 n not in cache
            cache[n] = fn(n)  # 执行操作
        return cache[n]  # 返回 cache[n]
    return wrapper  # 返回 wrapper
\`\`\`

### 配置工厂

\`\`\`python
def make_greeter(greeting):  # 定义函数 make_greeter，参数：greeting
    def greeter(name):  # 定义函数 greeter，参数：name
        return f"{greeting}，{name}！"  # 返回 f"{greeting}，{name}！"
    return greeter  # 返回 greeter

hello = make_greeter("你好")  # 赋值变量 hello
\`\`\`

## 闭包 vs global 对比

| 对比 | 闭包 | global |
|------|------|--------|
| 状态封装 | ✅ 私有 | ❌ 全局可见 |
| 多实例 | ✅ 独立 | ❌ 共享一个 |
| 可测试 | ✅ 隔离 | ❌ 依赖外部 |
| 推荐度 | ✅ 推荐 | ❌ 慎用 |

下面的 demo 演示闭包的原理、陷阱和应用。`,
    code: `# 闭包详解完整演示

# 1. 闭包定义：函数 + 引用环境
def make_adder(x):
    def adder(y):
        return x + y   # x 是自由变量，引用外层
    return adder

add5 = make_adder(5)
add10 = make_adder(10)
print("=== 1. 闭包定义 ===")
print("  add5(3):", add5(3))      # 8
print("  add10(3):", add10(3))    # 13

# 2. __closure__ 查看闭包
print()
print("=== 2. __closure__ 查看 ===")
print("  add5.__closure__:", add5.__closure__)
print("  闭包中的值:", add5.__closure__[0].cell_contents)   # 5

# 3. 闭包陷阱：循环变量延迟绑定
funcs = []
for i in range(3):
    funcs.append(lambda: i)   # 都引用同一个 i

print()
print("=== 3. 闭包陷阱（延迟绑定）===")
print("  陷阱结果:", [f() for f in funcs])   # [2, 2, 2]

# 4. 修复陷阱：用默认参数固定
funcs2 = []
for i in range(3):
    funcs2.append(lambda i=i: i)   # 默认参数在定义时求值

print()
print("=== 4. 修复陷阱（默认参数）===")
print("  修复结果:", [f() for f in funcs2])   # [0, 1, 2]

# 5. 闭包应用：计数器
def make_counter():
    count = 0
    def counter():
        nonlocal count
        count += 1
        return count
    return counter

c = make_counter()
print()
print("=== 5. 闭包应用：计数器 ===")
print("  计数:", c(), c(), c())

# 多个独立计数器
c2 = make_counter()
print("  新计数器:", c2())   # 1，独立

# 6. 闭包应用：缓存（memoize）
def memoize(fn):
    cache = {}
    def wrapper(n):
        if n not in cache:
            cache[n] = fn(n)
            print(f"    计算 {n} 并缓存")
        else:
            print(f"    从缓存读取 {n}")
        return cache[n]
    return wrapper

def slow_square(n):
    return n * n

fast_square = memoize(slow_square)
print()
print("=== 6. 闭包应用：缓存 ===")
print("  第一次 fast_square(4):", fast_square(4))
print("  第二次 fast_square(4):", fast_square(4))

# 7. 闭包应用：配置工厂
def make_greeter(greeting):
    def greeter(name):
        return f"{greeting}，{name}！"
    return greeter

hello = make_greeter("你好")
hi = make_greeter("嗨")
print()
print("=== 7. 闭包应用：配置工厂 ===")
print("  ", hello("小明"))
print("  ", hi("小红"))

# 8. 闭包 vs global 对比
g_count = 0
def g_inc():
    global g_count
    g_count += 1
    return g_count

c_count = make_counter()
print()
print("=== 8. 闭包 vs global ===")
print("  global 计数:", g_inc(), g_inc())
print("  闭包计数:", c_count(), c_count())
print("  闭包状态私有，global 全局可见")

# 9. 闭包实现累加器
def make_accumulator():
    total = 0
    def add(n):
        nonlocal total
        total += n
        return total
    return add

acc = make_accumulator()
print()
print("=== 9. 闭包累加器 ===")
print("  累加 10:", acc(10))
print("  累加 20:", acc(20))
print("  累加 5:", acc(5))`
  },
  {
    id: "py8-decorator-basic",
    group: "函数编程",
    icon: "🎁",
    title: "装饰器基础",
    content: `## 函数作参数

Python 函数是一等对象，可以**作为参数**传递：

\`\`\`python
def shout(text):  # 定义函数 shout，参数：text
    return text.upper()  # 返回 text.upper()

def greet(func):           # 接收函数作为参数
    return func("Hello")  # 返回 func("Hello")

greet(shout)               # HELLO
\`\`\`

## 函数返回函数

\`\`\`python
def make_bold(func):  # 定义函数 make_bold，参数：func
    def wrapper():  # 定义函数 wrapper
        return "<b>" + func() + "</b>"  # 返回 "<b>" + func() + "</b>"
    return wrapper         # 返回内部函数
\`\`\`

## 装饰器 @ 语法糖

\`\`\`python
@make_bold  # 应用装饰器 make_bold
def hello():  # 定义函数 hello
    return "hello"  # 返回 "hello"

# 等价于：hello = make_bold(hello)
hello()   # <b>hello</b>
\`\`\`

\`@make_bold\` 就是把 \`hello\` 传给 \`make_bold\`，再把结果赋回 \`hello\`。

## 装饰器本质

装饰器是一个**接收函数、返回新函数**的函数：

\`\`\`
原函数 -> 装饰器 -> 增强后的新函数
\`\`\`

## 简单日志装饰器

\`\`\`python
def log(func):  # 定义函数 log，参数：func
    def wrapper(*args, **kwargs):  # 定义函数 wrapper，参数：*args, **kwargs
        print(f"调用 {func.__name__}")  # 打印输出到屏幕
        result = func(*args, **kwargs)  # 赋值变量 result
        print(f"返回 {result}")  # 打印输出到屏幕
        return result  # 返回 result
    return wrapper  # 返回 wrapper

@log  # 应用装饰器 log
def add(a, b):  # 定义函数 add，参数：a, b
    return a + b  # 返回 a + b
\`\`\`

\`wrapper(*args, **kwargs)\` 让装饰器能接受任意参数。

## 计时装饰器

\`\`\`python
import time  # 导入模块 time

def timer(func):  # 定义函数 timer，参数：func
    def wrapper(*args, **kwargs):  # 定义函数 wrapper，参数：*args, **kwargs
        start = time.time()  # 赋值变量 start
        result = func(*args, **kwargs)  # 赋值变量 result
        print(f"耗时 {time.time()-start:.6f}s")  # 打印输出到屏幕
        return result  # 返回 result
    return wrapper  # 返回 wrapper
\`\`\`

## functools.wraps 保留元信息

装饰后函数的 \`__name__\`、\`__doc__\` 会变成 \`wrapper\` 的。用 \`functools.wraps\` 修复：

\`\`\`python
from functools import wraps  # 从 functools 导入 wraps

def log(func):  # 定义函数 log，参数：func
    @wraps(func)            # 保留原函数元信息
    def wrapper(*args, **kwargs):  # 定义函数 wrapper，参数：*args, **kwargs
        return func(*args, **kwargs)  # 返回 func(*args, **kwargs)
    return wrapper  # 返回 wrapper
\`\`\`

| 不用 wraps | 用 wraps |
|-----------|----------|
| \`__name__\` 是 \`wrapper\` | \`__name__\` 是原函数名 |
| \`__doc__\` 丢失 | \`__doc__\` 保留 |

## 多个装饰器叠加

\`\`\`python
@decor_a  # 应用装饰器 decor_a
@decor_b  # 应用装饰器 decor_b
def speak():  # 定义函数 speak
    pass  # 空操作，占位符

# 等价于：speak = decor_a(decor_b(speak))
\`\`\`

**装饰顺序**：从下往上（先 decor_b 再 decor_a）
**执行顺序**：从上往下（先 decor_a 的 wrapper，再 decor_b）

下面的 demo 演示装饰器的各种基础用法。`,
    code: `# 装饰器基础完整演示
import functools
import time

# 1. 函数作参数
def shout(text):
    return text.upper()

def whisper(text):
    return text.lower()

def greet(func):           # 接收函数作为参数
    return func("Hello")

print("=== 1. 函数作参数 ===")
print("  shout:", greet(shout))
print("  whisper:", greet(whisper))

# 2. 函数返回函数
def make_bold(func):
    def wrapper():
        return "<b>" + func() + "</b>"
    return wrapper

def hello():
    return "hello"

bold_hello = make_bold(hello)
print()
print("=== 2. 函数返回函数 ===")
print("  ", bold_hello())

# 3. 装饰器 @ 语法糖
@make_bold
def hi():
    return "hi"

print()
print("=== 3. @ 语法糖 ===")
print("  ", hi())   # 自动被装饰

# 4. 简单日志装饰器（接收任意参数）
def log(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"  调用 {func.__name__}({args}, {kwargs})")
        result = func(*args, **kwargs)
        print(f"  {func.__name__} 返回 {result}")
        return result
    return wrapper

@log
def add(a, b):
    return a + b

print()
print("=== 4. 日志装饰器 ===")
print("  结果:", add(3, 5))

# 5. 计时装饰器
def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        elapsed = time.time() - start
        print(f"  {func.__name__} 耗时 {elapsed:.6f} 秒")
        return result
    return wrapper

@timer
def slow_sum(n):
    total = 0
    for i in range(n):
        total += i
    return total

print()
print("=== 5. 计时装饰器 ===")
print("  总和:", slow_sum(100000))

# 6. functools.wraps 保留元信息
def without_wraps(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

def with_wraps(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@without_wraps
def f1():
    """f1 的文档"""
    pass

@with_wraps
def f2():
    """f2 的文档"""
    pass

print()
print("=== 6. functools.wraps 对比 ===")
print("  无 wraps __name__:", f1.__name__)   # wrapper
print("  有 wraps __name__:", f2.__name__)   # f2
print("  有 wraps __doc__:", f2.__doc__)

# 7. 多个装饰器叠加顺序
def decor_a(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print("  A 开始")
        result = func(*args, **kwargs)
        print("  A 结束")
        return result
    return wrapper

def decor_b(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print("  B 开始")
        result = func(*args, **kwargs)
        print("  B 结束")
        return result
    return wrapper

@decor_a
@decor_b
def speak():
    print("  说话中...")

print()
print("=== 7. 多装饰器叠加 ===")
print("  装饰顺序: 从下往上 (先 B 再 A)")
print("  执行顺序: 从上往下 (先 A 再 B)")
speak()

# 8. 带参数的函数装饰器
def log_args(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        all_args = args + tuple(kwargs.values())
        print(f"  {func.__name__} 参数: {all_args}")
        return func(*args, **kwargs)
    return wrapper

@log_args
def introduce(name, age, city="北京"):
    return f"{name}, {age}岁, {city}"

print()
print("=== 8. 带参数装饰 ===")
print("  ", introduce("小明", 20))
print("  ", introduce("小红", 18, city="上海"))`
  },
  {
    id: "py8-decorator-adv",
    group: "函数编程",
    icon: "🎀",
    title: "装饰器进阶与 functools",
    content: `## 带参数的装饰器（三层嵌套）

普通装饰器两层，带参数的需要**三层**：

\`\`\`python
def repeat(n):              # 第1层：接收参数
    def decorator(func):     # 第2层：接收函数
        def wrapper(*args):  # 第3层：接收调用参数
            for _ in range(n):  # 遍历 range(n)，取值给 _
                func(*args)  # 调用 func()
        return wrapper  # 返回 wrapper
    return decorator  # 返回 decorator

@repeat(3)  # 应用装饰器 repeat
def say(msg):  # 定义函数 say，参数：msg
    print(msg)  # 打印输出到屏幕
\`\`\`

\`@repeat(3)\` 先调用 \`repeat(3)\` 得到真正的装饰器，再装饰 \`say\`。

## 类装饰器（__call__）

类实现 \`__call__\` 方法就能像函数一样调用，可以做装饰器：

\`\`\`python
class CountCalls:  # 定义类 CountCalls
    def __init__(self, func):  # 定义函数 __init__，参数：self, func
        self.func = func  # 执行操作
        self.count = 0  # 执行操作
    def __call__(self, *args, **kwargs):  # 定义函数 __call__，参数：self, *args, **kwargs
        self.count += 1  # 执行操作
        return self.func(*args, **kwargs)  # 返回 self.func(*args, **kwargs)
\`\`\`

类装饰器适合**需要维护状态**的场景。

## 装饰类方法

\`\`\`python
class Calculator:  # 定义类 Calculator
    @log_method  # 应用装饰器 log_method
    def add(self, a, b):  # 定义函数 add，参数：self, a, b
        return a + b  # 返回 a + b
\`\`\`

注意 wrapper 的第一个参数是 \`self\`。

## functools.lru_cache 缓存

\`lru_cache\` 自动缓存函数结果，相同参数不重复计算：

\`\`\`python
from functools import lru_cache  # 从 functools 导入 lru_cache

@lru_cache(maxsize=128)  # 应用装饰器 lru_cache
def fib(n):  # 定义函数 fib，参数：n
    if n < 2:  # 如果 n < 2
        return n  # 返回 n
    return fib(n-1) + fib(n-2)  # 返回 fib(n-1) + fib(n-2)

fib(100)   # 飞快，因为有缓存
\`\`\`

| 对比 | 无缓存 | 有 lru_cache |
|------|--------|-------------|
| fib(35) | 约 1 秒 | 瞬间 |
| fib(100) | 几乎算不完 | 瞬间 |

## functools.partial 偏函数

固定部分参数，生成新函数：

\`\`\`python
from functools import partial  # 从 functools 导入 partial

def power(base, exp):  # 定义函数 power，参数：base, exp
    return base ** exp  # 返回 base ** exp

square = partial(power, exp=2)   # 固定 exp=2
square(5)   # 25
\`\`\`

## functools.wraps

保留被装饰函数的元信息（\`__name__\`、\`__doc__\`），是装饰器的标配。

## 实战案例

### 重试装饰器

\`\`\`python
def retry(times=3):  # 定义函数 retry，参数：times=3
    def decorator(func):  # 定义函数 decorator，参数：func
        @wraps(func)  # 应用装饰器 wraps
        def wrapper(*args, **kwargs):  # 定义函数 wrapper，参数：*args, **kwargs
            for i in range(times):  # 遍历 range(times)，取值给 i
                try:  # 尝试执行可能出错的代码
                    return func(*args, **kwargs)  # 返回 func(*args, **kwargs)
                except Exception:  # 捕获异常 Exception:
                    pass  # 空操作，占位符
        return wrapper  # 返回 wrapper
    return decorator  # 返回 decorator
\`\`\`

### 权限检查

\`\`\`python
def require_role(role):  # 定义函数 require_role，参数：role
    def decorator(func):  # 定义函数 decorator，参数：func
        @wraps(func)  # 应用装饰器 wraps
        def wrapper(user, *args, **kwargs):  # 定义函数 wrapper，参数：user, *args, **kwargs
            if user.get("role") != role:  # 如果 user.get("role") != role
                raise PermissionError  # 抛出异常：PermissionError
            return func(user, *args, **kwargs)  # 返回 func(user, *args, **kwargs)
        return wrapper  # 返回 wrapper
    return decorator  # 返回 decorator
\`\`\`

下面的 demo 演示所有进阶用法。`,
    code: `# 装饰器进阶与 functools 完整演示
import functools
import time

# 1. 带参数的装饰器（三层嵌套）
def repeat(n):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for i in range(n):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def say(msg):
    print(f"  重复说: {msg}")

print("=== 1. 带参数装饰器 ===")
say("你好")

# 2. 类装饰器（实现 __call__）
class CountCalls:
    def __init__(self, func):
        self.func = func
        self.count = 0
        functools.update_wrapper(self, func)

    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"  第 {self.count} 次调用 {self.func.__name__}")
        return self.func(*args, **kwargs)

@CountCalls
def greet(name):
    return f"你好，{name}"

print()
print("=== 2. 类装饰器 ===")
print("  ", greet("小明"))
print("  ", greet("小红"))
print("  总调用次数:", greet.count)

# 3. 装饰类方法
def log_method(func):
    @functools.wraps(func)
    def wrapper(self, *args, **kwargs):
        print(f"  调用 {self.__class__.__name__}.{func.__name__}")
        return func(self, *args, **kwargs)
    return wrapper

class Calculator:
    @log_method
    def add(self, a, b):
        return a + b
    @log_method
    def sub(self, a, b):
        return a - b

print()
print("=== 3. 装饰类方法 ===")
calc = Calculator()
print("  add(2, 3):", calc.add(2, 3))
print("  sub(5, 2):", calc.sub(5, 2))

# 4. functools.lru_cache 缓存
@functools.lru_cache(maxsize=128)
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print()
print("=== 4. lru_cache 缓存 ===")
print("  fib(50):", fib(50))
print("  缓存信息:", fib.cache_info())

# 对比无缓存版本
def fib_slow(n):
    if n < 2:
        return n
    return fib_slow(n - 1) + fib_slow(n - 2)

print("  fib_slow(25) 无缓存:", fib_slow(25))

# 5. functools.partial 偏函数
def power(base, exp):
    return base ** exp

square = functools.partial(power, exp=2)
cube = functools.partial(power, exp=3)
print()
print("=== 5. functools.partial ===")
print("  square(5):", square(5))
print("  cube(2):", cube(2))

# partial 固定位置参数
int2 = functools.partial(int, base=2)   # 二进制转换
print("  int2('1010'):", int2("1010"))

# 6. functools.wraps 保留元信息
def my_decorator(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@my_decorator
def example():
    """示例函数文档"""
    pass

print()
print("=== 6. functools.wraps ===")
print("  __name__:", example.__name__)
print("  __doc__:", example.__doc__)

# 7. 实战：重试装饰器
def retry(times=3):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_error = None
            for i in range(times):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_error = e
                    print(f"  第 {i+1} 次失败: {e}")
            raise Exception(f"重试 {times} 次后仍失败: {last_error}")
        return wrapper
    return decorator

call_count = 0

@retry(times=3)
def flaky():
    global call_count
    call_count += 1
    if call_count < 3:
        raise ValueError("临时错误")
    return "成功"

print()
print("=== 7. 重试装饰器 ===")
try:
    print("  结果:", flaky())
except Exception as e:
    print("  最终失败:", e)

# 8. 实战：权限检查
def require_role(role):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(user, *args, **kwargs):
            if user.get("role") != role:
                raise PermissionError(f"需要 {role} 权限，当前是 {user.get('role')}")
            return func(user, *args, **kwargs)
        return wrapper
    return decorator

@require_role("admin")
def delete_user(user, uid):
    return f"删除用户 {uid}"

admin = {"name": "老板", "role": "admin"}
guest = {"name": "访客", "role": "guest"}

print()
print("=== 8. 权限检查 ===")
print("  admin:", delete_user(admin, 123))
try:
    print("  guest:", delete_user(guest, 123))
except PermissionError as e:
    print("  guest 被拒绝:", e)`
  },
  {
    id: "py8-recursion-lambda",
    group: "函数编程",
    icon: "🌀",
    title: "递归与 lambda 匿名函数",
    content: `## 递归定义

递归是**函数调用自己**。必须有两个要素：

1. **终止条件**（base case）：不再递归，直接返回
2. **递归调用**：向终止条件靠近

\`\`\`python
def countdown(n):  # 定义函数 countdown，参数：n
    if n <= 0:           # 终止条件
        print("发射！")  # 打印输出到屏幕
        return  # 返回 None
    print(n)  # 打印输出到屏幕
    countdown(n - 1)     # 递归调用
\`\`\`

## 阶乘

\`\`\`python
def factorial(n):  # 定义函数 factorial，参数：n
    if n <= 1:            # 终止：1! = 1
        return 1  # 返回 1
    return n * factorial(n - 1)   # n! = n * (n-1)!

factorial(5)   # 120
\`\`\`

## 斐波那契

\`\`\`python
def fib(n):  # 定义函数 fib，参数：n
    if n < 2:             # 终止
        return n  # 返回 n
    return fib(n-1) + fib(n-2)  # 返回 fib(n-1) + fib(n-2)
\`\`\`

## 递归深度限制

Python 默认递归深度 **1000**，超过会报 \`RecursionError\`：

\`\`\`python
import sys  # 导入模块 sys
print(sys.getrecursionlimit())   # 1000
sys.setrecursionlimit(2000)      # 可调高（谨慎）
\`\`\`

## 递归 vs 迭代

| 对比 | 递归 | 迭代 |
|------|------|------|
| 可读性 | 高（接近数学定义）| 中 |
| 性能 | 低（函数调用开销）| 高 |
| 栈溢出 | 可能 | 不会 |
| 适用 | 树形结构、分治 | 线性计算 |

## lambda 匿名函数

\`\`\`python
lambda 参数: 表达式  # 执行操作
\`\`\`

- **匿名**：不需要 \`def\` 起名
- **单表达式**：只能写一个表达式，不能多语句
- **返回值**：表达式的结果

\`\`\`python
square = lambda x: x * x  # 定义 lambda 函数，赋给 square
square(5)   # 25

# 等价于
def square(x):  # 定义函数 square，参数：x
    return x * x  # 返回 x * x
\`\`\`

## lambda 与 map

\`\`\`python
nums = [1, 2, 3]  # 定义列表 nums
squared = list(map(lambda x: x*x, nums))   # [1, 4, 9]
\`\`\`

## lambda 与 filter

\`\`\`python
nums = [1, 2, 3, 4]  # 定义列表 nums
evens = list(filter(lambda x: x%2==0, nums))   # [2, 4]
\`\`\`

## lambda 与 sorted key

\`\`\`python
students = [("小明", 90), ("小红", 85)]  # 定义列表 students
sorted(students, key=lambda s: s[1])   # 按分数排序
\`\`\`

## lambda 限制

只能**单个表达式**，不能有语句（\`if\`、\`for\`、\`while\`、赋值）：

\`\`\`python
# 合法
f = lambda x: x + 1  # 定义 lambda 函数，赋给 f

# 非法（多语句）
# f = lambda x: x += 1; return x
\`\`\`

## 常见用法

- 排序的 \`key\`
- \`map\` / \`filter\` 的函数
- 简单回调
- 默认参数固定（\`lambda i=i: i\`）

下面的 demo 演示递归和 lambda 的各种用法。`,
    code: `# 递归与 lambda 匿名函数完整演示
import sys

# 1. 递归定义与终止条件
def countdown(n):
    if n <= 0:            # 终止条件
        print("  发射！")
        return
    print("  ", n)
    countdown(n - 1)      # 递归调用

print("=== 1. 递归倒计时 ===")
countdown(3)

# 2. 阶乘
def factorial(n):
    if n <= 1:            # 终止：1! = 1
        return 1
    return n * factorial(n - 1)   # n! = n * (n-1)!

print()
print("=== 2. 阶乘 ===")
print("  5! =", factorial(5))
print("  10! =", factorial(10))

# 3. 斐波那契
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print()
print("=== 3. 斐波那契 ===")
print("  fib 序列:", [fib(i) for i in range(10)])

# 4. 递归深度限制
print()
print("=== 4. 递归深度限制 ===")
print("  默认限制:", sys.getrecursionlimit())

def deep(n):
    if n == 0:
        return "到底了"
    return deep(n - 1)

# 临时调高
old_limit = sys.getrecursionlimit()
sys.setrecursionlimit(2000)
try:
    print("  deep(1500):", deep(1500))
except RecursionError:
    print("  超出递归深度")
sys.setrecursionlimit(old_limit)

# 5. 递归 vs 迭代
def sum_recursive(n):
    if n == 0:
        return 0
    return n + sum_recursive(n - 1)

def sum_iterative(n):
    total = 0
    for i in range(n + 1):
        total += i
    return total

print()
print("=== 5. 递归 vs 迭代 ===")
print("  递归求和 100:", sum_recursive(100))
print("  迭代求和 100:", sum_iterative(100))

# 6. lambda 语法
square = lambda x: x * x
print()
print("=== 6. lambda 语法 ===")
print("  lambda 平方:", square(5))

# 等价的 def
def square_def(x):
    return x * x
print("  def 平方:", square_def(5))

# 多参数 lambda
add = lambda a, b: a + b
print("  lambda 加法:", add(3, 4))

# 7. lambda 与 map
nums = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x * x, nums))
print()
print("=== 7. lambda 与 map ===")
print("  原始:", nums)
print("  map 平方:", squared)

# map 多个序列
sums = list(map(lambda a, b: a + b, [1, 2, 3], [10, 20, 30]))
print("  map 多序列:", sums)

# 8. lambda 与 filter
evens = list(filter(lambda x: x % 2 == 0, nums))
print()
print("=== 8. lambda 与 filter ===")
print("  原始:", nums)
print("  偶数:", evens)
gt3 = list(filter(lambda x: x > 3, nums))
print("  大于3:", gt3)

# 9. lambda 与 sorted key
students = [("小明", 90), ("小红", 85), ("小刚", 95), ("小李", 85)]
print()
print("=== 9. lambda 与 sorted ===")
print("  原始:", students)
print("  按分数降序:", sorted(students, key=lambda s: s[1], reverse=True))
print("  按姓名:", sorted(students, key=lambda s: s[0]))
print("  分数+姓名:", sorted(students, key=lambda s: (-s[1], s[0])))

# 10. lambda 常见用法
words = ["banana", "apple", "cherry", "date"]
print()
print("=== 10. lambda 常见用法 ===")
print("  按长度排序:", sorted(words, key=lambda w: len(w)))
print("  按字母排序:", sorted(words))

# 11. lambda 限制：只能单表达式
print()
print("=== 11. lambda 限制 ===")
print("  合法：lambda x: x * 2")
print("  非法：lambda x: x += 1 (赋值语句)")
print("  非法：lambda x: for ... (循环语句)")

# 12. lambda 默认参数固定（闭包陷阱修复）
funcs = [lambda i=i: i for i in range(3)]
print()
print("=== 12. lambda 默认参数 ===")
print("  固定结果:", [f() for f in funcs])`
  },
  {
    id: "py8-map-filter-reduce",
    group: "函数编程",
    icon: "⚙️",
    title: "map filter reduce 高阶函数",
    content: `## map 映射

\`map\` 把函数应用到**每个元素**，返回新迭代器：

\`\`\`python
nums = [1, 2, 3]  # 定义列表 nums
squared = list(map(lambda x: x*x, nums))  # 赋值变量 squared
# [1, 4, 9]
\`\`\`

\`map\` 返回的是迭代器，要用 \`list()\` 转成列表才能看到结果。

### map 多个序列

\`\`\`python
list(map(lambda a, b: a+b, [1,2,3], [10,20,30]))  # 转为列表
# [11, 22, 33]
\`\`\`

## filter 过滤

\`filter\` 保留**返回 True** 的元素：

\`\`\`python
nums = [1, 2, 3, 4]  # 定义列表 nums
evens = list(filter(lambda x: x%2==0, nums))  # 赋值变量 evens
# [2, 4]
\`\`\`

## reduce 聚合

\`reduce\` 把列表**逐步合并**成一个值，在 \`functools\` 模块：

\`\`\`python
from functools import reduce  # 从 functools 导入 reduce

reduce(lambda a, b: a + b, [1, 2, 3, 4])  # 调用 reduce()
# ((1+2)+3)+4 = 10
\`\`\`

| 函数 | 作用 | 结果 |
|------|------|------|
| \`map\` | 一对一变换 | 同长度序列 |
| \`filter\` | 筛选 | 子集 |
| \`reduce\` | 多对一聚合 | 单个值 |

## lambda 配合

\`map\` / \`filter\` / \`reduce\` 常配合 \`lambda\` 写简洁代码：

\`\`\`python
nums = [1, 2, 3, 4, 5]  # 定义列表 nums
sum_of_squares = reduce(lambda a, b: a + b,  # 赋值变量 sum_of_squares
                        map(lambda x: x*x, nums))  # 映射
# 55
\`\`\`

## 列表推导式对比

同样的事，推导式更 Pythonic：

\`\`\`python
# map + filter
list(map(lambda x: x*x, filter(lambda x: x%2==0, nums)))  # 转为列表

# 推导式（推荐）
[x*x for x in nums if x%2==0]  # 列表推导式
\`\`\`

| 写法 | 可读性 | 性能 |
|------|--------|------|
| map/filter + lambda | 函数式风格 | 中 |
| 列表推导式 | Pythonic，推荐 | 高 |

## any 和 all

\`\`\`python
any(x > 5 for x in [1, 6, 3])   # True，至少一个满足
all(x > 0 for x in [1, 2, 3])   # True，全部满足
\`\`\`

## sorted / sort 的 key

\`\`\`python
sorted([3, 1, 2])                       # [1, 2, 3]
sorted(["bb", "a", "ccc"], key=len)     # 按长度
sorted(students, key=lambda s: s[1])    # 按某字段
\`\`\`

## operator 模块

\`operator\` 提供运算符的函数形式，可替代 lambda：

\`\`\`python
import operator  # 导入模块 operator
list(map(operator.add, [1,2], [3,4]))   # [4, 6]
operator.itemgetter(1)(("a", 100))      # 100
\`\`\`

## 函数式编程思想

- **数据流**：数据经过一系列变换得到结果
- **无副作用**：函数不修改外部状态
- **高阶函数**：函数作为参数/返回值

下面的 demo 综合演示所有高阶函数。`,
    code: `# map filter reduce 高阶函数完整演示
from functools import reduce
import operator

nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# 1. map 映射
squared = list(map(lambda x: x * x, nums))
print("=== 1. map 映射 ===")
print("  原始:", nums)
print("  平方:", squared)

# map 多个序列
sums = list(map(lambda a, b: a + b, [1, 2, 3], [10, 20, 30]))
print("  map 多序列:", sums)

# map 转换类型
strs = ["1", "2", "3"]
ints = list(map(int, strs))
print("  map 转类型:", ints)

# 2. filter 过滤
evens = list(filter(lambda x: x % 2 == 0, nums))
print()
print("=== 2. filter 过滤 ===")
print("  偶数:", evens)

gt5 = list(filter(lambda x: x > 5, nums))
print("  大于5:", gt5)

# filter 配合 None（去空）
mixed = [0, 1, "", "a", None, [], [1]]
truthy = list(filter(None, mixed))
print("  去假值:", truthy)

# 3. reduce 聚合
total = reduce(lambda a, b: a + b, nums)
print()
print("=== 3. reduce 聚合 ===")
print("  求和:", total)

product = reduce(lambda a, b: a * b, [1, 2, 3, 4, 5])
print("  连乘:", product)

# reduce 带初始值
total_init = reduce(lambda a, b: a + b, nums, 100)
print("  带初值100:", total_init)

# reduce 求最大值
maximum = reduce(lambda a, b: a if a > b else b, nums)
print("  最大值:", maximum)

# 4. 列表推导式对比
print()
print("=== 4. 列表推导式对比 ===")
squared_lc = [x * x for x in nums]
evens_lc = [x for x in nums if x % 2 == 0]
print("  推导式平方:", squared_lc)
print("  推导式偶数:", evens_lc)
print("  推导式带条件:", [x*x for x in nums if x % 2 == 0])

# 5. any 和 all
print()
print("=== 5. any 和 all ===")
print("  any 大于8:", any(x > 8 for x in nums))
print("  any 大于100:", any(x > 100 for x in nums))
print("  all 大于0:", all(x > 0 for x in nums))
print("  all 大于5:", all(x > 5 for x in nums))

# 6. sorted 和 sort 的 key
students = [
    ("小明", 90),
    ("小红", 85),
    ("小刚", 95),
    ("小李", 85),
]
print()
print("=== 6. sorted 的 key ===")
print("  原始:", students)
print("  按分数降序:", sorted(students, key=lambda s: s[1], reverse=True))
print("  按姓名:", sorted(students, key=lambda s: s[0]))
print("  多条件(分数降,姓名升):", sorted(students, key=lambda s: (-s[1], s[0])))

# sort 原地排序
data = [3, 1, 4, 1, 5, 9, 2, 6]
data.sort()
print("  sort 原地:", data)

# 7. operator 模块
print()
print("=== 7. operator 模块 ===")
print("  add(3, 5):", operator.add(3, 5))
print("  mul(3, 5):", operator.mul(3, 5))
print("  itemgetter:", operator.itemgetter(1)(("a", 100, "b")))

# operator 替代 lambda
sums_op = list(map(operator.add, [1, 2, 3], [10, 20, 30]))
print("  operator map:", sums_op)

# itemgetter 用于排序
people = [{"name": "小明", "age": 20}, {"name": "小红", "age": 18}]
print("  itemgetter 排序:", sorted(people, key=operator.itemgetter("age")))

# 8. 综合案例：数据处理
transactions = [
    {"item": "苹果", "price": 5, "qty": 3},
    {"item": "香蕉", "price": 3, "qty": 6},
    {"item": "橙子", "price": 4, "qty": 4},
]

print()
print("=== 8. 综合案例 ===")
totals = list(map(lambda t: t["price"] * t["qty"], transactions))
print("  每笔总额:", totals)
grand_total = reduce(lambda a, b: a + b, totals)
print("  总消费:", grand_total)
big = list(filter(lambda t: t["price"] * t["qty"] > 15, transactions))
print("  大额交易:", [b["item"] for b in big])

# 9. 函数式 vs 命令式 vs 推导式
print()
print("=== 9. 三种风格对比 ===")
result = []
for n in nums:
    if n % 2 == 0:
        result.append(n * n)
print("  命令式:", result)

result_fp = list(map(lambda x: x * x, filter(lambda x: x % 2 == 0, nums)))
print("  函数式:", result_fp)

result_lc = [x * x for x in nums if x % 2 == 0]
print("  推导式:", result_lc)

# 10. 链式处理：函数式嵌套调用
print()
print("=== 10. 链式处理 ===")
# 先过滤偶数，再每个 +100，再求和
final = list(map(lambda x: x + 100,
                 filter(lambda x: x % 2 == 0, nums)))
print("  偶数+100:", final)

# 链式：平方 -> 过滤大于30 -> 求和
chain_sum = reduce(lambda a, b: a + b,
                   filter(lambda x: x > 30,
                          map(lambda x: x * x, nums)))
print("  平方>30求和:", chain_sum)

# 等价的推导式写法（更清晰）
chain_lc = sum(x * x for x in nums if x * x > 30)
print("  推导式等价:", chain_lc)`
  }
];
