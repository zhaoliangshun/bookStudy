// =============================================================
// Python 交互式教程 —— 第五批章节（基础深化组，共 6 章）
// -------------------------------------------------------------
// 本文件包含以下章节（group 统一为"基础深化"）：
//   1. py-numbers              — 数字与数学进阶
//   2. py-strings-advanced     — 字符串高级处理
//   3. py-bytes-encoding       — 字节与编码
//   4. py-datetime             — 时间日期处理
//   5. py-collections-advanced — 高级容器
//   6. py-itertools            — itertools 迭代器工具实战
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（本批为"基础深化"）
//   content : Markdown 格式的详细讲解（文字量大，含大量 demo）
//   code    : 可运行、带详细中文注释的 Python 示例代码
//
// 代码运行环境约束：
//   - 用 python3 直接运行，仅使用 Python 标准库
//   - 通过 print 输出结果
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：数字与数学进阶
  // =========================================================
  {
    id: "py-numbers",
    group: "基础深化",
    icon: "🔢",
    title: "数字与数学进阶",
    content: `## 数字与数学进阶

数字是编程中最基础的数据类型之一。在前面"变量与数据类型"一章中，我们已经认识了 \`int\`、\`float\`、\`complex\`、\`bool\` 等基本数字类型。但 Python 在数字处理方面远不止于此——它拥有**任意精度整数**、**高精度十进制运算**、**分数运算**、**丰富的数学函数库**、**统计函数库**、**复数运算库**，以及灵活的**位运算**和**随机数生成**能力。

本章将带你深入 Python 数字与数学的方方面面，理解浮点数精度陷阱的根源，掌握高精度运算的技巧，熟练使用 \`math\`、\`statistics\`、\`cmath\`、\`random\` 等标准库，并能用位运算解决实际问题。

---

## 一、int 整数：无限精度原理

### 1.1 Python 整数为什么不会溢出

在 C、Java 等语言中，整数通常有固定的大小（如 32 位、64 位），一旦超过最大值就会**溢出**（overflow），得到错误的结果甚至负数。例如在 C 语言中：

\`\`\`c
// C 语言中 int 通常是 32 位，最大值约 21 亿
int x = 2147483647;   // INT_MAX
int y = x + 1;        // 溢出！y 变成 -2147483648
\`\`\`

而 Python 的 \`int\` **没有大小上限**（仅受内存限制），可以表示任意大的整数：

\`\`\`python
>>> 2 ** 100
1267650600228229401496703205376
>>> 2 ** 1000
1071508607186267320948425049060001810561404811705533607443750388370351051124936
1224931983788156958581275946729175531468251871452856923140435984577574698574803
9345677748242309854210746050623711418779541821530464749835819412673987675591655
43946077062914571196477686542167660429831652624386837205668069376
>>> 10 ** 50   # 10 的 50 次方，50 位的整数
100000000000000000000000000000000000000000000000000
\`\`\`

### 1.2 实现原理：变长整数

Python 的整数在底层并不是固定 32/64 位，而是采用**变长数组**来存储数字。CPython 的 \`int\` 对象内部用一个 \`digit\` 数组（每个元素通常是 30 位）来表示任意大的数。当数字较小时只用一个 \`digit\`，数字很大时自动扩展数组长度。

这意味着：
- **没有溢出风险**：只要内存够，整数可以无限大。
- **大整数运算较慢**：因为需要动态分配内存并逐位运算，不像固定大小整数那样单条 CPU 指令就能完成。
- **小整数有缓存**：CPython 会缓存 \`-5\` 到 \`256\` 之间的小整数对象，避免频繁创建。

\`\`\`python
# 小整数缓存：-5 到 256 是同一个对象
a = 100                            # 将整数 100 赋给 a
b = 100                            # 将整数 100 赋给 b
print(a is b)   # True，小整数缓存

c = 1000                           # 将整数 1000 赋给 c
d = 1000                           # 将整数 1000 赋给 d
print(c is d)   # False（通常情况），超出缓存范围
\`\`\`

### 1.3 整数的多种进制表示

Python 支持四种进制的整数字面量：

| 进制 | 前缀 | 字符 | 示例 | 十进制值 |
| --- | --- | --- | --- | --- |
| 二进制 | \`0b\` 或 \`0B\` | 0-1 | \`0b1010\` | 10 |
| 八进制 | \`0o\` 或 \`0O\` | 0-7 | \`0o12\` | 10 |
| 十进制 | 无 | 0-9 | \`10\` | 10 |
| 十六进制 | \`0x\` 或 \`0X\` | 0-9, a-f | \`0xa\` | 10 |

可以用 \`bin()\`、\`oct()\`、\`hex()\` 函数把整数转换成对应进制的字符串：

\`\`\`python
>>> bin(10)    # '0b1010'
>>> oct(10)    # '0o12'
>>> hex(255)   # '0xff'
>>> int('ff', 16)   # 255，把字符串按指定进制解析
>>> int('1010', 2)  # 10
\`\`\`

### 1.4 下划线分隔大数字

Python 3.6+ 允许在数字字面量中用下划线 \`_\` 作为分隔符，提升可读性：

\`\`\`python
population = 1_400_000_000      # 14 亿
bytes_size = 0xFF_FF_FF_FF      # 16 进制也可用
binary_mask = 0b1010_1010_1010  # 二进制也可用
print(population)   # 1400000000
\`\`\`

下划线可以出现在任意位置，但**不能连续出现两个**，也**不能开头或结尾**。

---

## 二、float 浮点数：精度陷阱

### 2.1 经典的 0.1 + 0.2 问题

\`\`\`python
>>> 0.1 + 0.2
0.30000000000000004
>>> 0.1 + 0.2 == 0.3
False
\`\`\`

这是几乎所有编程语言都会遇到的问题（JavaScript、Java、C 都一样），根源在于**浮点数采用 IEEE 754 双精度标准**，用二进制无法精确表示十进制的小数（如 0.1）。

### 2.2 IEEE 754 双精度浮点数

Python 的 \`float\` 内部是 **64 位双精度浮点数**（C 语言的 \`double\`），结构如下：

- **1 位符号位**（sign）：0 正 1 负
- **11 位指数位**（exponent）：偏移 1023
- **52 位尾数位**（mantissa/significand）：有效数字

它能精确表示的十进制有效数字约为 **15-17 位**，取值范围约为 ±1.8 × 10^308，最小正数约为 5 × 10^-324。

### 2.3 为什么 0.1 无法精确表示

十进制的 0.1 转换成二进制是无限循环小数：

\`\`\`
0.1 (十进制) = 0.0001100110011001100110011... (二进制，循环)
\`\`\`

由于尾数只有 52 位，必须截断，导致存储的值比真正的 0.1 略大一点点。两个略大的数相加，误差累积，就出现了 \`0.30000000000000004\`。

### 2.4 浮点数比较的正确做法

由于精度问题，**永远不要用 \`==\` 直接比较两个浮点数**，而应该用"差值小于一个很小的数（epsilon）"：

\`\`\`python
import math                        # 导入 math 模块

def almost_equal(a, b, eps=1e-9):  # 定义函数 almost_equal，参数：a, b, eps=1e-9
    return abs(a - b) < eps        # 返回 abs(a - b) < eps

print(almost_equal(0.1 + 0.2, 0.3))           # True
print(math.isclose(0.1 + 0.2, 0.3))           # True，标准库方法
print(math.isclose(0.1 + 0.2, 0.3, rel_tol=1e-9))  # 输出 math.isclose(0.1 + 0.2, 0.3, rel_tol=1e-9)
\`\`\`

\`math.isclose(a, b, rel_tol=1e-9, abs_tol=0.0)\` 是 Python 3.5+ 提供的官方浮点数比较函数：
- \`rel_tol\`：相对容差（默认 1e-9），适合比较数量级较大的数
- \`abs_tol\`：绝对容差（默认 0.0），适合比较接近 0 的数

### 2.5 浮点数的特殊值

\`\`\`python
>>> float('inf')      # 正无穷
inf
>>> float('-inf')     # 负无穷
-inf
>>> float('nan')      # 非数字（Not a Number）
nan
>>> float('inf') > 1e308
True
>>> float('nan') == float('nan')   # NaN 不等于自身！
False
>>> math.isnan(float('nan'))       # 用 math.isnan 判断
True
>>> math.isinf(float('inf'))       # 用 math.isinf 判断
True
\`\`\`

NaN 的一个重要特性是**不等于任何值（包括自身）**，所以判断 NaN 不能用 \`==\`，必须用 \`math.isnan()\`。

### 2.6 浮点数的精度损失示例

\`\`\`python
# 大数加小数：精度丢失
big = 1e16                         # 将 1e16 赋给 big
small = 1.0                        # 将浮点数 1.0 赋给 small
print(big + small == big)   # True！small 被吞掉了
print(big + small - big)    # 0.0，不是 1.0

# 累加误差
total = 0.0                        # 将浮点数 0.0 赋给 total
for _ in range(10):                # 遍历 range(10)，每次取值赋给 _
    total += 0.1                   # total 加 0.1
print(total)                # 0.9999999999999999，不是 1.0
\`\`\`

---

## 三、decimal 模块：高精度十进制运算

### 3.1 为什么需要 decimal

当涉及**金额计算、财务、科学测量**等场景时，浮点数的精度误差是不可接受的。比如银行系统算利息，0.1 元 + 0.2 元必须精确等于 0.3 元。\`decimal\` 模块提供了**十进制高精度运算**，用十进制的方式存储和计算，避免二进制浮点数的精度问题。

\`\`\`python
>>> from decimal import Decimal
>>> Decimal('0.1') + Decimal('0.2')
Decimal('0.3')                     # 调用 Decimal，参数 '0.3'
>>> Decimal('0.1') + Decimal('0.2') == Decimal('0.3')
True
\`\`\`

注意：**一定要用字符串构造 \`Decimal\`**，不要用浮点数。如果用 \`Decimal(0.1)\`，会先把 0.1 转成不精确的浮点数，再转成 Decimal，精度已经丢了：

\`\`\`python
>>> Decimal(0.1)         # 错误！先转 float 再转 Decimal，已带误差
Decimal('0.1000000000000000055511151231257827021181583404541015625')  # 调用 Decimal，参数 '0.1000000000000000055511151231257827021181583404541015625'
>>> Decimal('0.1')       # 正确！用字符串
Decimal('0.1')                     # 调用 Decimal，参数 '0.1'
\`\`\`

### 3.2 设置精度和舍入模式

\`\`\`python
from decimal import Decimal, getcontext, ROUND_HALF_UP  # 从 decimal 导入 Decimal, getcontext, ROUND_HALF_UP

getcontext().prec = 6          # 设置全局精度（有效数字位数）
getcontext().rounding = ROUND_HALF_UP   # 四舍五入

print(Decimal('1') / Decimal('3'))    # 0.333333（6 位有效数字）
print(Decimal('2.675').quantize(Decimal('0.01')))  # 2.68
\`\`\`

常用舍入模式：

| 常量 | 含义 |
| --- | --- |
| \`ROUND_HALF_UP\` | 四舍五入（最常用） |
| \`ROUND_HALF_EVEN\` | 银行家舍入（默认，向最近偶数舍入） |
| \`ROUND_DOWN\` | 向零舍入（截断） |
| \`ROUND_UP\` | 远离零舍入 |
| \`ROUND_CEILING\` | 向正无穷舍入 |
| \`ROUND_FLOOR\` | 向负无穷舍入 |

### 3.3 decimal 的应用场景

- **财务计算**：金额必须精确
- **税率计算**：百分比运算不能丢精度
- **科学计量**：需要可控的有效数字

\`\`\`python
from decimal import Decimal, ROUND_HALF_UP  # 从 decimal 导入 Decimal, ROUND_HALF_UP

# 计算商品含税价
price = Decimal('99.95')           # 将 Decimal('99.95') 赋给 price
tax_rate = Decimal('0.08')   # 8% 税率
tax = (price * tax_rate).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)  # 创建元组并赋给 tax
total = price + tax                # 将 price + tax 赋给 total
print(f"税前: {price}, 税: {tax}, 合计: {total}")  # 输出 f"税前: {price}, 税: {tax}, 合计: {total}"
# 税前: 99.95, 税: 8.00, 合计: 107.95
\`\`\`

---

## 四、fractions 模块：分数运算

\`fractions.Fraction\` 用**有理数（分子/分母）**的形式精确表示数字，运算过程不会丢失精度，适合需要精确分数运算的场景（如数学教学、概率计算）。

\`\`\`python
from fractions import Fraction     # 从 fractions 导入 Fraction

a = Fraction(1, 3)      # 1/3
b = Fraction(2, 3)      # 2/3
print(a + b)            # 1（自动约分）
print(a * b)            # 2/9
print(Fraction(3, 6))   # 1/2（自动约分）
print(Fraction('1.5'))  # 3/2（支持字符串）
print(Fraction(1, 3) + Fraction(1, 6))   # 1/2
\`\`\`

Fraction 会自动**约分到最简形式**，分母为负时会自动把负号移到分子。它还可以和 \`Decimal\`、\`float\`、\`int\` 混合运算。

\`\`\`python
from fractions import Fraction     # 从 fractions 导入 Fraction
import math                        # 导入 math 模块

# 用 Fraction 精确表示圆周率的近似分数
pi_approx = Fraction(355, 113)     # 将 Fraction(355, 113) 赋给 pi_approx
print(pi_approx)              # 355/113
print(float(pi_approx))       # 3.1415929203539825
print(pi_approx - Fraction(math.pi).limit_denominator(1000))  # 输出 pi_approx - Fraction(math.pi).limit_denominator(1000)
\`\`\`

---

## 五、math 模块：数学函数库

\`math\` 模块提供了丰富的数学函数和常量，所有函数都基于 C 标准库的 math.h 实现，速度很快。下面分类介绍。

### 5.1 数学常量

| 常量 | 值 | 说明 |
| --- | --- | --- |
| \`math.pi\` | 3.141592653589793 | 圆周率 π |
| \`math.e\` | 2.718281828459045 | 自然常数 e |
| \`math.tau\` | 6.283185307179586 | 2π（Python 3.6+） |
| \`math.inf\` | inf | 正无穷 |
| \`math.nan\` | nan | 非数字 |

### 5.2 取整函数

| 函数 | 说明 | 示例 |
| --- | --- | --- |
| \`math.ceil(x)\` | 向上取整 | \`ceil(2.3)\` → 3 |
| \`math.floor(x)\` | 向下取整 | \`floor(2.7)\` → 2 |
| \`math.trunc(x)\` | 向零取整（截断） | \`trunc(-2.7)\` → -2 |

注意 \`math.ceil\` 和 \`math.floor\` 与 \`int()\` 的区别：

\`\`\`python
>>> int(-2.7)      # 向零取整 → -2
>>> math.trunc(-2.7)  # 向零取整 → -2
>>> math.floor(-2.7)  # 向负无穷取整 → -3
>>> math.ceil(-2.7)   # 向正无穷取整 → -2
\`\`\`

### 5.3 幂与对数

| 函数 | 说明 |
| --- | --- |
| \`math.pow(x, y)\` | x 的 y 次方（返回 float） |
| \`math.sqrt(x)\` | 平方根 |
| \`math.cbrt(x)\` | 立方根（Python 3.11+） |
| \`math.exp(x)\` | e 的 x 次方 |
| \`math.log(x)\` | 自然对数 ln(x) |
| \`math.log10(x)\` | 以 10 为底的对数 |
| \`math.log2(x)\` | 以 2 为底的对数 |
| \`math.log(x, base)\` | 任意底对数 |

\`\`\`python
>>> math.sqrt(144)      # 12.0
>>> math.pow(2, 10)     # 1024.0
>>> math.exp(1)         # 2.718281828459045
>>> math.log(math.e)    # 1.0
>>> math.log10(1000)    # 3.0
>>> math.log2(8)        # 3.0
\`\`\`

### 5.4 阶乘与组合数

| 函数 | 说明 |
| --- | --- |
| \`math.factorial(n)\` | n 的阶乘 n! |
| \`math.comb(n, k)\` | 组合数 C(n,k)（Python 3.8+） |
| \`math.perm(n, k)\` | 排列数 A(n,k)（Python 3.8+） |

\`\`\`python
>>> math.factorial(5)        # 120
>>> math.comb(5, 2)          # 10，从 5 个中选 2 个
>>> math.perm(5, 2)          # 20，从 5 个中选 2 个排列
\`\`\`

### 5.5 最大公约数与最小公倍数

| 函数 | 说明 |
| --- | --- |
| \`math.gcd(a, b)\` | 最大公约数 |
| \`math.lcm(a, b)\` | 最小公倍数（Python 3.9+） |

\`\`\`python
>>> math.gcd(12, 18)    # 6
>>> math.lcm(4, 6)      # 12
>>> math.gcd(12, 18, 24)  # 6，支持多参数（Python 3.9+）
\`\`\`

### 5.6 三角函数

\`\`\`python
>>> math.sin(math.pi / 2)    # 1.0
>>> math.cos(0)              # 1.0
>>> math.tan(math.pi / 4)    # 0.9999999999999999
>>> math.degrees(math.pi)    # 180.0，弧度转角度
>>> math.radians(180)        # 3.141592653589793，角度转弧度
>>> math.asin(1)             # 1.5707963267948966（π/2）
\`\`\`

注意：\`math\` 模块的三角函数**参数和返回值都是弧度**，不是角度。用 \`math.degrees()\` 和 \`math.radians()\` 互转。

### 5.7 双曲函数与特殊函数

\`\`\`python
>>> math.sinh(0)    # 0.0，双曲正弦
>>> math.cosh(0)    # 1.0，双曲余弦
>>> math.tanh(0)    # 0.0，双曲正切
>>> math.erf(1)     # 0.8427007929497149，误差函数
>>> math.gamma(5)   # 24.0，伽马函数 Γ(5) = 4!
>>> math.lgamma(5)  # 3.1780538303479458，ln(Γ(5))
\`\`\`

### 5.8 符号、绝对值与辅助函数

| 函数 | 说明 |
| --- | --- |
| \`math.fabs(x)\` | 绝对值（返回 float） |
| \`math.copysign(x, y)\` | 把 y 的符号复制给 x |
| \`math.fmod(x, y)\` | 浮点取余（与 % 不同） |
| \`math.modf(x)\` | 返回小数部分和整数部分 |
| \`math.frexp(x)\` | 返回尾数和指数 |
| \`math.ldexp(m, e)\` | m × 2^e |
| \`math.fsum(iterable)\` | 精确浮点求和（避免误差累积） |

\`\`\`python
# fsum 避免累加误差
print(sum([0.1] * 10))        # 0.9999999999999999
print(math.fsum([0.1] * 10))  # 1.0
\`\`\`

---

## 六、statistics 模块：统计函数

Python 3.4+ 内置了 \`statistics\` 模块，提供常用的统计函数，无需安装 numpy/pandas 即可做基础统计。

### 6.1 集中趋势（平均值）

| 函数 | 说明 |
| --- | --- |
| \`statistics.mean(data)\` | 算术平均数 |
| \`statistics.median(data)\` | 中位数 |
| \`statistics.median_low(data)\` | 中位数（偶数个时取较小） |
| \`statistics.median_high(data)\` | 中位数（偶数个时取较大） |
| \`statistics.median_grouped(data)\` | 分组中位数 |
| \`statistics.mode(data)\` | 众数（返回第一个最频繁值） |
| \`statistics.multimode(data)\` | 所有众数（Python 3.8+） |
| \`statistics.harmonic_mean(data)\` | 调和平均数 |
| \`statistics.geometric_mean(data)\` | 几何平均数（Python 3.8+） |

\`\`\`python
import statistics as st            # 导入 statistics 模块并取别名 st

data = [1, 2, 2, 3, 4, 5, 5, 5, 6] # 创建列表并赋给 data
print(st.mean(data))           # 3.666...
print(st.median(data))         # 4
print(st.mode(data))           # 5
print(st.multimode([1, 1, 2, 2, 3]))  # [1, 2]
print(st.harmonic_mean([1, 2, 4]))    # 1.714...
print(st.geometric_mean([1, 2, 4]))   # 2.0
\`\`\`

### 6.2 离散程度（方差与标准差）

| 函数 | 说明 |
| --- | --- |
| \`statistics.pvariance(data)\` | 总体方差 |
| \`statistics.pstdev(data)\` | 总体标准差 |
| \`statistics.variance(data)\` | 样本方差（除以 n-1） |
| \`statistics.stdev(data)\` | 样本标准差 |

\`\`\`python
import statistics as st            # 导入 statistics 模块并取别名 st
data = [2, 4, 4, 4, 5, 5, 7, 9]    # 创建列表并赋给 data
print(st.pvariance(data))   # 4.0（总体方差）
print(st.pstdev(data))      # 2.0（总体标准差）
print(st.variance(data))    # 4.571...（样本方差，n-1）
print(st.stdev(data))       # 2.138...（样本标准差）
\`\`\`

**总体方差**除以 n，**样本方差**除以 n-1（贝塞尔校正）。当数据是全部总体时用 \`pvariance\`，是从总体中抽样的样本时用 \`variance\`。

### 6.3 分位数

\`\`\`python
import statistics as st            # 导入 statistics 模块并取别名 st
data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]  # 创建列表并赋给 data
print(st.quantiles(data, n=4))   # 四分位数 [2.75, 5.5, 8.25]
print(st.quantiles(data, n=10))  # 十分位数
\`\`\`

---

## 七、cmath 模块：复数运算

Python 内置了 \`complex\` 类型（如 \`3+4j\`），\`cmath\` 模块提供了针对复数的数学函数。

\`\`\`python
import cmath                       # 导入 cmath 模块

z = 3 + 4j                         # 将 3 + 4j 赋给 z
print(abs(z))           # 5.0，模长
print(z.real)           # 3.0，实部
print(z.imag)           # 4.0，虚部
print(z.conjugate())    # (3-4j)，共轭复数

# cmath 函数
print(cmath.sqrt(-1))   # 1j，复数平方根（math.sqrt 会报错）
print(cmath.phase(z))   # 0.927...，幅角（弧度）
print(cmath.polar(z))   # (5.0, 0.927...)，极坐标（模长，幅角）
print(cmath.rect(5, cmath.pi/2))  # 复数直角坐标
print(cmath.exp(1j * cmath.pi))   # (-1+1.2246e-16j) ≈ -1（欧拉公式）
\`\`\`

\`math\` 模块不支持负数开方（会抛 \`ValueError\`），而 \`cmath\` 可以。欧拉公式 \`e^(iπ) + 1 = 0\` 用 \`cmath.exp(1j * cmath.pi)\` 可以验证（结果约等于 -1）。

---

## 八、round 与银行家舍入

### 8.1 Python 的 round 行为

\`\`\`python
>>> round(2.5)    # 2，不是 3！
>>> round(3.5)    # 4
>>> round(0.5)    # 0
>>> round(1.5)    # 2
\`\`\`

很多人会惊讶 \`round(2.5)\` 居然是 2 而不是 3。这是因为 Python 的 \`round\` 采用**银行家舍入（round half to even）**，也叫"四舍六入五成双"：当小数部分正好是 0.5 时，向**最近的偶数**舍入。

### 8.2 为什么用银行家舍入

传统的"四舍五入"在大量数据求和时会引入**系统性偏差**（所有 0.5 都向上，导致和偏大）。银行家舍入让 0.5 一半向上一半向下，长期来看偏差更小，在金融、统计领域更常用。

### 8.3 round 的精度问题

\`\`\`python
>>> round(2.675, 2)   # 2.67，不是 2.68！
\`\`\`

这是因为 2.675 在浮点数中实际存储的是略小于 2.675 的值，所以 round 到 2 位小数时变成了 2.67。如果需要精确的十进制舍入，用 \`decimal\` 模块：

\`\`\`python
from decimal import Decimal, ROUND_HALF_UP  # 从 decimal 导入 Decimal, ROUND_HALF_UP
print(Decimal('2.675').quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))  # 2.68
\`\`\`

### 8.4 保留小数位的常见做法

\`\`\`python
x = 3.14159265                     # 将浮点数 3.14159265 赋给 x
print(round(x, 2))          # 3.14，返回 float
print(f"{x:.2f}")           # '3.14'，返回字符串
print(format(x, '.2f'))     # '3.14'，返回字符串
print("%.2f" % x)           # '3.14'，旧式格式化
\`\`\`

注意 \`round(x, 2)\` 返回的是浮点数，而格式化方法返回的是字符串。在显示金额时通常用字符串格式化。

---

## 九、位运算实战

### 9.1 位运算符

| 运算符 | 名称 | 说明 |
| --- | --- | --- |
| \`&\` | 按位与 | 两个都为 1 才为 1 |
| \`|\` | 按位或 | 有一个为 1 就为 1 |
| \`^\` | 按位异或 | 不同为 1，相同为 0 |
| \`~\` | 按位取反 | 0 变 1，1 变 0 |
| \`<<\` | 左移 | 各位左移，低位补 0 |
| \`>>\` | 右移 | 各位右移，高位补符号位 |

\`\`\`python
>>> bin(0b1100 & 0b1010)   # 0b1000
>>> bin(0b1100 | 0b1010)   # 0b1110
>>> bin(0b1100 ^ 0b1010)   # 0b0110
>>> ~5                      # -6（取反 = -(x+1)）
>>> 1 << 4                  # 16，等价于 2^4
>>> 256 >> 2                # 64
\`\`\`

### 9.2 位运算的常见应用

**1. 判断奇偶**：\`x & 1\` 为 0 是偶数，为 1 是奇数，比 \`x % 2\` 快。

**2. 交换两个数**（不用临时变量）：

\`\`\`python
a, b = 5, 9
a ^= b                             # a ^= b
b ^= a                             # b ^= a
a ^= b                             # a ^= b
# 现在 a=9, b=5
\`\`\`

**3. 权限标志位**：用一个整数表示多个开关。

\`\`\`python
READ = 0b001    # 1
WRITE = 0b010   # 2
EXEC = 0b100    # 4

perm = READ | WRITE       # 3，拥有读和写
print(perm & READ)        # 1，有读权限
print(perm & EXEC)        # 0，无执行权限
perm |= EXEC              # 加上执行权限
perm &= ~WRITE            # 移除写权限
\`\`\`

**4. 快速乘除 2 的幂**：\`x << n\` 等价于 \`x * 2^n\`，\`x >> n\` 等价于 \`x // 2^n\`。

**5. 取低位**：\`x & 0xFF\` 取最低 8 位，\`x & 0xFFFF\` 取最低 16 位。

### 9.3 位长度与位计数

\`\`\`python
>>> (42).bit_length()   # 6，42 = 0b101010，需要 6 位
>>> bin(42)             # '0b101010'
>>> (42).bit_count()    # 3，二进制中 1 的个数（Python 3.10+）
\`\`\`

---

## 十、random 模块：随机数深入

### 10.1 随机数与种子

计算机生成的是**伪随机数**，由确定性算法产生。给定相同的**种子（seed）**，生成的随机数序列完全相同——这对调试和复现实验结果非常重要。

\`\`\`python
import random                      # 导入 random 模块

random.seed(42)        # 设置种子
print(random.random()) # 每次运行都一样（如果种子相同）
\`\`\`

不设置种子时，random 默认用系统时间或操作系统随机源作为种子。

### 10.2 常用函数分类

| 函数 | 说明 |
| --- | --- |
| \`random.random()\` | 返回 [0.0, 1.0) 的随机浮点数 |
| \`random.uniform(a, b)\` | 返回 [a, b] 之间的随机浮点数 |
| \`random.randint(a, b)\` | 返回 [a, b] 之间的随机整数（含两端） |
| \`random.randrange(start, stop, step)\` | 从 range 中随机选一个 |
| \`random.choice(seq)\` | 从序列中随机选一个元素 |
| \`random.choices(seq, k=n)\` | 有放回地选 n 个（Python 3.6+） |
| \`random.sample(seq, k)\` | 无放回地选 k 个（不重复） |
| \`random.shuffle(seq)\` | 原地打乱序列 |
| \`random.getrandbits(k)\` | 返回 k 位随机整数 |

\`\`\`python
import random                      # 导入 random 模块

print(random.randint(1, 100))       # 1-100 的整数
print(random.choice(['石头', '剪刀', '布']))  # 随机选一个
print(random.sample(range(1, 50), 6))  # 双色球选号（不重复）
lst = [1, 2, 3, 4, 5]              # 创建列表并赋给 lst
random.shuffle(lst)                 # 原地打乱
print(lst)                         # 输出 lst
\`\`\`

### 10.3 加权随机

\`random.choices\` 支持权重：

\`\`\`python
import random                      # 导入 random 模块
# 抽奖：一等奖权重 1，二等奖 5，三等奖 20，谢谢参与 74
result = random.choices(           # 将 random.choices( 赋给 result
    ['一等奖', '二等奖', '三等奖', '谢谢参与'],
    weights=[1, 5, 20, 74],        # 将 [1, 5, 20, 74], 赋给 weights
    k=10   # 抽 10 次（有放回）
)
print(result)                      # 输出 result
\`\`\`

### 10.4 随机分布

\`random\` 模块还提供各种概率分布的随机数：

| 函数 | 分布 |
| --- | --- |
| \`random.gauss(mu, sigma)\` | 高斯（正态）分布 |
| \`random.normalvariate(mu, sigma)\` | 正态分布（线程安全版） |
| \`random.expovariate(lambd)\` | 指数分布 |
| \`random.betavariate(alpha, beta)\` | 贝塔分布 |
| \`random.gammavariate(alpha, beta)\` | 伽马分布 |
| \`random.uniform(a, b)\` | 均匀分布 |

\`\`\`python
import random                      # 导入 random 模块
# 模拟 1000 个正态分布的身高数据（均值 170，标准差 6）
heights = [random.gauss(170, 6) for _ in range(1000)]  # 创建列表并赋给 heights
print(sum(heights) / len(heights))  # 约 170
\`\`\`

### 10.5 安全随机数

\`random\` 模块是**伪随机**，不适合用于密码学、token 生成等安全场景。安全场景应该用 \`secrets\` 模块：

\`\`\`python
import secrets                     # 导入 secrets 模块
token = secrets.token_hex(16)         # 32 位十六进制 token
print(token)                       # 输出 token
print(secrets.choice(range(1000000, 9999999)))  # 安全的随机选择
\`\`\`

---

## 十一、布尔类型与数值的关系

### 11.1 bool 是 int 的子类

Python 中 \`bool\` 是 \`int\` 的子类，\`True\` 等于 1，\`False\` 等于 0。这意味着布尔值可以参与算术运算：

\`\`\`python
>>> True + True       # 2
>>> True * 5          # 5
>>> False + 0         # 0
>>> sum([True, False, True, True])   # 3，统计 True 的个数
>>> isinstance(True, int)   # True，bool 是 int 子类
\`\`\`

这个特性在统计"满足条件的元素个数"时非常方便：

\`\`\`python
nums = [1, 2, 3, 4, 5, 6]          # 创建列表并赋给 nums
# 统计偶数的个数
count = sum(n % 2 == 0 for n in nums)   # 3
\`\`\`

### 11.2 真值测试

任何对象都能进行真值测试。以下值在 \`if\` 中被视为 \`False\`（称为"假值"）：

| 类型 | 假值 |
| --- | --- |
| 数字 | \`0\`、\`0.0\`、\`0j\`、\`Decimal(0)\`、\`Fraction(0,1)\` |
| 序列/集合 | 空的 \`''\`、\`[]\`、\`()\`、\`set()\`、\`range(0)\` |
| 映射 | 空的 \`{}\` |
| 特殊 | \`None\`、\`False\` |

其他所有值都是真值。\`bool(x)\` 会按上述规则转换。

\`\`\`python
>>> bool(0)        # False
>>> bool(0.0)      # False
>>> bool('')       # False
>>> bool([])       # False
>>> bool(' ')      # True，空格不是空字符串
>>> bool(0.0001)   # True
>>> bool([0])      # True，含一个 0 的列表非空
\`\`\`

**坑点**：判断列表是否为空时，应该用 \`if not lst:\` 而不是 \`if len(lst) == 0:\`，前者更 Pythonic 且更快。

---

## 十二、数值类型转换

### 12.1 显式转换函数

| 函数 | 转换为 | 说明 |
| --- | --- | --- |
| \`int(x)\` | int | 浮点向零取整；字符串可指定进制 |
| \`float(x)\` | float | 整数转浮点；字符串解析 |
| \`complex(x)\` 或 \`complex(a, b)\` | complex | 转复数 |
| \`round(x, n)\` | float/int | 四舍五入到 n 位 |
| \`bool(x)\` | bool | 真值转换 |

\`\`\`python
>>> int(3.9)           # 3，向零取整（不是四舍五入）
>>> int(-3.9)          # -3
>>> int('42')          # 42
>>> int('0xff', 16)    # 255
>>> float('3.14')      # 3.14
>>> float(5)           # 5.0
>>> complex(3, 4)      # (3+4j)
>>> round(3.14159, 2)  # 3.14
\`\`\`

### 12.2 隐式转换规则

Python 在混合类型运算时会**自动向更宽的类型转换**（数值塔）：

\`\`\`python
>>> 1 + 2.0       # 3.0，int + float → float
>>> 2 + 3j        # (2+3j)，int + complex → complex
>>> True + 1      # 2，bool + int → int
\`\`\`

转换方向：\`bool\` → \`int\` → \`float\` → \`complex\`，运算结果总是"更宽"的那个类型。注意 \`int\` 和 \`float\` 运算结果一定是 \`float\`，不会自动升级为 \`Decimal\` 或 \`Fraction\`。

### 12.3 转换的精度损失

\`\`\`python
# 大整数转 float 会丢精度
big = 2 ** 60                      # 将 2 ** 60 赋给 big
print(big)              # 1152921504606846976
print(float(big))       # 1.152921504606947e+18
print(int(float(big)))  # 1152921504606846976（这里恰好没丢）

# float 转 int 是截断，不是四舍五入
print(int(3.99))        # 3
\`\`\`

---

## 十三、numbers 模块：数值抽象基类

Python 的 \`numbers\` 模块定义了"数值塔"（numeric tower）的抽象基类层次：

\`\`\`
Number
  ├── Complex        （复数）
  │     └── Real     （实数）
  │           └── Rational   （有理数）
  │                 └── Integral  （整数）
  └── (其他注册类型)
\`\`\`

\`\`\`python
from numbers import Number, Complex, Real, Rational, Integral  # 从 numbers 导入 Number, Complex, Real, Rational, Integral
import fractions, decimal

print(isinstance(3, Integral))           # True
print(isinstance(3.14, Real))            # True
print(isinstance(3.14, Rational))        # False，float 不是有理数
print(isinstance(fractions.Fraction(1,2), Rational))  # True
print(isinstance(decimal.Decimal('1.5'), Number))     # True
\`\`\`

这个模块主要用于**类型检查**（当你写一个函数希望接受"任何数字类型"时，用 \`isinstance(x, Number)\` 而不是逐一判断 int/float/complex）。

---

## 十四、实用技巧与常见陷阱

### 14.1 判断一个数是不是整数

\`\`\`python
x = 4.0                            # 将浮点数 4.0 赋给 x
print(x.is_integer())      # True，float 的方法
print(isinstance(x, int))  # False，x 是 float 不是 int
\`\`\`

### 14.2 整除和取余的细节

\`\`\`python
# Python 的 // 和 % 结果符号跟随除数
print(-7 // 2)    # -4（向负无穷取整）
print(-7 % 2)     # 1（结果与除数同号）
print(7 // -2)    # -4
print(7 % -2)     # -1
\`\`\`

这与 C/Java 不同（C 中 -7/2 = -3，-7%2 = -1）。Python 的 \`%\` 结果总是与除数同号，这在很多算法（如计算环形缓冲区下标）时更方便。

### 14.3 divmod 同时取商和余

\`\`\`python
>>> divmod(17, 5)    # (3, 2)，商 3 余 2
>>> quotient, remainder = divmod(17, 5)
\`\`\`

### 14.4 链式比较

Python 支持数学风格的链式比较：

\`\`\`python
>>> 1 < 2 < 3      # True，等价于 1 < 2 and 2 < 3
>>> 1 < 2 > 0      # True
>>> 5 > 3 > 1      # True
\`\`\`

### 14.5 海象运算符与数值

\`\`\`python
# 在 while 中计算并赋值
import math                        # 导入 math 模块
n = 2                              # 将整数 2 赋给 n
while (n := n - 1) > 0:            # 当 (n := n - 1) > 0 为真时重复执行
    print(n)                       # 输出 n
\`\`\`

### 14.6 大数运算性能

\`\`\`python
import math                        # 导入 math 模块
# 计算大数阶乘
big_fact = math.factorial(100)     # 将 math.factorial(100) 赋给 big_fact
print(len(str(big_fact)), "位数")    # 输出 len(str(big_fact)), "位数"
\`\`\`

### 14.7 用 // 替代 int(a/b)

\`\`\`python
# 推荐用 // 而不是 int(a/b)
print(7 // 2)        # 3，直接整数除法
print(int(7 / 2))    # 3，但先算浮点再截断，大数会丢精度
print(int(10**20 / 3))  # 33333333333333331712（丢精度）
print(10**20 // 3)      # 33333333333333333333（精确）
\`\`\`

---

## 十五、random 模块进阶

### 15.1 随机种子与可复现性

\`\`\`python
import random                      # 导入 random 模块
random.seed(0)                     # 对 random 调用 seed 方法，参数 0
seq1 = [random.random() for _ in range(3)]  # 创建列表并赋给 seq1
random.seed(0)                     # 对 random 调用 seed 方法，参数 0
seq2 = [random.random() for _ in range(3)]  # 创建列表并赋给 seq2
print(seq1 == seq2)   # True，相同种子产生相同序列
\`\`\`

### 15.2 随机状态保存与恢复

\`\`\`python
state = random.getstate()   # 保存当前状态
r1 = random.random()               # 将 random.random() 赋给 r1
random.setstate(state)      # 恢复状态
r2 = random.random()               # 将 random.random() 赋给 r2
print(r1 == r2)   # True
\`\`\`

### 15.3 sample 与 choices 的区别

| 特性 | \`random.sample\` | \`random.choices\` |
| --- | --- | --- |
| 是否放回 | 不放回（无重复） | 有放回（可重复） |
| k 限制 | k ≤ 序列长度 | k 任意 |
| 权重 | 不支持 | 支持 weights/cum_weights |

\`\`\`python
import random                      # 导入 random 模块
# sample：从 52 张扑克中发 5 张（不重复）
hand = random.sample(range(52), 5) # 将 random.sample(range(52), 5) 赋给 hand
# choices：掷骰子 10 次（可重复）
rolls = random.choices(range(1, 7), k=10)  # 将 random.choices(range(1, 7), k=10) 赋给 rolls
\`\`\`

### 15.4 自定义随机范围

\`\`\`python
# randrange 的步长用法
print(random.randrange(0, 100, 2))   # 0-100 的偶数
print(random.randrange(0, 100, 5))   # 0-100 的 5 的倍数
\`\`\`

---

## 十六、总结对比表

### 数值类型对比

| 类型 | 精度 | 范围 | 典型场景 |
| --- | --- | --- | --- |
| \`int\` | 任意精度 | 仅受内存限制 | 整数运算、大数计算 |
| \`float\` | 约 15-17 位有效数字 | ±1.8e308 | 科学计算（容忍误差） |
| \`Decimal\` | 可配置（默认 28 位） | 可配置 | 金额、财务 |
| \`Fraction\` | 精确（有理数） | 任意 | 分数、概率 |
| \`complex\` | 同 float | 同 float | 复数运算 |

### 取整函数对比

| 操作 | 结果示例（x=-2.7） | 结果 |
| --- | --- | --- |
| \`int(x)\` | 向零取整 | -2 |
| \`math.trunc(x)\` | 向零取整 | -2 |
| \`math.floor(x)\` | 向下（负无穷）取整 | -3 |
| \`math.ceil(x)\` | 向上（正无穷）取整 | -2 |
| \`round(x)\` | 银行家舍入 | -3 |

---

## 本节代码演示

下面这段代码综合演示了数字与数学的各个知识点：int 无限精度、float 精度陷阱、decimal 高精度、fractions 分数、math/statistics/cmath 函数库、round 银行家舍入、位运算、random 随机数。运行后仔细观察输出，理解每个概念。`,
    code: `# ============================================================
# 第一章代码演示：数字与数学进阶
# ============================================================
# 本代码演示：int 无限精度、float 精度陷阱、decimal 高精度、
# fractions 分数、math/statistics/cmath、round 银行家舍入、
# 位运算、random 随机数等核心知识点。

import math
import cmath
import random
import statistics as st
from decimal import Decimal, getcontext, ROUND_HALF_UP
from fractions import Fraction

# ---- 1. int 无限精度 ----
print("========== 1. int 无限精度 ==========")
# Python 整数不会溢出，可任意大
big = 2 ** 100
print("2 的 100 次方 =", big)
print("2 的 1000 次方的位数 =", len(str(2 ** 1000)))

# 多种进制表示
print(f"十进制 42 = 二进制 {bin(42)} = 八进制 {oct(42)} = 十六进制 {hex(42)}")
print(f"二进制 0b101010 = {0b101010}")
print(f"十六进制 0xff = {0xff}")
print(f"int('ff', 16) = {int('ff', 16)}")
print(f"int('1010', 2) = {int('1010', 2)}")

# 下划线分隔大数字
pop = 1_400_000_000
print(f"人口数（下划线分隔）= {pop}")

# 小整数缓存：-5 到 256
a, b = 100, 100
print(f"100 is 100: {a is b}")   # True
c, d = 1000, 1000
print(f"1000 is 1000: {c is d}") # 通常 False

# bit_length / bit_count
n = 42
print(f"42 的二进制: {bin(n)}, 位数: {n.bit_length()}, 1 的个数: {n.bit_count()}")

# ---- 2. float 精度陷阱 ----
print("\\n========== 2. float 精度陷阱 ==========")
print("0.1 + 0.2 =", 0.1 + 0.2)
print("0.1 + 0.2 == 0.3:", 0.1 + 0.2 == 0.3)

# 浮点数比较：用 isclose
print("math.isclose(0.1+0.2, 0.3):", math.isclose(0.1 + 0.2, 0.3))

# 累加误差
total = 0.0
for _ in range(10):
    total += 0.1
print("0.1 累加 10 次:", total)
print("math.fsum 累加 10 次:", math.fsum([0.1] * 10))

# 大数吃小数
big_f = 1e16
print("1e16 + 1.0 == 1e16:", big_f + 1.0 == big_f)

# 特殊值
print("float('inf'):", float('inf'))
print("float('nan') == float('nan'):", float('nan') == float('nan'))
print("math.isnan(nan):", math.isnan(float('nan')))
print("math.isinf(inf):", math.isinf(float('inf')))

# ---- 3. decimal 高精度 ----
print("\\n========== 3. decimal 高精度 ==========")
print("Decimal('0.1') + Decimal('0.2') =", Decimal('0.1') + Decimal('0.2'))
print("用 float 构造（错误）:", Decimal(0.1))

# 设置精度和舍入
getcontext().prec = 6
getcontext().rounding = ROUND_HALF_UP
print("1/3 (prec=6):", Decimal('1') / Decimal('3'))
getcontext().prec = 28  # 恢复默认

# 金额计算
price = Decimal('99.95')
tax_rate = Decimal('0.08')
tax = (price * tax_rate).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
total_dec = price + tax
print(f"税前: {price}, 税(8%): {tax}, 合计: {total_dec}")

# 解决 2.675 舍入问题
print("round(2.675, 2):", round(2.675, 2))
print("Decimal('2.675').quantize(0.01, HALF_UP):",
      Decimal('2.675').quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))

# ---- 4. fractions 分数 ----
print("\\n========== 4. fractions 分数 ==========")
f1 = Fraction(1, 3)
f2 = Fraction(2, 3)
print(f"1/3 + 2/3 = {f1 + f2}")
print(f"1/3 * 2/3 = {f1 * f2}")
print(f"3/6 自动约分 = {Fraction(3, 6)}")
print(f"Fraction('1.5') = {Fraction('1.5')}")
print(f"1/3 + 1/6 = {Fraction(1, 3) + Fraction(1, 6)}")
# 分数与浮点互转
print(f"float(355/113) = {float(Fraction(355, 113))}")

# ---- 5. math 模块 ----
print("\\n========== 5. math 模块 ==========")
print("常量: pi =", math.pi, ", e =", math.e, ", tau =", math.tau)

# 取整
print(f"ceil(2.3)={math.ceil(2.3)}, floor(2.7)={math.floor(2.7)}, trunc(-2.7)={math.trunc(-2.7)}")
print(f"floor(-2.7)={math.floor(-2.7)}, ceil(-2.7)={math.ceil(-2.7)}")

# 幂与对数
print(f"sqrt(144)={math.sqrt(144)}, pow(2,10)={math.pow(2,10)}, exp(1)={math.exp(1)}")
print(f"log(e)={math.log(math.e)}, log10(1000)={math.log10(1000)}, log2(8)={math.log2(8)}")

# 阶乘与组合
print(f"factorial(5)={math.factorial(5)}, comb(5,2)={math.comb(5,2)}, perm(5,2)={math.perm(5,2)}")

# gcd 与 lcm
print(f"gcd(12,18)={math.gcd(12,18)}, lcm(4,6)={math.lcm(4,6)}")
print(f"gcd(12,18,24)={math.gcd(12,18,24)}")

# 三角函数（弧度）
print(f"sin(pi/2)={math.sin(math.pi/2)}, cos(0)={math.cos(0)}")
print(f"degrees(pi)={math.degrees(math.pi)}, radians(180)={math.radians(180)}")

# 辅助函数
print(f"fabs(-3.14)={math.fabs(-3.14)}, copysign(3,-2)={math.copysign(3, -2)}")
print(f"modf(3.14)={math.modf(3.14)}, fsum([0.1]*10)={math.fsum([0.1]*10)}")

# ---- 6. statistics 统计 ----
print("\\n========== 6. statistics 统计 ==========")
data = [1, 2, 2, 3, 4, 5, 5, 5, 6]
print(f"数据: {data}")
print(f"mean(平均)={st.mean(data):.4f}")
print(f"median(中位数)={st.median(data)}")
print(f"mode(众数)={st.mode(data)}")
print(f"multimode([1,1,2,2,3])={st.multimode([1,1,2,2,3])}")
print(f"harmonic_mean([1,2,4])={st.harmonic_mean([1,2,4]):.4f}")
print(f"geometric_mean([1,2,4])={st.geometric_mean([1,2,4]):.4f}")

# 离散程度
data2 = [2, 4, 4, 4, 5, 5, 7, 9]
print(f"数据2: {data2}")
print(f"pvariance(总体方差)={st.pvariance(data2)}")
print(f"pstdev(总体标准差)={st.pstdev(data2)}")
print(f"variance(样本方差)={st.variance(data2):.4f}")
print(f"stdev(样本标准差)={st.stdev(data2):.4f}")
print(f"四分位数: {st.quantiles([1,2,3,4,5,6,7,8,9,10], n=4)}")

# ---- 7. cmath 复数运算 ----
print("\\n========== 7. cmath 复数运算 ==========")
z = 3 + 4j
print(f"z = {z}, abs(z) = {abs(z)}")
print(f"实部 = {z.real}, 虚部 = {z.imag}, 共轭 = {z.conjugate()}")
print(f"sqrt(-1) = {cmath.sqrt(-1)}")
print(f"phase(z) = {cmath.phase(z):.4f} 弧度")
print(f"polar(z) = {cmath.polar(z)}")
print(f"欧拉公式 e^(i*pi) = {cmath.exp(1j * cmath.pi):.6f} (应接近 -1)")

# ---- 8. round 银行家舍入 ----
print("\\n========== 8. round 银行家舍入 ==========")
print("round(2.5) =", round(2.5))   # 2
print("round(3.5) =", round(3.5))   # 4
print("round(0.5) =", round(0.5))   # 0
print("round(1.5) =", round(1.5))   # 2
print("round(2.675, 2) =", round(2.675, 2))  # 2.67（浮点误差）

# 保留小数位的不同方法
x = 3.14159265
print(f"round({x}, 2) = {round(x, 2)} (float)")
print(f"f-string: {x:.2f} (str)")
print(f"format: {format(x, '.2f')} (str)")

# ---- 9. 位运算 ----
print("\\n========== 9. 位运算 ==========")
print(f"0b1100 & 0b1010 = {bin(0b1100 & 0b1010)}")
print(f"0b1100 | 0b1010 = {bin(0b1100 | 0b1010)}")
print(f"0b1100 ^ 0b1010 = {bin(0b1100 ^ 0b1010)}")
print(f"~5 = {~5} (取反 = -(x+1))")
print(f"1 << 4 = {1 << 4} (等价 2^4)")
print(f"256 >> 2 = {256 >> 2}")

# 判断奇偶
for num in [7, 8]:
    print(f"{num} & 1 = {num & 1} ({'奇' if num & 1 else '偶'})")

# 权限标志位
READ, WRITE, EXEC = 0b001, 0b010, 0b100
perm = READ | WRITE
print(f"权限 = {perm}, 有读: {bool(perm & READ)}, 有执行: {bool(perm & EXEC)}")
perm |= EXEC
print(f"加执行后 = {perm}")
perm &= ~WRITE
print(f"去写后 = {perm}")

# ---- 10. random 随机数 ----
print("\\n========== 10. random 随机数 ==========")
random.seed(42)   # 固定种子，结果可复现
print("seed=42 后 random():", random.random())
print("randint(1,100):", random.randint(1, 100))
print("uniform(1,10):", random.uniform(1, 10))
print("choice:", random.choice(['石头', '剪刀', '布']))
print("sample(1-49 选 6):", sorted(random.sample(range(1, 50), 6)))

# 加权随机（抽奖模拟）
result = random.choices(
    ['一等奖', '二等奖', '三等奖', '谢谢参与'],
    weights=[1, 5, 20, 74], k=5
)
print("抽奖结果:", result)

# 打乱列表
lst = [1, 2, 3, 4, 5]
random.shuffle(lst)
print("打乱后:", lst)

# 正态分布模拟身高
heights = [random.gauss(170, 6) for _ in range(1000)]
print(f"模拟 1000 人身高: 均值={st.mean(heights):.2f}, 标准差={st.stdev(heights):.2f}")

# 安全随机数
import secrets
print("安全 token:", secrets.token_hex(8))

# ---- 11. 布尔与数值 ----
print("\\n========== 11. 布尔与数值 ==========")
print("True + True =", True + True)         # 2
print("True * 5 =", True * 5)               # 5
print("isinstance(True, int):", isinstance(True, int))  # True
# 用 sum 统计满足条件的个数
nums = [1, 2, 3, 4, 5, 6, 7, 8]
even_count = sum(n % 2 == 0 for n in nums)
print(f"{nums} 中偶数个数: {even_count}")
# 真值测试
for val in [0, 0.0, '', ' ', [], [0], None, 0.0001]:
    print(f"bool({val!r}) = {bool(val)}")

# ---- 12. 数值类型转换 ----
print("\\n========== 12. 数值类型转换 ==========")
print("int(3.9) =", int(3.9))               # 3（向零取整）
print("int(-3.9) =", int(-3.9))             # -3
print("int('42') =", int('42'))             # 42
print("int('0xff', 16) =", int('0xff', 16)) # 255
print("float('3.14') =", float('3.14'))     # 3.14
print("float(5) =", float(5))               # 5.0
print("complex(3, 4) =", complex(3, 4))     # (3+4j)
# 隐式转换
print("1 + 2.0 =", 1 + 2.0, type(1 + 2.0).__name__)   # float
print("2 + 3j =", 2 + 3j, type(2 + 3j).__name__)      # complex
# 大整数转 float 丢精度
big = 2 ** 60
print(f"2**60 = {big}, float = {float(big)}")

# ---- 13. numbers 数值塔 ----
print("\\n========== 13. numbers 数值塔 ==========")
from numbers import Number, Integral, Rational, Real, Complex as C
print("isinstance(3, Integral):", isinstance(3, Integral))           # True
print("isinstance(3.14, Real):", isinstance(3.14, Real))             # True
print("isinstance(3.14, Rational):", isinstance(3.14, Rational))     # False
print("isinstance(Fraction(1,2), Rational):", isinstance(Fraction(1,2), Rational))
print("isinstance(Decimal('1.5'), Number):", isinstance(Decimal('1.5'), Number))

# ---- 14. 整除与取余细节 ----
print("\\n========== 14. 整除与取余 ==========")
print("-7 // 2 =", -7 // 2)    # -4
print("-7 % 2 =", -7 % 2)      # 1
print("7 // -2 =", 7 // -2)    # -4
print("7 % -2 =", 7 % -2)      # -1
print("divmod(17, 5) =", divmod(17, 5))   # (3, 2)
q, r = divmod(100, 7)
print(f"100 / 7: 商={q}, 余={r}")
# // vs int(a/b) 大数精度
print("10**20 // 3 =", 10**20 // 3)
print("int(10**20 / 3) =", int(10**20 / 3))

# ---- 15. 链式比较与海象运算符 ----
print("\\n========== 15. 链式比较 ==========")
print("1 < 2 < 3:", 1 < 2 < 3)        # True
print("1 < 2 > 0:", 1 < 2 > 0)        # True
print("5 > 3 > 1:", 5 > 3 > 1)        # True
# 海象运算符
data_vals = [3, 1, 4, 1, 5, 9, 2, 6]
filtered = [y for x in data_vals if (y := x * 2) > 4]
print("海象运算符筛选 x*2>4:", filtered)

# ---- 16. 随机数进阶 ----
print("\\n========== 16. 随机数进阶 ==========")
# 种子复现
random.seed(0)
s1 = [random.random() for _ in range(3)]
random.seed(0)
s2 = [random.random() for _ in range(3)]
print("相同种子序列相等:", s1 == s2)
# 状态保存恢复
state = random.getstate()
r1 = random.random()
random.setstate(state)
r2 = random.random()
print("状态恢复后相等:", r1 == r2)
# sample vs choices
print("扑克发 5 张(不重复):", sorted(random.sample(range(52), 5)))
print("掷骰子 10 次(可重复):", random.choices(range(1, 7), k=10))
print("randrange 偶数:", random.randrange(0, 100, 2))

# ---- 17. 数学应用小案例 ----
print("\\n========== 17. 数学应用小案例 ==========")
# 判断质数
def is_prime(n):
    if n < 2:
        return False
    if n < 4:
        return True
    if n % 2 == 0:
        return False
    for i in range(3, int(math.isqrt(n)) + 1, 2):
        if n % 2 == 0 or n % i == 0:
            return False
    return True

primes = [n for n in range(2, 30) if is_prime(n)]
print("30 以内质数:", primes)

# 斐波那契数列
def fib(n):
    a, b = 0, 1
    seq = []
    for _ in range(n):
        seq.append(a)
        a, b = b, a + b
    return seq
print("斐波那契前 10 项:", fib(10))

# 用 gcd 化简分数
def simplify_frac(num, den):
    g = math.gcd(num, den)
    return num // g, den // g
print("化简 12/18:", simplify_frac(12, 18))   # (2, 3)

# 圆面积与球体积
radius = 5
area = math.pi * radius ** 2
volume = (4/3) * math.pi * radius ** 3
print(f"半径 {radius} 圆面积: {area:.2f}, 球体积: {volume:.2f}")

print("\\n数字与数学进阶演示完成！")
`,
  },
  // =========================================================
  // 第二章：字符串高级处理
  // =========================================================
  {
    id: "py-strings-advanced",
    group: "基础深化",
    icon: "✂️",
    title: "字符串高级处理",
    content: `## 字符串高级处理

字符串是 Python 中使用频率最高的数据类型之一。在"字符串"基础一章中，我们已经学会了创建、拼接、切片、查找、替换等基本操作。本章将深入字符串处理的**高级技巧**：标准库 \`string\` 模块的字符集常量、\`textwrap\` 文本折行、\`unicodedata\` 字符信息查询、\`str\` 的全套方法（包括一些冷门但好用的方法）、f-string 的高级格式化能力、字符串性能优化（\`join\` vs \`+\`、\`io.StringIO\`），以及文本处理的实战案例。

掌握这些内容后，你能从容应对日志清洗、报表生成、数据预处理、模板渲染等各类文本处理任务。

---

## 一、string 模块：字符集常量

\`string\` 模块提供了一组常用的**字符集常量**，避免了手写字符串的麻烦，常用于生成验证码、随机字符串、密码字典等场景。

### 1.1 常用常量

| 常量 | 内容 | 长度 |
| --- | --- | --- |
| \`string.ascii_lowercase\` | \`'abcdefghijklmnopqrstuvwxyz'\` | 26 |
| \`string.ascii_uppercase\` | \`'ABCDEFGHIJKLMNOPQRSTUVWXYZ'\` | 26 |
| \`string.ascii_letters\` | 大小写字母合集 | 52 |
| \`string.digits\` | \`'0123456789'\` | 10 |
| \`string.hexdigits\` | \`'0123456789abcdefABCDEF'\` | 22 |
| \`string.octdigits\` | \`'01234567'\` | 8 |
| \`string.punctuation\` | ASCII 标点符号 | 32 |
| \`string.whitespace\` | 空白字符（空格、制表、换行等） | 6 |
| \`string.printable\` | 可打印字符（字母+数字+标点+空白） | 100 |

\`\`\`python
import string                      # 导入 string 模块
print(string.ascii_letters)        # 输出 string.ascii_letters
print(string.digits)               # 输出 string.digits
print(string.punctuation)          # 输出 string.punctuation
print(repr(string.whitespace))   # ' \\t\\n\\r\\x0b\\x0c'
\`\`\`

### 1.2 实战：生成随机验证码

\`\`\`python
import string, random
# 生成 6 位字母数字混合验证码
chars = string.ascii_letters + string.digits  # 将 string.ascii_letters + string.digits 赋给 chars
code = ''.join(random.choices(chars, k=6))  # 将字符串 ''.join(random.choices(chars, k=6)) 赋给 code
print(code)                        # 输出 code
\`\`\`

### 1.3 实战：判断字符类别

\`\`\`python
import string                      # 导入 string 模块
s = 'Hello123!'                    # 将字符串 'Hello123!' 赋给 s
letters = sum(c in string.ascii_letters for c in s)  # 将 sum(c in string.ascii_letters for c in s) 赋给 letters
digits = sum(c in string.digits for c in s)  # 将 sum(c in string.digits for c in s) 赋给 digits
puncts = sum(c in string.punctuation for c in s)  # 将 sum(c in string.punctuation for c in s) 赋给 puncts
print(f"字母 {letters}, 数字 {digits}, 标点 {puncts}")  # 输出 f"字母 {letters}, 数字 {digits}, 标点 {puncts}"
\`\`\`

### 1.4 string.Template 模板字符串

\`string.Template\` 提供简单的 \`$\` 占位符替换，比 f-string 更安全（不会执行任意表达式），适合处理用户提供的模板：

\`\`\`python
from string import Template        # 从 string 导入 Template
t = Template("你好 $name，你的订单 $order 已发货")  # 将 Template("你好 $name，你的订单 $order 已发货") 赋给 t
print(t.substitute(name="张三", order="A12345"))  # 输出 t.substitute(name="张三", order="A12345")
# 用 safe_substitute 避免缺少变量时报错
print(t.safe_substitute(name="李四"))   # 你好 李四，你的订单 $order 已发货
\`\`\`

\`substitute\` 在缺少变量时会抛 \`KeyError\`，\`safe_substitute\` 则保留原占位符。

---

## 二、textwrap 模块：文本折行与排版

\`textwrap\` 模块用于把长文本按指定宽度**折行**、**缩进**、**截断**，在命令行输出、生成报告时非常有用。

### 2.1 基本折行

\`\`\`python
import textwrap                    # 导入 textwrap 模块
text = "Python 是一门高级编程语言，它强调代码可读性，语法简洁优雅，广泛应用于 Web 开发、数据分析、人工智能等领域。"  # 将字符串 "Python 是一门高级编程语言，它强调代码可读性，语法简洁优雅，广泛应用于 Web 开发、数据分析、人工智能等领域。" 赋给 text
# 按每行 20 个字符折行
for line in textwrap.wrap(text, width=20):  # 遍历 textwrap.wrap(text, width=20)，每次取值赋给 line
    print(line)                    # 输出 line
\`\`\`

\`wrap()\` 返回列表，\`fill()\` 直接返回折行后的字符串（用换行符连接）：

\`\`\`python
print(textwrap.fill(text, width=20))  # 输出 textwrap.fill(text, width=20)
\`\`\`

### 2.2 常用参数

| 参数 | 说明 |
| --- | --- |
| \`width\` | 每行最大宽度（默认 70） |
| \`initial_indent\` | 第一行的缩进前缀 |
| \`subsequent_indent\` | 后续行的缩进前缀 |
| \`break_long_words\` | 是否拆分超长单词（默认 True） |
| \`break_on_hyphens\` | 是否在连字符处换行（默认 True） |
| \`max_lines\` | 最大行数（Python 3.4+） |
| \`placeholder\` | 超出 max_lines 时的占位符（默认 '...'） |

\`\`\`python
import textwrap                    # 导入 textwrap 模块
text = "这是一个很长的标题需要被截断显示在固定宽度的容器中" # 将字符串 "这是一个很长的标题需要被截断显示在固定宽度的容器中" 赋给 text
print(textwrap.shorten(text, width=15, placeholder="..."))  # 输出 textwrap.shorten(text, width=15, placeholder="...")
# 控制台输出带缩进的段落
para = "第一段内容..."                  # 将字符串 "第一段内容..." 赋给 para
print(textwrap.fill(para, width=30, initial_indent="    ", subsequent_indent="  "))  # 输出 textwrap.fill(para, width=30, initial_indent="    ", subsequent_indent="  ")
\`\`\`

### 2.3 去除公共缩进 dedent

\`textwrap.dedent\` 可以去除多行字符串中**公共的前导空白**，常用于在代码里写多行字符串：

\`\`\`python
import textwrap                    # 导入 textwrap 模块
s = """                            # 将字符串 """ 赋给 s
    第一行
    第二行
    第三行
"""
print(textwrap.dedent(s))   # 去掉每行前面共同的 4 个空格
\`\`\`

\`inspect.cleandoc\` 是更智能的版本（处理首行没有缩进的情况）。

### 2.4 indent 添加缩进

\`\`\`python
import textwrap                    # 导入 textwrap 模块
text = "第一行\\n第二行\\n第三行"           # 将字符串 "第一行\\n第二行\\n第三行" 赋给 text
print(textwrap.indent(text, "> "))   # 每行前加 "> "
\`\`\`

---

## 三、unicodedata 模块：字符信息查询

\`unicodedata\` 模块可以查询 Unicode 字符的各种属性，如名称、类别、数值等，在处理多语言文本、规范化时很有用。

### 3.1 常用函数

| 函数 | 说明 |
| --- | --- |
| \`unicodedata.name(ch)\` | 字符的 Unicode 名称 |
| \`unicodedata.lookup(name)\` | 按名称反查字符 |
| \`unicodedata.category(ch)\` | 字符类别（如 'Lu' 大写字母） |
| \`unicodedata.decimal(ch)\` | 数值（如果是数字字符） |
| \`unicodedata.digit(ch)\` | 数字值 |
| \`unicodedata.numeric(ch)\` | 数值（含分数如 ½） |
| \`unicodedata.normalize(form, s)\` | Unicode 规范化 |

\`\`\`python
import unicodedata                 # 导入 unicodedata 模块
print(unicodedata.name('中'))    # 'CJK UNIFIED IDEOGRAPH-4E2D'
print(unicodedata.name('A'))     # 'LATIN CAPITAL LETTER A'
print(unicodedata.name('★'))     # 'BLACK STAR'
print(unicodedata.lookup('BLACK STAR'))   # '★'
print(unicodedata.category('A'))   # 'Lu'（Letter, uppercase）
print(unicodedata.category('1'))   # 'Nd'（Number, decimal digit）
print(unicodedata.category(' '))   # 'Zs'（Separator, space）
print(unicodedata.numeric('½'))    # 0.5
\`\`\`

### 3.2 Unicode 规范化

同一个字符可能有多种 Unicode 编码方式（组合字符 vs 预组合字符），规范化让它们统一：

\`\`\`python
import unicodedata                 # 导入 unicodedata 模块
# 'é' 可以是单个字符，也可以是 'e' + 重音符号
s1 = 'é'              # 预组合（1 个字符）
s2 = 'e\\u0301'        # 组合（2 个字符）
print(len(s1), len(s2))              # 1 2
print(s1 == s2)                       # False！
# NFC 规范化后相等
print(unicodedata.normalize('NFC', s2) == s1)   # True
\`\`\`

四种规范化形式：

| 形式 | 说明 |
| --- | --- |
| \`NFC\` | 规范化后组合（最常用，推荐） |
| \`NFD\` | 规范化后分解 |
| \`NFKC\` | 兼容性组合（如全角转半角） |
| \`NFKD\` | 兼容性分解 |

---

## 四、str 方法全家桶

除了常用的 \`split\`/\`join\`/\`replace\`/\`find\`/\`strip\`，\`str\` 还有许多实用方法。

### 4.1 对齐方法

| 方法 | 说明 |
| --- | --- |
| \`center(width, fillchar)\` | 居中对齐，两侧填充 |
| \`ljust(width, fillchar)\` | 左对齐，右侧填充 |
| \`rjust(width, fillchar)\` | 右对齐，左侧填充 |
| \`zfill(width)\` | 左侧补 0 |

\`\`\`python
>>> 'hello'.center(11, '-')   # '---hello---'
>>> 'hello'.ljust(10, '.')    # 'hello.....'
>>> 'hello'.rjust(10, '*')    # '*****hello'
>>> '42'.zfill(5)             # '00042'
>>> '-42'.zfill(5)            # '-0042'（负号保留在前面）
\`\`\`

\`zfill\` 常用于给数字补前导零（如订单号、时间）。

### 4.2 分割方法 partition

\`partition(sep)\` 把字符串分成 **(前, 分隔符, 后)** 三部分，找不到分隔符时返回 **(原字符串, '', '')**：

\`\`\`python
>>> 'name=张三'.partition('=')
('name', '=', '张三')
>>> 'hello'.partition('=')
('hello', '', '')
>>> 'a.b.c'.rpartition('.')   # 从右侧分割
('a.b', '.', 'c')
\`\`\`

\`rpartition\` 从右侧查找分隔符，常用于提取文件扩展名：

\`\`\`python
filename = 'report.2024.pdf'       # 将字符串 'report.2024.pdf' 赋给 filename
name, dot, ext = filename.rpartition('.')
print(name, ext)   # report.2024 pdf
\`\`\`

### 4.3 expandtabs 制表符展开

\`\`\`python
>>> 'a\\tb\\tc'.expandtabs(4)   # 把 \\t 展开为 4 个空格的对齐
'a   b   c'
\`\`\`

### 4.4 translate 与 maketrans 字符映射

\`translate\` 用映射表批量替换/删除字符，比多次 \`replace\` 更高效：

\`\`\`python
# maketrans 创建映射表
table = str.maketrans('aeiou', '12345')  # 将 str.maketrans('aeiou', '12345') 赋给 table
print('hello world'.translate(table))   # 'h2ll4 w4rld'

# 第三个参数指定要删除的字符
table2 = str.maketrans('', '', 'aeiou')  # 删除所有元音
print('hello world'.translate(table2))   # 'hll wrld'

# 用字典指定映射，None 表示删除
table3 = str.maketrans({'a': 'A', 'e': None})  # a→A, e→删除
print('apple'.translate(table3))   # 'Appl'
\`\`\`

\`translate\` 适合做字符级替换（如加密、过滤、大小写转换的批量处理），速度比循环 \`replace\` 快得多。

### 4.5 removeprefix / removesuffix

Python 3.9+ 新增，安全地移除前缀/后缀（不存在时返回原字符串，不报错）：

\`\`\`python
>>> 'test_file.py'.removeprefix('test_')   # 'file.py'
>>> 'image.png'.removesuffix('.png')       # 'image'
>>> 'hello'.removeprefix('x')              # 'hello'（无前缀，原样返回）
\`\`\`

对比 \`lstrip\`/\`rstrip\`：\`lstrip('test_')\` 会移除所有 't','e','s','_' 字符组合，而非前缀字符串，行为完全不同！

\`\`\`python
>>> 'test_test'.lstrip('test_')     # '' （lstrip 把 t/e/s/_ 当字符集）
>>> 'test_test'.removeprefix('test_')  # 'test'
\`\`\`

### 4.6 查找与计数

| 方法 | 说明 |
| --- | --- |
| \`find(sub)\` | 查找子串，返回首索引，找不到返回 -1 |
| \`rfind(sub)\` | 从右侧查找 |
| \`index(sub)\` | 同 find，找不到抛 ValueError |
| \`rindex(sub)\` | 从右侧查找，找不到抛错 |
| \`count(sub)\` | 统计子串出现次数 |
| \`startswith(prefix)\` | 是否以 prefix 开头 |
| \`endswith(suffix)\` | 是否以 suffix 结尾 |

\`\`\`python
>>> 'hello world'.find('o')       # 4
>>> 'hello world'.rfind('o')      # 7
>>> 'hello world'.count('l')      # 3
>>> 'hello world'.count('o')      # 2
>>> 'abc.txt'.endswith('.txt')    # True
>>> 'abc.txt'.startswith('abc')   # True
\`\`\`

\`startswith\`/\`endswith\` 支持元组（任一匹配即可）：

\`\`\`python
>>> 'image.jpg'.endswith(('.jpg', '.png', '.gif'))   # True
\`\`\`

### 4.7 判断方法

| 方法 | 说明 |
| --- | --- |
| \`isalpha()\` | 是否全是字母 |
| \`isdigit()\` | 是否全是数字 |
| \`isalnum()\` | 是否全是字母或数字 |
| \`isspace()\` | 是否全是空白 |
| \`isupper()\` / \`islower()\` | 是否全大写/全小写 |
| \`istitle()\` | 是否标题形式（每个单词首字母大写） |
| \`isnumeric()\` | 是否全是数值字符（含中文数字） |
| \`isdecimal()\` | 是否全是十进制字符 |

\`\`\`python
>>> '123'.isdigit()      # True
>>> 'abc'.isalpha()      # True
>>> '一二三'.isnumeric()   # True
>>> '   '.isspace()      # True
>>> 'Hello World'.istitle()   # True
\`\`\`

注意 \`isdigit\`、\`isnumeric\`、\`isdecimal\` 三者有细微区别：\`isdecimal\` 最严格（只接受 0-9 等十进制字符），\`isdigit\` 还接受上标数字如 '²'，\`isnumeric\` 最宽泛（接受中文数字、罗马数字等）。

---

## 五、f-string 高级格式化

f-string（Python 3.6+）是格式化字符串最强大的方式。语法：\`f'{value:格式说明符}'\`。

### 5.1 格式说明符完整语法

格式说明符的结构：\`[[fill]align][sign][#][0][width][grouping_option][.precision][type]\`

| 部分 | 说明 | 示例 |
| --- | --- | --- |
| \`fill\` | 填充字符 | \`'-'\` |
| \`align\` | 对齐方式 | \`<\` 左 \`>\` 右 \`^\` 居中 \`=\` 符号后填充 |
| \`sign\` | 符号 | \`+\` 总显示 \`-\` 仅负数 \`(空格)\` 正数前加空格 |
| \`#\` | 显示进制前缀 | \`#x\` 显示 0x |
| \`0\` | 数值前补零 | \`08d\` |
| \`width\` | 最小宽度 | \`10\` |
| \`grouping\` | 千分位 | \`,\` 或 \`_\` |
| \`.precision\` | 精度 | \`.2f\` |
| \`type\` | 类型 | \`d\` \`f\` \`e\` \`x\` \`b\` \`o\` \`%\` \`s\` |

### 5.2 对齐与填充

\`\`\`python
>>> f"{'hello':<10}"    # 'hello     ' 左对齐
>>> f"{'hello':>10}"    # '     hello' 右对齐
>>> f"{'hello':^10}"    # '  hello   ' 居中
>>> f"{'hello':->10}"   # '-----hello' 用 - 填充
>>> f"{'hello':*^10}"   # '**hello***' 用 * 填充居中
\`\`\`

### 5.3 数值格式化

\`\`\`python
>>> f"{255:x}"          # 'ff' 十六进制
>>> f"{255:#x}"         # '0xff' 带前缀
>>> f"{255:b}"          # '11111111' 二进制
>>> f"{255:o}"          # '377' 八进制
>>> f"{3.14159:.2f}"    # '3.14' 两位小数
>>> f"{3.14159:.4e}"    # '3.1416e+00' 科学计数法
>>> f"{0.875:.2%}"      # '87.50%' 百分比
>>> f"{1234567:,}"      # '1,234,567' 千分位
>>> f"{1234567:_}"      # '1_234_567' 下划线分组
>>> f"{42:08d}"         # '00000042' 补零
>>> f"{42:+d}"          # '+42' 显示正号
\`\`\`

### 5.4 日期格式化

f-string 可以直接格式化 datetime 对象：

\`\`\`python
>>> from datetime import datetime
>>> now = datetime.now()
>>> f"{now:%Y-%m-%d %H:%M:%S}"      # '2024-01-15 14:30:00'
>>> f"{now:%Y年%m月%d日}"            # '2024年01月15日'
>>> f"{now:%A}"                       # 'Monday' 星期
\`\`\`

### 5.5 debug 语法 =（Python 3.8+）

在变量后加 \`=\` 可以同时输出变量名和值，调试时极其方便：

\`\`\`python
>>> name = "张三"
>>> age = 28
>>> f"{name=}, {age=}"      # "name='张三', age=28"
>>> f"{age=:.2f}"           # 'age=28.00'（可加格式说明符）
>>> f"{1+1=}"               # '1+1=2'
\`\`\`

### 5.6 嵌套与表达式

\`\`\`python
>>> width = 10
>>> f"{'hello':^{width}}"   # 嵌套变量作为宽度
>>> f"{[1,2,3][1]}"          # '2'，支持表达式
>>> f"{sum([1,2,3])}"        # '6'
\`\`\`

Python 3.12+ 还支持 f-string 嵌套引号、多行 f-string 等增强。

---

## 六、字符串性能：join vs + vs StringIO

### 6.1 字符串不可变与性能

Python 字符串是**不可变**的，每次 \`+\` 拼接都会创建新字符串对象，大量拼接时性能很差：

\`\`\`python
# 慢：每次 + 都复制整个字符串
s = ''                             # 将字符串 '' 赋给 s
for i in range(10000):             # 遍历 range(10000)，每次取值赋给 i
    s += str(i)                    # s 加 str(i)
\`\`\`

对于 N 次拼接，\`+\` 的时间复杂度接近 O(N²)，而 \`join\` 是 O(N)。

### 6.2 join 的正确用法

\`\`\`python
# 快：join 一次性拼接
parts = [str(i) for i in range(10000)]  # 创建列表并赋给 parts
s = ''.join(parts)                 # 将字符串 ''.join(parts) 赋给 s
\`\`\`

\`join\` 会预先计算总长度，一次性分配内存，速度远快于循环 \`+\`。

### 6.3 io.StringIO 流式拼接

对于**流式**生成大量文本（如生成报表、写日志），\`io.StringIO\` 是更好的选择——它是一个内存中的"文件"，支持 \`write\` 方法，最后一次性取出：

\`\`\`python
from io import StringIO            # 从 io 导入 StringIO
buf = StringIO()                   # 将 StringIO() 赋给 buf
for i in range(10000):             # 遍历 range(10000)，每次取值赋给 i
    buf.write(str(i))              # 对 buf 调用 write 方法，参数 str(i)
    buf.write('\\n')               # 对 buf 调用 write 方法，参数 '\\n'
result = buf.getvalue()            # 将 buf.getvalue() 赋给 result
\`\`\`

### 6.4 性能对比

| 方法 | 适用场景 | 速度 |
| --- | --- | --- |
| \`+\` | 少量拼接（几次） | 一般 |
| \`join\` | 已有列表，一次拼接 | 最快 |
| \`StringIO\` | 流式生成、逐步写入 | 快 |
| f-string | 格式化单个字符串 | 最快（格式化场景） |

\`\`\`python
import timeit                      # 导入 timeit 模块
# 测量拼接 10000 个字符串的时间
print(timeit.timeit("s=''; [s:=s+str(i) for i in range(1000)]", number=10))  # 输出 timeit.timeit("s=''; [s:=s+str(i) for i in range(1000)]", number=10)
print(timeit.timeit("''.join(str(i) for i in range(1000))", number=10))  # 输出 timeit.timeit("''.join(str(i) for i in range(1000))", number=10)
\`\`\`

---

## 七、文本处理实战

### 7.1 文本清洗

\`\`\`python
import re                          # 导入 re 模块
def clean_text(text):              # 定义函数 clean_text，参数：text
    # 去除多余空白（多个空格/换行合并为一个）
    text = re.sub(r'\\s+', ' ', text)  # 将 re.sub(r'\\s+', ' ', text) 赋给 text
    # 去除首尾空白
    text = text.strip()            # 将 text.strip() 赋给 text
    # 全角转半角（用 unicodedata）
    import unicodedata             # 导入 unicodedata 模块
    text = unicodedata.normalize('NFKC', text)  # 将 unicodedata.normalize('NFKC', text) 赋给 text
    return text                    # 返回 text

raw = "  Hello   世界  \\n  Python  "  # 将字符串 "  Hello   世界  \\n  Python  " 赋给 raw
print(clean_text(raw))   # 'Hello 世界 Python'
\`\`\`

### 7.2 词频统计

\`\`\`python
from collections import Counter    # 从 collections 导入 Counter
import re                          # 导入 re 模块
text = "the cat sat on the mat the cat ate the rat"  # 将字符串 "the cat sat on the mat the cat ate the rat" 赋给 text
words = re.findall(r'\\w+', text.lower())  # 将 re.findall(r'\\w+', text.lower()) 赋给 words
freq = Counter(words)              # 将 Counter(words) 赋给 freq
print(freq.most_common(3))   # 最常见的 3 个词
\`\`\`

### 7.3 模板替换

\`\`\`python
from string import Template        # 从 string 导入 Template
template = Template("亲爱的\${user}，您的会员将于\${date}到期，请及时续费。")  # 将 Template("亲爱的\${user}，您的会员将于\${date}到期，请及时续费。") 赋给 template
msg = template.substitute(user="张三", date="2024-12-31")  # 将 template.substitute(user="张三", date="2024-12-31") 赋给 msg
print(msg)                         # 输出 msg
\`\`\`

### 7.4 提取信息

\`\`\`python
import re                          # 导入 re 模块
text = "联系方式：电话 138-1234-5678，邮箱 abc@example.com"  # 将字符串 "联系方式：电话 138-1234-5678，邮箱 abc@example.com" 赋给 text
phones = re.findall(r'\\d{3}-\\d{4}-\\d{4}', text)  # 将 re.findall(r'\\d{3}-\\d{4}-\\d{4}', text) 赋给 phones
emails = re.findall(r'[\\w.]+@[\\w.]+', text)  # 将 re.findall(r'[\\w.]+@[\\w.]+', text) 赋给 emails
print("电话:", phones)   # ['138-1234-5678']
print("邮箱:", emails)   # ['abc@example.com']
\`\`\`

### 7.5 表格生成

\`\`\`python
def make_table(headers, rows):     # 定义函数 make_table，参数：headers, rows
    widths = [max(len(str(h)), max(len(str(r[i])) for r in rows)) for i, h in enumerate(headers)]  # 创建列表并赋给 widths
    sep = '+' + '+'.join('-' * (w+2) for w in widths) + '+'  # 将字符串 '+' + '+'.join('-' * (w+2) for w in widths) + '+' 赋给 sep
    line = '|' + '|'.join(f' {str(h):^{widths[i]}} ' for i, h in enumerate(headers)) + '|'  # 将字符串 '|' + '|'.join(f' {str(h):^{widths[i]}} ' for i, h in enumerate(headers)) + '|' 赋给 line
    result = [sep, line, sep]      # 创建列表并赋给 result
    for row in rows:               # 遍历 rows，每次取值赋给 row
        result.append('|' + '|'.join(f' {str(r):^{widths[i]}} ' for i, r in enumerate(row)) + '|')  # 对 result 调用 追加 方法，参数 '|' + '|'.join(f' {str(r):^{widths[i]}} ' for i, r in enumerate(row)) + '|'
    result.append(sep)             # 对 result 调用 追加 方法，参数 sep
    return '\\n'.join(result)      # 返回 '\\n'.join(result)

print(make_table(['姓名', '年龄', '城市'], [['张三', 28, '北京'], ['李四', 35, '上海']]))  # 输出 make_table(['姓名', '年龄', '城市'], [['张三', 28, '北京'], ['李四', 35, '上海']])
\`\`\`

---

## 八、字符串编码与长度

### 8.1 字符与字节

Python 3 的 \`str\` 是 Unicode 字符序列，\`len()\` 返回的是**字符数**而非字节数：

\`\`\`python
>>> len('hello')      # 5
>>> len('你好')        # 2（两个中文字符）
>>> len('你好'.encode('utf-8'))   # 6（UTF-8 编码后 6 字节）
\`\`\`

中文在 UTF-8 中通常占 3 字节，emoji 占 4 字节。

### 8.2 多字节字符与切片

\`\`\`python
>>> s = 'Python编程'
>>> len(s)            # 8
>>> s[:6]             # 'Python'
>>> s[6:]             # '编程'
\`\`\`

Python 3 的字符串按字符（码点）切片，不会把多字节字符切断。

### 8.3 字符串与内存

CPython 内部对字符串有多种存储方式：纯 ASCII 用 1 字节/字符，Latin-1 范围用 1 字节，BMP 用 2 字节，含辅助平面字符用 4 字节。这是自动优化的，用 \`sys.getsizeof\` 可查看实际占用内存。

---

## 九、其他实用方法

### 9.1 splitlines 按行分割

\`\`\`python
>>> 'a\\nb\\nc'.splitlines()       # ['a', 'b', 'c']
>>> 'a\\nb\\nc'.splitlines(True)   # 保留换行符 ['a\\n', 'b\\n', 'c']
\`\`\`

### 9.2 swapcase 大小写互换

\`\`\`python
>>> 'Hello World'.swapcase()   # 'hELLO wORLD'
\`\`\`

### 9.3 title 标题化

\`\`\`python
>>> 'hello world'.title()      # 'Hello World'
>>> 'hello-world'.title()      # 'Hello-World'
\`\`\`

\`title\` 把每个单词首字母大写，但"单词"的划分有时不理想（如 "don't" → "Don'T"），用 \`string.capwords\` 更可控：

\`\`\`python
>>> import string
>>> string.capwords("don't stop")   # "Don't Stop"
\`\`\`

### 9.4 casefold 用于无大小写比较

\`casefold\` 比 \`lower\` 更激进，专门用于**无大小写比较**（如德语 ß → ss）：

\`\`\`python
>>> 'Straße'.lower() == 'strasse'   # False
>>> 'Straße'.casefold() == 'strasse'   # True
\`\`\`

跨语言比较字符串是否相等（忽略大小写）时，应该用 \`s1.casefold() == s2.casefold()\`。

### 9.5 format_map 与 format

\`\`\`python
>>> data = {'name': '张三', 'age': 28}
>>> '{name}今年{age}岁'.format_map(data)   # '张三今年28岁'
>>> '{name}今年{age}岁'.format(**data)      # 等价
\`\`\`

\`format_map\` 直接接受字典，不需要解包，比 \`format(**d)\` 略快。

---

## 十、其他格式化方法：% 与 .format()

除了 f-string，Python 还有两种字符串格式化方式，理解它们有助于阅读旧代码。

### 10.1 % 格式化（C 风格，旧式）

\`\`\`python
>>> '我叫 %s，今年 %d 岁' % ('张三', 28)   # '我叫 张三，今年 28 岁'
>>> '%.2f' % 3.14159                       # '3.14'
>>> '%010.2f' % 3.14                       # '0000003.14'
>>> '%x' % 255                             # 'ff'
\`\`\`

常用占位符：\`%s\` 字符串、\`%d\` 整数、\`%f\` 浮点、\`%x\` 十六进制、\`%o\` 八进制、\`%e\` 科学计数、\`%%\` 百分号字面量。这种方式已不推荐用于新代码，但旧代码中常见。

### 10.2 str.format() 方法

\`\`\`python
>>> '{}今年{}岁'.format('张三', 28)         # '张三今年28岁'
>>> '{0}爱{0}'.format('我')                  # '我爱我'（位置参数）
>>> '{name}今年{age}岁'.format(name='张三', age=28)   # 关键字
>>> '{:>10}'.format('hi')                    # '        hi' 右对齐
>>> '{:.2f}'.format(3.14159)                 # '3.14'
>>> '{:,}'.format(1234567)                   # '1,234,567'
\`\`\`

\`format()\` 支持 f-string 的所有格式说明符，但语法更冗长。新代码统一用 f-string 即可，\`format()\` 在需要把格式说明符存为变量的动态场景下仍有用：

\`\`\`python
fmt = '{:.' + str(precision) + 'f}'  # 将字符串 '{:.' + str(precision) + 'f}' 赋给 fmt
print(fmt.format(3.14159))         # 输出 fmt.format(3.14159)
\`\`\`

### 10.3 三种方式对比

| 方式 | 语法 | 可读性 | 性能 | 推荐度 |
| --- | --- | --- | --- | --- |
| f-string | \`f'{x}'\` | 最好 | 最快 | ⭐⭐⭐⭐⭐ |
| \`.format()\` | \`'{}'.format(x)\` | 良 | 良 | ⭐⭐⭐ |
| \`%\` | \`'%s' % x\` | 一般 | 一般 | ⭐⭐（旧代码） |

---

## 十一、split / rsplit / splitlines 详解

### 11.1 split 的参数

\`split(sep=None, maxsplit=-1)\`：
- 不传 \`sep\`（默认 None）：按**任意空白**分割，并自动忽略连续空白和首尾空白
- 传 \`sep\`：按指定分隔符分割，连续分隔符会产生空字符串
- \`maxsplit\`：最多分割次数

\`\`\`python
>>> 'a  b   c'.split()          # ['a', 'b', 'c']（默认按空白，忽略多个）
>>> 'a  b   c'.split(' ')       # ['a', '', 'b', '', '', 'c']（按单空格，保留空串）
>>> 'a,b,c,d'.split(',', 2)     # ['a', 'b', 'c,d']（最多分 2 次）
>>> 'a,b,c'.rsplit(',', 1)      # ['a,b', 'c']（从右侧分）
\`\`\`

这是常见坑：\`split()\` 和 \`split(' ')\` 行为完全不同。处理用户输入时通常用 \`split()\`（不传参）更安全。

### 11.2 实战：解析 CSV 行

\`\`\`python
line = '张三,28,北京,程序员'              # 将字符串 '张三,28,北京,程序员' 赋给 line
fields = line.split(',')           # 将 line.split(',') 赋给 fields
print(fields)   # ['张三', '28', '北京', '程序员']
\`\`\`

### 11.3 splitlines 按行分割

\`\`\`python
>>> 'a\\nb\\r\\nc'.splitlines()   # ['a', 'b', 'c']（兼容各种换行符）
>>> 'a\\nb\\n'.splitlines()       # ['a', 'b']（不保留末尾空行）
\`\`\`

\`splitlines\` 比 \`split('\\n')\` 更健壮，能识别 \`\\n\`、\`\\r\`、\`\\r\\n\` 等各种换行符。

---

## 十二、字符串与正则表达式入门

\`re\` 模块是文本处理的利器，这里介绍常用函数。

### 12.1 常用函数

| 函数 | 说明 |
| --- | --- |
| \`re.search(pattern, string)\` | 搜索第一个匹配，返回 Match 或 None |
| \`re.match(pattern, string)\` | 从开头匹配 |
| \`re.fullmatch(pattern, string)\` | 整个字符串完全匹配 |
| \`re.findall(pattern, string)\` | 返回所有匹配的列表 |
| \`re.finditer(pattern, string)\` | 返回匹配对象的迭代器 |
| \`re.sub(pattern, repl, string)\` | 替换 |
| \`re.split(pattern, string)\` | 按模式分割 |
| \`re.compile(pattern)\` | 预编译模式（多次使用时更快） |

\`\`\`python
import re                          # 导入 re 模块
text = '电话: 138-1234-5678, 邮箱: a@b.com'  # 将字符串 '电话: 138-1234-5678, 邮箱: a@b.com' 赋给 text
# 查找
m = re.search(r'\\d{3}-\\d{4}-\\d{4}', text)  # 将 re.search(r'\\d{3}-\\d{4}-\\d{4}', text) 赋给 m
if m:                              # 如果 m 成立
    print(m.group(), m.start(), m.end())   # 138-1234-5678 4 18
# 全部查找
print(re.findall(r'\\d+', text))   # ['138', '1234', '5678']
# 替换
print(re.sub(r'\\d', '*', text))   # 把所有数字替换为 *
\`\`\`

### 12.2 分组与命名

\`\`\`python
import re                          # 导入 re 模块
m = re.search(r'(\\d{4})-(\\d{2})-(\\d{2})', '2024-01-15')  # 将 re.search(r'(\\d{4})-(\\d{2})-(\\d{2})', '2024-01-15') 赋给 m
print(m.group(0))   # 2024-01-15（整体）
print(m.group(1))   # 2024（第 1 组）
print(m.groups())   # ('2024', '01', '15')
# 命名分组
m = re.search(r'(?P<year>\\d{4})-(?P<month>\\d{2})', '2024-01')  # 将 re.search(r'(?P<year>\\d{4})-(?P<month>\\d{2})', '2024-01') 赋给 m
print(m.group('year'))   # 2024
\`\`\`

### 12.3 预编译提升性能

\`\`\`python
import re                          # 导入 re 模块
# 多次使用同一模式时，预编译可显著提速
phone_re = re.compile(r'\\d{3}-\\d{4}-\\d{4}')  # 将 re.compile(r'\\d{3}-\\d{4}-\\d{4}') 赋给 phone_re
print(phone_re.findall('138-1234-5678 和 139-0000-1111'))  # 输出 phone_re.findall('138-1234-5678 和 139-0000-1111')
\`\`\`

---

## 十三、字符串驻留 intern 与内存

### 13.1 字符串驻留机制

CPython 会自动"驻留"（intern）一些字符串——让多个相同内容的字符串共享同一个对象，节省内存并加速比较。符合**标识符规则**的字符串（只含字母、数字、下划线）通常会被自动驻留：

\`\`\`python
>>> a = 'hello_world'
>>> b = 'hello_world'
>>> a is b   # True，自动驻留
>>> c = 'hello world!'
>>> d = 'hello world!'
>>> c is d   # False（通常），含空格/标点不驻留
\`\`\`

### 13.2 手动驻留

\`\`\`python
import sys                         # 导入 sys 模块
s1 = sys.intern('hello world!')    # 将 sys.intern('hello world!') 赋给 s1
s2 = sys.intern('hello world!')    # 将 sys.intern('hello world!') 赋给 s2
print(s1 is s2)   # True，手动驻留后共享
\`\`\`

驻留适合处理大量重复的长字符串（如解析日志中的固定字段），可以显著降低内存。但不要滥用，对短字符串收益有限。

### 13.3 字符串内存占用

\`\`\`python
import sys                         # 导入 sys 模块
print(sys.getsizeof(''))      # 49 字节（空字符串）
print(sys.getsizeof('a'))     # 50 字节
print(sys.getsizeof('ab'))    # 51 字节（ASCII 每 +1 字符 +1 字节）
print(sys.getsizeof('中'))    # 76 字节（中文用更宽的存储）
\`\`\`

---

## 十四、更多实战案例

### 14.1 驼峰命名转换

\`\`\`python
def snake_to_camel(snake):         # 定义函数 snake_to_camel，参数：snake
    parts = snake.split('_')       # 将 snake.split('_') 赋给 parts
    return parts[0] + ''.join(p.capitalize() for p in parts[1:])  # 返回 parts[0] + ''.join(p.capitalize() for p in parts[1:])

def camel_to_snake(camel):         # 定义函数 camel_to_snake，参数：camel
    import re                      # 导入 re 模块
    return re.sub(r'(?<!^)(?=[A-Z])', '_', camel).lower()  # 返回 re.sub(r'(?<!^)(?=[A-Z])', '_', camel).lower()

print(snake_to_camel('hello_world_foo'))   # helloWorldFoo
print(camel_to_snake('helloWorldFoo'))     # hello_world_foo
\`\`\`

### 14.2 文本左右对齐排版

\`\`\`python
def align_table(rows):             # 定义函数 align_table，参数：rows
    cols = list(zip(*rows))   # 转置
    widths = [max(len(str(c)) for c in col) for col in cols]  # 创建列表并赋给 widths
    for row in rows:               # 遍历 rows，每次取值赋给 row
        print(' | '.join(str(c).ljust(widths[i]) for i, c in enumerate(row)))  # 输出 ' | '.join(str(c).ljust(widths[i]) for i, c in enumerate(row))

align_table([['姓名', '年龄', '城市'], ['张三', '28', '北京'], ['李四', '35', '上海']])  # 调用 align_table，参数 [['姓名', '年龄', '城市'], ['张三', '28', '北京'], ['李四', '35', '上海']]
\`\`\`

### 14.3 脱敏处理

\`\`\`python
def mask_phone(phone):             # 定义函数 mask_phone，参数：phone
    return phone[:3] + '****' + phone[-4:]  # 返回 phone[:3] + '****' + phone[-4:]

def mask_id(id_card):              # 定义函数 mask_id，参数：id_card
    return id_card[:6] + '*' * 8 + id_card[-4:]  # 返回 id_card[:6] + '*' * 8 + id_card[-4:]

print(mask_phone('13812345678'))   # 138****5678
print(mask_id('110101199001011234'))   # 110101********1234
\`\`\`

### 14.4 千分位与中文数字

\`\`\`python
# 千分位
print(f"{1234567890:,}")   # 1,234,567,890
# 中文千分位（每 4 位）
def cn_group(n):                   # 定义函数 cn_group，参数：n
    s = str(n)                     # 将 str(n) 赋给 s
    return ','.join(s[i:i+4] for i in range(0, len(s), 4))  # 返回 ','.join(s[i:i+4] for i in range(0, len(s), 4))
print(cn_group(1234567890))   # 12,3456,7890
\`\`\`

### 14.5 字符串反转的多种方法

\`\`\`python
s = 'hello'                        # 将字符串 'hello' 赋给 s
print(s[::-1])              # 'olleh'，切片反转（最快）
print(''.join(reversed(s)))  # 'olleh'，reversed
print(''.join(s[i] for i in range(len(s)-1, -1, -1)))  # 循环（慢）
\`\`\`

切片 \`s[::-1]\` 是反转字符串最 Pythonic、最快的方式。\`reversed\` 返回迭代器，配合 \`join\` 也能反转，但比切片略慢。循环方式最慢，仅用于教学演示。

### 14.6 判断回文

\`\`\`python
def is_palindrome(s):              # 定义函数 is_palindrome，参数：s
    s = s.lower().replace(' ', '')   # 忽略大小写和空格
    return s == s[::-1]            # 返回 s == s[::-1]

print(is_palindrome('racecar'))         # True
print(is_palindrome('A man a plan a canal Panama'))  # True
print(is_palindrome('hello'))           # False
\`\`\`

### 14.7 字符串补齐与格式化订单号

\`\`\`python
# 生成固定位数订单号
order_id = 42                      # 将整数 42 赋给 order_id
print(f'ORD{order_id:06d}')   # 'ORD000042'
# 序列号
for i in range(1, 4):              # 遍历 range(1, 4)，每次取值赋给 i
    print(f'SN-{i:03d}')       # SN-001, SN-002, SN-003
\`\`\`

### 14.8 统计字符串信息

\`\`\`python
text = 'Hello World 2024'          # 将字符串 'Hello World 2024' 赋给 text
print(f"总字符: {len(text)}")         # 输出 f"总字符: {len(text)}"
print(f"字母: {sum(c.isalpha() for c in text)}")  # 输出 f"字母: {sum(c.isalpha() for c in text)}"
print(f"数字: {sum(c.isdigit() for c in text)}")  # 输出 f"数字: {sum(c.isdigit() for c in text)}"
print(f"空格: {sum(c.isspace() for c in text)}")  # 输出 f"空格: {sum(c.isspace() for c in text)}"
print(f"大写: {sum(c.isupper() for c in text)}")  # 输出 f"大写: {sum(c.isupper() for c in text)}"
\`\`\`

这种用 \`sum(生成器)\` 统计的方式很 Pythonic，利用了 \`True==1\` 的特性。

---

## 十五、总结对比表

### 拼接方法对比

| 方法 | 语法 | 适用 | 性能 |
| --- | --- | --- | --- |
| \`+\` | \`a + b\` | 少量拼接 | 差（大量时） |
| \`join\` | \`''.join(list)\` | 列表拼接 | 优 |
| f-string | \`f'{a}{b}'\` | 格式化 | 优 |
| \`%\` | \`'%s%s' % (a,b)\` | 旧式 | 一般 |
| \`.format()\` | \`'{}{}'.format(a,b)\` | 通用 | 良 |
| StringIO | \`buf.write()\` | 流式 | 优 |

### 查找方法对比

| 方法 | 找不到时 | 返回 |
| --- | --- | --- |
| \`find\` | -1 | 索引 |
| \`index\` | ValueError | 索引 |
| \`rfind\` | -1 | 索引（从右） |
| \`count\` | 0 | 次数 |

---

## 本节代码演示

下面这段代码综合演示了字符串高级处理的各个知识点：string 模块常量、textwrap 折行、unicodedata 查询、str 全套方法、f-string 高级格式化、字符串性能对比、文本处理实战。运行后仔细观察输出。`,
    code: `# ============================================================
# 第二章代码演示：字符串高级处理
# ============================================================
# 本代码演示：string 模块、textwrap、unicodedata、str 方法全家桶、
# f-string 高级格式化、字符串性能、文本处理实战。

import string
import textwrap
import unicodedata
import re
import timeit
from io import StringIO
from collections import Counter

# ---- 1. string 模块字符集常量 ----
print("========== 1. string 模块 ==========")
print("ascii_letters:", string.ascii_letters)
print("digits:", string.digits)
print("punctuation:", string.punctuation)
print("whitespace:", repr(string.whitespace))
print("printable 长度:", len(string.printable))

# 生成随机验证码
import random
random.seed(1)
chars = string.ascii_letters + string.digits
code = ''.join(random.choices(chars, k=6))
print("随机验证码:", code)

# 判断字符类别
s = 'Hello123!'
letters = sum(c in string.ascii_letters for c in s)
digits = sum(c in string.digits for c in s)
puncts = sum(c in string.punctuation for c in s)
print(f"'{s}': 字母 {letters}, 数字 {digits}, 标点 {puncts}")

# string.Template
from string import Template
t = Template("你好 $name，订单 $order 已发货")
print(t.substitute(name="张三", order="A12345"))
print(t.safe_substitute(name="李四"))

# ---- 2. textwrap 文本折行 ----
print("\\n========== 2. textwrap 文本折行 ==========")
long_text = "Python 是一门高级编程语言，它强调代码可读性，语法简洁优雅，广泛应用于 Web 开发、数据分析、人工智能等领域。"
print("--- wrap(每行20字符) ---")
for line in textwrap.wrap(long_text, width=20):
    print(line)
print("--- fill(带缩进) ---")
print(textwrap.fill(long_text, width=25, initial_indent=">> ", subsequent_indent="   "))
print("--- shorten ---")
print(textwrap.shorten(long_text, width=20, placeholder="..."))

# dedent 去除公共缩进
multi = """
    第一行
    第二行
    第三行
"""
print("--- dedent ---")
print(textwrap.dedent(multi))

# indent 添加缩进
print("--- indent ---")
print(textwrap.indent("第一行\\n第二行\\n第三行", "> "))

# ---- 3. unicodedata 字符信息 ----
print("\\n========== 3. unicodedata ==========")
for ch in ['中', 'A', '★', '½', '①']:
    try:
        print(f"'{ch}': name={unicodedata.name(ch)}, category={unicodedata.category(ch)}")
    except ValueError:
        print(f"'{ch}': 无名称")

print("lookup('BLACK STAR'):", unicodedata.lookup('BLACK STAR'))
print("numeric('½'):", unicodedata.numeric('½'))
print("numeric('①'):", unicodedata.numeric('①'))

# Unicode 规范化
s1 = 'é'              # 预组合
s2 = 'e\\u0301'        # 组合
print(f"len(s1)={len(s1)}, len(s2)={len(s2)}, 相等: {s1 == s2}")
print(f"NFC 规范化后相等: {unicodedata.normalize('NFC', s2) == s1}")

# ---- 4. str 对齐方法 ----
print("\\n========== 4. str 对齐方法 ==========")
print("'hello'.center(11, '-'):", 'hello'.center(11, '-'))
print("'hello'.ljust(10, '.'):", 'hello'.ljust(10, '.'))
print("'hello'.rjust(10, '*'):", 'hello'.rjust(10, '*'))
print("'42'.zfill(5):", '42'.zfill(5))
print("'-42'.zfill(5):", '-42'.zfill(5))

# ---- 5. partition 与 rpartition ----
print("\\n========== 5. partition ==========")
print("'name=张三'.partition('='):", 'name=张三'.partition('='))
print("'a.b.c'.rpartition('.'):", 'a.b.c'.rpartition('.'))
# 提取文件扩展名
fn = 'report.2024.pdf'
name, dot, ext = fn.rpartition('.')
print(f"文件 {fn}: 主名={name}, 扩展名={ext}")

# ---- 6. translate / maketrans ----
print("\\n========== 6. translate ==========")
table = str.maketrans('aeiou', '12345')
print("'hello world'.translate:", 'hello world'.translate(table))
# 删除所有元音
table2 = str.maketrans('', '', 'aeiou')
print("删除元音:", 'hello world'.translate(table2))
# 字典映射
table3 = str.maketrans({'a': 'A', 'e': None})
print("'apple'.translate:", 'apple'.translate(table3))

# ---- 7. removeprefix / removesuffix ----
print("\\n========== 7. removeprefix/removesuffix ==========")
print("'test_file.py'.removeprefix('test_'):", 'test_file.py'.removeprefix('test_'))
print("'image.png'.removesuffix('.png'):", 'image.png'.removesuffix('.png'))
print("'hello'.removeprefix('x'):", 'hello'.removeprefix('x'))
# 对比 lstrip
print("'test_test'.lstrip('test_'):", repr('test_test'.lstrip('test_')))
print("'test_test'.removeprefix('test_'):", repr('test_test'.removeprefix('test_')))

# ---- 8. 查找与计数 ----
print("\\n========== 8. 查找与计数 ==========")
s = 'hello world'
print(f"'{s}'.find('o'):", s.find('o'))
print(f"'{s}'.rfind('o'):", s.rfind('o'))
print(f"'{s}'.count('l'):", s.count('l'))
print(f"'{s}'.count('o'):", s.count('o'))
print("'abc.txt'.endswith(('.jpg','.png','.txt')):", 'abc.txt'.endswith(('.jpg','.png','.txt')))

# ---- 9. 判断方法 ----
print("\\n========== 9. 判断方法 ==========")
print("'123'.isdigit():", '123'.isdigit())
print("'abc'.isalpha():", 'abc'.isalpha())
print("'一二三'.isnumeric():", '一二三'.isnumeric())
print("'   '.isspace():", '   '.isspace())
print("'Hello World'.istitle():", 'Hello World'.istitle())
print("'²'.isdigit():", '²'.isdigit(), "(上标数字)")

# ---- 10. f-string 高级格式化 ----
print("\\n========== 10. f-string 高级格式化 ==========")
print(f"{'hello':<10}|")        # 左对齐
print(f"{'hello':>10}|")        # 右对齐
print(f"{'hello':^10}|")        # 居中
print(f"{'hello':->10}|")       # 用-填充
print(f"{255:x}, {255:#x}, {255:b}, {255:o}")   # 进制
print(f"{3.14159:.2f}, {3.14159:.4e}, {0.875:.2%}")  # 浮点
print(f"{1234567:,}, {1234567:_}")    # 千分位
print(f"{42:08d}, {42:+d}")            # 补零、符号
# 日期格式化
from datetime import datetime
now = datetime.now()
print(f"现在: {now:%Y-%m-%d %H:%M:%S}")
print(f"星期: {now:%A}")
# debug 语法
name = "张三"
age = 28
print(f"{name=}, {age=}")
print(f"{age=:.2f}")
print(f"{1+1=}")
# 嵌套
width = 12
print(f"{'hi':^{width}}")

# ---- 11. 字符串性能对比 ----
print("\\n========== 11. 字符串性能 ==========")
# join vs +
def join_way():
    return ''.join(str(i) for i in range(1000))
def plus_way():
    s = ''
    for i in range(1000):
        s += str(i)
    return s
t_join = timeit.timeit(join_way, number=100)
t_plus = timeit.timeit(plus_way, number=100)
print(f"join 耗时: {t_join:.4f}s")
print(f"plus 耗时: {t_plus:.4f}s")
print(f"plus/join 比值: {t_plus/t_join:.1f}x")

# StringIO 流式生成
buf = StringIO()
for i in range(5):
    buf.write(f"第{i}行\\n")
print("StringIO 结果:")
print(buf.getvalue(), end="")

# ---- 12. 文本清洗 ----
print("\\n========== 12. 文本清洗 ==========")
def clean_text(text):
    text = unicodedata.normalize('NFKC', text)   # 全角转半角
    text = re.sub(r'\\s+', ' ', text)            # 合并空白
    return text.strip()
raw = "  Ｈello   世界  \\n  Python  "
print("原始:", repr(raw))
print("清洗:", repr(clean_text(raw)))

# ---- 13. 词频统计 ----
print("\\n========== 13. 词频统计 ==========")
text = "the cat sat on the mat the cat ate the rat the cat ran"
words = re.findall(r'\\w+', text.lower())
freq = Counter(words)
print("词频前 3:", freq.most_common(3))
print("cat 出现次数:", freq['cat'])

# ---- 14. 模板替换 ----
print("\\n========== 14. 模板替换 ==========")
tmpl = Template("亲爱的\${user}，您的会员将于\${date}到期，请及时续费。")
print(tmpl.substitute(user="张三", date="2024-12-31"))

# ---- 15. 提取信息 ----
print("\\n========== 15. 提取信息 ==========")
info = "联系方式：电话 138-1234-5678，邮箱 abc@example.com，邮编 100000"
phones = re.findall(r'\\d{3}-\\d{4}-\\d{4}', info)
emails = re.findall(r'[\\w.]+@[\\w.]+', info)
print("电话:", phones)
print("邮箱:", emails)

# ---- 16. 表格生成 ----
print("\\n========== 16. 表格生成 ==========")
def make_table(headers, rows):
    widths = [max(len(str(h)), max((len(str(r[i])) for r in rows), default=0))
              for i, h in enumerate(headers)]
    sep = '+' + '+'.join('-' * (w + 2) for w in widths) + '+'
    head = '|' + '|'.join(f' {str(h):^{widths[i]}} ' for i, h in enumerate(headers)) + '|'
    out = [sep, head, sep]
    for row in rows:
        out.append('|' + '|'.join(f' {str(r):^{widths[i]}} ' for i, r in enumerate(row)) + '|')
    out.append(sep)
    return '\\n'.join(out)
print(make_table(['姓名', '年龄', '城市'], [['张三', 28, '北京'], ['李四', 35, '上海']]))

# ---- 17. 字符串长度与编码 ----
print("\\n========== 17. 字符串与编码 ==========")
s = '你好Python'
print(f"'{s}' 字符数: {len(s)}")
print(f"UTF-8 字节数: {len(s.encode('utf-8'))}")
print(f"GBK 字节数: {len(s.encode('gbk'))}")
# 切片不会切断多字节字符
print(f"s[:6]: {s[:6]}, s[6:]: {s[6:]}")

# ---- 18. 其他实用方法 ----
print("\\n========== 18. 其他实用方法 ==========")
print("'a\\nb\\nc'.splitlines():", 'a\\nb\\nc'.splitlines())
print("'Hello World'.swapcase():", 'Hello World'.swapcase())
print("'hello world'.title():", 'hello world'.title())
print("'Straße'.casefold():", 'Straße'.casefold(), "== strasse:", 'Straße'.casefold() == 'strasse')
data = {'name': '张三', 'age': 28}
print("format_map:", '{name}今年{age}岁'.format_map(data))

# ---- 19. 其他格式化方法 % 与 format ----
print("\\n========== 19. % 与 format 格式化 ==========")
print("我叫 %s，今年 %d 岁" % ('张三', 28))
print("%.2f" % 3.14159)
print("%010.2f" % 3.14)
print("%x, %o, %e" % (255, 8, 12345.678))
print('{}今年{}岁'.format('张三', 28))
print('{0}爱{0}'.format('我'))
print('{name}今年{age}岁'.format(name='李四', age=30))
print('{:>10}|'.format('hi'))
print('{:.2f}'.format(3.14159))
print('{:,}'.format(1234567))

# ---- 20. split 详解 ----
print("\\n========== 20. split 详解 ==========")
print("'a  b   c'.split():", 'a  b   c'.split())
print("'a  b   c'.split(' '):", 'a  b   c'.split(' '))
print("'a,b,c,d'.split(',', 2):", 'a,b,c,d'.split(',', 2))
print("'a,b,c'.rsplit(',', 1):", 'a,b,c'.rsplit(',', 1))
# 解析 CSV 行
line = '张三,28,北京,程序员'
print("CSV 解析:", line.split(','))

# ---- 21. 正则表达式入门 ----
print("\\n========== 21. 正则表达式 ==========")
info = '电话: 138-1234-5678, 邮箱: a@b.com, 邮编 100000'
m = re.search(r'\\d{3}-\\d{4}-\\d{4}', info)
if m:
    print(f"找到电话: {m.group()}, 位置 {m.start()}-{m.end()}")
print("所有数字:", re.findall(r'\\d+', info))
print("数字脱敏:", re.sub(r'\\d', '*', info))
# 分组
m2 = re.search(r'(\\d{4})-(\\d{2})-(\\d{2})', '2024-01-15')
if m2:
    print(f"日期: 年={m2.group(1)}, 月={m2.group(2)}, 日={m2.group(3)}")
# 命名分组
m3 = re.search(r'(?P<year>\\d{4})-(?P<month>\\d{2})', '2024-01')
if m3:
    print(f"命名分组: year={m3.group('year')}, month={m3.group('month')}")
# 预编译
phone_re = re.compile(r'\\d{3}-\\d{4}-\\d{4}')
print("预编译查找:", phone_re.findall('138-1234-5678 和 139-0000-1111'))

# ---- 22. 字符串驻留 intern ----
print("\\n========== 22. intern 驻留 ==========")
import sys
a = 'hello_world'
b = 'hello_world'
print("标识符规则自动驻留:", a is b)
c = 'hello world!'
d = 'hello world!'
print("含空格不驻留:", c is d)
s1 = sys.intern('hello world!')
s2 = sys.intern('hello world!')
print("手动 intern 后:", s1 is s2)
print("空字符串内存:", sys.getsizeof(''), "字节")
print("'a' 内存:", sys.getsizeof('a'), "字节")
print("'中' 内存:", sys.getsizeof('中'), "字节")

# ---- 23. 实战：驼峰转换 ----
print("\\n========== 23. 驼峰转换 ==========")
def snake_to_camel(snake):
    parts = snake.split('_')
    return parts[0] + ''.join(p.capitalize() for p in parts[1:])

def camel_to_snake(camel):
    return re.sub(r'(?<!^)(?=[A-Z])', '_', camel).lower()

print("snake_to_camel('hello_world_foo'):", snake_to_camel('hello_world_foo'))
print("camel_to_snake('helloWorldFoo'):", camel_to_snake('helloWorldFoo'))

# ---- 24. 实战：对齐表格 ----
print("\\n========== 24. 对齐表格 ==========")
def align_table(rows):
    cols = list(zip(*rows))
    widths = [max(len(str(c)) for c in col) for col in cols]
    for row in rows:
        print(' | '.join(str(c).ljust(widths[i]) for i, c in enumerate(row)))
align_table([['姓名', '年龄', '城市'], ['张三', '28', '北京'], ['李四', '35', '上海']])

# ---- 25. 实战：脱敏处理 ----
print("\\n========== 25. 脱敏处理 ==========")
def mask_phone(phone):
    return phone[:3] + '****' + phone[-4:]
def mask_id(id_card):
    return id_card[:6] + '*' * 8 + id_card[-4:]
print("手机脱敏:", mask_phone('13812345678'))
print("身份证脱敏:", mask_id('110101199001011234'))

# ---- 26. 字符串反转 ----
print("\\n========== 26. 字符串反转 ==========")
s = 'hello'
print("切片反转:", s[::-1])
print("reversed:", ''.join(reversed(s)))

print("\\n字符串高级处理演示完成！")
`,
  },
  // =========================================================
  // 第三章：字节与编码
  // =========================================================
  {
    id: "py-bytes-encoding",
    group: "基础深化",
    icon: "🔡",
    title: "字节与编码",
    content: `## 字节与编码

字符串（\`str\`）和字节（\`bytes\`）是 Python 中两种不同的二进制数据表示。在前面"字符串"相关章节里，我们处理的都是 \`str\`（Unicode 文本）。但在文件读写、网络通信、加密解密、二进制协议解析等场景中，必须处理**原始字节**。理解**编码（encoding）**——文本与字节之间的转换规则——是每个 Python 程序员的必备知识。

本章将系统讲解 \`bytes\`/\`bytearray\`/\`memoryview\` 三种字节类型、ASCII/Unicode/UTF-8/GBK 等编码原理、\`encode\`/\`decode\` 的细节、BOM 字节序、\`base64\` 与 \`hex\` 编码、\`struct\` 二进制打包解包，以及二进制文件的读写。

---

## 一、str 与 bytes：文本与字节

### 1.1 两种类型的本质区别

| 类型 | 含义 | 元素 | 字面量 | 可变性 |
| --- | --- | --- | --- | --- |
| \`str\` | Unicode 文本 | 字符（码点） | \`'hello'\` | 不可变 |
| \`bytes\` | 字节序列 | 0-255 的整数 | \`b'hello'\` | 不可变 |
| \`bytearray\` | 字节序列 | 0-255 的整数 | \`bytearray(b'...')\` | 可变 |

\`\`\`python
>>> s = '你好'           # str，2 个字符
>>> b = s.encode('utf-8')  # bytes，6 个字节
>>> b
b'\\xe4\\xbd\\xa0\\xe5\\xa5\\xbd'
>>> len(s), len(b)
(2, 6)
>>> type(s), type(b)
(<class 'str'>, <class 'bytes'>)
\`\`\`

\`str\` 的 \`len()\` 是字符数，\`bytes\` 的 \`len()\` 是字节数。

### 1.2 bytes 字面量

\`bytes\` 字面量用 \`b\` 前缀，内容只能是 ASCII 字符或转义序列：

\`\`\`python
>>> b'hello'           # ASCII 字符
>>> b'\\x41\\x42'        # 十六进制转义，= b'AB'
>>> b'\\x00\\x01\\xff'    # 任意字节
>>> bytes([65, 66, 67])  # = b'ABC'，从整数列表构造
>>> bytes(5)           # b'\\x00\\x00\\x00\\x00\\x00'，5 个零字节
\`\`\`

### 1.3 bytearray 可变字节

\`bytearray\` 是 \`bytes\` 的可变版本，支持类似列表的修改：

\`\`\`python
>>> ba = bytearray(b'hello')
>>> ba[0] = 72         # 修改单个字节（'H' 的 ASCII 码）
>>> ba.append(33)      # 追加 '!'
>>> ba
bytearray(b'Hello!')               # 调用 bytearray，参数 b'Hello!'
\`\`\`

\`bytearray\` 适合需要频繁修改字节数据的场景（如构建网络数据包、缓冲区）。

### 1.4 memoryview 内存视图

\`memoryview\` 创建一个对原始字节数据的"视图"，**不复制数据**就能切片和访问，适合处理大块二进制数据时避免内存拷贝：

\`\`\`python
>>> data = bytearray(b'hello world')
>>> mv = memoryview(data)
>>> mv[0]              # 104，访问不复制
>>> mv[0:5]            # <memory at 0x...>，切片仍是视图
>>> bytes(mv[0:5])     # b'hello'，转回 bytes
>>> mv[0] = 72         # 修改视图会反映到原数据
\`\`\`

\`memoryview\` 在处理大文件、零拷贝网络传输时能显著提升性能。

---

## 二、编码原理：ASCII / Unicode / UTF-8 / GBK

### 2.1 ASCII 编码

**ASCII**（American Standard Code for Information Interchange）是最早的字符编码，用 **7 位二进制**表示 128 个字符：英文字母、数字、标点、控制字符。

\`\`\`python
>>> ord('A')    # 65，字符 → 码点
>>> chr(65)     # 'A'，码点 → 字符
>>> ord('0')    # 48
>>> ord(' ')    # 32
\`\`\`

ASCII 只能表示英文，无法表示中文、日文、emoji 等。

### 2.2 Unicode 统一码

**Unicode** 是一个字符集标准，为世界上几乎所有文字的每个字符分配一个唯一编号（码点 code point），范围从 \`U+0000\` 到 \`U+10FFFF\`（约 110 万个码位）。Python 3 的 \`str\` 就是 Unicode 字符串。

\`\`\`python
>>> ord('中')       # 20013，'中' 的 Unicode 码点
>>> hex(ord('中'))   # '0x4e2d'
>>> chr(0x4e2d)      # '中'
>>> ord('😀')        # 128512，emoji 也在 Unicode 中
\`\`\`

Unicode 只是"编号表"，**具体如何用字节存储**由"编码方案"（UTF-8、UTF-16 等）决定。

### 2.3 UTF-8 编码

**UTF-8** 是 Unicode 的变长编码方案，使用 1-4 个字节表示一个字符：

| 字符范围 | 字节数 | 编码格式 |
| --- | --- | --- |
| U+0000 ~ U+007F（ASCII） | 1 | \`0xxxxxxx\` |
| U+0080 ~ U+07FF | 2 | \`110xxxxx 10xxxxxx\` |
| U+0800 ~ U+FFFF（含中文） | 3 | \`1110xxxx 10xxxxxx 10xxxxxx\` |
| U+10000 ~ U+10FFFF（emoji） | 4 | \`11110xxx 10xxxxxx 10xxxxxx 10xxxxxx\` |

UTF-8 的优点：
- **兼容 ASCII**：纯英文文本与 ASCII 完全相同，节省空间
- **变长**：英文 1 字节，中文 3 字节，按需分配
- **自同步**：即使丢一个字节也能找到下一个字符起点
- **无字节序问题**：不需要 BOM

UTF-8 是**互联网事实标准**，HTML、JSON、XML 默认都用 UTF-8。

\`\`\`python
>>> 'A'.encode('utf-8')    # b'A'，1 字节
>>> '中'.encode('utf-8')   # b'\\xe4\\xbd\\xa0'，3 字节
>>> '😀'.encode('utf-8')   # b'\\xf0\\x9f\\x98\\x80'，4 字节
\`\`\`

### 2.4 UTF-16 与 UTF-32

- **UTF-16**：大部分字符用 2 字节，辅助平面字符用 4 字节。有字节序问题（大端/小端），需要 BOM。
- **UTF-32**：每个字符固定 4 字节，浪费空间但定位快。

\`\`\`python
>>> 'A'.encode('utf-16')   # b'\\xff\\xfeA\\x00'（带 BOM，2+2 字节）
>>> '中'.encode('utf-32')  # b'\\xff\\xfe\\x00\\x00\\x2d\\x4e\\x00\\x00'
\`\`\`

### 2.5 GBK / GB2312（中文编码）

**GBK** 是中文 Windows 系统常用的编码，每个中文用 **2 字节**（比 UTF-8 的 3 字节省空间）：

\`\`\`python
>>> '中'.encode('gbk')    # b'\\xd6\\xd0'，2 字节
>>> '中'.encode('utf-8')  # b'\\xe4\\xbd\\xa0'，3 字节
\`\`\`

GBK 的局限：只能表示中文和少量符号，国际通用性差。新项目应统一用 UTF-8。常见的中文乱码问题，基本都是 GBK 和 UTF-8 混用导致的。

### 2.6 编码方案对比

| 编码 | 中文字节 | 兼容 ASCII | 字节序 | 适用场景 |
| --- | --- | --- | --- | --- |
| ASCII | 不支持 | 是 | 无 | 纯英文 |
| UTF-8 | 3 | 是 | 无 | 通用（推荐） |
| UTF-16 | 2(或4) | 否 | 有(BOM) | Windows 内部 |
| UTF-32 | 4 | 否 | 有(BOM) | 罕用 |
| GBK | 2 | 否 | 无 | 中文 Windows |

---

## 三、encode 与 decode 详解

### 3.1 基本转换

\`\`\`python
# 编码：str → bytes
b = '你好'.encode('utf-8')           # 将字符串 '你好'.encode('utf-8') 赋给 b
# 解码：bytes → str
s = b.decode('utf-8')              # 将 b.decode('utf-8') 赋给 s
\`\`\`

编码和解码必须用**同一种编码**，否则会乱码或报错。

### 3.2 错误处理参数 errors

\`encode\`/\`decode\` 都接受 \`errors\` 参数，控制遇到无法编码/解码的字符时的行为：

| errors 值 | 行为 |
| --- | --- |
| \`'strict'\`（默认） | 抛 \`UnicodeDecodeError\` |
| \`'ignore'\` | 忽略错误字符 |
| \`'replace'\` | 用 ? 或 \\ufffd 替换 |
| \`'backslashreplace'\` | 用 \\xXX 转义替换 |
| \`'xmlcharrefreplace'\` | 用 XML 实体替换（&#NNN;） |

\`\`\`python
>>> b'\\x80abc'.decode('utf-8', errors='ignore')      # 'abc'
>>> b'\\x80abc'.decode('utf-8', errors='replace')     # '�abc'
>>> b'\\x80abc'.decode('utf-8', errors='backslashreplace')  # '\\x80abc'
\`\`\`

### 3.3 常见乱码问题

\`\`\`python
# 用 GBK 解码 UTF-8 编码的中文 → 乱码
s = '你好'                           # 将字符串 '你好' 赋给 s
utf8_bytes = s.encode('utf-8')     # 将 s.encode('utf-8') 赋给 utf8_bytes
wrong = utf8_bytes.decode('gbk')        # '浣犲ソ'（乱码）
right = utf8_bytes.decode('utf-8')      # '你好'
\`\`\`

处理乱码的思路：先确定原始字节是用什么编码的，再用对应编码解码。

### 3.4 chardet 检测编码（第三方）

标准库没有编码检测功能，第三方库 \`chardet\` 可以猜测字节流的编码：

\`\`\`python
import chardet   # 需 pip install chardet
raw = b'\\xe4\\xbd\\xa0\\xe5\\xa5\\xbd'  # 将 b'\\xe4\\xbd\\xa0\\xe5\\xa5\\xbd' 赋给 raw
print(chardet.detect(raw))   # {'encoding': 'utf-8', 'confidence': 0.75}
\`\`\`

---

## 四、codecs 模块

\`codecs\` 模块提供更底层的编码/解码接口，支持流式编码、注册自定义编码等。

### 4.1 codecs.open 读写文件

\`\`\`python
import codecs                      # 导入 codecs 模块
# 用指定编码打开文件，自动处理编解码
with codecs.open('file.txt', 'r', encoding='utf-8') as f:  # 使用上下文管理器 codecs.open('file.txt', 'r', encoding='utf-8')，绑定到 f
    text = f.read()                # 将 f.read() 赋给 text
\`\`\`

Python 3 内置的 \`open()\` 已经支持 \`encoding\` 参数，通常不需要 \`codecs.open\`，但 \`codecs\` 提供了更多控制。

### 4.2 codecs.lookup 查询编码

\`\`\`python
>>> import codecs
>>> codecs.lookup('utf-8')
<codecs.CodecInfo object for encoding utf-8>
>>> 'utf-8'.upper()   # 编码名大小写不敏感
\`\`\`

### 4.3 流式编解码

\`\`\`python
import codecs                      # 导入 codecs 模块
# 创建增量编码器/解码器，处理流式数据
encoder = codecs.getencoder('utf-8')  # 将 codecs.getencoder('utf-8') 赋给 encoder
data, length = encoder('你好')
print(data)   # b'\\xe4\\xbd\\xa0\\xe5\\xa5\\xbd'
\`\`\`

---

## 五、BOM 字节序标记

### 5.1 什么是 BOM

**BOM（Byte Order Mark）**是 Unicode 编码开头的特殊字节序列，用于：
1. 标识文本的编码类型（UTF-8/UTF-16/UTF-32）
2. 标识字节序（大端 big-endian 还是小端 little-endian）

| 编码 | BOM 字节 |
| --- | --- |
| UTF-8 | \`\\xef\\xbb\\xbf\` |
| UTF-16 LE（小端） | \`\\xff\\xfe\` |
| UTF-16 BE（大端） | \`\\xfe\\xff\` |
| UTF-32 LE | \`\\xff\\xfe\\x00\\x00\` |

### 5.2 UTF-8 的 BOM

UTF-8 本身没有字节序问题，但有些 Windows 软件（如记事本）会在 UTF-8 文件开头加 BOM（\`\\xef\\xbb\\xbf\`），导致读取时多出不可见字符。

\`\`\`python
# 带 BOM 的 UTF-8
>>> 'A'.encode('utf-8-sig')   # b'\\xef\\xbb\\xbfA'
>>> 'A'.encode('utf-8')        # b'A'
# 用 utf-8-sig 解码会自动去掉 BOM
>>> b'\\xef\\xbb\\xbfA'.decode('utf-8-sig')   # 'A'
>>> b'\\xef\\xbb\\xbfA'.decode('utf-8')        # '\\ufeffA'（BOM 留在字符串里）
\`\`\`

处理 Windows 生成的文本文件时，用 \`utf-8-sig\` 编码可以自动处理 BOM。

### 5.3 字节序问题

UTF-16 用 2 字节存一个字符，有大端（高位在前）和小端（低位在前）之分：

\`\`\`python
>>> 'A'.encode('utf-16-le')   # b'A\\x00'，小端
>>> 'A'.encode('utf-16-be')   # b'\\x00A'，大端
\`\`\`

---

## 六、base64 编码

### 6.1 为什么需要 base64

二进制数据（如图片、加密密钥）无法直接放在文本协议（如 JSON、URL、邮件）中传输，需要把字节转换成**纯 ASCII 字符**。\`base64\` 把每 3 字节编码成 4 个 ASCII 字符（A-Z, a-z, 0-9, +, /），末尾用 \`=\` 补齐。

\`\`\`python
import base64                      # 导入 base64 模块
# 编码
data = b'hello'                    # 将 b'hello' 赋给 data
encoded = base64.b64encode(data)   # b'aGVsbG8='
# 解码
decoded = base64.b64decode(encoded)  # b'hello'
\`\`\`

### 6.2 字符串的 base64

base64 操作的是 bytes，对字符串要先编码：

\`\`\`python
import base64                      # 导入 base64 模块
s = '你好'                           # 将字符串 '你好' 赋给 s
encoded = base64.b64encode(s.encode('utf-8'))   # b'5L2g5aW9'
decoded = base64.b64decode(encoded).decode('utf-8')  # '你好'
\`\`\`

### 6.3 URL 安全的 base64

标准 base64 含 \`+\`/\`/\` 字符，不能直接放 URL。用 \`urlsafe_b64encode\` 替换为 \`-\`/\`_\`：

\`\`\`python
>>> base64.urlsafe_b64encode(b'\\xfb\\xff')   # b'-_8='
>>> base64.b64encode(b'\\xfb\\xff')           # b'+/8='
\`\`\`

### 6.4 base32 与 base16

\`\`\`python
>>> base64.b32encode(b'hello')   # b'NBSWY3DP'
>>> base64.b16encode(b'hello')   # b'68656C6C6F'（即 hex 编码，大写）
\`\`\`

base32 用 A-Z, 2-7（不区分大小写、不易混淆），base16 就是十六进制。

---

## 七、hex 编码

把字节的每个十六进制值转成两个 ASCII 字符：

\`\`\`python
>>> b'hello'.hex()        # '68656c6c6f'
>>> bytes.fromhex('68656c6c6f')   # b'hello'
>>> b'\\x00\\xff'.hex()    # '00ff'
\`\`\`

\`bytes.hex()\` 返回字符串，\`bytes.fromhex()\` 反向解析。hex 编码常用于显示二进制数据的摘要（如哈希值、MAC 地址）。

\`\`\`python
import binascii                    # 导入 binascii 模块
>>> binascii.hexlify(b'hello')   # b'68656c6c6f'（返回 bytes）
>>> binascii.unhexlify(b'68656c6c6f')  # b'hello'
\`\`\`

\`binascii\` 模块提供更底层的 hex/base64 转换函数。

---

## 八、struct 模块：二进制打包解包

\`struct\` 模块用于在 Python 与 C 语言二进制数据之间转换，常用于解析二进制文件格式（如 BMP、WAV）、网络协议、二进制通信。

### 8.1 格式字符

| 字符 | C 类型 | Python 类型 | 大小 |
| --- | --- | --- | --- |
| \`x\` | padding | 无 | 1 |
| \`c\` | char | bytes(1) | 1 |
| \`b\` / \`B\` | signed/unsigned char | int | 1 |
| \`h\` / \`H\` | short | int | 2 |
| \`i\` / \`I\` | int | int | 4 |
| \`l\` / \`L\` | long | int | 4 |
| \`q\` / \`Q\` | long long | int | 8 |
| \`f\` | float | float | 4 |
| \`d\` | double | float | 8 |
| \`s\` | char[] | bytes | 1 |

### 8.2 字节序前缀

格式字符串开头可加字节序前缀：

| 前缀 | 字节序 | 大小 | 对齐 |
| --- | --- | --- | --- |
| \`@\`（默认） | 本机 | 本机 | 本机 |
| \`<\` | 小端 | 标准 | 无 |
| \`>\` | 大端 | 标准 | 无 |
| \`=\` | 本机 | 标准 | 无 |
| \`!\` | 网络（=大端） | 标准 | 无 |

网络协议通常用 \`!\`（大端），Windows 文件多用 \`<\`（小端）。

### 8.3 pack 与 unpack

\`\`\`python
import struct                      # 导入 struct 模块
# 打包：把 Python 值转成 bytes
packed = struct.pack('<i', 1024)     # b'\\x04\\x00\\x00\\x00'，小端 4 字节整数
# 解包：把 bytes 转回 Python 值
value = struct.unpack('<i', packed)  # (1024,)
# 打包多个值
data = struct.pack('<2ihf', 1, 2, 3, 4.5)  # 2 个 int + 1 个 short + 1 个 float
values = struct.unpack('<2ihf', data)  # 将 struct.unpack('<2ihf', data) 赋给 values
\`\`\`

### 8.4 calcsize 计算大小

\`\`\`python
>>> struct.calcsize('<i')    # 4
>>> struct.calcsize('<2ihf') # 10
\`\`\`

### 8.5 实战：解析 BMP 文件头

\`\`\`python
import struct                      # 导入 struct 模块
with open('image.bmp', 'rb') as f: # 使用上下文管理器 open('image.bmp', 'rb')，绑定到 f
    header = f.read(54)            # 将 f.read(54) 赋给 header
    # BMP 文件头：2 字节签名 + 4 字节文件大小 + 4 字节保留 + 4 字节偏移
    signature, size, _, offset = struct.unpack('<2sI4xI', header[:14])
\`\`\`

### 8.6 字符串打包

\`s\` 格式打包定长字节串：

\`\`\`python
>>> struct.pack('6s', b'hello')   # b'hello\\x00'，补零到 6 字节
>>> struct.unpack('6s', b'hello\\x00')   # (b'hello\\x00',)
\`\`\`

---

## 九、字节串与字符串转换总结

### 9.1 转换关系图

\`\`\`
str  ──encode()──>  bytes  ──decode()──>  str
                       │
                       ├── hex() ──> str (十六进制文本)
                       ├── base64 ──> str (Base64 文本)
                       └── list(b) ──> [int] (整数列表)
\`\`\`

### 9.2 常用转换速查

\`\`\`python
# str <-> bytes
'abc'.encode()                    # b'abc'
b'abc'.decode()                   # 'abc'
# bytes <-> hex 字符串
b'abc'.hex()                      # '616263'
bytes.fromhex('616263')           # b'abc'
# bytes <-> base64
import base64                      # 导入 base64 模块
base64.b64encode(b'abc')          # b'YWJj'
base64.b64decode(b'YWJj')         # b'abc'
# bytes <-> int
int.from_bytes(b'\\x00\\x01', 'big')   # 1
(1).to_bytes(2, 'big')            # b'\\x00\\x01'
# bytes <-> list
list(b'abc')                      # [97, 98, 99]
bytes([97, 98, 99])               # b'abc'
\`\`\`

### 9.3 int 与 bytes 互转

\`\`\`python
>>> (255).to_bytes(2, 'big')      # b'\\x00\\xff'
>>> int.from_bytes(b'\\x00\\xff', 'big')  # 255
>>> (1024).to_bytes(4, 'little')  # b'\\x00\\x04\\x00\\x00'
\`\`\`

\`int.to_bytes(length, byteorder)\` 和 \`int.from_bytes(bytes, byteorder)\` 是整数与字节的直接转换方法。

---

## 十、二进制文件读写

### 10.1 读写模式

二进制文件用 \`'rb'\`/\`'wb'\`/\`'ab'\` 模式打开，读写的是 \`bytes\` 而非 \`str\`：

\`\`\`python
# 写二进制
with open('data.bin', 'wb') as f:  # 使用上下文管理器 open('data.bin', 'wb')，绑定到 f
    f.write(b'\\x00\\x01\\x02\\x03')  # 对 f 调用 write 方法，参数 b'\\x00\\x01\\x02\\x03'
    f.write(bytes([4, 5, 6]))      # 对 f 调用 write 方法，参数 bytes([4, 5, 6])
# 读二进制
with open('data.bin', 'rb') as f:  # 使用上下文管理器 open('data.bin', 'rb')，绑定到 f
    data = f.read()      # b'\\x00\\x01\\x02\\x03\\x04\\x05\\x06'
    f.seek(0)            # 回到开头
    first_byte = f.read(1)  # b'\\x00'
\`\`\`

### 10.2 seek 与 tell 定位

\`\`\`python
with open('data.bin', 'rb') as f:  # 使用上下文管理器 open('data.bin', 'rb')，绑定到 f
    f.seek(2)            # 移动到第 2 字节
    print(f.tell())      # 2，当前位置
    print(f.read(2))     # 读 2 字节
\`\`\`

\`seek(offset, whence)\` 的 \`whence\`：0=开头（默认），1=当前，2=末尾。

### 10.3 struct 读写二进制结构

\`\`\`python
import struct                      # 导入 struct 模块
# 写入结构化数据
with open('record.bin', 'wb') as f:  # 使用上下文管理器 open('record.bin', 'wb')，绑定到 f
    f.write(struct.pack('<i10s', 42, b'hello'))  # 对 f 调用 write 方法，参数 struct.pack('<i10s', 42, b'hello')
# 读回
with open('record.bin', 'rb') as f:  # 使用上下文管理器 open('record.bin', 'rb')，绑定到 f
    data = f.read()                # 将 f.read() 赋给 data
    num, name = struct.unpack('<i10s', data)
\`\`\`

### 10.4 大文件分块读写

\`\`\`python
with open('big.bin', 'rb') as f:   # 使用上下文管理器 open('big.bin', 'rb')，绑定到 f
    while True:                    # 当 True 为真时重复执行
        chunk = f.read(4096)   # 每次读 4KB
        if not chunk:              # 如果 not chunk 成立
            break                  # 跳出循环
        process(chunk)             # 调用 process，参数 chunk
\`\`\`

分块读取避免一次性加载大文件到内存。

---

## 十一、编码实战案例

### 11.1 字符串摘要显示

\`\`\`python
import hashlib                     # 导入 hashlib 模块
text = 'hello'                     # 将字符串 'hello' 赋给 text
digest = hashlib.md5(text.encode()).hexdigest()  # 将 hashlib.md5(text.encode()).hexdigest() 赋给 digest
print(digest)   # 5d41402abc4b2a76b9719d911017c592
\`\`\`

哈希函数（md5/sha256）操作的是 bytes，所以字符串要先 \`encode\`。

### 11.2 安全的 token 生成

\`\`\`python
import secrets                     # 导入 secrets 模块
token = secrets.token_bytes(16)        # 16 字节随机
token_hex = token.hex()                # 32 字符十六进制
token_b64 = __import__('base64').b64encode(token).decode()  # 将 __import__('base64').b64encode(token).decode() 赋给 token_b64
\`\`\`

### 11.3 简单加密（XOR）

\`\`\`python
def xor(data, key):                # 定义函数 xor，参数：data, key
    return bytes(b ^ key for b in data)  # 返回 bytes(b ^ key for b in data)

encrypted = xor(b'hello', 123)     # 将 xor(b'hello', 123) 赋给 encrypted
decrypted = xor(encrypted, 123)   # XOR 两次还原
\`\`\`

---

## 十二、常见陷阱与最佳实践

### 12.1 陷阱：文本文件与二进制文件混淆

\`\`\`python
# 错误：用文本模式读二进制文件会报错
with open('image.png', 'r') as f:   # UnicodeDecodeError！
    f.read()                       # 对 f 调用 read 方法
# 正确：二进制文件必须用 'rb'
with open('image.png', 'rb') as f: # 使用上下文管理器 open('image.png', 'rb')，绑定到 f
    data = f.read()                # 将 f.read() 赋给 data
\`\`\`

### 12.2 陷阱：编码不一致

写入用 UTF-8，读取用 GBK，就会乱码。**统一使用 UTF-8** 是最佳实践。

### 12.3 陷阱：str 和 bytes 混用

\`\`\`python
>>> 'abc' + b'xyz'   # TypeError，不能直接拼接 str 和 bytes
>>> 'abc' + b'xyz'.decode()   # 'abcxyz'，要先 decode
\`\`\`

### 12.4 最佳实践

1. **内部一律用 str**：程序内部处理文本用 Unicode 字符串
2. **边界处编解码**：在读写文件、网络收发等"边界"处进行 encode/decode
3. **统一 UTF-8**：所有文本文件都用 UTF-8 编码
4. **二进制用 bytes**：图片、音视频、加密数据用 bytes 处理
5. **明确指定 encoding**：\`open()\` 时显式写 \`encoding='utf-8'\`，不依赖系统默认

---

## 十三、总结对比表

### 字节类型对比

| 类型 | 可变 | 用途 |
| --- | --- | --- |
| \`bytes\` | 否 | 不可变字节序列（最常用） |
| \`bytearray\` | 是 | 需要修改的字节序列 |
| \`memoryview\` | 视图 | 零拷贝访问大块数据 |

### 编码方案对比

| 编码 | 中文 | 兼容 ASCII | BOM | 推荐 |
| --- | --- | --- | --- | --- |
| UTF-8 | 3 字节 | 是 | 可选 | ⭐⭐⭐⭐⭐ |
| GBK | 2 字节 | 否 | 无 | ⭐⭐（旧系统） |
| UTF-16 | 2 字节 | 否 | 必需 | ⭐⭐ |

---

## 八、编码陷阱与排错实战

### 8.1 经典的 UnicodeDecodeError

读文件、解码字节时最常见的错误就是 \`UnicodeDecodeError\`。它的根本原因是：**用错误的编码去解码字节序列**。比如把一个 GBK 编码的字节流用 UTF-8 解码，就会抛异常。

\`\`\`python
# 假设 b_gbk 是 GBK 编码的"你好"
b_gbk = '你好'.encode('gbk')   # b'\\xc4\\xe3\\xba\\xc3'
b_gbk.decode('utf-8')          # ❌ UnicodeDecodeError
# 'utf-8' codec can't decode byte 0xc4 in position 0: invalid continuation byte
\`\`\`

### 8.2 错误处理策略 errors 参数

\`encode()\` / \`decode()\` 都接受 \`errors\` 参数，控制遇到无法编解码的字符时怎么办：

| errors 值 | 行为 |
| --- | --- |
| \`'strict'\` | 抛 UnicodeDecodeError（默认） |
| \`'ignore'\` | 直接跳过无法处理的字节/字符 |
| \`'replace'\` | 用 ? 或 \\ufffd 替换 |
| \`'backslashreplace'\` | 用 \\xNN 转义序列替换 |
| \`'namereplace'\` | 用 \\N{名字} 替换 |
| \`'xmlcharrefreplace'\` | 用 &#数字; 替换（XML 实体） |

\`\`\`python
>>> b_gbk = '你好'.encode('gbk')
>>> b_gbk.decode('utf-8', errors='ignore')      # ''（全部跳过）
>>> b_gbk.decode('utf-8', errors='replace')     # '□□'（替换）
>>> b_gbk.decode('utf-8', errors='backslashreplace')  # '\\xc4\\xe3\\xba\\xc3'
\`\`\`

**实战建议**：处理来源不明的文本时，\`errors='replace'\` 能保证程序不崩溃，但会丢失信息；最好先用 \`chardet\`（第三方库）或 \`codecs\` 检测编码。

### 8.3 半个汉字问题

UTF-8 中一个汉字是 3 字节。如果按固定字节切块（比如每 4 字节切一段），可能把一个汉字从中间切断，导致解码失败：

\`\`\`python
text = '你好世界'           # 4 个汉字，UTF-8 共 12 字节
b = text.encode('utf-8')           # 将 text.encode('utf-8') 赋给 b
# 错误：按 4 字节切，第 2 块是 "好" 的后 1 字节 + "世" 的前 3 字节
chunk = b[4:8]                     # 将 b[4:8] 赋给 chunk
chunk.decode('utf-8')      # ❌ 解码失败
chunk.decode('utf-8', errors='replace')  # '□世'
\`\`\`

解决方案：要么按字符切（\`text[:2]\`），要么用 \`codecs.iterdecode\` 流式解码（见下节）。

### 8.4 BOM 导致的 "首字符多一个不可见字符"

从 Windows 记事本保存的 UTF-8 文件常常带 BOM（\`\\xef\\xbb\\xbf\`）。读取后字符串开头会多出 \`\\ufeff\` 这个不可见字符，导致字符串比较失败：

\`\`\`python
# 带 BOM 的文件
content = '\\ufeffhello'           # 将字符串 '\\ufeffhello' 赋给 content
print(content == 'hello')          # False！
print(content.startswith('hello')) # False
print(repr(content))               # '\\ufeffhello'
# 解决：用 'utf-8-sig' 编码读写，会自动处理 BOM
\`\`\`

\`utf-8-sig\` 是带 BOM 的 UTF-8：读时自动去掉 BOM，写时自动加 BOM。**与 Windows 交换文件时推荐用 \`utf-8-sig\`**。

---

## 九、codecs 模块进阶

\`codecs\` 模块是 Python 编码系统的底层基础设施，\`open()\`、\`encode()\`、\`decode()\` 都基于它。

### 9.1 codecs.open 与内置 open

Python 3 的内置 \`open()\` 已经原生支持编码参数，所以一般不需要 \`codecs.open()\`。但 \`codecs\` 提供了一些高级能力：

\`\`\`python
import codecs                      # 导入 codecs 模块
# 流式解码：边读边解，适合处理大文件/网络流
with codecs.open('file.txt', 'r', 'utf-8', errors='replace') as f:  # 使用上下文管理器 codecs.open('file.txt', 'r', 'utf-8', errors='replace')，绑定到 f
    for line in f:                 # 遍历 f，每次取值赋给 line
        process(line)              # 调用 process，参数 line
\`\`\`

### 9.2 iterdecode / iterencode 流式编解码

当数据是分块到达（如网络流）时，\`codecs.iterdecode\` 能避免"切断多字节字符"的问题：

\`\`\`python
import codecs                      # 导入 codecs 模块
# 模拟分块到达的字节流
chunks = [b'\\xe4\\xbd\\xa0', b'\\xe5\\xa5\\xbd', b'\\xe4\\xb8\\x96\\xe7\\x95\\x8c']  # 创建列表并赋给 chunks
byte_iter = iter(chunks)           # 将 iter(chunks) 赋给 byte_iter
# 流式解码：即使某块切断了一个字符，也会缓存到下一块拼齐
for char in codecs.iterdecode(byte_iter, 'utf-8'):  # 遍历 codecs.iterdecode(byte_iter, 'utf-8')，每次取值赋给 char
    print(char, end='')   # 你好世界
\`\`\`

### 9.3 lookup 查询编码信息

\`\`\`python
>>> import codecs
>>> info = codecs.lookup('utf-8')
>>> info.name           # 'utf-8'
>>> info.encode('hi')   # (b'hi', 2)
>>> info.decode(b'hi')  # ('hi', 2)
\`\`\`

### 9.4 注册自定义编码

通过 \`codecs.register\` 可以注册自定义编码器（如 ROT13、自定义加密）。这是高级用法，日常很少需要，但了解其机制有助于理解 Python 编码系统的工作原理。

---

## 十、行尾符：\\r\\n vs \\n vs \\r

不同操作系统用不同的字符表示"换行"：

| 系统 | 行尾符 | 字符 |
| --- | --- | --- |
| Unix/Linux/macOS(现代) | \`\\n\` | LF |
| Windows | \`\\r\\n\` | CRLF |
| 老 Mac OS (9 及以前) | \`\\r\` | CR |

### 10.1 文本模式的行尾转换

用文本模式（\`'r'\`/\`'w'\`）打开文件时，Python 会自动把平台行尾符转成 \`\\n\`：

\`\`\`python
# Windows 上读 CRLF 文件，读到的是 \\n
# 写文件时，\\n 又自动转成 \\r\\n
with open('a.txt', 'w') as f:      # 使用上下文管理器 open('a.txt', 'w')，绑定到 f
    f.write('line1\\nline2\\n')    # 对 f 调用 write 方法，参数 'line1\\nline2\\n'
\`\`\`

### 10.2 universal newlines 与 newline 参数

\`open()\` 的 \`newline\` 参数控制行尾处理：

| newline 值 | 读模式 | 写模式 |
| --- | --- | --- |
| \`None\`（默认） | 任何行尾都转 \`\\n\` | \`\\n\` 转系统默认 |
| \`''\` | 不转换，保留原样 | 不转换 |
| \`'\\n'\` | 只按 \`\\n\` 切 | 不转换 |
| \`'\\r\\n'\` | 按 \`\\r\\n\` 切 | \`\\n\` 转 \`\\r\\n\` |

\`\`\`python
# 跨平台读 CSV / 配置文件，建议显式指定 newline=''
with open('data.csv', 'r', encoding='utf-8', newline='') as f:  # 使用上下文管理器 open('data.csv', 'r', encoding='utf-8', newline='')，绑定到 f
    ...
\`\`\`

### 10.3 os.linesep

\`os.linesep\` 是当前平台的行尾符（macOS/Linux 是 \`'\\n'\`，Windows 是 \`'\\r\\n'\`）。但**写文件时不要手动拼接 \`os.linesep\`**——文本模式会自动处理，手动拼接反而会导致 Windows 上出现 \`\\r\\r\\n\` 之类的错误。

---

## 十一、字符规范化：unicodedata.normalize

同一个"字符"在 Unicode 中可能有多种编码方式。比如字母 "é" 可以是：
- 一个组合字符 \`U+00E9\`（\`'\\xe9'\`）
- 字母 "e" + 组合重音 \`U+0301\`（\`'e\\u0301'\`）

两者看起来一样，但 \`len\` 不同、\`==\` 不相等，会导致字符串匹配失败。Unicode 定义了 4 种规范化形式：

| 形式 | 函数 | 含义 |
| --- | --- | --- |
| NFC | \`unicodedata.normalize('NFC', s)\` | 组合（默认推荐） |
| NFD | \`unicodedata.normalize('NFD', s)\` | 分解 |
| NFKC | \`unicodedata.normalize('NFKC', s)\` | 兼容性组合 |
| NFKD | \`unicodedata.normalize('NFKD', s)\` | 兼容性分解 |

\`\`\`python
>>> import unicodedata
>>> s1 = 'é'              # 1 个字符 U+00E9
>>> s2 = 'e\\u0301'        # 2 个字符 e + 重音
>>> s1 == s2              # False
>>> len(s1), len(s2)      # (1, 2)
>>> unicodedata.normalize('NFC', s2) == s1   # True
\`\`\`

**NFKC/NFKD 的"兼容性分解"会把全角字符转成半角**，适合搜索/去重：

\`\`\`python
>>> unicodedata.normalize('NFKC', '①')   # '1'
>>> unicodedata.normalize('NFKC', 'ＡＢＣ')   # 'ABC'（全角转半角）
>>> unicodedata.normalize('NFKC', 'ﬁ')       # 'fi'（连字拆开）
\`\`\`

---

## 十二、二进制协议设计入门

### 12.1 为什么要用二进制协议

文本协议（JSON、XML）可读性好但体积大。在性能敏感的场景（游戏、IoT、嵌入式通信），二进制协议更紧凑高效。设计二进制协议要解决三个问题：**字节序**、**定长 vs 变长**、**对齐**。

### 12.2 字节序（Endianness）

多字节整数在内存中的存放顺序有两种：

| 字节序 | 标记 | 说明 | 网络字节序 |
| --- | --- | --- | --- |
| 大端（Big-Endian） | \`>\` | 高位在前 | ✅ 网络协议标准 |
| 小端（Little-Endian） | \`<\` | 低位在前 | x86 CPU 默认 |
| 原生 | \`@\` 或无前缀 | 跟 CPU | 不跨平台 |

\`\`\`python
import struct                      # 导入 struct 模块
# 数字 1024 = 0x00000400
struct.pack('>I', 1024)   # b'\\x00\\x00\\x04\\x00'（大端）
struct.pack('<I', 1024)   # b'\\x04\\x00\\x00\\x00'（小端）
struct.pack('I', 1024)    # 跟本机，x86 上是小端
\`\`\`

### 12.3 定长 vs 变长字段

- **定长字段**：用 \`struct\` 打包，固定字节数（如 int 永远 4 字节）。简单高效。
- **变长字段**（如字符串）：通常用"长度前缀 + 数据"，比如先用 4 字节 int 表示字符串长度，再跟字符串字节。

\`\`\`python
def pack_string(s, encoding='utf-8'):  # 定义函数 pack_string，参数：s, encoding='utf-8'
    b = s.encode(encoding)         # 将 s.encode(encoding) 赋给 b
    return struct.pack('>I', len(b)) + b   # 4 字节长度 + 内容

def unpack_string(buf, offset=0):  # 定义函数 unpack_string，参数：buf, offset=0
    length = struct.unpack_from('>I', buf, offset)[0]  # 将 struct.unpack_from('>I', buf, offset)[0] 赋给 length
    start = offset + 4             # 将 offset + 4 赋给 start
    s = buf[start:start+length].decode('utf-8')  # 将 buf[start:start+length].decode('utf-8') 赋给 s
    return s, start + length       # 返回 s, start + length

data = pack_string('hello')        # 将 pack_string('hello') 赋给 data
print(data)   # b'\\x00\\x00\\x00\\x05hello'
s, _ = unpack_string(data)
print(s)      # hello
\`\`\`

### 12.4 struct 格式字符速查

| 字符 | C 类型 | Python | 大小 |
| --- | --- | --- | --- |
| \`x\` | pad byte | 无 | 1 |
| \`c\` | char | bytes(1) | 1 |
| \`b\`/ \`B\` | signed/unsigned char | int | 1 |
| \`h\`/ \`H\` | short | int | 2 |
| \`i\`/ \`I\` | int | int | 4 |
| \`q\`/ \`Q\` | long long | int | 8 |
| \`f\` | float | float | 4 |
| \`d\` | double | float | 8 |
| \`s\` | char[] | bytes | 1 |
| \`p\` | Pascal 字符串 | bytes | 1+N |

---

## 十三、性能与内存对比

### 13.1 bytes vs bytearray 性能

\`bytes\` 不可变，每次修改都要创建新对象；\`bytearray\` 可变，原地修改更快。**频繁拼接字节时用 \`bytearray\`**：

\`\`\`python
import time                        # 导入 time 模块
# 用 bytes 拼接（慢）
b = b''                            # 将 b'' 赋给 b
t0 = time.time()                   # 将 time.time() 赋给 t0
for _ in range(100000):            # 遍历 range(100000)，每次取值赋给 _
    b += b'ab'                     # b 加 b'ab'
print(f"bytes 拼接: {time.time()-t0:.3f}s")  # 输出 f"bytes 拼接: {time.time()-t0:.3f}s"

# 用 bytearray（快）
ba = bytearray()                   # 将 bytearray() 赋给 ba
t0 = time.time()                   # 将 time.time() 赋给 t0
for _ in range(100000):            # 遍历 range(100000)，每次取值赋给 _
    ba += b'ab'    # 或 ba.extend(b'ab')
print(f"bytearray 拼接: {time.time()-t0:.3f}s")  # 输出 f"bytearray 拼接: {time.time()-t0:.3f}s"
\`\`\`

### 13.2 memoryview 零拷贝

\`memoryview\` 让你不复制数据就能切片、修改大块字节。处理大文件/网络包时能显著省内存：

\`\`\`python
big = bytearray(10_000_000)   # 10MB
mv = memoryview(big)               # 将 memoryview(big) 赋给 mv
# 切片是视图，不复制
chunk = mv[1000:2000]              # 将 mv[1000:2000] 赋给 chunk
print(type(chunk))            # <class 'memoryview'>
chunk[0] = 255                # 直接改原数据
\`\`\`

---

## 十四、编码最佳实践速查

1. **所有文本都用 UTF-8**：除非要兼容古董系统，否则一律 UTF-8。
2. **永远显式指定 encoding**：\`open(f, encoding='utf-8')\`，别依赖系统默认（Windows 默认 GBK，会出 bug）。
3. **str ↔ bytes 边界要清晰**：进出的"门"（文件、网络、数据库）才做编解码，内部一律用 str。
4. **金额别用 float**：用 \`Decimal\` 或以"分"为单位的整数。
5. **二进制协议固定字节序**：跨平台一律用大端 \`>\`。
6. **处理未知编码加 errors 参数**：\`decode('utf-8', errors='replace')\` 防止崩溃。
7. **跨平台文件用 \`newline=''\`**：避免行尾符混乱。
8. **大块字节用 memoryview**：零拷贝省内存。

---

## 本节代码演示

下面这段代码综合演示了字节与编码的各个知识点：bytes/bytearray/memoryview、编码原理、encode/decode、BOM、base64/hex、struct 打包解包、二进制文件读写、编码转换实战。`,
    code: `# ============================================================
# 第三章代码演示：字节与编码
# ============================================================
# 本代码演示：bytes/bytearray/memoryview、编码原理、encode/decode、
# BOM、base64/hex、struct 打包解包、二进制文件读写、转换实战。

import base64
import binascii
import struct
import hashlib
import secrets
import os

# ---- 1. str 与 bytes ----
print("========== 1. str 与 bytes ==========")
s = '你好'
b = s.encode('utf-8')
print(f"str: {s}, len={len(s)}")
print(f"bytes: {b}, len={len(b)}")
print(f"type(str)={type(s).__name__}, type(bytes)={type(b).__name__}")

# bytes 字面量
print("b'hello':", b'hello')
print("bytes([65,66,67]):", bytes([65, 66, 67]))
print("bytes(3):", bytes(3))
print("b'\\\\x41\\\\x42':", b'\\x41\\x42')

# ord 与 chr
print(f"ord('A')={ord('A')}, chr(65)={chr(65)}")
print(f"ord('中')={ord('中')}, hex={hex(ord('中'))}")

# ---- 2. bytearray 可变字节 ----
print("\\n========== 2. bytearray ==========")
ba = bytearray(b'hello')
ba[0] = 72          # 'H'
ba.append(33)       # '!'
print("修改后:", ba)
print("转 bytes:", bytes(ba))
ba.extend(b'xyz')
print("extend:", ba)

# ---- 3. memoryview 内存视图 ----
print("\\n========== 3. memoryview ==========")
data = bytearray(b'hello world')
mv = memoryview(data)
print("mv[0]:", mv[0])
print("bytes(mv[0:5]):", bytes(mv[0:5]))
mv[0] = 72
print("修改视图后原数据:", data)

# ---- 4. 编码原理 ----
print("\\n========== 4. 编码原理 ==========")
print("'A'.encode('utf-8'):", 'A'.encode('utf-8'))
print("'中'.encode('utf-8'):", '中'.encode('utf-8'))
print("'中'.encode('gbk'):", '中'.encode('gbk'))
print("'😀'.encode('utf-8'):", '😀'.encode('utf-8'))
# UTF-16 与 BOM
print("'A'.encode('utf-16'):", 'A'.encode('utf-16'))
print("'A'.encode('utf-16-le'):", 'A'.encode('utf-16-le'))
print("'A'.encode('utf-16-be'):", 'A'.encode('utf-16-be'))

# 各编码字节数对比
chars = ['A', '中', '😀']
print("字符  UTF-8  GBK  UTF-16")
for ch in chars:
    u8 = len(ch.encode('utf-8'))
    try:
        gbk = len(ch.encode('gbk'))
    except Exception:
        gbk = 'N/A'
    u16 = len(ch.encode('utf-16'))
    print(f"  {ch}    {u8}     {gbk}     {u16}")

# ---- 5. encode/decode 与 errors ----
print("\\n========== 5. encode/decode ==========")
b = '你好Python'.encode('utf-8')
print("编码:", b)
print("解码:", b.decode('utf-8'))
# errors 参数
bad = b'\\x80abc'
print("ignore:", bad.decode('utf-8', errors='ignore'))
print("replace:", bad.decode('utf-8', errors='replace'))
print("backslashreplace:", bad.decode('utf-8', errors='backslashreplace'))

# 乱码演示
utf8_bytes = '你好'.encode('utf-8')
print("UTF-8 字节用 GBK 解码(乱码):", utf8_bytes.decode('gbk'))

# ---- 6. BOM 处理 ----
print("\\n========== 6. BOM 字节序 ==========")
bom_data = 'A'.encode('utf-8-sig')
print("utf-8-sig 编码:", bom_data)
print("utf-8-sig 解码:", bom_data.decode('utf-8-sig'))
print("utf-8 解码(含BOM):", repr(bom_data.decode('utf-8')))

# ---- 7. base64 编码 ----
print("\\n========== 7. base64 ==========")
data = b'hello'
enc = base64.b64encode(data)
print(f"b64encode({data}) = {enc}")
print(f"b64decode({enc}) = {base64.b64decode(enc)}")
# 字符串的 base64
s = '你好'
enc_s = base64.b64encode(s.encode('utf-8'))
print(f"'{s}' base64 = {enc_s}")
print(f"解码 = {base64.b64decode(enc_s).decode('utf-8')}")
# URL 安全 base64
print("标准:", base64.b64encode(b'\\xfb\\xff'))
print("URL安全:", base64.urlsafe_b64encode(b'\\xfb\\xff'))
# base32 / base16
print("base32:", base64.b32encode(b'hello'))
print("base16:", base64.b16encode(b'hello'))

# ---- 8. hex 编码 ----
print("\\n========== 8. hex 编码 ==========")
print("b'hello'.hex():", b'hello'.hex())
print("bytes.fromhex('68656c6c6f'):", bytes.fromhex('68656c6c6f'))
print("binascii.hexlify:", binascii.hexlify(b'hello'))
print("binascii.unhexlify:", binascii.unhexlify(b'68656c6c6f'))

# ---- 9. struct 打包解包 ----
print("\\n========== 9. struct 打包解包 ==========")
packed = struct.pack('<i', 1024)
print(f"pack('<i', 1024) = {packed}")
print(f"unpack = {struct.unpack('<i', packed)}")
# 打包多个值
multi = struct.pack('<2ihf', 1, 2, 3, 4.5)
print(f"pack('<2ihf', 1,2,3,4.5) = {multi}")
print(f"unpack = {struct.unpack('<2ihf', multi)}")
# calcsize
print("calcsize('<i') =", struct.calcsize('<i'))
print("calcsize('<2ihf') =", struct.calcsize('<2ihf'))
# 字节序对比
print("小端 1024:", struct.pack('<i', 1024))
print("大端 1024:", struct.pack('>i', 1024))
print("网络序 1024:", struct.pack('!i', 1024))
# 字符串打包
print("pack('6s', b'hello'):", struct.pack('6s', b'hello'))

# ---- 10. int 与 bytes 互转 ----
print("\\n========== 10. int 与 bytes ==========")
print("(255).to_bytes(2,'big'):", (255).to_bytes(2, 'big'))
print("(1024).to_bytes(4,'little'):", (1024).to_bytes(4, 'little'))
print("int.from_bytes(b'\\\\x00\\\\xff','big'):", int.from_bytes(b'\\x00\\xff', 'big'))
print("list(b'abc'):", list(b'abc'))
print("bytes([97,98,99]):", bytes([97, 98, 99]))

# ---- 11. 二进制文件读写 ----
print("\\n========== 11. 二进制文件读写 ==========")
# 写入
with open('/tmp/test_bin.dat', 'wb') as f:
    f.write(b'\\x00\\x01\\x02\\x03')
    f.write(bytes([4, 5, 6]))
    f.write(struct.pack('<i', 1024))
# 读取
with open('/tmp/test_bin.dat', 'rb') as f:
    all_data = f.read()
    print("全部读取:", all_data)
    f.seek(0)
    print("读前 3 字节:", f.read(3))
    print("当前位置:", f.tell())
    rest = f.read(4)
    print("读 4 字节并解包:", struct.unpack('<i', rest))
# 分块读取
print("分块读取:")
with open('/tmp/test_bin.dat', 'rb') as f:
    while True:
        chunk = f.read(4)
        if not chunk:
            break
        print("  块:", chunk)

# ---- 12. struct 读写结构化记录 ----
print("\\n========== 12. struct 结构化记录 ==========")
records = [(1, b'alice', 88.5), (2, b'bob', 92.0)]
with open('/tmp/records.bin', 'wb') as f:
    for id_, name, score in records:
        f.write(struct.pack('<i8sd', id_, name, score))
# 读回
print("读取记录:")
with open('/tmp/records.bin', 'rb') as f:
    rec_size = struct.calcsize('<i8sd')
    while True:
        rec = f.read(rec_size)
        if len(rec) < rec_size:
            break
        id_, name, score = struct.unpack('<i8sd', rec)
        print(f"  id={id_}, name={name.strip(b'\\x00')}, score={score}")

# ---- 13. 编码实战 ----
print("\\n========== 13. 编码实战 ==========")
# MD5 摘要
text = 'hello'
print(f"'{text}' 的 MD5:", hashlib.md5(text.encode()).hexdigest())
print(f"'{text}' 的 SHA256:", hashlib.sha256(text.encode()).hexdigest()[:16], "...")
# 安全 token
tok = secrets.token_bytes(16)
print("随机 token(hex):", tok.hex())
print("随机 token(base64):", base64.b64encode(tok).decode())
# XOR 加密
def xor(data, key):
    return bytes(b ^ key for b in data)
enc = xor(b'hello', 123)
dec = xor(enc, 123)
print(f"XOR 加密: {enc}, 解密: {dec}")

# ---- 14. codecs 流式解码 ----
print("\\n========== 14. codecs 流式解码 ==========")
import codecs
# 模拟分块到达的字节流（每块可能切断多字节字符）
text = '你好世界'
full_bytes = text.encode('utf-8')
# 故意切成不齐整的块：3 字节、2 字节、4 字节、3 字节
chunks = [full_bytes[0:3], full_bytes[3:5], full_bytes[5:9], full_bytes[9:12]]
print("原始字节:", full_bytes)
print("分块:", chunks)
# 直接逐块解码会失败（因为切断了字符）
print("逐块严格解码:")
for i, ch in enumerate(chunks):
    try:
        print(f"  块{i}: {ch!r} -> {ch.decode('utf-8')!r}")
    except UnicodeDecodeError as e:
        print(f"  块{i}: {ch!r} -> 解码失败: {e}")
# 用 iterdecode 流式解码，自动缓存拼齐
print("iterdecode 流式解码:")
result = []
for char in codecs.iterdecode(iter(chunks), 'utf-8'):
    result.append(char)
print("  结果:", ''.join(result))

# ---- 15. errors 错误处理策略对比 ----
print("\\n========== 15. errors 错误处理策略 ==========")
gbk_bytes = '你好'.encode('gbk')
print(f"GBK 字节: {gbk_bytes}")
for mode in ['strict', 'ignore', 'replace', 'backslashreplace']:
    try:
        out = gbk_bytes.decode('utf-8', errors=mode)
        print(f"  errors={mode!r}: {out!r}")
    except UnicodeDecodeError as e:
        print(f"  errors={mode!r}: 抛异常 {e}")

# ---- 16. BOM 与 utf-8-sig ----
print("\\n========== 16. BOM 与 utf-8-sig ==========")
# 带 BOM 写入
with open('/tmp/bom_test.txt', 'w', encoding='utf-8-sig') as f:
    f.write('hello')
# 用普通 utf-8 读，会带上 BOM 字符 \\ufeff
with open('/tmp/bom_test.txt', 'r', encoding='utf-8') as f:
    content_with_bom = f.read()
print(f"普通 utf-8 读: {content_with_bom!r}")
print(f"  == 'hello': {content_with_bom == 'hello'}")
# 用 utf-8-sig 读，自动去 BOM
with open('/tmp/bom_test.txt', 'r', encoding='utf-8-sig') as f:
    content_clean = f.read()
print(f"utf-8-sig 读: {content_clean!r}")
print(f"  == 'hello': {content_clean == 'hello'}")
os.remove('/tmp/bom_test.txt')

# ---- 17. 字符规范化 unicodedata.normalize ----
print("\\n========== 17. 字符规范化 ==========")
import unicodedata
# 同一个 é 两种编码方式
e1 = '\\xe9'             # 单字符 U+00E9
e2 = 'e\\u0301'          # e + 组合重音 U+0301
print(f"e1={e1!r}, len={len(e1)}")
print(f"e2={e2!r}, len={len(e2)}")
print(f"e1 == e2: {e1 == e2}")
# NFC 规范化后相等
e2_nfc = unicodedata.normalize('NFC', e2)
print(f"NFC(e2) == e1: {e2_nfc == e1}")
# NFKC 把全角转半角
fullwidth = 'ＡＢＣ１２３'
print(f"全角: {fullwidth}")
print(f"NFKC: {unicodedata.normalize('NFKC', fullwidth)}")
# NFKC 把圆圈数字转普通数字
print(f"NFKC('①②③'): {unicodedata.normalize('NFKC', '①②③')}")
# 连字 ﬁ (U+FB01) 拆成 fi
print(f"NFKC('ﬁ'): {unicodedata.normalize('NFKC', 'ﬁ')!r}")

# ---- 18. 二进制协议：长度前缀变长字段 ----
print("\\n========== 18. 二进制协议变长字段 ==========")
def pack_string(s, encoding='utf-8'):
    \"\"\"打包字符串：4 字节大端长度 + 内容\"\"\"
    b = s.encode(encoding)
    return struct.pack('>I', len(b)) + b

def unpack_string(buf, offset=0):
    \"\"\"从 buf 的 offset 处解包字符串，返回 (字符串, 新偏移)\"\"\"
    length = struct.unpack_from('>I', buf, offset)[0]
    start = offset + 4
    s = buf[start:start + length].decode('utf-8')
    return s, start + length

# 打包一条消息：[版本号 1B][类型 1B][字符串变长字段]
def pack_message(version, msg_type, payload):
    return struct.pack('>BB', version, msg_type) + pack_string(payload)

def unpack_message(buf):
    version, msg_type = struct.unpack_from('>BB', buf, 0)
    payload, _ = unpack_string(buf, 2)
    return version, msg_type, payload

msg = pack_message(1, 200, '你好，世界！')
print(f"打包消息: {msg!r}")
print(f"  长度: {len(msg)} 字节")
v, t, p = unpack_message(msg)
print(f"解包: version={v}, type={t}, payload={p!r}")

# ---- 19. 字节序对比 ----
print("\\n========== 19. 字节序对比 ==========")
num = 1024   # 0x00000400
be = struct.pack('>I', num)   # 大端
le = struct.pack('<I', num)   # 小端
print(f"数字: {num} (0x{num:08x})")
print(f"大端 >I: {be!r}")
print(f"小端 <I: {le!r}")
print(f"本机   I: {struct.pack('I', num)!r}")
# 网络字节序统一用大端
import socket
print(f"htonl({num}): {socket.htonl(num)} (0x{socket.htonl(num):08x})")

# ---- 20. memoryview 零拷贝性能对比 ----
print("\\n========== 20. memoryview 零拷贝 ==========")
import time
size = 5_000_000
big_ba = bytearray(size)
# 普通切片会复制
t0 = time.time()
for _ in range(100):
    _ = big_ba[1000:2000]   # 每次复制 1000 字节
t_copy = time.time() - t0
# memoryview 切片不复制
mv = memoryview(big_ba)
t0 = time.time()
for _ in range(100):
    _ = mv[1000:2000]       # 视图，不复制
t_view = time.time() - t0
print(f"普通切片 100 次: {t_copy*1000:.3f} ms")
print(f"memoryview 100 次: {t_view*1000:.3f} ms")
# 通过 memoryview 修改原数据
mv[0] = 255
print(f"修改后 big_ba[0]: {big_ba[0]}")

# ---- 21. bytes vs bytearray 拼接性能 ----
print("\\n========== 21. bytes vs bytearray 拼接 ==========")
n = 50000
# bytes 拼接（每次创建新对象）
b = b''
t0 = time.time()
for _ in range(n):
    b += b'ab'
t_bytes = time.time() - t0
# bytearray 拼接（原地修改）
ba = bytearray()
t0 = time.time()
for _ in range(n):
    ba += b'ab'
t_ba = time.time() - t0
print(f"bytes 拼接 {n} 次: {t_bytes:.3f}s, 长度={len(b)}")
print(f"bytearray 拼接 {n} 次: {t_ba:.3f}s, 长度={len(ba)}")
print(f"bytearray 比 bytes 快 {t_bytes/t_ba:.1f} 倍")

# ---- 22. 行尾符 newline 参数 ----
print("\\n========== 22. 行尾符处理 ==========")
# 写入 CRLF 风格文件
with open('/tmp/lines.txt', 'wb') as f:
    f.write(b'line1\\r\\nline2\\r\\nline3\\r\\n')
# 默认读：universal newlines，都转成 \\n
with open('/tmp/lines.txt', 'r', encoding='utf-8') as f:
    print("默认读:", repr(f.read()))
# newline='' 读：保留原样
with open('/tmp/lines.txt', 'r', encoding='utf-8', newline='') as f:
    print("newline='' 读:", repr(f.read()))
# 查看平台行尾符
print(f"os.linesep: {os.linesep!r}")
os.remove('/tmp/lines.txt')

# ---- 23. 编码检测：尝试多种编码 ----
print("\\n========== 23. 编码检测 ==========")
def detect_encoding(data):
    \"\"\"简单编码探测：依次尝试常见编码\"\"\"
    for enc in ['utf-8', 'gbk', 'big5', 'shift_jis', 'latin1']:
        try:
            text = data.decode(enc)
            return enc, text
        except UnicodeDecodeError:
            continue
    return None, None
samples = {
    'UTF-8': '你好世界'.encode('utf-8'),
    'GBK': '你好世界'.encode('gbk'),
    'Big5': '你好世界'.encode('big5'),
}
for name, data in samples.items():
    enc, text = detect_encoding(data)
    print(f"  实际{name}: 检测为 {enc}, 解出 {text!r}")

# ---- 24. 清理临时文件 ----
for fn in ['/tmp/test_bin.dat', '/tmp/records.bin']:
    if os.path.exists(fn):
        os.remove(fn)
        print(f"已清理: {fn}")

print("\\n字节与编码演示完成！")
`,
  },
  // =========================================================
  // 第四章：时间日期处理
  // =========================================================
  {
    id: "py-datetime",
    group: "基础深化",
    icon: "📅",
    title: "时间日期处理",
    content: `## 时间日期处理

时间日期是编程中极其常见又极易出错的需求：日志时间戳、定时任务、倒计时、时区转换、年龄计算、工作日推算、账单周期……Python 标准库提供了三套相关模块：\`datetime\`（面向对象的日期时间）、\`time\`（底层时间函数）、\`calendar\`（日历与工作日）。掌握它们能让你应对绝大多数时间场景，无需依赖第三方库。

本章将系统讲解 \`datetime\` 的 \`date\`/\`time\`/\`datetime\`/\`timedelta\`/\`timezone\` 五大核心类型、格式化与解析（\`strftime\`/\`strptime\`）、时区与"感知型 vs 朴素型"的陷阱、Unix 时间戳、\`calendar\` 工作日计算，以及各种时间运算实战。

---

## 一、三大模块的分工

| 模块 | 定位 | 核心能力 |
| --- | --- | --- |
| \`datetime\` | 高层日期时间对象 | \`date\`/\`time\`/\`datetime\`/\`timedelta\`/\`timezone\` |
| \`time\` | 底层时间函数 | 时间戳、休眠、计时、CPU 时间 |
| \`calendar\` | 日历与工作日 | 月历、闰年、星期几、工作日 |

简单记忆：**算"哪天几点"用 \`datetime\`，算"过了多久/睡一会"用 \`time\`，算"星期几/几月有几天"用 \`calendar\`**。

---

## 二、date：日期

\`datetime.date\` 表示一个**只有日期、没有时间**的对象（年-月-日）。

### 2.1 创建 date

\`\`\`python
from datetime import date          # 从 datetime 导入 date

# 用年月日创建
d1 = date(2024, 8, 15)             # 将 date(2024, 8, 15) 赋给 d1
print(d1)              # 2024-08-15

# 今天
today = date.today()               # 将 date.today() 赋给 today
print(today)           # 今天的日期

# 从 ISO 格式字符串创建（YYYY-MM-DD）
d2 = date.fromisoformat('2024-12-31')  # 将 date.fromisoformat('2024-12-31') 赋给 d2
print(d2)              # 2024-12-31

# 从时间戳创建（自 1970-01-01 的秒数）
d3 = date.fromtimestamp(1700000000)  # 将 date.fromtimestamp(1700000000) 赋给 d3
print(d3)              # 2023-11-15（取决于时区）
\`\`\`

### 2.2 date 的属性

\`\`\`python
d = date(2024, 8, 15)              # 将 date(2024, 8, 15) 赋给 d
print(d.year)          # 2024
print(d.month)         # 8
print(d.day)           # 15
print(d.weekday())     # 3（周一为 0，周日为 6）
print(d.isoweekday())  # 4（周一为 1，周日为 7）
print(d.isocalendar()) # (2024, 33, 4) —— ISO 年、周、星期
print(d.timetuple())   # time.struct_time，结构化时间
\`\`\`

\`weekday()\` 和 \`isoweekday()\` 的区别：前者周一=0，后者周一=1（符合 ISO 8601 标准）。**国际业务用 \`isoweekday()\`**，避免"周日是 0 还是 6"的混乱。

### 2.3 date 的常用方法

\`\`\`python
d = date(2024, 8, 15)              # 将 date(2024, 8, 15) 赋给 d
print(d.isoformat())           # '2024-08-15'
print(d.strftime('%Y年%m月%d日'))  # '2024年08月15日'
print(d.ctime())               # 'Thu Aug 15 00:00:00 2024'
print(d.replace(year=2025))    # 2025-08-15（替换某字段）
\`\`\`

---

## 三、time：时间

\`datetime.time\` 表示一个**只有时间、没有日期**的对象（时:分:秒.微秒）。注意它和 \`time\` **模块**同名但完全不同——一个是类，一个是模块。

\`\`\`python
from datetime import time          # 从 datetime 导入 time

t = time(14, 30, 45, 123456)   # 时 分 秒 微秒
print(t)                # 14:30:45.123456
print(t.hour)           # 14
print(t.minute)         # 30
print(t.second)         # 45
print(t.microsecond)    # 123456
print(t.isoformat())    # '14:30:45.123456'
print(t.strftime('%H:%M'))   # '14:30'
\`\`\`

\`time\` 对象可以带时区信息（\`tzinfo\`），但日常使用较少——大多数时区场景用 \`datetime\` 而非 \`time\`。

---

## 四、datetime：日期时间

\`datetime.datetime\` 是最常用的类型，**同时包含日期和时间**。它是 \`date\` 和 \`time\` 的组合。

### 4.1 创建 datetime

\`\`\`python
from datetime import datetime      # 从 datetime 导入 datetime

# 用年月日时分秒创建
dt = datetime(2024, 8, 15, 14, 30, 45)  # 将 datetime(2024, 8, 15, 14, 30, 45) 赋给 dt
print(dt)              # 2024-08-15 14:30:45

# 现在（本地时间）
now = datetime.now()               # 将 datetime.now() 赋给 now
print(now)                         # 输出 now

# 现在（UTC 时间）
utc_now = datetime.utcnow()   # ⚠️ 已弃用，推荐 datetime.now(timezone.utc)
print(utc_now)                     # 输出 utc_now

# 从时间戳创建
dt2 = datetime.fromtimestamp(1700000000)  # 将 datetime.fromtimestamp(1700000000) 赋给 dt2
print(dt2)                         # 输出 dt2

# 从字符串解析
dt3 = datetime.strptime('2024-08-15 14:30:45', '%Y-%m-%d %H:%M:%S')  # 将 datetime.strptime('2024-08-15 14:30:45', '%Y-%m-%d %H:%M:%S') 赋给 dt3
print(dt3)                         # 输出 dt3

# 从 ISO 格式创建
dt4 = datetime.fromisoformat('2024-08-15T14:30:45')  # 将 datetime.fromisoformat('2024-08-15T14:30:45') 赋给 dt4
print(dt4)                         # 输出 dt4
\`\`\`

**重要提醒**：\`datetime.utcnow()\` 在 Python 3.12 起被弃用，因为它返回的是**朴素型** datetime（没有时区信息），容易导致时区 bug。推荐用 \`datetime.now(timezone.utc)\` 返回**感知型** datetime。

### 4.2 datetime 的属性与方法

\`\`\`python
dt = datetime(2024, 8, 15, 14, 30, 45, 123456)  # 将 datetime(2024, 8, 15, 14, 30, 45, 123456) 赋给 dt
# 日期部分
print(dt.year, dt.month, dt.day)         # 2024 8 15
# 时间部分
print(dt.hour, dt.minute, dt.second)     # 14 30 45
print(dt.microsecond)                     # 123456
# 提取 date / time 对象
print(dt.date())                          # 2024-08-15
print(dt.time())                          # 14:30:45.123456
# 格式化
print(dt.isoformat())                     # 2024-08-15T14:30:45.123456
print(dt.strftime('%Y/%m/%d %H:%M'))      # 2024/08/15 14:30
\`\`\`

---

## 五、timedelta：时间差

\`timedelta\` 表示**两个时间点之间的差值**，是时间运算的核心。它可以表示"几天几小时几秒"。

### 5.1 创建 timedelta

\`\`\`python
from datetime import timedelta     # 从 datetime 导入 timedelta

# 1 天 2 小时 30 分
delta = timedelta(days=1, hours=2, minutes=30)  # 将 timedelta(days=1, hours=2, minutes=30) 赋给 delta
print(delta)           # 1 day, 2:30:00

# 只用秒
print(timedelta(seconds=3600))    # 1:00:00
print(timedelta(weeks=2))         # 14 days, 0:00:00
print(timedelta(milliseconds=500))# 0:00:00.500000
\`\`\`

timedelta 内部只存 \`days\`、\`seconds\`、\`microseconds\` 三个字段，其他单位（hours/minutes/weeks）都会换算成这三个。

### 5.2 timedelta 的运算

\`\`\`python
from datetime import datetime, timedelta  # 从 datetime 导入 datetime, timedelta

now = datetime.now()               # 将 datetime.now() 赋给 now
# 加减时间
tomorrow = now + timedelta(days=1) # 将 now + timedelta(days=1) 赋给 tomorrow
last_week = now - timedelta(weeks=1)  # 将 now - timedelta(weeks=1) 赋给 last_week
in_3_hours = now + timedelta(hours=3)  # 将 now + timedelta(hours=3) 赋给 in_3_hours
print("明天:", tomorrow)             # 输出 "明天:", tomorrow
print("上周:", last_week)            # 输出 "上周:", last_week

# 两个 datetime 相减得到 timedelta
diff = tomorrow - now              # 将 tomorrow - now 赋给 diff
print("差值:", diff)              # 1 day, 0:00:00
print("总秒数:", diff.total_seconds())  # 86400.0
\`\`\`

\`total_seconds()\` 把整个时间差换算成秒（float），是最常用的方法。

### 5.3 timedelta 的属性

\`\`\`python
d = timedelta(days=1, hours=2, minutes=30)  # 将 timedelta(days=1, hours=2, minutes=30) 赋给 d
print(d.days)              # 1
print(d.seconds)           # 9000（2 小时 30 分 = 9000 秒）
print(d.microseconds)      # 0
print(d.total_seconds())   # 93600.0（1 天 2 小时 30 分）
\`\`\`

注意 \`seconds\` 属性**只返回 0-86399 之间的秒数**（一天以内的部分），不是总秒数。要总秒数用 \`total_seconds()\`。

---

## 六、strftime 与 strptime：格式化与解析

\`strftime\`（string format time）把 datetime 转字符串，\`strptime\`（string parse time）把字符串转 datetime。两者共用一套**格式化指令**。

### 6.1 常用格式化指令

| 指令 | 含义 | 示例 |
| --- | --- | --- |
| \`%Y\` | 4 位年份 | 2024 |
| \`%y\` | 2 位年份 | 24 |
| \`%m\` | 月份（01-12） | 08 |
| \`%d\` | 日（01-31） | 15 |
| \`%H\` | 24 小时制时（00-23） | 14 |
| \`%I\` | 12 小时制时（01-12） | 02 |
| \`%M\` | 分（00-59） | 30 |
| \`%S\` | 秒（00-59） | 45 |
| \`%p\` | AM/PM | PM |
| \`%A\` | 星期全名 | Thursday |
| \`%a\` | 星期缩写 | Thu |
| \`%B\` | 月份全名 | August |
| \`%b\` | 月份缩写 | Aug |
| \`%w\` | 星期数字（0=周日） | 4 |
| \`%j\` | 一年中第几天（001-366） | 228 |
| \`%U\` | 周数（周日为周首） | 33 |
| \`%W\` | 周数（周一为周首） | 33 |
| \`%Z\` | 时区名 | UTC |
| \`%z\` | 时区偏移 | +0800 |
| \`%%\` | 字面 % | % |

### 6.2 strftime 格式化

\`\`\`python
from datetime import datetime      # 从 datetime 导入 datetime
dt = datetime(2024, 8, 15, 14, 30, 45)  # 将 datetime(2024, 8, 15, 14, 30, 45) 赋给 dt
print(dt.strftime('%Y-%m-%d %H:%M:%S'))   # 2024-08-15 14:30:45
print(dt.strftime('%Y年%m月%d日 %H时%M分'))  # 2024年08月15日 14时30分
print(dt.strftime('%A, %B %d, %Y'))        # Thursday, August 15, 2024
print(dt.strftime('%Y/%m/%d %I:%M %p'))    # 2024/08/15 02:30 PM
print(dt.strftime('第 %j 天'))              # 第 228 天
\`\`\`

### 6.3 strptime 解析

\`\`\`python
from datetime import datetime      # 从 datetime 导入 datetime
s = '2024-08-15 14:30:45'          # 将字符串 '2024-08-15 14:30:45' 赋给 s
dt = datetime.strptime(s, '%Y-%m-%d %H:%M:%S')  # 将 datetime.strptime(s, '%Y-%m-%d %H:%M:%S') 赋给 dt
print(dt)              # 2024-08-15 14:30:45

# 解析中文日期
s2 = '2024年08月15日 14时30分'          # 将字符串 '2024年08月15日 14时30分' 赋给 s2
dt2 = datetime.strptime(s2, '%Y年%m月%d日 %H时%M分')  # 将 datetime.strptime(s2, '%Y年%m月%d日 %H时%M分') 赋给 dt2
print(dt2)                         # 输出 dt2
\`\`\`

**strptime 的陷阱**：格式字符串必须和实际字符串**完全匹配**，多一个空格、少一个 0 都会抛 \`ValueError\`。比如 \`%m\` 期望两位月份，如果输入是 \`'2024-8-15'\`（月份没有前导 0），用 \`%m\` 解析会失败，要用 \`%-m\`（Linux/macOS）或先补 0。

### 6.4 isoformat 与 fromisoformat

ISO 8601 是国际标准日期时间格式（\`YYYY-MM-DDTHH:MM:SS\`），跨语言交换数据时推荐用它：

\`\`\`python
dt = datetime(2024, 8, 15, 14, 30, 45)  # 将 datetime(2024, 8, 15, 14, 30, 45) 赋给 dt
print(dt.isoformat())              # 2024-08-15T14:30:45
dt2 = datetime.fromisoformat('2024-08-15T14:30:45')  # 将 datetime.fromisoformat('2024-08-15T14:30:45') 赋给 dt2
\`\`\`

\`fromisoformat\` 在 Python 3.11+ 也支持解析带时区的 ISO 字符串（如 \`'2024-08-15T14:30:45+08:00'\`）。

---

## 七、时区：aware vs naive

时区是 datetime 最容易出 bug 的地方。Python 把 datetime 分成两类：

- **朴素型（naive）**：没有时区信息（\`tzinfo=None\`）。它"以为"自己是本地时间，但实际可能是任何时区。
- **感知型（aware）**：带时区信息（\`tzinfo\` 不为 None）。明确知道自己是哪个时区的时间。

### 7.1 为什么 naive 容易出 bug

\`\`\`python
from datetime import datetime      # 从 datetime 导入 datetime
# 两个 naive datetime 看起来一样，但可能代表不同时区
a = datetime(2024, 8, 15, 14, 0)   # 谁知道这是北京 14 点还是纽约 14 点？
b = datetime(2024, 8, 15, 14, 0)   # 将 datetime(2024, 8, 15, 14, 0) 赋给 b
print(a == b)   # True，但语义可能错误
\`\`\`

**最佳实践：内部一律存 UTC 感知型 datetime，只在展示时转成用户时区**。

### 7.2 timezone 类

\`datetime.timezone\` 是 Python 3.2+ 提供的简单时区类，用固定偏移量表示时区：

\`\`\`python
from datetime import datetime, timezone, timedelta  # 从 datetime 导入 datetime, timezone, timedelta

# UTC 时区
utc = timezone.utc                 # 将 timezone.utc 赋给 utc
# 东八区（北京时间）
beijing = timezone(timedelta(hours=8))  # 将 timezone(timedelta(hours=8)) 赋给 beijing
# 西五区（纽约）
newyork = timezone(timedelta(hours=-5))  # 将 timezone(timedelta(hours=-5)) 赋给 newyork

now_utc = datetime.now(utc)        # 将 datetime.now(utc) 赋给 now_utc
print(now_utc)                    # 2024-08-15 06:00:00+00:00
beijing_time = now_utc.astimezone(beijing)  # 将 now_utc.astimezone(beijing) 赋给 beijing_time
print(beijing_time)               # 2024-08-15 14:00:00+08:00
ny_time = now_utc.astimezone(newyork)  # 将 now_utc.astimezone(newyork) 赋给 ny_time
print(ny_time)                    # 2024-08-15 01:00:00-05:00
\`\`\`

\`astimezone(tz)\` 把一个感知型 datetime 转成另一个时区。

### 7.3 timezone.utc 与 utcnow 的区别

\`\`\`python
from datetime import datetime, timezone  # 从 datetime 导入 datetime, timezone
# ❌ 已弃用：返回 naive datetime
naive_utc = datetime.utcnow()      # 将 datetime.utcnow() 赋给 naive_utc
# ✅ 推荐：返回 aware datetime
aware_utc = datetime.now(timezone.utc)  # 将 datetime.now(timezone.utc) 赋给 aware_utc
\`\`\`

\`utcnow()\` 返回的 naive datetime 调用 \`astimezone()\` 时会**假设它是本地时间**，导致错误。所以一定要用 \`datetime.now(timezone.utc)\`。

### 7.4 夏令时陷阱

\`timezone\` 类只能表示**固定偏移**，无法处理夏令时（DST）。纽约夏天是 UTC-4（EDT），冬天是 UTC-5（EST）。要正确处理夏令时，需要用 \`zoneinfo\` 模块（Python 3.9+）：

\`\`\`python
from datetime import datetime      # 从 datetime 导入 datetime
from zoneinfo import ZoneInfo      # 从 zoneinfo 导入 ZoneInfo

# 用 IANA 时区名，自动处理夏令时
ny = ZoneInfo('America/New_York')  # 将 ZoneInfo('America/New_York') 赋给 ny
now_ny = datetime.now(ny)          # 将 datetime.now(ny) 赋给 now_ny
print(now_ny)   # 自动是 EDT 或 EST
\`\`\`

\`zoneinfo\` 使用操作系统的时区数据库（IANA tzdata），是处理真实世界时区的正确方式。

---

## 八、Unix 时间戳

**Unix 时间戳**（timestamp）是自 1970-01-01 00:00:00 UTC 以来的**秒数**（可为小数）。它是跨语言、跨时区的"通用时间表示"。

\`\`\`python
from datetime import datetime, timezone  # 从 datetime 导入 datetime, timezone

# 当前时间戳
ts = datetime.now(timezone.utc).timestamp()  # 将 datetime.now(timezone.utc).timestamp() 赋给 ts
print(ts)           # 1723716045.123456

# 时间戳转 datetime
dt = datetime.fromtimestamp(ts, timezone.utc)  # 将 datetime.fromtimestamp(ts, timezone.utc) 赋给 dt
print(dt)                          # 输出 dt

# datetime 转时间戳
dt2 = datetime(2024, 8, 15, 14, 0, tzinfo=timezone.utc)  # 将 datetime(2024, 8, 15, 14, 0, tzinfo=timezone.utc) 赋给 dt2
print(dt2.timestamp())             # 输出 dt2.timestamp()
\`\`\`

**注意**：时间戳本身没有时区——它永远是相对 UTC 的。但 \`fromtimestamp(ts)\` 不带时区参数时返回**本地时间**的 naive datetime，\`fromtimestamp(ts, tz)\` 返回指定时区的 aware datetime。

---

## 九、calendar 模块

\`calendar\` 模块提供日历和工作日相关的功能。

### 9.1 闰年判断

\`\`\`python
import calendar                    # 导入 calendar 模块
print(calendar.isleap(2024))   # True（能被 4 整除且不能被 100 整除，或能被 400 整除）
print(calendar.isleap(2100))   # False（能被 100 整除但不能被 400 整除）
print(calendar.isleap(2000))   # True
print(calendar.leapdays(2000, 2024))  # 6（2000-2023 间有 6 个闰年）
\`\`\`

### 9.2 某月有几天 / 星期几

\`\`\`python
import calendar                    # 导入 calendar 模块
print(calendar.monthrange(2024, 2))   # (3, 29) —— 2 月 1 日是周四(3)，2 月有 29 天
print(calendar.weekday(2024, 8, 15))  # 3（周四，周一=0）
\`\`\`

\`monthrange(year, month)\` 返回 \`(该月 1 号是星期几, 该月天数)\`，非常实用。

### 9.3 打印日历

\`\`\`python
import calendar                    # 导入 calendar 模块
print(calendar.month(2024, 8))      # 打印 2024 年 8 月日历
print(calendar.calendar(2024))      # 打印整年日历
\`\`\`

### 9.4 工作日计算

\`\`\`python
import calendar                    # 导入 calendar 模块
# 一周哪些天是工作日（默认周一到周五）
print(calendar.workingdays)  # NotImplementedError（新版本无此属性）
# 手动计算两个日期间的工作日数
from datetime import date, timedelta  # 从 datetime 导入 date, timedelta
def count_workdays(start, end):    # 定义函数 count_workdays，参数：start, end
    days = 0                       # 将整数 0 赋给 days
    cur = start                    # 将 start 赋给 cur
    while cur <= end:              # 当 cur <= end 为真时重复执行
        if cur.weekday() < 5:   # 0-4 是周一到周五
            days += 1              # days 加 1
        cur += timedelta(days=1)   # cur 加 timedelta(days=1)
    return days                    # 返回 days
print(count_workdays(date(2024, 8, 1), date(2024, 8, 31)))  # 输出 count_workdays(date(2024, 8, 1), date(2024, 8, 31))
\`\`\`

---

## 十、time 模块

\`time\` 模块提供底层时间函数，主要用于**计时**和**休眠**。

### 10.1 time.time() 时间戳

\`\`\`python
import time                        # 导入 time 模块
print(time.time())   # 当前 Unix 时间戳（float 秒）
\`\`\`

### 10.2 time.sleep() 休眠

\`\`\`python
import time                        # 导入 time 模块
time.sleep(2)        # 暂停 2 秒
time.sleep(0.5)      # 暂停 0.5 秒
\`\`\`

### 10.3 计时

\`\`\`python
import time                        # 导入 time 模块
# 方法 1：time.time() 适合测量秒级
t0 = time.time()                   # 将 time.time() 赋给 t0
# ... 做点事 ...
print(f"耗时 {time.time() - t0:.3f} 秒")  # 输出 f"耗时 {time.time() - t0:.3f} 秒"

# 方法 2：time.perf_counter() 高精度（纳秒级），适合性能测试
t0 = time.perf_counter()           # 将 time.perf_counter() 赋给 t0
# ...
print(f"耗时 {time.perf_counter() - t0:.6f} 秒")  # 输出 f"耗时 {time.perf_counter() - t0:.6f} 秒"
\`\`\`

**重要**：测量代码执行时间用 \`time.perf_counter()\` 而不是 \`time.time()\`——前者是高精度单调时钟，不受系统时间调整影响。

### 10.4 struct_time 结构化时间

\`time\` 模块用 \`struct_time\`（命名元组）表示时间：

\`\`\`python
import time                        # 导入 time 模块
t = time.localtime()   # 本地时间的 struct_time
print(t.tm_year, t.tm_mon, t.tm_mday, t.tm_hour, t.tm_min, t.tm_sec)  # 输出 t.tm_year, t.tm_mon, t.tm_mday, t.tm_hour, t.tm_min, t.tm_sec
print(t.tm_wday)       # 周几（0=周一）
print(t.tm_yday)       # 一年中第几天
\`\`\`

\`localtime()\` 返回本地时间，\`gmtime()\` 返回 UTC 时间，都是 \`struct_time\`。

---

## 十一、时间运算实战

### 11.1 计算年龄

\`\`\`python
from datetime import date          # 从 datetime 导入 date
def calc_age(birth, today=None):   # 定义函数 calc_age，参数：birth, today=None
    today = today or date.today()  # 将 today or date.today() 赋给 today
    age = today.year - birth.year  # 将 today.year - birth.year 赋给 age
    # 生日还没到则减 1
    if (today.month, today.day) < (birth.month, birth.day):  # 如果 (today.month, today.day) < (birth.month, birth.day) 成立
        age -= 1                   # age 减 1
    return age                     # 返回 age
print(calc_age(date(1990, 5, 20), date(2024, 8, 15)))   # 34
print(calc_age(date(1990, 12, 20), date(2024, 8, 15)))  # 33
\`\`\`

### 11.2 月末计算 / 跨月加减

timedelta 只能按"天"加减，不能直接"加 1 个月"。要加减月份需要手动处理：

\`\`\`python
from datetime import date          # 从 datetime 导入 date
import calendar                    # 导入 calendar 模块
def add_months(d, months):         # 定义函数 add_months，参数：d, months
    month = d.month - 1 + months   # 将 d.month - 1 + months 赋给 month
    year = d.year + month // 12    # 将 d.year + month // 12 赋给 year
    month = month % 12 + 1         # 将 month % 12 + 1 赋给 month
    # 处理月末（如 1 月 31 日加 1 个月 -> 2 月 28/29 日）
    day = min(d.day, calendar.monthrange(year, month)[1])  # 将 min(d.day, calendar.monthrange(year, month)[1]) 赋给 day
    return date(year, month, day)  # 返回 date(year, month, day)
print(add_months(date(2024, 1, 31), 1))   # 2024-02-29（闰年）
print(add_months(date(2024, 1, 31), 2))   # 2024-03-31
print(add_months(date(2024, 3, 31), -1))  # 2024-02-29
\`\`\`

这种"加月"逻辑正是第三方库 \`dateutil.relativedelta\` 解决的问题——它支持"加 N 月/年"并自动处理月末。

### 11.3 两个日期相差多少天/小时

\`\`\`python
from datetime import datetime      # 从 datetime 导入 datetime
a = datetime(2024, 8, 15, 14, 0)   # 将 datetime(2024, 8, 15, 14, 0) 赋给 a
b = datetime(2024, 8, 20, 10, 30)  # 将 datetime(2024, 8, 20, 10, 30) 赋给 b
diff = b - a                       # 将 b - a 赋给 diff
print(diff.days)                # 4
print(diff.seconds)             # 73800（剩余秒数）
print(diff.total_seconds())     # 419400.0
print(diff.total_seconds() / 3600)  # 116.5 小时
\`\`\`

### 11.4 倒计时

\`\`\`python
from datetime import datetime      # 从 datetime 导入 datetime
target = datetime(2025, 1, 1, 0, 0, 0)  # 将 datetime(2025, 1, 1, 0, 0, 0) 赋给 target
now = datetime.now()               # 将 datetime.now() 赋给 now
remaining = target - now           # 将 target - now 赋给 remaining
print(f"距离 2025 元旦还有 {remaining.days} 天 {remaining.seconds // 3600} 小时")  # 输出 f"距离 2025 元旦还有 {remaining.days} 天 {remaining.seconds // 3600} 小时"
\`\`\`

---

## 十二、常见陷阱总结

1. **utcnow() 已弃用**：用 \`datetime.now(timezone.utc)\`。
2. **naive datetime 混用**：内部统一用 UTC aware，展示时再转。
3. **timedelta 不能加减月/年**：要手动算或用 \`dateutil\`。
4. **时区固定偏移 vs 夏令时**：\`timezone(timedelta(...))\` 是固定偏移，\`ZoneInfo\` 才能处理夏令时。
5. **timestamp 时区敏感**：\`datetime.timestamp()\` 对 naive datetime 假设是本地时间。
6. **strftime 跨平台**：\`%-m\`（去前导 0）是 Linux/macOS 专有，Windows 要用 \`%#m\`。
7. **perf_counter vs time**：计时用 \`perf_counter\`，时间戳用 \`time()\`。
8. **monthrange 返回元组**：\`(星期几, 天数)\`，别记反。

---

## 十三、时间精度：毫秒与微秒

datetime 内部精度到**微秒**（百万分之一秒），足以覆盖绝大多数场景。处理高精度时间时要注意：

### 13.1 获取带微秒的当前时间

\`\`\`python
from datetime import datetime      # 从 datetime 导入 datetime
now = datetime.now()               # 将 datetime.now() 赋给 now
print(now.microsecond)   # 0-999999
# 只要毫秒部分
ms = now.microsecond // 1000       # 将 now.microsecond // 1000 赋给 ms
print(f"毫秒: {ms}")                 # 输出 f"毫秒: {ms}"
\`\`\`

### 13.2 去掉微秒（截断到秒）

\`\`\`python
dt = datetime.now()                # 将 datetime.now() 赋给 dt
dt_no_us = dt.replace(microsecond=0)  # 将 dt.replace(microsecond=0) 赋给 dt_no_us
print(dt_no_us)   # 2024-08-15 14:30:45（没有小数部分）
\`\`\`

### 13.3 毫秒时间戳（13 位）

JavaScript 等语言常用**毫秒时间戳**（13 位整数），Python 默认是**秒时间戳**（10 位浮点）。转换：

\`\`\`python
import time                        # 导入 time 模块
ts_seconds = time.time()                  # 1723716045.123456
ts_ms = int(time.time() * 1000)           # 1723716045123（13 位毫秒）
# 毫秒时间戳转 datetime
from datetime import datetime, timezone  # 从 datetime 导入 datetime, timezone
dt = datetime.fromtimestamp(ts_ms / 1000, timezone.utc)  # 将 datetime.fromtimestamp(ts_ms / 1000, timezone.utc) 赋给 dt
\`\`\`

### 13.4 高精度计时 perf_counter_ns

Python 3.7+ 提供了纳秒级计时函数（\`_ns\` 后缀）：

\`\`\`python
import time                        # 导入 time 模块
t0 = time.perf_counter_ns()   # 纳秒整数
# ... 做点事 ...
elapsed_ns = time.perf_counter_ns() - t0  # 将 time.perf_counter_ns() - t0 赋给 elapsed_ns
print(f"耗时 {elapsed_ns} 纳秒 = {elapsed_ns/1e6:.3f} 毫秒")  # 输出 f"耗时 {elapsed_ns} 纳秒 = {elapsed_ns/1e6:.3f} 毫秒"
\`\`\`

\`perf_counter_ns\` 返回整数，避免浮点精度损失，适合测量极短操作（微秒级以下）。

---

## 十四、timeit：精确测量代码耗时

\`time.time()\` 测一次容易受系统抖动影响。\`timeit\` 模块会**自动重复多次**取最优值，是性能测试的标准工具。

\`\`\`python
import timeit                      # 导入 timeit 模块
# 测量字符串拼接 10 万次
t = timeit.timeit('"-".join(str(n) for n in range(100))', number=10000)  # 将 timeit.timeit('"-".join(str(n) for n in range(100))', number=10000) 赋给 t
print(f"join 方式: {t:.4f}s")        # 输出 f"join 方式: {t:.4f}s"
t2 = timeit.timeit('"-" + "-".join(map(str, range(100)))', number=10000)  # 将 timeit.timeit('"-" + "-".join(map(str, range(100)))', number=10000) 赋给 t2
\`\`\`

\`timeit.timeit(stmt, number=N)\` 把 \`stmt\` 执行 \`N\` 次返回总秒数。也可以用 \`timeit.repeat(stmt, number=N, repeat=R)\` 重复 R 轮，取最小值（最小值代表"最不受干扰"的真实性能）。

\`\`\`python
import timeit                      # 导入 timeit 模块
results = timeit.repeat('[str(n) for n in range(100)]', number=100000, repeat=5)  # 将 timeit.repeat('[str(n) for n in range(100)]', number=100000, repeat=5) 赋给 results
print(f"5 轮结果: {results}")         # 输出 f"5 轮结果: {results}"
print(f"最优: {min(results):.4f}s")  # 输出 f"最优: {min(results):.4f}s"
\`\`\`

---

## 十五、时区数据库与 zoneinfo 详解

### 15.1 IANA 时区数据库

IANA（互联网号码分配局）维护着全球时区数据库，包含所有历史时区变更和夏令时规则。每个时区用 "地区/城市" 格式命名：

| 时区名 | 城市 | 说明 |
| --- | --- | --- |
| \`UTC\` | — | 协调世界时 |
| \`Asia/Shanghai\` | 上海 | 中国标准时间（无夏令时） |
| \`Asia/Tokyo\` | 东京 | 日本标准时间 |
| \`America/New_York\` | 纽约 | 美东（有夏令时） |
| \`America/Los_Angeles\` | 洛杉矶 | 美西（有夏令时） |
| \`Europe/London\` | 伦敦 | 英国（有夏令时） |
| \`Europe/Paris\` | 巴黎 | 欧洲中部 |
| \`Australia/Sydney\` | 悉尼 | 澳洲东部 |

### 15.2 zoneinfo 基本用法

\`\`\`python
from datetime import datetime      # 从 datetime 导入 datetime
from zoneinfo import ZoneInfo      # 从 zoneinfo 导入 ZoneInfo

tz_sh = ZoneInfo('Asia/Shanghai')  # 将 ZoneInfo('Asia/Shanghai') 赋给 tz_sh
tz_ny = ZoneInfo('America/New_York')  # 将 ZoneInfo('America/New_York') 赋给 tz_ny
now_sh = datetime.now(tz_sh)       # 将 datetime.now(tz_sh) 赋给 now_sh
now_ny = now_sh.astimezone(tz_ny)  # 将 now_sh.astimezone(tz_ny) 赋给 now_ny
print(f"上海: {now_sh}")             # 输出 f"上海: {now_sh}"
print(f"纽约: {now_ny}")             # 输出 f"纽约: {now_ny}"
\`\`\`

### 15.3 查询时区偏移

\`\`\`python
from datetime import datetime      # 从 datetime 导入 datetime
from zoneinfo import ZoneInfo      # 从 zoneinfo 导入 ZoneInfo
dt = datetime(2024, 1, 15, tzinfo=ZoneInfo('America/New_York'))   # 冬天 EST
print(dt.utcoffset())   # -1 day, 19:00:00（即 -5 小时）
dt2 = datetime(2024, 7, 15, tzinfo=ZoneInfo('America/New_York'))  # 夏天 EDT
print(dt2.utcoffset())  # -1 day, 20:00:00（即 -4 小时）
\`\`\`

\`utcoffset()\` 返回 timedelta，表示相对 UTC 的偏移。可以看到纽约冬天 -5、夏天 -4，\`zoneinfo\` 自动处理了夏令时。

### 15.4 ZoneInfo 找不到时区数据

Windows 系统默认没有 IANA 时区数据库，首次用 \`ZoneInfo\` 会抛 \`ZoneInfoNotFoundError\`。解决：安装 \`tzdata\` 包：

\`\`\`bash
pip install tzdata
\`\`\`

安装后 \`zoneinfo\` 会自动用它作为后备数据源。

---

## 十六、ISO 8601 与常见时间格式

### 16.1 ISO 8601 格式族

ISO 8601 是国际标准，规定了多种日期时间格式：

| 格式 | 示例 | 说明 |
| --- | --- | --- |
| 基本日期 | \`20240815\` | YYYYMMDD |
| 扩展日期 | \`2024-08-15\` | YYYY-MM-DD |
| 日期时间 | \`2024-08-15T14:30:45\` | 用 T 分隔 |
| 带时区 | \`2024-08-15T14:30:45+08:00\` | +HH:MM |
| UTC 后缀 | \`2024-08-15T06:30:45Z\` | Z = UTC |
| 周日期 | \`2024-W33-4\` | 第 33 周第 4 天 |
| 序数日期 | \`2024-228\` | 第 228 天 |

Python 的 \`isoformat()\` 默认输出扩展格式，\`fromisoformat()\` 能解析大多数 ISO 8601 变体。

### 16.2 RFC 2822 邮件日期格式

邮件头用 \`RFC 2822\` 格式（如 \`Thu, 15 Aug 2024 14:30:45 +0800\`）。Python 用 \`email.utils\` 处理：

\`\`\`python
from email.utils import formatdate, parsedate_to_datetime  # 从 email.utils 导入 formatdate, parsedate_to_datetime
import time                        # 导入 time 模块
# 当前时间的 RFC 2822 字符串
rfc = formatdate(time.time(), localtime=True)  # 将 formatdate(time.time(), localtime=True) 赋给 rfc
print(rfc)   # Thu, 15 Aug 2024 14:30:45 +0800
# 解析
dt = parsedate_to_datetime(rfc)    # 将 parsedate_to_datetime(rfc) 赋给 dt
print(dt)                          # 输出 dt
\`\`\`

### 16.3 HTTP 日期格式

HTTP 协议头（如 \`Last-Modified\`、\`Date\`）用 RFC 1123 格式（GMT 时间）：

\`\`\`python
from email.utils import formatdate # 从 email.utils 导入 formatdate
http_date = formatdate(time.time(), usegmt=True)  # 将 formatdate(time.time(), usegmt=True) 赋给 http_date
print(http_date)   # Thu, 15 Aug 2024 06:30:45 GMT
\`\`\`

---

## 十七、季度与周期计算

财务、报表场景常需要按"季度"统计。Python 没有内置季度概念，但很容易计算：

### 17.1 计算季度

\`\`\`python
from datetime import date          # 从 datetime 导入 date
def get_quarter(d):                # 定义函数 get_quarter，参数：d
    return (d.month - 1) // 3 + 1  # 返回 (d.month - 1) // 3 + 1
print(get_quarter(date(2024, 1, 15)))   # 1
print(get_quarter(date(2024, 8, 15)))   # 3
print(get_quarter(date(2024, 12, 15)))  # 4
\`\`\`

### 17.2 季度起止日期

\`\`\`python
from datetime import date          # 从 datetime 导入 date
import calendar                    # 导入 calendar 模块
def quarter_range(year, quarter):  # 定义函数 quarter_range，参数：year, quarter
    start_month = (quarter - 1) * 3 + 1  # 将 (quarter - 1) * 3 + 1 赋给 start_month
    end_month = start_month + 2    # 将 start_month + 2 赋给 end_month
    start = date(year, start_month, 1)  # 将 date(year, start_month, 1) 赋给 start
    end = date(year, end_month, calendar.monthrange(year, end_month)[1])  # 将 date(year, end_month, calendar.monthrange(year, end_month)[1]) 赋给 end
    return start, end              # 返回 start, end
s, e = quarter_range(2024, 3)
print(f"2024 Q3: {s} ~ {e}")   # 2024-07-01 ~ 2024-09-30
\`\`\`

### 17.3 日期所在周的周一

\`\`\`python
from datetime import date, timedelta  # 从 datetime 导入 date, timedelta
def monday_of_week(d):             # 定义函数 monday_of_week，参数：d
    return d - timedelta(days=d.weekday())  # 返回 d - timedelta(days=d.weekday())
print(monday_of_week(date(2024, 8, 15)))   # 2024-08-12（周一）
\`\`\`

---

## 十八、时间的 JSON 序列化

JSON 标准没有日期类型，datetime 不能直接 \`json.dumps\`，需要转成字符串（通常用 ISO 格式）：

\`\`\`python
import json                        # 导入 json 模块
from datetime import datetime      # 从 datetime 导入 datetime
# 自定义序列化
class DateTimeEncoder(json.JSONEncoder):  # 定义类 DateTimeEncoder，继承自 json.JSONEncoder
    def default(self, obj):        # 定义函数 default，参数：self, obj
        if isinstance(obj, datetime):  # 如果 isinstance(obj, datetime) 成立
            return obj.isoformat() # 返回 obj.isoformat()
        return super().default(obj)  # 返回 super().default(obj)
data = {"event": "login", "time": datetime.now()}  # 创建字典并赋给 data
print(json.dumps(data, cls=DateTimeEncoder, ensure_ascii=False))  # 输出 json.dumps(data, cls=DateTimeEncoder, ensure_ascii=False)
\`\`\`

反序列化时再用 \`datetime.fromisoformat\` 解析回来。许多 Web 框架（FastAPI、Django REST）内置了这个转换。

---

## 十九、性能优化要点

1. **避免在循环里重复构造 datetime**：能复用就复用。
2. **大批量日期计算用整数**：把日期转成"距某基准的天数"（\`ordinal\`），用整数运算更快。
   \`\`\`python
   from datetime import date       # 从 datetime 导入 date
   n = date(2024, 8, 15).toordinal()   # 距公元 1 年的天数
   d = date.fromordinal(n)             # 转回 date
   \`\`\`
3. **时区转换只在边界做**：内部统一 UTC，减少 \`astimezone\` 调用。
4. **时间戳比 datetime 对象小且快**：存储/比较用时间戳（float），展示才转 datetime。

---

## 二十、定时任务与调度概念

很多业务需要"每隔一段时间执行一次"或"在某个时刻执行"——日志清理、数据同步、定时报表、心跳检测。Python 标准库提供了基础的定时能力，理解原理有助于使用更高级的调度框架（APScheduler、Celery）。

### 20.1 time.sleep 循环

最简单的"定时"是 \`time.sleep\` 循环：

\`\`\`python
import time                        # 导入 time 模块
while True:                        # 当 True 为真时重复执行
    do_task()                      # 调用 do_task
    time.sleep(60)   # 每 60 秒一次
\`\`\`

**问题**：\`do_task\` 本身耗时会让周期漂移；如果 \`do_task\` 崩溃整个循环就停了。生产环境很少这样写。

### 20.2 sched 模块

\`sched\` 是标准库的简单事件调度器，按"延迟时间"排队执行：

\`\`\`python
import sched, time
s = sched.scheduler(time.time, time.sleep)  # 将 sched.scheduler(time.time, time.sleep) 赋给 s
def task(msg):                     # 定义函数 task，参数：msg
    print(f"[{time.time():.0f}] {msg}")  # 输出 f"[{time.time():.0f}] {msg}"
s.enter(2, 1, task, argument=("2 秒后",))  # 对 s 调用 enter 方法，参数 2, 1, task, argument=("2 秒后",)
s.enter(5, 1, task, argument=("5 秒后",))  # 对 s 调用 enter 方法，参数 5, 1, task, argument=("5 秒后",)
s.run()   # 阻塞，直到所有事件执行完
\`\`\`

\`s.enter(delay, priority, action, argument)\` 注册一个事件，\`s.run()\` 开始执行。\`priority\` 用于同时间事件的排序。

### 20.3 下一次整点执行

有时需要"等到下一个整点再执行"：

\`\`\`python
import time                        # 导入 time 模块
def seconds_to_next_hour():        # 定义函数 seconds_to_next_hour，无参数
    now = time.time()              # 将 time.time() 赋给 now
    return 3600 - (now % 3600)     # 返回 3600 - (now % 3600)
print(f"距下个整点还有 {seconds_to_next_hour():.0f} 秒")  # 输出 f"距下个整点还有 {seconds_to_next_hour():.0f} 秒"
\`\`\`

### 20.4 生产级调度的选择

- **APScheduler**：进程内调度，支持 cron 表达式、固定间隔、一次性任务。
- **Celery beat**：分布式任务队列的定时组件，适合多 worker。
- **系统 cron**：Linux crontab，最稳定可靠，适合后台脚本。
- **systemd timer**：现代 Linux 替代 cron，更精细的控制。

---

## 二十一、时间的相对论：UT1/TAI/UTC

虽然日常只用 UTC，但了解时间标准的历史能帮你理解一些"奇怪"现象：

| 标准 | 全称 | 说明 |
| --- | --- | --- |
| **UT1** | 世界时 | 基于地球自转的天文时间，会有微小波动 |
| **TAI** | 国际原子时 | 基于原子钟，极稳定，不随地球自转变化 |
| **UTC** | 协调世界时 | 日常使用，用闰秒对齐 UT1 和 TAI |
| **GMT** | 格林威治标准时间 | 历史名词，现多等同 UTC |
| **本地时间** | — | UTC + 时区偏移 |

**闰秒**：因为地球自转在变慢，UTC 偶尔会插入一个"23:59:60"的闰秒来和 UT1 对齐。Unix 时间戳通常**忽略闰秒**（直接跳过），所以 \`time.time()\` 不会出现 86401 秒的一天。大多数应用无需关心闰秒，但航天、金融高频交易需要。

---

## 二十二、常见时间模式速查

### 22.1 生成连续日期序列

\`\`\`python
from datetime import date, timedelta  # 从 datetime 导入 date, timedelta
def date_range(start, end):        # 定义函数 date_range，参数：start, end
    cur = start                    # 将 start 赋给 cur
    while cur <= end:              # 当 cur <= end 为真时重复执行
        yield cur                  # 产出值 cur（生成器）
        cur += timedelta(days=1)   # cur 加 timedelta(days=1)
for d in date_range(date(2024, 8, 1), date(2024, 8, 5)):  # 遍历 date_range(date(2024, 8, 1), date(2024, 8, 5))，每次取值赋给 d
    print(d)                       # 输出 d
\`\`\`

### 22.2 判断是否是周末

\`\`\`python
from datetime import date          # 从 datetime 导入 date
def is_weekend(d):                 # 定义函数 is_weekend，参数：d
    return d.weekday() >= 5   # 5=周六, 6=周日
\`\`\`

### 22.3 本月最后一天

\`\`\`python
import calendar                    # 导入 calendar 模块
from datetime import date          # 从 datetime 导入 date
def last_day_of_month(d):          # 定义函数 last_day_of_month，参数：d
    return d.replace(day=calendar.monthrange(d.year, d.month)[1])  # 返回 d.replace(day=calendar.monthrange(d.year, d.month)[1])
\`\`\`

### 22.4 友好的相对时间

\`\`\`python
from datetime import datetime, timedelta  # 从 datetime 导入 datetime, timedelta
def humanize(delta):               # 定义函数 humanize，参数：delta
    seconds = int(delta.total_seconds())  # 将 int(delta.total_seconds()) 赋给 seconds
    if seconds < 60:               # 如果 seconds < 60 成立
        return f"{seconds} 秒前"     # 返回 f"{seconds} 秒前"
    if seconds < 3600:             # 如果 seconds < 3600 成立
        return f"{seconds // 60} 分钟前"  # 返回 f"{seconds // 60} 分钟前"
    if seconds < 86400:            # 如果 seconds < 86400 成立
        return f"{seconds // 3600} 小时前"  # 返回 f"{seconds // 3600} 小时前"
    return f"{delta.days} 天前"      # 返回 f"{delta.days} 天前"
print(humanize(timedelta(seconds=30)))  # 输出 humanize(timedelta(seconds=30))
print(humanize(timedelta(minutes=5)))  # 输出 humanize(timedelta(minutes=5))
print(humanize(timedelta(hours=3)))  # 输出 humanize(timedelta(hours=3))
print(humanize(timedelta(days=2))) # 输出 humanize(timedelta(days=2))
\`\`\`

### 22.5 生成时间戳 ID

\`\`\`python
import time                        # 导入 time 模块
def ts_id():                       # 定义函数 ts_id，无参数
    return f"TS{int(time.time() * 1000)}"   # 毫秒级时间戳 ID
print(ts_id())                     # 输出 ts_id()
\`\`\`

---

## 二十三、本章小结

时间日期处理看似简单，实则是 bug 高发区。核心要点回顾：

1. **三大模块分工**：\`datetime\` 算时间对象，\`time\` 算时间戳/计时，\`calendar\` 算日历工作日。
2. **五大数据类型**：\`date\`、\`time\`、\`datetime\`、\`timedelta\`、\`timezone\`。
3. **格式化用 strftime/strptime**，跨语言交换用 ISO 8601。
4. **时区分 naive/aware**：内部一律 UTC aware，展示才转本地时区。
5. **夏令时用 zoneinfo**：\`timezone(timedelta)\` 只能固定偏移。
6. **时间戳是 UTC 秒数**，无时区，是跨语言通用表示。
7. **计时用 perf_counter**，不要用 time()。
8. **跨月加减要手动算**，或用 dateutil.relativedelta。

掌握这些，你已经能应对 95% 的时间处理需求。剩下的 5%（如历史时区变更、跨历法转换）交给专业库（\`dateutil\`、\`arrow\`、\`pendulum\`）。

---

## 本节代码演示

下面这段代码综合演示了时间日期处理的各个知识点：date/time/datetime/timedelta 的创建与运算、strftime/strptime 格式化解析、时区转换与 aware/naive 对比、Unix 时间戳、calendar 工作日计算、time 模块计时、年龄/月末等实战。`,
    code: `# ============================================================
# 第四章代码演示：时间日期处理
# ============================================================
# 演示：date/time/datetime/timedelta/timezone 的创建与运算、
# strftime/strptime、时区转换、Unix 时间戳、calendar 工作日、
# time 模块计时、年龄/月末等实战。

from datetime import date, time, datetime, timedelta, timezone
import calendar
import time as time_module

# ---- 1. date 日期 ----
print("========== 1. date 日期 ==========")
d1 = date(2024, 8, 15)
print(f"创建: {d1}")
print(f"今天: {date.today()}")
print(f"ISO 解析: {date.fromisoformat('2024-12-31')}")
print(f"时间戳转日期: {date.fromtimestamp(1700000000)}")
print(f"属性: year={d1.year}, month={d1.month}, day={d1.day}")
print(f"weekday(): {d1.weekday()} (周一=0)")
print(f"isoweekday(): {d1.isoweekday()} (周一=1)")
print(f"isocalendar(): {d1.isocalendar()}")
print(f"isoformat(): {d1.isoformat()}")
print(f"ctime(): {d1.ctime()}")
print(f"replace(year=2025): {d1.replace(year=2025)}")

# ---- 2. time 时间 ----
print("\\n========== 2. time 时间 ==========")
t1 = time(14, 30, 45, 123456)
print(f"创建: {t1}")
print(f"属性: hour={t1.hour}, minute={t1.minute}, second={t1.second}, microsecond={t1.microsecond}")
print(f"isoformat(): {t1.isoformat()}")
print(f"strftime: {t1.strftime('%H:%M:%S')}")

# ---- 3. datetime 日期时间 ----
print("\\n========== 3. datetime 日期时间 ==========")
dt = datetime(2024, 8, 15, 14, 30, 45)
print(f"创建: {dt}")
print(f"now(): {datetime.now()}")
print(f"strptime: {datetime.strptime('2024-08-15 14:30:45', '%Y-%m-%d %H:%M:%S')}")
print(f"fromisoformat: {datetime.fromisoformat('2024-08-15T14:30:45')}")
print(f"属性: {dt.year}-{dt.month}-{dt.day} {dt.hour}:{dt.minute}:{dt.second}")
print(f"提取 date(): {dt.date()}")
print(f"提取 time(): {dt.time()}")
print(f"isoformat(): {dt.isoformat()}")

# ---- 4. timedelta 时间差 ----
print("\\n========== 4. timedelta 时间差 ==========")
delta = timedelta(days=1, hours=2, minutes=30)
print(f"创建: {delta}")
print(f"days={delta.days}, seconds={delta.seconds}, microseconds={delta.microseconds}")
print(f"total_seconds(): {delta.total_seconds()}")
now = datetime.now()
print(f"现在: {now}")
print(f"明天: {now + timedelta(days=1)}")
print(f"上周: {now - timedelta(weeks=1)}")
print(f"3 小时后: {now + timedelta(hours=3)}")
diff = (now + timedelta(days=1)) - now
print(f"差值: {diff}, 总秒数: {diff.total_seconds()}")

# ---- 5. strftime 格式化 ----
print("\\n========== 5. strftime 格式化 ==========")
dt = datetime(2024, 8, 15, 14, 30, 45)
print(dt.strftime('%Y-%m-%d %H:%M:%S'))
print(dt.strftime('%Y年%m月%d日 %H时%M分'))
print(dt.strftime('%A, %B %d, %Y'))
print(dt.strftime('%Y/%m/%d %I:%M %p'))
print(dt.strftime('第 %j 天'))
print(dt.strftime('周数 U=%U W=%W'))

# ---- 6. strptime 解析 ----
print("\\n========== 6. strptime 解析 ==========")
s1 = '2024-08-15 14:30:45'
dt1 = datetime.strptime(s1, '%Y-%m-%d %H:%M:%S')
print(f"解析 '{s1}' -> {dt1}")
s2 = '2024年08月15日 14时30分'
dt2 = datetime.strptime(s2, '%Y年%m月%d日 %H时%M分')
print(f"解析 '{s2}' -> {dt2}")
s3 = 'Thu Aug 15 2024'
dt3 = datetime.strptime(s3, '%a %b %d %Y')
print(f"解析 '{s3}' -> {dt3}")

# ---- 7. 时区 aware vs naive ----
print("\\n========== 7. 时区 aware vs naive ==========")
utc = timezone.utc
beijing = timezone(timedelta(hours=8))
newyork = timezone(timedelta(hours=-5))
# naive datetime（没有时区）
naive = datetime(2024, 8, 15, 14, 0)
print(f"naive: {naive}, tzinfo={naive.tzinfo}")
# aware datetime（带时区）
aware_utc = datetime.now(utc)
print(f"aware UTC: {aware_utc}, tzinfo={aware_utc.tzinfo}")
# 时区转换
beijing_time = aware_utc.astimezone(beijing)
ny_time = aware_utc.astimezone(newyork)
print(f"北京: {beijing_time}")
print(f"纽约: {ny_time}")
# aware datetime 可以比较
print(f"UTC == 北京(转UTC): {aware_utc == beijing_time.astimezone(utc)}")

# ---- 8. Unix 时间戳 ----
print("\\n========== 8. Unix 时间戳 ==========")
ts = datetime.now(timezone.utc).timestamp()
print(f"当前时间戳: {ts}")
dt_from_ts = datetime.fromtimestamp(ts, timezone.utc)
print(f"时间戳转 datetime(UTC): {dt_from_ts}")
dt_local = datetime.fromtimestamp(ts)
print(f"时间戳转 datetime(本地): {dt_local}")
dt3 = datetime(2024, 8, 15, 14, 0, tzinfo=timezone.utc)
print(f"datetime 转时间戳: {dt3.timestamp()}")

# ---- 9. calendar 模块 ----
print("\\n========== 9. calendar 模块 ==========")
print(f"2024 是闰年: {calendar.isleap(2024)}")
print(f"2100 是闰年: {calendar.isleap(2100)}")
print(f"2000 是闰年: {calendar.isleap(2000)}")
print(f"2000-2023 间闰年数: {calendar.leapdays(2000, 2024)}")
print(f"2024 年 8 月信息(首日星期几, 天数): {calendar.monthrange(2024, 8)}")
print(f"2024 年 2 月天数: {calendar.monthrange(2024, 2)[1]}")
print(f"2024-08-15 是星期几(0=周一): {calendar.weekday(2024, 8, 15)}")
print("2024 年 8 月日历:")
print(calendar.month(2024, 8))

# ---- 10. 工作日计算 ----
print("========== 10. 工作日计算 ==========")
def count_workdays(start, end):
    days = 0
    cur = start
    while cur <= end:
        if cur.weekday() < 5:
            days += 1
        cur += timedelta(days=1)
    return days
start = date(2024, 8, 1)
end = date(2024, 8, 31)
workdays = count_workdays(start, end)
total = (end - start).days + 1
print(f"{start} 到 {end}: 共 {total} 天, 工作日 {workdays} 天, 周末 {total - workdays} 天")

# ---- 11. time 模块 ----
print("\\n========== 11. time 模块 ==========")
print(f"time.time(): {time_module.time()}")
print(f"time.perf_counter(): {time_module.perf_counter()}")
# struct_time
st = time_module.localtime()
print(f"localtime: {st.tm_year}-{st.tm_mon}-{st.tm_mday} {st.tm_hour}:{st.tm_min}:{st.tm_sec}")
print(f"  tm_wday={st.tm_wday}(周一=0), tm_yday={st.tm_yday}")
gm = time_module.gmtime()
print(f"gmtime(UTC): {gm.tm_year}-{gm.tm_mon}-{gm.tm_mday} {gm.tm_hour}:{gm.tm_min}:{gm.tm_sec}")

# ---- 12. 计时对比 ----
print("\\n========== 12. 计时 ==========")
t0 = time_module.perf_counter()
total_sum = 0
for i in range(1000000):
    total_sum += i
elapsed = time_module.perf_counter() - t0
print(f"累加 100 万耗时: {elapsed:.6f} 秒")
print(f"结果: {total_sum}")

# ---- 13. 计算年龄 ----
print("\\n========== 13. 计算年龄 ==========")
def calc_age(birth, today=None):
    today = today or date.today()
    age = today.year - birth.year
    if (today.month, today.day) < (birth.month, birth.day):
        age -= 1
    return age
print(f"1990-05-20 到 2024-08-15 的年龄: {calc_age(date(1990, 5, 20), date(2024, 8, 15))}")
print(f"1990-12-20 到 2024-08-15 的年龄: {calc_age(date(1990, 12, 20), date(2024, 8, 15))}")

# ---- 14. 月末跨月计算 ----
print("\\n========== 14. 月末跨月计算 ==========")
def add_months(d, months):
    month = d.month - 1 + months
    year = d.year + month // 12
    month = month % 12 + 1
    day = min(d.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)
print(f"2024-01-31 + 1 月 = {add_months(date(2024, 1, 31), 1)}")
print(f"2024-01-31 + 2 月 = {add_months(date(2024, 1, 31), 2)}")
print(f"2024-03-31 - 1 月 = {add_months(date(2024, 3, 31), -1)}")
print(f"2024-08-15 + 6 月 = {add_months(date(2024, 8, 15), 6)}")
print(f"2024-08-15 - 12 月 = {add_months(date(2024, 8, 15), -12)}")

# ---- 15. 两个日期相差 ----
print("\\n========== 15. 日期差值 ==========")
a = datetime(2024, 8, 15, 14, 0)
b = datetime(2024, 8, 20, 10, 30)
diff = b - a
print(f"{b} - {a}")
print(f"  天数: {diff.days}")
print(f"  剩余秒: {diff.seconds}")
print(f"  总秒数: {diff.total_seconds()}")
print(f"  总小时: {diff.total_seconds() / 3600}")

# ---- 16. 倒计时 ----
print("\\n========== 16. 倒计时 ==========")
target = datetime(2025, 1, 1, 0, 0, 0)
now = datetime.now()
if now < target:
    remaining = target - now
    print(f"距离 2025 元旦还有 {remaining.days} 天 {remaining.seconds // 3600} 小时")
else:
    print("2025 元旦已过")

# ---- 17. 本月所有日期 ----
print("\\n========== 17. 本月所有日期 ==========")
today = date.today()
first_day = today.replace(day=1)
_, days_in_month = calendar.monthrange(today.year, today.month)
print(f"{today.year}年{today.month}月共 {days_in_month} 天:")
cur = first_day
weekdays_cn = ['一', '二', '三', '四', '五', '六', '日']
for i in range(days_in_month):
    wd = weekdays_cn[cur.weekday()]
    marker = " ←今天" if cur == today else ""
    print(f"  {cur.day:2d} 日 周{wd}{marker}")
    cur += timedelta(days=1)

# ---- 18. ISO 周数 ----
print("\\n========== 18. ISO 周数 ==========")
for m in [1, 6, 8, 12]:
    d = date(2024, m, 15)
    iso = d.isocalendar()
    print(f"{d}: ISO 年={iso[0]}, 第 {iso[1]} 周, 周{iso[2]}")

# ---- 19. 时间戳与字符串互转 ----
print("\\n========== 19. 时间戳与字符串互转 ==========")
ts = 1700000000
dt_utc = datetime.fromtimestamp(ts, timezone.utc)
dt_local = datetime.fromtimestamp(ts)
print(f"时间戳 {ts}")
print(f"  UTC: {dt_utc.strftime('%Y-%m-%d %H:%M:%S %Z')}")
print(f"  本地: {dt_local.strftime('%Y-%m-%d %H:%M:%S')}")

# ---- 20. 性能计时对比 perf_counter vs time ----
print("\\n========== 20. 计时函数对比 ==========")
# perf_counter 单调递增，高精度
t0 = time_module.perf_counter()
s = sum(range(100000))
t_perf = time_module.perf_counter() - t0
# time.time 受系统时间影响
t0 = time_module.time()
s = sum(range(100000))
t_time = time_module.time() - t0
print(f"perf_counter: {t_perf*1000:.4f} ms")
print(f"time.time:     {t_time*1000:.4f} ms")
print(f"建议: 测代码耗时用 perf_counter（高精度、单调时钟）")

# ---- 21. 高精度纳秒计时 perf_counter_ns ----
print("\\n========== 21. 纳秒计时 ==========")
t0 = time_module.perf_counter_ns()
total = 0
for i in range(1000):
    total += i
elapsed_ns = time_module.perf_counter_ns() - t0
print(f"累加 1000 次耗时: {elapsed_ns} 纳秒")
print(f"  = {elapsed_ns / 1000:.3f} 微秒")
print(f"  = {elapsed_ns / 1e6:.6f} 毫秒")

# ---- 22. zoneinfo 时区与夏令时 ----
print("\\n========== 22. zoneinfo 时区 ==========")
from zoneinfo import ZoneInfo
tz_sh = ZoneInfo('Asia/Shanghai')
tz_ny = ZoneInfo('America/New_York')
tz_london = ZoneInfo('Europe/London')
tz_tokyo = ZoneInfo('Asia/Tokyo')
now_sh = datetime.now(tz_sh)
print(f"上海: {now_sh}")
print(f"纽约: {now_sh.astimezone(tz_ny)}")
print(f"伦敦: {now_sh.astimezone(tz_london)}")
print(f"东京: {now_sh.astimezone(tz_tokyo)}")
# 纽约冬天 vs 夏天偏移（夏令时）
winter = datetime(2024, 1, 15, 12, 0, tzinfo=tz_ny)
summer = datetime(2024, 7, 15, 12, 0, tzinfo=tz_ny)
print(f"纽约 1 月 15 日偏移: {winter.utcoffset()}")
print(f"纽约 7 月 15 日偏移: {summer.utcoffset()}")
print(f"  (夏天少 1 小时 = 夏令时 EDT)")

# ---- 23. 毫秒时间戳（13 位） ----
print("\\n========== 23. 毫秒时间戳 ==========")
ts_sec = time_module.time()
ts_ms = int(time_module.time() * 1000)
print(f"秒时间戳(10位): {ts_sec}")
print(f"毫秒时间戳(13位): {ts_ms}")
# 毫秒时间戳转 datetime
dt_from_ms = datetime.fromtimestamp(ts_ms / 1000, timezone.utc)
print(f"毫秒戳转 UTC: {dt_from_ms}")
dt_local_ms = datetime.fromtimestamp(ts_ms / 1000)
print(f"毫秒戳转本地: {dt_local_ms}")

# ---- 24. timeit 性能对比 ----
print("\\n========== 24. timeit 性能测试 ==========")
import timeit
# 对比列表推导 vs map
t1 = timeit.timeit('[str(n) for n in range(100)]', number=50000)
t2 = timeit.timeit('list(map(str, range(100)))', number=50000)
print(f"列表推导 50000 次: {t1:.4f}s")
print(f"map      50000 次: {t2:.4f}s")
print(f"  {'列表推导' if t1 < t2 else 'map'} 更快")
# repeat 取最优
results = timeit.repeat('[x*x for x in range(1000)]', number=10000, repeat=5)
print(f"repeat 5 轮: {[f'{r:.4f}' for r in results]}")
print(f"最优: {min(results):.4f}s, 最差: {max(results):.4f}s")

# ---- 25. 季度计算 ----
print("\\n========== 25. 季度计算 ==========")
def get_quarter(d):
    return (d.month - 1) // 3 + 1
def quarter_range(year, quarter):
    start_month = (quarter - 1) * 3 + 1
    end_month = start_month + 2
    start = date(year, start_month, 1)
    end = date(year, end_month, calendar.monthrange(year, end_month)[1])
    return start, end
for m in [1, 4, 7, 10, 12]:
    d = date(2024, m, 15)
    q = get_quarter(d)
    s, e = quarter_range(2024, q)
    print(f"{d} -> Q{q}: {s} ~ {e}")

# ---- 26. 日期所在周的周一 ----
print("\\n========== 26. 周一计算 ==========")
def monday_of_week(d):
    return d - timedelta(days=d.weekday())
def sunday_of_week(d):
    return d + timedelta(days=6 - d.weekday())
d = date(2024, 8, 15)
print(f"{d} (周{['一','二','三','四','五','六','日'][d.weekday()]})")
print(f"  本周周一: {monday_of_week(d)}")
print(f"  本周周日: {sunday_of_week(d)}")

# ---- 27. 时间的 JSON 序列化 ----
print("\\n========== 27. JSON 序列化 ==========")
import json
class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, date):
            return obj.isoformat()
        return super().default(obj)
data = {
    "event": "用户登录",
    "login_time": datetime.now(timezone.utc),
    "today": date.today(),
    "duration_seconds": 3600,
}
json_str = json.dumps(data, cls=DateTimeEncoder, ensure_ascii=False, indent=2)
print(json_str)
# 反序列化
parsed = json.loads(json_str)
dt_back = datetime.fromisoformat(parsed["login_time"])
print(f"反序列化 login_time: {dt_back}, 类型: {type(dt_back).__name__}")

# ---- 28. ordinal 整数日期运算 ----
print("\\n========== 28. ordinal 整数日期 ==========")
d = date(2024, 8, 15)
n = d.toordinal()
print(f"{d} 的 ordinal: {n}（距公元 1-01-01 的天数）")
d_back = date.fromordinal(n)
print(f"从 ordinal {n} 转回: {d_back}")
# 用 ordinal 做整数运算（比构造 date 快）
date_100days_later = date.fromordinal(n + 100)
print(f"100 天后: {date_100days_later}")
# 两个日期相差的 ordinal 就是天数
d2 = date(2025, 1, 1)
print(f"{d2} - {d} = {d2.toordinal() - d.toordinal()} 天")

# ---- 29. RFC 2822 邮件日期格式 ----
print("\\n========== 29. RFC 2822 邮件日期 ==========")
from email.utils import formatdate, parsedate_to_datetime
rfc = formatdate(time_module.time(), localtime=True)
print(f"RFC 2822: {rfc}")
dt_rfc = parsedate_to_datetime(rfc)
print(f"解析回: {dt_rfc}")
# HTTP 日期（GMT）
http_date = formatdate(time_module.time(), usegmt=True)
print(f"HTTP 日期: {http_date}")

# ---- 30. 微秒处理 ----
print("\\n========== 30. 微秒处理 ==========")
now = datetime.now()
print(f"当前时间: {now}")
print(f"微秒部分: {now.microsecond}")
print(f"毫秒部分: {now.microsecond // 1000}")
# 截断到秒
no_us = now.replace(microsecond=0)
print(f"截断到秒: {no_us}")
# 截断到毫秒
to_ms = now.replace(microsecond=(now.microsecond // 1000) * 1000)
print(f"截断到毫秒: {to_ms}")

print("\\n时间日期处理演示完成！")
`,
  },
  // =========================================================
  // 第五章：高级容器
  // =========================================================
  {
    id: "py-collections-advanced",
    group: "基础深化",
    icon: "🗃️",
    title: "高级容器",
    content: `## 高级容器

Python 内置的 \`list\`、\`dict\`、\`set\`、\`tuple\` 已经很强大，但在实际开发中常遇到一些"差点意思"的场景：频繁在两端增删元素时 \`list\` 性能差、计数时要用 \`dict\` 手动累加、配置需要分层覆盖、想要"有字段名的元组"、需要不可变列表……这些正是 \`collections\` 模块要解决的问题。

本章系统讲解 \`collections\` 的七大核心容器（\`deque\`/\`Counter\`/\`defaultdict\`/\`OrderedDict\`/\`ChainMap\`/\`namedtuple\`/\`UserDict\` 等）、\`typing.NamedTuple\` 与 \`dataclass\` 的进阶用法，以及 \`__slots__\` 内存优化技巧。

---

## 一、collections 模块总览

\`collections\` 是 Python "内置电池"的代表，提供了 7 个常用容器：

| 类 | 用途 | 对标内置 |
| --- | --- | --- |
| \`deque\` | 双端队列，两端 O(1) 增删 | \`list\`（两端 O(n)） |
| \`Counter\` | 计数器 | \`dict\` 手动计数 |
| \`defaultdict\` | 带默认值的字典 | \`dict\` + \`setdefault\` |
| \`OrderedDict\` | 有序字典 | \`dict\`（3.7+ 已有序） |
| \`ChainMap\` | 多字典链式合并 | 多次 \`update\` |
| \`namedtuple\` | 有字段名的元组 | \`tuple\` |
| \`UserDict\`/\`UserList\`/\`UserString\` | 自定义容器基类 | 继承 \`dict\` 等 |

---

## 二、deque：双端队列

\`list\` 在头部插入/删除是 O(n)（要移动后面所有元素），频繁操作很慢。\`deque\`（double-ended queue）用双向链表实现，**两端增删都是 O(1)**。

### 2.1 创建与基本操作

\`\`\`python
from collections import deque      # 从 collections 导入 deque
d = deque([1, 2, 3])               # 将 deque([1, 2, 3]) 赋给 d
d.append(4)         # 右端加
d.appendleft(0)     # 左端加
print(d)            # deque([0, 1, 2, 3, 4])
d.pop()             # 右端删，返回 4
d.popleft()         # 左端删，返回 0
print(d)            # deque([1, 2, 3])
\`\`\`

### 2.2 maxlen 固定长度

\`deque(maxlen=N)\` 创建固定长度的队列，**满后再追加会自动从另一端挤出**——非常适合做"最近 N 条记录"、"滑动窗口"：

\`\`\`python
from collections import deque      # 从 collections 导入 deque
recent = deque(maxlen=3)           # 将 deque(maxlen=3) 赋给 recent
for i in range(5):                 # 遍历 range(5)，每次取值赋给 i
    recent.append(i)               # 对 recent 调用 追加 方法，参数 i
    print(recent)                  # 输出 recent
# deque([0], maxlen=3)
# deque([0, 1], maxlen=3)
# deque([0, 1, 2], maxlen=3)
# deque([1, 2, 3], maxlen=3)   # 0 被挤出
# deque([2, 3, 4], maxlen=3)   # 1 被挤出
\`\`\`

### 2.3 性能对比

\`\`\`python
from collections import deque      # 从 collections 导入 deque
import time                        # 导入 time 模块
# list 头部插入
l = []                             # 创建列表并赋给 l
t0 = time.time()                   # 将 time.time() 赋给 t0
for _ in range(100000):            # 遍历 range(100000)，每次取值赋给 _
    l.insert(0, 1)    # O(n)，每次都要移动
print(f"list 头插 10 万次: {time.time()-t0:.3f}s")  # 输出 f"list 头插 10 万次: {time.time()-t0:.3f}s"
# deque 头部插入
d = deque()                        # 将 deque() 赋给 d
t0 = time.time()                   # 将 time.time() 赋给 t0
for _ in range(100000):            # 遍历 range(100000)，每次取值赋给 _
    d.appendleft(1)   # O(1)
print(f"deque 头插 10 万次: {time.time()-t0:.3f}s")  # 输出 f"deque 头插 10 万次: {time.time()-t0:.3f}s"
\`\`\`

deque 头插通常比 list 快上百倍。但**随机访问 \`d[i]\` deque 是 O(n)**，不如 list 的 O(1)。所以 deque 适合"只在两端操作"的场景。

### 2.4 rotate 旋转

\`deque.rotate(n)\` 把元素整体旋转 n 步（正数右移，负数左移）：

\`\`\`python
d = deque([1, 2, 3, 4, 5])         # 将 deque([1, 2, 3, 4, 5]) 赋给 d
d.rotate(2)      # 右移 2：deque([4, 5, 1, 2, 3])
d.rotate(-1)     # 左移 1：deque([5, 1, 2, 3, 4])
\`\`\`

---

## 三、Counter：计数器

\`Counter\` 是 \`dict\` 的子类，专门用来计数。它把"统计元素出现次数"这件常见的事封装得极其顺手。

### 3.1 创建与计数

\`\`\`python
from collections import Counter    # 从 collections 导入 Counter
# 从可迭代对象计数
c = Counter('abracadabra')         # 将 Counter('abracadabra') 赋给 c
print(c)   # Counter({'a': 5, 'b': 2, 'r': 2, 'c': 1, 'd': 1})
# 从列表计数
words = Counter(['apple', 'banana', 'apple', 'cherry'])  # 将 Counter(['apple', 'banana', 'apple', 'cherry']) 赋给 words
print(words)   # Counter({'apple': 2, 'banana': 1, 'cherry': 1})
# 从字典创建
c2 = Counter({'a': 3, 'b': 1})     # 将 Counter({'a': 3, 'b': 1}) 赋给 c2
\`\`\`

### 3.2 常用方法

\`\`\`python
c = Counter('abracadabra')         # 将 Counter('abracadabra') 赋给 c
print(c.most_common(2))   # [('a', 5), ('b', 2)] —— 出现最多的 2 个
print(c.most_common())    # 全部按次数降序
print(c['z'])             # 0（不存在的键返回 0，不报错！）
print(list(c.elements())) # ['a','a','a','a','a','b','b','r','r','c','d']
\`\`\`

\`Counter\` 最重要的特性：**访问不存在的键返回 0 而非 KeyError**，这是计数场景的标准行为。

### 3.3 集合运算

Counter 支持加减、交集、并集：

\`\`\`python
c1 = Counter(a=3, b=1)             # 将 Counter(a=3, b=1) 赋给 c1
c2 = Counter(a=1, b=2)             # 将 Counter(a=1, b=2) 赋给 c2
print(c1 + c2)   # Counter({'a': 4, 'b': 3})  求和
print(c1 - c2)   # Counter({'a': 2})          相减（负数被丢弃）
print(c1 & c2)   # Counter({'a': 1, 'b': 1})  交集（取最小）
print(c1 | c2)   # Counter({'a': 3, 'b': 2})  并集（取最大）
\`\`\`

这在做词频合并、去重时极其方便。

### 3.4 update 与 subtract

\`\`\`python
c = Counter('abc')                 # 将 Counter('abc') 赋给 c
c.update('aab')      # 加上新的计数
print(c)             # Counter({'a': 3, 'b': 2, 'c': 1})
c.subtract('aab')    # 减去计数
print(c)             # Counter({'a': 1, 'b': 0, 'c': 1})
\`\`\`

---

## 四、defaultdict：默认值字典

普通 \`dict\` 访问不存在的键会 \`KeyError\`，需要先用 \`setdefault\` 或 \`if\` 判断。\`defaultdict\` 在创建时指定一个"工厂函数"，访问缺失键时自动调用它生成默认值。

### 4.1 分组场景

\`\`\`python
from collections import defaultdict  # 从 collections 导入 defaultdict
# 按首字母分组单词
words = ['apple', 'ant', 'banana', 'bear', 'cat']  # 创建列表并赋给 words
groups = defaultdict(list)         # 将 defaultdict(list) 赋给 groups
for w in words:                    # 遍历 words，每次取值赋给 w
    groups[w[0]].append(w)
print(dict(groups))                # 输出 dict(groups)
# {'a': ['apple', 'ant'], 'b': ['banana', 'bear'], 'c': ['cat']}
\`\`\`

用普通 dict 要写：
\`\`\`python
groups = {}                        # 创建集合并赋给 groups
for w in words:                    # 遍历 words，每次取值赋给 w
    if w[0] not in groups:         # 如果 w[0] not in groups 成立
        groups[w[0]] = []
    groups[w[0]].append(w)
\`\`\`

\`defaultdict(list)\` 让代码干净很多。

### 4.2 常用工厂函数

| 工厂 | 默认值 | 用途 |
| --- | --- | --- |
| \`list\` | \`[]\` | 分组、收集 |
| \`set\` | \`set()\` | 去重分组 |
| \`int\` | \`0\` | 计数 |
| \`dict\` | \`{}\` | 多级字典 |
| 自定义函数 | 函数返回值 | 任意默认值 |

\`\`\`python
# 计数
count = defaultdict(int)           # 将 defaultdict(int) 赋给 count
for ch in 'hello':                 # 遍历 'hello'，每次取值赋给 ch
    count[ch] += 1
print(dict(count))   # {'h': 1, 'e': 1, 'l': 2, 'o': 1}

# 默认值为某个常量（用 lambda）
config = defaultdict(lambda: 'unknown')  # 将 defaultdict(lambda: 'unknown') 赋给 config
print(config['name'])   # 'unknown'
\`\`\`

### 4.3 defaultdict vs dict.setdefault

\`dict.setdefault(key, default)\` 也能做类似的事，但 \`defaultdict\` 有两点优势：
1. **只在缺失时调用工厂**，\`setdefault\` 每次都会求值 default（即使键已存在），有性能损耗。
2. **代码更简洁**，不用每次写 \`setdefault\`。

---

## 五、OrderedDict：有序字典

Python 3.7+ 普通 \`dict\` 已经保证**插入顺序**，所以 \`OrderedDict\` 的大部分用途被取代了。但它仍有几个独特能力：

### 5.1 move_to_end

\`\`\`python
from collections import OrderedDict  # 从 collections 导入 OrderedDict
od = OrderedDict([('a', 1), ('b', 2), ('c', 3)])  # 将 OrderedDict([('a', 1), ('b', 2), ('c', 3)]) 赋给 od
od.move_to_end('a')    # 把 a 移到末尾
print(od)              # OrderedDict([('b', 2), ('c', 3), ('a', 1)])
od.move_to_end('a', last=False)   # 移到开头
\`\`\`

这是 LRU 缓存的核心操作，普通 dict 没有这个方法。

### 5.2 popitem 先进先出

\`\`\`python
od = OrderedDict([('a', 1), ('b', 2), ('c', 3)])  # 将 OrderedDict([('a', 1), ('b', 2), ('c', 3)]) 赋给 od
print(od.popitem(last=False))   # ('a', 1) —— 弹出最早插入的
print(od.popitem())             # ('c', 3) —— 弹出最后插入的
\`\`\`

### 5.3 相等比较考虑顺序

普通 \`dict\` 比较 \`==\` 不考虑顺序（\`{'a':1,'b':2} == {'b':2,'a':1}\` 为 True），而 \`OrderedDict\` 会考虑：

\`\`\`python
from collections import OrderedDict  # 从 collections 导入 OrderedDict
print(OrderedDict([('a',1),('b',2)]) == OrderedDict([('b',2),('a',1)]))   # False
\`\`\`

---

## 六、ChainMap：链式合并

\`ChainMap\` 把多个字典"链"在一起，查找时**按顺序遍历**，返回第一个找到的值。它**不复制数据**，比 \`{**a, **b}\` 合并更省内存，且修改源字典会实时反映。

### 6.1 配置分层

\`\`\`python
from collections import ChainMap   # 从 collections 导入 ChainMap
defaults = {'host': 'localhost', 'port': 8080, 'debug': False}  # 创建字典并赋给 defaults
user_config = {'port': 3000, 'debug': True}  # 创建字典并赋给 user_config
config = ChainMap(user_config, defaults)   # user_config 优先
print(config['host'])    # 'localhost'（来自 defaults）
print(config['port'])    # 3000（来自 user_config，覆盖了 defaults）
print(config['debug'])   # True
\`\`\`

这模拟了"用户配置 > 默认配置"的分层覆盖，是命令行工具、Web 框架配置的常见模式。

### 6.2 查找顺序

\`ChainMap(m1, m2, m3)\` 查找时按 \`m1 → m2 → m3\` 顺序，第一个命中就返回。\`maps\` 属性是所有字典的列表：

\`\`\`python
print(config.maps)   # [{'port': 3000, 'debug': True}, {'host': 'localhost', ...}]
\`\`\`

### 6.3 新增层级 new_child

\`\`\`python
config2 = config.new_child({'port': 9000})   # 在最前面加一层
print(config2['port'])   # 9000
\`\`\`

---

## 七、namedtuple：命名字段元组

普通元组 \`(1, 2, 3)\` 只能用下标访问 \`t[0]\`，可读性差。\`namedtuple\` 给元组的每个位置起个名字，既能用名字访问又能用下标，且**仍然是元组**（不可变、可哈希、内存小）。

### 7.1 创建与使用

\`\`\`python
from collections import namedtuple # 从 collections 导入 namedtuple
Point = namedtuple('Point', ['x', 'y'])  # 将 namedtuple('Point', ['x', 'y']) 赋给 Point
p = Point(3, 4)                    # 将 Point(3, 4) 赋给 p
print(p.x, p.y)      # 3 4 —— 用名字访问
print(p[0], p[1])    # 3 4 —— 也能用下标
print(p._asdict())   # {'x': 3, 'y': 4} —— 转字典
\`\`\`

### 7.2 优势

- **可读性**：\`p.x\` 比 \`p[0]\` 清晰。
- **内存小**：和 tuple 一样，比对象/字典省内存。
- **可哈希**：能当字典键、放集合里。
- **兼容 tuple**：能解包 \`x, y = p\`，能当 tuple 传给老代码。

### 7.3 实用方法

\`\`\`python
p = Point(3, 4)                    # 将 Point(3, 4) 赋给 p
p2 = p._replace(x=10)   # 替换某字段，返回新对象（原对象不变）
print(p2)               # Point(x=10, y=4)
print(p._fields)        # ('x', 'y') —— 字段名元组
# 用字典创建
d = {'x': 5, 'y': 6}               # 创建字典并赋给 d
p3 = Point(**d)                    # 将 Point(**d) 赋给 p3
\`\`\`

### 7.4 常见应用

- 表示坐标、颜色、记录等不可变数据
- 替代只有数据没有方法的小类
- 函数返回多个命名值

---

## 八、typing.NamedTuple：类型注解版

\`typing.NamedTuple\` 是 \`collections.namedtuple\` 的类型注解版本，写法更现代，IDE 补全更好：

\`\`\`python
from typing import NamedTuple      # 从 typing 导入 NamedTuple
class Point(NamedTuple):           # 定义类 Point，继承自 NamedTuple
    x: float
    y: float
    label: str = 'origin'   # 支持默认值

p = Point(3.0, 4.0, 'A')           # 将 Point(3.0, 4.0, 'A') 赋给 p
print(p.x, p.label)                # 输出 p.x, p.label
\`\`\`

它和 \`collections.namedtuple\` 生成的对象本质相同，但定义时用类语法，支持类型注解和默认值，更符合现代 Python 风格。

---

## 九、dataclass 进阶

\`dataclasses.dataclass\`（Python 3.7+）是定义"数据类"的装饰器，自动生成 \`__init__\`、\`__repr__\`、\`__eq__\` 等方法。相比 namedtuple，它**可变、可继承、更灵活**。

### 9.1 基本用法

\`\`\`python
from dataclasses import dataclass, field  # 从 dataclasses 导入 dataclass, field

@dataclass
class Student:                     # 定义类 Student
    name: str
    age: int
    scores: list = field(default_factory=list)   # 可变默认值必须用 field

s = Student('Alice', 18, [90, 85]) # 将 Student('Alice', 18, [90, 85]) 赋给 s
print(s)   # Student(name='Alice', age=18, scores=[90, 85])
s.scores.append(95)
\`\`\`

**重要**：可变默认值（list、dict、set）**不能直接写** \`scores: list = []\`，会像默认参数一样被所有实例共享！必须用 \`field(default_factory=list)\`。

### 9.2 field 选项

\`\`\`python
@dataclass
class Product:                     # 定义类 Product
    name: str
    price: float
    stock: int = 0
    tags: list = field(default_factory=list)
    internal_id: str = field(default='', repr=False)   # repr=False 不出现在 repr 中
    # 比较时忽略某些字段
\`\`\`

\`field(repr=False)\` 让字段不出现在打印里，\`field(compare=False)\` 让字段不参与比较。

### 9.3 frozen 不可变

\`\`\`python
@dataclass(frozen=True)
class Color:                       # 定义类 Color
    r: int
    g: int
    b: int

c = Color(255, 0, 0)               # 将 Color(255, 0, 0) 赋给 c
c.r = 100   # ❌ FrozenInstanceError
\`\`\`

\`frozen=True\` 让 dataclass 不可变，可哈希，能当字典键。

### 9.4 dataclass vs namedtuple vs dict

| 特性 | dict | namedtuple | dataclass |
| --- | --- | --- | --- |
| 可变 | 是 | 否 | 默认是（可 frozen） |
| 类型注解 | 无 | 弱（NamedTuple 强） | 强 |
| 方法 | 无 | 少 | 多（可自定义） |
| 内存 | 中 | 小 | 中 |
| 可哈希 | 否 | 是 | frozen 时是 |

**选择建议**：纯数据只读用 \`NamedTuple\`，需要方法/可变用 \`dataclass\`，简单键值用 \`dict\`。

---

## 十、UserDict / UserList / UserString

直接继承 \`dict\`/\`list\`/\`str\` 自定义行为有个陷阱：内部方法互相调用，重写一个方法其他方法不一定走你的逻辑。\`UserDict\` 等用**组合而非继承**，内部维护一个 \`data\` 属性，重写更安全。

\`\`\`python
from collections import UserDict   # 从 collections 导入 UserDict
class CaseInsensitiveDict(UserDict):  # 定义类 CaseInsensitiveDict，继承自 UserDict
    def __setitem__(self, key, value):  # 定义函数 __setitem__，参数：self, key, value
        super().__setitem__(key.lower(), value)  # 调用 super，参数 ).__setitem__(key.lower(), value
    def __getitem__(self, key):    # 定义函数 __getitem__，参数：self, key
        return super().__getitem__(key.lower())  # 返回 super().__getitem__(key.lower())

d = CaseInsensitiveDict()          # 将 CaseInsensitiveDict() 赋给 d
d['Name'] = 'Alice'
print(d['NAME'])   # Alice（大小写不敏感）
\`\`\`

如果直接继承 \`dict\`，\`d['Name']=x\` 走 \`__setitem__\`，但 \`d.update({'Name':x})\` 可能不走，导致大小写转换失效。UserDict 避免了这种不一致。

---

## 十一、__slots__：内存优化

默认情况下，Python 对象用一个 \`__dict__\` 存储实例属性，灵活但占内存多。定义 \`__slots__\` 后，实例**用固定大小的数组存属性**，省内存、访问更快，但**不能动态添加新属性**。

\`\`\`python
class Point:                       # 定义类 Point
    __slots__ = ('x', 'y')   # 只能有 x 和 y 两个属性
    def __init__(self, x, y):      # 定义函数 __init__，参数：self, x, y
        self.x = x
        self.y = y

p = Point(1, 2)                    # 将 Point(1, 2) 赋给 p
p.z = 3   # ❌ AttributeError: 'Point' object has no attribute 'z'
\`\`\`

### 11.1 内存节省

\`\`\`python
import sys                         # 导入 sys 模块
class WithDict:                    # 定义类 WithDict
    def __init__(self, x, y):      # 定义函数 __init__，参数：self, x, y
        self.x = x
        self.y = y
class WithSlots:                   # 定义类 WithSlots
    __slots__ = ('x', 'y')         # 创建元组并赋给 __slots__
    def __init__(self, x, y):      # 定义函数 __init__，参数：self, x, y
        self.x = x
        self.y = y

print(sys.getsizeof(WithDict(1, 2).__dict__))   # ~104 字节
# WithSlots 没有 __dict__，省掉了这部分
\`\`\`

当创建**百万级**小对象（如解析大 CSV 每行一个对象）时，\`__slots__\` 能省 40%-50% 内存。

### 11.2 注意事项

- \`__slots__\` 会阻止实例有 \`__dict__\`，也阻止 \`__weakref__\`（除非显式加入 slots）。
- 子类如果不定义 \`__slots__\`，仍会有 \`__dict__\`，slots 失效。
- 与 dataclass 配合：\`@dataclass(slots=True)\`（Python 3.10+）自动生成 slots。

---

## 十二、容器选择决策表

| 需求 | 推荐 |
| --- | --- |
| 两端频繁增删 | \`deque\` |
| 计数元素出现次数 | \`Counter\` |
| 分组、收集 | \`defaultdict(list)\` |
| 配置分层覆盖 | \`ChainMap\` |
| 不可变命名数据 | \`NamedTuple\` |
| 可变带方法的数据 | \`dataclass\` |
| LRU 缓存 | \`OrderedDict\` |
| 大量小对象省内存 | \`__slots__\` |
| 自定义字典行为 | \`UserDict\` |

---

## 十三、deque 进阶：滑动窗口与 BFS

\`deque\` 除了基础的双端操作，还是两个经典算法场景的利器。

### 13.1 滑动窗口最大值

求一个数组里"连续 k 个元素的最大值"序列，用 deque 能做到 O(n)：

\`\`\`python
from collections import deque      # 从 collections 导入 deque
def sliding_max(nums, k):          # 定义函数 sliding_max，参数：nums, k
    dq = deque()       # 存索引，对应值保持递减
    result = []                    # 创建列表并赋给 result
    for i, n in enumerate(nums):   # 遍历 enumerate(nums)，每次取值赋给 i, n
        # 移除超出窗口的索引
        while dq and dq[0] <= i - k:  # 当 dq and dq[0] <= i - k 为真时重复执行
            dq.popleft()           # 对 dq 调用 popleft 方法
        # 维护递减：比当前小的尾部都移除
        while dq and nums[dq[-1]] < n:  # 当 dq and nums[dq[-1]] < n 为真时重复执行
            dq.pop()               # 对 dq 调用 弹出 方法
        dq.append(i)               # 对 dq 调用 追加 方法，参数 i
        if i >= k - 1:             # 如果 i >= k - 1 成立
            result.append(nums[dq[0]])  # 对 result 调用 追加 方法，参数 nums[dq[0]]
    return result                  # 返回 result
print(sliding_max([1, 3, -1, -3, 5, 3, 6, 7], 3))  # 输出 sliding_max([1, 3, -1, -3, 5, 3, 6, 7], 3)
# [3, 3, 5, 5, 6, 7]
\`\`\`

这是算法面试的经典题。关键思想：deque 维护一个"值递减"的索引序列，队首永远是当前窗口最大值。

### 13.2 BFS 广度优先搜索

树的层序遍历、图的最短路径（无权图）都用 deque 做队列：

\`\`\`python
from collections import deque      # 从 collections 导入 deque
graph = {                          # 将 { 赋给 graph
    'A': ['B', 'C'],
    'B': ['D'],
    'C': ['D', 'E'],
    'D': ['E'],
    'E': [],
}
def bfs(graph, start):             # 定义函数 bfs，参数：graph, start
    visited = set([start])         # 将 set([start]) 赋给 visited
    queue = deque([start])         # 将 deque([start]) 赋给 queue
    order = []                     # 创建列表并赋给 order
    while queue:                   # 当 queue 为真时重复执行
        node = queue.popleft()   # O(1) 出队
        order.append(node)         # 对 order 调用 追加 方法，参数 node
        for neighbor in graph[node]:  # 遍历 graph[node]，每次取值赋给 neighbor
            if neighbor not in visited:  # 如果 neighbor not in visited 成立
                visited.add(neighbor)  # 对 visited 调用 添加 方法，参数 neighbor
                queue.append(neighbor)  # 对 queue 调用 追加 方法，参数 neighbor
    return order                   # 返回 order
print(bfs(graph, 'A'))   # ['A', 'B', 'C', 'D', 'E']
\`\`\`

BFS 用 \`list.pop(0)\` 是 O(n)，处理大图会很慢；用 \`deque.popleft()\` 是 O(1)。

### 13.3 deque 的局限

- **随机访问慢**：\`d[i]\` 是 O(n)，不要用它当数组。
- **切片不支持**：\`d[1:3]\` 会报错，要先 \`list(d)\`。
- **内存比 list 大**：双向链表每个节点要存前后指针，小数据量时反而比 list 占内存。

---

## 十四、Counter 进阶：实战技巧

### 14.1 统计文件词频

\`\`\`python
from collections import Counter    # 从 collections 导入 Counter
import re                          # 导入 re 模块
with open('article.txt', encoding='utf-8') as f:  # 使用上下文管理器 open('article.txt', encoding='utf-8')，绑定到 f
    text = f.read().lower()        # 将 f.read().lower() 赋给 text
words = re.findall(r'\\w+', text)  # 将 re.findall(r'\\w+', text) 赋给 words
top10 = Counter(words).most_common(10)  # 将 Counter(words).most_common(10) 赋给 top10
\`\`\`

### 14.2 多个计数器合并

\`\`\`python
c1 = Counter(apple=5, banana=2)    # 将 Counter(apple=5, banana=2) 赋给 c1
c2 = Counter(apple=3, cherry=4)    # 将 Counter(apple=3, cherry=4) 赋给 c2
total = c1 + c2   # Counter({'apple': 8, 'cherry': 4, 'banana': 2})
\`\`\`

\`+\` 直接合并计数，比循环 \`update\` 更声明式。

### 14.3 取出前 N / 后 N

\`\`\`python
c = Counter('abracadabra')         # 将 Counter('abracadabra') 赋给 c
print(c.most_common(3))    # 前 3（最高频）
print(c.most_common()[:-4:-1])  # 后 3（最低频），技巧
\`\`\`

### 14.4 Counter 的陷阱

- \`c['z']\` 返回 0 但**不会创建键**（和 \`defaultdict(int)\` 不同，Counter 真的不写入）。
- \`+/-/&/|\` 运算会**丢弃 0 和负数**结果，需要保留 0 用 \`c.update()\`/\`c.subtract()\` 后的 \`c\` 本身。

---

## 十五、defaultdict 进阶：多级嵌套

### 15.1 任意深度嵌套字典

需要"无限深度"的嵌套字典时，用递归 defaultdict：

\`\`\`python
from collections import defaultdict  # 从 collections 导入 defaultdict
def tree():                        # 定义函数 tree，无参数
    return defaultdict(tree)   # 每个缺失键都自动创建一个新 tree
t = tree()                         # 将 tree() 赋给 t
t['a']['b']['c'] = 1
t['x']['y'] = 2
print(dict(t))   # {'a': defaultdict(...), 'x': defaultdict(...)}
\`\`\`

这是处理 JSON、嵌套配置的优雅方式。

### 15.2 defaultdict 转普通 dict

\`defaultdict\` 打印出来带 "defaultdict(...)" 前缀，不美观。转换：

\`\`\`python
import json                        # 导入 json 模块
def to_dict(d):                    # 定义函数 to_dict，参数：d
    if isinstance(d, defaultdict): # 如果 isinstance(d, defaultdict) 成立
        return {k: to_dict(v) for k, v in d.items()}  # 返回 {k: to_dict(v) for k, v in d.items()}
    return d                       # 返回 d
print(json.dumps(to_dict(t), ensure_ascii=False, indent=2))  # 输出 json.dumps(to_dict(t), ensure_ascii=False, indent=2)
\`\`\`

### 15.3 defaultdict 的坑：意外创建键

\`defaultdict\` 在**访问**（哪怕只是判断 \`in\`？不，\`in\` 不触发）缺失键时会创建它。但 \`d[k]\` 会：

\`\`\`python
d = defaultdict(list)              # 将 defaultdict(list) 赋给 d
if d['x']:        # ❌ 这会创建 d['x'] = []！
    pass                           # 空操作，占位
print(d)          # defaultdict(<class 'list'>, {'x': []})
\`\`\`

要判断是否存在又不创建，用 \`d.get('x')\` 或 \`'x' in d\`。

---

## 十六、ChainMap 进阶：写操作行为

\`ChainMap\` 的读操作按顺序查，但**写操作只影响第一层**：

\`\`\`python
from collections import ChainMap   # 从 collections 导入 ChainMap
a = {'x': 1}                       # 创建字典并赋给 a
b = {'x': 2, 'y': 3}               # 创建字典并赋给 b
c = ChainMap(a, b)                 # 将 ChainMap(a, b) 赋给 c
c['x'] = 100      # 改第一层 a，不影响 b
c['z'] = 4        # 加到第一层 a
print(c.maps)     # [{'x': 100, 'z': 4}, {'x': 2, 'y': 3}]
print(b)          # {'x': 2, 'y': 3}，b 没变
del c['x']        # 删第一层 a 的 x
\`\`\`

这符合"配置覆盖"语义：修改只影响最上层（用户配置），不动默认配置。如果 \`del\` 删的键只在下层，会 \`KeyError\`。

---

## 十七、dataclass 进阶：继承与方法

### 17.1 继承

\`\`\`python
from dataclasses import dataclass  # 从 dataclasses 导入 dataclass
@dataclass
class Animal:                      # 定义类 Animal
    name: str
    age: int
@dataclass
class Dog(Animal):                 # 定义类 Dog，继承自 Animal
    breed: str
    name: str = 'unnamed'   # 子类可以加默认值，但要小心顺序

d = Dog('Buddy', 3, 'Labrador')    # 将 Dog('Buddy', 3, 'Labrador') 赋给 d
\`\`\`

继承时要注意：父类有默认值的字段，子类新加的无默认值字段会报错（参数顺序问题）。一般让所有字段都有默认值更安全。

### 17.2 post_init 后处理

\`\`\`python
from dataclasses import dataclass, field  # 从 dataclasses 导入 dataclass, field
@dataclass
class Rectangle:                   # 定义类 Rectangle
    width: float
    height: float
    area: float = field(init=False)   # 不参与 __init__
    def __post_init__(self):       # 定义函数 __post_init__，参数：self
        self.area = self.width * self.height   # 自动计算

r = Rectangle(3, 4)                # 将 Rectangle(3, 4) 赋给 r
print(r.area)   # 12
\`\`\`

\`__post_init__\` 在 \`__init__\` 后自动调用，适合做派生字段计算、参数校验。

### 17.3 asdict / astuple

\`\`\`python
from dataclasses import asdict, astuple  # 从 dataclasses 导入 asdict, astuple
r = Rectangle(3, 4)                # 将 Rectangle(3, 4) 赋给 r
print(asdict(r))   # {'width': 3, 'height': 4, 'area': 12}
print(astuple(r))  # (3, 4, 12)
\`\`\`

方便转成 JSON、传给数据库等。

---

## 十八、__slots__ 进阶：与 dataclass 配合

### 18.1 dataclass(slots=True)

Python 3.10+ 直接支持：

\`\`\`python
from dataclasses import dataclass  # 从 dataclasses 导入 dataclass
@dataclass(slots=True)
class Point:                       # 定义类 Point
    x: float
    y: float
\`\`\`

\`slots=True\` 自动生成 \`__slots__\`，省内存又保留 dataclass 的便利。

### 18.2 slots 与继承

\`\`\`python
class Base:                        # 定义类 Base
    __slots__ = ('x',)             # 创建元组并赋给 __slots__
class Derived(Base):               # 定义类 Derived，继承自 Base
    __slots__ = ('y',)   # 子类也要定义，否则会有 __dict__
d = Derived()                      # 将 Derived() 赋给 d
d.x = 1
d.y = 2
# d.z = 3  # 报错
\`\`\`

子类**必须也定义 \`__slots__\`**，否则会自动有 \`__dict__\`，父类的 slots 优化失效。

### 18.3 slots 的代价

- **不能动态加属性**：失去灵活性。
- **不影响类属性**：\`__slots__\` 只限制实例属性，类属性仍可定义。
- **pickle 兼容性**：旧版 Python pickle slots 类需要实现 \`__getstate__\`/\`__setstate__\`。

---

## 十九、性能对比总览

\`\`\`python
# 创建 100 万个对象，对比内存
class Normal:                      # 定义类 Normal
    def __init__(self, x, y): self.x, self.y = x, y
class Slotted:                     # 定义类 Slotted
    __slots__ = ('x', 'y')         # 创建元组并赋给 __slots__
    def __init__(self, x, y): self.x, self.y = x, y
# Slotted 通常比 Normal 省 40-50% 内存
\`\`\`

| 操作 | list | deque | dict | defaultdict |
| --- | --- | --- | --- | --- |
| 头部增删 | O(n) | O(1) | — | — |
| 尾部增删 | O(1) | O(1) | — | — |
| 随机访问 | O(1) | O(n) | O(1) | O(1) |
| 查找 | O(n) | O(n) | O(1) | O(1) |
| 缺失键访问 | KeyError | — | KeyError | 默认值 |

---

## 二十、真实场景案例

### 20.1 日志频率统计（Counter）

\`\`\`python
from collections import Counter    # 从 collections 导入 Counter
log_levels = ['INFO', 'ERROR', 'INFO', 'WARN', 'ERROR', 'ERROR']  # 创建列表并赋给 log_levels
print(Counter(log_levels).most_common())  # 输出 Counter(log_levels).most_common()
# [('ERROR', 3), ('INFO', 2), ('WARN', 1)]
\`\`\`

### 20.2 多源配置合并（ChainMap）

\`\`\`python
from collections import ChainMap   # 从 collections 导入 ChainMap
import os                          # 导入 os 模块
env = {k: v for k, v in os.environ.items() if k.startswith('APP_')}  # 创建字典并赋给 env
file_config = {'db_host': 'localhost', 'db_port': '5432'}  # 创建字典并赋给 file_config
defaults = {'db_host': '127.0.0.1', 'db_port': '5432', 'debug': 'false'}  # 创建字典并赋给 defaults
config = ChainMap(env, file_config, defaults)  # 将 ChainMap(env, file_config, defaults) 赋给 config
\`\`\`

### 20.3 不可变配置对象（frozen dataclass）

\`\`\`python
from dataclasses import dataclass  # 从 dataclasses 导入 dataclass
@dataclass(frozen=True)
class AppConfig:                   # 定义类 AppConfig
    host: str
    port: int
    debug: bool = False
config = AppConfig('0.0.0.0', 8080, True)  # 将 AppConfig('0.0.0.0', 8080, True) 赋给 config
# config.port = 9090  # 报错，配置不可变
\`\`\`

### 20.4 文件最近修改记录（deque maxlen）

\`\`\`python
from collections import deque      # 从 collections 导入 deque
recent_files = deque(maxlen=5)     # 将 deque(maxlen=5) 赋给 recent_files
def on_file_modified(path):        # 定义函数 on_file_modified，参数：path
    recent_files.append(path)      # 对 recent_files 调用 追加 方法，参数 path
    print(f"最近修改: {list(recent_files)}")  # 输出 f"最近修改: {list(recent_files)}"
\`\`\`

---

## 二十一、常见陷阱与最佳实践

### 21.1 Counter vs defaultdict(int) 的区别

两者都能计数，但有微妙差别：

\`\`\`python
from collections import Counter, defaultdict  # 从 collections 导入 Counter, defaultdict
# Counter：访问缺失键返回 0，但不创建键
c = Counter()                      # 将 Counter() 赋给 c
print(c['x'])      # 0
print(c)           # Counter() —— 没有写入

# defaultdict(int)：访问缺失键返回 0，并创建键
d = defaultdict(int)               # 将 defaultdict(int) 赋给 d
print(d['x'])      # 0
print(d)           # defaultdict(<class 'int'>, {'x': 0}) —— 写入了
\`\`\`

需要"只读计数结果"用 Counter（更干净），需要"边访问边累加"两者都行，但 Counter 自带 \`most_common\` 等便利方法。

### 21.2 不要用 list 当队列

\`\`\`python
# ❌ 慢：list 当队列
queue = []                         # 创建列表并赋给 queue
queue.append(1)     # 入队 O(1)
queue.pop(0)        # 出队 O(n)！要移动所有元素

# ✅ 快：用 deque
from collections import deque      # 从 collections 导入 deque
queue = deque()                    # 将 deque() 赋给 queue
queue.append(1)     # 入队 O(1)
queue.popleft()     # 出队 O(1)
\`\`\`

### 21.3 dataclass 可变默认值的坑

\`\`\`python
from dataclasses import dataclass, field  # 从 dataclasses 导入 dataclass, field
# ❌ 错误：所有实例共享同一个 list
@dataclass
class Bad:                         # 定义类 Bad
    items: list = []   # ValueError！dataclass 直接禁止
# ✅ 正确：用 default_factory
@dataclass
class Good:                        # 定义类 Good
    items: list = field(default_factory=list)
\`\`\`

dataclass 比\`普通类\`更友好：直接写 \`= []\` 会**报错**而不是静默共享，强制你用 \`field(default_factory=...)\`。

### 21.4 ChainMap 不是合并字典

\`\`\`python
# ChainMap 不复制数据，改源字典会实时反映
a = {'x': 1}                       # 创建字典并赋给 a
c = ChainMap(a)                    # 将 ChainMap(a) 赋给 c
a['x'] = 99
print(c['x'])   # 99 —— 实时反映
# 如果要"快照"合并，用 {**a, **b} 复制
merged = {**a, **b}   # 独立副本
\`\`\`

---

## 二十二、本章小结

\`collections\` 模块是 Python 标准库里最实用的模块之一，掌握它能让你的代码更简洁、更高效、更 Pythonic。核心要点：

1. **deque**：两端 O(1)，适合队列/栈/滑动窗口/BFS。
2. **Counter**：计数神器，支持集合运算。
3. **defaultdict**：分组/计数/嵌套，告别手动 setdefault。
4. **OrderedDict**：move_to_end 是 LRU 缓存核心。
5. **ChainMap**：配置分层覆盖，不复制数据。
6. **namedtuple/NamedTuple**：不可变命名数据，内存小。
7. **dataclass**：可变数据类，自动生成方法，支持 frozen/slots。
8. **UserDict**：自定义字典行为的正确基类。
9. **__slots__**：百万级小对象的内存优化。

选择容器的核心原则：**用最贴合语义的工具**——需要计数就用 Counter，需要队列就用 deque，需要分组就用 defaultdict，而不是到处用 list + dict 手搓。

---

## 本节代码演示

下面这段代码综合演示了高级容器的各个知识点：deque 双端队列与性能对比、Counter 计数与集合运算、defaultdict 分组、OrderedDict 的 move_to_end、ChainMap 配置合并、namedtuple/NamedTuple、dataclass 进阶、UserDict 自定义、__slots__ 内存优化。`,
    code: `# ============================================================
# 第五章代码演示：高级容器
# ============================================================
# 演示：deque/Counter/defaultdict/OrderedDict/ChainMap/namedtuple/
# NamedTuple/dataclass/UserDict/__slots__ 的用法与性能。

from collections import deque, Counter, defaultdict, OrderedDict, ChainMap, namedtuple
from typing import NamedTuple
from dataclasses import dataclass, field
import sys
import time

# ---- 1. deque 双端队列 ----
print("========== 1. deque 双端队列 ==========")
d = deque([1, 2, 3])
d.append(4)
d.appendleft(0)
print(f"初始: {d}")
print(f"pop(): {d.pop()}")          # 右端删
print(f"popleft(): {d.popleft()}")  # 左端删
print(f"现在: {d}")

# ---- 2. deque maxlen 固定长度 ----
print("\\n========== 2. deque maxlen 滑动窗口 ==========")
recent = deque(maxlen=3)
for i in range(5):
    recent.append(i)
    print(f"  追加 {i} 后: {recent}")
print("应用：固定长度队列自动淘汰旧数据")

# ---- 3. deque 性能对比 ----
print("\\n========== 3. deque vs list 性能 ==========")
n = 100000
# list 头插
l = []
t0 = time.time()
for _ in range(n):
    l.insert(0, 1)
t_list = time.time() - t0
# deque 头插
dq = deque()
t0 = time.time()
for _ in range(n):
    dq.appendleft(1)
t_deque = time.time() - t0
print(f"list 头插 {n} 次: {t_list:.4f}s")
print(f"deque 头插 {n} 次: {t_deque:.4f}s")
print(f"deque 快 {t_list/t_deque:.1f} 倍")

# ---- 4. deque rotate 旋转 ----
print("\\n========== 4. deque rotate ==========")
d = deque([1, 2, 3, 4, 5])
print(f"原: {d}")
d.rotate(2)
print(f"rotate(2) 右移: {d}")
d.rotate(-1)
print(f"rotate(-1) 左移: {d}")

# ---- 5. Counter 计数器 ----
print("\\n========== 5. Counter 计数器 ==========")
c = Counter('abracadabra')
print(f"计数: {c}")
print(f"most_common(3): {c.most_common(3)}")
print(f"c['z'] (不存在): {c['z']}")  # 0，不报错
print(f"elements: {sorted(c.elements())}")

# ---- 6. Counter 集合运算 ----
print("\\n========== 6. Counter 集合运算 ==========")
c1 = Counter(a=3, b=1, c=2)
c2 = Counter(a=1, b=2, d=4)
print(f"c1: {c1}, c2: {c2}")
print(f"c1 + c2 (求和): {c1 + c2}")
print(f"c1 - c2 (相减): {c1 - c2}")
print(f"c1 & c2 (交集取最小): {c1 & c2}")
print(f"c1 | c2 (并集取最大): {c1 | c2}")

# ---- 7. Counter 词频统计实战 ----
print("\\n========== 7. Counter 词频统计 ==========")
text = "the quick brown fox jumps over the lazy dog the end"
word_counts = Counter(text.split())
print(f"词频: {word_counts.most_common(3)}")
top3 = word_counts.most_common(3)
print("Top 3:")
for word, cnt in top3:
    print(f"  {word}: {cnt}")

# ---- 8. defaultdict 分组 ----
print("\\n========== 8. defaultdict 分组 ==========")
students = [('Alice', 'A'), ('Bob', 'B'), ('Alice', 'B'), ('Bob', 'A'), ('Carol', 'A')]
grades = defaultdict(list)
for name, grade in students:
    grades[name].append(grade)
print("按学生分组成绩:")
for name, gs in grades.items():
    print(f"  {name}: {gs}")

# ---- 9. defaultdict 计数与多级字典 ----
print("\\n========== 9. defaultdict 进阶 ==========")
# 计数
count = defaultdict(int)
for ch in 'mississippi':
    count[ch] += 1
print(f"字符计数: {dict(count)}")
# 多级字典
tree = defaultdict(lambda: defaultdict(int))
tree['a']['x'] += 1
tree['a']['y'] += 2
tree['b']['x'] += 3
print(f"多级字典: {dict(tree)}")

# ---- 10. OrderedDict ----
print("\\n========== 10. OrderedDict ==========")
od = OrderedDict([('a', 1), ('b', 2), ('c', 3)])
print(f"初始: {od}")
od.move_to_end('a')
print(f"move_to_end('a'): {od}")
print(f"popitem(last=False) 弹出最早: {od.popitem(last=False)}")
print(f"现在: {od}")
# 比较考虑顺序
od1 = OrderedDict([('a', 1), ('b', 2)])
od2 = OrderedDict([('b', 2), ('a', 1)])
print(f"OrderedDict 顺序不同: {od1 == od2}")
print(f"dict 顺序不同: {dict(od1) == dict(od2)}")

# ---- 11. LRU 缓存模拟 ----
print("\\n========== 11. OrderedDict 模拟 LRU ==========")
class LRUCache:
    def __init__(self, capacity):
        self.cache = OrderedDict()
        self.capacity = capacity
    def get(self, key):
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)  # 访问过就移到末尾（最近使用）
        return self.cache[key]
    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)  # 淘汰最久未用
lru = LRUCache(2)
lru.put(1, 'a')
lru.put(2, 'b')
print(f"get(1): {lru.get(1)}")  # a，1 变为最近使用
lru.put(3, 'c')  # 淘汰 2
print(f"get(2): {lru.get(2)}")  # -1，已被淘汰
print(f"get(3): {lru.get(3)}")  # c

# ---- 12. ChainMap 配置合并 ----
print("\\n========== 12. ChainMap 配置合并 ==========")
defaults = {'host': 'localhost', 'port': 8080, 'debug': False, 'timeout': 30}
user_config = {'port': 3000, 'debug': True}
env_config = {'host': '0.0.0.0'}
config = ChainMap(env_config, user_config, defaults)  # 越前面优先级越高
print(f"host: {config['host']}")    # 0.0.0.0 (env)
print(f"port: {config['port']}")    # 3000 (user)
print(f"debug: {config['debug']}")  # True (user)
print(f"timeout: {config['timeout']}")  # 30 (defaults)
# 新增层级
config2 = config.new_child({'port': 9999})
print(f"new_child port: {config2['port']}")  # 9999

# ---- 13. namedtuple ----
print("\\n========== 13. namedtuple ==========")
Point = namedtuple('Point', ['x', 'y'])
p = Point(3, 4)
print(f"创建: {p}")
print(f"p.x={p.x}, p.y={p.y}")
print(f"p[0]={p[0]}, p[1]={p[1]}")
print(f"_asdict: {p._asdict()}")
p2 = p._replace(x=10)
print(f"_replace(x=10): {p2}")
print(f"_fields: {p._fields}")
# 解包
x, y = p
print(f"解包: x={x}, y={y}")

# ---- 14. typing.NamedTuple ----
print("\\n========== 14. typing.NamedTuple ==========")
class Employee(NamedTuple):
    name: str
    age: int
    department: str = 'engineering'  # 默认值

e1 = Employee('Alice', 30)
e2 = Employee('Bob', 25, 'sales')
print(f"{e1.name}, {e1.age}, {e1.department}")
print(f"{e2.name}, {e2.age}, {e2.department}")
print(f"类型: {type(e1).__name__}, 是 tuple: {isinstance(e1, tuple)}")

# ---- 15. dataclass 基础 ----
print("\\n========== 15. dataclass 基础 ==========")
@dataclass
class Student:
    name: str
    age: int
    scores: list = field(default_factory=list)
    def average(self):
        return sum(self.scores) / len(self.scores) if self.scores else 0

s1 = Student('Alice', 18, [90, 85, 88])
s2 = Student('Bob', 19)
print(f"s1: {s1}")
print(f"s1 平均分: {s1.average():.1f}")
s2.scores.append(75)
print(f"s2: {s2}")
# dataclass 自动生成 __eq__
s3 = Student('Alice', 18, [90, 85, 88])
print(f"s1 == s3: {s1 == s3}")

# ---- 16. dataclass 进阶选项 ----
print("\\n========== 16. dataclass 进阶 ==========")
@dataclass(frozen=True)
class Color:
    r: int
    g: int
    b: int
    name: str = field(default='unnamed', repr=False)

red = Color(255, 0, 0, 'red')
print(f"frozen dataclass: {red}")
print(f"可哈希: {hash(red)}")
try:
    red.r = 100
except Exception as ex:
    print(f"修改 frozen 对象报错: {type(ex).__name__}")

# ---- 17. UserDict 自定义字典 ----
print("\\n========== 17. UserDict 自定义字典 ==========")
from collections import UserDict
class CaseInsensitiveDict(UserDict):
    def __setitem__(self, key, value):
        super().__setitem__(key.lower(), value)
    def __getitem__(self, key):
        return super().__getitem__(key.lower())
    def __contains__(self, key):
        return super().__contains__(key.lower())

cid = CaseInsensitiveDict()
cid['Name'] = 'Alice'
cid['AGE'] = 30
print(f"cid['name']: {cid['name']}")
print(f"cid['age']: {cid['age']}")
print(f"'NAME' in cid: {'NAME' in cid}")
print(f"内部存储(全小写键): {dict(cid.data)}")

# ---- 18. __slots__ 内存优化 ----
print("\\n========== 18. __slots__ 内存优化 ==========")
class PointDict:
    def __init__(self, x, y):
        self.x = x
        self.y = y
class PointSlots:
    __slots__ = ('x', 'y')
    def __init__(self, x, y):
        self.x = x
        self.y = y

p1 = PointDict(1, 2)
p2 = PointSlots(1, 2)
# 对象大小对比
print(f"PointDict 实例 __dict__ 大小: {sys.getsizeof(p1.__dict__)} 字节")
print(f"PointSlots 有 __dict__? {hasattr(p2, '__dict__')}")
# slots 不能加新属性
try:
    p2.z = 3
except AttributeError as e:
    print(f"slots 加新属性报错: {e}")
# 大量对象内存对比
import sys
n = 100000
dict_objs = [PointDict(i, i+1) for i in range(n)]
slots_objs = [PointSlots(i, i+1) for i in range(n)]
# 粗略估算：slots 没有每个对象的 __dict__
print(f"创建 {n} 个对象后，slots 版本省掉了 {n} 个 __dict__")

# ---- 19. 容器综合实战：购物车统计 ----
print("\\n========== 19. 购物车统计实战 ==========")
orders = [
    ('Alice', 'apple', 3),
    ('Bob', 'banana', 2),
    ('Alice', 'apple', 1),
    ('Carol', 'apple', 5),
    ('Bob', 'cherry', 4),
    ('Alice', 'banana', 2),
]
# 按用户分组购买记录
user_orders = defaultdict(list)
for user, item, qty in orders:
    user_orders[user].append((item, qty))
print("按用户分组:")
for user, items in user_orders.items():
    total = sum(q for _, q in items)
    print(f"  {user}: {items}, 共 {total} 件")
# 统计商品销量
item_sales = Counter()
for _, item, qty in orders:
    item_sales[item] += qty
print(f"商品销量: {item_sales.most_common()}")

# ---- 20. defaultdict 嵌套 set 去重分组 ----
print("\\n========== 20. set 分组去重 ==========")
data = [('fruit', 'apple'), ('fruit', 'banana'), ('fruit', 'apple'), ('veg', 'carrot')]
groups = defaultdict(set)
for category, item in data:
    groups[category].add(item)
print(f"按类别去重分组: {dict(groups)}")

print("\\n高级容器演示完成！")
`,
  },
  // =========================================================
  // 第六章：itertools 迭代器工具实战
  // =========================================================
  {
    id: "py-itertools",
    group: "基础深化",
    icon: "🔗",
    title: "itertools 迭代器工具实战",
    content: `## itertools 迭代器工具实战

\`itertools\` 是 Python 标准库里"函数式编程"的代表，提供了一组**惰性迭代器**构造工具。它的核心理念是：**不预先生成所有数据，而是按需产出**——处理大数据流、无限序列、组合枚举时，既省内存又高效。很多 Python 内置函数（\`map\`、\`filter\`、\`zip\`、\`enumerate\`）的思想在 itertools 里都有更强大的变体。

本章系统讲解 itertools 的三大类工具：**无限迭代器**（count/cycle/repeat）、**有限迭代器**（chain/islice/takewhile/dropwhile/filterfalse/starmap/accumulate/groupby/compress/zip_longest/tee/pairwise）、**组合迭代器**（product/permutations/combinations），并通过管道式组合展示惰性求值的威力。

---

## 一、为什么需要 itertools

### 1.1 惰性求值（Lazy Evaluation）

普通列表会**一次性生成所有元素**放到内存。比如 \`range(10**8)\` 在 Python 3 是惰性的，但 \`list(range(10**8))\` 会立刻占 800MB 内存。itertools 的所有工具都是**惰性迭代器**——只在被消费时才计算下一个值，可以处理"无限序列"或"海量数据"。

\`\`\`python
import itertools                   # 导入 itertools 模块
# 无限序列：自然数 0,1,2,3,...
naturals = itertools.count()       # 将 itertools.count() 赋给 naturals
# 不会卡死！只有在消费时才一个个产出
for i, n in zip(range(5), naturals):  # 遍历 zip(range(5), naturals)，每次取值赋给 i, n
    print(n)   # 0 1 2 3 4
\`\`\`

### 1.2 内存对比

\`\`\`python
# ❌ 占内存：先造一亿个数再求和
total = sum([x for x in range(10**8)])  # 将 sum([x for x in range(10**8)]) 赋给 total
# ✅ 省内存：迭代器逐个产出
total = sum(x for x in range(10**8))   # 生成器表达式
# itertools 进一步提供更高效的组合工具
\`\`\`

### 1.3 itertools 的三类工具

| 类别 | 函数 | 用途 |
| --- | --- | --- |
| 无限迭代器 | \`count\`/\`cycle\`/\`repeat\` | 生成无限序列 |
| 有限迭代器 | \`chain\`/\`islice\`/\`takewhile\`/... | 切片、过滤、合并 |
| 组合迭代器 | \`product\`/\`permutations\`/\`combinations\` | 笛卡尔积、排列组合 |

---

## 二、无限迭代器

### 2.1 count：等差数列

\`count(start, step)\` 从 start 开始，每次加 step，**无限延续**：

\`\`\`python
import itertools                   # 导入 itertools 模块
for i in itertools.count(10, 2):   # 遍历 itertools.count(10, 2)，每次取值赋给 i
    print(i)   # 10 12 14 16 ...
    if i >= 20:                    # 如果 i >= 20 成立
        break                      # 跳出循环
# 常用：给元素配编号
for idx, val in zip(itertools.count(), ['a', 'b', 'c']):  # 遍历 zip(itertools.count(), ['a', 'b', 'c'])，每次取值赋给 idx, val
    print(idx, val)   # 0 a / 1 b / 2 c（其实 enumerate 更好）
\`\`\`

\`count\` 默认 step=1，可以是小数：\`count(0, 0.5)\` 产出 0, 0.5, 1.0, 1.5...

### 2.2 cycle：循环重复

\`cycle(iterable)\` 把可迭代对象无限循环：

\`\`\`python
import itertools                   # 导入 itertools 模块
# 红绿灯轮转
colors = itertools.cycle(['红', '绿', '黄'])  # 将 itertools.cycle(['红', '绿', '黄']) 赋给 colors
for _ in range(6):                 # 遍历 range(6)，每次取值赋给 _
    print(next(colors))   # 红 绿 黄 红 绿 黄
\`\`\`

常用场景：给数据系列配循环样式（如多个数据线轮流用颜色）。

### 2.3 repeat：重复元素

\`repeat(obj, times)\` 把同一个对象重复 n 次（或无限）：

\`\`\`python
import itertools                   # 导入 itertools 模块
print(list(itertools.repeat('A', 3)))   # ['A', 'A', 'A']
# 配合 map：9 的平方、立方、四次方
bases = [2, 3, 4]                  # 创建列表并赋给 bases
print(list(map(pow, [9, 9, 9], bases)))   # [81, 729, 6561]
# 用 repeat 更优雅
print(list(map(pow, itertools.repeat(9), [2, 3, 4])))   # [81, 729, 6561]
\`\`\`

\`repeat\` 和 \`cycle\` 的区别：\`repeat\` 重复**同一个对象**，\`cycle\` 循环**一个序列的不同元素**。

---

## 三、有限迭代器：合并与切片

### 3.1 chain：串联多个迭代器

\`chain(a, b, c)\` 把多个可迭代对象"首尾相连"，像一条流水线：

\`\`\`python
import itertools                   # 导入 itertools 模块
a = [1, 2, 3]                      # 创建列表并赋给 a
b = ['x', 'y']                     # 创建列表并赋给 b
c = (True, False)                  # 创建元组并赋给 c
print(list(itertools.chain(a, b, c)))  # 输出 list(itertools.chain(a, b, c))
# [1, 2, 3, 'x', 'y', True, False]
\`\`\`

**chain.from_iterable**：当可迭代对象本身在一个容器里时用：

\`\`\`python
nested = [[1, 2], [3, 4], [5, 6]]  # 创建列表并赋给 nested
print(list(itertools.chain.from_iterable(nested)))  # 输出 list(itertools.chain.from_iterable(nested))
# [1, 2, 3, 4, 5, 6]   —— 扁平化一层嵌套
\`\`\`

这是"展平一层嵌套列表"的标准写法，比列表推导 \`[x for sub in nested for x in sub]\` 更清晰。

### 3.2 islice：迭代器切片

普通切片 \`lst[1:5]\` 不能用在迭代器上（迭代器不支持索引）。\`islice\` 就是"迭代器版切片"：

\`\`\`python
import itertools                   # 导入 itertools 模块
infinite = itertools.count()       # 将 itertools.count() 赋给 infinite
print(list(itertools.islice(infinite, 5)))        # 前 5 个：[0,1,2,3,4]
print(list(itertools.islice(infinite, 2, 8)))     # 第 2-7 个：[2,3,4,5,6,7]
print(list(itertools.islice(infinite, 0, 10, 2))) # 步长 2：[0,2,4,6,8]
\`\`\`

\`islice(iterable, [start,] stop, [step])\`，参数和切片类似但**不支持负索引**（迭代器没法回头）。

### 3.3 zip_longest：不等长合并

内置 \`zip\` 在最短的迭代器结束时停止，\`zip_longest\` 会**用 fillvalue 填充**到最长：

\`\`\`python
import itertools                   # 导入 itertools 模块
a = [1, 2, 3]                      # 创建列表并赋给 a
b = ['x', 'y']                     # 创建列表并赋给 b
print(list(zip(a, b)))   # [(1,'x'), (2,'y')] —— zip 到最短
print(list(itertools.zip_longest(a, b, fillvalue='-')))  # 输出 list(itertools.zip_longest(a, b, fillvalue='-'))
# [(1,'x'), (2,'y'), (3,'-')]
\`\`\`

---

## 四、有限迭代器：过滤

### 4.1 takewhile / dropwhile

- \`takewhile(pred, iter)\`：**取到**条件为假为止（之前都保留）。
- \`dropwhile(pred, iter)\`：**丢到**条件为假为止（之后都保留）。

\`\`\`python
import itertools                   # 导入 itertools 模块
nums = [1, 2, 3, 4, 1, 2]          # 创建列表并赋给 nums
print(list(itertools.takewhile(lambda x: x < 4, nums)))   # [1,2,3]
print(list(itertools.dropwhile(lambda x: x < 4, nums)))   # [4,1,2]
\`\`\`

注意：它们**只判断一次"边界"**，不是全局过滤。\`takewhile\` 一旦遇到不满足的就停，后面满足的也不要了。全局过滤用 \`filter\`。

### 4.2 filterfalse

\`filterfalse(pred, iter)\` 是 \`filter\` 的反义——保留**不满足**条件的：

\`\`\`python
import itertools                   # 导入 itertools 模块
nums = [1, 2, 3, 4, 5]             # 创建列表并赋给 nums
print(list(filter(lambda x: x % 2, nums)))          # [1,3,5] 奇数
print(list(itertools.filterfalse(lambda x: x % 2, nums)))  # [2,4] 偶数
\`\`\`

### 4.3 compress：按掩码筛选

\`compress(data, selectors)\` 按 selectors 的真假保留 data 对应元素：

\`\`\`python
import itertools                   # 导入 itertools 模块
data = ['a', 'b', 'c', 'd']        # 创建列表并赋给 data
mask = [True, False, True, False]  # 创建列表并赋给 mask
print(list(itertools.compress(data, mask)))   # ['a', 'c']
\`\`\`

类似 numpy 的布尔索引，适合用另一个列表控制筛选。

---

## 五、有限迭代器：变换

### 5.1 starmap：解包后映射

\`map(func, iterable)\` 把 iterable 的每个元素传给 func。但当元素是元组、希望"解包"传参时，用 \`starmap\`：

\`\`\`python
import itertools                   # 导入 itertools 模块
pairs = [(2, 3), (4, 5), (10, 2)]  # 创建列表并赋给 pairs
print(list(itertools.starmap(pow, pairs)))   # [8, 1024, 100]
# 等价于 [pow(2,3), pow(4,5), pow(10,2)]
\`\`\`

\`map(pow, pairs)\` 会报错（pow 收到的是元组不是两个参数），\`starmap\` 会把元组解包成两个参数。

### 5.2 accumulate：累积

\`accumulate(iterable, func)\` 累积应用函数，产出每一步的中间结果：

\`\`\`python
import itertools                   # 导入 itertools 模块
import operator                    # 导入 operator 模块
nums = [1, 2, 3, 4, 5]             # 创建列表并赋给 nums
print(list(itertools.accumulate(nums)))                    # [1,3,6,10,15] 累加
print(list(itertools.accumulate(nums, operator.mul)))      # [1,2,6,24,120] 累乘
print(list(itertools.accumulate(nums, max)))               # [1,2,3,4,5] 累积最大值
\`\`\`

默认是加法。常用于"前缀和"、"滚动最值"。Python 3.8+ 支持 \`initial\` 参数指定起始值。

### 5.3 pairwise：相邻配对（Python 3.10+）

\`pairwise(iterable)\` 把相邻元素配成对：

\`\`\`python
import itertools                   # 导入 itertools 模块
print(list(itertools.pairwise([1, 2, 3, 4])))  # 输出 list(itertools.pairwise([1, 2, 3, 4]))
# [(1,2), (2,3), (3,4)]
\`\`\`

用于计算相邻差值、滑动窗口等。3.10 之前可以用 \`zip(s, s[1:])\` 模拟。

---

## 六、有限迭代器：分组

### 6.1 groupby：分组

\`groupby(iterable, key)\` 把**连续**的相同 key 元素分到一组。注意：只分**连续**的，所以要先用 key 排序：

\`\`\`python
import itertools                   # 导入 itertools 模块
data = [('apple', 3), ('banana', 2), ('apple', 1), ('cherry', 5), ('banana', 4)]  # 创建列表并赋给 data
# 先按水果名排序
data.sort(key=lambda x: x[0])      # 对 data 调用 排序 方法，参数 key=lambda x: x[0]
for fruit, group in itertools.groupby(data, key=lambda x: x[0]):  # 遍历 itertools.groupby(data, key=lambda x: x[0])，每次取值赋给 fruit, group
    print(fruit, list(group))      # 输出 fruit, list(group)
# apple [('apple',3), ('apple',1)]
# banana [('banana',2), ('banana',4)]
# cherry [('cherry',5)]
\`\`\`

**关键陷阱**：\`groupby\` 只合并**相邻**的相同键。如果不排序，相同键的非相邻元素会被分到不同组！

### 6.2 groupby 的惰性

\`groupby\` 返回的每个 group 是个迭代器，**必须在进入下一组前消费完**，否则会被丢弃：

\`\`\`python
# ❌ 错误：保存了 group 迭代器但没立即消费
groups = [(k, g) for k, g in itertools.groupby(data, key=...)]  # 创建列表并赋给 groups
# g 此时都指向最后一组，前面的丢了
# ✅ 正确：立即转成 list
groups = [(k, list(g)) for k, g in itertools.groupby(data, key=...)]  # 创建列表并赋给 groups
\`\`\`

---

## 七、组合迭代器

### 7.1 product：笛卡尔积

\`product(a, b)\` 计算笛卡尔积，等价于多层 for 循环：

\`\`\`python
import itertools                   # 导入 itertools 模块
colors = ['红', '蓝']                # 创建列表并赋给 colors
sizes = ['S', 'M', 'L']            # 创建列表并赋给 sizes
print(list(itertools.product(colors, sizes)))  # 输出 list(itertools.product(colors, sizes))
# [('红','S'), ('红','M'), ('红','L'), ('蓝','S'), ('蓝','M'), ('蓝','L')]
# 等价于 [(c, s) for c in colors for s in sizes]
\`\`\`

\`product(a, repeat=n)\` 等价于 \`product(a, a, ..., a)\`（n 个 a）：

\`\`\`python
print(list(itertools.product('AB', repeat=2)))  # 输出 list(itertools.product('AB', repeat=2))
# [('A','A'), ('A','B'), ('B','A'), ('B','B')]
\`\`\`

常用于枚举所有组合（密码爆破、配置矩阵）。

### 7.2 permutations：排列

\`permutations(iterable, r)\` 生成所有长度为 r 的**排列**（**有顺序**，不重复使用）：

\`\`\`python
import itertools                   # 导入 itertools 模块
print(list(itertools.permutations('ABC', 2)))  # 输出 list(itertools.permutations('ABC', 2))
# [('A','B'), ('A','C'), ('B','A'), ('B','C'), ('C','A'), ('C','B')]
\`\`\`

\`A(n,r) = n!/(n-r)!\`，3 选 2 排列 = 6 种。\`permutations('ABC')\` 默认 r=长度，即全排列 6 种。

### 7.3 combinations：组合

\`combinations(iterable, r)\` 生成所有长度为 r 的**组合**（**无顺序**，不重复使用）：

\`\`\`python
import itertools                   # 导入 itertools 模块
print(list(itertools.combinations('ABC', 2)))  # 输出 list(itertools.combinations('ABC', 2))
# [('A','B'), ('A','C'), ('B','C')]
\`\`\`

\`C(n,r) = n!/(r!(n-r)!)\`，3 选 2 组合 = 3 种。组合不分顺序，\`(A,B)\` 和 \`(B,A)\` 算同一个。

### 7.4 combinations_with_replacement：可重复组合

允许同一个元素用多次：

\`\`\`python
import itertools                   # 导入 itertools 模块
print(list(itertools.combinations_with_replacement('ABC', 2)))  # 输出 list(itertools.combinations_with_replacement('ABC', 2))
# [('A','A'), ('A','B'), ('A','C'), ('B','B'), ('B','C'), ('C','C')]
\`\`\`

### 7.5 排列组合区分速查

| 函数 | 顺序敏感 | 可重复 | 数量公式 |
| --- | --- | --- | --- |
| \`product\` | 是 | 是 | n^r |
| \`permutations\` | 是 | 否 | n!/(n-r)! |
| \`combinations\` | 否 | 否 | n!/(r!(n-r)!) |
| \`combinations_with_replacement\` | 否 | 是 | (n+r-1)!/(r!(n-1)!) |

---

## 八、tee：复制迭代器

\`tee(iterable, n)\` 把一个迭代器复制成 n 个**独立**的迭代器：

\`\`\`python
import itertools                   # 导入 itertools 模块
it = iter([1, 2, 3])               # 将 iter([1, 2, 3]) 赋给 it
a, b = itertools.tee(it, 2)
print(list(a))   # [1, 2, 3]
print(list(b))   # [1, 2, 3] —— 独立消费
\`\`\`

**注意**：\`tee\` 之后**不要再消费原迭代器**，否则 tee 的复制会丢失数据。它适合"需要多次遍历同一个流"的场景，但会缓存数据，大数据流慎用。

---

## 九、迭代器管道：函数式组合

itertools 的真正威力在于**像 Unix 管道一样组合**，每一步都是惰性的：

\`\`\`python
import itertools                   # 导入 itertools 模块
# 求 100 以内所有素数的平方和
def is_prime(n):                   # 定义函数 is_prime，参数：n
    if n < 2: return False
    return all(n % i for i in range(2, int(n**0.5)+1))  # 返回 all(n % i for i in range(2, int(n**0.5)+1))

pipeline = (                       # 将 ( 赋给 pipeline
    itertools.count(2)                          # 2,3,4,... 无限
    |> 不存在，Python 用生成器表达式/itertools 链
)
# 实际写法：嵌套或生成器表达式
nums = itertools.count(2)          # 将 itertools.count(2) 赋给 nums
primes = filter(is_prime, nums)                 # 惰性过滤
primes_under_100 = itertools.takewhile(lambda x: x < 100, primes)  # 将 itertools.takewhile(lambda x: x < 100, primes) 赋给 primes_under_100
squares = map(lambda x: x**2, primes_under_100)  # 将 map(lambda x: x**2, primes_under_100) 赋给 squares
print(sum(squares))   # 65796
\`\`\`

每一步都不生成中间列表，内存恒定。这是处理大数据流的标准模式。

---

## 十、常见实战模式

### 10.1 分块（chunk）

把长列表按固定大小切块：

\`\`\`python
import itertools                   # 导入 itertools 模块
def chunk(iterable, size):         # 定义函数 chunk，参数：iterable, size
    it = iter(iterable)            # 将 iter(iterable) 赋给 it
    while True:                    # 当 True 为真时重复执行
        block = list(itertools.islice(it, size))  # 将 list(itertools.islice(it, size)) 赋给 block
        if not block:              # 如果 not block 成立
            break                  # 跳出循环
        yield block                # 产出值 block（生成器）
for block in chunk(range(10), 3):  # 遍历 chunk(range(10), 3)，每次取值赋给 block
    print(block)   # [0,1,2] / [3,4,5] / [6,7,8] / [9]
\`\`\`

### 10.2 滑动窗口

\`\`\`python
import itertools                   # 导入 itertools 模块
def window(iterable, size):        # 定义函数 window，参数：iterable, size
    iters = itertools.tee(iterable, size)  # 将 itertools.tee(iterable, size) 赋给 iters
    for i, it in enumerate(iters): # 遍历 enumerate(iters)，每次取值赋给 i, it
        for _ in range(i):         # 遍历 range(i)，每次取值赋给 _
            next(it, None)         # 调用 next，参数 it, None
    return zip(*iters)             # 返回 zip(*iters)
for w in window([1,2,3,4,5], 3):   # 遍历 window([1,2,3,4,5], 3)，每次取值赋给 w
    print(w)   # (1,2,3) / (2,3,4) / (3,4,5)
\`\`\`

### 10.3 交替合并

\`\`\`python
import itertools                   # 导入 itertools 模块
a = [1, 3, 5]                      # 创建列表并赋给 a
b = [2, 4, 6]                      # 创建列表并赋给 b
print(list(itertools.chain.from_iterable(zip(a, b))))  # 输出 list(itertools.chain.from_iterable(zip(a, b)))
# [1,2,3,4,5,6]
\`\`\`

### 10.4 字典扁平化

\`\`\`python
import itertools                   # 导入 itertools 模块
d = {'a': 1, 'b': 2}               # 创建字典并赋给 d
flat = itertools.chain.from_iterable(d.items())  # 将 itertools.chain.from_iterable(d.items()) 赋给 flat
print(list(flat))   # ['a', 1, 'b', 2]
\`\`\`

---

## 十一、itertools vs 生成器表达式

很多 itertools 功能也能用生成器表达式写，但 itertools 通常**更快**（C 实现）且**更可读**：

\`\`\`python
import itertools                   # 导入 itertools 模块
nums = range(100)                  # 将 range(100) 赋给 nums
# 生成器表达式
evens = (x for x in nums if x % 2 == 0)  # 创建元组并赋给 evens
# itertools
evens2 = itertools.filterfalse(lambda x: x % 2, nums)  # 将 itertools.filterfalse(lambda x: x % 2, nums) 赋给 evens2

# chain
a, b = [1,2], [3,4]
chain1 = (x for lst in (a, b) for x in lst)  # 创建元组并赋给 chain1
chain2 = itertools.chain(a, b)   # 更清晰
\`\`\`

经验：**简单过滤用生成器表达式，复杂组合/无限/排列组合用 itertools**。

---

## 十二、性能与注意事项

### 12.1 itertools 的优势

- **惰性**：处理无限序列、大数据流不爆内存。
- **C 实现**：比纯 Python 循环快 2-10 倍。
- **可组合**：函数式风格，易于拼接管道。

### 12.2 注意事项

- **迭代器只能消费一次**：消费完就空了，要重复用就 \`tee\` 或转 list。
- **groupby 需预排序**：只合并相邻同键。
- **islice 不支持负索引**：迭代器无法回头。
- **tee 缓存**：复制大数据流会占内存。
- **不要在消费前保存 group**：groupby 的 group 是惰性迭代器。

---

## 十三、迭代器与生成器的本质关系

要真正理解 itertools，必须先搞清楚 Python 的**迭代器协议（Iterator Protocol）**。itertools 所有函数返回的都是迭代器，它们都遵循同一套底层协议。

### 13.1 可迭代对象（Iterable）vs 迭代器（Iterator）

- **可迭代对象（Iterable）**：实现了 \`__iter__()\` 方法的对象，能返回一个迭代器。list、tuple、dict、set、str 都是可迭代对象。
- **迭代器（Iterator）**：同时实现 \`__iter__()\` 和 \`__next__()\` 的对象。\`__next__()\` 每次返回下一个值，没有更多值时抛出 \`StopIteration\` 异常。

\`\`\`python
nums = [1, 2, 3]          # list 是可迭代对象，但不是迭代器
it = iter(nums)           # 调用 nums.__iter__() 得到迭代器
print(next(it))           # 调用 it.__next__() -> 1
print(next(it))           # -> 2
print(next(it))           # -> 3
print(next(it))           # 抛出 StopIteration
\`\`\`

**关键区别**：可迭代对象可以多次迭代（每次 \`iter()\` 都得到新迭代器），而迭代器只能迭代**一次**——耗尽后就空了。

### 13.2 生成器函数（Generator Function）

含 \`yield\` 关键字的函数叫**生成器函数**。调用它不会执行函数体，而是返回一个**生成器对象**（generator），生成器本身就是迭代器。

\`\`\`python
def my_count(n):                   # 定义函数 my_count，参数：n
    while True:                    # 当 True 为真时重复执行
        yield n                    # 产出值 n（生成器）
        n += 1                     # n 加 1

g = my_count(5)                    # 将 my_count(5) 赋给 g
print(next(g))   # 5
print(next(g))   # 6
\`\`\`

\`yield\` 会**暂停**函数执行并返回值，下次 \`next()\` 时从暂停处恢复。这种"暂停-恢复"机制是惰性求值的根基。

### 13.3 生成器表达式（Generator Expression）

类似列表推导式，但用圆括号，返回生成器：

\`\`\`python
squares_list = [x*x for x in range(10)]       # 立即生成 10 个值
squares_gen  = (x*x for x in range(10))       # 惰性，不占内存
\`\`\`

### 13.4 itertools 与迭代器协议的关系

itertools 的每个函数本质上都是用生成器实现的工具。例如 \`itertools.count\` 等价于：

\`\`\`python
def my_count(start=0, step=1):     # 定义函数 my_count，参数：start=0, step=1
    n = start                      # 将 start 赋给 n
    while True:                    # 当 True 为真时重复执行
        yield n                    # 产出值 n（生成器）
        n += step                  # n 加 step
\`\`\`

理解了迭代器协议，你就能：
1. **自己实现类似 itertools 的工具**（比如自定义分块、滑动窗口）。
2. **诊断"为什么我的迭代器用了一次就空了"**——因为迭代器是一次性的。
3. **写出与 itertools 互操作的代码**——任何返回迭代器的函数都能喂给 itertools。

| 概念 | 是否可重复迭代 | 是否惰性 | 示例 |
| --- | --- | --- | --- |
| list / tuple / dict | ✅ 是 | ❌ 否（一次性生成） | \`[1,2,3]\` |
| range | ✅ 是 | ✅ 是 | \`range(10)\` |
| 生成器函数返回值 | ❌ 否（一次性） | ✅ 是 | \`my_count()\` |
| 生成器表达式 | ❌ 否（一次性） | ✅ 是 | \`(x for x in r)\` |
| itertools 函数返回值 | ❌ 否（一次性） | ✅ 是 | \`count()\`, \`chain()\` |

## 十四、itertools 配合 collections 协作

itertools 负责**生成与变换**迭代流，collections 负责**存储与统计**，二者搭配是数据处理的黄金组合。

### 14.1 itertools + Counter：流式词频统计

\`\`\`python
from collections import Counter    # 从 collections 导入 Counter
import itertools                   # 导入 itertools 模块

# 模拟大文件逐行读取（不一次性载入内存）
lines = iter(["apple banana", "apple cherry", "banana apple"])  # 将 iter(["apple banana", "apple cherry", "banana apple"]) 赋给 lines

# 流式分词 + 统计
words = itertools.chain.from_iterable(line.split() for line in lines)  # 将 itertools.chain.from_iterable(line.split() for line in lines) 赋给 words
counter = Counter(words)           # 将 Counter(words) 赋给 counter
print(counter.most_common(2))   # [('apple', 3), ('banana', 2)]
\`\`\`

这里 \`chain.from_iterable\` 把每行的单词列表"摊平"成一个流，\`Counter\` 直接消费这个流。即使文件有 1 亿行，内存也只占当前处理的单词数。

### 14.2 itertools + defaultdict：构建分组索引

\`\`\`python
from collections import defaultdict  # 从 collections 导入 defaultdict
import itertools                   # 导入 itertools 模块

pairs = [("fruits", "apple"), ("fruits", "banana"), ("veg", "carrot")]  # 创建列表并赋给 pairs
index = defaultdict(list)          # 将 defaultdict(list) 赋给 index
for key, group in itertools.groupby(sorted(pairs), key=lambda x: x[0]):  # 遍历 itertools.groupby(sorted(pairs), key=lambda x: x[0])，每次取值赋给 key, group
    for _, item in group:          # 遍历 group，每次取值赋给 _, item
        index[key].append(item)
# {'fruits': ['apple', 'banana'], 'veg': ['carrot']}
\`\`\`

### 14.3 itertools + deque：滑动窗口

\`deque(maxlen=N)\` 天然适合做定长滑动窗口，配合 \`islice\` 可以处理流式数据：

\`\`\`python
from collections import deque      # 从 collections 导入 deque
import itertools                   # 导入 itertools 模块

def moving_average(iterable, n):   # 定义函数 moving_average，参数：iterable, n
    window = deque(itertools.islice(iterable, n), maxlen=n)  # 将 deque(itertools.islice(iterable, n), maxlen=n) 赋给 window
    total = sum(window)            # 将 sum(window) 赋给 total
    yield total / n                # 产出值 total / n（生成器）
    for x in iterable:             # 遍历 iterable，每次取值赋给 x
        total += x - window[0]     # total 加 x - window[0]
        window.append(x)           # 对 window 调用 追加 方法，参数 x
        yield total / n            # 产出值 total / n（生成器）
\`\`\`

### 14.4 itertools + OrderedDict：保留插入顺序去重

\`\`\`python
from collections import OrderedDict  # 从 collections 导入 OrderedDict
import itertools                   # 导入 itertools 模块

data = [3, 1, 4, 1, 5, 9, 2, 6, 5] # 创建列表并赋给 data
unique_ordered = list(OrderedDict.fromkeys(data))   # [3, 1, 4, 5, 9, 2, 6]
\`\`\`

Python 3.7+ 普通 dict 也保留插入顺序，所以 \`dict.fromkeys(data)\` 同样可行，但 \`OrderedDict\` 在更老代码里仍是标准写法。

## 十五、itertools 在数据流处理中的应用

itertools 最适合**流式处理**——数据量极大或无限，无法全部载入内存的场景。

### 15.1 大文件逐行处理

\`\`\`python
import itertools                   # 导入 itertools 模块

def read_large_file(path):         # 定义函数 read_large_file，参数：path
    with open(path, encoding="utf-8") as f:  # 使用上下文管理器 open(path, encoding="utf-8")，绑定到 f
        for line in f:             # 遍历 f，每次取值赋给 line
            yield line.strip()     # 产出值 line.strip()（生成器）

# 取前 100 行做样本
sample = list(itertools.islice(read_large_file("big.log"), 100))  # 将 list(itertools.islice(read_large_file("big.log"), 100)) 赋给 sample

# 跳过前 10 行注释，处理接下来的 1000 行
lines = read_large_file("big.log") # 将 read_large_file("big.log") 赋给 lines
lines = itertools.dropwhile(lambda x: x.startswith("#"), lines)  # 将 itertools.dropwhile(lambda x: x.startswith("#"), lines) 赋给 lines
batch = list(itertools.islice(lines, 1000))  # 将 list(itertools.islice(lines, 1000)) 赋给 batch
\`\`\`

### 15.2 管道式 ETL

把数据变换拆成多个惰性阶段，像 Unix 管道一样串起来：

\`\`\`python
def parse(line):     return line.split(",")
def filter_valid(r): return len(r) == 3
def to_dict(r):      return {"x": r[0], "y": r[1], "z": r[2]}

lines = ["a,b,c", "x,y", "1,2,3"]  # 创建列表并赋给 lines
pipeline = (                       # 将 ( 赋给 pipeline
    to_dict(r)                       # 第 3 步：转字典
    for r in filter(filter_valid,    # 第 2 步：过滤
        (parse(line) for line in lines))  # 第 1 步：解析
)
\`\`\`

每个阶段都是惰性的，整个管道不会一次性把所有数据载入内存。

### 15.3 滑动窗口统计

\`\`\`python
import itertools, collections

def sliding_window(iterable, n):   # 定义函数 sliding_window，参数：iterable, n
    window = collections.deque(itertools.islice(iterable, n), maxlen=n)  # 将 collections.deque(itertools.islice(iterable, n), maxlen=n) 赋给 window
    if len(window) == n:           # 如果 len(window) == n 成立
        yield tuple(window)        # 产出值 tuple(window)（生成器）
    for x in iterable:             # 遍历 iterable，每次取值赋给 x
        window.append(x)           # 对 window 调用 追加 方法，参数 x
        yield tuple(window)        # 产出值 tuple(window)（生成器）

# 计算 7 日移动平均
daily_prices = [10, 12, 11, 13, 14, 15, 13, 16, 18, 17]  # 创建列表并赋给 daily_prices
for w in sliding_window(daily_prices, 7):  # 遍历 sliding_window(daily_prices, 7)，每次取值赋给 w
    print(sum(w) / 7)              # 输出 sum(w) / 7
\`\`\`

### 15.4 实时聚合（accumulate 流式累加）

\`\`\`python
import itertools, operator

sales = [100, 200, 150, 300, 250]  # 创建列表并赋给 sales
cumulative = itertools.accumulate(sales)  # 将 itertools.accumulate(sales) 赋给 cumulative
print(list(cumulative))   # [100, 300, 450, 750, 1000]
\`\`\`

\`accumulate\` 是流式累加的天然工具，配合 \`max\`/\`min\` 还能算"截止当前的最大值"。

## 十六、itertools 配合 functools

\`functools\` 提供高阶函数工具，与 itertools 搭配能写出非常函数式的代码。

### 16.1 functools.reduce + itertools

\`\`\`python
from functools import reduce       # 从 functools 导入 reduce
import itertools                   # 导入 itertools 模块

# 求 1+2+...+100，用 reduce 而非 sum
total = reduce(lambda a, b: a + b, itertools.islice(itertools.count(1), 100))  # 将 reduce(lambda a, b: a + b, itertools.islice(itertools.count(1), 100)) 赋给 total
\`\`\`

注意：能用 \`sum()\` 就别用 \`reduce(operator.add, ...)\`，内置函数更快。但 \`reduce\` 适合自定义聚合逻辑（比如合并字典）。

### 16.2 functools.partial + itertools

\`partial\` 把函数的某些参数固定下来，生成新函数，常用于 itertools 的 key/func 参数：

\`\`\`python
from functools import partial      # 从 functools 导入 partial
import itertools                   # 导入 itertools 模块

def power(base, exp):              # 定义函数 power，参数：base, exp
    return base ** exp             # 返回 base ** exp

square = partial(power, exp=2)     # 将 partial(power, exp=2) 赋给 square
cube   = partial(power, exp=3)     # 将 partial(power, exp=3) 赋给 cube

print(list(map(square, range(5))))   # [0, 1, 4, 9, 16]
print(list(map(cube, range(5)))  )   # [0, 1, 8, 27, 64]
\`\`\`

### 16.3 functools.lru_cache + itertools

\`lru_cache\` 缓存函数结果，配合 \`itertools\` 处理重复计算：

\`\`\`python
from functools import lru_cache    # 从 functools 导入 lru_cache

@lru_cache(maxsize=None)
def fib(n):                        # 定义函数 fib，参数：n
    return n if n < 2 else fib(n-1) + fib(n-2)  # 返回 n if n < 2 else fib(n-1) + fib(n-2)

# 生成前 20 个斐波那契数
fibs = [fib(i) for i in range(20)] # 创建列表并赋给 fibs
\`\`\`

### 16.4 函数式管道：compose

\`\`\`python
def compose(*funcs):               # 定义函数 compose，参数：*funcs
    def composed(x):               # 定义函数 composed，参数：x
        for f in reversed(funcs):  # 遍历 reversed(funcs)，每次取值赋给 f
            x = f(x)               # 将 f(x) 赋给 x
        return x                   # 返回 x
    return composed                # 返回 composed

pipeline = compose(str, lambda x: x*2, lambda x: x+1)  # 将 compose(str, lambda x: x*2, lambda x: x+1) 赋给 pipeline
print(pipeline(5))   # 先 +1 得 6，再 *2 得 12，再 str 得 "12"
\`\`\`

## 十七、内存与性能基准测试对比

itertools 的核心卖点之一是**省内存**。下面用具体数字说明。

### 17.1 内存对比：list vs 生成器

\`\`\`python
import sys                         # 导入 sys 模块

big_list = [x for x in range(10**6)]  # 创建列表并赋给 big_list
big_gen  = (x for x in range(10**6))  # 创建元组并赋给 big_gen
print(sys.getsizeof(big_list))   # ~8 MB（800 万字节量级）
print(sys.getsizeof(big_gen) )   # ~200 字节（恒定大小）
\`\`\`

生成器只占固定大小（约 200 字节），无论产出多少个值。这是处理大数据的关键。

### 17.2 嵌套循环 vs product

\`\`\`python
# 传统双层循环
result = []                        # 创建列表并赋给 result
for i in range(100):               # 遍历 range(100)，每次取值赋给 i
    for j in range(100):           # 遍历 range(100)，每次取值赋给 j
        result.append((i, j))      # 对 result 调用 追加 方法，参数 (i, j)
# 占用 ~1 MB 内存

# itertools.product（惰性）
pairs = itertools.product(range(100), range(100))  # 将 itertools.product(range(100), range(100)) 赋给 pairs
# 只占固定大小，按需产出
\`\`\`

如果只取前 10 个组合，\`product\` 完全不需要把 1 万个组合都生成出来：

\`\`\`python
first10 = list(itertools.islice(itertools.product(range(100), range(100)), 10))  # 将 list(itertools.islice(itertools.product(range(100), range(100)), 10)) 赋给 first10
\`\`\`

### 17.3 手写循环 vs itertools 速度

itertools 用 C 实现，比纯 Python 循环快：

\`\`\`python
import timeit                      # 导入 timeit 模块

# 求和
t1 = timeit.timeit("sum(x for x in range(1000))", number=10000)  # 将 timeit.timeit("sum(x for x in range(1000))", number=10000) 赋给 t1
t2 = timeit.timeit("sum(itertools.islice(itertools.count(), 1000))",  # 将 timeit.timeit("sum(itertools.islice(itertools.count(), 1000))", 赋给 t2
                   setup="import itertools", number=10000)  # 将字符串 "import itertools", number=10000) 赋给 setup
\`\`\`

通常 \`itertools\` 版本略快，但差距不大。**真正的优势在内存**而非速度。

### 17.4 何时该用 itertools

| 场景 | 是否推荐 itertools |
| --- | --- |
| 数据量小（<1 万） | 不必强求，可读性优先 |
| 数据量大或无限 | ✅ 强烈推荐 |
| 多层嵌套循环 | ✅ 用 product 替代 |
| 流式处理 | ✅ 必用 |
| 需要随机访问 | ❌ 迭代器不支持索引 |

## 十八、常见陷阱与避坑指南

itertools 强大但有坑，下面列出最常见的几个。

### 18.1 陷阱：迭代器只能遍历一次

\`\`\`python
it = itertools.chain([1,2], [3,4]) # 将 itertools.chain([1,2], [3,4]) 赋给 it
print(list(it))   # [1, 2, 3, 4]
print(list(it))   # []  ← 已经空了！
\`\`\`

**修复**：如果需要多次遍历，用 \`list(it)\` 转成列表；或者用 \`itertools.tee\` 复制（但有内存代价）。

### 18.2 陷阱：groupby 必须先排序

\`\`\`python
data = [("a", 1), ("b", 2), ("a", 3)]   # a 不连续
for k, g in itertools.groupby(data, key=lambda x: x[0]):  # 遍历 itertools.groupby(data, key=lambda x: x[0])，每次取值赋给 k, g
    print(k, list(g))              # 输出 k, list(g)
# 输出：a [('a',1)]  b [('b',2)]  a [('a',3)]   ← 分成了 3 组！
\`\`\`

\`groupby\` 只合并**相邻同键**元素。要先按 key 排序：

\`\`\`python
data.sort(key=lambda x: x[0])   # 排序后 a 连续
\`\`\`

### 18.3 陷阱：islice 不支持负索引

\`\`\`python
list(itertools.islice([1,2,3,4,5], -2, None))   # ❌ ValueError
\`\`\`

\`islice\` 的索引必须非负。要取末尾元素，先转 list 或用 \`collections.deque\`。

### 18.4 陷阱：tee 的内存代价

\`tee(it, n)\` 复制 n 个独立迭代器，但内部要缓存已经被某个迭代器消费、但其他迭代器还没消费的值。如果各迭代器消费速度差距大，内存可能暴涨。

### 18.5 陷阱：忘记 islice 无限迭代器

\`\`\`python
for x in itertools.count():   # ❌ 死循环！
    print(x)                       # 输出 x
\`\`\`

消费无限迭代器**必须**配合 \`islice\`、\`takewhile\` 或显式 \`break\`。

### 18.6 陷阱：链式调用顺序

\`\`\`python
# 错误：先 take 再 filter
list(itertools.takewhile(lambda x: x < 5, filter(lambda x: x % 2, [1,2,3,4,5,6])))  # 调用 转为列表，参数 itertools.takewhile(lambda x: x < 5, filter(lambda x: x % 2, [1,2,3,4,5,6]))
# 正确：先 filter 再 take
list(itertools.islice(filter(lambda x: x % 2, [1,2,3,4,5,6]), 3))  # 调用 转为列表，参数 itertools.islice(filter(lambda x: x % 2, [1,2,3,4,5,6]), 3)
\`\`\`

链式管道的**顺序**会影响结果。一般原则：**先过滤再取前 N**，避免过早终止。

## 十九、itertools 在工程实战中的典型场景

### 19.1 分页处理大数据

\`\`\`python
def paginate(iterable, page_size): # 定义函数 paginate，参数：iterable, page_size
    it = iter(iterable)            # 将 iter(iterable) 赋给 it
    while True:                    # 当 True 为真时重复执行
        page = list(itertools.islice(it, page_size))  # 将 list(itertools.islice(it, page_size)) 赋给 page
        if not page:               # 如果 not page 成立
            break                  # 跳出循环
        yield page                 # 产出值 page（生成器）

for page in paginate(range(25), 10):  # 遍历 paginate(range(25), 10)，每次取值赋给 page
    print(page)   # [0..9], [10..19], [20..24]
\`\`\`

### 19.2 批量请求合并

\`\`\`python
ids = range(100)                   # 将 range(100) 赋给 ids
for batch in paginate(ids, 50):    # 遍历 paginate(ids, 50)，每次取值赋给 batch
    # 一次 API 请求处理 50 个 id，减少请求次数
    response = fetch_api(list(batch))  # 将 fetch_api(list(batch)) 赋给 response
\`\`\`

### 19.3 配置组合测试

\`\`\`python
browsers = ["chrome", "firefox", "safari"]  # 创建列表并赋给 browsers
os_list  = ["win", "mac", "linux"] # 创建列表并赋给 os_list
viewports = ["mobile", "tablet", "desktop"]  # 创建列表并赋给 viewports

for combo in itertools.product(browsers, os_list, viewports):  # 遍历 itertools.product(browsers, os_list, viewports)，每次取值赋给 combo
    browser, os_, vp = combo
    run_test(browser, os_, vp)     # 调用 run_test，参数 browser, os_, vp
\`\`\`

### 19.4 数据分片并行

\`\`\`python
import multiprocessing             # 导入 multiprocessing 模块

def chunked(iterable, n_chunks):   # 定义函数 chunked，参数：iterable, n_chunks
    data = list(iterable)          # 将 list(iterable) 赋给 data
    size = (len(data) + n_chunks - 1) // n_chunks  # 将 (len(data) + n_chunks - 1) // n_chunks 赋给 size
    for i in range(0, len(data), size):  # 遍历 range(0, len(data), size)，每次取值赋给 i
        yield data[i:i+size]       # 产出值 data[i:i+size]（生成器）

with multiprocessing.Pool(4) as pool:  # 使用上下文管理器 multiprocessing.Pool(4)，绑定到 pool
    pool.map(process, chunked(big_data, 4))  # 对 pool 调用 map 方法，参数 process, chunked(big_data, 4)
\`\`\`

### 19.5 缓存预热

\`\`\`python
# 预热前 1000 个热门 key
hot_keys = itertools.islice(get_hot_keys(), 1000)  # 将 itertools.islice(get_hot_keys(), 1000) 赋给 hot_keys
for key in hot_keys:               # 遍历 hot_keys，每次取值赋给 key
    cache.set(key, load_from_db(key))  # 对 cache 调用 set 方法，参数 key, load_from_db(key)
\`\`\`

## 二十、与其他语言迭代器工具对比

### 20.1 JavaScript 的迭代器

JS 也有迭代器协议（\`[Symbol.iterator]\`）和生成器（\`function*\`）：

\`\`\`javascript
function* count() { let n = 0; while (true) yield n++; }
const it = count();
it.next();  // { value: 0, done: false }
\`\`\`

JS 没有内置 itertools，但 Lodash/Ramda 库提供了类似工具。

### 20.2 Rust 的迭代器

Rust 的迭代器零成本抽象，编译期优化：

\`\`\`rust
(1..10).filter(|x| x % 2 == 0).map(|x| x * x).collect::<Vec<_>>()
\`\`\`

Rust 迭代器方法链与 itertools 管道风格非常相似。

### 20.3 Java Stream

Java 8+ 的 Stream API：

\`\`\`java
IntStream.range(1, 10).filter(x -> x % 2 == 0).map(x -> x * x).toArray();
\`\`\`

与 itertools 类似，Stream 也是惰性的。

### 20.4 Haskell 的惰性求值

Haskell 天生惰性，列表就是迭代器：

\`\`\`haskell
take 5 [1..]   -- [1,2,3,4,5]
\`\`\`

itertools 的 \`count()\` + \`islice(, n)\` 就是在模拟 Haskell 的 \`take n [1..]\`。

### 20.5 对比表

| 语言 | 惰性迭代 | 内置 itertools 风格库 |
| --- | --- | --- |
| Python | ✅ 生成器/itertools | ✅ itertools（标准库） |
| JavaScript | ✅ 生成器 | ❌ 需 Lodash |
| Rust | ✅ 迭代器 trait | ✅ itertools crate |
| Java | ✅ Stream | ✅ Stream API |
| Haskell | ✅ 天生惰性 | ✅ 内置 |
| Go | ❌ 无生成器 | ❌ 需 channel 模拟 |

Python 的 itertools 是少数**标准库自带**的成熟迭代器工具集，这也是 Python 在数据处理领域的优势之一。

## 二十一、本章小结

itertools 是 Python 函数式编程的精髓，掌握它意味着你能用**最省内存、最高效**的方式处理迭代问题。核心要点：

1. **三大类**：无限（count/cycle/repeat）、有限（chain/islice/filter...）、组合（product/permutations/combinations）。
2. **惰性求值**：不预生成，按需产出，能处理无限序列。
3. **chain.from_iterable**：展平一层嵌套的标准写法。
4. **islice**：迭代器版切片，不支持负索引。
5. **takewhile/dropwhile**：边界过滤，不是全局过滤。
6. **groupby 要先排序**：只合并相邻同键。
7. **product/permutations/combinations**：笛卡尔积、排列、组合的数学利器。
8. **管道组合**：像 Unix 管道一样拼接，每步惰性，内存恒定。

记住：**能惰性就别先 list**，能用 itertools 就别手写循环——这是 Python 高手的核心习惯之一。

---

## 本节代码演示

下面这段代码综合演示了 itertools 的各个工具：无限迭代器、chain/islice/zip_longest、takewhile/dropwhile/filterfalse、starmap/accumulate/pairwise、groupby 分组、product/permutations/combinations 排列组合、tee 复制、以及管道式惰性求值实战。`,
    code: `# ============================================================
# 第六章代码演示：itertools 迭代器工具实战
# ============================================================
# 演示：无限迭代器、有限迭代器、组合迭代器、管道式惰性求值。

import itertools
import operator

# ---- 1. count 无限计数 ----
print("========== 1. count 无限计数 ==========")
# 从 10 开始，步长 2
for i, n in enumerate(itertools.count(10, 2)):
    print(f"  {n}", end="")
    if i >= 4:
        break
print()
# 配编号
for idx, val in zip(itertools.count(1), ['a', 'b', 'c']):
    print(f"  {idx}: {val}")

# ---- 2. cycle 循环重复 ----
print("\\n========== 2. cycle 循环重复 ==========")
colors = itertools.cycle(['红', '绿', '黄'])
result = [next(colors) for _ in range(7)]
print(f"  红绿灯轮转: {result}")

# ---- 3. repeat 重复元素 ----
print("\\n========== 3. repeat 重复元素 ==========")
print(f"  repeat('A', 3): {list(itertools.repeat('A', 3))}")
# 配合 map：9 的 2/3/4 次方
pows = list(map(pow, itertools.repeat(9), [2, 3, 4]))
print(f"  9 的 2/3/4 次方: {pows}")

# ---- 4. chain 串联 ----
print("\\n========== 4. chain 串联 ==========")
a = [1, 2, 3]
b = ['x', 'y']
c = (True, False)
print(f"  chain(a,b,c): {list(itertools.chain(a, b, c))}")
# from_iterable 展平嵌套
nested = [[1, 2], [3, 4], [5, 6]]
print(f"  展平嵌套: {list(itertools.chain.from_iterable(nested))}")

# ---- 5. islice 切片 ----
print("\\n========== 5. islice 切片 ==========")
infinite = itertools.count()
print(f"  前 5 个: {list(itertools.islice(infinite, 5))}")
print(f"  第 2-7 个: {list(itertools.islice(itertools.count(), 2, 8))}")
print(f"  步长 2: {list(itertools.islice(itertools.count(), 0, 10, 2))}")

# ---- 6. zip_longest 不等长合并 ----
print("\\n========== 6. zip_longest ==========")
x = [1, 2, 3]
y = ['a', 'b']
print(f"  zip: {list(zip(x, y))}")
print(f"  zip_longest: {list(itertools.zip_longest(x, y, fillvalue='-'))}")

# ---- 7. takewhile / dropwhile ----
print("\\n========== 7. takewhile / dropwhile ==========")
nums = [1, 2, 3, 4, 1, 2]
print(f"  原数据: {nums}")
print(f"  takewhile(x<4): {list(itertools.takewhile(lambda n: n < 4, nums))}")
print(f"  dropwhile(x<4): {list(itertools.dropwhile(lambda n: n < 4, nums))}")

# ---- 8. filterfalse ----
print("\\n========== 8. filterfalse ==========")
nums = [1, 2, 3, 4, 5]
print(f"  filter(奇数): {list(filter(lambda n: n % 2, nums))}")
print(f"  filterfalse(奇数)=偶数: {list(itertools.filterfalse(lambda n: n % 2, nums))}")

# ---- 9. compress 掩码筛选 ----
print("\\n========== 9. compress ==========")
data = ['a', 'b', 'c', 'd', 'e']
mask = [True, False, True, False, True]
print(f"  data: {data}, mask: {mask}")
print(f"  结果: {list(itertools.compress(data, mask))}")

# ---- 10. starmap 解包映射 ----
print("\\n========== 10. starmap ==========")
pairs = [(2, 3), (4, 5), (10, 2)]
print(f"  starmap(pow, {pairs}): {list(itertools.starmap(pow, pairs))}")
# 加法
add_pairs = [(1, 2), (3, 4), (5, 6)]
print(f"  starmap(add): {list(itertools.starmap(lambda x, y: x + y, add_pairs))}")

# ---- 11. accumulate 累积 ----
print("\\n========== 11. accumulate ==========")
nums = [1, 2, 3, 4, 5]
print(f"  累加: {list(itertools.accumulate(nums))}")
print(f"  累乘: {list(itertools.accumulate(nums, operator.mul))}")
print(f"  累积最大: {list(itertools.accumulate(nums, max))}")
print(f"  累积最小: {list(itertools.accumulate(nums, min))}")

# ---- 12. pairwise 相邻配对 ----
print("\\n========== 12. pairwise ==========")
seq = [1, 2, 3, 4, 5]
print(f"  pairwise: {list(itertools.pairwise(seq))}")
# 计算相邻差值
diffs = [b - a for a, b in itertools.pairwise(seq)]
print(f"  相邻差值: {diffs}")

# ---- 13. groupby 分组 ----
print("\\n========== 13. groupby ==========")
data = [('apple', 3), ('banana', 2), ('apple', 1), ('cherry', 5), ('banana', 4)]
data.sort(key=lambda x: x[0])  # 必须先排序！
print("按水果分组:")
for fruit, group in itertools.groupby(data, key=lambda x: x[0]):
    print(f"  {fruit}: {list(group)}")
# 按首字母分组单词
words = ['apple', 'ant', 'banana', 'bear', 'cat', 'apple']
words.sort()
for letter, group in itertools.groupby(words, key=lambda w: w[0]):
    print(f"  {letter}: {list(group)}")

# ---- 14. product 笛卡尔积 ----
print("\\n========== 14. product 笛卡尔积 ==========")
colors = ['红', '蓝']
sizes = ['S', 'M', 'L']
print(f"  颜色×尺寸: {list(itertools.product(colors, sizes))}")
print(f"  product('AB', repeat=2): {list(itertools.product('AB', repeat=2))}")

# ---- 15. permutations 排列 ----
print("\\n========== 15. permutations 排列 ==========")
print(f"  perm('ABC', 2): {list(itertools.permutations('ABC', 2))}")
print(f"  perm('ABC') 全排列: {list(itertools.permutations('ABC'))}")
print(f"  数量: 3选2={len(list(itertools.permutations('ABC', 2)))}, 全排列={len(list(itertools.permutations('ABC')))}")

# ---- 16. combinations 组合 ----
print("\\n========== 16. combinations 组合 ==========")
print(f"  comb('ABC', 2): {list(itertools.combinations('ABC', 2))}")
print(f"  comb('ABCD', 3): {list(itertools.combinations('ABCD', 3))}")
print(f"  可重复: {list(itertools.combinations_with_replacement('ABC', 2))}")

# ---- 17. 排列组合数量对比 ----
print("\\n========== 17. 排列组合数量 ==========")
n, r = 5, 3
print(f"  从 {n} 个选 {r} 个:")
print(f"    product(可重复有序): {n**r}")
print(f"    permutations(不重复有序): {len(list(itertools.permutations(range(n), r)))}")
print(f"    combinations(不重复无序): {len(list(itertools.combinations(range(n), r)))}")
print(f"    combinations_with_replacement(可重复无序): {len(list(itertools.combinations_with_replacement(range(n), r)))}")

# ---- 18. tee 复制迭代器 ----
print("\\n========== 18. tee ==========")
it = iter([1, 2, 3, 4, 5])
a, b = itertools.tee(it, 2)
print(f"  副本 a: {list(a)}")
print(f"  副本 b: {list(b)}")

# ---- 19. 实战：分块 chunk ----
print("\\n========== 19. 分块 chunk ==========")
def chunk(iterable, size):
    it = iter(iterable)
    while True:
        block = list(itertools.islice(it, size))
        if not block:
            break
        yield block
for block in chunk(range(10), 3):
    print(f"  {block}")

# ---- 20. 实战：滑动窗口 ----
print("\\n========== 20. 滑动窗口 ==========")
def window(iterable, size):
    iters = itertools.tee(iterable, size)
    for i, it in enumerate(iters):
        for _ in range(i):
            next(it, None)
    return zip(*iters)
for w in window([1, 2, 3, 4, 5], 3):
    print(f"  {w}")

# ---- 21. 实战：管道式惰性求值（素数平方和）----
print("\\n========== 21. 管道式求素数平方和 ==========")
def is_prime(n):
    if n < 2:
        return False
    return all(n % i for i in range(2, int(n**0.5) + 1))
# 100 以内素数的平方和
nums = itertools.count(2)                       # 无限流
primes = filter(is_prime, nums)                 # 惰性过滤
primes_under_100 = itertools.takewhile(lambda x: x < 100, primes)  # 截断
squares = map(lambda x: x**2, primes_under_100) # 映射
result = sum(squares)
print(f"  100 以内素数平方和: {result}")
# 验证：先列出素数
primes_list = [n for n in range(2, 100) if is_prime(n)]
print(f"  100 以内素数({len(primes_list)} 个): {primes_list}")

# ---- 22. 实战：交替合并 ----
print("\\n========== 22. 交替合并 ==========")
a = [1, 3, 5, 7]
b = [2, 4, 6]
merged = list(itertools.chain.from_iterable(zip(a, b)))
print(f"  {a} + {b} 交替: {merged}")
# 不等长用 zip_longest
merged2 = list(itertools.chain.from_iterable(itertools.zip_longest(a, b, fillvalue=None)))
merged2 = [x for x in merged2 if x is not None]
print(f"  不等长交替: {merged2}")

# ---- 23. 实战：字典扁平化 ----
print("\\n========== 23. 字典扁平化 ==========")
d = {'a': 1, 'b': 2, 'c': 3}
flat = list(itertools.chain.from_iterable(d.items()))
print(f"  {d} -> {flat}")

# ---- 24. 实战：枚举密码组合 ----
print("\\n========== 24. 枚举密码组合 ==========")
# 4 位数字密码所有组合（不生成全部，只取前几个看）
pins = itertools.product('0123456789', repeat=4)
first5 = list(itertools.islice(pins, 5))
print(f"  4 位密码前 5 个: {[''.join(p) for p in first5]}")
total = 10 ** 4
print(f"  4 位密码总数: {total}（product 惰性，不占内存）")

# ---- 25. 实战：累积前缀和 ----
print("\\n========== 25. 前缀和 ==========")
nums = [3, 1, 4, 1, 5, 9, 2, 6]
prefix_sums = list(itertools.accumulate(nums))
print(f"  原数据: {nums}")
print(f"  前缀和: {prefix_sums}")

# ---- 26. 实战：分组统计 ----
print("\\n========== 26. groupby 分组统计 ==========")
records = [
    ('2024-01', 100), ('2024-01', 200), ('2024-02', 150),
    ('2024-02', 50), ('2024-03', 300),
]
records.sort(key=lambda x: x[0])
print("按月份分组求和:")
for month, group in itertools.groupby(records, key=lambda x: x[0]):
    total = sum(amt for _, amt in group)
    print(f"  {month}: {total}")

# ---- 27. 实战：round-robin 轮转 ----
print("\\n========== 27. round-robin 轮转 ==========")
def round_robin(*iterables):
    pending = len(iterables)
    nexts = itertools.cycle(iter(it).__next__ for it in iterables)
    while pending:
        try:
            for nxt in nexts:
                yield nxt()
        except StopIteration:
            pending -= 1
            nexts = itertools.cycle(itertools.islice(nexts, pending))
r = list(round_robin([1, 2, 3], ['a', 'b'], [True]))
print(f"  round_robin: {r}")

# ---- 28. 实战：唯一化（保持顺序）----
print("\\n========== 28. 唯一化 ==========")
def unique(iterable, key=None):
    seen = set()
    for item in iterable:
        k = key(item) if key else item
        if k not in seen:
            seen.add(k)
            yield item
data = [1, 3, 2, 3, 1, 4, 2, 5]
print(f"  原数据: {data}")
print(f"  去重(保序): {list(unique(data))}")
# 按绝对值去重
data2 = [1, -1, 2, -2, 3]
print(f"  按绝对值去重: {list(unique(data2, key=abs))}")

# ---- 29. 迭代器协议演示 ----
print("\\n========== 29. 迭代器协议 ==========")
nums = [10, 20, 30]
print(f"  list 是否迭代器: {hasattr(nums, '__next__')}")
it = iter(nums)
print(f"  iter() 返回类型: {type(it).__name__}")
print(f"  next 3 次: {next(it)}, {next(it)}, {next(it)}")

# 生成器函数
def gen_squares(n):
    for i in range(n):
        yield i * i
g = gen_squares(3)
print(f"  生成器: {list(g)}, 再次: {list(g)}  ← 已空")

# ---- 30. itertools + Counter 流式统计 ----
print("\\n========== 30. itertools + Counter ==========")
from collections import Counter
lines = iter(["apple banana", "apple cherry", "banana apple"])
words = itertools.chain.from_iterable(line.split() for line in lines)
counter = Counter(words)
print(f"  词频 Top2: {counter.most_common(2)}")

# ---- 31. functools.partial + itertools ----
print("\\n========== 31. functools.partial ==========")
from functools import partial, reduce, lru_cache
def power(base, exp):
    return base ** exp
square = partial(power, exp=2)
cube = partial(power, exp=3)
print(f"  square(1..5): {list(map(square, range(1, 6)))}")
print(f"  cube(1..5): {list(map(cube, range(1, 6)))}")

# reduce + itertools
total = reduce(lambda a, b: a + b, itertools.islice(itertools.count(1), 10))
print(f"  reduce 求 1..10 之和: {total}")

# lru_cache + 斐波那契
@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n-1) + fib(n-2)
print(f"  斐波那契前 10: {[fib(i) for i in range(10)]}")

# ---- 32. 内存对比 ----
print("\\n========== 32. 内存对比 ==========")
import sys
big_list = [x for x in range(10**5)]
big_gen = (x for x in range(10**5))
print(f"  list(10万) 内存: {sys.getsizeof(big_list)} 字节")
print(f"  gen(10万)  内存: {sys.getsizeof(big_gen)} 字节")
print(f"  product 惰性: {sys.getsizeof(itertools.product(range(100), range(100)))} 字节")

# ---- 33. 陷阱：迭代器耗尽 ----
print("\\n========== 33. 陷阱：迭代器耗尽 ==========")
it = itertools.chain([1, 2], [3, 4])
print(f"  第一次 list: {list(it)}")
print(f"  第二次 list: {list(it)}  ← 已空")
# 修复：用 tee 复制
it2, it3 = itertools.tee(itertools.chain([1, 2], [3, 4]))
print(f"  tee 副本1: {list(it2)}, 副本2: {list(it3)}")

# ---- 34. 陷阱：groupby 未排序 ----
print("\\n========== 34. 陷阱：groupby 未排序 ==========")
data = [("a", 1), ("b", 2), ("a", 3)]
print(f"  原数据(未排序): {data}")
print("  未排序 groupby:")
for k, grp in itertools.groupby(data, key=lambda x: x[0]):
    print(f"    {k}: {list(grp)}")
sorted_data = sorted(data, key=lambda x: x[0])
print(f"  排序后 groupby:")
for k, grp in itertools.groupby(sorted_data, key=lambda x: x[0]):
    print(f"    {k}: {list(grp)}")

# ---- 35. 实战：分页处理 ----
print("\\n========== 35. 分页处理 ==========")
def paginate(iterable, page_size):
    it = iter(iterable)
    while True:
        page = list(itertools.islice(it, page_size))
        if not page:
            break
        yield page
for i, page in enumerate(paginate(range(25), 10), 1):
    print(f"  第 {i} 页: {page}")

# ---- 36. 实战：滑动窗口 ----
print("\\n========== 36. 滑动窗口 ==========")
import collections
def sliding_window(iterable, n):
    iterable = iter(iterable)   # 关键：先转成迭代器，避免 islice 与 for 重复消费
    window = collections.deque(itertools.islice(iterable, n), maxlen=n)
    if len(window) == n:
        yield tuple(window)
    for x in iterable:
        window.append(x)
        yield tuple(window)
prices = [10, 12, 11, 13, 14, 15]
print(f"  价格: {prices}")
print(f"  3 日窗口: {list(sliding_window(prices, 3))}")

# ---- 37. 实战：配置组合测试 ----
print("\\n========== 37. 配置组合 ==========")
browsers = ["chrome", "firefox"]
viewports = ["mobile", "desktop"]
combos = list(itertools.product(browsers, viewports))
print(f"  浏览器×视口: {combos}")
print(f"  组合总数: {len(combos)}")

print("\\nitertools 迭代器工具演示完成！")
`,
  },
];
