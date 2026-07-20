export const chapters = [
  {
    id: "py6-intro",
    group: "基础入门",
    icon: "🐍",
    title: "Python 是什么？为什么学 Python？",
    content: `## Python 是什么？

Python 是一门**高级、解释型、通用**的编程语言，由荷兰程序员 Guido van Rossum 于 1991 年创造。它的设计哲学强调**代码可读性**和**简洁的语法**，让开发者能够用更少的代码表达想法。

### Python 的特点

- **简单易学**：语法接近英语，入门门槛低，适合编程初学者
- **免费开源**：任何人都可以免费使用和分发
- **跨平台**：可在 Windows、macOS、Linux 等系统上运行
- **解释型语言**：无需编译，写完直接运行，开发效率高
- **面向对象**：支持面向对象、函数式等多种编程范式
- **丰富的库**：拥有庞大的标准库和第三方生态（数据分析、AI、Web 等）

### Python 能做什么？

1. **Web 开发**：Django、Flask、FastAPI 等框架
2. **数据分析与可视化**：Pandas、NumPy、Matplotlib
3. **人工智能与机器学习**：TensorFlow、PyTorch、Scikit-learn
4. **自动化运维/脚本**：批量处理文件、自动化测试
5. **网络爬虫**：Requests、BeautifulSoup、Scrapy
6. **游戏开发**：Pygame
7. **桌面应用**：Tkinter、PyQt

### 为什么选 Python 作为第一门语言？

- 语法简洁，不用花太多时间在复杂的语法细节上
- 应用领域广，学会后可以做很多有趣的事情
- 社区活跃，遇到问题很容易找到答案
- 就业前景好，是目前最热门的编程语言之一

### 一个简单的对比

同样输出"Hello, World!"：

\`\`\`python
# Python 一行代码即可输出文本，无需类和 main 方法
print("Hello, World!")  # print() 是内置输出函数，将字符串打印到屏幕
\`\`\`

\`\`\`java
// Java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`

可以看到 Python 代码非常简洁，这就是它的魅力所在！

> 💡 **小知识**：Python 的名字来源于 BBC 的喜剧节目《Monty Python's Flying Circus》，而不是蟒蛇。Guido 是这个节目的粉丝。`,
    code: `# 第一个 Python 程序：欢迎来到 Python 的世界！
print("=" * 50)
print("    欢迎来到 Python 的世界！")
print("=" * 50)

# print() 是 Python 的输出函数，用于在屏幕上显示内容
print("\\n你好，世界！这是我的第一个 Python 程序。")

# Python 可以做计算
print("\\n--- Python 可以做数学计算 ---")
print("1 + 2 =", 1 + 2)  # 加法
print("10 - 3 =", 10 - 3)  # 减法
print("5 * 6 =", 5 * 6)  # 乘法
print("20 / 4 =", 20 / 4)  # 除法

# Python 可以处理文字
print("\\n--- Python 可以处理文字 ---")
name = "Python 学习者"
print("你好，" + name + "！")

# 用乘号打印分隔线，这是 Python 的小技巧
print("\\n" + "=" * 50)
print("Python 就是这么简单有趣！让我们开始学习吧！")
print("=" * 50)`
  },
  {
    id: "py6-install",
    group: "基础入门",
    icon: "💻",
    title: "安装 Python 与第一个程序",
    content: `## 安装 Python 与第一个程序

在开始写代码之前，我们需要先在电脑上安装 Python 环境。

### 检查是否已安装 Python

打开终端（Windows 用命令提示符或 PowerShell，macOS/Linux 用 Terminal），输入：

\`\`\`bash
python3 --version  # 查看已安装的 Python 3 版本号，输出形如 Python 3.13.0
\`\`\`

或者：

\`\`\`bash
python --version  # 部分系统用 python 命令，注意可能指向 Python 2
\`\`\`

如果显示 Python 3.x.x（比如 Python 3.13.0），说明已经安装好了。

### 下载安装 Python

如果没有安装，去官网下载：

- **官网地址**：https://www.python.org/downloads/
- 下载对应系统的最新版本（建议 3.10 以上）
- **Windows 安装注意**：安装时一定要勾选 "Add Python to PATH"！

### 运行 Python 的两种方式

#### 方式一：交互式模式（REPL）

在终端输入 \`python3\` 或 \`python\`，进入交互模式：

\`\`\`
>>> print("Hello")
Hello
>>> 1 + 1
2
\`\`\`

输入 \`exit()\` 或按 Ctrl+D 退出。

#### 方式二：脚本文件模式（推荐）

1. 创建一个以 \`.py\` 结尾的文件，比如 \`hello.py\`
2. 用文本编辑器写代码
3. 在终端运行：\`python3 hello.py\`

### 选择一个代码编辑器

推荐使用：

- **VS Code**（免费，推荐初学者）：https://code.visualstudio.com/
- **PyCharm**（功能强大）：https://www.jetbrains.com/pycharm/
- **Trae**（智能 IDE）：内置 AI 辅助

### 第一个程序：hello.py

创建文件 \`hello.py\`，写入：

\`\`\`python
print("Hello, Python!")  # 在 hello.py 中写入此行，运行后会输出该字符串
\`\`\`

然后在终端运行：

\`\`\`bash
python3 hello.py  # 用 Python 解释器执行 hello.py 脚本文件
\`\`\`

你应该会看到输出：\`Hello, Python!\`

### 常见问题

1. **"python 不是内部或外部命令"**：Python 没有添加到 PATH，重新安装并勾选 Add to PATH
2. **python 和 python3 的区别**：有些系统 python 指 Python 2，建议用 python3
3. **中文乱码**：确保文件保存为 UTF-8 编码`,
    code: `# ==========================================
# 这是你的第一个 Python 脚本文件
# 文件名可以是 hello.py
# 运行方式：在终端输入 python3 hello.py
# ==========================================

# print() 函数用于输出内容到屏幕
# 括号里的内容会被打印出来
print("Hello, World!")
print("你好，Python！")

# 可以一次打印多个内容，用逗号分隔
print("我正在学习", "Python", "编程")

# 打印数字和计算结果
print("1 + 1 =", 1 + 1)
print("3 * 5 =", 3 * 5)

# 打印空行
print()

# 打印一些装饰线
print("*" * 40)
print("    恭喜你运行了第一个 Python 程序！")
print("*" * 40)

# 小练习：试试修改上面的文字，打印你想说的话
# 比如：print("我的名字是XXX")`
  },
  {
    id: "py6-variables",
    group: "基础入门",
    icon: "📦",
    title: "变量与赋值",
    content: `## 变量与赋值

变量是编程中最基本的概念之一。你可以把变量想象成一个**贴了标签的盒子**，用来存储数据（数字、文字等），通过标签（变量名）可以随时找到和使用里面的数据。

### 什么是赋值？

在 Python 中，用等号 \`=\` 给变量赋值：

\`\`\`python
变量名 = 值  # 等号左边是变量名，右边是要存储的数据
\`\`\`

例如：

\`\`\`python
name = "小明"      # 字符串：用引号包裹的文本
age = 18           # 整数：没有小数点的数字
height = 1.75      # 浮点数：带小数点的数字
\`\`\`

这里：
- \`name\`、\`age\`、\`height\` 是变量名
- \`=\` 是赋值运算符（**不是等于**，等于用 \`==\`）
- 右边是存储的值

### 变量的特点

1. **变量可以重新赋值**：后面的值会覆盖前面的值

\`\`\`python
# 定义变量 x 并赋初值 10
x = 10
x = 20  # 重新赋值，新值 20 会覆盖旧值 10
\`\`\`

2. **Python 是动态类型语言**：变量不需要声明类型，可以赋不同类型的值

\`\`\`python
a = 10      # 此时 a 是整数类型
a = "hello" # 同一变量可重新赋值为字符串，Python 是动态类型语言
\`\`\`

3. **可以同时给多个变量赋值**

\`\`\`python
x, y, z = 1, 2, 3     # 元组解包：分别把 1、2、3 赋给 x、y、z
a = b = c = 0         # 链式赋值：三个变量都赋值为 0
\`\`\`

### 变量命名规则

- 必须以**字母**或**下划线** \`_\` 开头
- 后面可以跟字母、数字、下划线
- **区分大小写**：\`Age\` 和 \`age\` 是两个不同的变量
- 不能使用 Python 的关键字（如 if、for、while 等）

### 好的命名习惯

- 使用有意义的名字：\`student_name\` 比 \`n\` 好
- 多个单词用下划线连接（蛇形命名法）：\`user_age\`
- 小写字母开头
- 避免用中文和拼音（虽然 Python 支持，但不推荐）

### 理解赋值的本质

Python 中的赋值是**引用传递**，变量存储的是值的"引用"（可以理解为地址）。不过对于初学者，先简单理解为"盒子里装着值"就可以了。

### 常见错误

- 用数字开头：\`1name = "小明"\` ❌
- 包含特殊符号：\`my-name = "小红"\` ❌（中划线不行）
- 使用关键字：\`if = 10\` ❌`,
    code: `# 变量与赋值演示

print("=== 1. 基本赋值 ===")
# 创建变量并赋值
name = "小明"          # 字符串类型：存储文字
age = 18              # 整数类型：存储整数
height = 1.75        # 浮点数类型：存储小数
is_student = True     # 布尔类型：存储真/假

# 打印变量的值
print("姓名:", name)
print("年龄:", age)
print("身高:", height, "米")
print("是学生吗?", is_student)

print("\\n=== 2. 变量可以重新赋值 ===")
# 变量的值可以被覆盖
message = "你好"
print("第一次:", message)
message = "再见"
print("第二次:", message)  # 现在 message 变成 "再见" 了

x = 10
print("初始 x =", x)
x = x + 5  # 先计算右边 x+5=15，再赋值给 x
print("x = x + 5 后，x =", x)

print("\\n=== 3. 同时给多个变量赋值 ===")
# 一行给多个变量赋值
a, b, c = 10, 20, 30
print("a =", a, ", b =", b, ", c =", c)

# 交换两个变量的值（Python 特有技巧）
print("\\n交换前: a =", a, ", b =", b)
a, b = b, a  # 不需要临时变量！
print("交换后: a =", a, ", b =", b)

# 多个变量赋相同的值
x = y = z = 0
print("x =", x, ", y =", y, ", z =", z)

print("\\n=== 4. 用变量做计算 ===")
price = 8.5    # 苹果单价 8.5 元/斤
weight = 3     # 买了 3 斤
total = price * weight
print("苹果单价:", price, "元/斤")
print("购买重量:", weight, "斤")
print("总价:", total, "元")

print("\\n=== 5. type() 查看变量类型 ===")
# type() 函数可以查看变量的类型
print("name 的类型:", type(name))
print("age 的类型:", type(age))
print("height 的类型:", type(height))
print("is_student 的类型:", type(is_student))`
  },
  {
    id: "py6-datatypes",
    group: "基础入门",
    icon: "🔢",
    title: "基本数据类型总览",
    content: `## 基本数据类型总览

数据类型决定了数据在计算机中的存储方式和能进行的操作。Python 有以下几种基本数据类型：

### 主要数据类型一览

| 类型 | 英文名 | 例子 | 说明 |
|------|--------|------|------|
| 整数 | int | 10, -5, 0 | 没有小数点的数字 |
| 浮点数 | float | 3.14, -0.5, 1.0 | 有小数点的数字 |
| 复数 | complex | 3+4j | 数学中的复数 |
| 字符串 | str | "hello", '你好' | 用引号包裹的文字 |
| 布尔值 | bool | True, False | 只有两个值：真和假 |
| 空值 | NoneType | None | 表示什么都没有 |

### 整数（int）

- 正整数、负整数、零都是整数
- Python 的整数大小没有限制（不像其他语言有 int 范围）
- 支持二进制（0b开头）、八进制（0o开头）、十六进制（0x开头）表示

### 浮点数（float）

- 就是数学中的小数
- 可以用科学计数法表示：\`1.2e3 = 1200\`
- 注意：浮点数运算可能有精度问题（比如 0.1 + 0.2 ≠ 0.3）

### 字符串（str）

- 用单引号 \`'\`、双引号 \`"\` 或三引号包裹的文本
- 单引号和双引号没有区别
- 三引号可以写多行字符串

### 布尔值（bool）

- 只有两个值：\`True\`（真）和 \`False\`（假）
- 注意首字母大写！不是 true/false
- 常用于条件判断

### 空值（None）

- \`None\` 是一个特殊的值，表示"空"或"不存在"
- 不是 0，也不是空字符串，就是 None 类型

### 如何查看类型？

用 \`type()\` 函数：

\`\`\`python
print(type(10))      # type() 返回数据类型，整数输出 <class 'int'>
print(type(3.14))    # 浮点数输出 <class 'float'>
print(type("hello")) # 字符串输出 <class 'str'>
print(type(True))    # 布尔值输出 <class 'bool'>
\`\`\`

### 类型很重要

不同类型的数据能做的操作不同：
- 数字可以加减乘除
- 字符串可以拼接、切片
- 把字符串和数字相加会报错！

接下来的几章我们会详细讲解每种类型。`,
    code: `# Python 基本数据类型演示

print("=" * 50)
print("        Python 基本数据类型")
print("=" * 50)

print("\\n--- 1. 整数类型 (int) ---")
a = 10
b = -5
c = 0
big_num = 1000000000000000000000  # Python 支持超大整数
print("正整数:", a, "  类型:", type(a))
print("负整数:", b, "  类型:", type(b))
print("零:", c, "    类型:", type(c))
print("超大整数:", big_num)

# 不同进制表示
print("二进制 0b1010 =", 0b1010, "(即十进制10)")
print("十六进制 0xFF =", 0xFF, "(即十进制255)")

print("\\n--- 2. 浮点数类型 (float) ---")
pi = 3.14159
temp = -2.5
sci = 1.2e3  # 科学计数法：1.2 × 10^3 = 1200
print("圆周率:", pi, "  类型:", type(pi))
print("负温度:", temp)
print("科学计数法 1.2e3 =", sci)

# 浮点数精度问题
print("\\n注意浮点数精度: 0.1 + 0.2 =", 0.1 + 0.2)
print("(结果不是精确的 0.3，这是浮点数存储方式导致的)")

print("\\n--- 3. 字符串类型 (str) ---")
name = "小明"
greeting = '你好'
multi_line = """这是
多行
字符串"""
print("姓名:", name, "  类型:", type(name))
print("问候:", greeting)
print("多行字符串:")
print(multi_line)

print("\\n--- 4. 布尔类型 (bool) ---")
is_raining = True
is_sunny = False
print("在下雨吗?", is_raining, "  类型:", type(is_raining))
print("是晴天吗?", is_sunny)
print("True 实际上等于 1:", int(True))
print("False 实际上等于 0:", int(False))

print("\\n--- 5. 空值类型 (NoneType) ---")
result = None
print("result =", result, "  类型:", type(result))
print("(None 表示空值，什么都没有)")

print("\\n--- 6. 类型错误示例（注释掉了）---")
# print("年龄:" + 18)  # 字符串和数字不能直接相加，会报错 TypeError
# 正确写法：
print("年龄:" + str(18))  # str() 把数字转成字符串`
  },
  {
    id: "py6-numbers",
    group: "基础入门",
    icon: "➕",
    title: "数字类型详解（int/float/complex/算术）",
    content: `## 数字类型详解

Python 中有三种数字类型：**整数（int）**、**浮点数（float）**、**复数（complex）**。这一章我们详细学习它们和算术运算。

### 整数（int）

整数就是没有小数部分的数字，可以是正数、负数或零：

\`\`\`python
age = 25          # 正整数，不带小数点
temperature = -10 # 负整数，前面加负号
zero = 0          # 零也是整数
\`\`\`

Python 的整数**没有大小限制**，可以处理非常大的数：

\`\`\`python
big = 999999999999999999999999999999  # Python 整数无上限，不会溢出
\`\`\`

### 浮点数（float）

浮点数就是带小数点的数字：

\`\`\`python
# 浮点数赋值，圆周率
pi = 3.14159
# 浮点数赋值，价格
price = 9.9
scientific = 2.5e3  # 科学计数法：2.5 × 10³ = 2500.0
\`\`\`

⚠️ **浮点数精度问题**：由于计算机用二进制存储小数，有些十进制小数无法精确表示：

\`\`\`python
print(0.1 + 0.2)  # 受二进制存储限制，结果是 0.30000000000000004 而非 0.3
\`\`\`

这不是 Python 的 bug，而是所有编程语言都有的问题。涉及金钱等精确计算时，用 \`decimal\` 模块。

### 复数（complex）

复数由实部和虚部组成，用 \`j\` 表示虚数单位：

\`\`\`python
c = 3 + 4j       # 复数：实部 3，虚部 4，j 表示虚数单位
print(c.real)    # .real 属性获取实部，输出 3.0
print(c.imag)    # .imag 属性获取虚部，输出 4.0
\`\`\`

普通开发很少用到，科学计算时才需要。

### 算术运算符

| 运算符 | 含义 | 例子 | 结果 |
|--------|------|------|------|
| \`+\` | 加法 | 5 + 3 | 8 |
| \`-\` | 减法 | 5 - 3 | 2 |
| \`*\` | 乘法 | 5 * 3 | 15 |
| \`/\` | 除法（结果是浮点数） | 7 / 2 | 3.5 |
| \`//\` | 整除（向下取整） | 7 // 2 | 3 |
| \`%\` | 取余（取模） | 7 % 2 | 1 |
| \`**\` | 幂运算（次方） | 2 ** 3 | 8 |

### 运算优先级

和数学一样：
1. 括号 \`()\` 最高
2. 幂运算 \`**\`
3. 乘除取余 \`* / // %\`
4. 加减 \`+ -\`

不确定优先级时，**加括号**是最保险的！

### 整数和浮点数混合运算

当整数和浮点数运算时，结果自动变成浮点数：

\`\`\`python
print(3 + 2.0)  # 整数与浮点数运算，结果自动提升为浮点数 5.0
\`\`\``,
    code: `# 数字类型与算术运算演示

print("=== 1. 整数运算 ===")
print("10 + 3 =", 10 + 3)   # 加法
print("10 - 3 =", 10 - 3)   # 减法
print("10 * 3 =", 10 * 3)   # 乘法
print("10 / 3 =", 10 / 3)   # 除法，结果总是浮点数
print("10 // 3 =", 10 // 3) # 整除，舍去小数部分
print("10 % 3 =", 10 % 3)   # 取余，得到余数
print("2 ** 10 =", 2 ** 10) # 幂运算：2的10次方

print("\\n=== 2. 浮点数运算 ===")
print("0.1 + 0.2 =", 0.1 + 0.2)  # 注意精度问题
print("3.14 * 2 =", 3.14 * 2)
print("10.0 / 3.0 =", 10.0 / 3.0)

print("\\n=== 3. // 整除的向下取整特点 ===")
# 对于正数，// 就是舍去小数
print("7 // 2 =", 7 // 2)    # 3
# 对于负数，是向下取整（不是简单去掉小数！）
print("-7 // 2 =", -7 // 2)  # -4（因为 -4 比 -3.5 小）

print("\\n=== 4. % 取余运算的应用 ===")
# 判断奇偶：能被2整除的是偶数
print("5 % 2 =", 5 % 2, "→ 5是奇数")
print("6 % 2 =", 6 % 2, "→ 6是偶数")
# 判断是否整除
print("10 % 5 =", 10 % 5, "→ 10能被5整除")

print("\\n=== 5. 运算优先级 ===")
# 先乘除后加减，括号优先
print("2 + 3 * 4 =", 2 + 3 * 4)       # 14，不是20
print("(2 + 3) * 4 =", (2 + 3) * 4)   # 20
print("2 ** 3 + 1 =", 2 ** 3 + 1)     # 9，先算幂
print("2 ** (3 + 1) =", 2 ** (3 + 1)) # 16

print("\\n=== 6. 复合赋值运算符 ===")
x = 10
print("初始 x =", x)
x += 5   # 等价于 x = x + 5
print("x += 5 后 x =", x)
x -= 3   # 等价于 x = x - 3
print("x -= 3 后 x =", x)
x *= 2   # 等价于 x = x * 2
print("x *= 2 后 x =", x)
x //= 4  # 等价于 x = x // 4
print("x //= 4 后 x =", x)
x %= 3   # 等价于 x = x % 3
print("x %= 3 后 x =", x)

print("\\n=== 7. 实用小例子：计算圆的面积 ===")
radius = 5
pi = 3.14159
area = pi * radius ** 2
print("半径为", radius, "的圆面积 =", area)

print("\\n=== 8. 实用小例子：秒转时分秒 ===")
total_seconds = 3666
hours = total_seconds // 3600        # 1小时=3600秒
minutes = (total_seconds % 3600) // 60  # 剩下的秒数除以60得分
seconds = total_seconds % 60         # 剩下的秒数
print(total_seconds, "秒 =", hours, "小时", minutes, "分钟", seconds, "秒")`
  },
  {
    id: "py6-bool",
    group: "基础入门",
    icon: "🚦",
    title: "布尔类型与真值假值",
    content: `## 布尔类型与真值假值

布尔（Boolean）类型只有两个值：**True**（真）和 **False**（假）。布尔类型是程序逻辑判断的基础。

### 布尔值

- \`True\` 表示"是"、"对"、"成立"
- \`False\` 表示"否"、"错"、"不成立"

⚠️ 注意：首字母必须大写！不是 true 或 TRUE。

### 比较运算产生布尔值

用比较运算符比较两个值，结果是布尔值：

| 运算符 | 含义 | 例子 | 结果 |
|--------|------|------|------|
| \`==\` | 等于 | 5 == 5 | True |
| \`!=\` | 不等于 | 5 != 3 | True |
| \`>\` | 大于 | 5 > 3 | True |
| \`<\` | 小于 | 5 < 3 | False |
| \`>=\` | 大于等于 | 5 >= 5 | True |
| \`<=\` | 小于等于 | 5 <= 3 | False |

⚠️ 注意：\`==\` 是比较是否相等，\`=\` 是赋值，不要搞混！

### 真值与假值（Truthy/Falsy）

在 Python 中，不仅仅是 True/False，任何值都有"布尔含义"：

**以下值被认为是 False（假值）**：
- \`False\` 本身
- \`None\`（空值）
- 数字 \`0\`（包括 0, 0.0, 0j）
- 空字符串 \`""\` 或 \`''\`
- 空容器：\`[]\`（空列表）、\`{}\`（空字典）、\`()\`（空元组）、\`set()\`（空集合）

**其他所有值都是 True（真值）**：
- 非零数字（-1, 1, 3.14 等都是 True）
- 非空字符串（"0"、"False" 也是 True！因为它们不是空字符串）
- 非空容器

### bool() 函数

用 \`bool()\` 函数可以把任意值转换成布尔值：

\`\`\`python
print(bool(0))       # 0 是假值，转换结果为 False
print(bool(1))       # 非零数字是真值，转换结果为 True
print(bool(""))      # 空字符串是假值，转换结果为 False
print(bool("hello")) # 非空字符串是真值，转换结果为 True
\`\`\`

### 布尔值实际上是整数

在 Python 中，True 本质上就是 1，False 本质上就是 0：

\`\`\`python
print(True + True)   # True 等价于 1，1+1 结果为 2
print(False * 10)    # False 等价于 0，0×10 结果为 0
\`\`\`

但不要依赖这个特性写奇怪的代码，保持代码可读性更重要。

### 实际应用

布尔值主要用于：
- \`if\` 条件判断
- \`while\` 循环条件
- 函数返回成功/失败状态

后面讲流程控制时会大量用到！`,
    code: `# 布尔类型演示

print("=== 1. 布尔值的基本使用 ===")
is_python_fun = True
is_java_hard = False
print("Python 有趣吗?", is_python_fun)
print("Java 难吗?", is_java_hard)
print("True 的类型:", type(True))

print("\\n=== 2. 比较运算产生布尔值 ===")
print("5 == 5:", 5 == 5)    # 等于
print("5 == 3:", 5 == 3)
print("5 != 3:", 5 != 3)    # 不等于
print("5 > 3:", 5 > 3)      # 大于
print("5 < 3:", 5 < 3)      # 小于
print("5 >= 5:", 5 >= 5)    # 大于等于
print("5 <= 4:", 5 <= 4)    # 小于等于

# 字符串也可以比较（按字典序）
print('"apple" < "banana":', "apple" < "banana")
print('"Python" == "python":', "Python" == "python")  # 大小写不同！

print("\\n=== 3. 常见错误：= 和 == 的区别 ===")
x = 10  # = 是赋值，把 10 给 x
# x == 10  # == 是比较，判断 x 是否等于 10，结果是 True 或 False
print("x =", x)
print("x == 10:", x == 10)
print("x == 20:", x == 20)

print("\\n=== 4. 真值与假值 ===")
# False 家族：这些值都被当作 False
print("bool(False):", bool(False))
print("bool(None):", bool(None))
print("bool(0):", bool(0))
print("bool(0.0):", bool(0.0))
print("bool(''):", bool(""))    # 空字符串
print("bool([]):", bool([]))    # 空列表
print("bool({}):", bool({}))    # 空字典

print("\\n--- 以下都是 True（容易搞错！）---")
print("bool(-1):", bool(-1))     # 非零数字，即使是负数也是 True
print("bool(0.0001):", bool(0.0001))
print("bool('0'):", bool("0"))   # 字符串 "0" 不是空的，所以是 True！
print("bool('False'):", bool("False"))  # 字符串 "False" 也是 True！
print("bool(' '):", bool(" "))   # 空格字符串也是 True

print("\\n=== 5. 布尔值可以当数字用 ===")
print("True + True =", True + True)     # 1 + 1 = 2
print("True * 100 =", True * 100)       # 1 * 100 = 100
print("False + 5 =", False + 5)         # 0 + 5 = 5
print("sum([True, True, False, True]):", sum([True, True, False, True]))
# 上面统计了有多少个 True（3个）

print("\\n=== 6. 实用例子：年龄判断 ===")
age = 20
is_adult = age >= 18
can_drink = age >= 21
print("年龄:", age)
print("是成年人吗?", is_adult)
print("可以喝酒吗(美国)?", can_drink)

score = 85
pass_exam = score >= 60
print("分数:", score)
print("考试及格了吗?", pass_exam)`
  },
  {
    id: "py6-strings-basic",
    group: "基础入门",
    icon: "📝",
    title: "字符串基础（创建/索引/切片）",
    content: `## 字符串基础

字符串（String）是 Python 中用来表示文本的数据类型。可以存储字母、数字、汉字、符号等任意文字。

### 创建字符串

字符串用引号包裹，可以用：

- **单引号**：\`'hello'\`
- **双引号**：\`"hello"\`
- **三引号**：\`'''hello'''\` 或 \`"""hello"""\`（多行字符串）

单引号和双引号**完全等价**，选择哪个看个人习惯。如果字符串里包含引号，需要注意：

\`\`\`python
# 字符串里有单引号，外面用双引号
msg = "I'm fine"            # 外层用双引号，内层单引号无需转义
# 或者用转义字符 \\'
msg = 'I\\'m fine'           # 反斜杠转义单引号，使其不作为字符串结束符
\`\`\`

### 转义字符

反斜杠 \`\\\` 是转义字符，用来表示特殊字符：

| 转义字符 | 含义 |
|----------|------|
| \`\\n\` | 换行 |
| \`\\t\` | 制表符（Tab） |
| \`\\\\\` | 反斜杠本身 |
| \`\\'\` | 单引号 |
| \`\\"\` | 双引号 |

如果不想转义，可以在字符串前加 \`r\`（原始字符串）：

\`\`\`python
# r 前缀表示原始字符串，反斜杠按字面量处理不转义
path = r"C:\\Users\\Name"  # 原始字符串里 \\n 不会被解释为换行，直接保留字面量
print(path)  # 输出 C:\Users\Name
\`\`\`

### 字符串索引

字符串是**有序**的字符序列，每个字符都有位置编号，叫**索引**（index）。

索引从 **0** 开始！

\`\`\`
字符串:  P  y  t  h  o  n
正索引:  0  1  2  3  4  5
负索引: -6 -5 -4 -3 -2 -1
\`\`\`

用 \`[索引]\` 访问单个字符：

\`\`\`python
s = "Python"
print(s[0])   # 索引 0 取第一个字符 'P'
print(s[1])   # 索引 1 取第二个字符 'y'
print(s[-1])  # 负索引从末尾数，-1 取最后一个字符 'n'
\`\`\`

### 字符串切片

切片用来获取字符串的一部分（子串），语法：

\`\`\`python
字符串[起始:结束:步长]  # 起始包含、结束不包含，步长默认为 1
\`\`\`

- **起始**：从哪个索引开始（包含），默认 0
- **结束**：到哪个索引结束（**不包含**），默认到末尾
- **步长**：每隔几个取一个，默认 1

\`\`\`python
s = "Hello, World!"
print(s[0:5])    # 取索引 0 到 4 的子串，结果 'Hello'
print(s[:5])     # 省略起始，从开头取到索引 4，结果 'Hello'
print(s[7:])     # 省略结束，从索引 7 取到末尾，结果 'World!'
print(s[::2])    # 步长 2，每隔一个取一个，结果 'Hlo ol!'
print(s[::-1])  # 步长 -1，从尾到头取，实现字符串反转
\`\`\`

### 重要：字符串是不可变的

字符串一旦创建就不能修改！

\`\`\`python
s = "hello"
# s[0] = 'H'  # 直接修改字符会报 TypeError，字符串不可变
# 正确做法是创建新字符串
s = "H" + s[1:]  # 用拼接生成 "Hello"，原 s 被新对象替换
\`\`\`

### 字符串拼接和重复

- \`+\`：拼接两个字符串
- \`*\`：重复字符串

\`\`\`python
print("Hello" + " " + "World")  # + 号拼接多个字符串，结果 Hello World
print("哈" * 3)  # * 号重复字符串 3 次，结果 哈哈哈
\`\`\``,
    code: `# 字符串基础操作演示

print("=== 1. 创建字符串 ===")
s1 = '单引号字符串'
s2 = "双引号字符串"
s3 = """三引号可以
写多行
字符串"""
print(s1)
print(s2)
print(s3)

# 字符串中包含引号
print("I'm learning Python")  # 里面有单引号，外面用双引号
print('他说："你好"')           # 里面有双引号，外面用单引号
print('I\\'m fine')            # 或者用转义符 \\'

print("\\n=== 2. 转义字符 ===")
print("第一行\\n第二行\\n第三行")  # \\n 换行
print("姓名:\\t张三\\n年龄:\\t18")     # \\t 制表符
print("C:\\\\Users\\\\Name")          # \\\\ 表示一个反斜杠

# 原始字符串（r前缀）：不处理转义
print(r"C:\\Users\\Name")  # 输出原样：C:\\Users\\Name

print("\\n=== 3. 字符串索引（访问单个字符）===")
word = "Python"
print("字符串:", word)
print("word[0] =", word[0], "（第一个字符，索引从0开始）")
print("word[1] =", word[1])
print("word[5] =", word[5], "（第六个字符）")
print("word[-1] =", word[-1], "（最后一个字符，负数索引从后数）")
print("word[-2] =", word[-2], "（倒数第二个）")

print("\\n=== 4. 字符串切片（获取子串）===")
text = "Hello, World!"
print("原字符串:", text)
print("text[0:5] =", text[0:5], "（索引0到4，不包含5）")
print("text[:5] =", text[:5], "（从开头到索引4）")
print("text[7:] =", text[7:], "（从索引7到末尾）")
print("text[7:12] =", text[7:12])
print("text[:] =", text[:], "（整个字符串，相当于复制）")

print("\\n--- 带步长的切片 ---")
print("text[::2] =", text[::2], "（每隔1个取1个）")
print("text[::-1] =", text[::-1], "（步长-1：反转字符串！）")

print("\\n=== 5. 字符串长度 ===")
name = "张三"
print("姓名:", name, "  长度:", len(name), "（中文每个字算1个长度）")
print("text长度:", len(text))

print("\\n=== 6. 拼接和重复 ===")
first = "Hello"
second = "World"
combined = first + ", " + second + "!"
print("拼接结果:", combined)
print("重复:", "呵" * 5)
print("分隔线:", "=" * 30)

print("\\n=== 7. 字符串遍历 ===")
greeting = "你好"
for char in greeting:
    print("字符:", char)

print("\\n=== 8. 字符串不可变演示 ===")
s = "hello"
print("原字符串:", s)
# s[0] = "H"  # 这行报错！字符串不能修改单个字符
# 要改的话必须创建新字符串
new_s = "H" + s[1:]
print("创建新字符串:", new_s)
print("原字符串没变:", s)`
  },
  {
    id: "py6-strings-methods",
    group: "基础入门",
    icon: "🔧",
    title: "字符串常用方法（split/join/strip/replace/find等）",
    content: `## 字符串常用方法

Python 字符串提供了非常多实用的内置方法，让字符串处理变得简单。记住：**字符串是不可变的**，所有方法都返回新字符串，不会修改原字符串！

### 常用方法分类

#### 1. 大小写转换

| 方法 | 作用 |
|------|------|
| \`upper()\` | 转大写 |
| \`lower()\` | 转小写 |
| \`capitalize()\` | 首字母大写 |
| \`title()\` | 每个单词首字母大写 |
| \`swapcase()\` | 大小写互换 |

#### 2. 查找与判断

| 方法 | 作用 |
|------|------|
| \`find(sub)\` | 找子串第一次出现的位置，找不到返回 -1 |
| \`count(sub)\` | 统计子串出现次数 |
| \`startswith(prefix)\` | 是否以某字符串开头 |
| \`endswith(suffix)\` | 是否以某字符串结尾 |
| \`isalpha()\` | 是否全是字母 |
| \`isdigit()\` | 是否全是数字 |
| \`isalnum()\` | 是否全是字母或数字 |

#### 3. 修剪空白

| 方法 | 作用 |
|------|------|
| \`strip()\` | 去掉两端空白字符（空格、换行、Tab） |
| \`lstrip()\` | 去掉左端空白 |
| \`rstrip()\` | 去掉右端空白 |

> 💡 用户输入经常带空格，记得 strip()！

#### 4. 替换

| 方法 | 作用 |
|------|------|
| \`replace(old, new)\` | 把 old 替换成 new |

#### 5. 分割与连接

| 方法 | 作用 |
|------|------|
| \`split(sep)\` | 按分隔符分割成列表 |
| \`join(iterable)\` | 用字符串把列表连接起来 |

- \`split()\` 不传参数时按任意空白分割
- \`join()\` 是字符串的方法，不是列表的：\`",".join(list)\`

#### 6. 其他常用

| 方法 | 作用 |
|------|------|
| \`center(width)\` | 居中填充 |
| \`zfill(width)\` | 左边补0 |

### 重要提示

- 所有方法都**返回新字符串**，不改变原字符串
- 方法链式调用：\`s.strip().upper().replace("A", "B")\`
- 更多方法可以查官方文档，或者用 \`dir(str)\` 查看所有方法`,
    code: `# 字符串常用方法演示

print("=== 1. 大小写转换 ===")
s = "hello, PYTHON!"
print("原字符串:", s)
print("upper() 转大写:", s.upper())
print("lower() 转小写:", s.lower())
print("capitalize() 首字母大写:", s.capitalize())
print("title() 每个单词首字母大写:", "hello world python".title())
print("swapcase() 大小写互换:", s.swapcase())

print("\\n=== 2. 查找方法 ===")
text = "Python is easy, Python is fun"
print("原字符串:", text)
print("find('is'):", text.find("is"), "（'is'第一次出现在索引7）")
print("find('java'):", text.find("java"), "（找不到返回-1）")
print("rfind('Python'):", text.rfind("Python"), "（从右边找）")
print("count('Python'):", text.count("Python"), "（出现次数）")

print("\\n=== 3. 判断开头/结尾 ===")
filename = "report.pdf"
print("文件名:", filename)
print("startswith('report'):", filename.startswith("report"))
print("endswith('.pdf'):", filename.endswith(".pdf"))
print("endswith('.txt'):", filename.endswith(".txt"))

print("\\n=== 4. 判断字符串内容 ===")
print("'12345'.isdigit():", "12345".isdigit())  # 是否全数字
print("'abc123'.isalpha():", "abc123".isalpha())  # 是否全字母
print("'abc123'.isalnum():", "abc123".isalnum())  # 是否字母或数字
print("'  '.isspace():", "  ".isspace())  # 是否全空白

print("\\n=== 5. strip 修剪空白（非常常用！）===")
user_input = "   张三   "
print("用户输入repr:", repr(user_input))  # repr() 显示引号和空白
print("strip() 后:", repr(user_input.strip()))
print("lstrip() 去左边:", repr(user_input.lstrip()))
print("rstrip() 去右边:", repr(user_input.rstrip()))

print("\\n=== 6. replace 替换 ===")
message = "我喜欢Java，Java很好学"
print("原句:", message)
new_message = message.replace("Java", "Python")
print("替换后:", new_message)
print("原句没变:", message)  # 原字符串不会变！

print("\\n=== 7. split 分割（非常常用！）===")
data = "苹果,香蕉,橙子,葡萄"
fruits = data.split(",")  # 按逗号分割
print("原字符串:", data)
print("split(',')结果:", fruits)  # 得到列表

# 不带参数：按任意空白分割（多个空格、换行、Tab都行）
line = "张三   18   男   北京"
info = line.split()
print("\\n按空白分割:", info)

print("\\n=== 8. join 连接（和split相反！）===")
words = ["我", "爱", "Python"]
sentence = "".join(words)  # 用空字符串连接
print("列表:", words)
print("''.join():", sentence)

csv = ",".join(fruits)
print(",'.join(fruits):", csv)

print("\\n--- 小技巧：split和join配合 ---")
text2 = "a  b   c    d"  # 多个空格
cleaned = " ".join(text2.split())  # 去掉多余空格
print("原文本:", repr(text2))
print("去多余空格:", repr(cleaned))

print("\\n=== 9. 居中填充 ===")
title = "目录"
print(title.center(20, "="))  # 居中，用=填充
print("第一章".center(20))
print("第二章".center(20))
print("zfill补零:", "42".zfill(5))  # 左边补0到5位`
  },
  {
    id: "py6-strings-format",
    group: "基础入门",
    icon: "✨",
    title: "字符串格式化（f-string/format/%/模板字符串）",
    content: `## 字符串格式化

字符串格式化就是把变量的值"插入"到字符串中，生成动态的文本。Python 提供了多种格式化方式。

### 方式一：f-string（推荐！Python 3.6+）

f-string 是目前最推荐的方式，**简洁、直观、速度快**：

在字符串前加 \`f\` 或 \`F\`，用 \`{变量名}\` 插入变量：

\`\`\`python
# 字符串变量 name
name = "小明"
# 整数变量 age
age = 18
print(f"我叫{name}，今年{age}岁")  # f 前缀开启 f-string，{变量名} 会被替换为变量值
\`\`\`

大括号里还可以放表达式、函数调用：

\`\`\`python
print(f"明年我{age + 1}岁")      # {} 内可写表达式，先计算 age+1 再插入
print(f"名字长度：{len(name)}")  # {} 内可调用函数，插入返回值
\`\`\`

f-string 还支持格式控制：

\`\`\`python
# 格式说明符语法：{变量:[填充][对齐][宽度][.精度][类型]}
#   对齐：< 左对齐、> 右对齐(默认)、^ 居中
#   类型：d 整数、f 浮点数、s 字符串、% 百分比
pi = 3.1415926
print(f"圆周率：{pi:.2f}")  # :.2f 保留 2 位小数，结果 3.14
print(f"右对齐：{42:5d}")    # :5d 占 5 位宽度，默认右对齐
print(f"左对齐：{42:<5d}|")  # :<5d 左对齐，右侧补空格
\`\`\`

### 方式二：str.format() 方法

f-string 出现之前的主流方式，现在仍广泛使用：

\`\`\`python
print("我叫{}，今年{}岁".format(name, age))  # {} 按顺序依次填充参数
print("我叫{0}，{0}今年{1}岁".format(name, age))  # {0} 按位置索引复用参数
print("我叫{n}，今年{a}岁".format(n=name, a=age))  # 用关键字参数指定填充
\`\`\`

### 方式三：% 格式化（老式）

这是 C 语言风格的格式化，老代码中常见，但不推荐在新代码中使用：

\`\`\`python
print("我叫%s，今年%d岁" % (name, age))  # %s 占位字符串，%d 占位整数，% 后给元组
\`\`\`

| 符号 | 含义 |
|------|------|
| \`%s\` | 字符串 |
| \`%d\` | 整数 |
| \`%f\` | 浮点数 |

### 格式控制语法

常用的格式说明符（f-string 和 format 都支持）：

| 格式 | 作用 | 例子 | 结果 |
|------|------|------|------|
| \`:.2f\` | 保留2位小数 | \`{3.1415:.2f}\` | 3.14 |
| \`:5d\` | 整数占5位宽度（右对齐） | \`{42:5d}\` | '   42' |
| \`:<5d\` | 左对齐 | \`{42:<5d}\` | '42   ' |
| \`:^10s\` | 居中 | \`{"hi":^10}\` | '    hi    ' |
| \`:05d\` | 数字补零 | \`{42:05d}\` | 00042 |
| \`:,\` | 千位分隔符 | \`{1000000:,}\` | 1,000,000 |
| \`:.2%\` | 百分比 | \`{0.85:.2%}\` | 85.00% |

### 该用哪种方式？

- **新代码：首选 f-string**（Python 3.6+ 都支持）
- 需要兼容老版本时用 \`format()\`
- \`%\` 只在维护老代码时认识一下就好`,
    code: `# 字符串格式化演示

name = "小明"
age = 18
height = 1.75
score = 95.5

print("=" * 50)
print("         字符串格式化方式对比")
print("=" * 50)

print("\\n--- 方式1：f-string（推荐！）---")
# 最直观、最简单的方式
print(f"我叫{name}，今年{age}岁，身高{height}米")
# 大括号里可以放表达式
print(f"明年我就{age + 1}岁了")
print(f"名字长度是{len(name)}个字符")
print(f"我的成绩是{score}分")

print("\\n--- f-string 格式控制 ---")
pi = 3.1415926535
print(f"圆周率保留2位小数: {pi:.2f}")
print(f"圆周率保留4位小数: {pi:.4f}")
print(f"圆周率保留0位小数: {pi:.0f}")

price = 12999.99
print(f"价格(千位分隔): {price:,}元")

rate = 0.8725
print(f"百分比格式: {rate:.1%}")

print(f"\\n对齐演示:")
print(f"|{'编号':^6}|{'姓名':^8}|{'分数':^6}|")
print(f"+{'-'*6}+{'-'*8}+{'-'*6}+")
print(f"|{1:^6}|{'小明':^8}|{95:^6}|")
print(f"|{2:^6}|{'小红':^8}|{88:^6}|")
print(f"|{10:^6}|{'张三丰':^8}|{100:^6}|")

print(f"\\n补零:")
print(f"序号补零到5位: {42:05d}")
print(f"序号补零到5位: {123:05d}")

print("\\n--- 方式2：str.format() 方法 ---")
# 通过位置占位
print("我叫{}，今年{}岁".format(name, age))
# 指定位置
print("{1}岁的{0}身高{2}米".format(name, age, height))
# 关键字参数
print("我叫{n}，分数{s}".format(n=name, s=score))
# 格式控制
print("圆周率: {:.3f}".format(pi))

print("\\n--- 方式3：% 格式化（老式，了解即可）---")
print("我叫%s，今年%d岁，身高%.2f米" % (name, age, height))
# %s=字符串, %d=整数, %f=浮点数

print("\\n=== 实用例子：生成个人信息卡 ===")
card = f"""
╔══════════════════════════╗
║       个人信息卡         ║
╠══════════════════════════╣
║  姓名：{name:<16}║
║  年龄：{age:<16}║
║  身高：{height:<14}米  ║
║  成绩：{score:<13}分  ║
╚══════════════════════════╝
"""
print(card)

print("=== 实用例子：商品价格标签 ===")
# 用元组列表存储商品数据（名称, 价格）
products = [
    ("苹果", 5.99),
    ("香蕉", 3.50),
    ("笔记本电脑", 8999.00),
]
for item, price in products:
    # {item:<10} 商品名左对齐占 10 字符宽；{price:>8.2f} 价格右对齐占 8 位、保留 2 位小数
    print(f"{item:<10} ￥{price:>8.2f}")`
  },
  {
    id: "py6-operators",
    group: "基础入门",
    icon: "⚡",
    title: "运算符详解（算术/比较/逻辑/赋值/位运算/成员/身份）",
    content: `## 运算符详解

运算符是用来对数据进行运算的符号。Python 有多种类型的运算符，我们逐一学习。

### 1. 算术运算符

| 运算符 | 说明 | 例子 |
|--------|------|------|
| \`+\` | 加法 | 3 + 5 → 8 |
| \`-\` | 减法 | 10 - 4 → 6 |
| \`*\` | 乘法 | 2 * 6 → 12 |
| \`/\` | 除法（结果是float） | 10 / 3 → 3.333... |
| \`//\` | 整除 | 10 // 3 → 3 |
| \`%\` | 取余 | 10 % 3 → 1 |
| \`**\` | 幂运算 | 2 ** 3 → 8 |

### 2. 比较运算符

比较结果总是 \`True\` 或 \`False\`：

| 运算符 | 说明 |
|--------|------|
| \`==\` | 等于 |
| \`!=\` | 不等于 |
| \`>\` | 大于 |
| \`<\` | 小于 |
| \`>=\` | 大于等于 |
| \`<=\` | 小于等于 |

### 3. 逻辑运算符

用于组合布尔条件：

| 运算符 | 说明 | 例子 |
|--------|------|------|
| \`and\` | 与（两边都True才True） | True and False → False |
| \`or\` | 或（一边True就True） | True or False → True |
| \`not\` | 非（取反） | not True → False |

⚠️ Python 用的是英文单词 \`and/or/not\`，不是 \`&&/||/!\`！

**短路求值**：
- \`a and b\`：如果 a 是 False，直接返回 a，不看 b
- \`a or b\`：如果 a 是 True，直接返回 a，不看 b

\`\`\`python
# 短路求值演示：and/or 返回的是参与运算的值，而不一定是布尔值
print(0 and 100)   # 0 是假值，直接返回 0，不计算右边
print(3 and 100)   # 3 是真值，返回右边的 100
print(3 or 100)    # 3 是真值，直接返回 3，不计算右边
print(0 or 100)    # 0 是假值，返回右边的 100
# 利用短路特性可以避免报错，例如：x and x.do_something()
\`\`\`

### 4. 赋值运算符

| 运算符 | 等价于 |
|--------|--------|
| \`=\` | 直接赋值 |
| \`+=\` | x += 5 → x = x + 5 |
| \`-=\` | x -= 5 → x = x - 5 |
| \`*=\` | x *= 5 → x = x * 5 |
| \`/=\` | x /= 5 → x = x / 5 |
| \`//=\`、\`%=\`、\`**=\` 同理 |

### 5. 成员运算符

判断元素是否在容器中：

| 运算符 | 说明 |
|--------|------|
| \`in\` | 在里面 |
| \`not in\` | 不在里面 |

\`\`\`python
print("a" in "abc")  # in 判断字符是否在字符串中，结果 True
print(3 in [1, 2, 3])  # in 判断元素是否在列表中，结果 True
\`\`\`

### 6. 身份运算符

判断两个变量是否引用同一个对象（内存地址相同）：

| 运算符 | 说明 |
|--------|------|
| \`is\` | 是同一个对象 |
| \`is not\` | 不是同一个对象 |

⚠️ \`==\` 比较的是**值**是否相等，\`is\` 比较的是**身份**（内存地址）是否相同！

\`\`\`python
a = [1, 2, 3]
b = [1, 2, 3]
print(a == b)  # == 比较值是否相等，结果 True
print(a is b)  # is 比较是否同一对象（内存地址），结果 False
\`\`\`

### 7. 位运算符（了解）

直接对二进制位操作，底层开发时用：

| 运算符 | 说明 |
|--------|------|
| \`&\` | 按位与 |
| \`|\` \| 按位或 |
| \`^\` | 按位异或 |
| \`~\` | 按位取反 |
| \`<<\` | 左移 |
| \`>>\` | 右移 |

### 运算符优先级（高→低）

1. \`**\`（幂）
2. \`~ + -\`（按位取反、正负号）
3. \`* / // %\`
4. \`+ -\`
5. \`>> <<\`
6. \`&\`
7. \`^ |\`
8. 比较运算符（==, !=, <, > 等）
9. 赋值运算符
10. 身份/成员运算符（is, in）
11. 逻辑运算符（not, and, or）

**不确定？加括号！** 括号永远最高优先级，而且让代码更清晰。`,
    code: `# 运算符详解演示

print("=== 1. 算术运算符 ===")
print("7 + 3 =", 7 + 3)
print("7 - 3 =", 7 - 3)
print("7 * 3 =", 7 * 3)
print("7 / 3 =", 7 / 3, "（除法结果总是浮点数）")
print("7 // 3 =", 7 // 3, "（整除，舍去小数）")
print("7 % 3 =", 7 % 3, "（取余数）")
print("2 ** 5 =", 2 ** 5, "（2的5次方，即32）")

print("\\n=== 2. 比较运算符 ===")
x, y = 10, 20
print(f"x={x}, y={y}")
print("x == y:", x == y)
print("x != y:", x != y)
print("x < y:", x < y)
print("x > y:", x > y)
print("x <= 10:", x <= 10)
print("x >= 10:", x >= 10)

print("\\n=== 3. 逻辑运算符 ===")
a, b = True, False
print("a =", a, ", b =", b)
print("a and b:", a and b, "（必须都True）")
print("a or b:", a or b, "（一个True就行）")
print("not a:", not a, "（取反）")
print("not b:", not b)

# 实际例子：复合条件判断
age = 22
has_id = True
can_enter = age >= 18 and has_id
print(f"\\n年龄{age}，有身份证:{has_id}，能进网吧吗？{can_enter}")

score = 75
is_excellent = score >= 90
is_good = 70 <= score < 90
is_pass = score >= 60
print(f"分数{score}：优秀={is_excellent}，良好={is_good}，及格={is_pass}")

print("\\n=== 4. 赋值运算符 ===")
num = 100
print("初始 num =", num)
num += 10
print("num += 10 →", num)
num -= 5
print("num -= 5 →", num)
num *= 2
print("num *= 2 →", num)
num //= 3
print("num //= 3 →", num)
num %= 7
print("num %= 7 →", num)
num **= 2
print("num **= 2 →", num)

print("\\n=== 5. 成员运算符 in / not in ===")
fruits = ["苹果", "香蕉", "橙子"]
print("水果列表:", fruits)
print("'香蕉' in fruits:", "香蕉" in fruits)
print("'西瓜' in fruits:", "西瓜" in fruits)
print("'西瓜' not in fruits:", "西瓜" not in fruits)
print("'a' in 'Python':", "a" in "Python")
print("'th' in 'Python':", "th" in "Python")

print("\\n=== 6. 身份运算符 is / is not ===")
# == 比较值，is 比较是否是同一个对象（内存地址）
list1 = [1, 2, 3]
list2 = [1, 2, 3]
list3 = list1
print("list1 =", list1, ", list2 =", list2)
print("list1 == list2:", list1 == list2, "（值相等）")
print("list1 is list2:", list1 is list2, "（但不是同一个对象）")
print("list1 is list3:", list1 is list3, "（list3就是list1）")

# 小整数和字符串有缓存，is可能返回True，但不要依赖这个
a = 100
b = 100
print("\\na=100, b=100")
print("a is b:", a is b, "（小整数Python会缓存）")

# None 的判断推荐用 is
x = None
print("\\nx is None:", x is None)

print("\\n=== 7. 位运算符 ===")
a = 60  # 二进制 0011 1100
b = 13  # 二进制 0000 1101
print(f"a={a} (二进制: {a:08b})")
print(f"b={b} (二进制: {b:08b})")
print(f"a & b = {a & b:3} (二进制: {a & b:08b})  # 按位与")
print(f"a | b = {a | b:3} (二进制: {a | b:08b})  # 按位或")
print(f"a ^ b = {a ^ b:3} (二进制: {a ^ b:08b})  # 按位异或")
print(f"a << 2 = {a << 2:3} (二进制: {a << 2:08b})  # 左移2位（乘以4）")
print(f"a >> 2 = {a >> 2:3} (二进制: {a >> 2:08b})  # 右移2位（除以4）")

print("\\n=== 8. 优先级：括号优先 ===")
print("2 + 3 * 4 =", 2 + 3 * 4, "（先乘后加）")
print("(2 + 3) * 4 =", (2 + 3) * 4, "（括号优先）")
# 不确定时就加括号，代码更清晰`
  },
  {
    id: "py6-input-output",
    group: "基础入门",
    icon: "🖨️",
    title: "输入输出（print/input）",
    content: `## 输入输出（I/O）

程序需要和用户交互，最基本的方式就是**输出**（显示信息给用户看）和**输入**（接收用户输入）。

### print() 输出

\`print()\` 是 Python 中最常用的输出函数，把内容打印到屏幕上。

**基本用法**：

\`\`\`python
# 打印字符串字面量
print("Hello")          # 打印字符串字面量
# 打印整数
print(123)              # 打印整数
print("年龄:", 18)      # 多个值用逗号分隔，输出时默认用空格连接
\`\`\`

**参数说明**：

- \`sep\`：多个值之间的分隔符，默认是空格
- \`end\`：打印完后的结尾字符，默认是换行 \`
\`

\`\`\`python
print("a", "b", "c", sep="-")  # sep 指定分隔符为短横线，输出 a-b-c
print("Hello", end=" ")        # end 指定结尾为空格，不换行
print("World")                 # 因上一行未换行，会接在同一行输出
\`\`\`

**打印到文件**：

\`\`\`python
with open("output.txt", "w") as f:   # 以写入模式打开文件，with 自动关闭
    print("写入文件", file=f)         # file 参数把内容输出到文件而非屏幕
\`\`\`

### input() 输入

\`input()\` 函数从用户那里获取输入，程序会暂停等待用户输入，用户按回车后继续。

**⚠️ 重要：input() 返回的永远是字符串！**

\`\`\`python
name = input("请输入你的名字：")  # input() 暂停等待输入，返回字符串
print("你好，" + name)          # 字符串拼接后输出
\`\`\`

如果需要数字，必须手动转换类型：

\`\`\`python
age_str = input("请输入年龄：")  # input() 返回字符串如 "18"
age = int(age_str)  # int() 把字符串转成整数
# 或者一步到位：
age = int(input("请输入年龄："))  # 嵌套调用，先取输入再转整数
\`\`\`

### 输入输出示例

写一个简单的交互程序：

\`\`\`python
name = input("你叫什么名字？")            # 获取姓名字符串
age = int(input("你多大了？"))           # 获取年龄并转成整数
print(f"你好{name}，明年你就{age+1}岁了！")  # f-string 插值并计算
\`\`\`

### 常见问题

1. **忘记类型转换**：\`input()\` 返回的是字符串，直接做数学运算会报错
2. **输入时不小心输入了空格**：用 \`.strip()\` 去掉两端空白
3. **输入非数字导致 int() 报错**：可以用 try-except 处理（后面会学）

### 格式化输出配合

之前学的 f-string 和 print 配合非常好用：

\`\`\`python
# 字符串变量 name
name = "小明"
# 整数变量 score
score = 95
print(f"{name}的成绩是{score}分")  # f-string 把变量直接插入字符串
\`\`\``,
    code: `# 输入输出演示
# 注意：在沙盒环境中 input() 可能无法交互，这里演示语法为主

print("=" * 50)
print("           print() 输出函数演示")
print("=" * 50)

print("\\n--- 1. 基本输出 ---")
print("Hello, World!")           # 打印字符串
print(12345)                   # 打印数字
print(3.14, True, False)       # 打印多个值
print()                        # 打印空行

print("--- 2. 多个值用逗号分隔 ---")
print("姓名:", "小明", "年龄:", 18)
# 默认用空格分隔，用 sep 参数改变分隔符
print("2026", "6", "30", sep="-")          # 2026-6-30
print("a", "b", "c", sep=" -> ")           # a -> b -> c
print("one", "two", "three", sep="\\n")     # 每个值换行

print("\\n--- 3. end 参数：结尾字符 ---")
# 默认 end 是换行符 \\n，每次 print 换一行
print("Loading", end="")
print(".", end="")
print(".", end="")
print(".", end="")
print(" Done!")
# 上面会打印在同一行：Loading... Done!

print("\\n--- 4. 打印简单表格 ---")
# 用 sep 和 end 可以打印整齐的输出
print("+" + "-" * 22 + "+")
print("|", "商品", "|", "价格", "|", sep="\\t")
print("+" + "-" * 22 + "+")
print("|", "苹果", "|", "5.99", "|", sep="\\t")
print("|", "香蕉", "|", "3.50", "|", sep="\\t")
print("|", "橙子", "|", "4.80", "|", sep="\\t")
print("+" + "-" * 22 + "+")

print("\\n--- 5. input() 输入（语法演示）---")
print("input() 用于接收用户输入，例如：")
print("  name = input('请输入名字：')")
print("  age = int(input('请输入年龄：'))")
print("（注意：input 返回的永远是字符串，需要数字要用 int()/float() 转换）")

# 演示类型转换的重要性
print("\\n--- 6. 输入类型转换演示 ---")
# 假设用户输入了 "18"（注意是字符串）
user_input = "18"  # 模拟 input 返回值
print(f"用户输入的是: {repr(user_input)}，类型是 {type(user_input)}")
# 直接做加法会报错：print(user_input + 1)  # TypeError
age_num = int(user_input)  # 转成整数
print(f"转换为整数后: {age_num}，类型是 {type(age_num)}")
print(f"明年年龄: {age_num + 1}")

print("\\n--- 7. 模拟一个交互小程序（预设值演示）---")
# 这里用预设值模拟 input 的返回（因为沙盒无法交互）
name = "小红"
age_str = "20"
age = int(age_str)
print(f"你好，{name}！")
print(f"你今年 {age} 岁，明年就是 {age + 1} 岁啦！")
print(f"你出生的年份大概是 {2026 - age} 年。")

print("\\n" + "=" * 50)
print("小提示：在实际写代码时，input() 会暂停等待你输入，")
print("输入完按回车程序继续运行。")
print("=" * 50)`
  },
  {
    id: "py6-comments",
    group: "基础入门",
    icon: "💬",
    title: "注释与代码规范初步",
    content: `## 注释与代码规范

注释是写给人看的文字，Python 解释器会忽略它们。好的注释让代码更容易理解和维护。

### 为什么要写注释？

- 解释代码在做什么、为什么这么做
- 方便自己和别人以后看懂代码
- 临时禁用某些代码
- 生成文档

### Python 注释的三种方式

#### 1. 单行注释：\`#\`

以 \`#\` 开头，这一行后面的内容都是注释：

\`\`\`python
# 这是一行注释  # 开头的整行都被解释器忽略，仅供阅读
print("hello")  # 这也是注释，跟在代码后面  # 代码后用 # 添加行尾说明
\`\`\`

#### 2. 多行注释：三引号

用三个单引号或三个双引号包裹，可以写多行注释：

\`\`\`python
'''这是多行注释  # 三个单引号开头
可以写很多行
Python 不会执行这里面的内容'''  # 三个单引号结尾，中间内容不执行

"""双引号三引号也可以  # 三个双引号同样可做多行注释
同样可以写多行"""
\`\`\`

三引号通常也用于写函数、类的文档字符串（docstring）。

### 注释怎么写？

✅ **好的注释**：
- 解释"为什么"，而不是"是什么"（代码本身已经说了"是什么"）
- 解释复杂算法的思路
- 标记 TODO 待办事项
- 解释不直观的业务逻辑

❌ **不好的注释**：
- 重复代码在做什么（比如 \`x = x + 1  # x加1\`，废话）
- 过时的注释（代码改了注释没改，反而误导人）
- 注释掉的大量废弃代码（用版本控制，直接删掉）

### 代码规范初步（PEP 8）

PEP 8 是 Python 官方的代码风格指南，统一的风格让代码更易读。

**基本规范**：

1. **缩进**：用 4 个空格，不要用 Tab（大多数编辑器可以设置Tab自动转空格）
2. **行长度**：每行不超过 79 或 120 个字符
3. **空行**：
   - 函数之间空 2 行
   - 逻辑块之间空 1 行
4. **空格**：
   - 运算符两边加空格：\`a = 1 + 2\`（不是 \`a=1+2\`）
   - 逗号后面加空格：\`print(1, 2, 3)\`
   - 括号内侧不要加空格：\`func(1)\`（不是 \`func( 1 )\`）
5. **命名**：
   - 变量/函数：小写 + 下划线（snake_case）：\`user_name\`
   - 类名：大驼峰（PascalCase）：\`MyClass\`
   - 常量：全大写：\`MAX_SIZE\`
6. **导入**：
   - 每个 import 单独一行
   - 顺序：标准库 → 第三方库 → 自己的模块

### 工具推荐

- **代码检查**：flake8、pylint
- **自动格式化**：black、autopep8
- **类型检查**：mypy

写代码时一开始就养成好习惯，比后来改风格容易得多！`,
    code: `# ==========================================
# 注释与代码规范演示文件
# 文件名：comments_demo.py
# ==========================================

'''
这是多行注释（三引号）
通常用于文件开头的说明
或者作为函数/类的文档字符串
'''

"""
双引号三引号也可以做多行注释
两种三引号没有本质区别
根据个人喜好选择
"""

# TODO: 这是一个待办标记，方便以后找到需要完善的地方
# FIXME: 这是一个需要修复的问题标记


print("=== 注释演示程序 ===")

# 计算圆的面积
pi = 3.14159  # 圆周率常量
radius = 5    # 圆的半径
area = pi * radius ** 2  # 面积公式：πr²
print(f"半径为{radius}的圆面积是{area:.2f}")


def calculate_bmi(weight, height):
    """计算BMI指数（这是docstring文档字符串）

    Args:
        weight: 体重（公斤）
        height: 身高（米）

    Returns:
        BMI值 = 体重 / (身高 ** 2)
    """
    # BMI计算公式：体重除以身高的平方
    bmi = weight / (height ** 2)
    return bmi


# 计算并输出BMI
weight_kg = 70
height_m = 1.75
bmi_result = calculate_bmi(weight_kg, height_m)
print(f"体重{weight_kg}kg，身高{height_m}m，BMI是{bmi_result:.1f}")

# BMI分类（中国标准）
# 偏瘦：<18.5
# 正常：18.5-23.9
# 偏胖：24-27.9
# 肥胖：≥28
if bmi_result < 18.5:
    category = "偏瘦"
elif bmi_result < 24:
    category = "正常"
elif bmi_result < 28:
    category = "偏胖"
else:
    category = "肥胖"
print(f"BMI分类：{category}")


# === PEP 8 规范演示 ===
# 好的写法（符合PEP 8）：
good_spacing = 1 + 2
good_list = [1, 2, 3]
good_name = "PEP8风格"

# 不好的写法（虽然能运行，但不符合规范）：
# bad_spacing=1+2
# bad_list=[1,2,3]

print("\\n=== PEP 8 小贴士 ===")
print("1. 缩进用4个空格")
print("2. 运算符两边加空格")
print("3. 逗号后面加空格")
print("4. 变量名用小写蛇形命名(user_name)")
print("5. 类名用大驼峰(MyClass)")
print("6. 常量全大写(MAX_SIZE)")
print("7. 每行不要太长（建议不超过120字符）")
print("8. 该加空行时加空行，让代码段落分明")`
  },
  {
    id: "py6-type-conversion",
    group: "基础入门",
    icon: "🔄",
    title: "类型转换（int()/float()/str()/bool()等）",
    content: `## 类型转换

类型转换就是把一种数据类型转换成另一种。比如把用户输入的字符串"18"转成整数18，或者把数字转成字符串拼接。

Python 提供了内置的类型转换函数。

### 常用类型转换函数

| 函数 | 作用 | 例子 |
|------|------|------|
| \`int(x)\` | 转成整数 | int("18") → 18 |
| \`float(x)\` | 转成浮点数 | float("3.14") → 3.14 |
| \`str(x)\` | 转成字符串 | str(123) → "123" |
| \`bool(x)\` | 转成布尔值 | bool(1) → True |
| \`list(x)\` | 转成列表 | list("abc") → ['a','b','c'] |
| \`tuple(x)\` | 转成元组 | tuple([1,2]) → (1,2) |
| \`set(x)\` | 转成集合 | set([1,1,2]) → {1,2} |

### int() 转整数

可以把浮点数、整数字符串转成整数：

\`\`\`python
int(3.99)     # 浮点数转整数：直接截断小数部分，结果 3
int("123")    # 数字字符串转整数，结果 123
int("-45")    # 带负号的字符串也能转，结果 -45
\`\`\`

⚠️ 注意：
- 浮点数转整数是**截断**（舍去小数），不是四舍五入
- 字符串必须看起来像整数，\`int("3.14")\` 会报错！
- \`int()\` 还支持进制转换：\`int("FF", 16) = 255\`

### float() 转浮点数

\`\`\`python
float(10)       # 整数转浮点数，结果 10.0
float("3.14")   # 小数字符串转浮点数，结果 3.14
float("-2.5")   # 带负号字符串，结果 -2.5
float("1e3")    # 科学计数法字符串，结果 1000.0
\`\`\`

### str() 转字符串

任何类型都可以转成字符串：

\`\`\`python
str(123)        # 整数转字符串，结果 "123"
str(3.14)       # 浮点数转字符串，结果 "3.14"
str(True)       # 布尔值转字符串，结果 "True"
str([1, 2, 3])  # 列表转字符串，结果 "[1, 2, 3]"
\`\`\`

字符串拼接时经常需要先转成字符串：

\`\`\`python
# 整数变量 age
age = 18
print("我今年" + str(age) + "岁")  # str() 转字符串后才能拼接，否则报错
# 或者直接用f-string更方便：print(f"我今年{age}岁")  # f-string 自动处理类型
\`\`\`

### bool() 转布尔值

之前学过，这些值转成布尔值是 False：
- 0、0.0、0j
- 空字符串 ""、空容器
- None、False

其他所有值都是 True。

### 隐式类型转换

Python 在某些情况下会自动转换类型：

\`\`\`python
result = 10 + 3.14  # 整数与浮点数运算，结果自动提升为浮点数 13.14
\`\`\`

但字符串和数字不会自动转换，必须手动转：

\`\`\`python
# "18" + 1  # TypeError！字符串与数字不会自动转换
int("18") + 1  # 先转整数再运算，结果 19
\`\`\`

### 常见错误

1. **转换失败抛出 ValueError**：\`int("hello")\` 会报错
2. **以为 int(3.99) 会四舍五入到4**：其实是 3！要四舍五入用 \`round(3.99)\`
3. **忘记 input() 返回字符串**：必须手动 int() 转换`,
    code: `# 类型转换演示

print("=== 1. int() 转整数 ===")
print("int(3.14) =", int(3.14), "（浮点数转整数：直接截断小数）")
print("int(3.99) =", int(3.99), "（注意！不是四舍五入，直接变成3）")
print("int(-3.99) =", int(-3.99))
print('int("123") =', int("123"), "（整数字符串转整数）")
print('int("-45") =', int("-45"))
print("int(True) =", int(True), "（True变成1）")
print("int(False) =", int(False), "（False变成0）")

# 进制转换
print("\\n--- int() 进制转换 ---")
print('int("1010", 2) =', int("1010", 2), "（二进制转十进制）")
print('int("FF", 16) =', int("FF", 16), "（十六进制转十进制）")
print('int("77", 8) =', int("77", 8), "（八进制转十进制）")

# 错误示例（会报错，注释掉）：
# int("3.14")  # ValueError！字符串是浮点数格式不能直接转int
# int("hello")  # ValueError！不能转

print("\\n=== 2. float() 转浮点数 ===")
print("float(10) =", float(10))
print('float("3.14") =', float("3.14"))
print('float("-2.5") =', float("-2.5"))
print('float("1e3") =', float("1e3"), "（科学计数法）")
print("float(True) =", float(True))

print("\\n=== 3. str() 转字符串（最重要最常用！）===")
print("str(123) =", repr(str(123)), type(str(123)))
print("str(3.14) =", repr(str(3.14)))
print("str(True) =", repr(str(True)))
print("str([1, 2, 3]) =", repr(str([1, 2, 3])))
print("str(None) =", repr(str(None)))

# 为什么需要str()？字符串拼接时
age = 18
# print("我今年" + age + "岁")  # TypeError！字符串和数字不能直接加
print("我今年" + str(age) + "岁")  # 转成字符串才能拼接
# 当然f-string更方便：
print(f"我今年{age}岁")

print("\\n=== 4. bool() 转布尔值 ===")
print("bool(0) =", bool(0))
print("bool(1) =", bool(1))
print("bool(-10) =", bool(-10), "（非零都是True）")
print('bool("") =', bool(""), "（空字符串是False）")
print('bool("0") =', bool("0"), "（非空字符串是True！）")
print('bool("False") =', bool("False"), "（这也是True！因为字符串非空）")
print("bool([]) =", bool([]), "（空列表是False）")
print("bool([1, 2]) =", bool([1, 2]))
print("bool(None) =", bool(None))

print("\\n=== 5. 容器类型转换 ===")
# 字符串转列表
print('list("Python") =', list("Python"))
# 列表转元组
print("tuple([1, 2, 3]) =", tuple([1, 2, 3]))
# 列表转集合（自动去重）
print("set([1, 2, 2, 3, 3, 3]) =", set([1, 2, 2, 3, 3, 3]))

print("\\n=== 6. 隐式类型转换（自动转换）===")
print("10 + 3.14 =", 10 + 3.14, "（整数+浮点数，结果自动变浮点数）")
print("True + 1 =", True + 1, "（True=1，自动参与计算）")
print("False * 100 =", False * 100)

print("\\n=== 7. 实用例子：处理用户输入 ===")
# 模拟用户输入（沙盒无法真正交互）
input_age = "25"  # input()返回的是字符串
input_height = "1.75"
age = int(input_age)
height = float(input_height)
print(f"年龄：{age}（类型：{type(age).__name__}）")
print(f"身高：{height}米（类型：{type(height).__name__}）")
print(f"明年年龄：{age + 1}")

print("\\n=== 8. round() 四舍五入（补充）===")
# int()是截断小数（直接丢掉小数部分），要四舍五入用 round()
print("round(3.4) =", round(3.4))
print("round(3.5) =", round(3.5))  # 注意：Python 的 round 是"银行家舍入"，.5 时向偶数靠拢，3.5→4
print("round(2.5) =", round(2.5))  # 2.5 同样向偶数靠拢，结果是 2 而不是 3
print("round(3.14159, 2) =", round(3.14159, 2), "（保留2位小数）")`
  },
  {
    id: "py6-naming",
    group: "基础入门",
    icon: "🏷️",
    title: "标识符与命名规则",
    content: `## 标识符与命名规则

标识符就是我们在程序中给变量、函数、类等起的名字。Python 对标识符有严格的规则。

### 什么是标识符？

- 变量名、函数名、类名、模块名等都是标识符
- 标识符是我们自己定义的名字
- 好的命名让代码易读、易维护

### 标识符命名规则（必须遵守）

**必须遵守，否则报错！**

1. **第一个字符必须是字母（a-z, A-Z）或下划线（_）**
   - ✅ \`name\`, \`_count\`, \`Age\`
   - ❌ \`1name\`（数字开头不行）

2. **其他字符可以是字母、数字、下划线**
   - ✅ \`name123\`, \`user_age\`, \`_private\`
   - ❌ \`my-name\`（中划线不行）, \`user name\`（空格不行）

3. **区分大小写**
   - \`Age\`、\`age\`、\`AGE\` 是三个**不同**的变量！

4. **不能使用 Python 的关键字（保留字）**
   - 比如 \`if\`、\`for\`、\`while\`、\`class\`、\`def\` 等不能作为名字

### 合法标识符示例

\`\`\`python
name = "小明"                            # 字母开头，合法
_age = 18                               # 下划线开头，合法
user_name = "小红"                      # 蛇形命名，合法
PI = 3.14                               # 全大写表示常量，合法
calculate_sum = lambda x, y: x + y      # 函数名小写蛇形，合法
MyClass = object                        # 大驼峰用于类名，合法
\`\`\`

### 非法标识符示例

\`\`\`python
# 1name = "错"      # 数字开头，非法
# my-name = "错"   # 含中划线（会被当作减号），非法
# my name = "错"   # 含空格，非法
# if = 10          # if 是关键字，不能作变量名
# class = "错"     # class 是关键字，不能作变量名
\`\`\`

### Python 关键字一览

用 \`keyword.kwlist\` 可以查看所有关键字：

\`\`\`
False      await      else       import     pass
None       break      except     in         raise
True       class      finally    is         return
and        continue   for        lambda     try
as         def        from       nonlocal   while
assert     del        global     not        with
async      elif       if         or         yield
\`\`\`

这些名字都不能用作标识符！

### 命名规范（建议遵守）

除了上面的硬性规则，Python 社区有约定俗成的命名规范（PEP 8）：

| 类型 | 规范 | 例子 |
|------|------|------|
| 变量/函数 | 小写蛇形（小写+下划线） | \`user_name\`, \`calculate_area\` |
| 类名 | 大驼峰（每个单词首字母大写） | \`MyClass\`, \`UserInfo\` |
| 常量 | 全大写+下划线 | \`MAX_SIZE\`, \`PI\` |
| 私有变量/方法 | 单下划线开头 | \`_internal_value\` |
| 特殊方法 | 双下划线前后 | \`__init__\`, \`__str__\` |
| 模块名 | 短，小写，可下划线 | \`my_module\` |

### 命名建议

1. **见名知意**：\`student_count\` 比 \`n\` 好
2. **长度适中**：不要太长（\`number_of_students_in_the_class\`）也不要太短（\`n\`）
3. **不要用中文/拼音**：虽然 Python 3 支持，但不推荐
4. **不要用容易混淆的名字**：\`l\`、\`O\`、\`I\` 容易和 1、0 混淆
5. **一致性**：同一项目中保持风格统一

### 反模式（不好的命名）

- 只用单个字母（除了循环变量 i, j, k）
- 用拼音（\`nianLing\` 不如 \`age\`）
- 随意缩写（\`usr_nm\` 不如 \`user_name\`）
- 前后不一致（一会叫 \`user\` 一会叫 \`customer\`）`,
    code: `# 标识符与命名规则演示

import keyword  # 用于查看关键字

print("=" * 50)
print("         Python 标识符命名规则")
print("=" * 50)

print("\\n=== 1. 合法的标识符示例 ===")
name = "小明"
_age = 18
user_name = "小红"
MAX_SIZE = 100
calculate_area = lambda r: 3.14 * r * r
print("name =", name)
print("_age =", _age)
print("user_name =", user_name)
print("MAX_SIZE =", MAX_SIZE)
print("半径5的面积 =", calculate_area(5))

print("\\n=== 2. 标识符区分大小写 ===")
Age = 20
age = 18
AGE = 25
print("Age =", Age)
print("age =", age)
print("AGE =", AGE)
print("这三个是完全不同的变量！")

print("\\n=== 3. Python 关键字列表（不能用作标识符）===")
all_keywords = keyword.kwlist
print("共", len(all_keywords), "个关键字:")
for i in range(0, len(all_keywords), 5):
    print("  " + "  ".join(f"{kw:<10}" for kw in all_keywords[i:i+5]))

print("\\n=== 4. 命名规范演示（PEP 8）===")

# 变量和函数：小写蛇形命名
student_name = "张三"
def calculate_bmi(weight, height):
    return weight / (height ** 2)

# 常量：全大写
PI = 3.14159
MAX_CONNECTIONS = 100

# 类名：大驼峰
class StudentInfo:
    pass

print("变量(蛇形):", student_name)
print("常量(大写):", PI, MAX_CONNECTIONS)
print("BMI计算:", calculate_bmi(70, 1.75))

print("\\n=== 5. 中文变量名（Python3支持但不推荐）===")
# Python 3 支持 Unicode 字符作为标识符，包括中文
姓名 = "李四"
年龄 = 22
print("姓名 =", 姓名)
print("年龄 =", 年龄)
print("（虽然能运行，但不推荐用中文，可能引起编码和兼容性问题）")

print("\\n=== 6. 错误命名演示（注释掉了，否则会报错）===")
# 错误1：数字开头
# 1name = "错"  # SyntaxError

# 错误2：包含特殊字符
# my-name = "错"  # SyntaxError（中划线被当作减号）
# my name = "错"  # SyntaxError（空格）

# 错误3：使用关键字
# if = 10    # SyntaxError
# for = "错" # SyntaxError
# class = 1  # SyntaxError

print("这些错误的命名都会导致 SyntaxError，程序无法运行")

print("\\n=== 7. 好命名 vs 坏命名 ===")
# 好命名：一看就知道是什么意思
user_age = 25
order_total_price = 99.9
is_logged_in = True

# 坏命名：不知道是什么意思
a = 25
x = 99.9
f = True

print("好命名让代码读起来像自然语言！")
print(f"用户年龄: {user_age}")
print(f"订单总价: ￥{order_total_price}")
print(f"是否登录: {is_logged_in}")`
  },
  {
    id: "py6-keywords",
    group: "基础入门",
    icon: "📋",
    title: "关键字与常用内置函数一览",
    content: `## 关键字与常用内置函数

这一章我们快速过一遍 Python 的关键字和最常用的内置函数，建立一个整体印象。后面会详细讲解它们的用法。

### 什么是关键字？

关键字是 Python 语言保留的、有特殊含义的单词，不能用作变量名/函数名。

### Python 3 关键字一览

| 关键字 | 用途 |
|--------|------|
| **控制流** | |
| \`if/elif/else\` | 条件判断 |
| \`for/while/break/continue\` | 循环 |
| \`match/case\` | 模式匹配（3.10+） |
| **函数/类** | |
| \`def\` | 定义函数 |
| \`return\` | 函数返回值 |
| \`class\` | 定义类 |
| \`lambda\` | 匿名函数 |
| \`yield\` | 生成器 |
| **异常处理** | |
| \`try/except/finally/raise\` | 异常处理 |
| \`assert\` | 断言 |
| **导入** | |
| \`import/from/as\` | 导入模块 |
| **逻辑/值** | |
| \`True/False/None\` | 三个特殊常量 |
| \`and/or/not\` | 逻辑运算 |
| \`is/in\` | 身份/成员判断 |
| **作用域** | |
| \`global/nonlocal\` | 作用域声明 |
| **其他** | |
| \`with/as\` | 上下文管理器 |
| \`pass\` | 空语句占位 |
| \`del\` | 删除对象 |
| \`async/await\` | 异步编程 |

### 什么是内置函数？

内置函数是 Python 自带的、不需要导入就能直接使用的函数。Python 3 有 70 多个内置函数。

### 最常用内置函数分类

#### 基础输入输出

| 函数 | 作用 |
|------|------|
| \`print()\` | 打印输出 |
| \`input()\` | 获取输入 |

#### 类型相关

| 函数 | 作用 |
|------|------|
| \`type()\` | 查看类型 |
| \`int()/float()/str()/bool()/list()/tuple()/set()/dict()\` | 类型转换 |
| \`isinstance()\` | 判断是否某类型 |

#### 数学相关

| 函数 | 作用 |
|------|------|
| \`abs()\` | 绝对值 |
| \`round()\` | 四舍五入 |
| \`max()/min()/sum()\` | 最大/最小/求和 |
| \`pow()\` | 幂运算 |
| \`divmod()\` | (商, 余数) |

#### 序列/迭代相关

| 函数 | 作用 |
|------|------|
| \`len()\` | 长度 |
| \`range()\` | 生成整数序列 |
| \`enumerate()\` | 带索引遍历 |
| \`zip()\` | 并行遍历 |
| \`map()/filter()\` | 映射/过滤 |
| \`sorted()/reversed()\` | 排序/反转 |

#### 其他常用

| 函数 | 作用 |
|------|------|
| \`help()\` | 查看帮助文档 |
| \`dir()\` | 查看对象属性方法 |
| \`isinstance()\` | 类型判断 |
| \`open()\` | 打开文件 |
| \`id()\` | 获取对象内存地址 |

### 如何查看所有内置函数

\`\`\`python
print(dir(__builtins__))  # dir() 列出对象属性，__builtins__ 含所有内置名字
\`\`\`

### help() 是你的好朋友

遇到不会用的函数，用 \`help(函数名)\` 查看文档：

\`\`\`python
help(print)      # help() 显示函数的用法文档
help(str.split)  # 也可查看类方法的文档
\`\`\``,
    code: `# 关键字与常用内置函数演示

import keyword
import builtins

print("=" * 60)
print("            Python 关键字与内置函数")
print("=" * 60)

print("\\n=== 1. Python 关键字统计 ===")
kw_list = keyword.kwlist
print(f"Python 共有 {len(kw_list)} 个关键字")
# 按字母顺序打印，每行8个
for i in range(0, len(kw_list), 8):
    line = kw_list[i:i+8]
    print("  " + "  ".join(f"{kw:<10}" for kw in line))

print("\\n=== 2. 常用内置函数演示 ===")

print("\\n--- 数学函数 ---")
numbers = [5, 2, 9, 1, 5, 6]
print("数字列表:", numbers)
print("abs(-10) =", abs(-10), "（绝对值）")
print("max(numbers) =", max(numbers), "（最大值）")
print("min(numbers) =", min(numbers), "（最小值）")
print("sum(numbers) =", sum(numbers), "（求和）")
print("pow(2, 10) =", pow(2, 10), "（2的10次方）")
print("divmod(17, 5) =", divmod(17, 5), "（商3余2）")
print("round(3.14159, 2) =", round(3.14159, 2), "（四舍五入保留2位）")

print("\\n--- 序列函数 ---")
text = "Python"
lst = [10, 20, 30, 40, 50]
print("len('Python') =", len(text), "（长度）")
print("len(lst) =", len(lst))
print("list(range(5)) =", list(range(5)), "（range生成0-4）")
print("list(range(2, 10, 2)) =", list(range(2, 10, 2)), "（2到9，步长2）")

print("\\n--- 排序函数 ---")
unsorted = [3, 1, 4, 1, 5, 9, 2, 6]
print("原列表:", unsorted)
print("sorted(升序):", sorted(unsorted))
print("sorted(降序):", sorted(unsorted, reverse=True))
chars = ["b", "a", "d", "c"]
print("sorted(字符):", sorted(chars))
print("list(reversed([1,2,3])):", list(reversed([1, 2, 3])))

print("\\n--- 类型判断函数 ---")
print("type(123):", type(123))
print("type(3.14):", type(3.14))
print("type('hello'):", type("hello"))
print("isinstance(123, int):", isinstance(123, int))
print("isinstance('hi', str):", isinstance("hi", str))
print("isinstance(3.14, (int, float)):", isinstance(3.14, (int, float)))

print("\\n--- 实用函数 ---")
# all() 和 any()
print("all([True, True, True]):", all([True, True, True]))
print("all([True, False, True]):", all([True, False, True]))
print("any([False, False, True]):", any([False, False, True]))
print("any([False, False, False]):", any([False, False, False]))

# chr() 和 ord()：字符和编码转换
print("ord('A') =", ord("A"), "（'A'的ASCII码）")
print("chr(65) =", chr(65), "（ASCII码65对应的字符）")
print("ord('中') =", ord("中"))
print("chr(20013) =", chr(20013))

print("\\n--- 枚举和并行遍历 ---")
fruits = ["苹果", "香蕉", "橙子"]
print("enumerate 带索引遍历:")
for idx, fruit in enumerate(fruits):
    print(f"  第{idx+1}个水果: {fruit}")

names = ["小明", "小红", "小刚"]
scores = [95, 88, 76]
print("\\nzip 并行遍历:")
for name, score in zip(names, scores):
    print(f"  {name}: {score}分")

print("\\n=== 3. 查看内置函数总数 ===")
# 统计内置函数数量（过滤掉异常等）
builtin_names = [name for name in dir(builtins) if not name.startswith("_")]
print(f"共有 {len(builtin_names)} 个内置名称（包括函数、异常、常量等）")

print("\\n=== 4. help() 帮助演示（小提示）===")
print("遇到不会的函数，可以在交互式环境输入:")
print("  help(函数名)")
print("例如:")
print("  help(print)")
print("  help(list.append)")
print("  help(str.split)")`
  }
];
