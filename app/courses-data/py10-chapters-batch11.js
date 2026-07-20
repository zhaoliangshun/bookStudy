// =============================================================
// Python 从入门到精通大全（终极版）—— 第11批章节
// 第十一部分 装饰器与迭代器（共 5 章）
// =============================================================

const chapters = [
  // ============================================================
  // 第五十一章 装饰器进阶
  // ============================================================
  {
    id: 'py10-ch51',
    group: '第十一部分 装饰器与迭代器',
    icon: '🎁',
    title: '第五十一章 装饰器进阶',
    content: `## 第五十一章 装饰器进阶

装饰器是 Python 函数式编程的核心特性——**用一个函数包装另一个函数**，在不修改原函数的前提下增强其行为。这一章把装饰器的高级用法讲透：带参数的装饰器、类装饰器、装饰器叠加、\`functools.wraps\` 的重要性。

### 一、装饰器回顾

最简单的装饰器：接收函数，返回新函数：

\`\`\`python
# 装饰器本质：接收函数 f，返回新函数 wrapper
def my_decorator(func):
    def wrapper(*args, **kwargs):
        print(f"调用 {func.__name__}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} 返回 {result!r}")
        return result
    return wrapper

# @ 语法糖：等价于 say_hello = my_decorator(say_hello)
@my_decorator
def say_hello(name):
    return f"Hello, {name}!"

# 调用其实是调用了 wrapper
print(say_hello("张三"))
\`\`\`

### 二、functools.wraps 的重要性

不用 \`wraps\` 会丢失原函数的元信息：

\`\`\`python
from functools import wraps

# ❌ 不用 wraps：原函数信息丢失
def bad_decorator(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@bad_decorator
def func1():
    """这是 func1 的文档。"""
    return "result"

print(f"名字: {func1.__name__}")  # wrapper（不是 func1！）
print(f"文档: {func1.__doc__}")   # None（丢失了！）

# ✅ 用 wraps：保留原函数信息
def good_decorator(func):
    @wraps(func)  # 把原函数的 __name__, __doc__ 等复制到 wrapper
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@good_decorator
def func2():
    """这是 func2 的文档。"""
    return "result"

print(f"\\n名字: {func2.__name__}")  # func2（正确）
print(f"文档: {func2.__doc__}")     # 保留下来了
\`\`\`

**永远在装饰器里加 \`@wraps(func)\`**——否则调试、文档生成、序列化都会出问题。

### 三、带参数的装饰器

参数化装饰器需要**三层嵌套**：

\`\`\`python
from functools import wraps

# 带参数的装饰器：外层接收参数，返回真正的装饰器
def repeat(times):
    """让函数重复执行 times 次。"""
    # 这一层是真正的装饰器
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            result = None
            for i in range(times):
                # 每次都调用原函数
                result = func(*args, **kwargs)
                print(f"  第 {i+1}/{times} 次执行完成")
            return result  # 返回最后一次的结果
        return wrapper
    return decorator

# @repeat(3) 等价于 repeat(3)(greet) → decorator(greet) → wrapper
@repeat(3)
def greet(name):
    """打招呼。"""
    print(f"  Hello, {name}!")
    return "done"

greet("张三")
\`\`\`

理解关键：\`@repeat(3)\` 先执行 \`repeat(3)\` 拿到 \`decorator\`，再用 \`decorator\` 装饰 \`greet\`。

### 四、参数化装饰器：超时控制

\`\`\`python
import time
from functools import wraps

def timeout(seconds):
    """超时装饰器：超过指定时间抛 TimeoutError（简化版）。"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start = time.time()
            result = func(*args, **kwargs)
            elapsed = time.time() - start
            if elapsed > seconds:
                # 注意：这里只是检查，真正的超时需要线程或信号
                print(f"警告：{func.__name__} 耗时 {elapsed:.2f}s > {seconds}s")
            return result
        return wrapper
    return decorator

@timeout(1.0)
def slow_function():
    """模拟慢函数。"""
    time.sleep(0.5)  # 0.5 秒，未超时
    return "完成"

@timeout(0.1)
def too_slow():
    """超时函数。"""
    time.sleep(0.3)  # 0.3 秒，超时
    return "完成"

print(slow_function())
print(too_slow())
\`\`\`

### 五、类装饰器

用类实现装饰器更直观，能保存状态：

\`\`\`python
from functools import wraps

class CountCalls:
    """统计函数调用次数。"""
    def __init__(self, func):
        # __init__ 接收被装饰的函数
        self.func = func
        self.count = 0
        # 保留原函数的元信息
        wraps(func)(self)

    def __call__(self, *args, **kwargs):
        # __call__ 让实例可以像函数一样被调用
        self.count += 1
        print(f"  {self.func.__name__} 第 {self.count} 次调用")
        return self.func(*args, **kwargs)

@CountCalls
def process(data):
    """处理数据。"""
    return f"处理了 {data}"

# 调用其实就是调用 __call__
process("a")
process("b")
process("c")
print(f"总调用次数: {process.count}")
\`\`\`

### 六、类装饰器带参数

\`\`\`python
class Retry:
    """重试装饰器（类实现）。"""
    def __init__(self, max_attempts=3, delay=0):
        # 接收装饰器参数（不是函数）
        self.max_attempts = max_attempts
        self.delay = delay

    def __call__(self, func):
        # __call__ 接收函数，返回包装后的函数
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_error = None
            for attempt in range(1, self.max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_error = e
                    print(f"  第 {attempt} 次失败: {e}")
                    if self.delay:
                        import time
                        time.sleep(self.delay)
            raise last_error
        return wrapper

# 用法：@Retry(max_attempts=3, delay=0.1)
@Retry(max_attempts=3)
def unstable_api():
    """模拟不稳定 API。"""
    import random
    if random.random() < 0.5:
        raise ConnectionError("服务不可用")
    return "成功"

import random
random.seed(42)
try:
    print(unstable_api())
except Exception as e:
    print(f"最终失败: {e}")
\`\`\`

### 七、装饰器叠加顺序

多个装饰器叠加时，**应用顺序是从下到上，调用顺序是从上到下**：

\`\`\`python
from functools import wraps

def decorator_a(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print("A - 前")
        result = func(*args, **kwargs)
        print("A - 后")
        return result
    return wrapper

def decorator_b(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print("B - 前")
        result = func(*args, **kwargs)
        print("B - 后")
        return result
    return wrapper

# 应用顺序：先 B 后 A（从下到上）
# 等价于 func = decorator_a(decorator_b(func))
@decorator_a
@decorator_b
def hello():
    print("Hello!")

print("=== 调用 ===")
hello()
# 输出：
# A - 前
# B - 前
# Hello!
# B - 后
# A - 后
\`\`\`

### 八、常见模式：缓存

\`\`\`python
from functools import wraps

# 简易缓存装饰器
def memoize(func):
    """缓存函数结果（基于参数）。"""
    cache = {}

    @wraps(func)
    def wrapper(*args):
        # 注意：只缓存可哈希的参数
        if args not in cache:
            # 第一次调用才真正执行
            cache[args] = func(*args)
        return cache[args]

    # 暴露 cache 便于检查
    wrapper.cache = cache
    return wrapper

@memoize
def fib(n):
    """斐波那契数列。"""
    if n < 2:
        return n
    return fib(n-1) + fib(n-2)

# 第一次调用计算
print(fib(10))  # 55
print(f"缓存了 {len(fib.cache)} 个结果")

# 实际项目用 functools.lru_cache 更好（下一章讲）
\`\`\`

### 九、常见模式：限流

\`\`\`python
import time
from functools import wraps
from collections import deque

def rate_limit(calls, period):
    """限制单位时间内调用次数。"""
    def decorator(func):
        # 用 deque 存最近调用时间戳
        history = deque()

        @wraps(func)
        def wrapper(*args, **kwargs):
            now = time.time()
            # 清理过期的记录
            while history and history[0] < now - period:
                history.popleft()
            # 检查是否超限
            if len(history) >= calls:
                # 计算需要等待的时间
                wait = history[0] + period - now
                print(f"  限流：等待 {wait:.2f}s")
                time.sleep(wait)
                # 重新计算
                now = time.time()
                while history and history[0] < now - period:
                    history.popleft()

            history.append(now)
            return func(*args, **kwargs)
        return wrapper
    return decorator

@rate_limit(calls=3, period=1.0)
def api_call(n):
    """模拟 API 调用。"""
    print(f"  调用 API #{n}")
    return "ok"

# 快速调用 5 次，后 2 次会被限流
for i in range(5):
    api_call(i)
\`\`\`

### 十、常见模式：注册

装饰器可以用来注册函数（实现插件机制）：

\`\`\`python
from functools import wraps

# 全局注册表
_registry = {}

def register(name):
    """注册函数到全局表。"""
    def decorator(func):
        # 把函数注册到表里
        _registry[name] = func
        @wraps(func)
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)
        return wrapper
    return decorator

@register("add")
def add(a, b):
    return a + b

@register("multiply")
def multiply(a, b):
    return a * b

@register("subtract")
def subtract(a, b):
    return a - b

# 查看注册的函数
print("已注册:", list(_registry.keys()))

# 根据名字调用
def call_op(name, a, b):
    if name not in _registry:
        raise ValueError(f"未知操作: {name}")
    return _registry[name](a, b)

print(call_op("add", 3, 5))
print(call_op("multiply", 3, 5))
\`\`\`

### 十一、常见模式：调试装饰器

\`\`\`python
from functools import wraps
import time
import logging

logging.basicConfig(level=logging.DEBUG, format='%(message)s')
logger = logging.getLogger(__name__)

def debug(func):
    """打印函数调用信息和返回值。"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        # 格式化参数
        args_str = ", ".join(repr(a) for a in args)
        kwargs_str = ", ".join(f"{k}={v!r}" for k, v in kwargs.items())
        all_args = ", ".join(filter(None, [args_str, kwargs_str]))

        logger.debug(f"→ {func.__name__}({all_args})")
        start = time.perf_counter()
        try:
            result = func(*args, **kwargs)
            elapsed = (time.perf_counter() - start) * 1000
            logger.debug(f"← {func.__name__} 返回 {result!r} ({elapsed:.2f}ms)")
            return result
        except Exception as e:
            elapsed = (time.perf_counter() - start) * 1000
            logger.debug(f"✗ {func.__name__} 抛出 {type(e).__name__}: {e} ({elapsed:.2f}ms)")
            raise
    return wrapper

@debug
def calculate(a, b):
    """计算 a + b。"""
    return a + b

@debug
def divide(a, b):
    return a / b

print(calculate(3, 5))
try:
    divide(10, 0)
except ZeroDivisionError:
    pass
\`\`\`

### 十二、装饰器实战：API 路由

\`\`\`python
from functools import wraps

# 模拟 Web 框架的路由注册
class Flask:
    """迷你 Web 框架。"""
    def __init__(self):
        self.routes = {}

    def route(self, path, methods=None):
        """路由装饰器。"""
        def decorator(func):
            # 把函数注册到路由表
            self.routes[path] = {
                'func': func,
                'methods': methods or ['GET']
            }
            @wraps(func)
            def wrapper(*args, **kwargs):
                return func(*args, **kwargs)
            return wrapper
        return decorator

    def dispatch(self, path, method='GET'):
        """根据路径调用对应函数。"""
        if path not in self.routes:
            return {"status": 404, "error": "Not Found"}
        route_info = self.routes[path]
        if method not in route_info['methods']:
            return {"status": 405, "error": "Method Not Allowed"}
        return route_info['func']()

app = Flask()

@app.route("/", methods=["GET"])
def index():
    return {"message": "首页"}

@app.route("/users", methods=["GET", "POST"])
def users():
    return {"users": ["张三", "李四"]}

@app.route("/users/<int:id>", methods=["GET"])
def get_user(id):
    # 实际框架会解析路径参数
    return {"user": f"用户{id}"}

# 测试路由
print(app.dispatch("/"))
print(app.dispatch("/users"))
print(app.dispatch("/users", method="POST"))
print(app.dispatch("/unknown"))
\`\`\`

### 十三、装饰器与类方法

装饰器同样适用于方法：

\`\`\`python
from functools import wraps

def log_method(func):
    """方法调用日志。"""
    @wraps(func)
    def wrapper(self, *args, **kwargs):
        print(f"[{type(self).__name__}] {func.__name__} 被调用")
        return func(self, *args, **kwargs)
    return wrapper

class UserService:
    def __init__(self):
        self.users = []

    @log_method
    def add_user(self, name):
        self.users.append(name)
        return f"添加了 {name}"

    @log_method
    def get_users(self):
        return self.users.copy()

service = UserService()
service.add_user("张三")
service.add_user("李四")
print(service.get_users())
\`\`\`

### 十四、property 也是装饰器

\`@property\` 是内置装饰器，把方法变成属性：

\`\`\`python
class Temperature:
    """温度类，摄氏度存储，支持华氏度访问。"""
    def __init__(self, celsius):
        self._celsius = celsius

    @property
    def celsius(self):
        """摄氏度。"""
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError("温度不能低于绝对零度")
        self._celsius = value

    @property
    def fahrenheit(self):
        """华氏度（只读）。"""
        return self._celsius * 9/5 + 32

    @fahrenheit.setter
    def fahrenheit(self, value):
        self._celsius = (value - 32) * 5/9

t = Temperature(25)
print(f"摄氏: {t.celsius}")
print(f"华氏: {t.fahrenheit}")

t.celsius = 30
print(f"修改后: {t.celsius}°C = {t.fahrenheit}°F")

t.fahrenheit = 100
print(f"华氏 100: {t.celsius}°C")

try:
    t.celsius = -300
except ValueError as e:
    print(f"错误: {e}")
\`\`\`

### 十五、用类装饰器装饰类

类装饰器可以修改或替换被装饰的类：

\`\`\`python
def singleton(cls):
    """单例装饰器：确保一个类只有一个实例。"""
    instances = {}

    def get_instance(*args, **kwargs):
        if cls not in instances:
            # 第一次创建实例
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]

    # 保留原类的信息
    get_instance.__wrapped_cls__ = cls
    return get_instance

@singleton
class Database:
    """数据库连接（单例）。"""
    def __init__(self):
        print("  初始化数据库连接")
        self.connected = True

# 第一次创建：会打印初始化信息
db1 = Database()
# 第二次：返回同一个实例，不会重新初始化
db2 = Database()
print(f"是同一个实例: {db1 is db2}")
\`\`\`

### 十六、dataclass 也是装饰器

\`@dataclass\` 是 Python 3.7+ 的内置类装饰器：

\`\`\`python
from dataclasses import dataclass, field
from typing import List

@dataclass
class User:
    """用户数据类。"""
    name: str
    age: int
    email: str = ""
    tags: List[str] = field(default_factory=list)

    def __post_init__(self):
        """初始化后调用。"""
        if self.age < 0:
            raise ValueError("年龄不能为负数")

# 自动生成 __init__, __repr__, __eq__
u1 = User("张三", 25, "zhang@example.com")
u2 = User("张三", 25, "zhang@example.com")
print(u1)
print(f"相等: {u1 == u2}")  # True（按字段比较）
print(f"年龄: {u1.age}")

u1.tags.append("admin")
print(u1.tags)

try:
    User("李四", -5)
except ValueError as e:
    print(f"错误: {e}")
\`\`\`

### 十七、上下文管理装饰器

\`\`\`python
from contextlib import contextmanager
import time

@contextmanager
def timer(name):
    """计时上下文管理器。"""
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        print(f"[{name}] 耗时 {elapsed:.3f}s")

# 用法 1：直接用
with timer("数据处理"):
    total = sum(range(1000000))
    print(f"结果: {total}")

# 用法 2：装饰器形式
def timed(name):
    """把上下文管理器变成装饰器。"""
    def decorator(func):
        @wraps(func)
        from functools import wraps as _w
        # 这里简化，实际推荐用 contextlib.ContextDecorator
        def wrapper(*args, **kwargs):
            with timer(name):
                return func(*args, **kwargs)
        return wrapper
    return decorator

# 简化版
def simple_timed(func):
    from functools import wraps
    @wraps(func)
    def wrapper(*args, **kwargs):
        with timer(func.__name__):
            return func(*args, **kwargs)
    return wrapper

@simple_timed
def compute():
    return sum(i*i for i in range(100000))

print(compute())
\`\`\`

### 十八、装饰器性能注意

\`\`\`python
import time
from functools import wraps

# 装饰器会引入额外开销（函数调用、参数解析）
# 但通常可以忽略

def no_op_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@no_op_decorator
def decorated(n):
    return n * 2

def plain(n):
    return n * 2

# 性能对比
start = time.perf_counter()
for _ in range(1000000):
    plain(5)
plain_time = time.perf_counter() - start

start = time.perf_counter()
for _ in range(1000000):
    decorated(5)
decorated_time = time.perf_counter() - start

print(f"原函数: {plain_time:.3f}s")
print(f"装饰后: {decorated_time:.3f}s")
print(f"开销: {decorated_time/plain_time:.1f}x")
\`\`\`

### 十九、装饰器的副作用：签名变化

\`\`\`python
import inspect
from functools import wraps

def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@my_decorator
def add(a, b, c=0):
    """三个数相加。"""
    return a + b + c

# inspect.signature 能正确识别签名
# 因为 wraps 复制了 __wrapped__
print(f"签名: {inspect.signature(add)}")
print(f"参数: {list(inspect.signature(add).parameters.keys())}")

# 如果不用 wraps，签名会变成 (*args, **kwargs)
\`\`\`

### 二十、综合实战：缓存与重试组合

\`\`\`python
import time
from functools import wraps
import random

# 组合多个装饰器：缓存 + 重试 + 日志
def cached(timeout=60):
    """带 TTL 的缓存。"""
    def decorator(func):
        cache = {}

        @wraps(func)
        def wrapper(*args, **kwargs):
            key = (args, tuple(sorted(kwargs.items())))
            now = time.time()
            # 检查缓存是否有效
            if key in cache:
                value, ts = cache[key]
                if now - ts < timeout:
                    print(f"  [cache] 命中 {func.__name__}")
                    return value
            # 缓存未命中或过期
            result = func(*args, **kwargs)
            cache[key] = (result, now)
            print(f"  [cache] 写入 {func.__name__}")
            return result

        wrapper._cache = cache
        return wrapper
    return decorator

def retry(times=3, exceptions=(Exception,)):
    """重试装饰器。"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_error = None
            for i in range(times):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_error = e
                    print(f"  [retry] 第 {i+1} 次失败: {e}")
            raise last_error
        return wrapper
    return decorator

# 组合使用：先缓存，再重试
@cached(timeout=10)
@retry(times=3, exceptions=(ConnectionError,))
def fetch_data(url):
    """模拟获取数据。"""
    # 模拟 30% 概率失败
    if random.random() < 0.3:
        raise ConnectionError(f"连接 {url} 失败")
    return f"<html>{url}</html>"

random.seed(42)
# 第一次：可能重试
print(fetch_data("https://api.example.com/users"))
# 第二次：缓存命中
print(fetch_data("https://api.example.com/users"))
\`\`\`

## 小结

- ⭐ 装饰器本质：接收函数，返回新函数；\`@decorator\` 是语法糖。
- ⭐ **永远用 \`@functools.wraps(func)\`** 保留原函数的 \`__name__\` / \`__doc__\` / 签名。
- ⭐ 带参数的装饰器需要**三层嵌套**：参数 → 装饰器 → 包装函数。
- ⭐ 类装饰器用 \`__init__\` 接收函数，\`__call__\` 实现调用；能保存状态。
- ⭐ 装饰器叠加：**应用顺序从下到上，调用顺序从上到下**。
- 常见模式：缓存、重试、限流、注册、调试日志、计时、权限检查。
- ⭐ \`@property\` / \`@dataclass\` / \`@contextmanager\` 都是装饰器。
- ⭐ 类装饰器能装饰类：实现单例、注册子类、自动添加方法。

下一章讲迭代器协议——\`__iter__\` / \`__next__\` / \`StopIteration\`，理解 for 循环的本质。`,
  },

  // ============================================================
  // 第五十二章 迭代器协议
  // ============================================================
  {
    id: 'py10-ch52',
    group: '第十一部分 装饰器与迭代器',
    icon: '🔄',
    title: '第五十二章 迭代器协议',
    content: `## 第五十二章 迭代器协议

迭代器是 Python 最优雅的特性之一——\`for\` 循环、列表推导、生成器都基于迭代器协议。理解 \`__iter__\` 和 \`__next__\` 是写出高效 Python 代码的基础。

### 一、什么是迭代器

迭代器是实现了 \`__iter__\` 和 \`__next__\` 两个方法的对象：

\`\`\`python
# 列表不是迭代器，但可迭代
numbers = [1, 2, 3]
print(hasattr(numbers, '__next__'))  # False（列表不是迭代器）
print(hasattr(numbers, '__iter__'))  # True（列表可迭代）

# 用 iter() 把可迭代对象转成迭代器
it = iter(numbers)
print(hasattr(it, '__next__'))  # True
print(type(it))  # list_iterator

# 用 next() 取下一个值
print(next(it))  # 1
print(next(it))  # 2
print(next(it))  # 3
# 取完后再调用会抛 StopIteration
try:
    next(it)
except StopIteration:
    print("迭代结束")
\`\`\`

### 二、for 循环的本质

\`for\` 循环内部就是用 \`iter\` + \`next\` + \`StopIteration\`：

\`\`\`python
# for 循环
for x in [1, 2, 3]:
    print(x)

# 等价于
_it = iter([1, 2, 3])
while True:
    try:
        x = next(_it)
        print(x)
    except StopIteration:
        break

# 这就是为什么任何实现了迭代器协议的对象都能用 for
\`\`\`

### 三、自定义迭代器类

实现 \`__iter__\` 和 \`__next__\` 就能创建自定义迭代器：

\`\`\`python
class CountDown:
    """倒计时迭代器。"""
    def __init__(self, start):
        self.current = start

    def __iter__(self):
        # 返回自己（自己就是迭代器）
        return self

    def __next__(self):
        if self.current <= 0:
            # 没有更多元素时抛 StopIteration
            # for 循环会自动捕获这个异常
            raise StopIteration
        self.current -= 1
        return self.current + 1

# 使用
for n in CountDown(5):
    print(n, end=" ")
print()

# 也能手动用 iter 和 next
cd = CountDown(3)
print(next(cd))  # 3
print(next(cd))  # 2
print(next(cd))  # 1
\`\`\`

### 四、可迭代对象 vs 迭代器

**重要区别**：可迭代对象能多次迭代，迭代器只能迭代一次：

\`\`\`python
# 可迭代对象：实现 __iter__ 返回一个新迭代器
class Range:
    """可多次迭代的范围。"""
    def __init__(self, start, end):
        self.start = start
        self.end = end

    def __iter__(self):
        # 每次都返回一个新的迭代器
        return RangeIterator(self.start, self.end)

class RangeIterator:
    """真正的迭代器。"""
    def __init__(self, start, end):
        self.current = start
        self.end = end

    def __iter__(self):
        return self

    def __next__(self):
        if self.current >= self.end:
            raise StopIteration
        result = self.current
        self.current += 1
        return result

# 可多次迭代
r = Range(1, 4)
print("第一次:", list(r))
print("第二次:", list(r))  # 同样的结果

# 但迭代器只能用一次
it = iter(r)
print("迭代器第一次:", list(it))
print("迭代器第二次:", list(it))  # 空（已经耗尽）
\`\`\`

### 五、iter() 和 next() 内置函数

\`\`\`python
# iter() 有两种用法
# 1. iter(iterable): 转成迭代器
it = iter([1, 2, 3])
print(next(it))  # 1

# 2. iter(callable, sentinel): 调用 callable 直到返回 sentinel
# 适合"读直到某个标志"的场景
import random
random.seed(42)

# 模拟：随机生成数字，直到出现 0
def gen():
    return random.randint(0, 5)

# iter 会一直调用 gen()，直到返回 0 才停
result = list(iter(gen, 0))
print(f"随机序列: {result}")  # 不包含 0

# next() 也有两种用法
it = iter([10, 20, 30])
# 1. next(it): 取下一个，没元素抛 StopIteration
# 2. next(it, default): 没元素返回 default
print(next(it))         # 10
print(next(it))         # 20
print(next(it))         # 30
print(next(it, None))   # None（不抛异常）
\`\`\`

### 六、迭代器的常用操作

\`\`\`python
# 1. list() 一次性消费迭代器
it = iter(range(5))
print(list(it))  # [0, 1, 2, 3, 4]
# 注意：再 list 就是空了
print(list(it))  # []

# 2. tuple(), set(), dict() 同理
print(tuple(iter([1, 2, 3])))
print(set(iter([1, 2, 2, 3])))

# 3. zip() 并行迭代多个
names = ["张三", "李四", "王五"]
ages = [25, 30, 28]
for name, age in zip(names, ages):
    print(f"  {name}: {age}岁")

# 4. enumerate() 带索引
for i, name in enumerate(names, start=1):
    print(f"  {i}. {name}")

# 5. map() 对每个元素应用函数
squares = list(map(lambda x: x**2, range(5)))
print(squares)

# 6. filter() 过滤
evens = list(filter(lambda x: x % 2 == 0, range(10)))
print(evens)
\`\`\`

### 七、生成器函数就是迭代器

\`yield\` 关键字让函数变成生成器，生成器天然是迭代器：

\`\`\`python
def count_down(start):
    """生成器函数：用 yield 产出值。"""
    while start > 0:
        # yield 暂停函数，返回值
        # 下次 next() 从这里继续
        yield start
        start -= 1

# 生成器对象是迭代器
gen = count_down(5)
print(type(gen))  # generator
print(hasattr(gen, '__next__'))  # True

# 可以用 for
for n in count_down(3):
    print(n, end=" ")
print()

# 也可以用 next
gen = count_down(2)
print(next(gen))  # 2
print(next(gen))  # 1
\`\`\`

### 八、生成器表达式

类似列表推导，但用 \`()\` 包裹，惰性求值：

\`\`\`python
# 列表推导：立即生成所有元素
squares_list = [x**2 for x in range(5)]
print(type(squares_list))  # list
print(squares_list)

# 生成器表达式：惰性生成
squares_gen = (x**2 for x in range(5))
print(type(squares_gen))  # generator

# 按需取值，不占内存
print(next(squares_gen))  # 0
print(next(squares_gen))  # 1

# 也能用 for
for sq in squares_gen:  # 从上次的位置继续
    print(sq, end=" ")
print()

# 大数据场景用生成器表达式
# 计算 0-999 的平方和，不创建列表
total = sum(x**2 for x in range(1000))
print(f"平方和: {total}")
\`\`\`

### 九、itertools.chain 串联迭代器

\`\`\`python
from itertools import chain

# chain 把多个迭代器串联成一个
list1 = [1, 2, 3]
list2 = [4, 5, 6]
list3 = [7, 8, 9]

# 普通做法：嵌套循环
result = []
for lst in [list1, list2, list3]:
    for x in lst:
        result.append(x)
print(result)

# 用 chain 更简洁
chained = chain(list1, list2, list3)
print(list(chained))

# 也能串联不同类型
mixed = chain("abc", [1, 2, 3], range(3))
print(list(mixed))  # ['a', 'b', 'c', 1, 2, 3, 0, 1, 2]

# 处理文件
# 假设要读多个文件的所有行
# all_lines = chain.from_iterable(open(f) for f in filenames)
\`\`\`

### 十、itertools.islice 切片

普通切片会创建新列表，\`islice\` 是惰性的：

\`\`\`python
from itertools import islice

# 对迭代器切片（不创建新列表）
def natural_numbers():
    """无限自然数生成器。"""
    n = 1
    while True:
        yield n

# 取前 5 个
first_five = list(islice(natural_numbers(), 5))
print(f"前 5 个: {first_five}")

# 跳过前 2 个，取 3 个
# islice(iterable, start, stop, step)
middle = list(islice(natural_numbers(), 2, 5))
print(f"第 3-5 个: {middle}")

# 每隔 2 个取一个
every_other = list(islice(range(10), 0, None, 2))
print(f"奇数位: {every_other}")

# 大文件只读前 100 行
# with open("big.txt") as f:
#     for line in islice(f, 100):
#         process(line)
\`\`\`

### 十一、itertools.cycle 循环

\`\`\`python
from itertools import islice
from itertools import cycle

# cycle 让迭代器无限循环
colors = cycle(["红", "绿", "蓝"])

# 用 islice 取出前 7 个
result = list(islice(colors, 7))
print(f"循环颜色: {result}")

# 实际应用：轮询服务器
servers = ["server1", "server2", "server3"]
server_cycle = cycle(servers)

# 模拟 5 次请求，轮流分配服务器
for i in range(5):
    server = next(server_cycle)
    print(f"  请求 {i+1} → {server}")

# 另一个应用：交替打印
import string
letters = cycle("ABC")
numbers = cycle(range(3))
for _ in range(6):
    print(f"  {next(letters)}{next(numbers)}", end=" ")
print()
\`\`\`

### 十二、itertools.repeat 重复

\`\`\`python
from itertools import repeat

# repeat 创建一个永远返回同一个值的迭代器
# 如果不指定次数，会无限重复
r = repeat("hello", 3)
print(list(r))  # ['hello', 'hello', 'hello']

# 无限重复（要配合 islice）
# r = repeat("x")
# print(list(islice(r, 5)))  # ['x', 'x', 'x', 'x', 'x']

# 应用：作为 map 的固定参数
# 把 [1, 2, 3] 都乘以 10
result = list(map(lambda x, y: x * y, [1, 2, 3], repeat(10)))
print(result)  # [10, 20, 30]

# 应用：填充列表
filled = list(zip([1, 2, 3], repeat(0)))
print(filled)  # [(1, 0), (2, 0), (3, 0)]
\`\`\`

### 十三、自定义迭代器：文件读取器

\`\`\`python
class FileReader:
    """按行读取文件的迭代器。"""
    def __init__(self, path, encoding="utf-8"):
        self.path = path
        self.encoding = encoding
        self.file = None

    def __iter__(self):
        # __enter__ 模式：每次迭代都打开文件
        return self._read_lines()

    def _read_lines(self):
        """生成器：逐行产出。"""
        with open(self.path, 'r', encoding=self.encoding) as f:
            for line in f:
                # 去掉行尾换行符
                yield line.rstrip('\\n')

# 测试（用临时文件）
import tempfile, os

with tempfile.NamedTemporaryFile(mode='w', suffix='.txt',
                                  delete=False, encoding='utf-8') as f:
    f.write("第一行\\n第二行\\n第三行\\n")
    tmp_path = f.name

reader = FileReader(tmp_path)
# 第一次迭代
for line in reader:
    print(f"  → {line}")

# 第二次迭代：重新打开文件
print("再读一次:")
for line in reader:
    print(f"  → {line}")

os.unlink(tmp_path)
\`\`\`

### 十四、迭代器协议的常见方法

\`\`\`python
class Matrix:
    """二维矩阵，支持行迭代。"""
    def __init__(self, data):
        self.data = data

    def __iter__(self):
        """按行迭代。"""
        return iter(self.data)

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        """支持索引访问和切片。"""
        return self.data[idx]

    def __reversed__(self):
        """支持 reversed() 反向迭代。"""
        return reversed(self.data)

m = Matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]])

# for 循环（用 __iter__）
print("按行:")
for row in m:
    print(f"  {row}")

# 反向迭代
print("反向:")
for row in reversed(m):
    print(f"  {row}")

# 索引访问
print(f"第二行: {m[1]}")

# in 操作（用 __iter__ 或 __contains__）
print(f"4 在矩阵里: {4 in m}")  # 检查行，不是元素
\`\`\`

### 十五、迭代器与并发

\`\`\`python
import itertools

def parallel_process(*iterables):
    """并行处理多个迭代器。"""
    # zip 会在最短的那个结束时停止
    results = []
    for items in zip(*iterables):
        # items 是各迭代器同一位置的元素组成的元组
        results.append(items)
    return results

a = [1, 2, 3]
b = ['a', 'b', 'c']
c = [True, False, True]

result = parallel_process(a, b, c)
print(result)
# [(1, 'a', True), (2, 'b', False), (3, 'c', True)]

# zip_longest 用某个值填充短迭代器
from itertools import zip_longest

short = [1, 2, 3]
long = [10, 20, 30, 40, 50]

# 普通 zip 在 short 结束时停
print(list(zip(short, long)))

# zip_longest 会用 fillvalue 填充
print(list(zip_longest(short, long, fillvalue=0)))
\`\`\`

### 十六、迭代器的常见陷阱

\`\`\`python
# 陷阱 1：迭代器只能用一次
numbers = iter([1, 2, 3])
print("第一次:", list(numbers))
print("第二次:", list(numbers))  # 空！

# 解决：每次用 list 重新创建
def get_numbers():
    return iter([1, 2, 3])  # 每次调用返回新迭代器

print("调用 1:", list(get_numbers()))
print("调用 2:", list(get_numbers()))

# 陷阱 2：迭代中修改集合
# 这是错的：
# lst = [1, 2, 3, 4, 5]
# for x in lst:
#     if x % 2 == 0:
#         lst.remove(x)  # 修改迭代中的集合会出问题

# 正确做法 1：用列表推导创建新列表
lst = [1, 2, 3, 4, 5]
filtered = [x for x in lst if x % 2 != 0]
print(filtered)

# 正确做法 2：先复制再迭代
lst = [1, 2, 3, 4, 5]
for x in list(lst):  # 复制一份
    if x % 2 == 0:
        lst.remove(x)
print(lst)

# 陷阱 3：迭代字典时修改
d = {"a": 1, "b": 2, "c": 3}
# for key in d:
#     if d[key] < 2:
#         del d[key]  # RuntimeError: 字典大小改变

# 正确做法：先收集要删的键
to_delete = [k for k, v in d.items() if v < 2]
for k in to_delete:
    del d[k]
print(d)
\`\`\`

### 十七、自定义无限迭代器

\`\`\`python
class Counter:
    """无限计数器。"""
    def __init__(self, start=0, step=1):
        self.current = start
        self.step = step

    def __iter__(self):
        return self

    def __next__(self):
        result = self.current
        self.current += self.step
        return result

# 无限计数（要配合 islice 或 break）
counter = Counter(10, 5)
from itertools import islice
print(list(islice(counter, 5)))  # [10, 15, 20, 25, 30]

# 斐波那契无限迭代器
class Fibonacci:
    """斐波那契数列。"""
    def __init__(self):
        self.a, self.b = 0, 1

    def __iter__(self):
        return self

    def __next__(self):
        result = self.a
        self.a, self.b = self.b, self.a + self.b
        return result

fib = Fibonacci()
# 取前 10 个斐波那契数
print(list(islice(fib, 10)))
\`\`\`

### 十八、迭代器与生成器对比

\`\`\`python
# 用迭代器类实现
class SquaresClass:
    """平方数迭代器。"""
    def __init__(self, n):
        self.n = n
        self.i = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.i >= self.n:
            raise StopIteration
        result = self.i ** 2
        self.i += 1
        return result

# 用生成器函数实现（更简洁）
def squares_gen(n):
    """平方数生成器。"""
    for i in range(n):
        yield i ** 2

# 两者效果相同
print("迭代器类:", list(SquaresClass(5)))
print("生成器函数:", list(squares_gen(5)))

# 生成器表达式（最简洁）
print("生成器表达式:", list(x**2 for x in range(5)))

# 选择原则：
# - 简单逻辑：用生成器表达式或生成器函数
# - 复杂状态：用迭代器类（更易维护）
# - 需要多个方法：用迭代器类
\`\`\`

### 十九、迭代器的内存优势

\`\`\`python
import sys

# 列表：一次性创建，占内存
big_list = list(range(1000000))
print(f"列表大小: {sys.getsizeof(big_list)} 字节")

# range 对象：惰性，几乎不占内存
big_range = range(1000000)
print(f"range 大小: {sys.getsizeof(big_range)} 字节")

# 生成器表达式：同样几乎不占内存
big_gen = (x for x in range(1000000))
print(f"生成器大小: {sys.getsizeof(big_gen)} 字节")

# 处理大数据：用生成器
def read_large_file(path):
    """逐行读大文件，不占内存。"""
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            yield line.strip()

# 大文件处理流程
# lines = read_large_file("huge.txt")  # 不占内存
# for line in lines:
#     process(line)
print("生成器处理大文件不占内存")
\`\`\`

### 二十、综合实战：管道式数据处理

\`\`\`python
from itertools import islice, chain
import time

# 模拟数据处理管道：每个阶段都是一个生成器
def generate_data(n):
    """生成模拟数据。"""
    for i in range(n):
        yield {"id": i, "value": i * 2 + 1}

def filter_even(data_stream):
    """过滤奇数值。"""
    for item in data_stream:
        if item["value"] % 2 == 1:  # 奇数
            yield item

def transform(data_stream):
    """转换数据：加一个字段。"""
    for item in data_stream:
        new_item = item.copy()
        new_item["squared"] = item["value"] ** 2
        yield new_item

def limit(data_stream, n):
    """只取前 n 个。"""
    return islice(data_stream, n)

# 构建管道
# 数据流：generate → filter → transform → limit
pipeline = limit(
    transform(
        filter_even(
            generate_data(100)
        )
    ),
    5
)

# 消费管道
print("=== 管道处理结果 ===")
for item in pipeline:
    print(f"  {item}")

# 优势：
# 1. 内存友好：每个阶段都只处理当前元素
# 2. 可组合：用函数组合不同阶段
# 3. 惰性：直到迭代才开始处理
# 4. 可扩展：加新阶段只要加新函数
\`\`\`

## 小结

- ⭐ 迭代器协议 = \`__iter__\` + \`__next__\`；\`StopIteration\` 表示结束。
- ⭐ \`iter(iterable)\` 转迭代器；\`next(it, default)\` 取下一个值。
- ⭐ **可迭代对象**（多次迭代）vs **迭代器**（一次耗尽）。
- ⭐ \`for\` 循环本质：\`iter()\` → \`next()\` 循环 → 捕获 \`StopIteration\`。
- ⭐ 生成器函数（\`yield\`）和生成器表达式（\`(x for x in ...)\`）天然是迭代器。
- ⭐ \`itertools.chain\` 串联 / \`islice\` 切片 / \`cycle\` 循环 / \`repeat\` 重复。
- ⭐ \`zip\` 并行 / \`enumerate\` 带索引 / \`map\` / \`filter\` / \`reversed\`。
- 陷阱：迭代器只能用一次；迭代中不要修改集合。
- 内存优势：生成器处理大数据不占内存。
- 管道模式：用生成器组合多阶段数据处理。

下一章深入生成器——\`yield from\`、\`send()\`、\`throw()\`、\`close()\` 和生成器管道。`,
  },

  // ============================================================
  // 第五十三章 生成器深度
  // ============================================================
  {
    id: 'py10-ch53',
    group: '第十一部分 装饰器与迭代器',
    icon: '⚡',
    title: '第五十三章 生成器深度',
    content: `## 第五十三章 生成器深度

生成器是 Python 最优雅的特性之一——用 \`yield\` 暂停函数，实现"按需产出"。这一章深入生成器的高级用法：\`yield from\`、\`send()\`、\`throw()\`、\`close()\` 和生成器管道。

### 一、生成器函数回顾

\`\`\`python
def simple_generator():
    """最简单的生成器。"""
    yield 1
    yield 2
    yield 3

# 调用生成器函数返回生成器对象（不执行函数体）
gen = simple_generator()
print(type(gen))  # generator

# next() 触发执行到第一个 yield
print(next(gen))  # 1
print(next(gen))  # 2
print(next(gen))  # 3

# yield 之后没有更多代码，抛 StopIteration
try:
    next(gen)
except StopIteration:
    print("生成器结束")
\`\`\`

### 二、生成器的执行流程

\`\`\`python
def demo_flow():
    """演示生成器的暂停和恢复。"""
    print("  → 开始执行")
    x = yield 1  # 第一次 next() 在这暂停，返回 1
    print(f"  → 收到 send 的值: {x}")
    y = yield 2   # 第二次 next() 在这暂停，返回 2
    print(f"  → 收到第二个值: {y}")
    yield 3
    print("  → 结束")

gen = demo_flow()

# 第一次 next：执行到第一个 yield，返回 1
print(f"第一次: {next(gen)}")

# 第二次 next：从上次暂停处继续，执行到第二个 yield
print(f"第二次: {next(gen)}")

# 第三次 next
print(f"第三次: {next(gen)}")

# 第四次：函数结束，抛 StopIteration
try:
    next(gen)
except StopIteration:
    print("结束")
\`\`\`

### 三、send() 给生成器传值

\`send()\` 不仅能取下一个值，还能向 yield 表达式传值：

\`\`\`python
def echo():
    """回声生成器：把收到的值返回。"""
    while True:
        # yield 表达式的值就是 send 传进来的值
        received = yield
        # 把收到的值加工后返回
        yield f"echo: {received}"

gen = echo()
# 第一次必须 next 或 send(None) 启动
next(gen)  # 启动到第一个 yield

# send 同时传值和取下一个 yield 的值
result = gen.send("hello")
print(result)

# 继续
next(gen)  # 启动下一轮
result = gen.send("world")
print(result)

# 实际应用：累加器
def accumulator():
    """累加器：每次 send 一个数，返回当前总和。"""
    total = 0
    while True:
        # yield 返回当前总和，并接收下一个数
        value = yield total
        total += value

acc = accumulator()
next(acc)  # 启动
print(acc.send(10))  # 10
print(acc.send(20))  # 30
print(acc.send(5))   # 35
\`\`\`

### 四、协程风格的生成器

\`\`\`python
def averager():
    """计算移动平均。"""
    total = 0
    count = 0
    average = 0
    while True:
        # 接收新值
        value = yield average
        total += value
        count += 1
        average = total / count

# 使用
avg = averager()
next(avg)  # 启动
print(avg.send(10))  # 10.0
print(avg.send(20))  # 15.0
print(avg.send(30))  # 20.0
print(avg.send(0))    # 15.0

# 这种"协程"模式在 asyncio 出现前很流行
# 现在推荐用 async/await 替代
\`\`\`

### 五、yield from 委托生成器

\`yield from\` 把一个生成器的所有 yield 委托给外层生成器：

\`\`\`python
def inner():
    """内层生成器。"""
    yield 1
    yield 2
    yield 3

def outer_yield():
    """不用 yield from：手动迭代。"""
    yield 0
    for x in inner():
        yield x  # 手动转发
    yield 4

def outer_yield_from():
    """用 yield from：自动转发。"""
    yield 0
    yield from inner()  # 等价于上面的循环
    yield 4

print("手动:", list(outer_yield()))
print("yield from:", list(outer_yield_from()))
# 两者效果相同：[0, 1, 2, 3, 4]
\`\`\`

### 六、yield from 的更多用法

\`\`\`python
# 嵌套结构展平
def flatten(nested):
    """把任意深度的嵌套结构展平。"""
    for item in nested:
        if isinstance(item, (list, tuple)):
            # 递归委托
            yield from flatten(item)
        else:
            yield item

data = [1, [2, 3], [4, [5, 6, [7]]], 8]
print(f"展平: {list(flatten(data))}")

# 委托多个生成器
def chain_generators(*generators):
    """串联多个生成器。"""
    for gen in generators:
        yield from gen

g1 = (x for x in range(3))
g2 = (x for x in "abc")
g3 = (x for x in [True, False])

result = list(chain_generators(g1, g2, g3))
print(f"串联: {result}")

# yield from 还会传递 send 的值
def inner_coroutine():
    """内层协程。"""
    x = yield "inner-1"
    y = yield f"inner received {x}"
    return f"done with {x}, {y}"

def outer_coroutine():
    """外层协程。"""
    # yield from 会把 send 的值传给内层
    result = yield from inner_coroutine()
    yield f"outer: {result}"

gen = outer_coroutine()
print(next(gen))          # inner-1
print(gen.send("A"))      # inner received A
print(gen.send("B"))      # outer: done with A, B
\`\`\`

### 七、throw() 向生成器抛异常

\`\`\`python
def safe_gen():
    """能处理异常的生成器。"""
    try:
        while True:
            try:
                x = yield
                print(f"  收到: {x}")
            except ValueError as e:
                # 捕获 throw 抛进来的异常
                print(f"  捕获异常: {e}")
    except GeneratorExit:
        # close() 时触发
        print("  生成器被关闭")

gen = safe_gen()
next(gen)  # 启动

gen.send("hello")
gen.send("world")

# 向生成器抛异常
gen.throw(ValueError, "故意出错")

# 继续使用（异常被捕获了）
gen.send("继续")

# 关闭生成器
gen.close()
\`\`\`

### 八、close() 关闭生成器

\`\`\`python
def resource_gen():
    """带资源清理的生成器。"""
    print("  → 获取资源")
    try:
        for i in range(10):
            try:
                yield i
            except GeneratorExit:
                # close() 触发
                print("  → GeneratorExit 捕获")
                raise  # 重新抛出
    finally:
        # finally 保证清理
        print("  → 释放资源")

gen = resource_gen()
print(next(gen))  # 0
print(next(gen))  # 1
print(next(gen))  # 2

# 提前关闭
gen.close()
# 输出：
# → GeneratorExit 捕获
# → 释放资源
\`\`\`

### 九、生成器管道：数据流处理

\`\`\`python
# 生成器管道：每个阶段都是生成器，串起来处理数据
import time

def generate_numbers(n):
    """生成数字。"""
    for i in range(n):
        yield i

def filter_even(source):
    """过滤偶数。"""
    for x in source:
        if x % 2 == 0:
            yield x

def square(source):
    """平方。"""
    for x in source:
        yield x ** 2

def format_output(source):
    """格式化输出。"""
    for x in source:
        yield f"结果: {x}"

# 构建管道
pipeline = format_output(
    square(
        filter_even(
            generate_numbers(10)
        )
    )
)

# 消费管道
for result in pipeline:
    print(f"  {result}")

# 这种管道的优势：
# 1. 内存友好：每个元素独立处理
# 2. 可组合：用函数组合不同阶段
# 3. 惰性：直到迭代才开始
# 4. 流式：适合处理数据流
\`\`\`

### 十、生成器 vs 列表性能对比

\`\`\`python
import time
import sys

# 列表：先创建所有元素
def list_squares(n):
    return [x**2 for x in range(n)]

# 生成器：按需生成
def gen_squares(n):
    for x in range(n):
        yield x**2

# 内存对比
n = 100000
lst = list_squares(n)
gen = gen_squares(n)

print(f"列表内存: {sys.getsizeof(lst)} 字节")
print(f"生成器内存: {sys.getsizeof(gen)} 字节")

# 计算耗时对比
start = time.perf_counter()
total_list = sum(list_squares(n))
list_time = time.perf_counter() - start

start = time.perf_counter()
total_gen = sum(gen_squares(n))
gen_time = time.perf_counter() - start

print(f"\\n列表 sum 耗时: {list_time:.3f}s")
print(f"生成器 sum 耗时: {gen_time:.3f}s")
print(f"结果相同: {total_list == total_gen}")

# 列表稍快（少了生成器开销），但内存占用大得多
# 大数据场景必须用生成器
\`\`\`

### 十一、无限生成器

\`\`\`python
from itertools import islice

def natural_numbers(start=1):
    """无限自然数。"""
    n = start
    while True:
        yield n
        n += 1

# 取前 5 个
print(list(islice(natural_numbers(), 5)))

# 用 takewhile 取直到某条件
from itertools import takewhile
nums = natural_numbers()
small = list(takewhile(lambda x: x < 10, nums))
print(f"小于 10 的: {small}")

# 圆周率数字流（模拟）
def fibonacci():
    """无限斐波那契。"""
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

# 取前 15 个斐波那契数
fib = fibonacci()
print(f"斐波那契前 15: {list(islice(fib, 15))}")
\`\`\`

### 十二、生成器实现协程（历史）

\`\`\`python
# asyncio 出现前，生成器被用来实现协程
# 现在虽然不用了，但理解原理有助于学习 asyncio

def simple_coroutine():
    """简单协程：用 yield 暂停和恢复。"""
    print("  → 启动")
    x = yield  # 接收 send 的值
    print(f"  → 收到 {x}")
    y = yield x * 2  # 返回加工后的值
    print(f"  → 收到 {y}")

# 用 yield from 实现任务调度
def task(name, n):
    """模拟任务。"""
    for i in range(n):
        print(f"  [{name}] step {i}")
        yield  # 主动让出控制权

# 简单调度器
def scheduler(*tasks):
    """调度多个任务。"""
    while tasks:
        task = tasks.pop(0)
        try:
            next(task)
            tasks.append(task)  # 重新排队
        except StopIteration:
            print(f"  任务完成")

# 运行
scheduler(task("A", 2), task("B", 3))
\`\`\`

### 十三、生成器表达式 vs 生成器函数

\`\`\`python
# 生成器表达式：单行简洁
squares_gen = (x**2 for x in range(10))

# 等价的生成器函数
def squares_func(n):
    for x in range(n):
        yield x**2

# 选择原则：
# 1. 简单转换：用生成器表达式
# 2. 复杂逻辑：用生成器函数
# 3. 需要参数化：用生成器函数

# 嵌套生成器表达式
result = sum(
    x * y
    for x in range(3)
    for y in range(3)
    if x != y
)
print(f"嵌套生成器: {result}")

# 生成器表达式可以传给 sum / max / min / any / all
print(any(x > 3 for x in range(5)))  # True
print(all(x > 0 for x in range(1, 5)))  # True
print(max(x**2 for x in range(-3, 4)))  # 9
\`\`\`

### 十四、生成器的 return 值

\`return\` 在生成器里用来结束生成器，返回值会放在 \`StopIteration.value\`：

\`\`\`python
def gen_with_return():
    """带返回值的生成器。"""
    yield 1
    yield 2
    return "完成"
    yield 3  # 不会执行

gen = gen_with_return()
print(next(gen))  # 1
print(next(gen))  # 2
try:
    next(gen)
except StopIteration as e:
    # return 的值在异常对象里
    print(f"返回值: {e.value}")

# yield from 也能拿到内层的 return 值
def outer():
    result = yield from gen_with_return()
    # result 是内层的 return 值
    yield f"外层收到: {result}"

print(list(outer()))
\`\`\`

### 十五、生成器实战：日志分析

\`\`\`python
import tempfile
import os

# 模拟日志文件
log_content = """
2026-01-01 10:00:00 INFO 用户登录: alice
2026-01-01 10:01:00 WARNING 查询慢: 1.2s
2026-01-01 10:02:00 INFO 用户登录: bob
2026-01-01 10:03:00 ERROR 数据库连接失败
2026-01-01 10:04:00 INFO 用户登出: alice
2026-01-01 10:05:00 WARNING 查询慢: 2.1s
2026-01-01 10:06:00 ERROR 文件未找到
"""

# 写临时文件
with tempfile.NamedTemporaryFile(mode='w', suffix='.log',
                                  delete=False, encoding='utf-8') as f:
    f.write(log_content.strip())
    log_path = f.name

# 用生成器管道分析日志
def read_lines(path):
    """逐行读文件。"""
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            yield line.strip()

def parse_log(lines):
    """解析每行。"""
    for line in lines:
        if not line:
            continue
        parts = line.split(maxsplit=3)
        if len(parts) >= 4:
            yield {
                "timestamp": " ".join(parts[:2]),
                "level": parts[2],
                "message": parts[3]
            }

def filter_level(logs, level):
    """过滤指定级别。"""
    for log in logs:
        if log["level"] == level:
            yield log

# 构建管道：读 → 解析 → 过滤 ERROR
pipeline = filter_level(
    parse_log(read_lines(log_path)),
    "ERROR"
)

# 消费
print("=== 错误日志 ===")
for log in pipeline:
    print(f"  {log['timestamp']} - {log['message']}")

# 重新统计所有级别
from collections import Counter
all_logs = parse_log(read_lines(log_path))
counter = Counter(log["level"] for log in all_logs)
print(f"\\n=== 统计 ===")
for level, count in counter.most_common():
    print(f"  {level}: {count}")

os.unlink(log_path)
\`\`\`

### 十六、生成器与 with 语句

\`\`\`python
from contextlib import contextmanager
import time

@contextmanager
def timed(name):
    """用生成器实现的上下文管理器。"""
    start = time.perf_counter()
    try:
        # yield 之前的代码相当于 __enter__
        yield {"name": name, "start": start}
    finally:
        # yield 之后的代码相当于 __exit__
        elapsed = time.perf_counter() - start
        print(f"  [{name}] 耗时 {elapsed:.3f}s")

# 使用
with timed("数据处理") as ctx:
    # ctx 是 yield 的值
    print(f"  开始 {ctx['name']}")
    total = sum(range(1000000))

print(f"  结果: {total}")
\`\`\`

### 十七、生成器的递归

\`\`\`python
def tree_traverse(node, depth=0):
    """递归遍历树结构。"""
    yield (depth, node["name"])
    for child in node.get("children", []):
        # 递归用 yield from
        yield from tree_traverse(child, depth + 1)

# 测试数据
tree = {
    "name": "root",
    "children": [
        {
            "name": "child1",
            "children": [
                {"name": "grandchild1"},
                {"name": "grandchild2"}
            ]
        },
        {
            "name": "child2",
            "children": [
                {"name": "grandchild3"}
            ]
        }
    ]
}

# 遍历
print("=== 树遍历 ===")
for depth, name in tree_traverse(tree):
    indent = "  " * depth
    print(f"{indent}- {name}")
\`\`\`

### 十八、生成器实战：分页读取

\`\`\`python
def paginate(items, page_size):
    """分页生成器。"""
    for i in range(0, len(items), page_size):
        yield items[i:i + page_size]

data = list(range(1, 26))  # 1-25
print("=== 分页 ===")
for i, page in enumerate(paginate(data, 5), 1):
    print(f"  第 {i} 页: {page}")

# 模拟数据库分页查询
def query_page(page_num, page_size):
    """模拟数据库查询。"""
    # 实际场景：SELECT ... LIMIT page_size OFFSET (page_num-1)*page_size
    start = (page_num - 1) * page_size
    end = start + page_size
    return list(range(start + 1, end + 1))

def all_pages(page_size, max_pages=100):
    """遍历所有页。"""
    for page_num in range(1, max_pages + 1):
        page = query_page(page_num, page_size)
        if not page:
            break
        yield page

# 使用
print("\\n=== 数据库分页 ===")
for i, page in enumerate(all_pages(10, 3), 1):
    print(f"  第 {i} 页: {page}")
\`\`\`

### 十九、生成器的内存优势实战

\`\`\`python
# 模拟处理大日志文件（不实际创建大文件）
import sys

def read_lines_simulated(n):
    """模拟读取 n 行日志。"""
    for i in range(n):
        yield f"line {i}: INFO some message"

# 用生成器：内存恒定
n = 1000000
gen = read_lines_simulated(n)

# 处理第一行
first = next(gen)
print(f"第一行: {first}")
print(f"生成器大小: {sys.getsizeof(gen)} 字节")

# 处理所有
count = 0
for line in read_lines_simulated(n):
    count += 1
    if count >= 1000000:
        break

print(f"处理了 {count} 行")
print(f"内存占用: {sys.getsizeof(gen)} 字节（恒定）")

# 对比：如果用 list，会占用大量内存
# estimated = sys.getsizeof(list(range(1000000)))  # 约 8MB
# 但生成器只占 ~200 字节
\`\`\`

### 二十、综合实战：流式 ETL 管道

\`\`\`python
import json
import tempfile
import os
from datetime import datetime

# 模拟原始数据（JSON Lines 格式）
raw_data = [
    '{"id": 1, "name": "Alice", "age": 25, "city": "Beijing"}',
    '{"id": 2, "name": "Bob", "age": 30, "city": "Shanghai"}',
    '{"id": 3, "name": "Charlie", "age": 35, "city": "Guangzhou"}',
    '{"id": 4, "name": "Diana", "age": 28, "city": "Beijing"}',
    '{"id": 5, "name": "Eve", "age": 22, "city": "Shanghai"}',
]

# 写到临时文件
with tempfile.NamedTemporaryFile(mode='w', suffix='.jsonl',
                                  delete=False, encoding='utf-8') as f:
    for line in raw_data:
        f.write(line + "\\n")
    input_path = f.name

# ETL 管道：Extract → Transform → Load

def extract(path):
    """Extract: 读取原始数据。"""
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                yield json.loads(line)

def transform(records):
    """Transform: 数据转换。"""
    for record in records:
        # 添加处理时间
        record["processed_at"] = datetime.now().isoformat()
        # 标准化城市名
        record["city"] = record["city"].upper()
        # 添加年龄段
        if record["age"] < 25:
            record["age_group"] = "young"
        elif record["age"] < 35:
            record["age_group"] = "middle"
        else:
            record["age_group"] = "senior"
        yield record

def filter_city(records, city):
    """Filter: 只保留指定城市。"""
    for record in records:
        if record["city"] == city.upper():
            yield record

def load(records, output_path):
    """Load: 写入输出文件。"""
    with open(output_path, 'w', encoding='utf-8') as f:
        for record in records:
            f.write(json.dumps(record, ensure_ascii=False) + "\\n")

# 构建并执行 ETL 管道
output_path = input_path + ".out"

# 流式处理：内存只占当前记录
pipeline = filter_city(
    transform(extract(input_path)),
    "BEIJING"
)

# Load 阶段直接消费管道
load(pipeline, output_path)

# 验证结果
print("=== 处理结果 ===")
with open(output_path, 'r', encoding='utf-8') as f:
    for line in f:
        record = json.loads(line)
        print(f"  {record['name']} ({record['age_group']}): {record['city']}")

# 清理
os.unlink(input_path)
os.unlink(output_path)
\`\`\`

## 小结

- ⭐ \`yield\` 暂停函数并返回值；\`next()\` 恢复执行。
- ⭐ \`send(value)\` 向 yield 表达式传值，让生成器变成协程。
- ⭐ \`yield from\` 委托另一个生成器，自动转发 yield 和 send。
- ⭐ \`throw()\` 向生成器抛异常；\`close()\` 关闭生成器，触发 \`GeneratorExit\`。
- ⭐ 生成器 \`return\` 的值放在 \`StopIteration.value\`。
- ⭐ 生成器管道：用函数组合多阶段数据处理，**内存恒定**。
- ⭐ 无限生成器配合 \`islice\` / \`takewhile\` 控制取值。
- ⭐ 生成器表达式：\`(x for x in ...)\`，惰性求值，内存友好。
- 实战场景：日志分析、流式 ETL、分页查询、树遍历、大文件处理。
- \`contextlib.contextmanager\` 用生成器实现上下文管理器。

下一章讲 \`itertools\` 模块——迭代器的瑞士军刀，提供各种组合、过滤、分组的工具。`,
  },

  // ============================================================
  // 第五十四章 itertools 完全指南
  // ============================================================
  {
    id: 'py10-ch54',
    group: '第十一部分 装饰器与迭代器',
    icon: '🧰',
    title: '第五十四章 itertools 完全指南',
    content: `## 第五十四章 itertools 完全指南

\`itertools\` 是 Python 标准库里最被低估的模块之一——它提供了一组**高效、内存友好**的迭代器工具，让你用最少的代码完成复杂的数据操作。这一章把所有常用函数讲清楚。

### 一、itertools 简介

\`itertools\` 提供"迭代器构造器"——返回迭代器的函数：

\`\`\`python
import itertools

# 查看模块包含的名字
names = [n for n in dir(itertools) if not n.startswith('_')]
print(f"itertools 函数数: {len(names)}")
# 主要分三类：
# 1. 无限迭代器：count, cycle, repeat
# 2. 有限迭代器：chain, islice, takewhile, ...
# 3. 组合迭代器：product, permutations, combinations, ...
\`\`\`

### 二、chain 串联多个迭代器

\`\`\`python
from itertools import chain

# 把多个迭代器串联成一个
result = list(chain([1, 2], [3, 4], [5, 6]))
print(result)  # [1, 2, 3, 4, 5, 6]

# chain.from_iterable 接收一个可迭代对象的可迭代对象
lists = [[1, 2], [3, 4], [5, 6]]
result = list(chain.from_iterable(lists))
print(result)

# 实际应用：展平嵌套列表
nested = [[1, 2], [3, [4, 5]], [6]]
# 注意：chain 只展平一层
flat = list(chain.from_iterable(nested))
print(f"展平一层: {flat}")

# 不同类型也能串联
mixed = chain("abc", [1, 2, 3], range(3))
print(f"混合: {list(mixed)}")
\`\`\`

### 三、combinations 组合

\`\`\`python
from itertools import combinations

# 从 n 个元素中取 k 个的所有组合（不考虑顺序）
items = ['A', 'B', 'C', 'D']
combos = list(combinations(items, 2))
print(f"2 组合: {combos}")
# [('A','B'), ('A','C'), ('A','D'), ('B','C'), ('B','D'), ('C','D')]

# 三组合
combos3 = list(combinations(items, 3))
print(f"3 组合: {combos3}")

# 组合数 = C(n, k) = n! / (k! * (n-k)!)
import math
print(f"C(4,2) = {math.comb(4, 2)}")  # 6

# 应用：找出所有两两组合
students = ["张三", "李四", "王五", "赵六"]
pairs = list(combinations(students, 2))
print(f"\\n两两组合 ({len(pairs)} 对):")
for a, b in pairs:
    print(f"  {a} - {b}")
\`\`\`

### 四、combinations_with_replacement 可重复组合

\`\`\`python
from itertools import combinations_with_replacement

# 允许元素重复使用
items = ['A', 'B', 'C']
result = list(combinations_with_replacement(items, 2))
print(f"可重复 2 组合: {result}")
# [('A','A'), ('A','B'), ('A','C'), ('B','B'), ('B','C'), ('C','C')]

# 应用：多项式展开的系数
# (a + b + c)^2 = a^2 + b^2 + c^2 + 2ab + 2ac + 2bc
terms = list(combinations_with_replacement(['a', 'b', 'c'], 2))
print(f"多项式项: {terms}")
\`\`\`

### 五、permutations 排列

\`\`\`python
from itertools import permutations

# 排列：考虑顺序
items = ['A', 'B', 'C']

# 全排列（n! 个）
perms = list(permutations(items))
print(f"全排列 ({len(perms)} 个):")
for p in perms:
    print(f"  {p}")

# 取 k 个的排列
perms2 = list(permutations(items, 2))
print(f"\\n2 排列 ({len(perms2)} 个):")
for p in perms2:
    print(f"  {p}")

# 排列数 = P(n, k) = n! / (n-k)!
import math
print(f"\\nP(3, 2) = {math.perm(3, 2)}")  # 6
\`\`\`

### 六、product 笛卡尔积

\`\`\`python
from itertools import product

# 多个集合的所有组合
colors = ['红', '绿']
sizes = ['S', 'M', 'L']

# 笛卡尔积 = 所有可能的组合
result = list(product(colors, sizes))
print(f"颜色×尺码: {result}")
# 6 个组合：('红','S'), ('红','M'), ('红','L'), ('绿','S'), ...

# 等价于嵌套循环
nested = [(c, s) for c in colors for s in sizes]
print(f"嵌套循环: {nested}")
# product 更简洁

# 重复笛卡尔积（自己和自己）
# 模拟掷两个骰子
dice = product(range(1, 7), repeat=2)
print(f"\\n骰子组合 ({len(list(dice))} 种)")

# 应用：密码爆破
import string
# 4 位数字密码的所有可能
# passwords = product('0123456789', repeat=4)
# print(f"4 位密码数: {len(list(passwords))}")  # 10000
\`\`\`

### 七、compress 按选择器过滤

\`\`\`python
from itertools import compress

# 用一个布尔序列选择元素
data = ['a', 'b', 'c', 'd', 'e']
selectors = [True, False, True, False, True]

# 只保留对应位置为 True 的元素
result = list(compress(data, selectors))
print(result)  # ['a', 'c', 'e']

# 应用：根据条件过滤
def filter_with_mask(items, mask_func):
    """根据布尔函数过滤。"""
    # 生成选择器
    mask = [mask_func(x) for x in items]
    return list(compress(items, mask))

numbers = [1, 2, 3, 4, 5, 6]
evens = filter_with_mask(numbers, lambda x: x % 2 == 0)
print(f"偶数: {evens}")
\`\`\`

### 八、count 无限计数

\`\`\`python
from itertools import count, islice

# count 从 start 开始，每次加 step，无限生成
counter = count(10, 2)  # 从 10 开始，步长 2
print(list(islice(counter, 5)))  # [10, 12, 14, 16, 18]

# 默认从 0 开始，步长 1
default = count()
print(list(islice(default, 3)))  # [0, 1, 2]

# 用作 enumerate 的替代
words = ['a', 'b', 'c']
numbered = list(zip(count(1), words))
print(f"带编号: {numbered}")

# 浮点数步长（小心精度问题）
floats = count(0.0, 0.1)
print(list(islice(floats, 5)))  # [0.0, 0.1, 0.2, 0.3, 0.4]
\`\`\`

### 九、cycle 循环

\`\`\`python
from itertools import cycle, islice

# cycle 让有限迭代器变成无限的
colors = cycle(['红', '绿', '蓝'])

# 取前 7 个（会循环）
print(list(islice(colors, 7)))

# 应用：轮询
servers = ['server1', 'server2', 'server3']
server_pool = cycle(servers)
for i in range(5):
    server = next(server_pool)
    print(f"  请求 {i+1} → {server}")

# 应用：交替输出
import string
for i, c in zip(range(5), cycle('AB')):
    print(f"  {i}{c}", end=" ")
print()
\`\`\`

### 十、dropwhile 跳过直到条件不满足

\`\`\`python
from itertools import dropwhile

# dropwhile：跳过开头满足条件的元素，从第一个不满足的开始保留
numbers = [1, 3, 5, 7, 2, 4, 6, 8]

# 跳过开头的奇数，从第一个偶数开始保留
result = list(dropwhile(lambda x: x % 2 == 1, numbers))
print(result)  # [2, 4, 6, 8]
# 注意：2 之后的奇数也不会被跳过

# 对比 filter：filter 是全局过滤
filtered = list(filter(lambda x: x % 2 == 0, numbers))
print(filtered)  # [2, 4, 6, 8]（结果相同但语义不同）

# 不同语义的例子
numbers = [1, 3, 5, 2, 4, 6, 3, 5]
# dropwhile 只跳过开头的奇数段
result = list(dropwhile(lambda x: x % 2 == 1, numbers))
print(result)  # [2, 4, 6, 3, 5]
\`\`\`

### 十一、takewhile 取直到条件不满足

\`\`\`python
from itertools import takewhile

# takewhile：取开头满足条件的元素，遇到第一个不满足时停止
numbers = [2, 4, 6, 8, 1, 3, 5]

# 取开头的偶数
result = list(takewhile(lambda x: x % 2 == 0, numbers))
print(result)  # [2, 4, 6, 8]

# 应用：从无限生成器取有限
from itertools import count
evens = (x for x in count() if x % 2 == 0)
small_evens = list(takewhile(lambda x: x < 10, evens))
print(f"小于 10 的偶数: {small_evens}")

# takewhile 和 dropwhile 互补
numbers = [1, 2, 3, 4, 5, 1, 2, 3]
first_part = list(takewhile(lambda x: x < 4, numbers))
rest = list(dropwhile(lambda x: x < 4, numbers))
print(f"前段: {first_part}")  # [1, 2, 3]
print(f"后段: {rest}")        # [4, 5, 1, 2, 3]
\`\`\`

### 十二、filterfalse 反向过滤

\`\`\`python
from itertools import filterfalse

# filterfalse：保留不满足条件的元素（与 filter 相反）
numbers = [1, 2, 3, 4, 5, 6]

# filter 保留偶数
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(f"偶数: {evens}")

# filterfalse 保留奇数
odds = list(filterfalse(lambda x: x % 2 == 0, numbers))
print(f"奇数: {odds}")

# 应用：分离真假
def partition(predicate, iterable):
    """把可迭代对象分成两部分。"""
    items = list(iterable)
    true_part = [x for x in items if predicate(x)]
    false_part = [x for x in items if not predicate(x)]
    return true_part, false_part

# 简化版用 filterfalse
def partition_it(predicate, iterable):
    """用 filter 和 filterfalse 分离。"""
    return filter(predicate, iterable), filterfalse(predicate, iterable)

numbers = [1, 2, 3, 4, 5, 6]
evens, odds = partition_it(lambda x: x % 2 == 0, numbers)
print(f"\\n偶数: {list(evens)}")
print(f"奇数: {list(odds)}")
\`\`\`

### 十三、groupby 分组

\`\`\`python
from itertools import groupby

# groupby 把连续相同的元素分组
# 注意：必须先排序，因为只分组连续相同的

# 简单例子
data = [1, 1, 2, 2, 2, 3, 1, 1]
for key, group in groupby(data):
    print(f"  {key}: {list(group)}")

# 按属性分组
students = [
    {"name": "张三", "grade": "A"},
    {"name": "李四", "grade": "B"},
    {"name": "王五", "grade": "A"},
    {"name": "赵六", "grade": "B"},
    {"name": "钱七", "grade": "A"},
]

# 必须先按 grade 排序，否则不会正确分组
sorted_students = sorted(students, key=lambda s: s["grade"])
for grade, group in groupby(sorted_students, key=lambda s: s["grade"]):
    print(f"\\n{grade} 等级:")
    for s in group:
        print(f"  - {s['name']}")
\`\`\`

### 十四、islice 切片

\`\`\`python
from itertools import islice

# islice 对迭代器切片，不创建新列表
# 语法：islice(iterable, [start,] stop, [step])

# 前 5 个
print(list(islice(range(100), 5)))

# 跳过前 3 个，取 3 个
print(list(islice(range(10), 3, 6)))

# 步长 2
print(list(islice(range(10), 0, 10, 2)))

# 用 None 表示无限
print(list(islice(range(10), 5, None)))  # 从第 5 个到末尾

# 应用：处理大文件前 100 行
# with open("big.txt") as f:
#     for line in islice(f, 100):
#         process(line)

# 用 islice 实现 head 命令
def head(iterable, n=10):
    """取前 n 个。"""
    return list(islice(iterable, n))

print(head(range(100), 5))
\`\`\`

### 十五、starmap 解包参数后调用

\`\`\`python
from itertools import starmap

# starmap：把每个元素解包后作为参数调用函数
# 普通map：每个元素整体作为参数
# starmap：每个元素解包后作为多个参数

# 计算多个数的幂
data = [(2, 3), (3, 2), (10, 3)]  # (base, exp)
# 用 map 要写成 lambda
# map(lambda x: x[0] ** x[1], data)
# 用 starmap 更简洁
result = list(starmap(pow, data))
print(result)  # [8, 9, 1000]

# 应用：批量调用函数
operations = [
    (lambda a, b: a + b, 3, 5),
    (lambda a, b: a * b, 3, 5),
    (lambda a, b: a - b, 10, 3),
]
# 不能直接 starmap（因为函数也在元组里）
# 但可以这样：
funcs = [(lambda a, b: a + b, (3, 5)),
         (lambda a, b: a * b, (3, 5))]
for func, args in funcs:
    print(func(*args))

# 实际应用：批量计算
points = [(1, 2), (3, 4), (5, 12)]
# 计算每个点到原点的距离
distances = list(starmap(lambda x, y: (x**2 + y**2) ** 0.5, points))
print(f"距离: {distances}")
\`\`\`

### 十六、tee 复制迭代器

\`\`\`python
from itertools import tee

# tee 把一个迭代器复制成多个独立的迭代器
# 注意：原迭代器消耗后不能再用

original = iter([1, 2, 3, 4, 5])
# 复制成 2 个
it1, it2 = tee(original, 2)

print(f"it1: {list(it1)}")  # [1, 2, 3, 4, 5]
print(f"it2: {list(it2)}")  # [1, 2, 3, 4, 5]

# 应用：同时遍历同一个迭代器的不同位置
def pairwise(iterable):
    """相邻元素配对。"""
    a, b = tee(iterable)
    # 让 b 前进一步
    next(b, None)
    # 配对
    return zip(a, b)

numbers = [1, 2, 3, 4, 5]
pairs = list(pairwise(numbers))
print(f"相邻对: {pairs}")
# [(1, 2), (2, 3), (3, 4), (4, 5)]
\`\`\`

### 十七、zip_longest 长度对齐的 zip

\`\`\`python
from itertools import zip_longest

# 普通 zip 在最短的迭代器结束时停止
print(list(zip([1, 2, 3], ['a', 'b'])))
# [(1, 'a'), (2, 'b')]（少了 3）

# zip_longest 用 fillvalue 填充
result = list(zip_longest([1, 2, 3], ['a', 'b'], fillvalue='?'))
print(result)
# [(1, 'a'), (2, 'b'), (3, '?')]

# 多个不等长迭代器
a = [1, 2, 3, 4, 5]
b = ['a', 'b']
c = [True, False, True, False]

result = list(zip_longest(a, b, c, fillvalue=None))
for item in result:
    print(f"  {item}")

# 应用：表格对齐
headers = ['name', 'age', 'city']
rows = [
    ['张三', 25],
    ['李四', 30, '北京'],
    ['王五'],
]

print("\\n表格:")
for row in rows:
    aligned = list(zip_longest(headers, row, fillvalue=''))
    print(f"  {aligned}")
\`\`\`

### 十八、accumulate 累积

\`\`\`python
from itertools import accumulate
import operator

# accumulate 累积计算（默认加法）
numbers = [1, 2, 3, 4, 5]
result = list(accumulate(numbers))
print(f"累积和: {result}")  # [1, 3, 6, 10, 15]

# 用其他运算符：累积乘积
result = list(accumulate(numbers, operator.mul))
print(f"累积积: {result}")  # [1, 2, 6, 24, 120]

# 自定义函数：累积最大值
result = list(accumulate(numbers, max))
print(f"累积最大: {result}")  # [1, 2, 3, 4, 5]

# 实际数据
prices = [10, 12, 8, 15, 20, 5]
# 计算历史最高价
running_max = list(accumulate(prices, max))
print(f"\\n历史最高价: {running_max}")

# 计算移动和（窗口为 3）
def moving_sum(iterable, window):
    """滑动窗口和。"""
    result = []
    acc = list(accumulate(iterable))
    for i, total in enumerate(acc):
        if i < window:
            result.append(total)
        else:
            result.append(total - acc[i - window])
    return result

data = [1, 2, 3, 4, 5, 6, 7]
print(f"滑动和(3): {moving_sum(data, 3)}")
\`\`\`

### 十九、综合实战 1：排列组合应用

\`\`\`python
from itertools import permutations, combinations, product

# 场景 1：密码组合
# 4 位数字密码
passwords_4digit = list(product('0123456789', repeat=4))
print(f"4 位数字密码数: {len(passwords_4digit)}")  # 10000

# 场景 2：扑克牌
ranks = '23456789TJQKA'
suits = '♠♥♦♣'
deck = list(product(ranks, suits))
print(f"扑克牌数: {len(deck)}")  # 52

# 5 张牌的所有组合
poker_hands = list(combinations(deck, 5))
print(f"5 张牌组合数: {len(poker_hands)}")  # 2598960

# 场景 3：会议座位安排
people = ['张', '李', '王', '赵']
# 圆桌排列（n-1)! 种
seatings = list(permutations(people))
print(f"\\n座位安排数: {len(seatings)}")

# 场景 4：多维度参数组合
# 机器学习超参数搜索
learning_rates = [0.001, 0.01, 0.1]
batch_sizes = [32, 64, 128]
optimizers = ['adam', 'sgd']

configs = list(product(learning_rates, batch_sizes, optimizers))
print(f"\\n超参数组合数: {len(configs)}")
for lr, bs, opt in configs[:3]:
    print(f"  lr={lr}, batch={bs}, optimizer={opt}")
\`\`\`

### 二十、综合实战 2：滑动窗口

\`\`\`python
from itertools import islice, tee
from collections import deque

# 滑动窗口：在序列上滑动固定大小的窗口
def sliding_window(iterable, n):
    """滑动窗口（迭代器版）。"""
    it = iter(iterable)
    # 用 deque 缓存窗口，maxlen 保证只保留 n 个
    window = deque(islice(it, n), maxlen=n)
    if len(window) == n:
        yield tuple(window)
    for x in it:
        window.append(x)
        yield tuple(window)

# 测试
data = [1, 2, 3, 4, 5, 6, 7, 8]
print("=== 滑动窗口 (size=3) ===")
for window in sliding_window(data, 3):
    print(f"  {window}")

# 应用：移动平均
def moving_average(iterable, window_size):
    """计算移动平均。"""
    for window in sliding_window(iterable, window_size):
        yield sum(window) / len(window)

prices = [10, 12, 11, 13, 15, 14, 16, 18, 17, 19]
print("\\n=== 5 日移动平均 ===")
for avg in moving_average(prices, 5):
    print(f"  {avg:.2f}")

# 应用：检测上升序列
def is_increasing(window):
    """窗口内是否递增。"""
    return all(window[i] < window[i+1] for i in range(len(window)-1))

data = [1, 3, 5, 4, 6, 8, 10, 7]
print("\\n=== 连续 3 天上涨 ===")
for window in sliding_window(data, 3):
    if is_increasing(window):
        print(f"  上涨: {window}")
\`\`\`

### 二十一、综合实战 3：分组统计

\`\`\`python
from itertools import groupby
from collections import defaultdict

# 场景：按多个维度统计
sales = [
    {"date": "2026-01-01", "product": "A", "amount": 100},
    {"date": "2026-01-01", "product": "B", "amount": 150},
    {"date": "2026-01-01", "product": "A", "amount": 80},
    {"date": "2026-01-02", "product": "A", "amount": 120},
    {"date": "2026-01-02", "product": "B", "amount": 90},
    {"date": "2026-01-02", "product": "A", "amount": 200},
]

# 按日期分组求和
sorted_by_date = sorted(sales, key=lambda x: x["date"])
daily_total = {}
for date, group in groupby(sorted_by_date, key=lambda x: x["date"]):
    daily_total[date] = sum(item["amount"] for item in group)

print("=== 每日总销售额 ===")
for date, total in daily_total.items():
    print(f"  {date}: {total}")

# 按产品分组
sorted_by_product = sorted(sales, key=lambda x: x["product"])
product_total = {}
for product, group in groupby(sorted_by_product, key=lambda x: x["product"]):
    product_total[product] = sum(item["amount"] for item in group)

print("\\n=== 产品总销售额 ===")
for product, total in product_total.items():
    print(f"  {product}: {total}")

# 多级分组：先按日期，再按产品
sorted_multi = sorted(sales, key=lambda x: (x["date"], x["product"]))
print("\\n=== 每日每产品销售额 ===")
for date, date_group in groupby(sorted_multi, key=lambda x: x["date"]):
    for product, product_group in groupby(date_group, key=lambda x: x["product"]):
        total = sum(item["amount"] for item in product_group)
        print(f"  {date} {product}: {total}")
\`\`\`

### 二十二、性能对比

\`\`\`python
import time
from itertools import chain, islice

# 对比 chain 和列表相加的性能
n = 10000
lists = [list(range(100)) for _ in range(n)]

# 方法 1：用 + 拼接（创建大量中间列表）
start = time.perf_counter()
result = []
for lst in lists:
    result = result + lst
list_plus_time = time.perf_counter() - start

# 方法 2：用 extend
start = time.perf_counter()
result = []
for lst in lists:
    result.extend(lst)
extend_time = time.perf_counter() - start

# 方法 3：用 chain（惰性，不创建列表）
start = time.perf_counter()
result = list(chain.from_iterable(lists))
chain_time = time.perf_counter() - start

print(f"+ 拼接: {list_plus_time:.3f}s")
print(f"extend: {extend_time:.3f}s")
print(f"chain: {chain_time:.3f}s")

# 结论：chain 在内存和时间上都更优
\`\`\`

## 小结

- ⭐ \`chain\` 串联 / \`chain.from_iterable\` 展平一层嵌套。
- ⭐ \`combinations\` 组合（无序）/ \`permutations\` 排列（有序）/ \`product\` 笛卡尔积。
- ⭐ \`combinations_with_replacement\` 允许重复的组合。
- ⭐ \`count\` / \`cycle\` / \`repeat\` 三个无限迭代器。
- ⭐ \`islice\` 切片 / \`takewhile\` 取直到 / \`dropwhile\` 跳过直到。
- ⭐ \`filterfalse\` 反向过滤 / \`compress\` 按选择器过滤。
- ⭐ \`starmap\` 解包参数后调用 / \`accumulate\` 累积。
- ⭐ \`groupby\` 分组（**必须先排序**）/ \`tee\` 复制迭代器 / \`zip_longest\` 长度对齐。
- 实战：密码爆破、超参数搜索、滑动窗口、分组统计、移动平均。
- \`itertools\` 函数都是**惰性**的，内存友好，适合大数据流处理。

下一章讲 \`functools\` 模块——\`lru_cache\`、\`partial\`、\`reduce\`、\`singledispatch\` 等函数工具。`,
  },

  // ============================================================
  // 第五十五章 functools 与函数工具
  // ============================================================
  {
    id: 'py10-ch55',
    group: '第十一部分 装饰器与迭代器',
    icon: '🛠️',
    title: '第五十五章 functools 与函数工具',
    content: `## 第五十五章 functools 与函数工具

\`functools\` 是 Python 函数式编程的核心模块——缓存、偏函数、归约、分派，全是日常高频工具。这一章把所有常用功能讲清楚。

### 一、lru_cache LRU 缓存

\`lru_cache\` 自动缓存函数结果（基于参数）：

\`\`\`python
from functools import lru_cache
import time

@lru_cache(maxsize=128)
def expensive_computation(n):
    """模拟耗时计算。"""
    print(f"  → 计算 {n}...")
    time.sleep(0.5)
    return n * 2

# 第一次：会计算
print(expensive_computation(5))  # 0.5s
# 第二次：直接从缓存返回
print(expensive_computation(5))  # 瞬间

# 查看缓存信息
print(expensive_computation.cache_info())
# CacheInfo(hits=1, misses=1, maxsize=128, currsize=1)

# 清空缓存
expensive_computation.cache_clear()

# 注意事项：
# 1. 参数必须可哈希（list/dict/set 不行）
# 2. maxsize=None 表示无限缓存
# 3. maxsize 应该是 2 的幂（性能优化）
\`\`\`

### 二、lru_cache 实战：斐波那契

\`\`\`python
from functools import lru_cache
import time

# 不缓存：指数级慢
def fib_slow(n):
    if n < 2:
        return n
    return fib_slow(n-1) + fib_slow(n-2)

# 缓存：线性快
@lru_cache(maxsize=None)
def fib_fast(n):
    if n < 2:
        return n
    return fib_fast(n-1) + fib_fast(n-2)

# 性能对比
start = time.perf_counter()
result1 = fib_slow(30)
slow_time = time.perf_counter() - start

start = time.perf_counter()
result2 = fib_fast(30)
fast_time = time.perf_counter() - start

print(f"慢版: {result1} ({slow_time:.3f}s)")
print(f"快版: {result2} ({fast_time:.6f}s)")
print(f"加速: {slow_time/fast_time:.0f}x")

# 查看缓存了多少个不同的 n
print(f"\\n缓存大小: {fib_fast.cache_info()}")
\`\`\`

### 三、cache（Python 3.9+）

\`cache\` 是 \`lru_cache(maxsize=None)\` 的简写：

\`\`\`python
import sys
print(f"Python 版本: {sys.version_info[:2]}")

if sys.version_info >= (3, 9):
    from functools import cache

    @cache
    def factorial(n):
        """阶乘（带缓存）。"""
        if n < 2:
            return 1
        return n * factorial(n - 1)

    print(factorial(10))  # 3628800
    print(factorial.cache_info())

    # cache 等价于 lru_cache(maxsize=None)
    # 适合：参数范围有限、计算昂贵的函数
else:
    from functools import lru_cache
    # 旧版本用 lru_cache(maxsize=None) 替代
    @lru_cache(maxsize=None)
    def factorial(n):
        if n < 2:
            return 1
        return n * factorial(n - 1)

    print(factorial(10))
\`\`\`

### 四、cached_property（Python 3.8+）

\`cached_property\` 把方法缓存成属性，**只计算一次**：

\`\`\`python
import sys
if sys.version_info >= (3, 8):
    from functools import cached_property
else:
    from cached_property import cached_property  # 第三方库

import time

class DataProcessor:
    def __init__(self, data):
        self.data = data

    @cached_property
    def expensive_stat(self):
        """计算昂贵的统计量（只算一次）。"""
        print("  → 计算中...")
        time.sleep(0.5)
        return {
            "count": len(self.data),
            "sum": sum(self.data),
            "avg": sum(self.data) / len(self.data)
        }

processor = DataProcessor([1, 2, 3, 4, 5])

# 第一次访问：会计算
print(processor.expensive_stat)

# 第二次访问：直接返回缓存的值
print(processor.expensive_stat)

# 清除缓存（重新计算）
# del processor.expensive_stat
\`\`\`

### 五、partial 偏函数

\`partial\` 固定函数的部分参数，返回新函数：

\`\`\`python
from functools import partial

# 原始函数
def power(base, exponent):
    return base ** exponent

# 用 partial 固定 exponent
square = partial(power, exponent=2)
cube = partial(power, exponent=3)

print(square(5))  # 25
print(cube(3))    # 27

# 实际应用：创建配置好的函数
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app")

# 创建一个已经配置好级别的 logger 函数
info_logger = partial(logger.log, logging.INFO)
error_logger = partial(logger.log, logging.ERROR)

info_logger("这是一般信息")
error_logger("这是错误信息")

# 应用：简化函数调用
def greet(greeting, name, punctuation="!"):
    return f"{greeting}, {name}{punctuation}"

# 创建几个常用变体
hello = partial(greet, "Hello")
hi = partial(greet, "Hi", punctuation="?")

print(hello("张三"))
print(hi("李四"))
\`\`\`

### 六、partial 实战

\`\`\`python
from functools import partial
from functools import reduce

# 应用 1：把方法转成函数
class StringProcessor:
    def process(self, text, mode="upper"):
        if mode == "upper":
            return text.upper()
        elif mode == "lower":
            return text.lower()
        elif mode == "title":
            return text.title()

processor = StringProcessor()
# 把方法绑定为偏函数
to_upper = partial(processor.process, mode="upper")
to_lower = partial(processor.process, mode="lower")
to_title = partial(processor.process, mode="title")

print(to_upper("hello world"))
print(to_lower("HELLO WORLD"))
print(to_title("hello world"))

# 应用 2：配置默认参数
def connect(host, port, timeout, retry):
    """连接数据库（简化）。"""
    return f"连接 {host}:{port} (timeout={timeout}, retry={retry})"

# 创建几个预设的连接函数
connect_prod = partial(connect, host="prod.db.example.com", port=5432)
connect_dev = partial(connect, host="localhost", port=5433, timeout=5)

print(connect_prod(timeout=10, retry=3))
print(connect_dev(retry=1))
\`\`\`

### 七、partialmethod（Python 3.4+）

\`partialmethod\` 类似 \`partial\`，但用于类的方法：

\`\`\`python
from functools import partialmethod

class Button:
    def __init__(self, label):
        self.label = label
        self.clicks = 0

    def _click(self, count=1):
        """内部点击方法。"""
        self.clicks += count
        print(f"  {self.label}: 点击 {count} 次 (总 {self.clicks})")

    # 用 partialmethod 创建预设的变体
    click_once = partialmethod(_click, count=1)
    click_twice = partialmethod(_click, count=2)
    click_thrice = partialmethod(_click, count=3)

btn = Button("提交")
btn.click_once()
btn.click_twice()
btn.click_thrice()
btn.click_once()
\`\`\`

### 八、reduce 归约

\`reduce\` 把一个二元函数累积应用到序列上：

\`\`\`python
from functools import reduce
import operator

# reduce(func, iterable, initializer)
# 累积计算：func(func(func(initial, x1), x2), x3)...

# 求和
numbers = [1, 2, 3, 4, 5]
total = reduce(operator.add, numbers)
print(f"求和: {total}")  # 15

# 等价于 sum(numbers)
print(f"sum: {sum(numbers)}")

# 求积
product = reduce(operator.mul, numbers)
print(f"求积: {product}")  # 120

# 用 initializer（初始值）
total = reduce(operator.add, numbers, 100)
print(f"加初始值: {total}")  # 115

# 自定义函数：找最大值
def my_max(a, b):
    return a if a > b else b

maximum = reduce(my_max, numbers)
print(f"最大值: {maximum}")

# 应用：展平嵌套列表
nested = [[1, 2], [3, 4], [5, 6]]
flat = reduce(operator.add, nested)
print(f"展平: {flat}")  # [1, 2, 3, 4, 5, 6]
# 但 chain.from_iterable 更高效
\`\`\`

### 九、reduce 实战

\`\`\`python
from functools import reduce

# 应用 1：合并字典
dicts = [{"a": 1}, {"b": 2}, {"c": 3}]
merged = reduce(lambda a, b: {**a, **b}, dicts)
print(f"合并字典: {merged}")

# 应用 2：计算复杂表达式
# 1 + 2 + 3 + ... + 10 = 55
total = reduce(lambda a, b: a + b, range(1, 11))
print(f"1+2+...+10 = {total}")

# 应用 3：字符串拼接
words = ["Hello", "World", "Python"]
sentence = reduce(lambda a, b: f"{a} {b}", words)
print(f"拼接: {sentence}")

# 应用 4：找出最长字符串
strings = ["apple", "banana", "cherry", "date"]
longest = reduce(lambda a, b: a if len(a) >= len(b) else b, strings)
print(f"最长: {longest}")

# 应用 5：流水线处理
def compose(*functions):
    """函数组合：从右到左应用。"""
    def composed(x):
        return reduce(lambda acc, f: f(acc), reversed(functions), x)
    return composed

# 组合多个函数
add_one = lambda x: x + 1
square = lambda x: x ** 2
double = lambda x: x * 2

# (x + 1) → square → double
pipeline = compose(double, square, add_one)
print(f"管道: {pipeline(3)}")  # ((3+1)^2)*2 = 32
\`\`\`

### 十、singledispatch 单分派

\`singledispatch\` 根据第一个参数的类型分派到不同实现：

\`\`\`python
from functools import singledispatch

# 定义分派函数（默认实现）
@singledispatch
def to_json(obj):
    """把对象转成 JSON 字符串。"""
    return f'"{str(obj)}"'  # 默认：转字符串

# 注册针对不同类型的实现
@to_json.register
def _(obj: str):
    """字符串。"""
    return f'"{obj}"'

@to_json.register
def _(obj: int):
    """整数。"""
    return str(obj)

@to_json.register
def _(obj: list):
    """列表。"""
    items = ", ".join(to_json(x) for x in obj)
    return f"[{items}]"

@to_json.register
def _(obj: dict):
    """字典。"""
    items = ", ".join(f'"{k}": {to_json(v)}' for k, v in obj.items())
    return "{" + items + "}"

# 测试
print(to_json(42))
print(to_json("hello"))
print(to_json([1, 2, 3]))
print(to_json({"name": "张三", "age": 25}))
print(to_json([1, "a", {"x": 1}]))
\`\`\`

### 十一、singledispatch 实战

\`\`\`python
from functools import singledispatch
from datetime import datetime, date
from decimal import Decimal

@singledispatch
def serialize(obj):
    """序列化对象为可 JSON 化的结构。"""
    raise TypeError(f"无法序列化 {type(obj).__name__}")

@serialize.register
def _(obj: str):
    return obj

@serialize.register
def _(obj: int):
    return obj

@serialize.register
def _(obj: float):
    return obj

@serialize.register
def _(obj: bool):
    return obj

@serialize.register
def _(obj: datetime):
    return obj.isoformat()

@serialize.register
def _(obj: date):
    return obj.isoformat()

@serialize.register
def _(obj: Decimal):
    return float(obj)

@serialize.register
def _(obj: list):
    return [serialize(x) for x in obj]

@serialize.register
def _(obj: dict):
    return {k: serialize(v) for k, v in obj.items()}

# 测试
import json
data = {
    "name": "张三",
    "birthday": date(1995, 5, 15),
    "created_at": datetime(2026, 1, 1, 12, 0),
    "price": Decimal("19.99"),
    "active": True,
    "tags": ["vip", "active"],
}

result = serialize(data)
print(json.dumps(result, ensure_ascii=False, indent=2))
\`\`\`

### 十二、singledispatchmethod（Python 3.8+）

类方法版本的分派：

\`\`\`python
import sys
if sys.version_info >= (3, 8):
    from functools import singledispatchmethod
else:
    print("需要 Python 3.8+")

class Vector:
    """向量类，支持多种类型的加法。"""
    def __init__(self, x, y):
        self.x = x
        self.y = y

    @singledispatchmethod
    def add(self, other):
        """默认实现：不支持。"""
        raise TypeError(f"不支持与 {type(other).__name__} 相加")

    @add.register
    def _(self, other: 'Vector'):
        """向量 + 向量。"""
        return Vector(self.x + other.x, self.y + other.y)

    @add.register
    def _(self, other: tuple):
        """向量 + 元组。"""
        return Vector(self.x + other[0], self.y + other[1])

    @add.register
    def _(self, other: int):
        """向量 + 标量。"""
        return Vector(self.x + other, self.y + other)

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"

v1 = Vector(1, 2)
print(v1.add(Vector(3, 4)))  # Vector(4, 6)
print(v1.add((10, 20)))      # Vector(11, 22)
print(v1.add(5))             # Vector(6, 7)

# 不支持的类型
try:
    v1.add("string")
except TypeError as e:
    print(f"错误: {e}")
\`\`\`

### 十三、total_ordering 自动补全比较方法

只定义 \`__eq__\` 和一个比较方法，\`total_ordering\` 自动生成其他：

\`\`\`python
from functools import total_ordering

@total_ordering
class Student:
    """学生类，按分数排序。"""
    def __init__(self, name, score):
        self.name = name
        self.score = score

    def __eq__(self, other):
        return self.score == other.score

    def __lt__(self, other):
        return self.score < other.score

    def __repr__(self):
        return f"Student({self.name}, {self.score})"

# total_ordering 自动补全了 __le__, __gt__, __ge__
students = [
    Student("张三", 85),
    Student("李四", 92),
    Student("王五", 78),
    Student("赵六", 92),
]

# 排序
sorted_students = sorted(students)
print("按分数升序:")
for s in sorted_students:
    print(f"  {s}")

# 比较运算
s1 = Student("A", 80)
s2 = Student("B", 90)
print(f"\\n{s1.name} < {s2.name}: {s1 < s2}")
print(f"{s1.name} >= {s2.name}: {s1 >= s2}")
print(f"{s1.name} != {s2.name}: {s1 != s2}")
\`\`\`

### 十四、wraps 复制函数信息

\`\`\`python
from functools import wraps

# 不用 wraps：丢失元信息
def bad_decorator(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@bad_decorator
def func1():
    """func1 的文档。"""
    pass

print(f"不用 wraps:")
print(f"  名字: {func1.__name__}")  # wrapper
print(f"  文档: {func1.__doc__}")   # None

# 用 wraps：保留元信息
def good_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@good_decorator
def func2():
    """func2 的文档。"""
    pass

print(f"\\n用 wraps:")
print(f"  名字: {func2.__name__}")  # func2
print(f"  文档: {func2.__doc__}")   # func2 的文档。

# 查看原始函数
print(f"  原始: {func2.__wrapped__}")
\`\`\`

### 十五、lru_cache 的注意事项

\`\`\`python
from functools import lru_cache

# 注意 1：参数必须可哈希
@lru_cache
def func(x):
    return x

# 这会报错（list 不可哈希）
# func([1, 2, 3])  # TypeError

# 解决：用 tuple 代替 list
print(func((1, 2, 3)))

# 注意 2：缓存的是返回值，不是副作用
call_count = 0

@lru_cache
def side_effect(x):
    global call_count
    call_count += 1
    print(f"  调用 {x}，第 {call_count} 次")
    return x * 2

side_effect(1)
side_effect(1)  # 不会真正调用
side_effect(2)
print(f"实际调用次数: {call_count}")  # 2

# 注意 3：缓存可能过期
# lru_cache 没有 TTL（生存时间）
# 需要定期 cache_clear() 或用第三方库

# 注意 4：maxsize=None 不限制大小
# 适合参数范围有限的情况
# 否则可能内存爆炸

# 注意 5：可变默认参数陷阱
def bad_default(x, cache={}):
    """可变默认参数会被共享。"""
    cache[x] = x * 2
    return cache

print(bad_default(1))
print(bad_default(2))  # cache 已经包含 1
\`\`\`

### 十六、自定义缓存策略

\`\`\`python
from functools import lru_cache
import time

# 实现 TTL 缓存
def ttl_cache(ttl):
    """带 TTL 的缓存装饰器。"""
    def decorator(func):
        cache = {}  # {args: (result, timestamp)}

        @lru_cache
        def wrapper(*args):
            now = time.time()
            # 检查缓存
            if args in cache:
                result, ts = cache[args]
                if now - ts < ttl:
                    return result
            # 缓存未命中或过期
            result = func(*args)
            cache[args] = (result, now)
            return result

        wrapper.cache_clear = lambda: cache.clear()
        return wrapper
    return decorator

# 用法
@ttl_cache(ttl=2.0)
def get_data(key):
    """模拟获取数据。"""
    print(f"  → 实际查询 {key}")
    return f"data_{key}"

# 第一次：查询
print(get_data("user:1"))
# 第二次：缓存命中
print(get_data("user:1"))

# 等 2 秒后过期
print("等待 2.5s...")
time.sleep(2.5)
# 重新查询
print(get_data("user:1"))
\`\`\`

### 十七、reduce 的替代方案

\`\`\`python
# reduce 在 Python 3 里被移到 functools
# 大多数场景有更简洁的写法

from functools import reduce
import operator

numbers = [1, 2, 3, 4, 5]

# 求和
# reduce:
total_reduce = reduce(operator.add, numbers)
# sum 更好：
total_sum = sum(numbers)
print(f"求和: {total_reduce} vs {total_sum}")

# 求积
# reduce:
product_reduce = reduce(operator.mul, numbers)
# 手写循环（更易读）：
product_loop = 1
for n in numbers:
    product_loop *= n
print(f"求积: {product_reduce} vs {product_loop}")

# 找最大
# reduce:
max_reduce = reduce(lambda a, b: a if a > b else b, numbers)
# max 更好：
max_builtin = max(numbers)
print(f"最大: {max_reduce} vs {max_builtin}")

# 合并字典
dicts = [{"a": 1}, {"b": 2}]
# reduce:
merged_reduce = reduce(lambda a, b: {**a, **b}, dicts)
# 字典推导更清晰：
merged_comp = {k: v for d in dicts for k, v in d.items()}
print(f"合并: {merged_reduce} vs {merged_comp}")

# 结论：能用内置函数就用内置，reduce 适合无法简化的场景
\`\`\`

### 十八、综合实战：缓存与性能优化

\`\`\`python
from functools import lru_cache
import time

# 场景：递归计算 + 缓存

# 1. 不缓存版本
def collatz_steps(n):
    """Collatz 猜想步数（不缓存）。"""
    if n == 1:
        return 0
    if n % 2 == 0:
        return 1 + collatz_steps(n // 2)
    else:
        return 1 + collatz_steps(3 * n + 1)

# 2. 缓存版本
@lru_cache(maxsize=None)
def collatz_steps_cached(n):
    """Collatz 猜想步数（带缓存）。"""
    if n == 1:
        return 0
    if n % 2 == 0:
        return 1 + collatz_steps_cached(n // 2)
    else:
        return 1 + collatz_steps_cached(3 * n + 1)

# 测试单个
n = 27
start = time.perf_counter()
steps = collatz_steps(n)
slow_time = time.perf_counter() - start

start = time.perf_counter()
steps_cached = collatz_steps_cached(n)
fast_time = time.perf_counter() - start

print(f"Collatz({n}) = {steps} 步")
print(f"慢版: {slow_time:.6f}s")
print(f"快版: {fast_time:.6f}s")
print(f"缓存信息: {collatz_steps_cached.cache_info()}")

# 批量测试：找出步数最多的数（100 以内）
# 不缓存的版本会非常慢
start = time.perf_counter()
results = [(i, collatz_steps_cached(i)) for i in range(1, 101)]
batch_time = time.perf_counter() - start

# 找步数最多的
max_steps_num, max_steps = max(results, key=lambda x: x[1])
print(f"\\n100 以内步数最多: {max_steps_num} ({max_steps} 步)")
print(f"批量计算耗时: {batch_time:.3f}s")
print(f"最终缓存: {collatz_steps_cached.cache_info()}")
\`\`\`

### 十九、综合实战：分派日志系统

\`\`\`python
from functools import singledispatch
from datetime import datetime
import json

# 日志条目基类
class LogEntry:
    def __init__(self, message, level="INFO"):
        self.message = message
        self.level = level
        self.timestamp = datetime.now()

    def __repr__(self):
        return f"LogEntry({self.level}, {self.message!r})"

# 不同类型的日志
class ErrorLog(LogEntry):
    def __init__(self, message, error_code=None):
        super().__init__(message, "ERROR")
        self.error_code = error_code

class AccessLog(LogEntry):
    def __init__(self, message, ip, path):
        super().__init__(message, "ACCESS")
        self.ip = ip
        self.path = path

# 用 singledispatch 实现不同的格式化
@singledispatch
def format_log(entry):
    """默认格式化。"""
    return f"[{entry.timestamp}] {entry.level}: {entry.message}"

@format_log.register
def _(entry: ErrorLog):
    """错误日志格式化。"""
    return (f"[{entry.timestamp}] ERROR [{entry.error_code}]: "
            f"{entry.message}")

@format_log.register
def _(entry: AccessLog):
    """访问日志格式化。"""
    return (f"[{entry.timestamp}] ACCESS {entry.ip} {entry.path}: "
            f"{entry.message}")

# 测试
logs = [
    LogEntry("系统启动"),
    ErrorLog("数据库连接失败", error_code="DB_001"),
    AccessLog("用户登录", ip="192.168.1.1", path="/login"),
]

print("=== 日志输出 ===")
for log in logs:
    print(f"  {format_log(log)}")

# 序列化也用分派
@singledispatch
def to_dict(obj):
    return {"type": type(obj).__name__, "data": str(obj)}

@to_dict.register
def _(obj: LogEntry):
    return {
        "type": "log",
        "level": obj.level,
        "message": obj.message,
        "timestamp": obj.timestamp.isoformat()
    }

@to_dict.register
def _(obj: ErrorLog):
    base = to_dict(LogEntry(obj.message, obj.level))
    base["error_code"] = obj.error_code
    base["type"] = "error"
    return base

@to_dict.register
def _(obj: AccessLog):
    base = to_dict(LogEntry(obj.message, obj.level))
    base["ip"] = obj.ip
    base["path"] = obj.path
    base["type"] = "access"
    return base

print("\\n=== JSON 序列化 ===")
for log in logs:
    print(json.dumps(to_dict(log), ensure_ascii=False))
\`\`\`

### 二十、综合实战：函数工具组合

\`\`\`python
from functools import (
    lru_cache, partial, reduce, singledispatch,
    wraps, total_ordering
)
import time
import operator

# 综合：实现一个简单的函数式工具库

# 1. compose：函数组合
def compose(*functions):
    """从右到左组合函数。"""
    def composed(x):
        return reduce(lambda acc, f: f(acc), reversed(functions), x)
    return composed

# 2. pipe：从左到右组合
def pipe(*functions):
    """从左到右组合函数。"""
    def piped(x):
        return reduce(lambda acc, f: f(acc), functions, x)
    return piped

# 3. memoize：带 TTL 的缓存
def memoize(ttl=None):
    """带 TTL 的缓存。"""
    def decorator(func):
        cache = {}

        @wraps(func)
        def wrapper(*args):
            now = time.time()
            if args in cache:
                result, ts = cache[args]
                if ttl is None or now - ts < ttl:
                    return result
            result = func(*args)
            cache[args] = (result, now)
            return result

        wrapper.cache = cache
        return wrapper
    return decorator

# 4. curry：柯里化（简化版）
def curry(func):
    """柯里化：把多参数函数变成一串单参数函数。"""
    @wraps(func)
    def curried(*args):
        if len(args) >= func.__code__.co_argcount:
            return func(*args)
        return lambda *more: curried(*args, *more)
    return curried

# 测试工具
# compose 测试
add_one = lambda x: x + 1
double = lambda x: x * 2
square = lambda x: x ** 2

# (1+1) → double → square = 16
pipeline = compose(square, double, add_one)
print(f"compose: {pipeline(1)}")  # 16

# pipe 测试（从左到右）
pipeline = pipe(add_one, double, square)
print(f"pipe: {pipeline(1)}")  # 16

# memoize 测试
call_count = 0
@memoize(ttl=1.0)
def slow_func(x):
    global call_count
    call_count += 1
    time.sleep(0.1)
    return x * 2

print(f"\\n第一次: {slow_func(5)}")
print(f"第二次: {slow_func(5)} (缓存)")
print(f"实际调用: {call_count}")

# curry 测试
@curry
def add_three(a, b, c):
    return a + b + c

# 逐步应用参数
step1 = add_three(1)      # 返回函数
step2 = step1(2)          # 返回函数
result = step2(3)         # 6
print(f"\\ncurry 结果: {result}")

# 也可以一次给齐
result = add_three(1, 2, 3)
print(f"直接调用: {result}")

print("\\n所有工具测试通过")
\`\`\`

## 小结

- ⭐ \`@lru_cache(maxsize=128)\` 自动缓存函数结果，参数必须可哈希。
- ⭐ \`@cache\`（3.9+）等价于 \`@lru_cache(maxsize=None)\`。
- ⭐ \`@cached_property\` 把方法缓存为只计算一次的属性。
- ⭐ \`partial(func, *args)\` 固定部分参数，返回新函数。
- ⭐ \`partialmethod\` 用于类方法的偏函数。
- ⭐ \`reduce(func, iterable, init)\` 累积应用二元函数。
- ⭐ \`@singledispatch\` 按第一个参数类型分派；\`@singledispatchmethod\` 用于类方法。
- ⭐ \`@total_ordering\` 只定义 \`__eq__\` + 一个比较方法，自动补全其他。
- ⭐ \`@wraps(func)\` 复制原函数的元信息到装饰器。
- \`lru_cache\` 注意事项：参数可哈希、无 TTL、maxsize 选择。
- 大多数 \`reduce\` 场景有更简洁的内置替代（\`sum\`/\`max\`/\`min\`）。
- 函数式工具组合：\`compose\`（右到左）、\`pipe\`（左到右）、\`curry\`（柯里化）。

下一部分进入并发编程——进程、线程、锁、\`multiprocessing\`、\`concurrent.futures\`。`,
  },
];
export { chapters };
