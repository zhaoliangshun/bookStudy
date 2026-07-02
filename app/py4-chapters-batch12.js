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
## 一、概念解释

装饰器（decorator）是 Python 中一种"用 @ 语法包装函数/类"的机制。本质上 \`@decorator\` 只是一颗 **语法糖**，它等价于 \`fn = decorator(fn)\`：把原函数作为参数传给装饰器，再用装饰器返回的新对象替换掉原名字绑定。

- 装饰器是一个**接收可调用对象、返回可调用对象**的可调用对象（函数、类、或任何实现了 \`__call__\` 的实例都可以）
- \`@decorator\` 写在函数定义上方，Python 在 **模块加载时** 就完成替换，而不是调用时
- 装饰器常用于"在不修改原函数源码的前提下"增加横切逻辑（日志、计时、权限、缓存等）

\`\`\`python
@my_logger          # 等价于 add = my_logger(add)
def add(a, b):
    return a + b
\`\`\`

## 二、设计原理

装饰器遵循"开放—封闭原则"：**对扩展开放，对修改封闭**。原函数代码不动，行为却可被外部增强。其底层机制是 Python 函数是一等对象（first-class object）——可以被赋值、传参、返回，所以"接收函数返回函数"天然可行。

包装函数（wrapper）需要用 \`*args, **kwargs\` 接收任意参数，这样才能兼容任意签名的被装饰函数；同时用 \`functools.wraps(fn)\` 把原函数的元信息（\`__name__\`、\`__doc__\`、\`__module__\`、\`__qualname__\`、\`__wrapped__\`）拷贝到 wrapper，否则所有被装饰函数的元信息都会变成 wrapper 的，导致反射、调试、文档生成全部失效。

多个装饰器叠加时遵循"**自下而上应用，自上而下执行**"：靠近函数定义的装饰器先包装原函数，外层装饰器再包装内层结果；调用时则从最外层开始逐层进入。

\`\`\`python
@timer              # 第 2 步：timer(my_logger(add))
@my_logger          # 第 1 步：my_logger(add)
def multiply(a, b):
    return a * b
# 调用 multiply() → 先进入 timer 的 wrapper → 再进入 my_logger 的 wrapper → 最后才执行原函数
\`\`\`

## 三、使用场景

- **日志**：在调用前后打印函数名、参数、返回值，便于调试
- **计时**：测量函数耗时，定位性能瓶颈
- **权限校验**：检查用户角色后再决定是否执行
- **缓存**：用 \`functools.lru_cache\` 缓存纯函数结果
- **重试**：网络请求失败自动重试 N 次
- **注册**：把函数/类登记到全局表里（路由注册、插件注册）

## 四、代码逐行讲解

\`\`\`python
import functools, time

def my_logger(fn):                 # 装饰器：接收原函数 fn
    @functools.wraps(fn)           # 把 fn 的 __name__/__doc__ 等拷给 wrapper
    def wrapper(*args, **kwargs):  # *args/**kwargs 兼容任意签名
        print(f"[call] {fn.__name__}{args}")
        result = fn(*args, **kwargs)   # 调用原函数，透传参数
        print(f"[ret ] {fn.__name__} -> {result}")
        return result              # 把原函数返回值原样回传
    return wrapper                 # 返回新函数，替换原名字

@my_logger                         # 等价于 add = my_logger(add)
def add(a, b):
    """add a and b"""
    return a + b

add(3, 5)
print("name:", add.__name__, "doc:", add.__doc__)   # 仍是 add，不是 wrapper

def timer(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        t0 = time.perf_counter()              # 高精度计时起点
        result = fn(*args, **kwargs)
        print(f"[{fn.__name__}] cost {time.perf_counter() - t0:.6f}s")
        return result
    return wrapper

@timer
def slow():
    time.sleep(0.05)

slow()

@timer                            # 外层
@my_logger                        # 内层
def multiply(a, b):
    return a * b

multiply(4, 5)                    # 先 my_logger 包装，再 timer 套在外面
\`\`\`

关键点：
1. \`@functools.wraps(fn)\` 这一行本身也是一个装饰器，写在 wrapper 定义之上，等价于 \`wrapper = functools.wraps(fn)(wrapper)\`
2. wrapper 必须把 \`fn(*args, **kwargs)\` 的返回值 \`return\` 出去，否则被装饰函数"有返回值却拿不到"
3. 多装饰器叠加等价于 \`multiply = timer(my_logger(multiply))\`，调用链是 timer→my_logger→原函数

## 五、对比

| 对比项 | Python 装饰器 | Java 注解（Annotation） |
|--------|---------------|------------------------|
| 本质 | 运行时函数变换，返回新可调用对象 | 元数据标记，本身不改变行为 |
| 执行时机 | 模块加载时立即应用 | 运行时通过反射读取才生效 |
| 是否改变被装饰对象 | 是（替换为 wrapper） | 否（只是贴标签） |
| 是否需要外部框架 | 不需要，语言原生支持 | 需要 RetentionPolicy + 反射/注解处理器 |
| 典型用途 | 日志、计时、缓存、重试 | 配置、序列化、依赖注入 |

## 六、易错点小结

| 易错点 | 说明 | 正确做法 |
|--------|------|----------|
| 忘了 \`return wrapper\` | 装饰器返回 None，被装饰函数变 None | 装饰器必须 return 新函数 |
| wrapper 不 return 原结果 | 调用方拿不到返回值 | \`return fn(*args, **kwargs)\` |
| 漏掉 \`*args, **kwargs\` | 只能装饰固定签名的函数 | 一律用 \`*args, **kwargs\` 透传 |
| 不用 \`functools.wraps\` | \`__name__\` 全变成 wrapper，反射失效 | 必须 \`@functools.wraps(fn)\` |
| 多装饰器顺序搞反 | 期望先计时再日志，结果相反 | 记住"自下而上应用，自上而下执行" |
| 装饰器有副作用 | 在装饰器顶层写 print，模块加载就执行 | 副作用只放在 wrapper 内部 |
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
## 一、概念解释

参数化装饰器（parameterized decorator）是指装饰器本身能接收参数，例如 \`@repeat(3)\` 里的 \`3\`。它的关键在于：\`@decorator(args)\` 这种写法，Python 会**先执行 \`decorator(args)\`**，把它的返回值当作"真正的装饰器"，再去装饰下面的函数。

这就要求 \`decorator(args)\` 返回的必须是一个"普通装饰器"（接收函数、返回函数）。于是结构自然变成 **三层嵌套**：

- **外层**（接收参数）：\`def repeat(times):\` —— 拿到参数 \`times\`
- **中层**（接收函数）：\`def decorator(fn):\` —— 拿到原函数 \`fn\`，这是真正的装饰器
- **内层**（wrapper）：\`def wrapper(*args, **kwargs):\` —— 实际运行的包装函数

\`\`\`python
@repeat(3)
def greet(name): ...
# 等价于：greet = repeat(3)(greet)
# repeat(3) 返回 decorator，再用 decorator(greet) 返回 wrapper
\`\`\`

## 二、设计原理

为什么需要三层？因为普通的"两层装饰器"（\`def deco(fn): def wrapper(...): ...\`）只能装饰，**无法在 @ 语法里传参数**——\`@deco\` 后面跟的是函数定义，不是调用表达式。要想让 \`@deco(args)\` 这种带括号的写法成立，\`deco(args)\` 必须先求值，求值结果必须是"能接收函数的装饰器"。于是多了一层"参数工厂"。

调用链展开：

\`\`\`python
@repeat(3)            # 第 1 步：decorator = repeat(3)
def greet(name): ...  # 第 2 步：greet = decorator(greet) = wrapper
greet("alice")        # 第 3 步：调用 wrapper("alice")
\`\`\`

关键洞察：\`repeat(3)\` 在模块加载时就执行了一次，它的任务是"生产一个带着 \`times=3\` 闭包变量的装饰器"。中层 \`decorator\` 和内层 \`wrapper\` 都通过闭包捕获 \`times\`，所以能在运行时使用它。

## 三、使用场景

- **\`repeat(times)\`**：重复执行某个函数 N 次（批量调用、压力测试）
- **\`retry(max_attempts, delay)\`**：失败自动重试，配合退避策略用于网络请求
- **\`requires_role(roles)\`**：按角色做授权校验，不同接口配置不同角色
- **\`cache(ttl=60)\`**：带过期时间的缓存（比 \`lru_cache\` 多了 TTL 维度）
- **\`route("/api/users")\`**：Web 框架把处理函数注册到指定路径（Flask/FastAPI 风格）

## 四、代码逐行讲解

\`\`\`python
import functools, time

# 1) 参数化：重复执行
def repeat(times):                  # 外层：接收参数 times
    def decorator(fn):              # 中层：接收原函数，这是真正的装饰器
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):   # 内层：实际包装函数
            for _ in range(times):       # 用闭包捕获的 times
                result = fn(*args, **kwargs)
            return result                # 返回最后一次的结果
        return wrapper
    return decorator                # 外层返回中层装饰器

@repeat(3)                          # repeat(3) → decorator；再 decorator(greet) → wrapper
def greet(name):
    print(f"hi, {name}")

greet("alice")                      # 打印 3 次 hi, alice

# 2) 参数化：重试（带退避）
def retry(max_attempts=3, delay=0.1):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            for attempt in range(1, max_attempts + 1):   # 1..max_attempts
                try:
                    return fn(*args, **kwargs)            # 成功立即返回
                except Exception as e:
                    if attempt == max_attempts:
                        raise                              # 最后一次失败：原样抛出
                    print(f"retry {attempt}/{max_attempts}: {e}")
                    time.sleep(delay * attempt)            # 线性退避：第 n 次等 delay*n
            return None                                    # 理论上走不到
        return wrapper
    return decorator

@retry(max_attempts=3, delay=0.05)
def unstable():
    if random.random() < 0.7:
        raise ValueError("bad luck")
    return "ok"
\`\`\`

关键点：
1. \`retry\` 用了默认参数 \`max_attempts=3, delay=0.1\`，所以 \`@retry()\`、\`@retry(max_attempts=5)\`、\`@retry(delay=0.05)\` 都能用
2. \`time.sleep(delay * attempt)\` 是**线性退避**：第 1 次重试等 \`delay\`，第 2 次等 \`2*delay\`……避免雪崩式重试打挂下游
3. 最后一次失败必须 \`raise\`，否则异常被吞掉，调用方误以为成功
4. \`return None\` 在循环末尾只是兜底，逻辑上 \`raise\` 已经让循环无法正常走完

## 五、对比

| 写法 | 嵌套层数 | 能否带参数 | 示例 |
|------|----------|------------|------|
| 普通装饰器 | 2 层（deco + wrapper） | 否 | \`@deco\` |
| 参数化装饰器 | 3 层（factory + deco + wrapper） | 是 | \`@deco(args)\` |
| 类实现的参数化装饰器 | 1 个类 + \`__call__\` | 是 | \`@Deco(args)\`，实例当装饰器 |
| \`functools.partial\` 简化 | 视情况 | 是 | 把参数 partial 进去再当普通装饰器 |

## 六、易错点小结

| 易错点 | 说明 | 正确做法 |
|--------|------|----------|
| 只写两层就想带参数 | \`@deco(args)\` 要求 \`deco(args)\` 返回装饰器，两层结构返回的是 wrapper 不是装饰器 | 必须三层嵌套 |
| 忘了最外层 \`return decorator\` | \`deco(args)\` 返回 None，被装饰函数变 None | 外层必须 return 中层函数 |
| 闭包变量读不到 | 在 wrapper 里直接用 \`times\`，但 \`times\` 不在作用域 | 确保外层/中层参数名一致，靠闭包捕获 |
| 重试吞掉最后一次异常 | 没有 \`if attempt == max_attempts: raise\` | 最后一次必须原样抛出 |
| 退避策略不合理 | 固定 sleep，并发下打挂下游 | 用线性/指数退避 + 抖动（jitter） |
| 参数化后可读性下降 | 三层嵌套难读，调试栈帧很深 | 复杂场景考虑用类 + \`__call__\` 实现 |

## 七、可读性取舍

参数化装饰器功能强大，但三层嵌套对新手不友好。取舍建议：

- **简单参数**：用三层函数实现，配 \`functools.wraps\` 即可
- **复杂逻辑**（多个状态、配置对象）：改用类实现，\`__init__\` 接参数，\`__call__\` 当装饰器
- **调试栈帧深**：用 \`functools.wraps\` 让 \`__wrapped__\` 指向原函数，方便 \`inspect.signature\` 还原
- **团队规范**：在公共库中暴露参数化装饰器时，建议同时提供"非参数化默认版"（如 \`@retry\` 和 \`@retry(max_attempts=5)\` 都能用），降低使用心智成本
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
## 一、概念解释

类装饰器（class decorator）是装饰"类"的装饰器：它接收一个类、返回一个类（或可调用对象）。语法同样是 \`@decorator\`，只是放在 \`class\` 定义上方。等价于 \`cls = decorator(cls)\`。

\`\`\`python
@auto_repr                  # 等价于 Point = auto_repr(Point)
class Point:
    def __init__(self, x, y): self.x, self.y = x, y   # 实例属性 x、y
\`\`\`

类装饰器与函数装饰器的区别在于"被装饰对象"不同：

- 函数装饰器：接收函数 → 返回函数（包装调用过程）
- 类装饰器：接收类 → 返回类（修改类属性、添加方法、替换构造逻辑）

类装饰器同样在 **模块加载时、类定义完成后立即执行**，比实例化早。

## 二、设计原理

类装饰器的核心是"**对类做后处理**"。Python 类本身也是一等对象，可以传参、可以赋值、可以动态增删属性。所以装饰器拿到 \`cls\` 后，可以：

1. **修改类属性/方法**：直接 \`cls.method = new_method\`，给类动态添加方法
2. **替换类**：返回一个全新的类（如把原类包装成代理类）
3. **返回可调用对象**：返回一个函数，调用时返回实例（单例模式常用）

类装饰器也可以用 **类本身** 来实现：定义一个类，在 \`__init__(self, cls)\` 里接收被装饰类，在 \`__call__(self, *args, **kwargs)\` 里控制实例化过程。这样能用实例属性保存状态（如缓存、注册表）。

\`\`\`python
class Singleton:                       # 类装饰器：实现单例模式
    def __init__(self, cls):
        self.cls = cls                 # 保存被装饰的类
        self.instance = None           # 缓存唯一实例
    def __call__(self, *args, **kwargs):   # Config() 实际触发 __call__
        if self.instance is None:
            self.instance = self.cls(*args, **kwargs)   # 首次：创建实例
        return self.instance           # 后续：返回缓存的同一实例

@Singleton              # Config = Singleton(Config)；Config() 实际调用 Singleton.__call__
class Config: ...
\`\`\`

## 三、使用场景

- **自动添加方法**：\`auto_repr\` 自动生成 \`__repr__\`、\`auto_eq\` 自动生成 \`__eq__\`，减少样板代码
- **注册器模式**：\`PluginRegistry.register("json")\` 把插件类登记到全局表，运行时按名查找
- **单例模式**：\`@singleton\` 缓存唯一实例，保证全局只有一个对象
- **代理/拦截**：包装类的所有方法做日志、权限、事务
- **数据校验**：\`@validate\` 给类加字段类型校验（类似 dataclass 的思路）

## 四、代码逐行讲解

\`\`\`python
import functools

# 1) 类装饰器：自动添加 __repr__
def auto_repr(cls):
    """接收类 cls，给它加 __repr__，再返回 cls"""
    def __repr__(self):
        attrs = ", ".join(f"{k}={v!r}" for k, v in self.__dict__.items())
        return f"{cls.__name__}({attrs})"
    cls.__repr__ = __repr__       # 直接给类对象挂方法
    return cls                    # 返回修改后的类（同一个对象）

@auto_repr
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y

p = Point(1, 2)
print(p)                          # Point(x=1, y=2)

# 2) 注册器模式：收集所有插件类
class PluginRegistry:
    plugins = {}                  # 类属性：全局注册表

    @classmethod
    def register(cls, name):      # 参数化：name 是注册名
        def decorator(plugin_cls):
            cls.plugins[name] = plugin_cls   # 登记到注册表
            return plugin_cls                # 必须返回原类，否则类被替换掉
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

# 运行时按名查找插件
for name, cls in PluginRegistry.plugins.items():
    print(f"  {name}: {cls().render([1, 2, 3])}")

# 3) 单例装饰器：缓存唯一实例
def singleton(cls):
    instances = {}                # 闭包变量：每个 cls 对应一个实例
    @functools.wraps(cls)
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)   # 首次：创建并缓存
        return instances[cls]                       # 后续：直接返回缓存
    return get_instance

@singleton
class Config:
    def __init__(self):
        self.debug = True

c1 = Config()
c2 = Config()
print("same instance:", c1 is c2)   # True
\`\`\`

关键点：
1. \`auto_repr\` 直接修改 \`cls\` 并返回同一个 \`cls\`，被装饰类的身份不变，只是多了方法
2. \`PluginRegistry.register("json")\` 是"参数化装饰器"——\`register("json")\` 返回真正的 \`decorator\`，再去装饰 \`JSONRenderer\`
3. \`singleton\` 返回的是一个函数 \`get_instance\`，所以 \`Config\` 这个名字实际指向 \`get_instance\`，\`Config()\` 调用的是 \`get_instance()\`，从而控制实例化
4. 注册器模式中 \`decorator\` 必须 \`return plugin_cls\`，否则 \`JSONRenderer\` 这个名字会变成 \`None\`，后续无法直接使用

## 五、对比

| 对比项 | 类装饰器 | 元类（metaclass） |
|--------|----------|-------------------|
| 触发时机 | 类定义完成后应用 | 类创建过程中介入（控制 \`type.__new__\`） |
| 能否修改类 | 能（增删属性/方法） | 能，且能影响类的"创建过程"本身 |
| 是否能改基类 | 不能 | 能（元类可以改 bases、namespace） |
| 学习成本 | 低，语法直观 | 高，需理解 \`type\`、\`__new__/\__init__\` |
| 是否影响子类 | 否（只装饰当前类） | 是（元类会被子类继承） |
| 典型用途 | 加方法、注册、单例 | ORM、ABC 抽象基类、DSL 框架 |

## 六、易错点小结

| 易错点 | 说明 | 正确做法 |
|--------|------|----------|
| 注册器 \`decorator\` 不返回类 | 插件类被替换成 None，后续无法用 | 必须 \`return plugin_cls\` |
| 单例装饰器忘了缓存 | 每次都新建实例，单例失效 | 用闭包字典缓存 \`instances[cls]\` |
| 单例线程不安全 | 多线程同时首次访问会创建多个 | 加锁或用模块级变量 |
| 类装饰器返回新类却丢了元信息 | \`__name__\` 不对，调试困难 | 保留 \`__name__/__qualname__\` 或用 \`functools.wraps\` |
| 装饰器顺序与继承冲突 | 父类被装饰后子类继承的是装饰结果 | 注意装饰器是否影响继承链 |
| 用类实现装饰器漏 \`__call__\` | 实例不可调用，\`@Deco\` 报错 | 类装饰器必须实现 \`__call__\` |

## 七、注册器模式在插件系统的应用

注册器模式是插件系统的基石。典型流程：

1. **定义注册器**：\`PluginRegistry\` 持有一个 \`plugins\` 字典
2. **插件作者用 \`@register("name")\` 装饰自己的插件类**：类定义即注册，无需手动调用
3. **主程序扫描插件模块**：\`import\` 插件模块触发装饰器执行，注册表自动填充
4. **运行时按名实例化**：\`PluginRegistry.plugins[name]()\` 创建插件实例

优势：插件作者只需写 \`@register\` 一行，无需关心注册细节；新插件可零侵入接入，符合"开放—封闭原则"。Flask 的 \`@app.route\`、Click 的 \`@cli.command\`、pytest 的 \`@pytest.fixture\` 都是这一模式的变体。
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
        self.x, self.y = x, y

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
## 一、概念解释

Python 内置了一批常用装饰器，它们解决"方法分类"和"行为增强"两类问题：

- **方法分类**：\`@staticmethod\`、\`@classmethod\` 决定方法"是否接收实例/类作为隐含第一参数"
- **属性化**：\`@property\` 把方法包装成属性，支持 getter/setter/deleter
- **行为增强**：\`@functools.lru_cache\` 缓存结果、\`@functools.singledispatch\` 按类型分发、\`@dataclass\` 自动生成通用方法

\`\`\`python
class Demo:
    @staticmethod
    def static_method(a, b): return a + b      # 无 self/cls

    @classmethod
    def class_method(cls): return cls.__name__  # 第一参数是类

    @property
    def double(self): return self.x * 2         # 像属性一样访问：obj.double
\`\`\`

## 二、设计原理

- \`@staticmethod\`：把函数"原样"放进类命名空间，**不接收任何隐含参数**。它和类逻辑相关，但不需要访问实例或类。调用时既可用 \`Demo.static_method(1, 2)\`，也可用 \`instance.static_method(1, 2)\`。
- \`@classmethod\`：把方法第一个参数绑定为**类本身**（约定叫 \`cls\`），而不是实例。常用于"替代构造器"（\`from_xxx\`），因为它能在子类被调用时自动拿到正确的子类。
- \`@property\`：把一个 getter 方法包装成 descriptor，访问时**不写括号**。\`@x.setter\`、\`@x.deleter\` 分别绑定 setter 和 deleter，可在赋值/删除时加校验。
- \`@lru_cache\`：基于 LRU（Least Recently Used）策略缓存函数返回值，相同参数命中缓存直接返回，避免重复计算。要求参数可哈希。
- \`@singledispatch\`：按**第一个参数的类型**分发到不同实现，模拟函数重载。新增类型只需 \`@func.register(int)\`，无需修改原函数。
- \`@dataclass\`：扫描类的类型注解，自动生成 \`__init__\`、\`__repr__\`、\`__eq__\`（可选 \`__hash__\`、\`__lt__\` 等），大幅减少样板代码。

## 三、使用场景

- \`@staticmethod\`：工具函数与类相关但不依赖实例状态（如 \`Math.sqrt\`、\`Date.parse\`）
- \`@classmethod\`：替代构造器（\`int.from_bytes\`、\`dict.fromkeys\`）、工厂模式、访问/修改类属性
- \`@property\`：把"计算属性"当属性用、对私有属性加校验、只读属性
- \`@lru_cache\`：纯函数加速（斐波那契、递归 DP、配置解析）
- \`@singledispatch\`：按类型走不同分支的序列化、渲染逻辑
- \`@dataclass\`：数据容器、DTO、配置对象

## 四、代码逐行讲解

\`\`\`python
from dataclasses import dataclass
import functools

class Demo:
    class_var = "shared"

    def __init__(self, x):
        self.x = x

    # 实例方法：第一参数 self，可访问实例和类
    def instance_method(self):
        return f"instance: x={self.x}"

    # 静态方法：无 self/cls，相当于普通函数放在类里
    @staticmethod
    def static_method(a, b):
        return a + b

    # 类方法：第一参数 cls，可访问类属性、创建子类实例
    @classmethod
    def class_method(cls):
        return f"class: var={cls.class_var}"

    # alternative constructor：常用模式 from_xxx
    @classmethod
    def from_string(cls, s):        # 子类调用时 cls 是子类，自动正确
        return cls(int(s))

    # property：方法当属性用
    @property
    def double(self):               # 只读：只定义 getter
        return self.x * 2

d = Demo(10)
print(d.instance_method())
print(Demo.static_method(1, 2))     # 不需要实例
print(Demo.class_method())
print(Demo.from_string("42").x)     # 替代构造器
print("double:", d.double)          # 注意：没有 ()，像属性

# @dataclass：自动生成 __init__/__repr__/__eq__
@dataclass
class Point:
    x: float
    y: float

p = Point(1, 2)
print("dataclass:", p)              # Point(x=1, y=2)，自动 __repr__
print("eq:", Point(1, 2) == Point(1, 2))   # True，自动 __eq__

# lru_cache：纯函数记忆化
@functools.lru_cache(maxsize=128)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print("fib(10):", fib(10))
print("cache info:", fib.cache_info())   # 查看命中/未命中
\`\`\`

关键点：
1. \`@property\` 只定义 getter 时，属性**只读**；想要可写必须再定义 \`@x.setter\`
2. \`@classmethod\` 的 \`cls\` 在子类调用时是子类本身，所以 \`from_string\` 在子类里也能正确返回子类实例
3. \`@lru_cache\` 的参数必须**可哈希**（list/dict/set 不行，需转 tuple/frozenset）；\`cache_info()\` 可看命中情况
4. \`@dataclass\` 默认生成 \`__init__/__repr__/__eq__\`，可用 \`frozen=True\` 让实例不可变（生成 \`__hash__\`）

## 五、对比：实例方法 vs 类方法 vs 静态方法

| 对比项 | 实例方法 | 类方法 (\`@classmethod\`) | 静态方法 (\`@staticmethod\`) |
|--------|----------|--------------------------|------------------------------|
| 第一参数 | \`self\`（实例） | \`cls\`（类） | 无隐含参数 |
| 能否访问实例属性 | 能 | 否（只有类） | 否 |
| 能否访问类属性 | 能（\`self.class_var\` 或 \`type(self)\`） | 能（\`cls.class_var\`） | 否（需硬编码类名） |
| 调用方式 | \`obj.method()\` | \`cls.method()\` 或 \`obj.method()\` | \`cls.method()\` 或 \`obj.method()\` |
| 继承时 cls 指向 | —— | 当前调用的子类 | —— |
| 典型用途 | 操作实例状态 | 替代构造器、工厂、改类属性 | 工具函数 |

## 六、@property 的只读属性和计算属性

\`\`\`python
class Circle:
    def __init__(self, r):
        self._r = r                # 私有属性

    @property
    def radius(self):              # 只读：只暴露 getter
        return self._r

    @property
    def area(self):                # 计算属性：由其他属性派生
        import math
        return math.pi * self._r ** 2

    @property
    def perimeter(self):
        return 2 * math.pi * self._r
\`\`\`

\`@property\` 的三种用法：

1. **只读属性**：只定义 getter，外部无法赋值（\`circle.radius = 5\` 报 AttributeError）
2. **计算属性**：getter 内部基于其他属性计算，无需手动同步缓存
3. **带校验的可读写属性**：

\`\`\`python
class Temperature:
    @property
    def celsius(self):          # 读：返回内部 _c
        return self._c
    @celsius.setter
    def celsius(self, value):   # 写：进入校验
        if value < -273.15:
            raise ValueError("低于绝对零度")   # 物理上不可能，校验拦截
        self._c = value
\`\`\`

## 七、@singledispatch 按类型分发

\`\`\`python
@functools.singledispatch        # 按第一参数类型分发的泛型函数
def serialize(obj):
    raise TypeError(f"不支持的类型: {type(obj)}")   # 默认实现：未注册类型报错

@serialize.register(int)         # 注册 int 类型的专用实现
def _(obj):
    return str(obj)              # int → 字符串

@serialize.register(list)        # 注册 list 类型
def _(obj):
    return "[" + ",".join(serialize(x) for x in obj) + "]"   # 递归序列化每个元素

@serialize.register(dict)        # 注册 dict 类型
def _(obj):
    return "{" + ",".join(f'"{k}":{serialize(v)}' for k, v in obj.items()) + "}"   # 递归序列化每个值
\`\`\`

新增类型只需 \`@serialize.register(类型)\`，无需修改原函数，符合"开放—封闭原则"。

## 八、易错点小结

| 易错点 | 说明 | 正确做法 |
|--------|------|----------|
| \`@property\` 想赋值却没定义 setter | \`obj.x = 1\` 报 AttributeError | 用 \`@x.setter\` 定义 setter |
| \`@lru_cache\` 缓存可变参数 | list 不可哈希，运行时报错 | 转 tuple/frozenset，或用 \`@cache\`（3.9+） |
| \`@lru_cache\` 缓存有副作用的函数 | 缓存命中时不执行函数，副作用丢失 | 只缓存纯函数；带副作用的不缓存 |
| 静态方法里写 \`self\` | 没有隐含 self，访问不到实例 | 改成实例方法或显式传参 |
| 类方法里访问实例属性 | \`cls\` 是类不是实例，访问 \`self.x\` 报错 | 类方法只操作类属性 |
| \`@dataclass\` 默认可变导致 \`__hash__\` 失效 | 默认 \`eq=True, frozen=False\`，实例不可哈希 | 需要 hash 时设 \`frozen=True\` 或 \`eq=False\` |
| \`@singledispatch\` 按第一个参数分发 | 第二个参数的类型不影响分发 | 分发逻辑只看第一个参数 |
| 替代构造器不用 \`@classmethod\` | 用 \`@staticmethod\` 写死类名，子类无法正确继承 | 用 \`@classmethod\` 让 \`cls\` 自动适配 |
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