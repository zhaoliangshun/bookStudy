// =============================================================
// Python 从入门到精通大全（终极版）—— 第8批章节
// 第八部分 面向对象进阶（共 5 章）
// =============================================================

const chapters = [
  // =========================================================
  // 第三十六章：运算符重载
  // =========================================================
  {
    id: "py10-ch36",
    group: "第八部分 面向对象进阶",
    icon: "⚙️",
    title: "第三十六章 运算符重载",
    content: `## 运算符重载：让自定义类支持 +、-、*、<

运算符重载让你的类能用 \`+\`、\`-\`、\`*\`、\`<\` 等运算符。本质是实现特殊的魔术方法（\`__add__\`、\`__sub__\` 等）。这让自定义类的代码更自然、更简洁——\`v1 + v2\` 比 \`v1.add(v2)\` 直观得多。

## 一、算术运算符

\`\`\`python
class Vector:
    """二维向量：演示算术运算符"""
    
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __repr__(self):
        return f"Vector({self.x}, {self.y})"
    
    # 加法：v1 + v2
    def __add__(self, other):
        if isinstance(other, Vector):
            return Vector(self.x + other.x, self.y + other.y)
        return NotImplemented  # 让 Python 尝试 other.__radd__
    
    # 减法：v1 - v2
    def __sub__(self, other):
        if isinstance(other, Vector):
            return Vector(self.x - other.x, self.y - other.y)
        return NotImplemented
    
    # 乘法：v * n（向量乘标量）
    def __mul__(self, scalar):
        if isinstance(scalar, (int, float)):
            return Vector(self.x * scalar, self.y * scalar)
        return NotImplemented
    
    # 真除法：v / n
    def __truediv__(self, scalar):
        if isinstance(scalar, (int, float)):
            return Vector(self.x / scalar, self.y / scalar)
        return NotImplemented
    
    # 整除：v // n
    def __floordiv__(self, scalar):
        if isinstance(scalar, (int, float)):
            return Vector(self.x // scalar, self.y // scalar)
        return NotImplemented
    
    # 取模：v % n
    def __mod__(self, scalar):
        if isinstance(scalar, (int, float)):
            return Vector(self.x % scalar, self.y % scalar)
        return NotImplemented
    
    # 幂：v ** n
    def __pow__(self, scalar):
        if isinstance(scalar, (int, float)):
            return Vector(self.x ** scalar, self.y ** scalar)
        return NotImplemented

v1 = Vector(3, 4)
v2 = Vector(1, 2)

print(v1 + v2)    # Vector(4, 6)
print(v1 - v2)    # Vector(2, 2)
print(v1 * 2)     # Vector(6, 8)
print(v1 / 2)     # Vector(1.5, 2.0)
print(v1 // 2)    # Vector(1, 2)
print(v1 % 2)     # Vector(1, 0)
print(v1 ** 2)    # Vector(9, 16)
\`\`\`

## 二、反向运算符 \`__radd__\` 等

\`\`\`python
# 当 a + b 时，Python 先尝试 a.__add__(b)
# 如果返回 NotImplemented，再尝试 b.__radd__(a)
# 这对 "数字 * 向量" 这种情况很重要

class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __repr__(self):
        return f"Vector({self.x}, {self.y})"
    
    def __mul__(self, scalar):
        """v * n"""
        if isinstance(scalar, (int, float)):
            return Vector(self.x * scalar, self.y * scalar)
        return NotImplemented  # 关键：让 Python 尝试 n.__mul__(v)
    
    # 反向乘法：n * v
    def __rmul__(self, scalar):
        """当 n * v 时，n 不知道怎么乘 v，回退到 v.__rmul__"""
        return self.__mul__(scalar)  # 复用 __mul__

v = Vector(3, 4)

# v * 2：直接调用 v.__mul__(2)
print(v * 2)  # Vector(6, 8)

# 2 * v：先尝试 (2).__mul__(v)，返回 NotImplemented
# 然后调用 v.__rmul__(2)
print(2 * v)  # Vector(6, 8) ✅

# 如果没有 __rmul__，2 * v 会报错
\`\`\`

## 三、一元运算符

\`\`\`python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __repr__(self):
        return f"Vector({self.x}, {self.y})"
    
    # 取负：-v
    def __neg__(self):
        return Vector(-self.x, -self.y)
    
    # 取正：+v
    def __pos__(self):
        return Vector(+self.x, +self.y)  # 通常是复制
    
    # 绝对值：abs(v)
    def __abs__(self):
        return (self.x ** 2 + self.y ** 2) ** 0.5
    
    # 按位取反：~v（不常用，但可以定义）
    def __invert__(self):
        return Vector(~self.x, ~self.y)

v = Vector(3, -4)

print(-v)      # Vector(-3, 4)
print(+v)      # Vector(3, -4)
print(abs(v))  # 5.0（3-4-5 三角形）
print(~v)      # Vector(-4, 3)
\`\`\`

## 四、复合赋值运算符

\`\`\`python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __repr__(self):
        return f"Vector({self.x}, {self.y})"
    
    # 加法：返回新对象
    def __add__(self, other):
        if isinstance(other, Vector):
            return Vector(self.x + other.x, self.y + other.y)
        return NotImplemented
    
    # 原地加法：v1 += v2
    # 如果不实现，Python 会用 v1 = v1 + v2 代替
    def __iadd__(self, other):
        """原地修改 self，返回 self"""
        if isinstance(other, Vector):
            self.x += other.x
            self.y += other.y
            return self  # 必须返回 self！
        return NotImplemented
    
    # 原地乘法：v *= n
    def __imul__(self, scalar):
        if isinstance(scalar, (int, float)):
            self.x *= scalar
            self.y *= scalar
            return self
        return NotImplemented

v1 = Vector(1, 2)
v2 = Vector(3, 4)

# 普通加法：创建新对象
v3 = v1 + v2
print(v1, v2, v3)  # Vector(1, 2) Vector(3, 4) Vector(4, 6)
# v1 和 v2 没变

# 原地加法：修改 v1
v1 += v2
print(v1)  # Vector(4, 6)（v1 被修改了）

# 原地乘法
v1 *= 2
print(v1)  # Vector(8, 12)

# ⚠️ __iadd__ 必须返回 self
# 如果返回 None，v1 += v2 会变成 v1 = None
\`\`\`

**\`__iadd__\` vs \`__add__\` 的区别**：

\`\`\`python
class WithoutIAdd:
    def __init__(self, value):
        self.value = value
    
    def __add__(self, other):
        return WithoutIAdd(self.value + other.value)

a = WithoutIAdd(1)
b = WithoutIAdd(2)
original_id = id(a)
a += b  # 没有 __iadd__，用 a = a + b
print(id(a) == original_id)  # False（a 指向了新对象）

class WithIAdd:
    def __init__(self, value):
        self.value = value
    
    def __add__(self, other):
        return WithIAdd(self.value + other.value)
    
    def __iadd__(self, other):
        self.value += other.value
        return self

x = WithIAdd(1)
y = WithIAdd(2)
original_id = id(x)
x += y  # 有 __iadd__，原地修改
print(id(x) == original_id)  # True（x 还是同一个对象，只是 value 变了）
\`\`\`

## 五、比较运算符

\`\`\`python
from functools import total_ordering

@total_ordering
class Student:
    """学生：支持所有比较运算"""
    
    def __init__(self, name, score):
        self.name = name
        self.score = score
    
    def __eq__(self, other):
        """== """
        if not isinstance(other, Student):
            return NotImplemented
        return self.score == other.score
    
    def __lt__(self, other):
        """< """
        if not isinstance(other, Student):
            return NotImplemented
        return self.score < other.score
    
    # @total_ordering 会自动生成 __le__、__gt__、__ge__
    
    def __repr__(self):
        return f"Student({self.name!r}, {self.score})"

s1 = Student("张三", 85)
s2 = Student("李四", 90)
s3 = Student("王五", 85)

print(s1 == s3)  # True（分数相同）
print(s1 < s2)   # True
print(s2 > s1)   # True（自动生成）
print(s1 <= s3)  # True（自动生成）
print(s1 >= s3)  # True（自动生成）
print(s1 != s2)  # True

# 排序
students = [s1, s2, s3, Student("赵六", 70)]
print(sorted(students))
# [Student('赵六', 70), Student('张三', 85), Student('王五', 85), Student('李四', 90)]
\`\`\`

**手动实现所有比较运算符**：

\`\`\`python
class Point:
    """不用 total_ordering，手动实现所有比较"""
    
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __eq__(self, other):
        if not isinstance(other, Point):
            return NotImplemented
        return (self.x, self.y) == (other.x, other.y)
    
    def __ne__(self, other):
        """!= （Python 3 默认用 __eq__ 取反，可省略）"""
        result = self.__eq__(other)
        if result is NotImplemented:
            return result
        return not result
    
    def __lt__(self, other):
        if not isinstance(other, Point):
            return NotImplemented
        return (self.x, self.y) < (other.x, other.y)
    
    def __le__(self, other):
        if not isinstance(other, Point):
            return NotImplemented
        return (self.x, self.y) <= (other.x, other.y)
    
    def __gt__(self, other):
        if not isinstance(other, Point):
            return NotImplemented
        return (self.x, self.y) > (other.x, other.y)
    
    def __ge__(self, other):
        if not isinstance(other, Point):
            return NotImplemented
        return (self.x, self.y) >= (other.x, other.y)

p1 = Point(1, 2)
p2 = Point(3, 4)
p3 = Point(1, 2)

print(p1 == p3)  # True
print(p1 < p2)   # True
print(p1 >= p3)  # True
\`\`\`

## 六、综合示例：分数类

\`\`\`python
import math

class Fraction:
    """分数类：完整的运算符重载"""
    
    def __init__(self, numerator, denominator=1):
        if denominator == 0:
            raise ZeroDivisionError("分母不能为 0")
        # 约分
        gcd = math.gcd(abs(numerator), abs(denominator))
        self.numerator = numerator // gcd
        self.denominator = denominator // gcd
        # 分母统一为正
        if self.denominator < 0:
            self.numerator = -self.numerator
            self.denominator = -self.denominator
    
    def __repr__(self):
        if self.denominator == 1:
            return f"Fraction({self.numerator})"
        return f"Fraction({self.numerator}, {self.denominator})"
    
    def __str__(self):
        if self.denominator == 1:
            return str(self.numerator)
        return f"{self.numerator}/{self.denominator}"
    
    # 算术运算
    def __add__(self, other):
        if isinstance(other, int):
            other = Fraction(other)
        if isinstance(other, Fraction):
            new_num = self.numerator * other.denominator + other.numerator * self.denominator
            new_den = self.denominator * other.denominator
            return Fraction(new_num, new_den)
        return NotImplemented
    
    def __radd__(self, other):
        return self.__add__(other)
    
    def __sub__(self, other):
        if isinstance(other, int):
            other = Fraction(other)
        if isinstance(other, Fraction):
            new_num = self.numerator * other.denominator - other.numerator * self.denominator
            new_den = self.denominator * other.denominator
            return Fraction(new_num, new_den)
        return NotImplemented
    
    def __mul__(self, other):
        if isinstance(other, int):
            other = Fraction(other)
        if isinstance(other, Fraction):
            return Fraction(
                self.numerator * other.numerator,
                self.denominator * other.denominator
            )
        return NotImplemented
    
    def __rmul__(self, other):
        return self.__mul__(other)
    
    def __truediv__(self, other):
        if isinstance(other, int):
            other = Fraction(other)
        if isinstance(other, Fraction):
            return Fraction(
                self.numerator * other.denominator,
                self.denominator * other.numerator
            )
        return NotImplemented
    
    # 一元运算
    def __neg__(self):
        return Fraction(-self.numerator, self.denominator)
    
    def __abs__(self):
        return Fraction(abs(self.numerator), self.denominator)
    
    # 比较
    def __eq__(self, other):
        if isinstance(other, int):
            other = Fraction(other)
        if isinstance(other, Fraction):
            return (self.numerator, self.denominator) == (other.numerator, other.denominator)
        return NotImplemented
    
    def __lt__(self, other):
        if isinstance(other, int):
            other = Fraction(other)
        if isinstance(other, Fraction):
            return self.numerator * other.denominator < other.numerator * self.denominator
        return NotImplemented
    
    def __hash__(self):
        return hash((self.numerator, self.denominator))
    
    # 转换
    def __float__(self):
        return self.numerator / self.denominator
    
    def __int__(self):
        return self.numerator // self.denominator

# 测试
f1 = Fraction(1, 2)  # 1/2
f2 = Fraction(3, 4)  # 3/4

print(f1 + f2)  # 5/4
print(f1 - f2)  # -1/4
print(f1 * f2)  # 3/8
print(f1 / f2)  # 2/3
print(f1 + 1)   # 3/2（int 自动转 Fraction）
print(1 + f1)   # 3/2（用 __radd__）
print(-f1)      # -1/2
print(abs(Fraction(-1, 2)))  # 1/2

# 比较
print(f1 < f2)  # True
print(f1 == Fraction(2, 4))  # True（自动约分）

# 转换
print(float(f1))  # 0.5
print(int(f1))    # 0

# 可以放进集合（因为有 __hash__）
fractions = {Fraction(1, 2), Fraction(1, 3), Fraction(2, 4)}
print(fractions)  # {1/3, 1/2}（2/4 等于 1/2，被去重）
\`\`\`

## 七、类型转换魔术方法

\`\`\`python
class Temperature:
    """温度类：支持类型转换"""
    
    def __init__(self, celsius):
        self.celsius = celsius
    
    def __float__(self):
        """float(temp)"""
        return float(self.celsius)
    
    def __int__(self):
        """int(temp)"""
        return int(self.celsius)
    
    def __bool__(self):
        """bool(temp)"""
        return self.celsius != 0
    
    def __complex__(self):
        """complex(temp)"""
        return complex(self.celsius)
    
    def __index__(self):
        """用于切片索引：必须返回 int"""
        return int(self.celsius)
    
    def __round__(self, n=None):
        """round(temp, n)"""
        return round(self.celsius, n) if n else round(self.celsius)
    
    def __format__(self, spec):
        """format / f-string"""
        if spec == "f":
            return f"{self.celsius:.2f}°C"
        elif spec == "k":
            return f"{self.celsius + 273.15:.2f}K"
        return str(self.celsius)

t = Temperature(25.7)

# 类型转换
print(float(t))  # 25.7
print(int(t))    # 25
print(bool(t))   # True
print(complex(t))  # (25.7+0j)
print(round(t))  # 26
print(round(t, 1))  # 25.7

# 格式化
print(f"{t:f}")  # 25.70°C
print(f"{t:k}")  # 298.85K

# 用作索引
lst = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
print(lst[t])  # lst[25] 不行，超出范围
# 实际：t.__index__() 返回 25，作为索引
\`\`\`

## 八、\`__bool__\` vs \`__len__\`

\`\`\`python
class Container:
    """容器类：演示 __bool__ 和 __len__ 的优先级"""
    
    def __init__(self, items):
        self.items = items
    
    def __len__(self):
        return len(self.items)
    
    # 如果同时定义了 __bool__ 和 __len__
    # __bool__ 优先
    def __bool__(self):
        return True  # 即使空，也是 True

c1 = Container([1, 2, 3])
c2 = Container([])

print(bool(c1))  # True
print(bool(c2))  # True（即使空，__bool__ 返回 True）

# 如果只定义 __len__，bool() 会用 len
class OnlyLen:
    def __init__(self, items):
        self.items = items
    def __len__(self):
        return len(self.items)

ol = OnlyLen([])
print(bool(ol))  # False（len 是 0，所以 falsy）

# 规则：
# 1. 如果有 __bool__，用它
# 2. 否则如果有 __len__，用 len(obj) != 0
# 3. 都没有，默认 True
\`\`\`

## 九、运算符重载的注意事项

\`\`\`python
# 1. 返回 NotImplemented，不要抛异常
class Good:
    def __add__(self, other):
        if isinstance(other, Good):
            return Good()
        return NotImplemented  # ✅ 让 Python 尝试 other.__radd__

class Bad:
    def __add__(self, other):
        if not isinstance(other, Bad):
            raise TypeError("类型错误")  # ❌ 不应该抛异常
        return Bad()

# 2. 对称性：a + b 和 b + a 应该结果相同
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __add__(self, other):
        if isinstance(other, Vector):
            return Vector(self.x + other.x, self.y + other.y)
        return NotImplemented
    
    def __radd__(self, other):
        # 当 other + self 时调用
        return self.__add__(other)  # 复用，保证对称

# 3. __iadd__ 必须返回 self
class Stack:
    def __init__(self):
        self.items = []
    
    def __iadd__(self, other):
        self.items.extend(other.items)
        return self  # ✅ 必须 return self

# 4. 不可变类型用 __add__，不用 __iadd__
# 字符串、元组这种不可变类型，+= 总是创建新对象
\`\`\`

## 十、运算符重载一览表

| 运算符 | 方法 | 说明 |
| --- | --- | --- |
| \`+\` | \`__add__\` | 加法 |
| \`-\` | \`__sub__\` | 减法 |
| \`*\` | \`__mul__\` | 乘法 |
| \`/\` | \`__truediv__\` | 真除法 |
| \`//\` | \`__floordiv__\` | 整除 |
| \`%\` | \`__mod__\` | 取模 |
| \`**\` | \`__pow__\` | 幂 |
| \`<<\` | \`__lshift__\` | 左移 |
| \`>>\` | \`__rshift__\` | 右移 |
| \`&\` | \`__and__\` | 按位与 |
| \`|\` | \`__or__\` | 按位或 |
| \`^\` | \`__xor__\` | 按位异或 |
| \`-\`（一元） | \`__neg__\` | 取负 |
| \`+\`（一元） | \`__pos__\` | 取正 |
| \`abs()\` | \`__abs__\` | 绝对值 |
| \`~\` | \`__invert__\` | 按位取反 |
| \`+=\` | \`__iadd__\` | 原地加 |
| \`-=\` | \`__isub__\` | 原地减 |
| \`*=\` | \`__imul__\` | 原地乘 |
| \`==\` | \`__eq__\` | 等于 |
| \`!=\` | \`__ne__\` | 不等于 |
| \`<\` | \`__lt__\` | 小于 |
| \`<=\` | \`__le__\` | 小于等于 |
| \`>\` | \`__gt__\` | 大于 |
| \`>=\` | \`__ge__\` | 大于等于 |
| 反向 \`+\` | \`__radd__\` | 反向加 |
| 反向 \`*\` | \`__rmul__\` | 反向乘 |

## 小结

本章详细介绍了 Python 的运算符重载：

1. **算术运算符**：\`__add__\`、\`__sub__\`、\`__mul__\`、\`__truediv__\` 等
2. **反向运算符**：\`__radd__\`、\`__rmul__\` 等，让 \`n * obj\` 也能工作
3. **一元运算符**：\`__neg__\`（-v）、\`__pos__\`（+v）、\`__abs__\`（abs(v)）
4. **复合赋值**：\`__iadd__\`、\`__imul__\` 等，原地修改要返回 \`self\`
5. **比较运算**：\`__eq__\`、\`__lt__\` 等，用 \`@total_ordering\` 自动补全
6. **类型转换**：\`__float__\`、\`__int__\`、\`__bool__\`、\`__round__\`
7. **\`NotImplemented\`**：类型不匹配时返回，让 Python 尝试其他方法
8. **\`__bool__\` 优先于 \`__len__\`**：决定对象的 truthy/falsy

运算符重载让自定义类的代码更自然、更数学化。但不要滥用——只在实际有意义时重载（向量可以加，但"用户"加"用户"就不知所云）。下一章我们学习**封装与访问控制**。`
  },

  // =========================================================
  // 第三十七章：封装与访问控制
  // =========================================================
  {
    id: "py10-ch37",
    group: "第八部分 面向对象进阶",
    icon: "🔒",
    title: "第三十七章 封装与访问控制",
    content: `## 封装：隐藏实现，暴露接口

**封装**是 OOP 三大特性之一（另两个是继承和多态）。它把数据和行为打包到对象里，并隐藏内部实现细节，只暴露必要的接口。Python 的封装靠**约定**而非强制——这是 Python 与 Java/C++ 的核心区别。

## 一、公开、受保护、私有

\`\`\`python
class MyClass:
    """演示三种访问级别"""
    
    public_var = "公开变量"       # 无下划线：公开
    _protected_var = "受保护变量"  # 单下划线：约定私有
    __private_var = "私有变量"    # 双下划线：名称改写（name mangling）
    
    def __init__(self):
        self.public = "公开"
        self._protected = "受保护"
        self.__private = "私有"
    
    def public_method(self):
        """公开方法：外部可以调用"""
        return f"公开方法，访问私有: {self.__private}"
    
    def _protected_method(self):
        """受保护方法：约定内部使用"""
        return "受保护方法"
    
    def __private_method(self):
        """私有方法：名称改写后外部不易访问"""
        return "私有方法"

obj = MyClass()

# 1. 公开：随时访问
print(obj.public)           # 公开
print(obj.public_method())  # 公开方法，访问私有: 私有

# 2. 受保护：能访问，但不推荐
print(obj._protected)         # 受保护（能访问，但约定不访问）
print(obj._protected_method())  # 受保护方法

# 3. 私有：名称改写，不易访问
# print(obj.__private)  # ❌ AttributeError
# print(obj.__private_method())  # ❌ AttributeError

# 但实际上可以通过改名访问（Python 没有真正的私有）
print(obj._MyClass__private)         # 私有
print(obj._MyClass__private_method())  # 私有方法
\`\`\`

## 二、单下划线 \`_\`：约定受保护

\`\`\`python
class Database:
    """数据库类"""
    
    def __init__(self):
        self._connection = None  # 约定：内部使用，外部不应直接访问
        self._is_connected = False
    
    def connect(self):
        """公开方法：连接数据库"""
        self._open_connection()  # 内部调用"受保护"方法
        self._is_connected = True
    
    def _open_connection(self):
        """受保护方法：约定内部使用"""
        print("打开数据库连接...")
        self._connection = "db_connection_object"
    
    def query(self, sql):
        """公开方法：查询"""
        if not self._is_connected:
            raise RuntimeError("未连接数据库")
        return f"执行: {sql}"

db = Database()
db.connect()  # 公开 API
print(db.query("SELECT * FROM users"))

# 技术上能访问受保护成员，但不推荐
print(db._is_connected)  # True（能访问，但破坏了封装）
# 团队约定：单下划线开头的东西，外部不要碰
\`\`\`

## 三、双下划线 \`__\`：名称改写

\`\`\`python
class BankAccount:
    """银行账户：用 __ 实现名称改写"""
    
    def __init__(self, owner, balance):
        self.owner = owner
        self.__balance = balance  # 改名为 _BankAccount__balance
    
    def deposit(self, amount):
        self.__balance += amount  # 内部访问，正常
    
    def withdraw(self, amount):
        if amount > self.__balance:
            raise ValueError("余额不足")
        self.__balance -= amount
    
    def get_balance(self):
        return self.__balance

acc = BankAccount("张三", 1000)

# 直接访问 __balance 会失败
# print(acc.__balance)  # ❌ AttributeError

# 必须通过方法
print(acc.get_balance())  # 1000
acc.deposit(500)
print(acc.get_balance())  # 1500

# 但通过改名能访问（不是真正的私有）
print(acc._BankAccount__balance)  # 1500
\`\`\`

**名称改写的目的：避免子类覆盖**

\`\`\`python
class Parent:
    def __init__(self):
        self.__value = "父类的 value"  # 改名 _Parent__value
    
    def show(self):
        print(self.__value)  # 访问 _Parent__value

class Child(Parent):
    def __init__(self):
        super().__init__()
        self.__value = "子类的 value"  # 改名 _Child__value（不覆盖父类）
    
    def show_child(self):
        print(self.__value)  # 访问 _Child__value

c = Child()
c.show()       # 父类的 value（_Parent__value）
c.show_child()  # 子类的 value（_Child__value）

# 两个 __value 互不干扰
print(c._Parent__value)  # 父类的 value
print(c._Child__value)   # 子类的 value
\`\`\`

## 四、Python 没有真正的私有

\`\`\`python
class Secret:
    def __init__(self):
        self.__data = "secret"
    
    def __method(self):
        return "private method"

s = Secret()

# 1. 通过改名访问
print(s._Secret__data)      # secret
print(s._Secret__method())  # private method

# 2. 通过 __dict__ 查看
print(s.__dict__)  # {'_Secret__data': 'secret'}

# 3. 通过 getattr
print(getattr(s, '_Secret__data'))  # secret

# Python 的哲学："我们都是成年人"
# 不强制私有，靠约定和文档
# 如果你真的不想让人访问，用 C 扩展或 __slots__
\`\`\`

## 五、用 \`@property\` 实现封装

\`\`\`python
class Temperature:
    """温度类：用 @property 实现封装"""
    
    def __init__(self, celsius):
        self._celsius = celsius  # 内部用 _celsius
    
    @property
    def celsius(self):
        """对外暴露 celsius，但实际访问 _celsius"""
        return self._celsius
    
    @celsius.setter
    def celsius(self, value):
        """带校验的设置"""
        if value < -273.15:
            raise ValueError("低于绝对零度")
        self._celsius = value
    
    @property
    def fahrenheit(self):
        """计算属性"""
        return self._celsius * 9 / 5 + 32

t = Temperature(25)

# 外部看起来像直接访问属性
print(t.celsius)      # 25
t.celsius = 30        # 像赋值，实际调用 setter（带校验）
print(t.fahrenheit)   # 86.0

# 但不能直接访问 _celsius（约定）
# t._celsius = -300  # 技术上能，但破坏封装

# 好处：
# 1. 内部存储和外部接口分离
# 2. 可以随时加校验，调用方代码不变
# 3. 可以做计算属性
\`\`\`

## 六、\`__slots__\`：限制属性

\`\`\`python
class Point:
    """用 __slots__ 限制属性"""
    
    __slots__ = ('x', 'y')  # 只允许有 x 和 y
    
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __repr__(self):
        return f"Point({self.x}, {self.y})"

p = Point(3, 4)
print(p.x, p.y)

# 不能添加新属性
try:
    p.z = 5  # ❌ AttributeError
except AttributeError as e:
    print(e)

# 没有 __dict__
# print(p.__dict__)  # ❌ AttributeError

# 好处：
# 1. 节省内存（不用 __dict__）
# 2. 访问更快
# 3. 防止拼写错误
import sys
p1 = Point(1, 2)
print(sys.getsizeof(p1))  # 较小

class NormalPoint:
    def __init__(self, x, y):
        self.x = x
        self.y = y

p2 = NormalPoint(1, 2)
print(sys.getsizeof(p2))  # 较大（有 __dict__）
\`\`\`

**\`__slots__\` 的继承**

\`\`\`python
class Animal:
    __slots__ = ('name', 'age')

class Dog(Animal):
    # 子类也要定义 __slots__ 才能添加自己的属性
    __slots__ = ('breed',)  # 包含父类的 + 自己的
    
    def __init__(self, name, age, breed):
        self.name = name
        self.age = age
        self.breed = breed

d = Dog("旺财", 3, "金毛")
print(d.name, d.age, d.breed)

# 如果子类不定义 __slots__，会有 __dict__
class Cat(Animal):
    pass  # 没定义 __slots__

c = Cat()
# c 可以有 __dict__
# 但只能加 __slots__ 之外的属性
\`\`\`

## 七、\`__init_subclass__\`：拦截子类创建

\`\`\`python
class Plugin:
    """插件基类：用 __init_subclass__ 注册子类"""
    
    registry = {}
    
    def __init_subclass__(cls, **kwargs):
        """子类被创建时自动调用"""
        super().__init_subclass__(**kwargs)
        # 自动注册子类
        Plugin.registry[cls.__name__] = cls
        print(f"注册插件: {cls.__name__}")
    
    def run(self):
        raise NotImplementedError

class CSVPlugin(Plugin):
    def run(self):
        return "处理 CSV"

class JSONPlugin(Plugin):
    def run(self):
        return "处理 JSON"

# 创建子类时自动注册
# 输出：
# 注册插件: CSVPlugin
# 注册插件: JSONPlugin

print(Plugin.registry)
# {'CSVPlugin': <class '...CSVPlugin'>, 'JSONPlugin': <class '...JSONPlugin'>}

# 用名字创建实例
def create_plugin(name):
    cls = Plugin.registry.get(name)
    if cls is None:
        raise ValueError(f"未知插件: {name}")
    return cls()

p = create_plugin("CSVPlugin")
print(p.run())  # 处理 CSV
\`\`\`

## 八、抽象基类（ABC）简介

\`\`\`python
from abc import ABC, abstractmethod

class Storage(ABC):
    """存储抽象基类：定义接口"""
    
    @abstractmethod
    def save(self, key, value):
        """保存数据：子类必须实现"""
        pass
    
    @abstractmethod
    def load(self, key):
        """加载数据：子类必须实现"""
        pass
    
    @abstractmethod
    def delete(self, key):
        """删除数据：子类必须实现"""
        pass
    
    # 通用方法：子类直接继承
    def exists(self, key):
        return self.load(key) is not None

# 抽象类不能实例化
# storage = Storage()  # ❌ TypeError

class MemoryStorage(Storage):
    """内存存储：实现所有抽象方法"""
    
    def __init__(self):
        self._data = {}
    
    def save(self, key, value):
        self._data[key] = value
    
    def load(self, key):
        return self._data.get(key)
    
    def delete(self, key):
        self._data.pop(key, None)

class FileStorage(Storage):
    """文件存储：另一种实现"""
    
    def __init__(self, filename):
        self.filename = filename
        self._data = {}
    
    def save(self, key, value):
        self._data[key] = value
        # 实际应该写文件
    
    def load(self, key):
        # 实际应该读文件
        return self._data.get(key)
    
    def delete(self, key):
        self._data.pop(key, None)

# 多态：统一接口
storage = MemoryStorage()
storage.save("name", "张三")
print(storage.load("name"))  # 张三
print(storage.exists("name"))  # True
print(storage.exists("age"))   # False
\`\`\`

## 九、封装的最佳实践

\`\`\`python
# 1. 默认公开，需要时才"私有"
class Good:
    def __init__(self):
        self.name = "公开"  # 默认公开
        self._internal = "内部"  # 单下划线表示内部

# 2. 用 @property 控制读写
class Account:
    def __init__(self, balance):
        self._balance = balance
    
    @property
    def balance(self):
        return self._balance  # 只读
    
    def deposit(self, amount):  # 通过方法修改
        self._balance += amount

# 3. 不要过度封装
class OverEncapsulated:
    def __init__(self):
        self._x = 0
    
    def get_x(self):  # ❌ Java 风格，Python 用 @property
        return self._x
    
    def set_x(self, value):  # ❌
        self._x = value

class Pythonic:
    def __init__(self):
        self._x = 0
    
    @property
    def x(self):  # ✅ Python 风格
        return self._x
    
    @x.setter
    def x(self, value):
        self._x = value

# 4. 内部实现可以随时改，接口保持稳定
class Logger:
    def __init__(self):
        # 内部存储从列表改成字典，外部无感知
        self._messages = {}  # 原来是 []
    
    def log(self, message):
        # 外部接口不变
        import time
        timestamp = time.time()
        self._messages[timestamp] = message
    
    def get_messages(self):
        return list(self._messages.values())
\`\`\`

## 十、综合示例：安全的账户系统

\`\`\`python
class BankAccount:
    """银行账户：完整的封装示例"""
    
    __slots__ = ('_owner', '_balance', '_transactions', '_frozen')
    
    def __init__(self, owner, initial_balance=0):
        self._owner = owner
        self._balance = initial_balance
        self._transactions = []
        self._frozen = False
    
    # 只读属性
    @property
    def owner(self):
        return self._owner
    
    @property
    def balance(self):
        return self._balance
    
    @property
    def is_frozen(self):
        return self._frozen
    
    # 操作方法
    def deposit(self, amount):
        """存款"""
        self._check_frozen()
        if amount <= 0:
            raise ValueError("金额必须为正")
        self._balance += amount
        self._add_transaction("deposit", amount)
    
    def withdraw(self, amount):
        """取款"""
        self._check_frozen()
        if amount <= 0:
            raise ValueError("金额必须为正")
        if amount > self._balance:
            raise ValueError("余额不足")
        self._balance -= amount
        self._add_transaction("withdraw", amount)
    
    def freeze(self):
        """冻结账户"""
        self._frozen = True
    
    def unfreeze(self):
        """解冻账户"""
        self._frozen = False
    
    def get_statement(self):
        """获取对账单"""
        return self._transactions.copy()
    
    # 内部方法
    def _check_frozen(self):
        """检查是否冻结"""
        if self._frozen:
            raise RuntimeError("账户已冻结")
    
    def _add_transaction(self, type_, amount):
        """记录交易"""
        import time
        self._transactions.append({
            "type": type_,
            "amount": amount,
            "balance_after": self._balance,
            "timestamp": time.time(),
        })
    
    def __repr__(self):
        return f"BankAccount({self._owner!r}, balance={self._balance})"

# 使用
acc = BankAccount("张三", 1000)
print(acc.owner)     # 张三
print(acc.balance)   # 1000

acc.deposit(500)
acc.withdraw(200)
print(acc.balance)   # 1300

# 不能直接修改余额
# acc.balance = 9999  # ❌ AttributeError（只读）

# 不能直接修改内部状态
# acc._balance = 9999  # 技术上能，但破坏封装

# 冻结后不能操作
acc.freeze()
try:
    acc.withdraw(100)
except RuntimeError as e:
    print(e)  # 账户已冻结

# 解冻
acc.unfreeze()
acc.withdraw(100)
print(acc.balance)  # 1200

# 查看对账单
for tx in acc.get_statement():
    print(tx)
\`\`\`

## 十一、访问控制对比

| 语言 | 私有机制 | 强制性 |
| --- | --- | --- |
| Python | \`_\` 约定 + \`__\` 改名 | 无（靠约定） |
| Java | \`private\` 关键字 | 强制 |
| C++ | \`private\` 关键字 | 强制 |
| JavaScript | \`#\` 前缀 | 强制（ES2022+） |

\`\`\`python
# Python 的哲学
# "We are all consenting adults here"（我们都是成年人）
# 不强制私有，相信开发者遵守约定
# 好处：灵活、调试方便、能 hack
# 坏处：需要团队自律

# 实际建议：
# 1. 单下划线 _var：内部使用，外部不应访问
# 2. 双下划线 __var：避免子类覆盖（很少用）
# 3. @property：控制读写
# 4. __slots__：限制属性
# 5. ABC：定义接口
\`\`\`

## 十二、何时用 \`__\`（双下划线）

\`\`\`python
# 大多数情况用 _ 就够了
class Good:
    def __init__(self):
        self._internal = "内部"  # 单下划线足够

# 只在以下情况用 __：
# 1. 担心子类覆盖你的属性
class Config:
    def __init__(self):
        self.__settings = {}  # 子类的 __settings 不会覆盖
    
    def set(self, key, value):
        self.__settings[key] = value
    
    def get(self, key):
        return self.__settings.get(key)

class MyConfig(Config):
    def __init__(self):
        super().__init__()
        self.__settings = {"override": True}  # 不会覆盖父类

c = MyConfig()
c.set("a", 1)
print(c.get("a"))  # 1（父类的 __settings 没被覆盖）

# 2. 框架/库内部使用，避免和用户代码冲突

# 大多数情况，单下划线 _ 就够了
\`\`\`

## 十三、单下划线开头的特殊用途

\`\`\`python
# 1. 单独的下划线 _：表示"不关心这个值"
for _ in range(5):
    print("hello")  # 不用循环变量

# 解包时忽略某些值
_, name, _ = (1, "张三", 2)
print(name)  # 张三

# 2. 在交互式解释器中，_ 保存上一个表达式的结果
# >>> 1 + 2
# 3
# >>> _
# 3

# 3. 模块内的单下划线开头：from module import * 不会导入
# my_module.py:
# _private_func()  # 不会被 from my_module import * 导入
# public_func()    # 会被导入

# 4. 类内单下划线：约定受保护
class Example:
    def _helper(self):
        """辅助方法，约定内部使用"""
        pass
\`\`\`

## 小结

本章介绍了 Python 的封装与访问控制：

1. **三种访问级别**：公开（无下划线）、受保护（\`_\`）、私有（\`__\`）
2. **单下划线 \`_\`**：约定受保护，能访问但不推荐
3. **双下划线 \`__\`**：名称改写，避免子类覆盖，不是真正私有
4. **Python 没有真正的私有**：通过改名、\`__dict__\` 都能访问
5. **\`@property\`**：实现封装的标准方式，控制读写、加校验
6. **\`__slots__\`**：限制属性，节省内存，防止拼写错误
7. **\`__init_subclass__\`**：拦截子类创建，自动注册
8. **抽象基类 ABC**：定义接口，强制子类实现
9. **Python 哲学**："我们都是成年人"，靠约定而非强制

封装的核心是"隐藏实现，暴露接口"。在 Python 中，用 \`_\` 表示内部使用，用 \`@property\` 控制访问，用 ABC 定义接口，就够了。下一章我们学习**抽象类与接口**——更深入地讨论接口设计。`
  },

  // =========================================================
  // 第三十八章：抽象类与接口
  // =========================================================
  {
    id: "py10-ch38",
    group: "第八部分 面向对象进阶",
    icon: "🎭",
    title: "第三十八章 抽象类与接口",
    content: `## 抽象类与接口：定义"契约"

抽象类和接口是 OOP 中定义"契约"的工具：规定子类必须实现哪些方法，但不提供具体实现。这让你能写出"针对接口编程"的代码——降低耦合，提高扩展性。

## 一、抽象基类（ABC）

\`\`\`python
from abc import ABC, abstractmethod

class Animal(ABC):
    """动物抽象基类"""
    
    def __init__(self, name):
        self.name = name
    
    @abstractmethod
    def speak(self):
        """发声：子类必须实现"""
        pass
    
    @abstractmethod
    def move(self):
        """移动：子类必须实现"""
        pass
    
    # 普通方法：子类直接继承
    def sleep(self):
        """通用方法"""
        print(f"{self.name} 在睡觉")

# 抽象类不能实例化
# animal = Animal("无名")  # ❌ TypeError: 抽象类不能实例化

class Dog(Animal):
    """狗：实现所有抽象方法"""
    
    def speak(self):
        return f"{self.name}: 汪汪！"
    
    def move(self):
        return f"{self.name} 在跑"

class Cat(Animal):
    """猫：实现所有抽象方法"""
    
    def speak(self):
        return f"{self.name}: 喵喵！"
    
    def move(self):
        return f"{self.name} 在走"

# 子类必须实现所有抽象方法才能实例化
dog = Dog("旺财")
print(dog.speak())  # 旺财: 汪汪！
print(dog.move())   # 旺财 在跑
dog.sleep()         # 旺财 在睡觉（继承的方法）

# 如果没实现所有抽象方法，仍然是抽象类
class Bird(Animal):
    def speak(self):
        return f"{self.name}: 叽叽！"
    # 没实现 move，还是抽象类

# bird = Bird("小黄")  # ❌ TypeError（还是抽象类）
\`\`\`

## 二、抽象属性 \`@abstractproperty\`

\`\`\`python
from abc import ABC, abstractmethod

class Shape(ABC):
    """图形抽象类"""
    
    @property
    @abstractmethod
    def area(self):
        """面积：子类必须实现"""
        pass
    
    @property
    @abstractmethod
    def perimeter(self):
        """周长：子类必须实现"""
        pass

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius
    
    @property
    def area(self):
        import math
        return math.pi * self.radius ** 2
    
    @property
    def perimeter(self):
        import math
        return 2 * math.pi * self.radius

# shape = Shape()  # ❌ 抽象类不能实例化
circle = Circle(5)
print(circle.area)       # 78.54...
print(circle.perimeter)  # 31.42...
\`\`\`

## 三、抽象类 vs 接口

\`\`\`python
# 在 Python 中，抽象类和接口的界限比较模糊
# 但概念上：

# 抽象类：可以有属性、具体方法、抽象方法
class AbstractClass(ABC):
    """抽象类：可以有具体实现"""
    
    def __init__(self):
        self.value = 10  # 有属性
    
    def concrete_method(self):
        """具体方法：子类可以直接用"""
        return self.value * 2
    
    @abstractmethod
    def abstract_method(self):
        """抽象方法：子类必须实现"""
        pass

# 接口（Python 风格）：只有抽象方法，没有实现
class Interface(ABC):
    """接口：只有抽象方法"""
    
    @abstractmethod
    def method1(self):
        pass
    
    @abstractmethod
    def method2(self):
        pass

# Java 区分 abstract class 和 interface，Python 不区分
# Python 用 ABC 实现两者
\`\`\`

## 四、实战：插件系统

\`\`\`python
from abc import ABC, abstractmethod

class Plugin(ABC):
    """插件接口"""
    
    @abstractmethod
    def get_name(self):
        """插件名"""
        pass
    
    @abstractmethod
    def initialize(self):
        """初始化"""
        pass
    
    @abstractmethod
    def execute(self, *args, **kwargs):
        """执行"""
        pass
    
    @abstractmethod
    def cleanup(self):
        """清理"""
        pass

class CSVPlugin(Plugin):
    """CSV 处理插件"""
    
    def get_name(self):
        return "CSV Plugin"
    
    def initialize(self):
        print(f"[{self.get_name()}] 初始化")
    
    def execute(self, data):
        print(f"[{self.get_name()}] 处理 CSV: {data}")
        return f"csv_{data}"
    
    def cleanup(self):
        print(f"[{self.get_name()}] 清理")

class JSONPlugin(Plugin):
    """JSON 处理插件"""
    
    def get_name(self):
        return "JSON Plugin"
    
    def initialize(self):
        print(f"[{self.get_name()}] 初始化")
    
    def execute(self, data):
        print(f"[{self.get_name()}] 处理 JSON: {data}")
        return f"json_{data}"
    
    def cleanup(self):
        print(f"[{self.get_name()}] 清理")

# 插件管理器
class PluginManager:
    def __init__(self):
        self._plugins = []
    
    def register(self, plugin):
        """注册插件"""
        if not isinstance(plugin, Plugin):
            raise TypeError("必须是 Plugin 的子类")
        self._plugins.append(plugin)
        plugin.initialize()
    
    def run_all(self, data):
        """运行所有插件"""
        results = []
        for plugin in self._plugins:
            try:
                result = plugin.execute(data)
                results.append(result)
            except Exception as e:
                print(f"插件 {plugin.get_name()} 出错: {e}")
        return results
    
    def shutdown(self):
        """关闭所有插件"""
        for plugin in self._plugins:
            plugin.cleanup()

# 使用
manager = PluginManager()
manager.register(CSVPlugin())
manager.register(JSONPlugin())

results = manager.run_all("test_data")
print(results)

manager.shutdown()
\`\`\`

## 五、\`Protocol\`：结构化类型

\`\`\`python
from typing import Protocol, runtime_checkable

# Protocol 是 Python 3.8+ 的特性
# 它定义"结构化类型"：只要有这些方法就算实现了，不需要继承

@runtime_checkable  # 让 isinstance 能检查
class Drawable(Protocol):
    """可绘制接口：只要有 draw 方法就算"""
    
    def draw(self) -> str:
        ...

# Circle 不继承 Drawable，但有 draw 方法
class Circle:
    def draw(self):
        return "画圆"

class Square:
    def draw(self):
        return "画方"

class Text:
    def render(self):  # 注意：没有 draw 方法
        return "渲染文本"

# 用 isinstance 检查
print(isinstance(Circle(), Drawable))  # True（有 draw 方法）
print(isinstance(Square(), Drawable))  # True
print(isinstance(Text(), Drawable))    # False（没有 draw）

# 函数参数用 Protocol 类型
def render(obj: Drawable):
    print(obj.draw())

render(Circle())  # 画圆
render(Square())  # 画方
# render(Text())  # mypy 会警告，但运行时不报错

# Protocol 的好处：
# 1. 不需要继承，更灵活（鸭子类型的形式化）
# 2. 可以用 isinstance 检查（如果 @runtime_checkable）
# 3. 静态检查工具能验证
\`\`\`

## 六、Protocol 进阶

\`\`\`python
from typing import Protocol, runtime_checkable

# 1. Protocol 可以有多个方法
@runtime_checkable
class Comparable(Protocol):
    def __lt__(self, other) -> bool: ...
    def __eq__(self, other) -> bool: ...

class Number:
    def __init__(self, value):
        self.value = value
    
    def __lt__(self, other):
        return self.value < other.value
    
    def __eq__(self, other):
        return self.value == other.value

n1, n2 = Number(1), Number(2)
print(isinstance(n1, Comparable))  # True
print(n1 < n2)  # True

# 2. Protocol 可以有属性
class HasName(Protocol):
    name: str  # 必须有 name 属性

class Person:
    def __init__(self, name):
        self.name = name

class Animal:
    def __init__(self, species):
        self.species = species  # 没有 name

p = Person("张三")
a = Animal("狗")
print(isinstance(p, HasName))  # True
print(isinstance(a, HasName))  # False

# 3. 继承 Protocol
class NamedDrawable(Drawable, Protocol):
    """既有 draw 方法，又有 name 属性"""
    name: str

# 4. 显式继承（让类型检查器知道）
class MyShape(NamedDrawable):
    """显式声明实现 NamedDrawable"""
    name: str = "形状"
    
    def draw(self) -> str:
        return "画形状"

# 显式继承后，类型检查器会验证你真的实现了所有方法
\`\`\`

## 七、抽象类 vs Protocol 对比

| 特性 | ABC（抽象类） | Protocol |
| --- | --- | --- |
| 关系 | 显式继承 | 结构化（隐式） |
| 实例化 | 抽象类不能实例化 | 可以实例化（只是类型约定） |
| isinstance | 默认支持 | 需要 @runtime_checkable |
| 方法实现 | 可以有具体方法 | 通常只有声明 |
| 适用场景 | 强制子类实现 | 鸭子类型的形式化 |

\`\`\`python
# ABC：显式继承，强制实现
class ABCExample(ABC):
    @abstractmethod
    def method(self):
        pass

class ABCImpl(ABCExample):  # 必须显式继承
    def method(self):
        return "实现"

# Protocol：不要求继承，有方法就行
class ProtocolExample(Protocol):
    def method(self) -> str: ...

class ProtocolImpl:  # 不继承 ProtocolExample
    def method(self):
        return "实现"

# 检查
print(isinstance(ABCImpl(), ABCExample))     # True
print(isinstance(ProtocolImpl(), ProtocolExample))  # True

# 选择建议：
# - 想强制子类实现 → 用 ABC
# - 只想定义"接口"，不强制继承 → 用 Protocol
# - 框架/库的扩展点 → 用 ABC
# - 函数参数的类型注解 → 用 Protocol
\`\`\`

## 八、实战：数据存储接口

\`\`\`python
from abc import ABC, abstractmethod
from typing import Optional, List

class DataStorage(ABC):
    """数据存储抽象基类"""
    
    @abstractmethod
    def save(self, key: str, value: any) -> None:
        """保存"""
        pass
    
    @abstractmethod
    def load(self, key: str) -> Optional[any]:
        """加载"""
        pass
    
    @abstractmethod
    def delete(self, key: str) -> bool:
        """删除，返回是否成功"""
        pass
    
    @abstractmethod
    def keys(self) -> List[str]:
        """所有键"""
        pass
    
    # 通用方法：子类直接继承
    def exists(self, key: str) -> bool:
        return self.load(key) is not None
    
    def clear(self):
        """清空"""
        for key in list(self.keys()):
            self.delete(key)

# 实现 1：内存存储
class MemoryStorage(DataStorage):
    def __init__(self):
        self._data = {}
    
    def save(self, key, value):
        self._data[key] = value
    
    def load(self, key):
        return self._data.get(key)
    
    def delete(self, key):
        if key in self._data:
            del self._data[key]
            return True
        return False
    
    def keys(self):
        return list(self._data.keys())

# 实现 2：文件存储（简化）
class FileStorage(DataStorage):
    def __init__(self, filename="data.txt"):
        self.filename = filename
        self._data = {}
        self._load()
    
    def _load(self):
        try:
            with open(self.filename, "r") as f:
                for line in f:
                    key, value = line.strip().split("=", 1)
                    self._data[key] = value
        except FileNotFoundError:
            pass
    
    def _save_all(self):
        with open(self.filename, "w") as f:
            for key, value in self._data.items():
                f.write(f"{key}={value}\\n")
    
    def save(self, key, value):
        self._data[key] = str(value)
        self._save_all()
    
    def load(self, key):
        return self._data.get(key)
    
    def delete(self, key):
        if key in self._data:
            del self._data[key]
            self._save_all()
            return True
        return False
    
    def keys(self):
        return list(self._data.keys())

# 多态：统一接口使用
def demo_storage(storage: DataStorage, name: str):
    print(f"\\n=== {name} ===")
    storage.save("name", "张三")
    storage.save("age", "25")
    
    print(f"name: {storage.load('name')}")
    print(f"age: {storage.load('age')}")
    print(f"keys: {storage.keys()}")
    print(f"exists 'name': {storage.exists('name')}")
    
    storage.delete("name")
    print(f"删除后 exists: {storage.exists('name')}")

# 用内存存储
demo_storage(MemoryStorage(), "内存存储")

# 用文件存储
demo_storage(FileStorage("/tmp/test_data.txt"), "文件存储")
\`\`\`

## 九、接口隔离原则

\`\`\`python
# 接口隔离原则（ISP）：不要让类实现它不需要的方法
# 多个小接口好于一个大接口

# ❌ 不好：一个大接口
class BadWorker(ABC):
    @abstractmethod
    def work(self): pass
    
    @abstractmethod
    def eat(self): pass
    
    @abstractmethod
    def sleep(self): pass

# 机器人不需要 eat 和 sleep，但被迫实现
class Robot(BadWorker):
    def work(self):
        print("工作")
    def eat(self):
        pass  # 不需要，但必须实现
    def sleep(self):
        pass  # 不需要，但必须实现

# ✅ 好：拆成小接口
class Workable(ABC):
    @abstractmethod
    def work(self): pass

class Eatable(ABC):
    @abstractmethod
    def eat(self): pass

class Sleepable(ABC):
    @abstractmethod
    def sleep(self): pass

class Human(Workable, Eatable, Sleepable):
    def work(self):
        print("人工作")
    def eat(self):
        print("人吃饭")
    def sleep(self):
        print("人睡觉")

class Robot(Workable):  # 只实现 Workable
    def work(self):
        print("机器人工作")

# 函数参数用小接口
def manage_work(worker: Workable):
    worker.work()

manage_work(Human())  # 人工作
manage_work(Robot())  # 机器人工作
\`\`\`

## 十、抽象类的钩子方法

\`\`\`python
from abc import ABC, abstractmethod

class Template(ABC):
    """模板方法模式：定义算法骨架"""
    
    def execute(self):
        """模板方法：定义流程"""
        self.step1()
        result = self.step2()  # 子类实现的"钩子"
        self.step3(result)
    
    def step1(self):
        """通用步骤：所有子类共享"""
        print("步骤 1：初始化")
    
    @abstractmethod
    def step2(self):
        """抽象步骤：子类必须实现"""
        pass
    
    def step3(self, result):
        """通用步骤"""
        print(f"步骤 3：处理结果 {result}")

class ConcreteA(Template):
    def step2(self):
        print("步骤 2A：方式 A")
        return "A"

class ConcreteB(Template):
    def step2(self):
        print("步骤 2B：方式 B")
        return "B"

# 使用
a = ConcreteA()
a.execute()
# 步骤 1：初始化
# 步骤 2A：方式 A
# 步骤 3：处理结果 A

b = ConcreteB()
b.execute()
# 步骤 1：初始化
# 步骤 2B：方式 B
# 步骤 3：处理结果 B
\`\`\`

## 十一、抽象类的默认实现

\`\`\`python
from abc import ABC, abstractmethod

class Logger(ABC):
    """日志器：抽象方法可以有默认实现"""
    
    @abstractmethod
    def write(self, message):
        """写入日志：子类必须实现"""
        pass
    
    # 用 super() 调用抽象方法的"默认实现"
    def log(self, level, message):
        formatted = f"[{level}] {message}"
        self.write(formatted)
    
    def info(self, message):
        self.log("INFO", message)
    
    def error(self, message):
        self.log("ERROR", message)

class ConsoleLogger(Logger):
    def write(self, message):
        print(message)

class FileLogger(Logger):
    def __init__(self, filename):
        self.filename = filename
    
    def write(self, message):
        with open(self.filename, "a") as f:
            f.write(message + "\\n")

# 使用
logger = ConsoleLogger()
logger.info("应用启动")
logger.error("出错了")

# 切换实现，调用方式不变
file_logger = FileLogger("/tmp/app.log")
file_logger.info("写入文件")
\`\`\`

## 十二、综合示例：支付系统

\`\`\`python
from abc import ABC, abstractmethod
from typing import Optional

class PaymentMethod(ABC):
    """支付方式抽象基类"""
    
    def __init__(self, name):
        self.name = name
    
    @abstractmethod
    def pay(self, amount: float) -> bool:
        """支付，返回是否成功"""
        pass
    
    @abstractmethod
    def refund(self, amount: float) -> bool:
        """退款"""
        pass
    
    @abstractmethod
    def verify(self) -> bool:
        """验证支付方式是否可用"""
        pass
    
    def __str__(self):
        return f"{self.__class__.__name__}({self.name})"

class CreditCard(PaymentMethod):
    def __init__(self, name, card_number):
        super().__init__(name)
        self.card_number = card_number
        self.balance = 10000  # 模拟额度
    
    def verify(self):
        # 简化：卡号长度对就算有效
        return len(self.card_number) == 16
    
    def pay(self, amount):
        if not self.verify():
            print("信用卡无效")
            return False
        if amount > self.balance:
            print("额度不足")
            return False
        self.balance -= amount
        print(f"信用卡支付 {amount}，剩余额度 {self.balance}")
        return True
    
    def refund(self, amount):
        self.balance += amount
        print(f"信用卡退款 {amount}，额度恢复到 {self.balance}")
        return True

class Alipay(PaymentMethod):
    def __init__(self, name, account):
        super().__init__(name)
        self.account = account
        self.balance = 5000
    
    def verify(self):
        return "@" in self.account
    
    def pay(self, amount):
        if not self.verify():
            print("支付宝账号无效")
            return False
        if amount > self.balance:
            print("余额不足")
            return False
        self.balance -= amount
        print(f"支付宝支付 {amount}，余额 {self.balance}")
        return True
    
    def refund(self, amount):
        self.balance += amount
        print(f"支付宝退款 {amount}，余额 {self.balance}")
        return True

# 支付处理器：针对接口编程
class PaymentProcessor:
    def __init__(self):
        self.methods = []
    
    def add_method(self, method: PaymentMethod):
        if not isinstance(method, PaymentMethod):
            raise TypeError("必须是 PaymentMethod")
        self.methods.append(method)
    
    def pay(self, method_name: str, amount: float) -> bool:
        """用指定方式支付"""
        for method in self.methods:
            if method.name == method_name:
                return method.pay(amount)
        print(f"未找到支付方式: {method_name}")
        return False
    
    def list_methods(self):
        return [m.name for m in self.methods]

# 使用
processor = PaymentProcessor()
processor.add_method(CreditCard("信用卡", "1234567890123456"))
processor.add_method(Alipay("支付宝", "zs@example.com"))

print(f"可用方式: {processor.list_methods()}")
processor.pay("信用卡", 1000)
processor.pay("支付宝", 500)
processor.pay("微信", 100)  # 未找到
\`\`\`

## 十三、抽象类设计原则

\`\`\`python
# 1. 依赖抽象，不依赖具体
class Good:
    def __init__(self, storage: DataStorage):  # ✅ 依赖抽象
        self.storage = storage

class Bad:
    def __init__(self, storage: MemoryStorage):  # ❌ 依赖具体
        self.storage = storage

# 2. 接口最小化
class Minimal(ABC):
    @abstractmethod
    def essential_method(self):
        pass
    # 不要加可选的方法

# 3. 接口稳定，实现可变
class StableInterface(ABC):
    """接口一旦发布就不要改（破坏兼容性）"""
    @abstractmethod
    def core_method(self):
        pass

# 4. 用抽象类定义"是什么"，用 Protocol 定义"像什么"
\`\`\`

## 十四、ABC vs Protocol 对比表

| 特性 | ABC | Protocol |
| --- | --- | --- |
| 关系 | 显式继承（is-a） | 结构化（has-methods） |
| 强制 | 子类必须实现抽象方法 | 不强制，类型检查器验证 |
| isinstance | 默认支持 | 需要 @runtime_checkable |
| 具体方法 | 可以有 | 通常没有 |
| 多继承 | 支持 | 支持 |
| 运行时检查 | 强 | 弱 |
| 适用 | 框架、库的基类 | 类型注解、鸭子类型 |

## 小结

本章深入介绍了 Python 的抽象类与接口：

1. **抽象基类 ABC**：用 \`@abstractmethod\` 定义抽象方法，子类必须实现
2. **抽象属性**：\`@property @abstractmethod\` 组合
3. **抽象类 vs 接口**：Python 中界限模糊，都用 ABC 实现
4. **\`Protocol\`**：结构化类型，不要求继承，鸭子类型的形式化
5. **\`@runtime_checkable\`**：让 Protocol 支持 isinstance 检查
6. **接口隔离原则**：多个小接口好于一个大接口
7. **模板方法模式**：用抽象类定义算法骨架
8. **依赖抽象**：针对接口编程，不依赖具体实现

抽象类和接口是大型 Python 项目的核心工具。掌握它们，你的代码会更解耦、更可扩展、更易测试。下一章我们学习**元类入门**——Python 最强大的"魔法"。`
  },

  // =========================================================
  // 第三十九章：元类入门
  // =========================================================
  {
    id: "py10-ch39",
    group: "第八部分 面向对象进阶",
    icon: "🧙",
    title: "第三十九章 元类入门",
    content: `## 元类：创建类的"类"

普通类创建对象，**元类创建类**。在 Python 中，\`type\` 就是默认的元类——所有类的"母亲"。理解元类，你才能理解 Python 类的本质，并能在需要时定制类的创建过程。

## 一、\`type()\` 的两种用法

\`\`\`python
# 1. 查看类型
print(type(42))      # <class 'int'>
print(type("hello")) # <class 'str'>
print(type([1, 2]))  # <class 'list'>

# 类本身也是对象，它的类型是 type
class MyClass:
    pass

print(type(MyClass))  # <class 'type'>
print(type(int))      # <class 'type'>
print(type(str))      # <class 'type'>

# type 自己的类型也是 type
print(type(type))  # <class 'type'>

# 关系：
# MyClass 是 type 的实例（type 创建了 MyClass）
# obj 是 MyClass 的实例（MyClass 创建了 obj）
# type 是"元类"——创建类的类
\`\`\`

**\`type()\` 动态创建类**

\`\`\`python
# type 的第二种用法：动态创建类
# type(类名, 父类元组, 属性字典)

# 等价于：
# class Dog(Animal):
#     species = "犬科"
#     def bark(self):
#         print("汪汪")

def bark(self):
    print("汪汪")

# 用 type 动态创建
Dog = type("Dog", (object,), {
    "species": "犬科",
    "bark": bark,
})

dog = Dog()
print(dog.species)  # 犬科
dog.bark()          # 汪汪
print(type(Dog))    # <class 'type'>
print(type(dog))    # <class '__main__.Dog'>

# 实际应用：根据配置动态创建类
def make_animal_class(name, sound):
    """根据名字和叫声动态创建动物类"""
    def speak(self):
        return f"{self.name}: {sound}！"
    
    return type(name, (object,), {
        "speak": speak,
        "__init__": lambda self, n: setattr(self, "name", n),
    })

Dog = make_animal_class("Dog", "汪汪")
Cat = make_animal_class("Cat", "喵喵")

dog = Dog("旺财")
cat = Cat("小白")
print(dog.speak())  # 旺财: 汪汪！
print(cat.speak())  # 小白: 喵喵！
\`\`\`

## 二、\`__new__\` vs \`__init__\` 在元类中

\`\`\`python
# 元类的 __new__ 和 __init__ 控制类的创建
class MyMeta(type):
    """自定义元类"""
    
    def __new__(mcs, name, bases, namespace):
        """创建类对象（在类被创建前调用）
        
        参数：
            mcs: 元类本身（相当于 cls）
            name: 类名（字符串）
            bases: 父类元组
            namespace: 类的命名空间字典
        """
        print(f"1. MyMeta.__new__ 创建类 {name}")
        print(f"   父类: {bases}")
        print(f"   属性: {list(namespace.keys())}")
        
        # 可以修改类的创建
        # 例如：给所有方法加日志
        cls = super().__new__(mcs, name, bases, namespace)
        return cls
    
    def __init__(cls, name, bases, namespace):
        """初始化类对象"""
        print(f"2. MyMeta.__init__ 初始化类 {name}")
        super().__init__(name, bases, namespace)

# 用自定义元类创建类
class MyClass(metaclass=MyMeta):
    """我的类"""
    
    def method(self):
        return "hello"

# 输出：
# 1. MyMeta.__new__ 创建类 MyClass
#    父类: ()
#    属性: ['__module__', '__qualname__', '__doc__', 'method']
# 2. MyMeta.__init__ 初始化类 MyClass

# 创建实例
obj = MyClass()
print(obj.method())  # hello
\`\`\`

## 三、自定义元类：自动注册

\`\`\`python
class PluginMeta(type):
    """插件元类：自动注册子类"""
    
    registry = {}
    
    def __new__(mcs, name, bases, namespace):
        cls = super().__new__(mcs, name, bases, namespace)
        # 不注册基类
        if bases:  # 有父类才注册（不是 Plugin 基类本身）
            PluginMeta.registry[name] = cls
            print(f"注册插件: {name}")
        return cls

class Plugin(metaclass=PluginMeta):
    """插件基类"""
    pass

class CSVPlugin(Plugin):
    pass
# 输出：注册插件: CSVPlugin

class JSONPlugin(Plugin):
    pass
# 输出：注册插件: JSONPlugin

# 查看注册表
print(PluginMeta.registry)
# {'CSVPlugin': <class 'CSVPlugin'>, 'JSONPlugin': <class 'JSONPlugin'>}
\`\`\`

## 四、元类实战：强制接口实现

\`\`\`python
class InterfaceMeta(type):
    """强制子类实现指定方法"""
    
    required_methods = []  # 子类必须实现的方法
    
    def __new__(mcs, name, bases, namespace):
        cls = super().__new__(mcs, name, bases, namespace)
        
        # 不检查基类本身
        if bases:
            missing = []
            for method in mcs.required_methods:
                # 检查方法是否存在且不是抽象的
                if method not in namespace:
                    # 看看父类有没有具体实现
                    if not any(hasattr(b, method) and 
                              not getattr(getattr(b, method), '__isabstractmethod__', False)
                              for b in bases):
                        missing.append(method)
            
            if missing:
                raise TypeError(
                    f"{name} 必须实现方法: {missing}"
                )
        
        return cls

# 定义接口
class Animal(metaclass=InterfaceMeta):
    required_methods = ['speak', 'move']
    
    def speak(self): raise NotImplementedError
    def move(self): raise NotImplementedError

# 正确实现
class Dog(Animal):
    def speak(self):
        return "汪汪"
    def move(self):
        return "跑"

print(Dog().speak())  # 汪汪

# 缺少方法会报错
try:
    class Cat(Animal):
        def speak(self):
            return "喵喵"
        # 没有 move 方法
except TypeError as e:
    print(e)  # Cat 必须实现方法: ['move']
\`\`\`

## 五、元类实战：自动添加属性

\`\`\`python
class ModelMeta(type):
    """ORM 风格的元类：自动收集字段"""
    
    def __new__(mcs, name, bases, namespace):
        # 收集所有 Field 类型的属性
        fields = {}
        for key, value in list(namespace.items()):
            if isinstance(value, Field):
                fields[key] = value
                value.name = key  # 给字段设置名字
        
        cls = super().__new__(mcs, name, bases, namespace)
        cls._fields = fields
        return cls

class Field:
    """字段描述符"""
    
    def __init__(self, field_type):
        self.field_type = field_type
        self.name = None
    
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)
    
    def __set__(self, obj, value):
        if not isinstance(value, self.field_type):
            raise TypeError(f"{self.name} 必须是 {self.field_type.__name__}")
        obj.__dict__[self.name] = value

class User(metaclass=ModelMeta):
    """用户模型"""
    name = Field(str)
    age = Field(int)
    email = Field(str)

# 元类自动收集了字段
print(User._fields)  # {'name': <Field>, 'age': <Field>, 'email': <Field>}

# 创建对象
user = User()
user.name = "张三"
user.age = 25
user.email = "zs@example.com"

print(user.name, user.age, user.email)

# 类型校验
try:
    user.age = "25"  # ❌ 类型错误
except TypeError as e:
    print(e)
\`\`\`

## 六、\`__init_subclass__\`：元类的替代品

\`\`\`python
# 大多数情况，__init_subclass__ 比 元类更简单
# 它是 Python 3.6+ 引入的钩子方法

class Plugin:
    """插件基类：用 __init_subclass__ 替代元类"""
    
    registry = {}
    
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        Plugin.registry[cls.__name__] = cls
        print(f"注册插件: {cls.__name__}")

class CSVPlugin(Plugin):
    pass
# 输出：注册插件: CSVPlugin

class JSONPlugin(Plugin):
    pass
# 输出：注册插件: JSONPlugin

print(Plugin.registry)

# __init_subclass__ 的优势：
# 1. 不需要写元类
# 2. 不影响 isinstance 检查
# 3. 更容易理解
# 4. 90% 的情况足够用
\`\`\`

**\`__init_subclass__\` 接收参数**

\`\`\`python
class Base:
    def __init_subclass__(cls, name=None, version="1.0", **kwargs):
        super().__init_subclass__(**kwargs)
        cls.name = name or cls.__name__
        cls.version = version
        print(f"创建 {cls.name} v{cls.version}")

# 子类可以传参数
class MyService(Base, name="my-service", version="2.0"):
    pass

print(MyService.name)     # my-service
print(MyService.version)  # 2.0

# 不传参数用默认值
class AnotherService(Base):
    pass

print(AnotherService.name)    # AnotherService
print(AnotherService.version) # 1.0
\`\`\`

## 七、\`__class_getitem__\`：支持 \`MyClass[T]\`

\`\`\`python
class MyList:
    """支持 MyList[int] 这样的类型注解"""
    
    def __class_getitem__(cls, item):
        # 返回一个表示泛型的对象
        return f"{cls.__name__}[{item.__name__}]"

print(MyList[int])      # MyList[int]
print(MyList[str])      # MyList[str]
print(MyList[list])     # MyList[list]

# 实际应用：list[int]、dict[str, int] 都用类似机制
print(list[int])        # list[int]
print(dict[str, int])   # dict[str, int]
\`\`\`

## 八、类装饰器：元类的另一替代品

\`\`\`python
# 类装饰器也能修改类的创建
def add_repr(cls):
    """给类自动添加 __repr__"""
    def __repr__(self):
        attrs = ", ".join(
            f"{k}={v!r}" for k, v in self.__dict__.items()
        )
        return f"{cls.__name__}({attrs})"
    
    cls.__repr__ = __repr__
    return cls

@add_repr
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(3, 4)
print(p)  # Point(x=3, y=4)

# 类装饰器 vs 元类：
# - 类装饰器更简单，适合一次性修改
# - 元类更强大，能影响所有子类
# - 优先用类装饰器，需要继承时才用元类
\`\`\`

## 九、何时用元类

\`\`\`python
# 元类是 Python 最强大的特性之一，但也很少需要

# 适合用元类的场景：
# 1. 框架开发（ORM、DI 容器、序列化框架）
# 2. 需要影响所有子类的行为
# 3. 需要在类创建时做复杂处理

# 不适合用元类的场景：
# 1. 简单的属性添加 → 用 __init_subclass__
# 2. 一次性修改类 → 用类装饰器
# 3. 接口强制 → 用 ABC

# Django 的 Model 就用了元类
class User(models.Model):
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    # 元类自动把这些字段收集到 _meta.fields

# 但 99% 的 Python 开发者不需要写元类
# 知道它存在，能看懂别人的代码就够了
\`\`\`

## 十、元类的 \`__call__\`：控制实例创建

\`\`\`python
class SingletonMeta(type):
    """单例元类"""
    
    _instances = {}
    
    def __call__(cls, *args, **kwargs):
        """控制实例的创建"""
        if cls not in cls._instances:
            print(f"创建 {cls.__name__} 的单例")
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Database(metaclass=SingletonMeta):
    def __init__(self):
        print("初始化数据库连接")
        self.connection = "db_conn"

# 第一次创建
db1 = Database()
# 创建 Database 的单例
# 初始化数据库连接

# 第二次"创建"：返回同一个实例
db2 = Database()
# 不打印（已存在）

print(db1 is db2)  # True

# 每个用 SingletonMeta 的类有独立的单例
class Cache(metaclass=SingletonMeta):
    def __init__(self):
        self.data = {}

cache1 = Cache()
cache2 = Cache()
print(cache1 is cache2)  # True
print(db1 is cache1)     # False（不同类的单例）
\`\`\`

## 十一、综合示例：简易 ORM

\`\`\`python
# 用元类实现一个简易 ORM（对象关系映射）

class Field:
    """字段描述符"""
    
    def __init__(self, column_type, primary_key=False):
        self.column_type = column_type
        self.primary_key = primary_key
        self.name = None
    
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)
    
    def __set__(self, obj, value):
        obj.__dict__[self.name] = value

class ModelMeta(type):
    """ORM 元类：收集字段"""
    
    def __new__(mcs, name, bases, namespace):
        # 跳过基类
        if name == "Model":
            return super().__new__(mcs, name, bases, namespace)
        
        # 收集字段
        fields = {}
        table_name = namespace.get("__table__", name.lower())
        
        for key, value in namespace.items():
            if isinstance(value, Field):
                fields[key] = value
                value.name = key
        
        cls = super().__new__(mcs, name, bases, namespace)
        cls._fields = fields
        cls._table = table_name
        return cls

class Model(metaclass=ModelMeta):
    """模型基类"""
    
    def save(self):
        """生成 INSERT SQL"""
        columns = ", ".join(self._fields.keys())
        values = ", ".join(
            repr(getattr(self, f)) for f in self._fields
        )
        sql = f"INSERT INTO {self._table} ({columns}) VALUES ({values});"
        print(sql)
        return sql
    
    @classmethod
    def create_table(cls):
        """生成 CREATE TABLE SQL"""
        columns = []
        for name, field in cls._fields.items():
            col = f"{name} {field.column_type}"
            if field.primary_key:
                col += " PRIMARY KEY"
            columns.append(col)
        sql = f"CREATE TABLE {cls._table} ({', '.join(columns)});"
        print(sql)
        return sql

class User(Model):
    __table__ = "users"
    
    id = Field("INTEGER", primary_key=True)
    name = Field("TEXT")
    age = Field("INTEGER")
    email = Field("TEXT")

# 自动生成建表语句
User.create_table()
# CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER, email TEXT);

# 创建对象并生成插入语句
user = User()
user.id = 1
user.name = "张三"
user.age = 25
user.email = "zs@example.com"
user.save()
# INSERT INTO users (id, name, age, email) VALUES (1, '张三', 25, 'zs@example.com');

# 查看元类收集的字段
print(User._fields)  # {'id': ..., 'name': ..., 'age': ..., 'email': ...}
print(User._table)   # users
\`\`\`

## 十二、元类的注意事项

\`\`\`python
# 1. 元类会影响所有子类
class MyMeta(type):
    def __new__(mcs, name, bases, namespace):
        print(f"创建类: {name}")
        return super().__new__(mcs, name, bases, namespace)

class Base(metaclass=MyMeta):
    pass
# 输出：创建类: Base

class Child(Base):
    pass
# 输出：创建类: Child（子类也受影响）

class GrandChild(Child):
    pass
# 输出：创建类: GrandChild

# 2. 多继承时元类冲突
class MetaA(type): pass
class MetaB(type): pass

class A(metaclass=MetaA): pass
class B(metaclass=MetaB): pass

# class C(A, B): pass  # ❌ TypeError: metaclass conflict
# 解决：让一个元类继承另一个
class MetaC(MetaA, MetaB): pass
class C(A, B, metaclass=MetaC): pass  # ✅

# 3. 元类让代码更难理解
# 新人看到 metaclass=xxx 会很困惑
# 能用 __init_subclass__ 就别用元类

# 4. 性能：元类会稍微降低类创建速度
# 但只在创建时，不影响实例方法调用
\`\`\`

## 十三、三种"修改类"的方式对比

\`\`\`python
# 1. __init_subclass__：最简单
class A:
    def __init_subclass__(cls):
        print(f"创建子类: {cls.__name__}")

class B(A): pass  # 创建子类: B

# 2. 类装饰器：一次性修改
def decorate(cls):
    cls.extra = "added by decorator"
    return cls

@decorate
class C:
    pass

print(C.extra)  # added by decorator

# 3. 元类：最强大
class MyMeta(type):
    def __new__(mcs, name, bases, ns):
        ns['extra'] = "added by metaclass"
        return super().__new__(mcs, name, bases, ns)

class D(metaclass=MyMeta):
    pass

print(D.extra)  # added by metaclass

# 选择顺序：__init_subclass__ → 类装饰器 → 元类
\`\`\`

## 十四、元类 vs 其他方式对比

| 方式 | 复杂度 | 影响范围 | 适用场景 |
| --- | --- | --- | --- |
| \`__init_subclass__\` | 低 | 子类 | 注册、简单修改 |
| 类装饰器 | 中 | 单个类 | 一次性修改 |
| 元类 | 高 | 所有子类 | 框架、复杂逻辑 |

## 小结

本章介绍了 Python 元类的基础：

1. **\`type\` 是默认元类**：所有类的类型都是 \`type\`
2. **\`type()\` 动态创建类**：\`type(name, bases, namespace)\`
3. **自定义元类**：继承 \`type\`，重写 \`__new__\` 或 \`__init__\`
4. **元类的 \`__call__\`**：控制实例创建（实现单例）
5. **\`__init_subclass__\`**：90% 情况下替代元类
6. **\`__class_getitem__\`**：支持 \`MyClass[T]\` 类型注解
7. **类装饰器**：修改类的另一种方式
8. **实战**：自动注册、强制接口、简易 ORM
9. **选择顺序**：\`__init_subclass__\` → 类装饰器 → 元类

元类是 Python 最强大也最容易被滥用的特性。"元类就是深魔法，99% 的用户不需要关心它"——Tim Peters。下一章我们学习**数据类与设计模式**——把前面学的所有 OOP 知识整合应用。`
  },

  // =========================================================
  // 第四十章：数据类与设计模式
  // =========================================================
  {
    id: "py10-ch40",
    group: "第八部分 面向对象进阶",
    icon: "🏗️",
    title: "第四十章 数据类与设计模式",
    content: `## 数据类与设计模式：OOP 的实战应用

**数据类**（dataclass）是 Python 3.7+ 引入的语法糖，让"主要存数据的类"写起来更简洁。**设计模式**是 OOP 经验的总结——针对常见问题的可复用解决方案。本章把前面学的所有 OOP 知识整合起来，用真实案例收尾。

## 一、\`@dataclass\` 基础

\`\`\`python
from dataclasses import dataclass, field

# 传统写法
class PersonOld:
    def __init__(self, name, age, email):
        self.name = name
        self.age = age
        self.email = email
    
    def __repr__(self):
        return f"PersonOld(name={self.name!r}, age={self.age}, email={self.email!r})"
    
    def __eq__(self, other):
        if not isinstance(other, PersonOld):
            return False
        return (self.name, self.age, self.email) == (other.name, other.age, other.email)

# dataclass 写法：自动生成 __init__、__repr__、__eq__
@dataclass
class Person:
    name: str
    age: int
    email: str

p1 = Person("张三", 25, "zs@example.com")
p2 = Person("张三", 25, "zs@example.com")

print(p1)        # Person(name='张三', age=25, email='zs@example.com')
print(p1 == p2)  # True（自动生成 __eq__）

# 自动生成的 __init__ 等价于：
# def __init__(self, name, age, email):
#     self.name = name
#     self.age = age
#     self.email = email
\`\`\`

## 二、\`@dataclass\` 的选项

\`\`\`python
from dataclasses import dataclass, field

# 1. repr：是否生成 __repr__（默认 True）
@dataclass(repr=False)
class NoRepr:
    x: int

print(NoRepr(1))  # <__main__.NoRepr object at 0x...>

# 2. eq：是否生成 __eq__（默认 True）
@dataclass(eq=False)
class NoEq:
    x: int

a, b = NoEq(1), NoEq(1)
print(a == b)  # False（用默认的 id 比较）

# 3. order：是否生成比较运算符（__lt__ 等，默认 False）
@dataclass(order=True)
class Ordered:
    x: int

print(Ordered(1) < Ordered(2))  # True

# 4. frozen：不可变（默认 False）
@dataclass(frozen=True)
class Frozen:
    x: int

f = Frozen(1)
# f.x = 2  # ❌ FrozenInstanceError
# 可以哈希
print(hash(f))  # 有值（frozen=True 时自动支持 hash）

# 5. slots：用 __slots__ 节省内存（Python 3.10+）
@dataclass(slots=True)
class WithSlots:
    x: int
    y: int

# 6. init：是否生成 __init__（默认 True）
@dataclass(init=False)
class NoInit:
    x: int = 0
    
    def __init__(self, value):
        self.x = value * 2

# 综合配置
@dataclass(frozen=True, order=True)
class Version:
    major: int
    minor: int
    patch: int = 0

v1 = Version(1, 0)
v2 = Version(2, 0, 0)
print(v1 < v2)  # True
\`\`\`

## 三、默认值与 \`field\`

\`\`\`python
from dataclasses import dataclass, field

# 1. 简单默认值
@dataclass
class Simple:
    x: int = 10
    y: str = "hello"

# 2. 可变默认值：必须用 field(default_factory=...)
@dataclass
class WithList:
    # ❌ 错误：items: list = []  会共享
    items: list = field(default_factory=list)  # ✅ 每次创建新列表
    tags: set = field(default_factory=set)

a = WithList()
b = WithList()
a.items.append(1)
print(b.items)  # []（独立的）

# 3. field 的其他参数
@dataclass
class Product:
    name: str
    price: float
    # init=False：不作为构造参数，自动计算
    display_name: str = field(init=False, default="")
    # repr=False：不在 __repr__ 中显示
    internal_id: str = field(default="", repr=False)
    # compare=False：不参与比较
    timestamp: float = field(default=0.0, compare=False)
    
    def __post_init__(self):
        """__init__ 后自动调用"""
        self.display_name = f"[{self.name}] ¥{self.price}"

p = Product("Python 书", 59.99)
print(p)  # Product(name='Python 书', price=59.99, display_name='[Python 书] ¥59.99')
print(p.internal_id)  # ''（不在 repr 里显示）

# 4. 默认值 + 类型注解
@dataclass
class Config:
    host: str = "localhost"
    port: int = 8080
    debug: bool = False
    allowed_origins: list = field(default_factory=lambda: ["*"])
\`\`\`

## 四、\`__post_init__\`：初始化后的钩子

\`\`\`python
from dataclasses import dataclass, field

@dataclass
class Rectangle:
    width: float
    height: float
    area: float = field(init=False)  # 不作为构造参数
    perimeter: float = field(init=False)
    
    def __post_init__(self):
        """__init__ 完成后自动调用，用于计算衍生属性"""
        self.area = self.width * self.height
        self.perimeter = 2 * (self.width + self.height)

r = Rectangle(4, 5)
print(r.area)       # 20（自动计算）
print(r.perimeter)  # 18

# 实际应用：验证
@dataclass
class User:
    name: str
    age: int
    email: str
    
    def __post_init__(self):
        if self.age < 0:
            raise ValueError("年龄不能为负")
        if "@" not in self.email:
            raise ValueError("邮箱格式错误")

# 正常创建
u = User("张三", 25, "zs@example.com")

# 校验失败
try:
    User("李四", -5, "ls@example.com")
except ValueError as e:
    print(e)  # 年龄不能为负
\`\`\`

## 五、\`NamedTuple\` vs \`dataclass\`

\`\`\`python
from typing import NamedTuple
from dataclasses import dataclass

# NamedTuple：不可变、像元组、内存小
class PointNT(NamedTuple):
    x: int
    y: int
    label: str = "point"

# dataclass：可变、像类、功能多
@dataclass
class PointDC:
    x: int
    y: int
    label: str = "point"

# 对比
p1 = PointNT(3, 4)
p2 = PointDC(3, 4)

# 1. 不可变 vs 可变
# p1.x = 5  # ❌ AttributeError（NamedTuple 不可变）
p2.x = 5  # ✅ dataclass 可变

# 2. 像元组 vs 像类
print(p1[0])  # 3（支持索引，因为是元组）
# print(p2[0])  # ❌ TypeError（不支持索引）

# 3. 内存
import sys
print(sys.getsizeof(p1))  # 较小
print(sys.getsizeof(p2))  # 较大

# 4. 方法
@dataclass
class PointWithMethod:
    x: int
    y: int
    
    def distance_to_origin(self):
        return (self.x ** 2 + self.y ** 2) ** 0.5

# NamedTuple 也能加方法，但不方便
# 选择建议：
# - 数据不可变、要解包、内存敏感 → NamedTuple
# - 数据可变、需要方法、复杂逻辑 → dataclass
\`\`\`

## 六、设计模式：单例（Singleton）

\`\`\`python
# 单例模式：确保一个类只有一个实例

# 方法 1：用模块（Python 的模块天然是单例）
# config.py:
# class _Config:
#     def __init__(self):
#         self.settings = {}
# config = _Config()  # 模块级变量，导入时创建一次
# 其他文件：from config import config

# 方法 2：用 __new__
class SingletonV2:
    _instance = None
    
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not hasattr(self, '_initialized'):
            self.settings = {}
            self._initialized = True

s1 = SingletonV2()
s2 = SingletonV2()
print(s1 is s2)  # True

# 方法 3：用装饰器
def singleton(cls):
    instances = {}
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    return get_instance

@singleton
class Database:
    def __init__(self):
        print("初始化数据库")
        self.connection = "conn"

db1 = Database()
db2 = Database()
print(db1 is db2)  # True

# 方法 4：用元类（见上一章）
\`\`\`

## 七、设计模式：工厂（Factory）

\`\`\`python
# 工厂模式：用工厂方法创建对象，而不是直接 new

# 简单工厂
class Animal:
    def speak(self):
        pass

class Dog(Animal):
    def speak(self):
        return "汪汪"

class Cat(Animal):
    def speak(self):
        return "喵喵"

class AnimalFactory:
    @staticmethod
    def create(animal_type):
        """根据类型创建动物"""
        if animal_type == "dog":
            return Dog()
        elif animal_type == "cat":
            return Cat()
        else:
            raise ValueError(f"未知动物: {animal_type}")

# 使用
animal = AnimalFactory.create("dog")
print(animal.speak())  # 汪汪

# 工厂方法模式：每个产品有自己的工厂
class AnimalCreator(ABC):
    @abstractmethod
    def create(self) -> Animal:
        pass

class DogCreator(AnimalCreator):
    def create(self):
        return Dog()

class CatCreator(AnimalCreator):
    def create(self):
        return Cat()

# 使用
dog = DogCreator().create()
print(dog.speak())

# 实际应用：根据配置创建不同对象
class NotificationSender:
    @classmethod
    def create(cls, channel):
        """根据渠道创建通知发送器"""
        senders = {
            "email": EmailSender,
            "sms": SMSSender,
            "push": PushSender,
        }
        if channel not in senders:
            raise ValueError(f"未知渠道: {channel}")
        return senders[channel]()

sender = NotificationSender.create("email")
sender.send("你好")
\`\`\`

## 八、设计模式：策略（Strategy）

\`\`\`python
from abc import ABC, abstractmethod

# 策略模式：把算法封装成对象，运行时可以切换

# 抽象策略
class SortStrategy(ABC):
    @abstractmethod
    def sort(self, data):
        pass

# 具体策略
class BubbleSort(SortStrategy):
    def sort(self, data):
        print("用冒泡排序")
        result = data.copy()
        for i in range(len(result)):
            for j in range(len(result) - i - 1):
                if result[j] > result[j + 1]:
                    result[j], result[j + 1] = result[j + 1], result[j]
        return result

class QuickSort(SortStrategy):
    def sort(self, data):
        print("用快速排序")
        if len(data) <= 1:
            return data.copy()
        pivot = data[0]
        less = [x for x in data[1:] if x <= pivot]
        greater = [x for x in data[1:] if x > pivot]
        return self.sort(less) + [pivot] + self.sort(greater)

# 上下文
class Sorter:
    def __init__(self, strategy: SortStrategy):
        self.strategy = strategy
    
    def set_strategy(self, strategy: SortStrategy):
        """运行时切换策略"""
        self.strategy = strategy
    
    def sort(self, data):
        return self.strategy.sort(data)

# 使用
data = [3, 1, 4, 1, 5, 9, 2, 6]

sorter = Sorter(BubbleSort())
print(sorter.sort(data))  # 用冒泡排序 → [1, 1, 2, 3, 4, 5, 6, 9]

sorter.set_strategy(QuickSort())
print(sorter.sort(data))  # 用快速排序 → [1, 1, 2, 3, 4, 5, 6, 9]

# Python 风格：用函数更简洁
def sort_with_strategy(data, strategy):
    return strategy(data)

print(sort_with_strategy(data, sorted))  # 用内置 sorted
\`\`\`

## 九、设计模式：观察者（Observer）

\`\`\`python
# 观察者模式：一对多依赖，一变多通知

class Subject:
    """被观察的主题"""
    
    def __init__(self):
        self._observers = []
        self._state = None
    
    def attach(self, observer):
        """注册观察者"""
        if observer not in self._observers:
            self._observers.append(observer)
    
    def detach(self, observer):
        """注销观察者"""
        if observer in self._observers:
            self._observers.remove(observer)
    
    def notify(self):
        """通知所有观察者"""
        for observer in self._observers:
            observer.update(self._state)
    
    def set_state(self, state):
        """改变状态并通知"""
        self._state = state
        self.notify()

class Observer:
    """观察者基类"""
    
    def update(self, state):
        """收到通知后的行为"""
        pass

# 具体观察者
class EmailNotifier(Observer):
    def update(self, state):
        print(f"📧 发送邮件：状态变为 {state}")

class SMSNotifier(Observer):
    def update(self, state):
        print(f"📱 发送短信：状态变为 {state}")

class LogNotifier(Observer):
    def update(self, state):
        print(f"📝 记录日志：状态变为 {state}")

# 使用
order = Subject()

# 注册观察者
order.attach(EmailNotifier())
order.attach(SMSNotifier())
order.attach(LogNotifier())

# 状态变化会通知所有观察者
print("=== 订单创建 ===")
order.set_state("已创建")

print("\\n=== 订单付款 ===")
order.set_state("已付款")

print("\\n=== 订单发货 ===")
order.set_state("已发货")
# 输出：
# 📧 发送邮件：状态变为 已创建
# 📱 发送短信：状态变为 已创建
# 📝 记录日志：状态变为 已创建
# ...

# 实际应用：事件系统、消息队列、GUI 框架
\`\`\`

## 十、设计模式：装饰器（Decorator）

\`\`\`python
# 装饰器模式：动态给对象添加功能
# 注意：Python 的"装饰器"语法和 OOP 的"装饰器模式"是不同概念

class Coffee:
    """咖啡基类"""
    
    def cost(self):
        return 10
    
    def description(self):
        return "咖啡"

class CoffeeDecorator(Coffee):
    """咖啡装饰器基类"""
    
    def __init__(self, coffee):
        self._coffee = coffee
    
    def cost(self):
        return self._coffee.cost()
    
    def description(self):
        return self._coffee.description()

class MilkDecorator(CoffeeDecorator):
    """加牛奶"""
    
    def cost(self):
        return self._coffee.cost() + 3
    
    def description(self):
        return self._coffee.description() + " + 牛奶"

class SugarDecorator(CoffeeDecorator):
    """加糖"""
    
    def cost(self):
        return self._coffee.cost() + 1
    
    def description(self):
        return self._coffee.description() + " + 糖"

class WhipDecorator(CoffeeDecorator):
    """加奶油"""
    
    def cost(self):
        return self._coffee.cost() + 5
    
    def description(self):
        return self._coffee.description() + " + 奶油"

# 使用：可以任意组合
coffee = Coffee()
print(f"{coffee.description()}: ¥{coffee.cost()}")  # 咖啡: ¥10

coffee_with_milk = MilkDecorator(coffee)
print(f"{coffee_with_milk.description()}: ¥{coffee_with_milk.cost()}")
# 咖啡 + 牛奶: ¥13

fancy_coffee = WhipDecorator(SugarDecorator(MilkDecorator(coffee)))
print(f"{fancy_coffee.description()}: ¥{fancy_coffee.cost()}")
# 咖啡 + 牛奶 + 糖 + 奶油: ¥19
\`\`\`

## 十一、设计模式：MVC 简介

\`\`\`python
# MVC：Model-View-Controller，分离数据、界面、控制

# Model：数据
class UserModel:
    def __init__(self):
        self.users = []
    
    def add_user(self, name, age):
        user = {"name": name, "age": age}
        self.users.append(user)
        return user
    
    def get_users(self):
        return self.users

# View：界面
class UserView:
    def show_users(self, users):
        print("=== 用户列表 ===")
        for i, u in enumerate(users, 1):
            print(f"{i}. {u['name']} ({u['age']} 岁)")
    
    def get_input(self):
        name = input("姓名: ")
        age = int(input("年龄: "))
        return name, age

# Controller：控制
class UserController:
    def __init__(self, model, view):
        self.model = model
        self.view = view
    
    def add_user(self):
        name, age = self.view.get_input()
        self.model.add_user(name, age)
        print("添加成功！")
    
    def show_users(self):
        users = self.model.get_users()
        self.view.show_users(users)

# 使用
model = UserModel()
view = UserView()
controller = UserController(model, view)

# 模拟添加用户
model.add_user("张三", 25)
model.add_user("李四", 30)

controller.show_users()
# === 用户列表 ===
# 1. 张三 (25 岁)
# 2. 李四 (30 岁)

# MVC 的好处：
# 1. Model、View、Controller 各司其职
# 2. 修改界面不影响数据逻辑
# 3. 修改数据逻辑不影响界面
# 4. 容易测试（Model 可以单独测试）
\`\`\`

## 十二、综合示例：用 dataclass + 设计模式实现配置系统

\`\`\`python
from dataclasses import dataclass, field
from typing import Optional
from abc import ABC, abstractmethod

# 用 dataclass 定义配置
@dataclass
class DatabaseConfig:
    host: str = "localhost"
    port: int = 5432
    username: str = ""
    password: str = ""
    database: str = "myapp"

@dataclass
class RedisConfig:
    host: str = "localhost"
    port: int = 6379
    password: Optional[str] = None
    db: int = 0

@dataclass
class AppConfig:
    debug: bool = False
    database: DatabaseConfig = field(default_factory=DatabaseConfig)
    redis: RedisConfig = field(default_factory=RedisConfig)
    allowed_hosts: list = field(default_factory=lambda: ["*"])

# 用工厂模式创建配置
class ConfigFactory:
    """配置工厂"""
    
    @staticmethod
    def create_from_env(env: str = "dev"):
        """根据环境创建配置"""
        if env == "dev":
            return AppConfig(
                debug=True,
                database=DatabaseConfig(
                    host="localhost",
                    username="dev_user",
                    password="dev_pass",
                ),
            )
        elif env == "prod":
            return AppConfig(
                debug=False,
                database=DatabaseConfig(
                    host="prod-db.example.com",
                    username="prod_user",
                    password="prod_pass",
                ),
                redis=RedisConfig(
                    host="prod-redis.example.com",
                    password="redis_pass",
                ),
                allowed_hosts=["example.com", "www.example.com"],
            )
        else:
            raise ValueError(f"未知环境: {env}")

# 用观察者模式：配置变化通知组件
class ConfigManager:
    """配置管理器"""
    
    def __init__(self, config: AppConfig):
        self._config = config
        self._listeners = []
    
    def add_listener(self, listener):
        self._listeners.append(listener)
    
    def update_config(self, new_config: AppConfig):
        """更新配置并通知"""
        old_config = self._config
        self._config = new_config
        for listener in self._listeners:
            listener.on_config_change(old_config, new_config)
    
    @property
    def config(self):
        return self._config

class DatabaseConnection:
    """数据库连接：监听配置变化"""
    
    def on_config_change(self, old, new):
        print(f"数据库配置变化: {old.database.host} → {new.database.host}")
        print("重新连接数据库...")

class CacheManager:
    """缓存管理器：监听配置变化"""
    
    def on_config_change(self, old, new):
        print(f"Redis 配置变化: {old.redis.host} → {new.redis.host}")
        print("重新连接 Redis...")

# 使用
config = ConfigFactory.create_from_env("dev")
print("=== 开发环境配置 ===")
print(f"Debug: {config.debug}")
print(f"DB Host: {config.database.host}")
print(f"Redis Host: {config.redis.host}")

# 创建配置管理器，注册监听器
manager = ConfigManager(config)
manager.add_listener(DatabaseConnection())
manager.add_listener(CacheManager())

# 切换到生产环境
print("\\n=== 切换到生产环境 ===")
new_config = ConfigFactory.create_from_env("prod")
manager.update_config(new_config)
# 数据库配置变化: localhost → prod-db.example.com
# 重新连接数据库...
# Redis 配置变化: localhost → prod-redis.example.com
# 重新连接 Redis...

print(f"\\n当前 DB Host: {manager.config.database.host}")
\`\`\`

## 十三、Python 设计模式的"Pythonic"写法

\`\`\`python
# Python 有更简洁的方式实现很多设计模式

# 1. 单例：直接用模块
# logger.py:
# class _Logger:
#     def log(self, msg):
#         print(msg)
# logger = _Logger()
# 其他文件: from logger import logger

# 2. 工厂：用字典 + lambda
class AnimalFactory:
    _creators = {
        "dog": lambda: Dog(),
        "cat": lambda: Cat(),
    }
    
    @classmethod
    def create(cls, type_):
        return cls._creators.get(type_, lambda: None)()

# 3. 策略：直接用函数
def sort_data(data, strategy=sorted):
    return strategy(data)

# 4. 观察者：用回调函数
class EventEmitter:
    def __init__(self):
        self._listeners = []
    
    def on(self, event, callback):
        self._listeners.append((event, callback))
    
    def emit(self, event, *args):
        for e, cb in self._listeners:
            if e == event:
                cb(*args)

emitter = EventEmitter()
emitter.on("click", lambda x: print(f"点击 {x}"))
emitter.emit("click", "按钮")

# Python 的设计模式更轻量，不需要过度抽象
\`\`\`

## 十四、设计模式一览表

| 模式 | 用途 | Python 实现 |
| --- | --- | --- |
| 单例 | 全局唯一实例 | 模块、装饰器、元类 |
| 工厂 | 创建对象 | 函数、类方法 |
| 策略 | 算法切换 | 函数参数、策略类 |
| 观察者 | 一变多通知 | 回调、事件系统 |
| 装饰器 | 动态加功能 | Python 装饰器语法 |
| 适配器 | 接口转换 | 包装类 |
| 模板方法 | 算法骨架 | ABC + 钩子方法 |
| MVC | 分层架构 | Model/View/Controller 类 |

\`\`\`python
# 适配器模式示例
class OldPrinter:
    """旧接口"""
    def print_old(self, text):
        print(f"[OLD] {text}")

class NewPrinter:
    """新接口"""
    def print_new(self, text):
        print(f"[NEW] {text}")

class PrinterAdapter:
    """适配器：让旧接口适配新接口"""
    
    def __init__(self, printer):
        self.printer = printer
    
    def print(self, text):
        """统一接口"""
        if isinstance(self.printer, OldPrinter):
            self.printer.print_old(text)
        elif isinstance(self.printer, NewPrinter):
            self.printer.print_new(text)

# 使用
adapter1 = PrinterAdapter(OldPrinter())
adapter1.print("hello")  # [OLD] hello

adapter2 = PrinterAdapter(NewPrinter())
adapter2.print("hello")  # [NEW] hello
\`\`\`

## 十五、何时用设计模式

\`\`\`python
# 设计模式的"反模式"：过度设计

# ❌ 过度设计：简单问题用复杂模式
class SimpleConfig:
    """简单配置：不需要工厂、单例、观察者"""
    def __init__(self):
        self.settings = {}

# ✅ 适度设计：根据需要选择
# - 项目小：直接写
# - 项目中：用 dataclass + 简单模式
# - 项目大：考虑完整设计模式

# 经验法则：
# 1. 先写简单版本
# 2. 发现重复 → 抽象
# 3. 发现扩展难 → 用模式
# 4. 不要为了用模式而用模式

# Python 的优势：很多模式有内建支持
# - 迭代器模式：for 循环 + __iter__
# - 上下文管理器：with + __enter__/__exit__
# - 装饰器：@ 语法
# - 描述符：@property
\`\`\`

## 小结

本章整合了数据类与设计模式：

1. **\`@dataclass\`**：自动生成 \`__init__\`、\`__repr__\`、\`__eq__\`，简化数据类
2. **\`field\`**：处理可变默认值、控制属性行为
3. **\`__post_init__\`**：初始化后的钩子，用于计算和校验
4. **\`NamedTuple\` vs \`dataclass\`**：前者不可变像元组，后者可变像类
5. **单例模式**：模块、\`__new__\`、装饰器、元类四种实现
6. **工厂模式**：封装对象创建，解耦客户端和具体类
7. **策略模式**：算法封装为对象，运行时可切换
8. **观察者模式**：一对多通知，事件系统的基础
9. **装饰器模式**：动态添加功能（区别于 Python 的 @decorator）
10. **MVC**：分层架构，分离数据、界面、控制

设计模式是经验总结，但**不要过度设计**。Python 有很多内建特性可以替代传统模式：迭代器、上下文管理器、装饰器语法、描述符。掌握这些，你就能写出既优雅又 Pythonic 的代码。

至此，Python 从入门到精通大全的函数基础、函数进阶、面向对象基础、面向对象进阶四大核心部分已全部完成。接下来我们将进入更高级的主题：异常处理、文件 I/O、模块与包、并发编程等。`
  }
];

export { chapters };
