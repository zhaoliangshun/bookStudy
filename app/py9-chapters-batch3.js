// =============================================================
// Python 逐层深入教程 - batch3
// 章节 21-30：函数（定义/参数/返回值/作用域/递归/lambda/高阶/闭包/装饰器）
// =============================================================

export const chapters = [
  // -----------------------------------------------------------
  // 第 21 章：函数定义与调用
  // -----------------------------------------------------------
  {
    id: "py9-21",
    group: "函数：代码的复用",
    icon: "🧩",
    title: "函数：把代码打包复用",
    content: `## 为什么要函数

前面我们写的代码都是"一条线往下走"。如果同一段逻辑要用 10 次，难道复制粘贴 10 遍？当然不。**函数**就是"把一段代码打包，起个名字，需要时直接叫名字调用"。

\`\`\`python
def greet():           # def 关键字定义函数
    print("你好")       # 缩进的代码块叫"函数体"

greet()                # 调用：函数名加 ()
greet()                # 想调几次调几次
\`\`\`

## 函数的"四要素"

1. **名字**：用什么名字调用
2. **参数**：调用时传进去的数据（可选）
3. **函数体**：要执行的代码
4. **返回值**：执行完返回的结果（可选）

\`\`\`python
def add(a, b):         # a, b 是参数
    return a + b       # return 把结果返回出去

result = add(3, 5)     # 调用时传 3 和 5，result 拿到 8
\`\`\`

## 形参 vs 实参

- **形参**（形式参数）：定义函数时写的占位符，比如 \`def add(a, b)\` 里的 \`a, b\`
- **实参**（实际参数）：调用时传进去的具体值，比如 \`add(3, 5)\` 里的 \`3, 5\`

形参像"变量名"，实参像"具体的值"。调用时，实参被赋给形参。

## return 的两个作用

1. **把结果送出去**：调用方拿到的就是 return 后面的值
2. **结束函数**：执行到 return，函数立即结束，后面的代码不再执行

\`\`\`python
def check(x):
    if x > 0:
        return "正数"
        print("这行不会执行")   # return 后立刻退出
    return "非正数"
\`\`\`

## 没 return 怎么办

函数没写 return，或者只写 \`return\` 不带值，会返回 \`None\`：

\`\`\`python
def say_hi():
    print("hi")

result = say_hi()      # 打印 hi，result 是 None
\`\`\`

## 函数 = 工具

把函数想象成"工具箱里的工具"——\`print\` 是工具，\`len\` 是工具，你自己写的 \`add\` 也是工具。**好工具做一件事**：\`add\` 就只做加法，不要让它顺便打印东西。

## 本章 demo

demo 演示定义、调用、参数、返回值、None。`,
    code: `# ============================================
# 第 21 章：函数定义与调用
# ============================================

# --- 1. 最简单的函数 ---
print("=== 1. 无参函数 ===")
def say_hello():
    """打招呼的函数（这串三引号叫文档字符串，后面讲）"""
    print("你好，世界！")

say_hello()              # 调用一次
say_hello()              # 再调用一次

# --- 2. 带参数的函数 ---
print("\\n=== 2. 带参数 ===")
def greet(name):         # name 是形参
    print(f"你好，{name}！")

greet("小明")            # "小明" 是实参
greet("小红")

# --- 3. 带返回值 ---
print("\\n=== 3. 返回值 ===")
def add(a, b):
    return a + b         # 把和返回出去

result = add(3, 5)       # 调用方拿到返回值
print(f"3 + 5 = {result}")
print(f"直接用: {add(10, 20)}")

# --- 4. return 立即结束 ---
print("\\n=== 4. return 结束函数 ===")
def check_age(age):
    if age < 0:
        return "年龄不能为负"    # 在这里就退出函数了
    if age >= 18:
        return "成年"
    return "未成年"

print(f"check_age(-5) = {check_age(-5)}")
print(f"check_age(20) = {check_age(20)}")
print(f"check_age(10) = {check_age(10)}")

# --- 5. 没 return 返回 None ---
print("\\n=== 5. 返回 None ===")
def just_print(x):
    print(f"  我只打印 {x}，不 return")

r = just_print(42)
print(f"just_print 的返回值: {r}    ← 是 None")

# --- 6. 函数可以调用别的函数 ---
print("\\n=== 6. 函数调用函数 ===")
def square(x):
    return x * x

def sum_of_squares(a, b):
    return square(a) + square(b)    # 调用 square

print(f"3² + 4² = {sum_of_squares(3, 4)}")

# --- 7. 实用：计算圆的面积 ---
print("\\n=== 7. 实用 ===")
def circle_area(radius):
    """计算圆面积"""
    pi = 3.14159
    return pi * radius * radius

for r in [1, 2, 5, 10]:
    area = circle_area(r)
    print(f"  半径 {r}: 面积 = {area:.2f}")`
  },

  // -----------------------------------------------------------
  // 第 22 章：参数详解
  // -----------------------------------------------------------
  {
    id: "py9-22",
    group: "函数：代码的复用",
    icon: "📦",
    title: "参数的四种玩法：位置/关键字/默认/可变",
    content: `## Python 参数很灵活

Python 函数参数比很多语言灵活。这一章把四种常见用法讲清楚。

## 1. 位置参数（最常见）

按**位置顺序**对应：

\`\`\`python
def power(base, exp):
    return base ** exp

power(2, 3)      # base=2, exp=3 → 8
power(3, 2)      # base=3, exp=2 → 9 顺序变了结果就变
\`\`\`

## 2. 关键字参数

按**名字**对应，不依赖顺序：

\`\`\`python
power(exp=3, base=2)    # 同样是 8，名字指明了谁是谁
\`\`\`

位置和关键字可以混用，但**位置参数必须在前**：

\`\`\`python
power(2, exp=3)         # ✅ 2 给 base，exp=3 显式给 exp
power(base=2, 3)        # ❌ 语法错误
\`\`\`

## 3. 默认参数

定义时给参数一个默认值，调用时不传就用默认：

\`\`\`python
def greet(name, greeting="你好"):
    print(f"{greeting}，{name}")

greet("小明")              # 你好，小明（用默认 greeting）
greet("小明", "嗨")        # 嗨，小明（覆盖默认）
greet("小明", greeting="嗨")  # 同上
\`\`\`

⚠️ **默认参数必须在普通参数后面**：

\`\`\`python
def f(a, b=1):    # ✅
def f(a=1, b):    # ❌
\`\`\`

### 默认参数的坑：可变对象

\`\`\`python
def f(x, lst=[]):       # ⚠️ 默认值是可变列表
    lst.append(x)
    return lst

f(1)    # [1]
f(2)    # [1, 2]   ← 不是 [2]！默认值被共享了
\`\`\`

**默认值在函数定义时创建一次，不会每次调用重置**。要避免这个坑，用 \`None\` 当占位：

\`\`\`python
def f(x, lst=None):
    if lst is None:
        lst = []
    lst.append(x)
    return lst
\`\`\`

## 4. 可变参数

### \`*args\`：收集多余的位置参数

\`\`\`python
def sum_all(*args):
    print(type(args))    # <class 'tuple'>
    return sum(args)

sum_all(1, 2, 3)         # 6
sum_all(1, 2, 3, 4, 5)   # 15
\`\`\`

\`args\` 是个元组，包含所有位置参数。

### \`**kwargs\`：收集多余的关键字参数

\`\`\`python
def show(**kwargs):
    print(type(kwargs))   # <class 'dict'>
    for k, v in kwargs.items():
        print(f"  {k} = {v}")

show(name="小明", age=18)
\`\`\`

\`kwargs\` 是个字典，键是参数名，值是参数值。

### 解包：把列表/字典"拆"成参数

\`\`\`python
def add(a, b, c):
    return a + b + c

nums = [1, 2, 3]
add(*nums)             # 等价于 add(1, 2, 3)

d = {"a": 1, "b": 2, "c": 3}
add(**d)               # 等价于 add(a=1, b=2, c=3)
\`\`\`

## 参数顺序

完整顺序（缺一不可时按这个排）：

\`\`\`python
def f(位置参数, *args, 关键字参数, **kwargs):
    ...
\`\`\`

## 本章 demo

demo 把四种参数全部演示，包括可变默认参数的坑。`,
    code: `# ============================================
# 第 22 章：参数详解
# ============================================

# --- 1. 位置参数 ---
print("=== 1. 位置参数 ===")
def power(base, exp):
    """base 的 exp 次方"""
    return base ** exp

print(f"power(2, 3) = {power(2, 3)}    ← 2的3次方")
print(f"power(3, 2) = {power(3, 2)}    ← 3的2次方，顺序变结果变")

# --- 2. 关键字参数 ---
print("\\n=== 2. 关键字参数 ===")
print(f"power(exp=3, base=2) = {power(exp=3, base=2)}    ← 按名字，不依赖顺序")
print(f"power(2, exp=3) = {power(2, exp=3)}    ← 位置和关键字混用")

# --- 3. 默认参数 ---
print("\\n=== 3. 默认参数 ===")
def greet(name, greeting="你好"):
    print(f"  {greeting}，{name}！")

greet("小明")                    # 用默认 greeting
greet("小红", "嗨")              # 覆盖默认
greet("小刚", greeting="早上好")  # 关键字形式覆盖

# --- 4. 可变默认参数的坑 ---
print("\\n=== 4. 可变默认参数的坑 ===")
def bad_append(x, lst=[]):
    """有坑的写法：默认值是可变列表"""
    lst.append(x)
    return lst

print(f"bad_append(1) = {bad_append(1)}")
print(f"bad_append(2) = {bad_append(2)}    ← 不是 [2]！默认值被共享")

# 正确写法
def good_append(x, lst=None):
    if lst is None:
        lst = []
    lst.append(x)
    return lst

print(f"good_append(1) = {good_append(1)}")
print(f"good_append(2) = {good_append(2)}    ← 每次都是新列表")

# --- 5. *args 收集位置参数 ---
print("\\n=== 5. *args ===")
def sum_all(*args):
    print(f"  收到 {len(args)} 个参数: {args}, 类型 {type(args).__name__}")
    return sum(args)

print(f"总和: {sum_all(1, 2, 3)}")
print(f"总和: {sum_all(1, 2, 3, 4, 5)}")
print(f"总和: {sum_all()}    ← 0个参数也行")

# --- 6. **kwargs 收集关键字参数 ---
print("\\n=== 6. **kwargs ===")
def show_info(**kwargs):
    print(f"  收到 {len(kwargs)} 个关键字参数, 类型 {type(kwargs).__name__}")
    for k, v in kwargs.items():
        print(f"    {k} = {v}")

show_info(name="小明", age=18, city="北京")

# --- 7. 解包 ---
print("\\n=== 7. 解包 ===")
def add3(a, b, c):
    return a + b + c

nums = [1, 2, 3]
print(f"add3(*{nums}) = {add3(*nums)}    ← 列表用*解包")
d = {"a": 10, "b": 20, "c": 30}
print(f"add3(**{d}) = {add3(**d)}    ← 字典用**解包")

# --- 8. 综合用法 ---
print("\\n=== 8. 综合 ===")
def make_profile(name, age, *hobbies, **details):
    """name/age 必填，hobbies 任意多个，details 任意键值"""
    profile = {"name": name, "age": age, "hobbies": hobbies}
    profile.update(details)
    return profile

p = make_profile("小明", 18, "编程", "音乐", city="北京", school="一中")
for k, v in p.items():
    print(f"  {k}: {v}")`
  },

  // -----------------------------------------------------------
  // 第 23 章：返回值
  // -----------------------------------------------------------
  {
    id: "py9-23",
    group: "函数：代码的复用",
    icon: "🎁",
    title: "返回值：把结果送出去",
    content: `## return 是函数的"出口"

函数计算完，要把结果**送出去**给调用方——这就是 \`return\` 的工作。

\`\`\`python
def add(a, b):
    return a + b       # 把 a+b 的结果送出去

result = add(3, 5)     # result 接住返回值
\`\`\`

## 没 return 就返回 None

\`\`\`python
def say_hi():
    print("hi")

r = say_hi()           # 打印 hi，r 是 None
\`\`\`

\`return\` 后面不写值，或者整个函数没 return，都返回 \`None\`。

## 返回多个值（其实是元组）

Python 看起来能"返回多个值"：

\`\`\`python
def min_max(nums):
    return min(nums), max(nums)

low, high = min_max([3, 1, 4, 1, 5])
\`\`\`

实际上 \`return min(nums), max(nums)\` 返回的是**元组** \`(min, max)\`，调用方用元组解包接收。第 12 章讲过这个。

## 提前返回（早退）

不要把所有逻辑塞一个 return。条件不满足就直接返回，代码更清晰：

\`\`\`python
def divide(a, b):
    if b == 0:
        return None       # 除数为 0，直接返回
    return a / b          # 否则才计算
\`\`\`

这叫"早退"（early return）或"卫语句"，比层层嵌套 if 易读。

## 返回函数

Python 函数是"一等公民"，可以当返回值返回。这是后面"闭包""装饰器"的基础：

\`\`\`python
def make_multiplier(n):
    def multiply(x):
        return x * n
    return multiply       # 返回一个函数

double = make_multiplier(2)   # double 是个函数
double(5)                     # 10
\`\`\`

## 返回值要不要打印

\`\`\`python
def add(a, b):
    return a + b

add(3, 5)              # 不打印，结果丢了
print(add(3, 5))       # 打印返回值
result = add(3, 5)     # 存起来
\`\`\`

函数内部的 \`print\` 是"副作用"，\`return\` 才是"输出结果"。好函数尽量用 return，让调用方决定要不要打印。

## 本章 demo

demo 演示返回值、多返回值、早退、返回函数。`,
    code: `# ============================================
# 第 23 章：返回值
# ============================================

# --- 1. 基本 return ---
print("=== 1. 基本 return ===")
def square(x):
    return x * x

result = square(5)
print(f"square(5) = {result}")
print(f"square(10) = {square(10)}    ← 直接用在表达式里")

# --- 2. 没 return 返回 None ---
print("\\n=== 2. 返回 None ===")
def just_print(x):
    print(f"  打印 {x}，不 return")

r = just_print(42)
print(f"返回值: {r}    ← 是 None")

# return 不带值也是 None
def early():
    print("  进函数了")
    return            # 不带值
    print("  不会执行")

r2 = early()
print(f"返回值: {r2}")

# --- 3. 多返回值（元组解包）---
print("\\n=== 3. 多返回值 ===")
def min_max_avg(nums):
    """同时返回最小、最大、平均"""
    return min(nums), max(nums), sum(nums) / len(nums)

result = min_max_avg([3, 1, 4, 1, 5, 9, 2, 6])
print(f"返回: {result}, 类型 {type(result).__name__}    ← 其实是元组")
low, high, avg = min_max_avg([3, 1, 4, 1, 5, 9, 2, 6])
print(f"最小={low}, 最大={high}, 平均={avg:.2f}")

# --- 4. 早退（卫语句）---
print("\\n=== 4. 早退 ===")
def divide(a, b):
    if b == 0:
        return None        # 除数为 0，直接退出
    return a / b

print(f"divide(10, 2) = {divide(10, 2)}")
print(f"divide(10, 0) = {divide(10, 0)}    ← 提前返回 None")

def find_first_even(nums):
    for n in nums:
        if n % 2 == 0:
            return n       # 找到就返回，不等遍历完
    return None            # 都不是偶数

print(f"find_first_even([1,3,5,4,7]) = {find_first_even([1,3,5,4,7])}")
print(f"find_first_even([1,3,5]) = {find_first_even([1,3,5])}")

# --- 5. 返回布尔（用于判断）---
print("\\n=== 5. 返回布尔 ===")
def is_adult(age):
    return age >= 18       # 直接返回比较结果

age = 20
if is_adult(age):
    print(f"{age}岁是成年")
else:
    print(f"{age}岁未成年")

# --- 6. 返回不同类型 ---
print("\\n=== 6. 返回不同类型 ===")
def classify(score):
    if score >= 90:
        return "优秀"        # 返回字符串
    elif score >= 60:
        return ["及格"]      # 返回列表
    else:
        return None          # 返回 None

for s in [95, 75, 45]:
    r = classify(s)
    print(f"  {s} → {r} (类型 {type(r).__name__})")

# --- 7. 返回函数（闭包预热）---
print("\\n=== 7. 返回函数 ===")
def make_multiplier(n):
    """返回一个把 x 乘以 n 的函数"""
    def multiply(x):
        return x * n
    return multiply

double = make_multiplier(2)    # double 是个函数
triple = make_multiplier(3)
print(f"double(5) = {double(5)}    ← 5 * 2")
print(f"triple(5) = {triple(5)}    ← 5 * 3")
print(f"double 的类型: {type(double).__name__}")`
  },

  // -----------------------------------------------------------
  // 第 24 章：作用域
  // -----------------------------------------------------------
  {
    id: "py9-24",
    group: "函数：代码的复用",
    icon: "🌐",
    title: "作用域：变量能活多久、能看多远",
    content: `## 变量有"势力范围"

一个变量不是哪里都能用。它**在哪里定义**，决定了它**在哪里能用**。这个"能用范围"叫**作用域**。

\`\`\`python
def f():
    x = 10          # x 在函数里定义
    print(x)        # 函数里能用

f()
print(x)            # ❌ 报错！函数外看不到 x
\`\`\`

## LEGB 规则

Python 查找变量按这个顺序：

1. **L** (Local)：当前函数内部
2. **E** (Enclosing)：外层嵌套函数
3. **G** (Global)：模块（文件）级别
4. **B** (Built-in)：内置（\`print\`、\`len\` 这些）

找到一个就用，找不到报 \`NameError\`。

\`\`\`python
x = "全局"            # G
def outer():
    x = "外层"        # E
    def inner():
        x = "内层"    # L
        print(x)      # 用 L 的
    inner()
outer()               # 打印"内层"
\`\`\`

## 函数能"读"外部变量，但不能随便"改"

\`\`\`python
count = 0
def show():
    print(count)     # ✅ 能读全局的 count

def add():
    count = count + 1   # ❌ 报错！
\`\`\`

为什么改不了？因为函数里出现 \`count = ...\`，Python 默认 \`count\` 是**局部变量**，但又要在赋值前读它，矛盾就报错。

## global：声明我要用全局变量

\`\`\`python
count = 0
def add():
    global count      # 声明 count 是全局的那个
    count += 1
\`\`\`

## nonlocal：改外层（非全局）变量

嵌套函数里，要改**外层函数**的变量用 \`nonlocal\`：

\`\`\`python
def outer():
    n = 0
    def inner():
        nonlocal n    # n 是 outer 里的那个
        n += 1
    inner()
\`\`\`

## 少用 global

全局变量谁都能改，容易出 bug。能用参数传就用参数，能用返回值就用返回值。\`global\` 只在确实需要时（比如计数器、配置）才用。

## 函数参数也是局部变量

\`\`\`python
def f(a):
    print(a)          # a 是局部的
f(5)
print(a)              # ❌ 外部看不到 a
\`\`\`

## 本章 demo

demo 演示 LEGB、读写规则、global、nonlocal。`,
    code: `# ============================================
# 第 24 章：作用域
# ============================================

# --- 1. 局部变量外部看不到 ---
print("=== 1. 局部变量 ===")
def f():
    x = 10            # 局部变量
    print(f"  函数内: x = {x}")

f()
# print(x)  # 报错！NameError: name 'x' is not defined
print("  函数外访问 x 会报 NameError")

# --- 2. 全局变量函数内能读 ---
print("\\n=== 2. 读全局 ===")
message = "我是全局的"
def show_global():
    print(f"  函数内读到: {message}")
show_global()
print(f"  函数外: {message}")

# --- 3. 函数内赋值 = 创建局部变量 ---
print("\\n=== 3. 同名遮蔽 ===")
val = 100
def modify():
    val = 200         # 这是局部 val，不是全局的！
    print(f"  函数内 val = {val}")
modify()
print(f"  函数外 val = {val}    ← 全局的没变")

# --- 4. global 修改全局 ---
print("\\n=== 4. global ===")
counter = 0
def increment():
    global counter    # 声明用全局的那个 counter
    counter += 1

print(f"初始 counter = {counter}")
increment()
increment()
increment()
print(f"调3次后 counter = {counter}")

# --- 5. nonlocal 修改外层函数变量 ---
print("\\n=== 5. nonlocal ===")
def make_counter():
    """闭包计数器：每次调返回的函数，计数+1"""
    count = 0                  # 外层函数的变量
    def inner():
        nonlocal count         # 声明用外层的 count
        count += 1
        return count
    return inner

c = make_counter()
print(f"  c() = {c()}")
print(f"  c() = {c()}")
print(f"  c() = {c()}    ← 每次调用都基于上次")

# --- 6. LEGB 查找顺序 ---
print("\\n=== 6. LEGB 顺序 ===")
x = "全局 x"
def outer():
    x = "外层 x"
    def inner():
        x = "内层 x"
        print(f"  inner 看 x = {x}    ← 用 Local")
    inner()
    print(f"  outer 看 x = {x}    ← 用 Enclosing")
outer()
print(f"  全局 x = {x}    ← 用 Global")

# 注释掉内层赋值，看会"穿透"到哪一层
print("\\n  --- 不在 inner 里定义 x ---")
def outer2():
    x = "外层 x"
    def inner2():
        print(f"  inner 看 x = {x}    ← Local 没有，用 Enclosing")
    inner2()
outer2()

# --- 7. 参数也是局部变量 ---
print("\\n=== 7. 参数是局部的 ===")
def greet(name):
    print(f"  你好，{name}")
    name = name + "!"      # 改的是局部副本
    print(f"  改后: {name}")

greet("小明")
# print(name)  # 报错，外部没有 name

# --- 8. 内置作用域 B ---
print("\\n=== 8. 内置 ===")
print(f"  len = {len}")
print(f"  type(len) = {type(len).__name__}")
# 不要用内置名当变量名！
# len = 5  # 这会让 len(...) 不能用了
print(f"  len([1,2,3]) = {len([1,2,3])}")`
  },

  // -----------------------------------------------------------
  // 第 25 章：递归
  // -----------------------------------------------------------
  {
    id: "py9-25",
    group: "函数：代码的复用",
    icon: "🔄",
    title: "递归：函数调用自己",
    content: `## 递归是什么

函数**调用自己**，就是递归。听起来玄，其实是一种循环的另一种写法。

经典例子：阶乘。 \`5! = 5 × 4 × 3 × 2 × 1\`。注意 \`5! = 5 × 4!\`，而 \`4! = 4 × 3!\`……规律：\`n! = n × (n-1)!\`，直到 \`1! = 1\`。

\`\`\`python
def factorial(n):
    if n == 1:           # 终止条件
        return 1
    return n * factorial(n - 1)    # 调用自己，规模更小

factorial(5)    # 120
\`\`\`

## 两个必备

1. **终止条件**（base case）：什么时候不再递归，否则无限调用、栈溢出
2. **递归调用**：朝终止条件逼近，规模要变小

\`\`\`python
def factorial(n):
    if n == 1: return 1              # ✅ 终止
    return n * factorial(n - 1)      # ✅ n-1 朝 1 逼近
\`\`\`

## 递归的执行过程

\`factorial(3)\` 的展开：

\`\`\`
factorial(3)
  → 3 * factorial(2)
       → 2 * factorial(1)
            → 1     ← 终止
       ← 2 * 1 = 2
  ← 3 * 2 = 6
\`\`\`

每次调用都"压栈"，等内层返回再算。所以递归太深会\`RecursionError\`（默认 1000 层）。

## 经典：斐波那契

\`fib(n) = fib(n-1) + fib(n-2)\`，\`fib(1) = fib(2) = 1\`：

\`\`\`python
def fib(n):
    if n <= 2: return 1
    return fib(n-1) + fib(n-2)
\`\`\`

但这个写法**极慢**——\`fib(40)\` 要算好几秒。因为重复计算太多（\`fib(5)\` 里 \`fib(3)\` 被算了好几次）。优化方法：缓存（后面装饰器章节会讲 \`lru_cache\`）。

## 递归 vs 循环

任何递归都能改成循环，反之亦然。怎么选？

- **递归**：问题天然是"自相似"的（树、分治、回溯），写起来直观
- **循环**：性能好，没有栈溢出风险

## 经典应用

- **阶乘、幂**：数学定义就是递归的
- **遍历树/文件夹**：文件夹里有文件夹
- **汉诺塔**：经典递归题
- **回溯算法**：八皇后、迷宫

## 本章 demo

demo 演示阶乘、斐波那契、递归求和、文件夹遍历（用列表模拟）。`,
    code: `# ============================================
# 第 25 章：递归
# ============================================

# --- 1. 阶乘 ---
print("=== 1. 阶乘 ===")
def factorial(n):
    """n! = n * (n-1) * ... * 1"""
    if n == 1:                    # 终止条件
        return 1
    return n * factorial(n - 1)   # 递归调用

for i in range(1, 7):
    print(f"  {i}! = {factorial(i)}")

# --- 2. 递归过程展开 ---
print("\\n=== 2. 过程展开 ===")
def factorial_verbose(n, depth=0):
    """带缩进的递归，看清调用过程"""
    indent = "  " * depth
    print(f"{indent}→ factorial({n})")
    if n == 1:
        print(f"{indent}← 返回 1 (终止)")
        return 1
    result = n * factorial_verbose(n - 1, depth + 1)
    print(f"{indent}← {n} * factorial({n-1}) = {result}")
    return result

print("factorial(4) 的展开:")
factorial_verbose(4)

# --- 3. 斐波那契（慢版本）---
print("\\n=== 3. 斐波那契 ===")
def fib(n):
    """第 n 个斐波那契数：1, 1, 2, 3, 5, 8, 13..."""
    if n <= 2:
        return 1
    return fib(n - 1) + fib(n - 2)

for i in range(1, 11):
    print(f"  fib({i}) = {fib(i)}")

# --- 4. 递归求和 ---
print("\\n=== 4. 递归求和 ===")
def sum_list(nums):
    """用递归求列表的和"""
    if not nums:                  # 空列表，终止
        return 0
    return nums[0] + sum_list(nums[1:])    # 第一个 + 剩下的和

print(f"  sum_list([1,2,3,4,5]) = {sum_list([1,2,3,4,5])}")
# 等价于：
# 1 + sum_list([2,3,4,5])
# 1 + 2 + sum_list([3,4,5])
# ...
# 1 + 2 + 3 + 4 + 5 + 0 = 15

# --- 5. 递归 vs 循环 ---
print("\\n=== 5. 递归 vs 循环 ===")
def factorial_loop(n):
    """循环版阶乘"""
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result

print(f"  递归 factorial(6) = {factorial(6)}")
print(f"  循环 factorial_loop(6) = {factorial_loop(6)}    ← 结果一样")

# --- 6. 递归遍历"树"（用嵌套列表模拟）---
print("\\n=== 6. 递归遍历嵌套 ===")
def print_tree(item, indent=0):
    """遍历任意层嵌套的列表"""
    prefix = "  " * indent + "- "
    if isinstance(item, list):
        print(f"{prefix}列表:")
        for sub in item:
            print_tree(sub, indent + 1)
    else:
        print(f"{prefix}{item}")

# 模拟一个嵌套结构：部门-小组-成员
company = [
    "技术部",
    ["前端组", ["小明", "小红"]],
    ["后端组", ["小刚", "小亮"]],
]
print_tree(company)

# --- 7. 没终止条件的灾难 ---
print("\\n=== 7. 栈溢出 ===")
# def bad_recursion():
#     return bad_recursion()    # 没终止条件
# bad_recursion()  # RecursionError

import sys
print(f"  默认最大递归深度: {sys.getrecursionlimit()}")
print("  超过会报 RecursionError，不要随便改大")

# --- 8. 实用：汉诺塔 ---
print("\\n=== 8. 汉诺塔 ===")
def hanoi(n, source, target, auxiliary):
    """把 n 个盘子从 source 移到 target，借助 auxiliary"""
    if n == 1:
        print(f"  把盘1从 {source} → {target}")
        return
    hanoi(n - 1, source, auxiliary, target)    # 把上面 n-1 个移到辅助
    print(f"  把盘{n}从 {source} → {target}")  # 把最大的移到目标
    hanoi(n - 1, auxiliary, target, source)    # 再把 n-1 个从辅助移到目标

print("3 个盘子的汉诺塔:")
hanoi(3, "A", "C", "B")`
  },

  // -----------------------------------------------------------
  // 第 26 章：lambda
  // -----------------------------------------------------------
  {
    id: "py9-26",
    group: "函数：代码的复用",
    icon: "λ",
    title: "lambda：一行小函数",
    content: `## lambda 是什么

\`lambda\` 是"匿名函数"——不用 \`def\` 起名字，一行写完，主要用于"临时用一下"的简单函数。

\`\`\`python
# def 写法
def double(x):
    return x * 2

# lambda 写法（等价）
double = lambda x: x * 2

double(5)    # 10
\`\`\`

## 语法

\`\`\`
lambda 参数1, 参数2, ...: 表达式
\`\`\`

- 冒号前是参数，多个用逗号
- 冒号后是**一个表达式**（不能写语句，不能写多行）
- 表达式的结果就是返回值，**不用写 return**

## 什么时候用 lambda

lambda 不是必须的，任何 lambda 都能用 def 改写。它适合：

- **短小、临时**：一行能写完的逻辑
- **当参数传**：比如给 \`sorted\`、\`map\`、\`filter\` 当 key

\`\`\`python
# 给 sorted 当 key：按绝对值排序
sorted([-3, 1, -5, 2], key=lambda x: abs(x))
# → [1, 2, -3, -5]
\`\`\`

## 不要滥用

逻辑超过一行、需要循环或条件判断复杂时，**用 def**。lambda 写复杂了反而难读。

\`\`\`python
# ❌ 别这么写
f = lambda x: x**2 if x > 0 else -x if x < 0 else 0

# ✅ 用 def 清晰
def f(x):
    if x > 0: return x**2
    if x < 0: return -x
    return 0
\`\`\`

## lambda 能捕获外部变量

\`\`\`python
n = 10
f = lambda x: x + n     # 用了外部的 n
f(5)                    # 15
\`\`\`

⚠️ 这里有"延迟绑定"的坑——lambda 用的是**调用时**的 n，不是定义时的：

\`\`\`python
funcs = [lambda: i for i in range(3)]
[f() for f in funcs]    # [2, 2, 2]！不是 [0, 1, 2]
\`\`\`

因为三个 lambda 都引用同一个 \`i\`，调用时 \`i\` 已经是 2。要修复：用默认参数冻结：

\`\`\`python
funcs = [lambda i=i: i for i in range(3)]
[f() for f in funcs]    # [0, 1, 2]
\`\`\`

## 本章 demo

demo 演示 lambda 各种用法，重点对比和 def 的关系。`,
    code: `# ============================================
# 第 26 章：lambda
# ============================================

# --- 1. 基本用法 ---
print("=== 1. 基本 lambda ===")
# def 版
def double_def(x):
    return x * 2

# lambda 版
double_lambda = lambda x: x * 2

print(f"  def: double_def(5) = {double_def(5)}")
print(f"  lambda: double_lambda(5) = {double_lambda(5)}")
print(f"  类型: {type(double_lambda).__name__}")

# --- 2. 多参数 ---
print("\\n=== 2. 多参数 ===")
add = lambda a, b: a + b
print(f"  add(3, 5) = {add(3, 5)}")

multiply = lambda a, b, c: a * b * c
print(f"  multiply(2, 3, 4) = {multiply(2, 3, 4)}")

# 无参数
say_hi = lambda: "你好"
print(f"  say_hi() = {say_hi()}")

# --- 3. 当 key 用（最常见）---
print("\\n=== 3. 当 sorted 的 key ===")
nums = [-3, 1, -5, 2, -1]
print(f"  原始: {nums}")
print(f"  默认排序: {sorted(nums)}")
print(f"  按绝对值: {sorted(nums, key=lambda x: abs(x))}    ← 用 abs")

# 按字符串长度排
words = ["banana", "apple", "cherry", "fig"]
print(f"  按长度: {sorted(words, key=lambda s: len(s))}")

# 按元组某个元素排
students = [("小明", 90), ("小红", 85), ("小刚", 92)]
print(f"  按分数: {sorted(students, key=lambda s: s[1])}")
print(f"  按分数降序: {sorted(students, key=lambda s: s[1], reverse=True)}")

# --- 4. lambda 在 map/filter ---
print("\\n=== 4. 配合 map/filter ===")
nums = [1, 2, 3, 4, 5]
squares = list(map(lambda x: x**2, nums))
print(f"  平方: {squares}")

evens = list(filter(lambda x: x % 2 == 0, nums))
print(f"  偶数: {evens}")

# --- 5. 捕获外部变量 ---
print("\\n=== 5. 捕获变量 ===")
n = 10
add_n = lambda x: x + n
print(f"  n=10, add_n(5) = {add_n(5)}")
n = 100
print(f"  n=100, add_n(5) = {add_n(5)}    ← 用的是调用时的 n")

# --- 6. 延迟绑定的坑 ---
print("\\n=== 6. 延迟绑定坑 ===")
# 错误写法
funcs_bad = [lambda: i for i in range(3)]
print(f"  错误: {[f() for f in funcs_bad]}    ← 都是 2！")
# 修复：用默认参数冻结当时的 i
funcs_good = [lambda i=i: i for i in range(3)]
print(f"  修复: {[f() for f in funcs_good]}    ← 0, 1, 2")

# --- 7. 条件表达式（lambda 里的 if）---
print("\\n=== 7. lambda 里的条件 ===")
classify = lambda x: "正" if x > 0 else ("零" if x == 0 else "负")
for n in [-5, 0, 8]:
    print(f"  {n}: {classify(n)}")

# --- 8. 复杂逻辑请用 def ---
print("\\n=== 8. 别滥用 ===")
# 复杂的 lambda 难读
complex_lambda = lambda scores: sum(scores) / len(scores) if scores else 0

# def 更清晰
def average(scores):
    if scores:
        return sum(scores) / len(scores)
    return 0

print(f"  lambda: average([1,2,3]) = {complex_lambda([1,2,3])}")
print(f"  def:    average([1,2,3]) = {average([1,2,3])}")
print("  → 逻辑超过一行就用 def")`
  },

  // -----------------------------------------------------------
  // 第 27 章：高阶函数
  // -----------------------------------------------------------
  {
    id: "py9-27",
    group: "函数：代码的复用",
    icon: "🏗️",
    title: "高阶函数：map / filter / sorted / reduce",
    content: `## 高阶函数是什么

**接收函数当参数**，或者**返回函数**的函数，叫高阶函数。Python 内置了几个常用的。

## map：对每个元素变换

\`\`\`python
map(函数, 可迭代对象)
\`\`\`

把函数应用到每个元素，返回一个"map 对象"（迭代器），用 \`list()\` 转成列表看：

\`\`\`python
nums = [1, 2, 3, 4]
squares = list(map(lambda x: x**2, nums))
# [1, 4, 9, 16]
\`\`\`

等价的推导式：\`[x**2 for x in nums]\`。Python 里推导式更常用，但 map 也得认识。

## filter：过滤

\`\`\`python
filter(函数, 可迭代对象)
\`\`\`

函数返回 True 的元素留下，False 的去掉：

\`\`\`python
nums = [1, 2, 3, 4, 5, 6]
evens = list(filter(lambda x: x % 2 == 0, nums))
# [2, 4, 6]
\`\`\`

等价推导式：\`[x for x in nums if x % 2 == 0]\`。

## sorted：排序（带 key）

第 11 章见过 \`sorted\`，它的 \`key\` 参数就是高阶函数用法：

\`\`\`python
sorted([-3, 1, -5], key=abs)            # 按绝对值
sorted(students, key=lambda s: s[1])    # 按第二个元素
\`\`\`

\`sorted\` 返回**新列表**，不改原列表。原地排序用 \`list.sort()\`。

## reduce：累积

\`reduce\` 不在内置，要从 \`functools\` 导入。它把列表"滚雪球"式地合并成一个值：

\`\`\`python
from functools import reduce
nums = [1, 2, 3, 4]
reduce(lambda a, b: a + b, nums)    # 10 = ((1+2)+3)+4
\`\`\`

适合：连乘、找最大、合并嵌套。但简单的求和用 \`sum()\`、求积用循环更直观。

## map/filter vs 推导式

| | map/filter | 推导式 |
|---|---|---|
| 写法 | \`list(map(f, xs))\` | \`[f(x) for x in xs]\` |
| 可读性 | 函数式风格 | Python 风格 |
| 性能 | 接近 | 接近 |

**Python 推荐：能用推导式就用推导式**，更 Pythonic。但读别人代码要会看 map/filter。

## 函数当参数：自定义

不只是内置，你也可以写接收函数的高阶函数：

\`\`\`python
def apply(func, value):
    return func(value)

apply(lambda x: x * 2, 5)    # 10
apply(str.upper, "abc")      # "ABC"
\`\`\`

## 本章 demo

demo 演示 map、filter、sorted、reduce、自定义高阶函数。`,
    code: `# ============================================
# 第 27 章：高阶函数
# ============================================
from functools import reduce

# --- 1. map ---
print("=== 1. map ===")
nums = [1, 2, 3, 4, 5]

# map 把函数应用到每个元素
squares = list(map(lambda x: x**2, nums))
print(f"  原始: {nums}")
print(f"  平方: {squares}")

# 对比推导式
squares_comp = [x**2 for x in nums]
print(f"  推导式: {squares_comp}    ← 效果一样")

# map 多个可迭代对象
adds = list(map(lambda a, b: a + b, [1, 2, 3], [10, 20, 30]))
print(f"  两列表相加: {adds}")

# --- 2. filter ---
print("\\n=== 2. filter ===")
nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# filter 留下返回 True 的
evens = list(filter(lambda x: x % 2 == 0, nums))
print(f"  原始: {nums}")
print(f"  偶数: {evens}")

# 过滤字符串
words = ["apple", "fig", "banana", "kiwi", "cherry"]
long_words = list(filter(lambda s: len(s) > 4, words))
print(f"  长度>4: {long_words}")

# 去掉 None
mixed = [1, None, 2, None, 3, None]
clean = list(filter(None, mixed))    # None 自动过滤 falsy
print(f"  去 None: {clean}")

# --- 3. sorted with key ---
print("\\n=== 3. sorted ===")
students = [("小明", 90), ("小红", 85), ("小刚", 92), ("小亮", 78)]

# 按分数升序
by_score = sorted(students, key=lambda s: s[1])
print(f"  按分数升序: {by_score}")

# 按分数降序
by_score_desc = sorted(students, key=lambda s: s[1], reverse=True)
print(f"  按分数降序: {by_score_desc}")

# 按名字
by_name = sorted(students, key=lambda s: s[0])
print(f"  按名字: {by_name}")

# 复杂 key：按"分数个位"排
by_unit = sorted(students, key=lambda s: s[1] % 10)
print(f"  按分数个位: {by_unit}")

# --- 4. reduce ---
print("\\n=== 4. reduce ===")
nums = [1, 2, 3, 4, 5]

# 累加
total = reduce(lambda a, b: a + b, nums)
print(f"  {nums} 累加 = {total}    ← ((1+2)+3)+4)+5")

# 累乘
product = reduce(lambda a, b: a * b, nums)
print(f"  {nums} 累乘 = {product}    ← 120 = 5!")

# 找最大
maximum = reduce(lambda a, b: a if a > b else b, nums)
print(f"  最大值 = {maximum}")

# 带初始值
total_init = reduce(lambda a, b: a + b, nums, 100)
print(f"  带初始值100: {total_init}    ← 100 + 15")

# --- 5. 链式 ---
print("\\n=== 5. 链式调用 ===")
nums = list(range(1, 11))
print(f"  原始: {nums}")
# 先过滤偶数，再每个平方
result = list(map(lambda x: x**2, filter(lambda x: x % 2 == 0, nums)))
print(f"  偶数平方: {result}")
# 推导式版（更清晰）
result_comp = [x**2 for x in nums if x % 2 == 0]
print(f"  推导式版: {result_comp}")

# --- 6. 自定义高阶函数 ---
print("\\n=== 6. 自定义高阶函数 ===")
def apply_twice(func, value):
    """把 func 应用两次"""
    return func(func(value))

print(f"  apply_twice(lambda x: x+3, 5) = {apply_twice(lambda x: x + 3, 5)}    ← (5+3)+3")
print(f"  apply_twice(lambda x: x**2, 2) = {apply_twice(lambda x: x**2, 2)}    ← (2²)²")

# --- 7. 实用：批量处理 ---
print("\\n=== 7. 实用 ===")
prices = [99.5, 199.0, 50.8, 300.2]
# 打折：每个 * 0.8，再四舍五入
discounted = list(map(lambda p: round(p * 0.8, 1), prices))
print(f"  原价: {prices}")
print(f"  8折后: {discounted}")

# 只留 > 100 的
expensive = list(filter(lambda p: p > 100, prices))
print(f"  >100的: {expensive}")

# 总价
total = reduce(lambda a, b: a + b, discounted)
print(f"  折后总价: {total:.1f}")`
  },

  // -----------------------------------------------------------
  // 第 28 章：闭包
  // -----------------------------------------------------------
  {
    id: "py9-28",
    group: "函数：代码的复用",
    icon: "🎒",
    title: "闭包：函数带着它的环境",
    content: `## 闭包是什么

**内层函数**引用了**外层函数**的变量，外层函数返回内层函数——这种"带着环境"的函数叫**闭包**。

\`\`\`python
def make_counter():
    count = 0                  # 外层变量
    def inner():
        nonlocal count
        count += 1
        return count
    return inner               # 返回内层函数

c = make_counter()
c()    # 1
c()    # 2
c()    # 3
\`\`\`

\`make_counter\` 执行完了，\`count\` 居然还活着——因为 \`inner\` "记住"了它。这就是闭包的魔法。

## 为什么需要闭包

1. **隐藏数据**：\`count\` 只能通过 \`c()\` 改，外部碰不到
2. **配置化**：同一个模板，造出不同行为的函数
3. **状态保持**：每次调用记住上次的值

## 配置化例子

\`\`\`python
def make_multiplier(n):
    def multiply(x):
        return x * n      # 用了外层的 n
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)
double(5)    # 10
triple(5)    # 15
\`\`\`

\`double\` 和 \`triple\` 是"同模板、不同配置"的两个函数。

## 闭包 vs 类

闭包能做的事，类也能做（甚至更多）。简单状态用闭包，复杂逻辑用类。

\`\`\`python
# 闭包版计数器
def make_counter():
    n = 0
    def inner():
        nonlocal n
        n += 1
        return n
    return inner

# 类版计数器
class Counter:
    def __init__(self):
        self.n = 0
    def __call__(self):
        self.n += 1
        return self.n
\`\`\`

## 看看闭包里藏了什么

\`\`\`python
c = make_counter()
c.__closure__    # 看到闭包捕获的变量
\`\`\`

## 闭包的常见模式

### 1. 工厂函数

\`\`\`python
def make_power(n):
    return lambda x: x ** n

square = make_power(2)
cube = make_power(3)
\`\`\`

### 2. 记忆状态

\`\`\`python
def make_counter():
    n = 0
    def inner():
        nonlocal n
        n += 1
        return n
    return inner
\`\`\`

### 3. 缓存

\`\`\`python
def memoize(func):
    cache = {}
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]
    return wrapper
\`\`\`

## 本章 demo

demo 演示闭包定义、配置化、状态保持、和类的对比。`,
    code: `# ============================================
# 第 28 章：闭包
# ============================================

# --- 1. 最简单的闭包 ---
print("=== 1. 基本闭包 ===")
def make_adder(n):
    """返回一个把 x 加 n 的函数"""
    def adder(x):
        return x + n        # 用了外层的 n
    return adder

add_10 = make_adder(10)
add_100 = make_adder(100)
print(f"  add_10(5) = {add_10(5)}    ← 5 + 10")
print(f"  add_100(5) = {add_100(5)}    ← 5 + 100")
print(f"  add_10 类型: {type(add_10).__name__}")

# 看看闭包里藏了什么
print(f"  add_10 闭包内容: {add_10.__closure__}")

# --- 2. 状态保持：计数器 ---
print("\\n=== 2. 计数器 ===")
def make_counter():
    """闭包版计数器：每次调用 +1"""
    count = 0
    def inner():
        nonlocal count       # 改外层的 count
        count += 1
        return count
    return inner

c1 = make_counter()
print(f"  c1() = {c1()}")
print(f"  c1() = {c1()}")
print(f"  c1() = {c1()}")

# 另一个独立计数器
c2 = make_counter()
print(f"  c2() = {c2()}    ← 独立的，从 1 开始")

# --- 3. 配置化：工厂函数 ---
print("\\n=== 3. 工厂函数 ===")
def make_power(n):
    """造一个 x 的 n 次方函数"""
    return lambda x: x ** n

square = make_power(2)
cube = make_power(3)
sqrt_approx = make_power(0.5)
print(f"  square(5) = {square(5)}    ← 5²")
print(f"  cube(3) = {cube(3)}    ← 3³")
print(f"  sqrt_approx(16) = {sqrt_approx(16)}    ← √16")

# --- 4. 隐藏数据 ---
print("\\n=== 4. 隐藏数据 ===")
def make_account(balance):
    """闭包版账户：balance 外部碰不到"""
    def deposit(amount):
        nonlocal balance
        balance += amount
        return balance
    def get_balance():
        return balance
    return deposit, get_balance

deposit, get_balance = make_account(100)
print(f"  初始余额: {get_balance()}")
print(f"  存 50 后: {deposit(50)}")
print(f"  再存 30 后: {deposit(30)}")
print(f"  当前余额: {get_balance()}")
# 外部没法直接改 balance，只能通过 deposit

# --- 5. 闭包 vs 类 ---
print("\\n=== 5. 闭包 vs 类 ===")
# 闭包版
def counter_closure():
    n = 0
    def inner():
        nonlocal n
        n += 1
        return n
    return inner

# 类版
class CounterClass:
    def __init__(self):
        self.n = 0
    def __call__(self):       # 让实例能像函数一样调用
        self.n += 1
        return self.n

c = counter_closure()
cc = CounterClass()
print(f"  闭包: {c()}, {c()}, {c()}")
print(f"  类:   {cc()}, {cc()}, {cc()}")
print("  → 简单状态用闭包，复杂逻辑用类")

# --- 6. 实用：带步长的计数器 ---
print("\\n=== 6. 带配置 ===")
def make_stepper(start, step):
    """从 start 开始，每次加 step"""
    current = start
    def inner():
        nonlocal current
        result = current
        current += step
        return result
    return inner

# 从 10 开始，每次 +5
step5 = make_stepper(10, 5)
for _ in range(4):
    print(f"  step5() = {step5()}")

# 从 100 开始，每次 -10
countdown = make_stepper(100, -10)
for _ in range(4):
    print(f"  countdown() = {countdown()}")

# --- 7. 缓存（闭包的进阶用法）---
print("\\n=== 7. 缓存 ===")
def memoize(func):
    """缓存函数结果，相同参数不重复算"""
    cache = {}
    def wrapper(*args):
        if args not in cache:
            print(f"    (计算 {args})")
            cache[args] = func(*args)
        else:
            print(f"    (命中缓存 {args})")
        return cache[args]
    return wrapper

@memoize
def slow_square(x):
    return x ** 2

print("  第一次调 slow_square(3):")
print(f"  结果: {slow_square(3)}")
print("  第二次调 slow_square(3):")
print(f"  结果: {slow_square(3)}    ← 没重复算")
print("  调 slow_square(4):")
print(f"  结果: {slow_square(4)}")`
  },

  // -----------------------------------------------------------
  // 第 29 章：装饰器入门
  // -----------------------------------------------------------
  {
    id: "py9-29",
    group: "函数：代码的复用",
    icon: "🎀",
    title: "装饰器：给函数「加壳」",
    content: `## 装饰器是什么

**装饰器是一个函数，接收一个函数，返回一个新函数**——在不改原函数代码的前提下，给它加功能。

\`\`\`python
def my_decorator(func):
    def wrapper():
        print("调用前")
        func()
        print("调用后")
    return wrapper

@my_decorator
def hello():
    print("hello")

hello()
# 输出：
# 调用前
# hello
# 调用后
\`\`\`

\`@my_decorator\` 是语法糖，等价于 \`hello = my_decorator(hello)\`。

## 本质：闭包

装饰器本质就是闭包——\`wrapper\` 闭包了 \`func\`，每次调用 \`wrapper\` 都会先/后做事。

## 带参数的函数怎么办

如果原函数有参数，\`wrapper\` 也要接收。用 \`*args, **kwargs\` 通吃：

\`\`\`python
def log(func):
    def wrapper(*args, **kwargs):
        print(f"调用 {func.__name__}({args}, {kwargs})")
        result = func(*args, **kwargs)
        print(f"返回 {result}")
        return result
    return wrapper

@log
def add(a, b):
    return a + b

add(3, 5)
# 调用 add((3, 5), {})
# 返回 8
\`\`\`

## 保留原函数信息

装饰后 \`add.__name__\` 会变成 \`"wrapper"\`。用 \`functools.wraps\` 保留原名：

\`\`\`python
from functools import wraps

def log(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
\`\`\`

## 带参数的装饰器

装饰器自己也要参数？再加一层：

\`\`\`python
def repeat(n):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(n):
                func(*args, **kwargs)
        return wrapper
    return decorator

@repeat(3)
def say_hi():
    print("hi")

say_hi()    # 打印 3 次 hi
\`\`\`

## 实用装饰器

### 1. 计时

\`\`\`python
import time

def timeit(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"{func.__name__} 耗时 {time.time()-start:.3f}s")
        return result
    return wrapper
\`\`\`

### 2. 缓存（functools.lru_cache）

\`\`\`python
from functools import lru_cache

@lru_cache
def fib(n):
    if n <= 2: return 1
    return fib(n-1) + fib(n-2)

fib(100)    # 瞬间出结果，没缓存的话要算很久
\`\`\`

### 3. 登录校验

Web 框架里大量用装饰器检查用户是否登录、是否有权限。

## 本章 demo

demo 演示基本装饰器、带参数、计时、缓存。`,
    code: `# ============================================
# 第 29 章：装饰器入门
# ============================================
import time
from functools import wraps, lru_cache

# --- 1. 最简单的装饰器 ---
print("=== 1. 基本装饰器 ===")
def my_decorator(func):
    def wrapper():
        print("  [调用前]")
        func()
        print("  [调用后]")
    return wrapper

@my_decorator
def hello():
    print("  hello!")

hello()
# 等价于：
# hello = my_decorator(hello)
# hello()

# --- 2. 带参数的函数 ---
print("\\n=== 2. 带参数 ===")
def log_call(func):
    def wrapper(*args, **kwargs):
        print(f"  → 调用 {func.__name__}({args}, {kwargs})")
        result = func(*args, **kwargs)
        print(f"  ← 返回 {result}")
        return result
    return wrapper

@log_call
def add(a, b):
    return a + b

@log_call
def greet(name, greeting="你好"):
    return f"{greeting}，{name}"

print(add(3, 5))
print()
print(greet("小明"))
print()
print(greet("小红", greeting="嗨"))

# --- 3. 用 functools.wraps 保留原信息 ---
print("\\n=== 3. 保留原信息 ===")
def without_wraps(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

def with_wraps(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@without_wraps
def f1(): pass

@with_wraps
def f2(): pass

print(f"  不用 wraps: __name__ = {f1.__name__}    ← 变成 wrapper 了")
print(f"  用 wraps:   __name__ = {f2.__name__}    ← 保留原名")

# --- 4. 计时装饰器 ---
print("\\n=== 4. 计时 ===")
def timeit(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        elapsed = time.time() - start
        print(f"  ⏱ {func.__name__} 耗时 {elapsed:.4f}s")
        return result
    return wrapper

@timeit
def slow_sum(n):
    """累加 n 次"""
    total = 0
    for i in range(n):
        total += i
    return total

result = slow_sum(1_000_000)
print(f"  结果: {result}")

# --- 5. 带参数的装饰器 ---
print("\\n=== 5. 带参数的装饰器 ===")
def repeat(n):
    """重复调用 n 次的装饰器工厂"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            results = []
            for i in range(n):
                print(f"  第 {i+1} 次:")
                results.append(func(*args, **kwargs))
            return results
        return wrapper
    return decorator

@repeat(3)
def say_hi(name):
    print(f"    hi, {name}")
    return name

say_hi("小明")

# --- 6. lru_cache：缓存 ---
print("\\n=== 6. lru_cache 缓存 ===")
call_count = 0

@lru_cache(maxsize=None)
def fib(n):
    """带缓存的斐波那契"""
    global call_count
    call_count += 1
    if n <= 2:
        return 1
    return fib(n - 1) + fib(n - 2)

# 第一次算 fib(10)，会缓存中间结果
print(f"  fib(10) = {fib(10)}, 计算次数: {call_count}")
first_count = call_count
# 第二次再算，全命中缓存
print(f"  fib(10) = {fib(10)}, 新增计算次数: {call_count - first_count}    ← 0，全缓存")
print(f"  缓存信息: {fib.cache_info()}")

# --- 7. 多个装饰器叠加 ---
print("\\n=== 7. 多装饰器 ===")
def deco_a(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print("  A 前")
        result = func(*args, **kwargs)
        print("  A 后")
        return result
    return wrapper

def deco_b(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print("  B 前")
        result = func(*args, **kwargs)
        print("  B 后")
        return result
    return wrapper

@deco_a
@deco_b
def hello():
    print("  hello")

print("  调用 hello():")
hello()
print("  → 装饰器从下往上套，执行时从外到内")`
  },

  // -----------------------------------------------------------
  // 第 30 章：函数综合实战
  // -----------------------------------------------------------
  {
    id: "py9-30",
    group: "函数：代码的复用",
    icon: "🎯",
    title: "函数综合实战：把知识串起来",
    content: `## 这一章把函数的知识全用上

前面 9 章分别讲了定义、参数、返回值、作用域、递归、lambda、高阶、闭包、装饰器。这章用几个完整例子把它们串起来。

## 实战1：学生成绩管理

需求：录入学生成绩，按规则分析（平均、最高、排名、分级）。

涉及：函数定义、多返回值、默认参数、可变参数、高阶函数、推导式。

## 实战2：简易计算器

需求：支持加减乘除、支持括号优先级（用栈）、支持连续计算。

涉及：函数当参数传、字典分发、循环、异常处理（除零）。

## 实战3：递归+缓存解决斐波那契

需求：对比缓存前后性能。

涉及：递归、装饰器、计时。

## 实战4：批量数据处理管道

需求：读数据→清洗→转换→聚合，每步都是函数。

涉及：高阶函数、闭包（管道配置）、lambda。

## 几个写好函数的原则

1. **单一职责**：一个函数只做一件事
2. **好名字**：\`calculate_avg\` 比 \`calc\` 清楚
3. **少副作用**：用 return 返回结果，别偷偷改全局变量
4. **合理的默认值**：常用情况不用传参
5. **早退**：条件不满足直接 return，别层层嵌套
6. **小而美**：超过 50 行考虑拆分

## 本章 demo

demo 是一个完整的学生成绩分析系统，综合用到以上所有知识。`,
    code: `# ============================================
# 第 30 章：函数综合实战 - 学生成绩分析系统
# ============================================
from functools import wraps, lru_cache
import time

# ============================================================
# 工具函数区
# ============================================================

def timeit(func):
    """计时装饰器"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"  ⏱ {func.__name__} 耗时 {time.time()-start:.4f}s")
        return result
    return wrapper

def grade_level(score):
    """根据分数返回等级（早退写法）"""
    if score >= 90: return "优秀"
    if score >= 80: return "良好"
    if score >= 60: return "及格"
    return "不及格"

# ============================================================
# 核心分析函数
# ============================================================

def analyze_scores(students, top_n=3):
    """
    分析学生成绩
    参数:
        students: [(name, score), ...] 列表
        top_n: 显示前几名，默认 3
    返回:
        dict: 包含各种统计结果
    """
    if not students:
        return {"error": "无数据"}

    scores = [s[1] for s in students]

    # 基础统计
    result = {
        "总数": len(students),
        "最高": max(scores),
        "最低": min(scores),
        "平均": sum(scores) / len(scores),
    }

    # 排名（按分数降序）
    ranked = sorted(students, key=lambda s: s[1], reverse=True)
    result["前%d名" % top_n] = ranked[:top_n]
    result["后%d名" % top_n] = ranked[-top_n:]

    # 分级统计（用推导式 + 高阶函数）
    levels = {}
    for name, score in students:
        level = grade_level(score)
        levels.setdefault(level, []).append(name)
    result["分级"] = levels

    # 及格率
    passed = len([s for s in scores if s >= 60])
    result["及格率"] = f"{passed}/{len(scores)} = {passed/len(scores)*100:.1f}%"

    return result

# ============================================================
# 递归 + 缓存：斐波那契对比
# ============================================================

def fib_slow(n):
    """没缓存的递归"""
    if n <= 2: return 1
    return fib_slow(n-1) + fib_slow(n-2)

@lru_cache(maxsize=None)
def fib_fast(n):
    """有缓存的递归"""
    if n <= 2: return 1
    return fib_fast(n-1) + fib_fast(n-2)

# ============================================================
# 闭包：可配置的过滤器
# ============================================================

def make_filter(min_score, max_score=100):
    """造一个过滤函数：只保留 [min, max] 分数的学生"""
    def filter_func(students):
        return [s for s in students if min_score <= s[1] <= max_score]
    return filter_func

# ============================================================
# 主程序
# ============================================================

print("=" * 55)
print("学生成绩分析系统")
print("=" * 55)

# 数据
students = [
    ("小明", 92), ("小红", 85), ("小刚", 78), ("小亮", 95),
    ("小美", 67), ("小帅", 88), ("小丽", 45), ("小强", 73),
    ("小芳", 91), ("小杰", 58),
]

# 1. 基础分析
print("\\n--- 1. 整体分析 ---")
analysis = analyze_scores(students, top_n=3)
for key, value in analysis.items():
    print(f"  {key}: {value}")

# 2. 用闭包过滤
print("\\n--- 2. 闭包过滤：80-100 分 ---")
filter_80_100 = make_filter(80, 100)
good_students = filter_80_100(students)
print(f"  80分以上: {good_students}")

print("\\n--- 3. 闭包过滤：60 分以下 ---")
filter_below_60 = make_filter(0, 59)
need_help = filter_below_60(students)
print(f"  不及格: {need_help}")

# 4. 高阶函数：每科分级
print("\\n--- 4. 全员分级 ---")
for name, score in students:
    print(f"  {name}: {score} → {grade_level(score)}")

# 5. 递归性能对比
print("\\n--- 5. 递归 + 缓存对比 ---")

@timeit
def test_slow():
    return fib_slow(30)

@timeit
def test_fast():
    return fib_fast(30)

print("  无缓存 fib(30):")
slow_result = test_slow()
print(f"    结果: {slow_result}")

print("  有缓存 fib(30):")
fast_result = test_fast()
print(f"    结果: {fast_result}")
print(f"    缓存命中: {fib_fast.cache_info()}")

# 6. 综合：分科统计
print("\\n--- 6. 多科目统计 ---")
all_scores = {
    "语文": [85, 92, 78, 95, 67, 88, 72, 90, 81, 76],
    "数学": [90, 85, 88, 92, 55, 78, 95, 60, 70, 82],
    "英语": [78, 95, 92, 85, 70, 88, 75, 80, 90, 68],
}

for subject, scores in all_scores.items():
    # 用闭包造该科目的分析器
    analysis = analyze_scores(
        [(f"学生{i+1}", s) for i, s in enumerate(scores)],
        top_n=2
    )
    print(f"  {subject}: 平均 {analysis['平均']:.1f}, "
          f"最高 {analysis['最高']}, 最低 {analysis['最低']}, "
          f"{analysis['及格率']}")

print("\\n" + "=" * 55)
print("函数知识点回顾")
print("=" * 55)
print("• def 定义 / 参数（位置/关键字/默认/*args/**kwargs）")
print("• return 返回值（多返回值是元组）")
print("• 作用域 LEGB / global / nonlocal")
print("• 递归（终止条件 + 逼近）")
print("• lambda 一行函数")
print("• 高阶函数 map/filter/sorted/reduce")
print("• 闭包（函数带环境）")
print("• 装饰器（给函数加壳）")`
  }
];
