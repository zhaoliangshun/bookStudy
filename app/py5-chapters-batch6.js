// =============================================================
// Batch 6：面向对象（4 章）
// 5. py5-class      class 基础、__init__、self、实例/类属性、@classmethod/@staticmethod
// 6. py5-inherit    继承、super()、多继承 MRO、isinstance/issubclass、ABC
// 7. py5-dunder     魔术方法：__repr__/__str__/__len__/__getitem__/__iter__/__add__/__call__
// 8. py5-dataclass  @dataclass、field、@property、__post_init__、__slots__
// =============================================================

export const chapters = [
  {
    id: "py5-class",
    group: "面向对象",
    icon: "🏛️",
    title: "class 基础",
    content: `
- \`class\` 定义类；\`__init__\` 是构造方法，第一个参数永远是 \`self\`
- **实例属性** 绑定在 \`self\` 上；**类属性** 定义在类体中，所有实例共享
- \`@classmethod\` 第一个参数是 \`cls\`（类本身），用于工厂方法
- \`@staticmethod\` 不需要 self/cls，就是类里的普通函数
- 方法调用：\`obj.method()\` 自动把 obj 作为 self 传入
`,
    code: `class Dog:
    """小狗类"""
    species = "Canis lupus familiaris"  # 类属性
    count = 0

    def __init__(self, name, age):
        self.name = name          # 实例属性
        self.age = age
        Dog.count += 1

    def bark(self):
        return f"{self.name} 说：汪汪！"

    def birthday(self):
        self.age += 1
        return f"{self.name} {self.age} 岁了！"

    @classmethod
    def from_birth_year(cls, name, birth_year):
        """备选构造方法：用出生年份创建"""
        from datetime import date
        age = date.today().year - birth_year
        return cls(name, age)

    @staticmethod
    def is_adult(age):
        return age >= 2

d1 = Dog("旺财", 3)
d2 = Dog.from_birth_year("小白", 2022)
print(d1.bark())
print(d2.birthday())
print("species:", d1.species, Dog.species)
print("Dog count:", Dog.count)
print("is_adult(5):", Dog.is_adult(5), "is_adult(1):", Dog.is_adult(1))
print("vars(d1):", {k: v for k, v in vars(d1).items()})
`,
  },
  {
    id: "py5-inherit",
    group: "面向对象",
    icon: "🌳",
    title: "继承与多态",
    content: `
- \`class Child(Parent):\` 单继承；\`super().__init__()\` 调用父类构造
- **多继承**：\`class C(A, B)\`，MRO（方法解析顺序）用 \`__mro__\` 查看
- \`isinstance(obj, cls)\` 检查实例；\`issubclass(Sub, Parent)\` 检查子类
- \`abc.ABC\` + \`@abstractmethod\` 定义抽象基类，子类必须实现抽象方法
- Python 支持多态："鸭子类型"——不关心类型，关心接口
`,
    code: `from abc import ABC, abstractmethod

class Animal(ABC):
    @abstractmethod
    def speak(self):
        pass

    def introduce(self):
        return f"我是{self.__class__.__name__}, 我说: {self.speak()}"

class Cat(Animal):
    def speak(self):
        return "喵喵"

class Dog(Animal):
    def speak(self):
        return "汪汪"

class Robot:
    """不是 Animal 子类，但有 speak 方法（鸭子类型）"""
    def speak(self):
        return "哔哔"

c = Cat()
d = Dog()
r = Robot()
print(c.introduce())
print(d.introduce())
print("Robot.speak:", r.speak())
print("isinstance(c, Animal):", isinstance(c, Animal))
print("issubclass(Cat, Animal):", issubclass(Cat, Animal))

# 多继承与 MRO
class A:
    def greet(self): return "A"
class B(A):
    def greet(self): return "B" + super().greet()
class C(A):
    def greet(self): return "C" + super().greet()
class D(B, C):
    def greet(self): return "D" + super().greet()

print("D.greet():", D().greet())
print("D.__mro__:", [c.__name__ for c in D.__mro__])
`,
  },
  {
    id: "py5-dunder",
    group: "面向对象",
    icon: "✨",
    title: "魔术方法（Dunder）",
    content: `
- 魔术方法（双下划线方法）让自定义类支持 Python 语法
- 字符串表示：\`__repr__\`（给开发者）、\`__str__\`（给用户）
- 容器协议：\`__len__/__getitem__/__setitem__/__iter__/__contains__\`
- 运算符重载：\`__add__/__sub__/__eq__/__lt__\` 等
- \`__call__\` 让实例可以像函数一样被调用
`,
    code: `class ShoppingCart:
    def __init__(self, items=None):
        self.items = list(items) if items else []

    def __repr__(self):
        return f"ShoppingCart({self.items!r})"

    def __str__(self):
        return f"购物车(共{len(self)}件商品)"

    def __len__(self):
        return len(self.items)

    def __getitem__(self, index):
        return self.items[index]

    def __setitem__(self, index, value):
        self.items[index] = value

    def __contains__(self, item):
        return item in self.items

    def __iter__(self):
        return iter(self.items)

    def __add__(self, other):
        return ShoppingCart(self.items + other.items)

    def __eq__(self, other):
        return self.items == other.items

    def __call__(self, discount=0):
        total = len(self)
        return f"结算中... 共{total}件, 折扣{discount}%"

cart = ShoppingCart(["苹果", "香蕉", "橙子"])
cart[1] = "葡萄"
print("repr:", repr(cart))
print("str:", str(cart))
print("len:", len(cart))
print("cart[0]:", cart[0])
print("'苹果' in cart:", "苹果" in cart)
print("遍历:", [item for item in cart])
cart2 = cart + ShoppingCart(["牛奶"])
print("cart2:", cart2)
print("cart == cart2:", cart == cart2)
print("cart():", cart(discount=10))
`,
  },
  {
    id: "py5-dataclass",
    group: "面向对象",
    icon: "📊",
    title: "@dataclass 与 @property",
    content: `
- \`@dataclass\` 自动生成 \`__init__/__repr__/__eq__\` 等
- \`order=True\` 生成比较方法；\`frozen=True\` 使实例不可变
- \`field(default_factory=list)\` 解决可变默认值问题
- \`__post_init__\` 在 \`__init__\` 后运行，做验证/派生
- \`@property\` 把方法变成属性访问（getter）；\`@x.setter\` 定义 setter
- \`__slots__\` 限制实例属性，节省内存
`,
    code: `from dataclasses import dataclass, field
from typing import ClassVar

@dataclass(order=True, frozen=False)
class Point:
    x: float
    y: float
    label: str = "origin"
    tags: list[str] = field(default_factory=list)
    _cache: dict = field(default_factory=dict, repr=False)

    def __post_init__(self):
        if self.x < 0 or self.y < 0:
            self.label = "negative"
        self._cache["dist"] = (self.x ** 2 + self.y ** 2) ** 0.5

    @property
    def distance(self):
        return self._cache["dist"]

class Temperature:
    __slots__ = ("_celsius",)

    def __init__(self, celsius):
        self._celsius = celsius

    @property
    def celsius(self):
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError("低于绝对零度")
        self._celsius = value

    @property
    def fahrenheit(self):
        return self._celsius * 9 / 5 + 32

p1 = Point(3, 4, "A")
p2 = Point(1, 2, "B")
p1.tags.append("important")
print("p1:", p1)
print("p1.distance:", p1.distance)
print("p1 < p2:", p1 < p2, "(比较按字段顺序)")

t = Temperature(25)
print(f"{t.celsius}°C = {t.fahrenheit}°F")
t.celsius = 100
print("设置后:", t.celsius, "°C")
print("__slots__ 限制了属性，不能随便加属性")
`,
  },
];
