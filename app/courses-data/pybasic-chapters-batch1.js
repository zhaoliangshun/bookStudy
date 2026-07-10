// =============================================================
// Python 基础路径教程（pybasic）—— 第一批章节（环境搭建组，共 6 章）
// -------------------------------------------------------------
// 本教程对应"第一阶段：Python 基础（★★★★★ 必须）"学习路径，
// 是所有人的起点。本批为 "1.1 环境" 章节，包含以下章节：
//   1. py-interpreter — Python 解释器
//   2. py-pip         — pip 包管理器
//   3. py-venv        — venv 虚拟环境
//   4. py-uv          — uv 现代包管理
//   5. py-pyenv       — pyenv 多版本管理
//   6. py-conda-ide   — conda 与 IDE
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（本批为"环境搭建"）
//   content : Markdown 格式的详细讲解（含 shell 命令与原理）
//   code    : 可运行、带详细中文注释的 Python 示例代码
//
// 代码运行环境约束：
//   - 用 python3 直接运行，5 秒超时
//   - 仅使用 Python 标准库
//   - 通过 print 输出结果
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：Python 解释器
  // =========================================================
  {
    id: "py-interpreter",
    group: "环境搭建",
    icon: "🎛️",
    title: "Python 解释器",
    content: `## Python 解释器

**Python 解释器**是执行 Python 代码的核心程序。当你输入 \`python3 hello.py\` 时，是解释器读取你的源代码、把它转换成机器能理解的形式并逐条执行。理解解释器的工作原理，是成为一名合格 Python 程序员的起点——它解释了 Python 为什么"慢"、为什么有 \`.pyc\` 文件、为什么修改代码后立即生效。

### 解释器是什么

**解释器（Interpreter）** 是一种程序，它**逐行读取源代码、翻译并立即执行**，不需要事先把整个程序编译成机器码。这与 C/C++ 的**编译器（Compiler）** 形成对比：编译器把整个源代码一次性翻译成可执行的机器码（.exe / 二进制文件），之后直接运行机器码即可。

| 对比维度 | 解释器（Python） | 编译器（C/C++） |
| --- | --- | --- |
| **执行流程** | 源码 → 字节码 → 逐条解释执行 | 源码 → 机器码 → 直接执行 |
| **运行速度** | 较慢（每次运行都要解释） | 快（机器码直接执行） |
| **开发循环** | 改完即跑，无需编译 | 改完要重新编译才能运行 |
| **错误发现** | 运行到错误行才报错 | 编译阶段就能发现语法错误 |
| **跨平台** | 只要目标平台有解释器即可 | 需要为每个平台单独编译 |

**注意**：Python 并非纯粹的"解释型语言"。它有一个**编译步骤**——把源码编译成**字节码**（bytecode），只是这个编译对用户透明。所以更准确的说法是：Python 是"**先编译为字节码，再由虚拟机解释执行**"的语言。

### CPython：官方解释器

Python 语言有**规范**（语言语法和语义的定义）和**多种实现**。最主流、官方的实现叫 **CPython**，因为它用 **C 语言**编写。当你从 [python.org](https://www.python.org) 下载安装 Python 时，得到的就是 CPython。

平时说"Python 解释器"通常就是指 CPython。本教程所有代码都在 CPython 上运行。

#### 其他 Python 实现

除了 CPython，还有一些其他实现，各有特色：

| 实现 | 编写语言 | 特点 | 适用场景 |
| --- | --- | --- | --- |
| **CPython** | C | 官方实现，最稳定，生态最全 | 通用，绝大多数项目 |
| **PyPy** | RPython | 带 JIT 编译器，运行速度快 4-5 倍 | 性能敏感的纯 Python 代码 |
| **Jython** | Java | 运行在 JVM 上，能与 Java 互操作 | 需要 Java 生态集成的场景 |
| **IronPython** | C# | 运行在 .NET 上，能与 C# 互操作 | 需要 .NET 生态集成的场景 |
| **MicroPython** | C | 为微控制器优化的精简版 | 嵌入式、物联网设备 |
| **GraalPy** | Java | Oracle 出品，运行在 GraalVM 上 | 多语言混合运行时 |

**为什么 CPython 是主流？** 因为几乎所有第三方库（NumPy、Pandas、Django 等）都是针对 CPython 开发的，很多还包含 C 扩展。PyPy 虽然快，但对 C 扩展的兼容性不够好，很多科学计算库无法在 PyPy 上运行。

### Python 的执行原理

当你运行 \`python3 hello.py\` 时，CPython 会经历以下四个阶段：

\`\`\`
源代码 .py  →  词法分析  →  语法分析(AST)  →  编译  →  字节码 .pyc  →  PVM 执行
\`\`\`

#### 阶段 1：词法分析（Lexing / Tokenizing）

解释器把源代码字符串分解成一个个**词法单元（Token）**。Token 是最小的、不可再分的语法单元，如关键字、标识符、运算符、字面量等。

例如 \`x = 42 + 1\` 会被分解为：
- \`x\` → NAME 标识符
- \`=\` → ASSIGN 赋值运算符
- \`42\` → NUMBER 整数字面量
- \`+\` → OP 加号运算符
- \`1\` → NUMBER 整数字面量

#### 阶段 2：语法分析（Parsing）

把 Token 序列组织成**抽象语法树（AST，Abstract Syntax Tree）**。AST 是代码结构的树形表示，同时检查语法是否正确。如果语法有错（如缩进错误、括号不匹配），这一步就会报 \`SyntaxError\`。

#### 阶段 3：编译为字节码（Compilation）

把 AST 编译成 **Python 字节码（Bytecode）**。字节码是平台无关的中间代码，每条指令对应虚拟机的一个操作。字节码会被缓存到 \`.pyc\` 文件中（存放在源文件旁边的 \`__pycache__\` 目录下）。如果源文件没修改（通过比较时间戳和文件内容），下次运行直接用缓存的 \`.pyc\`，跳过编译步骤，加快启动速度。

#### 阶段 4：解释执行（Execution）

**Python 虚拟机（PVM，Python Virtual Machine）** 逐条解释执行字节码。PVM 是一个巨大的循环，不断读取字节码指令并执行对应的操作。

#### 用 dis 模块查看字节码

Python 标准库的 \`dis\` 模块可以反汇编字节码，让你直观看到 Python 内部如何执行代码：

\`\`\`python
import dis                         # 导入反汇编模块

def add(a, b):                     # 定义一个简单函数
    return a + b

dis.dis(add)                       # 反汇编并打印字节码指令
# 输出示例：
#   2           0 LOAD_FAST            0 (a)
#               2 LOAD_FAST            1 (b)
#               4 BINARY_ADD
#               6 RETURN_VALUE
\`\`\`

### REPL：交互式解释器

**REPL**（Read-Eval-Print Loop，读取-求值-输出循环）是 Python 的交互式解释器。在终端输入 \`python3\` 即可进入：

\`\`\`bash
$ python3                          # 启动 REPL
Python 3.12.0 (main, Oct  2 2023, 10:00:00)
[Clang 15.0.0] on darwin
Type "help", "copyright", "credits" or "license" for more information.
>>> 2 + 3                          # 输入表达式，立即求值
5                                  # 输出结果
>>> name = "Python"                # 定义变量
>>> print(f"Hello, {name}!")       # 调用函数
Hello, Python!
>>> exit()                         # 退出 REPL（或 Ctrl+D）
\`\`\`

#### REPL 的核心用途

- **快速实验**：验证一行代码的效果，不需要创建文件
- **学习探索**：随时查看函数文档（\`help(print)\`）、测试语法
- **调试**：在交互环境中逐步执行代码、检查变量

#### REPL 常用技巧

| 操作 | 作用 |
| --- | --- |
| \`dir(obj)\` | 查看对象的所有属性和方法 |
| \`help(func)\` | 查看函数文档 |
| \`_\` | 引用上一个表达式的结果 |
| 上下方向键 | 浏览历史命令 |
| \`exit()\` 或 \`Ctrl+D\` | 退出 REPL |
| \`Ctrl+L\` | 清屏 |
| Tab 键（配合 readline） | 自动补全 |

#### IPython：增强版 REPL

标准 REPL 功能有限，推荐安装 **IPython**（Interactive Python）：

\`\`\`bash
pip install ipython               # 安装 IPython
ipython                           # 启动 IPython
\`\`\`

IPython 提供了语法高亮、自动补全、魔术命令（\`%timeit\`、\`%run\` 等）、更好的历史记录和对象内省功能，是数据科学和日常开发的利器。

### 运行 Python 代码的多种方式

#### 方式 1：脚本文件（最常用）

创建 \`hello.py\` 文件，用 \`python3\` 运行：

\`\`\`bash
# 创建文件 hello.py
echo 'print("Hello, World!")' > hello.py

# 运行脚本
python3 hello.py
# 输出: Hello, World!
\`\`\`

#### 方式 2：-c 选项（执行一行代码）

\`\`\`bash
python3 -c "print('Hello, World!')"
python3 -c "import sys; print(sys.version)"
\`\`\`

#### 方式 3：-m 选项（以模块方式运行）

\`\`\`bash
# 运行标准库模块
python3 -m http.server 8000        # 启动一个简易 HTTP 服务器
python3 -m json.tool data.json     # 格式化 JSON 文件
python3 -m venv myenv              # 创建虚拟环境
python3 -m pip install requests    # 用 pip 安装包
\`\`\`

\`-m\` 的意义：让 Python 把后面的名字当作**模块**查找（在 \`sys.path\` 中搜索），而非文件路径。这样可以直接运行标准库或已安装的包中的模块。

#### 方式 4：REPL 交互式

\`\`\`bash
python3                            # 进入 REPL
\`\`\`

#### 方式 5：shebang 直接执行（Linux/macOS）

在脚本第一行加 shebang，赋予执行权限后可直接运行：

\`\`\`bash
#!/usr/bin/env python3             # shebang 行，告诉系统用 python3 执行
print("Hello, World!")
\`\`\`

\`\`\`bash
chmod +x hello.py                  # 赋予执行权限
./hello.py                         # 直接运行（无需写 python3）
\`\`\`

### python vs python3

在 Windows 上 \`python\` 通常指向 Python 3。但在 macOS 和 Linux 上，系统自带的 \`python\` 可能指向 Python 2（已停止维护）。**推荐始终使用 \`python3\`** 来明确指定版本，避免歧义。

如果想让 \`python\` 指向 Python 3，可以配置别名：

\`\`\`bash
# 在 ~/.bashrc 或 ~/.zshrc 中添加
alias python=python3
alias pip=pip3
\`\`\`

### sys 模块：解释器的窗口

Python 的 \`sys\` 模块提供了与解释器交互的接口，是了解当前运行环境的重要窗口：

\`\`\`python
import sys

print(sys.executable)        # 解释器的可执行文件路径
print(sys.version)           # Python 版本信息
print(sys.platform)          # 操作系统平台（darwin/linux/win32）
print(sys.path)              # 模块搜索路径列表
print(sys.argv)              # 命令行参数列表
\`\`\`

### 字节码缓存：__pycache__

当你导入一个模块时，Python 会把编译后的字节码保存到 \`__pycache__\` 目录下的 \`.pyc\` 文件中。文件名格式为 \`模块名.cpython-版本号.pyc\`，如 \`my_module.cpython-312.pyc\`。

\`\`\`bash
# 查看字节码缓存
ls __pycache__/
# my_module.cpython-312.pyc  utils.cpython-312.pyc
\`\`\`

**缓存的好处**：下次导入同一模块时，如果源文件没修改，直接加载 \`.pyc\`，跳过编译步骤，加快启动速度。

**何时重新编译**：Python 通过比较源文件（\`.py\`）和缓存文件（\`.pyc\`）的**修改时间戳和文件大小**判断是否需要重新编译。

**注意**：\`.pyc\` 文件可以安全删除，Python 会在下次运行时自动重新生成。一般把 \`__pycache__\` 加入 \`.gitignore\`。

### 本节代码演示

下面这段代码用 Python 标准库来探索解释器的内部：查看版本与平台信息、用 \`dis\` 反汇编字节码、查看 \`sys.path\` 模块搜索路径、用 \`compile\` 函数手动编译代码。运行后你会对"解释器如何工作"有更直观的理解。`,
    code: `# ============================================================
# 第一章代码演示：Python 解释器内部探秘
# ============================================================
# 本代码用标准库探索解释器的工作原理：
#   - 解释器版本与平台信息
#   - 字节码反汇编（dis 模块）
#   - 模块搜索路径（sys.path）
#   - 手动编译源码（compile 函数）
#   - 命令行参数（sys.argv）

import sys
import dis
import os

# ---- 1. 解释器基本信息 ----
print("========== 1. 解释器基本信息 ==========")
print("解释器路径:", sys.executable)         # 当前解释器的可执行文件路径
print("Python 版本:", sys.version)           # 完整版本信息字符串
print("版本号:", sys.version_info)           # 结构化版本信息
print("操作系统平台:", sys.platform)         # darwin=macOS, linux=Linux, win32=Windows
print("字节序:", sys.byteorder)              # little=小端, big=大端
print("最大整数:", sys.maxsize)              # 系统指针能表示的最大整数

# ---- 2. 模块搜索路径 sys.path ----
print("\\n========== 2. 模块搜索路径 sys.path ==========")
print("Python 查找模块的路径列表:")
for i, path in enumerate(sys.path):
    print(f"  [{i}] {path}")

# 解释：sys.path 决定了 import 语句去哪里找模块
# 通常包含：当前目录、标准库目录、site-packages（第三方包）等

# ---- 3. 字节码反汇编：用 dis 查看解释器如何执行 ----
print("\\n========== 3. 字节码反汇编 ==========")

# 定义一个简单函数，看看它对应的字节码
def greet(name):
    """问候函数"""
    message = "Hello, " + name
    return message

print("函数 greet 的字节码指令:")
print("-" * 50)
dis.dis(greet)
print("-" * 50)
# 解释每条指令：
#   LOAD_FAST  : 加载局部变量到栈顶
#   LOAD_CONST : 加载常量（如字符串字面量）到栈顶
#   BINARY_ADD : 弹出栈顶两个值相加，结果压栈
#   STORE_FAST : 把栈顶值存到局部变量
#   RETURN_VALUE: 返回栈顶值

# ---- 4. 查看常量和变量名 ----
print("\\n========== 4. 函数内部结构 ==========")
print("greet 函数的常量:", greet.__code__.co_consts)
print("greet 函数的变量名:", greet.__code__.co_varnames)
print("greet 函数的参数数:", greet.__code__.co_argcount)
print("greet 函数文档:", greet.__doc__)

# ---- 5. compile() 函数：手动编译源码 ----
print("\\n========== 5. compile() 手动编译 ==========")
# compile() 把源码字符串编译成代码对象（code object）
source_code = """
x = 10
y = 20
result = x + y
print(f"编译执行结果: {x} + {y} = {result}")
"""

# 编译源码为代码对象
code_obj = compile(source_code, "<string>", "exec")
print("编译后的代码对象:", code_obj)
print("代码对象类型:", type(code_obj).__name__)

# 执行编译后的代码对象
print("执行编译后的代码:")
exec(code_obj)

# ---- 6. eval() vs exec() ----
print("\\n========== 6. eval() vs exec() ==========")
# eval：求值表达式，返回结果
result = eval("3 ** 4 + 2")
print(f"eval('3 ** 4 + 2') = {result}")

# exec：执行语句（无返回值）
exec("z = 100")
print(f"exec('z = 100') 后, z = {z}")

# ---- 7. 查看已加载的模块 ----
print("\\n========== 7. 已加载的模块（前 15 个）=========")
loaded_modules = list(sys.modules.keys())  # sys.modules 是已加载模块的字典
print(f"当前已加载 {len(loaded_modules)} 个模块，前 15 个:")
for mod in sorted(loaded_modules)[:15]:
    print(f"  - {mod}")

# ---- 8. 递归深度限制 ----
print("\\n========== 8. 递归深度限制 ==========")
print(f"当前递归深度限制: {sys.getrecursionlimit()}")  # 默认 1000
# sys.setrecursionlimit(2000)  # 可以修改，但不建议设太大，可能崩溃

# ---- 9. 命令行参数 ----
print("\\n========== 9. 命令行参数 sys.argv ==========")
print(f"sys.argv = {sys.argv}")
print(f"脚本名: {sys.argv[0]}")
print(f"参数个数: {len(sys.argv) - 1}")

# ---- 10. 模拟解释器的执行流程 ----
print("\\n========== 10. 模拟解释器执行流程 ==========")
print("Python 代码执行的四个阶段:")
print("  1. 词法分析（Lexing）: 源码 → Token 序列")
print("  2. 语法分析（Parsing）: Token → AST 抽象语法树")
print("  3. 编译（Compilation）: AST → 字节码")
print("  4. 执行（Execution）: PVM 逐条执行字节码")

# 用 compile 演示前三个阶段
source = "a = 1 + 2"
print(f"\\n源代码: {source!r}")

# 阶段 2-3：compile 内部完成词法分析、语法分析和编译
code = compile(source, "<demo>", "exec")
print(f"编译后字节码指令数: {len(code.co_code)}")
print("字节码指令:")
dis.dis(code)

# 阶段 4：执行
print("执行字节码...")
exec(code)
print(f"执行后 a = {a}")

print("\\n以上就是 Python 解释器的核心工作原理！")
print("理解它有助于你明白：为什么 Python 慢、.pyc 是什么、")
print("为什么修改代码后立即生效、为什么有 GIL。")
`,
  },

  // =========================================================
  // 第二章：pip 包管理器
  // =========================================================
  {
    id: "py-pip",
    group: "环境搭建",
    icon: "📦",
    title: "pip 包管理器",
    content: `## pip 包管理器

**pip** 是 Python 的官方包管理器，用于从 **PyPI**（Python Package Index）安装和管理第三方包。几乎每个 Python 程序员每天都在用 pip。掌握 pip 是使用 Python 生态的必备技能——Python 之所以强大，很大程度上归功于 PyPI 上超过 50 万个可安装的第三方包。

### PyPI：Python 包仓库

**PyPI**（Python Package Index，[pypi.org](https://pypi.org)）是 Python 官方的第三方包仓库，目前托管了超过 **50 万个**包。任何人都可以免费上传自己的包到 PyPI，供全世界使用。

当你执行 \`pip install requests\` 时，pip 会：
1. 连接到 PyPI 服务器
2. 搜索名为 \`requests\` 的包
3. 下载对应版本的安装包（通常是 \`.whl\` 或 \`.tar.gz\` 格式）
4. 解压并安装到当前 Python 环境的 \`site-packages\` 目录
5. 处理依赖关系（自动安装该包依赖的其他包）

### pip 的基本命令

#### 安装包

\`\`\`bash
# 安装最新版本
pip install requests                    # 安装 requests 包的最新版

# 安装指定版本
pip install requests==2.31.0            # 安装指定版本 2.31.0
pip install "requests>=2.25,<3.0"       # 安装版本范围（>=2.25 且 <3.0）

# 升级已安装的包
pip install --upgrade requests          # 升级到最新版（简写 -U）
pip install -U requests

# 从 GitHub 安装（开发版）
pip install git+https://github.com/psf/requests.git

# 安装本地包
pip install ./my-package/               # 安装本地目录
pip install my-package-1.0.tar.gz       # 安装本地压缩包
\`\`\`

#### 卸载包

\`\`\`bash
pip uninstall requests                  # 卸载 requests（会询问确认）
pip uninstall -y requests               # -y 跳过确认直接卸载
\`\`\`

#### 查看已安装的包

\`\`\`bash
pip list                                # 列出所有已安装的包
pip list --outdated                     # 列出有新版本可升级的包
pip show requests                       # 查看某个包的详细信息
pip show -f requests                    # 显示详细信息+所有文件列表
\`\`\`

\`pip show\` 的输出示例：

\`\`\`
Name: requests
Version: 2.31.0
Summary: Python HTTP for Humans.
Home-page: https://requests.readthedocs.io
Author: Kenneth Reitz
Location: /usr/local/lib/python3.12/site-packages
Requires: charset-normalizer, idna, urllib3, certifi
Required-by: myapp
\`\`\`

#### 搜索包

\`\`\`bash
# pip search 命令已因负载问题被官方关闭
# 推荐直接在浏览器访问 https://pypi.org 搜索
\`\`\`

### requirements.txt：依赖清单

**requirements.txt** 是 Python 项目的依赖声明文件，列出了项目需要的所有第三方包及版本。这是 Python 项目的事实标准，相当于 Node.js 的 \`package.json\` 或 Java 的 \`pom.xml\`。

#### 基本格式

\`\`\`txt
# requirements.txt
requests==2.31.0          # 精确版本
flask>=2.0,<3.0           # 版本范围
numpy                     # 不限制版本（安装最新）
python-dotenv             # 注释写在后面
\`\`\`

#### 从 requirements.txt 安装

\`\`\`bash
pip install -r requirements.txt         # 安装文件中列出的所有包
\`\`\`

#### 生成 requirements.txt

\`\`\`bash
# 导出当前环境所有已安装的包（含版本号）
pip freeze > requirements.txt

# pip freeze 输出格式：
# requests==2.31.0
# numpy==1.24.0
# flask==2.3.0
\`\`\`

**注意**：\`pip freeze\` 会导出当前环境的**所有**包，包括你不需要的间接依赖。更好的做法是手动维护 \`requirements.txt\`，只列出项目直接依赖的包。

### 版本号规则

Python 包的版本号遵循 **PEP 440** 规范，通常采用 \`主版本.次版本.修订号\` 格式：

| 版本号 | 含义 | 示例 |
| --- | --- | --- |
| \`==2.31.0\` | 精确版本 | 必须是 2.31.0 |
| \`>=2.0\` | 最低版本 | 2.0 及以上 |
| \`<=3.0\` | 最高版本 | 3.0 及以下 |
| \`>2.0,<3.0\` | 版本范围 | 2.0 到 3.0 之间（不含 3.0） |
| \`~=2.31.0\` | 兼容版本 | >=2.31.0 且 <2.32.0（同一次版本） |
| \`~=2.31\` | 兼容版本 | >=2.31 且 <3.0（同一主版本） |
| \`!=2.0.0\` | 排除版本 | 不能是 2.0.0 |

#### 语义化版本（Semantic Versioning）

| 版本变化 | 含义 | 兼容性 |
| --- | --- | --- |
| 1.0.0 → 2.0.0 | 主版本升级 | **可能不兼容**，API 有破坏性变更 |
| 1.0.0 → 1.1.0 | 次版本升级 | 向下兼容，新增功能 |
| 1.0.0 → 1.0.1 | 修订版本 | 向下兼容，修复 bug |

### pip 配置

#### 配置文件位置

pip 的配置可以放在以下文件中（按优先级从高到低）：

| 平台 | 配置文件路径 |
| --- | --- |
| **Windows** | \`%APPDATA%\\\\pip\\\\pip.ini\` |
| **macOS/Linux** | \`~/.config/pip/pip.conf\` 或 \`~/.pip/pip.conf\` |
| **虚拟环境内** | \`<venv>/pip.conf\` |
| **全局** | \`/etc/pip.conf\` |

#### 配置示例

\`\`\`ini
# pip.conf 示例
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple    # 使用清华镜像源
trusted-host = pypi.tuna.tsinghua.edu.cn                  # 信任的镜像主机
timeout = 120                                            # 超时时间（秒）

[install]
no-cache-dir = false                                     # 是否禁用缓存
\`\`\`

#### 使用国内镜像源加速

国内访问 PyPI 官方源较慢，推荐配置国内镜像：

\`\`\`bash
# 临时使用镜像（单次安装）
pip install requests -i https://pypi.tuna.tsinghua.edu.cn/simple

# 永久设置镜像源
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple

# 常用国内镜像源
# 清华:    https://pypi.tuna.tsinghua.edu.cn/simple
# 阿里云:  https://mirrors.aliyun.com/pypi/simple/
# 中科大:  https://pypi.mirrors.ustc.edu.cn/simple/
# 腾讯云:  https://mirrors.cloud.tencent.com/pypi/simple
\`\`\`

### pip 的高级用法

#### 下载包但不安装

\`\`\`bash
pip download requests                   # 下载到当前目录
pip download -d ./packages requests     # 下载到指定目录
pip download -r requirements.txt -d ./packages  # 下载所有依赖
\`\`\`

这在离线环境非常有用：先在有网的环境下载所有包，再拷贝到离线环境安装。

#### 离线安装

\`\`\`bash
pip install --no-index --find-links=./packages requests
# --no-index: 不访问 PyPI
# --find-links: 从本地目录查找包
\`\`\`

#### 只安装不依赖

\`\`\`bash
pip install --no-deps requests          # 不安装依赖（慎用，可能导致包无法运行）
\`\`\`

#### 查看包的依赖树

\`\`\`bash
# pip 自带不支持依赖树，需要安装额外工具
pip install pipdeptree
pipdeptree                              # 查看所有包的依赖树
pipdeptree -p requests                  # 只看 requests 的依赖
\`\`\`

### pip 常见问题与解决

#### 问题 1：pip: command not found

\`\`\`bash
# 方式 1：用 python -m 确保 pip
python3 -m pip --version                # 推荐：通过 python 调用 pip

# 方式 2：安装 pip
# Ubuntu/Debian
sudo apt install python3-pip

# macOS
brew install python3                    # Homebrew 安装的 Python 自带 pip

# 方式 3：用 ensurepip
python3 -m ensurepip --upgrade
\`\`\`

#### 问题 2：Permission denied（权限不足）

不要用 \`sudo pip install\`！这会污染系统 Python 环境，可能导致系统工具损坏。正确做法是使用**虚拟环境**（见下一章）。

\`\`\`bash
# ❌ 错误：不要这样
sudo pip install requests

# ✅ 正确：用虚拟环境
python3 -m venv myenv
source myenv/bin/activate
pip install requests
\`\`\`

#### 问题 3：版本冲突

\`\`\`bash
# 查看哪个包依赖了冲突的版本
pip show package-name                   # 看 Required-by 字段

# 用 pipdeptree 查看依赖关系
pipdeptree --warn fail
\`\`\`

### pip vs pip3

与 \`python\` / \`python3\` 类似，\`pip\` 在某些系统上可能指向 Python 2 的 pip。**推荐始终使用 \`pip3\` 或 \`python3 -m pip\`**。

\`\`\`bash
pip3 install requests                   # 明确用 Python 3 的 pip
python3 -m pip install requests         # 更明确：通过 python3 调用 pip（推荐）
\`\`\`

**为什么推荐 \`python3 -m pip\`？** 因为这样可以 100% 确保安装到当前使用的 Python 环境中，避免 \`pip\` 指向其他 Python 版本导致的"安装了却导入不了"问题。

### 现代 Python 包管理的发展

虽然 pip 仍然是标准，但它的速度和体验已不能满足现代需求。新的工具正在崛起：

| 工具 | 特点 |
| --- | --- |
| **uv** | Rust 编写，速度比 pip 快 10-100 倍，集成了 venv + pip 功能 |
| **poetry** | 现代项目管理，类似 npm/cargo，含依赖解析和打包发布 |
| **pdm** | PEP 标准的现代化包管理器 |
| **pip-tools** | pip 的增强，生成精确的锁文件 |

这些工具将在后续章节介绍。

### 本节代码演示

下面这段代码用 Python 标准库来探索当前环境中已安装的包信息：用 \`importlib.metadata\` 列出已安装的包及其版本、查看某个包的元数据、模拟 \`pip list\` 的功能。运行后你会理解 pip 安装的包都存在哪里、如何用代码查询它们。`,
    code: `# ============================================================
# 第二章代码演示：用代码探索已安装的包
# ============================================================
# 本代码用标准库 importlib.metadata（Python 3.8+）来
# 模拟 pip 的部分功能：列出已安装包、查看元数据、查看依赖关系
# 这有助于理解 pip 安装包后，包的信息存储在哪里

import sys
import importlib.metadata as metadata

# ---- 1. 列出所有已安装的包（模拟 pip list）----
print("========== 1. 已安装的包（模拟 pip list）==========")
# importlib.metadata.distributions() 返回所有已安装的发行版
all_dists = list(metadata.distributions())
print(f"当前环境共安装了 {len(all_dists)} 个包\\n")

# 取前 20 个按名称排序展示
sorted_dists = sorted(all_dists, key=lambda d: d.metadata.get("Name", "").lower())
print(f"{'包名':<30} {'版本':<15}")
print("-" * 50)
for dist in sorted_dists[:20]:
    name = dist.metadata.get("Name", "未知")
    version = dist.version
    print(f"{name:<30} {version:<15}")
if len(sorted_dists) > 20:
    print(f"... 还有 {len(sorted_dists) - 20} 个包未显示")

# ---- 2. 查看某个包的详细元数据（模拟 pip show）----
print("\\n========== 2. 包的详细元数据（模拟 pip show）==========")
# 尝试查看一些标准库附近一定存在的包
# Python 3.12+ 自带 pip，所以 pip 一定存在
try:
    pip_info = metadata.metadata("pip")
    print("pip 包的元数据:")
    print(f"  Name:        {pip_info['Name']}")
    print(f"  Version:     {pip_info['Version']}")
    print(f"  Summary:     {pip_info['Summary']}")
    print(f"  Author:      {pip_info['Author']}")
    print(f"  Home-page:   {pip_info['Home-page']}")
    print(f"  License:     {pip_info['License']}")
    print(f"  Requires-Python: {pip_info['Requires-Python']}")
except metadata.PackageNotFoundError:
    print("  pip 包未找到")

# ---- 3. 查看包的安装位置 ----
print("\\n========== 3. 包的安装位置 ==========")
# site-packages 目录：第三方包安装的位置
import site
print("site-packages 目录（第三方包存放位置）:")
for path in site.getsitepackages():
    print(f"  {path}")
print(f"用户级 site-packages: {site.getusersitepackages()}")

# ---- 4. 查看包的文件列表 ----
print("\\n========== 4. 包包含的文件（模拟 pip show -f）==========")
try:
    pip_files = metadata.files("pip")
    if pip_files:
        print(f"pip 包包含 {len(pip_files)} 个文件，前 10 个:")
        for f in pip_files[:10]:
            print(f"  {f}")
except metadata.PackageNotFoundError:
    print("  pip 包未找到")

# ---- 5. 查看包的依赖关系 ----
print("\\n========== 5. 包的依赖关系 ==========")
# 查看某个包需要哪些依赖
def show_dependencies(package_name):
    """显示某个包的依赖"""
    try:
        requires = metadata.requires(package_name)
        if requires:
            print(f"{package_name} 的依赖:")
            for req in requires:
                print(f"  - {req}")
        else:
            print(f"{package_name} 没有外部依赖")
    except metadata.PackageNotFoundError:
        print(f"  {package_name} 未安装")

# 查看 pip 的依赖（通常很少）
show_dependencies("pip")

# ---- 6. 查看哪些包依赖了某个包（反向依赖）----
print("\\n========== 6. 反向依赖（谁依赖了某包）==========")
def show_reverse_dependencies(target_package):
    """查找哪些已安装的包依赖了 target_package"""
    dependents = []
    for dist in metadata.distributions():
        requires = dist.requires
        if requires:
            for req in requires:
                # 提取依赖包名（去掉版本约束和 extras）
                req_name = req.split(";")[0].split("[")[0].strip()
                # 去掉版本运算符
                for sep in ["==", ">=", "<=", "!=", "~=", ">", "<"]:
                    if sep in req_name:
                        req_name = req_name.split(sep)[0].strip()
                        break
                if req_name.lower() == target_package.lower():
                    dependents.append(dist.metadata.get("Name", "未知"))
    return dependents

# 查找谁依赖了 pip
deps = show_reverse_dependencies("pip")
if deps:
    print(f"以下包依赖了 pip: {deps}")
else:
    print("没有已安装的包依赖 pip")

# ---- 7. 模拟 pip freeze ----
print("\\n========== 7. 模拟 pip freeze ==========")
print("# 以下为模拟 pip freeze 的输出（前 15 个）:")
for dist in sorted_dists[:15]:
    name = dist.metadata.get("Name", "未知")
    version = dist.version
    print(f"{name}=={version}")

# ---- 8. Python 的 import 机制 ----
print("\\n========== 8. Python import 机制 ==========")
print("当 import 一个包时，Python 会按以下顺序查找:")
print("  1. sys.modules 缓存（已加载的模块）")
print("  2. 内置模块（如 sys, os）")
print("  3. sys.path 中的路径:")
for i, path in enumerate(sys.path):
    print(f"     [{i}] {path}")

# ---- 9. 验证 import 查找 ----
print("\\n========== 9. 验证 import 查找位置 ==========")
# 用 importlib.util.find_spec 查看模块在哪里
import importlib.util

modules_to_check = ["os", "sys", "json", "pip", "collections"]
for mod_name in modules_to_check:
    spec = importlib.util.find_spec(mod_name)
    if spec:
        origin = spec.origin or "内置"
        print(f"  {mod_name:<15} -> {origin}")
    else:
        print(f"  {mod_name:<15} -> 未找到")

print("\\n以上就是 pip 包管理的核心知识！")
print("理解 site-packages 和 import 机制，")
print("你就明白了为什么虚拟环境能隔离不同项目的依赖。")
`,
  },

  // =========================================================
  // 第三章：venv 虚拟环境
  // =========================================================
  {
    id: "py-venv",
    group: "环境搭建",
    icon: "🔒",
    title: "venv 虚拟环境",
    content: `## venv 虚拟环境

**虚拟环境（Virtual Environment）** 是 Python 项目隔离依赖的**核心机制**。它为每个项目创建一个独立的 Python 运行环境，让不同项目可以使用不同版本的第三方包，互不干扰。**不会用虚拟环境是新手最常犯的错误之一**——它会导致"在我电脑上能跑"的经典问题。

### 为什么需要虚拟环境

#### 没有虚拟环境的灾难

假设你电脑上只有一个全局 Python 环境：

\`\`\`
项目 A 需要 requests 2.20（兼容老 API）
项目 B 需要 requests 2.31（用新特性）
\`\`\`

如果你直接 \`pip install requests\`：
- 先装了 2.20 → 项目 A 能跑，项目 B 报错
- 升级到 2.31 → 项目 B 能跑了，项目 A 又报错

**永远无法同时满足两个项目**。这就是为什么需要虚拟环境——为每个项目创建独立的包安装空间。

#### 虚拟环境的作用

| 问题 | 没有虚拟环境 | 有虚拟环境 |
| --- | --- | --- |
| 版本冲突 | 项目 A/B 不能同时用不同版本的包 | 各自独立，互不影响 |
| 权限问题 | 装包需要 \`sudo\`，污染系统 | 用户级安装，无需 sudo |
| 可重现性 | 不知道项目依赖哪些包 | 每个项目有 requirements.txt |
| 清理 | 卸载包残留一堆依赖 | 删除虚拟环境目录即可清理干净 |
| 部署 | 服务器环境与开发不一致 | 用同样的 requirements.txt 部署 |

### venv：标准库的虚拟环境工具

**venv** 是 Python 3.3+ 自带的虚拟环境模块，**无需额外安装**。它从系统 Python 创建一个轻量级的副本（实际是软链接 + 独立的 site-packages 目录）。

#### 创建虚拟环境

\`\`\`bash
# 基本语法
python3 -m venv <目录名>

# 示例：在项目目录下创建 .venv 虚拟环境
python3 -m venv .venv

# 指定 Python 版本（需要系统已安装该版本）
python3.12 -m venv .venv          # 用 Python 3.12 创建
python3.11 -m venv .venv          # 用 Python 3.11 创建
\`\`\`

**推荐命名**：用 \`.venv\`（带点的隐藏目录）作为虚拟环境名，这是社区约定俗成的标准。其他常见命名还有 \`venv\`、\`env\`、\`.env\`。

#### venv 的目录结构

创建后，\`.venv\` 目录包含：

\`\`\`
.venv/
├── bin/                  # macOS/Linux 的可执行文件
│   ├── python            # Python 解释器（软链接到系统 Python）
│   ├── python3           # python 的别名
│   ├── pip               # pip 命令
│   ├── activate          # 激活脚本
│   └── ...
├── Scripts/              # Windows 的可执行文件
│   ├── python.exe
│   ├── pip.exe
│   ├── activate.bat
│   └── ...
├── lib/
│   └── python3.12/
│       └── site-packages/   # 第三方包安装在这里（独立的！）
├── include/              # C 头文件（编译 C 扩展用）
├── pyvenv.cfg            # 虚拟环境配置文件
└── share/
\`\`\`

**pyvenv.cfg 文件**记录了虚拟环境的配置：

\`\`\`ini
home = /usr/local/bin              # 系统 Python 解释器的位置
include-system-site-packages = false  # 是否继承系统 site-packages
version = 3.12.0                   # Python 版本
prompt = .venv                     # 激活后的命令提示符
\`\`\`

### 激活与退出虚拟环境

#### 激活虚拟环境

\`\`\`bash
# macOS / Linux
source .venv/bin/activate
# 或
. .venv/bin/activate

# Windows (CMD)
.venv\\\\Scripts\\\\activate.bat

# Windows (PowerShell)
.venv\\\\Scripts\\\\Activate.ps1
\`\`\`

激活后，命令提示符会显示虚拟环境名：

\`\`\`bash
(.venv) user@machine:~/project$
\`\`\`

#### 激活后发生了什么

激活脚本主要做了两件事：
1. **修改 PATH**：把 \`.venv/bin\` 加到 PATH 最前面，这样 \`python\`、\`pip\` 优先使用虚拟环境里的版本
2. **修改命令提示符**：加上 \`(.venv)\` 前缀，提示当前在虚拟环境中

此时 \`python\` 和 \`pip\` 都指向虚拟环境内的版本，\`pip install\` 安装的包只进虚拟环境的 site-packages，不影响系统。

#### 退出虚拟环境

\`\`\`bash
deactivate                         # 退出虚拟环境，恢复系统 PATH
\`\`\`

### 虚拟环境的完整工作流

一个典型的项目工作流：

\`\`\`bash
# 1. 创建项目目录
mkdir my-project && cd my-project

# 2. 创建虚拟环境
python3 -m venv .venv

# 3. 激活虚拟环境
source .venv/bin/activate          # macOS/Linux
# .venv\\\\Scripts\\\\activate          # Windows

# 4. 安装项目依赖
pip install requests flask

# 5. 导出依赖清单
pip freeze > requirements.txt

# 6. 开发...写代码...

# 7. 退出虚拟环境
deactivate

# 8.（以后回来继续开发）
source .venv/bin/activate          # 重新激活
pip install -r requirements.txt    # 恢复依赖
\`\`\`

### .gitignore 配置

虚拟环境目录**不应该**提交到 git，因为它体积大且与平台相关。在 \`.gitignore\` 中添加：

\`\`\`
# 虚拟环境
.venv/
venv/
env/
ENV/

# Python 字节码缓存
__pycache__/
*.pyc
*.pyo
\`\`\`

**应该提交**的是 \`requirements.txt\`，它让其他人能重建相同的环境。

### 验证虚拟环境是否生效

\`\`\`bash
# 激活后检查 python 和 pip 指向
which python                       # 应该指向 .venv/bin/python
which pip                          # 应该指向 .venv/bin/pip

# 检查 Python 路径
python -c "import sys; print(sys.executable)"
# 输出: /Users/you/project/.venv/bin/python

# 检查 site-packages 位置
python -c "import site; print(site.getsitepackages())"
# 输出应包含 .venv/lib/python3.12/site-packages
\`\`\`

### venv 的常用选项

\`\`\`bash
# 不继承系统 site-packages（默认就是 false）
python3 -m venv --clear .venv      # --clear: 如果目录已存在，先删除

# 升级虚拟环境中的 pip
python3 -m venv --upgrade-deps .venv  # 创建后自动升级 pip 到最新

# 指定提示符名称
python3 -m venv --prompt myproject .venv
# 激活后显示: (myproject) user@machine:~$

# 不安装 pip（极简环境）
python3 -m venv --without-pip .venv
\`\`\`

### virtualenv vs venv

你可能还会听到 **virtualenv**。两者的区别：

| 对比 | venv | virtualenv |
| --- | --- | --- |
| **来源** | Python 3.3+ 标准库 | 第三方包，需 \`pip install virtualenv\` |
| **速度** | 较快 | 更快（优化了创建过程） |
| **Python 2 支持** | 不支持 | 支持 |
| **可定制性** | 基础 | 更强（支持更多选项） |
| **更新频率** | 随 Python 发布 | 独立更新，更活跃 |
| **推荐** | **日常用 venv 即可** | 需要高级特性时用 |

**结论**：现在 venv 已经足够好，绝大多数场景用 venv 即可，不需要额外安装 virtualenv。

### 多虚拟环境管理策略

#### 策略 1：项目内 .venv（推荐）

每个项目目录下创建 \`.venv\`：

\`\`\`
projects/
├── project-a/
│   ├── .venv/              # 项目 A 的虚拟环境
│   ├── requirements.txt
│   └── main.py
├── project-b/
│   ├── .venv/              # 项目 B 的虚拟环境
│   ├── requirements.txt
│   └── app.py
\`\`\`

优点：环境与项目绑定，删除项目即删除环境。VS Code、PyCharm 能自动识别 \`.venv\`。

#### 策略 2：集中存放

所有虚拟环境放在统一目录（如 \`~/.virtualenvs/\`），用工具管理：

\`\`\`bash
mkdir -p ~/.virtualenvs
python3 -m venv ~/.virtualenvs/project-a
source ~/.virtualenvs/project-a/bin/activate
\`\`\`

可配合 \`virtualenvwrapper\` 工具使用（提供 \`mkvirtualenv\`、\`workon\` 等便捷命令）。

### IDE 中的虚拟环境

#### VS Code

VS Code 的 Python 扩展会自动检测 \`.venv\`。也可以手动选择：

1. \`Ctrl+Shift+P\`（macOS: \`Cmd+Shift+P\`）
2. 输入 "Python: Select Interpreter"
3. 选择 \`.venv/bin/python\`

#### PyCharm

创建项目时可以选择 "New environment using Virtualenv"，或为已有项目配置：

\`Settings → Project → Python Interpreter → 齿轮图标 → Add → Existing environment\`

### requirements.txt 最佳实践

#### 开发依赖与生产依赖分离

\`\`\`txt
# requirements.txt（生产依赖）
requests==2.31.0
flask==2.3.0
\`\`\`

\`\`\`txt
# requirements-dev.txt（开发依赖）
-r requirements.txt              # 先包含生产依赖
pytest==7.4.0                    # 测试框架
black==23.7.0                    # 格式化工具
flake8==6.0.0                    # 代码检查
\`\`\`

安装时：

\`\`\`bash
pip install -r requirements.txt          # 生产环境
pip install -r requirements-dev.txt      # 开发环境
\`\`\`

#### 精确版本锁定

生产部署时，应该用**精确版本号**（\`==\`），确保每次部署的环境完全一致：

\`\`\`txt
# ✅ 精确锁定（推荐用于部署）
requests==2.31.0
urllib3==2.0.4
certifi==2023.7.22
\`\`\`

### 常见问题

#### Q：虚拟环境会复制整个 Python 吗？

**不会**。venv 只创建软链接到系统 Python 解释器，并创建一个独立的 \`site-packages\` 目录。所以虚拟环境体积很小（通常几 MB），创建速度很快。

#### Q：系统 Python 升级了，虚拟环境会受影响吗？

**会**。因为虚拟环境软链接到系统 Python，如果系统 Python 升级或删除，虚拟环境可能失效。这也是为什么用 pyenv 管理独立 Python 版本更好（见后续章节）。

#### Q：可以移动虚拟环境目录吗？

**不建议**。虚拟环境内的路径是硬编码的，移动后软链接和路径会失效。应该删除后重新创建。

#### Q：如何删除虚拟环境？

直接删除目录即可：

\`\`\`bash
rm -rf .venv                      # macOS/Linux
rmdir /s /q .venv                 # Windows CMD
\`\`\`

### 本节代码演示

下面这段代码演示虚拟环境的原理：查看 \`sys.executable\` 和 \`sys.path\` 来理解环境隔离的本质、用 \`site\` 模块查看包安装路径、模拟虚拟环境的 \`pyvenv.cfg\` 配置。运行后你会理解虚拟环境"隔离"的底层原理。`,
    code: `# ============================================================
# 第三章代码演示：虚拟环境原理探秘
# ============================================================
# 本代码演示虚拟环境的底层原理：
#   - 解释器路径与模块搜索路径
#   - site-packages 的位置
#   - 虚拟环境配置文件
#   - 模块查找顺序
# 帮助你理解 venv 是如何实现"隔离"的

import sys
import os
import site

# ---- 1. 当前 Python 解释器路径 ----
print("========== 1. 当前解释器路径 ==========")
print("sys.executable:", sys.executable)
# 在虚拟环境中，这个路径会指向 .venv/bin/python
# 在系统环境中，会指向 /usr/bin/python3 或 /usr/local/bin/python3

# 检查是否在虚拟环境中
def detect_virtualenv():
    """检测当前是否运行在虚拟环境中"""
    # 方法 1：检查 sys.prefix 和 sys.base_prefix 是否不同
    in_venv = sys.prefix != sys.base_prefix
    # 方法 2：检查是否有 VIRTUAL_ENV 环境变量
    venv_env = os.environ.get("VIRTUAL_ENV")
    # 方法 3：检查 sys.executable 路径是否包含 venv 相关目录
    exe_path = sys.executable.lower()
    in_venv_path = any(x in exe_path for x in ["venv", ".venv", "env", "virtualenv"])

    return {
        "sys.prefix != base_prefix": in_venv,
        "VIRTUAL_ENV 环境变量": venv_env,
        "路径包含 venv": in_venv_path,
    }

result = detect_virtualenv()
print("\\n虚拟环境检测结果:")
for method, value in result.items():
    print(f"  {method}: {value}")

# ---- 2. sys.prefix vs sys.base_prefix ----
print("\\n========== 2. sys.prefix vs sys.base_prefix ==========")
print(f"sys.prefix:       {sys.prefix}")
print(f"sys.base_prefix:  {sys.base_prefix}")
print()
print("解释:")
print("  sys.prefix      = 当前 Python 环境的根目录")
print("  sys.base_prefix = 基础（系统）Python 的根目录")
print("  如果两者不同，说明在虚拟环境中")
if sys.prefix == sys.base_prefix:
    print("  → 当前在系统环境（非虚拟环境）")
else:
    print("  → 当前在虚拟环境中")

# ---- 3. 模块搜索路径 sys.path ----
print("\\n========== 3. 模块搜索路径 sys.path ==========")
print("Python 查找模块的路径顺序:")
for i, path in enumerate(sys.path):
    # 标记路径类型
    if "site-packages" in path:
        path_type = "第三方包目录"
    elif path == "" or path == os.getcwd():
        path_type = "当前目录"
    elif "lib/python" in path:
        path_type = "标准库目录"
    else:
        path_type = "其他"
    print(f"  [{i}] {path}")
    print(f"      类型: {path_type}")

# ---- 4. site-packages 位置 ----
print("\\n========== 4. site-packages 位置 ==========")
print("第三方包安装的目录:")
site_packages = site.getsitepackages()
for path in site_packages:
    print(f"  {path}")
print(f"用户级 site-packages: {site.getusersitepackages()}")

# ---- 5. 模拟 pyvenv.cfg 配置文件 ----
print("\\n========== 5. 模拟 pyvenv.cfg 内容 ==========")
print("虚拟环境的 pyvenv.cfg 配置文件示例:")
pyvenv_cfg_example = """home = /usr/local/bin              # 系统 Python 解释器位置
include-system-site-packages = false  # 是否继承系统包
version = 3.12.0                   # Python 版本
prompt = .venv                     # 激活后的提示符"""
print(pyvenv_cfg_example)

# ---- 6. 模块查找顺序演示 ----
print("\\n========== 6. 模块查找顺序 ==========")
import importlib.util

# 演示 import 时 Python 如何查找模块
test_modules = [
    ("os", "标准库"),
    ("sys", "内置模块"),
    ("json", "标准库"),
    ("collections", "标准库"),
    ("http", "标准库"),
]

print(f"{'模块名':<15} {'类型':<10} {'位置'}")
print("-" * 70)
for mod_name, mod_type in test_modules:
    spec = importlib.util.find_spec(mod_name)
    if spec:
        origin = spec.origin or "内置（无文件）"
        print(f"{mod_name:<15} {mod_type:<10} {origin}")
    else:
        print(f"{mod_name:<15} {'未找到'}")

# ---- 7. 已加载模块缓存 sys.modules ----
print("\\n========== 7. 模块缓存 sys.modules ==========")
print(f"sys.modules 中已缓存 {len(sys.modules)} 个模块")
print("前 10 个已加载的模块:")
for i, mod_name in enumerate(list(sys.modules.keys())[:10]):
    print(f"  {i + 1}. {mod_name}")
print()
print("解释: import 时 Python 先查 sys.modules 缓存，")
print("如果已加载就直接用，不会重复加载。")

# ---- 8. 虚拟环境工作流演示（文字模拟）----
print("\\n========== 8. 虚拟环境工作流 ==========")
workflow = """
典型虚拟环境工作流:

1. 创建项目目录
   $ mkdir my-project && cd my-project

2. 创建虚拟环境
   $ python3 -m venv .venv

3. 激活虚拟环境
   $ source .venv/bin/activate        # macOS/Linux
   $ .venv\\\\Scripts\\\\activate         # Windows

4. 此时 python/pip 指向虚拟环境:
   $ which python
   /Users/you/my-project/.venv/bin/python

5. 安装依赖（只装到虚拟环境）
   $ pip install requests flask

6. 导出依赖清单
   $ pip freeze > requirements.txt

7. 退出虚拟环境
   $ deactivate

8. 重建环境
   $ python3 -m venv .venv
   $ source .venv/bin/activate
   $ pip install -r requirements.txt
"""
print(workflow)

# ---- 9. 验证隔离性 ----
print("========== 9. 虚拟环境隔离原理 ==========")
print("虚拟环境的隔离原理:")
print("  1. 独立的 site-packages 目录（包隔离）")
print(f"     系统: {sys.base_prefix}/lib/python{sys.version_info.major}.{sys.version_info.minor}/site-packages")
print(f"     虚拟: {sys.prefix}/lib/python{sys.version_info.major}.{sys.version_info.minor}/site-packages")
print()
print("  2. 软链接到系统 Python 解释器（共享解释器）")
print(f"     虚拟环境的 python 软链接到系统 python")
print()
print("  3. 激活时修改 PATH（命令隔离）")
print("     .venv/bin/ 被加到 PATH 最前面")
print("     所以 python/pip 命令优先用虚拟环境的版本")

# ---- 10. .gitignore 推荐配置 ----
print("\\n========== 10. .gitignore 推荐配置 ==========")
gitignore = """# Python 虚拟环境（不应提交到 git）
.venv/
venv/
env/
ENV/

# Python 字节码缓存
__pycache__/
*.py[cod]
*$py.class

# 分发/打包
build/
dist/
*.egg-info/

# 测试覆盖率
.pytest_cache/
htmlcov/
.coverage
"""
print(gitignore)

print("以上就是虚拟环境的核心原理与用法！")
print("记住黄金法则：每个项目都要有自己的虚拟环境！")
`,
  },

  // =========================================================
  // 第四章：uv 现代包管理
  // =========================================================
  {
    id: "py-uv",
    group: "环境搭建",
    icon: "⚡",
    title: "uv 现代包管理",
    content: `## uv 现代包管理

**uv** 是由 **Astral** 公司（也就是开发 Ruff 的团队）用 **Rust** 编写的现代 Python 包管理器。它旨在成为 pip、pip-tools、virtualenv、pyenv 等工具的**统一替代品**，速度比 pip 快 **10-100 倍**。uv 是 2024 年 Python 生态最重要的新工具之一，代表了 Python 工具链的现代化方向。

### 为什么需要 uv

#### pip 的痛点

pip 作为 Python 官方包管理器，已经服役 15 年以上，但有几个长期痛点：

| 痛点 | 说明 |
| --- | --- |
| **速度慢** | 安装大项目依赖要几十秒到几分钟，大量时间花在网络 I/O 和依赖解析 |
| **依赖解析弱** | 采用回溯算法，遇到复杂依赖时可能要尝试很久，甚至失败 |
| **功能分散** | 需要 pip + venv + pip-tools + pyenv 等多个工具配合 |
| **无锁文件** | requirements.txt 不够精确，不能保证跨平台完全一致 |
| **全局缓存差** | 每个虚拟环境都要重新下载，浪费磁盘和带宽 |

#### uv 的优势

uv 用 Rust 重写了整个工具链，解决了上述所有问题：

| 优势 | 说明 |
| --- | --- |
| **极速** | 比 pip 快 10-100 倍，安装依赖从分钟级降到秒级 |
| **智能缓存** | 全局包缓存，不同虚拟环境共享已下载的包，不重复下载 |
| **强大依赖解析** | 用 Rust 实现的 PubGrub 算法，快速且准确 |
| **一体化** | 集成了 pip + venv + pyenv + pip-tools 的功能 |
| **兼容 pip** | 支持 pip 的命令行接口，可无缝替换 |
| **跨平台** | 支持 macOS、Linux、Windows，自带跨平台锁文件 |
| **Python 版本管理** | 内置 Python 版本安装和管理，不需要 pyenv |

### 安装 uv

#### 方式 1：官方安装脚本（推荐）

\`\`\`bash
# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
\`\`\`

#### 方式 2：Homebrew（macOS）

\`\`\`bash
brew install uv
\`\`\`

#### 方式 3：pip 安装

\`\`\`bash
pip install uv
\`\`\`

#### 方式 4：通过 npm 安装（用于 CI/CD）

\`\`\`bash
npm install -g @astral-sh/uv
\`\`\`

安装后验证：

\`\`\`bash
uv --version                     # 查看版本
\`\`\`

### uv 管理 Python 版本

uv 内置了 Python 版本管理功能，**不需要 pyenv** 就能安装和切换多个 Python 版本：

\`\`\`bash
# 安装指定版本的 Python
uv python install 3.12           # 安装 Python 3.12
uv python install 3.11 3.12 3.13 # 同时安装多个版本

# 查看已安装的 Python 版本
uv python list

# 固定项目使用的 Python 版本
uv python pin 3.12               # 在当前目录创建 .python-version 文件
\`\`\`

uv 安装的 Python 版本存放在 \`~/.local/share/uv/python/\` 目录下，与系统 Python 完全隔离，不会冲突。

### uv 创建虚拟环境

\`\`\`bash
# 创建虚拟环境（默认 .venv）
uv venv

# 指定目录名
uv venv myenv

# 指定 Python 版本
uv venv --python 3.12            # 用 Python 3.12 创建

# 创建的同时安装包
uv venv && uv pip install requests
\`\`\`

激活方式与 venv 相同：

\`\`\`bash
source .venv/bin/activate        # macOS/Linux
.venv\\\\Scripts\\\\activate          # Windows
\`\`\`

### uv pip：兼容 pip 的命令

uv 提供了 \`uv pip\` 子命令，接口与 pip 几乎完全一致，可以**无缝替换** pip：

\`\`\`bash
# 安装包
uv pip install requests          # 等价于 pip install requests
uv pip install -r requirements.txt
uv pip install -e .              # 安装当前项目（开发模式）

# 卸载
uv pip uninstall requests

# 查看已安装
uv pip list
uv pip freeze
uv pip show requests

# 安装到指定虚拟环境
uv pip install --python .venv/bin/python requests
\`\`\`

**速度对比**（安装 Django 及其依赖）：

\`\`\`
pip install django:     8.3 秒
uv pip install django:  0.4 秒（快 20 倍）
\`\`\`

### uv 项目管理：pyproject.toml

uv 的**项目模式**用 \`pyproject.toml\` 管理项目，类似 Node.js 的 \`package.json\`：

#### 初始化项目

\`\`\`bash
uv init my-project               # 创建新项目
cd my-project
\`\`\`

生成的 \`pyproject.toml\`：

\`\`\`toml
[project]
name = "my-project"
version = "0.1.0"
description = "Add your description here"
requires-python = ">=3.12"
dependencies = []
\`\`\`

#### 添加依赖

\`\`\`bash
uv add requests                  # 添加生产依赖
uv add "flask>=2.0,<3.0"        # 指定版本范围
uv add --dev pytest              # 添加开发依赖（dev 组）
uv add --group docs mkdocs       # 添加到指定分组
\`\`\`

\`pyproject.toml\` 会自动更新：

\`\`\`toml
[project]
name = "my-project"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "requests>=2.31",
    "flask>=2.0,<3.0",
]

[dependency-groups]
dev = [
    "pytest>=7.4",
]
docs = [
    "mkdocs>=1.5",
]
\`\`\`

#### 删除依赖

\`\`\`bash
uv remove requests               # 移除生产依赖
uv remove --dev pytest           # 移除开发依赖
\`\`\`

#### 同步环境

\`\`\`bash
uv sync                          # 根据 pyproject.toml + uv.lock 同步环境
\`\`\`

\`uv sync\` 会自动：创建虚拟环境、安装正确版本的 Python、安装所有依赖。**一条命令搞定环境搭建**。

#### 运行命令

\`\`\`bash
uv run python main.py            # 在项目环境中运行 Python
uv run pytest                    # 运行测试
uv run flask run                 # 运行 Flask
\`\`\`

\`uv run\` 会自动同步环境（如果需要），然后在项目环境中执行命令，**不需要手动激活虚拟环境**。

### uv.lock：精确锁文件

\`uv lock\` 生成 \`uv.lock\` 文件，记录所有依赖的**精确版本和哈希值**，确保跨平台、跨时间完全一致：

\`\`\`bash
uv lock                          # 生成/更新锁文件
uv lock --upgrade                # 升级所有依赖到最新兼容版本
uv lock --upgrade-package requests  # 只升级 requests
\`\`\`

\`uv.lock\` 相比 \`requirements.txt\` 的优势：
- **跨平台**：记录了不同平台（macOS/Linux/Windows）的包版本
- **精确哈希**：用 SHA256 验证包完整性，防止供应链攻击
- **依赖图**：完整记录依赖关系树
- **可重现**：\`uv sync\` 根据锁文件重建完全一致的环境

### uv 的工具管理

uv 还能安装全局命令行工具（类似 \`pipx\`）：

\`\`\`bash
# 安装命令行工具到隔离环境
uv tool install ruff             # 安装 ruff 代码检查工具
uv tool install black            # 安装 black 格式化工具
uv tool install httpie           # 安装 HTTP 命令行客户端

# 运行一次性命令（不安装）
uvx ruff check .                 # 临时运行 ruff（类似 npx）
uvx cowsay "Hello"               # 临时运行 cowsay

# 查看已安装的工具
uv tool list

# 升级工具
uv tool upgrade ruff
uv tool upgrade --all

# 卸载
uv tool uninstall ruff
\`\`\`

### uv 全局缓存

uv 的一个重要特性是**全局包缓存**。下载过的包会缓存在 \`~/.cache/uv/\` 目录，不同虚拟环境共享：

\`\`\`bash
# 查看缓存大小
uv cache dir                     # 查看缓存目录
du -sh $(uv cache dir)           # 查看缓存大小

# 清理缓存
uv cache clean
\`\`\`

这意味着：第一次安装某个包要下载，之后在任何虚拟环境中安装同一个包都**瞬间完成**（从缓存硬链接）。

### uv 完整工作流

\`\`\`bash
# 1. 创建新项目
uv init my-project
cd my-project

# 2. 添加依赖
uv add requests flask
uv add --dev pytest

# 3. 写代码...
# 编辑 main.py

# 4. 运行
uv run python main.py

# 5. 运行测试
uv run pytest

# 6. 同步环境（别人 clone 项目后）
uv sync                          # 一条命令重建完整环境
\`\`\`

### pip vs uv vs poetry 对比

| 特性 | pip | uv | poetry |
| --- | --- | --- | --- |
| **速度** | 慢 | 极快（Rust） | 中等 |
| **语言** | Python | Rust | Python |
| **锁文件** | 无（需 pip-tools） | uv.lock（跨平台） | poetry.lock |
| **项目管理** | 无 | pyproject.toml | pyproject.toml |
| **Python 版本管理** | 无 | 内置 | 无 |
| **全局工具** | 无 | uv tool / uvx | 无 |
| **学习成本** | 低 | 中 | 中 |
| **成熟度** | 非常成熟 | 较新但发展极快 | 成熟 |
| **推荐场景** | 简单脚本 | **新项目首选** | 已有 poetry 项目 |

### 迁移到 uv

从现有 pip 项目迁移到 uv 非常简单：

\`\`\`bash
# 从 requirements.txt 迁移
uv init --no-readme              # 初始化 pyproject.toml
uv add -r requirements.txt       # 导入现有依赖

# 或直接用 uv pip 兼容模式
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt
\`\`\`

### 何时用 uv pip vs uv 项目模式

- **uv pip**：兼容模式，适合简单脚本、临时项目、迁移过渡期
- **uv 项目模式**（uv add/sync/run）：完整项目管理，适合正式项目

### 本节代码演示

下面这段代码用 Python 探索包管理相关的概念：模拟锁文件的结构、展示依赖解析的逻辑、对比 requirements.txt 与 pyproject.toml 的格式。运行后你会理解现代包管理器的核心设计。`,
    code: `# ============================================================
# 第四章代码演示：理解现代包管理
# ============================================================
# 本代码用标准库模拟现代包管理器的核心概念：
#   - 依赖解析逻辑
#   - 锁文件结构
#   - pyproject.toml vs requirements.txt
#   - 包缓存原理

import json
import hashlib

# ---- 1. 模拟依赖解析 ----
print("========== 1. 依赖解析原理 ==========")
# 模拟一个包的依赖关系图
package_registry = {
    "django": {
        "4.2.0": {"requires": ["asgiref>=3.6", "sqlparse>=0.4"]},
        "5.0.0": {"requires": ["asgiref>=3.7", "sqlparse>=0.4"]},
    },
    "asgiref": {
        "3.6.0": {"requires": []},
        "3.7.0": {"requires": []},
        "3.8.0": {"requires": []},
    },
    "sqlparse": {
        "0.4.0": {"requires": []},
        "0.4.4": {"requires": []},
    },
}

def resolve_dependencies(requirements):
    """模拟简单的依赖解析"""
    resolved = {}
    for req in requirements:
        # 提取包名和版本约束
        name = req.split(">=")[0].split("<")[0].strip()
        if name in package_registry:
            # 取最新版本
            latest_version = max(package_registry[name].keys())
            resolved[name] = latest_version
            # 递归解析子依赖
            sub_deps = package_registry[name][latest_version]["requires"]
            for sub in sub_deps:
                sub_name = sub.split(">=")[0].split("<")[0].strip()
                if sub_name not in resolved and sub_name in package_registry:
                    resolved[sub_name] = max(package_registry[sub_name].keys())
    return resolved

print("依赖图:")
for pkg, versions in package_registry.items():
    for ver, info in versions.items():
        deps = info["requires"]
        dep_str = f" → 依赖: {deps}" if deps else " → 无依赖"
        print(f"  {pkg}=={ver}{dep_str}")

print("\\n解析 [django] 的依赖:")
resolved = resolve_dependencies(["django>=4.0"])
for pkg, ver in sorted(resolved.items()):
    print(f"  {pkg}=={ver}")

# ---- 2. 模拟锁文件结构 ----
print("\\n========== 2. 锁文件结构（模拟 uv.lock）==========")
lock_file = {
    "version": 1,
    "packages": [
        {
            "name": "django",
            "version": "5.0.0",
            "sha256": "a1b2c3d4e5f6...",
            "requires": ["asgiref>=3.7", "sqlparse>=0.4"],
            "dependencies": ["asgiref", "sqlparse"],
        },
        {
            "name": "asgiref",
            "version": "3.8.0",
            "sha256": "f6e5d4c3b2a1...",
            "requires": [],
            "dependencies": [],
        },
        {
            "name": "sqlparse",
            "version": "0.4.4",
            "sha256": "b2a1c3d4e5f6...",
            "requires": [],
            "dependencies": [],
        },
    ],
}

print("uv.lock 结构示例:")
print(json.dumps(lock_file, indent=2, ensure_ascii=False))

print("\\n锁文件的核心价值:")
print("  1. 精确版本号（==）确保完全一致")
print("  2. SHA256 哈希验证包完整性（防篡改）")
print("  3. 完整依赖关系图")
print("  4. 跨平台一致性")

# ---- 3. pyproject.toml vs requirements.txt ----
print("\\n========== 3. pyproject.toml vs requirements.txt ==========")

requirements_txt = """# requirements.txt（传统方式）
requests==2.31.0
flask==2.3.0
urllib3==2.0.4"""

pyproject_toml = """# pyproject.toml（现代方式）
[project]
name = "my-app"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "requests>=2.31",
    "flask>=2.0,<3.0",
]

[dependency-groups]
dev = ["pytest>=7.4", "black>=23.0"]"""

print("requirements.txt（简单但不精确）:")
print(requirements_txt)
print("\\npyproject.toml（完整项目元数据）:")
print(pyproject_toml)

print("\\n对比:")
print(f"  {'特性':<20} {'requirements.txt':<20} {'pyproject.toml'}")
print(f"  {'-'*60}")
print(f"  {'项目元数据':<18} {'不支持':<20} {'支持（name/version）'}")
print(f"  {'版本范围':<18} {'==（精确）':<20} {'支持范围约束'}")
print(f"  {'依赖分组':<18} {'不支持':<20} {'支持（dev/docs等）'}")
print(f"  {'Python 版本':<16} {'不支持':<20} {'requires-python'}")
print(f"  {'构建系统':<18} {'不支持':<20} {'支持（build-system）'}")

# ---- 4. 包缓存原理 ----
print("\\n========== 4. 包缓存原理 ==========")
print("uv 的全局缓存机制:")
print()
print("  传统 pip（无缓存共享）:")
print("    项目A/.venv/site-packages/requests/  ← 下载")
print("    项目B/.venv/site-packages/requests/  ← 又下载")
print("    项目C/.venv/site-packages/requests/  ← 再下载")
print()
print("  uv（全局缓存 + 硬链接）:")
print("    ~/.cache/uv/requests-2.31.0.whl      ← 只下载一次")
print("    项目A/.venv/site-packages/requests/  ← 硬链接（0 拷贝）")
print("    项目B/.venv/site-packages/requests/  ← 硬链接（0 拷贝）")
print("    项目C/.venv/site-packages/requests/  ← 硬链接（0 拷贝）")

# ---- 5. 模拟哈希验证 ----
print("\\n========== 5. 包完整性验证（SHA256）==========")
# 模拟锁文件中的哈希验证
def simulate_hash_verification():
    """模拟锁文件的哈希验证"""
    # 模拟包内容
    package_content = b"requests package content v2.31.0"
    # 计算 SHA256
    sha256 = hashlib.sha256(package_content).hexdigest()
    return sha256

real_hash = simulate_hash_verification()
print(f"包内容哈希计算:")
print(f"  内容: requests package content v2.31.0")
print(f"  SHA256: {real_hash}")
print()
print("哈希验证流程:")
print("  1. 锁文件记录预期哈希: a1b2c3d4...")
print("  2. 下载包后计算实际哈希")
print("  3. 比对两个哈希值")
print("  4. 不匹配则拒绝安装（防供应链攻击）")

# ---- 6. uv 命令速查表 ----
print("\\n========== 6. uv 命令速查表 ==========")
commands = [
    ("uv init", "初始化新项目"),
    ("uv add <pkg>", "添加依赖"),
    ("uv add --dev <pkg>", "添加开发依赖"),
    ("uv remove <pkg>", "移除依赖"),
    ("uv sync", "同步环境（创建venv+装依赖）"),
    ("uv lock", "生成/更新锁文件"),
    ("uv run <cmd>", "在项目环境中运行命令"),
    ("uv venv", "创建虚拟环境"),
    ("uv pip install <pkg>", "pip 兼容模式安装"),
    ("uv python install 3.12", "安装 Python 3.12"),
    ("uv python pin 3.12", "固定项目 Python 版本"),
    ("uv tool install <pkg>", "安装全局命令行工具"),
    ("uvx <cmd>", "临时运行命令（类似 npx）"),
    ("uv cache clean", "清理缓存"),
]

print(f"{'命令':<35} {'说明'}")
print("-" * 65)
for cmd, desc in commands:
    print(f"  {cmd:<33} {desc}")

# ---- 7. 项目工作流对比 ----
print("\\n========== 7. 工作流对比 ==========")
print("传统 pip + venv 工作流:")
print("  $ python3 -m venv .venv")
print("  $ source .venv/bin/activate")
print("  $ pip install -r requirements.txt")
print("  $ pip freeze > requirements.txt   # 手动更新")
print("  $ python main.py")
print("  $ deactivate")
print()
print("uv 工作流（更简洁）:")
print("  $ uv init                          # 一次初始化")
print("  $ uv add requests flask            # 自动管理依赖")
print("  $ uv run python main.py            # 自动同步+运行")
print("  # 无需手动 activate/deactivate")

# ---- 8. 性能对比数据 ----
print("\\n========== 8. 性能对比（基准测试）==========")
benchmarks = [
    ("安装 Django（冷缓存）", "8.3s", "0.4s", "20x"),
    ("安装 Django（热缓存）", "6.1s", "0.05s", "120x"),
    ("安装 100 个包（冷）", "45s", "2.1s", "21x"),
    ("安装 100 个包（热）", "32s", "0.3s", "100x"),
    ("解析依赖树", "3.2s", "0.1s", "32x"),
]

print(f"{'操作':<25} {'pip':<10} {'uv':<10} {'加速比'}")
print("-" * 55)
for op, pip_time, uv_time, speedup in benchmarks:
    print(f"  {op:<23} {pip_time:<10} {uv_time:<10} {speedup}")

print("\\n以上就是 uv 现代包管理的核心知识！")
print("uv 代表了 Python 工具链的未来方向：")
print("极速、一体化、现代化。新项目推荐使用 uv。")
`,
  },

  // =========================================================
  // 第五章：pyenv 多版本管理
  // =========================================================
  {
    id: "py-pyenv",
    group: "环境搭建",
    icon: "🔀",
    title: "pyenv 多版本管理",
    content: `## pyenv 多版本管理

**pyenv** 是 Python 的**多版本管理工具**，让你在同一台电脑上安装和切换多个 Python 版本（如 3.10、3.11、3.12、3.13），互不冲突。当你需要在不同项目中使用不同 Python 版本时，pyenv 是必不可少的工具。

### 为什么需要 pyenv

#### 多版本共存的场景

| 场景 | 需要的 Python 版本 |
| --- | --- |
| 项目 A 用了 Python 3.12 的新语法 | 3.12 |
| 项目 B 需要兼容 Python 3.9 | 3.9 |
| 学习 Python 3.13 的自由线程（no-GIL） | 3.13 |
| 测试库在不同版本上的兼容性 | 3.10/3.11/3.12/3.13 |
| 某个库只支持 Python 3.8 | 3.8 |

如果不用 pyenv，你只能：
- 手动从 python.org 下载不同版本安装包
- 手动管理安装路径
- 手动切换 PATH（容易出错）

pyenv 把这一切自动化了。

#### pyenv vs 系统包管理器

| 方式 | 优点 | 缺点 |
| --- | --- | --- |
| **系统包管理器**（apt/brew） | 简单 | 版本受限于发行版，无法同时装多版本 |
| **手动编译** | 完全可控 | 繁琐，依赖管理麻烦 |
| **pyenv** | 多版本共存、自动切换、用户级 | 需要编译依赖 |

### pyenv 的工作原理

pyenv 的核心是一个名为 **shims**（垫片）的机制：

\`\`\`
你的终端
   ↓
pyenv shims（~/.pyenv/shims/）
  python → 根据 .python-version 决定用哪个版本
  pip    → 同上
   ↓
实际 Python 解释器（~/.pyenv/versions/3.12.0/bin/python）
\`\`\`

#### shims 垫片

pyenv 会在 \`~/.pyenv/shims/\` 目录下创建 \`python\`、\`pip\` 等命令的"垫片"。当你输入 \`python\` 时，实际执行的是 shim，shim 会根据当前目录的 \`.python-version\` 文件或全局设置，决定调用哪个版本的 Python。

#### 版本选择优先级

pyenv 按以下顺序决定使用哪个 Python 版本（从高到低）：

1. **环境变量** \`PYENV_VERSION\`：临时指定版本
2. **本地版本**（\`.python-version\` 文件）：当前项目目录专用
3. **全局版本**（\`~/.pyenv/version\` 文件）：系统默认版本
4. **系统 Python**：以上都没找到时回退到系统自带 Python

### 安装 pyenv

#### macOS

\`\`\`bash
# 用 Homebrew 安装
brew install pyenv

# 配置 shell（zsh）
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zshrc
echo '[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zshrc
echo 'eval "$(pyenv init -)"' >> ~/.zshrc

# 重启 shell
exec zsh
\`\`\`

#### Linux（Ubuntu/Debian）

\`\`\`bash
# 安装编译依赖
sudo apt update
sudo apt install -y make build-essential libssl-dev zlib1g-dev \\
    libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \\
    libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev \\
    libffi-dev liblzma-dev

# 克隆 pyenv
curl https://pyenv.run | bash

# 配置 shell
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc

# 重启 shell
exec bash
\`\`\`

#### Windows

pyenv 官方不支持 Windows，但有移植版 **pyenv-win**：

\`\`\`powershell
# 用 PowerShell 安装
Invoke-WebRequest -UseBasicParsing -Uri "https://raw.githubusercontent.com/pyenv-win/pyenv-win/master/pyenv-win/install-pyenv-win.ps1" -OutFile "./install-pyenv-win.ps1"; &"./install-pyenv-win.ps1"
\`\`\`

**Windows 用户提示**：如果用 WSL2（Windows Subsystem for Linux），可以直接在 WSL 中安装 Linux 版 pyenv，体验更好。

### 安装 Python 版本

\`\`\`bash
# 查看可安装的版本
pyenv install --list              # 列出所有可安装版本（几百个）
pyenv install --list | grep 3.12  # 过滤 Python 3.12.x 版本

# 安装指定版本
pyenv install 3.12.0             # 安装 Python 3.12.0
pyenv install 3.11.6             # 安装 Python 3.11.6
pyenv install 3.13.0             # 安装 Python 3.13.0

# 查看已安装的版本
pyenv versions                   # 列出所有已安装版本（带 * 的是当前版本）
\`\`\`

**注意**：pyenv 是从源码编译安装 Python，所以需要安装编译依赖（见上文 Linux 安装步骤）。安装一个版本大约需要 3-10 分钟。

### 切换 Python 版本

\`\`\`bash
# 设置全局默认版本（影响所有目录）
pyenv global 3.12.0

# 设置本地版本（在当前目录创建 .python-version 文件）
cd my-project
pyenv local 3.11.6              # 这个项目用 Python 3.11.6
# 会生成 .python-version 文件，内容是 3.11.6

# 临时切换版本（只影响当前 shell 会话）
pyenv shell 3.13.0              # 当前终端临时用 3.13.0

# 查看当前使用的版本
pyenv version                   # 显示当前版本
python --version                # 验证 Python 版本
\`\`\`

#### 版本切换的优先级演示

\`\`\`bash
$ pyenv global 3.12.0            # 设置全局默认 3.12.0
$ python --version
Python 3.12.0

$ cd project-a/
$ pyenv local 3.11.6            # 项目 A 用 3.11.6
$ python --version
Python 3.11.6
$ cat .python-version
3.11.6

$ pyenv shell 3.13.0            # 临时切到 3.13.0
$ python --version
Python 3.13.0

$ cd ..                         # 离开项目 A
$ python --version
Python 3.12.0                   # 回到全局版本
\`\`\`

### .python-version 文件

\`pyenv local\` 会在当前目录生成 \`.python-version\` 文件，内容只有版本号：

\`\`\`
3.11.6
\`\`\`

这个文件应该**提交到 git**，这样团队所有人 clone 项目后会自动使用正确的 Python 版本。

进入含有 \`.python-version\` 的目录时，pyenv 会自动切换到指定版本，无需手动操作。

### pyenv virtualenv：虚拟环境插件

pyenv 本身只管理 Python 版本，不管理虚拟环境。但配合 **pyenv-virtualenv** 插件，可以把版本管理和虚拟环境管理统一：

\`\`\`bash
# 安装插件
brew install pyenv-virtualenv    # macOS
# 或 git clone https://github.com/pyenv/pyenv-virtualenv $(pyenv root)/plugins/pyenv-virtualenv

# 配置 shell
echo 'eval "$(pyenv virtualenv-init -)"' >> ~/.zshrc

# 创建虚拟环境（基于指定 Python 版本）
pyenv virtualenv 3.12.0 myproject-env

# 激活
pyenv activate myproject-env

# 退出
pyenv deactivate

# 删除虚拟环境
pyenv virtualenv-delete myproject-env
\`\`\`

### pyenv 常用命令

| 命令 | 作用 |
| --- | --- |
| \`pyenv install --list\` | 列出所有可安装版本 |
| \`pyenv install <version>\` | 安装指定版本 |
| \`pyenv uninstall <version>\` | 卸载版本 |
| \`pyenv versions\` | 列出已安装版本 |
| \`pyenv version\` | 显示当前版本 |
| \`pyenv global <version>\` | 设置全局版本 |
| \`pyenv local <version>\` | 设置本地版本（项目级） |
| \`pyenv shell <version>\` | 设置 shell 会话版本 |
| \`pyenv which python\` | 显示当前 python 的实际路径 |
| \`pyenv root\` | 显示 pyenv 安装目录 |

### pyenv 与 venv 的配合

pyenv 管理版本，venv 管理包隔离，两者配合使用是最佳实践：

\`\`\`bash
# 1. 用 pyenv 安装 Python 版本
pyenv install 3.12.0
pyenv local 3.12.0              # 项目用 3.12.0

# 2. 用 venv 创建虚拟环境
python -m venv .venv
source .venv/bin/activate

# 3. 此时 python 和 pip 都用 3.12.0 版本
python --version                # Python 3.12.0
pip install requests
\`\`\`

### pyenv vs uv 的 Python 版本管理

uv 也内置了 Python 版本管理功能，与 pyenv 的对比：

| 特性 | pyenv | uv |
| --- | --- | --- |
| **安装方式** | 从源码编译 | 下载预编译二进制 |
| **安装速度** | 慢（3-10 分钟/版本） | 快（几秒/版本） |
| **编译依赖** | 需要安装 C 编译器等 | 不需要 |
| **跨平台** | 不支持 Windows（需 pyenv-win） | 支持 Windows |
| **成熟度** | 成熟，广泛使用 | 较新但发展快 |
| **推荐** | 传统项目、需要编译特定选项 | **新项目首选** |

\`\`\`bash
# pyenv 方式
pyenv install 3.12.0            # 编译安装，慢
pyenv local 3.12.0

# uv 方式（更快）
uv python install 3.12          # 下载预编译，快
uv python pin 3.12
\`\`\`

### 常见问题

#### Q：pyenv install 报编译错误

确保安装了编译依赖：

\`\`\`bash
# Ubuntu/Debian
sudo apt install -y build-essential libssl-dev zlib1g-dev \\
    libbz2-dev libreadline-dev libsqlite3-dev \\
    libffi-dev liblzma-dev

# macOS（通常 brew 会自动处理）
xcode-select --install
\`\`\`

#### Q：切换版本后 pip 找不到

pyenv 的每个版本有独立的 pip。切换版本后，pip 也自动切换：

\`\`\`bash
pyenv global 3.12.0
pip --version                    # 这是 3.12.0 的 pip

pyenv global 3.11.6
pip --version                    # 这是 3.11.6 的 pip
\`\`\`

#### Q：pyenv 和系统 Python 冲突

pyenv 通过 shims 机制拦截 \`python\` 命令，不会修改系统 Python。如果 pyenv 没有设置任何版本，会回退到系统 Python。

### 本节代码演示

下面这段代码用 Python 标准库探索版本信息：查看当前 Python 版本的详细信息、模拟多版本管理的选择逻辑、展示版本号各部分的含义。运行后你会理解版本管理的本质。`,
    code: `# ============================================================
# 第五章代码演示：Python 版本管理
# ============================================================
# 本代码用标准库探索 Python 版本信息：
#   - 版本号的结构与含义
#   - 版本选择逻辑模拟
#   - 不同版本的特性差异
#   - 版本兼容性判断

import sys
import platform

# ---- 1. 当前 Python 版本信息 ----
print("========== 1. 当前 Python 版本信息 ==========")
print("sys.version:", sys.version)
print()
print("版本信息分解:")
vi = sys.version_info
print(f"  主版本号 (major):    {vi.major}")
print(f"  次版本号 (minor):    {vi.minor}")
print(f"  修订号 (micro):      {vi.micro}")
print(f"  发布级别 (releaselevel): {vi.releaselevel}")
print(f"  序列号 (serial):     {vi.serial}")
print()
print("平台信息:")
print(f"  platform.platform(): {platform.platform()}")
print(f"  platform.python_version(): {platform.python_version()}")
print(f"  platform.python_implementation(): {platform.python_implementation()}")
print(f"  platform.machine(): {platform.machine()}")
print(f"  platform.processor(): {platform.processor()}")

# ---- 2. 版本号语义 ----
print("\\n========== 2. 版本号语义 ==========")
print("Python 版本号格式: 主版本.次版本.修订号")
print()
print("  Python 3.12.0")
print("    │  │  └─ 修订号(micro): 修复 bug，完全兼容")
print("    │  └──── 次版本号(minor): 新功能，向下兼容")
print("    └─────── 主版本号(major): 重大变更，可能不兼容")
print()
print("发布级别:")
print("  final   = 正式版（如 3.12.0 final）")
print("  alpha   = 内部测试版（如 3.13.0a1）")
print("  beta    = 公开测试版（如 3.13.0b1）")
print("  candidate = 候选版（如 3.13.0rc1）")

# ---- 3. 模拟 pyenv 版本选择逻辑 ----
print("\\n========== 3. pyenv 版本选择逻辑（模拟）==========")
def pyenv_select_version(env_version=None, local_version=None, global_version=None, system_version="3.8.10"):
    """模拟 pyenv 的版本选择逻辑"""
    # 优先级：环境变量 > 本地版本 > 全局版本 > 系统版本
    if env_version:
        return ("环境变量 PYENV_VERSION", env_version)
    elif local_version:
        return ("本地版本 .python-version", local_version)
    elif global_version:
        return ("全局版本", global_version)
    else:
        return ("系统 Python", system_version)

# 模拟不同场景
scenarios = [
    ("场景1: 只有系统 Python", None, None, None),
    ("场景2: 设置了全局版本 3.12.0", None, None, "3.12.0"),
    ("场景3: 项目目录有 .python-version=3.11.6", None, "3.11.6", "3.12.0"),
    ("场景4: 临时设置 PYENV_VERSION=3.13.0", "3.13.0", "3.11.6", "3.12.0"),
]

for desc, env_v, local_v, global_v in scenarios:
    source, version = pyenv_select_version(env_v, local_v, global_v)
    print(f"\\n  {desc}")
    print(f"    选择结果: Python {version}")
    print(f"    来源: {source}")

# ---- 4. .python-version 文件 ----
print("\\n========== 4. .python-version 文件 ==========")
print(".python-version 文件示例:")
print("  ┌─────────────────────────┐")
print("  │ 3.11.6                  │  ← 文件内容只有版本号")
print("  └─────────────────────────┘")
print()
print("工作原理:")
print("  1. cd 进入含有 .python-version 的目录")
print("  2. pyenv 自动读取文件内容")
print("  3. 切换到指定版本")
print("  4. 离开目录后恢复上级版本")
print()
print("最佳实践:")
print("  - .python-version 应提交到 git")
print("  - 团队成员 clone 后自动使用正确版本")

# ---- 5. Python 各版本重要特性 ----
print("\\n========== 5. Python 各版本重要特性 ==========")
version_features = [
    ("3.8", "2019", ["海象运算符 :=", "仅位置参数 /", "f-string 调试 {x=}"]),
    ("3.9", "2020", ["字典合并运算符 |", "类型注解 list[int]", "removeprefix/removesuffix"]),
    ("3.10", "2021", ["结构化模式匹配 match/case", "更好的错误提示", "parenthesized context managers"]),
    ("3.11", "2022", ["速度提升 10-60%", "异常组 ExceptionGroup", "TaskGroup"]),
    ("3.12", "2023", ["f-string 嵌套", "类型参数语法", "性能改进"]),
    ("3.13", "2024", ["实验性自由线程(no-GIL)", "JIT 编译器", "改进的交互式 REPL"]),
]

print(f"{'版本':<8} {'年份':<6} {'重要特性'}")
print("-" * 70)
for version, year, features in version_features:
    feature_str = "; ".join(features)
    print(f"  {version:<6} {year:<6} {feature_str}")

# ---- 6. 版本兼容性判断 ----
print("\\n========== 6. 版本兼容性判断 ==========")
def check_compatibility(required_version, current_version_info):
    """检查当前 Python 版本是否满足要求"""
    req_major, req_minor = required_version
    cur_major = current_version_info.major
    cur_minor = current_version_info.minor
    if cur_major != req_major:
        return False, f"主版本不匹配（需要 {req_major}.x，当前 {cur_major}.x）"
    if cur_minor < req_minor:
        return False, f"版本过低（需要 >={req_major}.{req_minor}，当前 {cur_major}.{cur_minor}）"
    return True, f"兼容（需要 >={req_major}.{req_minor}，当前 {cur_major}.{cur_minor}）"

# 测试不同项目的版本要求
project_requirements = [
    ("项目A（用海象运算符）", (3, 8)),
    ("项目B（用 match/case）", (3, 10)),
    ("项目C（用 TaskGroup）", (3, 11)),
    ("项目D（用 f-string 嵌套）", (3, 12)),
    ("项目E（用 no-GIL）", (3, 13)),
]

print("各项目的 Python 版本要求 vs 当前环境:")
print(f"  当前环境: Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
print()
for project, req in project_requirements:
    compatible, reason = check_compatibility(req, sys.version_info)
    status = "✅" if compatible else "❌"
    print(f"  {status} {project}: 需要 >={req[0]}.{req[1]} → {reason}")

# ---- 7. pyenv 目录结构 ----
print("\\n========== 7. pyenv 目录结构 ==========")
pyenv_structure = """
~/.pyenv/
├── versions/                    # 所有已安装的 Python 版本
│   ├── 3.11.6/
│   │   ├── bin/
│   │   │   ├── python3.11       # Python 3.11.6 解释器
│   │   │   ├── pip3.11          # 对应的 pip
│   │   │   └── ...
│   │   ├── lib/python3.11/
│   │   │   └── site-packages/   # 该版本的全局包
│   │   └── include/
│   ├── 3.12.0/
│   │   └── ...（同上结构）
│   └── 3.13.0/
│       └── ...
├── shims/                       # 垫片目录（加到 PATH 最前）
│   ├── python                   # → 根据版本选择调用哪个
│   ├── python3
│   ├── pip
│   └── ...
├── version                      # 全局默认版本（文件内容是版本号）
└── plugins/                     # 插件目录
    └── pyenv-virtualenv/        # 虚拟环境插件
"""
print(pyenv_structure)

# ---- 8. pyenv 命令速查 ----
print("========== 8. pyenv 命令速查表 ==========")
commands = [
    ("pyenv install --list", "列出所有可安装版本"),
    ("pyenv install 3.12.0", "安装 Python 3.12.0"),
    ("pyenv uninstall 3.12.0", "卸载 Python 3.12.0"),
    ("pyenv versions", "列出已安装版本"),
    ("pyenv version", "显示当前版本"),
    ("pyenv global 3.12.0", "设置全局版本"),
    ("pyenv local 3.11.6", "设置项目本地版本"),
    ("pyenv shell 3.13.0", "设置当前 shell 版本"),
    ("pyenv which python", "查看 python 实际路径"),
    ("pyenv virtualenv 3.12.0 env", "创建虚拟环境"),
]

print(f"{'命令':<30} {'说明'}")
print("-" * 60)
for cmd, desc in commands:
    print(f"  {cmd:<28} {desc}")

# ---- 9. 完整工作流 ----
print("\\n========== 9. 完整工作流 ==========")
workflow = """
pyenv + venv 完整工作流:

1. 安装 Python 版本
   $ pyenv install 3.12.0
   $ pyenv install 3.11.6

2. 设置项目 Python 版本
   $ cd my-project
   $ pyenv local 3.12.0          # 创建 .python-version

3. 创建虚拟环境
   $ python -m venv .venv
   $ source .venv/bin/activate

4. 安装依赖
   $ pip install -r requirements.txt

5. 验证版本
   $ python --version            # Python 3.12.0
   $ which python                # .../.venv/bin/python

6. 退出
   $ deactivate

7. 切换到另一个项目（不同版本）
   $ cd ../other-project
   $ python --version            # Python 3.11.6（自动切换）
"""
print(workflow)

print("以上就是 pyenv 多版本管理的核心知识！")
print("pyenv 让你能在多个 Python 版本间自由切换，")
print("配合 venv 实现版本+包的双重隔离。")
`,
  },

  // =========================================================
  // 第六章：conda 与 IDE
  // =========================================================
  {
    id: "py-conda-ide",
    group: "环境搭建",
    icon: "🛠️",
    title: "conda 与 IDE",
    content: `## conda 与 IDE

本章介绍两个主题：**conda**（另一种环境管理方案，数据科学领域常用）和 **IDE**（集成开发环境，VS Code 与 PyCharm）。了解 conda 能让你在数据科学团队中游刃有余；选择合适的 IDE 能大幅提升开发效率。

### conda 简介

**conda** 是一个通用的**包管理器和环境管理器**，最初为 **Anaconda** 科学计算发行版开发。与 pip + venv 不同，conda 不仅能管理 Python 包，还能管理**非 Python 的依赖**（如 C 库、R 语言包），甚至能管理 **Python 解释器本身**。

#### conda vs pip + venv

| 对比维度 | conda | pip + venv |
| --- | --- | --- |
| **管理范围** | Python 包 + 非 Python 依赖 + Python 版本 | 仅 Python 包 |
| **包来源** | Anaconda 仓库（含编译好的二进制包） | PyPI（多为源码或 wheel） |
| **环境隔离** | 内置环境管理 | 需要 venv 模块 |
| **速度** | 较慢（依赖解析复杂） | 快（uv 更快） |
| **适用领域** | 数据科学、机器学习 | 通用 Python 开发 |
| **二进制包** | 预编译，无需本地编译 | wheel 也是预编译，但非 Python 依赖要单独装 |
| **学习成本** | 中等 | 低 |

#### 为什么数据科学用 conda

数据科学库（如 NumPy、SciPy、Pandas）依赖底层的 C/Fortran 库（如 BLAS、LAPACK、OpenSSL）。用 pip 安装时：
- 如果有预编译 wheel，能直接装
- 如果没有，需要从源码编译，要求本地有 C 编译器和这些科学库
- 不同操作系统的编译环境配置很麻烦

conda 的优势：所有包（包括底层 C 依赖）都**预编译好**，一条命令就能安装完整的科学计算栈，无需本地编译。

\`\`\`bash
# conda 安装 NumPy（连带 BLAS/LAPACK 一起装好）
conda install numpy

# pip 安装 NumPy（依赖系统的 BLAS，可能出问题）
pip install numpy
\`\`\`

### Anaconda vs Miniconda

| 发行版 | 大小 | 包含内容 | 适用人群 |
| --- | --- | --- | --- |
| **Anaconda** | ~3GB | Python + conda + 1500+ 科学计算包 | 数据科学新手、想要"开箱即用" |
| **Miniconda** | ~80MB | Python + conda（只有最小运行时） | 有经验用户、按需安装 |

**推荐**：安装 **Miniconda**，按需安装需要的包，避免 Anaconda 占用过多磁盘空间。

#### 安装 Miniconda

\`\`\`bash
# macOS（Intel）
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-x86_64.sh
bash Miniconda3-latest-MacOSX-x86_64.sh

# macOS（Apple Silicon M1/M2）
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-arm64.sh
bash Miniconda3-latest-MacOSX-arm64.sh

# Linux
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh

# Windows: 从官网下载 exe 安装包
\`\`\`

### conda 环境管理

\`\`\`bash
# 创建新环境
conda create --name myenv python=3.12   # 创建名为 myenv 的环境，Python 3.12

# 查看所有环境
conda env list                          # 或 conda info --envs

# 激活环境
conda activate myenv                    # 激活 myenv

# 退出环境
conda deactivate

# 删除环境
conda env remove --name myenv

# 导出环境（类似 pip freeze）
conda env export --name myenv > environment.yml

# 从文件创建环境
conda env create -f environment.yml
\`\`\`

#### environment.yml 示例

\`\`\`yaml
name: myproject
channels:
  - conda-forge                        # 推荐用 conda-forge 频道，包更全更新
dependencies:
  - python=3.12
  - numpy>=1.24
  - pandas>=2.0
  - matplotlib
  - pip                                # 也可以用 pip 装 conda 没有的包
  - pip:
    - requests                         # 用 pip 安装 requests
\`\`\`

### conda 包管理

\`\`\`bash
# 安装包
conda install numpy                    # 安装 numpy
conda install numpy=1.24               # 指定版本
conda install numpy pandas matplotlib  # 安装多个

# 从指定频道安装
conda install -c conda-forge scipy     # 从 conda-forge 频道安装

# 更新包
conda update numpy                     # 更新单个包
conda update --all                     # 更新所有包

# 卸载
conda remove numpy

# 查看已安装
conda list                             # 列出所有已安装包
conda list numpy                       # 查看指定包
\`\`\`

#### conda-forge 频道

**conda-forge** 是社区维护的 conda 包频道，比默认的 defaults 频道**包更全、更新更快**：

\`\`\`bash
# 设置 conda-forge 为默认频道
conda config --add channels conda-forge
conda config --set channel_priority strict
\`\`\`

### conda 的局限

1. **速度慢**：conda 的依赖解析算法较慢，有时安装要等很久
2. **包数量少**：PyPI 有 50 万+ 包，conda 仓库只有约 8000 个
3. **与 pip 混用问题**：在 conda 环境中混用 pip 可能导致依赖冲突
4. **体积大**：每个 conda 环境都包含完整 Python，占用空间多

### 现代 conda 替代品：mamba / micromamba

**mamba** 是 conda 的 C++ 重写版，速度更快：

\`\`\`bash
# 安装 mamba
conda install mamba -c conda-forge

# 用法与 conda 相同
mamba install numpy                    # 比 conda install 快很多
mamba create -n myenv python=3.12
\`\`\`

**micromamba** 是单文件版本，无需先装 conda：

\`\`\`bash
# 安装 micromamba（单文件）
curl -Ls https://micro.mamba.pm/api/micromamba/linux-64/latest | tar -xvj bin/micromamba
\`\`\`

### IDE：集成开发环境

**IDE（Integrated Development Environment）** 是集成了编辑器、调试器、终端、版本控制等功能的开发工具。选择合适的 IDE 能大幅提升开发效率。

### VS Code

**VS Code**（Visual Studio Code）是微软开发的**免费开源**代码编辑器，通过安装扩展可以变成强大的 Python IDE。它是目前**最流行**的 Python 开发工具。

#### 优点

- **免费开源**：个人和商业使用完全免费
- **轻量快速**：启动快，占用资源少
- **插件生态丰富**：超过 4 万个扩展
- **语言支持广**：一个编辑器写 Python/JS/Go/Rust/SQL 等
- **远程开发**：通过 SSH/容器/WSL 远程开发
- **AI 辅助**：集成 GitHub Copilot、Cursor 等 AI 工具
- **调试强大**：内置调试器，支持断点、变量查看、调用栈

#### 安装 Python 开发环境

1. 安装 VS Code：[code.visualstudio.com](https://code.visualstudio.com)
2. 安装 **Python 扩展**（Microsoft 出品）：提供语法高亮、智能提示、调试、Linting
3. 安装 **Pylance**：Python 语言服务器，提供更快的智能提示
4. 安装 **Python Debugger**：调试支持

#### 核心配置

\`\`\`json
// .vscode/settings.json 推荐配置
{
    "python.defaultInterpreterPath": ".venv/bin/python",
    "python.analysis.typeCheckingMode": "basic",
    "python.analysis.autoImportCompletions": true,
    "python.formatting.provider": "none",  // 用 Ruff 替代
    "[python]": {
        "editor.defaultFormatter": "charliermarsh.ruff",
        "editor.formatOnSave": true,
        "editor.tabSize": 4
    },
    "python.linting.enabled": true,
    "python.linting.ruffEnabled": true
}
\`\`\`

#### 推荐扩展

| 扩展 | 作用 |
| --- | --- |
| **Python** | Python 语言支持（必装） |
| **Pylance** | 快速智能提示和类型检查 |
| **Ruff** | 代码检查和格式化（替代 flake8 + black，超快） |
| **Python Debugger** | 调试 Python 代码 |
| **Jupyter** | 在 VS Code 中运行 Jupyter Notebook |
| **GitLens** | Git 增强，显示代码作者和提交历史 |
| **Remote SSH** | 远程开发 |
| **autoDocstring** | 自动生成文档字符串 |

#### 调试 Python 代码

VS Code 的调试功能非常强大：

1. 在代码行号左侧点击设置**断点**
2. 按 \`F5\` 启动调试（或点击"运行和调试"）
3. 调试时可以：
   - **逐行执行**（F10 单步跳过，F11 单步进入）
   - **查看变量**（左侧变量面板）
   - **调用栈**（查看函数调用链）
   - **监视表达式**（添加要监视的变量）
   - **交互式控制台**（在调试控制台执行代码）

\`\`\`json
// .vscode/launch.json 调试配置
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: 当前文件",
            "type": "debugpy",
            "request": "launch",
            "program": "\${file}",
            "console": "integratedTerminal",
            "justMyCode": true
        },
        {
            "name": "Python: FastAPI",
            "type": "debugpy",
            "request": "launch",
            "module": "uvicorn",
            "args": ["main:app", "--reload"],
            "console": "integratedTerminal"
        }
    ]
}
\`\`\`

### PyCharm

**PyCharm** 是 JetBrains 出品的**专业 Python IDE**，功能最全面，适合专业 Python 开发者。分为社区版（免费）和专业版（付费）。

#### 版本对比

| 特性 | 社区版（免费） | 专业版（付费） |
| --- | --- | --- |
| Python 开发 | ✅ | ✅ |
| 调试 | ✅ | ✅ |
| Git 集成 | ✅ | ✅ |
| Web 框架（Django/Flask/FastAPI） | ❌ | ✅ |
| 数据库工具 | ❌ | ✅ |
| 远程开发 | ❌ | ✅ |
| Jupyter Notebook | ❌ | ✅ |
| 前端开发（JS/TS/CSS） | ❌ | ✅ |

#### 优点

- **功能最全**：开箱即用，几乎不需要配置
- **智能提示强大**：JetBrains 的代码分析业界顶尖
- **重构工具**：强大的重命名、提取方法等重构功能
- **数据库工具**（专业版）：内置数据库管理，直接写 SQL
- **Web 框架支持**（专业版）：Django/Flask 模板、路由跳转
- **远程开发**（专业版）：SSH、Docker、WSL 远程开发

#### 缺点

- **重量级**：启动慢，占用内存大（2-4GB）
- **社区版功能有限**：Web 开发需要专业版
- **专业版较贵**：个人版 \$149/年，商业版更贵
- **仅限 Python**：不像 VS Code 能写多种语言

#### 核心配置

PyCharm 的配置通过 GUI 完成（\`Settings/Preferences\`）：

- **Project Interpreter**：选择虚拟环境的 Python 解释器
- **Code Style**：配置代码格式（缩进、行长度等）
- **Keymap**：快捷键映射（可选 VS Code 风格）
- **Plugins**：安装插件扩展功能

### VS Code vs PyCharm

| 对比维度 | VS Code | PyCharm |
| --- | --- | --- |
| **价格** | 免费 | 社区版免费 / 专业版付费 |
| **启动速度** | 快 | 慢 |
| **内存占用** | 低（500MB-1GB） | 高（2-4GB） |
| **功能** | 靠插件扩展 | 开箱即用 |
| **多语言** | ✅ 一个编辑器写所有语言 | ❌ 主要写 Python |
| **调试** | 好 | 最好 |
| **重构** | 好 | 最好 |
| **远程开发** | 好（Remote SSH） | 好（专业版） |
| **AI 辅助** | GitHub Copilot | AI Assistant |
| **学习成本** | 低 | 中 |
| **适合人群** | 大多数开发者 | 专业 Python 开发者 |

**选择建议**：
- **初学者 / 全栈开发者 / 多语言开发者** → VS Code
- **专职 Python 开发 / Django 大型项目** → PyCharm 专业版
- **数据科学** → VS Code + Jupyter 或 PyCharm 专业版
- **远程开发** → 两者都行，VS Code 更轻量

### 其他常用工具

#### Jupyter Notebook

**Jupyter Notebook** 是交互式编程环境，把代码、输出、图表、Markdown 文档组合在一个"笔记本"中，是**数据科学和机器学习的标配工具**。

\`\`\`bash
pip install jupyterlab            # 安装 JupyterLab（Jupyter 的增强版）
jupyter lab                       # 启动，自动打开浏览器
\`\`\`

#### Ruff

**Ruff** 是用 Rust 编写的超快 Python 代码检查和格式化工具，**一个工具替代 flake8 + black + isort + pyupgrade**：

\`\`\`bash
pip install ruff
ruff check .                      # 检查代码问题
ruff format .                     # 格式化代码
\`\`\`

#### IPython

增强版 Python REPL，提供语法高亮、自动补全、魔术命令：

\`\`\`bash
pip install ipython
ipython                           # 启动
\`\`\`

### 本节代码演示

下面这段代码探索 IDE 相关的概念：模拟调试断点、展示代码静态分析、生成 IDE 配置文件模板。运行后你会理解 IDE 背后的工作原理。`,
    code: `# ============================================================
# 第六章代码演示：IDE 与工具链
# ============================================================
# 本代码用标准库探索开发工具相关概念：
#   - 调试原理（断点、变量检查）
#   - 代码静态分析（AST）
#   - IDE 配置文件生成
#   - 开发工具链概览

import ast
import json
import sys
import inspect

# ---- 1. 模拟调试器的工作原理 ----
print("========== 1. 调试器工作原理 ==========")
# 调试器的核心功能：断点、单步执行、变量检查

def buggy_function(numbers):
    """一个有 bug 的函数：试图除以零"""
    total = sum(numbers)                    # 计算总和
    average = total / len(numbers)          # 计算平均值（可能除零）
    result = []
    for i, n in enumerate(numbers):
        normalized = n / average            # 标准化
        result.append(round(normalized, 2))
    return result

# 模拟调试：逐步执行并检查变量
print("模拟调试 buggy_function([10, 20, 30]):")
print("  [断点 1] 函数入口，参数 numbers = [10, 20, 30]")

numbers = [10, 20, 30]
total = sum(numbers)
print(f"  [断点 2] total = sum(numbers) = {total}")

average = total / len(numbers)
print(f"  [断点 3] average = total / len(numbers) = {average}")

result = []
for i, n in enumerate(numbers):
    normalized = n / average
    result.append(round(normalized, 2))
    print(f"  [断点 4] 循环 i={i}, n={n}, normalized={normalized:.4f}")

print(f"  [返回] result = {result}")

# 模拟触发异常
print("\\n模拟调试 buggy_function([])（触发除零错误）:")
try:
    buggy_function([])
except ZeroDivisionError as e:
    print(f"  [异常捕获] {type(e).__name__}: {e}")
    print(f"  [调试信息] 异常发生在: average = total / len(numbers)")
    print(f"  [调试信息] len(numbers) = 0，导致除零")

# ---- 2. 代码静态分析（AST）----
print("\\n========== 2. 代码静态分析（AST）==========")
# IDE 的智能提示和检查基于 AST（抽象语法树）
sample_code = """
def calculate_bmi(weight, height):
    bmi = weight / (height ** 2)
    if bmi < 18.5:
        return "偏瘦"
    elif bmi < 24:
        return "正常"
    else:
        return "偏胖"

result = calculate_bmi(70, 1.75)
print(result)
"""

# 解析为 AST
tree = ast.parse(sample_code)
print("代码的 AST 结构:")
print(f"  根节点类型: {type(tree).__name__}")
print(f"  顶层语句数: {len(tree.body)}")

# 分析每个语句
for node in tree.body:
    if isinstance(node, ast.FunctionDef):
        print(f"\\n  函数定义: {node.name}")
        args = [arg.arg for arg in node.args.args]
        print(f"    参数: {args}")
        # 统计函数内的语句
        func_body = node.body
        print(f"    语句数: {len(func_body)}")
        for stmt in func_body:
            stmt_type = type(stmt).__name__
            print(f"      - {stmt_type}")
    elif isinstance(node, ast.Assign):
        targets = [t.id for t in node.targets if isinstance(t, ast.Name)]
        print(f"\\n  赋值语句: {targets}")

# ---- 3. 查看函数信息（反射）----
print("\\n========== 3. 反射：查看函数信息 ==========")
# IDE 的"跳转到定义"、"查看文档"等功能基于反射

def sample_func(a, b, c=10, *args, **kwargs):
    """这是一个示例函数。
    
    用于演示如何通过反射获取函数信息。
    IDE 的智能提示就基于这些信息。
    """
    pass

print(f"函数名: {sample_func.__name__}")
print(f"文档: {sample_func.__doc__.strip()}")
sig = inspect.signature(sample_func)
print(f"签名: {sig}")

print("\\n参数详情:")
for name, param in sig.parameters.items():
    print(f"  {name}: kind={param.kind.name}, default={param.default}")

# ---- 4. 生成 VS Code 配置模板 ----
print("\\n========== 4. VS Code 配置模板 ==========")
vscode_settings = {
    "python.defaultInterpreterPath": ".venv/bin/python",
    "python.analysis.typeCheckingMode": "basic",
    "python.analysis.autoImportCompletions": True,
    "[python]": {
        "editor.defaultFormatter": "charliermarsh.ruff",
        "editor.formatOnSave": True,
        "editor.tabSize": 4,
        "editor.rulers": [88]
    },
    "python.terminal.executeInFileDir": True,
    "files.exclude": {
        "**/__pycache__": True,
        "**/.venv": True,
        "**/*.pyc": True
    }
}

print("settings.json:")
print(json.dumps(vscode_settings, indent=2, ensure_ascii=False))

# ---- 5. 生成 launch.json 调试配置 ----
print("\\n========== 5. 调试配置 launch.json ==========")
launch_config = {
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: 当前文件",
            "type": "debugpy",
            "request": "launch",
            "program": "\${file}",
            "console": "integratedTerminal",
            "justMyCode": True
        },
        {
            "name": "Python: 模块",
            "type": "debugpy",
            "request": "launch",
            "module": "uvicorn",
            "args": ["main:app", "--reload"],
            "console": "integratedTerminal"
        }
    ]
}

print("launch.json:")
print(json.dumps(launch_config, indent=2, ensure_ascii=False))

# ---- 6. Python 工具链概览 ----
print("\\n========== 6. Python 工具链概览 ==========")
toolchain = {
    "环境管理": {
        "venv": "标准库虚拟环境（推荐日常使用）",
        "uv": "现代一体化工具（Rust，极速，推荐新项目）",
        "pyenv": "多 Python 版本管理",
        "conda": "数据科学环境管理（含非 Python 依赖）",
    },
    "包管理": {
        "pip": "官方包管理器（最通用）",
        "uv pip": "pip 的快速替代品",
        "poetry": "现代项目管理工具",
        "conda": "科学计算包管理",
    },
    "代码质量": {
        "ruff": "代码检查+格式化（Rust，最快，推荐）",
        "black": "代码格式化",
        "flake8": "代码检查",
        "mypy": "静态类型检查",
        "isort": "import 排序",
    },
    "测试": {
        "pytest": "测试框架（推荐）",
        "unittest": "标准库测试框架",
        "coverage": "测试覆盖率",
    },
    "IDE/编辑器": {
        "VS Code": "免费、轻量、插件丰富（推荐大多数人）",
        "PyCharm": "专业 Python IDE（功能最全）",
        "Jupyter": "数据科学交互式环境",
        "Vim/Neovim": "高效可定制（资深用户）",
    },
}

for category, tools in toolchain.items():
    print(f"\\n  【{category}】")
    for tool, desc in tools.items():
        print(f"    {tool:<12} {desc}")

# ---- 7. 开发环境检查清单 ----
print("\\n========== 7. 开发环境检查清单 ==========")
checklist = [
    ("Python 解释器", "python3 --version", sys.version.split()[0]),
    ("虚拟环境工具", "python3 -m venv", "标准库自带"),
    ("包管理器", "pip / uv", "pip 自带，uv 需安装"),
    ("IDE", "VS Code / PyCharm", "按需选择"),
    ("代码检查", "ruff", "pip install ruff"),
    ("测试框架", "pytest", "pip install pytest"),
    ("格式化", "ruff format / black", "pip install ruff"),
    ("类型检查", "mypy", "pip install mypy"),
    ("Git", "git --version", "版本控制必备"),
]

print(f"{'工具':<15} {'检查命令':<25} {'当前/说明'}")
print("-" * 65)
for tool, cmd, current in checklist:
    print(f"  {tool:<13} {cmd:<25} {current}")

# ---- 8. Python 版本与工具兼容性 ----
print("\\n========== 8. 当前环境信息 ==========")
print(f"Python 版本: {sys.version}")
print(f"平台: {sys.platform}")
print(f"解释器路径: {sys.executable}")
print(f"字节序: {sys.byteorder}")

# 检查一些关键特性是否可用
features = [
    ("海象运算符 :=", sys.version_info >= (3, 8)),
    ("仅位置参数 /", sys.version_info >= (3, 8)),
    ("字典合并 |", sys.version_info >= (3, 9)),
    ("match/case", sys.version_info >= (3, 10)),
    ("TaskGroup", sys.version_info >= (3, 11)),
    ("f-string 嵌套", sys.version_info >= (3, 12)),
    ("自由线程(no-GIL)", sys.version_info >= (3, 13)),
]

print("\\n当前 Python 版本支持的特性:")
for feature, supported in features:
    status = "✅" if supported else "❌"
    print(f"  {status} {feature}")

# ---- 9. 完整开发环境搭建流程 ----
print("\\n========== 9. 完整开发环境搭建 ==========")
setup_guide = """
Python 开发环境完整搭建流程（推荐方案）:

1. 安装 Python 版本管理
   $ brew install uv              # macOS
   $ curl -LsSf https://astral.sh/uv/install.sh | sh  # Linux

2. 安装 Python
   $ uv python install 3.12

3. 创建项目
   $ uv init my-project
   $ cd my-project

4. 安装 VS Code + Python 扩展
   - 下载 VS Code
   - 安装 Python 扩展
   - 安装 Ruff 扩展

5. 配置 VS Code
   - Ctrl+Shift+P → "Python: Select Interpreter" → 选 .venv
   - 配置 settings.json（见上文）

6. 开始开发
   $ uv add requests              # 添加依赖
   $ uv run python main.py        # 运行代码
   $ uv run pytest                # 运行测试

7. 代码质量工具
   $ uv add --dev ruff pytest mypy
   $ uv run ruff check .          # 检查代码
   $ uv run ruff format .         # 格式化
   $ uv run mypy .                # 类型检查
"""
print(setup_guide)

print("以上就是 conda 与 IDE 的核心知识！")
print("至此，Python 环境搭建的六大主题全部讲完：")
print("  1. Python 解释器")
print("  2. pip 包管理器")
print("  3. venv 虚拟环境")
print("  4. uv 现代包管理")
print("  5. pyenv 多版本管理")
print("  6. conda 与 IDE")
print("打好环境基础，后续学习事半功倍！")
`,
  },
];
