// =============================================================
// py8-chapters-batch2.js
// 模块：数据类型与字符串（共 10 章）
// 全新制作，简单易懂，demo 多，难代码逐行讲解
// =============================================================

export const chapters = [
  {
    id: "py8-numbers",
    group: "数据类型与字符串",
    icon: "🔢",
    title: "数字类型：整数与浮点数",
    content: `## 整数 int：任意精度

Python 的整数 **没有大小限制**（只受内存限制），不像 C/Java 有 32 位或 64 位上限。你可以轻松计算 1000 的阶乘：

\`\`\`python
big = 2 ** 1000   # 2的1000次方，一个300多位的巨大数字
\`\`\`

### 整数进制表示

| 进制 | 前缀 | 示例 | 十进制值 |
|------|------|------|----------|
| 二进制 | \`0b\` | \`0b1010\` | 10 |
| 八进制 | \`0o\` | \`0o17\` | 15 |
| 十六进制 | \`0x\` | \`0xFF\` | 255 |

### 整数进制转换函数

- \`bin(x)\` → 二进制字符串，如 \`'0b1010'\`
- \`oct(x)\` → 八进制字符串，如 \`'0o12'\`
- \`hex(x)\` → 十六进制字符串，如 \`'0xa'\`
- \`int("1010", 2)\` → 从字符串解析，第二个参数指定进制

## 浮点数 float：IEEE 754

Python 的 float 是 **双精度浮点数**（64位），遵循 IEEE 754 标准。

### 精度问题

\`\`\`python
0.1 + 0.2  # 结果不是 0.3，而是 0.30000000000000004
\`\`\`

这是因为 0.1 和 0.2 在二进制中是无限循环小数，计算机只能存储近似值。**这不是 Python 的 bug，而是所有语言都有的浮点精度问题**。

### 除法与取整

| 运算符 | 含义 | 示例 | 结果 |
|--------|------|------|------|
| \`/\` | 真除法（浮点） | \`7 / 2\` | 3.5 |
| \`//\` | 整除（向下取整） | \`7 // 2\` | 3 |
| \`//\` | 负数整除 | \`-7 // 2\` | -4（向下取！） |
| \`%\` | 取余 | \`7 % 2\` | 1 |
| \`**\` | 幂 | \`2 ** 10\` | 1024 |

### math 模块常用函数

| 函数 | 作用 |
|------|------|
| \`math.sqrt(x)\` | 平方根 |
| \`math.floor(x)\` | 向下取整 |
| \`math.ceil(x)\` | 向上取整 |
| \`math.fabs(x)\` | 绝对值 |
| \`math.factorial(n)\` | 阶乘 |
| \`math.gcd(a, b)\` | 最大公约数 |
| \`math.pi\` | 圆周率 π |
| \`math.e\` | 自然常数 e |

### 高精度：decimal 模块

当需要精确小数（如金钱计算）时，用 \`decimal.Decimal\`：

\`\`\`python
from decimal import Decimal
Decimal('0.1') + Decimal('0.2')  # 精确等于 0.3
\`\`\`

### 分数：fractions 模块

\`\`\`python
from fractions import Fraction
Fraction(1, 3)   # 1/3，精确分数
\`\`\`

下面的 demo 全面演示整数、浮点数、进制转换、math 模块、decimal 和 fractions。`,
    code: `# 数字类型全面演示：整数、浮点数、进制、math、decimal
import math
from decimal import Decimal, getcontext
from fractions import Fraction

print("=" * 50)
print("      Python 数字类型全面讲解")
print("=" * 50)

# ========== 1. 整数：任意精度 ==========
print()
print("=== 1. 整数 int：任意精度 ===")
small = 42
big = 2 ** 100       # 2的100次方，约 1.27e30
huge = 2 ** 1000     # 2的1000次方，约 1.07e301，超过300位
print(f"小整数：{small}")
print(f"2的100次方（31位）：{big}")
print(f"2的1000次方（302位）：{huge}")
print(f"Python 整数位数无上限，只受内存限制")

# ========== 2. 进制表示与转换 ==========
print()
print("=== 2. 进制表示与转换 ===")
# 不同进制字面量
bin_val = 0b1010     # 二进制 1010 = 十进制 10
oct_val = 0o17       # 八进制 17 = 十进制 15
hex_val = 0xFF       # 十六进制 FF = 十进制 255
print(f"0b1010 = {bin_val}，0o17 = {oct_val}，0xFF = {hex_val}")

# 进制转换函数
num = 42
print(f"数字 {num} 的二进制表示：{bin(num)}")    # bin() 返回 '0b101010'
print(f"数字 {num} 的八进制表示：{oct(num)}")    # oct() 返回 '0o52'
print(f"数字 {num} 的十六进制：{hex(num)}")      # hex() 返回 '0x2a'

# 从字符串按进制解析
print(f"二进制 '1010' = {int('1010', 2)}")       # 第二个参数指定进制
print(f"八进制 '52' = {int('52', 8)}")
print(f"十六进制 '2a' = {int('2a', 16)}")

# ========== 3. 浮点数运算 ==========
print()
print("=== 3. 浮点数 float ===")
a = 7
b = 2
print(f"真除法 {a} / {b} = {a / b}")               # 10 / 3 = 3.333...
print(f"整除   {a} // {b} = {a // b}")              # 10 // 3 = 3（向下取整）
print(f"负数整除 {-a} // {b} = {-a // b}")          # -10 // 3 = -4（向下取整！）
print(f"取余   {a} % {b} = {a % b}")               # 10 % 3 = 1
print(f"幂运算 {a} ** {b} = {a ** b}")              # 10 ** 3 = 1000

# round() 四舍五入
pi = 3.14159265358979
print(f"round(pi) = {round(pi)}")                  # 默认0位小数
print(f"round(pi, 2) = {round(pi, 2)}")            # 保留2位
print(f"round(pi, 4) = {round(pi, 4)}")            # 保留4位

# ========== 4. 浮点精度问题 ==========
print()
print("=== 4. 浮点精度问题（重要！）===")
result = 0.1 + 0.2
print(f"0.1 + 0.2 = {result}")                     # 0.30000000000000004
print(f"0.1 + 0.2 == 0.3？{result == 0.3}")         # False！
print(f"原因：0.1 和 0.2 在二进制中无法精确表示")

# 处理浮点精度：用 math.isclose 判断近似相等
print(f"math.isclose(0.1+0.2, 0.3) = {math.isclose(0.1 + 0.2, 0.3)}")

# ========== 5. math 模块常用函数 ==========
print()
print("=== 5. math 模块 ===")
print(f"math.pi = {math.pi}")                       # 圆周率
print(f"math.e = {math.e}")                         # 自然常数
print(f"math.sqrt(16) = {math.sqrt(16)}")            # 平方根
print(f"math.floor(3.9) = {math.floor(3.9)}")       # 向下取整 = 3
print(f"math.ceil(3.1) = {math.ceil(3.1)}")         # 向上取整 = 4
print(f"math.factorial(5) = {math.factorial(5)}")    # 5! = 120
print(f"math.gcd(12, 18) = {math.gcd(12, 18)}")     # 最大公约数 = 6
print(f"abs(-3.5) = {abs(-3.5)}")                   # 内置 abs 绝对值

# ========== 6. decimal 高精度 ==========
print()
print("=== 6. decimal 高精度模块 ===")
# 默认精度 28 位
print(f"Decimal('0.1') + Decimal('0.2') = {Decimal('0.1') + Decimal('0.2')}")
print(f"精确等于 0.3？{(Decimal('0.1') + Decimal('0.2')) == Decimal('0.3')}")

# 调整精度
getcontext().prec = 50    # 设置精度为 50 位
print(f"精度调为50位，1/7 = {Decimal(1) / Decimal(7)}")

# 模拟金钱计算：避免浮点误差
price = Decimal('19.99')
tax = Decimal('0.08')
total = price * (1 + tax)
print(f"商品 {price} 元，税率 8%，税后 = {total} 元")

# ========== 7. fractions 分数 ==========
print()
print("=== 7. fractions 分数模块 ===")
f1 = Fraction(1, 3)       # 1/3
f2 = Fraction(1, 6)       # 1/6
print(f"Fraction(1,3) = {f1}")
print(f"Fraction(1,3) + Fraction(1,6) = {f1 + f2}")  # 1/2
print(f"Fraction(1,3) * Fraction(1,6) = {f1 * f2}")  # 1/18
# 分数自动约分
f3 = Fraction(6, 8)       # 6/8 自动约分为 3/4
print(f"Fraction(6,8) 自动约分为：{f3}")

# ========== 8. 科学计数法 ==========
print()
print("=== 8. 科学计数法 ===")
big_num = 1.5e9            # 1.5 * 10^9 = 15亿
small_num = 2.5e-4         # 2.5 * 10^-4 = 0.00025
print(f"1.5e9 = {big_num}")
print(f"2.5e-4 = {small_num}")

print()
print("=" * 50)
print("   数字类型讲解完毕！")
print("=" * 50)`
  },
  {
    id: "py8-bool-none",
    group: "数据类型与字符串",
    icon: "☑️",
    title: "布尔值与 None",
    content: `## 布尔值 True/False

布尔类型只有两个值：\`True\` 和 \`False\`（首字母**必须大写**）。它是 int 的子类，\`True == 1\`，\`False == 0\`。

### 比较运算产生布尔值

\`\`\`python
3 > 5        # False
"hello" == "hello"   # True
10 != 5       # True
\`\`\`

### bool() 转换规则：truthy 与 falsy

\`bool(x)\` 可以判断一个值"真"还是"假"。

**falsy 值（转换为 False）只有这些：**

| 值 | 类型 |
|----|------|
| \`False\` | 布尔 |
| \`None\` | NoneType |
| \`0\` | int |
| \`0.0\` | float |
| \`0j\` | complex |
| \`""\`（空字符串） | str |
| \`[]\`（空列表） | list |
| \`{}\`（空字典） | dict |
| \`()\`（空元组） | tuple |
| \`set()\`（空集合） | set |
| \`range(0)\` | range |

**其他所有值都是 truthy（转换为 True）！** 包括 \`"0"\`（非空字符串）、\`-1\`、\`[0]\`（非空列表）。

## None 的含义

\`None\` 是 Python 的**空值**，表示"没有值"或"不存在"。类似于其他语言的 null/nil。

### None 不是空字符串，不是 0，不是 False

\`\`\`python
None == 0       # False
None == ""      # False
None == False   # False
\`\`\`

### 判断 None 必须用 is

\`\`\`python
x = None
# 正确做法
if x is None:
    print("x 是 None")
# 错误做法（不要用 ==）
if x == None:    # 虽然能工作，但不推荐
    pass
\`\`\`

### None 的常见用途

- 函数默认值：\`def func(name=None)\`
- 表示"没有找到"：\`dict.get("key")\` 不存在时返回 None
- 初始化占位：\`result = None\`

## 短路求值

\`and\` 和 \`or\` 有**短路行为**：

- \`a and b\`：如果 a 是 falsy，直接返回 a，**不计算 b**
- \`a or b\`：如果 a 是 truthy，直接返回 a，**不计算 b**

\`\`\`python
0 and print("不会执行")     # 不打印，因为 0 是 falsy
1 or print("不会执行")      # 不打印，因为 1 是 truthy
\`\`\`

下面的 demo 演示布尔值的所有规则，包括 truthy/falsy 判断、None 比较、短路求值。`,
    code: `# 布尔值与 None 全面演示

print("=" * 50)
print("      布尔值 True/False 与 None 详解")
print("=" * 50)

# ========== 1. True/False 基础 ==========
print()
print("=== 1. True/False 基础 ===")
print(f"True = {True}，类型 = {type(True).__name__}")
print(f"False = {False}，类型 = {type(False).__name__}")
# True 和 False 是 int 的子类
print(f"True == 1？{True == 1}")        # True
print(f"False == 0？{False == 0}")       # True
print(f"True + True = {True + True}")    # 2（可以参与数学运算！）

# ========== 2. 比较运算产生布尔值 ==========
print()
print("=== 2. 比较运算 ===")
print(f"3 > 5 = {3 > 5}")
print(f"10 == 10 = {10 == 10}")
print(f"10 != 5 = {10 != 5}")
print(f"'a' < 'b' = {'a' < 'b'}")                    # 字符串比 ASCII 码
print(f"'hello' == 'hello' = {'hello' == 'hello'}")

# ========== 3. bool() 转换规则 ==========
print()
print("=== 3. bool() 转换：truthy 与 falsy ===")
# falsy 值列表
falsy_values = [
    ("False", False),
    ("None", None),
    ("0", 0),
    ("0.0", 0.0),
    ('"" (空字符串)', ""),
    ("[] (空列表)", []),
    ("{} (空字典)", {}),
    ("() (空元组)", ()),
    ("set()", set()),
    ("range(0)", range(0)),
]
for name, val in falsy_values:
    print(f"bool({name}) = {bool(val)}")

print()
# truthy 值示例
truthy_values = [
    ("1", 1),
    ("-1", -1),
    ('"0" (非空字符串)', "0"),
    ('" " (空格)', " "),
    ("[0] (非空列表)", [0]),
    ("{0:0} (非空字典)", {0: 0}),
]
for name, val in truthy_values:
    print(f"bool({name}) = {bool(val)}")

# ========== 4. None 详解 ==========
print()
print("=== 4. None 详解 ===")
# None 是一个单例，整个程序只有一个 None 对象
print(f"None 的类型：{type(None).__name__}")
print(f"None == 0？{None == 0}")
print(f"None == ''？{None == ''}")
print(f"None == False？{None == False}")
print(f"None is None？{None is None}")               # 判断 None 必须用 is

# 演示 None 作为默认值
def greet(name=None):
    """打招呼，如果没给名字就用默认称呼"""
    if name is None:          # 用 is 判断，不是 ==
        name = "游客"
    return f"你好，{name}！"

print(greet())                 # 不传参，使用默认
print(greet("小明"))            # 传参，覆盖默认

# ========== 5. and / or 短路求值 ==========
print()
print("=== 5. and / or 短路求值 ===")
# and：第一个 falsy 就返回，否则返回最后一个
print(f"True and 'hello' = {True and 'hello'}")       # 返回 'hello'
print(f"False and 'hello' = {False and 'hello'}")     # 返回 False（短路）
print(f"0 and 'hello' = {0 and 'hello'}")             # 返回 0（短路）
print(f"1 and 2 and 3 = {1 and 2 and 3}")             # 返回 3

# or：第一个 truthy 就返回，否则返回最后一个
print(f"True or 'hello' = {True or 'hello'}")         # 返回 True（短路）
print(f"False or 'hello' = {False or 'hello'}")       # 返回 'hello'
print(f"0 or '' or 42 = {0 or '' or 42}")             # 返回 42
print(f"0 or '' or [] = {0 or '' or []}")             # 返回 []（全 falsy）

# 短路求值验证：第二个操作数不会执行
print()
print("短路求值验证：")
side_effect = 0
# 下面这个 or 的右侧不会执行，因为 1 是 truthy
result = 1 or (side_effect := 999)  # 海象运算符赋值
print(f"1 or 赋值后 side_effect = {side_effect}")     # 仍然是 0

# 下面这个 and 的右侧不会执行，因为 0 是 falsy
result = 0 and (side_effect := 999)
print(f"0 and 赋值后 side_effect = {side_effect}")    # 仍然是 0

# ========== 6. not 运算符 ==========
print()
print("=== 6. not 运算符 ===")
print(f"not True = {not True}")
print(f"not False = {not False}")
print(f"not 0 = {not 0}")              # 0 是 falsy，not 后为 True
print(f"not '' = {not ''}")            # 空串是 falsy
print(f"not 'hello' = {not 'hello'}")  # 非空串是 truthy

# 双重否定取布尔值
print(f"not not 42 = {not not 42}")    # 相当于 bool(42) = True

print()
print("=" * 50)
print("   布尔值与 None 讲解完毕！")
print("=" * 50)`
  },
  {
    id: "py8-operators",
    group: "数据类型与字符串",
    icon: "➕",
    title: "运算符大全",
    content: `## 算术运算符

| 运算符 | 含义 | 示例 | 结果 |
|--------|------|------|------|
| \`+\` | 加 | \`3 + 5\` | 8 |
| \`-\` | 减 | \`10 - 3\` | 7 |
| \`*\` | 乘 | \`4 * 6\` | 24 |
| \`/\` | 真除（浮点） | \`7 / 2\` | 3.5 |
| \`//\` | 整除 | \`7 // 2\` | 3 |
| \`%\` | 取余 | \`7 % 2\` | 1 |
| \`**\` | 幂 | \`2 ** 10\` | 1024 |

## 比较运算符

| 运算符 | 含义 |
|--------|------|
| \`==\` | 等于（值相等） |
| \`!=\` | 不等于 |
| \`>\` | 大于 |
| \`<\` | 小于 |
| \`>=\` | 大于等于 |
| \`<=\` | 小于等于 |

## 逻辑运算符

| 运算符 | 含义 | 短路规则 |
|--------|------|----------|
| \`and\` | 与（全真才真） | 第一个 falsy 就返回 |
| \`or\` | 或（有真就真） | 第一个 truthy 就返回 |
| \`not\` | 非（取反） | 无 |

## 位运算符

| 运算符 | 含义 | 示例 | 二进制解释 |
|--------|------|------|------------|
| \`&\` | 按位与 | \`5 & 3\` = 1 | 101 & 011 = 001 |
| \`\|\` | 按位或 | \`5 \| 3\` = 7 | 101 \| 011 = 111 |
| \`^\` | 按位异或 | \`5 ^ 3\` = 6 | 101 ^ 011 = 110 |
| \`~\` | 按位取反 | \`~5\` = -6 | ~101 = -(101+1)补码 |
| \`<<\` | 左移 | \`5 << 1\` = 10 | 101 → 1010 |
| \`>>\` | 右移 | \`5 >> 1\` = 2 | 101 → 10 |

## 身份运算符

| 运算符 | 含义 |
|--------|------|
| \`is\` | 判断是否**同一个对象**（比较内存地址） |
| \`is not\` | 判断是否不是同一个对象 |

\`is\` 和 \`==\` 的区别：
- \`==\` 比较**值**是否相等
- \`is\` 比较**内存地址**是否相同（是否同一个对象）

## 成员运算符

| 运算符 | 含义 |
|--------|------|
| \`in\` | 判断元素是否在容器中 |
| \`not in\` | 判断元素是否不在容器中 |

## 运算符优先级（从高到低）

| 优先级 | 运算符 |
|--------|--------|
| 1 | \`**\` |
| 2 | \`~\` \`+\` \`-\`（一元） |
| 3 | \`*\` \`/\` \`//\` \`%\` |
| 4 | \`+\` \`-\`（二元） |
| 5 | \`<<\` \`>>\` |
| 6 | \`&\` |
| 7 | \`^\` |
| 8 | \`\|\` |
| 9 | \`==\` \`!=\` \`>\` \`<\` \`>=\` \`<=\` \`is\` \`in\` |
| 10 | \`not\` |
| 11 | \`and\` |
| 12 | \`or\` |

**口诀**：当不确定优先级时，**加括号**！括号优先级最高且最清晰。

## 链式比较

Python 支持链式比较，这在大多数语言中不支持：

\`\`\`python
# 等价于 a < b and b < c
a < b < c

# 验证数字在范围内
1 <= x <= 10
\`\`\`

下面的 demo 全面演示所有运算符，包括位运算、链式比较、is vs == 的区别。`,
    code: `# 运算符大全：算术、比较、逻辑、位、身份、成员、链式

print("=" * 50)
print("         Python 运算符大全")
print("=" * 50)

# ========== 1. 算术运算符 ==========
print()
print("=== 1. 算术运算符 ===")
print(f"加 3 + 5 = {3 + 5}")
print(f"减 10 - 3 = {10 - 3}")
print(f"乘 4 * 6 = {4 * 6}")
print(f"真除 7 / 2 = {7 / 2}")
print(f"整除 7 // 2 = {7 // 2}")
print(f"负数整除 -7 // 2 = {-7 // 2}")    # 注意：向下取整 = -4
print(f"取余 7 % 2 = {7 % 2}")
print(f"幂 2 ** 10 = {2 ** 10}")

# ========== 2. 比较运算符 ==========
print()
print("=== 2. 比较运算符 ===")
print(f"5 == 5 = {5 == 5}")
print(f"5 != 3 = {5 != 3}")
print(f"5 > 3 = {5 > 3}")
print(f"5 < 3 = {5 < 3}")
print(f"5 >= 5 = {5 >= 5}")
print(f"5 <= 5 = {5 <= 5}")

# ========== 3. 逻辑运算符 + 短路 ==========
print()
print("=== 3. 逻辑运算符 ===")
print(f"True and True = {True and True}")
print(f"True and False = {True and False}")
print(f"False and True = {False and True}")
print(f"True or False = {True or False}")
print(f"False or False = {False or False}")
print(f"not True = {not True}")
print(f"not False = {not False}")

# 短路求值：返回具体的值，不是 True/False
print(f"0 and 'hello' = {0 and 'hello'}")      # 返回 0（短路）
print(f"1 and 'hello' = {1 and 'hello'}")      # 返回 'hello'
print(f"0 or 'hello' = {0 or 'hello'}")        # 返回 'hello'
print(f"1 or 'hello' = {1 or 'hello'}")        # 返回 1（短路）

# ========== 4. 位运算符 ==========
print()
print("=== 4. 位运算符 ===")
a, b = 5, 3    # 5 = 0b0101, 3 = 0b0011
print(f"a={a} ({bin(a)})，b={b} ({bin(b)})")
print(f"按位与 a & b = {a & b} ({bin(a & b)})")     # 0101 & 0011 = 0001
print(f"按位或 a | b = {a | b} ({bin(a | b)})")     # 0101 | 0011 = 0111
print(f"按位异或 a ^ b = {a ^ b} ({bin(a ^ b)})")   # 0101 ^ 0011 = 0110
print(f"按位取反 ~a = {~a}")                         # ~0101 = -(0101+1) = -6
print(f"左移 a << 1 = {a << 1} ({bin(a << 1)})")    # 0101 -> 1010 = 10
print(f"右移 a >> 1 = {a >> 1} ({bin(a >> 1)})")    # 0101 -> 0010 = 2

# 位运算实用技巧：判断奇偶
print(f"5 是奇数？{5 & 1 == 1}")     # 奇数最低位为 1
print(f"6 是偶数？{6 & 1 == 0}")     # 偶数最低位为 0

# ========== 5. 身份运算符 is / is not ==========
print()
print("=== 5. 身份运算符：is vs == ===")
# == 比较值，is 比较内存地址
list_a = [1, 2, 3]
list_b = [1, 2, 3]       # 内容相同但是不同的对象
list_c = list_a           # 同一个对象
print(f"list_a == list_b？{list_a == list_b}")    # True（值相等）
print(f"list_a is list_b？{list_a is list_b}")    # False（不同对象）
print(f"list_a is list_c？{list_a is list_c}")    # True（同一对象）
print(f"list_a is not list_b？{list_a is not list_b}")

# None 必须用 is 判断
x = None
print(f"x is None = {x is None}")
print(f"x is not None = {x is not None}")

# ========== 6. 成员运算符 in / not in ==========
print()
print("=== 6. 成员运算符 in / not in ===")
fruits = ["苹果", "香蕉", "橙子"]
print(f"'苹果' in fruits？{'苹果' in fruits}")
print(f"'西瓜' in fruits？{'西瓜' in fruits}")
print(f"'西瓜' not in fruits？{'西瓜' not in fruits}")

# 字符串也可以 in
text = "hello world"
print(f"'hello' in '{text}'？{'hello' in text}")
print(f"'xyz' in '{text}'？{'xyz' in text}")

# 字典 in 判断的是 key
info = {"name": "小明", "age": 18}
print(f"'name' in info？{'name' in info}")
print(f"'小明' in info？{'小明' in info}")    # 不在 key 里，False

# ========== 7. 链式比较 ==========
print()
print("=== 7. 链式比较（Python 特色）===")
x = 5
print(f"1 < {x} < 10 = {1 < x < 10}")          # 等价于 1 < x and x < 10
print(f"1 <= {x} <= 10 = {1 <= x <= 10}")

y = 15
print(f"1 < {y} < 10 = {1 < y < 10}")

# 链式比较的等价写法
print(f"1 < x and x < 10 = {1 < x and x < 10}")

# ========== 8. 运算符优先级演示 ==========
print()
print("=== 8. 运算符优先级 ===")
# 幂 > 乘除 > 加减
print(f"2 + 3 * 4 = {2 + 3 * 4}")              # 2 + 12 = 14
print(f"(2 + 3) * 4 = {(2 + 3) * 4}")           # 5 * 4 = 20
print(f"2 ** 3 * 2 = {2 ** 3 * 2}")             # 8 * 2 = 16（幂优先级高）
print(f"2 ** (3 * 2) = {2 ** (3 * 2)}")         # 2**6 = 64

# 赋值运算符优先级低
a = 10
b = a = 5     # 从右往左结合
print(f"b = a = 5 后：a={a} b={b}")

print()
print("=" * 50)
print("    运算符大全讲解完毕！")
print("=" * 50)`
  },
  {
    id: "py8-str-basic",
    group: "数据类型与字符串",
    icon: "📝",
    title: "字符串基础：索引与切片",
    content: `## 创建字符串的四种方式

\`\`\`python
# 单引号
s1 = 'hello'

# 双引号（和单引号完全等价）
s2 = "hello"

# 三引号：可以跨行，保留换行
s3 = """第一行
第二行"""

# 三单引号同理
s4 = '''也是多行'''
\`\`\`

### 单引号 vs 双引号

当字符串内包含引号时，用另一种引号包裹：

\`\`\`python
s1 = "I'm a student"    # 包含单引号，用双引号包裹
s2 = '他说："你好"'       # 包含双引号，用单引号包裹
\`\`\`

## 转义字符

| 转义序列 | 含义 |
|----------|------|
| \`\\n\` | 换行 |
| \`\\t\` | 制表符（Tab） |
| \`\\\\\` | 反斜杠本身 |
| \`\\'\` | 单引号 |
| \`\\"\` | 双引号 |

## 原始字符串 r""

\`r"..."\` 中的反斜杠就是普通字符，不会被转义：

\`\`\`python
print(r"C:\\Users\\name")   # 输出 C:\\Users\\name（\ 不会转义）
\`\`\`

特别适合写正则表达式和 Windows 路径。

## 字符串不可变

字符串一旦创建，**不能修改**其中的字符：

\`\`\`python
s = "hello"
s[0] = "H"   # TypeError! 字符串不可变
\`\`\`

## 索引：从 0 开始

\`\`\`python
s = "Python"
s[0]    # 'P'（第一个字符）
s[1]    # 'y'
s[-1]   # 'n'（倒数第一个字符）
s[-2]   # 'o'（倒数第二个）
\`\`\`

## 切片：[开始:结束:步长]

语法：\`s[start:stop:step]\`

- \`start\`：起始索引（包含），默认 0
- \`stop\`：结束索引（**不包含**），默认字符串长度
- \`step\`：步长，默认 1

| 切片 | 结果 |
|------|------|
| \`s[0:3]\` | 索引 0,1,2（前 3 个字符） |
| \`s[:3]\` | 同 s[0:3] |
| \`s[3:]\` | 从索引 3 到末尾 |
| \`s[-3:]\` | 最后 3 个字符 |
| \`s[::2]\` | 每隔一个字符 |
| \`s[::-1]\` | 反转字符串！ |

## 拼接与重复

- \`+\` 拼接：\`"hello" + " " + "world"\` → \`"hello world"\`
- \`*\` 重复：\`"ha" * 3\` → \`"hahaha"\`
- \`len()\` 获取长度：\`len("abc")\` → 3

下面的 demo 演示索引、切片的全部玩法，包括步长、负索引、反转字符串。`,
    code: `# 字符串基础：索引、切片、拼接、不可变

print("=" * 50)
print("    字符串基础：索引与切片")
print("=" * 50)

# ========== 1. 创建字符串 ==========
print()
print("=== 1. 创建字符串 ===")
s1 = 'hello'
s2 = "world"
s3 = """第一行
第二行
第三行"""                  # 三引号跨行，保留换行符
print(f"单引号：{s1}")
print(f"双引号：{s2}")
print(f"三引号跨行：{repr(s3)}")    # repr 显示转义符 \\n

# 字符串内包含引号
s4 = "I'm fine"            # 包含单引号，用双引号包裹
s5 = '他说："你好"'         # 包含双引号，用单引号包裹
print(f"包含单引号：{s4}")
print(f"包含双引号：{s5}")

# ========== 2. 转义字符 ==========
print()
print("=== 2. 转义字符 ===")
print("换行\\n第二行")                 # \\n 换行
print("制表符\\t缩进")                 # \\t Tab
print("反斜杠本身\\\\")                # \\\\ 输出一个 \\
print("\\\"双引号\\\"")               # \\\" 转义双引号

# r"" 原始字符串：反斜杠不转义
print(f"原始字符串 r'C:\\\\Users\\\\name' = {r'C:\\Users\\name'}")

# ========== 3. 索引 ==========
print()
print("=== 3. 索引（从 0 开始）===")
s = "Python"
print(f"字符串 s = '{s}'")
print(f"len(s) = {len(s)}")
# 正向索引
for i in range(len(s)):
    print(f"  s[{i}] = '{s[i]}'")
# 负向索引
print(f"s[-1] = '{s[-1]}'（倒数第1个）")
print(f"s[-2] = '{s[-2]}'（倒数第2个）")
print(f"s[-3] = '{s[-3]}'（倒数第3个）")

# ========== 4. 切片 [start:stop:step] ==========
print()
print("=== 4. 切片详解 ===")
s = "Python学习"
print(f"字符串 s = '{s}'，长度 = {len(s)}")
print()

# 前3个字符
print(f"s[0:3] = '{s[0:3]}'（索引 0,1,2）")
# 省略 start
print(f"s[:3] = '{s[:3]}'（等价于 s[0:3]）")
# 省略 stop
print(f"s[3:] = '{s[3:]}'（从索引3到末尾）")
# 负数索引切片
print(f"s[-3:] = '{s[-3:]}'（最后3个字符）")
print(f"s[:-3] = '{s[:-3]}'（去掉最后3个）")
# 带步长的切片
print(f"s[::2] = '{s[::2]}'（每隔一个字符）")
print(f"s[1::2] = '{s[1::2]}'（从索引1开始每隔一个）")
# 反转字符串
print(f"s[::-1] = '{s[::-1]}'（反转字符串！）")
# 步长为负数时的行为
print(f"s[::-2] = '{s[::-2]}'（反向每隔一个）")

# ========== 5. 字符串不可变 ==========
print()
print("=== 5. 字符串不可变 ===")
s = "hello"
print(f"原始字符串：'{s}'")
# s[0] = "H"  # 这会报 TypeError
# 正确做法：创建新字符串
s_new = "H" + s[1:]
print(f"修改后（新字符串）：'{s_new}'")
print(f"原字符串不变：'{s}'")

# ========== 6. 拼接 + 和重复 * ==========
print()
print("=== 6. 拼接 + 和 重复 * ===")
a = "Hello"
b = "World"
print(f"'{a}' + ' ' + '{b}' = '{a + ' ' + b}'")
print(f"'{a}' * 3 = '{a * 3}'")
print(f"'-' * 30 = '{'-' * 30}'")

# 高效拼接：join
words = ["Python", "is", "awesome"]
joined = " ".join(words)      # 用空格连接列表
print(f"' '.join({words}) = '{joined}'")

# ========== 7. 遍历字符串 ==========
print()
print("=== 7. 遍历字符串 ===")
s = "Python"
print(f"遍历 '{s}'：")
for i, ch in enumerate(s):          # enumerate 同时获取索引和值
    print(f"  s[{i}] = '{ch}'")

# ========== 8. 字符串判断 ==========
print()
print("=== 8. 字符串其他操作 ===")
s = "Python"
print(f"'{s}' 的长度 len() = {len(s)}")
print(f"'Py' in '{s}'？{'Py' in s}")
print(f"'xyz' in '{s}'？{'xyz' in s}")
print(f"'Py' not in '{s}'？{'Py' not in s}")
print(f"'{s}' 的最小字符 min() = '{min(s)}'")   # 按 ASCII 比较
print(f"'{s}' 的最大字符 max() = '{max(s)}'")

print()
print("=" * 50)
print("  字符串索引与切片讲解完毕！")
print("=" * 50)`
  },
  {
    id: "py8-str-methods",
    group: "数据类型与字符串",
    icon: "🔧",
    title: "字符串方法详解",
    content: `## 字符串方法总览

字符串方法**返回新字符串**，不修改原字符串（因为字符串不可变）。

### 查找类

| 方法 | 作用 | 找不到时 |
|------|------|----------|
| \`find(sub)\` | 查找子串，返回索引 | 返回 -1 |
| \`rfind(sub)\` | 从右查找 | 返回 -1 |
| \`index(sub)\` | 查找子串，返回索引 | 抛 ValueError |
| \`count(sub)\` | 统计出现次数 | 返回 0 |

### 替换类

| 方法 | 作用 |
|------|------|
| \`replace(old, new)\` | 替换子串 |
| \`replace(old, new, count)\` | 替换前 count 次 |
| \`strip()\` | 去掉两端空白（空格、\\n、\\t） |
| \`lstrip()\` | 去掉左侧空白 |
| \`rstrip()\` | 去掉右侧空白 |
| \`strip(chars)\` | 去掉指定字符 |

### 分割与合并

| 方法 | 作用 |
|------|------|
| \`split(sep)\` | 按分隔符切分，返回列表 |
| \`rsplit(sep, maxsplit)\` | 从右侧切分 |
| \`splitlines()\` | 按换行切分 |
| \`join(iterable)\` | 用分隔符连接列表 |

### 大小写

| 方法 | 作用 |
|------|------|
| \`upper()\` | 全部大写 |
| \`lower()\` | 全部小写 |
| \`title()\` | 每个单词首字母大写 |
| \`capitalize()\` | 首字母大写，其余小写 |
| \`swapcase()\` | 大小写反转 |

### 判断类

| 方法 | 作用 |
|------|------|
| \`startswith(prefix)\` | 是否以...开头 |
| \`endswith(suffix)\` | 是否以...结尾 |
| \`isdigit()\` | 是否全是数字 |
| \`isalpha()\` | 是否全是字母 |
| \`isalnum()\` | 是否全是字母或数字 |
| \`isspace()\` | 是否全是空白字符 |

### 填充对齐

| 方法 | 作用 |
|------|------|
| \`center(width, fill)\` | 居中 |
| \`ljust(width, fill)\` | 左对齐 |
| \`rjust(width, fill)\` | 右对齐 |
| \`zfill(width)\` | 右对齐，左侧填 0 |

下面的 demo 用大量实战示例展示所有常用字符串方法，每个方法都有输出验证。`,
    code: `# 字符串方法详解：查找、替换、分割、大小写、判断、填充

print("=" * 50)
print("        字符串方法全面讲解")
print("=" * 50)

# ========== 1. 查找：find / rfind / index / count ==========
print()
print("=== 1. 查找类方法 ===")
s = "hello world, hello Python"
print(f"原始字符串：'{s}'")

# find 查找子串位置（找不到返回 -1，不抛异常）
print(f"find('hello') = {s.find('hello')}")         # 第一个 hello 的位置
print(f"find('hello', 5) = {s.find('hello', 5)}")   # 从索引5开始找
print(f"rfind('hello') = {s.rfind('hello')}")       # 从右找最后一个
print(f"find('xyz') = {s.find('xyz')}")              # 找不到返回 -1

# index 和 find 类似，但找不到抛异常
print(f"index('hello') = {s.index('hello')}")
try:
    s.index('xyz')
except ValueError:
    print("index('xyz') 抛出 ValueError（找不到）")

# count 统计出现次数
print(f"count('hello') = {s.count('hello')}")       # 2
print(f"count('l') = {s.count('l')}")               # 5

# ========== 2. 替换：replace / strip 系列 ==========
print()
print("=== 2. 替换与清理 ===")
s = "  hello world  "
print(f"原始字符串：'{s}'")

# strip 去掉两端空白
print(f"strip() = '{s.strip()}'")
print(f"lstrip() = '{s.lstrip()}'")
print(f"rstrip() = '{s.rstrip()}'")

# strip 指定字符
s2 = "###hello###"
print(f"strip('#') = '{s2.strip('#')}'")

# replace 替换
s3 = "hello world, hello Python"
print(f"replace('hello', '你好') = '{s3.replace('hello', '你好')}'")
print(f"replace('hello', '你好', 1) = '{s3.replace('hello', '你好', 1)}'")  # 只替换1次

# ========== 3. 分割与合并：split / join ==========
print()
print("=== 3. 分割与合并 ===")

# split 按分隔符切分
csv = "苹果,香蕉,橙子,西瓜"
parts = csv.split(",")
print(f"split(',') 切分 '{csv}':")
print(f"  结果 = {parts}")

# 限制分割次数
print(f"split(',', 2) = {csv.split(',', 2)}")       # 最多切2次

# rsplit 从右侧切
print(f"rsplit(',', 2) = {csv.rsplit(',', 2)}")

# splitlines 按换行切
text = "第一行\\n第二行\\n第三行"
print(f"splitlines() 切分：{text.splitlines()}")

# join 用分隔符连接
words = ["Python", "is", "awesome"]
print(f"' '.join({words}) = '{' '.join(words)}'")
print(f"'-'.join({words}) = '{'-'.join(words)}'")

# ========== 4. 大小写转换 ==========
print()
print("=== 4. 大小写转换 ===")
s = "hello WORLD python"
print(f"原始：'{s}'")
print(f"upper() = '{s.upper()}'")                    # 全大写
print(f"lower() = '{s.lower()}'")                    # 全小写
print(f"title() = '{s.title()}'")                    # 每个词首字母大写
print(f"capitalize() = '{s.capitalize()}'")          # 句首大写其余小写
print(f"swapcase() = '{s.swapcase()}'")              # 大小写反转

# ========== 5. 判断方法 ==========
print()
print("=== 5. 判断类方法 ===")
# startswith / endswith
filename = "report.pdf"
print(f"'{filename}'.startswith('report') = {filename.startswith('report')}")
print(f"'{filename}'.endswith('.pdf') = {filename.endswith('.pdf')}")
print(f"'{filename}'.endswith('.txt') = {filename.endswith('.txt')}")

# 多后缀判断
print(f"endswith(('.pdf', '.txt')) = {filename.endswith(('.pdf', '.txt'))}")

# 字符类型判断
tests = [
    ("12345", "isdigit"),
    ("abc", "isalpha"),
    ("abc123", "isalnum"),
    ("   ", "isspace"),
    ("hello", "islower"),
    ("HELLO", "isupper"),
    ("Hello", "istitle"),
]
for text, method in tests:
    result = getattr(text, method)()    # 动态调用方法
    print(f"'{text}'.{method}() = {result}")

# ========== 6. 填充对齐 ==========
print()
print("=== 6. 填充与对齐 ===")
s = "Python"
print(f"原始：'{s}'")
print(f"center(20, '-') = '{s.center(20, '-')}'")    # 居中，- 填充
print(f"ljust(20, '-')  = '{s.ljust(20, '-')}'")     # 左对齐
print(f"rjust(20, '-')  = '{s.rjust(20, '-')}'")     # 右对齐
print(f"zfill(10) = '{s.zfill(10)}'")                # 左侧补0

# 对齐数字
num = "42"
print(f"'{num}'.zfill(5) = '{num.zfill(5)}'")

# ========== 7. 综合实战：字符串清洗 ==========
print()
print("=== 7. 综合实战：清洗用户输入 ===")
# 模拟各种脏数据
raw_inputs = [
    "  hello  ",
    "HELLO WORLD",
    "apple,banana,orange",
    "user@email.com",
    "  123abc  ",
]

for raw in raw_inputs:
    print(f"原始：'{raw}'")
    # 去空格
    cleaned = raw.strip()
    print(f"  去空格后：'{cleaned}'")
    # 转小写
    print(f"  转小写：'{cleaned.lower()}'")
    # 判断类型
    if cleaned.isdigit():
        print(f"  是纯数字")
    elif cleaned.isalpha():
        print(f"  是纯字母")
    else:
        print(f"  是混合类型")
    print()

print("=" * 50)
print("  字符串方法讲解完毕！")
print("=" * 50)`
  },
  {
    id: "py8-format",
    group: "数据类型与字符串",
    icon: "🎨",
    title: "字符串格式化三种方式",
    content: `## 方式一：% 占位符（传统方式）

\`\`\`python
name = "小明"
age = 18
"我叫%s，今年%d岁" % (name, age)
\`\`\`

### 常用占位符

| 占位符 | 含义 |
|--------|------|
| \`%s\` | 字符串（自动 str()） |
| \`%d\` | 十进制整数 |
| \`%f\` | 浮点数（默认6位） |
| \`%.2f\` | 浮点数（2位小数） |
| \`%x\` | 十六进制小写 |
| \`%X\` | 十六进制大写 |
| \`%%\` | 百分号本身 |

## 方式二：str.format()（灵活方式）

\`\`\`python
# 位置占位
"我叫{}，今年{}岁".format("小明", 18)

# 索引
"{0} 喜欢 {1}，{0} 也喜欢 {2}".format("小明", "Python", "数学")

# 命名
"{name} 今年 {age} 岁".format(name="小明", age=18)
\`\`\`

### format 格式说明符

格式：\`{[name]:[填充][对齐][宽度][.精度][类型]}\`

| 说明符 | 示例 | 结果 |
|--------|------|------|
| \`{:>10}\` | \`"{:>10}".format("hi")\` | \`"        hi"\` |
| \`{:<10}\` | \`"{:<10}".format("hi")\` | \`"hi        "\` |
| \`{:^10}\` | \`"{:^10}".format("hi")\` | \`"    hi    "\` |
| \`{:.2f}\` | \`"{:.2f}".format(3.14159)\` | \`"3.14"\` |
| \`{:,.2f}\` | \`"{:,.2f}".format(1234567)\` | \`"1,234,567.00"\` |
| \`{:0>5}\` | \`"{:0>5}".format(42)\` | \`"00042"\` |

## 方式三：f-string（推荐，Python 3.6+）

\`\`\`python
name = "小明"
age = 18
f"我叫{name}，今年{age}岁"
\`\`\`

## 三种方式对比

| 特性 | % 占位符 | format() | f-string |
|------|----------|----------|----------|
| 可读性 | 一般 | 好 | 最佳 |
| 支持表达式 | 否 | 否 | 是 |
| 性能 | 中等 | 较慢 | 最快 |
| 多行 | 烦 | 可以 | 直接 |
| Python 版本 | 所有版本 | 2.6+ | 3.6+ |

**推荐**：Python 3.6+ 用 f-string，需要模板复用用 format()，旧代码维护用 % 占位符。

下面的 demo 并行演示三种格式化方式，对比它们的用法和效果。`,
    code: `# 字符串格式化三种方式：% 占位符、format()、f-string

print("=" * 50)
print("   字符串格式化三种方式对比")
print("=" * 50)

name = "小明"
age = 18
score = 95.5
pi = 3.14159265358979

# ========== 1. % 占位符 ==========
print()
print("=== 1. % 占位符（传统方式）===")

# 基本用法
s1 = "我叫%s，今年%d岁，成绩%.1f分" % (name, age, score)
print(s1)

# 单个值可以不加括号
s2 = "圆周率：%.2f" % pi
print(s2)

# 各种占位符
print(f"%%s 字符串：{'%s' % 'hello'}")
print(f"%%d 整数：{'%d' % 42}")
print(f"%%f 浮点：{'%f' % 3.14159}")
print(f"%%.2f 两位小数：{'%.2f' % 3.14159}")
print(f"%%x 十六进制：{'%x' % 255}")
print(f"%%X 大写十六进制：{'%X' % 255}")
print(f"%%o 八进制：{'%o' % 8}")
print(f"%%%% 百分号：{'完成率 100%%' % ()}")

# 宽度与对齐
print(f"右对齐 '%10s'：|{'%10s' % 'hi'}|")
print(f"左对齐 '%-10s'：|{'%-10s' % 'hi'}|")
print(f"补零 '%05d'：|{'%05d' % 42}|")

# ========== 2. str.format() ==========
print()
print("=== 2. str.format() 方式 ===")

# 位置占位符
s3 = "我叫{}，今年{}岁，成绩{:.1f}".format(name, age, score)
print(f"位置占位：{s3}")

# 索引占位（可重复使用）
s4 = "{0} 喜欢 {1}，{0} 也喜欢 {2}".format("小明", "Python", "数学")
print(f"索引占位：{s4}")

# 命名占位
s5 = "{name} 今年 {age} 岁".format(name="小红", age=20)
print(f"命名占位：{s5}")

# 格式说明符
print()
print("格式说明符演示：")
print(f"右对齐 >10：|{'hello':>10}|")    # 注意：这里用 f-string 演示 format 的格式
# 用真正的 format() 演示
print("右对齐：|{:>10}|".format("hello"))
print("左对齐：|{:<10}|".format("hello"))
print("居中：|{:^10}|".format("hello"))
print("补零：|{:0>5}|".format(42))
print("千分位：{:,}".format(1234567890))
print("千分位两位小数：{:,.2f}".format(1234567.89))
print("百分比：{:.1%}".format(0.856))
print("科学计数：{:e}".format(1234567))
print("十六进制：{:x}".format(255))
print("二进制：{:b}".format(10))

# ========== 3. f-string ==========
print()
print("=== 3. f-string（推荐方式）===")

# 基本用法
print(f"我叫{name}，今年{age}岁，成绩{score:.1f}")

# 表达式
a, b = 10, 20
print(f"{a} + {b} = {a + b}")
print(f"{a} * {b} = {a * b}")

# 调用函数
print(f"name 长度 = {len(name)}")
print(f"name 大写 = {name.upper()}")

# 格式说明
print(f"pi 保留 2 位：{pi:.2f}")
print(f"pi 保留 4 位：{pi:.4f}")
print(f"右对齐 >10：|{'hello':>10}|")
print(f"居中 ^10：|{'hello':^10}|")
print(f"补零 05d：{42:05d}")
print(f"千分位：{1234567890:,}")
print(f"百分比：{0.856:.1%}")

# Python 3.8+ 调试语法 {x=}
print(f"调试：{name=} {age=} {score=}")

# ========== 4. 三种方式对比表 ==========
print()
print("=== 4. 三种方式对比 ===")
print(f"{'特性':<12} {'%占位符':<14} {'format()':<14} {'f-string':<14}")
print("-" * 54)
print(f"{'基本用法':<12} {'%s %d':<14} {'{} {}':<14} {'{x} {y}':<14}")
print(f"{'表达式':<12} {'不支持':<14} {'不支持':<14} {'支持':<14}")
print(f"{'性能':<12} {'中等':<14} {'较慢':<14} {'最快':<14}")

print()
print("=" * 50)
print("  格式化三种方式讲解完毕！")
print("=" * 50)`
  },
  {
    id: "py8-fstring",
    group: "数据类型与字符串",
    icon: "⚡",
    title: "f-string 深入",
    content: `## f-string 的强大之处

f-string（格式化字符串字面值）是 Python 3.6 引入的，写法是 \`f"..."\`，在花括号里直接嵌入变量和表达式。

### 基本用法

\`\`\`python
name = "小明"
f"我叫{name}"   # 直接嵌入变量
f"1 + 1 = {1 + 1}"   # 嵌入表达式
f"长度：{len(name)}"  # 调用函数
\`\`\`

### 格式说明符

格式：\`{变量:说明符}\`

| 说明符 | 含义 | 示例 | 结果 |
|--------|------|------|------|
| \`:>10\` | 右对齐，宽度 10 | \`f"{'hi':>10}"\` | \`"        hi"\` |
| \`:<10\` | 左对齐，宽度 10 | \`f"{'hi':<10}"\` | \`"hi        "\` |
| \`:^10\` | 居中，宽度 10 | \`f"{'hi':^10}"\` | \`"    hi    "\` |
| \`:.2f\` | 浮点 2 位小数 | \`f"{3.14159:.2f}"\` | \`"3.14"\` |
| \`:05d\` | 整数补零到 5 位 | \`f"{42:05d}"\` | \`"00042"\` |
| \`:,.2f\` | 千分位 + 2 位小数 | \`f"{1234567:,.2f}"\` | \`"1,234,567.00"\` |
| \`:.1%\` | 百分比 1 位小数 | \`f"{0.856:.1%}"\` | \`"85.6%"\` |

### 调试语法 {x=}

Python 3.8+ 支持 \`{x=}\`，自动输出变量名和值，调试利器：

\`\`\`python
name = "小明"
age = 18
f"{name=} {age=}"   # "name='小明' age=18"
\`\`\`

### 嵌套字段宽度

\`\`\`python
width = 10
f"{'hello':>{width}}"   # 宽度可以是变量，等价于 {:>10}
\`\`\`

### 转换标志 !r !s !a

| 标志 | 含义 | 调用的函数 |
|------|------|-----------|
| \`!s\` | 字符串形式 | str() |
| \`!r\` | 可打印形式 | repr() |
| \`!a\` | ASCII 形式 | ascii() |

\`\`\`python
from datetime import datetime
now = datetime.now()

f"{now!s}"   # 人类可读：2024-01-01 12:00:00
f"{now!r}"   # 机器可读：datetime.datetime(2024, 1, 1, 12, 0, 0)
\`\`\`

### 格式化日期

\`\`\`python
f"{now:%Y-%m-%d %H:%M:%S}"   # 2024-01-01 12:00:00
\`\`\`

下面的 demo 深入展示 f-string 的所有高级用法，包括格式说明符、调试语法、转换标志、日期格式化。`,
    code: `# f-string 深入：格式说明符、调试、转换、嵌套

import datetime

print("=" * 50)
print("       f-string 深入讲解")
print("=" * 50)

# ========== 1. 基本用法 ==========
print()
print("=== 1. 基本：变量 + 表达式 + 函数 ===")
name = "小明"
age = 18
a, b = 10, 20

# 嵌入变量
print(f"我叫{name}，今年{age}岁")

# 嵌入表达式
print(f"{a} + {b} = {a + b}")
print(f"{a} * {b} = {a * b}")
print(f"判断：{a > b}")

# 调用函数
print(f"name 的长度 = {len(name)}")
print(f"name 大写 = {name.upper()}")
print(f"name 反转 = {name[::-1]}")

# 调用方法
print(f"name 是否以 '小' 开头？{name.startswith('小')}")

# ========== 2. 格式说明符详解 ==========
print()
print("=== 2. 格式说明符 ===")

# 宽度与对齐
print(f"右对齐 |{'hello':>10}|")
print(f"左对齐 |{'hello':<10}|")
print(f"居中   |{'hello':^10}|")
print(f"填充   |{'hello':-^10}|")    # 用 - 填充

# 整数格式化
print(f"补零 5位：{42:05d}")
print(f"右对齐 5位：{42:>5d}")
print(f"千分位：{1234567890:,}")
print(f"带符号：{42:+d}")            # + 强制显示正号
print(f"带符号：{-42:+d}")

# 浮点数格式化
pi = 3.14159265358979
print(f"默认：{pi}")
print(f"2位小数：{pi:.2f}")
print(f"4位小数：{pi:.4f}")
print(f"科学计数：{pi:e}")
print(f"千分位+2位：{1234567.89:,.2f}")

# 百分比
print(f"百分比：{0.856:.1%}")
print(f"百分比无小数：{0.856:.0%}")

# 进制
print(f"十六进制：{255:#x}")          # #x 带 0x 前缀
print(f"八进制：{255:#o}")
print(f"二进制：{10:#b}")

# ========== 3. {x=} 调试语法 ==========
print()
print("=== 3. {x=} 调试语法（Python 3.8+）===")
x = 100
y = "hello"
z = [1, 2, 3]
print(f"{x=}")                        # 输出 x=100
print(f"{y=}")                        # 输出 y='hello'
print(f"{z=}")                        # 输出 z=[1, 2, 3]

# 配合格式说明
print(f"{pi=:.2f}")                   # 输出 pi=3.14

# 表达式也支持
print(f"{x * 2=}")                    # 显示表达式文本和结果

# ========== 4. 嵌套字段宽度 ==========
print()
print("=== 4. 嵌套字段宽度 ===")
width = 15
print(f"动态宽度：|{'hello':>{width}}|")
print(f"动态宽度：|{'hello':^{width}}|")

# 多级嵌套
align = ">"
print(f"动态对齐：|{'hello':{align}{width}}|")

# ========== 5. 转换标志 !s !r !a ==========
print()
print("=== 5. 转换标志 !s !r !a ===")

# 普通字符串看不出区别
s = "hello"
print(f"!s 默认：{s!s}")              # str()
print(f"!r repr：{s!r}")              # repr() 会加引号

# 区别在特殊字符上
s2 = "hello\\nworld"
print(f"!s 会换行：{s2!s}")            # 字符串被解释，换行显示
print(f"!r 显示转义：{s2!r}")          # 显示原始字符串形式

# 中文字符
s3 = "你好"
print(f"!s：{s3!s}")
print(f"!r：{s3!r}")
print(f"!a：{s3!a}")                   # ascii() 显示 Unicode 转义

# ========== 6. datetime 日期格式化 ==========
print()
print("=== 6. 日期格式化 ===")
now = datetime.datetime(2024, 6, 30, 14, 30, 45)
print(f"!s 默认显示：{now!s}")
print(f"!r repr：{now!r}")
print(f"格式化日期：{now:%Y-%m-%d}")
print(f"格式化时间：{now:%H:%M:%S}")
print(f"完整格式：{now:%Y-%m-%d %H:%M:%S}")
print(f"中文格式：{now:%Y年%m月%d日 %H时%M分%S秒}")
print(f"星期几：{now:%A}")             # Sunday, Monday...
print(f"月份：{now:%B}")               # January, February...

# 常用日期格式速查
print()
print("常用日期格式符号：")
print("  %Y = 四位年份，%y = 两位年份")
print("  %m = 月份(01-12)，%d = 日期(01-31)")
print("  %H = 小时(00-23)，%M = 分钟(00-59)，%S = 秒(00-59)")

# ========== 7. 多行 f-string ==========
print()
print("=== 7. 多行 f-string ===")
# 用三引号
card = f"""
姓名：{name}
年龄：{age}
圆周率：{pi:.4f}
欢迎{name}学习 Python！
"""
print(card.strip())

# ========== 8. 转义花括号 ==========
print()
print("=== 8. 转义花括号 ===")
# 要输出 { 或 }，用 {{ 和 }}
print(f"这是一个花括号 {{ 和一个右花括号 }}")
print(f"{{{{ name }}}} 这样写")

print()
print("=" * 50)
print("   f-string 深入讲解完毕！")
print("=" * 50)`
  },
  {
    id: "py8-encoding",
    group: "数据类型与字符串",
    icon: "🌐",
    title: "字符编码与 Unicode",
    content: `## 理解编码的必要性

计算机只能存储数字（0 和 1），文字需要转换成数字才能存储，这个转换规则就是**编码**。

### ASCII

最早的编码，用 1 个字节（8 位）表示一个字符，只能表示 128 个字符（英文、数字、标点）。中文、日文、表情符号统统没有。

### Unicode

Unicode 的目标是**给世界上所有字符一个唯一编号**（码点 code point）。例如：

| 字符 | Unicode 码点 | 十进制 |
|------|-------------|--------|
| A | U+0041 | 65 |
| 你 | U+4F60 | 20320 |
| 😀 | U+1F600 | 128512 |

### UTF-8

UTF-8 是 Unicode 的**实现方式**（编码方案），变长编码：

- ASCII 字符（U+0000 ~ U+007F）：1 字节
- 中文等（U+0800 ~ U+FFFF）：3 字节
- 表情符号（U+10000 ~）：4 字节

### Python 中的编码

Python 3 的 \`str\` 内部使用 Unicode 存储。\`bytes\` 是字节序列。

| 操作 | 函数 |
|------|------|
| 字符 → Unicode 码点 | \`ord('A')\` = 65 |
| 码点 → 字符 | \`chr(65)\` = 'A' |
| str → bytes | \`"你好".encode("utf-8")\` |
| bytes → str | \`b'\\xe4\\xbd\\xa0'.decode("utf-8")\` |

### 编码错误处理

\`encode()\` 和 \`decode()\` 的 \`errors\` 参数：

| errors 值 | 行为 |
|-----------|------|
| \`"strict"\` | 默认，报错 |
| \`"ignore"\` | 跳过无法处理的字符 |
| \`"replace"\` | 用 \`?\` 或 \`\` 替换 |

### BOM（字节顺序标记）

UTF-8 文件开头可能有 \`\\ufeff\`（BOM），Windows 记事本保存 UTF-8 时会自动加。用 \`encoding="utf-8-sig"\` 可以自动处理。

### ASCII 码速查表（常用）

| 字符 | ASCII | 字符 | ASCII |
|------|-------|------|-------|
| 0-9 | 48-57 | A-Z | 65-90 |
| a-z | 97-122 | 空格 | 32 |

下面的 demo 用 ord()/chr()/encode()/decode() 全方位展示字符编码。`,
    code: `# 字符编码与 Unicode：ord、chr、encode、decode

print("=" * 50)
print("    字符编码与 Unicode 详解")
print("=" * 50)

# ========== 1. ord() 和 chr() ==========
print()
print("=== 1. ord() 获取 Unicode 码点 ===")
# ord() 返回字符的 Unicode 码点（整数）
chars = [
    ("A", ord("A")),
    ("B", ord("B")),
    ("a", ord("a")),
    ("0", ord("0")),
    ("你", ord("你")),
    ("好", ord("好")),
    ("😀", ord("😀")),
    ("中", ord("中")),
]
for ch, code in chars:
    print(f"ord('{ch}') = {code}，十六进制：{hex(code)}")

# chr() 反过来：码点 -> 字符
print()
print("=== 2. chr() 码点转字符 ===")
codes = [65, 97, 48, 20320, 22909, 128512]
for code in codes:
    print(f"chr({code}) = '{chr(code)}'")

# 打印 ASCII 码表部分
print()
print("=== 3. ASCII 码表（数字 0-9，字母 A-Z，a-z）===")
# 数字 0-9
print("数字：", end="")
for i in range(48, 58):
    print(chr(i), end=" ")
print()

# 大写字母 A-Z
print("大写：", end="")
for i in range(65, 91):
    print(chr(i), end=" ")
print()

# 小写字母 a-z
print("小写：", end="")
for i in range(97, 123):
    print(chr(i), end=" ")
print()

# ========== 4. encode()：字符串 -> 字节 ==========
print()
print("=== 4. encode()：str -> bytes ===")
text = "Hello 你好"
print(f"原始字符串：'{text}'")

# UTF-8 编码
utf8_bytes = text.encode("utf-8")
print(f"UTF-8 编码：{utf8_bytes}")
print(f"  字节长度：{len(utf8_bytes)}")     # 5 + 1 + 3*2 = 12

# 逐个字节分析
print("  逐个字节：", end="")
for b in utf8_bytes:
    print(f"{b:02x}", end=" ")
print()

# UTF-16 编码
utf16_bytes = text.encode("utf-16")
print(f"UTF-16 编码：{utf16_bytes}")
print(f"  字节长度：{len(utf16_bytes)}")    # 2(BOM) + 2*7 = 16

# GBK 编码（中文编码）
try:
    gbk_bytes = text.encode("gbk")
    print(f"GBK 编码：{gbk_bytes}")
    print(f"  字节长度：{len(gbk_bytes)}")
except UnicodeEncodeError:
    print("GBK 编码失败")

# 不同字符的 UTF-8 字节数对比
print()
print("不同字符 UTF-8 编码字节数：")
chars_demo = [("A", "A"), ("你", "你"), ("😀", "😀")]
for label, ch in chars_demo:
    enc = ch.encode("utf-8")
    print(f"  '{label}' = {enc}，{len(enc)} 字节")

# ========== 5. decode()：字节 -> 字符串 ==========
print()
print("=== 5. decode()：bytes -> str ===")
# 用 UTF-8 解码
original = utf8_bytes.decode("utf-8")
print(f"UTF-8 解码：'{original}'")

# 用 GBK 解码 GBK 编码的字节
gbk_data = "你好".encode("gbk")
print(f"GBK 字节：{gbk_data}")
print(f"GBK 解码：'{gbk_data.decode('gbk')}'")

# ========== 6. 编码错误处理 ==========
print()
print("=== 6. 编码错误处理 ===")
# 模拟错误：用 GBK 编码包含表情符号的字符串
try:
    "😀".encode("gbk")     # GBK 不支持表情符号
except UnicodeEncodeError as e:
    print(f"strict 模式报错：{e}")

# errors='ignore'：跳过无法编码的字符
result = "你好😀世界".encode("gbk", errors="ignore")
print(f"ignore 模式：{result}，解码后：'{result.decode('gbk')}'")

# errors='replace'：用 ? 替换
result = "你好😀世界".encode("gbk", errors="replace")
print(f"replace 模式：{result}，解码后：'{result.decode('gbk')}'")

# 解码错误
# 用错误的编码解码
try:
    "你好".encode("utf-8").decode("ascii")
except UnicodeDecodeError as e:
    print(f"ASCII 解码 UTF-8 字节报错：{e}")

# errors='replace' 解码
broken = "你好".encode("utf-8")
print(f"replace 解码：'{broken.decode('ascii', errors='replace')}'")

# ========== 7. BOM 处理 ==========
print()
print("=== 7. BOM（字节顺序标记）===")
# UTF-8-SIG 自动处理 BOM
text = "Hello"
with_bom = "\\ufeff" + text    # 手动添加 BOM 字符
print(f"带 BOM 的字符串 repr：{repr(with_bom)}")
print(f"带 BOM 显示：'{with_bom}'")
print(f"去掉 BOM：'{with_bom.lstrip('\\ufeff')}'")

# BOM 字节
bom_bytes = "\\ufeff".encode("utf-8")
print(f"BOM 的 UTF-8 字节：{bom_bytes}")

# ========== 8. 实用技巧 ==========
print()
print("=== 8. 实用技巧 ===")
# 判断字符是否 ASCII
def is_ascii(ch):
    return ord(ch) < 128

tests = ["A", "你", "1", "😀"]
for ch in tests:
    print(f"'{ch}' 是 ASCII？{is_ascii(ch)}")

# 生成字母表
print(f"字母表：{''.join(chr(i) for i in range(65, 91))}")

print()
print("=" * 50)
print("  字符编码与 Unicode 讲解完毕！")
print("=" * 50)`
  },
  {
    id: "py8-bytes",
    group: "数据类型与字符串",
    icon: "🔋",
    title: "bytes 与 bytearray",
    content: `## bytes：不可变字节序列

\`bytes\` 是 0-255 之间的整数组成的不可变序列。每个元素是一个字节（8 位）。

### 创建 bytes

\`\`\`python
# 字面量
b1 = b"hello"         # 只能包含 ASCII 字符

# 从字符串编码
b2 = "你好".encode("utf-8")

# 从整数列表
b3 = bytes([65, 66, 67])   # b'ABC'

# 从十六进制字符串
b4 = bytes.fromhex("48656c6c6f")   # b'Hello'
\`\`\`

### bytes 与 str 的互转

\`\`\`python
# str -> bytes
data = "你好".encode("utf-8")

# bytes -> str
text = data.decode("utf-8")
\`\`\`

### bytes 支持的操作

- 索引：\`b[0]\` 返回整数（不是 bytes）
- 切片：\`b[:3]\` 返回 bytes
- 遍历：\`for byte in b:\` 每个元素是整数

## bytearray：可变字节序列

\`bytearray\` 和 \`bytes\` 几乎一样，但**可以修改**：

\`\`\`python
ba = bytearray(b"hello")
ba[0] = 72   # 改成 'H' 的 ASCII 码
print(ba)    # bytearray(b'Hello')
\`\`\`

## hex() 与 fromhex()

- \`b.hex()\`：bytes → 十六进制字符串
- \`bytes.fromhex(s)\`：十六进制字符串 → bytes

\`\`\`python
b"hello".hex()                    # '68656c6c6f'
bytes.fromhex("68656c6c6f")       # b'hello'
\`\`\`

## memoryview 简介

\`memoryview\` 让你在不复制数据的情况下操作字节序列，性能极高：

\`\`\`python
mv = memoryview(b"hello")
mv[0]   # 104
\`\`\`

## 二进制数据处理

bytes 常用于：
- 网络传输（socket 收发）
- 文件读写（二进制模式 \`rb\`/\`wb\`）
- 加密/哈希计算
- 图片/音频/视频原始数据

下面的 demo 演示 bytes 和 bytearray 的创建、转换、切片、十六进制操作、二进制数据处理。`,
    code: `# bytes 与 bytearray：创建、转换、操作

import tempfile
import os

print("=" * 50)
print("     bytes 与 bytearray 详解")
print("=" * 50)

# ========== 1. 创建 bytes ==========
print()
print("=== 1. 创建 bytes ===")

# 字面量方式
b1 = b"hello"
print(f"b'hello' = {b1}，类型：{type(b1).__name__}")

# 从字符串编码
b2 = "你好".encode("utf-8")
print(f"'你好'.encode('utf-8') = {b2}")

# 从整数列表
b3 = bytes([65, 66, 67])           # A B C 的 ASCII 码
print(f"bytes([65,66,67]) = {b3}")

# 从十六进制字符串
b4 = bytes.fromhex("48656c6c6f")    # Hello 的十六进制
print(f"bytes.fromhex('48656c6c6f') = {b4}")

# bytes() 带长度
b5 = bytes(5)                        # 5 个零字节
print(f"bytes(5) = {b5}")

# ========== 2. bytes 的索引与切片 ==========
print()
print("=== 2. bytes 索引与切片 ===")
b = b"Hello"
print(f"bytes = {b}")

# 索引返回整数
print(f"b[0] = {b[0]}（整数，不是 bytes）")
print(f"b[1] = {b[1]}")
print(f"b[-1] = {b[-1]}")

# 切片返回 bytes
print(f"b[:3] = {b[:3]}（切片返回 bytes）")
print(f"b[1:4] = {b[1:4]}")
print(f"b[::-1] = {b[::-1]}")        # 反转

# ========== 3. bytes 遍历与操作 ==========
print()
print("=== 3. bytes 遍历 ===")
b = b"Python"
print(f"遍历 {b}：")
for byte in b:
    print(f"  {byte} ({chr(byte)})")   # 每个元素是整数

# bytes 支持 len, in, count
print(f"len(b) = {len(b)}")
print(f"b'P' in b = {b'P' in b}")      # 注意：必须是 bytes 比较
print(f"80 in b = {80 in b}")           # 整数也行
print(f"b.count(b'o') = {b.count(b'o')}")

# ========== 4. bytearray：可变字节序列 ==========
print()
print("=== 4. bytearray：可变字节序列 ===")
ba = bytearray(b"hello")
print(f"原始 bytearray：{ba}")

# 修改元素
ba[0] = ord("H")     # 将 'h' 改成 'H'
print(f"ba[0] = ord('H') 后：{ba}")

# 追加
ba.append(ord("!"))
print(f"ba.append(ord('!')) 后：{ba}")

# 扩展
ba.extend(b" world")
print(f"ba.extend(b' world') 后：{ba}")

# 删除
del ba[5]            # 删除空格
print(f"del ba[5] 后：{ba}")

# 插入
ba.insert(5, ord(" "))
print(f"ba.insert(5, ord(' ')) 后：{ba}")

# bytearray 和 bytes 一样支持切片
print(f"ba[:5] = {ba[:5]}")
print(f"解码为字符串：'{ba.decode('utf-8')}'")

# ========== 5. hex() 与 fromhex() ==========
print()
print("=== 5. 十六进制转换 ===")
b = b"Hello World"
hex_str = b.hex()
print(f"b'Hello World'.hex() = '{hex_str}'")
print(f"  每字节：{' '.join(hex_str[i:i+2] for i in range(0, len(hex_str), 2))}")

# fromhex 转回来
b2 = bytes.fromhex(hex_str)
print(f"bytes.fromhex('{hex_str}') = {b2}")

# 十六进制字符串的常见用途：颜色值、哈希值
color = bytes.fromhex("FF0000")    # 红色
print(f"颜色 FF0000 = {color}")

# ========== 6. str <-> bytes 互转 ==========
print()
print("=== 6. str 与 bytes 互转 ===")
text = "Python 编程"
# str -> bytes
data = text.encode("utf-8")
print(f"'{text}' -> encode: {data}")
# bytes -> str
text2 = data.decode("utf-8")
print(f"bytes -> decode: '{text2}'")

# 不同编码演示
text_cn = "中文"
print(f"'中文' UTF-8：{text_cn.encode('utf-8')}")
print(f"'中文' GBK：{text_cn.encode('gbk')}")
print(f"'中文' UTF-16：{text_cn.encode('utf-16')}")
print(f"UTF-8 长度：{len(text_cn.encode('utf-8'))} 字节")
print(f"GBK 长度：{len(text_cn.encode('gbk'))} 字节")

# ========== 7. 二进制文件读写 ==========
print()
print("=== 7. 二进制文件读写 ===")
# 使用 tempfile 临时目录，避免污染
tmpdir = tempfile.mkdtemp()
filepath = os.path.join(tmpdir, "test.bin")

# 写入二进制数据
data = bytes([0, 1, 2, 3, 255, 254, 253])
with open(filepath, "wb") as f:       # wb = 二进制写入
    f.write(data)
print(f"写入 {len(data)} 字节到临时文件")

# 读取二进制数据
with open(filepath, "rb") as f:       # rb = 二进制读取
    read_data = f.read()
print(f"读取回来：{read_data}")
print(f"数据一致：{data == read_data}")

# 清理
os.remove(filepath)
os.rmdir(tmpdir)
print("临时文件已清理")

# ========== 8. memoryview 简介 ==========
print()
print("=== 8. memoryview 简介 ===")
b = b"Hello World"
mv = memoryview(b)
print(f"memoryview 对象：{mv}")
print(f"mv[0] = {mv[0]}")
print(f"mv[0:5] = {bytes(mv[0:5])}")   # 切片转 bytes 显示
print(f"mv 长度：{len(mv)}")

# memoryview 最大优势：零拷贝切片
# 普通切片会复制数据，memoryview 切片共享底层数据
mv_slice = mv[0:5]
print(f"mv 切片 [0:5] = {bytes(mv_slice)}")

# ========== 9. bytes 实用技巧 ==========
print()
print("=== 9. 实用技巧 ===")
# 生成字节序列
print(f"0-9 的字节：{bytes(range(10))}")
print(f"A-Z 的字节：{bytes(range(65, 91))}")

# 判断是否为 bytes 类型
test_val = b"hello"
print(f"isinstance({test_val}, bytes) = {isinstance(test_val, bytes)}")
print(f"isinstance({test_val}, bytearray) = {isinstance(test_val, bytearray)}")

print()
print("=" * 50)
print("  bytes 与 bytearray 讲解完毕！")
print("=" * 50)`
  },
  {
    id: "py8-convert",
    group: "数据类型与字符串",
    icon: "🔄",
    title: "类型转换与类型提示入门",
    content: `## 类型转换函数

Python 是**强类型**语言，不同类型之间不会自动转换，需要显式调用转换函数。

### 常用转换函数

| 函数 | 能转换的来源 | 示例 |
|------|------------|------|
| \`int(x)\` | 字符串、浮点数、布尔 | \`int("123")\` = 123 |
| \`float(x)\` | 字符串、整数、布尔 | \`float("3.14")\` = 3.14 |
| \`str(x)\` | 任何类型 | \`str(42)\` = "42" |
| \`bool(x)\` | 任何类型 | \`bool("")\` = False |
| \`list(x)\` | 可迭代对象 | \`list("abc")\` = ['a','b','c'] |
| \`tuple(x)\` | 可迭代对象 | \`tuple([1,2])\` = (1,2) |
| \`dict(x)\` | 键值对序列 | \`dict([(1,"a")])\` = {1:'a'} |
| \`set(x)\` | 可迭代对象 | \`set([1,2,2])\` = {1,2} |

### 转换失败：ValueError

\`\`\`python
int("abc")       # ValueError: 没法把 "abc" 转成整数
int("3.14")      # ValueError: 小数点也不行
\`\`\`

### bool 转换陷阱

\`\`\`python
bool("False")    # True！非空字符串都是 truthy
bool("0")        # True！"0" 是非空字符串
bool(0)          # False
\`\`\`

## 类型判断

| 函数 | 作用 |
|------|------|
| \`type(x)\` | 返回对象的类型 |
| \`isinstance(x, T)\` | 判断是否是某个类型（推荐） |

\`isinstance\` 比 \`type() ==\` 更好，因为它支持**继承**：

\`\`\`python
isinstance(True, int)   # True，因为 bool 是 int 的子类
type(True) == int       # False
\`\`\`

## 类型提示（Type Hints）

Python 3.5+ 引入了类型提示，**不强制检查**，但可以让 IDE 和工具（如 mypy）帮你发现错误。

### 基本语法

\`\`\`python
def greet(name: str) -> str:
    return "Hello, " + name

x: int = 10
names: list[str] = ["alice", "bob"]
\`\`\`

### typing 模块常用类型

| 类型 | 含义 |
|------|------|
| \`Optional[X]\` | X 或 None（等价于 \`X | None\`） |
| \`Union[X, Y]\` | X 或 Y（等价于 \`X | Y\`） |
| \`List[X]\` | X 的列表（Python 3.9+ 可用 \`list[X]\`） |
| \`Dict[K, V]\` | 键 K 值 V 的字典 |
| \`Tuple[X, Y]\` | 固定元组 |
| \`Any\` | 任意类型 |

### 类型提示的好处

- IDE 自动补全更准确
- 代码自文档化
- 静态检查工具（mypy / pyright）发现潜在 bug
- 对团队协作非常友好

下面的 demo 演示所有类型转换、类型判断和类型提示实战。`,
    code: `# 类型转换、类型判断、类型提示入门

from typing import Optional, Union, List, Dict, Any

print("=" * 50)
print("   类型转换与类型提示入门")
print("=" * 50)

# ========== 1. 基本类型转换 ==========
print()
print("=== 1. 基本类型转换 ===")

# int() 转换
print(f"int('123') = {int('123')}")            # 字符串转整数
print(f"int(3.99) = {int(3.99)}")              # 浮点截断（不是四舍五入）
print(f"int(True) = {int(True)}")              # True -> 1
print(f"int(False) = {int(False)}")            # False -> 0
print(f"int('0xFF', 16) = {int('0xFF', 16)}")  # 按十六进制解析

# float() 转换
print(f"float('3.14') = {float('3.14')}")
print(f"float(42) = {float(42)}")
print(f"float(True) = {float(True)}")

# str() 转换
print(f"str(42) = '{str(42)}'")
print(f"str(3.14) = '{str(3.14)}'")
print(f"str([1,2,3]) = '{str([1,2,3])}'")

# bool() 转换
print()
print("bool 转换（重要！）：")
print(f"bool(0) = {bool(0)}")
print(f"bool(1) = {bool(1)}")
print(f"bool('') = {bool('')}")
print(f"bool('False') = {bool('False')}")      # 陷阱！非空串 = True
print(f"bool('0') = {bool('0')}")               # 陷阱！非空串 = True
print(f"bool([]) = {bool([])}")                 # 空列表 = False
print(f"bool([0]) = {bool([0])}")               # 非空列表 = True

# ========== 2. 容器类型转换 ==========
print()
print("=== 2. 容器类型转换 ===")

# list()：将可迭代对象转为列表
print(f"list('hello') = {list('hello')}")       # 字符串拆成字符列表
print(f"list((1,2,3)) = {list((1,2,3))}")       # 元组转列表
print(f"list(range(5)) = {list(range(5))}")     # range 转列表

# tuple()：转为元组
print(f"tuple([1,2,3]) = {tuple([1,2,3])}")
print(f"tuple('abc') = {tuple('abc')}")

# set()：转为集合（去重）
print(f"set([1,2,2,3,3,3]) = {set([1,2,2,3,3,3])}")

# dict()：转为字典
pairs = [("name", "小明"), ("age", 18)]
print(f"dict({pairs}) = {dict(pairs)}")

# 关键字参数方式
print(f"dict(name='小明', age=18) = {dict(name='小明', age=18)}")

# ========== 3. 转换失败演示 ==========
print()
print("=== 3. 转换失败 ValueError ===")

# int("abc") 会报错
try:
    int("abc")
except ValueError as e:
    print(f"int('abc') 报错：{e}")

# int("3.14") 也会报错
try:
    int("3.14")
except ValueError as e:
    print(f"int('3.14') 报错：{e}")

# 正确做法：先转 float 再转 int
num = int(float("3.14"))
print(f"int(float('3.14')) = {num}")

# ========== 4. isinstance 类型判断 ==========
print()
print("=== 4. isinstance 类型判断 ===")

# isinstance 比 type() == 更好，因为支持继承
print(f"isinstance(True, int) = {isinstance(True, int)}")       # True（bool 是 int 子类）
print(f"type(True) == int = {type(True) == int}")               # False

# 多类型判断
print(f"isinstance(42, (int, float)) = {isinstance(42, (int, float))}")
print(f"isinstance('hi', (int, float)) = {isinstance('hi', (int, float))}")

# 各种类型判断
tests = [
    (42, int),
    (3.14, float),
    ("hello", str),
    (True, bool),
    ([1,2], list),
    ((1,2), tuple),
    ({1,2}, set),
    ({"a":1}, dict),
    (None, type(None)),
]
for val, typ in tests:
    print(f"isinstance({val!r}, {typ.__name__}) = {isinstance(val, typ)}")

# type() 获取类型
print()
print(f"type(42) = {type(42)}")
print(f"type(3.14) = {type(3.14)}")
print(f"type('hi') = {type('hi')}")
print(f"type(None) = {type(None)}")

# ========== 5. 类型提示基础 ==========
print()
print("=== 5. 类型提示 Type Hints ===")

# 定义带类型提示的函数
def add(a: int, b: int) -> int:
    """两个整数相加"""
    return a + b

def greet(name: str, times: int = 1) -> str:
    """打招呼，可重复多次"""
    return f"你好，{name}！" * times

def get_user(id: int) -> Optional[Dict[str, Any]]:
    """模拟获取用户，可能返回 None"""
    if id == 1:
        return {"name": "小明", "age": 18}
    return None

def process_items(items: List[int]) -> int:
    """处理整数列表，返回总和"""
    return sum(items)

# 使用这些函数
print(f"add(3, 5) = {add(3, 5)}")
print(f"greet('小明', 2) = '{greet('小明', 2)}'")
print(f"get_user(1) = {get_user(1)}")
print(f"get_user(999) = {get_user(999)}")
print(f"process_items([1,2,3,4,5]) = {process_items([1,2,3,4,5])}")

# 变量类型注释
x: int = 10
y: float = 3.14
names: List[str] = ["alice", "bob", "charlie"]
is_active: bool = True

print(f"x: int = {x}")
print(f"names: List[str] = {names}")

# 类型提示不强制（运行时不会报错）
# 但 IDE 和 mypy 可以检查
z: int = "hello"    # 类型提示说 int，但实际是 str
print(f"z: int = 'hello' 不会报错（运行时）：{z}")

# ========== 6. typing 常用类型 ==========
print()
print("=== 6. typing 常用类型 ===")

# Optional[X] = X | None
def find_index(items: list, target: int) -> Optional[int]:
    """查找索引，找不到返回 None"""
    for i, item in enumerate(items):
        if item == target:
            return i
    return None

print(f"find_index([1,2,3,4], 3) = {find_index([1,2,3,4], 3)}")
print(f"find_index([1,2,3,4], 99) = {find_index([1,2,3,4], 99)}")

# Union[X, Y] = X | Y
def format_value(val: Union[int, float, str]) -> str:
    """格式化不同类型的值"""
    return f"[{type(val).__name__}] {val}"

print(f"format_value(42) = '{format_value(42)}'")
print(f"format_value(3.14) = '{format_value(3.14)}'")
print(f"format_value('hello') = '{format_value('hello')}'")

print()
print("=" * 50)
print("  类型转换与类型提示讲解完毕！")
print("=" * 50)`
  }
];