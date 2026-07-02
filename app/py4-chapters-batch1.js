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
## 一、为什么要学 Python

Python 是一门**解释型、动态类型、强类型**的通用编程语言。它被广泛用于 Web 后端(Django/Flask/FastAPI)、数据科学(NumPy/Pandas)、人工智能(PyTorch/TensorFlow)、自动化运维、爬虫、脚本工具等领域。它的设计哲学是「**用一种明显正确的方式做事**」,强调代码可读性。

Python 的三个核心特点:
- **解释型**:代码不需要编译成机器码,由解释器逐行执行。好处是跨平台、改完即跑;代价是运行速度比 C/Java 慢。
- **动态类型**:变量不需要声明类型,\`x = 10\` 之后还能 \`x = "hello"\`。好处是写起来快;代价是类型错误要到运行时才暴露(大型项目常用 type hints + mypy 弥补)。
- **强类型**:\`1 + "1"\` 会报 TypeError,不会像 JavaScript 那样偷偷转换。好处是行为可预测;代价是要手动做类型转换。

## 二、安装 Python

### 2.1 各平台安装方式
- **macOS**:系统自带 \`python3\`(位于 /usr/bin/python3),但版本可能较旧。推荐用 [Homebrew](https://brew.sh) 安装最新版:\`brew install python@3.12\`。
- **Windows**:去 [python.org](https://www.python.org/downloads/) 下载安装包。**安装时务必勾选 "Add Python to PATH"**,否则命令行找不到 \`python\` 命令。Windows 下命令是 \`python\`(不是 \`python3\`)。
- **Linux**:大部分发行版自带。Ubuntu/Debian 可用 \`sudo apt install python3\`,CentOS 用 \`sudo yum install python3\`。

### 2.2 版本选择
本教程基于 **Python 3.12+**。3.12 相比旧版有这些重要改进:
- f-string 可以嵌套相同引号(3.6-3.11 不行)
- match-case 模式匹配(3.10+)
- 类型参数语法 \`def f[T](x: T) -> T\`(3.12+)
- 性能改进(每个版本都有)

检查版本:\`python3 --version\`,应输出类似 \`Python 3.12.0\`。

### 2.3 Python 与 pip 的关系
- **Python 解释器**:执行 .py 代码的程序。
- **pip**:Python 的包管理器,用来安装第三方库(\`pip install requests\`)。
- **虚拟环境**:每个项目独立的依赖空间,避免不同项目依赖冲突。用 \`python3 -m venv .venv\` 创建,\`source .venv/bin/activate\` 激活。

## 三、REPL 交互模式

REPL(Read-Eval-Print Loop,读取-求值-打印 循环)是一个交互式命令行,输入一行代码立即执行并显示结果。

\`\`\`
$ python3            # 在终端输入 python3 启动 REPL 交互式解释器
>>> 1 + 2           # >>> 是 REPL 提示符，输入表达式立即求值
3                    # 解释器打印求值结果
>>> name = "alice"   # 赋值语句，REPL 中赋值不显示返回值
>>> print(name)      # print() 输出字符串内容（不带引号）
alice
>>> exit()           # 退出 REPL；也可用 quit() 或 Ctrl+D
\`\`\`

**REPL 的用途**:
- 快速试验某个语法或 API(比写文件再运行快)
- 查看 \`help(list)\` 文档
- 调试时逐行验证逻辑

**退出方式**:\`exit()\` 或 \`quit()\` 或 Ctrl+D(EOF)。macOS/Linux 下 Ctrl+D 发送 EOF 信号;Windows 下用 Ctrl+Z 回车。

## 四、运行 .py 文件

### 4.1 标准方式
\`python3 hello.py\` —— 解释器读取整个文件,从上到下执行。

### 4.2 Shebang 方式(类 Unix 系统)
在文件第一行写 \`#!/usr/bin/env python3\`,然后 \`chmod +x hello.py\` 给执行权限,之后就能 \`./hello.py\` 直接运行(像执行 shell 脚本一样)。
- \`#!\` 叫 shebang,告诉系统用哪个解释器执行这个文件。
- \`/usr/bin/env python3\` 的作用是「在 PATH 里找 python3」,比写死路径 \`/usr/bin/python3\` 更可移植(因为不同系统 python3 位置不同)。

### 4.3 __name__ == "__main__" 惯例
\`\`\`python
def main():                       # 定义主函数，封装程序核心逻辑
    print("hello")                # 函数体，4 空格缩进表示属于 main

if __name__ == "__main__":        # 判断当前模块是否作为主入口直接运行
    main()                        # 直接运行时调用 main()；被 import 时不执行
\`\`\`
- 当直接 \`python3 foo.py\` 运行时,\`__name__\` 等于 \`"__main__"\`,会执行 main()。
- 当被 \`import foo\` 导入时,\`__name__\` 等于 \`"foo"\`,不会执行 main()。
- 这样设计可以让一个文件既能独立运行,又能被当作模块导入而不产生副作用。

## 五、自省三件套

「自省」(Introspection)指程序在运行时查看对象自身信息的能力,是 Python 的强项。

### 5.1 type(x) —— 查看对象类型
\`type([1,2])\` 返回 \`<class 'list'>\`。\`type(x).__name__\` 取类型名字符串(如 \`"list"\`)。
- 用途:调试时确认变量是什么类型;配合 \`isinstance()\` 做类型判断。
- 注意:**生产代码优先用 \`isinstance(x, list)\` 而非 \`type(x) is list\`**,因为 isinstance 能识别子类,更符合面向对象的 Liskov 替换原则。

### 5.2 dir(x) —— 列出所有属性和方法
\`dir([])\` 返回 list 的所有方法名列表,如 \`['append', 'clear', 'copy', ...]\`。
- 用途:不知道一个对象有哪些方法时,dir 一下就全看到了。
- 返回的结果里以双下划线开头结尾的(如 \`__add__\`)叫「魔术方法/dunder method」,是运算符重载用的。

### 5.3 help(x) —— 查看文档
\`help(list.append)\` 会显示 append 方法的文档字符串和签名。
- 在 REPL 里会进入分页器(按 q 退出,空格翻页)。
- 在脚本里调用 help() 会干扰输出,一般只在 REPL 用。
- 自己写的函数/类加 docstring(\`"""文档"""\`)后,help() 也能显示。

## 六、本节代码逐行讲解

\`\`\`python
import sys, platform, os   # 一次导入多个标准库模块；sys 解释器信息，platform 系统信息，os 文件系统/环境变量
\`\`\`
- import 语句导入标准库模块。可以一次导入多个(\`import a, b, c\`)。
- \`sys\` 提供 Python 解释器相关信息(版本、路径);\`platform\` 提供操作系统信息;\`os\` 提供文件系统、环境变量等接口。

\`\`\`python
print("Python:", sys.version.split()[0])   # sys.version 是版本字符串，split() 按空白分割，[0] 取纯版本号
\`\`\`
- \`sys.version\` 是类似 \`"3.12.0 (main, ...)"\` 的字符串。
- \`.split()\` 按空白分割成列表 \`["3.12.0", "(main,", ...]\`。
- \`[0]\` 取第一个元素,即纯版本号 \`"3.12.0"\`。

\`\`\`python
x = [1, 2, 3]
print("type:", type(x).__name__)          # type(x) 取类型，.__name__ 取类型名字符串 "list"
print("dir 前 5:", dir(x)[:5])            # dir(x) 列出所有属性方法，[:5] 切片取前 5 个
\`\`\`
- \`type(x).__name__\` 拿到类型名字符串,比 \`str(type(x))\` 干净(后者是 \`<class 'list'>\`)。
- \`dir(x)[:5]\` 切片取前 5 个,因为 list 方法很多,全打印太长。

## 七、小结与易错点

| 概念 | 关键点 | 易错 |
|---|---|---|
| 运行方式 | \`python3 file.py\` 或 shebang | Windows 用 \`python\` 不是 \`python3\` |
| 缩进 | 4 空格表示代码块 | Tab 和空格混用会 IndentationError |
| 注释 | \`#\` 单行,\`"""\` 多行 | 没有 \`//\` 和 \`/* */\` |
| 自省 | type/dir/help | help 在脚本里会卡住,只在 REPL 用 |
| __name__ | 区分「直接运行」vs「被导入」 | 忘了写会导致 import 时执行副作用代码 |
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
## 一、Python 的类型模型:动态 + 强类型

理解 Python 类型系统,要分清两个概念:**变量**和**对象**。

### 1.1 变量是「标签」,对象是「实体」
在 C/Java 里,变量是一个「盒子」,装着一个值,盒子有类型(\`int x = 10\` 后 x 这个盒子只能装 int)。
在 Python 里,**变量是一个「标签」,贴在对象上**。对象有类型,变量没有类型。

\`\`\`python
x = 10       # 创建 int 对象 10，把标签 x 贴上去
x = "hello"  # 创建 str 对象 "hello"，把标签 x 撕下来贴到新对象上
\`\`\`
这里 x 没有「类型」,它只是一个名字。10 和 "hello" 才有类型(int 和 str)。你可以随时把同一个标签贴到不同类型的对象上 —— 这就是「动态类型」。

### 1.2 「强类型」是什么意思
「强类型」指**不会隐式做类型转换**。对比:
- JavaScript(弱类型):\`1 + "1"\` 得 \`"11"\`(数字被转成字符串)
- Python(强类型):\`1 + "1"\` 抛 \`TypeError: unsupported operand type(s)\`

Python 要求你**显式**转换:\`1 + int("1")\` 或 \`str(1) + "1"\`。这避免了大量「看起来对、结果错」的隐蔽 bug。

### 1.3 为什么 Python 选这种设计
动态类型牺牲了编译期类型检查(换来了灵活和简洁),强类型保留了运行时的安全性(避免了隐式转换的坑)。两者结合,让 Python 既能快速写,又不容易出诡异 bug。大型项目用 **type hints + mypy** 在静态检查阶段找回类型安全。

## 二、五大基础类型详解

| 类型 | 示例 | 说明 | 可变? |
|---|---|---|---|
| \`int\` | \`10\`, \`-5\`, \`0\` | 任意精度整数 | 不可变 |
| \`float\` | \`3.14\`, \`1e10\` | IEEE 754 双精度浮点 | 不可变 |
| \`bool\` | \`True\`, \`False\` | 布尔,是 int 的子类 | 不可变 |
| \`str\` | \`"hello"\` | Unicode 字符串 | 不可变 |
| \`NoneType\` | \`None\` | 空值,唯一实例 | 不可变 |

### 2.1 int 的「任意精度」
Python 的 int 没有 32 位/64 位限制,\`2 ** 100\` 是一个 31 位数字,完全精确,不会溢出。这是因为 Python 内部用「变长数组」存 int,数字越大占的内存越多。代价是运算比固定精度的慢一点。

### 2.2 float 的精度陷阱
float 是 IEEE 754 双精度(64 位),和 C 的 double 一样。\`0.1 + 0.2\` 得 \`0.30000000000000004\`,因为 0.1 在二进制下是无限循环小数,无法精确表示。
- **比较浮点数**:用 \`math.isclose(a, b)\` 而非 \`a == b\`。
- **金融计算**:用 \`decimal.Decimal\`,它是十进制精确存储。

### 2.3 bool 是 int 的子类
\`True\` 本质是 1,\`False\` 本质是 0。\`isinstance(True, int)\` 是 \`True\`,\`True + True\` 得 \`2\`。这是历史遗留设计(早期 Python 没有 bool 类型,用 0/1 代替)。
- **判断真假**:Python 里 \`0\`、\`0.0\`、\`""\`、\`[]\`、\`{}\`、\`None\` 都是「假」,其余都是「真」。
- \`bool(x)\` 把任意值转成布尔:空容器 → False,非空 → True。

### 2.4 None 的语义
\`None\` 表示「没有值」「空」「未定义」,类似 JavaScript 的 \`null\`、Java 的 \`null\`。它是一个**单例**(全局只有一个 None 对象)。
- **判断 None**:**必须用 \`x is None\`,不能用 \`x == None\`**。因为 \`==\` 会调用 \`__eq__\`,某些对象可能重写了它导致 \`x == None\` 返回非预期结果;\`is\` 比较身份(内存地址),绝对可靠。

## 三、赋值的几种形式

### 3.1 多变量赋值(元组解包)
\`a, b, c = 1, 2, 3\` 等价于 \`a = 1; b = 2; c = 3\`。
原理:右边 \`1, 2, 3\` 是一个元组 \`(1, 2, 3)\`,左边是「解包目标」,Python 把元组的元素按位置赋给左边的变量。

**经典应用:交换两个变量**
\`\`\`python
a, b = b, a   # 不需要临时变量！右边先求值成元组 (b,a) 再解包给左边的 a,b
\`\`\`
原理:右边先求值成元组 \`(b的值, a的值)\`,再解包给左边的 a 和 b。

### 3.2 链式赋值
\`x = y = z = 0\` 把 0 同时赋给 x、y、z。**注意三个变量指向同一个对象 0**(int 不可变,所以无影响;但如果是 \`x = y = []\`,三个变量共享同一个 list,改一个全变!)。

### 3.3 增强赋值
\`x += 1\` 等价于 \`x = x + 1\`。对可变对象(list)有优化:\`lst += [4]\` 等价于 \`lst.extend([4])\`(原地修改),而 \`lst = lst + [4]\` 会创建新 list。

## 四、可变 vs 不可变(关键概念)

这是 Python 最容易踩坑的地方,必须理解透彻。

### 4.1 不可变类型(immutable)
\`int\`、\`float\`、\`bool\`、\`str\`、\`tuple\` 是不可变的。**「不可变」指对象本身的值不能被改变**,任何「修改」操作都是创建新对象:
\`\`\`python
s = "hello"
s2 = s.upper()   # str 不可变，upper() 返回新对象 "HELLO"，s 原值不变
\`\`\`

### 4.2 可变类型(mutable)
\`list\`、\`dict\`、\`set\` 是可变的,可以原地增删改:
\`\`\`python
lst = [1, 2, 3]
lst.append(4)   # append 原地追加，lst 仍是同一对象，变成 [1, 2, 3, 4]
\`\`\`

### 4.3 为什么这很重要 —— 函数参数陷阱
\`\`\`python
def add_item(lst, item):
    lst.append(item)   # 直接修改传入的 list，因为是同一对象（可变类型副作用）

my = [1, 2]
add_item(my, 3)        # 把外部 list 传进去，函数内修改会影响外部
print(my)   # [1, 2, 3] —— my 被改了！避免方式：传 my.copy() 副本
\`\`\`
因为 list 可变,函数内修改的是外面同一个对象。要避免副作用,传副本(\`add_item(my.copy(), 3)\`)或返回新 list。

### 4.4 不可变的好处
- 可作为 dict 的 key / set 的元素(可变对象不行,因为 hash 值会变)
- 线程安全(没人能改它)
- 函数参数传递更安全

## 五、类型转换

| 转换 | 函数 | 示例 | 注意 |
|---|---|---|---|
| → int | \`int(x)\` | \`int("42")\` → 42 | \`int("3.14")\` 报错,要先 float |
| → float | \`float(x)\` | \`float("3.14")\` → 3.14 | |
| → str | \`str(x)\` | \`str(123)\` → "123" | 任何类型都能转 |
| → bool | \`bool(x)\` | \`bool("")\` → False | 空容器都是 False |

\`int("3.14")\` 会报 \`ValueError\`,因为 "3.14" 不是合法整数格式。要先 \`int(float("3.14"))\`。

## 六、代码逐行讲解

\`\`\`python
x = 10          # int
x = "hello"     # str，OK —— 同一变量名可重新绑定到不同类型对象
x = 3.14        # float，OK —— 这就是动态类型
\`\`\`
三次赋值,x 这个标签依次贴到 int 10、str "hello"、float 3.14 上。演示动态类型。

\`\`\`python
# x = x + "!"   # TypeError：强类型
\`\`\`
被注释掉,因为它会抛 TypeError。强类型不会把 3.14 转成字符串去拼接。

\`\`\`python
print(2 ** 100)   # ** 是幂运算符；2 的 100 次方，int 任意精度不溢出
\`\`\`
\`**\` 是幂运算。\`2 ** 100\` 是个 31 位的大整数,Python 精确计算,不溢出。

\`\`\`python
print(isinstance(True, int), True + True, bool(0), bool(""))
# isinstance(True, int) → True：bool 是 int 子类
# True + True → 2：布尔值可当 0/1 参与算术
# bool(0) → False：0 是假值
# bool("") → False：空字符串是假值
\`\`\`
- \`isinstance(True, int)\` → True,因为 bool 是 int 子类
- \`True + True\` → 2(True 当 1 用)
- \`bool(0)\` → False(0 是假)
- \`bool("")\` → False(空字符串是假)

\`\`\`python
val = None
print(val is None, val is not None)
# val is None → True：身份比较，None 是单例
# val is not None → False：取反判断
# 永远用 is 判 None，不要用 == （== 可能被重载）
\`\`\`
- \`val is None\` → True(身份比较,None 是单例)
- \`val is not None\` → False(取反)
- **永远用 is 判 None,不要用 ==**

## 七、易错点小结

| 易错 | 正确做法 |
|---|---|
| 用 \`== None\` 判空 | 用 \`is None\` |
| \`x = y = []\` 后改 x | 改成 \`x = []; y = []\` 或 \`y = x.copy()\` |
| 函数内修改 list 参数 | 传 \`.copy()\` 或返回新 list |
| \`int("3.14")\` | 改成 \`int(float("3.14"))\` |
| 浮点 \`==\` 比较 | 用 \`math.isclose()\` |
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
## 一、Python 的数字类型全景

Python 有三种内置数字类型,外加两个高精度模块:

| 类型 | 用途 | 示例 | 精度 |
|---|---|---|---|
| \`int\` | 整数 | \`10\`, \`-5\`, \`0xFF\` | 任意精度 |
| \`float\` | 小数 | \`3.14\`, \`1e10\` | IEEE 754 双精度(约 15-17 位有效数字) |
| \`complex\` | 复数 | \`3 + 4j\` | 实部虚部都是 float |
| \`decimal.Decimal\` | 十进制精确 | \`Decimal("0.1")\` | 可配置(默认 28 位) |
| \`fractions.Fraction\` | 分数 | \`Fraction(1, 3)\` | 精确(有理数) |

## 二、int 详解

### 2.1 任意精度
Python 的 int 理论上没有大小限制(受内存限制)。\`2 ** 1000\` 是个 302 位的数,完全精确。对比 C 的 int64 最大约 \`9.2e18\`,超过就溢出。Python 内部用「变长数组」存 int,数字越大数组越长,所以大数运算比固定精度慢,但永远不会溢出。

### 2.2 进制表示
- 十进制:\`42\`
- 二进制:\`0b101010\`(0b 开头)
- 八进制:\`0o755\`(0o 开头,文件权限常用)
- 十六进制:\`0xFF\`(0x 开头,颜色值、内存地址常用)

**进制转换函数**:
- \`bin(10)\` → \`"0b1010"\`(转二进制字符串)
- \`oct(10)\` → \`"0o12"\`(转八进制)
- \`hex(255)\` → \`"0xff"\`(转十六进制)
- \`int("ff", 16)\` → 255(把字符串按指定进制解析)

### 2.3 整除和取余
- \`/\` 真除法:\`7 / 2\` → \`3.5\`(总是返回 float)
- \`//\` 整除:\`7 // 2\` → \`3\`(向下取整,**注意负数**:\`-7 // 2\` → \`-4\`,不是 -3)
- \`%\` 取余:\`7 % 2\` → \`1\`(和 // 配套,\`a = (a // b) * b + a % b\` 恒成立)
- \`divmod(a, b)\` → \`(商, 余数)\` 一次拿两个

**负数整除的坑**:\`-7 // 2\` 是 \`-4\`(向负无穷取整),不是 \`-3\`(向零取整)。这是因为 Python 用「floor division」。如果想要向零取整,用 \`int(a / b)\` 或 \`math.trunc(a / b)\`。

## 三、float 详解

### 3.1 IEEE 754 双精度
Python 的 float 是 64 位双精度浮点数,和 C 的 double、JavaScript 的 Number 一样。1 位符号 + 11 位指数 + 52 位尾数,能精确表示约 15-17 位十进制有效数字。

### 3.2 浮点精度陷阱(必懂)
\`\`\`python
0.1 + 0.2 == 0.3   # False！浮点二进制无法精确表示 0.1，相加产生误差
0.1 + 0.2          # 0.30000000000000004 —— 微小误差可视化
\`\`\`
原因:0.1 在二进制下是无限循环小数 \`0.0001100110011...\`,float 只能存有限位,产生微小误差。累积后会导致明显错误(尤其金融计算)。

**正确做法**:
- 比较用 \`math.isclose(a, b, rel_tol=1e-9)\`(相对误差容忍)
- 金融用 \`decimal.Decimal\`(十进制精确存储)
- 显示用 \`f"{x:.2f}"\` 格式化到 2 位小数

### 3.3 特殊浮点值
- \`float("inf")\` —— 正无穷大,比任何有限数都大
- \`float("-inf")\` —— 负无穷大
- \`float("nan")\` —— Not a Number,代表「非数值」(如 \`0/0\`、\`inf - inf\`)
  - **NaN 的怪异特性**:\`nan != nan\` 是 True!所以判断 NaN 要用 \`math.isnan(x)\`,不能用 \`x == float("nan")\`。

### 3.4 科学计数法
\`1e10\` = 10^10 = 10000000000.0
\`1.5e-3\` = 0.0015
\`e\` 不区分大小写(\`1E10\` 也行)。

## 四、complex 复数

\`3 + 4j\` 表示实部 3、虚部 4 的复数(j 而不是数学上的 i)。
- \`.real\` 取实部:\`(3+4j).real\` → 3.0
- \`.imag\` 取虚部:\`(3+4j).imag\` → 4.0
- \`abs(3+4j)\` → 5.0(模长,√(3²+4²))
- 用途:信号处理、电气工程、量子计算。日常开发很少用。

## 五、math 模块

math 模块提供 C 标准库的数学函数,都是基于 float 的(快但不精确)。

### 5.1 常量
- \`math.pi\` —— 圆周率 3.141592653589793
- \`math.e\` —— 自然常数 2.718281828459045
- \`math.tau\` —— 2π(3.12+)

### 5.2 常用函数
| 函数 | 作用 | 示例 |
|---|---|---|
| \`math.sqrt(x)\` | 平方根 | \`sqrt(2)\` → 1.414 |
| \`math.pow(x, y)\` | 幂(返回 float) | \`pow(2, 10)\` → 1024.0 |
| \`math.log(x, base)\` | 对数 | \`log(8, 2)\` → 3.0 |
| \`math.log10(x)\` | 常用对数 | \`log10(1000)\` → 3.0 |
| \`math.factorial(n)\` | 阶乘 | \`factorial(5)\` → 120 |
| \`math.ceil(x)\` | 向上取整 | \`ceil(3.2)\` → 4 |
| \`math.floor(x)\` | 向下取整 | \`floor(3.8)\` → 3 |
| \`math.trunc(x)\` | 截断(向零取整) | \`trunc(-3.7)\` → -3 |
| \`math.gcd(a, b)\` | 最大公约数 | \`gcd(12, 8)\` → 4 |
| \`math.sin/cos/tan\` | 三角函数(弧度) | \`sin(pi/2)\` → 1.0 |

**ceil/floor/trunc 的区别**(负数时尤其要注意):
- \`ceil(-3.2)\` → -3(向正无穷)
- \`floor(-3.2)\` → -4(向负无穷)
- \`trunc(-3.2)\` → -3(向零)

### 5.3 round() 的奇特行为
\`round()\` 是内置函数(不是 math 的),用「银行家舍入」(四舍六入五凑偶):
- \`round(2.5)\` → 2(不是 3!5 前是偶数 2,保持偶数)
- \`round(3.5)\` → 4(5 前是奇数 3,凑成偶数 4)
- \`round(0.5)\` → 0
这样设计是为了统计上减少累计误差,但和直觉不符。如果想要「四舍五入」,用 \`decimal.Decimal\` 配合 \`ROUND_HALF_UP\`。

## 六、decimal 模块(高精度十进制)

### 6.1 为什么需要 decimal
float 用二进制存小数,0.1 无法精确表示。decimal 用十进制存储,\`Decimal("0.1")\` 就是精确的 0.1。金融、货币计算必须用 decimal,否则几分钱的误差累积成大错。

### 6.2 用法
\`\`\`python
from decimal import Decimal
Decimal("0.1") + Decimal("0.2")   # Decimal("0.3")，十进制精确，无浮点误差
Decimal("0.1") + Decimal("0.2") == Decimal("0.3")   # True，可直接比较
\`\`\`
**注意**:**必须传字符串** \`Decimal("0.1")\`,不能传 float \`Decimal(0.1)\`。因为 \`0.1\` 这个 float 已经是不精确的 0.1000000000000000055...,传进去 decimal 也救不回来。

### 6.3 设置精度
\`\`\`python
from decimal import Decimal, getcontext
getcontext().prec = 50   # 设置全局有效数字位数 50 位
Decimal(1) / Decimal(7)  # 50 位精度的 1/7，结果完全精确
\`\`\`

## 七、代码逐行讲解

\`\`\`python
print(0.1 + 0.2)                     # 0.30000000000000004 —— 浮点误差
print(0.1 + 0.2 == 0.3)             # False —— 不能用 == 比较浮点
\`\`\`
浮点精度陷阱的经典演示。0.1 和 0.2 都不能精确表示,相加后产生微小误差。

\`\`\`python
print(math.isclose(0.1 + 0.2, 0.3)) # True，isclose 默认相对误差容忍 1e-9
\`\`\`
\`isclose\` 默认相对误差容忍 1e-9,0.3 和 0.30000000000000004 的差距远小于此,判定为相等。

\`\`\`python
print(0b101, 0o755, 0xFF)           # 5 493 255
# 0b 前缀二进制：1×4+0×2+1×1=5
# 0o 前缀八进制：7×64+5×8+5×1=493（Unix 文件权限 rwxr-xr-x）
# 0x 前缀十六进制：15×16+15=255
\`\`\`
- \`0b101\` = 1×4 + 0×2 + 1×1 = 5
- \`0o755\` = 7×64 + 5×8 + 5×1 = 493(Unix 文件权限 rwxr-xr-x)
- \`0xFF\` = 15×16 + 15 = 255

\`\`\`python
print(float("inf") > 10**100, math.isnan(float("nan")))
# float("inf") > 10**100 → True：正无穷大于任何有限数
# math.isnan(...) → True：必须用 math.isnan 判 NaN，nan != nan
\`\`\`
- \`float("inf")\` 是正无穷,比任何有限数都大,包括 10^100
- \`math.isnan\` 判断 NaN,不能用 \`== float("nan")\`(因为 nan != nan)

\`\`\`python
d = decimal.Decimal("0.1") + decimal.Decimal("0.2")
print(d, d == decimal.Decimal("0.3"))  # True，字符串构造，精确存储可比较
\`\`\`
decimal 用字符串构造,精确存储 0.1 和 0.2,相加得精确 0.3,比较结果 True。

## 八、易错点小结

| 易错 | 正确做法 |
|---|---|
| 浮点 \`==\` 比较 | \`math.isclose()\` 或 \`Decimal\` |
| 金融用 float | 用 \`Decimal("0.1")\`(字符串构造) |
| \`round(2.5)\` 期望 3 | 实际是 2(银行家舍入),用 \`Decimal\` |
| \`-7 // 2\` 期望 -3 | 实际是 -4(floor),用 \`int(-7/2)\` |
| 判 NaN 用 \`==\` | 用 \`math.isnan()\` |
| \`Decimal(0.1)\` | 改成 \`Decimal("0.1")\` |
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
## 一、字符串的本质

Python 的 \`str\` 是 **Unicode 字符序列**,不可变(immutable)。这意味着:
- 每次「修改」字符串(如 \`s.upper()\`)都会创建新对象,原字符串不变。
- 字符串是序列,支持索引、切片、遍历、\`len()\`。

### 1.1 Python 3 vs Python 2 的字符串
- Python 2 有 \`str\`(字节串)和 \`unicode\`(文本)两种,容易混淆。
- Python 3 统一了:\`str\` 就是 Unicode 文本,\`bytes\` 是字节序列。写 \`"你好"\` 直接就是 Unicode,不用加 \`u\` 前缀。

### 1.2 不可变带来的影响
\`\`\`python
s = "hello"
s[0] = "H"   # TypeError！str 不可变，不支持 item assignment
s = "H" + s[1:]   # 正确：用切片 + 拼接创建新字符串 "Hello"
\`\`\`
- **频繁拼接字符串**不要用 \`+\`(每次都创建新对象,O(n²)),用 \`"".join(list)\`(O(n))。
- 需要可变字符串用 \`io.StringIO\` 或转 list 再 join。

## 二、引号规则

| 写法 | 用途 | 示例 |
|---|---|---|
| \`'...'\` | 单引号 | \`'hello'\` |
| \`"..."\` | 双引号 | \`"hello"\`(和单引号完全等价) |
| \`'''...'''\` | 三引号 | 多行字符串、docstring |
| \`"""..."""\` | 三双引号 | 同上,docstring 惯例 |
| \`r"..."\` | 原始字符串 | \`r"\\n"\` 是两个字符 \\ 和 n,不是换行 |

### 2.1 单引号 vs 双引号
两者**完全等价**,选哪个看内容:字符串里有双引号就用单引号包,反之亦然。
- \`'He said "hi"'\` —— 字符串内含双引号,用单引号包,免转义
- \`"It's ok"\` —— 字符串内含单引号,用双引号包,免转义

### 2.2 三引号:多行字符串
\`\`\`python
s = """line1
line2
line3"""   # 三引号保留换行，常用于多行文本和 docstring
\`\`\`
三引号内的换行符会原样保留。常用于:
- **多行文本**(SQL、HTML 模板)
- **docstring**(函数/类/模块的文档,放第一行)

### 2.3 原始字符串 r"..."
\`r\` 前缀让反斜杠「不转义」:
- \`"\\n"\` 是一个换行符(1 个字符)
- \`r"\\n"\` 是两个字符 \\ 和 n

**主要用途**:正则表达式、Windows 路径、LaTeX。
\`\`\`python
import re
re.match(r"\\d+", "123")   # 正则用 r 前缀，避免 \\d 的双重转义
path = r"C:\\Users\\name"   # Windows 路径用 r，反斜杠不转义
\`\`\`
**注意**:原始字符串**不能以单个反斜杠结尾**(\`r"\\"\` 会报错),因为反斜杠会转义后面的引号。

## 三、f-string(格式化字符串,3.6+)

f-string 是 Python 3.6 引入的字符串格式化方式,**性能最好、可读性最强**,现在已是首选。

### 3.1 基本用法
\`\`\`python
name = "alice"
age = 30
f"Hello, {name}, you are {age}"   # 'Hello, alice, you are 30'，{...} 内求值后插入
\`\`\`
- \`f\` 前缀表示这是 f-string。
- \`{...}\` 内放任意 Python 表达式,会求值后插入。

### 3.2 表达式和函数调用
\`\`\`python
f"1+1 = {1+1}"                    # '1+1 = 2'，大括号内可放算术表达式
f"upper: {name.upper()}"          # 'upper: ALICE'，可调用方法
f"len: {len(name)}"               # 'len: 5'，可调用函数
\`\`\`
大括号内可以是任意表达式,包括函数调用、方法、算术运算。

### 3.3 格式说明符(冒号后)
\`{值:格式}\` 冒号后是格式说明符,控制对齐、宽度、精度、类型。

| 说明符 | 作用 | 示例 | 结果 |
|---|---|---|---|
| \`:.2f\` | 2 位小数 | \`f"{3.14159:.2f}"\` | '3.14' |
| \`:>10\` | 右对齐宽 10 | \`f"{42:>10}"\` | '        42' |
| \`:<10\` | 左对齐宽 10 | \`f"{42:<10}"\` | '42        ' |
| \`:^10\` | 居中宽 10 | \`f"{42:^10}"\` | '    42    ' |
| \`:05d\` | 补零到 5 位 | \`f"{42:05d}"\` | '00042' |
| \`:,\` | 千分位 | \`f"{1234567:,}"\` | '1,234,567' |
| \`:#x\` | 十六进制带前缀 | \`f"{255:#x}"\` | '0xff' |
| \`:e\` | 科学计数 | \`f"{1234567:e}"\` | '1.234567e+06' |
| \`:.2%\` | 百分比 | \`f"{0.85:.2%}"\` | '85.00%' |

### 3.4 调试语法 =(3.8+)
\`f"{x=}"\` 会输出 \`x=值\`,调试神器:
\`\`\`python
x = 42
f"{x=}"          # 'x=42'，3.8+ 调试语法，自动输出变量名=值
f"{x=:.2f}"      # 'x=42.00'，可加格式说明符
\`\`\`

### 3.5 转义和嵌套
- 大括号里要用大括号,写 \`{{\` 和 \`}}\`:\`f"{{not a var}}"\` → '{not a var}'
- **3.12 新特性**:f-string 可以嵌套相同引号(3.6-3.11 内层必须用不同引号):
  \`\`\`python
  f"dict: { {k: len(k) for k in ["a", "bc"]} }"   # 3.12+ 合法：内层可嵌套相同引号
  \`\`\`

### 3.6 其它格式化方式(了解即可)
- \`% \`(旧式):\`"%s is %d" % ("alice", 30)\` —— 类似 C 的 printf,已过时
- \`str.format()\`:\`"{} is {}".format("alice", 30)\` —— 3.0 引入,f-string 出现前的主力
- **现在优先用 f-string**,可读性和性能都最好。

## 四、切片(重要)

切片是 Python 序列的核心操作,语法 \`s[start:stop:step]\`,三个参数都可省略。

### 4.1 切片规则
- \`start\`:起始索引(含),默认 0
- \`stop\`:结束索引(**不含**),默认到末尾
- \`step\`:步长,默认 1;负数表示反向

\`\`\`python
s = "hello world"
s[0:5]     # 'hello'（0 到 4）
s[6:]      # 'world'（6 到末尾）
s[:5]      # 'hello'（开头到 4）
s[-5:]     # 'world'（倒数 5 个到末尾）
s[::-1]    # 'dlrow olleh'（反转！step=-1 从尾到头）
s[::2]     # 'hlowrd'（每隔一个取一个）
\`\`\`

### 4.2 负索引
\`s[-1]\` 是最后一个字符,\`s[-2]\` 是倒数第二个。负索引从 -1 开始(不是 0)。

### 4.3 切片不会越界报错
\`s[0:100]\` 不会报错,只取到字符串末尾。这是切片和索引的区别:\`s[100]\` 会 IndexError,但 \`s[0:100]\` 不会。

### 4.4 反转字符串的惯用法
\`s[::-1]\` —— step=-1 表示从尾到头,一步一个,得到反转字符串。比 \`reversed(s)\` 简洁。

## 五、常用字符串方法

### 5.1 大小写
| 方法 | 作用 |
|---|---|
| \`s.upper()\` | 全大写 |
| \`s.lower()\` | 全小写 |
| \`s.title()\` | 每个单词首字母大写 |
| \`s.capitalize()\` | 首字母大写,其余小写 |
| \`s.swapcase()\` | 大小写互换 |

### 5.2 查找
| 方法 | 作用 | 找不到 |
|---|---|---|
| \`s.find(sub)\` | 返回子串起始索引 | -1 |
| \`s.index(sub)\` | 同上 | **抛 ValueError** |
| \`s.count(sub)\` | 子串出现次数 | 0 |
| \`s.startswith(p)\` | 是否以 p 开头 | False |
| \`s.endswith(p)\` | 是否以 p 结尾 | False |

**find vs index**:功能一样,区别只在找不到时的行为。find 返回 -1(不报错),index 抛异常。不确定子串是否存在时用 find;确定存在时用 index(让异常帮你发现 bug)。

### 5.3 修改(返回新字符串)
| 方法 | 作用 |
|---|---|
| \`s.strip()\` | 去两端空白(另有 \`lstrip\`/\`rstrip\`) |
| \`s.replace(old, new)\` | 替换所有 old 为 new |
| \`s.split(sep)\` | 按 sep 分割成 list |
| \`sep.join(list)\` | 用 sep 把 list 拼成字符串 |

### 5.4 split 和 join(互逆操作)
\`\`\`python
"a,b,c".split(",")           # ['a', 'b', 'c']，按分隔符切成 list
"-".join(["2024", "01", "01"])  # '2024-01-01'，用 sep 拼接 list 为字符串
\`\`\`
- \`split\` 不传参时按任意空白分割(且去除空字符串):\`"  a  b  ".split()\` → \`['a', 'b']\`
- \`join\` 是**字符串方法**,\`"-".join(list)\` 不是 \`list.join("-")\`(list 没这个方法)

### 5.5 判断
| 方法 | 作用 |
|---|---|
| \`s.isalpha()\` | 是否全是字母 |
| \`s.isdigit()\` | 是否全是数字 |
| \`s.isalnum()\` | 字母或数字 |
| \`s.isspace()\` | 是否全是空白 |
| \`s.isupper()/islower()\` | 是否全大写/小写 |

## 六、代码逐行讲解

\`\`\`python
name, age = "alice", 30
print(f"name={name!r}, age={age}, next={age+1}")
# !r 用 repr() 格式化（字符串带引号），调试时能看出值类型
# age+1 是表达式，f-string 支持任意表达式
\`\`\`
- \`!r\` 表示用 \`repr()\` 而非 \`str()\` 格式化,字符串会带引号:\`name='alice'\`。调试时很有用,能看出值是字符串还是数字。
- \`age+1\` 是表达式,f-string 支持任意表达式。

\`\`\`python
print(f"hex={255:#x}, pi={3.14159:.2f}, pad={42:05d}")
# #x 输出带 0x 前缀的十六进制：0xff
# .2f 保留 2 位小数：3.14
# 05d 补零到 5 位：00042
\`\`\`
- \`#x\` 输出带 0x 前缀的十六进制:0xff
- \`.2f\` 保留 2 位小数:3.14
- \`05d\` 补零到 5 位:00042

\`\`\`python
s = "hello world"
print(s[0:5], s[6:], s[::-1])       # hello world dlrow olleh
# s[0:5] 索引 0-4：'hello'
# s[6:] 索引 6 到末尾：'world'
# s[::-1] step=-1 反转：'dlrow olleh'
\`\`\`
- \`s[0:5]\` 索引 0-4:'hello'
- \`s[6:]\` 索引 6 到末尾:'world'
- \`s[::-1]\` step=-1 反转:'dlrow olleh'

\`\`\`python
msg = "  Hello, World!  "
print(msg.strip(), msg.lower(), msg.upper())
# strip() 去掉两端空格：'Hello, World!'
# lower() 全小写：'hello, world!'
# upper() 全大写：'HELLO, WORLD!'
\`\`\`
- \`strip()\` 去掉两端空格:'Hello, World!'
- \`lower()\` 全小写:'hello, world!'
- \`upper()\` 全大写:'HELLO, WORLD!'

\`\`\`python
print("-".join(["2024", "01", "01"]))
# 用 "-" 把列表元素拼成字符串：'2024-01-01'
# 注意是 "-".join(list)，不是 list.join("-")
\`\`\`
用 "-" 把列表元素拼成字符串:'2024-01-01'。注意是 \`"-".join(list)\`,不是 \`list.join("-")\`。

\`\`\`python
d = {k: len(k) for k in ["a", "bc"]}
print("dict:", d)
# 字典推导式：遍历列表，以元素为 key、元素长度为 value，生成 {'a': 1, 'bc': 2}
\`\`\`
字典推导式(后续章节详讲),生成 \`{'a': 1, 'bc': 2}\`。这里演示 3.12 之前 f-string 嵌套相同引号的限制:不能直接写在 f-string 里,要先用变量存。

## 七、易错点小结

| 易错 | 正确做法 |
|---|---|
| \`s[0] = "H"\` | str 不可变,用 \`s = "H" + s[1:]\` |
| 频繁 \`s += x\` | 用 \`"".join(list)\` |
| \`list.join(sep)\` | 是 \`sep.join(list)\` |
| \`s.index(sub)\` 找不到报错 | 不确定时用 \`s.find(sub)\` |
| \`r"path\\"\` 报错 | 原始字符串不能以单 \\ 结尾 |
| f-string 嵌套相同引号(3.11-) | 用不同引号或先存变量 |
| Windows 路径 \`"C:\\\\Users"\` | 用 \`r"C:\\Users"\` |
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

# 3.12+ 支持 f-string 嵌套相同引号；3.9-3.11 需用不同引号或先计算
# print(f"dict: { {k: len(k) for k in ["a", "bc"]} }")  # 3.12+ 才合法
d = {k: len(k) for k in ["a", "bc"]}
print("dict:", d)
`,
  },
];