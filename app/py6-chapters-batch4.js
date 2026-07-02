export const chapters = [
  {
    id: "py6-function-basic",
    group: "函数编程",
    icon: "📞",
    title: "函数定义与调用",
    content: `## 函数定义与调用

函数是组织好的、可重复使用的代码块，用于执行特定任务。Python 中用 \`def\` 关键字定义函数。

### 基本语法

\`\`\`python
# 用 def 关键字定义函数，括号内为参数列表，行尾冒号
def 函数名(参数1, 参数2):
    # 三引号字符串为文档字符串（可选），说明函数用途
    \\"\\"\\"文档字符串（可选）\\"\\"\\"
    # 缩进的语句构成函数体，即函数执行的操作
    函数体
    # return 返回结果；若无 return 则默认返回 None
    return 返回值
\`\`\`

### 函数的组成部分

1. **def 关键字**：声明开始定义函数
2. **函数名**：遵循变量命名规则，小写加下划线
3. **参数列表**：括号内，零个或多个，逗号分隔
4. **冒号**：参数列表后必须有
5. **函数体**：缩进的代码块
6. **docstring**：可选的文档说明，用三引号
7. **return 语句**：可选，返回值给调用者

### 调用函数

函数定义后不会自动执行，需要**调用**才会运行：

\`\`\`python
# 调用函数：写函数名并在括号内传入对应的参数值
函数名(参数值)
\`\`\`

### 注意事项

- 函数必须**先定义后调用**（顺序很重要）
- 没有 return 语句时，函数默认返回 \`None\`
- 函数名不要和内置函数重名（如 sum、list、print 等）`,
    code: `# 函数定义与调用演示
print("=== 1. 最简单的函数 ===")
# 定义一个打招呼的函数
def say_hello():
    """这个函数打印Hello"""
    print("Hello, World!")

# 调用函数
print("调用say_hello():")
say_hello()
say_hello()  # 可以多次调用

print("\\n=== 2. 带参数的函数 ===")
# 定义带名字参数的函数
def greet(name):
    """向指定名字的人打招呼"""
    print(f"你好，{name}！")

greet("小明")
greet("小红")

# 多个参数
def add(a, b):
    """计算两个数的和"""
    result = a + b
    print(f"{a} + {b} = {result}")

add(3, 5)
add(10, 20)

print("\\n=== 3. return 返回值 ===")
def multiply(a, b):
    """返回两个数的乘积"""
    return a * b  # return把结果返回给调用者

# 调用函数时可以用变量接收返回值
product = multiply(4, 5)
print(f"4 * 5 = {product}")

# 返回值可以直接参与运算
total = multiply(2, 3) + multiply(4, 5)
print(f"2*3 + 4*5 = {total}")

print("\\n=== 4. 没有return默认返回None ===")
def do_nothing():
    print("我什么也不返回")

result = do_nothing()
print(f"返回值是: {result}")
print(f"返回值类型: {type(result)}")

print("\\n=== 5. 函数可以有多个return（提前返回）===")
def get_grade(score):
    """根据分数返回等级"""
    if score >= 90:
        return "优秀"
    if score >= 80:
        return "良好"
    if score >= 60:
        return "及格"
    return "不及格"  # 最后不需要else

print(f"95分: {get_grade(95)}")
print(f"85分: {get_grade(85)}")
print(f"65分: {get_grade(65)}")
print(f"55分: {get_grade(55)}")

print("\\n=== 6. 空函数（占位用）===")
def TODO():
    pass  # pass是占位语句，什么也不做

print(f"空函数返回: {TODO()}")

print("\\n=== 7. 函数也是对象 ===")
def square(x):
    return x * x

# 可以赋值给变量
f = square
print(f"f(5) = {f(5)}")
# 可以作为参数传递（后面高阶函数会讲）`
  },
  {
    id: "py6-function-params",
    group: "函数编程",
    icon: "📥",
    title: "函数参数（位置参数/关键字参数/默认值/参数顺序）",
    content: `## 函数参数详解

Python 函数参数非常灵活，支持多种传递方式。

### 参数类型

1. **位置参数**：按位置顺序传递，必须一一对应
2. **关键字参数**：用 \`参数名=值\` 传递，顺序可以打乱
3. **默认参数**：定义时给默认值，调用时可以不传

### 参数顺序规则

定义函数时，参数必须按这个顺序写：
\`\`\`python
# 参数从左到右依次为：位置参数、默认参数、*args、**kwargs，顺序不可调换
def func(位置参数, 默认参数, *args, **kwargs):
    pass
\`\`\`

### 关键字参数的好处

- 不用记参数顺序
- 含义更清晰，可读性好

### 默认参数注意事项

- 默认参数必须放在位置参数**后面**
- **不要使用可变对象**（列表、字典）作为默认值！会在多次调用间共享

### 混合使用

- 调用时，位置参数必须在关键字参数前面
- 同一个参数不能重复传值`,
    code: `# 函数参数演示
print("=== 1. 位置参数（按顺序传递）===")
def describe_pet(name, animal_type, age):
    print(f"我有一只{animal_type}，名字叫{name}，今年{age}岁")

# 必须严格按顺序传
describe_pet("旺财", "狗", 3)
# 顺序错了会有问题！
describe_pet(3, "旺财", "狗")  # 类型语义都错了

print("\\n=== 2. 关键字参数（按名字传递）===")
# 用 参数名=值 形式，可以不按顺序
describe_pet(age=2, name="咪咪", animal_type="猫")
# 混合使用（位置参数必须在前）
describe_pet("小黄", age=1, animal_type="鸡")

print("\\n=== 3. 默认参数 ===")
def greet(name, greeting="你好"):
    """greeting有默认值，调用时可以不传"""
    print(f"{greeting}，{name}！")

greet("小明")  # 用默认值
greet("小红", "早上好")  # 覆盖默认值
greet(greeting="晚上好", name="小刚")  # 关键字形式

print("\\n=== 4. 默认参数的坑：不要用可变对象！===")
# 错误写法：默认列表在所有调用间共享！
def add_item_wrong(item, lst=[]):
    lst.append(item)
    return lst

print("第一次调用:", add_item_wrong(1))
print("第二次调用:", add_item_wrong(2))  # 结果是[1,2]不是[2]！
print("第三次调用:", add_item_wrong(3))  # [1,2,3]，一直累积！

# 正确写法：用None作为默认值
def add_item_right(item, lst=None):
    if lst is None:
        lst = []  # 每次调用新建一个列表
    lst.append(item)
    return lst

print("\\n正确写法第一次:", add_item_right(1))
print("正确写法第二次:", add_item_right(2))
print("正确写法第三次:", add_item_right(3))

print("\\n=== 5. 多个默认参数 ===")
def create_user(name, age=18, city="北京", is_vip=False):
    print(f"用户: {name}, 年龄: {age}, 城市: {city}, VIP: {is_vip}")

create_user("小明")
create_user("小红", city="上海")
create_user("小刚", 25, is_vip=True)

print("\\n=== 6. 参数传值是传引用 ===")
def modify_list(lst):
    lst.append(4)  # 修改传入的列表（可变对象）
    print("函数内:", lst)

numbers = [1, 2, 3]
print("调用前:", numbers)
modify_list(numbers)
print("调用后:", numbers)  # 原列表被改变了

def reassign_list(lst):
    lst = [10, 20]  # 重新赋值，只改变局部变量
    print("函数内:", lst)

numbers2 = [1, 2]
print("\\n调用前:", numbers2)
reassign_list(numbers2)
print("调用后:", numbers2)  # 原列表没变

print("\\n=== 7. 参数类型不强制 ===")
# Python是动态类型，函数参数可以传任意类型
def add_three(a, b, c):
    return a + b + c

print("数字相加:", add_three(1, 2, 3))
print("字符串拼接:", add_three("a", "b", "c"))
print("列表合并:", add_three([1], [2], [3]))
# 但类型不匹配会报错（注释掉）
# print(add_three(1, "a", []))  # TypeError`
  },
  {
    id: "py6-function-args-kwargs",
    group: "函数编程",
    icon: "🎒",
    title: "*args 和 **kwargs 可变参数",
    content: `## *args 和 **kwargs 可变参数

当不确定要传多少个参数时，可以使用可变参数。

### *args：可变位置参数

\`*args\` 收集多余的位置参数，打包成一个**元组**：

\`\`\`python
# *args 收集多余的位置参数，自动打包成元组
def func(*args):
    # args 是一个元组，包含所有传入的位置参数
    # 遍历元组 args 中的每个参数
    for arg in args:
        print(arg)
\`\`\`

### **kwargs：可变关键字参数

\`**kwargs\` 收集多余的关键字参数，打包成一个**字典**：

\`\`\`python
# **kwargs 收集多余的关键字参数，自动打包成字典
def func(**kwargs):
    # kwargs 是一个字典，包含所有传入的关键字参数
    # 遍历字典 kwargs 的键值对
    for key, value in kwargs.items():
        print(key, value)
\`\`\`

### 参数顺序

\`\`\`python
# 参数顺序：位置参数、默认参数、*args、**kwargs，固定不可调换
def func(位置参数, 默认参数, *args, **kwargs):
    pass
\`\`\`

### * 和 ** 也可以用于解包（调用时）

\`\`\`python
# 准备一个列表作为位置参数来源
args = [1, 2, 3]
# * 把列表解包成多个位置参数传入，等价于 func(1,2,3)
func(*args)  # 等价于 func(1, 2, 3)

# 准备一个字典作为关键字参数来源
kwargs = {"a": 1, "b": 2}
# ** 把字典解包成关键字参数传入，等价于 func(a=1,b=2)
func(**kwargs)  # 等价于 func(a=1, b=2)
\`\`\`

### 注意事项

- \`args\` 和 \`kwargs\` 只是约定俗成的名字，可以换成其他名字
- * 后面的参数必须用关键字传递（Python 3）`,
    code: `# *args 和 **kwargs 演示
print("=== 1. *args：可变位置参数 ===")
def total_sum(*numbers):
    """计算任意多个数字的和"""
    print(f"收到的参数: {numbers}, 类型: {type(numbers)}")
    total = 0
    for num in numbers:
        total += num
    return total

print(f"sum(): {total_sum()}")
print(f"sum(1): {total_sum(1)}")
print(f"sum(1,2,3): {total_sum(1, 2, 3)}")
print(f"sum(1,2,3,4,5): {total_sum(1, 2, 3, 4, 5)}")

print("\\n=== 2. 位置参数 + *args ===")
def greet_many(greeting, *names):
    """固定问候语，向多个人打招呼"""
    for name in names:
        print(f"{greeting}，{name}！")

greet_many("你好", "小明", "小红", "小刚")
greet_many("早上好", "小李")

print("\\n=== 3. **kwargs：可变关键字参数 ===")
def print_info(**info):
    """打印任意多的个人信息"""
    print(f"收到的信息: {info}, 类型: {type(info)}")
    for key, value in info.items():
        print(f"  {key}: {value}")

print_info(name="小明", age=18, city="北京")
print()
print_info(name="小红", score=95, gender="女", grade="高三")

print("\\n=== 4. 组合使用（经典签名）===")
def example(a, b, c=0, *args, **kwargs):
    print(f"a={a}, b={b}, c={c}")
    print(f"args={args}")
    print(f"kwargs={kwargs}")
    print()

example(1, 2)
example(1, 2, 3)
example(1, 2, 3, 4, 5, 6)
example(1, 2, 3, 4, 5, name="test", value=100)
example(1, 2, x=10, y=20)

print("=== 5. * 解包调用 ===")
def add(a, b, c):
    return a + b + c

nums = [1, 2, 3]
# 解包列表作为位置参数
print(f"add(*[1,2,3]) = {add(*nums)}")

# 解包字典作为关键字参数
info = {"a": 10, "b": 20, "c": 30}
print(f"add(**info) = {add(**info)}")

print("\\n=== 6. 仅限关键字参数（* 后的参数）===")
def create_person(name, age, *, city, job):
    """*后面的参数必须用关键字传递"""
    print(f"姓名:{name}, 年龄:{age}, 城市:{city}, 工作:{job}")

create_person("小明", 18, city="北京", job="学生")
create_person("小红", 20, job="工程师", city="上海")
# create_person("小刚", 25, "广州", "老师")  # TypeError! city和job必须用关键字

print("\\n=== 7. 实际应用：通用装饰器（后面讲）===")
# 转发所有参数
def logger(func):
    def wrapper(*args, **kwargs):
        print(f"调用函数 {func.__name__}")
        print(f"  位置参数: {args}")
        print(f"  关键字参数: {kwargs}")
        return func(*args, **kwargs)  # 解包转发
    return wrapper

@logger
def multiply(a, b):
    return a * b

result = multiply(4, 5)
print(f"结果: {result}")`
  },
  {
    id: "py6-function-return",
    group: "函数编程",
    icon: "📤",
    title: "返回值（return/多返回值/None/提前返回）",
    content: `## 函数返回值

\`return\` 语句用于从函数返回结果给调用者。

### return 的作用

1. 返回一个值给调用者
2. 立即结束函数执行（后面的代码不运行）

### 多返回值

Python 函数可以返回多个值（实际上是返回一个元组）：

\`\`\`python
# 定义函数，返回多个值（实际打包成元组返回）
def min_max(numbers):
    # return 用逗号分隔多个值，本质返回一个元组
    return min(numbers), max(numbers)  # 返回元组

# 用元组解包同时接收函数返回的多个值
min_val, max_val = min_max([1, 2, 3])  # 解包接收
\`\`\`

### 没有 return

如果函数没有 return 语句，或者只有 \`return\` 没有值，默认返回 \`None\`。

### 提前返回（Guard Clause）

在函数开头检查条件，不满足就提前 return，可以减少嵌套：

\`\`\`python
# 定义函数，参数为 x
def func(x):
    # 条件判断：当 x 为负数时提前返回
    if x < 0:
        # 提前退出，避免执行后续不适用的逻辑
        return None  # 提前退出
    # 正常逻辑...
\`\`\`

### 返回什么？

- 可以返回任意类型：数字、字符串、列表、字典、函数、甚至另一个函数
- 可以返回表达式的结果

### 注意事项

- return 之后的代码永远不会执行
- 一个函数可以有多个 return 语句，但只有一个会被执行`,
    code: `# 函数返回值演示
print("=== 1. return 基本用法 ===")
def square(x):
    return x * x  # 返回平方值

result = square(5)
print(f"square(5) = {result}")

# return后面的代码不执行
def test_return():
    print("return前的代码会执行")
    return 100
    print("return后的代码永远不会执行！")  # 这句是死代码

print(f"test_return() = {test_return()}")

print("\\n=== 2. 多返回值（返回元组）===")
def get_min_max_avg(numbers):
    """返回最小值、最大值、平均值"""
    return min(numbers), max(numbers), sum(numbers)/len(numbers)

# 解包接收
min_val, max_val, avg = get_min_max_avg([1, 2, 3, 4, 5])
print(f"最小: {min_val}, 最大: {max_val}, 平均: {avg}")

# 也可以用一个变量接收元组
result_tuple = get_min_max_avg([10, 20, 30])
print(f"元组形式: {result_tuple}")
print(f"第一个元素: {result_tuple[0]}")

print("\\n=== 3. None 返回 ===")
def print_hello():
    print("Hello")
    # 没有return，默认返回None

result = print_hello()
print(f"返回值: {result}, 类型: {type(result)}")

def return_none():
    return  # 只有return也返回None

print(f"return无值: {return_none()}")

# None用于表示无结果或错误
def find_index(lst, target):
    """查找target在lst中的索引，找不到返回None"""
    for i, value in enumerate(lst):
        if value == target:
            return i
    return None

idx = find_index([1, 2, 3], 4)
print(f"查找4的索引: {idx}")
if idx is None:
    print("没找到！")

print("\\n=== 4. 提前返回（减少嵌套）===")
# 反例：嵌套太多
def check_age_bad(age):
    if age is not None:
        if isinstance(age, int):
            if age >= 0:
                if age >= 18:
                    return "成年人"
                else:
                    return "未成年人"
            else:
                return "年龄不能为负"
        else:
            return "年龄必须是整数"
    else:
        return "年龄不能为空"

# 好写法：提前返回
def check_age_good(age):
    if age is None:
        return "年龄不能为空"
    if not isinstance(age, int):
        return "年龄必须是整数"
    if age < 0:
        return "年龄不能为负"
    if age >= 18:
        return "成年人"
    return "未成年人"

print("check_age_good(20):", check_age_good(20))
print("check_age_good(15):", check_age_good(15))
print("check_age_good(-1):", check_age_good(-1))
print("check_age_good('20'):", check_age_good("20"))

print("\\n=== 5. 返回复杂类型 ===")
def create_student(name, *scores):
    """返回一个学生字典"""
    return {
        "name": name,
        "scores": list(scores),
        "total": sum(scores),
        "average": sum(scores) / len(scores) if scores else 0
    }

stu = create_student("小明", 85, 90, 88)
print("学生信息:", stu)

print("\\n=== 6. 返回函数（闭包）===")
def make_adder(n):
    """返回一个给数字加n的函数"""
    def adder(x):
        return x + n
    return adder

add5 = make_adder(5)
add10 = make_adder(10)
print(f"add5(3) = {add5(3)}")
print(f"add10(3) = {add10(3)}")

print("\\n=== 7. 返回多个值的高级用法 ===")
def divide(a, b):
    """返回商和余数"""
    if b == 0:
        return None, None  # 用None表示错误
    return a // b, a % b

quotient, remainder = divide(17, 5)
print(f"17 ÷ 5 = {quotient} 余 {remainder}")
q, r = divide(10, 0)
print(f"10 ÷ 0: 商={q}, 余={r}")`
  },
  {
    id: "py6-lambda",
    group: "函数编程",
    icon: "λ",
    title: "lambda 匿名函数",
    content: `## lambda 匿名函数

\`lambda\` 用于创建小型匿名函数，即没有名字的函数，适合简单的一次性操作。

### 基本语法

\`\`\`python
# lambda 定义匿名函数，冒号前为参数，冒号后为表达式
lambda 参数1, 参数2: 表达式
# 等价于
# 上面 lambda 等价的普通函数写法
def 函数名(参数1, 参数2):
    return 表达式
\`\`\`

### lambda 的特点

1. **匿名**：没有函数名（可以赋值给变量）
2. **单行**：只能写一个表达式，不能有多行语句
3. **自动返回**：表达式的结果就是返回值，不需要写 return

### 常用场景

- \`sorted()\`、\`map()\`、\`filter()\` 的 key 函数
- 简单的回调函数
- 临时需要一个小函数的地方

### 什么时候不用 lambda

- 函数逻辑复杂（超过1行）→ 用 def
- 需要重复使用 → 用 def 命名函数
- 需要文档字符串 → 用 def

### 注意事项

- lambda  body 只能是表达式，不能是语句（赋值、循环等不行）
- 不要滥用 lambda，代码可读性更重要`,
    code: `# lambda 匿名函数演示
print("=== 1. lambda 基础 ===")
# 普通函数
def add_normal(a, b):
    return a + b

# lambda版本
add_lambda = lambda a, b: a + b

print(f"普通函数: add_normal(3,4) = {add_normal(3,4)}")
print(f"lambda: add_lambda(3,4) = {add_lambda(3,4)}")
print(f"直接调用: (lambda x: x*x)(5) = {(lambda x: x*x)(5)}")

# 无参数
get_pi = lambda: 3.14159
print(f"无参数lambda: {get_pi()}")

print("\\n=== 2. sorted() 中用 lambda 作为key ===")
students = [
    {"name": "小明", "score": 85},
    {"name": "小红", "score": 92},
    {"name": "小刚", "score": 78},
]
# 按分数排序
by_score = sorted(students, key=lambda s: s["score"])
print("按分数排序:")
for s in by_score:
    print(f"  {s['name']}: {s['score']}")

# 按名字长度排序
words = ["banana", "apple", "cherry", "date"]
by_length = sorted(words, key=lambda w: len(w))
print(f"按长度: {by_length}")

# 按绝对值排序
numbers = [-5, 3, -1, 8, -2]
by_abs = sorted(numbers, key=lambda x: abs(x))
print(f"按绝对值: {by_abs}")

print("\\n=== 3. map() 和 filter() 配合 lambda ===")
numbers = [1, 2, 3, 4, 5]
# map: 对每个元素做变换
squares = list(map(lambda x: x**2, numbers))
print(f"平方: {squares}")

# filter: 过滤元素
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(f"偶数: {evens}")

# 不过列表推导式通常更清晰
squares2 = [x**2 for x in numbers]
evens2 = [x for x in numbers if x % 2 == 0]
print(f"推导式平方: {squares2}")
print(f"推导式偶数: {evens2}")

print("\\n=== 4. lambda 条件表达式 ===")
# 可以用三元表达式
get_grade = lambda score: "优秀" if score >= 90 else "良好" if score >= 80 else "及格" if score >= 60 else "不及格"
print(f"95分: {get_grade(95)}")
print(f"85分: {get_grade(85)}")
print(f"55分: {get_grade(55)}")

print("\\n=== 5. lambda 作为返回值（简单闭包）===")
def make_multiplier(n):
    return lambda x: x * n

double = make_multiplier(2)
triple = make_multiplier(3)
print(f"double(5) = {double(5)}")
print(f"triple(5) = {triple(5)}")

print("\\n=== 6. 什么时候不应该用lambda ===")
# 不好：lambda里写复杂逻辑
bad = lambda x: (x**2 + 2*x + 1) if x > 0 else (abs(x) if x < 0 else 0)
# 应该用def
def good(x):
    if x > 0:
        return x**2 + 2*x + 1
    elif x < 0:
        return abs(x)
    else:
        return 0

print(f"bad(5)={bad(5)}, good(5)={good(5)}")
print(f"bad(-3)={bad(-3)}, good(-3)={good(-3)}")

print("\\n=== 7. lambda 常见陷阱 ===")
# 陷阱：lambda在循环中绑定变量（晚绑定）
funcs = []
for i in range(3):
    funcs.append(lambda: i)  # 所有lambda都引用同一个i
print("循环中lambda（错误）:")
for f in funcs:
    print(f"  {f()}")  # 都是2！

# 解决：用默认参数早绑定
funcs_fixed = []
for i in range(3):
    funcs_fixed.append(lambda i=i: i)  # 默认参数在定义时求值
print("循环中lambda（修复）:")
for f in funcs_fixed:
    print(f"  {f()}")  # 0,1,2`
  },
  {
    id: "py6-scope",
    group: "函数编程",
    icon: "🌍",
    title: "作用域与 LEGB 规则（Local/Enclosing/Global/Built-in）",
    content: `## 作用域与 LEGB 规则

作用域决定了变量在哪里可以被访问。Python 使用 LEGB 规则查找变量。

### LEGB 含义

- **L (Local)**：函数内部的局部作用域
- **E (Enclosing)**：嵌套函数中，外层函数的作用域（闭包）
- **G (Global)**：模块级别的全局作用域
- **B (Built-in)**：Python 内置作用域（如 len、print、int 等）

### 查找顺序

Python 查找变量时，按 L → E → G → B 的顺序查找，找到就停止。

### 关键概念

- **局部变量**：在函数内赋值的变量，默认是局部的
- **全局变量**：在函数外定义的变量
- **在函数内读取全局变量**：可以直接读取（不需要global）
- **在函数内修改全局变量**：必须用 \`global\` 声明

### 注意事项

- 函数内如果给变量赋值过，Python 就认为它是局部变量，即使外面有同名全局变量
- 作用域是**静态**的，由代码在文本中的位置决定（词法作用域）
- 不要滥用全局变量，尽量通过参数传递和返回值来共享数据`,
    code: `# 作用域与LEGB规则演示
print("=== 1. 局部作用域 vs 全局作用域 ===")
x = 100  # 全局变量

def func():
    x = 200  # 局部变量（和全局x是两个不同的变量！）
    print(f"函数内x = {x}")

print(f"调用前全局x = {x}")
func()
print(f"调用后全局x = {x}")  # 全局x没有变！

print("\\n=== 2. 函数内读取全局变量（可以直接读）===")
name = "全局名字"
def read_global():
    print(f"读取全局name: {name}")  # 可以直接读取，不需要声明

read_global()

print("\\n=== 3. LEGB查找顺序 ===")
# Built-in示例：len是内置函数
lst = [1, 2, 3]
print(f"len(lst) = {len(lst)}")  # 找到Built-in的len

# 如果我们定义了同名变量，会覆盖内置
len = 100  # 这不好！但演示用
print(f"现在len是: {len}")  # 找到Global的len
del len  # 删掉，恢复内置

def outer():
    x = "outer"  # Enclosing
    def inner():
        x = "inner"  # Local
        print(f"inner中x = {x}")
    inner()
    print(f"outer中x = {x}")

x = "global"  # Global
outer()
print(f"global中x = {x}")

print("\\n=== 4. 常见错误：UnboundLocalError ===")
# 下面这段代码会报错，用try/except捕获演示错误原因
count = 10
def bad_increment():
    # 如果函数内有赋值语句(count = ...)，Python就认为count是局部变量
    # 但赋值时count还没有值，就会报UnboundLocalError
    count = count + 1  # 这行是错的！count是局部变量但还没赋值
try:
    bad_increment()
except UnboundLocalError as e:
    print(f"捕获到错误: {e}")
    print("原因: 函数内对count赋值导致Python认为count是局部变量，但还没赋值就使用了")
    print("解决: 如果要修改全局变量，用global声明；如果要创建局部变量，先给初始值")

# 正确写法1：用global
count2 = 10
def good_increment1():
    global count2
    count2 += 1
good_increment1()
print(f"global方法后count2 = {count2}")

# 正确写法2：用参数和返回值（推荐！）
def good_increment2(c):
    return c + 1
result = good_increment2(10)
print(f"参数返回值方法结果 = {result}")

print("\\n=== 5. 嵌套函数的Enclosing作用域 ===")
def outer_func():
    message = "Hello"  # Enclosing变量
    def inner_func():
        # Enclosing的变量可以读取
        print(f"inner读取: {message}")
    inner_func()

outer_func()

print("\\n=== 6. 作用域隔离演示 ===")
def func1():
    a = 10
    print(f"func1中a = {a}")

def func2():
    a = 20  # 和func1的a没关系
    print(f"func2中a = {a}")

func1()
func2()

print("\\n=== 7. 函数作为作用域 ===")
# 每次调用函数创建新的局部作用域
def counter():
    count = 0  # 每次调用都是新的count
    count += 1
    print(f"count = {count}")

counter()
counter()
counter()  # 三次都是1，因为count不保留

# 循环变量在全局作用域
for i in range(3):
    print(f"循环中i = {i}")
print(f"循环后全局i = {i}")  # i泄漏到全局了

print("\\n=== 8. built-in作用域 ===")
# 可以通过builtins模块访问所有内置
import builtins
print("内置函数示例:")
print(f"  builtins.len = {builtins.len}")
print(f"  builtins.print = {builtins.print}")
# 不要覆盖内置名！比如不要叫list、dict、sum、id、type等`
  },
  {
    id: "py6-global-nonlocal",
    group: "函数编程",
    icon: "🌐",
    title: "global 和 nonlocal 关键字",
    content: `## global 和 nonlocal 关键字

这两个关键字用于在函数内部修改外部作用域的变量。

### global 关键字

在函数内修改**全局变量**时，需要用 \`global\` 声明：

\`\`\`python
# 在函数外定义全局变量 count
count = 0
# 定义函数 increment
def increment():
    # global 声明下方修改的是全局变量 count 而非新建局部变量
    global count  # 声明count是全局变量
    # 对全局变量 count 自增 1
    count += 1
\`\`\`

### nonlocal 关键字

在嵌套函数内修改**外层函数（Enclosing）**的变量时，用 \`nonlocal\`：

\`\`\`python
# 外层函数 outer
def outer():
    # 外层函数的局部变量 count
    count = 0
    # 内层函数 inner
    def inner():
        # nonlocal 声明下方修改的是外层函数的变量 count
        nonlocal count  # 声明count是外层函数的
        # 对外层变量 count 自增 1
        count += 1
    # 调用内层函数，触发修改
    inner()
\`\`\`

### 对比总结

| 关键字 | 修改的是 | 使用场景 |
|--------|----------|----------|
| \`global\` | 全局变量 | 函数内修改模块级变量 |
| \`nonlocal\` | 外层函数变量 | 嵌套函数内修改外层变量 |
| 都不用 | 局部变量 | 默认情况 |

### 注意事项

- **尽量少用**！滥用 global 会让代码难以维护
- 更好的方式是使用类、闭包或者参数传递+返回值
- \`nonlocal\` 不能用于全局变量
- 读取外部变量不需要声明，只有**修改/赋值**时才需要`,
    code: `# global 和 nonlocal 演示
print("=== 1. global 关键字 ===")
count = 0  # 全局变量

def add_count():
    global count  # 声明要使用全局的count
    count += 1
    print(f"count = {count}")

print(f"初始count = {count}")
add_count()
add_count()
add_count()
print(f"最后count = {count}")

# 不写global会怎样？
# def bad_increment():
#     count += 1  # UnboundLocalError!
# bad_increment()

print("\\n=== 2. 多个全局变量 ===")
a = 1
b = 2
def swap():
    global a, b  # 可以一次声明多个
    a, b = b, a

print(f"交换前: a={a}, b={b}")
swap()
print(f"交换后: a={a}, b={b}")

print("\\n=== 3. global 常见用法：计数器、配置 ===")
# 简单的全局计数器
_score = 0
def add_score(points):
    global _score
    _score += points
def get_score():
    return _score
def reset_score():
    global _score
    _score = 0

add_score(10)
add_score(20)
print(f"当前分数: {get_score()}")
reset_score()
print(f"重置后: {get_score()}")

print("\\n=== 4. nonlocal 关键字 ===")
def make_counter():
    count = 0  # 外层函数变量
    def counter():
        nonlocal count  # 声明使用外层的count
        count += 1
        return count
    return counter

cnt = make_counter()
print(f"第一次: {cnt()}")
print(f"第二次: {cnt()}")
print(f"第三次: {cnt()}")
# count变量在外层函数里，全局访问不到
# print(count)  # NameError!

print("\\n=== 5. nonlocal 多层嵌套 ===")
def outer():
    x = "outer"
    def middle():
        x = "middle"
        def inner():
            nonlocal x  # 指的是middle的x，不是outer的
            x = "inner修改了middle的x"
        inner()
        print(f"middle中x = {x}")
    middle()
    print(f"outer中x = {x}")

outer()

print("\\n=== 6. 对比：不用关键字的替代方案（更好）===")
# 用类代替全局变量
class Counter:
    def __init__(self):
        self.count = 0
    def increment(self):
        self.count += 1
        return self.count

c = Counter()
print(f"类实现计数器: {c.increment()}, {c.increment()}, {c.increment()}")

# 用闭包的可变对象（不用nonlocal）
def make_counter2():
    d = {"count": 0}  # 字典是可变的，修改内容不算重新赋值
    def counter():
        d["count"] += 1
        return d["count"]
    return counter

cnt2 = make_counter2()
print(f"字典方式: {cnt2()}, {cnt2()}, {cnt2()}")

print("\\n=== 7. global vs nonlocal vs 局部 ===")
x = "global"
def test():
    x = "enclosing"
    def inner_local():
        x = "local"
        print(f"local x = {x}")
    def inner_nonlocal():
        nonlocal x
        x = "nonlocal修改"
        print(f"nonlocal x = {x}")
    def inner_global():
        global x
        x = "global修改"
        print(f"global x = {x}")
    
    inner_local()
    print(f"调用inner_local后，外层x = {x}")
    
    inner_nonlocal()
    print(f"调用inner_nonlocal后，外层x = {x}")
    
    inner_global()
    print(f"调用inner_global后，外层x = {x}")

test()
print(f"最终全局x = {x}")`
  },
  {
    id: "py6-closure",
    group: "函数编程",
    icon: "🔒",
    title: "闭包（概念/原理/应用场景）",
    content: `## 闭包（Closure）

闭包是指：**内部函数引用了外部函数的变量，并且外部函数返回了内部函数**。即使外部函数执行结束，这些变量仍然被保留。

### 闭包的构成条件

1. 有嵌套函数（函数里面定义函数）
2. 内部函数引用了外部函数的变量
3. 外部函数返回内部函数

### 闭包的作用

- **数据持久化**：外部函数的变量不会被回收，被内部函数记住
- **数据封装**：变量对外界是隐藏的，只能通过内部函数访问
- **工厂函数**：生成定制化的函数

### 常见应用

1. 计数器、累加器
2. 配置函数（预设参数）
3. 装饰器的基础（后面会讲）
4. 回调函数、事件处理

### 注意事项

- 闭包引用的是变量本身，不是变量的值（晚绑定问题）
- 闭包会持有外部变量的引用，可能导致内存泄漏（一般不用在意）
- 可以用 \`__closure__\` 属性查看闭包引用的变量`,
    code: `# 闭包演示
print("=== 1. 最简单的闭包 ===")
def outer(message):
    # message是外部函数的变量
    def inner():
        # 内部函数引用了外部的message
        print(f"消息: {message}")
    return inner  # 返回内部函数

# outer执行完了，但message被记住了
say_hello = outer("Hello")
say_goodbye = outer("Goodbye")
say_hello()
say_goodbye()

# 查看闭包
print(f"say_hello的闭包内容: {say_hello.__closure__}")
print(f"闭包保存的变量: {say_hello.__closure__[0].cell_contents}")

print("\\n=== 2. 闭包做计数器 ===")
def make_counter(start=0):
    count = start  # 这个变量会被保留
    def increment():
        nonlocal count
        count += 1
        return count
    return increment

counter1 = make_counter()
counter2 = make_counter(100)  # 从100开始
print(f"counter1: {counter1()}, {counter1()}, {counter1()}")
print(f"counter2: {counter2()}, {counter2()}")
# 两个计数器互不干扰！
print(f"counter1继续: {counter1()}")

print("\\n=== 3. 闭包做配置工厂 ===")
def make_power(n):
    """返回一个计算x的n次方的函数"""
    def power(x):
        return x ** n
    return power

square = make_power(2)
cube = make_power(3)
sqrt = make_power(0.5)

print(f"5^2 = {square(5)}")
print(f"5^3 = {cube(5)}")
print(f"√25 = {sqrt(25)}")

print("\\n=== 4. 闭包做乘法器 ===")
def make_multiplier(factor):
    def multiply(x):
        return x * factor
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)
times10 = make_multiplier(10)

print(f"double(7) = {double(7)}")
print(f"triple(7) = {triple(7)}")
print(f"times10(7) = {times10(7)}")

print("\\n=== 5. 闭包实现数据封装（私有变量）===")
def create_bank_account(initial_balance):
    balance = initial_balance  # 这个变量外部无法直接访问！
    def deposit(amount):
        nonlocal balance
        if amount > 0:
            balance += amount
        return balance
    def withdraw(amount):
        nonlocal balance
        if 0 < amount <= balance:
            balance -= amount
        return balance
    def get_balance():
        return balance
    return deposit, withdraw, get_balance

deposit, withdraw, get_balance = create_bank_account(100)
print(f"初始余额: {get_balance()}")
print(f"存50后: {deposit(50)}")
print(f"取30后: {withdraw(30)}")
print(f"取200后（余额不足）: {withdraw(200)}")
# print(balance)  # NameError! 外部访问不到balance

print("\\n=== 6. 闭包陷阱：晚绑定 ===")
# 错误：所有函数都引用同一个i，最后i=4
def create_functions_bad():
    funcs = []
    for i in range(5):
        funcs.append(lambda: i*i)
    return funcs

funcs_bad = create_functions_bad()
print("错误版（全是16）:")
for f in funcs_bad:
    print(f"  {f()}", end=" ")
print()

# 修复1：用默认参数（早绑定）
def create_functions_good1():
    funcs = []
    for i in range(5):
        funcs.append(lambda i=i: i*i)  # 默认参数在定义时求值
    return funcs

funcs_good1 = create_functions_good1()
print("修复版1（默认参数）:")
for f in funcs_good1:
    print(f"  {f()}", end=" ")
print()

# 修复2：用工厂函数
def make_square(i):
    return lambda: i*i

def create_functions_good2():
    funcs = []
    for i in range(5):
        funcs.append(make_square(i))
    return funcs

funcs_good2 = create_functions_good2()
print("修复版2（工厂函数）:")
for f in funcs_good2:
    print(f"  {f()}", end=" ")
print()

print("\\n=== 7. 闭包 vs 类 ===")
# 闭包实现
def closure_adder(n):
    def add(x):
        return x + n
    return add

# 类实现
class ClassAdder:
    def __init__(self, n):
        self.n = n
    def add(self, x):
        return x + self.n

c_adder = closure_adder(5)
o_adder = ClassAdder(5)
print(f"闭包: {c_adder(10)}")
print(f"类: {o_adder.add(10)}")
print("简单场景闭包更简洁，复杂场景用类")`
  },
  {
    id: "py6-decorator-basic",
    group: "函数编程",
    icon: "🎀",
    title: "装饰器基础（函数装饰器原理/语法糖@）",
    content: `## 装饰器基础

装饰器（Decorator）是 Python 的一种语法糖，用于**在不修改原函数代码的情况下，给函数增加新功能**。本质是一个接收函数作为参数、返回新函数的高阶函数。

### 装饰器原理

\`\`\`python
# 装饰器：接收被装饰函数 func 作为参数
def decorator(func):
    # 定义包装函数 wrapper，用于扩展原函数行为
    def wrapper():
        # 调用前的操作
        # 调用原函数
        func()
        # 调用后的操作
    # 返回包装函数，用它替换原函数
    return wrapper

# @ 语法糖，等价于 func = decorator(func)
@decorator  # 等价于 func = decorator(func)
def func():
    pass
\`\`\`

### @ 语法糖

\`@decorator\` 写在函数定义前，等价于执行了：
\`func = decorator(func)\`

### 为什么用装饰器

- **开闭原则**：对扩展开放，对修改封闭
- **代码复用**：日志、计时、权限校验等横切关注点
- **不侵入**：不修改原函数，原函数不知道被装饰了

### 常见应用

- 日志记录
- 性能计时
- 权限校验
- 参数验证
- 缓存

### 注意事项

- 基础装饰器会丢失原函数的元信息（\`__name__\`、\`__doc__\`等）→ 用 \`functools.wraps\` 解决（下节讲）
- 被装饰后的函数其实是 wrapper 函数`,
    code: `# 装饰器基础演示
import time

print("=== 1. 装饰器原理：函数替换 ===")
def my_decorator(func):
    print(f"my_decorator被调用了，传入的是: {func.__name__}")
    def wrapper():
        print("  调用func之前...")
        func()
        print("  调用func之后...")
    return wrapper

def say_hello():
    print("  Hello!")

# 手动装饰（理解原理）
print("手动装饰:")
decorated_hello = my_decorator(say_hello)
decorated_hello()
print()

print("=== 2. @语法糖 ===")
@my_decorator
def say_hi():
    print("  Hi!")

# 等价于 say_hi = my_decorator(say_hi)
print("调用被@装饰的函数:")
say_hi()

print("\\n=== 3. 实用装饰器：计时 ===")
def timer(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)  # 转发参数
        end = time.time()
        print(f"{func.__name__} 执行耗时: {end - start:.6f}秒")
        return result
    return wrapper

@timer
def slow_function(seconds):
    time.sleep(seconds)
    return "完成"

print("调用slow_function(0.1):")
result = slow_function(0.1)
print(f"返回值: {result}")

print("\\n=== 4. 实用装饰器：日志 ===")
def logger(func):
    def wrapper(*args, **kwargs):
        print(f"[LOG] 调用 {func.__name__}")
        print(f"[LOG] 参数: args={args}, kwargs={kwargs}")
        result = func(*args, **kwargs)
        print(f"[LOG] 返回: {result}")
        return result
    return wrapper

@logger
def add(a, b):
    return a + b

print("调用add(3,5):")
add(3, 5)

print("\\n=== 5. 带参数的原函数 ===")
# 用*args和**kwargs转发所有参数
def universal_decorator(func):
    def wrapper(*args, **kwargs):
        print(f"=== 开始执行 {func.__name__} ===")
        result = func(*args, **kwargs)
        print(f"=== 结束执行 {func.__name__} ===")
        return result
    return wrapper

@universal_decorator
def greet(name, greeting="你好"):
    return f"{greeting}, {name}!"

print(greet("小明"))
print(greet("小红", greeting="早上好"))

print("\\n=== 6. 装饰器执行时机 ===")
# 装饰器在函数定义时就执行了（不是调用时！）
print("定义阶段装饰器就运行了:")
def decorator_with_print(func):
    print(f"  装饰器正在装饰 {func.__name__}")  # 定义时就打印
    def wrapper():
        return func()
    return wrapper

@decorator_with_print
def func1():
    pass

@decorator_with_print
def func2():
    pass

print("函数定义完了，装饰器已经执行过了")
print("现在才开始调用函数:")
func1()
func2()

print("\\n=== 7. 装饰器可以叠加 ===")
def bold(func):
    def wrapper():
        return "<b>" + func() + "</b>"
    return wrapper

def italic(func):
    def wrapper():
        return "<i>" + func() + "</i>"
    return wrapper

@bold
@italic
def text():
    return "Hello"

# 等价于 text = bold(italic(text))
print(f"叠加装饰器结果: {text()}")

print("\\n=== 8. 注意：装饰器替换了函数 ===")
@timer
def original_func():
    """这是原函数的文档"""
    pass

print(f"函数名变成了: {original_func.__name__}")  # wrapper，不是original_func
print(f"文档字符串: {original_func.__doc__}")  # None，原文档丢了
print("（下节学functools.wraps解决这个问题）")`
  },
  {
    id: "py6-decorator-advanced",
    group: "函数编程",
    icon: "🎗️",
    title: "装饰器进阶（带参数的装饰器/functools.wraps/多个装饰器叠加）",
    content: `## 装饰器进阶

这一节学习更高级的装饰器用法。

### functools.wraps

装饰器会用 wrapper 替换原函数，导致原函数的元信息（\`__name__\`、\`__doc__\`）丢失。用 \`@functools.wraps(func)\` 装饰 wrapper，可以保留这些信息。

### 带参数的装饰器

要让装饰器接收参数，需要再加一层嵌套：

\`\`\`python
# 外层函数接收装饰器参数 n
def repeat(n):  # 接收装饰器参数
    # 中层是真正的装饰器，接收被装饰函数
    def decorator(func):  # 真正的装饰器
        # 内层包装函数
        def wrapper():  # 包装函数
            # 重复执行 n 次原函数
            for _ in range(n):
                func()
        # 返回包装函数
        return wrapper
    # 返回真正的装饰器
    return decorator

# 带参装饰器，等价于 hello = repeat(3)(hello)
@repeat(3)  # 等价于 func = repeat(3)(func)
# 定义被装饰函数 hello
def hello():
    # 打印问候语
    print("Hi")
\`\`\`

### 装饰器类

也可以用类实现装饰器，需要实现 \`__call__\` 方法。

### 多个装饰器叠加顺序

\`\`\`python
# 多个装饰器从下往上依次应用
@dec1
# dec2 先包装 f，再被 dec1 包装
@dec2
# 被装饰函数
def f(): pass
# 等价于 f = dec1(dec2(f))
# 执行顺序：dec1的wrapper调用dec2的wrapper，dec2的wrapper调用f
\`\`\`

### 常见内置装饰器

- \`@property\`：类的属性
- \`@staticmethod\`：静态方法
- \`@classmethod\`：类方法`,
    code: `# 装饰器进阶演示
import functools
import time

print("=== 1. functools.wraps 保留元信息 ===")
def timer_bad(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"{func.__name__} 耗时: {time.time()-start:.6f}秒")
        return result
    return wrapper

def timer_good(func):
    @functools.wraps(func)  # 把func的元信息复制到wrapper上
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"{func.__name__} 耗时: {time.time()-start:.6f}秒")
        return result
    return wrapper

@timer_bad
def bad_func():
    """坏文档"""
    pass

@timer_good
def good_func():
    """好文档"""
    pass

print(f"bad_func.__name__ = {bad_func.__name__}")  # wrapper
print(f"bad_func.__doc__ = {bad_func.__doc__}")  # None
print(f"good_func.__name__ = {good_func.__name__}")  # good_func
print(f"good_func.__doc__ = {good_func.__doc__}")  # 好文档

print("\\n=== 2. 带参数的装饰器 ===")
def repeat(n):
    """重复执行n次的装饰器"""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            results = []
            for _ in range(n):
                results.append(func(*args, **kwargs))
            return results
        return wrapper
    return decorator

@repeat(3)
def say_hello(name):
    print(f"  Hello, {name}!")
    return name

print("调用@repeat(3)装饰的函数:")
results = say_hello("小明")
print(f"返回值列表: {results}")

@repeat(2)
def greet():
    return "Hi"

print(f"repeat(2)结果: {greet()}")

print("\\n=== 3. 带参数的实用装饰器：日志级别 ===")
def log(level="INFO"):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            print(f"[{level}] 调用 {func.__name__}")
            return func(*args, **kwargs)
        return wrapper
    return decorator

@log(level="DEBUG")
def debug_func():
    print("调试函数")

@log()  # 用默认参数
def info_func():
    print("普通函数")

debug_func()
info_func()

print("\\n=== 4. 可选参数的装饰器（两种调用方式都支持）===")
def auto_log(func=None, *, level="INFO"):
    # 处理两种情况：@auto_log 和 @auto_log(level="DEBUG")
    if func is None:
        return lambda f: auto_log(f, level=level)
    
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"[{level}] {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

@auto_log
def f1():
    print("f1")

@auto_log(level="ERROR")
def f2():
    print("f2")

f1()
f2()

print("\\n=== 5. 多个装饰器叠加顺序 ===")
def make_bold(func):
    @functools.wraps(func)
    def wrapper():
        return "<b>" + func() + "</b>"
    return wrapper

def make_italic(func):
    @functools.wraps(func)
    def wrapper():
        return "<i>" + func() + "</i>"
    return wrapper

def make_underline(func):
    @functools.wraps(func)
    def wrapper():
        return "<u>" + func() + "</u>"
    return wrapper

@make_bold
@make_italic
@make_underline
def hello():
    return "Hello"

# 执行顺序：bold(italic(underline(hello)))
# 从下往上装饰，从上往下执行
print(f"叠加结果: {hello()}")
print("顺序：最靠近def的@make_underline先装饰（最内层）")
print("     @make_bold最后装饰（最外层）")

print("\\n=== 6. 类装饰器 ===")
class CountCalls:
    def __init__(self, func):
        functools.update_wrapper(self, func)
        self.func = func
        self.count = 0
    
    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"第{self.count}次调用 {self.func.__name__}")
        return self.func(*args, **kwargs)

@CountCalls
def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)

print("计算fib(5):")
result = fib(5)
print(f"结果: {result}, 总调用次数: {fib.count}")

print("\\n=== 7. 装饰器带返回值 ===")
def cached(func):
    """简单的缓存装饰器"""
    cache = {}
    @functools.wraps(func)
    def wrapper(*args):
        if args in cache:
            print(f"  缓存命中: {args}")
            return cache[args]
        result = func(*args)
        cache[args] = result
        return result
    return wrapper

@cached
def expensive_calc(n):
    print(f"  计算 {n}...")
    time.sleep(0.01)
    return n * n

print("第一次计算5:", expensive_calc(5))
print("第二次计算5:", expensive_calc(5))
print("第一次计算10:", expensive_calc(10))
print("第二次计算10:", expensive_calc(10))`
  },
  {
    id: "py6-recursion",
    group: "函数编程",
    icon: "🔄",
    title: "递归（原理/阶乘/斐波那契/递归深度限制）",
    content: `## 递归

递归是指**函数调用自身**的编程技巧。递归可以把复杂问题分解成相似的子问题。

### 递归三要素

1. **基准情形（Base Case）**：什么时候停止递归，直接返回结果
2. **递归情形**：把问题分解，调用自身解决更小的问题
3. **收敛**：每次递归都要向基准情形靠近，不能无限递归

### 经典例子

1. **阶乘**：
   - 0! = 1（基准）
   - n! = n × (n-1)!（递归）

2. **斐波那契数列**：
   - F(0)=0, F(1)=1（基准）
   - F(n) = F(n-1) + F(n-2)（递归）

### 递归深度限制

Python 默认递归深度约 1000 层，超出会抛出 \`RecursionError\`。可以用 \`sys.setrecursionlimit()\` 修改，但不建议设置太大。

### 递归 vs 循环

- 递归代码简洁优雅，但可能有重复计算和栈溢出问题
- 循环效率更高，但代码可能复杂
- 尾递归可以优化，但 Python 不做尾递归优化

### 注意事项

- 必须有基准情形，否则无限递归导致栈溢出
- 递归深度不要太大（一般 < 900 安全）
- 像斐波那契这种递归会有大量重复计算，可以用缓存优化`,
    code: `# 递归演示
import sys
import time

print("=== 1. 递归求阶乘 ===")
def factorial(n):
    """计算n! = n * (n-1) * ... * 1"""
    if n == 0 or n == 1:  # 基准情形
        return 1
    return n * factorial(n - 1)  # 递归调用

for i in range(10):
    print(f"{i}! = {factorial(i)}")

print("\\n=== 2. 递归求和 ===")
def sum_recursive(n):
    """计算1+2+...+n"""
    if n == 0:
        return 0
    return n + sum_recursive(n - 1)

print(f"sum(100) = {sum_recursive(100)}")
print(f"验证: {100*101//2}")

print("\\n=== 3. 斐波那契数列（简单版但慢）===")
def fib_bad(n):
    """低效版本：大量重复计算"""
    if n <= 1:
        return n
    return fib_bad(n-1) + fib_bad(n-2)

start = time.time()
print(f"fib(20) = {fib_bad(20)}")
print(f"耗时: {time.time()-start:.4f}秒")
# fib(40)就会很慢，不建议尝试

print("\\n=== 4. 斐波那契优化：尾递归/循环 ===")
def fib_good(n):
    """迭代版本，O(n)时间O(1)空间"""
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(n-1):
        a, b = b, a + b
    return b

print(f"fib_good(10) = {fib_good(10)}")
start = time.time()
print(f"fib_good(100) = {fib_good(100)}")
print(f"耗时: {time.time()-start:.6f}秒")

print("\\n=== 5. 递归打印列表 ===")
def print_list(lst, index=0):
    if index == len(lst):  # 基准：到末尾了
        return
    print(f"  [{index}] = {lst[index]}")
    print_list(lst, index + 1)  # 打印下一个

print("递归遍历:")
print_list([10, 20, 30, 40])

print("\\n=== 6. 递归反转字符串 ===")
def reverse_str(s):
    if len(s) <= 1:  # 基准：空串或单个字符
        return s
    return reverse_str(s[1:]) + s[0]  # 首字符放最后

print(f"'hello' 反转: '{reverse_str('hello')}'")
print(f"'Python' 反转: '{reverse_str('Python')}'")

print("\\n=== 7. 递归深度限制 ===")
print(f"Python默认递归深度限制: {sys.getrecursionlimit()}")

def infinite_recursion(n):
    print(f"  第{n}层")
    if n >= 5:  # 我们手动限制，演示5层
        print("  停止！")
        return
    infinite_recursion(n + 1)

print("递归5层:")
infinite_recursion(1)

# 验证深度限制
def deep_recursion(n):
    if n == 0:
        return 0
    return 1 + deep_recursion(n - 1)

# 测试能递归多少层
max_test = 900
try:
    result = deep_recursion(max_test)
    print(f"递归{max_test}层成功")
except RecursionError:
    print(f"递归{max_test}层超出限制")

print("\\n=== 8. 经典递归：汉诺塔 ===")
def hanoi(n, source, target, auxiliary, moves):
    """把n个盘子从source移到target，借助auxiliary"""
    if n == 1:
        moves.append(f"{source} → {target}")
        return
    hanoi(n-1, source, auxiliary, target, moves)
    moves.append(f"{source} → {target}")
    hanoi(n-1, auxiliary, target, source, moves)

moves = []
hanoi(3, 'A', 'C', 'B', moves)
print("3层汉诺塔步骤:")
for i, move in enumerate(moves, 1):
    print(f"  {i}. {move}")
print(f"共{len(moves)}步（2^n-1 = {2**3-1}）")

print("\\n=== 9. 递归调试小技巧 ===")
def factorial_debug(n, depth=0):
    indent = "  " * depth
    print(f"{indent}factorial({n}) 调用")
    if n <= 1:
        print(f"{indent}-> 返回1")
        return 1
    result = n * factorial_debug(n - 1, depth + 1)
    print(f"{indent}-> factorial({n}) = {result}")
    return result

print("factorial(4) 调用过程:")
factorial_debug(4)`
  },
  {
    id: "py6-generator",
    group: "函数编程",
    icon: "⚡",
    title: "生成器（yield/生成器表达式/惰性计算/节省内存）",
    content: `## 生成器（Generator）

生成器是一种特殊的迭代器，用 \`yield\` 关键字返回值，**惰性计算**，一次只生成一个值，节省大量内存。

### yield vs return

- \`return\`：返回值，函数结束
- \`yield\`：返回值，暂停执行，下次调用从暂停处继续

### 创建生成器

1. **生成器函数**：函数体包含 \`yield\`
2. **生成器表达式**：圆括号的推导式 \`(x for x in range(10))\`

### 生成器的特点

- **惰性计算**：不一次性生成所有值，用到时才算
- **节省内存**：处理大数据时内存占用极小
- **只能遍历一次**：遍历完就空了
- **迭代器协议**：可以用 \`next()\` 逐个获取值

### 常用场景

- 处理大文件/大数据流
- 生成无限序列（自然数、斐波那契等）
- 管道式数据处理
- 协程基础

### 注意事项

- 生成器只能迭代一次，第二次遍历是空的
- 生成器不支持索引/切片/长度
- \`yield\` 暂停后，局部变量状态会保留`,
    code: `# 生成器演示
import sys

print("=== 1. 第一个生成器函数 ===")
def simple_generator():
    print("  生成器开始执行")
    yield 1
    print("  yield 1之后继续")
    yield 2
    print("  yield 2之后继续")
    yield 3
    print("  生成器结束")

gen = simple_generator()
print("创建生成器，但函数体还没执行")
print(f"next(gen) = {next(gen)}")
print(f"next(gen) = {next(gen)}")
print(f"next(gen) = {next(gen)}")
try:
    next(gen)
except StopIteration:
    print("next(gen) 抛出 StopIteration（没有更多值了）")

print("\\n=== 2. 生成器 vs 列表：内存对比 ===")
# 列表：一次性把所有数存在内存里
def create_list(n):
    return [i for i in range(n)]

# 生成器：需要时才计算
def create_generator(n):
    for i in range(n):
        yield i

n = 1000000
list_data = create_list(n)
gen_data = create_generator(n)
print(f"1M列表占用内存: {sys.getsizeof(list_data)} 字节（不包括元素本身）")
print(f"1M生成器占用内存: {sys.getsizeof(gen_data)} 字节")
print("生成器永远只用这么点内存，不管n多大！")

print("\\n=== 3. for循环遍历生成器 ===")
def countdown(n):
    print("  countdown开始")
    while n > 0:
        yield n
        n -= 1
    yield "发射！"

print("倒计时:")
for num in countdown(5):
    print(f"  {num}")

print("\\n=== 4. 生成器表达式 ===")
# 列表推导式：立即计算，占用内存
squares_list = [x*x for x in range(10)]
# 生成器表达式：惰性计算
squares_gen = (x*x for x in range(10))

print(f"列表: {squares_list}")
print(f"生成器: {squares_gen}")
print(f"生成器类型: {type(squares_gen)}")
print("遍历生成器:")
for sq in squares_gen:
    print(f"  {sq}", end=" ")
print()

print("\\n=== 5. 无限序列生成器 ===")
def fibonacci():
    """无限斐波那契生成器"""
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

fib = fibonacci()
print("前15个斐波那契数:")
for _ in range(15):
    print(f"  {next(fib)}", end=" ")
print()

def natural_numbers():
    """自然数生成器"""
    n = 0
    while True:
        yield n
        n += 1

nums = natural_numbers()
print("前10个自然数:", [next(nums) for _ in range(10)])

print("\\n=== 6. yield 暂停状态保留 ===")
def make_counter():
    count = 0
    while True:
        received = yield count
        if received is not None:
            count = received
        count += 1

cnt = make_counter()
next(cnt)  # 启动生成器
print(f"counter: {next(cnt)}")  # 1
print(f"counter: {next(cnt)}")  # 2
# send发送值给yield
print(f"send(10): {cnt.send(10)}")  # 重置到10，返回11
print(f"counter: {next(cnt)}")  # 12

print("\\n=== 7. 生成器管道（数据流处理）===")
def read_data():
    """模拟读取数据"""
    for line in ["apple,10", "banana,20", "apple,15", "cherry,5", "banana,30"]:
        yield line

def parse_lines(lines):
    """解析行"""
    for line in lines:
        name, value = line.split(",")
        yield name, int(value)

def filter_by_value(items, threshold):
    """过滤"""
    for name, value in items:
        if value >= threshold:
            yield name, value

pipeline = filter_by_value(parse_lines(read_data()), 15)
print("值>=15的数据:")
for item in pipeline:
    print(f"  {item}")

print("\\n=== 8. 生成器只能遍历一次 ===")
gen = (x for x in range(3))
print("第一次遍历:", list(gen))
print("第二次遍历:", list(gen))  # 空了！
print("因为生成器遍历完后没有更多值了")

print("\\n=== 9. yield from （下节详解）===")
def sub_gen():
    yield 1
    yield 2

def main_gen():
    yield 0
    yield from sub_gen()  # 委托给子生成器
    yield 3

print("yield from 演示:", list(main_gen()))`
  },
  {
    id: "py6-yield-from",
    group: "函数编程",
    icon: "🎋",
    title: "yield from 与生成器进阶",
    content: `## yield from 与生成器进阶

\`yield from\` 是 Python 3.3 引入的语法，用于简化嵌套生成器的写法，并且支持双向通信。

### yield from 基本用法

\`yield from iterable\` 等价于：
\`\`\`python
# 遍历可迭代对象
for item in iterable:
    # yield 暂停函数并返回值，下次调用从暂停处继续执行
    yield item
\`\`\`

### yield from 的真正价值

1. **代码简洁**：不用写循环遍历子生成器
2. **双向通道**：\`send()\`、\`throw()\`、\`close()\` 可以直接传递给子生成器
3. **协程基础**：是 asyncio 的底层基础

### 生成器的其他方法

- \`g.send(value)\`：发送值给 yield 表达式
- \`g.throw(exc)\`：在生成器内抛出异常
- \`g.close()\`：关闭生成器

### 生成器 vs 迭代器

- 所有生成器都是迭代器
- 迭代器是实现了 \`__iter__\` 和 \`__next__\` 的对象
- 生成器是用 yield 或生成器表达式创建的特殊迭代器

### 注意事项

- \`yield from\` 后面接任意可迭代对象，不只是生成器
- 子生成器 return 的值会成为 yield from 表达式的值`,
    code: `# yield from 与生成器进阶演示
import sys

print("=== 1. yield from 基础：替代循环 ===")
def chain(*iterables):
    """把多个可迭代对象串起来"""
    for it in iterables:
        yield from it  # 等价于 for x in it: yield x

result = list(chain([1, 2, 3], "abc", (4, 5)))
print(f"chain([1,2,3], 'abc', (4,5)) = {result}")

# 对比：不用yield from需要嵌套循环
def chain_old(*iterables):
    for it in iterables:
        for x in it:
            yield x

print(f"旧方式结果: {list(chain_old([1,2], [3,4]))}")

print("\\n=== 2. yield from 展开嵌套结构 ===")
def flatten(nested):
    """递归展平任意嵌套的列表"""
    for item in nested:
        if isinstance(item, list):
            yield from flatten(item)  # 递归展开
        else:
            yield item

nested = [1, [2, 3, [4, 5]], 6, [[7, 8], 9]]
print(f"嵌套列表: {nested}")
print(f"展平后: {list(flatten(nested))}")

print("\\n=== 3. 树形遍历 ===")
class Node:
    def __init__(self, value, children=None):
        self.value = value
        self.children = children or []
    
    def __iter__(self):
        yield self.value
        for child in self.children:
            yield from child

tree = Node(1, [
    Node(2, [Node(4), Node(5)]),
    Node(3, [Node(6)])
])
print(f"树形遍历: {list(tree)}")

print("\\n=== 4. yield from 捕获返回值 ===")
def sub_generator():
    yield 1
    yield 2
    return "sub完成"  # return的值被yield from接收

def main_generator():
    yield 0
    result = yield from sub_generator()
    print(f"子生成器返回: {result}")
    yield 3

print("main_generator:")
gen = main_generator()
for val in gen:
    print(f"  得到: {val}")

print("\\n=== 5. send() 双向通信 ===")
def accumulator():
    total = 0
    while True:
        value = yield total
        if value is None:
            break
        total += value
    return total

acc = accumulator()
next(acc)  # 启动
print(f"启动后: {acc.send(10)}")
print(f"send(20): {acc.send(20)}")
print(f"send(30): {acc.send(30)}")
try:
    acc.send(None)
except StopIteration as e:
    print(f"最终总和: {e.value}")

print("\\n=== 6. yield from 传递send/throw ===")
def inner():
    while True:
        try:
            x = yield "inner"
            print(f"  inner收到: {x}")
        except ValueError as e:
            print(f"  inner捕获异常: {e}")

def outer():
    yield from inner()

gen = outer()
next(gen)
print("outer send hi:", gen.send("hi"))
print("outer throw ValueError:", gen.throw(ValueError("测试异常")))
gen.close()

print("\\n=== 7. 实用例子：逐行读取大文件 ===")
def read_large_file(file_obj):
    """用生成器逐行读文件，内存友好"""
    for line in file_obj:
        yield line.strip()

import tempfile
import os
# 创建临时文件演示
with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
    for i in range(100):
        f.write(f"第{i}行\\n")
    tmp_name = f.name

print(f"读取大文件（内存始终O(1)）:")
with open(tmp_name, 'r', encoding='utf-8') as f:
    line_gen = read_large_file(f)
    import itertools
    first5 = list(itertools.islice(line_gen, 5))
    print(f"前5行: {first5}")

os.unlink(tmp_name)

print("\\n=== 8. 生成器工具：itertools ===")
import itertools

# count: 无限计数器
counter = itertools.count(start=10, step=2)
print("itertools.count(10,2)前5个:", [next(counter) for _ in range(5)])

# cycle: 无限循环
cyc = itertools.cycle("ABC")
print("itertools.cycle('ABC')前7个:", [next(cyc) for _ in range(7)])

# islice: 切片
gen = (x*x for x in range(100))
print("islice前5个:", list(itertools.islice(gen, 5)))
print("islice 5-10:", list(itertools.islice(gen, 5)))

print("\\n=== 9. 生成器数据管道完整例子 ===")
# 读取→转换→过滤→聚合
def numbers():
    for i in range(1, 21):
        yield i

def even_filter(nums):
    for n in nums:
        if n % 2 == 0:
            yield n

def square(nums):
    for n in nums:
        yield n * n

pipeline = square(even_filter(numbers()))
print("1-20中偶数的平方:", list(pipeline))
print("对比列表版本: [n*n for n in range(1,21) if n%2==0] =", [n*n for n in range(1,21) if n%2==0])`
  },
  {
    id: "py6-higher-order",
    group: "函数编程",
    icon: "🎓",
    title: "高阶函数（map/filter/sorted/自定义高阶函数）",
    content: `## 高阶函数

**高阶函数**是指：接收函数作为参数，或者返回函数的函数。Python 中函数是一等公民，可以像普通值一样传递。

### 常见内置高阶函数

1. **map(func, iterable)**：对每个元素应用 func
2. **filter(func, iterable)**：过滤出 func 返回 True 的元素
3. **sorted(iterable, key=func)**：按 key 函数排序
4. **reduce(func, iterable)**：累积计算（在 functools 中）

### 一等函数特性

- 函数可以赋值给变量
- 函数可以作为参数传递
- 函数可以作为返回值
- 函数可以存储在数据结构中

### map/filter vs 列表推导式

很多时候列表推导式比 map/filter 更 Pythonic、更易读：

\`\`\`python
# map
# map 对每个元素应用函数 f，list 转为列表
list(map(f, seq))
# 列表推导式实现等价效果，更 Pythonic
[f(x) for x in seq]

# filter
# filter 保留使 f 返回 True 的元素
list(filter(f, seq))
# 列表推导式实现等价过滤
[x for x in seq if f(x)]
\`\`\`

### 注意事项

- map/filter 返回的是迭代器（Python 3），不是列表
- 简单操作用推导式更清晰，复杂逻辑考虑用生成器函数`,
    code: `# 高阶函数演示
from functools import reduce

print("=== 1. 函数是一等公民 ===")
def greet(name):
    return f"Hello, {name}"

# 赋值给变量
f = greet
print(f"f('小明') = {f('小明')}")

# 存入列表
funcs = [greet, str.upper, len]
print(f"funcs[0]('小红') = {funcs[0]('小红')}")
print(f"funcs[1]('hello') = {funcs[1]('hello')}")
print(f"funcs[2]('Python') = {funcs[2]('Python')}")

print("\\n=== 2. map() 映射 ===")
numbers = [1, 2, 3, 4, 5]
# 对每个元素求平方
squares = list(map(lambda x: x**2, numbers))
print(f"map平方: {squares}")
# 等价列表推导式
print(f"推导式平方: {[x**2 for x in numbers]}")

# 多个迭代器
list1 = [1, 2, 3]
list2 = [10, 20, 30]
sums = list(map(lambda a, b: a + b, list1, list2))
print(f"map两个列表相加: {sums}")

# map内置函数
words = ["apple", "banana", "cherry"]
print(f"map(str.upper): {list(map(str.upper, words))}")
print(f"map(len): {list(map(len, words))}")

print("\\n=== 3. filter() 过滤 ===")
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
# 过滤偶数
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(f"filter偶数: {evens}")
print(f"推导式偶数: {[x for x in numbers if x % 2 == 0]}")

# 过滤None（去除空值）
data = [1, 0, None, "", "hello", False, [], 42]
truthy = list(filter(None, data))
print(f"过滤falsy值: {truthy}")

# 过滤字符串
words = ["apple", "is", "a", "fruit"]
long_words = list(filter(lambda w: len(w) > 2, words))
print(f"长度>2的单词: {long_words}")

print("\\n=== 4. sorted() 也是高阶函数 ===")
students = [
    {"name": "小明", "score": 85},
    {"name": "小红", "score": 92},
    {"name": "小刚", "score": 78},
]
# key传入函数
by_score = sorted(students, key=lambda s: s["score"], reverse=True)
print("按分数降序:")
for s in by_score:
    print(f"  {s['name']}: {s['score']}")

words = ["banana", "apple", "cherry", "date"]
print(f"按长度排序: {sorted(words, key=len)}")

print("\\n=== 5. reduce() 累积 ===")
numbers = [1, 2, 3, 4, 5]
# 求和
total = reduce(lambda a, b: a + b, numbers)
print(f"reduce求和: {total}")
print(f"sum验证: {sum(numbers)}")

# 求乘积
product = reduce(lambda a, b: a * b, numbers)
print(f"reduce求积: {product}")

# 找最大值
max_val = reduce(lambda a, b: a if a > b else b, numbers)
print(f"reduce求最大: {max_val}")

# 带初始值
total2 = reduce(lambda a, b: a + b, numbers, 100)
print(f"初始100求和: {total2}")

print("\\n=== 6. 自定义高阶函数 ===")
def apply_twice(func, x):
    """把func应用两次"""
    return func(func(x))

print(f"apply_twice(lambda x: x*2, 3) = {apply_twice(lambda x: x*2, 3)}")
print(f"apply_twice(str.upper, 'hello') = {apply_twice(lambda s: s + '!', 'hi')}")

def make_apply_n(n):
    """返回一个应用n次的函数"""
    def apply_n(func, x):
        for _ in range(n):
            x = func(x)
        return x
    return apply_n

apply3 = make_apply_n(3)
print(f"加1应用3次到5: {apply3(lambda x: x+1, 5)}")

print("\\n=== 7. 函数返回函数（闭包）===")
def make_adder(n):
    def adder(x):
        return x + n
    return adder

add5 = make_adder(5)
add10 = make_adder(10)
print(f"add5(10) = {add5(10)}")
print(f"add10(10) = {add10(10)}")

print("\\n=== 8. 实用例子：简单的策略模式 ===")
def process_data(data, strategy):
    """用不同策略处理数据"""
    return [strategy(x) for x in data]

data = [1, 2, 3, 4, 5]
double = lambda x: x * 2
negate = lambda x: -x
square = lambda x: x * x

print(f"原数据: {data}")
print(f"双倍: {process_data(data, double)}")
print(f"取反: {process_data(data, negate)}")
print(f"平方: {process_data(data, square)}")

print("\\n=== 9. 组合函数 ===")
def compose(f, g):
    """组合两个函数: compose(f,g)(x) = f(g(x))"""
    return lambda x: f(g(x))

def add1(x): return x + 1
def double(x): return x * 2

add1_then_double = compose(double, add1)
double_then_add1 = compose(add1, double)

print(f"add1_then_double(3) = double(add1(3)) = double(4) = {add1_then_double(3)}")
print(f"double_then_add1(3) = add1(double(3)) = add1(6) = {double_then_add1(3)}")`
  },
  {
    id: "py6-partial",
    group: "函数编程",
    icon: "🔧",
    title: "functools.partial 偏函数",
    content: `## functools.partial 偏函数

\`functools.partial\` 用于**固定函数的部分参数**，返回一个新函数。这叫"偏函数应用"（Partial Application）。

### 基本用法

\`\`\`python
# 导入偏函数工具 partial
from functools import partial

# 定义加法函数
def add(a, b):
    return a + b

# 固定 add 的第一个参数为 5，生成新函数 add5
add5 = partial(add, 5)  # 固定a=5
# 调用相当于 add(5,3)，结果为 8
print(add5(3))  # 等价于 add(5, 3) = 8
\`\`\`

### 为什么用偏函数

1. **预设参数**：把常用参数固定，减少重复传参
2. **适配接口**：把多参数函数变成单参数，配合 map/filter/sorted
3. **代码复用**：基于通用函数创建特化版本

### partial 的特点

- 可以固定位置参数
- 可以固定关键字参数
- 新函数仍然可以传参覆盖
- 保留原函数的元信息

### partial vs lambda

- partial 更清晰，特别是固定多个参数时
- partial 可以 pickle，lambda 不行
- lambda 更灵活，可以加逻辑

### 注意事项

- partial 固定的是位置参数时，按从左到右固定
- 注意可变对象作为默认参数的问题（和默认参数一样）`,
    code: `# functools.partial 偏函数演示
from functools import partial
import functools

print("=== 1. partial 基础 ===")
def power(base, exponent):
    return base ** exponent

# 固定base=2，得到只需要exponent的函数
power2 = partial(power, 2)
# 固定base=10
power10 = partial(power, 10)

print(f"2^10 = {power2(10)}")
print(f"10^3 = {power10(3)}")

# 普通加法
def add(a, b):
    return a + b

add5 = partial(add, 5)  # a固定为5
print(f"add5(3) = 5+3 = {add5(3)}")
print(f"add5(10) = 5+10 = {add5(10)}")

print("\\n=== 2. partial 固定关键字参数 ===")
def greet(name, greeting="你好", punctuation="！"):
    return f"{greeting}，{name}{punctuation}"

# 固定问候语
say_morning = partial(greet, greeting="早上好")
say_hello_enthusiastic = partial(greet, greeting="你好", punctuation="!!!")

print(say_morning("小明"))
print(say_hello_enthusiastic("小红"))

# 仍然可以覆盖
print(say_morning("小刚", greeting="晚上好"))

print("\\n=== 3. partial 适配回调接口 ===")
# sorted的key只接受单参数函数
# 如果需要更多参数，用partial
def sort_by_key(item, key_name):
    return item[key_name]

students = [
    {"name": "小明", "age": 18, "score": 85},
    {"name": "小红", "age": 17, "score": 92},
    {"name": "小刚", "age": 19, "score": 78},
]

by_age = sorted(students, key=partial(sort_by_key, key_name="age"))
by_score = sorted(students, key=partial(sort_by_key, key_name="score"))
print("按年龄排序:")
for s in by_age:
    print(f"  {s['name']}: {s['age']}岁")
print("按分数排序:")
for s in by_score:
    print(f"  {s['name']}: {s['score']}分")

print("\\n=== 4. partial 替代重复lambda ===")
# 不优雅的lambda
def multiply(a, b):
    return a * b

# 用partial
double = partial(multiply, 2)
triple = partial(multiply, 3)

print(f"double(7) = {double(7)}")
print(f"triple(7) = {triple(7)}")

print("\\n=== 5. partial 用于print定制 ===")
# 创建一个总是打印到特定前缀的print
log_info = partial(print, "[INFO]", sep=" - ")
log_error = partial(print, "[ERROR]", sep=" - ", flush=True)

log_info("服务器启动")
log_info("端口", 8080)
log_error("连接失败")

print("\\n=== 6. partial 对象的属性 ===")
def example(a, b, c=0):
    return a + b + c

p = partial(example, 1, c=10)
print(f"partial对象: {p}")
print(f"固定的位置参数: {p.args}")
print(f"固定的关键字参数: {p.keywords}")
print(f"p(2) = example(1, 2, c=10) = {p(2)}")

# functools.partialmethod 用于类方法
print("\\n=== 7. partial 与默认参数的区别 ===")
# 默认参数在函数定义时固定
def add_default(x, n=5):
    return x + n

# partial创建新函数，可以有多个不同固定值
add3 = partial(add, 3)
add7 = partial(add, 7)
print(f"add_default(10) = {add_default(10)}")
print(f"add3(10) = {add3(10)}")
print(f"add7(10) = {add7(10)}")

print("\\n=== 8. 实际例子：int()的base参数 ===")
# int(x, base) 可以指定进制
print(f"int('1010', base=2) = {int('1010', base=2)}")
print(f"int('FF', base=16) = {int('FF', base=16)}")

# 用partial创建专用转换函数
bin2dec = partial(int, base=2)
hex2dec = partial(int, base=16)
oct2dec = partial(int, base=8)

print(f"bin2dec('1010') = {bin2dec('1010')}")
print(f"hex2dec('FF') = {hex2dec('FF')}")
print(f"oct2dec('77') = {oct2dec('77')}")

print("\\n=== 9. update_wrapper 保持元信息 ===")
def my_func(a, b, c):
    """这是原函数的文档"""
    return a + b + c

p_func = partial(my_func, 1)
# partial默认保留func属性
print(f"p_func.func = {p_func.func.__name__}")
print(f"原函数文档: {p_func.func.__doc__}")`
  },
  {
    id: "py6-builtin-functions",
    group: "函数编程",
    icon: "🧰",
    title: "常用内置函数（abs/sum/min/max/round/all/any/enumerate/zip/map/filter等）",
    content: `## 常用内置函数

Python 提供了很多实用的内置函数，不需要 import 就能直接使用。

### 数学相关

- \`abs(x)\`：绝对值
- \`sum(iterable, start)\`：求和
- \`min()/max()\`：最小/最大值
- \`round(x, n)\`：四舍五入
- \`pow(x, y)\`：幂运算

### 判断相关

- \`all(iterable)\`：所有元素都为 True 才返回 True
- \`any(iterable)\`：任意元素为 True 就返回 True
- \`isinstance(obj, type)\`：判断类型

### 迭代相关

- \`enumerate(iterable, start)\`：返回 (索引, 元素) 元组
- \`zip(*iterables)\`：把多个迭代器并行打包
- \`map/filter\`：前面讲过的高阶函数
- \`sorted/reversed\`：排序/反转

### 类型转换

- \`int()/float()/str()/bool()/list()/tuple()/dict()/set()\`

### 其他

- \`len()/type()/range()/print()/input()/open()\``,
    code: `# 常用内置函数演示
import math

print("=== 1. 数学函数 ===")
print(f"abs(-5) = {abs(-5)}")
print(f"abs(3.14) = {abs(3.14)}")

print(f"sum([1,2,3,4,5]) = {sum([1,2,3,4,5])}")
print(f"sum([1,2,3], 10) = {sum([1,2,3], 10)}")  # 10是初始值

numbers = [3, 1, 4, 1, 5, 9, 2, 6]
print(f"min({numbers}) = {min(numbers)}")
print(f"max({numbers}) = {max(numbers)}")
# min/max也可以传key
words = ["apple", "banana", "cherry", "date"]
print(f"最短单词: {min(words, key=len)}")
print(f"最长单词: {max(words, key=len)}")

print(f"round(3.14159) = {round(3.14159)}")
print(f"round(3.14159, 2) = {round(3.14159, 2)}")
print(f"round(3.14159, 4) = {round(3.14159, 4)}")
# 注意：银行家舍入（四舍六入五成双）
print(f"round(2.5) = {round(2.5)}, round(3.5) = {round(3.5)}")

print(f"pow(2, 10) = {pow(2, 10)}")
print(f"pow(2, 3, 5) = {pow(2, 3, 5)}")  # (2^3) % 5 = 3

print(f"divmod(17, 5) = {divmod(17, 5)}")  # (商, 余数)

print("\\n=== 2. all() 和 any() ===")
print(f"all([True, True, True]) = {all([True, True, True])}")
print(f"all([True, False, True]) = {all([True, False, True])}")
print(f"all([1, 2, 3]) = {all([1, 2, 3])}")  # 非0为True
print(f"all([1, 0, 3]) = {all([1, 0, 3])}")  # 0是False
print(f"all([]) = {all([])}")  # 空可迭代对象返回True（特殊！）

print(f"any([False, False, True]) = {any([False, False, True])}")
print(f"any([False, False, False]) = {any([False, False, False])}")
print(f"any([]) = {any([])}")  # 空返回False

# 实际应用：检查条件
scores = [85, 92, 78, 90, 88]
all_pass = all(s >= 60 for s in scores)
any_excellent = any(s >= 90 for s in scores)
print(f"全部及格? {all_pass}")
print(f"有优秀? {any_excellent}")

print("\\n=== 3. enumerate() 带索引遍历 ===")
fruits = ["苹果", "香蕉", "橙子"]
print("遍历列表:")
for i, fruit in enumerate(fruits):
    print(f"  {i}: {fruit}")

print("从1开始编号:")
for i, fruit in enumerate(fruits, start=1):
    print(f"  {i}. {fruit}")

print("\\n=== 4. zip() 并行打包 ===")
names = ["小明", "小红", "小刚"]
ages = [18, 17, 19]
scores = [85, 92, 78]

print("zip两个列表:")
for name, age in zip(names, ages):
    print(f"  {name}: {age}岁")

print("zip三个列表:")
for name, age, score in zip(names, ages, scores):
    print(f"  {name}: {age}岁, {score}分")

# zip长短不一致时取最短
print(f"zip([1,2,3], 'ab') = {list(zip([1,2,3], 'ab'))}")

# zip还可以解压（用*）
pairs = [("a", 1), ("b", 2), ("c", 3)]
letters, nums = zip(*pairs)
print(f"解压: letters={letters}, nums={nums}")

print("\\n=== 5. isinstance() 类型判断 ===")
print(f"isinstance(5, int) = {isinstance(5, int)}")
print(f"isinstance('hi', str) = {isinstance('hi', str)}")
print(f"isinstance([], list) = {isinstance([], list)}")
print(f"isinstance(5, (int, float)) = {isinstance(5, (int, float))}")  # 可以是多种类型之一
# 注意：用isinstance比type()好，因为支持继承
print(f"type(True) == int? {type(True) == int}")
print(f"isinstance(True, int)? {isinstance(True, int)}")  # bool是int的子类

print("\\n=== 6. 类型转换函数 ===")
print(f"int('42') = {int('42')}")
print(f"int('1010', 2) = {int('1010', 2)}")
print(f"float('3.14') = {float('3.14')}")
print(f"str(42) = '{str(42)}'")
print(f"bool(0) = {bool(0)}, bool(1) = {bool(1)}, bool('') = {bool('')}")
print(f"list('abc') = {list('abc')}")
print(f"tuple([1,2,3]) = {tuple([1,2,3])}")
print(f"set([1,2,2,3]) = {set([1,2,2,3])}")
print(f"dict([('a',1),('b',2)]) = {dict([('a',1),('b',2)])}")

print("\\n=== 7. sorted() 和 reversed() ===")
nums = [3, 1, 4, 1, 5, 9]
print(f"sorted({nums}) = {sorted(nums)}")
print(f"sorted(..., reverse=True) = {sorted(nums, reverse=True)}")
print(f"list(reversed([1,2,3])) = {list(reversed([1,2,3]))}")

print("\\n=== 8. 其他常用函数 ===")
print(f"len('Python') = {len('Python')}")
print(f"len([1,2,3]) = {len([1,2,3])}")
print(f"type(42) = {type(42)}")
print(f"id(nums) = {id(nums)}")
print(f"repr('hello') = {repr('hello')}")
print(f"chr(65) = '{chr(65)}', ord('A') = {ord('A')}")
print(f"dir([])[:5]... = 列表的方法有{len(dir([]))}个")

print("\\n=== 9. eval/exec/compile（谨慎使用！）===")
# eval计算表达式
print(f"eval('2+3*4') = {eval('2+3*4')}")
# 注意：不要eval用户输入，有安全风险！
# exec执行语句（不返回值）
print("exec执行语句:")
exec("print('  hello from exec')")
# compile预编译
code = compile("x = 100\\nprint('  x =', x)", "<string>", "exec")
exec(code)`
  },
  {
    id: "py6-callable",
    group: "函数编程",
    icon: "📞",
    title: "可调用对象（callable/__call__基础）",
    content: `## 可调用对象

**可调用对象**是指可以像函数一样用 \`()\` 调用的对象。用 \`callable()\` 判断一个对象是否可调用。

### 哪些是可调用的

1. **函数**：def 定义的普通函数
2. **lambda**：匿名函数
3. **类**：调用类会创建实例
4. **实现了 \`__call__\` 方法的实例**（函数式对象）
5. **内置函数**：如 len、print
6. **方法**：绑定到对象的函数

### __call__ 方法

让类的实例可以像函数一样被调用：

\`\`\`python
# 定义类，让其实例可像函数一样被调用
class Adder:
    # 构造方法，初始化时保存加数 n
    def __init__(self, n):
        # 把 n 保存为实例属性
        self.n = n
    # 实现 __call__ 使实例可被直接调用
    def __call__(self, x):
        # 返回 x 加上保存的 n
        return x + self.n

# 创建实例，保存加数 5
add5 = Adder(5)
# 调用实例相当于 add5.__call__(3)
print(add5(3))  # 8
\`\`\`

### 为什么用可调用对象

- **带状态**：函数可以保存属性，对象也是
- **闭包替代**：比闭包更清晰
- **记忆化/缓存**：调用之间保留状态
- **装饰器类**：上节讲过

### 注意事项

- \`callable()\` 返回 True 不代表调用一定成功，只是说可以尝试调用
- 普通实例默认不可调用，除非实现 \`__call__\``,
    code: `# 可调用对象演示
print("=== 1. callable() 判断 ===")
def func():
    pass

print(f"普通函数: callable(func) = {callable(func)}")
print(f"lambda: callable(lambda x: x) = {callable(lambda x: x)}")
print(f"类: callable(int) = {callable(int)}")
print(f"内置函数: callable(len) = {callable(len)}")
print(f"数字: callable(42) = {callable(42)}")
print(f"字符串: callable('hello') = {callable('hello')}")
print(f"列表: callable([]) = {callable([])}")

class MyClass:
    pass

obj = MyClass()
print(f"普通实例: callable(obj) = {callable(obj)}")

class CallableClass:
    def __call__(self):
        return "我被调用了！"

cobj = CallableClass()
print(f"有__call__的实例: callable(cobj) = {callable(cobj)}")

print("\\n=== 2. __call__ 基础 ===")
class Adder:
    def __init__(self, n):
        self.n = n
    
    def __call__(self, x):
        return x + self.n

add5 = Adder(5)
add10 = Adder(10)
print(f"add5(3) = {add5(3)}")
print(f"add10(3) = {add10(3)}")
print(f"callable(add5) = {callable(add5)}")

print("\\n=== 3. 带状态的可调用对象（计数器）===")
class Counter:
    def __init__(self, start=0):
        self.count = start
    
    def __call__(self):
        self.count += 1
        return self.count
    
    def reset(self):
        self.count = 0

cnt = Counter()
print(f"cnt() = {cnt()}")
print(f"cnt() = {cnt()}")
print(f"cnt() = {cnt()}")
cnt.reset()
print(f"reset后cnt() = {cnt()}")

print("\\n=== 4. 可调用对象做装饰器 ===")
class Timer:
    def __init__(self, func):
        import functools
        functools.update_wrapper(self, func)
        self.func = func
        self.call_count = 0
    
    def __call__(self, *args, **kwargs):
        import time
        self.call_count += 1
        start = time.time()
        result = self.func(*args, **kwargs)
        elapsed = time.time() - start
        print(f"[第{self.call_count}次] {self.func.__name__} 耗时: {elapsed:.6f}秒")
        return result

@Timer
def slow_func(seconds):
    import time
    time.sleep(seconds)
    return "done"

print("调用slow_func:")
slow_func(0.05)
slow_func(0.05)
slow_func(0.05)
print(f"总调用次数: {slow_func.call_count}")

print("\\n=== 5. 可调用对象实现策略模式 ===")
class Operation:
    pass

class Add(Operation):
    def __call__(self, a, b):
        return a + b

class Multiply(Operation):
    def __call__(self, a, b):
        return a * b

class Power(Operation):
    def __init__(self, exponent):
        self.exponent = exponent
    def __call__(self, a, b):
        return (a + b) ** self.exponent

def calculate(a, b, op):
    return op(a, b)

print(f"Add: 3+4 = {calculate(3, 4, Add())}")
print(f"Multiply: 3*4 = {calculate(3, 4, Multiply())}")
print(f"Power(2): (3+4)^2 = {calculate(3, 4, Power(2))}")

print("\\n=== 6. 可调用对象带记忆（缓存）===")
class MemoizedFib:
    def __init__(self):
        self.cache = {0: 0, 1: 1}
    
    def __call__(self, n):
        if n in self.cache:
            return self.cache[n]
        result = self(n-1) + self(n-2)
        self.cache[n] = result
        return result

fib = MemoizedFib()
import time
start = time.time()
print(f"fib(100) = {fib(100)}")
print(f"计算耗时: {time.time()-start:.6f}秒（有缓存极快）")

print("\\n=== 7. 函数也可以有属性（因为函数也是对象）===")
def greet(name):
    greet.count += 1
    return f"Hello, {name}!"

greet.count = 0  # 给函数添加属性

print(greet("小明"))
print(greet("小红"))
print(greet("小刚"))
print(f"greet被调用了{greet.count}次")

print("\\n=== 8. 类也是可调用的（创建实例）===")
class Person:
    def __init__(self, name):
        self.name = name
    def say_hi(self):
        return f"Hi, I'm {self.name}"

# 类本身是可调用的，调用返回实例
print(f"Person是可调用的: {callable(Person)}")
p = Person("小明")
print(f"实例p.say_hi(): {p.say_hi()}")
# 方法也是可调用的
print(f"p.say_hi是可调用的: {callable(p.say_hi)}")

print("\\n=== 9. 检查不同类型的可调用对象 ===")
import types

def check_callable(obj, name):
    print(f"{name}:")
    print(f"  callable = {callable(obj)}")
    if callable(obj):
        if isinstance(obj, types.FunctionType):
            print(f"  类型: 普通函数")
        elif isinstance(obj, type):
            print(f"  类型: 类")
        elif isinstance(obj, types.BuiltinFunctionType):
            print(f"  类型: 内置函数")
        elif hasattr(obj, '__call__'):
            print(f"  类型: 实现了__call__的对象")

check_callable(len, "len")
check_callable(func, "func")
check_callable(Person, "Person")
check_callable(add5, "add5")
check_callable(42, "42")`
  },
  {
    id: "py6-function-annotations",
    group: "函数编程",
    icon: "🏷️",
    title: "函数注解（类型提示基础）",
    content: `## 函数注解（类型提示基础）

函数注解（Function Annotations）是 Python 3.0 引入的，可以给函数参数和返回值附加元数据，最常用的就是**类型提示**。

### 基本语法

\`\`\`python
# 参数后 :类型 标注参数类型，->类型 标注返回值类型（仅提示，不强制）
def greet(name: str, age: int = 18) -> str:
    # 返回 f-string 拼接的字符串
    return f"{name} is {age} years old"
\`\`\`

- 参数注解：\`参数名: 类型\`
- 返回值注解：\`-> 类型\`
- 默认值和注解可以共存：\`age: int = 18\`

### 常用类型

- 基础类型：\`int\`, \`float\`, \`str\`, \`bool\`
- 容器类型：\`list\`, \`dict\`, \`tuple\`, \`set\`（Python 3.9+ 直接用）
- 可选类型：\`Optional[X]\` 等价于 \`X | None\`（3.10+）
- 联合类型：\`Union[X, Y]\` 等价于 \`X | Y\`（3.10+）
- 任意类型：\`Any\`

### 注解的本质

- Python **不会强制检查类型**！注解只是元数据
- 可以通过 \`__annotations__\` 属性访问
- 需要 mypy、IDE（如 PyCharm、VS Code）才能做类型检查

### 为什么用类型提示

1. **IDE 提示更好**：自动补全更准确
2. **代码自文档**：看签名就知道传什么
3. **提前发现bug**：类型检查工具能找到错误
4. **团队协作**：接口更清晰

### 注意事项

- 类型注解在运行时不强制，写错类型不报错
- 不要过度注解，简单函数不用写也行
- 复杂类型需要 \`from typing import\`（3.9之前）`,
    code: `# 函数注解/类型提示演示
print("=== 1. 基本类型注解 ===")
def add(a: int, b: int) -> int:
    """两个整数相加，返回整数"""
    return a + b

print(f"add(3, 5) = {add(3, 5)}")
# 注意：Python不强制检查类型！传字符串也能运行（但不建议）
print(f"add('a', 'b') = {add('a', 'b')}")
print("（Python不强制类型检查，运行时还是鸭子类型）")

def greet(name: str, greeting: str = "你好") -> str:
    return f"{greeting}，{name}！"

print(greet("小明"))
print(greet("小红", "早上好"))

print("\\n=== 2. 访问注解信息 __annotations__ ===")
print(f"add.__annotations__ = {add.__annotations__}")
print(f"greet.__annotations__ = {greet.__annotations__}")

print("\\n=== 3. 容器类型注解 ===")
# Python 3.9+ 可以直接用 list[int], dict[str, int]
# 3.8及以前需要 from typing import List, Dict
def average(numbers: list[float]) -> float:
    return sum(numbers) / len(numbers)

def get_student_scores() -> dict[str, int]:
    return {"小明": 85, "小红": 92}

print(f"average([1,2,3,4,5]) = {average([1,2,3,4,5])}")
print(f"get_student_scores() = {get_student_scores()}")

# 嵌套容器
def process_matrix(matrix: list[list[int]]) -> list[int]:
    return [sum(row) for row in matrix]

matrix = [[1, 2, 3], [4, 5, 6]]
print(f"矩阵每行和: {process_matrix(matrix)}")

print("\\n=== 4. 可选类型和联合类型 ===")
# Python 3.10+ 用 | 表示联合类型
def divide(a: float, b: float) -> float | None:
    """b为0时返回None"""
    if b == 0:
        return None
    return a / b

print(f"divide(10, 3) = {divide(10, 3):.2f}")
print(f"divide(10, 0) = {divide(10, 0)}")

def get_age(person: dict[str, str | int]) -> int | None:
    age = person.get("age")
    return age if isinstance(age, int) else None

print(f"get_age: {get_age({'name': '小明', 'age': 18})}")
print(f"get_age: {get_age({'name': '小红'})}")

print("\\n=== 5. Any 类型（任意类型）===")
def print_anything(value: object) -> None:
    print(f"值: {value}, 类型: {type(value).__name__}")

print_anything(42)
print_anything("hello")
print_anything([1, 2, 3])

print("\\n=== 6. Callable 类型（函数参数）===")
from typing import Callable

def apply_operation(x: int, y: int, op: Callable[[int, int], int]) -> int:
    """接收两个int，返回int的函数"""
    return op(x, y)

print(f"apply_operation(3, 5, add) = {apply_operation(3, 5, add)}")
print(f"apply_operation(3, 5, lambda a,b: a*b) = {apply_operation(3, 5, lambda a,b: a*b)}")

print("\\n=== 7. 类型别名 ===")
# 给复杂类型起别名
Vector = list[float]
Matrix = list[Vector]

def dot_product(v1: Vector, v2: Vector) -> float:
    return sum(a * b for a, b in zip(v1, v2))

v1 = [1.0, 2.0, 3.0]
v2 = [4.0, 5.0, 6.0]
print(f"点积: {dot_product(v1, v2)}")

print("\\n=== 8. 变量注解（Python 3.6+）===")
name: str = "小明"
age: int = 18
scores: list[int] = [85, 90, 88]
maybe: str | None = None

print(f"name: {name} (类型提示为str)")
print(f"scores: {scores} (类型提示为list[int])")

print("\\n=== 9. 注解的实际价值 ===")
print("类型注解的好处：")
print("1. IDE（PyCharm/VSCode）会给你更好的代码提示")
print("2. mypy等工具可以静态检查类型错误")
print("3. 作为文档，看函数签名就知道怎么用")
print("4. 重构时更安全，能提前发现不匹配")
print()
print("注意：运行时不强制检查，注解只是提示！")

# 验证：注解存在__annotations__里，但Python不检查
def bad_add(a: int, b: int) -> int:
    return a + b

print(f"bad_add('x', 'y') 不会报错，返回: {bad_add('x', 'y')}")
print("（mypy会指出这个类型错误，但Python本身不报错）")`
  }
]
