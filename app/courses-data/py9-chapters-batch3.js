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
    content: `## 为什么要函数：从"复制粘贴"说起

设想一个场景：你在写一个学生管理程序，要在很多地方打印"你好，某某同学"。第一次你写了 \`print("你好，小明同学")\`，第二次又写一遍，第三次还是写一遍……写到第十次你烦了，万一老师突然说"改成'欢迎你，某某同学'"，你得改十处代码。这种"重复劳动"就是程序员最讨厌的事。

**函数**就是为了解决这个痛点——把一段代码打包，起个名字，需要时叫名字调用。改逻辑只改一处，调用方零感知。这就是"复用"。

\`\`\`python
def greet():           # def 关键字定义函数
    print("你好")       # 缩进的代码块叫"函数体"

greet()                # 调用：函数名加 ()
greet()                # 想调几次调几次
\`\`\`

打个比方：函数就像厨房里的"菜谱"。你不必每次做菜都重新研究"红烧肉怎么做"，把菜谱写下来（定义函数），以后想做了翻出来照做（调用函数）。改菜谱一次，所有按它做的菜都变了味。

## 函数的"四要素"

任何函数都由四部分组成：

1. **名字**：用什么名字调用（要见名知意）
2. **参数**：调用时传进去的数据（可选）
3. **函数体**：要执行的代码（缩进的代码块）
4. **返回值**：执行完返回的结果（可选）

\`\`\`python
def add(a, b):         # a, b 是参数
    return a + b       # return 把结果返回出去

result = add(3, 5)     # 调用时传 3 和 5，result 拿到 8
\`\`\`

逐行解读：
- \`def\` 是 define 的缩写，告诉 Python"我要定义函数了"
- \`add\` 是函数名，命名规则和变量一样（字母、数字、下划线，不能数字开头）
- \`(a, b)\` 是参数列表，相当于占位符
- 冒号 \`: 是函数头的结束标志
- 缩进的 \`return a + b\` 是函数体，return 把结果"递"给调用方
- \`add(3, 5)\` 是调用——把 3 塞给 a，5 塞给 b，执行函数体，拿回 8

## 形参 vs 实参：别搞混

- **形参**（形式参数）：定义函数时写的占位符，比如 \`def add(a, b)\` 里的 \`a, b\`
- **实参**（实际参数）：调用时传进去的具体值，比如 \`add(3, 5)\` 里的 \`3, 5\`

形参像"变量名"，实参像"具体的值"。调用时，实参被赋给形参。

类比：形参像"模具上的凹槽"，实参像"倒进去的巧克力液"。模具定义时只有凹槽，做的时候倒什么颜色的巧克力，出来就是什么颜色。调用时实参被赋给形参，函数体用形参的名字干活。

## return 的两个作用

return 不只是"返回结果"，它还兼任"终结者"：

1. **把结果送出去**：调用方拿到的就是 return 后面的值
2. **结束函数**：执行到 return，函数立即结束，后面的代码不再执行

\`\`\`python
def check(x):  # 定义函数 check，参数：x
    if x > 0:  # 如果 x > 0
        return "正数"  # 返回 "正数"
        print("这行不会执行")   # return 后立刻退出
    return "非正数"  # 返回 "非正数"
\`\`\`

为什么要这样设计？因为很多场景下"满足条件就立即返回，不再继续"能让代码更清晰。比如查找一个目标，找到了就返回，不必走完整个循环。

## 没 return 怎么办

函数没写 return，或者只写 \`return\` 不带值，都会返回 \`None\`：

\`\`\`python
def say_hi():  # 定义函数 say_hi
    print("hi")  # 打印输出到屏幕

result = say_hi()      # 打印 hi，result 是 None
\`\`\`

\`None\` 是 Python 的"空值"，表示"什么都没有"。如果你忘了 return，调用方拿到 None，后面用它做运算就会报错（比如 \`result + 1\` 报 TypeError）。**这是新手最常见的 bug 之一**：以为函数算出了结果，其实只是 print 了，没 return。

⚠️ **常见坑**：\`print\` 和 \`return\` 完全是两码事。\`print\` 是把东西显示在屏幕上（副作用），\`return\` 才是把结果交给调用方。好函数应该用 return 返回结果，让调用方决定要不要打印。

## 函数能调用别的函数

函数不是孤岛，它们可以互相调用：

\`\`\`python
def square(x):  # 定义函数 square，参数：x
    return x * x  # 返回 x * x

def sum_of_squares(a, b):  # 定义函数 sum_of_squares，参数：a, b
    return square(a) + square(b)    # 调用 square
\`\`\`

这就像工厂流水线：A 工序做半成品，B 工序拿 A 的成品继续加工。把大问题拆成小函数，每个小函数做一件事，组合起来就能解决复杂问题——这叫"分而治之"。

## 函数 = 工具，好工具只做一件事

把函数想象成"工具箱里的工具"——\`print\` 是工具，\`len\` 是工具，你自己写的 \`add\` 也是工具。**好工具做一件事**：\`add\` 就只做加法，不要让它顺便打印东西、不要让它顺便写文件。

为什么？"做一件事"的函数能组合、能复用。一旦函数"顺便"做了别的（比如算加法时偷偷 print），调用方在不想打印的场合就用不了它。这叫"副作用污染"，是代码腐化的开始。

## 函数文档：写给未来自己看

函数体开头可以写三引号字符串，叫**文档字符串**（docstring）：

\`\`\`python
def circle_area(radius):  # 定义函数 circle_area，参数：radius
    """计算圆面积"""  # 执行操作
    pi = 3.14159  # 定义数值 pi
    return pi * radius * radius  # 返回 pi * radius * radius
\`\`\`

为什么写文档？因为三个月后你回来看自己的代码，可能完全忘了这个函数干啥的。有 docstring，用 \`help(circle_area)\` 就能看到说明。养成写 docstring 的习惯，是成为专业程序员的第一步。

## 小结

| 概念 | 一句话总结 |
|---|---|
| \`def\` | 定义函数的关键字 |
| 形参 | 定义时的占位符 |
| 实参 | 调用时的具体值 |
| \`return\` | 返回结果 + 结束函数 |
| \`None\` | 没 return 时的返回值 |
| docstring | 三引号文档字符串 |

## 常见疑问 Q&A

**Q：函数要先定义再调用吗？**  
A：是的。Python 从上往下执行，调用时函数必须已经定义。所以函数定义通常写在文件前面或顶部。

**Q：函数名能和变量名一样吗？**  
A：技术上能，但别这么干。函数名和变量名重名会让后者覆盖前者，\`add = 5\` 之后 \`add(3,5)\` 就报错了。

**Q：return 多个值怎么写？**  
A：\`return a, b, c\` 实际返回元组 \`(a, b, c)\`，调用方用 \`x, y, z = func()\` 解包接收。第 23 章详细讲。

**Q：函数能调用自己吗？**  
A：能，这叫"递归"，第 25 章专门讲。但要小心栈溢出。

## 本章 demo

demo 演示定义、调用、参数、返回值、None，以及函数调用函数。`,
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

如果说函数是"工具"，那参数就是"工具的接口"——你通过参数告诉函数要处理什么。Python 的参数系统比很多语言（比如 C、Java）灵活得多，一个函数能接收 0 个参数，也能接收任意个参数；能按位置传，也能按名字传；还能给参数设默认值。这一章把四种常见用法讲清楚，看完你就能读懂绝大多数 Python 函数签名。

## 1. 位置参数（最常见）

按**位置顺序**对应——第一个实参给第一个形参，第二个给第二个，依此类推：

