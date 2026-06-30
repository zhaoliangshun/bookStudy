// =============================================================
// 第三批章节（进阶，4 章）
//  9. fileio              文本/二进制读写、with 语句、encoding
// 10. exceptions          try/except/else/finally、自定义异常
// 11. modules             导入、__name__、包、相对导入
// 12. oop                 class、继承、Magic Method、dataclass
// =============================================================

export const chapters = [
  {
    id: "py3-fileio",
    group: "进阶",
    icon: "📁",
    title: "文件 I/O：with / encoding / 二进制",
    content: `
# 文件 I/O

- **with open() as f**：自动关闭文件，强烈推荐
- 模式：\`r/w/a/x/b/+ \`（r 读、w 写覆盖、a 追加、x 创建、b 二进制、+ 读写）
- **encoding**：文本模式默认因系统而异，生产请显式 \`encoding="utf-8"\`
- 文本 vs 二进制：文本返回 str，二进制返回 bytes
- 常用方法：\`read/readline/readlines/write/writelines\`
- **pathlib.Path**（推荐）：面向对象的路径操作（详见 pathlib 章）
`,
    code: `import os, tempfile

# 1) with + encoding 写文本
with tempfile.TemporaryDirectory() as tmp:
    p = os.path.join(tmp, "demo.txt")
    with open(p, "w", encoding="utf-8") as f:
        f.write("第一行\\n")
        f.writelines(["第二行\\n", "第三行\\n"])

    # 2) 读文本
    with open(p, "r", encoding="utf-8") as f:
        print("read():", repr(f.read()))
    with open(p, "r", encoding="utf-8") as f:
        print("readlines():", f.readlines())

    # 3) 按行迭代（推荐，内存友好）
    with open(p, "r", encoding="utf-8") as f:
        for i, line in enumerate(f, 1):
            print(f"line {i}: {line.strip()}")

    # 4) 追加
    with open(p, "a", encoding="utf-8") as f:
        f.write("第四行\\n")

    # 5) 二进制读写
    with open(p, "rb") as f:
        data = f.read()
    print("bytes:", data[:10], "size:", len(data))

    # 6) seek / tell
    with open(p, "rb") as f:
        f.seek(0, 2)              # 移到末尾
        print("size via seek:", f.tell())
        f.seek(0)                 # 回到开头

print("done")
`,
  },

  {
    id: "py3-exceptions",
    group: "进阶",
    icon: "💥",
    title: "异常处理：try/except/finally、自定义",
    content: `
# 异常处理

- 基础：\`try / except / else / finally\`
- 多个 except：按类型捕获，从具体到宽泛
- \`else\`：无异常时执行；\`finally\`：无论是否异常都执行
- \`raise\`：主动抛异常；\`raise X from Y\`：链式异常
- \`assert\`：开发期断言，可通过 \`python -O\` 关闭
- **自定义异常**：继承 \`Exception\`
- **异常组** \`ExceptionGroup\`（3.11+）、\`except*\`（3.11+）见现代特性章
`,
    code: `# 基础 try/except/else/finally
def divide(a, b):
    try:
        result = a / b
    except ZeroDivisionError as e:
        print("除零错误:", e)
        return None
    except (TypeError, ValueError) as e:
        print("类型/值错误:", e)
        return None
    else:
        print("正常执行")
        return result
    finally:
        print("finally: 清理资源（如关闭文件）")

print(divide(10, 2))
print(divide(10, 0))

# 主动抛异常 + 链式
def parse_age(s):
    try:
        n = int(s)
        if n < 0:
            raise ValueError("age 不能为负")
        return n
    except ValueError as e:
        raise ValueError(f"解析 age 失败: {s!r}") from e

try:
    parse_age("-5")
except ValueError as e:
    print("caused by:", e.__cause__)

# 自定义异常
class InsufficientFundsError(Exception):
    def __init__(self, balance, amount):
        super().__init__(f"余额 {balance} 不足，需要 {amount}")
        self.balance = balance
        self.deficit = amount - balance

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFundsError(balance, amount)
    return balance - amount

try:
    withdraw(100, 200)
except InsufficientFundsError as e:
    print("异常:", e, "deficit:", e.deficit)

# 断言（开发期）
def sqrt(x):
    assert x >= 0, "x 必须非负"
    return x ** 0.5

print(sqrt(9))
# sqrt(-1)  # AssertionError: x 必须非负
`,
  },

  {
    id: "py3-modules",
    group: "进阶",
    icon: "📚",
    title: "模块与包：import、__name__、包结构",
    content: `
# 模块与包

- **模块**：一个 \`.py\` 文件
- **包**：含 \`__init__.py\` 的目录
- 导入：\`import m\`、\`from m import x\`、\`from m import x as y\`
- \`__name__\`：直接运行是 \`"__main__"\`，被导入是模块名
- \`if __name__ == "__main__":\` 保护代码只在直接运行时执行
- 标准库常用：\`os / sys / pathlib / json / re / datetime / collections / itertools\`
- 第三方包：\`pip install xxx\`，推荐用 venv / uv
`,
    code: `import sys, os, json
from pathlib import Path
from collections import Counter
from datetime import datetime, timedelta

# 1) 导入系统信息
print("Python:", sys.version.split()[0])
print("平台:", sys.platform)
print("CWD:", os.getcwd())

# 2) __name__ 演示（这里是主模块）
print("当前 __name__:", __name__)  # __main__

# 3) collections.Counter
words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
c = Counter(words)
print("Counter:", c, "most_common(2):", c.most_common(2))

# 4) datetime
now = datetime.now()
print("now:", now)
print("+7d:", now + timedelta(days=7))
print("iso:", now.isoformat(timespec="seconds"))

# 5) pathlib 路径操作
p = Path("/tmp") / "demo" / "file.txt"
print("path:", p, "suffix:", p.suffix, "parts:", p.parts)

# 6) json（标准库）
data = {"name": "alice", "scores": [90, 85, 92]}
s = json.dumps(data, ensure_ascii=False, indent=2)
print("json:", s)
print("parse:", json.loads(s)["name"])
`,
  },

  {
    id: "py3-oop",
    group: "进阶",
    icon: "🧱",
    title: "面向对象：class / 继承 / 魔术方法 / dataclass",
    content: `
# 面向对象

- 定义：\`class Name: ...\`，方法第一个参数永远是 \`self\`
- \`__init__\`: 构造函数；\`__repr__\`: 调试字符串；\`__str__\`: 用户字符串
- **继承**：\`class Sub(Base): ...\`，用 \`super().__init__()\` 调用父类
- **多重继承** 与 **MRO**（方法解析顺序）
- **魔术方法（dunder）**：\__len__ / \__getitem__ / \__iter__ / \__contains__ ...
- **@dataclass**（3.7+）：自动生成 \`__init__\`, \`__repr__\`, \`__eq__\`
- **@property**：把方法当属性用（getter/setter）
`,
    code: `from dataclasses import dataclass, field
from typing import ClassVar

# 基础类 + 继承
class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self):
        raise NotImplementedError
    def __repr__(self):
        return f"{self.__class__.__name__}({self.name!r})"

class Dog(Animal):
    def speak(self):
        return f"{self.name}: woof"

class Cat(Animal):
    def speak(self):
        return f"{self.name}: meow"

animals = [Dog("Rex"), Cat("Mimi")]
for a in animals:
    print(a, "->", a.speak())

# @dataclass：自动生成 __init__ / __repr__ / __eq__
@dataclass
class Point:
    x: float
    y: float
    tags: list[str] = field(default_factory=list)

p1 = Point(1, 2)
p2 = Point(1, 2, ["a"])
print(p1, p2, p1 == Point(1, 2))

# @dataclass(frozen=True) 不可变（可哈希）
@dataclass(frozen=True)
class Color:
    r: int
    g: int
    b: int

red = Color(255, 0, 0)
print(red, hash(red))

# 魔术方法：让自定义对象支持 len / 迭代 / 索引
class Bag:
    def __init__(self, items):
        self._items = list(items)
    def __len__(self):
        return len(self._items)
    def __getitem__(self, i):
        return self._items[i]
    def __iter__(self):
        return iter(self._items)
    def __contains__(self, x):
        return x in self._items

bag = Bag([1, 2, 3, 4, 5])
print(len(bag), bag[2], 3 in bag, list(bag))

# @property
class Circle:
    def __init__(self, r):
        self._r = r
    @property
    def area(self):
        return 3.14159 * self._r ** 2
    @property
    def radius(self):
        return self._r
    @radius.setter
    def radius(self, v):
        if v < 0: raise ValueError("radius 不能为负")
        self._r = v

c = Circle(2)
print("area:", c.area)
c.radius = 5
print("new area:", c.area)
`,
  },
];
