// =============================================================
// Python 面向对象教程（pyobject）—— 第四批章节
// -------------------------------------------------------------
// 进阶特性（15-19章）
//   第 15 章：classmethod 与 staticmethod
//   第 16 章：描述符：__get__、__set__、__delete__
//   第 17 章：元类：类的类
//   第 18 章：抽象基类深入：collections.abc
//   第 19 章：dataclass：自动生成样板代码
// =============================================================

export const chapters = [
  // =========================================================
  // 第十五章：classmethod 与 staticmethod
  // =========================================================
  {
    id: "po-15",
    group: "进阶特性",
    icon: "🔧",
    title: "classmethod 与 staticmethod",
    content: `## 一、3 种方法类型

| 类型 | 装饰器 | 第一个参数 |
|------|--------|------------|
| **实例方法** | 无 | \`self\`（实例） |
| **类方法** | \`@classmethod\` | \`cls\`（类） |
| **静态方法** | \`@staticmethod\` | 无 |

## 二、实例方法

\`\`\`python
class User:
    def __init__(self, name):
        self.name = name
    def greet(self):  # self 是实例
        return f"Hi, {self.name}"
\`\`\`

## 三、classmethod

\`\`\`python
class User:
    count = 0
    def __init__(self, name):
        self.name = name
        User.count += 1

    @classmethod
    def total(cls):  # cls 是类
        return cls.count

    @classmethod
    def from_dict(cls, data):
        # 替代构造器
        return cls(data["name"])
\`\`\`

## 四、classmethod 的应用

1. **替代构造器**：\`from_string\`、\`from_dict\`
2. **工厂方法**：根据类型创建不同子类
3. **访问类属性**

## 五、staticmethod

\`\`\`python
class Math:
    @staticmethod
    def add(a, b):
        return a + b
\`\`\`

- 不需要 self 也不需要 cls
- 逻辑上属于类，但不依赖类或实例

## 六、staticmethod 的应用

1. **工具函数**：逻辑上属于类
2. **不需要 self/cls 的方法**
3. **代码组织**：放一起

## 七、对比

\`\`\`python
class Demo:
    CONST = 10

    def m1(self):       # 实例方法
        return self.CONST

    @classmethod
    def m2(cls):        # 类方法
        return cls.CONST

    @staticmethod
    def m3():           # 静态方法
        return Demo.CONST
\`\`\`

## 八、什么时候用？

- 用实例方法：需要访问实例
- 用 classmethod：需要访问类或作为工厂
- 用 staticmethod：只是逻辑上属于类

## 九、本章 demo

演示 3 种方法的区别。
`,
    code: `"""
第十五章 demo：classmethod 与 staticmethod
演示：
  1. 实例方法 vs 类方法 vs 静态方法
  2. classmethod 替代构造器
  3. classmethod 工厂方法
  4. staticmethod 工具函数
  5. 实战：日期类
"""


# ===== 1. 三种方法对比 =====
class Demo:
    CONST = 100

    def instance_method(self):
        return f"实例方法, self.CONST = {self.CONST}"

    @classmethod
    def class_method(cls):
        return f"类方法, cls.CONST = {cls.CONST}"

    @staticmethod
    def static_method():
        return f"静态方法, Demo.CONST = {Demo.CONST}"


print("=== 1. 三种方法 ===")
d = Demo()
print(f"  {d.instance_method()}")
print(f"  {Demo.class_method()}")
print(f"  {Demo.static_method()}")
print()


# ===== 2. classmethod 替代构造器 =====
class User:
    """用户类：多种构造方式"""

    def __init__(self, name, age):
        self.name = name
        self.age = age

    @classmethod
    def from_string(cls, s):
        """从字符串构造: 'Alice,30'"""
        name, age = s.split(",")
        return cls(name, int(age))

    @classmethod
    def from_dict(cls, d):
        """从字典构造"""
        return cls(d["name"], d["age"])

    @classmethod
    def child(cls, name):
        """特殊构造：默认 0 岁"""
        return cls(name, 0)

    def __repr__(self):
        return f"User({self.name}, {self.age})"


print("=== 2. classmethod 替代构造器 ===")
u1 = User("Alice", 30)
u2 = User.from_string("Bob,25")
u3 = User.from_dict({"name": "Carol", "age": 28})
u4 = User.child("Dave")
print(f"  u1 = {u1}")
print(f"  u2 = {u2}（from_string）")
print(f"  u3 = {u3}（from_dict）")
print(f"  u4 = {u4}（child）")
print()


# ===== 3. classmethod 工厂方法 =====
class Shape:
    """图形（基类）"""

    def __init__(self, **kwargs):
        self.attrs = kwargs

    @classmethod
    def create(cls, shape_type, **kwargs):
        """工厂方法"""
        if shape_type == "circle":
            return Circle(**kwargs)
        elif shape_type == "rect":
            return Rectangle(**kwargs)
        elif shape_type == "triangle":
            return Triangle(**kwargs)
        raise ValueError(f"未知图形: {shape_type}")


class Circle(Shape):
    def area(self):
        import math
        return math.pi * self.attrs["r"] ** 2


class Rectangle(Shape):
    def area(self):
        return self.attrs["w"] * self.attrs["h"]


class Triangle(Shape):
    def area(self):
        return 0.5 * self.attrs["base"] * self.attrs["height"]


print("=== 3. classmethod 工厂方法 ===")
shapes = [
    Shape.create("circle", r=5),
    Shape.create("rect", w=4, h=6),
    Shape.create("triangle", base=3, height=8),
]
for s in shapes:
    print(f"  {type(s).__name__}: 面积 = {s.area():.2f}")
print()


# ===== 4. staticmethod 工具函数 =====
class Validator:
    """验证器：工具方法集合"""

    @staticmethod
    def is_email(s):
        """简单邮箱验证"""
        return "@" in s and "." in s

    @staticmethod
    def is_phone(s):
        """简单手机号验证"""
        return len(s) == 11 and s.isdigit()

    @staticmethod
    def is_strong_password(p):
        return len(p) >= 8 and any(c.isdigit() for c in p)


print("=== 4. staticmethod 工具函数 ===")
print(f"  is_email('a@b.com'): {Validator.is_email('a@b.com')}")
print(f"  is_email('abc'):     {Validator.is_email('abc')}")
print(f"  is_phone('13800138000'): {Validator.is_phone('13800138000')}")
print(f"  is_strong_password('abc'): {Validator.is_strong_password('abc')}")
print(f"  is_strong_password('abc12345'): {Validator.is_strong_password('abc12345')}")
print()


# ===== 5. 实战：日期类 =====
class Date:
    """日期类：多种构造方式"""

    def __init__(self, year, month, day):
        if not (1 <= month <= 12):
            raise ValueError("月份必须在 1-12")
        if not (1 <= day <= 31):
            raise ValueError("日期必须在 1-31")
        self.year = year
        self.month = month
        self.day = day

    @classmethod
    def from_string(cls, s):
        """从 '2024-01-15' 构造"""
        year, month, day = s.split("-")
        return cls(int(year), int(month), int(day))

    @classmethod
    def today(cls):
        """获取今天"""
        import datetime
        t = datetime.date.today()
        return cls(t.year, t.month, t.day)

    def __repr__(self):
        return f"Date({self.year}-{self.month:02d}-{self.day:02d})"


print("=== 5. 实战：日期类 ===")
d1 = Date(2024, 1, 15)
d2 = Date.from_string("2024-12-25")
print(f"  d1 = {d1}")
print(f"  d2 = {d2}（from_string）")
print()


# ===== 6. 实战：单例模式 =====
class Singleton:
    """单例模式"""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        # 只初始化一次
        if not hasattr(self, "name"):
            self.name = "default"


print("=== 6. 实战：单例模式 ===")
s1 = Singleton()
s2 = Singleton()
s1.name = "modified"
print(f"  s1.name = {s1.name}")
print(f"  s2.name = {s2.name}")
print(f"  s1 is s2: {s1 is s2}")
`,
  },

  // =========================================================
  // 第十六章：描述符：__get__、__set__、__delete__
  // =========================================================
  {
    id: "po-16",
    group: "进阶特性",
    icon: "🔍",
    title: "描述符：__get__、__set__、__delete__",
    content: `## 一、什么是描述符？

实现了 \`__get__\`、\`__set__\`、\`__delete__\` 之一的对象。

## 二、描述符的威力

- Python 的 \`property\`、\`classmethod\`、\`staticmethod\` 都是描述符
- ORM 字段（\`Model.field\`）用描述符实现
- 自定义属性访问

## 三、3 个魔术方法

| 方法 | 触发时机 |
|------|----------|
| \`__get__(self, instance, owner)\` | \`obj.attr\` |
| \`__set__(self, instance, value)\` | \`obj.attr = v\` |
| \`__delete__(self, instance)\` | \`del obj.attr\` |

## 四、最简单的描述符

\`\`\`python
class MyDescriptor:
    def __get__(self, instance, owner):
        return "got"

    def __set__(self, instance, value):
        print(f"set to {value}")

class Foo:
    x = MyDescriptor()

f = Foo()
print(f.x)  # got
f.x = 100  # set to 100
\`\`\`

## 五、数据描述符 vs 非数据描述符

- **数据描述符**：定义了 \`__set__\` 或 \`__delete__\`
  - 优先级**高于**实例字典
- **非数据描述符**：只定义了 \`__get__\`
  - 优先级**低于**实例字典

## 六、验证器描述符

\`\`\`python
class Positive:
    def __get__(self, instance, owner):
        return instance.__dict__[self.name]

    def __set__(self, instance, value):
        if value < 0:
            raise ValueError("必须为正")
        instance.__dict__[self.name] = value
\`\`\`

## 七、用描述符写 property

\`\`\`python
class MyProperty:
    def __init__(self, getter):
        self.getter = getter

    def __get__(self, instance, owner):
        if instance is None:
            return self
        return self.getter(instance)
\`\`\`

## 八、ORM 字段示例

\`\`\`python
class Field:
    def __init__(self, name):
        self.name = name

    def __get__(self, instance, owner):
        return instance.__dict__.get(self.name)

    def __set__(self, instance, value):
        instance.__dict__[self.name] = value

class User:
    name = Field("name")
    age = Field("age")
\`\`\`

## 九、什么时候用描述符？

- **重复的 property 逻辑**
- **ORM 字段**
- **类型检查**
- **自定义属性访问**

## 十、本章 demo

演示描述符的各种用法。
`,
    code: `"""
第十六章 demo：描述符
演示：
  1. 最简单的描述符
  2. 验证器描述符（类型检查）
  3. 描述符 + 元类
  4. 实战：ORM 字段
  5. 实战：lazy 属性
"""


# ===== 1. 最简单的描述符 =====
class MyDescriptor:
    """最基础的描述符"""

    def __get__(self, instance, owner):
        print(f"  [__get__] instance={instance}, owner={owner}")
        return self.value

    def __set__(self, instance, value):
        print(f"  [__set__] value={value}")
        self.value = value


class Foo1:
    x = MyDescriptor()


print("=== 1. 最简单的描述符 ===")
f = Foo1()
f.x = 100
print(f"  f.x = {f.x}")
print()


# ===== 2. 类型验证描述符 =====
class Typed:
    """类型验证描述符"""

    def __init__(self, name, expected_type):
        self.name = name
        self.expected_type = expected_type

    def __get__(self, instance, owner):
        if instance is None:
            return self
        return instance.__dict__.get(self.name)

    def __set__(self, instance, value):
        if not isinstance(value, self.expected_type):
            raise TypeError(f"{self.name} 必须是 {self.expected_type.__name__}")
        instance.__dict__[self.name] = value


class Person1:
    name = Typed("name", str)
    age = Typed("age", int)


print("=== 2. 类型验证 ===")
p = Person1()
p.name = "Alice"
p.age = 30
print(f"  p.name = {p.name}, p.age = {p.age}")
try:
    p.age = "thirty"
except TypeError as e:
    print(f"  报错: {e}")
print()


# ===== 3. 范围验证 =====
class Range:
    """范围验证描述符"""

    def __init__(self, name, min_val, max_val):
        self.name = name
        self.min = min_val
        self.max = max_val

    def __get__(self, instance, owner):
        if instance is None:
            return self
        return instance.__dict__.get(self.name)

    def __set__(self, instance, value):
        if not (self.min <= value <= self.max):
            raise ValueError(f"{self.name} 必须在 {self.min}-{self.max} 之间")
        instance.__dict__[self.name] = value


class Score:
    math = Range("math", 0, 100)
    english = Range("english", 0, 100)


print("=== 3. 范围验证 ===")
s = Score()
s.math = 90
s.english = 85
print(f"  math={s.math}, english={s.english}")
try:
    s.math = 150
except ValueError as e:
    print(f"  报错: {e}")
print()


# ===== 4. 实战：ORM 字段 =====
class Field:
    """ORM 字段：自动跟踪"""

    def __init__(self, field_type):
        self.field_type = field_type
        self.name = None  # 由元类或 set_name 设置

    def __set_name__(self, owner, name):
        # Python 3.6+ 自动调用
        self.name = name

    def __get__(self, instance, owner):
        if instance is None:
            return self
        return instance.__dict__.get(self.name)

    def __set__(self, instance, value):
        if not isinstance(value, self.field_type):
            raise TypeError(f"{self.name} 必须是 {self.field_type.__name__}")
        instance.__dict__[self.name] = value


class User4:
    name = Field(str)
    age = Field(int)
    email = Field(str)

    def __repr__(self):
        return f"User(name={self.name}, age={self.age}, email={self.email})"


print("=== 4. 实战：ORM 字段 ===")
u = User4()
u.name = "Alice"
u.age = 30
u.email = "alice@example.com"
print(f"  {u}")
try:
    u.age = "30"
except TypeError as e:
    print(f"  报错: {e}")
print()


# ===== 5. 实战：lazy 属性（懒加载） =====
class Lazy:
    """懒加载属性：第一次访问时计算，之后缓存"""

    def __init__(self, func):
        self.func = func
        self.name = func.__name__

    def __get__(self, instance, owner):
        if instance is None:
            return self
        print(f"  [计算 {self.name}]")
        value = self.func(instance)
        instance.__dict__[self.name] = value
        return value


class Data:
    @Lazy
    def heavy(self):
        """模拟重计算"""
        return sum(range(1000000))


print("=== 5. 实战：lazy 属性 ===")
d = Data()
print(f"  第一次访问: {d.heavy}")
print(f"  第二次访问: {d.heavy}（直接读缓存）")
print()


# ===== 6. 实战：日志描述符 =====
class Logged:
    """记录属性访问的描述符"""

    def __init__(self, name=None):
        self.name = name

    def __set_name__(self, owner, name):
        self.storage_name = "_" + name

    def __get__(self, instance, owner):
        if instance is None:
            return self
        value = getattr(instance, self.storage_name, None)
        print(f"  [GET] {self.name} = {value}")
        return value

    def __set__(self, instance, value):
        old = getattr(instance, self.storage_name, None)
        print(f"  [SET] {self.name}: {old} -> {value}")
        setattr(instance, self.storage_name, value)


class Account:
    balance = Logged()
    name = Logged()


print("=== 6. 实战：日志描述符 ===")
acc = Account()
acc.name = "Alice"
acc.balance = 100
acc.balance = acc.balance + 50
`,
  },

  // =========================================================
  // 第十七章：元类：类的类
  // =========================================================
  {
    id: "po-17",
    group: "进阶特性",
    icon: "🎩",
    title: "元类：类的类",
    content: `## 一、什么是元类？

**元类 = 创建类的类**。

\`\`\`python
# 实例 = class 的对象
# class = type 的对象
type(User)  # <class 'type'>
\`\`\`

## 二、type 是默认的元类

\`\`\`python
# 写法 1: class 关键字（用 type 创建）
class User:
    pass

# 写法 2: type() 函数
User = type("User", (), {})
\`\`\`

## 三、type 动态创建类

\`\`\`python
User = type("User", (object,), {
    "name": "default",
    "greet": lambda self: "Hello"
})
\`\`\`

参数：
- 名字
- 父类元组
- 属性字典

## 四、自定义元类

继承 \`type\`：

\`\`\`python
class MyMeta(type):
    def __new__(mcs, name, bases, namespace):
        # 在类创建时插入逻辑
        return super().__new__(mcs, name, bases, namespace)
\`\`\`

## 五、__new__ vs __init__ in 元类

- \`__new__\`: 创建类对象（必须返回）
- \`__init__\`: 初始化类对象

## 六、用 metaclass 参数指定元类

\`\`\`python
class MyClass(metaclass=MyMeta):
    pass
\`\`\`

## 七、元类的应用

1. **ORM**：Django Model、SQLAlchemy
2. **接口注册**：自动注册子类
3. **单例模式**：限制类只能有一个实例
4. **API 检查**：强制方法命名

## 八、__init_subclass__（替代方案）

Python 3.6+ 提供 \`__init_subclass__\`，更简单：

\`\`\`python
class Base:
    def __init_subclass__(cls, **kwargs):
        # 子类创建时调用
        super().__init_subclass__(**kwargs)
\`\`\`

## 九、什么时候用元类？

- **95% 的情况**：不需要
- **框架开发**：ORM、API 框架
- **业务代码**：用更简单的方案

## 十、本章 demo

演示元类的各种用法。
`,
    code: `"""
第十七章 demo：元类
演示：
  1. type 动态创建类
  2. 自定义元类
  3. 实战：自动注册子类
  4. 实战：强制方法命名
  5. __init_subclass__ 替代方案
"""


# ===== 1. type 动态创建类 =====
print("=== 1. type 动态创建类 ===")

# 用 type 创建类
User = type("User", (), {
    "greeting": "Hello",
    "greet": lambda self: f"{self.greeting}, {self.name}!",
    "__init__": lambda self, name: setattr(self, "name", name),
})

u = User("Alice")
print(f"  u.greet() = {u.greet()}")
print(f"  type(User) = {type(User).__name__}")
print()


# ===== 2. 自定义元类 =====
class MyMeta(type):
    """自定义元类：在类创建时打印信息"""

    def __new__(mcs, name, bases, namespace):
        print(f"  [元类] 创建类: {name}")
        print(f"          父类: {[b.__name__ for b in bases]}")
        return super().__new__(mcs, name, bases, namespace)


class Base2(metaclass=MyMeta):
    pass


class Sub2(Base2):
    pass
print()


# ===== 3. 实战：自动注册子类 =====
class RegistryMeta(type):
    """自动注册所有子类到字典"""

    registry = {}

    def __new__(mcs, name, bases, namespace):
        cls = super().__new__(mcs, name, bases, namespace)
        if bases:  # 排除基类本身
            RegistryMeta.registry[name] = cls
        return cls


class PluginBase(metaclass=RegistryMeta):
    pass


class JSONPlugin(PluginBase):
    def run(self):
        return "JSON 处理"


class XMLPlugin(PluginBase):
    def run(self):
        return "XML 处理"


class CSVPlugin(PluginBase):
    def run(self):
        return "CSV 处理"


print("=== 3. 自动注册子类 ===")
print(f"  已注册: {list(RegistryMeta.registry.keys())}")
for name, cls in RegistryMeta.registry.items():
    print(f"  {name}: {cls().run()}")
print()


# ===== 4. 实战：强制方法命名 =====
class StrictMeta(type):
    """强制方法以 _ 开头（私有）"""

    def __new__(mcs, name, bases, namespace):
        for attr_name, attr_value in namespace.items():
            if callable(attr_value) and not attr_name.startswith("_"):
                if attr_name not in ("__init__", "__str__", "__repr__"):
                    print(f"  [警告] {attr_name} 应该加下划线前缀")
        return super().__new__(mcs, name, bases, namespace)


class StrictClass(metaclass=StrictMeta):
    def public_method(self):  # 会警告
        pass

    def _private_method(self):  # OK
        pass
print()


# ===== 5. __init_subclass__ 替代方案 =====
class Base3:
    """__init_subclass__ 在子类创建时调用"""

    subclasses = []

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        Base3.subclasses.append(cls)
        print(f"  [注册] {cls.__name__}")


class SubA(Base3):
    pass


class SubB(Base3):
    pass


print("=== 5. __init_subclass__ ===")
print(f"  所有子类: {[c.__name__ for c in Base3.subclasses]}")
print()


# ===== 6. 实战：单例元类 =====
class SingletonMeta(type):
    """单例元类"""

    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            instance = super().__call__(*args, **kwargs)
            cls._instances[cls] = instance
        return cls._instances[cls]


class Singleton(metaclass=SingletonMeta):
    def __init__(self, name):
        self.name = name


print("=== 6. 单例元类 ===")
s1 = Singleton("first")
s2 = Singleton("second")
print(f"  s1.name = {s1.name}")
print(f"  s2.name = {s2.name}")
print(f"  s1 is s2: {s1 is s2}")
print()


# ===== 7. 实战：自动添加 __repr__ =====
class AutoReprMeta(type):
    """没有定义 __repr__ 的类自动生成"""

    def __new__(mcs, name, bases, namespace):
        # 如果没定义 __repr__，自动添加
        if "__repr__" not in namespace:
            attrs = ", ".join(f"{k}={{self.{k}!r}}" for k in namespace if not k.startswith("_"))
            repr_str = f"def __repr__(self): return f'{name}({attrs})'"
            exec(repr_str, namespace)
        return super().__new__(mcs, name, bases, namespace)


class Point3D(metaclass=AutoReprMeta):
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z


print("=== 7. 自动 __repr__ ===")
p = Point3D(1, 2, 3)
print(f"  p = {p}")
`,
  },

  // =========================================================
  // 第十八章：抽象基类深入：collections.abc
  // =========================================================
  {
    id: "po-18",
    group: "进阶特性",
    icon: "📚",
    title: "抽象基类深入：collections.abc",
    content: `## 一、什么是 collections.abc？

Python 标准库提供的**抽象基类**集合：

- \`Sequence\`: 序列（list, tuple, str）
- \`Mapping\`: 映射（dict）
- \`Set\`: 集合（set, frozenset）
- \`Iterable\`: 可迭代
- \`Iterator\`: 迭代器
- \`Container\`: 容器
- \`Sized\`: 有 \`__len__\`
- \`Callable\`: 可调用

## 二、为什么要用？

实现 ABC 自动获得许多方法（如 \`__contains__\`、\`__iter__\`）。

## 三、继承 Sequence

\`\`\`python
from collections.abc import Sequence

class MyList(Sequence):
    def __init__(self, data):
        self.data = data
    def __getitem__(self, i):
        return self.data[i]
    def __len__(self):
        return len(self.data)

# 自动获得：__contains__、__iter__、index、count
\`\`\`

## 四、Mapping

\`\`\`python
from collections.abc import Mapping

class MyDict(Mapping):
    def __init__(self):
        self.data = {}
    def __getitem__(self, k):
        return self.data[k]
    def __setitem__(self, k, v):
        self.data[k] = v
    def __iter__(self):
        return iter(self.data)
    def __len__(self):
        return len(self.data)
\`\`\`

## 五、Set

\`\`\`python
from collections.abc import Set
\`\`\`

## 六、Iterable 和 Iterator

- \`Iterable\`: 有 \`__iter__\`
- \`Iterator\`: 有 \`__iter__\` 和 \`__next__\`

## 七、register 鸭子类型

\`\`\`python
from collections.abc import Sequence

# 让 str 变成 Sequence（已经是了，只是例子）
Sequence.register(str)
\`\`\`

## 八、isinstance 检查

\`\`\`python
isinstance([], Sequence)   # True
isinstance({}, Mapping)    # True
isinstance({}, Iterable)   # True
isinstance("abc", Sequence) # True
\`\`\`

## 九、什么时候用？

- 实现自定义容器：自动获得很多方法
- 类型检查：isinstance + ABC
- 接口规范：定义抽象方法

## 十、本章 demo

演示 collections.abc 的各种用法。
`,
    code: `"""
第十八章 demo：collections.abc
演示：
  1. 继承 Sequence
  2. 继承 Mapping
  3. 继承 Set
  4. Iterable vs Iterator
  5. register 鸭子类型
  6. 实战：自定义只读映射
"""
from collections.abc import (
    Sequence, Mapping, Set, Iterable, Iterator, Container, Sized
)


# ===== 1. 自定义 Sequence =====
class MyList(Sequence):
    """自定义序列"""

    def __init__(self, data):
        self.data = list(data)

    def __getitem__(self, i):
        return self.data[i]

    def __len__(self):
        return len(self.data)

    def __repr__(self):
        return f"MyList({self.data})"


print("=== 1. 继承 Sequence ===")
ml = MyList([1, 2, 3, 4, 5])
print(f"  ml = {ml}")
print(f"  len(ml) = {len(ml)}")
print(f"  ml[0] = {ml[0]}")
print(f"  2 in ml = {2 in ml}（自动 __contains__）")
print(f"  ml.index(3) = {ml.index(3)}（自动）")
print(f"  ml.count(2) = {ml.count(2)}（自动）")
for x in ml:
    print(f"    {x}", end=" ")
print()
print()


# ===== 2. 自定义 Mapping =====
class MyDict(Mapping):
    """自定义映射"""

    def __init__(self, **kwargs):
        self.data = dict(kwargs)

    def __getitem__(self, key):
        return self.data[key]

    def __iter__(self):
        return iter(self.data)

    def __len__(self):
        return len(self.data)

    def __repr__(self):
        return f"MyDict({self.data})"


print("=== 2. 继承 Mapping ===")
d = MyDict(name="Alice", age=30, city="北京")
print(f"  d = {d}")
print(f"  d['name'] = {d['name']}")
print(f"  'name' in d: {'name' in d}")
print(f"  len(d): {len(d)}")
print(f"  keys: {list(d.keys())}（自动）")
print(f"  values: {list(d.values())}（自动）")
print(f"  items: {list(d.items())}（自动）")
print()


# ===== 3. 自定义 Set =====
class MySet(Set):
    """自定义集合"""

    def __init__(self, items=None):
        self.data = set(items or [])

    def __contains__(self, item):
        return item in self.data

    def __iter__(self):
        return iter(self.data)

    def __len__(self):
        return len(self.data)

    def __repr__(self):
        return f"MySet({sorted(self.data)})"


print("=== 3. 继承 Set ===")
s1 = MySet([1, 2, 3])
s2 = MySet([3, 4, 5])
print(f"  s1 = {s1}")
print(f"  s2 = {s2}")
print(f"  s1 & s2 = {s1 & s2}（自动）")
print(f"  s1 | s2 = {s1 | s2}（自动）")
print(f"  s1 - s2 = {s1 - s2}（自动）")
print()


# ===== 4. Iterable vs Iterator =====
print("=== 4. Iterable vs Iterator ===")
print(f"  isinstance([], Iterable): {isinstance([], Iterable)}")
print(f"  isinstance([], Iterator): {isinstance([], Iterator)}")
print(f"  isinstance(iter([]), Iterator): {isinstance(iter([]), Iterator)}")
print(f"  isinstance(42, Iterable): {isinstance(42, Iterable)}")
print()


# ===== 5. 实战：自定义迭代器 =====
class Countdown:
    """倒计时迭代器"""

    def __init__(self, n):
        self.n = n

    def __iter__(self):
        return self

    def __next__(self):
        if self.n <= 0:
            raise StopIteration
        self.n -= 1
        return self.n + 1


print("=== 5. 实战：倒计时 ===")
for i in Countdown(5):
    print(f"  {i}...")
print("  发射！")
print()


# ===== 6. 实战：只读映射 =====
class ReadOnlyDict(Mapping):
    """只读字典"""

    def __init__(self, data):
        self.__data = dict(data)

    def __getitem__(self, key):
        return self.__data[key]

    def __iter__(self):
        return iter(self.__data)

    def __len__(self):
        return len(self.__data)


print("=== 6. 实战：只读字典 ===")
config = ReadOnlyDict({"host": "localhost", "port": 8080})
print(f"  config['host'] = {config['host']}")
print(f"  len(config) = {len(config)}")
for k in config:
    print(f"    {k} = {config[k]}")
try:
    config["new"] = "value"
except TypeError as e:
    print(f"  修改报错: {e}")
print()


# ===== 7. isinstance 综合检查 =====
print("=== 7. isinstance 综合 ===")
items = [
    [1, 2, 3],
    {"a": 1},
    {1, 2, 3},
    (1, 2),
    "abc",
    42,
]
for item in items:
    types = []
    if isinstance(item, Sequence):
        types.append("Sequence")
    if isinstance(item, Mapping):
        types.append("Mapping")
    if isinstance(item, Set):
        types.append("Set")
    if isinstance(item, Iterable):
        types.append("Iterable")
    print(f"  {item!r}: {', '.join(types) or '无'}")
`,
  },

  // =========================================================
  // 第十九章：dataclass：自动生成样板代码
  // =========================================================
  {
    id: "po-19",
    group: "进阶特性",
    icon: "📦",
    title: "dataclass：自动生成样板代码",
    content: `## 一、什么是 dataclass？

\`@dataclass\` 自动生成 \`__init__\`、\`__repr__\`、\`__eq__\`。

\`\`\`python
from dataclasses import dataclass

@dataclass
class User:
    name: str
    age: int
\`\`\`

等效于手写：

\`\`\`python
class User:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    def __repr__(self):
        return f"User(name={self.name!r}, age={self.age})"
    def __eq__(self, other):
        return self.name == other.name and self.age == other.age
\`\`\`

## 二、基本用法

\`\`\`python
@dataclass
class Point:
    x: int
    y: int

p = Point(1, 2)
print(p)  # Point(x=1, y=2)
\`\`\`

## 三、默认值

\`\`\`python
@dataclass
class User:
    name: str
    age: int = 18
    role: str = "user"
\`\`\`

## 四、field() 高级配置

\`\`\`python
from dataclasses import field

@dataclass
class Cart:
    items: list = field(default_factory=list)
\`\`\`

## 五、frozen=True（不可变）

\`\`\`python
@dataclass(frozen=True)
class Point:
    x: int
    y: int
\`\`\`

不可修改，类似 NamedTuple。

## 六、order=True

自动生成 \`__lt__\`、\`__le__\`、\`__gt__\`、\`__ge__\`：

\`\`\`python
@dataclass(order=True)
class Point:
    x: int
    y: int
\`\`\`

## 七、post_init

\`__post_init__\` 在 \`__init__\` 之后调用：

\`\`\`python
@dataclass
class User:
    name: str
    age: int

    def __post_init__(self):
        if self.age < 0:
            raise ValueError("年龄不能为负")
\`\`\`

## 八、dataclass vs NamedTuple

| 维度 | dataclass | NamedTuple |
|------|-----------|------------|
| 可变 | 默认是 | 否 |
| 继承 | 支持 | 限制 |
| typing | 支持 | 支持 |

## 九、什么时候用？

- 简单数据类：dataclass
- 不可变数据：NamedTuple 或 frozen=True
- 复杂业务逻辑：普通类

## 十、本章 demo

演示 dataclass 的各种用法。
`,
    code: `"""
第十九章 demo：dataclass
演示：
  1. 基本 dataclass
  2. 默认值和 field
  3. frozen 不可变
  4. order 比较
  5. post_init 验证
  6. 继承 dataclass
  7. 实战：配置类
"""
from dataclasses import dataclass, field, asdict, astuple


# ===== 1. 基本 dataclass =====
@dataclass
class Point:
    x: int
    y: int


print("=== 1. 基本 dataclass ===")
p = Point(1, 2)
print(f"  p = {p}（自动 __repr__）")
print(f"  p.x = {p.x}, p.y = {p.y}")
print(f"  p == Point(1, 2): {p == Point(1, 2)}（自动 __eq__）")
print()


# ===== 2. 默认值 =====
@dataclass
class User:
    name: str
    age: int = 18
    role: str = "user"


print("=== 2. 默认值 ===")
u1 = User("Alice")
u2 = User("Bob", 30)
u3 = User("Carol", 25, "admin")
print(f"  u1 = {u1}")
print(f"  u2 = {u2}")
print(f"  u3 = {u3}")
print()


# ===== 3. field 处理可变默认值 =====
@dataclass
class Cart:
    user: str
    items: list = field(default_factory=list)


print("=== 3. field 处理可变默认值 ===")
c1 = Cart("Alice")
c2 = Cart("Bob")
c1.items.append("iPhone")
print(f"  c1.items = {c1.items}")
print(f"  c2.items = {c2.items}（独立）")
print()


# ===== 4. frozen 不可变 =====
@dataclass(frozen=True)
class ImmutablePoint:
    x: int
    y: int


print("=== 4. frozen 不可变 ===")
ip = ImmutablePoint(3, 4)
print(f"  ip = {ip}")
try:
    ip.x = 10
except Exception as e:
    print(f"  修改报错: {type(e).__name__}: {e}")
print()


# ===== 5. order 自动比较 =====
@dataclass(order=True)
class Student:
    score: int
    name: str


print("=== 5. order 自动比较 ===")
s1 = Student(90, "Alice")
s2 = Student(80, "Bob")
print(f"  s1 < s2: {s1 < s2}（按 score 比较）")
print(f"  最小: {min(s1, s2)}")
print(f"  最大: {max(s1, s2)}")
print()


# ===== 6. post_init 验证 =====
@dataclass
class Account:
    owner: str
    balance: float

    def __post_init__(self):
        """__init__ 之后自动调用"""
        if self.balance < 0:
            raise ValueError("余额不能为负")
        if not self.owner:
            raise ValueError("户主不能为空")


print("=== 6. post_init 验证 ===")
try:
    a = Account("Alice", 100)
    print(f"  {a}")
    b = Account("Bob", -50)
except ValueError as e:
    print(f"  报错: {e}")
print()


# ===== 7. 继承 dataclass =====
@dataclass
class Animal:
    name: str
    age: int


@dataclass
class Dog(Animal):
    breed: str = "未知"


print("=== 7. 继承 dataclass ===")
d = Dog("旺财", 3, "金毛")
print(f"  d = {d}")
print()


# ===== 8. asdict 和 astuple =====
@dataclass
class Person:
    name: str
    age: int


print("=== 8. asdict 和 astuple ===")
p = Person("Alice", 30)
print(f"  asdict(p) = {asdict(p)}")
print(f"  astuple(p) = {astuple(p)}")
print()


# ===== 9. 实战：配置类 =====
@dataclass(frozen=True)
class Config:
    host: str = "localhost"
    port: int = 8080
    debug: bool = False
    allowed_origins: list = field(default_factory=lambda: ["*"])


print("=== 9. 实战：配置类 ===")
cfg = Config()
print(f"  {cfg}")
cfg2 = Config(host="0.0.0.0", port=80, debug=True)
print(f"  {cfg2}")
print(f"  cfg == Config(): {cfg == Config()}")
`,
  },
];
