// =============================================================
// Python 面向对象教程（pyobject）—— 第一批章节
// -------------------------------------------------------------
// 专注讲解 Python 面向对象编程（OOP）的核心概念与日常开发应用。
// 共 24 章，分 5 批：
//   batch1（1-4章）：   基础概念
//   batch2（5-9章）：   三大特性
//   batch3（10-14章）： 魔术方法
//   batch4（15-19章）： 进阶特性
//   batch5（20-24章）： 实战项目
//
// 每个章节包含：
//   id      : 唯一标识
//   group   : 分组名
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解（含表格、代码块、列表）
//   code    : 可运行、带详细中文注释的 Python 示例代码
//
// 代码运行环境约束：
//   - 用 python3 直接运行（推荐 3.7+）
//   - 优先使用 Python 标准库
//   - 所有 demo 单文件可独立运行
//   - 用 print 输出结果
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：为什么要用面向对象？OOP vs 过程式
  // =========================================================
  {
    id: "po-01",
    group: "基础概念",
    icon: "🎯",
    title: "为什么要用面向对象？OOP vs 过程式",
    content: `## 一、一个生活中的例子

**场景：你要描述一只狗**

- **过程式**：用函数和变量
  \`\`\`python
  dog_name = "旺财"
  dog_age = 3
  def dog_bark():
      print("汪汪！")
  \`\`\`

- **面向对象**：用"类"把数据和行为打包
  \`\`\`python
  class Dog:
      def __init__(self, name, age):
          self.name = name
          self.age = age
      def bark(self):
          print("汪汪！")
  
  dog = Dog("旺财", 3)
  dog.bark()
  \`\`\`

## 二、OOP 的 4 大好处

| 好处 | 说明 |
|------|------|
| **封装** | 数据和行为放一起 |
| **继承** | 复用父类代码 |
| **多态** | 同一接口不同实现 |
| **抽象** | 隐藏复杂细节 |

## 三、过程式 vs 面向对象

### 过程式：函数 + 数据分开

\`\`\`python
# 数据
user1_name = "Alice"
user1_balance = 100

user2_name = "Bob"
user2_balance = 200

# 函数
def deposit(name, balance, amount):
    return balance + amount

# 用起来
user1_balance = deposit(user1_name, user1_balance, 50)
\`\`\`

问题：
- 数据多了难管理
- 函数参数越来越多
- 难以模拟真实世界

### 面向对象：数据 + 行为打包

\`\`\`python
class User:
    def __init__(self, name, balance):
        self.name = name
        self.balance = balance
    def deposit(self, amount):
        self.balance += amount

alice = User("Alice", 100)
alice.deposit(50)
print(alice.balance)  # 150
\`\`\`

优点：
- 概念清晰（user 就是一个对象）
- 数据和行为在一起
- 易于扩展

## 四、什么时候用 OOP？

| 场景 | 推荐 |
|------|------|
| 程序有"实体"（用户、订单、商品） | ✅ OOP |
| 数据和行为紧密相关 | ✅ OOP |
| 需要多态（不同类型统一处理） | ✅ OOP |
| 纯计算、纯算法 | ❌ 过程式 |
| 小脚本（<100 行） | ❌ 过程式 |
| 数据处理管道 | ❌ 函数式 |

## 五、OOP 不是万能的

- **不要为了 OOP 而 OOP**：小项目用类反而累赘
- **OOP 不能解决所有问题**：并发、算法、IO 还是要其他技术
- **过度设计**：把所有东西都搞成类是反模式

## 六、Python 的 OOP 特色

- **一切皆对象**：函数、类、模块都是对象
- **动态属性**：可以运行时给对象加属性
- **鸭子类型**：不严格检查类型
- **多重继承**：支持多继承（慎用）
- **mixin**：用多继承做代码复用

## 七、OOP 的 4 大支柱

1. **封装（Encapsulation）**：把数据藏在对象里
2. **继承（Inheritance）**：子类继承父类
3. **多态（Polymorphism）**：同一接口不同实现
4. **抽象（Abstraction）**：定义规范不实现

## 八、本章 demo

下面 demo 对比过程式和面向对象实现同一个功能。
`,
    code: `"""
第一章 demo：过程式 vs 面向对象
演示：
  1. 过程式实现：用户和存款
  2. 面向对象实现：User 类
  3. 规模扩大时的差异
"""

# ===== 1. 过程式实现 =====

# 用户数据用字典
user1 = {"name": "Alice", "balance": 100}
user2 = {"name": "Bob", "balance": 200}


def deposit_proc(user, amount):
    """存款"""
    user["balance"] += amount
    return user


def withdraw_proc(user, amount):
    """取款"""
    if user["balance"] < amount:
        raise ValueError("余额不足")
    user["balance"] -= amount
    return user


def show_user(user):
    print(f"  {user['name']}: ¥{user['balance']}")


print("=== 过程式 ===")
deposit_proc(user1, 50)
withdraw_proc(user2, 30)
show_user(user1)
show_user(user2)
print()


# ===== 2. 面向对象实现 =====

class User:
    """用户类：把数据和行为打包在一起"""

    def __init__(self, name, balance):
        # 初始化属性
        self.name = name
        self.balance = balance

    def deposit(self, amount):
        """存款"""
        if amount <= 0:
            raise ValueError("存款金额必须大于 0")
        self.balance += amount
        return self

    def withdraw(self, amount):
        """取款"""
        if amount <= 0:
            raise ValueError("取款金额必须大于 0")
        if amount > self.balance:
            raise ValueError("余额不足")
        self.balance -= amount
        return self

    def show(self):
        print(f"  {self.name}: ¥{self.balance}")

    def __repr__(self):
        # 让 print(user) 时显示更可读
        return f"User(name={self.name!r}, balance={self.balance})"


print("=== 面向对象 ===")
alice = User("Alice", 100)
bob = User("Bob", 200)
alice.deposit(50)
bob.withdraw(30)
alice.show()
bob.show()
print()


# ===== 3. 规模扩大时的对比 =====

print("=== 当需求变复杂时 ===")

# 过程式：所有函数都要传 user 字典
print("  过程式：函数很多，每个都要传 user")
print("    deposit_proc(user, 50)")
print("    withdraw_proc(user, 30)")
print("    show_user(user)")
print("    transfer_proc(user1, user2, 100)")
print()

# OOP：方法直接挂在对象上
print("  面向对象：方法挂在对象上")
print("    user.deposit(50)")
print("    user.withdraw(30)")
print("    user.show()")
print()


# ===== 4. 类的扩展性 =====

# 给 User 加一个新方法（不改过程式）
class UserV2(User):
    """升级版用户：加个转账功能"""
    def transfer(self, other, amount):
        """转账给其他用户"""
        self.withdraw(amount)
        other.deposit(amount)
        return self


print("=== 类的扩展：加新方法 ===")
alice = UserV2("Alice", 100)
bob = UserV2("Bob", 200)
alice.transfer(bob, 30)
alice.show()
bob.show()
`,
  },

  // =========================================================
  // 第二章：类与对象：最基础的语法
  // =========================================================
  {
    id: "po-02",
    group: "基础概念",
    icon: "📦",
    title: "类与对象：最基础的语法",
    content: `## 一、什么是类？什么是对象？

- **类（Class）**：模板/蓝图，定义一类事物的共同特征
- **对象（Object）**：类的具体实例

类比：
- 类 = 饼干模具
- 对象 = 用模具做出的饼干

## 二、定义类

\`\`\`python
class Dog:
    pass  # 空的类
\`\`\`

## 三、创建对象

\`\`\`python
dog = Dog()  # 调用类得到对象
print(type(dog))  # <class '__main__.Dog'>
\`\`\`

## 四、添加属性

\`\`\`python
class Dog:
    pass

dog1 = Dog()
dog1.name = "旺财"   # 动态加属性
dog1.age = 3

dog2 = Dog()
dog2.name = "小黑"
dog2.age = 5
\`\`\`

**注意**：Python 允许运行时给对象加属性（动态语言特性）。

## 五、添加方法

\`\`\`python
class Dog:
    def bark(self):
        print("汪汪！")
    def info(self):
        print(f"  我叫 {self.name}, {self.age} 岁")

dog = Dog()
dog.name = "旺财"
dog.age = 3
dog.bark()  # 汪汪！
dog.info()  # 我叫 旺财, 3 岁
\`\`\`

## 六、类的命名规范

- 类名用 **大驼峰**（PascalCase）：\`MyClass\`, \`HttpRequest\`
- 方法和属性用 **小写下划线**：\`my_method\`, \`user_name\`

## 七、类的 3 大要素

\`\`\`python
class MyClass:
    """文档字符串"""
    # 1. 类属性（所有实例共享）
    class_attr = "shared"

    # 2. 实例属性（每个实例独有）
    def __init__(self, name):
        self.name = name  # 实例属性

    # 3. 方法
    def method(self):
        return f"Hello, {self.name}"
\`\`\`

## 八、self 是什么？

- \`self\` = 当前对象
- 第一个参数必须是 self
- Python 自动传，不需要手动传

## 九、类的属性 vs 实例的属性

\`\`\`python
class Counter:
    count = 0  # 类属性

    def __init__(self):
        Counter.count += 1

c1 = Counter()
c2 = Counter()
print(Counter.count)  # 2（共享）
\`\`\`

## 十、本章 demo

下面 demo 演示类与对象的基本用法。
`,
    code: `"""
第二章 demo：类与对象基础
演示：
  1. 定义最简单的类
  2. 创建对象
  3. 动态添加属性
  4. 定义方法
  5. 类属性 vs 实例属性
"""

# ===== 1. 最简单的类 =====
class Empty:
    pass


print("=== 1. 最简单的类 ===")
e = Empty()
print(f"  类型: {type(e).__name__}")
print(f"  类名: {Empty.__name__}")
print()


# ===== 2. 动态添加属性 =====
class Dog:
    pass


print("=== 2. 动态添加属性 ===")
dog1 = Dog()
dog1.name = "旺财"
dog1.age = 3

dog2 = Dog()
dog2.name = "小黑"
dog2.age = 5

print(f"  dog1: {dog1.name}, {dog2.age if False else dog1.age} 岁")
print(f"  dog2: {dog2.name}, {dog2.age} 岁")
print()


# ===== 3. 定义方法 =====
class Cat:
    def meow(self):
        print("  喵喵！")

    def info(self):
        # self 指向当前对象
        print(f"  我是 {self.name}, {self.color}")


print("=== 3. 定义方法 ===")
cat = Cat()
cat.name = "小花"
cat.color = "白色"
cat.meow()
cat.info()
print()


# ===== 4. 类属性 vs 实例属性 =====
class Student:
    # 类属性：所有实例共享
    school = "清华大学"

    def __init__(self, name):
        # 实例属性：每个实例独有
        self.name = name


print("=== 4. 类属性 vs 实例属性 ===")
s1 = Student("Alice")
s2 = Student("Bob")
print(f"  s1.school = {s1.school}（类属性，共享）")
print(f"  s2.school = {s2.school}（类属性，共享）")
print(f"  s1.name = {s1.name}（实例属性）")
print(f"  s2.name = {s2.name}（实例属性）")

# 修改类属性
Student.school = "北京大学"
print(f"\\n  修改 Student.school 后:")
print(f"  s1.school = {s1.school}")
print(f"  s2.school = {s2.school}")

# 注意：实例也能"覆盖"类属性
s1.school = "复旦大学"  # 不是修改类属性，是给 s1 加实例属性
print(f"\\n  s1.school = {s1.school}（实例属性覆盖）")
print(f"  s2.school = {s2.school}（仍然是类属性）")
print(f"  Student.school = {Student.school}（类属性没变）")
print()


# ===== 5. 完整示例：手机类 =====
class Phone:
    """手机类"""

    # 类属性
    brand = "未知品牌"

    def __init__(self, model, price):
        # 实例属性
        self.model = model
        self.price = price
        self.battery = 100  # 电量

    def call(self, number):
        if self.battery < 5:
            print(f"  {self.model} 电量不足，无法拨打")
            return
        print(f"  {self.model} 拨打 {number}")
        self.battery -= 5

    def charge(self, amount=100):
        self.battery = min(100, self.battery + amount)
        print(f"  {self.model} 充电到 {self.battery}%")


print("=== 5. 完整示例：手机类 ===")
phone = Phone("iPhone 15", 6999)
phone.call("10086")
phone.call("10086")
phone.charge()
`,
  },

  // =========================================================
  // 第三章：__init__ 方法：构造函数
  // =========================================================
  {
    id: "po-03",
    group: "基础概念",
    icon: "🏗️",
    title: "__init__ 方法：构造函数",
    content: `## 一、什么是 __init__？

\`__init__\` 是**构造函数**，在创建对象时自动调用。

\`\`\`python
class User:
    def __init__(self, name):
        # 创建对象时自动调用
        self.name = name

u = User("Alice")  # __init__ 被自动调用
\`\`\`

## 二、为什么需要 __init__？

让对象**创建时就拥有完整的初始状态**。

\`\`\`python
# ❌ 没 __init__：要手动设置
class User:
    pass

u = User()
u.name = "Alice"
u.age = 30

# ✅ 有 __init__：创建时设置好
class User:
    def __init__(self, name, age):
        self.name = name
        self.age = age

u = User("Alice", 30)
\`\`\`

## 三、__init__ 的本质

- \`__init__\` 是**魔术方法**（双下划线开头结尾）
- 创建对象时自动调用
- 用于**初始化**对象的属性
- 不是必须的（可以没有）

## 四、默认参数

\`\`\`python
class User:
    def __init__(self, name, age=18, role="user"):
        self.name = name
        self.age = age
        self.role = role

u1 = User("Alice")                # age=18, role="user"
u2 = User("Bob", 25)              # role="user"
u3 = User("Carol", 30, "admin")   # 都指定
\`\`\`

## 五、参数验证

\`\`\`python
class User:
    def __init__(self, name, age):
        if age < 0:
            raise ValueError("年龄不能为负")
        self.name = name
        self.age = age
\`\`\`

## 六、__init__ vs __new__

| 方法 | 作用 | 调用时机 |
|------|------|----------|
| \`__new__\` | 创建对象 | 先调用 |
| \`__init__\` | 初始化对象 | 后调用 |

99% 的情况用 \`__init__\`，\`__new__\` 用于高级场景（单例模式等）。

## 七、__init__ 的常见错误

### 1. 忘记 self

\`\`\`python
class User:
    def __init__(name):  # 缺 self，调用会报错
        ...
\`\`\`

### 2. 参数太多

用 dataclass 或 NamedTuple 简化。

### 3. 在 __init__ 里做耗时操作

\`__init__\` 应该快，重活放到其他方法。

## 八、__init__ vs 普通方法

- \`__init__\`：只在创建时调用一次
- 普通方法：随时可以调用

## 九、本章 demo

演示 __init__ 的各种用法。
`,
    code: `"""
第三章 demo：__init__ 构造函数
演示：
  1. 基本 __init__
  2. 默认参数
  3. 参数验证
  4. __new__ vs __init__
  5. 实战：完整的数据类
"""


# ===== 1. 基本 __init__ =====
class User:
    """用户类"""

    def __init__(self, name, age):
        # 创建时自动调用
        self.name = name
        self.age = age
        print(f"  [__init__] 创建用户: {name}, {age} 岁")

    def show(self):
        print(f"  {self.name} ({self.age} 岁)")


print("=== 1. 基本 __init__ ===")
u = User("Alice", 30)  # __init__ 自动调用
u.show()
print()


# ===== 2. 默认参数 =====
class Product:
    """商品类"""

    def __init__(self, name, price, stock=0, discount=1.0):
        self.name = name
        self.price = price
        self.stock = stock
        self.discount = discount

    def actual_price(self):
        return self.price * self.discount


print("=== 2. 默认参数 ===")
p1 = Product("iPhone")
p2 = Product("iPad", 5999)
p3 = Product("MacBook", 12999, stock=5, discount=0.9)
print(f"  {p1.name}: ¥{p1.price}, 库存 {p1.stock}")
print(f"  {p2.name}: ¥{p2.price}, 库存 {p2.stock}")
print(f"  {p3.name}: ¥{p3.actual_price():.0f}（折后）")
print()


# ===== 3. 参数验证 =====
class Account:
    """银行账户"""

    def __init__(self, owner, balance):
        if balance < 0:
            raise ValueError("初始余额不能为负")
        if not owner or not isinstance(owner, str):
            raise ValueError("户名必须是字符串")
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("存款必须大于 0")
        self.balance += amount


print("=== 3. 参数验证 ===")
try:
    acc = Account("Alice", 100)
    print(f"  {acc.owner}: ¥{acc.balance}")
    acc.deposit(50)
    print(f"  存款后: ¥{acc.balance}")
except ValueError as e:
    print(f"  错误: {e}")
print()


# ===== 4. __new__ vs __init__ =====
class Tracked:
    """跟踪对象创建过程"""

    def __new__(cls, *args, **kwargs):
        # __new__ 先调用：负责创建对象
        print(f"  [__new__] 准备创建 {cls.__name__}")
        instance = super().__new__(cls)
        return instance

    def __init__(self, name):
        # __init__ 后调用：负责初始化
        print(f"  [__init__] 初始化 {name}")
        self.name = name


print("=== 4. __new__ vs __init__ ===")
t = Tracked("test")
print()


# ===== 5. 实战：完整的数据类 =====
class Employee:
    """员工类"""

    def __init__(self, name, dept, salary):
        self.name = name
        self.dept = dept
        self.salary = salary
        self.projects = []  # 空列表

    def assign_project(self, project):
        self.projects.append(project)
        print(f"  {self.name} 分配到项目: {project}")

    def info(self):
        print(f"  {self.name} ({self.dept})")
        print(f"    薪资: ¥{self.salary}")
        print(f"    项目: {', '.join(self.projects) if self.projects else '无'}")


print("=== 5. 实战：员工类 ===")
emp = Employee("Alice", "研发部", 30000)
emp.assign_project("电商平台")
emp.assign_project("数据分析")
emp.info()
`,
  },

  // =========================================================
  // 第四章：self 到底是什么？
  // =========================================================
  {
    id: "po-04",
    group: "基础概念",
    icon: "👉",
    title: "self 到底是什么？",
    content: `## 一、self 的本质

\`self\` = **当前调用方法的对象**

\`\`\`python
class Dog:
    def bark(self):
        print(f"  {self.name} 在叫")

dog1 = Dog()
dog1.name = "旺财"
dog1.bark()  # self = dog1

dog2 = Dog()
dog2.name = "小黑"
dog2.bark()  # self = dog2
\`\`\`

调用 \`dog1.bark()\` 时，Python 内部转成 \`Dog.bark(dog1)\`，所以 \`self\` 就是 dog1。

## 二、self 不是一个关键字

\`self\` 只是**约定俗成**的名字，你可以用任何名字：

\`\`\`python
class Cat:
    def meow(this):  # this 也可以
        print(f"  {this.name} 喵喵")

cat = Cat()
cat.name = "小花"
cat.meow()
\`\`\`

**但强烈建议用 self**，所有人都这么写。

## 三、为什么需要 self？

方法需要知道是"哪个对象"在调用：

\`\`\`python
class Counter:
    def __init__(self):
        self.count = 0

    def increment(self):
        self.count += 1  # 修改当前对象的 count

c1 = Counter()
c2 = Counter()
c1.increment()  # c1.count = 1
c2.increment()  # c2.count = 1
c2.increment()  # c2.count = 2
# 因为 self 不同，所以各自加 1
\`\`\`

## 四、self 必须显式写

跟 Java/JS 不同，Python 必须把 self 写出来：

\`\`\`python
class Foo:
    def bar():  # ❌ 不会自动加 self
        print("hi")

Foo().bar()  # TypeError: bar() takes 0 positional arguments
\`\`\`

## 五、self 访问属性

\`\`\`python
class User:
    def __init__(self, name):
        self.name = name  # 实例属性

    def greet(self):
        return f"Hello, {self.name}"  # 通过 self 访问
\`\`\`

## 六、self 调用方法

\`\`\`python
class Calc:
    def add(self, a, b):
        return a + b

    def double_add(self, a, b, c):
        # 方法内调用其他方法
        first = self.add(a, b)
        return first + c
\`\`\`

## 七、self 的 4 个常见错误

### 1. 忘记 self
\`\`\`python
class Foo:
    def bar():
        pass
\`\`\`

### 2. 误以为 self 是类
\`\`\`python
class Foo:
    def bar(self):
        return self is Foo  # False！self 是实例
\`\`\`

### 3. self 在外部传
\`\`\`python
obj.bar(self)  # ❌ Python 自动传，多传会报错
\`\`\`

### 4. 局部变量和 self.x 混淆
\`\`\`python
def method(self, x):
    x = 10       # 局部变量
    self.x = 20  # 实例属性
\`\`\`

## 八、本章 demo

深入理解 self。
`,
    code: `"""
第四章 demo：self 深入理解
演示：
  1. self 是当前对象
  2. self 不是关键字
  3. self 访问属性和方法
  4. self 常见错误
"""

# ===== 1. self 是当前对象 =====
class Dog:
    def __init__(self, name):
        self.name = name

    def bark(self):
        # self 就是调用这个方法的对象
        print(f"  {self.name} 在叫")
        print(f"  self 的 id: {id(self)}")


print("=== 1. self 是当前对象 ===")
dog1 = Dog("旺财")
dog2 = Dog("小黑")
print(f"  dog1 id: {id(dog1)}")
dog1.bark()  # self = dog1
print(f"  dog2 id: {id(dog2)}")
dog2.bark()  # self = dog2
print()


# ===== 2. self 不是关键字 =====
class Cat:
    def meow(this):  # 用 this 也可以
        print(f"  {this.name} 喵喵")


print("=== 2. self 不是关键字（但不推荐）===")
cat = Cat()
cat.name = "小花"
cat.meow()
print("  建议: 永远用 self，全 Python 通用")
print()


# ===== 3. self 访问属性和方法 =====
class Calc:
    """计算器"""

    def __init__(self, name):
        self.name = name
        self.history = []  # 历史记录

    def add(self, a, b):
        result = a + b
        self.history.append(f"{a} + {b} = {result}")
        return result

    def multiply(self, a, b):
        result = a * b
        self.history.append(f"{a} * {b} = {result}")
        return result

    def show_history(self):
        print(f"  {self.name} 的历史:")
        for h in self.history:
            print(f"    {h}")


print("=== 3. self 访问属性和方法 ===")
calc = Calc("我的计算器")
calc.add(1, 2)
calc.multiply(3, 4)
calc.add(10, 20)
calc.show_history()
print()


# ===== 4. self 调用方法 =====
class Validator:
    """数据验证器"""

    def is_positive(self, n):
        return n > 0

    def is_in_range(self, n, low, high):
        # 在方法里调用其他方法
        return self.is_positive(n) and low <= n <= high


print("=== 4. self 调用方法 ===")
v = Validator()
print(f"  is_in_range(5, 1, 10): {v.is_in_range(5, 1, 10)}")
print(f"  is_in_range(-1, 1, 10): {v.is_in_range(-1, 1, 10)}")
print()


# ===== 5. self 的常见错误 =====

# 错误 1: 忘记 self
class Wrong1:
    def bar():  # 缺 self
        pass


print("=== 5. self 常见错误 ===\\n")

print("  错误 1: 忘记 self")
try:
    Wrong1().bar()
except TypeError as e:
    print(f"    {e}\\n")

# 错误 2: 手动传 self
class Foo:
    def bar(self):
        print("  bar called")


print("  错误 2: 手动传 self")
try:
    Foo.bar(Foo())  # OK 的（不推荐）
    f = Foo()
    f.bar()  # 推荐写法
    print("    手动传不推荐，会出错")
except Exception as e:
    print(f"    {e}\\n")
`,
  },
];
