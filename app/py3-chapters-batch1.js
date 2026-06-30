// =============================================================
// Python 3.12+ 实战教程 —— 第一批章节（基础，4 章）
// 1. intro           快速开始：解释器、REPL、运行 .py、help()
// 2. variables       变量、动态类型、int/float/bool/None
// 3. strings         字符串、f-string、常用方法
// 4. operators       运算符、walrus、海象、比较
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：快速开始
  // =========================================================
  {
    id: "py3-intro",
    group: "基础",
    icon: "🐍",
    title: "快速开始：解释器、REPL、运行 .py",
    content: `
# 快速开始

## Python 解释器与 REPL

- **解释器**：cpython 是官方实现，命令行里 \`python3\` 进入 REPL
- **REPL**（Read-Eval-Print-Loop）：交互式环境，输入即执行
- **运行 .py 文件**：\`python3 hello.py\`
- **自省**：\`dir(x)\` 列出所有属性；\`help(x)\` 看帮助；\`type(x)\` 看类型
- **退出 REPL**：\`exit()\` / Ctrl+D

## 缩进 = 语法

Python 用**缩进**表达代码块（4 空格约定），不要混用 Tab 和空格。
`,
    code: `# 一行一个表达式，REPL 立即求值
import sys, platform

print("Python 版本:", sys.version.split()[0])  # 如 3.12.4
print("平台:", platform.system(), platform.machine())
print("解释器:", platform.python_implementation())

# 自省三件套：type / dir / help
x = [1, 2, 3]
print("type(x):", type(x).__name__)   # list
print("dir(x) 前 5 个:", dir(x)[:5])
# help(x) 会进入交互式分页器（这里只演示，不实际调用）

# 算术表达式 + 字符串拼接
print(1 + 2 * 3, "hello" + " " + "world", f"1+1={1+1}")
`,
  },

  // =========================================================
  // 第二章：变量与基础类型
  // =========================================================
  {
    id: "py3-variables",
    group: "基础",
    icon: "📦",
    title: "变量、动态类型、基础类型",
    content: `
# 变量与基础类型

- Python 是**动态强类型**：变量无类型，对象有类型
- 基础类型：\`int\`、\`float\`、\`bool\`、\`str\`、\`NoneType\`
- 关键字 \`None\` 表示空值（类似 JS 的 null）
- 多变量赋值：\`a, b = 1, 2\`；链式赋值：\`x = y = 0\`
- 不可变：int / float / bool / str / tuple；可变：list / dict / set
- 任意精度整数：\`2 ** 100\` 不会溢出
`,
    code: `# 动态类型：变量没有类型，对象有
x = 10           # int
x = "hello"      # 现在是 str，OK
x = 3.14         # 现在是 float，OK
# x = x + "!"    # TypeError，强类型：不会自动转

# 多变量赋值 + 链式赋值
a, b, c = 1, 2, 3
x = y = z = 0
print(a, b, c, x, y, z)

# 任意精度整数
print(2 ** 100)  # 1267650600228229401496703205376
print(type(2 ** 100) is int)  # True

# bool 是 int 的子类
print(isinstance(True, int), True + True)  # True 2

# None 与判空
val = None
print(val is None, val is not None)  # True False

# 类型转换
print(int("42"), float("3.14"), str(123), bool(0), bool(""))  # 42 3.14 123 False False
`,
  },

  // =========================================================
  // 第三章：字符串
  // =========================================================
  {
    id: "py3-strings",
    group: "基础",
    icon: "📝",
    title: "字符串、f-string、常用方法",
    content: `
# 字符串

- 三种引号：\`'...\`, \`"..."\`, \`'''...'''\`（多行）
- **f-string**（推荐）：\`f"hi {name}, age={age+1}"\`，支持表达式和格式说明符
- 字符串**不可变**：所有方法返回新字符串
- 常用方法：\`upper/lower/strip/split/join/replace/find/startswith/endswith\`
- 切片：\`s[a:b:c]\`（a 起始、b 结束、c 步长）
- Python 3.12+ 改进 f-string：可以嵌套引号、可以写多行表达式
`,
    code: `name = "alice"
age = 30

# f-string：3.12+ 改进了引号嵌套
print(f"name={name!r}, age={age}, next_year={age + 1}")
print(f"hex={255:#x}, pi={3.14159:.2f}, pad={42:05d}")

# 多行字符串 + 切片
s = """line1
line2
line3"""
print(s)
print("s[0:5] =", repr(s[0:5]))     # 'line1'
print("s[::-1] =", repr(s[::-1]))   # 倒序

# 常用方法（不可变，全返回新串）
msg = "  Hello, World!  "
print(msg.strip(), msg.lower(), msg.upper())
print("a,b,c".split(","), "-".join(["2024", "01", "01"]))
print("hello world".replace("world", "python"))
print("python".startswith("py"), "python".endswith("on"))
print("hello".find("ll"), "hello".index("ll"))

# 3.12+ 嵌套引号
table = {"a": 1, "b": 2}
print(f"json: {table}")  # 直接打印 dict
`,
  },

  // =========================================================
  // 第四章：运算符
  // =========================================================
  {
    id: "py3-operators",
    group: "基础",
    icon: "➕",
    title: "运算符、比较、Walrus 海象",
    content: `
# 运算符

- 算术：\`+ - * / // % **\`（注意 \`/\` 永远返回 float，\`//\` 是整除）
- 比较：\`== != < > <= >=\`，可链式：\`1 < x < 10\`
- 逻辑：\`and or not\`（不是 \`&& || !\`）
- 成员 / 身份：\`in / not in / is / is not\`
- **海象运算符** \`:=\`（3.8+）：表达式内赋值，常用于 if/while
- 三元：\`x if cond else y\`
`,
    code: `# 算术 + 整除
print(7 / 2, 7 // 2, 7 % 2, 2 ** 10)  # 3.5 3 1 1024

# 链式比较（Python 特色）
x = 5
print(1 < x < 10)        # True，等价于 1 < x and x < 10
print(1 == x == 5)       # True

# 逻辑 + 短路
print(0 or "default")    # 'default'（0 为假）
print("a" and "b")       # 'b'（都真则返回最后一个）

# 成员 / 身份
print("py" in "python", 1 in [1, 2, 3])
a = b = [1, 2]
print(a is b, a == b)    # True True（指向同一个列表）

# 海象运算符（walrus）
data = [1, 2, 3, 4, 5]
if (n := len(data)) > 3:
    print(f"data 长度 {n} 超过 3")

# 列表推导中用 walrus
squared = [y for x in data if (y := x * x) > 5]
print(squared)  # [9, 16, 25]

# 三元表达式
score = 75
grade = "pass" if score >= 60 else "fail"
print(grade)
`,
  },
];
