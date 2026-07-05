export const chapters = [
  {
    id: "py6-decorator-deep",
    group: "重点深化",
    icon: "🎁",
    title: "装饰器深度剖析（原理/源码/性能）",
    content: `## 装饰器深度剖析（原理/源码/性能）

装饰器是 Python 最具表现力的特性之一，理解它需要从语法糖、高阶函数、闭包、描述符四个层面逐层剖析。本文从字节码到源码、从原理到性能全面拆解。

### 一、装饰器的本质：高阶函数 + 语法糖

装饰器是一个**接收函数返回函数**的可调用对象。CPython 在编译期把 \`@decorator\` 翻译成一个普通的函数调用与重绑定，没有任何运行时魔法。

下面两段代码完全等价：

\`\`\`python
@decorator
def func():
    pass

# 等价于
def func():
    pass
func = decorator(func)
\`\`\`

> 💡 **关键认知**：装饰器在 **模块导入时** 立即执行，而不是在函数被调用时。这意味着装饰器中的副作用（注册、统计、日志配置）只会发生一次。

### 二、用 dis 查看装饰后的字节码

\`\`\`python
import dis

def my_decorator(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@my_decorator
def hello():
    print("hi")

# dis.dis(hello) 会显示 wrapper 的字节码
# 关键指令：
#   LOAD_GLOBAL  func
#   CALL         wrapper
#   RETURN_VALUE
\`\`\`

字节码层面 \`@my_decorator\` 编译为：定义 \`hello\` → \`LOAD_NAME my_decorator\` → \`CALL\` → \`STORE_NAME hello\`。装饰器本身不产生新指令，只是函数调用。

### 三、装饰器链的执行顺序

\`\`\`python
@dec_a
@dec_b
@dec_c
def func(): pass

# 等价于
func = dec_a(dec_b(dec_c(func)))
\`\`\`

**装饰顺序从下往上**（最先应用最靠近函数的），**调用顺序从上往下**（最外层先执行）。这是经典的"洋葱模型"：

\`\`\`
调用方向 ↓
┌── dec_a 进入 ──────────────────┐
│  ┌── dec_b 进入 ────────────┐  │
│  │  ┌── dec_c 进入 ──────┐  │  │
│  │  │   func() 真正执行  │  │  │
│  │  └── dec_c 退出 ──────┘  │  │
│  └── dec_b 退出 ────────────┘  │
└── dec_a 退出 ──────────────────┘
\`\`\`

### 四、functools.wraps 的作用

装饰器返回的 \`wrapper\` 默认会丢失原函数的元信息（\`__name__\`、\`__doc__\`、\`__module__\`、\`__qualname__\`、\`__wrapped__\`、\`__dict__\`）。这会让调试、序列化、文档生成、APM 工具全部失效。

\`\`\`python
import functools

def deco(func):
    @functools.wraps(func)   # 关键
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
\`\`\`

\`functools.wraps\` 内部调用 \`functools.update_wrapper(wrapper, func)\`，它做了三件事：

1. 复制 \`WRAPPER_ASSIGNMENTS = ('__module__', '__name__', '__qualname__', '__annotations__', '__doc__')\`
2. 更新 \`WRAPPER_UPDATES = ('__dict__',)\`
3. 设置 \`wrapper.__wrapped__ = func\`（用于 \`inspect.signature\` 透传）

### 五、带参数装饰器的三层嵌套

带参数装饰器需要"工厂 → 装饰器 → 包装器"三层：

\`\`\`python
def repeat(times):                # 第 1 层：工厂，接收参数
    def decorator(func):          # 第 2 层：装饰器，接收函数
        @functools.wraps(func)
        def wrapper(*args, **kw): # 第 3 层：包装器，接收调用参数
            result = None
            for _ in range(times):
                result = func(*args, **kw)
            return result
        return wrapper
    return decorator

@repeat(3)
def greet(name):
    print(f"hi {name}")
# 等价于 greet = repeat(3)(greet)
\`\`\`

记忆口诀：**参数越多嵌套越深**，每多一组参数就多一层闭包。

### 六、类装饰器 vs 函数装饰器

装饰器可以是任何可调用对象，类同样可以：

\`\`\`python
class CallCounter:
    def __init__(self, func):
        functools.update_wrapper(self, func)
        self.func = func
        self.count = 0

    def __call__(self, *args, **kw):
        self.count += 1
        return self.func(*args, **kw)

@CallCounter
def f(): pass
f(); f(); f()
print(f.count)  # 3
\`\`\`

反过来，装饰器也可以装饰类（class decorator，Python 2.6+）：

\`\`\`python
def add_repr(cls):
    def __repr__(self):
        attrs = ", ".join(f"{k}={v!r}" for k, v in self.__dict__.items())
        return f"{cls.__name__}({attrs})"
    cls.__repr__ = __repr__
    return cls

@add_repr
class Point: ...
\`\`\`

### 七、标准库装饰器清单

| 装饰器 | 来源 | 作用 |
|--------|------|------|
| \`@property\` | builtins | 把方法变成数据描述符 |
| \`@staticmethod\` | builtins | 静态方法（非描述符绑定） |
| \`@classmethod\` | builtins | 类方法绑定到类 |
| \`@functools.lru_cache\` | functools | LRU 缓存，自动 memoize |
| \`@functools.cache\` | functools | 简化版缓存（3.9+） |
| \`@functools.singledispatch\` | functools | 单分派泛函数 |
| \`@functools.wraps\` | functools | 复制元信息 |
| \`@functools.total_ordering\` | functools | 自动补全比较方法 |
| \`@contextlib.contextmanager\` | contextlib | 用生成器实现上下文管理器 |
| \`@dataclass\` | dataclasses | 自动生成 __init__/__repr__ |
| \`@abc.abstractmethod\` | abc | 抽象方法标记 |
| \`@atexit.register\` | atexit | 解释器退出时执行 |

\`functools.lru_cache\` 源码精简版（理解原理）：

\`\`\`python
def lru_cache(maxsize=128):
    cache = {}
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args):
            if args in cache:
                return cache[args]
            result = func(*args)
            if len(cache) >= maxsize:
                cache.pop(next(iter(cache)))  # 简化：FIFO 而非 LRU
            cache[args] = result
            return result
        wrapper.cache_clear = cache.clear
        return wrapper
    return decorator
\`\`\`

真实 CPython 实现用双向链表 + 哈希表，O(1) 查找与淘汰。

### 八、singledispatch 单分派泛函数

\`\`\`python
from functools import singledispatch

@singledispatch
def process(data):
    raise TypeError(f"unsupported {type(data)}")

@process.register(str)
def _(data): return data.upper()
@process.register(list)
def _(data): return [process(x) for x in data]
\`\`\`

它内部维护一个 \`registry: dict[type, func]\`，按第一个参数类型分发，比 if-elif 链更易扩展。

### 九、业务场景：AOP、缓存、权限

- **AOP（切面编程）**：日志、计时、追踪、限流、重试统一用装饰器实现，业务函数保持纯粹
- **缓存**：\`lru_cache\` 适合纯函数；带副作用的函数需自行控制
- **权限校验**：Web 框架路由装饰器（FastAPI Depends、Flask login_required）
- **事务管理**：进入时 begin，正常退出 commit，异常 rollback
- **重试机制**：网络请求自动重试 N 次，指数退避

### 十、装饰器性能开销实测

装饰器会引入一次额外的函数调用 + 闭包变量查找。对于热点路径这是不可忽略的开销。

| 场景 | 调用耗时（ns） |
|------|----------------|
| 直接调用 | ~50 |
| 1 层装饰器 | ~150 |
| 3 层装饰器 | ~350 |
| lru_cache 命中 | ~120 |
| lru_cache 未命中 | ~300 |

> ⚠️ **避坑提示**：在每秒百万次调用的热路径上，慎用多层装饰器。可用 \`functools.partial\` 或直接内联优化。

### 十一、最佳实践

1. 永远用 \`functools.wraps\`，保留元信息
2. 装饰器内部用 \`*args, **kwargs\` 透传，避免签名耦合
3. 带参数装饰器参数加默认值，方便单独使用
4. 类装饰器优先考虑 \`__init_subclass__\` 替代（更简单）
5. 缓存装饰器注意不可变参数与内存上限
6. 装饰器不要有副作用之外的"隐式行为"，保持可预测
7. 用 \`inspect.signature\` 透传签名给框架（FastAPI/Django）
8. 调试时用 \`func.__wrapped__\` 拿到原始函数

### 十二、装饰器 vs 其他元编程

| 方案 | 时机 | 复杂度 | 典型场景 |
|------|------|--------|----------|
| 装饰器 | 函数/类定义后 | 低 | 日志、缓存、注册 |
| 描述符 | 属性访问时 | 中 | ORM 字段、验证 |
| 元类 | 类创建时 | 高 | 框架、DSL、API 自动化 |
| \`__init_subclass__\` | 子类创建时 | 低 | 现代元类替代 |
| AST 改写 | 编译期 | 极高 | Cython、pydantic v2 |`,
    code: `# 装饰器深度剖析演示
import functools
import dis
import timeit
from functools import lru_cache, singledispatch

print("=== 装饰器深度剖析演示 ===\\n")

print("--- 1. 装饰器本质：@ 语法糖等价 ---")
def my_decorator(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

def func_with_at():
    return 42

func_with_at = my_decorator(func_with_at)  # 手动装饰
print(f"  手动装饰调用: {func_with_at()}")

print("\\n--- 2. 装饰器链执行顺序 ---")
def make_dec(name):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kw):
            print(f"    [{name} 进入]")
            result = func(*args, **kw)
            print(f"    [{name} 退出]")
            return result
        return wrapper
    return decorator

@make_dec("A")
@make_dec("B")
@make_dec("C")
def target():
    print("    >>> target 执行")
    return "done"

print("  调用 target():")
result = target()
print(f"  返回: {result}")

print("\\n--- 3. functools.wraps 元信息保留 ---")
def deco_no_wraps(func):
    def wrapper(*a, **kw):
        return func(*a, **kw)
    return wrapper

@deco_no_wraps
def f_nowrap():
    """原始文档"""
    pass

@my_decorator
def f_wrapped():
    """原始文档"""
    pass

print(f"  不用 wraps: __name__={f_nowrap.__name__}, __doc__={f_nowrap.__doc__}")
print(f"  使用 wraps: __name__={f_wrapped.__name__}, __doc__={f_wrapped.__doc__}")
print(f"  __wrapped__: {hasattr(f_wrapped, '__wrapped__')}")

print("\\n--- 4. 带参数装饰器三层嵌套 ---")
def repeat(times):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kw):
            result = None
            for _ in range(times):
                result = func(*args, **kw)
            return result
        return wrapper
    return decorator

@repeat(3)
def say(msg):
    print(f"    say: {msg}")
    return msg

print("  调用 repeat(3)(say):")
say("hello")

print("\\n--- 5. 类装饰器 ---")
class CallCounter:
    def __init__(self, func):
        functools.update_wrapper(self, func)
        self.func = func
        self.count = 0
    def __call__(self, *args, **kw):
        self.count += 1
        return self.func(*args, **kw)

@CallCounter
def compute(x):
    return x * x

for _ in range(5):
    compute(10)
print(f"  compute.count = {compute.count}")

print("\\n--- 6. lru_cache 性能对比 ---")
@lru_cache(maxsize=None)
def fib_cached(n):
    return n if n < 2 else fib_cached(n-1) + fib_cached(n-2)

def fib_plain(n):
    return n if n < 2 else fib_plain(n-1) + fib_plain(n-2)

t_cached = timeit.timeit(lambda: fib_cached(25), number=1000)
t_plain = timeit.timeit(lambda: fib_plain(25), number=10)
print(f"  fib_cached(25) x1000: {t_cached*1000:.2f}us")
print(f"  fib_plain(25)  x10:   {t_plain*1000:.2f}us")
print(f"  缓存命中率: {fib_cached.cache_info()}")
fib_cached.cache_clear()

print("\\n--- 7. 装饰器调用开销实测 ---")
def raw_func(x):
    return x + 1

@my_decorator
def decorated_func(x):
    return x + 1

t_raw = timeit.timeit(lambda: raw_func(1), number=1_000_000)
t_dec = timeit.timeit(lambda: decorated_func(1), number=1_000_000)
print(f"  原始函数 1M 次: {t_raw*1000:.1f}ms")
print(f"  装饰函数 1M 次: {t_dec*1000:.1f}ms")
print(f"  装饰器额外开销: {(t_dec-t_raw)*1000:.1f}ms ({(t_dec/t_raw):.2f}x)")

print("\\n--- 8. singledispatch 单分派 ---")
@singledispatch
def to_json(data):
    raise TypeError(f"不支持的类型: {type(data)}")

@to_json.register(str)
def _(data):
    return f'\\"{data}\\"'
@to_json.register(int)
def _(data):
    return str(data)
@to_json.register(list)
def _(data):
    return "[" + ", ".join(to_json(x) for x in data) + "]"
@to_json.register(dict)
def _(data):
    return "{" + ", ".join(f'{to_json(k)}: {to_json(v)}' for k, v in data.items()) + "}"

print(f"  str:    {to_json('hello')}")
print(f"  int:    {to_json(42)}")
print(f"  list:   {to_json([1, 'a', 3])}")
print(f"  dict:   {to_json({'a': 1, 'b': [2, 3]})}")

print("\\n--- 9. 字节码查看装饰器 ---")
print("  wrapper 字节码:")
dis.dis(my_decorator(lambda: 1))

print("\\n--- 10. 业务场景：AOP 计时装饰器 ---")
def timing(func):
    @functools.wraps(func)
    def wrapper(*args, **kw):
        start = timeit.default_timer()
        result = func(*args, **kw)
        elapsed = (timeit.default_timer() - start) * 1000
        print(f"    {func.__name__} 耗时 {elapsed:.3f}ms")
        return result
    return wrapper

@timing
def workload():
    return sum(i*i for i in range(100000))

print("  调用 workload():")
workload()

print("\\n--- 11. 重试装饰器 ---")
def retry(times=3):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kw):
            last_err = None
            for i in range(times):
                try:
                    return func(*args, **kw)
                except Exception as e:
                    last_err = e
                    print(f"    第 {i+1} 次失败: {e}")
            raise last_err
        return wrapper
    return decorator

attempt = [0]
@retry(times=3)
def flaky():
    attempt[0] += 1
    if attempt[0] < 3:
        raise ValueError(f"模拟失败 #{attempt[0]}")
    return "success"

print("  调用 flaky():")
print(f"  结果: {flaky()}, 尝试 {attempt[0]} 次")

print("\\n--- 12. 最佳实践速查 ---")
tips = [
    "永远用 functools.wraps 保留元信息",
    "装饰器内部 *args, **kwargs 透传",
    "带参数装饰器参数加默认值",
    "类装饰器优先用 __init_subclass__",
    "lru_cache 注意不可变参数",
    "调试时用 func.__wrapped__ 拿原函数",
    "热路径慎用多层装饰器",
]
for i, t in enumerate(tips, 1):
    print(f"  {i}. {t}")

print("\\n=== 装饰器深度剖析演示结束 ===")`
  },
  {
    id: "py6-closure-deep",
    group: "重点深化",
    icon: "🪤",
    title: "闭包原理与内存模型",
    content: `## 闭包原理与内存模型

闭包是 Python 函数式编程的基石，也是装饰器、生成器、协程的底层机制。理解闭包的关键在于 \`cell\` 对象与 \`LOAD_DEREF\` 指令。

### 一、什么是闭包

**闭包 = 函数 + 它引用的外层变量（自由变量）的环境**。当一个内层函数引用了外层函数的局部变量，并且该内层函数被返回到外层之外，就形成了闭包。

\`\`\`python
def make_counter():
    count = 0            # 自由变量 free variable
    def counter():
        nonlocal count   # 声明修改外层变量
        count += 1
        return count
    return counter       # 返回内层函数，形成闭包

c = make_counter()
print(c(), c(), c())  # 1 2 3
\`\`\`

关键点：\`count\` 本应在 \`make_counter\` 返回后销毁，但因为 \`counter\` 闭包捕获了它，所以它"活"了下来。

### 二、自由变量 free variable

如果一个变量在函数内被使用，但**不是在该函数内定义的**，也不是全局变量，它就是自由变量。CPython 编译器在编译时就能识别自由变量。

\`\`\`python
def outer():
    x = 10
    def inner():
        return x   # x 是 inner 的自由变量
    return inner

print(outer.__code__.co_freevars)        # 空
print(outer().__code__.co_freevars)      # ('x',)
\`\`\`

### 三、闭包的内存模型：cell 单元格

CPython 用 \`cell\` 对象保存闭包变量。每个 \`cell\` 是一个 1 槽容器，多个闭包共享同一个 cell，从而实现"同一变量多处可见"。

\`\`\`
make_counter 的栈帧
┌────────────────────┐
│  count = cell ◄─────────────┐
└─────────┬──────────┘         │
          │ counter.__closure__ │
          ▼                     │
┌────────────────────┐          │
│  counter 函数对象   │          │
│  __closure__ = ────┼──────────┘
│  (cell,)           │
└────────────────────┘
\`\`\`

\`\`\`python
def make_counter():
    count = 0
    def counter():
        nonlocal count
        count += 1
        return count
    return counter

c = make_counter()
print(c.__closure__)            # (<cell at 0x...>,)
print(c.__closure__[0].cell_contents)  # 0
c(); c()
print(c.__closure__[0].cell_contents)  # 2
\`\`\`

> 💡 \`cell_contents\` 是 cell 的属性，可读可写。\`nonlocal\` 关键字就是告诉编译器：操作 cell 而不是本地变量。

### 四、LEGB 规则详解

变量查找顺序：**L → E → G → B**

- **L Local**：当前函数内
- **E Enclosing**：外层闭包函数（仅闭包场景）
- **G Global**：模块全局
- **B Builtins**：\`builtins\` 模块

\`\`\`python
x = "global"
def outer():
    x = "enclosing"
    def inner():
        x = "local"
        print(x)   # L: local
    inner()
outer()  # local
\`\`\`

字节码层面：

- L → \`LOAD_FAST\`（最快，槽位索引）
- E → \`LOAD_DEREF\`（通过 cell）
- G → \`LOAD_GLOBAL\`（dict 查找）
- B → \`LOAD_GLOBAL\` + 回退到 builtins

### 五、用 dis 查看 LOAD_DEREF 指令

\`\`\`python
import dis
def outer():
    x = 10
    def inner():
        return x
    return inner

dis.dis(outer.__code__.co_consts[1])
# 输出会看到 LOAD_DEREF 'x'
\`\`\`

\`LOAD_DEREF\` 通过 \`frame->localsplus\` 中的 cell 槽位间接访问。\`LOAD_FAST\` 是直接访问，更快。

### 六、nonlocal 与闭包变量修改

默认闭包只能**读取**外层变量。若想**修改**，必须用 \`nonlocal\` 声明：

\`\`\`python
def outer():
    x = 0
    def reader():
        x = 1   # 这是新建局部变量 x，不是修改外层 x
        return x
    def writer():
        nonlocal x
        x = 1   # 这才是修改外层 x
        return x
    reader(); print("after reader:", x)   # 0
    writer();  print("after writer:", x)  # 1
\`\`\`

> ⚠️ **避坑提示**：忘记 \`nonlocal\` 会创建一个**新的局部变量**而不是修改外层，且 \`UnboundLocalError\` 也常见于此。

### 七、循环变量陷阱的根因

经典的"闭包捕获循环变量"陷阱：

\`\`\`python
funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])  # [2, 2, 2] 不是 [0, 1, 2]！
\`\`\`

**根因**：所有 lambda 共享同一个 \`i\` 的 cell（因为是同一个作用域的变量）。列表推导式结束后 \`i=2\`，所以全部返回 2。

修复方法：用默认参数强制立即绑定：

\`\`\`python
funcs = [lambda i=i: i for i in range(3)]  # 默认参数在定义时求值
print([f() for f in funcs])  # [0, 1, 2]
\`\`\`

或者用工厂函数制造新作用域：

\`\`\`python
def make_func(i):
    return lambda: i
funcs = [make_func(i) for i in range(3)]
\`\`\`

### 八、闭包 vs 对象：状态封装

闭包和对象都是"携带状态的可调用物"，可以互相模拟：

\`\`\`python
# 闭包版
def make_adder_closure(n):
    def adder(x):
        return x + n
    return adder

# 对象版
class Adder:
    def __init__(self, n):
        self.n = n
    def __call__(self, x):
        return x + self.n

c = make_adder_closure(10)
o = Adder(10)
print(c(5), o(5))  # 15 15
\`\`\`

闭包的优势：轻量，无 \`self\` 开销；对象的优势：可继承、可调试、可序列化。**闭包是"穷人的对象"，对象是"富人的闭包"**。

### 九、内存泄漏风险（循环引用）

闭包捕获的 cell 会引用外层栈帧的对象，如果外层对象又引用了闭包本身，就形成循环引用：

\`\`\`python
def leaky():
    cache = []
    def f():
        cache.append(1)   # f 引用 cache
        return cache
    cache.append(f)       # cache 引用 f → 循环引用！
    return f
\`\`\`

CPython 用引用计数 + 分代 GC 处理循环引用，但仍有性能开销，且无法及时释放。

### 十、用 weakref 避免泄漏

\`\`\`python
import weakref

def safe_factory(obj):
    ref = weakref.ref(obj)   # 弱引用，不增加引用计数
    def callback():
        target = ref()
        if target is not None:
            return target.do()
        return None
    return callback
\`\`\`

适用场景：缓存、观察者、信号槽。弱引用让对象能在闭包存在时仍被回收。

### 十一、业务场景

- **回调函数**：GUI/Web 框架的事件处理，携带上下文
- **装饰器**：所有带参数装饰器本质都是闭包工厂
- **工厂函数**：\`make_adder\`、\`make_counter\` 替代简单的类
- **惰性求值**：闭包保存"待计算的配方"
- **配置注入**：\`make_handler(config)\` 返回配置好的处理器
- **状态机**：闭包保存当前状态，比类更紧凑

### 十二、对比表

| 特性 | 闭包 | 对象 |
|------|------|------|
| 状态存储 | cell | \`__dict__\` |
| 访问速度 | 快（LOAD_DEREF） | 中（属性查找） |
| 调试 | 难（看 __closure__） | 易（看属性） |
| 继承 | 不支持 | 支持 |
| 序列化 | 不支持 | 支持（pickle） |
| 内存 | 小 | 大 |
| 可见性 | 隐藏（私有） | 公开（可改） |

### 十三、最佳实践

1. 闭包只用于**短小、局部**的逻辑，复杂状态用类
2. 修改闭包变量务必 \`nonlocal\`，避免误建局部变量
3. 循环里建闭包，立即用默认参数绑定变量
4. 闭包持有大对象时考虑 \`weakref\`
5. 调试时打印 \`func.__closure__\` 查看捕获的 cell
6. 闭包不要捕获 \`self\` 之外的循环引用对象
7. 高频调用的热路径，闭包比类方法略快`,
    code: `# 闭包原理与内存模型演示
import dis
import sys
import timeit
import weakref

print("=== 闭包原理与内存模型演示 ===\\n")

print("--- 1. 闭包基本示例 ---")
def make_counter():
    count = 0
    def counter():
        nonlocal count
        count += 1
        return count
    return counter

c = make_counter()
print(f"  c() = {c()}, {c()}, {c()}")
print(f"  counter.__closure__ = {c.__closure__}")
print(f"  cell_contents = {c.__closure__[0].cell_contents}")

print("\\n--- 2. 自由变量 co_freevars ---")
def outer():
    x = 10
    y = 20
    def inner():
        return x + y
    return inner
print(f"  outer 的自由变量: {outer.__code__.co_freevars}")
print(f"  inner 的自由变量: {outer().__code__.co_freevars}")

print("\\n--- 3. LEGB 查找规则 ---")
x = "global"
def demo_leg():
    x = "enclosing"
    def inner():
        x = "local"
        return f"  L: {x}"
    return inner()
print(f"  内层 inner() -> {demo_leg()}")

g_var = "global"
def no_local_var():
    return f"  G: {g_var}"
print(f"  外层函数 -> {no_local_var()}")

print("\\n--- 4. nonlocal 修改闭包变量 ---")
def outer2():
    x = 0
    def reader():
        x = 100   # 新建局部变量
        return f"reader 看到 x={x}"
    def writer():
        nonlocal x
        x = 100   # 修改外层
        return f"writer 改外层 x={x}"
    r = reader()
    w = writer()
    return r, w, f"外层最终 x={x}"
print("  " + " | ".join(outer2()))

print("\\n--- 5. 字节码 LOAD_DEREF ---")
def show_bytecode():
    x = 10
    def inner():
        return x
    return inner

print("  inner 的字节码:")
dis.dis(show_bytecode().__code__)

print("\\n--- 6. 循环变量陷阱 ---")
funcs_bad = [lambda: i for i in range(3)]
print(f"  错误写法: {[f() for f in funcs_bad]}")
funcs_good = [lambda i=i: i for i in range(3)]
print(f"  默认参数: {[f() for f in funcs_good]}")
def make_func(i):
    return lambda: i
funcs_factory = [make_func(i) for i in range(3)]
print(f"  工厂函数: {[f() for f in funcs_factory]}")

print("\\n--- 7. 闭包 vs 对象 ---")
def make_adder_closure(n):
    def adder(x):
        return x + n
    return adder

class Adder:
    def __init__(self, n):
        self.n = n
    def __call__(self, x):
        return x + self.n

c_add = make_adder_closure(10)
o_add = Adder(10)
print(f"  闭包 adder(5) = {c_add(5)}")
print(f"  对象 adder(5) = {o_add(5)}")

t_closure = timeit.timeit(lambda: c_add(5), number=1_000_000)
t_object = timeit.timeit(lambda: o_add(5), number=1_000_000)
print(f"  闭包 1M 次: {t_closure*1000:.1f}ms")
print(f"  对象 1M 次: {t_object*1000:.1f}ms")

print("\\n--- 8. 闭包捕获多个变量 ---")
def make_point(x, y):
    def get():
        return (x, y)
    def move(dx, dy):
        nonlocal x, y
        x += dx
        y += dy
    return get, move

get, move = make_point(3, 4)
print(f"  初始: {get()}")
move(1, 1)
print(f"  移动后: {get()}")
print(f"  cell 数量: {len(get.__closure__)}")

print("\\n--- 9. 内存引用计数 ---")
class Big:
    def __init__(self, name):
        self.name = name

def make_holder(obj):
    def holder():
        return obj.name
    return holder

big = Big("big-data")
holder = make_holder(big)
print(f"  Big 引用计数: {sys.getrefcount(big) - 1}")
del big
print(f"  del 后 holder 仍可用: {holder()}")
print("  (闭包持有引用，对象未释放)")

print("\\n--- 10. weakref 弱引用 ---")
class Subject:
    def __init__(self, val):
        self.val = val

def make_weak_callback(obj):
    ref = weakref.ref(obj)
    def callback():
        target = ref()
        if target is not None:
            return target.val
        return "<已被回收>"
    return callback

s = Subject("hello")
cb = make_weak_callback(s)
print(f"  对象存在时调用: {cb()}")
del s
print(f"  对象回收后调用: {cb()}")

print("\\n--- 11. 闭包工厂：配置注入 ---")
def make_handler(prefix, level):
    def handler(msg):
        if level >= 1:
            print(f"    {prefix}: {msg}")
    return handler

info = make_handler("[INFO]", 1)
debug = make_handler("[DEBUG]", 0)
info("服务启动")
debug("这条不会打印")
info("收到请求")

print("\\n--- 12. 状态机：用闭包实现 ---")
def make_traffic_light():
    states = ["红", "绿", "黄"]
    idx = 0
    def light():
        nonlocal idx
        current = states[idx]
        idx = (idx + 1) % len(states)
        return current
    return light

light = make_traffic_light()
print("  红绿灯循环: ", end="")
for _ in range(6):
    print(light(), end=" ")
print()

print("\\n--- 13. 最佳实践速查 ---")
tips = [
    "闭包用于短小逻辑，复杂状态用类",
    "修改闭包变量务必 nonlocal",
    "循环建闭包用默认参数绑定 i=i",
    "调试时打印 func.__closure__",
    "闭包持有大对象考虑 weakref",
    "闭包不能 pickle 序列化",
    "高频热路径闭包略快于类方法",
]
for i, t in enumerate(tips, 1):
    print(f"  {i}. {t}")

print("\\n=== 闭包原理演示结束 ===")`
  },
  {
    id: "py6-asyncio-deep",
    group: "重点深化",
    icon: "⚡",
    title: "asyncio 事件循环原理",
    content: `## asyncio 事件循环原理

asyncio 是 Python 官方的异步 IO 框架，其核心是一个**单线程事件循环**调度协程。理解它需要从 select/epoll、Future、Task、协程四个层次逐层剖析。

### 一、同步 vs 异步 vs 多线程

| 模型 | 阻塞 | 并发数 | 切换成本 | 状态共享 |
|------|------|--------|----------|----------|
| 同步 | 是 | 1 | 无 | 直接 |
| 多线程 | 否 | N（受 GIL 限制） | 高（锁+上下文） | 需锁 |
| 异步 | 否 | 极高（万级） | 低（用户态切换） | 单线程无锁 |

异步的本质：**单线程内多个 IO 任务交错执行**，IO 等待时不占用 CPU，由事件循环切换到下一个就绪任务。

### 二、事件循环 event loop 原理

事件循环是一个无限循环：

\`\`\`
┌────────────────────────────────────────┐
│           Event Loop 主循环             │
├────────────────────────────────────────┤
│  1. 计算超时时间（最近就绪的定时器）      │
│  2. 调用 select/poll/epoll 等待 IO      │
│  3. 处理就绪的 IO 回调                   │
│  4. 处理就绪的定时器回调                  │
│  5. 执行 ready 队列里的 Task             │
│  6. 回到第 1 步                         │
└────────────────────────────────────────┘
\`\`\`

\`asyncio\` 中一个事件循环对应一个线程，循环内部维护：

- \`_ready\`：就绪回调的双端队列
- \`_scheduled\`：定时器堆
- \`_selector\`：IO 多路复用器（selectors 模块）

### 三、协程 coroutine 与任务 Task

**协程函数** \`async def\` 调用后返回一个**协程对象**，本身不执行：

\`\`\`python
async def hello():
    return 42

c = hello()       # 协程对象，未执行
print(type(c))    # <class 'coroutine'>
\`\`\`

**Task** 是对协程的封装，由事件循环调度。创建 Task 后协程才真正被加入调度队列：

\`\`\`python
task = asyncio.create_task(hello())  # 立即加入 ready 队列
\`\`\`

\`Task\` 内部用 \`__step\` 驱动协程：调用 \`coro.send(None)\`，如果返回 \`Future\` 就等待它完成后再 \`__step\`，如果抛 \`StopIteration\` 则任务结束。

### 四、Future 对象

**Future** 是"将来某个时刻会有结果"的占位对象。它是底层原语，应用代码一般不直接用。

\`\`\`python
fut = loop.create_future()
fut.add_done_callback(lambda f: print("done", f.result()))
# 在某处 fut.set_result(42) → 触发回调
\`\`\`

\`Task\` 是 \`Future\` 的子类，所以 \`await task\` 等同于 \`await future\`。\`await\` 的本质就是：把当前协程挂起，注册回调到 Future，等 Future 完成后再恢复当前协程。

### 五、await 的本质（yield from）

在 Python 3.5 之前用 \`yield from\`，3.5+ 引入 \`await\` 关键字。两者底层等价：

\`\`\`python
async def fetch():
    result = await db.query()
    return result

# 等价于（概念上）
def fetch():
    result = yield from db.query()
    return result
\`\`\`

\`await expr\` 的字节码是 \`GET_AWAITABLE\` + \`YIELD_FROM\`。它要求 expr 是 awaitable（协程、Task、Future、或有 \`__await__\` 的对象）。

### 六、select/poll/epoll 底层

\`asyncio\` 默认用 \`selectors.AutoSelector\`，在 Linux 上是 \`EpollSelector\`：

| 调用 | 复杂度 | 通知方式 | 最大 fd |
|------|--------|----------|---------|
| select | O(n) | 每次拷贝 fd 集 | 1024 |
| poll | O(n) | 每次遍历 | 无限制 |
| epoll | O(1) | 就绪回调 | 无限制 |

\`\`\`python
import selectors
sel = selectors.DefaultSelector()
sel.register(sock, selectors.EVENT_READ, data=callback)
events = sel.select(timeout=1)  # 阻塞等待
for key, mask in events:
    key.data(key.fileobj, mask)
\`\`\`

### 七、IO 多路复用示例

用 \`selectors\` 实现一个极简的事件循环：

\`\`\`python
import socket, selectors

sel = selectors.DefaultSelector()
clients = {}

def accept(sock, mask):
    conn, addr = sock.accept()
    conn.setblocking(False)
    sel.register(conn, selectors.EVENT_READ, read)

def read(conn, mask):
    data = conn.recv(1024)
    if data:
        conn.send(data)  # 回显
    else:
        sel.unregister(conn)
        conn.close()
\`\`\`

### 八、用 Python 模拟事件循环简化版

下面用纯 Python 实现一个最小事件循环，理解 asyncio 内核：

\`\`\`python
import heapq, time

class MiniLoop:
    def __init__(self):
        self.ready = []
        self.scheduled = []  # 堆 (time, callback)

    def call_soon(self, cb, *args):
        self.ready.append((cb, args))

    def call_later(self, delay, cb, *args):
        heapq.heappush(self.scheduled, (time.time()+delay, cb, args))

    def run_forever(self):
        while self.ready or self.scheduled:
            now = time.time()
            while self.scheduled and self.scheduled[0][0] <= now:
                _, cb, args = heapq.heappop(self.scheduled)
                self.ready.append((cb, args))
            if self.ready:
                cb, args = self.ready.pop(0)
                cb(*args)
            else:
                time.sleep(0.01)
\`\`\`

这是 asyncio 的核心思想：**就绪队列 + 定时器堆 + IO 多路复用**。

### 九、asyncio.sleep 模拟

\`asyncio.sleep\` 是理解协程调度的最佳示例：

\`\`\`python
async def sleep(delay):
    fut = asyncio.get_running_loop().create_future()
    loop.call_later(delay, fut.set_result, None)
    await fut
\`\`\`

调用 \`await asyncio.sleep(1)\` 后，当前协程挂起在 Future 上，1 秒后定时器触发 \`fut.set_result\`，Future 完成的回调会重新调度该协程。

### 十、任务调度示例

\`\`\`python
import asyncio

async def worker(name, delay):
    print(f"{name} start")
    await asyncio.sleep(delay)
    print(f"{name} done after {delay}s")

async def main():
    await asyncio.gather(
        worker("A", 1),
        worker("B", 2),
        worker("C", 1),
    )
# 总耗时约 2s（取最长），而不是 1+2+1=4s
\`\`\`

\`asyncio.gather\` 把多个协程包成 Task 并发执行，等全部完成。这是异步并发收益的核心。

### 十一、性能瓶颈分析

- **CPU 密集型**：异步无收益，反而不如多进程，因为单线程被一个协程占满
- **纯 IO 等待**：异步收益最大，万级连接不成问题
- **混合负载**：用 \`run_in_executor\` 把 CPU 任务丢到线程池
- **阻塞调用**：在协程里调 \`time.sleep\` 或 \`requests.get\` 会卡住整个循环！

> ⚠️ **避坑提示**：协程内绝不能调用同步阻塞 IO，必须用异步库（\`httpx\`、\`aiofiles\`、\`aiomysql\`）。

### 十二、业务场景

- **高并发 Web**：FastAPI / Sanic / Starlette
- **爬虫**：\`aiohttp\` + asyncio，单机数千并发
- **WebSocket 长连接**：聊天室、推送
- **数据库连接池**：\`asyncpg\`、\`aiomysql\`
- **RPC 客户端**：\`grpc.aio\`
- **任务调度**：\`asyncio.gather\` 并发拉取多个 API

### 十三、对比表

| 方案 | 并发模型 | 适合场景 | 状态共享 |
|------|----------|----------|----------|
| 多线程 | 抢占式 | 阻塞 IO 库 | 需锁 |
| 多进程 | 抢占式 | CPU 密集 | IPC |
| asyncio | 协作式 | 高并发 IO | 单线程无锁 |
| trio / curio | 协作式 | 同 asyncio，更严格 | 单线程 |

### 十四、最佳实践

1. 入口用 \`asyncio.run(main())\`，自动创建关闭循环
2. 用 \`asyncio.gather\` 并发，不要 \`await\` 串行
3. 协程内绝不阻塞，用 \`run_in_executor\` 包裹阻塞调用
4. 长连接用 \`async with\` 确保清理
5. 超时用 \`asyncio.wait_for\`，避免永久挂起
6. 取消用 \`task.cancel()\`，处理 \`CancelledError\`
7. 用 \`asyncio.Queue\` 在生产者消费者间通信
8. 3.11+ 优先用 \`TaskGroup\` 替代 \`gather\`，更安全`,
    code: `# asyncio 事件循环原理演示
import asyncio
import time
import timeit
import heapq
import socket
import selectors

print("=== asyncio 事件循环原理演示 ===\\n")

print("--- 1. 协程对象 vs Task ---")
async def hello():
    await asyncio.sleep(0)
    return 42

c = hello()
print(f"  类型: {type(c).__name__}")
# 直接 await 协程
result = asyncio.run(hello())
print(f"  asyncio.run 结果: {result}")

print("\\n--- 2. Task 调度 ---")
async def main_task():
    async def worker(name):
        print(f"    {name} 开始")
        await asyncio.sleep(0.05)
        print(f"    {name} 完成")
        return name
    t1 = asyncio.create_task(worker("A"))
    t2 = asyncio.create_task(worker("B"))
    r1, r2 = await asyncio.gather(t1, t2)
    return r1, r2

print(f"  结果: {asyncio.run(main_task())}")

print("\\n--- 3. Future 基本用法 ---")
async def main_future():
    loop = asyncio.get_running_loop()
    fut = loop.create_future()
    def resolve():
        fut.set_result("future-result")
    loop.call_later(0.01, resolve)
    result = await fut
    print(f"  Future 结果: {result}")
    print(f"  Future done: {fut.done()}")
    print(f"  Future cancelled: {fut.cancelled()}")

asyncio.run(main_future())

print("\\n--- 4. asyncio.sleep 模拟 ---")
async def my_sleep(delay):
    loop = asyncio.get_running_loop()
    fut = loop.create_future()
    loop.call_later(delay, lambda f=fut: f.set_result(None))
    await fut

async def main_sleep():
    start = time.time()
    await my_sleep(0.1)
    print(f"  my_sleep(0.1) 实际耗时: {time.time()-start:.3f}s")

asyncio.run(main_sleep())

print("\\n--- 5. 并发 vs 串行对比 ---")
async def task_io(n):
    await asyncio.sleep(0.1)
    return n * 2

async def serial():
    start = time.time()
    results = []
    for i in range(5):
        results.append(await task_io(i))
    elapsed = time.time() - start
    return results, elapsed

async def concurrent():
    start = time.time()
    results = await asyncio.gather(*[task_io(i) for i in range(5)])
    elapsed = time.time() - start
    return results, elapsed

r1, t1 = asyncio.run(serial())
r2, t2 = asyncio.run(concurrent())
print(f"  串行 5 个 0.1s 任务: {t1:.3f}s 结果={r1}")
print(f"  并发 5 个 0.1s 任务: {t2:.3f}s 结果={r2}")
print(f"  加速比: {t1/t2:.2f}x")

print("\\n--- 6. 最小事件循环实现 ---")
class MiniLoop:
    def __init__(self):
        self.ready = []
        self.scheduled = []
        self._stopping = False
    def call_soon(self, cb, *args):
        self.ready.append((cb, args))
    def call_later(self, delay, cb, *args):
        heapq.heappush(self.scheduled, (time.time()+delay, cb, args))
    def stop(self):
        self._stopping = True
    def run_until_complete(self):
        while (self.ready or self.scheduled) and not self._stopping:
            now = time.time()
            while self.scheduled and self.scheduled[0][0] <= now:
                _, cb, args = heapq.heappop(self.scheduled)
                self.ready.append((cb, args))
            if self.ready:
                cb, args = self.ready.pop(0)
                cb(*args)
            elif self.scheduled:
                time.sleep(max(0, self.scheduled[0][0] - now))

loop = MiniLoop()
log = []
def task_a():
    log.append("A start")
    loop.call_later(0.05, task_a_done)
def task_a_done():
    log.append("A done")
    loop.stop()
loop.call_soon(task_a)
loop.run_until_complete()
print(f"  调度日志: {log}")

print("\\n--- 7. selectors IO 多路复用 ---")
print(f"  默认选择器: {selectors.DefaultSelector().__class__.__name__}")
print(f"  可用选择器: EpollSelector/KqueueSelector/SelectSelector")

print("\\n--- 8. gather 任务聚合 ---")
async def main_gather():
    async def fetch(url, delay):
        await asyncio.sleep(delay)
        return f"data-{url}"
    start = time.time()
    results = await asyncio.gather(
        fetch("a", 0.1),
        fetch("b", 0.15),
        fetch("c", 0.05),
    )
    elapsed = time.time() - start
    return results, elapsed

results, elapsed = asyncio.run(main_gather())
print(f"  gather 3 任务结果: {results}")
print(f"  总耗时: {elapsed:.3f}s (取最长)")

print("\\n--- 9. wait_for 超时控制 ---")
async def main_timeout():
    async def slow():
        await asyncio.sleep(10)
        return "done"
    try:
        await asyncio.wait_for(slow(), timeout=0.1)
    except asyncio.TimeoutError:
        print("  超时触发 (0.1s)")
    print("  异常已捕获，未阻塞 10s")

asyncio.run(main_timeout())

print("\\n--- 10. Queue 生产者消费者 ---")
async def main_queue():
    q = asyncio.Queue(maxsize=3)
    produced = []
    consumed = []

    async def producer():
        for i in range(5):
            await q.put(i)
            produced.append(i)
            await asyncio.sleep(0.01)

    async def consumer():
        while True:
            item = await q.get()
            if item is None:
                break
            consumed.append(item)
            await asyncio.sleep(0.02)
        q.task_done()

    cons_task = asyncio.create_task(consumer())
    await producer()
    await q.put(None)
    await cons_task
    return produced, consumed

p, c = asyncio.run(main_queue())
print(f"  生产: {p}")
print(f"  消费: {c}")

print("\\n--- 11. 阻塞调用 executor 包装 ---")
def blocking_cpu_task(n):
    total = 0
    for i in range(n):
        total += i * i
    return total

async def main_executor():
    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(None, blocking_cpu_task, 1_000_000)
    print(f"  CPU 任务结果: {result}")
    print("  (在线程池执行，未阻塞事件循环)")

asyncio.run(main_executor())

print("\\n--- 12. 取消任务 ---")
async def main_cancel():
    async def long_task():
        try:
            await asyncio.sleep(10)
            return "completed"
        except asyncio.CancelledError:
            print("    任务被取消")
            raise

    task = asyncio.create_task(long_task())
    await asyncio.sleep(0.05)
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print("  主协程捕获到取消")

asyncio.run(main_cancel())

print("\\n--- 13. 最佳实践速查 ---")
tips = [
    "入口用 asyncio.run(main())",
    "并发用 gather，不要串行 await",
    "协程内绝不阻塞，用 run_in_executor",
    "超时用 wait_for 防永久挂起",
    "取消任务处理 CancelledError",
    "Queue 用于生产者消费者通信",
    "3.11+ 用 TaskGroup 替代 gather",
    "长连接用 async with 确保清理",
]
for i, t in enumerate(tips, 1):
    print(f"  {i}. {t}")

print("\\n=== asyncio 事件循环演示结束 ===")`
  },
  {
    id: "py6-gil-deep2",
    group: "重点深化",
    icon: "🔒",
    title: "GIL 实现细节与性能实测",
    content: `## GIL 实现细节与性能实测

GIL（Global Interpreter Lock，全局解释器锁）是 CPython 最具争议的设计。本文从源码位置、释放时机、性能影响、替代方案全面剖析。

### 一、GIL 是什么

GIL 是一把**进程级互斥锁**，同一进程内同一时刻只有一个线程能执行 Python 字节码。它只存在于 CPython，Jython、IronPython、PyPy（部分场景）没有 GIL。

**为什么需要 GIL**：
1. CPython 的引用计数内存管理不是线程安全的，加锁保护每个引用计数开销太大
2. C 扩展（如 numpy）大量调用 C 代码，GIL 简化了扩展开发
3. 早期单核时代，GIL 让单线程更快（无锁开销）

### 二、GIL 在 CPython 源码中的位置

在 CPython 源码 \`Python/ceval_gil.c\` 中定义：

\`\`\`c
struct _gil_runtime_state {
    unsigned int interval;       // 切换间隔，默认 5ms
    _Py_atomic_address locked;   // 锁状态
    uint64_t switch_counter;     // 切换计数
    PyThreadState *last_holder;  // 最后持有者
    ...
};
\`\`\`

GIL 存储在 \`_PyRuntimeState.gil\` 中，进程内全局唯一。每个线程执行字节码前必须先获取 GIL。

### 三、GIL 释放时机

GIL 在以下情况会释放：

1. **IO 操作**：\`socket.recv\`、\`file.read\`、\`time.sleep\` 等会主动释放 GIL
2. **定时切换**：\`sys.setswitchinterval\`（默认 5ms）到时间后，当前线程在下一个安全点让出 GIL
3. **C 扩展主动释放**：\`Py_BEGIN_ALLOW_THREADS\` / \`Py_END_ALLOW_THREADS\` 宏
4. **GIL 请求挂起**：其他线程请求 GIL 时，持有者在安全点检查并让出

\`\`\`python
import sys
print(sys.getswitchinterval())   # 0.005（5ms）
sys.setswitchinterval(0.001)     # 改为 1ms
\`\`\`

### 四、GIL 与线程安全

**GIL 不能保证线程安全！** 它只保证字节码级别的原子性，但一条 Python 语句可能对应多条字节码：

\`\`\`python
counter = 0
def increment():
    global counter
    counter += 1   # LOAD_GLOBAL + LOAD_CONST + BINARY_ADD + STORE_GLOBAL
\`\`\`

\`counter += 1\` 不是原子操作，多线程下仍然会丢失更新。必须用 \`threading.Lock\` 或 \`queue\`。

> ⚠️ **避坑提示**：以为有 GIL 就不用锁，是多线程 bug 最常见的根因。

### 五、GIL 对 CPU 密集型的影响实测

CPU 密集型任务下，多线程因 GIL 实际是串行的，再加上线程切换开销，反而比单线程慢：

\`\`\`python
def cpu_task(n):
    total = 0
    for i in range(n):
        total += i * i
    return total

# 单线程: 1.0s
# 2 线程: ~1.2s（更慢）
# 2 进程: ~0.55s（接近 2x 加速）
\`\`\`

### 六、多线程 vs 多进程性能对比

| 任务类型 | 单线程 | 多线程 | 多进程 |
|----------|--------|--------|--------|
| CPU 密集 | 1.0x | ≤1.0x（更慢） | ~N x |
| IO 密集 | 1.0x | ~N x | ~N x（开销大） |
| 混合 | 1.0x | IO 部分 N x | 全部 N x |

IO 任务下多线程收益明显，因为 IO 等待时释放 GIL，其他线程可执行。

### 七、GIL 与 C 扩展

C 扩展可在执行耗时 C 代码前释放 GIL，让其他线程并行：

\`\`\`c
Py_BEGIN_ALLOW_THREADS  // 释放 GIL
result = heavy_c_computation();
Py_END_ALLOW_THREADS    // 重新获取 GIL
\`\`\`

numpy、pandas、hashlib（OpenSSL）等都会释放 GIL，所以多线程在 numpy 计算时能真正并行。

\`\`\`python
import numpy as np
# numpy 大数组计算会释放 GIL，多线程可并行
\`\`\`

### 八、Python 3.13 no-GIL 实验特性

PEP 703 提出的 free-threaded Python 在 3.13 作为实验特性：

\`\`\`bash
# 编译 free-threaded 版本
./configure --disable-gil
make
\`\`\`

特性：
- 移除 GIL，改用 biased reference counting + 延迟引用计数
- C 扩展需重新编译并标记 \`PyUnstable_Tail_CallInterp\`
- 单线程性能略有损失（约 5-10%），多线程 CPU 任务接近线性加速
- 3.13 是实验阶段，3.14+ 逐步稳定，未来默认开启

### 九、业务场景：并发选择决策

\`\`\`
任务类型？
├─ CPU 密集 → multiprocessing / C 扩展 / asyncio + executor
├─ IO 密集
│   ├─ 连接数 < 100 → 多线程 threading
│   ├─ 连接数 100~10k → asyncio
│   └─ 连接数 > 10k → asyncio + uvloop
└─ 混合 → asyncio + run_in_executor 包裹 CPU 部分
\`\`\`

### 十、替代方案

1. **multiprocessing**：每个进程独立 GIL，但 IPC 开销大、内存翻倍
2. **subprocess**：调用外部程序，无 GIL 干扰
3. **C 扩展释放 GIL**：写 Cython/C 扩展，\`with nogil:\` 块
4. **PyPy STM**：软件事务内存实验分支，未广泛使用
5. **free-threaded Python**：3.13+ no-GIL，未来方向
6. **分布式**：Celery / Ray / Dask 多进程多机

### 十一、GIL 内部调度机制

GIL 的等待与释放流程：

\`\`\`
线程 A 持有 GIL 执行字节码
        │
        │  5ms 计时到 / IO 阻塞
        ▼
   释放 GIL，设置 drop_gil
        │
        ▼
线程 B 在 eval_breaker 检查点
        │
        ▼
   抢占 GIL（set 当 locked 状态）
        │
        ▼
线程 B 持有 GIL 执行字节码
\`\`\`

3.2+ 版本 GIL 用条件变量 + 锁实现，避免了早期版本"惊群效应"。

### 十二、对比表

| 方案 | 并行度 | 内存 | 通信成本 | 适用 |
|------|--------|------|----------|------|
| threading + GIL | 1（CPU）/ N（IO） | 低 | 共享内存 | IO 密集 |
| multiprocessing | N（CPU） | 高 | IPC | CPU 密集 |
| asyncio | 1（CPU）/ N（IO） | 极低 | 协程内 | 高并发 IO |
| C 扩展 nogil | N | 中 | C API | numpy 等 |
| free-threaded | N | 中 | 共享 | 未来方向 |

### 十三、最佳实践

1. CPU 密集型任务用 \`multiprocessing\`，不要用 threading
2. IO 密集型用 threading（少量连接）或 asyncio（大量连接）
3. numpy 等已释放 GIL 的库可放心用多线程
4. 共享状态用 \`queue\` 或 \`multiprocessing.Manager\`
5. 进程池大小 = CPU 核数，线程池大小 = IO 等待比例 × 核数
6. 3.13+ 关注 free-threaded 进展，逐步迁移
7. 用 \`concurrent.futures\` 统一 API，方便切换线程/进程池
8. 慎用 \`threading.Lock\` 跨 GIL，性能损失叠加`,
    code: `# GIL 实现细节与性能实测演示
import sys
import time
import timeit
import threading
import multiprocessing
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

print("=== GIL 实现细节与性能实测演示 ===\\n")

print("--- 1. GIL 基本参数 ---")
print(f"  切换间隔: {sys.getswitchinterval()*1000:.1f}ms")
print(f"  线程数限制: 无硬限制（受系统）")
print(f"  CPU 核数: {multiprocessing.cpu_count()}")

print("\\n--- 2. GIL 不保证线程安全 ---")
counter = 0
lock = threading.Lock()

def unsafe_increment(n):
    global counter
    for _ in range(n):
        counter += 1

def safe_increment(n):
    global counter
    for _ in range(n):
        with lock:
            counter += 1

counter = 0
threads = [threading.Thread(target=unsafe_increment, args=(100000,)) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
print(f"  无锁 4线程×10w: counter = {counter} (期望 400000)")

counter = 0
threads = [threading.Thread(target=safe_increment, args=(100000,)) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
print(f"  加锁 4线程×10w: counter = {counter} (期望 400000)")

print("\\n--- 3. CPU 密集型：单线程 vs 多线程 vs 多进程 ---")
def cpu_task(n):
    total = 0
    for i in range(n):
        total += i * i
    return total

N = 2_000_000

t0 = time.time()
r1 = cpu_task(N)
t1 = time.time() - t0
print(f"  单线程: {t1:.3f}s 结果={r1}")

t0 = time.time()
with ThreadPoolExecutor(max_workers=2) as pool:
    results = list(pool.map(cpu_task, [N, N]))
t2 = time.time() - t0
print(f"  2线程:  {t2:.3f}s 结果={results[0]} (受 GIL 限制)")

mp_ctx = multiprocessing.get_context('fork')
t0 = time.time()
try:
    with ProcessPoolExecutor(max_workers=2, mp_context=mp_ctx) as pool:
        results = list(pool.map(cpu_task, [N, N]))
    t3 = time.time() - t0
    print(f"  2进程:  {t3:.3f}s 结果={results[0]} (真正并行)")
    print(f"  多线程加速: {t1/t2:.2f}x (≤1 说明被 GIL 拖累)")
    print(f"  多进程加速: {t1/t3:.2f}x (应接近 2x)")
except Exception as e:
    t3 = t1 / 2
    print(f"  2进程: 跳过 ({type(e).__name__}), 理论加速 2x")

print("\\n--- 4. IO 密集型：多线程能并行 ---")
def io_task(n):
    time.sleep(n)
    return n

t0 = time.time()
with ThreadPoolExecutor(max_workers=4) as pool:
    list(pool.map(io_task, [0.1]*4))
t_thread = time.time() - t0
print(f"  4线程 IO(0.1s): {t_thread:.3f}s (应≈0.1s)")

t0 = time.time()
for _ in range(4):
    io_task(0.1)
t_serial = time.time() - t0
print(f"  串行 IO(0.1s×4): {t_serial:.3f}s (应≈0.4s)")
print(f"  加速比: {t_serial/t_thread:.2f}x")

print("\\n--- 5. 切换间隔对性能影响 ---")
def benchmark_switch(interval):
    sys.setswitchinterval(interval)
    counter = [0]
    def work():
        for _ in range(500000):
            counter[0] += 1
    threads = [threading.Thread(target=work) for _ in range(2)]
    t0 = time.time()
    for t in threads: t.start()
    for t in threads: t.join()
    sys.setswitchinterval(0.005)
    return time.time() - t0

t_default = benchmark_switch(0.005)
t_short = benchmark_switch(0.0001)
t_long = benchmark_switch(0.05)
print(f"  5ms 切换间隔: {t_default:.3f}s")
print(f"  0.1ms 切换间隔: {t_short:.3f}s")
print(f"  50ms 切换间隔: {t_long:.3f}s")

print("\\n--- 6. 模拟 GIL 竞争（伪代码演示） ---")
print("  CPython GIL 状态机:")
print("    [无锁] → 线程请求 → [线程 A 持有]")
print("    [线程 A 持有] → 5ms 到 → [A 释放, B 抢占]")
print("    [线程 B 持有] → IO 阻塞 → [B 释放, A 抢占]")

print("\\n--- 7. C 扩展释放 GIL 模拟 ---")
print("  Py_BEGIN_ALLOW_THREADS / Py_END_ALLOW_THREADS 宏:")
print("    numpy 大数组运算 -> 释放 GIL -> 多线程真正并行")
print("    hashlib.sha256 大文件 -> 释放 GIL -> 多线程并行哈希")

import hashlib
def hash_work(data):
    for _ in range(100):
        hashlib.sha256(data).digest()

data = b"x" * 100000
t0 = time.time()
hash_work(data)
t1_hash = time.time() - t0

t0 = time.time()
with ThreadPoolExecutor(max_workers=2) as pool:
    list(pool.map(hash_work, [data, data]))
t2_hash = time.time() - t0
print(f"  单线程哈希: {t1_hash:.3f}s")
print(f"  2线程哈希:  {t2_hash:.3f}s (hashlib 释放 GIL, 应接近 1x)")
print(f"  加速比: {t1_hash/t2_hash:.2f}x")

print("\\n--- 8. multiprocessing 进程池 ---")
def cpu_heavy(n):
    return sum(i * i for i in range(n))

mp_ctx2 = multiprocessing.get_context('fork')
t0 = time.time()
try:
    with ProcessPoolExecutor(max_workers=4, mp_context=mp_ctx2) as pool:
        results = list(pool.map(cpu_heavy, [N//2]*4))
    t_proc = time.time() - t0
    print(f"  4进程 CPU 任务: {t_proc:.3f}s")
    print(f"  4 倍并行理论加速 4x, 实际: {t1/t_proc:.2f}x")
except Exception as e:
    print(f"  4进程 CPU 任务: 跳过 ({type(e).__name__})")

print("\\n--- 9. concurrent.futures 统一 API ---")
def task(n):
    return n * n

with ThreadPoolExecutor(max_workers=4) as pool:
    r = list(pool.map(task, range(10)))
print(f"  线程池 map: {r}")

print("\\n--- 10. 并发选择决策树 ---")
print("  CPU 密集 -> multiprocessing / C 扩展")
print("  IO 少量连接 -> threading")
print("  IO 大量连接 -> asyncio")
print("  混合负载 -> asyncio + run_in_executor")

print("\\n--- 11. Python 3.13 no-GIL 状态 ---")
print(f"  当前 Python 版本: {sys.version.split()[0]}")
print("  PEP 703 free-threaded:")
print("    - 3.13 实验性 (--disable-gil 编译)")
print("    - 3.14+ 逐步稳定")
print("    - 单线程性能损失 5-10%")
print("    - 多线程 CPU 任务接近线性加速")

print("\\n--- 12. 最佳实践速查 ---")
tips = [
    "CPU 密集用 multiprocessing",
    "IO 密集用 threading 或 asyncio",
    "GIL 不保证线程安全，仍需 Lock",
    "numpy/hashlib 释放 GIL 可并行",
    "进程池大小 = CPU 核数",
    "线程池大小 = IO 比例 × 核数",
    "用 concurrent.futures 统一 API",
    "3.13+ 关注 free-threaded 进展",
]
for i, t in enumerate(tips, 1):
    print(f"  {i}. {t}")

print("\\n=== GIL 实现细节演示结束 ===")`
  },
  {
    id: "py6-typing-deep",
    group: "重点深化",
    icon: "🏷️",
    title: "类型系统原理与 mypy 内部",
    content: `## 类型系统原理与 mypy 内部

Python 类型提示（PEP 484）是渐进式类型化的典型实现。理解它需要区分运行时与静态检查、协变逆变、泛型擦除等概念。

### 一、类型提示的运行时行为（不强制）

Python 类型提示**默认在运行时不做任何检查**，它们只是注解：

\`\`\`python
def add(x: int, y: int) -> int:
    return x + y

add("a", "b")  # 运行时不报错，返回 "ab"
\`\`\`

类型注解存储在 \`__annotations__\` 中，运行时可访问：

\`\`\`python
print(add.__annotations__)
# {'x': <class 'int'>, 'y': <class 'int'>, 'return': <class 'int'>}
\`\`\`

但 Python 不会主动检查。要强制检查需要 mypy / pyright / pytype 等静态分析工具，或用 \`@typeguard\` / \`pydantic\` 在运行时检查。

### 二、typing 模块的实现

\`typing\` 模块的核心是 \`Generic\` 与 \`__class_getitem__\`：

\`\`\`python
class List(list, Generic[T]):
    def __class_getitem__(cls, item):
        return _GenericAlias(cls, item)  # 返回别名，不是真类
\`\`\`

\`List[int]\` 实际上不创建新类，而是返回一个 \`_GenericAlias\` 对象，记录"List 参数化为 int"。运行时 \`isinstance([1,2], List[int])\` 会抛 TypeError（参数化泛型不能用于 isinstance）。

\`\`\`python
from typing import List
print(type(List[int]))  # <class 'typing._GenericAlias'>
\`\`\`

### 三、协变 covariance 与逆变 contravariant

这是类型系统最绕的概念。给定 \`List[Derived]\` 是否是 \`List[Base]\` 的子类型？

- **协变（Covariant）**：\`Derived <: Base\` ⟹ \`T[Derived] <: T[Base]\`。如 \`Tuple\`、\`FrozenSet\`、\`Iterator\`（只读场景）
- **逆变（Contravariant）**：\`Derived <: Base\` ⟹ \`T[Base] <: T[Derived]\`。如函数参数
- **不变（Invariant）**：默认。如 \`List\`，因为可读可写

\`\`\`python
from typing import TypeVar, List, Tuple

T_co = TypeVar("T_co", covariant=True)
T_contra = TypeVar("T_contra", contravariant=True)

class Producer(Generic[T_co]):
    def get(self) -> T_co: ...    # 只输出，协变安全

class Consumer(Generic[T_contra]):
    def put(self, x: T_contra): ...  # 只输入，逆变安全

class Container(Generic[T]):       # 不变，可读可写
    def get(self) -> T: ...
    def put(self, x: T): ...
\`\`\`

口诀：**只读协变、只写逆变、读写不变**。

### 四、泛型擦除 vs 运行时保留

Python 的泛型在运行时**大部分被擦除**：

\`\`\`python
def f(x: List[int]) -> None: ...
print(f.__annotations__)  # {'x': typing.List[int]}

container = []
container.append("string")  # 运行时不报错，List[int] 被擦除
\`\`\`

但 \`__orig_bases__\` 保留了泛型信息，pydantic 等库利用它实现运行时类型检查：

\`\`\`python
class GenericModel(BaseModel, Generic[T]):
    __orig_bases__ = (BaseModel, Generic[T])
\`\`\`

### 五、mypy 的工作流程

mypy 是主流的静态类型检查器，工作流程：

\`\`\`
源码 (.py)
   │
   ▼
1. 解析 (parse) → AST
   │
   ▼
2. 语义分析 (semanal)
   │  - 收集类型定义、TypeVar、class 定义
   │  - 处理 import，建立符号表
   ▼
3. 类型检查 (check)
   │  - 推导表达式类型
   │  - 函数签名检查
   │  - 子类型判断（协变/逆变）
   ▼
4. 报告错误
\`\`\`

mypy 内部用 \`mypy.types\` 模块表示类型 AST，例如 \`Instance\`、\`CallableType\`、\`UnionType\`、\`TypeVarType\`。它实现了 Hindley-Milner 风格的类型推导，但加入了子类型多态。

### 六、渐进式类型化 gradual typing

Python 类型系统是**渐进式**的：可以一部分代码有类型，另一部分没有。\`Any\` 类型是"任意类型"，与任何类型兼容：

\`\`\`python
def f(x: Any) -> Any:
    return x   # 不报错

def g(x: int) -> int:
    return x + f("string")  # mypy 不报错（Any 兼容 int）
\`\`\`

\`object\` 是另一个极端：所有类型都是 \`object\` 的子类，但 \`object\` 不兼容其他类型（需显式 cast）。区分 \`Any\` 和 \`object\` 是类型严格度的关键。

### 七、stub 文件 .pyi

\`.pyi\` 文件只包含类型签名，不含实现。用途：

1. **第三方库无类型注解**：用 stub 文件补充（\`types-requests\` 包）
2. **C 扩展**：pybind11、Cython 模块用 stub 暴露类型
3. **类型缓存**：mypy 解析 stub 比源码快

\`\`\`python
# requests.pyi
def get(url: str, **kwargs) -> Response: ...

class Response:
    status_code: int
    def json(self) -> Any: ...
\`\`\`

\`typeshed\` 是 CPython 维护的标准库 stub 仓库，mypy 自带。

### 八、类型窄化 type narrowing

mypy 通过控制流分析**窄化**类型：

\`\`\`python
def f(x: int | None):
    if x is not None:
        # 这里 x 窄化为 int
        print(x + 1)
    else:
        # 这里 x 是 None
        print("none")
\`\`\`

窄化规则：
- \`isinstance(x, T)\` → 窄化为 T
- \`x is None\` / \`x is not None\` → 排除 None
- \`x == "a"\` → 字面量窄化
- \`assert isinstance(x, T)\` → 后续窄化
- \`TypeGuard\` (3.10+) 自定义窄化函数

\`\`\`python
from typing import TypeGuard

def is_str_list(x: list) -> TypeGuard[list[str]]:
    return all(isinstance(i, str) for i in x)

def f(x: list):
    if is_str_list(x):
        # x 窄化为 list[str]
        print(x[0].upper())
\`\`\`

### 九、业务场景

- **大型项目类型安全**：百万行代码无类型 → 引入 mypy 减少运行时 TypeError
- **库 API 文档**：类型注解比文档更准确，IDE 自动补全
- **数据建模**：pydantic 用类型注解自动校验、序列化
- **重构保护**：改函数签名时 mypy 立即报告所有调用点
- **FastAPI**：类型注解驱动 OpenAPI 文档生成与参数校验

### 十、类型系统的局限

1. **运行时不强制**：需要外部工具
2. **复杂泛型**：\`Callable[[int], str]\` 难读
2. **递归类型**：JSON 类型 \`Any\` 退化
3. **第三方库无类型**：需要 stub
4. **性能损失**：mypy 检查大型项目很慢
5. **过度类型化**：到处 \`Any\` 等于没类型
6. **运行时反射**：动态属性、装饰器让类型检查失效

### 十一、对比表

| 工具 | 实现语言 | 速度 | 严格度 | 特性 |
|------|----------|------|--------|------|
| mypy | Python | 慢 | 中 | 主流，PEP 484 完整 |
| pyright | TS | 极快 | 高 | 微软，VSCode 默认 |
| pytype | Python | 中 | 低 | Google，可推导无注解 |
| pyre | OCaml | 快 | 中 | Meta |
| pydantic | Python | - | 运行时 | 运行时校验 |

### 十二、最佳实践

1. 新项目从第一天起就加类型，比后期补容易 100 倍
2. 用 \`strict\` 模式逐步收紧：\`disallow_untyped_defs\`、\`warn_return_any\`
3. 复杂类型用 \`TypeAlias\` 起别名
4. 公共 API 必须有类型，内部函数可选
5. 用 \`Protocol\` 替代 \`ABC\` 做结构子类型
6. 慎用 \`Any\`，优先 \`object\` 或泛型
7. 配置 \`mypy.ini\` 排除 vendored 代码
8. CI 中跑 mypy，但允许少量 \`# type: ignore\``,
    code: `# 类型系统原理与 mypy 内部演示
import typing
import inspect
from typing import (
    TypeVar, Generic, List, Tuple, Callable,
    Any, Union, Optional, Protocol, TypeAlias
)

print("=== 类型系统原理与 mypy 内部演示 ===\\n")

print("--- 1. 类型注解的运行时行为 ---")
def add(x: int, y: int) -> int:
    return x + y

print(f"  add.__annotations__ = {add.__annotations__}")
print(f"  add('a', 'b') = {add('a', 'b')}  (运行时不报错)")
print("  -> 类型注解只是元数据，运行时不强制")

print("\\n--- 2. typing 模块实现 ---")
print(f"  type(List[int]) = {type(List[int]).__name__}")
print(f"  List[int].__origin__ = {List[int].__origin__}")
print(f"  List[int].__args__ = {List[int].__args__}")
print("  -> List[int] 不是真类，是 _GenericAlias")

print("\\n--- 3. 泛型 Generic 与 __class_getitem__ ---")
T = TypeVar("T")
class Stack(Generic[T]):
    def __init__(self):
        self._items = []
    def push(self, x: T) -> None:
        self._items.append(x)
    def pop(self) -> T:
        return self._items.pop()

s: Stack[int] = Stack()
s.push(1)
print(f"  Stack[int] 类型: {type(Stack[int]).__name__}")
print(f"  Stack.__orig_bases__ = {Stack.__orig_bases__}")
print(f"  s.pop() = {s.pop()}")

print("\\n--- 4. 协变/逆变/不变 ---")
T_co = TypeVar("T_co", covariant=True)
T_contra = TypeVar("T_contra", contravariant=True)

class Producer(Generic[T_co]):
    def get(self) -> T_co: ...

class Consumer(Generic[T_contra]):
    def put(self, x: T_contra) -> None: ...

print("  Tuple[T]: 协变 (Derived→Base 安全)")
print("  List[T]:  不变 (可读可写)")
print("  Callable[[], T]: 协变 (返回值)")
print("  Callable[[T], R]: 逆变 (参数)")

print("\\n--- 5. Any vs object ---")
def f_any(x: Any) -> Any:
    return x + 1   # mypy 不报错

def f_obj(x: object) -> object:
    return x   # mypy: 不允许 x + 1
print("  Any: 与任何类型兼容，相当于关掉类型检查")
print("  object: 所有类型父类，但操作受限")
print(f"  Any 类型: {Any}")
print(f"  object 类型: {object}")

print("\\n--- 6. Union / Optional ---")
def parse(x: Union[int, str]) -> Optional[int]:
    if isinstance(x, int):
        return x
    try:
        return int(x)
    except:
        return None

print(f"  parse(42) = {parse(42)}")
print(f"  parse('42') = {parse('42')}")
print(f"  parse('x') = {parse('x')}")
print(f"  Union[int, str] = {Union[int, str]}")
print(f"  Optional[int] = {Optional[int]} (等价 Union[int, None])")

print("\\n--- 7. Protocol 结构子类型 ---")
class Sized(Protocol):
    def __len__(self) -> int: ...

def get_size(x: Sized) -> int:
    return len(x)

print(f"  get_size([1,2,3]) = {get_size([1,2,3])}")
print(f"  get_size('hello') = {get_size('hello')}")
print(f"  get_size({{'a':1}}) = {get_size({'a':1})}")
print("  -> Protocol 不需要显式继承，鸭子类型")

print("\\n--- 8. 类型窄化演示 ---")
def process(x: Union[int, str, None]) -> str:
    if x is None:
        return "null"
    elif isinstance(x, int):
        return f"int: {x + 1}"
    else:
        return f"str: {x.upper()}"

print(f"  process(None) = {process(None)}")
print(f"  process(42) = {process(42)}")
print(f"  process('hi') = {process('hi')}")
print("  -> isinstance/is None 触发类型窄化")

print("\\n--- 9. TypeAlias 类型别名 ---")
Json: TypeAlias = Union[dict, list, str, int, float, bool, None]
def parse_json(s: str) -> Json:
    import json
    return json.loads(s)

result = parse_json('{"a": 1, "b": [2, 3]}')
print(f"  parse_json: {result}")
print(f"  Json 别名: {Json}")

print("\\n--- 10. TypeVar 约束 ---")
T_bound = TypeVar("T_bound", bound=int)
T_constrained = TypeVar("T_constrained", int, str)

def max_of(a: T_bound, b: T_bound) -> T_bound:
    return a if a > b else b

print(f"  max_of(3, 7) = {max_of(3, 7)}")
print(f"  bound=int: 仅接受 int 子类")
print(f"  constraints=int,str: 仅接受 int 或 str")

print("\\n--- 11. inspect 获取类型信息 ---")
def example(x: int, y: str = "a", *args: float, **kwargs: bool) -> List[int]:
    return [x]

sig = inspect.signature(example)
for name, param in sig.parameters.items():
    print(f"  {name}: annotation={param.annotation}, default={param.default}")

print("\\n--- 12. pydantic 风格运行时校验（简化） ---")
def validate_kwargs(cls, **kwargs):
    annotations = getattr(cls, '__annotations__', {})
    errors = []
    for name, value in kwargs.items():
        expected = annotations.get(name)
        if expected and not isinstance(value, expected):
            errors.append(f"{name}: 期望 {expected.__name__}, 得到 {type(value).__name__}")
    return errors

class User:
    name: str
    age: int

print(f"  User(name='Alice', age=30): {validate_kwargs(User, name='Alice', age=30)}")
print(f"  User(name=42, age='x'): {validate_kwargs(User, name=42, age='x')}")

print("\\n--- 13. mypy 工作流程 ---")
print("  1. 解析: 源码 → AST")
print("  2. 语义分析: 收集类型定义、TypeVar、符号表")
print("  3. 类型检查: 推导表达式类型、签名检查、子类型判断")
print("  4. 报告错误")
print("  mypy --strict main.py")

print("\\n--- 14. 最佳实践速查 ---")
tips = [
    "新项目第一天起加类型，比后期补容易 100 倍",
    "用 strict 模式: disallow_untyped_defs",
    "复杂类型用 TypeAlias 起别名",
    "公共 API 必须有类型",
    "用 Protocol 替代 ABC 做结构子类型",
    "慎用 Any，优先 object 或泛型",
    "CI 中跑 mypy，允许少量 type: ignore",
    "stub 文件 .pyi 用于无类型库",
]
for i, t in enumerate(tips, 1):
    print(f"  {i}. {t}")

print("\\n=== 类型系统原理演示结束 ===")`
  },
  {
    id: "py6-iterator-deep",
    group: "重点深化",
    icon: "🔁",
    title: "迭代器协议与 for 循环本质",
    content: `## 迭代器协议与 for 循环本质

迭代器是 Python 最核心的协议之一，for 循环、生成器、推导式都建立在它之上。理解它需要从字节码、协议设计、惰性求值三个角度切入。

### 一、迭代器协议 __iter__/__next__

迭代器协议规定：**可迭代对象** 实现 \`__iter__\` 返回迭代器，**迭代器** 实现 \`__next__\` 返回下一个元素，无元素时抛 \`StopIteration\`。

\`\`\`python
class MyRange:
    def __init__(self, n):
        self.n = n
        self.i = 0
    def __iter__(self):       # 可迭代协议
        return self
    def __next__(self):       # 迭代器协议
        if self.i >= self.n:
            raise StopIteration
        value = self.i
        self.i += 1
        return value

for x in MyRange(3):
    print(x)  # 0 1 2
\`\`\`

**关键区分**：
- 可迭代对象（Iterable）：有 \`__iter__\`，可被 \`for\`/ \`iter()\` 调用
- 迭代器（Iterator）：有 \`__iter__\` 和 \`__next__\`，\`__iter__\` 返回自身
- 迭代器是一次性的，耗尽后不能复用

### 二、for 循环的本质

\`for x in iterable\` 等价于：

\`\`\`python
iter_obj = iter(iterable)   # 调用 __iter__
while True:
    try:
        x = next(iter_obj)  # 调用 __next__
    except StopIteration:
        break
    # 循环体
\`\`\`

\`iter()\` 内部对**序列类型**（有 \`__getitem__\`）做了降级处理：自动创建一个按索引访问的迭代器。所以古老风格的序列也能被 \`for\` 遍历。

\`\`\`python
class LegacySeq:
    def __getitem__(self, i):
        if i >= 3: raise IndexError
        return i * 10

for x in LegacySeq():
    print(x)  # 0 10 20
\`\`\`

### 三、用 dis 查看 for 循环字节码

\`\`\`python
import dis
def f():
    for x in [1, 2, 3]:
        print(x)

dis.dis(f)
\`\`\`

关键指令：
- \`GET_ITER\`：调用 \`iter()\` 把可迭代对象转成迭代器
- \`FOR_ITER\`：调用 \`__next__\`，捕获 StopIteration 跳出循环
- \`STORE_FAST\`：把当前元素存到本地变量
- \`JUMP_ABSOLUTE\`：回到 FOR_ITER 形成循环

\`\`\`
GET_ITER                  # it = iter([1,2,3])
>> FOR_ITER  -> end       # x = next(it); except StopIteration: goto end
   STORE_FAST x           # 绑定 x
   LOAD_GLOBAL print
   LOAD_FAST x
   CALL
   POP_TOP
   JUMP_ABSOLUTE >>       # 回到 FOR_ITER
end:
\`\`\`

### 四、GET_ITER/FOR_ITER 指令

\`GET_ITER\`：从栈顶取可迭代对象，调用 \`PyObject_GetIter\`，等价于 \`iter(obj)\`，结果压栈。

\`FOR_ITER\`：从栈顶取迭代器，调用 \`PyIter_Next\`：
- 返回非 NULL：结果压栈，继续循环体
- 返回 NULL 且异常是 StopIteration：清空异常，跳转到目标地址
- 返回 NULL 且其他异常：抛出

这两条指令让 for 循环在 CPython 中极高效。

### 五、生成器是迭代器

\`yield\` 关键字让函数变成生成器函数，调用后返回生成器对象（一种迭代器）：

\`\`\`python
def my_range(n):
    i = 0
    while i < n:
        yield i
        i += 1

g = my_range(3)        # 不执行函数体
print(type(g))         # <class 'generator'>
print(next(g))         # 0，执行到 yield
print(next(g))         # 1
print(next(g))         # 2
print(next(g))         # StopIteration
\`\`\`

生成器对象实现了 \`__iter__\`（返回自身）和 \`__next__\`，所以它就是迭代器。

生成器的字节码用 \`GEN_START\`、\`YIELD_VALUE\`、\`RESUME\` 等指令，调用 \`next\` 时执行到 \`YIELD_VALUE\` 挂起，再次 \`next\` 时从挂起点恢复。

### 六、itertools 模块

\`itertools\` 是迭代器的瑞士军刀，全部用 C 实现，性能极高：

| 函数 | 作用 |
|------|------|
| \`count(10)\` | 无限计数 10, 11, 12, ... |
| \`cycle('ABC')\` | 无限循环 A B C A B C ... |
| \`repeat(x, 5)\` | 重复 x 五次 |
| \`chain(a, b)\` | 串联多个迭代器 |
| \`islice(it, 5)\` | 切片（不支持负索引） |
| \`tee(it, 3)\` | 复制成 3 个独立迭代器 |
| \`starmap(f, pairs)\` | 拆包后调用 |
| \`filterfalse(pred, it)\` | 反向过滤 |
| \`takewhile/takewhile\` | 条件取/舍 |
| \`accumulate(it)\` | 累积求和 |
| \`groupby(it, key)\` | 分组 |
| \`product(a, b)\` | 笛卡尔积 |
| \`permutations(a, 3)\` | 排列 |
| \`combinations(a, 2)\` | 组合 |

\`\`\`python
from itertools import count, chain, islice, groupby
list(islice(count(10), 5))   # [10, 11, 12, 13, 14]
list(chain([1,2], [3,4]))     # [1, 2, 3, 4]
\`\`\`

### 七、惰性求值优势

迭代器最大的优势是**惰性**：只在需要时计算下一个值，不预先分配全部内存。

\`\`\`python
# 处理 10GB 文件，内存只占一行
with open("big.txt") as f:
    for line in f:           # 文件对象是迭代器
        process(line)

# 无限序列
from itertools import count
for i in count():
    if i > 100: break
    process(i)
\`\`\`

### 八、无限迭代器

\`count\`、\`cycle\`、\`repeat\` 可生成无限序列，必须配合 \`islice\`、\`zip\`、\`takewhile\` 等截断：

\`\`\`python
from itertools import count, islice
evens = (x for x in count() if x % 2 == 0)
print(list(islice(evens, 5)))  # [0, 2, 4, 6, 8]

# zip 自动按最短截断
for i, x in zip(range(3), count()):
    print(i, x)  # 0 0, 1 1, 2 2
\`\`\`

### 九、迭代器 vs 列表性能对比

| 场景 | 列表 | 迭代器 | 优势 |
|------|------|--------|------|
| 内存 | O(n) | O(1) | 迭代器 |
| 多次遍历 | 快 | 不支持 | 列表 |
| 索引访问 | O(1) | 不支持 | 列表 |
| 流式处理 | 全加载 | 边读边处理 | 迭代器 |
| 大数据 | 内存爆炸 | 平滑 | 迭代器 |
| 链式操作 | 中间结果 | 单遍流 | 迭代器 |

\`\`\`python
# 列表：每步生成完整列表
result = sum([x*x for x in range(10**8)])  # ~800MB 内存
# 生成器：单元素流
result = sum(x*x for x in range(10**8))    # ~0 内存
\`\`\`

### 十、业务场景

- **流式处理**：日志、CSV、JSON Lines 文件
- **大数据**：分块读取、MapReduce
- **管道**：Unix 风格的 \`grep | sort | uniq\`
- **生成器协程**：\`yield\` 接收值（\`send\`），是协程前身
- **惰性计算**：\`range\`、\`zip\`、\`map\` 都不立即计算
- **无限流**：传感器数据、消息队列

### 十一、避坑提示

1. **迭代器是一次性的**：耗尽后再遍历为空
2. **tee 不是免费的**：内部用队列缓存，N 个 tee 内存翻倍
3. **chain.from_iterable** 比 \`chain(*lists)\` 更高效
4. **list(it)** 会立即消费整个迭代器
5. **不要在 for 里修改正在遍历的列表**
6. **dict 迭代的是 key**，不是 value 或 (k, v)
7. **\`for i in range(len(x))\`** 是反模式，用 \`enumerate\`

### 十二、最佳实践

1. 优先用生成器表达式替代列表推导（省内存）
2. 链式处理用生成器，最后才 \`list()\` 物化
3. 自定义可迭代对象实现 \`__iter__\`（而非 \`__getitem__\`）
4. 用 \`enumerate\` 替代 \`range(len())\`
5. 用 \`zip\` 并行遍历多个序列
6. \`itertools\` 优先于手写循环
7. 大文件用 \`for line in file\` 流式处理
8. 生成器内不要 \`return value\`（3.3+ 才是 StopIteration.value）`,
    code: `# 迭代器协议与 for 循环本质演示
import dis
import timeit
import itertools
from itertools import count, cycle, chain, islice, groupby, accumulate, product

print("=== 迭代器协议与 for 循环本质演示 ===\\n")

print("--- 1. 自定义迭代器 ---")
class MyRange:
    def __init__(self, n):
        self.n = n
        self.i = 0
    def __iter__(self):
        return self
    def __next__(self):
        if self.i >= self.n:
            raise StopIteration
        v = self.i
        self.i += 1
        return v

print(f"  list(MyRange(5)) = {list(MyRange(5))}")
r = MyRange(3)
print(f"  next(r) = {next(r)}, {next(r)}, {next(r)}")
try:
    next(r)
except StopIteration:
    print("  next(r) 抛出 StopIteration")

print("\\n--- 2. for 循环本质 ---")
def manual_for(iterable):
    """用 while + iter + next 模拟 for"""
    iter_obj = iter(iterable)
    results = []
    while True:
        try:
            x = next(iter_obj)
        except StopIteration:
            break
        results.append(x)
    return results

print(f"  manual_for([1,2,3]) = {manual_for([1,2,3])}")
print(f"  manual_for('abc') = {manual_for('abc')}")
print(f"  manual_for(MyRange(4)) = {manual_for(MyRange(4))}")

print("\\n--- 3. 旧式 __getitem__ 序列 ---")
class LegacySeq:
    def __getitem__(self, i):
        if i >= 3: raise IndexError
        return i * 10

print(f"  list(LegacySeq()) = {list(LegacySeq())}")
print("  -> iter() 对序列自动降级为索引访问")

print("\\n--- 4. for 循环字节码 ---")
def demo_for():
    for x in [1, 2, 3]:
        print(x)

print("  for 循环字节码:")
dis.dis(demo_for)

print("\\n--- 5. 生成器是迭代器 ---")
def my_range_gen(n):
    i = 0
    while i < n:
        yield i
        i += 1

g = my_range_gen(5)
print(f"  type(g) = {type(g).__name__}")
print(f"  isinstance(g, Iterator) = {hasattr(g, '__iter__') and hasattr(g, '__next__')}")
print(f"  list(g) = {list(my_range_gen(5))}")
print(f"  生成器一次性: list(g) again = {list(g)} (空!)")

print("\\n--- 6. 生成器表达式 vs 列表推导 ---")
N = 10_000_000
t_list = timeit.timeit(lambda: sum([x*x for x in range(N)]), number=1)
t_gen = timeit.timeit(lambda: sum(x*x for x in range(N)), number=1)
print(f"  sum([x*x for ...]) 列表推导: {t_list:.3f}s")
print(f"  sum(x*x for ...)   生成器: {t_gen:.3f}s")
print(f"  生成器略慢但省内存")

print("\\n--- 7. itertools 无限迭代器 ---")
print(f"  count(10) 前5: {list(islice(count(10), 5))}")
print(f"  cycle('AB') 前6: {list(islice(cycle('AB'), 6))}")
print(f"  repeat('x', 3): {list(itertools.repeat('x', 3))}")

print("\\n--- 8. chain 串联 ---")
print(f"  chain([1,2], [3,4], [5]): {list(chain([1,2], [3,4], [5]))}")
nested = [[1,2], [3,4], [5,6]]
print(f"  chain.from_iterable: {list(chain.from_iterable(nested))}")

print("\\n--- 9. islice 切片 ---")
print(f"  islice(range(100), 5): {list(islice(range(100), 5))}")
print(f"  islice(range(100), 2, 8, 2): {list(islice(range(100), 2, 8, 2))}")
print("  (islice 不支持负索引)")

print("\\n--- 10. accumulate 累积 ---")
print(f"  accumulate([1,2,3,4]): {list(accumulate([1,2,3,4]))}")
import operator
print(f"  accumulate([1,2,3,4], mul): {list(accumulate([1,2,3,4], operator.mul))}")

print("\\n--- 11. groupby 分组 ---")
data = [('A', 1), ('A', 2), ('B', 3), ('A', 4), ('B', 5)]
data_sorted = sorted(data, key=lambda x: x[0])
for key, group in groupby(data_sorted, key=lambda x: x[0]):
    print(f"    {key}: {list(group)}")

print("\\n--- 12. product / permutations / combinations ---")
print(f"  product('AB', '12'): {list(product('AB', '12'))}")
print(f"  permutations('ABC', 2): {list(itertools.permutations('ABC', 2))}")
print(f"  combinations('ABC', 2): {list(itertools.combinations('ABC', 2))}")

print("\\n--- 13. tee 复制迭代器 ---")
it = iter(range(5))
a, b = itertools.tee(it, 2)
print(f"  a: {list(a)}")
print(f"  b: {list(b)}")
print("  (tee 内部缓存，原迭代器不可再用)")

print("\\n--- 14. 大文件流式处理模拟 ---")
def big_file_lines(n):
    """模拟大文件的行迭代器"""
    for i in range(n):
        yield f"line-{i}\\n"

line_count = 0
for line in big_file_lines(1000):
    line_count += 1
print(f"  流式处理 1000 行: 总计 {line_count} 行")
print("  (内存只占一行，可处理任意大文件)")

print("\\n--- 15. enumerate / zip 惯用法 ---")
for i, x in enumerate(['a', 'b', 'c']):
    print(f"    {i}: {x}", end=" | ")
print()
for a, b in zip([1, 2, 3], ['a', 'b', 'c']):
    print(f"    {a}-{b}", end=" | ")
print()

print("\\n--- 16. 性能对比：迭代器 vs 列表 ---")
def sum_list(n):
    return sum([x for x in range(n)])
def sum_iter(n):
    return sum(x for x in range(n))
def sum_range(n):
    return sum(range(n))   # range 本身是惰性序列

t1 = timeit.timeit(lambda: sum_list(1000000), number=5)
t2 = timeit.timeit(lambda: sum_iter(1000000), number=5)
t3 = timeit.timeit(lambda: sum_range(1000000), number=5)
print(f"  sum(list): {t1:.3f}s")
print(f"  sum(gen):  {t2:.3f}s")
print(f"  sum(range): {t3:.3f}s (最快, range 是 C 实现)")

print("\\n--- 17. 最佳实践速查 ---")
tips = [
    "优先用生成器表达式替代列表推导",
    "链式处理用生成器, 最后才 list()",
    "实现 __iter__ 而非 __getitem__",
    "用 enumerate 替代 range(len())",
    "用 zip 并行遍历",
    "itertools 优先于手写循环",
    "大文件用 for line in file",
    "迭代器一次性, 耗尽为空",
]
for i, t in enumerate(tips, 1):
    print(f"  {i}. {t}")

print("\\n=== 迭代器协议演示结束 ===")`
  },
  {
    id: "py6-descriptor-deep",
    group: "重点深化",
    icon: "🎛️",
    title: "描述符协议深度（property/方法实现）",
    content: `## 描述符协议深度（property/方法实现）

描述符是 Python 属性访问的底层机制，\`property\`、\`classmethod\`、\`staticmethod\`、实例方法绑定、ORM 字段全部建立在它之上。掌握描述符等于掌握 Python 对象模型的精髓。

### 一、描述符协议 __get__/__set__/__delete__

描述符是一个实现了以下任意方法的类：

\`\`\`python
class Descriptor:
    def __get__(self, obj, objtype=None):
        ...
    def __set__(self, obj, value):
        ...
    def __delete__(self, obj):
        ...
\`\`\`

- \`__get__\`：属性读取时调用
- \`__set__\`：属性赋值时调用
- \`__delete__\`：\`del\` 时调用

### 二、数据描述符 vs 非数据描述符

**关键区分**：定义了 \`__set__\` 或 \`__delete__\` 的是**数据描述符**，只定义 \`__get__\` 的是**非数据描述符**。两者在属性查找顺序中地位不同。

| 类型 | 定义方法 | 查找优先级 |
|------|----------|------------|
| 数据描述符 | \`__get__\` + \`__set__\`/\`__delete__\` | 高于 \`__dict__\` |
| 非数据描述符 | 仅 \`__get__\` | 低于 \`____dict__\` |

### 三、属性查找顺序（核心）

CPython 中 \`obj.x\` 的查找流程（\`_PyObject_GenericGetAttrWithDict\`）：

\`\`\`
obj.x 的查找顺序：
1. type(obj).__mro__ 上的【数据描述符】
2. obj.__dict__                       （实例属性）
3. type(obj).__mro__ 上的【非数据描述符】
4. type(obj).__mro__ 上的普通类属性
5. __getattr__ 兜底
6. 抛 AttributeError
\`\`\`

记忆口诀：**数据描述符 > 实例字典 > 非数据描述符**。

### 四、property 的实现本质（数据描述符）

\`property\` 是一个内置的数据描述符：

\`\`\`python
class Property:
    def __init__(self, fget=None, fset=None, fdel=None):
        self.fget = fget
        self.fset = fset
        self.fdel = fdel

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        if self.fget is None:
            raise AttributeError("unreadable")
        return self.fget(obj)

    def __set__(self, obj, value):
        if self.fset is None:
            raise AttributeError("can't set")
        self.fset(obj, value)

    def __delete__(self, obj):
        if self.fdel is None:
            raise AttributeError("can't delete")
        self.fdel(obj)

    def setter(self, fset):
        return type(self)(self.fget, fset, self.fdel)
\`\`\`

这就是 \`@property\` 装饰器的本质：\`@property\` 把方法包成 Property 数据描述符，\`@x.setter\` 调用 \`setter\` 方法返回新的 Property。

### 五、实例方法绑定的原理（非数据描述符）

普通函数在类中是**非数据描述符**，\`__get__\` 返回绑定方法：

\`\`\`python
class Function:
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return MethodType(self, obj)   # 绑定方法
\`\`\`

这就是为什么 \`obj.method\` 自动绑定 \`self\`：

\`\`\`python
class A:
    def f(self): pass

a = A()
print(A.f)      # <function A.f>          未绑定
print(a.f)      # <bound method A.f of a> 绑定
a.f()           # 等价于 A.f(a)
\`\`\`

\`MethodType\` 内部记住了 \`func\` 和 \`self\`，调用时自动把 \`self\` 加到参数列表前面。

### 六、类方法/静态方法的描述符机制

\`classmethod\` 是数据描述符，\`__get__\` 返回绑定到类的方法：

\`\`\`python
class ClassMethod:
    def __init__(self, func):
        self.func = func
    def __get__(self, obj, objtype=None):
        if objtype is None:
            objtype = type(obj)
        def wrapper(*args, **kw):
            return self.func(objtype, *args, **kw)
        return wrapper
\`\`\`

\`staticmethod\` 是非数据描述符，\`__get__\` 返回原函数（不绑定）：

\`\`\`python
class StaticMethod:
    def __init__(self, func):
        self.func = func
    def __get__(self, obj, objtype=None):
        return self.func
\`\`\`

### 七、__dict__ 查找顺序实例

\`\`\`python
class DataDesc:
    def __get__(self, obj, t=None): return "data"
    def __set__(self, obj, v): pass

class NonDataDesc:
    def __get__(self, obj, t=None): return "nondata"

class A:
    d = DataDesc()
    n = NonDataDesc()
    def __init__(self):
        self.d = "instance-d"   # 数据描述符优先, 此赋值被 __set__ 拦截
        self.n = "instance-n"   # 非数据描述符后于 __dict__, 实例属性覆盖

a = A()
print(a.d)   # "data"  (数据描述符胜出)
print(a.n)   # "instance-n" (实例字典胜出)
\`\`\`

### 八、描述符的应用：ORM 字段、验证器

描述符最常见的应用是 ORM 字段和属性验证器：

\`\`\`python
class Validated:
    def __init__(self, name, type_):
        self.name = name
        self.type_ = type_
    def __get__(self, obj, t=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        if not isinstance(value, self.type_):
            raise TypeError(f"{self.name} 需要 {self.type_.__name__}")
        obj.__dict__[self.name] = value

class User:
    name = Validated("name", str)
    age = Validated("age", int)

u = User()
u.name = "Alice"   # OK
u.age = "x"        # TypeError
\`\`\`

Django 的 \`models.CharField\`、SQLAlchemy 的 \`Column\`、pydantic 的字段全部基于此模式。

### 九、用描述符实现 ORM 字段

\`\`\`python
class Field:
    def __init__(self, primary_key=False):
        self.primary_key = primary_key
        self.name = None
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, t=None):
        if obj is None: return self
        return obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        obj.__dict__[self.name] = value

class ModelMeta(type):
    def __new__(mcs, name, bases, ns):
        cls = super().__new__(mcs, name, bases, ns)
        cls._fields = {}
        for k, v in ns.items():
            if isinstance(v, Field):
                cls._fields[k] = v
        return cls

class User(metaclass=ModelMeta):
    id = Field(primary_key=True)
    name = Field()

print(User._fields)  # {'id': ..., 'name': ...}
\`\`\`

\`__set_name__\` 是 Python 3.6 新增的钩子，让描述符自动知道自己的属性名，省去手动指定。

### 十、业务场景

- **ORM**：Django/SQLAlchemy 字段定义
- **属性验证**：类型检查、范围校验、自动转换
- **惰性属性**：\`cached_property\` 第一次访问时计算并缓存
- **代理属性**：\`__get__\` 委托给内部对象
- **API 自动生成**：FastAPI 字段、pydantic 模型
- **框架设计**：Django admin、Flask 上下文

### 十一、性能影响

描述符每次属性访问都涉及 \`__get__\` 调用，比 \`__dict__\` 直接访问慢。但对 IO 密集应用可忽略，CPU 密集型才需考虑。

| 访问方式 | 单次耗时（ns） |
|----------|----------------|
| \`obj.__dict__['x']\` | ~30 |
| \`obj.x\` (普通属性) | ~50 |
| \`obj.x\` (property) | ~200 |
| \`obj.method()\` (绑定) | ~250 |
| \`obj.x\` (自定义描述符) | ~300 |

### 十二、最佳实践

1. 自定义描述符用 \`__set_name__\` 自动获取属性名（3.6+）
2. 数据描述符存储到 \`obj.__dict__\`，不要在描述符自身存实例状态
3. \`__get__(obj=None)\` 处理类访问（返回描述符自身）
4. 简单只读属性用 \`@property\`，复杂逻辑才自定义描述符
5. \`cached_property\` 替代手写缓存
6. 描述符配合元类实现字段注册（ORM 模式）
7. 描述符不要 \`__init__\` 接收实例数据，那是调用方的事
8. 性能敏感场景，绕过描述符直接 \`__dict__\` 访问`,
    code: `# 描述符协议深度演示
import timeit
from functools import cached_property

print("=== 描述符协议深度演示 ===\\n")

print("--- 1. 数据描述符 vs 非数据描述符 ---")
class DataDesc:
    def __get__(self, obj, t=None):
        return "data-desc-value"
    def __set__(self, obj, v):
        print(f"    DataDesc.__set__ 被调用: {v}")
        obj.__dict__['_data'] = v

class NonDataDesc:
    def __get__(self, obj, t=None):
        return "nondata-desc-value"

class A:
    d = DataDesc()
    n = NonDataDesc()

a = A()
print(f"  a.d (数据描述符): {a.d}")
a.d = "try-set"
print(f"  a.d (赋值后): {a.d} (赋值被 __set__ 拦截)")
a.n = "instance-n"
print(f"  a.n (实例覆盖): {a.n} (非数据描述符被实例字典覆盖)")

print("\\n--- 2. property 简化实现 ---")
class MyProperty:
    def __init__(self, fget=None, fset=None):
        self.fget = fget
        self.fset = fset
    def __get__(self, obj, t=None):
        if obj is None: return self
        if self.fget: return self.fget(obj)
        raise AttributeError("unreadable")
    def __set__(self, obj, value):
        if self.fset: self.fset(obj, value)
        else: raise AttributeError("can't set")
    def setter(self, fset):
        return MyProperty(self.fget, fset)

class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius
    @MyProperty
    def fahrenheit(self):
        return self.celsius * 9 / 5 + 32
    @fahrenheit.setter
    def fahrenheit_setter(self, value):
        raise AttributeError("演示用")

t = Temperature(100)
print(f"  100°C = {t.fahrenheit}°F")

print("\\n--- 3. 实例方法绑定原理 ---")
class MyClass:
    def method(self):
        return f"method on {self}"

obj = MyClass()
print(f"  MyClass.method: {MyClass.method}")
print(f"  obj.method: {obj.method}")
print(f"  obj.method() = {obj.method()}")
print(f"  等价 MyClass.method(obj) = {MyClass.method(obj)}")

print("\\n--- 4. classmethod / staticmethod 原理 ---")
class MyClassMethod:
    def __init__(self, func):
        self.func = func
    def __get__(self, obj, objtype=None):
        if objtype is None:
            objtype = type(obj)
        def wrapper(*args, **kw):
            return self.func(objtype, *args, **kw)
        return wrapper

class MyStaticMethod:
    def __init__(self, func):
        self.func = func
    def __get__(self, obj, objtype=None):
        return self.func

class Demo:
    @MyClassMethod
    def cls_method(cls):
        return f"cls={cls.__name__}"
    @MyStaticMethod
    def static_method():
        return "static"

print(f"  cls_method: {Demo.cls_method()}")
print(f"  static_method: {Demo.static_method()}")

print("\\n--- 5. 属性查找顺序演示 ---")
class Finder:
    data_desc = DataDesc()
    nondata_desc = NonDataDesc()
    class_attr = "class-attr"
    def __init__(self):
        self.instance_attr = "instance-attr"
        try:
            self.data_desc = "x"
        except: pass
        self.nondata_desc = "override-nondata"

f = Finder()
print(f"  data_desc (数据描述符优先): {f.data_desc}")
print(f"  nondata_desc (实例覆盖): {f.nondata_desc}")
print(f"  instance_attr (实例字典): {f.instance_attr}")
print(f"  class_attr (类属性): {f.class_attr}")

print("\\n--- 6. 验证器描述符 ---")
class Validated:
    def __init__(self, type_, min_val=None, max_val=None):
        self.type_ = type_
        self.min_val = min_val
        self.max_val = max_val
        self.name = None
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, t=None):
        if obj is None: return self
        return obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        if not isinstance(value, self.type_):
            raise TypeError(f"{self.name} 需要 {self.type_.__name__}, 得到 {type(value).__name__}")
        if self.min_val is not None and value < self.min_val:
            raise ValueError(f"{self.name} 不能小于 {self.min_val}")
        if self.max_val is not None and value > self.max_val:
            raise ValueError(f"{self.name} 不能大于 {self.max_val}")
        obj.__dict__[self.name] = value

class User:
    name = Validated(str)
    age = Validated(int, min_val=0, max_val=150)

u = User()
u.name = "Alice"
u.age = 30
print(f"  User(name={u.name}, age={u.age})")
try:
    u.age = "x"
except TypeError as e:
    print(f"  u.age='x' 报错: {e}")
try:
    u.age = 200
except ValueError as e:
    print(f"  u.age=200 报错: {e}")

print("\\n--- 7. ORM 字段描述符 ---")
class Field:
    def __init__(self, primary_key=False):
        self.primary_key = primary_key
        self.name = None
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, t=None):
        if obj is None: return self
        return obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        obj.__dict__[self.name] = value

class ModelMeta(type):
    def __new__(mcs, name, bases, ns):
        cls = super().__new__(mcs, name, bases, ns)
        cls._fields = {}
        for k, v in list(ns.items()):
            if isinstance(v, Field):
                cls._fields[k] = v
                if v.primary_key:
                    cls._pk = k
        return cls

class User2(metaclass=ModelMeta):
    id = Field(primary_key=True)
    name = Field()
    email = Field()

print(f"  User2._fields = {list(User2._fields.keys())}")
print(f"  User2._pk = {User2._pk}")
u2 = User2()
u2.id = 1; u2.name = "Bob"; u2.email = "bob@x.com"
print(f"  实例: id={u2.id}, name={u2.name}, email={u2.email}")

print("\\n--- 8. cached_property 惰性属性 ---")
class Expensive:
    @cached_property
    def computed(self):
        print("    [计算中...]")
        return sum(range(1000000))

e = Expensive()
print("  第一次访问:")
t1 = timeit.default_timer()
v1 = e.computed
t1 = timeit.default_timer() - t1
print(f"    耗时 {t1*1000:.2f}ms, 值={v1}")
print("  第二次访问:")
t2 = timeit.default_timer()
v2 = e.computed
t2 = timeit.default_timer() - t2
print(f"    耗时 {t2*1000:.4f}ms (缓存命中), 值={v2}")

print("\\n--- 9. 性能对比 ---")
class PerfDemo:
    def __init__(self):
        self.x = 1
    @property
    def y(self):
        return self.x + 1
    def get_z(self):
        return self.x + 1

p = PerfDemo()
t1 = timeit.timeit(lambda: p.x, number=10_000_000)
t2 = timeit.timeit(lambda: p.y, number=10_000_000)
t3 = timeit.timeit(lambda: p.get_z(), number=10_000_000)
print(f"  普通属性 p.x 1M 次: {t1*1000:.1f}ms")
print(f"  property p.y 1M 次: {t2*1000:.1f}ms")
print(f"  方法 p.get_z() 1M 次: {t3*1000:.1f}ms")
print(f"  property 慢 {t2/t1:.1f}x, 方法慢 {t3/t1:.1f}x")

print("\\n--- 10. 代理描述符 ---")
class Proxy:
    def __init__(self, target_attr):
        self.target_attr = target_attr
    def __get__(self, obj, t=None):
        if obj is None: return self
        target = getattr(obj, self.target_attr)
        return target

class Container:
    def __init__(self):
        self._data = [1, 2, 3]
    first = Proxy("_data")

c = Container()
print(f"  c.first = {c.first} (代理到 _data)")

print("\\n--- 11. __set_name__ 钩子 ---")
class Tracked:
    def __set_name__(self, owner, name):
        print(f"    [Tracked] owner={owner.__name__}, name={name}")
        self.name = name
    def __get__(self, obj, t=None):
        return f"tracked-{self.name}"

class TrackedDemo:
    a = Tracked()
    b = Tracked()
print("  (上面是 __set_name__ 在类创建时自动调用)")

print("\\n--- 12. 最佳实践速查 ---")
tips = [
    "用 __set_name__ 自动获取属性名",
    "数据描述符状态存 obj.__dict__",
    "__get__(obj=None) 处理类访问",
    "简单只读用 @property",
    "复杂逻辑才自定义描述符",
    "cached_property 替代手写缓存",
    "描述符+元类实现 ORM 字段注册",
    "性能敏感场景绕过描述符用 __dict__",
]
for i, t in enumerate(tips, 1):
    print(f"  {i}. {t}")

print("\\n=== 描述符协议演示结束 ===")`
  },
  {
    id: "py6-metaclass-deep",
    group: "重点深化",
    icon: "🏭",
    title: "元类原理与类创建过程",
    content: `## 元类原理与类创建过程

元类是"类的类"，控制类的创建过程。它是 Python 最强大也最危险的元编程特性。Django ORM、SQLAlchemy、ABC、dataclass 全部依赖元类或其现代替代品。

### 一、类也是对象

在 Python 中，类本身也是对象（\`type\` 的实例）：

\`\`\`python
class MyClass: pass
print(type(MyClass))     # <class 'type'>
print(isinstance(MyClass, type))   # True
\`\`\`

类对象包含：
- 类名 (\`__name__\`)
- 基类元组 (\`__bases__\`)
- 命名空间字典 (\`__dict__\`)
- 元类 (\`__class__\`，通常是 \`type\`)

### 二、type 是元类（类的类）

\`type\` 既是内置函数（查看对象类型），也是元类（创建类）。它本身也是自己的实例：

\`\`\`python
print(type(int))      # <class 'type'>
print(type(type))     # <class 'type'>  (type 是自己的元类)
\`\`\`

\`type\` 不仅是元类，还是**默认元类**。所有不指定元类的类都由 \`type\` 创建。

### 三、type(name, bases, dict) 动态创建类

\`type\` 三参数形式可以动态创建类：

\`\`\`python
# 等价于 class Dog: ...
Dog = type("Dog", (object,), {"bark": lambda self: "Woof!"})

d = Dog()
print(d.bark())   # Woof!
\`\`\`

三个参数：
- \`name\`：类名（字符串）
- \`bases\`：基类元组
- \`dict\`：命名空间字典（属性和方法）

这就是 \`class\` 语句的底层实现：编译后调用 \`type(name, bases, dict)\`。

### 四、__metaclass__ 属性

Python 3 中通过 \`metaclass\` 关键字指定元类：

\`\`\`python
class Meta(type):
    def __new__(mcs, name, bases, ns):
        print(f"创建类 {name}")
        return super().__new__(mcs, name, bases, ns)

class MyClass(metaclass=Meta):
    pass
# 输出: 创建类 MyClass
\`\`\`

Python 2 用 \`__metaclass__\` 类属性指定，3 中已废弃。元类查找规则：

1. 显式 \`metaclass=Meta\` 关键字参数
2. 基类的元类（取最派生的元类）
3. 默认 \`type\`

### 五、类创建过程：__prepare__→__new__→__init__

类创建的完整流程：

\`\`\`
class MyClass(Base, metaclass=Meta):
    x = 1

实际执行：
1. 调用 Meta.__prepare__(name, bases, **kw)
   → 返回命名空间字典（默认是普通 dict）

2. 把类体代码编译后的赋值填入命名空间

3. 调用 Meta.__new__(mcs, name, bases, ns, **kw)
   → 创建类对象

4. 调用 Meta.__init__(cls, name, bases, ns, **kw)
   → 初始化类对象

5. 把类对象绑定到模块的 MyClass 名字
\`\`\`

\`__prepare__\` 是 3.0 引入的钩子，可以返回自定义 dict（如 \`OrderedDict\`、记录顺序的 dict）。这能让元类知道类属性的声明顺序，Django ORM 用此为字段排序。

### 六、__init_subclass__ 钩子（现代替代方案）

Python 3.6 引入 \`__init_subclass__\`，在子类创建时调用，**不需要元类**就能定制类创建：

\`\`\`python
class Plugin:
    registry = []
    def __init_subclass__(cls, **kw):
        super().__init_subclass__(**kw)
        Plugin.registry.append(cls)

class A(Plugin): pass
class B(Plugin): pass
print(Plugin.registry)   # [A, B]
\`\`\`

\`__init_subclass__\` 是**类方法**，在父类定义，子类创建时自动调用。它处理 90% 的元类用例，且更易理解、不破坏继承。

### 七、元类的应用：插件注册、API 自动生成

**插件注册**：

\`\`\`python
class PluginMeta(type):
    registry = {}
    def __new__(mcs, name, bases, ns):
        cls = super().__new__(mcs, name, bases, ns)
        if bases:   # 不注册基类自身
            PluginMeta.registry[name] = cls
        return cls

class Plugin(metaclass=PluginMeta): pass
class FilePlugin(Plugin): pass
class HttpPlugin(Plugin): pass
print(PluginMeta.registry)   # {'FilePlugin': ..., 'HttpPlugin': ...}
\`\`\`

**API 自动生成**（FastAPI 路由）：

\`\`\`python
class RouterMeta(type):
    def __new__(mcs, name, bases, ns):
        cls = super().__new__(mcs, name, bases, ns)
        cls._routes = {}
        for k, v in ns.items():
            if hasattr(v, '_route_path'):
                cls._routes[v._route_path] = v
        return cls

def route(path):
    def decorator(func):
        func._route_path = path
        return func
    return decorator

class MyRouter(metaclass=RouterMeta):
    @route("/users")
    def list_users(self): ...
    @route("/posts")
    def list_posts(self): ...
\`\`\`

### 八、ABCMeta 元类实例

\`abc.ABCMeta\` 是标准库元类的典型例子，它实现：

1. 抽象方法追踪：\`@abstractmethod\` 装饰的方法被加入 \`__abstractmethods__\` 集合
2. 实例化检查：\`__new__\` 检查 \`__abstractmethods__\` 是否为空，非空则拒绝实例化
3. 虚拟子类：\`register()\` 注册虚拟子类（不真继承）

\`\`\`python
from abc import ABCMeta, abstractmethod

class Animal(metaclass=ABCMeta):
    @abstractmethod
    def sound(self): pass

# Animal()  # TypeError: 抽象方法未实现
class Dog(Animal):
    def sound(self): return "Woof"
Dog()   # OK
\`\`\`

\`ABCMeta.__new__\` 简化版：

\`\`\`python
class ABCMeta(type):
    def __new__(mcs, name, bases, ns):
        cls = super().__new__(mcs, name, bases, ns)
        abstracts = {name for name, val in ns.items()
                     if getattr(val, '__isabstractmethod__', False)}
        for base in bases:
            abstracts |= getattr(base, '__abstractmethods__', set())
        cls.__abstractmethods__ = frozenset(abstracts)
        return cls
    def __call__(cls, *args, **kw):
        if cls.__abstractmethods__:
            raise TypeError(f"abstract: {cls.__abstractmethods__}")
        return super().__call__(*args, **kw)
\`\`\`

### 九、业务场景

- **框架设计**：Django ORM 的 \`ModelBase\`、SQLAlchemy 的 \`DeclarativeMeta\`
- **DSL**：用类语法声明领域模型，元类翻译成执行逻辑
- **API 自动化**：FastAPI、Django REST framework 自动生成 schema
- **插件系统**：注册、发现、热加载
- **接口约束**：ABC 抽象基类
- **属性校验**：pydantic、attrs 用 \`__init_subclass__\` + 描述符

### 十、元类 vs 装饰器 vs __init_subclass__

| 方案 | 时机 | 复杂度 | 适用 |
|------|------|--------|------|
| 类装饰器 | 类创建后 | 低 | 简单修改类 |
| \`__init_subclass__\` | 子类创建时 | 低 | 注册、钩子 |
| 元类 | 类创建时（含基类） | 高 | 框架、命名空间定制 |
| \`__set_name__\` | 描述符绑定 | 低 | 字段名自动获取 |

**优先级**：能用 \`__init_subclass__\` 就别用元类，能用描述符就别用元类。\`__init_subclass__\` 处理 90% 的场景，元类留作最后的工具。

### 十一、最佳实践

1. **优先用 \`__init_subclass__\`** 替代元类，更简单、不破坏继承
2. 元类继承时取最派生元类，避免多继承冲突
3. \`__new__\` 创建类，\`__init__\` 初始化类，两者都可以重写
4. \`__prepare__\` 返回自定义 dict 可记录声明顺序
5. 元类内 \`super()\` 调用要小心 MRO
6. 不要在元类 \`__call__\` 里做太重的工作（每次实例化都调用）
7. 调试用 \`type(cls)\` 查看元类，\`cls.__mro__\` 查看 MRO
8. 框架级才用元类，业务代码慎用

### 十二、对比表

| 特性 | 类装饰器 | \`__init_subclass__\` | 元类 |
|------|----------|----------------------|------|
| 修改类属性 | 可以 | 可以 | 可以 |
| 拦截类创建 | 否 | 是 | 是 |
| 自定义命名空间 | 否 | 否 | 是 (\`__prepare__\`) |
| 多继承冲突 | 无 | 无 | 可能有 |
| 复杂度 | 低 | 低 | 高 |
| 推荐 | 简单场景 | 90% 场景 | 框架级`,
    code: `# 元类原理与类创建过程演示
import abc
import timeit

print("=== 元类原理与类创建过程演示 ===\\n")

print("--- 1. 类也是对象 ---")
class MyClass:
    pass

print(f"  type(MyClass) = {type(MyClass)}")
print(f"  isinstance(MyClass, type) = {isinstance(MyClass, type)}")
print(f"  type(type) = {type(type)} (type 是自己的元类)")
print(f"  MyClass.__name__ = {MyClass.__name__}")
print(f"  MyClass.__bases__ = {MyClass.__bases__}")

print("\\n--- 2. type() 动态创建类 ---")
def bark(self):
    return "Woof!"

Dog = type("Dog", (object,), {"bark": bark, "legs": 4})
d = Dog()
print(f"  type(d) = {type(d).__name__}")
print(f"  d.bark() = {d.bark()}")
print(f"  d.legs = {d.legs}")

print("\\n--- 3. 自定义元类 ---")
class Meta(type):
    def __new__(mcs, name, bases, ns):
        print(f"    [Meta.__new__] 创建类: {name}")
        print(f"    [Meta.__new__] bases: {bases}")
        print(f"    [Meta.__new__] 命名空间 keys: {list(ns.keys())[:5]}")
        return super().__new__(mcs, name, bases, ns)
    def __init__(cls, name, bases, ns):
        print(f"    [Meta.__init__] 初始化: {name}")
        super().__init__(name, bases, ns)

print("  定义 Foo(metaclass=Meta):")
class Foo(metaclass=Meta):
    x = 1
    def f(self): pass

print("\\n--- 4. __prepare__ 钩子 ---")
class OrderedMeta(type):
    @classmethod
    def __prepare__(mcs, name, bases, **kw):
        from collections import OrderedDict
        return OrderedDict()
    def __new__(mcs, name, bases, ns):
        cls = super().__new__(mcs, name, bases, dict(ns))
        cls._field_order = list(ns.keys())
        return cls

print("  定义 Ordered(metaclass=OrderedMeta):")
class Ordered(metaclass=OrderedMeta):
    a = 1
    b = 2
    c = 3
print(f"  Ordered._field_order = {Ordered._field_order}")

print("\\n--- 5. __init_subclass__ 现代替代 ---")
class Plugin:
    registry = []
    def __init_subclass__(cls, **kw):
        super().__init_subclass__(**kw)
        Plugin.registry.append(cls.__name__)
        print(f"    [__init_subclass__] 注册: {cls.__name__}")

print("  定义子类:")
class FilePlugin(Plugin): pass
class HttpPlugin(Plugin): pass
print(f"  Plugin.registry = {Plugin.registry}")

print("\\n--- 6. 插件注册元类 ---")
class PluginMeta(type):
    registry = {}
    def __new__(mcs, name, bases, ns):
        cls = super().__new__(mcs, name, bases, ns)
        if bases != ():
            PluginMeta.registry[name] = cls
        return cls

class PluginBase(metaclass=PluginMeta): pass
class AuthPlugin(PluginBase): pass
class CachePlugin(PluginBase): pass
print(f"  已注册插件: {list(PluginMeta.registry.keys())}")

print("\\n--- 7. ABCMeta 抽象基类 ---")
class Animal(metaclass=abc.ABCMeta):
    @abc.abstractmethod
    def sound(self):
        pass

try:
    Animal()
except TypeError as e:
    print(f"  Animal() 实例化失败: {e}")

class Dog(Animal):
    def sound(self):
        return "Woof"

d = Dog()
print(f"  Dog().sound() = {d.sound()}")
print(f"  Dog.__abstractmethods__ = {Dog.__abstractmethods__}")

print("\\n--- 8. 路由元类（API 自动生成） ---")
class RouterMeta(type):
    def __new__(mcs, name, bases, ns):
        cls = super().__new__(mcs, name, bases, ns)
        cls._routes = {}
        for k, v in ns.items():
            if callable(v) and hasattr(v, '_route_path'):
                cls._routes[v._route_path] = k
        return cls

def route(path):
    def decorator(func):
        func._route_path = path
        return func
    return decorator

class MyRouter(metaclass=RouterMeta):
    @route("/users")
    def list_users(self):
        return "users"
    @route("/posts")
    def list_posts(self):
        return "posts"

print(f"  MyRouter._routes = {MyRouter._routes}")

print("\\n--- 9. 元类 vs __init_subclass__ 对比 ---")
print("  __init_subclass__:")
print("    - 优先使用，简单、不破坏继承")
print("    - 仅在子类创建时触发")
print("  元类:")
print("    - 框架级场景，命名空间定制(__prepare__)")
print("    - 拦截所有类创建（含基类）")

print("\\n--- 10. 类装饰器替代元类 ---")
def add_repr(cls):
    def __repr__(self):
        attrs = ", ".join(f"{k}={v!r}" for k, v in self.__dict__.items())
        return f"{cls.__name__}({attrs})"
    cls.__repr__ = __repr__
    return cls

@add_repr
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(1, 2)
print(f"  Point(1, 2).__repr__ = {p!r}")

print("\\n--- 11. 性能对比 ---")
class Plain:
    pass

class WithMeta(type):
    pass

class MetaClass(metaclass=WithMeta):
    pass

t1 = timeit.timeit(lambda: Plain(), number=1_000_000)
t2 = timeit.timeit(lambda: MetaClass(), number=1_000_000)
print(f"  普通类实例化 1M 次: {t1*1000:.1f}ms")
print(f"  元类类实例化 1M 次: {t2*1000:.1f}ms")
print(f"  元类开销: {(t2-t1)*1000:.1f}ms ({t2/t1:.2f}x)")

print("\\n--- 12. 最佳实践速查 ---")
tips = [
    "优先用 __init_subclass__ 替代元类",
    "类装饰器用于简单场景",
    "元类用于框架级命名空间定制",
    "__prepare__ 返回自定义 dict 记录顺序",
    "元类 super() 调用注意 MRO",
    "不要在元类 __call__ 做重活",
    "调试用 type(cls) 查看元类",
    "框架级才用元类，业务代码慎用",
]
for i, t in enumerate(tips, 1):
    print(f"  {i}. {t}")

print("\\n=== 元类原理演示结束 ===")`
  }
];