// =============================================================
// Batch 12：装饰器（4 章）
// 45. py4-decorator    基础装饰器、functools.wraps
// 46. py4-decorator-args  参数化装饰器
// 47. py4-decorator-class  类装饰器
// 48. py4-decorator-builtin  内置装饰器：@staticmethod/@classmethod/@property/@lru_cache
// =============================================================

export const chapters = [
  {
    id: "py4-decorator",
    group: "装饰器",
    icon: "🎁",
    title: "装饰器基础：@decorator、wraps",
    content: `
- 本质：\`@decorator\` 等价于 \`fn = decorator(fn)\`
- 装饰器是一个接收函数、返回函数的可调用对象
- 用 \`functools.wraps(fn)\` 保留原函数 \`__name__\` / \`__doc__\`
- 多个装饰器：自下而上应用
`,
    code: `import functools, time

# 基础装饰器
def my_logger(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        print(f"[call] {fn.__name__}{args}")
        result = fn(*args, **kwargs)
        print(f"[ret ] {fn.__name__} -> {result}")
        return result
    return wrapper

@my_logger
def add(a, b):
    """add a and b"""
    return a + b

add(3, 5)
print("name:", add.__name__, "doc:", add.__doc__)

# 计时装饰器
def timer(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        t0 = time.perf_counter()
        result = fn(*args, **kwargs)
        print(f"[{fn.__name__}] cost {time.perf_counter() - t0:.6f}s")
        return result
    return wrapper

@timer
def slow():
    time.sleep(0.05)

slow()

# 多个装饰器叠加
@timer
@my_logger
def multiply(a, b):
    return a * b

multiply(4, 5)  # 先 my_logger，再 timer
`,
  },
  {
    id: "py4-decorator-args",
    group: "装饰器",
    icon: "🎀",
    title: "参数化装饰器",
    content: `
- 需要三层嵌套：外层接收参数、中层接收函数、内层 wrapper
- 即 \`@decorator(args)\` → decorator(args) 返回装饰器函数
- 适用：重复执行、重试、权限校验
`,
    code: `import functools, time

# 参数化：重复执行
def repeat(times):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = fn(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def greet(name):
    print(f"hi, {name}")

greet("alice")

# 参数化：重试（带退避）
def retry(max_attempts=3, delay=0.1):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            for attempt in range(1, max_attempts + 1):
                try:
                    return fn(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts:
                        raise
                    print(f"retry {attempt}/{max_attempts}: {e}")
                    time.sleep(delay * attempt)
            return None
        return wrapper
    return decorator

import random

@retry(max_attempts=3, delay=0.05)
def unstable():
    if random.random() < 0.7:
        raise ValueError("bad luck")
    return "ok"

for i in range(5):
    try:
        print(f"attempt {i}:", unstable())
    except ValueError:
        print(f"attempt {i}: failed finally")
`,
  },
  {
    id: "py4-decorator-class",
    group: "装饰器",
    icon: "🏛️",
    title: "类装饰器",
    content: `
- 类装饰器：装饰类而非函数
- 可修改类属性、添加方法、包装 \`__init__\`
- 常见：注册器、单例、自动属性
- 实现：\`__call__\` 方法接收并返回类
`,
    code: `import functools

# 1) 类装饰器：自动添加 __repr__
def auto_repr(cls):
    """自动为类添加 __repr__ 方法"""
    def __repr__(self):
        attrs = ", ".join(f"{k}={v!r}" for k, v in self.__dict__.items())
        return f"{cls.__name__}({attrs})"
    cls.__repr__ = __repr__
    return cls

@auto_repr
class Point:
    def __init__(self, x, y):
        self.x, self.y = x

p = Point(1, 2)
print(p)  # Point(x=1, y=2)

# 2) 注册器模式
class PluginRegistry:
    plugins = {}
    
    @classmethod
    def register(cls, name):
        def decorator(plugin_cls):
            cls.plugins[name] = plugin_cls
            return plugin_cls
        return decorator

@PluginRegistry.register("json")
class JSONRenderer:
    def render(self, data):
        import json
        return json.dumps(data)

@PluginRegistry.register("csv")
class CSVRenderer:
    def render(self, data):
        return ",".join(map(str, data))

print("plugins:", list(PluginRegistry.plugins.keys()))
for name, cls in PluginRegistry.plugins.items():
    print(f"  {name}: {cls().render([1, 2, 3])}")

# 3) 单例装饰器
def singleton(cls):
    instances = {}
    @functools.wraps(cls)
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    return get_instance

@singleton
class Config:
    def __init__(self):
        self.debug = True

c1 = Config()
c2 = Config()
print("same instance:", c1 is c2)
`,
  },
  {
    id: "py4-decorator-builtin",
    group: "装饰器",
    icon: "🏗️",
    title: "内置装饰器：@staticmethod/@classmethod/@property",
    content: `
- \`@staticmethod\`：无隐含参数，相当于普通函数放在类里
- \`@classmethod\`：第一个参数是类本身（cls），可访问类属性
- \`@property\`：方法当属性用（getter/setter/deleter）
- \`@functools.lru_cache\`：缓存
- \`@functools.singledispatch\`：函数重载
- \`@dataclass\`：自动生成通用方法
`,
    code: `from dataclasses import dataclass
import functools

class Demo:
    class_var = "shared"

    def __init__(self, x):
        self.x = x

    # 实例方法
    def instance_method(self):
        return f"instance: x={self.x}"

    # 静态方法：无 self/cls
    @staticmethod
    def static_method(a, b):
        return a + b

    # 类方法：第一个参数是类
    @classmethod
    def class_method(cls):
        return f"class: var={cls.class_var}"

    # alternative constructor
    @classmethod
    def from_string(cls, s):
        return cls(int(s))

    # property
    @property
    def double(self):
        return self.x * 2

d = Demo(10)
print(d.instance_method())
print(Demo.static_method(1, 2))
print(Demo.class_method())
print(Demo.from_string("42").x)
print("double:", d.double)

# @dataclass 也是装饰器
@dataclass
class Point:
    x: float
    y: float

p = Point(1, 2)
print("dataclass:", p)

# lru_cache
@functools.lru_cache(maxsize=128)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print("fib(10):", fib(10))
print("cache info:", fib.cache_info())
`,
  },
];