// =============================================================
// Batch 14：现代特性（4 章）
// 53. py4-typing         类型注解：Protocol、TypedDict、Generic
// 54. py4-pep695         PEP 695：class X[T]、def fn[T]、type alias
// 55. py4-testing        unittest、pytest、mock、覆盖率
// 56. py4-py313          3.12-3.13 新特性总览
// =============================================================

export const chapters = [
  {
    id: "py4-typing",
    group: "现代特性",
    icon: "🏷️",
    title: "类型系统：Protocol、TypedDict、Generic",
    content: `
- 3.10+：\`list[int]\` 代替 \`List[int]\`（PEP 585）
- 3.10+：\`int | None\` 代替 \`Optional[int]\`（PEP 604）
- **TypedDict**：dict 的形状约束
- **Protocol**：结构化类型（鸭子类型的形式化）
- **TypeVar / Generic**：泛型
- 静态检查：mypy / pyright
`,
    code: `from typing import Optional, Protocol, TypeVar, Generic
from typing_extensions import TypedDict

# 1) 基础类型注解
def first[T](xs: list[T]) -> T | None:
    return xs[0] if xs else None

print(first([1, 2, 3]), first([]))

# 2) TypedDict
class UserDict(TypedDict):
    name: str
    age: int
    email: str | None

u: UserDict = {"name": "alice", "age": 30}
print("user:", u)

# 3) Protocol：结构化子类型
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

close_all([File(), Connection()])

# 4) 泛型
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
    id: "py4-pep695",
    group: "现代特性",
    icon: "🆕",
    title: "PEP 695：类型参数新语法（3.12+）",
    content: `
- 旧：\`class Stack(Generic[T]):\`
- 新：\`class Stack[T]:\`（PEP 695，3.12+）
- 旧：\`def first[T](xs: list[T]) -> T:\`
- 新：\`def first[T](xs: list[T]) -> T:\`（同样简洁）
- **type 语句**：\`type Vector = list[float]\`
- 无需导入 Generic / TypeVar
`,
    code: `# 1) class X[T]：类型参数直接写在类名后
class Stack[T]:
    def __init__(self):
        self._items: list[T] = []
    def push(self, x: T) -> None:
        self._items.append(x)
    def pop(self) -> T:
        return self._items.pop()

s_int: Stack[int] = Stack()
s_int.push(1); s_int.push(2)
print("stack:", s_int.pop(), s_int.pop())

# 2) def fn[T]：泛型函数
def first[T](xs: list[T]) -> T | None:
    return xs[0] if xs else None

print("first:", first([1, 2, 3]), first(["a", "b"]))

# 3) 类型边界
def double[T: (int, float)](x: T) -> T:
    return x + x

print("double:", double(3), double(1.5))

# 4) type 语句：类型别名
type Vector = list[float]
type Matrix = list[Vector]
type UserId = int

def scale(v: Vector, k: float) -> Vector:
    return [x * k for x in v]

v: Vector = [1.0, 2.0, 3.0]
print("scaled:", scale(v, 2.0))

# 5) 复杂泛型
class Pair[K, V]:
    def __init__(self, key: K, value: V):
        self.key, self.value = key, value
    def __repr__(self):
        return f"Pair({self.key!r}, {self.value!r})"

print(Pair("age", 30))
print(Pair[str, int]("score", 95))
`,
  },
  {
    id: "py4-testing",
    group: "现代特性",
    icon: "🧪",
    title: "测试：unittest、pytest、mock",
    content: `
- **unittest**：标准库，xUnit 风格，继承 \`TestCase\`
- **pytest**：第三方，函数式，推荐
- 断言：\`assert 表达式\`（pytest 直接用 assert）
- **mock**：\`unittest.mock\` 替换依赖
- 覆盖率：\`pytest --cov=mypkg\`
- **doctest**：文档字符串中的 >>> 会作为测试运行
`,
    code: `import unittest
from unittest.mock import Mock, patch

# 待测函数
def add(a, b):
    return a + b

def fetch_user(user_id):
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

# 2) mock
def show_user(user_id):
    user = fetch_user(user_id)
    return f"User: {user['name']}"

with patch("__main__.fetch_user", return_value={"name": "alice", "id": 7}):
    print("mocked:", show_user(7))

# 3) pytest 风格（模拟）
def test_add_pytest_style():
    assert add(1, 2) == 3
    assert add(-1, 1) == 0
test_add_pytest_style()
print("pytest-style test passed")

# 4) pytest 常用命令
print("""
pytest 常用:
  test_xxx.py              文件名以 test_ 开头
  def test_xxx(): ...       函数以 test_ 开头
  @pytest.fixture          注入测试夹具
  @pytest.mark.parametrize  参数化
  pytest --cov=mypkg --cov-report=term-missing
""")
`,
  },
  {
    id: "py4-py313",
    group: "现代特性",
    icon: "🚀",
    title: "Python 3.12-3.13 新特性总览",
    content: `
- **3.12**（2023-10）
  - PEP 695：类型参数语法
  - PEP 701：f-string 改进（嵌套引号、多行表达式）
  - 更精准的错误信息

- **3.13**（2024-10）
  - 实验性 JIT（PEP 744）
  - 新的交互式 REPL（PyREPL）
  - 性能提升 10-15%

- 演进趋势：自由线程、模板字符串
`,
    code: `import sys, platform

print(f"当前 Python: {sys.version.split()[0]}")
print(f"实现: {platform.python_implementation()}")
print(f"平台: {platform.system()} {platform.machine()}")

# 1) PEP 701：f-string 改进（3.12+）
# 嵌套引号
names = ["alice", "bob", "carol"]
print(f"嵌套: { {n: len(n) for n in names} }")

# 多行表达式
data = {"x": 1, "y": 2}
print(f"sum: {sum(v for v in data.values())}")

# 2) PEP 695：类型参数（3.12+）
class Box[T]:
    def __init__(self, value: T):
        self.value = value
    def map[U](self, fn: "callable[[T], U]") -> "Box[U]":
        return Box(fn(self.value))

b = Box(3)
print("box:", b.value, "mapped:", b.map(lambda x: x * x).value)

# 3) 更好的错误信息（3.12+）
try:
    print(1 / 0)
except ZeroDivisionError as e:
    print("err:", e)

# 4) tomllib（3.11+）
try:
    import tomllib
    toml_text = '[tool.demo]\\nname = "py4"\\nversion = "0.1.0"\\n'
    cfg = tomllib.loads(toml_text)
    print("toml:", cfg["tool"]["demo"])
except ImportError:
    print("Python < 3.11，没有内置 tomllib")

# 5) 版本特性速查
features = {
    "3.10": "match-case, PEP 604 (int | None)",
    "3.11": "ExceptionGroup, tomllib, TaskGroup, 更快的 CPython",
    "3.12": "PEP 695 (泛型), PEP 701 (f-string), 更精准错误",
    "3.13": "实验性 JIT, 新 REPL, 性能提升",
}
for ver, desc in features.items():
    print(f"Python {ver}: {desc}")
`,
  },
];