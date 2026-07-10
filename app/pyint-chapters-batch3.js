// =============================================================
// Python 原理图解教程（pyint）—— 第三批章节
// 函数与作用域 + 迭代器与生成器（共 5 章）
// -------------------------------------------------------------
// 本批包含以下章节：
//   1. pyint-frame    — 函数调用的栈帧机制（函数与作用域）
//   2. pyint-closure  — 闭包原理揭秘（函数与作用域）
//   3. pyint-legb     — LEGB 作用域查找规则（函数与作用域）
//   4. pyint-iterator — 迭代器协议与 for 循环本质（迭代器与生成器）
//   5. pyint-generator — 生成器：会暂停的函数（迭代器与生成器）
//
// 代码运行环境约束：
//   - 用 python3 直接运行，10 秒超时
//   - 仅使用 Python 标准库（dis, sys, inspect, types, gc 等）
//   - 通过 print 输出结果
//   - 代码必须是单文件可独立运行的脚本
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：函数调用的栈帧机制
  // =========================================================
  {
    id: "pyint-frame",
    group: "函数与作用域",
    icon: "🪟",
    title: "函数调用的栈帧机制",
    content: `## 函数调用的栈帧机制

每次你调用一个 Python 函数，解释器都会在内存里创建一个**栈帧（Frame）**对象，用来保存这次调用的所有上下文信息。理解栈帧，能解释你日常开发中遇到的很多现象：为什么递归会爆栈、为什么局部变量函数外访问不到、为什么异常能打印出调用链、为什么闭包能"记住"外层变量。

### 什么是栈帧

**栈帧（Frame）** 是函数调用的运行时容器。每发生一次函数调用，Python 就创建一个栈帧，函数返回时这个栈帧被销毁（或保留供调试用）。栈帧里存放着这次调用的一切：

| 栈帧属性 | 含义 | 示例 |
| --- | --- | --- |
| \`f_locals\` | 当前帧的局部变量字典 | 函数内定义的变量 |
| \`f_globals\` | 当前帧所在模块的全局变量 | 模块级变量 |
| \`f_builtins\` | 内建命名空间 | \`print\`, \`len\` 等 |
| \`f_code\` | 当前帧执行的字节码对象 | 函数的 code object |
| \`f_lasti\` | 上一条执行的字节码偏移量 | 整数索引 |
| \`f_lineno\` | 当前执行到的源码行号 | 报错时的行号 |
| \`f_back\` | 上一个栈帧（调用者） | 形成调用链 |
| \`f_trace\` | 调试器钩子 | pdb 用它实现断点 |

### 调用栈：函数嵌套形成栈

函数 A 调用 B，B 调用 C，就形成了一条调用栈：

\`\`\`
调用栈（栈顶在右，后进先出）：

   模块顶层
       │
       ▼
     func_a()     ← 栈帧 A（f_back 指向模块帧）
       │
       ▼
     func_b()     ← 栈帧 B（f_back 指向 A）
       │
       ▼
     func_c()     ← 栈帧 C（f_back 指向 B）← 当前执行
\`\`\`

栈帧之间用 \`f_back\` 指针相连，从当前帧一路往上回溯，就能拿到完整的调用链。这就是异常 traceback 和调试器"调用栈"功能的底层来源。

### 函数调用发生了什么

当你写下：

\`\`\`python
def add(a, b):
    return a + b

result = add(3, 5)
\`\`\`

调用 \`add(3, 5)\` 时，CPython 大致经历这些步骤：

1. 创建一个新的栈帧 \`frame\`
2. 把参数 \`a=3\`, \`b=5\` 放进 \`frame.f_locals\`
3. 把 \`frame.f_back\` 指向调用者的栈帧
4. 把 \`frame.f_code\` 指向 \`add\` 函数的字节码
5. 切换到这个新栈帧，开始执行字节码
6. 执行到 \`RETURN_VALUE\` 时，弹出栈顶值作为返回值
7. 销毁（或保留）这个栈帧，回到调用者

### 用 sys._getframe() 查看当前栈帧

Python 标准库提供了访问当前栈帧的接口：

\`\`\`python
import sys

def show_frame():
    frame = sys._getframe()       # 获取当前栈帧
    print(frame.f_lineno)          # 当前行号
    print(frame.f_locals)          # 局部变量
    print(frame.f_back)            # 调用者的栈帧
    print(frame.f_code.co_name)    # 当前函数名
\`\`\`

\`sys._getframe(depth=0)\` 的 \`depth\` 参数表示从当前帧往上数多少层。0 是当前函数，1 是调用者，2 是调用者的调用者。

### 用 inspect.stack() 查看完整调用栈

\`inspect\` 模块封装了更友好的调用栈查看接口：

\`\`\`python
import inspect

def c():
    for frame_info in inspect.stack():
        print(frame_info.function, frame_info.lineno)

def b():
    c()
def a():
    b()
a()
\`\`\`

\`inspect.stack()\` 返回一个列表，每个元素包含函数名、行号、源码上下文、栈帧对象等，从当前帧一直到模块顶层。

### 递归为什么有最大深度

每次函数调用都要创建栈帧，栈帧占内存。如果递归层数过多，栈会一直增长，最终可能撑爆 C 栈导致解释器崩溃。Python 默认限制递归深度为 1000：

\`\`\`python
import sys
print(sys.getrecursionlimit())     # 1000（默认）
sys.setrecursionlimit(2000)        # 可以调大，但有上限
\`\`\`

超过限制会抛出 \`RecursionError\`：

\`\`\`python
def recurse(n):
    return recurse(n + 1)
recurse(0)
# RecursionError: maximum recursion depth exceeded
\`\`\`

#### 为什么默认是 1000

CPython 的栈帧最终建立在 C 调用栈上（部分情况下），过深的递归会导致 C 栈溢出，进程直接崩溃（不是抛异常，是段错误）。1000 是一个保守的安全值，既能满足绝大多数合理递归，又留有足够余量避免 C 栈崩溃。

#### 不建议把上限设得太大

\`\`\`python
sys.setrecursionlimit(100000)      # 危险！
\`\`\`

调到 10 万可能导致 C 栈溢出，整个进程直接崩。如果真的需要深度递归，应该考虑改写成迭代或用生成器。

### 递归 vs 迭代的性能对比

递归写法简洁但慢，迭代写法直观但快。原因在于每次递归调用都要创建栈帧、压栈、出栈，开销不小。

\`\`\`
计算斐波那契 fib(30)：
  递归（无记忆化）:  0.5s   左右
  迭代:              0.00001s 左右
\`\`\`

不仅慢，递归版本还会因为重复计算子问题导致复杂度爆炸（指数级）。日常能用迭代就用迭代，递归只在树形结构、分治算法等场景才显得更自然。

### 尾递归优化为什么 Python 没有

**尾递归（Tail Call）** 指函数最后一步是"调用自己并直接返回"：

\`\`\`python
def fact(n, acc=1):
    if n == 0:
        return acc
    return fact(n - 1, acc * n)   # 这是尾递归
\`\`\`

理论上尾递归可以优化成循环（复用同一个栈帧），但 **CPython 没有实现尾递归优化**。原因：

1. Python 的语言特性（异常 traceback、调试器）依赖完整的调用栈，尾调用优化会破坏这条链
2. Python 之父 Guido 明确反对：保持语言简单，需要循环就用 \`while\`/\`for\`
3. 实现尾递归优化会让字节码执行循环变复杂，影响整体性能

所以上面的 \`fact\` 依然会受 1000 的递归深度限制。

### 栈帧的生命周期

| 阶段 | 发生什么 |
| --- | --- |
| 函数被调用 | 创建栈帧，压入调用栈 |
| 函数执行中 | 栈帧存活，保存局部变量 |
| 函数返回 / 抛异常 | 栈帧从调用栈弹出 |
| 栈帧弹出后 | 通常被垃圾回收；但若被外部引用（如 inspect、traceback），会保留 |

异常 traceback 能保留调用栈信息，正是因为异常对象内部引用了当时的栈帧（或者帧的快照）。

### 栈帧与局部变量

局部变量就是栈帧 \`f_locals\` 字典里的键值对（CPython 实际用数组存储优化，但对外暴露为字典）：

\`\`\`python
def demo():
    x = 10
    y = 20
    z = x + y
    frame = sys._getframe()
    print(frame.f_locals)
    # {'x': 10, 'y': 20, 'z': 30, 'frame': <frame>}
\`\`\`

这也解释了为什么函数内的变量在函数外访问不到——它们存在函数自己的栈帧里，函数返回栈帧就没了。

### 调试器是怎么实现的

调试器（pdb、IDE 的断点调试）本质上就是在栈帧上挂钩子：

- **断点**：在指定行号设置标志，字节码执行前检查
- **单步执行**：每次执行一条字节码就暂停
- **查看变量**：读取 \`frame.f_locals\`
- **修改变量**：写入 \`frame.f_locals\`
- **调用栈窗口**：从当前帧 \`f_back\` 一路回溯

钩子通过 \`frame.f_trace\` 实现——它是一个回调函数，每执行一行字节码就会被调用一次。

### 异常 traceback 的来源

当异常发生时，Python 把当前调用栈的快照塞进异常对象：

\`\`\`python
try:
    def f(): 1/0
    f()
except ZeroDivisionError:
    import traceback
    traceback.print_exc()
\`\`\`

输出：

\`\`\`
Traceback (most recent call last):
  File "<stdin>", line 2, in <module>
  File "<stdin>", line 2, in f
ZeroDivisionError: division by zero
\`\`\`

每一行对应一个栈帧，从模块顶层一直到出错位置。

### 性能：函数调用的开销

函数调用不是免费的：

| 操作 | 大约耗时（ns） |
| --- | --- |
| 简单加法 \`a + b\` | 30 |
| 函数调用 \`add(a, b)\` | 100 |
| 递归调用（再 +栈帧） | 150 |
| 内联（同样代码不调用函数） | 30 |

这就是为什么 Python 的内置函数（\`sum\`、\`max\`、\`map\`）通常比手写循环快——它们在 C 里执行，没有 Python 层的栈帧开销。

### 日常开发启示

理解栈帧机制能帮你：

1. **看懂异常 traceback**：每一行就是一个栈帧，从下往上看是调用链
2. **调试时查看调用栈**：IDE 调试器的"调用栈"窗口就是 \`f_back\` 链
3. **避免过深递归**：递归深度超过 1000 会爆栈，能改成迭代就改
4. **理解闭包原理**：闭包能记住外层变量，本质是栈帧的 \`__closure__\` 引用
5. **理解作用域**：变量查找走的是栈帧的 \`f_locals → f_globals → f_builtins\`
6. **写装饰器时**：用 \`functools.wraps\` 是为了保留原函数的元信息（\`__name__\`、\`__doc__\`），而非栈帧
7. **不要在生产代码里用 \`sys._getframe()\` 做业务逻辑**：它属于内部 API，性能差且可能在不同 Python 实现上行为不同

### 本节代码演示

下面这段代码用 \`sys._getframe()\` 和 \`inspect.stack()\` 探索栈帧的内部结构：查看栈帧属性、回溯调用链、演示递归深度、对比递归与迭代的性能。运行后你会对"函数调用到底发生了什么"有直观的理解。`,
    code: `# ============================================================
# 第一章代码演示：函数调用的栈帧机制
# ============================================================
# 本代码用 sys._getframe 和 inspect.stack 探索栈帧：
#   - 栈帧的属性（f_locals, f_back, f_code 等）
#   - 调用栈回溯
#   - 递归深度限制
#   - 递归 vs 迭代的性能对比

import sys
import inspect
import time

# ---- 1. 栈帧的基本属性 ----
print("========== 1. 栈帧的基本属性 ==========")

def demo_frame():
    x = 10                        # 局部变量
    y = 20                        # 局部变量
    z = x + y                     # 计算结果
    frame = sys._getframe()       # 获取当前栈帧
    print("当前函数名:", frame.f_code.co_name)
    print("当前行号:", frame.f_lineno)
    print("局部变量:", frame.f_locals)
    print("全局变量数量:", len(frame.f_globals))
    print("字节码对象:", frame.f_code)
    print("上一个栈帧（调用者）函数名:", frame.f_back.f_code.co_name)

print("调用 demo_frame() 之前")
demo_frame()                       # 调用，进入新栈帧
print("调用 demo_frame() 之后\\n")

# ---- 2. 调用栈回溯 ----
print("========== 2. 调用栈回溯 ==========")

def func_c():
    print("--- 当前调用栈（从当前帧到模块顶层）---")
    # 用 sys._getframe 一层一层往上回溯
    frame = sys._getframe()
    depth = 0
    while frame is not None:
        print(f"  [层 {depth}] 函数: {frame.f_code.co_name:<15} 行号: {frame.f_lineno}")
        frame = frame.f_back    # 指向调用者
        depth += 1

def func_b():
    func_c()                    # 调用 C

def func_a():
    func_b()                    # 调用 B

print("调用链: 模块 → func_a → func_b → func_c")
func_a()

# ---- 3. 用 inspect.stack() 查看调用栈（更友好）----
print("\\n========== 3. inspect.stack() 查看调用栈 ==========")

def inner():
    # inspect.stack() 返回 FrameInfo 列表
    stack = inspect.stack()
    print(f"调用栈深度: {len(stack)} 层")
    print(f"{'层级':<6} {'函数名':<15} {'行号':<8} {'文件'}")
    print("-" * 60)
    for i, frame_info in enumerate(stack):
        print(f"  {i:<4} {frame_info.function:<13} {frame_info.lineno:<8} {frame_info.filename.split('/')[-1]}")

def middle():
    inner()

def outer():
    middle()

outer()

# ---- 4. 递归深度限制 ----
print("\\n========== 4. 递归深度限制 ==========")
print(f"默认递归深度限制: {sys.getrecursionlimit()}")

# 演示递归层数
def count_depth(n=0):
    """递归计数，统计实际能到多少层"""
    return count_depth(n + 1)

try:
    count_depth()
except RecursionError:
    print("✓ 递归超过默认限制，触发 RecursionError")

# 测量实际能用的深度
def safe_recurse(depth):
    if depth <= 0:
        return depth
    return safe_recurse(depth - 1)

# 测试不同深度
for test_depth in [100, 500, 900]:
    try:
        safe_recurse(test_depth)
        print(f"  深度 {test_depth}: ✓ 成功")
    except RecursionError:
        print(f"  深度 {test_depth}: ✗ 失败")

# ---- 5. 递归 vs 迭代的性能对比 ----
print("\\n========== 5. 递归 vs 迭代 性能对比 ==========")

# 递归版斐波那契
def fib_recursive(n):
    """递归计算斐波那契数"""
    if n < 2:
        return n
    return fib_recursive(n - 1) + fib_recursive(n - 2)

# 迭代版斐波那契
def fib_iterative(n):
    """迭代计算斐波那契数"""
    if n < 2:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

# 小规模测试，验证正确性
print("正确性验证（小规模）:")
for n in [5, 10, 15]:
    r1 = fib_recursive(n)
    r2 = fib_iterative(n)
    print(f"  fib({n}) = 递归:{r1}, 迭代:{r2}, 一致: {r1 == r2}")

# 性能对比（用 fib(28) 比较合适，太大递归版太慢）
N = 28
print(f"\\n性能对比（计算 fib({N})）:")

start = time.perf_counter()
result_r = fib_recursive(N)
elapsed_r = time.perf_counter() - start
print(f"  递归:  fib({N}) = {result_r}, 耗时 {elapsed_r:.4f} 秒")

start = time.perf_counter()
result_i = fib_iterative(N)
elapsed_i = time.perf_counter() - start
print(f"  迭代:  fib({N}) = {result_i}, 耗时 {elapsed_i:.6f} 秒")

if elapsed_i > 0:
    print(f"  迭代比递归快约 {elapsed_r / elapsed_i:.0f} 倍")

# ---- 6. 栈帧与局部变量 ----
print("\\n========== 6. 栈帧与局部变量 ==========")

def locals_demo():
    """演示局部变量存储在栈帧的 f_locals 中"""
    name = "Python"
    age = 33
    score = 99.5
    frame = sys._getframe()
    print("函数 locals_demo 的局部变量:")
    for var_name, var_value in frame.f_locals.items():
        if var_name == "frame":
            continue    # 跳过 frame 自身
        print(f"  {var_name} = {var_value} (类型: {type(var_value).__name__})")

locals_demo()

# ---- 7. 尾递归 Python 不优化 ----
print("\\n========== 7. 尾递归不优化验证 ==========")

def tail_recurse(n):
    """尾递归形式：最后一步是返回自己"""
    if n <= 0:
        return n
    return tail_recurse(n - 1)    # 这是尾递归

print("尾递归 tail_recurse(n) 看似可以优化成循环，")
print("但 Python 不做尾递归优化，依然受递归深度限制。")
print("尝试 tail_recurse(2000)（超过默认 1000）:")
try:
    result = tail_recurse(2000)
    print(f"  成功: {result}")
except RecursionError:
    print("  ✗ 触发 RecursionError —— 证明 Python 没有尾递归优化")

# 等价循环版本
def loop_version(n):
    while n > 0:
        n -= 1
    return n

print(f"  等价的循环版本 loop_version(2000) = {loop_version(2000)} ✓")

# ---- 8. 异常 traceback 与调用栈 ----
print("\\n========== 8. 异常 traceback 与调用栈 ==========")

def level3():
    """最底层函数，主动抛出异常"""
    raise ValueError("故意抛出的异常")

def level2():
    level3()                   # 调用 level3

def level1():
    level2()                   # 调用 level2

try:
    level1()
except ValueError:
    print("捕获到异常，traceback 显示调用栈:")
    import traceback
    traceback_lines = traceback.format_exc().splitlines()
    for line in traceback_lines:
        print(f"  {line}")
    print("\\n解释: traceback 中每一行对应一个栈帧，")
    print("从模块顶层（line 1）一直到出错位置（level3）。")

# ---- 9. 栈帧数量与递归深度 ----
print("\\n========== 9. 递归过程中的栈帧数 ==========")

def count_frames_in_recursion(depth, max_depth):
    """递归过程中查看当前调用栈深度"""
    if depth >= max_depth:
        # 到达底层，统计调用栈深度
        stack = inspect.stack()
        return len(stack)
    return count_frames_in_recursion(depth + 1, max_depth)

# 递归 50 层时，调用栈应该多出约 50 层（加上原有的若干层）
base_depth = len(inspect.stack())
print(f"递归前调用栈深度: {base_depth}")
recursion_depth = 50
total_depth = count_frames_in_recursion(0, recursion_depth)
print(f"递归 {recursion_depth} 层时调用栈深度: {total_depth}")
print(f"差值: {total_depth - base_depth}（接近递归层数，证明每次调用都创建栈帧）")

# ---- 10. 总结：栈帧机制核心要点 ----
print("\\n========== 10. 栈帧机制核心要点 ==========")
print("""
栈帧机制要点总结:

1. 每次函数调用创建一个栈帧，包含:
   - 局部变量 (f_locals)
   - 字节码 (f_code)
   - 上一个栈帧指针 (f_back)
   - 当前行号 (f_lineno)

2. 调用栈由 f_back 指针串联，形成调用链

3. 函数返回时栈帧销毁，局部变量随之消失

4. 递归深度默认 1000，可调但需谨慎
   - sys.getrecursionlimit() 查询
   - sys.setrecursionlimit() 修改

5. Python 不做尾递归优化
   - 需要循环就用 while/for

6. 异常 traceback 来自调用栈快照
   - 每一层栈帧对应 traceback 中的一行

7. 调试器通过 frame.f_trace 钩子实现断点
   - 单步、查看变量、调用栈都基于栈帧

8. sys._getframe() 和 inspect.stack() 查看栈帧
   - 调试用，避免在生产逻辑中使用
""")

print("以上就是函数调用栈帧机制的核心知识！")
print("理解栈帧，你就理解了：")
print("  - 为什么局部变量函数外访问不到")
print("  - 为什么递归会爆栈")
print("  - 为什么异常能打印调用链")
print("  - 调试器是怎么工作的")
`,
  },

  // =========================================================
  // 第二章：闭包原理揭秘
  // =========================================================
  {
    id: "pyint-closure",
    group: "函数与作用域",
    icon: "🎁",
    title: "闭包原理揭秘",
    content: `## 闭包原理揭秘

闭包（Closure）是 Python 里一个被反复提及、却经常被误解的概念。一旦你理解了它，就会发现装饰器、回调函数、 functools.partial、事件处理器这些"高级"技巧都建立在同一个简单的机制上：**函数携带了它定义时引用的外层变量**。

### 什么是闭包

先看一段最简单的闭包代码：

\`\`\`python
def make_counter():
    count = 0          # 外层函数的局部变量
    def counter():
        nonlocal count
        count += 1     # 内层函数"引用"了外层的 count
        return count
    return counter     # 把内层函数返回出去

c = make_counter()     # make_counter 已经返回了
print(c())             # 1
print(c())             # 2
print(c())             # 3
\`\`\`

奇怪的现象出现了：\`make_counter()\` 已经执行完返回了，按理说它的局部变量 \`count\` 应该被销毁。但 \`c()\` 每次调用都能"记住"上次的值。这就是**闭包**——内层函数 \`counter\` 把外层变量 \`count\` 一起"打包"带走了。

#### 闭包的精确定义

> **闭包 = 函数 + 它引用的外层变量**

更严谨地说：当一个内嵌函数引用了外层函数的局部变量时，这个内嵌函数连同它引用的变量一起构成了一个闭包。即使外层函数已经返回，被引用的变量依然存活。

### __closure__ 属性：闭包的"包裹"

每个函数对象都有一个 \`__closure__\` 属性。如果这个函数是闭包，\`__closure__\` 是一个 **cell 对象元组**；如果不是闭包，它就是 \`None\`。

\`\`\`python
def outer():
    x = 10
    def inner():
        return x       # 引用了外层 x
    return inner

f = outer()
print(f.__closure__)      # (<cell at 0x...: int object at 0x...>,)
print(f.__closure__[0].cell_contents)   # 10
\`\`\`

\`cell\` 对象是闭包变量的"容器"，它把变量"包"起来，让内层函数能访问到。每次内层函数读取 \`x\` 时，实际上是从这个 cell 里取值。

| 属性 | 含义 |
| --- | --- |
| \`func.__closure__\` | 闭包变量元组（cell 对象的元组），非闭包则为 \`None\` |
| \`cell.cell_contents\` | cell 里实际的值 |
| \`func.__code__.co_freevars\` | 闭包引用的变量名列表 |

### 为什么闭包能"记住"外层变量

普通情况下，函数返回后局部变量就被销毁。但闭包打破了这个规则：

\`\`\`
┌─────────────────────────────────┐
│  outer 函数执行                  │
│  ┌──────────────────────────┐   │
│  │  x = 10  (局部变量)       │   │
│  │  ┌────────────────────┐  │   │
│  │  │  inner 函数对象     │  │   │
│  │  │  __closure__ → cell ─┼──┼─── cell 指向 x
│  │  └────────────────────┘  │   │
│  └──────────────────────────┘   │
│  return inner                    │
└─────────────────────────────────┘
                ↓
outer 返回后，inner 被 f 引用，
inner 的 __closure__ 引用 cell，
cell 引用 x → x 不会被回收
\`\`\`

关键在于 **cell 对象充当了"间接引用"层**。外层函数返回后，外层栈帧虽然销毁了，但 \`x\` 这个对象被 cell 持有，cell 被内层函数的 \`__closure__\` 持有，所以 \`x\` 不会被垃圾回收。这就是闭包能"记住"的原理。

### 用 dis 看闭包的字节码

用 \`dis\` 模块反汇编闭包，能看到内层函数通过 \`LOAD_DEREF\` 指令读取闭包变量：

\`\`\`python
import dis

def outer():
    x = 10
    def inner():
        return x
    return inner

dis.dis(outer.__code__.co_consts[1])
#   LOAD_DEREF   0 (x)     ← 从 cell 加载闭包变量
#   RETURN_VALUE
\`\`\`

#### 闭包相关的字节码

| 字节码 | 含义 |
| --- | --- |
| \`LOAD_DEREF\` | 从 cell 加载闭包变量 |
| \`STORE_DEREF\` | 把值存入 cell（写闭包变量） |
| \`LOAD_CLOSURE\` | 加载 cell 对象本身（用于构造闭包） |
| \`MAKE_CLOSURE\` | 创建闭包函数（旧版 Python） |

### 经典陷阱：循环里的闭包

这是闭包最常见的坑——**捕获变量 vs 调用时机**：

\`\`\`python
# 期望：创建 3 个函数，分别返回 0, 1, 2
funcs = []
for i in range(3):
    funcs.append(lambda: i)

print([f() for f in funcs])
# 实际输出: [2, 2, 2]   ← 全是 2！
\`\`\`

为什么？因为 \`lambda\` 捕获的是**变量 \`i\` 本身**（通过 cell），不是当时的值。等循环结束，\`i\` 变成了 2，三个函数调用时读到的都是 2。

#### 修复方案 1：默认参数捕获当前值

\`\`\`python
funcs = []
for i in range(3):
    funcs.append(lambda i=i: i)   # 在定义时把 i 的值绑到默认参数
print([f() for f in funcs])      # [0, 1, 2]
\`\`\`

默认参数在**函数定义时**求值，而不是调用时。所以每次循环都会把当前的 \`i\` 值"冻结"到默认参数里。

#### 修复方案 2：用工厂函数

\`\`\`python
def make_func(i):
    return lambda: i

funcs = [make_func(i) for i in range(3)]
print([f() for f in funcs])   # [0, 1, 2]
\`\`\`

每次调用 \`make_func(i)\` 都会创建一个**新的栈帧**，每个栈帧有自己的 \`i\`，三个闭包各自引用不同的 cell。

### 闭包 vs 默认参数：两种捕获时机

| 对比 | 闭包捕获 | 默认参数捕获 |
| --- | --- | --- |
| **捕获时机** | 函数定义时引用变量，调用时取值 | 函数定义时立即取值 |
| **变量变化** | 后续修改会影响闭包 | 后续修改不影响默认参数 |
| **适用场景** | 需要反映最新状态 | 需要冻结当时的值 |

\`\`\`python
x = 10
def read_closure(): return x       # 闭包，读到当前的 x
def read_default(x=x): return x     # 默认参数，固定为 10

x = 20
print(read_closure())   # 20（读到新值）
print(read_default())   # 10（还是旧值）
\`\`\`

### 闭包 vs nonlocal

闭包默认只能**读**外层变量，要**写**必须用 \`nonlocal\`：

\`\`\`python
def outer():
    x = 0
    def inner():
        x += 1        # 报错！UnboundLocalError
    return inner
\`\`\`

这是因为 \`x += 1\` 等价于 \`x = x + 1\`，Python 看到赋值就把 \`x\` 当作局部变量，但又没初始化，所以报错。加 \`nonlocal x\` 声明才能写：

\`\`\`python
def outer():
    x = 0
    def inner():
        nonlocal x
        x += 1        # OK
    return inner
\`\`\`

### 闭包的应用场景

#### 应用 1：装饰器

装饰器的本质就是闭包——外层函数接收被装饰函数，内层函数调用它：

\`\`\`python
def log(func):
    def wrapper(*args, **kwargs):
        print(f"调用 {func.__name__}")
        return func(*args, **kwargs)
    return wrapper     # wrapper 是闭包，引用了 func
\`\`\`

#### 应用 2：回调函数

GUI、异步、事件驱动编程里大量使用闭包作为回调：

\`\`\`python
def make_handler(button_id):
    def on_click():
        print(f"按钮 {button_id} 被点击")
    return on_click
\`\`\`

#### 应用 3：配置生成器

用闭包"记住"配置，返回专用函数：

\`\`\`python
def make_url(base):
    def path(p):
        return base + p
    return path

api = make_url("https://api.example.com")
api("/users")      # https://api.example.com/users
api("/posts")      # https://api.example.com/posts
\`\`\`

#### 应用 4：缓存（带状态的函数）

\`\`\`python
def memoize(func):
    cache = {}
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]
    return wrapper
\`\`\`

### 闭包与可变默认参数的对比

Python 还有一个经典坑：**可变默认参数**：

\`\`\`python
def add_item(item, lst=[]):
    lst.append(item)
    return lst

print(add_item(1))   # [1]
print(add_item(2))   # [1, 2]   ← 不是 [2]！
\`\`\`

这是因为默认参数只在函数定义时求值一次，所有调用共享同一个列表。这跟闭包陷阱在原理上有相似之处——都是"引用而非复制"导致的副作用。

### 闭包的内存影响

闭包会持有外层变量，可能导致意外的内存占用：

\`\`\`python
def make_huge():
    big = list(range(1_000_000))    # 一个大列表
    def get():
        return len(big)             # 闭包引用了 big
    return get

f = make_huge()
# big 不会被回收，因为 f 的 __closure__ 持有它
\`\`\`

如果只需要其中一小部分，可以在内层函数里只引用需要的字段，但这需要重构外层结构。

### 检查函数是否是闭包

\`\`\`python
def is_closure(func):
    return func.__closure__ is not None

def outer():
    x = 1
    def inner(): return x
    return inner

print(is_closure(outer()))   # True
print(is_closure(lambda: 1)) # False
\`\`\`

### 日常开发启示

1. **理解闭包本质**：闭包 = 函数 + 引用的外层变量，外层返回后变量依然存活
2. **小心循环闭包陷阱**：\`lambda\` 在循环里捕获的是变量本身，不是值。用默认参数 \`i=i\` 或工厂函数修复
3. **装饰器就是闭包**：写装饰器时，wrapper 函数引用了被装饰的 \`func\`，这就是闭包
4. **回调与事件处理**：闭包是回调函数天然的形式，能携带上下文
5. **注意内存**：闭包持有外层变量，可能阻碍 GC。大对象只引用需要的部分
6. **nonlocal 才能写**：闭包默认只读，要修改外层变量必须用 \`nonlocal\`
7. **用 __closure__ 调试**：当闭包行为奇怪时，\`func.__closure__\` 能看到引用了哪些变量

### 本节代码演示

下面这段代码演示闭包的内部结构：查看 \`__closure__\` 与 cell 对象、复现循环闭包陷阱及两种修复方案、对比闭包与默认参数的捕获时机、用 \`dis\` 看闭包字节码。运行后你会对"闭包到底记住了什么"有直观理解。`,
    code: `# ============================================================
# 第二章代码演示：闭包原理揭秘
# ============================================================
# 本代码探索闭包的内部机制：
#   - __closure__ 与 cell 对象
#   - 闭包变量在 __code__.co_freevars 中的名字
#   - 循环闭包陷阱及两种修复方案
#   - 闭包 vs 默认参数的捕获时机对比
#   - 用 dis 看闭包字节码（LOAD_DEREF）

import dis

# ---- 1. 最简单的闭包 ----
print("========== 1. 最简单的闭包 ==========")

def make_adder(n):
    """外层函数：接收一个值 n"""
    def adder(x):
        return x + n       # 引用了外层的 n
    return adder

add5 = make_adder(5)        # 创建一个"加 5"的函数
add10 = make_adder(10)      # 创建一个"加 10"的函数
print(f"add5(3)  = {add5(3)}")     # 8
print(f"add10(3) = {add10(3)}")    # 13
# add5 和 add10 各自有独立的 n，互不影响

# 查看 __closure__
print("\\nadd5 的 __closure__:", add5.__closure__)
print("add5 引用的变量值:", add5.__closure__[0].cell_contents)
print("add5 引用的变量名:", add5.__code__.co_freevars)

# ---- 2. cell 对象：闭包变量的容器 ----
print("\\n========== 2. cell 对象 ==========")

def make_counter():
    count = 0                       # 外层变量
    def counter():
        nonlocal count              # 声明要修改外层变量
        count += 1
        return count
    return counter

c1 = make_counter()
print(f"c1() = {c1()}")            # 1
print(f"c1() = {c1()}")            # 2
print(f"c1() = {c1()}")            # 3
print("c1 的 __closure__:", c1.__closure__)
print("count 当前值:", c1.__closure__[0].cell_contents)

# 两个独立的 counter，互不影响
c2 = make_counter()
print(f"c2() = {c2()}")            # 1（重新开始）
print(f"c1() = {c1()}")            # 4（c1 继续递增）

# ---- 3. 经典陷阱：循环里的闭包 ----
print("\\n========== 3. 循环闭包陷阱 ==========")

# 错误版本：所有 lambda 都返回 2
print("错误版本（捕获变量本身）:")
funcs_wrong = []
for i in range(3):
    funcs_wrong.append(lambda: i)   # 捕获的是 i 这个变量
# 循环结束后 i = 2
print("  结果:", [f() for f in funcs_wrong])   # [2, 2, 2]

# 修复方案 1：默认参数捕获当前值
print("修复方案 1（默认参数）:")
funcs_default = []
for i in range(3):
    funcs_default.append(lambda i=i: i)  # 在定义时把 i 的值冻结
print("  结果:", [f() for f in funcs_default])   # [0, 1, 2]

# 修复方案 2：工厂函数
print("修复方案 2（工厂函数）:")
def make_func(i):
    """每次调用都创建新栈帧，i 是独立的"""
    return lambda: i

funcs_factory = [make_func(i) for i in range(3)]
print("  结果:", [f() for f in funcs_factory])   # [0, 1, 2]

# ---- 4. 闭包 vs 默认参数：捕获时机对比 ----
print("\\n========== 4. 闭包 vs 默认参数 捕获时机 ==========")

x = 10
def read_closure():
    """闭包：引用全局 x"""
    return x

def read_default(x=x):
    """默认参数：定义时把 x 的值绑定"""
    return x

print(f"初始: x = {x}")
print(f"  read_closure() = {read_closure()}")   # 10
print(f"  read_default() = {read_default()}")   # 10

x = 20     # 修改 x
print(f"修改后: x = {x}")
print(f"  read_closure() = {read_closure()}")   # 20（读到新值）
print(f"  read_default() = {read_default()}")   # 10（还是旧值）
print("  → 闭包捕获变量，默认参数捕获值")

# ---- 5. nonlocal 才能修改外层变量 ----
print("\\n========== 5. nonlocal 关键字 ==========")

def make_counter_with_nonlocal():
    count = 0
    def counter():
        nonlocal count          # 声明使用外层 count
        count += 1
        return count
    return counter

nc = make_counter_with_nonlocal()
print(f"nc() = {nc()}")   # 1
print(f"nc() = {nc()}")   # 2
print(f"nc() = {nc()}")   # 3

# 没有 nonlocal 的情况
def try_modify_without_nonlocal():
    x = 10
    def inner():
        # x += 1   # 这会报错：UnboundLocalError
        return x   # 只读是可以的
    return inner

print("没有 nonlocal，闭包只能读不能写外层变量")

# ---- 6. 闭包应用：装饰器 ----
print("\\n========== 6. 闭包应用：装饰器 ==========")

def log(func):
    """简单装饰器：在调用前后打印日志"""
    def wrapper(*args, **kwargs):
        print(f"  [LOG] 调用 {func.__name__}({args}, {kwargs})")
        result = func(*args, **kwargs)
        print(f"  [LOG] {func.__name__} 返回 {result}")
        return result
    return wrapper

@log                          # 等价于 greet = log(greet)
def greet(name):
    return f"Hello, {name}!"

print("调用被装饰的 greet:")
ret = greet("Python")
print(f"最终返回: {ret}")

# wrapper 是闭包，引用了 func
print(f"greet 的 __closure__:", greet.__closure__ is not None)

# ---- 7. 闭包应用：配置生成器 ----
print("\\n========== 7. 闭包应用：配置生成器 ==========")

def make_url_builder(base_url):
    """用闭包记住 base_url，返回专用函数"""
    def build(path):
        return base_url + path
    return build

api = make_url_builder("https://api.example.com")
cdn = make_url_builder("https://cdn.example.com")

print(f"api('/users') = {api('/users')}")
print(f"api('/posts') = {api('/posts')}")
print(f"cdn('/img/logo.png') = {cdn('/img/logo.png')}")

# ---- 8. 闭包应用：缓存 ----
print("\\n========== 8. 闭包应用：缓存（memoize）=========")

def memoize(func):
    """用闭包记住调用结果"""
    cache = {}
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
            print(f"    [计算] {func.__name__}{args} = {cache[args]}")
        else:
            print(f"    [缓存] {func.__name__}{args} = {cache[args]}")
        return cache[args]
    return wrapper

@memoize
def slow_square(n):
    return n * n

print("第一次调用 slow_square(4):")
print(f"  结果: {slow_square(4)}")
print("第二次调用 slow_square(4):")
print(f"  结果: {slow_square(4)}")   # 从缓存取
print("调用 slow_square(5):")
print(f"  结果: {slow_square(5)}")

# ---- 9. 用 dis 看闭包字节码 ----
print("\\n========== 9. 闭包的字节码（LOAD_DEREF）==========")

def outer_demo():
    msg = "hello"
    def inner_demo():
        return msg           # 引用外层 msg
    return inner_demo

print("inner_demo 的字节码:")
print("-" * 50)
dis.dis(outer_demo.__code__.co_consts[1])   # 反汇编内层函数
print("-" * 50)
print("说明: LOAD_DEREF 指令从 cell 加载闭包变量")

print("\\nouter_demo 的字节码（关注 MAKE_CLOSURE/LOAD_CLOSURE）:")
print("-" * 50)
dis.dis(outer_demo)
print("-" * 50)

# ---- 10. 检查函数是否是闭包 ----
print("\\n========== 10. 检查函数是否是闭包 ==========")

def is_closure(func):
    """判断一个函数是否是闭包"""
    return func.__closure__ is not None

# 测试各种函数
def plain_func():
    return 42               # 普通函数，没有引用外层

y = 100
def read_global():
    return y                # 引用全局变量，但全局不是闭包变量

def make_inner():
    z = 1
    def inner():
        return z            # 引用外层局部变量，是闭包
    return inner

print(f"plain_func    是闭包? {is_closure(plain_func)}")        # False
print(f"read_global   是闭包? {is_closure(read_global)}")       # False（全局变量不算）
print(f"make_inner()  是闭包? {is_closure(make_inner())}")      # True
print(f"lambda: 1     是闭包? {is_closure(lambda: 1)}")         # False
print(f"add5         是闭包? {is_closure(add5)}")               # True（前面定义的）

# ---- 11. 闭包的内存影响 ----
print("\\n========== 11. 闭包持有变量不释放 ==========")

def make_huge():
    """外层函数创建大列表"""
    big = list(range(1000))      # 一个 1000 元素的列表
    def get_len():
        return len(big)          # 闭包引用了 big
    return get_len

import sys
f = make_huge()
print(f"闭包持有的大列表长度: {f()}")   # 1000
print("big 不会被 GC 回收，因为 f.__closure__ 持有它")
print(f"f.__closure__ 中的 cell 内容大小: {sys.getsizeof(f.__closure__[0].cell_contents)} bytes")

# ---- 12. 多个闭包变量 ----
print("\\n========== 12. 多个闭包变量 ==========")

def make_config(host, port, debug):
    """外层有多个变量"""
    def get_config():
        return f"host={host}, port={port}, debug={debug}"
    return get_config

cfg = make_config("localhost", 8080, True)
print(f"cfg(): {cfg()}")
print(f"闭包变量数: {len(cfg.__closure__)}")
print(f"闭包变量名: {cfg.__code__.co_freevars}")
for i, cell in enumerate(cfg.__closure__):
    print(f"  cell[{i}].cell_contents = {cell.cell_contents!r}")

print("\\n以上就是闭包原理的核心知识！")
print("理解 __closure__ 和 cell，你就明白了：")
print("  - 闭包为什么能记住外层变量")
print("  - 循环闭包陷阱的根因")
print("  - 装饰器、回调、缓存都建立在闭包上")
`,
  },

  // =========================================================
  // 第三章：LEGB 作用域查找规则
  // =========================================================
  {
    id: "pyint-legb",
    group: "函数与作用域",
    icon: "🏠",
    title: "LEGB 作用域查找规则",
    content: `## LEGB 作用域查找规则

Python 在执行代码时，每遇到一个变量名都要查它在哪定义、值是多少。这个查找有一套固定顺序，叫 **LEGB 规则**。理解 LEGB 能解释你日常开发中遇到的几乎一切"变量去哪了"问题：为什么函数内能读全局变量、为什么改不了、为什么 \`global\`/\`nonlocal\` 有时是必需的。

### 什么是 LEGB

LEGB 是四个作用域的首字母缩写，Python 按这个顺序从内到外查找变量：

| 层级 | 名称 | 含义 | 对应的 Python 对象 |
| --- | --- | --- | --- |
| **L** | Local | 当前函数的局部作用域 | 栈帧的 \`f_locals\` |
| **E** | Enclosing | 外层嵌套函数的作用域（闭包变量） | \`__closure__\` 中的 cell |
| **G** | Global | 当前模块的全局作用域 | 模块的 \`__dict__\` |
| **B** | Built-in | 内建作用域 | \`builtins\` 模块 |

查找顺序：**L → E → G → B**，从最内层往外找。一旦在某一层找到就停止；如果一路找到 B 都没有，抛出 \`NameError\`。

### 查找示意图

\`\`\`
变量名 x 的查找过程:

   ┌─────────────────────────────────┐
   │  B: Built-in (print, len, ...) │ ← 最外层
   │  ┌───────────────────────────┐ │
   │  │  G: Global (模块级变量)    │ │
   │  │  ┌─────────────────────┐  │ │
   │  │  │  E: Enclosing (闭包) │  │ │
   │  │  │  ┌───────────────┐  │  │ │
   │  │  │  │  L: Local     │  │  │ │ ← 最先找
   │  │  │  │  (函数局部)    │  │  │ │
   │  │  │  └───────────────┘  │  │ │
   │  │  └─────────────────────┘  │ │
   │  └───────────────────────────┘ │
   └─────────────────────────────────┘

找不到 → NameError
\`\`\`

### L - Local：函数局部

函数内部定义的变量，作用域只在这个函数内：

\`\`\`python
def f():
    x = 10           # x 是 f 的局部变量
    print(x)
f()
print(x)             # NameError: x 不在全局作用域
\`\`\`

函数参数也算 Local：

\`\`\`python
def g(a, b):        # a, b 都是局部变量
    return a + b
\`\`\`

### E - Enclosing：外层嵌套函数

当函数嵌套定义时，内层函数能访问外层函数的局部变量：

\`\`\`python
def outer():
    x = 100           # 外层函数的局部
    def inner():
        print(x)      # 引用外层的 x（闭包变量）
    inner()
outer()               # 100
\`\`\`

这里的 \`x\` 对 \`inner\` 来说就是 Enclosing 变量。这就是上一章讲的闭包原理。

### G - Global：模块全局

模块顶层定义的变量，整个模块都能访问：

\`\`\`python
PI = 3.14             # 模块全局变量

def area(r):
    return PI * r * r   # 函数内能读全局 PI
\`\`\`

注意：函数内能**读**全局变量，但**直接赋值会被当成局部变量**（见下文陷阱）。

### B - Built-in：内建

Python 预先加载的内建名字，比如 \`print\`, \`len\`, \`int\`, \`str\`, \`range\`, \`Exception\` 等：

\`\`\`python
def f():
    return len([1, 2, 3])   # len 来自 Built-in
\`\`\`

可以用 \`dir(__builtins__)\` 查看所有内建名字。

### 查找顺序的代码验证

\`\`\`python
x = "global"

def outer():
    x = "enclosing"
    def inner():
        x = "local"
        print(x)        # local
    inner()
outer()

# 改成不定义 local，会找到 enclosing
def outer2():
    x = "enclosing"
    def inner2():
        print(x)        # enclosing
    inner2()
outer2()

# 再去掉 enclosing，找到 global
def outer3():
    def inner3():
        print(x)        # global
    inner3()
outer3()
\`\`\`

### global 关键字

函数内**直接赋值**会被当作创建局部变量，不会修改全局：

\`\`\`python
count = 0
def incr():
    count += 1          # 报错！等价于 count = count + 1
                        # Python 把 count 当局部变量，但又没初始化
incr()
\`\`\`

要修改全局变量，必须用 \`global\` 声明：

\`\`\`python
count = 0
def incr():
    global count        # 声明 count 是全局变量
    count += 1
incr()
print(count)            # 1
\`\`\`

#### global 的真实含义

\`global x\` 的意思是："在这个函数里，\`x\` 这个名字指向全局作用域的 \`x\`，不要把它当局部变量"。它**不是创建全局变量**，而是**声明名字的查找层**。

### nonlocal 关键字

对于嵌套函数，要修改外层函数的局部变量，用 \`nonlocal\`：

\`\`\`python
def make_counter():
    count = 0
    def inner():
        nonlocal count     # 声明 count 是外层变量
        count += 1
        return count
    return inner
\`\`\`

\`nonlocal\` 与 \`global\` 的区别：

| 关键字 | 修饰的目标 | 场景 |
| --- | --- | --- |
| \`global\` | 模块全局变量 | 函数内修改模块级变量 |
| \`nonlocal\` | 外层嵌套函数的局部变量 | 内层函数修改闭包变量 |

### 为什么函数内能读全局但不能直接改

这是 LEGB 规则加上"赋值即局部"的约定导致的：

- **读取**：按 L → E → G → B 顺序查，全局变量在 G 层，能找到
- **赋值**：Python 看到函数内有 \`x = ...\`，就把 \`x\` 标记为局部变量（在编译期决定）。这导致读取时优先找 Local，但 Local 还没赋值，于是报 \`UnboundLocalError\`

这个设计是为了**性能**：如果函数内的 \`x\` 是局部的，编译器就能用更快的字节码（\`STORE_FAST\` 而不是 \`STORE_NAME\`）。

### 常见陷阱：函数内修改可变全局对象

虽然不能直接重新赋值全局变量，但**修改可变对象**是允许的：

\`\`\`python
config = {"debug": False}

def enable_debug():
    config["debug"] = True      # 修改字典内容，不需要 global
enable_debug()
print(config)                   # {"debug": True}

def reset_config():
    config = {"debug": False}  # 这是重新赋值，会创建局部变量！
                                # 全局的 config 没变
reset_config()
print(config)                   # 还是 {"debug": True}
\`\`\`

这是新手最容易踩的坑：以为 \`config = {...}\` 修改了全局，其实只是创建了一个同名的局部变量。

### 用 dis 看字节码

不同作用域的变量访问，对应不同的字节码：

| 字节码 | 含义 | 适用作用域 |
| --- | --- | --- |
| \`LOAD_FAST\` | 加载局部变量（数组索引访问，最快） | L |
| \`LOAD_DEREF\` | 加载闭包变量（从 cell） | E |
| \`LOAD_GLOBAL\` | 加载全局变量（字典查找，较慢） | G |
| \`STORE_FAST\` | 存储局部变量 | L |
| \`STORE_DEREF\` | 存储闭包变量 | E |
| \`STORE_GLOBAL\` | 存储全局变量 | G |

#### 字节码示例

\`\`\`python
import dis

x = 10
def demo():
    y = 20           # STORE_FAST
    print(y)         # LOAD_FAST + LOAD_GLOBAL(print)
    print(x)         # LOAD_GLOBAL(print) + LOAD_GLOBAL(x)

dis.dis(demo)
\`\`\`

输出会显示 \`y\` 用 \`LOAD_FAST\`/\`STORE_FAST\`（局部），\`x\` 和 \`print\` 用 \`LOAD_GLOBAL\`（全局/内建）。

### 局部变量的"编译期决定"

Python 在**编译期**就决定了一个变量是局部还是全局，依据是函数体内是否有 \`赋值\` 语句：

\`\`\`python
x = 10
def f():
    print(x)        # 这一行会报错！
    x = 20          # 因为这里有赋值，x 被标记为局部
                    # 但 print 时还没赋值，所以 UnboundLocalError
\`\`\`

即使赋值在 print 之后，Python 也在编译期就把 \`x\` 标记为局部变量，导致 \`print(x)\` 找不到值。这就是为什么有时报错信息会让你意外。

### 模块级作用域与函数级作用域的区别

Python 没有块级作用域（像 C/Java 的 \`{...}\`）。在 \`if\`/\`for\`/\`while\` 块里赋值的变量，在外部依然可见：

\`\`\`python
for i in range(3):
    pass
print(i)            # 2（i 在循环外依然可见）

if True:
    x = 10
print(x)            # 10
\`\`\`

只有**函数、类、模块、生成器**才会创建新作用域。\`if\`/\`for\`/\`while\`/\`with\` 不会。

### 作用域与异常处理

\`\`\`python
try:
    value = 1 / 0
except ZeroDivisionError:
    err = "除零错误"
print(value)        # NameError? 不，value 没有被赋值
print(err)          # "除零错误"（try/except 不创建新作用域）
\`\`\`

\`try\`/\`except\` 不创建新作用域，但要注意：如果 \`try\` 块在赋值前就抛异常，那个变量不会被赋值。

### globals() 和 locals()

可以用 \`globals()\` 和 \`locals()\` 查看当前作用域的变量：

\`\`\`python
x = 10
def f():
    y = 20
    print(locals())     # {'y': 20}
    print(globals()['x'])  # 10
\`\`\`

注意：在函数内 \`locals()\` 返回的是当前栈帧的 \`f_locals\` 的副本，修改它**不会**影响真实变量。

### 日常开发启示

1. **优先用参数和返回值传值**：函数依赖全局变量会让代码难以测试和复用
2. **能用局部变量就不要用全局**：全局变量使程序状态难以追踪
3. **修改全局要 \`global\`，修改闭包要 \`nonlocal\`**：搞清楚改的是哪一层
4. **修改可变全局对象的内容不需要 global**：但容易产生副作用，慎用
5. **理解 \`UnboundLocalError\`**：函数内有赋值就标记为局部，可能让你读不到全局
6. **Python 没有块级作用域**：\`for\` 循环里的 \`i\` 在循环外依然可用
7. **避免在内层函数里覆盖内建名字**：给变量起名 \`len\`/\`list\`/\`type\` 会遮蔽内建

### 本节代码演示

下面这段代码演示 LEGB 各层查找、\`global\`/\`nonlocal\` 的作用、修改可变全局对象的副作用，并用 \`dis\` 查看不同作用域变量访问的字节码。运行后你会对"变量到底从哪里来"有清晰认识。`,
    code: `# ============================================================
# 第三章代码演示：LEGB 作用域查找规则
# ============================================================
# 本代码演示 LEGB 四层作用域的查找顺序：
#   - L (Local): 函数局部
#   - E (Enclosing): 外层嵌套函数（闭包）
#   - G (Global): 模块全局
#   - B (Built-in): 内建
# 以及 global / nonlocal 关键字、可变全局对象的副作用

import dis

# ---- 1. LEGB 四层查找演示 ----
print("========== 1. LEGB 四层查找 ==========")

# B: Built-in
print(f"  B (Built-in): len = {len}")   # len 来自内建

# G: Global
global_var = "我是全局变量"
print(f"  G (Global): global_var = {global_var!r}")

def outer_func():
    # E: Enclosing
    enclosing_var = "我是外层函数变量"

    def inner_func():
        # L: Local
        local_var = "我是局部变量"
        print(f"  L (Local):      local_var = {local_var!r}")
        print(f"  E (Enclosing):  enclosing_var = {enclosing_var!r}")
        print(f"  G (Global):     global_var = {global_var!r}")
        print(f"  B (Built-in):   len 函数 = {len}")

    inner_func()

print("\\n调用 outer_func → inner_func:")
outer_func()

# ---- 2. 查找顺序：从内到外 ----
print("\\n========== 2. 查找顺序演示 ==========")

x = "global"

def level1():
    x = "enclosing"
    def level2():
        x = "local"
        print(f"  内层有 local: x = {x!r}")
    level2()
    print(f"  外层有 enclosing: x = {x!r}")

print("level1() 中 x 的查找:")
level1()
print(f"模块层: x = {x!r}")

# 没有局部变量时，会找外层
print("\\n去掉局部定义后:")
def level1b():
    x = "enclosing"
    def level2b():
        print(f"  内层无 local，找到 enclosing: x = {x!r}")
    level2b()

level1b()

# ---- 3. global 关键字 ----
print("\\n========== 3. global 关键字 ==========")

counter = 0

def incr_without_global():
    # counter += 1   # 这会报错：UnboundLocalError
    pass

def incr_with_global():
    global counter       # 声明使用全局 counter
    counter += 1

print(f"初始 counter = {counter}")
incr_with_global()
print(f"调用一次后 counter = {counter}")
incr_with_global()
incr_with_global()
print(f"调用三次后 counter = {counter}")

# ---- 4. nonlocal 关键字 ----
print("\\n========== 4. nonlocal 关键字 ==========")

def make_counter():
    count = 0
    def inner():
        nonlocal count       # 声明使用外层 count
        count += 1
        return count
    return inner

c = make_counter()
print(f"c() = {c()}")
print(f"c() = {c()}")
print(f"c() = {c()}")

# ---- 5. 陷阱：函数内修改可变全局对象 ----
print("\\n========== 5. 可变全局对象的陷阱 ==========")

config = {"debug": False, "level": 1}

def enable_debug():
    # 修改字典内容，不需要 global
    config["debug"] = True
    config["level"] = 2

def reset_config_wrong():
    # 这是重新赋值，创建局部变量，全局不变
    config = {"debug": False, "level": 0}
    print(f"  reset_config_wrong 内部: config = {config}")

print(f"初始 config = {config}")
enable_debug()
print(f"enable_debug 后 config = {config}")

reset_config_wrong()
print(f"reset_config_wrong 后 config = {config} (全局未变)")

# ---- 6. 陷阱：编译期决定局部变量 ----
print("\\n========== 6. 编译期决定局部变量 ==========")

x = 10

def tricky():
    # print(x)   # 如果取消注释会报错：UnboundLocalError
                  # 因为下面有 x = 20，x 被标记为局部
    x = 20
    print(f"  函数内 x = {x}")

tricky()
print(f"函数外 x = {x} (未受影响)")

print("\\n说明：Python 在编译期就根据'是否有赋值'决定变量作用域")
print("  - 函数内有 x = ... → x 是局部变量")
print("  - 函数内无 x = ... → x 按 LEGB 查找")

# ---- 7. globals() 和 locals() ----
print("\\n========== 7. globals() 和 locals() ==========")

g_var = "我是全局"

def scope_demo():
    l_var = "我是局部"
    print(f"  locals(): {list(locals().keys())}")
    print(f"  globals() 含 g_var: {'g_var' in globals()}")
    print(f"  globals() 含 l_var: {'l_var' in globals()}")

scope_demo()

# ---- 8. Python 没有块级作用域 ----
print("\\n========== 8. Python 没有块级作用域 ==========")

for i in range(3):
    loop_var = i * 10
print(f"  循环结束后 i = {i}")
print(f"  循环结束后 loop_var = {loop_var}")

if True:
    block_var = "在 if 块里定义"
print(f"  if 块外 block_var = {block_var!r}")

print("\\n说明：if/for/while/with 不创建新作用域")
print("  只有函数、类、模块、生成器才创建新作用域")

# ---- 9. 遮蔽内建名字的陷阱 ----
print("\\n========== 9. 遮蔽内建名字 ==========")

# 危险：把内建 len 覆盖了
# len = 100   # 不要这样做！
# print(len([1, 2, 3]))   # TypeError: 'int' is not callable

# 在函数内遮蔽
def dangerous():
    # list = [1, 2, 3]   # 这会把 list 当局部变量，遮蔽内建
    # new_list = list()  # 报错！
    pass

print("  避免给变量起名: list, dict, set, len, type, id, str, int")
print("  这些是内建名字，遮蔽后会导致奇怪的错误")

# 查看内建名字
import builtins
builtin_names = [n for n in dir(builtins) if not n.startswith('_')]
print(f"  常用内建名字（前 20 个）: {builtin_names[:20]}")

# ---- 10. 用 dis 看作用域相关的字节码 ----
print("\\n========== 10. 作用域字节码 ==========")

g_x = 10

def bytecode_demo():
    l_y = 20                # 局部变量
    print(l_y)              # LOAD_FAST
    print(g_x)              # LOAD_GLOBAL

print("bytecode_demo 的字节码:")
print("-" * 50)
dis.dis(bytecode_demo)
print("-" * 50)
print("说明：")
print("  LOAD_FAST  : 加载局部变量（最快，数组索引）")
print("  LOAD_GLOBAL: 加载全局变量（较慢，字典查找）")
print("  STORE_FAST : 存储局部变量")
print("  STORE_GLOBAL: 存储全局变量")

# ---- 11. global 与 nonlocal 对比 ----
print("\\n========== 11. global vs nonlocal 字节码 ==========")

g_counter = 0

def with_global():
    global g_counter
    g_counter += 1          # STORE_GLOBAL

print("with_global 的字节码（关注 STORE_GLOBAL）:")
print("-" * 50)
dis.dis(with_global)
print("-" * 50)

def make_with_nonlocal():
    n_counter = 0
    def inner():
        nonlocal n_counter
        n_counter += 1      # STORE_DEREF
    return inner

print("make_with_nonlocal.inner 的字节码（关注 STORE_DEREF）:")
print("-" * 50)
inner_func = make_with_nonlocal()    # 调用外层函数拿到 inner 闭包
dis.dis(inner_func)                  # 反汇编 inner 的字节码（版本无关）
print("-" * 50)

# ---- 12. 作用域总结表 ----
print("\\n========== 12. LEGB 速查表 ==========")
print("""
LEGB 速查表:

  层级  名称        典型来源               访问方式
  ─────────────────────────────────────────────────
  L    Local       函数内赋值的变量        直接读，赋值即局部
  E    Enclosing   外层嵌套函数的变量      闭包自动读，写要 nonlocal
  G    Global      模块顶层定义的变量      直接读，写要 global
  B    Built-in    print/len/int 等       直接读，不要覆盖

查找顺序：L → E → G → B（从内到外）
找不到 → NameError

关键规则：
  1. 函数内有赋值 → 变量被标记为局部（编译期决定）
  2. 修改全局要 global，修改闭包变量要 nonlocal
  3. 修改可变全局对象的内容不需要 global
  4. if/for/while 不创建新作用域
  5. globals() / locals() 查看当前作用域
""")

print("以上就是 LEGB 作用域查找规则的核心知识！")
print("理解 LEGB，你就理解了：")
print("  - 为什么函数内能读全局但不能直接改")
print("  - 为什么需要 global / nonlocal")
print("  - 为什么有时会 UnboundLocalError")
print("  - 变量到底从哪里来")
`,
  },

  // =========================================================
  // 第四章：迭代器协议与 for 循环本质
  // =========================================================
  {
    id: "pyint-iterator",
    group: "迭代器与生成器",
    icon: "🔁",
    title: "迭代器协议与 for 循环本质",
    content: `## 迭代器协议与 for 循环本质

\`for x in [1, 2, 3]:\` 这行代码看起来再平常不过，但它背后隐藏着 Python 最优雅的设计之一——**迭代器协议**。理解迭代器，能让你看懂 \`map\`/\`filter\`/\`zip\`/\`enumerate\` 的返回值，能用迭代器处理大文件、流式数据，能写出更 Pythonic 的代码。

### 可迭代对象 vs 迭代器

这是两个容易混淆的概念：

| 概念 | 英文 | 必须实现的方法 | 特点 |
| --- | --- | --- | --- |
| **可迭代对象** | Iterable | \`__iter__\` | 能被 \`for\` 循环遍历 |
| **迭代器** | Iterator | \`__iter__\` + \`__next__\` | 能逐步产生下一个值 |

关系：**迭代器一定是可迭代对象**（它的 \`__iter__\` 通常返回自己），但可迭代对象不一定是迭代器。

\`\`\`
可迭代对象（Iterable）
    │
    │  iter(obj) 调用 __iter__
    ▼
迭代器（Iterator）
    │
    │  next(it) 调用 __next__
    ▼
逐个产生值，直到 StopIteration
\`\`\`

### for 循环的本质

\`for x in obj:\` 在 Python 内部做了什么？等价于：

\`\`\`python
# 这段 for 循环:
for x in [1, 2, 3]:
    print(x)

# 等价于:
_iter = iter([1, 2, 3])     # 调用 __iter__ 获取迭代器
while True:
    try:
        x = next(_iter)       # 调用 __next__ 取下一个值
        print(x)
    except StopIteration:    # 没有更多值了
        break
\`\`\`

所以 \`for\` 循环的本质就是：**调用 \`iter()\` 拿迭代器，循环调用 \`next()\`，捕获 \`StopIteration\` 退出**。

### __iter__ 和 __next__

- \`__iter__(self)\`：返回一个迭代器对象。可迭代对象必须实现。
- \`__next__(self)\`：返回下一个值。如果没有更多值，抛出 \`StopIteration\`。迭代器必须实现。

\`\`\`python
class MyRange:
    def __init__(self, start, end):
        self.current = start
        self.end = end

    def __iter__(self):
        return self          # 自己就是迭代器

    def __next__(self):
        if self.current >= self.end:
            raise StopIteration     # 没有更多值
        value = self.current
        self.current += 1
        return value

for x in MyRange(1, 5):
    print(x)                  # 1, 2, 3, 4
\`\`\`

### StopIteration：终止信号

当迭代器没有更多值时，\`__next__\` 抛出 \`StopIteration\` 异常。\`for\` 循环会捕获这个异常并退出循环。

\`\`\`python
it = iter([1, 2, 3])
print(next(it))     # 1
print(next(it))     # 2
print(next(it))     # 3
print(next(it))     # StopIteration!
\`\`\`

\`StopIteration\` 是迭代器协议的**核心约定**，没有它 \`for\` 循环就不知道何时停止。

### 手动迭代

不用 \`for\`，也能手动迭代：

\`\`\`python
items = [10, 20, 30]
it = iter(items)            # 获取迭代器
while True:
    try:
        x = next(it)
        print(x)
    except StopIteration:
        break
\`\`\`

这就是 \`for\` 循环底层在做的事。理解了手动迭代，就理解了 \`for\` 的本质。

### 迭代器只能前进不能后退

迭代器是**单向**的：只能往前走，不能回头。

\`\`\`python
it = iter([1, 2, 3])
print(next(it))     # 1
print(next(it))     # 2
# 没有 prev(it) 这种东西
\`\`\`

如果需要随机访问（按下标取值），用列表；如果只需要顺序遍历，用迭代器更省内存。

### 迭代器耗尽后无法复用

迭代器一旦走完，就"耗尽"了，再次迭代不会有任何输出：

\`\`\`python
it = iter([1, 2, 3])
for x in it:
    print(x)         # 1, 2, 3

for x in it:         # 没有输出！迭代器已耗尽
    print(x)
\`\`\`

但**可迭代对象**（如列表）每次 \`for\` 都会创建新的迭代器，所以可以反复遍历：

\`\`\`python
lst = [1, 2, 3]
for x in lst:       # 第一次：创建迭代器 A
    print(x)
for x in lst:       # 第二次：创建迭代器 B
    print(x)         # 依然输出 1, 2, 3
\`\`\`

### 常见的可迭代对象

Python 里几乎所有"容器"都是可迭代的：

| 类型 | 可迭代 | 是迭代器 | 备注 |
| --- | --- | --- | --- |
| \`list\` | ✅ | ❌ | 每次迭代创建新迭代器 |
| \`tuple\` | ✅ | ❌ | 同上 |
| \`dict\` | ✅ | ❌ | 迭代键 |
| \`set\` | ✅ | ❌ | 顺序不保证 |
| \`str\` | ✅ | ❌ | 按字符迭代 |
| \`range\` | ✅ | ❌ | 惰性，省内存 |
| \`bytes\` | ✅ | ❌ | 按字节迭代 |
| \`map\` 对象 | ✅ | ✅ | 是迭代器 |
| \`filter\` 对象 | ✅ | ✅ | 是迭代器 |
| \`zip\` 对象 | ✅ | ✅ | 是迭代器 |
| \`enumerate\` 对象 | ✅ | ✅ | 是迭代器 |
| 文件对象 | ✅ | ✅ | 是迭代器（按行迭代） |

注意 \`map\`/\`filter\`/\`zip\`/\`enumerate\` 的返回值**本身就是迭代器**，这意味着它们**只能遍历一次**。

### enumerate、zip、map、filter 都是迭代器

\`\`\`python
# enumerate：返回 (索引, 值) 对的迭代器
for i, x in enumerate(['a', 'b', 'c']):
    print(i, x)         # 0 a / 1 b / 2 c

# zip：把多个可迭代对象"拉链"在一起
for a, b in zip([1, 2, 3], ['x', 'y', 'z']):
    print(a, b)         # 1 x / 2 y / 3 z

# map：把函数应用到每个元素
result = map(str.upper, ['hello', 'world'])
print(list(result))     # ['HELLO', 'WORLD']

# filter：过滤元素
result = filter(lambda x: x > 0, [-1, 0, 1, 2])
print(list(result))     # [1, 2]
\`\`\`

这些函数返回的都是迭代器，**遍历一次就没了**。要反复使用，先转成列表。

### range 的特殊性

\`range\` 不是迭代器，而是**可迭代对象**：

\`\`\`python
r = range(3)
print(iter(r))       # 每次创建新迭代器
print(iter(r) is iter(r))   # False（不同迭代器）

# range 可以反复迭代
for x in r: print(x)   # 0 1 2
for x in r: print(x)   # 0 1 2（依然能迭代）
\`\`\`

但 \`range\` 不存储所有值，而是按需计算，所以 \`range(1000000)\` 几乎不占内存。

### 迭代器比索引访问更通用

索引访问（\`obj[i]\`）要求对象支持 \`__getitem__\` 且按下标取值。但很多数据源（文件、网络流、数据库游标）没有"第 N 个"的概念，却能"逐个产生值"。

迭代器协议让 \`for\` 循环能统一处理所有这些数据源——只要能 \`next()\`，就能 \`for\`。

\`\`\`python
# 文件对象是迭代器，按行迭代
with open('big.txt') as f:
    for line in f:           # 逐行读取，不一次性加载
        process(line)
\`\`\`

### 惰性计算与内存优势

迭代器最大的优势是**惰性**——只在需要时才计算下一个值。这让处理大数据变得可能：

\`\`\`python
# 处理 10 亿行的文件，内存只占一行
with open('huge.log') as f:
    for line in f:
        if 'ERROR' in line:
            print(line)
\`\`\`

如果用 \`f.readlines()\` 一次性读取，10 亿行会把内存撑爆。迭代器让"流式处理"成为可能。

### 自定义可迭代对象

让一个类支持 \`for\` 循环，有两种方式：

#### 方式 1：实现 __iter__（推荐）

\`\`\`python
class Squares:
    def __init__(self, n):
        self.n = n

    def __iter__(self):
        # 返回一个独立的迭代器
        for i in range(self.n):
            yield i * i      # 用生成器简化

for x in Squares(5):
    print(x)                 # 0, 1, 4, 9, 16
\`\`\`

#### 方式 2：实现 __getitem__（旧式，不推荐）

\`\`\`python
class OldStyle:
    def __init__(self, data):
        self.data = data
    def __getitem__(self, i):
        if i >= len(self.data):
            raise IndexError
        return self.data[i]

for x in OldStyle([10, 20, 30]):
    print(x)                 # 10, 20, 30
\`\`\`

\`__getitem__\` 方式是 Python 早期的迭代协议，仍然支持，但推荐用 \`__iter__\`。

### 迭代器的工具函数

| 函数 | 作用 |
| --- | --- |
| \`iter(obj)\` | 获取可迭代对象的迭代器 |
| \`next(it)\` | 取下一个值（可带默认值） |
| \`list(it)\` | 把迭代器转成列表 |
| \`sum(it)\` | 求和 |
| \`any(it)\` | 是否有真值 |
| \`all(it)\` | 是否全为真 |
| \`sorted(it)\` | 排序（消耗迭代器） |
| \`itertools\` | 大量迭代器工具 |

### itertools：迭代器工具箱

标准库 \`itertools\` 提供了大量有用的迭代器：

\`\`\`python
import itertools

itertools.chain([1, 2], [3, 4])      # 1, 2, 3, 4（拼接）
itertools.count(10)                  # 10, 11, 12, ...（无限）
itertools.cycle('AB')                # A, B, A, B, ...（循环）
itertools.islice(it, 5)             # 取前 5 个
itertools.combinations('ABC', 2)     # AB, AC, BC（组合）
\`\`\`

### 日常开发启示

1. **用迭代器处理大文件**：\`for line in f:\` 逐行读，不要 \`f.readlines()\`
2. **map/filter/zip 只能遍历一次**：要反复用先 \`list()\` 转换
3. **range 不是迭代器**：可以反复迭代，且几乎不占内存
4. **优先用 \`for x in obj\` 而不是索引**：更通用、更 Pythonic
5. **自定义类实现 \`__iter__\`**：让对象支持 \`for\` 循环，比 \`__getitem__\` 更现代
6. **用 \`enumerate\` 取索引**：不要 \`for i in range(len(lst))\`，要 \`for i, x in enumerate(lst)\`
7. **用 \`zip\` 并行迭代**：不要手动按下标对齐，要 \`for a, b in zip(lst1, lst2)\`
8. **惰性计算省内存**：处理大数据流时，迭代器是关键

### 本节代码演示

下面这段代码手动实现可迭代对象和迭代器、用 \`iter()\` + \`next()\` 演示 \`for\` 循环的等价代码、演示迭代器耗尽现象、对比 \`map\`/\`filter\`/\`zip\` 等返回迭代器的特点。运行后你会对"\`for\` 循环到底在做什么"有直观认识。`,
    code: `# ============================================================
# 第四章代码演示：迭代器协议与 for 循环本质
# ============================================================
# 本代码演示迭代器的内部机制：
#   - 手动实现可迭代对象和迭代器
#   - 用 iter() + next() 演示 for 循环的等价代码
#   - 迭代器耗尽现象
#   - map/filter/zip/enumerate 返回迭代器
#   - range 不是迭代器

# ---- 1. for 循环的本质 ----
print("========== 1. for 循环的本质 ==========")

# 普通 for 循环
print("普通 for 循环:")
for x in [1, 2, 3]:
    print(f"  {x}", end=" ")
print()

# 等价的手动迭代
print("等价的手动迭代:")
it = iter([1, 2, 3])           # 获取迭代器
while True:
    try:
        x = next(it)           # 取下一个值
        print(f"  {x}", end=" ")
    except StopIteration:      # 没有更多值
        break
print()

# ---- 2. 手动实现可迭代对象和迭代器 ----
print("\\n========== 2. 手动实现迭代器 ==========")

class MyRange:
    """自定义可迭代对象 + 迭代器"""

    def __init__(self, start, end, step=1):
        self.start = start
        self.end = end
        self.step = step

    def __iter__(self):
        """返回一个独立的迭代器"""
        return MyRangeIterator(self.start, self.end, self.step)

class MyRangeIterator:
    """独立的迭代器对象"""

    def __init__(self, start, end, step):
        self.current = start
        self.end = end
        self.step = step

    def __iter__(self):
        """迭代器的 __iter__ 返回自己"""
        return self

    def __next__(self):
        """返回下一个值，没有则抛 StopIteration"""
        if self.current >= self.end:
            raise StopIteration
        value = self.current
        self.current += self.step
        return value

# 使用自定义迭代器
print("MyRange(1, 10, 2):", list(MyRange(1, 10, 2)))
print("MyRange(0, 5):    ", list(MyRange(0, 5)))

# 用 for 循环遍历
print("for 循环遍历 MyRange(10, 20, 3):")
for x in MyRange(10, 20, 3):
    print(f"  {x}", end=" ")
print()

# ---- 3. 迭代器只能前进不能后退 ----
print("\\n========== 3. 迭代器单向前进 ==========")

it = iter([10, 20, 30, 40])
print(f"第一次 next: {next(it)}")   # 10
print(f"第二次 next: {next(it)}")   # 20
print(f"第三次 next: {next(it)}")   # 30
print(f"第四次 next: {next(it)}")   # 40
# 没有 prev(it) 这种东西，迭代器只能前进

# next 带默认值，避免 StopIteration
print(f"第五次 next（带默认值）: {next(it, '没有了')}")

# ---- 4. 迭代器耗尽后无法复用 ----
print("\\n========== 4. 迭代器耗尽 ==========")

it = iter([1, 2, 3])
print("第一次遍历:")
for x in it:
    print(f"  {x}", end=" ")
print()

print("第二次遍历同一个迭代器:")
for x in it:
    print(f"  {x}", end=" ")
print("  (无输出，迭代器已耗尽)")

# 可迭代对象可以反复迭代
print("\\n列表（可迭代对象）可以反复遍历:")
lst = [1, 2, 3]
for i in range(2):
    print(f"  第 {i+1} 次:", list(lst))

# ---- 5. map/filter/zip/enumerate 返回迭代器 ----
print("\\n========== 5. 内置函数返回迭代器 ==========")

# map 返回迭代器
m = map(lambda x: x * x, [1, 2, 3, 4])
print(f"map 对象: {m}")
print(f"  类型: {type(m).__name__}")
print(f"  是迭代器? {hasattr(m, '__next__')}")
print(f"  转 list: {list(m)}")
print(f"  再次转 list: {list(m)} (已耗尽)")

# filter 返回迭代器
f = filter(lambda x: x % 2 == 0, range(10))
print(f"\\nfilter 对象: {f}")
print(f"  偶数: {list(f)}")

# zip 返回迭代器
z = zip([1, 2, 3], ['a', 'b', 'c'])
print(f"\\nzip 对象: {z}")
print(f"  配对: {list(z)}")

# enumerate 返回迭代器
e = enumerate(['x', 'y', 'z'])
print(f"\\nenumerate 对象: {e}")
print(f"  索引+值: {list(e)}")

# ---- 6. range 不是迭代器 ----
print("\\n========== 6. range 不是迭代器 ==========")

r = range(5)
print(f"range(5): {r}")
print(f"  有 __iter__? {hasattr(r, '__iter__')}")
print(f"  有 __next__? {hasattr(r, '__next__')}")   # 没有！
print(f"  是迭代器? {hasattr(r, '__next__')}")
print(f"  但是可迭代: {iter(r) is not None}")

# range 每次迭代创建新迭代器
it1 = iter(r)
it2 = iter(r)
print(f"  iter(r) is iter(r)? {it1 is it2}")   # False，不同迭代器
print(f"  range 可以反复迭代: {list(r)}, {list(r)}")

# range 几乎不占内存
import sys
big_range = range(10_000_000)
print(f"  range(10000000) 占用内存: {sys.getsizeof(big_range)} bytes")
big_list = list(big_range)
print(f"  list(range(10000000)) 占用内存: {sys.getsizeof(big_list)} bytes")

# ---- 7. 自定义类支持 for 循环 ----
print("\\n========== 7. 自定义类支持迭代 ==========")

class Fibonacci:
    """斐波那契数列，支持 for 循环"""

    def __init__(self, n):
        self.n = n

    def __iter__(self):
        """返回独立迭代器"""
        a, b = 0, 1
        count = 0
        while count < self.n:
            yield a       # 用生成器简化
            a, b = b, a + b
            count += 1

print("前 10 个斐波那契数:")
for fib in Fibonacci(10):
    print(f"  {fib}", end=" ")
print()

# 可以反复迭代（因为有 __iter__）
print("再次迭代:")
for fib in Fibonacci(5):
    print(f"  {fib}", end=" ")
print()

# ---- 8. 文件对象是迭代器 ----
print("\\n========== 8. 文件对象是迭代器 ==========")

# 用 StringIO 模拟文件（避免依赖外部文件）
from io import StringIO

fake_file = StringIO("第一行\\n第二行\\n第三行\\n")
print(f"文件对象有 __next__? {hasattr(fake_file, '__next__')}")
print(f"文件对象是迭代器? {hasattr(fake_file, '__next__') and hasattr(fake_file, '__iter__')}")

print("逐行迭代文件:")
for line in fake_file:
    print(f"  {line.rstrip()!r}")

# ---- 9. 解包与迭代器 ----
print("\\n========== 9. 迭代器与解包 ==========")

# * 解包会消耗迭代器
first, *rest = iter([1, 2, 3, 4, 5])
print(f"first = {first}")
print(f"rest = {rest}")

# *rest 把剩余的都收进列表
first, second, *middle, last = iter([1, 2, 3, 4, 5, 6])
print(f"first={first}, second={second}, middle={middle}, last={last}")

# ---- 10. itertools 迭代器工具 ----
print("\\n========== 10. itertools 迭代器工具 ==========")

import itertools

# chain：拼接多个迭代器
print("chain([1,2], [3,4], [5]):", list(itertools.chain([1, 2], [3, 4], [5])))

# islice：切片
print("islice(range(10), 3, 7):", list(itertools.islice(range(10), 3, 7)))

# count：无限计数
print("count(10, 2) 取前 5 个:", list(itertools.islice(itertools.count(10, 2), 5)))

# cycle：循环
print("cycle('AB') 取前 6 个:", list(itertools.islice(itertools.cycle('AB'), 6)))

# combinations：组合
print("combinations('ABC', 2):", list(itertools.combinations('ABC', 2)))

# ---- 11. 迭代器工具函数 ----
print("\\n========== 11. 迭代器工具函数 ==========")

# sum/max/min 接受迭代器
print(f"sum(range(1, 101)) = {sum(range(1, 101))}")
print(f"max([3, 1, 4, 1, 5]) = {max([3, 1, 4, 1, 5])}")
print(f"any([False, True, False]) = {any([False, True, False])}")
print(f"all([True, True, False]) = {all([True, True, False])}")

# sorted 消耗迭代器，返回列表
print(f"sorted(map(lambda x: -x, [3, 1, 2])) = {sorted(map(lambda x: -x, [3, 1, 2]))}")

# ---- 12. 总结 ----
print("\\n========== 12. 迭代器协议总结 ==========")
print("""
迭代器协议核心要点:

1. 可迭代对象（Iterable）实现 __iter__
   - list/tuple/dict/set/str/range 都是

2. 迭代器（Iterator）实现 __iter__ + __next__
   - map/filter/zip/enumerate/文件对象 都是

3. for 循环的本质:
   iter(obj) → 循环 next() → 捕获 StopIteration

4. 迭代器只能前进，不能后退

5. 迭代器耗尽后无法复用（但可迭代对象可反复迭代）

6. range 不是迭代器，是可迭代对象

7. 迭代器是惰性的：按需计算，省内存

8. 处理大数据流用迭代器：
   - 文件逐行读
   - 网络流式处理
   - 数据库游标
""")

print("以上就是迭代器协议与 for 循环本质的核心知识！")
print("理解迭代器，你就理解了：")
print("  - for 循环到底在做什么")
print("  - 为什么 map/zip 只能遍历一次")
print("  - 如何用迭代器处理大文件")
print("  - 如何让自己的类支持 for 循环")
`,
  },

  // =========================================================
  // 第五章：生成器：会暂停的函数
  // =========================================================
  {
    id: "pyint-generator",
    group: "迭代器与生成器",
    icon: "🌱",
    title: "生成器：会暂停的函数",
    content: `## 生成器：会暂停的函数

普通函数一旦调用就一路执行到底，遇到 \`return\` 或结束才退出。但有一类特殊函数——**生成器函数**——能在中途"暂停"，下次再从暂停处继续执行。这种"会暂停的函数"是 Python 处理大数据流、协程、惰性计算的核心工具。

### 什么是生成器函数

含有 \`yield\` 关键字的函数就是生成器函数：

\`\`\`python
def count_up():
    yield 1
    yield 2
    yield 3

g = count_up()      # 不会立即执行！返回生成器对象
print(next(g))      # 1（执行到第一个 yield）
print(next(g))      # 2（从上次暂停处继续）
print(next(g))      # 3
print(next(g))      # StopIteration
\`\`\`

与普通函数的区别：

| 特性 | 普通函数 | 生成器函数 |
| --- | --- | --- |
| **关键字** | \`return\` | \`yield\` |
| **调用时** | 立即执行 | 不执行，返回生成器对象 |
| **执行方式** | 一路到底 | 遇 \`yield\` 暂停 |
| **返回值** | \`return\` 的值 | 生成器对象 |
| **状态** | 无状态 | 保留局部变量、指令位置 |

### 调用生成器函数不会执行

这是生成器最容易让人困惑的特性——**调用 \`count_up()\` 不会执行任何代码**，只是创建一个生成器对象：

\`\`\`python
def count_up():
    print("开始")
    yield 1
    print("继续")
    yield 2

g = count_up()      # 没有任何输出！
print(type(g))      # <class 'generator'>
\`\`\`

只有调用 \`next(g)\` 才会触发执行，遇到 \`yield\` 暂停并返回值。

### yield 暂停时保存了什么

当生成器在 \`yield\` 处暂停时，它保存了：

1. **当前指令位置**（下次从这继续）
2. **所有局部变量的值**
3. **try/except/finally 等执行栈的状态**
4. **被谁挂起**（等待 \`next\` 还是 \`send\`）

这些信息让生成器可以"暂停-恢复"，而普通函数一旦返回就丢失所有状态。

\`\`\`
生成器函数执行过程:

  def gen():
      x = 1
      yield x       ← 第一次 next，暂停在这里
      x += 1
      yield x       ← 第二次 next，暂停在这里
      x += 1
      yield x       ← 第三次 next，暂停在这里

  g = gen()        ← 创建生成器，未执行
  next(g) → 1      ← 执行到 yield 1，暂停
  next(g) → 2      ← 从上次暂停处继续，到 yield 2
  next(g) → 3      ← 继续，到 yield 3
  next(g) → StopIteration
\`\`\`

### 生成器是迭代器

生成器对象自动实现了迭代器协议（\`__iter__\` 和 \`__next__\`），所以可以用 \`for\` 循环：

\`\`\`python
def count_up():
    yield 1
    yield 2
    yield 3

for x in count_up():
    print(x)         # 1, 2, 3
\`\`\`

生成器本身就是迭代器，所以上一章讲的迭代器协议完全适用。

### send()：向生成器发送值

\`yield\` 不只能"产出"值，还能"接收"值——\`send()\` 方法可以向生成器发送数据：

\`\`\`python
def echo():
    while True:
        received = yield       # yield 把值送出，send 的值赋给 received
        print(f"收到: {received}")

g = echo()
next(g)              # 先"启动"生成器（执行到 yield）
g.send("hello")      # 把 "hello" 发给 yield，赋给 received
g.send("world")      # 把 "world" 发给 yield
\`\`\`

\`yield\` 是一个表达式，它可以：
- 向外产出值（\`yield x\`）
- 接收外部传入的值（\`x = yield\` 或 \`x = yield value\`）

这种双向通信让生成器成为**协程**的雏形。

### send() 的启动规则

\`send()\` 第一次调用前，必须先用 \`next(g)\` 或 \`g.send(None)\` 启动生成器，否则报错：

\`\`\`python
g = echo()
g.send("hello")     # TypeError: can't send non-None value to a just-started generator
\`\`\`

因为生成器还没执行到任何 \`yield\`，没法接收值。

### 生成器表达式

类似列表推导，但用圆括号的是**生成器表达式**：

\`\`\`python
squares_list = [x * x for x in range(10)]      # 列表推导，立即计算
squares_gen  = (x * x for x in range(10))      # 生成器表达式，惰性计算

print(next(squares_gen))   # 0
print(next(squares_gen))   # 1
\`\`\`

区别：

| 对比 | 列表推导 \`[]\` | 生成器表达式 \`()\` |
| --- | --- | --- |
| **类型** | \`list\` | \`generator\` |
| **内存** | 立即占用所有 | 几乎不占 |
| **能否反复迭代** | ✅ | ❌（一次性） |
| **能否索引** | ✅ | ❌ |
| **求值时机** | 立即 | 惰性 |

### 惰性计算：处理大数据流

生成器最大的用武之地是**流式处理大数据**：

\`\`\`python
def read_large_file(path):
    with open(path) as f:
        for line in f:
            yield line.strip()

# 处理 10GB 文件，内存只占几行
for line in read_large_file("huge.log"):
    if "ERROR" in line:
        process(line)
\`\`\`

如果用 \`return [all lines]\`，10GB 文件会撑爆内存。生成器逐行产出，内存占用恒定。

### 用生成器构建数据处理管道

生成器可以像管道一样串联：

\`\`\`python
def read_lines(path):
    with open(path) as f:
        yield from f          # 委托给文件迭代器

def strip(lines):
    for line in lines:
        yield line.strip()

def filter_errors(lines):
    for line in lines:
        if "ERROR" in line:
            yield line

# 三个生成器串联
pipeline = filter_errors(strip(read_lines("log.txt")))
for line in pipeline:
    print(line)
\`\`\`

每个生成器只做一件事，串联起来处理复杂流程。这种模式在数据清洗、ETL、日志分析中非常实用。

### yield from：委托给子生成器

\`yield from\` 把一个可迭代对象的值"逐个 yield 出来"：

\`\`\`python
def chain(*iterables):
    for it in iterables:
        yield from it          # 等价于 for x in it: yield x

list(chain([1, 2], [3, 4], [5]))
# [1, 2, 3, 4, 5]
\`\`\`

\`yield from\` 还会**透传 send/send/throw/close**，让子生成器也能接收消息。这是协程编程的基础。

### 协程的雏形：生成器的 send

Python 早期没有 \`async\`/\`await\`，开发者用生成器的 \`send\` 模拟协程：

\`\`\`python
def coroutine():
    while True:
        data = yield
        process(data)

c = coroutine()
next(c)                # 启动
c.send("data1")        # 发送数据
c.send("data2")
\`\`\`

Python 3.5+ 引入了 \`async\`/\`await\`，但底层依然基于类似生成器的机制（\`__await__\` 协议）。理解生成器的 \`send\` 有助于理解 \`async\`/\`await\`。

### 用 dis 看 yield 的字节码

\`\`\`python
import dis

def gen():
    x = 1
    yield x
    x += 1
    yield x

dis.dis(gen)
\`\`\`

关键字节码：

| 字节码 | 含义 |
| --- | --- |
| \`YIELD_VALUE\` | 暂停执行，把栈顶值返回给调用者 |
| \`RESUME\` | 恢复执行（Python 3.11+） |
| \`GEN_START\` | 初始化生成器（旧版） |
| \`GET_YIELD_FROM_ITER\` | 配合 \`yield from\` |

### 生成器的方法

| 方法 | 作用 |
| --- | --- |
| \`next(g)\` | 触发执行到下一个 \`yield\` |
| \`g.send(value)\` | 发送值给 \`yield\`，触发下一次执行 |
| \`g.close()\` | 关闭生成器，在 \`yield\` 处抛出 \`GeneratorExit\` |
| \`g.throw(exc)\` | 在 \`yield\` 处抛出指定异常 |

\`\`\`python
def gen():
    try:
        yield 1
        yield 2
    except RuntimeError:
        print("捕获到 throw 的异常")
        yield 3

g = gen()
next(g)                       # 1
g.throw(RuntimeError)         # 打印"捕获到 throw 的异常"，返回 3
\`\`\`

### 生成器 vs 普通函数的性能

生成器的好处不是"快"，而是"省内存"。但生成器也有开销：

\`\`\`python
# 列表推导（更快，但占内存）
sum([x * x for x in range(1000000)])

# 生成器表达式（省内存，但稍慢）
sum(x * x for x in range(1000000))
\`\`\`

对于求和、计数这种需要遍历所有值的场景，列表推导通常更快（因为生成器有暂停/恢复开销）。但数据量大到内存放不下时，生成器是唯一选择。

### 常见生成器模式

#### 模式 1：无限序列

\`\`\`python
import itertools
def naturals():
    n = 1
    while True:
        yield n
        n += 1

# 用 itertools.islice 取前 N 个
for x in itertools.islice(naturals(), 10):
    print(x)
\`\`\`

#### 模式 2：滑动窗口

\`\`\`python
def window(iterable, size):
    items = []
    for x in iterable:
        items.append(x)
        if len(items) == size:
            yield tuple(items)
            items.pop(0)
\`\`\`

#### 模式 3：递归生成器

\`\`\`python
def flatten(nested):
    for item in nested:
        if isinstance(item, list):
            yield from flatten(item)    # 递归
        else:
            yield item

list(flatten([1, [2, [3, 4], 5], 6]))
# [1, 2, 3, 4, 5, 6]
\`\`\`

### 生成器的内存优势对比

\`\`\`python
# 列表：100 万个值全部存在内存
big_list = [x * x for x in range(1_000_000)]
# 占用约 8MB 内存

# 生成器：100 万个值，几乎不占内存
big_gen = (x * x for x in range(1_000_000))
# 占用约 100 bytes
\`\`\`

处理大数据时，这种差异至关重要。

### 日常开发启示

1. **大文件用生成器逐行读**：\`for line in f:\` 比 \`f.readlines()\` 省内存
2. **大数据用生成器表达式**：\`sum(x for x in big_data)\` 比 \`sum([x for x in big_data])\` 省
3. **生成器只能遍历一次**：要反复用先 \`list()\` 转换
4. **\`yield from\` 简化嵌套**：替代 \`for x in sub: yield x\`
5. **协程理解的基础**：\`async\`/\`await\` 底层思想与生成器 \`send\` 类似
6. **生成器不是性能优化**：它的优势是省内存和惰性，不是速度
7. **构建数据管道**：多个生成器串联，每步只处理一个元素，内存恒定
8. **优先用生成器表达式而非列表推导**：除非需要反复迭代或按索引访问

### 本节代码演示

下面这段代码演示生成器的基本用法：\`yield\` 暂停机制、\`send()\` 双向通信、\`yield from\` 委托、生成器表达式与列表推导的对比。运行后你会对"会暂停的函数"有直观认识。`,
    code: `# ============================================================
# 第五章代码演示：生成器：会暂停的函数
# ============================================================
# 本代码演示生成器的核心机制：
#   - yield 暂停与恢复
#   - send() 双向通信
#   - yield from 委托子生成器
#   - 生成器表达式 vs 列表推导
#   - 用 dis 看 yield 字节码

import dis
import sys
import itertools

# ---- 1. 生成器的基本用法 ----
print("========== 1. 生成器基本用法 ==========")

def count_up():
    """一个简单的生成器函数"""
    print("  → 执行到 yield 1")
    yield 1
    print("  → 执行到 yield 2")
    yield 2
    print("  → 执行到 yield 3")
    yield 3
    print("  → 函数结束")

print("调用 count_up()（不会执行）:")
g = count_up()
print(f"  生成器对象: {g}")
print(f"  类型: {type(g).__name__}")

print("\\n调用 next(g) 触发执行:")
print(f"  next(g) = {next(g)}")   # 执行到 yield 1
print(f"  next(g) = {next(g)}")   # 从暂停处继续，到 yield 2
print(f"  next(g) = {next(g)}")   # 到 yield 3

print("\\n再调用 next(g)（没有更多 yield）:")
try:
    next(g)
except StopIteration:
    print("  → StopIteration（生成器结束）")

# ---- 2. 生成器是迭代器 ----
print("\\n========== 2. 生成器是迭代器 ==========")

def fibonacci(n):
    """生成前 n 个斐波那契数"""
    a, b = 0, 1
    count = 0
    while count < n:
        yield a
        a, b = b, a + b
        count += 1

print("前 10 个斐波那契数（用 for 循环）:")
for fib in fibonacci(10):
    print(f"  {fib}", end=" ")
print()

# 验证生成器是迭代器
g = fibonacci(3)
print(f"  有 __iter__? {hasattr(g, '__iter__')}")
print(f"  有 __next__? {hasattr(g, '__next__')}")
print(f"  __iter__ 返回自身? {g.__iter__() is g}")

# ---- 3. yield 保存局部变量状态 ----
print("\\n========== 3. yield 保存状态 ==========")

def counter_from(start):
    """生成器保留局部变量状态"""
    count = start
    while True:
        yield count
        count += 1           # 每次恢复后，count 还是上次的值

c = counter_from(100)
print(f"  next: {next(c)}")    # 100
print(f"  next: {next(c)}")    # 101
print(f"  next: {next(c)}")    # 102
# count 在生成器内部保留状态，不会丢失

# ---- 4. send() 双向通信 ----
print("\\n========== 4. send() 双向通信 ==========")

def echo():
    """接收 send 的值并返回"""
    while True:
        received = yield       # yield 接收 send 的值
        yield f"echo: {received}"   # 产出处理后的值

g = echo()
next(g)                        # 启动生成器，执行到第一个 yield
print(f"  send('hello') → {g.send('hello')}")
next(g)                        # 推进到下一个 yield（接收处）
print(f"  send('world') → {g.send('world')}")

# 更实用的例子：累加器
def accumulator():
    """累加器，接收数值并返回当前总和"""
    total = 0
    while True:
        value = yield total    # 返回当前总和，接收新值
        if value is None:
            break
        total += value

acc = accumulator()
next(acc)                       # 启动
print(f"  send(10) → {acc.send(10)}")    # 10
print(f"  send(20) → {acc.send(20)}")    # 30
print(f"  send(5)  → {acc.send(5)}")     # 35

# ---- 5. yield from 委托子生成器 ----
print("\\n========== 5. yield from 委托 ==========")

def sub_gen():
    """子生成器"""
    yield 1
    yield 2
    yield 3

def main_gen():
    """主生成器，委托给子生成器"""
    yield "start"
    yield from sub_gen()        # 等价于 for x in sub_gen(): yield x
    yield from [10, 20]        # 也能委托给普通可迭代对象
    yield "end"

print("main_gen 的输出:")
for x in main_gen():
    print(f"  {x}", end=" ")
print()

# 嵌套生成器：扁平化嵌套列表
def flatten(nested):
    """递归扁平化嵌套列表"""
    for item in nested:
        if isinstance(item, (list, tuple)):
            yield from flatten(item)    # 递归委托
        else:
            yield item

nested = [1, [2, [3, 4], 5], [6, [7, [8]]]]
print(f"\\n扁平化 {nested}:")
print(f"  结果: {list(flatten(nested))}")

# ---- 6. 生成器表达式 vs 列表推导 ----
print("\\n========== 6. 生成器表达式 vs 列表推导 ==========")

# 列表推导：立即计算，占内存
squares_list = [x * x for x in range(10)]
print(f"  列表推导: {squares_list}")
print(f"  类型: {type(squares_list).__name__}")
print(f"  内存: {sys.getsizeof(squares_list)} bytes")

# 生成器表达式：惰性计算，省内存
squares_gen = (x * x for x in range(10))
print(f"\\n  生成器表达式: {squares_gen}")
print(f"  类型: {type(squares_gen).__name__}")
print(f"  内存: {sys.getsizeof(squares_gen)} bytes")

# 逐个取值
print(f"  next: {next(squares_gen)}")   # 0
print(f"  next: {next(squares_gen)}")   # 1
print(f"  剩余: {list(squares_gen)}")    # 2, 3, ..., 9

# 内存对比（大规模）
big_list = [x * x for x in range(1_000_000)]
big_gen = (x * x for x in range(1_000_000))
print(f"\\n  100万个值:")
print(f"    列表内存: {sys.getsizeof(big_list)} bytes")
print(f"    生成器内存: {sys.getsizeof(big_gen)} bytes")
print(f"    比例: 列表是生成器的 {sys.getsizeof(big_list) // sys.getsizeof(big_gen)} 倍")

# ---- 7. 生成器构建数据管道 ----
print("\\n========== 7. 数据处理管道 ==========")

def numbers():
    """产生数字"""
    for i in range(1, 11):
        yield i

def square(nums):
    """平方"""
    for n in nums:
        yield n * n

def even(nums):
    """只保留偶数"""
    for n in nums:
        if n % 2 == 0:
            yield n

# 串联三个生成器
pipeline = even(square(numbers()))
print("even(square(numbers())):")
print(f"  结果: {list(pipeline)}")

# ---- 8. 无限序列 ----
print("\\n========== 8. 无限序列 ==========")

def naturals(start=1):
    """自然数无限序列"""
    n = start
    while True:
        yield n
        n += 1

# 用 islice 取前 N 个
print(f"自然数前 10 个: {list(itertools.islice(naturals(), 10))}")
print(f"从 100 开始前 5 个: {list(itertools.islice(naturals(100), 5))}")

# ---- 9. 生成器方法 close/throw ----
print("\\n========== 9. close() 和 throw() ==========")

def safe_gen():
    try:
        yield 1
        yield 2
        yield 3
    except RuntimeError as e:
        print(f"  捕获异常: {e}")
        yield 999
    finally:
        print("  生成器关闭")

g = safe_gen()
print(f"  next: {next(g)}")         # 1
print(f"  throw 后: {g.throw(RuntimeError('手动抛出'))}")   # 捕获后 yield 999

# close 的效果
g2 = safe_gen()
print(f"  next: {next(g2)}")        # 1
g2.close()                          # 触发 finally

# ---- 10. 用 dis 看 yield 字节码 ----
print("\\n========== 10. yield 的字节码 ==========")

def simple_gen():
    x = 1
    yield x
    x += 1
    yield x

print("simple_gen 的字节码:")
print("-" * 50)
dis.dis(simple_gen)
print("-" * 50)
print("说明: YIELD_VALUE 指令暂停执行，把值返回给调用者")

# ---- 11. 生成器函数 vs 普通函数 ----
print("\\n========== 11. 生成器 vs 普通函数 ==========")

# 普通函数：一次返回所有
def get_squares_list(n):
    result = []
    for i in range(n):
        result.append(i * i)
    return result

# 生成器函数：逐个产出
def get_squares_gen(n):
    for i in range(n):
        yield i * i

print("普通函数（一次返回所有）:")
lst = get_squares_list(5)
print(f"  {lst}")
print(f"  可以反复迭代: {lst}, {lst}")

print("\\n生成器函数（逐个产出）:")
gen = get_squares_gen(5)
print(f"  {list(gen)}")
print(f"  再次迭代: {list(gen)} (已耗尽)")

# ---- 12. 性能对比 ----
print("\\n========== 12. 性能对比 ==========")

import time

N = 1_000_000

# 列表推导
start = time.perf_counter()
total_list = sum([x * x for x in range(N)])
time_list = time.perf_counter() - start

# 生成器表达式
start = time.perf_counter()
total_gen = sum(x * x for x in range(N))
time_gen = time.perf_counter() - start

print(f"  计算 sum(x*x for x in range({N})):")
print(f"    列表推导:  结果={total_list}, 耗时={time_list:.4f}s")
print(f"    生成器:    结果={total_gen}, 耗时={time_gen:.4f}s")
if time_list < time_gen:
    print(f"    列表更快（生成器有暂停/恢复开销）")
else:
    print(f"    生成器更快")

# ---- 13. 实用：读大文件 ----
print("\\n========== 13. 模拟读大文件 ==========")

from io import StringIO

# 用 StringIO 模拟大文件
fake_lines = [f"line {i}\\n" for i in range(1, 6)]
fake_content = "".join(fake_lines)
fake_file = StringIO(fake_content)

def read_lines(file):
    """生成器：逐行读取文件"""
    for line in file:
        yield line.rstrip()

print("逐行读取（模拟）:")
for line in read_lines(fake_file):
    print(f"  {line!r}")

# ---- 14. 总结 ----
print("\\n========== 14. 生成器总结 ==========")
print("""
生成器核心要点:

1. 含 yield 的函数是生成器函数
   - 调用时不执行，返回生成器对象
   - next() 触发执行到 yield

2. yield 暂停时保存:
   - 指令位置
   - 局部变量
   - 执行栈状态

3. 生成器是迭代器
   - 实现 __iter__ 和 __next__
   - 可用 for 循环遍历

4. send() 双向通信
   - yield 能产出值，也能接收值
   - 第一次 send 前要 next() 启动

5. yield from 委托子生成器
   - 简化嵌套 yield
   - 透传 send/throw/close

6. 生成器表达式 (x for x in ...)
   - 惰性计算，省内存
   - 只能遍历一次

7. 适用场景:
   - 大文件逐行处理
   - 数据管道串联
   - 无限序列
   - 流式数据处理
""")

print("以上就是生成器原理的核心知识！")
print("理解生成器，你就理解了：")
print("  - yield 如何暂停和恢复")
print("  - send 如何双向通信")
print("  - 生成器如何省内存")
print("  - async/await 的底层思想")
`,
  },
];

