// =============================================================
// Python 交互式教程 —— 第一批章节（基础组，共 4 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. py-intro      — Python 简介
//   2. py-variables  — 变量与数据类型
//   3. py-strings    — 字符串
//   4. py-operators  — 运算符与表达式
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（本批为"基础"）
//   content : Markdown 格式的详细讲解（文字量大，含大量 demo）
//   code    : 可运行、带详细中文注释的 Python 示例代码
//
// 代码运行环境约束：
//   - 用 python3 直接运行，5 秒超时
//   - 仅使用 Python 标准库
//   - 通过 print 输出结果
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：Python 简介
  // =========================================================
  {
    id: "py-intro",
    group: "基础",
    icon: "🐍",
    title: "Python 简介",
    content: `## 什么是 Python？

**Python** 是一门**高级、通用、解释型、动态类型**的编程语言。它由 **Guido van Rossum（吉多·范罗苏姆）** 于 1989 年圣诞节期间开始构思，1991 年正式对外发布。Python 的设计哲学强调**代码的可读性和简洁性**，让程序员能用更少的代码行表达复杂的逻辑。Python 官方的格言是"**人生苦短，我用 Python**"（Life is short, you need Python），这完美概括了它的设计目标：**让编程变得简单、高效、有趣**。

Python 既支持面向过程编程，也支持面向对象编程，还支持函数式编程的部分特性。它拥有庞大而活跃的社区和极其丰富的第三方库生态，被广泛应用于 Web 开发、数据分析、人工智能、自动化运维、科学计算、爬虫、桌面应用、游戏开发等几乎所有计算机领域。在过去的十几年里，Python 多次被评为"年度编程语言"，并长期占据 TIOBE、PyPL、Stack Overflow 等各大语言流行度排行榜的前列。

### Python 的诞生与历史

#### 创始人：Guido van Rossum

Guido van Rossum 是一位荷兰程序员。1982 年从阿姆斯特丹大学数学与计算机科学专业毕业后，他在 CWI（荷兰国家数学与计算机科学研究所）工作。在那里，他参与了 ABC 语言的开发工作。ABC 是一门教学语言，设计目标是替代 BASIC，它有很多优秀的特性（如交互式、缩进定义代码块、强大的数据类型），但因为各种原因没有取得商业上的成功。

Guido 从 ABC 语言中汲取了大量灵感，这些灵感后来成为了 Python 的核心设计：**用缩进而非花括号来定义代码块**、**强类型但动态类型**、**交互式解释器**、**丰富的内置数据类型**。

#### 1989 年圣诞节：Python 的起点

1989 年圣诞节假期，Guido 在 CWI 实验室里想找点有意思的事情做。他决定写一个新的脚本语言解释器，作为 ABC 语言的继承者，同时解决当时 Unix shell 脚本和 C 语言之间的"中间地带"问题——shell 脚本写起来方便但功能有限，C 语言功能强大但开发效率低。他希望创造一门**既有 shell 的易用性，又有 C 的强大能力**的语言。

#### Python 命名的由来

很多人以为 Python 这个名字和蟒蛇有关。实际上，Guido 是英国喜剧团体 **Monty Python（蒙提·派森）** 的忠实粉丝。他喜欢用 Monty Python 的短剧和笑话来命名项目（之前的项目叫"Briefcase"、"BTW"等）。"Python"这个名字正是来自 Monty Python's Flying Circus（蒙提·派森的飞行马戏团），而不是那种大蛇。不过，后来 Python 社区也欣然接受了蛇这个形象标志，官方 logo 上就是两条蛇。

#### 版本演进时间线

| 版本 | 发布年份 | 重要特性 |
| --- | --- | --- |
| Python 0.9.0 | 1991 | 首次发布，已有类、异常、模块、字典等核心特性 |
| Python 1.0 | 1994 | 加入 lambda、map、filter、reduce 等函数式工具 |
| Python 2.0 | 2000 | 加入垃圾回收、列表推导式、Unicode 字符串 |
| Python 2.4 | 2004 | 加入装饰器 @decorator |
| Python 2.5 | 2006 | 加入 with 语句 |
| Python 2.7 | 2010 | Python 2 系列最后一个版本，长期维护至 2020 年 |
| Python 3.0 | 2008 | 重大不兼容更新：print 为函数、Unicode 默认、整数除法等 |
| Python 3.6 | 2016 | f-string、类型注解、变量注解 |
| Python 3.8 | 2019 | 海象运算符 :=、仅位置参数 / |
| Python 3.10 | 2021 | 结构化模式匹配 match/case、更好的错误提示 |
| Python 3.12 | 2023 | 性能改进、f-string 嵌套、类型参数语法 |
| Python 3.13 | 2024 | 实验性自由线程（移除 GIL）、JIT 编译器 |
| Python 3.14 | 2025 | 自由线程逐步稳定、JIT 编译器优化 |

### Python 2 与 Python 3 的区别

Python 3.0 是一次**不向后兼容**的重大升级。Guido 认为 Python 2 中积累了很多设计缺陷（如 Unicode 处理混乱、print 语句而非函数、整数除法自动取整等），与其修补不如推倒重来。主要区别包括：

\`\`\`python
# ---- Python 2 ----
print "Hello"           # print 是语句
print("Hello")          # 也能用，但行为不同
5 / 2                   # 结果是 2（整数除法）
str                     # 字节串
unicode                 # 字符串
# xrange()              # 惰性迭代器

# ---- Python 3 ----
print("Hello")          # print 是函数
5 / 2                   # 结果是 2.5（真除法）
5 // 2                  # 结果是 2（地板除）
str                     # 字符串（Unicode）
bytes                   # 字节串
range()                 # 本身就是惰性迭代器
\`\`\`

Python 2 已于 **2020 年 1 月 1 日**正式停止维护。现在所有新项目都应使用 Python 3。本教程基于 **Python 3**。

### Python 的主要特点

#### 1. 简洁优雅，可读性极高

Python 的语法设计极为注重可读性。它用**缩进**代替花括号来表示代码块，去掉了多余的分号和花括号，让代码看起来像伪代码一样清晰：

\`\`\`python
# Python：简洁清晰
def is_adult(age):       # 定义函数 is_adult，接收参数 age
    if age >= 18:        # 判断年龄是否大于等于 18 岁
        return True      # 成年，返回 True
    else:                # 否则
        return False     # 未成年，返回 False

# 对比 Java 同样的代码要写更多样板
# public boolean isAdult(int age) {
#     if (age >= 18) {
#         return true;
#     } else {
#         return false;
#     }
# }
\`\`\`

#### 2. 解释型语言

Python 代码不需要编译成机器码，而是由解释器逐行执行。具体来说，CPython（官方实现）会先把源代码编译成**字节码**（.pyc 文件），再由**虚拟机**解释执行字节码。这使得 Python 的开发-运行周期极短，修改代码后立即可以看到结果。

#### 3. 动态类型

变量不需要声明类型，赋值时自动确定类型，且可以随时改变：

\`\`\`python
x = 42          # x 现在是整数
x = "hello"     # x 现在是字符串，完全合法
x = [1, 2, 3]   # x 现在是列表
\`\`\`

#### 4. 强类型

虽然是动态类型，但 Python 是**强类型**语言：不会进行隐式类型转换。

\`\`\`python
"3" + 5         # ❌ TypeError：不能把字符串和数字相加
"3" + str(5)    # ✅ "35"（需要显式转换）
int("3") + 5    # ✅ 8
\`\`\`

#### 5. 面向对象

Python 中一切皆对象。数字、字符串、函数、类本身都是对象，都有类型、属性和方法：

\`\`\`python
print(type(42))         # <class 'int'>
print(type("hello"))    # <class 'str'>
print(type(len))        # <class 'builtin_function_or_method'>
\`\`\`

#### 6. 自动内存管理

Python 有内置的**垃圾回收器（Garbage Collector）**，自动管理内存的分配和回收。程序员不需要手动 malloc/free，大大减少了内存泄漏和悬垂指针的问题。Python 主要使用**引用计数**机制，辅以**分代回收**处理循环引用。

#### 7. 跨平台

Python 是跨平台的，同一份 Python 代码可以在 Windows、macOS、Linux、甚至树莓派上运行，不需要修改。只要目标平台安装了对应版本的 Python 解释器即可。

#### 8. "内置电池"（Batteries Included）

Python 标准库极其丰富，涵盖了网络通信、文件处理、正则表达式、加密、数据库接口、操作系统交互、多线程、HTML/XML 解析等几乎所有常见需求。很多任务不需要安装任何第三方库就能完成。

#### 9. 庞大的第三方生态

Python 拥有世界上最庞大的第三方包生态——**PyPI（Python Package Index）**上目前有超过 50 万个可安装的包。通过 \`pip install\` 命令可以一键安装。无论是数据分析（NumPy、Pandas）、机器学习（PyTorch、TensorFlow、scikit-learn）、Web 框架（Django、Flask、FastAPI）、爬虫（Scrapy、BeautifulSoup），都有成熟的开源方案。

### Python 的应用领域

#### Web 开发

Python 有多个成熟的 Web 框架：

- **Django**：全功能框架，"内置电池"理念，适合大型项目。Instagram、Pinterest 等知名网站使用 Django。
- **Flask**：轻量微框架，灵活度高，适合中小型项目和 API。
- **FastAPI**：现代高性能框架，支持异步、自动生成 OpenAPI 文档，近年非常流行。

#### 数据科学与分析

- **NumPy**：科学计算基础库，提供高性能的多维数组。
- **Pandas**：数据分析利器，提供 DataFrame 数据结构，类似 Excel 的编程版。
- **Matplotlib / Seaborn**：数据可视化。
- **Jupyter Notebook**：交互式数据分析环境。

#### 人工智能与机器学习

Python 是 AI 领域的绝对主流语言：

- **PyTorch**：Meta（Facebook）开源的深度学习框架，学术界首选。
- **TensorFlow**：Google 开源的深度学习框架。
- **scikit-learn**：传统机器学习算法库。
- **Hugging Face Transformers**：自然语言处理大模型库。

#### 自动化与脚本

Python 非常适合编写自动化脚本：批量重命名文件、处理 Excel/CSV、定时任务、系统运维自动化、自动化测试等。很多运维工程师用 Python 替代 Bash 脚本。

#### 网络爬虫

- **Scrapy**：功能强大的爬虫框架。
- **BeautifulSoup / lxml**：HTML/XML 解析。
- **Selenium / Playwright**：浏览器自动化。

#### 科学计算

- **SciPy**：科学计算库。
- **SymPy**：符号数学。
- **Astropy**：天文学计算。

#### 桌面应用

- **Tkinter**：Python 自带的 GUI 库。
- **PyQt / PySide**：基于 Qt 的强大 GUI 框架。
- **Kivy**：跨平台、支持移动端的 GUI。

#### 游戏开发

- **Pygame**：2D 游戏开发库，适合初学者学习游戏编程。

### Python 的运行原理

#### CPython 解释器

当你运行 \`python3 hello.py\` 时，CPython 解释器会经历以下步骤：

1. **词法分析（Lexing）**：把源代码字符串分解成一个个**词法单元（Token）**，如关键字、标识符、运算符、字面量等。
2. **语法分析（Parsing）**：把 Token 序列组织成**抽象语法树（AST）**，检查语法是否正确。
3. **编译为字节码（Compilation）**：把 AST 编译成 Python 字节码。字节码是平台无关的中间代码，存储在 \`.pyc\` 文件中（\`__pycache__\` 目录下）。如果源文件没修改，下次运行直接用缓存的 \`.pyc\`，跳过编译步骤。
4. **解释执行（Execution）**：Python 虚拟机（PVM）逐条解释执行字节码。

\`\`\`
源代码 .py  →  词法分析  →  语法分析(AST)  →  编译  →  字节码 .pyc  →  PVM 执行
\`\`\`

注意：Python **不是**纯解释型语言——它有编译步骤，只是编译成字节码而非机器码。与 Java 类似（Java 编译成 .class 字节码再由 JVM 执行），只是 Python 把编译过程对用户透明化了。

#### GIL（全局解释器锁）

CPython 中有一个著名的 **GIL（Global Interpreter Lock）**。它是一个互斥锁，确保同一时刻只有一个线程在执行 Python 字节码。这意味着 CPython 的多线程**不能真正并行执行 CPU 密集型任务**。但对于 I/O 密集型任务（网络请求、文件读写），GIL 会在 I/O 阻塞时释放，多线程仍然有效。

要实现真正的并行，可以使用：
- **multiprocessing** 模块：多进程，每个进程有独立的 GIL。
- **C 扩展**：在 C 层释放 GIL。
- **Python 3.13+** 的实验性自由线程（no-GIL）模式。

### Python 与其他语言对比

| 对比维度 | Python | Java | C++ | JavaScript | Go |
| --- | --- | --- | --- | --- | --- |
| **类型系统** | 动态强类型 | 静态强类型 | 静态强类型 | 动态弱类型 | 静态强类型 |
| **执行方式** | 解释执行（字节码） | 编译为字节码+JVM | 编译为机器码 | 解释执行(JIT) | 编译为机器码 |
| **运行速度** | 较慢 | 较快 | 最快 | 中等 | 很快 |
| **开发效率** | 极高 | 高 | 中 | 高 | 高 |
| **学习难度** | 低 | 中 | 高 | 中 | 低 |
| **内存管理** | 自动（GC） | 自动（GC） | 手动+RAII | 自动（GC） | 自动（GC） |
| **代码风格** | 缩进 | 花括号 | 花括号 | 花括号 | 花括号 |
| **并发模型** | GIL 限制 | 多线程 | 多线程 | 事件循环 | Goroutine |
| **主要领域** | AI/数据/Web | 企业级/Android | 系统/游戏 | 前端/Node | 后端/云原生 |

**Python 的优势**：开发效率极高、学习门槛低、AI/数据科学领域生态无敌。
**Python 的劣势**：运行速度较慢（对性能敏感的场景不适用）、GIL 限制多线程并行。

### Python 的安装

#### Windows

1. 访问 [python.org/downloads](https://www.python.org/downloads/) 下载安装包。
2. 运行安装程序，**务必勾选 "Add Python to PATH"**。
3. 安装完成后打开命令提示符验证：

\`\`\`bash
python --version    # 应输出 Python 3.x.x
\`\`\`

#### macOS

macOS 自带 Python 2（较老系统）或没有 Python。推荐用 Homebrew 安装：

\`\`\`bash
brew install python3     # 用 Homebrew 安装 Python 3
python3 --version        # 验证安装的 Python 版本
\`\`\`

#### Linux

大多数 Linux 发行版自带 Python 3。如需安装：

\`\`\`bash
# Ubuntu / Debian
sudo apt update && sudo apt install python3   # 更新源并安装 Python 3

# CentOS / RHEL
sudo yum install python3   # 用 yum 安装 Python 3

# 验证
python3 --version          # 检查安装是否成功
\`\`\`

#### 多版本管理

如果需要同时使用多个 Python 版本，推荐：

- **pyenv**：在用户级别安装和管理多个 Python 版本，不影响系统。
- **conda / miniconda**：Anaconda 提供的版本管理和环境管理工具，数据科学领域常用。

### 第一个 Python 程序

#### 方式一：编写脚本文件

创建文件 \`hello.py\`：

\`\`\`python
# hello.py
print("Hello, World!")    # 打印字符串到标准输出
\`\`\`

在终端运行：

\`\`\`bash
python3 hello.py          # 运行脚本文件 hello.py
# 输出: Hello, World!
\`\`\`

#### 方式二：一行命令

\`\`\`bash
python3 -c "print('Hello, World!')"   # -c 选项直接执行字符串中的 Python 代码
\`\`\`

#### Hello World 的含义

\`print()\` 是 Python 的内置函数，用于向标准输出打印内容。\`"Hello, World!"\` 是一个字符串字面量。这行代码虽然简单，但已经展示了 Python 的几个核心特性：函数调用、字符串字面量、语句不需要分号结尾。

### REPL 交互式环境

**REPL**（Read-Eval-Print Loop，读取-求值-输出循环）是 Python 的交互式解释器。在终端输入 \`python3\` 即可进入：

\`\`\`
$ python3
Python 3.14.0 (main, Oct  7 2025, 10:00:00)
[Clang 15.0.0 (clang-1500.0.40.1)] on darwin
Type "help", "copyright", "credits" or "license" for more information.
>>> 2 + 3
5
>>> name = "Python"
>>> print(f"Hello, {name}!")
Hello, Python!
>>> exit()
\`\`\`

REPL 的用途：
- **快速实验**：验证一行代码的效果，不需要创建文件。
- **学习探索**：随时查看函数文档（\`help(print)\`）、测试语法。
- **调试**：在交互环境中逐步执行代码。

常用 REPL 技巧：
- \`dir(obj)\`：查看对象的所有属性和方法。
- \`help(func)\`：查看函数文档。
- \`_ \`：上一个表达式的结果。
- 上下方向键：浏览历史命令。
- \`exit()\` 或 \`Ctrl+D\`：退出 REPL。

### Python 代码风格：PEP 8

**PEP**（Python Enhancement Proposal，Python 增强提案）是 Python 社区提交改进建议的文档体系。其中 **PEP 8** 是 Python 的官方代码风格指南，由 Guido van Rossum 本人撰写。遵循 PEP 8 能让代码风格统一、可读性强。

#### PEP 8 核心规则

**1. 缩进：用 4 个空格，不用 Tab**

\`\`\`python
# ✅ 正确
def func():                  # 定义函数 func
    if True:                 # 用 4 个空格缩进表示代码块
        print("4 个空格缩进")  # 输出提示文字

# ❌ 错误（用 Tab）
def func():                 # 同名函数（仅作错误示范）
	if True:                # 用 Tab 缩进，PEP 8 不允许
		print("不要用 Tab")  # 与上面 4 空格混用会导致 IndentationError
\`\`\`

**2. 行长度：每行不超过 79 字符（文档/注释不超过 72）**

\`\`\`python
# ✅ 过长时用括号换行
result = (first_variable      # 用括号包裹实现跨行书写
          + second_variable   # 每行放一个操作数并对齐
          + third_variable)   # 最后一行闭合括号
\`\`\`

**3. 命名规范**

| 类型 | 规范 | 示例 |
| --- | --- | --- |
| 变量、函数 | 小写 + 下划线 | \`user_name\`, \`get_data()\` |
| 类 | 驼峰命名 | \`MyClass\`, \`HttpClient\` |
| 常量 | 全大写 + 下划线 | \`MAX_SIZE\`, \`PI\` |
| 模块 | 小写 + 下划线 | \`my_module.py\` |
| 私有成员 | 前缀下划线 | \`_private_var\` |
| 魔术方法 | 双下划线前后缀 | \`__init__\`, \`__str__\` |

**4. 运算符两侧加空格**

\`\`\`python
# ✅ 正确
x = a + b    # 运算符两侧各加一个空格
y = x * 2    # 提高可读性

# ❌ 错误
x=a+b        # 没有空格，可读性差
\`\`\`

**5. 逗号后加空格**

\`\`\`python
# ✅ 正确
nums = [1, 2, 3, 4]   # 逗号后加空格
func(a, b, c)         # 参数间逗号后加空格

# ❌ 错误
nums = [1,2,3,4]      # 逗号后无空格，可读性差
\`\`\`

**6. 导入规范**

\`\`\`python
# ✅ 每个导入单独一行
import os      # 导入 os 模块
import sys     # 导入 sys 模块

# ✅ 从同一模块导入多个可以写一行
from typing import List, Dict, Optional   # 从 typing 导入多个类型

# ❌ 不要这样
import os, sys  # 不要在一行导入多个模块
\`\`\`

导入顺序建议：标准库 → 第三方库 → 本地模块，每组之间空一行。

**7. 函数和类之间空两行**

\`\`\`python
class MyClass:           # 定义类 MyClass
    pass                 # pass 是空语句占位


def my_function():       # 定义函数，与类之间空两行
    pass                 # 函数体占位
\`\`\`

**8. 字符串引号：单引号和双引号均可，但项目内要统一**

Python 不区分单引号和双引号，PEP 8 不强制要求用哪种，但建议在同一项目中保持一致。

#### 工具辅助

- **black**：自动格式化工具，"不妥协"的代码格式化器。
- **flake8 / pylint**：代码检查工具，检测 PEP 8 违规和潜在错误。
- **isort**：自动排序 import 语句。
- **ruff**：新一代超快的代码检查和格式化工具（Rust 实现）。

### Python 之禅（The Zen of Python）

在 Python REPL 中输入 \`import this\`，会看到 Tim Peters 撰写的"Python 之禅"——19 条 Python 设计哲学。其中几条核心理念：

- **优美胜于丑陋**（Beautiful is better than ugly）
- **明确胜于隐晦**（Explicit is better than implicit）
- **简单胜于复杂**（Simple is better than complex）
- **可读性很重要**（Readability counts）
- **应该有一种——最好只有一种——显而易见的方式来做每件事**（There should be one-- and preferably only one --obvious way to do it）
- **如果实现很难解释，那它可能不是好主意**（If the implementation is hard to explain, it's a bad idea）

### 常用开发工具与 IDE

| 工具 | 特点 | 适合人群 |
| --- | --- | --- |
| **VS Code** | 免费、轻量、插件丰富、Python 扩展强大 | 大多数开发者 |
| **PyCharm** | JetBrains 出品，功能最全的 Python IDE | 专业 Python 开发者 |
| **Jupyter Notebook** | 交互式、可视化、适合探索 | 数据科学家 |
| **Vim / Neovim** | 高效、可定制、学习曲线陡 | 资深程序员 |
| **Sublime Text** | 轻量快速 | 轻度使用者 |
| **Thonny** | 专为教学设计、简单 | 初学者 |

### 本节代码演示

下面这段代码综合演示了 Python 的基本写法：输出、变量、字符串、列表、字典、函数、条件、循环。你可以在编辑器中修改后点击"运行代码"查看输出，直观感受 Python 的简洁与强大。`,
    code: `# ============================================================
# 第一章代码演示：Python 写法全景体验
# ============================================================
# 这段代码演示了 Python 的基本语法和常见特性，
# 包括：输出、变量、字符串、列表、字典、函数、条件、循环。
# 你可以修改任何部分后重新运行，观察结果变化。

import sys
import math

# ---- 1. 最经典的 Hello World ----
print("\\n========== 1. Hello World ==========")
print("Hello, World!")
print("你好，Python！")
# print 是一个函数，用括号调用，可以输出多种类型的数据
print(42)              # 输出数字
print(3.14)            # 输出浮点数
print([1, 2, 3])       # 输出列表
print({"name": "张三"}) # 输出字典

# ---- 2. 查看 Python 版本信息 ----
print("\\n========== 2. Python 版本信息 ==========")
print("Python 版本:", sys.version)
print("Python 版本号:", sys.version_info.major, ".", sys.version_info.minor)
print("当前平台:", sys.platform)

# ---- 3. 基本算术运算 ----
print("\\n========== 3. 基本算术运算 ==========")
print("加法: 2 + 3 =", 2 + 3)
print("减法: 10 - 4 =", 10 - 4)
print("乘法: 6 * 7 =", 6 * 7)
print("真除法: 7 / 2 =", 7 / 2)        # 结果是浮点数 3.5
print("地板除: 7 // 2 =", 7 // 2)      # 只取整数部分 3
print("取余: 7 % 3 =", 7 % 3)           # 7 除以 3 余 1
print("幂运算: 2 ** 10 =", 2 ** 10)     # 2 的 10 次方 = 1024
print("圆周率:", math.pi)
print("平方根:", math.sqrt(144))

# ---- 4. 变量与动态类型 ----
print("\\n========== 4. 变量与动态类型 ==========")
# Python 变量不需要声明类型，赋值即创建
name = "张三"          # 字符串
age = 28               # 整数
height = 1.75          # 浮点数
is_student = True      # 布尔值

# 用 type() 查看变量类型
print("name:", name, "类型:", type(name).__name__)
print("age:", age, "类型:", type(age).__name__)
print("height:", height, "类型:", type(height).__name__)
print("is_student:", is_student, "类型:", type(is_student).__name__)

# 动态类型：同一个变量可以指向不同类型的值
x = 42
print("x =", x, "类型:", type(x).__name__)
x = "现在变成字符串了"
print("x =", x, "类型:", type(x).__name__)

# ---- 5. 字符串与 f-string ----
print("\\n========== 5. 字符串与 f-string ==========")
# f-string：在字符串前加 f，用 {} 插入变量
message = f"你好，我叫{name}，今年{age}岁，身高{height}米"
print(message)

# 字符串方法
text = "  Hello, Python  "
print("原始:", repr(text))
print("strip 去空格:", text.strip())
print("转大写:", text.upper())
print("长度:", len(text.strip()))

# ---- 6. 列表（List）----
print("\\n========== 6. 列表 ==========")
fruits = ["苹果", "香蕉", "橘子"]
print("水果列表:", fruits)
print("第一个:", fruits[0])     # 索引从 0 开始
print("最后一个:", fruits[-1])  # -1 表示倒数第一个

# 添加和删除元素
fruits.append("葡萄")          # 末尾添加
print("添加后:", fruits)
fruits.insert(1, "芒果")       # 在索引 1 处插入
print("插入后:", fruits)
fruits.remove("香蕉")          # 按值删除
print("删除后:", fruits)
print("列表长度:", len(fruits))

# 列表切片
numbers = [10, 20, 30, 40, 50]
print("切片 [1:4]:", numbers[1:4])   # 取索引 1、2、3
print("切片 [:3]:", numbers[:3])     # 取前 3 个
print("切片 [2:]:", numbers[2:])     # 从索引 2 到末尾

# ---- 7. 字典（Dictionary）----
print("\\n========== 7. 字典 ==========")
person = {
    "name": "李四",
    "age": 30,
    "city": "北京",
    "hobbies": ["阅读", "编程", "旅行"],
}
print("字典:", person)
print("姓名:", person["name"])
print("年龄:", person.get("age"))
print("爱好:", person["hobbies"])

# 添加/修改键值对
person["email"] = "lisi@example.com"   # 新增
person["age"] = 31                      # 修改
print("更新后:", person)
print("所有键:", list(person.keys()))
print("所有值:", list(person.values()))

# ---- 8. 函数定义 ----
print("\\n========== 8. 函数 ==========")
# 用 def 关键字定义函数
def greet(name, greeting="你好"):
    """带默认参数的函数，返回问候语字符串"""
    return f"{greeting}，{name}！"

print(greet("王五"))               # 用默认问候
print(greet("赵六", "Hi"))         # 自定义问候

# 带类型注解的函数（Python 3.5+）
def add(a: int, b: int) -> int:
    """两数相加并返回结果"""
    return a + b

print("add(3, 5) =", add(3, 5))

# ---- 9. 条件语句 ----
print("\\n========== 9. 条件语句 ==========")
# Python 用 if/elif/else，注意冒号和缩进
score = 85
if score >= 90:
    grade = "优秀"
elif score >= 80:
    grade = "良好"
elif score >= 60:
    grade = "及格"
else:
    grade = "不及格"
print(f"成绩 {score} 分，等级: {grade}")

# 三元表达式：x if 条件 else y
status = "成年" if age >= 18 else "未成年"
print(f"年龄 {age}，状态: {status}")

# ---- 10. 循环 ----
print("\\n========== 10. 循环 ==========")
# for 循环遍历序列
print("for 循环遍历列表:")
for fruit in fruits:
    print(f"  - {fruit}")

# range() 生成数字序列
print("for 循环遍历 range:")
for i in range(5):
    print(f"  第 {i} 次循环")

# while 循环
print("while 循环:")
count = 0
while count < 3:
    print(f"  count = {count}")
    count += 1

# 列表推导式：Python 的特色简洁写法
squares = [i ** 2 for i in range(1, 6)]
print("列表推导式生成平方:", squares)

# ---- 11. 多行注释与文档字符串 ----
print("\\n========== 11. 文档字符串 ==========")
# 三引号字符串可以跨多行，常用作文档字符串
doc = """
这是一段多行字符串。
可以跨多行书写。
常用作函数或模块的文档说明。
"""
print(doc.strip())

# 查看函数的文档字符串
print("greet 函数文档:", greet.__doc__)

# ---- 12. PEP 8 风格演示 ----
print("\\n========== 12. PEP 8 风格演示 ==========")
# 变量名用小写加下划线
user_name = "python_learner"
max_count = 100
is_debug_mode = True

# 常量用全大写加下划线
MAX_CONNECTIONS = 10
DEFAULT_TIMEOUT = 30

# 运算符两侧加空格，逗号后加空格
result = (max_count + 50) * 2
data = [1, 2, 3, 4, 5]

print("用户名:", user_name)
print("最大连接数:", MAX_CONNECTIONS)
print("计算结果:", result)
print("数据:", data)

print("\\n以上就是 Python 基础语法的全景演示！")
print("你可以修改代码中的任何内容，然后重新运行查看效果。")
`,
  },

  // =========================================================
  // 第二章：变量与数据类型
  // =========================================================
  {
    id: "py-variables",
    group: "基础",
    icon: "📦",
    title: "变量与数据类型",
    content: `## 变量与数据类型

**变量**是编程语言中最基础的概念——它是一个**名字**，指向内存中的**一个值**。**数据类型**决定了这个值是什么种类、能做什么操作。本章将深入讲解 Python 的变量机制和数据类型系统，包括许多容易被忽略的底层细节。

### 变量是什么

在 Python 中，变量不是一个"盒子"（装值的容器），而是一个**标签（引用）**——它指向内存中的某个对象。这一点和 C/C++/Java 有本质区别：

\`\`\`python
# Python：变量是标签，指向对象
a = [1, 2, 3]              # 创建列表对象 [1,2,3]，让名字 a 指向它
b = a          # b 和 a 指向同一个列表对象
b.append(4)               # 通过名字 b 原地追加元素 4
print(a)       # [1, 2, 3, 4] —— a 也变了！因为 a 和 b 是同一个对象

# C 语言：变量是盒子，赋值是拷贝
# int x = 5;
# int y = x;    // y 是 x 的拷贝，修改 y 不影响 x
\`\`\`

理解这一点是理解 Python 许多行为的关键。

### 变量命名规则

Python 变量命名有严格的规则：

**1. 必须遵守的硬规则：**
- 只能包含**字母**（a-z, A-Z）、**数字**（0-9）、**下划线**（\`_\`）
- **不能以数字开头**（\`1var\` 非法，\`var1\` 合法）
- **不能是关键字**（如 \`if\`、\`for\`、\`class\`、\`def\`、\`import\` 等）
- **区分大小写**（\`age\` 和 \`Age\` 是不同的变量）
- 不能包含空格和特殊字符（如 \`@\`、\`$\`、\`%\`）

**2. PEP 8 命名约定：**
- 变量和函数：小写字母 + 下划线（\`snake_case\`），如 \`user_name\`、\`get_total_price\`
- 类名：驼峰命名（\`PascalCase\`），如 \`MyClass\`、\`HttpClient\`
- 常量：全大写 + 下划线，如 \`MAX_SIZE\`、\`PI\`
- 私有成员：前缀一个下划线，如 \`_private_var\`
- 名称冲突时：双下划线前缀触发名称改写，如 \`__private\`

\`\`\`python
# ✅ 合法的变量名
user_name = "张三"        # 小写+下划线，PEP 8 推荐写法
age2 = 25                 # 数字可在非开头位置
_private = "私有"         # 下划线开头表示私有
MAX_VALUE = 100           # 全大写表示常量
myVar = "驼峰也可以但不推荐"  # 驼峰命名合法但 Python 不推荐

# ❌ 非法的变量名
# 2age = 25        # 不能以数字开头
# user-name = "x"  # 不能有连字符
# user name = "x"  # 不能有空格
# class = "一班"    # class 是关键字
# user@name = "x"  # 不能有特殊字符
\`\`\`

**3. Python 关键字列表**

不能用作变量名的关键字：

\`\`\`python
import keyword              # 导入 keyword 模块
print(keyword.kwlist)      # 打印所有 Python 关键字列表
# ['False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await',
#  'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
#  'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
#  'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try',
#  'while', 'with', 'yield']
\`\`\`

### 动态类型

Python 是**动态类型**语言：变量不需要声明类型，赋值时自动确定类型，而且同一个变量可以先后指向不同类型的对象。

\`\`\`python
x = 42          # x 指向整数对象 42
print(type(x))  # <class 'int'>
x = "hello"     # x 现在指向字符串对象 "hello"
print(type(x))  # <class 'str'>
x = [1, 2, 3]   # x 现在指向列表对象
print(type(x))  # <class 'list'>
\`\`\`

这与 Java/C++ 的**静态类型**形成对比：

\`\`\`java
// Java：变量类型固定，不能改变
int x = 42;
x = "hello";  // 编译错误
\`\`\`

动态类型的好处是灵活、开发速度快；代价是某些错误要等到运行时才发现。Python 3.5+ 引入了**类型注解**（Type Hints），可以可选地标注类型，配合 mypy 等工具做静态检查：

\`\`\`python
# 类型注解（可选，不影响运行）
def greet(name: str) -> str:      # name 标注为 str 类型，返回值标注为 str
    return f"Hello, {name}"        # 返回格式化字符串

age: int = 28  # 变量注解：标注 age 为 int 类型
\`\`\`

### Python 的基本数据类型

Python 内置了以下基本数据类型：

| 类型 | 关键字 | 示例 | 说明 |
| --- | --- | --- | --- |
| 整数 | \`int\` | \`42\`, \`-7\`, \`0\` | 任意精度，无溢出 |
| 浮点数 | \`float\` | \`3.14\`, \`-0.5\`, \`2e10\` | IEEE 754 双精度 |
| 布尔值 | \`bool\` | \`True\`, \`False\` | int 的子类 |
| 复数 | \`complex\` | \`3+4j\`, \`2j\` | 实部 + 虚部 |
| 字符串 | \`str\` | \`"hello"\` | Unicode 字符序列 |
| 列表 | \`list\` | \`[1, 2, 3]\` | 有序可变序列 |
| 元组 | \`tuple\` | \`(1, 2, 3)\` | 有序不可变序列 |
| 字典 | \`dict\` | \`{"a": 1}\` | 键值对映射 |
| 集合 | \`set\` | \`{1, 2, 3}\` | 无序不重复集合 |
| 冻结集合 | \`frozenset\` | \`frozenset({1,2})\` | 不可变集合 |
| 空值 | \`NoneType\` | \`None\` | 表示"没有值" |

本章重点讲解 \`int\`、\`float\`、\`bool\`、\`complex\` 四种数值类型。

#### 整数 int

Python 的整数最特别的一点是**任意精度**——它不会溢出！不像 C/Java 的 int 只有 32 位（范围 -2³¹ 到 2³¹-1），Python 的 int 可以表示任意大的整数：

\`\`\`python
# Python 的 int 不会溢出
big = 2 ** 100            # 计算 2 的 100 次方，结果自动扩展为任意精度整数
print(big)                # 输出 big 的值
# 1267650600228229401496703205376

# 超大整数运算毫无压力
print(2 ** 1000)  # 一个 302 位的数字
\`\`\`

Python 支持多种进制的整数字面量：

\`\`\`python
decimal = 42          # 十进制
binary = 0b101010     # 二进制（0b 开头），等于 42
octal = 0o52          # 八进制（0o 开头），等于 42
hexadecimal = 0x2A    # 十六进制（0x 开头），等于 42
\`\`\`

可以用下划线分隔大数字，提高可读性（Python 3.6+）：

\`\`\`python
population = 1_400_000_000   # 14 亿，下划线会被忽略
\`\`\`

#### 浮点数 float

Python 的 float 是 **IEEE 754 双精度浮点数**（64 位），与 C/Java 的 \`double\` 相同，有效数字约 15-17 位。

\`\`\`python
pi = 3.141592653589793          # 圆周率，双精度浮点数
scientific = 6.022e23    # 科学计数法，阿伏伽德罗常数
negative = -273.15              # 绝对零度（摄氏度）
\`\`\`

**浮点数精度陷阱**：由于二进制无法精确表示某些十进制小数，浮点运算会产生误差：

\`\`\`python
print(0.1 + 0.2)        # 0.30000000000000004（不等于 0.3！）
print(0.1 + 0.2 == 0.3) # False
\`\`\`

这是所有使用 IEEE 754 的语言的通病（JavaScript、Java、C 都一样），不是 Python 的 bug。涉及精确计算（如金额）时，用 \`decimal\` 模块：

\`\`\`python
from decimal import Decimal              # 从标准库 decimal 导入 Decimal，用于精确十进制运算
print(Decimal("0.1") + Decimal("0.2"))  # 0.3，精确
\`\`\`

特殊浮点值：

\`\`\`python
import math                          # 导入标准库 math，提供数学常量与函数
print(math.inf)     # inf，正无穷
print(-math.inf)    # -inf，负无穷
print(math.nan)     # nan，非数字（Not a Number）
print(math.inf > 1e308)  # True
print(math.nan == math.nan)  # False（nan 不等于任何值，包括自己）
\`\`\`

#### 布尔值 bool

布尔类型只有两个值：\`True\`（真）和 \`False\`（假）。注意**首字母大写**。

\`\`\`python
is_active = True       # 布尔类型，表示是否激活
is_deleted = False     # 布尔类型，表示是否已删除
\`\`\`

**重要细节**：\`bool\` 是 \`int\` 的子类！\`True\` 本质上是 1，\`False\` 本质上是 0：

\`\`\`python
print(True + True)      # 2
print(True + 1)         # 2
print(False * 10)       # 0
print(isinstance(True, int))  # True，bool 是 int 的子类
\`\`\`

**真值测试**：在条件判断中，以下值被视为 \`False\`（假值），其他所有值都是 \`True\`（真值）：

| 被视为 False 的值 | 说明 |
| --- | --- |
| \`False\` | 布尔假 |
| \`0\`, \`0.0\`, \`0j\` | 零值 |
| \`None\` | 空值 |
| \`""\`, \`''\` | 空字符串 |
| \`[]\`, \`()\`, \`{}\`, \`set()\` | 空容器 |
| 自定义对象 \`__bool__()\` 返回 False | 自定义假值 |

\`\`\`python
if 0:                               # 注意：0 在布尔判断中为 False
    print("0 是真")
else:
    print("0 是假")        # 输出这个

if []:                              # 注意：空容器在布尔判断中为 False
    print("空列表是真")
else:
    print("空列表是假")    # 输出这个

if "hello":                         # 注意：非空字符串在布尔判断中为 True
    print("非空字符串是真")  # 输出这个
\`\`\`

#### 复数 complex

Python 原生支持复数，这在科学计算中很有用。复数由实部和虚部组成，虚部用 \`j\` 表示（不是数学中的 \`i\`）：

\`\`\`python
z1 = 3 + 4j       # 实部 3，虚部 4
z2 = complex(3, 4)  # 等价写法
print(z1.real)    # 3.0，实部
print(z1.imag)    # 4.0，虚部
print(abs(z1))    # 5.0，模长 sqrt(3² + 4²)
print(z1.conjugate())  # (3-4j)，共轭复数
\`\`\`

### 类型转换

Python 提供内置函数进行类型转换：

| 函数 | 作用 | 示例 |
| --- | --- | --- |
| \`int()\` | 转为整数 | \`int("42")\` → 42, \`int(3.9)\` → 3 |
| \`float()\` | 转为浮点数 | \`float("3.14")\` → 3.14, \`float(5)\` → 5.0 |
| \`str()\` | 转为字符串 | \`str(42)\` → "42" |
| \`bool()\` | 转为布尔值 | \`bool(0)\` → False, \`bool("")\` → False |
| \`complex()\` | 转为复数 | \`complex(3, 4)\` → (3+4j) |
| \`list()\` | 转为列表 | \`list("abc")\` → ['a','b','c'] |
| \`tuple()\` | 转为元组 | \`tuple([1,2])\` → (1, 2) |
| \`dict()\` | 转为字典 | \`dict([("a",1)])\` → {'a': 1} |
| \`set()\` | 转为集合 | \`set([1,1,2])\` → {1, 2} |

\`\`\`python
# 字符串转数字
print(int("42"))        # 42
print(int("0xff", 16))  # 255，指定进制
print(float("3.14"))    # 3.14

# 数字转字符串
print(str(42))          # "42"
print(str(3.14))        # "3.14"

# 浮点转整数（截断小数部分）
print(int(3.9))         # 3（直接截断，不是四舍五入）
print(int(-3.9))        # -3

# 四舍五入用 round()
print(round(3.5))       # 4（银行家舍入：四舍六入五成双）
print(round(2.5))       # 2（注意不是 3！）
print(round(3.14159, 2))  # 3.14（保留 2 位小数）

# 布尔转换
print(bool(0))          # False
print(bool(1))          # True
print(bool(""))         # False
print(bool("hello"))    # True
print(bool([]))         # False
print(bool([0]))        # True（列表非空，即使元素是 0）
\`\`\`

**注意**：\`int()\` 转换字符串时，字符串必须是合法的整数表示，否则报错：

\`\`\`python
int("42")     # ✅
int("3.14")   # ❌ ValueError！不能直接转
int("abc")    # ❌ ValueError！
# 正确做法：先转 float 再转 int
int(float("3.14"))  # 3
\`\`\`

### type() 与 isinstance()

#### type()：获取对象的类型

\`\`\`python
print(type(42))         # <class 'int'>
print(type("hello"))    # <class 'str'>
print(type([1, 2]))     # <class 'list'>
\`\`\`

可以用 \`type()\` 做类型比较：

\`\`\`python
if type(x) == int:        # 注意：type() 不认子类，判断类型推荐用 isinstance(x, int)
    print("x 是整数")
\`\`\`

但 \`type()\` 比较**不考虑继承关系**：

\`\`\`python
print(type(True) == int)  # False！虽然 bool 是 int 的子类
\`\`\`

#### isinstance()：判断对象是否是某类型的实例（推荐）

\`isinstance()\` 考虑继承关系，更安全、更 Pythonic：

\`\`\`python
print(isinstance(True, int))    # True！bool 是 int 的子类
print(isinstance(42, int))      # True
print(isinstance(42, (int, float)))  # True，可以传类型元组
print(isinstance("hello", str)) # True
\`\`\`

**为什么推荐 isinstance 而非 type 比较？**

1. **考虑继承**：子类实例也是父类的实例。
2. **更灵活**：可以一次检查多个类型。
3. **符合 Python 风格**：Python 提倡"鸭子类型"，isinstance 更符合这个理念。

### 内存模型与引用

#### 变量是引用（标签）

Python 中变量存储的是对象的**引用（地址）**，而非对象本身。赋值操作是让变量指向一个对象。

\`\`\`python
a = [1, 2, 3]
b = a           # b 和 a 指向同一个列表对象
b[0] = 99       # 通过 b 修改索引 0 的元素，原地变更，影响 a
print(a)        # [99, 2, 3] —— a 也变了！
\`\`\`

用 \`id()\` 函数可以查看对象的内存地址（标识）：

\`\`\`python
a = [1, 2, 3]
b = a                       # b 与 a 绑定到同一个列表对象
print(id(a))    # 比如 4318561232
print(id(b))    # 同样的地址 4318561232
print(a is b)   # True，是同一个对象
\`\`\`

#### 引用赋值 vs 拷贝

如果不想让两个变量共享同一个对象，需要做拷贝：

\`\`\`python
import copy                       # 导入 copy 模块，提供浅拷贝与深拷贝工具

a = [1, 2, [3, 4]]               # 外层列表中嵌套了一个内层列表

# 浅拷贝：只拷贝外层，内层仍共享
b = a.copy()             # 或 list(a) 或 a[:]
b[0] = 99                # 替换外层元素，不影响 a
b[2][0] = 99             # 修改内层列表，a 的内层也跟着变（共享同一对象）
print(a)  # [1, 2, [99, 4]] —— 内层列表被影响了！

# 深拷贝：递归拷贝所有层级
a = [1, 2, [3, 4]]
c = copy.deepcopy(a)    # 递归复制所有层级，c 与 a 完全独立
c[2][0] = 99            # 修改 c 的内层，不影响 a
print(a)  # [1, 2, [3, 4]] —— 不受影响
\`\`\`

### is vs ==

这是 Python 中一个经典面试题：

- \`==\` 比较**值是否相等**（调用 \`__eq__\` 方法）
- \`is\` 比较**是否是同一个对象**（比较 id，即内存地址）

\`\`\`python
a = [1, 2, 3]
b = [1, 2, 3]          # 值相同，但是独立创建的新对象
print(a == b)   # True，值相等
print(a is b)   # False，不是同一个对象

c = a                  # c 与 a 绑定同一对象
print(a is c)   # True，是同一个对象
\`\`\`

**None 的判断**：应该**始终用 is**，不要用 ==：

\`\`\`python
x = None
if x is None:     # ✅ 推荐：用 is 判断身份，不会被自定义 __eq__ 影响
    print("x 是 None")
if x == None:     # ❌ 不推荐（可能被自定义 __eq__ 欺骗）
    print("x 是 None")
\`\`\`

### 小整数池（Small Integer Caching）

CPython 对 **-5 到 256** 之间的整数做了缓存优化：这些整数对象在解释器启动时就预先创建好，所有引用这些值的变量都指向同一个对象。

\`\`\`python
a = 256                  # 注意：-5~256 的小整数被解释器缓存复用
b = 256
print(a is b)   # True！同一个缓存对象

a = 257                  # 注意：超出缓存范围，每次新建独立对象
b = 257
print(a is b)   # False！超出缓存范围，创建了不同对象
\`\`\`

这个行为是 CPython 的实现细节，不应依赖它做逻辑判断。但理解它能解释一些"奇怪"的现象。除了小整数池，Python 还会缓存短字符串和某些常量。

**注意**：在交互式环境（REPL）和脚本文件中，\`is\` 的结果可能不同。因为编译器在编译整个文件时可能做更多优化（常量折叠），把相同值的字面量合并为一个对象。这是实现层面的差异，不要依赖。

### 可变类型与不可变类型

Python 的类型分为两大类：

#### 不可变类型（Immutable）

创建后其值不能被修改。尝试修改会创建新对象。

| 类型 | 不可变类型 |
| --- | --- |
| 数值 | \`int\`, \`float\`, \`bool\`, \`complex\` |
| 字符串 | \`str\` |
| 元组 | \`tuple\` |
| 冻结集合 | \`frozenset\` |
| 字节串 | \`bytes\` |

\`\`\`python
# 不可变类型：修改看似"改变"，实则创建新对象
x = 10
print(id(x))    # 地址 A
x = x + 1       # x 指向了新的整数对象 11
print(id(x))    # 地址 B（不同了！）

# 字符串也是不可变的
s = "hello"     # 创建字符串对象，s 指向它
# s[0] = "H"    # ❌ TypeError：字符串不支持修改
s = "Hello"     # ✅ 这是让 s 指向新字符串，不是修改原字符串
\`\`\`

#### 可变类型（Mutable）

创建后其值可以被修改，修改不影响对象身份（id 不变）。

| 类型 | 可变类型 |
| --- | --- |
| 列表 | \`list\` |
| 字典 | \`dict\` |
| 集合 | \`set\` |
| 字节数组 | \`bytearray\` |

\`\`\`python
# 可变类型：原地修改，id 不变
lst = [1, 2, 3]
print(id(lst))    # 地址 A
lst.append(4)     # 原地追加元素，对象身份不变
print(id(lst))    # 还是地址 A（同一个对象）

d = {"a": 1}      # 创建字典对象
print(id(d))      # 输出字典 d 的内存地址
d["b"] = 2        # 原地新增键值对
print(id(d))      # id 不变
\`\`\`

#### 不可变类型的"陷阱"

不可变类型虽然本身不可变，但如果它包含可变类型的元素，那些元素仍然可变：

\`\`\`python
# 元组本身不可变，但其元素如果是可变对象，仍可修改
t = (1, 2, [3, 4])     # 元组第 2 个元素是列表（可变）
# t[0] = 99    # ❌ TypeError：元组不可变
t[2].append(5)  # ✅ 列表是可变的
print(t)        # (1, 2, [3, 4, 5])
\`\`\`

#### 函数参数传递的影响

理解可变/不可变对函数参数至关重要：

\`\`\`python
# 不可变类型：函数内修改不影响外部
def add_one(n):              # 参数 n 按值传递（整数不可变）
    n = n + 1                # 局部作用域创建新整数，不影响外部变量
    print("函数内:", n)       # 输出函数内的 n 值

x = 10
add_one(x)
print("函数外:", x)    # 还是 10

# 可变类型：函数内修改影响外部
def append_item(lst):        # lst 接收列表对象的引用
    lst.append(99)            # 原地修改，影响调用方的列表
    print("函数内:", lst)     # 输出函数内的列表

my_list = [1, 2, 3]
append_item(my_list)
print("函数外:", my_list)  # [1, 2, 3, 99] —— 被修改了！
\`\`\`

### 多重赋值与解包

Python 支持非常灵活的赋值语法：

\`\`\`python
# 多重赋值
a, b, c = 1, 2, 3            # 右侧按位置依次赋给 a、b、c
print(a, b, c)   # 1 2 3

# 交换变量（不需要临时变量！）
a, b = b, a                  # 右侧先打包成元组，再解包给左侧
print(a, b)      # 2 1

# 解包列表/元组
nums = [10, 20, 30]          # 元素个数须与左侧变量数一致
x, y, z = nums
print(x, y, z)   # 10 20 30

# 扩展解包（Python 3）
first, *rest = [1, 2, 3, 4, 5]   # * 收集剩余元素为列表
print(first)     # 1
print(rest)      # [2, 3, 4, 5]

*init, last = [1, 2, 3, 4, 5]    # * 收集开头部分
print(init)      # [1, 2, 3, 4]
print(last)      # 5

first, *middle, last = [1, 2, 3, 4, 5]   # 两端固定，中间收集
print(middle)    # [2, 3, 4]
\`\`\`

### del 语句

\`del\` 可以删除变量、列表元素、字典键等：

\`\`\`python
x = 42
del x                  # 删除变量 x 的绑定
# print(x)  # NameError: x 已被删除

lst = [1, 2, 3, 4, 5]
del lst[1]      # 删除索引 1 的元素
print(lst)      # [1, 3, 4, 5]

d = {"a": 1, "b": 2}
del d["a"]      # 删除字典中键为 "a" 的项
print(d)        # {'b': 2}
\`\`\`

### 本节代码演示

下面这段代码综合演示了变量与数据类型的核心知识点：各种数值类型、类型转换、type/isinstance、引用与内存模型、is vs ==、小整数池、可变/不可变类型、多重赋值。运行后仔细观察输出，理解每个概念。`,
    code: `# ============================================================
# 第二章代码演示：变量与数据类型
# ============================================================
# 本代码演示：基本类型、类型转换、type/isinstance、
# 内存模型与引用、is vs ==、小整数池、可变/不可变类型

# ---- 1. 整数类型 int ----
print("\\n========== 1. 整数类型 ==========")
# Python 的整数不会溢出，可以任意大
big_number = 2 ** 100
print("2 的 100 次方:", big_number)

# 多种进制
decimal_num = 42
binary_num = 0b101010
octal_num = 0o52
hex_num = 0x2A
print(f"十进制 {decimal_num} = 二进制 {binary_num} = 八进制 {octal_num} = 十六进制 {hex_num}")

# 下划线分隔大数字（Python 3.6+）
population = 1_400_000_000
print("人口数（下划线分隔）:", population)

# ---- 2. 浮点数类型 float ----
print("\\n========== 2. 浮点数类型 ==========")
pi = 3.141592653589793
scientific = 6.022e23  # 科学计数法
print("圆周率:", pi)
print("阿伏伽德罗常数:", scientific)

# 浮点数精度陷阱
result = 0.1 + 0.2
print(f"0.1 + 0.2 = {result}")
print(f"0.1 + 0.2 == 0.3? {result == 0.3}")

# 用 decimal 模块做精确计算
from decimal import Decimal
precise = Decimal("0.1") + Decimal("0.2")
print(f"Decimal 0.1 + 0.2 = {precise}")

# 特殊浮点值
import math
print("正无穷:", math.inf)
print("负无穷:", -math.inf)
print("NaN:", math.nan)
print("NaN == NaN?", math.nan == math.nan)  # False！

# ---- 3. 布尔类型 bool ----
print("\\n========== 3. 布尔类型 ==========")
is_python_fun = True
is_boring = False
print("Python 有趣吗:", is_python_fun)
print("Python 无聊吗:", is_boring)

# bool 是 int 的子类
print("True + True =", True + True)     # 2
print("True + 10 =", True + 10)         # 11
print("False * 100 =", False * 100)     # 0
print("isinstance(True, int):", isinstance(True, int))  # True

# 真值测试：哪些值被视为 False
falsy_values = [0, 0.0, "", [], (), {}, None, False]
print("\\n假值测试:")
for val in falsy_values:
    print(f"  bool({val!r:10}) = {bool(val)}")

# ---- 4. 复数类型 complex ----
print("\\n========== 4. 复数类型 ==========")
z = 3 + 4j
print(f"复数: {z}")
print(f"实部: {z.real}")
print(f"虚部: {z.imag}")
print(f"模长: {abs(z)}")           # sqrt(3² + 4²) = 5
print(f"共轭: {z.conjugate()}")

# ---- 5. type() 查看类型 ----
print("\\n========== 5. type() 查看类型 ==========")
values = [42, 3.14, True, "hello", [1, 2], (1, 2), {"a": 1}, None, 3 + 4j]
for val in values:
    print(f"  {str(val):20} -> type: {type(val).__name__}")

# ---- 6. isinstance() 类型判断 ----
print("\\n========== 6. isinstance() 类型判断 ==========")
print("isinstance(42, int):", isinstance(42, int))
print("isinstance(True, int):", isinstance(True, int))  # True，bool 是 int 子类
print("isinstance(42, (int, float)):", isinstance(42, (int, float)))
print("isinstance('hello', str):", isinstance("hello", str))

# type() 不考虑继承
print("type(True) == int:", type(True) == int)   # False！
print("type(True) == bool:", type(True) == bool) # True

# ---- 7. 类型转换 ----
print("\\n========== 7. 类型转换 ==========")
# 字符串转数字
print('int("42"):', int("42"))
print('int("0xff", 16):', int("0xff", 16))   # 指定进制
print('float("3.14"):', float("3.14"))

# 数字转字符串
print("str(42):", str(42))
print("str(3.14):", str(3.14))

# 浮点转整数
print("int(3.9):", int(3.9))     # 截断，不是四舍五入
print("int(-3.9):", int(-3.9))
print("round(3.5):", round(3.5)) # 4
print("round(2.5):", round(2.5)) # 2（银行家舍入）
print("round(3.14159, 2):", round(3.14159, 2))

# bool 转换
print('bool(0):', bool(0))
print('bool("hello"):', bool("hello"))
print('bool([]):', bool([]))
print('bool([0]):', bool([0]))    # True，列表非空

# ---- 8. 变量是引用（内存模型）----
print("\\n========== 8. 变量是引用 ==========")
a = [1, 2, 3]
b = a              # b 和 a 指向同一个列表
print(f"a = {a}, id(a) = {id(a)}")
print(f"b = {b}, id(b) = {id(b)}")
print(f"a is b: {a is b}")       # True

b.append(4)        # 通过 b 修改
print(f"修改 b 后, a = {a}")     # a 也变了！

# ---- 9. is vs == ----
print("\\n========== 9. is vs == ==========")
list1 = [1, 2, 3]
list2 = [1, 2, 3]
list3 = list1

print(f"list1 = {list1}, list2 = {list2}")
print(f"list1 == list2: {list1 == list2}")  # True，值相等
print(f"list1 is list2: {list1 is list2}")  # False，不是同一个对象
print(f"list1 is list3: {list1 is list3}")  # True，是同一个对象

# None 判断应该用 is
x = None
print(f"x is None: {x is None}")   # True（推荐）
print(f"x == None: {x == None}")   # True（不推荐）

# ---- 10. 小整数池 ----
print("\\n========== 10. 小整数池（-5 到 256）=========")
# -5 到 256 的整数被缓存，is 比较为 True
a = 256
b = 256
print(f"256 is 256: {a is b}")    # True（缓存内）

a = 257
b = 257
print(f"257 is 257: {a is b}")    # 可能 True 或 False（超出缓存范围）

# 负数也在缓存范围
a = -5
b = -5
print(f"-5 is -5: {a is b}")      # True

a = -6
b = -6
print(f"-6 is -6: {a is b}")      # 可能 False（超出缓存范围）

# ---- 11. 可变 vs 不可变类型 ----
print("\\n========== 11. 可变 vs 不可变类型 ==========")
# 不可变类型：修改会创建新对象
x = 10
print(f"x = 10, id = {id(x)}")
x = x + 1
print(f"x = 11, id = {id(x)}（地址变了，创建了新对象）")

# 可变类型：原地修改，id 不变
lst = [1, 2, 3]
print(f"lst = {lst}, id = {id(lst)}")
lst.append(4)
print(f"lst.append(4) 后, id = {id(lst)}（地址不变）")

# 字符串不可变
s = "hello"
# s[0] = "H"  # TypeError: 字符串不可修改
s = "Hello"    # 让 s 指向新字符串
print(f"字符串重新赋值: {s}")

# 元组不可变，但元素可以是可变对象
t = (1, 2, [3, 4])
print(f"元组: {t}")
t[2].append(5)   # 列表元素可变
print(f"修改后: {t}")
# t[0] = 99      # TypeError: 元组不可变

# ---- 12. 浅拷贝 vs 深拷贝 ----
print("\\n========== 12. 浅拷贝 vs 深拷贝 ==========")
import copy

original = [1, 2, [3, 4]]

# 浅拷贝：外层独立，内层共享
shallow = original.copy()
shallow[0] = 99
shallow[2][0] = 88
print(f"浅拷贝修改后, original = {original}")  # [1, 2, [88, 4]]

# 深拷贝：完全独立
original = [1, 2, [3, 4]]
deep = copy.deepcopy(original)
deep[2][0] = 77
print(f"深拷贝修改后, original = {original}")  # [1, 2, [3, 4]]

# ---- 13. 多重赋值与解包 ----
print("\\n========== 13. 多重赋值与解包 ==========")
# 多重赋值
a, b, c = 1, 2, 3
print(f"a, b, c = {a}, {b}, {c}")

# 交换变量
a, b = b, a
print(f"交换后: a={a}, b={b}")

# 列表解包
nums = [10, 20, 30, 40, 50]
first, *middle, last = nums
print(f"first={first}, middle={middle}, last={last}")

# ---- 14. 函数参数与可变/不可变 ----
print("\\n========== 14. 函数参数传递 ==========")
# 不可变类型：函数内修改不影响外部
def add_one(n):
    n = n + 1
    print(f"  函数内 n = {n}")

x = 10
add_one(x)
print(f"  函数外 x = {x}（不变）")

# 可变类型：函数内修改影响外部
def add_item(lst):
    lst.append(99)
    print(f"  函数内 lst = {lst}")

my_list = [1, 2, 3]
add_item(my_list)
print(f"  函数外 my_list = {my_list}（被修改了）")

print("\\n变量与数据类型演示完成！")
`,
  },

  // =========================================================
  // 第三章：字符串
  // =========================================================
  {
    id: "py-strings",
    group: "基础",
    icon: "📝",
    title: "字符串",
    content: `## 字符串

**字符串（String）** 是 Python 中最常用的数据类型之一，用于表示文本信息。Python 的字符串是 **Unicode 字符的不可变序列**——这意味着它可以表示世界上几乎所有语言的文字，并且创建后不能被修改。本章将全面讲解字符串的创建、操作、方法和底层原理。

### 字符串的创建

Python 中创建字符串有多种方式：

#### 单引号和双引号

\`\`\`python
s1 = 'hello'      # 单引号
s2 = "hello"      # 双引号
# 两者完全等价，Python 不区分
\`\`\`

选择哪种引号主要看字符串内容：如果字符串中包含单引号，就用双引号包裹，反之亦然：

\`\`\`python
# 字符串中包含单引号，用双引号包裹
msg1 = "It's a beautiful day"        # 外层双引号，内层单引号无需转义

# 字符串中包含双引号，用单引号包裹
msg2 = 'He said "hello"'             # 外层单引号，内层双引号无需转义

# 也可以用转义字符处理
msg3 = 'It\\'s a beautiful day'   # 用 \\' 转义单引号
msg4 = "He said \\"hello\\""      # 用 \\" 转义双引号
\`\`\`

#### 三引号（多行字符串）

三个单引号或三个双引号可以创建**多行字符串**，内容中的换行会被保留：

\`\`\`python
multi = '''这是第一行       # 三个单引号开始多行字符串
这是第二行
这是第三行'''                 # 三个单引号结束

multi2 = """也可以用三个双引号   # 三个双引号效果相同
效果一样"""

# 三引号常用于文档字符串（docstring）
def my_func():                   # 定义函数 my_func
    """这是一个函数的文档字符串。
    可以跨多行说明函数的用途。"""
    pass                     # pass 占位，函数体为空
\`\`\`

### 字符串的不可变性

Python 字符串是**不可变（immutable）**的：一旦创建，内容不能被修改。所有"修改"字符串的操作实际上是创建了新的字符串对象。

\`\`\`python
s = "hello"
# s[0] = "H"    # ❌ TypeError: 'str' 对象不支持赋值

# "修改"实际上是创建新字符串
s = "Hello"           # s 指向新字符串
s = s + " World"      # 拼接产生新字符串
\`\`\`

不可变性带来的影响：
1. **安全性**：字符串可以作为字典的键、集合的元素（可变类型不行）。
2. **共享**：多个变量可以安全地引用同一个字符串。
3. **性能**：大量拼接字符串时效率低（每次都创建新对象），应使用 \`join()\`。

### 索引与切片

字符串是一个**字符序列**，可以通过索引和切片访问其中的字符。

#### 索引

\`\`\`python
s = "Python"          # 字符串可通过索引访问单个字符
#    P  y  t  h  o  n
#    0  1  2  3  4  5    正向索引
#   -6 -5 -4 -3 -2 -1    负向索引

print(s[0])    # 'P'，第一个字符
print(s[5])    # 'n'，最后一个字符
print(s[-1])   # 'n'，倒数第一个
print(s[-2])   # 'o'，倒数第二个
\`\`\`

索引超出范围会报错：

\`\`\`python
# s[10]  # IndexError: 字符串索引超出范围
\`\`\`

#### 切片

切片语法：\`s[start:stop:step]\`
- \`start\`：起始索引（包含），默认 0
- \`stop\`：结束索引（**不包含**），默认到末尾
- \`step\`：步长，默认 1

\`\`\`python
s = "Python"     # 切片语法 s[start:stop:step]，左闭右开

print(s[0:3])    # 'Pyt'，索引 0、1、2
print(s[:3])     # 'Pyt'，省略 start 默认 0
print(s[3:])     # 'hon'，省略 stop 默认到末尾
print(s[:])      # 'Python'，复制整个字符串
print(s[::2])    # 'Pto'，步长 2，每隔一个取一个
print(s[::-1])   # 'nohtyP'，步长 -1，反转字符串
print(s[1:5:2])  # 'yh'，从 1 到 5 步长 2
print(s[-3:])    # 'hon'，最后 3 个字符
\`\`\`

切片不会越界报错，超出部分自动截断：

\`\`\`python
s = "abc"         # 注意：切片越界不会报错，而是自动截断
print(s[0:100])   # 'abc'，不报错
print(s[10:20])   # ''，空字符串
\`\`\`

### 字符串拼接

#### 使用 + 运算符

\`\`\`python
s1 = "Hello"             # 字符串可用 + 拼接
s2 = "World"
result = s1 + " " + s2   # "Hello World"
\`\`\`

\`+\` 每次拼接都会创建新字符串，大量拼接时效率低。

#### 使用 join() 方法（推荐）

\`\`\`python
words = ["Hello", "World", "Python"]   # join 用分隔符连接可迭代对象
result = " ".join(words)   # "Hello World Python"
result = "-".join(words)   # "Hello-World-Python"   用 - 连接
result = "".join(words)    # "HelloWorldPython"     无分隔符连接
\`\`\`

\`join()\` 只需分配一次内存，效率远高于 \`+\`。

#### 使用 * 重复

\`\`\`python
print("ab" * 3)   # "ababab"
print("-" * 20)   # "--------------------"
\`\`\`

#### 隐式拼接

相邻的字符串字面量会自动拼接：

\`\`\`python
s = "Hello" "World"   # 等价于 "HelloWorld"
# 常用于长字符串换行
url = ("https://www.example.com"      # 相邻字符串字面量自动拼接
       "/api/v1/users"
       "/list")
\`\`\`

### 字符串格式化

Python 有三种字符串格式化方式，从老到新：

#### 1. % 格式化（C 风格，老式）

\`\`\`python
name = "张三"            # %s 占位字符串，%d 占位整数
age = 28
print("我叫%s，今年%d岁" % (name, age))
# 我叫张三，今年28岁
\`\`\`

常用占位符：

| 占位符 | 含义 | 示例 |
| --- | --- | --- |
| \`%s\` | 字符串 | \`"%s" % "hi"\` |
| \`%d\` | 整数 | \`"%d" % 42\` |
| \`%f\` | 浮点数 | \`"%f" % 3.14\` |
| \`%.2f\` | 保留2位小数 | \`"%.2f" % 3.14159\` |
| \`%x\` | 十六进制 | \`"%x" % 255\` |
| \`%%\` | 百分号本身 | \`"100%%"\` |

缺点：可读性差，类型不匹配会报错。

#### 2. str.format() 方法

\`\`\`python
name = "张三"                       # str.format 用 {} 占位
age = 28
print("我叫{}，今年{}岁".format(name, age))
# 我叫张三，今年28岁

# 通过位置索引
print("{0}说：{1}，{0}又说：{1}".format("我", "你好"))   # {0}、{1} 按位置取参数

# 通过关键字参数
print("我叫{name}，今年{age}岁".format(name="李四", age=30))   # 按名字匹配参数

# 格式化数字
print("{:.2f}".format(3.14159))    # 3.14
print("{:,}".format(1000000))      # 1,000,000
print("{:>10}".format("right"))    # 右对齐，宽度10
print("{:<10}".format("left"))     # 左对齐
print("{:^10}".format("center"))   # 居中
print("{:0>5}".format(42))         # 00042，补零
\`\`\`

#### 3. f-string（推荐，Python 3.6+）

f-string 是最新、最简洁、最快的格式化方式：

\`\`\`python
name = "张三"                          # f-string：字符串前加 f，{} 内可直接写变量/表达式
age = 28
print(f"我叫{name}，今年{age}岁")
# 我叫张三，今年28岁

# 在 {} 中可以直接写表达式
print(f"明年我{age + 1}岁")
print(f"{'Python'.upper()}")          # {} 内调用方法

# 格式化说明符（在 : 后面）
pi = 3.14159265                       # : 后跟格式说明符
print(f"圆周率: {pi:.2f}")         # 3.14
print(f"百分比: {0.85:.1%}")       # 85.0%
print(f"千分位: {1000000:,}")      # 1,000,000
print(f"二进制: {42:b}")           # 101010
print(f"十六进制: {255:#x}")       # 0xff
print(f"右对齐: {42:>10}")         # 右对齐宽度10
print(f"补零: {42:0>5}")           # 00042

# Python 3.8+：调试模式，变量名=值
x = 42                               # 调试模式：f"{x = }" 同时输出变量名和值
print(f"{x = }")                   # x = 42
print(f"{x + 1 = }")               # x + 1 = 43
\`\`\`

#### 三种方式对比

| 方式 | 可读性 | 速度 | 推荐度 |
| --- | --- | --- | --- |
| \`% \` | 低 | 中 | ⭐⭐ |
| \`.format()\` | 中 | 中 | ⭐⭐⭐ |
| \`f-string\` | 高 | 最快 | ⭐⭐⭐⭐⭐ |

**推荐**：新代码统一用 f-string，除非需要兼容 Python 3.5 及以下。

### 常用字符串方法

Python 字符串有非常丰富的方法，下面逐一讲解。

#### 大小写转换

\`\`\`python
s = "Hello World"      # 字符串大小写转换方法，均返回新字符串不改变原串

print(s.upper())        # "HELLO WORLD"，全大写
print(s.lower())        # "hello world"，全小写
print(s.title())        # "Hello World"，每个单词首字母大写
print(s.capitalize())   # "Hello world"，首字母大写其余小写
print(s.swapcase())     # "hELLO wORLD"，大小写互换
\`\`\`

#### 去除空白字符

\`\`\`python
s = "  Hello World  "   # strip 系列方法去除两端字符，默认去空白

print(s.strip())    # "Hello World"，去除两端空白
print(s.lstrip())   # "Hello World  "，去除左端空白
print(s.rstrip())   # "  Hello World"，去除右端空白

# 也可以指定要去除的字符
s2 = "###Hello###"      # 传入参数则去除指定字符
print(s2.strip("#"))   # "Hello"
\`\`\`

#### 查找与替换

\`\`\`python
s = "Hello, World, Hello Python"   # 查找与替换系列方法

# find：查找子串，返回第一个匹配的索引，找不到返回 -1
print(s.find("World"))    # 7
print(s.find("Java"))     # -1
print(s.find("Hello", 5)) # 15，从索引 5 开始找

# index：同 find，但找不到会抛 ValueError
# print(s.index("Java"))  # ValueError!

# rfind / rindex：从右侧查找
print(s.rfind("Hello"))   # 15

# count：统计子串出现次数
print(s.count("Hello"))   # 2
print(s.count("o"))       # 4

# replace：替换
print(s.replace("Hello", "Hi"))             # "Hi, World, Hi Python"
print(s.replace("Hello", "Hi", 1))          # 只替换第一个
\`\`\`

#### 分割与连接

\`\`\`python
# split：按分隔符分割，返回列表
s = "苹果,香蕉,橘子,葡萄"      # split 返回列表，原串不变
print(s.split(","))        # ['苹果', '香蕉', '橘子', '葡萄']
print(s.split(",", 2))     # ['苹果', '香蕉', '橘子,葡萄']，最多分2次

# 按空白分割（不传参数）
s2 = "Hello   World   Python"   # 不传参时按任意空白分割并去空
print(s2.split())          # ['Hello', 'World', 'Python']

# splitlines：按行分割
s3 = "第一行\\n第二行\\n第三行"   # 按换行符分割，返回各行列表
print(s3.splitlines())     # ['第一行', '第二行', '第三行']

# join：用字符串连接列表中的元素
words = ["Hello", "World", "Python"]   # join 是 split 的逆操作
print(" ".join(words))     # "Hello World Python"
print("-".join(words))     # "Hello-World-Python"
print("".join(words))      # "HelloWorldPython"
\`\`\`

#### 判断类方法

\`\`\`python
print("hello".isalpha())       # True，全是字母
print("hello123".isalpha())    # False
print("12345".isdigit())       # True，全是数字
print("hello123".isalnum())    # True，全是字母或数字
print("   ".isspace())         # True，全是空白
print("Hello".isupper())       # False
print("HELLO".isupper())       # True
print("hello".islower())       # True
\`\`\`

#### 前缀与后缀判断

\`\`\`python
s = "Hello World"             # startswith/endswith 判断首尾子串

print(s.startswith("Hello"))    # True
print(s.startswith("World", 6)) # True，从索引 6 开始判断
print(s.endswith("World"))      # True
print(s.endswith("hello"))      # False（区分大小写）
\`\`\`

#### 其他常用方法

\`\`\`python
# len()：获取字符串长度
print(len("Hello"))     # 5

# in：判断是否包含子串
print("ell" in "Hello")   # True
print("abc" in "Hello")   # False

# center / ljust / rjust：对齐填充
print("hi".center(10, "-"))   # "----hi----"
print("hi".ljust(10, "."))    # "hi........"
print("hi".rjust(10, "."))    # "........hi"

# zfill：左侧补零
print("42".zfill(5))          # "00042"

# ord / chr：字符与 Unicode 码点互转
print(ord("A"))    # 65
print(chr(65))     # 'A'
print(ord("中"))   # 20013
\`\`\`

### 转义字符

转义字符以反斜杠 \`\\\` 开头，表示特殊含义的字符：

| 转义字符 | 含义 | 示例 |
| --- | --- | --- |
| \`\\\\n\` | 换行 | \`"a\\nb"\` |
| \`\\\\t\` | 制表符 | \`"a\\tb"\` |
| \`\\\\r\` | 回车 | |
| \`\\\\\\\\\` | 反斜杠本身 | \`"C:\\\\Users"\` |
| \`\\\\'\` | 单引号 | \`'It\\'s'\` |
| \`\\\\"'\` | 双引号 | \`'He said \\"hi\\"'\` |
| \`\\\\0\` | 空字符 | |
| \`\\\\uXXXX\` | Unicode 字符 | \`"\\\\u4e2d"\` → "中" |
| \`\\\\xXX\` | 十六进制字符 | |

\`\`\`python
print("第一行\\n第二行")     # 换行
print("姓名\\t年龄\\t城市")  # 制表符对齐
print("路径: C:\\\\Users\\\\Admin")  # 反斜杠
print('It\\'s a pen')        # 单引号内的单引号
print("He said \\"hi\\"")    # 双引号内的双引号
\`\`\`

### 原始字符串（Raw String）

在字符串前加 \`r\` 或 \`R\`，转义字符不被处理，按字面输出：

\`\`\`python
# 普通字符串：转义生效
print("C:\\\\Users\\\\Admin")   # C:\\Users\\Admin

# 原始字符串：反斜杠不转义
print(r"C:\\Users\\\\Admin")  # C:\\Users\\\\Admin

# 原始字符串在正则表达式中极其有用
import re                            # 导入正则模块
# 不用 r：要写 "\\\\\\\\d" 来匹配 \\d
# 用 r：直接写 r"\\d"
pattern = r"\\d{3}-\\d{4}"           # 原始字符串让反斜杠按字面解释，便于写正则
print(re.findall(pattern, "电话: 123-4567"))   # 在文本中查找所有匹配
\`\`\`

**注意**：原始字符串中反斜杠仍然不能出现在末尾（即 \`r"abc\\\\" \` 中最后的 \\\\ 会被认为转义了引号）。

### 多行字符串

三引号创建的多行字符串会保留其中的换行和缩进：

\`\`\`python
poem = '''              # 用三单引号创建多行字符串，保留其中的换行和缩进
静夜思
床前明月光，
疑是地上霜。
举头望明月，
低头思故乡。
'''                         # 三单引号闭合多行字符串
print(poem)                 # 打印多行字符串，原样输出包含换行的内容
\`\`\`

如果想去掉多行字符串开头的换行和缩进，可以用 \`textwrap.dedent()\`：

\`\`\`python
import textwrap                                   # 导入 textwrap，用于处理文本缩进
text = textwrap.dedent("""                         # dedent 去除多行字符串的公共前导空白
    第一行
    第二行
    第三行
""").strip()                                       # strip 去除首尾空白行
\`\`\`

### encode() 与 decode()：str 与 bytes

#### str 与 bytes 的区别

- **str**：Unicode 字符串，给人看的文本。Python 3 中 \`"hello"\` 就是 str。
- **bytes**：字节序列，给机器存储/传输的二进制数据。前缀 \`b\` 表示。

\`\`\`python
s = "Hello"        # str 类型
b = b"Hello"       # bytes 类型
print(type(s))     # <class 'str'>
print(type(b))     # <class 'bytes'>
\`\`\`

#### encode()：str 转 bytes

\`str.encode(encoding)\` 把 Unicode 字符串编码为字节序列：

\`\`\`python
s = "你好"                          # encode 将字符串按指定编码转为字节串
b_utf8 = s.encode("utf-8")      # UTF-8 编码
b_gbk = s.encode("gbk")         # GBK 编码
print(b_utf8)    # b'\\xe4\\xbd\\xa0\\xe5\\xa5\\xbd'（6 字节）
print(b_gbk)     # b'\\xc4\\xe3\\xba\\xc3'（4 字节）
print(len(b_utf8))  # 6
\`\`\`

#### decode()：bytes 转 str

\`bytes.decode(encoding)\` 把字节序列解码为 Unicode 字符串：

\`\`\`python
b = b'\\xe4\\xbd\\xa0\\xe5\\xa5\\xbd'   # 字节串字面量，前缀 b 表示 bytes
s = b.decode("utf-8")                   # decode 将字节串按编码解码为字符串
print(s)    # 你好
\`\`\`

#### 编码与解码的关系

\`\`\`
str  --encode()-->  bytes  --decode()-->  str
文本  ---------->  字节  ---------->  文本
（给人看）        （给机器/网络）     （给人看）
\`\`\`

编码和解码必须用**同一种编码**，否则会出现乱码或报错：

\`\`\`python
s = "你好"                          # 注意：编解码必须用同一编码，否则乱码或报错
b = s.encode("utf-8")
# s2 = b.decode("gbk")  # ❌ 可能乱码或 UnicodeDecodeError
s2 = b.decode("utf-8")  # ✅ 正确
\`\`\`

#### 常用编码

| 编码 | 说明 |
| --- | --- |
| UTF-8 | 最通用的编码，可表示所有 Unicode 字符，英文1字节、中文3字节 |
| GBK | 中文编码，中文2字节，主要在中国大陆使用 |
| ASCII | 只能表示英文字符，1字节 |
| Latin-1 (ISO-8859-1) | 西欧语言编码 |

### 字符串与循环

\`\`\`python
# 遍历字符串的每个字符
for char in "Python":            # for 循环逐个取出字符
    print(char)

# enumerate 获取索引和字符
for i, char in enumerate("Python"):   # enumerate 同时给出索引和元素
    print(f"索引 {i}: {char}")
\`\`\`

### 字符串常用技巧

\`\`\`python
# 反转字符串
s = "Hello"                    # 切片 [::-1] 反转序列
print(s[::-1])        # "olleH"

# 判断回文
def is_palindrome(s):        # 定义回文判断函数
    return s == s[::-1]
print(is_palindrome("level"))   # True

# 统计字符出现次数
s = "mississippi"             # count 方法统计子串出现次数
print(s.count("s"))   # 4

# 去除字符串中所有空白
s = "  a b  c  "
print("".join(s.split()))   # "abc"

# 字符串填充对齐
for i in range(1, 4):                  # ljust/rjust/center 指定宽度与填充符
    print(f"第{i}行".ljust(10, "."))

# 多行字符串去缩进
import textwrap                              # dedent 去除公共缩进
code = textwrap.dedent("""
    def hello():
        print("hi")
""").strip()
\`\`\`

### 本节代码演示

下面这段代码综合演示了字符串的各种操作：创建、索引切片、拼接、三种格式化、常用方法、转义、原始字符串、encode/decode。运行后仔细观察每个方法的输出效果。`,
    code: `# ============================================================
# 第三章代码演示：字符串
# ============================================================
# 本代码演示：创建、索引切片、拼接、格式化、常用方法、
# 转义字符、原始字符串、encode/decode、str 与 bytes

# ---- 1. 创建字符串 ----
print("\\n========== 1. 创建字符串 ==========")
s1 = '单引号字符串'
s2 = "双引号字符串"
s3 = "It's a pen"          # 含单引号，用双引号包裹
s4 = 'He said "hello"'     # 含双引号，用单引号包裹
s5 = '''多行字符串
第二行
第三行'''
print(s1)
print(s2)
print(s3)
print(s4)
print("--- 多行字符串 ---")
print(s5)

# 字符串不可变
s = "hello"
# s[0] = "H"  # TypeError: 字符串不可修改
s = "Hello"    # 这是让 s 指向新字符串
print("重新赋值后:", s)

# ---- 2. 索引与切片 ----
print("\\n========== 2. 索引与切片 ==========")
s = "Python"
#     P  y  t  h  o  n
#     0  1  2  3  4  5   正向索引
#    -6 -5 -4 -3 -2 -1   负向索引

print(f"字符串: {s}")
print(f"s[0] = {s[0]}")         # P，第一个
print(f"s[-1] = {s[-1]}")       # n，最后一个
print(f"s[-2] = {s[-2]}")       # o，倒数第二个

# 切片 s[start:stop:step]
print(f"s[0:3] = {s[0:3]}")     # Pyt
print(f"s[:3] = {s[:3]}")       # Pyt
print(f"s[3:] = {s[3:]}")       # hon
print(f"s[::2] = {s[::2]}")     # Pto，步长2
print(f"s[::-1] = {s[::-1]}")   # nohtyP，反转
print(f"s[-3:] = {s[-3:]}")     # hon，最后3个

# 切片不越界
print(f"s[0:100] = {s[0:100]}")  # Python，不报错
print(f"s[10:20] = {repr(s[10:20])}")  # ''，空字符串

# ---- 3. 字符串拼接 ----
print("\\n========== 3. 字符串拼接 ==========")
# + 拼接
print("Hello" + " " + "World")

# * 重复
print("ab" * 3)
print("-" * 20)

# join 方法（推荐用于多字符串拼接）
words = ["Hello", "World", "Python"]
print(" ".join(words))
print("-".join(words))
print("".join(words))

# 隐式拼接（相邻字面量自动连接）
long_str = ("这是一个"
            "很长的字符串"
            "被分成多行书写")
print(long_str)

# ---- 4. 字符串格式化 ----
print("\\n========== 4. 字符串格式化 ==========")
name = "张三"
age = 28
pi = 3.14159265

# 方式一：% 格式化（C 风格）
print("我叫%s，今年%d岁" % (name, age))
print("圆周率: %.2f" % pi)
print("百分比: %d%%" % 85)

# 方式二：str.format()
print("我叫{}，今年{}岁".format(name, age))
print("{0}说{1}，{0}又说{1}".format("我", "你好"))
print("我叫{name}，今年{age}岁".format(name="李四", age=30))
print("{:.2f}".format(pi))
print("{:,}".format(1000000))
print("{:>10}".format("right"))   # 右对齐
print("{:<10}|".format("left"))   # 左对齐
print("{:^10}".format("center"))  # 居中
print("{:0>5}".format(42))        # 补零

# 方式三：f-string（推荐，Python 3.6+）
print(f"我叫{name}，今年{age}岁")
print(f"明年我{age + 1}岁")
print(f"圆周率: {pi:.2f}")
print(f"百分比: {0.85:.1%}")
print(f"千分位: {1000000:,}")
print(f"二进制: {42:b}")
print(f"十六进制: {255:#x}")
print(f"右对齐: |{42:>10}|")
print(f"补零: {42:0>5}")

# ---- 5. 大小写转换 ----
print("\\n========== 5. 大小写转换 ==========")
s = "Hello World"
print(f"原字符串: {s}")
print(f"upper: {s.upper()}")
print(f"lower: {s.lower()}")
print(f"title: {s.title()}")
print(f"capitalize: {s.capitalize()}")
print(f"swapcase: {s.swapcase()}")

# ---- 6. 去除空白字符 ----
print("\\n========== 6. 去除空白字符 ==========")
s = "  Hello World  "
print(f"原字符串: |{s}|")
print(f"strip:  |{s.strip()}|")
print(f"lstrip: |{s.lstrip()}|")
print(f"rstrip: |{s.rstrip()}|")

# 指定去除字符
s2 = "###Hello###"
print(f"strip('#'): |{s2.strip('#')}|")

# ---- 7. 查找与替换 ----
print("\\n========== 7. 查找与替换 ==========")
s = "Hello, World, Hello Python"
print(f"字符串: {s}")
print(f"find('World'): {s.find('World')}")     # 7
print(f"find('Java'): {s.find('Java')}")       # -1
print(f"rfind('Hello'): {s.rfind('Hello')}")   # 15
print(f"count('Hello'): {s.count('Hello')}")   # 2
print(f"count('o'): {s.count('o')}")           # 4
print(f"replace('Hello', 'Hi'): {s.replace('Hello', 'Hi')}")
print(f"replace 1次: {s.replace('Hello', 'Hi', 1)}")

# ---- 8. 分割与连接 ----
print("\\n========== 8. 分割与连接 ==========")
s = "苹果,香蕉,橘子,葡萄"
print(f"split(','): {s.split(',')}")
print(f"split(',', 2): {s.split(',', 2)}")

s2 = "Hello   World   Python"
print(f"split(): {s2.split()}")  # 按任意空白分割

s3 = "第一行\\n第二行\\n第三行"
print(f"splitlines(): {s3.splitlines()}")

# join 连接
words = ["Hello", "World"]
print(f"' '.join: {' '.join(words)}")
print(f"'-'.join: {'-'.join(words)}")

# ---- 9. 判断类方法 ----
print("\\n========== 9. 判断类方法 ==========")
print(f"'hello'.isalpha(): {'hello'.isalpha()}")       # True
print(f"'hello123'.isalpha(): {'hello123'.isalpha()}") # False
print(f"'12345'.isdigit(): {'12345'.isdigit()}")       # True
print(f"'hello123'.isalnum(): {'hello123'.isalnum()}") # True
print(f"'   '.isspace(): {'   '.isspace()}")           # True
print(f"'HELLO'.isupper(): {'HELLO'.isupper()}")       # True
print(f"'hello'.islower(): {'hello'.islower()}")       # True

# ---- 10. 前缀后缀判断 ----
print("\\n========== 10. startswith / endswith ==========")
s = "Hello World"
print(f"'{s}'.startswith('Hello'): {s.startswith('Hello')}")   # True
print(f"'{s}'.endswith('World'): {s.endswith('World')}")       # True
print(f"'{s}'.endswith('world'): {s.endswith('world')}")       # False（区分大小写）

# ---- 11. 转义字符 ----
print("\\n========== 11. 转义字符 ==========")
print("第一行\\n第二行")       # 换行
print("A\\tB\\tC")            # 制表符
print("路径: C:\\\\Users\\\\Admin")  # 反斜杠
print('单引号内: It\\'s a pen')
print("双引号内: He said \\"hi\\"")

# ---- 12. 原始字符串 ----
print("\\n========== 12. 原始字符串 ==========")
# 普通字符串：\\n 是换行
print("普通: \\n 不是换行前的文字")
# 原始字符串：\\n 就是反斜杠+n
print(r"原始: \\n 就是反斜杠加n")
# 路径用原始字符串最方便
print(r"C:\\Users\\Admin\\Desktop")

# ---- 13. encode 与 decode ----
print("\\n========== 13. encode 与 decode ==========")
# str 与 bytes 的区别
text = "你好"
print(f"str: {text}, 类型: {type(text).__name__}")

# encode: str -> bytes
b = text.encode("utf-8")
print(f"encode utf-8: {b}, 类型: {type(b).__name__}, 长度: {len(b)}")

b_gbk = text.encode("gbk")
print(f"encode gbk: {b_gbk}, 长度: {len(b_gbk)}")

# decode: bytes -> str
decoded = b.decode("utf-8")
print(f"decode utf-8: {decoded}")

# 英文字符
en = "Hello"
b_en = en.encode("utf-8")
print(f"'Hello' 编码: {b_en}, 长度: {len(b_en)}")  # 5 字节

# ---- 14. 其他常用技巧 ----
print("\\n========== 14. 字符串常用技巧 ==========")
# 反转字符串
s = "Hello"
print(f"反转 '{s}': {s[::-1]}")

# 判断回文
def is_palindrome(word):
    return word == word[::-1]
print(f"'level' 是回文: {is_palindrome('level')}")
print(f"'hello' 是回文: {is_palindrome('hello')}")

# 字符串对齐
print("对齐演示:")
for i in range(1, 4):
    print(f"  {'第' + str(i) + '行':.<20}OK")

# ord 和 chr
print(f"ord('A') = {ord('A')}")
print(f"chr(65) = {chr(65)}")
print(f"chr(20013) = {chr(20013)}")  # '中'

# 判断包含
print(f"'ell' in 'Hello': {'ell' in 'Hello'}")
print(f"'abc' in 'Hello': {'abc' in 'Hello'}")

print("\\n字符串演示完成！")
`,
  },

  // =========================================================
  // 第四章：运算符与表达式
  // =========================================================
  {
    id: "py-operators",
    group: "基础",
    icon: "⚙️",
    title: "运算符与表达式",
    content: `## 运算符与表达式

**运算符（Operator）** 是告诉 Python 执行某种运算的符号，**表达式（Expression）** 是由运算符和操作数组成的、能计算出结果的代码片段。本章将全面讲解 Python 的所有运算符类型、优先级规则，以及一些高级特性如海象运算符和条件表达式。

### 算术运算符

Python 支持以下算术运算符：

| 运算符 | 含义 | 示例 | 结果 |
| --- | --- | --- | --- |
| \`+\` | 加法 | \`3 + 2\` | \`5\` |
| \`-\` | 减法 | \`5 - 2\` | \`3\` |
| \`*\` | 乘法 | \`3 * 4\` | \`12\` |
| \`/\` | 真除法 | \`7 / 2\` | \`3.5\` |
| \`//\` | 地板除（整除） | \`7 // 2\` | \`3\` |
| \`%\` | 取余（取模） | \`7 % 3\` | \`1\` |
| \`**\` | 幂运算 | \`2 ** 3\` | \`8\` |

#### 加减乘

\`\`\`python
print(3 + 2)    # 5
print(3 - 2)    # 1
print(3 * 4)    # 12
\`\`\`

\`+\` 和 \`*\` 还可以用于字符串和序列：

\`\`\`python
print("Hello" + " World")   # "Hello World"，字符串拼接
print("ab" * 3)             # "ababab"，字符串重复
print([1, 2] + [3, 4])      # [1, 2, 3, 4]，列表拼接
print([0] * 5)              # [0, 0, 0, 0, 0]，列表重复
\`\`\`

#### 真除法 / vs 地板除 //

\`\`\`python
print(7 / 2)     # 3.5，真除法，结果总是 float
print(7 // 2)    # 3，地板除，向下取整
print(-7 // 2)   # -4，注意！向下取整（不是向零取整）
print(7 // 2.0)  # 3.0，如果有浮点数，结果也是浮点
\`\`\`

**重要**：Python 的 \`//\` 是**向下取整**（floor），不是向零取整（truncation）。对于负数结果不同：
- \`-7 // 2 = -4\`（向下取整，-3.5 向下是 -4）
- C/Java 的 \`-7 / 2 = -3\`（向零取整）

#### 取余 %

\`\`\`python
print(7 % 3)     # 1
print(10 % 4)    # 2
print(-7 % 3)    # 2，注意！Python 的取余结果符号与除数相同
print(7 % -3)    # -2
\`\`\`

取余运算常用于：
- 判断奇偶：\`n % 2 == 0\` 是偶数
- 周期性取值：\`i % len\`
- 取数字的各位：\`123 % 10 = 3\`（个位）

#### 幂运算 **

\`\`\`python
print(2 ** 10)       # 1024
print(2 ** 0.5)      # 1.4142135623730951，平方根
print(4 ** -1)       # 0.25，倒数
print((-8) ** (1/3)) # 复数结果（注意负数开三次方）
\`\`\`

### 比较运算符

比较运算符返回布尔值 \`True\` 或 \`False\`：

| 运算符 | 含义 | 示例 | 结果 |
| --- | --- | --- | --- |
| \`==\` | 等于 | \`3 == 3\` | \`True\` |
| \`!=\` | 不等于 | \`3 != 4\` | \`True\` |
| \`>\` | 大于 | \`5 > 3\` | \`True\` |
| \`<\` | 小于 | \`5 < 3\` | \`False\` |
| \`>=\` | 大于等于 | \`5 >= 5\` | \`True\` |
| \`<=\` | 小于等于 | \`5 <= 4\` | \`False\` |

\`\`\`python
print(3 == 3)     # True
print(3 != 4)     # True
print(5 > 3)      # True
print(5 < 3)      # False
print(5 >= 5)     # True
print(5 <= 4)     # False
\`\`\`

#### 链式比较

Python 支持**链式比较**，这是其他语言没有的便捷特性：

\`\`\`python
x = 5                          # Python 支持链式比较
# 等价于 0 < x and x < 10
print(0 < x < 10)    # True
print(0 < x > 3)     # True，等价于 0 < x and x > 3

# 判断范围
age = 25
if 18 <= age <= 60:    # 链式比较：等价于 18 <= age and age <= 60
    print("适龄劳动力")
\`\`\`

#### == 比较不同类型

\`\`\`python
print(1 == 1.0)       # True，整数和浮点数比较值
print(1 == True)      # True，True 等于 1
print(0 == False)     # True，False 等于 0
print("1" == 1)       # False，不同类型值不相等
print([1, 2] == [1, 2])  # True，列表比较元素
\`\`\`

### 逻辑运算符

Python 使用英文单词而非符号作为逻辑运算符：

| 运算符 | 含义 | 示例 |
| --- | --- | --- |
| \`and\` | 与（两者都真才真） | \`True and False\` → \`False\` |
| \`or\` | 或（有一真就真） | \`True or False\` → \`True\` |
| \`not\` | 非（取反） | \`not True\` → \`False\` |

\`\`\`python
print(True and False)    # False
print(True or False)     # True
print(not True)          # False
print(not False)         # True
print(not 0)             # True（0 是假值，not 0 为真）
print(not "")            # True（空字符串是假值）
\`\`\`

#### and/or 的返回值

与许多语言不同，Python 的 \`and\` 和 \`or\` **不返回布尔值**，而是返回决定结果的那个操作数：

\`\`\`python
# and：如果第一个为假，返回第一个；否则返回第二个
print(0 and 1)       # 0（第一个为假，直接返回 0）
print(2 and 3)       # 3（第一个为真，返回第二个）
print("" and "hi")   # ""（空字符串为假）
print("a" and "b")   # "b"

# or：如果第一个为真，返回第一个；否则返回第二个
print(0 or 1)        # 1（第一个为假，返回第二个）
print(2 or 3)        # 2（第一个为真，直接返回 2）
print("" or "默认值") # "默认值"
print(None or 0)     # 0
\`\`\`

这个特性常用于设置默认值：

\`\`\`python
# 利用 or 设置默认值
name = input_name or "匿名"      # input_name 为假值时回退到 "匿名"
# 等价于：
# if input_name:
#     name = input_name
# else:
#     name = "匿名"
\`\`\`

### 短路求值（Short-circuit Evaluation）

\`and\` 和 \`or\` 具有**短路特性**：如果根据第一个操作数就能确定结果，就不会计算第二个操作数。

\`\`\`python
# and 短路：第一个为假，不计算第二个
def expensive_func():              # 定义一个开销大的函数
    print("函数被调用了")           # 打印调用标记
    return True                    # 返回 True

result = False and expensive_func()   # 不会打印"函数被调用了"
# 因为 False and ... 一定是 False，不需要计算右边

# or 短路：第一个为真，不计算第二个
result = True or expensive_func()     # 不会打印"函数被调用了"
# 因为 True or ... 一定是 True，不需要计算右边
\`\`\`

短路求值常用于**安全访问**：

\`\`\`python
# 避免 None 上的属性访问错误
if user is not None and user.is_active:   # 先判空再访问属性，防止 AttributeError
    print("用户活跃")

# 避免除零错误
if denominator != 0 and numerator / denominator > 1:   # 先判非零再做除法
    print("分子大于分母")
\`\`\`

### 赋值运算符

#### 基本赋值

\`\`\`python
x = 10        # 基本赋值
x = y = 20    # 链式赋值，x 和 y 都是 20
x, y = 1, 2   # 多重赋值
x, y = y, x   # 交换变量
\`\`\`

#### 复合赋值运算符

| 运算符 | 等价于 | 示例 |
| --- | --- | --- |
| \`+=\` | \`x = x + y\` | \`x += 5\` |
| \`-=\` | \`x = x - y\` | \`x -= 3\` |
| \`*=\` | \`x = x * y\` | \`x *= 2\` |
| \`/=\` | \`x = x / y\` | \`x /= 4\` |
| \`//=\` | \`x = x // y\` | \`x //= 3\` |
| \`%=\` | \`x = x % y\` | \`x %= 3\` |
| \`**=\` | \`x = x ** y\` | \`x **= 2\` |

\`\`\`python
x = 10                    # 复合赋值运算符：op= 等价于 x = x op y
x += 5      # x = 15
x -= 3      # x = 12
x *= 2      # x = 24
x /= 4      # x = 6.0
x //= 2     # x = 3.0
x **= 2     # x = 9.0
\`\`\`

**注意**：对于可变类型（如列表），\`+=\` 是**原地修改**（\`__iadd__\`），而 \`+\` 是创建新对象：

\`\`\`python
a = [1, 2]
b = a                  # b 与 a 同一对象
a += [3]       # 原地修改，b 也变了
print(b)       # [1, 2, 3]

a = [1, 2]
b = a
a = a + [3]    # 创建新列表，b 不变
print(b)       # [1, 2]
\`\`\`

### 位运算符

位运算直接操作整数的二进制位：

| 运算符 | 含义 | 示例 | 说明 |
| --- | --- | --- | --- |
| \`&\` | 按位与 | \`5 & 3\` → \`1\` | 两位都为 1 才为 1 |
| \`|\` \| 按位或 \| \`5 | 3\` → \`7\` | 有一位为 1 就为 1 |
| \`^\` | 按位异或 | \`5 ^ 3\` → \`6\` | 两位不同为 1 |
| \`~\` | 按位取反 | \`~5\` → \`-6\` | 0 变 1，1 变 0 |
| \`<<\` | 左移 | \`5 << 2\` → \`20\` | 左移 n 位 = 乘 2^n |
| \`>>\` | 右移 | \`20 >> 2\` → \`5\` | 右移 n 位 = 除 2^n |

\`\`\`python
# 5 的二进制: 101
# 3 的二进制: 011
print(5 & 3)    # 1   (001)
print(5 | 3)    # 7   (111)
print(5 ^ 3)    # 6   (110)
print(~5)       # -6  (取反，相当于 -(x+1))
print(5 << 2)   # 20  (10100，左移2位 = 5 * 4)
print(20 >> 2)  # 5   (101，右移2位 = 20 // 4)
\`\`\`

位运算的常见用途：

\`\`\`python
# 判断奇偶（比 n % 2 更快）
n = 7
if n & 1:                  # 与运算：最低位为 1 即奇数
    print("奇数")
else:
    print("偶数")

# 交换两个数（不用临时变量）
a, b = 3, 5
a = a ^ b                  # 异或
b = a ^ b                  # 利用异或可逆性恢复
a = a ^ b
print(a, b)  # 5 3

# 权限标志（位掩码）
READ = 4      # 100
WRITE = 2     # 010
EXECUTE = 1   # 001
permission = READ | WRITE   # 110 = 6   按位或组合权限
print(permission & READ)    # 4，有读权限
print(permission & EXECUTE) # 0，无执行权限
\`\`\`

### 成员运算符

| 运算符 | 含义 | 示例 |
| --- | --- | --- |
| \`in\` | 是否包含 | \`3 in [1, 2, 3]\` → \`True\` |
| \`not in\` | 是否不包含 | \`4 not in [1, 2, 3]\` → \`True\` |

\`\`\`python
# 列表
print(3 in [1, 2, 3])        # True
print(4 in [1, 2, 3])        # False

# 字符串
print("ell" in "Hello")      # True
print("abc" in "Hello")      # False

# 字典（判断键）
print("name" in {"name": "张三"})  # True
print("张三" in {"name": "张三"})  # False（字典的 in 查的是键）

# 元组、集合
print(2 in (1, 2, 3))        # True
print(2 in {1, 2, 3})        # True
\`\`\`

**性能提示**：\`in\` 在**集合和字典**中查找是 O(1)（哈希查找），在**列表和元组**中是 O(n)（线性查找）。大量查找时，把列表转成集合：

\`\`\`python
# 慢：列表查找 O(n)
# if item in large_list: ...

# 快：集合查找 O(1)
large_set = set(large_list)      # 预先转为集合，查找复杂度降为 O(1)
# if item in large_set: ...
\`\`\`

### 身份运算符

| 运算符 | 含义 | 示例 |
| --- | --- | --- |
| \`is\` | 是否同一对象 | \`a is b\` |
| \`is not\` | 是否不同对象 | \`a is not b\` |

\`\`\`python
a = [1, 2]
b = [1, 2]            # 值相同但不同对象
c = a                 # c 与 a 同一对象

print(a is c)         # True，a 和 c 是同一个对象
print(a is b)         # False，a 和 b 不是同一个对象
print(a == b)         # True，但值相等
print(a is not b)     # True
\`\`\`

**is vs == 的区别**：
- \`is\` 比较对象的**身份**（内存地址，id）
- \`==\` 比较对象的**值**

**None 判断用 is**：

\`\`\`python
x = None                # None 是单例，判断身份用 is
if x is None:       # ✅ 推荐
    print("x 是 None")
# 不要用 x == None
\`\`\`

### 运算符优先级

当表达式中出现多个运算符时，按优先级从高到低计算。可以用括号 \`()\` 改变优先级。

**优先级从高到低**（常见运算符）：

| 优先级 | 运算符 | 说明 |
| --- | --- | --- |
| 1（最高） | \`**\` | 幂运算 |
| 2 | \`~x\`, \`+x\`, \`-x\` | 按位取反、正负号 |
| 3 | \`*\`, \`/\`, \`//\`, \`%\` | 乘除 |
| 4 | \`+\`, \`-\` | 加减 |
| 5 | \`<<\`, \`>>\` | 位移 |
| 6 | \`&\` | 按位与 |
| 7 | \`^\` | 按位异或 |
| 8 \| \`|\` | 按位或 |
| 9 | \`==\`, \`!=\`, \`>\`, \`<\`, \`>=\`, \`<=\`, \`is\`, \`in\` | 比较/身份/成员 |
| 10 | \`not\` | 逻辑非 |
| 11 | \`and\` | 逻辑与 |
| 12 | \`or\` | 逻辑或 |
| 13 | \`:=\` | 海象运算符 |
| 14（最低） | \`lambda\` | lambda 表达式 |

\`\`\`python
# 优先级示例
print(2 + 3 * 4)       # 14，先乘后加
print((2 + 3) * 4)     # 20，括号改变优先级

print(2 ** 3 ** 2)     # 512，幂运算从右到左：2 ** (3 ** 2) = 2 ** 9

print(True or False and False)  # True，and 优先级高于 or
# 等价于 True or (False and False) = True or False = True

print(not True or False)  # False，not 优先级高于 or
# 等价于 (not True) or False = False or False = False
\`\`\`

**最佳实践**：不要死记优先级，**多用括号**让意图清晰：

\`\`\`python
# 不清晰
result = a + b * c & d        # 依赖默认优先级，可读性差

# 清晰
result = a + (b * c) & d       # 用括号明确意图，避免歧义
\`\`\`

### 海象运算符 := （Python 3.8+）

海象运算符（Walrus Operator）\`:=\` 可以在表达式内部进行**赋值并返回值**。它的形状像海象的眼睛和牙齿（:=），因此得名。

#### 基本语法

\`\`\`python
# 传统写法
n = 10                # 先赋值
if n > 5:             # 再判断
    print(f"n={n}，大于5")

# 海象运算符
if (n := 10) > 5:     # := 在表达式内部赋值并返回值，n 被赋为 10
    print(f"n={n}，大于5")
\`\`\`

#### 常见使用场景

**1. while 循环中读取输入**

\`\`\`python
# 传统写法：重复调用 input
# line = input()
# while line != "quit":
#     process(line)
#     line = input()

# 海象运算符：简洁
# while (line := input()) != "quit":
#     process(line)
\`\`\`

**2. 列表推导式中复用计算结果**

\`\`\`python
# 传统写法：调用两次 f(x)
# results = [f(x) for x in data if f(x) > threshold]

# 海象运算符：只调用一次
# results = [y for x in data if (y := f(x)) > threshold]
\`\`\`

**3. 条件判断中赋值**

\`\`\`python
# 传统写法
# match = re.search(pattern, text)
# if match:
#     print(match.group())

# 海象运算符
# if (match := re.search(pattern, text)):
#     print(match.group())
\`\`\`

**4. 处理可选值**

\`\`\`python
# 传统写法
# value = get_value()
# if value is not None:
#     process(value)

# 海象运算符
# if (value := get_value()) is not None:
#     process(value)
\`\`\`

**注意**：海象运算符需要**括号**包裹，因为 \`=\` 的优先级低于比较运算符。\`(n := 10) > 5\` 是正确的，\`n := 10 > 5\` 会报语法错误。

### 条件表达式（三元运算符）

Python 的条件表达式语法：

\`\`\`python
# 语法：值1 if 条件 else 值2
# 条件为真返回值1，否则返回值2

age = 20
status = "成年" if age >= 18 else "未成年"   # 三元表达式，单行条件赋值
print(status)   # "成年"

# 等价于
if age >= 18:                 # 普通 if/else 写法
    status = "成年"
else:
    status = "未成年"
\`\`\`

#### 嵌套条件表达式

\`\`\`python
score = 85
grade = "优秀" if score >= 90 else ("良好" if score >= 80 else "及格")   # 嵌套三元，慎用以免可读性下降
print(grade)  # "良好"
\`\`\`

嵌套条件表达式可读性差，不宜嵌套太深。复杂逻辑用 if-elif-else 更清晰。

#### 条件表达式的应用

\`\`\`python
# 设置默认值
name = input_name if input_name else "匿名"   # input_name 为真用原值，否则用"匿名"

# 选择较大的值
max_val = a if a > b else b                    # a 大返回 a，否则返回 b

# 格式化输出
status = "✅" if success else "❌"              # success 为真显示对号，否则显示叉号
\`\`\`

### 运算符重载（简介）

Python 允许自定义类通过**魔术方法**重载运算符：

\`\`\`python
class Vector:
    def __init__(self, x, y):       # 构造方法，初始化向量
        self.x = x                  # 设置 x 坐标
        self.y = y                  # 设置 y 坐标

    # 重载 + 运算符
    def __add__(self, other):       # 定义 + 的行为
        return Vector(self.x + other.x, self.y + other.y)   # 返回新向量

    # 重载 == 运算符
    def __eq__(self, other):        # 定义 == 的行为
        return self.x == other.x and self.y == other.y       # 比较两个向量的坐标

    def __repr__(self):             # 定义对象的字符串表示
        return f"Vector({self.x}, {self.y})"

v1 = Vector(1, 2)                   # 创建向量 v1
v2 = Vector(3, 4)                   # 创建向量 v2
print(v1 + v2)        # Vector(4, 6)
print(v1 == Vector(1, 2))  # True
\`\`\`

常用运算符对应的魔术方法：

| 运算符 | 魔术方法 |
| --- | --- |
| \`+\` | \`__add__\` |
| \`-\` | \`__sub__\` |
| \`*\` | \`__mul__\` |
| \`/\` | \`__truediv__\` |
| \`==\` | \`__eq__\` |
| \`<\` | \`__lt__\` |
| \`>\` | \`__gt__\` |
| \`in\` | \`__contains__\` |
| \`len()\` | \`__len__\` |
| \`str()\` | \`__str__\` |

### 表达式与语句的区别

- **表达式（Expression）**：能计算出一个值。如 \`3 + 5\`、\`x > 0\`、\`len(s)\`、\`a if b else c\`。
- **语句（Statement）**：执行一个动作，不一定有返回值。如 \`if\`、\`for\`、\`while\`、\`import\`、\`def\`、\`class\`、\`x = 5\`。

\`\`\`python
# 表达式
3 + 5              # 值为 8
x > 0 and y > 0    # 值为 True/False
[1, 2] + [3]       # 值为 [1, 2, 3]

# 语句
x = 5              # 赋值语句
if x > 0:          # if 语句
    print(x)
import os          # import 语句
\`\`\`

在 Python REPL 中，表达式会自动打印结果，语句不会。

### 本节代码演示

下面这段代码综合演示了所有运算符类型：算术、比较、逻辑、赋值、位运算、成员、身份，以及运算符优先级、短路求值、海象运算符和条件表达式。运行后仔细观察每个运算符的行为。`,
    code: `# ============================================================
# 第四章代码演示：运算符与表达式
# ============================================================
# 本代码演示：算术、比较、逻辑、赋值、位运算、成员、身份、
# 运算符优先级、短路求值、海象运算符、条件表达式

# ---- 1. 算术运算符 ----
print("\\n========== 1. 算术运算符 ==========")
print("加法: 3 + 2 =", 3 + 2)
print("减法: 5 - 2 =", 5 - 2)
print("乘法: 3 * 4 =", 3 * 4)
print("真除法: 7 / 2 =", 7 / 2)       # 3.5
print("地板除: 7 // 2 =", 7 // 2)     # 3
print("负数地板除: -7 // 2 =", -7 // 2)  # -4（向下取整）
print("取余: 7 % 3 =", 7 % 3)         # 1
print("负数取余: -7 % 3 =", -7 % 3)   # 2（结果符号与除数相同）
print("幂运算: 2 ** 10 =", 2 ** 10)   # 1024
print("平方根: 2 ** 0.5 =", 2 ** 0.5)

# 字符串和列表的 + 与 *
print("\\n序列运算:")
print("'Hello' + ' World':", "Hello" + " World")
print("'ab' * 3:", "ab" * 3)
print("[1,2] + [3,4]:", [1, 2] + [3, 4])
print("[0] * 5:", [0] * 5)

# ---- 2. 比较运算符 ----
print("\\n========== 2. 比较运算符 ==========")
print("3 == 3:", 3 == 3)
print("3 != 4:", 3 != 4)
print("5 > 3:", 5 > 3)
print("5 < 3:", 5 < 3)
print("5 >= 5:", 5 >= 5)
print("5 <= 4:", 5 <= 4)

# 链式比较（Python 特色）
x = 5
print(f"0 < {x} < 10:", 0 < x < 10)   # True
print(f"0 < {x} > 3:", 0 < x > 3)     # True

# == 跨类型比较
print("1 == 1.0:", 1 == 1.0)          # True
print("1 == True:", 1 == True)        # True
print("0 == False:", 0 == False)      # True
print("'1' == 1:", "1" == 1)          # False

# ---- 3. 逻辑运算符 ----
print("\\n========== 3. 逻辑运算符 ==========")
print("True and False:", True and False)
print("True or False:", True or False)
print("not True:", not True)
print("not 0:", not 0)
print("not '':", not "")

# and/or 返回值（不一定是布尔值）
print("\\nand/or 返回值:")
print("0 and 1:", 0 and 1)            # 0
print("2 and 3:", 2 and 3)            # 3
print("0 or 1:", 0 or 1)              # 1
print("2 or 3:", 2 or 3)              # 2
print("'' or '默认':", "" or "默认")  # 默认

# 利用 or 设置默认值
user_input = ""
name = user_input or "匿名用户"
print(f"默认值设置: name = {name}")

# ---- 4. 短路求值 ----
print("\\n========== 4. 短路求值 ==========")
def expensive():
    print("  （expensive 函数被调用了）")
    return True

print("False and expensive():")
result = False and expensive()    # 不会调用 expensive
print(f"  结果: {result}")

print("True or expensive():")
result = True or expensive()      # 不会调用 expensive
print(f"  结果: {result}")

print("True and expensive():")
result = True and expensive()     # 会调用 expensive
print(f"  结果: {result}")

# 短路求值用于安全访问
data = None
if data is not None and len(data) > 0:
    print("  有数据")
else:
    print("  安全访问：data 为 None 时不报错")

# ---- 5. 赋值运算符 ----
print("\\n========== 5. 赋值运算符 ==========")
x = 10
print(f"x = {x}")
x += 5
print(f"x += 5 -> {x}")
x -= 3
print(f"x -= 3 -> {x}")
x *= 2
print(f"x *= 2 -> {x}")
x //= 4
print(f"x //= 4 -> {x}")
x **= 2
print(f"x **= 2 -> {x}")

# 多重赋值
a, b, c = 1, 2, 3
print(f"多重赋值: a={a}, b={b}, c={c}")

# 交换变量
a, b = b, a
print(f"交换后: a={a}, b={b}")

# 链式赋值
p = q = 100
print(f"链式赋值: p={p}, q={q}")

# ---- 6. 位运算符 ----
print("\\n========== 6. 位运算符 ==========")
print("5 & 3 =", 5 & 3)    # 1  (101 & 011 = 001)
print("5 | 3 =", 5 | 3)    # 7  (101 | 011 = 111)
print("5 ^ 3 =", 5 ^ 3)    # 6  (101 ^ 011 = 110)
print("~5 =", ~5)          # -6 (取反 = -(x+1))
print("5 << 2 =", 5 << 2)  # 20 (左移2位 = *4)
print("20 >> 2 =", 20 >> 2)  # 5  (右移2位 = //4)

# 位运算应用：判断奇偶
n = 7
print(f"\\n{n} & 1 = {n & 1}（1=奇数, 0=偶数）")
n = 8
print(f"{n} & 1 = {n & 1}（1=奇数, 0=偶数）")

# 位掩码权限
READ = 4    # 100
WRITE = 2   # 010
EXEC = 1    # 001
perm = READ | WRITE    # 110 = 6
print(f"权限 {perm} & READ = {perm & READ}（有读权限）")
print(f"权限 {perm} & EXEC = {perm & EXEC}（无执行权限）")

# ---- 7. 成员运算符 ----
print("\\n========== 7. 成员运算符 in / not in ==========")
print("3 in [1,2,3]:", 3 in [1, 2, 3])
print("4 in [1,2,3]:", 4 in [1, 2, 3])
print("4 not in [1,2,3]:", 4 not in [1, 2, 3])

# 字符串成员判断
print("'ell' in 'Hello':", "ell" in "Hello")
print("'abc' in 'Hello':", "abc" in "Hello")

# 字典成员判断（查的是键）
d = {"name": "张三", "age": 28}
print("'name' in dict:", "name" in d)       # True
print("'张三' in dict:", "张三" in d)       # False（值不在键中）

# ---- 8. 身份运算符 ----
print("\\n========== 8. 身份运算符 is / is not ==========")
a = [1, 2]
b = [1, 2]
c = a
print(f"a = {a}, b = {b}, c = a")
print(f"a is c: {a is c}")       # True，同一对象
print(f"a is b: {a is b}")       # False，不同对象
print(f"a == b: {a == b}")       # True，值相等
print(f"a is not b: {a is not b}")  # True

# None 判断用 is
x = None
print(f"x is None: {x is None}")  # True（推荐）
print(f"x is not None: {x is not None}")  # False

# ---- 9. 运算符优先级 ----
print("\\n========== 9. 运算符优先级 ==========")
print("2 + 3 * 4 =", 2 + 3 * 4)           # 14，先乘后加
print("(2 + 3) * 4 =", (2 + 3) * 4)       # 20，括号优先
print("2 ** 3 ** 2 =", 2 ** 3 ** 2)       # 512，幂从右到左

# 逻辑运算符优先级: not > and > or
print("True or False and False:", True or False and False)  # True
print("not True or False:", not True or False)              # False

# 比较和算术的优先级
print("1 + 2 > 2:", 1 + 2 > 2)            # True，先算 1+2 再比较

# ---- 10. 海象运算符 := (Python 3.8+) ----
print("\\n========== 10. 海象运算符 := ==========")
# 在表达式中赋值
if (n := 15) > 10:
    print(f"n = {n}，大于 10")

# 列表推导式中复用计算结果
data = [1, 2, 3, 4, 5, 6]
# 传统写法需要调用两次
# squares = [x**2 for x in data if x**2 > 10]
# 海象运算符只计算一次
squares = [y for x in data if (y := x ** 2) > 10]
print(f"平方大于10的: {squares}")

# 条件赋值
text = "Hello"
if (length := len(text)) > 3:
    print(f"'{text}' 长度为 {length}，超过3个字符")

# ---- 11. 条件表达式（三元运算符）----
print("\\n========== 11. 条件表达式 ==========")
age = 20
status = "成年" if age >= 18 else "未成年"
print(f"年龄 {age}: {status}")

age = 15
status = "成年" if age >= 18 else "未成年"
print(f"年龄 {age}: {status}")

# 取较大值
a, b = 10, 20
max_val = a if a > b else b
print(f"max({a}, {b}) = {max_val}")

# 判断奇偶
n = 7
parity = "奇数" if n % 2 != 0 else "偶数"
print(f"{n} 是 {parity}")

# 嵌套条件表达式（不宜过深）
score = 85
grade = "优秀" if score >= 90 else ("良好" if score >= 80 else "及格")
print(f"成绩 {score}: {grade}")

# ---- 12. 综合练习 ----
print("\\n========== 12. 综合应用 ==========")
# 判断闰年
def is_leap_year(year):
    # 闰年规则：能被4整除但不能被100整除，或能被400整除
    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)

years = [2000, 2020, 2021, 2024, 1900]
for y in years:
    result = "闰年" if is_leap_year(y) else "平年"
    print(f"  {y} 年是{result}")

# 计算 BMI 并判断体型
def calc_bmi(weight, height):
    bmi = weight / (height ** 2)
    if bmi < 18.5:
        category = "偏瘦"
    elif bmi < 24:
        category = "正常"
    elif bmi < 28:
        category = "偏胖"
    else:
        category = "肥胖"
    return bmi, category

weight, height = 70, 1.75
bmi, category = calc_bmi(weight, height)
print(f"体重{weight}kg，身高{height}m，BMI={bmi:.1f}，体型：{category}")

# 运算符重载演示
print("\\n--- 运算符重载 ---")
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)
    def __eq__(self, other):
        return self.x == other.x and self.y == other.y
    def __repr__(self):
        return f"Vector({self.x}, {self.y})"

v1 = Vector(1, 2)
v2 = Vector(3, 4)
print(f"v1 + v2 = {v1 + v2}")
print(f"v1 == Vector(1,2): {v1 == Vector(1, 2)}")

print("\\n运算符与表达式演示完成！")
`,
  },
];