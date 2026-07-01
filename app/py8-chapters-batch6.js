// =============================================================
// py8-chapters-batch6.js
// 模块：面向对象上（共 10 章）
// 全新制作，简单易懂，demo 多，难代码逐行讲解
// =============================================================

export const chapters = [
  {
    id: "py8-class-basic",
    group: "面向对象上",
    icon: "🏛️",
    title: "类与对象基础",
    content: `## 什么是面向对象

面向对象编程（OOP，Object-Oriented Programming）是一种编程思想。它把程序看作**一组互相协作的对象**，每个对象都有自己的**数据（属性）**和**行为（方法）**。

### 现实世界的类比

把对象想象成"东西"：
- **属性**：东西的特征（如车的颜色、品牌）
- **方法**：东西能做的事（如车的启动、刹车）

### 类与对象的关系

- **类（Class）**：是**模板/蓝图**，描述"这一类东西长什么样"
- **对象（Object）**：是**实例**，根据类创建出来的具体东西

| 概念 | 比喻 | 代码示例 |
|------|------|----------|
| 类 | 汽车图纸 | \`class Car:\` |
| 对象 | 按图纸造出的车 | \`car1 = Car()\` |

### class 定义

\`\`\`python
class Car:
    pass    # pass 是占位符，类体不能为空
\`\`\`

### 类名大驼峰命名

PEP 8 规范：类名用**大驼峰**（每个单词首字母大写），不使用下划线：
- ✅ \`MyClass\`、\`BankAccount\`、\`HttpClient\`
- ❌ \`my_class\`、\`bank_account\`

### 实例化对象

\`\`\`python
# 类名加括号 = 创建实例
car1 = Car()
car2 = Car()
# car1 和 car2 是两个独立的对象
\`\`\`

### 类对象 vs 实例对象

Python 中"一切皆对象"，**类本身也是对象**：

| 类型 | 说明 | 例子 |
|------|------|------|
| 类对象 | 类定义本身 | \`Car\` |
| 实例对象 | 类创建的对象 | \`Car()\` |

### 属性访问

用点号 \`.\` 访问对象的属性：

\`\`\`python
car1.color = "红色"   # 给对象加属性
print(car1.color)     # 读取属性
\`\`\`

### self 是什么

\`self\` 是方法里的"**当前实例**"引用，让方法能访问到调用它的对象：

\`\`\`python
class Dog:
    def bark(self):       # self 必须是第一个参数
        print("汪汪！我是", self.name)

dog = Dog()
dog.name = "旺财"
dog.bark()   # 调用方法，self 自动传入 dog
\`\`\`

### 类的设计思路

设计一个类，先想清楚：
1. 这类东西有什么**属性**（数据）
2. 这类东西能做哪些**方法**（行为）
3. 创建时需要哪些**初始参数**

下面的 demo 完整演示类的定义、实例化和属性访问。`,
    code: `# ==========================================
# 类与对象基础：从蓝图到实例
# ==========================================
print("=" * 45)
print("        类与对象基础演示")
print("=" * 45)

# 1. 定义最简单的类
print()
print("=== 1. 定义类 ===")

class Car:
    """汽车类：最简单的类定义"""
    pass    # pass 占位符，类体不能为空

# 类名是大驼峰：Car、BankAccount、HttpClient 都是规范的
# 类本身也是对象，可以打印
print("Car 类本身：", Car)
print("Car 的类型：", type(Car))

# 2. 实例化：类名加括号创建对象
print()
print("=== 2. 实例化对象 ===")

car1 = Car()    # 创建第一个实例
car2 = Car()    # 创建第二个实例
print("car1 =", car1)
print("car2 =", car2)
print("car1 和 car2 是同一个对象吗？", car1 is car2)  # False，各自独立

# 3. 给对象动态添加属性
print()
print("=== 3. 属性的添加与访问 ===")

car1.color = "红色"      # 给 car1 加 color 属性
car1.brand = "特斯拉"
car2.color = "蓝色"      # car2 也有自己的 color

print(f"car1 是 {car1.color} 的 {car1.brand}")
print(f"car2 是 {car2.color}")     # car2 没有 brand 属性
print(f"car1.color 的类型：{type(car1.color).__name__}")

# 4. self 的作用：方法访问自己的属性
print()
print("=== 4. 方法与 self ===")

class Dog:
    """小狗类，演示 self 的用法"""
    
    def bark(self):
        # self 指向调用这个方法的实例
        # 通过 self.name 访问自己的属性
        print(f"汪汪！我是 {self.name}")
    
    def sit(self):
        print(f"{self.name} 坐下了")
    
    def show_age_in_human_years(self):
        # 狗龄换算成人类年龄（1狗年约等于7人年）
        human_age = self.age * 7
        print(f"{self.name} 相当于 {human_age} 岁的人")

# 创建几只小狗
dog1 = Dog()
dog1.name = "旺财"
dog1.age = 3

dog2 = Dog()
dog2.name = "来福"
dog2.age = 5

# 调用方法：self 自动绑定到对应的实例
dog1.bark()    # self=dog1，访问 dog1.name
dog2.bark()    # self=dog2，访问 dog2.name
dog1.sit()
dog1.show_age_in_human_years()

# 5. self 是方法与对象的桥梁
print()
print("=== 5. self 是方法与对象的桥梁 ===")

class Cat:
    """演示 self 如何让方法找到对象"""
    
    def introduce(self):
        # 如果不写 self，方法无法知道是哪个实例在调用
        # 这里通过 self 访问对象的 name 属性
        return f"我是猫，名字叫 {self.name}"

cat = Cat()
cat.name = "咪咪"
print(cat.introduce())

# 6. 简单的类设计练习
print()
print("=== 6. 综合示例：银行账户类 ===")

class BankAccount:
    """银行账户：类的设计示范"""
    
    def setup(self, owner, balance):
        """初始化账户（早期写法，更标准的写法在下一章）"""
        self.owner = owner          # 户主
        self.balance = balance      # 余额
    
    def deposit(self, amount):
        """存款"""
        self.balance += amount
        print(f"{self.owner} 存入 {amount}，余额 {self.balance}")
    
    def withdraw(self, amount):
        """取款"""
        if amount > self.balance:
            print(f"{self.owner} 余额不足！只有 {self.balance}")
        else:
            self.balance -= amount
            print(f"{self.owner} 取出 {amount}，余额 {self.balance}")

# 创建账户
acc = BankAccount()
acc.setup("小明", 1000)
acc.deposit(500)
acc.withdraw(300)
acc.withdraw(2000)   # 余额不足
print(f"最终账户信息：户主={acc.owner}，余额={acc.balance}")`
  },
  {
    id: "py8-attr-method",
    group: "面向对象上",
    icon: "🏷️",
    title: "属性与方法",
    content: `## 属性与方法的分类

类里有两种东西：
- **属性**：存数据（变量）
- **方法**：定义行为（函数）

### 两种属性

| 类型 | 定义位置 | 归属 | 例子 |
|------|----------|------|------|
| 实例属性 | \`__init__\` 内 \`self.x\` | 每个实例独有 | \`self.name\` |
| 类属性 | 类体内直接定义 | 所有实例共享 | \`count = 0\` |

\`\`\`python
class Student:
    school = "清华"   # 类属性，所有学生共享
    count = 0          # 类属性，记录学生数
    
    def __init__(self, name):
        self.name = name   # 实例属性，每个学生独有
\`\`\`

### __init__ 初始化方法

\`__init__\` 在创建对象时**自动调用**，用来初始化实例属性：

\`\`\`python
class Student:
    def __init__(self, name, age):
        self.name = name
        self.age = age

# 创建时传参，自动调用 __init__
s = Student("小明", 18)
\`\`\`

### 实例方法

实例方法的第一个参数必须是 \`self\`，表示当前实例：

\`\`\`python
class Student:
    def greet(self):       # self 必填
        print(f"我是 {self.name}")
\`\`\`

### 类属性 vs 实例属性优先级

**同名时，实例属性优先**：

\`\`\`python
class Foo:
    x = "类属性"

obj = Foo()
print(obj.x)      # "类属性"（实例没有，找类的）
obj.x = "实例属性"
print(obj.x)      # "实例属性"（实例有了，优先用）
\`\`\`

### 动态添加属性

Python 允许**运行时**给对象加属性：

\`\`\`python
obj = Student("小明", 18)
obj.grade = "高一"    # 动态添加
\`\`\`

### 类属性的坑：可变对象

\`\`\`python
class Bad:
    items = []    # 危险！所有实例共享同一个列表
\`\`\`

正确做法是在 \`__init__\` 里创建实例属性。下面的 demo 完整演示各种属性和方法的用法。`,
    code: `# ==========================================
# 属性与方法：实例属性、类属性、方法
# ==========================================
print("=" * 45)
print("        属性与方法演示")
print("=" * 45)

# 1. 类属性 vs 实例属性
print()
print("=== 1. 类属性 vs 实例属性 ===")

class Student:
    school = "清华大学"      # 类属性：所有学生共享的学校
    total = 0               # 类属性：学生总数
    
    def __init__(self, name, age):
        # 实例属性：每个学生独有的数据
        self.name = name
        self.age = age
        Student.total += 1  # 通过类名修改类属性

# 创建几个学生
s1 = Student("小明", 18)
s2 = Student("小红", 19)

# 实例属性：每个对象独立
print(f"{s1.name} 的年龄：{s1.age}")
print(f"{s2.name} 的年龄：{s2.age}")

# 类属性：所有实例共享
print(f"{s1.name} 的学校：{s1.school}")    # 通过实例访问类属性
print(f"{s2.name} 的学校：{s2.school}")
print(f"类直接访问：{Student.school}")
print(f"学生总数：{Student.total}")

# 2. 类属性被所有实例共享
print()
print("=== 2. 共享的类属性 ===")

class Counter:
    count = 0   # 类属性，记录实例数
    
    def __init__(self):
        Counter.count += 1   # 类名访问类属性
    
    def show_count(self):
        # 也可以用 self.count 读取类属性
        print(f"当前共创建了 {Counter.count} 个实例")

c1 = Counter()
c2 = Counter()
c3 = Counter()
c1.show_count()

# 3. 类属性 vs 实例属性优先级
print()
print("=== 3. 优先级（同名时实例优先）===")

class Demo:
    x = "类属性"    # 类属性

d = Demo()
print("实例没有 x，访问：", d.x)    # 找到类属性
d.x = "实例属性"    # 给实例添加了同名的实例属性
print("实例有 x 后，访问：", d.x)    # 用实例属性
print("类属性依然是：", Demo.x)      # 类属性不受影响

# 4. 实例方法：访问实例和类属性
print()
print("=== 4. 实例方法 ===")

class Book:
    library = "市图书馆"   # 类属性
    
    def __init__(self, title, author):
        self.title = title       # 实例属性
        self.author = author
    
    def describe(self):
        """实例方法：通过 self 访问实例属性"""
        return f"《{self.title}》- {self.author}"
    
    def location(self):
        """实例方法也可以访问类属性"""
        return f"{self.title} 在 {self.library}"

book1 = Book("Python教程", "吉多")
book2 = Book("算法导论", "Cormen")
print(book1.describe())
print(book2.describe())
print(book1.location())

# 5. 动态添加属性
print()
print("=== 5. 动态添加属性 ===")

class Person:
    def __init__(self, name):
        self.name = name

p = Person("小张")
print("刚创建，属性有：", p.__dict__)   # __dict__ 查看对象所有属性

# 动态添加新属性（仅对当前实例生效）
p.age = 25
p.email = "zhang@example.com"
print("添加后，属性有：", p.__dict__)

# 新实例不会继承动态属性
p2 = Person("小李")
print("p2 的属性：", p2.__dict__)    # 只有 name

# 6. 类属性的危险：可变对象共享
print()
print("=== 6. 类属性的坑：可变对象 ===")

class BadList:
    items = []    # 危险！类属性是可变对象
    
    def add(self, item):
        # 这里修改的是类属性，不是实例属性
        self.items.append(item)

a = BadList()
b = BadList()
a.add("苹果")
b.add("香蕉")
print("a 的 items：", a.items)    # 两个！
print("b 的 items：", b.items)    # 也是两个！
print("是同一个列表吗？", a.items is b.items)   # True

# 正确做法：在 __init__ 里创建实例属性
print()
print("=== 7. 正确写法：在 __init__ 里建实例属性 ===")

class GoodList:
    def __init__(self):
        self.items = []    # 每个实例有自己的列表
    
    def add(self, item):
        self.items.append(item)

a = GoodList()
b = GoodList()
a.add("苹果")
b.add("香蕉")
print("a 的 items：", a.items)    # 只有苹果
print("b 的 items：", b.items)    # 只有香蕉
print("是同一个列表吗？", a.items is b.items)   # False，独立`
  },
  {
    id: "py8-init-self",
    group: "面向对象上",
    icon: "🏗️",
    title: "构造 __init__ 与 self",
    content: `## __init__ 初始化方法

\`__init__\` 是 Python 的**特殊方法**（双下划线），在创建对象时**自动调用**，用来初始化实例属性。

\`\`\`python
class Cat:
    def __init__(self, name):    # 创建时自动调用
        self.name = name

cat = Cat("咪咪")    # 实际上调用 __init__(self, "咪咪")
\`\`\`

### self 是什么

\`self\` 是**当前实例的引用**。当方法被调用时，Python 自动把调用对象传给 \`self\`：

\`\`\`python
cat = Cat("咪咪")
cat.speak()    # 等价于 Cat.speak(cat)，self=cat
\`\`\`

### self 是显式传递的

Python 的 self 是**显式写出**的（不像 Java/JS 的 this 隐藏）：

\`\`\`python
class Dog:
    def bark(self):
        print(self.name)

dog = Dog()
dog.bark()        # 自动传 self
Dog.bark(dog)     # 手动传 self，等价写法
\`\`\`

### __new__ 创建对象（了解）

构造过程其实分两步：
1. \`__new__\` 创建对象（返回实例）
2. \`__init__\` 初始化对象（设置属性）

| 方法 | 作用 | 返回 |
|------|------|------|
| \`__new__\` | 创建实例 | 实例对象 |
| \`__init__\` | 初始化实例 | None |

### 参数传递与默认值

\`__init__\` 可以有任意参数和默认值：

\`\`\`python
class User:
    def __init__(self, name, age=18, city="北京"):
        self.name = name
        self.age = age
        self.city = city

u1 = User("小明")                # 用默认值
u2 = User("小红", 20)            # 部分用默认值
u3 = User("小刚", 22, "上海")    # 全部自定义
\`\`\`

### self 命名约定

\`self\` 只是约定俗成的名字，技术上可以改成别的，但**强烈建议不要改**：

\`\`\`python
class Foo:
    def __init__(this, name):   # 技术上可行，但别这么写
        this.name = name
\`\`\`

下面的 demo 详细演示构造过程和 self 的本质。`,
    code: `# ==========================================
# __init__ 与 self：构造过程详解
# ==========================================
print("=" * 45)
print("        __init__ 与 self 详解")
print("=" * 45)

# 1. __init__ 自动调用
print()
print("=== 1. __init__ 在创建时自动调用 ===")

class Cat:
    def __init__(self, name):
        print(f"  >>> __init__ 被调用了，name={name}")
        self.name = name    # 把 name 存到实例上
    
    def speak(self):
        return f"{self.name}: 喵~"

print("准备创建 cat1...")
cat1 = Cat("咪咪")
print("准备创建 cat2...")
cat2 = Cat("花花")
print(f"两只猫：{cat1.speak()} / {cat2.speak()}")

# 2. self 就是实例本身
print()
print("=== 2. self 是当前实例的引用 ===")

class Box:
    def __init__(self, size):
        self.size = size
    
    def who_am_i(self):
        # 返回 self 的 id，方便验证它就是调用对象
        return id(self)

box = Box(10)
print(f"box 的 id = {id(box)}")
print(f"self 的 id = {box.who_am_i()}")
print(f"是同一个对象吗？{id(box) == box.who_am_i()}")

# 3. self 是显式传递的
print()
print("=== 3. self 显式传递 ===")

class Dog:
    def __init__(self, name):
        self.name = name
    
    def bark(self):
        print(f"{self.name}: 汪汪！")

dog = Dog("旺财")
# 标准调用：自动传 self
dog.bark()
# 手动调用：显式传 self（一般不这么写，理解原理用）
Dog.bark(dog)    # 这两种写法完全等价

# 4. __init__ 可以接收任意参数
print()
print("=== 4. __init__ 参数与默认值 ===")

class User:
    def __init__(self, name, age=18, city="北京"):
        self.name = name
        self.age = age
        self.city = city
    
    def info(self):
        return f"{self.name}, {self.age}岁, 来自{self.city}"

# 用不同方式调用
u1 = User("小明")              # 只传必填
u2 = User("小红", 20)          # 传 name 和 age
u3 = User("小刚", city="上海")  # 用关键字参数跳过 age
u4 = User("小芳", 22, "广州")   # 全部传
for u in [u1, u2, u3, u4]:
    print(u.info())

# 5. 构造过程：__new__ 和 __init__ 配合
print()
print("=== 5. 构造过程：__new__ 创建，__init__ 初始化 ===")

class MyClass:
    def __new__(cls, *args, **kwargs):
        print(f"  [1] __new__ 被调用，创建实例")
        # 调用父类（object）的 __new__ 真正创建对象
        instance = super().__new__(cls)
        print(f"  [1] 创建好的实例 id = {id(instance)}")
        return instance    # 必须返回实例
    
    def __init__(self, value):
        print(f"  [2] __init__ 被调用，初始化实例")
        self.value = value

print("准备创建 obj...")
obj = MyClass(42)
print(f"obj 的 value = {obj.value}")
print(f"obj 的 id = {id(obj)}（与 __new__ 返回的是同一个）")

# 6. self 命名约定（强烈建议用 self）
print()
print("=== 6. self 是约定俗成的名字 ===")

class Example:
    def __init__(self, x):
        # self 是约定的名字，但 Python 不强制
        # 不过为了代码可读性，永远用 self
        self.x = x

ex = Example(5)
print(f"ex.x = {ex.x}")

# 7. __init__ 不能有返回值
print()
print("=== 7. __init__ 不返回任何值 ===")

class Point:
    def __init__(self, x, y):
        # __init__ 不能 return 值，只能 return None
        self.x = x
        self.y = y
        # 自动 return None

p = Point(3, 4)
print(f"点坐标：({p.x}, {p.y})")
print(f"两点距离 = {(p.x**2 + p.y**2) ** 0.5:.2f}")`
  },
  {
    id: "py8-classmethod",
    group: "面向对象上",
    icon: "🏠",
    title: "类方法与静态方法",
    content: `## 三种方法对比

Python 类里有三种方法：

| 类型 | 装饰器 | 第一个参数 | 能访问 |
|------|--------|------------|--------|
| 实例方法 | 无 | \`self\`（实例） | 实例 + 类 |
| 类方法 | \`@classmethod\` | \`cls\`（类） | 只能访问类 |
| 静态方法 | \`@staticmethod\` | 无 | 都不能访问 |

### 实例方法

最常见的，第一个参数是 \`self\`：

\`\`\`python
class MyClass:
    def instance_method(self):
        print(self)    # 能访问实例
\`\`\`

### @classmethod 类方法

第一个参数是 \`cls\`，代表**类本身**：

\`\`\`python
class MyClass:
    @classmethod
    def class_method(cls):
        print(cls)    # 是 MyClass 这个类
\`\`\`

### @staticmethod 静态方法

没有 \`self\` 也没有 \`cls\`，和普通函数一样：

\`\`\`python
class MyClass:
    @staticmethod
    def static_method():
        print("我和类没什么关系，只是放在类里")
\`\`\`

### 工厂方法模式（@classmethod 的经典用途）

用类方法创建**不同形态的实例**：

\`\`\`python
class Date:
    def __init__(self, year, month, day):
        self.year, self.month, self.day = year, month, day
    
    @classmethod
    def from_string(cls, s):
        # cls() 等价于 Date()，但子类继承时会用子类
        y, m, d = map(int, s.split("-"))
        return cls(y, m, d)

d = Date.from_string("2024-06-30")
\`\`\`

### 替代构造器 cls()

类方法里调用 \`cls(...)\` 创建实例，相当于调用了**当前类的构造器**。子类继承时，\`cls\` 自动变成子类，非常灵活。

### 何时用哪种

| 场景 | 选择 |
|------|------|
| 需要访问实例属性 | 实例方法 |
| 需要访问/修改类属性 | 类方法 |
| 工具函数，和实例/类无关 | 静态方法 |

下面的 demo 完整演示三种方法和工厂模式。`,
    code: `# ==========================================
# 类方法与静态方法
# ==========================================
print("=" * 45)
print("      类方法、静态方法、实例方法")
print("=" * 45)

# 1. 三种方法的对比
print()
print("=== 1. 三种方法对比 ===")

class MyClass:
    class_var = "我是类属性"
    
    def __init__(self, value):
        self.instance_var = value
    
    def instance_method(self):
        # 实例方法：能访问 self（实例）和类属性
        return f"实例方法：实例={self.instance_var}，类={self.class_var}"
    
    @classmethod
    def class_method(cls):
        # 类方法：第一个参数 cls 是类本身
        return f"类方法：cls={cls.__name__}，类属性={cls.class_var}"
    
    @staticmethod
    def static_method(x, y):
        # 静态方法：没有 self 也没有 cls
        # 就是个普通函数，放在类里方便组织
        return f"静态方法：{x} + {y} = {x + y}"

obj = MyClass("hello")
print(obj.instance_method())
print(MyClass.class_method())    # 类方法可以直接用类调用
print(MyClass.static_method(3, 5))
# 静态方法和类方法也可以通过实例调用（但不推荐）
print(obj.class_method())

# 2. 类方法访问类属性
print()
print("=== 2. 类方法修改类属性 ===")

class Counter:
    total = 0    # 类属性
    
    def __init__(self):
        Counter.total += 1
    
    @classmethod
    def get_total(cls):
        """类方法：读取类属性"""
        return cls.total
    
    @classmethod
    def reset(cls):
        """类方法：修改类属性"""
        cls.total = 0

c1 = Counter()
c2 = Counter()
c3 = Counter()
print(f"创建了 {Counter.get_total()} 个实例")
Counter.reset()
print(f"重置后，total = {Counter.total}")

# 3. 工厂方法：替代构造器
print()
print("=== 3. 工厂方法：用类方法创建实例 ===")

class Date:
    """日期类：演示工厂模式"""
    
    def __init__(self, year, month, day):
        self.year = year
        self.month = month
        self.day = day
    
    def __str__(self):
        return f"{self.year}-{self.month:02d}-{self.day:02d}"
    
    @classmethod
    def from_string(cls, s):
        """工厂方法：从字符串 2024-06-30 创建"""
        parts = s.split("-")
        y, m, d = int(parts[0]), int(parts[1]), int(parts[2])
        return cls(y, m, d)    # cls() = 当前类的构造器
    
    @classmethod
    def today(cls):
        """工厂方法：创建今天的日期"""
        import datetime
        t = datetime.date.today()
        return cls(t.year, t.month, t.day)
    
    @staticmethod
    def is_leap_year(year):
        """静态方法：判断闰年（不需要访问实例或类）"""
        return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)

# 用不同方式创建 Date
d1 = Date(2024, 6, 30)
d2 = Date.from_string("2024-06-30")
d3 = Date.today()

print(f"直接构造：{d1}")
print(f"字符串解析：{d2}")
print(f"今天：{d3}")
print(f"2024 是闰年吗？{Date.is_leap_year(2024)}")
print(f"2023 是闰年吗？{Date.is_leap_year(2023)}")

# 4. cls() 在继承中的优势
print()
print("=== 4. cls() 在继承中自动用子类 ===")

class FormattedDate(Date):
    """子类：自定义日期格式"""
    
    def __str__(self):
        return f"{self.year}年{self.month}月{self.day}日"

# 调用继承的 from_string，但 cls 会变成 FormattedDate
fd = FormattedDate.from_string("2024-06-30")
print(f"类型：{type(fd).__name__}")    # FormattedDate
print(f"输出：{fd}")    # 用子类的 __str__

# 5. 静态方法的使用场景
print()
print("=== 5. 静态方法：纯工具函数 ===")

class MathHelper:
    """数学工具类：静态方法集合"""
    
    @staticmethod
    def square(x):
        return x * x
    
    @staticmethod
    def cube(x):
        return x * x * x
    
    @staticmethod
    def is_even(n):
        return n % 2 == 0

print(f"3 的平方 = {MathHelper.square(3)}")
print(f"2 的立方 = {MathHelper.cube(2)}")
print(f"4 是偶数吗？{MathHelper.is_even(4)}")

# 6. 综合示例：员工管理
print()
print("=== 6. 综合示例：员工管理 ===")

class Employee:
    company = "ABC科技"
    count = 0
    
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary
        Employee.count += 1
    
    def info(self):
        """实例方法：访问实例属性"""
        return f"{self.name} 月薪 {self.salary} 元"
    
    @classmethod
    def from_string(cls, s):
        """类方法：工厂，从 name,salary 创建"""
        name, salary = s.split(",")
        return cls(name, int(salary))
    
    @classmethod
    def get_company_info(cls):
        """类方法：访问类属性"""
        return f"{cls.company} 共有 {cls.count} 名员工"
    
    @staticmethod
    def is_high_salary(salary):
        """静态方法：判断工资水平"""
        return salary > 20000

# 创建员工
e1 = Employee("张三", 15000)
e2 = Employee.from_string("李四,25000")
print(e1.info())
print(e2.info())
print(Employee.get_company_info())
print(f"张三工资高吗？{Employee.is_high_salary(e1.salary)}")
print(f"李四工资高吗？{Employee.is_high_salary(e2.salary)}")`
  },
  {
    id: "py8-encapsulation",
    group: "面向对象上",
    icon: "🔐",
    title: "封装与私有属性",
    content: `## 封装的意义

**封装**是把数据"藏起来"，只暴露**受控的访问方式**：
- 防止外部直接修改内部状态
- 在修改时可以做校验
- 让接口更稳定

### Python 的"私有"约定

| 写法 | 含义 | 真私有吗 |
|------|------|----------|
| \`name\` | 公开属性 | 否 |
| \`_name\` | 单下划线：内部使用（约定） | 否（仅约定） |
| \`__name\` | 双下划线：名称改写 | 半私有 |
| \`__name__\` | 前后双下划线：特殊方法 | 公开（不要自创） |

### 单下划线 _name（约定）

只是约定，表示"**这是内部用的，别从外面访问**"，但 Python 不阻止访问：

\`\`\`python
class Foo:
    def __init__(self):
        self._secret = "内部数据"

f = Foo()
print(f._secret)   # 技术上能访问，但你不应该这么做
\`\`\`

### 双下划线 __name（名称改写）

Python 会把它改名为 \`_ClassName__name\`，避免被子类覆盖：

\`\`\`python
class Foo:
    def __init__(self):
        self.__secret = "改写后变 _Foo__secret"

f = Foo()
# print(f.__secret)    # 报错！找不到
print(f._Foo__secret)  # 仍然能访问（但很丑）
\`\`\`

### property 装饰器

用 \`@property\` 把方法变成属性访问，可以加校验：

\`\`\`python
class Account:
    def __init__(self):
        self._balance = 0
    
    @property
    def balance(self):       # 读取：acc.balance
        return self._balance
    
    @balance.setter
    def balance(self, value):  # 赋值：acc.balance = 100
        if value < 0:
            raise ValueError("余额不能为负")
        self._balance = value
\`\`\`

### 只读属性

只定义 getter，不定义 setter，就是只读：

\`\`\`python
class Circle:
    def __init__(self, r):
        self._r = r
    
    @property
    def area(self):
        return 3.14 * self._r ** 2   # 派生属性

c = Circle(5)
print(c.area)    # 78.5
# c.area = 100   # 报错！只读
\`\`\`

下面的 demo 详细演示各种封装手段。`,
    code: `# ==========================================
# 封装与私有属性
# ==========================================
print("=" * 45)
print("        封装与私有属性演示")
print("=" * 45)

# 1. 单下划线 _name（约定，不强制）
print()
print("=== 1. 单下划线：约定为内部使用 ===")

class Database:
    def __init__(self):
        self._connection = "数据库连接"   # 约定内部用
    
    def query(self, sql):
        # 公开方法使用内部属性
        return f"[{self._connection}] 执行: {sql}"

db = Database()
print(db.query("SELECT * FROM users"))
# 技术上能访问，但约定不让你这么做
print("外部访问 _connection：", db._connection)
print("（这只是约定，Python 不阻止）")

# 2. 双下划线 __name（名称改写）
print()
print("=== 2. 双下划线：名称改写 ===")

class Bank:
    def __init__(self):
        self.__vault = "金库密码 1234"   # 会被改名为 _Bank__vault
    
    def get_status(self):
        return "银行正常营业"

bank = Bank()
# print(bank.__vault)    # AttributeError: 找不到 __vault
# 但可以通过改写后的名字访问（不建议这么做）
print("改写后访问：", bank._Bank__vault)
print("查看对象的属性：", [attr for attr in dir(bank) if 'vault' in attr])

# 3. 名称改写避免子类冲突
print()
print("=== 3. 名称改写避免子类覆盖 ===")

class Parent:
    def __init__(self):
        self.__data = "父类数据"    # 改名为 _Parent__data

class Child(Parent):
    def __init__(self):
        super().__init__()
        self.__data = "子类数据"    # 改名为 _Child__data，不冲突

c = Child()
print("子类的 _Parent__data：", c._Parent__data)
print("子类的 _Child__data：", c._Child__data)

# 4. property 装饰器：受控访问
print()
print("=== 4. property 装饰器：getter/setter ===")

class Account:
    def __init__(self, owner, initial=0):
        self.owner = owner
        self._balance = initial    # 内部存储
    
    @property
    def balance(self):
        """getter：读取余额"""
        return self._balance
    
    @balance.setter
    def balance(self, value):
        """setter：设置余额（带校验）"""
        if not isinstance(value, (int, float)):
            raise TypeError("余额必须是数字")
        if value < 0:
            raise ValueError("余额不能为负")
        print(f"  [setter] 设置余额为 {value}")
        self._balance = value
    
    @balance.deleter
    def balance(self):
        """deleter：删除余额"""
        print(f"  [deleter] 清空 {self.owner} 的余额")
        self._balance = 0

acc = Account("小明", 100)
print(f"{acc.owner} 的余额：{acc.balance}")    # 调用 getter
acc.balance = 200    # 调用 setter
print(f"修改后：{acc.balance}")

# 校验：负数会报错
try:
    acc.balance = -50
except ValueError as e:
    print(f"设置负数失败：{e}")

# 5. 只读属性：只有 getter
print()
print("=== 5. 只读属性 ===")

class Circle:
    def __init__(self, radius):
        # 半径可写，但面积/周长是派生的只读属性
        self.radius = radius
    
    @property
    def area(self):
        """面积：根据半径计算"""
        return 3.14159 * self.radius ** 2
    
    @property
    def perimeter(self):
        """周长：根据半径计算"""
        return 2 * 3.14159 * self.radius

c = Circle(5)
print(f"半径={c.radius}，面积={c.area:.2f}，周长={c.perimeter:.2f}")
c.radius = 10    # 半径可以改
print(f"半径改为 10 后，面积={c.area:.2f}")
# c.area = 100    # AttributeError: 只读属性不能赋值

# 6. property() 函数写法（了解）
print()
print("=== 6. property() 函数写法 ===")

class Temperature:
    def __init__(self, celsius):
        self._celsius = celsius
    
    def get_celsius(self):
        return self._celsius
    
    def set_celsius(self, value):
        if value < -273.15:
            raise ValueError("低于绝对零度")
        self._celsius = value
    
    def del_celsius(self):
        print("删除温度")
        self._celsius = 0
    
    # property() 函数：传入 getter/setter/deleter
    celsius = property(get_celsius, set_celsius, del_celsius, "温度（摄氏度）")

t = Temperature(25)
print(f"温度：{t.celsius}°C")
t.celsius = 30
print(f"修改后：{t.celsius}°C")
print(f"文档字符串：{Temperature.celsius.__doc__}")

# 7. 数据校验综合示例
print()
print("=== 7. 综合示例：带校验的用户类 ===")

class User:
    def __init__(self, name, age):
        self.name = name    # 走 setter
        self.age = age      # 走 setter
    
    @property
    def name(self):
        return self._name
    
    @name.setter
    def name(self, value):
        if not isinstance(value, str):
            raise TypeError("名字必须是字符串")
        if len(value) < 2:
            raise ValueError("名字太短")
        self._name = value
    
    @property
    def age(self):
        return self._age
    
    @age.setter
    def age(self, value):
        if not isinstance(value, int):
            raise TypeError("年龄必须是整数")
        if not 0 <= value <= 150:
            raise ValueError("年龄不合理")
        self._age = value

# 正常创建
u = User("小明", 18)
print(f"用户：{u.name}，{u.age}岁")

# 校验失败的各种情况
for name, age, reason in [("A", 18, "名字太短"), ("张三", "十八", "年龄非整数"), ("李四", 200, "年龄过大")]:
    try:
        bad_user = User(name, age)
    except (ValueError, TypeError) as e:
        print(f"创建失败（{reason}）：{e}")`
  },
  {
    id: "py8-inheritance",
    group: "面向对象上",
    icon: "🧬",
    title: "继承基础",
    content: `## 什么是继承

**继承**让子类自动获得父类的属性和方法，实现**代码复用**。

\`\`\`python
class Animal:        # 父类（基类）
    def eat(self):
        print("吃东西")

class Dog(Animal):   # 子类（派生类）
    def bark(self):
        print("汪汪")
\`\`\`

### 继承语法

\`\`\`python
class Child(Parent):
    # 子类体
    pass
\`\`\`

括号里的就是父类。子类拥有父类的所有属性和方法。

### 子类拥有父类能力

\`\`\`python
dog = Dog()
dog.eat()     # 继承自 Animal
dog.bark()    # 自己的
\`\`\`

### isinstance 与 issubclass

| 函数 | 作用 | 例子 |
|------|------|------|
| \`isinstance(obj, cls)\` | 判断对象是否是类的实例 | \`isinstance(dog, Animal)\` → True |
| \`issubclass(子, 父)\` | 判断类是否是子类 | \`issubclass(Dog, Animal)\` → True |

### object 基类

Python 3 中所有类**都隐式继承 \`object\`**：

\`\`\`python
class Foo: pass
# 等价于
class Foo(object): pass

# Foo 自动获得 __str__、__eq__ 等方法
\`\`\`

### is-a 关系

继承表达的是 **"是一个"** 关系：
- 狗**是一个**动物 ✅
- 汽车**是一个**交通工具 ✅
- 学生**是一个**人 ✅

不是 is-a 就不该用继承，比如：
- 汽车**有**轮子 → 应该用组合，不是继承 ❌

### 过度继承的问题

继承层级太深会导致：
- 代码难以理解
- 修改一处影响很多类
- 父类变化牵连所有子类

**优先用组合**（has-a），必要时才用继承（is-a）。

下面的 demo 演示继承的基本用法。`,
    code: `# ==========================================
# 继承基础
# ==========================================
print("=" * 45)
print("        继承基础演示")
print("=" * 45)

# 1. 基本继承
print()
print("=== 1. 基本继承 ===")

class Animal:
    """父类：动物"""
    
    def __init__(self, name):
        self.name = name
    
    def eat(self):
        print(f"{self.name} 在吃东西")
    
    def sleep(self):
        print(f"{self.name} 在睡觉")

class Dog(Animal):
    """子类：狗，继承 Animal"""
    
    def bark(self):
        print(f"{self.name}: 汪汪！")

# 子类拥有父类的属性和方法
dog = Dog("旺财")
dog.eat()      # 继承自 Animal
dog.sleep()    # 继承自 Animal
dog.bark()     # 自己的方法
print(f"狗的名字：{dog.name}")    # 继承自 Animal.__init__

# 2. isinstance 和 issubclass
print()
print("=== 2. isinstance / issubclass ===")

print(f"dog 是 Dog 吗？{isinstance(dog, Dog)}")          # True
print(f"dog 是 Animal 吗？{isinstance(dog, Animal)}")     # True（子类实例也是父类实例）
print(f"Dog 是 Animal 的子类吗？{issubclass(Dog, Animal)}")
print(f"Animal 是 Dog 的子类吗？{issubclass(Animal, Dog)}")  # False

# 3. 所有类都继承 object
print()
print("=== 3. object 是所有类的根基 ===")

class Simple:
    pass

print(f"Simple 的父类：{Simple.__bases__}")    # (object,)
print(f"Simple 是 object 的子类吗？{issubclass(Simple, object)}")
print(f"dog 是 object 的实例吗？{isinstance(dog, object)}")

# object 提供的方法
obj_methods = [m for m in dir(object) if not m.startswith('_')]
print(f"object 的部分公开方法：{obj_methods}")

# 4. 子类添加新属性
print()
print("=== 4. 子类扩展自己的属性 ===")

class Vehicle:
    """父类：交通工具"""
    
    def __init__(self, brand):
        self.brand = brand
    
    def move(self):
        print(f"{self.brand} 在移动")

class Car(Vehicle):
    """子类：汽车"""
    
    def __init__(self, brand, doors):
        # 需要先调用父类的 __init__
        Vehicle.__init__(self, brand)    # 或用 super().__init__(brand)
        self.doors = doors    # 子类自己的属性
    
    def honk(self):
        print(f"{self.brand} 嘟嘟响，{self.doors} 门")

car = Car("比亚迪", 4)
car.move()    # 父类方法
car.honk()    # 子类方法
print(f"汽车：{car.brand}，{car.doors} 门")

# 5. is-a 关系
print()
print("=== 5. is-a 关系：合理使用继承 ===")

class Shape:
    """形状基类"""
    def area(self):
        return 0

class Circle(Shape):    # 圆 是 形状
    def __init__(self, r):
        self.r = r
    def area(self):
        return 3.14 * self.r ** 2

class Rectangle(Shape):    # 矩形 是 形状
    def __init__(self, w, h):
        self.w, self.h = w, h
    def area(self):
        return self.w * self.h

shapes = [Circle(5), Rectangle(3, 4), Circle(2)]
for s in shapes:
    # 多态：同一个 area() 调用，不同行为
    print(f"{type(s).__name__} 面积 = {s.area():.2f}")

# 6. 继承链
print()
print("=== 6. 多层继承链 ===")

class A:
    def method_a(self):
        return "A 的方法"

class B(A):
    def method_b(self):
        return "B 的方法"

class C(B):
    def method_c(self):
        return "C 的方法"

c = C()
# C 继承 B，B 继承 A
print(c.method_a())    # 来自 A
print(c.method_b())    # 来自 B
print(c.method_c())    # 来自 C
print(f"C 的继承链：{C.__mro__}")

# 7. 反面教材：过度继承
print()
print("=== 7. 过度继承的坏处（反面教材）===")

class Animal2:
    def breathe(self): return "呼吸"

class Mammal(Animal2):
    def feed_milk(self): return "喂奶"

class Dog2(Mammal):
    def bark(self): return "汪汪"

class Puppy(Dog2):
    def cute(self): return "可爱"

puppy = Puppy()
print(f"小狗能：{puppy.breathe()}, {puppy.feed_milk()}, {puppy.bark()}, {puppy.cute()}")
print("（层级太深时，修改 Animal2 会影响所有子类）")
print(f"层级深度：{len(Puppy.__mro__)} 层")

# 8. 组合优先示例
print()
print("=== 8. 组合（has-a）也很有用 ===")

class Engine:
    """引擎"""
    def start(self):
        return "引擎启动"

class Wheel:
    """轮子"""
    def roll(self):
        return "轮子转动"

class Car2:
    """汽车：组合 Engine 和 Wheel（而不是继承）"""
    def __init__(self):
        self.engine = Engine()    # 组合：有引擎
        self.wheels = [Wheel() for _ in range(4)]    # 有 4 个轮子
    
    def drive(self):
        return f"{self.engine.start()}，{self.wheels[0].roll()}"

car2 = Car2()
print(car2.drive())
print('（汽车"有"引擎和轮子 → 用组合，不是"是"引擎）')`
  },
  {
    id: "py8-super",
    group: "面向对象上",
    icon: "⬆️",
    title: "方法重写与 super",
    content: `## 方法重写（Override）

子类可以**重新定义**父类的方法，叫**重写**：

\`\`\`python
class Animal:
    def speak(self):
        return "..."

class Dog(Animal):
    def speak(self):       # 重写父类方法
        return "汪汪"
\`\`\`

### super() 调用父类方法

用 \`super()\` 在子类里调用父类被重写的方法：

\`\`\`python
class Dog(Animal):
    def speak(self):
        sound = super().speak()   # 调用父类的 speak
        return sound + " 汪汪"
\`\`\`

### super().__init__() 初始化父类

子类的 \`__init__\` 默认**不会**调用父类的 \`__init__\`，需要手动调用：

\`\`\`python
class Child(Parent):
    def __init__(self, parent_arg, child_arg):
        super().__init__(parent_arg)    # 先初始化父类部分
        self.child_arg = child_arg     # 再初始化子类部分
\`\`\`

### super() 的两种写法

| 写法 | 说明 |
|------|------|
| \`super()\` | 简洁，Python 3 推荐 |
| \`super(Child, self)\` | Python 2 风格，显式 |

### 钻石问题引入

多继承时，多个父类有同名方法，调用哪个？这就是**钻石问题**，引出 \`super()\` 的真正威力——它按 MRO 顺序传递，不只是简单调用父类。

下面的 demo 详细演示重写和 super 的用法。`,
    code: `# ==========================================
# 方法重写与 super
# ==========================================
print("=" * 45)
print("        方法重写与 super")
print("=" * 45)

# 1. 方法重写
print()
print("=== 1. 方法重写 ===")

class Animal:
    def speak(self):
        return "动物发出声音"
    
    def info(self):
        return f"我是动物"

class Dog(Animal):
    def speak(self):       # 重写父类方法
        return "汪汪！"
    
    # 不重写 info，继承父类的

class Cat(Animal):
    def speak(self):
        return "喵~"

animals = [Animal(), Dog(), Cat()]
for a in animals:
    print(f"{type(a).__name__}: {a.speak()}, {a.info()}")

# 2. super() 调用父类方法
print()
print("=== 2. super() 调用父类方法 ===")

class Animal2:
    def speak(self):
        return "（动物声）"

class Dog2(Animal2):
    def speak(self):
        # super() 拿到父类对象，调用其 speak
        parent_sound = super().speak()
        return f"{parent_sound} -> 汪汪！"

dog = Dog2()
print(dog.speak())    # 先调用父类的，再加上自己的

# 3. super().__init__() 初始化父类
print()
print("=== 3. super().__init__() 初始化父类 ===")

class Person:
    def __init__(self, name, age):
        print(f"  [Person.__init__] name={name}, age={age}")
        self.name = name
        self.age = age

class Student(Person):
    def __init__(self, name, age, school):
        # 必须先调用父类的 __init__，否则 name/age 不会被设置
        print("  [Student.__init__] 调用前")
        super().__init__(name, age)    # 初始化父类部分
        print("  [Student.__init__] 调用后")
        self.school = school          # 初始化子类自己的部分
    
    def info(self):
        return f"{self.name}, {self.age}岁, 在{self.school}上学"

s = Student("小明", 18, "清华")
print(s.info())

# 4. 不调用 super().__init__() 的后果
print()
print("=== 4. 不调用 super().__init__() 会怎样 ===")

class Base:
    def __init__(self):
        self.base_attr = "父类属性"

class BadChild(Base):
    def __init__(self):
        # 没有调用 super().__init__()
        self.child_attr = "子类属性"

class GoodChild(Base):
    def __init__(self):
        super().__init__()    # 先初始化父类
        self.child_attr = "子类属性"

bad = BadChild()
print(f"BadChild 有 child_attr: {bad.child_attr}")
try:
    print(f"BadChild 有 base_attr: {bad.base_attr}")
except AttributeError as e:
    print(f"BadChild 没有 base_attr: {e}")

good = GoodChild()
print(f"GoodChild 有 base_attr: {good.base_attr}")
print(f"GoodChild 有 child_attr: {good.child_attr}")

# 5. super() 的两种写法
print()
print("=== 5. super() 的两种写法 ===")

class Parent:
    def greet(self):
        return "父类问候"

class Child(Parent):
    def greet(self):
        # 写法1：Python 3 推荐
        a = super().greet()
        # 写法2：Python 2 风格（显式）
        b = super(Child, self).greet()
        return f"写法1={a}, 写法2={b}"

c = Child()
print(c.greet())

# 6. super() 扩展父类行为
print()
print("=== 6. super() 扩展父类行为 ===")

class BaseLogger:
    def log(self, msg):
        print(f"[LOG] {msg}")

class TimestampLogger(BaseLogger):
    def log(self, msg):
        import datetime
        ts = datetime.datetime.now().strftime("%H:%M:%S")
        # 先加时间，再调用父类的 log
        super().log(f"{ts} {msg}")

logger = TimestampLogger()
logger.log("程序启动")
logger.log("处理完成")

# 7. 钻石问题引入
print()
print("=== 7. 钻石问题引入 ===")

class A:
    def method(self):
        print("  A.method 被调用")

class B(A):
    def method(self):
        print("  B.method 被调用")
        super().method()    # 调用下一个（不一定是父类！）

class C(A):
    def method(self):
        print("  C.method 被调用")
        super().method()

class D(B, C):    # D 继承 B 和 C，B 和 C 都继承 A
    def method(self):
        print("  D.method 被调用")
        super().method()

print(f"D 的 MRO: {[c.__name__ for c in D.__mro__]}")
print("调用 d.method()：")
d = D()
d.method()
print("（注意：super 在多继承中按 MRO 顺序传递，不是简单调用父类）")

# 8. 实际应用：扩展 list
print()
print("=== 8. 实际应用：扩展 list ===")

class VerboseList(list):
    """会打印操作的列表"""
    
    def append(self, item):
        print(f"  添加：{item}")
        super().append(item)    # 调用 list 的 append
    
    def remove(self, item):
        print(f"  删除：{item}")
        super().remove(item)

vl = VerboseList()
vl.append("苹果")
vl.append("香蕉")
vl.append("橙子")
print(f"列表：{vl}")
vl.remove("香蕉")
print(f"删除后：{vl}")`
  },
  {
    id: "py8-multiple-inherit",
    group: "面向对象上",
    icon: "💎",
    title: "多重继承与 MRO",
    content: `## 多重继承

Python 允许一个类继承**多个父类**：

\`\`\`python
class Flyable:
    def fly(self):
        print("飞")

class Swimmer:
    def swim(self):
        print("游")

class Duck(Flyable, Swimmer):    # 多继承
    pass

d = Duck()
d.fly()    # 来自 Flyable
d.swim()   # 来自 Swimmer
\`\`\`

### 菱形继承问题

多个父类有**共同祖先**，方法调用顺序复杂：

\`\`\`
    A
   / \\
  B   C
   \\ /
    D
\`\`\`

D 继承 B 和 C，B 和 C 都继承 A。调用 D 的方法时，A 的方法会被调用几次？

### MRO 方法解析顺序

Python 用 **C3 线性化**算法计算方法查找顺序：

\`\`\`python
print(D.__mro__)    # 查看方法解析顺序
\`\`\`

MRO 保证：
1. 子类在父类前面
2. 多个父类按声明顺序
3. 共同祖先最后只调用一次

### C3 线性化

C3 算法的核心思想：**保证单调性**——子类的方法总在父类之前。Python 3 全部用 C3。

### super 在多继承中按 MRO 传递

\`super()\` 不一定是"父类"，而是 **MRO 中的下一个类**：

\`\`\`python
class D(B, C):
    def method(self):
        super().method()    # 调用 MRO 中 D 的下一个，可能是 B 也可能是 C
\`\`\`

### Mixin 模式

**Mixin** 是小工具类，专门给其他类添加功能，不单独使用：

\`\`\`python
class JsonMixin:
    """给类加 JSON 序列化能力"""
    def to_json(self):
        import json
        return json.dumps(self.__dict__)

class User(JsonMixin):    # 混入 JSON 能力
    def __init__(self, name):
        self.name = name
\`\`\`

### 多继承使用建议

- ✅ 用于 Mixin（小功能组合）
- ⚠️ 谨慎用于"真继承"（多个 is-a）
- ❌ 避免复杂的菱形结构
- ✅ 用 \`__mro__\` 检查顺序

下面的 demo 详细演示多继承和 MRO。`,
    code: `# ==========================================
# 多重继承与 MRO
# ==========================================
print("=" * 45)
print("        多重继承与 MRO")
print("=" * 45)

# 1. 多继承基本用法
print()
print("=== 1. 多继承基本用法 ===")

class Flyable:
    def fly(self):
        return "我能飞"
    
    def move(self):
        return f"飞行移动"

class Swimmer:
    def swim(self):
        return "我能游"
    
    def move(self):
        return f"游泳移动"

class Duck(Flyable, Swimmer):
    """鸭子：既会飞又会游"""
    def quack(self):
        return "嘎嘎"

d = Duck()
print(d.fly())     # 来自 Flyable
print(d.swim())    # 来自 Swimmer
print(d.quack())   # 自己的
# 同名方法：按继承顺序，Flyable 在前
print(f"鸭子的 move：{d.move()}")

# 2. 查看继承顺序
print()
print("=== 2. __mro__ 查看方法解析顺序 ===")

print(f"Duck 的 MRO：")
for i, cls in enumerate(Duck.__mro__):
    print(f"  [{i}] {cls.__name__}")

# 3. 菱形继承问题
print()
print("=== 3. 菱形继承 ===")

class A:
    def __init__(self):
        print("  A.__init__ 被调用")
        self.a = "A 的属性"

class B(A):
    def __init__(self):
        print("  B.__init__ 被调用")
        super().__init__()    # 关键：用 super 而不是 A.__init__
        self.b = "B 的属性"

class C(A):
    def __init__(self):
        print("  C.__init__ 被调用")
        super().__init__()
        self.c = "C 的属性"

class D(B, C):
    def __init__(self):
        print("  D.__init__ 被调用")
        super().__init__()
        self.d = "D 的属性"

print("D 的 MRO:")
for cls in D.__mro__:
    print(f"  - {cls.__name__}")

print()
print("创建 D 实例：")
d = D()
print(f"d 拥有的属性：a={d.a}, b={d.b}, c={d.c}, d={d.d}")
print("（A.__init__ 只被调用一次，这就是 MRO 的作用）")

# 4. 对比：不用 super 的问题
print()
print("=== 4. 不用 super 的菱形（错误演示）===")

class A2:
    def __init__(self):
        print("  A2.__init__ 被调用")
        self.a = "A2"

class B2(A2):
    def __init__(self):
        print("  B2.__init__ 被调用")
        A2.__init__(self)    # 直接调用 A2，不走 MRO
        self.b = "B2"

class C2(A2):
    def __init__(self):
        print("  C2.__init__ 被调用")
        A2.__init__(self)    # 又直接调用 A2
        self.c = "C2"

class D2(B2, C2):
    def __init__(self):
        print("  D2.__init__ 被调用")
        B2.__init__(self)
        C2.__init__(self)    # A2.__init__ 会被调用两次！

print("创建 D2（A2 会被初始化两次）：")
d2 = D2()
print("（这就是菱形问题，super 解决了它）")

# 5. Mixin 模式
print()
print("=== 5. Mixin 混入类 ===")

class JsonMixin:
    """Mixin：给类添加 JSON 序列化能力"""
    def to_json(self):
        import json
        return json.dumps(self.__dict__, ensure_ascii=False)

class PrintableMixin:
    """Mixin：给类添加打印能力"""
    def show(self):
        attrs = ", ".join(f"{k}={v}" for k, v in self.__dict__.items())
        print(f"{type(self).__name__}({attrs})")

class User(PrintableMixin, JsonMixin):
    """组合多个 Mixin"""
    def __init__(self, name, age):
        self.name = name
        self.age = age

u = User("小明", 18)
u.show()
print(f"JSON: {u.to_json()}")

# 6. Mixin 实战：日志 Mixin
print()
print("=== 6. Mixin 实战：日志能力 ===")

class LogMixin:
    """给类添加日志方法"""
    
    def _log(self, msg):
        print(f"  [{type(self).__name__}] {msg}")
    
    def log_info(self, msg):
        self._log(f"INFO: {msg}")
    
    def log_error(self, msg):
        self._log(f"ERROR: {msg}")

class BankAccount(LogMixin):
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance
        self.log_info(f"账户创建，余额 {balance}")
    
    def deposit(self, amount):
        self.balance += amount
        self.log_info(f"存入 {amount}，余额 {self.balance}")
    
    def withdraw(self, amount):
        if amount > self.balance:
            self.log_error(f"余额不足，尝试取 {amount}")
            return False
        self.balance -= amount
        self.log_info(f"取出 {amount}，余额 {self.balance}")
        return True

acc = BankAccount("小明", 1000)
acc.deposit(500)
acc.withdraw(200)
acc.withdraw(2000)
print(f"最终余额：{acc.balance}")

# 7. MRO 无法解决时报错
print()
print("=== 7. MRO 无法解决时报错 ===")

class P:
    pass

class Q:
    pass

class R(P, Q):    # R 要求 P 在 Q 前
    pass

class S(Q, P):    # S 要求 Q 在 P 前
    pass

try:
    class T(R, S):    # 矛盾！无法构造 MRO
        pass
except TypeError as e:
    print(f"无法创建 MRO: {e}")

# 8. 实践建议
print()
print("=== 8. 多继承使用建议 ===")
print("推荐：用 Mixin 组合小功能")
print("推荐：Mixin 不定义 __init__，只加方法")
print("谨慎：多个真父类的多继承")
print("避免：复杂的菱形结构")
print("检查：用 __mro__ 看清方法顺序")`
  },
  {
    id: "py8-polymorphism",
    group: "面向对象上",
    icon: "🎭",
    title: "多态与鸭子类型",
    content: `## 什么是多态

**多态**：同一个方法调用，不同对象表现出**不同行为**。

\`\`\`python
class Dog:
    def speak(self): return "汪汪"

class Cat:
    def speak(self): return "喵喵"

def make_sound(animal):
    animal.speak()    # 不关心类型，只要有 speak 方法

make_sound(Dog())    # 汪汪
make_sound(Cat())    # 喵喵
\`\`\`

### 重写实现多态

子类重写父类方法，调用时表现不同：

\`\`\`python
class Animal:
    def speak(self): return "..."

class Dog(Animal):
    def speak(self): return "汪汪"    # 重写

animals = [Animal(), Dog()]
for a in animals:
    print(a.speak())    # 多态
\`\`\`

### 鸭子类型

> **"如果它走起来像鸭子，叫起来像鸭子，那它就是鸭子。"**

Python 不关心**类型**，只关心**有没有需要的方法**：

\`\`\`python
class Duck:
    def quack(self): print("嘎嘎")

class Person:
    def quack(self): print("我学鸭子叫")

def make_quack(x):
    x.quack()    # 不管 x 是什么类型

make_quack(Duck())    # 嘎嘎
make_quack(Person())  # 我学鸭子叫
\`\`\`

### 协议（Protocol）

Python 用"协议"代替接口：**只关心有无方法**，不关心继承关系。比如：
- 可迭代协议：有 \`__iter__\`
- 序列协议：有 \`__getitem__\`

### typing.Protocol（Python 3.8+）

用 \`typing.Protocol\` 定义结构化类型：

\`\`\`python
from typing import Protocol

class Speaker(Protocol):
    def speak(self) -> str: ...

def make_sound(s: Speaker):
    s.speak()
\`\`\`

### 内置多态

\`len()\`、\`iter()\`、\`for\` 等内置函数天生多态：

\`\`\`python
len("abc")        # 字符串
len([1, 2, 3])    # 列表
len({"a": 1})    # 字典
\`\`\`

### abc 抽象基类简介

\`abc\` 模块定义"必须实现"的方法：

\`\`\`python
from abc import ABC, abstractmethod

class Animal(ABC):
    @abstractmethod
    def speak(self): pass

# Animal()    # 报错！不能实例化抽象类
\`\`\`

下面的 demo 详细演示多态和鸭子类型。`,
    code: `# ==========================================
# 多态与鸭子类型
# ==========================================
print("=" * 45)
print("        多态与鸭子类型")
print("=" * 45)

# 1. 多态：同名方法不同行为
print()
print("=== 1. 多态基础 ===")

class Dog:
    def speak(self):
        return "汪汪！"

class Cat:
    def speak(self):
        return "喵~"

class Cow:
    def speak(self):
        return "哞~"

# 同一个函数，接受不同类型的对象
def make_sound(animal):
    # 不关心 animal 是什么类，只要有 speak 方法
    return animal.speak()

animals = [Dog(), Cat(), Cow()]
for a in animals:
    print(f"{type(a).__name__}: {make_sound(a)}")

# 2. 继承实现多态
print()
print("=== 2. 继承 + 重写 = 多态 ===")

class Shape:
    def area(self):
        return 0
    
    def describe(self):
        return f"形状，面积={self.area()}"

class Circle(Shape):
    def __init__(self, r):
        self.r = r
    def area(self):
        return 3.14 * self.r ** 2

class Rectangle(Shape):
    def __init__(self, w, h):
        self.w, self.h = w, h
    def area(self):
        return self.w * self.h

class Triangle(Shape):
    def __init__(self, base, height):
        self.base, self.height = base, height
    def area(self):
        return 0.5 * self.base * self.height

shapes = [Circle(5), Rectangle(3, 4), Triangle(6, 8)]
for s in shapes:
    # 同一个 describe 方法，不同表现
    print(s.describe())

# 3. 鸭子类型
print()
print("=== 3. 鸭子类型 ===")

class Duck:
    def quack(self):
        return "嘎嘎"
    def walk(self):
        return "摇摇摆摆"

class Person:
    def quack(self):
        return "我学鸭子叫"
    def walk(self):
        return "我像鸭子走"

def duck_test(thing):
    # 不检查类型，只看有没有 quack 和 walk 方法
    print(f"  叫声：{thing.quack()}")
    print(f"  走路：{thing.walk()}")

print("测试真鸭子：")
duck_test(Duck())
print("测试人（学鸭子）：")
duck_test(Person())

# 4. 鸭子类型实战：文件类对象
print()
print("=== 4. 鸭子类型实战 ===")

class StringWriter:
    """模拟文件：把内容存到字符串里"""
    def __init__(self):
        self.content = ""
    
    def write(self, text):
        self.content += text
    
    def getvalue(self):
        return self.content

class FileLikeLogger:
    """模拟文件：记录日志"""
    def __init__(self):
        self.logs = []
    
    def write(self, text):
        if text.strip():
            self.logs.append(text.strip())

# 函数只关心对象有 write 方法
def write_message(writer, msg):
    writer.write(msg + "\\n")

# 真文件、StringWriter、Logger 都能用
import io
real_file = io.StringIO()    # 标准库的内存文件
sw = StringWriter()
logger = FileLikeLogger()

for w in [real_file, sw, logger]:
    write_message(w, "你好")
    write_message(w, "世界")

print(f"io.StringIO 内容：{real_file.getvalue().strip()}")
print(f"StringWriter 内容：{sw.getvalue().strip()}")
print(f"Logger 记录：{logger.logs}")

# 5. 内置多态：len, iter
print()
print("=== 5. 内置函数的多态 ===")

# len() 对不同类型都有效，只要实现了 __len__
things = ["abc", [1, 2, 3], {"a": 1, "b": 2}, (4, 5)]
for t in things:
    print(f"len({t!r:20}) = {len(t)}")

# 自定义类实现 __len__
class Stack:
    def __init__(self):
        self.items = []
    def push(self, x):
        self.items.append(x)
    def __len__(self):    # 实现 __len__ 就能用 len()
        return len(self.items)

stack = Stack()
stack.push(1)
stack.push(2)
stack.push(3)
print(f"栈的大小：{len(stack)}")    # 自动调用 __len__

# 6. for 循环的多态：可迭代协议
print()
print("=== 6. for 循环的多态（迭代器协议）===")

class Counter:
    """自定义可迭代对象：从 1 数到 n"""
    def __init__(self, n):
        self.n = n
    
    def __iter__(self):
        # 实现 __iter__ 就能用 for 循环
        i = 1
        while i <= self.n:
            yield i
            i += 1

for x in Counter(5):
    print(f"  数到：{x}")

# 也能用 list() 转换
print(f"列表化：{list(Counter(3))}")

# 7. abc 抽象基类
print()
print("=== 7. abc 抽象基类 ===")

from abc import ABC, abstractmethod

class Animal(ABC):
    """抽象基类：必须实现 speak 才能用"""
    
    def __init__(self, name):
        self.name = name
    
    @abstractmethod
    def speak(self):
        """子类必须实现这个方法"""
        pass
    
    def eat(self):
        # 普通方法，子类直接继承
        return f"{self.name} 在吃东西"

# Animal()    # 报错！抽象类不能实例化
try:
    a = Animal("测试")
except TypeError as e:
    print(f"实例化抽象类失败：{e}")

class Dog(Animal):
    def speak(self):    # 实现了抽象方法
        return f"{self.name}: 汪汪"

class Cat(Animal):
    def speak(self):
        return f"{self.name}: 喵喵"

# 现在能实例化了
dog = Dog("旺财")
cat = Cat("咪咪")
print(dog.speak())
print(dog.eat())    # 继承的普通方法
print(cat.speak())

# 多态：用基类引用子类
def make_sound(animal: Animal):
    return animal.speak()

print(make_sound(dog))
print(make_sound(cat))

# 8. typing.Protocol（Python 3.8+）
print()
print("=== 8. typing.Protocol ===")

try:
    from typing import Protocol, runtime_checkable
    
    @runtime_checkable
    class Speaker(Protocol):
        """协议：只要有 speak 方法的类型"""
        def speak(self) -> str: ...
    
    class Dog:
        def speak(self):
            return "汪汪"
    
    class Car:
        def honk(self):
            return "嘟嘟"
    
    dog = Dog()
    car = Car()
    
    # isinstance 检查协议（结构化类型）
    print(f"Dog 是 Speaker 吗？{isinstance(dog, Speaker)}")    # True
    print(f"Car 是 Speaker 吗？{isinstance(car, Speaker)}")    # False

except ImportError:
    print("（当前 Python 版本不支持 Protocol）")`
  },
  {
    id: "py8-magic-str-repr",
    group: "面向对象上",
    icon: "✨",
    title: "魔术方法 __str__ __repr__ __init__",
    content: `## 魔术方法（Dunder Methods）

**魔术方法**是 Python 中以双下划线开头和结尾的特殊方法，又叫 **dunder methods**（double underscore）：

\`\`\`python
class Foo:
    def __init__(self): ...      # 构造
    def __str__(self): ...       # 字符串表示
    def __len__(self): ...       # len() 支持
\`\`\`

它们让自定义类支持内置操作（\`print\`、\`len\`、\`+\`、\`==\` 等）。

### __str__ vs __repr__

| 方法 | 用途 | 调用方式 |
|------|------|----------|
| \`__str__\` | 用户友好的字符串 | \`print(obj)\`、\`str(obj)\` |
| \`__repr__\` | 开发者调试用，明确无歧义 | \`repr(obj)\`、交互模式直接显示 |

\`\`\`python
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    
    def __str__(self):
        return f"({self.x}, {self.y})"           # 用户看
    
    def __repr__(self):
        return f"Point({self.x}, {self.y})"      # 开发者看
\`\`\`

### 二者的 fallback 关系

- 没定义 \`__str__\` 时，\`print\` 会用 \`__repr__\`
- 没定义 \`__repr__\` 时，\`repr\` 显示默认的 \`<__main__.Point object>\`
- **建议两个都定义**，\`__repr__\` 尽量能"复制粘贴重建对象"

### __len__ 和 __bool__

\`\`\`python
class Stack:
    def __len__(self):       # 支持 len(stack)
        return len(self.items)
    
    def __bool__(self):      # 支持 if stack:
        return len(self.items) > 0
\`\`\`

### 常用魔术方法一览

| 方法 | 触发 | 例子 |
|------|------|------|
| \`__init__\` | 创建对象 | \`Foo()\` |
| \`__str__\` | print/str | \`print(obj)\` |
| \`__repr__\` | repr/调试 | \`repr(obj)\` |
| \`__len__\` | len() | \`len(obj)\` |
| \`__bool__\` | bool 判断 | \`if obj:\` |
| \`__eq__\` | == 比较 | \`obj1 == obj2\` |
| \`__lt__\` | < 比较 | \`obj1 < obj2\` |
| \`__add__\` | + 运算 | \`obj1 + obj2\` |
| \`__getitem__\` | 索引 | \`obj[key]\` |
| \`__iter__\` | 迭代 | \`for x in obj\` |
| \`__call__\` | 调用 | \`obj()\` |
| \`__enter__\`/\`__exit__\` | with 语句 | \`with obj:\` |

下面的 demo 详细演示常用魔术方法。`,
    code: `# ==========================================
# 魔术方法：__str__ __repr__ __init__
# ==========================================
print("=" * 45)
print("        魔术方法演示")
print("=" * 45)

# 1. 默认的字符串表示
print()
print("=== 1. 不定义魔术方法时 ===")

class Point1:
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point1(3, 4)
print(f"print 输出：{p}")        # 默认 <__main__.Point1 object>
print(f"str(p)  = {str(p)}")
print(f"repr(p) = {repr(p)}")

# 2. 定义 __str__
print()
print("=== 2. 只定义 __str__ ===")

class Point2:
    def __init__(self, x, y):
        self.x, self.y = x, y
    
    def __str__(self):
        return f"({self.x}, {self.y})"

p = Point2(3, 4)
print(f"print 输出：{p}")        # 调用 __str__
print(f"str(p)  = {str(p)}")
print(f"repr(p) = {repr(p)}")    # 没有 __repr__，fallback 到默认

# 3. 定义 __repr__
print()
print("=== 3. 只定义 __repr__ ===")

class Point3:
    def __init__(self, x, y):
        self.x, self.y = x, y
    
    def __repr__(self):
        # 好的 __repr__ 能复制粘贴重建对象
        return f"Point3({self.x}, {self.y})"

p = Point3(3, 4)
print(f"print 输出：{p}")        # 没有 __str__，fallback 到 __repr__
print(f"str(p)  = {str(p)}")    # 也 fallback 到 __repr__
print(f"repr(p) = {repr(p)}")    # 调用 __repr__

# 4. 同时定义两个（推荐）
print()
print("=== 4. 同时定义 __str__ 和 __repr__ ===")

class Point:
    """完整的点类"""
    
    def __init__(self, x, y):
        self.x, self.y = x, y
    
    def __str__(self):
        # 用户友好：给最终用户看
        return f"点({self.x}, {self.y})"
    
    def __repr__(self):
        # 开发者友好：明确类型，最好能重建
        return f"Point({self.x}, {self.y})"
    
    def __eq__(self, other):
        # == 比较：两个点坐标相同就相等
        if not isinstance(other, Point):
            return NotImplemented
        return self.x == other.x and self.y == other.y
    
    def __add__(self, other):
        # + 运算：两点相加
        return Point(self.x + other.x, self.y + other.y)

p1 = Point(1, 2)
p2 = Point(3, 4)
p3 = Point(1, 2)

print(f"print(p1)：{p1}")            # __str__
print(f"repr(p1)：{repr(p1)}")        # __repr__
print(f"列表里的点：{[p1, p2]}")    # 列表里用 __repr__
print(f"p1 == p3：{p1 == p3}")        # True，调用 __eq__
print(f"p1 == p2：{p1 == p2}")        # False
print(f"p1 + p2 = {p1 + p2}")         # 调用 __add__

# 验证 __repr__ 能重建对象
reconstructed = eval(repr(p1))
print(f"从 repr 重建：{reconstructed}, 等于原对象？{reconstructed == p1}")

# 5. __len__ 和 __bool__
print()
print("=== 5. __len__ 和 __bool__ ===")

class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, x):
        self.items.append(x)
    
    def pop(self):
        return self.items.pop()
    
    def __len__(self):       # 支持 len()
        return len(self.items)
    
    def __bool__(self):      # 支持 if 判断
        return len(self.items) > 0
    
    def __str__(self):
        return f"Stack({self.items})"

s = Stack()
print(f"空栈 bool：{bool(s)}")    # False
print("if s: ", end="")
if s:
    print("有内容")
else:
    print("空")

s.push(1)
s.push(2)
s.push(3)
print(f"栈：{s}, len={len(s)}")    # 调用 __len__
print(f"非空 bool：{bool(s)}")    # True
if s:
    print("if s: 栈里有东西")
print(f"弹出：{s.pop()}, 剩 {len(s)} 个")

# 6. __getitem__ 支持索引
print()
print("=== 6. __getitem__ 索引访问 ===")

class NumberSequence:
    """生成数字序列：0, 1, 4, 9, 16...（平方数）"""
    
    def __getitem__(self, index):
        # 支持 seq[i] 和 seq[a:b]
        if isinstance(index, slice):
            # 切片
            return [i ** 2 for i in range(index.start, index.stop, index.step or 1)]
        return index ** 2
    
    def __len__(self):
        # 一个"无限"序列，这里返回个大数
        return 100

seq = NumberSequence()
print(f"seq[3] = {seq[3]}")       # 9
print(f"seq[5] = {seq[5]}")       # 25
print(f"seq[0:5] = {seq[0:5]}")    # [0, 1, 4, 9, 16]

# 7. __iter__ 支持迭代
print()
print("=== 7. __iter__ 迭代 ===")

class Range2:
    """自定义 range：从 start 到 stop"""
    
    def __init__(self, start, stop):
        self.start = start
        self.stop = stop
    
    def __iter__(self):
        # 返回一个迭代器
        current = self.start
        while current < self.stop:
            yield current
            current += 1

for x in Range2(1, 5):
    print(f"  迭代到：{x}")

print(f"列表化：{list(Range2(10, 15))}")

# 8. __call__ 让实例可调用
print()
print("=== 8. __call__ 让对象可调用 ===")

class Multiplier:
    """乘法器：调用时返回乘积"""
    
    def __init__(self, factor):
        self.factor = factor
    
    def __call__(self, x):
        # 定义后实例可以像函数一样调用
        return x * self.factor

double = Multiplier(2)
triple = Multiplier(3)
print(f"double(5) = {double(5)}")    # 像函数一样调用
print(f"triple(5) = {triple(5)}")
print(f"double 是可调用对象吗？{callable(double)}")    # True

# 9. 常用魔术方法一览
print()
print("=== 9. 常用魔术方法一览 ===")
print("魔术方法            触发场景          例子")
print("-" * 55)
methods = [
    ("__init__",     "创建对象",      "Foo()"),
    ("__str__",      "print/str",     "print(obj)"),
    ("__repr__",     "repr/调试",     "repr(obj)"),
    ("__len__",      "len()",         "len(obj)"),
    ("__bool__",     "bool 判断",     "if obj:"),
    ("__eq__",       "== 比较",       "obj1 == obj2"),
    ("__lt__",       "< 比较",        "obj1 < obj2"),
    ("__add__",      "+ 运算",        "obj1 + obj2"),
    ("__getitem__",  "索引访问",      "obj[key]"),
    ("__setitem__",  "索引赋值",      "obj[key] = v"),
    ("__iter__",     "迭代",           "for x in obj"),
    ("__contains__", "in 判断",        "x in obj"),
    ("__call__",     "调用对象",      "obj()"),
    ("__enter__",    "with 进入",     "with obj:"),
    ("__exit__",     "with 退出",     "with obj:"),
]
for name, scene, ex in methods:
    print(f"{name:20}{scene:16}{ex}")`
  }
];
