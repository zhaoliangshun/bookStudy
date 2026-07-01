// =============================================================
// Python 逐层深入教程 - batch4
// 章节 31-40：面向对象（类/继承/多态/魔法方法/高级用法）
//          + 异常处理 + 文件读写 + 模块 + 综合实战
// =============================================================

export const chapters = [
  // -----------------------------------------------------------
  // 第 31 章：类与对象入门
  // -----------------------------------------------------------
  {
    id: "py9-31",
    group: "面向对象：描述世界",
    icon: "🏭",
    title: "类与对象：用代码描述事物",
    content: `## 为什么要"面向对象"

前面我们用变量、列表、字典存数据，用函数处理数据。但当数据变复杂——比如一个"学生"有名字、年龄、成绩、还能"学习""考试"——零散的变量和函数就不够用了。

**面向对象**（OOP）把"数据"和"行为"打包在一起，叫**类**（class）。从类造出来的具体实例叫**对象**。

\`\`\`python
class Dog:
    def bark(self):       # 方法（类里的函数）
        print("汪汪！")

d = Dog()                 # 造一个对象（实例化）
d.bark()                  # 调用方法
\`\`\`

## 类是图纸，对象是产品

\`\`\`
类 Dog（图纸）  →  Dog() 实例化  →  对象 d1, d2, d3（产品）
\`\`\`

- **类**：描述"狗有什么、能干什么"（定义）
- **对象**：具体的某只狗（实例），每只独立

## __init__：初始化方法

\`__init__\` 是个特殊方法，**造对象时自动调用**，用来初始化属性：

\`\`\`python
class Dog:
    def __init__(self, name, age):
        self.name = name       # 给对象加属性
        self.age = age

d = Dog("旺财", 3)             # 自动调 __init__，self=d
print(d.name)                  # 旺财
\`\`\`

## self 是什么

\`self\` 是**对象自己**的引用。调用 \`d.bark()\` 时，Python 自动把 \`d\` 传给 \`self\`，所以方法里 \`self.name\` 就是 \`d.name\`。

\`\`\`python
d = Dog("旺财", 3)
d.bark()       # 等价于 Dog.bark(d)，self 拿到 d
\`\`\`

## 属性 vs 方法

- **属性**：对象有什么（数据），\`d.name\`、\`d.age\`
- **方法**：对象能干什么（行为），\`d.bark()\`

## 类属性 vs 实例属性

\`\`\`python
class Dog:
    species = "犬科"           # 类属性，所有 Dog 共享
    def __init__(self, name):
        self.name = name       # 实例属性，每个对象独立

Dog.species     # "犬科"，通过类访问
d = Dog("旺财")
d.species       # 也能通过对象访问
\`\`\`

## 本章 demo

demo 定义 Dog 类，演示属性、方法、多对象独立。`,
    code: `# ============================================
# 第 31 章：类与对象
# ============================================

# --- 1. 最简单的类 ---
print("=== 1. 定义类 ===")
class Dog:
    """狗狗类"""
    species = "犬科"           # 类属性（所有 Dog 共享）

    def bark(self):
        """方法：叫"""
        print(f"  {self.name}: 汪汪！")

# 实例化（造对象）
d1 = Dog()
d1.name = "旺财"               # 直接加属性（不推荐，应该用 __init__）
d1.bark()

# --- 2. 用 __init__ 初始化 ---
print("\\n=== 2. __init__ ===")
class Dog2:
    species = "犬科"

    def __init__(self, name, age):
        """造对象时自动调用"""
        self.name = name       # 实例属性
        self.age = age
        print(f"  [{self.name} 诞生了，{self.age}岁]")

    def bark(self):
        print(f"  {self.name}: 汪汪！")

    def info(self):
        print(f"  我是{self.name}，{self.age}岁的{self.species}")

d2 = Dog2("旺财", 3)            # 自动调 __init__
d3 = Dog2("小黑", 5)
d2.bark()
d3.bark()
d2.info()
d3.info()

# --- 3. 每个对象独立 ---
print("\\n=== 3. 对象独立 ===")
print(f"  d2.name = {d2.name}")
print(f"  d3.name = {d3.name}    ← 各自独立")
d2.age = 4                     # 改 d2 的，不影响 d3
print(f"  改后: d2.age={d2.age}, d3.age={d3.age}")

# --- 4. 类属性 vs 实例属性 ---
print("\\n=== 4. 类属性 vs 实例属性 ===")
print(f"  Dog2.species = {Dog2.species}    ← 通过类访问")
print(f"  d2.species = {d2.species}    ← 通过对象访问")
print(f"  d3.species = {d3.species}")

# 改类属性，所有对象都变
Dog2.species = "哺乳动物"
print(f"  改类属性后: d2.species = {d2.species}")

# 给单个对象加实例属性（不影响其他对象）
d2.color = "黄色"
print(f"  d2.color = {d2.color}")
# print(d3.color)  # 报错！d3 没有 color

# --- 5. self 的真相 ---
print("\\n=== 5. self 的真相 ===")
class Cat:
    def __init__(self, name):
        self.name = name
    def meow(self):
        print(f"  {self.name}: 喵~")

c = Cat("咪咪")
c.meow()                       # 等价于 Cat.meow(c)
Cat.meow(c)                    # 显式传 c 当 self

# --- 6. 实用：学生类 ---
print("\\n=== 6. 学生类 ===")
class Student:
    school = "第一中学"        # 类属性，所有学生同校

    def __init__(self, name, scores):
        self.name = name
        self.scores = scores    # dict: {"语文": 90, ...}

    def average(self):
        """计算平均分"""
        return sum(self.scores.values()) / len(self.scores)

    def info(self):
        print(f"  {self.name}（{self.school}）")
        for subject, score in self.scores.items():
            print(f"    {subject}: {score}")
        print(f"    平均: {self.average():.1f}")

s1 = Student("小明", {"语文": 90, "数学": 85, "英语": 92})
s2 = Student("小红", {"语文": 88, "数学": 95, "英语": 90})
s1.info()
s2.info()`
  },

  // -----------------------------------------------------------
  // 第 32 章：继承
  // -----------------------------------------------------------
  {
    id: "py9-32",
    group: "面向对象：描述世界",
    icon: "🌳",
    title: "继承：站在巨人的肩膀上",
    content: `## 继承是什么

已有 \`Dog\` 类，现在要写 \`GuideDog\`（导盲犬）。它和普通狗 90% 一样，多了"导盲"功能。难道重写一遍？不用——**继承**让子类直接拿到父类的所有属性和方法，再加自己的东西。

\`\`\`python
class Dog:
    def bark(self):
        print("汪汪")

class GuideDog(Dog):           # GuideDog 继承 Dog
    def guide(self):
        print("导盲中...")

g = GuideDog()
g.bark()                       # 继承来的方法
g.guide()                      # 自己的方法
\`\`\`

## 术语

- **父类**（基类、超类）：被继承的类
- **子类**（派生类）：继承别人的类
- 子类**拥有**父类所有属性和方法
- 子类可以**扩展**（加新方法）和**重写**（改父类方法）

## 重写（override）

子类同名方法会"覆盖"父类的：

\`\`\`python
class Animal:
    def speak(self):
        print("...")

class Cat(Animal):
    def speak(self):           # 重写
        print("喵")

Cat().speak()    # 喵，不是 ...
\`\`\`

## super()：调用父类方法

重写后还想用父类的逻辑，用 \`super()\`：

\`\`\`python
class Animal:
    def __init__(self, name):
        self.name = name

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)    # 调父类 __init__
        self.breed = breed       # 再加自己的
\`\`\`

## 多继承

Python 支持多继承（一个类有多个父类）：

\`\`\`python
class A: pass
class B: pass
class C(A, B): pass             # C 同时继承 A 和 B
\`\`\`

但要小心"菱形继承"（同名方法冲突）。能用单继承就别用多继承。

## 方法解析顺序（MRO）

\`ClassName.__mro__\` 能看到方法查找顺序，多继承时有用。

## 继承的"is-a"关系

继承表达"is-a"（是一个）关系：
- Dog **is an** Animal ✅
- Cat **is an** Animal ✅
- Car **is an** Animal ❌（不是）

不是 is-a 就别用继承，用组合（has-a，"有一个"）更合适。

## 本章 demo

demo 演示继承、重写、super、多继承。`,
    code: `# ============================================
# 第 32 章：继承
# ============================================

# --- 1. 基本继承 ---
print("=== 1. 基本继承 ===")
class Animal:
    """动物基类"""
    def __init__(self, name):
        self.name = name

    def eat(self):
        print(f"  {self.name} 在吃东西")

    def sleep(self):
        print(f"  {self.name} 在睡觉")

class Dog(Animal):
    """狗继承自动物"""
    def bark(self):
        print(f"  {self.name}: 汪汪！")

class Cat(Animal):
    """猫继承自动物"""
    def meow(self):
        print(f"  {self.name}: 喵~")

d = Dog("旺财")
d.eat()        # 继承自 Animal
d.sleep()      # 继承自 Animal
d.bark()       # 自己的

c = Cat("咪咪")
c.eat()
c.meow()

# --- 2. 重写 ---
print("\\n=== 2. 重写 ===")
class Animal2:
    def __init__(self, name):
        self.name = name
    def speak(self):
        print(f"  {self.name}: ...")

class Dog2(Animal2):
    def speak(self):           # 重写父类方法
        print(f"  {self.name}: 汪汪！")

class Cat2(Animal2):
    def speak(self):           # 重写
        print(f"  {self.name}: 喵~")

for animal in [Dog2("旺财"), Cat2("咪咪"), Animal2("未知")]:
    animal.speak()             # 同一调用，不同行为（多态）

# --- 3. super() 调父类 ---
print("\\n=== 3. super() ===")
class Animal3:
    def __init__(self, name):
        self.name = name
        print(f"  [Animal3.__init__] name={name}")

class Dog3(Animal3):
    def __init__(self, name, breed):
        super().__init__(name)    # 先调父类 __init__
        self.breed = breed        # 再加自己的属性
        print(f"  [Dog3.__init__] breed={breed}")

    def info(self):
        print(f"  我是{self.name}，品种{self.breed}")

d = Dog3("旺财", "金毛")
d.info()

# --- 4. 多层继承 ---
print("\\n=== 4. 多层继承 ===")
class Vehicle:
    def move(self):
        print("  移动中...")

class Car(Vehicle):
    def drive(self):
        print("  开车")

class SportsCar(Car):
    def turbo(self):
        print("  涡轮加速！")

sc = SportsCar()
sc.move()      # 来自 Vehicle
sc.drive()     # 来自 Car
sc.turbo()     # 自己的

# 看 MRO（方法解析顺序）
print(f"  SportsCar MRO: {[c.__name__ for c in SportsCar.__mro__]}")

# --- 5. 多继承 ---
print("\\n=== 5. 多继承 ===")
class Flyable:
    def fly(self):
        print("  飞行")

class Swimmable:
    def swim(self):
        print("  游泳")

class Duck(Flyable, Swimmable):    # 鸭子能飞能游
    def quack(self):
        print("  嘎嘎")

duck = Duck()
duck.fly()
duck.swim()
duck.quack()

# --- 6. 实用：员工体系 ---
print("\\n=== 6. 员工体系 ===")
class Employee:
    """员工基类"""
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def info(self):
        return f"{self.name}，月薪 {self.salary}"

    def work(self):
        return f"{self.name} 在工作"

class Manager(Employee):
    """经理：员工 + 管理职能"""
    def __init__(self, name, salary, team_size):
        super().__init__(name, salary)
        self.team_size = team_size

    def info(self):             # 重写
        return f"{super().info()}，管理 {self.team_size} 人"

    def work(self):             # 重写
        return f"{self.name} 在管理团队"

class Developer(Employee):
    """开发：员工 + 编程"""
    def __init__(self, name, salary, language):
        super().__init__(name, salary)
        self.language = language

    def info(self):
        return f"{super().info()}，擅长 {self.language}"

    def work(self):
        return f"{self.name} 在写 {self.language} 代码"

emps = [
    Manager("张总", 30000, 8),
    Developer("小李", 20000, "Python"),
    Developer("小王", 22000, "Java"),
]
for e in emps:
    print(f"  {e.info()} | {e.work()}")`
  },

  // -----------------------------------------------------------
  // 第 33 章：多态与鸭子类型
  // -----------------------------------------------------------
  {
    id: "py9-33",
    group: "面向对象：描述世界",
    icon: "🦆",
    title: "多态与鸭子类型",
    content: `## 多态是什么

**多态**：不同对象调用同一方法，表现出不同行为。

\`\`\`python
class Dog:
    def speak(self): print("汪")
class Cat:
    def speak(self): print("喵")

def make_speak(animal):
    animal.speak()      # 不关心是什么动物，只要有 speak

make_speak(Dog())    # 汪
make_speak(Cat())    # 喵
\`\`\`

\`make_speak\` 不关心传进来的是 Dog 还是 Cat，只要有 \`speak\` 方法就行。这就是多态。

## Python 的鸭子类型

> **如果一个东西走起来像鸭子，叫起来像鸭子，那它就是鸭子。**

Python 不关心对象的**类型**，只关心它**有没有需要的方法**：

\`\`\`python
def make_sound(x):
    x.speak()       # x 是什么都行，只要有 speak 方法

class Car:
    def speak(self): print("嘀嘀")    # 车也能 speak

make_sound(Dog())    # 汪
make_sound(Car())    # 嘀嘀   ← Car 不是 Animal，但有 speak，就能用
\`\`\`

这比 Java/C++ 的多态更灵活——不要求继承同一个父类。

## 鸭子类型实例

\`\`\`python
# 任何有 __len__ 的对象都能用 len()
len("abc")        # 字符串
len([1, 2, 3])    # 列表
len({"a": 1})     # 字典
\`\`\`

\`len\` 不关心对象是什么类型，只要有 \`__len__\` 方法。

## 自定义可迭代对象

实现 \`__iter__\` 和 \`__next__\`，你的对象就能用 \`for\` 遍历：

\`\`\`python
class Counter:
    def __init__(self, n):
        self.n = n
        self.i = 0
    def __iter__(self):
        return self
    def __next__(self):
        if self.i >= self.n:
            raise StopIteration
        x = self.i
        self.i += 1
        return x

for x in Counter(5):    # 像 range 一样用
    print(x)
\`\`\`

## isinstance vs 鸭子类型

\`\`\`python
if isinstance(x, Dog):    # 严格判断类型
    ...

# 鸭子类型：不判断，直接试
try:
    x.speak()
except AttributeError:
    print("x 不会 speak")
\`\`\`

Python 风格倾向于鸭子类型——"原谅比许可容易"（EAFP）。

## 本章 demo

demo 演示多态、鸭子类型、自定义可迭代对象。`,
    code: `# ============================================
# 第 33 章：多态与鸭子类型
# ============================================

# --- 1. 多态基础 ---
print("=== 1. 多态 ===")
class Dog:
    def __init__(self, name):
        self.name = name
    def speak(self):
        return f"{self.name}: 汪"
    def __str__(self):
        return f"狗[{self.name}]"

class Cat:
    def __init__(self, name):
        self.name = name
    def speak(self):
        return f"{self.name}: 喵"
    def __str__(self):
        return f"猫[{self.name}]"

class Duck:
    def __init__(self, name):
        self.name = name
    def speak(self):
        return f"{self.name}: 嘎"
    def __str__(self):
        return f"鸭[{self.name}]"

def make_speak(animal):
    """多态：不关心类型，只要有 speak 方法"""
    print(f"  {animal.speak()}")

# 同一函数，传不同对象，不同行为
animals = [Dog("旺财"), Cat("咪咪"), Duck("唐老鸭")]
for a in animals:
    make_speak(a)

# --- 2. 鸭子类型 ---
print("\\n=== 2. 鸭子类型 ===")
class Car:
    """车不是动物，但有 speak 方法"""
    def speak(self):
        return "车: 嘀嘀"

class Phone:
    def speak(self):
        return "手机: 嘟嘟"

# make_speak 不关心是不是动物，只要有 speak 就行
make_speak(Car())
make_speak(Phone())
print("  → 不看类型，只看有没有方法，这就是鸭子类型")

# --- 3. len 的鸭子类型 ---
print("\\n=== 3. len 的鸭子类型 ===")
class MyList:
    """自定义有 __len__ 的对象"""
    def __init__(self, items):
        self.items = items
    def __len__(self):
        return len(self.items)

ml = MyList([1, 2, 3, 4, 5])
print(f"  len(MyList) = {len(ml)}    ← 有 __len__ 就能用 len")
print(f"  len('abc') = {len('abc')}")
print(f"  len([1,2,3]) = {len([1,2,3])}")
print(f"  len({{1,2,3}}) = {len({1,2,3})}")

# --- 4. 自定义可迭代对象 ---
print("\\n=== 4. 自定义可迭代 ===")
class Counter:
    """像 range 一样可迭代的对象"""
    def __init__(self, start, end):
        self.current = start
        self.end = end
    def __iter__(self):
        return self
    def __next__(self):
        if self.current >= self.end:
            raise StopIteration       # 结束标志
        x = self.current
        self.current += 1
        return x

print("  Counter(1, 6):", end=" ")
for x in Counter(1, 6):
    print(x, end=" ")
print()

# 也能用 list() 转
print(f"  list(Counter(10, 15)) = {list(Counter(10, 15))}")

# --- 5. isinstance vs 鸭子类型 ---
print("\\n=== 5. isinstance vs 鸭子类型 ===")
def process_strict(x):
    """严格判断类型"""
    if isinstance(x, (Dog, Cat)):
        return x.speak()
    return "不是动物"

def process_duck(x):
    """鸭子类型：直接试"""
    try:
        return x.speak()
    except AttributeError:
        return "不会说话"

print(f"  严格: process_strict(Car()) = {process_strict(Car())}")
print(f"  鸭子: process_duck(Car()) = {process_duck(Car())}    ← 不报错，直接用")

# --- 6. 实用：统一接口 ---
print("\\n=== 6. 统一接口 ===")
class JSONFormatter:
    def format(self, data):
        import json
        return json.dumps(data, ensure_ascii=False)

class TextFormatter:
    def format(self, data):
        return "\\n".join(f"{k}: {v}" for k, v in data.items())

class CSVFormatter:
    def format(self, data):
        lines = [",".join(data.keys())]
        lines.append(",".join(str(v) for v in data.values()))
        return "\\n".join(lines)

def print_data(data, formatter):
    """多态：不关心 formatter 是什么类型"""
    print(formatter.format(data))

data = {"name": "小明", "age": 18, "city": "北京"}
print("  JSON:")
print_data(data, JSONFormatter())
print("  Text:")
print_data(data, TextFormatter())
print("  CSV:")
print_data(data, CSVFormatter())`
  },

  // -----------------------------------------------------------
  // 第 34 章：魔法方法
  // -----------------------------------------------------------
  {
    id: "py9-34",
    group: "面向对象：描述世界",
    icon: "✨",
    title: "魔法方法：让对象更像内置类型",
    content: `## 魔法方法是什么

以 \`__\` 开头和结尾的方法，比如 \`__init__\`、\`__str__\`、\`__len__\`。它们是 Python 给的"钩子"——你重写它们，你的对象就能用 \`len()\`、\`print()\`、\`+\`、\`==\` 等内置操作。

\`\`\`python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def __add__(self, other):       # 重写 +
        return Vector(self.x + other.x, self.y + other.y)
    def __str__(self):              # 重写 print/str
        return f"Vector({self.x}, {self.y})"

v1 = Vector(1, 2)
v2 = Vector(3, 4)
print(v1 + v2)    # Vector(4, 6)
\`\`\`

## 常用魔法方法

| 方法 | 触发 | 用途 |
|------|------|------|
| \`__init__\` | 创建对象 | 初始化 |
| \`__str__\` | \`str(obj)\`、\`print(obj)\` | 给人看 |
| \`__repr__\` | \`repr(obj)\`、直接显示 | 给开发者看 |
| \`__len__\` | \`len(obj)\` | 长度 |
| \`__eq__\` | \`obj == other\` | 等于 |
| \`__lt__\` | \`obj < other\` | 小于 |
| \`__add__\` | \`obj + other\` | 加 |
| \`__getitem__\` | \`obj[key]\` | 索引 |
| \`__contains__\` | \`x in obj\` | 成员判断 |
| \`__iter__\` | \`for x in obj\` | 迭代 |
| \`__call__\` | \`obj(...)\` | 像函数一样调用 |

## __str__ vs __repr__

- \`__str__\`：给人看，\`print\` 时显示
- \`__repr__\`：给开发者看，理想情况能"复制粘贴就是合法代码"

\`\`\`python
class Point:
    def __init__(self, x, y): self.x, self.y = x, y
    def __str__(self): return f"({self.x}, {self.y})"
    def __repr__(self): return f"Point({self.x}, {self.y})"

p = Point(1, 2)
print(p)        # (1, 2)        ← __str__
p               # Point(1, 2)   ← __repr__
\`\`\`

## 比较方法

\`\`\`python
class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score
    def __eq__(self, other):
        return self.score == other.score
    def __lt__(self, other):
        return self.score < other.score

s1 = Student("小明", 90)
s2 = Student("小红", 85)
s1 > s2    # True（自动用 __lt__ 反过来）
\`\`\`

## 算术方法

\`\`\`python
__add__    # +
__sub__    # -
__mul__    # *
__truediv__ # /
\`\`\`

## 本章 demo

demo 实现一个 Vector 类，重写常用魔法方法。`,
    code: `# ============================================
# 第 34 章：魔法方法
# ============================================

# --- 1. __str__ 和 __repr__ ---
print("=== 1. __str__ / __repr__ ===")
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def __str__(self):
        """print/str 时显示，给人看"""
        return f"({self.x}, {self.y})"
    def __repr__(self):
        """直接显示/repr，给开发者看，理想是合法代码"""
        return f"Point({self.x}, {self.y})"

p = Point(1, 2)
print(f"  print(p): {p}")           # 用 __str__
print(f"  str(p): {str(p)}")
print(f"  repr(p): {repr(p)}")      # 用 __repr__
points = [Point(1, 2), Point(3, 4)]
print(f"  列表: {points}            ← 列表里用 __repr__")

# --- 2. 算术：Vector 类 ---
print("\\n=== 2. Vector 算术 ===")
class Vector:
    """二维向量，支持 + - * == """
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        """v1 + v2"""
        return Vector(self.x + other.x, self.y + other.y)

    def __sub__(self, other):
        """v1 - v2"""
        return Vector(self.x - other.x, self.y - other.y)

    def __mul__(self, k):
        """v * 数字（数乘）"""
        return Vector(self.x * k, self.y * k)

    def __eq__(self, other):
        """v1 == v2"""
        return self.x == other.x and self.y == other.y

    def __abs__(self):
        """abs(v) 向量长度"""
        return (self.x ** 2 + self.y ** 2) ** 0.5

    def __str__(self):
        return f"Vector({self.x}, {self.y})"

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"

v1 = Vector(1, 2)
v2 = Vector(3, 4)
print(f"  v1 = {v1}")
print(f"  v2 = {v2}")
print(f"  v1 + v2 = {v1 + v2}")
print(f"  v2 - v1 = {v2 - v1}")
print(f"  v1 * 3 = {v1 * 3}")
print(f"  abs(v2) = {abs(v2):.2f}")
print(f"  v1 == Vector(1,2): {v1 == Vector(1, 2)}")

# --- 3. 比较方法 ---
print("\\n=== 3. 比较 ===")
class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score
    def __eq__(self, other):
        return self.score == other.score
    def __lt__(self, other):
        return self.score < other.score
    def __le__(self, other):
        return self.score <= other.score
    def __repr__(self):
        return f"{self.name}({self.score})"

students = [
    Student("小明", 90),
    Student("小红", 85),
    Student("小刚", 92),
]
print(f"  原始: {students}")
students.sort()                # 用 __lt__ 排序
print(f"  排序后: {students}    ← 自动用 __lt__")
print(f"  小明 == 小红: {students[0] == students[1]}")
print(f"  小明 < 小刚: {students[0] < students[-1]}")

# --- 4. __len__ / __getitem__ / __contains__ ---
print("\\n=== 4. 容器方法 ===")
class Playlist:
    """歌单：像列表一样用"""
    def __init__(self, name, songs):
        self.name = name
        self.songs = list(songs)
    def __len__(self):
        return len(self.songs)
    def __getitem__(self, index):
        return self.songs[index]
    def __contains__(self, song):
        return song in self.songs
    def __str__(self):
        return f"歌单《{self.name}》({len(self)}首)"

pl = Playlist("我的最爱", ["晴天", "稻香", "夜曲", "七里香"])
print(f"  {pl}")
print(f"  len(pl) = {len(pl)}")
print(f"  pl[0] = {pl[0]}")
print(f"  pl[-1] = {pl[-1]}")
print(f"  '稻香' in pl: {'稻香' in pl}")
print(f"  '告白气球' in pl: {'告白气球' in pl}")
print("  遍历:")
for song in pl:                # 因为有 __getitem__
    print(f"    - {song}")

# --- 5. __call__ ---
print("\\n=== 5. __call__ ===")
class Adder:
    """加了 __call__，对象能像函数一样调用"""
    def __init__(self, n):
        self.n = n
    def __call__(self, x):
        return x + self.n

add_10 = Adder(10)
print(f"  add_10(5) = {add_10(5)}    ← 对象当函数用")
print(f"  callable(add_10): {callable(add_10)}")

# --- 6. __iter__ 自定义迭代 ---
print("\\n=== 6. __iter__ ===")
class Range2:
    """带步长的 range"""
    def __init__(self, start, end, step=1):
        self.current = start
        self.end = end
        self.step = step
    def __iter__(self):
        return self
    def __next__(self):
        if self.current >= self.end:
            raise StopIteration
        x = self.current
        self.current += self.step
        return x

print("  Range2(0, 10, 2):", end=" ")
for x in Range2(0, 10, 2):
    print(x, end=" ")
print()`
  },

  // -----------------------------------------------------------
  // 第 35 章：类的高级用法
  // -----------------------------------------------------------
  {
    id: "py9-35",
    group: "面向对象：描述世界",
    icon: "🛠️",
    title: "类的高级用法：property / staticmethod / classmethod",
    content: `## @property：把方法当属性用

\`\`\`python
class Circle:
    def __init__(self, radius):
        self.radius = radius

    @property
    def area(self):
        """面积，像属性一样访问"""
        return 3.14 * self.radius ** 2

c = Circle(5)
c.area      # 不加 ()，像属性一样
\`\`\`

好处：把"计算"伪装成"属性"，调用更自然，且能加逻辑。

## @property 的 setter

控制赋值：

\`\`\`python
class Circle:
    def __init__(self, r):
        self.radius = r        # 会调 setter

    @property
    def radius(self):
        return self._radius

    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("半径不能为负")
        self._radius = value

c = Circle(5)
c.radius = 10        # 调 setter
c.radius = -1        # 抛 ValueError
\`\`\`

## @staticmethod：静态方法

不需要 \`self\` 也不需要 \`cls\`，就是放在类里的普通函数：

\`\`\`python
class MathUtils:
    @staticmethod
    def add(a, b):
        return a + b

MathUtils.add(3, 5)    # 不用实例化
\`\`\`

## @classmethod：类方法

第一个参数是**类本身**（\`cls\`），不是实例。常用于"工厂方法"：

\`\`\`python
class Date:
    def __init__(self, year, month, day):
        self.year, self.month, self.day = year, month, day

    @classmethod
    def from_string(cls, s):
        """从字符串 '2024-01-01' 创建 Date"""
        year, month, day = map(int, s.split("-"))
        return cls(year, month, day)    # cls 就是 Date

d = Date.from_string("2024-01-15")
\`\`\`

\`cls\` 是类本身，所以子类继承时 \`cls\` 会是子类，这是工厂方法的优势。

## 三种方法对比

| 装饰器 | 第一个参数 | 调用方式 | 用途 |
|--------|-----------|---------|------|
| 普通方法 | \`self\`（实例） | \`obj.method()\` | 操作实例 |
| \`@classmethod\` | \`cls\`（类） | \`Class.method()\` 或 \`obj.method()\` | 工厂方法、操作类属性 |
| \`@staticmethod\` | 无 | \`Class.method()\` | 工具函数，放类里只是为了分组 |

## 私有属性约定

Python 没有真正的私有，靠**约定**：

- \`name\`：公开，随便访问
- \`_name\`：内部用，"约定不访问"（但能访问）
- \`__name\`：改名 \`_ClassName__name\`，访问稍麻烦
- \`__name__\`：魔法方法，别自己发明

\`\`\`python
class A:
    def __init__(self):
        self.pub = "公开"
        self._priv = "内部"
        self.__secret = "秘密"

a = A()
a.pub        # 公开
a._priv      # 内部（能访问，但约定别这么干）
a.__secret   # 报错！
a._A__secret # 能访问（改名了），但别这么干
\`\`\`

## 本章 demo

demo 用一个 Temperature 类演示 property/staticmethod/classmethod。`,
    code: `# ============================================
# 第 35 章：类的高级用法
# ============================================

# --- 1. @property 基础 ---
print("=== 1. @property ===")
class Circle:
    def __init__(self, radius):
        self.radius = radius

    @property
    def area(self):
        """面积：像属性一样访问，不用加 ()"""
        import math
        return math.pi * self.radius ** 2

    @property
    def perimeter(self):
        """周长"""
        import math
        return 2 * math.pi * self.radius

c = Circle(5)
print(f"  半径 {c.radius}")
print(f"  面积 {c.area:.2f}        ← 不加括号，像属性")
print(f"  周长 {c.perimeter:.2f}")
c.radius = 10
print(f"  改半径后面积: {c.area:.2f}    ← 自动重算")

# --- 2. @property + setter ---
print("\\n=== 2. 带校验的 setter ===")
class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius      # 会调 setter

    @property
    def celsius(self):
        """摄氏度"""
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError(f"温度不能低于绝对零度 -273.15，收到 {value}")
        self._celsius = value

    @property
    def fahrenheit(self):
        """华氏度（只读属性）"""
        return self._celsius * 9 / 5 + 32

t = Temperature(25)
print(f"  摄氏: {t.celsius}°C")
print(f"  华氏: {t.fahrenheit}°F")
t.celsius = 100
print(f"  改后: {t.celsius}°C = {t.fahrenheit}°F")

# 校验
try:
    t.celsius = -300
except ValueError as e:
    print(f"  设置 -300 报错: {e}")

# --- 3. @staticmethod ---
print("\\n=== 3. @staticmethod ===")
class MathUtils:
    """数学工具类，方法都是静态的"""
    @staticmethod
    def square(x):
        return x * x

    @staticmethod
    def is_even(n):
        return n % 2 == 0

    @staticmethod
    def average(nums):
        return sum(nums) / len(nums) if nums else 0

# 不用实例化，直接用
print(f"  MathUtils.square(5) = {MathUtils.square(5)}")
print(f"  MathUtils.is_even(4) = {MathUtils.is_even(4)}")
print(f"  MathUtils.average([1,2,3,4]) = {MathUtils.average([1,2,3,4])}")

# 实例也能调，但不推荐
m = MathUtils()
print(f"  实例调: m.square(3) = {m.square(3)}")

# --- 4. @classmethod ---
print("\\n=== 4. @classmethod ===")
class Date:
    def __init__(self, year, month, day):
        self.year = year
        self.month = month
        self.day = day

    def __str__(self):
        return f"{self.year}-{self.month:02d}-{self.day:02d}"

    @classmethod
    def from_string(cls, s):
        """工厂方法：从字符串 '2024-01-15' 创建"""
        year, month, day = map(int, s.split("-"))
        return cls(year, month, day)    # cls 是 Date

    @classmethod
    def today(cls):
        """工厂方法：今天的日期"""
        import datetime
        t = datetime.date.today()
        return cls(t.year, t.month, t.day)

# 用 __init__
d1 = Date(2024, 1, 15)
print(f"  Date(2024,1,15) = {d1}")

# 用类方法（工厂）
d2 = Date.from_string("2024-12-25")
print(f"  Date.from_string('2024-12-25') = {d2}")

d3 = Date.today()
print(f"  Date.today() = {d3}")

# --- 5. 类方法被继承 ---
print("\\n=== 5. 工厂方法继承 ===")
class ChineseDate(Date):
    """中国日期，显示成中文"""
    def __str__(self):
        return f"{self.year}年{self.month}月{self.day}日"

# 继承的类方法，cls 是子类
d = ChineseDate.from_string("2024-06-15")
print(f"  ChineseDate.from_string(...) = {d}")
print(f"  类型: {type(d).__name__}    ← cls 自动是子类")

# --- 6. 私有属性 ---
print("\\n=== 6. 私有属性 ===")
class Account:
    def __init__(self, owner, balance):
        self.owner = owner           # 公开
        self._type = "储蓄"          # 约定私有
        self.__balance = balance     # 改名私有

    def deposit(self, amount):
        self.__balance += amount
        return self.__balance

    def get_balance(self):
        return self.__balance

acc = Account("小明", 1000)
print(f"  owner: {acc.owner}    ← 公开")
print(f"  _type: {acc._type}    ← 约定私有，能访问但不该")
print(f"  余额(get_balance): {acc.get_balance()}")
# print(acc.__balance)    # 报错！
print(f"  真要访问: {acc._Account__balance}    ← 改名了，但能访问")
acc.deposit(500)
print(f"  存500后: {acc.get_balance()}")`
  },

  // -----------------------------------------------------------
  // 第 36 章：OOP 综合实战
  // -----------------------------------------------------------
  {
    id: "py9-36",
    group: "面向对象：描述世界",
    icon: "🎯",
    title: "OOP 综合实战：图书管理系统",
    content: `## 用 OOP 写一个完整系统

把前 5 章学的类、继承、多态、魔法方法、property 全用上，写一个图书管理系统。

## 需求

- 图书：有书名、作者、ISBN，能借出、归还
- 用户：能借书、还书、查借阅记录
- 图书馆：管理所有书和用户，能查询、统计

## 设计

\`\`\`
Book (基类)
  ├── 普通书
  └── 珍藏书 (限制借阅天数)

User
  └── 借阅记录

Library
  ├── 书库
  ├── 用户库
  └── 借还操作
\`\`\`

## 涉及知识点

- 类、\`__init__\`、\`__str__\`、\`__repr__\`
- 继承、\`super()\`
- 多态（不同书借阅规则不同）
- \`@property\` 只读属性
- \`@classmethod\` 工厂方法
- \`@staticmethod\` 工具函数
- 异常处理（借太多、借不到）
- 组合（Library has Books and Users）

## 设计原则

1. **单一职责**：Book 只管书的状态，User 只管用户的借阅，Library 协调
2. **封装**：借阅逻辑在方法里，外部只调方法不改属性
3. **多态**：不同书有不同借阅规则，用方法重写实现
4. **可扩展**：要加"电子书"类，继承 Book 即可

## 本章 demo

完整实现图书管理系统。`,
    code: `# ============================================
# 第 36 章：OOP 综合实战 - 图书管理系统
# ============================================

# ============================================================
# 异常类
# ============================================================
class LibraryError(Exception):
    """图书馆异常基类"""
    pass

class BookNotAvailable(LibraryError):
    """书不可借"""
    pass

class BorrowLimitExceeded(LibraryError):
    """超出借阅上限"""
    pass

# ============================================================
# Book 基类
# ============================================================
class Book:
    """图书基类"""
    max_borrow_days = 30       # 类属性：默认借阅天数

    def __init__(self, title, author, isbn):
        self.title = title
        self.author = author
        self.isbn = isbn
        self._borrowed = False     # 私有：是否被借走
        self._borrower = None      # 私有：借阅者

    @property
    def borrowed(self):
        """只读属性：是否被借"""
        return self._borrowed

    @property
    def borrower(self):
        """只读属性：借阅者"""
        return self._borrower

    def borrow(self, user):
        """借出"""
        if self._borrowed:
            raise BookNotAvailable(f"《{self.title}》已被借走")
        self._borrowed = True
        self._borrower = user
        return f"{user.name} 借了《{self.title}》"

    def return_book(self):
        """归还"""
        if not self._borrowed:
            return f"《{self.title}》没被借走"
        borrower_name = self._borrower.name if self._borrower else "未知"
        self._borrowed = False
        self._borrower = None
        return f"{borrower_name} 还了《{self.title}》"

    def __str__(self):
        status = f"借给{self._borrower.name}" if self._borrowed else "在馆"
        return f"《{self.title}》-{self.author} [{status}]"

    def __repr__(self):
        return f"Book({self.title!r}, {self.author!r})"

    def __eq__(self, other):
        """ISBN 相同就是同一本书"""
        return isinstance(other, Book) and self.isbn == other.isbn

    def __hash__(self):
        """能当字典 key（基于 ISBN）"""
        return hash(self.isbn)

class RareBook(Book):
    """珍藏书：借阅天数短"""
    max_borrow_days = 7        # 重写类属性

    def borrow(self, user):
        """珍藏书需要额外检查"""
        if not user.is_vip:
            raise BookNotAvailable(f"《{self.title}》是珍藏书，仅 VIP 可借")
        return super().borrow(user)

    def __str__(self):
        status = f"借给{self._borrower.name}" if self._borrowed else "在馆"
        return f"《{self.title}》-{self.author} [珍藏, {status}]"

# ============================================================
# User
# ============================================================
class User:
    """用户"""
    max_books = 5             # 类属性：最多借几本

    def __init__(self, name, user_id, is_vip=False):
        self.name = name
        self.user_id = user_id
        self.is_vip = is_vip
        self._borrowed_books = []    # 借阅列表

    @property
    def borrowed_count(self):
        return len(self._borrowed_books)

    @property
    def can_borrow(self):
        """是否还能借"""
        limit = self.max_books + (3 if self.is_vip else 0)
        return len(self._borrowed_books) < limit

    def borrow(self, book):
        """借书"""
        if not self.can_borrow:
            raise BorrowLimitExceeded(f"{self.name} 已借 {len(self._borrowed_books)} 本，达上限")
        msg = book.borrow(self)
        self._borrowed_books.append(book)
        return msg

    def return_book(self, book):
        """还书"""
        if book not in self._borrowed_books:
            return f"{self.name} 没借《{book.title}》"
        self._borrowed_books.remove(book)
        return book.return_book()

    def __str__(self):
        vip = "[VIP]" if self.is_vip else ""
        return f"用户[{self.name}]{vip} 借了 {len(self._borrowed_books)} 本"

    def __repr__(self):
        return f"User({self.name!r})"

# ============================================================
# Library
# ============================================================
class Library:
    """图书馆"""
    @staticmethod
    def generate_id(prefix, num):
        """工具函数：生成 ID"""
        return f"{prefix}{num:04d}"

    @classmethod
    def from_book_list(cls, books_data):
        """工厂方法：从书单创建图书馆"""
        books = [Book(t, a, i) for t, a, i in books_data]
        return cls(books)

    def __init__(self, books=None):
        self.books = books or []           # 书列表
        self.users = {}                    # 用户字典：user_id -> User
        self._book_counter = 0
        self._user_counter = 0

    def add_book(self, book):
        self.books.append(book)
        return f"新增: {book}"

    def add_user(self, name, is_vip=False):
        self._user_counter += 1
        uid = self.generate_id("U", self._user_counter)
        user = User(name, uid, is_vip)
        self.users[uid] = user
        return user

    def find_book(self, title):
        """按书名找"""
        for b in self.books:
            if title in b.title:
                return b
        return None

    def list_available(self):
        """列出在馆的书"""
        return [b for b in self.books if not b.borrowed]

    def list_borrowed(self):
        """列出借出的书"""
        return [b for b in self.books if b.borrowed]

    def __len__(self):
        """图书馆藏书量"""
        return len(self.books)

    def __contains__(self, book):
        """book in library"""
        return book in self.books

    def __str__(self):
        return f"图书馆: {len(self.books)}本书, {len(self.users)}位用户"

# ============================================================
# 主程序
# ============================================================
print("=" * 55)
print("图书管理系统")
print("=" * 55)

# 创建图书馆
lib = Library()
print(f"\\n{lib}")

# 添加书
print("\\n--- 添加图书 ---")
books = [
    Book("Python编程", "Eric", "ISBN001"),
    Book("流畅的Python", "Luciano", "ISBN002"),
    Book("算法导论", "Cormen", "ISBN003"),
    RareBook("古籍善本", "古人", "ISBN004"),
]
for b in books:
    print(f"  {lib.add_book(b)}")

# 添加用户
print("\\n--- 添加用户 ---")
u1 = lib.add_user("小明", is_vip=True)
u2 = lib.add_user("小红")
print(f"  {u1}")
print(f"  {u2}")

# 借书
print("\\n--- 借书 ---")
try:
    print(f"  {u1.borrow(lib.find_book('Python'))}")
    print(f"  {u1.borrow(lib.find_book('流畅'))}")
    print(f"  {u2.borrow(lib.find_book('算法'))}")
    # 小红不是 VIP，借珍藏本会失败
    print(f"  {u2.borrow(lib.find_book('古籍'))}")
except LibraryError as e:
    print(f"  ❌ 借阅失败: {e}")

# VIP 借珍藏本
try:
    print(f"  {u1.borrow(lib.find_book('古籍'))}")
except LibraryError as e:
    print(f"  ❌ {e}")

# 查询状态
print("\\n--- 馆藏状态 ---")
print(f"  在馆 ({len(lib.list_available())} 本):")
for b in lib.list_available():
    print(f"    {b}")
print(f"  借出 ({len(lib.list_borrowed())} 本):")
for b in lib.list_borrowed():
    print(f"    {b}")

# 用户状态
print("\\n--- 用户状态 ---")
print(f"  {u1}")
print(f"  {u2}")

# 还书
print("\\n--- 还书 ---")
book_to_return = lib.find_book("Python")
print(f"  {u1.return_book(book_to_return)}")
print(f"  {u1}")

# 试图借已被借走的书
print("\\n--- 异常测试 ---")
try:
    u1.borrow(lib.find_book("算法"))    # 已被小红借走
except LibraryError as e:
    print(f"  ❌ {e}")

print(f"\\n{lib}")
print(f"  共 {len(lib)} 本书")
print(f"  《算法导论》在馆吗: {Book('算法导论', 'Cormen', 'ISBN003') in lib}")`
  },

  // -----------------------------------------------------------
  // 第 37 章：异常处理
  // -----------------------------------------------------------
  {
    id: "py9-37",
    group: "异常文件与实战",
    icon: "🚨",
    title: "异常处理：让程序更健壮",
    content: `## 程序会出错

写代码不可能不出错。除以 0、读不存在的文件、网络断了……这些"异常"会让程序崩溃。**异常处理**让你"预见到错误，并优雅地处理"，而不是直接崩。

\`\`\`python
try:
    x = 10 / 0
except ZeroDivisionError:
    print("不能除以 0")
\`\`\`

## try / except

\`\`\`python
try:
    # 可能出错的代码
    result = 10 / 0
except ZeroDivisionError:
    # 出错时怎么办
    print("出错了")
\`\`\`

- \`try\` 里放可能出错的代码
- \`except\` 接住特定类型的异常
- 不写异常类型表示接所有，但**不推荐**（会隐藏 bug）

## 捕获多种异常

\`\`\`python
try:
    num = int(input("输入数字: "))
    result = 10 / num
except ValueError:
    print("不是数字")
except ZeroDivisionError:
    print("不能是 0")
\`\`\`

## 一个 except 接多种

\`\`\`python
try:
    ...
except (ValueError, ZeroDivisionError) as e:
    print(f"出错: {e}")
\`\`\`

\`as e\` 把异常对象赋给 \`e\`，能拿到错误信息。

## else 和 finally

\`\`\`python
try:
    result = 10 / 2
except ZeroDivisionError:
    print("出错")
else:
    print(f"结果是 {result}")    # 没出错才执行
finally:
    print("无论如何都执行")      # 总执行（清理资源）
\`\`\`

- \`else\`：没异常时执行
- \`finally\`：无论有没有异常都执行（关文件、释放资源）

## 抛出异常 raise

\`\`\`python
def set_age(age):
    if age < 0:
        raise ValueError("年龄不能为负")
    return age

set_age(-5)    # 抛 ValueError
\`\`\`

主动抛异常，让调用者处理。

## 自定义异常

\`\`\`python
class MyError(Exception):
    pass

raise MyError("自定义错误")
\`\`\`

继承 \`Exception\` 就行。第 36 章的图书管理系统就用过自定义异常。

## 异常的传递

异常会沿调用栈"向上传播"，直到被 except 接住：

\`\`\`python
def a():
    raise ValueError("错了")    # 抛
def b():
    a()                          # 没接，继续传
def c():
    try:
        b()                      # 这里接住
    except ValueError as e:
        print(e)
\`\`\`

## 常见异常类型

| 异常 | 触发场景 |
|------|---------|
| \`ValueError\` | 值不对（\`int("abc")\`） |
| \`TypeError\` | 类型不对（\`"a" + 1\`） |
| \`IndexError\` | 下标越界 |
| \`KeyError\` | 字典 key 不存在 |
| \`AttributeError\` | 访问不存在的属性 |
| \`ZeroDivisionError\` | 除以 0 |
| \`FileNotFoundError\` | 文件不存在 |
| \`NameError\` | 变量未定义 |

## 不要滥用 try/except

- 别用裸 \`except:\` 接所有，会隐藏 bug
- 能用 if 判断的就别用 try（\`if key in d\` 比 \`try: d[key]\` 清晰）
- 只接你"预期会发生"的异常

## 本章 demo

demo 演示各种异常、自定义异常、try/except/else/finally。`,
    code: `# ============================================
# 第 37 章：异常处理
# ============================================

# --- 1. 基本异常 ---
print("=== 1. 基本异常 ===")
try:
    result = 10 / 0
except ZeroDivisionError:
    print("  捕获: 不能除以 0")

# 不捕获会怎样
print("\\n  --- 不捕获的后果 ---")
try:
    x = [1, 2, 3][10]            # IndexError
except IndexError as e:
    print(f"  捕获 IndexError: {e}")

# --- 2. 多种异常 ---
print("\\n=== 2. 多种异常 ===")
def divide(a, b):
    """可能抛多种异常"""
    return a / b

test_cases = [
    (10, 2),       # 正常
    (10, 0),       # ZeroDivisionError
    ("10", 2),     # TypeError
]
for a, b in test_cases:
    try:
        result = divide(a, b)
        print(f"  {a} / {b} = {result}")
    except ZeroDivisionError:
        print(f"  {a} / {b} → 除零错误")
    except TypeError as e:
        print(f"  {a} / {b} → 类型错误: {e}")

# --- 3. 一个 except 接多种 ---
print("\\n=== 3. 接多种异常 ===")
def parse_int(s):
    try:
        return int(s)
    except (ValueError, TypeError) as e:
        print(f"  解析 '{s}' 失败: {type(e).__name__}: {e}")
        return None

parse_int("42")
parse_int("abc")
parse_int(None)
parse_int([1, 2])

# --- 4. else 和 finally ---
print("\\n=== 4. else / finally ===")
def safe_divide(a, b):
    """演示 else 和 finally"""
    print(f"  尝试 {a} / {b}:")
    try:
        result = a / b
    except ZeroDivisionError:
        print("    → 出错了：除零")
    else:
        print(f"    → 没出错，结果 {result}")
    finally:
        print("    → finally: 无论怎样都执行")

safe_divide(10, 2)
safe_divide(10, 0)

# --- 5. 抛出异常 raise ---
print("\\n=== 5. raise ===")
def set_age(age):
    """设置年龄，负数抛异常"""
    if not isinstance(age, int):
        raise TypeError("年龄必须是整数")
    if age < 0 or age > 150:
        raise ValueError(f"年龄 {age} 不合理（0-150）")
    return age

for test in [25, -5, 200, "abc"]:
    try:
        result = set_age(test)
        print(f"  set_age({test!r}) = {result}")
    except (TypeError, ValueError) as e:
        print(f"  set_age({test!r}) → {type(e).__name__}: {e}")

# --- 6. 自定义异常 ---
print("\\n=== 6. 自定义异常 ===")
class WithdrawError(Exception):
    """取款异常"""
    pass

class InsufficientBalance(WithdrawError):
    """余额不足"""
    pass

class InvalidAmount(WithdrawError):
    """金额无效"""
    pass

class Account:
    def __init__(self, balance):
        self.balance = balance

    def withdraw(self, amount):
        if amount <= 0:
            raise InvalidAmount(f"金额必须大于 0，收到 {amount}")
        if amount > self.balance:
            raise InsufficientBalance(f"余额 {self.balance}，要取 {amount}")
        self.balance -= amount
        return self.balance

acc = Account(1000)
for amt in [500, -100, 2000, 300]:
    try:
        result = acc.withdraw(amt)
        print(f"  取 {amt} 成功，剩 {result}")
    except InvalidAmount as e:
        print(f"  取 {amt} → 金额无效: {e}")
    except InsufficientBalance as e:
        print(f"  取 {amt} → 余额不足: {e}")
    except WithdrawError as e:
        print(f"  取 {amt} → 取款错误: {e}")

# --- 7. 异常传递 ---
print("\\n=== 7. 异常传递 ===")
def level3():
    print("  level3: 抛异常")
    raise ValueError("从 level3 抛出")

def level2():
    print("  level2: 调 level3")
    level3()    # 不接，继续传

def level1():
    print("  level1: 调 level2")
    try:
        level2()
    except ValueError as e:
        print(f"  level1: 接住 → {e}")

level1()

# --- 8. 实用：安全转换 ---
print("\\n=== 8. 实用：安全转换 ===")
def safe_int(s, default=0):
    """安全转 int，失败返回默认值"""
    try:
        return int(s)
    except (ValueError, TypeError):
        return default

inputs = ["42", "abc", "3.14", "", None, "100"]
for s in inputs:
    print(f"  safe_int({s!r}) = {safe_int(s)}")`
  },

  // -----------------------------------------------------------
  // 第 38 章：文件读写
  // -----------------------------------------------------------
  {
    id: "py9-38",
    group: "异常文件与实战",
    icon: "📁",
    title: "文件读写：和外部数据打交道",
    content: `## 程序要存数据

程序运行时的数据在内存里，关了就没了。要持久化保存——配置、日志、用户数据——就得写文件。Python 用 \`open\` 函数读写文件。

## open 函数

\`\`\`python
f = open("文件名", "模式")
# 操作 f
f.close()       # 必须关闭！
\`\`\`

模式：
- \`"r"\`：读（默认），文件不存在报错
- \`"w"\`：写，文件不存在创建，存在**清空**
- \`"a"\`：追加，不存在创建，存在接着写
- \`"r+"\`：读写

## with 语句（推荐）

\`\`\`python
with open("file.txt", "r") as f:
    content = f.read()
# 出 with 块自动 close，就算出错也会关
\`\`\`

**永远用 with**，不用手动 close。

## 读文件

\`\`\`python
with open("file.txt", "r") as f:
    content = f.read()       # 一次读完，返回字符串
\`\`\`

### 逐行读

\`\`\`python
with open("file.txt") as f:
    for line in f:           # 一行一行读，省内存
        print(line.strip())  # strip 去掉换行符
\`\`\`

### readlines

\`\`\`python
with open("file.txt") as f:
    lines = f.readlines()    # 返回行列表，每行带换行符
\`\`\`

## 写文件

\`\`\`python
with open("file.txt", "w") as f:
    f.write("第一行\\n")      # 不会自动加换行，要自己写 \\n
    f.write("第二行\\n")
\`\`\`

\`"w"\` 模式会清空原文件！要接着写用 \`"a"\`。

## 编码问题

读中文文件常报 \`UnicodeDecodeError\`。指定编码：

\`\`\`python
with open("file.txt", "r", encoding="utf-8") as f:
    ...
\`\`\`

**永远写 \`encoding="utf-8"\`**，避免乱码。

## 文件路径

\`\`\`python
# 绝对路径
open("/Users/name/file.txt")
# 相对路径（相对于当前工作目录）
open("data/file.txt")
\`\`\`

跨平台用 \`os.path\` 或 \`pathlib\`：

\`\`\`python
from pathlib import Path
p = Path("data") / "file.txt"    # 自动处理路径分隔符
\`\`\`

## JSON 文件

\`\`\`python
import json

# 写
with open("data.json", "w", encoding="utf-8") as f:
    json.dump({"name": "小明"}, f, ensure_ascii=False, indent=2)

# 读
with open("data.json", encoding="utf-8") as f:
    data = json.load(f)
\`\`\`

JSON 是配置文件、API 数据交换的常用格式。

## os 模块

\`\`\`python
import os
os.listdir("dir")           # 列目录
os.path.exists("file")      # 是否存在
os.path.isfile("file")      # 是文件吗
os.path.isdir("dir")        # 是目录吗
os.makedirs("a/b/c", exist_ok=True)  # 递归建目录
\`\`\`

## 本章 demo

demo 演示写文件、读文件、JSON、目录操作（在 /tmp 下，安全）。`,
    code: `# ============================================
# 第 38 章：文件读写
# ============================================
import os
import json
import tempfile      # 用临时目录，安全
from pathlib import Path

# 用临时目录，避免污染
work_dir = tempfile.mkdtemp()
print(f"工作目录: {work_dir}\\n")

# --- 1. 写文件 ---
print("=== 1. 写文件 ===")
file_path = os.path.join(work_dir, "hello.txt")
with open(file_path, "w", encoding="utf-8") as f:
    f.write("你好，世界！\\n")        # write 不自动加换行
    f.write("这是第二行\\n")
    f.write("第三行\\n")
print(f"  写入: {file_path}")
print(f"  文件大小: {os.path.getsize(file_path)} 字节")

# --- 2. 读文件 ---
print("\\n=== 2. 读文件 ===")
# 一次读完
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()
print(f"  read() 全部内容:")
print(content)

# 逐行读
print("  逐行读:")
with open(file_path, encoding="utf-8") as f:
    for i, line in enumerate(f, 1):
        print(f"    第{i}行: {line.strip()}")

# readlines
with open(file_path, encoding="utf-8") as f:
    lines = f.readlines()
print(f"  readlines(): {lines}")

# --- 3. 追加 ---
print("\\n=== 3. 追加 ===")
with open(file_path, "a", encoding="utf-8") as f:
    f.write("这是追加的第四行\\n")
with open(file_path, encoding="utf-8") as f:
    print(f"  追加后:")
    print(f"  {f.read()}")

# --- 4. JSON 文件 ---
print("=== 4. JSON ===")
data = {
    "name": "小明",
    "age": 18,
    "scores": [90, 85, 92],
    "city": "北京",
}
json_path = os.path.join(work_dir, "data.json")
# 写
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print(f"  写入: {json_path}")

# 读
with open(json_path, encoding="utf-8") as f:
    loaded = json.load(f)
print(f"  读出: {loaded}")
print(f"  name: {loaded['name']}, 平均: {sum(loaded['scores'])/len(loaded['scores'])}")

# --- 5. 目录操作 ---
print("\\n=== 5. 目录操作 ===")
# 建子目录
sub_dir = os.path.join(work_dir, "sub", "deep")
os.makedirs(sub_dir, exist_ok=True)
print(f"  创建目录: {sub_dir}")

# 在子目录里建文件
sub_file = os.path.join(sub_dir, "note.txt")
with open(sub_file, "w", encoding="utf-8") as f:
    f.write("深处的文件")

# 列目录
print(f"  {work_dir} 下的内容:")
for item in os.listdir(work_dir):
    full = os.path.join(work_dir, item)
    if os.path.isfile(full):
        print(f"    📄 {item}")
    elif os.path.isdir(full):
        print(f"    📁 {item}/")

# --- 6. pathlib（更现代的写法）---
print("\\n=== 6. pathlib ===")
p = Path(work_dir) / "pathlib_test.txt"
p.write_text("用 pathlib 写的", encoding="utf-8")
print(f"  写入: {p}")
print(f"  读出: {p.read_text(encoding='utf-8')}")
print(f"  文件名: {p.name}")
print(f"  后缀: {p.suffix}")
print(f"  父目录: {p.parent}")
print(f"  存在: {p.exists()}")

# --- 7. 文件信息 ---
print("\\n=== 7. 文件信息 ===")
info = os.stat(file_path)
print(f"  {file_path}")
print(f"  大小: {info.st_size} 字节")
print(f"  isfile: {os.path.isfile(file_path)}")
print(f"  isdir: {os.path.isdir(file_dir := os.path.dirname(file_path))}")

# --- 8. 异常处理 ---
print("\\n=== 8. 异常处理 ===")
try:
    with open("/不存在/的/文件.txt") as f:
        f.read()
except FileNotFoundError as e:
    print(f"  捕获: {e}")

try:
    with open(file_path, "r") as f:
        content = f.read()
        # 假设继续处理，文件已自动关闭
except PermissionError as e:
    print(f"  权限错误: {e}")
else:
    print(f"  读成功，长度 {len(content)}")
finally:
    print("  finally: 清理完成")

# 清理
import shutil
shutil.rmtree(work_dir)
print(f"\\n  已清理临时目录")`
  },

  // -----------------------------------------------------------
  // 第 39 章：模块与包
  // -----------------------------------------------------------
  {
    id: "py9-39",
    group: "异常文件与实战",
    icon: "📦",
    title: "模块与包：组织代码的方式",
    content: `## 为什么要分模块

一个文件写 1000 行代码？太长不好维护。Python 用**模块**（一个 .py 文件）和**包**（一个目录）组织代码。

## 导入模块

\`\`\`python
import math             # 导入整个模块
math.sqrt(16)           # 4.0

from math import sqrt  # 只导入 sqrt
sqrt(16)                # 4.0，不用写 math.

from math import *      # 导入所有（不推荐，会污染命名空间）
\`\`\`

## 给模块起别名

\`\`\`python
import numpy as np      # 太长，起个短名
np.array([1, 2, 3])
\`\`\`

\`import pandas as pd\`、\`import matplotlib.pyplot as plt\` 是惯例。

## 自己写模块

任何 .py 文件都是模块。比如 \`utils.py\`：

\`\`\`python
# utils.py
def greet(name):
    return f"你好，{name}"

PI = 3.14159
\`\`\`

在同目录另一个文件里：

\`\`\`python
import utils
print(utils.greet("小明"))

from utils import greet, PI
\`\`\`

## \`\_\_name\_\_\` 与 \`if __name__ == "__main__"\`

\`\`\`python
# mymodule.py
def foo():
    print("foo")

if __name__ == "__main__":
    # 这部分只在"直接运行 mymodule.py"时执行
    # 被 import 时不执行
    foo()
\`\`\`

这让一个文件既能当模块被导入，又能当脚本运行。

## 标准库常用模块

| 模块 | 用途 |
|------|------|
| \`os\` | 操作系统（路径、目录） |
| \`sys\` | 解释器（参数、路径） |
| \`math\` | 数学函数 |
| \`random\` | 随机数 |
| \`datetime\` | 日期时间 |
| \`json\` | JSON 处理 |
| \`re\` | 正则表达式 |
| \`collections\` | 高级容器（Counter、defaultdict） |
| \`itertools\` | 迭代工具 |
| \`functools\` | 函数工具（reduce、lru_cache） |
| \`pathlib\` | 现代路径操作 |

## 包（Package）

包是"目录里有 \`__init__.py\`"，能嵌套：

\`\`\`
myproject/
├── main.py
└── mypackage/
    ├── __init__.py
    ├── module1.py
    └── subpackage/
        ├── __init__.py
        └── module2.py
\`\`\`

\`\`\`python
from mypackage import module1
from mypackage.subpackage import module2
\`\`\`

## 安装第三方包

\`\`\`bash
pip install requests          # 安装
pip install -r requirements.txt  # 按清单装
pip list                      # 列出已装的
\`\`\`

## 本章 demo

demo 演示导入标准库、用 if __name__、自定义模块（动态创建模拟）。`,
    code: `# ============================================
# 第 39 章：模块与包
# ============================================
import os
import sys
import math
import random
import datetime
import json
import re
from collections import Counter, defaultdict
from itertools import chain, combinations
from functools import reduce, lru_cache

# --- 1. 导入标准库 ---
print("=== 1. 标准库 ===")
# math
print(f"  math.pi = {math.pi:.5f}")
print(f"  math.sqrt(16) = {math.sqrt(16)}")
print(f"  math.ceil(3.2) = {math.ceil(3.2)}, math.floor(3.8) = {math.floor(3.8)}")

# random
print(f"  random.randint(1, 100) = {random.randint(1, 100)}")
print(f"  random.choice(['a','b','c']) = {random.choice(['a','b','c'])}")
random.seed(42)    # 固定随机种子，结果可复现
print(f"  seed(42) 后: {random.randint(1, 100)}")

# datetime
now = datetime.datetime.now()
print(f"  现在: {now.strftime('%Y-%m-%d %H:%M:%S')}")
today = datetime.date.today()
print(f"  今天: {today}, 星期{today.weekday() + 1}")

# --- 2. collections ---
print("\\n=== 2. collections ===")
# Counter：计数
words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
counter = Counter(words)
print(f"  词频: {dict(counter)}")
print(f"  最多: {counter.most_common(2)}")

# defaultdict：默认值字典
dd = defaultdict(list)
for word in ["apple", "banana", "apple"]:
    dd[len(word)].append(word)
print(f"  按长度分组: {dict(dd)}")

# --- 3. itertools ---
print("\\n=== 3. itertools ===")
# chain：拼接多个可迭代
combined = list(chain([1, 2], [3, 4], [5]))
print(f"  chain: {combined}")

# combinations：组合
combos = list(combinations([1, 2, 3, 4], 2))
print(f"  C(4,2): {combos}    ← 4选2的所有组合")

# --- 4. re 正则 ---
print("\\n=== 4. re 正则 ===")
text = "我的手机是 13812345678，邮箱是 abc@example.com"
# 找手机号
phones = re.findall(r"\\d{11}", text)
print(f"  手机号: {phones}")
# 找邮箱
emails = re.findall(r"\\S+@\\S+", text)
print(f"  邮箱: {emails}")
# 替换
masked = re.sub(r"\\d{11}", "***", text)
print(f"  打码: {masked}")

# --- 5. __name__ 检测 ---
print("\\n=== 5. __name__ ===")
# 动态创建一个模块文件，模拟 if __name__ 的行为
print(f"  当前 __name__ = {__name__!r}")
print("  → 直接运行时 __name__ == '__main__'")
print("  → 被 import 时 __name__ == 模块名")

# 模拟一个模块的逻辑
def module_demo():
    """模拟一个模块"""
    def greet(name):
        return f"你好，{name}"

    # 当作脚本运行的部分
    if __name__ == "__main__":
        print(f"  [脚本模式] {greet('小明')}")
    # 当作模块导入时，上面不执行
    return greet

greet_func = module_demo()
print(f"  [调用模块的函数] {greet_func('小红')}")

# --- 6. 动态创建并导入模块 ---
print("\\n=== 6. 自定义模块 ===")
import tempfile
import importlib.util

# 写一个模块文件
tmpdir = tempfile.mkdtemp()
mod_path = os.path.join(tmpdir, "mymath.py")
with open(mod_path, "w", encoding="utf-8") as f:
    f.write(\'\'\'
PI = 3.14159

def circle_area(r):
    """圆面积"""
    return PI * r * r

def circle_perimeter(r):
    """圆周长"""
    return 2 * PI * r

if __name__ == "__main__":
    # 当脚本运行时才执行
    print("直接运行 mymath.py")
    print(f"半径5的圆面积: {circle_area(5)}")
\'\'\')

# 动态导入这个模块
spec = importlib.util.spec_from_file_location("mymath", mod_path)
mymath = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mymath)

print(f"  mymath.PI = {mymath.PI}")
print(f"  mymath.circle_area(5) = {mymath.circle_area(5):.2f}")
print(f"  mymath.circle_perimeter(5) = {mymath.circle_perimeter(5):.2f}")
print(f"  模块里的函数: {[x for x in dir(mymath) if not x.startswith('_')]}")

# --- 7. sys 模块 ---
print("\\n=== 7. sys ===")
print(f"  Python 版本: {sys.version.split()[0]}")
print(f"  平台: {sys.platform}")
print(f"  已导入的模块数: {len(sys.modules)}")
print(f"  模块搜索路径数: {len(sys.path)}")

# --- 8. 实用：用模块组织项目 ---
print("\\n=== 8. 项目结构示例 ===")
print("  myproject/")
print("  ├── main.py            # 入口")
print("  ├── utils.py           # 工具函数")
print("  ├── models/            # 数据模型包")
print("  │   ├── __init__.py")
print("  │   ├── user.py")
print("  │   └── product.py")
print("  ├── services/          # 业务逻辑包")
print("  │   └── ...")
print("  └── requirements.txt   # 依赖清单")`
  },

  // -----------------------------------------------------------
  // 第 40 章：综合实战项目
  // -----------------------------------------------------------
  {
    id: "py9-40",
    group: "异常文件与实战",
    icon: "🏆",
    title: "综合实战：简易任务管理系统",
    content: `## 最后把所有知识串起来

40 章学完，最后用一个完整项目把所有知识用上：**任务管理系统**。

## 功能需求

1. 添加任务（标题、优先级、截止日期）
2. 列出任务（按状态/优先级过滤）
3. 标记完成
4. 编辑/删除任务
5. 持久化（保存到 JSON 文件）
6. 统计报告

## 涉及知识点

- **变量、类型**：任务的各种属性
- **数据结构**：列表存任务、字典做索引
- **流程控制**：if/for/while
- **推导式**：过滤、统计
- **函数**：每个操作一个函数
- **类与对象**：Task 类、TaskManager 类
- **继承**：不同类型任务
- **异常处理**：任务不存在、参数无效
- **装饰器**：日志、计时
- **文件读写**：JSON 持久化
- **模块**：datetime、json、os

## 设计

\`\`\`
Task (类)
  - 属性：id, title, priority, due_date, completed
  - 方法：complete, edit, to_dict, from_dict

TaskManager (类)
  - 属性：tasks (dict), storage (文件路径)
  - 方法：add, remove, list, filter, save, load
  - 装饰器：@log_operation 记录操作
\`\`\`

## 本章 demo

完整实现任务管理系统，用 JSON 文件持久化（在临时目录）。`,
    code: `# ============================================
# 第 40 章：综合实战 - 任务管理系统
# ============================================
import json
import os
import tempfile
from datetime import datetime, date
from functools import wraps

# ============================================================
# 装饰器：日志
# ============================================================
def log_operation(func):
    """记录操作日志"""
    @wraps(func)
    def wrapper(self, *args, **kwargs):
        print(f"    [LOG] {func.__name__}({args}, {kwargs})")
        result = func(self, *args, **kwargs)
        return result
    return wrapper

# ============================================================
# 异常
# ============================================================
class TaskError(Exception):
    """任务异常基类"""
    pass

class TaskNotFound(TaskError):
    """任务不存在"""
    pass

class InvalidPriority(TaskError):
    """无效优先级"""
    pass

# ============================================================
# Task 类
# ============================================================
class Task:
    """任务类"""
    PRIORITIES = {"high": 3, "medium": 2, "low": 1}
    PRIORITY_LABELS = {"high": "🔴高", "medium": "🟡中", "low": "🟢低"}

    def __init__(self, task_id, title, priority="medium", due_date=None):
        if priority not in self.PRIORITIES:
            raise InvalidPriority(f"优先级必须是 {list(self.PRIORITIES.keys())}，收到 {priority}")
        self.id = task_id
        self.title = title
        self.priority = priority
        self.due_date = due_date        # 字符串 "YYYY-MM-DD" 或 None
        self.completed = False
        self.created_at = datetime.now().strftime("%Y-%m-%d %H:%M")

    def complete(self):
        """标记完成"""
        self.completed = True
        return self

    def uncomplete(self):
        """标记未完成"""
        self.completed = False
        return self

    def edit(self, title=None, priority=None, due_date=None):
        """编辑任务"""
        if title is not None:
            self.title = title
        if priority is not None:
            if priority not in self.PRIORITIES:
                raise InvalidPriority(f"无效优先级: {priority}")
            self.priority = priority
        if due_date is not None:
            self.due_date = due_date
        return self

    @property
    def is_overdue(self):
        """是否过期"""
        if not self.due_date or self.completed:
            return False
        try:
            due = datetime.strptime(self.due_date, "%Y-%m-%d").date()
            return date.today() > due
        except ValueError:
            return False

    def to_dict(self):
        """转字典（用于 JSON 序列化）"""
        return {
            "id": self.id,
            "title": self.title,
            "priority": self.priority,
            "due_date": self.due_date,
            "completed": self.completed,
            "created_at": self.created_at,
        }

    @classmethod
    def from_dict(cls, data):
        """从字典创建（反序列化）"""
        t = cls(data["id"], data["title"], data["priority"], data.get("due_date"))
        t.completed = data.get("completed", False)
        t.created_at = data.get("created_at", "")
        return t

    def __str__(self):
        status = "✅" if self.completed else ("⏰" if self.is_overdue else "⬜")
        label = self.PRIORITY_LABELS[self.priority]
        due = f" (截止: {self.due_date})" if self.due_date else ""
        return f"{status} [{self.id}] {label} {self.title}{due}"

    def __repr__(self):
        return f"Task({self.id!r}, {self.title!r})"

    def __lt__(self, other):
        """按优先级排序（高优先级在前）"""
        return self.PRIORITIES[self.priority] > self.PRIORITIES[other.priority]

# ============================================================
# TaskManager 类
# ============================================================
class TaskManager:
    """任务管理器"""
    def __init__(self, storage_file=None):
        self.tasks = {}                  # id -> Task
        self._next_id = 1
        self.storage_file = storage_file
        if storage_file and os.path.exists(storage_file):
            self.load()

    @log_operation
    def add(self, title, priority="medium", due_date=None):
        """添加任务"""
        task = Task(f"T{self._next_id:03d}", title, priority, due_date)
        self.tasks[task.id] = task
        self._next_id += 1
        if self.storage_file:
            self.save()
        return task

    @log_operation
    def remove(self, task_id):
        """删除任务"""
        if task_id not in self.tasks:
            raise TaskNotFound(f"任务 {task_id} 不存在")
        task = self.tasks.pop(task_id)
        if self.storage_file:
            self.save()
        return task

    @log_operation
    def complete(self, task_id):
        """标记完成"""
        if task_id not in self.tasks:
            raise TaskNotFound(f"任务 {task_id} 不存在")
        self.tasks[task_id].complete()
        if self.storage_file:
            self.save()
        return self.tasks[task_id]

    def get(self, task_id):
        """获取任务"""
        if task_id not in self.tasks:
            raise TaskNotFound(f"任务 {task_id} 不存在")
        return self.tasks[task_id]

    def list_all(self, status=None, priority=None):
        """列出任务（可过滤）"""
        tasks = list(self.tasks.values())
        if status == "completed":
            tasks = [t for t in tasks if t.completed]
        elif status == "pending":
            tasks = [t for t in tasks if not t.completed]
        if priority:
            tasks = [t for t in tasks if t.priority == priority]
        return sorted(tasks)    # 用 __lt__ 排序

    def stats(self):
        """统计"""
        all_tasks = list(self.tasks.values())
        if not all_tasks:
            return {"总数": 0}
        return {
            "总数": len(all_tasks),
            "已完成": sum(1 for t in all_tasks if t.completed),
            "未完成": sum(1 for t in all_tasks if not t.completed),
            "已过期": sum(1 for t in all_tasks if t.is_overdue),
            "高优先级": sum(1 for t in all_tasks if t.priority == "high"),
        }

    def save(self):
        """保存到 JSON 文件"""
        data = {
            "next_id": self._next_id,
            "tasks": [t.to_dict() for t in self.tasks.values()],
        }
        with open(self.storage_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def load(self):
        """从 JSON 文件加载"""
        with open(self.storage_file, encoding="utf-8") as f:
            data = json.load(f)
        self._next_id = data.get("next_id", 1)
        for task_data in data.get("tasks", []):
            t = Task.from_dict(task_data)
            self.tasks[t.id] = t

    def __len__(self):
        return len(self.tasks)

    def __contains__(self, task_id):
        return task_id in self.tasks

    def __str__(self):
        return f"任务管理器: {len(self.tasks)} 个任务"

# ============================================================
# 主程序
# ============================================================
print("=" * 55)
print("任务管理系统")
print("=" * 55)

# 用临时文件做持久化
storage = os.path.join(tempfile.mkdtemp(), "tasks.json")
mgr = TaskManager(storage)

# 1. 添加任务
print("\\n--- 1. 添加任务 ---")
mgr.add("完成 Python 教程", "high", "2024-12-31")
mgr.add("买菜", "low", "2024-12-20")
mgr.add("写周报", "medium")
mgr.add("健身", "medium", "2024-12-25")
mgr.add("读书", "low")

# 2. 列出所有
print("\\n--- 2. 所有任务 ---")
for t in mgr.list_all():
    print(f"  {t}")

# 3. 完成
print("\\n--- 3. 完成任务 ---")
mgr.complete("T002")    # 完成买菜
print(f"  完成 T002 后:")
for t in mgr.list_all():
    print(f"  {t}")

# 4. 过滤
print("\\n--- 4. 过滤 ---")
print("  未完成:")
for t in mgr.list_all(status="pending"):
    print(f"    {t}")
print("  高优先级:")
for t in mgr.list_all(priority="high"):
    print(f"    {t}")

# 5. 编辑
print("\\n--- 5. 编辑 ---")
mgr.get("T003").edit(priority="high", due_date="2024-12-22")
print(f"  编辑 T003:")
print(f"  {mgr.get('T003')}")

# 6. 统计
print("\\n--- 6. 统计 ---")
for k, v in mgr.stats().items():
    print(f"  {k}: {v}")

# 7. 异常处理
print("\\n--- 7. 异常处理 ---")
try:
    mgr.get("T999")     # 不存在
except TaskNotFound as e:
    print(f"  ❌ {e}")

try:
    mgr.add("测试", "超级高")    # 无效优先级
except InvalidPriority as e:
    print(f"  ❌ {e}")

# 8. 持久化测试
print("\\n--- 8. 持久化 ---")
print(f"  保存到: {storage}")
print(f"  文件大小: {os.path.getsize(storage)} 字节")

# 重新加载
mgr2 = TaskManager(storage)
print(f"  重新加载: {mgr2}")
for t in mgr2.list_all():
    print(f"    {t}")

# 9. 推导式实战
print("\\n--- 9. 推导式统计 ---")
all_tasks = list(mgr.tasks.values())
by_priority = {p: [t.title for t in all_tasks if t.priority == p]
               for p in ["high", "medium", "low"]}
print(f"  按优先级分组: {by_priority}")

overdue = [t.title for t in all_tasks if t.is_overdue]
print(f"  已过期: {overdue}")

# 清理
os.remove(storage)
print(f"\\n  已清理持久化文件")

print("\\n" + "=" * 55)
print("🎉 Python 逐层深入教程 完结！")
print("=" * 55)
print("你已学完：")
print("• 起步：变量、类型、输入输出")
print("• 数据：数字、字符串、列表、元组、字典、集合")
print("• 流程：if、while、for、break/continue、推导式")
print("• 函数：参数、返回值、作用域、递归、lambda")
print("• 高阶：map/filter/sorted/reduce、闭包、装饰器")
print("• OOP：类、继承、多态、魔法方法、property")
print("• 异常与文件：try/except、文件读写、JSON")
print("• 模块：导入、标准库、自定义模块")
print("• 实战：综合项目")
print("\\n下一步：多写代码、读优秀项目源码、解决实际问题！")`
  }
];
