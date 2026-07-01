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
## 一、什么是类型注解

**类型注解（Type Hint）** 是给变量、函数参数、返回值标注类型的一种语法。它**只在静态检查阶段生效**，运行时 Python 解释器**不会强制校验**类型，需要配合 \`\`mypy\`\` / \`\`pyright\`\` 等静态类型检查工具才能真正发挥作用。

\`\`\`python
def greet(name: str, times: int = 1) -> str:
    return (f"hi, {name}! ") * times

age: int = 18           # 变量注解
names: list[str] = []   # 容器注解
\`\`\`

> 设计原理：Python 是动态类型语言，灵活性高但大型项目容易出错。类型注解采用「**渐进式类型化（gradual typing）**」思路——可加可不加，加在哪、加多少由开发者决定，既保留了动态语言的灵活，又能在关键位置获得静态保障。

## 二、PEP 585：内置泛型（3.10+）

3.10 之前需要从 \`\`typing\`\` 导入大写泛型：\`\`List[int]\`\`、\`\`Dict[str, int]\`\`、\`\`Tuple[int, str]\`\`。3.10 起可直接用小写内置类型作为泛型，无需导入：

\`\`\`python
# 旧写法（仍可用，但已弃用）
from typing import List, Dict, Tuple
xs: List[int] = [1, 2, 3]

# 新写法（3.10+，推荐）
xs: list[int] = [1, 2, 3]
config: dict[str, int] = {"a": 1}
point: tuple[int, str] = (1, "x")
\`\`\`

原理：PEP 585 让 \`\`list\`\`/\`\`dict\`\`/\`\`tuple\`\` 等内置容器支持 \`\`__class_getitem__\`\`，因此可以直接写成 \`\`list[int]\`\`。

## 三、PEP 604：联合类型（3.10+）

3.10 之前用 \`\`Optional[int]\`\` 或 \`\`Union[int, None]\`\` 表示「可为 int 或 None」；3.10 起直接用 \`\`|\` 运算符：

\`\`\`python
# 旧写法
from typing import Optional, Union
def find(x: Optional[int]) -> Union[int, str]: ...

# 新写法（3.10+）
def find(x: int | None) -> int | str: ...
\`\`\`

\`\`X | Y\`\` 在运行时也会真正生成一个 \`\`types.UnionType\`\` 对象，可用于 \`\`isinstance\`\` 判断：\`\`isinstance(x, int | str)\`\`。

## 四、TypedDict：给 dict 定义形状

普通 \`\`dict\`\` 只能约束「键值都是某种类型」，无法约束「**哪些键必须存在、每个键的值类型分别是什么**」。\`\`TypedDict\`\` 解决这个问题：

\`\`\`python
from typing_extensions import TypedDict   # 3.8-3.11 需 typing_extensions；3.12+ 已进 typing

class UserDict(TypedDict):
    name: str
    age: int
    email: str | None      # 可选键需要用 total=False 或 NotRequired

u: UserDict = {"name": "alice", "age": 30, "email": None}
# u = {"name": "bob"}  # mypy 报错：缺少 age
\`\`\`

使用场景：API 入参、JSON 配置、数据库行结构——只要数据本质是 dict 但又有固定字段，就适合用 TypedDict。

## 五、Protocol：结构化类型（鸭子类型的形式化）

\`\`Protocol\`\` 是「**结构化子类型（structural subtyping）**」：一个类只要**拥有协议定义的属性/方法**，就算符合该协议，**不需要显式继承**。这是把 Python 的「鸭子类型」形式化的产物。

\`\`\`python
from typing import Protocol

class SupportsClose(Protocol):
    def close(self) -> None: ...

def close_all(things: list[SupportsClose]) -> None:
    for t in things:
        t.close()

class File:               # 没有继承 SupportsClose
    def close(self) -> None: print("File.close()")

class Connection:         # 也没有继承
    def close(self) -> None: print("Connection.close()")

close_all([File(), Connection()])   # mypy 认为合法
\`\`\`

对比 \`\`ABC\`\`（抽象基类）：ABC 是「**名义子类型（nominal subtyping）**」，必须显式继承才被认可；Protocol 只看「形状」是否匹配，更灵活，尤其适合对接第三方库的类型。

## 六、TypeVar / Generic：泛型

\`\`TypeVar\`\` 定义一个「类型变量」，\`\`Generic\`\` 让类成为泛型容器。这样可以写出**与具体类型无关、又能保留类型关系**的代码：

\`\`\`python
from typing import TypeVar, Generic

T = TypeVar("T")

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []
    def push(self, x: T) -> None:
        self._items.append(x)
    def pop(self) -> T:
        return self._items.pop()

s: Stack[int] = Stack()
s.push(1)            # 推入 int
n: int = s.pop()     # 取出仍是 int，mypy 能推出
\`\`\`

设计目的：让 \`\`Stack[int]\`\` 和 \`\`Stack[str]\`\` 共用同一份实现，同时保证「**push 进什么类型，pop 出来还是什么类型**」这种关联不被丢失。

## 七、为什么用类型注解

1. **大型项目可维护性**：函数签名即契约，新人无需读实现就能知道怎么调用。
2. **IDE 智能提示**：PyCharm / VSCode 依赖注解提供补全、跳转、重构。
3. **提前发现 bug**：\`None\` 没判空、传错类型、键名拼错等低级问题可在 CI 阶段被 mypy 拦截，而不是上线后崩。
4. **文档作用**：注解本身就是最准确的接口文档，不会和代码脱节。

## 八、注解不强制运行时检查

类型注解**默认不影响运行**：

\`\`\`python
def add(a: int, b: int) -> int:
    return a + b

add("1", "2")   # 运行不报错，返回 "12"；只有 mypy 才会警告
\`\`\`

要真正发挥价值，需要在 CI 中执行 \`\`mypy your_pkg/\`\` 或 \`\`pyright\`\`。也可以用 \`\`from typing import runtime_checkable\`\` + \`\`isinstance\`\` 做有限的运行时协议检查，但这是可选项。

## 九、易错点小结

| 易错点 | 说明 | 正确做法 |
|--------|------|----------|
| 以为注解会运行时校验 | \`\`add("1","2")\`\` 不报错 | 配合 mypy/pyright 静态检查 |
| 3.9 及更早直接写 \`\`list[int]\`\` | 运行报 TypeError | 3.10+ 才支持；旧版本用 \`\`List[int]\`\` |
| TypedDict 当成普通类实例化 | \`\`UserDict()\`\` 不是 dict | TypedDict 本质仍是 dict，要用字面量构造 |
| Protocol 用继承方式实现 | 失去结构化优势 | 让类「自然拥有」方法即可，不要继承 |
| 泛型类不写 \`\`Generic[T]\`\` | \`\`Stack[int]\`\` 报错 | 类要继承 \`\`Generic[T]\`\`（或 3.12+ 用 \`\`class Stack[T]\`\`） |
| \`\`Optional[X]\`\` 误以为「不能为 None」 | 实际是「可以为 None」 | 等价于 \`\`X | None\`\`，要在函数内判空 |
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
## 一、PEP 695 是什么

**PEP 695** 是 Python 3.12（2023-10）引入的「**类型参数新语法**」，目标是用更简洁、更直观的方式定义**泛型类、泛型函数、类型别名**。它把过去「先定义 TypeVar、再继承 Generic」的两步流程压缩成一行，并且**无需 import** 任何东西。

适用版本：3.12+。3.11 及更早只能用旧语法（\`TypeVar\` + \`Generic\`）。

## 二、旧语法的痛点

定义一个泛型栈，旧写法分两步：

\`\`\`python
from typing import TypeVar, Generic

T = TypeVar("T")              # 第一步：先声明类型变量

class Stack(Generic[T]):      # 第二步：再继承 Generic[T]
    def push(self, x: T) -> None: ...
    def pop(self) -> T: ...
\`\`\`

痛点：
- 必须先 \`\`import TypeVar, Generic\`\`；
- \`\`T = TypeVar("T")\`\` 与类的定义分离，读代码时要上下翻找；
- 多个类型参数时模板代码膨胀。

## 三、新语法：class X[T]

PEP 695 把类型参数**直接写在类名后的方括号里**：

\`\`\`python
class Stack[T]:               # 无需 import
    def push(self, x: T) -> None: ...
    def pop(self) -> T: ...
\`\`\`

逐行讲解：
- \`class Stack[T]:\`——\`[T]\` 是「类型参数列表」，\`T\` 在整个类体内自动可见，相当于一个隐式的 TypeVar；
- \`def push(self, x: T)\`——\`T\` 用作参数类型；
- \`def pop(self) -> T\`——\`T\` 用作返回类型，与 push 关联（push 什么、pop 什么）。

实例化时照常写 \`\`Stack[int]()\`\`、\`\`Stack[str]()\`\`。

## 四、新语法：def fn[T]

泛型**函数**同样支持：

\`\`\`python
def first[T](xs: list[T]) -> T | None:
    return xs[0] if xs else None
\`\`\`

逐行讲解：
- \`def first[T](xs: ...)\`——\`[T]\` 紧跟函数名，声明这次调用会引入一个类型参数 \`T\`；
- \`xs: list[T]\`——入参是「元素类型为 T 的列表」；
- \`-> T | None\`——返回要么是该元素、要么是 None；
- 调用 \`\`first([1,2,3])\`\` 时，mypy 会自动把 \`T\` 推断为 \`int\`，返回类型即 \`int | None\`。

## 五、类型边界（Type Bound）

可以用 \`\`[T: (int, float)]\`\` 限制 \`T\` 只能是某些类型之一（**类型约束**）；也可以用 \`\`[T: Number]\`\` 限制 \`T\` 必须是某个基类的子类（**上界约束**）：

\`\`\`python
# T 只能是 int 或 float
def double[T: (int, float)](x: T) -> T:
    return x + x

double(3)       # OK
double(1.5)     # OK
# double("a")   # mypy 报错：str 不在 (int, float) 内
\`\`\`

对比旧写法：\`T = TypeVar("T", int, float)\` 或 \`T = TypeVar("T", bound=Number)\`，新语法更直观。

## 六、type 语句：类型别名

3.12 之前定义类型别名只能赋值：

\`\`\`python
Vector = list[float]          # 旧：简单赋值，mypy 要靠推断识别
\`\`\`

3.12 新增 \`\`type\`\` 语句，**显式声明这是类型别名**：

\`\`\`python
type Vector = list[float]     # 新：明确、不可作变量用
type Matrix = list[Vector]
type UserId = int
\`\`\`

区别：
- \`type Vector = ...\` 在运行时生成一个 \`\`typing.TypeAliasType\`\` 对象，mypy 100% 识别为别名；
- 旧赋值写法 \`\`Vector = list[float]\`\` 在运行时得到的是 \`\`list[float]\`\` 这个泛型对象本身，mypy 有时需要 \`\`TypeAlias\`\` 标注才认。
- \`type\` 语句还支持泛型别名：\`type Map[K, V] = dict[K, V]\`。

## 七、多类型参数

多个类型参数用逗号分隔：

\`\`\`python
class Pair[K, V]:
    def __init__(self, key: K, value: V):
        self.key, self.value = key, value

p: Pair[str, int] = Pair("age", 30)
\`\`\`

同样适用于函数和 \`\`type\`\` 别名：\`type Dict_[K, V] = dict[K, V]\`。

## 八、新旧语法对比

| 场景 | 旧语法（3.11-） | 新语法 PEP 695（3.12+） |
|------|----------------|------------------------|
| 泛型类 | \`T = TypeVar("T")\` + \`class Stack(Generic[T])\` | \`class Stack[T]\` |
| 泛型函数 | \`T = TypeVar("T")\` + \`def first(xs: list[T]) -> T\` | \`def first[T](xs: list[T]) -> T\` |
| 类型约束 | \`T = TypeVar("T", int, float)\` | \`def fn[T: (int, float)]\` |
| 上界约束 | \`T = TypeVar("T", bound=Number)\` | \`def fn[T: Number]\` |
| 类型别名 | \`Vector = list[float]\` | \`type Vector = list[float]\` |
| 泛型别名 | 较繁琐，需 Callable 等技巧 | \`type Map[K, V] = dict[K, V]\` |
| 多参数 | \`class Pair(Generic[K, V])\` | \`class Pair[K, V]\` |
| 是否 import | 需要 \`TypeVar, Generic\` | **无需 import** |

## 九、3.12 之前怎么办

3.11 及更早版本**只能用旧语法**。如果项目需要兼容多版本，常见做法：
- 在 3.12+ 用新语法，在 CI 矩阵里跑多版本测试；
- 或统一用旧语法（\`TypeVar\`/\`Generic\`），3.12 也完全兼容旧语法，迁移可渐进。

> 经验：除非项目最低支持版本已升到 3.12，否则**新语法用于新代码、旧代码保持不动**，避免为美观破坏兼容。

## 十、易错点小结

| 易错点 | 说明 | 正确做法 |
|--------|------|----------|
| 3.11 及更早用 \`\`class X[T]\`\` | 语法错误 | 旧版本必须用 \`TypeVar\` + \`Generic\` |
| 忘记 \`\`type\`\` 关键字 | \`Vector = list[float]\` 仍可用但不显式 | 显式别名用 \`type Vector = ...\` |
| \`\`[T: (int, float)]\`\` 写成 \`\`[T: int, float]\`\` | 语法错误 | 约束元组要加括号 |
| 类型参数名与变量名冲突 | \`\`T\`\` 既当类型又当变量 | 类型参数约定大写，避免与实例变量重名 |
| 新语法与 \`TypeVar\` 混用 | \`class X[T](Generic[T])\` 多余 | 新语法已自动等价，不要再继承 \`Generic\` |
| 以为 \`type\` 别名能当值用 | \`Vector.append(1.0)\` 报错 | \`type\` 定义的是类型，不是实例 |
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
## 一、为什么写测试

写测试表面上是「额外工作量」，但带来的回报是巨大的：

1. **保证正确性**：每次改动后跑一遍测试，立刻知道有没有把原来的功能改坏。
2. **重构有底气**：有测试托底，才敢放心优化结构、替换实现，否则一改就出 bug。
3. **文档作用**：测试用例就是「这个函数该怎么用、边界在哪」的最准确示例，比文档更不易过期。
4. **驱动设计**：可测试的代码往往耦合更低——写测试时觉得难测，说明设计有问题。

业界经验：项目一旦超过几千行，没测试就开始「改一个 bug 引入两个 bug」的恶性循环。

## 二、unittest：标准库 xUnit 风格

\`\`unittest\`\` 是 Python 自带的测试框架，借鉴 Java JUnit 的 xUnit 风格：测试类继承 \`\`TestCase\`\`，用 \`\`assertEqual\`\`/\`assertTrue\` 等自带断言方法。

\`\`\`python
import unittest

def add(a, b):
    return a + b

class TestAdd(unittest.TestCase):
    def test_add_positive(self):
        self.assertEqual(add(2, 3), 5)         # 断言相等

    def test_add_zero(self):
        self.assertEqual(add(0, 0), 0)

    def test_add_negative(self):
        self.assertEqual(add(-1, -2), -3)

if __name__ == "__main__":
    unittest.main()
\`\`\`

逐行讲解：
- \`class TestAdd(unittest.TestCase)\`——测试类必须继承 \`TestCase\`，框架才会识别；
- \`def test_add_positive(self)\`——方法名必须以 \`\`test_\`\` 开头，框架才会自动跑；
- \`self.assertEqual(x, y)\`——断言 \`x == y\`，失败时框架会打印详细对比；其它常用：\`assertTrue\`/\`assertFalse\`/\`assertRaises\`/\`assertIn\`；
- \`unittest.main()\`——扫描当前模块里所有 \`TestCase\` 子类并执行其中 \`test_\`\` 方法。

运行：\`\`python test_xxx.py\`\` 或 \`\`python -m unittest discover\`\`。

## 三、pytest：第三方，函数式，推荐

\`\`pytest\`\` 是社区主流测试框架，**无需继承**、**直接用 \`assert\`**，写法更 Pythonic：

\`\`\`python
def add(a, b):
    return a + b

def test_add_positive():
    assert add(2, 3) == 5         # 直接 assert，失败时 pytest 自动展开表达式

def test_add_zero():
    assert add(0, 0) == 0
\`\`\`

约定：
- 测试文件名以 \`\`test_\`\` 开头（如 \`\`test_calc.py\`\`）；
- 测试函数名以 \`\`test_\`\` 开头；
- 直接 \`\`assert 表达式\`\`，pytest 会用断言重写（assert rewriting）显示左右值对比。

运行：\`\`pytest\`\`（自动发现）、\`\`pytest -v\`\`（详细）、\`\`pytest -k add\`\`（只跑名字含 add 的）。

对比 unittest：代码量更少、断言更直观、错误信息更友好、插件生态更丰富（pytest-cov、pytest-mock、pytest-xdist 并行等），**新项目优先选 pytest**。

## 四、mock：替换依赖，隔离测试

当被测函数依赖「网络请求、数据库、时间、第三方 API」时，真实跑这些会慢且不稳定。\`\`unittest.mock.patch\`\` 临时把这些依赖**替换成假对象**，让测试只关注被测逻辑本身。

\`\`\`python
from unittest.mock import patch

def fetch_user(user_id):
    # 真实实现会访问数据库，测试时不想真连
    raise NotImplementedError

def show_user(user_id):
    user = fetch_user(user_id)
    return f"User: {user['name']}"

with patch("__main__.fetch_user", return_value={"name": "alice", "id": 7}):
    print(show_user(7))   # 输出 "User: alice"，不会触发真实 fetch_user
\`\`\`

逐行讲解：
- \`with patch("__main__.fetch_user", return_value=...)\`——在 \`with\` 块内，\`fetch_user\` 被替换为一个 \`MagicMock\`，调用时返回指定的字典；
- \`show_user(7)\`——内部调用 \`fetch_user\`，拿到 mock 返回值，正常走业务逻辑；
- 离开 \`with\` 块后，\`fetch_user\` 自动恢复原状。

要点：patch 的目标字符串必须是「**调用方看到的路径**」，不是「定义处」。比如 \`a.py\` 里 \`from b import fetch_user\`，那么在 \`a\` 里 patch 应写成 \`patch("a.fetch_user")\`。

## 五、fixture：测试夹具（pytest）

\`\`fixture\`\` 用于**复用测试前置数据/资源**：连接数据库、准备临时目录、构造复杂对象等。用 \`@pytest.fixture\` 定义，测试函数通过参数注入：

\`\`\`python
import pytest

@pytest.fixture
def sample_users():
    return [{"name": "alice"}, {"name": "bob"}]

def test_count(sample_users):
    assert len(sample_users) == 2

def test_first(sample_users):
    assert sample_users[0]["name"] == "alice"
\`\`\`

执行时 pytest 自动调用 \`sample_users()\`，把返回值传给两个测试函数。fixture 还可加 \`scope="session"\`/\`"module"\`/\`"function"\` 控制生命周期，避免重复构造。

## 六、parametrize：参数化测试

同一逻辑要验证多组数据时，\`@pytest.mark.parametrize\` 让一组数据跑多次：

\`\`\`python
import pytest

@pytest.mark.parametrize("a, b, expected", [
    (2, 3, 5),
    (0, 0, 0),
    (-1, -2, -3),
    (100, 200, 300),
])
def test_add(a, b, expected):
    assert add(a, b) == expected
\`\`\`

效果：等价于写了 4 个独立测试函数，pytest 会分别报告每个用例的通过/失败，比手写循环 + 一个 assert 强得多。

## 七、覆盖率：pytest --cov

覆盖率衡量「**测试执行了多少行/分支**」，常用 \`pytest-cov\` 插件：

\`\`\`bash
pytest --cov=mypkg --cov-report=term-missing
\`\`\`

- \`--cov=mypkg\`——统计 \`mypkg\` 包的覆盖情况；
- \`--cov-report=term-missing\`——终端输出，并列出**未覆盖的行号**，方便补测。

经验：覆盖率不是越高越好，70-90% 通常够用；关键路径追求高覆盖，边角代码不必强求。

## 八、doctest：文档测试

\`\`doctest\`\` 把 docstring 里的 \`\`>>>\`\` 交互示例当作测试来跑：

\`\`\`python
def add(a, b):
    """
    返回两数之和。

    >>> add(2, 3)
    5
    >>> add(-1, 1)
    0
    """
    return a + b
\`\`\`

运行 \`\`python -m doctest -v module.py\`\` 或在 pytest 里启用 \`\`--doctest-modules\`\`。优点：示例和代码在一起，永远不过期；适合工具函数、教学代码。不适合复杂场景。

## 九、TDD：测试驱动开发

TDD（Test-Driven Development）流程：「**红 → 绿 → 重构**」：
1. **红**：先写一个失败的测试（描述要做的功能）；
2. **绿**：写最少的生产代码让测试通过；
3. **重构**：在测试保护下优化代码。

适合：需求明确、逻辑复杂的核心模块。不必教条地对所有代码 TDD。

## 十、易错点小结

| 易错点 | 说明 | 正确做法 |
|--------|------|----------|
| unittest 用 \`\`assert x == y\`\` | 失败信息不友好 | 用 \`self.assertEqual(x, y)\` 等专用方法 |
| pytest 测试名不以 \`\`test_\`\` 开头 | 不会被收集 | 函数/文件名严格按 \`test_\` 前缀 |
| patch 路径写错 | mock 不生效 | patch「调用方看到的路径」，不是定义处 |
| mock 没清理 | 影响其它测试 | 用 \`with patch(...)\` 或 \`patch(...)\` 装饰器自动清理 |
| 测试间有依赖 | 顺序敏感、不稳定 | 用 fixture 隔离状态，每个测试独立 |
| 追求 100% 覆盖率 | 投入产出比低 | 关注核心路径，边角代码不必强求 |
| 测试里写真实网络/DB | 慢且不稳定 | 用 mock/fixture 替换外部依赖 |
| doctest 写复杂场景 | 难维护 | doctest 只用于简单工具函数 |
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
## 一、版本时间线

| 版本 | 发布时间 | 主题 |
|------|---------|------|
| 3.10 | 2021-10 | match-case、PEP 604（\`int | None\`）、PEP 585（\`list[int]\`） |
| 3.11 | 2022-10 | ExceptionGroup、TaskGroup、tomllib、CPython 提速 10-60% |
| 3.12 | 2023-10 | PEP 695 类型参数语法、PEP 701 f-string 改进、更精准错误信息 |
| 3.13 | 2024-10 | 实验性 JIT、新 REPL、自由线程（实验）、性能再提升 10-15% |

本节聚焦 3.12 与 3.13 这两个版本的核心新特性。

## 二、3.12：PEP 695 类型参数语法

3.12 引入新的泛型语法，把过去「先 \`TypeVar\`、再 \`Generic\`」两步压缩成一行：

\`\`\`python
# 旧（3.11-）
from typing import TypeVar, Generic
T = TypeVar("T")
class Stack(Generic[T]): ...

# 新（3.12+）
class Stack[T]: ...
def first[T](xs: list[T]) -> T | None: ...
type Vector = list[float]      # 显式类型别名
\`\`\`

无需 import，更直观。详见「PEP 695」专章。

## 三、3.12：PEP 701 f-string 改进

3.12 之前 f-string 受 lexer 限制很死：表达式里**不能再用同样的引号**、**不能反斜杠转义**、**不能跨多行注释**。PEP 701 用 PEG 解析器重写 f-string，解锁了这些限制：

\`\`\`python
# 1) 嵌套引号（同种引号也能用）
name = "alice"
print(f"Hello, {name!r}!")          # 内层用 !r 没问题
print(f"{'X' * 3}")                  # 内层单引号与外层双引号一致也合法

# 2) 多行表达式（含推导式、lambda）
data = {"x": 1, "y": 2}
print(f"sum: {
    sum(v for v in data.values())
}")

# 3) 反斜杠终于可用
paths = ["a\\\\b", "c/d"]
print(f"first: {paths[0].replace('\\\\', '/')}")
\`\`\`

意义：f-string 不再是「半残的字符串」，写复杂表达式不再要回退到 \`str.format\`。错误信息也更清晰，能精确指出哪段表达式出错。

## 四、3.12：更精准的错误信息

3.12 大幅改进了解析器和错误提示，常见改进：
- **建议修复**：拼错变量名时主动建议「did you mean: ...」；
- **精确位置**：错误光标精确到具体 token，而非整行；
- **括号匹配提示**：缺括号会指出在哪一处开始不匹配；
- **import 建议模块**：拼错模块名会建议正确的包名。

\`\`\`python
>>> print(name)        # NameError: name 'name' is not defined. Did you mean: 'names'?
>>> (1 + 2 * 3         # SyntaxError: '(' was never closed
\`\`\`

对新手极其友好，调试效率显著提升。

## 五、3.13：实验性 JIT（PEP 744）

3.13 引入**实验性复制式 JIT 编译器**（copy-and-patch JIT），把热点字节码在运行时编译为机器码，**有望提升性能**：

- 默认**关闭**，需要用 \`\`PYTHON_JIT=1\`\` 环境变量开启；
- 目前是第一阶段，主要给后续版本铺路；
- 微基准上对纯 Python 循环有可观提升，对 C 扩展调用密集型代码提升有限。

> 注意：实验性意味着 API/行为可能在 3.14 调整，**生产环境不建议强依赖**。

## 六、3.13：新交互式 REPL（PyREPL）

3.13 重写了交互式解释器，基于 \`PyREPL\` 项目：
- **多行编辑**：粘贴多行代码不再乱缩进，支持块编辑；
- **彩色输出**：错误、字符串、关键字等自动着色；
- **历史浏览**：上下键翻历史，支持按字符串过滤；
- **更好的补全**：Tab 补全更智能，支持 \`help()\` 内嵌。

直接敲 \`python\` 进入即可体验，无需额外配置。对教学、调试、REPL 探索场景体验提升明显。

## 七、3.13：性能提升 10-15%

延续 3.11 的「Faster CPython」项目，3.13 通过：
- 进一步优化对象布局与内联缓存；
- 改进解释器循环；
- 实验性 JIT（开启时）；

整体比 3.12 **快 10-15%**，部分场景更多。长期目标是 5 年内把 CPython 速度提升 5 倍。

## 八、3.13：自由线程（PEP 703，实验性）

GIL（全局解释器锁）长期以来限制 Python 多线程真并行。PEP 703 提出**移除 GIL** 的「自由线程」构建：

- 3.13 提供**实验性 nogil 构建**（需单独编译，默认发行版仍带 GIL）；
- 通过引用计数改造、延迟引用、对象不可变优化等保证线程安全；
- 多线程 CPU 密集任务有望真正受益；
- 大多数 C 扩展需重新编译/适配才能在自由线程下安全运行。

启用方式（实验）：构建时 \`\`./configure --disable-gil\`\`，运行时 \`\`python -X gil=0\`\`。

> 现状：实验阶段，生态兼容性差，**生产慎用**。等 3.14+ 趋于稳定再评估。

## 九、版本特性速查表

| 类别 | 3.12 | 3.13 |
|------|------|------|
| 类型系统 | PEP 695（class X[T]、type 别名） | 继续完善 |
| 字符串 | PEP 701（f-string 自由化） | —— |
| 错误信息 | 建议修复、精确定位 | 进一步优化 |
| 性能 | 微优化 | 实验性 JIT、整体快 10-15% |
| 交互体验 | —— | 新 REPL（PyREPL） |
| 并发 | —— | 自由线程（实验性 nogil） |
| 弃用 | distutils 移除、imp 移除 | 进一步清理 |

## 十、升级建议

1. **学习/个人项目**：直接装 3.13 最新稳定版，体验新 REPL、JIT 等特性。
2. **生产环境**：
   - 等 3.13.x 的 \`\`.1\`\` 修正版（如 3.13.1）后再升级，避免首发 bug；
   - 先在 CI 矩阵里多版本跑测试，确认依赖兼容；
   - 关键 C 扩展先确认有 3.13 的 wheel 或可重新编译。
3. **自由线程 / JIT**：标记为实验性，**不要在生产强依赖**，可对比测试看收益。
4. **类型注解**：3.12+ 可逐步在新代码用 PEP 695 语法，旧代码保持不动。

## 十一、演进趋势

观察近几个版本，CPython 的演进方向清晰：
- **性能优化**：Faster CPython + JIT + 移除 GIL，向「更快、能真并行」迈进；
- **类型系统增强**：PEP 695/698/742 等，让静态类型更易用、更表达力强；
- **语法体验**：f-string 自由化、match-case、新 REPL，向「写起来更顺手」演化；
- **工具链整合**：tomllib 内置、pyrepl 内置，减少对第三方工具的依赖。

对开发者而言：保持关注新版本、渐进式采用新特性、不盲目追新，是平衡效率与稳定的关键。

## 十二、易错点小结

| 易错点 | 说明 | 正确做法 |
|--------|------|----------|
| 3.12 用新 f-string 写法跑在 3.11 | 语法错误 | 确认运行环境版本，必要时回退老写法 |
| 以为 JIT 默认开启 | 实际默认关闭 | 设 \`PYTHON_JIT=1\` 才启用，且为实验性 |
| 在 3.13 默认构建上期待 nogil | 默认仍带 GIL | 需单独构建自由线程版本 |
| 生产直接上 3.13.0 首发版 | 可能有 bug | 等 3.13.1+ 修正版 |
| 滥用 PEP 695 新语法 | 旧环境不兼容 | 项目最低版本 < 3.12 时仍用旧语法 |
| 以为 PEP 701 任意嵌套都安全 | 复杂表达式可读性下降 | 仍要适度，过长的表达式拆到变量里 |
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