\`\`\`python
def power(base, exp):  # 定义函数 power，参数：base, exp
    return base ** exp  # 返回 base ** exp

power(2, 3)      # base=2, exp=3 → 8
power(3, 2)      # base=3, exp=2 → 9 顺序变了结果就变
\`\`\`

为什么按位置？因为简单直接，调用方一眼能看出"2 是底数，3 是指数"。但当参数多了（比如 5、6 个），光看位置容易搞混谁是谁——这时候就该用关键字参数了。

## 2. 关键字参数

按**名字**对应，不依赖顺序：

\`\`\`python
power(exp=3, base=2)    # 同样是 8，名字指明了谁是谁
\`\`\`

什么时候用关键字参数？两种场景：
1. **参数多**：调用 \`send_email(to="a@b.com", subject="hi", body="...")\` 比一长串位置参数清楚得多
2. **想突出可读性**：\`transfer(amount=100, from="A", to="B")\` 比 \`transfer(100, "A", "B")\` 一眼能看出在干嘛

位置和关键字可以混用，但**位置参数必须在前**：

\`\`\`python
power(2, exp=3)         # ✅ 2 给 base，exp=3 显式给 exp
power(base=2, 3)        # ❌ 语法错误
\`\`\`

为什么有这个限制？因为如果位置参数在关键字后面，Python 不知道该把那个位置参数给谁——会歧义。所以语法上直接禁止。

## 3. 默认参数

定义时给参数一个默认值，调用时不传就用默认：

\`\`\`python
def greet(name, greeting="你好"):  # 定义函数 greet，参数：name, greeting="你好"
    print(f"{greeting}，{name}")  # 打印输出到屏幕

greet("小明")              # 你好，小明（用默认 greeting）
greet("小明", "嗨")        # 嗨，小明（覆盖默认）
greet("小明", greeting="嗨")  # 同上
\`\`\`

默认参数的价值：让函数"常用情况简化，特殊情况灵活"。比如 \`print\` 函数的 \`end\` 参数默认是换行，不想要换行就 \`print(x, end="")\`。

⚠️ **默认参数必须在普通参数后面**：

\`\`\`python
def f(a, b=1):    # ✅
def f(a=1, b):    # ❌
\`\`\`

为什么？因为调用时位置参数按顺序填，如果默认参数在前，Python 看到 \`f(5)\` 不知道这个 5 是给 a 还是给 b。所以强制要求默认参数靠后。

### ⚠️ 默认参数的坑：可变对象

这是 Python 最经典的坑之一，必须讲：

\`\`\`python
def f(x, lst=[]):       # ⚠️ 默认值是可变列表
    lst.append(x)  # 调用 lst.append()：向列表末尾添加元素
    return lst  # 返回 lst

f(1)    # [1]
f(2)    # [1, 2]   ← 不是 [2]！默认值被共享了
\`\`\`

为什么？**默认值在函数定义时创建一次，不会每次调用重置**。第一次调用创建了空列表 \`[]\`，第二次调用还是用同一个列表，所以累积了上次的元素。

类比：你给酒店房间配了一个"默认果盘"，所有住客共用同一个果盘——上一个住客吃了苹果留下核，下一个住客看到的果盘里就有核。这显然不对。

修复方法：用 \`None\` 当占位，每次调用时再创建新列表：

\`\`\`python
def f(x, lst=None):  # 定义函数 f，参数：x, lst=None
    if lst is None:  # 如果 lst is None
        lst = []  # 定义列表 lst
    lst.append(x)  # 调用 lst.append()：向列表末尾添加元素
    return lst  # 返回 lst
\`\`\`

为什么用 \`None\`？因为 \`None\` 是不可变的"哨兵值"，每次调用都是 \`None\`，进入函数后我们手动创建新列表。这是 Python 社区公认的"惯用法"。

⚠️ **判断用 \`is None\` 而不是 \`== None\`**：因为 \`==\` 可能被自定义类重载，\`is\` 比较身份更安全。

## 4. 可变参数

### \`*args\`：收集多余的位置参数

\`\`\`python
def sum_all(*args):  # 定义函数 sum_all，参数：*args
    print(type(args))    # <class 'tuple'>
    return sum(args)  # 返回 sum(args)

sum_all(1, 2, 3)         # 6
sum_all(1, 2, 3, 4, 5)   # 15
\`\`\`

\`args\` 是个元组，包含所有位置参数。为什么是元组不是列表？因为函数参数不应该被函数体修改——元组不可变，更安全。

为什么需要 \`*args\`？因为有时候你不知道调用方会传几个参数。比如 \`print\` 就是用 \`*args\` 实现的，能打印任意多个值：\`print(1, 2, 3, 4, 5)\`。

### \`**kwargs\`：收集多余的关键字参数

\`\`\`python
def show(**kwargs):  # 定义函数 show，参数：**kwargs
    print(type(kwargs))   # <class 'dict'>
    for k, v in kwargs.items():  # 遍历 kwargs.items()，取值给 k, v
        print(f"  {k} = {v}")  # 打印输出到屏幕

show(name="小明", age=18)  # 调用 show()
\`\`\`

\`kwargs\` 是个字典，键是参数名，值是参数值。常用于"配置项"——调用方想传什么配置就传什么，函数体里按需取。

### 解包：把列表/字典"拆"成参数

\`\`\`python
def add(a, b, c):  # 定义函数 add，参数：a, b, c
    return a + b + c  # 返回 a + b + c

nums = [1, 2, 3]  # 定义列表 nums
add(*nums)             # 等价于 add(1, 2, 3)

d = {"a": 1, "b": 2, "c": 3}  # 定义字典 d
add(**d)               # 等价于 add(a=1, b=2, c=3)
\`\`\`

\`*\` 把列表/元组拆成位置参数，\`**\` 把字典拆成关键字参数。这在"参数已经在一个容器里"时特别有用——比如你有一个配置字典，直接 \`**config\` 传给函数。

## 参数顺序

完整顺序（缺一不可时按这个排）：

\`\`\`python
def f(位置参数, *args, 关键字参数, **kwargs):  # 定义函数 f，参数：位置参数, *args, 关键字参数, **kwargs
    ...  # 执行操作
\`\`\`

记忆口诀："位置 → 收位置 → 关键字 → 收关键字"。Python 解析参数时严格按这个顺序，乱排会语法错误。

## 小结

| 参数类型 | 写法 | 收集成 | 典型场景 |
|---|---|---|---|
| 位置参数 | \`f(a, b)\` | 直接赋值 | 最常见 |
| 关键字参数 | \`f(a=1)\` | 直接赋值 | 参数多、想可读 |
| 默认参数 | \`f(a=1)\` | 直接赋值 | 常用情况简化 |
| \`*args\` | \`f(*args)\` | 元组 | 任意多个位置参数 |
| \`**kwargs\` | \`f(**kwargs)\` | 字典 | 任意多个关键字参数 |

## 常见疑问 Q&A

**Q：\`*args\` 里的 args 是关键字吗？**  
A：不是，\`*\` 才是关键，\`args\` 只是约定俗成的名字。你写 \`*whatever\` 也行，但社区习惯叫 \`args\`。

**Q：能同时用 \`*args\` 和 \`**kwargs\` 吗？**  
A：能，\`def f(*args, **kwargs)\` 表示"什么都吃"。Web 框架里大量这么写，为了灵活转发参数。

**Q：默认参数为什么不用可变对象？**  
A：见上方"坑"——会被所有调用共享。用 \`None\` 占位是标准做法。

**Q：\`*nums\` 解包和直接传列表有什么区别？**  
A：\`add(*[1,2,3])\` 等价于 \`add(1,2,3)\` 三个参数；\`add([1,2,3])\` 是传一个列表当第一个参数。差一个 \`*\` 行为完全不同。

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

函数像一个小工厂：原料（参数）从入口进，产品（返回值）从出口出。\`return\` 就是那个出口——它把计算结果"递"给调用方。

\`\`\`python
def add(a, b):  # 定义函数 add，参数：a, b
    return a + b       # 把 a+b 的结果送出去

result = add(3, 5)     # result 接住返回值
\`\`\`

为什么要 return？因为函数算出的结果，调用方要用——比如存起来、再加工、显示给用户。如果没有 return，调用方拿不到结果，函数就只是"自己做了一堆事，结果自己消化了"。

类比：函数像餐厅后厨，return 像"传菜窗口"。厨师（函数）做好了菜，得通过传菜窗口（return）递给服务员（调用方）。不 return 就像厨师把菜自己吃了，服务员和客人都饿着。

## 没 return 就返回 None

\`\`\`python
def say_hi():  # 定义函数 say_hi
    print("hi")  # 打印输出到屏幕

r = say_hi()           # 打印 hi，r 是 None
\`\`\`

\`return\` 后面不写值，或者整个函数没 return，都返回 \`None\`。\`None\` 是 Python 的"空"，表示"啥也没有"。

⚠️ **新手最常踩的坑**：以为函数"算出来了"就 return 了。比如：

\`\`\`python
def add(a, b):  # 定义函数 add，参数：a, b
    print(a + b)       # 只是打印，没 return！

result = add(3, 5)     # result 是 None
result + 1             # ❌ TypeError: NoneType + int
\`\`\`

记住：**\`print\` 不是 \`return\`**。print 把结果显示在屏幕上，但调用方拿不到；return 才是把结果交给调用方。

## 返回多个值（其实是元组）

Python 看起来能"返回多个值"：

\`\`\`python
def min_max(nums):  # 定义函数 min_max，参数：nums
    return min(nums), max(nums)  # 返回 min(nums), max(nums)

low, high = min_max([3, 1, 4, 1, 5])  # 多重赋值：low, high
\`\`\`

实际上 \`return min(nums), max(nums)\` 返回的是**元组** \`(min, max)\`，调用方用元组解包接收。第 12 章讲过这个。

为什么这个设计很妙？因为很多场景需要一次返回多个相关结果——比如统计要同时返回最小、最大、平均、中位数。如果没有"多返回值"，你得用列表/字典包一层，调用方再取，啰嗦。

## 提前返回（早退）

不要把所有逻辑塞一个 return。条件不满足就直接返回，代码更清晰：

\`\`\`python
def divide(a, b):  # 定义函数 divide，参数：a, b
    if b == 0:  # 如果 b == 0
        return None       # 除数为 0，直接返回
    return a / b          # 否则才计算
\`\`\`

这叫"早退"（early return）或"卫语句"（guard clause），比层层嵌套 if 易读。对比：

\`\`\`python
# ❌ 嵌套版（丑）
def divide(a, b):  # 定义函数 divide，参数：a, b
    if b != 0:  # 如果 b != 0
        if a > 0:  # 如果 a > 0
            return a / b  # 返回 a / b
        else:  # 否则
            return -a / b  # 返回 -a / b
    return None  # 返回 None

# ✅ 早退版（清晰）
def divide(a, b):  # 定义函数 divide，参数：a, b
    if b == 0:  # 如果 b == 0
        return None  # 返回 None
    if a < 0:  # 如果 a < 0
        a = -a  # 赋值变量 a
    return a / b  # 返回 a / b
\`\`\`

为什么早退更好？因为大脑读嵌套代码要"压栈"——记住外层条件，再读内层。早退让"主线"始终在最外层，特殊情况处理完就退出，主线一目了然。

## 返回函数

Python 函数是"一等公民"（first-class citizen），可以当返回值返回。这是后面"闭包""装饰器"的基础：

\`\`\`python
def make_multiplier(n):  # 定义函数 make_multiplier，参数：n
    def multiply(x):  # 定义函数 multiply，参数：x
        return x * n  # 返回 x * n
    return multiply       # 返回一个函数

double = make_multiplier(2)   # double 是个函数
double(5)                     # 10
\`\`\`

为什么返回函数？因为有时候你需要"定制一个函数"——比如先告诉它"乘以几"，拿到一个"乘以那个数"的函数，以后到处用。这是函数式编程的核心思想之一，第 28 章详讲。

## 返回值要不要打印

\`\`\`python
def add(a, b):  # 定义函数 add，参数：a, b
    return a + b  # 返回 a + b

add(3, 5)              # 不打印，结果丢了
print(add(3, 5))       # 打印返回值
result = add(3, 5)     # 存起来
\`\`\`

三种用法都对，看需求。但函数内部的 \`print\` 是"副作用"，\`return\` 才是"输出结果"。**好函数尽量用 return，让调用方决定要不要打印**——因为同一个函数可能用在命令行工具里（要打印），也可能用在网页后端里（不能直接 print，要返回给前端）。

## 返回不同类型

Python 函数返回什么类型都行，甚至不同分支返回不同类型：

\`\`\`python
def classify(score):  # 定义函数 classify，参数：score
    if score >= 90: return "优秀"     # str
    if score >= 60: return ["及格"]   # list
    return None                       # None
\`\`\`

但**通常不建议这么干**——调用方要判断类型，容易出 bug。统一返回同类型（比如都返回字符串）更安全。

## 小结

| 用法 | 说明 |
|---|---|
| \`return x\` | 返回 x 并结束函数 |
| \`return\` | 返回 None |
| 没 return | 返回 None |
| \`return a, b\` | 返回元组 (a, b) |
| 早退 | 卫语句，条件不满足直接 return |
| 返回函数 | 闭包/装饰器的基础 |

## 常见疑问 Q&A

**Q：函数能 return 多次吗？**  
A：一次执行只可能 return 一次——return 后函数就结束了。但函数体里可以写多个 return（不同分支），执行时只走其中一个。

**Q：return 后面的代码会执行吗？**  
A：不会。return 立即结束函数。所以 return 后的代码是"死代码"，IDE 通常会提示。

**Q：怎么返回多个不同类型的结果？**  
A：用元组 \`(a, b, c)\` 或字典 \`{"x": a, "y": b}\`。字典更好——调用方按名字取，不依赖顺序。

**Q：函数没 return，为什么调用时不报错？**  
A：因为 Python 默认返回 None，不算错误。但如果你拿 None 去做运算才会报错。

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
def f():  # 定义函数 f
    x = 10          # x 在函数里定义
    print(x)        # 函数里能用

f()  # 调用 f()
print(x)            # ❌ 报错！函数外看不到 x
\`\`\`

为什么有作用域？想象一下如果没有作用域：你写 \`for i in range(10)\` 之后，\`i\` 永远活在内存里，下次再写 \`for i in ...\` 就冲突了。作用域让变量"用完即弃"，不互相干扰——这是软件工程的基本隔离原则。

类比：作用域像"房间的灯光"。你打开卧室灯，只照亮卧室，客厅不受影响。函数内的变量像"卧室的灯"，函数外看不到；模块级变量像"院子的大灯"，所有房间都能看见。

## LEGB 规则

Python 查找变量按这个顺序：

1. **L** (Local)：当前函数内部
2. **E** (Enclosing)：外层嵌套函数
3. **G** (Global)：模块（文件）级别
4. **B** (Built-in)：内置（\`print\`、\`len\` 这些）

找到一个就用，找不到报 \`NameError\`。

\`\`\`python
x = "全局"            # G
def outer():  # 定义函数 outer
    x = "外层"        # E
    def inner():  # 定义函数 inner
        x = "内层"    # L
        print(x)      # 用 L 的
    inner()  # 调用 inner()
outer()               # 打印"内层"
\`\`\`

记忆口诀：**L → E → G → B**，从最近的房间往外找。先找自己屋里（L），没有就去隔壁（E），再没有去院子（G），最后去"公共图书馆"（B，内置）。

## 函数能"读"外部变量，但不能随便"改"

\`\`\`python
count = 0  # 定义数值 count
def show():  # 定义函数 show
    print(count)     # ✅ 能读全局的 count

def add():  # 定义函数 add
    count = count + 1   # ❌ 报错！
\`\`\`

为什么改不了？因为函数里出现 \`count = ...\`，Python 默认 \`count\` 是**局部变量**，但又要在赋值前读它，矛盾就报错。

⚠️ **这是新手最常踩的坑**：以为函数内能直接改全局变量。其实 Python 的规则是"赋值即创建局部变量"，除非你显式声明。

## global：声明我要用全局变量

\`\`\`python
count = 0  # 定义数值 count
def add():  # 定义函数 add
    global count      # 声明 count 是全局的那个
    count += 1  # count 累加
\`\`\`

\`global\` 告诉 Python："我这里写的 count 不是新的局部变量，是外面那个全局的"。这样修改就作用于全局。

## nonlocal：改外层（非全局）变量

嵌套函数里，要改**外层函数**的变量用 \`nonlocal\`：

\`\`\`python
def outer():  # 定义函数 outer
    n = 0  # 定义数值 n
    def inner():  # 定义函数 inner
        nonlocal n    # n 是 outer 里的那个
        n += 1  # n 累加
    inner()  # 调用 inner()
\`\`\`

\`nonlocal\` 和 \`global\` 的区别：
- \`global\`：改模块级（全局）变量
- \`nonlocal\`：改外层函数的变量（不是全局，是中间层）

为什么需要 \`nonlocal\`？因为闭包（第 28 章）里内层函数要修改外层的状态，必须显式声明，否则 Python 默认它是局部变量。

## ⚠️ 少用 global

全局变量谁都能改，容易出 bug。能用参数传就用参数，能用返回值就用返回值。\`global\` 只在确实需要时（比如计数器、配置）才用。

为什么全局变量危险？因为大型项目里几十个函数都可能改同一个全局变量，出了 bug 你根本不知道是谁改的。这叫"意大利面条式代码"——所有东西互相纠缠。

更好的做法：把状态封装在类里（第 31 章讲），或者用闭包（第 28 章）。

## 函数参数也是局部变量

\`\`\`python
def f(a):  # 定义函数 f，参数：a
    print(a)          # a 是局部的
f(5)  # 调用 f()
print(a)              # ❌ 外部看不到 a
\`\`\`

参数本质上就是函数内的局部变量，只不过"调用时被赋了值"。函数结束后，参数连同函数内其他局部变量一起被回收。

## 同名遮蔽（shadowing）

\`\`\`python
x = 100  # 定义数值 x
def f():  # 定义函数 f
    x = 200          # 这是局部 x，不是全局的
    print(x)         # 200
f()  # 调用 f()
print(x)             # 100，全局的没变
\`\`\`

这叫"遮蔽"——局部变量"遮住"了同名的全局变量。函数内访问 \`x\` 拿到的是局部的，函数外 \`x\` 还是原来的。

⚠️ **坑**：你以为改了全局，其实只是创建了个局部变量。要真改全局，得 \`global x\`。

## ⚠️ 别用内置名当变量名

\`\`\`python
len = 5              # 灾难！
len([1, 2, 3])       # ❌ TypeError: 'int' is not callable
\`\`\`

为什么？因为 \`len = 5\` 在全局作用域创建了一个 \`len\`，遮蔽了内置的 \`len\` 函数。之后所有用 \`len()\` 的地方都报错。修复：\`del len\` 删掉全局的，恢复内置。

## 小结

| 概念 | 说明 |
|---|---|
| L | Local，当前函数内 |
| E | Enclosing，外层嵌套函数 |
| G | Global，模块级 |
| B | Built-in，内置 |
| \`global\` | 改全局变量 |
| \`nonlocal\` | 改外层函数变量 |
| 遮蔽 | 局部同名遮住外层 |

## 常见疑问 Q&A

**Q：为什么 \`for\` 循环里的变量外面还能用？**  
A：Python 的 for 不创建新作用域。循环结束后循环变量还在当前作用域里。这和 C/Java 不一样。

**Q：函数内能改列表的内容吗？**  
A：能。\`lst.append(x)\` 是修改对象，不是赋值。但 \`lst = [1,2]\` 是赋值，会创建局部变量。这是"可变对象"和"赋值"的区别。

**Q：\`global\` 能用几次？**  
A：函数内 \`global x\` 只需声明一次，之后所有 \`x\` 都指全局。

**Q：嵌套三层函数，\`nonlocal\` 改哪层？**  
A：改最近一层有该变量的外层。要跨层得用其他方式（比如闭包）。

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
def factorial(n):  # 定义函数 factorial，参数：n
    if n == 1:           # 终止条件
        return 1  # 返回 1
    return n * factorial(n - 1)    # 调用自己，规模更小

factorial(5)    # 120
\`\`\`

为什么需要递归？因为有些问题天然是"自相似"的——大问题和子问题结构一样，只是规模不同。

比如遍历文件夹：文件夹里有文件，也有子文件夹；子文件夹里又有文件和更深的子文件夹……你需要一层一层进去看，这就是递归。

## 递归的"两件套"

每个递归函数必须有两个部分：

1. **终止条件**（base case）：什么时候停下来，不再调用自己
2. **递归步骤**（recursive step）：把问题缩小，调用自己

没有终止条件 → 无限调用 → 栈溢出（\`RecursionError\`）。

\`\`\`python
def factorial(n):  # 定义函数 factorial，参数：n
    if n == 1:           # 终止条件
        return 1  # 返回 1
    return n * factorial(n - 1)    # 递归步骤：n 变小
\`\`\`

类比：递归像"俄罗斯套娃"。你要数一共有多少个娃娃：打开最大的，里面有一个稍小的；再打开，又有一个更小的……直到打开最小的那个（终止条件），数它一个，然后逐层合回去，每层加一。

## 执行过程：调用栈

\`factorial(3)\` 的执行过程：

\`\`\`
factorial(3)
  → 3 * factorial(2)
       → 2 * factorial(1)
            → 1              # 终止，返回 1
       → 2 * 1 = 2
  → 3 * 2 = 6
\`\`\`

每次调用都在"栈"上压一层，返回时弹出。栈太深（比如递归几万次）会爆掉 → \`RecursionError\`。

## 更多例子

### 斐波那契数列

\`\`\`python
def fib(n):  # 定义函数 fib，参数：n
    if n <= 1:  # 如果 n <= 1
        return n  # 返回 n
    return fib(n - 1) + fib(n - 2)  # 返回 fib(n - 1) + fib(n - 2)

# fib(0)=0, fib(1)=1, fib(2)=1, fib(3)=2, fib(4)=3, fib(5)=5
\`\`\`

⚠️ 这个版本很慢（指数级时间复杂度），因为重复计算了很多子问题。优化方法：记忆化（第 28 章闭包会讲）。

### 列表求和

\`\`\`python
def list_sum(lst):  # 定义函数 list_sum，参数：lst
    if not lst:              # 空列表
        return 0  # 返回 0
    return lst[0] + list_sum(lst[1:])    # 第一个 + 剩下的和
\`\`\`

### 反转字符串

\`\`\`python
def reverse(s):  # 定义函数 reverse，参数：s
    if not s:  # 如果 not s
        return ""  # 返回 ""
    return reverse(s[1:]) + s[0]  # 返回 reverse(s[1:]) + s[0]
\`\`\`

## 递归 vs 循环

任何递归都能改写成循环（用栈模拟），任何循环也都能改写成递归。选择哪个看问题本身的结构：

- **问题天然递归**（树、文件夹、分形）→ 用递归更直观
- **简单重复**（累加、遍历列表）→ 用循环更高效（避免栈开销）

Python 默认递归深度限制约 1000 层，可以用 \`sys.setrecursionlimit()\` 调大，但一般不推荐——深递归用循环更稳妥。

## 小结

| 概念 | 说明 |
|---|---|
| 递归 | 函数调用自己 |
| 终止条件 | 必须有的"刹车"，否则无限递归 |
| 递归步骤 | 把问题缩小，朝终止条件靠近 |
| 调用栈 | 每次调用压栈，返回时弹栈 |
| 栈溢出 | 递归太深 → \`RecursionError\` |

## 常见疑问 Q&A

**Q：递归一定比循环慢吗？**  
A：不一定。有些语言（如 Scheme、Haskell）做了"尾递归优化"，尾递归和循环一样快。但 Python 没有尾递归优化，所以深递归确实比循环慢。

**Q：什么是尾递归？**  
A：递归调用是函数最后一步操作，不需要保留当前栈帧。Python 不支持，但了解概念有助于理解递归本质。

**Q：递归深度有限制怎么办？**  
A：用 \`sys.setrecursionlimit(10000)\` 调大。但更好的做法是改用循环或迭代方式。

## 本章 demo

demo 演示阶乘、斐波那契、列表求和的递归实现。`,
    code: `# ============================================
# 第 25 章：递归
# ============================================

# --- 1. 阶乘 ---
print("=== 1. 阶乘 ===")
def factorial(n):
    """递归求 n!"""
    if n == 1:
        return 1
    return n * factorial(n - 1)

print(f"  factorial(1) = {factorial(1)}")
print(f"  factorial(3) = {factorial(3)}")
print(f"  factorial(5) = {factorial(5)}")

# --- 2. 斐波那契 ---
print("\\n=== 2. 斐波那契 ===")
def fib(n):
    """递归求第 n 个斐波那契数"""
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

for i in range(8):
    print(f"  fib({i}) = {fib(i)}")

# --- 3. 列表求和 ---
print("\\n=== 3. 列表求和 ===")
def list_sum(lst):
    """递归求列表元素之和"""
    if not lst:
        return 0
    return lst[0] + list_sum(lst[1:])

print(f"  list_sum([1,2,3,4,5]) = {list_sum([1,2,3,4,5])}")

# --- 4. 反转字符串 ---
print("\\n=== 4. 反转字符串 ===")
def reverse(s):
    """递归反转字符串"""
    if not s:
        return ""
    return reverse(s[1:]) + s[0]

print(f"  reverse('hello') = '{reverse('hello')}'")

# --- 5. 递归深度演示 ---
print("\\n=== 5. 递归深度 ===")
def countdown(n):
    """递归倒计时"""
    if n <= 0:
        print("  发射！🚀")
        return
    print(f"  {n}...")
    countdown(n - 1)

countdown(5)

# --- 6. 嵌套列表求和（展示递归的优势）---
print("\\n=== 6. 嵌套列表求和 ===")
def nested_sum(lst):
    """递归求嵌套列表所有数字之和"""
    total = 0
    for item in lst:
        if isinstance(item, list):
            total += nested_sum(item)    # 递归处理子列表
        else:
            total += item
    return total

data = [1, [2, 3], [4, [5, 6]], 7]
print(f"  nested_sum({data}) = {nested_sum(data)}")`
  },

  // -----------------------------------------------------------
  // 第 26 章：lambda 表达式
  // -----------------------------------------------------------
  {
    id: "py9-26",
    group: "函数：代码的复用",
    icon: "λ",
    title: "lambda：一行搞定的匿名函数",
    content: `## 什么是 lambda

**lambda** 是一种"一行写完"的匿名函数。匿名 = 没有名字。

\`\`\`python
# 普通函数
def add(a, b):  # 定义函数 add，参数：a, b
    return a + b  # 返回 a + b

# lambda 等价写法
add = lambda a, b: a + b  # 定义 lambda 函数，赋给 add
\`\`\`

\`lambda a, b: a + b\` 的意思是："接收 a 和 b，返回 a + b"。整个函数就一行。

## 语法

\`\`\`
lambda 参数1, 参数2, ...: 表达式
\`\`\`

- 只能有一个表达式（不能写多行、不能有 \`if/for/while\` 语句）
- 自动返回表达式的值（不需要 \`return\`）

## 什么时候用 lambda

lambda 最大的用途是**传给高阶函数**（第 27 章）作为"一次性"的回调。比如排序时指定排序规则：

\`\`\`python
students = [("小明", 85), ("小红", 92), ("小华", 78)]  # 定义列表 students

# 按成绩排序（第二个元素）
students.sort(key=lambda s: s[1])  # 调用 students.sort()：原地排序
# [("小华", 78), ("小明", 85), ("小红", 92)]
\`\`\`

如果不使用 lambda，你得单独定义一个函数：

\`\`\`python
def get_score(student):  # 定义函数 get_score，参数：student
    return student[1]  # 返回 student[1]

students.sort(key=get_score)  # 调用 students.sort()：原地排序
\`\`\`

lambda 让你省掉"起名 + def + return"的仪式感，直接写核心逻辑。

## lambda 的限制

\`\`\`python
# ❌ 不能有 if 语句
lambda x: if x > 0: return x    # 语法错误

# ✅ 可以用三元表达式替代
lambda x: x if x > 0 else 0     # 负数变 0

# ❌ 不能有多行
lambda x:  # 执行操作
    y = x + 1    # 语法错误
    return y  # 返回 y

# ✅ 只能一行
lambda x: x + 1  # 执行操作
\`\`\`

## lambda 能直接调用

\`\`\`python
result = (lambda a, b: a + b)(3, 5)    # 8
\`\`\`

定义完立即调用，但一般不这么写——可读性差。

## lambda vs 普通函数

| 对比 | lambda | def |
|---|---|---|
| 名字 | 匿名 | 有名字 |
| 行数 | 一行 | 可以很多行 |
| 逻辑 | 只能一个表达式 | 可以有循环、条件、多语句 |
| 可读性 | 简短时好，复杂时差 | 好 |

**经验法则**：逻辑超过一行就别用 lambda，老老实实 def。

## 小结

| 概念 | 说明 |
|---|---|
| lambda | 匿名函数，一行搞定 |
| 语法 | \`lambda 参数: 表达式\` |
| 适用场景 | 传给高阶函数的一次性回调 |
| 限制 | 只能一个表达式，不能多行 |

## 常见疑问 Q&A

**Q：lambda 和普通函数性能一样吗？**  
A：一样。lambda 只是语法糖，底层生成的字节码和普通函数没区别。

**Q：lambda 能访问外部变量吗？**  
A：能，和普通函数一样遵循 LEGB 规则。

**Q：什么时候该用 lambda？**  
A：当函数逻辑简单到一行能写完，且只在一个地方用一次时。

## 本章 demo

demo 演示 lambda 的几种用法。`,
    code: `# ============================================
# 第 26 章：lambda 表达式
# ============================================

# --- 1. 基本 lambda ---
print("=== 1. 基本 lambda ===")
add = lambda a, b: a + b
print(f"  add(3, 5) = {add(3, 5)}")

square = lambda x: x * x
print(f"  square(4) = {square(4)}")

# --- 2. 直接调用 ---
print("\\n=== 2. 直接调用 ===")
result = (lambda x, y: x * y)(6, 7)
print(f"  (lambda x,y: x*y)(6, 7) = {result}")

# --- 3. 带条件的 lambda（三元表达式）---
print("\\n=== 3. 三元表达式 ===")
abs_val = lambda x: x if x >= 0 else -x
print(f"  abs_val(-5) = {abs_val(-5)}")
print(f"  abs_val(3) = {abs_val(3)}")

# --- 4. 排序时指定 key ---
print("\\n=== 4. 排序用 key ===")
students = [("小明", 85), ("小红", 92), ("小华", 78), ("小李", 95)]
students.sort(key=lambda s: s[1])    # 按成绩排
print(f"  按成绩排序: {students}")

students.sort(key=lambda s: len(s[0]))    # 按名字长度排
print(f"  按名字长度排: {students}")

# --- 5. 配合 map/filter ---
print("\\n=== 5. map/filter ===")
nums = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x**2, nums))
print(f"  平方: {squared}")

evens = list(filter(lambda x: x % 2 == 0, nums))
print(f"  偶数: {evens}")

# --- 6. 嵌套在函数里 ---
print("\\n=== 6. 函数内返回 lambda ===")
def make_multiplier(factor):
    return lambda x: x * factor

double = make_multiplier(2)
triple = make_multiplier(3)
print(f"  double(5) = {double(5)}")
print(f"  triple(5) = {triple(5)}")`
  },

  // -----------------------------------------------------------
  // 第 27 章：高阶函数
  // -----------------------------------------------------------
  {
    id: "py9-27",
    group: "函数：代码的复用",
    icon: "🔧",
    title: "高阶函数：把函数当参数传",
    content: `## 什么是高阶函数

**高阶函数**是"接收函数作为参数，或者返回函数"的函数。

Python 内置的高阶函数有三个最常用的：

1. \`map(func, iterable)\` — 对每个元素应用 func
2. \`filter(func, iterable)\` — 保留 func 返回 True 的元素
3. \`sorted(iterable, key=func)\` — 按 func 的返回值排序

## map：批量加工

\`\`\`python
nums = [1, 2, 3, 4, 5]  # 定义列表 nums

# 每个数平方
squared = list(map(lambda x: x**2, nums))  # 赋值变量 squared
# [1, 4, 9, 16, 25]

# 每个数转字符串
strs = list(map(str, nums))  # 赋值变量 strs
# ['1', '2', '3', '4', '5']
\`\`\`

\`map\` 等价于这个循环，但更简洁：

\`\`\`python
result = []  # 定义列表 result
for x in nums:  # 遍历 nums，取值给 x
    result.append(x**2)  # 调用 result.append()：向列表末尾添加元素
\`\`\`

## filter：批量筛选

\`\`\`python
nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]  # 定义列表 nums

# 保留偶数
evens = list(filter(lambda x: x % 2 == 0, nums))  # 赋值变量 evens
# [2, 4, 6, 8, 10]

# 保留大于 5 的
big = list(filter(lambda x: x > 5, nums))  # 赋值变量 big
# [6, 7, 8, 9, 10]
\`\`\`

\`filter\` 等价于：

\`\`\`python
result = []  # 定义列表 result
for x in nums:  # 遍历 nums，取值给 x
    if x % 2 == 0:  # 如果 x % 2 == 0
        result.append(x)  # 调用 result.append()：向列表末尾添加元素
\`\`\`

## sorted：自定义排序

\`\`\`python
words = ["banana", "apple", "cherry", "date"]  # 定义列表 words

# 按长度排序
by_len = sorted(words, key=len)  # 赋值变量 by_len
# ['date', 'apple', 'banana', 'cherry']

# 按最后一个字母排序
by_last = sorted(words, key=lambda w: w[-1])  # 赋值变量 by_last
# ['banana', 'apple', 'date', 'cherry']
\`\`\`

## 组合使用

\`\`\`python
students = [("小明", 85), ("小红", 92), ("小华", 78)]  # 定义列表 students

# 取出成绩 > 80 的学生名字，按成绩降序
top = sorted(  # 赋值变量 top
    filter(lambda s: s[1] > 80, students),  # 过滤
    key=lambda s: s[1],  # 定义 lambda 函数，赋给 key
    reverse=True  # 赋值变量 reverse
)
# [("小红", 92), ("小明", 85)]
names = list(map(lambda s: s[0], top))  # 赋值变量 names
# ["小红", "小明"]
\`\`\`

## reduce：累积（需要 import）

\`\`\`python
from functools import reduce  # 从 functools 导入 reduce

nums = [1, 2, 3, 4, 5]  # 定义列表 nums
product = reduce(lambda a, b: a * b, nums)  # 赋值变量 product
# 1*2*3*4*5 = 120
\`\`\`

\`reduce\` 把函数"累积"应用：先 \`f(1,2)=2\`，再 \`f(2,3)=6\`，再 \`f(6,4)=24\`，最后 \`f(24,5)=120\`。

## 列表推导式 vs map/filter

Python 更常用**列表推导式**：

\`\`\`python
# map 等价写法
[x**2 for x in nums]  # 列表推导式

# filter 等价写法
[x for x in nums if x % 2 == 0]  # 列表推导式

# map + filter 等价写法
[x**2 for x in nums if x % 2 == 0]  # 列表推导式
\`\`\`

推导式通常更易读。map/filter 的优势在于可以配合现成函数（如 \`str\`、\`len\`）使用，不需要写 lambda。

## 小结

| 函数 | 作用 | 返回 |
|---|---|---|
| \`map\` | 对每个元素加工 | 新列表（长度不变） |
| \`filter\` | 筛选元素 | 新列表（长度可能变短） |
| \`sorted\` | 排序 | 新列表 |
| \`reduce\` | 累积 | 单个值 |

## 常见疑问 Q&A

**Q：map 和 filter 返回的是列表吗？**  
A：Python 3 中返回的是迭代器（iterator），需要用 \`list()\` 转成列表。

**Q：什么时候用 map/filter，什么时候用推导式？**  
A：逻辑简单且能用现成函数时，用 map/filter；需要复杂表达式时，用推导式更清晰。

**Q：reduce 常用吗？**  
A：不常用。大多数场景用 \`sum()\`、\`max()\`、\`min()\` 等内置函数就够了。

## 本章 demo

demo 演示 map、filter、sorted、reduce 的用法。`,
    code: `# ============================================
# 第 27 章：高阶函数
# ============================================

# --- 1. map ---
print("=== 1. map ===")
nums = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x**2, nums))
print(f"  平方: {squared}")

strs = list(map(str, nums))
print(f"  转字符串: {strs}")

# --- 2. filter ---
print("\\n=== 2. filter ===")
evens = list(filter(lambda x: x % 2 == 0, nums))
print(f"  偶数: {evens}")

big = list(filter(lambda x: x > 3, nums))
print(f"  大于3: {big}")

# --- 3. sorted ---
print("\\n=== 3. sorted ===")
words = ["banana", "apple", "cherry", "date"]
by_len = sorted(words, key=len)
print(f"  按长度排: {by_len}")

students = [("小明", 85), ("小红", 92), ("小华", 78)]
by_score = sorted(students, key=lambda s: s[1], reverse=True)
print(f"  按成绩降序: {by_score}")

# --- 4. 组合使用 ---
print("\\n=== 4. 组合 ===")
# 成绩>80的学生名字
top_names = list(map(
    lambda s: s[0],
    filter(lambda s: s[1] > 80, students)
))
print(f"  成绩>80的学生: {top_names}")

# --- 5. reduce ---
print("\\n=== 5. reduce ===")
from functools import reduce

product = reduce(lambda a, b: a * b, nums)
print(f"  连乘: {product}")

total = reduce(lambda a, b: a + b, nums)
print(f"  累加: {total}")

# --- 6. map + filter 等价于推导式 ---
print("\\n=== 6. 推导式对比 ===")
# map 写法
r1 = list(map(lambda x: x**2, filter(lambda x: x % 2 == 0, nums)))
# 推导式写法
r2 = [x**2 for x in nums if x % 2 == 0]
print(f"  map/filter: {r1}")
print(f"  推导式:     {r2}")
print(f"  结果相同: {r1 == r2}")`
  },

  // -----------------------------------------------------------
  // 第 28 章：闭包
  // -----------------------------------------------------------
  {
    id: "py9-28",
    group: "函数：代码的复用",
    icon: "📦",
    title: "闭包：函数带着外层的变量",
    content: `## 什么是闭包

**闭包** = 内层函数 + 它引用的外层函数变量。

当一个函数"记住"了外层函数的变量，即使外层函数已经返回，这个组合就叫闭包。

\`\`\`python
def make_adder(n):  # 定义函数 make_adder，参数：n
    def adder(x):  # 定义函数 adder，参数：x
        return x + n    # n 是外层的变量
    return adder        # 返回的是函数本身，不是调用结果

add5 = make_adder(5)    # add5 "记住了" n=5
print(add5(3))          # 8
print(add5(10))         # 15
\`\`\`

\`make_adder\` 返回后，\`n\` 本该被回收，但 \`adder\` 还在用它——Python 把 \`n\` 和 \`adder\` 绑在一起，形成闭包。

## 闭包的作用：状态封装

闭包可以"记住"状态，替代全局变量：

\`\`\`python
def make_counter():  # 定义函数 make_counter
    count = 0  # 定义数值 count
    def counter():  # 定义函数 counter
        nonlocal count    # 必须用 nonlocal 才能改
        count += 1  # count 累加
        return count  # 返回 count
    return counter  # 返回 counter

c = make_counter()  # 赋值变量 c
print(c())    # 1
print(c())    # 2
print(c())    # 3
\`\`\`

每次调用 \`c()\`，它都"记得"上次 \`count\` 的值。这就是闭包的力量——函数有了"记忆"。

## 闭包的本质

普通函数：输入 → 输出，每次独立。  
闭包函数：输入 → 输出，且**依赖之前的状态**。

类比：普通函数像自动售货机（投币出货，不记得之前谁来过）；闭包像你的记账本（每次记一笔，余额基于上次）。

## 闭包 vs 类

闭包和类都能实现"带状态的对象"：

\`\`\`python
# 闭包版本
def make_counter():  # 定义函数 make_counter
    count = 0  # 定义数值 count
    def counter():  # 定义函数 counter
        nonlocal count  # 声明非局部变量 count
        count += 1  # count 累加
        return count  # 返回 count
    return counter  # 返回 counter

# 类等价版本
class Counter:  # 定义类 Counter
    def __init__(self):  # 定义函数 __init__，参数：self
        self.count = 0  # 执行操作
    def __call__(self):  # 定义函数 __call__，参数：self
        self.count += 1  # 执行操作
        return self.count  # 返回 self.count
\`\`\`

闭包更轻量（不需要类定义），类更灵活（可以有多个方法、继承）。简单状态用闭包，复杂状态用类。

## 闭包常见陷阱

\`\`\`python
# ❌ 经典 bug
funcs = []  # 定义列表 funcs
for i in range(3):  # 遍历 range(3)，取值给 i
    funcs.append(lambda: i)  # 调用 funcs.append()：向列表末尾添加元素

print([f() for f in funcs])    # [2, 2, 2]  不是 [0, 1, 2]！
\`\`\`

为什么？因为 lambda 捕获的是变量 \`i\` 的引用，不是当时的值。循环结束时 \`i=2\`，所以三个 lambda 都返回 2。

修复：用默认参数"冻结"值：

\`\`\`python
funcs = []  # 定义列表 funcs
for i in range(3):  # 遍历 range(3)，取值给 i
    funcs.append(lambda i=i: i)    # 默认参数在定义时求值

print([f() for f in funcs])    # [0, 1, 2] ✅
\`\`\`

## 记忆化（缓存）

闭包最实用的场景之一——缓存计算结果：

\`\`\`python
def memoize(func):  # 定义函数 memoize，参数：func
    cache = {}  # 定义字典 cache
    def wrapper(*args):  # 定义函数 wrapper，参数：*args
        if args not in cache:  # 如果 args not in cache
            cache[args] = func(*args)  # 执行操作
        return cache[args]  # 返回 cache[args]
    return wrapper  # 返回 wrapper

@memoize  # 应用装饰器 memoize
def fib(n):  # 定义函数 fib，参数：n
    if n < 2:  # 如果 n < 2
        return n  # 返回 n
    return fib(n-1) + fib(n-2)  # 返回 fib(n-1) + fib(n-2)
# 现在 fib 会自动缓存，避免重复计算
\`\`\`

## 小结

| 概念 | 说明 |
|---|---|
| 闭包 | 函数 + 它引用的外层变量 |
| 形成条件 | 嵌套函数 + 内层引用外层变量 + 外层函数返回内层 |
| \`nonlocal\` | 闭包内要修改外层变量时必须声明 |
| 用途 | 状态封装、计数器、缓存 |
| 陷阱 | 循环中捕获变量引用，不是值 |

## 常见疑问 Q&A

**Q：闭包和全局变量有什么区别？**  
A：闭包的状态对外不可见，只有返回的函数能访问；全局变量谁都能改。闭包更安全。

**Q：闭包会内存泄漏吗？**  
A：不会自动泄漏，但闭包会阻止外层变量被回收。如果闭包生命周期很长，外层变量也会一直存在。

**Q：什么时候用闭包，什么时候用类？**  
A：只有一个方法 + 简单状态 → 闭包；多个方法 + 复杂状态 → 类。

## 本章 demo

demo 演示闭包的计数器、记忆化、陷阱。`,
    code: `# ============================================
# 第 28 章：闭包
# ============================================

# --- 1. 基本闭包 ---
print("=== 1. 基本闭包 ===")
def make_adder(n):
    def adder(x):
        return x + n    # n 是外层的变量
    return adder

add5 = make_adder(5)
add10 = make_adder(10)
print(f"  add5(3) = {add5(3)}")
print(f"  add10(3) = {add10(3)}")

# --- 2. 闭包计数器 ---
print("\\n=== 2. 计数器 ===")
def make_counter():
    count = 0
    def counter():
        nonlocal count
        count += 1
        return count
    return counter

c = make_counter()
print(f"  c() = {c()}")
print(f"  c() = {c()}")
print(f"  c() = {c()}")

# --- 3. 闭包 vs 类 ---
print("\\n=== 3. 闭包 vs 类 ===")
# 闭包版
def make_accumulator():
    total = 0
    def add(x):
        nonlocal total
        total += x
        return total
    return add

# 类版
class Accumulator:
    def __init__(self):
        self.total = 0
    def add(self, x):
        self.total += x
        return self.total

acc_closure = make_accumulator()
acc_class = Accumulator()

acc_closure(10); acc_closure(20)
acc_class.add(10); acc_class.add(20)
print(f"  闭包版 total = {acc_closure(0)}")
print(f"  类版 total = {acc_class.total}")

# --- 4. 闭包陷阱 ---
print("\\n=== 4. 闭包陷阱 ===")
# ❌ 错误写法
funcs_bad = []
for i in range(3):
    funcs_bad.append(lambda: i)
print(f"  错误写法: {[f() for f in funcs_bad]}")    # [2, 2, 2]

# ✅ 正确写法
funcs_good = []
for i in range(3):
    funcs_good.append(lambda i=i: i)    # 默认参数冻结值
print(f"  正确写法: {[f() for f in funcs_good]}")    # [0, 1, 2]

# --- 5. 记忆化 ---
print("\\n=== 5. 记忆化 ===")
def memoize(func):
    cache = {}
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]
    return wrapper

@memoize
def fib(n):
    if n < 2:
        return n
    return fib(n-1) + fib(n-2)

print(f"  fib(10) = {fib(10)}")
print(f"  fib(20) = {fib(20)}")
print(f"  fib(30) = {fib(30)}    ← 有缓存，瞬间完成")`
  },

  // -----------------------------------------------------------
  // 第 29 章：装饰器
  // -----------------------------------------------------------
  {
    id: "py9-29",
    group: "函数：代码的复用",
    icon: "🎁",
    title: "装饰器：给函数加功能",
    content: `## 什么是装饰器

**装饰器**是一个函数，它接收一个函数，返回一个"增强版"的函数。用 \`@\` 语法糖贴在函数定义上方。

\`\`\`python
def my_decorator(func):  # 定义函数 my_decorator，参数：func
    def wrapper():  # 定义函数 wrapper
        print("调用前")  # 打印输出到屏幕
        func()  # 调用 func()
        print("调用后")  # 打印输出到屏幕
    return wrapper  # 返回 wrapper

@my_decorator  # 应用装饰器 my_decorator
def say_hello():  # 定义函数 say_hello
    print("Hello!")  # 打印输出到屏幕

say_hello()  # 调用 say_hello()
# 输出：
# 调用前
# Hello!
# 调用后
\`\`\`

\`@my_decorator\` 等价于 \`say_hello = my_decorator(say_hello)\`。装饰器在函数定义时立即执行。

## 装饰器的本质

装饰器是"函数包装函数"——在不修改原函数代码的前提下，给它加功能。

设计模式里这叫**装饰器模式**：动态地给对象添加职责，而不改变其结构。Python 用语法糖让这个过程极其简洁。

## 带参数的函数怎么装饰

如果被装饰的函数有参数，\`wrapper\` 也得能接收参数：

\`\`\`python
def my_decorator(func):  # 定义函数 my_decorator，参数：func
    def wrapper(*args, **kwargs):  # 定义函数 wrapper，参数：*args, **kwargs
        print("调用前")  # 打印输出到屏幕
        result = func(*args, **kwargs)    # 传参给原函数
        print("调用后")  # 打印输出到屏幕
        return result  # 返回 result
    return wrapper  # 返回 wrapper

@my_decorator  # 应用装饰器 my_decorator
def greet(name):  # 定义函数 greet，参数：name
    print(f"Hello, {name}!")  # 打印输出到屏幕

greet("小明")  # 调用 greet()
\`\`\`

## 保留原函数信息

装饰后函数的 \`__name__\` 和 \`__doc__\` 会变成 \`wrapper\` 的。用 \`functools.wraps\` 修复：

\`\`\`python
from functools import wraps  # 从 functools 导入 wraps

def my_decorator(func):  # 定义函数 my_decorator，参数：func
    @wraps(func)    # 保留原函数的元信息
    def wrapper(*args, **kwargs):  # 定义函数 wrapper，参数：*args, **kwargs
        """wrapper 的文档"""  # 执行操作
        return func(*args, **kwargs)  # 返回 func(*args, **kwargs)
    return wrapper  # 返回 wrapper
\`\`\`

## 带参数的装饰器

装饰器本身也能接收参数：

\`\`\`python
from functools import wraps
def repeat(n):  # 定义函数 repeat，参数：n
    def decorator(func):  # 定义函数 decorator，参数：func
        @wraps(func)  # 应用装饰器 wraps
        def wrapper(*args, **kwargs):  # 定义函数 wrapper，参数：*args, **kwargs
            for _ in range(n):  # 遍历 range(n)，取值给 _
                func(*args, **kwargs)  # 调用 func()
        return wrapper  # 返回 wrapper
    return decorator  # 返回 decorator

@repeat(3)  # 应用装饰器 repeat
def say_hello():  # 定义函数 say_hello
    print("Hello!")  # 打印输出到屏幕

say_hello()    # 打印 3 次 Hello!
\`\`\`

三层嵌套：\`repeat(3)\` 返回装饰器，装饰器再包装函数。

## 实用装饰器例子

### 计时器

\`\`\`python
import time  # 导入模块 time
from functools import wraps  # 从 functools 导入 wraps

def timer(func):  # 定义函数 timer，参数：func
    @wraps(func)  # 应用装饰器 wraps
    def wrapper(*args, **kwargs):  # 定义函数 wrapper，参数：*args, **kwargs
        start = time.time()  # 赋值变量 start
        result = func(*args, **kwargs)  # 赋值变量 result
        end = time.time()  # 赋值变量 end
        print(f"{func.__name__} 耗时 {end-start:.4f}s")  # 打印输出到屏幕
        return result  # 返回 result
    return wrapper  # 返回 wrapper

@timer  # 应用装饰器 timer
def slow_func():  # 定义函数 slow_func
    time.sleep(1)  # 调用 time.sleep()：休眠
\`\`\`

### 重试器

\`\`\`python
def retry(max_attempts=3):  # 定义函数 retry，参数：max_attempts=3
    def decorator(func):  # 定义函数 decorator，参数：func
        @wraps(func)  # 应用装饰器 wraps
        def wrapper(*args, **kwargs):  # 定义函数 wrapper，参数：*args, **kwargs
            for attempt in range(max_attempts):  # 遍历 range(max_attempts)，取值给 attempt
                try:  # 尝试执行可能出错的代码
                    return func(*args, **kwargs)  # 返回 func(*args, **kwargs)
                except Exception as e:  # 捕获异常 Exception
                    print(f"第{attempt+1}次失败: {e}")  # 打印输出到屏幕
            raise  # 重新抛出异常
        return wrapper  # 返回 wrapper
    return decorator  # 返回 decorator
\`\`\`

## 多个装饰器叠加

\`\`\`python
@decorator1  # 应用装饰器 decorator1
@decorator2  # 应用装饰器 decorator2
def func():  # 定义函数 func
    pass  # 空操作，占位符

# 等价于 func = decorator1(decorator2(func))
\`\`\`

执行顺序：从下往上包装，从上往下调用。

## 小结

| 概念 | 说明 |
|---|---|
| 装饰器 | 包装函数的函数，返回增强版 |
| \`@\` 语法 | \`@dec\` 等价于 \`func = dec(func)\` |
| \`*args, **kwargs\` | 让 wrapper 能接收任意参数 |
| \`@wraps\` | 保留原函数的名字和文档 |
| 带参装饰器 | 三层嵌套：参数 → 装饰器 → wrapper |

## 常见疑问 Q&A

**Q：装饰器在什么时候执行？**  
A：在函数**定义**时执行，不是调用时。\`@dec\` 贴上去的那一刻，\`func\` 就被替换了。

**Q：类能当装饰器吗？**  
A：能。实现 \`__call__\` 方法的类可以当装饰器用，适合需要维护状态的复杂装饰器。

**Q：装饰器和闭包什么关系？**  
A：装饰器通常用闭包实现——\`wrapper\` 闭包捕获了 \`func\`。

## 本章 demo

demo 演示基本装饰器、带参装饰器、计时器。`,
    code: `# ============================================
# 第 29 章：装饰器
# ============================================

# --- 1. 基本装饰器 ---
print("=== 1. 基本装饰器 ===")
def my_decorator(func):
    def wrapper():
        print("  调用前")
        func()
        print("  调用后")
    return wrapper

@my_decorator
def say_hello():
    print("  Hello!")

say_hello()

# --- 2. 带参数的函数 ---
print("\\n=== 2. 带参数的函数 ===")
def log_call(func):
    def wrapper(*args, **kwargs):
        print(f"  调用 {func.__name__}({args}, {kwargs})")
        result = func(*args, **kwargs)
        print(f"  返回: {result}")
        return result
    return wrapper

@log_call
def add(a, b):
    return a + b

result = add(3, 5)
print(f"  最终结果: {result}")

# --- 3. 保留函数信息 ---
print("\\n=== 3. functools.wraps ===")
from functools import wraps

def proper_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@proper_decorator
def greet(name):
    """打招呼"""
    print(f"  你好，{name}")

print(f"  函数名: {greet.__name__}")
print(f"  文档: {greet.__doc__}")

# --- 4. 带参数的装饰器 ---
print("\\n=== 4. 带参数的装饰器 ===")
def repeat(n):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(n):
                func(*args, **kwargs)
        return wrapper
    return decorator

@repeat(3)
def say_hi():
    print("  Hi!")

say_hi()

# --- 5. 计时器装饰器 ---
print("\\n=== 5. 计时器 ===")
import time

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"  {func.__name__} 耗时 {end-start:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(0.5)
    return "done"

result = slow_function()
print(f"  返回值: {result}")

# --- 6. 多个装饰器叠加 ---
print("\\n=== 6. 装饰器叠加 ===")
def bold(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return f"<b>{func(*args, **kwargs)}</b>"
    return wrapper

def italic(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return f"<i>{func(*args, **kwargs)}</i>"
    return wrapper

@bold
@italic
def greet_text(name):
    return f"Hello, {name}"

print(f"  结果: {greet_text('小明')}")
# 等价于 bold(italic(greet_text))`
  },

  // -----------------------------------------------------------
  // 第 30 章：函数综合应用
  // -----------------------------------------------------------
  {
    id: "py9-30",
    group: "函数：代码的复用",
    icon: "🎯",
    title: "函数综合应用：实战小项目",
    content: `## 本章目标

把前面学的函数知识串起来，写几个"像样"的小项目。体会函数如何组合、拆分、复用。

## 项目 1：学生成绩管理系统

需求：
- 录入学生成绩
- 查询某个学生的成绩
- 计算平均分
- 按成绩排名
- 统计各分数段人数

\`\`\`python
# 数据存储：列表套字典
students = []  # 定义列表 students

def add_student(name, score):  # 定义函数 add_student，参数：name, score
    students.append({"name": name, "score": score})  # 调用 students.append()：向列表末尾添加元素

def find_student(name):  # 定义函数 find_student，参数：name
    for s in students:  # 遍历 students，取值给 s
        if s["name"] == name:  # 如果 s["name"] == name
            return s  # 返回 s
    return None  # 返回 None

def average_score():  # 定义函数 average_score
    if not students:  # 如果 not students
        return 0  # 返回 0
    total = sum(s["score"] for s in students)  # 赋值变量 total
    return total / len(students)  # 返回 total / len(students)

def rank_students():  # 定义函数 rank_students
    return sorted(students, key=lambda s: s["score"], reverse=True)  # 返回 sorted(students, key=lambda s: s["score"], reverse=True)

def score_distribution():  # 定义函数 score_distribution
    dist = {"优秀(>=90)": 0, "良好(80-89)": 0, "及格(60-79)": 0, "不及格(<60)": 0}  # 定义字典 dist
    for s in students:  # 遍历 students，取值给 s
        score = s["score"]  # 赋值变量 score
        if score >= 90:  # 如果 score >= 90
            dist["优秀(>=90)"] += 1  # 执行操作
        elif score >= 80:  # 否则如果 score >= 80
            dist["良好(80-89)"] += 1  # 执行操作
        elif score >= 60:  # 否则如果 score >= 60
            dist["及格(60-79)"] += 1  # 执行操作
        else:  # 否则
            dist["不及格(<60)"] += 1  # 执行操作
    return dist  # 返回 dist
\`\`\`

## 项目 2：函数式数据处理

用 map/filter/reduce 处理文本：

\`\`\`python
text = "Hello World Python Programming Is Fun And Useful"  # 定义字符串 text

# 找出长度 > 4 的单词，转大写
result = list(map(  # 赋值变量 result
    str.upper,  # 执行操作
    filter(lambda w: len(w) > 4, text.split())  # 过滤
))
# ['HELLO', 'WORLD', 'PYTHON', 'PROGRAMMING', 'USEFUL']
\`\`\`

## 项目 3：装饰器实战——缓存

\`\`\`python
from functools import wraps  # 从 functools 导入 wraps

def cache(func):  # 定义函数 cache，参数：func
    memo = {}  # 定义字典 memo
    @wraps(func)  # 应用装饰器 wraps
    def wrapper(*args):  # 定义函数 wrapper，参数：*args
        if args not in memo:  # 如果 args not in memo
            memo[args] = func(*args)  # 执行操作
        return memo[args]  # 返回 memo[args]
    return wrapper  # 返回 wrapper

@cache  # 应用装饰器 cache
def expensive_calculation(n):  # 定义函数 expensive_calculation，参数：n
    """模拟耗时计算"""  # 执行操作
    import time  # 导入模块 time
    time.sleep(1)  # 调用 time.sleep()：休眠
    return n * n  # 返回 n * n

print(expensive_calculation(5))    # 第一次：等1秒
print(expensive_calculation(5))    # 第二次：瞬间
\`\`\`

## 项目 4：闭包实现配置

\`\`\`python
def make_logger(level):  # 定义函数 make_logger，参数：level
    def logger(msg):  # 定义函数 logger，参数：msg
        print(f"[{level}] {msg}")  # 打印输出到屏幕
    return logger  # 返回 logger

info = make_logger("INFO")  # 赋值变量 info
warn = make_logger("WARN")  # 赋值变量 warn
error = make_logger("ERROR")  # 赋值变量 error

info("系统启动")  # 调用 info()
warn("内存不足")  # 调用 warn()
error("崩溃了")  # 调用 error()
\`\`\`

## 设计原则

1. **单一职责**：一个函数只做一件事
2. **纯函数优先**：相同输入永远相同输出，不依赖外部状态
3. **避免副作用**：尽量少修改外部变量
4. **组合优于继承**：小函数拼成大功能

## 小结

函数是 Python 的"第一公民"——可以赋值、传参、返回、嵌套。掌握函数，就掌握了 Python 编程的核心。

后续学习方向：
- 第 31 章：类（面向对象）
- 第 32 章：模块和包
- 第 33 章：文件操作

## 本章 demo

demo 综合演示函数式编程技巧。`,
    code: `# ============================================
# 第 30 章：函数综合应用
# ============================================

# --- 1. 学生成绩管理 ---
print("=== 1. 学生成绩管理 ===")
students = []

def add_student(name, score):
    students.append({"name": name, "score": score})

def find_student(name):
    for s in students:
        if s["name"] == name:
            return s
    return None

def average_score():
    if not students:
        return 0
    return sum(s["score"] for s in students) / len(students)

def rank_students():
    return sorted(students, key=lambda s: s["score"], reverse=True)

def score_distribution():
    dist = {"优秀(>=90)": 0, "良好(80-89)": 0, "及格(60-79)": 0, "不及格(<60)": 0}
    for s in students:
        score = s["score"]
        if score >= 90:
            dist["优秀(>=90)"] += 1
        elif score >= 80:
            dist["良好(80-89)"] += 1
        elif score >= 60:
            dist["及格(60-79)"] += 1
        else:
            dist["不及格(<60)"] += 1
    return dist

# 录入数据
add_student("小明", 85)
add_student("小红", 92)
add_student("小华", 78)
add_student("小李", 95)
add_student("小张", 58)

print(f"  平均分: {average_score():.1f}")
print(f"  排名: {[(s['name'], s['score']) for s in rank_students()]}")
print(f"  分布: {score_distribution()}")
print(f"  查找小红: {find_student('小红')}")

# --- 2. 函数式数据处理 ---
print("\\n=== 2. 函数式数据处理 ===")
text = "Hello World Python Programming Is Fun And Useful"
words = text.split()

# 长度>4的单词，转大写
long_words = list(map(str.upper, filter(lambda w: len(w) > 4, words)))
print(f"  长单词大写: {long_words}")

# 所有单词长度
lengths = list(map(len, words))
print(f"  单词长度: {lengths}")

# --- 3. 缓存装饰器 ---
print("\\n=== 3. 缓存装饰器 ===")
from functools import wraps

def cache(func):
    memo = {}
    @wraps(func)
    def wrapper(*args):
        if args not in memo:
            memo[args] = func(*args)
        return memo[args]
    return wrapper

@cache
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(f"  fib(30) = {fibonacci(30)}")
print(f"  fib(40) = {fibonacci(40)}    ← 有缓存，瞬间完成")

# --- 4. 闭包实现日志 ---
print("\\n=== 4. 闭包日志 ===")
def make_logger(level):
    def logger(msg):
        print(f"  [{level}] {msg}")
    return logger

info = make_logger("INFO")
warn = make_logger("WARN")
error = make_logger("ERROR")

info("系统启动")
warn("内存不足")
error("服务崩溃")

# --- 5. 高阶函数组合 ---
print("\\n=== 5. 函数组合 ===")
def compose(f, g):
    """返回 f(g(x))"""
    return lambda x: f(g(x))

def double(x):
    return x * 2

def add_one(x):
    return x + 1

double_then_add = compose(add_one, double)
add_then_double = compose(double, add_one)

print(f"  先乘2再加1: double_then_add(5) = {double_then_add(5)}")
print(f"  先加1再乘2: add_then_double(5) = {add_then_double(5)}")`
  }
];