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
def check(x):
    if x > 0:
        return "正数"
        print("这行不会执行")   # return 后立刻退出
    return "非正数"
\`\`\`

为什么要这样设计？因为很多场景下"满足条件就立即返回，不再继续"能让代码更清晰。比如查找一个目标，找到了就返回，不必走完整个循环。

## 没 return 怎么办

函数没写 return，或者只写 \`return\` 不带值，都会返回 \`None\`：

\`\`\`python
def say_hi():
    print("hi")

result = say_hi()      # 打印 hi，result 是 None
\`\`\`

\`None\` 是 Python 的"空值"，表示"什么都没有"。如果你忘了 return，调用方拿到 None，后面用它做运算就会报错（比如 \`result + 1\` 报 TypeError）。**这是新手最常见的 bug 之一**：以为函数算出了结果，其实只是 print 了，没 return。

⚠️ **常见坑**：\`print\` 和 \`return\` 完全是两码事。\`print\` 是把东西显示在屏幕上（副作用），\`return\` 才是把结果交给调用方。好函数应该用 return 返回结果，让调用方决定要不要打印。

## 函数能调用别的函数

函数不是孤岛，它们可以互相调用：

\`\`\`python
def square(x):
    return x * x

def sum_of_squares(a, b):
    return square(a) + square(b)    # 调用 square
\`\`\`

这就像工厂流水线：A 工序做半成品，B 工序拿 A 的成品继续加工。把大问题拆成小函数，每个小函数做一件事，组合起来就能解决复杂问题——这叫"分而治之"。

## 函数 = 工具，好工具只做一件事

把函数想象成"工具箱里的工具"——\`print\` 是工具，\`len\` 是工具，你自己写的 \`add\` 也是工具。**好工具做一件事**：\`add\` 就只做加法，不要让它顺便打印东西、不要让它顺便写文件。

为什么？"做一件事"的函数能组合、能复用。一旦函数"顺便"做了别的（比如算加法时偷偷 print），调用方在不想打印的场合就用不了它。这叫"副作用污染"，是代码腐化的开始。

## 函数文档：写给未来自己看

函数体开头可以写三引号字符串，叫**文档字符串**（docstring）：

\`\`\`python
def circle_area(radius):
    """计算圆面积"""
    pi = 3.14159
    return pi * radius * radius
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
def power(base, exp):
    return base ** exp

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
def greet(name, greeting="你好"):
    print(f"{greeting}，{name}")

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
    lst.append(x)
    return lst

f(1)    # [1]
f(2)    # [1, 2]   ← 不是 [2]！默认值被共享了
\`\`\`

为什么？**默认值在函数定义时创建一次，不会每次调用重置**。第一次调用创建了空列表 \`[]\`，第二次调用还是用同一个列表，所以累积了上次的元素。

类比：你给酒店房间配了一个"默认果盘"，所有住客共用同一个果盘——上一个住客吃了苹果留下核，下一个住客看到的果盘里就有核。这显然不对。

修复方法：用 \`None\` 当占位，每次调用时再创建新列表：

\`\`\`python
def f(x, lst=None):
    if lst is None:
        lst = []
    lst.append(x)
    return lst
\`\`\`

为什么用 \`None\`？因为 \`None\` 是不可变的"哨兵值"，每次调用都是 \`None\`，进入函数后我们手动创建新列表。这是 Python 社区公认的"惯用法"。

⚠️ **判断用 \`is None\` 而不是 \`== None\`**：因为 \`==\` 可能被自定义类重载，\`is\` 比较身份更安全。

## 4. 可变参数

### \`*args\`：收集多余的位置参数

\`\`\`python
def sum_all(*args):
    print(type(args))    # <class 'tuple'>
    return sum(args)

sum_all(1, 2, 3)         # 6
sum_all(1, 2, 3, 4, 5)   # 15
\`\`\`

\`args\` 是个元组，包含所有位置参数。为什么是元组不是列表？因为函数参数不应该被函数体修改——元组不可变，更安全。

为什么需要 \`*args\`？因为有时候你不知道调用方会传几个参数。比如 \`print\` 就是用 \`*args\` 实现的，能打印任意多个值：\`print(1, 2, 3, 4, 5)\`。

### \`**kwargs\`：收集多余的关键字参数

\`\`\`python
def show(**kwargs):
    print(type(kwargs))   # <class 'dict'>
    for k, v in kwargs.items():
        print(f"  {k} = {v}")

show(name="小明", age=18)
\`\`\`

\`kwargs\` 是个字典，键是参数名，值是参数值。常用于"配置项"——调用方想传什么配置就传什么，函数体里按需取。

### 解包：把列表/字典"拆"成参数

\`\`\`python
def add(a, b, c):
    return a + b + c

nums = [1, 2, 3]
add(*nums)             # 等价于 add(1, 2, 3)

d = {"a": 1, "b": 2, "c": 3}
add(**d)               # 等价于 add(a=1, b=2, c=3)
\`\`\`

\`*\` 把列表/元组拆成位置参数，\`**\` 把字典拆成关键字参数。这在"参数已经在一个容器里"时特别有用——比如你有一个配置字典，直接 \`**config\` 传给函数。

## 参数顺序

完整顺序（缺一不可时按这个排）：

\`\`\`python
def f(位置参数, *args, 关键字参数, **kwargs):
    ...
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
def add(a, b):
    return a + b       # 把 a+b 的结果送出去

result = add(3, 5)     # result 接住返回值
\`\`\`

为什么要 return？因为函数算出的结果，调用方要用——比如存起来、再加工、显示给用户。如果没有 return，调用方拿不到结果，函数就只是"自己做了一堆事，结果自己消化了"。

类比：函数像餐厅后厨，return 像"传菜窗口"。厨师（函数）做好了菜，得通过传菜窗口（return）递给服务员（调用方）。不 return 就像厨师把菜自己吃了，服务员和客人都饿着。

## 没 return 就返回 None

\`\`\`python
def say_hi():
    print("hi")

r = say_hi()           # 打印 hi，r 是 None
\`\`\`

\`return\` 后面不写值，或者整个函数没 return，都返回 \`None\`。\`None\` 是 Python 的"空"，表示"啥也没有"。

⚠️ **新手最常踩的坑**：以为函数"算出来了"就 return 了。比如：

\`\`\`python
def add(a, b):
    print(a + b)       # 只是打印，没 return！

result = add(3, 5)     # result 是 None
result + 1             # ❌ TypeError: NoneType + int
\`\`\`

记住：**\`print\` 不是 \`return\`**。print 把结果显示在屏幕上，但调用方拿不到；return 才是把结果交给调用方。

## 返回多个值（其实是元组）

Python 看起来能"返回多个值"：

\`\`\`python
def min_max(nums):
    return min(nums), max(nums)

low, high = min_max([3, 1, 4, 1, 5])
\`\`\`

实际上 \`return min(nums), max(nums)\` 返回的是**元组** \`(min, max)\`，调用方用元组解包接收。第 12 章讲过这个。

为什么这个设计很妙？因为很多场景需要一次返回多个相关结果——比如统计要同时返回最小、最大、平均、中位数。如果没有"多返回值"，你得用列表/字典包一层，调用方再取，啰嗦。

## 提前返回（早退）

不要把所有逻辑塞一个 return。条件不满足就直接返回，代码更清晰：

\`\`\`python
def divide(a, b):
    if b == 0:
        return None       # 除数为 0，直接返回
    return a / b          # 否则才计算
\`\`\`

这叫"早退"（early return）或"卫语句"（guard clause），比层层嵌套 if 易读。对比：

\`\`\`python
# ❌ 嵌套版（丑）
def divide(a, b):
    if b != 0:
        if a > 0:
            return a / b
        else:
            return -a / b
    return None

# ✅ 早退版（清晰）
def divide(a, b):
    if b == 0:
        return None
    if a < 0:
        a = -a
    return a / b
\`\`\`

为什么早退更好？因为大脑读嵌套代码要"压栈"——记住外层条件，再读内层。早退让"主线"始终在最外层，特殊情况处理完就退出，主线一目了然。

## 返回函数

Python 函数是"一等公民"（first-class citizen），可以当返回值返回。这是后面"闭包""装饰器"的基础：

\`\`\`python
def make_multiplier(n):
    def multiply(x):
        return x * n
    return multiply       # 返回一个函数

double = make_multiplier(2)   # double 是个函数
double(5)                     # 10
\`\`\`

为什么返回函数？因为有时候你需要"定制一个函数"——比如先告诉它"乘以几"，拿到一个"乘以那个数"的函数，以后到处用。这是函数式编程的核心思想之一，第 28 章详讲。

## 返回值要不要打印

\`\`\`python
def add(a, b):
    return a + b

add(3, 5)              # 不打印，结果丢了
print(add(3, 5))       # 打印返回值
result = add(3, 5)     # 存起来
\`\`\`

三种用法都对，看需求。但函数内部的 \`print\` 是"副作用"，\`return\` 才是"输出结果"。**好函数尽量用 return，让调用方决定要不要打印**——因为同一个函数可能用在命令行工具里（要打印），也可能用在网页后端里（不能直接 print，要返回给前端）。

## 返回不同类型

Python 函数返回什么类型都行，甚至不同分支返回不同类型：

\`\`\`python
def classify(score):
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
def f():
    x = 10          # x 在函数里定义
    print(x)        # 函数里能用

f()
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
def outer():
    x = "外层"        # E
    def inner():
        x = "内层"    # L
        print(x)      # 用 L 的
    inner()
outer()               # 打印"内层"
\`\`\`

记忆口诀：**L → E → G → B**，从最近的房间往外找。先找自己屋里（L），没有就去隔壁（E），再没有去院子（G），最后去"公共图书馆"（B，内置）。

## 函数能"读"外部变量，但不能随便"改"

\`\`\`python
count = 0
def show():
    print(count)     # ✅ 能读全局的 count

def add():
    count = count + 1   # ❌ 报错！
\`\`\`

为什么改不了？因为函数里出现 \`count = ...\`，Python 默认 \`count\` 是**局部变量**，但又要在赋值前读它，矛盾就报错。

⚠️ **这是新手最常踩的坑**：以为函数内能直接改全局变量。其实 Python 的规则是"赋值即创建局部变量"，除非你显式声明。

## global：声明我要用全局变量

\`\`\`python
count = 0
def add():
    global count      # 声明 count 是全局的那个
    count += 1
\`\`\`

\`global\` 告诉 Python："我这里写的 count 不是新的局部变量，是外面那个全局的"。这样修改就作用于全局。

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
def f(a):
    print(a)          # a 是局部的
f(5)
print(a)              # ❌ 外部看不到 a
\`\`\`

参数本质上就是函数内的局部变量，只不过"调用时被赋了值"。函数结束后，参数连同函数内其他局部变量一起被回收。

## 同名遮蔽（shadowing）

\`\`\`python
x = 100
def f():
    x = 200          # 这是局部 x，不是全局的
    print(x)         # 200
f()
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
def factorial(n):
    if n == 1:           # 终止条件
        return 1
    return n * factorial(n - 1)    # 调用自己，规模更小

factorial(5)    # 120
\`\`\`

为什么需要递归？因为有些问题天然是"自相似"的——大问题和子问题结构一样，只是规模不同。比如遍历文件夹：文件夹里有文件，也有子文件夹；子文件夹里