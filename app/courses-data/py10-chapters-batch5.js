// =============================================================
// Python 从入门到精通大全（终极版）—— 第5批章节
// 第五部分 函数基础（共 5 章）
// =============================================================

const chapters = [
  // =========================================================
  // 第二十一章：函数定义与调用
  // =========================================================
  {
    id: "py10-ch21",
    group: "第五部分 函数基础",
    icon: "🔧",
    title: "第二十一章 函数定义与调用",
    content: `## 函数：代码复用的基石

函数是 Python 中**组织代码的最基本单元**。当你发现同一段逻辑被写了两次以上，就该把它抽成函数了。函数让代码变得**可复用、可测试、可维护**。

### 为什么需要函数

想象你要在 10 个地方计算圆的面积。如果不写函数：

\`\`\`python
# 不使用函数的写法：重复、易错、难维护
r1 = 3
area1 = 3.14159 * r1 * r1
print("面积是", area1)

r2 = 5
area2 = 3.14159 * r2 * r2
print("面积是", area2)

# 如果要把 3.14159 改成更精确的 math.pi，得改 10 处
# 如果要加单位检查，得改 10 处
# 这就是"代码重复"的灾难
\`\`\`

写成函数后：

\`\`\`python
import math

# 定义函数：把"计算圆面积"的逻辑封装起来
# def 是定义函数的关键字，circle_area 是函数名，r 是参数
def circle_area(r):
    """计算圆的面积。
    r: 半径（数字）
    返回: 面积（数字）
    """
    # 函数体：用 math.pi 比手写 3.14159 更精确
    return math.pi * r * r

# 调用：一行就能算出结果
print("面积是", circle_area(3))  # 输出 28.27...
print("面积是", circle_area(5))  # 输出 78.54...

# 修改逻辑只改一处：比如加一个非负检查
# def circle_area(r):
#     if r < 0:
#         raise ValueError("半径不能为负数")
#     return math.pi * r * r
\`\`\`

## 一、def 关键字与函数命名

Python 用 \`def\` 关键字定义函数，语法是：

\`\`\`python
def 函数名(参数1, 参数2, ...):
    """文档字符串（可选但强烈推荐）"""
    函数体
    return 返回值  # 可选
\`\`\`

\`\`\`python
# 最简单的函数：无参数、无返回值
def say_hello():
    """打印一句问候语。
    无参数，无返回值（实际上返回 None）。
    """
    print("你好，Python！")

# 调用：函数名加括号
say_hello()  # 输出：你好，Python！

# 函数不调用就不会执行
# 下面这行定义了函数但没调用，所以什么都不会发生
def unused_function():
    print("这行永远不会打印")

# 调用后才能看到效果
unused_function()  # 现在才打印
\`\`\`

**函数命名规范**（PEP 8）：

| 规则 | 说明 | 示例 |
| --- | --- | --- |
| 全小写 | 单词之间用下划线 | \`calculate_area\` |
| 动词开头 | 表示行为 | \`get_user_info\`、\`send_email\` |
| 避免缩写 | 除非约定俗成 | 用 \`calculate\`，不用 \`calc\` |
| 私有函数 | 单下划线开头 | \`_internal_helper\` |
| 避免与内置冲突 | 不要用 \`list\`、\`dict\` 等名字 | 用 \`my_list\` 而不是 \`list\` |

\`\`\`python
# 好的命名：动词+名词，表意清晰
def calculate_total_price(items):
    """计算购物车总价"""
    return sum(item["price"] for item in items)

def validate_email(email):
    """校验邮箱格式（简化版）"""
    return "@" in email and "." in email

def send_welcome_email(user_email):
    """发送欢迎邮件（模拟）"""
    print(f"向 {user_email} 发送欢迎邮件")

# 不好的命名：含糊、缩写、名词开头
def calc(x, y):  # calc 是什么？x、y 又是什么？
    return x * y

def data():  # 名词开头，看不出行为
    pass

# 私有函数：单下划线开头，提示"内部使用，别在外部调用"
def _hash_password(password):
    """内部函数：对密码做简单哈希（仅演示）"""
    return hash(password)  # 真实场景请用 hashlib
\`\`\`

## 二、文档字符串（docstring）

文档字符串是**写在函数体第一行的字符串**，用三引号包裹。它能被 \`help()\` 和 \`__doc__\` 读取，是 Python 的"自带文档系统"。

\`\`\`python
def add(a, b):
    """两个数相加。

    参数:
        a: 第一个数
        b: 第二个数

    返回:
        两数之和

    示例:
        >>> add(2, 3)
        5
    """
    return a + b

# 用 help() 查看文档
help(add)
# 输出：
# Help on function add in module __main__:
# add(a, b)
#     两个数相加。
#     ...

# 也可以直接访问 __doc__ 属性
print(add.__doc__)
\`\`\`

**docstring 的三种风格**：

\`\`\`python
# 风格一：reStructuredText（Sphinx 默认）
def func1(a, b):
    """简要说明。

    :param a: 参数 a
    :param b: 参数 b
    :returns: 返回值说明
    """
    return a + b

# 风格二：Google 风格（推荐，可读性最好）
def func2(a, b):
    """简要说明。

    Args:
        a: 参数 a
        b: 参数 b

    Returns:
        返回值说明
    """
    return a + b

# 风格三：NumPy 风格（科学计算常用）
def func3(a, b):
    """简要说明。

    Parameters
    ----------
    a : int
        参数 a
    b : int
        参数 b

    Returns
    -------
    int
        返回值说明
    """
    return a + b
\`\`\`

## 三、return 语句

\`return\` 把函数的结果返回给调用者。**没有 return 的函数返回 None**。

\`\`\`python
# 1. 显式返回值
def square(x):
    return x * x

result = square(5)
print(result)  # 25

# 2. 没有 return，返回 None
def greet(name):
    print(f"你好，{name}")

result = greet("小明")  # 输出：你好，小明
print(result)  # None

# 3. 只有 return，没有值，也返回 None
def do_nothing():
    return

print(do_nothing())  # None

# 4. return 会立即结束函数
def find_first_negative(numbers):
    """找到第一个负数并返回"""
    for n in numbers:
        if n < 0:
            return n  # 找到就立刻返回，后面的循环不执行
    return None  # 都不是负数，返回 None

print(find_first_negative([1, 2, -3, -4]))  # -3（只返回第一个）
\`\`\`

## 四、返回多个值（元组解包）

Python 函数可以"返回多个值"——实际上是返回一个元组，调用方可以解包。

\`\`\`python
# 一个函数返回多个值：实际返回的是元组
def min_max(numbers):
    """同时返回最小值和最大值"""
    return min(numbers), max(numbers)

# 调用方解包
mn, mx = min_max([3, 1, 4, 1, 5, 9, 2, 6])
print(f"最小值={mn}, 最大值={mx}")  # 最小值=1, 最大值=9

# 等价于先接收元组，再解包
result = min_max([3, 1, 4])
print(result)  # (1, 4)
print(type(result))  # <class 'tuple'>

# 经典用法：返回状态码和消息
def divide(a, b):
    """除法，返回 (是否成功, 结果或错误消息)"""
    if b == 0:
        return False, "除数不能为零"
    return True, a / b

ok, value = divide(10, 2)
if ok:
    print(f"结果是 {value}")
else:
    print(f"出错：{value}")

ok, value = divide(10, 0)
if not ok:
    print(f"出错：{value}")  # 输出：出错：除数不能为零
\`\`\`

**返回任意数量值**（用 \* 解包）：

\`\`\`python
# 返回一个列表，调用方用 * 解包
def get_scores():
    return [90, 85, 95, 88]

# 用 * 把列表解包成多个参数
print(*get_scores())  # 90 85 95 88

# 函数返回多个值用于传给另一个函数
def parse_point(s):
    """解析 "3,4" 这样的字符串为两个数字"""
    x, y = s.split(",")
    return int(x), int(y)

# 直接把返回值传给另一个接受多参数的函数
def distance(x1, y1, x2, y2):
    return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5

# 把 parse_point 的返回值解包传给 distance
p1 = parse_point("0,0")
p2 = parse_point("3,4")
print(distance(*p1, *p2))  # 5.0
\`\`\`

## 五、函数是一等公民（first-class object）

Python 中**函数是对象**，可以赋值给变量、作为参数传递、作为返回值。这是 Python 函数式编程的基础。

\`\`\`python
# 1. 函数可以赋值给变量
def shout(text):
    return text.upper()

# 把函数赋值给变量 yell（注意没有括号，是函数本身）
yell = shout
print(yell("hello"))  # HELLO

# 2. 函数可以作为参数传递
def apply(func, value):
    """把 func 应用到 value 上"""
    return func(value)

print(apply(shout, "hi"))  # HI
print(apply(str.lower, "HI"))  # hi（内置函数也能传）

# 3. 函数可以作为返回值
def make_multiplier(factor):
    """返回一个把输入乘以 factor 的函数"""
    def multiply(x):
        return x * factor
    return multiply  # 返回函数本身，不调用

times3 = make_multiplier(3)  # 拿到一个"乘以 3"的函数
times5 = make_multiplier(5)  # 拿到一个"乘以 5"的函数
print(times3(10))  # 30
print(times5(10))  # 50

# 4. 函数可以放进数据结构
operations = {
    "add": lambda x, y: x + y,
    "sub": lambda x, y: x - y,
    "mul": lambda x, y: x * y,
}

# 根据字符串选择函数
op = "add"
print(operations[op](3, 4))  # 7
\`\`\`

**函数对象的属性**：

\`\`\`python
def my_func(a, b):
    """示例函数"""
    return a + b

# 函数对象有很多属性
print(my_func.__name__)  # 函数名：my_func
print(my_func.__doc__)   # 文档字符串：示例函数
print(my_func.__module__)  # 所在模块：__main__

# 函数可以附加自定义属性（虽然不常用）
my_func.version = "1.0"
my_func.author = "zhangsan"
print(my_func.version)  # 1.0

# 查看函数的字节码
import dis
dis.dis(my_func)  # 反汇编显示 Python 字节码
\`\`\`

## 六、调用函数的细节

\`\`\`python
# 1. 位置参数：按顺序传递
def introduce(name, age, city):
    print(f"我叫 {name}，{age} 岁，来自 {city}")

introduce("张三", 25, "北京")  # 位置参数

# 2. 关键字参数：按名字传递，顺序无所谓
introduce(city="上海", name="李四", age=30)

# 3. 混合使用：位置参数在前，关键字参数在后
introduce("王五", city="广州", age=28)  # ✅
# introduce(name="赵六", 30)  # ❌ 语法错误：位置参数不能在关键字参数后面

# 4. 参数解包
args = ("钱七", 22, "深圳")
introduce(*args)  # 等价于 introduce("钱七", 22, "深圳")

kwargs = {"name": "孙八", "age": 35, "city": "杭州"}
introduce(**kwargs)  # 等价于 introduce(name="孙八", age=35, city="杭州")
\`\`\`

## 七、空函数与占位

\`\`\`python
# pass 语句：什么都不做，常用于占位
def todo_feature():
    pass  # 先占位，以后再实现

# 或者用 ... （省略号），效果一样
def not_implemented():
    ...  # 等价于 pass，但更"数学化"

# 异常占位：用 raise NotImplementedError
def must_override():
    """子类必须重写此方法"""
    raise NotImplementedError("子类必须实现这个方法")

# try/except 里也常用 pass 来"忽略"异常
try:
    risky_operation()
except SpecificError:
    pass  # 已知错误，忽略
\`\`\`

## 八、函数定义的常见陷阱

\`\`\`python
# 陷阱一：函数名与变量名冲突
def my_func():
    return "I am function"

# 不小心把函数赋值成字符串
my_func = "I am string"
# 现在 my_func 是字符串了，再调用会报错
# my_func()  # ❌ TypeError: 'str' object is not callable

# 陷阱二：忘记调用函数（少了括号）
def get_list():
    return [1, 2, 3]

# 错误：打印函数对象，而不是函数结果
print(get_list)  # <function get_list at 0x...>
print(get_list())  # [1, 2, 3]  ← 这才是调用

# 陷阱三：在函数里修改全局变量（不推荐）
counter = 0
def bad_increment():
    # 这个 counter 是函数内的局部变量，不是外面的
    # counter = counter + 1  # ❌ UnboundLocalError
    pass

# 陷阱四：返回值用 print 而不是 return
def add_wrong(a, b):
    print(a + b)  # 只是打印，没有返回值

result = add_wrong(2, 3)  # 打印 5，但 result 是 None
print(result)  # None

def add_right(a, b):
    return a + b  # 正确：返回结果

result = add_right(2, 3)  # result 是 5
\`\`\`

## 九、综合示例：构建一个简单的工具函数库

\`\`\`python
"""字符串处理工具函数库"""

def reverse_string(s):
    """反转字符串。
    
    Args:
        s: 输入字符串
        
    Returns:
        反转后的字符串
    """
    return s[::-1]

def count_words(text):
    """统计单词数（按空格分割）"""
    return len(text.split())

def is_palindrome(s):
    """判断是否回文（忽略大小写和空格）"""
    # 清理：转小写、去空格
    cleaned = s.lower().replace(" ", "")
    return cleaned == cleaned[::-1]

def truncate(text, max_len=20, suffix="..."):
    """截断字符串到指定长度"""
    if len(text) <= max_len:
        return text
    return text[:max_len] + suffix

# 测试
print(reverse_string("Hello"))  # olleH
print(count_words("hello world foo bar"))  # 4
print(is_palindrome("A man a plan a canal Panama"))  # True
print(truncate("这是一个非常非常非常长的字符串", max_len=10))  # 这是一个非常非常非...
\`\`\`

## 十、函数 vs 方法 vs 过程

| 概念 | 说明 | 示例 |
| --- | --- | --- |
| 函数 | 独立代码块，通过名字调用 | \`len(x)\`、\`print(x)\` |
| 方法 | 属于对象的函数，用 \`.\` 调用 | \`"abc".upper()\`、\`x.append(1)\` |
| 过程 | 无返回值的函数（其他语言概念） | Python 中返回 None 的函数 |

\`\`\`python
# 函数：独立调用
print(len([1, 2, 3]))  # 3

# 方法：通过对象调用
lst = [1, 2, 3]
lst.append(4)  # append 是 list 的方法
print(lst)  # [1, 2, 3, 4]

# 方法本质也是函数，可以赋值给变量
my_append = lst.append
my_append(5)
print(lst)  # [1, 2, 3, 4, 5]

# 类的方法（unbound）
bound_method = [1, 2].append
# bound_method(3)  # 不会修改原列表，因为绑定的对象不同
\`\`\`

## 小结

本章介绍了 Python 函数的最核心知识：

1. **\`def\` 定义函数**，函数名遵循小写+下划线规范，动词开头
2. **文档字符串（docstring）** 是函数的"说明书"，用 \`help()\` 查看
3. **\`return\` 返回值**，没有 return 返回 None，可以返回多个值（实际是元组）
4. **函数是一等公民**：可以赋值、传参、作为返回值，还能放进数据结构
5. **调用方式多样**：位置参数、关键字参数、\`*\` 解包列表、\`**\` 解包字典
6. **常见陷阱**：函数名与变量名冲突、忘记加括号、用 print 代替 return

函数是 Python 编程的基础设施。下一章我们将深入函数参数——这是 Python 函数最灵活、也最容易让人迷惑的部分。掌握好参数，你才能写出既灵活又安全的 API。`
  },

  // =========================================================
  // 第二十二章：函数参数详解
  // =========================================================
  {
    id: "py10-ch22",
    group: "第五部分 函数基础",
    icon: "📥",
    title: "第二十二章 函数参数详解",
    content: `## 参数：函数的输入接口

Python 的函数参数系统是所有语言中**最灵活的之一**。它支持位置参数、关键字参数、默认值、可变参数（\`*args\`、\`**kwargs\`）、仅位置参数、仅关键字参数等。这种灵活性让 Python 既能写出简洁的 API，也能处理复杂的调用场景。

## 一、位置参数（Positional Arguments）

最基础的参数形式——**按顺序对应**。

\`\`\`python
def greet(name, greeting):
    """name 和 greeting 都是位置参数"""
    print(f"{greeting}, {name}!")

# 按位置传递
greet("张三", "你好")  # 你好, 张三!
greet("你好", "张三")  # 张三, 你好!  ← 顺序反了，结果完全不同

# 参数数量必须匹配
# greet("张三")  # ❌ TypeError: missing 1 required positional argument: 'greeting'
# greet("张三", "你好", "！")  # ❌ too many positional arguments
\`\`\`

## 二、关键字参数（Keyword Arguments）

用 \`参数名=值\` 的形式传递，**顺序无所谓**。

\`\`\`python
def greet(name, greeting):
    print(f"{greeting}, {name}!")

# 用关键字参数，顺序无所谓
greet(greeting="你好", name="张三")  # 你好, 张三!
greet(name="李四", greeting="嗨")  # 嗨, 李四!

# 混合使用：位置参数必须在关键字参数前面
greet("王五", greeting="嗨")  # ✅
# greet(name="赵六", "嗨")  # ❌ SyntaxError

# 关键字参数的代码更易读，尤其参数多的时候
def create_user(name, age, email, role, active):
    print(f"创建用户：{name}, {age}, {email}, {role}, {active}")

# 全用位置参数：读起来一头雾水
create_user("张三", 25, "zs@example.com", "admin", True)

# 用关键字参数：一眼看懂
create_user(
    name="张三",
    age=25,
    email="zs@example.com",
    role="admin",
    active=True,
)
\`\`\`

## 三、默认值（Default Values）

给参数设置默认值，调用时可以不传。

\`\`\`python
def greet(name, greeting="你好"):
    """greeting 有默认值，调用时可以省略"""
    print(f"{greeting}, {name}!")

greet("张三")  # 你好, 张三!（用默认值）
greet("李四", "嗨")  # 嗨, 李四!（覆盖默认值）
greet("王五", greeting="早上好")  # 早上好, 王五!

# ⚠️ 规则：有默认值的参数必须放在没有默认值的参数后面
# def bad(a=1, b):  # ❌ SyntaxError
#     pass

def good(a, b=1):  # ✅
    return a + b

print(good(10))  # 11
print(good(10, 20))  # 30
\`\`\`

**经典陷阱：可变默认值**

\`\`\`python
# ❌ 错误示范：用列表作为默认值
def add_item(item, lst=[]):
    """每次调用都往 lst 里加 item"""
    lst.append(item)
    return lst

# 第一次调用：看起来正常
print(add_item("a"))  # ['a']

# 第二次调用：竟然保留了上次的内容！
print(add_item("b"))  # ['a', 'b']  ← 这不是我们想要的

# 第三次调用：还在累积
print(add_item("c"))  # ['a', 'b', 'c']

# 原因：默认值在函数定义时只创建一次，所有调用共享同一个列表
# 这是 Python 最经典的坑之一

# ✅ 正确做法：用 None 作为默认值，函数内创建新列表
def add_item_fixed(item, lst=None):
    if lst is None:
        lst = []  # 每次调用都创建新列表
    lst.append(item)
    return lst

print(add_item_fixed("a"))  # ['a']
print(add_item_fixed("b"))  # ['b']  ← 现在每次都是新列表
\`\`\`

## 四、\`*args\`：可变位置参数

\`\`\`python
def sum_all(*args):
    """*args 接收任意数量的位置参数，打包成元组"""
    print(f"args 的类型: {type(args)}")
    print(f"args 的值: {args}")
    return sum(args)

print(sum_all(1, 2, 3))  # args: (1, 2, 3)，返回 6
print(sum_all(10, 20, 30, 40, 50))  # args: (10, 20, 30, 40, 50)，返回 150
print(sum_all())  # args: ()，返回 0

# *args 的名字可以任意，但约定俗成用 args
def print_all(*numbers):
    for n in numbers:
        print(n, end=" ")
    print()

print_all(1, 2, 3)  # 1 2 3

# *args 可以和普通参数混用
def greet_all(greeting, *names):
    """greeting 是普通参数，names 收集剩余的"""
    for name in names:
        print(f"{greeting}, {name}!")

greet_all("你好", "张三", "李四", "王五")
# 输出：
# 你好, 张三!
# 你好, 李四!
# 你好, 王五!

# 调用时可以用 * 解包列表/元组
names_list = ["赵六", "钱七", "孙八"]
greet_all("嗨", *names_list)  # 等价于 greet_all("嗨", "赵六", "钱七", "孙八")
\`\`\`

## 五、\`**kwargs\`：可变关键字参数

\`\`\`python
def print_info(**kwargs):
    """**kwargs 接收任意数量的关键字参数，打包成字典"""
    print(f"kwargs 的类型: {type(kwargs)}")
    print(f"kwargs 的值: {kwargs}")
    for key, value in kwargs.items():
        print(f"  {key}: {value}")

print_info(name="张三", age=25, city="北京")
# kwargs: {'name': '张三', 'age': 25, 'city': '北京'}
#   name: 张三
#   age: 25
#   city: 北京

# 调用时用 ** 解包字典
user_dict = {"name": "李四", "age": 30, "email": "ls@example.com"}
print_info(**user_dict)

# 实际应用：配置函数
def create_window(title, **options):
    """创建窗口，options 接收各种可选配置"""
    print(f"窗口标题: {title}")
    defaults = {
        "width": 800,
        "height": 600,
        "resizable": True,
        "theme": "light",
    }
    # 用 options 覆盖默认值
    config = {**defaults, **options}
    for k, v in config.items():
        print(f"  {k} = {v}")

create_window("我的应用", width=1024, theme="dark")
# 窗口标题: 我的应用
#   width = 1024
#   height = 600
#   resizable = True
#   theme = dark
\`\`\`

## 六、参数的完整顺序

Python 函数参数的完整语法顺序是：

\`\`\`
def func(pos_only, /, normal, *args, kw_only, **kwargs):
    pass
\`\`\`

\`\`\`python
# 完整示例：所有参数类型一起用
def complex_func(a, b, /, c, d=10, *args, e, f=20, **kwargs):
    """
    a, b: 仅位置参数（/ 之前）
    c, d: 普通参数（可以是位置或关键字）
    *args: 收集额外的位置参数
    e, f: 仅关键字参数（* 之后）
    **kwargs: 收集额外的关键字参数
    """
    print(f"a={a}, b={b}")
    print(f"c={c}, d={d}")
    print(f"args={args}")
    print(f"e={e}, f={f}")
    print(f"kwargs={kwargs}")

# 调用示例
complex_func(1, 2, 3, 4, 5, 6, e=7, f=8, g=9, h=10)
# a=1, b=2
# c=3, d=4
# args=(5, 6)
# e=7, f=8
# kwargs={'g': 9, 'h': 10}
\`\`\`

## 七、仅位置参数（Positional-Only，\`/\`）

Python 3.8 新增。用 \`/\` 分隔，**之前的参数只能按位置传，不能用关键字**。

\`\`\`python
def pow_base_exp(x, y, /):
    """x 和 y 必须按位置传"""
    return x ** y

print(pow_base_exp(2, 3))  # 8 ✅
# print(pow_base_exp(x=2, y=3))  # ❌ TypeError: got some positional-only arguments passed as keyword

# 为什么要仅位置参数？
# 1. 参数名是实现细节，不想暴露给调用方
# 2. 将来可以改参数名而不影响调用方
# 3. 性能：解释器对位置参数有优化

# 内置函数很多是仅位置参数
# len(obj=[])  # ❌ 不能用关键字
len([])  # ✅
\`\`\`

## 八、仅关键字参数（Keyword-Only，\`*\`）

用 \`*\` 分隔，**之后的参数只能用关键字传，不能按位置**。

\`\`\`python
def connect(host, port, *, timeout=30, retry=3):
    """timeout 和 retry 必须用关键字传"""
    print(f"连接 {host}:{port}, timeout={timeout}, retry={retry}")

connect("localhost", 8080)  # ✅ timeout 和 retry 用默认值
connect("localhost", 8080, timeout=60)  # ✅ 用关键字覆盖
connect("localhost", 8080, 60)  # ❌ TypeError: 缺少关键字参数 timeout
# 连接的 60 是位置参数，但 timeout 是仅关键字，不能用位置传

# 为什么用仅关键字参数？
# 1. 强制调用方写明参数名，提高可读性
# 2. 将来可以在 * 后面加新参数，不破坏现有调用
# 3. 避免位置参数过多导致调用混乱
\`\`\`

## 九、参数解包

\`\`\`python
# 1. 用 * 解包列表/元组为位置参数
def add(a, b, c):
    return a + b + c

nums = [1, 2, 3]
print(add(*nums))  # 等价于 add(1, 2, 3)，返回 6

# 部分解包
print(add(*nums[:2], 100))  # add(1, 2, 100)，返回 103

# 2. 用 ** 解包字典为关键字参数
def create_user(name, age, email):
    print(f"创建用户 {name}, {age} 岁, 邮箱 {email}")

user_data = {"name": "张三", "age": 25, "email": "zs@example.com"}
create_user(**user_data)  # 等价于 create_user(name="张三", age=25, email="zs@example.com")

# 3. 混合解包
def f(a, b, c, d, e):
    print(a, b, c, d, e)

args = (1, 2)
kwargs = {"d": 4, "e": 5}
f(*args, c=3, **kwargs)  # 1 2 3 4 5

# 4. 合并字典（Python 3.5+）
d1 = {"a": 1, "b": 2}
d2 = {"b": 3, "c": 4}
merged = {**d1, **d2}  # {'a': 1, 'b': 3, 'c': 4}（d2 覆盖 d1 的同名键）
print(merged)
\`\`\`

## 十、实战：灵活的字符串格式化函数

\`\`\`python
def format_string(template, /, *args, sep=", ", end="\\n", **kwargs):
    """灵活的字符串格式化。
    
    Args:
        template: 模板字符串（仅位置）
        *args: 位置参数填充 {0}, {1}...
        sep: 分隔符（仅关键字）
        end: 结束符（仅关键字）
        **kwargs: 关键字参数填充 {name}
    """
    # 用位置参数填充
    result = template.format(*args, **kwargs)
    print(result, end=end)
    return result

# 用位置参数
format_string("你好, {0}! 我是 {1}", "张三", "李四")
# 输出：你好, 张三! 我是 李四

# 用关键字参数
format_string("你好, {name}! 你 {age} 岁了", name="王五", age=30)
# 输出：你好, 王五! 你 30 岁了

# 混合
format_string("{0} 喜欢 {hobby}", "赵六", hobby="编程")
# 输出：赵六 喜欢 编程
\`\`\`

## 十一、参数传递的"引用语义"

Python 的参数传递是**"按对象引用传递"**（pass by object reference）。理解这点很重要：

\`\`\`python
# 1. 不可变对象（数字、字符串、元组）：函数内修改不影响外部
def increment(x):
    x = x + 1  # 这创建了一个新对象，外部变量不受影响
    print(f"函数内 x = {x}")

n = 10
increment(n)  # 函数内 x = 11
print(f"函数外 n = {n}")  # 函数外 n = 10（没变）

# 2. 可变对象（列表、字典、集合）：函数内修改会影响外部
def add_item(lst, item):
    lst.append(item)  # 修改的是同一个对象

my_list = [1, 2, 3]
add_item(my_list, 4)
print(my_list)  # [1, 2, 3, 4]（变了！）

# 3. 想要避免副作用：传入副本
def safe_add_item(lst, item):
    new_lst = lst.copy()  # 创建副本
    new_lst.append(item)
    return new_lst

original = [1, 2, 3]
new_one = safe_add_item(original, 4)
print(original)  # [1, 2, 3]（没变）
print(new_one)  # [1, 2, 3, 4]

# 4. 字典同理
def update_config(config, key, value):
    config[key] = value  # 修改原字典

cfg = {"host": "localhost"}
update_config(cfg, "port", 8080)
print(cfg)  # {'host': 'localhost', 'port': 8080}
\`\`\`

## 十二、参数的反射与内省

\`\`\`python
import inspect

def example(a, b=1, *args, c, d=2, **kwargs):
    pass

# 获取参数信息
sig = inspect.signature(example)
print(sig)  # (a, b=1, *args, c, d=2, **kwargs)

# 遍历参数
for name, param in sig.parameters.items():
    print(f"{name}: kind={param.kind}, default={param.default}")

# 输出：
# a: kind=POSITIONAL_ONLY, default=<class 'inspect._empty'>
# b: kind=POSITIONAL_OR_KEYWORD, default=1
# args: kind=VAR_POSITIONAL, default=<class 'inspect._empty'>
# c: kind=KEYWORD_ONLY, default=<class 'inspect._empty'>
# d: kind=KEYWORD_ONLY, default=2
# kwargs: kind=VAR_KEYWORD, default=<class 'inspect._empty'>

# 实际用途：根据签名动态调用
def call_with_filtered_kwargs(func, **kwargs):
    """只传递函数实际接受的参数"""
    sig = inspect.signature(func)
    valid_params = set(sig.parameters.keys())
    filtered = {k: v for k, v in kwargs.items() if k in valid_params}
    return func(**filtered)

def my_func(a, b, c):
    return a + b + c

# 多传一个 d 也不会报错
print(call_with_filtered_kwargs(my_func, a=1, b=2, c=3, d=999))  # 6
\`\`\`

## 十三、参数类型对比表

| 参数类型 | 语法 | 调用方式 | 收集/解包 |
| --- | --- | --- | --- |
| 位置参数 | \`def f(a, b)\` | \`f(1, 2)\` | — |
| 关键字参数 | 同上 | \`f(a=1, b=2)\` | — |
| 默认值 | \`def f(a=1)\` | \`f()\` 或 \`f(2)\` | — |
| 可变位置 | \`def f(*args)\` | \`f(1, 2, 3)\` | 收集成元组 |
| 可变关键字 | \`def f(**kwargs)\` | \`f(a=1, b=2)\` | 收集成字典 |
| 仅位置 | \`def f(a, /)\` | \`f(1)\` | — |
| 仅关键字 | \`def f(*, a)\` | \`f(a=1)\` | — |

## 小结

本章详细介绍了 Python 函数参数的方方面面：

1. **位置参数**按顺序传，**关键字参数**按名字传，可读性更好
2. **默认值**让参数可选，但**可变默认值是经典坑**（用 None 代替）
3. **\`*args\`** 收集多余的位置参数为元组，**\`**kwargs\`** 收集多余的关键字参数为字典
4. **仅位置参数（\`/\`）** 强制按位置传，**仅关键字参数（\`*\`）** 强制按名字传
5. **参数解包**：\`*\` 解包列表，\`**\` 解包字典，让函数调用更灵活
6. **参数顺序**：\`pos_only, /, normal, *args, kw_only, **kwargs\`
7. **参数传递语义**：可变对象在函数内修改会影响外部，不可变对象不会

掌握参数，你就能写出既灵活又安全的函数 API。下一章我们深入**作用域与闭包**——这是理解 Python 函数内部变量的关键。`
  },

  // =========================================================
  // 第二十三章：作用域与闭包
  // =========================================================
  {
    id: "py10-ch23",
    group: "第五部分 函数基础",
    icon: "🌐",
    title: "第二十三章 作用域与闭包",
    content: `## 作用域：变量的"可见范围"

**作用域**决定了变量在哪些地方可以被访问。Python 用 **LEGB 规则**来查找变量，理解它对写出正确的函数至关重要——尤其是涉及嵌套函数和闭包时。

## 一、LEGB 规则

Python 查找变量时，按以下顺序依次查找：

1. **L - Local（局部作用域）**：当前函数内部
2. **E - Enclosing（嵌套作用域）**：外层函数内部
3. **G - Global（全局作用域）**：模块级别
4. **B - Built-in（内置作用域）**：Python 内置名称

\`\`\`python
# 演示 LEGB 的查找顺序

# G: 全局作用域（模块级）
x = "global x"

# B: 内置作用域
# 比如 len, print, range 等都是内置

def outer():
    # E: 嵌套作用域（outer 函数内）
    x = "enclosing x"
    
    def inner():
        # L: 局部作用域（inner 函数内）
        # 如果这里有 x = "local x"，就用局部的
        # 如果没有，就向外找，找到 enclosing 的
        print(x)  # 找到 enclosing 的 "enclosing x"
    
    inner()

outer()  # 输出：enclosing x

# 如果 inner 内部也有 x，就用局部的
def outer2():
    x = "enclosing x"
    def inner2():
        x = "local x"  # 局部变量
        print(x)  # 用局部的
    inner2()

outer2()  # 输出：local x
\`\`\`

**完整 LEGB 演示**：

\`\`\`python
# 演示完整的 LEGB 查找链
str_global = "G: 我是全局变量"

def make_outer():
    str_enclosing = "E: 我是嵌套变量"
    
    def make_inner():
        # 这里没有定义 str_local，下面三行依次向外查找
        # 1. 先在 inner 内找 str_local → 没有
        # 2. 再在 outer 内找 str_local → 没有
        # 3. 再在全局找 str_local → 没有
        # 4. 最后在 builtins 找 → 也没有 → NameError
        # print(str_local)  # ❌ NameError
        
        # 但我们能访问 enclosing 和 global
        print(str_enclosing)  # E
        print(str_global)  # G
        print(len)  # B（内置函数）
    
    return make_inner

fn = make_outer()
fn()
# 输出：
# E: 我是嵌套变量
# G: 我是全局变量
# <built-in function len>
\`\`\`

## 二、局部作用域的细节

\`\`\`python
# 1. 函数内部赋值的变量，就是局部变量
def foo():
    x = 10  # x 是 foo 的局部变量
    print(x)

foo()  # 10
# print(x)  # ❌ NameError: x 在函数外不可见

# 2. 即使在 if/for/while 内部赋值，也是函数级局部变量
def bar():
    if True:
        y = 20  # y 是 bar 的局部变量（不是 if 的局部）
    for i in range(3):
        z = i  # z 是 bar 的局部变量
    print(y, z)  # 20 2

bar()

# 3. 函数参数也是局部变量
def baz(a, b):
    print(a, b)  # a, b 是 baz 的局部变量

baz(1, 2)

# 4. ⚠️ 函数内只要有赋值，整个函数里这个变量就是局部的
total = 100
def add_to_total(n):
    # 这里 total = total + n 会报错！
    # 因为函数内有 total = ...，所以 total 被认为是局部变量
    # 但执行 total + n 时局部 total 还没赋值，所以 UnboundLocalError
    # total = total + n  # ❌ UnboundLocalError
    pass

# 5. 复合赋值也是赋值
counter = 0
def bad_increment():
    # counter += 1  # ❌ UnboundLocalError
    # 等价于 counter = counter + 1，counter 被当成局部
    pass
\`\`\`

## 三、\`global\` 关键字

要在函数内**修改全局变量**，必须用 \`global\` 声明。

\`\`\`python
# 不用 global：函数内修改不了全局
count = 0

def increment_wrong():
    count = count + 1  # ❌ UnboundLocalError

# 用 global：声明我要用全局的 count
def increment_right():
    global count  # 声明 count 是全局变量
    count = count + 1  # 修改的是全局 count

print(count)  # 0
increment_right()
print(count)  # 1
increment_right()
print(count)  # 2

# global 的合理用法：配置类全局状态
DEBUG = False

def enable_debug():
    global DEBUG
    DEBUG = True

def log(msg):
    if DEBUG:
        print(f"[DEBUG] {msg}")

log("test1")  # 不打印（DEBUG 是 False）
enable_debug()
log("test2")  # 打印 [DEBUG] test2
\`\`\`

**⚠️ 滥用 global 是反模式**：

\`\`\`python
# ❌ 反模式：到处用 global，代码难以追踪
user_id = None
user_name = None
user_email = None

def load_user():
    global user_id, user_name, user_email
    user_id = 1
    user_name = "张三"
    user_email = "zs@example.com"

def clear_user():
    global user_id, user_name, user_email
    user_id = None
    user_name = None
    user_email = None

# ✅ 更好：用类封装状态
class UserSession:
    def __init__(self):
        self.id = None
        self.name = None
        self.email = None
    
    def load(self, id, name, email):
        self.id = id
        self.name = name
        self.email = email
    
    def clear(self):
        self.id = None
        self.name = None
        self.email = None

session = UserSession()
session.load(1, "张三", "zs@example.com")
\`\`\`

## 四、\`nonlocal\` 关键字

要在**内层函数修改外层（非全局）函数的变量**，用 \`nonlocal\`。这是闭包的核心机制。

\`\`\`python
def make_counter():
    count = 0  # 外层函数的局部变量
    
    def inner():
        nonlocal count  # 声明：我要修改外层的 count
        count = count + 1
        return count
    
    return inner  # 返回内层函数

# 每次调用 make_counter() 创建独立的 count
counter1 = make_counter()
print(counter1())  # 1
print(counter1())  # 2
print(counter1())  # 3

counter2 = make_counter()  # 新的 count，从 0 开始
print(counter2())  # 1
print(counter1())  # 4（counter1 的状态独立保留）
\`\`\`

**不用 nonlocal 的后果**：

\`\`\`python
def make_counter_bad():
    count = 0
    
    def inner():
        # 不写 nonlocal，那 count = ... 创建的是局部变量
        # 不是修改外层的 count
        count = 999  # 这是 inner 的局部变量
        return count
    
    return inner

c = make_counter_bad()
print(c())  # 999
print(c())  # 999（外层 count 一直是 0，没被修改）
\`\`\`

## 五、闭包（Closure）

**闭包 = 函数 + 它记住的外层变量**。当一个内层函数引用了外层函数的变量，并被返回到外部使用，就形成了闭包。

\`\`\`python
# 最简单的闭包
def make_greeting(greeting):
    """greeting 被内层函数"记住"了"""
    def greet(name):
        # 引用了外层的 greeting，形成闭包
        return f"{greeting}, {name}!"
    return greet

# 创建两个不同的"问候函数"
hello = make_greeting("Hello")
nihao = make_greeting("你好")

# 即使 make_greeting 已经返回，greeting 变量仍然被记住
print(hello("张三"))  # Hello, 张三!
print(nihao("李四"))  # 你好, 李四!

# 每个闭包记住了自己创建时的 greeting
print(hello("王五"))  # Hello, 王五!
print(nihao("赵六"))  # 你好, 赵六!
\`\`\`

**查看闭包变量**：

\`\`\`python
def make_adder(x):
    def adder(y):
        return x + y  # 引用外层的 x
    return adder

add5 = make_adder(5)
add10 = make_adder(10)

# 查看闭包记住的变量
print(add5.__closure__)  # (<cell at 0x...: int object at 0x...>,)
print(add5.__closure__[0].cell_contents)  # 5
print(add10.__closure__[0].cell_contents)  # 10
\`\`\`

## 六、闭包的典型应用

### 应用一：计数器

\`\`\`python
def make_counter(start=0, step=1):
    """创建一个可配置的计数器"""
    count = start
    
    def counter():
        nonlocal count
        result = count
        count += step
        return result
    
    return counter

# 从 0 开始，每次 +1
c1 = make_counter()
print(c1(), c1(), c1())  # 0 1 2

# 从 10 开始，每次 +5
c2 = make_counter(start=10, step=5)
print(c2(), c2(), c2())  # 10 15 20
\`\`\`

### 应用二：缓存

\`\`\`python
def make_cached_func():
    """创建一个带缓存的函数"""
    cache = {}  # 闭包内的"私有"变量
    
    def cached_compute(key):
        if key in cache:
            print(f"命中缓存: {key}")
            return cache[key]
        print(f"计算新值: {key}")
        # 模拟耗时计算
        result = key * key
        cache[key] = result
        return result
    
    return cached_compute

compute = make_cached_func()
print(compute(3))  # 计算新值: 3 → 9
print(compute(5))  # 计算新值: 5 → 25
print(compute(3))  # 命中缓存: 3 → 9（不重新计算）

# cache 变量被闭包"私有"保护，外部无法直接访问
# print(cache)  # ❌ NameError: cache 不在全局作用域
\`\`\`

### 应用三：函数工厂

\`\`\`python
def make_power(exponent):
    """创建一个求 n 次方的函数"""
    def power(base):
        return base ** exponent
    return power

square = make_power(2)  # 平方函数
cube = make_power(3)  # 立方函数
print(square(5))  # 25
print(cube(3))  # 27

# 字符串处理工厂
def make_transformer(prefix="", suffix=""):
    def transform(text):
        return f"{prefix}{text}{suffix}"
    return transform

html_tag = make_transformer(prefix="<b>", suffix="</b>")
markdown_bold = make_transformer(prefix="**", suffix="**")

print(html_tag("重要"))  # <b>重要</b>
print(markdown_bold("重要"))  # **重要**
\`\`\`

### 应用四：状态机

\`\`\`python
def make_traffic_light():
    """简易红绿灯状态机"""
    states = ["红", "绿", "黄"]
    current = 0
    
    def next_state():
        nonlocal current
        state = states[current]
        current = (current + 1) % len(states)
        return state
    
    return next_state

light = make_traffic_light()
print(light(), light(), light(), light())  # 红 绿 黄 红
\`\`\`

## 七、闭包陷阱：循环中的延迟绑定

\`\`\`python
# ❌ 经典陷阱：循环创建闭包，所有闭包共享同一个变量
funcs = []
for i in range(3):
    funcs.append(lambda: i)  # 这个 i 引用的是循环变量

# 调用时，i 已经是 2（循环结束后的值）
print([f() for f in funcs])  # [2, 2, 2] ← 不是 [0, 1, 2]

# 原因：lambda 捕获的是变量 i 本身，不是当时的值
# 循环结束后 i = 2，所有 lambda 都返回 2

# ✅ 解决方法一：用默认参数固定当时的值
funcs = []
for i in range(3):
    funcs.append(lambda i=i: i)  # 默认参数在定义时求值

print([f() for f in funcs])  # [0, 1, 2] ✅

# ✅ 解决方法二：用工厂函数
def make_func(n):
    return lambda: n

funcs = [make_func(i) for i in range(3)]
print([f() for f in funcs])  # [0, 1, 2] ✅

# ✅ 解决方法三：用 functools.partial
from functools import partial
funcs = [partial(lambda x: x, i) for i in range(3)]
print([f() for f in funcs])  # [0, 1, 2] ✅
\`\`\`

## 八、作用域对比表

| 作用域 | 关键字 | 说明 | 访问方向 |
| --- | --- | --- | --- |
| Local (L) | 无 | 当前函数内 | 函数内可读写 |
| Enclosing (E) | \`nonlocal\` | 外层函数内 | 内层可读，修改需 nonlocal |
| Global (G) | \`global\` | 模块级 | 函数内可读，修改需 global |
| Built-in (B) | 无 | Python 内置 | 任何地方可读 |

## 九、综合示例：基于闭包的简易路由

\`\`\`python
def make_router():
    """简易路由：用闭包存储路由表"""
    routes = {}  # 私有路由表
    
    def register(path):
        """装饰器：注册路由"""
        def decorator(handler):
            routes[path] = handler
            return handler
        return decorator
    
    def dispatch(path, *args, **kwargs):
        """根据路径调用对应处理函数"""
        if path not in routes:
            return f"404: {path} not found"
        return routes[path](*args, **kwargs)
    
    def list_routes():
        return list(routes.keys())
    
    # 返回三个函数，共享同一个 routes
    return register, dispatch, list_routes

# 使用
register, dispatch, list_routes = make_router()

@register("/")
def home():
    return "首页"

@register("/about")
def about():
    return "关于我们"

@register("/user/<name>")
def user(name):
    return f"用户 {name}"

print(list_routes())  # ['/', '/about', '/user/<name>']
print(dispatch("/"))  # 首页
print(dispatch("/about"))  # 关于我们
print(dispatch("/user/张三", "张三"))  # 用户 张三
print(dispatch("/unknown"))  # 404: /unknown not found
\`\`\`

## 十、\`globals()\` 和 \`locals()\` 函数

\`\`\`python
# 查看当前作用域的所有变量
x = 10
y = 20

def show_scopes():
    a = 1
    b = 2
    print("locals:", locals())  # 当前函数的局部变量
    print("globals has x:", "x" in globals())  # 全局变量

show_scopes()
# locals: {'a': 1, 'b': 2}
# globals has x: True

# globals() 返回的字典可以修改全局变量
globals()["z"] = 999
print(z)  # 999

# locals() 在函数内修改不会影响实际变量（不推荐）
def test():
    x = 1
    locals()["x"] = 999  # 不会真正修改 x
    print(x)  # 仍然是 1

test()
\`\`\`

## 小结

本章深入讲解了 Python 的作用域与闭包：

1. **LEGB 规则**：查找变量的顺序是 Local → Enclosing → Global → Built-in
2. **\`global\`** 用于在函数内修改全局变量，但要谨慎使用
3. **\`nonlocal\`** 用于在内层函数修改外层函数的变量，是闭包的关键
4. **闭包 = 函数 + 外层变量**，常用于计数器、缓存、函数工厂、状态机
5. **循环闭包陷阱**：lambda 捕获变量本身而非值，用默认参数或工厂函数解决
6. **\`globals()\` 和 \`locals()\`** 可以查看和操作作用域字典

闭包是理解装饰器、生成器、异步等高级特性的基础。下一章我们学习 **lambda 匿名函数**——一种特殊的、简化的函数定义方式。`
  },

  // =========================================================
  // 第二十四章：匿名函数 lambda
  // =========================================================
  {
    id: "py10-ch24",
    group: "第五部分 函数基础",
    icon: "λ",
    title: "第二十四章 匿名函数 lambda",
    content: `## lambda：一行函数的"快餐"

\`lambda\` 是 Python 的**匿名函数**——没有名字、只有一行表达式、自动返回结果。它适合写**简短的、一次性的、作为参数传递**的小函数。

## 一、lambda 语法

\`\`\`python
# 语法：lambda 参数: 表达式
# 等价于 def 函数名(参数): return 表达式

# 普通函数
def square(x):
    return x * x

# 等价的 lambda
square_lambda = lambda x: x * x

print(square(5))  # 25
print(square_lambda(5))  # 25

# 多参数
add = lambda a, b: a + b
print(add(3, 4))  # 7

# 无参数
get_pi = lambda: 3.14159
print(get_pi())  # 3.14159

# 默认参数
greet = lambda name, greeting="你好": f"{greeting}, {name}!"
print(greet("张三"))  # 你好, 张三!
print(greet("李四", "嗨"))  # 嗨, 李四!

# *args 和 **kwargs
concat = lambda *args, **kwargs: "".join(args) + str(kwargs)
print(concat("a", "b", "c"))  # abc{}
\`\`\`

## 二、lambda 与 def 的对比

| 特性 | lambda | def |
| --- | --- | --- |
| 名称 | 匿名（可赋值给变量） | 有名字 |
| 函数体 | 单个表达式 | 多条语句 |
| 返回值 | 自动返回表达式结果 | 用 return 显式返回 |
| 语句 | 不能有 if/for/while/try（只能有表达式） | 任意语句 |
| 文档字符串 | 没有 | 可以有 |
| 装饰器 | 不能用 | 可以用 |
| 可读性 | 简短时好，复杂时差 | 始终清晰 |

\`\`\`python
# lambda 的限制：只能是一个表达式
# 下面这些都不行：
# lambda x: if x > 0: return x else: return -x  # ❌ 不能有 if 语句
# lambda x: for i in range(x): print(i)  # ❌ 不能有 for 语句

# 但可以用条件表达式（三元运算符）
abs_value = lambda x: x if x >= 0 else -x
print(abs_value(-5))  # 5
print(abs_value(5))  # 5

# 可以用列表推导式（它本身是表达式）
squares = lambda n: [i * i for i in range(n)]
print(squares(5))  # [0, 1, 4, 9, 16]

# 可以调用其他函数
shout = lambda s: s.upper()
print(shout("hello"))  # HELLO
\`\`\`

## 三、lambda 的核心使用场景

### 场景一：排序的 key

\`\`\`python
# 1. 按绝对值排序
nums = [-5, 3, -2, 8, -1]
sorted_nums = sorted(nums, key=lambda x: abs(x))
print(sorted_nums)  # [-1, -2, 3, -5, 8]

# 2. 按字符串长度排序
words = ["banana", "apple", "cherry", "date"]
sorted_words = sorted(words, key=lambda s: len(s))
print(sorted_words)  # ['date', 'apple', 'banana', 'cherry']

# 3. 按字典的某个字段排序
students = [
    {"name": "张三", "score": 85},
    {"name": "李四", "score": 92},
    {"name": "王五", "score": 78},
]
# 按分数降序
sorted_students = sorted(students, key=lambda s: s["score"], reverse=True)
for s in sorted_students:
    print(s["name"], s["score"])
# 李四 92
# 张三 85
# 王五 78

# 4. 多字段排序：先按分数降序，分数相同按姓名升序
sorted_multi = sorted(students, key=lambda s: (-s["score"], s["name"]))
# 用 -s["score"] 让分数降序（数值才行）
\`\`\`

### 场景二：map() —— 对每个元素做变换

\`\`\`python
# 把列表每个元素平方
nums = [1, 2, 3, 4, 5]
squares = list(map(lambda x: x ** 2, nums))
print(squares)  # [1, 4, 9, 16, 25]

# 把字符串列表转大写
words = ["hello", "world", "python"]
upper_words = list(map(str.upper, words))  # 直接传方法更简洁
print(upper_words)  # ['HELLO', 'WORLD', 'PYTHON']

# 提取字典列表的某个字段
users = [{"name": "张三", "age": 25}, {"name": "李四", "age": 30}]
names = list(map(lambda u: u["name"], users))
print(names)  # ['张三', '李四']

# 多个列表对应位置运算
a = [1, 2, 3]
b = [10, 20, 30]
sums = list(map(lambda x, y: x + y, a, b))
print(sums)  # [11, 22, 33]
\`\`\`

### 场景三：filter() —— 过滤

\`\`\`python
# 过滤偶数
nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = list(filter(lambda x: x % 2 == 0, nums))
print(evens)  # [2, 4, 6, 8, 10]

# 过滤非空字符串
words = ["hello", "", "world", None, "python", "  "]
non_empty = list(filter(lambda s: s and s.strip(), words))
print(non_empty)  # ['hello', 'world', 'python']

# 过滤符合条件的字典
users = [
    {"name": "张三", "age": 17},
    {"name": "李四", "age": 25},
    {"name": "王五", "age": 15},
    {"name": "赵六", "age": 30},
]
adults = list(filter(lambda u: u["age"] >= 18, users))
print([u["name"] for u in adults])  # ['李四', '赵六']
\`\`\`

### 场景四：sorted / min / max 的 key

\`\`\`python
# 找最大/最小的元素
nums = [3, 1, 4, 1, 5, 9, 2, 6]
print(max(nums, key=lambda x: -x))  # 找"最大的负数"对应的最大原数
print(min(nums))  # 1
print(max(nums))  # 9

# 找字符串列表中"最长"的
words = ["apple", "banana", "kiwi", "strawberry"]
longest = max(words, key=lambda s: len(s))
print(longest)  # strawberry

# 找字典列表中分数最高的
students = [{"name": "张三", "score": 85}, {"name": "李四", "score": 92}]
top = max(students, key=lambda s: s["score"])
print(top["name"])  # 李四
\`\`\`

### 场景五：作为回调函数

\`\`\`python
# GUI 编程中常用 lambda 作为回调
# 下面是模拟示例
class Button:
    def __init__(self, text):
        self.text = text
        self.callback = None
    
    def on_click(self, callback):
        self.callback = callback
    
    def click(self):
        if self.callback:
            self.callback()

btn = Button("提交")
# 用 lambda 作为回调
btn.on_click(lambda: print("按钮被点击了！"))
btn.click()  # 输出：按钮被点击了！

# 带参数的回调
def create_button(text, action):
    btn = Button(text)
    btn.on_click(lambda: print(f"执行: {action}"))
    return btn

b1 = create_button("保存", "save_data")
b2 = create_button("删除", "delete_data")
b1.click()  # 执行: save_data
b2.click()  # 执行: delete_data
\`\`\`

## 四、lambda 的常见陷阱

### 陷阱一：循环中捕获变量（同闭包陷阱）

\`\`\`python
# ❌ 错误：所有 lambda 都引用同一个 i
funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])  # [2, 2, 2]

# ✅ 正确：用默认参数固定当时的值
funcs = [lambda i=i: i for i in range(3)]
print([f() for f in funcs])  # [0, 1, 2]
\`\`\`

### 陷阱二：试图在 lambda 里写语句

\`\`\`python
# ❌ lambda 不能有赋值、print、if 语句
# f = lambda x: print(x); x * 2  # 语法错误

# ✅ 用 def 替代
def f(x):
    print(x)
    return x * 2

# 如果一定要"打印并返回"，可以用 := 海象运算符（Python 3.8+）
f = lambda x: (print(x), x * 2)[1]  # 丑陋但能工作
# 不推荐这样写，用 def 更清晰
\`\`\`

### 陷阱三：lambda 过于复杂

\`\`\`python
# ❌ 不好的写法：lambda 太复杂，可读性差
process = lambda data: sorted([x * 2 for x in data if x > 0], reverse=True)[:3]
print(process([1, -2, 3, 4, -5, 6]))  # [12, 8, 6]

# ✅ 改用 def，加注释和中间变量
def process(data):
    """取正数，每个乘 2，降序，取前 3"""
    positives = [x for x in data if x > 0]
    doubled = [x * 2 for x in positives]
    sorted_desc = sorted(doubled, reverse=True)
    return sorted_desc[:3]

print(process([1, -2, 3, 4, -5, 6]))  # [12, 8, 6]
\`\`\`

## 五、什么时候用 lambda，什么时候用 def

**用 lambda 的场景**：
- 作为 \`sorted\`、\`map\`、\`filter\`、\`max\`、\`min\` 的 key 参数
- 一次性使用的简短函数
- 不需要复用、不需要文档的场景
- 函数体只有一行简单表达式

**用 def 的场景**：
- 函数需要复用
- 逻辑复杂，超过一行
- 需要文档字符串
- 需要装饰器
- 需要循环、异常处理、多语句

\`\`\`python
# ✅ 适合 lambda：简短、一次性
students.sort(key=lambda s: s["score"])
nums = list(map(lambda x: x ** 2, range(10)))

# ✅ 适合 def：复杂、复用
def calculate_grade(score):
    """根据分数计算等级"""
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    elif score >= 60:
        return "D"
    else:
        return "F"

# ✅ 适合 def：需要文档和复用
def parse_config_line(line):
    """解析配置文件的一行。
    
    格式: key=value 或 key:value
    忽略注释（# 开头）和空行
    
    Returns:
        (key, value) 元组，或 None
    """
    line = line.strip()
    if not line or line.startswith("#"):
        return None
    if "=" in line:
        key, value = line.split("=", 1)
    elif ":" in line:
        key, value = line.split(":", 1)
    else:
        return None
    return key.strip(), value.strip()
\`\`\`

## 六、lambda 与函数式编程

\`\`\`python
# 1. 函数组合：把多个 lambda 串起来
compose = lambda f, g: lambda x: f(g(x))

# f(g(x))：先加 1，再平方
add1 = lambda x: x + 1
square = lambda x: x * x
add1_then_square = compose(square, add1)

print(add1_then_square(3))  # (3+1)^2 = 16

# 2. 部分应用：固定部分参数
from functools import partial

def multiply(x, y, z):
    return x * y * z

# 固定前两个参数
double_triple = partial(multiply, 2, 3)
print(double_triple(4))  # 2 * 3 * 4 = 24

# 用 lambda 实现部分应用
multiply_by_6 = lambda z: multiply(2, 3, z)
print(multiply_by_6(4))  # 24

# 3. 链式处理：用 lambda 做 pipeline
def pipeline(*functions):
    """把多个函数串联成一个"""
    def piped(x):
        result = x
        for func in functions:
            result = func(result)
        return result
    return piped

# 数据处理流水线
process = pipeline(
    lambda s: s.strip(),  # 去空格
    lambda s: s.lower(),  # 转小写
    lambda s: s.replace(" ", "_"),  # 空格换下划线
    lambda s: f"_{s}_"  # 加前后缀
)

print(process("  Hello World  "))  # _hello_world_
\`\`\`

## 七、字典中的 lambda：策略模式

\`\`\`python
# 用字典 + lambda 实现策略模式
def calculate(operation, a, b):
    """根据操作符计算"""
    operations = {
        "add": lambda x, y: x + y,
        "sub": lambda x, y: x - y,
        "mul": lambda x, y: x * y,
        "div": lambda x, y: x / y if y != 0 else None,
        "pow": lambda x, y: x ** y,
    }
    if operation not in operations:
        raise ValueError(f"未知操作: {operation}")
    return operations[operation](a, b)

print(calculate("add", 3, 4))  # 7
print(calculate("mul", 3, 4))  # 12
print(calculate("div", 10, 2))  # 5.0
print(calculate("pow", 2, 10))  # 1024

# 比写一堆 if-elif 更清晰
def calculate_bad(op, a, b):
    if op == "add":
        return a + b
    elif op == "sub":
        return a - b
    elif op == "mul":
        return a * b
    # ... 又臭又长
\`\`\`

## 八、lambda 的替代方案

\`\`\`python
# 1. 用 operator 模块替代简单 lambda
import operator

nums = [1, 2, 3]
# 不用 lambda
sums = list(map(lambda x, y: x + y, nums, nums))
# 用 operator.add
sums = list(map(operator.add, nums, nums))

# 排序时
words = ["apple", "Banana", "cherry"]
# 不用 lambda
words.sort(key=lambda s: s.lower())
# 用 operator.methodcaller
words.sort(key=operator.methodcaller("lower"))
# 或用 str.lower（最简洁）
words.sort(key=str.lower)

# 2. 用 itemgetter 取字典字段
from operator import itemgetter

students = [{"name": "张三", "score": 85}, {"name": "李四", "score": 92}]
# 不用 lambda
sorted_students = sorted(students, key=lambda s: s["score"])
# 用 itemgetter
sorted_students = sorted(students, key=itemgetter("score"))

# itemgetter 还能取多个字段
top = max(students, key=itemgetter("score"))
print(itemgetter("name", "score")(top))  # ('李四', 92)

# 3. 用 attrgetter 取对象属性
from operator import attrgetter

class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score

objs = [Student("张三", 85), Student("李四", 92)]
top = max(objs, key=attrgetter("score"))
print(top.name)  # 李四
\`\`\`

## 九、性能对比

\`\`\`python
import timeit

# lambda 和 def 的性能几乎一样
lambda_time = timeit.timeit("f(5)", globals={"f": lambda x: x * x}, number=1000000)
def_time = timeit.timeit("f(5)", globals={"f": lambda x: x * x}, number=1000000)

print(f"lambda: {lambda_time:.4f}s")
print(f"def: {def_time:.4f}s")
# 通常差距在 5% 以内，可以忽略

# 列表推导 vs map+lambda
nums = list(range(1000))

# 列表推导通常更快
listcomp_time = timeit.timeit("[x*x for x in nums]", globals={"nums": nums}, number=10000)
maplambda_time = timeit.timeit("list(map(lambda x: x*x, nums))", globals={"nums": nums}, number=10000)

print(f"列表推导: {listcomp_time:.4f}s")
print(f"map+lambda: {maplambda_time:.4f}s")
# 列表推导通常快 20-30%
\`\`\`

## 十、综合示例：数据处理管道

\`\`\`python
# 模拟数据处理：从原始数据到最终报表
raw_data = [
    "  zhang san, 25, beijing  ",
    "li si, 30, shanghai",
    "  wang wu, 28, guangzhou",
    "",
    "zhao liu, 22, shenzhen",
]

# 步骤 1：过滤空行
step1 = filter(lambda s: s.strip(), raw_data)

# 步骤 2：去除两端空格
step2 = map(str.strip, step1)

# 步骤 3：按逗号分割
step3 = map(lambda s: s.split(","), step2)

# 步骤 4：清理每个字段
step4 = map(lambda parts: [p.strip() for p in parts], step3)

# 步骤 5：转成字典
step5 = map(lambda parts: {
    "name": parts[0].title(),
    "age": int(parts[1]),
    "city": parts[2].title(),
}, step4)

# 步骤 6：按年龄排序
result = sorted(step5, key=lambda u: u["age"])

for user in result:
    print(user)
# 输出：
# {'name': 'Zhao Liu', 'age': 22, 'city': 'Shenzhen'}
# {'name': 'Zhang San', 'age': 25, 'city': 'Beijing'}
# {'name': 'Wang Wu', 'age': 28, 'city': 'Guangzhou'}
# {'Name': 'Li Si', 'age': 30, 'city': 'Shanghai'}
\`\`\`

## 小结

本章介绍了 Python 的 lambda 匿名函数：

1. **语法**：\`lambda 参数: 表达式\`，只能一个表达式，自动返回
2. **典型场景**：\`sorted/map/filter/max/min\` 的 key 参数、回调函数、策略字典
3. **vs def**：lambda 简短无文档，def 灵活可读；复杂逻辑用 def
4. **陷阱**：循环捕获变量（用默认参数解决）、不能写语句、过于复杂时改 def
5. **替代方案**：\`operator\` 模块（\`add\`、\`itemgetter\`、\`attrgetter\`）更高效
6. **性能**：lambda 和 def 性能相当，列表推导通常比 \`map+lambda\` 快

记住：**lambda 是工具，不是目的**。不要为了用 lambda 而用 lambda——当一行 lambda 让代码更清晰时就用，否则用 def。下一章我们将学习**高阶函数与函数式编程**，进一步探索 Python 的函数式能力。`
  },

  // =========================================================
  // 第二十五章：高阶函数与函数式编程
  // =========================================================
  {
    id: "py10-ch25",
    group: "第五部分 函数基础",
    icon: "🧙",
    title: "第二十五章 高阶函数与函数式编程",
    content: `## 高阶函数：把函数当作数据

**高阶函数**是接收函数作为参数、或返回函数的函数。这是函数式编程的核心思想：**函数是一等公民，可以像数据一样传递**。Python 虽然不是纯函数式语言，但提供了丰富的高阶函数支持。

## 一、函数作为参数

\`\`\`python
# 把函数作为参数传递
def apply_operation(func, x, y):
    """把 func 应用到 x 和 y 上"""
    return func(x, y)

# 定义几个操作
def add(a, b):
    return a + b

def multiply(a, b):
    return a * b

def power(a, b):
    return a ** b

# 同一个 apply_operation，传入不同的函数，行为完全不同
print(apply_operation(add, 3, 4))  # 7
print(apply_operation(multiply, 3, 4))  # 12
print(apply_operation(power, 2, 10))  # 1024

# 内置函数也能传
print(apply_operation(max, 3, 4))  # 4
print(apply_operation(min, 3, 4))  # 3

# 实际应用：根据配置选择不同的算法
def bubble_sort(lst):
    """冒泡排序（教学用）"""
    result = lst.copy()
    for i in range(len(result)):
        for j in range(len(result) - i - 1):
            if result[j] > result[j + 1]:
                result[j], result[j + 1] = result[j + 1], result[j]
    return result

def quick_sort(lst):
    """快速排序"""
    if len(lst) <= 1:
        return lst.copy()
    pivot = lst[0]
    less = [x for x in lst[1:] if x <= pivot]
    greater = [x for x in lst[1:] if x > pivot]
    return quick_sort(less) + [pivot] + quick_sort(greater)

# 根据需要选择排序算法
def sort_data(data, algorithm=quick_sort):
    return algorithm(data)

print(sort_data([3, 1, 4, 1, 5, 9, 2, 6]))  # 用快速排序
print(sort_data([3, 1, 4, 1, 5, 9, 2, 6], algorithm=bubble_sort))  # 用冒泡排序
\`\`\`

## 二、函数作为返回值

\`\`\`python
# 返回函数：函数工厂
def make_multiplier(factor):
    """返回一个乘法函数"""
    def multiply(x):
        return x * factor
    return multiply

times2 = make_multiplier(2)
times3 = make_multiplier(3)
times10 = make_multiplier(10)

print(times2(5))  # 10
print(times3(5))  # 15
print(times10(5))  # 50

# 用 lambda 简化
def make_multiplier_v2(factor):
    return lambda x: x * factor

# 实际应用：日志器工厂
def make_logger(level):
    """创建不同级别的日志函数"""
    def log(message):
        print(f"[{level}] {message}")
    return log

info = make_logger("INFO")
warning = make_logger("WARN")
error = make_logger("ERROR")

info("应用启动")
warning("内存使用率 80%")
error("数据库连接失败")
\`\`\`

## 三、\`map()\`：映射变换

\`\`\`python
# map(func, iterable) 对每个元素应用 func，返回迭代器
nums = [1, 2, 3, 4, 5]

# 平方
squares = list(map(lambda x: x ** 2, nums))
print(squares)  # [1, 4, 9, 16, 25]

# 字符串转大写
words = ["hello", "world"]
uppers = list(map(str.upper, words))
print(uppers)  # ['HELLO', 'WORLD']

# 多个可迭代对象
a = [1, 2, 3]
b = [10, 20, 30]
c = [100, 200, 300]
sums = list(map(lambda x, y, z: x + y + z, a, b, c))
print(sums)  # [111, 222, 333]

# map 返回的是迭代器，可以节省内存
m = map(str, range(10))
print(m)  # <map object at 0x...>
print(list(m))  # ['0', '1', ..., '9']
# 迭代器只能遍历一次
print(list(m))  # [] ← 已经"耗尽"了

# map vs 列表推导
# 列表推导通常更 Pythonic
squares_listcomp = [x ** 2 for x in nums]
# 但 map 在链式调用时更清晰
result = list(map(str, map(lambda x: x * 2, nums)))
print(result)  # ['2', '4', '6', '8', '10']
\`\`\`

## 四、\`filter()\`：过滤

\`\`\`python
# filter(func, iterable) 保留 func 返回 True 的元素
nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# 偶数
evens = list(filter(lambda x: x % 2 == 0, nums))
print(evens)  # [2, 4, 6, 8, 10]

# 大于 5
big = list(filter(lambda x: x > 5, nums))
print(big)  # [6, 7, 8, 9, 10]

# 过滤 None 和空字符串
items = ["hello", "", None, "world", 0, False, "python"]
# 注意：filter(None, ...) 会过滤掉所有 falsy 值
truthy = list(filter(None, items))
print(truthy)  # ['hello', 'world', 'python']（0 和 False 也被过滤了）

# 自定义过滤条件
def is_valid_email(s):
    return "@" in s and "." in s.split("@")[-1]

emails = ["zs@example.com", "invalid", "ls@test.org", "@nodomain", "ok@."]
valid = list(filter(is_valid_email, emails))
print(valid)  # ['zs@example.com', 'ls@test.org']

# filter vs 列表推导
# 列表推导更 Pythonic
evens_listcomp = [x for x in nums if x % 2 == 0]
\`\`\`

## 五、\`reduce()\`：归约

\`\`\`python
from functools import reduce

# reduce(func, iterable, initial) 把列表"归约"成一个值
# 流程：func(func(func(initial, x1), x2), x3) ...

# 求和
nums = [1, 2, 3, 4, 5]
total = reduce(lambda x, y: x + y, nums, 0)
print(total)  # 15

# 求积
product = reduce(lambda x, y: x * y, nums, 1)
print(product)  # 120

# 找最大值
maximum = reduce(lambda x, y: x if x > y else y, nums)
print(maximum)  # 5

# 不提供 initial 时，第一个元素作为初始值
total2 = reduce(lambda x, y: x + y, nums)
print(total2)  # 15

# 空列表 + 无 initial 会报错
# reduce(lambda x, y: x + y, [])  # ❌ TypeError

# 实际应用：扁平化嵌套列表
nested = [[1, 2], [3, 4], [5, 6]]
flat = reduce(lambda a, b: a + b, nested, [])
print(flat)  # [1, 2, 3, 4, 5, 6]

# 更 Pythonic 的写法
flat2 = [x for sublist in nested for x in sublist]
print(flat2)  # [1, 2, 3, 4, 5, 6]

# 实际应用：把键值对列表转成字典
pairs = [("a", 1), ("b", 2), ("c", 3)]
d = reduce(lambda acc, kv: {**acc, kv[0]: kv[1]}, pairs, {})
print(d)  # {'a': 1, 'b': 2, 'c': 3}

# 更 Pythonic：直接 dict(pairs)
d2 = dict(pairs)
print(d2)  # {'a': 1, 'b': 2, 'c': 3}
\`\`\`

## 六、\`functools.partial\`：部分应用

\`\`\`python
from functools import partial

# partial 固定函数的部分参数，返回新函数
def power(base, exponent):
    return base ** exponent

# 固定 exponent
square = partial(power, exponent=2)
cube = partial(power, exponent=3)
print(square(5))  # 25
print(cube(2))  # 8

# 固定 base
power_of_2 = partial(power, 2)
print(power_of_2(10))  # 1024
print(power_of_2(20))  # 1048576

# 实际应用：简化常用调用
def log(level, message, source="app"):
    print(f"[{level}] [{source}] {message}")

# 创建不同级别的日志函数
info = partial(log, "INFO")
warn = partial(log, "WARN")
error = partial(log, "ERROR", source="critical")

info("启动应用")  # [INFO] [app] 启动应用
warn("内存偏高")  # [WARN] [app] 内存偏高
error("磁盘满")  # [ERROR] [critical] 磁盘满

# 实际应用：配置 int 函数
# int(x, base) 把字符串按 base 进制转成整数
# 创建"二进制转整数"的函数
int2 = partial(int, base=2)
print(int2("1010"))  # 10
print(int2("1111"))  # 15

# 创建"十六进制转整数"的函数
int16 = partial(int, base=16)
print(int16("FF"))  # 255
print(int16("10"))  # 16
\`\`\`

## 七、函数组合

\`\`\`python
# 函数组合：f(g(h(x)))
def compose(*functions):
    """把多个函数组合成一个：compose(f, g, h)(x) = f(g(h(x)))"""
    def composed(x):
        result = x
        # 从右往左应用
        for func in reversed(functions):
            result = func(result)
        return result
    return composed

# 定义几个简单函数
add_one = lambda x: x + 1
square = lambda x: x * x
double = lambda x: x * 2

# 组合：先加 1，再平方，再乘 2
# 即：double(square(add_one(x)))
transform = compose(double, square, add_one)
print(transform(3))  # 2 * (3+1)^2 = 32

# 另一种写法：从左往右（管道风格）
def pipe(*functions):
    """从左往右应用：pipe(f, g, h)(x) = h(g(f(x)))"""
    def piped(x):
        result = x
        for func in functions:
            result = func(result)
        return result
    return piped

# 管道：先加 1，再平方，再乘 2
pipeline = pipe(add_one, square, double)
print(pipeline(3))  # (3+1)^2 * 2 = 32

# 实际应用：数据处理管道
data = "  Hello, World!  "
clean = pipe(
    str.strip,  # 去空格
    str.lower,  # 转小写
    lambda s: s.replace(",", ""),  # 去逗号
    lambda s: s.replace(" ", "_"),  # 空格换下划线
)
print(clean(data))  # hello_world!
\`\`\`

## 八、纯函数与副作用

\`\`\`python
# 纯函数：相同的输入永远得到相同的输出，不修改外部状态
def pure_add(a, b):
    """纯函数：不依赖也不修改外部状态"""
    return a + b

print(pure_add(2, 3))  # 5
print(pure_add(2, 3))  # 5（永远 5）

# 有副作用的函数：修改了外部状态
total = 0
def impure_add(n):
    """有副作用：修改了全局变量 total"""
    global total
    total += n
    return total

print(impure_add(5))  # 5
print(impure_add(5))  # 10（同样的输入，结果不同！）

# 有副作用的函数：修改了输入参数
def impure_append(lst, item):
    """有副作用：修改了输入的列表"""
    lst.append(item)
    return lst

my_list = [1, 2, 3]
impure_append(my_list, 4)
print(my_list)  # [1, 2, 3, 4] ← 原列表被改了

# 纯函数版本：返回新列表，不改原列表
def pure_append(lst, item):
    """纯函数：返回新列表"""
    return lst + [item]

my_list = [1, 2, 3]
new_list = pure_append(my_list, 4)
print(my_list)  # [1, 2, 3] ← 原列表没变
print(new_list)  # [1, 2, 3, 4]
\`\`\`

**纯函数的好处**：

\`\`\`python
# 1. 可测试：不需要 mock 任何外部状态
def calculate_discount(price, rate):
    """纯函数：好测试"""
    return price * (1 - rate)

# 测试直接、确定
assert calculate_discount(100, 0.2) == 80
assert calculate_discount(50, 0.5) == 25

# 2. 可缓存：相同输入必然相同输出
from functools import lru_cache

@lru_cache(maxsize=128)
def expensive_pure_func(n):
    """纯函数 + 缓存 = 飞快"""
    # 假设这是个耗时计算
    return sum(i * i for i in range(n))

print(expensive_pure_func(1000))  # 第一次：计算
print(expensive_pure_func(1000))  # 第二次：直接返回缓存

# 3. 可并行：没有共享状态，线程安全
# （Python 有 GIL，但概念上纯函数可以并行）
\`\`\`

## 九、不可变数据

\`\`\`python
# 函数式编程偏好不可变数据
# 1. 用元组代替列表
point = (3, 4)  # 不可变
# point[0] = 5  # ❌ TypeError

# 2. 用 frozenset 代替 set
unique_nums = frozenset([1, 2, 3])
# unique_nums.add(4)  # ❌ AttributeError

# 3. 字符串本就是不可变的
s = "hello"
new_s = s.upper()  # 返回新字符串，不改原字符串
print(s)  # hello
print(new_s)  # HELLO

# 4. 函数式风格的列表操作：不改原列表，返回新列表
def add_one_to_all(nums):
    """返回新列表，不改原列表"""
    return [n + 1 for n in nums]

original = [1, 2, 3]
updated = add_one_to_all(original)
print(original)  # [1, 2, 3] ← 没变
print(updated)  # [2, 3, 4]

# 对比命令式风格：直接修改
def add_one_to_all_impure(nums):
    """直接修改原列表（不推荐）"""
    for i in range(len(nums)):
        nums[i] += 1
    return nums

original = [1, 2, 3]
add_one_to_all_impure(original)
print(original)  # [2, 3, 4] ← 变了
\`\`\`

## 十、迭代器与惰性求值

\`\`\`python
# 函数式风格偏好惰性求值：用迭代器，按需计算
# 1. map、filter 返回迭代器
nums = range(1000000)  # range 本身就是惰性的
result = map(lambda x: x * 2, nums)  # 不会立即计算 100 万个
print(result)  # <map object>
# 只有遍历时才计算
print(next(result))  # 0
print(next(result))  # 2

# 2. 生成器表达式（惰性版本列表推导）
squares_list = [x ** 2 for x in range(1000000)]  # 立即创建 100 万元素
squares_gen = (x ** 2 for x in range(1000000))  # 几乎不占内存
print(squares_gen)  # <generator object>
print(next(squares_gen))  # 0
print(next(squares_gen))  # 1

# 3. 链式惰性操作
def process_stream(data):
    """惰性处理数据流"""
    # 三个操作都不会立即执行
    filtered = filter(lambda x: x > 0, data)  # 过滤
    mapped = map(lambda x: x * 2, filtered)  # 变换
    taken = (x for i, x in enumerate(mapped) if i < 10)  # 取前 10
    return taken

# 处理超大范围，但只取前 10 个结果
result = process_stream(range(-1000000, 1000000))
print(list(result))  # [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
# 实际只计算了必要的部分
\`\`\`

## 十一、\`functools\` 常用工具

\`\`\`python
from functools import lru_cache, reduce, partial, wraps, singledispatch

# 1. lru_cache：LRU 缓存（纯函数自动缓存结果）
@lru_cache(maxsize=128)
def fibonacci(n):
    """缓存让递归飞快"""
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(100))  # 瞬间算出（不缓存的话会爆炸）

# 查看缓存信息
print(fibonacci.cache_info())  # CacheInfo(hits=99, misses=101, ...)

# 2. singledispatch：基于第一个参数类型的分派
@singledispatch
def process(data):
    """默认实现"""
    return f"未知类型: {type(data)}"

@process.register(int)
def _(data):
    return f"整数: {data}"

@process.register(str)
def _(data):
    return f"字符串: {data!r}"

@process.register(list)
def _(data):
    return f"列表，长度 {len(data)}"

print(process(42))  # 整数: 42
print(process("hello"))  # 字符串: 'hello'
print(process([1, 2, 3]))  # 列表，长度 3
print(process(3.14))  # 未知类型: <class 'float'>

# 3. wraps：保留被装饰函数的元信息（装饰器必备）
def my_decorator(func):
    @wraps(func)  # 不加的话，被装饰函数的 __name__ 等会丢失
    def wrapper(*args, **kwargs):
        print(f"调用 {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

@my_decorator
def greet(name):
    """问候函数"""
    return f"Hello, {name}!"

print(greet.__name__)  # greet（如果没有 @wraps，会是 wrapper）
print(greet.__doc__)  # 问候函数
\`\`\`

## 十二、\`itertools\` 简介

\`\`\`python
import itertools

# 1. chain：串联多个迭代器
a = [1, 2, 3]
b = [4, 5, 6]
c = [7, 8, 9]
chained = list(itertools.chain(a, b, c))
print(chained)  # [1, 2, 3, 4, 5, 6, 7, 8, 9]

# 2. count：无限计数
for i, n in enumerate(itertools.count(10, 2)):
    if i >= 5:
        break
    print(n, end=" ")  # 10 12 14 16 18
print()

# 3. cycle：无限循环
counter = 0
for item in itertools.cycle(["红", "绿", "黄"]):
    if counter >= 7:
        break
    print(item, end=" ")  # 红 绿 黄 红 绿 黄 红
    counter += 1
print()

# 4. groupby：分组（需要先排序）
data = [("A", 1), ("A", 2), ("B", 3), ("B", 4), ("A", 5)]
data_sorted = sorted(data, key=lambda x: x[0])  # groupby 要求输入已排序
for key, group in itertools.groupby(data_sorted, key=lambda x: x[0]):
    print(f"{key}: {list(group)}")
# A: [('A', 1), ('A', 2), ('A', 5)]
# B: [('B', 3), ('B', 4)]

# 5. combinations / permutations：组合排列
print(list(itertools.combinations([1, 2, 3, 4], 2)))  # C(4,2) = 6 种
print(list(itertools.permutations([1, 2, 3], 2)))  # A(3,2) = 6 种

# 6. product：笛卡尔积
print(list(itertools.product([1, 2], ["a", "b"])))
# [(1, 'a'), (1, 'b'), (2, 'a'), (2, 'b')]
\`\`\`

## 十三、综合示例：函数式数据处理

\`\`\`python
from functools import reduce
import itertools

# 模拟电商订单数据
orders = [
    {"id": 1, "customer": "Alice", "amount": 100, "category": "book"},
    {"id": 2, "customer": "Bob", "amount": 200, "category": "electronic"},
    {"id": 3, "customer": "Alice", "amount": 50, "category": "book"},
    {"id": 4, "customer": "Charlie", "amount": 300, "category": "book"},
    {"id": 5, "customer": "Bob", "amount": 150, "category": "electronic"},
    {"id": 6, "customer": "Alice", "amount": 80, "category": "food"},
]

# 需求：计算每个客户的总消费，找出消费最高的客户

# 步骤 1：按客户分组（用 groupby 需要先排序）
sorted_orders = sorted(orders, key=lambda o: o["customer"])

# 步骤 2：分组
grouped = itertools.groupby(sorted_orders, key=lambda o: o["customer"])

# 步骤 3：每组求和
customer_totals = {
    customer: reduce(lambda total, o: total + o["amount"], orders_list, 0)
    for customer, orders_list in grouped
}

print("客户消费总额:")
for customer, total in customer_totals.items():
    print(f"  {customer}: ${total}")

# 步骤 4：找消费最高的
top_customer = max(customer_totals.items(), key=lambda x: x[1])
print(f"\\n消费最高的客户: {top_customer[0]} (${top_customer[1]})")

# 用更函数式的方式写：组合 map/filter/reduce
def get_total_per_customer(orders):
    """计算每个客户的总消费"""
    sorted_orders = sorted(orders, key=lambda o: o["customer"])
    grouped = itertools.groupby(sorted_orders, key=lambda o: o["customer"])
    return dict(map(
        lambda kv: (kv[0], reduce(lambda t, o: t + o["amount"], kv[1], 0)),
        grouped
    ))

print(get_total_per_customer(orders))

# 类似的：按品类统计销量
def get_total_per_category(orders):
    """计算每个品类的总销售额"""
    sorted_orders = sorted(orders, key=lambda o: o["category"])
    grouped = itertools.groupby(sorted_orders, key=lambda o: o["category"])
    return dict(map(
        lambda kv: (kv[0], reduce(lambda t, o: t + o["amount"], list(kv[1]), 0)),
        grouped
    ))

print("品类销售总额:", get_total_per_category(orders))
\`\`\`

## 十四、函数式 vs 命令式

\`\`\`python
# 同一个需求，两种风格对比
nums = [1, -2, 3, -4, 5, -6, 7, 8, -9, 10]

# 需求：取正数，每个乘 2，求和

# 命令式风格：用循环
def imperative_style(nums):
    total = 0
    for n in nums:
        if n > 0:
            total += n * 2
    return total

# 函数式风格：用 filter + map + reduce
def functional_style(nums):
    from functools import reduce
    positives = filter(lambda x: x > 0, nums)
    doubled = map(lambda x: x * 2, positives)
    return reduce(lambda x, y: x + y, doubled, 0)

# Pythonic 风格：用生成器表达式
def pythonic_style(nums):
    return sum(n * 2 for n in nums if n > 0)

print(imperative_style(nums))  # 68
print(functional_style(nums))  # 68
print(pythonic_style(nums))  # 68

# 三种风格各有适用场景：
# - 命令式：逻辑复杂、需要提前 break/continue 时
# - 函数式：数据流水线、可并行时
# - Pythonic：日常 80% 场景，简洁清晰
\`\`\`

## 十五、高阶函数一览表

| 函数 | 作用 | 示例 |
| --- | --- | --- |
| \`map(f, it)\` | 对每个元素应用 f | \`map(str.upper, words)\` |
| \`filter(f, it)\` | 保留 f 为 True 的元素 | \`filter(lambda x: x > 0, nums)\` |
| \`reduce(f, it, init)\` | 归约成单值 | \`reduce(lambda a, b: a + b, nums, 0)\` |
| \`sorted(it, key=f)\` | 按 f 排序 | \`sorted(students, key=lambda s: s["score"])\` |
| \`max/min(it, key=f)\` | 按 f 找极值 | \`max(words, key=len)\` |
| \`partial(f, *args)\` | 固定部分参数 | \`partial(int, base=2)\` |
| \`lru_cache\` | 自动缓存 | \`@lru_cache(maxsize=128)\` |
| \`singledispatch\` | 按类型分派 | \`@process.register(int)\` |

## 小结

本章深入讲解了 Python 的高阶函数与函数式编程：

1. **高阶函数**：接收函数作为参数或返回函数的函数
2. **三大神器**：\`map\`（映射）、\`filter\`（过滤）、\`reduce\`（归约）
3. **\`partial\`**：固定函数的部分参数，创建新函数
4. **函数组合**：\`compose\` / \`pipe\` 把多个函数串成管道
5. **纯函数**：相同输入永远相同输出，无副作用，可测试、可缓存、可并行
6. **不可变数据**：用元组、frozenset，函数返回新对象而非修改原对象
7. **\`functools\`**：\`lru_cache\`、\`singledispatch\`、\`wraps\`、\`partial\`、\`reduce\`
8. **\`itertools\`**：\`chain\`、\`count\`、\`cycle\`、\`groupby\`、\`combinations\` 等高效迭代工具

Python 不是纯函数式语言，但吸收了函数式编程的精华。在日常开发中，**优先用列表推导/生成器表达式**（更 Pythonic），需要链式处理或复用逻辑时再用 \`map\`/\`filter\`/\`reduce\`。掌握高阶函数，你的代码会更简洁、更可复用、更容易测试。下一章我们将进入**函数进阶**部分，学习递归与算法。`
  }
];

export { chapters };
