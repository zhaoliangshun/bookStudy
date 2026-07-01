export const chapters = [
  {
    id: "py5-typing",
    group: "Python 3.13",
    icon: "📝",
    title: "类型提示",
    content: `## 概述
Python 类型提示（Type Hints）自 3.5 引入，3.9+ 内置泛型与 3.10+ 联合类型让静态类型检查成为现代 Python 项目标配，配合 mypy/pyright 可在编码期捕获潜在错误。

## 核心要点
- **内置泛型**: \`list[int]\` / \`dict[str, int]\` - 3.9+ 起可直接用，无需 \`from typing import List\`
- **联合类型**: \`int | None\` - 3.10+ PEP 604，替代 \`Optional[int]\` 与 \`Union[int, None]\`
- **Protocol**: 结构子类型 - 鸭子类型的静态版本，无需继承即可匹配接口
- **TypeVar + Generic**: 参数化泛型类，\`T = TypeVar("T")\` 后 \`class Stack(Generic[T])\`
- **TypedDict**: 描述固定键集合字典结构，3.8+ 引入，PEP 692（3.12+）增强 \`**kwargs\` 类型
- **运行时无副作用**: 类型注解不强制执行，仅供类型检查器使用
- **别名**: 3.10+ \`TypeAlias\`，PEP 695（3.12+）统一为 \`type\` 关键字

## 原理与机制
- **渐进式类型**: Python 是渐进类型语言，可逐步添加注解，未注解部分回退到 \`Any\`
- **结构 vs 名义子类型**: Protocol 基于结构（shape），Generic 基于名义（继承关系）
- **注解反射**: 函数/类注解存于 \`__annotations__\` 字典，可运行时反射
- **泛型擦除**: 运行时 \`Stack[int]\` 与 \`Stack[str]\` 是同一类，类型参数仅静态检查
- **协变/逆变**: TypeVar 可声明 \`covariant=True\` / \`contravariant=True\` 控制子类型关系

## 易错点与陷阱
- **陷阱**: \`list[int]\` 在 3.8 及更早报错，需用 \`List[int]\`，老项目注意兼容
- **陷阱**: \`int | None\` 仅 3.10+ 可用，3.9 及以下需 \`Optional[int]\` 或 \`Union\`
- **陷阱**: TypedDict 默认全部键必需，需 \`total=False\` 或 \`Required\`/\`NotRequired\`
- **陷阱**: Protocol 不能直接实例化，仅用于类型约束，否则 \`TypeError\`

## 实战建议
- **建议**: 新项目直接用 \`list\`/\`dict\`/\`int | None\` 新语法，老项目保持一致性
- **建议**: pyproject.toml 配置 mypy，启用 \`strict\` 模式渐进收紧检查
- **建议**: 对外 API 优先用 Protocol 解耦依赖，内部用 Generic 复用容器逻辑`,
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
    content: `## 概述
PEP 695（Python 3.12+）引入 \`type\` 关键字与新泛型语法，让类型别名、泛型类、泛型函数的声明更简洁直观，逐步取代旧的 \`TypeVar\` + \`Generic\` 写法。

## 核心要点
- **类型别名**: \`type Vector[T] = list[T]\` - 新 \`type\` 语句声明，自动推断类型参数
- **泛型类**: \`class Box[T]:\` - 直接在类名后声明类型参数，无需 \`Generic[T]\`
- **泛型函数**: \`def first[T](items: list[T]) -> T:\` - 简洁明了
- **多类型参数**: \`class Registry[K, V]:\` 支持多个类型参数与约束
- **自动作用域**: 类型参数 \`T\` 仅在声明作用域内可见，不污染模块命名空间
- **新 TypeVar**: PEP 695 中类型参数自动创建 TypeVar，无需显式 \`TypeVar("T")\`
- **PEP 696（3.13+）**: 类型参数支持默认值 \`class Default[T=int]:\`

## 原理与机制
- **惰性求值**: \`type\` 语句声明的别名在运行时才求值，支持前向引用
- **类型参数作用域**: 函数/类体内的 \`T\` 是隐式 TypeVar，作用域外不可访问
- **不变性默认**: 类型参数默认不变（invariant），与显式 \`TypeVar\` 行为一致
- **运行时创建**: \`class Box[T]\` 在运行时仍创建真实类对象，类型参数存于 \`__type_params__\`
- **兼容旧语法**: 新旧语法可混用，\`type X = int\` 等价于 \`X: TypeAlias = int\`

## 易错点与陷阱
- **陷阱**: \`type\` 关键字是 3.12+ 才有，3.11 及以下需用 \`TypeAlias\` 或赋值
- **陷阱**: 类型参数 \`T\` 不能在方法外、模块顶层单独引用，作用域受限
- **陷阱**: 旧版 mypy/pyright 可能不识别 PEP 695 语法，需更新到最新版本
- **陷阱**: \`type X = ...\` 与 \`X = ...\` 不同，前者是显式别名（可被工具识别）

## 实战建议
- **建议**: 新项目直接用 PEP 695 语法，配合 3.12+ 运行时
- **建议**: 老项目迁移时优先把 \`TypeVar\` 定义替换为类型参数语法
- **建议**: 3.13+ 项目可结合 PEP 696 默认值简化泛型 API 设计`,
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
    content: `## 概述
Python 标准库内置 \`unittest\` 单元测试框架，结合 \`doctest\` 文档测试与 \`unittest.mock\` 模拟对象，覆盖从断言到依赖隔离的完整测试需求，无需第三方库即可启动。

## 核心要点
- **TestCase**: \`class TestX(unittest.TestCase)\` - 测试类继承基类，每个 \`test_\` 开头方法自动收集
- **setUp/tearDown**: 每个测试方法前后执行夹具，setUp 初始化、tearDown 清理资源
- **断言方法**: \`assertEqual\` / \`assertTrue\` / \`assertRaises\` / \`assertIn\` 等丰富断言
- **上下文断言**: \`with self.assertRaises(ValueError):\` 捕获预期异常
- **doctest**: 文档字符串中 \`>>>\` 示例自动执行，兼顾文档与测试
- **mock.patch**: \`@patch("module.func")\` 替换目标对象，隔离外部依赖
- **Mock 对象**: \`Mock(return_value=...)\` 模拟对象行为，\`assert_called_with\` 验证调用
- **TestLoader/Runner**: \`unittest.TestLoader\` 加载测试套件，\`TextTestRunner\` 运行

## 原理与机制
- **反射收集**: unittest 通过 \`dir()\` 反射查找 \`test_\` 开头方法，自动构建 TestSuite
- **断言失败**: \`assertEqual(a, b)\` 失败时抛出 \`AssertionError\`，由框架捕获并记录
- **mock 原理**: \`patch\` 临时替换目标对象的属性，结束后自动还原（context manager / decorator）
- **测试隔离**: 每个 TestCase 实例独立，setUp 重新执行避免状态污染
- **doctest 执行**: \`doctest.testmod()\` 解析模块文档字符串，匹配实际输出与预期

## 易错点与陷阱
- **陷阱**: \`setUp\` 中赋值需用 \`self.xxx\`，局部变量无法跨方法共享
- **陷阱**: \`assertRaises\` 必须用 \`with\` 上下文或 callable 形式，直接调用无效
- **陷阱**: \`patch\` 路径必须从导入位置出发，\`patch("builtins.print")\` 而非模块本地引用
- **陷阱**: doctest 中 \`...\` 表示省略中间输出，否则必须完全匹配（含空格）

## 实战建议
- **建议**: 简单脚本用 doctest，复杂逻辑用 unittest，大型项目可考虑 pytest
- **建议**: mock 仅隔离真正外部依赖（IO/网络/时间），避免过度 mock 内部代码
- **建议**: 测试方法名描述行为，\`test_add_positive_numbers\` 优于 \`test_add_1\``,
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
    content: `## 概述
Python 3.13 在 3.11/3.12 基础上继续打磨开发体验：改进错误提示、实验性自由线程（PEP 703）、内置 \`tomllib\`（3.11+），并进一步完善 PEP 695/696/702/742 等类型系统增强。

## 核心要点
- **sys.version**: \`sys.version\` / \`sys.version_info\` - 运行时查询版本，做特性开关
- **f-string 调试符**: \`f"{x=}"\` - 3.8+ 引入，3.12 PEP 701 解除嵌套与引号限制
- **改进错误提示**: 3.11+ 精准定位错误位置，给出建议（如拼写相近的属性名）
- **tomllib**: 3.11+ 内置 TOML 解析器，\`tomllib.load(f)\` 二进制模式读取
- **PEP 703 free-threaded**: 3.13 实验性构建可选禁用 GIL，多线程真正并行
- **PEP 702 @deprecated**: 3.12+ \`@warnings.deprecated\` 装饰器标记弃用 API
- **PEP 696**: 3.13+ TypeVar 默认值 \`T = TypeVar("T", default=int)\`
- **PEP 742**: 3.13+ \`ReadOnly\` TypeForm，细化类型检查器行为

## 原理与机制
- **PEP 657 错误位置**: 3.11+ 通过 \`__traceback__\` 增强定位，逐表达式高亮出错列
- **tomllib 二进制**: \`load\` 要求 \`rb\` 模式，避免编码歧义；\`loads\` 接受字符串
- **free-threaded 构建**: 3.13 提供独立二进制 \`python3.13t\`，需 C 扩展适配线程安全
- **f-string 重写**: 3.12 PEP 701 将 f-string 解析纳入 PEG 解析器，支持嵌套引号与反斜杠
- **@deprecated 机制**: PEP 702 在运行时触发 \`DeprecationWarning\`，类型检查器识别弃用

## 易错点与陷阱
- **陷阱**: free-threaded 模式非默认启用，需安装 \`python3.13t\` 并非所有 C 扩展兼容
- **陷阱**: \`tomllib.load\` 必须二进制模式打开，文本模式会 \`TypeError\`
- **陷阱**: f-string \`{x=}\` 仅 3.8+ 可用，老版本需手动拼 \`f"x={x}"\`
- **陷阱**: PEP 696 默认值需 \`default=...\` 关键字，不是位置参数

## 实战建议
- **建议**: 用 \`sys.version_info >= (3, 11)\` 做特性判断，避免 try/except ImportError
- **建议**: 配置文件优先 TOML（pyproject.toml），用内置 \`tomllib\` 替代 \`tomli\` 第三方库
- **建议**: 性能敏感多线程场景可试用 free-threaded 构建，但先验证依赖兼容性`,
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
