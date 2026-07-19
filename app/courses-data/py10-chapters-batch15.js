// =============================================================
// Python 从入门到精通大全（终极版）—— 第15批章节
// 第十五部分 测试与工程化（共 5 章）
// =============================================================

const chapters = [
  {
    id: "py10-ch71",
    group: "第十五部分 测试与工程化",
    icon: "🧪",
    title: "第七十一章 unittest 单元测试",
    content: `

# 第七十一章 unittest 单元测试

## 一、为什么需要单元测试

单元测试是对代码最小可测单元（通常是函数/方法）的自动化验证。它能：

- 在修改代码时立即发现回归
- 作为活文档说明函数行为
- 强制代码可测，倒逼更好的设计
- 提供重构的安全网

Python 标准库自带 \`unittest\` 模块，无需安装。

\`\`\`python
import unittest


# 待测试的函数
def add(a: int, b: int) -> int:
    return a + b


def divide(a: int, b: int) -> float:
    if b == 0:
        raise ValueError("除数不能为 0")
    return a / b


# 编写测试：继承 TestCase
class TestMath(unittest.TestCase):
    """数学函数测试"""

    def test_add(self):
        # 每个测试方法以 test_ 开头
        # WHY: unittest 自动发现并运行所有 test_ 方法
        self.assertEqual(add(1, 2), 3)
        self.assertEqual(add(-1, 1), 0)
        self.assertEqual(add(0, 0), 0)

    def test_add_types(self):
        # 多种输入组合
        self.assertEqual(add(1.5, 2.5), 4.0)
        # 字符串拼接也能用 +，但这是 add 函数的预期行为
        self.assertEqual(add("a", "b"), "ab")

    def test_divide_normal(self):
        self.assertEqual(divide(10, 2), 5.0)
        self.assertAlmostEqual(divide(1, 3), 0.3333, places=3)

    def test_divide_by_zero(self):
        # assertRaises 验证抛出异常
        # WHY: 异常路径必须测试，确保错误处理正确
        with self.assertRaises(ValueError) as ctx:
            divide(10, 0)
        self.assertIn("除数不能为 0", str(ctx.exception))


# 运行测试
if __name__ == "__main__":
    # verbosity=2 显示每个测试的详细信息
    unittest.main(argv=[''], exit=False, verbosity=2)

\`\`\`

## 二、常用断言方法

\`\`\`python
import unittest


class DemoTest(unittest.TestCase):
    """演示各种断言"""

    def test_equality(self):
        # 相等性
        self.assertEqual(1 + 1, 2)         # ==
        self.assertNotEqual(1, 2)          # !=

    def test_boolean(self):
        # 布尔
        self.assertTrue([1, 2, 3])         # bool(x) is True
        self.assertFalse([])               # bool(x) is False

    def test_is_none(self):
        self.assertIsNone(None)            # x is None
        self.assertIsNotNone(0)             # x is not None

    def test_identity(self):
        # is / is not
        a = [1, 2]
        b = a
        c = [1, 2]
        self.assertIs(a, b)                # 同一对象
        self.assertIsNot(a, c)             # 不同对象

    def test_membership(self):
        # 成员判断
        self.assertIn(2, [1, 2, 3])
        self.assertNotIn(4, [1, 2, 3])

    def test_types(self):
        # 类型断言
        self.assertIsInstance(42, int)
        self.assertNotIsInstance("x", int)

    def test_approximate(self):
        # 浮点近似
        # WHY: 浮点直接比较不安全，必须用 assertAlmostEqual
        self.assertAlmostEqual(0.1 + 0.2, 0.3, places=7)
        self.assertAlmostEqual(1 / 3, 0.33333, places=4)

    def test_exceptions(self):
        # 异常断言
        with self.assertRaises(ZeroDivisionError):
            1 / 0
        with self.assertRaises(TypeError):
            "a" + 1

    def test_warning(self):
        # 警告断言
        import warnings
        with self.assertWarns(DeprecationWarning):
            warnings.warn("deprecated", DeprecationWarning)


# 运行
unittest.main(argv=[''], exit=False, verbosity=2)

\`\`\`

## 三、setUp 与 tearDown

\`\`\`python
import unittest
import sqlite3


class DatabaseTest(unittest.TestCase):
    """数据库测试，演示 setUp/tearDown"""

    def setUp(self):
        # 每个测试方法前调用
        # WHY: 准备测试夹具，保证测试间相互独立
        self.conn = sqlite3.connect(":memory:")
        self.conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)")
        self.conn.commit()

    def tearDown(self):
        # 每个测试方法后调用
        # WHY: 清理资源，避免影响后续测试
        self.conn.close()

    def test_insert(self):
        self.conn.execute("INSERT INTO users (name) VALUES (?)", ("张三",))
        self.conn.commit()
        count = self.conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        self.assertEqual(count, 1)

    def test_select_empty(self):
        # setUp 每次都创建新数据库，所以这个测试看到的是空表
        # WHY: 测试隔离比测试速度更重要
        count = self.conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        self.assertEqual(count, 0)


unittest.main(argv=[''], exit=False, verbosity=2)

\`\`\`

## 四、setUpClass 与 tearDownClass

\`\`\`python
import unittest


class ExpensiveSetupTest(unittest.TestCase):
    """演示类级别夹具"""

    @classmethod
    def setUpClass(cls):
        # 整个测试类只调用一次，所有测试方法共享
        # WHY: 启动开销大的资源（如 Web 服务器）用 class 级夹具
        cls.shared_data = [i * 2 for i in range(100)]
        print("[setUpClass] 初始化共享数据")

    @classmethod
    def tearDownClass(cls):
        print("[tearDownClass] 清理共享资源")

    def test_data_length(self):
        self.assertEqual(len(self.shared_data), 100)

    def test_data_content(self):
        self.assertEqual(self.shared_data[0], 0)
        self.assertEqual(self.shared_data[50], 100)
        self.assertEqual(self.shared_data[-1], 198)


unittest.main(argv=[''], exit=False, verbosity=2)

\`\`\`

## 五、TestSuite 组织测试

\`\`\`python
import unittest


class TestString(unittest.TestCase):
    def test_upper(self):
        self.assertEqual("abc".upper(), "ABC")

    def test_split(self):
        self.assertEqual("a,b,c".split(","), ["a", "b", "c"])


class TestList(unittest.TestCase):
    def test_append(self):
        lst = []
        lst.append(1)
        self.assertEqual(lst, [1])

    def test_pop(self):
        lst = [1, 2, 3]
        self.assertEqual(lst.pop(), 3)


# 手动构建 TestSuite
# WHY: 需要按特定顺序或子集运行测试时用 TestSuite
suite = unittest.TestSuite()
suite.addTest(TestString("test_upper"))
suite.addTest(TestList("test_pop"))

runner = unittest.TextTestRunner(verbosity=2)
runner.run(suite)

\`\`\`

## 六、测试发现

\`\`\`python
import unittest
import os


# 项目结构示例：
# my_project/
# ├── src/
# │   └── mymodule.py
# └── tests/
#     ├── __init__.py
#     ├── test_module1.py
#     └── test_module2.py

# 命令行自动发现测试：
# python -m unittest discover
#   -s tests/        指定测试目录
#   -p "test_*.py"   匹配模式
#   -v               详细输出

# 代码内调用 discover
loader = unittest.TestLoader()
# 在当前目录扫描 test_*.py
suite = loader.discover(start_dir=".", pattern="test_*.py")
print(f"发现 {suite.countTestCases()} 个测试")

# WHY: 大项目用 discover 自动扫描，无需手动维护测试列表

\`\`\`

## 七、mock 简介与跳过测试

\`\`\`python
import unittest
from unittest.mock import Mock, patch


class UserService:
    """依赖外部 API 的服务"""

    def __init__(self, api_client):
        self.api = api_client

    def get_user_name(self, user_id: int) -> str:
        # 调用外部 API
        response = self.api.get(f"/users/{user_id}")
        if response.status_code == 200:
            return response.json()["name"]
        return "Unknown"


class TestUserService(unittest.TestCase):
    def test_get_user_name(self):
        # 用 Mock 替代真实 API
        # WHY: 测试不应依赖网络，必须隔离外部依赖
        mock_api = Mock()
        mock_api.get.return_value.status_code = 200
        mock_api.get.return_value.json.return_value = {"name": "张三"}

        service = UserService(mock_api)
        name = service.get_user_name(1)
        self.assertEqual(name, "张三")
        # 验证 mock 被正确调用
        mock_api.get.assert_called_once_with("/users/1")

    def test_get_user_not_found(self):
        mock_api = Mock()
        mock_api.get.return_value.status_code = 404

        service = UserService(mock_api)
        name = service.get_user_name(999)
        self.assertEqual(name, "Unknown")


# 跳过测试
@unittest.skip("功能未实现")
class TestFuture(unittest.TestCase):
    def test_something(self):
        pass


class TestConditional(unittest.TestCase):
    @unittest.skipIf(True, "条件不满足")
    def test_skip_if(self):
        pass

    @unittest.expectedFailure
    def test_known_bug(self):
        # 预期失败，失败了反而是通过
        # WHY: 标记已知 bug，修复后测试通过会提示
        self.assertEqual(1, 2)


unittest.main(argv=[''], exit=False, verbosity=2)

\`\`\`

## 八、参数化测试

\`unittest\` 没有内置参数化，但可以用 \`subTest\` 实现类似效果。

\`\`\`python
import unittest


def is_prime(n: int) -> bool:
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True


class TestPrime(unittest.TestCase):
    def test_primes(self):
        # subTest 让每个用例独立报告失败
        # WHY: 不用 subTest 一个失败就停止，后续无法看到
        cases = [
            (2, True), (3, True), (4, False), (5, True),
            (10, False), (13, True), (15, False), (17, True),
        ]
        for n, expected in cases:
            with self.subTest(n=n):
                self.assertEqual(is_prime(n), expected)


unittest.main(argv=[''], exit=False, verbosity=2)

\`\`\`

## 九、实战：完整的测试套件

\`\`\`python
import unittest
from typing import Callable


# 待测试模块：一个简单的栈
class Stack:
    def __init__(self):
        self._items = []

    def push(self, item):
        self._items.append(item)

    def pop(self):
        if not self._items:
            raise IndexError("pop from empty stack")
        return self._items.pop()

    def peek(self):
        if not self._items:
            raise IndexError("peek from empty stack")
        return self._items[-1]

    def is_empty(self) -> bool:
        return len(self._items) == 0

    def size(self) -> int:
        return len(self._items)


class TestStack(unittest.TestCase):
    """栈的完整测试"""

    def setUp(self):
        self.stack = Stack()

    def test_new_stack_is_empty(self):
        self.assertTrue(self.stack.is_empty())
        self.assertEqual(self.stack.size(), 0)

    def test_push_increases_size(self):
        self.stack.push(1)
        self.assertEqual(self.stack.size(), 1)
        self.assertFalse(self.stack.is_empty())

    def test_pop_returns_last_pushed(self):
        self.stack.push("a")
        self.stack.push("b")
        self.assertEqual(self.stack.pop(), "b")
        self.assertEqual(self.stack.pop(), "a")

    def test_pop_empty_raises(self):
        with self.assertRaises(IndexError):
            self.stack.pop()

    def test_peek_does_not_remove(self):
        self.stack.push(42)
        self.assertEqual(self.stack.peek(), 42)
        self.assertEqual(self.stack.size(), 1)

    def test_lifo_order(self):
        for i in range(5):
            self.stack.push(i)
        result = []
        while not self.stack.is_empty():
            result.append(self.stack.pop())
        # 后进先出
        self.assertEqual(result, [4, 3, 2, 1, 0])


# 运行所有测试
suite = unittest.TestLoader().loadTestsFromTestCase(TestStack)
runner = unittest.TextTestRunner(verbosity=2)
result = runner.run(suite)
print(f"\\n通过: {result.testsRun - len(result.failures) - len(result.errors)}/{result.testsRun}")

\`\`\`

## 小结

本章介绍了 unittest 单元测试：

- **TestCase**：测试类基类
- **断言方法**：assertEqual、assertTrue、assertRaises 等
- **setUp/tearDown**：方法级夹具
- **setUpClass/tearDownClass**：类级夹具
- **TestSuite**：手动组织测试
- **discover**：自动发现测试
- **mock**：隔离外部依赖
- **subTest**：参数化测试

下一章我们学习更现代的 pytest 风格测试。
`
  },
  {
    id: "py10-ch72",
    group: "第十五部分 测试与工程化",
    icon: "✅",
    title: "第七十二章 pytest 风格测试",
    content: `

# 第七十二章 pytest 风格测试

## 一、pytest 是什么

pytest 是第三方测试框架，比 unittest 更简洁强大。虽然需要 \`pip install pytest\`，但它的风格值得学习：

- 不需要继承类
- 用 \`assert\` 直接断言，失败信息自动生成
- 强大的 fixture 系统
- 丰富的插件生态

本章代码可在沙箱运行（pytest 不在标准库，但我们可以模拟其核心 API）。

\`\`\`python
# pytest 风格 vs unittest 风格对比
import unittest


# ============ unittest 风格 ============
class TestAddUnittest(unittest.TestCase):
    def test_add(self):
        self.assertEqual(1 + 1, 2)
        self.assertEqual(2 + 3, 5)


# ============ pytest 风格（无需继承） ============
def test_add():
    # 直接用 assert，失败时 pytest 自动显示差异
    # WHY: 简洁的 assert 让测试代码更接近普通代码
    assert 1 + 1 == 2
    assert 2 + 3 == 5


def test_string_operations():
    assert "hello".upper() == "HELLO"
    assert "a,b,c".split(",") == ["a", "b", "c"]
    assert "abc".startswith("a")


def test_list_operations():
    lst = [1, 2, 3]
    lst.append(4)
    assert lst == [1, 2, 3, 4]
    assert 4 in lst
    assert len(lst) == 4


# 用 unittest 跑这些 pytest 风格的函数也能成功
# WHY: pytest 兼容 unittest，反过来 unittest 也能跑普通函数（需 pytest）
unittest.FunctionTestCase(test_add).run()
print("pytest 风格测试可以正常工作")

\`\`\`

## 二、fixture 测试夹具

fixture 是 pytest 的核心特性，用 \`@pytest.fixture\` 装饰器定义。这里用标准库模拟。

\`\`\`python
import sqlite3
from typing import Callable


# 模拟 pytest 的 fixture 机制
class PytestLike:
    """简化版 pytest 风格测试运行器"""

    def __init__(self):
        self.fixtures: dict[str, Callable] = {}

    def fixture(self, func):
        # 注册 fixture
        # WHY: fixture 让测试数据可复用，避免每个测试都重复准备
        self.fixtures[func.__name__] = func
        return func

    def run_test(self, test_func):
        # 自动注入 fixture
        import inspect
        sig = inspect.signature(test_func)
        kwargs = {}
        for name, param in sig.parameters.items():
            if name in self.fixtures:
                kwargs[name] = self.fixtures[name]()
        test_func(**kwargs)
        print(f"  ✓ {test_func.__name__}")


pt = PytestLike()


@pt.fixture
def db_connection():
    """返回数据库连接"""
    # fixture 可以做 setup 和 teardown
    # WHY: 测试间共享或隔离资源，fixture 比 setUp 更灵活
    conn = sqlite3.connect(":memory:")
    conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)")
    yield conn  # 真实 pytest 用 yield 分隔 setup/teardown
    conn.close()


@pt.fixture
def sample_users():
    """返回测试用户数据"""
    return [
        {"id": 1, "name": "张三"},
        {"id": 2, "name": "李四"},
    ]


def test_insert_user(db_connection, sample_users):
    user = sample_users[0]
    db_connection.execute("INSERT INTO users VALUES (?, ?)", (user["id"], user["name"]))
    db_connection.commit()
    count = db_connection.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    assert count == 1


def test_select_empty(db_connection):
    count = db_connection.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    assert count == 0


pt.run_test(test_insert_user)
pt.run_test(test_select_empty)

\`\`\`

## 三、fixture 作用域

\`\`\`python
# pytest fixture 有四种作用域：function / class / module / session
# function: 每个测试函数都重新创建（默认）
# class:    每个测试类创建一次
# module:   每个模块创建一次
# session:  整个测试会话只创建一次
#
# WHY: 昂贵的资源用大作用域，避免重复初始化拖慢测试

import time

# 模拟不同作用域
class FixtureDemo:
    _cache = {}

    @staticmethod
    def function_scope():
        # 每次都新建
        return {"time": time.time()}

    @classmethod
    def session_scope(cls):
        # 首次创建后缓存
        # WHY: session 级 fixture 让 Web 服务器等只启动一次
        if "session" not in cls._cache:
            cls._cache["session"] = {"time": time.time()}
        return cls._cache["session"]


# 演示：session scope 复用
r1 = FixtureDemo.session_scope()
r2 = FixtureDemo.session_scope()
print(f"session scope 复用: {r1 is r2}")

r3 = FixtureDemo.function_scope()
import time as _t; _t.sleep(0.01)
r4 = FixtureDemo.function_scope()
print(f"function scope 独立: {r3 is not r4}")

\`\`\`

## 四、parametrize 参数化测试

pytest 的 \`@parametrize\` 让一个测试覆盖多种输入。

\`\`\`python
# 模拟 parametrize
def parametrize(argnames, argvalues):
    """简化版参数化装饰器"""
    def decorator(func):
        func._parametrize = (argnames, argvalues)
        return func
    return decorator


def run_parametrized(func):
    names = func._parametrize[0].split(",")
    values = func._parametrize[1]
    for i, value_set in enumerate(values):
        kwargs = dict(zip(names, value_set))
        try:
            func(**kwargs)
            print(f"  ✓ {func.__name__}[{i}] {kwargs}")
        except AssertionError as e:
            print(f"  ✗ {func.__name__}[{i}] {kwargs}: {e}")


def is_even(n: int) -> bool:
    return n % 2 == 0


@parametrize("n,expected", [
    (2, True),
    (3, False),
    (0, True),
    (-2, True),
    (7, False),
])
def test_is_even(n, expected):
    assert is_even(n) == expected


run_parametrized(test_is_even)

\`\`\`

## 五、mark 标记与跳过

\`\`\`python
# pytest.mark.skip / xfail 标记测试
import sys


class Marks:
    skip_reasons = []
    xfail_reasons = []

    @staticmethod
    def skip(reason=""):
        def decorator(func):
            func._skip = reason
            return func
        return decorator

    @staticmethod
    def skipif(condition, reason=""):
        def decorator(func):
            if condition:
                func._skip = reason
            return func
        return decorator

    @staticmethod
    def xfail(reason=""):
        def decorator(func):
            func._xfail = reason
            return func
        return decorator


mark = Marks()


@mark.skip("功能未实现")
def test_future_feature():
    assert False


@mark.skipif(sys.platform == "win32", reason="仅 Unix")
def test_unix_only():
    assert True


@mark.xfail("已知 bug #123")
def test_known_bug():
    # 预期失败：x 表示预期失败（通过），X 表示意外通过
    # WHY: 标记已知 bug，避免 CI 误报
    assert 1 == 2


def run_marked(func):
    if hasattr(func, "_skip"):
        print(f"  s {func.__name__} (skipped: {func._skip})")
        return
    try:
        if hasattr(func, "_xfail"):
            try:
                func()
                print(f"  X {func.__name__} (unexpected pass)")
            except AssertionError:
                print(f"  x {func.__name__} (expected fail)")
        else:
            func()
            print(f"  ✓ {func.__name__}")
    except AssertionError as e:
        print(f"  ✗ {func.__name__}: {e}")


run_marked(test_future_feature)
run_marked(test_unix_only)
run_marked(test_known_bug)

\`\`\`

## 六、monkeypatch 临时替换

pytest 的 \`monkeypatch\` fixture 可以安全地临时替换属性、环境变量、字典项。

\`\`\`python
import os


class MonkeyPatch:
    """模拟 pytest monkeypatch"""

    def __init__(self):
        self._undo = []

    def setattr(self, target, name, value):
        old = getattr(target, name)
        setattr(target, name, value)
        # WHY: 记录原始值，测试后恢复，避免污染其他测试
        self._undo.append(lambda: setattr(target, name, old))

    def setenv(self, name, value):
        old = os.environ.get(name)
        os.environ[name] = value
        self._undo.append(
            lambda: os.environ.pop(name) if old is None else os.environ.__setitem__(name, old)
        )

    def delenv(self, name):
        if name in os.environ:
            old = os.environ[name]
            del os.environ[name]
            self._undo.append(lambda: os.environ.__setitem__(name, old))

    def undo(self):
        for undo_fn in reversed(self._undo):
            undo_fn()
        self._undo.clear()


# 测试示例
import math


def test_with_monkeypatch():
    mp = MonkeyPatch()
    try:
        # 临时替换 math.pi
        mp.setattr(math, "pi", 3.0)
        assert math.pi == 3.0
        # 临时设置环境变量
        mp.setenv("TEST_MODE", "1")
        assert os.environ["TEST_MODE"] == "1"
        print("  ✓ monkeypatch 工作")
    finally:
        mp.undo()
    # 恢复后
    assert math.pi != 3.0
    assert "TEST_MODE" not in os.environ
    print("  ✓ monkeypatch 已恢复")


test_with_monkeypatch()

\`\`\`

## 七、tmp_path 临时目录

\`\`\`python
import tempfile
import os
from pathlib import Path


def test_file_operations(tmp_path: Path):
    """pytest 自动提供 tmp_path 临时目录"""
    # WHY: 文件测试不应污染项目目录，tmp_path 每个测试独立
    file_path = tmp_path / "test.txt"
    file_path.write_text("hello", encoding="utf-8")
    assert file_path.read_text() == "hello"
    assert file_path.exists()


# 用标准库模拟
def with_tmp_path(func):
    def wrapper():
        with tempfile.TemporaryDirectory() as d:
            func(Path(d))
    return wrapper


@with_tmp_path
def _test():
    pass  # 占位

# 运行
def test_run():
    tmp = Path(tempfile.mkdtemp())
    try:
        test_file_operations(tmp)
        print("  ✓ tmp_path 测试通过")
    finally:
        import shutil
        shutil.rmtree(tmp, ignore_errors=True)


test_run()

\`\`\`

## 八、capsys 捕获输出

\`\`\`python
import io
import sys
from contextlib import redirect_stdout, redirect_stderr


def function_with_output():
    print("标准输出")
    print("错误输出", file=sys.stderr)


def test_capture_stdout():
    # 模拟 pytest 的 capsys
    # WHY: 测试 print 输出而不污染控制台
    stdout = io.StringIO()
    stderr = io.StringIO()
    with redirect_stdout(stdout), redirect_stderr(stderr):
        function_with_output()
    assert "标准输出" in stdout.getvalue()
    assert "错误输出" in stderr.getvalue()
    print("  ✓ capsys 测试通过")


test_capture_stdout()

\`\`\`

## 九、测试组织与命名

\`\`\`python
# pytest 推荐的项目结构
print("""
my_project/
├── pyproject.toml
├── src/
│   └── mypackage/
│       ├── __init__.py
│       ├── calculator.py
│       └── utils.py
└── tests/
    ├── __init__.py
    ├── conftest.py          # 共享 fixture
    ├── unit/
    │   ├── test_calculator.py
    │   └── test_utils.py
    └── integration/
        └── test_api.py
""")

# 命名约定
# 测试文件：test_*.py 或 *_test.py
# 测试类：Test*
# 测试方法：test_*
# WHY: 严格命名让 pytest 能自动发现，无需配置

# conftest.py 中的 fixture 自动对所有测试可见
# 不同层级的 conftest.py 作用范围不同

\`\`\`

## 十、覆盖率概念

\`\`\`python
# pytest 配合 coverage.py 测量测试覆盖率
# pip install pytest-cov
# 运行：pytest --cov=mypackage --cov-report=html

# 概念演示：手动统计哪些行被执行
import dis


def target_function(x: int) -> str:
    if x > 0:
        return "正数"
    elif x < 0:
        return "负数"
    else:
        return "零"


# 测试覆盖
def test_positive():
    assert target_function(1) == "正数"


def test_negative():
    assert target_function(-1) == "负数"


# 注意：上面两个测试没有覆盖 x == 0 分支
# WHY: 覆盖率工具能指出未测试的分支，但不保证测试质量
# 100% 覆盖率不等于 100% 正确，仍需检查断言质量

test_positive()
test_negative()
print("已覆盖 2/3 分支，缺少 x=0 分支")

\`\`\`

## 十一、实战：完整测试套件

\`\`\`python
# 一个完整的待测模块 + 测试
from dataclasses import dataclass
from typing import Optional


@dataclass
class Temperature:
    celsius: float

    @property
    def fahrenheit(self) -> float:
        return self.celsius * 9 / 5 + 32

    @property
    def kelvin(self) -> float:
        return self.celsius + 273.15

    @classmethod
    def from_fahrenheit(cls, f: float) -> "Temperature":
        return cls((f - 32) * 5 / 9)

    def is_freezing(self) -> bool:
        return self.celsius <= 0


# pytest 风格测试
def test_celsius_to_fahrenheit():
    t = Temperature(0)
    assert t.fahrenheit == 32
    assert Temperature(100).fahrenheit == 212


def test_celsius_to_kelvin():
    assert Temperature(0).kelvin == 273.15
    assert abs(Temperature(-273.15).kelvin) < 1e-9


def test_from_fahrenheit():
    t = Temperature.from_fahrenheit(32)
    assert t.celsius == 0
    t2 = Temperature.from_fahrenheit(212)
    assert abs(t2.celsius - 100) < 1e-9


def test_is_freezing():
    assert Temperature(0).is_freezing()
    assert Temperature(-10).is_freezing()
    assert not Temperature(1).is_freezing()


# 运行所有测试
tests = [
    test_celsius_to_fahrenheit,
    test_celsius_to_kelvin,
    test_from_fahrenheit,
    test_is_freezing,
]

for t in tests:
    try:
        t()
        print(f"  ✓ {t.__name__}")
    except AssertionError as e:
        print(f"  ✗ {t.__name__}: {e}")

\`\`\`

## 小结

本章介绍了 pytest 风格测试：

- **plain assert**：比 unittest 断言更简洁
- **fixture**：强大的测试夹具系统
- **作用域**：function/class/module/session
- **parametrize**：参数化测试
- **mark**：skip/xfail 标记
- **monkeypatch**：安全替换
- **tmp_path**：临时目录
- **capsys**：捕获输出
- **命名约定**：test_*.py / Test* / test_*
- **覆盖率**：衡量但不迷信

下一章我们深入学习 mock 与高级测试技巧。
`
  },
  {
    id: "py10-ch73",
    group: "第十五部分 测试与工程化",
    icon: "🎭",
    title: "第七十三章 mock 与测试技巧",
    content: `

# 第七十三章 mock 与测试技巧

## 一、为什么需要 mock

测试中常遇到"外部依赖"问题：数据库、网络 API、文件系统、时间。直接测试这些依赖会：

- 速度慢（网络请求）
- 不稳定（外部服务挂了测试就挂）
- 难复现（依赖特定时间/状态）
- 副作用（测试数据污染生产）

mock 用"假对象"替代真实依赖，让测试快速、稳定、可复现。

\`\`\`python
from unittest.mock import Mock


# 创建 Mock 对象
m = Mock()
# 任何属性访问都返回 Mock（链式）
# WHY: Mock 自动创建属性，避免手动定义一堆方法
print(type(m.foo))           # <class 'unittest.mock.Mock'>
print(type(m.foo.bar))       # 也是 Mock

# 任何调用都返回 Mock
result = m.some_method(1, 2, 3)
print(result)                # Mock 对象

# 检查调用情况
print(m.some_method.called)  # True
print(m.some_method.call_count)  # 1
print(m.some_method.call_args)  # call(1, 2, 3)

\`\`\`

## 二、Mock 配置返回值

\`\`\`python
from unittest.mock import Mock


# return_value 设置固定返回值
m = Mock()
m.get_user.return_value = {"id": 1, "name": "张三"}
# WHY: 大部分测试只需要固定返回值，简单清晰
print(m.get_user(1))  # {"id": 1, "name": "张三"}

# side_effect 可以是：
# 1. 函数：返回函数执行结果
# 2. 异常：抛出该异常
# 3. 可迭代对象：按顺序返回

# 1. 函数
import random
m.random_int.side_effect = lambda: random.randint(1, 100)
print(m.random_int())

# 2. 异常
m.failing.side_effect = ValueError("故意失败")
try:
    m.failing()
except ValueError as e:
    print(f"捕获: {e}")

# 3. 可迭代对象：每次调用返回下一个
# WHY: 模拟"第一次成功，第二次失败"等场景
m.sequence.side_effect = [1, 2, 3]
print(m.sequence())  # 1
print(m.sequence())  # 2
print(m.sequence())  # 3
try:
    m.sequence()  # StopIteration
except StopIteration:
    print("序列耗尽")

\`\`\`

## 三、断言调用

\`\`\`python
from unittest.mock import Mock


m = Mock()
m.send_email("alice@example.com", subject="Hello")
m.send_email("bob@example.com", subject="Hi")
m.save()

# 各种断言
m.send_email.assert_called()              # 至少调用过
m.send_email.assert_called_with("bob@example.com", subject="Hi")  # 最后一次调用
# WHY: assert_called_with 检查最近一次，不检查全部历史
m.send_email.assert_called_once_with(...)  # 仅调用一次且参数匹配（这里会失败）

m.save.assert_called_once()               # 仅调用一次
m.send_email.call_count == 2

# assert_any_call 检查历史中是否有某次调用
m.send_email.assert_any_call("alice@example.com", subject="Hello")

# 检查调用参数
print(m.send_email.call_args_list)
# [call('alice@example.com', subject='Hello'), call('bob@example.com', subject='Hi')]

\`\`\`

## 四、patch 替换对象

\`patch\` 是 mock 的核心，临时替换目标对象，测试结束自动恢复。

\`\`\`python
from unittest.mock import patch, Mock
import os


# patch 作为上下文管理器
with patch("os.getcwd") as mock_getcwd:
    mock_getcwd.return_value = "/fake/path"
    # WHY: patch 期间 os.getcwd 被替换，离开 with 自动恢复
    print(os.getcwd())  # /fake/path

# 恢复后
print("恢复:", os.getcwd())


# patch 作为装饰器
@patch("os.getcwd")
def test_something(mock_getcwd):
    mock_getcwd.return_value = "/mocked"
    assert os.getcwd() == "/mocked"
    print("装饰器 patch 工作")


test_something()


# patch.object 替换对象的属性
class Config:
    DEBUG = False


with patch.object(Config, "DEBUG", True):
    print(f"patched: {Config.DEBUG}")  # True
print(f"restored: {Config.DEBUG}")     # False

\`\`\`

## 五、patch 实战：模拟 HTTP

\`\`\`python
from unittest.mock import patch, Mock


# 待测代码：调用外部 API
def get_user_info(user_id: int) -> dict:
    """从 API 获取用户信息"""
    import urllib.request
    import json
    url = f"https://api.example.com/users/{user_id}"
    with urllib.request.urlopen(url, timeout=5) as resp:
        return json.loads(resp.read())


# 测试：用 patch 替换 urlopen
@patch("urllib.request.urlopen")
def test_get_user_info(mock_urlopen):
    # 构造假响应
    mock_resp = Mock()
    mock_resp.read.return_value = b'{"id": 42, "name": "张三"}'
    mock_resp.__enter__ = Mock(return_value=mock_resp)
    mock_resp.__exit__ = Mock(return_value=False)
    mock_urlopen.return_value = mock_resp

    # WHY: patch urllib.request.urlopen 后，不会真正发请求
    result = get_user_info(42)
    assert result == {"id": 42, "name": "张三"}
    mock_urlopen.assert_called_once()
    # 检查 URL
    call_args = mock_urlopen.call_args
    assert "users/42" in str(call_args)
    print("  ✓ HTTP mock 测试通过")


test_get_user_info()

\`\`\`

## 六、patch 实战：模拟文件

\`\`\`python
from unittest.mock import patch, mock_open, Mock
import builtins


# 待测代码：读取配置文件
def read_config(path: str) -> dict:
    config = {}
    with open(path, "r") as f:
        for line in f:
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                key, value = line.split("=", 1)
                config[key.strip()] = value.strip()
    return config


# 用 mock_open 模拟文件
# WHY: 测试不应真正读写文件，mock_open 让 open 返回内存文件
def test_read_config():
    fake_content = """# 配置
host = localhost
port = 8080
debug = true
"""
    with patch("builtins.open", mock_open(read_data=fake_content)):
        config = read_config("/fake/config.ini")
        assert config["host"] == "localhost"
        assert config["port"] == "8080"
        assert config["debug"] == "true"
        print("  ✓ 文件 mock 测试通过")


test_read_config()

\`\`\`

## 七、patch.multiple 批量替换

\`\`\`python
from unittest.mock import patch, Mock


def business_logic():
    """依赖多个外部资源的业务"""
    import os
    import time
    env = os.environ.get("MODE", "prod")
    now = time.time()
    return f"{env}@{now}"


# 一次 patch 多个
# WHY: 多依赖场景用 patch.multiple 更简洁
with patch.multiple(
    "os",
    environ={"MODE": "test"},
    getcwd=lambda: "/fake",
):
    with patch("time.time", return_value=1000.0):
        result = business_logic()
        print(result)  # test@1000.0

\`\`\`

## 八、MagicMock 支持魔术方法

\`\`\`python
from unittest.mock import MagicMock


# Mock 不支持魔术方法，MagicMock 才行
m = MagicMock()
# WHY: 需要测试 __len__、__iter__、__getitem__ 等魔术方法时必须用 MagicMock
m.__len__.return_value = 5
print(len(m))  # 5

m.__iter__.return_value = iter([1, 2, 3])
print(list(m))  # [1, 2, 3]

m.__getitem__.return_value = "value"
print(m["any_key"])  # value

m.__contains__.return_value = True
print("x" in m)  # True

# 模拟上下文管理器
m.__enter__.return_value = "resource"
m.__exit__.return_value = False
with m as resource:
    print(resource)  # resource

\`\`\`

## 九、PropertyMock 模拟属性

\`\`\`python
from unittest.mock import patch, PropertyMock


class AppConfig:
    @property
    def version(self) -> str:
        # 真实场景：从文件读取
        return "1.0.0"


def use_config():
    return f"Running v{AppConfig().version}"


# property 不能直接 patch，必须用 PropertyMock
# WHY: property 是描述符，普通 patch 无效
with patch.object(AppConfig, "version", new_callable=PropertyMock) as mock_ver:
    mock_ver.return_value = "9.9.9"
    print(use_config())  # Running v9.9.9

\`\`\`

## 十、side_effect 函数式 mock

\`\`\`python
from unittest.mock import Mock


# 用 side_effect 实现复杂逻辑
def make_db_mock():
    """模拟一个内存数据库"""
    data = {}
    m = Mock()

    def get(key):
        return data.get(key)

    def set(key, value):
        data[key] = value

    def delete(key):
        data.pop(key, None)

    m.get.side_effect = get
    m.set.side_effect = set
    m.delete.side_effect = delete
    # WHY: side_effect 接受函数，让 mock 有真实状态，能测复杂流程
    return m


db = make_db_mock()
db.set("name", "张三")
assert db.get("name") == "张三"
assert db.get("missing") is None
db.delete("name")
assert db.get("name") is None
print("  ✓ 状态化 mock 测试通过")

\`\`\`

## 十一、测试异常

\`\`\`python
from unittest.mock import patch, Mock
import unittest


def parse_int(s: str) -> int:
    if not s.lstrip("-").isdigit():
        raise ValueError(f"无效数字: {s}")
    return int(s)


class TestParseInt(unittest.TestCase):
    def test_valid(self):
        self.assertEqual(parse_int("42"), 42)
        self.assertEqual(parse_int("-1"), -1)

    def test_invalid(self):
        # 多种异常输入
        # WHY: 异常测试要覆盖各种错误输入，确保鲁棒
        for bad in ["abc", "", "1.5", "12a"]:
            with self.subTest(bad=bad):
                with self.assertRaises(ValueError):
                    parse_int(bad)

    def test_exception_message(self):
        with self.assertRaises(ValueError) as ctx:
            parse_int("xyz")
        self.assertIn("xyz", str(ctx.exception))


unittest.main(argv=[''], exit=False, verbosity=2)

\`\`\`

## 十二、spec 限制 mock 接口

\`\`\`python
from unittest.mock import Mock


class RealService:
    def get(self, id: int) -> dict: ...
    def post(self, data: dict) -> int: ...


# spec=RealService 限制 mock 只能有 RealService 的属性
# WHY: 防止测试拼错方法名（typo），导致假绿
m = Mock(spec=RealService)
m.get(1)  # OK
try:
    m.past(1)  # AttributeError: past 不在 spec 中
except AttributeError as e:
    print(f"spec 拒绝未知方法: {e}")

# spec_set 更严格：连设置属性都不行
m2 = Mock(spec_set=RealService)

\`\`\`

## 十三、实战：完整测试带 mock 的服务

\`\`\`python
from unittest.mock import patch, Mock
from dataclasses import dataclass


@dataclass
class User:
    id: int
    name: str
    email: str


class UserRepository:
    """用户仓库，依赖数据库"""

    def __init__(self, db):
        self.db = db

    def find(self, user_id: int) -> User | None:
        row = self.db.execute(
            "SELECT * FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        if row is None:
            return None
        return User(id=row["id"], name=row["name"], email=row["email"])

    def save(self, user: User) -> int:
        cur = self.db.execute(
            "INSERT INTO users (name, email) VALUES (?, ?)",
            (user.name, user.email),
        )
        self.db.commit()
        return cur.lastrowid


class UserService:
    """用户服务，依赖仓库和邮件"""

    def __init__(self, repo: UserRepository, mailer):
        self.repo = repo
        self.mailer = mailer

    def register(self, name: str, email: str) -> User:
        user_id = self.repo.save(User(id=0, name=name, email=email))
        # 发送欢迎邮件
        self.mailer.send(email, f"欢迎 {name}!")
        return self.repo.find(user_id)


# 完整测试
def test_register():
    # 创建 mock 依赖
    mock_db = Mock()
    # save 返回 lastrowid
    mock_cursor = Mock()
    mock_cursor.lastrowid = 42
    mock_db.execute.return_value = mock_cursor

    # find 返回的 fetchone
    mock_db.execute.return_value.fetchone.return_value = {
        "id": 42, "name": "张三", "email": "z@x.com"
    }

    mock_mailer = Mock()

    repo = UserRepository(mock_db)
    service = UserService(repo, mock_mailer)

    # 执行
    user = service.register("张三", "z@x.com")

    # 验证
    assert user.id == 42
    # 验证邮件发送
    # WHY: 测试不仅要验证结果，还要验证副作用是否发生
    mock_mailer.send.assert_called_once_with("z@x.com", "欢迎 张三!")
    print("  ✓ 完整服务测试通过")


test_register()

\`\`\`

## 十四、mock 常见陷阱

\`\`\`python
from unittest.mock import patch, Mock


# 陷阱1：patch 错位置
# 错误：patch 源模块
# 正确：patch 使用方模块
# WHY: import 后符号绑定在使用模块，必须 patch 那个引用

# 例：模块 A from B import func，要在 A 中 mock func
# 错：patch("B.func")
# 对：patch("A.func")


# 陷阱2：忘记 return_value，导致链式调用返回 Mock
m = Mock()
# m.method().value  # 返回 Mock，可能让测试假绿
m.method.return_value.value = 42  # 显式设置
print(m.method().value)


# 陷阱3：过度 mock，连简单代码也 mock
def add(a, b):
    return a + b

# 不要 mock add，直接测：
assert add(1, 2) == 3
# WHY: 简单函数直接测，mock 反而增加维护成本


# 陷阱4：mock 验证不充分
m = Mock()
m.method(1, 2)
# m.method.assert_called()  # 只检查调用过，不检查参数
m.method.assert_called_with(1, 2)  # 检查参数，更严格

\`\`\`

## 小结

本章介绍了 mock 与测试技巧：

- **Mock/MagicMock**：基础 mock 对象
- **return_value / side_effect**：配置返回值
- **断言调用**：assert_called_with 等
- **patch**：临时替换对象
- **mock_open**：模拟文件
- **patch HTTP**：模拟网络请求
- **PropertyMock**：模拟属性
- **spec**：限制 mock 接口
- **常见陷阱**：patch 位置、过度 mock

mock 是单元测试的核心技能，掌握后能测试任何依赖外部的代码。下一章我们学习项目结构与打包。
`
  },
  {
    id: "py10-ch74",
    group: "第十五部分 测试与工程化",
    icon: "📦",
    title: "第七十四章 项目结构与打包",
    content: `

# 第七十四章 项目结构与打包

## 一、现代 Python 项目结构

一个规范的 Python 项目应该有清晰的结构，便于维护、测试、发布。

\`\`\`python
# 推荐的 src layout
print("""
my_project/
├── pyproject.toml          # 项目元数据与构建配置（核心）
├── README.md
├── LICENSE
├── .gitignore
├── src/
│   └── my_package/
│       ├── __init__.py
│       ├── core.py
│       ├── utils.py
│       └── cli.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── unit/
│   │   ├── test_core.py
│   │   └── test_utils.py
│   └── integration/
│       └── test_cli.py
├── docs/
│   └── index.md
└── .github/
    └── workflows/
        └── ci.yml
""")

# 为什么用 src/ layout？
# WHY: src/ 防止测试时意外 import 到源码目录而非安装版本
# 没有 src/ 时，pytest 在项目根目录运行会直接 import 源码，
# 而不是通过 pip install -e . 安装的版本，可能掩盖打包错误

\`\`\`

## 二、pyproject.toml 详解

\`pyproject.toml\` 是 PEP 518/621 引入的现代项目配置标准，替代 \`setup.py\`。

\`\`\`python
# pyproject.toml 示例（演示用，不是 Python 代码）
toml_example = """
[build-system]
# 构建后端：setuptools / hatchling / flit / poetry
# WHY: build-system 声明如何把项目打包成 wheel/sdist
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "my-package"
version = "1.0.0"
description = "一个示例 Python 包"
readme = "README.md"
requires-python = ">=3.10"
license = {text = "MIT"}
authors = [
    {name = "张三", email = "zhangsan@example.com"}
]
keywords = ["example", "demo"]
classifiers = [
    "Development Status :: 4 - Beta",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.12",
    "License :: OSI Approved :: MIT License",
    "Operating System :: OS Independent",
]
# 运行时依赖
dependencies = [
    "requests>=2.28",
    "click>=8.0",
]

[project.optional-dependencies]
# 可选依赖（extras）
dev = [
    "pytest>=7.0",
    "pytest-cov",
    "mypy",
    "ruff",
]
docs = [
    "mkdocs",
    "mkdocs-material",
]

[project.scripts]
# CLI 入口点：安装后可直接运行 mycli 命令
mycli = "my_package.cli:main"

[project.urls]
Homepage = "https://github.com/user/my-package"
Documentation = "https://my-package.readthedocs.io"
Repository = "https://github.com/user/my-package"
"Bug Tracker" = "https://github.com/user/my-package/issues"

[tool.setuptools.packages.find]
where = ["src"]

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-v --cov=my_package"

[tool.mypy]
strict = true

[tool.ruff]
line-length = 100
target-version = "py312"
"""
print(toml_example)

\`\`\`

## 三、setup.cfg 概念

\`setup.cfg\` 是较老的配置格式，部分项目仍在用。

\`\`\`python
# setup.cfg 示例（INI 格式）
setup_cfg = """
[metadata]
name = my-package
version = 1.0.0
description = 示例包

[options]
package_dir =
    = src
packages = find:
python_requires = >=3.10
install_requires =
    requests>=2.28
    click>=8.0

[options.packages.find]
where = src

[options.entry_points]
console_scripts =
    mycli = my_package.cli:main
"""
print(setup_cfg)

# 现代项目推荐 pyproject.toml，setup.cfg 主要用于：
# - 兼容老项目
# - 工具配置（如 flake8 不支持 pyproject.toml 时）
# WHY: pyproject.toml 是统一配置文件，能减少配置文件数量

\`\`\`

## 四、entry_points CLI 入口

\`\`\`python
# entry_points 让 pip install 后能在命令行直接运行
# 例：mycli = "my_package.cli:main"

# my_package/cli.py 内容
def main():
    """CLI 入口函数"""
    import argparse
    parser = argparse.ArgumentParser(prog="mycli", description="我的工具")
    parser.add_argument("name", help="你的名字")
    parser.add_argument("-g", "--greet", default="Hello", help="问候语")
    args = parser.parse_args()
    print(f"{args.greet}, {args.name}!")


if __name__ == "__main__":
    # 直接运行 python cli.py 也能工作
    # WHY: __name__ 守卫让模块既能被 import 又能直接运行
    import sys
    sys.argv = ["mycli", "World", "-g", "Hi"]
    main()

\`\`\`

## 五、MANIFEST.in 包含额外文件

\`\`\`python
# MANIFEST.in 控制源码分发包(sdist)包含哪些额外文件
manifest_example = """
# 包含 README 和 LICENSE
include README.md
include LICENSE

# 递归包含所有 .txt 文件
recursive-include docs *.txt

# 排除测试目录
recursive-exclude tests *

# 排除 .pyc 文件
global-exclude *.pyc
"""
print(manifest_example)

# WHY: 默认 sdist 只包含 .py 文件，数据文件、文档等需要 MANIFEST.in 显式声明

\`\`\`

## 六、构建分发包

\`\`\`python
# 构建命令（演示，不在沙箱执行）
print("""
# 安装构建工具
pip install build

# 构建 wheel 和 sdist
python -m build

# 产物在 dist/ 目录：
#   my_package-1.0.0-py3-none-any.whl  # wheel（二进制包）
#   my-package-1.0.0.tar.gz            # sdist（源码包）

# wheel：预编译，安装快，平台特定（标记 none-any 表示纯 Python）
# sdist：源码包，安装时编译，更通用
# WHY: PyPI 同时上传 wheel 和 sdist，pip 优先用 wheel
""")

# 手动构造一个简单的包结构演示
import os
import tempfile


def create_demo_project(root: str):
    """在 root 目录创建一个示例项目"""
    os.makedirs(os.path.join(root, "src", "demo_pkg"), exist_ok=True)
    # __init__.py
    with open(os.path.join(root, "src", "demo_pkg", "__init__.py"), "w") as f:
        f.write('"""示例包"""\\n__version__ = "1.0.0"\\n')
    # 核心模块
    with open(os.path.join(root, "src", "demo_pkg", "core.py"), "w") as f:
        f.write('def greet(name):\\n    return f"Hello, {name}!"\\n')
    # pyproject.toml
    with open(os.path.join(root, "pyproject.toml"), "w") as f:
        f.write("""[build-system]
requires = ["setuptools>=61"]
build-backend = "setuptools.build_meta"

[project]
name = "demo-pkg"
version = "1.0.0"
description = "示例包"

[tool.setuptools.packages.find]
where = ["src"]
""")


with tempfile.TemporaryDirectory() as d:
    create_demo_project(d)
    print(f"已在 {d} 创建示例项目")
    for root, dirs, files in os.walk(d):
        for f in files:
            path = os.path.join(root, f)
            print(f"  {os.path.relpath(path, d)}")

\`\`\`

## 七、pip install -e 开发模式

\`\`\`python
print("""
# 开发模式安装（editable install）
pip install -e .

# 效果：
# 1. 创建一个 .egg-link 或 .pth 文件指向源码目录
# 2. import demo_pkg 直接加载 src/ 下的代码
# 3. 修改源码立即生效，无需重新安装
# WHY: 开发时频繁改代码，editable 避免每次 pip install
""")

# 验证当前环境能 import 标准库（演示 import 机制）
import json
print(f"json 模块路径: {json.__file__}")
print(f"json 模块 __name__: {json.__name__}")

\`\`\`

## 八、版本管理

\`\`\`python
# 版本号规范：语义化版本 SemVer
# MAJOR.MINOR.PATCH
# MAJOR: 不兼容的 API 修改
# MINOR: 向下兼容的功能新增
# PATCH: 向下兼容的 bug 修复
# WHY: 用户根据版本号判断升级风险

# 在 __init__.py 中定义版本
demo_init = '''"""我的包"""

__version__ = "1.2.3"
__all__ = ["main"]
'''
print("示例 __init__.py:")
print(demo_init)

# pyproject.toml 动态读取版本
dynamic_version = """
[project]
dynamic = ["version"]

[tool.setuptools.dynamic]
version = {attr = "my_package.__version__"}
"""
print("动态版本配置:")
print(dynamic_version)
# WHY: 单一数据源，避免版本号在两处维护不一致

# 版本验证函数
def parse_version(v: str) -> tuple[int, int, int]:
    parts = v.split(".")
    if len(parts) != 3:
        raise ValueError(f"无效版本号: {v}")
    return tuple(int(p) for p in parts)


def compare_versions(v1: str, v2: str) -> int:
    """比较版本号：-1/0/1"""
    p1 = parse_version(v1)
    p2 = parse_version(v2)
    if p1 < p2:
        return -1
    elif p1 > p2:
        return 1
    return 0


assert compare_versions("1.0.0", "2.0.0") == -1
assert compare_versions("1.2.0", "1.2.0") == 0
assert compare_versions("1.10.0", "1.9.9") == 1
print("版本比较测试通过")

\`\`\`

## 九、实战：完整的可发布项目

\`\`\`python
import os
import tempfile


def create_complete_project(root: str) -> None:
    """创建一个完整的可发布项目"""
    # 目录结构
    src = os.path.join(root, "src", "textkit")
    tests = os.path.join(root, "tests")
    os.makedirs(src, exist_ok=True)
    os.makedirs(tests, exist_ok=True)

    # pyproject.toml
    pyproject = """[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "textkit"
version = "0.1.0"
description = "文本处理工具集"
readme = "README.md"
requires-python = ">=3.10"
license = {text = "MIT"}
authors = [{name = "Demo"}]
dependencies = []

[project.optional-dependencies]
dev = ["pytest>=7.0", "pytest-cov"]

[project.scripts]
textkit = "textkit.cli:main"

[tool.setuptools.packages.find]
where = ["src"]
"""
    with open(os.path.join(root, "pyproject.toml"), "w") as f:
        f.write(pyproject)

    # __init__.py
    with open(os.path.join(src, "__init__.py"), "w") as f:
        f.write('"""textkit - 文本处理工具"""\\n__version__ = "0.1.0"\\n')

    # core.py
    core = '''"""核心功能"""
from typing import Iterable


def word_count(text: str) -> int:
    """统计单词数"""
    return len(text.split())


def char_count(text: str, ignore_spaces: bool = True) -> int:
    """统计字符数"""
    if ignore_spaces:
        return len(text.replace(" ", ""))
    return len(text)


def unique_words(text: str) -> list[str]:
    """获取唯一单词列表"""
    return sorted(set(text.lower().split()))


def line_stats(text: str) -> dict:
    """行统计"""
    lines = text.splitlines()
    return {
        "total": len(lines),
        "non_empty": sum(1 for l in lines if l.strip()),
        "max_length": max((len(l) for l in lines), default=0),
    }
'''
    with open(os.path.join(src, "core.py"), "w") as f:
        f.write(core)

    # cli.py
    cli = '''"""命令行接口"""
import argparse
import sys
from . import core


def main():
    parser = argparse.ArgumentParser(prog="textkit", description="文本处理工具")
    sub = parser.add_subparsers(dest="command", required=True)

    p_count = sub.add_parser("words", help="统计单词数")
    p_count.add_argument("text", help="文本")

    p_chars = sub.add_parser("chars", help="统计字符数")
    p_chars.add_argument("text")
    p_chars.add_argument("--include-spaces", action="store_true")

    args = parser.parse_args()
    if args.command == "words":
        print(core.word_count(args.text))
    elif args.command == "chars":
        print(core.char_count(args.text, ignore_spaces=not args.include_spaces))


if __name__ == "__main__":
    main()
'''
    with open(os.path.join(src, "cli.py"), "w") as f:
        f.write(cli)

    # 测试文件
    test_core = '''"""core 模块测试"""
from textkit import core


def test_word_count():
    assert core.word_count("hello world") == 2
    assert core.word_count("") == 0


def test_char_count():
    assert core.char_count("hello") == 5
    assert core.char_count("a b c") == 3
    assert core.char_count("a b c", ignore_spaces=False) == 5


def test_unique_words():
    assert core.unique_words("a b a c b") == ["a", "b", "c"]
'''
    with open(os.path.join(tests, "test_core.py"), "w") as f:
        f.write(test_core)

    # README
    with open(os.path.join(root, "README.md"), "w") as f:
        f.write("# textkit\\n\\n文本处理工具集。\\n")

    print(f"项目已创建于 {root}")
    for root_, dirs, files in os.walk(root):
        for f in files:
            path = os.path.join(root_, f)
            print(f"  {os.path.relpath(path, root)}")


with tempfile.TemporaryDirectory() as d:
    create_complete_project(d)

\`\`\`

## 十、发布到 PyPI

\`\`\`python
print("""
# 发布流程（演示，不在沙箱执行）

# 1. 安装发布工具
pip install twine build

# 2. 清理旧构建
rm -rf dist/ build/ *.egg-info

# 3. 构建分发包
python -m build

# 4. 检查包
twine check dist/*

# 5. 上传到 TestPyPI（先测试）
twine upload --repository testpypi dist/*

# 6. 安装测试
pip install -i https://test.pypi.org/simple/ textkit

# 7. 正式发布到 PyPI
twine upload dist/*

# WHY: 先发 TestPyPI 验证，避免正式版出问题
""")

\`\`\`

## 十一、依赖管理

\`\`\`python
# 锁定依赖版本
print("""
# requirements.txt 风格
requests==2.31.0
click==8.1.7

# requirements-dev.txt
-r requirements.txt
pytest==7.4.0
pytest-cov==4.1.0
mypy==1.5.0

# 现代方式：用 pyproject.toml + lock 文件
# pip-tools: pip-compile 生成 requirements.txt
# poetry: pyproject.toml + poetry.lock
# uv: pyproject.toml + uv.lock
# WHY: lock 文件锁定完整依赖树，保证可复现构建
""")

# 依赖版本规范
specs = """
requests>=2.28       # 最低版本
requests>=2.28,<3.0  # 范围
requests~=2.31       # 兼容版本（>=2.31, <3.0）
requests==2.31.0     # 精确版本
requests!=2.30.0     # 排除某个版本
"""
print(specs)

\`\`\`

## 小结

本章介绍了项目结构与打包：

- **src layout**：避免测试时 import 混乱
- **pyproject.toml**：现代项目配置标准
- **setup.cfg**：旧格式，部分场景仍用
- **entry_points**：CLI 入口
- **MANIFEST.in**：sdist 额外文件
- **wheel/sdist**：构建分发包
- **pip install -e**：开发模式
- **版本管理**：语义化版本
- **发布流程**：TestPyPI → PyPI
- **依赖管理**：lock 文件保证可复现

下一章我们学习代码质量工具，让代码更专业。
`
  },
  {
    id: "py10-ch75",
    group: "第十五部分 测试与工程化",
    icon: "✨",
    title: "第七十五章 代码质量工具",
    content: `

# 第七十五章 代码质量工具

## 一、PEP 8 代码风格

PEP 8 是 Python 官方代码风格指南，规定了缩进、命名、行长等。遵循 PEP 8 让代码风格统一，团队协作更顺畅。

\`\`\`python
# PEP 8 关键规则演示

# 1. 缩进：4 个空格（不用 Tab）
def example():
    pass  # 4 空格缩进

# 2. 行长：不超过 79 字符（文档/注释 72）
# WHY: 79 字符让并排显示多个文件成为可能
long_line = "这是一个比较长的字符串，用来演示行长限制，PEP 8 建议每行不超过 79 个字符"

# 3. 命名规范
# WHY: 统一命名让代码自解释，读名字就知道用途
snake_case_var = "变量用 snake_case"
CONSTANT_VAR = "常量用 UPPER_SNAKE"
PascalCase = "类名用 PascalCase"
# 私有：前缀下划线
_private = "内部使用"
__name_mangled = "名称改写"

# 4. 导入顺序
# 标准库 → 第三方 → 本地
import os
import sys
import json

import requests  # 第三方

import mypackage  # 本地

# 5. 空行规则
# 顶层函数/类之间：2 个空行
# 方法之间：1 个空行
class MyClass:
    def method_one(self):
        pass

    def method_two(self):
        pass


def top_level_func():
    pass


# 6. 二元运算符前后空格
x = 1 + 2
y = x * 3 - 1

# 7. 逗号后空格
my_list = [1, 2, 3, 4]
my_dict = {"a": 1, "b": 2}

print("PEP 8 基本规则演示完成")

\`\`\`

## 二、black 自动格式化

black 是"无妥协"的代码格式化工具，自动把代码格式化成统一风格。

\`\`\`python
# black 不在标准库，但概念值得了解
# 安装：pip install black
# 运行：black my_file.py

# black 的特点：
# 1. 行长默认 88（可配置）
# 2. 自动处理引号、空格、换行
# 3. 不争论，强制统一

# black 前后对比示例
before = '''
def calculate(x,y,z):
    result=x+y*z
    if result>100:return result
    else:return 0
'''

after = '''
def calculate(x, y, z):
    result = x + y * z
    if result > 100:
        return result
    else:
        return 0
'''

print("black 格式化前:")
print(before)
print("black 格式化后:")
print(after)

# WHY: 团队用 black 后，code review 不再争论风格，专注逻辑

\`\`\`

## 三、flake8 / ruff 静态检查

\`\`\`python
# flake8: 经典 linter，检查 PEP 8 + 语法错误 + 复杂度
# ruff: 新一代 linter，用 Rust 写，极快，几乎替代 flake8

# 安装：
# pip install flake8
# pip install ruff

# 运行：
# flake8 my_file.py
# ruff check my_file.py

# 常见问题演示
print("""
flake8/ruff 检查的常见问题：

E501 - 行太长
def very_long_function_name(argument_one, argument_two, argument_three, argument_four):
    pass

F401 - 导入未使用
import os  # 没用到

F811 - 重复定义
def foo():
    pass
def foo():  # 重复
    pass

E711 - 与 None 比较用 == 而非 is
if x == None:  # 错
if x is None:  # 对

E722 - 裸 except
try:
    ...
except:  # 错，应该 except Exception:

W293 - 行尾空格
text = "   "  # 行尾有空白
""")

# WHY: 静态检查能在运行前发现大量低级错误，是 CI 必备

\`\`\`

## 四、mypy 类型检查

mypy 是 Python 的静态类型检查器，根据类型注解发现潜在 bug。

\`\`\`python
# 安装：pip install mypy
# 运行：mypy my_file.py

# 类型注解示例
from typing import Optional, Union, Any
from dataclasses import dataclass


@dataclass
class User:
    id: int
    name: str
    email: Optional[str] = None


def find_user(user_id: int) -> Optional[User]:
    """根据 ID 查找用户"""
    # 返回 User 或 None，类型明确
    # WHY: 类型注解让 IDE 提示更准，mypy 能检查调用方
    if user_id == 1:
        return User(id=1, name="张三")
    return None


def greet(user: User) -> str:
    return f"Hello, {user.name}"


# mypy 能发现的错误
def buggy() -> str:
    user = find_user(999)
    # user 可能是 None，下面这行 mypy 会报错
    # return greet(user)  # error: Argument 1 has type "Optional[User]"
    if user is not None:
        return greet(user)
    return "guest"


# 现代 Python 类型语法（3.10+）
def modern_syntax(x: int | str) -> int | None:
    # 用 | 替代 Union，更简洁
    # WHY: 3.10+ 原生支持，无需 import Union
    if isinstance(x, int):
        return x
    return None


# 字面量类型
from typing import Literal


def set_mode(mode: Literal["dev", "prod", "test"]) -> None:
    # mode 只能是这三个字符串之一
    # WHY: Literal 让 API 更安全，拼错字符串会被发现
    print(f"模式: {mode}")


set_mode("dev")
# set_mode("debug")  # mypy 会报错

print("类型检查演示完成")

\`\`\`

## 五、isort 导入排序

\`\`\`python
# isort 自动排序 import 语句
# 安装：pip install isort
# 运行：isort my_file.py

print("""
# isort 前后对比

# 前：
import sys
from os import path
import json
import os
import requests
from mypackage import core
from mypackage.utils import helper

# 后（isort 自动整理）：
import json
import os
import sys
from os import path

import requests

from mypackage import core
from mypackage.utils import helper

# 分三组：标准库、第三方、本地
# WHY: 统一导入顺序便于查找，避免合并冲突
""")

\`\`\`

## 六、pre-commit 预提交钩子

\`\`\`python
# pre-commit 在 git commit 前自动运行检查
# 安装：pip install pre-commit
# 配置：.pre-commit-config.yaml

precommit_config = """
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace    # 删除行尾空格
      - id: end-of-file-fixer      # 文件末尾换行
      - id: check-yaml             # 检查 YAML 语法
      - id: check-added-large-files  # 防止提交大文件

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.0
    hooks:
      - id: ruff
        args: [--fix]

  - repo: https://github.com/psf/black
    rev: 23.10.0
    hooks:
      - id: black

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.6.0
    hooks:
      - id: mypy
"""
print(precommit_config)

# 安装钩子：pre-commit install
# WHY: 在提交前拦截问题，避免坏代码进入仓库

\`\`\`

## 七、CI/CD 概念

CI（持续集成）/ CD（持续部署）让代码质量检查自动化。

\`\`\`python
print("""
CI/CD 流程：
1. 开发者 push 代码到 GitHub
2. GitHub Actions 触发 workflow
3. 自动运行测试、lint、类型检查
4. 全部通过才能合并 PR
5. 合并后自动部署（CD）

为什么需要 CI/CD？
- 避免人为遗漏检查
- 团队统一质量标准
- 早发现问题早修复
- 自动化部署降低风险
""")

\`\`\`

## 八、GitHub Actions 实战

\`\`\`python
# .github/workflows/ci.yml 示例
github_actions = """
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.10", "3.11", "3.12"]

    steps:
      - uses: actions/checkout@v4

      - name: 设置 Python
        uses: actions/setup-python@v4
        with:
          python-version: \${{ matrix.python-version }}

      - name: 安装依赖
        run: |
          python -m pip install --upgrade pip
          pip install -e ".[dev]"

      - name: Lint (ruff)
        run: ruff check .

      - name: 格式检查 (black)
        run: black --check .

      - name: 类型检查 (mypy)
        run: mypy src/

      - name: 测试
        run: pytest --cov=src --cov-report=xml

      - name: 上传覆盖率
        uses: codecov/codecov-action@v3
"""
print(github_actions)

# WHY: matrix 策略在多个 Python 版本上测试，保证兼容性

\`\`\`

## 九、ruff 配置实战

\`\`\`python
# pyproject.toml 中的 ruff 配置
ruff_config = """
[tool.ruff]
line-length = 100
target-version = "py312"
extend-select = [
    "E",    # pycodestyle errors
    "W",    # pycodestyle warnings
    "F",    # pyflakes
    "I",    # isort
    "B",    # bugbear
    "C4",   # comprehensions
    "UP",   # pyupgrade
    "N",    # pep8-naming
    "SIM",  # simplify
]
ignore = [
    "E501",  # 行长（由 black 处理）
]

[tool.ruff.format]
quote-style = "double"

[tool.ruff.per-file-ignores]
"tests/*" = ["S101"]  # 测试允许 assert
"""
print(ruff_config)

# ruff 一站式：lint + format + isort
# WHY: ruff 取代 flake8 + black + isort + pyupgrade 等多个工具，速度快 100 倍

\`\`\`

## 十、mypy 配置实战

\`\`\`python
mypy_config = """
[tool.mypy]
python_version = "3.12"
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_incomplete_defs = true
check_untyped_defs = true
disallow_untyped_decorators = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_no_return = true
warn_unreachable = true

[[tool.mypy.overrides]]
module = "tests.*"
disallow_untyped_defs = false  # 测试代码可以不写注解
"""
print(mypy_config)

# strict 模式开启所有严格检查
# WHY: 项目初期就开 strict，避免后期类型债务积累

\`\`\`

## 十一、综合实战：完整质量工具链

\`\`\`python
# 演示一个项目如何同时配置多个工具
import os
import tempfile


def create_quality_project(root: str):
    """创建带完整质量配置的项目"""
    os.makedirs(os.path.join(root, "src", "mypkg"), exist_ok=True)

    # pyproject.toml 集成所有工具配置
    pyproject = """[build-system]
requires = ["setuptools>=61"]
build-backend = "setuptools.build_meta"

[project]
name = "mypkg"
version = "0.1.0"
requires-python = ">=3.10"

[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP", "N"]

[tool.black]
line-length = 100
target-version = ["py312"]

[tool.mypy]
python_version = "3.12"
strict = true

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-v --cov=mypkg --cov-report=term-missing"
"""
    with open(os.path.join(root, "pyproject.toml"), "w") as f:
        f.write(pyproject)

    # 源码
    src_code = '''"""示例模块"""
from dataclasses import dataclass
from typing import Optional


@dataclass
class Item:
    name: str
    price: float
    quantity: int = 1

    @property
    def total(self) -> float:
        return self.price * self.quantity


def find_item(items: list[Item], name: str) -> Optional[Item]:
    """按名字查找商品"""
    for item in items:
        if item.name == name:
            return item
    return None
'''
    with open(os.path.join(root, "src", "mypkg", "__init__.py"), "w") as f:
        f.write(src_code)

    # pre-commit 配置
    precommit = """repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.0
    hooks:
      - id: ruff
      - id: ruff-format
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.6.0
    hooks:
      - id: mypy
"""
    os.makedirs(os.path.join(root, ".github", "workflows"), exist_ok=True)
    with open(os.path.join(root, ".pre-commit-config.yaml"), "w") as f:
        f.write(precommit)

    # GitHub Actions
    ci = """name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.10", "3.11", "3.12"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: \${{ matrix.python-version }}
      - run: pip install -e ".[dev]"
      - run: ruff check .
      - run: ruff format --check .
      - run: mypy src/
      - run: pytest
"""
    with open(os.path.join(root, ".github", "workflows", "ci.yml"), "w") as f:
        f.write(ci)

    print(f"质量工具链项目已创建于 {root}")
    for root_, dirs, files in os.walk(root):
        for f in files:
            path = os.path.join(root_, f)
            print(f"  {os.path.relpath(path, root)}")


with tempfile.TemporaryDirectory() as d:
    create_quality_project(d)

\`\`\`

## 十二、工具选型建议

\`\`\`python
print("""
现代 Python 项目工具推荐：

| 类别 | 推荐 | 备选 |
|------|------|------|
| 格式化 | black / ruff format | autopep8 |
| Lint | ruff | flake8 + pylint |
| 类型检查 | mypy | pyright |
| 导入排序 | ruff (含 isort) | isort |
| 测试 | pytest | unittest |
| 覆盖率 | pytest-cov | coverage |
| 安全检查 | bandit, pip-audit | safety |
| pre-commit | pre-commit | husky |
| 包管理 | uv / poetry | pip + venv |

最佳实践（2024+）：
- ruff 取代 flake8 + black + isort（一站式）
- uv 取代 pip + venv + pip-tools（极速）
- pyproject.toml 统一所有配置
- pre-commit + CI 双重保险
""")

# WHY: 工具不是越多越好，选少而精的组合，减少配置负担

\`\`\`

## 小结

本章介绍了代码质量工具：

- **PEP 8**：Python 代码风格指南
- **black**：无妥协格式化
- **ruff**：极速 lint + format
- **mypy**：静态类型检查
- **isort**：导入排序
- **pre-commit**：预提交钩子
- **CI/CD**：自动化质量保障
- **GitHub Actions**：CI 工作流
- **工具选型**：ruff + mypy + pytest + uv

至此，测试与工程化部分结束。良好的工程习惯让代码可维护、可协作、可扩展。下一部分我们进入标准库与综合实战。
`
  }
];

export { chapters };
