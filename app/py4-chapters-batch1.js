// =============================================================
// Batch 1：快速开始（4 章）
// 1. py4-install    Python 安装、REPL、运行 .py、help()/dir()
// 2. py4-vars       变量、动态类型、int/float/bool/None
// 3. py4-numbers    数字运算、math、进制、科学计数
// 4. py4-strings    字符串、f-string、切片、常用方法
// =============================================================

export const chapters = [
  {
    id: "py4-install",
    group: "快速开始",
    icon: "🐍",
    title: "安装与运行：REPL、.py、自省",
    content: `
## 安装
- 官网 [python.org](https://python.org) 下载，macOS 自带 Python 3.x
- 版本：推荐 3.12+，本教程基于 3.12 语法
- 检查：\`python3 --version\`

## REPL
- 终端输入 \`python3\` 进入交互模式，逐行执行
- 退出：\`exit()\` 或 Ctrl+D

## 运行 .py
- \`python3 hello.py\`
- 或文件头加 \`#!/usr/bin/env python3\` + \`chmod +x\`

## 自省三件套
- \`type(x)\` — 看类型
- \`dir(x)\` — 列出所有属性
- \`help(x)\` — 看文档
`,
    code: `# 这行是注释。Python 用 # 注释，用缩进（4 空格）表示代码块
import sys, platform, os

print("Python:", sys.version.split()[0])
print("平台:", platform.system(), platform.machine())
print("CWD:", os.getcwd())

# 自省三件套
x = [1, 2, 3]
print("type:", type(x).__name__)          # list
print("dir 前 5:", dir(x)[:5])            # ['__add__', ...]
# help(x)  # 会进入交互式分页器，这里略过

# 算术 + 字符串拼接
print(1 + 2 * 3, "hello" + " " + "world", f"1+1={1+1}")
`,
  },
  {
    id: "py4-vars",
    group: "快速开始",
    icon: "📦",
    title: "变量与基础类型",
    content: `
- **动态强类型**：变量无类型，对象有类型；不会隐式转换
- 基础类型：\`int\` / \`float\` / \`bool\` / \`str\` / \`NoneType\`
- \`None\` 表示空值（类似 JS null）
- 多变量赋值：\`a, b = 1, 2\`；链式：\`x = y = 0\`
- 不可变：int/float/bool/str/tuple；可变：list/dict/set
- 任意精度整数：\`2 ** 100\` 不会溢出
- \`bool\` 是 \`int\` 的子类
`,
    code: `# 动态类型
x = 10          # int
x = "hello"     # str，OK
x = 3.14        # float，OK
# x = x + "!"   # TypeError：强类型

# 多变量 / 链式赋值
a, b, c = 1, 2, 3
x = y = z = 0
print(a, b, c, x, y, z)

# 任意精度
print(2 ** 100)                      # 12676506...
print(type(2 ** 100) is int)        # True

# bool 是 int 子类
print(isinstance(True, int), True + True, bool(0), bool(""))

# 类型转换
print(int("42"), float("3.14"), str(123))

# None 判空
val = None
print(val is None, val is not None)
`,
  },
  {
    id: "py4-numbers",
    group: "快速开始",
    icon: "🔢",
    title: "数字：整数、浮点、进制、math",
    content: `
- 整数 \`int\`：任意精度，无溢出
- 浮点 \`float\`：IEEE 754 双精度，注意 \`0.1 + 0.2 != 0.3\`
- 复数 \`complex\`：\`3 + 4j\`
- 进制：\`0b101\`（二进制）、\`0o755\`（八进制）、\`0xFF\`（十六进制）
- \`float("inf")\` 无穷大，\`float("nan")\` 非数值
- \`math\` 模块：三角函数、对数和常量
- \`decimal.Decimal\`：高精度十进制（金融计算）
`,
    code: `import math, decimal

# 浮点陷阱
print(0.1 + 0.2)                     # 0.30000000000000004
print(0.1 + 0.2 == 0.3)             # False

# 浮点判断
print(math.isclose(0.1 + 0.2, 0.3)) # True

# 进制
print(0b101, 0o755, 0xFF)           # 5 493 255
print(bin(10), oct(10), hex(10))    # 0b1010 0o12 0xa

# 无穷大 / NaN
print(float("inf") > 10**100, math.isnan(float("nan")))

# math 常用
print(math.pi, math.e, math.sqrt(2), math.factorial(5))
print(math.ceil(3.2), math.floor(3.8), round(3.14159, 2))

# Decimal：精确小数
d = decimal.Decimal("0.1") + decimal.Decimal("0.2")
print(d, d == decimal.Decimal("0.3"))  # True
`,
  },
  {
    id: "py4-strings",
    group: "快速开始",
    icon: "📝",
    title: "字符串：f-string、切片、方法",
    content: `
- 三种引号：\`'...'\` / \`"..."\` / \`'''...'''\`（多行）
- **f-string**（3.6+）：\`f"hi {name}"\`，支持表达式和格式说明符
- 字符串**不可变**，所有方法返回新字符串
- 切片：\`s[start:stop:step]\`
- 常用方法：\`strip/split/join/replace/find/startswith/endswith\`
- 3.12+ 改进 f-string：可嵌套引号、多行表达式
- 原始字符串：\`r"\n"\` 不转义
`,
    code: `name, age = "alice", 30

# f-string：格式说明符
print(f"name={name!r}, age={age}, next={age+1}")
print(f"hex={255:#x}, pi={3.14159:.2f}, pad={42:05d}")

# 多行字符串
s = """line1
line2
line3"""
print(s)

# 切片
s = "hello world"
print(s[0:5], s[6:], s[::-1])       # hello world dlrow olleh
print(s[-1], s[-5:])                 # d world

# 常用方法（不可变，全返回新字符串）
msg = "  Hello, World!  "
print(msg.strip(), msg.lower(), msg.upper())
print("a,b,c".split(","))
print("-".join(["2024", "01", "01"]))
print("hello world".replace("world", "python"))
print("python".startswith("py"), "python".endswith("on"))
print("hello".find("ll"), "hello".index("ll"))

# 3.12+ 嵌套引号
print(f"dict: { {k: len(k) for k in ["a", "bc"]} }")
`,
  },
];