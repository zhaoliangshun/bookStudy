// =============================================================
// Python 设计思想与架构教程 - 第 2 批章节(SOLID 原则 下)
// -------------------------------------------------------------
// 本批次覆盖 SOLID 原则的下半部分与综合实战,共 4 章:
//   1. pyarch-solid-lsp      — 里氏替换原则(LSP)
//   2. pyarch-solid-isp      — 接口隔离原则(ISP)
//   3. pyarch-solid-dip      — 依赖倒置原则(DIP)
//   4. pyarch-solid-summary  — SOLID 综合实战与权衡
//
// 写作风格:中文讲解,重点讲「为什么」和「怎么想」,
// 大量表格、ASCII 图、Python 代码示例,每章末尾附易错点小结。
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章:里氏替换原则(LSP)
  // =========================================================
  {
    id: "pyarch-solid-lsp",
    icon: "🦅",
    title: "里氏替换原则(LSP)",
    group: "SOLID 原则",
    content: `# 里氏替换原则(LSP)

> "子类型必须能够替换掉它们的基类型,而程序的行为不会改变。"
> —— Barbara Liskov,1987

## 一、LSP 是什么

里氏替换原则(Liskov Substitution Principle,简称 LSP)是 SOLID 五原则中的第三个,由 Barbara Liskov 在 1987 年 OOPSLA 会议上提出,并在 1994 年与 Jeannette Wing 合作的论文《A Behavioral Notion of Subtyping》中正式形式化。

它的核心一句话:

**所有引用基类(父类)的地方必须能透明地使用其子类的对象。**

换句话说,当你把一个父类对象换成它的子类对象时,程序应该照常工作,不会出现意外行为、抛异常、或破坏业务约束。如果换不了,那就说明继承关系设计错了——子类并不是一个"真正的"子类型,而只是一个"长得像但本质不同"的东西。

### 1.1 直觉理解

LSP 的直觉可以这样理解:

\`\`\`
父类承诺的事情,子类必须全部兑现。
父类没承诺的事情,子类可以做,但不能违反父类已有的约定。
\`\`\`

打个比方:你跟一个"鸟类"对象签了合同,合同里写着"调用 fly() 就会飞起来"。现在你换了一个"企鹅"对象进来,企鹅说"我不会飞",那它就违反了合同——这就是 LSP 违规。

### 1.2 为什么 LSP 重要

很多人把继承当成"代码复用"的工具:看到子类想用父类的方法,就继承一下。但这种想法忽略了继承的语义责任。继承不只是复用代码,更是声明"我是一种特殊的父类"。如果子类在某些方面跟父类行为不一致,那使用父类的代码就无法安全地使用子类,整个类型体系就崩了。

LSP 的重要意义:

| 维度 | 不遵守 LSP | 遵守 LSP |
|------|-----------|---------|
| 类型安全 | 使用者必须 instanceof 判断子类 | 直接用父类即可,无需判断 |
| 代码复用 | 复用了代码但破坏了抽象 | 真正复用了抽象 |
| 多态价值 | 多态变成陷阱 | 多态安全可靠 |
| 维护成本 | 每加一个子类就要改使用者 | 加子类不影响使用者 |

## 二、Barbara Liskov 的原始论文

Barbara Liskov 是 MIT 的计算机科学家,2008 年图灵奖得主。她在 1987 年的 keynote 中首次提出这个原则,后来在 1994 年的论文里给出了形式化定义。

### 2.1 形式化定义

论文里的形式化表述(简化版):

> 设 \`q(x)\` 是类型 \`T\` 的对象 \`x\` 可证明的性质。
> 那么 \`q(y)\` 应该对类型 \`S\` 的对象 \`y\` 为真,其中 \`S\` 是 \`T\` 的子类型。

翻译成人话:**凡是父类能保证成立的性质,子类也必须保证成立。**

这个定义的关键在于"可证明的性质"——它不只是方法签名一致,而是**行为契约**一致。签名相同但行为不同的子类,依然违反 LSP。

### 2.2 行为契约的三个维度

LSP 关注的行为契约包括:

1. **方法签名**:参数类型、返回类型、异常声明(静态层面)
2. **行为语义**:方法做了什么、返回什么、有什么副作用(动态层面)
3. **不变式**:对象在生命周期内始终成立的约束(状态层面)

很多人只关注第一点,而 LSP 真正的难点在后两点。

## 三、经典反例:正方形继承长方形

这是 LSP 最经典的反例,几乎所有讲 LSP 的资料都会用。我们详细拆解。

### 3.1 长方形类

\`\`\`python
class Rectangle:
    """长方形:宽和高可以独立变化。"""
    def __init__(self, width: int, height: int):
        self._width = width
        self._height = height

    @property
    def width(self) -> int:
        return self._width

    @width.setter
    def width(self, value: int) -> None:
        self._width = value

    @property
    def height(self) -> int:
        return self._height

    @height.setter
    def height(self, value: int) -> None:
        self._height = value

    def area(self) -> int:
        return self._width * self._height
\`\`\`

长方形的使用者可能这样写代码:

\`\`\`python
def use_rectangle(r: Rectangle) -> None:
    r.width = 5
    r.height = 4
    assert r.area() == 20  # 长方形:5*4=20,天经地义
\`\`\`

### 3.2 正方形继承长方形

直觉上"正方形是一个特殊的长方形",于是有人这么写:

\`\`\`python
class Square(Rectangle):
    """正方形:宽高必须相等。"""
    def __init__(self, side: int):
        super().__init__(side, side)

    @property
    def width(self) -> int:
        return self._width

    @width.setter
    def width(self, value: int) -> None:
        self._width = value
        self._height = value  # 保持宽高相等

    @property
    def height(self) -> int:
        return self._height

    @height.setter
    def height(self, value: int) -> None:
        self._width = value  # 保持宽高相等
        self._height = value
\`\`\`

正方形覆盖了 setter,保证设宽时高也跟着变。看起来很合理。

### 3.3 灾难发生

把正方形传给刚才的使用者:

\`\`\`python
sq = Square(2)
use_rectangle(sq)  # 💥 AssertionError!
\`\`\`

执行过程:
1. \`r.width = 5\` → 正方形把宽和高都设成 5
2. \`r.height = 4\` → 正方形把宽和高都设成 4
3. \`r.area()\` → 返回 4 * 4 = 16,不等于 20,断言失败

问题在哪?

\`\`\`
使用者基于"长方形的宽高独立"这个契约写代码。
正方形违反了这个契约:它的宽高不独立。
所以正方形不是一个真正的长方形子类型。
\`\`\`

### 3.4 反例的本质

这个反例揭示了 LSP 的核心:**is-a 关系不是看现实世界的分类,而是看行为契约是否一致。**

现实里"正方形是一种长方形"没错,但在程序的世界里,长方形的契约是"宽高独立可变",正方形做不到这一点,所以它不能作为长方形的子类。

## 四、Python 实战反例:Bird 与 Penguin

我们再看一个 Python 风格的反例,更贴近实际开发。

### 4.1 错误的设计

\`\`\`python
class Bird:
    """鸟的基类。"""
    def fly(self) -> str:
        return "我在飞"

class Sparrow(Bird):
    """麻雀,会飞。"""
    pass

class Penguin(Bird):
    """企鹅,不会飞。"""
    def fly(self) -> str:
        raise NotImplementedError("企鹅不会飞")
\`\`\`

使用者:

\`\`\`python
def make_birds_fly(birds: list[Bird]) -> list[str]:
    return [b.fly() for b in birds]

birds = [Sparrow(), Penguin()]
make_birds_fly(birds)  # 💥 NotImplementedError: 企鹅不会飞
\`\`\`

使用者按"鸟都会飞"的契约写代码,但企鹅是鸟却不会飞——LSP 被打破。

### 4.2 常见的错误修补

有人会这样"修补":

\`\`\`python
def make_birds_fly(birds: list[Bird]) -> list[str]:
    results = []
    for b in birds:
        if isinstance(b, Penguin):
            results.append("企鹅不会飞")
        else:
            results.append(b.fly())
    return results
\`\`\`

这是典型的 LSP 违规症状:**使用者被迫用 isinstance 区分子类**。每加一种不会飞的鸟(比如鸵鸟、鸸鹋),都要回来改这段代码。多态的价值丧失殆尽。

## 五、重构手法:提取共同抽象

正确做法是**承认"飞"不是所有鸟的能力**,把"飞"从鸟基类里剥离出来。

### 5.1 分离 IFlyer 接口

\`\`\`python
from abc import ABC, abstractmethod

class Bird(ABC):
    """鸟的基类:只定义所有鸟都有的能力。"""
    @abstractmethod
    def lay_egg(self) -> str:
        return "下了一个蛋"

class IFlyer(ABC):
    """可飞行的接口。"""
    @abstractmethod
    def fly(self) -> str:
        ...

class Sparrow(Bird, IFlyer):
    """麻雀:既是鸟,又能飞。"""
    def fly(self) -> str:
        return "麻雀在飞"

class Penguin(Bird):
    """企鹅:是鸟,但不实现 IFlyer。"""
    pass

class Eagle(Bird, IFlyer):
    """老鹰:既是鸟,又能飞。"""
    def fly(self) -> str:
        return "老鹰翱翔"
\`\`\`

现在使用者的契约变得清晰:

\`\`\`python
def make_flyers_fly(flyers: list[IFlyer]) -> list[str]:
    return [f.fly() for f in flyers]  # 只接受会飞的

flyers: list[IFlyer] = [Sparrow(), Eagle()]
print(make_flyers_fly(flyers))  # ['麻雀在飞', '老鹰翱翔']

# Penguin() 不在 IFlyer 列表里,编译期/类型检查就能发现
\`\`\`

### 5.2 重构的思路总结

\`\`\`
重构前:                重构后:
  Bird                   Bird(只有共同能力)
   ├── fly()              ├── lay_egg()
   │                       │
   ├── Sparrow             ├── Sparrow(Bird, IFlyer)
   └── Penguin             ├── Penguin(Bird)
       └── fly() 抛异常    └── Eagle(Bird, IFlyer)

                     IFlyer(独立的飞行接口)
                       └── fly()
\`\`\`

核心思想:**不要把"部分子类才有的能力"放进基类。** 把它抽成独立的接口,让真正有这个能力的子类去实现。

## 六、正方形/长方形的正确重构

回到正方形/长方形的例子,正确做法是**提取共同抽象 Shape**,让二者都成为 Shape 的子类,而不是父子关系。

### 6.1 引入 Shape 抽象

\`\`\`python
from abc import ABC, abstractmethod

class Shape(ABC):
    """所有形状的抽象基类。"""
    @abstractmethod
    def area(self) -> float:
        ...

class Rectangle(Shape):
    """长方形:宽高独立。"""
    def __init__(self, width: float, height: float):
        self._width = width
        self._height = height

    @property
    def width(self) -> float:
        return self._width

    @width.setter
    def width(self, value: float) -> None:
        self._width = value

    @property
    def height(self) -> float:
        return self._height

    @height.setter
    def height(self, value: float) -> None:
        self._height = value

    def area(self) -> float:
        return self._width * self._height

class Square(Shape):
    """正方形:宽高始终相等,不暴露独立的 width/height setter。"""
    def __init__(self, side: float):
        self._side = side

    @property
    def side(self) -> float:
        return self._side

    @side.setter
    def side(self, value: float) -> None:
        self._side = value

    def area(self) -> float:
        return self._side * self._side
\`\`\`

### 6.2 重构后的好处

\`\`\`python
def print_area(shape: Shape) -> None:
    print(f"面积是 {shape.area()}")

print_area(Rectangle(5, 4))  # 面积是 20
print_area(Square(5))        # 面积是 25
\`\`\`

使用者只依赖 \`Shape.area()\` 这个契约,不关心是长方形还是正方形。Square 不再伪装成 Rectangle,各司其职,LSP 完整保留。

\`\`\`
重构前:                重构后:
  Rectangle              Shape(抽象)
   └── Square(违规)        ├── Rectangle
                           └── Square
                          (平级兄弟,而非父子)
\`\`\`

## 七、协变与逆变

LSP 与类型系统的协变(covariance)、逆变(contravariance)密切相关。我们用 Python 来讲解,虽然 Python 是动态语言,但理解这些概念对设计接口很有帮助。

### 7.1 协变(Covariance)

如果 \`S\` 是 \`T\` 的子类型,那么 \`F<S>\` 也是 \`F<T>\` 的子类型,则称 \`F\` 是协变的。

**返回类型是协变的**:子类方法可以返回比父类更具体的类型。

\`\`\`python
class Animal: ...
class Dog(Animal): ...

class AnimalFactory:
    def create(self) -> Animal:
        return Animal()

class DogFactory(AnimalFactory):
    def create(self) -> Dog:  # 返回 Dog,比 Animal 更具体,合法
        return Dog()
\`\`\`

为什么合法?因为使用者期望得到一个 \`Animal\`,你给他一个 \`Dog\`(也是一种 Animal),他不会出问题。这符合 LSP。

### 7.2 逆变(Contravariance)

如果 \`S\` 是 \`T\` 的子类型,而 \`F<T>\` 是 \`F<S>\` 的子类型,则称 \`F\` 是逆变的。

**参数类型是逆变的**:子类方法可以接受比父类更宽泛的类型。

\`\`\`python
class Animal: ...
class Dog(Animal): ...

class DogProcessor:
    def process(self, animal: Animal) -> None:  # 接受任意 Animal
        print("处理动物")

class SpecificDogProcessor(DogProcessor):
    def process(self, animal: Animal) -> None:  # 仍接受任意 Animal,合法
        print("处理具体动物")
\`\`\`

反过来,如果子类把参数收窄成只接受 \`Dog\`,那就违反 LSP:

\`\`\`python
class BadDogProcessor(DogProcessor):
    def process(self, dog: Dog) -> None:  # 只接受 Dog,违规!
        print("只处理狗")

# 使用者按父类契约传一个 Cat(也是 Animal),BadDogProcessor 会出问题
\`\`\`

### 7.3 Python 的宽松性

Python 是动态类型语言,运行时不强制检查这些。但 **mypy / pyright 等类型检查器会检查**。Python 3.10+ 引入了 \`typing.ParamSpec\`、\`typing.TypeVar\` 等工具来表达协变逆变。

\`\`\`python
from typing import TypeVar, Generic

T_co = TypeVar("T_co", covariant=True)        # 协变类型变量
T_contra = TypeVar("T_contra", contravariant=True)  # 逆变类型变量

class Producer(Generic[T_co]):
    def get(self) -> T_co: ...

class Consumer(Generic[T_contra]):
    def put(self, item: T_contra) -> None: ...
\`\`\`

### 7.4 协变逆变速查表

| 元素 | 变化方向 | 说明 |
|------|---------|------|
| 返回类型 | 协变 | 子类可返回更具体类型 |
| 参数类型 | 逆变 | 子类可接受更宽泛类型 |
| 不可变(如 list) | 不变 | 必须完全匹配,如 \`list[Dog]\` 不是 \`list[Animal]\` 子类 |
| 只读容器(如 Sequence) | 协变 | 只读不写,可放宽 |
| 只写容器(如 Callable 参数) | 逆变 | 只写不读,可收窄参数 |

## 八、LSP 与契约设计(DbC)

契约式设计(Design by Contract,DbC)由 Bertrand Meyer 提出,核心思想是**软件模块之间通过明确的契约(前置条件、后置条件、不变式)约束彼此**。LSP 可以用 DbC 的语言精确表述。

### 8.1 三个契约要素

\`\`\`
前置条件(Precondition):方法调用前必须为真的条件
后置条件(Postcondition):方法返回后必须为真的条件
不变式(Invariant):对象在任意可观察时刻都为真的条件
\`\`\`

### 8.2 LSP 的契约表述

LSP 对子类的契约约束:

| 契约要素 | 子类相对父类 | 直觉 |
|---------|-------------|------|
| 前置条件 | **不能加强**(可以放宽) | 子类不能要求更苛刻的输入 |
| 后置条件 | **不能削弱**(可以加强) | 子类必须至少满足父类的输出承诺 |
| 不变式 | **必须维持**(可以新增) | 子类必须保持父类所有不变式 |

#### 8.2.1 前置条件不能加强

父类方法接受 1-100 的整数,子类不能改成只接受 1-50。否则原本传 80 的调用者换上子类就崩了。

\`\`\`python
class Base:
    def process(self, n: int) -> None:
        assert 1 <= n <= 100  # 前置条件:1-100
        print(f"处理 {n}")

class BadChild(Base):
    def process(self, n: int) -> None:
        assert 1 <= n <= 50  # 加强了前置条件,违反 LSP!
        print(f"处理 {n}")

# 调用者按父类契约传 80
Base().process(80)  # OK
BadChild().process(80)  # 💥 AssertionError
\`\`\`

正确做法:子类放宽(或保持)前置条件。

\`\`\`python
class GoodChild(Base):
    def process(self, n: int) -> None:
        assert 1 <= n <= 200  # 放宽,合法
        print(f"处理 {n}")
\`\`\`

#### 8.2.2 后置条件不能削弱

父类方法保证返回正数,子类不能返回负数。否则使用者拿到结果做计算就出错。

\`\`\`python
class Base:
    def compute(self) -> int:
        return 42  # 后置条件:返回正数

class BadChild(Base):
    def compute(self) -> int:
        return -1  # 削弱了后置条件,违反 LSP!

# 调用者按父类契约用 math.sqrt 处理返回值
import math
print(math.sqrt(Base().compute()))      # OK
print(math.sqrt(BadChild().compute()))  # 💥 ValueError
\`\`\`

正确做法:子类保证返回正数(可以返回更大的正数,加强后置条件)。

\`\`\`python
class GoodChild(Base):
    def compute(self) -> int:
        return 100  # 满足"正数"的后置条件,合法
\`\`\`

#### 8.2.3 不变式必须维持

父类的不变式是"余额永远非负",子类不能让余额变负。

\`\`\`python
class BankAccount:
    def __init__(self):
        self._balance = 0

    @property
    def balance(self) -> int:
        return self._balance

    def withdraw(self, amount: int) -> None:
        assert amount <= self._balance  # 不变式:余额非负
        self._balance -= amount

class OverdraftAccount(BankAccount):
    """允许透支的账户。"""
    def withdraw(self, amount: int) -> None:
        self._balance -= amount  # 余额可能为负,破坏不变式!
\`\`\`

\`OverdraftAccount\` 破坏了"余额非负"的不变式,违反 LSP。正确做法是不要让它继承 \`BankAccount\`,而是单独设计,或共享一个更抽象的 \`Account\` 基类。

### 8.3 异常也是契约的一部分

父类声明不抛某个异常,子类就不能抛。父类抛 \`ValueError\`,子类可以抛 \`ValueError\` 或它的子类,但不能抛 \`IOError\`。

\`\`\`python
class Base:
    def read(self) -> str:
        return "data"  # 不抛异常

class BadChild(Base):
    def read(self) -> str:
        raise IOError("磁盘错误")  # 抛了父类没声明的异常,违反 LSP!
\`\`\`

## 九、LSP 的常见违规信号

开发中如何识别 LSP 违规?以下是几个典型信号:

### 9.1 使用者出现 instanceof 判断

\`\`\`python
def process(bird: Bird) -> None:
    if isinstance(bird, Penguin):
        print("不会飞")
    else:
        bird.fly()
\`\`\`

只要使用者用 isinstance 区分子类,几乎一定是 LSP 出了问题。

### 9.2 子类方法抛 NotImplementedError

\`\`\`python
class Base:
    def feature(self) -> None:
        print("做某事")

class Child(Base):
    def feature(self) -> None:
        raise NotImplementedError("我不支持这个功能")
\`\`\`

这是 Python 里最常见的 LSP 违规,俗称"空实现反模式"。

### 9.3 子类静默忽略父类方法

\`\`\`python
class Base:
    def log(self, msg: str) -> None:
        print(f"[LOG] {msg}")

class SilentChild(Base):
    def log(self, msg: str) -> None:
        pass  # 什么都不做,静默吞掉
\`\`\`

父类承诺"会打印日志",子类却不打印,违反后置条件。

### 9.4 子类改变方法的副作用语义

\`\`\`python
class Base:
    def save(self) -> None:
        print("存到数据库")

class Child(Base):
    def save(self) -> None:
        print("存到文件")  # 副作用语义变了
\`\`\`

虽然签名一致,但行为语义改变,使用者按"存数据库"写的代码会失效。

## 十、Python 中的 LSP 实践要点

### 10.1 用 abc 强制契约

Python 的 \`abc.ABC\` + \`@abstractmethod\` 可以在静态层面强制子类实现方法。但它无法强制行为契约,只能靠文档和测试。

\`\`\`python
from abc import ABC, abstractmethod

class Repository(ABC):
    @abstractmethod
    def find(self, id: int) -> dict | None:
        """根据 id 查询记录,不存在返回 None。

        契约:
        - 前置条件:id 为正整数
        - 后置条件:返回 dict 或 None,不抛业务异常
        - 不变式:不修改其他记录
        """
        ...
\`\`\`

文档字符串里写清楚契约,子类实现时必须遵守。

### 10.2 用 typing 表达类型契约

\`\`\`python
from abc import ABC, abstractmethod
from typing import Protocol

class Repository(Protocol):
    def find(self, id: int) -> dict | None: ...

class UserRepository:
    """实现 Repository 协议,无需显式继承。"""
    def find(self, id: int) -> dict | None:
        return {"id": id, "name": "张三"} if id > 0 else None
\`\`\`

Protocol 是结构性子类型,只要结构匹配就算实现,更灵活(详见 ISP 章节)。

### 10.3 测试驱动保证 LSP

最实际的 LSP 检测手段是**子类复用父类的测试**。父类有一组测试用例,子类也必须全部通过。

\`\`\`python
import unittest

class RectangleTest(unittest.TestCase):
    def setUp(self):
        # 子类覆盖此方法返回具体实例
        self.r = self.create_rectangle(5, 4)

    def create_rectangle(self, w, h):
        return Rectangle(w, h)

    def test_width_height_independent(self):
        self.r.width = 5
        self.r.height = 4
        self.assertEqual(self.r.area(), 20)

# SquareTest 复用 RectangleTest,会失败 → 暴露 LSP 违规
class SquareTest(RectangleTest):
    def create_rectangle(self, w, h):
        return Square(w)  # Square 忽略 h

# 运行 SquareTest.test_width_height_independent 会 AssertionError
\`\`\`

这种"子类跑父类测试"的做法,是检测 LSP 违规的利器。

## 十一、LSP 与其他原则的联动

LSP 不是孤立的,它与其他 SOLID 原则紧密相关:

\`\`\`
       OCP(对扩展开放)
          ↑
          | 依赖
          |
       LSP ←—— ISP(接口小,LSP 更易满足)
          ↑
          | 基础
          |
       SRP(职责单一,契约清晰)
\`\`\`

- **SRP → LSP**:职责单一的类,契约清晰,子类更容易遵守
- **LSP → OCP**:只有子类能安全替换父类,新子类才能在不改老代码的前提下扩展(OCP)
- **ISP → LSP**:接口越窄,子类需要实现的越少,违反 LSP 的机会越少

## 十二、易错点小结

| 易错点 | 描述 | 后果 | 正确做法 |
|--------|------|------|---------|
| 正方形继承长方形 | 破坏"宽高独立"契约 | 使用者断言失败 | 提取 Shape 抽象,二者平级 |
| 子类抛 NotImplementedError | 父类承诺的方法子类不支持 | 使用者运行时崩溃 | 抽出独立接口,让能者实现 |
| 子类静默忽略父类方法 | 后置条件被削弱 | 行为不一致,bug 难查 | 子类必须完成父类承诺 |
| 子类加强前置条件 | 只接受更窄的输入 | 原本合法的调用变非法 | 子类放宽或保持前置条件 |
| 子类抛父类未声明的异常 | 异常契约被破坏 | 调用者未 catch 的异常逃逸 | 子类只抛父类异常的子类 |
| 使用者 isinstance 判断子类 | LSP 违规的典型信号 | 每加子类都要改使用者 | 重新设计继承结构 |
| 把"部分子类才有"的能力放基类 | 如 Bird.fly() | 不会的子类被迫空实现 | 抽成独立接口 |
| 子类改变副作用语义 | 如存数据库变存文件 | 使用者依赖的副作用失效 | 保持语义一致,或换抽象 |
| 忽略不变式 | 如透支账户破坏余额非负 | 状态约束被破坏 | 不继承,或共享更高抽象 |
| 只看签名不看行为 | 签名相同就以为满足 LSP | 行为契约仍可能违反 | 用测试验证行为契约 |

## 十三、本章总结

LSP 是 SOLID 里最容易被低估的原则。很多人觉得"继承复用代码"就够了,忽视了继承背后的行为契约。LSP 提醒我们:

1. **继承 = 契约继承**,不只是代码继承
2. **is-a 关系看行为,不看现实分类**——程序里的"是"由契约决定
3. **子类只能加强承诺,不能削弱**——前置不能加严,后置不能削弱,不变式必须维持
4. **LSP 是 OCP 的基石**——没有 LSP,多态就是陷阱,扩展就要改老代码
5. **检测 LSP 的最佳手段是测试**——让子类跑父类的测试用例

下一章我们将学习 ISP(接口隔离原则),它从另一个维度保护接口的清晰性,与 LSP 相辅相成。
`,
  },

  // =========================================================
  // 第二章:接口隔离原则(ISP)
  // =========================================================
  {
    id: "pyarch-solid-isp",
    icon: "🔌",
    title: "接口隔离原则(ISP)",
    group: "SOLID 原则",
    content: `# 接口隔离原则(ISP)

> "客户端不应被迫依赖它不使用的方法。"
> —— Robert C. Martin

## 一、ISP 是什么

接口隔离原则(Interface Segregation Principle,简称 ISP)是 SOLID 五原则中的第四个。它的核心一句话:

**客户端不应该被迫依赖它不使用的方法。**

换句话说,**接口要小而专,不要胖**。一个臃肿的"胖接口"强迫所有实现类实现所有方法,哪怕有些方法它们根本用不到,只能写空实现或抛异常——这又直接违反了我们上一章学的 LSP。

### 1.1 直觉理解

ISP 的直觉是:

\`\`\`
接口 = 一组相关能力的契约
使用者只应该看到它真正需要的能力
\`\`\`

打个比方:你买一个简单的打印机,只需要"打印"功能。但商家硬塞给你一台"多功能一体机"的说明书,里面写了打印、扫描、传真、复印、装订……你只用打印,却被迫了解其他功能——这就是胖接口的痛苦。

### 1.2 ISP 与 SRP、LSP 的关系

\`\`\`
SRP(类的职责单一)—— 关注"类"的粒度
ISP(接口的方法单一)—— 关注"接口"的粒度
LSP(子类能替换父类)—— 关注"继承"的契约

ISP 是 SRP 在接口维度的对应物:
  SRP 拆类,ISP 拆接口。
ISP 是 LSP 的预防针:
  接口越小,实现类越不容易被迫违反 LSP。
\`\`\`

## 二、为什么需要 ISP

### 2.1 胖接口的危害

我们来看一个典型反例:多功能设备接口。

\`\`\`python
from abc import ABC, abstractmethod

class IMultiFunctionDevice(ABC):
    """胖接口:把打印、扫描、传真全塞在一起。"""
    @abstractmethod
    def print(self, document: str) -> None: ...

    @abstractmethod
    def scan(self, document: str) -> None: ...

    @abstractmethod
    def fax(self, document: str) -> None: ...

    @abstractmethod
    def staple(self, document: str) -> None: ...
\`\`\`

现在你要实现一个简单打印机:

\`\`\`python
class SimplePrinter(IMultiFunctionDevice):
    """简单打印机:只会打印。"""
    def print(self, document: str) -> None:
        print(f"打印: {document}")

    def scan(self, document: str) -> None:
        raise NotImplementedError("简单打印机不能扫描")

    def fax(self, document: str) -> None:
        raise NotImplementedError("简单打印机不能传真")

    def staple(self, document: str) -> None:
        raise NotImplementedError("简单打印机不能装订")
\`\`\`

### 2.2 胖接口的具体危害

| 危害 | 表现 |
|------|------|
| 被迫空实现 | SimplePrinter 三个方法抛 NotImplementedError,违反 LSP |
| 接口污染 | 使用者看到一堆用不到的方法,认知负担重 |
| 修改蔓延 | fax 接口要改,SimplePrinter 也要被迫改 |
| 测试负担 | SimplePrinter 要为不会用的方法写测试 |
| 误用风险 | 使用者可能误调用 fax(),运行时才崩 |

\`\`\`
胖接口的恶性循环:
  接口胖 → 实现类被迫空实现 → 违反 LSP
        → 使用者要 isinstance 判断 → 违反 OCP
        → 修改一个方法牵动所有实现类 → 难以维护
\`\`\`

## 三、重构手法:接口拆分

ISP 的解决方案很直接:**把胖接口拆成多个细粒度的小接口**,让每个实现类只实现自己需要的能力。

### 3.1 拆分后的接口

\`\`\`python
from abc import ABC, abstractmethod

class IPrinter(ABC):
    """打印能力。"""
    @abstractmethod
    def print(self, document: str) -> None: ...

class IScanner(ABC):
    """扫描能力。"""
    @abstractmethod
    def scan(self, document: str) -> None: ...

class IFax(ABC):
    """传真能力。"""
    @abstractmethod
    def fax(self, document: str) -> None: ...

class IStapler(ABC):
    """装订能力。"""
    @abstractmethod
    def staple(self, document: str) -> None: ...
\`\`\`

### 3.2 实现类按需组合

\`\`\`python
class SimplePrinter(IPrinter):
    """简单打印机:只实现 IPrinter。"""
    def print(self, document: str) -> None:
        print(f"打印: {document}")

class ScannerOnly(IScanner):
    """纯扫描仪:只实现 IScanner。"""
    def scan(self, document: str) -> None:
        print(f"扫描: {document}")

class MultiFunctionMachine(IPrinter, IScanner, IFax, IStapler):
    """多功能一体机:实现所有接口。"""
    def print(self, document: str) -> None:
        print(f"打印: {document}")

    def scan(self, document: str) -> None:
        print(f"扫描: {document}")

    def fax(self, document: str) -> None:
        print(f"传真: {document}")

    def staple(self, document: str) -> None:
        print(f"装订: {document}")
\`\`\`

### 3.3 使用者按需依赖

\`\`\`python
def print_document(printer: IPrinter, doc: str) -> None:
    """只依赖 IPrinter,不关心其他能力。"""
    printer.print(doc)

def scan_document(scanner: IScanner, doc: str) -> None:
    """只依赖 IScanner。"""
    scanner.scan(doc)

# 简单打印机
sp = SimplePrinter()
print_document(sp, "报告")  # OK

# 多功能机
mf = MultiFunctionMachine()
print_document(mf, "合同")  # OK,它是 IPrinter
scan_document(mf, "发票")   # OK,它也是 IScanner
\`\`\`

### 3.4 重构前后对比

\`\`\`
重构前:                          重构后:
  IMultiFunctionDevice             IPrinter   IScanner   IFax   IStapler
    ├── print()                       │          │         │       │
    ├── scan()                        └──────┬───┴─────────┴───────┘
    ├── fax()                                │
    └── staple()                             ├── SimplePrinter(IPrinter)
                                            ├── ScannerOnly(IScanner)
  SimplePrinter(被迫空实现3个)              └── MultiFunctionMachine(全部)
\`\`\`

## 四、Python 特色:用 abc + 多继承模拟接口

Python 没有像 Java 那样的 \`interface\` 关键字,但可以用 \`abc.ABC\` + 多继承优雅地模拟。

### 4.1 ABC 的基本用法

\`\`\`python
from abc import ABC, abstractmethod

class IPrinter(ABC):
    @abstractmethod
    def print(self, doc: str) -> None: ...

class IScanner(ABC):
    @abstractmethod
    def scan(self, doc: str) -> None: ...

# 多继承组合能力
class MultiFunction(IPrinter, IScanner):
    """多功能机:同时是打印机和扫描仪。"""
    def print(self, doc: str) -> None:
        print(f"打印 {doc}")

    def scan(self, doc: str) -> None:
        print(f"扫描 {doc}")
\`\`\`

注意:MultiFunction 不需要再写 \`@abstractmethod\`,只要把所有抽象方法都实现,它就是具体类,可以实例化。

### 4.2 ABC 的优势

| 特性 | 说明 |
|------|------|
| 强制实现 | 子类不实现抽象方法无法实例化 |
| 类型提示 | mypy 能检查接口契约 |
| 文档作用 | 抽象方法签名即接口文档 |
| 多继承组合 | 灵活组合多种能力 |

### 4.3 ABC 的局限

ABC 是** nominal subtyping**(名义子类型)——必须显式继承才算实现。这有时不够灵活:

\`\`\`python
class ThirdPartyPrinter:
    """第三方库的打印机,没有继承 IPrinter。"""
    def print(self, doc: str) -> None:
        print(f"第三方打印 {doc}")

def use_printer(p: IPrinter) -> None:  # 类型提示要求 IPrinter
    p.print("doc")

# use_printer(ThirdPartyPrinter())  # mypy 报错:不是 IPrinter 子类
\`\`\`

即使结构完全匹配,名义子类型也不认。这就是 Protocol 要解决的问题。

## 五、Python 协议(Protocol,PEP 544)

PEP 544 引入了 \`typing.Protocol\`,实现**结构性子类型**(structural subtyping):只要结构匹配就算实现,不需要显式继承。

### 5.1 Protocol 基本用法

\`\`\`python
from typing import Protocol

class IPrinter(Protocol):
    def print(self, doc: str) -> None: ...

class IScanner(Protocol):
    def scan(self, doc: str) -> None: ...

class ThirdPartyPrinter:
    """没有继承任何 Protocol,但结构匹配。"""
    def print(self, doc: str) -> None:
        print(f"第三方打印 {doc}")

def use_printer(p: IPrinter) -> None:
    p.print("doc")

use_printer(ThirdPartyPrinter())  # ✅ mypy 通过:结构匹配
\`\`\`

Protocol 的革命性在于:**"鸭子类型"获得了静态类型检查的支持。**

### 5.2 Protocol vs ABC 对比

| 维度 | ABC(名义子类型) | Protocol(结构子类型) |
|------|------------------|----------------------|
| 继承要求 | 必须显式继承 | 不需要继承 |
| 类型检查 | mypy 检查继承关系 | mypy 检查结构匹配 |
| 运行时检查 | 有(isinstance) | 需 \`@runtime_checkable\` |
| 适合场景 | 库内部接口 | 跨库、第三方集成 |
| 灵活性 | 较低 | 较高 |
| 强制力 | 较强(必须实现抽象方法) | 较弱(只看结构) |

### 5.3 runtime_checkable

Protocol 默认不支持 \`isinstance\` 检查,加 \`@runtime_checkable\` 后可以(但只检查方法存在,不检查签名):

\`\`\`python
from typing import Protocol, runtime_checkable

@runtime_checkable
class IPrinter(Protocol):
    def print(self, doc: str) -> None: ...

class MyPrinter:
    def print(self, doc: str) -> None:
        print(doc)

print(isinstance(MyPrinter(), IPrinter))  # True
\`\`\`

### 5.4 Protocol 实战:细粒度接口

用 Protocol 实现 ISP,优雅且灵活:

\`\`\`python
from typing import Protocol, runtime_checkable

@runtime_checkable
class Printable(Protocol):
    def print(self, doc: str) -> None: ...

@runtime_checkable
class Scannable(Protocol):
    def scan(self, doc: str) -> None: ...

@runtime_checkable
class Faxable(Protocol):
    def fax(self, doc: str) -> None: ...

class SimplePrinter:
    """只实现 print,自动是 Printable。"""
    def print(self, doc: str) -> None:
        print(f"打印 {doc}")

class OfficeMachine:
    """多功能,自动是 Printable + Scannable + Faxable。"""
    def print(self, doc: str) -> None:
        print(f"打印 {doc}")
    def scan(self, doc: str) -> None:
        print(f"扫描 {doc}")
    def fax(self, doc: str) -> None:
        print(f"传真 {doc}")

def archive(printer: Printable, scanner: Scannable) -> None:
    printer.print("归档")
    scanner.scan("归档")

archive(SimplePrinter(), OfficeMachine())  # ✅ 结构匹配
\`\`\`

## 六、接口拆分的度:不要过度拆

ISP 不是"方法越少越好",过度拆分会带来新的问题。

### 6.1 过度拆分的反例

\`\`\`python
# 过度拆分:每个方法一个接口
class IReadName(Protocol):
    def get_name(self) -> str: ...

class IReadAge(Protocol):
    def get_age(self) -> int: ...

class IReadEmail(Protocol):
    def get_email(self) -> str: ...

class User(IReadName, IReadAge, IReadEmail):
    ...
\`\`\`

这样拆导致接口数量爆炸,使用者要依赖一堆接口,反而更乱。

### 6.2 拆分原则

\`\`\`
拆分依据:看"使用者群体"
  - 同一个使用者群体总是一起用一组方法 → 放一个接口
  - 不同使用者群体分别用不同方法 → 拆成多个接口
\`\`\`

判断口诀:

\`\`\`
问:这个方法的所有调用者,是否也会用到接口里的其他方法?
  是 → 留在一起
  否 → 拆出去
\`\`\`

### 6.3 拆分粒度参考表

| 场景 | 拆分粒度 | 例子 |
|------|---------|------|
| 能力正交(可独立存在) | 拆 | 打印 / 扫描 / 传真 |
| 能力总是协同使用 | 合 | 读 + 写(常一起用 → IReaderWriter) |
| 不同角色用不同子集 | 按角色拆 | 管理员接口 / 普通用户接口 |
| 只有一个使用者 | 不拆 | 内部小工具 |

## 七、实战案例:权限系统的接口拆分

我们用一个权限系统案例完整演示 ISP 的应用。

### 7.1 反例:胖权限接口

\`\`\`python
from abc import ABC, abstractmethod

class IUserService(ABC):
    """胖接口:所有用户操作混在一起。"""
    @abstractmethod
    def login(self, username: str, password: str) -> str: ...

    @abstractmethod
    def logout(self, token: str) -> None: ...

    @abstractmethod
    def create_user(self, username: str, password: str) -> int: ...

    @abstractmethod
    def delete_user(self, user_id: int) -> None: ...

    @abstractmethod
    def reset_password(self, user_id: int) -> str: ...

    @abstractmethod
    def list_all_users(self) -> list[dict]: ...

    @abstractmethod
    def audit_log(self) -> list[str]: ...
\`\`\`

问题:
- 普通用户登录模块只需要 \`login/logout\`,却被迫依赖所有方法
- 管理员模块需要 \`create/delete\`,不需要 \`login\`
- 审计模块只需要 \`audit_log\`,被迫依赖其他

### 7.2 重构:按角色拆分

\`\`\`python
from abc import ABC, abstractmethod
from typing import Protocol

# ===== 认证能力(普通用户模块用)=====
class IAuthenticator(Protocol):
    def login(self, username: str, password: str) -> str: ...
    def logout(self, token: str) -> None: ...

# ===== 用户管理能力(管理员模块用)=====
class IUserAdmin(Protocol):
    def create_user(self, username: str, password: str) -> int: ...
    def delete_user(self, user_id: int) -> None: ...
    def reset_password(self, user_id: int) -> str: ...

# ===== 用户查询能力(展示模块用)=====
class IUserQuery(Protocol):
    def list_all_users(self) -> list[dict]: ...

# ===== 审计能力(审计模块用)=====
class IAuditor(Protocol):
    def audit_log(self) -> list[str]: ...
\`\`\`

### 7.3 实现类按需组合

\`\`\`python
class UserService(IAuthenticator, IUserAdmin, IUserQuery, IAuditor):
    """完整用户服务:实现所有接口。"""
    def __init__(self):
        self._users: dict[int, dict] = {}
        self._next_id = 1
        self._logs: list[str] = []
        self._tokens: dict[str, int] = {}

    def login(self, username: str, password: str) -> str:
        for uid, u in self._users.items():
            if u["name"] == username and u["pwd"] == password:
                token = f"token-{uid}"
                self._tokens[token] = uid
                self._logs.append(f"{username} 登录")
                return token
        raise ValueError("用户名或密码错误")

    def logout(self, token: str) -> None:
        uid = self._tokens.pop(token, None)
        self._logs.append(f"用户 {uid} 登出")

    def create_user(self, username: str, password: str) -> int:
        uid = self._next_id
        self._next_id += 1
        self._users[uid] = {"name": username, "pwd": password}
        self._logs.append(f"创建用户 {username}")
        return uid

    def delete_user(self, user_id: int) -> None:
        self._users.pop(user_id, None)
        self._logs.append(f"删除用户 {user_id}")

    def reset_password(self, user_id: int) -> str:
        new_pwd = "default123"
        if user_id in self._users:
            self._users[user_id]["pwd"] = new_pwd
        return new_pwd

    def list_all_users(self) -> list[dict]:
        return list(self._users.values())

    def audit_log(self) -> list[str]:
        return list(self._logs)


class ReadOnlyUserView(IUserQuery):
    """只读视图:只实现查询,不能改。"""
    def __init__(self, service: UserService):
        self._service = service

    def list_all_users(self) -> list[dict]:
        return self._service.list_all_users()
\`\`\`

### 7.4 使用者按需依赖

\`\`\`python
def login_flow(auth: IAuthenticator) -> None:
    """登录流程:只依赖 IAuthenticator。"""
    token = auth.login("admin", "123456")
    print(f"登录成功,token={token}")
    auth.logout(token)

def admin_flow(admin: IUserAdmin) -> None:
    """管理流程:只依赖 IUserAdmin。"""
    uid = admin.create_user("张三", "pwd")
    admin.reset_password(uid)
    admin.delete_user(uid)

def audit_flow(auditor: IAuditor) -> None:
    """审计流程:只依赖 IAuditor。"""
    for log in auditor.audit_log():
        print(log)

svc = UserService()
login_flow(svc)    # ✅
admin_flow(svc)    # ✅
audit_flow(svc)    # ✅
\`\`\`

每个使用者只看到自己需要的方法,互不干扰。这就是 ISP 的价值。

## 八、ISP 在框架中的应用

### 8.1 collections.abc 的接口拆分

Python 标准库 \`collections.abc\` 是 ISP 的典范:它把容器能力拆成多个细粒度抽象。

\`\`\`python
from collections.abc import Iterable, Iterator, Container, Sized, Sequence

# Iterable:可迭代(只有 __iter__)
# Iterator:迭代器(__iter__ + __next__)
# Container:可包含判断(__contains__)
# Sized:可知大小(__len__)
# Sequence:序列(__getitem__ + __len__ + __contains__ + __iter__ + ...)
\`\`\`

\`\`\`
能力拆分图:
  Container(__contains__)
  Sized(__len__)
  Iterable(__iter__)
       │
       └── Iterator(__iter__, __next__)
  Reversible(__reversed__)
       │
       └── Sequence(组合多个能力)
\`\`\`

你实现一个只读列表,只需实现 \`Sequence\` 的必要方法;实现一个迭代器,只需 \`Iterator\`。各取所需,不会被迫实现无关方法。

### 8.2 Django 的接口拆分

Django 的中间件系统也体现了 ISP:不同中间件协议只要求实现需要的方法。

\`\`\`python
# 简化示意:Django 中间件
class SimpleMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 处理请求
        response = self.get_response(request)
        # 处理响应
        return response

# 不需要实现 process_view、process_template_response 等可选方法
\`\`\`

可选方法用 Mixin 或默认实现处理,中间件类按需覆盖。

## 九、ISP 与组合优于继承

ISP 鼓励"小接口组合",这与"组合优于继承"原则一脉相承。

### 9.1 用组合代替胖接口

\`\`\`python
# 反例:胖接口 + 继承
class Worker(ABC):
    @abstractmethod
    def work(self) -> None: ...
    @abstractmethod
    def eat(self) -> None: ...
    @abstractmethod
    def sleep(self) -> None: ...

class Robot(Worker):
    def work(self) -> None:
        print("工作")
    def eat(self) -> None:
        raise NotImplementedError  # 机器人不吃饭
    def sleep(self) -> None:
        raise NotImplementedError  # 机器人不睡觉

# 正解:拆分接口 + 组合
class IWorkable(Protocol):
    def work(self) -> None: ...

class IEatable(Protocol):
    def eat(self) -> None: ...

class ISleepable(Protocol):
    def sleep(self) -> None: ...

class Robot:  # 只实现 IWorkable
    def work(self) -> None:
        print("机器人工作")

class Human:  # 实现全部
    def work(self) -> None:
        print("人工作")
    def eat(self) -> None:
        print("人吃饭")
    def sleep(self) -> None:
        print("人睡觉")
\`\`\`

\`\`\`
设计哲学:
  不要让"机器人"被迫假装会吃饭
  让每个对象只承诺它真正拥有的能力
\`\`\`

## 十、ISP 的常见反模式

### 10.1 上帝接口(God Interface)

一个接口包含几十个方法,无所不包。

\`\`\`python
class IService(ABC):
    @abstractmethod
    def login(self): ...
    @abstractmethod
    def logout(self): ...
    @abstractmethod
    def send_email(self): ...
    @abstractmethod
    def generate_report(self): ...
    @abstractmethod
    def compress_file(self): ...
    @abstractmethod
    def parse_json(self): ...
    # ... 还有 30 个方法
\`\`\`

解决:按职责拆分。

### 10.2 胖基类强迫空实现

\`\`\`python
class Base(ABC):
    @abstractmethod
    def feature_a(self): ...
    @abstractmethod
    def feature_b(self): ...
    @abstractmethod
    def feature_c(self): ...

class OnlyA(Base):
    def feature_a(self): print("A")
    def feature_b(self): pass      # 空实现
    def feature_c(self): pass      # 空实现
\`\`\`

解决:拆成 IA、IB、IC,OnlyA 只实现 IA。

### 10.3 接口泄漏实现细节

接口里暴露了不应该让使用者知道的方法。

\`\`\`python
class IUserService(Protocol):
    def get_user(self, uid: int) -> dict: ...
    def _connect_db(self) -> None: ...      # 内部方法,不该暴露
    def _cache_user(self, user: dict) -> None: ...  # 内部方法
\`\`\`

解决:接口只包含公共契约,内部方法用私有命名或放到实现类。

### 10.4 接口随实现膨胀

每加一个功能就在接口加一个方法,不管其他实现类需不需要。

\`\`\`python
# 原本
class IRepository(Protocol):
    def find(self, id: int) -> dict: ...

# 后来加了缓存相关
class IRepository(Protocol):
    def find(self, id: int) -> dict: ...
    def cache(self, key: str, val: dict) -> None: ...  # 不是所有仓储都需要
    def invalidate(self, key: str) -> None: ...
\`\`\`

解决:缓存能力抽成 \`ICacheable\`,需要缓存的仓储实现它。

## 十一、易错点小结

| 易错点 | 描述 | 后果 | 正确做法 |
|--------|------|------|---------|
| 上帝接口 | 一个接口含几十个方法 | 实现类被迫空实现,违反 LSP | 按职责拆分多个小接口 |
| 过度拆分 | 每个方法一个接口 | 接口数量爆炸,使用者负担重 | 按"使用者群体"拆分 |
| 胖接口强迫空实现 | 子类用 pass 或抛异常 | LSP 违规 | 拆接口,按需实现 |
| ABC 强制继承 | 第三方类无法适配 | 集成困难 | 用 Protocol 结构子类型 |
| 暴露内部方法 | 接口含 _connect_db 等 | 实现细节泄漏 | 接口只含公共契约 |
| 接口随实现膨胀 | 加功能就往接口塞方法 | 牵动所有实现类 | 新能力抽独立接口 |
| 忽略使用者群体 | 按方法数量而非使用者拆 | 拆分不合理 | 看使用者是否一起用 |
| Protocol 不加 runtime_checkable | 无法 isinstance 检查 | 运行时无法验证 | 需要时加装饰器 |
| 拆分后未组合使用 | 接口拆了但实现类继承单一 | 失去组合优势 | 实现类多继承多个接口 |
| 忽略 collections.abc | 重复造容器抽象 | 与标准库不兼容 | 优先用标准库抽象 |

## 十二、本章总结

ISP 是 SOLID 里最直观的原则之一,核心就一句话:**接口要小而专**。

1. **胖接口是万恶之源**——它强迫实现类空实现,引发 LSP 违规,污染使用者认知
2. **拆分依据是使用者群体**——同一群体一起用的方法留一起,不同群体分开
3. **Python 用 ABC + 多继承模拟接口**,适合库内部;**用 Protocol 做结构子类型**,适合跨库集成
4. **不要过度拆**——拆到每个使用者群体一个接口即可,过犹不及
5. **ISP 与组合优于继承一脉相承**——小接口组合 > 大接口继承

下一章我们学习 DIP(依赖倒置原则),它解决"高层模块依赖低层模块"的问题,与 ISP、LSP 共同支撑 OCP 的实现。
`,
  },

  // =========================================================
  // 第三章:依赖倒置原则(DIP)
  // =========================================================
  {
    id: "pyarch-solid-dip",
    icon: "🔀",
    title: "依赖倒置原则(DIP)",
    group: "SOLID 原则",
    content: `# 依赖倒置原则(DIP)

> "高层模块不应依赖低层模块,二者都应依赖抽象。
>  抽象不应依赖细节,细节应依赖抽象。"
> —— Robert C. Martin

## 一、DIP 是什么

依赖倒置原则(Dependency Inversion Principle,简称 DIP)是 SOLID 五原则中的最后一个,也是最"架构味"的一个。它的核心两句话:

1. **高层模块不应依赖低层模块,二者都应依赖抽象**
2. **抽象不应依赖细节,细节应依赖抽象**

### 1.1 直觉理解

先理解"高层"和"低层":

\`\`\`
高层模块:包含业务策略/核心逻辑的模块(如 OrderService)
低层模块:提供基础能力/技术细节的模块(如 MySQLRepository)
\`\`\`

传统设计里,高层直接依赖低层:

\`\`\`
传统:           倒置后:
  OrderService      OrderService
       │                 │
       ↓ 依赖             ↓ 依赖抽象
  MySQLRepository    IRepository
                          ↑ 实现
                     MySQLRepository
\`\`\`

"倒置"体现在:原本是高层依赖低层,现在低层也依赖抽象(实现抽象接口)。依赖方向从"自上而下"变成了"双向汇聚到抽象"。

### 1.2 为什么叫"倒置"

传统面向过程设计,策略层调用工具层,依赖方向跟调用方向一致(都向下)。DIP 让工具层也反过来依赖抽象(实现接口),依赖方向跟调用方向相反——这就是"倒置"。

\`\`\`
调用方向(永远向下):    依赖方向(DIP 后,汇聚到抽象):
  策略 ──调用──→ 工具       策略 ──依赖──→ 抽象 ←──依赖── 工具
                                          ←──实现──
\`\`\`

### 1.3 DIP 的本质

DIP 的本质是**面向接口编程,而非面向实现编程**:

\`\`\`
✗ 面向实现:order_service = OrderService(MySQLRepository())
✓ 面向抽象:order_service = OrderService(repo)  # repo: IRepository
\`\`\`

## 二、为什么需要 DIP

### 2.1 反例:OrderService 直接依赖 MySQLRepository

\`\`\`python
import pymysql

class MySQLRepository:
    """低层模块:MySQL 数据访问。"""
    def __init__(self):
        self.conn = pymysql.connect(host="localhost", user="root")

    def save(self, order: dict) -> None:
        cursor = self.conn.cursor()
        cursor.execute(
            "INSERT INTO orders (id, amount) VALUES (%s, %s)",
            (order["id"], order["amount"])
        )
        self.conn.commit()

    def find(self, order_id: int) -> dict | None:
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM orders WHERE id=%s", (order_id,))
        row = cursor.fetchone()
        return {"id": row[0], "amount": row[1]} if row else None


class OrderService:
    """高层模块:订单业务逻辑。"""
    def __init__(self):
        self.repo = MySQLRepository()  # 直接 new 一个具体实现

    def place_order(self, order_id: int, amount: float) -> None:
        order = {"id": order_id, "amount": amount}
        self.repo.save(order)
\`\`\`

### 2.2 反例的问题

| 问题 | 表现 |
|------|------|
| 换数据库要改 OrderService | 想换 PostgreSQL,要改 OrderService 的 __init__ |
| 无法单元测试 | 测试 OrderService 必须连真实 MySQL |
| 低层变更影响高层 | MySQLRepository 改签名,OrderService 跟着改 |
| 高层被低层绑架 | 业务逻辑被技术细节锁死 |

\`\`\`
痛苦场景:
  产品经理:"把订单存储从 MySQL 换成 MongoDB"
  开发:"好,我去改 OrderService、UserService、PaymentService..."
  产品经理:"不是只换存储吗?为什么要改业务代码?"
  开发:"因为它们都直接 new 了 MySQLRepository。"
\`\`\`

## 三、重构手法:抽象 IRepository 接口

### 3.1 引入抽象接口

\`\`\`python
from abc import ABC, abstractmethod

class IRepository(ABC):
    """仓储抽象:高层依赖它,低层实现它。"""
    @abstractmethod
    def save(self, order: dict) -> None: ...

    @abstractmethod
    def find(self, order_id: int) -> dict | None: ...


class MySQLRepository(IRepository):
    """低层:MySQL 实现。"""
    def __init__(self):
        self.conn = ...  # 连接 MySQL

    def save(self, order: dict) -> None:
        # MySQL 特定的 INSERT 逻辑
        ...

    def find(self, order_id: int) -> dict | None:
        # MySQL 特定的 SELECT 逻辑
        ...


class MongoRepository(IRepository):
    """低层:MongoDB 实现。"""
    def __init__(self):
        self.db = ...  # 连接 Mongo

    def save(self, order: dict) -> None:
        self.db.orders.insert_one(order)

    def find(self, order_id: int) -> dict | None:
        return self.db.orders.find_one({"id": order_id})


class InMemoryRepository(IRepository):
    """低层:内存实现,用于测试。"""
    def __init__(self):
        self._store: dict[int, dict] = {}

    def save(self, order: dict) -> None:
        self._store[order["id"]] = order

    def find(self, order_id: int) -> dict | None:
        return self._store.get(order_id)
\`\`\`

### 3.2 高层依赖抽象

\`\`\`python
class OrderService:
    """高层:依赖 IRepository 抽象,不依赖具体实现。"""
    def __init__(self, repo: IRepository):  # 注入抽象
        self.repo = repo

    def place_order(self, order_id: int, amount: float) -> None:
        order = {"id": order_id, "amount": amount}
        self.repo.save(order)

    def get_order(self, order_id: int) -> dict | None:
        return self.repo.find(order_id)
\`\`\`

### 3.3 使用:依赖注入

\`\`\`python
# 生产环境:用 MySQL
prod_repo = MySQLRepository()
prod_service = OrderService(prod_repo)

# 测试环境:用内存
test_repo = InMemoryRepository()
test_service = OrderService(test_repo)

# 换 Mongo:不改 OrderService 一行代码
mongo_repo = MongoRepository()
mongo_service = OrderService(mongo_repo)
\`\`\`

### 3.4 重构前后对比

\`\`\`
重构前:                          重构后:
  OrderService                    OrderService
       │ new()                         │ 依赖
       ↓                               ↓
  MySQLRepository                IRepository(抽象)
                                       ↑ 实现
                                 ┌─────┼─────┐
                          MySQL  Mongo  InMemory
\`\`\`

换数据库?换个实现类注入即可,OrderService 纹丝不动。这就是 DIP 的威力。

## 四、依赖注入(DI)

DIP 是原则,依赖注入(Dependency Injection,DI)是实现 DIP 的手法。

### 4.1 三种注入方式

#### 4.1.1 构造函数注入(推荐)

\`\`\`python
class OrderService:
    def __init__(self, repo: IRepository, notifier: INotifier):
        self.repo = repo
        self.notifier = notifier
\`\`\`

优点:依赖明确,对象创建后即可用,不可变。缺点:依赖多时构造函数臃肿。

#### 4.1.2 Setter 注入

\`\`\`python
class OrderService:
    def __init__(self):
        self.repo: IRepository | None = None

    def set_repo(self, repo: IRepository) -> None:
        self.repo = repo
\`\`\`

优点:灵活,可中途更换。缺点:对象可能处于"未完全初始化"状态,易出错。

#### 4.1.3 接口注入(少用)

\`\`\`python
class IServiceInjector(ABC):
    @abstractmethod
    def inject_services(self, repo: IRepository, notifier: INotifier) -> None: ...

class OrderService(IServiceInjector):
    def inject_services(self, repo: IRepository, notifier: INotifier) -> None:
        self.repo = repo
        self.notifier = notifier
\`\`\`

通过接口强制注入。Python 里少用,Java 框架中较常见。

### 4.2 三种方式对比

| 方式 | 优点 | 缺点 | 适用 |
|------|------|------|------|
| 构造函数注入 | 依赖明确、不可变、易测试 | 参数多时臃肿 | 大多数场景(推荐) |
| Setter 注入 | 灵活、可选依赖 | 状态不完整风险 | 可选依赖、循环依赖 |
| 接口注入 | 强制实现 | 侵入性强、啰嗦 | 框架场景 |

### 4.3 Python dataclass + 默认参数

Python 的 dataclass 让构造函数注入更优雅:

\`\`\`python
from dataclasses import dataclass

@dataclass
class OrderService:
    repo: IRepository
    notifier: INotifier
    tax_rate: float = 0.1  # 默认值,可选依赖

    def place_order(self, order_id: int, amount: float) -> None:
        tax = amount * self.tax_rate
        order = {"id": order_id, "amount": amount, "tax": tax}
        self.repo.save(order)
        self.notifier.notify(f"订单 {order_id} 已创建")

# 使用
service = OrderService(
    repo=InMemoryRepository(),
    notifier=EmailNotifier(),
    tax_rate=0.13
)
\`\`\`

dataclass 自动生成 \`__init__\`,关键字参数让注入更清晰。

## 五、DIP 与控制反转(IoC)

### 5.1 IoC 是什么

控制反转(Inversion of Control,IoC)是更广义的概念:**程序的控制流由框架/容器决定,而非开发者手动控制**。

\`\`\`
传统:开发者主动调用框架代码
IoC :框架调用开发者代码(回调、Hook、依赖注入)
\`\`\`

### 5.2 DI 是 IoC 的一种

DI 是 IoC 在"依赖管理"维度的具体实现:

\`\`\`
IoC 范畴(广义):
  ├── 依赖注入(DI):容器负责创建和注入依赖
  ├── 事件驱动:框架在事件发生时回调你的代码
  ├── 模板方法:父类定义流程,子类填空
  └── 框架生命周期:框架控制对象创建销毁
\`\`\`

### 5.3 DIP、IoC、DI 的关系

\`\`\`
DIP(原则):高层依赖抽象,不依赖细节
   ↓ 指导
IoC(模式):控制权从开发者转移到容器
   ↓ 实现
DI(手法):容器创建依赖并注入到对象
\`\`\`

| 概念 | 层次 | 说明 |
|------|------|------|
| DIP | 设计原则 | "应该"怎么做(抽象依赖) |
| IoC | 设计模式 | "怎么"实现控制反转 |
| DI | 具体技术 | 注入的具体手法(构造/setter) |

## 六、Python DI 框架简介

Python 有多个 DI 框架,我们介绍两个有代表性的。

### 6.1 dependency-injector

功能强大的 DI 容器框架:

\`\`\`python
from dependency_injector import containers, providers

class OrderService:
    def __init__(self, repo: IRepository, notifier: INotifier):
        self.repo = repo
        self.notifier = notifier

class Container(containers.DeclarativeContainer):
    # 定义依赖 providers
    config = providers.Configuration()

    repo = providers.Singleton(InMemoryRepository)

    notifier = providers.Factory(
        EmailNotifier,
        smtp_host=config.smtp.host,
    )

    order_service = providers.Factory(
        OrderService,
        repo=repo,
        notifier=notifier,
    )

# 使用
container = Container()
container.config.from_dict({"smtp": {"host": "smtp.example.com"}})

service = container.order_service()
\`\`\`

特点:声明式、支持生命周期管理(Singleton/Factory)、配置驱动。

### 6.2 FastAPI 的 Depends

FastAPI 内置轻量 DI,通过 \`Depends\` 实现函数级依赖注入:

\`\`\`python
from fastapi import FastAPI, Depends

app = FastAPI()

class OrderRepository:
    def find(self, order_id: int) -> dict:
        return {"id": order_id, "amount": 100}

class OrderService:
    def __init__(self, repo: OrderRepository):
        self.repo = repo

    def get_order(self, order_id: int) -> dict:
        return self.repo.find(order_id)

# 依赖工厂函数
def get_repo() -> OrderRepository:
    return OrderRepository()

def get_service(repo: OrderRepository = Depends(get_repo)) -> OrderService:
    return OrderService(repo)

@app.get("/orders/{order_id}")
def read_order(order_id: int, service: OrderService = Depends(get_service)):
    return service.get_order(order_id)
\`\`\`

FastAPI 自动解析依赖链,处理生命周期,非常适合 Web 场景。

### 6.3 手写简单 DI 容器

理解 DI 容器原理,手写一个简易版:

\`\`\`python
from typing import Callable, Any, Type, TypeVar

T = TypeVar("T")

class DIContainer:
    """简易 DI 容器:注册接口 → 工厂函数,解析时调用工厂。"""
    def __init__(self):
        self._factories: dict[type, Callable[[], Any]] = {}
        self._singletons: dict[type, Any] = {}

    def register_factory(self, interface: type, factory: Callable[[], Any]) -> None:
        """注册工厂:每次 resolve 都创建新实例。"""
        self._factories[interface] = factory

    def register_singleton(self, interface: type, factory: Callable[[], Any]) -> None:
        """注册单例:只创建一次。"""
        self._factories[interface] = factory
        self._singletons[interface] = None  # 占位

    def resolve(self, interface: Type[T]) -> T:
        if interface not in self._factories:
            raise KeyError(f"未注册: {interface}")

        # 单例
        if interface in self._singletons:
            if self._singletons[interface] is None:
                self._singletons[interface] = self._factories[interface]()
            return self._singletons[interface]

        # 工厂
        return self._factories[interface]()


# 使用
container = DIContainer()
container.register_singleton(IRepository, lambda: InMemoryRepository())
container.register_factory(INotifier, lambda: EmailNotifier())

repo = container.resolve(IRepository)
notifier = container.resolve(INotifier)
service = OrderService(repo, notifier)
\`\`\`

## 七、完整实战:订单系统 DIP 重构

我们用一个完整案例演示 DIP 的应用,涵盖抽象、注入、容器、测试。

### 7.1 抽象层

\`\`\`python
from abc import ABC, abstractmethod
from dataclasses import dataclass

# ===== 抽象接口 =====
class IOrderRepository(ABC):
    @abstractmethod
    def save(self, order: "Order") -> None: ...
    @abstractmethod
    def find(self, order_id: int) -> "Order | None": ...

class INotifier(ABC):
    @abstractmethod
    def notify(self, message: str) -> None: ...

class ILogger(ABC):
    @abstractmethod
    def info(self, msg: str) -> None: ...
    @abstractmethod
    def error(self, msg: str) -> None: ...

@dataclass
class Order:
    id: int
    amount: float
    status: str = "created"
\`\`\`

### 7.2 低层实现

\`\`\`python
# ===== 低层实现 =====
class InMemoryOrderRepository(IOrderRepository):
    def __init__(self):
        self._store: dict[int, Order] = {}

    def save(self, order: Order) -> None:
        self._store[order.id] = order

    def find(self, order_id: int) -> Order | None:
        return self._store.get(order_id)


class EmailNotifier(INotifier):
    def __init__(self, smtp_host: str = "smtp.local"):
        self.smtp_host = smtp_host

    def notify(self, message: str) -> None:
        print(f"[Email via {self.smtp_host}] {message}")


class ConsoleLogger(ILogger):
    def info(self, msg: str) -> None:
        print(f"[INFO] {msg}")

    def error(self, msg: str) -> None:
        print(f"[ERROR] {msg}")
\`\`\`

### 7.3 高层业务

\`\`\`python
# ===== 高层业务(只依赖抽象)=====
class OrderService:
    def __init__(
        self,
        repo: IOrderRepository,
        notifier: INotifier,
        logger: ILogger,
    ):
        self.repo = repo
        self.notifier = notifier
        self.logger = logger

    def place_order(self, order_id: int, amount: float) -> Order:
        try:
            order = Order(id=order_id, amount=amount)
            self.repo.save(order)
            self.notifier.notify(f"订单 {order_id} 已创建,金额 {amount}")
            self.logger.info(f"订单创建成功: {order_id}")
            return order
        except Exception as e:
            self.logger.error(f"订单创建失败: {order_id}, 错误: {e}")
            raise

    def query_order(self, order_id: int) -> Order | None:
        order = self.repo.find(order_id)
        if order is None:
            self.logger.info(f"订单不存在: {order_id}")
        return order
\`\`\`

### 7.4 组装与运行

\`\`\`python
# ===== 组装(Composition Root)=====
def create_service() -> OrderService:
    """组装依赖:决定用哪些实现。只在入口处出现一次。"""
    repo = InMemoryOrderRepository()
    notifier = EmailNotifier(smtp_host="smtp.example.com")
    logger = ConsoleLogger()
    return OrderService(repo, notifier, logger)

# 运行
service = create_service()
service.place_order(1, 99.9)
order = service.query_order(1)
print(f"查询到订单: {order}")
\`\`\`

### 7.5 单元测试

\`\`\`python
import unittest
from unittest.mock import MagicMock

class OrderServiceTest(unittest.TestCase):
    def setUp(self):
        # 用 Mock 替代真实依赖,完全隔离测试
        self.repo = MagicMock(spec=IOrderRepository)
        self.notifier = MagicMock(spec=INotifier)
        self.logger = MagicMock(spec=ILogger)
        self.service = OrderService(self.repo, self.notifier, self.logger)

    def test_place_order_saves_and_notifies(self):
        order = self.service.place_order(1, 100.0)
        self.assertEqual(order.id, 1)
        self.repo.save.assert_called_once()              # 验证调用了 save
        self.notifier.notify.assert_called_once()        # 验证通知了
        self.logger.info.assert_called_once()            # 验证记日志了

    def test_query_not_found_logs_info(self):
        self.repo.find.return_value = None
        result = self.service.query_order(999)
        self.assertIsNone(result)
        self.logger.info.assert_called_once_with("订单不存在: 999")
\`\`\`

DIP 让单元测试变得简单:高层只依赖抽象,测试时用 Mock 注入,无需真实数据库、邮件服务器。

### 7.6 整体架构图

\`\`\`
         ┌─────────────────────────────────┐
         │        OrderService(高层)        │
         │  place_order / query_order       │
         └──────┬──────────┬──────────┬─────┘
                │依赖       │依赖      │依赖
                ▼          ▼          ▼
         IOrderRepository  INotifier  ILogger  (抽象)
                ▲          ▲          ▲
                │实现       │实现      │实现
         ┌──────┴────┐ ┌───┴────┐ ┌───┴──────┐
         │InMemory   │ │Email   │ │Console   │
         │Repository │ │Notifier│ │Logger    │
         └───────────┘ └────────┘ └──────────┘
              低层实现

  组装点(Composition Root):
    service = OrderService(InMemoryRepo(), EmailNotifier(), ConsoleLogger())
\`\`\`

## 八、DIP 的常见反模式

### 8.1 高层 new 低层

\`\`\`python
class OrderService:
    def __init__(self):
        self.repo = MySQLRepository()  # ✗ 直接 new 具体实现
\`\`\`

解决:构造函数注入抽象。

### 8.2 抽象依赖细节

\`\`\`python
class IRepository(ABC):
    @abstractmethod
    def execute_sql(self, sql: str) -> list: ...  # ✗ 抽象暴露了 SQL 细节
\`\`\`

问题:Mongo 实现无法满足 SQL 接口。抽象不应依赖具体技术。

解决:抽象用业务语义方法。

\`\`\`python
class IRepository(ABC):
    @abstractmethod
    def find(self, id: int) -> dict | None: ...  # ✓ 业务语义
\`\`\`

### 8.3 抽象泄漏

抽象里混入了实现特定细节,迫使所有实现都背负。

\`\`\`python
class IRepository(ABC):
    @abstractmethod
    def find(self, id: int) -> dict | None: ...

    @abstractmethod
    def reconnect(self) -> None: ...  # ✗ 只有网络数据库才需要重连
\`\`\`

解决:把 \`reconnect\` 移到 \`INetworkRepository\` 或实现类内部。

### 8.4 过度抽象

每个小工具都抽象成接口,导致接口爆炸。

\`\`\`python
class IStringFormatter(ABC):
    @abstractmethod
    def format(self, s: str) -> str: ...

class UpperFormatter(IStringFormatter):
    def format(self, s: str) -> str:
        return s.upper()

# 用一个 str.upper() 就够了,不必抽象
\`\`\`

解决:简单稳定的工具直接用,只对"会变化的"或"需要替换的"抽象。

### 8.5 组装点散落

到处都在 new 依赖,没有统一的 Composition Root。

\`\`\`python
# controller.py
service = OrderService(MySQLRepository())  # 散落 1

# job.py
service = OrderService(MySQLRepository())  # 散落 2

# api.py
service = OrderService(PostgresRepository())  # 散落 3,配置不一致!
\`\`\`

解决:统一在程序入口组装,通过 DI 容器共享。

\`\`\`python
# main.py(唯一组装点)
container = DIContainer()
container.register_singleton(IRepository, lambda: MySQLRepository())

# 其他地方
service = container.resolve(OrderService)
\`\`\`

## 九、DIP 的适用边界

DIP 不是万能药,以下场景要谨慎。

### 9.1 不需要 DIP 的场景

| 场景 | 原因 |
|------|------|
| 一次性脚本 | 不会换实现,过度设计 |
| 稳定的标准库调用 | \`print\`、\`json.loads\` 不会变,无需抽象 |
| 简单工具函数 | 纯函数无状态,直接用 |
| 小团队原型 | 快速验证优先,架构后置 |

### 9.2 需要 DIP 的场景

| 场景 | 原因 |
|------|------|
| 团队项目 | 多人协作,需清晰边界 |
| 需要单元测试 | DIP 让 Mock 成为可能 |
| 多环境部署 | dev/test/prod 用不同实现 |
| 多数据源/多渠道 | 仓储、通知等需替换 |
| 长期维护项目 | 依赖解耦,降低变更成本 |

### 9.3 判断口诀

\`\`\`
问:这个依赖会不会变?需不需要替换/测试?
  会/需要 → 抽象(DIP)
  不会/不需要 → 直接用
\`\`\`

## 十、易错点小结

| 易错点 | 描述 | 后果 | 正确做法 |
|--------|------|------|---------|
| 高层 new 低层 | OrderService 直接 new MySQLRepository | 难替换、难测试 | 构造函数注入抽象 |
| 抽象依赖细节 | IRepository 暴露 execute_sql | Mongo 无法实现 | 抽象用业务语义 |
| 抽象泄漏 | 接口含 reconnect 等实现细节 | 所有实现被迫背负 | 细节移到实现类 |
| 过度抽象 | 每个小工具都抽象 | 接口爆炸、啰嗦 | 只抽象会变的 |
| 组装点散落 | 到处 new 依赖 | 配置不一致 | 统一 Composition Root |
| 忽略 IoC 容器 | 手动 new 依赖链 | 复杂项目维护难 | 用 DI 容器管理 |
| 注入过多依赖 | 构造函数 10 个参数 | 可能违反 SRP | 拆分服务 |
| 用 Setter 注入必选依赖 | 对象状态不完整 | 运行时 NPE | 必选依赖用构造函数 |
| 不写 Composition Root | 依赖关系混乱 | 难追踪 | 入口统一组装 |
| 测试不用 Mock | 测试连真实数据库 | 慢、不稳定 | Mock 抽象依赖 |

## 十一、本章总结

DIP 是 SOLID 里最具架构视野的原则,它把"高层依赖低层"的传统关系倒置为"双方都依赖抽象",为系统解耦和可测试性奠定基础。

1. **高层不依赖低层,二者依赖抽象**——业务逻辑与技术细节解耦
2. **抽象不依赖细节**——接口用业务语义,不暴露实现技术
3. **DI 是 DIP 的实现手法**——构造函数注入最推荐
4. **IoC 容器管理依赖生命周期**——大型项目必备,小项目手写组装即可
5. **DIP 让单元测试成为可能**——Mock 抽象依赖,隔离测试业务逻辑
6. **不要过度抽象**——只对"会变"或"需替换/测试"的依赖抽象

至此,SOLID 的五个原则我们都学完了。下一章是综合实战,我们用一个完整的电商订单系统,把 SRP、OCP、LSP、ISP、DIP 五原则融会贯通,并讨论它们的权衡与代价。
`,
  },

  // =========================================================
  // 第四章:SOLID 综合实战与权衡
  // =========================================================
  {
    id: "pyarch-solid-summary",
    icon: "🎓",
    title: "SOLID 综合实战与权衡",
    group: "SOLID 原则",
    content: `# SOLID 综合实战与权衡

> "SOLID 不是五个孤立的原则,而是一个有机整体:SRP 是基础,OCP 是目标,LSP/ISP/DIP 是手段。"

## 一、五原则的内在联系

学完前几章,你可能觉得 SOLID 是五个独立原则。实际上它们紧密关联,共同服务于一个目标:**让软件易于扩展、难被破坏**。

### 1.1 关系图

\`\`\`
                    ┌──────────────────────────┐
                    │   OCP(对扩展开放,对修改关闭)│
                    │       ←—— 终极目标 ——→      │
                    └────────────┬─────────────┘
                                 │ 支撑
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
        ┌─────────┐        ┌─────────┐        ┌─────────┐
        │   LSP   │        │   ISP   │        │   DIP   │
        │ 子类可换 │        │ 接口小专 │        │ 依赖抽象 │
        └────┬────┘        └────┬────┘        └────┬────┘
             │                  │                  │
             └──────────────────┼──────────────────┘
                                │ 基础
                                ▼
                          ┌─────────┐
                          │   SRP   │
                          │ 职责单一 │
                          │←— 地基 —→│
                          └─────────┘
\`\`\`

### 1.2 各原则的角色定位

| 原则 | 角色 | 一句话 |
|------|------|--------|
| SRP | 地基 | 一个类只一个变化原因 |
| OCP | 目标 | 加功能不改老代码 |
| LSP | 手段(继承维度) | 子类安全替换父类 |
| ISP | 手段(接口维度) | 接口小而专 |
| DIP | 手段(依赖维度) | 依赖抽象不依赖细节 |

### 1.3 因果链

\`\`\`
没有 SRP → 一个类多职责 → 任一职责变化都改这个类 → 无法 OCP
没有 LSP → 子类不能替换父类 → 多态变陷阱 → 扩展要改使用者 → 无法 OCP
没有 ISP → 胖接口强迫空实现 → 实现类违反 LSP → 无法 OCP
没有 DIP → 高层依赖低层细节 → 低层变化影响高层 → 无法 OCP

→→→ SRP + LSP + ISP + DIP 共同支撑 OCP ←←←
\`\`\`

### 1.4 协同示例

以"加一种新折扣策略"为例,看五原则如何协同:

\`\`\`
1. SRP:DiscountStrategy 只算折扣,不管其他(职责单一)
2. OCP:新增 NoDiscountStrategy 不改 OrderService(对扩展开放)
3. LSP:NoDiscountStrategy 能替换 DiscountStrategy 基类(子类可换)
4. ISP:OrderService 只依赖 IDiscount 小接口,不依赖 INotifier(接口隔离)
5. DIP:OrderService 依赖 IDiscount 抽象,不依赖具体策略(依赖倒置)
\`\`\`

## 二、综合实战:电商订单系统

我们设计一个电商订单系统,完整应用 SOLID 五原则。

### 2.1 需求描述

\`\`\`
功能:
  - 创建订单(含商品列表)
  - 应用折扣策略(满减、打折、无折扣、组合...)
  - 计算最终金额
  - 持久化订单
  - 通知用户
  - 记录日志

未来扩展点:
  - 新增折扣类型(不改老代码)
  - 换数据库(MySQL → Mongo)
  - 换通知方式(邮件 → 短信 → 推送)
\`\`\`

### 2.2 SRP:职责拆分

先识别职责,每个职责一个类:

\`\`\`
职责识别:
  - 订单数据模型          → Order 类
  - 订单持久化            → OrderRepository 类
  - 折扣计算              → DiscountStrategy 类(及子类)
  - 订单业务流程          → OrderService 类
  - 通知用户              → Notifier 类(及子类)
  - 日志记录              → Logger 类(及子类)
\`\`\`

不要把这些全塞进一个 \`OrderManager\` 上帝类,否则任一变化都改它。

### 2.3 OCP + LSP:折扣策略用策略模式

折扣是典型的"会变化"部分,用策略模式 + 多态实现 OCP。

\`\`\`python
from abc import ABC, abstractmethod
from dataclasses import dataclass, field

# ===== 抽象折扣策略(OCP 的抽象入口,LSP 的基类)=====
class DiscountStrategy(ABC):
    """折扣策略抽象基类。"""
    @abstractmethod
    def apply(self, original: float) -> float:
        """返回折扣后金额。"""
        ...

# ===== 具体策略(LSP:每个子类都能替换基类)=====
class NoDiscount(DiscountStrategy):
    """无折扣。"""
    def apply(self, original: float) -> float:
        return original

class PercentageDiscount(DiscountStrategy):
    """百分比折扣,如打 8 折。"""
    def __init__(self, percent: float):
        self.percent = percent  # 0.8 表示 8 折

    def apply(self, original: float) -> float:
        return round(original * self.percent, 2)

class FullReductionDiscount(DiscountStrategy):
    """满减:满 threshold 减 reduction。"""
    def __init__(self, threshold: float, reduction: float):
        self.threshold = threshold
        self.reduction = reduction

    def apply(self, original: float) -> float:
        if original >= self.threshold:
            return round(original - self.reduction, 2)
        return original
\`\`\`

新增折扣类型(比如阶梯折扣),只需新增子类,不改任何老代码——OCP 达成。

### 2.4 ISP:Notifier 接口拆分

通知能力拆成细粒度接口,使用者按需依赖。

\`\`\`python
# ===== 通知抽象(ISP:拆分接口)=====
class IOrderNotifier(ABC):
    """订单通知:只通知订单相关事件。"""
    @abstractmethod
    def notify_order_created(self, order: "Order") -> None: ...

class IPaymentNotifier(ABC):
    """支付通知:只通知支付事件。"""
    @abstractmethod
    def notify_payment_received(self, order_id: int, amount: float) -> None: ...

class ILogNotifier(ABC):
    """系统告警通知:运维用。"""
    @abstractmethod
    def alert(self, message: str) -> None: ...

# ===== 具体实现 =====
class EmailNotifier(IOrderNotifier, IPaymentNotifier):
    """邮件通知:实现订单 + 支付通知。"""
    def __init__(self, smtp_host: str = "smtp.local"):
        self.smtp_host = smtp_host

    def notify_order_created(self, order: "Order") -> None:
        print(f"[Email] 订单 {order.id} 已创建,金额 {order.final_amount}")

    def notify_payment_received(self, order_id: int, amount: float) -> None:
        print(f"[Email] 订单 {order_id} 支付 {amount} 已收到")

class SmsNotifier(IOrderNotifier):
    """短信通知:只实现订单通知(ISP:不必实现支付通知)。"""
    def notify_order_created(self, order: "Order") -> None:
        print(f"[SMS] 订单 {order.id} 创建成功")
\`\`\`

\`SmsNotifier\` 只实现 \`IOrderNotifier\`,不必被迫实现 \`IPaymentNotifier\`——ISP 达成。

### 2.5 DIP:抽象仓储 + 依赖注入

仓储抽象 + 多实现,OrderService 依赖抽象。

\`\`\`python
# ===== 仓储抽象(DIP)=====
class IOrderRepository(ABC):
    @abstractmethod
    def save(self, order: "Order") -> None: ...
    @abstractmethod
    def find(self, order_id: int) -> "Order | None": ...

# ===== 日志抽象(DIP)=====
class ILogger(ABC):
    @abstractmethod
    def info(self, msg: str) -> None: ...
    @abstractmethod
    def error(self, msg: str) -> None: ...

# ===== 低层实现 =====
class InMemoryOrderRepository(IOrderRepository):
    def __init__(self):
        self._store: dict[int, Order] = {}

    def save(self, order: "Order") -> None:
        self._store[order.id] = order

    def find(self, order_id: int) -> "Order | None":
        return self._store.get(order_id)

class ConsoleLogger(ILogger):
    def info(self, msg: str) -> None:
        print(f"[INFO] {msg}")

    def error(self, msg: str) -> None:
        print(f"[ERROR] {msg}")
\`\`\`

### 2.6 数据模型 + 业务编排

\`\`\`python
@dataclass
class OrderItem:
    name: str
    price: float
    quantity: int

    @property
    def subtotal(self) -> float:
        return self.price * self.quantity

@dataclass
class Order:
    id: int
    user_id: int
    items: list[OrderItem] = field(default_factory=list)
    status: str = "created"
    final_amount: float = 0.0

    @property
    def original_amount(self) -> float:
        return sum(item.subtotal for item in self.items)


# ===== 高层业务编排(只依赖抽象)=====
class OrderService:
    """订单服务:编排仓储、折扣、通知、日志。

    依赖:
      - IOrderRepository(DIP)
      - DiscountStrategy(DIP + LSP)
      - IOrderNotifier(DIP + ISP)
      - ILogger(DIP)
    """
    def __init__(
        self,
        repo: IOrderRepository,
        notifier: IOrderNotifier,
        logger: ILogger,
    ):
        self._repo = repo
        self._notifier = notifier
        self._logger = logger

    def create_order(
        self,
        order_id: int,
        user_id: int,
        items: list[OrderItem],
        discount: DiscountStrategy,  # 策略由调用方决定
    ) -> Order:
        try:
            order = Order(id=order_id, user_id=user_id, items=items)
            order.final_amount = discount.apply(order.original_amount)
            self._repo.save(order)
            self._notifier.notify_order_created(order)
            self._logger.info(
                f"订单创建: id={order_id}, "
                f"原价={order.original_amount}, 折后={order.final_amount}"
            )
            return order
        except Exception as e:
            self._logger.error(f"订单创建失败 id={order_id}: {e}")
            raise

    def query_order(self, order_id: int) -> Order | None:
        order = self._repo.find(order_id)
        if order is None:
            self._logger.info(f"订单未找到: {order_id}")
        return order
\`\`\`

### 2.7 组装与运行

\`\`\`python
def build_service() -> OrderService:
    """Composition Root:决定用哪些实现。"""
    repo = InMemoryOrderRepository()
    notifier = EmailNotifier(smtp_host="smtp.example.com")
    logger = ConsoleLogger()
    return OrderService(repo, notifier, logger)


# ===== 运行:演示多种折扣策略(OCP)=====
def main() -> None:
    service = build_service()

    items = [
        OrderItem("键盘", 200, 1),
        OrderItem("鼠标", 80, 2),
    ]
    # 原价 = 200 + 160 = 360

    # 策略 1:无折扣
    order1 = service.create_order(1, 1001, items, NoDiscount())
    # final = 360

    # 策略 2:打 8 折
    order2 = service.create_order(2, 1001, items, PercentageDiscount(0.8))
    # final = 288

    # 策略 3:满 300 减 50
    order3 = service.create_order(3, 1001, items, FullReductionDiscount(300, 50))
    # final = 310

    # 策略 4:未来新增的阶梯折扣,不改 OrderService
    # order4 = service.create_order(4, 1001, items, TieredDiscount(...))

    # 查询
    found = service.query_order(2)
    print(f"查询到: {found}")


if __name__ == "__main__":
    main()
\`\`\`

### 2.8 架构全景图

\`\`\`
                          ┌────────────────────────┐
                          │     OrderService        │
                          │  (高层业务编排,SRP)     │
                          └──┬──────┬──────┬──────┬─┘
                             │      │      │      │
                  依赖抽象 ↓      │      │      │ ↓ 依赖抽象
            ┌────────────┐  │  ┌────────────┐  │ ┌────────┐
            │IOrderRepo  │  │  │Discount    │  │ │IOrder  │
            │            │  │  │Strategy    │  │ │Notifier│
            └─────┬──────┘  │  └─────┬──────┘  │ └───┬────┘
                  │实现       │        │实现       │     │实现
            ┌─────┴──────┐  │  ┌──────┴──────┐  │ ┌───┴──────┐
            │InMemory    │  │  │NoDiscount    │  │ │Email     │
            │OrderRepo   │  │  │Percentage    │  │ │Notifier  │
            │            │  │  │FullReduction │  │ │SmsNotifier│
            └────────────┘  │  └──────────────┘  │ └──────────┘
                            │                    │
                            │  ┌────────────┐    │
                            └→ │ILogger     │ ←──┘
                               └─────┬──────┘
                                     │实现
                               ┌─────┴──────┐
                               │ConsoleLogger│
                               └────────────┘

  五原则落地:
    SRP:每个类一个职责(Order/Repo/Strategy/Notifier/Logger)
    OCP:新增折扣类型不改 OrderService
    LSP:NoDiscount/Percentage/FullReduction 都能替换 DiscountStrategy
    ISP:Notifier 拆成 IOrderNotifier/IPaymentNotifier
    DIP:OrderService 依赖 4 个抽象,不依赖具体实现
\`\`\`

## 三、SOLID 的代价:过度设计的风险

SOLID 不是免费的,滥用会带来"过度设计"问题。

### 3.1 过度设计的症状

| 症状 | 表现 |
|------|------|
| 接口爆炸 | 简单功能拆出 5 个接口 8 个类 |
| 间接层过深 | 调一个方法要穿过 4 层抽象 |
| 配置复杂 | 改一行逻辑要动 3 个配置文件 |
| 认知负担 | 新人看不懂,改一个 bug 要理解整个架构 |
| 开发缓慢 | 简单需求也要走完整抽象流程 |

### 3.2 经典反例:简单脚本套 SOLID

\`\`\`python
# 需求:读取一个 JSON 文件并打印键的数量

# ✗ 过度设计:套 SOLID
class IFileReader(ABC):
    @abstractmethod
    def read(self, path: str) -> str: ...

class IJsonParser(ABC):
    @abstractmethod
    def parse(self, text: str) -> dict: ...

class ICounter(ABC):
    @abstractmethod
    def count(self, data: dict) -> int: ...

class JsonFileReader(IFileReader): ...
class StdJsonParser(IJsonParser): ...
class KeyCounter(ICounter): ...

class KeyCountService:
    def __init__(self, reader, parser, counter): ...
    # ...

# ✓ 简单实现:够用就好
import json
def count_keys(path: str) -> int:
    with open(path) as f:
        return len(json.load(f))
\`\`\`

第二种 5 行代码搞定的事,第一种硬生生拆成十几个类。这就是过度设计。

### 3.3 YAGNI 原则

YAGNI(You Aren't Gonna Need It):**你不会需要它。**

\`\`\`
不要为"未来可能"的需求做设计。
等到需求真的出现,再重构不迟。
\`\`\`

YAGNI 与 SOLID 的张力:

\`\`\`
SOLID:为扩展点预留抽象
YAGNI:不要预留用不到的抽象

平衡:只为"明确会变"的扩展点抽象,不为"想象中"的扩展点抽象
\`\`\`

### 3.4 判断是否过度设计的口诀

\`\`\`
问 1:这个抽象现在有用吗?(不是"将来可能有")
  没有 → 删

问 2:这个接口有几个实现?
  只有一个,且不会变 → 删抽象,直接用类

问 3:加这个抽象后,改代码变快还是变慢?
  变慢 → 过度设计

问 4:新人 10 分钟能看懂吗?
  看不懂 → 复杂度过高
\`\`\`

## 四、何时该用 SOLID,何时不该用

### 4.1 该用 SOLID 的场景

| 场景 | 理由 |
|------|------|
| 团队项目(3+ 人) | 多人协作需清晰边界 |
| 长期维护项目(1 年+) | 变更成本累积,SOLID 降低成本 |
| 库/框架开发 | 用户需扩展点,SOLID 提供扩展性 |
| 需要单元测试 | DIP 让 Mock 成为可能 |
| 业务规则复杂 | SRP 拆分避免上帝类 |
| 多环境部署 | DIP 支持多实现切换 |
| 需求频繁变化 | OCP 保护核心代码不被改坏 |

### 4.2 不该用(或少用)SOLID 的场景

| 场景 | 理由 |
|------|------|
| 一次性脚本 | 用完即弃,过度设计浪费 |
| 个人玩具项目 | 学习探索优先,架构后置 |
| 原型/MVP | 快速验证假设,架构是负债 |
| 简单 CRUD | 业务简单,直接写最快 |
| 性能极致场景 | 多层抽象有性能开销(慎用) |
| 临时数据迁移 | 一次性任务 |

### 4.3 渐进式应用 SOLID

不要一开始就套全套 SOLID,而是**随需求演进逐步应用**:

\`\`\`
阶段 1(原型):怎么快怎么来,不顾 SOLID
阶段 2(生产化):应用 SRP,拆分上帝类
阶段 3(需扩展):应用 OCP + DIP,抽象扩展点
阶段 4(团队协作):应用 ISP + LSP,明确契约
阶段 5(长期维护):持续重构,保持架构健康
\`\`\`

## 五、SOLID 与其他原则的关系

SOLID 不是唯一的设计原则,它与其他原则相互配合。

### 5.1 KISS(Keep It Simple, Stupid)

\`\`\`
KISS:保持简单
SOLID:保持可扩展

冲突:SOLID 可能引入抽象层,增加复杂度
平衡:用最简单的 SOLID 实现,不为 SOLID 而 SOLID
\`\`\`

### 5.2 DRY(Don't Repeat Yourself)

\`\`\`
DRY:消除重复
SOLID:合理抽象

协同:DRY 识别重复,SOLID 提供抽象手段
警惕:过度 DRY 导致耦合(为复用强行抽象)
\`\`\`

### 5.3 YAGNI(You Aren't Gonna Need It)

\`\`\`
YAGNI:不要预先设计用不到的
SOLID:为扩展点抽象

冲突:YAGNI 反对预留抽象,SOLID 鼓励扩展点
平衡:只为"明确会变"的抽象,不为"想象中"的抽象
\`\`\`

### 5.4 组合优于继承

\`\`\`
组合优于继承:用对象组合代替类继承
SOLID 的 LSP:约束继承的使用

协同:LSP 让继承安全,组合优于继承让继承减少
平衡:能用组合就用组合,必须继承时严格守 LSP
\`\`\`

### 5.5 原则速查表

| 原则 | 核心思想 | 与 SOLID 的关系 |
|------|---------|-----------------|
| KISS | 保持简单 | 制衡 SOLID 的过度倾向 |
| DRY | 消除重复 | 协同 SOLID 的抽象手段 |
| YAGNI | 不要预设计 | 制衡 SOLID 的扩展点预留 |
| 组合优于继承 | 用组合代替继承 | 协同 LSP,减少继承滥用 |
| 三次法则 | 第三次重复才抽象 | 制衡过早抽象 |

### 5.6 决策流程

\`\`\`
遇到设计问题 →
  1. 先 KISS:最简单实现是什么?
  2. 看 DRY:有重复吗?重复几次?
  3. 问 YAGNI:这个扩展点现在需要吗?
  4. 用 SOLID:确认需要后,用 SOLID 抽象
  5. 优先组合:能用组合就不用继承
\`\`\`

## 六、SOLID 在 Python 中的特色实践

### 6.1 利用鸭子类型简化接口

Python 的鸭子类型让 ISP 更自然:不需要显式 Protocol,只要对象有需要的方法即可。

\`\`\`python
# 不需要显式接口,鸭子类型自动满足 ISP
class SimpleNotifier:
    def notify_order_created(self, order): ...

def use(notifier):  # 只要 notifier 有 notify_order_created 就行
    notifier.notify_order_created(...)
\`\`\`

但大型项目建议加 Protocol 做静态检查,兼顾灵活与安全。

### 6.2 用 dataclass 简化数据模型

\`\`\`python
from dataclasses import dataclass

@dataclass
class Order:
    id: int
    amount: float
    status: str = "created"
\`\`\`

dataclass 自动生成 \`__init__\`、\`__repr__\`、\`__eq__\`,减少样板代码,SRP 更聚焦业务。

### 6.3 用类型注解强化契约

\`\`\`python
class OrderService:
    def __init__(self, repo: IOrderRepository, notifier: IOrderNotifier): ...
\`\`\`

类型注解让 DIP 在静态层面可检查(mypy/pyright),而不只是运行时约定。

### 6.4 用装饰器实现横切关注点

日志、缓存、事务等横切关注点,用装饰器而非侵入业务类。

\`\`\`python
def log_call(func):
    def wrapper(*args, **kwargs):
        print(f"调用 {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

class OrderService:
    @log_call
    def create_order(self, ...): ...
\`\`\`

装饰器让 SRP 更纯粹:业务类只管业务,日志由装饰器负责。

### 6.5 用 contextlib 管理资源

\`\`\`python
from contextlib import contextmanager

@contextmanager
def db_session(repo):
    repo.connect()
    try:
        yield repo
    finally:
        repo.close()
\`\`\`

资源管理与业务逻辑分离,符合 SRP。

## 七、常见误区与反思

### 7.1 误区:SOLID = 设计模式

\`\`\`
错:SOLID 是 23 种设计模式
对:SOLID 是设计原则,设计模式是实现原则的具体手法

关系:
  SOLID(原则)→ 指导 → 设计模式(模式)→ 实现 → 代码
  例:DIP(原则)→ 策略模式/工厂模式 → OrderService + IRepository
\`\`\`

### 7.2 误区:每个类都要符合 SOLID

\`\`\`
错:所有代码必须严格 SOLID
对:SOLID 是方向,不是教条

  DTO/数据类不需要 SRP(它就是数据容器)
  工具函数不需要 DIP(它稳定不变)
  内部辅助类不需要 ISP(它只被一个类用)
\`\`\`

### 7.3 误区:SOLID 让代码变复杂是值得的

\`\`\`
错:复杂度是 SOLID 的必要代价
对:不必要的复杂度是过度设计

  简单问题用 SOLID 解决 → 过度设计
  复杂问题不用 SOLID → 混乱
  匹配才是关键
\`\`\`

### 7.4 误区:遵守 SOLID 就没有 bug

\`\`\`
错:SOLID 保证代码正确
对:SOLID 提升可维护性和可扩展性,不直接保证正确性

  正确性靠测试
  可维护性靠 SOLID
  二者协同,缺一不可
\`\`\`

### 7.5 误区:重构时一次性套用全部 SOLID

\`\`\`
错:大重构,一次性把所有 SOLID 都用上
对:小步重构,每次只应用一个原则

  正确做法:
    第 1 步:应用 SRP 拆分上帝类
    第 2 步:测试稳定后,应用 DIP 抽象仓储
    第 3 步:再应用 OCP 抽象策略
    每步都有测试保护,可随时回退
\`\`\`

## 八、易错点小结

| 易错点 | 描述 | 后果 | 正确做法 |
|--------|------|------|---------|
| 把 SOLID 当教条 | 所有代码严格套五原则 | 过度设计、开发缓慢 | 按场景选择性应用 |
| 为 SOLID 而 SOLID | 预留用不到的抽象 | 代码臃肿、难懂 | 遵循 YAGNI,只为明确变化抽象 |
| 忽视 KISS | SOLID 实现过于复杂 | 维护成本反升 | 用最简单的 SOLID 实现 |
| 混淆原则与模式 | 以为 SOLID 就是设计模式 | 概念混乱 | 原则指导模式,模式实现原则 |
| 一次性大重构 | 试图一步到位套 SOLID | 风险高、易引入 bug | 小步重构,每步有测试 |
| 数据类套 SRP | DTO 也要单一职责 | 无谓拆分 | 数据类就是数据容器,不需 SRP |
| 忽视测试 | 只讲 SOLID 不写测试 | 重构无保护网 | SOLID + 测试协同 |
| 滥用继承 | 用继承复用代码 | LSP 违规 | 优先组合,继承守 LSP |
| 接口随实现膨胀 | 加功能就改抽象接口 | 违反 OCP | 新功能抽新接口 |
| 忽略团队水平 | 设计过复杂新人看不懂 | 协作困难 | 设计匹配团队水平 |

## 九、本章总结

SOLID 五原则是一个有机整体,共同服务于"软件可扩展、可维护"的目标。

1. **SRP 是地基**——职责单一,变化原因单一,其他原则才有意义
2. **OCP 是目标**——加功能不改老代码,是 SOLID 的终极追求
3. **LSP/ISP/DIP 是手段**——从继承、接口、依赖三个维度支撑 OCP
4. **五原则协同**——单一原则效果有限,组合应用威力巨大
5. **SOLID 有代价**——抽象层带来复杂度,需 KISS/YAGNI 制衡
6. **渐进式应用**——随需求演进逐步引入,不要一次性套全套
7. **与其他原则配合**——KISS/DRY/YAGNI/组合优于继承,共同构成设计哲学
8. **匹配场景**——团队项目、长期维护、复杂业务用 SOLID;脚本、玩具、原型简单优先

### SOLID 实战心法

\`\`\`
1. 先简单,后抽象(KISS 优先)
2. 先具体,后通用(三次法则)
3. 先现状,后未来(YAGNI)
4. 先组合,后继承(组合优于继承)
5. 先测试,后重构(测试保护)
6. 先 SRP,后其他(地基先行)
7. 每次只动一个原则(小步演进)
8. 抽象匹配变化,不为想象抽象(精准 DIP/OCP)
\`\`\`

至此,SOLID 五原则全部讲完。接下来的章节我们将进入设计模式部分,学习如何用具体模式(创建型、结构型、行为型)落地 SOLID 思想。记住:**原则是心法,模式是招式**——心法通了,招式才能活学活用。
`,
  },
];
