// =============================================================
// Python 面向对象教程（pyobject）—— 第三批章节
// -------------------------------------------------------------
// 魔术方法（10-14章）
//   第 10 章：__str__ / __repr__：对象的字符串表示
//   第 11 章：运算符重载：__add__、__eq__ 等
//   第 12 章：上下文管理：with 语句与 __enter__/__exit__
//   第 13 章：__call__：让对象像函数一样被调用
//   第 14 章：容器协议：__len__、__getitem__、__iter__
// =============================================================

export const chapters = [
  // =========================================================
  // 第十章：__str__ / __repr__：对象的字符串表示
  // =========================================================
  {
    id: "po-10",
    group: "魔术方法",
    icon: "📝",
    title: "__str__ / __repr__：对象的字符串表示",
    content: `## 一、什么是魔术方法？

**魔术方法**（magic method）= 以双下划线开头和结尾的方法，在特定情况下自动被调用。

## 二、__str__ 和 __repr__ 的区别

| 方法 | 用途 | 调用场景 |
|------|------|----------|
| \`__str__\` | 给用户看的字符串 | \`print()\`, \`str()\`, \`f-string\` |
| \`__repr__\` | 给开发者看的字符串 | \`repr()\`, 交互式 REPL |

## 三、为什么要重写？

\`\`\`python
class User:
    def __init__(self, name, age):
        self.name = name
        self.age = age

u = User("Alice", 30)
print(u)  # <__main__.User object at 0x7f...>（默认输出）
\`\`\`

默认输出没意义，重写后就可读。

## 四、__str__ 例子

\`\`\`python
class User:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def __str__(self):
        return f"User(name={self.name}, age={self.age})"

u = User("Alice", 30)
print(u)  # User(name=Alice, age=30)
str(u)    # "User(name=Alice, age=30)"
\`\`\`

## 五、__repr__ 例子

\`\`\`python
class User:
    def __repr__(self):
        return f"User(name={self.name!r}, age={self.age!r})"

u = User("Alice", 30)
repr(u)  # "User(name='Alice', age=30)"
u        # 在 REPL 中显示 User(name='Alice', age=30)
\`\`\`

## 六、最佳实践

1. **永远实现 \`__repr__\`**：调试必备
2. **\`__str__\` 可选**：默认会调用 \`__repr__\`
3. **理想情况**：\`__repr__\` 输出可以直接 \`eval()\` 重建对象

## 七、__str__ vs __repr__ 简单记忆

- \`__str__\` = **S**how 给用户（str）
- \`__repr__\` = **R**epresent 给开发者（representation）

## 八、其它格式魔术方法

- \`__format__\`: \`format(obj)\` 和 f-string \`{obj:spec}\`
- \`__bytes__\`: \`bytes(obj)\`

## 九、本章 demo

演示字符串表示魔术方法。
`,
    code: `"""
第十章 demo：__str__ / __repr__
演示：
  1. 默认的对象表示
  2. 实现 __repr__
  3. 实现 __str__
  4. __str__ vs __repr__ 的区别
  5. 理想的可重建 repr
  6. __format__ 自定义格式
"""


# ===== 1. 默认的对象表示 =====
class User1:
    def __init__(self, name, age):
        self.name = name
        self.age = age


print("=== 1. 默认的对象表示 ===")
u = User1("Alice", 30)
print(f"  print(u)   = {u}")
print(f"  repr(u)    = {repr(u)}")
print()


# ===== 2. 实现 __repr__ =====
class User2:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def __repr__(self):
        # 给开发者看的，建议可重建
        return f"User2(name={self.name!r}, age={self.age})"


print("=== 2. 实现 __repr__ ===")
u = User2("Alice", 30)
print(f"  print(u)   = {u}（没 __str__，自动用 __repr__）")
print(f"  repr(u)    = {repr(u)}")
print()


# ===== 3. 实现 __str__ =====
class User3:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def __str__(self):
        # 给用户看的，友好格式
        return f"{self.name} ({self.age}岁)"

    def __repr__(self):
        return f"User3(name={self.name!r}, age={self.age})"


print("=== 3. 实现 __str__ ===")
u = User3("Alice", 30)
print(f"  print(u)   = {u}（用 __str__）")
print(f"  str(u)     = {str(u)}（用 __str__）")
print(f"  repr(u)    = {repr(u)}（用 __repr__）")
print(f"  f-string   = 用户：{u}")
print()


# ===== 4. 在列表中的表现 =====
print("=== 4. 列表中的字符串表示 ===")
users = [User3("Alice", 30), User3("Bob", 25)]
print(f"  print(list)   = {users}")
print(f"  for 循环打印:")
for u in users:
    print(f"    {u}")
print()


# ===== 5. 理想的可重建 repr =====
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        # repr 输出可以直接 eval 重建
        return f"Point({self.x}, {self.y})"

    def __str__(self):
        return f"({self.x}, {self.y})"


print("=== 5. 理想的可重建 repr ===")
p = Point(3, 4)
print(f"  repr(p)   = {repr(p)}")
new_p = eval(repr(p))  # 直接从 repr 字符串重建
print(f"  eval(repr)  = {new_p}")
print(f"  new_p type = {type(new_p).__name__}")
print()


# ===== 6. __format__ 自定义格式 =====
class Money:
    """金额类"""

    def __init__(self, amount):
        self.amount = amount

    def __repr__(self):
        return f"Money({self.amount})"

    def __format__(self, spec):
        """自定义 f-string 格式"""
        if spec == "RMB":
            return f"¥{self.amount:.2f}"
        elif spec == "USD":
            return f"\${self.amount / 7.0:.2f}"
        elif spec == "":
            return f"{self.amount:.2f}"
        else:
            return f"未知格式: {spec}"


print("=== 6. __format__ 自定义格式 ===")
m = Money(100)
print(f"  默认:    {m}")
print(f"  RMB 格式: {m:RMB}")
print(f"  USD 格式: {m:USD}")
print()


# ===== 7. 调试利器：__repr__ 在 dict / list 中 =====
class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price

    def __repr__(self):
        return f"<Product {self.name} ¥{self.price}>"


print("=== 7. 调试时的 __repr__ ===")
products = [Product("iPhone", 6999), Product("iPad", 5999)]
print(f"  {products}")
print(f"  单个产品: {products[0]}")
`,
  },

  // =========================================================
  // 第十一章：运算符重载：__add__、__eq__ 等
  // =========================================================
  {
    id: "po-11",
    group: "魔术方法",
    icon: "➕",
    title: "运算符重载：__add__、__eq__ 等",
    content: `## 一、什么是运算符重载？

让自定义对象支持 \`+\`、\`-\`、\`==\`、\`<\` 等运算符。

\`\`\`python
class Vector:
    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

v1 = Vector(1, 2)
v2 = Vector(3, 4)
v3 = v1 + v2  # 自动调用 __add__
\`\`\`

## 二、Python 的运算符对应表

| 运算符 | 魔术方法 |
|--------|----------|
| \`+\` | \`__add__\` |
| \`-\` | \`__sub__\` |
| \`*\` | \`__mul__\` |
| \`/\` | \`__truediv__\` |
| \`//\` | \`__floordiv__\` |
| \`%\` | \`__mod__\` |
| \`**\` | \`__pow__\` |
| \`==\` | \`__eq__\` |
| \`!=\` | \`__ne__\` |
| \`<\` | \`__lt__\` |
| \`<=\` | \`__le__\` |
| \`>\` | \`__gt__\` |
| \`>=\` | \`__ge__\` |

## 三、算术运算符

\`\`\`python
class Vector:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)
\`\`\`

## 四、反向运算符

\`\`\`python
def __radd__(self, other):
    # 当 self 在右边时调用：5 + v1
    return self.__add__(other)
\`\`\`

## 五、比较运算符

\`\`\`python
def __eq__(self, other):
    return self.x == other.x and self.y == other.y
def __lt__(self, other):
    return self.x < other.x
\`\`\`

## 六、为什么用 \`functools.total_ordering\`？

只定义 \`__eq__\` 和其中一个（\`<\`），自动生成其他比较：

\`\`\`python
from functools import total_ordering

@total_ordering
class Student:
    def __init__(self, score):
        self.score = score
    def __eq__(self, other):
        return self.score == other.score
    def __lt__(self, other):
        return self.score < other.score
# 自动有 <=, >, >=, !=
\`\`\`

## 七、in-place 运算符

| 运算符 | 魔术方法 |
|--------|----------|
| \`+=\` | \`__iadd__\` |
| \`-=\` | \`__isub__\` |

## 八、常见应用

1. **数学对象**：Vector、Matrix、Complex
2. **金额类**：Money + Money = Money
3. **日期**：Date + timedelta
4. **集合**：并集、交集

## 九、运算符重载的原则

1. **保持直觉**：\`+\` 表示合并/相加
2. **不要反直觉**：别让 \`+\` 表示减法
3. **返回新对象**：别修改自身
4. **处理类型检查**：类型不对返回 NotImplemented

## 十、本章 demo

演示运算符重载。
`,
    code: `"""
第十一章 demo：运算符重载
演示：
  1. 向量的加减乘
  2. __eq__ 相等比较
  3. __lt__ 大小比较
  4. total_ordering 简化
  5. 反向运算符
  6. 实战：金额类
"""


# ===== 1. 向量类：加减乘 =====
class Vector:
    """二维向量"""

    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __sub__(self, other):
        return Vector(self.x - other.x, self.y - other.y)

    def __mul__(self, scalar):
        return Vector(self.x * scalar, self.y * scalar)

    def __rmul__(self, scalar):
        # 反向：scalar * vector
        return self.__mul__(scalar)


print("=== 1. 向量加减乘 ===")
v1 = Vector(1, 2)
v2 = Vector(3, 4)
print(f"  v1 + v2 = {v1 + v2}")
print(f"  v2 - v1 = {v2 - v1}")
print(f"  v1 * 3  = {v1 * 3}")
print(f"  3 * v1  = {3 * v1}（反向）")
print()


# ===== 2. __eq__ 相等比较 =====
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __eq__(self, other):
        if not isinstance(other, Point):
            return NotImplemented
        return self.x == other.x and self.y == other.y

    def __repr__(self):
        return f"Point({self.x}, {self.y})"


print("=== 2. __eq__ 相等比较 ===")
p1 = Point(1, 2)
p2 = Point(1, 2)
p3 = Point(3, 4)
print(f"  p1 == p2: {p1 == p2}")
print(f"  p1 == p3: {p1 == p3}")
print(f"  p1 == (1, 2): {p1 == (1, 2)}")
print()


# ===== 3. __lt__ 大小比较 =====
class Student:
    """学生：按分数比较"""

    def __init__(self, name, score):
        self.name = name
        self.score = score

    def __repr__(self):
        return f"Student({self.name}, {self.score})"

    def __eq__(self, other):
        return self.score == other.score

    def __lt__(self, other):
        return self.score < other.score


print("=== 3. __lt__ 大小比较 ===")
s1 = Student("Alice", 90)
s2 = Student("Bob", 80)
s3 = Student("Carol", 95)
print(f"  s1 < s2: {s1 < s2}")
print(f"  s1 == s2: {s1 == s2}")
print(f"  最小: {min(s1, s2, s3)}")
print()


# ===== 4. functools.total_ordering 简化 =====
from functools import total_ordering


@total_ordering
class Money:
    """金额：自动生成所有比较"""

    def __init__(self, amount):
        self.amount = amount

    def __eq__(self, other):
        return self.amount == other.amount

    def __lt__(self, other):
        return self.amount < other.amount

    def __repr__(self):
        return f"Money({self.amount})"


print("=== 4. total_ordering 自动生成比较 ===")
m1 = Money(100)
m2 = Money(200)
m3 = Money(100)
# 自动有 !=, <=, >, >=
print(f"  m1 == m3: {m1 == m3}")
print(f"  m1 != m2: {m1 != m2}")
print(f"  m1 <= m2: {m1 <= m2}")
print(f"  m2 > m1:  {m2 > m1}")
print(f"  最大: {max(m1, m2, m3)}")
print()


# ===== 5. 实战：金额运算 =====
class Currency:
    """金额：支持加减和比较"""

    def __init__(self, amount, currency="CNY"):
        self.amount = amount
        self.currency = currency

    def __repr__(self):
        return f"{self.amount} {self.currency}"

    def __add__(self, other):
        if self.currency != other.currency:
            # 简单汇率换算
            if self.currency == "USD" and other.currency == "CNY":
                return Currency(self.amount * 7 + other.amount, "CNY")
        return Currency(self.amount + other.amount, self.currency)

    def __sub__(self, other):
        return Currency(self.amount - other.amount, self.currency)

    def __eq__(self, other):
        return self.amount == other.amount and self.currency == other.currency

    def __lt__(self, other):
        if self.currency != other.currency:
            return False
        return self.amount < other.amount


print("=== 5. 实战：金额运算 ===")
a = Currency(100, "CNY")
b = Currency(50, "CNY")
print(f"  {a} + {b} = {a + b}")
print(f"  {a} - {b} = {a - b}")
print(f"  {a} > {b}: {a > b}")

usd = Currency(10, "USD")
print(f"  {usd} + {b} = {usd + b}")
print()


# ===== 6. 实战：复数类 =====
class Complex:
    """复数：a + bi"""

    def __init__(self, real, imag=0):
        self.real = real
        self.imag = imag

    def __add__(self, other):
        return Complex(self.real + other.real, self.imag + other.imag)

    def __mul__(self, other):
        return Complex(
            self.real * other.real - self.imag * other.imag,
            self.real * other.imag + self.imag * other.real
        )

    def __repr__(self):
        if self.imag >= 0:
            return f"{self.real} + {self.imag}i"
        return f"{self.real} - {abs(self.imag)}i"


print("=== 6. 实战：复数类 ===")
c1 = Complex(1, 2)
c2 = Complex(3, 4)
print(f"  c1 = {c1}")
print(f"  c2 = {c2}")
print(f"  c1 + c2 = {c1 + c2}")
print(f"  c1 * c2 = {c1 * c2}")
`,
  },

  // =========================================================
  // 第十二章：上下文管理：with 语句与 __enter__/__exit__
  // =========================================================
  {
    id: "po-12",
    group: "魔术方法",
    icon: "🎁",
    title: "上下文管理：with 语句与 __enter__/__exit__",
    content: `## 一、什么是上下文管理？

\`with\` 语句会在代码块**前后**自动执行清理工作。

\`\`\`python
with open("file.txt") as f:
    content = f.read()
# 文件自动关闭，即使出错了也关闭
\`\`\`

## 二、为什么需要？

- 文件、网络连接等资源**必须关闭**
- 即使代码报错也要清理
- 比 try-finally 简洁

## 三、自定义上下文管理器

实现两个魔术方法：

- \`__enter__\`: 进入 with 时调用
- \`__exit__\`: 离开 with 时调用

\`\`\`python
class MyContext:
    def __enter__(self):
        print("进入")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        print("退出")
        return False
\`\`\`

## 四、__enter__ 和 __exit__ 的参数

\`__exit__\` 接收 3 个异常参数：

\`\`\`python
def __exit__(self, exc_type, exc_val, exc_tb):
    # exc_type: 异常类型
    # exc_val: 异常值
    # exc_tb: 异常 traceback
    ...
\`\`\`

- 返回 True：吞掉异常
- 返回 False/None：异常继续传播

## 五、实战：计时器

\`\`\`python
import time

class Timer:
    def __enter__(self):
        self.start = time.time()
        return self

    def __exit__(self, *args):
        self.end = time.time()
        print(f"耗时: {self.end - self.start:.2f}s")
        return False
\`\`\`

## 六、contextmanager 装饰器

用 \`@contextmanager\` 装饰生成器函数：

\`\`\`python
from contextlib import contextmanager

@contextmanager
def my_context():
    print("进入")
    yield "value"
    print("退出")
\`\`\`

更简洁，不用写类。

## 七、实战：数据库事务

\`\`\`python
class Transaction:
    def __enter__(self):
        self.conn.begin()
        return self.cursor

    def __exit__(self, exc_type, *args):
        if exc_type:
            self.conn.rollback()
        else:
            self.conn.commit()
        return False
\`\`\`

## 八、常见应用

1. **文件操作**：自动关闭
2. **线程锁**：自动释放
3. **数据库事务**：自动提交/回滚
4. **临时目录**：自动清理
5. **计时器**：统计耗时
6. **配置切换**：临时改全局配置

## 九、本章 demo

演示上下文管理的各种用法。
`,
    code: `"""
第十二章 demo：上下文管理
演示：
  1. 自定义上下文管理器
  2. 异常处理
  3. 计时器
  4. contextmanager 装饰器
  5. 实战：临时切换工作目录
  6. 实战：数据库事务模拟
"""
import time
import os
from contextlib import contextmanager


# ===== 1. 自定义上下文管理器 =====
class MyContext:
    """自定义上下文管理器"""

    def __enter__(self):
        print("  [__enter__] 资源获取")
        return self  # 返回值会赋给 as 后的变量

    def __exit__(self, exc_type, exc_val, exc_tb):
        print(f"  [__exit__] 资源释放")
        if exc_type:
            print(f"    异常: {exc_type.__name__}: {exc_val}")
        return False  # 异常不吞


print("=== 1. 自定义上下文管理器 ===")
with MyContext() as ctx:
    print("  with 块内执行")
print()


# ===== 2. 异常处理 =====
print("=== 2. with 块内异常 ===")
try:
    with MyContext():
        print("  准备抛异常")
        raise ValueError("出错了")
except ValueError as e:
    print(f"  捕获到: {e}")
print()


# ===== 3. 计时器 =====
class Timer:
    """计时器：自动统计耗时"""

    def __enter__(self):
        self.start = time.time()
        return self

    def __exit__(self, *args):
        self.elapsed = time.time() - self.start
        return False


print("=== 3. 计时器 ===")
with Timer() as t:
    # 模拟耗时操作
    total = sum(range(1000000))
print(f"  耗时: {t.elapsed * 1000:.2f}ms")
print()


# ===== 4. contextmanager 装饰器 =====
@contextmanager
def tag(name):
    """简单的标签上下文"""
    print(f"  <{name}>")
    yield
    print(f"  </{name}>")


print("=== 4. contextmanager 装饰器 ===")
with tag("h1"):
    print("    标题内容")
print()


# ===== 5. contextmanager 返回值 =====
@contextmanager
def open_file(path, mode):
    """类似内置 open 的简化版"""
    print(f"  [打开] {path}")
    f = open(path, mode)
    try:
        yield f
    finally:
        f.close()
        print(f"  [关闭] {path}")


print("=== 5. contextmanager 返回值 ===")
with open_file("/tmp/test_oop.txt", "w") as f:
    f.write("Hello, OOP")
print("  文件已写入并自动关闭")
print()


# ===== 6. 临时切换工作目录 =====
@contextmanager
def chdir(path):
    """临时切换工作目录"""
    old = os.getcwd()
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(old)


print("=== 6. 临时切换工作目录 ===")
print(f"  当前目录: {os.getcwd()}")
with chdir("/tmp"):
    print(f"  with 内: {os.getcwd()}")
print(f"  退出后: {os.getcwd()}")
print()


# ===== 7. 实战：数据库事务模拟 =====
class FakeDB:
    """假数据库"""

    def __init__(self):
        self.in_transaction = False
        self.changes = []

    def begin(self):
        self.in_transaction = True
        self.changes = []
        print("  [BEGIN]")

    def execute(self, sql):
        if not self.in_transaction:
            raise RuntimeError("不在事务中")
        self.changes.append(sql)
        print(f"  [EXEC] {sql}")

    def commit(self):
        print("  [COMMIT]")
        self.in_transaction = False

    def rollback(self):
        print("  [ROLLBACK]")
        self.changes = []
        self.in_transaction = False


class Transaction:
    """事务上下文"""

    def __init__(self, db):
        self.db = db

    def __enter__(self):
        self.db.begin()
        return self

    def __exit__(self, exc_type, *args):
        if exc_type:
            self.db.rollback()
        else:
            self.db.commit()
        return False


print("=== 7. 实战：数据库事务 ===")
db = FakeDB()

# 正常提交
with Transaction(db):
    db.execute("INSERT INTO users ...")
    db.execute("UPDATE accounts ...")
print(f"  提交后 in_transaction: {db.in_transaction}")
print()

# 异常回滚
try:
    with Transaction(db):
        db.execute("INSERT INTO logs ...")
        raise ValueError("出错了")
except ValueError:
    pass
print(f"  回滚后 in_transaction: {db.in_transaction}")
`,
  },

  // =========================================================
  // 第十三章：__call__：让对象像函数一样被调用
  // =========================================================
  {
    id: "po-13",
    group: "魔术方法",
    icon: "📞",
    title: "__call__：让对象像函数一样被调用",
    content: `## 一、什么是 __call__？

让对象可以**像函数一样被调用**：

\`\`\`python
class Adder:
    def __call__(self, a, b):
        return a + b

add = Adder()
print(add(3, 5))  # 8
\`\`\`

## 二、为什么需要？

- 简洁的 API
- 保存状态的"可调用对象"
- 装饰器的基础

## 三、保存状态

\`\`\`python
class Counter:
    def __init__(self):
        self.count = 0
    def __call__(self):
        self.count += 1
        return self.count

c = Counter()
print(c())  # 1
print(c())  # 2
\`\`\`

## 四、__call__ vs 普通方法

| 写法 | 含义 |
|------|------|
| \`obj.method()\` | 调用方法 |
| \`obj()\` | 调用 \`__call__\` |

## 五、闭包类 vs __call__

\`\`\`python
# 用闭包
def make_adder(n):
    def add(x):
        return x + n
    return add

# 用 __call__
class Adder:
    def __init__(self, n):
        self.n = n
    def __call__(self, x):
        return x + self.n
\`\`\`

\`__call__\` 更清晰、更易扩展。

## 六、实战：函数装饰器

\`\`\`python
class CountCalls:
    def __init__(self, func):
        self.func = func
        self.count = 0
    def __call__(self, *args):
        self.count += 1
        return self.func(*args)

@CountCalls
def hello():
    print("Hello")
\`\`\`

## 七、实战：可调用配置

\`\`\`python
class Config:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)
    def __call__(self, **kwargs):
        # 临时修改配置
        old = self.__dict__.copy()
        self.__dict__.update(kwargs)
        return old  # 返回旧配置
\`\`\`

## 八、callable() 检查

\`\`\`python
callable(Adder())  # True（实现了 __call__）
callable(int)       # True
callable(42)        # False
\`\`\`

## 九、常见应用

1. **装饰器类**：CountCalls、Cache
2. **回调函数**：保存状态
3. **可配置函数**：动态调整
4. **状态机**：保存当前状态

## 十、本章 demo

演示 __call__ 的各种用法。
`,
    code: `"""
第十三章 demo：__call__
演示：
  1. 基本 __call__
  2. 保存状态
  3. 函数装饰器类
  4. 缓存装饰器
  5. 实战：可调用计时器
"""


# ===== 1. 基本 __call__ =====
class Adder:
    """加法器"""

    def __init__(self, n):
        self.n = n

    def __call__(self, x):
        return x + self.n


print("=== 1. 基本 __call__ ===")
add5 = Adder(5)
add10 = Adder(10)
print(f"  add5(3)  = {add5(3)}")
print(f"  add10(3) = {add10(3)}")
print(f"  callable(add5): {callable(add5)}")
print()


# ===== 2. 保存状态 =====
class Counter:
    """计数器"""

    def __init__(self):
        self.count = 0

    def __call__(self):
        self.count += 1
        return self.count


print("=== 2. 保存状态 ===")
c = Counter()
print(f"  c() = {c()}")
print(f"  c() = {c()}")
print(f"  c() = {c()}")
print(f"  内部状态 count = {c.count}")
print()


# ===== 3. 函数装饰器：统计调用次数 =====
class CountCalls:
    """统计函数调用次数"""

    def __init__(self, func):
        self.func = func
        self.count = 0

    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"  [调用 {self.count}] {self.func.__name__}")
        return self.func(*args, **kwargs)


@CountCalls
def greet(name):
    return f"Hello, {name}"


print("=== 3. 装饰器：统计调用 ===")
print(f"  {greet('Alice')}")
print(f"  {greet('Bob')}")
print(f"  {greet('Carol')}")
print()


# ===== 4. 缓存装饰器 =====
class Cache:
    """缓存函数结果"""

    def __init__(self, func):
        self.func = func
        self.cache = {}

    def __call__(self, *args):
        if args not in self.cache:
            print(f"  [计算] {self.func.__name__}{args}")
            self.cache[args] = self.func(*args)
        else:
            print(f"  [缓存] {self.func.__name__}{args}")
        return self.cache[args]


@Cache
def heavy_compute(n):
    """模拟重计算"""
    return sum(range(n))


print("=== 4. 装饰器：缓存 ===")
print(f"  result = {heavy_compute(1000)}")
print(f"  result = {heavy_compute(1000)}")
print(f"  result = {heavy_compute(2000)}")
print(f"  result = {heavy_compute(2000)}")
print(f"  缓存大小: {len(heavy_compute.cache)}")
print()


# ===== 5. 可调用对象：累加器 =====
class Accumulator:
    """累加器"""

    def __init__(self, start=0):
        self.total = start

    def __call__(self, x):
        self.total += x
        return self

    def value(self):
        return self.total


print("=== 5. 可调用累加器 ===")
acc = Accumulator()
acc(10)(20)(30)  # 链式调用
print(f"  累加结果: {acc.value()}")
print()


# ===== 6. 实战：定时器 =====
import time


class Stopwatch:
    """秒表"""

    def __init__(self):
        self.start_time = None
        self.elapsed = 0

    def __call__(self):
        """调用时切换：开始/停止"""
        if self.start_time is None:
            self.start_time = time.time()
            print("  [开始]")
        else:
            self.elapsed = time.time() - self.start_time
            print(f"  [停止] 耗时 {self.elapsed:.3f}s")
            self.start_time = None
        return self


print("=== 6. 实战：秒表 ===")
sw = Stopwatch()
sw()  # 开始
time.sleep(0.1)
sw()  # 停止
time.sleep(0.05)
sw()  # 重新开始
time.sleep(0.2)
sw()  # 停止
print()


# ===== 7. 实战：可配置乘法器 =====
class Multiplier:
    """可调用乘法器"""

    def __init__(self, factor):
        self.factor = factor

    def __call__(self, x):
        return x * self.factor

    def set_factor(self, factor):
        self.factor = factor


print("=== 7. 实战：可配置乘法器 ===")
m = Multiplier(2)
print(f"  m(5) = {m(5)}（factor=2）")
m.set_factor(10)
print(f"  m(5) = {m(5)}（factor=10）")
`,
  },

  // =========================================================
  // 第十四章：容器协议：__len__、__getitem__、__iter__
  // =========================================================
  {
    id: "po-14",
    group: "魔术方法",
    icon: "📚",
    title: "容器协议：__len__、__getitem__、__iter__",
    content: `## 一、什么是容器协议？

让你的类**像 list、dict 一样使用**：

- \`len(obj)\`: \`__len__\`
- \`obj[i]\`: \`__getitem__\`
- \`obj[i] = v\`: \`__setitem__\`
- \`del obj[i]\`: \`__delitem__\`
- \`iter(obj)\`: \`__iter__\`
- \`x in obj\`: \`__contains__\`

## 二、最简单的容器

\`\`\`python
class MyList:
    def __init__(self):
        self.data = []
    def __len__(self):
        return len(self.data)
    def __getitem__(self, i):
        return self.data[i]

m = MyList()
m.data.extend([1, 2, 3])
print(len(m))  # 3
print(m[0])    # 1
\`\`\`

## 三、__getitem__ 支持切片

\`\`\`python
def __getitem__(self, i):
    if isinstance(i, slice):
        # 切片
        return self.data[i]
    return self.data[i]
\`\`\`

## 四、__iter__ 让对象可迭代

\`\`\`python
def __iter__(self):
    return iter(self.data)
\`\`\`

然后可以用 \`for x in obj\`。

## 五、__contains__ 实现 in 运算符

\`\`\`python
def __contains__(self, item):
    return item in self.data
\`\`\`

## 六、__setitem__ 和 __delitem__

\`\`\`python
def __setitem__(self, i, value):
    self.data[i] = value

def __delitem__(self, i):
    del self.data[i]
\`\`\`

## 七、字典式容器

\`\`\`python
class MyDict:
    def __init__(self):
        self.data = {}
    def __getitem__(self, key):
        return self.data[key]
    def __setitem__(self, key, value):
        self.data[key] = value
\`\`\`

## 八、collections.abc 提供快捷基类

\`\`\`python
from collections.abc import Sequence, Mapping

class MyList(Sequence):
    # 自动获得很多方法
    pass
\`\`\`

## 九、本章 demo

演示容器协议。
`,
    code: `"""
第十四章 demo：容器协议
演示：
  1. __len__ 和 __getitem__
  2. 切片支持
  3. __iter__ 可迭代
  4. __contains__ 实现 in
  5. __setitem__ 和 __delitem__
  6. 实战：自定义栈
  7. 实战：自定义字典
"""


# ===== 1. 自定义列表：__len__ 和 __getitem__ =====
class MyList:
    """简单的列表类"""

    def __init__(self, items=None):
        self.data = list(items) if items else []

    def __len__(self):
        return len(self.data)

    def __getitem__(self, i):
        if isinstance(i, slice):
            return MyList(self.data[i])
        return self.data[i]

    def __repr__(self):
        return f"MyList({self.data})"


print("=== 1. 自定义列表 ===")
m = MyList([1, 2, 3, 4, 5])
print(f"  m       = {m}")
print(f"  len(m)  = {len(m)}")
print(f"  m[0]    = {m[0]}")
print(f"  m[-1]   = {m[-1]}")
print(f"  m[1:3]  = {m[1:3]}（切片）")
print()


# ===== 2. 可迭代：__iter__ =====
class MyRange:
    """类似 range 的类"""

    def __init__(self, n):
        self.n = n

    def __iter__(self):
        """让对象可迭代"""
        for i in range(self.n):
            yield i

    def __len__(self):
        return self.n


print("=== 2. 可迭代对象 ===")
r = MyRange(5)
print(f"  列表: {list(r)}")
print(f"  求和: {sum(r)}")
print(f"  for 循环:")
for i in r:
    print(f"    {i}", end=" ")
print()
print()


# ===== 3. __contains__ 实现 in =====
class MySet:
    """类似 set 的容器"""

    def __init__(self, items=None):
        self.data = set(items) if items else set()

    def __contains__(self, item):
        return item in self.data

    def __len__(self):
        return len(self.data)

    def add(self, item):
        self.data.add(item)

    def __repr__(self):
        return f"MySet({sorted(self.data)})"


print("=== 3. __contains__ 实现 in ===")
s = MySet([1, 2, 3, 4, 5])
print(f"  3 in s: {3 in s}")
print(f"  10 in s: {10 in s}")
print(f"  len(s): {len(s)}")
print()


# ===== 4. __setitem__ 和 __delitem__ =====
class MyDict:
    """简单的字典类"""

    def __init__(self):
        self.data = {}

    def __getitem__(self, key):
        return self.data[key]

    def __setitem__(self, key, value):
        self.data[key] = value

    def __delitem__(self, key):
        del self.data[key]

    def __contains__(self, key):
        return key in self.data

    def __len__(self):
        return len(self.data)

    def __repr__(self):
        return f"MyDict({self.data})"


print("=== 4. 自定义字典 ===")
d = MyDict()
d["name"] = "Alice"
d["age"] = 30
d["city"] = "北京"
print(f"  d = {d}")
print(f"  d['name'] = {d['name']}")
print(f"  'name' in d: {'name' in d}")
print(f"  len(d) = {len(d)}")
del d["city"]
print(f"  del 后: {d}")
print()


# ===== 5. 实战：自定义栈 =====
class Stack:
    """栈：后进先出"""

    def __init__(self):
        self.data = []

    def push(self, item):
        self.data.append(item)

    def pop(self):
        return self.data.pop()

    def __len__(self):
        return len(self.data)

    def __getitem__(self, i):
        # 支持索引查看（不改）
        return self.data[i]

    def __iter__(self):
        # 从栈顶到栈底
        return reversed(self.data)

    def __repr__(self):
        return f"Stack({self.data})"


print("=== 5. 实战：栈 ===")
s = Stack()
s.push(1)
s.push(2)
s.push(3)
print(f"  栈: {s}")
print(f"  长度: {len(s)}")
print(f"  栈顶: {s[-1]}")
print(f"  弹出: {s.pop()}")
print(f"  栈: {s}")
print(f"  迭代:")
for item in s:
    print(f"    {item}", end=" ")
print()
print()


# ===== 6. 实战：自定义队列 =====
class Queue:
    """队列：先进先出"""

    def __init__(self):
        self.data = []

    def enqueue(self, item):
        self.data.append(item)

    def dequeue(self):
        return self.data.pop(0)

    def __len__(self):
        return len(self.data)

    def __iter__(self):
        return iter(self.data)

    def __repr__(self):
        return f"Queue({self.data})"


print("=== 6. 实战：队列 ===")
q = Queue()
q.enqueue("A")
q.enqueue("B")
q.enqueue("C")
print(f"  队列: {q}")
print(f"  出队: {q.dequeue()}")
print(f"  队列: {q}")
print()


# ===== 7. 实战：购物车（容器 + 业务） =====
class Cart:
    """购物车：商品列表"""

    def __init__(self):
        self.items = []  # [(name, price, qty)]

    def add(self, name, price, qty=1):
        self.items.append({"name": name, "price": price, "qty": qty})

    def __len__(self):
        return len(self.items)

    def __getitem__(self, i):
        return self.items[i]

    def __iter__(self):
        return iter(self.items)

    def __contains__(self, name):
        return any(item["name"] == name for item in self.items)

    @property
    def total(self):
        return sum(item["price"] * item["qty"] for item in self.items)

    def __repr__(self):
        return f"Cart({len(self.items)} 项, 共 ¥{self.total})"


print("=== 7. 实战：购物车 ===")
cart = Cart()
cart.add("iPhone", 6999)
cart.add("iPad", 5999, 2)
print(f"  购物车: {cart}")
print(f"  商品数: {len(cart)}")
print(f"  含 iPhone: {'iPhone' in cart}")
print(f"  含 MacBook: {'MacBook' in cart}")
print(f"  第一个商品: {cart[0]}")
print(f"  所有商品:")
for item in cart:
    print(f"    {item}")
`,
  },
];
