// =============================================================
// Python 原理图解教程 —— 第一批章节（共 6 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   执行流程（3 章）：
//     1. pyint-overview     — Python 是怎么运行代码的
//     2. pyint-interpreted  — 解释型 vs 编译型真相
//     3. pyint-flow         — 从源码到运行的完整流程
//   字节码与虚拟机（3 章）：
//     4. pyint-bytecode     — 字节码是什么
//     5. pyint-dis          — 用 dis 看代码真面目
//     6. pyint-pvm          — Python 虚拟机如何执行
//
// 每个章节包含：
//   id      : 唯一标识
//   group   : 分组名
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解（文字量大，含表格、图示、代码块）
//   code    : 可运行、带详细中文注释的 Python 示例代码
//
// 代码运行环境约束：
//   - 用 python3 直接运行，10 秒超时
//   - 仅使用 Python 标准库（dis, sys, ast, tokenize, io 等）
//   - 通过 print 输出结果
//   - 单文件可独立运行
//
// 转义规则：content/code 内部反引号写作 \`，\${ 写作 \$\{，
//           Python 代码中的 \n 写作 \\n。
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：Python 是怎么运行代码的
  // =========================================================
  {
    id: "pyint-overview",
    group: "执行流程",
    icon: "🚀",
    title: "Python 是怎么运行代码的",
    content: `## 一、Python 运行代码的全景图

当你写下 \`print("Hello")\` 并按下运行键，到屏幕上出现 "Hello" 这几个字，中间发生了什么？这是理解 Python 工作原理的第一个问题，也是最基础的问题。

很多人以为 Python 是"解释型语言"，所以是"逐行读取源代码并直接执行"。这个理解**不够准确**。Python 实际上会先把你的源代码**编译成一种中间形式（字节码）**，然后再由一个**虚拟机**来执行这些字节码。

\`\`\`text
  你的 .py 源代码          中间产物              运行结果
  ┌──────────┐         ┌──────────┐         ┌──────────┐
  │ print(1) │  编译    │ 字节码    │  执行    │ 输出 1   │
  │ x = 2    │ ──────▶ │ LOAD_CONST│ ──────▶ │ x = 2    │
  │ ...      │         │ STORE... │         │ ...      │
  └──────────┘         └──────────┘         └──────────┘
   源代码阶段           字节码阶段            执行阶段
\`\`\`

所以 Python 的执行可以概括为**三个阶段**：

1. **源代码阶段**：你写的 \`.py\` 文件，就是纯文本
2. **字节码阶段**：Python 把源代码编译成字节码（一种中间表示）
3. **执行阶段**：Python 虚拟机逐条执行字节码，产生运行结果

## 二、三个阶段详解

### 1. 源代码阶段

源代码就是你写在 \`.py\` 文件里的文本。它本质上是**一串字符**，Python 解释器首先要读取这串字符。这个阶段没有任何"执行"发生，只是把文本加载到内存中。

\`\`\`python
# 这就是源代码，纯文本
def add(a, b):
    return a + b

result = add(3, 5)
print(result)
\`\`\`

源代码对人友好，对机器不友好——机器无法直接理解这些文字的含义。

### 2. 字节码阶段

Python 会把源代码**编译**成字节码。字节码是一种**平台无关的中间指令**，每条指令告诉虚拟机要做一件具体的事。

比如源代码 \`return a + b\` 会被编译成类似这样的字节码：

\`\`\`text
LOAD_FAST    0   (a)     # 把局部变量 a 压入栈
LOAD_FAST    1   (b)     # 把局部变量 b 压入栈
BINARY_ADD         # 弹出栈顶两个值，相加，结果压回栈
RETURN_VALUE       # 返回栈顶值
\`\`\`

字节码比源代码更接近机器能理解的形式，但它**不是机器码**，不能直接被 CPU 执行。

### 3. 执行阶段

Python 虚拟机（PVM，Python Virtual Machine）负责执行字节码。PVM 是一个**巨大的循环**：取出一条字节码指令 → 解释它的含义 → 执行对应操作 → 取下一条指令……如此反复，直到所有指令执行完毕。

\`\`\`text
  字节码列表                PVM 执行循环
  ┌─────────────┐
  │ LOAD_FAST 0 │ ──┐
  │ LOAD_FAST 1 │   │   ┌─── 取指 ──┐
  │ BINARY_ADD  │   ├──▶│  译码     │──▶ 执行 ──┐
  │ RETURN_VALUE│   │   └──────────┘           │
  └─────────────┘   │       ▲                  │
                    └───────┴──────────────────┘
                          （循环直到结束）
\`\`\`

## 三、CPython 的双重角色

我们日常说的"Python"，通常指的是 **CPython**——用 C 语言实现的 Python 解释器。CPython 同时扮演两个角色：

| 角色 | 职责 | 类比 |
|------|------|------|
| **编译器** | 把源代码编译成字节码 | 像翻译官，把中文翻成世界语 |
| **虚拟机** | 执行字节码 | 像演员，按照剧本逐条表演 |

\`\`\`text
  源代码 ──[编译器]──▶ 字节码 ──[虚拟机]──▶ 运行结果
           CPython              CPython
\`\`\`

需要注意的是：**字节码不是机器码**。机器码是 CPU 能直接执行的二进制指令，而字节码是 Python 自己定义的指令格式，需要 PVM 来解释执行。这就是 Python 比 C 慢的根本原因——C 直接编译成机器码让 CPU 执行，Python 还需要一层"翻译"。

## 四、与 C、Java 的对比

不同语言的执行方式差异很大，理解这些差异有助于你理解 Python 的定位。

| 特性 | C | Java | Python |
|------|---|------|--------|
| **执行方式** | 直接编译成机器码 | 编译成字节码 + JVM 执行 | 编译成字节码 + PVM 执行 |
| **中间产物** | .o / .exe（机器码） | .class（字节码） | .pyc（字节码） |
| **是否需要虚拟机** | 不需要 | 需要（JVM） | 需要（PVM） |
| **执行速度** | 最快 | 较快 | 较慢 |
| **跨平台** | 需要重新编译 | 一次编译到处运行 | 一次编译到处运行 |
| **JIT 即时编译** | 不需要 | 有（HotSpot） | 默认没有（PyPy 有） |

从表中可以看出，Python 和 Java 的执行模型其实很像——都是"编译成字节码 + 虚拟机执行"。区别在于 Java 的 JVM 有 JIT（即时编译）技术，会把热点字节码编译成机器码加速执行，而 CPython 默认没有 JIT，每条字节码都要走一遍解释循环。

## 五、为什么 Python 慢但开发快

Python 的运行速度比 C 慢（通常慢 10-100 倍），但开发速度却快得多。这是一个**刻意的权衡**：

| 维度 | C | Python |
|------|---|--------|
| 类型检查 | 编译期（静态类型） | 运行期（动态类型） |
| 内存管理 | 手动 malloc/free | 自动垃圾回收 |
| 指针操作 | 直接操作内存 | 没有 |
| 代码行数 | 多 | 少（约 1/3 到 1/5） |
| 开发效率 | 低 | 高 |
| 运行效率 | 高 | 低 |

Python 用运行效率换取了开发效率。在大多数应用场景中，**开发速度比运行速度更重要**——因为 CPU 时间比程序员时间便宜。只有在对性能极度敏感的场景（如高频交易、游戏引擎、操作系统），才需要用 C 这样的语言。

| 场景 | 优先选 Python 的理由 |
|------|---------------------|
| Web 后端 | 开发快，生态丰富 |
| 数据分析 | pandas / numpy 等库强大 |
| 自动化脚本 | 写起来快，跨平台 |
| AI / 机器学习 | 框架（PyTorch / TF）生态 |
| 原型开发 | 快速验证想法 |

## 六、一个简单例子的完整流程

让我们用 \`def add(a, b): return a + b\` 这个函数走一遍完整流程：

\`\`\`text
步骤 1：源代码
   def add(a, b):
       return a + b

步骤 2：编译成字节码
   LOAD_FAST     0  (a)      ← 把参数 a 放到栈上
   LOAD_FAST     1  (b)      ← 把参数 b 放到栈上
   BINARY_ADD              ← 弹出 a 和 b，相加，结果压栈
   RETURN_VALUE            ← 返回栈顶的结果

步骤 3：调用 add(3, 5)
   PVM 执行 LOAD_FAST → 栈：[3]
   PVM 执行 LOAD_FAST → 栈：[3, 5]
   PVM 执行 BINARY_ADD → 栈：[8]
   PVM 执行 RETURN_VALUE → 返回 8
\`\`\`

你不需要记住这些字节码指令的细节——重要的是理解**流程**：源代码不是直接执行的，而是先变成字节码，再由虚拟机解释执行。

## 七、常见误解澄清

### 误解 1："Python 是纯解释型语言"

**事实**：Python 是"半编译半解释"。它先编译成字节码（编译），再由虚拟机解释执行字节码（解释）。这跟纯解释型（如早期 BASIC 逐行解析执行）不同。

### 误解 2："Python 没有编译过程"

**事实**：Python 有编译过程，只是对你不可见。每次运行 \`.py\` 文件时，CPython 都会先编译源码。编译结果会缓存到 \`.pyc\` 文件中，下次运行时如果源码没变就直接用缓存。

### 误解 3：".pyc 文件是机器码"

**事实**：\`.pyc\` 文件存的是**字节码**，不是机器码。它不能直接在 CPU 上运行，仍然需要 PVM 来执行。但省去了重新编译的时间，所以导入模块时更快。

### 误解 4："Python 永远比 C 慢"

**事实**：纯 Python 代码确实比 C 慢，但 Python 的很多底层库（如 numpy、pandas）是用 C 实现的。当你调用 \`numpy\` 的数组运算时，实际执行的是编译好的 C 代码，速度并不慢。

### 误解 5："Python 不需要编译"

**事实**：Python 有编译过程，只是它**自动完成**且**对开发者不可见**。每次运行 \`.py\` 文件或导入模块时，CPython 都会先编译。如果之前编译过且源码没改，就用缓存的 \`.pyc\` 文件，所以你感觉不到编译的存在。

### Python 的不同实现

除了 CPython，Python 还有其他实现版本，它们的执行方式略有不同：

| 实现 | 实现语言 | 执行方式 | 特点 |
|------|----------|----------|------|
| **CPython** | C | 编译成字节码 + PVM | 官方实现，最常用 |
| **PyPy** | RPython | 编译成字节码 + JIT | 比 CPython 快 3-5 倍 |
| **Jython** | Java | 编译成 Java 字节码 | 运行在 JVM 上 |
| **IronPython** | C# | 编译成 .NET IL | 运行在 .NET 上 |
| **MicroPython** | C | 编译成字节码 | 针对微控制器优化 |

注意：我们平时说的"Python"默认指 CPython。不同实现之间语法兼容，但底层执行机制不同。

### CPython 的版本演进

CPython 的执行模型在不断优化：

| 版本 | 改进 | 对开发者的影响 |
|------|------|----------------|
| 3.6 | f-string、变量注解 | 代码更简洁 |
| 3.8 | 海象运算符、位置参数 | 新语法糖 |
| 3.9 | 字典合并操作符 | 更方便的字典操作 |
| 3.10 | match-case 模式匹配 | 类似 switch 语法 |
| 3.11 | 速度提升 10-60%、特化指令 | 性能显著提升 |
| 3.12 | 更好的错误提示 | 调试更友好 |

虽然版本在演进，但"源码→字节码→PVM 执行"的核心模型从未改变。Python 3.11 的性能提升主要来自**特化自适应解释器**（Specializing Adaptive Interpreter），它会根据运行时数据把通用字节码替换为更快的特化版本。

## 八、这对日常开发有什么帮助

理解 Python 的执行流程，对日常开发有以下实际帮助：

1. **理解 .pyc 文件**：当你修改了 \`.py\` 文件但程序没更新，可能是 \`.pyc\` 缓存没刷新。删除 \`__pycache__\` 目录即可。

2. **理解报错时机**：SyntaxError（语法错误）发生在编译阶段，代码根本没执行；NameError（名称未定义）发生在执行阶段，语法是对的但运行时找不到变量。

3. **理解性能瓶颈**：Python 慢在解释循环，每条字节码都要"翻译"一次。所以减少 Python 层的代码量（如用内置函数代替手写循环）能提升性能。

4. **理解跨平台**：同一个 \`.pyc\` 文件可以在任何平台的 CPython 上运行（只要版本兼容），因为字节码是平台无关的。

5. **选择合适的工具**：如果某段代码太慢，可以考虑用 Cython、C 扩展、或 PyPy 来加速，而不是在纯 Python 里死磕。

下面这段代码展示了 Python 执行的三个阶段：源代码、字节码、运行结果，你可以运行它直观感受一下。`,
    code: `# ============================================================
# 第一章代码演示：Python 执行的三个阶段
# ============================================================
# 这段代码展示 Python 从源代码到运行结果的完整流程：
#   1. 源代码（我们写的文本）
#   2. 字节码（用 dis 模块查看）
#   3. 执行结果（实际运行得到的结果）

import dis

# 定义一个简单函数，后面用它来展示完整流程
def add(a, b):
    return a + b

# ========== 第一阶段：源代码 ==========
print("========== 第一阶段：源代码 ==========")
# 源代码就是我们写在 .py 文件里的文本
# 这里展示 add 函数的源代码
print("源代码内容：")
print("def add(a, b):")
print("    return a + b")

# ========== 第二阶段：字节码 ==========
print("\\n========== 第二阶段：字节码 ==========")
# Python 会把源代码编译成字节码
# 用 dis 模块（disassembler，反汇编器）可以查看字节码
print("add 函数的字节码：")
dis.dis(add)

# ========== 第三阶段：执行 ==========
print("\\n========== 第三阶段：执行 ==========")
# Python 虚拟机（PVM）逐条执行字节码，得到运行结果
result = add(3, 5)
print(f"add(3, 5) = {result}")

# ========== 更复杂的例子 ==========
print("\\n========== 更复杂的例子 ==========")
# 这个函数有更多操作：变量赋值、字符串拼接、函数调用
def greet(name):
    message = "Hello, " + name
    print(message)
    return len(message)

print("greet 函数的字节码：")
dis.dis(greet)

print("\\n执行 greet('Python')：")
greet("Python")

# ========== 查看 code 对象的属性 ==========
print("\\n========== code 对象的属性 ==========")
# 每个函数都有一个 __code__ 属性，就是编译后的字节码对象
code = add.__code__
print("函数名 (co_name):", code.co_name)
print("参数个数 (co_argcount):", code.co_argcount)
print("常量表 (co_consts):", code.co_consts)
print("变量名表 (co_varnames):", code.co_varnames)
print("字节码字节数:", len(code.co_code))

# ========== 总结 ==========
print("\\n========== 总结 ==========")
print("Python 执行流程：源代码 → 字节码 → PVM 执行 → 结果")
print("源代码：人可读的文本")
print("字节码：Python 虚拟机的指令（平台无关）")
print("PVM：逐条解释执行字节码的虚拟机")
`,
  },

  // =========================================================
  // 第二章：解释型 vs 编译型真相
  // =========================================================
  {
    id: "pyint-interpreted",
    group: "执行流程",
    icon: "📖",
    title: "解释型 vs 编译型真相",
    content: `## 一、三种执行方式概览

编程语言按执行方式可以分为三类，理解这三类的区别，你就能搞清楚 Python 到底属于哪一类。

| 类型 | 代表语言 | 执行方式 | 特点 |
|------|----------|----------|------|
| **纯编译型** | C、C++、Go | 源码 → 机器码 → CPU 直接执行 | 速度快，平台相关 |
| **纯解释型** | 早期 BASIC、Shell | 逐行读取源码 → 逐行执行 | 速度慢，无需编译 |
| **半编译半解释** | Python、Java | 源码 → 字节码 → 虚拟机执行 | 折中方案 |

Python 属于第三类——**半编译半解释**。它既有编译步骤（源码→字节码），又有解释步骤（虚拟机执行字节码）。

\`\`\`text
  纯编译型（C）         纯解释型（BASIC）       半编译半解释（Python）
  ┌──────┐             ┌──────┐               ┌──────┐
  │ 源码 │             │ 源码 │               │ 源码 │
  └──┬───┘             └──┬───┘               └──┬───┘
     │ 编译                │ 逐行                  │ 编译
     ▼                    ▼                       ▼
  ┌──────┐             ┌──────┐               ┌──────┐
  │机器码 │             │ 解释器│               │字节码│
  └──┬───┘             └──┬───┘               └──┬───┘
     │ CPU 执行            │ 直接执行                │ PVM 执行
     ▼                    ▼                       ▼
  ┌──────┐             ┌──────┐               ┌──────┐
  │ 结果  │             │ 结果  │               │ 结果  │
  └──────┘             └──────┘               └──────┘
\`\`\`

## 二、纯解释型语言

纯解释型语言的执行方式是：**逐行读取源代码，逐行解析并执行**。

\`\`\`text
  源代码第 1 行 → 解释器解析 → 执行 → 输出
  源代码第 2 行 → 解释器解析 → 执行 → 输出
  源代码第 3 行 → 解释器解析 → 执行 → 输出
  ...
\`\`\`

**特点**：

- 每次运行都要重新解析源代码
- 没有中间产物，没有缓存
- 改了代码立刻生效，不需要重新编译
- 速度最慢（每行都要重新解析）

**代表**：早期 BASIC、Unix Shell 脚本

| 优点 | 缺点 |
|------|------|
| 不需要编译步骤 | 每次运行都重新解析 |
| 改代码立即可运行 | 速度最慢 |
| 适合简单脚本 | 无法在运行前发现语法错误 |

## 三、纯编译型语言

纯编译型语言的执行方式是：**一次性把所有源代码编译成机器码，然后由 CPU 直接执行**。

\`\`\`text
  源代码 → [编译器] → 机器码（.exe）→ CPU 直接执行
\`\`\`

**特点**：

- 编译后生成可执行文件（如 .exe）
- 可执行文件包含机器码，CPU 可以直接运行
- 不需要解释器或虚拟机
- 运行时不需要源代码
- 速度最快

**代表**：C、C++、Go、Rust

| 优点 | 缺点 |
|------|------|
| 运行速度最快 | 需要编译步骤 |
| 编译期能发现很多错误 | 不同平台需要重新编译 |
| 不需要运行时环境 | 编译时间可能较长 |

## 四、Python 的折中方案

Python 选择了**折中方案**：先把源代码编译成字节码，再由虚拟机解释执行字节码。

\`\`\`text
  源代码 → [CPython 编译器] → 字节码 → [PVM 虚拟机] → 运行结果
\`\`\`

### 为什么不直接编译成机器码？

1. **跨平台**：字节码是平台无关的，同一个 .pyc 可以在 Windows、Linux、Mac 上运行。如果编译成机器码，就需要为每个平台分别编译。

2. **动态类型**：Python 是动态类型语言，变量的类型在运行时才确定。这意味着很多检查只能在运行时进行，无法在编译期生成高效的机器码。

3. **灵活性**：Python 允许运行时修改类、添加方法、动态导入模块等。这些特性在纯编译型语言中很难实现。

### 为什么不直接逐行解释？

1. **性能**：逐行解析源代码比执行字节码慢得多。编译成字节码后，解析只做一次。

2. **缓存**：编译结果可以缓存到 .pyc 文件，下次运行时跳过编译步骤。

3. **早期错误发现**：编译阶段能发现语法错误，不需要等到运行时。

## 五、.pyc 文件的由来

当你导入一个模块时，Python 会把编译后的字节码保存到 \`.pyc\` 文件中，下次导入时直接使用缓存。

\`\`\`text
  第一次导入 mymodule.py：
    1. 读取 mymodule.py 源代码
    2. 编译成字节码
    3. 保存到 __pycache__/mymodule.cpython-39.pyc
    4. 执行字节码

  第二次导入（源码没改）：
    1. 检查 mymodule.py 的修改时间
    2. 发现 .pyc 比源码新 → 直接加载 .pyc
    3. 跳过编译步骤 → 执行字节码
\`\`\`

### .pyc 文件的位置和命名规则

| 规则 | 说明 |
|------|------|
| 存放目录 | 源文件同目录下的 \`__pycache__\` 文件夹 |
| 文件名格式 | \`模块名.cpython-版本号.pyc\` |
| 示例 | \`mymodule.cpython-39.pyc\` |
| 失效条件 | 源文件被修改（修改时间更新） |
| 可删除 | 删了不影响功能，只是下次导入要重新编译 |

### compile() 函数

Python 提供了一个内置函数 \`compile()\`，可以手动把源代码编译成 code 对象：

\`\`\`python
# 把源代码字符串编译成 code 对象
source = "x = 1 + 2"
code_obj = compile(source, "<demo>", "exec")

# code 对象包含编译后的字节码
print(code_obj.co_consts)  # (None, 1, 2, 3)
print(code_obj.co_names)  # ('x',)

# 可以用 exec() 执行 code 对象
exec(code_obj)  # x = 3
\`\`\`

\`compile()\` 的第三个参数：

| 模式 | 用途 | 示例 |
|------|------|------|
| \`"exec"\` | 编译语句（赋值、循环等） | \`compile("x=1", ..., "exec")\` |
| \`"eval"\` | 编译表达式（有返回值） | \`compile("1+2", ..., "eval")\` |
| \`"single"\` | 交互式单行语句 | 用于 REPL 环境 |

## 六、JIT 与 PyPy

### 什么是 JIT

JIT（Just-In-Time，即时编译）是一种在运行时把字节码编译成机器码的技术。这样热点代码会被编译成机器码，后续执行时直接由 CPU 运行，速度大幅提升。

\`\`\`text
  CPython（默认）：
    字节码 → PVM 逐条解释执行 → 结果（慢）

  PyPy（带 JIT）：
    字节码 → JIT 监控热点代码 → 编译成机器码 → CPU 执行（快）
\`\`\`

### CPython vs PyPy

| 特性 | CPython | PyPy |
|------|---------|------|
| 实现语言 | C | RPython（Python 的子集） |
| JIT | 没有 | 有 |
| 运行速度 | 基准（1x） | 通常快 3-5 倍 |
| 兼容性 | 最好（标准实现） | 大部分兼容 |
| 启动速度 | 快 | 较慢（JIT 预热） |
| 内存占用 | 较少 | 较多 |

### Java 的 JIT 对比

Java 的 JVM 也有 JIT，而且比 PyPy 更成熟：

| 特性 | Java (JVM) | Python (CPython) |
|------|------------|------------------|
| JIT | 有（HotSpot） | 没有 |
| 类型系统 | 静态类型 | 动态类型 |
| 字节码优化 | 运行时持续优化 | 没有 |
| 运行速度 | 接近 C（长时间运行） | 慢 |

## 七、四种语言执行方式对比

| 语言 | 编译方式 | 中间产物 | 执行方式 | JIT | 跨平台 |
|------|----------|----------|----------|-----|--------|
| **C** | 源码→机器码 | .o / .exe | CPU 直接执行 | 不需要 | 需重新编译 |
| **Java** | 源码→字节码 | .class | JVM 执行 | 有 | 一次编译到处跑 |
| **Python** | 源码→字节码 | .pyc | PVM 执行 | 没有（CPython） | 一次编译到处跑 |
| **JavaScript** | 源码→字节码 | 内存中 | V8 等引擎 | 有 | 浏览器/Node |

从表中可以看出：

- C 是唯一不需要虚拟机的（直接编译成机器码）
- Java 和 Python 模型相似，但 Java 有 JIT 所以更快
- JavaScript 在现代引擎中也有 JIT，所以速度比 Python 快

## 八、对日常开发的影响

理解 Python 的执行方式，对日常开发有以下实际帮助：

### 1. 理解模块导入速度

第一次导入模块较慢（需要编译），第二次导入很快（使用 .pyc 缓存）。这就是为什么大型项目第一次启动慢，之后变快。

### 2. .pyc 缓存问题

当你修改了源代码但运行结果没变化，可能是 .pyc 缓存导致的。删除 \`__pycache__\` 目录即可解决。

### 3. 选择 CPython 还是 PyPy

如果你的代码是 CPU 密集型的纯 Python 代码，可以尝试 PyPy 来加速。但如果依赖 C 扩展库（如 numpy），PyPy 兼容性可能有问题。

### 4. 理解性能瓶颈

CPython 没有 JIT，所以纯 Python 代码比 Java/JS 慢。如果需要高性能，可以考虑用 C 扩展、Cython、或用 C 库（如 numpy）代替纯 Python。

### 5. compile() 的实用价值

\`compile()\` 函数在日常开发中偶尔有用，比如：
- 预编译一段代码多次执行（避免重复编译）
- 检查代码是否有语法错误（不执行）
- 构建代码执行沙箱

下面这段代码演示了 compile() 函数和 .pyc 文件。`,
    code: `# ============================================================
# 第二章代码演示：compile() 与 .pyc 文件
# ============================================================
# 这段代码演示：
#   1. 用 compile() 把源码编译成 code 对象
#   2. 查看 code 对象的属性
#   3. 用 exec() 执行 code 对象
#   4. 查看真实模块的 .pyc 文件

import sys
import os
import dis

# ========== 1. 用 compile() 编译源码 ==========
print("========== 1. compile() 编译源码 ==========")
# compile(source, filename, mode) 把源代码字符串编译成 code 对象
# source 是源代码字符串
# filename 是虚拟文件名（用于报错信息）
# mode 可以是 "exec"（语句）、"eval"（表达式）、"single"（交互式）

source = "x = 1 + 2\\nprint(x)"
print(f"源代码: {source!r}")

code_obj = compile(source, "<demo>", "exec")
print(f"编译结果: {code_obj}")
print(f"类型: {type(code_obj).__name__}")

# ========== 2. code 对象的属性 ==========
print("\\n========== 2. code 对象的属性 ==========")
# code 对象包含了编译后的字节码信息
print(f"co_filename: {code_obj.co_filename}")
print(f"co_names (使用的名称): {code_obj.co_names}")
print(f"co_consts (常量表): {code_obj.co_consts}")
print(f"co_code (原始字节): {list(code_obj.co_code)}")
print(f"字节码字节数: {len(code_obj.co_code)}")

# ========== 3. 用 dis 查看字节码 ==========
print("\\n========== 3. 字节码内容 ==========")
dis.dis(code_obj)

# ========== 4. 用 exec() 执行 code 对象 ==========
print("\\n========== 4. 用 exec() 执行 code 对象 ==========")
# exec() 可以执行编译好的 code 对象
# 这等同于直接运行源代码
exec(code_obj)

# ========== 5. eval 模式：编译表达式 ==========
print("\\n========== 5. eval 模式：编译表达式 ==========")
# "eval" 模式用于编译单个表达式（有返回值）
expr_code = compile("1 + 2 * 3", "<expr>", "eval")
print("表达式 1 + 2 * 3 的字节码:")
dis.dis(expr_code)
# eval() 执行表达式并返回结果
result = eval(expr_code)
print(f"求值结果: {result}")

# ========== 6. 查看真实模块的 .pyc 文件 ==========
print("\\n========== 6. 真实模块的 .pyc 文件 ==========")
# 任何已导入的模块都有 __cached__ 属性，指向其 .pyc 文件
import collections
pyc_path = collections.__cached__
print(f"collections 模块的 .pyc 路径:")
print(f"  {pyc_path}")
print(f"文件存在: {os.path.exists(pyc_path)}")
print(f"文件大小: {os.path.getsize(pyc_path)} 字节")

# 查看 __pycache__ 目录
pyc_dir = os.path.dirname(pyc_path)
print(f"\\n__pycache__ 目录: {pyc_dir}")
if os.path.isdir(pyc_dir):
    print("目录中的 .pyc 文件:")
    for f in os.listdir(pyc_dir):
        if f.endswith(".pyc"):
            size = os.path.getsize(os.path.join(pyc_dir, f))
            print(f"  {f} ({size} 字节)")

# ========== 7. compile 检查语法但不执行 ==========
print("\\n========== 7. 用 compile 检查语法 ==========")
# compile 只编译不执行，可以用来检查语法
test_codes = [
    ("x = 1 + 2", "合法语法"),
    ("def f(): return 1", "合法语法"),
    ("x = 1 +", "语法错误"),
    ("if True print(1)", "语法错误"),
]
for code_str, desc in test_codes:
    try:
        compile(code_str, "<test>", "exec")
        print(f"  [{desc}] {code_str!r} → 编译成功")
    except SyntaxError as e:
        print(f"  [{desc}] {code_str!r} → SyntaxError: {e.msg}")

# ========== 总结 ==========
print("\\n========== 总结 ==========")
print("Python 是半编译半解释型语言")
print("  编译：源代码 → 字节码（用 compile() 或自动完成）")
print("  缓存：字节码存入 .pyc 文件（在 __pycache__ 目录）")
print("  执行：PVM 虚拟机逐条执行字节码")
print("CPython 没有 JIT，PyPy 有 JIT 所以更快")
`,
  },

  // =========================================================
  // 第三章：从源码到运行的完整流程
  // =========================================================
  {
    id: "pyint-flow",
    group: "执行流程",
    icon: "🔄",
    title: "从源码到运行的完整流程",
    content: `## 一、五步流程总览

Python 从源代码到运行结果，实际上经过了 **5 个步骤**。理解这 5 步，你就能搞清楚各种错误的来源、性能瓶颈的位置、以及 Python 的整体工作机制。

\`\`\`text
  ┌──────────────────────────────────────────────────────────┐
  │                    Python 执行流程                        │
  │                                                          │
  │  Step 1        Step 2        Step 3       Step 4   Step 5│
  │  词法分析  →   语法分析  →   编译    →   加载  →  执行  │
  │                                                          │
  │  源代码        Token流       AST         字节码   字节码  │
  │  (.py)         (token)       (ast)       (code)   (PVM)  │
  │                                                          │
  │  tokenize      ast.parse     compile     import    exec   │
  │  模块          模块          函数        机制      循环   │
  └──────────────────────────────────────────────────────────┘
\`\`\`

| 步骤 | 名称 | 输入 | 输出 | 相关模块 |
|------|------|------|------|----------|
| 1 | 词法分析 | 源代码文本 | Token 流 | \`tokenize\` |
| 2 | 语法分析 | Token 流 | AST（抽象语法树） | \`ast\` |
| 3 | 编译 | AST | 字节码（code 对象） | \`compile()\` |
| 4 | 字节码加载 | code 对象 | 模块对象 | import 机制 |
| 5 | PVM 执行 | 字节码 | 运行结果 | 解释器循环 |

## 二、第 1 步：词法分析（Lexing）

词法分析是把**源代码文本**拆成一个个 **Token（词法单元）**的过程。

\`\`\`text
  源代码: x = 1 + 2 * 3

  词法分析后:
  ┌──────┬───────┬──────┬───────┬──────┬───────┬──────┬───────┬──────┐
  │ NAME │ EQUAL │ NUM  │ PLUS  │ NUM  │ TIMES │ NUM  │ NEWLN │ END  │
  │ "x"  │  "="  │  "1" │  "+"  │  "2" │  "*"  │  "3" │  "\\n" │ ""   │
  └──────┴───────┴──────┴───────┴──────┴───────┴──────┴───────┴──────┘
\`\`\`

每个 Token 包含：

| 属性 | 说明 | 示例 |
|------|------|------|
| type | Token 类型 | NAME、NUMBER、OP、STRING |
| string | 原始文本 | "x"、"1"、"+" |
| start | 起始位置 | (行号, 列号) |
| end | 结束位置 | (行号, 列号) |

### 常见 Token 类型

| Token 类型 | 说明 | 示例 |
|-----------|------|------|
| NAME | 标识符 | 变量名、函数名 |
| NUMBER | 数字 | 1、3.14、0x1F |
| STRING | 字符串 | "hello"、'world' |
| OP | 运算符和符号 | +、-、=、(、) |
| NEWLINE | 换行符 | \\n |
| INDENT | 缩进增加 | 代码块开始 |
| DEDENT | 缩进减少 | 代码块结束 |
| COMMENT | 注释 | # 这是注释 |
| ENDMARKER | 文件结束 | 标记源码结束 |

### 词法分析的作用

词法分析是**最基础的步骤**，它的工作是：

1. 跳过空白和注释（这些不影响程序逻辑）
2. 把字符流切分成有意义的"词"
3. 记录每个词的位置（用于报错信息）

如果在这个阶段发现问题（如非法字符），会报 \`SyntaxError\`。

## 三、第 2 步：语法分析（Parsing）

语法分析把 **Token 流**组织成 **AST（抽象语法树，Abstract Syntax Tree）**。AST 是一种树形结构，表示代码的语法关系。

\`\`\`text
  源代码: x = 1 + 2 * 3

  AST:
              Assign (赋值)
              /    \\
           Name    BinOp (加法)
           "x"    /    \\
                Num   BinOp (乘法)
                "1"  /    \\
                    Num   Num
                    "2"   "3"
\`\`\`

AST 的每个节点代表一个语法结构：

| AST 节点 | 对应语法 | 说明 |
|----------|----------|------|
| Module | 整个模块 | AST 的根节点 |
| Assign | x = ... | 赋值语句 |
| BinOp | a + b | 二元运算 |
| Name | x | 变量引用 |
| Constant | 1, "str" | 常量 |
| Call | f(...) | 函数调用 |
| If | if ...: | 条件语句 |
| For | for ...: | 循环语句 |
| FunctionDef | def f(): | 函数定义 |

### 语法分析的作用

1. 检查语法是否正确（如括号是否匹配、缩进是否正确）
2. 构建代码的语法结构（谁包含谁、谁依赖谁）
3. 为编译步骤做准备

如果语法有问题（如 \`x = 1 +\`），会在这个阶段报 \`SyntaxError\`。

## 四、第 3 步：编译（Compiling）

编译步骤把 **AST** 转换成**字节码**（code 对象）。这是最核心的步骤。

\`\`\`text
  AST:
    Assign                字节码:
    /    \\                LOAD_CONST   1  (1)
  Name   BinOp     →      LOAD_CONST   2  (2)
  "x"   /    \\           LOAD_CONST   3  (3)
       1    BinOp        BINARY_MULTIPLY
           /    \\        BINARY_ADD
          2      3       STORE_NAME    0  (x)
\`\`\`

### code 对象的组成

编译后得到的 code 对象包含：

| 属性 | 说明 | 示例 |
|------|------|------|
| co_code | 字节码指令（字节序列） | b'd...\\x00' |
| co_consts | 常量表 | (None, 1, 2, 3) |
| co_names | 全局名称表 | ('x', 'print') |
| co_varnames | 局部变量名表 | ('a', 'b') |
| co_filename | 源文件名 | "demo.py" |
| co_name | 代码块名称 | "add" 或 "<module>" |

### compile() 函数

\`compile()\` 函数把源代码直接编译成 code 对象（内部也经过词法分析和语法分析）：

\`\`\`python
# 方式 1：从源代码直接编译
code = compile("x = 1 + 2", "<demo>", "exec")

# 方式 2：先构建 AST 再编译
import ast
tree = ast.parse("x = 1 + 2")
code = compile(tree, "<demo>", "exec")
\`\`\`

## 五、第 4 步：字节码加载

当 Python 执行一个模块时，会把 code 对象加载到内存中，创建一个**模块对象**，并把模块的属性（变量、函数、类）绑定到模块的命名空间。

\`\`\`text
  mymodule.py:
    x = 1
    def f(): pass

  加载后:
    模块对象 mymodule:
      x → 1
      f → <function f>
\`\`\`

### .pyc 缓存

如果是通过 import 导入的模块，Python 会把 code 对象保存到 .pyc 文件中。下次导入时：

1. 检查源文件修改时间
2. 如果 .pyc 比源文件新 → 直接加载 .pyc（跳过编译）
3. 如果源文件更新 → 重新编译并更新 .pyc

## 六、第 5 步：PVM 执行

PVM（Python Virtual Machine）是一个**巨大的循环**，逐条执行字节码指令：

\`\`\`text
  PVM 执行循环:
  ┌──────────────────┐
  │  1. 取下一条指令  │ ◀──────────────┐
  │  2. 译码（是什么操作）│               │
  │  3. 执行操作       │               │
  │  4. 更新指令指针   │ ──────────────┘
  │  5. 判断是否结束   │
  └──────────────────┘
\`\`\`

PVM 维护一个**求值栈（Evaluation Stack）**来计算表达式：

\`\`\`text
  执行 x = 1 + 2 的过程:

  1. LOAD_CONST 1  → 栈: [1]
  2. LOAD_CONST 2  → 栈: [1, 2]
  3. BINARY_ADD    → 弹出 1 和 2，相加，压回 3 → 栈: [3]
  4. STORE_NAME x  → 弹出 3，存到变量 x → 栈: []
\`\`\`

## 七、错误发生在哪一步

理解 5 步流程后，你就能判断各种错误发生在哪个阶段：

| 错误类型 | 发生阶段 | 示例 | 原因 |
|----------|----------|------|------|
| SyntaxError | Step 1-3（编译期） | \`x = 1 +\` | 语法不完整 |
| IndentationError | Step 2（语法分析） | 缩进错误 | 缩进不符合规则 |
| TabError | Step 2（语法分析） | Tab 和空格混用 | 缩进不一致 |
| NameError | Step 5（运行期） | \`print(undefined)\` | 运行时找不到变量 |
| TypeError | Step 5（运行期） | \`1 + "a"\` | 运行时类型不兼容 |
| ZeroDivisionError | Step 5（运行期） | \`1 / 0\` | 运行时除以零 |
| ImportError | Step 4（加载期） | 模块不存在 | 加载模块时出错 |

### 关键区别：编译期 vs 运行期

\`\`\`text
  编译期错误（Step 1-3）：
    → 代码根本不会执行
    → 整个模块都加载失败
    → 例如：SyntaxError

  运行期错误（Step 5）：
    → 代码已经开始执行
    → 执行到出错的那行才报错
    → 例如：NameError、TypeError
\`\`\`

这就是为什么 \`print(undefined_var)\` 能通过编译（语法是对的）但在运行时报 NameError——编译器只检查语法，不检查变量是否存在。

## 八、对日常开发的帮助

理解这 5 步流程，对日常开发有以下帮助：

### 1. 快速定位错误

看到错误信息就知道是哪个阶段的问题：
- SyntaxError → 语法写错了（少了括号、冒号等）
- NameError → 变量名写错了或没定义
- TypeError → 类型不匹配

### 2. 理解 import 的开销

import 会触发编译（如果没有 .pyc），所以：
- 第一次 import 较慢
- 后续 import 使用缓存，很快
- 大量 import 会影响启动速度

### 3. 调试技巧

用 \`ast\` 模块可以检查代码结构，用 \`dis\` 模块可以查看字节码。这些是高级调试手段。

### 4. 代码生成

理解 AST 后，你可以用代码生成代码（元编程），比如：
- 代码格式化工具（black、autopep8）
- 代码检查工具（pylint、flake8）
- 代码转换工具（2to3）

### 5. 性能优化

了解字节码后，你能理解为什么某些写法更快：
- 内置函数比手写循环快（C 实现）
- 局部变量比全局变量快（LOAD_FAST vs LOAD_GLOBAL）
- 列表推导比 for 循环 append 快

下面这段代码演示了这 5 个步骤。`,
    code: `# ============================================================
# 第三章代码演示：从源码到运行的 5 个步骤
# ============================================================
# 这段代码演示 Python 执行的 5 个步骤：
#   1. 词法分析（源码 → Token 流）
#   2. 语法分析（Token → AST）
#   3. 编译（AST → 字节码）
#   4. 字节码加载
#   5. PVM 执行

import ast
import dis
import tokenize
import io

# 一段简单的源代码
source = "x = 1 + 2 * 3\\nprint(x)\\n"

# ========== Step 1: 词法分析 ==========
print("========== Step 1: 词法分析（源码 → Token 流）==========")
print(f"源代码: {source!r}")
print("Token 流：")

# tokenize 模块可以把源代码拆成 Token
tokens = list(tokenize.generate_tokens(io.StringIO(source).readline))
for tok in tokens:
    # tok.type 是数字，用 tok_name 转成可读名称
    type_name = tokenize.tok_name[tok.type]
    print(f"  {type_name:15s} {tok.string!r:15s} 位置: 行{tok.start[0]}列{tok.start[1]}")

# ========== Step 2: 语法分析 ==========
print("\\n========== Step 2: 语法分析（Token → AST）==========")
# ast 模块可以把源代码解析成抽象语法树
tree = ast.parse(source)
print("AST 结构：")
# ast.dump 以文本形式展示 AST
print(ast.dump(tree, indent=2))

# ========== Step 3: 编译 ==========
print("\\n========== Step 3: 编译（AST → 字节码）==========")
# compile() 把 AST 编译成 code 对象
code_obj = compile(tree, "<demo>", "exec")
print("code 对象：", code_obj)
print("字节码内容：")
dis.dis(code_obj)

# ========== Step 4: 字节码加载 ==========
print("\\n========== Step 4: 字节码加载 ==========")
# 在实际运行中，这一步由 import 机制完成
# 这里我们直接用 exec 来模拟
print("字节码已准备好，准备执行...")
print(f"  co_consts (常量表): {code_obj.co_consts}")
print(f"  co_names (名称表): {code_obj.co_names}")

# ========== Step 5: PVM 执行 ==========
print("\\n========== Step 5: PVM 执行 ==========")
# exec 执行 code 对象，PVM 逐条执行字节码
print("开始执行...")
exec(code_obj)
print("执行完毕！")

# ========== 演示 SyntaxError 在编译期 ==========
print("\\n========== SyntaxError 发生在编译期 ==========")
print("尝试编译有语法错误的代码: 'x = 1 +'")
try:
    # 这行代码语法不完整，编译时会报错
    compile("x = 1 +", "<demo>", "exec")
except SyntaxError as e:
    print(f"  SyntaxError: {e.msg}")
    print(f"  位置: 行 {e.lineno}")
    print("  → 语法错误在编译阶段（Step 1-3）就被发现")
    print("  → 代码根本不会执行（不会到 Step 5）")

# ========== 演示 NameError 在运行期 ==========
print("\\n========== NameError 发生在运行期 ==========")
print("代码: print(undefined_var)")
print("步骤 1-3（编译）：")
bad_code = compile("print(undefined_var)", "<demo>", "exec")
print("  → 编译成功！语法没问题，编译器不检查变量是否存在")
print("步骤 5（执行）：")
try:
    exec(bad_code)
except NameError as e:
    print(f"  NameError: {e}")
    print("  → 名称错误在执行阶段（Step 5）才发现")
    print("  → 代码已经开始执行，执行到这行才报错")

# ========== 演示 TypeError 在运行期 ==========
print("\\n========== TypeError 发生在运行期 ==========")
print("代码: 1 + 'a'")
print("步骤 1-3（编译）：")
type_code = compile("1 + 'a'", "<demo>", "eval")
print("  → 编译成功！语法没问题")
print("步骤 5（执行）：")
try:
    eval(type_code)
except TypeError as e:
    print(f"  TypeError: {e}")
    print("  → 类型错误在执行阶段（Step 5）才发现")

# ========== 总结 ==========
print("\\n========== 总结 ==========")
print("Python 执行的 5 个步骤：")
print("  Step 1: 词法分析 → 源代码变成 Token 流")
print("  Step 2: 语法分析 → Token 流变成 AST")
print("  Step 3: 编译     → AST 变成字节码")
print("  Step 4: 加载     → 字节码加载到内存")
print("  Step 5: 执行     → PVM 逐条执行字节码")
print("\\n错误发生时机：")
print("  SyntaxError → 编译期（Step 1-3）")
print("  NameError   → 运行期（Step 5）")
print("  TypeError   → 运行期（Step 5）")
`,
  },

  // =========================================================
  // 第四章：字节码是什么
  // =========================================================
  {
    id: "pyint-bytecode",
    group: "字节码与虚拟机",
    icon: "📦",
    title: "字节码是什么",
    content: `## 一、字节码是什么

**字节码（Bytecode）** 是 Python 源代码经过编译后得到的一种**中间指令格式**。它是 Python 虚拟机（PVM）能够理解和执行的"机器码"。

\`\`\`text
  源代码（人可读）          字节码（VM 可读）
  ┌──────────────┐        ┌──────────────────┐
  │ x = 1 + 2    │  编译  │ LOAD_CONST  1    │
  │ print(x)    │ ─────▶ │ LOAD_CONST  2    │
  │              │        │ BINARY_ADD       │
  │              │        │ STORE_NAME  x    │
  │              │        │ ...              │
  └──────────────┘        └──────────────────┘
\`\`\`

字节码的核心特征：

1. **不是机器码**：字节码不能直接被 CPU 执行，需要 PVM 解释
2. **平台无关**：同一个字节码可以在 Windows、Linux、Mac 上运行
3. **指令式**：每条字节码是一个操作指令，告诉 PVM 做什么
4. **紧凑**：字节码是字节序列，每个指令通常占 1-3 个字节

## 二、操作码与参数

每条字节码指令由**操作码（opcode）**和**可选参数（arg）**组成。

\`\`\`text
  ┌──────────────────────────────────┐
  │  指令 = 操作码 + 参数             │
  │                                  │
  │  LOAD_CONST  0   → 操作码=LOAD_CONST, 参数=0  │
  │  BINARY_ADD      → 操作码=BINARY_ADD, 无参数 │
  │  STORE_NAME  0   → 操作码=STORE_NAME, 参数=0  │
  └──────────────────────────────────┘
\`\`\`

| 组成部分 | 说明 | 示例 |
|----------|------|------|
| 操作码 | 指令的类型 | LOAD_CONST、BINARY_ADD |
| 参数 | 指令的操作对象 | 常量表索引、变量名索引 |
| 参数值 | 参数对应的具体值 | 数字 1、变量名 "x" |

### 操作码的表示

操作码在内部是一个**数字**，但 \`dis\` 模块会把它显示成**可读名称**：

\`\`\`text
  数字操作码 → 可读名称
  100       → LOAD_CONST
  124       → LOAD_FAST
  23        → BINARY_ADD
  83        → RETURN_VALUE
\`\`\`

参数通常是一个**索引**，指向某个表：

| 指令 | 参数含义 | 索引的表 |
|------|----------|----------|
| LOAD_CONST | 加载哪个常量 | co_consts |
| LOAD_FAST | 加载哪个局部变量 | co_varnames |
| LOAD_NAME | 加载哪个名称 | co_names |
| STORE_NAME | 存到哪个名称 | co_names |

## 三、平台无关性

字节码最重要的特性之一是**平台无关**——同一个 .pyc 文件可以在任何平台的 CPython 上运行（只要 Python 版本兼容）。

\`\`\`text
  开发者在 Windows 上写代码
       │
       ▼
  编译成字节码 (.pyc)
       │
       ├──▶ 在 Linux 的 CPython 上运行 ✓
       ├──▶ 在 Mac 的 CPython 上运行 ✓
       └──▶ 在 Windows 的 CPython 上运行 ✓
\`\`\`

### 为什么字节码能跨平台？

1. **字节码是 Python 自己定义的**，不依赖任何 CPU 架构
2. **PVM 负责翻译**：不同平台的 PVM 把字节码翻译成对应平台的操作
3. **标准库统一**：Python 标准库在不同平台上的行为一致

### 注意事项

| 条件 | 是否跨平台 |
|------|----------|
| 纯 Python 代码 | ✓ 跨平台 |
| 使用标准库 | ✓ 跨平台 |
| 使用平台特定库（如 winreg） | ✗ 不跨平台 |
| 使用 C 扩展 | 需要为每个平台编译 |
| Python 版本不同 | .pyc 可能不兼容 |

## 四、栈式机器

Python 虚拟机是一个**栈式机器（Stack Machine）**——它用一个**求值栈**来计算表达式。

\`\`\`text
  计算 1 + 2 * 3 的过程：

  指令               求值栈
  ─────────────────────────────
  初始状态          → []
  LOAD_CONST 1     → [1]
  LOAD_CONST 2     → [1, 2]
  LOAD_CONST 3     → [1, 2, 3]
  BINARY_MULTIPLY  → [1, 6]      (弹出 2 和 3，相乘，压回 6)
  BINARY_ADD       → [7]          (弹出 1 和 6，相加，压回 7)
\`\`\`

### 栈式机器 vs 寄存器式机器

| 类型 | 代表 | 特点 | 优势 |
|------|------|------|------|
| 栈式 | Python、Java | 用栈传递操作数 | 指令短，实现简单 |
| 寄存器式 | x86、Lua | 用寄存器传递操作数 | 指令少，效率高 |

Python 选择栈式的原因是**实现简单**——不需要管理寄存器分配，所有操作都通过栈完成。

### 栈操作的基本模式

\`\`\`text
  LOAD 操作（压栈）：
    栈: [a, b] → [a, b, c]    (把 c 压入栈顶)

  STORE 操作（弹栈）：
    栈: [a, b, c] → [a, b]    (弹出 c，存到某处)

  BINARY 操作（弹两个压一个）：
    栈: [a, b] → [result]     (弹出 a 和 b，计算，压回结果)
\`\`\`

## 五、常见字节码指令

### 加载和存储指令

| 指令 | 作用 | 示例 |
|------|------|------|
| LOAD_CONST | 加载常量到栈 | 数字、字符串 |
| LOAD_FAST | 加载局部变量 | 函数内的变量 |
| LOAD_NAME | 加载名称 | 模块级变量 |
| LOAD_GLOBAL | 加载全局变量 | 函数内引用全局变量 |
| LOAD_ATTR | 加载属性 | obj.attr |
| STORE_FAST | 存到局部变量 | 函数内赋值 |
| STORE_NAME | 存到名称 | 模块级赋值 |
| STORE_ATTR | 存到属性 | obj.attr = val |

### 运算指令

| 指令 | 作用 |
|------|------|
| BINARY_ADD | 加法 (+) |
| BINARY_SUBTRACT | 减法 (-) |
| BINARY_MULTIPLY | 乘法 (*) |
| BINARY_TRUE_DIVIDE | 除法 (/) |
| BINARY_FLOOR_DIVIDE | 地板除 (//) |
| BINARY_MODULO | 取余 (%) |
| BINARY_POWER | 幂运算 (**) |
| COMPARE_OP | 比较运算 (==, <, > 等) |

### 控制流指令

| 指令 | 作用 |
|------|------|
| JUMP_FORWARD | 向前跳转 |
| JUMP_ABSOLUTE | 跳转到绝对地址 |
| POP_JUMP_IF_TRUE | 条件为真时跳转 |
| POP_JUMP_IF_FALSE | 条件为假时跳转 |
| RETURN_VALUE | 返回值 |

### 函数调用指令

| 指令 | 作用 |
|------|------|
| LOAD_METHOD | 加载方法 |
| CALL_FUNCTION | 调用函数 |
| CALL_METHOD | 调用方法 |
| RETURN_VALUE | 返回值 |

### 容器操作指令

| 指令 | 作用 |
|------|------|
| BUILD_LIST | 构建列表 |
| BUILD_TUPLE | 构建元组 |
| BUILD_MAP | 构建字典 |
| BUILD_SET | 构建集合 |
| BUILD_SLICE | 构建切片 |
| BINARY_SUBSCR | 索引取值 (a[b]) |
| STORE_SUBSCR | 索引赋值 (a[b] = c) |

## 六、字节码与性能

### 字节码数量影响速度

Python 慢的根本原因：**每条字节码都要走一遍解释循环**。所以**字节码条数越多，执行越慢**。

\`\`\`text
  写法 1：x = sum(range(100))
    字节码：约 5 条
    执行：快（range 和 sum 都是 C 实现）

  写法 2：x = 0; for i in range(100): x += i
    字节码：约 20+ 条（循环 100 次的指令）
    执行：慢（每次循环都走解释循环）
\`\`\`

### 优化原则

| 原则 | 说明 | 示例 |
|------|------|------|
| 用内置函数 | C 实现，一条指令 | sum() 代替循环 |
| 用局部变量 | LOAD_FAST 比 LOAD_GLOBAL 快 | 函数内缓存全局变量 |
| 减少属性访问 | LOAD_ATTR 较慢 | 缓存 obj.method |
| 用推导式 | 比循环 append 快 | [x*2 for x in lst] |

### 字节码层面的优化

Python 3.x 的一些优化：

| 版本 | 优化 | 效果 |
|------|------|------|
| 3.8+ | 推导式共享局部变量 | 推导式更快 |
| 3.9+ | 字典合并操作符 | {**a, **b} 更快 |
| 3.10+ | 更高效的 match 语句 | 模式匹配优化 |
| 3.11+ | 特化指令（如 BINARY_OP） | 减少解释开销 |

## 七、对日常开发的帮助

### 1. 理解性能差异

用 dis 查看不同写法的字节码，能直观看到为什么某写法更快：
- 内置函数（1-2 条指令）vs 手写循环（十几条指令）
- 局部变量（LOAD_FAST）vs 全局变量（LOAD_GLOBAL）

### 2. 理解作用域

字节码能帮你理解作用域规则：
- 函数内的变量用 LOAD_FAST/STORE_FAST
- 模块级的变量用 LOAD_NAME/STORE_NAME
- 函数内引用全局变量用 LOAD_GLOBAL

### 3. 调试疑难问题

有些诡异的 bug（如闭包捕获变量、可变默认参数），看字节码能找到原因。

### 4. 代码审计

安全审计时，可以检查字节码确认代码没有被篡改。

### 5. 学习其他语言

理解了 Python 的字节码，再学 Java 的 .class 文件、JavaScript 的 V8 字节码，概念是相通的。

下面这段代码用 dis 查看各种表达式的字节码。`,
    code: `# ============================================================
# 第四章代码演示：查看各种字节码
# ============================================================
# 这段代码用 dis 模块查看不同表达式的字节码，
# 帮助你理解字节码的结构和常见指令。

import dis

# ========== 1. 变量赋值 ==========
print("========== 1. 变量赋值 ==========")
print("源代码: x = 42")
print("字节码：")
# compile("代码", "文件名", "exec") 把语句编译成 code 对象
# dis.dis 反汇编 code 对象
dis.dis(compile("x = 42", "<demo>", "exec"))

# ========== 2. 加法表达式 ==========
print("\\n========== 2. 加法表达式 ==========")
print("源代码: 1 + 2")
print("字节码：")
# "eval" 模式用于编译表达式（有返回值）
dis.dis(compile("1 + 2", "<demo>", "eval"))

# ========== 3. 函数调用 ==========
print("\\n========== 3. 函数调用 ==========")
print("源代码: print('hello')")
print("字节码：")
dis.dis(compile("print('hello')", "<demo>", "exec"))

# ========== 4. 列表推导 ==========
print("\\n========== 4. 列表推导 ==========")
print("源代码: [i*2 for i in range(3)]")
print("字节码：")
dis.dis(compile("[i*2 for i in range(3)]", "<demo>", "eval"))

# ========== 5. 字符串拼接 ==========
print("\\n========== 5. 字符串拼接 ==========")
print("源代码: 'a' + 'b'")
print("字节码：")
dis.dis(compile("'a' + 'b'", "<demo>", "eval"))

# ========== 6. 条件表达式 ==========
print("\\n========== 6. 条件表达式 ==========")
print("源代码: 'yes' if True else 'no'")
print("字节码：")
dis.dis(compile("'yes' if True else 'no'", "<demo>", "eval"))

# ========== 7. 属性访问 ==========
print("\\n========== 7. 属性访问 ==========")
print("源代码: obj.attr")
print("字节码：")
dis.dis(compile("obj.attr", "<demo>", "eval"))

# ========== 8. 字典构建 ==========
print("\\n========== 8. 字典构建 ==========")
print("源代码: {'a': 1, 'b': 2}")
print("字节码：")
dis.dis(compile("{'a': 1, 'b': 2}", "<demo>", "eval"))

# ========== 9. 多重赋值 ==========
print("\\n========== 9. 多重赋值 ==========")
print("源代码: a, b = 1, 2")
print("字节码：")
dis.dis(compile("a, b = 1, 2", "<demo>", "exec"))

# ========== 10. 查看原始字节码字节 ==========
print("\\n========== 10. 原始字节码字节 ==========")
# code 对象的 co_code 属性是原始的字节序列
code = compile("x = 1 + 2", "<demo>", "exec")
print("源代码: x = 1 + 2")
print(f"原始字节 (co_code): {list(code.co_code)}")
print(f"字节总数: {len(code.co_code)}")
print(f"常量表 (co_consts): {code.co_consts}")
print(f"名称表 (co_names): {code.co_names}")

# ========== 11. 对比局部变量和全局变量 ==========
print("\\n========== 11. 局部变量 vs 全局变量 ==========")
print("--- 模块级代码（用 LOAD_NAME）---")
dis.dis(compile("x = 1; y = x + 2", "<demo>", "exec"))

print("\\n--- 函数内代码（用 LOAD_FAST）---")
def example_func():
    x = 1
    y = x + 2
    return y
dis.dis(example_func)

# ========== 总结 ==========
print("\\n========== 总结 ==========")
print("字节码是 Python 虚拟机的指令格式")
print("每条指令 = 操作码 + 可选参数")
print("Python 是栈式机器：用求值栈计算表达式")
print("字节码条数越多，执行越慢 → 减少指令数量能提速")
print("常见指令：LOAD_CONST, LOAD_FAST, STORE_FAST, BINARY_ADD 等")
`,
  },

  // =========================================================
  // 第五章：用 dis 看代码真面目
  // =========================================================
  {
    id: "pyint-dis",
    group: "字节码与虚拟机",
    icon: "🔍",
    title: "用 dis 看代码真面目",
    content: `## 一、dis 模块简介

\`dis\` 模块（disassembler，反汇编器）是 Python 标准库中用于**查看字节码**的工具。它能把编译后的字节码"反汇编"成人类可读的指令列表。

\`\`\`text
  你写的 Python 代码  ──[dis]──▶  字节码指令列表（人类可读）

  def add(a, b):                  2   0 LOAD_FAST    0 (a)
      return a + b                     2 LOAD_FAST    1 (b)
                                        4 BINARY_ADD
                                        6 RETURN_VALUE
\`\`\`

### dis 模块的核心功能

| 功能 | 函数/类 | 用途 |
|------|---------|------|
| 反汇编代码 | \`dis.dis()\` | 查看函数或代码对象的字节码 |
| 细粒度分析 | \`dis.Bytecode\` | 遍历每条指令，获取详细信息 |
| 代码信息 | \`dis.code_info()\` | 查看 code 对象的详细信息 |
| 查看字节码 | \`dis.show_code()\` | 类似 code_info，输出格式不同 |
| 反汇编到字符串 | \`dis.Bytecode.dis()\` | 获取反汇编文本 |

## 二、dis.dis() 的使用

### 基本用法

\`\`\`python
import dis

# 反汇编一个函数
def add(a, b):
    return a + b

dis.dis(add)
\`\`\`

输出示例：

\`\`\`text
  2           0 LOAD_FAST      0 (a)
              2 LOAD_FAST      1 (b)
              4 BINARY_ADD
              6 RETURN_VALUE
\`\`\`

### 反汇编不同对象

\`\`\`python
# 1. 反汇编函数
dis.dis(my_func)

# 2. 反汇编源代码字符串
dis.dis(compile("x = 1 + 2", "<demo>", "exec"))

# 3. 反汇编 code 对象
dis.dis(my_func.__code__)

# 4. 反汇编整个模块（当前模块）
dis.dis(sys.modules[__name__])
\`\`\`

## 三、如何阅读 dis 输出

dis 的输出有固定的列格式：

\`\`\`text
  行号  指令地址  操作码       参数  参数值
  ──────────────────────────────────────
  2     0        LOAD_FAST    0     (a)
        2        LOAD_FAST    1     (b)
        4        BINARY_ADD
        6        RETURN_VALUE
\`\`\`

| 列 | 说明 | 示例 |
|----|------|------|
| 第 1 列 | 源代码行号 | 2（第 2 行） |
| 第 2 列 | 指令地址（字节偏移） | 0, 2, 4, 6 |
| 第 3 列 | 操作码名称 | LOAD_FAST, BINARY_ADD |
| 第 4 列 | 参数（数字） | 0, 1 |
| 第 5 列 | 参数值（可读） | (a), (b) |

### 理解指令地址

指令地址是**字节偏移量**，不是序号。每条指令占 2 个字节（操作码 + 参数），所以地址是 0, 2, 4, 6...

\`\`\`text
  地址 0: LOAD_FAST  0    → 字节 [100, 0]
  地址 2: LOAD_FAST  1    → 字节 [100, 1]
  地址 4: BINARY_ADD      → 字节 [23]
  地址 6: RETURN_VALUE    → 字节 [83]
\`\`\`

注意：无参数的指令可能只占 1 个字节，但有参数的指令占 2 个字节。

### 理解行号

第一列的行号表示**这条字节码对应源代码的哪一行**。空行号表示同一条源代码语句的多条字节码。

\`\`\`text
  1  def add(a, b):        ← 源代码第 1 行
  2      return a + b      ← 源代码第 2 行

  dis 输出：
  2   0 LOAD_FAST   0 (a)  ← 第 2 行的字节码
      2 LOAD_FAST   1 (b)  ← 同一行，行号省略
      4 BINARY_ADD         ← 同一行
      6 RETURN_VALUE       ← 同一行
\`\`\`

## 四、dis.Bytecode 细粒度分析

\`dis.Bytecode\` 类提供了更细粒度的字节码分析能力。它可以遍历每条指令，获取详细信息。

\`\`\`python
import dis

def add(a, b):
    return a + b

# 创建 Bytecode 对象
bytecode = dis.Bytecode(add)

# 遍历每条指令
for instr in bytecode:
    print(f"地址 {instr.offset}: {instr.opname} {instr.arg} ({instr.argval})")
\`\`\`

### Instruction 对象的属性

| 属性 | 说明 | 示例 |
|------|------|------|
| offset | 指令地址（字节偏移） | 0, 2, 4 |
| opname | 操作码名称 | "LOAD_FAST" |
| arg | 参数（数字） | 0, 1 |
| argval | 参数值（可读） | "a", "b" |
| is_jump_target | 是否是跳转目标 | True/False |
| starts_line | 对应源代码行号 | 2 |

### dis.Bytecode 的优势

| 特性 | dis.dis() | dis.Bytecode |
|------|-----------|--------------|
| 输出方式 | 直接打印 | 可遍历迭代 |
| 获取信息 | 看到的就是全部 | 可获取每个属性 |
| 适合场景 | 快速查看 | 程序化分析 |
| 灵活性 | 低 | 高 |

## 五、对比不同写法的字节码

### 5.1 a += 1 vs a = a + 1

\`\`\`python
def f1():
    a = 1
    a += 1      # 原地加法
    return a

def f2():
    a = 1
    a = a + 1   # 先加再赋值
    return a
\`\`\`

\`\`\`text
  a += 1 的字节码:               a = a + 1 的字节码:
  LOAD_CONST   1                 LOAD_FAST    0 (a)
  STORE_FAST   0 (a)             LOAD_CONST   1 (1)
  LOAD_FAST    0 (a)             BINARY_ADD
  LOAD_CONST   2 (2)             STORE_FAST   0 (a)
  INPLACE_ADD                    LOAD_FAST    0 (a)
  STORE_FAST   0 (a)             RETURN_VALUE

  → a += 1 用 INPLACE_ADD          → a = a + 1 用 BINARY_ADD
  → 对整数来说，两者效果一样        → 多了一次 LOAD_FAST
\`\`\`

对于不可变对象（如整数），两种写法效果完全一样。但对于可变对象（如列表），\`a += [1]\` 会原地修改，而 \`a = a + [1]\` 会创建新对象。

### 5.2 局部变量 vs 全局变量

\`\`\`text
  局部变量访问:                    全局变量访问:
  LOAD_FAST    0 (x)              LOAD_GLOBAL  0 (x)

  → LOAD_FAST 更快（直接按索引取）  → LOAD_GLOBAL 更慢（要查字典）
\`\`\`

这就是为什么函数内访问局部变量比全局变量快。

### 5.3 属性访问缓存

\`\`\`python
# 慢：每次都查找属性
def slow(obj):
    return obj.method() + obj.method()

# 快：缓存属性
def fast(obj):
    m = obj.method
    return m() + m()
\`\`\`

\`\`\`text
  slow 的字节码:                   fast 的字节码:
  LOAD_FAST   0 (obj)             LOAD_FAST   0 (obj)
  LOAD_ATTR   0 (method)          LOAD_ATTR   0 (method)
  CALL_METHOD 0                   STORE_FAST  1 (m)
  LOAD_FAST   0 (obj)             LOAD_FAST   1 (m)
  LOAD_ATTR   0 (method)          CALL_METHOD 0
  CALL_METHOD 0                   LOAD_FAST   1 (m)
  BINARY_ADD                      CALL_METHOD 0
  RETURN_VALUE                    BINARY_ADD
                                  RETURN_VALUE

  → 2 次 LOAD_ATTR                → 1 次 LOAD_ATTR
  → LOAD_ATTR 较慢                → 缓存后用 LOAD_FAST
\`\`\`

## 六、实战：字符串拼接方式对比

### 三种字符串格式化方式

\`\`\`python
def use_percent(name, age):
    return "name=%s, age=%d" % (name, age)

def use_format(name, age):
    return "name={}, age={}".format(name, age)

def use_fstring(name, age):
    return f"name={name}, age={age}"
\`\`\`

### 字节码对比

\`\`\`text
  % 格式化:
    LOAD_CONST  "name=%s, age=%d"
    LOAD_FAST   name
    LOAD_FAST   age
    BUILD_TUPLE 2
    BINARY_MODULO      ← 用 % 操作符
    RETURN_VALUE

  .format():
    LOAD_CONST  "name={}, age={}"
    LOAD_ATTR   format    ← 查找 format 方法
    LOAD_FAST   name
    LOAD_FAST   age
    CALL_METHOD 2         ← 调用 format 方法
    RETURN_VALUE

  f-string:
    LOAD_CONST  "name="
    LOAD_FAST   name
    FORMAT_VALUE 0        ← 直接格式化
    LOAD_CONST  ", age="
    LOAD_FAST   age
    FORMAT_VALUE 0
    BUILD_STRING 4        ← 拼接字符串
    RETURN_VALUE
\`\`\`

### 性能对比

| 方式 | 速度 | 原因 |
|------|------|------|
| f-string | 最快 | 直接用 FORMAT_VALUE 指令 |
| % 格式化 | 较快 | 用 BINARY_MODULO |
| .format() | 最慢 | 要查找并调用方法 |

| 方式 | 可读性 | 灵活性 |
|------|--------|--------|
| f-string | 最好 | 一般 |
| % 格式化 | 一般 | 低（类型要匹配） |
| .format() | 好 | 高（支持各种格式化） |

## 七、对日常开发的帮助

### 1. 性能优化

用 dis 对比不同写法的字节码，找出更快的方案：
- f-string 比 % 和 .format() 快
- 局部变量比全局变量快
- 内置函数比手写循环快（C 实现的指令更少）

### 2. 理解 += 和 = ... + 的区别

对可变对象（列表、字典），\`+=\` 是原地修改，\`= ... +\` 是创建新对象。看字节码能看到 INPLACE_ADD vs BINARY_ADD 的区别。

### 3. 理解作用域

通过 LOAD_FAST / LOAD_GLOBAL / LOAD_NAME 的区别，理解 Python 的变量查找规则。

### 4. 调试闭包问题

闭包捕获变量的行为有时很反直觉，看字节码能看到 LOAD_DEREF 指令，理解闭包的实现。

### 5. 代码审计

检查字节码可以确认代码没有被篡改或注入。

### 6. 学习优化技巧

很多性能优化技巧（如缓存属性、用推导式）的根本原因都可以从字节码中找到答案。

下面这段代码用 dis 对比不同写法的字节码。`,
    code: `# ============================================================
# 第五章代码演示：用 dis 对比不同写法
# ============================================================
# 这段代码演示：
#   1. a += 1 vs a = a + 1 的字节码差异
#   2. 字符串拼接方式的字节码对比
#   3. dis.Bytecode 的细粒度使用
#   4. 局部变量 vs 全局变量的字节码差异

import dis

# ========== 1. a += 1 vs a = a + 1 ==========
print("========== 1. a += 1 vs a = a + 1 ==========")
print("对比 a += 1 和 a = a + 1 的字节码差异")

def f_plus_eq():
    a = 1
    a += 1       # 原地加法（INPLACE_ADD）
    return a

def f_assign():
    a = 1
    a = a + 1    # 先加再赋值（BINARY_ADD）
    return a

print("--- a += 1 的字节码（用 INPLACE_ADD）---")
dis.dis(f_plus_eq)

print("\\n--- a = a + 1 的字节码（用 BINARY_ADD）---")
dis.dis(f_assign)

print("\\n→ 对整数来说两种写法效果一样")
print("→ 对列表来说 a += [1] 原地修改，a = a + [1] 创建新对象")

# ========== 2. 字符串拼接方式对比 ==========
print("\\n========== 2. 字符串拼接方式对比 ==========")
print("对比 % 格式化、.format() 和 f-string 的字节码")

def use_percent(name, age):
    return "name=%s, age=%d" % (name, age)

def use_format(name, age):
    return "name={}, age={}".format(name, age)

def use_fstring(name, age):
    return f"name={name}, age={age}"

print("--- % 格式化（用 BINARY_MODULO）---")
dis.dis(use_percent)

print("\\n--- .format()（用 LOAD_ATTR + CALL_METHOD）---")
dis.dis(use_format)

print("\\n--- f-string（用 FORMAT_VALUE + BUILD_STRING）---")
dis.dis(use_fstring)

print("\\n→ f-string 字节码最简洁，通常也最快")
print("→ .format() 要查找方法并调用，最慢")

# ========== 3. dis.Bytecode 细粒度分析 ==========
print("\\n========== 3. dis.Bytecode 细粒度分析 ==========")
print("用 dis.Bytecode 遍历每条指令，获取详细信息")

def example():
    x = 10
    y = 20
    return x + y

print("函数 example 的字节码指令列表：")
bytecode = dis.Bytecode(example)
for instr in bytecode:
    # instr 对象包含：offset, opname, arg, argval, is_jump_target, starts_line
    jump_flag = "← 跳转目标" if instr.is_jump_target else ""
    line_num = f"行{instr.starts_line}" if instr.starts_line is not None else "  "
    print(f"  {line_num} 地址{instr.offset:3d}  {instr.opname:20s} 参数={instr.arg}  值={instr.argval}  {jump_flag}")

# ========== 4. dis.code_info 查看代码信息 ==========
print("\\n========== 4. dis.code_info ==========")
print("用 dis.code_info 查看 code 对象的详细信息：")
print(dis.code_info(example))

# ========== 5. 局部变量 vs 全局变量 ==========
print("\\n========== 5. 局部变量 vs 全局变量 ==========")
print("对比模块级代码和函数内代码的变量加载方式")

print("--- 模块级代码（用 LOAD_NAME / STORE_NAME）---")
dis.dis(compile("x = 1; y = x + 2", "<module>", "exec"))

print("\\n--- 函数内代码（用 LOAD_FAST / STORE_FAST）---")
def with_locals():
    x = 1
    y = x + 2
    return y
dis.dis(with_locals)

print("\\n→ LOAD_FAST 按索引直接取，比 LOAD_NAME（查字典）快")

# ========== 6. 对比内置函数和手写循环 ==========
print("\\n========== 6. 内置函数 vs 手写循环 ==========")
print("对比 sum(range(5)) 和手写循环的字节码")

print("--- sum(range(5)) 的字节码 ---")
dis.dis(compile("sum(range(5))", "<demo>", "eval"))

print("\\n--- 手写循环的字节码 ---")
def manual_sum():
    total = 0
    for i in range(5):
        total += i
    return total
dis.dis(manual_sum)

print("\\n→ sum(range(5)) 只有几条指令，手写循环有十几条")
print("→ 指令越少，PVM 解释循环次数越少，执行越快")

# ========== 总结 ==========
print("\\n========== 总结 ==========")
print("dis 模块是查看 Python 字节码的工具")
print("  dis.dis()       → 反汇编代码，直接打印")
print("  dis.Bytecode    → 细粒度分析，可遍历指令")
print("  dis.code_info() → 查看 code 对象详细信息")
print("\\n通过对比字节码可以：")
print("  1. 理解不同写法的性能差异")
print("  2. 理解 += 和 = ...+ 的区别")
print("  3. 理解局部变量和全局变量的速度差异")
print("  4. 理解为什么内置函数比手写循环快")
`,
  },

  // =========================================================
  // 第六章：Python 虚拟机如何执行
  // =========================================================
  {
    id: "pyint-pvm",
    group: "字节码与虚拟机",
    icon: "⚙️",
    title: "Python 虚拟机如何执行",
    content: `## 一、PVM 是什么

**PVM（Python Virtual Machine，Python 虚拟机）** 是 CPython 中负责**执行字节码**的核心组件。它不是一个独立的程序，而是 CPython 解释器内部的一个**巨大的执行循环**。

\`\`\`text
  CPython 解释器的组成：
  ┌─────────────────────────────────────┐
  │            CPython                   │
  │  ┌─────────┐    ┌─────────┐         │
  │  │ 编译器   │    │  PVM    │         │
  │  │(源码→   │    │(执行    │         │
  │  │ 字节码)  │    │ 字节码)  │         │
  │  └─────────┘    └─────────┘         │
  └─────────────────────────────────────┘
\`\`\`

PVM 的职责很单一：**取出字节码指令 → 理解它 → 执行它 → 取下一条**，如此循环直到所有指令执行完毕。

| 组件 | 职责 |
|------|------|
| 编译器 | 把源代码编译成字节码 |
| PVM | 执行字节码 |
| 求值栈 | 计算表达式的临时存储 |
| 栈帧 | 每个函数调用的执行环境 |

## 二、执行循环：取指 → 译码 → 执行

PVM 的核心是一个**取指-译码-执行循环（Fetch-Decode-Execute Cycle）**：

\`\`\`text
  ┌──────────────────────────────────────────┐
  │             PVM 执行循环                  │
  │                                          │
  │   ┌──────────┐                           │
  │   │ 取指     │ ← 从字节码序列取下一条指令  │
  │   │ (Fetch)  │                           │
  │   └────┬─────┘                           │
  │        ▼                                 │
  │   ┌──────────┐                           │
  │   │ 译码     │ ← 理解操作码的含义          │
  │   │ (Decode) │                           │
  │   └────┬─────┘                           │
  │        ▼                                 │
  │   ┌──────────┐                           │
  │   │ 执行     │ ← 执行对应操作（栈操作等）  │
  │   │ (Execute)│                           │
  │   └────┬─────┘                           │
  │        ▼                                 │
  │   ┌──────────┐                           │
  │   │ 更新PC   │ ← 更新指令指针，指向下一条  │
  │   └────┬─────┘                           │
  │        │                                 │
  │        └───────── 循环回到取指 ──────────┘│
  │                  （直到 RETURN_VALUE）     │
  └──────────────────────────────────────────┘
\`\`\`

### 指令指针（PC）

PVM 维护一个**指令指针（Program Counter，PC）**，记录当前执行到哪条字节码。PC 是字节偏移量，初始为 0，每次执行后递增。

\`\`\`text
  字节码序列：
  [0] LOAD_CONST  1    ← PC=0，执行这条
  [2] LOAD_CONST  2    ← PC=2，执行这条
  [4] BINARY_ADD       ← PC=4，执行这条
  [6] RETURN_VALUE     ← PC=6，执行这条，结束

  跳转指令会直接修改 PC：
  JUMP_ABSOLUTE 4  → PC 直接设为 4（跳到 BINARY_ADD）
\`\`\`

### 每条指令的开销

CPython 执行每条字节码指令的开销：
1. 取出操作码和参数
2. 查表确定操作码对应的处理函数
3. 调用处理函数执行操作
4. 更新 PC

这个开销对**每条指令**都要发生，所以字节码条数越多，总开销越大。

## 三、栈帧（Frame）

### 什么是栈帧

每次函数调用，PVM 都会创建一个**栈帧（Frame）**，用于保存这次调用的执行环境。

\`\`\`text
  调用 main() → 调用 func1() → 调用 func2()

  栈帧（后进先出）：
  ┌──────────────┐
  │ func2 的栈帧  │ ← 当前执行（栈顶）
  ├──────────────┤
  │ func1 的栈帧  │ ← 等待 func2 返回
  ├──────────────┤
  │ main 的栈帧   │ ← 等待 func1 返回
  └──────────────┘
\`\`\`

### 栈帧包含什么

| 组成部分 | 说明 | Python 属性 |
|----------|------|-------------|
| 代码对象 | 函数的字节码 | f_code |
| 局部变量 | 函数内的变量 | f_locals |
| 全局变量 | 模块的全局变量 | f_globals |
| 求值栈 | 计算表达式的栈 | f_valuestack |
| 指令指针 | 当前执行位置 | f_lasti |
| 行号 | 对应源代码行 | f_lineno |
| 调用者 | 上一级栈帧 | f_back |

### 栈帧的生命周期

\`\`\`text
  1. 函数被调用
     → 创建新栈帧
     → 压入调用栈

  2. 函数执行中
     → PVM 在这个栈帧中执行字节码
     → 用这个栈帧的求值栈计算

  3. 函数返回
     → 把返回值传给调用者
     → 销毁这个栈帧
     → 弹出调用栈
\`\`\`

### 用 sys._getframe() 查看栈帧

Python 提供了一个隐藏函数 \`sys._getframe()\`，可以获取当前栈帧：

\`\`\`python
import sys

def my_func():
    frame = sys._getframe()
    print(frame.f_code.co_name)  # "my_func"
    print(frame.f_locals)        # 局部变量
    print(frame.f_back)          # 调用者的栈帧
\`\`\`

| 属性 | 说明 |
|------|------|
| f_code | 代码对象（包含字节码） |
| f_locals | 局部变量字典 |
| f_globals | 全局变量字典 |
| f_back | 调用者的栈帧 |
| f_lineno | 当前执行行号 |
| f_lasti | 最后执行的指令地址 |

### 调用栈深度

Python 默认限制调用栈深度为 1000 层（防止无限递归导致栈溢出）：

\`\`\`text
  RecursionError: maximum recursion depth exceeded
\`\`\`

可以用 \`sys.getrecursionlimit()\` 查看限制，\`sys.setrecursionlimit()\` 修改限制（不建议随意修改）。

## 四、字节码如何操作栈

### 基本栈操作

\`\`\`text
  执行 x = 1 + 2 的过程：

  1. LOAD_CONST 1    → 栈: [1]
     把常量 1 压入栈顶

  2. LOAD_CONST 2    → 栈: [1, 2]
     把常量 2 压入栈顶

  3. BINARY_ADD      → 栈: [3]
     弹出 1 和 2，相加，结果 3 压回栈

  4. STORE_NAME x    → 栈: []
     弹出 3，存到变量 x
\`\`\`

### 函数调用的栈操作

\`\`\`text
  执行 print("hello") 的过程：

  1. LOAD_NAME print   → 栈: [print函数]
     加载 print 函数

  2. LOAD_CONST "hello" → 栈: [print函数, "hello"]
     加载参数

  3. CALL_FUNCTION 1    → 栈: [None]
     调用函数（1 个参数），结果压栈

  4. POP_TOP            → 栈: []
     弹出栈顶（丢弃返回值）
\`\`\`

### 属性访问的栈操作

\`\`\`text
  执行 obj.attr 的过程：

  1. LOAD_NAME obj    → 栈: [obj对象]
  2. LOAD_ATTR attr   → 栈: [attr的值]
     弹出 obj，查找属性，结果压栈
\`\`\`

## 五、控制流指令

### if 语句

\`\`\`text
  if x > 0:
      print("正数")

  字节码：
    LOAD_NAME    x
    LOAD_CONST   0
    COMPARE_OP   >        ← 比较操作，结果 True/False 压栈
    POP_JUMP_IF_FALSE  → 跳到结束    ← 条件为假时跳转
    LOAD_NAME    print
    LOAD_CONST   "正数"
    CALL_FUNCTION 1
    POP_TOP
  结束:
\`\`\`

\`\`\`text
  流程图：
  ┌─────────────┐
  │ 计算 x > 0   │
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐     False
  │ 栈顶是 True？├────────────▶ 跳过 print
  └──────┬──────┘
         │ True
         ▼
  ┌─────────────┐
  │ print("正数")│
  └─────────────┘
\`\`\`

### for 循环

\`\`\`text
  for i in range(3):
      print(i)

  字节码：
    LOAD_NAME    range
    LOAD_CONST   3
    CALL_FUNCTION 1    ← 调用 range(3)，得到迭代器
    GET_ITER            ← 获取迭代器
  循环开始:
    FOR_ITER  → 跳到结束    ← 取下一个值，没有则跳转
    STORE_NAME  i          ← 存到 i
    LOAD_NAME   print
    LOAD_NAME   i
    CALL_FUNCTION 1
    POP_TOP
    JUMP_ABSOLUTE  循环开始  ← 跳回循环开始
  结束:
\`\`\`

### while 循环

\`\`\`text
  while n > 0:
      n -= 1

  字节码：
  循环开始:
    LOAD_NAME    n
    LOAD_CONST   0
    COMPARE_OP   >
    POP_JUMP_IF_FALSE  → 结束    ← 条件为假时跳转
    LOAD_NAME    n
    LOAD_CONST   1
    INPLACE_SUBTRACT
    STORE_NAME   n
    JUMP_ABSOLUTE  循环开始      ← 跳回条件检查
  结束:
\`\`\`

### 跳转指令一览

| 指令 | 作用 | 跳转方式 |
|------|------|----------|
| JUMP_FORWARD | 向前跳转 | 相对地址 |
| JUMP_ABSOLUTE | 跳转到指定地址 | 绝对地址 |
| POP_JUMP_IF_TRUE | 弹出栈顶，为 True 则跳 | 绝对地址 |
| POP_JUMP_IF_FALSE | 弹出栈顶，为 False 则跳 | 绝对地址 |
| FOR_ITER | 迭代器取值，取完则跳 | 相对地址 |

## 六、为什么 Python 慢

### 1. 每条指令都要解释

CPython 没有 JIT，每条字节码都要：
- 取出操作码
- 查表确定处理函数
- 调用处理函数
- 更新 PC

\`\`\`text
  C 语言：
    机器码 → CPU 直接执行（1 个时钟周期）

  Python：
    字节码 → 取指 → 译码 → 执行（几十个时钟周期）
\`\`\`

### 2. 动态类型检查

每次运算都要检查类型：

\`\`\`text
  C 语言：a + b
    → 直接 CPU 加法指令（类型在编译时确定）

  Python：a + b
    → 检查 a 的类型
    → 检查 b 的类型
    → 确定 + 的含义（数字加法？字符串拼接？）
    → 执行对应操作
    → 可能还要创建新对象
\`\`\`

### 3. 对象开销

Python 中一切皆对象，每个整数、字符串都是对象，有额外开销：

\`\`\`text
  C 语言的整数：
    4 字节，直接存值

  Python 的整数：
    28 字节（包含引用计数、类型指针、值）
    → 创建和销毁对象都有开销
\`\`\`

### 4. 函数调用开销

每次函数调用要创建栈帧：

\`\`\`text
  C 语言函数调用：
    压参数 → call 指令 → ret 指令（几条机器指令）

  Python 函数调用：
    创建栈帧 → 绑定参数 → 执行 → 销毁栈帧（几百条字节码）
\`\`\`

### 性能对比

| 操作 | C | Python | 倍数 |
|------|---|--------|------|
| 整数加法 | ~1 纳秒 | ~50 纳秒 | 50x |
| 函数调用 | ~5 纳秒 | ~500 纳秒 | 100x |
| 列表访问 | ~1 纳秒 | ~30 纳秒 | 30x |
| for 循环 | ~2 纳秒/次 | ~100 纳秒/次 | 50x |

## 七、对日常开发的帮助

### 1. 理解函数调用开销

每次函数调用都有创建栈帧的开销。在性能敏感的代码中：
- 避免在循环中频繁调用小函数
- 用内联代替函数调用（如简单的 lambda）

### 2. 理解递归限制

Python 默认递归深度 1000 层，因为每层递归都要创建一个栈帧。深度递归会：
- 消耗大量内存（栈帧占用）
- 触发 RecursionError

### 3. 理解异常传播

异常通过栈帧向上传播。理解栈帧就能理解异常的传播机制。

### 4. 优化循环

理解 for 循环的字节码后，能明白为什么：
- 列表推导比 for + append 快（推导式在独立作用域中优化过）
- 内置函数（如 sum、map）比手写循环快

### 5. 调试调用栈

出错时的 traceback 就是调用栈的快照。理解栈帧就能看懂 traceback 中每层的信息。

### 6. 选择性能优化方向

知道 Python 慢在解释循环，就能选择正确的优化方向：
- 用 C 扩展（如 numpy）代替纯 Python
- 用 Cython 编译 Python 为 C
- 用 PyPy 的 JIT 加速

下面这段代码演示 PVM 的执行机制。`,
    code: `# ============================================================
# 第六章代码演示：PVM 的执行机制
# ============================================================
# 这段代码演示：
#   1. 用 sys._getframe() 查看当前栈帧
#   2. 栈帧的属性详解
#   3. 调用栈深度
#   4. if / for / while 的字节码
#   5. 递归与栈帧

import sys
import dis

# ========== 1. 用 sys._getframe() 查看栈帧 ==========
print("========== 1. 用 sys._getframe() 查看栈帧 ==========")
# sys._getframe() 返回当前栈帧对象

def outer():
    # outer 函数中的局部变量
    msg = "我在 outer 中"
    def inner():
        # inner 函数中的局部变量
        data = [1, 2, 3]
        # 获取当前栈帧
        frame = sys._getframe()
        print("当前函数:", frame.f_code.co_name)
        print("调用者函数:", frame.f_back.f_code.co_name)
        print("调用者的调用者:", frame.f_back.f_back.f_code.co_name)
        print("当前局部变量:", frame.f_locals)
        print("调用者局部变量:", frame.f_back.f_locals)
    inner()

outer()

# ========== 2. 栈帧属性详解 ==========
print("\\n========== 2. 栈帧属性详解 ==========")

def show_frame(a, b):
    # 定义一些局部变量
    x = a + b
    y = x * 2
    z = [1, 2, 3]
    # 获取当前栈帧
    frame = sys._getframe()
    print("f_code.co_name (函数名):", frame.f_code.co_name)
    print("f_locals (局部变量):", frame.f_locals)
    print("f_globals 键数 (全局变量数):", len(frame.f_globals))
    print("f_lineno (当前行号):", frame.f_lineno)
    print("f_lasti (最后指令地址):", frame.f_lasti)
    print("f_back (调用者):", frame.f_back.f_code.co_name if frame.f_back else "无")
    return x + y

show_frame(10, 20)

# ========== 3. 调用栈深度 ==========
print("\\n========== 3. 调用栈深度 ==========")

def check_depth():
    # 遍历调用栈，计算深度
    depth = 0
    frame = sys._getframe()
    # f_back 指向调用者的栈帧，层层向上直到 None
    while frame is not None:
        depth += 1
        frame = frame.f_back
    return depth

def level3():
    return check_depth()

def level2():
    return level3()

def level1():
    return level2()

print("从 level1 → level2 → level3 → check_depth 的调用栈：")
d = level1()
print(f"调用栈深度: {d} 层")

print(f"\\nPython 递归深度限制: {sys.getrecursionlimit()}")

# ========== 4. if 语句的字节码 ==========
print("\\n========== 4. if 语句的字节码 ==========")

def demo_if(x):
    if x > 0:
        return "正数"
    else:
        return "非正数"

print("源代码:")
print("def demo_if(x):")
print("    if x > 0:")
print('        return "正数"')
print("    else:")
print('        return "非正数"')
print("\\n字节码：")
dis.dis(demo_if)
print("\\n→ POP_JUMP_IF_FALSE 实现条件跳转")

# ========== 5. for 循环的字节码 ==========
print("\\n========== 5. for 循环的字节码 ==========")

def demo_for():
    result = 0
    for i in range(5):
        result += i
    return result

print("源代码:")
print("def demo_for():")
print("    result = 0")
print("    for i in range(5):")
print("        result += i")
print("    return result")
print("\\n字节码：")
dis.dis(demo_for)
print("\\n→ FOR_ITER 和 JUMP_ABSOLUTE 实现循环")

# ========== 6. while 循环的字节码 ==========
print("\\n========== 6. while 循环的字节码 ==========")

def demo_while():
    n = 10
    while n > 0:
        n -= 1
    return n

print("源代码:")
print("def demo_while():")
print("    n = 10")
print("    while n > 0:")
print("        n -= 1")
print("    return n")
print("\\n字节码：")
dis.dis(demo_while)
print("\\n→ POP_JUMP_IF_FALSE 和 JUMP_ABSOLUTE 实现循环")

# ========== 7. 递归调用与栈帧 ==========
print("\\n========== 7. 递归调用与栈帧 ==========")

def factorial(n, depth=0):
    # 每次递归调用都创建一个新栈帧
    indent = "  " * depth
    print(f"{indent}调用 factorial({n})")
    if n <= 1:
        print(f"{indent}→ 返回 1（基线条件）")
        return 1
    result = n * factorial(n - 1, depth + 1)
    print(f"{indent}→ factorial({n}) = {n} * factorial({n-1}) = {result}")
    return result

print("递归调用 factorial(4)：")
print("（每次调用创建一个新栈帧）")
result = factorial(4)
print(f"\\n最终结果: {result}")

# ========== 总结 ==========
print("\\n========== 总结 ==========")
print("PVM 是 Python 虚拟机，负责执行字节码")
print("  执行循环：取指 → 译码 → 执行 → 更新 PC")
print("  栈帧：每次函数调用创建一个新栈帧")
print("  控制流：用跳转指令实现 if/for/while")
print("  Python 慢的原因：每条指令都要解释执行")
print("  优化方向：用 C 扩展、Cython、PyPy 等")
`,
  },
];