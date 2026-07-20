// =============================================================
// Python 从入门到精通大全（终极版）—— 第7批章节
// 第七部分 面向对象基础（共 5 章）
// =============================================================

const chapters = [
  // =========================================================
  // 第三十一章：类与对象基础
  // =========================================================
  {
    id: "py10-ch31",
    group: "第七部分 面向对象基础",
    icon: "🏛️",
    title: "第三十一章 类与对象基础",
    content: `## 面向对象：用"对象"组织代码

**面向对象编程**（OOP）是一种组织代码的方式：把数据（属性）和操作数据的行为（方法）打包成"对象"。Python 是一门**多范式**语言，既支持面向过程，也支持面向对象，还支持函数式。掌握 OOP，你才能写出大型、可维护的程序。

### 类与对象的关系

\`\`\`python
# 类（Class）是"蓝图"或"模板"
# 对象（Object）是根据类创建的"实例"

# 定义类
class Dog:
    """狗类"""
    pass

# 创建对象（实例化）
d1 = Dog()
d2 = Dog()

print(type(d1))  # <class '__main__.Dog'>
print(d1 is d2)  # False（是两个不同的对象）

# 类就像"狗的图纸"，对象就像"按图纸造出的具体的狗"
# 一张图纸可以造出无数只狗，每只都是独立的对象
\`\`\`

## 一、\`__init__\` 与 \`self\`

\`\`\`python
class Dog:
    """狗类"""
    
    def __init__(self, name, age):
        """初始化方法（构造器）
        
        __init__ 在创建对象时自动调用
        self 指向正在创建的对象本身
        """
        # 把 name 和 age 存到对象上（实例变量）
        self.name = name
        self.age = age
        print(f"创建了一只狗：{self.name}")
    
    def bark(self):
        """狗叫的方法"""
        # self.name 访问对象的属性
        print(f"{self.name} 汪汪叫！")
    
    def describe(self):
        """描述狗的方法"""
        print(f"{self.name} 今年 {self.age} 岁")

# 创建对象时传入参数（self 自动传入，不用管）
dog1 = Dog("旺财", 3)  # 创建了一只狗：旺财
dog2 = Dog("小黑", 5)  # 创建了一只狗：小黑

# 调用方法
dog1.bark()  # 旺财 汪汪叫！
dog2.bark()  # 小黑 汪汪叫！
dog1.describe()  # 旺财 今年 3 岁
dog2.describe()  # 小黑 今年 5 岁

# 每个对象有自己的属性
print(dog1.name, dog1.age)  # 旺财 3
print(dog2.name, dog2.age)  # 小黑 5
\`\`\`

**\`self\` 的本质**：

\`\`\`python
# self 就是对象本身，调用方法时自动传入
class Foo:
    def show(self):
        print(f"我是 {self}")

f = Foo()
f.show()  # 我是 <__main__.Foo object at 0x...>

# 等价于：
Foo.show(f)  # 显式传 self（不推荐，但能说明原理）

# 不同对象的 self 是不同的
f1 = Foo()
f2 = Foo()
f1.show()  # 我是 <Foo object at 0xAAA>
f2.show()  # 我是 <Foo object at 0xBBB>（地址不同）
\`\`\`

## 二、实例变量与类变量

\`\`\`python
class Cat:
    """猫类"""
    
    # 类变量：所有实例共享，定义在类里、方法外
    species = "猫科"
    total_count = 0  # 统计创建了多少只猫
    
    def __init__(self, name, age):
        # 实例变量：每个对象独有
        self.name = name
        self.age = age
        # 修改类变量
        Cat.total_count += 1
    
    def describe(self):
        print(f"{self.name} 是一只 {self.species}，{self.age} 岁")

# 创建对象
c1 = Cat("小白", 2)
c2 = Cat("小灰", 3)

# 访问实例变量
print(c1.name)  # 小白
print(c2.name)  # 小灰

# 访问类变量：可以用实例或类访问
print(c1.species)  # 猫科
print(c2.species)  # 猫科
print(Cat.species)  # 猫科（推荐用类访问）

# 类变量被所有实例共享
print(f"已创建 {Cat.total_count} 只猫")  # 已创建 2 只猫

# ⚠️ 陷阱：用实例修改类变量
c1.species = "猫科动物"  # 这其实是给 c1 加了一个实例变量
# 不是修改类变量！

print(c1.species)  # 猫科动物（实例变量遮蔽了类变量）
print(c2.species)  # 猫科（c2 还是用类变量）
print(Cat.species)  # 猫科（类变量没变）

# 正确修改类变量
Cat.species = "猫科动物"
print(c2.species)  # 猫科动物（现在 c2 也变了）
\`\`\`

## 三、创建对象的过程

\`\`\`python
# 创建对象的完整过程
class MyClass:
    class_var = "我是类变量"
    
    def __init__(self, x):
        print("1. 调用 __init__")
        self.x = x
    
    def __new__(cls, *args, **kwargs):
        print("0. 调用 __new__（创建空对象）")
        # __new__ 创建并返回一个空对象
        # 通常不用自己写，继承自 object
        instance = super().__new__(cls)
        return instance

print("开始创建对象")
obj = MyClass(42)
print("对象创建完成")
print(f"obj.x = {obj.x}")
# 输出：
# 开始创建对象
# 0. 调用 __new__（创建空对象）
# 1. 调用 __init__
# 对象创建完成
# obj.x = 42

# 流程：
# 1. MyClass(42) 触发 __new__(MyClass, 42)
# 2. __new__ 创建一个空的 MyClass 实例
# 3. __new__ 返回实例后，调用 __init__(instance, 42)
# 4. __init__ 给实例添加属性
# 5. 返回初始化好的对象
\`\`\`

## 四、访问属性

\`\`\`python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(3, 4)

# 1. 用 . 访问
print(p.x, p.y)  # 3 4

# 2. 动态添加属性（Python 特性）
p.z = 5  # 给对象加新属性
print(p.z)  # 5

# 其他对象不受影响
p2 = Point(1, 2)
# print(p2.z)  # ❌ AttributeError

# 3. getattr / setattr / hasattr
print(getattr(p, 'x'))  # 3
setattr(p, 'color', 'red')
print(p.color)  # red
print(hasattr(p, 'color'))  # True
print(hasattr(p, 'size'))  # False

# 带默认值的 getattr
print(getattr(p, 'size', 'unknown'))  # unknown

# 4. 删除属性
del p.z
# print(p.z)  # ❌ AttributeError
\`\`\`

## 五、\`__dict__\`：对象的命名空间

\`\`\`python
class User:
    class_var = "类变量"
    
    def __init__(self, name, age):
        self.name = name
        self.age = age

u = User("张三", 25)

# 实例的 __dict__：所有实例变量
print(u.__dict__)
# {'name': '张三', 'age': 25}

# 类的 __dict__：所有类属性和方法
print(User.__dict__.keys())
# dict_keys(['__module__', '__qualname__', 'class_var', '__init__', ...])

# 修改 __dict__ 会直接影响属性
u.__dict__['email'] = 'zs@example.com'
print(u.email)  # zs@example.com

# 删除属性
del u.__dict__['email']
# print(u.email)  # ❌ AttributeError
\`\`\`

## 六、构造器的默认参数

\`\`\`python
class Car:
    def __init__(self, brand, model, year=2024, color="黑色"):
        self.brand = brand
        self.model = model
        self.year = year
        self.color = color
    
    def describe(self):
        return f"{self.year}年 {self.brand} {self.model} ({self.color})"

# 必需参数 + 可选参数
c1 = Car("丰田", "卡罗拉")
print(c1.describe())  # 2024年 丰田 卡罗拉 (黑色)

c2 = Car("本田", "思域", year=2023, color="白色")
print(c2.describe())  # 2023年 本田 思域 (白色)

# 用 **kwargs 接收任意配置
class FlexibleCar:
    def __init__(self, brand, model, **options):
        self.brand = brand
        self.model = model
        # 把 options 直接作为属性
        for key, value in options.items():
            setattr(self, key, value)

c = FlexibleCar("特斯拉", "Model 3", year=2024, color="红色", autopilot=True)
print(c.year)  # 2024
print(c.autopilot)  # True
\`\`\`

## 七、类的基本结构

\`\`\`python
class BankAccount:
    """银行账户类。
    
    属性：
        owner: 账户持有人
        balance: 余额
    """
    
    # 类变量
    bank_name = "Python 银行"
    interest_rate = 0.03  # 利率 3%
    
    def __init__(self, owner, initial_balance=0):
        """构造器"""
        self.owner = owner
        self.balance = initial_balance
        print(f"为 {owner} 开户，初始余额 {initial_balance}")
    
    def deposit(self, amount):
        """存款"""
        if amount <= 0:
            raise ValueError("存款金额必须为正")
        self.balance += amount
        print(f"{self.owner} 存入 {amount}，余额 {self.balance}")
    
    def withdraw(self, amount):
        """取款"""
        if amount <= 0:
            raise ValueError("取款金额必须为正")
        if amount > self.balance:
            raise ValueError("余额不足")
        self.balance -= amount
        print(f"{self.owner} 取出 {amount}，余额 {self.balance}")
    
    def add_interest(self):
        """加利息"""
        interest = self.balance * self.interest_rate
        self.balance += interest
        print(f"{self.owner} 获得利息 {interest:.2f}，余额 {self.balance:.2f}")
    
    def info(self):
        """显示账户信息"""
        print(f"账户: {self.owner}, 余额: {self.balance}, 银行: {self.bank_name}")

# 使用
acc = BankAccount("张三", 1000)
acc.deposit(500)    # 张三 存入 500，余额 1500
acc.withdraw(200)   # 张三 取出 200，余额 1300
acc.add_interest()  # 张三 获得利息 39.00，余额 1339.00
acc.info()          # 账户: 张三, 余额: 1339.0, 银行: Python 银行
\`\`\`

## 八、对象的字符串表示

\`\`\`python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def __str__(self):
        """用户友好的字符串（print/str 用）"""
        return f"{self.name} ({self.age} 岁)"
    
    def __repr__(self):
        """开发者友好的字符串（repr/调试用）"""
        return f"Person(name={self.name!r}, age={self.age})"

p = Person("张三", 25)

# str() 触发 __str__
print(p)  # 张三 (25 岁)
print(str(p))  # 张三 (25 岁)

# repr() 触发 __repr__
print(repr(p))  # Person(name='张三', age=25)

# 在列表里显示时用 __repr__
people = [Person("张三", 25), Person("李四", 30)]
print(people)  # [Person(name='张三', age=25), Person(name='李四', age=30)]

# 没有 __str__ 时，print 会回退到 __repr__
# 没有 __repr__ 时，显示 <__main__.Person object at 0x...>
\`\`\`

## 九、静态方法与类方法（简介）

\`\`\`python
class MathUtils:
    """数学工具类"""
    
    pi = 3.14159  # 类变量
    
    @staticmethod
    def add(a, b):
        """静态方法：不需要 self 或 cls"""
        return a + b
    
    @classmethod
    def circle_area(cls, radius):
        """类方法：用 cls 访问类"""
        return cls.pi * radius * radius

# 静态方法：用类或实例调用
print(MathUtils.add(2, 3))  # 5
m = MathUtils()
print(m.add(4, 5))  # 9

# 类方法：用类或实例调用
print(MathUtils.circle_area(2))  # 12.56636

# 详细区别在下一章讲
\`\`\`

## 十、综合示例：学生管理系统

\`\`\`python
class Student:
    """学生类"""
    
    school_name = "Python 实验学校"  # 类变量
    total_students = 0  # 类变量：统计总人数
    
    def __init__(self, name, age, grade):
        self.name = name
        self.age = age
        self.grade = grade  # 年级
        self.scores = {}  # 科目 -> 分数
        Student.total_students += 1
        self.student_id = f"S{Student.total_students:04d}"
    
    def add_score(self, subject, score):
        """添加成绩"""
        self.scores[subject] = score
    
    def average_score(self):
        """平均分"""
        if not self.scores:
            return 0
        return sum(self.scores.values()) / len(self.scores)
    
    def __str__(self):
        return f"[{self.student_id}] {self.name}, {self.age}岁, {self.grade}年级"
    
    def __repr__(self):
        return f"Student({self.name!r}, {self.age}, {self.grade!r})"

# 创建学生
s1 = Student("张三", 18, "高三")
s2 = Student("李四", 17, "高二")
s3 = Student("王五", 16, "高一")

# 添加成绩
s1.add_score("数学", 90)
s1.add_score("语文", 85)
s1.add_score("英语", 92)

s2.add_score("数学", 78)
s2.add_score("语文", 88)

# 显示信息
print(s1)  # [S0001] 张三, 18岁, 高三年级
print(s2)  # [S0002] 李四, 17岁, 高二年级

# 平均分
print(f"{s1.name} 平均分: {s1.average_score():.1f}")  # 89.0
print(f"{s2.name} 平均分: {s2.average_score():.1f}")  # 83.0

# 类变量
print(f"学校: {Student.school_name}")
print(f"总学生数: {Student.total_students}")  # 3

# 查看对象的属性
print(s1.__dict__)
# {'name': '张三', 'age': 18, 'grade': '高三', 'scores': {...}, 'student_id': 'S0001'}
\`\`\`

## 十一、类的常见陷阱

\`\`\`python
# 陷阱一：在类里直接写可变对象作为类变量
class BadClass:
    items = []  # 所有实例共享同一个列表！
    
    def add(self, item):
        self.items.append(item)

b1 = BadClass()
b2 = BadClass()
b1.add("a")
print(b2.items)  # ['a'] ← b2 也看到了！

# 正确做法：在 __init__ 里创建实例变量
class GoodClass:
    def __init__(self):
        self.items = []  # 每个实例独立
    
    def add(self, item):
        self.items.append(item)

g1 = GoodClass()
g2 = GoodClass()
g1.add("a")
print(g2.items)  # [] ← 独立的

# 陷阱二：忘记 self
class Wrong:
    def set_name(name):  # 没有 self
        # 这个方法其实是个"静态方法"（但不规范）
        pass

w = Wrong()
# w.set_name("张三")  # ❌ TypeError: 参数数量不匹配

# 正确：
class Right:
    def set_name(self, name):
        self.name = name

# 陷阱三：在 __init__ 里返回值
class BadInit:
    def __init__(self):
        self.x = 1
        # return 100  # ❌ __init__ 不能返回值（除了 None）
        # 实际上 return None 是隐式的

# 陷阱四：方法名和属性名冲突
class Conflict:
    def __init__(self):
        self.value = 10
    
    def value(self):  # ❌ 和属性 value 冲突
        return self.value * 2
\`\`\`

## 十二、类 vs 字典：何时用类

\`\`\`python
# 字典也能"模拟"对象
user_dict = {"name": "张三", "age": 25}
print(user_dict["name"])

# 类版本
class User:
    def __init__(self, name, age):
        self.name = name
        self.age = age

user_obj = User("张三", 25)
print(user_obj.name)

# 何时用类：
# 1. 数据有行为（方法）时 → 用类
# 2. 数据结构复杂、嵌套深时 → 用类
# 3. 需要类型检查时 → 用类
# 4. 多个实例共享逻辑时 → 用类

# 何时用字典：
# 1. 简单数据传递 → 用字典
# 2. JSON 序列化 → 用字典
# 3. 临时数据结构 → 用字典

# dataclass 是两者的折中（下一章讲）
from dataclasses import dataclass

@dataclass
class Point:
    x: int
    y: int

p = Point(3, 4)
print(p)  # Point(x=3, y=4)
\`\`\`

## 十三、类与对象对比表

| 概念 | 说明 | 示例 |
| --- | --- | --- |
| 类 | 模板/蓝图 | \`class Dog\` |
| 对象 | 类的实例 | \`d = Dog()\` |
| 实例化 | 创建对象 | \`Dog("旺财")\` |
| 实例变量 | 每个对象独有 | \`self.name\` |
| 类变量 | 所有对象共享 | \`Dog.species\` |
| 方法 | 类里定义的函数 | \`def bark(self)\` |
| \`self\` | 当前对象的引用 | \`self.name = name\` |
| \`__init__\` | 初始化方法 | 创建对象时自动调用 |

## 小结

本章介绍了 Python 面向对象编程的基础：

1. **类是模板，对象是实例**：一张图纸造出多个对象
2. **\`__init__\`** 是初始化方法，创建对象时自动调用
3. **\`self\`** 指向当前对象，调用方法时自动传入
4. **实例变量**每个对象独有，**类变量**所有对象共享
5. **\`__dict__\`** 查看对象或类的命名空间
6. **\`__str__\` 和 \`__repr__\`** 控制对象的字符串表示
7. **常见陷阱**：可变类变量、忘记 self、方法名冲突

OOP 是 Python 的核心范式，掌握类与对象是写出大型程序的基础。下一章我们深入**方法详解**——实例方法、类方法、静态方法的区别与应用。`
  },

  // =========================================================
  // 第三十二章：方法详解
  // =========================================================
  {
    id: "py10-ch32",
    group: "第七部分 面向对象基础",
    icon: "🔧",
    title: "第三十二章 方法详解",
    content: `## 方法：对象的行为

方法是定义在类里的函数。Python 有三种方法：**实例方法**、**类方法**、**静态方法**。理解它们的区别，才能正确设计类的接口。

## 一、实例方法

\`\`\`python
class Counter:
    """计数器类"""
    
    def __init__(self, start=0):
        self.value = start
    
    # 实例方法：第一个参数是 self（对象本身）
    def increment(self, n=1):
        """增加 n"""
        self.value += n
        return self.value
    
    def decrement(self, n=1):
        """减少 n"""
        self.value -= n
        return self.value
    
    def reset(self):
        """重置"""
        self.value = 0
        return self.value
    
    def get_value(self):
        """获取当前值"""
        return self.value

# 用实例调用：self 自动传入
c = Counter(10)
print(c.increment())    # 11
print(c.increment(5))   # 16
print(c.decrement(3))   # 13
print(c.get_value())    # 13

# 实例方法操作实例变量（self.xxx）
# 每个实例有自己的 value
c2 = Counter()
print(c2.get_value())  # 0（独立的）
\`\`\`

## 二、类方法 \`@classmethod\`

\`\`\`python
class Employee:
    """员工类"""
    
    # 类变量
    company = "Python 公司"
    total_employees = 0
    min_salary = 3000
    
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary
        Employee.total_employees += 1
    
    # 类方法：第一个参数是 cls（类本身）
    @classmethod
    def get_company_info(cls):
        """获取公司信息"""
        return f"{cls.company} 共有 {cls.total_employees} 名员工"
    
    @classmethod
    def from_string(cls, emp_str):
        """工厂方法：从字符串创建员工"""
        name, salary = emp_str.split("-")
        return cls(name, int(salary))  # cls() 等同于 Employee()
    
    @classmethod
    def raise_min_salary(cls, new_min):
        """调整最低工资"""
        old = cls.min_salary
        cls.min_salary = new_min
        print(f"最低工资从 {old} 调整为 {new_min}")

# 用类调用：cls 自动传入
print(Employee.get_company_info())  # Python 公司 共有 0 名员工

# 也可以用实例调用（但不推荐）
e1 = Employee("张三", 8000)
e2 = Employee("李四", 9000)
print(Employee.get_company_info())  # Python 公司 共有 2 名员工

# 工厂方法：替代构造器
e3 = Employee.from_string("王五-7000")
print(e3.name, e3.salary)  # 王五 7000

# 修改类变量
Employee.raise_min_salary(3500)
print(Employee.min_salary)  # 3500
\`\`\`

**类方法的核心用途：工厂方法**

\`\`\`python
class Date:
    """日期类：演示多种构造方式"""
    
    def __init__(self, year, month, day):
        self.year = year
        self.month = month
        self.day = day
    
    def __str__(self):
        return f"{self.year}-{self.month:02d}-{self.day:02d}"
    
    @classmethod
    def from_string(cls, date_str):
        """从字符串 "2024-01-15" 创建"""
        year, month, day = map(int, date_str.split("-"))
        return cls(year, month, day)
    
    @classmethod
    def from_timestamp(cls, timestamp):
        """从时间戳创建"""
        import time
        t = time.localtime(timestamp)
        return cls(t.tm_year, t.tm_mon, t.tm_mday)
    
    @classmethod
    def today(cls):
        """今天的日期"""
        import time
        t = time.localtime()
        return cls(t.tm_year, t.tm_mon, t.tm_mday)

# 多种创建方式
d1 = Date(2024, 1, 15)
d2 = Date.from_string("2024-06-20")
d3 = Date.today()

print(d1)  # 2024-01-15
print(d2)  # 2024-06-20
print(d3)  # 2024-XX-XX（今天的日期）
\`\`\`

## 三、静态方法 \`@staticmethod\`

\`\`\`python
class MathHelper:
    """数学工具类"""
    
    @staticmethod
    def is_even(n):
        """判断是否偶数"""
        return n % 2 == 0
    
    @staticmethod
    def factorial(n):
        """阶乘"""
        result = 1
        for i in range(2, n + 1):
            result *= i
        return result
    
    @staticmethod
    def gcd(a, b):
        """最大公约数"""
        while b:
            a, b = b, a % b
        return a

# 静态方法不需要 self 或 cls
print(MathHelper.is_even(4))  # True
print(MathHelper.factorial(5))  # 120
print(MathHelper.gcd(12, 18))  # 6

# 也能用实例调用（但不推荐）
m = MathHelper()
print(m.is_even(3))  # False
\`\`\`

**静态方法的合理用途：把相关函数"挂"在类下**

\`\`\`python
class StringUtils:
    """字符串工具"""
    
    @staticmethod
    def is_palindrome(s):
        """是否回文"""
        s = s.lower().replace(" ", "")
        return s == s[::-1]
    
    @staticmethod
    def reverse_words(s):
        """反转单词顺序"""
        return " ".join(s.split()[::-1])
    
    @staticmethod
    def count_vowels(s):
        """统计元音数"""
        return sum(1 for c in s.lower() if c in "aeiou")

print(StringUtils.is_palindrome("A man a plan a canal Panama"))  # True
print(StringUtils.reverse_words("hello world foo"))  # foo world hello
print(StringUtils.count_vowels("Hello World"))  # 3
\`\`\`

## 四、三种方法的对比

\`\`\`python
class Example:
    class_var = "类变量"
    
    def __init__(self):
        self.instance_var = "实例变量"
    
    # 1. 实例方法
    def instance_method(self):
        """能访问 self（实例）和类（通过 self.__class__）"""
        return f"实例方法: {self.instance_var}, {Example.class_var}"
    
    # 2. 类方法
    @classmethod
    def class_method(cls):
        """只能访问 cls（类），不能访问实例"""
        return f"类方法: {cls.class_var}"
    
    # 3. 静态方法
    @staticmethod
    def static_method():
        """既不能访问 self 也不能访问 cls"""
        return "静态方法: 我什么都不访问"

e = Example()

# 调用方式对比
print(e.instance_method())    # 实例方法: 实例变量, 类变量
print(e.class_method())       # 类方法: 类变量
print(e.static_method())      # 静态方法: 我什么都不访问

# 用类调用：实例方法需要手动传 self
# Example.instance_method()  # ❌ 缺少 self
Example.class_method()    # ✅
Example.static_method()   # ✅
\`\`\`

| 方法类型 | 装饰器 | 第一个参数 | 能访问 | 典型用途 |
| --- | --- | --- | --- | --- |
| 实例方法 | 无 | \`self\` | 实例 + 类 | 操作实例状态 |
| 类方法 | \`@classmethod\` | \`cls\` | 类（不能访问实例） | 工厂方法、修改类变量 |
| 静态方法 | \`@staticmethod\` | 无 | 都不能访问 | 工具函数 |

## 五、何时用哪种方法

\`\`\`python
class BankAccount:
    """银行账户：演示三种方法的选择"""
    
    # 类变量
    bank_name = "Python 银行"
    interest_rate = 0.03
    accounts = []  # 所有账户
    
    def __init__(self, owner, balance=0):
        # 实例变量
        self.owner = owner
        self.balance = balance
        self.account_number = f"ACC{len(BankAccount.accounts) + 1:04d}"
        BankAccount.accounts.append(self)
    
    # 实例方法：操作具体账户
    def deposit(self, amount):
        """存钱：操作 self.balance"""
        self.balance += amount
        return self.balance
    
    def withdraw(self, amount):
        """取钱：操作 self.balance"""
        if amount > self.balance:
            raise ValueError("余额不足")
        self.balance -= amount
        return self.balance
    
    # 类方法：操作类级别的东西
    @classmethod
    def set_interest_rate(cls, rate):
        """修改利率：操作类变量"""
        cls.interest_rate = rate
    
    @classmethod
    def get_total_deposits(cls):
        """获取所有账户的总存款"""
        return sum(acc.balance for acc in cls.accounts)
    
    @classmethod
    def from_json(cls, json_str):
        """工厂方法：从 JSON 创建"""
        import json
        data = json.loads(json_str)
        return cls(data["owner"], data["balance"])
    
    # 静态方法：和类相关但不依赖实例/类状态
    @staticmethod
    def calculate_interest(principal, rate, years):
        """计算利息：纯计算，不依赖任何状态"""
        return principal * rate * years

# 使用
acc1 = BankAccount("张三", 1000)
acc2 = BankAccount("李四", 2000)

# 实例方法
acc1.deposit(500)
print(acc1.balance)  # 1500

# 类方法
BankAccount.set_interest_rate(0.04)
print(BankAccount.interest_rate)  # 0.04
print(f"总存款: {BankAccount.get_total_deposits()}")  # 3500

# 静态方法
interest = BankAccount.calculate_interest(1000, 0.04, 5)
print(f"5 年利息: {interest}")  # 200.0
\`\`\`

## 六、方法重载（Python 不支持）

\`\`\`python
# Python 不支持方法重载（同名方法，不同参数）
# 后定义的方法会覆盖前面的

class BadOverload:
    def do_something(self, x):
        return f"版本1: {x}"
    
    def do_something(self, x, y):  # 覆盖了前面的
        return f"版本2: {x}, {y}"

b = BadOverload()
# b.do_something(1)  # ❌ TypeError: 缺少 y
print(b.do_something(1, 2))  # 版本2: 1, 2

# 替代方案 1：用默认参数
class GoodExample1:
    def do_something(self, x, y=None):
        if y is None:
            return f"版本1: {x}"
        return f"版本2: {x}, {y}"

e1 = GoodExample1()
print(e1.do_something(1))     # 版本1: 1
print(e1.do_something(1, 2))  # 版本2: 1, 2

# 替代方案 2：用 *args
class GoodExample2:
    def do_something(self, *args):
        if len(args) == 1:
            return f"版本1: {args[0]}"
        elif len(args) == 2:
            return f"版本2: {args[0]}, {args[1]}"
        raise TypeError("参数数量错误")

e2 = GoodExample2()
print(e2.do_something(1))     # 版本1: 1
print(e2.do_something(1, 2))  # 版本2: 1, 2

# 替代方案 3：用类型检查（不推荐，违反 Python 风格）
class GoodExample3:
    def do_something(self, x, y=None):
        if isinstance(x, str):
            return f"字符串版本: {x}"
        elif isinstance(x, int):
            return f"整数版本: {x}"

e3 = GoodExample3()
print(e3.do_something("hello"))  # 字符串版本: hello
print(e3.do_something(42))       # 整数版本: 42

# 替代方案 4：用 singledispatch
from functools import singledispatchmethod

class Processor:
    @singledispatchmethod
    def process(self, data):
        raise TypeError(f"不支持 {type(data)}")
    
    @process.register
    def _(self, data: str):
        return f"处理字符串: {data}"
    
    @process.register
    def _(self, data: int):
        return f"处理整数: {data}"
    
    @process.register
    def _(self, data: list):
        return f"处理列表，长度 {len(data)}"

p = Processor()
print(p.process("hello"))  # 处理字符串: hello
print(p.process(42))       # 处理整数: 42
print(p.process([1, 2]))   # 处理列表，长度 2
\`\`\`

## 七、方法的特殊调用

\`\`\`python
class MyClass:
    def __init__(self, value):
        self.value = value
    
    def show(self):
        print(f"value = {self.value}")

obj = MyClass(42)

# 1. 常规调用
obj.show()  # value = 42

# 2. 通过类调用（需要手动传 self）
MyClass.show(obj)  # value = 42

# 3. 方法对象本身
method = obj.show
print(method)  # <bound method ...>
method()  # value = 42

# 4. 未绑定的方法（Python 3 中其实就是函数）
unbound = MyClass.show
print(unbound)  # <function ...>
unbound(obj)  # value = 42
\`\`\`

## 八、私有方法（约定）

\`\`\`python
class Database:
    def __init__(self):
        self.connected = False
    
    def connect(self):
        """公共方法：连接数据库"""
        self._open_connection()  # 调用"私有"方法
        self._authenticate()
        self.connected = True
        print("数据库已连接")
    
    def _open_connection(self):
        """私有方法（约定：单下划线开头）"""
        print("打开 socket 连接...")
    
    def _authenticate(self):
        """私有方法"""
        print("认证中...")
    
    def __super_secret(self):
        """更私有的方法（双下划线开头，会改名）"""
        print("超级秘密")

db = Database()
db.connect()
# 打开 socket 连接...
# 认证中...
# 数据库已连接

# 单下划线：约定私有，但能访问
db._open_connection()  # 能调用，但不推荐

# 双下划线：改名了
# db.__super_secret()  # ❌ AttributeError
db._Database__super_secret()  # 能调用（改名后）
\`\`\`

## 九、抽象方法（简介）

\`\`\`python
from abc import ABC, abstractmethod

class Animal(ABC):
    """抽象基类"""
    
    @abstractmethod
    def speak(self):
        """子类必须实现"""
        pass
    
    @abstractmethod
    def move(self):
        """子类必须实现"""
        pass
    
    def breathe(self):
        """具体方法：子类直接继承"""
        print("呼吸中...")

# animal = Animal()  # ❌ 抽象类不能实例化

class Dog(Animal):
    def speak(self):
        print("汪汪！")
    
    def move(self):
        print("跑")

class Cat(Animal):
    def speak(self):
        print("喵喵！")
    
    def move(self):
        print("走")

dog = Dog()
dog.speak()    # 汪汪！
dog.move()     # 跑
dog.breathe()  # 呼吸中...

cat = Cat()
cat.speak()    # 喵喵！
\`\`\`

## 十、综合示例：购物车系统

\`\`\`python
class Product:
    """商品类"""
    
    def __init__(self, name, price):
        self.name = name
        self.price = price
    
    def __str__(self):
        return f"{self.name} (¥{self.price})"

class ShoppingCart:
    """购物车类"""
    
    # 类变量
    max_items = 50
    
    def __init__(self, customer_name):
        self.customer_name = customer_name
        self.items = []  # [(product, quantity), ...]
    
    # 实例方法
    def add_item(self, product, quantity=1):
        """添加商品"""
        if len(self.items) >= self.max_items:
            raise ValueError("购物车已满")
        # 如果已存在，增加数量
        for i, (p, q) in enumerate(self.items):
            if p.name == product.name:
                self.items[i] = (p, q + quantity)
                return
        self.items.append((product, quantity))
    
    def remove_item(self, product_name):
        """移除商品"""
        self.items = [(p, q) for p, q in self.items if p.name != product_name]
    
    def get_total(self):
        """计算总价"""
        return sum(p.price * q for p, q in self.items)
    
    def __str__(self):
        lines = [f"购物车 - {self.customer_name}:"]
        for product, qty in self.items:
            lines.append(f"  {product} x {qty}")
        lines.append(f"总计: ¥{self.get_total()}")
        return "\\n".join(lines)
    
    # 类方法
    @classmethod
    def change_max_items(cls, new_max):
        """修改最大商品数"""
        cls.max_items = new_max
    
    # 静态方法
    @staticmethod
    def format_price(amount):
        """格式化价格"""
        return f"¥{amount:.2f}"

# 使用
cart = ShoppingCart("张三")
cart.add_item(Product("Python 书", 59), 2)
cart.add_item(Product("键盘", 199))
cart.add_item(Product("鼠标", 89))

print(cart)
# 购物车 - 张三:
#   Python 书 (¥59) x 2
#   键盘 (¥199) x 1
#   鼠标 (¥89) x 1
# 总计: ¥406

print(ShoppingCart.format_price(cart.get_total()))  # ¥406.00
\`\`\`

## 十一、方法设计原则

\`\`\`python
# 1. 单一职责：每个方法只做一件事
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email
    
    # ❌ 不好：一个方法做太多事
    def save_and_send_email(self):
        # 保存到数据库
        # 发送邮件
        # 记录日志
        pass
    
    # ✅ 好：拆成多个方法
    def save(self):
        """只负责保存"""
        pass
    
    def send_email(self):
        """只负责发邮件"""
        pass

# 2. 命名清晰：方法名说明做什么
class Calculator:
    # ❌ 不好：名字含糊
    def process(self, x, y):
        pass
    
    # ✅ 好：名字清晰
    def add(self, x, y):
        return x + y

# 3. 不要返回多个不同类型
class Bad:
    def get_data(self, id):
        if id == 0:
            return None  # 可能返回 None
        elif id == 1:
            return "string"  # 可能返回字符串
        else:
            return [1, 2, 3]  # 可能返回列表
\`\`\`

## 十二、方法 vs 普通函数

\`\`\`python
# 方法本质上就是定义在类命名空间里的函数
class MyClass:
    def my_method(self, x):
        return x * 2

# 等价于：
def my_function(self, x):
    return x * 2

class MyClass2:
    my_method = my_function

obj = MyClass()
obj2 = MyClass2()
print(obj.my_method(5))   # 10
print(obj2.my_method(5))  # 10

# 方法是"绑定"的：绑定到具体实例
m = obj.my_method
print(m)  # <bound method MyClass.my_method of <__main__.MyClass object at 0x...>>
m(10)  # 自动传 obj 作为 self
\`\`\`

## 小结

本章详细介绍了 Python 的三种方法：

1. **实例方法**：第一个参数 \`self\`，能访问实例和类，最常用
2. **类方法 \`@classmethod\`**：第一个参数 \`cls\`，用于工厂方法、修改类变量
3. **静态方法 \`@staticmethod\`**：无 \`self\`/\`cls\`，相当于挂在类下的普通函数
4. **工厂方法**：\`@classmethod\` 的核心用途，提供多种构造方式
5. **方法重载**：Python 不支持，用默认参数、\`*args\`、\`singledispatch\` 替代
6. **私有方法**：单下划线约定，双下划线改名
7. **抽象方法**：\`@abstractmethod\` 强制子类实现

下一章我们学习**属性与描述符**——更精细地控制属性的访问。`
  },

  // =========================================================
  // 第三十三章：属性与描述符
  // =========================================================
  {
    id: "py10-ch33",
    group: "第七部分 面向对象基础",
    icon: "📋",
    title: "第三十三章 属性与描述符",
    content: `## 属性：对象的"数据接口"

直接暴露属性（\`obj.x = 5\`）简单但不安全：无法校验、无法计算、无法拦截。Python 的 \`@property\` 装饰器和**描述符协议**让你能精细控制属性的访问、修改、删除。

## 一、\`@property\` 装饰器

\`\`\`python
class Circle:
    """圆形类：演示 @property"""
    
    def __init__(self, radius):
        self._radius = radius  # 用下划线表示"内部使用"
    
    # getter：读取 radius 时调用
    @property
    def radius(self):
        """获取半径"""
        print("读取 radius")
        return self._radius
    
    # setter：设置 radius 时调用
    @radius.setter
    def radius(self, value):
        """设置半径，带校验"""
        print(f"设置 radius = {value}")
        if value < 0:
            raise ValueError("半径不能为负数")
        self._radius = value
    
    # deleter：删除 radius 时调用
    @radius.deleter
    def radius(self):
        """删除半径"""
        print("删除 radius")
        del self._radius
    
    # 计算属性：只有 getter，没有 setter
    @property
    def area(self):
        """面积（自动计算）"""
        import math
        return math.pi * self._radius ** 2
    
    @property
    def circumference(self):
        """周长（自动计算）"""
        import math
        return 2 * math.pi * self._radius

c = Circle(5)

# 读取：触发 getter
print(c.radius)  # 读取 radius → 5

# 设置：触发 setter（带校验）
c.radius = 10  # 设置 radius = 10
# c.radius = -1  # ❌ ValueError: 半径不能为负数

# 计算属性：像属性一样访问，但每次计算
print(c.area)  # 314.159...
print(c.circumference)  # 62.831...

# 删除：触发 deleter
del c.radius
# print(c.radius)  # ❌ AttributeError
\`\`\`

## 二、为什么用 @property

\`\`\`python
# 场景：一开始用普通属性，后来发现需要校验

# 版本 1：直接用属性
class TemperatureV1:
    def __init__(self, celsius):
        self.celsius = celsius  # 直接暴露

t1 = TemperatureV1(25)
t1.celsius = -300  # 没人拦你，但 -300°C 不合理
print(t1.celsius)  # -300

# 版本 2：要加校验，改成方法
class TemperatureV2:
    def __init__(self, celsius):
        self._celsius = celsius
    
    def get_celsius(self):
        return self._celsius
    
    def set_celsius(self, value):
        if value < -273.15:
            raise ValueError("低于绝对零度")
        self._celsius = value

t2 = TemperatureV2(25)
t2.set_celsius(30)  # 所有调用方都要改成 set_celsius
# t2.celsius = 30  # ❌ 不能这样写了
# 问题：所有使用 t.celsius 的代码都要改！

# 版本 3：用 @property，调用方不用改
class TemperatureV3:
    def __init__(self, celsius):
        # 注意：setter 会被调用
        self.celsius = celsius
    
    @property
    def celsius(self):
        return self._celsius
    
    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError("低于绝对零度")
        self._celsius = value

t3 = TemperatureV3(25)
t3.celsius = 30  # ✅ 调用方代码不用改
# t3.celsius = -300  # ❌ ValueError: 低于绝对零度
print(t3.celsius)  # 30

# 好处：先写简单属性，将来需要时改成 @property，调用方无感知
\`\`\`

## 三、计算属性

\`\`\`python
class Rectangle:
    """矩形：演示计算属性"""
    
    def __init__(self, width, height):
        self.width = width
        self.height = height
    
    @property
    def area(self):
        """面积：自动计算，不用手动维护"""
        return self.width * self.height
    
    @property
    def perimeter(self):
        """周长"""
        return 2 * (self.width + self.height)
    
    @property
    def is_square(self):
        """是否正方形"""
        return self.width == self.height

r = Rectangle(4, 5)
print(r.area)       # 20（自动计算）
print(r.perimeter)  # 18

# 修改 width，area 自动更新
r.width = 6
print(r.area)  # 30（不用手动同步）

# 对比：如果用普通属性
class BadRectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.area = width * height  # 必须手动维护
    
    def set_width(self, w):
        self.width = w
        self.area = w * self.height  # 容易忘记同步！

# 计算属性的好处：自动同步，不会忘记更新
\`\`\`

## 四、属性校验

\`\`\`python
class Person:
    """带校验的 Person"""
    
    def __init__(self, name, age):
        self.name = name  # 会触发 setter
        self.age = age    # 会触发 setter
    
    @property
    def name(self):
        return self._name
    
    @name.setter
    def name(self, value):
        if not isinstance(value, str):
            raise TypeError("name 必须是字符串")
        if len(value) == 0:
            raise ValueError("name 不能为空")
        self._name = value
    
    @property
    def age(self):
        return self._age
    
    @age.setter
    def age(self, value):
        if not isinstance(value, int):
            raise TypeError("age 必须是整数")
        if value < 0 or value > 150:
            raise ValueError("age 必须在 0-150 之间")
        self._age = value

p = Person("张三", 25)
print(p.name, p.age)  # 张三 25

# 触发校验
try:
    p.age = -5
except ValueError as e:
    print(e)  # age 必须在 0-150 之间

try:
    p.name = ""
except ValueError as e:
    print(e)  # name 不能为空

try:
    p.age = "25"
except TypeError as e:
    print(e)  # age 必须是整数
\`\`\`

## 五、只读属性

\`\`\`python
class BankAccount:
    """银行账户：余额只读"""
    
    def __init__(self, owner, initial_balance):
        self.owner = owner
        self._balance = initial_balance  # 内部用 _balance
    
    @property
    def balance(self):
        """余额：只读，不能直接修改"""
        return self._balance
    
    def deposit(self, amount):
        """存钱：唯一修改余额的方式"""
        if amount <= 0:
            raise ValueError("金额必须为正")
        self._balance += amount
        return self._balance
    
    def withdraw(self, amount):
        """取钱"""
        if amount <= 0:
            raise ValueError("金额必须为正")
        if amount > self._balance:
            raise ValueError("余额不足")
        self._balance -= amount
        return self._balance

acc = BankAccount("张三", 1000)
print(acc.balance)  # 1000（能读）

# acc.balance = 2000  # ❌ AttributeError: 不能直接设置

# 必须通过方法修改
acc.deposit(500)
print(acc.balance)  # 1500

acc.withdraw(200)
print(acc.balance)  # 1300
\`\`\`

## 六、属性的缓存

\`\`\`python
class DataProcessor:
    """数据处理器：缓存计算结果"""
    
    def __init__(self, data):
        self._data = data
        self._cached_stats = None  # 缓存
    
    @property
    def data(self):
        return self._data
    
    @data.setter
    def data(self, value):
        self._data = value
        self._cached_stats = None  # 数据变了，清空缓存
    
    @property
    def stats(self):
        """统计信息：第一次计算后缓存"""
        if self._cached_stats is None:
            print("计算中...")  # 模拟耗时
            self._cached_stats = {
                "count": len(self._data),
                "sum": sum(self._data),
                "avg": sum(self._data) / len(self._data) if self._data else 0,
                "max": max(self._data) if self._data else None,
                "min": min(self._data) if self._data else None,
            }
        return self._cached_stats

dp = DataProcessor([1, 2, 3, 4, 5])

# 第一次访问：会计算
print(dp.stats)  # 计算中... → {count: 5, sum: 15, ...}

# 第二次访问：用缓存
print(dp.stats)  # 直接返回（不打印"计算中"）

# 修改数据：缓存失效
dp.data = [10, 20, 30]
print(dp.stats)  # 计算中... → 新的统计
\`\`\`

## 七、描述符协议

\`\`\`python
# 描述符：实现了 __get__、__set__、__delete__ 的类
# 用描述符可以创建可复用的属性逻辑

class ValidatedAttribute:
    """带类型校验的描述符"""
    
    def __init__(self, name, expected_type):
        self.name = name
        self.expected_type = expected_type
    
    def __set_name__(self, owner, name):
        """Python 3.6+：自动获取属性名"""
        self.name = name
    
    def __get__(self, obj, objtype=None):
        """读取时调用"""
        if obj is None:
            return self  # 类访问时返回描述符本身
        return obj.__dict__.get(self.name)
    
    def __set__(self, obj, value):
        """设置时调用：带校验"""
        if not isinstance(value, self.expected_type):
            raise TypeError(
                f"{self.name} 必须是 {self.expected_type.__name__}, "
                f"实际是 {type(value).__name__}"
            )
        obj.__dict__[self.name] = value

class User:
    """使用描述符"""
    name = ValidatedAttribute("name", str)
    age = ValidatedAttribute("age", int)
    email = ValidatedAttribute("email", str)
    
    def __init__(self, name, age, email):
        self.name = name
        self.age = age
        self.email = email

u = User("张三", 25, "zs@example.com")
print(u.name, u.age, u.email)

# 类型校验
try:
    u.age = "25"
except TypeError as e:
    print(e)  # age 必须是 int, 实际是 str

try:
    u.name = 123
except TypeError as e:
    print(e)  # name 必须是 str, 实际是 int
\`\`\`

## 八、描述符实战：范围校验

\`\`\`python
class Range:
    """范围校验描述符"""
    
    def __init__(self, min_value=None, max_value=None):
        self.min_value = min_value
        self.max_value = max_value
    
    def __set_name__(self, owner, name):
        self.name = name
    
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)
    
    def __set__(self, obj, value):
        if self.min_value is not None and value < self.min_value:
            raise ValueError(f"{self.name} 不能小于 {self.min_value}")
        if self.max_value is not None and value > self.max_value:
            raise ValueError(f"{self.name} 不能大于 {self.max_value}")
        obj.__dict__[self.name] = value

class Student:
    """学生类：用 Range 描述符"""
    score = Range(0, 100)  # 分数 0-100
    age = Range(6, 100)    # 年龄 6-100
    
    def __init__(self, name, age, score):
        self.name = name
        self.age = age
        self.score = score

s = Student("张三", 18, 85)
print(s.age, s.score)  # 18 85

try:
    s.score = 150
except ValueError as e:
    print(e)  # score 不能大于 100

try:
    s.age = 3
except ValueError as e:
    print(e)  # age 不能小于 6
\`\`\`

## 九、数据描述符 vs 非数据描述符

\`\`\`python
# 数据描述符：同时实现 __get__ 和 __set__
# 非数据描述符：只实现 __get__

# 数据描述符优先级高于实例变量
# 非数据描述符优先级低于实例变量

class DataDesc:
    """数据描述符"""
    def __get__(self, obj, objtype=None):
        return "数据描述符的值"
    def __set__(self, obj, value):
        print(f"数据描述符拦截设置: {value}")

class NonDataDesc:
    """非数据描述符"""
    def __get__(self, obj, objtype=None):
        return "非数据描述符的值"

class MyClass:
    data_desc = DataDesc()
    non_data_desc = NonDataDesc()
    
    def __init__(self):
        # 试图在实例 __dict__ 里覆盖
        self.__dict__['data_desc'] = "实例的值"
        self.__dict__['non_data_desc'] = "实例的值"

obj = MyClass()

# 数据描述符优先：用描述符，不用实例变量
print(obj.data_desc)  # 数据描述符的值

# 非数据描述符被实例变量覆盖
print(obj.non_data_desc)  # 实例的值

# 实际意义：
# - @property 是数据描述符（有 __set__），所以能拦截赋值
# - 普通方法是非数据描述符，所以能被实例属性覆盖
\`\`\`

## 十、\`property\` 的等价写法

\`\`\`python
# @property 装饰器本质是 property 类的实例
# 下面两种写法等价

# 写法 1：用装饰器（推荐）
class PersonV1:
    def __init__(self, name):
        self._name = name
    
    @property
    def name(self):
        return self._name
    
    @name.setter
    def name(self, value):
        self._name = value

# 写法 2：用 property 类
class PersonV2:
    def __init__(self, name):
        self._name = name
    
    def _get_name(self):
        return self._name
    
    def _set_name(self, value):
        self._name = value
    
    name = property(_get_name, _set_name)

p1 = PersonV1("张三")
p2 = PersonV2("李四")
print(p1.name, p2.name)  # 张三 李四

# property 的完整参数：property(fget, fset, fdel, doc)
class PersonV3:
    def __init__(self, name):
        self._name = name
    
    def get_name(self):
        return self._name
    
    def set_name(self, value):
        self._name = value
    
    def del_name(self):
        del self._name
    
    name = property(get_name, set_name, del_name, "人的名字")

print(PersonV3.name.__doc__)  # 人的名字
\`\`\`

## 十一、综合示例：温度转换器

\`\`\`python
class Temperature:
    """温度类：支持摄氏度和华氏度互转"""
    
    def __init__(self, celsius=0):
        self.celsius = celsius  # 触发 setter
    
    @property
    def celsius(self):
        """摄氏度"""
        return self._celsius
    
    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError("低于绝对零度")
        self._celsius = value
    
    @property
    def fahrenheit(self):
        """华氏度（自动计算）"""
        return self._celsius * 9 / 5 + 32
    
    @fahrenheit.setter
    def fahrenheit(self, value):
        """设置华氏度，自动转换"""
        self.celsius = (value - 32) * 5 / 9  # 复用 celsius 的校验
    
    @property
    def kelvin(self):
        """开尔文"""
        return self._celsius + 273.15
    
    @kelvin.setter
    def kelvin(self, value):
        self.celsius = value - 273.15
    
    def __str__(self):
        return f"{self.celsius:.1f}°C = {self.fahrenheit:.1f}°F = {self.kelvin:.2f}K"

# 使用
t = Temperature(25)  # 25°C
print(t)
# 25.0°C = 77.0°F = 298.15K

# 用华氏度设置
t.fahrenheit = 100
print(t.celsius)  # 37.78（自动转换）

# 用开尔文设置
t.kelvin = 300
print(t.celsius)  # 26.85

# 校验仍然生效
try:
    t.celsius = -300
except ValueError as e:
    print(e)  # 低于绝对零度
\`\`\`

## 十二、属性 vs 私有变量 + getter/setter

\`\`\`python
# Java 风格：私有变量 + getter/setter
class JavaStyle:
    def __init__(self):
        self._value = 0
    
    def getValue(self):
        return self._value
    
    def setValue(self, value):
        if value < 0:
            raise ValueError("不能为负")
        self._value = value

j = JavaStyle()
j.setValue(10)
print(j.getValue())  # 10

# Python 风格：用 @property
class PythonStyle:
    def __init__(self):
        self._value = 0
    
    @property
    def value(self):
        return self._value
    
    @value.setter
    def value(self, val):
        if val < 0:
            raise ValueError("不能为负")
        self._value = val

p = PythonStyle()
p.value = 10  # 像属性一样赋值
print(p.value)  # 10

# Python 风格更简洁、更符合直觉
\`\`\`

## 十三、属性的常见陷阱

\`\`\`python
# 陷阱一：在 __init__ 里循环引用
class Bad:
    @property
    def x(self):
        return self.x  # ❌ 递归！返回 self.x 又触发 getter
    
    # 正确：用 _x 内部存储
    # @property
    # def x(self):
    #     return self._x

# 陷阱二：getter 里做副作用
class Bad2:
    @property
    def data(self):
        # ❌ 不应该在 getter 里修改状态
        self.access_count += 1
        return self._data

# 陷阱三：用 property 做耗时操作
class Bad3:
    @property
    def result(self):
        # ❌ 访问属性应该很快，不应该耗时
        # 如果耗时，应该用方法：def calculate_result(self)
        import time
        time.sleep(10)  # 10 秒！
        return 42
\`\`\`

## 十四、描述符 vs @property 对比

| 特性 | @property | 描述符 |
| --- | --- | --- |
| 用途 | 单个类的单个属性 | 跨多个类复用属性逻辑 |
| 复杂度 | 简单 | 较复杂 |
| 灵活性 | 中 | 高 |
| 可复用 | 否 | 是 |
| 典型场景 | 校验、计算属性 | 框架、ORM |

\`\`\`python
# 描述符的优势：可复用
class NonNegative:
    """可复用的非负校验描述符"""
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, objtype=None):
        return obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        if value < 0:
            raise ValueError(f"{self.name} 不能为负")
        obj.__dict__[self.name] = value

class Product:
    price = NonNegative()
    stock = NonNegative()
    
    def __init__(self, price, stock):
        self.price = price
        self.stock = stock

class Order:
    quantity = NonNegative()
    discount = NonNegative()
    
    def __init__(self, quantity, discount):
        self.quantity = quantity
        self.discount = discount

# 一个描述符，多个类多个属性复用
\`\`\`

## 小结

本章介绍了 Python 的属性与描述符：

1. **\`@property\`** 把方法变成属性，支持 getter/setter/deleter
2. **计算属性**：只有 getter，自动计算，自动同步
3. **属性校验**：在 setter 里检查类型和范围
4. **只读属性**：只定义 getter，不定义 setter
5. **属性缓存**：第一次计算后缓存，数据变化时清空
6. **描述符协议**：\`__get__\`、\`__set__\`、\`__delete__\`
7. **数据 vs 非数据描述符**：前者优先级高于实例变量
8. **何时用描述符**：属性逻辑需要跨类复用时

@property 是 Python 控制属性访问的标准方式，几乎每个 Python 类都会用到。描述符更高级，是 ORM、框架的基础。下一章我们学习**继承与多态**——OOP 的核心机制。`
  },

  // =========================================================
  // 第三十四章：继承与多态
  // =========================================================
  {
    id: "py10-ch34",
    group: "第七部分 面向对象基础",
    icon: "🧬",
    title: "第三十四章 继承与多态",
    content: `## 继承：代码复用的核心机制

**继承**让一个类（子类）获得另一个类（父类）的属性和方法。这避免了重复代码，并建立了类的层次结构。**多态**让不同类型的对象对同一消息做出不同响应——这是 OOP 最强大的特性之一。

## 一、基本继承

\`\`\`python
# 父类（基类）
class Animal:
    """动物基类"""
    
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def eat(self):
        print(f"{self.name} 在吃东西")
    
    def sleep(self):
        print(f"{self.name} 在睡觉")
    
    def speak(self):
        """发声：子类应该重写"""
        print(f"{self.name} 发出声音")

# 子类继承父类
class Dog(Animal):
    """狗类：继承 Animal"""
    
    def __init__(self, name, age, breed):
        # 调用父类的 __init__
        super().__init__(name, age)
        self.breed = breed  # 子类新增属性
    
    # 重写父类方法
    def speak(self):
        print(f"{self.name} 汪汪叫！")
    
    # 新增方法
    def fetch(self):
        print(f"{self.name} 在捡球")

class Cat(Animal):
    """猫类：继承 Animal"""
    
    def speak(self):
        print(f"{self.name} 喵喵叫！")
    
    def climb(self):
        print(f"{self.name} 在爬树")

# 创建子类对象
dog = Dog("旺财", 3, "金毛")
cat = Cat("小白", 2)

# 继承了父类的方法
dog.eat()   # 旺财 在吃东西
dog.sleep() # 旺财 在睡觉
cat.eat()   # 小白 在吃东西

# 多态：同样的方法，不同行为
dog.speak()  # 旺财 汪汪叫！（Dog 的版本）
cat.speak()  # 小白 喵喵叫！（Cat 的版本）

# 子类特有方法
dog.fetch()  # 旺财 在捡球
cat.climb()  # 小白 在爬树

# 子类新增属性
print(dog.breed)  # 金毛
\`\`\`

## 二、\`super()\` 详解

\`\`\`python
class Parent:
    def __init__(self, name):
        print(f"Parent.__init__({name})")
        self.name = name
    
    def greet(self):
        print(f"我是 {self.name}")

class Child(Parent):
    def __init__(self, name, age):
        # super() 返回父类的"代理对象"
        # 调用父类的 __init__，避免重复代码
        super().__init__(name)  # 等价于 Parent.__init__(self, name)
        print(f"Child.__init__({name}, {age})")
        self.age = age
    
    def greet(self):
        # 调用父类的 greet，然后扩展
        super().greet()  # 先打印"我是 xxx"
        print(f"我今年 {self.age} 岁")  # 再打印年龄

c = Child("张三", 25)
# Parent.__init__(张三)
# Child.__init__(张三, 25)

c.greet()
# 我是 张三
# 我今年 25 岁

# super() 不只是调用父类，它遵循 MRO（方法解析顺序）
# 在多继承中尤其重要
\`\`\`

## 三、方法重写（Override）

\`\`\`python
class Shape:
    """图形基类"""
    
    def __init__(self, name):
        self.name = name
    
    def area(self):
        """面积：子类必须重写"""
        raise NotImplementedError("子类必须实现 area 方法")
    
    def describe(self):
        """描述：通用方法，子类可以重写也可以不重写"""
        return f"这是一个 {self.name}，面积是 {self.area()}"

class Circle(Shape):
    def __init__(self, radius):
        super().__init__("圆形")
        self.radius = radius
    
    def area(self):
        import math
        return math.pi * self.radius ** 2

class Rectangle(Shape):
    def __init__(self, width, height):
        super().__init__("矩形")
        self.width = width
        self.height = height
    
    def area(self):
        return self.width * self.height

class Triangle(Shape):
    def __init__(self, base, height):
        super().__init__("三角形")
        self.base = base
        self.height = height
    
    def area(self):
        return 0.5 * self.base * self.height

# 多态：同一个 describe 方法，不同行为
shapes = [
    Circle(5),
    Rectangle(4, 6),
    Triangle(3, 8),
]

for shape in shapes:
    print(shape.describe())
# 这是一个 圆形，面积是 78.53981633974483
# 这是一个 矩形，面积是 24
# 这是一个 三角形，面积是 12.0
\`\`\`

## 四、多态的本质

\`\`\`python
# 多态：不同对象对同一消息做出不同响应
# Python 的多态是"鸭子类型"：不看类型，看行为

class Dog:
    def speak(self):
        return "汪汪"

class Cat:
    def speak(self):
        return "喵喵"

class Duck:
    def speak(self):
        return "嘎嘎"

# 这个函数不关心对象是什么类型
# 只要它有 speak 方法就行
def make_speak(animal):
    print(animal.speak())

# 传入不同类型的对象
dog = Dog()
cat = Cat()
duck = Duck()

make_speak(dog)   # 汪汪
make_speak(cat)   # 喵喵
make_speak(duck)  # 嘎嘎

# 甚至可以传入"看起来像动物"的东西
class Robot:
    def speak(self):
        return "哔哔"

make_speak(Robot())  # 哔哔

# 这就是鸭子类型："如果它走起来像鸭子，叫起来像鸭子，那它就是鸭子"
# 不需要继承关系，只要有同名方法即可
\`\`\`

## 五、\`isinstance\` 和 \`issubclass\`

\`\`\`python
class Animal:
    pass

class Dog(Animal):
    pass

class Cat(Animal):
    pass

dog = Dog()

# isinstance：判断对象是不是某个类的实例
print(isinstance(dog, Dog))     # True
print(isinstance(dog, Animal))  # True（Dog 是 Animal 的子类）
print(isinstance(dog, Cat))     # False

# issubclass：判断类是不是另一个类的子类
print(issubclass(Dog, Animal))  # True
print(issubclass(Dog, Cat))    # False
print(issubclass(Animal, object))  # True（所有类都是 object 的子类）

# isinstance 也支持元组
print(isinstance(dog, (Dog, Cat)))  # True（是其中之一即可）

# type() vs isinstance()
print(type(dog) == Dog)      # True（严格匹配类型）
print(type(dog) == Animal)   # False（不考虑继承）
print(isinstance(dog, Animal))  # True（考虑继承）

# 推荐：用 isinstance，更灵活
\`\`\`

## 六、多继承

\`\`\`python
# Python 支持多继承：一个子类可以有多个父类
class Swimmer:
    """会游泳的"""
    def swim(self):
        print(f"{self.name} 在游泳")
    
    def move(self):
        print(f"{self.name} 游动")

class Flyer:
    """会飞的"""
    def fly(self):
        print(f"{self.name} 在飞")
    
    def move(self):
        print(f"{self.name} 飞行")

class Duck(Swimmer, Flyer):
    """鸭子：既会游泳又会飞"""
    
    def __init__(self, name):
        self.name = name
    
    # 自己实现 move，避免歧义
    def move(self):
        print(f"{self.name} 可以游泳或飞行")

duck = Duck("唐老鸭")
duck.swim()  # 唐老鸭 在游泳
duck.fly()   # 唐老鸭 在飞
duck.move()  # 唐老鸭 可以游泳或飞行

# 如果子类没重写 move，会用哪个父类的？
# 答案：按 MRO 顺序，Swimmer 的 move（继承列表从左到右）
\`\`\`

## 七、MRO（方法解析顺序）

\`\`\`python
# MRO：Method Resolution Order，方法查找顺序
# Python 用 C3 线性化算法计算 MRO

class A:
    def method(self):
        print("A.method")

class B(A):
    def method(self):
        print("B.method")

class C(A):
    def method(self):
        print("C.method")

class D(B, C):
    pass

d = D()
d.method()  # B.method

# 查看 MRO
print(D.__mro__)
# (<class 'D'>, <class 'B'>, <class 'C'>, <class 'A'>, <class 'object'>)

# 查找 method 时按顺序：D → B → C → A → object
# B 有 method，所以用 B 的

# MRO 规则：
# 1. 子类在父类前面
# 2. 多个父类按定义顺序
# 3. 任何类只出现一次
\`\`\`

## 八、菱形继承问题

\`\`\`python
# 菱形继承：D 继承 B 和 C，B 和 C 都继承 A
#
#     A
#    / \\
#   B   C
#    \\ /
#     D

class A:
    def __init__(self):
        print("A.__init__")
        self.x = "A 的 x"

class B(A):
    def __init__(self):
        print("B.__init__")
        super().__init__()  # 调用下一个（按 MRO）
        self.y = "B 的 y"

class C(A):
    def __init__(self):
        print("C.__init__")
        super().__init__()  # 调用下一个（按 MRO）
        self.z = "C 的 z"

class D(B, C):
    def __init__(self):
        print("D.__init__")
        super().__init__()  # 调用下一个（按 MRO）

print("=== 创建 D ===")
d = D()
# D.__init__
# B.__init__
# C.__init__
# A.__init__

# MRO 是 D → B → C → A → object
# super() 按 MRO 调用，不是简单调用"父类"
# 所以 A.__init__ 只被调用一次！

print(d.x, d.y, d.z)  # A 的 x, B 的 y, C 的 z

# 如果用旧式写法（直接调用父类），A.__init__ 会被调用两次：
# class B(A):
#     def __init__(self):
#         A.__init__(self)  # 直接调用 A
# class C(A):
#     def __init__(self):
#         A.__init__(self)  # 直接调用 A
# class D(B, C):
#     def __init__(self):
#         B.__init__(self)
#         C.__init__(self)  # A 被调用两次！

# 所以多继承时一定要用 super()，不要直接调用父类
\`\`\`

## 九、\`super()\` 的完整参数

\`\`\`python
# super() 有两种形式：
# 1. super()  # 隐式，等价于 super(当前类, self)
# 2. super(Class, instance)  # 显式

class Base:
    def method(self):
        print("Base.method")

class Derived(Base):
    def method(self):
        # 显式形式：跳过 Derived，从 Base 开始查找
        super(Derived, self).method()
        # 等价于 super().method()

d = Derived()
d.method()  # Base.method

# 显式形式的用途：在多继承中精确控制
class A:
    def method(self):
        print("A")

class B(A):
    def method(self):
        print("B")
        super(B, self).method()  # 调用 A.method

class C(A):
    def method(self):
        print("C")
        super(C, self).method()  # 调用 A.method

class D(B, C):
    def method(self):
        print("D")
        # 跳过 B，从 C 开始
        super(B, self).method()  # 调用 C.method

D().method()
# D
# C
# A
\`\`\`

## 十、抽象基类与多态

\`\`\`python
from abc import ABC, abstractmethod

class PaymentMethod(ABC):
    """支付方式抽象基类"""
    
    @abstractmethod
    def pay(self, amount):
        """支付：子类必须实现"""
        pass
    
    @abstractmethod
    def refund(self, amount):
        """退款：子类必须实现"""
        pass
    
    def verify(self):
        """通用方法：子类直接继承"""
        print("验证支付信息...")

class CreditCard(PaymentMethod):
    """信用卡支付"""
    
    def pay(self, amount):
        print(f"信用卡支付 {amount} 元")
    
    def refund(self, amount):
        print(f"信用卡退款 {amount} 元")

class Alipay(PaymentMethod):
    """支付宝支付"""
    
    def pay(self, amount):
        print(f"支付宝支付 {amount} 元")
    
    def refund(self, amount):
        print(f"支付宝退款 {amount} 元")

# 抽象类不能实例化
# pm = PaymentMethod()  # ❌ TypeError

# 子类必须实现所有抽象方法
cc = CreditCard()
cc.pay(100)    # 信用卡支付 100 元
cc.refund(50)  # 信用卡退款 50 元
cc.verify()    # 验证支付信息...

# 多态：统一处理不同支付方式
def process_payment(method: PaymentMethod, amount: float):
    """处理支付"""
    method.verify()
    method.pay(amount)

process_payment(CreditCard(), 100)
process_payment(Alipay(), 200)
\`\`\`

## 十一、组合 vs 继承

\`\`\`python
# 继承：is-a 关系（是什么）
# 组合：has-a 关系（有什么）

# 继承：Dog is an Animal
class Animal:
    def breathe(self):
        print("呼吸")

class Dog(Animal):
    def bark(self):
        print("汪汪")

# 组合：Car has an Engine
class Engine:
    def start(self):
        print("引擎启动")
    
    def stop(self):
        print("引擎停止")

class Wheel:
    def rotate(self):
        print("轮子转动")

class Car:
    """汽车：组合了引擎和轮子"""
    
    def __init__(self):
        self.engine = Engine()  # 组合
        self.wheels = [Wheel() for _ in range(4)]  # 组合
    
    def start(self):
        self.engine.start()
        for wheel in self.wheels:
            wheel.rotate()
        print("汽车启动")

car = Car()
car.start()
# 引擎启动
# 轮子转动
# 轮子转动
# 轮子转动
# 轮子转动
# 汽车启动

# 优先用组合，继承要谨慎
# 继承的问题：耦合度高，父类改动影响所有子类
# 组合更灵活：可以运行时更换组件
\`\`\`

## 十二、\`object\` 基类

\`\`\`python
# 所有类都隐式继承 object
class MyClass:
    pass

# 等价于 class MyClass(object): pass

# object 提供了一些默认方法
obj = MyClass()
print(obj)  # <__main__.MyClass object at 0x...>（用 object.__str__）

# object 的常用方法
print(obj.__hash__())  # 默认基于 id 的哈希
print(obj == obj)      # True（默认比较 id）

# 重写 object 的方法
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def __eq__(self, other):
        """重写相等比较"""
        if not isinstance(other, Person):
            return False
        return self.name == other.name and self.age == other.age
    
    def __hash__(self):
        """重写哈希（和 __eq__ 一起重写）"""
        return hash((self.name, self.age))

p1 = Person("张三", 25)
p2 = Person("张三", 25)
p3 = Person("李四", 30)

print(p1 == p2)  # True（值相等）
print(p1 == p3)  # False
print(p1 is p2)  # False（不是同一个对象）

# 重写了 __eq__ 和 __hash__ 后，可以用作字典键
d = {p1: "user1"}
print(d[p2])  # user1（用 p2 也能找到，因为值相等）
\`\`\`

## 十三、综合示例：图形系统

\`\`\`python
from abc import ABC, abstractmethod
import math

class Shape(ABC):
    """图形抽象基类"""
    
    def __init__(self, color="黑色"):
        self.color = color
    
    @abstractmethod
    def area(self):
        """面积"""
        pass
    
    @abstractmethod
    def perimeter(self):
        """周长"""
        pass
    
    def describe(self):
        """通用描述方法"""
        return (
            f"{self.__class__.__name__} "
            f"(颜色: {self.color}, "
            f"面积: {self.area():.2f}, "
            f"周长: {self.perimeter():.2f})"
        )

class Circle(Shape):
    def __init__(self, radius, color="红色"):
        super().__init__(color)
        self.radius = radius
    
    def area(self):
        return math.pi * self.radius ** 2
    
    def perimeter(self):
        return 2 * math.pi * self.radius

class Rectangle(Shape):
    def __init__(self, width, height, color="蓝色"):
        super().__init__(color)
        self.width = width
        self.height = height
    
    def area(self):
        return self.width * self.height
    
    def perimeter(self):
        return 2 * (self.width + self.height)

class Square(Rectangle):
    """正方形：继承矩形"""
    def __init__(self, side, color="绿色"):
        super().__init__(side, side, color)  # 宽高相同

class Triangle(Shape):
    def __init__(self, a, b, c, color="黄色"):
        super().__init__(color)
        self.a, self.b, self.c = a, b, c
    
    def area(self):
        # 海伦公式
        s = (self.a + self.b + self.c) / 2
        return math.sqrt(s * (s - self.a) * (s - self.b) * (s - self.c))
    
    def perimeter(self):
        return self.a + self.b + self.c

# 多态：统一处理所有图形
shapes = [
    Circle(5),
    Rectangle(4, 6),
    Square(3),
    Triangle(3, 4, 5),
]

print("=== 所有图形 ===")
for shape in shapes:
    print(shape.describe())

# 计算总面积
total_area = sum(shape.area() for shape in shapes)
print(f"\\n总面积: {total_area:.2f}")

# 找面积最大的
biggest = max(shapes, key=lambda s: s.area())
print(f"面积最大: {biggest.describe()}")
\`\`\`

## 十四、继承的注意事项

\`\`\`python
# 1. 不要为了复用代码而滥用继承
# ❌ 不好：Stack 继承 list，只是为了复用 list 的方法
class BadStack(list):
    def push(self, item):
        self.append(item)
    def pop(self):
        return super().pop()

# 问题：BadStack 暴露了 list 的所有方法，包括 insert、sort 等
# 用户可能不小心破坏栈结构

# ✅ 好：用组合
class GoodStack:
    def __init__(self):
        self._items = []  # 组合
    
    def push(self, item):
        self._items.append(item)
    
    def pop(self):
        if not self._items:
            raise IndexError("栈为空")
        return self._items.pop()
    
    def peek(self):
        return self._items[-1]
    
    def is_empty(self):
        return len(self._items) == 0
    
    def __len__(self):
        return len(self._items)

# 2. 继承层次不要太深
# A → B → C → D → E  ❌ 太深，难维护
# 最多 2-3 层

# 3. 子类不应该违反父类的契约
# 如果父类的 method 返回 int，子类重写后不能返回 str
\`\`\`

## 十五、继承 vs 多态对比

| 概念 | 说明 | 关键 |
| --- | --- | --- |
| 继承 | 子类获得父类的属性和方法 | 代码复用、建立层次 |
| 多态 | 不同对象对同一消息不同响应 | 同一接口，不同实现 |
| 重写 | 子类重新定义父类方法 | 改变行为 |
| 重载 | 同名方法不同参数（Python 不支持） | — |
| 抽象类 | 不能实例化，定义接口 | 强制子类实现 |

## 小结

本章介绍了 Python 的继承与多态：

1. **继承**：子类获得父类的属性和方法，用 \`class Child(Parent)\` 语法
2. **\`super()\`**：调用父类方法，遵循 MRO，多继承必备
3. **方法重写**：子类重新定义父类方法，实现多态
4. **多态**：同一接口，不同行为，Python 用鸭子类型实现
5. **\`isinstance\` / \`issubclass\`**：判断类型关系
6. **多继承**：支持但要用 \`super()\`，避免菱形问题
7. **MRO**：C3 线性化，决定方法查找顺序
8. **抽象基类**：\`ABC\` + \`@abstractmethod\`，强制子类实现接口
9. **组合优于继承**：降低耦合，更灵活

继承和多态是 OOP 的精髓，但不要滥用——优先用组合，只在真正的"is-a"关系时用继承。下一章我们学习**魔术方法入门**——让自定义类像内置类型一样工作。`
  },

  // =========================================================
  // 第三十五章：魔术方法入门
  // =========================================================
  {
    id: "py10-ch35",
    group: "第七部分 面向对象基础",
    icon: "✨",
    title: "第三十五章 魔术方法入门",
    content: `## 魔术方法：让自定义类像内置类型一样工作

**魔术方法**（Magic Methods）是 Python中以双下划线开头和结尾的方法（如 \`__init__\`、\`__str__\`）。它们让自定义类支持内置操作：打印、比较、运算、迭代、长度等。掌握魔术方法，你的类就能像 \`list\`、\`str\` 一样自然。

## 一、\`__str__\` 和 \`__repr__\`

\`\`\`python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __str__(self):
        """用户友好的字符串（print / str 用）"""
        return f"({self.x}, {self.y})"
    
    def __repr__(self):
        """开发者友好的字符串（repr / 调试用）
        
        理想情况下，eval(repr(obj)) 应该能重建对象
        """
        return f"Point({self.x!r}, {self.y!r})"

p = Point(3, 4)

# print 用 __str__
print(p)  # (3, 4)

# repr 用 __repr__
print(repr(p))  # Point(3, 4)

# 在列表里显示用 __repr__
points = [Point(1, 2), Point(3, 4)]
print(points)  # [Point(1, 2), Point(3, 4)]

# 只有 __repr__ 时，print 也会用它
class OnlyRepr:
    def __repr__(self):
        return "OnlyRepr()"

obj = OnlyRepr()
print(obj)  # OnlyRepr()（没有 __str__，回退到 __repr__）

# 规则：至少实现 __repr__，最好两个都实现
\`\`\`

## 二、\`__len__\`、\`__getitem__\`、\`__setitem__\`

\`\`\`python
class Playlist:
    """播放列表：支持 len、索引访问"""
    
    def __init__(self, name, songs=None):
        self.name = name
        self.songs = songs if songs is not None else []
    
    def __len__(self):
        """支持 len(playlist)"""
        return len(self.songs)
    
    def __getitem__(self, index):
        """支持 playlist[i] 和 playlist[1:3]"""
        if isinstance(index, slice):
            # 切片
            return Playlist(f"{self.name} (切片)", self.songs[index])
        return self.songs[index]
    
    def __setitem__(self, index, value):
        """支持 playlist[i] = value"""
        self.songs[index] = value
    
    def __delitem__(self, index):
        """支持 del playlist[i]"""
        del self.songs[index]
    
    def __contains__(self, item):
        """支持 item in playlist"""
        return item in self.songs
    
    def __str__(self):
        return f"{self.name}: {self.songs}"

playlist = Playlist("我的歌单", ["歌A", "歌B", "歌C", "歌D"])

# len
print(len(playlist))  # 4

# 索引访问
print(playlist[0])  # 歌A
print(playlist[-1])  # 歌D

# 切片
sub = playlist[1:3]
print(sub)  # 我的歌单 (切片): ['歌B', '歌C']

# 修改
playlist[0] = "新歌A"
print(playlist)  # 我的歌单: ['新歌A', '歌B', '歌C', '歌D']

# 删除
del playlist[0]
print(playlist)  # 我的歌单: ['歌B', '歌C', '歌D']

# in 检查
print("歌B" in playlist)  # True
print("歌X" in playlist)  # False
\`\`\`

## 三、\`__iter__\` 和 \`__next__\`

\`\`\`python
class NumberRange:
    """自定义数字范围：支持 for 循环"""
    
    def __init__(self, start, end, step=1):
        self.start = start
        self.end = end
        self.step = step
        self.current = start
    
    def __iter__(self):
        """返回迭代器（通常是 self）"""
        self.current = self.start  # 重置
        return self
    
    def __next__(self):
        """返回下一个值"""
        if self.current >= self.end:
            raise StopIteration
        value = self.current
        self.current += self.step
        return value

# 支持 for 循环
for n in NumberRange(1, 10, 2):
    print(n, end=" ")  # 1 3 5 7 9
print()

# 支持解包
a, b, c = NumberRange(1, 4)
print(a, b, c)  # 1 2 3

# 支持 list、sum 等
print(list(NumberRange(0, 5)))  # [0, 1, 2, 3, 4]
print(sum(NumberRange(1, 101)))  # 5050
\`\`\`

## 四、比较运算 \`__eq__\`、\`__lt__\` 等

\`\`\`python
from functools import total_ordering

@total_ordering  # 只实现 __eq__ 和 __lt__，自动补全其他
class Version:
    """版本号：支持比较"""
    
    def __init__(self, major, minor, patch=0):
        self.major = major
        self.minor = minor
        self.patch = patch
    
    def __eq__(self, other):
        if not isinstance(other, Version):
            return NotImplemented
        return (self.major, self.minor, self.patch) == (other.major, other.minor, other.patch)
    
    def __lt__(self, other):
        if not isinstance(other, Version):
            return NotImplemented
        return (self.major, self.minor, self.patch) < (other.major, other.minor, other.patch)
    
    def __repr__(self):
        return f"Version({self.major}, {self.minor}, {self.patch})"
    
    def __str__(self):
        return f"{self.major}.{self.minor}.{self.patch}"

v1 = Version(1, 2, 3)
v2 = Version(2, 0, 0)
v3 = Version(1, 2, 3)

# == 用 __eq__
print(v1 == v3)  # True
print(v1 == v2)  # False

# < 用 __lt__
print(v1 < v2)  # True

# > <= >= 自动生成（@total_ordering）
print(v2 > v1)    # True
print(v1 <= v3)   # True
print(v1 >= v3)   # True

# 排序
versions = [Version(2, 0), Version(1, 5), Version(1, 2), Version(3, 0)]
sorted_versions = sorted(versions)
print(sorted_versions)  # [Version(1, 2, 0), Version(1, 5, 0), Version(2, 0, 0), Version(3, 0, 0)]
\`\`\`

## 五、\`__hash__\` 和 \`__bool__\`

\`\`\`python
class Color:
    """颜色：可哈希，可作字典键"""
    
    def __init__(self, r, g, b):
        self.r = r
        self.g = g
        self.b = b
    
    def __eq__(self, other):
        if not isinstance(other, Color):
            return False
        return (self.r, self.g, self.b) == (other.r, other.g, other.b)
    
    def __hash__(self):
        """可哈希：能用作字典键、能放入集合"""
        return hash((self.r, self.g, self.b))
    
    def __repr__(self):
        return f"Color({self.r}, {self.g}, {self.b})"

# 可哈希：能放入集合
colors = {Color(255, 0, 0), Color(0, 255, 0), Color(255, 0, 0)}
print(colors)  # {Color(255, 0, 0), Color(0, 255, 0)}（重复的被去重）

# 能用作字典键
color_names = {
    Color(255, 0, 0): "红色",
    Color(0, 255, 0): "绿色",
    Color(0, 0, 255): "蓝色",
}
print(color_names[Color(255, 0, 0)])  # 红色

# __bool__
class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        self.items.append(item)
    
    def pop(self):
        return self.items.pop()
    
    def __bool__(self):
        """定义 truthy/falsy"""
        return len(self.items) > 0
    
    def __len__(self):
        return len(self.items)

stack = Stack()
print(bool(stack))  # False（空栈是 falsy）

if not stack:
    print("栈是空的")

stack.push(1)
print(bool(stack))  # True（有元素是 truthy）

if stack:
    print("栈不空")
\`\`\`

## 六、\`__format__\`

\`\`\`python
class Money:
    """金额类：支持格式化"""
    
    def __init__(self, amount, currency="CNY"):
        self.amount = amount
        self.currency = currency
    
    def __format__(self, format_spec):
        """支持 format() 和 f-string"""
        if format_spec == "":
            return f"{self.amount:.2f} {self.currency}"
        elif format_spec == "short":
            return f"{self.amount:.0f}{self.currency}"
        elif format_spec == "long":
            currencies = {"CNY": "人民币", "USD": "美元", "EUR": "欧元"}
            name = currencies.get(self.currency, self.currency)
            return f"{self.amount:.2f} {name}"
        elif format_spec == "symbol":
            symbols = {"CNY": "¥", "USD": "$", "EUR": "€"}
            sym = symbols.get(self.currency, "")
            return f"{sym}{self.amount:.2f}"
        return str(self)
    
    def __str__(self):
        return f"{self.amount:.2f} {self.currency}"

price = Money(99.5, "USD")

# 用 format()
print(format(price, ""))       # 99.50 USD
print(format(price, "short"))  # 100USD
print(format(price, "long"))   # 99.50 美元
print(format(price, "symbol")) # $99.50

# 用 f-string
print(f"价格: {price}")                    # 价格: 99.50 USD
print(f"价格: {price:short}")              # 价格: 100USD
print(f"价格: {price:symbol}")             # 价格: $99.50
\`\`\`

## 七、\`__call__\`：让对象可调用

\`\`\`python
class Multiplier:
    """乘法器：对象可以像函数一样调用"""
    
    def __init__(self, factor):
        self.factor = factor
    
    def __call__(self, x):
        """让对象可调用"""
        return x * self.factor

# 创建对象
double = Multiplier(2)
triple = Multiplier(3)

# 像函数一样调用
print(double(5))  # 10
print(triple(5))  # 15

# callable() 检查
print(callable(double))  # True
print(callable(42))      # False

# 实际应用：带状态的"函数"
class Counter:
    """计数器：记录调用次数"""
    
    def __init__(self):
        self.count = 0
    
    def __call__(self):
        self.count += 1
        return self.count

c = Counter()
print(c())  # 1
print(c())  # 2
print(c())  # 3
print(c.count)  # 3

# 实际应用：缓存"函数"
class CachedFunction:
    def __init__(self, func):
        self.func = func
        self.cache = {}
    
    def __call__(self, *args):
        if args not in self.cache:
            self.cache[args] = self.func(*args)
        return self.cache[args]

@CachedFunction
def slow_square(n):
    print(f"计算 {n}...")
    return n * n

print(slow_square(4))  # 计算 4... → 16
print(slow_square(4))  # 16（用缓存）
\`\`\`

## 八、\`__enter__\` 和 \`__exit__\`：上下文管理器

\`\`\`python
class FileManager:
    """文件管理器：支持 with 语句"""
    
    def __init__(self, filename, mode):
        self.filename = filename
        self.mode = mode
        self.file = None
    
    def __enter__(self):
        """进入 with 块时调用"""
        print(f"打开文件 {self.filename}")
        self.file = open(self.filename, self.mode)
        return self.file  # 返回给 as 后的变量
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """离开 with 块时调用（无论是否异常）"""
        print(f"关闭文件 {self.filename}")
        if self.file:
            self.file.close()
        # 返回 False（或不返回）表示不吞异常
        # 返回 True 表示吞掉异常
        return False

# 使用 with
with FileManager("/tmp/test.txt", "w") as f:
    f.write("Hello")
# 打开文件 /tmp/test.txt
# 关闭文件 /tmp/test.txt

# 实际应用：数据库事务
class DatabaseTransaction:
    def __init__(self, db):
        self.db = db
    
    def __enter__(self):
        print("开始事务")
        return self.db
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            print("提交事务")
        else:
            print(f"回滚事务（异常: {exc_val}）")
        return False

# 模拟使用
class FakeDB:
    def execute(self, sql):
        print(f"执行: {sql}")

db = FakeDB()
with DatabaseTransaction(db) as conn:
    conn.execute("INSERT ...")
    conn.execute("UPDATE ...")
# 开始事务
# 执行: INSERT ...
# 执行: UPDATE ...
# 提交事务
\`\`\`

## 九、\`__add__\` 等运算符（简介）

\`\`\`python
class Vector:
    """二维向量：支持 + - * 等运算"""
    
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __add__(self, other):
        """v1 + v2"""
        return Vector(self.x + other.x, self.y + other.y)
    
    def __sub__(self, other):
        """v1 - v2"""
        return Vector(self.x - other.x, self.y - other.y)
    
    def __mul__(self, scalar):
        """v * 数字"""
        if isinstance(scalar, (int, float)):
            return Vector(self.x * scalar, self.y * scalar)
        return NotImplemented
    
    def __rmul__(self, scalar):
        """数字 * v（反向乘法）"""
        return self.__mul__(scalar)
    
    def __eq__(self, other):
        if not isinstance(other, Vector):
            return False
        return self.x == other.x and self.y == other.y
    
    def __abs__(self):
        """abs(v)：向量的模"""
        return (self.x ** 2 + self.y ** 2) ** 0.5
    
    def __repr__(self):
        return f"Vector({self.x}, {self.y})"

v1 = Vector(3, 4)
v2 = Vector(1, 2)

# 加法
print(v1 + v2)  # Vector(4, 6)

# 减法
print(v1 - v2)  # Vector(2, 2)

# 标量乘法
print(v1 * 2)   # Vector(6, 8)
print(2 * v1)   # Vector(6, 8)（用 __rmul__）

# 比较
print(v1 == Vector(3, 4))  # True

# 模
print(abs(v1))  # 5.0（3-4-5 三角形）
\`\`\`

## 十、\`__new__\`：控制对象创建

\`\`\`python
class Singleton:
    """单例模式：只有一个实例"""
    
    _instance = None
    
    def __new__(cls, *args, **kwargs):
        """控制对象的创建"""
        if cls._instance is None:
            print("创建单例实例")
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self, value=None):
        if not hasattr(self, '_initialized'):
            self.value = value
            self._initialized = True

# 创建多次，但只有一个实例
s1 = Singleton("first")   # 创建单例实例
s2 = Singleton("second")  # 不创建（已存在）

print(s1 is s2)  # True（同一个对象）
print(s1.value)  # first（__init__ 不会再覆盖）

# 实际应用：不可变类型
class ImmutablePoint:
    """不可变的点"""
    
    def __new__(cls, x, y):
        # 创建后不能修改
        instance = super().__new__(cls)
        instance._x = x  # 用私有变量
        instance._y = y
        return instance
    
    @property
    def x(self):
        return self._x
    
    @property
    def y(self):
        return self._y

p = ImmutablePoint(3, 4)
print(p.x, p.y)  # 3 4
# p.x = 5  # ❌ AttributeError（没有 setter）
\`\`\`

## 十一、\`__slots__\`：限制属性

\`\`\`python
class Point:
    """用 __slots__ 限制属性"""
    
    __slots__ = ('x', 'y')  # 只允许有 x 和 y 属性
    
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(3, 4)
print(p.x, p.y)

# p.z = 5  # ❌ AttributeError: 不能添加 z

# 好处：
# 1. 节省内存（不用 __dict__）
# 2. 访问更快
# 3. 防止拼写错误（p.x 写成 p.xx 会报错）

# 对比：不用 __slots__
class NormalPoint:
    def __init__(self, x, y):
        self.x = x
        self.y = y

import sys
p1 = Point(3, 4)
p2 = NormalPoint(3, 4)
print(sys.getsizeof(p1))  # 较小
print(sys.getsizeof(p2))  # 较大（有 __dict__）
\`\`\`

## 十二、综合示例：自定义列表类

\`\`\`python
class SortedList:
    """自动排序的列表"""
    
    def __init__(self, items=None):
        self._items = sorted(items) if items else []
    
    def __len__(self):
        return len(self._items)
    
    def __getitem__(self, index):
        if isinstance(index, slice):
            return SortedList(self._items[index])
        return self._items[index]
    
    def __setitem__(self, index, value):
        self._items[index] = value
        self._items.sort()  # 重新排序
    
    def __contains__(self, item):
        return item in self._items
    
    def __iter__(self):
        return iter(self._items)
    
    def __repr__(self):
        return f"SortedList({self._items!r})"
    
    def __str__(self):
        return str(self._items)
    
    def __eq__(self, other):
        if isinstance(other, SortedList):
            return self._items == other._items
        if isinstance(other, list):
            return self._items == sorted(other)
        return NotImplemented
    
    def add(self, item):
        """添加元素（保持有序）"""
        import bisect
        bisect.insort(self._items, item)
    
    def remove(self, item):
        self._items.remove(item)

# 使用
sl = SortedList([3, 1, 4, 1, 5, 9, 2, 6])
print(sl)  # [1, 1, 2, 3, 4, 5, 6, 9]

# 自动排序的添加
sl.add(0)
sl.add(7)
print(sl)  # [0, 1, 1, 2, 3, 4, 5, 6, 7, 9]

# 支持索引
print(sl[0])  # 0
print(sl[-1])  # 9

# 支持 for 循环
for x in sl:
    print(x, end=" ")  # 0 1 1 2 3 4 5 6 7 9
print()

# 支持 in
print(5 in sl)  # True
print(100 in sl)  # False

# 支持 len
print(len(sl))  # 10

# 支持比较
sl2 = SortedList([9, 7, 6, 5, 4, 3, 2, 1, 1, 0])
print(sl == sl2)  # True（值相同）

# 切片
sub = sl[2:5]
print(sub)  # [1, 2, 3]
\`\`\`

## 十三、常用魔术方法一览

| 方法 | 触发场景 | 示例 |
| --- | --- | --- |
| \`__init__\` | 创建对象 | \`MyClass()\` |
| \`__str__\` | print / str | \`print(obj)\` |
| \`__repr__\` | repr / 调试 | \`repr(obj)\` |
| \`__len__\` | len() | \`len(obj)\` |
| \`__getitem__\` | obj[i] | \`obj[0]\` |
| \`__setitem__\` | obj[i] = v | \`obj[0] = 1\` |
| \`__delitem__\` | del obj[i] | \`del obj[0]\` |
| \`__contains__\` | in | \`x in obj\` |
| \`__iter__\` | 迭代 | \`for x in obj\` |
| \`__next__\` | 下一个 | \`next(obj)\` |
| \`__eq__\` | == | \`obj1 == obj2\` |
| \`__lt__\` | < | \`obj1 < obj2\` |
| \`__hash__\` | hash() | \`hash(obj)\` |
| \`__bool__\` | bool() | \`if obj:\` |
| \`__call__\` | 调用对象 | \`obj()\` |
| \`__add__\` | + | \`obj1 + obj2\` |
| \`__mul__\` | * | \`obj * n\` |
| \`__enter__\` | with 进入 | \`with obj:\` |
| \`__exit__\` | with 退出 | \`with obj:\` |
| \`__format__\` | format / f-string | \`f"{obj:spec}"\` |

## 十四、魔术方法的设计原则

\`\`\`python
# 1. 一致性：实现 __eq__ 就要实现 __hash__
class Good:
    def __eq__(self, other):
        return id(self) == id(other)
    
    def __hash__(self):
        return id(self)

# 2. 对称性：a + b 应该等于 b + a（如果定义了 __radd__）
class Number:
    def __init__(self, value):
        self.value = value
    
    def __add__(self, other):
        if isinstance(other, Number):
            return Number(self.value + other.value)
        return NotImplemented  # 让 Python 尝试 other.__radd__
    
    def __radd__(self, other):
        # 当 other + self 时，如果 other 不知道怎么加
        return self.__add__(other)  # 复用 __add__

# 3. 返回新对象 vs 修改自身
# __add__ 应该返回新对象（不修改 self）
# __iadd__ (+=) 可以修改自身（也可以返回新对象）

# 4. NotImplemented 让 Python 尝试其他方法
class Bad:
    def __add__(self, other):
        return "无法相加"  # ❌ 不应该硬编码

class Good2:
    def __add__(self, other):
        if isinstance(other, Good2):
            return Good2(self.value + other.value)
        return NotImplemented  # ✅ 让 Python 尝试 other.__radd__
\`\`\`

## 小结

本章介绍了 Python 的核心魔术方法：

1. **\`__str__\` / \`__repr__\`**：控制对象的字符串表示
2. **\`__len__\` / \`__getitem__\` / \`__setitem__\`**：让对象像序列一样工作
3. **\`__iter__\` / \`__next__\`**：让对象支持 for 循环
4. **\`__eq__\` / \`__lt__\`**：比较运算，配合 \`@total_ordering\` 自动补全
5. **\`__hash__\`**：可哈希，能作字典键、能放入集合
6. **\`__bool__\`**：定义对象的 truthy/falsy
7. **\`__format__\`**：支持 format() 和 f-string
8. **\`__call__\`**：让对象像函数一样可调用
9. **\`__enter__\` / \`__exit__\`**：支持 with 语句
10. **\`__add__\` / \`__mul__\`**：运算符重载
11. **\`__new__\`**：控制对象创建（单例、不可变对象）
12. **\`__slots__\`**：限制属性，节省内存

魔术方法让自定义类无缝融入 Python 的内置操作。掌握它们，你的类用起来就像 \`list\`、\`str\` 一样自然。下一部分我们将进入**面向对象进阶**——运算符重载、封装、抽象类、元类等高级主题。`
  }
];

export { chapters };
