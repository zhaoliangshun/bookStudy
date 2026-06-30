// =============================================================
// 第七批章节（高级特性，4 章）
// 25. typing                typing 模块、Protocol、TypedDict
// 26. context-manager       with、__enter__/__exit__、contextlib
// 27. metaclass-descriptor  描述符协议、元类基础
// 28. testing               unittest / pytest / mock
// =============================================================

export const chapters = [
  {
    id: "py3-typing",
    group: "高级特性",
    icon: "🏷️",
    title: "类型系统：typing / Protocol / TypedDict",
    content: `
# 类型系统

- **typing**：List / Dict / Tuple / Set / Optional / Union / Any
- 3.10+ 用 \`list[int]\` 代替 \`List[int]\`（PEP 585）
- 3.10+ 用 \`int | None\` 代替 \`Optional[int]\`（PEP 604）
- **TypedDict**：dict 的形状约束
- **Protocol**：结构化类型（鸭子类型的形式化）
- **TypeVar / Generic**：泛型
- 静态检查工具：**mypy**、**pyright**
`,
    code: `from typing import Optional, Union, Any, Protocol, TypeVar, Generic
from typing_extensions import TypedDict   # 3.8+ 也能用，老版本在 typing_extensions

# 1) 基础类型注解
def greet(name: str, age: Optional[int] = None) -> str:
    return f"hi {name}" + (f", {age}" if age is not None else "")

# 2) list[int] / int | None（3.10+）
def first(xs: list[int]) -> int | None:
    return xs[0] if xs else None

print(greet("alice"))
print(greet("bob", 30))
print(first([1, 2, 3]), first([]))

# 3) TypedDict
class UserDict(TypedDict):
    name: str
    age: int
    email: str | None   # 可选字段用 NotRequired 标注

u: UserDict = {"name": "alice", "age": 30}
print("user:", u)

# 4) Protocol：结构化子类型
class SupportsClose(Protocol):
    def close(self) -> None: ...

def close_all(things: list[SupportsClose]) -> None:
    for t in things:
        t.close()

class File:
    def close(self) -> None:
        print("File.close()")
class Connection:
    def close(self) -> None:
        print("Connection.close()")

close_all([File(), Connection()])  # 满足协议即可传入

# 5) 泛型
T = TypeVar("T")

class Stack(Generic[T]):
    def __init__(self):
        self._items: list[T] = []
    def push(self, x: T) -> None:
        self._items.append(x)
    def pop(self) -> T:
        return self._items.pop()

s: Stack[int] = Stack()
s.push(1); s.push(2)
print("stack pop:", s.pop(), s.pop())
`,
  },

  {
    id: "py3-context-manager",
    group: "高级特性",
    icon: "🔒",
    title: "上下文管理器：with、contextlib、ExitStack",
    content: `
# 上下文管理器

- 协议：实现 \`__enter__\`（返回资源）和 \`__exit__\`（释放资源）
- \`with\` 语句：进入时调 \`__enter__\`，离开时调 \`__exit__\`（即使异常）
- **contextlib.contextmanager**：把生成器函数装饰成上下文管理器
- **contextlib.ExitStack**：动态管理多个上下文
- 常见应用：文件、锁、事务、计时、临时目录、抑制异常
`,
    code: `import time, contextlib

# 1) 基础：文件就是最经典的上下文
with open(__file__, "r", encoding="utf-8") as f:
    first_line = f.readline()
print("first line:", first_line.strip()[:60])

# 2) 自定义类实现上下文协议
class Timer:
    def __enter__(self):
        self.t0 = time.perf_counter()
        return self
    def __exit__(self, exc_type, exc, tb):
        self.elapsed = time.perf_counter() - self.t0
        print(f"[Timer] cost {self.elapsed:.6f}s, exc={exc_type}")
        return False   # 不吞异常

with Timer() as t:
    time.sleep(0.05)
print("outside: t.elapsed =", round(t.elapsed, 4))

# 3) @contextmanager：把生成器变成上下文
@contextlib.contextmanager
def temp_chdir(path):
    old = os.getcwd()
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(old)

import os
with temp_chdir("/tmp"):
    print("in with, cwd:", os.getcwd())
print("after with, cwd:", os.getcwd())

# 4) @contextmanager 抑制异常
@contextlib.contextmanager
def suppress_errors(*excs):
    try:
        yield
    except excs as e:
        print("suppressed:", e)

with suppress_errors(ValueError, KeyError):
    int("abc")   # 抛 ValueError，被吞掉
print("继续运行")

# 5) ExitStack：动态管理多个上下文
@contextlib.contextmanager
def open_many(paths):
    with contextlib.ExitStack() as stack:
        files = [stack.enter_context(open(p, encoding="utf-8")) for p in paths]
        yield files

import tempfile
with tempfile.TemporaryDirectory() as tmp:
    paths = []
    for i in range(3):
        p = os.path.join(tmp, f"f{i}.txt")
        with open(p, "w") as f:
            f.write(f"file {i}")
        paths.append(p)
    with open_many(paths) as files:
        print("contents:", [f.read().strip() for f in files])
`,
  },

  {
    id: "py3-metaclass-descriptor",
    group: "高级特性",
    icon: "🪄",
    title: "描述符与元类：深入属性访问",
    content: `
# 描述符与元类

- **描述符协议**：实现 \`__get__\`、\`__set__\`、\`__delete__\` 的对象
  - 数据描述符（同时实现 \`__get__/__set__\`）优先级 > 实例字典
  - 非数据描述符（只 \`__get__\`）优先级 < 实例字典
- 常见用途：\`@property\`、ORM 字段、类型校验
- **元类**：类的类，默认是 \`type\`；\`__init_subclass__\` 钩子更现代
- 99% 场景下不需要写元类，优先考虑：
  - 描述符
  - \`__init_subclass__\`
  - 类装饰器
`,
    code: `# 1) 描述符：受控的属性访问
class Validated:
    def __init__(self, typ, min=None, max=None):
        self.typ = typ
        self.min = min
        self.max = max
        self.name = None
    def __set_name__(self, owner, name):       # 3.6+ 自动取属性名
        self.name = f"_{name}"
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.name, None)
    def __set__(self, obj, value):
        if not isinstance(value, self.typ):
            raise TypeError(f"{self.name} must be {self.typ.__name__}")
        if self.min is not None and value < self.min:
            raise ValueError(f"{self.name} must be >= {self.min}")
        if self.max is not None and value > self.max:
            raise ValueError(f"{self.name} must be <= {self.max}")
        setattr(obj, self.name, value)

class Person:
    age = Validated(int, min=0, max=150)
    name = Validated(str)
    def __init__(self, name, age):
        self.name = name
        self.age = age

p = Person("alice", 30)
print("person:", p.name, p.age)
# p.age = -1   # ValueError

# 2) __init_subclass__：子类注册（更现代的元类用法）
class PluginBase:
    plugins = {}
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        PluginBase.plugins[cls.__name__] = cls

class JSONPlugin(PluginBase):
    def render(self, data):
        import json
        return json.dumps(data)

class CSVPlugin(PluginBase):
    def render(self, data):
        import csv, io
        buf = io.StringIO()
        w = csv.writer(buf); w.writerow(data); return buf.getvalue().strip()

for name, cls in PluginBase.plugins.items():
    print("plugin:", name, "->", cls().render([1, 2, 3]))

# 3) 简易 type 元类演示
class FinalMeta(type):
    def __new__(mcs, name, bases, ns):
        for b in bases:
            if isinstance(b, FinalMeta):
                raise TypeError(f"{b.__name__} is final, cannot subclass")
        return super().__new__(mcs, name, bases, ns)

class Base(metaclass=FinalMeta):
    pass

class Sub(Base):
    pass  # OK
# class SubSub(Sub):
#     pass  # TypeError: Sub is final
print("metaclass demo ok")
`,
  },

  {
    id: "py3-testing",
    group: "高级特性",
    icon: "🧪",
    title: "测试：unittest / pytest / mock / 覆盖率",
    content: `
# 测试

- **unittest**：标准库，xUnit 风格，类继承 \`TestCase\`
- **pytest**：第三方，推荐，函数式 + 强大 fixture + 参数化
- 常用断言：\`assert 表达式\`（pytest 直接用 assert 即可）
- **mock**：\`unittest.mock\` 替换依赖、模拟返回值
- **覆盖率**：\`pytest --cov=mypkg\`
- **doctest**：文档字符串里的 >>> 会作为测试运行
`,
    code: `import unittest
from unittest.mock import Mock, patch

# 待测函数
def add(a, b):
    return a + b

def fetch_user(user_id):
    # 实际项目里会查数据库
    raise NotImplementedError

# 1) unittest
class TestAdd(unittest.TestCase):
    def test_add_positive(self):
        self.assertEqual(add(2, 3), 5)
    def test_add_zero(self):
        self.assertEqual(add(0, 0), 0)
    def test_add_negative(self):
        self.assertEqual(add(-1, -2), -3)

unittest.main(argv=[''], exit=False, verbosity=2)

# 2) mock 替换函数返回值
def show_user(user_id):
    user = fetch_user(user_id)
    return f"User: {user['name']}"

with patch("__main__.fetch_user", return_value={"name": "alice", "id": user_id if (user_id := 7) else 0}):
    print("mocked:", show_user(7))

# 3) 手动跑一个 pytest 风格测试（不依赖 pytest 也能演示）
def test_add_pytest_style():
    assert add(1, 2) == 3
    assert add(-1, 1) == 0
    with __import__("pytest").raises(TypeError):
        add("1", 1)
test_add_pytest_style()
print("pytest-style test passed")

# 4) pytest 用法（注释）
print("""pytest 常用:
  test_xxx.py              文件名以 test_ 开头
  def test_xxx(): ...       函数以 test_ 开头
  @pytest.fixture          注入测试夹具（共享资源）
  @pytest.mark.parametrize  参数化（一个用例跑多组数据）
  pytest --cov=mypkg --cov-report=term-missing
""")
`,
  },
];
