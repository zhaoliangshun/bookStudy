export const chapters = [
  {
    id: "py6-sqlite",
    group: "工程实战",
    icon: "🗄️",
    title: "SQLite数据库",
    content: `## SQLite数据库（sqlite3模块/connect/cursor/execute/CRUD/参数化查询/事务/with语句）

### SQLite 简介
SQLite 是一个轻量级的嵌入式数据库，整个数据库存储在一个文件中（或内存中）。Python 内置 \`sqlite3\` 模块，无需安装。

### 核心概念
- **connect(database)**：连接数据库，":memory:" 表示内存数据库
- **cursor()**：创建游标对象，用于执行SQL
- **execute(sql, params)**：执行单条SQL语句
- **executemany()**：批量执行
- **fetchone()/fetchall()/fetchmany()**：获取查询结果
- **commit()**：提交事务
- **rollback()**：回滚事务
- **close()**：关闭连接

### CRUD 操作
- **C**reate: INSERT INTO
- **R**ead: SELECT
- **U**pdate: UPDATE
- **D**elete: DELETE

### 参数化查询（重要！）
永远使用 \`?\` 占位符，**绝对不要**用字符串拼接SQL，防止SQL注入！

### with 语句（上下文管理器）
连接对象支持 with 语句，自动处理 commit/rollback：
- 正常退出自动 commit
- 发生异常自动 rollback`,
    code: `import sqlite3

print("=== SQLite 数据库演示 ===\\n")

print("--- 1. 连接内存数据库 ---")
conn = sqlite3.connect(":memory:")
cursor = conn.cursor()
print("已创建内存数据库连接")

print("\\n--- 2. 创建表 ---")
create_sql = """
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    email TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
"""
cursor.execute(create_sql)
print("users表创建成功")

print("\\n--- 3. INSERT 插入数据 ---")
# 使用 ? 占位符进行参数化查询，绝对不要用字符串拼接 SQL！
# 参数化查询会自动转义特殊字符，防止 SQL 注入攻击
cursor.execute(
    "INSERT INTO users (name, age, email) VALUES (?, ?, ?)",
    ("张三", 25, "z****@***********")
)
print(f"插入1条，lastrowid: {cursor.lastrowid}")

# executemany 批量插入，比循环 execute 高效
users_data = [
    ("李四", 30, "l***@***********"),
    ("王五", 28, "w*****@***********"),
    ("赵六", 35, "z******@***********"),
]
cursor.executemany(
    "INSERT INTO users (name, age, email) VALUES (?, ?, ?)",
    users_data
)
print(f"批量插入{cursor.rowcount}条数据")

# 写操作（INSERT/UPDATE/DELETE）后必须 commit 才真正保存
conn.commit()

print("\\n--- 4. SELECT 查询数据 ---")
cursor.execute("SELECT * FROM users")
all_users = cursor.fetchall()  # fetchall 取全部，fetchone 取一条
print("所有用户:")
for u in all_users:
    print(f"  id={u[0]}, name={u[1]}, age={u[2]}, email={u[3]}")

# WHERE 条件也用 ? 占位符，参数以元组传入（单元素要加逗号 (27,)）
cursor.execute("SELECT name, age FROM users WHERE age > ?", (27,))
print("\\n年龄大于27的用户:")
for row in cursor.fetchall():
    print(f"  {row[0]}, {row[1]}岁")

cursor.execute("SELECT COUNT(*) FROM users")
count = cursor.fetchone()[0]  # fetchone 返回元组，取第一列
print(f"\\n总用户数: {count}")

print("\\n--- 5. UPDATE 更新数据 ---")
cursor.execute(
    "UPDATE users SET age = ? WHERE name = ?",
    (26, "张三")
)
conn.commit()
cursor.execute("SELECT age FROM users WHERE name = ?", ("张三",))
print(f"张三更新后的年龄: {cursor.fetchone()[0]}")

print("\\n--- 6. DELETE 删除数据 ---")
cursor.execute("DELETE FROM users WHERE name = ?", ("赵六",))
conn.commit()
cursor.execute("SELECT COUNT(*) FROM users")
print(f"删除后用户数: {cursor.fetchone()[0]}")

print("\\n--- 7. with 语句自动事务管理 ---")
# with conn 是上下文管理器：正常退出自动 commit，异常自动 rollback
try:
    with conn:
        cursor.execute(
            "INSERT INTO users (name, age, email) VALUES (?, ?, ?)",
            ("测试用户", 99, "t**@******")
        )
        raise ValueError("模拟异常！事务应回滚")
except ValueError as e:
    print(f"捕获异常: {e}")

# 因为 with 块内抛了异常，INSERT 被回滚，测试用户不会保留
cursor.execute("SELECT COUNT(*) FROM users")
print(f"回滚后用户数（测试用户未插入）: {cursor.fetchone()[0]}")

print("\\n--- 8. Row 工厂（字典式访问）---")
# 设置 row_factory = sqlite3.Row 后，查询结果可按列名访问（像字典）
conn.row_factory = sqlite3.Row
cursor = conn.cursor()
cursor.execute("SELECT * FROM users WHERE name = ?", ("张三",))
row = cursor.fetchone()
print(f"按列名访问: name={row['name']}, age={row['age']}, email={row['email']}")
print(f"keys(): {row.keys()}")

conn.close()
print("\\n=== SQLite 总结 ===")
print("1. sqlite3是标准库，无需安装")
print("2. :memory: 内存数据库适合测试")
print("3. 永远用?占位符参数化查询，防SQL注入")
print("4. 修改后记得commit()，或用with自动管理")
print("5. Row工厂让查询结果像字典一样访问")
`,
  },
  {
    id: "py6-typing-basic",
    group: "工程实战",
    icon: "🏷️",
    title: "类型提示基础",
    content: `## 类型提示基础（int/str/float/bool/List/Dict/Tuple/Set/Optional/Union/函数注解）

### 为什么需要类型提示？
Python 是动态类型语言，变量类型灵活但容易出错。类型提示（Type Hints）从 Python 3.5 引入：
- **提高代码可读性**：一眼看出变量/函数期望什么类型
- **IDE 智能提示**：补全、重构、跳转更准确
- **静态检查**：mypy 等工具在运行前发现类型错误
- **自文档化**：减少文档注释

### 基本类型
- \`int\`, \`float\`, \`str\`, \`bool\`, \`bytes\`
- \`list\`, \`dict\`, \`tuple\`, \`set\`, \`frozenset\`（Python 3.9+ 可直接用）
- 旧版本需要从 \`typing\` 导入：\`List\`, \`Dict\`, \`Tuple\`, \`Set\`

### 常用类型
- **Optional[T]**：T 或 None，等价于 T | None（3.10+）
- **Union[A, B]**：A 或 B，等价于 A | B（3.10+）
- **Any**：任意类型（放弃类型检查）
- **None**：空类型
- **list[int]**：整数列表
- **dict[str, int]**：键为str、值为int的字典
- **tuple[int, str]**：两个元素的元组

### 函数注解
参数名后加 \`: 类型\`，\`->\` 后是返回值类型。

### 注意
类型提示是**可选的**，Python 解释器不强制执行！只是约定和工具辅助。`,
    code: `from typing import List, Dict, Tuple, Set, Optional, Union

print("=== 类型提示基础演示 ===\\n")

print("--- 1. 变量类型注解 ---")
name: str = "张三"
age: int = 25
height: float = 1.75
is_student: bool = True
print(f"name: str = {name!r}")
print(f"age: int = {age}")
print(f"height: float = {height}")
print(f"is_student: bool = {is_student}")

print("\\n--- 2. 容器类型注解 ---")
scores: list[int] = [90, 85, 92, 78]
user_info: dict[str, Union[str, int]] = {"name": "李四", "age": 30}
point: tuple[float, float] = (1.5, 2.5)
tags: set[str] = {"python", "coding", "tutorial"}
print(f"scores: list[int] = {scores}")
print(f"user_info: dict[str, Union[str,int]] = {user_info}")
print(f"point: tuple[float,float] = {point}")
print(f"tags: set[str] = {tags}")

print("\\n--- 3. Optional 可选类型（可以是None）---")
def find_user(user_id: int) -> Optional[str]:
    users = {1: "张三", 2: "李四"}
    return users.get(user_id)

print(f"find_user(1) = {find_user(1)!r}")
print(f"find_user(99) = {find_user(99)!r}")

print("\\n--- 4. 函数注解 ---")
def greet(name: str, times: int = 1) -> str:
    """向某人问候times次"""
    return f"你好，{name}！" * times

result: str = greet("世界", 2)
print(f"greet('世界', 2) = {result!r}")

def add(a: int, b: int) -> int:
    return a + b
print(f"add(3, 5) = {add(3, 5)}")

print("\\n--- 5. Union 联合类型（多类型之一）---")
def process_data(data: Union[int, str, list[int]]) -> str:
    if isinstance(data, int):
        return f"数字: {data}"
    elif isinstance(data, str):
        return f"字符串: {data}"
    else:
        return f"列表，共{len(data)}个元素"

print(process_data(42))
print(process_data("hello"))
print(process_data([1, 2, 3]))

print("\\n--- 6. Python 3.10+ 新语法 ---")
print("旧写法 (typing):")
print("  Union[int, str]  →  新语法: int | str")
print("  Optional[str]    →  新语法: str | None")
print("  List[int]        →  新语法: list[int]")
print("  Dict[str, int]   →  新语法: dict[str, int]")

print("\\n--- 7. 类型别名 ---")
UserId = int
UserName = str
def get_user(uid: UserId) -> UserName:
    users: dict[UserId, UserName] = {1: "张三", 2: "李四"}
    return users.get(uid, "未知")

print(f"get_user(1) = {get_user(1)!r}")

print("\\n--- 8. 查看函数注解 ---")
def demo(a: int, b: str = "hi") -> bool:
    return True

print(f"demo.__annotations__ = {demo.__annotations__}")

print("\\n=== 类型提示总结 ===")
print("1. 类型提示不强制运行时检查，只是约定")
print("2. 用 mypy 工具做静态类型检查")
print("3. 极大提升IDE体验和代码可维护性")
print("4. Python 3.9+ 推荐用内置泛型 list[int] 而非 List[int]")
print("5. Python 3.10+ 推荐用 X | Y 代替 Union[X,Y]")
`,
  },
  {
    id: "py6-typing-advanced",
    group: "工程实战",
    icon: "🧬",
    title: "类型提示进阶",
    content: `## 类型提示进阶（TypeVar/Generic/Protocol/Literal/Final/Callable/TypeAlias/Never）

### 泛型（Generics）
让类/函数支持多种类型而保持类型安全：
- **TypeVar**：定义类型变量
- **Generic[T]**：定义泛型基类

### Protocol（协议）
Python 鸭子类型的形式化表达，结构化类型（structural subtyping）：
- 不需要显式继承，只要实现了指定方法就算符合
- 类似 Go 的接口

### Literal（字面量类型）
限定值只能是特定字面量之一。

### Final
标记常量/不可重写的方法/不可继承的类。

### Callable
标注函数/可调用对象：\`Callable[[参数类型...], 返回类型]\`

### TypeAlias
显式声明类型别名（3.10+）。

### TypedDict
类型化字典，给字典的每个键指定类型（PEP 589）。适合处理 JSON/API 返回值等结构化数据。
- 类方式定义：\`class Point(TypedDict): x: int; y: int\`
- 用法：\`p: Point = {"x": 1, "y": 2}\`
- 与 \`dict[str, int]\` 不同：TypedDict 约束每个键的类型

### Never/NoReturn
表示函数永远不会正常返回（总是抛异常或无限循环）。
- **NoReturn**：Python 3.5.4+ 引入，旧版本使用
- **Never**：Python 3.11+ 引入，是 NoReturn 的更精确版本（NoReturn 仍可用）

### 其他实用类型
- **Sequence[T]**：序列（list/tuple等支持索引和len）
- **Mapping[K,V]**：映射（dict等）
- **Iterable[T]**：可迭代对象
- **Iterator[T]**：迭代器`,
    code: `from typing import (
    TypeVar, Generic, Protocol, Literal, Final,
    Callable, TypeAlias, Never, Sequence, Iterable, TypedDict
)
from collections.abc import Sized

print("=== 类型提示进阶演示 ===\\n")

print("--- 1. TypeVar 泛型函数 ---")
# TypeVar 定义类型变量，T 可以代表任意类型
# 在函数签名中用 T 让输入输出类型保持一致（类型关联）
T = TypeVar("T")

def first(items: Sequence[T]) -> T | None:
    """获取序列第一个元素，类型与元素类型一致"""
    # 传入 list[int] 则 T 推断为 int，返回 int | None
    return items[0] if items else None

print(f"first([1,2,3]) = {first([1,2,3])} (类型为int)")
print(f"first(['a','b']) = {first(['a','b'])} (类型为str)")

print("\\n--- 2. Generic 泛型类 ---")
K = TypeVar("K")
V = TypeVar("V")

# 继承 Generic[T] 让类变成泛型类，可在实例化时指定类型参数
class Stack(Generic[T]):
    """泛型栈"""
    def __init__(self) -> None:
        self._items: list[T] = []  # 类型参数 T 用作内部存储的类型

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        return self._items.pop()

    def __len__(self) -> int:
        return len(self._items)

int_stack: Stack[int] = Stack()
int_stack.push(1)
int_stack.push(2)
print(f"int_stack弹出: {int_stack.pop()}")

str_stack: Stack[str] = Stack()
str_stack.push("hello")
print(f"str_stack弹出: {str_stack.pop()}")

print("\\n--- 3. Protocol 协议（结构化类型/鸭子类型）---")
class Drawable(Protocol):
    def draw(self) -> str: ...

class Circle:
    def draw(self) -> str:
        return "画一个圆形"

class Square:
    def draw(self) -> str:
        return "画一个方形"

def render(shape: Drawable) -> None:
    print(f"渲染: {shape.draw()}")

render(Circle())
render(Square())
print("（Circle和Square没继承Drawable，但有draw方法就符合协议）")

print("\\n--- 4. Literal 字面量类型 ---")
HttpMethod = Literal["GET", "POST", "PUT", "DELETE"]
def http_request(method: HttpMethod, url: str) -> str:
    return f"{method} {url}"
print(http_request("GET", "/api/users"))
print(http_request("POST", "/api/login"))
print("# method参数只能是这四个字符串之一，IDE会提示")

print("\\n--- 5. Final 常量/不可重写 ---")
PI: Final = 3.1415926535
MAX_SIZE: Final[int] = 100
print(f"PI = {PI}（不可重新赋值）")
print(f"MAX_SIZE = {MAX_SIZE}")

print("\\n--- 6. Callable 可调用类型 ---")
def apply_operation(x: int, y: int, op: Callable[[int, int], int]) -> int:
    return op(x, y)

print(f"3 + 5 = {apply_operation(3, 5, lambda a, b: a + b)}")
print(f"3 * 5 = {apply_operation(3, 5, lambda a, b: a * b)}")

def make_greeter(greeting: str) -> Callable[[str], str]:
    """返回一个函数"""
    def greeter(name: str) -> str:
        return f"{greeting}, {name}!"
    return greeter

hello = make_greeter("你好")
print(hello("张三"))

print("\\n--- 7. TypeAlias 类型别名 ---")
Vector: TypeAlias = list[float]
Matrix: TypeAlias = list[Vector]

def add_vectors(v1: Vector, v2: Vector) -> Vector:
    return [a + b for a, b in zip(v1, v2)]

print(f"向量相加: {add_vectors([1,2], [3,4])}")

print("\\n--- 8. TypedDict 类型化字典 ---")
# TypedDict 给字典的每个键指定类型，适合处理 JSON/API 返回值
class UserInfo(TypedDict):
    name: str
    age: int
    email: str

# 创建符合 UserInfo 类型的字典
user: UserInfo = {"name": "张三", "age": 25, "email": "z****@***********"}
print(f"TypedDict 用户: {user}")
print(f"访问 user['name']: {user['name']}（IDE有类型提示）")

# 函数参数使用 TypedDict，约束传入的字典结构
def greet_user(u: UserInfo) -> str:
    return f"你好，{u['name']}，今年{u['age']}岁"

print(greet_user(user))

print("\\n--- 9. Never 永不返回 ---")
def raise_error(msg: str) -> Never:
    # Never 表示函数永远不会正常返回（这里总是抛异常）
    raise ValueError(msg)

print("Never表示函数永远不会正常返回（总是抛异常）")

print("\\n=== 进阶类型提示总结 ===")
print("1. TypeVar+Generic 定义泛型，代码更通用")
print("2. Protocol 是Python风格的接口（鸭子类型形式化）")
print("3. Literal 限定取值范围（如枚举字符串）")
print("4. Final 标记常量、防止意外修改")
print("5. Callable 标注函数/回调类型")
print("6. 类型提示让大型项目更可维护，强烈建议使用")
`,
  },
  {
    id: "py6-iterator-protocol",
    group: "工程实战",
    icon: "🔁",
    title: "迭代器协议",
    content: `## 迭代器协议（__iter__/__next__/StopIteration/自定义迭代器/for循环原理）

### 迭代器是什么？
迭代器是一个可以记住遍历位置的对象，支持 \`__next__()\` 方法逐个返回元素，没有元素时抛 \`StopIteration\`。

### 迭代器协议两个核心方法
1. **\`__iter__()\`**：返回迭代器对象本身（使对象可迭代）
2. **\`__next__()\`**：返回下一个元素，没有则抛 StopIteration

### for 循环的本质
\`\`\`python
# for 循环遍历可迭代对象 iterable，每次取一个元素赋值给变量 item
for item in iterable:
    # 打印当前遍历到的元素
    print(item)
\`\`\`
等价于：
\`\`\`python
# 用 iter() 获取可迭代对象的迭代器，内部会调用对象的 __iter__() 方法
iterator = iter(iterable)       # 调用 __iter__()
# 无限循环，依靠循环体内的 break 来退出
while True:
    try:
        # 调用 next() 取下一个元素，内部调用 __next__()；元素耗尽时抛出 StopIteration
        item = next(iterator)   # 调用 __next__()
        # 打印当前取到的元素
        print(item)
    except StopIteration:
        # 捕获迭代结束异常，结束循环
        break
\`\`\`

### 可迭代对象 vs 迭代器
- **可迭代对象（Iterable）**：实现了 \`__iter__()\`，返回一个迭代器
- **迭代器（Iterator）**：实现了 \`__iter__()\` 和 \`__next__()\`
- 迭代器一定是可迭代的，但可迭代对象不一定是迭代器（如 list 不是迭代器）

### 生成器是迭代器的语法糖
用 \`yield\` 的函数自动实现迭代器协议。

### 为什么自定义迭代器？
- 惰性计算，节省内存（处理大数据流）
- 自定义遍历逻辑
- 无限序列（如斐波那契、自然数）`,
    code: `print("=== 迭代器协议演示 ===\\n")

print("--- 1. 内置 iter() 和 next() ---")
# iter() 获取可迭代对象的迭代器，next() 取下一个元素
nums = [1, 2, 3]
it = iter(nums)  # list 本身不是迭代器，iter() 返回一个 list_iterator
print(f"iter([1,2,3]) = {it}")
print(f"next(it) = {next(it)}")
print(f"next(it) = {next(it)}")
print(f"next(it) = {next(it)}")
try:
    next(it)  # 第4次调用，元素已耗尽
except StopIteration:
    # 元素耗尽时 next() 抛出 StopIteration，这是迭代器协议的结束信号
    print("next(it) 抛出 StopIteration（没有更多元素）")

print("\\n--- 2. for 循环原理模拟 ---")
def my_for(iterable, action):
    """模拟for循环工作原理"""
    iterator = iter(iterable)  # 1. 调用 __iter__() 拿到迭代器
    while True:
        try:
            item = next(iterator)  # 2. 调用 __next__() 取元素
            action(item)
        except StopIteration:  # 3. 捕获 StopIteration 退出循环
            break

print("my_for 遍历 [10,20,30]:")
my_for([10, 20, 30], lambda x: print(f"  元素: {x}"))

print("\\n--- 3. 自定义迭代器：计数器 ---")
class CountDown:
    """倒数计数迭代器"""
    def __init__(self, start: int):
        self.current = start

    def __iter__(self):
        # __iter__ 必须返回一个迭代器（通常是 self）
        return self

    def __next__(self):
        # __next__ 返回下一个值；没有更多值时必须抛 StopIteration
        if self.current < 0:
            raise StopIteration  # 结束信号，for 循环会自动捕获
        value = self.current
        self.current -= 1
        return value

print("CountDown(5) 倒数:")
for n in CountDown(5):
    print(f"  {n}")

print("\\n--- 4. 自定义迭代器：斐波那契数列 ---")
class Fibonacci:
    """斐波那契数列迭代器"""
    def __init__(self, max_count: int):
        self.max_count = max_count
        self.count = 0
        self.a, self.b = 0, 1

    def __iter__(self):
        return self

    def __next__(self):
        # 达到上限时抛 StopIteration 终止迭代
        if self.count >= self.max_count:
            raise StopIteration
        self.a, self.b = self.b, self.a + self.b
        self.count += 1
        return self.a

print(f"前10个斐波那契数: {list(Fibonacci(10))}")

print("\\n--- 5. 生成器（yield）：更简洁的迭代器 ---")
def fib_gen(max_count: int):
    """生成器函数，自动实现迭代器协议"""
    a, b = 0, 1
    for _ in range(max_count):
        a, b = b, a + b
        yield a

print(f"生成器前10个斐波那契: {list(fib_gen(10))}")

print("\\n--- 6. 生成器表达式 ---")
squares = (x * x for x in range(5))
print(f"生成器表达式类型: {type(squares)}")
print(f"生成器表达式结果: {list(squares)}")

print("\\n--- 7. 无限迭代器（itertools）---")
import itertools
counter = itertools.count(1)
print("itertools.count(1) 前5个:", end=" ")
for _ in range(5):
    print(next(counter), end=" ")
print()

cycle = itertools.cycle("ABC")
print("itertools.cycle('ABC') 前7个:", end=" ")
for _ in range(7):
    print(next(cycle), end=" ")
print()

print("\\n=== 迭代器协议总结 ===")
print("1. __iter__返回自身，__next__返回下一个元素")
print("2. 迭代完抛StopIteration，for循环自动捕获")
print("3. 迭代器是惰性的，省内存，适合大数据/无限流")
print("4. 用yield写生成器比手写__next__简洁得多")
print("5. list/tuple/str/dict都是可迭代对象，但不是迭代器")
`,
  },
  {
    id: "py6-descriptor",
    group: "工程实战",
    icon: "📋",
    title: "描述符",
    content: `## 描述符（__get__/__set__/__delete__/property原理/数据描述符vs非数据描述符）

### 什么是描述符？
描述符是实现了特定协议（\`__get__\`、\`__set__\`、\`__delete__\`）的类，可以自定义属性的访问行为。

### 描述符协议三个方法
- **\`__get__(self, obj, type=None)\`**：获取属性时调用
- **\`__set__(self, obj, value)\`**：设置属性时调用
- **\`__delete__(self, obj)\`**：删除属性时调用

### 两种描述符
1. **数据描述符（Data Descriptor）**：实现了 \`__get__\` 和 \`__set__\`（或 \`__delete__\`）
   - 优先级高于实例字典
2. **非数据描述符（Non-data Descriptor）**：只实现了 \`__get__\`
   - 优先级低于实例字典

### 属性查找顺序（重要！）
1. 数据描述符（类中定义）
2. 实例的 \`__dict__\`
3. 非数据描述符 / 普通类属性
4. \`__getattr__()\`（如果定义）

### property 本质
\`@property\` 装饰器就是用描述符实现的！

### 描述符应用场景
- 类型检查/验证
- 惰性计算
- 自动日志记录
- ORM字段映射（Django/SQLAlchemy）
- 属性访问控制`,
    code: `print("=== 描述符演示 ===\\n")

print("--- 1. 最简单的描述符 ---")
class VerboseAttribute:
    """打印访问日志的描述符"""
    # __get__ 参数：self=描述符实例，obj=访问属性的实例（类访问时为None），objtype=类
    def __get__(self, obj, objtype=None):
        print(f"  __get__被调用: obj={obj}, type={objtype.__name__}")
        return "描述符的值"

    # __set__ 参数：self=描述符实例，obj=访问属性的实例，value=要赋的值
    def __set__(self, obj, value):
        print(f"  __set__被调用: obj={obj}, value={value}")

class MyClass:
    # 描述符实例作为类属性定义
    attr = VerboseAttribute()

obj = MyClass()
print("访问obj.attr:")
val = obj.attr
print(f"  获取到: {val}")
print("\\n设置obj.attr = 42:")
obj.attr = 42

print("\\n--- 2. 类型验证描述符 ---")
class Typed:
    """类型检查描述符"""
    def __init__(self, name: str, expected_type: type):
        self.name = name  # 存储属性名，用于在实例 __dict__ 中存取
        self.expected_type = expected_type

    def __get__(self, obj, objtype=None):
        # obj 为 None 表示通过类访问（如 Person.name），返回描述符自身
        if obj is None:
            return self
        # 从实例的 __dict__ 中取实际存储的值
        return obj.__dict__.get(self.name)

    def __set__(self, obj, value):
        # 赋值前做类型检查，不符合则抛 TypeError
        if not isinstance(value, self.expected_type):
            raise TypeError(
                f"{self.name}必须是{self.expected_type.__name__}类型，"
                f"传入了{type(value).__name__}"
            )
        # 通过实例 __dict__ 存值，避免触发描述符自身递归
        obj.__dict__[self.name] = value

class Person:
    name = Typed("name", str)
    age = Typed("age", int)

    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age

p = Person("张三", 25)
print(f"创建Person: name={p.name}, age={p.age}")
try:
    p.age = "二十五"
except TypeError as e:
    print(f"类型错误被捕获: {e}")

print("\\n--- 3. property 原理（property本身就是描述符）---")
class Circle:
    def __init__(self, radius: float):
        self._radius = radius

    @property
    def radius(self) -> float:
        return self._radius

    @radius.setter
    def radius(self, value: float):
        if value < 0:
            raise ValueError("半径不能为负数")
        self._radius = value

    @property
    def area(self) -> float:
        import math
        return math.pi * self._radius ** 2

c = Circle(5)
print(f"圆 半径={c.radius}, 面积={c.area:.2f}")
c.radius = 10
print(f"修改后半径={c.radius}, 面积={c.area:.2f}")

print("\\n--- 4. 惰性计算描述符 ---")
class LazyProperty:
    """首次访问时计算，之后缓存结果"""
    def __init__(self, func):
        self.func = func
        self.name = func.__name__

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        value = self.func(obj)
        obj.__dict__[self.name] = value
        return value

class DataProcessor:
    def __init__(self, data: list[int]):
        self.data = data

    @LazyProperty
    def sorted_data(self):
        print("  (执行排序计算...)")
        import time
        time.sleep(0.1)
        return sorted(self.data)

dp = DataProcessor([3, 1, 4, 1, 5, 9])
print("第一次访问sorted_data:")
result = dp.sorted_data
print(f"  结果: {result}")
print("第二次访问sorted_data（直接用缓存）:")
result2 = dp.sorted_data
print(f"  结果: {result2}")

print("\\n--- 5. 数据描述符 vs 非数据描述符 ---")
print("""
数据描述符(__get__+__set__):
  优先级 > 实例__dict__
  property属于数据描述符

非数据描述符(只__get__):
  优先级 < 实例__dict__
  实例赋值会覆盖描述符

属性查找顺序:
  类数据描述符 → 实例字典 → 类普通方法/非数据描述符 → __getattr__
""")

print("\\n=== 描述符总结 ===")
print("1. __get__/__set__/__delete__ 实现属性访问控制")
print("2. @property 就是描述符的经典应用")
print("3. 数据描述符拦截赋值，非数据描述符不拦截")
print("4. ORM框架（Django/SQLAlchemy）大量使用描述符")
print("5. 描述符是Python很多魔法的底层机制")
`,
  },
  {
    id: "py6-metaclass",
    group: "工程实战",
    icon: "🏗️",
    title: "元类基础",
    content: `## 元类基础（type动态创建类/__new__/元类应用场景简单版）

### 一切皆对象
在Python中：
- 实例是对象
- 类也是对象
- 创建类的"东西"就是**元类（metaclass）**

### type 是默认元类
我们平时用 \`class\` 定义类，Python 内部用 \`type\` 来创建它。
- \`type(name, bases, namespace)\` 可以动态创建类：
  - name: 类名
  - bases: 父类元组
  - namespace: 类属性/方法的字典

### 元类工作流程
1. 遇到 \`class\` 定义时，收集类名、基类、属性字典
2. 调用元类（默认type）创建类对象
3. 自定义元类继承 \`type\`，重写 \`__new__\` 或 \`__init__\` 可以干预类创建

### \`__new__\` vs \`__init__\`
- **\`__new__(mcs, name, bases, namespace)\`**：创建类对象（在类创建前）
- **\`__init__(cls, name, bases, namespace)\`**：初始化类对象（在类创建后）

### 元类常见用途
- 自动注册类（插件系统）
- 自动添加方法/属性
- 验证类定义（接口检查）
- ORM框架（Django Model的核心）
- 单例模式实现

### 注意
元类是"黑魔法"，多数业务代码不需要。但理解元类有助于理解Python的对象模型。"如果不确定是否需要元类，那你就不需要它。"`,
    code: `print("=== 元类基础演示 ===\\n")

print("--- 1. type 的本质：类是type的实例 ---")
class NormalClass:
    x = 10

print(f"NormalClass 类型: {type(NormalClass)}")
print(f"NormalClass() 类型: {type(NormalClass())}")
print(f"type 的类型: {type(type)}")
print("结论: 类是type创建的对象，type是自己的实例")

print("\\n--- 2. 用type动态创建类 ---")
def hello(self):
    return f"Hello, {self.name}!"

# type(name, bases, namespace) 三参数形式动态创建类：
#   name: 类名字符串
#   bases: 父类元组（无父类用 (object,)）
#   namespace: 类属性和方法的字典
DynamicClass = type(
    "DynamicClass",
    (object,),
    {"name": "动态类", "greet": hello, "version": 1}
)

obj = DynamicClass()
print(f"动态创建的类名: {DynamicClass.__name__}")
print(f"obj.name = {obj.name}")
print(f"obj.version = {obj.version}")
print(f"obj.greet() = {obj.greet()}")

print("\\n--- 3. 自定义元类：自动添加类名前缀 ---")
# 自定义元类继承 type，重写 __new__ 可以在类创建前干预
class PrefixMetaclass(type):
    """给类名添加前缀的元类"""
    # mcs=元类自身，name=类名，bases=父类元组，namespace=属性字典
    def __new__(mcs, name, bases, namespace):
        new_name = f"Prefix_{name}"
        namespace["class_tag"] = "由元类添加的属性"
        print(f"  元类创建类: {name} -> {new_name}")
        # 调用 type.__new__ 真正创建类对象
        return super().__new__(mcs, new_name, bases, namespace)

class MyClass(metaclass=PrefixMetaclass):
    x = 100

obj = MyClass()
print(f"创建的类名: {MyClass.__name__}")
print(f"class_tag属性: {MyClass.class_tag}")

print("\\n--- 4. 元类：自动收集子类（插件注册）---")
class PluginRegistry(type):
    """插件注册元类"""
    plugins: list[type] = []

    def __init__(cls, name, bases, namespace):
        super().__init__(name, bases, namespace)
        if bases:
            PluginRegistry.plugins.append(cls)
            print(f"  注册插件: {name}")

class PluginBase(metaclass=PluginRegistry):
    def run(self):
        raise NotImplementedError

class PluginA(PluginBase):
    def run(self):
        return "插件A运行"

class PluginB(PluginBase):
    def run(self):
        return "插件B运行"

print(f"\\n已注册插件: {[p.__name__ for p in PluginRegistry.plugins]}")
for p in PluginRegistry.plugins:
    print(f"  {p.__name__}.run() -> {p().run()}")

print("\\n--- 5. 元类：验证接口 ---")
class ValidatorMeta(type):
    """要求子类必须实现特定方法"""
    required_methods = ["execute"]

    def __init__(cls, name, bases, namespace):
        super().__init__(name, bases, namespace)
        if bases:
            for method in ValidatorMeta.required_methods:
                if method not in namespace or not callable(namespace[method]):
                    raise TypeError(
                        f"{name} 必须实现 {method}() 方法"
                    )

class TaskBase(metaclass=ValidatorMeta):
    pass

try:
    class BadTask(TaskBase):
        pass
except TypeError as e:
    print(f"BadTask 验证失败: {e}")

class GoodTask(TaskBase):
    def execute(self):
        return "GoodTask执行中"

print(f"GoodTask验证通过: {GoodTask().execute()}")

print("\\n--- 6. 用类装饰器替代元类（推荐更简单）---")
def add_repr(cls):
    """自动生成__repr__的类装饰器（比元类更简单）"""
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

print(f"自动__repr__: {Point(3, 4)}")

print("\\n=== 元类总结 ===")
print("1. 类是type的实例，type是默认元类")
print("2. type(name, bases, dict) 可以动态创建类")
print("3. 自定义元类继承type，重写__new__/__init__")
print("4. 元类能做的事很多也能用类装饰器/__init_subclass__实现")
print("5. 元类是高级特性，框架开发常用，业务代码慎用")
print("6. __init_subclass__钩子（3.6+）比元类简单很多：")
print("   class Base:")
print("       def __init_subclass__(cls, **kwargs):")
print("           # 子类创建时自动调用")
`,
  },
  {
    id: "py6-unittest",
    group: "工程实战",
    icon: "🧪",
    title: "单元测试unittest",
    content: `## 单元测试unittest（TestCase/setUp/tearDown/assertEqual/assertTrue/assertRaises）

### 为什么要写测试？
- **保证代码正确性**：修改后快速验证是否破坏已有功能
- **文档作用**：测试用例展示了代码如何使用
- **重构信心**：有测试保护，敢大胆重构
- **设计反馈**：难测试的代码往往设计不好

### unittest 核心概念
- **TestCase**：测试用例类，继承 \`unittest.TestCase\`
- **setUp()**：每个测试方法执行前运行（准备环境）
- **tearDown()**：每个测试方法执行后运行（清理环境）
- **setUpClass()**：类级别setUp，所有测试前运行一次
- **tearDownClass()**：类级别tearDown，所有测试后运行一次
- **test_\\* 方法**：每个以test开头的方法都是一个测试

### 常用断言方法
- \`assertEqual(a, b)\`：a == b
- \`assertNotEqual(a, b)\`：a != b
- \`assertTrue(x)\`：bool(x) is True
- \`assertFalse(x)\`：bool(x) is False
- \`assertIs(a, b)\`：a is b
- \`assertIsNone(x)\` / \`assertIsNotNone(x)\`
- \`assertIn(a, b)\` / \`assertNotIn(a, b)\`
- \`assertRaises(exc)\`：验证抛出指定异常
- \`assertAlmostEqual(a, b)\`：浮点数近似相等

### 运行测试
- \`python -m unittest\`：自动发现并运行测试
- \`python -m unittest test_module\`：运行指定模块
- \`unittest.main()\`：在脚本中运行`,
    code: `import unittest

print("=== unittest 单元测试演示 ===\\n")

class Calculator:
    """被测试的简单计算器类"""
    def add(self, a, b):
        return a + b

    def divide(self, a, b):
        if b == 0:
            raise ValueError("除数不能为零")
        return a / b

    def is_even(self, n):
        return n % 2 == 0

print("--- 运行 Calculator 测试 ---")

class TestCalculator(unittest.TestCase):
    """Calculator测试用例"""

    @classmethod
    def setUpClass(cls):
        """所有测试开始前执行一次"""
        print("  setUpClass: 创建计算器实例")
        cls.calc = Calculator()

    @classmethod
    def tearDownClass(cls):
        """所有测试结束后执行一次"""
        print("  tearDownClass: 清理资源")

    def setUp(self):
        """每个测试方法前执行"""
        print(f"  setUp: 准备测试 {self._testMethodName}")

    def tearDown(self):
        """每个测试方法后执行"""
        pass

    def test_add_positive(self):
        """测试正数加法"""
        self.assertEqual(self.calc.add(2, 3), 5)
        self.assertEqual(self.calc.add(0, 0), 0)

    def test_add_negative(self):
        """测试负数加法"""
        self.assertEqual(self.calc.add(-1, -2), -3)
        self.assertEqual(self.calc.add(-5, 5), 0)

    def test_divide_normal(self):
        """测试正常除法"""
        self.assertEqual(self.calc.divide(10, 2), 5.0)
        self.assertAlmostEqual(self.calc.divide(1, 3), 0.3333, places=3)

    def test_divide_by_zero(self):
        """测试除以零抛出异常"""
        with self.assertRaises(ValueError) as ctx:
            self.calc.divide(10, 0)
        self.assertIn("除数不能为零", str(ctx.exception))

    def test_is_even(self):
        """测试偶数判断"""
        self.assertTrue(self.calc.is_even(4))
        self.assertTrue(self.calc.is_even(0))
        self.assertFalse(self.calc.is_even(3))
        self.assertFalse(self.calc.is_even(-1))

    def test_in_check(self):
        """测试成员判断"""
        self.assertIn(3, [1, 2, 3, 4])
        self.assertNotIn(5, [1, 2, 3])

suite = unittest.TestLoader().loadTestsFromTestCase(TestCalculator)
runner = unittest.TextTestRunner(verbosity=2)
result = runner.run(suite)

print(f"\\n测试结果: 运行{result.testsRun}个测试")
print(f"  成功: {result.testsRun - len(result.failures) - len(result.errors)}")
print(f"  失败: {len(result.failures)}")
print(f"  错误: {len(result.errors)}")

print("\\n--- 单元测试最佳实践 ---")
print("1. 每个测试只测一个功能点")
print("2. 测试命名: test_功能_场景_期望结果")
print("3. 测试要快（不要真连数据库/网络，用mock）")
print("4. setUp/tearDown 管理公共测试资源")
print("5. 一个测试失败不影响其他测试（独立）")
print("6. 测试边界条件（空值、零、最大值、异常）")
print("7. 测试覆盖率目标70%+，核心模块100%")
`,
  },
  {
    id: "py6-pytest",
    group: "工程实战",
    icon: "🧫",
    title: "pytest基础",
    content: `## pytest基础（pytest安装概念/test_函数命名/assert断言/fixture概念讲解，用unittest实际运行）

### pytest 是什么？
pytest 是Python最流行的第三方测试框架，比unittest更简洁强大：
- 不需要类继承，直接写 test_ 开头的函数
- 直接用Python原生 assert 语句（不是self.assertEqual）
- 强大的 fixture（比setUp更灵活）
- 参数化测试、插件生态丰富

### pytest 基本规则
- 测试文件：\`test_*.py\` 或 \`*_test.py\`
- 测试函数：\`test_\` 开头
- 测试类：\`Test\` 开头，不需要继承
- 断言：直接用 \`assert\` 语句

### fixture 概念
fixture 是 pytest 的核心概念，用于：
- 准备测试数据/环境
- 依赖注入（测试函数参数名匹配fixture名）
- 支持 setup/teardown（yield之前setup，之后teardown）
- 作用域：function（默认）/class/module/session
- 可复用、可组合

### pytest vs unittest
| 特性 | unittest | pytest |
|------|----------|--------|
| 风格 | 类继承 | 函数式 |
| 断言 | self.assertXxx | assert 原生 |
| 准备/清理 | setUp/tearDown | fixture(yield) |
| 参数化 | 需额外代码 | @pytest.mark.parametrize |
| 插件 | 少 | 非常丰富 |

注意：沙箱环境无pytest，本章节用unittest演示pytest概念。`,
    code: `import unittest

print("=== pytest 概念演示（用unittest模拟运行）===")

print("\\n--- pytest 基本语法对比 ---")
print("""
# unittest 写法:
import unittest
class TestAdd(unittest.TestCase):
    def test_add(self):
        self.assertEqual(add(2, 3), 5)

# pytest 写法（更简洁）:
def test_add():
    assert add(2, 3) == 5
""")

print("--- pytest fixture 概念演示 ---")
print("""
# pytest fixture（依赖注入）:
import pytest

@pytest.fixture
def db():
    # setup: 连接数据库
    conn = create_db_connection()
    yield conn  # 测试中使用这个值
    # teardown: 关闭连接
    conn.close()

def test_query(db):  # 自动注入db fixture
    result = db.query("SELECT * FROM users")
    assert len(result) > 0

@pytest.fixture(scope="session")  # 整个测试会话只创建一次
def config():
    return load_config()
""")

print("--- 用unittest演示fixture思想 ---")

class Database:
    """模拟数据库连接"""
    def __init__(self, name):
        self.name = name
        print(f"    [DB] 连接 {name}")
        self.connected = True

    def query(self, sql):
        return [{"id": 1, "name": "张三"}, {"id": 2, "name": "李四"}]

    def close(self):
        print(f"    [DB] 关闭 {self.name}")
        self.connected = False


class TestWithFixtures(unittest.TestCase):
    """用unittest演示pytest fixture的准备/清理思想"""

    def setUp(self):
        """模拟function级别fixture"""
        self.db = Database("测试库")

    def tearDown(self):
        self.db.close()

    @classmethod
    def setUpClass(cls):
        """模拟session/class级别fixture"""
        print("    setUpClass: 全局配置加载（只执行一次）")
        cls.config = {"debug": True, "timeout": 30}

    def test_query_users(self):
        """测试查询用户"""
        users = self.db.query("SELECT * FROM users")
        self.assertEqual(len(users), 2)
        self.assertEqual(users[0]["name"], "张三")

    def test_config_exists(self):
        """测试配置"""
        self.assertTrue(self.config["debug"])
        self.assertEqual(self.config["timeout"], 30)

suite = unittest.TestLoader().loadTestsFromTestCase(TestWithFixtures)
runner = unittest.TextTestRunner(verbosity=0)
runner.run(suite)

print("\\n--- pytest 参数化测试概念 ---")
print("""
# pytest参数化（一个函数跑多组数据）:
import pytest

@pytest.mark.parametrize("a, b, expected", [
    (2, 3, 5),
    (0, 0, 0),
    (-1, 1, 0),
    (100, 200, 300),
])
def test_add_params(a, b, expected):
    assert add(a, b) == expected
""")

def add(a, b):
    return a + b

class TestParameterized(unittest.TestCase):
    """unittest模拟参数化测试"""
    def test_add_cases(self):
        cases = [
            (2, 3, 5),
            (0, 0, 0),
            (-1, 1, 0),
            (100, 200, 300),
        ]
        for a, b, expected in cases:
            with self.subTest(a=a, b=b):
                self.assertEqual(add(a, b), expected)

suite2 = unittest.TestLoader().loadTestsFromTestCase(TestParameterized)
runner.run(suite2)

print("\\n--- pytest 常用命令 ---")
print("pytest                 # 运行所有测试")
print("pytest test_file.py    # 运行指定文件")
print("pytest -v              # 详细输出")
print("pytest -k 'keyword'    # 按名称筛选测试")
print("pytest -x              # 第一次失败就停止")
print("pytest --cov           # 覆盖率报告（需pytest-cov）")
print("pytest -s              # 显示print输出")

print("\\n=== pytest 总结 ===")
print("1. pytest是第三方框架: pip install pytest")
print("2. 直接assert，不用self.assertXxx，更直观")
print("3. fixture是pytest灵魂，比setUp灵活N倍")
print("4. 参数化测试让写多组测试用例超简单")
print("5. 插件生态丰富（cov、mock、asyncio等）")
print("6. 新项目强烈推荐用pytest替代unittest")
`,
  },
  {
    id: "py6-debug-pdb",
    group: "工程实战",
    icon: "🐛",
    title: "调试技巧",
    content: `## 调试技巧（print调试/logging调试/pdb概念讲解，用print和简单断点演示）

### 调试方法对比

| 方法 | 优点 | 缺点 |
|------|------|------|
| print() | 简单直接 | 需要手动加删，信息少 |
| logging | 可配置级别、输出到文件 | 初期设置稍麻烦 |
| pdb | 交互式检查、可单步执行 | 需要学习命令 |
| IDE调试器 | 图形化、断点、变量查看 | 依赖IDE |

### print 调试技巧
- \`f"{var=}"\` (Python 3.8+) 快速打印变量名和值
- 打印前后状态对比
- 打印进入/离开函数标记

### logging 模块
比print更好的调试工具：
- 分级：DEBUG/INFO/WARNING/ERROR/CRITICAL
- 可同时输出到控制台和文件
- 可配置格式（时间、模块、行号）
- 生产环境只改级别就能关闭调试信息

### pdb 调试器
Python内置的交互式调试器：
- \`import pdb; pdb.set_trace()\` 设置断点（3.7+用\`breakpoint()\`）
- 常用命令：
  - **n(next)**：执行下一行（不进入函数）
  - **s(step)**：进入函数
  - **c(continue)**：继续执行
  - **p(print) 变量**：打印变量值
  - **l(list)**：查看当前代码
  - **w(where)**：查看调用栈
  - **b(reak) 行号**：设置断点
  - **q(quit)**：退出

注意：沙箱环境无法交互，本演示用print模拟调试思路。`,
    code: `import logging
import time

print("=== Python调试技巧演示 ===\\n")

print("--- 1. print调试技巧 ---")
def calculate_average(numbers):
    # f"{var=}" 语法（Python 3.8+）同时打印变量名和值
    print(f"[DEBUG] calculate_average called, {numbers=}")
    if not numbers:
        print("[DEBUG] 空列表，返回0")
        return 0
    total = sum(numbers)
    count = len(numbers)
    result = total / count
    print(f"[DEBUG] {total=}, {count=}, {result=}")
    return result

avg = calculate_average([10, 20, 30, 40])
print(f"平均值: {avg}")
calculate_average([])

print("\\n--- 2. logging 模块（推荐！比print专业）---")
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(funcName)s:%(lineno)d - %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger(__name__)

def process_user(user_id):
    logger.info(f"开始处理用户 {user_id}")
    logger.debug(f"查询数据库中...")
    time.sleep(0.05)
    if user_id < 0:
        logger.warning(f"无效的用户ID: {user_id}")
        return None
    logger.info(f"用户 {user_id} 处理完成")
    return {"id": user_id, "name": f"用户{user_id}"}

process_user(1)
process_user(-1)
process_user(2)

print("""
logging级别（从低到高）:
  DEBUG    - 调试信息（开发时看）
  INFO     - 一般信息（正常流程）
  WARNING  - 警告（潜在问题）
  ERROR    - 错误（功能失败）
  CRITICAL - 严重错误（程序崩溃）
""")

print("--- 3. pdb 调试器概念（非交互式演示）---")
print("""
pdb常用命令:
  n (next)     - 执行下一行，不进入函数
  s (step)     - 执行下一行，进入函数内部
  c (continue) - 继续运行到下一个断点
  p expr       - 打印表达式的值
  pp expr      - 漂亮打印
  l (list)     - 列出当前位置代码
  w (where)    - 打印调用栈
  b line       - 在指定行设断点
  b function   - 在函数开头设断点
  cl           - 清除断点
  q (quit)     - 退出调试器
  r (return)   - 运行到函数返回
  a (args)     - 打印当前函数参数

设置断点方式:
  1. 代码中插入: breakpoint()        (Python 3.7+)
  2. 代码中插入: import pdb; pdb.set_trace()
  3. 命令行启动: python -m pdb script.py
""")

print("--- 4. 常见错误定位思路 ---")
print("""
调试步骤:
1. 复现问题 - 确定能稳定触发bug
2. 缩小范围 - 二分法/注释代码定位出问题的行
3. 检查输入 - 打印输入数据，看是否符合预期
4. 跟踪执行 - 用断点/print跟踪关键变量变化
5. 验证假设 - 假设原因，修改测试是否解决
6. 回归测试 - 修复后跑所有测试确保没引入新bug

常见bug类型:
  - 空值错误: NoneType has no attribute xxx
  - 索引越界: list index out of range
  - 键不存在: KeyError
  - 类型错误: TypeError: can't add str and int
  - 缩进错误: IndentationError（Python独有）
  - 循环导入: ImportError/circular import
""")

def buggy_function(data):
    """一个有典型bug的函数，用print调试思路"""
    logger.debug(f"buggy_function 输入: {data}")
    if data is None:
        logger.error("输入为None!")
        return None
    if not isinstance(data, list):
        logger.warning(f"期望list，收到{type(data).__name__}，尝试转换")
        data = list(data)
    if len(data) == 0:
        logger.warning("空列表")
        return []
    result = [x * 2 for x in data if isinstance(x, (int, float))]
    logger.debug(f"处理结果: {result}")
    return result

print("测试buggy_function:")
print(f"  [1,2,3] -> {buggy_function([1,2,3])}")
print(f"  None -> {buggy_function(None)}")
print(f"  (1,2) -> {buggy_function((1,2))}")
print(f"  [1,'a',3] -> {buggy_function([1,'a',3])}")

print("\\n=== 调试技巧总结 ===")
print("1. 开发调试用logging，比print更规范")
print("2. 复杂bug用pdb断点单步跟踪")
print("3. IDE调试器（PyCharm/VSCode）最方便")
print("4. f'{var=}'是快速print调试的神器")
print("5. 先复现，再二分定位，最后验证修复")
print("6. 防御性编程，关键处加日志和断言")
`,
  },
  {
    id: "py6-profiling",
    group: "工程实战",
    icon: "⏱️",
    title: "性能分析",
    content: `## 性能分析（timeit计时/cProfile概念/代码耗时对比）

### 为什么需要性能分析？
"过早优化是万恶之源"，但"不做性能分析就瞎优化更是灾难"。性能分析让你知道**哪里慢**，而不是猜。

### 性能分析层次
1. **粗粒度计时**：\`time.time()\` / \`time.perf_counter()\`
2. **精确计时**：\`timeit\` 模块（自动多次运行取平均）
3. **函数级分析**：\`cProfile\`（每个函数调用次数/耗时）
4. **行级分析**：\`line_profiler\`（每行代码耗时，第三方）
5. **内存分析**：\`memory_profiler\`（内存占用，第三方）

### timeit 模块
- 自动执行多次，消除偶然波动
- 关闭GC，保证测量准确
- 命令行: \`python -m timeit -s "setup" "code"\`
- 代码: \`timeit.timeit(stmt, setup, number)\`

### cProfile 模块
Python内置性能分析器：
- \`cProfile.run("code()")\`
- \`python -m cProfile -s cumulative script.py\`
- 统计列：ncalls(调用次数)、tottime(自身耗时)、cumtime(含子函数耗时)

### perf_counter vs time
- \`time.time()\`：系统时间，可能被系统调整
- \`time.perf_counter()\`：最高精度计时器，专门用于性能测量
- 计时一定要用 \`perf_counter\`！`,
    code: `import timeit
import time
import math

print("=== 性能分析演示 ===\\n")

print("--- 1. time.perf_counter() 精确计时 ---")
def slow_loop():
    total = 0
    for i in range(100000):
        total += math.sqrt(i)
    return total

start = time.perf_counter()
slow_loop()
elapsed = time.perf_counter() - start
print(f"slow_loop() 耗时: {elapsed*1000:.2f} 毫秒")

print("\\n--- 2. timeit 精确测量（自动多次运行）---")

def concat_plus():
    s = ""
    for i in range(1000):
        s += str(i)
    return s

def concat_join():
    parts = []
    for i in range(1000):
        parts.append(str(i))
    return "".join(parts)

t_plus = timeit.timeit(concat_plus, number=200)
t_join = timeit.timeit(concat_join, number=200)
print(f"字符串拼接 + 号: {t_plus*1000:.2f}ms (200次)")
print(f"字符串拼接 join: {t_join*1000:.2f}ms (200次)")
print(f"join 比 + 快 {t_plus/t_join:.1f}x")

print("\\n--- 3. 列表推导 vs for循环 append ---")
def for_append():
    result = []
    for i in range(5000):
        if i % 2 == 0:
            result.append(i * i)
    return result

def list_comp():
    return [i * i for i in range(5000) if i % 2 == 0]

t_for = timeit.timeit(for_append, number=500)
t_lc = timeit.timeit(list_comp, number=500)
print(f"for+append: {t_for*1000:.2f}ms")
print(f"列表推导:   {t_lc*1000:.2f}ms")
print(f"列表推导快 {t_for/t_lc:.1f}x")

print("\\n--- 4. cProfile 概念（函数级性能分析）---")
print("""
cProfile使用方法:

# 命令行:
python -m cProfile -s cumulative myscript.py
python -m cProfile -o output.prof myscript.py

# 代码中:
import cProfile
cProfile.run('my_function()')

# 结果解读:
  ncalls  - 调用次数
  tottime - 函数自身耗时（不含子函数）
  percall - tottime/ncalls
  cumtime - 累计耗时（含子函数）
  percall - cumtime/ncalls
  filename:lineno(function)
""")

print("--- 简单cProfile演示 ---")
import cProfile
import pstats
import io

def a():
    time.sleep(0.05)
    b()

def b():
    time.sleep(0.03)
    c()

def c():
    sum(range(10000))

pr = cProfile.Profile()
pr.enable()
a()
a()
pr.disable()

s = io.StringIO()
ps = pstats.Stats(pr, stream=s).sort_stats("cumulative")
ps.print_stats(10)
print(s.getvalue())

print("--- 5. timeit 命令行用法 ---")
print("""
# 命令行快速测试:
python -m timeit "'-'.join(str(i) for i in range(100))"
python -m timeit -s "nums=list(range(100))" "sum(nums)"
python -m timeit -n 1000 -r 5 "test_code()"  # 1000次/轮，5轮
""")

print("=== 性能分析总结 ===")
print("1. 不要猜，先profile再优化！")
print("2. 精确计时用 time.perf_counter()，不要用time.time()")
print("3. 小段代码对比用 timeit，自动消除干扰")
print("4. 找出热点函数用 cProfile，看cumtime排序")
print("5. 重点优化最耗时的10%代码（28定律）")
print("6. 优化前后都要测试，确保正确性+可度量提升")
print("7. 字符串拼接用join，列表推导比append快")
`,
  },
  {
    id: "py6-requirements",
    group: "工程实战",
    icon: "📦",
    title: "依赖管理",
    content: `## 依赖管理（requirements.txt/pip freeze/pyproject.toml概念讲解）

### 为什么需要依赖管理？
- 项目需要哪些第三方包？
- 用什么版本？版本不一致可能导致运行失败
- 别人拿到你的代码怎么快速搭建环境？
- 如何区分生产依赖和开发依赖？

### requirements.txt
最传统的依赖声明方式：
- 每行一个包，可指定版本
- \`pip install -r requirements.txt\` 一键安装
- \`pip freeze > requirements.txt\` 导出当前环境所有包版本

### 版本指定语法
- \`package\`：最新版本
- \`package==1.2.3\`：精确版本
- \`package>=1.2.0\`：最低版本
- \`package>=1.2,<2.0\`：版本范围
- \`package~=1.2\`：兼容版本（>=1.2,<2.0）

### 虚拟环境（venv）
隔离项目依赖，不污染全局Python：
- \`python -m venv venv\` 创建虚拟环境
- macOS/Linux: \`source venv/bin/activate\`
- Windows: \`venv\\Scripts\\activate\`
- \`deactivate\` 退出

### pyproject.toml（现代标准）
PEP 518/621 定义的现代项目配置，替代 setup.py/requirements.txt：
- 统一的项目配置文件
- 支持 setuptools/poetry/pdm/hatch 等工具
- 声明构建系统、项目元数据、依赖

### 现代依赖管理工具
- **Poetry**：依赖解析+锁定+发布，一体化
- **Pipenv**：pip+virtualenv结合
- **PDM**：现代包管理器，支持PEP最新标准`,
    code: `import sys
import subprocess
import importlib.util

print("=== Python依赖管理演示 ===\\n")

print("--- 1. pip 基本命令 ---")
print("""
pip install package          # 安装最新版
pip install package==1.2.3   # 安装指定版本
pip install "package>=1.0"   # 安装最低版本
pip install -r requirements.txt  # 从文件安装
pip uninstall package        # 卸载
pip list                     # 列出已安装包
pip show package             # 查看包信息
pip freeze                   # 导出已安装包及版本
pip install --upgrade package    # 升级包
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple package  # 使用国内镜像
""")

print("--- 2. requirements.txt 格式示例 ---")
requirements_example = """# 生产依赖
flask==2.3.0
requests>=2.28.0
sqlalchemy~=2.0
python-dotenv

# 开发依赖（通常放requirements-dev.txt）
pytest>=7.0
pytest-cov
black
mypy
flake8
"""
print(requirements_example)

print("--- 3. 虚拟环境操作 ---")
print(f"当前Python路径: {sys.executable}")
print(f"是否在虚拟环境中: {hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)}")
print("""
创建虚拟环境:
  python -m venv venv           # 创建venv目录
  python3 -m venv .venv         # 隐藏目录（更流行）

激活虚拟环境:
  macOS/Linux: source venv/bin/activate
  Windows:     venv/Scripts/activate.bat
  Windows PowerShell: venv/Scripts/Activate.ps1

退出虚拟环境:
  deactivate

虚拟环境后安装包:
  pip install flask     # 只在这个环境中
""")

print("--- 4. pip freeze 演示（查看已安装包）---")
print("已安装的主要包（前10个）:")
try:
    result = subprocess.run(
        [sys.executable, "-m", "pip", "freeze"],
        capture_output=True, text=True, timeout=5
    )
    lines = result.stdout.strip().split("\\n")
    for line in lines[:10]:
        if line:
            print(f"  {line}")
    if len(lines) > 10:
        print(f"  ... 还有{len(lines)-10}个包")
except:
    print("  (无法获取包列表，演示环境)")

print("\\n--- 5. pyproject.toml 示例（现代标准）---")
pyproject_example = """[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "my-awesome-project"
version = "0.1.0"
description = "一个很棒的Python项目"
readme = "README.md"
requires-python = ">=3.10"
license = {text = "MIT"}
dependencies = [
    "flask>=2.3",
    "requests>=2.28",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0",
    "black",
    "mypy",
]
"""
print(pyproject_example)

print("--- 6. 检查标准库模块（无需安装）---")
stdlib_modules = ["os", "sys", "json", "math", "datetime", "collections", "pathlib"]
for mod_name in stdlib_modules:
    spec = importlib.util.find_spec(mod_name)
    status = "✓" if spec else "✗"
    print(f"  {status} {mod_name}")

print("\\n=== 依赖管理最佳实践 ===")
print("1. 永远用虚拟环境，不要全局pip install")
print("2. requirements.txt 区分生产(dev.txt/prod.txt)")
print("3. 版本号要么精确锁定(==)，要么用兼容(~=)")
print("4. pip freeze > requirements.txt 不要直接用（会包含无关包）")
print("5. 新项目推荐用 Poetry 或 PDM 管理依赖")
print("6. Python版本也要指定(requires-python)")
print("7. 国内pip慢? 配置清华/阿里镜像源")
print("8. 标准库能做的事，尽量不用第三方包")
`,
  },
  {
    id: "py6-pep8",
    group: "工程实战",
    icon: "📏",
    title: "PEP8编码规范",
    content: `## PEP8编码规范（缩进/行宽/命名/空行/导入/flake8概念）

### 什么是PEP8？
PEP8是Python官方的编码风格指南（Python Enhancement Proposal #8），统一代码风格，让Python代码更易读、更一致。

### 核心规范

#### 缩进
- **4个空格**缩进（绝对不要用Tab）
- 续行与括号内元素对齐

#### 行宽
- 每行最大 **79字符**（代码）/ **72字符**（文档字符串/注释）
- 太长就换行，用括号隐式换行

#### 空行
- 顶层函数/类定义之间：**2个空行**
- 类内方法之间：**1个空行**
- 逻辑段落之间：1个空行分隔

#### 命名规范
| 类型 | 风格 | 示例 |
|------|------|------|
| 变量/函数/方法 | snake_case | user_name, get_data() |
| 类/异常 | PascalCase | UserProfile, ValueError |
| 常量 | UPPER_SNAKE_CASE | MAX_SIZE, DEFAULT_TIMEOUT |
| 受保护属性 | _single_leading_underscore | _internal_method |
| 私有属性 | __double_leading | __private_attr |
| 模块 | snake_case 短名 | utils.py, db_helper.py |
| 包 | 短名全小写 | models, views |

#### 导入
- 分行导入，不要一行import多个模块
- 顺序：标准库 → 第三方库 → 本地模块
- 每组之间空一行
- 避免 \`from module import *\`

#### 空格
- 运算符两边各一个空格：\`a = b + c\`
- 逗号/冒号/分号后空格，前不要
- 括号内侧不要空格：\`func(arg1, arg2)\`
- 关键字参数/默认值=两边不加空格：\`def func(x=1)\`

### 检查工具
- **flake8**：PEP8检查+代码复杂度
- **black**：自动格式化（不用纠结格式）
- **isort**：自动整理import
- **pylint**：更全面的代码检查`,
    code: `print("=== PEP8 编码规范演示 ===\\n")

print("--- 1. 正确 vs 错误 对照 ---")
print("""
【缩进】4个空格，不用Tab
  ✓ def my_function():
  ✓     result = 1 + 2
  ✗ def my_function():
  ✗   result = 1 + 2    # 2空格
  ✗     result = 1 + 2  # Tab或混合

【行宽】79字符，超长换行
  ✓ long_string = (
  ✓     "这是一个很长的字符串，"
  ✓     "分成多行写更清晰"
  ✓ )
  ✗ x = very_long_function_name(argument_one, argument_two, argument_three, argument_four)

【空行】
  class MyClass:

      def method_one(self):
          pass

      def method_two(self):
          pass


  def top_level_function():
      pass


  def another_function():
      pass
""")

print("--- 2. 命名规范 ---")
print("""
变量/函数: snake_case (小写下划线)
  ✓ user_name, calculate_total(), is_valid
  ✗ userName, CalculateTotal, isvalid

类名: PascalCase (大驼峰)
  ✓ class UserProfile:
  ✓ class HTTPServer:
  ✗ class user_profile:
  ✗ class userProfile:

常量: UPPER_SNAKE_CASE (全大写下划线)
  ✓ MAX_RETRY_COUNT = 3
  ✓ DEFAULT_TIMEOUT = 30
  ✗ MaxRetry = 3
  ✗ maxRetry = 3

私有属性: 下划线开头（约定，非强制）
  ✓ self._internal_cache = {}
  ✓ self.__private_data = None
""")

print("--- 3. 导入规范 ---")
print("""
正确导入（分组+顺序）:
  import os                # 标准库
  import sys
  from datetime import datetime

  import requests          # 第三方库
  import flask

  from myapp import models # 本地模块
  from .utils import helper

错误导入:
  ✗ import os, sys, json   # 一行多个
  ✗ from module import *   # 通配符导入
  ✗ import requests        # 顺序乱，标准库和第三方混
  ✗ import os
""")

print("--- 4. 空格规范 ---")
print("""
运算符两边空格:
  ✓ x = a + b
  ✓ result = (x - y) * z
  ✗ x=a+b
  ✗ x = a+b

逗号/冒号后空格:
  ✓ func(arg1, arg2, arg3)
  ✓ {"key": "value"}
  ✗ func(arg1,arg2,arg3)

括号内侧不要空格:
  ✓ func(1, 2)
  ✓ my_list[0]
  ✗ func( 1, 2 )
  ✗ my_list[ 0 ]

关键字参数=不加空格:
  ✓ def func(x=1, y=2):
  ✗ def func(x = 1, y = 2):
""")

print("--- 5. 代码检查工具 ---")
print("""
flake8 (检查PEP8违规):
  pip install flake8
  flake8 myfile.py
  flake8 myproject/ --max-line-length=88

black (自动格式化，不用争论风格):
  pip install black
  black myfile.py
  black . --line-length=88

isort (自动整理import):
  pip install isort
  isort myfile.py

mypy (类型检查):
  pip install mypy
  mypy myfile.py

pylint (更全面检查):
  pip install pylint
  pylint myfile.py
""")

print("--- 6. PEP8 合规的示例代码 ---")

def calculate_factorial(n: int) -> int:
    """计算n的阶乘。

    Args:
        n: 非负整数

    Returns:
        n的阶乘值

    Raises:
        ValueError: 当n为负数时
    """
    if n < 0:
        raise ValueError("n必须是非负整数")
    if n <= 1:
        return 1
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result


class DataProcessor:
    """数据处理器类。"""

    MAX_BATCH_SIZE = 1000

    def __init__(self, data: list[int]):
        self._data = data
        self._processed = False

    def process(self) -> list[int]:
        """处理数据并返回结果。"""
        if self._processed:
            return self._data
        self._data = [x * 2 for x in self._data if x > 0]
        self._processed = True
        return self._data


fact5 = calculate_factorial(5)
print(f"5! = {fact5}")
processor = DataProcessor([1, -2, 3, -4, 5])
print(f"处理结果: {processor.process()}")

print("\\n=== PEP8 总结 ===")
print("1. 统一风格比风格本身更重要")
print("2. 4空格缩进，79行宽，snake_case命名")
print("3. 用black自动格式化，省掉风格争论")
print("4. flake8检查，CI中集成防止不规范代码")
print("5. 读PEP8原文: https://peps.python.org/pep-0008/")
print("6. Google Python风格指南也是很好的参考")
`,
  },
  {
    id: "py6-docstring",
    group: "工程实战",
    icon: "📄",
    title: "文档字符串",
    content: `## 文档字符串（三重引号/docstring风格/Google风格/reStructuredText风格/__doc__/help()）

### 什么是文档字符串（docstring）？
docstring 是模块、类、函数开头的字符串字面量，作为该对象的文档说明。可以通过 \`__doc__\` 属性访问，也可以被 \`help()\` 函数和IDE使用。

### docstring 位置
- 模块第一行（文件最顶部）
- 类定义后第一行
- 函数/方法定义后第一行

### 引号选择
- 推荐用 **三重双引号** \`"""..."""\`
- 单行或多行都适用

### 三种主流风格

#### 1. Google风格（推荐，最易读）
\`\`\`
"""简短描述。

详细描述（可选）。

Args:
    param1: 参数1说明
    param2: 参数2说明

Returns:
    返回值说明

Raises:
    异常类型: 什么情况下抛出
"""
\`\`\`

#### 2. reStructuredText风格（Sphinx默认）
\`\`\`
"""简短描述。

:param param1: 参数1说明
:param param2: 参数2说明
:return: 返回值说明
:raises ValueError: 异常说明
"""
\`\`\`

#### 3. NumPy风格（详细但冗长）
\`\`\`
"""简短描述。

详细描述。

Parameters
----------
param1 : type
    参数1说明
param2 : type
    参数2说明

Returns
-------
type
    返回值说明
"""
\`\`\`

### 访问文档
- \`obj.__doc__\`：直接访问docstring
- \`help(obj)\`：格式化显示帮助信息
- IDE悬停提示
- 文档生成工具（Sphinx/pdoc）自动生成API文档`,
    code: `print("=== 文档字符串（docstring）演示 ===\\n")

print("--- 1. __doc__ 属性和help() ---")

def simple_func():
    """这是一个简单的函数。"""
    pass

print(f"simple_func.__doc__ = {simple_func.__doc__!r}")

print("\\n--- 2. Google风格docstring ---")

def divide(a: float, b: float) -> float:
    """计算两个数的除法。

    实现了安全的除法运算，会检查除数是否为零。

    Args:
        a: 被除数
        b: 除数，不能为零

    Returns:
        a 除以 b 的结果，浮点数

    Raises:
        ValueError: 当 b 为零时抛出
    """
    if b == 0:
        raise ValueError("除数不能为零")
    return a / b

print("divide函数docstring:")
print(divide.__doc__)
print(f"divide(10, 2) = {divide(10, 2)}")

print("\\n--- 3. reStructuredText风格（Sphinx风格）---")

def get_user(user_id: int) -> dict:
    """根据ID获取用户信息。

    :param user_id: 用户唯一标识ID，必须为正整数
    :type user_id: int
    :return: 用户信息字典，包含name、email等字段
    :rtype: dict
    :raises ValueError: 当user_id无效时抛出

    示例::

        >>> user = get_user(1)
        >>> print(user["name"])
        张三
    """
    if user_id <= 0:
        raise ValueError("无效的用户ID")
    return {"id": user_id, "name": f"用户{user_id}", "email": f"user{user_id}@example.com"}

print("get_user函数docstring:")
print(get_user.__doc__)
user = get_user(1)
print(f"get_user(1) = {user}")

print("\\n--- 4. 类的docstring ---")

class ShoppingCart:
    """购物车类，管理用户选购的商品。

    支持添加、删除商品，计算总价，以及清空购物车。

    Attributes:
        items: 商品列表，每个元素是 (商品名, 单价, 数量) 元组
        currency: 货币单位，默认为人民币(CNY)

    Example:
        >>> cart = ShoppingCart()
        >>> cart.add("苹果", 5.0, 3)
        >>> cart.total()
        15.0
    """

    def __init__(self, currency: str = "CNY"):
        """初始化空购物车。

        Args:
            currency: 货币单位代码
        """
        self.items: list[tuple[str, float, int]] = []
        self.currency = currency

    def add(self, name: str, price: float, quantity: int = 1) -> None:
        """添加商品到购物车。

        Args:
            name: 商品名称
            price: 商品单价
            quantity: 购买数量，默认1
        """
        self.items.append((name, price, quantity))

    def total(self) -> float:
        """计算购物车总价。

        Returns:
            所有商品的总金额
        """
        return sum(price * qty for _, price, qty in self.items)

cart = ShoppingCart()
cart.add("苹果", 5.0, 3)
cart.add("香蕉", 3.0, 2)
print(f"购物车总价: {cart.total()} {cart.currency}")
print("\\nShoppingCart类docstring:")
print(ShoppingCart.__doc__)

print("--- 5. 模块docstring示例 ---")
print('''
模块docstring写在文件最开头，用三重引号：

"""
数据库工具模块。

提供数据库连接、查询、事务管理等通用功能。

Usage:
    from db_utils import Database
    db = Database("sqlite:///app.db")
    result = db.query("SELECT * FROM users")
"""
''')

print("--- 6. help() 函数演示 ---")
print("help(divide) 效果（截取）:")
print("-" * 50)
help(divide)
print("-" * 50)

print("\\n=== docstring 总结 ===")
print("1. 所有公共模块/类/函数都应该有docstring")
print("2. 推荐Google风格，最易读易写")
print("3. 用三重双引号\\"\\"\\"，不是三重单引号'''")
print("4. 首行简短总结，空行后详细说明")
print("5. 写清楚Args、Returns、Raises")
print("6. 最好包含使用示例")
print("7. help()和__doc__可查看文档")
print("8. Sphinx/pdoc可以从docstring生成HTML文档")
`,
  },
  {
    id: "py6-design-patterns",
    group: "工程实战",
    icon: "🎨",
    title: "常用设计模式",
    content: `## 常用设计模式（单例模式/工厂模式/策略模式/观察者模式——用Python代码演示）

### 什么是设计模式？
设计模式是针对软件设计中常见问题的可复用解决方案。不是代码，而是解决问题的模板和思想。

### Python中常见的设计模式

#### 1. 单例模式（Singleton）
确保一个类只有一个实例，提供全局访问点。
- 应用场景：配置管理、日志对象、数据库连接池
- Python实现：模块天然单例、\`__new__\`、元类、装饰器

#### 2. 工厂模式（Factory）
不直接new对象，而是通过工厂方法创建。
- 应用场景：对象创建逻辑复杂、根据条件创建不同对象
- 简单工厂、工厂方法、抽象工厂

#### 3. 策略模式（Strategy）
定义一系列算法，封装每个算法，使它们可以互换。
- 应用场景：多种算法/策略切换、替代大量if-else
- Python天然支持（函数是一等公民）

#### 4. 观察者模式（Observer）
定义对象间一对多依赖，一个对象状态变化时通知所有依赖者。
- 应用场景：事件系统、消息通知、MVC的数据更新
- 发布-订阅模式

#### 5. 责任链模式（Chain of Responsibility）
将请求沿着处理者链传递，每个处理者决定处理或传给下一个。
- 应用场景：审批流程、中间件、异常处理链、过滤器

#### 6. 状态模式（State）
对象状态改变时改变其行为，看起来像换了类。
- 应用场景：订单状态机、游戏角色状态、TCP连接状态

#### 7. 命令模式（Command）
将请求封装成对象，支持撤销、队列、日志。
- 应用场景：GUI操作、事务、宏命令、任务队列

### Python实现设计模式的优势
- 函数是一等对象，很多模式可以更简洁
- 鸭子类型不需要抽象接口
- 装饰器、元类、dunder方法让实现更优雅
- 很多模式Python已经内置了（如迭代器模式）`,
    code: `from abc import ABC, abstractmethod
from typing import Any

print("=== Python设计模式演示 ===\\n")

print("--- 1. 单例模式（Singleton）---")
class Singleton:
    """确保类只有一个实例"""
    _instance = None  # 类属性，存储唯一实例

    # __new__ 负责创建实例，重写它来控制只创建一次
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            # 首次调用：用 super().__new__ 创建实例
            cls._instance = super().__new__(cls)
            cls._instance.initialized = False
        # 后续调用：直接返回已存在的实例
        return cls._instance

    def __init__(self, value=None):
        # __init__ 每次实例化都会调用，需用 initialized 标记防止重复初始化
        if not self.initialized:
            self.value = value
            self.initialized = True

s1 = Singleton("第一次创建的值")
s2 = Singleton("第二次创建（不会生效）")
print(f"s1 is s2: {s1 is s2}")
print(f"s1.value = {s1.value}")
print(f"s2.value = {s2.value}（同一个实例）")

print("\\n--- 2. 简单工厂模式（Factory）---")
class Animal(ABC):
    @abstractmethod
    def speak(self):
        pass

class Dog(Animal):
    def speak(self):
        return "汪汪！"

class Cat(Animal):
    def speak(self):
        return "喵~"

class AnimalFactory:
    """动物工厂：根据类型创建动物"""
    _animals = {"dog": Dog, "cat": Cat}

    @classmethod
    def create(cls, animal_type: str) -> Animal:
        animal_class = cls._animals.get(animal_type.lower())
        if not animal_class:
            raise ValueError(f"未知动物类型: {animal_type}")
        return animal_class()

dog = AnimalFactory.create("dog")
cat = AnimalFactory.create("cat")
print(f"狗: {dog.speak()}")
print(f"猫: {cat.speak()}")

print("\\n--- 3. 策略模式（Strategy）---")
class SortStrategy(ABC):
    @abstractmethod
    def sort(self, data: list[int]) -> list[int]:
        pass

class BubbleSort(SortStrategy):
    def sort(self, data):
        arr = data.copy()
        n = len(arr)
        for i in range(n):
            for j in range(0, n - i - 1):
                if arr[j] > arr[j + 1]:
                    arr[j], arr[j + 1] = arr[j + 1], arr[j]
        return arr

class QuickSort(SortStrategy):
    def sort(self, data):
        if len(data) <= 1:
            return data.copy()
        pivot = data[len(data) // 2]
        left = [x for x in data if x < pivot]
        middle = [x for x in data if x == pivot]
        right = [x for x in data if x > pivot]
        return self.sort(left) + middle + self.sort(right)

class PythonSort(SortStrategy):
    def sort(self, data):
        return sorted(data)

class Sorter:
    """使用策略的上下文类"""
    def __init__(self, strategy: SortStrategy):
        self._strategy = strategy

    def set_strategy(self, strategy: SortStrategy):
        self._strategy = strategy

    def sort(self, data):
        return self._strategy.sort(data)

data = [5, 2, 8, 1, 9]
sorter = Sorter(BubbleSort())
print(f"冒泡排序: {sorter.sort(data)}")
sorter.set_strategy(QuickSort())
print(f"快速排序: {sorter.sort(data)}")
sorter.set_strategy(PythonSort())
print(f"内置sorted: {sorter.sort(data)}")

print("\\n--- 4. 观察者模式（Observer / 发布-订阅）---")
class Subject:
    """被观察的主题（发布者）"""
    def __init__(self):
        self._observers: list = []
        self._state = None

    def attach(self, observer):
        self._observers.append(observer)

    def detach(self, observer):
        self._observers.remove(observer)

    def notify(self):
        for observer in self._observers:
            observer.update(self._state)

    def set_state(self, state):
        self._state = state
        self.notify()

class Observer(ABC):
    @abstractmethod
    def update(self, state):
        pass

class Logger(Observer):
    def update(self, state):
        print(f"  [Logger] 状态变更为: {state}")

class AlertSystem(Observer):
    def update(self, state):
        if isinstance(state, (int, float)) and state > 80:
            print(f"  [Alert] 警告！数值{state}超过阈值80!")
        else:
            print(f"  [Alert] 状态正常: {state}")

class Display(Observer):
    def update(self, state):
        print(f"  [Display] 当前显示: ===== {state} =====")

subject = Subject()
logger = Logger()
alert = AlertSystem()
display = Display()

subject.attach(logger)
subject.attach(alert)
subject.attach(display)

print("设置状态为 50:")
subject.set_state(50)
print("\\n设置状态为 95:")
subject.set_state(95)

print("\\n--- 5. 责任链模式（Chain of Responsibility）---")
# 责任链：请求沿处理者链传递，每个处理者决定处理或传给下一个
class Handler(ABC):
    """处理者基类，维护下一个处理者的引用"""
    def __init__(self):
        self._next = None

    def set_next(self, handler):
        # 设置下一个处理者，返回 handler 以便链式调用
        self._next = handler
        return handler

    @abstractmethod
    def handle(self, request):
        pass

class AuthHandler(Handler):
    """认证处理者"""
    def handle(self, request):
        if not request.get("token"):
            print(f"  [Auth] 拒绝：缺少 token")
            return False
        print(f"  [Auth] 认证通过")
        # 传递给下一个处理者
        if self._next:
            return self._next.handle(request)
        return True

class LogHandler(Handler):
    """日志处理者"""
    def handle(self, request):
        print(f"  [Log] 记录请求: {request.get('action')}")
        if self._next:
            return self._next.handle(request)
        return True

class RateLimitHandler(Handler):
    """限流处理者"""
    def handle(self, request):
        if request.get("count", 0) > 100:
            print(f"  [RateLimit] 拒绝：请求过于频繁")
            return False
        print(f"  [RateLimit] 限流通过")
        if self._next:
            return self._next.handle(request)
        return True

# 组装责任链：Auth -> Log -> RateLimit
auth = AuthHandler()
log = LogHandler()
rate = RateLimitHandler()
auth.set_next(log).set_next(rate)

print("请求1（正常）:")
result1 = auth.handle({"token": "abc", "action": "query", "count": 5})
print(f"  最终结果: {result1}")

print("\\n请求2（无 token）:")
result2 = auth.handle({"action": "query", "count": 5})
print(f"  最终结果: {result2}")

print("\\n--- 6. 状态模式（State）---")
# 状态模式：对象状态改变时行为也改变，像换了一个类
class OrderState(ABC):
    """订单状态基类"""
    @abstractmethod
    def next(self, order):
        pass

    @abstractmethod
    def cancel(self, order):
        pass

class NewOrder(OrderState):
    """新建状态"""
    def next(self, order):
        print("  新建 -> 已付款")
        order.set_state(PaidOrder())
    def cancel(self, order):
        print("  新建订单已取消")

class PaidOrder(OrderState):
    """已付款状态"""
    def next(self, order):
        print("  已付款 -> 已发货")
        order.set_state(ShippedOrder())
    def cancel(self, order):
        print("  已付款订单取消，退款中")

class ShippedOrder(OrderState):
    """已发货状态"""
    def next(self, order):
        print("  已发货 -> 已完成")
        order.set_state(CompletedOrder())
    def cancel(self, order):
        print("  已发货无法取消，需走退货流程")

class CompletedOrder(OrderState):
    """已完成状态"""
    def next(self, order):
        print("  订单已完成，无法继续推进")
    def cancel(self, order):
        print("  已完成订单无法取消")

class Order:
    """订单上下文，持有当前状态"""
    def __init__(self):
        self._state = NewOrder()
    def set_state(self, state):
        self._state = state
    def next(self):
        self._state.next(self)
    def cancel(self):
        self._state.cancel(self)

print("订单流程演示:")
order = Order()
order.next()  # 新建 -> 已付款
order.next()  # 已付款 -> 已发货
order.next()  # 已发货 -> 已完成
order.next()  # 已完成，无法推进

print("\\n--- 7. 命令模式（Command）---")
# 命令模式：把请求封装成对象，支持撤销、队列
class Command(ABC):
    """命令基类"""
    @abstractmethod
    def execute(self):
        pass

    @abstractmethod
    def undo(self):
        pass

class Light:
    """接收者：电灯"""
    def turn_on(self):
        print("  💡 灯亮了")
    def turn_off(self):
        print("  💡 灯灭了")

class LightOnCommand(Command):
    """开灯命令"""
    def __init__(self, light):
        self.light = light
    def execute(self):
        self.light.turn_on()
    def undo(self):
        self.light.turn_off()

class LightOffCommand(Command):
    """关灯命令"""
    def __init__(self, light):
        self.light = light
    def execute(self):
        self.light.turn_off()
    def undo(self):
        self.light.turn_on()

class RemoteControl:
    """调用者：遥控器，支持撤销"""
    def __init__(self):
        self._history = []
    def execute_command(self, cmd):
        cmd.execute()
        self._history.append(cmd)
    def undo_last(self):
        if self._history:
            cmd = self._history.pop()
            print("  撤销上一步:")
            cmd.undo()

light = Light()
remote = RemoteControl()
on_cmd = LightOnCommand(light)
off_cmd = LightOffCommand(light)

print("执行命令:")
remote.execute_command(on_cmd)   # 开灯
remote.execute_command(off_cmd)  # 关灯
print("\\n撤销:")
remote.undo_last()  # 撤销关灯 -> 开灯
remote.undo_last()  # 撤销开灯 -> 关灯

print("\\n=== 设计模式总结 ===")
print("1. 单例：一个类只有一个实例（模块、__new__、元类）")
print("2. 工厂：创建对象交给工厂，解耦创建和使用")
print("3. 策略：算法封装可互换，消灭大量if-else")
print("4. 观察者：事件通知机制，一对多更新")
print("5. 责任链：请求沿处理者链传递，中间件/审批流常用")
print("6. 状态：状态改变时行为也变，订单状态机典型应用")
print("7. 命令：请求封装成对象，支持撤销/队列/日志")
print("8. Python实现模式更简洁：函数/装饰器/dunder")
print("9. 不要过度设计，简单问题不需要模式")
print("10. Python中很多模式被语言特性内置了")
print("   - 迭代器模式 → for循环天然支持")
print("   - 装饰器模式 → @decorator语法糖")
print("   - 上下文管理器 → with语句")
`,
  },
  {
    id: "py6-performance-tips",
    group: "工程实战",
    icon: "🚀",
    title: "Python性能优化技巧",
    content: `## Python性能优化技巧（局部变量/生成器/join拼接/避免点号操作/内置函数/算法选择）

### 优化原则
1. **先测量再优化**：不要猜哪里慢，用cProfile找热点
2. **优化热点代码**：90%时间花在10%代码上
3. **优先优化算法**：O(n²)改O(n)比微优化重要100倍
4. **可读性优先**：优化后代码不要变得难维护
5. **考虑换实现**：CPython慢？试试PyPy/C扩展

### 具体优化技巧

#### 局部变量更快
局部变量访问比全局变量/属性快，循环内频繁访问的先赋值给局部变量。

#### 用生成器省内存
处理大数据时用生成器/迭代器，不要一次性构造大列表。

#### 字符串拼接用join
\`"".join(list)\` 比 \`+= \` 拼接快很多（尤其是大量拼接）。

#### 减少点号操作
\`obj.attr.method()\` 每次都有查找开销，循环内先缓存到局部变量。

#### 优先用内置函数/数据结构
内置函数是C实现的，比纯Python循环快得多：\`map()\`、\`filter()\`、\`sum()\`、\`any()\`、\`all()\`、\`set\`去重查找。

#### 选择正确的数据结构
- 频繁查找/去重用 \`set\` / \`dict\`（O(1)）
- 不要用 \`list\` 做频繁的 in 判断（O(n)）
- 两端操作用 \`collections.deque\`（O(1)）

#### 列表推导/生成器表达式
比 for+append 快，也更简洁。

#### 避免不必要的抽象
过度的类层次、属性包装、函数调用会增加开销。`,
    code: `import timeit
import math

print("=== Python性能优化技巧演示 ===\\n")

print("--- 1. 局部变量 vs 全局变量/属性 ---")
# 原理：局部变量用 LOAD_FAST 指令（数组索引），全局/属性用 LOAD_GLOBAL/LOAD_ATTR（字典查找），慢得多
GLOBAL_CONST = 3.14159

class SlowDemo:
    def __init__(self):
        self.value = 2.71828

    def slow_method(self):
        """每次循环都查找self.value和math.sqrt"""
        total = 0
        for i in range(50000):
            # 每次循环都做属性查找 self.value 和模块查找 math.sqrt
            total += math.sqrt(i) * self.value + GLOBAL_CONST
        return total

    def fast_method(self):
        """缓存到局部变量"""
        total = 0
        # 循环前把全局/属性缓存到局部变量，循环内用 LOAD_FAST 访问
        sqrt = math.sqrt
        v = self.value
        g = GLOBAL_CONST
        for i in range(50000):
            total += sqrt(i) * v + g
        return total

demo = SlowDemo()
t_slow = timeit.timeit(demo.slow_method, number=50)
t_fast = timeit.timeit(demo.fast_method, number=50)
print(f"不缓存属性/全局: {t_slow*1000:.1f}ms")
print(f"缓存到局部变量: {t_fast*1000:.1f}ms")
print(f"提升: {t_slow/t_fast:.1f}x")

print("\\n--- 2. 字符串拼接 + vs join ---")
# 原理：字符串不可变，+= 每次都创建新对象；join 一次性分配内存
def concat_plus():
    s = ""
    for i in range(2000):
        s += str(i)  # 每次拼接都创建新字符串，O(n²) 复杂度
    return s

def concat_join():
    # join 先计算总长度，一次分配，O(n) 复杂度
    return "".join(str(i) for i in range(2000))

t_plus = timeit.timeit(concat_plus, number=200)
t_join = timeit.timeit(concat_join, number=200)
print(f"+= 拼接: {t_plus*1000:.1f}ms")
print(f"join拼接: {t_join*1000:.1f}ms")
print(f"join快: {t_plus/t_join:.1f}x")

print("\\n--- 3. 列表推导 vs for+append ---")
def for_append():
    result = []
    for i in range(10000):
        if i % 3 == 0:
            result.append(i ** 2)
    return result

def list_comp():
    return [i ** 2 for i in range(10000) if i % 3 == 0]

t_for = timeit.timeit(for_append, number=200)
t_lc = timeit.timeit(list_comp, number=200)
print(f"for+append: {t_for*1000:.1f}ms")
print(f"列表推导:   {t_lc*1000:.1f}ms")
print(f"列表推导快: {t_for/t_lc:.1f}x")

print("\\n--- 4. set/dict查找 vs list查找 ---")
# 原理：set/dict 基于哈希表，in 查找是 O(1)；list 是顺序遍历，in 查找是 O(n)
big_list = list(range(10000))
big_set = set(big_list)

def list_lookup():
    count = 0
    for i in range(100):
        # list 的 in 操作要遍历整个列表，最坏 O(n)
        if 9999 - i in big_list:
            count += 1
    return count

def set_lookup():
    count = 0
    for i in range(100):
        # set 的 in 操作用哈希直接定位，O(1)
        if 9999 - i in big_set:
            count += 1
    return count

t_ll = timeit.timeit(list_lookup, number=50)
t_sl = timeit.timeit(set_lookup, number=50)
print(f"list in查找(O(n)): {t_ll*1000:.1f}ms")
print(f"set  in查找(O(1)): {t_sl*1000:.1f}ms")
print(f"set查找快: {t_ll/t_sl:.0f}x (列表越大差距越大!)")

print("\\n--- 5. 内置函数 vs 手动循环 ---")
# 原理：内置函数 sum/map 等是 C 实现的，没有 Python 字节码开销
def manual_sum():
    total = 0
    for i in range(10000):
        total += i  # 每次循环都有 Python 解释器开销
    return total

def builtin_sum():
    return sum(range(10000))  # C 层循环，无解释器开销

t_manual = timeit.timeit(manual_sum, number=500)
t_builtin = timeit.timeit(builtin_sum, number=500)
print(f"手动sum循环: {t_manual*1000:.1f}ms")
print(f"内置sum():   {t_builtin*1000:.1f}ms")
print(f"内置快: {t_manual/t_builtin:.1f}x")

print("\\n--- 6. 生成器省内存（不省时间，但适合大数据）---")
# 原理：生成器惰性求值，不预分配全部元素；列表一次性分配所有内存
import sys
list_comp = [i * 2 for i in range(1000000)]
gen_exp = (i * 2 for i in range(1000000))
print(f"列表推导内存: {sys.getsizeof(list_comp)/1024/1024:.1f} MB")
print(f"生成器表达式内存: {sys.getsizeof(gen_exp)} bytes")
print(f"（生成器惰性计算，内存占用极小）")

print("\\n--- 7. 算法优化最重要 ---")
# 原理：算法复杂度 O(n²) vs O(n) 的差距随数据量增大而急剧拉大
def has_duplicate_slow(lst):
    """O(n²) 暴力检查"""
    for i in range(len(lst)):
        for j in range(i + 1, len(lst)):
            if lst[i] == lst[j]:
                return True
    return False

def has_duplicate_fast(lst):
    """O(n) 用set"""
    return len(set(lst)) < len(lst)

test_data = list(range(5000)) + [42]
t_dup_slow = timeit.timeit(lambda: has_duplicate_slow(test_data), number=10)
t_dup_fast = timeit.timeit(lambda: has_duplicate_fast(test_data), number=10)
print(f"O(n²)双重循环检查重复: {t_dup_slow*1000:.1f}ms")
print(f"O(n) set去重检查重复: {t_dup_fast*1000:.3f}ms")
print(f"算法优化快: {t_dup_slow/t_dup_fast:.0f}x!")

print("\\n=== Python性能优化总结 ===")
print("1. 先profile找瓶颈，不要瞎优化")
print("2. 算法/数据结构优化 >> 微观优化")
print("3. 局部变量缓存：循环内把global/self.xxx赋值给局部")
print("4. 字符串拼接永远用join，不要+=")
print("5. 查找/去重用set/dict，不要用list做in判断")
print("6. 优先用内置函数sum/map/any/all/zip")
print("7. 列表推导比for+append快且简洁")
print("8. 大数据用生成器/迭代器省内存")
print("9. 还不够快？考虑PyPy/Cython/C扩展/asyncio")
print("10. 不要为了性能牺牲可读性！")
`,
  },
  {
    id: "py6-common-pitfalls",
    group: "工程实战",
    icon: "⚠️",
    title: "常见坑点与避坑指南",
    content: `## 常见坑点与避坑指南（可变默认参数/浮点数精度/浅拷贝深拷贝/GIL坑/循环引用/闭包变量捕获/整数缓存）

### Python 新手常踩的坑

#### 1. 可变默认参数
函数默认参数在定义时求值一次，不是每次调用时创建。用可变对象(list/dict/set)做默认参数会记住上次调用的状态！

**修复**：默认参数用None，函数内判断创建。

#### 2. 浮点数精度问题
二进制浮点数无法精确表示0.1等十进制小数。

**修复**：比较用近似（abs(a-b)<epsilon），金融计算用decimal模块。

#### 3. 浅拷贝vs深拷贝
\`list.copy()\`、\`[:]\`、\`dict.copy()\` 只拷贝一层，嵌套对象仍然共享引用！

**修复**：嵌套结构用\`copy.deepcopy()\`。

#### 4. 整数缓存
Python缓存小整数(-5~256)，is比较会True，但大整数is不一定相等。

**记住**：值比较用\`==\`，身份比较用\`is\`，整数/字符串比较永远用\`==\`。

#### 5. 闭包变量捕获
循环中创建lambda/闭包时，变量是后期绑定的，不是创建时绑定。

**修复**：用默认参数捕获当前值。

#### 6. 循环引用
对象互相引用导致垃圾回收不及时，可能内存泄漏。

#### 7. 修改列表时遍历列表
遍历list时删除元素会导致索引错乱。

**修复**：遍历副本，或从后往前删。

#### 8. GIL坑
CPU密集多线程不加速，用多进程。

#### 9. 异常捕获过于宽泛
\`except:\` 会捕获包括KeyboardInterrupt在内的所有异常。

**修复**：捕获具体异常类型。

#### 10. \`__del__\` 与循环引用
有\`__del__\`的对象循环引用会导致无法回收。`,
    code: `import copy
import decimal

print("=== Python常见坑点与避坑指南 ===\\n")

print("--- 坑1：可变默认参数 ---")
def wrong_append(item, lst=[]):
    """错误：默认列表在函数定义时只创建一次"""
    lst.append(item)
    return lst

print("错误写法结果:")
print(f"  第一次调用: {wrong_append(1)}")
print(f"  第二次调用: {wrong_append(2)}")
print(f"  第三次调用: {wrong_append(3)}")
print("  （列表记住了之前的调用！）")

def right_append(item, lst=None):
    """正确：用None做默认值"""
    if lst is None:
        lst = []
    lst.append(item)
    return lst

print("正确写法结果:")
print(f"  第一次调用: {right_append(1)}")
print(f"  第二次调用: {right_append(2)}")
print(f"  第三次调用: {right_append(3)}")

print("\\n--- 坑2：浮点数精度 ---")
print(f"0.1 + 0.2 = {0.1 + 0.2}")
print(f"0.1 + 0.2 == 0.3 ? {0.1 + 0.2 == 0.3}")
print("这不是bug！是二进制浮点数表示限制")

epsilon = 1e-10
print(f"用近似比较: abs(0.1+0.2 - 0.3) < epsilon → {abs(0.1 + 0.2 - 0.3) < epsilon}")

d1 = decimal.Decimal("0.1")
d2 = decimal.Decimal("0.2")
print(f"Decimal精确计算: {d1} + {d2} = {d1 + d2}")

print("\\n--- 坑3：浅拷贝 vs 深拷贝 ---")
original = [[1, 2], [3, 4]]
shallow = original.copy()
shallow[0][0] = 99
print(f"浅拷贝修改嵌套元素，原对象也变: original = {original}")

original2 = [[1, 2], [3, 4]]
deep = copy.deepcopy(original2)
deep[0][0] = 99
print(f"深拷贝完全独立: original2 = {original2}, deep = {deep}")

print("\\n--- 坑4：整数缓存 is vs == ---")
a = 256
b = 256
print(f"a=256, b=256, a is b = {a is b}（小整数缓存）")
# 注意：直接写 c = 257; d = 257 时，CPython 会做常量折叠让两者指向同一对象，
# 导致 c is d 错误地为 True。用 int("257") 在运行时构造，才能正确演示大整数不缓存。
c = int("257")
d = int("257")
print(f"c=257, d=257, c is d = {c is d}（大整数不缓存！）")
print(f"c == d = {c == d}（值比较永远用==）")
print("规则：值比较用 == ， 判断是否同一对象（None/True/False/sentinel）用 is")

print("\\n--- 坑5：闭包变量捕获（late binding）---")
# 原理：闭包捕获的是变量的"引用"而非"值"，调用时才查找 i 的当前值
def wrong_multipliers():
    """错误写法"""
    funcs = []
    for i in range(3):
        # lambda 捕获的是变量 i 的引用，不是当时的值
        funcs.append(lambda x: x * i)
    return funcs
# 循环结束后 i = 2，所以所有 lambda 调用时都用 2

funcs_wrong = wrong_multipliers()
print("错误闭包结果:")
for f in funcs_wrong:
    print(f"  f(2) = {f(2)}", end="")
print("（都乘以2，因为i最终是2）")

def right_multipliers():
    """正确写法：用默认参数捕获当前值"""
    funcs = []
    for i in range(3):
        # i=i 把当前 i 值绑定为默认参数，每次循环都保存一份
        funcs.append(lambda x, i=i: x * i)
    return funcs

funcs_right = right_multipliers()
print("正确闭包结果（默认参数捕获）:")
for i, f in enumerate(funcs_right):
    print(f"  第{i}个f(2) = {f(2)}")

print("\\n--- 坑6：遍历列表时删除元素 ---")
numbers = [1, 2, 3, 4, 5, 6]
print(f"原列表: {numbers}")

wrong_result = []
for num in numbers[:]:
    if num % 2 == 0:
        wrong_result.append(num)
print(f"遍历副本删除（正确）: 偶数 = {wrong_result}")

nums = [1, 2, 3, 4, 5, 6]
filtered = [n for n in nums if n % 2 == 0]
print(f"列表推导更好: {filtered}")

print("\\n--- 坑7：过于宽泛的异常捕获 ---")
print("""
错误写法（会捕获KeyboardInterrupt，Ctrl+C都无法退出）:
try:
    risky_operation()
except:              # 等同于 except BaseException
    pass

正确写法:
try:
    risky_operation()
except (ValueError, IOError) as e:  # 捕获具体异常
    log.error(f"操作失败: {e}")
except Exception as e:              # 宽泛的Exception也应谨慎
    log.error(f"未知错误: {e}")
""")

print("--- 坑8：字典/集合遍历时修改大小 ---")
print("""
d = {"a": 1, "b": 2}
for k in d:         # RuntimeError: dictionary changed size during iteration
    del d[k]

正确：遍历副本
for k in list(d.keys()):
    del d[k]
""")

print("\\n--- 坑9：字符串不可变 ---")
s = "hello"
print(f"s = 'hello', id(s) = {id(s)}")
s += " world"
print(f"s += 'world' 后, id(s) = {id(s)}（创建了新字符串！）")
print("大量字符串拼接务必用join，不要+=")

print("\\n--- 坑10：循环导入 ---")
print("""
a.py:
  from b import func_b
  def func_a(): ...

b.py:
  from a import func_a  # 循环导入！ImportError
  def func_b(): ...

解决方法:
1. 重构代码，提取公共部分到c.py
2. 在函数内局部导入（不推荐）
3. 合并模块
""")

print("\\n=== 避坑指南总结 ===")
print("1. 可变默认参数用None")
print("2. 浮点数比较用近似，精确计算用decimal")
print("3. 嵌套拷贝用deepcopy")
print("4. 整数/字符串比较用==，不是is")
print("5. 闭包循环变量用默认参数捕获")
print("6. 遍历列表/字典时不要增删，遍历副本")
print("7. except捕获具体异常，不要裸except")
print("8. 大量字符串拼接用join")
print("9. CPU密集用多进程，不是多线程（GIL）")
print("10. 多看官方文档的Wart部分，多踩坑就记住了")
`,
  },
];
