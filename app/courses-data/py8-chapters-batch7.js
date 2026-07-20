// =============================================================
// py8-chapters-batch7.js
// 模块：面向对象下与异常（共 10 章）
// 全新制作，简单易懂，demo 多，难代码逐行讲解
// =============================================================

export const chapters = [
  {
    id: "py8-operator-magic",
    group: "面向对象下与异常",
    icon: "🔧",
    title: "运算符重载魔术方法",
    content: `## 什么是运算符重载

Python 的魔术方法（Magic Methods / Dunder Methods）是以双下划线开头和结尾的特殊方法，如 \`__init__\`、\`__str__\`。当你对一个对象使用运算符（如 \`+\`、\`-\`、\`==\`）时，Python 内部会自动调用对应的魔术方法。

**运算符重载**就是让你定义这些魔术方法，从而让自定义类也能使用 +、-、== 等运算符，像操作内置类型一样自然。

### 算术运算符重载

| 运算符 | 魔术方法 | 说明 |
|--------|----------|------|
| \`+\` | \`__add__(self, other)\` | 加法 |
| \`-\` | \`__sub__(self, other)\` | 减法 |
| \`*\` | \`__mul__(self, other)\` | 乘法 |
| \`/\` | \`__truediv__(self, other)\` | 真除法 |
| \`//\` | \`__floordiv__(self, other)\` | 整除 |
| \`%\` | \`__mod__(self, other)\` | 取余 |
| \`**\` | \`__pow__(self, other)\` | 幂运算 |

### 比较运算符重载

| 运算符 | 魔术方法 | 说明 |
|--------|----------|------|
| \`==\` | \`__eq__(self, other)\` | 等于 |
| \`!=\` | \`__ne__(self, other)\` | 不等于 |
| \`<\` | \`__lt__(self, other)\` | 小于 |
| \`<=\` | \`__le__(self, other)\` | 小于等于 |
| \`>\` | \`__gt__(self, other)\` | 大于 |
| \`>=\` | \`__ge__(self, other)\` | 大于等于 |

### 容器类魔术方法

| 方法 | 触发场景 |
|------|----------|
| \`__len__\` | \`len(obj)\` 调用 |
| \`__bool__\` | \`if obj:\` 真值判断 |
| \`__contains__\` | \`x in obj\` 成员检查 |
| \`__getitem__\` | \`obj[key]\` 取值 |
| \`__setitem__\` | \`obj[key] = val\` 赋值 |
| \`__delitem__\` | \`del obj[key]\` 删除 |

### 其他常用魔术方法

| 方法 | 触发场景 |
|------|----------|
| \`__call__\` | \`obj()\` 把实例当函数调用 |
| \`__iter__\` / \`__next__\` | \`for x in obj:\` 迭代 |
| \`__hash__\` | \`hash(obj)\` 哈希，用于字典键 |
| \`__enter__\` / \`__exit__\` | \`with obj:\` 上下文管理器 |

### 魔术方法调用顺序

当你写 \`a + b\` 时：
1. Python 先调用 \`a.__add__(b)\`
2. 如果返回 \`NotImplemented\`，则尝试 \`b.__radd__(a)\`（反向加法）
3. 如果仍然 \`NotImplemented\`，则抛出 \`TypeError\`

> 💡 返回 \`NotImplemented\`（不是 \`NotImplementedError\`）是告诉 Python "我处理不了，你试试另一边"。

下面的 demo 展示了一个完整的 \`Vector2D\` 类，它重载了多种运算符，让你直观感受运算符重载的威力。`,
    code: `# ==========================================
# 运算符重载：Vector2D 二维向量类
# 演示 __add__/__sub__/__mul__/__eq__ 等魔术方法
# ==========================================

# 导入 math 用于数学运算
import math


class Vector2D:
    """二维向量，演示运算符重载"""

    def __init__(self, x, y):
        # 初始化向量的 x、y 坐标
        self.x = x
        self.y = y

    # -------- 算术运算符重载 --------
    def __add__(self, other):
        """+ 运算符：向量加法，(x1,y1)+(x2,y2) = (x1+x2, y1+y2)"""
        if isinstance(other, Vector2D):
            return Vector2D(self.x + other.x, self.y + other.y)
        return NotImplemented  # 告诉 Python 请尝试反向调用

    def __sub__(self, other):
        """- 运算符：向量减法"""
        if isinstance(other, Vector2D):
            return Vector2D(self.x - other.x, self.y - other.y)
        return NotImplemented

    def __mul__(self, scalar):
        """* 运算符：向量数乘，v * 3 让向量长度变为 3 倍"""
        # 只处理标量乘法（数字），不支持向量点乘
        if isinstance(scalar, (int, float)):
            return Vector2D(self.x * scalar, self.y * scalar)
        return NotImplemented

    def __truediv__(self, scalar):
        """/ 运算符：向量数除，v / 2 让向量长度变为一半"""
        if isinstance(scalar, (int, float)) and scalar != 0:
            return Vector2D(self.x / scalar, self.y / scalar)
        return NotImplemented

    # -------- 比较运算符重载 --------
    def __eq__(self, other):
        """== 运算符：判断两个向量是否相等（坐标完全相同）"""
        if isinstance(other, Vector2D):
            return self.x == other.x and self.y == other.y
        return NotImplemented

    def __ne__(self, other):
        """!= 运算符：判断两个向量是否不等"""
        if isinstance(other, Vector2D):
            return not (self.x == other.x and self.y == other.y)
        return NotImplemented

    def __lt__(self, other):
        """< 运算符：按向量长度（模）比较大小"""
        if isinstance(other, Vector2D):
            return self.length() < other.length()
        return NotImplemented

    def __gt__(self, other):
        """> 运算符：按向量长度比较"""
        if isinstance(other, Vector2D):
            return self.length() > other.length()
        return NotImplemented

    # -------- 容器类魔术方法 --------
    def __len__(self):
        """len() 调用：返回向量的模四舍五入的整数"""
        return round(self.length())

    def __bool__(self):
        """if v: 真值判断：非零向量为 True，零向量为 False"""
        # 零向量坐标为 (0, 0)，长度为 0
        return self.x != 0 or self.y != 0

    def __contains__(self, item):
        """in 运算符：判断某个坐标值是否出现在向量中"""
        return item == self.x or item == self.y

    def __getitem__(self, index):
        """obj[index] 取值：索引 0 取 x，索引 1 取 y"""
        if index == 0:
            return self.x
        elif index == 1:
            return self.y
        else:
            raise IndexError("索引只能是 0(x) 或 1(y)")

    def __setitem__(self, index, value):
        """obj[index] = value 赋值：修改坐标"""
        if index == 0:
            self.x = value
        elif index == 1:
            self.y = value
        else:
            raise IndexError("索引只能是 0 或 1")

    # -------- 其他魔术方法 --------
    def __call__(self):
        """让实例可以像函数一样被调用 v() 返回向量长度"""
        return self.length()

    def __iter__(self):
        """让向量支持 for x in v: 循环，依次产出 x 和 y"""
        self._iter_index = 0  # 记录当前迭代位置
        return self

    def __next__(self):
        """每次迭代返回下一个坐标值"""
        if self._iter_index == 0:
            self._iter_index = 1
            return self.x
        elif self._iter_index == 1:
            self._iter_index = 2
            return self.y
        else:
            raise StopIteration  # 迭代结束

    def __hash__(self):
        """hash() 调用：让向量可以作为字典的 key"""
        # 基于坐标的哈希值，确保相同坐标的向量哈希相同
        return hash((self.x, self.y))

    def __str__(self):
        """print() 输出的友好字符串"""
        return f"Vector2D({self.x}, {self.y})"

    def __repr__(self):
        """调试用字符串表示，和 __str__ 保持一致"""
        return f"Vector2D({self.x}, {self.y})"

    # -------- 辅助方法 --------
    def length(self):
        """计算向量的模（长度）：sqrt(x² + y²)"""
        return math.sqrt(self.x ** 2 + self.y ** 2)


# ===== 测试算术运算符 =====
print("===== 算术运算符 =====")
v1 = Vector2D(3, 4)  # 创建向量 (3, 4)
v2 = Vector2D(1, 2)  # 创建向量 (1, 2)

print("v1 =", v1)
print("v2 =", v2)
print("v1 + v2 =", v1 + v2)    # 调用 __add__，结果 (4, 6)
print("v1 - v2 =", v1 - v2)    # 调用 __sub__，结果 (2, 2)
print("v1 * 3  =", v1 * 3)     # 调用 __mul__，结果 (9, 12)
print("v1 / 2  =", v1 / 2)     # 调用 __truediv__，结果 (1.5, 2.0)

# ===== 测试比较运算符 =====
print()
print("===== 比较运算符 =====")
v3 = Vector2D(3, 4)  # 和 v1 坐标相同
v4 = Vector2D(10, 0)  # 模为 10 的向量

print("v1 == v3:", v1 == v3)  # True，坐标相同
print("v1 == v2:", v1 == v2)  # False，坐标不同
print("v1 != v2:", v1 != v2)  # True
print("v1 < v4 :", v1 < v4)   # True，v1 长度 5 < v4 长度 10
print("v4 > v1 :", v4 > v1)   # True

# ===== 测试容器类方法 =====
print()
print("===== 容器类方法 =====")
print("len(v1) =", len(v1))        # 向量长度 5，round 后为 5
print("bool(v1) =", bool(v1))      # True，非零向量
print("bool(Vector2D(0, 0)) =", bool(Vector2D(0, 0)))  # False，零向量
print("3 in v1:", 3 in v1)         # True，v1.x 是 3
print("5 in v1:", 5 in v1)         # False
print("v1[0] =", v1[0])            # 3，获取 x
print("v1[1] =", v1[1])            # 4，获取 y

# 修改坐标
v1[0] = 100
print("修改后 v1 =", v1)           # Vector2D(100, 4)

# ===== 测试其他魔术方法 =====
print()
print("===== 其他魔术方法 =====")
print("v1() =", v1())              # 调用 __call__，返回长度
print("hash(v1) =", hash(v1))     # 调用 __hash__

# 迭代：for x in v1
print("迭代 v1:", end=" ")
for coord in v1:                   # 调用 __iter__ 和 __next__
    print(coord, end=" ")
print()

# 作为字典的 key（因为实现了 __hash__）
d = {v1: "向量A", v2: "向量B"}
print("字典内容:", d)

# 打印最终结果
print()
print("=" * 40)
print("所有运算符重载测试通过！")`
  },
  {
    id: "py8-slots",
    group: "面向对象下与异常",
    icon: "📦",
    title: "__slots__ 与内存优化",
    content: `## __slots__ 是什么

默认情况下，Python 类的每个实例都有一个 \`__dict__\` 字典来存储属性。字典虽然灵活，但每个实例都要为字典结构额外消耗内存。当你创建大量实例时（比如百万级），这个开销就非常可观了。

\`__slots__\` 是一个类属性，它告诉 Python：**这个类的实例只能有这些属性**，并且不用字典来存储，而是用更紧凑的 C 结构体方式存储。

### 核心对比

| 特性 | 默认类（有 \`__dict__\`） | \`__slots__\` 类 |
|------|---------------------------|-------------------|
| 属性存储方式 | 字典（字典） | C 槽位（slots） |
| 内存占用 | 大（每个实例 ~200+ 字节额外开销） | 小（没有字典开销） |
| 动态添加属性 | ✅ 可以 | ❌ 禁止 |
| \`__dict__\` | ✅ 存在 | ❌ 不存在 |
| \`__weakref__\` | ✅ 默认支持 | ❌ 需显式添加 |
| 属性访问速度 | 较慢（字典查找） | 较快（直接索引） |

### 基本语法

\`\`\`python
class Point:  # 定义类 Point
    __slots__ = ('x', 'y')  # 元组声明允许的属性名

    def __init__(self, x, y):  # 定义函数 __init__，参数：self, x, y
        self.x = x  # 执行操作
        self.y = y  # 执行操作
\`\`\`

### \`__slots__\` 的继承规则

- **子类默认不继承**父类的 \`__slots__\`
- 子类如果没有定义 \`__slots__\`，会自动重新拥有 \`__dict__\`
- 子类定义 \`__slots__\` 时，会合并父类 + 子类的 slots
- 如果父类没定义 \`__slots__\`，子类定义 \`__slots__\` 就浪费了（父类已有 \`__dict__\`）

### 什么时候使用 \`__slots__\`

| 场景 | 建议 |
|------|------|
| 数据量小（几百个实例） | 不需要，\`__dict__\` 更灵活 |
| 大量实例（百万级） | 强烈推荐，内存节省显著 |
| 需要动态添加属性 | 不要用，会失去灵活性 |
| 作为 ORM 模型的字段 | 适合，如 SQLAlchemy 底层 |
| 需要支持弱引用 | 记得在 slots 中加入 \`__weakref__\` |

### 性能数据参考

创建 100 万个实例的内存对比：
- 默认类：约 **400 MB**
- \`__slots__\` 类：约 **160 MB**（节省约 60%）

> 💡 \`__slots__\` 是"用时间换空间"的经典案例，访问速度也更快，是一举两得。

下面的 demo 通过对比两个类（有 slots 和没有 slots），直观展示内存差异和功能差异。`,
    code: `# ==========================================
# __slots__：内存优化对比演示
# 对比普通类和 __slots__ 类的差异
# ==========================================

import sys  # sys.getsizeof() 获取对象内存大小


# ===== 1. 没有 __slots__ 的普通类 =====
class NormalPoint:
    """普通类：每个实例都有 __dict__，可以动态添加属性"""

    def __init__(self, x, y, color):
        self.x = x      # 存储到实例的 __dict__ 中
        self.y = y
        self.color = color


# ===== 2. 有 __slots__ 的优化类 =====
class SlottedPoint:
    """__slots__ 类：属性固定，无 __dict__，内存更小"""
    __slots__ = ('x', 'y', 'color')  # 只允许这 3 个属性

    def __init__(self, x, y, color):
        self.x = x
        self.y = y
        self.color = color


# ===== 3. 创建实例并对比 =====
print("===== 单个实例内存对比 =====")
normal = NormalPoint(10, 20, "red")
slotted = SlottedPoint(10, 20, "red")

# sys.getsizeof() 返回对象本身的内存大小（字节）
print(f"普通类实例内存: {sys.getsizeof(normal)} bytes")
print(f"slots 类实例内存: {sys.getsizeof(slotted)} bytes")
print(f"节省内存: {sys.getsizeof(normal) - sys.getsizeof(slotted)} bytes")

# ===== 4. 检查 __dict__ 是否存在 =====
print()
print("===== __dict__ 检查 =====")
print("普通类有 __dict__?", hasattr(normal, '__dict__'))  # True
print("slots 类有 __dict__?", hasattr(slotted, '__dict__'))  # False

# 普通类可以用 __dict__ 查看所有属性
print("普通类 __dict__:", normal.__dict__)

# ===== 5. 动态添加属性测试 =====
print()
print("===== 动态添加属性 =====")
# 普通类可以随意添加新属性
normal.z = 99  # 没问题，存到 __dict__ 里
print("普通类添加 z 属性成功:", normal.z)

# slots 类不能添加不在 __slots__ 中的属性
try:
    slotted.z = 99  # 会报错！z 不在 __slots__ 里
except AttributeError as e:
    print("slots 类添加 z 属性失败:", e)

# ===== 6. 批量创建对比内存（模拟） =====
print()
print("===== 批量创建 10000 个实例的内存估算 =====")
# 不能用 sys.getsizeof 精确计算，但可以用差值估算
count = 10000
single_diff = sys.getsizeof(normal) - sys.getsizeof(slotted)
# 还有 __dict__ 本身的内存开销（字典结构）
dict_size = sys.getsizeof(normal.__dict__)
total_saved = (single_diff + dict_size) * count
print(f"创建 {count} 个实例，__slots__ 大约节省: {total_saved / 1024 / 1024:.2f} MB")

# ===== 7. __slots__ 继承规则演示 =====
print()
print("===== __slots__ 继承规则 =====")


class Parent:
    """父类使用 __slots__"""
    __slots__ = ('x', 'y')

    def __init__(self, x, y):
        self.x = x
        self.y = y


class ChildNoSlots(Parent):
    """子类没有定义 __slots__，会自动重新拥有 __dict__"""
    pass


class ChildWithSlots(Parent):
    """子类定义 __slots__，会合并父类的 slots"""
    __slots__ = ('z',)  # 子类新增属性

    def __init__(self, x, y, z):
        super().__init__(x, y)  # 调用父类初始化 x, y
        self.z = z


# 测试子类
child1 = ChildNoSlots(1, 2)
print("ChildNoSlots 有 __dict__?", hasattr(child1, '__dict__'))  # True（因为没定义 slots）
child1.extra = "随意添加"  # 可以动态添加
print("ChildNoSlots.extra =", child1.extra)

child2 = ChildWithSlots(1, 2, 3)
print("ChildWithSlots 有 __dict__?", hasattr(child2, '__dict__'))  # False
print(f"child2.x={child2.x}, child2.y={child2.y}, child2.z={child2.z}")

# ===== 8. 支持弱引用（__weakref__） =====
print()
print("===== __weakref__ 支持 =====")


class WeakRefPoint:
    """在 __slots__ 中加入 __weakref__ 以支持弱引用"""
    __slots__ = ('x', 'y', '__weakref__')

    def __init__(self, x, y):
        self.x = x
        self.y = y


import weakref
wp = WeakRefPoint(5, 5)
ref = weakref.ref(wp)  # 创建弱引用，不会增加引用计数
print("弱引用对象:", ref())
print("弱引用有效:", ref() is not None)

print()
print("=" * 40)
print("__slots__ 所有测试完成！")`
  },
  {
    id: "py8-dataclass",
    group: "面向对象下与异常",
    icon: "📋",
    title: "dataclass 数据类",
    content: `## dataclass 是什么

从 Python 3.7 开始引入的 \`@dataclass\` 装饰器，可以自动为你的类生成 \`__init__\`、\`__repr__\`、\`__eq__\` 等常见方法，让你不用再手写大量样板代码。它的核心目标就是**让数据类变得更简洁**。

### 传统写法 vs dataclass 写法

**传统写法**（需要手写很多代码）：
\`\`\`python
class Student:  # 定义类 Student
    def __init__(self, name, age, score):  # 定义函数 __init__，参数：self, name, age, score
        self.name = name  # 执行操作
        self.age = age  # 执行操作
        self.score = score  # 执行操作
    def __repr__(self):  # 定义函数 __repr__，参数：self
        return f"Student(name={self.name!r}, age={self.age}, score={self.score})"  # 返回 f"Student(name={self.name!r}, age={self.age}, score={self.score})"
    def __eq__(self, other):  # 定义函数 __eq__，参数：self, other
        return (self.name, self.age, self.score) == (other.name, other.age, other.score)  # 返回 (self.name, self.age, self.score) == (other.name, other.age, other.score)
\`\`\`

**dataclass 写法**（一行装饰器搞定）：
\`\`\`python
from dataclasses import dataclass  # 从 dataclasses 导入 dataclass

@dataclass  # 应用装饰器 dataclass
class Student:  # 定义类 Student
    name: str  # 执行操作
    age: int  # 执行操作
    score: float  # 执行操作
\`\`\`

### \`@dataclass\` 装饰器参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| \`init\` | \`True\` | 是否自动生成 \`__init__\` |
| \`repr\` | \`True\` | 是否自动生成 \`__repr__\` |
| \`eq\` | \`True\` | 是否自动生成 \`__eq__\` |
| \`order\` | \`False\` | 是否生成 \`__lt__\`/\`__le__\`/\`__gt__\`/\`__ge__\` |
| \`frozen\` | \`False\` | 是否创建不可变实例 |
| \`unsafe_hash\` | \`False\` | 是否强制生成 \`__hash__\` |

### \`field()\` 函数详解

当默认值比较复杂时，用 \`field()\` 函数配置：

| 参数 | 说明 |
|------|------|
| \`default\` | 默认值 |
| \`default_factory\` | 默认值工厂函数（用于可变类型如 list、dict） |
| \`init\` | 是否作为 \`__init__\` 参数 |
| \`repr\` | 是否出现在 \`__repr__\` 中 |
| \`compare\` | 是否参与比较 |
| \`hash\` | 是否参与哈希计算 |
| \`metadata\` | 元数据（不直接影响行为） |

### \`__post_init__\` 方法

在 \`__init__\` 执行完后自动调用，用于**初始化后的校验或计算**：

\`\`\`python
from dataclasses import field
from dataclasses import dataclass
@dataclass  # 应用装饰器 dataclass
class Rectangle:  # 定义类 Rectangle
    width: float  # 执行操作
    height: float  # 执行操作
    area: float = field(init=False)  # 不作为 init 参数

    def __post_init__(self):  # 定义函数 __post_init__，参数：self
        self.area = self.width * self.height  # 执行操作
\`\`\`

### 与 namedtuple 的对比

| 特性 | namedtuple | dataclass |
|------|------------|-----------|
| 可变性 | 不可变 | 默认可变，\`frozen=True\` 不可变 |
| 继承 | 不支持 | 支持 |
| 默认值 | 支持（Python 3.7+） | 支持 |
| 类型注解 | 弱支持 | 原生支持 |
| 方法 | 可以添加 | 可以添加 |
| 性能 | 稍快 | 稍慢但有更多功能 |

> 💡 需要简单不可变数据用 \`namedtuple\`，需要类行为、继承、校验用 \`dataclass\`。

下面的 demo 通过多个实际场景展示 dataclass 的各种用法。`,
    code: `# ==========================================
# dataclass：数据类实战演示
# 覆盖 @dataclass、field()、frozen、__post_init__ 等
# ==========================================

from dataclasses import dataclass, field, fields
from typing import List


# ===== Demo 1：基础 dataclass =====
print("===== Demo 1：基础 dataclass =====")

@dataclass
class Student:
    """学生类：自动生成 __init__、__repr__、__eq__"""
    name: str          # 姓名
    age: int           # 年龄
    score: float       # 分数

# 创建实例（自动生成的 __init__）
s1 = Student("小明", 18, 92.5)
s2 = Student("小红", 17, 88.0)
s3 = Student("小明", 18, 92.5)  # 和 s1 数据相同

# 自动生成的 __repr__
print("s1:", s1)

# 自动生成的 __eq__（比较所有字段值）
print("s1 == s3:", s1 == s3)  # True，数据相同
print("s1 == s2:", s1 == s2)  # False，数据不同


# ===== Demo 2：field() 默认值 =====
print()
print("===== Demo 2：field() 默认值 =====")

@dataclass
class Product:
    """商品类：演示 field() 的各种用法"""
    name: str                              # 必填字段（无默认值）
    price: float                           # 必填字段
    # default 设置简单默认值
    category: str = field(default="通用")   # 默认分类为"通用"
    # default_factory 设置可变默认值（每次创建新实例时调用）
    tags: List[str] = field(default_factory=list)  # 默认空列表，不能直接写 []
    # init=False 表示不作为 __init__ 参数
    id: int = field(default=0, init=False, repr=False)  # 内部 ID，不显示

p1 = Product("手机", 2999.0, tags=["电子产品", "数码"])
p2 = Product("面包", 8.5)  # 使用默认 category 和 tags
print("p1:", p1)
print("p2:", p2)
print("p2.tags:", p2.tags)  # 空列表，因为 default_factory=list


# ===== Demo 3：frozen 不可变对象 =====
print()
print("===== Demo 3：frozen 不可变对象 =====")

@dataclass(frozen=True)
class Point:
    """不可变坐标点：创建后不能修改属性"""
    x: int
    y: int

pt = Point(3, 5)
print("Point:", pt)

# 尝试修改会报错
try:
    pt.x = 100  # frozen=True 禁止修改
except Exception as e:
    print(f"修改被阻止: {type(e).__name__}: {e}")


# ===== Demo 4：__post_init__ 初始化后处理 =====
print()
print("===== Demo 4：__post_init__ 校验 =====")

@dataclass
class Rectangle:
    """矩形类：用 __post_init__ 做校验和计算"""
    width: float
    height: float
    # init=False 表示这个字段不通过 __init__ 传入，由 __post_init__ 计算
    area: float = field(init=False)

    def __post_init__(self):
        """在 __init__ 之后自动调用，进行校验和计算"""
        # 校验：宽度和高度必须为正数
        if self.width <= 0 or self.height <= 0:
            raise ValueError("宽度和高度必须为正数！")
        # 自动计算面积
        self.area = self.width * self.height

rect = Rectangle(5.0, 3.0)
print("矩形:", rect)
print("面积:", rect.area)  # 15.0

# 非法值测试
try:
    bad = Rectangle(-1, 5)
except ValueError as e:
    print("创建非法矩形失败:", e)


# ===== Demo 5：order 排序 =====
print()
print("===== Demo 5：order=True 自动排序 =====")

@dataclass(order=True)
class Person:
    """人：按 name 排序（第一个字段优先）"""
    name: str
    age: int

people = [
    Person("Charlie", 25),
    Person("Alice", 30),
    Person("Bob", 20),
]

# 排序（自动使用 __lt__ 等方法，按字段顺序比较）
sorted_people = sorted(people)
for p in sorted_people:
    print(f"  {p.name}, {p.age}岁")
# 输出顺序：Alice、Bob、Charlie（按 name 字母序）


# ===== Demo 6：dataclass 与 namedtuple 对比 =====
print()
print("===== Demo 6：dataclass 修改属性 vs namedtuple =====")

from collections import namedtuple

# namedtuple 创建后不可修改
NT = namedtuple("NT", ["x", "y"])
nt = NT(1, 2)
print("namedtuple:", nt)
try:
    nt.x = 99
except AttributeError as e:
    print("namedtuple 修改失败:", e)

# dataclass（默认可变）
@dataclass
class DC:
    x: int
    y: int

dc = DC(1, 2)
dc.x = 99  # 可以修改
print("dataclass 修改后:", dc)


# ===== Demo 7：fields() 查看字段信息 =====
print()
print("===== Demo 7：fields() 查看字段 =====")

for f in fields(Student):
    print(f"  字段: {f.name}, 类型: {f.type}, 默认值: {f.default}")

print()
print("=" * 40)
print("dataclass 所有测试完成！")`
  },
  {
    id: "py8-abc",
    group: "面向对象下与异常",
    icon: "🔷",
    title: "抽象基类 ABC",
    content: `## 什么是抽象基类

抽象基类（Abstract Base Class，简称 ABC）是一种**不能直接实例化**的类，它的作用是定义一组**子类必须实现**的方法，相当于一份"接口契约"。就像建筑蓝图，规定了房子的结构，但图纸本身不能住人。

### 核心概念

| 概念 | 说明 |
|------|------|
| 抽象基类 | 不能实例化的类，定义接口规范 |
| 抽象方法 | 只有声明没有实现的方法，子类必须重写 |
| 具体子类 | 实现了所有抽象方法的子类，可以实例化 |
| 虚拟子类 | 通过 \`register()\` 注册，不继承但被认可为子类 |

### 定义抽象基类

\`\`\`python
from abc import ABC, abstractmethod  # 从 abc 导入 ABC, abstractmethod

class Animal(ABC):          # 继承 ABC，成为抽象基类
    @abstractmethod  # 应用装饰器 abstractmethod
    def speak(self):        # 抽象方法：子类必须实现
        pass  # 空操作，占位符
\`\`\`

### 抽象方法装饰器类型

| 装饰器 | 说明 | Python 版本 |
|--------|------|-------------|
| \`@abstractmethod\` | 抽象实例方法 | 标准 |
| \`@abstractclassmethod\` | 抽象类方法 | 3.2+ |
| \`@abstractstaticmethod\` | 抽象静态方法 | 3.2+ |
| \`@abstractproperty\` | 抽象属性 | 3.3+ |

### 强制实现机制

当子类没有实现所有抽象方法时：
- **实例化时会报错** \`TypeError\`
- 这确保了所有子类都符合接口规范

### \`register()\` 虚拟子类

通过 \`register()\` 方法，可以让一个**不继承** ABC 的类被 \`issubclass()\` 和 \`isinstance()\` 认可：

\`\`\`python
MyABC.register(SomeClass)  # SomeClass 成为虚拟子类
\`\`\`

### \`collections.abc\` 常用抽象基类

Python 标准库提供了许多预定义的 ABC：

| ABC | 说明 | 必须实现的方法 |
|-----|------|---------------|
| \`Iterable\` | 可迭代 | \`__iter__\` |
| \`Iterator\` | 迭代器 | \`__iter__\`, \`__next__\` |
| \`Sequence\` | 序列 | \`__getitem__\`, \`__len__\` |
| \`Mapping\` | 映射 | \`__getitem__\`, \`__len__\`, \`__iter__\` |
| \`MutableSequence\` | 可变序列 | + \`__setitem__\`, \`__delitem__\`, \`insert\` |
| \`Callable\` | 可调用 | \`__call__\` |
| \`Hashable\` | 可哈希 | \`__hash__\` |

> 💡 使用 \`collections.abc\` 可以检查对象是否实现了某个协议，如 \`isinstance(obj, Iterable)\`。

下面的 demo 通过"动物 → 具体动物"和"支付接口"两个场景，全面展示 ABC 的用法。`,
    code: `# ==========================================
# 抽象基类 ABC：接口契约编程
# 演示抽象方法、虚拟子类、子类检查、collections.abc
# ==========================================

from abc import ABC, abstractmethod, ABCMeta
from collections.abc import Iterable, Sequence


# ===== Demo 1：基础抽象基类 =====
print("===== Demo 1：基础抽象基类 =====")

class Animal(ABC):
    """动物抽象基类：定义所有动物必须实现的方法"""

    @abstractmethod
    def speak(self):
        """说话：每种动物叫声不同，子类必须实现"""
        pass

    @abstractmethod
    def move(self):
        """移动：每种动物移动方式不同，子类必须实现"""
        pass

    # 普通方法可以被子类继承（不用重写）
    def describe(self):
        """描述自己：调用 speak 和 move 方法"""
        return f"我是一只动物，我{self.speak()}，我{self.move()}"


# 尝试实例化抽象基类会报错
try:
    a = Animal()
except TypeError as e:
    print("无法实例化抽象基类:", e)


# 具体子类1：狗
class Dog(Animal):
    """狗：必须实现 speak 和 move"""

    def speak(self):
        return "汪汪叫"

    def move(self):
        return "四条腿跑"


# 具体子类2：鸟
class Bird(Animal):
    """鸟：必须实现 speak 和 move"""

    def speak(self):
        return "叽叽喳喳"

    def move(self):
        return "扇翅膀飞"


# 子类没有实现所有抽象方法，实例化会报错
class IncompleteAnimal(Animal):
    """不完整的子类：缺少 speak 和 move 的实现"""
    pass

try:
    ia = IncompleteAnimal()
except TypeError as e:
    print("不完整子类实例化失败:", e)

# 正常使用
dog = Dog()
bird = Bird()
print("Dog:", dog.describe())
print("Bird:", bird.describe())


# ===== Demo 2：抽象类方法和抽象静态方法 =====
print()
print("===== Demo 2：抽象类方法和抽象静态方法 =====")

class Shape(ABC):
    """形状抽象基类"""

    @abstractmethod
    def area(self):
        """抽象实例方法：计算面积"""
        pass

    @classmethod
    @abstractmethod
    def from_string(cls, s):
        """抽象类方法：从字符串创建实例"""
        pass

    @staticmethod
    @abstractmethod
    def description():
        """抽象静态方法：返回形状描述"""
        pass


class Circle(Shape):
    """圆形：实现所有抽象方法"""

    def __init__(self, radius):
        self.radius = radius

    def area(self):
        import math
        return math.pi * self.radius ** 2

    @classmethod
    def from_string(cls, s):
        # 从 "5.0" 这种字符串创建 Circle
        return cls(float(s))

    @staticmethod
    def description():
        return "圆形是由一条曲线围成的平面图形"

c = Circle(3.0)
print("面积:", round(c.area(), 2))  # 约 28.27
c2 = Circle.from_string("5.0")
print("从字符串创建:", c2.radius)
print("描述:", Circle.description())


# ===== Demo 3：register() 虚拟子类 =====
print()
print("===== Demo 3：register() 虚拟子类 =====")

class Plugin(ABC):
    """插件抽象基类"""
    @abstractmethod
    def run(self):
        pass

# 一个不继承 Plugin 的类
class CustomPlugin:
    """自定义插件：没有继承 Plugin，但实现了 run 方法"""

    def run(self):
        return "自定义插件运行中..."

# 注册为虚拟子类
Plugin.register(CustomPlugin)

# 现在 isinstance 和 issubclass 都认可
cp = CustomPlugin()
print("isinstance(cp, Plugin):", isinstance(cp, Plugin))  # True
print("issubclass(CustomPlugin, Plugin):", issubclass(CustomPlugin, Plugin))  # True
print("cp.run():", cp.run())


# ===== Demo 4：collections.abc 使用 =====
print()
print("===== Demo 4：collections.abc 检查 =====")

# 检查不同对象是否实现了某种协议
my_list = [1, 2, 3]
my_dict = {"a": 1, "b": 2}
my_str = "hello"

print("list 是可迭代的?", isinstance(my_list, Iterable))   # True
print("dict 是可迭代的?", isinstance(my_dict, Iterable))   # True
print("str 是序列?", isinstance(my_str, Sequence))        # True
print("list 是序列?", isinstance(my_list, Sequence))      # True
print("dict 是序列?", isinstance(my_dict, Sequence))      # False（dict 是映射）


# ===== Demo 5：自定义 ABC 做类型检查 =====
print()
print("===== Demo 5：自定义 ABC 做类型检查 =====")

class Drawable(ABC):
    """可绘制接口：所有能绘制的对象都必须实现 draw"""

    @abstractmethod
    def draw(self):
        """绘制到屏幕"""
        pass

    @classmethod
    def __subclasshook__(cls, C):
        """子类钩子：自动检查类是否实现了 draw 方法"""
        if cls is Drawable:
            # 如果 C 有 draw 方法，就认为是 Drawable 的子类
            if any("draw" in B.__dict__ for B in C.__mro__):
                return True
        return NotImplemented


class Button:
    """按钮：有 draw 方法"""
    def draw(self):
        pass

class InputBox:
    """输入框：没有 draw 方法"""
    pass

# 自动识别
print("Button 是 Drawable?", isinstance(Button(), Drawable))      # True
print("InputBox 是 Drawable?", isinstance(InputBox(), Drawable))  # False

print()
print("=" * 40)
print("ABC 抽象基类所有测试完成！")`
  },
  {
    id: "py8-enum",
    group: "面向对象下与异常",
    icon: "🏷️",
    title: "枚举 enum 实战",
    content: `## 枚举是什么

枚举（Enum）是一组**有名字的常量**的集合。它让代码更可读、更安全，避免"魔法数字"（magic number）满天飞。比如用 \`Status.ACTIVE\` 代替 \`1\`，意义一目了然。

### 枚举的核心价值

| 问题 | 无枚举的写法 | 有枚举的写法 |
|------|-------------|-------------|
| 可读性差 | \`if status == 1:\` | \`if status == Status.ACTIVE:\` |
| 不安全 | 可能写成 \`if status == 99:\`（不存在的值） | 编译器/IDE 可检查 |
| 难维护 | 修改值需要全局搜索 | 改一处定义即可 |

### 枚举类型一览

| 类型 | 说明 |
|------|------|
| \`Enum\` | 基础枚举，每个成员有 name 和 value |
| \`IntEnum\` | 整型枚举，成员可以当 int 用 |
| \`Flag\` \| 位标志枚举，支持位运算（\`|\`、\`&\`） |
| \`IntFlag\` | 整型位标志，兼具 IntEnum 和 Flag 特性 |
| \`StrEnum\` | 字符串枚举（Python 3.11+） |

### 枚举成员属性

每个枚举成员都有：
- \`name\`：成员名字（字符串）
- \`value\`：成员的值

### 常用 API

| 函数/方法 | 说明 |
|-----------|------|
| \`auto()\` | 自动递增赋值 |
| \`unique()\` | 装饰器，确保所有值唯一 |
| \`Enum[成员名]\` | 通过名字获取成员 |
| \`Enum(值)\` | 通过值获取成员 |

### 枚举与普通常量的对比

\`\`\`python
# ❌ 不好的写法：魔法数字
if status == 1:  # 1 是什么意思？
    print("活跃")  # 打印输出到屏幕

# ✅ 好的写法：枚举
class Status(Enum):  # 定义类 Status
    ACTIVE = 1  # 定义数值 ACTIVE
    INACTIVE = 2  # 定义数值 INACTIVE

if status == Status.ACTIVE:  # 如果 status == Status.ACTIVE
    print("活跃")  # 打印输出到屏幕
\`\`\`

> 💡 枚举成员是不可变的，且枚举本身也不能被继承（除非没有成员）。

下面的 demo 通过 API 状态码、权限管理、工作日等场景，全面展示枚举的实战用法。`,
    code: `# ==========================================
# 枚举 enum：实战演示
# 覆盖 Enum、auto、Flag、IntEnum、unique 等
# ==========================================

from enum import Enum, IntEnum, Flag, IntFlag, auto, unique


# ===== Demo 1：基础 Enum 枚举 =====
print("===== Demo 1：基础 Enum =====")

class Color(Enum):
    """颜色枚举"""
    RED = 1       # 成员 RED，值 1
    GREEN = 2     # 成员 GREEN，值 2
    BLUE = 3      # 成员 BLUE，值 3

# 访问枚举成员
print("Color.RED:", Color.RED)          # Color.RED
print("Color.RED.name:", Color.RED.name)   # 'RED'
print("Color.RED.value:", Color.RED.value) # 1

# 通过名字获取
print("Color['RED']:", Color["RED"])  # Color.RED

# 通过值获取
print("Color(2):", Color(2))  # Color.GREEN

# 遍历枚举
print("遍历所有颜色:")
for color in Color:
    print(f"  {color.name} = {color.value}")

# 比较（用 is 或用 ==）
c1 = Color.RED
c2 = Color.RED
print("c1 is c2:", c1 is c2)       # True（枚举成员是单例）
print("c1 == c2:", c1 == c2)       # True


# ===== Demo 2：auto() 自动赋值 =====
print()
print("===== Demo 2：auto() 自动赋值 =====")

class Priority(Enum):
    """优先级：用 auto() 自动递增赋值"""
    LOW = auto()       # 自动赋值为 1
    MEDIUM = auto()    # 自动赋值为 2
    HIGH = auto()      # 自动赋值为 3
    CRITICAL = auto()  # 自动赋值为 4

for p in Priority:
    print(f"  {p.name} = {p.value}")


# ===== Demo 3：IntEnum 整型枚举 =====
print()
print("===== Demo 3：IntEnum 整型枚举 =====")

class HttpStatus(IntEnum):
    """HTTP 状态码：IntEnum 可以当 int 使用"""
    OK = 200
    CREATED = 201
    BAD_REQUEST = 400
    NOT_FOUND = 404
    SERVER_ERROR = 500

# 可以当 int 用
print("HttpStatus.OK == 200:", HttpStatus.OK == 200)  # True
print("HttpStatus.OK + 1:", HttpStatus.OK + 1)        # 201（可以运算）

# 实战：API 状态码判断
def handle_response(status):
    """模拟 API 响应处理"""
    if status == HttpStatus.OK:
        return "请求成功"
    elif status == HttpStatus.NOT_FOUND:
        return "资源未找到"
    elif status == HttpStatus.SERVER_ERROR:
        return "服务器错误"
    else:
        return "未知状态"

print("handle_response(200):", handle_response(HttpStatus.OK))
print("handle_response(404):", handle_response(HttpStatus.NOT_FOUND))


# ===== Demo 4：Flag 位标志枚举 =====
print()
print("===== Demo 4：Flag 位标志枚举 =====")

class Permission(Flag):
    """权限管理：用位标志表示组合权限"""
    READ = 1       # 二进制 001
    WRITE = 2      # 二进制 010
    EXECUTE = 4    # 二进制 100
    # 组合权限
    ALL = READ | WRITE | EXECUTE  # 111 = 7

# 组合权限
user_perm = Permission.READ | Permission.WRITE  # 读写权限，值 = 1 | 2 = 3
print("user_perm:", user_perm)  # Permission.READ|WRITE
print("user_perm.value:", user_perm.value)  # 3

# 检查权限（用 in 或 & 运算）
print("有读权限?", Permission.READ in user_perm)  # True
print("有执行权限?", Permission.EXECUTE in user_perm)  # False

# 位运算
admin_perm = Permission.ALL
print("管理员权限:", admin_perm)
print("管理员有执行权限?", Permission.EXECUTE in admin_perm)  # True


# ===== Demo 5：@unique 确保值唯一 =====
print()
print("===== Demo 5：@unique 确保唯一 =====")

@unique
class Weekday(Enum):
    """工作日：@unique 确保所有值不重复"""
    MON = 1
    TUE = 2
    WED = 3
    THU = 4
    FRI = 5
    SAT = 6
    SUN = 7

# 检查值是否唯一
values = [w.value for w in Weekday]
print("工作日值列表:", values)
print("所有值唯一:", len(values) == len(set(values)))  # True


# ===== Demo 6：枚举用于 if 判断 =====
print()
print("===== Demo 6：枚举用于 if 判断 =====")

class OrderStatus(Enum):
    PENDING = "pending"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

def process_order(status):
    """根据订单状态执行不同操作"""
    if status == OrderStatus.PENDING:
        return "订单待处理，请等待"
    elif status == OrderStatus.SHIPPED:
        return "订单已发货，运输中"
    elif status == OrderStatus.DELIVERED:
        return "订单已送达，请确认收货"
    elif status == OrderStatus.CANCELLED:
        return "订单已取消"
    else:
        return "未知状态"

print("待处理:", process_order(OrderStatus.PENDING))
print("已发货:", process_order(OrderStatus.SHIPPED))
print("已送达:", process_order(OrderStatus.DELIVERED))

print()
print("=" * 40)
print("枚举 enum 所有测试完成！")`
  },
  {
    id: "py8-try-except",
    group: "面向对象下与异常",
    icon: "🛡️",
    title: "异常处理 try except",
    content: `## 什么是异常

异常（Exception）是程序运行时发生的错误。当 Python 遇到无法处理的情况时，会"抛出"（raise）一个异常对象。如果不处理，程序就会**崩溃退出**并打印错误信息。

\`try...except\` 就是用来**捕获异常**的机制，让程序在出错时不会崩溃，而是执行备选逻辑。

### 基本语法

\`\`\`python
try:  # 尝试执行可能出错的代码
    # 可能出错的代码
    result = 10 / 0  # 定义数值 result
except ZeroDivisionError:  # 捕获异常 ZeroDivisionError:
    # 如果发生 ZeroDivisionError，执行这里
    print("除数不能为零！")  # 打印输出到屏幕
\`\`\`

### except 的多种写法

| 写法 | 说明 |
|------|------|
| \`except ZeroDivisionError:\` | 只捕获指定异常类型 |
| \`except (ValueError, TypeError):\` | 捕获多个异常类型 |
| \`except ZeroDivisionError as e:\` | 捕获并获取异常对象 |
| \`except:\` | 捕获所有异常（不推荐，太宽泛） |
| \`except Exception:\` | 捕获所有常规异常（推荐的全捕获） |

### 常见内置异常层级

Python 的异常是一个**继承树**，了解层级关系很重要：

\`\`\`
BaseException
├── SystemExit
├── KeyboardInterrupt
├── GeneratorExit
└── Exception
    ├── StopIteration
    ├── ArithmeticError
    │   ├── ZeroDivisionError
    │   └── OverflowError
    ├── LookupError
    │   ├── IndexError
    │   └── KeyError
    ├── TypeError
    ├── ValueError
    ├── AttributeError
    ├── NameError
    ├── FileNotFoundError
    ├── ImportError
    └── ...
\`\`\`

### 常见内置异常速查

| 异常类 | 触发场景 |
|--------|----------|
| \`ZeroDivisionError\` | 除以零 |
| \`IndexError\` | 列表索引越界 |
| \`KeyError\` | 字典键不存在 |
| \`TypeError\` | 类型不匹配 |
| \`ValueError\` | 值不合法 |
| \`AttributeError\` | 属性不存在 |
| \`NameError\` | 变量未定义 |
| \`FileNotFoundError\` | 文件不存在 |
| \`ImportError\` | 导入模块失败 |

### except 的顺序规则（重要！）

**Python 从上到下依次匹配 except，一旦匹配就执行，不再继续向下匹配**。所以：

- ❌ 把 \`except Exception\` 放在前面 → 后面的具体异常永远匹配不到
- ✅ 先写具体异常，再写宽泛异常

\`\`\`python
# ✅ 正确的顺序
try:  # 尝试执行可能出错的代码
    x = int("abc")  # 赋值变量 x
except ValueError:      # 先匹配具体异常
    print("值错误")  # 打印输出到屏幕
except Exception:       # 再匹配宽泛异常
    print("其他错误")  # 打印输出到屏幕
\`\`\`

> 💡 \`except:\` 和 \`except Exception:\` 的区别：前者会捕获 \`SystemExit\`、\`KeyboardInterrupt\` 等系统级异常，可能导致程序无法正常退出。永远用 \`except Exception\` 作为全捕获。

下面的 demo 通过多个常见错误场景，手把手教你正确的异常处理方式。`,
    code: `# ==========================================
# 异常处理 try except：基础语法与常见异常
# 覆盖多种异常类型、捕获方式、顺序规则
# ==========================================


# ===== Demo 1：基本 try-except 语法 =====
print("===== Demo 1：基本 try-except =====")

# 场景：除法，但除数为 0 会出错
a = 10
b = 0

try:
    result = a / b  # 这里会抛出 ZeroDivisionError
    print("结果:", result)  # 如果上面出错，这行不会执行
except ZeroDivisionError:
    print(f"错误：不能除以零！a={a}, b={b}")
    result = "无法计算"

print("最终结果:", result)


# ===== Demo 2：捕获多个异常类型 =====
print()
print("===== Demo 2：捕获多个异常 =====")

def safe_divide(arr, index, divisor):
    """安全除法：可能发生多种错误"""
    try:
        value = arr[index]  # 可能 IndexError
        return value / divisor  # 可能 ZeroDivisionError
    except (IndexError, ZeroDivisionError) as e:
        # 用一个 except 捕获两种异常
        print(f"出错了({type(e).__name__}): {e}")
        return None

# 测试不同场景
print("索引越界:", safe_divide([1, 2, 3], 10, 2))  # IndexError
print("除数为零:", safe_divide([1, 2, 3], 1, 0))   # ZeroDivisionError
print("正常:", safe_divide([1, 2, 3], 1, 2))       # 1.0


# ===== Demo 3：分离捕获不同异常 =====
print()
print("===== Demo 3：分离捕获不同异常 =====")

def convert_and_divide(s1, s2):
    """将字符串转数字后相除：可能发生 ValueError 和 ZeroDivisionError"""
    try:
        num1 = int(s1)  # 可能 ValueError
        num2 = int(s2)  # 可能 ValueError
        return num1 / num2  # 可能 ZeroDivisionError
    except ValueError:
        print("格式错误：请输入有效的数字！")
        return None
    except ZeroDivisionError:
        print("数学错误：除数不能为零！")
        return None

print("测试 'abc':", convert_and_divide("abc", "5"))  # ValueError
print("测试 '10/0':", convert_and_divide("10", "0"))   # ZeroDivisionError
print("测试 '10/3':", convert_and_divide("10", "3"))   # 3.333...


# ===== Demo 4：全捕获 except Exception =====
print()
print("===== Demo 4：全捕获 except Exception =====")

def safe_list_operation(lst, index, new_value):
    """安全操作列表：捕获所有可能的异常"""
    try:
        old = lst[index]  # 可能 IndexError
        lst[index] = new_value  # 可能 TypeError
        return old
    except Exception as e:
        # 捕获所有常规异常，并打印详细信息
        print(f"操作失败 [{type(e).__name__}]: {e}")
        return None

my_list = [1, 2, 3]
print("合法操作:", safe_list_operation(my_list, 1, 99))  # 返回 2
print("非法索引:", safe_list_operation(my_list, 10, 99))  # IndexError


# ===== Demo 5：except 顺序规则 =====
print()
print("===== Demo 5：except 顺序规则 =====")

try:
    x = int("abc")  # 抛出 ValueError
except ValueError:
    # ValueError 是 Exception 的子类，先匹配到
    print("捕获到 ValueError（具体异常）")
except Exception:
    # 如果上面没匹配到，会到这里
    print("捕获到其他异常（宽泛异常）")
# 注意：如果把 except Exception 放前面，ValueError 那段永远不会执行！


# ===== Demo 6：异常层级关系演示 =====
print()
print("===== Demo 6：异常层级关系 =====")

# ArithmeticError 是 ZeroDivisionError 的父类
try:
    x = 10 / 0  # ZeroDivisionError
except ArithmeticError:
    # 父类异常也能捕获子类异常
    print("捕获到 ArithmeticError（ZeroDivisionError 的父类）")

# LookupError 是 IndexError 和 KeyError 的父类
try:
    d = {"a": 1}
    print(d["b"])  # KeyError
except LookupError:
    print("捕获到 LookupError（KeyError 的父类）")


# ===== Demo 7：常见异常速查 =====
print()
print("===== Demo 7：常见异常速查 =====")

errors_to_test = [
    ("ZeroDivisionError", lambda: 1 / 0),
    ("IndexError", lambda: [1, 2][5]),
    ("KeyError", lambda: {}["missing"]),
    ("TypeError", lambda: "3" + 5),
    ("ValueError", lambda: int("abc")),
    ("AttributeError", lambda: "hello".non_existent),
    ("NameError", lambda: undefined_var),
    ("FileNotFoundError", lambda: open("/no/such/file.txt")),
]

for name, func in errors_to_test:
    try:
        func()
    except NameError as e:
        print(f"  {name}: 变量不存在")
    except Exception as e:
        # 只打印异常类型名，不打印完整 traceback
        print(f"  {name}: {type(e).__name__}")

print()
print("=" * 40)
print("异常处理 try except 所有测试完成！")`
  },
  {
    id: "py8-else-finally",
    group: "面向对象下与异常",
    icon: "🔒",
    title: "else finally 与上下文管理器",
    content: `## try-except-else-finally 完整结构

\`try\` 语句的完整结构有 4 个部分：

\`\`\`python
try:  # 尝试执行可能出错的代码
    # 可能出错的代码
except SomeError:  # 捕获异常 SomeError:
    # 出错时执行
else:  # 否则
    # 没出错时执行
finally:  # 无论是否异常都执行
    # 无论出错与否，一定执行
\`\`\`

### 各部分执行时机

| 部分 | 何时执行 |
|------|----------|
| \`try\` | 总是执行（直到出错或结束） |
| \`except\` | try 中发生匹配的异常时执行 |
| \`else\` | try 中**没有发生异常**时执行 |
| \`finally\` | **无论如何都会执行**（即使有 return/break/continue） |

### else 的价值

很多人以为 \`else\` 和把代码放在 \`try\` 最后一样，但其实有区别：
- **放在 try 里**：代码抛出的异常会被 except 捕获（可能误捕获）
- **放在 else 里**：代码抛出的异常**不会被** except 捕获

### finally 的铁律

\`finally\` 是真正的"最后的防线"：
- 即使 try 或 except 中有 \`return\`，finally 也会在 return 之前执行
- 即使 try 中有 \`break\` 或 \`continue\`，finally 也会执行
- 唯一的例外：程序被强制终止（如 \`os._exit()\` 或进程被杀）

### with 上下文管理器

\`with\` 语句是 Python 的上下文管理器，能**自动管理资源**（如文件、锁、网络连接），确保资源在使用后被正确关闭。

\`\`\`python
# 不用 with：需要手动关闭
f = open("test.txt", "r")  # 赋值变量 f
content = f.read()  # 赋值变量 content
f.close()  # 容易忘记！

# 用 with：自动关闭
with open("test.txt", "r") as f:  # 使用上下文管理器：open("test.txt", "r") as f
    content = f.read()  # 赋值变量 content
# 离开 with 块时，f.close() 自动调用
\`\`\`

### 上下文管理器原理

\`with\` 语句依赖两个魔术方法：
- \`__enter__\`：进入 with 块时调用，返回值赋给 \`as\` 后面的变量
- \`__exit__\`：离开 with 块时调用，**即使发生异常也会调用**

### contextlib.contextmanager

不想写 \`__enter__\`/\`__exit__\`？用 \`@contextmanager\` 装饰器把生成器函数变成上下文管理器：

\`\`\`python
from contextlib import contextmanager  # 从 contextlib 导入 contextmanager

@contextmanager  # 应用装饰器 contextmanager
def timer(name):  # 定义函数 timer，参数：name
    print(f"{name} 开始")  # 打印输出到屏幕
    yield  # 进入 with 块
    print(f"{name} 结束")  # 打印输出到屏幕
\`\`\`

> 💡 对于文件、数据库连接、网络 socket 等需要"打开-关闭"配对的资源，永远用 \`with\` 语句。

下面的 demo 通过文件操作、数据库模拟、计时器等场景，全面展示 else/finally 和上下文管理器的用法。`,
    code: `# ==========================================
# else finally 与上下文管理器
# 覆盖 try-except-else-finally、with、自定义上下文管理器
# ==========================================

import os
import tempfile
from contextlib import contextmanager


# ===== Demo 1：try-except-else-finally 完整结构 =====
print("===== Demo 1：完整 try-except-else-finally =====")

def safe_divide(a, b):
    """安全除法，展示完整结构"""
    try:
        print("  [try] 开始计算...")
        result = a / b  # 可能 ZeroDivisionError
    except ZeroDivisionError:
        print("  [except] 除数不能为零！")
        result = None
    else:
        # 只有 try 中没有异常时才执行
        print("  [else] 计算成功，没有异常发生")
    finally:
        # 无论如何都执行
        print("  [finally] 清理工作完成")

    return result

print("--- 正常情况 ---")
r1 = safe_divide(10, 2)
print("  结果:", r1)

print("--- 异常情况 ---")
r2 = safe_divide(10, 0)
print("  结果:", r2)


# ===== Demo 2：finally 在 return 之前执行 =====
print()
print("===== Demo 2：finally 与 return =====")

def test_finally_return():
    """演示 finally 在 return 之前执行"""
    try:
        print("  try 中...")
        return "try 的返回值"
    except Exception:
        return "except 的返回值"
    finally:
        # 即使 try 中有 return，finally 也会在 return 之前执行
        print("  finally 执行了！（在 return 之前）")
        # 注意：finally 中不要 return，否则会覆盖 try 的 return

result = test_finally_return()
print("  最终返回值:", result)


# ===== Demo 3：with 语句操作文件 =====
print()
print("===== Demo 3：with 语句操作文件 =====")

# 创建临时文件进行演示
tmp_path = "/tmp/py8_demo_else_finally.txt"

# 写入文件
with open(tmp_path, "w", encoding="utf-8") as f:
    f.write("第一行：Hello Python\\n")
    f.write("第二行：with 语句很方便\\n")
    f.write("第三行：自动关闭文件\\n")
print("文件写入完成")

# 读取文件
with open(tmp_path, "r", encoding="utf-8") as f:
    content = f.read()
print("文件内容:")
print(content)

# 清理临时文件
os.remove(tmp_path)


# ===== Demo 4：自定义上下文管理器（类方式） =====
print("===== Demo 4：自定义上下文管理器 =====")

class DatabaseConnection:
    """模拟数据库连接：演示 __enter__ 和 __exit__"""

    def __init__(self, db_name):
        self.db_name = db_name
        self.connected = False

    def __enter__(self):
        """进入 with 块时调用"""
        print(f"  [连接] 正在连接数据库 '{self.db_name}'...")
        self.connected = True
        return self  # 返回自身，赋给 as 后的变量

    def __exit__(self, exc_type, exc_val, exc_tb):
        """离开 with 块时调用（即使发生异常也会调用）"""
        print(f"  [断开] 正在关闭数据库 '{self.db_name}'...")
        self.connected = False
        # 如果返回 True，异常被抑制（不向上传播）
        # 返回 False 或 None，异常正常传播
        return False

    def query(self, sql):
        """模拟查询"""
        if not self.connected:
            raise RuntimeError("数据库未连接！")
        print(f"  [查询] 执行 SQL: {sql}")
        return "查询结果"

# 正常使用
print("--- 正常流程 ---")
with DatabaseConnection("my_db") as db:
    db.query("SELECT * FROM users")
print("数据库已关闭:", not db.connected)

# 即使发生异常，__exit__ 也会被调用
print("--- 异常流程 ---")
try:
    with DatabaseConnection("my_db") as db:
        db.query("SELECT * FROM users")
        raise ValueError("模拟查询出错")
except ValueError as e:
    print(f"  捕获到异常: {e}")
print("数据库已关闭:", not db.connected)


# ===== Demo 5：contextmanager 装饰器 =====
print()
print("===== Demo 5：@contextmanager 装饰器 =====")

@contextmanager
def timer(operation_name):
    """用 contextmanager 装饰器创建上下文管理器"""
    import time
    print(f"  [{operation_name}] 开始...")
    start = time.time()
    yield  # 这里进入 with 块
    # 以下是 with 块结束后执行的清理代码
    end = time.time()
    elapsed = end - start
    print(f"  [{operation_name}] 结束，耗时: {elapsed:.4f} 秒")

# 使用
with timer("数据处理"):
    # 模拟耗时操作
    total = sum(range(1, 1000001))
    print(f"  计算结果: {total}")


# ===== Demo 6：嵌套 with 语句 =====
print()
print("===== Demo 6：嵌套 with 语句 =====")

# 同时打开多个资源
f1_path = "/tmp/py8_file1.txt"
f2_path = "/tmp/py8_file2.txt"

with open(f1_path, "w") as f1, open(f2_path, "w") as f2:
    f1.write("文件1的内容")
    f2.write("文件2的内容")
print("两个文件同时写入完成")

# 读取验证
with open(f1_path, "r") as f1, open(f2_path, "r") as f2:
    print("文件1:", f1.read())
    print("文件2:", f2.read())

# 清理
os.remove(f1_path)
os.remove(f2_path)

print()
print("=" * 40)
print("else finally 与上下文管理器所有测试完成！")`
  },
  {
    id: "py8-raise-assert",
    group: "面向对象下与异常",
    icon: "🚨",
    title: "raise 抛出异常与 assert 断言",
    content: `## raise 抛出异常

当你的代码检测到不合法的状态时，可以用 \`raise\` 主动抛出异常，让调用方来处理。

### 基本语法

\`\`\`python
raise ValueError("年龄不能为负数")  # 抛出异常：ValueError("年龄不能为负数")
raise TypeError("期望 int 类型")  # 抛出异常：TypeError("期望 int 类型")
\`\`\`

### raise 的三种形式

| 形式 | 说明 |
|------|------|
| \`raise Exception("msg")\` | 抛出新的异常实例 |
| \`raise\` | 重新抛出当前异常（只能在 except 中使用） |
| \`raise NewError from original\` | 异常链：用新异常包装原异常 |

### 自定义异常类

继承 \`Exception\`（或更具体的异常类），给异常起一个有意义的名字：

\`\`\`python
class InvalidAgeError(Exception):  # 定义类 InvalidAgeError
    """年龄不合法异常"""  # 执行操作
    pass  # 空操作，占位符

class InsufficientBalanceError(Exception):  # 定义类 InsufficientBalanceError
    """余额不足异常"""  # 执行操作
    def __init__(self, balance, amount):  # 定义函数 __init__，参数：self, balance, amount
        self.balance = balance  # 执行操作
        self.amount = amount  # 执行操作
        super().__init__(f"余额 {balance} 不足，需要 {amount}")  # 调用父类
\`\`\`

### assert 断言

\`assert\` 是调试工具，用于检查"不应该发生的情况"：

\`\`\`python
assert condition, "错误信息"  # 断言：condition, "错误信息"
# 等价于：
# if not condition:
#     raise AssertionError("错误信息")
\`\`\`

### raise vs assert 对比

| 特性 | raise | assert |
|------|-------|--------|
| 用途 | 处理预期的错误 | 检查"不可能发生"的条件 |
| 可被禁用 | ❌ 不能 | ✅ 用 \`-O\` 参数禁用 |
| 面向 | 用户/调用方 | 开发者自己 |
| 异常类型 | 任意 | 固定 \`AssertionError\` |
| 生产环境 | 应该保留 | 通常禁用 |

### assert 的适用场景

| 适用 | 不适用 |
|------|--------|
| 检查函数参数前提条件 | 验证用户输入 |
| 检查内部状态一致性 | 处理可预期的运行时错误 |
| 单元测试 | 替代正常的错误处理 |
| 调试时快速定位问题 | 生产环境关键逻辑 |

### \`-O\` 优化模式

用 \`python3 -O script.py\` 运行时，所有 \`assert\` 语句会被跳过：

\`\`\`python
assert 1 == 2, "这不会报错"  # -O 模式下被跳过
\`\`\`

> 💡 记住：\`raise\` 是给用户看的错误，\`assert\` 是给开发者看的检查。不要用 assert 处理用户输入校验！

下面的 demo 通过转账、年龄验证、除零检查等场景，展示 raise 和 assert 的实战用法。`,
    code: `# ==========================================
# raise 抛出异常与 assert 断言
# 覆盖 raise、自定义异常、assert、-O 模式
# ==========================================


# ===== Demo 1：raise 基本用法 =====
print("===== Demo 1：raise 基本用法 =====")

def divide(a, b):
    """除法：用 raise 主动检查参数"""
    if not isinstance(a, (int, float)):
        raise TypeError(f"参数 a 必须是数字类型，实际是 {type(a).__name__}")
    if not isinstance(b, (int, float)):
        raise TypeError(f"参数 b 必须是数字类型，实际是 {type(b).__name__}")
    if b == 0:
        raise ValueError("除数 b 不能为零")
    return a / b

# 正常调用
print("10 / 2 =", divide(10, 2))

# 参数类型错误
try:
    divide("abc", 2)
except TypeError as e:
    print("类型错误:", e)

# 除数为零
try:
    divide(10, 0)
except ValueError as e:
    print("值错误:", e)


# ===== Demo 2：自定义异常类 =====
print()
print("===== Demo 2：自定义异常类 =====")

class InsufficientBalanceError(Exception):
    """余额不足异常：携带余额和需求金额信息"""

    def __init__(self, balance, amount):
        self.balance = balance    # 当前余额
        self.amount = amount      # 需要的金额
        # 调用父类 Exception 的 __init__，设置异常消息
        msg = f"余额不足！当前余额: {balance} 元，需要: {amount} 元，差额: {amount - balance} 元"
        super().__init__(msg)


class Account:
    """银行账户：演示自定义异常的使用"""

    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def withdraw(self, amount):
        """取款：余额不足时抛出自定义异常"""
        if amount <= 0:
            raise ValueError("取款金额必须为正数")
        if amount > self.balance:
            raise InsufficientBalanceError(self.balance, amount)
        self.balance -= amount
        return amount

    def __str__(self):
        return f"Account({self.owner}, 余额: {self.balance})"


# 测试
acc = Account("张三", 1000)
print(acc)

# 正常取款
acc.withdraw(200)
print("取款 200 后:", acc)

# 余额不足
try:
    acc.withdraw(2000)
except InsufficientBalanceError as e:
    print("取款失败:", e)
    print(f"  - 余额: {e.balance}")
    print(f"  - 需要: {e.amount}")
    print(f"  - 差额: {e.amount - e.balance}")


# ===== Demo 3：raise 重新抛出 =====
print()
print("===== Demo 3：raise 重新抛出 =====")

def process_data(data):
    """处理数据：记录日志后重新抛出异常"""
    try:
        result = int(data) / 2
        return result
    except ValueError:
        print("  [日志] 数据格式错误，无法转为整数")
        raise  # 重新抛出当前异常，让上层处理
    except ZeroDivisionError:
        print("  [日志] 除数为零（这里不会发生，只是演示）")
        raise

# 上层处理
try:
    process_data("abc")
except ValueError as e:
    print("上层捕获到:", e)


# ===== Demo 4：assert 基本用法 =====
print()
print("===== Demo 4：assert 基本用法 =====")

def calculate_average(scores):
    """计算平均分：用 assert 检查前提条件"""
    # assert 检查：分数列表不能为空
    assert len(scores) > 0, "分数列表不能为空"
    # assert 检查：所有分数必须是非负数
    assert all(s >= 0 for s in scores), "分数不能为负数"
    return sum(scores) / len(scores)

# 正常使用
print("平均分:", calculate_average([85, 90, 78, 92]))

# assert 失败
try:
    calculate_average([])
except AssertionError as e:
    print("断言失败:", e)

try:
    calculate_average([85, -10, 90])
except AssertionError as e:
    print("断言失败:", e)


# ===== Demo 5：assert 用于内部一致性检查 =====
print()
print("===== Demo 5：assert 内部一致性检查 =====")

class Stack:
    """栈：用 assert 检查内部状态一致性"""

    def __init__(self):
        self._items = []

    def push(self, item):
        self._items.append(item)

    def pop(self):
        # 前提条件：栈不能为空
        assert len(self._items) > 0, "不能从空栈弹出"
        return self._items.pop()

    def peek(self):
        assert len(self._items) > 0, "不能查看空栈"
        return self._items[-1]

    def __len__(self):
        return len(self._items)


stack = Stack()
stack.push("A")
stack.push("B")
print("栈长度:", len(stack))
print("弹出:", stack.pop())
print("栈顶:", stack.peek())

try:
    stack.pop()  # 弹出最后一个 "A"
    stack.pop()  # 栈空了，再弹出会 assert 失败
except AssertionError as e:
    print("断言失败:", e)


# ===== Demo 6：raise vs assert 对比 =====
print()
print("===== Demo 6：raise vs assert 对比 =====")

def validate_age_raise(age):
    """用户输入验证：用 raise（正确的做法）"""
    if not isinstance(age, int):
        raise TypeError("年龄必须是整数")
    if age < 0 or age > 150:
        raise ValueError(f"年龄必须在 0-150 之间，实际: {age}")
    return age

def calculate_bmi_assert(weight, height):
    """内部函数前提检查：用 assert（正确的做法）"""
    # 这些条件在正常的程序逻辑中不应该违反
    assert weight > 0, "体重必须为正数"
    assert height > 0, "身高必须为正数"
    return weight / (height ** 2)

# 正确的用法
print("年龄验证:", validate_age_raise(25))
print("BMI:", round(calculate_bmi_assert(70, 1.75), 2))

# 错误的用法演示
try:
    validate_age_raise("abc")
except TypeError as e:
    print("raise 验证失败:", e)

try:
    calculate_bmi_assert(0, 1.75)
except AssertionError as e:
    print("assert 检查失败:", e)

print()
print("=" * 40)
print("raise 与 assert 所有测试完成！")`
  },
  {
    id: "py8-exception-chain",
    group: "面向对象下与异常",
    icon: "🔗",
    title: "异常链与自定义异常",
    content: `## 什么是异常链

在实际开发中，一个异常可能引发另一个异常。比如数据库连接失败→导致查询失败→最终返回错误给用户。Python 的异常链机制让你能**追踪异常的因果关系**，不至于在调试时摸不着头脑。

### 异常链的两种模式

| 模式 | 语法 | 含义 |
|------|------|------|
| 显式链 | \`raise NewError from original\` | 明确指定"新异常是由原异常引起的" |
| 隐式链 | except 中直接 raise 另一个异常 | Python 自动设置 \`__context__\` |

### 关键属性

| 属性 | 说明 |
|------|------|
| \`__cause__\` | 显式链的源异常（\`raise X from Y\`） |
| \`__context__\` | 隐式链的源异常（自动设置） |
| \`__suppress_context__\` | 设为 \`True\` 不显示隐式链 |

### 异常链的打印格式

\`\`\`
# 显式链（raise X from Y）
NewError: 新异常信息
The above exception was the direct cause of the following exception:
OriginalError: 原始异常信息

# 隐式链（自动设置）
NewError: 新异常信息
During handling of the above exception, another exception occurred:
OriginalError: 原始异常信息
\`\`\`

### ExceptionGroup（Python 3.11+）

当需要同时报告多个异常时（如并行任务），用 \`ExceptionGroup\`：

\`\`\`python
raise ExceptionGroup("多个任务失败", [  # 抛出异常：ExceptionGroup("多个任务失败", [
    ValueError("任务1失败"),  # 调用 ValueError()
    TypeError("任务2失败"),  # 调用 TypeError()
])
\`\`\`

### except* 语法（Python 3.11+）

\`except*\` 用于从 ExceptionGroup 中提取特定类型的异常：

\`\`\`python
try:  # 尝试执行可能出错的代码
    raise ExceptionGroup("group", [ValueError("a"), TypeError("b")])  # 抛出异常：ExceptionGroup("group", [ValueError("a"), TypeError("b")])
except* ValueError as e:  # 捕获异常
    print("值错误:", e.exceptions)  # 打印输出到屏幕
except* TypeError as e:  # 捕获异常
    print("类型错误:", e.exceptions)  # 打印输出到屏幕
\`\`\`

### 自定义异常设计原则

1. **继承合适的父类**：继承 \`Exception\`（或 \`ValueError\`、\`TypeError\` 等具体类型）
2. **命名清晰**：以 \`Error\` 结尾，如 \`PaymentError\`、\`ValidationError\`
3. **携带上下文**：在 \`__init__\` 中保存关键信息（如出错的字段名、值）
4. **提供有用的消息**：\`super().__init__(msg)\` 设置人类可读的错误描述

> 💡 异常链是调试利器，它能让你看到"从哪来到哪去"的完整路径，比孤立的一条错误信息有用得多。

下面的 demo 通过文件处理、API 调用、订单处理等场景，展示异常链的完整用法。`,
    code: `# ==========================================
# 异常链与自定义异常
# 覆盖 raise...from、__cause__、__context__、ExceptionGroup、except*
# ==========================================

import sys
import traceback

# 检查 Python 版本，ExceptionGroup 需要 3.11+
PY311_PLUS = sys.version_info >= (3, 11)


# ===== Demo 1：显式异常链 raise ... from ... =====
print("===== Demo 1：显式异常链 raise ... from ... =====")

class ConfigError(Exception):
    """配置错误"""
    pass

class AppError(Exception):
    """应用错误"""
    pass

def load_config(filepath):
    """加载配置文件：可能抛出 ConfigError"""
    # 模拟配置文件不存在
    raise FileNotFoundError(f"找不到配置文件: {filepath}")

def start_app():
    """启动应用：包装底层异常为 AppError"""
    try:
        load_config("config.yaml")
    except FileNotFoundError as e:
        # 用 raise...from 创建显式异常链
        raise AppError("应用启动失败，配置加载出错") from e

# 捕获并查看异常链
try:
    start_app()
except AppError as e:
    print(f"应用错误: {e}")
    # 查看异常链
    print(f"  __cause__: {e.__cause__}")
    print(f"  __cause__ 类型: {type(e.__cause__).__name__}")


# ===== Demo 2：隐式异常链 __context__ =====
print()
print("===== Demo 2：隐式异常链 __context__ =====")

def step1():
    """第一步：可能出错的底层操作"""
    raise ValueError("step1 值错误")

def step2():
    """第二步：调用 step1，出错了自动设置 __context__"""
    try:
        step1()
    except ValueError:
        # 在 except 中直接 raise 另一个异常，Python 自动设置 __context__
        raise RuntimeError("step2 运行时错误")

try:
    step2()
except RuntimeError as e:
    print(f"当前异常: {e}")
    print(f"  __context__: {e.__context__}")
    print(f"  __context__ 类型: {type(e.__context__).__name__}")
    print(f"  __cause__: {e.__cause__}")  # None（因为是隐式链）


# ===== Demo 3：__suppress_context__ 抑制隐式链 =====
print()
print("===== Demo 3：__suppress_context__ 抑制 =====")

def process_with_suppress():
    """演示抑制隐式异常链"""
    try:
        int("abc")  # 抛出 ValueError
    except ValueError:
        new_err = RuntimeError("转换失败，但隐藏了原始错误")
        # 设置为 True 则不显示原始异常
        new_err.__suppress_context__ = True
        raise new_err

try:
    process_with_suppress()
except RuntimeError as e:
    print(f"当前异常: {e}")
    print(f"  __context__: {e.__context__}")
    print(f"  __suppress_context__: {e.__suppress_context__}")


# ===== Demo 4：完整自定义异常体系 =====
print()
print("===== Demo 4：完整自定义异常体系 =====")

class OrderError(Exception):
    """订单异常基类：所有订单相关异常的父类"""

    def __init__(self, order_id, message=""):
        self.order_id = order_id
        super().__init__(f"订单 {order_id}: {message}")


class OrderNotFoundError(OrderError):
    """订单不存在"""
    def __init__(self, order_id):
        super().__init__(order_id, "订单不存在")


class OrderStatusError(OrderError):
    """订单状态错误"""
    def __init__(self, order_id, current_status, expected_status):
        self.current_status = current_status
        self.expected_status = expected_status
        super().__init__(
            order_id,
            f"状态错误，当前: {current_status}，期望: {expected_status}"
        )


class PaymentError(Exception):
    """支付异常"""
    def __init__(self, order_id, amount, reason=""):
        self.order_id = order_id
        self.amount = amount
        super().__init__(f"订单 {order_id} 支付 {amount} 元失败: {reason}")


def find_order(order_id):
    """查找订单：模拟"""
    if order_id == "NOT_FOUND":
        raise OrderNotFoundError(order_id)
    return {"id": order_id, "status": "pending", "amount": 99.0}

def pay_order(order_id, amount):
    """支付订单：模拟"""
    if amount <= 0:
        raise PaymentError(order_id, amount, "金额无效")
    # 模拟支付成功
    return True

def process_order(order_id):
    """处理订单：完整的异常处理流程"""
    try:
        # 1. 查找订单
        order = find_order(order_id)
        print(f"  找到订单: {order}")

        # 2. 支付
        try:
            pay_order(order_id, order["amount"])
            print("  支付成功")
        except PaymentError as e:
            # 支付失败，包装为订单处理错误
            raise OrderError(order_id, "支付环节失败") from e

    except OrderNotFoundError as e:
        print(f"  订单不存在: {e}")
    except OrderError as e:
        print(f"  订单处理错误: {e}")
        if e.__cause__:
            print(f"    原因: {e.__cause__}")

# 测试
print("--- 正常订单 ---")
process_order("ORDER123")

print("--- 不存在的订单 ---")
process_order("NOT_FOUND")


# ===== Demo 5：ExceptionGroup（Python 3.11+） =====
print()
print("===== Demo 5：ExceptionGroup =====")

if PY311_PLUS:
    # 创建 ExceptionGroup 包含多个异常
    try:
        raise ExceptionGroup(
            "批量任务失败",
            [
                ValueError("任务1: 无效值"),
                TypeError("任务2: 类型错误"),
                KeyError("任务3: 键不存在"),
            ]
        )
    except ExceptionGroup as eg:
        print(f"ExceptionGroup: {eg.message}")
        print(f"  包含 {len(eg.exceptions)} 个异常:")
        for i, exc in enumerate(eg.exceptions, 1):
            print(f"    {i}. {type(exc).__name__}: {exc}")

    # except* 语法：提取特定类型的异常
    print()
    print("--- except* 语法 ---")
    try:
        raise ExceptionGroup(
            "混合异常",
            [
                ValueError("值错误 A"),
                TypeError("类型错误 B"),
                ValueError("值错误 C"),
            ]
        )
    except* ValueError as eg:
        print(f"捕获到 ValueError 组: {[str(e) for e in eg.exceptions]}")
    except* TypeError as eg:
        print(f"捕获到 TypeError 组: {[str(e) for e in eg.exceptions]}")

    print("  （所有异常都被处理了）")
else:
    print("ExceptionGroup 需要 Python 3.11+，当前版本为", sys.version.split()[0])
    print("  跳过 ExceptionGroup 演示")

print()
print("=" * 40)
print("异常链与自定义异常所有测试完成！")`
  },
  {
    id: "py8-warnings-logging",
    group: "面向对象下与异常",
    icon: "⚠️",
    title: "warnings 与 logging 日志",
    content: `## warnings 警告模块

\`warnings\` 模块用于发出**警告信息**，与异常不同：警告不会中断程序，只是提醒开发者"这里可能有问题"。

### 警告 vs 异常

| 维度 | 警告（warnings） | 异常（exceptions） |
|------|-----------------|-------------------|
| 程序是否中断 | 不中断，继续执行 | 中断（除非被捕获） |
| 用途 | 提醒潜在问题 | 报告可恢复错误 |
| 典型场景 | 废弃 API、可疑用法 | 除零、文件不存在 |
| 是否可过滤 | ✅ 可以 | ❌ 不可以 |

### 警告类别层级

\`\`\`
Warning
├── UserWarning          # 用户代码警告（warn() 默认）
├── DeprecationWarning   # 废弃特性警告
├── PendingDeprecationWarning  # 即将废弃
├── SyntaxWarning        # 可疑语法
├── RuntimeWarning       # 运行时可疑行为
├── FutureWarning        # 未来版本变化
├── ImportWarning        # 导入问题
└── UnicodeWarning       # Unicode 问题
\`\`\`

### 警告过滤器

通过 \`simplefilter()\` 控制警告的显示行为：

| 动作 | 说明 |
|------|------|
| \`"error"\` | 将警告转为异常 |
| \`"ignore"\` | 完全忽略警告 |
| \`"always"\` | 总是显示警告 |
| \`"default"\` | 每个位置只显示一次 |
| \`"module"\` | 每个模块只显示一次 |
| \`"once"\` | 只显示一次 |

### logging 日志模块

\`logging\` 是 Python 标准库的日志系统，比 \`print()\` 专业得多：

| 优势 | 说明 |
|------|------|
| 级别控制 | 不同环境显示不同详细程度 |
| 输出目标 | 控制台、文件、网络等 |
| 格式统一 | 时间戳、级别、模块名等 |
| 性能 | 相比 print 更高效 |
| 线程安全 | 多线程环境安全 |

### 日志级别（从低到高）

| 级别 | 数值 | 用途 |
|------|------|------|
| \`DEBUG\` | 10 | 调试信息，最详细 |
| \`INFO\` | 20 | 一般运行信息 |
| \`WARNING\` | 30 | 警告信息（默认级别） |
| \`ERROR\` | 40 | 错误信息 |
| \`CRITICAL\` | 50 | 严重错误 |

### 日志架构组件

| 组件 | 说明 |
|------|------|
| \`Logger\` | 日志记录器，提供应用程序接口 |
| \`Handler\` | 处理器，决定日志输出到哪里 |
| \`Formatter\` | 格式化器，决定日志的显示格式 |
| \`Filter\` | 过滤器，提供更细粒度的过滤 |

### 典型配置

\`\`\`python
import logging  # 导入模块 logging

logging.basicConfig(  # 调用 logging.basicConfig()
    level=logging.INFO,           # 最低级别
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',  # 定义字符串 format
    handlers=[  # 定义列表 handlers
        logging.FileHandler("app.log"),  # 输出到文件
        logging.StreamHandler(),         # 也输出到控制台
    ]
)
\`\`\`

> 💡 生产环境一定要用 logging 而不是 print！print 的信息无法控制级别、无法重定向到文件、在大型项目中难以管理。

下面的 demo 通过警告过滤、日志配置、多级别日志输出等场景，全面展示 warnings 和 logging 的用法。`,
    code: `# ==========================================
# warnings 与 logging 日志
# 覆盖 warnings.warn、simplefilter、logging 配置、多级别日志
# ==========================================

import warnings
import logging
import os
import sys


# ===== Demo 1：warnings 基本用法 =====
print("===== Demo 1：warnings 基本用法 =====")

def deprecated_function():
    """已废弃的函数：调用时发出警告"""
    warnings.warn("deprecated_function 已废弃，请使用 new_function()", DeprecationWarning)
    return "旧函数的结果"

# 默认情况下，DeprecationWarning 被忽略（用户代码中）
# 需要先调整过滤器才能看到
warnings.simplefilter("always", DeprecationWarning)

result = deprecated_function()
print("函数返回:", result)


# ===== Demo 2：warnings 过滤器控制 =====
print()
print("===== Demo 2：warnings 过滤器控制 =====")

def risky_calculation(x):
    """可能溢出的计算：发出 RuntimeWarning"""
    if x > 1000:
        warnings.warn(f"x={x} 太大，可能导致计算溢出", RuntimeWarning)
    return x * x

# 不同过滤器行为
print("--- 默认行为（只显示一次） ---")
warnings.simplefilter("default", RuntimeWarning)
risky_calculation(2000)
risky_calculation(2000)  # 第二次不会显示

print("--- always 行为（每次都显示） ---")
warnings.simplefilter("always", RuntimeWarning)
risky_calculation(3000)

print("--- ignore 行为（不显示） ---")
warnings.simplefilter("ignore", RuntimeWarning)
risky_calculation(4000)  # 被忽略，不显示
print("  （警告被忽略了）")


# ===== Demo 3：将警告转为异常 =====
print()
print("===== Demo 3：将警告转为异常 =====")

warnings.simplefilter("error", UserWarning)  # UserWarning 变成异常

try:
    warnings.warn("这是一个被转为异常的警告", UserWarning)
except UserWarning as e:
    print("捕获到警告（作为异常）:", e)

# 重置过滤器，避免影响后续代码
warnings.simplefilter("default", UserWarning)


# ===== Demo 4：logging 基本配置 =====
print()
print("===== Demo 4：logging 基本配置 =====")

# basicConfig 设置日志级别和格式
logging.basicConfig(
    level=logging.DEBUG,  # 最详细的级别
    format="%(levelname)-8s | %(message)s",
    force=True,  # 强制重新配置（覆盖已有配置）
)

logger = logging.getLogger("demo")

# 不同级别的日志
logger.debug("这是 DEBUG 信息 - 调试用，最详细")
logger.info("这是 INFO 信息 - 一般运行信息")
logger.warning("这是 WARNING 信息 - 警告")
logger.error("这是 ERROR 信息 - 错误")
logger.critical("这是 CRITICAL 信息 - 严重错误")


# ===== Demo 5：日志级别过滤 =====
print()
print("===== Demo 5：日志级别过滤 =====")

# 重新配置：只显示 INFO 及以上级别
logging.basicConfig(
    level=logging.INFO,  # 过滤掉 DEBUG
    format="%(levelname)-8s | %(message)s",
    force=True,
)

logger2 = logging.getLogger("level_demo")
logger2.debug("DEBUG 不会显示（被过滤了）")
logger2.info("INFO 会显示")
logger2.warning("WARNING 会显示")
print("  （DEBUG 信息被过滤掉了，因为 level=INFO）")


# ===== Demo 6：logging 输出到文件 =====
print()
print("===== Demo 6：logging 输出到文件 =====")

log_file = "/tmp/py8_logging_demo.log"

# 配置：同时输出到控制台和文件
file_handler = logging.FileHandler(log_file, mode="w", encoding="utf-8")
console_handler = logging.StreamHandler(sys.stdout)

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
    handlers=[file_handler, console_handler],
    force=True,
)

file_logger = logging.getLogger("file_demo")
file_logger.info("这条日志同时写入文件和控制台")
file_logger.warning("警告信息也写入文件")
file_logger.error("错误信息也写入文件")

# 读取并显示文件内容
with open(log_file, "r", encoding="utf-8") as f:
    print()
    print("--- 日志文件内容 ---")
    print(f.read())

# 清理
os.remove(log_file)


# ===== Demo 7：Logger 层级和命名 =====
print("===== Demo 7：Logger 层级和命名 =====")

# 重新设置简单配置
logging.basicConfig(
    level=logging.DEBUG,
    format="%(name)-15s | %(levelname)-8s | %(message)s",
    force=True,
)

# Logger 命名用点号分隔，形成层级
root_logger = logging.getLogger("app")       # 父 logger
db_logger = logging.getLogger("app.database")  # 子 logger
api_logger = logging.getLogger("app.api")      # 子 logger

root_logger.info("应用启动")
db_logger.debug("数据库连接池初始化")
api_logger.info("API 服务就绪")
db_logger.error("数据库查询超时")
api_logger.warning("API 请求频率过高")


# ===== Demo 8：实战：用户服务日志 =====
print()
print("===== Demo 8：实战：用户服务日志 =====")

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
    force=True,
)

service_logger = logging.getLogger("user_service")

def create_user(username, email):
    """模拟创建用户，记录完整日志"""
    service_logger.info(f"开始创建用户: username={username}")

    # 校验用户名
    if not username or len(username) < 3:
        service_logger.error(f"用户名无效: '{username}'（长度需 >= 3）")
        return False

    # 模拟检查邮箱
    if "@" not in email:
        service_logger.warning(f"邮箱格式可疑: {email}")
        # 继续执行，但发出警告

    # 模拟创建
    service_logger.debug(f"数据库插入: username={username}, email={email}")
    service_logger.info(f"用户创建成功: {username}")

    return True

# 测试
print("--- 正常创建 ---")
create_user("alice", "alice@example.com")

print("--- 无效用户名 ---")
create_user("ab", "bob@example.com")

print("--- 可疑邮箱 ---")
create_user("charlie", "bad-email")

print()
print("=" * 40)
print("warnings 与 logging 所有测试完成！")`
  }
];