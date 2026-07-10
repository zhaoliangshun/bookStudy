// =============================================================
// Python 异常处理教程 —— 第一批章节（共 6 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   异常基础（3 章）：
//     1. pyex-what-is-exception  — 什么是异常
//     2. pyex-built-in-exceptions — 内置异常体系
//     3. pyex-exception-hierarchy — 捕获顺序与层级关系
//   捕获与处理（3 章）：
//     4. pyex-try-except          — try/except 完整语法
//     5. pyex-else-finally        — else 与 finally
//     6. pyex-except-details      — 捕获细节与陷阱
//
// 每个章节包含：
//   id      : 唯一标识
//   group   : 分组名
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解
//   code    : 可运行、带详细中文注释的 Python 示例代码
//
// 转义规则：content/code 内部反引号写作 \`，\${ 写作 \$\{，
//           Python 代码中的 \n 写作 \\n。
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：什么是异常
  // =========================================================
  {
    id: "pyex-what-is-exception",
    group: "异常基础",
    icon: "⚠️",
    title: "什么是异常",
    content: `# 什么是异常

写代码时，事情不会总是按计划进行：用户输入了非法字符、文件被人删了、网络突然断了、除数变成了 0、列表下标越界……一个健壮的程序必须能**优雅地应对这些意外**，而不是直接崩溃退出。Python 用"异常（Exception）"机制来描述和管理运行时错误，这是写出工业级代码的核心技能。

## 一、异常是什么

**异常（Exception）** 是程序运行时发生的"非正常事件"，它会打断正常的指令执行流。如果异常没有被任何代码处理，Python 会一路向上抛出，最终打印一长串 \`Traceback\` 并终止程序。

来看一个最经典的例子——除以零：

\`\`\`python
1 / 0
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
ZeroDivisionError: division by zero
\`\`\`

这里的 \`ZeroDivisionError\` 就是异常的类型名。Python 内置了上百种异常类，它们大多继承自 \`Exception\`，而 \`Exception\` 又继承自 \`BaseException\`。

### 1.1 异常的三个组成部分

一个异常包含三部分信息：

1. **类型（Type）**：\`ZeroDivisionError\`、\`ValueError\`、\`FileNotFoundError\` 等，描述"这是什么类型的错误"。
2. **消息（Message）**：\`division by zero\`，人类可读的错误描述。
3. **回溯（Traceback）**：异常发生时的完整调用栈，告诉你"在哪一行抛出、从哪里调过来的"。

### 1.2 看懂 Traceback

Traceback 是排查问题的第一手资料。学会读它，是处理异常的前提。下面是一个典型的 traceback：

\`\`\`text
Traceback (most recent call last):
  File "main.py", line 10, in <module>
    result = calculate(data)
  File "main.py", line 6, in calculate
    return x / y
ZeroDivisionError: division by zero
\`\`\`

阅读顺序：**从下往上读**。

- **最后一行**：异常类型 + 消息，告诉你"发生了什么"。
- **倒数第二块**：\`File "main.py", line 6, in calculate\` + \`return x / y\`，告诉你"具体哪一行抛的"。
- **再往上**：调用链，\`line 10\` 的 \`calculate(data)\` 调用了 \`calculate\`，里面 \`line 6\` 抛了异常。

> 技巧：先看最后一行知道错误类型，再看中间的代码行定位具体位置，最后看调用链理解来龙去脉。

## 二、异常 vs 语法错误 vs Bug

这三个概念经常被混淆，但它们是完全不同的东西：

| 概念 | 何时发生 | 例子 | 异常能救吗 |
| --- | --- | --- | --- |
| **语法错误（SyntaxError）** | 解析阶段，代码根本没法编译 | 括号没闭合 \`def f(:\` | 不能，这不是异常 |
| **异常（Exception）** | 运行阶段，语法没问题但执行遇到障碍 | \`1/0\`、\`open("不存在.txt")\` | 能，用 try/except 捕获 |
| **Bug** | 逻辑错误，结果不对但不一定报错 | 算错工资、循环次数少一次 | 不能，靠测试和代码审查 |

\`\`\`python
# 语法错误：解析阶段就失败，根本跑不起来
def f(:
    pass
# SyntaxError: invalid syntax

# 异常：语法没问题，运行时才出错
x = 1 / 0
# ZeroDivisionError: division by zero

# Bug：不报错，但结果错了（少加了一个数）
total = 1 + 2 + 3   # 本该是 1+2+3+4=10，漏了 4
\`\`\`

> 关键认知：异常处理是处理"运行时意外"的机制，它救不了语法错误，也救不了逻辑 Bug。

## 三、异常是对象

在 Python 中，异常是真正的**对象（object）**，是某个异常类的实例。这意味着异常可以：

- 被赋值给变量（\`except X as e\` 里的 \`e\`）
- 拥有属性（\`e.args\`、\`e.__cause__\` 等）
- 被自定义子类化（自定义异常）
- 携带业务数据

\`\`\`python
try:                               # 尝试执行以下代码块
    1 / 0
except ZeroDivisionError as e:      # 捕获异常并绑定到变量 e
    print(type(e))                  # <class 'ZeroDivisionError'>
    print(e)                        # division by zero
    print(e.args)                   # ('division by zero',)
\`\`\`

理解"异常是对象"很重要，后续的自定义异常、异常链都建立在这个认知上。

## 四、为什么需要异常处理

如果没有异常机制，处理错误只能靠返回值：

\`\`\`python
# C 风格：用返回值表示错误
def divide(a, b):
    if b == 0:
        return None        # 用 None 表示失败？还是 -1？还是 False？
    return a / b

result = divide(10, 0)
if result is None:         # 每次调用都要检查，繁琐且容易漏
    print("出错了")
\`\`\`

这种方式的痛点：

1. **错误码语义不清**：\`None\` / \`-1\` / \`False\` 到底是不是错误？没法统一。
2. **每次调用都要检查**：忘检查一次，错误就悄悄传播下去。
3. **正常逻辑和错误处理混在一起**：代码可读性差。
4. **无法携带丰富的错误信息**：一个返回值表达不了"为什么错"。

异常机制的优势：

1. **正常路径和错误路径分离**：\`try\` 里写正常逻辑，\`except\` 里处理错误。
2. **自动传播**：不处理就会一路向上抛，不会被忽略。
3. **类型丰富**：\`ValueError\`、\`TypeError\` 各司其职。
4. **携带信息**：异常对象上可以挂载任意数据。

\`\`\`python
# Python 风格：用异常表示错误
def divide(a, b):
    if b == 0:
        raise ValueError("除数不能为 0")  # 主动抛出
    return a / b

try:                               # 尝试执行以下代码块
    result = divide(10, 0)         # 正常逻辑，不用每次检查
except ValueError as e:            # 捕获并处理
    print(f"出错: {e}")
\`\`\`

## 五、本章小结

- 异常是运行时的"非正常事件"，不处理会打印 Traceback 并终止程序。
- 异常有类型、消息、traceback 三部分信息，读 traceback 要"从下往上"。
- 异常 ≠ 语法错误 ≠ Bug，三者发生在不同阶段，处理方式不同。
- 异常是真正的对象，可以被捕获、传递、自定义。
- 异常机制把"正常逻辑"和"错误处理"分离，比返回值错误码更清晰。

下一章我们会系统认识 Python 内置的上百种异常类，了解它们的名字、用途和层级关系。
`,
    code: `# ============================================================
# 第一章演示：认识异常、读懂 Traceback
# ============================================================
import sys

print("=" * 60)
print("第 1 部分：不处理的异常会怎样")
print("=" * 60)

# 演示异常发生时的信息（用 try 捕获后打印，避免程序崩溃）
try:
    print("  即将执行 1 / 0 ...")
    result = 1 / 0
    print("  这一行不会执行")  # 异常发生后跳过
except ZeroDivisionError as e:
    print(f"  捕获到异常: {type(e).__name__}: {e}")
    print(f"  异常的 args: {e.args}")
    print(f"  异常的类型对象: {type(e)}")

print()
print("=" * 60)
print("第 2 部分：异常是对象，有属性有方法")
print("=" * 60)

try:
    num = int("不是数字")
except ValueError as e:
    print(f"  类型名: {type(e).__name__}")
    print(f"  消息: {e}")
    print(f"  args: {e.args}")
    print(f"  str(e): {str(e)}")
    print(f"  repr(e): {repr(e)}")

print()
print("=" * 60)
print("第 3 部分：用 sys.exc_info() 获取当前异常")
print("=" * 60)

try:
    {}["missing_key"]
except KeyError:
    exc_type, exc_val, exc_tb = sys.exc_info()
    print(f"  exc_type: {exc_type.__name__}")
    print(f"  exc_val:  {exc_val}")
    print(f"  exc_tb:   {exc_tb}")  # traceback 对象

print()
print("=" * 60)
print("第 4 部分：常见异常类型一览")
print("=" * 60)

# 演示几种最常见异常的触发方式
demos = [
    ("ZeroDivisionError", lambda: 1 / 0),
    ("ValueError",        lambda: int("abc")),
    ("TypeError",         lambda: "a" + 1),
    ("IndexError",        lambda: [1, 2][10]),
    ("KeyError",          lambda: {}["x"]),
    ("AttributeError",    lambda: (1).foo),
    ("NameError",         lambda: undefined_var),
]

for name, fn in demos:
    try:
        fn()
    except Exception as e:
        print(f"  {name:20s} -> {type(e).__name__}: {e}")

print()
print("=" * 60)
print("第 5 部分：异常 vs 语法错误（演示，不真正触发语法错误）")
print("=" * 60)

# 语法错误无法在运行时 try 捕获，这里用代码说明
print("  语法错误示例（写在注释里，因为无法运行）:")
print('    def f(:  <- 括号没闭合，SyntaxError，解析阶段失败')
print("  异常示例:")
print("    1 / 0    <- 语法没问题，运行时 ZeroDivisionError")

try:
    # 这才是异常：语法正确，运行时出错
    open("/这个/文件/肯定/不存在.txt")
except FileNotFoundError as e:
    print(f"  捕获 FileNotFoundError: {e}")

print()
print("=" * 60)
print("第 6 部分：异常不处理会向上传播")
print("=" * 60)

def level3():
    print("  -> 进入 level3，即将抛出异常")
    raise RuntimeError("从最底层抛出")

def level2():
    print("  -> 进入 level2，调用 level3")
    level3()  # 不捕获，异常向上传
    print("  -> level3 返回后（这行不会执行）")

def level1():
    print("  -> 进入 level1，调用 level2")
    level2()
    print("  -> level2 返回后（这行不会执行）")

try:
    level1()
except RuntimeError as e:
    print(f"  -> 在最外层捕获: {e}")
    print("  -> 如果这里也不捕获，程序就会打印 Traceback 并退出")

print()
print("全部演示完成。")
`,
  },

  // =========================================================
  // 第二章：内置异常体系
  // =========================================================
  {
    id: "pyex-built-in-exceptions",
    group: "异常基础",
    icon: "📚",
    title: "内置异常体系",
    content: `# 内置异常体系

Python 内置了上百种异常类，每种异常都有一个语义化的名字，看到名字就知道大概发生了什么。本章系统介绍常用的内置异常，帮你快速读懂 traceback、准确选择要捕获的异常类型。

## 一、异常的根：BaseException

所有内置异常都继承自 \`BaseException\`。它的直接子类有四个：

\`\`\`text
BaseException
├── SystemExit          ← sys.exit() 抛出
├── KeyboardInterrupt   ← 用户按 Ctrl+C
├── GeneratorExit       ← 生成器被关闭
└── Exception           ← 所有"普通"异常的父类
\`\`\`

**关键区分**：\`SystemExit\`、\`KeyboardInterrupt\`、\`GeneratorExit\` 是"系统级"异常，**不应该被普通 except 捕获**。日常说的"异常"几乎都继承自 \`Exception\`。

所以经验法则：**捕获异常时用 \`except Exception:\` 而不是裸 \`except:\`**，这样不会误伤 Ctrl+C 和 sys.exit()。

## 二、Exception 下的主要分支

\`Exception\` 是所有普通异常的父类，它下面有几十个子类。下面是最常用的几大分支：

\`\`\`text
Exception
├── StopIteration              ← 迭代器耗尽
├── ArithmeticError            ← 算术错误基类
│   ├── ZeroDivisionError      ← 除以零
│   ├── OverflowError           ← 数值溢出
│   └── FloatingPointError      ← 浮点错误（很少用）
├── LookupError                ← 查找错误基类
│   ├── IndexError             ← 列表下标越界
│   └── KeyError                ← 字典 key 不存在
├── OSError                    ← 操作系统错误基类
│   ├── FileNotFoundError       ← 文件不存在
│   ├── PermissionError         ← 权限不足
│   ├── FileExistsError         ← x 模式文件已存在
│   ├── IsADirectoryError       ← 是目录不是文件
│   ├── TimeoutError            ← 超时
│   └── ConnectionError         ← 网络连接错误
│       ├── ConnectionRefusedError
│       ├── ConnectionResetError
│       └── BrokenPipeError
├── TypeError                  ← 类型不对
├── ValueError                 ← 值不合法
│   └── UnicodeDecodeError      ← 解码失败
├── AttributeError             ← 属性不存在
├── NameError                  ← 变量名未定义
├── RuntimeError              ← 其他运行时错误
│   └── RecursionError          ← 递归过深
├── ImportError               ← 导入失败
│   └── ModuleNotFoundError     ← 模块不存在
├── KeyError
├── IndexError
├── StopAsyncIteration         ← 异步迭代器耗尽
├── Warning                    ← 警告基类
│   ├── DeprecationWarning      ← 弃用警告
│   └── UserWarning             ← 用户自定义警告
└── ...
\`\`\`

> 注意：\`OSError\` 在 Python 3.3 后合并了 \`IOError\`、\`EnvironmentError\`、\`WindowsError\`，现在它们都是 \`OSError\` 的别名。

## 三、常用异常速查表

下面这张表覆盖了日常开发 95% 以上的场景，建议收藏：

| 异常 | 触发场景 | 典型例子 |
| --- | --- | --- |
| \`ZeroDivisionError\` | 除以 0 或取模 0 | \`1 / 0\` |
| \`ValueError\` | 值的类型对但内容非法 | \`int("abc")\` |
| \`TypeError\` | 操作或函数收到错误类型 | \`"a" + 1\` |
| \`IndexError\` | 序列下标越界 | \`[1,2][10]\` |
| \`KeyError\` | 字典 key 不存在 | \`{}["x"]\` |
| \`AttributeError\` | 访问不存在的属性 | \`(1).foo\` |
| \`NameError\` | 变量名未定义 | \`print(x)\`（x 未赋值） |
| \`FileNotFoundError\` | 打开不存在的文件 | \`open("x.txt")\` |
| \`PermissionError\` | 权限不足 | 写只读文件 |
| \`FileExistsError\` | x 模式文件已存在 | \`open("a", "x")\` |
| \`OSError\` | 各种 OS 错误的基类 | 磁盘满等 |
| \`StopIteration\` | 迭代器耗尽 | \`next(iter([]))\` |
| \`UnicodeDecodeError\` | 解码失败 | \`b"\\xff".decode("utf-8")\` |
| \`UnicodeEncodeError\` | 编码失败 | \`"中文".encode("ascii")\` |
| \`RecursionError\` | 递归超过最大深度 | 无限递归 |
| \`NotImplementedError\` | 抽象方法未实现 | 父类方法只 raise 这个 |
| \`RuntimeError\` | 其他运行时错误 | 不属于上面任何一类时 |
| \`MemoryError\` | 内存不足 | 分配超大对象 |
| \`ImportError\` | 导入失败 | \`import 不存在的模块\` |
| \`ModuleNotFoundError\` | 模块不存在 | \`import foobar\` |
| \`KeyboardInterrupt\` | 用户 Ctrl+C | 运行中按 Ctrl+C |
| \`SystemExit\` | sys.exit() | \`sys.exit(0)\` |
| \`AssertionError\` | assert 断言失败 | \`assert False\` |
| \`StopAsyncIteration\` | 异步迭代器耗尽 | async for 结束 |

## 四、OSError 家族详解

\`OSError\` 是最常用的"IO 相关"异常基类，它有一个特别有用的属性 \`errno\`：

\`\`\`python
import errno                       # 导入 errno 模块

try:                               # 尝试执行以下代码块
    open("/not/exist.txt")
except OSError as e:               # 捕获 OSError 及其子类
    print(e.errno)                # 错误码，如 2
    print(e.strerror)             # 错误描述，如 'No such file or directory'
    print(e.filename)             # 相关文件名
    # 用 errno 模块做精确判断
    if e.errno == errno.ENOENT:   # ENOENT = 文件不存在
        print("文件不存在")
\`\`\`

\`OSError\` 常见子类和对应 errno：

| 子类 | errno 常量 | 含义 |
| --- | --- | --- |
| \`FileNotFoundError\` | \`ENOENT\` (2) | 文件/目录不存在 |
| \`PermissionError\` | \`EACCES\` (13) / \`EPERM\` (1) | 权限不足 |
| \`FileExistsError\` | \`EEXIST\` (17) | 文件已存在 |
| \`IsADirectoryError\` | \`EISDIR\` (21) | 是目录不是文件 |
| \`NotADirectoryError\` | \`ENOTDIR\` (20) | 是文件不是目录 |
| \`TimeoutError\` | \`ETIMEDOUT\` (110) | 操作超时 |

> 技巧：捕获 \`OSError\` 能一次性覆盖所有 IO 错误；如果需要区分具体原因，用 \`e.errno\` 判断比捕获多个子类更灵活。

## 五、TypeError vs ValueError

这两个最容易混淆，区分关键看"是类型不对还是值不对"：

\`\`\`python
# TypeError：操作的类型根本不支持
"a" + 1          # str 不能 + int
len(123)         # int 没有 len
[1, 2] + (3, 4) # list 不能 + tuple

# ValueError：类型对，但值的内容非法
int("abc")       # str 转 int 没问题，但 "abc" 不是数字
int("123")       # 正常，返回 123
int("3.14")      # ValueError，str 能转 int 但 "3.14" 不行
\`\`\`

记忆口诀：**TypeError 是"风马牛不相及"，ValueError 是"对得上号但内容不行"**。

## 六、ImportError vs ModuleNotFoundError

\`ModuleNotFoundError\` 是 \`ImportError\` 的子类（Python 3.6+），专门表示"模块找不到"：

\`\`\`python
try:                               # 尝试执行以下代码块
    import nonexistent_module
except ModuleNotFoundError:        # 更具体：模块不存在
    print("模块没装")
except ImportError:                # 更宽泛：导入过程出错
    print("导入失败，但模块文件存在")
\`\`\`

捕获顺序：先 \`ModuleNotFoundError\`（具体），再 \`ImportError\`（宽泛）。

## 七、Warning 不是异常

\`Warning\` 虽然继承自 \`Exception\`，但它不是"错误"，而是"提醒"。默认情况下警告只会打印消息，不会中断程序：

\`\`\`python
import warnings                     # 导入 warnings 模块
warnings.warn("这个功能将在 2.0 弃用", DeprecationWarning)
print("程序继续运行")              # 不会中断
\`\`\`

可以用 \`warnings.filterwarnings("error")\` 把警告升级为异常，常用于测试。

## 八、本章小结

- 所有异常继承自 \`BaseException\`，日常异常继承自 \`Exception\`。
- \`SystemExit\` / \`KeyboardInterrupt\` / \`GeneratorExit\` 是系统级异常，不要用裸 \`except\` 捕获。
- \`OSError\` 是 IO 错误的基类，有 \`FileNotFoundError\` / \`PermissionError\` 等子类，可用 \`errno\` 精确判断。
- \`TypeError\` 是类型不对，\`ValueError\` 是值不合法。
- \`Warning\` 不是错误，是提醒，默认不中断程序。

下一章讲解异常的层级关系如何影响捕获顺序——这是写出正确 try/except 的关键。
`,
    code: `# ============================================================
# 第二章演示：内置异常体系一览
# ============================================================
import sys
import errno

print("=" * 60)
print("第 1 部分：算术类异常 ArithmeticError")
print("=" * 60)

arithmetic_cases = [
    ("ZeroDivisionError", lambda: 1 / 0),
    ("OverflowError",      lambda: 2.0 ** 10000),
]

for name, fn in arithmetic_cases:
    try:
        fn()
    except ArithmeticError as e:  # 捕获基类，能覆盖所有子类
        print(f"  {name}: {type(e).__name__}: {e}")

print()
print("=" * 60)
print("第 2 部分：查找类异常 LookupError")
print("=" * 60)

lookup_cases = [
    ("IndexError", lambda: [1, 2, 3][10]),
    ("KeyError",   lambda: {"a": 1}["b"]),
]

for name, fn in lookup_cases:
    try:
        fn()
    except LookupError as e:  # IndexError 和 KeyError 都是 LookupError 子类
        print(f"  {name}: {type(e).__name__}: {e}")

print()
print("=" * 60)
print("第 3 部分：OSError 家族与 errno")
print("=" * 60)

try:
    open("/这个/路径/肯定/不存在.txt")
except OSError as e:
    print(f"  类型: {type(e).__name__}")
    print(f"  errno: {e.errno}")
    print(f"  strerror: {e.strerror}")
    print(f"  filename: {e.filename}")
    # 用 errno 模块判断具体原因
    if e.errno == errno.ENOENT:
        print("  -> 判断: 文件或目录不存在 (ENOENT)")

# 演示 OSError 的子类都是 OSError 实例
try:
    open("/not/exist")
except FileNotFoundError as e:
    print(f"  FileNotFoundError 是 OSError 实例吗: {isinstance(e, OSError)}")

print()
print("=" * 60)
print("第 4 部分：TypeError vs ValueError")
print("=" * 60)

type_errors = [
    ("str + int",    lambda: "a" + 1),
    ("len(int)",     lambda: len(123)),
    ("list + tuple", lambda: [1] + (2,)),
]

print("  TypeError 示例（类型不对）:")
for desc, fn in type_errors:
    try:
        fn()
    except TypeError as e:
        print(f"    {desc:15s} -> {e}")

value_errors = [
    ('int("abc")',    lambda: int("abc")),
    ('int("3.14")',   lambda: int("3.14")),
]

print("  ValueError 示例（值不合法）:")
for desc, fn in value_errors:
    try:
        fn()
    except ValueError as e:
        print(f"    {desc:15s} -> {e}")

print()
print("=" * 60)
print("第 5 部分：NameError vs AttributeError")
print("=" * 60)

# NameError：变量名未定义
try:
    print(undefined_variable)
except NameError as e:
    print(f"  NameError: {e}")

# AttributeError：对象没有该属性
try:
    (42).append(1)
except AttributeError as e:
    print(f"  AttributeError: {e}")

print()
print("=" * 60)
print("第 6 部分：ImportError vs ModuleNotFoundError")
print("=" * 60)

try:
    import nonexistent_pkg_xyz
except ModuleNotFoundError as e:
    print(f"  ModuleNotFoundError: {e}")
    print(f"  是 ImportError 子类吗: {isinstance(e, ImportError)}")

print()
print("=" * 60)
print("第 7 部分：RecursionError 递归过深")
print("=" * 60)

def recurse():
    return recurse()  # 无限递归

try:
    recurse()
except RecursionError as e:
    print(f"  RecursionError: {e}")
    print(f"  当前递归限制: {sys.getrecursionlimit()}")

print()
print("=" * 60)
print("第 8 部分：UnicodeDecodeError / EncodeError")
print("=" * 60)

# 解码失败
try:
    b"\\xff\\xfe".decode("utf-8")
except UnicodeDecodeError as e:
    print(f"  UnicodeDecodeError: {e}")

# 编码失败
try:
    "中文".encode("ascii")
except UnicodeEncodeError as e:
    print(f"  UnicodeEncodeError: {e}")

print()
print("=" * 60)
print("第 9 部分：Warning 不是异常")
print("=" * 60)

import warnings
print("  发出警告前")
warnings.warn("这是一个提醒", UserWarning)
print("  发出警告后，程序继续运行")

# 把警告升级为异常
warnings.filterwarnings("error", category=UserWarning)
try:
    warnings.warn("再次提醒", UserWarning)
except UserWarning as e:
    print(f"  警告被升级为异常: {e}")
warnings.resetwarnings()  # 恢复默认

print()
print("=" * 60)
print("第 10 部分：isinstance 验证继承关系")
print("=" * 60)

# 验证异常继承链
checks = [
    (FileNotFoundError, OSError),
    (PermissionError,   OSError),
    (IndexError,        LookupError),
    (KeyError,          LookupError),
    (ZeroDivisionError, ArithmeticError),
    (ModuleNotFoundError, ImportError),
    (RecursionError,   RuntimeError),
    (UnicodeDecodeError, ValueError),
]

for child, parent in checks:
    print(f"  {child.__name__:25s} 是 {parent.__name__} 子类: {issubclass(child, parent)}")

print()
print("全部演示完成。")
`,
  },

  // =========================================================
  // 第三章：捕获顺序与层级关系
  // =========================================================
  {
    id: "pyex-exception-hierarchy",
    group: "异常基础",
    icon: "🔀",
    title: "捕获顺序与层级关系",
    content: `# 捕获顺序与层级关系

异常的继承层级直接决定了 \`except\` 的匹配行为。理解"捕获父类异常会同时捕获所有子类"这一规则，以及"except 分支必须从具体到宽泛"的顺序要求，是写出正确异常处理代码的关键。

## 一、捕获父类 = 捕获所有子类

Python 在匹配 \`except\` 时，不仅匹配精确类型，还匹配**所有父类**。也就是说，如果你 \`except OSError\`，那么 \`FileNotFoundError\`、\`PermissionError\` 等所有 \`OSError\` 的子类都会被捕获。

\`\`\`python
try:                               # 尝试执行以下代码块
    open("不存在.txt")
except OSError:                    # FileNotFoundError 是 OSError 子类，能匹配
    print("捕获到 OS 错误")
\`\`\`

这很好用，因为很多时候你只需要知道"出错了"，不需要区分具体是哪种 OS 错误。

## 二、except 分支按顺序匹配

\`try/except\` 有多个分支时，Python **从上到下依次匹配**，一旦匹配成功就执行该分支，**不再检查后面的分支**。

这意味着：**必须把具体的异常写在前面，宽泛的写在后面**，否则宽泛的分支会"抢走"所有匹配。

### 2.1 正确顺序：具体在前

\`\`\`python
try:                               # 尝试执行以下代码块
    open("不存在.txt")
except FileNotFoundError:          # 先具体：只匹配文件不存在
    print("文件不存在")
except OSError:                    # 后宽泛：匹配其他 OS 错误
    print("其他 OS 错误")
\`\`\`

\`FileNotFoundError\` 是 \`OSError\` 的子类。如果文件不存在，先匹配到 \`FileNotFoundError\` 分支；如果是权限不足等其他 OS 错误，跳过第一个分支，匹配 \`OSError\`。

### 2.2 错误顺序：宽泛在前

\`\`\`python
try:                               # 尝试执行以下代码块
    open("不存在.txt")
except OSError:                    # 宽泛在前，会先匹配！
    print("其他 OS 错误")           # FileNotFoundError 永远到不了
except FileNotFoundError:          # 永远不会执行（dead code）
    print("文件不存在")
\`\`\`

\`OSError\` 在前，由于 \`FileNotFoundError\` 是 \`OSError\` 子类，第一个分支就会匹配成功，第二个分支永远执行不到。Python 不会报错，但这是一个逻辑 bug。

### 2.3 父类兜底模式

推荐的写法是"从具体到宽泛"，最后用父类兜底：

\`\`\`python
try:                               # 尝试执行以下代码块
    do_something()
except FileNotFoundError:          # 最具体
    handle_not_found()
except PermissionError:            # 次具体
    handle_permission()
except OSError as e:               # 兜底：其他所有 OS 错误
    handle_other_os(e)
except Exception as e:             # 最终兜底：所有其他异常
    handle_unknown(e)
\`\`\`

## 三、用元组一次捕获多种异常

如果多种异常的处理方式相同，可以用**元组**一次性捕获：

\`\`\`python
try:                               # 尝试执行以下代码块
    value = data[key]
except (KeyError, IndexError) as e:  # 捕获 KeyError 或 IndexError
    print(f"查找失败: {e}")
\`\`\`

元组里的异常类型没有顺序要求（它们是"或"的关系），但仍然遵循"具体在前"的整体原则——这个元组分支要放在更宽泛的分支前面。

\`\`\`python
try:                               # 尝试执行以下代码块
    risky()
except (KeyError, IndexError):     # 具体的几种
    handle_lookup()
except LookupError:               # 兜底：LookupError 的其他子类
    handle_other_lookup()
\`\`\`

## 四、except Exception 的边界

\`except Exception\` 能捕获几乎所有"普通"异常，但**捕获不到** \`KeyboardInterrupt\` 和 \`SystemExit\`，因为它们继承自 \`BaseException\` 而不是 \`Exception\`：

\`\`\`python
import sys                         # 导入 sys 模块

try:                               # 尝试执行以下代码块
    sys.exit(1)                   # 抛出 SystemExit
except Exception:                  # 捕获不到 SystemExit！
    print("这里不会执行")
# 程序直接退出
\`\`\`

这是好事：你不会意外地"吞掉"用户的 Ctrl+C 或程序的正常退出。

| 捕获方式 | 能捕获 Exception 子类 | 能捕获 KeyboardInterrupt | 能捕获 SystemExit |
| --- | --- | --- | --- |
| \`except Exception:\` | 是 | **否** | **否** |
| \`except BaseException:\` | 是 | 是 | 是 |
| 裸 \`except:\` | 是 | 是 | 是 |

**结论**：需要"捕获所有普通异常"时，用 \`except Exception:\`，**永远不要用裸 \`except:\`**。

## 五、异常匹配的本质：isinstance

\`except SomeError\` 的匹配规则等价于 \`isinstance(raised_exception, SomeError)\`：

\`\`\`python
try:                               # 尝试执行以下代码块
    raise FileNotFoundError("test")
except OSError:                    # isinstance(FileNotFoundError实例, OSError) == True
    print("匹配成功")              # 会执行这里
\`\`\`

理解这一点，就能预测任何异常的匹配行为。

## 六、验证继承关系

写代码前，可以用 \`issubclass\` 验证两个异常类的继承关系：

\`\`\`python
issubclass(FileNotFoundError, OSError)       # True
issubclass(PermissionError, OSError)         # True
issubclass(IndexError, LookupError)          # True
issubclass(KeyError, LookupError)            # True
issubclass(ZeroDivisionError, ArithmeticError)  # True
issubclass(FileNotFoundError, Exception)     # True
issubclass(KeyboardInterrupt, Exception)     # False！继承自 BaseException
\`\`\`

\`issubclass(A, B)\` 返回 \`True\` 表示 \`A\` 是 \`B\` 的子类（或就是 \`B\` 本身）。

## 七、捕获基类的利与弊

### 7.1 利：简洁、不漏

\`\`\`python
# 简洁：一个 except 搞定所有 IO 错误
try:                               # 尝试执行以下代码块
    with open(path) as f:
        data = f.read()
except OSError as e:               # FileNotFoundError/PermissionError 全覆盖
    log_error(e)
\`\`\`

### 7.2 弊：可能捕获到不想要的

\`\`\`python
try:                               # 尝试执行以下代码块
    data = json.loads(f.read())    # 如果这里抛 JSONDecodeError(ValueError子类)
except Exception:                  # 太宽泛，会把 JSON 解析错误也吞掉
    print("出错了")                 # 真正的 bug 被掩盖
\`\`\`

**原则**：捕获你能处理的异常，不要"一刀切"。如果不确定，宁可多写几个 \`except\` 分支，也不要一个 \`except Exception\` 了事。

## 八、本章小结

- 捕获父类异常会同时捕获所有子类（\`except OSError\` 覆盖 \`FileNotFoundError\` 等）。
- 多个 except 分支**从上到下匹配**，必须"具体在前，宽泛在后"。
- 多种异常处理方式相同时，用元组 \`except (A, B, C)\` 一次捕获。
- \`except Exception\` 覆盖所有普通异常但**不**覆盖 \`KeyboardInterrupt\` / \`SystemExit\`。
- 裸 \`except\` 等价于 \`except BaseException\`，会误伤系统退出，**禁用**。
- 匹配规则等价于 \`isinstance\`，可用 \`issubclass\` 预判。

下一章进入"捕获与处理"组，系统学习 \`try/except\` 的完整语法。
`,
    code: `# ============================================================
# 第三章演示：捕获顺序与层级关系
# ============================================================
import sys

print("=" * 60)
print("第 1 部分：捕获父类 = 捕获所有子类")
print("=" * 60)

# FileNotFoundError 是 OSError 子类
try:
    open("/这个/文件/不存在.txt")
except OSError as e:  # 用父类捕获
    print(f"  用 OSError 捕获到了: {type(e).__name__}")
    print(f"  isinstance(e, OSError): {isinstance(e, OSError)}")
    print(f"  isinstance(e, FileNotFoundError): {isinstance(e, FileNotFoundError)}")

print()
print("=" * 60)
print("第 2 部分：正确顺序——具体在前")
print("=" * 60)

def test_open(path):
    try:
        open(path)
    except FileNotFoundError:
        print(f"  -> FileNotFoundError: 文件不存在")
    except PermissionError:
        print(f"  -> PermissionError: 权限不足")
    except OSError as e:
        print(f"  -> 其他 OSError: {type(e).__name__}: {e}")

test_open("/这个/文件/不存在.txt")

print()
print("=" * 60)
print("第 3 部分：错误顺序——宽泛在前（演示反面教材）")
print("=" * 60)

def bad_order(path):
    try:
        open(path)
    except OSError:  # 宽泛在前，FileNotFoundError 永远到不了
        print(f"  -> 匹配到 OSError（FileNotFoundError 被抢走了）")
    except FileNotFoundError:  # dead code
        print(f"  -> 这行永远不会执行")

bad_order("/not/exist.txt")
print("  注意：上面匹配到了 OSError，FileNotFoundError 分支是死代码")

print()
print("=" * 60)
print("第 4 部分：元组一次捕获多种异常")
print("=" * 60)

def lookup(data, key):
    try:
        return data[key]
    except (KeyError, IndexError) as e:
        print(f"  查找失败 ({type(e).__name__}): {e}")
        return None

print("  字典查找不存在 key:")
lookup({"a": 1}, "b")

print("  列表越界:")
lookup([1, 2, 3], 10)

print()
print("=" * 60)
print("第 5 部分：except Exception 不捕获 KeyboardInterrupt")
print("=" * 60)

# 演示 Exception 和 BaseException 的边界
print("  KeyboardInterrupt 是 Exception 子类吗:",
      issubclass(KeyboardInterrupt, Exception))
print("  KeyboardInterrupt 是 BaseException 子类吗:",
      issubclass(KeyboardInterrupt, BaseException))
print("  SystemExit 是 Exception 子类吗:",
      issubclass(SystemExit, Exception))
print("  SystemExit 是 BaseException 子类吗:",
      issubclass(SystemExit, BaseException))

print()
print("=" * 60)
print("第 6 部分：父类兜底模式")
print("=" * 60)

def safe_operation(data, key):
    try:
        value = data[key]
        result = 100 / value
        return result
    except KeyError:
        print(f"    -> 具体处理: key '{key}' 不存在")
    except ZeroDivisionError:
        print(f"    -> 具体处理: 值为 0，不能除")
    except (TypeError, ValueError) as e:
        print(f"    -> 类型/值错误: {e}")
    except Exception as e:
        print(f"    -> 兜底: 未预期的 {type(e).__name__}: {e}")
    return None

print("  正常情况:")
print(f"    结果: {safe_operation({'a': 5}, 'a')}")

print("  key 不存在:")
safe_operation({"a": 5}, "b")

print("  值为 0:")
safe_operation({"a": 0}, "a")

print("  类型不对（用字符串做除法）:")
safe_operation({"a": "hello"}, "a")

print()
print("=" * 60)
print("第 7 部分：用 issubclass 预判匹配行为")
print("=" * 60)

hierarchy = [
    ("FileNotFoundError", "OSError"),
    ("PermissionError", "OSError"),
    ("IndexError", "LookupError"),
    ("KeyError", "LookupError"),
    ("ZeroDivisionError", "ArithmeticError"),
    ("ModuleNotFoundError", "ImportError"),
    ("RecursionError", "RuntimeError"),
    ("UnicodeDecodeError", "ValueError"),
    ("KeyboardInterrupt", "Exception"),
    ("SystemExit", "Exception"),
]

import builtins
for child_name, parent_name in hierarchy:
    child = getattr(builtins, child_name)
    parent = getattr(builtins, parent_name)
    result = issubclass(child, parent)
    print(f"  {child_name:25s} -> {parent_name:15s}: {result}")

print()
print("=" * 60)
print("第 8 部分：except 匹配等价于 isinstance")
print("=" * 60)

try:
    raise FileNotFoundError("演示")
except OSError as e:
    print(f"  raise FileNotFoundError, except OSError:")
    print(f"    isinstance(e, OSError): {isinstance(e, OSError)}")
    print(f"    isinstance(e, FileNotFoundError): {isinstance(e, FileNotFoundError)}")

try:
    raise PermissionError("演示")
except OSError as e:
    print(f"  raise PermissionError, except OSError:")
    print(f"    isinstance(e, OSError): {isinstance(e, OSError)}")
    print(f"    isinstance(e, PermissionError): {isinstance(e, PermissionError)}")

print()
print("全部演示完成。")
`,
  },

  // =========================================================
  // 第四章：try/except 完整语法
  // =========================================================
  {
    id: "pyex-try-except",
    group: "捕获与处理",
    icon: "🛡️",
    title: "try/except 完整语法",
    content: `# try/except 完整语法

\`try/except\` 是 Python 异常处理的核心结构。本章系统讲解它的完整语法、各种变体和使用场景，帮你写出正确、清晰的异常捕获代码。

## 一、最基本的形式

\`\`\`python
try:                               # 尝试执行以下代码块
    可能出错的代码
except 异常类型:
    处理代码
\`\`\`

\`try\` 块里的代码如果抛出了 \`except\` 指定的异常类型，就跳到 \`except\` 块执行；如果没有匹配的 \`except\`，异常继续向上抛。

\`\`\`python
try:                               # 尝试执行以下代码块
    n = int(input("输入数字: "))
    print(10 / n)
except ValueError:                 # 捕获 ValueError
    print("不是合法的数字")
\`\`\`

## 二、完整结构

\`try/except\` 的完整结构有四个子句：

\`\`\`python
try:                               # 尝试执行以下代码块
    # 可能抛异常的代码
except ExceptionType1 as e1:       # 捕获 ExceptionType1 并绑定到 e1
    # 处理异常 1
except (ExceptionType2, ExceptionType3) as e2:  # 元组捕获多种
    # 处理异常 2、3
except Exception as e3:            # 兜底捕获
    # 处理其他异常
else:                              # try 块没有抛异常时才执行
    # 使用 try 的结果
finally:                           # 无论是否异常都执行
    # 清理资源
\`\`\`

执行顺序：

1. 执行 \`try\` 块。
2. 如果抛异常 → 匹配 \`except\`（从上到下）→ 执行匹配的分支 → **跳过 else**。
3. 如果没抛异常 → 跳过所有 \`except\` → 执行 \`else\`。
4. **最后一定执行 \`finally\`**（不管有没有异常、有没有 return）。

## 三、多个 except 分支

可以写多个 \`except\` 分支，分别处理不同异常：

\`\`\`python
try:                               # 尝试执行以下代码块
    n = int(input("输入数字: "))
    result = 10 / n
    data = [1, 2, 3]
    print(data[n])
except ValueError:                 # 输入不是数字
    print("请输入整数")
except ZeroDivisionError:          # 除以 0
    print("不能除以 0")
except IndexError:                 # 下标越界
    print("下标越界")
\`\`\`

**注意顺序**：从具体到宽泛。Python 从上到下匹配，一旦命中就执行该分支，不再检查后面的。

## 四、捕获异常对象（as 关键字）

用 \`as\` 把异常对象绑定到一个变量，可以访问异常的消息和属性：

\`\`\`python
try:                               # 尝试执行以下代码块
    1 / 0
except ZeroDivisionError as e:     # 捕获并绑定到 e
    print(type(e))                 # <class 'ZeroDivisionError'>
    print(e)                       # division by zero
    print(e.args)                  # ('division by zero',)
    print(str(e))                 # division by zero
\`\`\`

### 4.1 异常对象的常用属性

- \`e.args\`：异常参数元组，通常是错误消息。
- \`str(e)\`：异常的字符串表示，通常就是错误消息。
- \`type(e).__name__\`：异常类名。
- \`e.__cause__\`：异常链中的原始异常（raise from）。
- \`e.__context__\`：隐式异常链中的原始异常。
- \`e.__traceback__\`：traceback 对象。

### 4.2 OSError 的特殊属性

\`OSError\` 及其子类有额外属性：

\`\`\`python
try:                               # 尝试执行以下代码块
    open("/not/exist")
except OSError as e:
    print(e.errno)       # 错误码（整数）
    print(e.strerror)    # 错误描述
    print(e.filename)    # 相关文件名
\`\`\`

## 五、元组捕获多种异常

当多种异常的处理逻辑相同时，用元组避免重复：

\`\`\`python
try:                               # 尝试执行以下代码块
    value = container[key]
except (KeyError, IndexError) as e:  # 同时捕获两种
    print(f"查找失败: {e}")
\`\`\`

对比重复写法：

\`\`\`python
# 重复，不推荐
try:                               # 尝试执行以下代码块
    value = container[key]
except KeyError as e:
    print(f"查找失败: {e}")
except IndexError as e:
    print(f"查找失败: {e}")  # 完全相同的处理
\`\`\`

## 六、不要裸 except

**裸 \`except:\`（不写异常类型）是 Python 里最危险的反模式之一**：

\`\`\`python
# 极度不推荐！
try:                               # 尝试执行以下代码块
    do_something()
except:                            # 捕获所有，包括 KeyboardInterrupt
    pass                           # 吞掉所有错误
\`\`\`

裸 \`except\` 的问题：

1. **捕获 \`KeyboardInterrupt\`**：用户按 Ctrl+C 想中断程序，但被吞掉了，程序"卡住"无法停止。
2. **捕获 \`SystemExit\`**：\`sys.exit()\` 失效，程序退不出。
3. **掩盖 Bug**：所有异常都被 \`pass\` 吞掉，真正的错误被隐藏，难以排查。
4. **违反 Python 哲学**：Explicit is better than implicit（明确优于隐式）。

**正确做法**：

\`\`\`python
# 要捕获所有普通异常，用 except Exception
try:                               # 尝试执行以下代码块
    do_something()
except Exception as e:            # 不捕获 KeyboardInterrupt/SystemExit
    log_error(e)                   # 至少记录日志，不要 pass
\`\`\`

## 七、try 块要尽量小

一个常见错误是把大段代码都塞进 \`try\`，导致意外捕获了不该捕获的异常：

\`\`\`python
# 不好：try 块太大
try:                               # 尝试执行以下代码块
    data = load_config()           # 可能 FileNotFoundError
    result = process(data)         # 可能 TypeError / ValueError
    save_result(result)            # 可能 OSError
    send_email(result)             # 可能 ConnectionError
except OSError:                    # 捕获了哪些？混在一起
    print("出错了")
\`\`\`

\`process(data)\` 里如果抛了 \`TypeError\`，不会被 \`except OSError\` 捕获，会向上传——这可能不是你想要的。而且 \`save_result\` 的 \`OSError\` 和 \`load_config\` 的 \`OSError\` 处理方式可能不同。

**更好**：只把"真正可能出错且你确实要处理"的那几行放进 try：

\`\`\`python
# 好：try 块精确
try:                               # 尝试执行以下代码块
    data = load_config()
except FileNotFoundError:          # 只处理这个
    data = default_config()

result = process(data)             # 如果这里出错，让它向上传
save_result(result)
\`\`\`

## 八、在 except 中处理异常

\`except\` 块里可以做的事：

1. **记录日志**：\`log_error(e)\`
2. **返回默认值**：\`return None\`
3. **重新抛出**：\`raise\`（让上层处理）
4. **抛出新异常**：\`raise MyError(...) from e\`（异常链）
5. **重试**：循环重试几次
6. **降级处理**：用备用方案

\`\`\`python
def load_config(path, default=None):
    try:                           # 尝试执行以下代码块
        with open(path) as f:
            return json.load(f)
    except FileNotFoundError:      # 文件不存在
        return default             # 用默认值降级
    except json.JSONDecodeError as e:  # JSON 格式错误
        log_error(e)
        raise                      # 重新抛出，让上层决定

config = load_config("app.json", default={})
\`\`\`

## 九、本章小结

- \`try/except\` 完整结构：\`try\` → \`except\`（多个）→ \`else\` → \`finally\`。
- 多个 \`except\` 从具体到宽泛，用元组捕获多种异常。
- \`as e\` 绑定异常对象，访问 \`e.args\`、\`e.errno\` 等属性。
- **永远不要裸 \`except:\`**，用 \`except Exception:\` 替代。
- \`try\` 块尽量小，只包住真正可能出错且你要处理的代码。
- \`except\` 里可以记录日志、返回默认值、重新抛出、抛新异常、重试、降级。

下一章讲解 \`else\` 和 \`finally\` 两个子句的精确语义和使用场景。
`,
    code: `# ============================================================
# 第四章演示：try/except 完整语法
# ============================================================
import json
import io

print("=" * 60)
print("第 1 部分：基本 try/except")
print("=" * 60)

def safe_int_divide(a_str, b_str):
    try:
        a = int(a_str)
        b = int(b_str)
        return a / b
    except ValueError as e:
        print(f"    ValueError: {e}")
        return None
    except ZeroDivisionError as e:
        print(f"    ZeroDivisionError: {e}")
        return None

print("  safe_int_divide('10', '2') =", safe_int_divide("10", "2"))
print("  safe_int_divide('abc', '2') =", safe_int_divide("abc", "2"))
print("  safe_int_divide('10', '0') =", safe_int_divide("10", "0"))

print()
print("=" * 60)
print("第 2 部分：捕获异常对象 as e")
print("=" * 60)

exceptions_to_trigger = [
    ("ValueError",        lambda: int("xyz")),
    ("IndexError",        lambda: [1, 2][10]),
    ("KeyError",          lambda: {}["missing"]),
    ("ZeroDivisionError", lambda: 1 / 0),
]

for name, fn in exceptions_to_trigger:
    try:
        fn()
    except Exception as e:
        print(f"  {name}:")
        print(f"    type(e).__name__ = {type(e).__name__}")
        print(f"    str(e)           = {str(e)}")
        print(f"    e.args           = {e.args}")

print()
print("=" * 60)
print("第 3 部分：OSError 的特殊属性")
print("=" * 60)

try:
    open("/not/exist/file.txt")
except OSError as e:
    print(f"  类型: {type(e).__name__}")
    print(f"  errno: {e.errno}")
    print(f"  strerror: {e.strerror}")
    print(f"  filename: {e.filename}")

print()
print("=" * 60)
print("第 4 部分：元组捕获多种异常")
print("=" * 60)

def safe_lookup(container, key):
    try:
        return container[key]
    except (KeyError, IndexError) as e:
        print(f"    查找失败 ({type(e).__name__}): {e}")
        return None

print("  字典查找:")
print(f"    {'a':>5} -> {safe_lookup({'a': 1, 'b': 2}, 'a')}")
print(f"    {'z':>5} -> {safe_lookup({'a': 1, 'b': 2}, 'z')}")

print("  列表查找:")
print(f"    [1] -> {safe_lookup([10, 20, 30], 1)}")
print(f"    [9] -> {safe_lookup([10, 20, 30], 9)}")

print()
print("=" * 60)
print("第 5 部分：多个 except 分支按顺序匹配")
print("=" * 60)

def parse_and_calc(s, idx):
    """把字符串转成数字，再从列表取值做除法"""
    try:
        n = int(s)
        lst = [10, 20, 30]
        return lst[idx] / n
    except ValueError:
        print(f"    -> ValueError: '{s}' 不是数字")
    except IndexError:
        print(f"    -> IndexError: 下标 {idx} 越界")
    except ZeroDivisionError:
        print(f"    -> ZeroDivisionError: 不能除以 0")
    return None

print("  parse_and_calc('2', 1) =", parse_and_calc("2", 1))
print("  parse_and_calc('abc', 1) =", parse_and_calc("abc", 1))
print("  parse_and_calc('2', 10) =", parse_and_calc("2", 10))
print("  parse_and_calc('0', 1) =", parse_and_calc("0", 1))

print()
print("=" * 60)
print("第 6 部分：try 块要小——对比演示")
print("=" * 60)

# 模拟用 StringIO 代替文件
def load_json_config(config_text, default=None):
    # 好：try 块只包住可能出错的部分
    try:
        return json.loads(config_text)
    except json.JSONDecodeError as e:
        print(f"    JSON 解析失败: {e}")
        return default if default is not None else {}

print("  有效 JSON:")
result = load_json_config('{"name": "Alice", "age": 30}')
print(f"    结果: {result}")

print("  无效 JSON:")
result = load_json_config('{"name": "Alice", oops}', default={"name": "default"})
print(f"    结果: {result}")

print()
print("=" * 60)
print("第 7 部分：except 里的处理策略")
print("=" * 60)

def fetch_data_with_retry(url, max_retries=3):
    """模拟带重试的数据获取"""
    for attempt in range(1, max_retries + 1):
        try:
            # 模拟：第 3 次才成功
            if attempt < 3:
                raise ConnectionError(f"连接失败（第 {attempt} 次）")
            return f"来自 {url} 的数据"
        except ConnectionError as e:
            print(f"    第 {attempt} 次失败: {e}")
            if attempt == max_retries:
                print(f"    达到最大重试次数，返回 None")
                return None
            print(f"    准备重试...")

print("  模拟带重试的请求:")
data = fetch_data_with_retry("https://api.example.com/data")
print(f"  最终结果: {data}")

print()
print("=" * 60)
print("第 8 部分：降级处理")
print("=" * 60)

def get_setting(key, config_file="config.json"):
    """优先读配置文件，失败则用环境变量，再失败用默认值"""
    # 模拟配置文件不存在
    try:
        # 用 StringIO 模拟读取
        raise FileNotFoundError(config_file)
    except FileNotFoundError:
        print(f"    配置文件 {config_file} 不存在，尝试环境变量")
        # 降级到环境变量（这里模拟）
        env_value = "from_env"
        if env_value:
            return env_value
        # 再降级到默认值
        return "default_value"

print("  get_setting('timeout'):", get_setting("timeout"))

print()
print("=" * 60)
print("第 9 部分：综合示例——健壮的配置加载器")
print("=" * 60)

def robust_config_loader(config_text):
    """加载 JSON 配置，处理各种异常情况"""
    try:
        config = json.loads(config_text)
    except json.JSONDecodeError as e:
        print(f"    [错误] JSON 格式不正确: {e}")
        return {}
    except Exception as e:
        print(f"    [错误] 未预期的异常: {type(e).__name__}: {e}")
        return {}

    # 校验配置内容
    try:
        port = config["port"]
        if not isinstance(port, int) or port < 0 or port > 65535:
            raise ValueError(f"端口必须是 0-65535 的整数，得到 {port}")
        print(f"    [成功] 配置加载完成，端口={port}")
        return config
    except KeyError:
        print(f"    [警告] 配置缺少 port 字段，使用默认 8080")
        config["port"] = 8080
        return config
    except ValueError as e:
        print(f"    [错误] 配置校验失败: {e}")
        return {}

# 测试各种情况
configs = [
    ('{"port": 3000}',           "正常配置"),
    ('{"port": "abc"}',          "端口类型错误"),
    ('{"name": "app"}',          "缺少 port 字段"),
    ('{"port": 99999}',          "端口超出范围"),
    ('{invalid json}',           "JSON 格式错误"),
]

for config_text, desc in configs:
    print(f"  测试: {desc}")
    robust_config_loader(config_text)

print()
print("全部演示完成。")
`,
  },

  // =========================================================
  // 第五章：else 与 finally
  // =========================================================
  {
    id: "pyex-else-finally",
    group: "捕获与处理",
    icon: "🔄",
    title: "else 与 finally",
    content: `# else 与 finally

\`try/except\` 还有两个可选子句：\`else\` 和 \`finally\`。它们看似简单，但精确理解它们的执行时机和使用场景，能帮你写出更清晰、更安全的代码。

## 一、else 子句：没异常时才执行

\`else\` 块在 \`try\` 块**没有抛出任何异常**时才执行。如果抛了异常并被 \`except\` 捕获，\`else\` 不会执行。

\`\`\`python
try:                               # 尝试执行以下代码块
    f = open("data.txt", encoding="utf-8")
except FileNotFoundError:          # 捕获 FileNotFoundError
    print("文件不存在")
else:                              # try 没抛异常时才执行
    data = f.read()                # 把"使用结果"的代码放这里
    f.close()
    print(data)
\`\`\`

### 1.1 为什么要用 else

不用 else，把"使用结果"的代码也放进 try 也行，但会有问题：

\`\`\`python
# 不用 else：可能误捕获
try:                               # 尝试执行以下代码块
    f = open("data.txt", encoding="utf-8")
    data = f.read()                 # 如果这里抛了 FileNotFoundError？
    f.close()
except FileNotFoundError:          # 会同时捕获 open 和 read 的错误
    print("文件不存在")
\`\`\`

如果 \`f.read()\` 因为某种原因抛了 \`FileNotFoundError\`（比如读到一半文件被删），会被同一个 \`except\` 捕获，打印"文件不存在"——这是误导。文件是打开成功了的，是读取过程出了问题。

用 \`else\` 把"可能出错的代码"和"使用结果的代码"分开：

\`\`\`python
try:                               # 尝试执行以下代码块
    f = open("data.txt", encoding="utf-8")  # 只包住 open
except FileNotFoundError:          # 只捕获 open 的错误
    print("文件不存在")
else:                              # open 成功后才执行
    # 如果 read 抛 FileNotFoundError，不会被上面的 except 捕获
    # 而是向上传播——这才是正确行为
    data = f.read()
    f.close()
\`\`\`

### 1.2 else 的价值总结

1. **避免意外捕获**：\`else\` 里的异常不会被 \`try\` 的 \`except\` 捕获。
2. **代码意图清晰**：\`try\` 只负责"可能出错的操作"，\`else\` 负责"成功后的处理"。
3. **try 块更小**：减少 \`try\` 块的体积，降低误捕获风险。

### 1.3 else 的典型场景

\`\`\`python
# 场景：转换输入，成功才使用
try:                               # 尝试执行以下代码块
    n = int(user_input)
except ValueError:                 # 捕获 ValueError
    print("请输入数字")
else:                              # 转换成功才使用
    print(f"你输入了 {n}")
    print(f"平方是 {n ** 2}")

# 场景：打开资源，成功才使用
try:                               # 尝试执行以下代码块
    conn = connect_db()
except ConnectionError:            # 捕获 ConnectionError
    print("连接失败")
else:                              # 连接成功才查询
    result = conn.query("SELECT ...")
    conn.close()
\`\`\`

## 二、finally 子句：无论如何都执行

\`finally\` 块**无论 try 块有没有抛异常、except 有没有捕获到、有没有 return，都会执行**。它是最可靠的"清理"机制。

\`\`\`python
try:                               # 尝试执行以下代码块
    f = open("data.txt", encoding="utf-8")
    data = f.read()
finally:                           # 无论是否异常都执行
    f.close()   # 不管有没有异常，都关闭文件
\`\`\`

### 2.1 finally 的执行时机

\`finally\` 在以下所有情况都会执行：

1. \`try\` 块正常完成，没异常 → 执行 \`finally\`。
2. \`try\` 块抛异常，被 \`except\` 捕获 → 执行 \`except\` → 执行 \`finally\`。
3. \`try\` 块抛异常，没有 \`except\` 捕获 → 执行 \`finally\` → 异常继续向上抛。
4. \`try\` 块里有 \`return\` → 先执行 \`finally\` 再 return。
5. \`except\` 块里有 \`return\` → 先执行 \`finally\` 再 return。
6. \`try\` / \`except\` 块里有 \`break\` / \`continue\` → 先执行 \`finally\`。

### 2.2 finally 的典型用途

\`\`\`python
# 释放资源
try:                               # 尝试执行以下代码块
    conn = connect()
    result = conn.query()
finally:                           # 无论是否异常都执行
    conn.close()

# 释放锁
try:                               # 尝试执行以下代码块
    lock.acquire()
    do_work()
finally:                           # 无论是否异常都执行
    lock.release()

# 恢复状态
old = set_mode("debug")
try:                               # 尝试执行以下代码块
    do_debug_work()
finally:                           # 无论是否异常都执行
    set_mode(old)   # 恢复原模式
\`\`\`

### 2.3 finally 与 return 的微妙交互

\`finally\` 里如果有 \`return\`，会**覆盖** try/except 里的 \`return\` 和异常：

\`\`\`python
def tricky():                      # 定义函数 tricky
    try:                           # 尝试执行以下代码块
        return "try 的返回值"
    finally:                       # 无论是否异常都执行
        return "finally 的返回值"   # 会覆盖 try 的 return！

print(tricky())  # "finally 的返回值"
\`\`\`

更危险的是：\`finally\` 里的 \`return\` 会**吞掉异常**：

\`\`\`python
def swallow_exception():          # 定义函数 swallow_exception
    try:                           # 尝试执行以下代码块
        raise ValueError("重要错误")
    finally:                       # 无论是否异常都执行
        return "正常返回"  # 吞掉了 ValueError！

print(swallow_exception())  # "正常返回"，异常没了
\`\`\`

> **强烈建议**：**永远不要在 \`finally\` 里写 \`return\` 或 \`raise\`**。它只应该做清理（close、release），不要做控制流。

## 三、完整的执行顺序

\`\`\`python
try:                               # 尝试执行以下代码块
    print("1. try 块执行")
    risky()
except SomeError as e:             # 捕获 SomeError
    print("2. except 执行")
else:                              # 否则
    print("3. else 执行")
finally:                           # 无论是否异常都执行
    print("4. finally 执行")
\`\`\`

执行流程：

| 情况 | 执行顺序 |
| --- | --- |
| try 没异常 | try → else → finally |
| try 抛异常，被 except 捕获 | try → except → finally |
| try 抛异常，没被捕获 | try → finally →（异常继续传） |

### 3.1 完整示例

\`\`\`python
def demo(error_type=None):         # 定义函数 demo
    print("  开始")
    try:                           # 尝试执行以下代码块
        print("  try 块")
        if error_type == "value":
            raise ValueError("值错误")
        elif error_type == "type":
            raise TypeError("类型错误")
        print("  try 块结束")
    except ValueError as e:        # 捕获 ValueError
        print(f"  except ValueError: {e}")
    except TypeError as e:         # 捕获 TypeError
        print(f"  except TypeError: {e}")
    else:                          # 否则
        print("  else 块（try 没异常）")
    finally:                       # 无论是否异常都执行
        print("  finally 块")
    print("  结束\\n")

print("=== 情况 1：没有异常 ===")
demo()                             # 调用 demo

print("=== 情况 2：ValueError 被捕获 ===")
demo("value")                      # 调用 demo

print("=== 情况 3：TypeError 被捕获 ===")
demo("type")                       # 调用 demo

print("=== 情况 4：未捕获的异常 ===")
try:                               # 尝试执行以下代码块
    demo("key")  # KeyError 没有对应的 except
except KeyError as e:              # 捕获 KeyError
    print(f"  外层捕获: {e}")
\`\`\`

## 四、else 和 finally 的协作

\`else\` 和 \`finally\` 经常配合使用，实现"成功用结果，无论如何都清理"：

\`\`\`python
def read_file(path):               # 定义函数 read_file
    f = open(path, encoding="utf-8")
    try:                           # 尝试执行以下代码块
        # 这里不再有 open，所以 read 的异常不会被误捕获
        pass
    finally:                       # 无论是否异常都执行
        # 但我们要在 else 里用 f，不能在这里关
        pass
    # 上面这个写法不对，f 没在 try 里用

# 正确写法
def read_file(path):               # 定义函数 read_file
    f = open(path, encoding="utf-8")
    try:                           # 尝试执行以下代码块
        data = f.read()            # 可能抛异常的读取
    except SomeReadError:          # 捕获 SomeReadError
        pass  # 处理读取错误
    else:                          # 否则
        return data                # 成功才返回
    finally:                       # 无论是否异常都执行
        f.close()                  # 无论如何都关闭
\`\`\`

## 五、现代替代：with 语句

对于"获取资源 → 使用 → 释放"的经典模式，Python 推荐用 \`with\` 语句代替 \`try/finally\`：

\`\`\`python
# 传统写法
f = open("data.txt", encoding="utf-8")
try:                               # 尝试执行以下代码块
    data = f.read()
finally:                           # 无论是否异常都执行
    f.close()

# 现代写法（推荐）
with open("data.txt", encoding="utf-8") as f:  # 使用上下文管理器
    data = f.read()
# 离开 with 块自动关闭
\`\`\`

\`with\` 更简洁，且保证资源释放。但 \`finally\` 仍适用于：

- 资源不是上下文管理器（没实现 \`__enter__\` / \`__exit__\`）。
- 需要恢复全局状态。
- 多步骤的复杂清理逻辑。

## 六、本章小结

- \`else\` 在 \`try\` 没抛异常时执行，用于"使用结果"，避免误捕获。
- \`finally\` 无论如何都执行，用于"清理资源"，是最可靠的清理机制。
- 执行顺序：没异常时 try → else → finally；有异常时 try → except → finally。
- **永远不要在 \`finally\` 里写 \`return\` 或 \`raise\`**，它会吞掉异常或覆盖返回值。
- 现代 Python 用 \`with\` 代替 \`try/finally\` 管理资源，更简洁安全。

下一章深入讲解捕获异常时的细节和常见陷阱。
`,
    code: `# ============================================================
# 第五章演示：else 与 finally
# ============================================================
import io

print("=" * 60)
print("第 1 部分：else 块——没异常时才执行")
print("=" * 60)

def parse_int(s):
    try:
        n = int(s)
    except ValueError as e:
        print(f"    except: {e}")
        return None
    else:
        # 只有 try 没抛异常时才执行
        print(f"    else: 成功解析为 {n}")
        print(f"    else: 平方是 {n ** 2}")
        return n

print("  parse_int('42'):")
parse_int("42")

print("  parse_int('abc'):")
parse_int("abc")

print()
print("=" * 60)
print("第 2 部分：finally 块——无论如何都执行")
print("=" * 60)

def demo_finally(label, action):
    print(f"  --- {label} ---")
    try:
        print("    try: 开始")
        action()
        print("    try: 正常结束")
    except ValueError as e:
        print(f"    except: 捕获 {e}")
    else:
        print("    else: 没有异常")
    finally:
        print("    finally: 无论如何都执行")
    print()

demo_finally("无异常", lambda: print("    action: 正常执行"))
demo_finally("ValueError", lambda: (_ for _ in ()).throw(ValueError("故意抛的")))

print()
print("=" * 60)
print("第 3 部分：finally 在 return 后也执行")
print("=" * 60)

def with_return():
    try:
        print("    try: 准备 return")
        return "try 的返回值"
    finally:
        print("    finally: return 前执行")

print("  调用 with_return():")
result = with_return()
print(f"  返回值: {result}")

print()
print("=" * 60)
print("第 4 部分：finally 里 return 会覆盖（反面教材）")
print("=" * 60)

def bad_finally_return():
    try:
        return "try 的值"
    finally:
        return "finally 的值"  # 覆盖了 try 的 return

print(f"  bad_finally_return() = {bad_finally_return()}")

def bad_finally_swallow():
    try:
        raise ValueError("重要错误")
    finally:
        return "吞掉异常"  # 异常被吞了！

print(f"  bad_finally_swallow() = {bad_finally_swallow()}")
print("  注意：ValueError 被吞掉了，调用方完全不知道出过错")

print()
print("=" * 60)
print("第 5 部分：完整执行顺序演示")
print("=" * 60)

def full_flow(error_type=None):
    print(f"  === 测试 {error_type or '无异常'} ===")
    try:
        print("    1. try 块开始")
        if error_type == "value":
            raise ValueError("值错误")
        elif error_type == "type":
            raise TypeError("类型错误")
        elif error_type == "key":
            raise KeyError("键错误")
        print("    2. try 块正常结束")
    except ValueError as e:
        print(f"    3a. except ValueError: {e}")
    except TypeError as e:
        print(f"    3b. except TypeError: {e}")
    else:
        print("    3c. else 块（try 无异常）")
    finally:
        print("    4. finally 块")
    print("    5. 函数结束")
    print()

full_flow(None)
full_flow("value")
full_flow("type")

print("  === 测试未捕获的 KeyError ===")
try:
    full_flow("key")
except KeyError as e:
    print(f"  外层捕获到: {e}")

print()
print("=" * 60)
print("第 6 部分：else 避免误捕获——对比")
print("=" * 60)

# 用 StringIO 模拟文件读取
def read_config_bad(config_text):
    """不好的写法：try 块太大"""
    try:
        import json
        f = io.StringIO(config_text)  # 模拟打开
        data = json.load(f)           # 如果这里抛 JSONDecodeError
        f.close()
        return data
    except Exception as e:           # 会捕获 open 和 load 的所有错误
        print(f"    [bad] 捕获到: {type(e).__name__}: {e}")
        return None

def read_config_good(config_text):
    """好的写法：try 块小，用 else"""
    import json
    try:
        f = io.StringIO(config_text)  # 只包住可能出错的打开
    except Exception as e:
        print(f"    [good] 打开失败: {e}")
        return None
    else:
        # load 的异常不会被上面的 except 捕获
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"    [good] JSON 解析失败: {e}")
            return None
        finally:
            f.close()
        return data

print("  坏写法，无效 JSON:")
read_config_bad('{"name": oops}')

print("  好写法，无效 JSON:")
read_config_good('{"name": oops}')

print()
print("=" * 60)
print("第 7 部分：finally 做资源清理")
print("=" * 60)

class FakeConnection:
    """模拟数据库连接"""
    def __init__(self, name):
        self.name = name
        self.closed = False
    def query(self, sql):
        if self.closed:
            raise RuntimeError("连接已关闭")
        return f"[{self.name}] 执行: {sql}"
    def close(self):
        self.closed = True
        print(f"    [连接 {self.name}] 已关闭")

def fetch_with_finally(conn, sql, fail=False):
    try:
        print(f"    执行查询: {sql}")
        if fail:
            raise RuntimeError("查询中途出错")
        return conn.query(sql)
    finally:
        conn.close()  # 无论是否异常都关闭

conn1 = FakeConnection("DB-1")
print("  正常查询:")
result = fetch_with_finally(conn1, "SELECT 1")
print(f"  结果: {result}")

conn2 = FakeConnection("DB-2")
print("  查询出错:")
try:
    fetch_with_finally(conn2, "SELECT 1", fail=True)
except RuntimeError as e:
    print(f"  外层捕获: {e}")

print()
print("=" * 60)
print("第 8 部分：with 语句代替 try/finally")
print("=" * 60)

# with 自动管理资源，比 try/finally 更简洁
print("  用 StringIO 模拟 with open:")
with io.StringIO("hello\\nworld") as f:
    content = f.read()
    print(f"    读取内容: {repr(content)}")
# 离开 with 块后 f 自动关闭（StringIO 的 close 被调用）

print()
print("全部演示完成。")
`,
  },

  // =========================================================
  // 第六章：捕获细节与陷阱
  // =========================================================
  {
    id: "pyex-except-details",
    group: "捕获与处理",
    icon: "🕳️",
    title: "捕获细节与陷阱",
    content: `# 捕获细节与陷阱

本章深入讲解 \`try/except\` 使用中容易踩的坑：裸 \`except\` 的危害、\`except: pass\` 反模式、异常被意外吞掉、\`except\` 里 \`return\` 的陷阱、循环中的异常处理等。掌握这些细节，你的异常处理代码才算"工业级"。

## 一、裸 except 的三宗罪

\`\`\`python
# 最危险的写法
try:                               # 尝试执行以下代码块
    do_something()
except:                            # 不写异常类型
    pass
\`\`\`

裸 \`except\` 等价于 \`except BaseException\`，会捕获**所有**异常，包括：

1. **KeyboardInterrupt**：用户按 Ctrl+C 想中断程序，被吞掉了，程序"卡死"无法停止。
2. **SystemExit**：\`sys.exit()\` 失效，程序退不出。
3. **GeneratorExit**：生成器关闭异常被吞。
4. **MemoryError**：内存耗尽也被吞，程序继续在错误状态运行。

\`\`\`python
# 危险：Ctrl+C 被吞掉
try:                               # 尝试执行以下代码块
    while True:
        pass  # 死循环
except:                            # 用户按 Ctrl+C 会被这里捕获
    pass                           # 程序继续死循环！
\`\`\`

**正确做法**：

\`\`\`python
# 用 except Exception，不捕获系统级退出异常
try:                               # 尝试执行以下代码块
    while True:
        pass
except Exception:                  # KeyboardInterrupt 不是 Exception 子类
    pass                           # Ctrl+C 能正常中断
except KeyboardInterrupt:          # 如果确实需要捕获 Ctrl+C
    print("用户中断")
    sys.exit(0)
\`\`\`

## 二、except: pass 反模式

\`\`\`python
# 反模式：吞掉所有错误
try:                               # 尝试执行以下代码块
    important_operation()
except Exception:
    pass  # 错误被完全忽略
\`\`\`

这会让程序在"错误状态"下继续运行，产生难以追踪的 bug。**异常处理的基本原则是：要么处理它，要么让它传播，不要假装没发生。**

### 2.1 至少要记录日志

\`\`\`python
import logging                      # 导入 logging 模块

try:                               # 尝试执行以下代码块
    important_operation()
except Exception as e:
    logging.exception("操作失败")   # 记录完整 traceback
    # 或者至少 print
    # print(f"操作失败: {e}", file=sys.stderr)
\`\`\`

### 2.2 什么时候可以"忽略"异常

只有在**明确知道为什么出错、且确实可以安全忽略**时，才能"吞掉"：

\`\`\`python
# 合理：删除可能不存在的临时文件
import os                           # 导入 os 模块
try:                               # 尝试执行以下代码块
    os.remove("/tmp/cache.txt")
except FileNotFoundError:          # 文件不存在，本来就是目的
    pass  # 这是合理的，文件已经不在了
# 其他 OSError（权限不足等）不应该被忽略
\`\`\`

但更好的写法是用 \`contextlib.suppress\`：

\`\`\`python
from contextlib import suppress    # 从 contextlib 导入 suppress
import os                           # 导入 os 模块

with suppress(FileNotFoundError):  # 只抑制 FileNotFoundError
    os.remove("/tmp/cache.txt")
\`\`\`

\`suppress\` 明确表达了"只忽略这一种异常"的意图，比 \`try/except: pass\` 更清晰。

## 三、except 里 return 的陷阱

在 \`except\` 块里 \`return\`，会让异常"消失"：

\`\`\`python
def bad_example():                  # 定义函数 bad_example
    try:                           # 尝试执行以下代码块
        risky_operation()
    except SomeError:
        return None  # 异常被"处理"成 None，调用方不知道出过错
    return result

def caller():                       # 定义函数 caller
    result = bad_example()
    if result is None:
        # 是正常返回的 None，还是出错了？无法区分！
        do_something()
\`\`\`

这导致调用方无法区分"正常返回 None"和"出错返回 None"。

### 3.1 更好的做法

\`\`\`python
# 方案 1：让异常传播，调用方自己 try
def operation():                    # 定义函数 operation
    return risky_operation()       # 不 try，让异常传给调用方

# 方案 2：返回一个明确的状态
def operation():                    # 定义函数 operation
    try:                           # 尝试执行以下代码块
        return ("ok", risky_operation())
    except SomeError as e:
        return ("error", str(e))

# 方案 3：转换成更语义化的异常
class OperationError(Exception):   # 定义类 OperationError
    pass

def operation():                    # 定义函数 operation
    try:                           # 尝试执行以下代码块
        return risky_operation()
    except SomeError as e:
        raise OperationError("操作失败") from e
\`\`\`

## 四、循环中的异常处理

### 4.1 一个错误不应该中断整个循环

处理一批数据时，一个元素出错不应该让整个循环崩溃：

\`\`\`python
results = []                        # 创建空列表
for item in data:                   # 遍历 data
    try:                           # 尝试执行以下代码块
        result = process(item)
        results.append(result)
    except ValueError as e:
        print(f"跳过 {item}: {e}")  # 记录并继续
        continue
\`\`\`

### 4.2 不要在循环外 try

\`\`\`python
# 不好：一个错误中断整个循环
try:                               # 尝试执行以下代码块
    for item in data:               # 遍历 data
        result = process(item)      # 第一个出错就跳出整个循环
        results.append(result)
except ValueError:
    print("处理中断")               # 剩下的数据都没处理
\`\`\`

## 五、异常的 args 属性

异常对象的 \`args\` 属性存储了构造异常时传入的参数：

\`\`\`python
try:                               # 尝试执行以下代码块
    raise ValueError("消息1", "消息2", 123)
except ValueError as e:
    print(e.args)   # ('消息1', '消息2', 123)
    print(e)        # ('消息1', '消息2', 123)  多参数时返回元组
    print(e.args[0])  # '消息1'
\`\`\`

单参数时 \`str(e)\` 返回字符串，多参数时返回元组的字符串表示。自定义异常经常扩展这个机制来携带更多数据。

## 六、捕获后重新抛出

在 \`except\` 里用 \`raise\`（不带参数）可以把当前异常重新抛出，常用于"记录日志后让上层处理"：

\`\`\`python
try:                               # 尝试执行以下代码块
    risky()
except Exception as e:
    log_error(e)                   # 先记录
    raise                          # 再重新抛出，让上层处理
\`\`\`

\`raise\` 不带参数时，抛出的是**当前正在处理的异常**，保留原始 traceback。注意区分：

- \`raise\`：重新抛出当前异常，保留 traceback。
- \`raise e\`：也抛出当前异常，但在某些版本会**重置 traceback**（指向当前行）。
- \`raise SomeError(...) from e\`：抛出新异常，建立异常链。

**推荐用裸 \`raise\`**，它最简洁且保留原始信息。

## 七、不要捕获你不打算处理的异常

\`\`\`python
# 不好：捕获了但什么都没做
try:                               # 尝试执行以下代码块
    data = json.loads(text)
except (JSONDecodeError, KeyError, TypeError, ValueError):
    pass  # 到底处理了哪种？都没处理
\`\`\`

如果你不确定该捕获什么，就**不要捕获**，让异常传到上层（可能有更合适的处理者）。或者捕获后重新抛出：

\`\`\`python
try:                               # 尝试执行以下代码块
    data = json.loads(text)
except Exception as e:
    log_error(e)                   # 记录一下
    raise                          # 重新抛出，不假装处理了
\`\`\`

## 八、BaseException 的子类

下面这些异常继承自 \`BaseException\` 而不是 \`Exception\`，\`except Exception\` 捕获不到：

| 异常 | 触发 |
| --- | --- |
| \`KeyboardInterrupt\` | Ctrl+C |
| \`SystemExit\` | sys.exit() |
| \`GeneratorExit\` | 生成器 .close() |
| \`StopIteration\` | 迭代器耗尽（特殊处理） |
| \`StopAsyncIteration\` | 异步迭代器耗尽 |

\`StopIteration\` 比较特殊——它继承自 \`Exception\`，但通常**不应该**被 except 捕获，它是 \`for\` 循环的内部机制。

\`\`\`python
# 不要捕获 StopIteration！
try:                               # 尝试执行以下代码块
    while True:
        item = next(iterator)
        process(item)
except StopIteration:              # 能用，但应该用 for
    pass

# 正确：用 for 循环
for item in iterator:               # 遍历 iterator
    process(item)
\`\`\`

## 九、本章小结

- **永远不要裸 \`except:\`**，用 \`except Exception:\` 或更具体的类型。
- **不要 \`except: pass\`**，至少记录日志；明确能忽略时用 \`contextlib.suppress\`。
- **不要在 \`except\` 里 \`return\`**，会让调用方无法区分"正常"和"出错"。
- **循环里 try 要在循环内**，一个错误不应中断整个循环。
- **重新抛出用裸 \`raise\`**，保留原始 traceback。
- **不确定就不要捕获**，让异常传给更合适的处理者。
- \`StopIteration\` / \`KeyboardInterrupt\` / \`SystemExit\` 是特殊异常，不要随意捕获。

下一章进入"抛出与自定义"组，学习如何主动 \`raise\` 异常。
`,
    code: `# ============================================================
# 第六章演示：捕获细节与陷阱
# ============================================================
import sys
import os
import json
import io
import logging
from contextlib import suppress

print("=" * 60)
print("第 1 部分：裸 except 的危害（用对比演示）")
print("=" * 60)

# 演示 except Exception 和裸 except 的区别
print("  KeyboardInterrupt 是 Exception 子类吗:",
      issubclass(KeyboardInterrupt, Exception))
print("  SystemExit 是 Exception 子类吗:",
      issubclass(SystemExit, Exception))
print("  -> except Exception 不会捕获 Ctrl+C 和 sys.exit()")
print("  -> 裸 except 会捕获，导致程序无法正常中断/退出")

# 模拟：用 except Exception 捕获普通异常
try:
    raise ValueError("普通异常")
except Exception as e:
    print(f"  except Exception 捕获: {e}")

print()
print("=" * 60)
print("第 2 部分：except: pass 反模式 vs 正确做法")
print("=" * 60)

# 反模式
print("  反模式：吞掉错误")
try:
    int("不是数字")
except Exception:
    pass  # 什么都没做，错误消失了
print("    -> 错误被吞掉，程序继续在错误状态运行")

# 正确：记录日志
print("  正确：至少记录日志")
try:
    int("不是数字")
except ValueError as e:
    print(f"    -> 记录错误: {e}")

# 合理忽略：删除可能不存在的文件
print("  合理忽略：删除可能不存在的临时文件")
try:
    os.remove("/tmp/这个文件应该不存在_xxx.txt")
except FileNotFoundError:
    print("    -> 文件本来就不存在，符合预期")

print()
print("=" * 60)
print("第 3 部分：contextlib.suppress 优雅地忽略")
print("=" * 60)

# 用 suppress 只忽略特定异常
print("  用 suppress 忽略 FileNotFoundError:")
with suppress(FileNotFoundError):
    os.remove("/tmp/另一个不存在的文件.txt")
    print("    -> 删除成功（不会执行，因为文件不存在）")
print("    -> suppress 后继续运行，无需 try/except")

print("  suppress 只忽略指定类型，其他异常仍会抛出:")
try:
    with suppress(FileNotFoundError):
        1 / 0  # ZeroDivisionError 不在 suppress 范围
except ZeroDivisionError as e:
    print(f"    -> 捕获到 ZeroDivisionError: {e}")

print()
print("=" * 60)
print("第 4 部分：except 里 return 的陷阱")
print("=" * 60)

def bad_operation(x):
    """不好的写法：except 里 return"""
    try:
        return 100 / x
    except ZeroDivisionError:
        return None  # 调用方无法区分"正常返回 None"还是"出错"

def good_operation(x):
    """好的写法：让异常传播或转换"""
    try:
        return 100 / x
    except ZeroDivisionError as e:
        raise ValueError("x 不能为 0") from e

print("  bad_operation(5) =", bad_operation(5))
print("  bad_operation(0) =", bad_operation(0))
print("    -> 0 和 None 都返回，无法区分")

print("  good_operation(0):")
try:
    good_operation(0)
except ValueError as e:
    print(f"    -> 明确的异常: {e}")

print()
print("=" * 60)
print("第 5 部分：循环中的异常处理")
print("=" * 60)

data = ["10", "20", "abc", "30", "xyz", "40"]

# 不好：循环外 try，一个错误中断全部
print("  反模式：循环外 try")
try:
    results = []
    for item in data:
        results.append(int(item))
except ValueError as e:
    print(f"    第 3 个就出错了，后面的都没处理: {e}")
    print(f"    只处理了: {results}")

# 好：循环内 try，跳过出错的继续
print("  正确：循环内 try")
results = []
errors = []
for item in data:
    try:
        results.append(int(item))
    except ValueError as e:
        errors.append((item, str(e)))
        continue

print(f"    成功: {results}")
print(f"    失败: {errors}")

print()
print("=" * 60)
print("第 6 部分：异常的 args 属性")
print("=" * 60)

# 单参数
try:
    raise ValueError("单条消息")
except ValueError as e:
    print(f"  单参数: args={e.args}, str(e)='{e}'")

# 多参数
try:
    raise ValueError("消息1", "消息2", 123)
except ValueError as e:
    print(f"  多参数: args={e.args}, str(e)='{e}'")
    print(f"  args[0]={e.args[0]}, args[2]={e.args[2]}")

# 无参数
try:
    raise ValueError
except ValueError as e:
    print(f"  无参数: args={e.args}, str(e)='{e}'")

print()
print("=" * 60)
print("第 7 部分：重新抛出 raise（保留 traceback）")
print("=" * 60)

def inner():
    raise ValueError("来自最底层的错误")

def middle():
    try:
        inner()
    except ValueError as e:
        print("    middle: 记录日志后重新抛出")
        raise  # 裸 raise，保留原始 traceback

def outer():
    try:
        middle()
    except ValueError as e:
        print(f"    outer: 捕获到 {e}")

print("  演示裸 raise 重新抛出:")
outer()

print()
print("=" * 60)
print("第 8 部分：StopIteration 不应被捕获")
print("=" * 60)

# 反面教材：手动 next + 捕获 StopIteration
print("  反模式：手动 next + except StopIteration")
iterator = iter([1, 2, 3])
collected = []
while True:
    try:
        collected.append(next(iterator))
    except StopIteration:
        break
print(f"    结果: {collected}")

# 正确：用 for 循环
print("  正确：用 for 循环（内部处理 StopIteration）")
collected = []
for item in [1, 2, 3]:               # 遍历列表
    collected.append(item)
print(f"    结果: {collected}")

print()
print("=" * 60)
print("第 9 部分：综合示例——健壮的数据处理管道")
print("=" * 60)

def process_batch(records):
    """处理一批记录，跳过出错的，返回成功和失败统计"""
    success = []
    failures = []

    for i, record in enumerate(records, 1):
        try:
            # 模拟处理：可能出多种错误
            if record is None:
                raise ValueError("记录为空")
            if isinstance(record, str):
                raise TypeError(f"记录是字符串，期望字典: {record}")
            result = {"id": record["id"], "value": record["value"] * 2}
            success.append(result)
        except (ValueError, TypeError, KeyError) as e:
            # 捕获已知的、可以跳过的错误
            failures.append({"record": record, "error": str(e), "index": i})
            continue
        # 其他异常（如 MemoryError）不捕获，向上传播

    return {"success": success, "failures": failures, "total": len(records)}

# 测试数据
records = [
    {"id": 1, "value": 10},
    None,                           # ValueError
    "bad string",                   # TypeError
    {"id": 2, "value": 20},
    {"id": 3},                      # KeyError: 缺 value
    {"id": 4, "value": 30},
]

result = process_batch(records)
print(f"  总数: {result['total']}")
print(f"  成功: {len(result['success'])} 条")
for s in result["success"]:
    print(f"    {s}")
print(f"  失败: {len(result['failures'])} 条")
for f in result["failures"]:
    print(f"    第 {f['index']} 条: {f['error']}")

print()
print("全部演示完成。")
`,
  },
];
