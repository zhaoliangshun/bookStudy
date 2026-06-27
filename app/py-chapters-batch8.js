// =============================================================
// Python 交互式教程 - 第 8 批章节（高级特性与工程）
// -------------------------------------------------------------
// 本文件包含以下章节（group 统一为「高级特性与工程」）：
//   1. py-metaclass            — 元类与类创建机制        🏗️
//   2. py-descriptor           — 描述符协议              🔧
//   3. py-context-manager      — 上下文管理器深入        🚪
//   4. py-typing-mypy          — 类型注解与静态检查      🏷️
//   5. py-testing              — 测试与调试              🧪
//   6. py-packaging-distribution — 打包与发布            📤
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（统一为「高级特性与工程」）
//   content : Markdown 格式的详细讲解（文字量大，含大量示例）
//   code    : 可运行的 Python 代码（python3 直接执行，print 输出）
//
// 注意事项：
//   - 所有注释和讲解使用简体中文
//   - content 内代码块用 \`\`\`python 标记，行内代码用 \` 标记
//   - code 字段为纯 Python 代码，不含反引号与 ${ 字符
//   - mypy 章仅演示注解写法，不调用 mypy
//   - 打包章仅演示 pyproject.toml 配置，不真正执行打包
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：元类与类创建机制
  // =========================================================
  {
    id: "py-metaclass",
    group: "高级特性与工程",
    icon: "🏗️",
    title: "元类与类创建机制",
    content: `# 元类与类创建机制

在 Python 中，「类」本身也是对象——它是「元类（metaclass）」的实例。绝大多数时候你不需要关心元类，因为 Python 默认用 \`type\` 作为所有类的元类。但当你需要「控制类的创建过程」时，元类就成了最强大的工具之一：它能让你在类被定义的那一刻，自动修改它、注册它、校验它。

本章会从 \`type\` 这个「既是类也是元类」的奇特对象讲起，一步步揭示 Python 创建类的完整流程，然后介绍自定义元类、\`__init_subclass__\` 钩子、抽象基类（ABC），最后对比元类、类装饰器、\`__init_subclass__\` 三者的选型。

理解元类的前提是先理解一个事实：**在 Python 中，一切皆对象，而类不过是「能产生实例的对象」**。既然类是对象，那它是被谁「生产」出来的？答案就是元类。

---

## 一、type 既是类也是元类

### 1.1 type 的双重身份

\`type\` 是 Python 里最特殊的内置对象之一。它有两种用法：

1. **单参数形式** \`type(obj)\`：返回对象 \`obj\` 的类型（也就是它的类）。这和 \`obj.__class__\` 等价。
2. **三参数形式** \`type(name, bases, dict)\`：动态创建一个新类。这时 \`type\` 扮演的是「元类」角色。

\`\`\`python
# 用法一：查类型
print(type(42))        # <class 'int'>
print(type("hello"))   # <class 'str'>
print(type([1,2,3]))   # <class 'list'>

class Foo:
    pass

f = Foo()
print(type(f))    # <class '__main__.Foo'>
print(type(Foo))  # <class 'type'>   ← 注意这一行
\`\`\`

注意最后一行：\`type(Foo)\` 是 \`<class 'type'>\`。也就是说，**类 \`Foo\` 本身是 \`type\` 的实例**。这就是「元类」的含义——\`type\` 是「用来创建类的类」。

### 1.2 类是 type 的实例

这个认知非常关键，请反复确认：

- \`42\` 是 \`int\` 的实例
- \`"hi"\` 是 \`str\` 的实例
- \`f\` 是 \`Foo\` 的实例
- \`Foo\`（类本身）是 \`type\` 的实例

所以 \`type\` 是「类的类」，即**元类**。所有用 \`class\` 关键字定义的类，默认都是由 \`type\` 实例化而来的。

\`\`\`python
class Bar:
    x = 1

# Bar 这个类对象，是 type 的一个实例
print(isinstance(Bar, type))   # True

# 而 Bar 的实例 b，是 Bar 的实例，不是 type 的实例
b = Bar()
print(isinstance(b, type))     # False
print(isinstance(b, Bar))      # True
\`\`\`

### 1.3 链条的顶端

如果你顺着「谁的实例」往上追：

\`\`\`python
print(type(42))       # int
print(type(int))      # type
print(type(type))     # type   ← type 是自己的实例！

print(type.__class__) # type
\`\`\`

\`type\` 是「类型链条的顶端」：\`type(type)\` 还是 \`type\`。这是 Python 类型系统的一个自洽设计（self-referential）。你不需要深究为什么，记住这个事实即可。

---

## 二、type(name, bases, dict) 动态创建类

### 2.1 三参数 type 的语法

\`type(name, bases, dict)\` 三个参数分别是：

- \`name\`：类名（字符串）
- \`bases\`：父类元组（要继承哪些类）
- \`dict\`：类的命名空间字典（属性和方法）

它等价于用 \`class\` 关键字定义一个类。

\`\`\`python
# 用 class 关键字定义
class Dog1:
    species = "Canis lupus"
    def bark(self):
        return "Woof!"

# 用 type 动态创建一个完全等价的类
Dog2 = type(
    "Dog2",
    (object,),                # 父类元组
    {
        "species": "Canis lupus",
        "bark": lambda self: "Woof!",
    },
)

d1 = Dog1()
d2 = Dog2()
print(d1.bark(), d1.species)   # Woof! Canis lupus
print(d2.bark(), d2.species)   # Woof! Canis lupus
print(type(Dog2))              # <class 'type'>
print(d2.__class__.__name__)   # Dog2
\`\`\`

这两种写法在运行时产生的类对象几乎一模一样。区别只在于：\`class\` 语句是「语法糖」，编译器会把它翻译成对元类的调用；而 \`type(...)\` 是「显式」调用。

### 2.2 为什么要动态创建类

动态创建类在以下场景很有用：

- **根据配置/数据生成类**：比如 ORM 根据数据库表结构生成 Model 类。
- **工厂模式**：根据参数决定创建哪种类。
- **元编程框架**：Django、SQLAlchemy、dataclasses 等都大量用到。

\`\`\`python
def make_counter_class(start=0):
    # 根据参数动态生成一个计数器类
    def init(self):
        self.value = start
    def inc(self):
        self.value += 1
        return self.value
    def get(self):
        return self.value
    return type("Counter", (object,), {
        "__init__": init,
        "increment": inc,
        "value_of": get,
    })

CounterFrom10 = make_counter_class(10)
c = CounterFrom10()
print(c.value_of())    # 10
print(c.increment())   # 11
print(c.increment())   # 12
\`\`\`

### 2.3 class 语句的本质

当你写：

\`\`\`python
class MyClass(Base):
    x = 1
    def f(self): pass
\`\`\`

Python 解释器大致做了这样的事（伪代码）：

\`\`\`python
# 1. 确定元类（默认是 type，可由 metaclass= 指定，或继承自父类的元类）
metaclass = type

# 2. 收集类的命名空间（执行类体，把 x、f 放进一个字典）
namespace = {}
# ... 执行类体，填充 namespace ...
namespace["x"] = 1
namespace["f"] = ...

# 3. 调用元类来创建类对象
MyClass = metaclass("MyClass", (Base,), namespace)
\`\`\`

所以**「定义类」=「调用元类」**。元类就是那个被调用来生产类对象的「可调用对象」。这也意味着，如果你替换了元类，你就能拦截、修改整个类的创建过程。

---

## 三、类创建过程详解

### 3.1 完整的创建顺序

当你定义一个子类时，Python 的类创建过程比想象中复杂。完整步骤如下：

1. **确定元类**：
   - 如果类声明了 \`metaclass=Foo\`，用 \`Foo\`。
   - 否则，看父类们：如果父类们有元类，且存在继承关系，用最派生的那个元类。
   - 否则用 \`type\`。

2. **准备命名空间**：调用元类的 \`__prepare__\` 方法，返回一个「命名空间映射」（默认是普通 dict，但可以自定义，比如用有序字典或支持属性访问的 dict）。

3. **执行类体**：在准备的命名空间里执行类的代码，所有赋值和函数定义都进入这个命名空间。

4. **调用 \`__init_subclass__\`**：在父类上调用 \`__init_subclass__\`（这是父类对「有子类被创建」的钩子）。

5. **调用元类的 \`__new__\`**：真正创建类对象。

6. **调用元类的 \`__init__\`**：对刚创建的类对象做初始化。

### 3.2 __init_subclass__ 钩子

\`__init_subclass__\` 是一个在**父类**上定义的类方法，每当有子类被创建时，Python 会自动调用它，把子类的命名空间传给它。这是一个「轻量级元类替代方案」。

\`\`\`python
class PluginBase:
    registry = []
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        # 每当有人继承 PluginBase，就自动注册
        PluginBase.registry.append(cls.__name__)
        print("注册插件:", cls.__name__)

class AuthPlugin(PluginBase):
    pass

class CachePlugin(PluginBase):
    pass

print("已注册:", PluginBase.registry)
# 输出：
# 注册插件: AuthPlugin
# 注册插件: CachePlugin
# 已注册: ['AuthPlugin', 'CachePlugin']
\`\`\`

注意 \`__init_subclass__\` 的第一个参数是 \`cls\`（被创建的子类），并且要 \`super().__init_subclass__(**kwargs)\` 以保证继承链上其他类的钩子也被调用。

\`__init_subclass__\` 还能接收「类关键字参数」，让你在继承时传配置：

\`\`\`python
class Tagged:
    def __init_subclass__(cls, tag=None, **kwargs):
        super().__init_subclass__(**kwargs)
        cls.tag = tag

class RedItem(Tagged, tag="red"):
    pass

class BlueItem(Tagged, tag="blue"):
    pass

print(RedItem.tag)    # red
print(BlueItem.tag)   # blue
\`\`\`

这是非常优雅的 API 设计方式，比元类简单得多。

### 3.3 metaclass.__new__ 与 __init__

自定义元类时，你主要重写 \`__new__\` 和 \`__init__\`：

- \`__new__(mcs, name, bases, namespace)\`：创建并返回类对象。在这里你可以修改 \`name\`、\`bases\`、\`namespace\`，甚至拒绝创建（返回 None 或抛异常）。
- \`__init__(cls, name, bases, namespace)\`：对已创建的类对象做后处理。注意第一个参数是 \`cls\`（刚创建的类），不是 \`mcs\`。

通常重写 \`__new__\` 就够了。\`__init__\` 用得较少，因为多数修改在 \`__new__\` 里就能完成。

\`\`\`python
class Meta(type):
    def __new__(mcs, name, bases, namespace, **kwargs):
        print("Meta.__new__ 被调用，正在创建类:", name)
        print("  命名空间里的名字:", list(namespace.keys()))
        # 可以在这里修改 namespace，比如强制所有方法名小写
        cls = super().__new__(mcs, name, bases, namespace, **kwargs)
        return cls

    def __init__(cls, name, bases, namespace, **kwargs):
        print("Meta.__init__ 被调用，类", name, "已创建")
        super().__init__(name, bases, namespace, **kwargs)

class MyClass(metaclass=Meta):
    x = 1
    def hello(self):
        return "hi"

# 输出：
# Meta.__new__ 被调用，正在创建类: MyClass
#   命名空间里的名字: ['__module__', '__qualname__', 'x', 'hello']
# Meta.__init__ 被调用，类 MyClass 已创建
\`\`\`

### 3.4 __new__ vs __init__ 的分工

在普通类中，\`__new__\` 负责创建实例（分配内存），\`__init__\` 负责初始化实例。元类里同理：

- \`__new__\` 创建「类对象」（类的实例是类）
- \`__init__\` 初始化「类对象」

一个常见误区：在元类的 \`__init__\` 里修改 \`namespace\` 是没用的，因为类已经创建好了。要修改属性必须在 \`__new__\` 里改 \`namespace\`，或者在 \`__init__\` 里直接 \`setattr(cls, ...)\`。

\`\`\`python
class Meta2(type):
    def __new__(mcs, name, bases, namespace, **kwargs):
        # 在创建前注入一个属性
        namespace["injected"] = "来自元类"
        return super().__new__(mcs, name, bases, namespace, **kwargs)

class C(metaclass=Meta2):
    pass

print(C.injected)   # 来自元类
\`\`\`

---

## 四、自定义元类

### 4.1 最简单的自定义元类

自定义元类就是继承 \`type\`：

\`\`\`python
class MyMeta(type):
    pass

class Something(metaclass=MyMeta):
    pass

print(type(Something))   # <class '__main__.MyMeta'>
print(isinstance(Something, type))   # True
\`\`\`

现在 \`Something\` 是由 \`MyMeta\` 创建的，而不是 \`type\`。但因为我们没重写任何方法，行为和普通类一样。

### 4.2 metaclass 参数

在 \`class\` 语句里用 \`metaclass=XXX\` 指定元类：

\`\`\`python
class LoggedMeta(type):
    def __new__(mcs, name, bases, namespace):
        print(f"[metaclass] 正在创建类 {name}")
        return super().__new__(mcs, name, bases, namespace)

class ServiceA(metaclass=LoggedMeta):
    pass

class ServiceB(metaclass=LoggedMeta):
    pass
\`\`\`

注意：元类的选择有继承规则。如果父类用了自定义元类，子类会自动继承这个元类（只要不冲突）。

\`\`\`python
class Base(metaclass=LoggedMeta):
    pass

class Child(Base):   # 不用再写 metaclass=，自动继承 LoggedMeta
    pass
# 依然会打印 [metaclass] 正在创建类 Child
\`\`\`

### 4.3 元类应用一：自动注册

元类最常见的用途之一是「插件自动注册」。每当有人定义一个继承基类的子类，就自动把它登记到注册表里，无需手动调用注册函数。

\`\`\`python
class PluginMeta(type):
    registry = {}
    def __new__(mcs, name, bases, namespace):
        cls = super().__new__(mcs, name, bases, namespace)
        # 跳过基类本身（没有实质父类时）
        if bases:   # 有父类，说明是个具体插件
            PluginMeta.registry[name] = cls
        return cls

class Plugin(metaclass=PluginMeta):
    """所有插件的基类"""
    def run(self):
        raise NotImplementedError

class HelloPlugin(Plugin):
    def run(self):
        return "hello"

class ByePlugin(Plugin):
    def run(self):
        return "bye"

print("注册表:", list(PluginMeta.registry.keys()))
# 注册表: ['HelloPlugin', 'ByePlugin']

# 按名字取出并调用
for name, cls in PluginMeta.registry.items():
    print(name, "->", cls().run())
\`\`\`

这种模式在 Django 的 Model、Flask 的视图、各种插件系统里非常常见。优点是「定义即注册」，使用者完全不用记得调用注册函数。

### 4.4 元类应用二：接口校验

元类可以在类创建时校验「子类是否实现了必需的方法」，把运行时错误提前到「类定义时」。

\`\`\`python
class InterfaceMeta(type):
    required_methods = []
    def __new__(mcs, name, bases, namespace):
        cls = super().__new__(mcs, name, bases, namespace)
        # 基类自己不校验
        if not bases:
            return cls
        # 检查必需方法是否都已实现
        missing = [m for m in mcs.required_methods if m not in namespace]
        if missing:
            raise TypeError(
                f"类 {name} 必须实现这些方法: {missing}"
            )
        return cls

class Storage(metaclass=InterfaceMeta):
    required_methods = ["save", "load"]
    # 基类，不实现

class FileStorage(Storage):
    def save(self, data): return "saved to file"
    def load(self): return "loaded from file"

# 下面这个会直接报错（取消注释试试）：
# class BadStorage(Storage):
#     def save(self, data): pass
# TypeError: 类 BadStorage 必须实现这些方法: ['load']
\`\`\`

这就是「接口」的一种实现方式。错误在「定义类的瞬间」就被发现，而不是等到运行时调用才发现少了个方法。

### 4.5 元类应用三：属性拦截与改写

元类可以扫描类的命名空间，对特定属性做改写。比如把所有大写常量收集起来，或给所有方法自动加日志。

\`\`\`python
class ConstCollectorMeta(type):
    def __new__(mcs, name, bases, namespace):
        consts = {}
        # 找出所有全大写的属性
        for key, val in list(namespace.items()):
            if key.isupper() and isinstance(val, (int, float, str)):
                consts[key] = val
        cls = super().__new__(mcs, name, bases, namespace)
        cls._consts = consts
        return cls

class Config(metaclass=ConstCollectorMeta):
    MAX_RETRIES = 5
    TIMEOUT = 30
    APP_NAME = "MyApp"
    def helper(self):
        pass

print(Config._consts)
# {'MAX_RETRIES': 5, 'TIMEOUT': 30, 'APP_NAME': 'MyApp'}
\`\`\`

ORM 框架就是这样工作的：你在 Model 类里声明一堆 \`Field\` 对象，元类在创建类时把它们收集起来，生成对应的表结构和查询方法。

---

## 五、__init_subclass__ 钩子（更简单的替代）

### 5.1 为什么优先用 __init_subclass__

前面看到，元类能做自动注册、接口校验等。但元类有个缺点：**复杂、难调试、有继承冲突问题**。Python 3.6 引入的 \`__init_subclass__\` 能覆盖大部分「在子类创建时做点事」的需求，而且简单得多。

对比：

| 需求 | 元类方案 | __init_subclass__ 方案 |
|------|---------|----------------------|
| 自动注册 | 重写 __new__ | 在 __init_subclass__ 里 append |
| 接口校验 | 重写 __new__ 检查 namespace | 在 __init_subclass__ 里检查 hasattr |
| 接收配置 | metaclass=Meta(**kw) | class Sub(Base, kw=...) |
| 修改属性 | 在 __new__ 改 namespace | 在 __init_subclass__ 里 setattr |

\`\`\`python
# 用 __init_subclass__ 实现自动注册（对比上面的元类版本）
class Plugin:
    registry = []
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        Plugin.registry.append(cls.__name__)

class A(Plugin): pass
class B(Plugin): pass
print(Plugin.registry)   # ['A', 'B']
\`\`\`

代码量少了一半，而且没有「元类冲突」问题（多个基类用了不同元类时会报错）。

### 5.2 __init_subclass__ 的局限

\`__init_subclass__\` 也有做不到的事：

- 它**不能修改类的命名空间**（在它被调用时，类已经创建好了，namespace 已经定型）。你只能在它里面 \`setattr\` 添加属性，但不能「删除」或「改写」类体里定义的东西。
- 它**不能阻止类的创建**（虽然可以抛异常，但类对象其实已经生成了）。
- 它**不能改变类的基础结构**（比如换基类、加 mixin）。

这些「更底层」的操作还得靠元类。所以选型原则是：**能用 \`__init_subclass__\` 就别用元类**。

---

## 六、abc.ABCMeta 抽象基类

### 6.1 什么是抽象基类

抽象基类（Abstract Base Class，ABC）是一种「不能被实例化、要求子类必须实现某些方法」的类。它用来定义「接口契约」。\`abc\` 模块提供了对 ABC 的支持，而 \`ABC\` / \`ABCMeta\` 的底层正是基于元类实现的。

\`\`\`python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        ...

    @abstractmethod
    def perimeter(self):
        ...

# Shape()  # 会报错：Can't instantiate abstract class
class Circle(Shape):
    def __init__(self, r): self.r = r
    def area(self): return 3.14 * self.r * self.r
    def perimeter(self): return 2 * 3.14 * self.r

c = Circle(2)
print(c.area(), c.perimeter())
\`\`\`

如果子类没实现某个 \`@abstractmethod\` 方法，实例化时会报错。

### 6.2 ABCMeta 元类

\`ABC\` 其实就是 \`class ABC(metaclass=ABCMeta)\`。如果你想让自己的基类同时有自定义元类和 ABC 功能，可以直接用 \`ABCMeta\`：

\`\`\`python
from abc import ABCMeta, abstractmethod

class Animal(metaclass=ABCMeta):
    @abstractmethod
    def sound(self):
        pass

class Dog(Animal):
    def sound(self): return "汪汪"

print(Dog().sound())   # 汪汪
\`\`\`

### 6.3 abstractmethod 与 abstractproperty

\`@abstractmethod\` 标记的方法必须被子类实现。\`@abstractproperty\`（或 \`@property + @abstractmethod\`）标记的属性同理。

\`\`\`python
from abc import ABC, abstractmethod

class ConfigSource(ABC):
    @property
    @abstractmethod
    def data(self):
        """子类必须提供一个 data 属性"""

class DictConfig(ConfigSource):
    def __init__(self, d):
        self._d = d
    @property
    def data(self):
        return self._d

cfg = DictConfig({"x": 1})
print(cfg.data)   # {'x': 1}
\`\`\`

注意装饰器顺序：\`@property\` 在上，\`@abstractmethod\` 在下。

### 6.4 register 注册虚拟子类

ABC 有个强大的功能：\`register\`。它能让一个类「声明自己是某个 ABC 的虚拟子类」，而不需要真正继承。这样 \`isinstance\` 检查会通过，但 ABC 不会要求它实现任何方法。

\`\`\`python
from abc import ABC

class MyList(ABC):
    pass

# list 没有继承 MyList，但我们声明它是 MyList 的虚拟子类
MyList.register(list)

print(isinstance([1,2,3], MyList))   # True
print(issubclass(list, MyList))      # True
\`\`\`

标准库里大量用了这个：\`collections.abc\` 里，\`list\` 是 \`Sequence\` 的虚拟子类，\`dict\` 是 \`Mapping\` 的虚拟子类，等等。这让「鸭子类型」和「类型检查」能共存——只要行为像序列，\`isinstance(x, Sequence)\` 就为 True，哪怕没继承。

\`\`\`python
from collections.abc import Sequence, Mapping

print(isinstance([1,2], Sequence))   # True
print(isinstance({"a":1}, Mapping))  # True
print(isinstance("abc", Sequence))   # True（str 也是序列）
\`\`\`

---

## 七、元类 vs 类装饰器 vs __init_subclass__ 选型

这三者都能「在类定义时做手脚」，怎么选？

### 7.1 类装饰器

类装饰器是「类定义完后，把类传给一个函数」。它能修改类、返回新类、甚至返回完全不同的对象。

\`\`\`python
def add_version(cls):
    cls.version = "1.0"
    return cls

@add_version
class App:
    pass

print(App.version)   # 1.0
\`\`\`

类装饰器的优点：**简单、显式、无继承副作用**。缺点：**子类不会自动应用**（装饰器只作用在直接被装饰的类上，继承它的子类不会触发）。

### 7.2 三者对比表

| 特性 | 元类 | __init_subclass__ | 类装饰器 |
|------|------|------------------|---------|
| 触发时机 | 创建类对象时 | 子类创建时 | 类定义完之后 |
| 能否改命名空间 | 能 | 不能 | 不能（只能 setattr） |
| 是否对子类生效 | 是（继承元类） | 是 | 否 |
| 复杂度 | 高 | 中 | 低 |
| 多重继承冲突 | 可能（元类冲突） | 不会 | 不会 |
| 典型用途 | ORM、框架底层 | 插件注册、钩子 | 简单增强 |

### 7.3 选型建议

1. **简单增强（加属性、加方法）**：用类装饰器。
2. **需要子类也生效的钩子（注册、校验）**：优先用 \`__init_subclass__\`。
3. **需要修改命名空间、控制类结构、做框架级元编程**：才用元类。

Python 之禅说「元类是 99% 用户永远不需要深究的魔法」。能用简单方案就别上元类，这是工程上的明智选择。

\`\`\`python
# 同一个「自动注册」需求的三种实现对比

# 方案 A：类装饰器（子类不自动注册，需手动装饰）
_registered = []
def register(cls):
    _registered.append(cls.__name__)
    return cls

@register
class PluginA: pass
# PluginA 的子类不会自动注册

# 方案 B：__init_subclass__（推荐，子类自动注册）
class PluginB:
    subs = []
    def __init_subclass__(cls, **kw):
        super().__init_subclass__(**kw)
        PluginB.subs.append(cls.__name__)

class Sub1(PluginB): pass
class Sub2(PluginB): pass

# 方案 C：元类（子类自动注册，但更重）
class PluginCMeta(type):
    subs = []
    def __new__(mcs, name, bases, ns):
        cls = super().__new__(mcs, name, bases, ns)
        if bases:
            PluginCMeta.subs.append(name)
        return cls

class PluginC(metaclass=PluginCMeta): pass
class Sub3(PluginC): pass

print("B 方案子类:", PluginB.subs)
print("C 方案子类:", PluginCMeta.subs)
\`\`\`

---

## 八、常见陷阱与最佳实践

### 8.1 元类冲突

如果两个基类用了不同的元类，且元类之间没有继承关系，Python 会报「元类冲突」：

\`\`\`python
class MetaA(type): pass
class MetaB(type): pass
class A(metaclass=MetaA): pass
class B(metaclass=MetaB): pass
# class C(A, B): pass   # metaclass conflict
\`\`\`

解决办法是让其中一个元类继承另一个，或者写一个「联合元类」继承两者。

### 8.2 __prepare__ 自定义命名空间

元类的 \`__prepare__\` 方法返回类体的命名空间容器。默认是 \`dict\`，但你可以返回任意 Mapping，比如用 \`collections.OrderedDict\`（3.7+ dict 本身有序，但自定义映射能支持更多功能）。

\`\`\`python
class AttrDict(dict):
    """支持用属性访问的命名空间"""
    def __getattr__(self, name):
        return self[name]

class MyMeta(type):
    @classmethod
    def __prepare__(mcs, name, bases, **kwargs):
        return AttrDict()
    def __new__(mcs, name, bases, namespace, **kwargs):
        return super().__new__(mcs, name, bases, dict(namespace))

class X(metaclass=MyMeta):
    a = 1
    b = 2
\`\`\`

### 8.3 不要滥用元类

元类会让代码难以理解、难以调试、难以类型检查。在动手写元类前，先问自己：

- 类装饰器能做到吗？
- \`__init_subclass__\` 能做到吗？
- 普通的 \`__init__\` / 工厂函数能做到吗？

只有当以上都不行，且你确实需要「在类创建这一刻介入」时，才用元类。

---

## 九、小结

- \`type\` 既是「查类型的函数」，也是「所有类的元类」。\`type(name, bases, dict)\` 能动态创建类。
- 类创建过程：确定元类 → \`__prepare__\` 准备命名空间 → 执行类体 → \`__init_subclass__\` → 元类 \`__new__\` → 元类 \`__init__\`。
- 自定义元类继承 \`type\`，重写 \`__new__\` 来拦截类创建。应用：自动注册、接口校验、属性改写。
- \`__init_subclass__\` 是更简单的钩子，能覆盖大部分「子类创建时做事」的需求，优先使用。
- \`abc.ABC\` / \`ABCMeta\` + \`@abstractmethod\` 实现抽象基类；\`register\` 注册虚拟子类。
- 选型：简单增强用类装饰器，子类钩子用 \`__init_subclass__\`，框架级元编程才用元类。

掌握元类意味着你理解了 Python「类是如何诞生」的底层机制。即便日常很少写元类，这份理解也会让你在阅读框架源码（Django ORM、SQLAlchemy、dataclasses）时游刃有余。
`,
    code: `# =============================================================
# 第一章：元类与类创建机制 - 可运行示例
# =============================================================

print("=" * 60)
print("1. type 的双重身份")
print("=" * 60)

# 单参数 type：查类型
print("type(42)      =", type(42))
print("type('hello') =", type("hello"))
print("type([1,2,3]) =", type([1, 2, 3]))

class Foo:
    pass

f = Foo()
print("type(f)       =", type(f))
print("type(Foo)     =", type(Foo))   # <class 'type'>
print("type(type)    =", type(type))  # type 是自己的实例

# isinstance 验证
print("isinstance(Foo, type) =", isinstance(Foo, type))
print("isinstance(f, type)   =", isinstance(f, type))
print("isinstance(f, Foo)    =", isinstance(f, Foo))

print()
print("=" * 60)
print("2. type(name, bases, dict) 动态创建类")
print("=" * 60)

# 用 class 关键字
class Dog1:
    species = "Canis lupus"
    def bark(self):
        return "Woof!"

# 用 type 动态创建等价的类
Dog2 = type(
    "Dog2",
    (object,),
    {
        "species": "Canis lupus",
        "bark": lambda self: "Woof!",
    },
)

d1 = Dog1()
d2 = Dog2()
print("Dog1:", d1.bark(), "/", d1.species)
print("Dog2:", d2.bark(), "/", d2.species)
print("Dog2 的类名:", Dog2.__name__)
print("type(Dog2):", type(Dog2))

# 根据参数动态生成类
def make_counter_class(start=0):
    def init(self):
        self.value = start
    def inc(self):
        self.value += 1
        return self.value
    def get(self):
        return self.value
    return type("Counter", (object,), {
        "__init__": init,
        "increment": inc,
        "value_of": get,
    })

CounterFrom10 = make_counter_class(10)
c = CounterFrom10()
print("动态计数器:")
print("  初始值:", c.value_of())
print("  +1:", c.increment())
print("  +1:", c.increment())
print("  +1:", c.increment())

print()
print("=" * 60)
print("3. __init_subclass__ 钩子")
print("=" * 60)

class PluginBase:
    registry = []
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        PluginBase.registry.append(cls.__name__)
        print("  [钩子] 注册插件:", cls.__name__)

print("定义 AuthPlugin...")
class AuthPlugin(PluginBase):
    pass

print("定义 CachePlugin...")
class CachePlugin(PluginBase):
    pass

print("已注册:", PluginBase.registry)

# __init_subclass__ 接收关键字参数
class Tagged:
    def __init_subclass__(cls, tag=None, **kwargs):
        super().__init_subclass__(**kwargs)
        cls.tag = tag

class RedItem(Tagged, tag="red"):
    pass

class BlueItem(Tagged, tag="blue"):
    pass

print("RedItem.tag =", RedItem.tag)
print("BlueItem.tag =", BlueItem.tag)

print()
print("=" * 60)
print("4. 自定义元类 - __new__ 与 __init__")
print("=" * 60)

class Meta(type):
    def __new__(mcs, name, bases, namespace, **kwargs):
        print("  Meta.__new__ 创建类:", name)
        print("    命名空间键:", [k for k in namespace.keys() if not k.startswith("__")])
        cls = super().__new__(mcs, name, bases, namespace, **kwargs)
        return cls

    def __init__(cls, name, bases, namespace, **kwargs):
        print("  Meta.__init__ 初始化类:", name)
        super().__init__(name, bases, namespace, **kwargs)

print("定义 MyClass(metaclass=Meta)...")
class MyClass(metaclass=Meta):
    x = 1
    def hello(self):
        return "hi"

print("MyClass.x =", MyClass.x)

# 在 __new__ 里注入属性
class InjectMeta(type):
    def __new__(mcs, name, bases, namespace, **kwargs):
        namespace["injected"] = "来自元类的注入"
        return super().__new__(mcs, name, bases, namespace, **kwargs)

class C(metaclass=InjectMeta):
    pass

print("C.injected =", C.injected)

print()
print("=" * 60)
print("5. 元类应用一：自动注册")
print("=" * 60)

class PluginMeta(type):
    registry = {}
    def __new__(mcs, name, bases, namespace):
        cls = super().__new__(mcs, name, bases, namespace)
        if bases:
            PluginMeta.registry[name] = cls
            print("  [元类] 自动注册:", name)
        return cls

class Plugin(metaclass=PluginMeta):
    """插件基类"""
    def run(self):
        raise NotImplementedError

class HelloPlugin(Plugin):
    def run(self):
        return "hello"

class ByePlugin(Plugin):
    def run(self):
        return "bye"

print("注册表:", list(PluginMeta.registry.keys()))
print("逐个调用:")
for name, cls in PluginMeta.registry.items():
    print(" ", name, "->", cls().run())

print()
print("=" * 60)
print("6. 元类应用二：接口校验")
print("=" * 60)

class InterfaceMeta(type):
    required = []
    def __new__(mcs, name, bases, namespace):
        cls = super().__new__(mcs, name, bases, namespace)
        if not bases:
            return cls
        missing = [m for m in mcs.required if m not in namespace]
        if missing:
            raise TypeError("类 " + name + " 缺少方法: " + str(missing))
        print("  [元类] 类", name, "通过接口校验")
        return cls

class Storage(metaclass=InterfaceMeta):
    required = ["save", "load"]

class FileStorage(Storage):
    def save(self, data):
        return "saved: " + str(data)
    def load(self):
        return "loaded from file"

# 演示一个会失败的校验
print("尝试定义一个不完整的实现（捕获异常）:")
try:
    class BadStorage(Storage):
        def save(self, data):
            pass
except TypeError as e:
    print("  捕获到预期错误:", e)

fs = FileStorage()
print("FileStorage.save:", fs.save("data1"))
print("FileStorage.load:", fs.load())

print()
print("=" * 60)
print("7. 元类应用三：属性收集")
print("=" * 60)

class ConstCollectorMeta(type):
    def __new__(mcs, name, bases, namespace):
        consts = {}
        for key, val in list(namespace.items()):
            if key.isupper() and isinstance(val, (int, float, str)):
                consts[key] = val
        cls = super().__new__(mcs, name, bases, namespace)
        cls._consts = consts
        return cls

class Config(metaclass=ConstCollectorMeta):
    MAX_RETRIES = 5
    TIMEOUT = 30
    APP_NAME = "MyApp"
    VERSION = "1.0.0"
    def helper(self):
        pass

print("Config 收集到的常量:")
for k, v in Config._consts.items():
    print("  ", k, "=", v)

print()
print("=" * 60)
print("8. 抽象基类 ABC")
print("=" * 60)

from abc import ABC, abstractmethod, ABCMeta

class Shape(ABC):
    @abstractmethod
    def area(self):
        ...

    @abstractmethod
    def perimeter(self):
        ...

print("尝试实例化抽象类 Shape:")
try:
    s = Shape()
except TypeError as e:
    print("  捕获到预期错误:", e)

class Circle(Shape):
    def __init__(self, r):
        self.r = r
    def area(self):
        return 3.14159 * self.r * self.r
    def perimeter(self):
        return 2 * 3.14159 * self.r

class Rectangle(Shape):
    def __init__(self, w, h):
        self.w = w
        self.h = h
    def area(self):
        return self.w * self.h
    def perimeter(self):
        return 2 * (self.w + self.h)

shapes = [Circle(2), Rectangle(3, 4)]
for s in shapes:
    print("  ", type(s).__name__, "面积=%.2f" % s.area(), "周长=%.2f" % s.perimeter())

# abstractproperty
class ConfigSource(ABC):
    @property
    @abstractmethod
    def data(self):
        ...

class DictConfig(ConfigSource):
    def __init__(self, d):
        self._d = d
    @property
    def data(self):
        return self._d

cfg = DictConfig({"x": 1, "y": 2})
print("DictConfig.data =", cfg.data)

print()
print("=" * 60)
print("9. register 注册虚拟子类")
print("=" * 60)

class MyList(ABC):
    pass

MyList.register(list)
print("isinstance([1,2,3], MyList) =", isinstance([1, 2, 3], MyList))
print("issubclass(list, MyList)     =", issubclass(list, MyList))

from collections.abc import Sequence, Mapping, Iterable
print("isinstance([1,2], Sequence)  =", isinstance([1, 2], Sequence))
print("isinstance({1:2}, Mapping)   =", isinstance({1: 2}, Mapping))
print("isinstance('abc', Sequence)  =", isinstance("abc", Sequence))
print("isinstance(42, Iterable)     =", isinstance(42, Iterable))

print()
print("=" * 60)
print("10. ABCMeta 作为元类")
print("=" * 60)

class Animal(metaclass=ABCMeta):
    @abstractmethod
    def sound(self):
        pass
    @abstractmethod
    def legs(self):
        pass

class Dog(Animal):
    def sound(self):
        return "汪汪"
    def legs(self):
        return 4

class Spider(Animal):
    def sound(self):
        return "..."
    def legs(self):
        return 8

for a in [Dog(), Spider()]:
    print("  ", type(a).__name__, "叫:", a.sound(), "腿:", a.legs())

print()
print("=" * 60)
print("11. 元类 vs __init_subclass__ vs 类装饰器 对比")
print("=" * 60)

# 方案 A：类装饰器
_reg_a = []
def register_a(cls):
    _reg_a.append(cls.__name__)
    return cls

@register_a
class PluginA1:
    pass
@register_a
class PluginA2:
    pass
print("类装饰器方案:", _reg_a)

# 方案 B：__init_subclass__
class PluginB:
    subs = []
    def __init_subclass__(cls, **kw):
        super().__init_subclass__(**kw)
        PluginB.subs.append(cls.__name__)

class SubB1(PluginB): pass
class SubB2(PluginB): pass
class SubB3(PluginB): pass
print("__init_subclass__ 方案:", PluginB.subs)

# 方案 C：元类
class PluginCMeta(type):
    subs = []
    def __new__(mcs, name, bases, ns):
        cls = super().__new__(mcs, name, bases, ns)
        if bases:
            PluginCMeta.subs.append(name)
        return cls

class PluginC(metaclass=PluginCMeta):
    pass
class SubC1(PluginC): pass
class SubC2(PluginC): pass
print("元类方案:", PluginCMeta.subs)

print()
print("=" * 60)
print("12. __prepare__ 自定义命名空间")
print("=" * 60)

class AttrDict(dict):
    def __getattr__(self, name):
        return self[name]

class PrepMeta(type):
    @classmethod
    def __prepare__(mcs, name, bases, **kwargs):
        print("  __prepare__ 被调用，返回 AttrDict")
        return AttrDict()
    def __new__(mcs, name, bases, namespace, **kwargs):
        print("  收集到的属性:", {k: v for k, v in namespace.items() if not k.startswith("__")})
        return super().__new__(mcs, name, bases, dict(namespace))

class PrepClass(metaclass=PrepMeta):
    a = 1
    b = 2
    c = 3

print()
print("=" * 60)
print("13. 元类冲突演示")
print("=" * 60)

class MetaA(type):
    pass
class MetaB(type):
    pass
class A(metaclass=MetaA):
    pass
class B(metaclass=MetaB):
    pass

print("尝试多重继承两个不同元类的类:")
try:
    class C(A, B):
        pass
except TypeError as e:
    print("  捕获到元类冲突:", e)

# 解决方案：联合元类
class UnionMeta(MetaA, MetaB):
    pass

class D(A, B, metaclass=UnionMeta):
    pass
print("  用联合元类解决冲突:", type(D).__name__)

print()
print("=" * 60)
print("14. 综合实战：简易 ORM 模型")
print("=" * 60)

class Field:
    def __init__(self, column_type):
        self.column_type = column_type
        self.name = None
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, owner):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        obj.__dict__[self.name] = value

class ModelMeta(type):
    def __new__(mcs, name, bases, namespace):
        fields = {}
        for key, val in list(namespace.items()):
            if isinstance(val, Field):
                fields[key] = val
        cls = super().__new__(mcs, name, bases, namespace)
        cls._fields = fields
        if fields:
            print("  [ORM] 模型", name, "字段:", list(fields.keys()))
        return cls

class Model(metaclass=ModelMeta):
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)
    def __repr__(self):
        data = {k: getattr(self, k, None) for k in self._fields}
        return self.__class__.__name__ + "(" + str(data) + ")"

class User(Model):
    id = Field("INT")
    name = Field("VARCHAR")
    email = Field("VARCHAR")

class Post(Model):
    id = Field("INT")
    title = Field("VARCHAR")
    content = Field("TEXT")

u = User(id=1, name="Alice", email="alice@example.com")
p = Post(id=10, title="Hello", content="World")
print("  User:", u)
print("  Post:", p)
print("  User._fields:", list(User._fields.keys()))
print("  Post._fields:", list(Post._fields.keys()))

print()
print("=" * 60)
print("15. 综合实战：单例元类")
print("=" * 60)

class SingletonMeta(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in SingletonMeta._instances:
            print("    [Singleton] 首次创建", cls.__name__)
            SingletonMeta._instances[cls] = super().__call__(*args, **kwargs)
        else:
            print("    [Singleton] 返回已存在的", cls.__name__)
        return SingletonMeta._instances[cls]

class Database(metaclass=SingletonMeta):
    def __init__(self):
        self.connected = True
        print("    [Database] 建立连接...")

class Logger(metaclass=SingletonMeta):
    def __init__(self):
        self.count = 0
    def log(self, msg):
        self.count += 1
        print("    [log #" + str(self.count) + "]", msg)

print("第一次获取 Database:")
db1 = Database()
print("第二次获取 Database:")
db2 = Database()
print("db1 is db2:", db1 is db2)

log1 = Logger()
log1.log("启动")
log1.log("运行中")
log2 = Logger()
log2.log("结束")
print("log1 is log2:", log1 is log2)

print()
print("=" * 60)
print("16. 元类实现接口的完整校验链")
print("=" * 60)

class StrictInterface(type):
    def __new__(mcs, name, bases, namespace):
        cls = super().__new__(mcs, name, bases, namespace)
        if not hasattr(cls, "_required"):
            return cls
        if not bases or bases == (object,):
            return cls
        missing = []
        for method in cls._required:
            if not callable(getattr(cls, method, None)):
                missing.append(method)
        if missing:
            raise TypeError(name + " 缺少必需方法: " + str(missing))
        # 校验方法签名（简单版：检查参数个数）
        return cls

class Worker(metaclass=StrictInterface):
    _required = ["do_work", "get_status"]

class GoodWorker(Worker):
    def do_work(self, task):
        return "处理: " + task
    def get_status(self):
        return "idle"

print("GoodWorker 通过校验")
gw = GoodWorker()
print("  do_work:", gw.do_work("测试任务"))
print("  get_status:", gw.get_status())

print("尝试一个不完整的实现:")
try:
    class BadWorker(Worker):
        def do_work(self, task):
            return task
except TypeError as e:
    print("  捕获到预期错误:", e)

print()
print("=" * 60)
print("全部演示完成！")
print("=" * 60)
`,
  },

  // =========================================================
  // 第二章：描述符协议
  // =========================================================
  {
    id: "py-descriptor",
    group: "高级特性与工程",
    icon: "🔧",
    title: "描述符协议",
    content: `# 描述符协议

描述符（Descriptor）是 Python 中「属性访问」的底层机制。当你写 \`obj.x\` 时，Python 不只是简单地查字典——它可能会调用一个对象的 \`__get__\` 方法。这种「把属性访问变成方法调用」的能力，正是 \`property\`、\`classmethod\`、\`staticmethod\`、\`super()\` 以及 ORM 字段的共同基础。

理解描述符，就理解了 Python 面向对象里「属性」这件事的本质。本章会从描述符协议的三个方法讲起，区分数据描述符与非数据描述符，揭示 \`property\` 的真面目，然后实战自定义验证器、ORM 字段、\`cached_property\`。

---

## 一、描述符协议：三个方法

### 1.1 协议定义

描述符协议由以下三个方法组成，一个对象只要实现了其中任意一个，它就是描述符：

- \`__get__(self, obj, objtype=None)\`：访问属性时调用。\`obj\` 是实例（类访问时为 None），\`objtype\` 是类。
- \`__set__(self, obj, value)\`：设置属性时调用。
- \`__delete__(self, obj)\`：删除属性时调用。

\`\`\`python
class MyDescriptor:
    def __get__(self, obj, objtype=None):
        print("__get__ 被调用")
        return 42
    def __set__(self, obj, value):
        print("__set__ 被调用, value =", value)
    def __delete__(self, obj):
        print("__delete__ 被调用")

class C:
    x = MyDescriptor()   # 描述符必须作为类属性

c = C()
print(c.x)      # 触发 __get__，返回 42
c.x = 100       # 触发 __set__（但这里不会存到实例）
del c.x         # 触发 __delete__
\`\`\`

关键认知：**描述符必须是类属性，不能是实例属性**。因为属性查找规则只在「类属性」层面检查描述符协议。

### 1.2 属性查找的过程

当你访问 \`obj.x\` 时，Python 的查找顺序是：

1. 查 \`type(obj)\` 的 MRO（方法解析顺序）里，\`x\` 是不是「数据描述符」。如果是，调用它的 \`__get__\`。
2. 查 \`obj.__dict__['x']\`（实例字典）。如果有，直接返回。
3. 查 \`type(obj)\` 的 MRO 里，\`x\` 是不是「非数据描述符」。如果是，调用它的 \`__get__\`。
4. 查 \`type(obj)\` 的 MRO 里，\`x\` 是不是普通类属性。如果是，返回。
5. 抛 \`AttributeError\`。

这个顺序决定了「数据描述符 > 实例属性 > 非数据描述符 > 类属性」的优先级，是描述符最核心的知识点。

---

## 二、数据描述符 vs 非数据描述符

### 2.1 定义

- **数据描述符（Data Descriptor）**：同时定义了 \`__get__\` 和 \`__set__\`（或 \`__delete__\`）。
- **非数据描述符（Non-Data Descriptor）**：只定义了 \`__get__\`。

两者的区别在于**优先级**：数据描述符的优先级高于实例属性，非数据描述符的优先级低于实例属性。

\`\`\`python
# 数据描述符
class DataDesc:
    def __get__(self, obj, objtype=None):
        return "data desc"
    def __set__(self, obj, value):
        pass

# 非数据描述符
class NonDataDesc:
    def __get__(self, obj, objtype=None):
        return "non-data desc"

class C:
    d = DataDesc()
    n = NonDataDesc()

c = C()
# 试图用实例字典覆盖
c.__dict__['d'] = "instance d"
c.__dict__['n'] = "instance n"

print(c.d)   # data desc    ← 数据描述符优先级更高，忽略实例字典
print(c.n)   # instance n   ← 非数据描述符被实例字典覆盖
\`\`\`

这个差异是 \`property\`（数据描述符，赋值会被拦截）和普通方法（非数据描述符，可被实例属性覆盖）行为不同的根源。

### 2.2 优先级实验

\`\`\`python
class Trace:
    def __get__(self, obj, objtype=None):
        return "来自描述符"

class C:
    x = Trace()

c = C()
print(c.x)              # 来自描述符（非数据描述符，但实例字典里还没有 x）
c.x = "实例属性"
print(c.x)              # 实例属性（非数据描述符优先级低于实例属性）
\`\`\`

如果给 \`Trace\` 加上 \`__set__\`，它就变成数据描述符，\`c.x = "实例属性"\` 会被拦截：

\`\`\`python
class Trace2:
    def __get__(self, obj, objtype=None):
        return "来自描述符"
    def __set__(self, obj, value):
        print("拦截赋值:", value)

class D:
    x = Trace2()

d = D()
d.x = "实例属性"   # 拦截赋值: 实例属性
print(d.x)          # 来自描述符
\`\`\`

---

## 三、property 的本质就是数据描述符

### 3.1 property 是什么

\`property\` 是一个内置类型，它本质上就是一个「帮你实现描述符协议」的便利工具。当你写：

\`\`\`python
class C:
    @property
    def x(self):
        return self._x
    @x.setter
    def x(self, value):
        self._x = value
\`\`\`

等价于：

\`\`\`python
class C:
    def get_x(self):
        return self._x
    def set_x(self, value):
        self._x = value
    x = property(get_x, set_x)
\`\`\`

而 \`property\` 实例本身就是一个数据描述符，它的 \`__get__\` 调用你提供的 \`fget\`，\`__set__\` 调用你提供的 \`fset\`。

\`\`\`python
class C:
    x = property(lambda self: self._x, lambda self, v: setattr(self, '_x', v))

c = C()
c.x = 5
print(c.x)   # 5
print(type(C.x))   # <class 'property'>
print(isinstance(C.x, property))   # True
\`\`\`

### 3.2 用描述符手写 property

理解了这点，你完全可以手写一个 \`property\`：

\`\`\`python
class MyProperty:
    def __init__(self, fget=None, fset=None, fdel=None):
        self.fget = fget
        self.fset = fset
        self.fdel = fdel
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        if self.fget is None:
            raise AttributeError("不可读")
        return self.fget(obj)
    def __set__(self, obj, value):
        if self.fset is None:
            raise AttributeError("不可写")
        self.fset(obj, value)
    def __delete__(self, obj):
        if self.fdel is None:
            raise AttributeError("不可删")
        self.fdel(obj)
    def setter(self, fset):
        return MyProperty(self.fget, fset, self.fdel)

class Person:
    def __init__(self, name):
        self._name = name
    @MyProperty
    def name(self):
        return self._name
    @name.setter
    def name(self, value):
        self._name = value

p = Person("Alice")
print(p.name)   # Alice
p.name = "Bob"
print(p.name)   # Bob
\`\`\`

这就是 \`property\` 的全部秘密——一个实现了描述符协议的类。

---

## 四、自定义验证器描述符

### 4.1 类型检查描述符

描述符最常见的用途是「带验证的属性」。我们写一个只接受特定类型的描述符：

\`\`\`python
class TypedField:
    def __init__(self, expected_type):
        self.expected_type = expected_type
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        if not isinstance(value, self.expected_type):
            raise TypeError(
                self.name + " 必须是 " + self.expected_type.__name__
                + "，收到 " + type(value).__name__
            )
        obj.__dict__[self.name] = value

class User:
    name = TypedField(str)
    age = TypedField(int)

u = User()
u.name = "Alice"
u.age = 30
print(u.name, u.age)
# u.age = "30"   # TypeError: age 必须是 int，收到 str
\`\`\`

注意 \`__set_name__\`：Python 3.6 引入，当描述符作为类属性被赋值时，解释器会自动调用它的 \`__set_name__(owner, name)\`，告诉你「你被赋给了哪个名字」。这样描述符就知道该把值存在实例字典的哪个 key 下。

### 4.2 范围检查描述符

\`\`\`python
class RangeField:
    def __init__(self, low, high):
        self.low = low
        self.high = high
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        if not (self.low <= value <= self.high):
            raise ValueError(
                self.name + " 必须在 " + str(self.low) + " 到 " + str(self.high) + " 之间"
            )
        obj.__dict__[self.name] = value

class Product:
    price = RangeField(0, 10000)
    stock = RangeField(0, 9999)

p = Product()
p.price = 99.9
p.stock = 100
print(p.price, p.stock)
# p.price = -1   # ValueError
# p.stock = 99999 # ValueError
\`\`\`

### 4.3 组合验证器

可以组合多个验证规则：

\`\`\`python
class Validated:
    def __init__(self, *validators):
        self.validators = validators
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        for v in self.validators:
            v(self.name, value)
        obj.__dict__[self.name] = value

def type_check(t):
    def check(name, value):
        if not isinstance(value, t):
            raise TypeError(name + " 类型错误")
    return check

def range_check(low, high):
    def check(name, value):
        if not (low <= value <= high):
            raise ValueError(name + " 超出范围")
    return check

class Config:
    port = Validated(type_check(int), range_check(0, 65535))
    host = Validated(type_check(str))

cfg = Config()
cfg.port = 8080
cfg.host = "localhost"
print(cfg.host, cfg.port)
\`\`\`

---

## 五、描述符存储问题

### 5.1 存哪里是个关键问题

描述符作为类属性，是**所有实例共享**的。如果你把属性值存在描述符自己身上，所有实例就会共享同一个值——这是常见 bug。

\`\`\`python
class BadField:
    def __init__(self):
        self.value = None    # 存在描述符自己身上，所有实例共享！
    def __get__(self, obj, objtype=None):
        return self.value
    def __set__(self, obj, value):
        self.value = value

class C:
    x = BadField()

a = C()
b = C()
a.x = 1
print(b.x)   # 1 ← 串了！b 也变成了 1
\`\`\`

正确做法是把值存在**实例的 \`__dict__\`** 里，用属性名作为 key：

\`\`\`python
class GoodField:
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        obj.__dict__[self.name] = value

class D:
    x = GoodField()

a = D()
b = D()
a.x = 1
b.x = 2
print(a.x, b.x)   # 1 2 ← 正确，各存各的
\`\`\`

### 5.2 类变量 vs 实例变量

理解描述符存储，本质是理解「类变量」和「实例变量」的区别：

- **类变量**：存在 \`类.__dict__\`，所有实例共享。
- **实例变量**：存在 \`实例.__dict__\`，每个实例独有。

\`\`\`python
class C:
    class_var = 0   # 类变量
    def __init__(self):
        self.instance_var = 0   # 实例变量

print("class_var 在 C.__dict__:", "class_var" in C.__dict__)
print("instance_var 在 C.__dict__:", "instance_var" in C.__dict__)
c = C()
print("instance_var 在 c.__dict__:", "instance_var" in c.__dict__)
\`\`\`

描述符是类变量，但它「代理」的是实例变量——把值存到实例字典里，从而做到每个实例独立。

### 5.3 用字典存储（避免 __dict__ 冲突）

有时实例的 \`__dict__\` 不方便用（比如用了 \`__slots__\`），或者你想避免污染实例字典。可以在描述符里维护一个「实例 → 值」的字典：

\`\`\`python
class SlotField:
    def __init__(self):
        self.data = {}   # 用 id(实例) 做 key
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return self.data.get(id(obj))
    def __set__(self, obj, value):
        self.data[id(obj)] = value
    def __delete__(self, obj):
        self.data.pop(id(obj), None)

class C:
    x = SlotField()

a = C()
b = C()
a.x = 1
b.x = 2
print(a.x, b.x)   # 1 2
\`\`\`

注意这种做法有内存泄漏风险（实例销毁后描述符里的 key 还在），生产环境要用 \`weakref\`。\`functools.cached_property\` 内部就用了类似机制。

---

## 六、__set_name__ 详解

### 6.1 作用

\`__set_name__(self, owner, name)\` 在「类创建时」被调用，\`owner\` 是定义该描述符的类，\`name\` 是描述符被赋给的属性名。它让描述符「知道自己的名字」，从而能正确地在实例字典里存取。

\`\`\`python
class Field:
    def __set_name__(self, owner, name):
        print(f"我被赋给了 {owner.__name__}.{name}")
        self.name = name
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        obj.__dict__[self.name] = value

class C:
    a = Field()   # 打印：我被赋给了 C.a
    b = Field()   # 打印：我被赋给了 C.b
\`\`\`

### 6.2 没有 __set_name__ 怎么办

Python 3.6 之前没有 \`__set_name__\`，描述符要在 \`__init__\` 里手动传名字：

\`\`\`python
class OldField:
    def __init__(self, name):
        self.name = name   # 必须手动传
    # ...

class C:
    x = OldField("x")   # 重复写 x，容易出错
\`\`\`

\`__set_name__\` 消除了这种重复，是现代描述符的标配。

---

## 七、描述符实现 ORM 字段

### 7.1 简单 ORM 字段

把验证器和 \`__set_name__\` 结合，就能做出 ORM 风格的字段：

\`\`\`python
class Column:
    def __init__(self, col_type, primary_key=False):
        self.col_type = col_type
        self.primary_key = primary_key
    def __set_name__(self, owner, name):
        self.name = name
        self.attr = "_" + name
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.attr, None)
    def __set__(self, obj, value):
        if value is not None and not isinstance(value, self.col_type):
            raise TypeError(self.name + " 类型错误")
        setattr(obj, self.attr, value)

class User:
    id = Column(int, primary_key=True)
    name = Column(str)
    email = Column(str)

u = User()
u.id = 1
u.name = "Alice"
u.email = "alice@example.com"
print(u.id, u.name, u.email)
\`\`\`

### 7.2 用元类收集字段

真正的 ORM 还会用元类把所有 \`Column\` 收集起来，生成表结构：

\`\`\`python
class ModelMeta(type):
    def __new__(mcs, name, bases, namespace):
        columns = {}
        for key, val in list(namespace.items()):
            if isinstance(val, Column):
                columns[key] = val
        cls = super().__new__(mcs, name, bases, namespace)
        cls._columns = columns
        return cls

class Model(metaclass=ModelMeta):
    pass

class User(Model):
    id = Column(int, primary_key=True)
    name = Column(str)

print(User._columns)   # {'id': Column(...), 'name': Column(...)}
\`\`\`

这就是 Django ORM、SQLAlchemy 的核心思想：字段是描述符，元类收集字段生成表结构。

---

## 八、实战：cached_property 原理

### 8.1 functools.cached_property

\`functools.cached_property\` 是一个「只计算一次，结果缓存到实例字典」的描述符。它的原理非常优雅：

\`\`\`python
class cached_property:
    def __init__(self, func):
        self.func = func
        self.name = func.__name__
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        # 计算并存入实例字典
        value = self.func(obj)
        obj.__dict__[self.name] = value
        return value

class Data:
    @cached_property
    def expensive(self):
        print("  正在计算...")
        return sum(range(1000000))

d = Data()
print(d.expensive)   # 计算并打印
print(d.expensive)   # 直接返回缓存，不再计算
\`\`\`

第一次访问 \`d.expensive\` 时，实例字典里没有，于是调用 \`func\` 计算，结果存入 \`obj.__dict__['expensive']\`。第二次访问时，实例字典里有了，非数据描述符优先级低于实例属性，直接返回缓存——这是「非数据描述符」特性的巧妙利用。

### 8.2 类型安全属性

结合描述符和类型注解，可以做出类型安全的属性：

\`\`\`python
class TypeSafe:
    def __init__(self, annotation):
        self.annotation = annotation
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        if not isinstance(value, self.annotation):
            raise TypeError(self.name + " 需要 " + str(self.annotation))
        obj.__dict__[self.name] = value

class Point:
    x = TypeSafe(int)
    y = TypeSafe(int)
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def distance(self):
        return (self.x ** 2 + self.y ** 2) ** 0.5

p = Point(3, 4)
print(p.distance())
\`\`\`

---

## 九、方法也是描述符

### 9.1 函数是非数据描述符

一个有趣的真相：**普通方法就是非数据描述符**。函数对象有 \`__get__\` 方法，当你访问 \`obj.method\` 时，\`__get__\` 把函数包装成「绑定方法」，自动把 \`obj\` 作为第一个参数（\`self\`）。

\`\`\`python
class C:
    def method(self):
        return self

print(hasattr(C.method, '__get__'))   # True，函数是描述符

c = C()
bound = c.method     # 触发 __get__，返回绑定方法
print(bound() is c)  # True，self 被自动绑定
\`\`\`

这就是为什么 \`obj.method()\` 等价于 \`C.method(obj)\`——描述符协议在背后做了绑定。

### 9.2 classmethod 和 staticmethod

\`classmethod\` 和 \`staticmethod\` 也是描述符：

- \`classmethod\` 的 \`__get__\` 返回一个「绑定到类」的方法（第一个参数是类）。
- \`staticmethod\` 的 \`__get__\` 返回原函数（不做绑定）。

\`\`\`python
class C:
    @classmethod
    def cls_method(cls):
        return cls
    @staticmethod
    def static_method():
        return "static"

print(C.cls_method() is C)   # True
print(C.static_method())     # static
\`\`\`

理解了描述符，\`classmethod\`/\`staticmethod\`/\`property\` 的本质就都清楚了——它们都是「实现了描述符协议的类」。

---

## 十、常见陷阱与最佳实践

### 10.1 忘记处理 obj is None

描述符的 \`__get__\` 在「类访问」时 \`obj\` 是 \`None\`。如果不处理，\`类.属性\` 会出错：

\`\`\`python
class Bad:
    def __get__(self, obj, objtype=None):
        return obj.x   # 类访问时 obj 是 None，会报错

class C:
    b = Bad()
# C.b   # AttributeError
\`\`\`

正确做法是判断 \`obj is None\` 时返回描述符自身。

### 10.2 描述符与 __slots__

如果类用了 \`__slots__\`，实例没有 \`__dict__\`，描述符往实例字典存值会失败。这时要么在 \`__slots__\` 里给属性留位置，要么用描述符内部的字典存储。

### 10.3 不要在描述符 __init__ 里存状态

描述符是类属性，\`__init__\` 只在「类定义时」执行一次。试图在 \`__init__\` 里存「每个实例的状态」是错误的，要用实例字典或弱引用字典。

---

## 十一、小结

- 描述符协议：\`__get__\`、\`__set__\`、\`__delete__\`。实现任意一个即为描述符。
- 数据描述符（有 \`__set__\`）优先级 > 实例属性 > 非数据描述符（只有 \`__get__\`）。
- \`property\` 本质是数据描述符，\`classmethod\`/\`staticmethod\`/\`方法\` 本质是非数据描述符。
- 描述符必须作为类属性，值要存在实例 \`__dict__\` 里（用 \`__set_name__\` 获取名字）。
- 应用：验证器、ORM 字段、\`cached_property\`、类型安全属性。
- \`cached_property\` 巧妙利用「非数据描述符优先级低于实例属性」实现缓存。

描述符是 Python 面向对象「最深处」的特性之一。掌握了它，你不仅能写出优雅的属性控制代码，更能读懂标准库和主流框架的实现精髓。
`,
    code: `# =============================================================
# 第二章：描述符协议 - 可运行示例
# =============================================================

print("=" * 60)
print("1. 描述符协议基础")
print("=" * 60)

class MyDescriptor:
    def __get__(self, obj, objtype=None):
        print("  __get__ 被调用, obj =", obj)
        return 42
    def __set__(self, obj, value):
        print("  __set__ 被调用, value =", value)
    def __delete__(self, obj):
        print("  __delete__ 被调用")

class C:
    x = MyDescriptor()

c = C()
print("c.x =", c.x)
c.x = 100
del c.x

print()
print("=" * 60)
print("2. 数据描述符 vs 非数据描述符")
print("=" * 60)

class DataDesc:
    def __get__(self, obj, objtype=None):
        return "数据描述符的值"
    def __set__(self, obj, value):
        print("  数据描述符拦截赋值:", value)

class NonDataDesc:
    def __get__(self, obj, objtype=None):
        return "非数据描述符的值"

class D:
    d = DataDesc()
    n = NonDataDesc()

d = D()
d.__dict__['d'] = "实例字典的 d"
d.__dict__['n'] = "实例字典的 n"
print("d.d =", d.d, "(数据描述符优先)")
print("d.n =", d.n, "(实例字典优先)")

# 非数据描述符的优先级实验
class Trace:
    def __get__(self, obj, objtype=None):
        return "来自描述符"

class E:
    x = Trace()

e = E()
print("e.x =", e.x, "(实例字典为空时用描述符)")
e.x = "实例属性"
print("e.x =", e.x, "(实例字典有值时覆盖非数据描述符)")

print()
print("=" * 60)
print("3. property 的本质")
print("=" * 60)

class Person:
    def __init__(self, name):
        self._name = name
    @property
    def name(self):
        return self._name
    @name.setter
    def name(self, value):
        if not value:
            raise ValueError("名字不能为空")
        self._name = value

p = Person("Alice")
print("p.name =", p.name)
p.name = "Bob"
print("改后 p.name =", p.name)
print("type(Person.name) =", type(Person.name))
print("isinstance(Person.name, property) =", isinstance(Person.name, property))

# 手写 property
class MyProperty:
    def __init__(self, fget=None, fset=None, fdel=None):
        self.fget = fget
        self.fset = fset
        self.fdel = fdel
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        if self.fget is None:
            raise AttributeError("不可读")
        return self.fget(obj)
    def __set__(self, obj, value):
        if self.fset is None:
            raise AttributeError("不可写")
        self.fset(obj, value)
    def setter(self, fset):
        return MyProperty(self.fget, fset, self.fdel)

class Animal:
    def __init__(self, kind):
        self._kind = kind
    @MyProperty
    def kind(self):
        return self._kind
    @kind.setter
    def kind(self, value):
        self._kind = value

a = Animal("猫")
print("手写 property: a.kind =", a.kind)
a.kind = "狗"
print("改后 a.kind =", a.kind)

print()
print("=" * 60)
print("4. 类型检查描述符")
print("=" * 60)

class TypedField:
    def __init__(self, expected_type):
        self.expected_type = expected_type
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        if not isinstance(value, self.expected_type):
            raise TypeError(
                self.name + " 必须是 " + self.expected_type.__name__
                + "，收到 " + type(value).__name__
            )
        obj.__dict__[self.name] = value

class User:
    name = TypedField(str)
    age = TypedField(int)
    email = TypedField(str)

u = User()
u.name = "Alice"
u.age = 30
u.email = "alice@example.com"
print("User:", u.name, u.age, u.email)

print("尝试给 age 赋字符串:")
try:
    u.age = "30"
except TypeError as e:
    print("  捕获:", e)

print("尝试给 name 赋数字:")
try:
    u.name = 123
except TypeError as e:
    print("  捕获:", e)

print()
print("=" * 60)
print("5. 范围检查描述符")
print("=" * 60)

class RangeField:
    def __init__(self, low, high):
        self.low = low
        self.high = high
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        if not (self.low <= value <= self.high):
            raise ValueError(
                self.name + " 必须在 " + str(self.low) + " 到 " + str(self.high)
            )
        obj.__dict__[self.name] = value

class Product:
    price = RangeField(0, 10000)
    stock = RangeField(0, 9999)

p = Product()
p.price = 99.9
p.stock = 100
print("Product:", p.price, p.stock)

print("尝试 price = -1:")
try:
    p.price = -1
except ValueError as e:
    print("  捕获:", e)

print()
print("=" * 60)
print("6. 组合验证器")
print("=" * 60)

class Validated:
    def __init__(self, *validators):
        self.validators = validators
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        for v in self.validators:
            v(self.name, value)
        obj.__dict__[self.name] = value

def type_check(t):
    def check(name, value):
        if not isinstance(value, t):
            raise TypeError(name + " 需要 " + t.__name__)
    return check

def range_check(low, high):
    def check(name, value):
        if not (low <= value <= high):
            raise ValueError(name + " 超出 " + str(low) + "-" + str(high))
    return check

def length_check(max_len):
    def check(name, value):
        if len(value) > max_len:
            raise ValueError(name + " 太长")
    return check

class ServerConfig:
    port = Validated(type_check(int), range_check(0, 65535))
    host = Validated(type_check(str), length_check(50))

cfg = ServerConfig()
cfg.port = 8080
cfg.host = "localhost"
print("ServerConfig:", cfg.host, cfg.port)

print("尝试 port = 99999:")
try:
    cfg.port = 99999
except ValueError as e:
    print("  捕获:", e)

print()
print("=" * 60)
print("7. 描述符存储问题演示")
print("=" * 60)

class BadField:
    def __init__(self):
        self.value = None
    def __get__(self, obj, objtype=None):
        return self.value
    def __set__(self, obj, value):
        self.value = value

class Bad:
    x = BadField()

a = Bad()
b = Bad()
a.x = 1
print("错误做法: a.x=1 后, b.x =", b.x, "(串了!)")

class GoodField:
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        obj.__dict__[self.name] = value

class Good:
    x = GoodField()

a = Good()
b = Good()
a.x = 1
b.x = 2
print("正确做法: a.x =", a.x, "b.x =", b.x)

# 类变量 vs 实例变量
class Vars:
    class_var = 0
    def __init__(self):
        self.instance_var = 0

print("class_var 在 Vars.__dict__:", "class_var" in Vars.__dict__)
v = Vars()
print("instance_var 在 v.__dict__:", "instance_var" in v.__dict__)

print()
print("=" * 60)
print("8. __set_name__ 演示")
print("=" * 60)

class Field:
    def __set_name__(self, owner, name):
        print("  [__set_name__]", owner.__name__ + "." + name)
        self.name = name
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        obj.__dict__[self.name] = value

class Config:
    alpha = Field()
    beta = Field()
    gamma = Field()

c = Config()
c.alpha = 1
c.beta = 2
c.gamma = 3
print("Config:", c.alpha, c.beta, c.gamma)

print()
print("=" * 60)
print("9. ORM 字段实现")
print("=" * 60)

class Column:
    def __init__(self, col_type, primary_key=False):
        self.col_type = col_type
        self.primary_key = primary_key
    def __set_name__(self, owner, name):
        self.name = name
        self.attr = "_" + name
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.attr, None)
    def __set__(self, obj, value):
        if value is not None and not isinstance(value, self.col_type):
            raise TypeError(self.name + " 需要 " + self.col_type.__name__)
        setattr(obj, self.attr, value)

class ModelMeta(type):
    def __new__(mcs, name, bases, namespace):
        columns = {}
        for key, val in list(namespace.items()):
            if isinstance(val, Column):
                columns[key] = val
        cls = super().__new__(mcs, name, bases, namespace)
        cls._columns = columns
        return cls

class Model(metaclass=ModelMeta):
    def __repr__(self):
        items = []
        for k in self._columns:
            items.append(k + "=" + repr(getattr(self, k)))
        return self.__class__.__name__ + "(" + ", ".join(items) + ")"

class User(Model):
    id = Column(int, primary_key=True)
    name = Column(str)
    email = Column(str)

class Article(Model):
    id = Column(int, primary_key=True)
    title = Column(str)
    views = Column(int)

print("User 的字段:", list(User._columns.keys()))
print("Article 的字段:", list(Article._columns.keys()))

u = User()
u.id = 1
u.name = "Alice"
u.email = "alice@example.com"
print("  ", u)

art = Article()
art.id = 100
art.title = "Python 描述符"
art.views = 5000
print("  ", art)

print("尝试给 views 赋字符串:")
try:
    art.views = "五千"
except TypeError as e:
    print("  捕获:", e)

print()
print("=" * 60)
print("10. cached_property 原理")
print("=" * 60)

class cached_property:
    def __init__(self, func):
        self.func = func
        self.name = func.__name__
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        value = self.func(obj)
        obj.__dict__[self.name] = value
        return value

class Data:
    call_count = 0
    @cached_property
    def expensive(self):
        Data.call_count += 1
        print("    [计算中] 第", Data.call_count, "次")
        total = 0
        for i in range(100000):
            total += i
        return total

d = Data()
print("第一次访问 d.expensive:")
print("  结果 =", d.expensive)
print("第二次访问 d.expensive:")
print("  结果 =", d.expensive)
print("第三次访问 d.expensive:")
print("  结果 =", d.expensive)
print("  实际只计算了", Data.call_count, "次")

# 对比标准库
from functools import cached_property as std_cached_property

class Data2:
    @std_cached_property
    def value(self):
        print("    [标准库] 计算中")
        return 999

d2 = Data2()
print("标准库 cached_property:")
print("  ", d2.value)
print("  ", d2.value)

print()
print("=" * 60)
print("11. 类型安全属性")
print("=" * 60)

class TypeSafe:
    def __init__(self, annotation):
        self.annotation = annotation
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        if not isinstance(value, self.annotation):
            raise TypeError(self.name + " 需要 " + self.annotation.__name__)
        obj.__dict__[self.name] = value

class Point:
    x = TypeSafe(int)
    y = TypeSafe(int)
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def distance_to(self, other):
        return ((self.x - other.x) ** 2 + (self.y - other.y) ** 2) ** 0.5

p1 = Point(0, 0)
p2 = Point(3, 4)
print("p1 到 p2 距离:", p1.distance_to(p2))

print("尝试 p1.x = 1.5:")
try:
    p1.x = 1.5
except TypeError as e:
    print("  捕获:", e)

print()
print("=" * 60)
print("12. 方法也是描述符")
print("=" * 60)

class MyClass:
    def method(self):
        return "方法被调用"
    @classmethod
    def cls_method(cls):
        return "类方法: " + cls.__name__
    @staticmethod
    def static_method():
        return "静态方法"

print("函数有 __get__:", hasattr(MyClass.method, '__get__'))

c = MyClass()
bound = c.method
print("绑定方法:", bound())
print("类方法:", MyClass.cls_method())
print("静态方法:", MyClass.static_method())

# 验证绑定机制
print("c.method.__self__ is c:", bound.__self__ is c)

print()
print("=" * 60)
print("13. 只读描述符")
print("=" * 60)

class ReadOnly:
    def __init__(self, value):
        self._value = value
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return self._value
    def __set__(self, obj, value):
        raise AttributeError(self.name + " 是只读的")

class Circle:
    pi = ReadOnly(3.14159265)
    def __init__(self, r):
        self.r = r
    def area(self):
        return self.pi * self.r * self.r

c = Circle(5)
print("c.pi =", c.pi)
print("面积 =", c.area())

print("尝试修改 pi:")
try:
    c.pi = 3
except AttributeError as e:
    print("  捕获:", e)

print()
print("=" * 60)
print("14. 弱引用存储的描述符")
print("=" * 60)

import weakref

class WeakField:
    def __init__(self, default=None):
        self.default = default
        self.data = weakref.WeakKeyDictionary()
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return self.data.get(obj, self.default)
    def __set__(self, obj, value):
        self.data[obj] = value

class Session:
    token = WeakField(default="anonymous")

s1 = Session()
s2 = Session()
s1.token = "abc123"
s2.token = "xyz789"
print("s1.token =", s1.token)
print("s2.token =", s2.token)
print("s3 (新) token =", Session().token)

print()
print("=" * 60)
print("15. 综合实战：带历史的属性")
print("=" * 60)

class HistoryField:
    def __init__(self, max_history=10):
        self.max_history = max_history
    def __set_name__(self, owner, name):
        self.name = name
        self.history_key = "_" + name + "_history"
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        history = getattr(obj, self.history_key, [])
        return history[-1] if history else None
    def __set__(self, obj, value):
        history = getattr(obj, self.history_key, [])
        history.append(value)
        if len(history) > self.max_history:
            history = history[-self.max_history:]
        setattr(obj, self.history_key, history)
    def get_history(self, obj):
        return getattr(obj, self.history_key, [])

class Temperature:
    value = HistoryField(max_history=5)
    def history(self):
        return HistoryField.get_history(Temperature.value, self)

t = Temperature()
for v in [20.0, 20.5, 21.0, 21.5, 22.0, 22.5, 23.0]:
    t.value = v
print("当前温度:", t.value)
print("历史记录:", t.history())

print()
print("=" * 60)
print("16. 综合实战：懒加载描述符")
print("=" * 60)

class LazyAttribute:
    def __init__(self, factory):
        self.factory = factory
        self.name = factory.__name__
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        value = self.factory(obj)
        # 用实例字典覆盖，以后不再触发描述符
        obj.__dict__[self.name] = value
        return value

class App:
    def __init__(self, config):
        self.config = config
    @LazyAttribute
    def db_connection(self):
        print("    [懒加载] 建立数据库连接...")
        return "Connection(" + self.config + ")"
    @LazyAttribute
    def cache(self):
        print("    [懒加载] 初始化缓存...")
        return {"data": "cached"}

app = App("prod")
print("第一次访问 db_connection:")
print("  ", app.db_connection)
print("第二次访问 db_connection:")
print("  ", app.db_connection)
print("访问 cache:")
print("  ", app.cache)

print()
print("=" * 60)
print("全部演示完成！")
print("=" * 60)
`,
  },

  // =========================================================
  // 第三章：上下文管理器深入
  // =========================================================
  {
    id: "py-context-manager",
    group: "高级特性与工程",
    icon: "🚪",
    title: "上下文管理器深入",
    content: `# 上下文管理器深入

\`with\` 语句和上下文管理器（Context Manager）是 Python 处理「资源管理」的标准方式。无论是文件、锁、数据库连接、还是临时状态切换，\`with\` 都能保证「无论正常退出还是异常退出，清理代码都会执行」。本章会深入 \`with\` 的原理、自定义上下文管理器、\`contextlib\` 工具箱、\`ExitStack\` 管理多个上下文，以及异步上下文管理器。

---

## 一、with 语句原理

### 1.1 为什么需要 with

先看一个「不用 with」的文件操作：

\`\`\`python
f = open("data.txt")
try:
    data = f.read()
finally:
    f.close()   # 必须手动关闭，否则资源泄漏
\`\`\`

问题在于：很容易忘记 \`finally\`，或者在 \`try\` 和 \`finally\` 之间出了异常导致 \`close\` 没执行。\`with\` 语句就是为了消除这种「样板代码」而生的：

\`\`\`python
with open("data.txt") as f:
    data = f.read()
# 离开 with 块，f 自动关闭，即使 read 抛异常
\`\`\`

\`with\` 保证：无论 with 块里发生什么（正常结束、return、break、异常），\`f.close()\` 都会被调用。

### 1.2 with 的执行流程

\`with obj as x:\` 的执行流程是：

1. 调用 \`obj.__enter__()\`，把返回值赋给 \`x\`。
2. 执行 with 块的代码。
3. 无论 with 块如何退出，都调用 \`obj.__exit__(exc_type, exc_val, exc_tb)\`。
   - 如果正常退出，三个参数都是 \`None\`。
   - 如果异常退出，三个参数是异常的类型、值、traceback。

\`\`\`python
class MyCtx:
    def __enter__(self):
        print("__enter__")
        return "资源"
    def __exit__(self, exc_type, exc_val, exc_tb):
        print("__exit__", "exc_type =", exc_type)
        return False

with MyCtx() as r:
    print("with 块里，r =", r)
print("with 结束")
\`\`\`

---

## 二、__enter__ 与 __exit__ 协议

### 2.1 __enter__

\`__enter__\` 在进入 with 块时调用，它的返回值会被赋给 \`as\` 后面的变量。你可以返回 \`self\`（最常见），也可以返回任意对象。

\`\`\`python
class Resource:
    def __enter__(self):
        print("获取资源")
        return self   # 返回自己，这样 as r 拿到的就是 Resource 实例
    def __exit__(self, *args):
        print("释放资源")

with Resource() as r:
    print("使用", r)
\`\`\`

### 2.2 __exit__ 的返回值与异常抑制

\`__exit__\` 的返回值非常关键：

- 返回 **True（或真值）**：**抑制异常**，with 块里的异常不会向上传播。
- 返回 **False（或 None）**：异常正常向上传播。

\`\`\`python
class SuppressError:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is ValueError:
            print("捕获并吞掉 ValueError")
            return True   # 抑制 ValueError
        return False      # 其他异常照常抛出

with SuppressError():
    raise ValueError("一个错误")
print("继续执行，ValueError 被吞了")
\`\`\`

谨慎使用异常抑制——它会让 bug 难以发现。通常只在「你确实知道这个异常可以忽略」时才用，比如清理临时文件时的 \`FileNotFoundError\`。

### 2.3 __exit__ 的三个参数

当 with 块里抛异常时：

- \`exc_type\`：异常类（如 \`ValueError\`）
- \`exc_val\`：异常实例（如 \`ValueError("xxx")\`）
- \`exc_tb\`：traceback 对象

\`\`\`python
import traceback

class DebugCtx:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            print("捕获到异常:")
            print("  类型:", exc_type.__name__)
            print("  值:", exc_val)
            print("  traceback:")
            traceback.print_exception(exc_type, exc_val, exc_tb)
        return False

with DebugCtx():
    raise RuntimeError("出错了")
\`\`\`

---

## 三、自定义上下文管理器类

### 3.1 数据库连接示例

\`\`\`python
class FakeDB:
    def __init__(self, dsn):
        self.dsn = dsn
        self.conn = None
    def __enter__(self):
        print("连接数据库:", self.dsn)
        self.conn = "Connection(" + self.dsn + ")"
        return self.conn
    def __exit__(self, exc_type, exc_val, exc_tb):
        print("关闭数据库连接")
        self.conn = None
        if exc_type:
            print("  有异常，执行回滚")
        else:
            print("  正常，执行提交")
        return False

with FakeDB("postgres://localhost") as db:
    print("使用", db)
    # 模拟操作
\`\`\`

### 3.2 计时器

\`\`\`python
import time

class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self
    def __exit__(self, *args):
        self.elapsed = time.perf_counter() - self.start
        print("耗时 %.4f 秒" % self.elapsed)

with Timer():
    sum(range(1000000))
\`\`\`

### 3.3 临时切换状态

\`\`\`python
class TempAttr:
    def __init__(self, obj, **changes):
        self.obj = obj
        self.changes = changes
        self.original = {}
    def __enter__(self):
        for k in self.changes:
            self.original[k] = getattr(self.obj, k)
            setattr(self.obj, k, self.changes[k])
        return self.obj
    def __exit__(self, *args):
        for k, v in self.original.items():
            setattr(self.obj, k, v)

class Config:
    debug = False
    level = 1

cfg = Config()
print("before: debug =", cfg.debug)
with TempAttr(cfg, debug=True, level=5):
    print("inside: debug =", cfg.debug, "level =", cfg.level)
print("after: debug =", cfg.debug, "level =", cfg.level)
\`\`\`

这种「临时改状态、退出后恢复」的模式在测试和临时配置里非常有用。

---

## 四、contextlib.contextmanager 装饰器

### 4.1 生成器方式

写一个完整的类（\`__enter__\` + \`__exit__\`）有点啰嗦。\`contextlib.contextmanager\` 让你用一个「带 \`yield\` 的生成器函数」来定义上下文管理器，更简洁：

\`\`\`python
from contextlib import contextmanager

@contextmanager
def my_ctx():
    print("进入（相当于 __enter__）")
    yield "资源"
    print("退出（相当于 __exit__）")

with my_ctx() as r:
    print("使用", r)
\`\`\`

\`yield\` 之前的代码对应 \`__enter__\`，\`yield\` 的值对应 \`__enter__\` 的返回值，\`yield\` 之后的代码对应 \`__exit__\`。

### 4.2 处理异常

如果 with 块里抛异常，异常会在 \`yield\` 那里重新抛出。你可以用 \`try/except\` 包住 \`yield\` 来处理：

\`\`\`python
@contextmanager
def safe_ctx():
    print("进入")
    try:
        yield "资源"
    except ValueError as e:
        print("捕获到 ValueError:", e)
    finally:
        print("清理")

with safe_ctx() as r:
    print("使用", r)
    raise ValueError("出错了")
print("继续")
\`\`\`

如果不 catch，异常会向上传播，但 \`finally\` 块的清理代码仍会执行。

### 4.3 计时器（生成器版）

\`\`\`python
import time

@contextmanager
def timer(name="block"):
    start = time.perf_counter()
    try:
        yield
    finally:
        print(name, "耗时 %.4f 秒" % (time.perf_counter() - start))

with timer("计算"):
    sum(range(1000000))
\`\`\`

### 4.4 临时切换状态（生成器版）

\`\`\`python
@contextmanager
def temp_attr(obj, **changes):
    original = {k: getattr(obj, k) for k in changes}
    for k, v in changes.items():
        setattr(obj, k, v)
    try:
        yield obj
    finally:
        for k, v in original.items():
            setattr(obj, k, v)
\`\`\`

\`contextmanager\` 是绝大多数场景的首选，比写类简洁得多。

---

## 五、contextlib 工具箱

### 5.1 contextlib.suppress

\`suppress(*exceptions)\` 上下文管理器：忽略指定的异常。比 \`try/except: pass\` 更清晰。

\`\`\`python
from contextlib import suppress

with suppress(FileNotFoundError):
    os.remove("不存在的文件.txt")
print("继续执行，异常被忽略")
\`\`\`

等价于：

\`\`\`python
try:
    os.remove("不存在的文件.txt")
except FileNotFoundError:
    pass
\`\`\`

### 5.2 contextlib.redirect_stdout / redirect_stderr

重定向标准输出/错误输出到另一个文件对象。常用于「捕获 print 输出」或「静默第三方库的输出」。

\`\`\`python
from contextlib import redirect_stdout
import io

buffer = io.StringIO()
with redirect_stdout(buffer):
    print("这行不会显示在屏幕上")
    print("而是进了 buffer")
print("捕获到的内容:", buffer.getvalue())
\`\`\`

### 5.3 contextlib.redirect_stderr

同理，重定向 stderr：

\`\`\`python
import sys
from contextlib import redirect_stderr

buffer = io.StringIO()
with redirect_stderr(buffer):
    sys.stderr.write("错误信息")
print("捕获 stderr:", buffer.getvalue())
\`\`\`

### 5.4 contextlib.closing

\`closing(thing)\` 给一个「有 \`close\` 方法但不是上下文管理器」的对象包装成上下文管理器，退出时调用 \`close\`。

\`\`\`python
from contextlib import closing
from urllib.request import urlopen

with closing(urlopen("http://example.com")) as page:
    html = page.read()
# page.close() 自动调用
\`\`\`

### 5.5 contextlib.nullcontext

\`nullcontext()\` 是一个「什么都不做」的上下文管理器，作为「可选上下文」的占位符很有用：

\`\`\`python
from contextlib import nullcontext

def process(lock=None):
    with (lock or nullcontext()):
        print("处理中")

process()           # 无锁
process(threading.Lock())   # 有锁
\`\`\`

---

## 六、ExitStack 管理多个上下文

### 6.1 动态管理多个上下文

当你需要「动态地、数量不定地」管理多个上下文时，\`ExitStack\` 是利器。它维护一个「上下文栈」，退出时按 LIFO 顺序逐个清理。

\`\`\`python
from contextlib import ExitStack

files = []
filenames = ["a.txt", "b.txt", "c.txt"]
with ExitStack() as stack:
    for name in filenames:
        f = stack.enter_context(open(name, "w"))
        files.append(f)
        f.write("hello " + name)
    # 离开 with 块时，所有文件按 LIFO 顺序关闭
\`\`\`

\`enter_context(cm)\` 把一个上下文管理器压入栈，返回它的 \`__enter__\` 结果。退出时按相反顺序调用 \`__exit__\`。

### 6.2 callback 注册

\`ExitStack.callback(func, *args)\` 注册一个「退出时调用的函数」，相当于一个简化的清理回调。

\`\`\`python
from contextlib import ExitStack

def cleanup(name):
    print("清理", name)

with ExitStack() as stack:
    stack.callback(cleanup, "资源1")
    stack.callback(cleanup, "资源2")
    stack.callback(cleanup, "资源3")
    print("工作中...")
# 退出时按 LIFO 调用：资源3、资源2、资源1
\`\`\`

### 6.3 混合使用

\`ExitStack\` 可以混合 \`enter_context\` 和 \`callback\`：

\`\`\`python
with ExitStack() as stack:
    f = stack.enter_context(open("data.txt", "w"))
    stack.callback(print, "文件已关闭")
    stack.callback(lambda: print("其他清理"))
    f.write("data")
\`\`\`

### 6.4 条件性进入上下文

\`ExitStack\` 适合「根据条件决定要不要进入某个上下文」：

\`\`\`python
def process(use_cache, use_db):
    with ExitStack() as stack:
        cache = stack.enter_context(get_cache()) if use_cache else None
        db = stack.enter_context(get_db()) if use_db else None
        # ... 使用 cache 和 db ...
\`\`\`

---

## 七、异步上下文管理器

### 7.1 __aenter__ 与 __aexit__

异步上下文管理器用 \`__aenter__\` 和 \`__aexit__\`（注意是 \`a\` 开头），配合 \`async with\` 使用。它们是协程，要 \`await\`。

\`\`\`python
class AsyncResource:
    async def __aenter__(self):
        print("异步获取资源")
        return self
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        print("异步释放资源")
        return False

async def main():
    async with AsyncResource() as r:
        print("使用资源")

import asyncio
asyncio.run(main())
\`\`\`

### 7.2 contextlib.asynccontextmanager

和同步版对应，\`asynccontextmanager\` 用「带 \`yield\` 的异步生成器」定义异步上下文管理器：

\`\`\`python
from contextlib import asynccontextmanager

@asynccontextmanager
async def async_db():
    print("异步连接数据库")
    conn = "AsyncConnection"
    try:
        yield conn
    finally:
        print("异步关闭数据库")

async def main():
    async with async_db() as db:
        print("使用", db)

asyncio.run(main())
\`\`\`

### 7.3 AsyncExitStack

\`contextlib.AsyncExitStack\` 是 \`ExitStack\` 的异步版本，用 \`enter_async_context\` 管理异步上下文。

\`\`\`python
from contextlib import AsyncExitStack

async def main():
    async with AsyncExitStack() as stack:
        r1 = await stack.enter_async_context(AsyncResource())
        r2 = await stack.enter_async_context(AsyncResource())
        print("使用", r1, r2)
\`\`\`

---

## 八、实战示例

### 8.1 数据库事务

\`\`\`python
@contextmanager
def transaction(db):
    db.begin()
    try:
        yield db
        db.commit()
    except:
        db.rollback()
        raise

with transaction(db) as tx:
    tx.execute("INSERT ...")
    tx.execute("UPDATE ...")
# 全部成功才 commit，任何一个失败就 rollback
\`\`\`

### 8.2 锁

\`\`\`python
import threading

lock = threading.Lock()
with lock:
    # 临界区，同一时刻只有一个线程能进入
    pass
# 离开自动释放锁
\`\`\`

### 8.3 临时切换工作目录

\`\`\`python
import os

@contextmanager
def cd(path):
    old = os.getcwd()
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(old)

with cd("/tmp"):
    print("当前目录:", os.getcwd())
print("回到:", os.getcwd())
\`\`\`

### 8.4 资源清理

\`\`\`python
@contextmanager
def managed_file(path):
    f = open(path, "w")
    try:
        yield f
    finally:
        f.close()
        # 可选：删除临时文件
\`\`\`

---

## 九、常见陷阱与最佳实践

### 9.1 别在 __enter__ 里 yield

\`__enter__\` 应该返回一个普通对象，不能是生成器。\`contextmanager\` 装饰器帮你处理了这点。

### 9.2 __exit__ 返回值要明确

\`__exit__\` 不写 return 等于返回 \`None\`（假值），异常会正常传播。如果你想抑制异常，必须显式 \`return True\`。永远不要「忘了 return」——这会导致难以察觉的 bug。

### 9.3 上下文管理器可以复用吗

通常一个上下文管理器实例只用一次。如果要在多处复用，每次 \`with\` 都会重新走 \`__enter__\`/\`__exit__\`。但用 \`contextmanager\` 装饰的函数，每次调用返回新的上下文管理器，天然可复用。

### 9.4 嵌套 with 与 ExitStack

多个 \`with\` 嵌套时，可以用 \`ExitStack\` 扁平化：

\`\`\`python
# 嵌套写法
with open("a") as fa:
    with open("b") as fb:
        with open("c") as fc:
            pass

# ExitStack 扁平化
with ExitStack() as stack:
    fa = stack.enter_context(open("a"))
    fb = stack.enter_context(open("b"))
    fc = stack.enter_context(open("c"))
\`\`\`

---

## 十、小结

- \`with\` 语句调用 \`__enter__\` 进入、\`__exit__\` 退出，保证清理代码必执行。
- \`__exit__\` 返回 True 抑制异常，返回 False/None 传播异常。
- 自定义上下文管理器：写类（\`__enter__\`/\`__exit__\`）或用 \`@contextmanager\`（生成器，推荐）。
- \`contextlib\` 工具：\`suppress\` 忽略异常、\`redirect_stdout/stderr\` 重定向、\`closing\` 包装、\`nullcontext\` 占位。
- \`ExitStack\` 动态管理多个上下文，\`callback\` 注册清理函数。
- 异步版：\`__aenter__\`/\`__aexit__\` + \`async with\`，\`asynccontextmanager\`，\`AsyncExitStack\`。
- 实战：事务、锁、计时器、临时状态、资源清理。

上下文管理器是 Python 资源管理的基石，掌握它能让你的代码更健壮、更简洁。
`,
    code: `# =============================================================
# 第三章：上下文管理器深入 - 可运行示例
# =============================================================

print("=" * 60)
print("1. with 语句原理")
print("=" * 60)

class MyCtx:
    def __enter__(self):
        print("  __enter__ 被调用")
        return "资源对象"
    def __exit__(self, exc_type, exc_val, exc_tb):
        print("  __exit__ 被调用, exc_type =", exc_type)
        return False

print("正常退出:")
with MyCtx() as r:
    print("  with 块里, r =", r)
print("  with 结束")

print()
print("异常退出:")
try:
    with MyCtx() as r:
        print("  with 块里, r =", r)
        raise ValueError("故意出错")
except ValueError as e:
    print("  外部捕获:", e)

print()
print("=" * 60)
print("2. __exit__ 返回值与异常抑制")
print("=" * 60)

class SuppressValueError:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is ValueError:
            print("  捕获并吞掉 ValueError:", exc_val)
            return True
        print("  其他异常不吞, exc_type =", exc_type)
        return False

print("吞掉 ValueError:")
with SuppressValueError():
    raise ValueError("一个值错误")
print("  继续执行")

print()
print("不吞 RuntimeError:")
try:
    with SuppressValueError():
        raise RuntimeError("运行时错误")
except RuntimeError as e:
    print("  外部捕获:", e)

print()
print("=" * 60)
print("3. __exit__ 的三个参数")
print("=" * 60)

import traceback as tb_mod

class DebugCtx:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            print("  捕获到异常:")
            print("    类型:", exc_type.__name__)
            print("    值:", exc_val)
            print("    traceback 行数:", tb_mod.extract_tb(exc_tb))
        return False

try:
    with DebugCtx():
        raise KeyError("丢失的键")
except KeyError:
    print("  外部捕获 KeyError")

print()
print("=" * 60)
print("4. 自定义上下文管理器 - 数据库连接")
print("=" * 60)

class FakeDB:
    def __init__(self, dsn):
        self.dsn = dsn
        self.conn = None
    def __enter__(self):
        print("  连接数据库:", self.dsn)
        self.conn = "Connection(" + self.dsn + ")"
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            print("  有异常，执行回滚")
        else:
            print("  正常，执行提交")
        print("  关闭数据库连接")
        self.conn = None
        return False
    def execute(self, sql):
        return "执行: " + sql

print("正常流程:")
with FakeDB("postgres://localhost") as db:
    print("  ", db.execute("INSERT INTO t VALUES(1)"))
    print("  ", db.execute("UPDATE t SET x=2"))

print()
print("异常流程:")
try:
    with FakeDB("postgres://localhost") as db:
        print("  ", db.execute("INSERT INTO t VALUES(1)"))
        raise RuntimeError("写失败")
except RuntimeError as e:
    print("  外部捕获:", e)

print()
print("=" * 60)
print("5. 计时器上下文管理器")
print("=" * 60)

import time

class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self
    def __exit__(self, *args):
        self.elapsed = time.perf_counter() - self.start
        print("  耗时 %.6f 秒" % self.elapsed)
        return False

print("计算 1 到 1000000 的和:")
with Timer() as t:
    total = sum(range(1000000))
print("  结果:", total)

print()
print("=" * 60)
print("6. 临时切换状态")
print("=" * 60)

class TempAttr:
    def __init__(self, obj, **changes):
        self.obj = obj
        self.changes = changes
        self.original = {}
    def __enter__(self):
        for k in self.changes:
            self.original[k] = getattr(self.obj, k)
            setattr(self.obj, k, self.changes[k])
        return self.obj
    def __exit__(self, *args):
        for k, v in self.original.items():
            setattr(self.obj, k, v)
        return False

class Config:
    debug = False
    level = 1
    name = "prod"

cfg = Config()
print("before: debug =", cfg.debug, "level =", cfg.level, "name =", cfg.name)
with TempAttr(cfg, debug=True, level=5, name="test"):
    print("inside: debug =", cfg.debug, "level =", cfg.level, "name =", cfg.name)
print("after:  debug =", cfg.debug, "level =", cfg.level, "name =", cfg.name)

print()
print("=" * 60)
print("7. contextlib.contextmanager 装饰器")
print("=" * 60)

from contextlib import contextmanager

@contextmanager
def my_ctx():
    print("  进入 (相当于 __enter__)")
    yield "资源"
    print("  退出 (相当于 __exit__)")

with my_ctx() as r:
    print("  使用", r)

print()
print("生成器方式处理异常:")
@contextmanager
def safe_ctx():
    print("  进入")
    try:
        yield "资源"
    except ValueError as e:
        print("  捕获 ValueError:", e)
    finally:
        print("  清理")

with safe_ctx() as r:
    print("  使用", r)
    raise ValueError("出错了")
print("  继续")

print()
print("=" * 60)
print("8. 计时器（生成器版）")
print("=" * 60)

@contextmanager
def timer(name="block"):
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        print("  " + name + " 耗时 %.6f 秒" % elapsed)

with timer("排序"):
    sorted(range(100000, 0, -1))
with timer("求和"):
    sum(range(1000000))

print()
print("=" * 60)
print("9. contextlib.suppress 忽略异常")
print("=" * 60)

from contextlib import suppress

print("忽略 FileNotFoundError:")
import os
with suppress(FileNotFoundError):
    os.remove("这个文件不存在.txt")
print("  继续执行，异常被忽略")

print("不忽略 TypeError:")
try:
    with suppress(FileNotFoundError):
        raise TypeError("类型错误")
except TypeError as e:
    print("  外部捕获:", e)

print()
print("=" * 60)
print("10. contextlib.redirect_stdout / redirect_stderr")
print("=" * 60)

import io
import sys
from contextlib import redirect_stdout, redirect_stderr

print("重定向 stdout:")
buffer = io.StringIO()
with redirect_stdout(buffer):
    print("这行进入 buffer")
    print("这行也进入 buffer")
captured = buffer.getvalue()
print("  捕获到的内容:", repr(captured.strip()))

print("重定向 stderr:")
err_buffer = io.StringIO()
with redirect_stderr(err_buffer):
    sys.stderr.write("一条错误信息")
print("  捕获 stderr:", repr(err_buffer.getvalue()))

print()
print("=" * 60)
print("11. contextlib.closing")
print("=" * 60)

from contextlib import closing

class Page:
    def close(self):
        print("  Page.close() 被调用")
    def read(self):
        return "页面内容"

with closing(Page()) as page:
    print("  读取:", page.read())

print()
print("=" * 60)
print("12. contextlib.nullcontext")
print("=" * 60)

from contextlib import nullcontext

class FakeLock:
    """简易锁：演示用，真实场景请用 threading.Lock"""
    def __enter__(self):
        print("  [加锁]")
        return self
    def __exit__(self, *exc):
        print("  [解锁]")
        return False

def process(lock=None):
    ctx = lock if lock else nullcontext()
    with ctx:
        print("  处理中 (lock =", lock, ")")

print("无锁调用:")
process()
print("有锁调用:")
process(FakeLock())

print()
print("=" * 60)
print("13. ExitStack 管理多个上下文")
print("=" * 60)

from contextlib import ExitStack

class Step:
    def __init__(self, name):
        self.name = name
    def __enter__(self):
        print("  开始", self.name)
        return self
    def __exit__(self, *args):
        print("  结束", self.name)
        return False

print("用 ExitStack 管理多个步骤:")
with ExitStack() as stack:
    stack.enter_context(Step("步骤1"))
    stack.enter_context(Step("步骤2"))
    stack.enter_context(Step("步骤3"))
    print("  --- 全部进入，开始工作 ---")

print()
print("ExitStack.callback 注册清理:")
def cleanup(name):
    print("  清理", name)

with ExitStack() as stack:
    stack.callback(cleanup, "资源1")
    stack.callback(cleanup, "资源2")
    stack.callback(cleanup, "资源3")
    print("  工作中...")

print()
print("ExitStack 混合使用:")
class File:
    def __init__(self, name):
        self.name = name
    def __enter__(self):
        print("  打开文件", self.name)
        return self
    def __exit__(self, *args):
        print("  关闭文件", self.name)
        return False
    def write(self, data):
        print("  写入", self.name, ":", data)

with ExitStack() as stack:
    f = stack.enter_context(File("a.txt"))
    stack.callback(print, "  所有文件已关闭")
    f.write("hello")

print()
print("=" * 60)
print("14. 异步上下文管理器")
print("=" * 60)

import asyncio

class AsyncResource:
    async def __aenter__(self):
        print("  异步获取资源")
        await asyncio.sleep(0.01)
        return self
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        print("  异步释放资源")
        await asyncio.sleep(0.01)
        return False
    def use(self):
        return "异步资源被使用"

async def async_main():
    print("async with 示例:")
    async with AsyncResource() as r:
        print("  ", r.use())

asyncio.run(async_main())

print()
print("=" * 60)
print("15. contextlib.asynccontextmanager")
print("=" * 60)

from contextlib import asynccontextmanager

@asynccontextmanager
async def async_db(dsn):
    print("  异步连接数据库:", dsn)
    await asyncio.sleep(0.01)
    conn = "AsyncConnection(" + dsn + ")"
    try:
        yield conn
    finally:
        print("  异步关闭数据库")
        await asyncio.sleep(0.01)

async def db_main():
    async with async_db("mysql://localhost") as db:
        print("  使用", db)

asyncio.run(db_main())

print()
print("=" * 60)
print("16. AsyncExitStack")
print("=" * 60)

from contextlib import AsyncExitStack

async def stack_main():
    async with AsyncExitStack() as stack:
        r1 = await stack.enter_async_context(AsyncResource())
        r2 = await stack.enter_async_context(AsyncResource())
        print("  使用", r1.use(), "和", r2.use())

asyncio.run(stack_main())

print()
print("=" * 60)
print("17. 实战：数据库事务")
print("=" * 60)

class FakeConn:
    def begin(self): print("  BEGIN")
    def commit(self): print("  COMMIT")
    def rollback(self): print("  ROLLBACK")
    def execute(self, sql): print("  EXEC:", sql); return "ok"

@contextmanager
def transaction(conn):
    conn.begin()
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise

conn = FakeConn()
print("正常事务:")
with transaction(conn):
    conn.execute("INSERT 1")
    conn.execute("INSERT 2")

print("失败事务:")
try:
    with transaction(conn):
        conn.execute("INSERT 3")
        raise RuntimeError("写入失败")
except RuntimeError as e:
    print("  外部捕获:", e)

print()
print("=" * 60)
print("18. 实战：临时切换工作目录")
print("=" * 60)

import os

@contextmanager
def cd(path):
    old = os.getcwd()
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(old)

print("当前目录:", os.getcwd())
import tempfile
with cd(tempfile.gettempdir()):
    print("  切换到:", os.getcwd())
print("回到:", os.getcwd())

print()
print("=" * 60)
print("19. 实战：锁的模拟")
print("=" * 60)

import threading

class Counter:
    def __init__(self):
        self.value = 0
        self.lock = threading.Lock()
    def inc(self):
        with self.lock:
            current = self.value
            current += 1
            self.value = current

counter = Counter()
threads = [threading.Thread(target=lambda: [counter.inc() for _ in range(1000)]) for _ in range(5)]
for t in threads:
    t.start()
for t in threads:
    t.join()
print("  5 个线程各加 1000 次, 最终值 =", counter.value)

print()
print("=" * 60)
print("20. 实战：带清理的临时资源")
print("=" * 60)

@contextmanager
def managed_resource(name):
    print("  分配资源:", name)
    resource = {"name": name, "alive": True}
    try:
        yield resource
    finally:
        resource["alive"] = False
        print("  释放资源:", name, "(alive=False)")

with managed_resource("BufferA") as r:
    print("  使用资源:", r)

print()
print("=" * 60)
print("21. 嵌套 with 与 ExitStack 对比")
print("=" * 60)

print("嵌套写法:")
with Step("外层"):
    with Step("中层"):
        with Step("内层"):
            print("  --- 最里层 ---")

print("ExitStack 扁平化:")
with ExitStack() as stack:
    stack.enter_context(Step("外层"))
    stack.enter_context(Step("中层"))
    stack.enter_context(Step("内层"))
    print("  --- 最里层 ---")

print()
print("=" * 60)
print("22. 实战：捕获 print 输出做测试")
print("=" * 60)

def function_that_prints():
    print("正在处理...")
    print("完成!")
    return 42

@contextmanager
def capture_print():
    buffer = io.StringIO()
    with redirect_stdout(buffer):
        yield buffer

with capture_print() as out:
    result = function_that_prints()
print("  函数返回:", result)
print("  捕获的输出:", repr(out.getvalue().strip()))

print()
print("=" * 60)
print("全部演示完成！")
print("=" * 60)
`,
  },

  // =========================================================
  // 第四章：类型注解与静态检查
  // =========================================================
  {
    id: "py-typing-mypy",
    group: "高级特性与工程",
    icon: "🏷️",
    title: "类型注解与静态检查",
    content: `# 类型注解与静态检查

Python 是动态类型语言，变量不需要声明类型。但从 Python 3.5 开始，官方引入了「类型注解（Type Hints）」，让你可以「可选地」给变量、函数、类标注类型。这些注解在运行时**不会强制检查**，但可以被静态检查工具（如 mypy）利用，在「运行前」发现类型错误。

类型注解带来的是「渐进式类型化（Gradual Typing）」——你可以从无类型开始，逐步给关键部分加注解，享受静态类型的好处而不牺牲 Python 的灵活性。本章系统讲解 \`typing\` 模块、各种注解语法、泛型、\`Protocol\`、\`mypy\` 的使用。

---

## 一、typing 模块与基本注解

### 1.1 变量注解

变量注解用 \`:\` 加类型：

\`\`\`python
x: int = 10
name: str = "Alice"
price: float = 9.99
flag: bool = True
data: bytes = b"hello"
\`\`\`

注意：注解只是「提示」，运行时不强制。\`x: int = "hello"\` 不会报错（但 mypy 会警告）。

### 1.2 函数注解

函数注解标注「参数类型」和「返回类型」：

\`\`\`python
def greet(name: str) -> str:
    return "hello, " + name

def add(a: int, b: int) -> int:
    return a + b

def nothing() -> None:
    print("无返回值")
\`\`\`

\`-> None\` 表示函数没有有意义的返回值。\`-> str\` 表示返回字符串。

### 1.3 注解存储在哪

注解存放在函数/类的 \`__annotations__\` 属性里，是个字典：

\`\`\`python
def f(a: int, b: str) -> bool:
    return True

print(f.__annotations__)
# {'a': <class 'int'>, 'b': <class 'str'>, 'return': <class 'bool'>}
\`\`\`

运行时你可以通过 \`typing.get_type_hints()\` 拿到解析后的注解（处理了字符串形式的注解）。

---

## 二、容器注解

### 2.1 用内置类型做泛型（Python 3.9+）

Python 3.9 起，内置容器类型可以直接用作泛型，无需从 \`typing\` 导入：

\`\`\`python
def average(nums: list[int]) -> float:
    return sum(nums) / len(nums)

def count_words(text: str) -> dict[str, int]:
    ...

def first_pair(pairs: list[tuple[str, int]]) -> tuple[str, int]:
    return pairs[0]
\`\`\`

### 2.2 tuple 的特殊语法

\`tuple\` 有两种注解方式：

- **定长元组**：\`tuple[int, str, bool]\` 表示长度固定为 3，类型分别是 int、str、bool。
- **变长元组**：\`tuple[int, ...]\` 表示「全是 int 的变长元组」（\`...\` 是字面省略号）。

\`\`\`python
def process(point: tuple[int, int]) -> float:
    x, y = point
    return (x ** 2 + y ** 2) ** 0.5

def sum_all(values: tuple[int, ...]) -> int:
    return sum(values)
\`\`\`

### 2.3 旧式写法（3.9 之前）

Python 3.9 之前要用 \`typing.List\`、\`typing.Dict\`、\`typing.Tuple\`（大写首字母）：

\`\`\`python
from typing import List, Dict, Tuple

def average(nums: List[int]) -> float: ...
def count(text: str) -> Dict[str, int]: ...
def first(pairs: List[Tuple[str, int]]) -> Tuple[str, int]: ...
\`\`\`

现在新代码推荐用小写内置类型（3.9+），但你在老代码和很多库里仍会看到大写版本。

---

## 三、Optional、Union、Any

### 3.1 Optional[X]

\`Optional[X]\` 等价于 \`X | None\`，表示「可以是 X，也可以是 None」：

\`\`\`python
from typing import Optional

def find_user(uid: int) -> Optional[str]:
    if uid == 1:
        return "Alice"
    return None   # 找不到返回 None
\`\`\`

Python 3.10+ 可以用 \`str | None\` 代替 \`Optional[str]\`。

### 3.2 Union[X, Y]

\`Union[X, Y]\` 表示「可以是 X 或 Y」：

\`\`\`python
from typing import Union

def process(value: Union[int, str]) -> str:
    if isinstance(value, int):
        return str(value)
    return value.upper()
\`\`\`

Python 3.10+ 用 \`int | str\` 代替 \`Union[int, str]\`，更简洁。

### 3.3 Any

\`Any\` 表示「任意类型」，相当于「不检查」。它是渐进式类型化的「逃生舱」：

\`\`\`python
from typing import Any

def log(data: Any) -> None:
    print(data)   # 接受任何类型
\`\`\`

尽量少用 \`Any\`，它会让类型检查失效。只有在「确实无法确定类型」时才用。

---

## 四、Callable

\`Callable\` 标注「可调用对象」（函数、lambda、实现了 \`__call__\` 的类）：

\`\`\`python
from typing import Callable

def apply(func: Callable[[int, int], int], a: int, b: int) -> int:
    return func(a, b)

print(apply(lambda x, y: x + y, 3, 4))
\`\`\`

\`Callable[[int, int], int]\` 表示「参数是 (int, int)，返回 int」的可调用对象。

Python 3.9+ 也可以用 \`Callable[..., int]\` 表示「参数任意，返回 int」。

\`\`\`python
# 不带参数注解的 Callable
def run(fn: Callable[..., None]) -> None:
    fn()
\`\`\`

---

## 五、类型别名与 TypeAlias

### 5.1 简单别名

直接赋值就能创建类型别名：

\`\`\`python
Vector = list[float]
Matrix = list[Vector]   # list[list[float]]

def dot(a: Vector, b: Vector) -> float:
    return sum(x * y for x, y in zip(a, b))
\`\`\`

### 5.2 TypeAlias（3.10+）

\`TypeAlias\` 显式声明「这是类型别名，不是普通变量」：

\`\`\`python
from typing import TypeAlias

Vector: TypeAlias = list[float]
UserId: TypeAlias = int
\`\`\`

好处是让意图更清晰，也帮助类型检查器区分「类型别名」和「普通赋值」。

---

## 六、TypeVar 泛型变量

### 6.1 基本用法

\`TypeVar\` 定义一个「类型变量」，让函数的「参数类型」和「返回类型」保持一致：

\`\`\`python
from typing import TypeVar

T = TypeVar("T")

def first(items: list[T]) -> T:
    return items[0]

# 调用 first([1,2,3]) 时，T 被推断为 int，返回 int
# 调用 first(["a","b"]) 时，T 被推断为 str，返回 str
\`\`\`

\`first\` 对任何类型的列表都适用，且能保证「返回类型和元素类型一致」。这是泛型函数的核心。

### 6.2 约束 TypeVar

可以用 \`bound\` 或 \`constrained\` 限制 TypeVar 的范围：

\`\`\`python
# bound: T 必须是 Animal 或其子类
class Animal: ...
class Dog(Animal): ...

T = TypeVar("T", bound=Animal)

def clone(a: T) -> T:
    return a

# constrained: T 只能是 int 或 str
N = TypeVar("N", int, str)
def double(x: N) -> N:
    return x + x
\`\`\`

---

## 七、Generic 泛型类

\`Generic\` 让你定义「泛型类」——一个类能适配多种类型：

\`\`\`python
from typing import Generic, TypeVar

T = TypeVar("T")

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []
    def push(self, item: T) -> None:
        self._items.append(item)
    def pop(self) -> T:
        return self._items.pop()

s: Stack[int] = Stack()
s.push(1)
s.push(2)
print(s.pop())   # 2
\`\`\`

\`Stack[int]\` 表示「装 int 的栈」。mypy 会检查你不会往 int 栈里 push 字符串。

\`list\`、\`dict\`、\`set\` 本身都是泛型类，\`list[int]\` 就是「实例化泛型类」。

### 7.1 多类型参数

\`\`\`python
K = TypeVar("K")
V = TypeVar("V")

class Pair(Generic[K, V]):
    def __init__(self, key: K, value: V) -> None:
        self.key = key
        self.value = value

p: Pair[str, int] = Pair("age", 30)
\`\`\`

---

## 八、Type[T]

\`Type[T]\`（3.10+ 也叫 \`type[T]\`）标注「类本身」而非实例。常用于工厂函数：

\`\`\`python
from typing import Type, TypeVar

T = TypeVar("T", bound="Animal")

class Animal:
    @classmethod
    def create(cls: Type[T]) -> T:
        return cls()

class Dog(Animal): pass

d = Dog.create()   # 返回 Dog 实例
\`\`\`

\`Type[Animal]\` 表示「Animal 类或其子类」（注意是类，不是实例）。

---

## 九、overload 重载

\`@overload\` 让你为「同一个函数的不同参数类型」定义不同的返回类型签名，帮助类型检查器推断：

\`\`\`python
from typing import overload

@overload
def parse(value: int) -> str: ...
@overload
def parse(value: str) -> int: ...

def parse(value):
    if isinstance(value, int):
        return str(value)
    return int(value)
\`\`\`

注意：\`@overload\` 的版本只是「签名」，用 \`...\` 占位（或者 \`pass\`），真正实现只有最后一个无装饰器的版本。mypy 会根据参数类型选择对应的签名。

---

## 十、Literal

\`Literal\` 表示「字面量类型」，常用于「限定参数只能是某几个具体值」：

\`\`\`python
from typing import Literal

def set_mode(mode: Literal["r", "w", "a"]) -> None:
    print("模式:", mode)

set_mode("r")   # OK
# set_mode("x")   # mypy 报错：Argument has incompatible type "x"
\`\`\`

\`Literal\` 配合 \`LiteralString\`（3.11+）能在「字符串拼接」层面做类型追踪，常用于 SQL 注入防护。

## 十一、TypedDict

\`TypedDict\` 给「字典」加上结构化类型约束，标注每个 key 的 value 类型：

\`\`\`python
from typing import TypedDict

class UserInfo(TypedDict):
    name: str
    age: int
    email: str

u: UserInfo = {"name": "Alice", "age": 30, "email": "a@b.com"}
print(u["name"])
\`\`\`

mypy 会检查 key 是否齐全、value 类型是否匹配。\`TypedDict\` 是处理 JSON、API 响应等「类对象字典」的利器。

### 11.1 total=False 可选 key

\`\`\`python
class PartialUser(TypedDict, total=False):
    name: str
    age: int

# 所有 key 都是可选的
u: PartialUser = {}
\`\`\`

\`total=False\` 让所有 key 可选；也可以用 \`Required\`/\`NotRequired\`（3.11+）单独控制。

## 十二、Protocol 结构化子类型

\`Protocol\`（3.8+）定义「结构化类型」——只要对象有这些方法/属性，就算符合协议，不需要继承。这就是「鸭子类型」的静态检查版。

\`\`\`python
from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> None: ...

def render(obj: Drawable) -> None:
    obj.draw()

class Circle:
    def draw(self) -> None:
        print("画圆")

render(Circle())   # OK，Circle 有 draw 方法，符合 Drawable 协议
\`\`\`

\`Circle\` 没有继承 \`Drawable\`，但因为有 \`draw\` 方法，mypy 认为它符合 \`Drawable\` 协议。这比 ABC 更灵活——不需要修改原有类。

### 12.1 runtime_checkable

\`@runtime_checkable\` 让 Protocol 支持 \`isinstance\` 检查（只检查方法是否存在，不检查签名）：

\`\`\`python
from typing import Protocol, runtime_checkable

@runtime_checkable
class Sized(Protocol):
    def __len__(self) -> int: ...

print(isinstance([1,2,3], Sized))   # True
print(isinstance("abc", Sized))     # True
print(isinstance(42, Sized))        # False
\`\`\`

## 十三、Final 与 ClassVar

### 13.1 Final

\`Final\` 标注「不可重新赋值」的变量（常量）：

\`\`\`python
from typing import Final

MAX_SIZE: Final[int] = 100

# mypy 会警告：Cannot assign to final name "MAX_SIZE"
# MAX_SIZE = 200
\`\`\`

\`Final\` 也可用于方法参数和属性，表示「不应被覆盖」。

### 13.2 ClassVar

\`ClassVar\` 标注「类变量」而非实例变量：

\`\`\`python
from typing import ClassVar

class Config:
    instances: ClassVar[int] = 0   # 类变量
    name: str                       # 实例变量

    def __init__(self, name: str):
        self.name = name
        Config.instances += 1
\`\`\`

mypy 会阻止你通过实例访问 \`ClassVar\` 后赋值（应该通过类访问）。

## 十四、ParamSpec（3.10+）

\`ParamSpec\` 捕获「函数的参数签名」，常用于装饰器的类型保持：

\`\`\`python
from typing import ParamSpec, TypeVar, Callable
from functools import wraps

P = ParamSpec("P")
R = TypeVar("R")

def log(fn: Callable[P, R]) -> Callable[P, R]:
    @wraps(fn)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        print("调用", fn.__name__)
        return fn(*args, **kwargs)
    return wrapper

@log
def add(a: int, b: int) -> int:
    return a + b
\`\`\`

\`ParamSpec\` 让装饰器保留原函数的参数签名，mypy 能正确检查被装饰后的函数。3.10 之前这是很难做到的。

## 十五、mypy 安装与使用

### 15.1 安装

\`\`\`bash
pip install mypy
\`\`\`

### 15.2 基本使用

\`\`\`bash
mypy myscript.py
\`\`\`

mypy 会扫描脚本的类型注解，报告类型错误。例如：

\`\`\`python
def add(a: int, b: int) -> int:
    return a + b

add(1, "2")   # mypy 报错：Argument 2 has incompatible type "str"
\`\`\`

### 15.3 严格模式

\`--strict\` 开启最严格的检查：

\`\`\`bash
mypy --strict myscript.py
\`\`\`

包括：所有函数必须注解、不允许 \`Any\`、严格可选检查等。适合新项目从一开始就保持类型严谨。

### 15.4 渐进式类型化

mypy 支持「渐进式类型化」——没注解的代码默认不检查。你可以逐步给关键模块加注解，老代码不用一次性改完。

配置文件 \`mypy.ini\` 或 \`pyproject.toml\` 里可以精细控制：

\`\`\`toml
[tool.mypy]
python_version = "3.10"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = false   # 暂不强制所有函数注解

[[tool.mypy.overrides]]
module = "legacy.*"
ignore_errors = true   # 老代码忽略错误
\`\`\`

## 十六、类型 narrowed

mypy 能根据 \`isinstance\`、\`if x is None\` 等条件「收窄」类型推断：

\`\`\`python
def process(x: int | str) -> int:
    if isinstance(x, int):
        return x + 1   # 这里 x 被推断为 int
    else:
        return len(x)  # 这里 x 被推断为 str
\`\`\`

\`isinstance\` 分支后，mypy 知道 \`x\` 在不同分支里是不同类型，从而正确检查。这叫「类型收窄（narrowing）」。

\`\`\`python
def first(items: list[int | None]) -> int:
    x = items[0]
    if x is None:
        return 0
    return x + 1   # 这里 x 被 narrowed 为 int
\`\`\`

## 十七、运行时类型检查 isinstance vs 注解

类型注解是「静态」的，运行时不生效。如果你需要「运行时」检查类型，仍要用 \`isinstance\`：

\`\`\`python
def add(a: int, b: int) -> int:
    # 注解只是给 mypy 看，运行时 a、b 可以是任何类型
    if not isinstance(a, int) or not isinstance(b, int):
        raise TypeError("需要 int")
    return a + b
\`\`\`

也有第三方库（如 \`pydantic\`、\`typeguard\`）能在运行时根据注解自动检查，但那是额外功能，不属于标准库。

## 十八、小结

- 类型注解是「可选的静态类型提示」，运行时不强制，mypy 等工具用于静态检查。
- 基本注解：\`int\`、\`str\`、\`list[int]\`、\`dict[str, int]\`、\`tuple[int, ...]\`。
- \`Optional[X]\` = \`X | None\`，\`Union[X, Y]\` = \`X | Y\`，\`Any\` 不检查。
- \`Callable[[int], str]\` 标注可调用对象。
- \`TypeVar\` + \`Generic\` 实现泛型函数和泛型类。
- \`@overload\` 定义重载签名，\`Literal\` 限定字面值，\`TypedDict\` 结构化字典，\`Protocol\` 结构化子类型。
- \`Final\` 常量、\`ClassVar\` 类变量、\`ParamSpec\` 装饰器类型保持。
- mypy 支持「渐进式类型化」，可从无类型逐步过渡到严格类型。

类型注解让大型 Python 项目更易维护、重构更安全、IDE 提示更智能。它是现代 Python 工程化的标配。`,
    code: `# =============================================================
# 第四章：类型注解与静态检查 - 演示注解写法（不调用 mypy）
# =============================================================

print("=" * 60)
print("1. 变量与函数注解")
print("=" * 60)

x: int = 10
name: str = "Alice"
price: float = 9.99
flag: bool = True
data: bytes = b"hello"

print("x =", x, "name =", name, "price =", price, "flag =", flag)
print("data =", data)

def greet(name: str) -> str:
    return "hello, " + name

def add(a: int, b: int) -> int:
    return a + b

def nothing() -> None:
    print("  无返回值函数")

print("greet('Bob') =", greet("Bob"))
print("add(3, 4) =", add(3, 4))
nothing()

# 注解存储在 __annotations__
def sample(a: int, b: str) -> bool:
    return True

print("sample.__annotations__ =", sample.__annotations__)

import typing
print("get_type_hints =", typing.get_type_hints(sample))

print()
print("=" * 60)
print("2. 容器注解（Python 3.9+ 内置泛型）")
print("=" * 60)

def average(nums: list[int]) -> float:
    return sum(nums) / len(nums)

def count_words(text: str) -> dict[str, int]:
    result: dict[str, int] = {}
    for word in text.split():
        result[word] = result.get(word, 0) + 1
    return result

def first_pair(pairs: list[tuple[str, int]]) -> tuple[str, int]:
    return pairs[0]

print("average([1,2,3,4]) =", average([1, 2, 3, 4]))
print("count_words('a b a c b a') =", count_words("a b a c b a"))
print("first_pair =", first_pair([("x", 1), ("y", 2)]))

# tuple 的两种写法
def distance(point: tuple[int, int]) -> float:
    x, y = point
    return (x * x + y * y) ** 0.5

def sum_all(values: tuple[int, ...]) -> int:
    return sum(values)

print("distance((3,4)) =", distance((3, 4)))
print("sum_all((1,2,3,4,5)) =", sum_all((1, 2, 3, 4, 5)))

print()
print("=" * 60)
print("3. Optional / Union / Any")
print("=" * 60)

from typing import Optional, Union, Any

def find_user(uid: int) -> Optional[str]:
    if uid == 1:
        return "Alice"
    return None

print("find_user(1) =", find_user(1))
print("find_user(2) =", find_user(2))

def process_value(value: Union[int, str]) -> str:
    if isinstance(value, int):
        return "数字: " + str(value)
    return "字符串: " + value.upper()

print(process_value(42))
print(process_value("hello"))

def log_anything(data: Any) -> None:
    print("  收到:", data)

log_anything(42)
log_anything("字符串")
log_anything([1, 2, 3])

# Python 3.10+ 的 | 语法
def modern(x: int | str | None) -> str:
    if x is None:
        return "空"
    if isinstance(x, int):
        return "整数 " + str(x)
    return "字符串 " + x

print("modern(5) =", modern(5))
print("modern('hi') =", modern("hi"))
print("modern(None) =", modern(None))

print()
print("=" * 60)
print("4. Callable")
print("=" * 60)

from typing import Callable

def apply(func: Callable[[int, int], int], a: int, b: int) -> int:
    return func(a, b)

print("apply(add, 3, 4) =", apply(lambda x, y: x + y, 3, 4))
print("apply(mul, 3, 4) =", apply(lambda x, y: x * y, 3, 4))

def run(fn: Callable[..., None]) -> None:
    print("  调用 fn:")
    fn()

run(lambda: print("    哈哈"))

# 可调用对象（实现 __call__ 的类）
class Multiplier:
    def __init__(self, factor: int):
        self.factor = factor
    def __call__(self, x: int) -> int:
        return x * self.factor

double: Multiplier = Multiplier(2)
print("double(5) =", double(5))

print()
print("=" * 60)
print("5. 类型别名")
print("=" * 60)

Vector = list[float]
Matrix = list[Vector]

def dot(a: Vector, b: Vector) -> float:
    return sum(x * y for x, y in zip(a, b))

def print_matrix(m: Matrix) -> None:
    for row in m:
        print("   ", row)

v1: Vector = [1.0, 2.0, 3.0]
v2: Vector = [4.0, 5.0, 6.0]
print("dot(v1, v2) =", dot(v1, v2))

mat: Matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
print("矩阵:")
print_matrix(mat)

from typing import TypeAlias
UserId: TypeAlias = int
UserName: TypeAlias = str

def get_user(uid: UserId) -> UserName:
    table = {1: "Alice", 2: "Bob"}
    return table.get(uid, "Unknown")

print("get_user(1) =", get_user(1))

print()
print("=" * 60)
print("6. TypeVar 泛型变量")
print("=" * 60)

from typing import TypeVar

T = TypeVar("T")

def first_item(items: list[T]) -> T:
    return items[0]

print("first_item([1,2,3]) =", first_item([1, 2, 3]))
print("first_item(['a','b']) =", first_item(["a", "b"]))
print("first_item([3.14]) =", first_item([3.14]))

# 约束 TypeVar
class Animal:
    def speak(self) -> str:
        return "..."

class Dog(Animal):
    def speak(self) -> str:
        return "汪汪"

class Cat(Animal):
    def speak(self) -> str:
        return "喵喵"

TAnimal = TypeVar("TAnimal", bound=Animal)

def clone(a: TAnimal) -> TAnimal:
    print("  克隆了", type(a).__name__)
    return a

d = Dog()
c = Cat()
clone(d)
clone(c)

# constrained TypeVar
N = TypeVar("N", int, str)
def double_it(x: N) -> N:
    return x + x

print("double_it(5) =", double_it(5))
print("double_it('ab') =", double_it("ab"))

print()
print("=" * 60)
print("7. Generic 泛型类")
print("=" * 60)

from typing import Generic

K = TypeVar("K")
V = TypeVar("V")

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []
    def push(self, item: T) -> None:
        self._items.append(item)
    def pop(self) -> T:
        return self._items.pop()
    def size(self) -> int:
        return len(self._items)
    def __repr__(self) -> str:
        return "Stack(" + str(self._items) + ")"

s: Stack[int] = Stack()
s.push(1)
s.push(2)
s.push(3)
print("int 栈:", s, "弹出:", s.pop(), "剩余大小:", s.size())

s2: Stack[str] = Stack()
s2.push("hello")
s2.push("world")
print("str 栈:", s2, "弹出:", s2.pop())

class Pair(Generic[K, V]):
    def __init__(self, key: K, value: V) -> None:
        self.key = key
        self.value = value
    def __repr__(self) -> str:
        return "Pair(" + repr(self.key) + ", " + repr(self.value) + ")"

p: Pair[str, int] = Pair("age", 30)
print(p)

print()
print("=" * 60)
print("8. Type[T] 标注类本身")
print("=" * 60)

from typing import Type

class Animal2:
    @classmethod
    def create(cls: Type["Animal2"]) -> "Animal2":
        return cls()
    def speak(self) -> str:
        return "..."

class Dog2(Animal2):
    def speak(self) -> str:
        return "汪汪"

class Cat2(Animal2):
    def speak(self) -> str:
        return "喵喵"

def factory(cls: Type[Animal2]) -> Animal2:
    return cls.create()

for cls in [Dog2, Cat2]:
    obj = factory(cls)
    print("  ", type(obj).__name__, "->", obj.speak())

print()
print("=" * 60)
print("9. overload 重载")
print("=" * 60)

from typing import overload

@overload
def parse(value: int) -> str: ...
@overload
def parse(value: str) -> int: ...

def parse(value):
    if isinstance(value, int):
        return "int:" + str(value)
    return int(value)

print("parse(42) =", parse(42))
print("parse('123') =", parse("123"))

print()
print("=" * 60)
print("10. Literal 字面量类型")
print("=" * 60)

from typing import Literal

def set_mode(mode: Literal["r", "w", "a"]) -> str:
    return "模式设为 " + mode

print(set_mode("r"))
print(set_mode("w"))
print(set_mode("a"))

# Literal 用于状态机
def handle_event(event: Literal["start", "stop", "pause"]) -> str:
    if event == "start":
        return "启动"
    elif event == "stop":
        return "停止"
    else:
        return "暂停"

for e in ["start", "stop", "pause"]:
    print("  ", e, "->", handle_event(e))

print()
print("=" * 60)
print("11. TypedDict 结构化字典")
print("=" * 60)

from typing import TypedDict

class UserInfo(TypedDict):
    name: str
    age: int
    email: str

u: UserInfo = {"name": "Alice", "age": 30, "email": "alice@example.com"}
print("UserInfo:", u)
print("  name:", u["name"], "age:", u["age"])

# total=False 全部可选
class PartialUser(TypedDict, total=False):
    name: str
    age: int

pu: PartialUser = {"name": "Bob"}
print("PartialUser (部分):", pu)
pu2: PartialUser = {"name": "Carol", "age": 25}
print("PartialUser (完整):", pu2)

print()
print("=" * 60)
print("12. Protocol 结构化子类型")
print("=" * 60)

from typing import Protocol, runtime_checkable

class Drawable(Protocol):
    def draw(self) -> str: ...

def render(obj: Drawable) -> None:
    print("  渲染:", obj.draw())

class Circle:
    def draw(self) -> str:
        return "一个圆"

class Square:
    def draw(self) -> str:
        return "一个方"

render(Circle())
render(Square())

@runtime_checkable
class Sized(Protocol):
    def __len__(self) -> int: ...

print("isinstance([1,2,3], Sized) =", isinstance([1, 2, 3], Sized))
print("isinstance('abc', Sized) =", isinstance("abc", Sized))
print("isinstance(42, Sized) =", isinstance(42, Sized))

print()
print("=" * 60)
print("13. Final 与 ClassVar")
print("=" * 60)

from typing import Final, ClassVar

MAX_SIZE: Final[int] = 100
APP_NAME: Final[str] = "MyApp"
print("MAX_SIZE =", MAX_SIZE, "APP_NAME =", APP_NAME)

class Counter:
    total: ClassVar[int] = 0
    label: ClassVar[str] = "计数器"
    def __init__(self, name: str) -> None:
        self.name = name
        Counter.total += 1
    def __repr__(self) -> str:
        return Counter.label + "(" + self.name + ")"

c1 = Counter("A")
c2 = Counter("B")
c3 = Counter("C")
print("Counter.total =", Counter.total)
print("实例:", c1, c2, c3)

print()
print("=" * 60)
print("14. ParamSpec 装饰器类型保持（3.10+）")
print("=" * 60)

from typing import ParamSpec
from functools import wraps

P = ParamSpec("P")
R = TypeVar("R")

def log_call(fn: Callable[P, R]) -> Callable[P, R]:
    @wraps(fn)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        print("  [log] 调用", fn.__name__, "参数:", args, kwargs)
        result = fn(*args, **kwargs)
        print("  [log]", fn.__name__, "返回:", result)
        return result
    return wrapper

@log_call
def add2(a: int, b: int) -> int:
    return a + b

@log_call
def greet2(name: str, greeting: str = "Hi") -> str:
    return greeting + ", " + name

print("调用 add2:")
add2(3, 4)
print("调用 greet2:")
greet2("Alice", greeting="Hello")

print()
print("=" * 60)
print("15. 类型收窄 (narrowing)")
print("=" * 60)

def process_union(x: int | str | None) -> int:
    if x is None:
        return 0
    if isinstance(x, int):
        return x * 2
    return len(x)

print("process_union(None) =", process_union(None))
print("process_union(5) =", process_union(5))
print("process_union('hello') =", process_union("hello"))

def first_positive(items: list[int | None]) -> int:
    for x in items:
        if x is not None and x > 0:
            return x
    return 0

print("first_positive([None, -1, 3, None]) =", first_positive([None, -1, 3, None]))

print()
print("=" * 60)
print("16. 运行时类型检查 isinstance vs 注解")
print("=" * 60)

def safe_add(a: int, b: int) -> int:
    # 注解只是提示，运行时仍要自己检查
    if not isinstance(a, int) or not isinstance(b, int):
        raise TypeError("需要 int，收到 " + str(type(a).__name__) + " 和 " + str(type(b).__name__))
    return a + b

print("safe_add(1, 2) =", safe_add(1, 2))
try:
    safe_add(1, "2")
except TypeError as e:
    print("  捕获:", e)

print()
print("=" * 60)
print("17. 综合实战：带类型的容器类")
print("=" * 60)

class TypedStack(Generic[T]):
    def __init__(self, initial: list[T] | None = None) -> None:
        self._items: list[T] = list(initial) if initial else []
    def push(self, item: T) -> None:
        self._items.append(item)
    def pop(self) -> T:
        if not self._items:
            raise IndexError("空栈")
        return self._items.pop()
    def peek(self) -> T:
        if not self._items:
            raise IndexError("空栈")
        return self._items[-1]
    def __len__(self) -> int:
        return len(self._items)
    def __repr__(self) -> str:
        return "TypedStack(" + repr(self._items) + ")"

int_stack: TypedStack[int] = TypedStack([1, 2, 3])
print("初始:", int_stack)
int_stack.push(4)
print("push(4) 后:", int_stack)
print("pop():", int_stack.pop())
print("peek():", int_stack.peek())
print("len:", len(int_stack))

print()
print("=" * 60)
print("18. 综合实战：带类型注解的数据类")
print("=" * 60)

class UserRecord:
    def __init__(self, id: int, name: str, email: str, active: bool = True) -> None:
        self.id = id
        self.name = name
        self.email = email
        self.active = active
    def __repr__(self) -> str:
        status = "活跃" if self.active else "禁用"
        return "User(" + str(self.id) + ", " + self.name + ", " + self.email + ", " + status + ")"
    def to_dict(self) -> dict[str, int | str | bool]:
        return {"id": self.id, "name": self.name, "email": self.email, "active": self.active}

users: list[UserRecord] = [
    UserRecord(1, "Alice", "alice@example.com"),
    UserRecord(2, "Bob", "bob@example.com", False),
    UserRecord(3, "Carol", "carol@example.com"),
]

print("用户列表:")
for u in users:
    print("  ", u)

active_users: list[UserRecord] = [u for u in users if u.active]
print("活跃用户数:", len(active_users))

print()
print("=" * 60)
print("19. pyproject.toml 中的 mypy 配置示例")
print("=" * 60)

mypy_config = """
[tool.mypy]
python_version = "3.10"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = false
check_untyped_defs = true

[[tool.mypy.overrides]]
module = "legacy.*"
ignore_errors = true

[[tool.mypy.overrides]]
module = "tests.*"
disallow_untyped_defs = false
"""
print("mypy 配置示例 (pyproject.toml):")
print(mypy_config)

print()
print("=" * 60)
print("20. mypy 命令行使用示例（仅打印命令，不执行）")
print("=" * 60)

commands = [
    "mypy script.py            # 检查单个文件",
    "mypy --strict script.py   # 严格模式",
    "mypy package/             # 检查整个包",
    "mypy --ignore-missing-imports script.py  # 忽略缺失的第三方类型",
    "mypy --python-version 3.10 script.py     # 指定目标 Python 版本",
]
print("常用 mypy 命令:")
for cmd in commands:
    print("  $", cmd)

print()
print("=" * 60)
print("全部演示完成！")
print("=" * 60)
`,
  },

  // =========================================================
  // 第五章：测试与调试
  // =========================================================
  {
    id: "py-testing",
    group: "高级特性与工程",
    icon: "🧪",
    title: "测试与调试",
    content: `# 测试与调试

测试是保证代码质量的基石。Python 标准库自带 \`unittest\` 框架，社区主流的 \`pytest\` 更强大更简洁。本章系统讲解 \`unittest\`、\`pytest\`（fixture、parametrize、mark）、\`mock\` 模块、\`doctest\`、覆盖率、TDD 概念，以及 \`pdb\` 调试器。掌握这些工具，你就能写出「敢改、能改」的高质量代码。

「没有测试的代码」和「有测试的代码」是两种完全不同的工程状态。前者每次改动都提心吊胆，后者每次改动都有安全网。本章带你从「不写测试」走向「测试驱动」。

---

## 一、unittest 框架

\`unittest\` 是 Python 标准库自带的测试框架，借鉴了 Java JUnit 的设计。它的核心概念是 \`TestCase\`（测试用例）、\`setUp\`/\`tearDown\`（前后置钩子）、断言方法、测试发现。

### 1.1 第一个 TestCase

\`\`\`python
import unittest

def add(a, b):
    return a + b

class TestAdd(unittest.TestCase):
    def test_add_integers(self):
        self.assertEqual(add(1, 2), 3)

    def test_add_floats(self):
        self.assertAlmostEqual(add(0.1, 0.2), 0.3, places=7)

    def test_add_strings(self):
        self.assertEqual(add("a", "b"), "ab")

    def test_add_negative(self):
        self.assertEqual(add(-1, -2), -3)

if __name__ == "__main__":
    unittest.main()
\`\`\`

每个以 \`test_\` 开头的方法是一个测试用例。\`unittest\` 会自动发现并运行它们。运行 \`python test_xxx.py\` 就会执行所有测试。

### 1.2 setUp 与 tearDown

\`setUp\` 在每个测试方法**之前**运行，\`tearDown\` 在每个测试方法**之后**运行。它们用来准备和清理测试环境，保证每个测试互不影响。

\`\`\`python
class TestDatabase(unittest.TestCase):
    def setUp(self):
        # 每个测试前连接数据库
        self.db = FakeDB()
        self.db.connect()

    def tearDown(self):
        # 每个测试后断开
        self.db.disconnect()

    def test_insert(self):
        self.db.insert("users", {"name": "Alice"})
        self.assertEqual(self.db.count("users"), 1)

    def test_delete(self):
        self.db.insert("users", {"name": "Bob"})
        self.db.delete("users", "Bob")
        self.assertEqual(self.db.count("users"), 0)
\`\`\`

注意：\`setUp\`/\`tearDown\` 对**每个测试方法**都执行一次。如果想要「整个类只执行一次」的前后置，用 \`setUpClass\`/\`tearDownClass\`（类方法）。

\`\`\`python
class TestSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.shared_resource = create_expensive_resource()

    @classmethod
    def tearDownClass(cls):
        cls.shared_resource.close()
\`\`\`

### 1.3 常用断言方法

\`unittest.TestCase\` 提供了丰富的断言方法：

| 方法 | 用途 |
|------|------|
| \`assertEqual(a, b)\` | a == b |
| \`assertNotEqual(a, b)\` | a != b |
| \`assertTrue(x)\` | bool(x) is True |
| \`assertFalse(x)\` | bool(x) is False |
| \`assertIs(a, b)\` | a is b |
| \`assertIsNone(x)\` | x is None |
| \`assertIn(a, b)\` | a in b |
| \`assertIsInstance(obj, cls)\` | isinstance(obj, cls) |
| \`assertRaises(exc, func, *args)\` | 调用 func 抛 exc 异常 |
| \`assertAlmostEqual(a, b)\` | round(a-b, 7) == 0（浮点） |
| \`assertGreater(a, b)\` | a > b |
| \`assertLess(a, b)\` | a < b |

\`\`\`python
class TestAsserts(unittest.TestCase):
    def test_various(self):
        self.assertEqual(1 + 1, 2)
        self.assertIn(2, [1, 2, 3])
        self.assertIsInstance("hello", str)
        self.assertIsNone(None)
        self.assertGreater(5, 3)

    def test_raises(self):
        with self.assertRaises(ZeroDivisionError):
            1 / 0
        with self.assertRaises(ValueError):
            int("abc")
\`\`\`

\`assertRaises\` 有两种用法：上下文管理器形式（推荐）和直接调用形式。

### 1.4 测试发现

\`unittest\` 能自动发现测试文件。约定：测试文件命名 \`test_*.py\`，测试类继承 \`TestCase\`，测试方法以 \`test_\` 开头。

\`\`\`bash
# 自动发现当前目录下的测试
python -m unittest discover

# 指定目录
python -m unittest discover -s tests/

# 指定模式
python -m unittest discover -p "test_*.py"
\`\`\`

---

## 二、pytest 框架

\`pytest\` 是社区最流行的测试框架，比 \`unittest\` 更简洁、更强大。它支持普通 assert 语句、强大的 fixture、参数化、插件生态。

### 2.1 安装与基本使用

\`\`\`bash
pip install pytest
\`\`\`

pytest 不需要继承 \`TestCase\`，直接写函数即可：

\`\`\`python
def add(a, b):
    return a + b

def test_add():
    assert add(1, 2) == 3
    assert add("a", "b") == "ab"
    assert add(-1, 1) == 0

def test_add_floats():
    assert add(0.1, 0.2) == 0.3   # 这个会失败！浮点精度
\`\`\`

pytest 用普通的 \`assert\` 语句，断言失败时会自动显示详细的对比信息，比 \`unittest\` 的断言方法直观得多。

运行：

\`\`\`bash
pytest                    # 运行当前目录所有测试
pytest test_xxx.py        # 运行指定文件
pytest -v                 # 详细输出
pytest -k "add"           # 只运行名字含 "add" 的测试
pytest --tb=short         # 简短 traceback
\`\`\`

### 2.2 fixture

\`fixture\` 是 pytest 最强大的特性——它让你「声明测试依赖」，pytest 自动注入。fixture 可以复用、可以设置作用域、可以参数化。

\`\`\`python
import pytest

@pytest.fixture
def db():
    # setup
    database = FakeDB()
    database.connect()
    yield database   # yield 之前是 setup，yield 的值注入测试，yield 之后是 teardown
    # teardown
    database.disconnect()

def test_insert(db):
    db.insert("users", {"name": "Alice"})
    assert db.count("users") == 1

def test_delete(db):
    db.insert("users", {"name": "Bob"})
    db.delete("users", "Bob")
    assert db.count("users") == 0
\`\`\`

测试函数的参数名 \`db\` 会自动匹配名为 \`db\` 的 fixture，pytest 把 fixture 的返回值注入进来。这叫「依赖注入」。

### 2.3 conftest.py

\`conftest.py\` 是 pytest 的「共享 fixture」文件。放在 tests 目录下，里面的 fixture 对所有测试文件自动可用，无需 import。

\`\`\`python
# tests/conftest.py
import pytest

@pytest.fixture
def sample_data():
    return [1, 2, 3, 4, 5]

@pytest.fixture
def temp_file(tmp_path):
    f = tmp_path / "test.txt"
    f.write_text("hello")
    return f
\`\`\`

\`tmp_path\` 是 pytest 内置 fixture，提供唯一的临时目录，测试结束自动清理。

### 2.4 fixture 的 scope

fixture 的 \`scope\` 决定它「多久初始化一次」：

- \`function\`（默认）：每个测试函数一次
- \`class\`：每个测试类一次
- \`module\`：每个测试文件一次
- \`session\`：整个测试会话一次

\`\`\`python
@pytest.fixture(scope="module")
def expensive_resource():
    print("初始化（每个模块一次）")
    return create_expensive()

@pytest.fixture(scope="session")
def global_config():
    return load_config()
\`\`\`

scope 越大，初始化越少，但要注意「状态污染」——如果 fixture 返回的对象被测试修改了，后面的测试会受影响。

### 2.5 fixture 的 params

fixture 可以参数化，对每组参数运行一遍测试：

\`\`\`python
@pytest.fixture(params=[1, 2, 3])
def number(request):
    return request.param

def test_square(number):
    assert number * number >= number
\`\`\`

这会运行 3 次测试（number 分别是 1、2、3）。\`request.param\` 拿到当前参数值。

---

## 三、parametrize 参数化测试

\`@pytest.mark.parametrize\` 让一个测试函数对多组数据运行：

\`\`\`python
@pytest.mark.parametrize("a, b, expected", [
    (1, 2, 3),
    (-1, 1, 0),
    (0, 0, 0),
    (100, 200, 300),
])
def test_add(a, b, expected):
    assert add(a, b) == expected
\`\`\`

这比写 4 个单独的 \`test_add_*\` 函数简洁得多。每个参数组合是一个独立的测试用例，失败时能清楚看到是哪组数据出问题。

参数化常用于「边界值测试」、「等价类划分」。

---

## 四、mark 标记

\`pytest.mark\` 给测试打标签，方便选择性运行或跳过。

### 4.1 自定义 mark

\`\`\`python
@pytest.mark.slow
def test_large_dataset():
    # 耗时测试
    pass

@pytest.mark.integration
def test_database():
    # 集成测试
    pass
\`\`\`

运行时筛选：

\`\`\`bash
pytest -m slow              # 只运行 slow 标记的
pytest -m "not slow"        # 运行非 slow 的
pytest -m "slow or integration"
\`\`\`

### 4.2 skip 与 xfail

\`skip\` 跳过测试（不运行），\`xfail\` 标记「预期失败」（运行但不算失败）：

\`\`\`python
import sys

@pytest.mark.skip(reason="暂时禁用")
def test_todo():
    pass

@pytest.mark.skipif(sys.platform == "win32", reason="不支持 Windows")
def test_unix_only():
    pass

@pytest.mark.xfail(reason="已知 bug，待修复")
def test_known_bug():
    assert broken_function() == "fixed"
\`\`\`

- \`skip\`：直接跳过，不运行。
- \`skipif\`：条件为真时跳过。
- \`xfail\`：运行，但预期失败。如果意外通过了，标记为 \`xpass\`（可选报错）。

---

## 五、mock 模块

\`unittest.mock\` 提供了「模拟对象」的能力，让你在测试中替换真实对象（如网络请求、数据库、时间），从而隔离被测代码。

### 5.1 Mock 与 MagicMock

\`Mock\` 是一个「万能对象」——访问它的任何属性都返回一个新的 Mock，调用它返回一个 Mock，并记录调用信息。

\`\`\`python
from unittest.mock import Mock

m = Mock()
m.anything            # 返回一个 Mock
m(1, 2, key="val")    # 调用，返回 Mock
m.assert_called_once_with(1, 2, key="val")
print(m.call_count)   # 1
\`\`\`

\`MagicMock\` 是 \`Mock\` 的增强版，支持魔术方法（\`__len__\`、\`__iter__\`、\`__getitem__\` 等）。

### 5.2 return_value 与 side_effect

- \`return_value\`：调用 mock 时返回的固定值。
- \`side_effect\`：调用 mock 时的「副作用」——可以是一个值（返回它）、一个可迭代对象（每次返回下一个）、一个函数（调用它）、或一个异常（抛出它）。

\`\`\`python
m = Mock()
m.return_value = 42
print(m())   # 42

m.side_effect = [1, 2, 3]   # 依次返回 1, 2, 3
print(m(), m(), m())   # 1 2 3

m.side_effect = ValueError("出错")   # 抛异常
m()   # raises ValueError

def side_func(x):
    return x * 10
m.side_effect = side_func   # 调用时执行函数
print(m(5))   # 50
\`\`\`

### 5.3 patch 替换对象

\`patch\` 是最常用的 mock 工具——它「临时替换」一个对象，测试后恢复。常用于替换网络请求、文件 IO、外部服务。

\`\`\`python
from unittest.mock import patch

def get_username(user_id):
    # 调用外部 API
    import requests
    resp = requests.get("https://api.example.com/users/" + str(user_id))
    return resp.json()["name"]

class TestGetUsername(unittest.TestCase):
    @patch("requests.get")
    def test_get_username(self, mock_get):
        # 配置 mock 返回值
        mock_get.return_value.json.return_value = {"name": "Alice"}
        name = get_username(1)
        self.assertEqual(name, "Alice")
        # 验证 mock 被正确调用
        mock_get.assert_called_once_with("https://api.example.com/users/1")
\`\`\`

\`patch("requests.get")\` 临时把 \`requests.get\` 替换成 Mock，测试结束自动恢复。被 patch 的对象作为参数注入测试方法。

\`patch\` 可以作为装饰器，也可以作为上下文管理器：

\`\`\`python
with patch("requests.get") as mock_get:
    mock_get.return_value.json.return_value = {"name": "Bob"}
    ...
\`\`\`

### 5.4 patch.object 与 patch.multiple

\`patch.object\` patch 一个对象的特定属性：

\`\`\`python
with patch.object(SomeClass, "method", return_value=42):
    ...
\`\`\`

\`patch.multiple\` 一次 patch 多个：

\`\`\`python
with patch.multiple("mymodule", func1=Mock(), func2=Mock()):
    ...
\`\`\`

---

## 六、doctest 文档测试

\`doctest\` 把「文档字符串里的示例代码」当测试跑。它强制文档和代码保持一致——文档里的例子必须真的能运行。

\`\`\`python
def factorial(n):
    """计算阶乘

    >>> factorial(0)
    1
    >>> factorial(1)
    1
    >>> factorial(5)
    120
    >>> factorial(3)
    6
    """
    if n <= 1:
        return 1
    return n * factorial(n - 1)

if __name__ == "__main__":
    import doctest
    doctest.testmod()
\`\`\`

\`>>> \` 后面是输入，下一行是预期输出。\`doctest.testmod()\` 会执行所有示例，对比输出是否匹配。如果不匹配，报告错误。

doctest 适合「简单的、教学性的」测试，不适合复杂场景。

---

## 七、coverage 覆盖率

\`coverage\` 工具测量「测试覆盖了多少代码」。安装：\`pip install coverage\`。

\`\`\`bash
coverage run -m pytest      # 运行测试并收集覆盖率
coverage report             # 查看报告
coverage html               # 生成 HTML 报告（htmlcov/index.html）
\`\`\`

覆盖率高的代码不一定质量高，但覆盖率低的代码一定有未测试的角落。一般目标 80%+ 行覆盖率。

---

## 八、测试金字塔

测试金字塔是测试策略的经典模型：

1. **单元测试（最多）**：测试单个函数/类，快、隔离、数量大。占 70%+。
2. **集成测试（中等）**：测试多个模块协作，如「服务+数据库」。占 20%。
3. **端到端测试（最少）**：测试完整流程，如「用户登录到下单」。慢、脆弱、占 10%。

底层多、顶层少，因为越往上越慢越脆弱。不要倒着来（端到端多、单元少），那样测试会又慢又不可靠。

---

## 九、TDD 概念

TDD（Test-Driven Development，测试驱动开发）的流程是「红-绿-重构」：

1. **红**：先写一个失败的测试（描述你要的功能）。
2. **绿**：写最简单的代码让测试通过。
3. **重构**：优化代码，保持测试通过。

\`\`\`python
# 红：先写测试
def test_fizzbuzz():
    assert fizzbuzz(1) == "1"
    assert fizzbuzz(3) == "Fizz"
    assert fizzbuzz(5) == "Buzz"
    assert fizzbuzz(15) == "FizzBuzz"

# 绿：写实现
def fizzbuzz(n):
    if n % 15 == 0:
        return "FizzBuzz"
    if n % 3 == 0:
        return "Fizz"
    if n % 5 == 0:
        return "Buzz"
    return str(n)

# 重构：可以优化但不改行为
\`\`\`

TDD 的好处：测试先行，天然 100% 覆盖；强迫你先想清楚「接口」再实现。

---

## 十、pdb 调试器

\`pdb\` 是 Python 内置的交互式调试器。在代码里插入 \`breakpoint()\`（Python 3.7+）或 \`pdb.set_trace()\`，程序会停在那里，进入交互式调试。

\`\`\`python
def buggy(items):
    total = 0
    for i, x in enumerate(items):
        breakpoint()   # 程序停在这里
        total += x
    return total / len(items)
\`\`\`

### 10.1 常用 pdb 命令

| 命令 | 缩写 | 作用 |
|------|------|------|
| \`next\` | \`n\` | 执行下一行（不进入函数） |
| \`step\` | \`s\` | 执行下一行（进入函数） |
| \`continue\` | \`c\` | 继续执行直到下个断点 |
| \`print expr\` | \`p expr\` | 打印表达式的值 |
| \`list\` | \`l\` | 显示当前代码上下文 |
| \`where\` | \`w\` | 显示调用栈 |
| \`break line\` | \`b line\` | 在指定行设断点 |
| \`quit\` | \`q\` | 退出调试 |

### 10.2 ipdb

\`ipdb\` 是 \`pdb\` 的增强版，有语法高亮和自动补全。安装 \`pip install ipdb\`，然后在代码里用 \`import ipdb; ipdb.set_trace()\`。

---

## 十一、断言技巧与实战

### 11.1 断言异常

\`\`\`python
# unittest
with self.assertRaises(ValueError):
    parse("invalid")

# pytest
with pytest.raises(ValueError, match="invalid"):
    parse("invalid")
\`\`\`

\`match\` 参数可以用正则匹配异常消息。

### 11.2 断言近似

\`\`\`python
# unittest
self.assertAlmostEqual(0.1 + 0.2, 0.3, places=7)

# pytest
assert abs(0.1 + 0.2 - 0.3) < 1e-9
\`\`\`

### 11.3 捕获警告

\`\`\`python
import warnings

with warnings.catch_warnings(record=True) as w:
    warnings.simplefilter("always")
    deprecated_function()
    assert len(w) == 1
    assert "deprecated" in str(w[0].message)
\`\`\`

---

## 十二、小结

- \`unittest\`：标准库框架，\`TestCase\` + \`setUp\`/\`tearDown\` + 丰富断言方法。
- \`pytest\`：更简洁，普通 assert + fixture + parametrize + mark + 插件。
- fixture 是 pytest 核心：\`conftest.py\` 共享、\`scope\` 控制作用域、\`params\` 参数化。
- \`mock\`：\`Mock\`/\`MagicMock\` 模拟对象，\`return_value\`/\`side_effect\` 控制行为，\`patch\` 临时替换。
- \`doctest\` 文档测试，\`coverage\` 覆盖率，测试金字塔策略，TDD 红-绿-重构。
- \`pdb\`/\`breakpoint()\` 交互式调试，常用命令 n/s/c/p/l/q。

测试不是负担，是「让你晚上睡得着觉」的安全网。从今天起，给关键代码写测试吧。`,
    code: `# =============================================================
# 第五章：测试与调试 - 可运行示例（用 unittest，python3 直接运行）
# =============================================================

print("=" * 60)
print("1. unittest 基础示例")
print("=" * 60)

import unittest

def add(a, b):
    return a + b

def divide(a, b):
    if b == 0:
        raise ZeroDivisionError("除数不能为零")
    return a / b

class TestAdd(unittest.TestCase):
    def test_add_integers(self):
        self.assertEqual(add(1, 2), 3)

    def test_add_floats(self):
        self.assertAlmostEqual(add(0.1, 0.2), 0.3, places=7)

    def test_add_strings(self):
        self.assertEqual(add("a", "b"), "ab")

    def test_add_negative(self):
        self.assertEqual(add(-1, -2), -3)

    def test_add_zero(self):
        self.assertEqual(add(0, 0), 0)

print("TestAdd 的测试方法:", [m for m in dir(TestAdd) if m.startswith("test_")])

print()
print("=" * 60)
print("2. setUp 与 tearDown")
print("=" * 60)

class FakeDB:
    def __init__(self):
        self.connected = False
        self.data = {}
    def connect(self):
        self.connected = True
        self.data = {}
    def disconnect(self):
        self.connected = False
    def insert(self, table, record):
        self.data.setdefault(table, []).append(record)
    def count(self, table):
        return len(self.data.get(table, []))
    def delete(self, table, name):
        self.data[table] = [r for r in self.data.get(table, []) if r.get("name") != name]

class TestDatabase(unittest.TestCase):
    def setUp(self):
        self.db = FakeDB()
        self.db.connect()
    def tearDown(self):
        self.db.disconnect()
    def test_insert(self):
        self.db.insert("users", {"name": "Alice"})
        self.assertEqual(self.db.count("users"), 1)
    def test_delete(self):
        self.db.insert("users", {"name": "Bob"})
        self.db.delete("users", "Bob")
        self.assertEqual(self.db.count("users"), 0)
    def test_isolated(self):
        # 每个测试的 setUp 都重置，互不影响
        self.assertEqual(self.db.count("users"), 0)

suite_db = unittest.TestLoader().loadTestsFromTestCase(TestDatabase)
runner = unittest.TextTestRunner(verbosity=2)
print("运行 TestDatabase:")
result = runner.run(suite_db)

print()
print("=" * 60)
print("3. 常用断言方法演示")
print("=" * 60)

class TestAsserts(unittest.TestCase):
    def test_equal(self):
        self.assertEqual(1 + 1, 2)
        self.assertNotEqual(1, 2)
    def test_bool(self):
        self.assertTrue(1 == 1)
        self.assertFalse(1 == 2)
    def test_is(self):
        x = None
        self.assertIsNone(x)
        self.assertIsNotNone(42)
    def test_in(self):
        self.assertIn(2, [1, 2, 3])
        self.assertNotIn(5, [1, 2, 3])
    def test_isinstance(self):
        self.assertIsInstance("hello", str)
        self.assertIsInstance(42, (int, float))
    def test_raises(self):
        with self.assertRaises(ZeroDivisionError):
            1 / 0
        with self.assertRaises(ValueError):
            int("abc")
    def test_comparison(self):
        self.assertGreater(5, 3)
        self.assertLess(3, 5)
        self.assertGreaterEqual(5, 5)
    def test_almost(self):
        self.assertAlmostEqual(0.1 + 0.2, 0.3, places=7)

suite_asserts = unittest.TestLoader().loadTestsFromTestCase(TestAsserts)
print("运行 TestAsserts:")
result = runner.run(suite_asserts)

print()
print("=" * 60)
print("4. setUpClass 与 tearDownClass")
print("=" * 60)

class TestSuite(unittest.TestCase):
    shared = None
    @classmethod
    def setUpClass(cls):
        print("  [setUpClass] 创建共享资源")
        cls.shared = ["初始化数据"]
    @classmethod
    def tearDownClass(cls):
        print("  [tearDownClass] 清理共享资源")
        cls.shared = None
    def test_a(self):
        self.assertEqual(len(self.shared), 1)
        self.shared.append("a")
    def test_b(self):
        # 注意：测试执行顺序不保证，不应依赖共享状态修改
        self.assertIsInstance(self.shared, list)

suite_suite = unittest.TestLoader().loadTestsFromTestCase(TestSuite)
print("运行 TestSuite:")
result = runner.run(suite_suite)

print()
print("=" * 60)
print("5. mock 模块 - Mock 与 MagicMock")
print("=" * 60)

from unittest.mock import Mock, MagicMock

m = Mock()
print("访问任意属性:", m.anything)
print("调用 mock:", m(1, 2, key="val"))
print("call_count:", m.call_count)
print("call_args:", m.call_args)
m.assert_called_once_with(1, 2, key="val")
print("断言调用通过")

print()
m2 = Mock()
m2.return_value = 42
print("return_value:", m2())

m3 = Mock()
m3.side_effect = [1, 2, 3]
print("side_effect 列表:", m3(), m3(), m3())

m4 = Mock()
m4.side_effect = ValueError("出错了")
try:
    m4()
except ValueError as e:
    print("side_effect 异常:", e)

m5 = Mock()
m5.side_effect = lambda x: x * 10
print("side_effect 函数:", m5(5))

print()
print("MagicMock 支持魔术方法:")
mm = MagicMock()
mm.__len__.return_value = 5
mm.__iter__.return_value = iter([1, 2, 3])
mm.__getitem__.return_value = "value"
print("len(mm):", len(mm))
print("list(mm):", list(mm))
print("mm[0]:", mm[0])

print()
print("=" * 60)
print("6. patch 替换对象")
print("=" * 60)

from unittest.mock import patch

# 模拟一个外部服务
class UserService:
    def get_name(self, uid):
        # 实际会调用数据库或 API
        raise NotImplementedError

def greet_user(uid):
    svc = UserService()
    name = svc.get_name(uid)
    return "Hello, " + name

# 用 patch 替换 get_name 方法
with patch.object(UserService, "get_name", return_value="Alice") as mock_method:
    result = greet_user(1)
    print("greet_user(1):", result)
    print("get_name 被调用:", mock_method.called)
    print("调用参数:", mock_method.call_args)

# patch 后恢复
try:
    greet_user(2)
except NotImplementedError:
    print("patch 结束后，原方法恢复（抛出 NotImplementedError）")

print()
print("=" * 60)
print("7. patch 作为装饰器")
print("=" * 60)

class TestGreetUser(unittest.TestCase):
    @patch.object(UserService, "get_name")
    def test_greet(self, mock_get_name):
        mock_get_name.return_value = "Bob"
        self.assertEqual(greet_user(1), "Hello, Bob")
        mock_get_name.assert_called_once_with(1)

    @patch.object(UserService, "get_name")
    def test_greet_different(self, mock_get_name):
        mock_get_name.return_value = "Carol"
        self.assertEqual(greet_user(99), "Hello, Carol")

suite_greet = unittest.TestLoader().loadTestsFromTestCase(TestGreetUser)
print("运行 TestGreetUser:")
result = runner.run(suite_greet)

print()
print("=" * 60)
print("8. doctest 文档测试")
print("=" * 60)

def factorial(n):
    """计算阶乘

    >>> factorial(0)
    1
    >>> factorial(1)
    1
    >>> factorial(5)
    120
    >>> factorial(3)
    6
    """
    if n <= 1:
        return 1
    return n * factorial(n - 1)

import doctest
results = doctest.testmod(verbose=True)
print("doctest 失败数:", results.failed)

print()
print("=" * 60)
print("9. 参数化测试（unittest 的 subTest）")
print("=" * 60)

class TestParametrized(unittest.TestCase):
    def test_add_cases(self):
        cases = [
            (1, 2, 3),
            (-1, 1, 0),
            (0, 0, 0),
            (100, 200, 300),
            (-5, -5, -10),
        ]
        for a, b, expected in cases:
            with self.subTest(a=a, b=b, expected=expected):
                self.assertEqual(add(a, b), expected)

    def test_divide_cases(self):
        cases = [
            (10, 2, 5.0),
            (9, 3, 3.0),
            (7, 1, 7.0),
            (0, 5, 0.0),
        ]
        for a, b, expected in cases:
            with self.subTest(a=a, b=b):
                self.assertEqual(divide(a, b), expected)

suite_param = unittest.TestLoader().loadTestsFromTestCase(TestParametrized)
print("运行参数化测试:")
result = runner.run(suite_param)

print()
print("=" * 60)
print("10. skip 与 expectedFailure")
print("=" * 60)

import sys

class TestSkipping(unittest.TestCase):
    @unittest.skip("暂时禁用")
    def test_skip(self):
        self.fail("这行不会执行")

    @unittest.skipIf(sys.platform == "win32", "不支持 Windows")
    def test_skipif(self):
        self.assertTrue(True)

    @unittest.expectedFailure
    def test_expected_failure(self):
        self.assertEqual(1, 2)   # 预期失败，所以不算失败

    def test_normal(self):
        self.assertEqual(1, 1)

suite_skip = unittest.TestLoader().loadTestsFromTestCase(TestSkipping)
print("运行跳过测试:")
result = runner.run(suite_skip)
print("  运行:", result.testsRun, "失败:", len(result.failures), "错误:", len(result.errors), "跳过:", len(result.skipped))

print()
print("=" * 60)
print("11. 综合实战：测试一个栈类")
print("=" * 60)

class Stack:
    def __init__(self):
        self._items = []
    def push(self, item):
        self._items.append(item)
    def pop(self):
        if self.is_empty():
            raise IndexError("pop from empty stack")
        return self._items.pop()
    def peek(self):
        if self.is_empty():
            raise IndexError("peek from empty stack")
        return self._items[-1]
    def is_empty(self):
        return len(self._items) == 0
    def size(self):
        return len(self._items)

class TestStack(unittest.TestCase):
    def setUp(self):
        self.stack = Stack()
    def test_empty_stack(self):
        self.assertTrue(self.stack.is_empty())
        self.assertEqual(self.stack.size(), 0)
    def test_push(self):
        self.stack.push(1)
        self.assertEqual(self.stack.size(), 1)
        self.assertFalse(self.stack.is_empty())
    def test_pop(self):
        self.stack.push(1)
        self.stack.push(2)
        self.assertEqual(self.stack.pop(), 2)
        self.assertEqual(self.stack.pop(), 1)
        self.assertTrue(self.stack.is_empty())
    def test_peek(self):
        self.stack.push("a")
        self.assertEqual(self.stack.peek(), "a")
        self.assertEqual(self.stack.size(), 1)  # peek 不移除
    def test_pop_empty_raises(self):
        with self.assertRaises(IndexError):
            self.stack.pop()
    def test_peek_empty_raises(self):
        with self.assertRaises(IndexError):
            self.stack.peek()
    def test_lifo_order(self):
        for i in range(5):
            self.stack.push(i)
        result = []
        while not self.stack.is_empty():
            result.append(self.stack.pop())
        self.assertEqual(result, [4, 3, 2, 1, 0])

suite_stack = unittest.TestLoader().loadTestsFromTestCase(TestStack)
print("运行 TestStack:")
result = runner.run(suite_stack)

print()
print("=" * 60)
print("12. 综合实战：用 mock 测试网络相关代码")
print("=" * 60)

class WeatherService:
    def get_temp(self, city):
        import urllib.request
        url = "https://api.weather.example.com/" + city
        resp = urllib.request.urlopen(url)
        data = resp.read()
        return int(data)

def report_weather(city):
    svc = WeatherService()
    temp = svc.get_temp(city)
    if temp > 30:
        return city + " 很热 (" + str(temp) + "度)"
    elif temp < 10:
        return city + " 很冷 (" + str(temp) + "度)"
    else:
        return city + " 舒适 (" + str(temp) + "度)"

class TestWeather(unittest.TestCase):
    @patch.object(WeatherService, "get_temp")
    def test_hot(self, mock_temp):
        mock_temp.return_value = 35
        self.assertEqual(report_weather("Dubai"), "Dubai 很热 (35度)")

    @patch.object(WeatherService, "get_temp")
    def test_cold(self, mock_temp):
        mock_temp.return_value = 5
        self.assertEqual(report_weather("Arctic"), "Arctic 很冷 (5度)")

    @patch.object(WeatherService, "get_temp")
    def test_comfortable(self, mock_temp):
        mock_temp.return_value = 22
        self.assertEqual(report_weather("Spring"), "Spring 舒适 (22度)")

suite_weather = unittest.TestLoader().loadTestsFromTestCase(TestWeather)
print("运行 TestWeather:")
result = runner.run(suite_weather)

print()
print("=" * 60)
print("13. 断言异常消息匹配")
print("=" * 60)

def parse_int(s):
    try:
        return int(s)
    except ValueError:
        raise ValueError("无法解析: " + repr(s)) from None

class TestParse(unittest.TestCase):
    def test_valid(self):
        self.assertEqual(parse_int("42"), 42)
    def test_invalid(self):
        with self.assertRaises(ValueError) as ctx:
            parse_int("abc")
        self.assertIn("abc", str(ctx.exception))
        self.assertIn("无法解析", str(ctx.exception))

suite_parse = unittest.TestLoader().loadTestsFromTestCase(TestParse)
print("运行 TestParse:")
result = runner.run(suite_parse)

print()
print("=" * 60)
print("14. 捕获警告")
print("=" * 60)

import warnings

def deprecated_function():
    warnings.warn("这个函数已废弃", DeprecationWarning)
    return "old result"

class TestWarnings(unittest.TestCase):
    def test_warns(self):
        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            result = deprecated_function()
            self.assertEqual(result, "old result")
            self.assertEqual(len(w), 1)
            self.assertTrue(issubclass(w[0].category, DeprecationWarning))
            self.assertIn("废弃", str(w[0].message))

suite_warn = unittest.TestLoader().loadTestsFromTestCase(TestWarnings)
print("运行 TestWarnings:")
result = runner.run(suite_warn)

print()
print("=" * 60)
print("15. TDD 示例：FizzBuzz")
print("=" * 60)

# 红：先写测试
class TestFizzBuzz(unittest.TestCase):
    def test_normal(self):
        self.assertEqual(fizzbuzz(1), "1")
        self.assertEqual(fizzbuzz(2), "2")
    def test_fizz(self):
        self.assertEqual(fizzbuzz(3), "Fizz")
        self.assertEqual(fizzbuzz(6), "Fizz")
    def test_buzz(self):
        self.assertEqual(fizzbuzz(5), "Buzz")
        self.assertEqual(fizzbuzz(10), "Buzz")
    def test_fizzbuzz(self):
        self.assertEqual(fizzbuzz(15), "FizzBuzz")
        self.assertEqual(fizzbuzz(30), "FizzBuzz")

# 绿：写实现
def fizzbuzz(n):
    if n % 15 == 0:
        return "FizzBuzz"
    if n % 3 == 0:
        return "Fizz"
    if n % 5 == 0:
        return "Buzz"
    return str(n)

suite_fb = unittest.TestLoader().loadTestsFromTestCase(TestFizzBuzz)
print("运行 TestFizzBuzz:")
result = runner.run(suite_fb)

print()
print("=" * 60)
print("16. 测试金字塔概念展示")
print("=" * 60)

print("测试金字塔结构:")
print("  /\\\\          端到端测试 (E2E) - 少而精")
print(" /  \\\\")
print("/____\\\\        集成测试 - 中等数量")
print("__________     单元测试 - 大量，快速")
print()
print("推荐比例: 单元 70% / 集成 20% / E2E 10%")

print()
print("=" * 60)
print("17. pdb 调试器命令参考（仅打印，不进入交互）")
print("=" * 60)

pdb_commands = [
    ("n / next", "执行下一行（不进入函数）"),
    ("s / step", "执行下一行（进入函数）"),
    ("c / continue", "继续执行直到下个断点"),
    ("p expr", "打印表达式的值"),
    ("pp expr", "漂亮打印表达式"),
    ("l / list", "显示当前代码上下文"),
    ("w / where", "显示调用栈"),
    ("b line", "在指定行设断点"),
    ("b func", "在函数入口设断点"),
    ("cl", "清除断点"),
    ("q / quit", "退出调试器"),
    ("a / args", "显示当前函数参数"),
    ("r / return", "执行到函数返回"),
    ("unt line", "执行到指定行"),
]
print("pdb 常用命令:")
for cmd, desc in pdb_commands:
    print("  " + cmd + " - " + desc)

print()
print("使用 breakpoint() 进入调试器:")
print("  def buggy(x):")
print("      breakpoint()   # Python 3.7+，程序停在这里")
print("      return x / 0")

print()
print("=" * 60)
print("18. 运行全部测试的汇总")
print("=" * 60)

all_tests = unittest.TestSuite([
    unittest.TestLoader().loadTestsFromTestCase(TestAdd),
    unittest.TestLoader().loadTestsFromTestCase(TestDatabase),
    unittest.TestLoader().loadTestsFromTestCase(TestAsserts),
    unittest.TestLoader().loadTestsFromTestCase(TestGreetUser),
    unittest.TestLoader().loadTestsFromTestCase(TestParametrized),
    unittest.TestLoader().loadTestsFromTestCase(TestSkipping),
    unittest.TestLoader().loadTestsFromTestCase(TestStack),
    unittest.TestLoader().loadTestsFromTestCase(TestWeather),
    unittest.TestLoader().loadTestsFromTestCase(TestParse),
    unittest.TestLoader().loadTestsFromTestCase(TestWarnings),
    unittest.TestLoader().loadTestsFromTestCase(TestFizzBuzz),
])
print("运行全部测试套件:")
final_result = runner.run(all_tests)
print()
print("汇总: 测试数 =", final_result.testsRun, "失败 =", len(final_result.failures), "错误 =", len(final_result.errors))

print()
print("=" * 60)
print("全部演示完成！")
print("=" * 60)
`,
  },

  // =========================================================
  // 第六章：打包与发布
  // =========================================================
  {
    id: "py-packaging-distribution",
    group: "高级特性与工程",
    icon: "📤",
    title: "打包与发布",
    content: `# 打包与发布

写完 Python 代码后，如何把它「打包」成可安装的包，发布到 PyPI 让全世界用？这涉及项目结构、\`pyproject.toml\` 配置、构建工具（build）、上传工具（twine）、版本管理等一系列知识。本章系统讲解 Python 打包的完整流程，并用一个 CLI 工具的实际例子贯穿始终。

现代 Python 打包的核心是 \`pyproject.toml\`——它取代了旧的 \`setup.py\`、\`setup.cfg\`，成为项目配置的唯一入口。理解 \`pyproject.toml\` 就理解了现代 Python 打包。

---

## 一、项目结构

### 1.1 src layout vs flat layout

Python 包有两种常见的目录布局：

**flat layout**（扁平布局）：包目录直接在项目根目录下。

\`\`\`
my_project/
├── pyproject.toml
├── README.md
├── my_package/
│   ├── __init__.py
│   ├── core.py
│   └── utils.py
└── tests/
    └── test_core.py
\`\`\`

**src layout**（src 布局）：包目录放在 \`src/\` 下。

\`\`\`
my_project/
├── pyproject.toml
├── README.md
├── src/
│   └── my_package/
│       ├── __init__.py
│       ├── core.py
│       └── utils.py
└── tests/
    └── test_core.py
\`\`\`

**src layout 更推荐**，因为它避免了「未安装就能 import」的陷阱。在 flat layout 里，你在项目根目录运行 Python 就能 \`import my_package\`，但这可能掩盖打包错误（比如忘了把某个模块包含进包）。src layout 强制你先 \`pip install -e .\` 才能导入，能更早发现问题。

### 1.2 __init__.py 与包

\`__init__.py\` 标记一个目录是「包」。Python 3.3+ 支持「命名空间包」（没有 \`__init__.py\` 的目录也能导入），但普通项目还是建议每个包都有 \`__init__.py\`。

\`__init__.py\` 可以是空文件，也可以放包的初始化代码、导出公共 API：

\`\`\`python
# my_package/__init__.py
from my_package.core import main_function
from my_package.utils import helper

__version__ = "1.0.0"
__all__ = ["main_function", "helper"]
\`\`\`

\`__all__\` 控制 \`from my_package import *\` 导出哪些名字。

---

## 二、pyproject.toml 详解

\`pyproject.toml\` 是现代 Python 项目的配置中心，用 TOML 格式。它包含三个核心部分：\`[build-system]\`、\`[project]\`、\`[project.scripts]\`。

### 2.1 [build-system] 构建系统

\`\`\`toml
[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"
\`\`\`

- \`requires\`：构建这个包需要哪些工具（构建依赖）。
- \`build-backend\`：用哪个构建后端。\`setuptools\` 是最传统的，还有 \`hatchling\`、\`flit\`、\`poetry-core\` 等现代选择。

### 2.2 [project] 项目元数据

\`\`\`toml
[project]
name = "my-package"
version = "1.0.0"
description = "一个示例 Python 包"
readme = "README.md"
requires-python = ">=3.8"
license = {text = "MIT"}
authors = [
    {name = "Alice", email = "alice@example.com"}
]
keywords = ["example", "tutorial", "cli"]
classifiers = [
    "Development Status :: 4 - Beta",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.10",
    "License :: OSI Approved :: MIT License",
    "Operating System :: OS Independent",
]
\`\`\`

- \`name\`：包名（PyPI 上的名字，用连字符）。
- \`version\`：版本号。
- \`description\`：一句话描述。
- \`readme\`：README 文件路径。
- \`requires-python\`：支持的 Python 版本。
- \`license\`：许可证。
- \`authors\`：作者信息。
- \`keywords\`：搜索关键词。
- \`classifiers\`：PyPI 分类标签，帮助用户找到你的包。

### 2.3 依赖声明

\`\`\`toml
dependencies = [
    "requests>=2.20",
    "click>=8.0",
    "rich>=10.0",
]
\`\`\`

依赖格式：\`包名 版本约束\`。常用约束符：\`>=\`、\`<\`、\`==\`、\`!=\`、\`~=\`（兼容版本）。

### 2.4 optional-dependencies 可选依赖

\`\`\`toml
[project.optional-dependencies]
dev = ["pytest>=7.0", "mypy>=1.0", "ruff>=0.1"]
docs = ["sphinx>=5.0"]
test = ["pytest>=7.0", "pytest-cov>=4.0"]
\`\`\`

可选依赖用 \`pip install my-package[dev]\` 安装。常用于「开发时需要的工具」不放进主依赖。

### 2.5 [project.scripts] CLI 入口

\`\`\`toml
[project.scripts]
my-cli = "my_package.cli:main"
\`\`\`

这会生成一个名为 \`my-cli\` 的命令行工具，调用 \`my_package.cli\` 模块的 \`main\` 函数。安装后用户直接运行 \`my-cli\` 即可，不用 \`python -m\`。

\`\`\`toml
[project.gui-scripts]
my-gui = "my_package.gui:run"
\`\`\`

\`gui-scripts\` 类似，但用于 GUI 应用（Windows 上不会弹出控制台窗口）。

### 2.6 [project.entry-points] 插件入口

\`\`\`toml
[project.entry-points."my_package.plugins"]
csv = "my_package.plugins.csv:CSVPlugin"
json = "my_package.plugins.json:JSONPlugin"
\`\`\`

entry-points 用于「插件系统」——你的包定义一个「入口组」，其他包可以往里注册插件，运行时用 \`importlib.metadata\` 动态发现。

---

## 三、setuptools 后端

\`setuptools\` 是最成熟的构建后端。在 \`pyproject.toml\` 里用 setuptools 时，可以用一些 setuptools 特有的配置：

\`\`\`toml
[tool.setuptools.packages.find]
where = ["src"]

[tool.setuptools.package-data]
my_package = ["*.txt", "data/*.json"]
\`\`\`

- \`packages.find\`：自动发现包（在 \`src\` 下找）。
- \`package-data\`：包含非 Python 文件（数据文件）。

---

## 四、版本号与语义化版本

### 4.1 SemVer

语义化版本（Semantic Versioning，SemVer）格式：\`MAJOR.MINOR.PATCH\`

- \`MAJOR\`：不兼容的 API 变更（breaking change）。
- \`MINOR\`：向后兼容的新功能。
- \`PATCH\`：向后兼容的 bug 修复。

例如 \`1.2.3\` → \`1.2.4\`（修 bug）→ \`1.3.0\`（加功能）→ \`2.0.0\`（破坏性变更）。

### 4.2 预发布版本

- \`1.0.0-alpha.1\`：alpha 版
- \`1.0.0-beta.1\`：beta 版
- \`1.0.0-rc.1\`：release candidate
- \`1.0.0\`：正式版

pip 默认不安装预发布版本，除非指定 \`--pre\`。

### 4.3 动态版本

版本号可以静态写在 \`pyproject.toml\` 里，也可以动态从代码读取：

\`\`\`toml
[project]
dynamic = ["version"]

[tool.setuptools.dynamic]
version = {attr = "my_package.__version__"}
\`\`\`

这样版本号只在 \`my_package/__init__.py\` 的 \`__version__\` 里维护一处，避免重复。

---

## 五、wheel 与 sdist

构建会产生两种发行物：

- **sdist（source distribution）**：源码包（\`.tar.gz\`），包含完整源码，安装时需要编译。
- **wheel（built distribution）**：预编译包（\`.whl\`），安装时直接解压，快。

\`\`\`
my-package-1.0.0.tar.gz       # sdist
my_package-1.0.0-py3-none-any.whl   # wheel
\`\`\`

wheel 文件名格式：\`{包名}-{版本}-{python标签}-{abi标签}-{平台标签}.whl\`。\`py3-none-any\` 表示纯 Python、任何平台通用。包含 C 扩展的包会有具体的平台标签（如 \`cp310-cp310-linux_x86_64\`）。

---

## 六、build 工具

\`build\` 是官方推荐的构建工具，取代了旧的 \`python setup.py sdist bdist_wheel\`。

\`\`\`bash
pip install build
python -m build
\`\`\`

这会在 \`dist/\` 目录生成 sdist 和 wheel：

\`\`\`
dist/
├── my-package-1.0.0.tar.gz
└── my_package-1.0.0-py3-none-any.whl
\`\`\`

\`build\` 在隔离环境里构建（默认），确保构建依赖正确声明。

---

## 七、twine 上传 PyPI

\`twine\` 是上传工具。先注册 PyPI 账号（pypi.org），配置 API token。

\`\`\`bash
pip install twine
twine upload dist/*
\`\`\`

会提示输入用户名和密码（用 API token：用户名 \`__token__\`，密码是你的 token）。

上传前建议先上传到 **TestPyPI**（测试环境）验证：

\`\`\`bash
twine upload --repository testpypi dist/*
\`\`\`

---

## 八、开发安装 pip install -e .

\`pip install -e .\`（editable install，可编辑安装）把包以「开发模式」安装——源码修改立即生效，不用重新安装。

\`\`\`bash
cd my_project
pip install -e .
\`\`\`

原理：pip 会在 \`site-packages\` 里放一个 \`.pth\` 文件指向你的源码目录，import 时直接加载源码。非常适合开发调试。

---

## 九、命名空间包

「命名空间包」让多个独立的包共享同一个顶层命名空间。例如 \`zope.interface\` 和 \`zope.component\` 是两个独立的包，但都放在 \`zope\` 命名空间下。

PEP 420 隐式命名空间包（Python 3.3+）：不需要 \`__init__.py\`，只要目录在 sys.path 上就能导入。

\`\`\`
projects/
├── package_a/
│   └── myns/
│       └── module_a.py    # 没有 __init__.py
└── package_b/
    └── myns/
        └── module_b.py    # 没有 __init__.py
\`\`\`

如果两个项目的根目录都在 sys.path 上，\`import myns.module_a\` 和 \`import myns.module_b\` 都能用。

---

## 十、包名规范

- 全小写，用连字符分隔单词：\`my-package\`（不用下划线、不用大写）。
- 简短、有描述性、不易冲突。
- 不要和 PyPI 上已有的包重名（先搜索 pypi.org）。
- import 名用下划线：\`my_package\`（Python 标识符不能有连字符）。

包名（PyPI 名）和 import 名可以不同：PyPI 上叫 \`my-package\`，import 时用 \`my_package\`。

---

## 十一、README 与 LICENSE

### 11.1 README

README 是包的「门面」，PyPI 会显示它的渲染结果。通常包含：

- 包做什么（一句话 + 详细说明）
- 安装方法
- 基本用法（代码示例）
- 配置说明
- 贡献指南链接

用 Markdown（\`README.md\`）或 reStructuredText（\`README.rst\`）。PyPI 对 Markdown 的支持需要 \`long_description_content_type = "text/markdown"\`（setuptools），现代构建后端通常自动处理。

### 11.2 LICENSE

开源许可证选择：

- **MIT**：最宽松，几乎允许任何用途，只要保留版权声明。最常用。
- **Apache 2.0**：类似 MIT，但包含专利授权条款。
- **GPL v3**：强 copyleft，衍生作品必须也开源。
- **BSD**：类似 MIT 的宽松许可。

不确定就选 MIT。把 \`LICENSE\` 文件放项目根目录，\`pyproject.toml\` 里声明。

---

## 十二、实际打包示例

我们创建一个简单的 CLI 工具 \`wordcount\`，统计文本的词数，并完整配置打包。

### 12.1 项目结构

\`\`\`
wordcount/
├── pyproject.toml
├── README.md
├── LICENSE
├── src/
│   └── wordcount/
│       ├── __init__.py
│       └── cli.py
└── tests/
    └── test_cli.py
\`\`\`

### 12.2 源码

\`\`\`python
# src/wordcount/__init__.py
__version__ = "1.0.0"

# src/wordcount/cli.py
import sys

def count_words(text):
    return len(text.split())

def main():
    if len(sys.argv) < 2:
        print("用法: wordcount <文本>")
        sys.exit(1)
    text = " ".join(sys.argv[1:])
    print("词数:", count_words(text))

if __name__ == "__main__":
    main()
\`\`\`

### 12.3 pyproject.toml

\`\`\`toml
[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "wordcount"
version = "1.0.0"
description = "一个简单的词数统计 CLI 工具"
readme = "README.md"
requires-python = ">=3.8"
license = {text = "MIT"}
authors = [{name = "Alice", email = "alice@example.com"}]
keywords = ["cli", "wordcount", "text"]
classifiers = [
    "Development Status :: 4 - Beta",
    "Programming Language :: Python :: 3",
    "License :: OSI Approved :: MIT License",
]

[project.scripts]
wordcount = "wordcount.cli:main"

[tool.setuptools.packages.find]
where = ["src"]
\`\`\`

### 12.4 构建与安装

\`\`\`bash
# 开发安装
pip install -e .

# 测试 CLI
wordcount hello world foo bar
# 词数: 4

# 构建
python -m build

# 上传（先注册 PyPI）
twine upload dist/*
\`\`\`

---

## 十三、常见陷阱与最佳实践

### 13.1 别用 setup.py

旧的 \`setup.py\` 方式已过时，新项目一律用 \`pyproject.toml\`。\`setup.py\` 容易出错（可执行代码做配置），\`pyproject.toml\` 是声明式的，更安全。

### 13.2 锁定构建依赖

\`[build-system].requires\` 要明确版本约束，避免「在我机器上能构建」的问题。

### 13.3 测试安装

发布前，在一个干净的环境里测试安装：

\`\`\`bash
python -m venv test_env
source test_env/bin/activate
pip install dist/my_package-1.0.0-py3-none-any.whl
python -c "import my_package; print(my_package.__version__)"
\`\`\`

### 13.4 版本号别回退

PyPI 不允许覆盖上传。一旦上传了 \`1.0.0\`，就不能再传 \`1.0.0\`（即使内容改了）。修了 bug 要升 \`1.0.1\`。

---

## 十四、小结

- 项目结构：src layout 推荐，避免导入陷阱。
- \`pyproject.toml\` 是现代打包核心：\`[build-system]\` 构建系统、\`[project]\` 元数据、\`[project.scripts]\` CLI 入口。
- 依赖：\`dependencies\` 主依赖、\`optional-dependencies\` 可选依赖（\`pip install pkg[dev]\`）。
- 版本：语义化版本 \`MAJOR.MINOR.PATCH\`，预发布用 \`-alpha\`/\`-beta\`/\`-rc\`。
- 构建用 \`python -m build\` 生成 sdist + wheel，上传用 \`twine upload\`。
- 开发安装 \`pip install -e .\`，源码修改即时生效。
- 包名全小写连字符，import 名下划线；LICENSE 选 MIT 最简单。

打包发布是让代码「走出本地」的关键一步。掌握 \`pyproject.toml\` 和 \`build\`/\`twine\`，你就能把工具分享给全世界。`,
    code: `# =============================================================
# 第六章：打包与发布 - 演示配置写法（不真正执行打包）
# =============================================================

print("=" * 60)
print("1. 项目结构对比")
print("=" * 60)

print("flat layout（扁平布局）:")
print("  my_project/")
print("  ├── pyproject.toml")
print("  ├── README.md")
print("  ├── my_package/")
print("  │   ├── __init__.py")
print("  │   ├── core.py")
print("  │   └── utils.py")
print("  └── tests/")
print("      └── test_core.py")

print()
print("src layout（推荐）:")
print("  my_project/")
print("  ├── pyproject.toml")
print("  ├── README.md")
print("  ├── src/")
print("  │   └── my_package/")
print("  │       ├── __init__.py")
print("  │       ├── core.py")
print("  │       └── utils.py")
print("  └── tests/")
print("      └── test_core.py")

print()
print("=" * 60)
print("2. __init__.py 的作用")
print("=" * 60)

# 演示 __init__.py 的内容
init_content = '''__version__ = "1.0.0"
__all__ = ["main_function", "helper"]

from my_package.core import main_function
from my_package.utils import helper
'''
print("典型的 __init__.py 内容:")
print(init_content)

print()
print("=" * 60)
print("3. 完整的 pyproject.toml 示例")
print("=" * 60)

pyproject_toml = '''[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "wordcount"
version = "1.0.0"
description = "一个简单的词数统计 CLI 工具"
readme = "README.md"
requires-python = ">=3.8"
license = {text = "MIT"}
authors = [
    {name = "Alice", email = "alice@example.com"}
]
keywords = ["cli", "wordcount", "text"]
classifiers = [
    "Development Status :: 4 - Beta",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
    "License :: OSI Approved :: MIT License",
    "Operating System :: OS Independent",
    "Topic :: Text Processing",
]
dependencies = [
    "click>=8.0",
]

[project.optional-dependencies]
dev = ["pytest>=7.0", "mypy>=1.0", "ruff>=0.1"]
test = ["pytest>=7.0", "pytest-cov>=4.0"]
docs = ["sphinx>=5.0"]

[project.scripts]
wordcount = "wordcount.cli:main"

[project.gui-scripts]
wordcount-gui = "wordcount.gui:run"

[project.entry-points."wordcount.formatters"]
plain = "wordcount.formatters:PlainFormatter"
json = "wordcount.formatters:JSONFormatter"
csv = "wordcount.formatters:CSVFormatter"

[tool.setuptools.packages.find]
where = ["src"]

[tool.setuptools.package-data]
wordcount = ["*.txt", "data/*.json"]

[tool.setuptools.dynamic]
version = {attr = "wordcount.__version__"}
'''
print("pyproject.toml 完整示例:")
print(pyproject_toml)

print()
print("=" * 60)
print("4. [build-system] 详解")
print("=" * 60)

print("[build-system] 部分:")
print('  requires = ["setuptools>=61.0"]   # 构建依赖')
print('  build-backend = "setuptools.build_meta"   # 构建后端')
print()
print("可选的构建后端:")
backends = [
    ("setuptools", "最传统、最成熟，兼容性最好"),
    ("hatchling", "现代后端，hatch 项目的后端"),
    ("flit-core", "极简，适合纯 Python 小包"),
    ("poetry-core", "poetry 项目的后端"),
]
for name, desc in backends:
    print("  " + name + " - " + desc)

print()
print("=" * 60)
print("5. [project] 元数据字段详解")
print("=" * 60)

fields = [
    ("name", "包名（PyPI 名，用连字符）", "my-package"),
    ("version", "版本号", "1.0.0"),
    ("description", "一句话描述", "一个示例包"),
    ("readme", "README 文件路径", "README.md"),
    ("requires-python", "支持的 Python 版本", ">=3.8"),
    ("license", "许可证", "{text = 'MIT'}"),
    ("authors", "作者列表", "[{name='Alice', email='a@b.com'}]"),
    ("keywords", "搜索关键词", '["example", "cli"]'),
    ("classifiers", "PyPI 分类标签", "见示例"),
    ("dependencies", "运行时依赖", '["requests>=2.20"]'),
]
print("常用字段:")
for name, desc, example in fields:
    print("  " + name)
    print("    说明: " + desc)
    print("    示例: " + example)

print()
print("=" * 60)
print("6. 依赖声明格式")
print("=" * 60)

deps = [
    ("requests>=2.20", "大于等于 2.20"),
    ("click>=8.0,<9.0", "大于等于 8.0 且小于 9.0"),
    ("rich~=10.0", "兼容 10.x（>=10.0, <11.0）"),
    ("django==4.2.0", "精确等于 4.2.0"),
    ("pylint!=3.0.0", "不等于 3.0.0"),
    ("fastapi[all]>=0.100", "带可选依赖 all"),
]
print("依赖版本约束格式:")
for dep, desc in deps:
    print("  " + dep + "  # " + desc)

print()
print("可选依赖 [project.optional-dependencies]:")
optional = '''[project.optional-dependencies]
dev = ["pytest>=7.0", "mypy>=1.0"]
docs = ["sphinx>=5.0"]
test = ["pytest>=7.0", "pytest-cov>=4.0"]
'''
print(optional)
print("安装方式:")
print("  pip install my-package              # 只装主依赖")
print("  pip install my-package[dev]         # 装主依赖 + dev")
print("  pip install my-package[dev,test]    # 装主依赖 + dev + test")

print()
print("=" * 60)
print("7. [project.scripts] CLI 入口")
print("=" * 60)

print("[project.scripts] 生成命令行工具:")
print('  [project.scripts]')
print('  my-cli = "my_package.cli:main"')
print()
print("安装后，用户可以直接运行:")
print("  $ my-cli arg1 arg2")
print("  等价于调用 my_package.cli 模块的 main 函数")

print()
print("GUI 入口 [project.gui-scripts]:")
print('  [project.gui-scripts]')
print('  my-gui = "my_package.gui:run"')
print("  (Windows 上不会弹出控制台窗口)")

print()
print("=" * 60)
print("8. entry-points 插件系统")
print("=" * 60)

ep_config = '''[project.entry-points."wordcount.formatters"]
plain = "wordcount.formatters:PlainFormatter"
json = "wordcount.formatters:JSONFormatter"
csv = "wordcount.formatters:CSVFormatter"
'''
print("entry-points 配置:")
print(ep_config)

print("运行时发现插件:")
plugin_code = '''from importlib.metadata import entry_points

def get_formatters():
    formatters = {}
    for ep in entry_points(group="wordcount.formatters"):
        formatters[ep.name] = ep.load()
    return formatters
'''
print(plugin_code)

print()
print("=" * 60)
print("9. 语义化版本 SemVer")
print("=" * 60)

print("SemVer 格式: MAJOR.MINOR.PATCH")
print("  MAJOR: 不兼容的 API 变更")
print("  MINOR: 向后兼容的新功能")
print("  PATCH: 向后兼容的 bug 修复")
print()
print("版本演进示例:")
versions = [
    ("0.1.0", "初始开发版"),
    ("0.2.0", "加新功能"),
    ("0.2.1", "修 bug"),
    ("1.0.0", "首个稳定版（API 稳定承诺）"),
    ("1.1.0", "加新功能"),
    ("1.1.1", "修 bug"),
    ("2.0.0", "破坏性 API 变更"),
]
for v, desc in versions:
    print("  " + v + " - " + desc)

print()
print("预发布版本:")
prerelease = [
    ("1.0.0-alpha.1", "alpha 版（早期）"),
    ("1.0.0-beta.1", "beta 版（功能完整，测试中）"),
    ("1.0.0-rc.1", "release candidate（候选发布）"),
    ("1.0.0", "正式版"),
]
for v, desc in prerelease:
    print("  " + v + " - " + desc)

print()
print("=" * 60)
print("10. 动态版本（从代码读取）")
print("=" * 60)

dynamic_config = '''[project]
dynamic = ["version"]

[tool.setuptools.dynamic]
version = {attr = "wordcount.__version__"}
'''
print("pyproject.toml 配置:")
print(dynamic_config)
print("这样版本号只在 __init__.py 的 __version__ 里维护一处")

print()
print("=" * 60)
print("11. wheel 与 sdist")
print("=" * 60)

print("构建产物:")
print("  dist/")
print("  ├── wordcount-1.0.0.tar.gz                    # sdist (源码包)")
print("  └── wordcount-1.0.0-py3-none-any.whl          # wheel (预编译包)")
print()
print("wheel 文件名格式:")
print("  {包名}-{版本}-{python标签}-{abi标签}-{平台标签}.whl")
print("  py3-none-any = 纯 Python，任何平台通用")
print("  cp310-cp310-linux_x86_64 = CPython 3.10, Linux x86_64")
print()
print("sdist: 源码包，安装时可能需要编译")
print("wheel: 预编译包，安装快（推荐）")

print()
print("=" * 60)
print("12. build 工具构建流程")
print("=" * 60)

print("构建命令（仅打印，不执行）:")
build_commands = [
    "pip install build",
    "python -m build           # 生成 sdist + wheel 到 dist/",
    "python -m build --sdist   # 只生成 sdist",
    "python -m build --wheel   # 只生成 wheel",
]
for cmd in build_commands:
    print("  $ " + cmd)

print()
print("构建过程:")
print("  1. build 创建隔离环境")
print("  2. 安装 [build-system].requires 里的构建依赖")
print("  3. 调用 build-backend 构建包")
print("  4. 输出到 dist/ 目录")

print()
print("=" * 60)
print("13. twine 上传 PyPI")
print("=" * 60)

print("上传命令（仅打印，不执行）:")
twine_commands = [
    "pip install twine",
    "twine upload dist/*                      # 上传到 PyPI",
    "twine upload --repository testpypi dist/* # 上传到 TestPyPI（测试）",
    "twine check dist/*                       # 检查产物是否规范",
]
for cmd in twine_commands:
    print("  $ " + cmd)

print()
print("上传步骤:")
print("  1. 注册 pypi.org 账号")
print("  2. 在 Account Settings 生成 API token")
print("  3. 配置 ~/.pypirc（可选）:")
pypirc = '''[pypi]
username = __token__
password = pypi-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

[testpypi]
repository = https://test.pypi.org/legacy/
username = __token__
password = pypi-yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
'''
print(pypirc)
print("  4. twine upload dist/*")

print()
print("=" * 60)
print("14. 开发安装 pip install -e .")
print("=" * 60)

print("开发安装命令（仅打印）:")
dev_commands = [
    "cd my_project",
    "pip install -e .         # 可编辑安装（editable）",
    "pip install -e '.[dev]'  # 可编辑安装 + dev 依赖",
]
for cmd in dev_commands:
    print("  $ " + cmd)

print()
print("可编辑安装原理:")
print("  - 在 site-packages 放一个 .pth 文件指向源码目录")
print("  - import 时直接加载源码，修改立即生效")
print("  - 适合开发调试，不需要每次改代码重新安装")

print()
print("=" * 60)
print("15. 完整实战：wordcount CLI 工具")
print("=" * 60)

print("项目结构:")
print("  wordcount/")
print("  ├── pyproject.toml")
print("  ├── README.md")
print("  ├── LICENSE")
print("  ├── src/")
print("  │   └── wordcount/")
print("  │       ├── __init__.py")
print("  │       ├── cli.py")
print("  │       └── formatters.py")
print("  └── tests/")
print("      └── test_cli.py")

print()
print("--- src/wordcount/__init__.py ---")
init_code = '''__version__ = "1.0.0"
'''
print(init_code)

print("--- src/wordcount/cli.py ---")
cli_code = '''import sys

def count_words(text):
    """统计文本中的词数"""
    return len(text.split())

def count_lines(text):
    """统计行数"""
    return len(text.splitlines())

def count_chars(text):
    """统计字符数"""
    return len(text)

def main():
    if len(sys.argv) < 2:
        print("用法: wordcount <文本>")
        print("  统计文本的词数、行数、字符数")
        sys.exit(1)
    text = " ".join(sys.argv[1:])
    print("词数:", count_words(text))
    print("字符数:", count_chars(text))

if __name__ == "__main__":
    main()
'''
print(cli_code)

print("--- src/wordcount/formatters.py ---")
formatters_code = '''class PlainFormatter:
    def format(self, data):
        return " | ".join(k + ": " + str(v) for k, v in data.items())

class JSONFormatter:
    def format(self, data):
        import json
        return json.dumps(data, ensure_ascii=False)

class CSVFormatter:
    def format(self, data):
        lines = [",".join(data.keys())]
        lines.append(",".join(str(v) for v in data.values()))
        return "\\n".join(lines)
'''
print(formatters_code)

print("--- tests/test_cli.py ---")
test_code = '''import pytest
from wordcount.cli import count_words, count_lines, count_chars

def test_count_words():
    assert count_words("hello world") == 2
    assert count_words("one") == 1
    assert count_words("") == 0

def test_count_chars():
    assert count_chars("abc") == 3
    assert count_chars("") == 0

def test_count_lines():
    assert count_lines("a\\nb\\nc") == 3
'''
print(test_code)

print()
print("=" * 60)
print("16. 实际运行 wordcount 的核心功能")
print("=" * 60)

# 实际实现并运行 wordcount 的核心逻辑
def count_words(text):
    return len(text.split())

def count_lines(text):
    return len(text.splitlines())

def count_chars(text):
    return len(text)

samples = [
    "hello world foo bar",
    "Python 打包发布教程",
    "one two three four five six",
    "",
]
print("词数统计演示:")
for s in samples:
    words = count_words(s)
    chars = count_chars(s)
    print("  文本: " + repr(s))
    print("    词数=" + str(words) + " 字符数=" + str(chars))

# 测试 formatters
class PlainFormatter:
    def format(self, data):
        return " | ".join(k + ": " + str(v) for k, v in data.items())

class JSONFormatter:
    def format(self, data):
        import json
        return json.dumps(data, ensure_ascii=False)

class CSVFormatter:
    def format(self, data):
        lines = [",".join(data.keys())]
        lines.append(",".join(str(v) for v in data.values()))
        return "\\n".join(lines)

print()
print("格式化器演示:")
data = {"words": 4, "chars": 19, "lines": 1}
for name, fmt in [("Plain", PlainFormatter()), ("JSON", JSONFormatter()), ("CSV", CSVFormatter())]:
    print("  " + name + ":", fmt.format(data))

print()
print("=" * 60)
print("17. 包名规范")
print("=" * 60)

print("包名规范:")
print("  - 全小写，用连字符分隔: my-package（不用下划线、不用大写）")
print("  - 简短、有描述性、不易冲突")
print("  - 不要和 PyPI 已有包重名")
print("  - import 名用下划线: my_package")
print()
print("示例:")
naming = [
    ("my-package", "my_package", "正确：PyPI 名连字符，import 名下划线"),
    ("MyPackage", "MyPackage", "错误：不要用大写"),
    ("my_package", "my_package", "不推荐：PyPI 名用连字符更好"),
    ("requests", "requests", "正确：单词包名"),
]
for pypi_name, import_name, note in naming:
    print("  PyPI: " + pypi_name + " / import: " + import_name + "  " + note)

print()
print("=" * 60)
print("18. LICENSE 选择")
print("=" * 60)

licenses = [
    ("MIT", "最宽松，几乎允许任何用途，只要保留版权声明", "最常用"),
    ("Apache 2.0", "类似 MIT，但包含专利授权条款", "企业常用"),
    ("GPL v3", "强 copyleft，衍生作品必须开源", "自由软件"),
    ("BSD 3-Clause", "类似 MIT 的宽松许可", "经典选择"),
    ("LGPL", "弱 copyleft，适合库", "库常用"),
    ("Unlicense", "放弃版权，完全公开", "极端自由"),
]
print("常见开源许可证:")
for name, desc, note in licenses:
    print("  " + name + " - " + desc + " (" + note + ")")

print()
print("MIT 许可证示例（LICENSE 文件）:")
mit_license = '''MIT License

Copyright (c) 2024 Alice

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND...
'''
print(mit_license[:200] + "...")

print()
print("=" * 60)
print("19. 命名空间包")
print("=" * 60)

print("PEP 420 隐式命名空间包:")
print("  不需要 __init__.py，目录在 sys.path 上就能导入")
print()
print("  projects/")
print("  ├── package_a/")
print("  │   └── myns/")
print("  │       └── module_a.py    # 没有 __init__.py")
print("  └── package_b/")
print("      └── myns/")
print("          └── module_b.py    # 没有 __init__.py")
print()
print("  两个独立的包共享 myns 命名空间")

print()
print("=" * 60)
print("20. 发布检查清单")
print("=" * 60)

checklist = [
    "pyproject.toml 配置完整（name, version, description, readme）",
    "README.md 内容完整，有安装和用法说明",
    "LICENSE 文件存在",
    "requires-python 声明正确",
    "dependencies 和 optional-dependencies 声明完整",
    "[project.scripts] CLI 入口配置正确",
    "版本号符合 SemVer",
    "python -m build 构建成功，无错误",
    "twine check dist/* 通过",
    "干净环境 pip install dist/*.whl 测试通过",
    "CLI 命令运行正常",
    "先上传 TestPyPI 验证",
    "再上传正式 PyPI",
]
print("发布前检查清单:")
for i, item in enumerate(checklist, 1):
    print("  " + str(i) + ". " + item)

print()
print("=" * 60)
print("21. 常用命令速查")
print("=" * 60)

commands = [
    ("pip install build", "安装构建工具"),
    ("python -m build", "构建 sdist + wheel"),
    ("pip install twine", "安装上传工具"),
    ("twine check dist/*", "检查产物"),
    ("twine upload dist/*", "上传到 PyPI"),
    ("twine upload --repository testpypi dist/*", "上传到 TestPyPI"),
    ("pip install -e .", "开发安装（可编辑）"),
    ("pip install -e .[dev]", "开发安装 + dev 依赖"),
    ("pip install my-package", "从 PyPI 安装"),
    ("pip install my-package[dev]", "安装 + 可选依赖"),
    ("python -m unittest discover", "运行 unittest 测试"),
    ("pytest", "运行 pytest 测试"),
    ("mypy src/", "类型检查"),
    ("ruff check src/", "代码检查"),
]
print("常用命令:")
for cmd, desc in commands:
    print("  $ " + cmd)
    print("      " + desc)

print()
print("=" * 60)
print("全部演示完成！")
print("=" * 60)
`,
  },
];