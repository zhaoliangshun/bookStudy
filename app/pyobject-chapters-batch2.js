// =============================================================
// Python 面向对象教程（pyobject）—— 第二批章节
// -------------------------------------------------------------
// 三大特性（5-9章）
//   第 5 章：封装：私有属性与方法
//   第 6 章：继承：代码复用
//   第 7 章：多态：同一接口不同实现
//   第 8 章：抽象类：定义接口规范
//   第 9 章：property 装饰器：受控访问
// =============================================================

export const chapters = [
  // =========================================================
  // 第五章：封装：私有属性与方法
  // =========================================================
  {
    id: "po-05",
    group: "三大特性",
    icon: "🔒",
    title: "封装：私有属性与方法",
    content: `## 一、什么是封装？

**封装** = 把数据藏在对象内部，对外只暴露必要的接口。

## 二、为什么需要封装？

- 防止外部直接修改内部数据
- 提供统一的访问入口
- 便于以后修改内部实现

## 三、Python 的私有属性：__ 双下划线

\`\`\`python
class User:
    def __init__(self, name):
        self.__name = name  # 私有属性

u = User("Alice")
print(u.__name)  # ❌ AttributeError
\`\`\`

Python 会把 \`__name\` 改名成 \`_ClassName__name\`，叫 **name mangling**。

## 四、Python 的"伪私有"：_ 单下划线

\`\`\`python
class User:
    def __init__(self, name):
        self._name = name  # 约定"私有"，但能访问
\`\`\`

单下划线是**约定**，表示"内部用，外部别动"。

## 五、为什么要提供方法访问？

\`\`\`python
class User:
    def __init__(self, age):
        self.__age = age

    @property
    def age(self):
        return self.__age

    @age.setter
    def age(self, value):
        if value < 0:
            raise ValueError("年龄不能为负")
        self.__age = value
\`\`\`

好处：
- 验证输入
- 计算属性
- 隐藏实现

## 六、封装的层次

| 形式 | 含义 |
|------|------|
| \`name\` | 公开属性 |
| \`_name\` | 受保护（约定） |
| \`__name\` | 私有（被改名） |
| \`__name__\` | 魔术方法 |

## 七、封装的最佳实践

1. **默认公开**：别过度封装
2. **用 @property 控制访问**：而不是直接 __
3. **私有方法用 _method**：内部用
4. **真正的"私有"用 __**：避免子类覆盖

## 八、name mangling 的真相

\`\`\`python
class A:
    def __init__(self):
        self.__x = 1

a = A()
# 实际属性名是 _A__x
print(a._A__x)  # 能访问（但别这样用）
\`\`\`

## 九、本章 demo

演示封装的各种用法。
`,
    code: `"""
第五章 demo：封装
演示：
  1. 公开 vs 私有属性
  2. name mangling
  3. 用方法控制访问
  4. property 装饰器
  5. 实战：受控的数据类
"""


# ===== 1. 公开 vs 私有 =====
class User1:
    def __init__(self, name, age):
        self.name = name    # 公开
        self._age = age     # 受保护（约定）
        self.__id = 12345   # 私有


print("=== 1. 公开 vs 私有 ===")
u = User1("Alice", 30)
print(f"  u.name = {u.name}（公开）")
print(f"  u._age = {u._age}（约定私有，能访问）")
try:
    print(u.__id)
except AttributeError as e:
    print(f"  u.__id = 报错: {e}")

# name mangling：实际存储名是 _User1__id
print(f"  u._User1__id = {u._User1__id}（mangled 名）")
print()


# ===== 2. 用方法控制访问 =====
class User2:
    def __init__(self, age):
        self.__age = age  # 私有

    def get_age(self):
        """获取年龄"""
        return self.__age

    def set_age(self, value):
        """设置年龄（带验证）"""
        if value < 0 or value > 200:
            raise ValueError("年龄不合理")
        self.__age = value


print("=== 2. 用方法控制访问 ===")
u = User2(30)
print(f"  年龄: {u.get_age()}")
u.set_age(31)
print(f"  修改后: {u.get_age()}")
try:
    u.set_age(-1)
except ValueError as e:
    print(f"  设置 -1 报错: {e}")
print()


# ===== 3. @property 装饰器 =====
class User3:
    def __init__(self, name, age):
        self.__name = name
        self.__age = age

    @property
    def name(self):
        """名字 getter"""
        return self.__name

    @name.setter
    def name(self, value):
        if not value:
            raise ValueError("名字不能为空")
        self.__name = value

    @property
    def age(self):
        return self.__age

    @age.setter
    def age(self, value):
        if value < 0 or value > 200:
            raise ValueError("年龄不合理")
        self.__age = value


print("=== 3. @property 装饰器 ===")
u = User3("Alice", 30)
print(f"  u.name = {u.name}（像属性一样访问）")
print(f"  u.age = {u.age}")

u.age = 31
print(f"  修改后: u.age = {u.age}")

try:
    u.age = 300
except ValueError as e:
    print(f"  u.age = 300 报错: {e}")
print()


# ===== 4. 计算属性 =====
class Circle:
    """圆形"""

    def __init__(self, radius):
        self.__radius = radius

    @property
    def radius(self):
        return self.__radius

    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("半径不能为负")
        self.__radius = value

    @property
    def area(self):
        """面积：只读"""
        import math
        return math.pi * self.__radius ** 2

    @property
    def circumference(self):
        """周长：只读"""
        import math
        return 2 * math.pi * self.__radius


print("=== 4. 计算属性（只读） ===")
c = Circle(5)
print(f"  半径: {c.radius}")
print(f"  面积: {c.area:.2f}")
print(f"  周长: {c.circumference:.2f}")
try:
    c.area = 100
except AttributeError as e:
    print(f"  设置只读属性报错: {e}")
print()


# ===== 5. 实战：完整的封装示例 =====
class BankAccount:
    """银行账户：完整封装"""

    def __init__(self, owner, balance=0):
        self.__owner = owner
        self.__balance = balance
        self.__history = []

    @property
    def owner(self):
        return self.__owner

    @property
    def balance(self):
        return self.__balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("存款必须为正")
        self.__balance += amount
        self.__history.append(("存款", amount))

    def withdraw(self, amount):
        if amount <= 0:
            raise ValueError("取款必须为正")
        if amount > self.__balance:
            raise ValueError("余额不足")
        self.__balance -= amount
        self.__history.append(("取款", amount))

    def show_history(self):
        print(f"  {self.__owner} 的交易历史:")
        for action, amount in self.__history:
            print(f"    {action}: ¥{amount}")


print("=== 5. 实战：银行账户 ===")
acc = BankAccount("Alice", 100)
acc.deposit(50)
acc.withdraw(30)
print(f"  户主: {acc.owner}")
print(f"  余额: ¥{acc.balance}")
acc.show_history()
`,
  },

  // =========================================================
  // 第六章：继承：代码复用
  // =========================================================
  {
    id: "po-06",
    group: "三大特性",
    icon: "🌳",
    title: "继承：代码复用",
    content: `## 一、什么是继承？

子类继承父类的属性和方法。

\`\`\`python
class Animal:       # 父类
    def speak(self):
        print("动物叫")

class Dog(Animal):  # 子类
    pass

d = Dog()
d.speak()  # 继承自 Animal
\`\`\`

## 二、为什么用继承？

- 代码复用
- 体现"is-a"关系
- 多态的基础

## 三、单继承

\`\`\`python
class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self):
        print(f"{self.name} 叫")

class Dog(Animal):
    def fetch(self):
        print(f"{self.name} 叼球")

d = Dog("旺财")
d.speak()  # 继承
d.fetch()  # 自己的
\`\`\`

## 四、方法重写

子类覆盖父类方法：

\`\`\`python
class Cat(Animal):
    def speak(self):  # 重写父类
        print(f"{self.name} 喵喵")
\`\`\`

## 五、super() 调用父类

\`\`\`python
class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)  # 调用父类 __init__
        self.breed = breed
\`\`\`

## 六、isinstance 和 issubclass

\`\`\`python
d = Dog("旺财")
isinstance(d, Dog)    # True
isinstance(d, Animal) # True（继承关系）

issubclass(Dog, Animal)  # True
\`\`\`

## 七、多继承

Python 支持多继承（慎用）：

\`\`\`python
class A: pass
class B: pass
class C(A, B): pass  # C 同时继承 A 和 B
\`\`\`

MRO（方法解析顺序）：\`C -> A -> B -> object\`

## 八、继承的 3 个设计原则

1. **is-a 关系**：子类是父类的一种（狗是动物）
2. **Liskov 替换**：子类可以替换父类
3. **少用多继承**：用 mixin 代替

## 九、组合 vs 继承

- **继承**：is-a（狗 是 动物）
- **组合**：has-a（车 有 引擎）

能组合就别继承。

## 十、本章 demo

演示继承的各种用法。
`,
    code: `"""
第六章 demo：继承
演示：
  1. 单继承
  2. 方法重写
  3. super() 调用父类
  4. isinstance / issubclass
  5. 多继承与 MRO
"""


# ===== 1. 单继承 =====
class Animal:
    """动物（父类）"""

    def __init__(self, name):
        self.name = name

    def speak(self):
        print(f"  {self.name} 发出声音")

    def info(self):
        print(f"  我是动物: {self.name}")


class Dog(Animal):
    """狗（子类）"""

    def fetch(self):
        print(f"  {self.name} 叼球")


print("=== 1. 单继承 ===")
d = Dog("旺财")
d.info()   # 继承自 Animal
d.speak()  # 继承自 Animal
d.fetch()  # 自己的
print()


# ===== 2. 方法重写 =====
class Cat(Animal):
    """猫（重写 speak）"""

    def speak(self):  # 重写
        print(f"  {self.name} 喵喵")


print("=== 2. 方法重写 ===")
c = Cat("小花")
c.speak()  # 自己的版本
c.info()   # 还是继承的
print()


# ===== 3. super() 调用父类 =====
class Bird(Animal):
    """鸟：带种类的属性"""

    def __init__(self, name, species):
        # 调用父类 __init__
        super().__init__(name)
        # 添加自己的属性
        self.species = species

    def speak(self):
        # 扩展父类
        super().speak()  # 父类的逻辑
        print(f"  ({self.name} 是一只 {self.species})")


print("=== 3. super() 调用父类 ===")
b = Bird("小蓝", "鹦鹉")
b.speak()
print(f"  种类: {b.species}")
print()


# ===== 4. isinstance / issubclass =====
class Fish(Animal):
    pass


print("=== 4. isinstance / issubclass ===")
d = Dog("旺财")
c = Cat("小花")
f = Fish("小鱼")

print(f"  isinstance(d, Dog): {isinstance(d, Dog)}")
print(f"  isinstance(d, Animal): {isinstance(d, Animal)}")
print(f"  isinstance(d, Cat): {isinstance(d, Cat)}")
print(f"  issubclass(Dog, Animal): {issubclass(Dog, Animal)}")
print()


# ===== 5. 多继承与 MRO =====
class Flyable:
    """可飞行"""
    def fly(self):
        print("  飞行中")


class Swimmable:
    """可游泳"""
    def swim(self):
        print("  游泳中")


class Duck(Animal, Flyable, Swimmable):
    """鸭子：多重继承"""
    pass


print("=== 5. 多继承 ===")
duck = Duck("唐老鸭")
duck.speak()
duck.fly()
duck.swim()
print(f"  Duck MRO: {[c.__name__ for c in Duck.__mro__]}")
print()


# ===== 6. 实战：员工类层次 =====
class Employee:
    """员工（基类）"""

    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def work(self):
        print(f"  {self.name} 工作")

    def pay(self):
        return self.salary


class Manager(Employee):
    """经理"""

    def __init__(self, name, salary, bonus):
        super().__init__(name, salary)
        self.bonus = bonus

    def work(self):
        print(f"  {self.name} 管理工作")

    def pay(self):
        return self.salary + self.bonus


class Engineer(Employee):
    """工程师"""

    def work(self):
        print(f"  {self.name} 写代码")


print("=== 6. 实战：员工类层次 ===")
e = Employee("员工", 5000)
m = Manager("经理", 10000, 5000)
eng = Engineer("工程师", 8000)

employees = [e, m, eng]
for emp in employees:
    emp.work()
    print(f"    薪资: ¥{emp.pay()}")
`,
  },

  // =========================================================
  // 第七章：多态：同一接口不同实现
  // =========================================================
  {
    id: "po-07",
    group: "三大特性",
    icon: "🎭",
    title: "多态：同一接口不同实现",
    content: `## 一、什么是多态？

**同一操作，不同对象有不同行为**。

\`\`\`python
dog.speak()  # 汪汪
cat.speak()  # 喵喵
bird.speak()  # 叽叽
# 都是 .speak()，但行为不同
\`\`\`

## 二、多态的 3 个条件

1. 继承
2. 方法重写
3. 父类引用指向子类对象

## 三、Python 的多态

Python 是**鸭子类型**：不严格检查继承，只要方法存在就行。

\`\`\`python
class Dog:
    def speak(self):
        print("汪汪")

class Cat:
    def speak(self):
        print("喵喵")

def make_speak(animal):
    animal.speak()  # 不需要是 Animal 子类

make_speak(Dog())  # 汪汪
make_speak(Cat())  # 喵喵
\`\`\`

## 四、抽象基类（接口）

用 abc 模块定义接口：

\`\`\`python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        pass

class Circle(Shape):
    def __init__(self, r):
        self.r = r
    def area(self):
        return 3.14 * self.r ** 2
\`\`\`

## 五、isinstance + 多态

\`\`\`python
shapes = [Circle(5), Square(10), Triangle(3, 4)]
for shape in shapes:
    if isinstance(shape, Shape):
        print(shape.area())
\`\`\`

## 六、Python vs Java 多态

| 维度 | Java | Python |
|------|------|--------|
| 类型 | 静态 | 动态 |
| 多态依据 | 继承/接口 | 鸭子类型 |
| 必须继承？ | 是 | 否 |

## 七、Pythonic 多态

\`\`\`python
# 不需要抽象基类
class Dog:
    def speak(self): print("汪")

# 只要有 speak 方法就行
def make_speak(thing):
    thing.speak()
\`\`\`

## 八、本章 demo

演示多态的各种用法。
`,
    code: `"""
第七章 demo：多态
演示：
  1. 基本多态
  2. 鸭子类型
  3. 抽象基类
  4. isinstance + 多态
  5. 实战：图形面积
"""

from abc import ABC, abstractmethod


# ===== 1. 基本多态 =====
class Animal:
    def speak(self):
        print("  动物叫")


class Dog(Animal):
    def speak(self):
        print("  汪汪")


class Cat(Animal):
    def speak(self):
        print("  喵喵")


class Duck(Animal):
    def speak(self):
        print("  嘎嘎")


print("=== 1. 基本多态 ===")
animals = [Dog(), Cat(), Duck()]
for animal in animals:
    animal.speak()  # 同样的调用，不同的行为
print()


# ===== 2. 鸭子类型 =====
class Car:
    """汽车：不是 Animal，但有 speak"""
    def speak(self):
        print("  滴滴")


class Robot:
    """机器人：也不是 Animal"""
    def speak(self):
        print("  Beep")


def make_speak(thing):
    """不需要是 Animal 子类，只要有 speak 方法"""
    thing.speak()


print("=== 2. 鸭子类型 ===")
make_speak(Car())
make_speak(Robot())
make_speak(Dog())
print()


# ===== 3. 抽象基类 =====
class Shape(ABC):
    """图形（抽象类）"""

    @abstractmethod
    def area(self):
        """计算面积（必须实现）"""
        pass


class Circle(Shape):
    def __init__(self, r):
        self.r = r

    def area(self):
        return 3.14159 * self.r ** 2


class Rectangle(Shape):
    def __init__(self, w, h):
        self.w = w
        self.h = h

    def area(self):
        return self.w * self.h


class Triangle(Shape):
    def __init__(self, base, height):
        self.base = base
        self.height = height

    def area(self):
        return 0.5 * self.base * self.height


print("=== 3. 抽象基类 ===")
shapes = [
    Circle(5),
    Rectangle(4, 6),
    Triangle(3, 8),
]
for shape in shapes:
    print(f"  {type(shape).__name__}: 面积 = {shape.area():.2f}")
print()


# ===== 4. 不能实例化抽象类 =====
print("=== 4. 抽象类不能直接实例化 ===")
try:
    Shape()
except TypeError as e:
    print(f"  Shape() 报错: {e}")
print()


# ===== 5. 实战：统一支付接口 =====

class Payment(ABC):
    """支付（接口）"""

    @abstractmethod
    def pay(self, amount):
        pass


class Alipay(Payment):
    def pay(self, amount):
        return f"  支付宝支付 ¥{amount}"


class WechatPay(Payment):
    def pay(self, amount):
        return f"  微信支付 ¥{amount}"


class BankCard(Payment):
    def pay(self, amount):
        return f"  银行卡支付 ¥{amount}"


def checkout(payment: Payment, amount):
    """统一收银台"""
    return payment.pay(amount)


print("=== 5. 实战：统一收银台 ===")
payments = [
    Alipay(),
    WechatPay(),
    BankCard(),
]
for p in payments:
    print(checkout(p, 100))
print()


# ===== 6. isinstance + 多态 =====
print("=== 6. isinstance + 多态 ===")
for p in payments:
    if isinstance(p, Payment):
        print(f"  这是合法支付方式: {type(p).__name__}")
`,
  },

  // =========================================================
  // 第八章：抽象类：定义接口规范
  // =========================================================
  {
    id: "po-08",
    group: "三大特性",
    icon: "📐",
    title: "抽象类：定义接口规范",
    content: `## 一、什么是抽象类？

**抽象类** = 不能直接实例化、只能被继承的类。

作用：
- 定义接口规范
- 强制子类实现某些方法

## 二、Python 的抽象类（abc 模块）

\`\`\`python
from abc import ABC, abstractmethod

class Animal(ABC):  # 继承 ABC
    @abstractmethod  # 装饰器
    def speak(self):  # 抽象方法
        pass
\`\`\`

## 三、抽象方法必须实现

\`\`\`python
class Dog(Animal):
    def speak(self):  # 必须实现
        print("汪汪")
\`\`\`

否则 Dog 仍然是抽象类，不能实例化。

## 四、抽象类可以包含具体方法

\`\`\`python
class Animal(ABC):
    @abstractmethod
    def speak(self):
        pass

    def sleep(self):  # 普通方法
        print("睡觉")  # 子类继承
\`\`\`

## 五、抽象属性

\`\`\`python
class Animal(ABC):
    @property
    @abstractmethod
    def name(self):
        pass
\`\`\`

## 六、Python vs Java 抽象类

| 维度 | Java | Python |
|------|------|--------|
| interface | 有 | 用 ABC |
| abstract | abstract 关键字 | @abstractmethod |
| 多实现 | 不支持 | 不支持（但多继承） |
| 默认实现 | 8+ | 有（具体方法） |

## 七、什么时候用抽象类？

- 多个类有共同接口
- 想强制子类实现
- 文档和类型提示

## 八、Pythonic 替代：Protocol

Python 3.8+ 有 \`Protocol\`，定义"协议"而不强制继承：

\`\`\`python
from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> None: ...

# 任何有 draw 方法的类都"是" Drawable
\`\`\`

## 九、抽象类实战：数据库驱动

定义统一接口，让 MySQL、PostgreSQL、SQLite 等都能用：

\`\`\`python
class Database(ABC):
    @abstractmethod
    def connect(self): pass
    @abstractmethod
    def execute(self, sql): pass
    @abstractmethod
    def close(self): pass
\`\`\`

## 十、抽象类实战：插件系统

\`\`\`python
class Plugin(ABC):
    @property
    @abstractmethod
    def name(self): pass
    @abstractmethod
    def run(self, *args, **kwargs): pass
\`\`\`

## 十一、抽象类的 3 个常见错误

1. 忘记 \`@abstractmethod\`
2. 抽象类直接实例化
3. 子类没实现所有抽象方法

## 十二、本章 demo

演示抽象类的各种用法。
`,
    code: `"""
第八章 demo：抽象类
演示：
  1. 抽象基类 ABC
  2. 抽象方法与具体方法
  3. 抽象属性
  4. 实战：数据库驱动接口
  5. 实战：图形渲染
  6. 实战：插件系统
"""

from abc import ABC, abstractmethod


# ===== 1. 基本抽象类 =====
class Animal(ABC):
    """动物（抽象类）"""

    @abstractmethod
    def speak(self):
        """说话（子类必须实现）"""
        pass


print("=== 1. 抽象类不能实例化 ===")
try:
    Animal()
except TypeError as e:
    print(f"  Animal() 报错: {e}")
print()


# ===== 2. 实现抽象类 =====
class Dog(Animal):
    def speak(self):
        return "汪汪"


class Cat(Animal):
    def speak(self):
        return "喵喵"


print("=== 2. 子类必须实现抽象方法 ===")
d = Dog()
c = Cat()
print(f"  dog.speak() = {d.speak()}")
print(f"  cat.speak() = {c.speak()}")
print()


# ===== 3. 不完整实现还是抽象 =====
class IncompleteDog(Animal):
    """没实现 speak，还是抽象"""
    pass


print("=== 3. 没实现完所有抽象方法 ===")
try:
    IncompleteDog()
except TypeError as e:
    print(f"  IncompleteDog() 报错: {e}")
print()


# ===== 4. 抽象类可以包含具体方法 =====
class Vehicle(ABC):
    """交通工具（抽象类）"""

    @abstractmethod
    def start(self):
        pass

    @abstractmethod
    def stop(self):
        pass

    def info(self):
        """具体方法：所有子类共享"""
        return f"  交通工具: {type(self).__name__}"


class Car(Vehicle):
    def start(self):
        print("  汽车启动")

    def stop(self):
        print("  汽车熄火")


class Bike(Vehicle):
    def start(self):
        print("  自行车骑上")

    def stop(self):
        print("  自行车停下")


print("=== 4. 抽象类可以包含具体方法 ===")
for v in [Car(), Bike()]:
    print(v.info())
    v.start()
    v.stop()
    print()


# ===== 5. 实战：数据库驱动接口 =====
print("=== 5. 实战：数据库驱动 ===")

class Database(ABC):
    """数据库（抽象接口）"""

    @abstractmethod
    def connect(self):
        pass

    @abstractmethod
    def execute(self, sql):
        pass

    @abstractmethod
    def close(self):
        pass


class MySQLDriver(Database):
    def connect(self):
        print("  MySQL: 连接中")

    def execute(self, sql):
        return f"  MySQL 执行: {sql}"

    def close(self):
        print("  MySQL: 关闭连接")


class PostgreSQLDriver(Database):
    def connect(self):
        print("  PostgreSQL: 连接中")

    def execute(self, sql):
        return f"  PostgreSQL 执行: {sql}"

    def close(self):
        print("  PostgreSQL: 关闭连接")


class SQLiteDriver(Database):
    def connect(self):
        print("  SQLite: 连接中")

    def execute(self, sql):
        return f"  SQLite 执行: {sql}"

    def close(self):
        print("  SQLite: 关闭连接")


def run_query(driver: Database, sql):
    """统一查询接口"""
    driver.connect()
    result = driver.execute(sql)
    driver.close()
    return result


drivers = [MySQLDriver(), PostgreSQLDriver(), SQLiteDriver()]
for d in drivers:
    print(run_query(d, "SELECT * FROM users"))
    print()


# ===== 6. 实战：图形渲染 =====
print("=== 6. 实战：图形渲染 ===")

class Shape(ABC):
    """图形（抽象）"""

    @abstractmethod
    def area(self):
        pass

    @abstractmethod
    def perimeter(self):
        pass


class CircleShape(Shape):
    def __init__(self, r):
        self.r = r

    def area(self):
        return 3.14 * self.r ** 2

    def perimeter(self):
        return 2 * 3.14 * self.r


class Square(Shape):
    def __init__(self, side):
        self.side = side

    def area(self):
        return self.side ** 2

    def perimeter(self):
        return 4 * self.side


def render(shape: Shape):
    """统一渲染"""
    print(f"  {type(shape).__name__}: 面积={shape.area():.2f}, 周长={shape.perimeter():.2f}")


shapes = [CircleShape(5), Square(4)]
for s in shapes:
    render(s)
print()


# ===== 7. 实战：插件系统 =====
print("=== 7. 实战：插件系统 ===")

class Plugin(ABC):
    """插件（抽象）"""

    @property
    @abstractmethod
    def name(self):
        pass

    @abstractmethod
    def run(self, *args, **kwargs):
        pass


class HelloPlugin(Plugin):
    @property
    def name(self):
        return "hello"

    def run(self, *args, **kwargs):
        return f"  Hello, {args[0] if args else 'World'}"


class CountPlugin(Plugin):
    @property
    def name(self):
        return "count"

    def run(self, *args, **kwargs):
        text = args[0] if args else ""
        return f"  字符数: {len(text)}"


class PluginManager:
    def __init__(self):
        self.plugins = {}

    def register(self, plugin: Plugin):
        self.plugins[plugin.name] = plugin
        print(f"  注册插件: {plugin.name}")

    def run(self, name, *args, **kwargs):
        if name not in self.plugins:
            return f"  插件 {name} 未注册"
        return self.plugins[name].run(*args, **kwargs)


pm = PluginManager()
pm.register(HelloPlugin())
pm.register(CountPlugin())
print(pm.run("hello", "Alice"))
print(pm.run("count", "Hello, World"))
`,
  },

  // =========================================================
  // 第九章：property 装饰器：受控访问
  // =========================================================
  {
    id: "po-09",
    group: "三大特性",
    icon: "🎚️",
    title: "property 装饰器：受控访问",
    content: `## 一、什么是 property？

\`property\` 让方法可以**像属性一样访问**。

\`\`\`python
class User:
    @property
    def age(self):
        return self.__age

u = User()
print(u.age)  # 像属性，不是 u.age()
\`\`\`

## 二、为什么需要 property？

- 像属性一样简洁
- 同时可以加验证逻辑
- 兼容旧代码（属性名不变）

## 三、3 个装饰器

| 装饰器 | 作用 |
|--------|------|
| \`@property\` | getter |
| \`@xxx.setter\` | setter |
| \`@xxx.deleter\` | deleter |

## 四、基本用法

\`\`\`python
class User:
    def __init__(self, age):
        self.__age = age

    @property
    def age(self):
        return self.__age

    @age.setter
    def age(self, value):
        if value < 0:
            raise ValueError("年龄不能为负")
        self.__age = value
\`\`\`

## 五、只读 property

只定义 getter，就是只读属性：

\`\`\`python
class Circle:
    def __init__(self, r):
        self.__r = r

    @property
    def area(self):
        return 3.14 * self.__r ** 2
\`\`\`

## 六、property vs 公开属性

- 公开属性：简单，但不能验证
- property：像属性一样用，但能加逻辑

## 七、property vs 普通方法

- 普通方法：\`obj.method()\`
- property：\`obj.attr\`（无括号）

## 八、property 的优势

1. **接口不变**：从方法改成 property 不影响调用方
2. **计算属性**：每次访问都重新计算
3. **延迟计算**：用得着再算
4. **类型检查**：IDE 友好

## 九、什么时候用？

- 简单数据：公开属性
- 需要验证：用 property
- 需要计算：用 property（只读）
- 复杂逻辑：普通方法

## 十、property 的常见错误

1. **忘记 @xxx.setter**：变成只读
2. **在 property 里做重活**：影响性能
3. **property 名和方法名冲突**

## 十一、本章 demo

演示 property 的各种用法。
`,
    code: `"""
第九章 demo：property 装饰器
演示：
  1. 基本 property
  2. setter 验证
  3. 只读 property
  4. 计算属性
  5. deleter
  6. 实战：温度转换
"""


# ===== 1. 基本 property =====
class User1:
    """用户：property 版"""

    def __init__(self, name, age):
        self.__name = name
        self.__age = age

    @property
    def name(self):
        return self.__name

    @property
    def age(self):
        return self.__age


print("=== 1. 基本 property ===")
u = User1("Alice", 30)
print(f"  u.name = {u.name}（像属性访问）")
print(f"  u.age = {u.age}")
print()


# ===== 2. setter 验证 =====
class User2:
    def __init__(self, name, age):
        self.__name = name
        self.__age = age

    @property
    def name(self):
        return self.__name

    @name.setter
    def name(self, value):
        if not value or not isinstance(value, str):
            raise ValueError("名字必须是非空字符串")
        self.__name = value

    @property
    def age(self):
        return self.__age

    @age.setter
    def age(self, value):
        if value < 0 or value > 200:
            raise ValueError("年龄不合理")
        self.__age = value


print("=== 2. setter 验证 ===")
u = User2("Alice", 30)
print(f"  初始: {u.name}, {u.age}")

u.age = 31
print(f"  修改后: {u.age}")

try:
    u.age = 300
except ValueError as e:
    print(f"  报错: {e}")
print()


# ===== 3. 只读 property =====
class Circle:
    """圆形：只读 area 和 circumference"""

    def __init__(self, radius):
        self.__radius = radius

    @property
    def radius(self):
        return self.__radius

    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("半径不能为负")
        self.__radius = value

    @property
    def area(self):
        import math
        return math.pi * self.__radius ** 2

    @property
    def circumference(self):
        import math
        return 2 * math.pi * self.__radius


print("=== 3. 只读 property ===")
c = Circle(5)
print(f"  半径: {c.radius}")
print(f"  面积: {c.area:.2f}")
print(f"  周长: {c.circumference:.2f}")

try:
    c.area = 100
except AttributeError as e:
    print(f"  设置只读属性报错: {e}")
print()


# ===== 4. deleter =====
class File:
    """文件：可以删除"""

    def __init__(self, path):
        self.__path = path
        self.__content = None

    @property
    def path(self):
        return self.__path

    @property
    def content(self):
        return self.__content

    @content.setter
    def content(self, value):
        self.__content = value

    @content.deleter
    def content(self):
        print(f"  删除 {self.__path} 的内容")
        self.__content = None


print("=== 4. deleter ===")
f = File("/tmp/test.txt")
f.content = "Hello"
print(f"  内容: {f.content}")
del f.content
print(f"  删除后: {f.content}")
print()


# ===== 5. 计算属性：反应温度 =====
class Temperature:
    """温度：摄氏度 ↔ 华氏度"""

    def __init__(self, celsius=0):
        self.__celsius = celsius

    @property
    def celsius(self):
        """摄氏度"""
        return self.__celsius

    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError("低于绝对零度")
        self.__celsius = value

    @property
    def fahrenheit(self):
        """华氏度（计算）"""
        return self.__celsius * 9 / 5 + 32

    @fahrenheit.setter
    def fahrenheit(self, value):
        # 通过华氏度设置，自动转摄氏度
        self.__celsius = (value - 32) * 5 / 9


print("=== 5. 实战：温度转换 ===")
t = Temperature(25)
print(f"  摄氏度: {t.celsius}")
print(f"  华氏度: {t.fahrenheit:.1f}")

t.fahrenheit = 100
print(f"  设华氏度 100，摄氏度自动变为: {t.celsius:.1f}")
print()


# ===== 6. 缓存属性 =====
class Cached:
    """带缓存的属性"""

    def __init__(self, n):
        self.__n = n
        self.__cache = None

    @property
    def heavy_compute(self):
        """模拟重活，只算一次"""
        if self.__cache is None:
            print("  [计算中...]")
            self.__cache = sum(range(self.__n))
        return self.__cache


print("=== 6. 缓存属性 ===")
c = Cached(1000000)
print(f"  第一次: {c.heavy_compute}")
print(f"  第二次: {c.heavy_compute}（命中缓存）")
`,
  },
];
