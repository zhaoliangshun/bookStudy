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
## 一、概念解释

### 1.1 什么是 class
\`class\` 是面向对象编程（OOP）的核心构造。它把「数据（属性）」和「操作数据的行为（方法）」打包成一个整体，称为「类」。通过类可以创建出一个个具体的「实例（对象）」。

\`\`\`python
class Person:
    species = "Homo sapiens"  # 类属性

    def __init__(self, name, age):
        self.name = name      # 实例属性
        self.age = age

    def greet(self):          # 实例方法
        return f"Hi, I'm {self.name}"
\`\`\`

### 1.2 \`self\` 到底是什么
\`self\` 就是「当前实例本身的引用」。Python 规定：**实例方法的第一个参数永远是实例本身**，调用时由 Python 自动传入。

- \`p1.greet()\` 实际等价于 \`Person.greet(p1)\`
- 名字 \`self\` 只是约定（PEP 8），换成 \`this\`/\`me\` 也能跑，但强烈不建议

### 1.3 为什么是显式 \`self\`（设计原理）
| 语言 | 隐式/显式 | 写法 |
| --- | --- | --- |
| Java / C++ | 隐式 \`this\` | \`void greet() { print(this.name); }\` |
| Python | 显式 \`self\` | \`def greet(self): print(self.name)\` |

Python 选择显式的原因：
1. **方法本质是函数**：Python 中 \`def greet(self)\` 就是个普通函数，挂在类上才叫方法。显式参数让「函数」和「方法」的边界更清晰。
2. **统一查找规则**：\`self.x\` 和 \`obj.x\` 用同一套属性查找规则，没有特殊语法。
3. **便于元编程**：显式 self 让装饰器、描述符等高级特性实现更简单。

## 二、\`__init__\` vs \`__new__\`
很多人误以为 \`__init__\` 「创建」了对象，其实不是：

| 方法 | 职责 | 返回值 | 调用时机 |
| --- | --- | --- | --- |
| \`__new__\` | **创建**并返回实例 | 必须返回新实例 | 先调用 |
| \`__init__\` | **初始化**已创建的实例 | 无返回值（隐式 None） | \`__new__\` 之后 |

\`\`\`python
class Foo:
    def __new__(cls, *args, **kwargs):       # __new__ 是类方法，负责创建并返回实例对象
        print("1. __new__: 创建实例")          # 先执行：分配内存、创建空对象
        instance = super().__new__(cls)        # 调用父类 __new__ 真正创建对象，必须返回实例
        return instance                        # 返回的实例会作为 __init__ 的 self 传入

    def __init__(self, x):                    # __init__ 在 __new__ 之后执行，负责初始化属性
        print("2. __init__: 初始化")           # 后执行：给已创建的实例绑定属性
        self.x = x                             # self 是 __new__ 返回的实例对象

Foo(10)  # 先 __new__ 再 __init__              # 调用 Foo(10) 时自动依次触发 __new__ → __init__
\`\`\`

> 99% 的场景只需写 \`__init__\`；只在单例、不可变类型（如 tuple 子类）、元类等特殊场景才重写 \`__new__\`。

## 三、实例属性 vs 类属性

### 3.1 定义位置不同
- **类属性**：写在类体里、方法外。属于类本身，所有实例共享一份。
- **实例属性**：在 \`__init__\` 里通过 \`self.xxx = ...\` 赋值。每个实例独立一份。

### 3.2 查找顺序
访问 \`obj.x\` 时，Python 先看「实例自身 \`__dict__\`」有没有 \`x\`，没有再去「类 \`__dict__\`」找，再沿 MRO 往父类找。

\`\`\`python
class Person:
    species = "Homo sapiens"  # 类属性
    def __init__(self, name):
        self.name = name      # 实例属性

p = Person("alice")
print(p.species)        # 实例没有 → 找类属性 → "Homo sapiens"
print(Person.species)   # 直接访问类属性
\`\`\`

### 3.3 ⚠️ 经典陷阱：可变类属性被「共享」
\`\`\`python
class Bad:
    items = []          # 类属性，所有实例共享同一个 list！

a = Bad(); b = Bad()
a.items.append(1)
print(b.items)   # [1]  ← b 也看到了！
\`\`\`

正确做法：可变默认值放到 \`__init__\` 里作为实例属性。

## 四、三种方法对比

| 类型 | 装饰器 | 第一参数 | 访问实例属性 | 访问类属性 | 典型用途 |
| --- | --- | --- | --- | --- | --- |
| 实例方法 | 无 | \`self\` | ✅ | ✅（通过 \`type(self)\`） | 操作实例状态 |
| 类方法 | \`@classmethod\` | \`cls\` | ❌ | ✅ | 替代构造器、工厂方法 |
| 静态方法 | \`@staticmethod\` | 无 | ❌ | ❌ | 与类逻辑相关的工具函数 |

### 4.1 \`@classmethod\` 与「替代构造器」
当希望提供多种创建实例的方式时，惯例命名 \`from_xxx\`：

\`\`\`python
class Person:
    def __init__(self, name, age):           # 实例方法：通过 self 访问实例属性
        self.name, self.age = name, age       # 元组解包赋值，等价于两行分别赋值

    @classmethod                              # 类方法装饰器：第一个参数是类本身（cls）而非实例
    def from_birth_year(cls, name, year):     # cls 接收当前类 Person，用于工厂方法模式
        return cls(name, 2026 - year)        # 用 cls 而非 Person，子类调用时自动适配子类

p = Person.from_birth_year("bob", 1996)       # 不需实例即可调用，等价于 Person("bob", 30)
\`\`\`

> 关键：用 \`cls\` 而不是写死 \`Person\`，子类继承后 \`SubPerson.from_birth_year(...)\` 仍返回子类实例。

### 4.2 \`@staticmethod\`
和类「逻辑上相关」但不需要访问实例或类：

\`\`\`python
class Person:
    @staticmethod
    def is_adult(age):
        return age >= 18

Person.is_adult(20)   # 类调用
p = Person("a", 30)
p.is_adult(30)        # 实例也能调用
\`\`\`

## 五、代码逐行讲解（对应右侧 code）

\`\`\`python
class Person:
    species = "Homo sapiens"   # 类属性：所有实例共享，定义在方法之外
\`\`\`
- 定义类 \`Person\`；\`species\` 是类属性，所有实例共享。

\`\`\`python
    def __init__(self, name, age):   # 构造方法：实例化时自动调用，self 指向新实例
        self.name = name              # 实例属性：每个实例独有
        self.age = age
\`\`\`
- 构造函数：\`Person("alice", 30)\` 时自动调用；\`self\` 指向新建实例；为实例绑定 \`name\`/\`age\` 两个属性。

\`\`\`python
    def greet(self):                 # 实例方法：第一个参数永远是 self
        return f"Hi, I'm {self.name}, {self.age} years old."   # 通过 self 访问实例属性
\`\`\`
- 实例方法：通过 \`self.name\` 读取实例属性。

\`\`\`python
    @classmethod                     # 类方法装饰器：第一个参数是类本身（cls）
    def from_birth_year(cls, name, year):
        return cls(name, 2026 - year)   # 用 cls 而非 Person，子类调用时自动用子类
\`\`\`
- 类方法：\`cls\` 是 \`Person\`（或其子类）；「替代构造器」，通过出生年份算年龄。

\`\`\`python
    @staticmethod                    # 静态方法：不需要 self/cls，和普通函数一样
    def is_adult(age):
        return age >= 18             # 逻辑与类相关但不访问实例/类数据
\`\`\`
- 静态方法：与类相关但无需 \`self\`/\`cls\`。

\`\`\`python
p1 = Person("alice", 30)            # 调用 __init__ 创建实例
p2 = Person.from_birth_year("bob", 1996)   # 调用类方法（替代构造器模式）
\`\`\`
- \`p1\`：走 \`__init__\`；\`p2\`：走类方法工厂。

\`\`\`python
print(Person.species)                          # 通过类访问类属性
print(Person.is_adult(17), Person.is_adult(30))   # 通过类调用静态方法
\`\`\`
- 直接通过类名访问类属性、调用静态方法，无需实例。

## 六、易错点小结

| 易错点 | 错误写法 | 正确写法 | 原因 |
| --- | --- | --- | --- |
| 忘记 \`self\` | \`def greet(): ...\` | \`def greet(self): ...\` | 实例方法第一参数必须是 self |
| 类属性可变共享 | \`items = []\` 当默认容器 | 在 \`__init__\` 里 \`self.items = []\` | 类属性被所有实例共享 |
| \`__init__\` 返回值 | \`return something\` | 不 return 或只 return None | \`__init__\` 不能返回非 None |
| 误以为 \`__init__\` 创建对象 | —— | \`__new__\` 才创建，\`__init__\` 只初始化 | 职责不同 |
| 类方法里写死类名 | \`return Person(...)\` | \`return cls(...)\` | 子类调用会失效 |
| 静态方法加 \`self\` | \`@staticmethod def f(self):\` | 不带 self/cls | 静态方法无隐含参数 |
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
## 一、概念解释

### 1.1 继承是什么
继承让子类自动获得父类的属性和方法，并可在其基础上扩展或重写，实现「代码复用」与「多态」。

\`\`\`python
class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self):
        return "..."

class Dog(Animal):       # Dog 继承 Animal
    def speak(self):     # 重写父类方法
        return f"{self.name}: woof!"
\`\`\`

### 1.2 \`super()\` 的真正含义
很多人以为 \`super()\` 就是「调用父类」，**这只是单继承下的巧合**。真正的定义是：\`super()\` 返回 MRO 中「当前类之后的下一个类」的代理对象。

\`\`\`python
class B(A):
    def fn(self):
        return "B" + super().fn()   # 调用 MRO 中 B 之后的类
\`\`\`

- 在单继承里，"下一个"恰好是父类；
- 在多继承里，"下一个"由 MRO 决定，未必是直接父类。

### 1.3 多继承与「菱形继承」
Python 支持多继承：\`class D(B, C):\`。但当 B、C 都继承自 A 时，形成「菱形」结构：A 是顶层父类，B 和 C 都继承 A，D 同时继承 B 和 C。

问题：D 调用 \`super().fn()\` 时到底走 B 还是 C？A 的方法会不会被调用多次？这就需要 MRO。

## 二、MRO（方法解析顺序）

### 2.1 什么是 MRO
MRO = Method Resolution Order，是 Python 在多继承下「查找方法/属性的固定线性顺序」。

### 2.2 C3 线性化算法
Python 3 用 **C3 线性化**计算 MRO，保证：
1. 子类在父类之前；
2. 多个父类按声明顺序排；
3. 同一父类只出现一次（避免菱形重复）。

### 2.3 查看 MRO
\`\`\`python
class A: ...
class B(A): ...
class C(A): ...
class D(B, C): ...

print(D.__mro__)
# (<class 'D'>, <class 'B'>, <class 'C'>, <class 'A'>, <class 'object'>)
\`\`\`

\`D.__mro__\` 是个元组，从左到右就是查找顺序。

### 2.4 super() 按 MRO 传递
\`\`\`python
class A:
    def fn(self): return "A"                       # 基类方法
class B(A):
    def fn(self): return "B" + super().fn()        # super() 按 MRO 调用下一个
class C(A):
    def fn(self): return "C" + super().fn()
class D(B, C): pass                                # 多继承，MRO 为 D→B→C→A

D().fn()  # "BCA"   # B 调 super→C，C 调 super→A，串成 "BCA"
\`\`\`
执行 \`D().fn()\`：
1. D 没有 \`fn\`，按 MRO 找到 B → 输出 "B"，再 \`super().fn()\`；
2. MRO 中 B 之后是 C → 输出 "C"，再 \`super().fn()\`；
3. MRO 中 C 之后是 A → 输出 "A"。
结果："BCA"。A 只被调用一次。

## 三、\`isinstance\` vs \`issubclass\`

| 函数 | 参数 | 含义 |
| --- | --- | --- |
| \`isinstance(obj, cls)\` | 实例, 类 | obj 是否 cls（或其子类）的实例 |
| \`issubclass(Sub, Base)\` | 子类, 父类 | Sub 是否 Base 的子类 |

\`\`\`python
d = Dog("Rex")
isinstance(d, Dog)      # True
isinstance(d, Animal)   # True（子类实例也是父类实例）
issubclass(Dog, Animal) # True
issubclass(Dog, Cat)    # False
\`\`\`

> 注意 \`type(d) is Animal\` 会是 False，因为 \`type\` 不考虑继承；判断继承关系要用 \`isinstance\`。

## 四、抽象类（ABC + \`@abstractmethod\`）

抽象类用 \`abc\` 模块定义，**不能被实例化**，强制子类实现抽象方法：

\`\`\`python
from abc import ABC, abstractmethod

class Animal(ABC):
    @abstractmethod
    def speak(self):
        pass

Animal()        # ❌ TypeError: 抽象类不能实例化
Dog("Rex")      # ✅ 子类实现了 speak 才能实例化
\`\`\`

设计意图：定义「接口契约」，所有子类必须实现 \`speak\`，否则实例化时报错——把错误前移到设计阶段。

## 五、多继承的适用场景与风险

### 5.1 适用场景：Mixin
Mixin 是「小而单一的功能模块」，通过多继承组合进主类：

\`\`\`python
class LogMixin:
    def log(self, msg): print(f"[LOG] {msg}")

class SaveMixin:
    def save(self): ...

class User(LogMixin, SaveMixin):
    pass   # User 同时拥有 log 和 save 能力
\`\`\`

### 5.2 风险
| 风险 | 说明 |
| --- | --- |
| 方法冲突 | 多个父类有同名方法，行为难预测 |
| 状态共享混乱 | \`__init__\` 之间互相覆盖属性 |
| MRO 复杂 | 调试时难以追踪调用链 |
| 菱形继承 | 不用 \`super()\` 易导致父类多次初始化 |

**经验法则**：能用组合（has-a）就别用多继承；用多继承优先 Mixin（不带状态、只加行为）。

## 六、代码逐行讲解（对应右侧 code）

\`\`\`python
from abc import abstractmethod
from abc import ABC
class Animal(ABC):                       # 继承 ABC 才能用 @abstractmethod
    def __init__(self, name):
        self.name = name
    @abstractmethod
    def speak(self): pass                # 抽象方法：子类必须实现，否则不能实例化
    def __repr__(self):
        return f"{self.__class__.__name__}({self.name!r})"   # !r 用 repr 格式化
\`\`\`
- 继承 \`ABC\` → 抽象类；\`@abstractmethod\` 标记 \`speak\` 必须由子类实现；\`__repr__\` 让 \`print(a)\` 显示 \`Dog('Rex')\`；\`!r\` 调用 \`repr(self.name)\` 加引号。

\`\`\`python
class Dog(Animal):
    def speak(self): return f"{self.name}: woof!"   # 实现抽象方法，Dog 才能实例化
\`\`\`
- 继承 Animal 并实现 \`speak\`，方可实例化。

\`\`\`python
# 多态：不同子类都有 speak，循环里统一调用
animals = [Dog("Rex"), Cat("Mimi")]
for a in animals:
    print(a, "->", a.speak())   # 运行时按实际类型调对应方法
\`\`\`
- 多态：同一个循环对不同子类调用 \`speak\`，行为不同。

\`\`\`python
print(isinstance(animals[0], Dog), isinstance(animals[0], Animal))   # True True；子类实例也是父类
print(issubclass(Dog, Animal), issubclass(Dog, Cat))   # True False
\`\`\`
- 验证类型关系：Dog 既是 Dog 也是 Animal 的实例。

\`\`\`python
class D(B, C): pass
print("MRO:", [c.__name__ for c in D.__mro__])
print(d.fn())  # "BCA"
\`\`\`
- 多继承 + MRO + super 链式调用演示。

## 七、易错点小结

| 易错点 | 错误理解 | 正确理解 |
| --- | --- | --- |
| super 是父类 | super() = 父类 | super() = MRO 中下一个类 |
| 抽象类能实例化 | \`Animal()\` 能用 | 有未实现抽象方法则 TypeError |
| MRO 随意 | 想当然的顺序 | 用 \`__mro__\` 查看，C3 算法决定 |
| isinstance vs type | 用 \`type() is\` 判断继承 | 用 \`isinstance\` 考虑继承链 |
| 多继承滥用 | 任意多继承 | 优先组合，多继承用 Mixin |
| 重写忘 super | 不调用 \`super().__init__()\` | 父类初始化被跳过，属性丢失 |
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
## 一、概念解释：什么是 dunder 方法

「dunder」= **d**ouble **under**score，即 \`__xxx__\` 形式的方法。它们是 Python 的「协议方法」：你实现它们，Python 内置语法/函数就会自动调用。

- 写 \`a + b\` → Python 调用 \`a.__add__(b)\`
- 写 \`len(x)\` → Python 调用 \`x.__len__()\`
- 写 \`for i in x\` → Python 调用 \`x.__iter__()\` 和 \`__next__()\`

这就是「运算符重载」和「与内置函数集成」的本质——让自定义类像 \`list\`/\`dict\`/\`int\` 一样工作。

## 二、\`__repr__\` vs \`__str__\`

| 方法 | 受众 | 目标 | 触发 | 期望 |
| --- | --- | --- | --- | --- |
| \`__repr__\` | 开发者 | 调试、日志 | \`repr(x)\`、交互式直接输 \`x\`、容器内元素 | 尽量 \`eval(repr(x)) == x\`（可重建） |
| \`__str__\` | 终端用户 | 友好显示 | \`str(x)\`、\`print(x)\` | 可读性好 |

\`\`\`python
class Vector:
    def __repr__(self): return f"Vector({self._values})"   # 开发者看：能复制重建
    def __str__(self):  return f"({self._values})"         # 用户看：简洁
\`\`\`

> 只实现一个就实现 \`__repr__\`：因为 \`__str__\` 未定义时 Python 会回退用 \`__repr__\`。

## 三、容器协议

### 3.1 \`__len__\`
\`\`\`python
def __len__(self): return len(self._values)
len(v)   # → v.__len__()
\`\`\`

### 3.2 \`__getitem__\` / \`__setitem__\`
支持索引和切片：
\`\`\`python
def __getitem__(self, i): return self._values[i]
def __setitem__(self, i, v): self._values[i] = v

v[1]       # → v.__getitem__(1)
v[1] = 99  # → v.__setitem__(1, 99)
v[0:2]     # i 是 slice 对象，自动支持切片
\`\`\`

### 3.3 \`__iter__\` / \`__next__\`（迭代器协议）
- \`__iter__\` 返回一个迭代器（通常 \`return self\` 或 \`return iter(...)\`）；
- \`__next__\` 返回下一个值，没有就 \`raise StopIteration\`。

\`\`\`python
def __iter__(self): return iter(self._values)
for x in v: ...   # → iter(v) → 不断 next()
\`\`\`

### 3.4 \`__contains__\`（支持 \`in\`）
\`\`\`python
def __contains__(self, x): return x in self._values
99 in v   # → v.__contains__(99)
\`\`\`
> 未定义时会回退到遍历 \`__iter__\`，但显式实现更高效（如 set 用哈希）。

## 四、比较与算术运算符

### 4.1 \`__eq__\` / \`__lt__\` 与 \`total_ordering\`
\`\`\`python
def __eq__(self, other):
    if isinstance(other, Vector):
        return self._values == other._values
    return NotImplemented   # 见下文
\`\`\`

\`functools.total_ordering\`：只实现 \`__eq__\` 和 \`__lt__\`，装饰器自动补全 \`__le__\`/\`__gt__\`/\`__ge__\`。

### 4.2 \`__add__\` 等算术
\`\`\`python
def __add__(self, other):
    if isinstance(other, Vector):
        return Vector(*(a+b for a,b in zip(self._values, other._values)))
    return NotImplemented
v1 + v2   # → v1.__add__(v2)
\`\`\`

### 4.3 ⚠️ \`NotImplemented\` 的含义
注意是 \`NotImplemented\`（值）不是 \`NotImplementedError\`（异常）。

返回 \`NotImplemented\` 表示「我不支持这种类型的运算，请 Python 去尝试对方的反射方法」：
- \`v1 + v2\` → 先 \`v1.__add__(v2)\`；
- 返回 \`NotImplemented\` → Python 再试 \`v2.__radd__(v1)\`；
- 都失败才 \`raise TypeError\`。

这样自定义类就能和 \`int\`/\`numpy\` 等其它类型协作。

## 五、\`__call__\`：让实例可调用

\`\`\`python
class Adder:
    def __call__(self, x, y): return x + y

add = Adder()
add(1, 2)   # → add.__call__(1, 2)
\`\`\`

用途：把对象当函数用，常用于策略模式、回调、神经网络的 layer（\`layer(x)\`）。

## 六、为什么要实现魔术方法

| 不实现 | 实现 |
| --- | --- |
| \`v.size()\`、\`v.plus(other)\` 自造 API | \`len(v)\`、\`v + other\` 走 Python 通用接口 |
| 不能放进 \`sorted\`/\`sum\` | 自动适配内置函数 |
| 别人读你的代码要查文档 | 用大家熟悉的运算符，可读性强 |

核心思想：**让自定义类融入 Python 的统一协议**，而不是另立一套 API。

## 七、代码逐行讲解（对应右侧 code）

\`\`\`python
class Vector:
    def __init__(self, *values):
        self._values = list(values)   # 收集可变参数为 list，_ 前缀约定为内部使用
\`\`\`
- 用 \`*values\` 收集任意个参数为 tuple，转成 list 存内部；下划线前缀表示「内部使用」。

\`\`\`python
    def __repr__(self):               # 定义 repr，print/交互式显示时调用
        return f"Vector({', '.join(map(str, self._values))})"   # map 把每个值转 str 再用逗号拼
\`\`\`
- 返回 \`Vector(1, 2, 3)\` 形式，理论上 \`eval\` 可重建。

\`\`\`python
    def __getitem__(self, i): return self._values[i]    # 支持 v[i]：取值
    def __setitem__(self, i, v): self._values[i] = v    # 支持 v[i]=x：赋值
\`\`\`
- 委托给内部 list，自动获得索引和切片能力。

\`\`\`python
    def __iter__(self): return iter(self._values)       # 支持 for x in v 迭代
    def __contains__(self, x): return x in self._values  # 支持 x in v 判断
\`\`\`
- 迭代与 \`in\` 判断。

\`\`\`python
    def __eq__(self, other):           # 定义 ==，支持 v1 == v2
        if isinstance(other, Vector):
            return self._values == other._values   # 同为 Vector 则比较内部值
        return NotImplemented         # 返回 NotImplemented 让对方类型尝试比较
\`\`\`
- 仅与 Vector 比较；其他类型返回 \`NotImplemented\` 让 Python 尝试反射。

\`\`\`python
    def __add__(self, other):         # 定义 +，支持 v1 + v2
        if isinstance(other, Vector):
            # zip 配对两向量元素，逐位相加，* 解包传给 Vector 构造
            return Vector(*(a + b for a, b in zip(self._values, other._values)))
        return NotImplemented
\`\`\`
- 逐元素相加生成新 Vector；长度不同 \`zip\` 截断。

\`\`\`python
v = Vector(1, 2, 3)
v[1] = 99                  # 走 __setitem__，把第二个元素改成 99
print(v == v2, v + v2)     # == 走 __eq__，+ 走 __add__
\`\`\`
- 演示索引赋值、相等比较、加法运算。

## 八、易错点小结

| 易错点 | 错误 | 正确 | 原因 |
| --- | --- | --- | --- |
| 只实现 \`__str__\` 不实现 \`__repr__\` | 容器内显示丑 | 至少实现 \`__repr__\` | 容器元素用 repr |
| \`NotImplemented\` 写成抛异常 | \`raise NotImplementedError\` | \`return NotImplemented\` | 异常阻断反射尝试 |
| \`__len__\` 返回负数 | 返回 -1 | 返回非负整数 | Python 要求 \`__len__\` ≥ 0 |
| \`__eq__\` 不处理类型不符 | 直接 \`return False\` | \`return NotImplemented\` | 丧失反射机会 |
| \`__iter__\` 返回 self 但忘 \`__next__\` | 无限循环 | 同时实现 \`__next__\` + StopIteration | 迭代器协议 |
| 修改 \`__add__\` 返回 None | 链式调用失败 | 返回新实例 | 运算符应返回新对象 |
| 误改 \`__hash__\` 不改 \`__eq__\` | dict key 异常 | 同时实现两者 | 两者必须一致 |
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
## 一、概念解释

### 1.1 \`@dataclass\` 是什么
\`@dataclass\` 是标准库 \`dataclasses\` 提供的装饰器（PEP 557），专为「以数据为主的类」设计。它能自动生成 \`__init__\`、\`__repr__\`、\`__eq__\` 等样板方法，让你只声明字段。

\`\`\`python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

# 等价于手写 __init__(self, x, y)、__repr__、__eq__
\`\`\`

### 1.2 设计原理
传统 class 写数据类要写一堆 \`__init__\`/\`__repr__\`/\`__eq__\` 重复代码。dataclass 用「类型注解声明字段」，由装饰器在类创建后扫描字段、自动注入方法，减少样板、降低出错率。

## 二、核心特性

### 2.1 自动生成的方法
| 方法 | 默认生成 | 控制参数 |
| --- | --- | --- |
| \`__init__\` | ✅ | \`init=True\` |
| \`__repr__\` | ✅ | \`repr=True\` |
| \`__eq__\` | ✅ | \`eq=True\` |
| \`__hash__\` | eq=True&frozen=False 时不生成；frozen=True 时生成 | \`frozen\` |
| \`__lt__\` 等比较 | ❌ | \`order=True\` |

### 2.2 \`field(default_factory=...)\` 解决可变默认值
Python 中「函数默认参数只求值一次」，所以：
\`\`\`python
from dataclasses import dataclass
@dataclass
class Bad:
    tags: list = []      # ❌ ValueError: mutable default not allowed
\`\`\`
dataclass 直接禁止可变默认值，必须用 \`default_factory\`：
\`\`\`python
from dataclasses import dataclass
from dataclasses import field
@dataclass
class Point:
    x: float
    y: float
    tags: list[str] = field(default_factory=list)   # 每次新建独立 list
\`\`\`

### 2.3 \`frozen=True\`：不可变 + 可哈希
\`\`\`python
from dataclasses import dataclass
@dataclass(frozen=True)
class Color:
    r: int; g: int; b: int

red = Color(255, 0, 0)
red.r = 0          # ❌ FrozenInstanceError
hash(red)          # ✅ 可做 dict key / set 元素
\`\`\`
不可变 = 字段赋值被拦截 + \`__hash__\` 自动生成，适合做常量、配置、缓存键。

### 2.4 \`ClassVar\`：不被当成字段
\`\`\`python
from dataclasses import dataclass
from typing import ClassVar
@dataclass
class Item:
    name: str
    counter: ClassVar[int] = 0   # 类变量，不进 __init__
\`\`\`

## 三、\`@property\`：方法当属性用

### 3.1 基本用法（getter）
把方法伪装成属性，访问时不加括号：
\`\`\`python
class Circle:
    def __init__(self, radius): self._radius = radius   # _radius 约定为"受保护"属性（仅靠惯例）
    @property                                  # property 装饰器：把方法变为只读属性访问
    def area(self):                            # 像访问属性一样调用，不需加括号 c.area()
        return 3.14159 * self._radius ** 2     # 计算面积 πr²，每次访问时实时求值

c = Circle(2)
c.area   # 不写 c.area()，像属性一样访问      # 返回 12.56636；property 让"计算"伪装成"属性"
\`\`\`

### 3.2 setter 与校验
\`\`\`python
    @property
    def radius(self): return self._radius   # 读：c.radius 触发，像属性一样访问

    @radius.setter                           # 写：c.radius = x 触发，可加校验
    def radius(self, value):
        if value < 0: raise ValueError("radius 不能为负")   # 负值校验
        self._radius = value
\`\`\`
设置 \`c.radius = -1\` 会触发 setter 抛错，把校验收敛到一处。

### 3.3 只读属性
只定义 getter、不定义 setter，就是只读：
\`\`\`python
@property
def area(self): return ...   # 没有 @area.setter → 只读
\`\`\`

\`area\` 这种「由其他属性计算得来」的属性叫**计算属性**，无需存值，每次访问实时算。

## 四、dataclass + property 组合

dataclass 自动生成的 \`__init__\` 会给每个字段赋值。要让 property 生效，常用「私有字段 \`_xxx\` + property 暴露」：

\`\`\`python
from dataclasses import field
from dataclasses import dataclass
@dataclass
class User:
    name: str
    _age: int = field(repr=False)   # repr=False：repr 输出时不显示该字段

    @property
    def age(self): return self._age   # 对外只读属性 age，内部用 _age 存储

    @age.setter
    def age(self, value):
        if value < 0: raise ValueError("age 不能为负")   # 写入时校验非负
        self._age = value
\`\`\`

注意点：
- 字段名用 \`_age\`，构造时 \`User("alice", 30)\` 实际写入 \`_age\`；
- \`repr=False\` 避免打印出 _age=30；
- 通过 \`u.age\` 读写走 property，可加校验。

## 五、三种数据容器对比

| 特性 | namedtuple | 普通 class | @dataclass |
| --- | --- | --- | --- |
| 不可变 | ✅ 默认 | ❌ | 可选 \`frozen\` |
| 可变 | ❌ | ✅ | ✅ 默认 |
| 自动 __init__/repr/eq | ✅ | ❌ 手写 | ✅ |
| 可加方法 | 受限 | ✅ | ✅ |
| 类型注解 | ❌ | 可选 | ✅ |
| 默认值/工厂 | 受限 | ✅ | ✅ \`field\` |
| 继承扩展 | 受限 | ✅ | ✅ |

选择建议：
- **纯数据容器、不可变、轻量** → \`namedtuple\` 或 \`frozen dataclass\`；
- **有复杂行为逻辑** → 普通 \`class\`；
- **以数据为主、字段多、需要 eq/repr** → \`@dataclass\`。

## 六、代码逐行讲解（对应右侧 code）

\`\`\`python
from dataclasses import field
from dataclasses import dataclass
@dataclass
class Point:
    x: float
    y: float
    tags: list[str] = field(default_factory=list)   # 可变默认值用 default_factory 每次新建
\`\`\`
- 三个字段：\`x\`、\`y\` 必填，\`tags\` 可选且每次新建空 list（避免共享）。

\`\`\`python
p1 = Point(1, 2)                  # tags 用默认空 list
p2 = Point(1, 2, ["a"])           # 显式传 tags
print(p1, p2, p1 == Point(1, 2))  # == 由 dataclass 自动生成，按字段比较
\`\`\`
- 自动 \`__init__\`、\`__repr__\`、\`__eq__\`：\`p1 == Point(1,2)\` 为 True（按字段比较）。

\`\`\`python
from dataclasses import dataclass
@dataclass(frozen=True)            # frozen=True：实例不可变，可 hash
class Color:
    r: int; g: int; b: int
red = Color(255, 0, 0)
print(red, hash(red))             # 不可变所以能 hash，可作 dict key / set 元素
\`\`\`
- frozen 不可变，自动生成 \`__hash__\`，可哈希。

\`\`\`python
class Circle:
    def __init__(self, radius): self._radius = radius   # 半径存为私有 _radius
    @property
    def radius(self): return self._radius        # 读 radius
    @radius.setter
    def radius(self, value):
        if value < 0: raise ValueError("radius 不能为负")   # 写入校验非负
        self._radius = value
    @property
    def area(self): return 3.14159 * self._radius ** 2   # 派生属性：由 radius 计算面积，只读
\`\`\`
- \`_radius\` 私有存储；\`radius\` property 带校验；\`area\` 计算属性只读。

\`\`\`python
c = Circle(2)
print("area:", c.area)   # 12.566
c.radius = 5             # 走 setter
print("new area:", c.area)
\`\`\`
- 演示属性读写与计算。

\`\`\`python
from dataclasses import field
from dataclasses import dataclass
@dataclass
class User:
    name: str
    _age: int = field(repr=False)         # repr 不显示，保护隐私
    @property
    def age(self): return self._age       # 对外暴露 age（只读）
    @age.setter
    def age(self, value):
        if value < 0: raise ValueError("age 不能为负")   # 写入校验
        self._age = value
u = User("alice", 30)
print(u, u.age)                           # u 走 repr（不含 _age），u.age 走 property
\`\`\`
- dataclass + property：构造写 \`_age\`，外部用 \`u.age\` 受校验控制。

## 七、易错点小结

| 易错点 | 错误写法 | 正确写法 | 原因 |
| --- | --- | --- | --- |
| 可变默认值 | \`tags: list = []\` | \`field(default_factory=list)\` | 默认参数只求值一次 |
| 字段顺序 | 可选字段在前必填在后 | 必填在前、可选在后 | 与函数参数规则一致 |
| frozen 改值 | \`red.r = 0\` | 重新构造 \`Color(0,0,0)\` | 不可变禁止赋值 |
| property 名与字段冲突 | \`age\` 字段 + \`age\` property | 字段用 \`_age\`，property 用 \`age\` | 同名递归/覆盖 |
| 忘记 \`@xxx.setter\` | 只写 getter 还想赋值 | 加 setter | 只读 property 赋值报错 |
| frozen=False 想哈希 | \`hash(p)\` | 设 \`frozen=True\` 或自定义 \`__hash__\` | 默认可变对象不可哈希 |
| ClassVar 当字段 | \`counter: int = 0\`（想当类变量） | \`counter: ClassVar[int] = 0\` | 否则会被当成实例字段 |
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