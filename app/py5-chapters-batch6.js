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
## 概述
本章介绍 Python 类的基础语法：\`class\` 定义、\`__init__\` 构造、\`self\` 约定、实例属性与类属性的区别，以及 \`@classmethod\` 与 \`@staticmethod\` 的用法。

## 核心要点
- **类定义**: \`class Dog:\` 开启一个新类，类体可写文档字符串与属性
- **构造方法**: \`def __init__(self, name, age):\` 第一个参数永远是 \`self\`，对应新建实例本身
- **实例属性**: \`self.name = name\` 绑定到单个实例，每个对象独立持有一份
- **类属性**: \`species = "Canis..."\` 定义在类体，所有实例共享，\`Dog.species\` 修改影响全部
- **方法调用**: \`obj.method()\` 等价于 \`Dog.method(obj)\`，Python 自动把 obj 作为 \`self\` 传入
- **@classmethod**: 第一个参数是 \`cls\`（类本身），常用于备选构造方法 \`from_birth_year\`
- **@staticmethod**: 不接收 \`self\`/\`cls\`，与类逻辑相关但不依赖实例状态
- **vars()**: \`vars(d1)\` 返回实例 \`__dict__\`，查看实例属性键值对
- **PEP 695 (3.12+)**: 泛型类可直接 \`class Box[T]:\`，无需 \`TypeVar\` 与 \`Generic\` 显式声明

## 原理与机制
- **属性查找顺序**: \`obj.attr\` 先查 \`obj.__dict__\`，未命中再查 \`type(obj).__dict__\` 与基类 MRO
- **可变类属性陷阱**: 若类属性是 list/dict，所有实例"共享同一对象"，常被误用为默认容器
- **实例化流程**: \`Dog("旺财", 3)\` 先 \`__new__\` 创建空对象，再 \`__init__\` 初始化属性
- **绑定方法**: 类中 \`def\` 是普通函数；通过 \`obj.method\` 取到的是已绑定 \`self\` 的方法对象

## 易错点与陷阱
- **可变默认值**: \`def __init__(self, items=[])\` 是经典陷阱，所有实例共享同一 list，应改用 \`None\` + 内部创建
- **类属性遮蔽**: \`d1.species = "x"\` 不会改 \`Dog.species\`，只是给 \`d1\` 加了实例属性遮蔽类属性
- **忘记 self**: \`def bark():\` 调用 \`obj.bark()\` 会报参数数量错误

## 实战建议
- **类属性用大写常量或 ClassVar 标注**，与实例属性在语义上区分清楚，避免混淆
- **优先在 __init__ 显式赋值**，不要在类体里写"看起来像默认实例属性"的可变对象
- **静态方法慎用**：若不需要访问类/实例，多数情况下写成模块级函数更清晰
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
## 概述
本章讲解 Python 的继承机制：单继承、\`super()\` 调用、多继承 MRO、\`isinstance\`/\`issubclass\` 检查、抽象基类 ABC，以及鸭子类型带来的隐式多态。

## 核心要点
- **单继承**: \`class Cat(Animal):\` 复用父类方法，可重写 \`speak\` 实现多态
- **super()**: \`super().__init__(...)\` 调用父类构造，避免重复初始化逻辑
- **多继承**: \`class D(B, C):\`，方法解析顺序由 \`__mro__\` 决定
- **MRO (C3 算法)**: \`D.__mro__\` 显示查找链，保证子类先于父类、左先于右
- **isinstance**: \`isinstance(c, Animal)\` 同时考虑子类，比 \`type(c) is Animal\` 更宽松
- **issubclass**: \`issubclass(Cat, Animal)\` 检查类与类之间的继承关系
- **ABC**: \`class Animal(ABC)\` + \`@abstractmethod\` 强制子类实现接口契约
- **鸭子类型**: 只要对象实现了 \`speak\`，无需继承也能调用——这是 Python 多态的核心
- **PEP 695 (3.12+)**: \`class Animal[T]:\` 可在 ABC 中引入泛型参数

## 原理与机制
- **MRO 计算**: Python 用 C3 线性化算法合并父类 MRO，菱形继承下保证一致顺序
- **super() 真相**: \`super()\` 不是"父类"，而是 MRO 中下一个类，故多继承下 \`super()\` 链按 MRO 顺序调用
- **抽象方法检查**: \`ABCMeta\` 在类创建时拦截，若有未实现的 \`@abstractmethod\` 则实例化抛 \`TypeError\`
- **\`__class__\`**: \`self.__class__.__name__\` 在子类中返回子类名，可用于通用的 \`introduce\`

## 易错点与陷阱
- **忘记 super().__init__**: 子类未调用父类构造，父类属性未初始化，运行时 \`AttributeError\`
- **MRO 不可构造**: 多继承若父类顺序不符合 C3 一致性，会抛 \`TypeError: Cannot create a consistent MRO\`
- **ABC 不能直接实例化**: \`Animal()\` 抛错，必须由子类实现所有抽象方法后才能创建实例
- **私有名 mangle**: \`self.__x\` 会被改名为 \`_ClassName__x\`，子类访问需注意改名规则

## 实战建议
- **优先组合而非继承**: 超过两层继承通常可用组合（has-a）替代，降低耦合
- **Mixin 命名约定**: 多继承的混入类以 \`Mixin\` 结尾，且只提供方法不持有状态
- **接口用 ABC 定义**: 明确契约，比纯鸭子类型在大型项目里更易维护和重构
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
## 概述
魔术方法（dunder methods，双下划线方法）让自定义类融入 Python 内置语法：\`repr\`/\`len\`/\`in\`/\`+\`/\`for\`/\`()\` 等运算符都对应一个 \`__xxx__\`。

## 核心要点
- **字符串表示**: \`__repr__\` 给开发者看（可重建对象），\`__str__\` 给用户看
- **容器协议**: 实现 \`__len__\`/\`__getitem__\` 后 \`len(cart)\`、\`cart[0]\` 即可工作
- **修改元素**: \`__setitem__\` 让 \`cart[1] = "葡萄"\` 这种索引赋值生效
- **成员判断**: \`__contains__\` 支持 \`in\`；未定义时 Python 回退到遍历 \`__iter__\`
- **迭代协议**: \`__iter__\` 返回迭代器，使 \`for x in cart\` 和列表推导可用
- **运算符重载**: \`__add__\` 定义 \`+\`、\`__eq__\` 定义 \`==\`，让对象像数值一样运算
- **可调用对象**: \`__call__\` 让实例 \`cart(discount=10)\` 像函数一样被调用
- **\`!r\` 格式化**: \`f"{self.items!r}"\` 调用 \`repr\` 而非 \`str\`，便于调试输出
- **PEP 695 (3.12+)**: 泛型容器可写 \`class Matrix[T]:\`，配合 \`__getitem__\` 做类型安全索引

## 原理与机制
- **协议即接口**: Python 不靠继承实现"接口"，而是靠实现一组 dunder 方法形成协议
- **数据模型**: \`len()\` 实际调用 \`type(obj).__len__(obj)\`，所有内置函数都走 dunder
- **\`__repr__\` 优先级**: 若未定义 \`__str__\`，\`print()\` 会回退到 \`__repr__\`，反之不行
- **迭代器协议**: \`__iter__\` 应返回实现了 \`__next__\` 的对象，生成器天然满足

## 易错点与陷阱
- **可变默认值**: \`__init__(self, items=[])\` 共享 list，应改用 \`items=None\` 再 \`list(items)\`
- **\`__eq__\` 不自动配套**: 定义 \`__eq__\` 后 \`!=\` 默认取反可用，但 \`__hash__\` 会被置 \`None\`，对象不可哈希
- **原地运算符**: \`+=\` 调用 \`__iadd__\`，未定义则回退到 \`__add__\` 创建新对象，性能与语义不同
- **返回 NotImplemented**: 类型不匹配时返回 \`NotImplemented\` 而非 \`raise\`，让 Python 尝试反向运算

## 实战建议
- **repr 优于 str**: 调试阶段至少实现 \`__repr__\`，包含类名与关键字段，便于排错
- **保持不可变性**: 若实现 \`__eq__\`/\`__lt__\` 用于排序，对象最好不可变，否则在 set/dict 中易出 bug
- **慎用 __call__**: 让对象像函数调用看似优雅，但会让代码意图模糊，仅用于真正的"可调用"语义
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
## 概述
\`@dataclass\`（PEP 557，3.7+）自动生成样板方法，\`@property\` 提供受控的属性访问，\`__slots__\` 节省内存并限制属性集合——三者结合让数据类既简洁又安全。

## 核心要点
- **自动生成**: \`@dataclass\` 默认生成 \`__init__\`、\`__repr__\`、\`__eq__\`
- **order=True**: 按字段顺序生成 \`__lt__\`/\`__le__\`/\`__gt__\`/\`__ge__\`，支持排序与比较
- **frozen=True**: 实例不可变，可哈希、可作 dict key；本例 frozen=False 故仍可改
- **field(default_factory=list)**: 用工厂函数解决可变默认值陷阱，每个实例独立 list
- **field(repr=False)**: 隐藏字段不进入 \`__repr__\`，例如内部缓存 \`_cache\`
- **__post_init__**: 在 \`__init__\` 末尾运行，做校验或派生字段（如 \`_cache["dist"]\`）
- **ClassVar 标注**: \`typing.ClassVar\` 标注的字段不被视作实例字段，dataclass 跳过
- **@property**: \`@property\` 定义 getter；\`@x.setter\` 定义 setter，可加入校验逻辑
- **__slots__**: \`__slots__ = ("_celsius",)\` 限制实例只能有这些属性，省去 \`__dict__\` 开销
- **PEP 695 (3.12+)**: 泛型数据类可写 \`@dataclass class Stack[T]:\`，无需 \`Generic[T]\`

## 原理与机制
- **代码生成**: dataclass 装饰器在类创建后用 \`exec\` 注入方法，等价于手写 \`__init__\`
- **字段顺序**: 默认参数必须在无默认参数之后；dataclass 会按定义顺序排好
- **不可变实现**: \`frozen=True\` 时 \`__setattr__\`/\`__delattr__\` 会抛 \`FrozenInstanceError\`
- **slots 优化**: \`__slots__\` 用描述符替代 \`__dict__\`，每个实例少一个 dict，省内存
- **property 描述符**: \`@property\` 实质是实现了 \`__get__\`/\`__set__\` 的描述符对象

## 易错点与陷阱
- **可变默认值**: \`tags: list = []\` 是经典错误，所有实例共享；必须用 \`field(default_factory=list)\`
- **frozen + property setter 冲突**: frozen 数据类无法在 \`__post_init__\` 中直接赋值，需 \`object.__setattr__(self, ...)\`
- **__slots__ 与继承**: 父类无 \`__slots__\` 时子类仍有 \`__dict__\`，slots 节省失效
- **order=True 陷阱**: 比较按所有字段顺序，若第一字段有 None 会因比较类型不一致而 \`TypeError\`

## 实战建议
- **数据类优先**: 纯数据容器（配置、DTO、记录）首选 \`@dataclass\`，比手写 \`__init__\` 更可靠
- **校验放 __post_init__**: 在此处抛 ValueError/TypeError，让"坏数据"在创建时即被发现
- **大规模实例用 slots**: 百万级对象场景下 \`__slots__\` 可显著降低内存与 GC 压力
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
