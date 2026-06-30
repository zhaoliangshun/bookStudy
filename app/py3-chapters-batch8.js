// =============================================================
// 第八批章节（现代特性 3.10-3.13，4 章）
// 29. structural-pattern  match-case 高级模式：类、映射、guard
// 30. pep-695            PEP 695 类型参数语法（class X[T] / func T）
// 31. exception-groups   ExceptionGroup / except*（3.11+）
// 32. py313              3.12-3.13 新特性总览：f-string 改进、REPL、jit
// =============================================================

export const chapters = [
  {
    id: "py3-structural-pattern",
    group: "现代特性",
    icon: "🧩",
    title: "match-case 高级模式：类 / 映射 / guard",
    content: `
# match-case 高级

- 模式可以匹配：**字面量**、**序列**、**映射**、**类对象**、**OR 模式**、**捕获**
- **guard**：\`case X if 条件:\`，加额外判断
- 捕获：\`case Point(x=a, y=b): ...\` 提取嵌套属性
- 映射模式：\`case {"action": "move", "x": x, "y": y}:\`
- **通配**：\`_\` 匹配但不绑定；\`_\` 前面可加变量名做 AS 模式：\`case Point() as p:\`
- 不像 switch：case 是顺序尝试，第一个匹配就执行
`,
    code: `from dataclasses import dataclass

@dataclass
class Point:
    x: int
    y: int

@dataclass
class Circle:
    center: Point
    radius: float

def describe(shape):
    match shape:
        # 1) 序列模式
        case [0, 0]:
            return "origin"
        case [x, 0]:
            return f"x-axis at {x}"
        case [0, y]:
            return f"y-axis at {y}"
        case [x, y]:
            return f"point ({x}, {y})"
        # 2) OR / 捕获
        case ["left" | "right" as direction, n]:
            return f"move {direction} by {n}"
        # 3) 类模式：捕获字段
        case Point(x=0, y=0):
            return "Point at origin"
        case Point(x=x, y=y) if x == y:
            return f"Point on diagonal ({x},{y})"
        case Point(x=x, y=y):
            return f"Point({x},{y})"
        # 4) 嵌套类模式
        case Circle(center=Point(x=0, y=0), radius=r):
            return f"circle centered at origin, r={r}"
        # 5) 映射模式
        case {"action": "echo", "msg": m}:
            return f"echo: {m}"
        case {"action": act, **rest}:
            return f"action={act}, rest={rest}"
        case _:
            return "unknown"

# 测试
shapes = [
    [0, 0],
    [3, 0],
    [5, 5],
    Point(0, 0),
    Point(2, 3),
    Point(4, 4),
    Circle(Point(0, 0), 5),
    ["left", 10],
    {"action": "echo", "msg": "hi"},
    {"action": "jump", "x": 1, "y": 2},
    "raw string",
]
for s in shapes:
    print(f"{s!r:55} -> {describe(s)}")
`,
  },

  {
    id: "py3-pep-695",
    group: "现代特性",
    icon: "🆕",
    title: "PEP 695：新的类型参数语法（3.12+）",
    content: `
# PEP 695：类型参数新语法（3.12+）

- 旧写法：\`class Stack(Generic[T]): ...\` / \`def first(xs: List[T]) -> T: ...\`
- 新写法：直接 \`class Stack[T]: ...\` / \`def first[T](xs: list[T]) -> T: ...\`
- **type 语句**（3.12+）：\`type Vector = list[float]\` 定义类型别名
- 优点：无需导入 Generic / TypeVar，更简洁；类型检查器能更好推断
- 旧写法仍然兼容
`,
    code: `# 1) class X[T]：类型参数直接写在类名
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

# 3) 类型边界：T 必须是 Number 的子类
from typing import TypeVar
# 旧：T = TypeVar("T", bound=int)
# 新：直接写 bound
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

# 5) 复杂类型：嵌套泛型
class Pair[K, V]:
    def __init__(self, key: K, value: V):
        self.key = key
        self.value = value
    def __repr__(self):
        return f"Pair({self.key!r}, {self.value!r})"

print(Pair("age", 30))
print(Pair[str, int]("score", 95))

# 6) 对比：旧写法仍然能用
from typing import Generic
class OldStack(Generic[T]):
    def __init__(self): self._items = []
    def push(self, x: T): self._items.append(x)
os: OldStack[str] = OldStack()
os.push("legacy")
print("old stack:", os._items)
`,
  },

  {
    id: "py3-exception-groups",
    group: "现代特性",
    icon: "🔥",
    title: "ExceptionGroup 与 except*（3.11+）",
    content: `
# ExceptionGroup（3.11+）

- **场景**：并发任务里多个协程/线程可能同时报错，传统 raise 一次只能报一个
- **ExceptionGroup**：把多个异常打包成一个组
- **BaseExceptionGroup**：所有异常的基类（包括 KeyboardInterrupt）
- **except***：同时捕获组里匹配的所有异常（而非第一个）
- **语法糖**：\`asyncio.TaskGroup\`（3.11+）自动用 ExceptionGroup
- 旧的 raise/except 仍然能用，ExceptionGroup 是补充
`,
    code: `# 1) 基本 ExceptionGroup
try:
    raise ExceptionGroup("多错误", [
        ValueError("bad value"),
        TypeError("bad type"),
        KeyError("missing"),
    ])
except* ValueError as eg:
    print("捕获到 ValueError 子组:", eg.exceptions)
except* (TypeError, KeyError) as eg:
    print("捕获到 TypeError/KeyError 子组:", eg.exceptions)

# 2) 拆解：subgroup
full = ExceptionGroup("outer", [
    ValueError("v1"),
    ExceptionGroup("inner", [ValueError("v2"), TypeError("t1")]),
    TypeError("t2"),
])
# 拆出所有 ValueError
val_sub = full.subgroup(ValueError)
print("val subgroup:", val_sub, "exceptions:", val_sub.exceptions)
# 拆出所有 TypeError
type_sub = full.subgroup(TypeError)
print("type subgroup:", type_sub, "exceptions:", type_sub.exceptions)
# 拆分到不能再拆
leaf = full.split(ValueError, TypeError)
print("split values:", leaf[0].exceptions)
print("split types:", leaf[1].exceptions)

# 3) TaskGroup：asyncio 自动用 ExceptionGroup 聚合
import asyncio

async def task(n):
    await asyncio.sleep(0.01)
    if n == 1: raise ValueError(f"task {n} failed")
    if n == 3: raise RuntimeError(f"task {n} crashed")
    return n

async def main_tg():
    results = []
    try:
        async with asyncio.TaskGroup() as tg:
            for i in range(5):
                tg.create_task(task(i))
                results.append(i)   # 创建 Task 不会立即跑
    except* ValueError as eg:
        print("TaskGroup ValueErrors:", [str(e) for e in eg.exceptions])
    except* RuntimeError as eg:
        print("TaskGroup RuntimeErrors:", [str(e) for e in eg.exceptions])

asyncio.run(main_tg())
print("after TaskGroup, results:", results)

# 4) BaseExceptionGroup：含 KeyboardInterrupt 等
try:
    raise BaseExceptionGroup("mixed", [ValueError("v"), KeyboardInterrupt()])
except* ValueError as eg:
    print("got value errs:", eg.exceptions)
except BaseExceptionGroup as eg:
    print("other base:", eg.exceptions)
`,
  },

  {
    id: "py3-py313",
    group: "现代特性",
    icon: "🚀",
    title: "Python 3.12-3.13 新特性速览",
    content: `
# Python 3.12 - 3.13 新特性速览

- **3.12**（2023-10）
  - PEP 695：\`class X[T]\` / \`def f[T]\` / \`type Vector = ...\`
  - PEP 701：f-string 语法形式化（可嵌套引号/多行表达式）
  - PEP 684：per-interpreter GIL（实验性）
  - 错误信息更精准：直接定位到具体表达式

- **3.13**（2024-10）
  - **实验性 JIT**（PEP 744） + **GIL 改进**
  - 新的交互式 REPL（PyREPL，多行编辑、语法高亮）
  - 弃用：\`dbm.gnu\`, \`ossaudiodev\`, \`tty\` 等老模块
  - 性能：解释器整体比 3.10 快 ~10-15%

- **3.14+** 展望
  - 自由线程模式（free-threaded）
  - 模板字符串 PEP 750
`,
    code: `import sys, platform

print(f"当前 Python: {sys.version.split()[0]}")
print(f"实现: {platform.python_implementation()}")
print(f"平台: {platform.system()} {platform.machine()}")
print(f"编译时间: {platform.python_build()[1]}")

# 1) PEP 701：f-string 改进（3.12+）
# 可以在 f-string 内重用同一引号、写多行表达式
names = ["alice", "bob", "carol"]
print(f"{{ 大括号: { {n: len(n) for n in names} } }}")  # 嵌套 f-string
# 字典推导直接放 f-string 里
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

# 3) 更好的错误信息（3.12+ 引入"精确定位"）
def divide(a, b):
    return a / b

try:
    print(divide(1, 0))
except ZeroDivisionError as e:
    print("err:", e)

# 4) tomllib 内置（3.11+）
toml_text = '''
[tool.demo]
name = "py3"
version = "0.1.0"
'''
try:
    import tomllib
    cfg = tomllib.loads(toml_text)
    print("tomllib:", cfg["tool"]["demo"])
except ImportError:
    print("Python < 3.11，没有内置 tomllib")

# 5) asyncio.TaskGroup（3.11+）
import asyncio
async def fetch(i, fail_at=None):
    await asyncio.sleep(0.01)
    if fail_at and i == fail_at:
        raise RuntimeError(f"failed at {i}")
    return i * 2

async def main():
    results = []
    try:
        async with asyncio.TaskGroup() as tg:
            for i in range(5):
                tg.create_task(fetch(i, fail_at=2))
    except* RuntimeError as eg:
        print("task group errors:", [str(e) for e in eg.exceptions])
    return results

asyncio.run(main())
print("done")
`,
  },
];
