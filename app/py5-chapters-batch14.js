export const chapters = [
  {
    id: "py5-typing",
    group: "Python 3.13",
    icon: "📝",
    title: "类型提示",
    content: `- list[int], dict[str, int] 内置泛型（3.9+，无需 from typing import List）
- int | None 联合类型（3.10+，代替 Optional[int]）
- Protocol 定义结构子类型（鸭子类型的静态版本）
- TypeVar + Generic 定义泛型类，TypedDict 描述字典结构
- 类型提示不影响运行，供类型检查器（mypy/pyright）使用`,
    code: `from typing import Protocol, TypeVar, Generic, TypedDict

def greet(name: str) -> str:
    return f"Hello, {name}"

def add(a: int, b: int = 0) -> int:
    return a + b

names: list[str] = ["Alice", "Bob"]
maybe_id: int | None = None

class Drawable(Protocol):
    def draw(self) -> None: ...

class Circle:
    def draw(self) -> None:
        print("draw circle")

T = TypeVar("T")
class Stack(Generic[T]):
    def __init__(self) -> None:
        self.items: list[T] = []
    def push(self, item: T) -> None:
        self.items.append(item)
    def pop(self) -> T:
        return self.items.pop()

class User(TypedDict):
    name: str
    age: int

print(greet("World"))
print(add(3, 4))
c: Drawable = Circle()
c.draw()
s: Stack[int] = Stack()
s.push(1); s.push(2)
print(f"Stack pop: {s.pop()}")
u: User = {"name": "Alice", "age": 30}
print(f"User: {u}")
`
  },
  {
    id: "py5-pep695",
    group: "Python 3.13",
    icon: "🔤",
    title: "PEP 695 泛型语法",
    content: `- PEP 695（3.12+）引入新 type 关键字声明类型别名
- class ClassName[T] 直接声明泛型类，无需 TypeVar
- def func[T](...) 声明泛型函数，语法更简洁
- 类型别名支持类型参数：type Point[T] = tuple[T, T]
- 比旧 Generic + TypeVar 写法更清晰直观`,
    code: `type Vector[T] = list[T]
type Pair[T] = tuple[T, T]
type StringOrInt = str | int

class Box[T]:
    def __init__(self, value: T) -> None:
        self.value = value
    def get(self) -> T:
        return self.value
    def set(self, value: T) -> None:
        self.value = value

def first[T](items: list[T]) -> T:
    return items[0]

def make_pair[T](a: T, b: T) -> Pair[T]:
    return (a, b)

class Registry[K, V]:
    def __init__(self) -> None:
        self.data: dict[K, V] = {}
    def add(self, key: K, value: V) -> None:
        self.data[key] = value
    def get(self, key: K) -> V | None:
        return self.data.get(key)

vec: Vector[int] = [1, 2, 3]
print(f"Vector: {vec}")
print(f"First: {first(vec)}")
pair = make_pair("hello", "world")
print(f"Pair: {pair}")
box = Box[int](42)
print(f"Box value: {box.get()}")
reg = Registry[str, int]()
reg.add("score", 100)
print(f"Registry score: {reg.get('score')}")
x: StringOrInt = "test"
print(f"StringOrInt: {x}")
`
  },
  {
    id: "py5-testing",
    group: "Python 3.13",
    icon: "🧪",
    title: "单元测试",
    content: `- unittest.TestCase 编写测试类，setUp 初始化夹具
- assertEqual/assertTrue/assertRaises 等断言方法
- doctest 从文档字符串中提取并运行测试
- unittest.mock.patch 替换依赖，Mock 模拟对象行为
- unittest.main() 直接运行测试，无需额外命令`,
    code: `import unittest
import doctest
from unittest.mock import patch, Mock

def add(a, b):
    return a + b

def divide(a, b):
    if b == 0:
        raise ValueError("division by zero")
    return a / b

def factorial(n):
    """计算阶乘
    >>> factorial(5)
    120
    >>> factorial(0)
    1
    """
    if n <= 1:
        return 1
    return n * factorial(n - 1)

class TestMath(unittest.TestCase):
    def setUp(self):
        self.data = [1, 2, 3]
    def test_add(self):
        self.assertEqual(add(2, 3), 5)
        self.assertEqual(add(-1, 1), 0)
    def test_divide(self):
        self.assertEqual(divide(10, 2), 5)
        with self.assertRaises(ValueError):
            divide(1, 0)
    @patch("builtins.print")
    def test_mock_print(self, mock_print):
        print("hello")
        mock_print.assert_called_with("hello")

if __name__ == "__main__":
    print("=== doctest ===")
    doctest.testmod(verbose=False)
    print("doctest 通过")
    print("=== unittest ===")
    suite = unittest.TestLoader().loadTestsFromTestCase(TestMath)
    runner = unittest.TextTestRunner(verbosity=0)
    result = runner.run(suite)
    print(f"测试运行: {result.testsRun}, 失败: {len(result.failures)}, 错误: {len(result.errors)}")
`
  },
  {
    id: "py5-py313",
    group: "Python 3.13",
    icon: "🐍",
    title: "Python 3.13 新特性",
    content: `- sys.version 查看 Python 版本信息
- 改进的错误提示：更精准的错误位置和建议
- f-string 调试 = 格式符：f"{x=}" 输出 x=value
- 实验性自由线程（free-threaded）模式，可选禁用 GIL
- tomllib 内置 TOML 解析（3.11+），无需第三方库`,
    code: `import sys
import tempfile
import os
import tomllib

print(f"Python 版本: {sys.version}")
print(f"版本信息: {sys.version_info[:3]}")

x = 42
name = "Alice"
pi = 3.14159
print("=== f-string = 调试符 ===")
print(f"{x=}")
print(f"{name=}")
print(f"{pi=:.2f}")
print(f"{x + 1=}")

print("=== 改进的错误消息 ===")
try:
    nums = [1, 2, 3]
    print(nums[5])
except IndexError as e:
    print(f"IndexError 提示: {e}")

print("=== tomllib 解析 TOML ===")
toml_content = '''
[database]
host = "localhost"
port = 5432
[app]
debug = true
name = "Demo"
'''
with tempfile.NamedTemporaryFile(mode="w", suffix=".toml", delete=False, encoding="utf-8") as f:
    f.write(toml_content)
    tmpname = f.name
with open(tmpname, "rb") as f:
    config = tomllib.load(f)
os.unlink(tmpname)
print(f"DB host: {config['database']['host']}")
print(f"DB port: {config['database']['port']}")
print(f"App debug: {config['app']['debug']}")
print("提示: Python 3.13 支持实验性 free-threaded 模式（--disable-gil）")
`
  }
];
