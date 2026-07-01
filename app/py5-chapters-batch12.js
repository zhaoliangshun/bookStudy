export const chapters = [
  {
    id: "py5-decorator",
    group: "装饰器与元编程",
    icon: "🎀",
    title: "装饰器基础",
    content: `
## 概述
装饰器是 Python 中接收函数（或类）作为参数并返回新对象的高阶函数，配合 \`@\` 语法糖可在不修改原函数源码的前提下为其叠加日志、缓存、重试、计时等横切关注点。

## 核心要点
- **语法糖等价**: \`@decorator\` 等同于 \`func = decorator(func)\` - 装饰器本质是高阶函数调用
- **functools.wraps**: 通过 \`@functools.wraps(func)\` 复制 \`__name__\`/\`__doc__\`/\`__module__\`/\`__wrapped__\` 等元信息
- **可调用对象装饰器**: 任何实现 \`__call__\` 的对象都可作为装饰器，便于带状态（如调用计数）
- **堆叠顺序**: 多装饰器从下往上应用，靠近 \`def\` 的先执行；等价于 \`timer(log_calls(slow_add))\`
- **带参数装饰器**: 三层嵌套 - 参数层 → 装饰器层 → 包装层，先调用 \`retry(attempts=3)\` 返回真正的装饰器
- **参数透传**: \`wrapper(*args, **kwargs)\` 接收任意参数并转发给原函数，保留返回值
- **保留返回值**: wrapper 必须显式 \`return result\`，否则原函数返回值会被吞掉
- **标准库装饰器**: \`@functools.lru_cache\` 缓存、\`@functools.singledispatch\` 单分派、\`@contextlib.contextmanager\`

## 原理与机制
- **执行时机**: 装饰器在 \`def\` 语句执行时立即应用，即模块导入时就把函数对象替换为 wrapper
- **闭包捕获**: wrapper 闭包持有 \`func\` 自由变量，即使原函数名已退出作用域仍可访问
- **wraps 实现**: \`functools.update_wrapper\` 内部循环更新 \`WRAPPER_ASSIGNMENTS\`（\`__module__\`/\`__name__\`/\`__qualname__\`/\`__doc__\` 等）
- **__wrapped__ 属性**: wraps 会设置 \`wrapper.__wrapped__ = func\`，便于 \`inspect.signature\` 还原真实签名
- **带参装饰器闭包链**: 外层参数被中间层闭包捕获，最内层 wrapper 才是真正被调用的函数

## 易错点与陷阱
- **忘记 wraps**: 不加 \`@functools.wraps\` 会导致 \`__name__\` 变成 \`wrapper\`、\`help()\` 显示错误文档、调试栈失真
- **吞返回值**: wrapper 中只调用 \`func(...)\` 而不 \`return\`，导致被装饰函数返回 \`None\`
- **异常被吞**: 用 try/except 包裹却不 re-raise 会掩盖真实错误；retry 应保留 \`last_exc\` 在最后重新抛出
- **参数签名失真**: 不加 wraps 时 \`inspect.signature\` 看到的是 \`(*args, **kwargs)\` 而非真实签名
- **类装饰器混淆**: 类装饰器修改的是类对象不是实例；返回的可能是函数（如 singleton）导致 \`isinstance\` 异常

## 实战建议
- **始终用 wraps**: 任何函数装饰器都应加 \`@functools.wraps(func)\`，保留元信息便于调试和反射
- **优先标准库**: 缓存用 \`@functools.lru_cache\` 或 3.9+ 的 \`@functools.cache\`，比手写更健壮且线程安全
- **保留签名信息**: 若 wrapper 真正改变参数语义，可配合 \`inspect\` 重新生成签名以保持 API 一致
    `.trim(),
    code: `
import functools
import time

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        t0 = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - t0
        print(f"  [timer] {func.__name__}() 耗时 {elapsed*1000:.3f}ms")
        return result
    return wrapper

def log_calls(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"  [log] 调用 {func.__name__}{args}")
        result = func(*args, **kwargs)
        print(f"  [log] 返回 {result}")
        return result
    return wrapper

def retry(attempts=3, delay=0):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_exc = None
            for i in range(attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exc = e
                    print(f"  [retry] 第{i+1}次失败: {e}")
            raise last_exc
        return wrapper
    return decorator

@timer
@log_calls
def slow_add(a, b):
    time.sleep(0.01)
    return a + b

print("=== 堆叠装饰器 ===")
print(f"  结果: {slow_add(3, 4)}")
print(f"  函数名保留: {slow_add.__name__}")

print("\\n=== 带参数的装饰器 ===")
call_count = 0
@retry(attempts=3, delay=0)
def flaky_function():
    global call_count
    call_count += 1
    if call_count < 3:
        raise ValueError("暂时失败")
    return "成功!"

call_count = 0
result = flaky_function()
print(f"  最终结果: {result}")
    `.trim()
  },
  {
    id: "py5-decorator-class",
    group: "装饰器与元编程",
    icon: "🏷️",
    title: "类装饰器",
    content: `
## 概述
类装饰器接收类对象作为参数，可在类定义完成后立即修改类（增删方法、改属性）或返回新类，是实现单例、自动注册、自动生成特殊方法等横切逻辑的轻量级手段，比元类更直观。

## 核心要点
- **语法等价**: \`@deco class Foo: ...\` 等同于 \`class Foo: ...\` 然后 \`Foo = deco(Foo)\`
- **auto_repr**: 遍历 \`self.__dict__\` 拼接 \`k=v!r\` 字符串，赋值给 \`cls.__repr__\` 后返回类
- **singleton 模式**: 用闭包 \`instances\` 字典缓存每个类的唯一实例，返回工厂函数而非类
- **register 工厂**: 带参数类装饰器，将类按自定义 key 存入全局 registry，便于按字符串名实例化
- **执行时机**: 装饰器在类体执行完毕、命名空间生成类对象之后立即执行
- **可与函数装饰器组合**: 类装饰器装饰类、方法装饰器装饰方法，互不冲突
- **替代场景**: 简单的 \`__init__\` 注入用 \`@dataclass\`（3.7+）更优雅；类装饰器适合更灵活的逻辑

## 原理与机制
- **类对象可变**: 装饰器可直接给 \`cls\` 添加属性 \`cls.__repr__ = ...\`，所有实例共享该方法
- **闭包持有原类**: \`instances[cls] = cls(*args, **kwargs)\` 中 cls 被闭包捕获，无需全局变量
- **返回值替换**: 装饰器返回值会绑定到类名，所以 singleton 返回的是函数而非类 - 这会改变 \`isinstance\` 行为
- **类装饰器 vs 元类**: 类装饰器作用于"类创建之后"，元类控制"类创建过程"；装饰器更简单但无法影响类体内部

## 易错点与陷阱
- **singleton 破坏 isinstance**: \`singleton\` 返回函数后，\`isinstance(cfg, AppConfig)\` 会失败，需用 \`__class__\` 或额外协议
- **继承失效**: 通过类装饰器返回函数的 singleton，子类继承会异常；如需继承要保留类对象
- **register 重复键**: 同名注册会静默覆盖，建议加 \`if key in registry: raise\` 显式声明
- **auto_repr 时机**: 仅装饰时生成一次 \`__repr__\` 方法，但运行时新增实例属性仍能体现（因为是动态遍历 \`__dict__\`）

## 实战建议
- **优先 @dataclass**: 3.7+ 的 \`@dataclass\` 可自动生成 repr/eq/hash，比手写 auto_repr 更标准；3.10+ 还可加 \`@dataclass(slots=True)\`
- **singleton 谨慎使用**: 单例难测试、隐藏全局状态，建议改用模块级对象或依赖注入
- **注册模式标准化**: 大型项目用 \`pkgutil.EntryPoint\` 或第三方 registry 库，避免手写字典管理
    `.trim(),
    code: `
def auto_repr(cls):
    def __repr__(self):
        attrs = ", ".join(f"{k}={v!r}" for k, v in self.__dict__.items())
        return f"{cls.__name__}({attrs})"
    cls.__repr__ = __repr__
    return cls

def singleton(cls):
    instances = {}
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    return get_instance

registry = {}
def register(name=None):
    def decorator(cls):
        key = name or cls.__name__
        registry[key] = cls
        return cls
    return decorator

print("=== auto_repr: 自动生成 __repr__ ===")
@auto_repr
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(3, 4)
print(f"  {p}")

@auto_repr
class User:
    def __init__(self, name, age):
        self.name = name
        self.age = age

print(f"  {User('Alice', 25)}")

print("\\n=== singleton: 单例模式 ===")
@singleton
class AppConfig:
    def __init__(self):
        self.settings = {"debug": True, "version": "1.0"}
    def set(self, key, val):
        self.settings[key] = val

cfg1 = AppConfig()
cfg2 = AppConfig()
cfg1.set("debug", False)
print(f"  cfg1 is cfg2: {cfg1 is cfg2}")
print(f"  cfg2.settings['debug']: {cfg2.settings['debug']}")

print("\\n=== register: 注册模式 ===")
@register("shape_circle")
class Circle:
    def draw(self): return "画圆形"

@register("shape_square")
class Square:
    def draw(self): return "画方形"

print(f"  注册表: {list(registry.keys())}")
for name, cls in registry.items():
    print(f"  {name}: {cls().draw()}")
    `.trim()
  },
  {
    id: "py5-descriptor",
    group: "装饰器与元编程",
    icon: "📏",
    title: "描述符协议",
    content: `
## 概述
描述符是实现了 \`__get__\`/\`__set__\`/\`__delete__\` 中任一方法的类，作为类属性时会被 Python 解释器拦截访问，是 \`property\`/\`classmethod\`/\`staticmethod\`/字段验证等机制的底层基础。

## 核心要点
- **协议方法**: \`__get__(self, obj, objtype=None)\`/\`__set__(self, obj, value)\`/\`__delete__(self, obj)\`
- **数据描述符**: 同时实现 \`__get__\` 和 \`__set__\`/\`__delete__\`，优先级高于实例 \`__dict__\`
- **非数据描述符**: 只实现 \`__get__\`（如普通方法、classmethod），实例 \`__dict__\` 可覆盖
- **访问拦截**: 类属性为描述符时，\`obj.attr\` 会调用 \`Descriptor.__get__(self, obj, type(obj))\`
- **property 即描述符**: \`property\` 是用 C 实现的数据描述符，封装 fget/fset/fdel
- **类访问 vs 实例访问**: \`obj is None\` 表示通过类访问（如 \`Person.age\`），返回描述符自身
- **存储位置**: 真实值通常存到 \`obj.__dict__[self.name]\`，避免无限递归
- **LazyProperty**: 首次 \`__get__\` 计算后写回 \`obj.__dict__\`，后续命中实例字典（非数据描述符特性）

## 原理与机制
- **属性查找顺序**: 数据描述符 → 实例 \`__dict__\` → 非数据描述符 → 类 \`__dict__\` → \`__getattr__\`
- **避免递归**: \`__set__\` 中若写 \`setattr(obj, self.name, value)\` 会再次触发 \`__set__\` 形成死循环，必须直接写 \`obj.__dict__\`
- **LazyProperty 缓存原理**: 非数据描述符优先级低于实例字典，所以 \`obj.__dict__[name] = value\` 后下次访问直接命中
- **name 绑定**: 描述符在类体中作为类属性创建，需借助 \`__set_name__\`（3.6+）或显式传入字段名
- **property 的 setter 装饰器**: \`@prop.setter\` 返回新的 property 对象（替换原 fset），形成链式 API

## 易错点与陷阱
- **__set__ 中递归**: \`self.name = value\` 会无限递归 \`__set__\`，必须用 \`obj.__dict__[self.name] = value\`
- **name 冲突**: 多个类共享同一描述符实例时 \`self.name\` 必须区分；推荐用 \`__set_name__\` 自动获取
- **类级共享状态**: 描述符实例是类属性，所有实例共享同一描述符对象，状态必须存在 \`obj.__dict__\` 而非 \`self.__dict__\`
- **只读 property 误用**: 仅定义 fget 的 \`@property\` 仍可通过 \`obj.__dict__\` 绕过；要真正只读需用数据描述符或 \`__slots__\`
- **__get__ 返回 self**: 类访问时若返回值类型不当（如返回 None）会破坏 \`inspect\` 和 IDE 提示

## 实战建议
- **优先用 @property**: 简单的 getter/setter 用 \`@property\` + \`@x.setter\` 即可，3.8+ 还可用 \`@functools.cached_property\` 做缓存
- **复用描述符**: 多字段类型验证（如 \`TypedAttribute("name", str)\`）应抽成描述符类，避免每字段写一遍 property
- **__set_name__ 自动命名**: 3.6+ 的 \`__set_name__(self, owner, name)\` 钩子可在类创建时自动获取属性名，省去手动传 name
    `.trim(),
    code: `
class TypedAttribute:
    def __init__(self, name, expected_type):
        self.name = name
        self.expected_type = expected_type
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        if not isinstance(value, self.expected_type):
            raise TypeError(
                f"{self.name} 必须是 {self.expected_type.__name__}, "
                f"实际是 {type(value).__name__}"
            )
        obj.__dict__[self.name] = value
    def __delete__(self, obj):
        obj.__dict__.pop(self.name, None)

class LazyProperty:
    def __init__(self, func):
        self.func = func
        self.name = func.__name__
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        value = self.func(obj)
        obj.__dict__[self.name] = value
        return value

class Person:
    name = TypedAttribute("name", str)
    age = TypedAttribute("age", int)
    def __init__(self, name, age):
        self.name = name
        self.age = age
    @LazyProperty
    def bio(self):
        print("  [计算 bio...]")
        return f"{self.name}, {self.age}岁"

print("=== TypedAttribute 类型验证 ===")
p = Person("Alice", 25)
print(f"  name: {p.name}, age: {p.age}")
try:
    p.age = "25"
except TypeError as e:
    print(f"  类型错误: {e}")
p.age = 30
print(f"  修改后: name={p.name}, age={p.age}")

print("\\n=== LazyProperty 惰性计算 ===")
print(f"  首次访问 bio: {p.bio}")
print(f"  再次访问 bio（缓存）: {p.bio}")

print("\\n=== 模拟 property 实现 ===")
class MyProperty:
    def __init__(self, fget=None, fset=None):
        self.fget = fget
        self.fset = fset
    def __get__(self, obj, objtype=None):
        if obj is None: return self
        return self.fget(obj)
    def __set__(self, obj, value):
        if self.fset is None: raise AttributeError("只读")
        self.fset(obj, value)
    def setter(self, fset):
        self.fset = fset
        return self

class Circle:
    def __init__(self, radius):
        self._radius = radius
    @MyProperty
    def radius(self):
        return self._radius
    @radius.setter
    def radius(self, val):
        if val < 0: raise ValueError("半径不能为负")
        self._radius = val
    @MyProperty
    def area(self):
        import math
        return math.pi * self._radius ** 2

c = Circle(5)
print(f"  半径: {c.radius}, 面积: {c.area:.2f}")
c.radius = 10
print(f"  修改后 面积: {c.area:.2f}")
    `.trim()
  },
  {
    id: "py5-metaclass",
    group: "装饰器与元编程",
    icon: "🧬",
    title: "元类与 __init_subclass__",
    content: `
## 概述
元类是"创建类的类"，默认为 \`type\`，可在类对象生成时介入修改其行为；\`__init_subclass__\`（3.6+）是更轻量的替代方案，定义在基类中即可在子类创建时被调用，常用于 ORM 字段收集、插件注册等场景。

## 核心要点
- **type 三参数**: \`type(name, bases, namespace)\` 动态创建类，等价于 \`class\` 语句的运行时形式
- **元类定义**: \`class Meta(type):\` 继承 type，重写 \`__new__\` 或 \`__init__\` 控制类创建
- **__new__ vs __init__**: \`__new__(mcs, name, bases, ns)\` 创建并返回类对象；\`__init__(cls, name, bases, ns)\` 在已创建的类上做初始化
- **__init_subclass__**: 定义在基类中，子类创建时自动调用 \`cls.__init_subclass__(**kwargs)\`，无需元类
- **应用场景**: ORM 字段收集（如示例的 \`_fields\`）、插件注册、接口校验、属性约束
- **元类指定**: \`class Foo(metaclass=Meta):\` 显式声明；子类默认继承父类的元类
- **metaclass conflict**: 多继承时父类有不同元类会报 \`TypeError\`，需定义共同子元类

## 原理与机制
- **类即对象**: Python 中类也是对象（type 的实例），\`type\` 本身就是自己的元类（\`type(type) is type\`）
- **创建流程**: \`class\` 语句 → 准备命名空间 → 执行类体 → 调用 \`metaclass(name, bases, ns)\` 生成类对象
- **__init_subclass__ 触发**: 子类创建后、绑定到父类前，Python 自动调用 \`super().__init_subclass__(**kwargs)\`
- **类属性扫描**: __init_subclass__ 通过 \`cls.__dict__.items()\` 遍历类属性识别 Field 实例（注意用 \`list()\` 防止迭代时修改）
- **元类 __prepare__**: 可重写返回自定义命名空间（如 \`OrderedDict\` 或支持顺序感知的 dict），3.7+ 类属性默认保序

## 易错点与陷阱
- **基类被注册**: 用 \`if bases:\` 排除 \`Plugin\` 基类自身，否则基类也会被注册到 registry
- **__init_subclass__ 参数**: 子类声明 \`class Foo(Base, x=1):\` 中的 \`x=1\` 会被传给 \`__init_subclass__\`，未处理会报 \`TypeError\`，需用 \`**kwargs\` 转发
- **元类继承冲突**: 多继承两个有不同元类的类会报错；解决方案是定义一个继承两者的新元类
- **__new__ 顺序**: 元类 \`__new__\` 必须调用 \`super().__new__(mcs, name, bases, ns)\` 才能正常创建类
- **属性收集时机**: \`Field\` 实例作为类属性在类体执行时就已存在，但要在 \`__init_subclass__\` 或元类中扫描才能集中管理

## 实战建议
- **优先 __init_subclass__**: 简单的子类钩子（字段收集、注册）用 \`__init_subclass__\`，比元类简单且不引入复杂继承
- **元类慎用**: 元类会显著增加代码复杂度，仅在框架级需求（ORM、ABC 强制接口、自动 API 生成）才使用
- **@dataclass 替代**: 简单字段管理可用 \`@dataclass\`（3.7+）配合 \`field()\`，避免自定义元类
    `.trim(),
    code: `
print("=== type 动态创建类 ===")
def describe(self):
    return f"动物(name={self.name!r})"
Animal = type("Animal", (), {
    "__init__": lambda self, name: setattr(self, "name", name),
    "describe": describe,
    "species": "未知",
})
dog = Animal("旺财")
print(f"  {dog.describe()}, species={dog.species}")
Dog = type("Dog", (Animal,), {"species": "犬科"})
print(f"  Dog.species = {Dog.species}")

print("\\n=== __init_subclass__: 简单 ORM 示例 ===")
class Field:
    def __init__(self, field_type, primary_key=False):
        self.field_type = field_type
        self.primary_key = primary_key

class ModelBase:
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        cls._fields = {}
        cls._table_name = cls.__name__.lower()
        for name, attr in list(cls.__dict__.items()):
            if isinstance(attr, Field):
                cls._fields[name] = attr
                if attr.primary_key:
                    cls._pk = name

    def __init__(self, **kwargs):
        for key, val in kwargs.items():
            setattr(self, key, val)

    def save(self):
        fields = []
        values = []
        for name, field in self._fields.items():
            val = getattr(self, name, None)
            fields.append(name)
            if field.field_type is str:
                values.append(repr(str(val)))
            else:
                values.append(str(val))
        sql = f"INSERT INTO {self._table_name} ({', '.join(fields)}) VALUES ({', '.join(values)})"
        print(f"  SQL: {sql}")

class User(ModelBase):
    id = Field(int, primary_key=True)
    name = Field(str)
    age = Field(int)

class Product(ModelBase):
    sku = Field(str, primary_key=True)
    title = Field(str)
    price = Field(float)

print(f"  User 表: {User._table_name}, 字段: {list(User._fields.keys())}, 主键: {User._pk}")
print(f"  Product 表: {Product._table_name}, 字段: {list(Product._fields.keys())}, 主键: {Product._pk}")

u = User(id=1, name="Alice", age=25)
u.save()

p = Product(sku="A001", title="键盘", price=299.99)
p.save()

print("\\n=== 元类: 自动注册 ===")
class PluginMeta(type):
    registry = {}
    def __new__(mcs, name, bases, ns):
        cls = super().__new__(mcs, name, bases, ns)
        if bases:
            mcs.registry[name] = cls
        return cls

class Plugin(metaclass=PluginMeta):
    pass

class AudioPlugin(Plugin):
    def run(self): return "音频处理"

class VideoPlugin(Plugin):
    def run(self): return "视频处理"

print(f"  已注册插件: {list(PluginMeta.registry.keys())}")
for name, cls in PluginMeta.registry.items():
    print(f"  {name}: {cls().run()}")
    `.trim()
  }
];
