export const chapters = [
  {
    id: "py5-decorator",
    group: "装饰器与元编程",
    icon: "🎀",
    title: "装饰器基础",
    content: `
- **装饰器**：接收函数作为参数并返回新函数的高阶函数
- **@语法糖**：@decorator 等同于 func = decorator(func)
- **@functools.wraps**：复制原函数的 \`__name__\`/\`__doc__\` 等元信息
- **装饰器堆叠**：从下往上应用（靠近 def 的先执行）
- **带参数装饰器**：3层嵌套 - 参数层 → 装饰器层 → 包装层
- 装饰器可用于日志、缓存、权限校验、计时等横切关注点
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

print("\n=== 带参数的装饰器 ===")
call_count = 0
@retry(attempts=2, delay=0)
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
- **类装饰器**：接收类作为参数，返回新类或修改原类
- 可用于自动添加特殊方法（__repr__, __eq__ 等）
- **单例模式**：确保类只有一个实例
- **注册模式**：自动将类注册到工厂/注册表中
- 类装饰器在类定义完成后立即执行
- 比元编程更简单直观，适合大多数场景
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

print("\n=== singleton: 单例模式 ===")
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

print("\n=== register: 注册模式 ===")
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
- **描述符**：实现 \`__get__\`/\`__set__\`/\`__delete__\` 的类
- **数据描述符**：同时有 __get__ 和 __set__（优先级高于实例 __dict__）
- **非数据描述符**：只有 __get__（如方法，实例 __dict__ 可覆盖）
- **property**：基于描述符实现
- 描述符是 Python 属性访问的底层机制
- 适用场景：类型验证、惰性计算、托管属性
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

print("\n=== LazyProperty 惰性计算 ===")
print(f"  首次访问 bio: {p.bio}")
print(f"  再次访问 bio（缓存）: {p.bio}")

print("\n=== 模拟 property 实现 ===")
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
        return 3.14159 * self._radius ** 2

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
- **元类**：创建类的"类"，默认是 type
- **type(name, bases, namespace)**：动态创建类
- **__init_subclass__**（3.6+）：定义在基类中，子类创建时自动调用
- __init_subclass__ 比元类更简单，推荐优先使用
- 元类适用：API 框架、ORM、插件系统等需要控制类创建的场景
- 元类方法：__new__ 创建类对象，__init__ 初始化类
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

print("\n=== __init_subclass__: 简单 ORM 示例 ===")
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
            values.append(f"'{val}'" if field.field_type is str else str(val))
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

print("\n=== 元类: 自动注册 ===")
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
