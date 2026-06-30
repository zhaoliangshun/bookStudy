// =============================================================
// Batch 6：面向对象（4 章）
// 21. py4-class        class 定义、__init__、self、属性
// 22. py4-inherit      继承、super、MRO、多继承
// 23. py4-magic        魔术方法：__repr__/__len__/__getitem__ 等
// 24. py4-dataclass    @dataclass、field、property
// =============================================================

export const chapters = [
  {
    id: "py4-class",
    group: "面向对象",
    icon: "🧱",
    title: "class 基础：__init__、self、属性",
    content: `
- 定义：\`class Name: ...\`，方法第一个参数永远是 \`self\`
- \`__init__\`：构造函数，创建实例时自动调用
- 实例属性用 \`self.xxx\`；类属性直接写在类体里
- 方法：\`def method(self, ...): ...\`
- 类方法 \`@classmethod\`（cls），静态方法 \`@staticmethod\`（无隐含参数）
`,
    code: `class Person:
    # 类属性（所有实例共享）
    species = "Homo sapiens"

    def __init__(self, name, age):
        # 实例属性
        self.name = name
        self.age = age

    def greet(self):
        return f"Hi, I'm {self.name}, {self.age} years old."

    # 类方法：第一个参数是类本身
    @classmethod
    def from_birth_year(cls, name, year):
        return cls(name, 2026 - year)

    # 静态方法：不需要 cls 或 self
    @staticmethod
    def is_adult(age):
        return age >= 18

p1 = Person("alice", 30)
p2 = Person.from_birth_year("bob", 1996)
print(p1.greet())
print(p2.greet())
print("class attr:", Person.species)
print("is adult:", Person.is_adult(17), Person.is_adult(30))
`,
  },
  {
    id: "py4-inherit",
    group: "面向对象",
    icon: "🧬",
    title: "继承、super、多继承、MRO",
    content: `
- 继承：\`class Sub(Base):\`，重写父类方法
- \`super()\` 调用父类方法
- 多继承：\`class C(A, B):\`，MRO 决定方法解析顺序
- \`__mro__\` 查看方法解析顺序
- \`isinstance()\` / \`issubclass()\` 检查类型关系
- 抽象类：\`from abc import ABC, abstractmethod\`
`,
    code: `from abc import ABC, abstractmethod

class Animal(ABC):
    def __init__(self, name):
        self.name = name

    @abstractmethod
    def speak(self):
        pass

    def __repr__(self):
        return f"{self.__class__.__name__}({self.name!r})"

class Dog(Animal):
    def speak(self):
        return f"{self.name}: woof!"

class Cat(Animal):
    def speak(self):
        return f"{self.name}: meow!"

animals = [Dog("Rex"), Cat("Mimi")]
for a in animals:
    print(a, "->", a.speak())

# isinstance / issubclass
print(isinstance(animals[0], Dog), isinstance(animals[0], Animal))
print(issubclass(Dog, Animal), issubclass(Dog, Cat))

# 多继承与 MRO
class A:
    def fn(self):
        return "A"

class B(A):
    def fn(self):
        return "B" + super().fn()

class C(A):
    def fn(self):
        return "C" + super().fn()

class D(B, C):
    pass

d = D()
print("MRO:", [c.__name__ for c in D.__mro__])
print(d.fn())  # 按 MRO 顺序查找
`,
  },
  {
    id: "py4-magic",
    group: "面向对象",
    icon: "🪄",
    title: "魔术方法：__repr__、__len__ 等",
    content: `
- **dunder 方法**（double underscore）：Python 协议
- 常见：\`__repr__\` / \`__str__\` / \`__len__\` / \`__getitem__\` / \`__setitem__\`
- \`__iter__\` / \`__next__\`：迭代器协议
- \`__contains__\`：支持 \`in\` 运算符
- \`__eq__\` / \`__lt__\` 等：比较运算符
- \`__call__\`：让实例可调用
- \`__enter__\` / \`__exit__\`：上下文管理器协议
`,
    code: `class Vector:
    def __init__(self, *values):
        self._values = list(values)

    def __repr__(self):
        return f"Vector({', '.join(map(str, self._values))})"

    def __str__(self):
        return f"({', '.join(map(str, self._values))})"

    def __len__(self):
        return len(self._values)

    def __getitem__(self, i):
        return self._values[i]

    def __setitem__(self, i, v):
        self._values[i] = v

    def __iter__(self):
        return iter(self._values)

    def __contains__(self, x):
        return x in self._values

    def __eq__(self, other):
        if isinstance(other, Vector):
            return self._values == other._values
        return NotImplemented

    def __add__(self, other):
        if isinstance(other, Vector):
            return Vector(*(a + b for a, b in zip(self._values, other._values)))
        return NotImplemented

v = Vector(1, 2, 3)
print(repr(v), str(v))
print("len:", len(v))
print("v[1]:", v[1])
v[1] = 99
print("after set:", v)
print("2 in v:", 2 in v)
print("99 in v:", 99 in v)

v2 = Vector(1, 99, 3)
print("v == v2:", v == v2)
print("v + v2:", v + v2)
`,
  },
  {
    id: "py4-dataclass",
    group: "面向对象",
    icon: "📊",
    title: "dataclass 与 property",
    content: `
- \`@dataclass\`：自动生成 \`__init__\` / \`__repr__\` / \`__eq__\`
- \`field()\`：设定默认值、default_factory、metadata
- \`frozen=True\`：不可变（可哈希，可做 dict key）
- \`@property\`：方法当属性用（getter/setter/deleter）
- 对比：dataclass 适合数据容器，普通 class 适合有行为
`,
    code: `from dataclasses import dataclass, field
from typing import ClassVar

# 基础 dataclass
@dataclass
class Point:
    x: float
    y: float
    tags: list[str] = field(default_factory=list)

p1 = Point(1, 2)
p2 = Point(1, 2, ["a"])
print(p1, p2, p1 == Point(1, 2))

# frozen：不可变
@dataclass(frozen=True)
class Color:
    r: int
    g: int
    b: int

red = Color(255, 0, 0)
print(red, hash(red))

# @property
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        return self._radius

    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("radius 不能为负")
        self._radius = value

    @property
    def area(self):
        return 3.14159 * self._radius ** 2

c = Circle(2)
print("area:", c.area)
c.radius = 5
print("new area:", c.area)

# 实战：带校验的 dataclass
@dataclass
class User:
    name: str
    _age: int = field(repr=False)

    @property
    def age(self):
        return self._age

    @age.setter
    def age(self, value):
        if value < 0:
            raise ValueError("age 不能为负")
        self._age = value

u = User("alice", 30)
print(u, u.age)
`,
  },
];