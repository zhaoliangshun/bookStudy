// =============================================================
// Python vs Java 深度对比 —— 第 4 批
// -------------------------------------------------------------
// 转义规则：content 内部反引号写作 \`，${ 写作 \$\{
// =============================================================

export const chapters = [
  {
    id: "pyvsjava-interpreter",
    icon: "⚙️",
    title: "解释器架构：CPython vs JVM",
    group: "运行时与底层",
    content: `# 解释器架构：CPython vs JVM

## 一、两种截然不同的"虚拟机"

Python 和 Java 都不直接编译成机器码运行，而是各自拥有一台"虚拟机"——但这两台虚拟机的设计哲学、实现细节、性能特征几乎完全相反。

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│              CPython 架构（树遍历 + 字节码循环）              │
├─────────────────────────────────────────────────────────────┤
│  源码 .py → 编译器 → 字节码 .pyc → CPython 字节码循环执行     │
│                                          ↑                   │
│                            一个大的 switch-case 解释每条指令  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              JVM 架构（字节码 + JIT 编译）                    │
├─────────────────────────────────────────────────────────────┤
│  源码 .java → javac → 字节码 .class                          │
│                  → 类加载器 → 字节码验证器 → 执行引擎         │
│                                            ↑                 │
│                          解释器 + JIT 编译器（C1/C2）协同工作 │
└─────────────────────────────────────────────────────────────┘
\`\`\`

CPython 是一个**经典的树遍历字节码解释器**——它把源码编译成字节码，然后用一个巨大的 \`switch-case\` 循环逐条解释执行。这个循环没有任何 JIT（Just-In-Time）优化（直到 3.13 才加入实验性 JIT），每条字节码指令都要经过完整的"取指-译码-执行"过程。

JVM 则是一个**混合执行引擎**——它先解释执行字节码，当某个方法被频繁调用（"热点"）时，JIT 编译器会把它编译成高度优化的本地机器码。这种"解释 + 编译"的混合模式让 Java 既有快速启动，又能达到接近 C++ 的峰值性能。

## 二、CPython 的内部架构

CPython 的核心可以拆成两部分：**编译器**和**字节码虚拟机**。

### 1. 编译器：源码 → 字节码

CPython 的编译器不是一个独立工具，而是**嵌入在解释器内部**的。每次执行 .py 文件时（或导入模块时），编译器都会先把源码翻译成字节码：

\`\`\`
源码 .py
   ↓ 词法分析（tokenizer）
Token 流
   ↓ 语法分析（parser）
AST（抽象语法树）
   ↓ 编译器（compile.c）
字节码（Code Object）
   ↓ 序列化
.pyc 文件（缓存在 __pycache__）
\`\`\`

\`\`\`python
# 用 dis 模块查看 Python 字节码
import dis

def add(a, b):
    return a + b

dis.dis(add)
\`\`\`

输出：

\`\`\`
  2           0 RESUME                   0

  3           2 LOAD_FAST                0 (a)
              4 LOAD_FAST                1 (b)
              6 BINARY_OP                0 (+)
             10 RETURN_VALUE
\`\`\`

可以看到，Python 的字节码是**栈式**的（LOAD_FAST 把局部变量压栈，BINARY_OP 从栈顶取两个数相加）。每条指令都很"高级"——比如 \`BINARY_OP\` 一次完成加法，但内部还要做类型检查、运算符重载查找等大量工作。

### 2. 字节码虚拟机：eval 循环

CPython 的核心是一个叫 \`ceval.c\` 的文件，里面有一个巨大的 \`switch-case\` 结构——这就是字节码虚拟机的"主循环"：

\`\`\`c
// 简化的 ceval 主循环（伪代码）
for (;;) {
    opcode = *next_instr++;  // 取下一条指令
    switch (opcode) {
        case LOAD_FAST:
            // 从局部变量数组压栈
            PUSH(frame->locals[oparg]);
            break;
        case BINARY_ADD:
            // 从栈顶取两个对象，调用 __add__
            right = POP();
            left = POP();
            PUSH(PyNumber_Add(left, right));
            break;
        case RETURN_VALUE:
            return POP();
        // ... 几百个 case
    }
}
\`\`\`

这个循环的**致命问题**是：

1. **每条指令都要 dispatch**：即使是简单的 \`a + b\`，也要经过 LOAD_FAST、LOAD_FAST、BINARY_OP、RETURN_VALUE 四次 dispatch。每次 dispatch 都是一个 switch 跳转，CPU 分支预测难以命中。
2. **类型检查在运行时**：\`PyNumber_Add\` 内部要先检查对象类型，决定走 int 加法、float 加法、还是字符串拼接、还是调用 \`__add__\` 方法。这个检查在 Java 里是编译期完成的。
3. **对象模型开销**：Python 的 int 是一个 \`PyObject\`（16+ 字节），Java 的 int 是 4 字节直接存值（除非装箱）。

### 3. 为什么 CPython 这么慢

\`\`\`
Python 慢的根源（按影响排序）：
1. 解释执行（无 JIT 优化）         ~10-50x
2. 动态类型（每次运算都查类型）    ~3-5x
3. 对象模型（一切皆对象，引用计数） ~2-3x
4. GIL（多核利用受限）              视场景

合计：典型 Python 代码比 Java 慢 10-100 倍
\`\`\`

## 三、JVM 的内部架构

JVM 的架构复杂得多，核心组件包括：**类加载器**、**字节码验证器**、**执行引擎**（解释器 + JIT）。

### 1. 类加载器：按需加载

Java 的字节码不是一次性全部加载的，而是**按需加载**——用到哪个类才加载哪个类：

\`\`\`
类加载流程：
1. 加载（Loading）：从 .class 文件或网络读取字节流，生成 Class 对象
2. 链接（Linking）：
   a. 验证（Verification）：检查字节码合法性，防止恶意代码
   b. 准备（Preparation）：为静态字段分配内存，赋默认值
   c. 解析（Resolution）：常量池中的符号引用 → 直接引用
3. 初始化（Initialization）：执行 <clinit> 静态代码块
\`\`\`

Java 有一个**双亲委派模型**——类加载请求先委托给父加载器，父加载器加载不了才自己加载：

\`\`\`
类加载器层级：
Bootstrap ClassLoader（加载 rt.jar，JDK 核心类）
       ↑ 委派
Extension ClassLoader（加载 ext 目录）
       ↑ 委派
Application ClassLoader（加载 classpath）
       ↑ 委派
自定义 ClassLoader（用户自定义）
\`\`\`

这个模型保证了**核心类不会被恶意替换**——比如你自己写一个 \`java.lang.String\`，会被 Bootstrap 加载器拒绝。

### 2. 字节码验证器：安全第一

Java 字节码在执行前要经过**严格验证**——这是 Java 安全模型的核心：

\`\`\`
字节码验证检查项：
- 操作数栈不会溢出/下溢
- 方法参数类型匹配
- 跳转指令不会跳到非法位置
- 没有非法的类型转换
- 变量在赋值前不被使用

这种"运行前验证"让 Java 比 C 安全（不会 buffer overflow），
也比 Python 严谨（Python 不验证字节码）
\`\`\`

### 3. 执行引擎：解释器 + JIT

JVM 的执行引擎是**两级结构**：

\`\`\`
字节码执行流程：
1. 解释器先执行所有字节码（启动快）
2. 方法被调用次数超过阈值（默认 10000）→ 标记为"热点"
3. 热点方法交给 JIT 编译器：
   - C1 编译器（Client）：快速编译，简单优化
   - C2 编译器（Server）：慢速编译，激进优化（逃逸分析、内联）
4. JIT 编译后的机器码缓存，下次直接执行
5. 如果假设不成立（如类型推断错误），触发"逆优化"回退到解释器
\`\`\`

## 四、字节码格式对比

### Python 字节码（.pyc）

\`\`\`python
# Python 3.12 的字节码是 16-bit 指令（每条 2 字节）
# 操作码 8 bit + 操作数 8 bit（或扩展为 32 bit）

import dis
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

dis.dis(factorial)
\`\`\`

输出：

\`\`\`
  2           0 RESUME                   0

  3           2 LOAD_FAST                0 (n)
              4 LOAD_CONST               1 (1)
              6 COMPARE_OP               1 (<=)
             10 POP_JUMP_FORWARD_IF_FALSE    10 (to 24)

  4          12 LOAD_CONST               1 (1)
             14 RETURN_VALUE

  5         16 LOAD_FAST                0 (n)
             18 LOAD_GLOBAL              1 (factorial)
             20 LOAD_FAST                0 (n)
             22 LOAD_CONST               1 (1)
             24 BINARY_OP                10 (-)
             26 CALL                     1
             28 BINARY_OP                 5 (*)
             30 RETURN_VALUE
\`\`\`

特点：
- **指令数多**：一个简单的递归函数有十几条指令
- **指令高级**：\`COMPARE_OP\`、\`CALL\` 都是"大粒度"操作
- **无类型信息**：字节码不知道变量是 int 还是 str

### Java 字节码（.class）

\`\`\`bash
# 用 javap -c 反汇编
javap -c Factorial
\`\`\`

\`\`\`java
public class Factorial {
    public static int factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }
}
\`\`\`

反汇编结果：

\`\`\`
public static int factorial(int);
  Code:
     0: iload_0              // 加载 int 参数 n
     1: iconst_1             // 压入常量 1
     2: if_icmpgt     7      // 如果 n > 1，跳到 7
     5: iconst_1             // 压入 1
     6: ireturn              // 返回 int

     7: iload_0              // 加载 n
     8: iload_0              // 再次加载 n
     9: iconst_1             // 压入 1
    10: isub                 // int 减法
    11: invokestatic #2      // 调用 factorial(int)
    14: imul                 // int 乘法
    15: ireturn              // 返回
\`\`\`

特点：
- **指令数少**：相比 Python 指令更紧凑
- **指令低级**：\`iload\`、\`isub\`、\`imul\` 都是针对 int 的具体操作
- **类型明确**：\`iload\` 是 int 加载，\`fload\` 是 float 加载，\`aload\` 是引用加载
- **栈式**：和 Python 一样是栈式虚拟机

### 字节码格式对比表

| 维度 | Python (.pyc) | Java (.class) |
|------|---------------|---------------|
| 指令长度 | 16-bit（3.6+） | 8-bit（可扩展） |
| 指令数量 | ~120 个 | ~200 个 |
| 类型信息 | 无（动态类型） | 有（iload/fload/aload） |
| 验证机制 | 无 | 字节码验证器 |
| 文件格式 | 自定义二进制 | 严格的 .class 规范 |
| 加载方式 | 模块导入时 | 类加载器按需 |
| 缓存机制 | __pycache__ | 永久 .class 文件 |
| 安全性 | 无沙箱 | 安全管理器（已弃用）/模块封装 |

## 五、为什么 Java 比 Python 快

\`\`\`
Java 比 Python 快的根源（按贡献排序）：

1. JIT 编译（HotSpot C1/C2）
   - 热点方法编译为机器码，避免 dispatch 开销
   - 逃逸分析：对象可栈上分配，减少堆压力
   - 方法内联：消除方法调用开销
   - 死代码消除：移除不可达代码
   贡献：~10-30x

2. 静态类型
   - 编译期确定类型，运行时无需类型检查
   - 字段访问直接是内存偏移，无需哈希查找
   贡献：~3-5x

3. 对象模型
   - 基本类型直接存值（int 是 4 字节，不是对象）
   - 对象头紧凑（12-16 字节，比 PyObject 小）
   - 无引用计数开销（GC 独立处理）
   贡献：~2-3x

4. 逃逸分析与标量替换
   - 短生命周期对象不进堆，栈上分配
   - 对象字段拆解为局部变量
   贡献：~1.5-2x

总计：典型 Java 代码比 Python 快 10-100 倍
\`\`\`

### Java JIT 优化的具体例子

\`\`\`java
// Java 源码
public int sum(int n) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        total += i;
    }
    return total;
}
\`\`\`

JIT 编译后，C2 编译器会发现这个循环可以**数学化简**：

\`\`\`java
// JIT 优化后的等价代码
public int sum(int n) {
    return (n * (n - 1)) / 2;  // 循环变成等差数列求和
}
\`\`\`

这种激进优化 Python 解释器根本做不到——因为它不知道 n 是 int（可能是任意类型），也不知道循环体不会被重写（动态语言的特征）。

## 六、Python 3.13 的实验性 JIT

Python 3.13（2024.10）引入了一个**实验性 JIT 编译器**，这是一个里程碑式的变化：

\`\`\`
Python 3.13 JIT 特点：
- 基于"复制与补丁"（copy-and-patch）技术
- 不是 HotSpot 式的方法级 JIT，而是按指令块编译
- 默认关闭，需要 PYTHON_JIT=1 环境变量开启
- 当前性能提升有限（5-10%），但为未来铺路
\`\`\`

\`\`\`python
# 启用实验性 JIT
import os
os.environ["PYTHON_JIT"] = "1"  # 实际上需要在启动前设置

# 或者命令行
# PYTHON_JIT=1 python script.py
\`\`\`

这是 Python 第一次拥有"真正的 JIT"（之前的 PyPy 是另一个实现，不是 CPython）。但即使有了 JIT，Python 的动态类型仍然限制了优化空间——JIT 不知道下一条 \`+\` 操作是 int 加法还是字符串拼接，必须保留运行时检查。

## 七、PyPy：另一个 Python 实现

提到 Python 的性能，绕不开 **PyPy**——一个用 RPython 写的、带 JIT 的 Python 实现：

\`\`\`
PyPy vs CPython：
- PyPy 有 JIT（tracing JIT），比 CPython 快 4-5 倍
- PyPy 兼容 CPython 大部分语法和标准库
- 但 PyPy 的 C 扩展兼容性差（NumPy 等大库支持有限）
- CPython 仍是"官方"实现，PyPy 是"替代品"

为什么 PyPy 没能取代 CPython？
1. C 扩展生态绑死在 CPython API 上
2. PyPy 启动慢（JIT 预热）
3. 数据科学库（NumPy/Pandas）原生支持 CPython
\`\`\`

## 八、架构对比总结表

| 维度 | CPython | JVM (HotSpot) |
|------|---------|---------------|
| 类型 | 树遍历字节码解释器 | 栈式字节码 + JIT |
| JIT | 实验性（3.13+） | 成熟（C1/C2 分层编译） |
| 编译时机 | 运行时（导入时） | 运行时（热点方法） |
| 字节码验证 | 无 | 严格 |
| 类加载 | 模块导入 | 双亲委派 |
| 性能 | 基准 1x | 10-100x |
| 启动速度 | 快 | 慢（JIT 预热） |
| 峰值性能 | 慢 | 接近 C++ |
| 内存占用 | 低 | 高 |
| 调试性 | 好（字节码简单） | 复杂（JIT 优化） |

## 九、一句话总结

- **CPython** 是一个简洁、易实现、易调试的字节码解释器，但牺牲了性能——它的"慢"是设计选择，不是 bug。
- **JVM** 是一个高度复杂的执行引擎，用 JIT、逃逸分析、内联等手段把性能榨干，但代价是启动慢、内存大、实现复杂。

JVM 的架构决定了 Java 适合"长期运行的服务端应用"，CPython 的架构决定了 Python 适合"快速开发、短生命周期任务"。

---

> **下一章**：解释器架构决定了执行模型，下一章我们看完整的执行流水线——从源码到运行的每一步。`,
  },
  {
    id: "pyvsjava-execution",
    icon: "🔄",
    title: "执行流水线：从源码到运行",
    group: "运行时与底层",
    content: `# 执行流水线：从源码到运行

## 一、两条截然不同的流水线

代码从"文本"变成"运行结果"的过程，叫做执行流水线。Python 和 Java 的流水线看起来相似（都是"源码 → 字节码 → 执行"），但每一步的时机、方式、产物都不同。

\`\`\`
Python 执行流水线：
┌──────┐  ┌──────┐  ┌────────┐  ┌──────────┐  ┌─────────┐
│ .py  │→│ 词法  │→│ 语法   │→│ 编译器    │→│ 字节码   │
│ 源码 │  │ 分析  │  │ 分析   │  │ (compile) │  │ (.pyc)  │
└──────┘  └──────┘  └──────┘  └──────────┘  └────┬────┘
                                                   ↓
┌──────────────────────────────────────────┐  ┌─────────┐
│ CPython 字节码循环（无 JIT，3.13 实验性） │←│ 加载执行 │
└──────────────────────────────────────────┘  └─────────┘

Java 执行流水线：
┌──────┐  ┌──────┐  ┌──────┐  ┌────────┐  ┌──────────┐
│ .java│→│ 词法  │→│ 语法 │→│ 语义   │→│ 字节码    │
│ 源码 │  │ 分析  │  │ 分析 │  │ 分析   │  │ (.class) │
└──────┘  └──────┘  └──────┘  └────────┘  └────┬─────┘
        ↑ javac 编译器（独立工具，开发期执行）   ↓
                                                  │
┌────────────────────────────────────────┐        │
│ 类加载器 → 字节码验证 → 执行引擎        │←───────┘
│   ↓           ↓           ↓            │
│ 加载         验证      解释器 + JIT     │
└────────────────────────────────────────┘
\`\`\`

关键差异：

1. **编译时机**：Python 在"运行时"编译（执行 .py 时才编译）；Java 在"开发时"编译（javac 是独立步骤）
2. **JIT**：Java 有成熟的 JIT，Python 几乎没有（3.13 才实验性引入）
3. **预热期**：Java 启动慢但越跑越快；Python 启动快但越跑也不快

## 二、Python 的执行流水线详解

### 1. 第一步：词法分析（Tokenization）

\`\`\`python
# 源码
x = 1 + 2
\`\`\`

词法分析器把这行代码拆成 Token：

\`\`\`
Token 流：
NAME    'x'
EQUAL   '='
NUMBER  '1'
PLUS    '+'
NUMBER  '2'
NEWLINE '\\n'
\`\`\`

\`\`\`python
# Python 提供了 tokenizer 模块，可以查看
import tokenize
import io

code = "x = 1 + 2"
for tok in tokenize.generate_tokens(io.StringIO(code).readline):
    print(tok)
\`\`\`

### 2. 第二步：语法分析（Parsing）

Token 流被解析成 **AST（抽象语法树）**：

\`\`\`python
import ast
print(ast.dump(ast.parse("x = 1 + 2")))
\`\`\`

输出：

\`\`\`
Module(body=[Assign(targets=[Name(id='x', ctx=Store())],
          value=BinOp(left=Constant(value=1), op=Add(),
                      right=Constant(value=2)), type_comment=None)],
      type_ignores=[])
\`\`\`

AST 的结构：
\`\`\`
Assign
├── targets: [Name(x)]
└── value: BinOp(+)
          ├── left: Constant(1)
          └── right: Constant(2)
\`\`\`

### 3. 第三步：编译为字节码

AST 被编译成字节码（Code Object）：

\`\`\`python
code = compile("x = 1 + 2", "<string>", "exec")
print(code.co_code)        # 字节码字节流
print(code.co_consts)      # 常量池
\`\`\`

### 4. 第四步：缓存为 .pyc

为了加速下次导入，Python 会把字节码缓存到 \`__pycache__\` 目录：

\`\`\`
my_package/
├── __init__.py
├── module.py
└── __pycache__/
    └── module.cpython-312.pyc   ← 字节码缓存
\`\`\`

.pyc 文件包含：
- 魔数（标识 Python 版本，3.12 的 .pyc 不能在 3.13 用）
- 源文件修改时间（用于判断是否需要重新编译）
- 字节码
- 常量池

\`\`\`python
# Python 通过比较 mtime 判断是否重新编译
import os
src_mtime = os.path.getmtime("module.py")
pyc_mtime = ...  # 从 .pyc 读取
if src_mtime > pyc_mtime:
    recompile()  # 源码变了，重新编译
\`\`\`

### 5. 第五步：执行

字节码被加载到 CPython 的 eval 循环执行：

\`\`\`
执行流程：
1. 创建 Frame 对象（保存局部变量、操作数栈、指令指针）
2. 进入 ceval.c 的主循环
3. 逐条取出字节码，switch-case 分发执行
4. 执行完毕，销毁 Frame，返回结果
\`\`\`

## 三、Java 的执行流水线详解

### 1. 第一步：javac 编译（开发期）

Java 的编译是**显式的、独立的步骤**：

\`\`\`bash
# 命令行编译
javac Main.java          # 生成 Main.class
java Main                # 运行
\`\`\`

javac 的流水线：

\`\`\`
.java 源码
   ↓ 词法分析
Token 流
   ↓ 语法分析
AST
   ↓ 语义分析（类型检查、注解处理）
   ↓ 生成字节码
.class 文件
\`\`\`

注意：**javac 不做任何优化**！所有的优化都交给 JVM 的 JIT 编译器在运行时做。这是 Java 的设计哲学——编译器保持简单，优化在运行时根据实际行为做。

\`\`\`java
// 即使是这种"显然可以优化"的代码
public class Demo {
    public static void main(String[] args) {
        int x = 1 + 2;  // javac 会编译成 ICONST_1 ICONST_2 IADD（常量折叠是有的）
        System.out.println(x);
    }
}
\`\`\`

实际上 javac 会做少量"常量折叠"（编译期计算常量表达式），但循环展开、方法内联、逃逸分析这些大头优化都是 JIT 做的。

### 2. 第二步：类加载（运行期）

\`\`\`bash
java Main
\`\`\`

JVM 启动时：

1. **Bootstrap 类加载器**加载 \`rt.jar\`（核心类，如 java.lang.\*）
2. 找到 \`Main\` 类的 main 方法
3. **Application 类加载器**加载 \`Main.class\`
4. 字节码验证器检查 Main.class 的合法性
5. 准备阶段：为静态字段分配内存
6. 初始化阶段：执行 static 代码块

### 3. 第三步：解释执行 + JIT 编译

JVM 启动时，所有方法都走**解释器**（模板解释器，比 CPython 的 switch 快）。当方法被频繁调用，触发 JIT 编译：

\`\`\`
方法调用计数器：
- 方法调用次数累加
- 超过阈值（默认 10000）→ 标记为热点
- 后台线程编译该方法
\`\`\`

HotSpot 的**分层编译**（Tiered Compilation）：

\`\`\`
第 0 层：解释器（启动时所有方法走这里）
第 1 层：C1 编译，带 profiling（收集类型、分支信息）
第 2 层：C1 编译，不带 profiling
第 3 层：C1 编译，完整 profiling
第 4 层：C2 编译（激进优化，基于 profiling 数据）

典型路径：0 → 3 → 4
\`\`\`

## 四、JIT 编译的优化

### 1. 方法内联（Method Inlining）

\`\`\`java
// 源码
public int calc(int x) {
    return x + helper(x);
}

private int helper(int x) {
    return x * 2;
}
\`\`\`

JIT 内联后：

\`\`\`java
// 等价于
public int calc(int x) {
    return x + x * 2;  // helper 被内联，消除方法调用开销
}
\`\`\`

方法内联是"优化之母"——它消除了方法调用开销，更重要的是为后续优化（如死代码消除、循环展开）打开空间。Java 的小方法会被激进内联，而 Python 的方法调用开销很大（每次都要查 \`__dict__\`）。

### 2. 逃逸分析（Escape Analysis）

\`\`\`java
public int sum() {
    Point p = new Point(1, 2);  // p 不会"逃逸"出方法
    return p.x + p.y;
}
\`\`\`

JIT 分析发现 \`p\` 不会逃逸（不会被返回、不会被存到字段），于是：

- **栈上分配**：p 不进堆，避免 GC 压力
- **标量替换**：p 被拆成两个局部变量 p_x、p_y

\`\`\`java
// 等价于（无对象创建）
public int sum() {
    int p_x = 1;
    int p_y = 2;
    return p_x + p_y;
}
\`\`\`

Python 无法做这种优化——因为 Python 的对象**可能**逃逸（动态语言，无法静态分析），而且 \`Point\` 的 \`__init__\` 可能被重写。

### 3. 循环展开

\`\`\`java
// 源码
for (int i = 0; i < 4; i++) {
    arr[i] = i * 2;
}
\`\`\`

JIT 展开后：

\`\`\`java
// 等价于（消除循环开销）
arr[0] = 0;
arr[1] = 2;
arr[2] = 4;
arr[3] = 6;
\`\`\`

### 4. 分支预测优化

\`\`\`java
// 源码
if (obj instanceof String) {
    // 走 String 分支
} else {
    // 走其他分支
}
\`\`\`

JIT 收集 profiling 数据，发现 99% 的情况走 String 分支，于是**激进优化**：只编译 String 分支，假设 else 不会进。如果真的进了 else，触发"逆优化"回退到解释器。

## 五、预热期：Java 冷启动的痛

JIT 的代价是**预热期**——程序刚启动时，所有方法走解释器，性能差：

\`\`\`
Java 程序性能随时间变化：
性能
  ↑                    ┌─────────────  JIT 编译后峰值
  │                   /
  │                  /
  │                 /
  │                /
  │               /
  │              /
  │             /
  │            /
  │           /
  │          /
  │         /
  │        /
  │       /  ← JIT 编译开始
  │      /
  │     /
  │    /
  │   /  ← 启动，纯解释器
  │  /
  │ /
  └─────────────────────────────→ 时间
       预热期（秒级到分钟级）
\`\`\`

这就是为什么 Java 不适合 **Serverless / FaaS** 场景——每次冷启动都要重新预热，延迟不可接受。

\`\`\`
Serverless 场景对比：
- Python（无预热）：启动 100ms，立即处理请求
- Java（需预热）：启动 2-5s，前几百个请求慢
- Java + GraalVM Native Image：启动 50ms（AOT 编译，无预热）
\`\`\`

## 六、GraalVM Native Image：AOT 编译

为了解决 Java 启动慢的问题，Oracle 推出了 **GraalVM Native Image**——把 Java 程序**提前编译**（AOT）成原生可执行文件：

\`\`\`bash
# 传统 Java
javac App.java
java App              # 启动慢，需 JVM

# GraalVM Native Image
javac App.java
native-image App      # AOT 编译，生成原生可执行文件
./app                 # 启动极快（毫秒级），无需 JVM
\`\`\`

\`\`\`
Native Image 的权衡：
✅ 启动极快（毫秒级，比 Python 还快）
✅ 内存占用低（无需 JVM）
✅ 适合 Serverless / CLI 工具
❌ 峰值性能不如 JIT（AOT 无法做激进优化，因为缺乏 profiling）
❌ 编译时间长（分钟级）
❌ 反射受限（需配置 reflect-config.json）
❌ 动态类加载不支持
\`\`\`

\`\`\`java
// 普通Java：反射随便用
Class<?> clazz = Class.forName("com.example.User");
Object obj = clazz.getDeclaredConstructor().newInstance();

// Native Image：必须预先声明反射配置
// reflect-config.json:
// {"name":"com.example.User","methods":[{"name":"<init>"}]}
\`\`\`

## 七、Python 的 .pyc 缓存机制

Python 的 .pyc 缓存解决的是"重复导入"的性能问题：

\`\`\`python
# 第一次导入：编译源码，生成 .pyc
import my_module  # 慢：词法分析 → 语法分析 → 编译 → 执行

# 第二次导入（同进程）：直接用内存中的模块对象
import my_module  # 快：sys.modules 缓存命中

# 重启进程后导入：检查 .pyc，命中则直接加载
import my_module  # 较快：跳过编译，直接反序列化字节码
\`\`\`

.pyc 缓存的失效规则：

\`\`\`
.pyc 失效条件（任一满足即重新编译）：
1. 源文件 mtime 比 .pyc 新
2. 源文件大小变化
3. Python 版本不匹配（魔数不同）
4. .pyc 文件损坏

注意：Python 不会因为"代码内容相同"就跳过编译，
而是基于文件元数据（mtime/size）判断
\`\`\`

对比 Java 的 .class：
- Java 的 .class 是**永久产物**，开发期生成，部署到生产环境
- Python 的 .pyc 是**缓存产物**，运行期生成，可随时删除（删除后会重新生成）

这意味着 Java 部署的是 .class（不依赖 .java），而 Python 部署的通常是 .py（.pyc 只是加速缓存）。

## 八、流水线对比表

| 维度 | Python | Java |
|------|--------|------|
| 编译时机 | 运行时（导入时） | 开发时（javac） |
| 编译器位置 | 嵌入解释器 | 独立工具 |
| 编译产物 | .pyc（缓存） | .class（永久） |
| 部署单位 | .py（源码） | .class 或 .jar |
| JIT | 实验性（3.13） | 成熟（C1/C2） |
| AOT | 无（PyPy 也没有） | GraalVM Native Image |
| 预热期 | 无 | 有（秒到分钟） |
| 启动速度 | 快（~100ms） | 慢（~1-5s） |
| 峰值性能 | 慢 | 快（接近 C++） |
| 编译优化 | 几乎无 | 内联、逃逸分析、循环展开 |
| 字节码缓存 | .pyc（自动） | .class（手动 javac） |

## 九、Python 的"快速启动"为什么重要

Python 的"无预热、启动快"在很多场景是巨大优势：

\`\`\`
Python 启动快的应用场景：
1. CLI 工具：用户敲命令立即响应
2. 脚本：cron 定时任务，启动开销小
3. Serverless：冷启动快，FaaS 友好
4. 数据分析：Jupyter 交互式，立即出结果
5. 测试：跑单元测试快

Java 启动慢的痛点：
1. CLI 工具：敲个命令等 2 秒，体验差
2. 微服务：部署扩容慢
3. Serverless：冷启动延迟高
4. 开发反馈循环：改一行代码，重启 10 秒
\`\`\`

这就是为什么 Gradle（Java 构建工具） daemon 模式会常驻——避免每次构建都重启 JVM。

## 十、一句话总结

- **Python** 的流水线是"运行时编译 + 解释执行"，启动快但峰值慢，适合脚本和短生命周期任务。
- **Java** 的流水线是"开发时编译 + 运行时 JIT"，启动慢但峰值快，适合长期运行的服务端应用。

GraalVM Native Image 正在弥合这个差距——让 Java 也能"启动快"，但代价是失去 JIT 的峰值优化。Python 的实验性 JIT 也在尝试另一条路——让 Python 也能"跑得快"，但动态类型限制了优化空间。

---

> **下一章**：执行流水线决定了代码怎么跑，下一章深入内存模型——Python 和 Java 如何组织对象、管理内存。`,
  },
  {
    id: "pyvsjava-memory",
    icon: "💾",
    title: "内存模型",
    group: "运行时与底层",
    content: `# 内存模型

## 一、对象模型：一切皆对象 vs 基本类型与对象并存

Python 和 Java 都号称"面向对象"，但底层的对象模型截然不同——这直接决定了内存占用、性能、并发模型。

### Python：一切皆对象（包括数字）

Python 的核心设计是**一切皆对象**——整数、浮点数、函数、类、模块，全是对象。每个对象在内存中是一个 \`PyObject\` 结构：

\`\`\`c
// CPython 的 PyObject 结构（简化）
typedef struct _object {
    Py_ssize_t ob_refcnt;     // 引用计数（8 字节）
    PyTypeObject *ob_type;    // 类型指针（8 字节）
    // ... 实际数据
} PyObject;

// int 对象的完整结构
typedef struct {
    PyObject_HEAD              // ob_refcnt + ob_type = 16 字节
    Py_ssize_t ob_size;        // 数组长度（变长整数）
    digit ob_digit[1];         // 实际数字（30 位为一组）
} PyLongObject;
\`\`\`

这意味着：

\`\`\`python
# Python：连整数都是对象
x = 42
# x 实际上是一个指针，指向一个 PyLongObject
# 这个对象在内存中至少占 28 字节（16 头 + 8 长度 + 4 数字）
# 而 C 语言的 int 只占 4 字节！
\`\`\`

\`\`\`
Python 对象内存布局：
┌────────────────────────┐
│ ob_refcnt (8 字节)      │ ← 引用计数
├────────────────────────┤
│ ob_type  (8 字节)       │ ← 指向类型对象
├────────────────────────┤
│ ob_size  (8 字节)       │ ← 数字位数
├────────────────────────┤
│ ob_digit (4+ 字节)      │ ← 实际数值
└────────────────────────┘
总计：28+ 字节（C 的 int 只要 4 字节）
\`\`\`

### Java：基本类型 vs 引用类型

Java 走了一条折中路线——**基本类型直接存值，引用类型是堆上的对象**：

\`\`\`java
// Java：基本类型直接存值
int x = 42;        // x 就是 4 字节的 int，不是对象
double d = 3.14;   // d 就是 8 字节的 double
boolean b = true;  // 1 字节

// 引用类型：对象在堆上，变量存引用
String s = "hello";          // s 存指向 String 对象的引用
List<Integer> list = new ArrayList<>();  // list 存指向 ArrayList 的引用
\`\`\`

\`\`\`
Java 对象内存布局（64 位 JVM，默认压缩指针）：
┌────────────────────────┐
│ Mark Word (8 字节)      │ ← 哈希码、锁状态、GC 分代年龄
├────────────────────────┤
│ 类型指针 (4 字节，压缩)  │ ← 指向 Class 对象
├────────────────────────┤
│ 实例数据（字段）         │ ← 实际字段值
├────────────────────────┤
│ 对齐填充                │ ← 8 字节对齐
└────────────────────────┘

例如一个 Point { int x; int y; }：
- 对象头：12 字节（8 + 4 压缩）
- x: 4 字节
- y: 4 字节
- 总计：20 字节，对齐到 24 字节
\`\`\`

### 装箱（Boxing）

Java 有时候需要把基本类型包装成对象（比如放进集合）：

\`\`\`java
// 装箱：基本类型 → 包装类
Integer boxed = Integer.valueOf(42);  // 自动装箱
int unboxed = boxed.intValue();        // 自动拆箱

// 集合只能装对象，不能装基本类型
List<Integer> list = new ArrayList<>();
list.add(42);  // 自动装箱为 Integer

// 这个过程有性能开销！
\`\`\`

\`\`\`python
# Python 没有装箱概念——因为本来就是对象
# 但 Python 的小整数有"缓存"优化
a = 42
b = 42
print(a is b)  # True！小整数（-5 到 256）被缓存，a 和 b 指向同一对象

c = 12345
d = 12345
print(c is d)  # False（通常）！大整数不缓存
\`\`\`

## 二、内存区域对比

### Python 的内存区域

Python 的内存管理相对简单——几乎所有对象都在**堆**上，由 Python 自己的内存分配器管理：

\`\`\`
Python 内存区域：
┌──────────────────────────────────────────┐
│ 操作系统分配给进程的虚拟内存              │
├──────────────────────────────────────────┤
│  CPython 内存分配器（pymalloc）          │
│  ├── 对象池（小对象 ≤ 512 字节）          │
│  │   ├── 8 字节池、16 字节池、... 512 字节│
│  │   └── 减少 malloc/free 调用           │
│  ├── 大对象直接走系统 malloc             │
│  └── 所有 Python 对象都在这里            │
├──────────────────────────────────────────┤
│  栈（C 函数调用栈）                       │
│  └── Frame 对象在堆上，不在栈上           │
└──────────────────────────────────────────┘
\`\`\`

Python 的"栈"实际上也在堆上——每次函数调用创建一个 Frame 对象，存在堆上。这让 Python 的调用栈很灵活（可以序列化、可以跨线程），但性能不如 Java 的 native 栈。

### Java 的内存区域

JVM 的内存划分复杂得多，每个区域有专门用途：

\`\`\`
JVM 内存区域（JDK 8+）：
┌─────────────────────────────────────────────────────┐
│ JVM 进程内存                                        │
├─────────────────────────────────────────────────────┤
│ 堆（Heap）—— 所有对象实例 + 数组                    │
│ ├── 新生代（Young Gen）                              │
│ │   ├── Eden 区（新对象）                            │
│ │   └── Survivor 0 / 1（幸存对象）                   │
│ └── 老年代（Old Gen）—— 长期存活的对象               │
├─────────────────────────────────────────────────────┤
│ 方法区 / 元空间（Metaspace）—— 类信息、常量池        │
├─────────────────────────────────────────────────────┤
│ 虚拟机栈（每线程一个）—— 栈帧                        │
│ ├── 局部变量表（基本类型直接存值，引用存指针）        │
│ ├── 操作数栈                                        │
│ └── 动态链接                                        │
├─────────────────────────────────────────────────────┤
│ 本地方法栈（每线程一个）—— native 方法调用           │
├─────────────────────────────────────────────────────┤
│ 程序计数器（每线程一个）—— 当前指令地址              │
├─────────────────────────────────────────────────────┤
│ 直接内存（Direct Memory）—— NIO Buffer 等            │
└─────────────────────────────────────────────────────┘
\`\`\`

关键差异：
- Java 的**基本类型局部变量在栈上**（\`int x = 42\` 的 42 直接在栈帧里），不进堆
- Java 的**线程栈是真实的 native 栈**，性能高
- Java 的堆分代，便于 GC 分代回收

## 三、对象创建：__new__/__init__ vs new + 构造器

### Python：__new__ + __init__

Python 创建对象分两步：\`__new__\` 创建对象，\`__init__\` 初始化对象：

\`\`\`python
class Person:
    def __new__(cls, name, age):
        # 创建对象（很少重写，除非单例/不可变类型）
        instance = super().__new__(cls)
        return instance

    def __init__(self, name, age):
        # 初始化对象
        self.name = name
        self.age = age

p = Person("Alice", 30)
# 实际过程：
# 1. 调用 Person.__new__(Person, "Alice", 30) → 创建空对象
# 2. 调用 Person.__init__(p, "Alice", 30) → 初始化字段
\`\`\`

\`__new__\` 是类方法（cls 是类），返回实例；\`__init__\` 是实例方法（self 是实例），无返回值。这种分离让 Python 能实现"不可变类型"（如 tuple/str 的 \`__new__\` 必须在创建时确定值）。

### Java：new + 构造器

Java 的对象创建是"原子"的——\`new\` 关键字一次完成内存分配和初始化：

\`\`\`java
public class Person {
    private String name;
    private int age;

    // 构造器
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
}

Person p = new Person("Alice", 30);
// 实际过程：
// 1. new 分配内存（在堆上），所有字段置默认值
// 2. 调用构造器，初始化字段
// 3. 返回引用
\`\`\`

Java 没有 \`__new__\` 的概念——内存分配由 JVM 控制，开发者无法干预。这限制了灵活性，但简化了模型。

## 四、值类型 vs 引用类型

这是 Python 和 Java 最根本的差异之一。

### Python：没有值类型，全是引用

\`\`\`python
# Python：变量是标签，赋值是贴标签
a = [1, 2, 3]
b = a           # b 也贴到同一个 list
b.append(4)
print(a)        # [1, 2, 3, 4] —— a 也变了！

# 即使是"不可变"的 int，变量也是引用
x = 42
y = x           # y 也指向 42 这个对象
y = 100         # y 重新指向 100，x 不变
print(x)        # 42
\`\`\`

Python 的"不可变"是对象层面的——\`int\` 对象本身不可变（不能修改 42 的值），但变量可以重新绑定。

### Java：基本类型存值，引用类型存引用

\`\`\`java
// Java：基本类型直接存值
int x = 42;
int y = x;       // y 复制值
y = 100;
System.out.println(x);  // 42 —— x 不变

// 引用类型存引用
int[] a = {1, 2, 3};
int[] b = a;     // b 复制引用
b[0] = 99;
System.out.println(a[0]);  // 99 —— 同一对象
\`\`\`

\`\`\`
Java 基本类型 vs 引用类型：
┌─────────────┬──────────────────────────────────┐
│ 基本类型     │ int, long, double, float,       │
│             │ byte, short, char, boolean      │
│             │ → 直接存值，在栈上               │
├─────────────┼──────────────────────────────────┤
│ 引用类型     │ String, 数组, 所有类实例          │
│             │ → 存引用，对象在堆上              │
└─────────────┴──────────────────────────────────┘
\`\`\`

这个差异在传参时体现得最明显：

\`\`\`java
// Java：基本类型传值，修改不影响原变量
void modify(int x) { x = 100; }
int a = 1;
modify(a);
System.out.println(a);  // 1

// Java：引用类型传引用（值传递引用），修改对象影响原对象
void modify(int[] arr) { arr[0] = 100; }
int[] a = {1, 2, 3};
modify(a);
System.out.println(a[0]);  // 100
\`\`\`

\`\`\`python
# Python：全是引用，函数内修改可变对象影响外部
def modify(lst):
    lst.append(100)

a = [1, 2, 3]
modify(a)
print(a)  # [1, 2, 3, 100]

# 不可变对象"看起来"是值传递——因为无法修改
def modify(x):
    x = 100  # 重新绑定，不影响外部

a = 1
modify(a)
print(a)  # 1
\`\`\`

## 五、Java 内存模型（JMM）

Java 有一个**正式的内存模型规范**（JSR-133），定义了多线程下的可见性规则：

\`\`\`
JMM 核心概念：
1. 主内存（Main Memory）：所有变量存储
2. 工作内存（Working Memory）：每线程的本地缓存
3. 线程不能直接读写主内存，必须经过工作内存

线程A 工作内存  ←→  主内存  ←→  线程B 工作内存
     ↑                                 ↑
   读 x                             读 x
\`\`\`

JMM 定义了 **happens-before** 关系，规定什么操作"先于"什么操作可见：

\`\`\`
happens-before 规则：
1. 程序顺序规则：单线程内，前面的操作 happens-before 后面的
2. 监视器锁规则：unlock happens-before 后续 lock
3. volatile 规则：写 volatile happens-before 后续读 volatile
4. 线程启动规则：start() happens-before 线程内任何操作
5. 线程终止规则：线程内操作 happens-before 其他线程检测到终止
6. 传递性：A happens-before B，B happens-before C，则 A happens-before C
\`\`\`

\`\`\`java
// volatile 保证可见性
class VolatileExample {
    private volatile boolean stop = false;

    public void stop() { stop = true; }

    public void run() {
        while (!stop) {
            // 没有 volatile，这个循环可能永远不退出！
            // 因为工作内存的 stop 可能是缓存的 false
        }
    }
}
\`\`\`

\`\`\`java
// synchronized 保证原子性 + 可见性
class Counter {
    private int count = 0;

    public synchronized void increment() {
        count++;  // 原子操作（synchronized 保护）
    }

    public synchronized int get() {
        return count;  // 读到最新值
    }
}
\`\`\`

## 六、Python 的"内存模型"

Python 没有像 JMM 那样正式的内存模型规范，但 **GIL（全局解释器锁）** 隐式地定义了内存可见性：

\`\`\`
GIL 的"内存模型"：
- 任意时刻只有一个线程执行 Python 字节码
- 字节码是原子单位（一条字节码执行期间不会切换线程）
- 但跨字节码可能切换线程

这意味着：
- 单个字节码内的操作是"原子的"（如 LOAD_FAST、STORE_ATTR）
- 但多个字节码的组合不是原子的（如 i += 1 是 LOAD + ADD + STORE）
\`\`\`

\`\`\`python
# Python：GIL 简化了内存可见性，但不保证原子性
import threading

counter = 0

def increment():
    global counter
    for _ in range(1000000):
        counter += 1  # 不是原子的！LOAD + ADD + STORE

t1 = threading.Thread(target=increment)
t2 = threading.Thread(target=increment)
t1.start(); t2.start()
t1.join(); t2.join()
print(counter)  # 不是 2000000！因为 i += 1 不是原子的
\`\`\`

\`\`\`python
# 正确做法：用锁或线程安全结构
import threading

counter = 0
lock = threading.Lock()

def increment():
    global counter
    for _ in range(1000000):
        with lock:
            counter += 1  # 锁保护，原子操作
\`\`\`

### GIL 的"好处"

讽刺的是，GIL 简化了 Python 的内存模型——因为同一时刻只有一个线程执行，所以**不需要 volatile、不需要 happens-before 规则**。所有变量读写都是"立即可见"的。

\`\`\`
GIL 的内存模型对比：
                Python（GIL）        Java（JMM）
内存可见性       GIL 自动保证         需 volatile/synchronized
volatile        不需要               需要
happens-before  隐式（GIL 序列化）   显式规则
线程安全         仍需锁（操作非原子）  需锁/volatile/atomic
\`\`\`

### GIL 的代价

\`\`\`
GIL 的代价：
1. 多核无法利用——CPU 密集型多线程比单线程还慢（线程切换开销）
2. 限制了并发性能——但 IO 密集型可用多线程（IO 时释放 GIL）
3. 阻碍了 Python 的并行计算——多进程是唯一出路
\`\`\`

\`\`\`python
# Python 多核计算只能用多进程
from multiprocessing import Pool

def square(x):
    return x * x

if __name__ == "__main__":
    with Pool(4) as p:  # 4 个进程
        result = p.map(square, range(1000000))
\`\`\`

Python 3.13 引入了**实验性的"自由线程"模式**（PEP 703），可以禁用 GIL：

\`\`\`bash
# 启用自由线程（实验性，需重新编译 Python）
./configure --disable-gil
\`\`\`

但禁用 GIL 后，单线程性能下降约 10%，且需要所有 C 扩展都改成线程安全——短期内难以普及。

## 七、内存泄漏场景对比

### Python 的内存泄漏

Python 有 GC，但仍会泄漏——主要是循环引用 + \`__del__\`：

\`\`\`python
# Python：循环引用（gc 模块能处理，但有 __del__ 就麻烦）
class Node:
    def __init__(self):
        self.ref = None
    def __del__(self):
        print("销毁")

a = Node()
b = Node()
a.ref = b
b.ref = a
del a, b  # 引用计数不为 0（循环），但 gc 模块能检测并回收

# 真正的泄漏：全局容器无限增长
cache = {}
def get_data(key):
    if key not in cache:
        cache[key] = fetch_from_db(key)  # 永不清理，内存泄漏
    return cache[key]
\`\`\`

### Java 的内存泄漏

Java 的泄漏通常是"对象被无意中持有引用"：

\`\`\`java
// Java：静态集合持有对象，永不释放
public class Cache {
    private static final Map<String, Object> CACHE = new HashMap<>();

    public static Object get(String key) {
        return CACHE.computeIfAbsent(key, k -> loadFromDb(k));
        // CACHE 是 static，永不 GC，对象永不释放 → 内存泄漏
    }
}
\`\`\`

\`\`\`java
// Java：监听器未注销
public class EventBus {
    private final List<Listener> listeners = new ArrayList<>();

    public void register(Listener l) { listeners.add(l); }
    // 没有 unregister 方法，listener 永远被持有 → 内存泄漏
}
\`\`\`

## 八、内存布局对比表

| 维度 | Python | Java |
|------|--------|------|
| 对象头 | 16 字节（refcnt + type） | 12-16 字节（mark + klass） |
| 基本类型 | 无（全是对象） | 8 种基本类型，直接存值 |
| 装箱 | 不需要 | Integer/Double 等包装类 |
| 栈 | 在堆上（Frame 对象） | native 栈 |
| 堆 | 单一区域 | 分代（新生代/老年代） |
| 方法区 | 无（模块在堆） | 元空间（Metaspace） |
| 内存模型 | GIL 隐式 | JMM 显式规范 |
| volatile | 不需要 | 需要 |
| happens-before | 隐式 | 显式 |
| 多线程内存可见 | GIL 保证 | volatile/synchronized |
| 内存泄漏 | 循环引用、全局容器 | 静态集合、未注销监听器 |

## 九、一句话总结

- **Python** 的对象模型简洁统一（一切皆对象），但代价是内存占用大、性能差；GIL 简化了内存模型但限制了并发。
- **Java** 的对象模型复杂（基本类型 + 引用类型），但性能好、内存紧凑；JMM 提供了精细的并发控制，但学习曲线陡峭。

Python 3.13 的"自由线程"实验在尝试打破 GIL 的枷锁，而 Java 的 Project Valhalla（值类型）在尝试弥合基本类型与对象的鸿沟——两者都在向对方的"优点"靠拢。

---

> **下一章**：内存模型决定了对象的生命周期，下一章看垃圾回收——Python 的引用计数 vs Java 的分代 GC。`,
  },
  {
    id: "pyvsjava-gc",
    icon: "🧹",
    title: "垃圾回收",
    group: "运行时与底层",
    content: `# 垃圾回收

## 一、两种截然不同的 GC 策略

Python 和 Java 都有自动垃圾回收（GC），但策略几乎相反——**Python 以引用计数为主**（立即回收）+ 分代 GC 为辅（处理循环引用），**Java 以分代 GC 为主**（批量回收）。

\`\`\`
Python GC 策略：
┌──────────────────────────────────────┐
│ 1. 引用计数（主）—— 立即回收           │
│    每个对象有 ob_refcnt              │
│    引用 +1，删除 -1                  │
│    归零立即释放                       │
├──────────────────────────────────────┤
│ 2. 分代 GC（辅）—— 处理循环引用        │
│    每 700 次分配触发一次              │
│    标记-清除算法                      │
└──────────────────────────────────────┘

Java GC 策略：
┌──────────────────────────────────────┐
│ 纯分代 GC（无可达性分析外的引用计数）  │
│ ├── 新生代（Young Gen）               │
│ │   ├── 复制算法（Eden → Survivor）   │
│ │   └── 频繁回收，大部分对象很快死    │
│ └── 老年代（Old Gen）                 │
│     ├── 标记-清除/标记-压缩           │
│     └── 较少回收，长期存活的对象      │
└──────────────────────────────────────┘
\`\`\`

## 二、Python 的引用计数

### 1. 工作原理

每个 Python 对象都有一个 \`ob_refcnt\` 字段，记录被多少个引用指向：

\`\`\`python
# 引用计数的变化
import sys

a = [1, 2, 3]      # refcnt = 1
print(sys.getrefcount(a) - 1)  # 1（getrefcount 自己也会 +1）

b = a               # refcnt = 2
print(sys.getrefcount(a) - 1)  # 2

del b               # refcnt = 1
print(sys.getrefcount(a) - 1)  # 1

del a               # refcnt = 0 → 立即释放！
\`\`\`

\`\`\`c
// CPython 内部（简化）
void Py_INCREF(PyObject *o) {
    o->ob_refcnt++;
}

void Py_DECREF(PyObject *o) {
    o->ob_refcnt--;
    if (o->ob_refcnt == 0) {
        Py_Dealloc(o);  // 立即调用析构 + 释放内存
    }
}
\`\`\`

### 2. 引用计数的优点

\`\`\`
引用计数的优点：
1. 即时回收：对象一旦不可达，立即释放
   → 内存占用低，无 GC 暂停积累
2. 可预测：析构时机确定（refcnt 归零时）
   → __del__ 会被可靠调用
3. 简单：实现简单，无需复杂算法
4. 增量：不需要 STW（Stop-The-World）暂停
   → 适合实时系统（理论上）
\`\`\`

### 3. 引用计数的致命缺陷：循环引用

\`\`\`python
# 循环引用：引用计数无法处理
class Node:
    def __init__(self):
        self.ref = None
    def __del__(self):
        print(f"销毁 {id(self)}")

a = Node()   # a.refcnt = 1
b = Node()   # b.refcnt = 1
a.ref = b    # b.refcnt = 2
b.ref = a    # a.refcnt = 2

del a        # a.refcnt = 1（b.ref 还指向它）
del b        # b.refcnt = 1（a.ref 还指向它）
# 现在 a 和 b 的 refcnt 都是 1，但谁也无法释放！
# 引用计数失败！
\`\`\`

这就是为什么 Python 需要**分代 GC 作为补充**。

### 4. 引用计数的其他缺点

\`\`\`
引用计数的其他缺点：
1. 性能开销：每次赋值/传参都要更新 refcnt
   → 多线程下还需要原子操作（GIL 简化了这一点）
2. 空间开销：每个对象多 8 字节存 refcnt
3. 递归析构：大对象图析构可能栈溢出
4. 线程安全：refcnt 更新需要同步（GIL 救了 Python）
\`\`\`

## 三、Python 的分代 GC（gc 模块）

为了处理循环引用，Python 引入了分代 GC：

\`\`\`
Python 分代 GC：
- 三代：第 0 代、第 1 代、第 2 代
- 新对象进第 0 代
- 第 0 代回收后存活 → 进第 1 代
- 第 1 代回收后存活 → 进第 2 代
- 越老的对象，回收越少

触发时机：
- 第 0 代：每分配 700 个对象触发
- 第 1 代：第 0 代回收 10 次后触发
- 第 2 代：第 1 代回收 10 次后触发
\`\`\`

\`\`\`python
import gc

# 查看 GC 阈值
print(gc.get_threshold())  # (700, 10, 10)

# 手动触发 GC
gc.collect()

# 查看 GC 统计
print(gc.get_count())  # (当前 0 代对象数, 1 代, 2 代)

# 禁用 GC（不推荐）
gc.disable()
\`\`\`

分代 GC 的算法是**标记-清除**：

\`\`\`
标记-清除算法：
1. 标记阶段：从"根对象"（全局变量、栈、寄存器）出发，
   遍历所有可达对象，标记为"可达"
2. 清除阶段：遍历所有对象，未标记的就是垃圾，释放

循环引用 a → b → a：
- 标记后：a 和 b 都"不可达"（从根对象出发到不了）
- 清除：a 和 b 被释放
\`\`\`

## 四、Java 的分代 GC

### 1. 分代假设

Java GC 基于**弱分代假设**：

\`\`\`
弱分代假设：
1. 绝大多数对象"朝生夕死"（新生代很快死）
2. 老对象很少引用新对象

统计：约 98% 的对象在第一次 GC 时就死了
→ 把"新对象"放一起，频繁回收；"老对象"放一起，少回收
\`\`\`

\`\`\`
Java 堆分代：
┌────────────────────────────────────────────┐
│ 堆（Heap）                                 │
├──────────────────┬─────────────────────────┤
│ 新生代（1/3）    │ 老年代（2/3）           │
├──────────────────┤                         │
│ Eden (8/10)      │                         │
│ Survivor 0 (1/10)│                         │
│ Survivor 1 (1/10)│                         │
└──────────────────┴─────────────────────────┘

新对象 → Eden
Eden 满 → Minor GC：Eden + S0 存活 → 复制到 S1
         Eden + S0 清空
下次 Eden 满 → Eden + S1 存活 → 复制到 S0
               Eden + S1 清空
存活多次（默认 15）→ 晋升老年代
老年代满 → Major GC / Full GC
\`\`\`

### 2. GC 算法

\`\`\`java
// 不同代的 GC 算法不同
// 新生代：复制算法（Copying）
//   - 适合"大部分对象死"的场景
//   - 无碎片，但浪费一半空间

// 老年代：标记-清除 / 标记-压缩
//   - 适合"大部分对象活"的场景
//   - 标记-压缩无碎片但慢
\`\`\`

### 3. Java GC 收集器

JVM 有多种 GC 收集器，针对不同场景：

\`\`\`
Java GC 收集器演进：
1. Serial GC（-XX:+UseSerialGC）
   - 单线程，适合小应用
   - STW 长

2. Parallel GC（-XX:+UseParallelGC，JDK 8 默认）
   - 多线程回收，吞吐量优先
   - STW 中等

3. G1 GC（-XX:+UseG1GC，JDK 9+ 默认）
   - 分区（Region）回收，可预测停顿
   - 适合大堆（> 6GB）

4. ZGC（-XX:+UseZGC，JDK 15+ 生产可用）
   - 染色指针，并发标记/转移
   - 停顿 < 10ms，适合超大堆（TB 级）

5. Shenandoah（-XX:+UseShenandoahGC，JDK 12+）
   - Brooks 转发指针，并发整理
   - 停顿 < 10ms
\`\`\`

\`\`\`
GC 收集器对比：
┌──────────┬──────────┬──────────┬──────────────┐
│ 收集器    │ 停顿时间  │ 吞吐量   │ 适用场景      │
├──────────┼──────────┼──────────┼──────────────┤
│ Serial   │ 长       │ 低       │ 小应用/嵌入式  │
│ Parallel │ 中       │ 高       │ 批处理        │
│ G1       │ 可控     │ 中-高    │ 大堆/服务端   │
│ ZGC      │ <10ms    │ 中       │ 超大堆/低延迟 │
│ Shenandoah│ <10ms   │ 中       │ 低延迟        │
└──────────┴──────────┴──────────┴──────────────┘
\`\`\`

## 五、STW 停顿对比

### Python 的"STW"

Python 的引用计数本身**不需要 STW**——对象不可达立即释放。但分代 GC 触发时需要短暂 STW：

\`\`\`python
# Python GC 停顿
import gc
import time

# 制造大量循环引用
def make_cycles():
    for _ in range(100000):
        a = []
        b = [a]
        a.append(b)

start = time.time()
gc.collect()  # STW，但通常很短
print(f"GC 耗时: {time.time() - start:.3f}s")
\`\`\`

Python 的 GC 停顿通常很短（毫秒级），但**频繁**——每 700 次分配就触发一次。

### Java 的 STW

Java 的 STW 与 GC 收集器强相关：

\`\`\`
Java GC 停顿特征：
- Minor GC：频繁但短（毫秒级），STW
- Major GC / Full GC：少但长（百毫秒到秒级），STW
- G1/ZGC：通过并发标记/转移，把 STW 压到 10ms 以下

Java GC 停顿可调优：
-XX:MaxGCPauseMillis=200  # 目标停顿 200ms
-XX:+UseG1GC              # 用 G1
-XX:+UseZGC               # 用 ZGC（JDK 15+）
\`\`\`

\`\`\`
STW 对比：
                Python              Java
STW 频率        高（每 700 次分配）  低（按代/堆满）
单次 STW 时长   短（毫秒）           视收集器（ms 到 s）
总停顿比例      中                  低（G1/ZGC）
可调优性        弱（参数少）         强（大量参数）
\`\`\`

## 六、弱引用对比

### Python 的 weakref

\`\`\`python
import weakref

class BigObject:
    def __init__(self, name):
        self.name = name

obj = BigObject("cache")
ref = weakref.ref(obj)  # 弱引用，不增加 refcnt

print(ref())  # <BigObject object>
del obj       # 强引用消失，立即回收
print(ref())  # None（弱引用失效）
\`\`\`

\`\`\`python
# weakref.WeakValueDictionary：缓存场景
import weakref

class Cache:
    def __init__(self):
        self._cache = weakref.WeakValueDictionary()

    def get(self, key, loader):
        if key in self._cache:
            return self._cache[key]
        value = loader(key)
        self._cache[key] = value  # 弱引用，内存不足时可回收
        return value
\`\`\`

### Java 的四种引用

Java 的引用体系更细致：

\`\`\`java
// 1. 强引用（Strong）：永不回收（除非置 null）
Object strong = new Object();

// 2. 软引用（Soft）：内存不足时回收（适合缓存）
import java.lang.ref.SoftReference;
SoftReference<Object> soft = new SoftReference<>(new Object());
Object o = soft.get();  // 可能为 null（内存不足时被回收）

// 3. 弱引用（Weak）：下次 GC 就回收
import java.lang.ref.WeakReference;
WeakReference<Object> weak = new WeakReference<>(new Object());
Object o2 = weak.get();  // 下次 GC 后可能为 null

// 4. 虚引用（Phantom）：不影响对象生命周期，仅跟踪回收
import java.lang.ref.PhantomReference;
import java.lang.ref.ReferenceQueue;
ReferenceQueue<Object> queue = new ReferenceQueue<>();
PhantomReference<Object> phantom = new PhantomReference<>(new Object(), queue);
phantom.get();  // 永远返回 null
\`\`\`

\`\`\`
Java 引用强度（从强到弱）：
强引用 > 软引用 > 弱引用 > 虚引用

软引用：内存不足才回收 → 适合内存敏感的缓存
弱引用：下次 GC 就回收 → 适合避免内存泄漏（如 WeakHashMap）
虚引用：不影响生命周期 → 适合跟踪对象被回收的时机
\`\`\`

Python 的 weakref 大致对应 Java 的弱引用，但 Python 没有软引用（无 \`SoftReference\` 等价物）。

## 七、finalize vs __del__

### Python 的 __del__

\`\`\`python
class Resource:
    def __init__(self, name):
        self.name = name
        print(f"获取 {name}")

    def __del__(self):
        print(f"释放 {self.name}")

r = Resource("file.txt")
del r  # 立即调用 __del__（引用计数归零）
\`\`\`

\`__del__\` 在引用计数归零时**立即调用**——这是 Python 引用计数的好处。但循环引用情况下，\`__del__\` 的调用时机不确定（要等分代 GC）。

### Java 的 finalize（已弃用）

\`\`\`java
public class Resource {
    private String name;

    public Resource(String name) {
        this.name = name;
        System.out.println("获取 " + name);
    }

    @Override
    protected void finalize() throws Throwable {
        System.out.println("释放 " + name);
    }
}
// finalize 的调用时机不确定，且 JDK 9+ 已弃用
\`\`\`

\`finalize\` 的问题：
\`\`\`
finalize 的问题：
1. 调用时机不确定（GC 时才调用，可能永远不调用）
2. 调用不保证（JVM 退出时可能不调用）
3. 性能开销大（finalize 对象要额外处理）
4. 可能"复活"对象（finalize 中重新建立引用）

替代方案：try-with-resources + AutoCloseable
\`\`\`

\`\`\`java
// Java 推荐：try-with-resources
public class Resource implements AutoCloseable {
    public void close() {
        System.out.println("释放资源");
    }
}

try (Resource r = new Resource()) {
    // 使用 r
}  // 自动调用 r.close()，确定性释放
\`\`\`

\`\`\`python
# Python 推荐：context manager（with 语句）
class Resource:
    def __enter__(self):
        return self
    def __exit__(self, *exc):
        print("释放资源")

with Resource() as r:
    # 使用 r
# 自动调用 __exit__，确定性释放
\`\`\`

## 八、内存泄漏场景对比

### Python 的内存泄漏

\`\`\`python
# 1. 全局容器无限增长
cache = {}
def get(key):
    if key not in cache:
        cache[key] = load(key)  # 永不清理
    return cache[key]

# 2. 闭包意外持有引用
def make_handler():
    big_data = [0] * 1000000  # 100 万个元素
    def handler():
        print(len(big_data))  # 闭包持有 big_data
    return handler

# 3. 循环引用 + __del__（gc 模块难处理）
class Node:
    def __del__(self): pass
a = Node(); b = Node()
a.ref = b; b.ref = a
del a, b  # gc 模块不会回收（有 __del__ 的循环引用）
\`\`\`

### Java 的内存泄漏

\`\`\`java
// 1. 静态集合持有对象
public class Cache {
    private static final Map<String, byte[]> CACHE = new HashMap<>();
    public static byte[] get(String key) {
        return CACHE.computeIfAbsent(key, k -> loadFromDb(k));
    }  // 永不释放
}

// 2. 未注销的监听器
public class EventBus {
    private final List<Listener> listeners = new CopyOnWriteArrayList<>();
    public void register(Listener l) { listeners.add(l); }
    // 忘记 unregister → listener 永远被持有
}

// 3. ThreadLocal 未清理
public class ThreadLocalLeak {
    private static final ThreadLocal<byte[]> BUFFER =
        ThreadLocal.withInitial(() -> new byte[1024 * 1024]);
    // 线程池中的线程不退出，ThreadLocal 永不释放
}

// 4. 内部类持有外部类引用
public class Outer {
    private byte[] bigData = new byte[1024 * 1024];

    class Inner {  // 非 static 内部类，隐式持有 Outer.this
        // 即使 Outer 不用了，Inner 还在 → bigData 不释放
    }
}
\`\`\`

## 九、GC 调优对比

### Python 的 GC 调优

\`\`\`python
import gc

# 调整 GC 阈值
gc.set_threshold(700, 10, 10)  # 默认值

# 对于对象生命周期长的应用，可以调高阈值减少 GC
gc.set_threshold(50000, 100, 100)

# 完全禁用 GC（极端优化，需确保无循环引用）
gc.disable()
\`\`\`

Python 的 GC 调优空间很小——主要靠"避免创建对象"而非调 GC。

### Java 的 GC 调优

\`\`\`bash
# JVM GC 参数（数百个）
java -Xms4g -Xmx4g \                    # 堆大小
     -XX:+UseG1GC \                      # 用 G1
     -XX:MaxGCPauseMillis=200 \          # 目标停顿 200ms
     -XX:G1HeapRegionSize=16m \          # Region 大小
     -XX:InitiatingHeapOccupancyPercent=45 \  # 触发并发标记的阈值
     -XX:+ParallelRefProcEnabled \       # 并行处理引用
     -Xlog:gc*:file=gc.log \             # GC 日志
     MyApp
\`\`\`

Java 的 GC 调优空间极大——这也是 Java 适合"长期运行服务端"的原因之一。

## 十、GC 对比总结表

| 维度 | Python | Java |
|------|--------|------|
| 主要策略 | 引用计数 | 分代 GC |
| 辅助策略 | 分代 GC（处理循环引用） | 无 |
| 回收时机 | 即时（refcnt 归零） | 批量（GC 触发） |
| 循环引用 | 分代 GC 处理 | 可达性分析天然处理 |
| STW 频率 | 高（每 700 次分配） | 低（按代/堆满） |
| STW 时长 | 短（毫秒） | 视收集器（ms 到 s） |
| 弱引用 | weakref | WeakReference/Soft/Phantom |
| 软引用 | 无 | SoftReference |
| 析构 | __del__（较确定） | finalize（已弃用） |
| 确定性释放 | with 语句 | try-with-resources |
| GC 收集器 | 单一 | Serial/Parallel/G1/ZGC/Shenandoah |
| 调优空间 | 小 | 极大 |
| 内存泄漏 | 全局容器、循环引用 | 静态集合、监听器、ThreadLocal |

## 十一、一句话总结

- **Python** 的引用计数让对象"即用即释"，内存占用低、析构时机确定，但循环引用和频繁 GC 是痛点。
- **Java** 的分代 GC 通过弱分代假设和多种收集器，实现了高吞吐或低延迟的可调优回收，但 STW 和调优复杂度是代价。

引用计数 vs 分代 GC，没有绝对优劣——Python 牺牲了多核并发换来了简单的内存模型，Java 牺牲了启动速度换来了峰值性能。两者都在演进：Python 3.13 在尝试禁用 GIL，Java 在用 ZGC 把停顿压到 10ms 以下。

---

> **下一章**：底层讲完了，下一章看标准库与生态——Python 的"电池全含" vs Java 的"工程化标准库"。`,
  },
  {
    id: "pyvsjava-stdlib",
    icon: "🧰",
    title: "标准库与生态",
    group: "运行时与底层",
    content: `# 标准库与生态

## 一、两种标准库哲学

Python 和 Java 的标准库都很大，但设计哲学截然不同——**Python 是"电池全含"**（开箱即用），**Java 是"工程化规范"**（严谨但啰嗦）。

\`\`\`
Python 标准库哲学：
- "Batteries Included"（电池全含）
- 开箱即用，不装第三方包就能干很多事
- 模块名简短小写：os, sys, json, csv, re
- API 设计简洁，新手友好

Java 标准库哲学：
- "工程化规范"
- 命名严谨但冗长：java.util, java.io, java.net
- API 设计面向大型团队，强调扩展性和规范性
- 很多功能留给第三方（如 Spring、Jackson）
\`\`\`

## 二、Python 的标准库全景

Python 的标准库覆盖极广，几乎所有常见任务都能用标准库完成：

\`\`\`
Python 标准库分类：
├── 操作系统：os, sys, shutil, pathlib, glob
├── 文本处理：re, string, textwrap, unicodedata
├── 数据格式：json, csv, xml, html, configparser
├── 网络通信：urllib, http, socket, smtplib, ftplib
├── 数据库：sqlite3, dbm
├── 并发：threading, multiprocessing, asyncio, concurrent.futures
├── 数学运算：math, cmath, decimal, fractions, statistics
├── 数据结构：collections, heapq, bisect, array
├── 日期时间：datetime, time, calendar
├── 加密哈希：hashlib, hmac, secrets
├── 调试测试：pdb, unittest, doctest, traceback
├── 国际化：gettext, locale
├── 多媒体：wave, colorsys, imghdr
├── 数据持久化：pickle, shelve
├── 函数式编程：itertools, functools, operator
├── 类型系统：typing, dataclasses, enum
├── 元编程：inspect, abc, types
├── 日志：logging
├── 性能分析：cProfile, timeit
└── ...
\`\`\`

### 1. 不装第三方包能干什么

\`\`\`python
# Python：标准库就能干很多事

# HTTP 请求（无需 requests）
import urllib.request
resp = urllib.request.urlopen("https://api.github.com")
print(resp.read().decode())

# JSON 处理
import json
data = json.loads('{"name": "Alice", "age": 30}')

# 正则表达式
import re
result = re.findall(r"\\d+", "abc123def456")

# SQLite 数据库
import sqlite3
conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE users (id INTEGER, name TEXT)")

# 异步 IO
import asyncio
async def fetch():
    await asyncio.sleep(1)

# 路径处理
from pathlib import Path
for f in Path(".").glob("*.py"):
    print(f)

# 命令行参数
import argparse
parser = argparse.ArgumentParser()
parser.add_argument("--name", required=True)

# 日志
import logging
logging.basicConfig(level=logging.INFO)
logging.info("Hello")

# 单元测试
import unittest
class TestFoo(unittest.TestCase):
    def test_add(self):
        self.assertEqual(1 + 1, 2)
\`\`\`

### 2. 标准库的优势

\`\`\`
Python 标准库的优势：
1. 开箱即用：pip install 都不需要
2. 跨平台：标准库屏蔽了 OS 差异
3. 稳定：API 一旦稳定，很少 breaking change
4. 文档完善：docs.python.org 文档质量极高
5. 教学友好：新手不需要先学一堆依赖
\`\`\`

## 三、Java 的标准库全景

Java 的标准库（JDK）也很丰富，但更偏向"工程化"：

\`\`\`
Java 标准库分类（JDK 21+）：
├── java.lang      —— 语言核心（String, Object, System, Thread）
├── java.util      —— 集合、日期、随机数、扫描器
│   ├── java.util.concurrent —— 并发工具
│   ├── java.util.stream     —— 流式 API
│   ├── java.util.function   —— 函数式接口
│   └── java.util.regex      —— 正则
├── java.io        —— 输入输出（流、文件）
├── java.nio       —— 新 IO（Buffer、Channel）
│   └── java.nio.file —— 文件 API（Paths, Files）
├── java.net       —— 网络（Socket, URL, HttpClient）
├── java.math      —— BigInteger, BigDecimal
├── java.time      —— 日期时间（Java 8+）
├── java.sql       —— JDBC
├── java.security  —— 安全、加密
├── java.crypto    —— 加密
├── java.text      —— 文本格式化
├── java.rmi       —— 远程方法调用
├── java.management —— JMX
├── java.logging   —— 日志（java.util.logging）
├── java.instrument —— 字节码增强
├── javax.*        —— 扩展包（部分已迁移）
└── jdk.*          —— JDK 内部 API
\`\`\`

### 1. Java 标准库的"啰嗦"

\`\`\`java
// Java：发一个 HTTP 请求（Java 11+ HttpClient）
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class HttpDemo {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.github.com"))
                .build();
        HttpResponse<String> response =
            client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
    }
}
\`\`\`

\`\`\`python
# Python：同样的事
import urllib.request
resp = urllib.request.urlopen("https://api.github.com")
print(resp.read().decode())
\`\`\`

Java 的啰嗦来自：
1. **包名冗长**：\`java.net.http.HttpClient\`
2. **必须定义类**：所有代码在类里
3. **builder 模式**：\`HttpRequest.newBuilder().uri().build()\`
4. **显式异常**：\`throws Exception\`

### 2. Java 标准库的"严谨"

但 Java 的"啰嗦"换来了严谨：

\`\`\`java
// Java：HttpClient 可精细配置
HttpClient client = HttpClient.newBuilder()
        .version(HttpClient.Version.HTTP_2)
        .connectTimeout(Duration.ofSeconds(10))
        .followRedirects(HttpClient.Redirect.NORMAL)
        .proxy(ProxySelector.of(new InetSocketAddress("proxy.example.com", 8080)))
        .authenticator(new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication("user", "pass".toCharArray());
            }
        })
        .build();
\`\`\`

这种"可配置性"在大型项目中很有价值——你能精确控制每个细节。

## 四、命名风格对比

\`\`\`
命名风格对比表：
┌─────────────────────┬─────────────────────────────┐
│ Python              │ Java                        │
├─────────────────────┼─────────────────────────────┤
│ os                  │ java.lang.System            │
│ sys                 │ java.lang.Runtime           │
│ json                │ javax.json / jackson        │
│ re                  │ java.util.regex.Pattern     │
│ urllib              │ java.net.http.HttpClient    │
│ socket              │ java.net.Socket             │
│ threading           │ java.lang.Thread            │
│ asyncio             │ java.util.concurrent.*      │
│ pathlib             │ java.nio.file.Path          │
│ datetime            │ java.time.LocalDateTime     │
│ logging             │ java.util.logging.Logger    │
│ unittest            │ org.junit.*（第三方）       │
│ sqlite3             │ java.sql.* + JDBC           │
│ argparse            │ Apache CLI（第三方）        │
│ collections         │ java.util.*                 │
└─────────────────────┴─────────────────────────────┘
\`\`\`

观察：
- Python 模块名简短（os, re, json），Java 包名冗长（java.util.regex）
- Python 的 \`argparse\` 是标准库，Java 的命令行解析要靠 Apache Commons CLI（第三方）
- Python 的 \`unittest\` 是标准库，Java 的测试用 JUnit（第三方，事实标准）

## 五、第三方库依赖对比

### Python 的"常用第三方"

虽然 Python 标准库很全，但实际项目仍然依赖大量第三方库：

\`\`\`
Python 常用第三方库：
├── HTTP 请求：requests（比 urllib 友好）
├── Web 框架：Django, Flask, FastAPI
├── 数据科学：NumPy, Pandas, Matplotlib
├── 机器学习：TensorFlow, PyTorch, scikit-learn
├── ORM：SQLAlchemy
├── 模板：Jinja2
├── 加密：cryptography
├── 图像：Pillow
├── 异步：aiohttp, uvicorn
├── 测试：pytest（比 unittest 好用）
├── 代码质量：black, flake8, mypy
└── 打包：poetry, uv
\`\`\`

### Java 的"常用第三方"

Java 标准库覆盖不如 Python，但生态同样庞大：

\`\`\`
Java 常用第三方库：
├── Web 框架：Spring Boot, Quarkus, Micronaut
├── ORM：Hibernate, MyBatis
├── JSON：Jackson, Gson
├── HTTP 客户端：OkHttp, Apache HttpClient
├── 工具类：Guava, Apache Commons
├── 字节码：ByteBuddy, ASM
├── 日志：SLF4J, Logback, Log4j2
├── 测试：JUnit, Mockito, TestNG
├── 数据库连接池：HikariCP
├── 微服务：Spring Cloud, Dubbo
├── 大数据：Hadoop, Spark, Flink
├── 消息队列：Kafka, RabbitMQ Client
└── 构建：Maven, Gradle
\`\`\`

### 对照表

| 功能 | Python（标准库） | Python（第三方） | Java（标准库） | Java（第三方） |
|------|------------------|------------------|----------------|----------------|
| HTTP 请求 | urllib | requests | HttpClient（11+） | OkHttp |
| JSON | json | ujson/orjson | 无 | Jackson/Gson |
| Web 框架 | http.server | Django/Flask | 无 | Spring Boot |
| ORM | sqlite3 | SQLAlchemy | JDBC/JPA | Hibernate |
| 正则 | re | regex | java.util.regex | 无 |
| 日志 | logging | loguru | java.util.logging | SLF4J/Logback |
| 测试 | unittest | pytest | JUnit（事实标准） | TestNG |
| 命令行 | argparse | click/typer | 无 | Commons CLI |
| 加密 | hashlib/hmac | cryptography | javax.crypto | Bouncy Castle |
| 异步 | asyncio | aiohttp | java.util.concurrent | Netty |
| 数据库 | sqlite3 | psycopg2 | JDBC | HikariCP |

## 六、标准库的"开箱即用"差异

### Python：开箱即用，新手友好

\`\`\`python
# Python：装好 Python 就能做这么多事
# 1. 起 HTTP 服务（一行命令）
# python -m http.server 8000

# 2. JSON Pretty Print
# echo '{"a":1}' | python -m json.tool

# 3. 反汇编字节码
# python -m dis script.py

# 4. 性能分析
# python -m cProfile script.py

# 5. 单元测试
# python -m unittest discover
\`\`\`

Python 的 \`-m\` 参数让标准库模块可以当工具用——这是 Python 的独特设计。

### Java：需要构建工具

\`\`\`bash
# Java：连运行都需要先编译、配 classpath
javac -cp "lib/*" App.java
java -cp ".:lib/*" App

# 实际项目用 Maven 或 Gradle
mvn compile
mvn exec:java -Dexec.mainClass="com.example.App"
\`\`\`

Java 的"工程化"让新手门槛高——但大型项目受益。

## 七、标准库的演进策略

### Python：添加快，移除慢

Python 添加标准库很快——但移除很慢：

\`\`\`python
# Python 3 添加了大量标准库
# 3.2: concurrent.futures
# 3.4: asyncio, enum, pathlib
# 3.5: typing
# 3.7: dataclasses
# 3.9: zoneinfo
# 3.10: dataclasses 增强

# 但移除很慢——很多"过时"模块仍在
# 如 asynchat, asyncore（已弃用但仍在）
# imp（被 importlib 替代但未移除）

# 弃用机制：DeprecationWarning
import warnings
warnings.warn("old_func is deprecated", DeprecationWarning)
\`\`\`

Python 的"添加快"让生态活跃，但"移除慢"导致标准库有些臃肿——很多过时模块难以清理（怕破坏兼容性）。

### Java：弃用机制严格

Java 的弃用机制更严格——\`@Deprecated\` 注解：

\`\`\`java
// Java 弃用机制
@Deprecated(since = "9", forRemoval = true)
public class OldClass {
    // ...
}

// 编译时会警告
// javac -Xlint:deprecation
// warning: [deprecation] OldClass is deprecated
\`\`\`

\`\`\`
Java 弃用流程：
1. 标记 @Deprecated
2. 文档说明替代方案
3. 多个版本后标记 forRemoval=true
4. 最终在下个 LTS 移除

例子：
- java.util.Date → java.time（Java 8+）
- java.util.Stack → java.util.ArrayDeque
- finalize() → try-with-resources（Java 9+ 弃用）
- SecurityManager → 弃用（Java 17+）
\`\`\`

Java 的"弃用-移除"周期长（5-10 年），但比 Python 更系统化。

## 八、生态治理对比

### Python：PyPI + PEP

\`\`\`
Python 生态治理：
- PyPI（Python Package Index）：包仓库
- pip：包管理器
- PEP（Python Enhancement Proposal）：标准提案
  - PEP 8：代码风格
  - PEP 484：类型提示
  - PEP 517/518：构建系统

PyPI 的特点：
- 任何人可发布（无需审核）
- 包名先到先得
- 质量参差不齐（恶意包问题时有发生）
\`\`\`

### Java：Maven Central + JCP

\`\`\`
Java 生态治理：
- Maven Central：包仓库（也有 Gradle、Ivy）
- Maven / Gradle：构建工具
- JCP（Java Community Process）：标准制定
  - JSR（Java Specification Request）
- Nexus / Sonatype：发布需审核

Maven Central 的特点：
- 发布需 GPG 签名 + 域名验证
- 域名反向作为 groupId（com.google.guava）
- 治理严格，恶意包较少
\`\`\`

\`\`\`
依赖管理对比：
┌────────────┬──────────────────────┬──────────────────────┐
│ 维度        │ Python               │ Java                 │
├────────────┼──────────────────────┼──────────────────────┤
│ 仓库        │ PyPI                 │ Maven Central        │
│ 工具        │ pip/poetry/uv        │ Maven/Gradle         │
│ 配置文件    │ requirements.txt     │ pom.xml              │
│             │ pyproject.toml       │ build.gradle         │
│ 锁文件      │ poetry.lock          │ gradle.lockfile      │
│ 依赖冲突    │ 较难解决             │ 依赖树可分析         │
│ 发布审核    │ 无                   │ 严格                 │
│ groupId     │ 无（包名）           │ 域名反向             │
└────────────┴──────────────────────┴──────────────────────┘
\`\`\`

## 九、生态成熟度对比

\`\`\`
生态成熟度对比：
┌──────────────────┬──────────┬──────────┐
│ 领域              │ Python   │ Java     │
├──────────────────┼──────────┼──────────┤
│ Web 后端          │ ⚠️ 中   │ 🏆 强   │
│ AI/ML            │ 🏆 强   │ ❌ 弱   │
│ 数据科学          │ 🏆 强   │ ⚠️ 中   │
│ 大数据            │ ⚠️ 中   │ 🏆 强   │
│ 微服务            │ ⚠️ 中   │ 🏆 强   │
│ 桌面 GUI          │ ⚠️ 弱   │ ⚠️ 弱   │
│ 移动端            │ ❌ 弱   │ ⚠️ 中   │
│ 嵌入式            │ ⚠️ 弱   │ ⚠️ 弱   │
│ 系统脚本          │ 🏆 强   │ ❌ 弱   │
│ DevOps            │ 🏆 强   │ ⚠️ 弱   │
│ 企业级核心        │ ⚠️ 中   │ 🏆 强   │
└──────────────────┴──────────┴──────────┘
\`\`\`

## 十、版本管理与兼容性

### Python：版本碎片化

\`\`\`
Python 版本碎片化问题：
- Python 2 vs 3（2008-2020，长达 12 年的迁移期）
- Linux 发行版自带 Python 版本不同（CentOS 7 是 3.6，Ubuntu 22.04 是 3.10）
- macOS 自带 Python 版本陈旧
- 用户需自己管理 Python 版本（pyenv）

包的兼容性：
- 包通常支持 3.x 多版本
- 类型提示语法演进快（3.9 引入 list[int]，3.10 引入 int | str）
- 老代码在新版本可能不能用（如 3.12 移除了 distutils）
\`\`\`

### Java：版本兼容性策略

\`\`\`
Java 版本兼容性策略：
- 向后兼容（源码）：Java 8 代码能在 Java 21 编译
- 字节码兼容：Java 8 字节码能在 Java 21 运行
- 但前向不兼容：Java 21 字节码不能在 Java 8 运行

LTS 策略：
- LTS 版本（8, 11, 17, 21, 25）长期支持
- 企业普遍只用 LTS
- 非 LTS 版本只维护 6 个月

JDK 发行版：
- Oracle JDK（商业，部分收费）
- OpenJDK（开源）
- Eclipse Temurin, Amazon Corretto, Azul Zulu（OpenJDK 发行版）
\`\`\`

Java 的兼容性比 Python 好——一份字节码可以跨多个 JVM 版本运行（前向兼容）。但 Java 的语法演进快，老代码虽然能跑但风格会显得"过时"。

## 十一、一句话总结

- **Python** 的"电池全含"哲学让开发者开箱即用，标准库覆盖广、API 简洁，适合快速开发和脚本任务。
- **Java** 的"工程化标准库"哲学让命名严谨、规范明确，适合大型团队协作，但牺牲了简洁性。

Python 的标准库是"瑞士军刀"——什么都有，但都不深；Java 的标准库是"工具箱"——基础工具有，但高级工具靠第三方（Spring/Jackson/Guava）。

---

> **下一章**：标准库讲完了，最后一章看原生互操作——Python 的 C 扩展 vs Java 的 JNI。`,
  },
  {
    id: "pyvsjava-native",
    icon: "🔌",
    title: "原生互操作：C 扩展 vs JNI",
    group: "运行时与底层",
    content: `# 原生互操作：C 扩展 vs JNI

## 一、为什么要与 C/C++ 互操作

Python 和 Java 都是"托管语言"——运行在虚拟机上，由 GC 管理内存。但有时候必须与原生代码（C/C++）互操作：

\`\`\`
需要原生互操作的场景：
1. 性能：CPU 密集型任务，Python/Java 太慢
2. 复用：调用现有的 C/C++ 库（如 OpenSSL、BLAS）
3. 硬件：访问硬件接口（GPU、传感器）
4. 系统调用：调用操作系统 API
5. 遗留代码：包装老的 C 代码库

Python 的方案：C 扩展 / ctypes / cffi / Cython
Java 的方案：JNI / JNA / Project Panama
\`\`\`

\`\`\`
Python 原生互操作方案：
┌────────────────────────────────────────────┐
│ C 扩展（最底层，最高性能）                  │
│   直接用 CPython C API 写 C 模块            │
├────────────────────────────────────────────┤
│ Cython（Python 超集 → C）                   │
│   写类 Python 代码，编译为 C 扩展            │
├────────────────────────────────────────────┤
│ cffi（C Foreign Function Interface）        │
│   在 Python 中直接调用 C 库函数             │
├────────────────────────────────────────────┤
│ ctypes（标准库，简单 FFI）                  │
│   动态加载 .so/.dll，调用 C 函数            │
└────────────────────────────────────────────┘

Java 原生互操作方案：
┌────────────────────────────────────────────┐
│ JNI（Java Native Interface）               │
│   最底层，写 C 代码桥接                     │
├────────────────────────────────────────────┤
│ JNA（Java Native Access）                  │
│   动态调用 C 库，无需写 C 代码              │
├────────────────────────────────────────────┤
│ Project Panama（JDK 22+，替代 JNI）        │
│   现代 FFI，性能接近 JNI                    │
├────────────────────────────────────────────┤
│ GraalVM Polyglot                           │
│   多语言互操作（Python/JS/Ruby 互调）       │
└────────────────────────────────────────────┘
\`\`\`

## 二、Python 的 C 扩展

### 1. 直接用 CPython C API

最底层的方式——直接用 C 写 Python 模块：

\`\`\`c
// mymath.c —— 一个简单的 C 扩展
#include <Python.h>

// 实现一个加法函数
static PyObject* py_add(PyObject* self, PyObject* args) {
    long a, b;
    if (!PyArg_ParseTuple(args, "ll", &a, &b)) {
        return NULL;
    }
    return PyLong_FromLong(a + b);
}

// 方法定义表
static PyMethodDef methods[] = {
    {"add", py_add, METH_VARARGS, "Add two numbers"},
    {NULL, NULL, 0, NULL}
};

// 模块定义
static struct PyModuleDef module = {
    PyModuleDef_HEAD_INIT,
    "mymath",
    NULL,
    -1,
    methods
};

// 模块初始化函数
PyMODINIT_FUNC PyInit_mymath(void) {
    return PyModule_Create(&module);
}
\`\`\`

\`\`\`python
# setup.py —— 编译配置
from setuptools import setup, Extension

ext = Extension("mymath", sources=["mymath.c"])
setup(name="mymath", ext_modules=[ext])

# 编译
# python setup.py build_ext --inplace
\`\`\`

\`\`\`python
# 使用
import mymath
print(mymath.add(1, 2))  # 3
\`\`\`

这是性能最高的方式（NumPy 就是这样写的），但开发成本极高——你要懂 C、懂 CPython 内部、懂引用计数。

### 2. CPython C API 的痛点

\`\`\`
C 扩展的痛点：
1. 手动引用计数：Py_INCREF / Py_DECREF，容易出错
   - 少 DECREF → 内存泄漏
   - 多 DECREF → 崩溃
2. 类型检查繁琐：PyArg_ParseTuple 的格式字符串
3. 异常处理：要返回 NULL 并设置异常
4. CPython 版本绑定：C API 不稳定，跨版本要重新编译
5. GIL 显式管理：Py_BEGIN_ALLOW_THREADS / Py_END_ALLOW_THREADS
\`\`\`

\`\`\`c
// 引用计数错误的典型例子
static PyObject* bad_example(PyObject* self, PyObject* args) {
    PyObject* list = PyList_New(0);
    PyObject* item = PyLong_FromLong(42);
    PyList_Append(list, item);
    Py_DECREF(item);  // 必须手动 DECREF，否则泄漏
    // 如果忘了 Py_DECREF(item) → 内存泄漏
    // 如果 PyList_Append 失败，item 也要 DECREF
    return list;  // 返回 list，调用者负责 DECREF
}
\`\`\`

## 三、Cython：Python 超集编译为 C

Cython 是更友好的方案——写"类 Python"代码，编译为 C 扩展：

\`\`\`python
# mymath.pyx —— Cython 代码
def add(int a, int b):
    return a + b

# 带类型声明的快速版本
cpdef long fast_add(long a, long b):
    return a + b

# 用 cdef 声明 C 变量（不创建 Python 对象）
def sum_list(list data):
    cdef long total = 0
    cdef long x
    for x in data:
        total += x
    return total
\`\`\`

\`\`\`python
# setup.py
from setuptools import setup
from Cython.Build import cythonize

setup(ext_modules=cythonize("mymath.pyx"))

# 编译
# python setup.py build_ext --inplace
\`\`\`

Cython 的优势：
\`\`\`
Cython 的优势：
1. 语法接近 Python，学习曲线低
2. 类型声明可选（cdef），渐进优化
3. 自动管理引用计数
4. 性能接近纯 C（比 Python 快 10-100 倍）
5. NumPy 集成良好

典型用途：
- 优化热点代码（不动整体架构）
- 包装 C/C++ 库
- 数值计算（替代纯 C 扩展）
\`\`\`

## 四、ctypes：标准库 FFI

Python 标准库自带的 \`ctypes\` 可以直接调用 C 库，无需写 C 代码：

\`\`\`python
import ctypes

# 加载 C 标准库
libc = ctypes.CDLL("libc.so.6")  # Linux
# libc = ctypes.CDLL("libc.dylib")  # macOS

# 调用 printf
libc.printf(b"Hello from C, %d\\n", 42)

# 调用数学库
import ctypes.util
libm = ctypes.CDLL(ctypes.util.find_library("m"))
libm.sqrt.restype = ctypes.c_double  # 设置返回类型
libm.sqrt.argtypes = [ctypes.c_double]  # 设置参数类型
print(libm.sqrt(2.0))  # 1.4142135623730951
\`\`\`

\`\`\`python
# 调用自定义 C 库
# /* mylib.c */
# int add(int a, int b) { return a + b; }
# 编译：gcc -shared -o libmylib.so mylib.c

import ctypes
lib = ctypes.CDLL("./libmylib.so")
lib.add.restype = ctypes.c_int
lib.add.argtypes = [ctypes.c_int, ctypes.c_int]
print(lib.add(1, 2))  # 3
\`\`\`

ctypes 的优缺点：
\`\`\`
ctypes 优点：
1. 标准库，无需安装
2. 无需写 C 代码
3. 动态加载，无需编译

ctypes 缺点：
1. 性能比 C 扩展差（每次调用有 FFI 开销）
2. 类型声明繁琐（restype/argtypes）
3. 不安全（C 类型映射容易出错）
4. 不能直接访问 C 结构体（要用 ctypes.Structure）
\`\`\`

## 五、cffi：更现代的 FFI

cffi 是 ctypes 的现代替代，更高效、更安全：

\`\`\`python
from cffi import FFI

ffi = FFI()

# 直接声明 C 函数签名（ABI 模式）
ffi.cdef("int add(int, int);")
lib = ffi.dlopen("./libmylib.so")
print(lib.add(1, 2))  # 3

# API 模式：编译期生成 C 扩展（更快）
ffi.cdef("""
    typedef struct { int x, y; } Point;
    int distance(Point*, Point*);
""")
# 需要配合 setup.py 编译
\`\`\`

cffi 比 ctypes 快，因为 API 模式编译期生成 C 代码。但 ABI 模式（动态加载）仍需运行时解析。

## 六、Java 的 JNI

### 1. JNI 工作流程

JNI 是 Java 的"原生互操作"标准，但流程繁琐：

\`\`\`
JNI 流程：
1. Java 中声明 native 方法
2. 用 javac 编译
3. 用 javah 生成 C 头文件（JDK 10+ 用 javac -h）
4. 用 C 实现该方法
5. 编译 C 代码为 .so/.dll
6. Java 加载库并调用
\`\`\`

\`\`\`java
// 1. 声明 native 方法
public class MyMath {
    static {
        System.loadLibrary("mymath");  // 加载 libmymath.so
    }

    public native int add(int a, int b);  // native 关键字
}
\`\`\`

\`\`\`bash
# 2. 生成头文件
javac MyMath.java
javac -h . MyMath.java  # JDK 10+ 生成 MyMath.h
\`\`\`

\`\`\`c
/* 3. 生成的头文件 MyMath.h */
#include <jni.h>
JNIEXPORT jint JNICALL Java_MyMath_add
        (JNIEnv *, jobject, jint, jint);
\`\`\`

\`\`\`c
/* 4. C 实现 MyMath.c */
#include "MyMath.h"

JNIEXPORT jint JNICALL Java_MyMath_add
        (JNIEnv *env, jobject this, jint a, jint b) {
    return a + b;
}
\`\`\`

\`\`\`bash
# 5. 编译为动态库
gcc -shared -I\${JAVA_HOME}/include -I\${JAVA_HOME}/include/linux \
    -o libmymath.so MyMath.c
\`\`\`

\`\`\`java
// 6. 调用
public class Main {
    public static void main(String[] args) {
        MyMath m = new MyMath();
        System.out.println(m.add(1, 2));  // 3
    }
}
\`\`\`

### 2. JNI 的痛点

\`\`\`
JNI 的痛点：
1. 流程繁琐：6 步才能调用一个 C 函数
2. 头文件生成：要 javah/javac -h
3. 类型映射：jint/jlong/jstring vs int/long/char*
4. 字符串转换：GetStringUTFChars/ReleaseStringUTFChars
5. 引用管理：LocalRef/GlobalRef，泄漏会内存溢出
6. 异常处理：ThrowNew，C 中抛 Java 异常
7. 性能开销：每次 JNI 调用有边界开销
8. 平台相关：要为每个平台编译（.so/.dll/.dylib）
\`\`\`

\`\`\`c
// JNI 字符串处理的繁琐
JNIEXPORT jstring JNICALL Java_Utils_process
        (JNIEnv *env, jobject this, jstring input) {
    const char *cstr = (*env)->GetStringUTFChars(env, input, NULL);
    if (cstr == NULL) return NULL;  // OutOfMemoryError

    // 处理 cstr...
    char *result = strdup(cstr);

    // 必须释放，否则 LocalRef 泄漏
    (*env)->ReleaseStringUTFChars(env, input, cstr);

    jstring jresult = (*env)->NewStringUTF(env, result);
    free(result);
    return jresult;
}
\`\`\`

## 七、JNA：Java 的 ctypes

JNA 是 JNI 的简化版——无需写 C 代码，动态调用：

\`\`\`java
import com.sun.jna.Library;
import com.sun.jna.Native;
import com.sun.jna.Platform;

// 1. 定义 C 库接口
interface CLibrary extends Library {
    CLibrary INSTANCE = Native.load("c", CLibrary.class);

    int printf(String format, Object... args);
    double sqrt(double x);
}

// 2. 直接调用
public class JnaDemo {
    public static void main(String[] args) {
        CLibrary.INSTANCE.printf("Hello from C, %d\\n", 42);
        System.out.println(CLibrary.INSTANCE.sqrt(2.0));
    }
}
\`\`\`

\`\`\`
JNA vs JNI 对比：
┌──────────────┬──────────────┬──────────────┐
│ 维度          │ JNI          │ JNA          │
├──────────────┼──────────────┼──────────────┤
│ 需写 C 代码   │ 是           │ 否           │
│ 性能          │ 高           │ 中（有开销）  │
│ 易用性        │ 低           │ 高           │
│ 类型安全      │ 弱           │ 中           │
│ 平台依赖      │ 编译时       │ 运行时       │
└──────────────┴──────────────┴──────────────┘
\`\`\`

JNA 比 JNI 易用很多（类似 Python 的 ctypes），但性能不如 JNI——每次调用都有动态分发的开销。

## 八、Project Panama（JNI 替代）

JDK 22+ 引入的 Project Panama（Foreign Function & Memory API）是 JNI 的现代替代：

\`\`\`java
import java.lang.foreign.*;
import java.lang.invoke.MethodHandle;

public class PanamaDemo {
    public static void main(String[] args) throws Throwable {
        Linker linker = Linker.nativeLinker();
        SymbolLookup stdlib = linker.defaultLookup();

        // 查找 C 函数 sqrt
        MethodHandle sqrt = stdlib.find("sqrt")
                .orElseThrow()
                .asLinker()
                .downcallHandle(
                    FunctionDescriptor.of(ValueLayout.JAVA_DOUBLE, ValueLayout.JAVA_DOUBLE));

        // 调用
        double result = (double) sqrt.invoke(2.0);
        System.out.println(result);  // 1.414...
    }
}
\`\`\`

Project Panama 的优势：
\`\`\`
Project Panama 优势：
1. 无需写 C 代码（类似 JNA）
2. 性能接近 JNI（编译期优化）
3. 内存安全（MemorySegment 替代直接指针）
4. 标准库（JDK 22+ 稳定）
5. 类型安全（FunctionDescriptor）

未来会取代 JNI，但目前（2025）仍在演进
\`\`\`

## 九、性能对比

### Python C 扩展调用开销

\`\`\`python
# Python C 扩展调用：开销很小（直接进入 C）
import timeit

# 纯 Python
def py_add(a, b):
    return a + b

# C 扩展（假设 mymath.add 已编译）
# import mymath
# mymath.add(1, 2)

# 性能对比
print(timeit.timeit("py_add(1, 2)", globals=globals()))
# C 扩展约快 5-10 倍
\`\`\`

\`\`\`
Python FFI 性能排序（从快到慢）：
1. C 扩展（Cython/直接 C API）—— 接近原生 C
2. cffi API 模式 —— 编译期生成，接近 C 扩展
3. cffi ABI 模式 —— 有运行时解析开销
4. ctypes —— 最慢（动态解析）

但即使是 ctypes，对于"调用一次 C 函数做大量计算"的场景，
也比纯 Python 快——因为计算在 C 中完成。
\`\`\`

### Java JNI 开销

\`\`\`java
// JNI 调用有边界开销
public class JniBenchmark {
    public native int add(int a, int b);

    public static void main(String[] args) {
        JniBenchmark b = new JniBenchmark();
        long start = System.nanoTime();
        for (int i = 0; i < 1000000; i++) {
            b.add(1, 2);  // JNI 调用
        }
        long end = System.nanoTime();
        System.out.println("JNI: " + (end - start) / 1_000_000 + "ms");

        start = System.nanoTime();
        for (int i = 0; i < 1000000; i++) {
            int r = 1 + 2;  // 纯 Java
        }
        end = System.nanoTime();
        System.out.println("Java: " + (end - start) / 1_000_000 + "ms");
    }
}
\`\`\`

\`\`\`
JNI 性能特征：
- 单次调用开销：~10-100 纳秒（远高于 Java 方法内联）
- 频繁调用小函数：JNI 反而比纯 Java 慢
- 调用做大量计算：JNI 才划算

JNI 不适合"频繁调用小函数"——边界开销会吃掉性能优势。
最佳实践：把"批量计算"放在 C 中，一次调用完成。
\`\`\`

## 十、NumPy 为什么快

NumPy 是 Python 性能优化的教科书案例：

\`\`\`python
import numpy as np
import time

# 纯 Python：逐元素相加
a = list(range(1000000))
b = list(range(1000000))

start = time.time()
c = [x + y for x, y in zip(a, b)]
print(f"Python: {time.time() - start:.3f}s")

# NumPy：底层 C 一次完成
a_np = np.array(a)
b_np = np.array(b)

start = time.time()
c_np = a_np + b_np
print(f"NumPy: {time.time() - start:.3f}s")
\`\`\`

\`\`\`
NumPy 快的原因：
1. 底层是 C 扩展（CPython C API 直接调用 BLAS）
2. 连续内存布局（C 数组，缓存友好）
3. 单次 C 调用完成整个数组操作（避免 Python 循环开销）
4. 向量化（SIMD 指令）
5. 无类型检查（C 中类型固定）

关键洞察：
- NumPy 不是"Python 跑得快"，而是"Python 调用 C 跑得快"
- 一次 C 调用完成 100 万次加法，Python 循环开销消失
\`\`\`

\`\`\`python
# 反例：把 NumPy 当 Python 循环用，反而慢
a = np.arange(1000000)
result = 0
for x in a:  # 错误用法：每次循环都有 Python ↔ C 转换开销
    result += x
# 这比纯 Python list 循环还慢！

# 正确用法：用 NumPy 的向量化操作
result = a.sum()  # 一次 C 调用完成
\`\`\`

## 十一、Java 大数据为什么快

Java 在大数据领域（Hadoop/Spark/Flink）快的原因：

\`\`\`
Java 大数据快的根源：
1. JIT 编译：热点方法编译为机器码，接近 C++
2. 静态类型：编译期优化空间大
3. 多线程：java.util.concurrent 成熟，充分利用多核
4. 内存布局：对象连续，缓存友好（虽然不如 C）
5. GC 调优：G1/ZGC 控制停顿
6. 生态：Hadoop/Spark/Flink 都是 JVM 生态

对比 Python 大数据：
- PySpark 是"远程调用" JVM，性能不如 Java/Scala
- Python 的 GIL 限制了单进程多核
- Python 对象内存占用大（每个 int 28 字节）
\`\`\`

\`\`\`java
// Spark 大数据处理（Java/Scala 是第一公民）
Dataset<Row> df = spark.read().parquet("hdfs://data/");
df.filter(col("age").gt(18))
  .groupBy(col("city"))
  .agg(sum("income").alias("total"))
  .write().parquet("hdfs://output/");
// 底层 JVM JIT 编译，性能接近原生
\`\`\`

\`\`\`python
# PySpark 同样的逻辑，但性能不如 Java/Scala
df = spark.read.parquet("hdfs://data/")
df.filter(col("age") > 18) \\
  .groupBy("city") \\
  .agg(sum("income").alias("total")) \\
  .write.parquet("hdfs://output/")
# Python 调用 JVM，有序列化开销
\`\`\`

## 十二、GraalVM Polyglot：多语言互操作

GraalVM 提供了独特的**多语言互操作**——同一 JVM 上跑 Python、JS、Ruby，互调无开销：

\`\`\`java
// Java 调用 Python（GraalVM Polyglot）
import org.graalvm.polyglot.*;

public class PolyglotDemo {
    public static void main(String[] args) {
        try (Context context = Context.create()) {
            // 在 Python 中执行
            Value result = context.getBindings("python").eval("python",
                "import math\\nmath.sqrt(2.0)");
            System.out.println(result.asDouble());  // 1.414...

            // Java 调用 Python 函数
            context.eval("python", "def add(a, b): return a + b");
            Value addFn = context.getBindings("python").getMember("add");
            System.out.println(addFn.execute(1, 2).asInt());  // 3
        }
    }
}
\`\`\`

\`\`\`
GraalVM Polyglot 优势：
1. 同一 JVM 跑多语言
2. 无序列化开销（共享内存）
3. 性能接近原生（GraalVM 优化）
4. 适合"Python 数据科学 + Java 后端"混合架构

但 GraalVM Python 实现不完整，C 扩展支持有限
\`\`\`

## 十三、互操作方案对比表

| 方案 | 语言 | 需写 C | 性能 | 易用性 | 典型用途 |
|------|------|--------|------|--------|----------|
| C 扩展 | Python | 是 | 最高 | 低 | NumPy 等核心库 |
| Cython | Python | 否（写 .pyx） | 高 | 中 | 性能优化 |
| cffi API | Python | 否（声明签名） | 高 | 中 | 包装 C 库 |
| cffi ABI | Python | 否 | 中 | 高 | 快速调用 |
| ctypes | Python | 否 | 低 | 最高 | 简单调用 |
| JNI | Java | 是 | 高 | 最低 | 系统级集成 |
| JNA | Java | 否 | 中 | 高 | 快速调用 |
| Panama | Java | 否 | 高 | 中 | 现代 FFI |
| GraalVM | 多语言 | 否 | 高 | 中 | 多语言互操作 |

## 十四、一句话总结

- **Python** 的 C 扩展生态极其成熟（NumPy/TensorFlow 都基于此），让 Python 在"AI/数据科学"领域称王——但开发 C 扩展门槛高，是少数专家的领域。
- **Java** 的 JNI 繁琐但底层，JNA 简化但慢，Project Panama 是未来——Java 的原生互操作在演进，但生态不如 Python。

NumPy 的成功证明了"Python 前端 + C 后端"的威力——Python 提供易用性，C 提供性能。这种"胶水语言"哲学是 Python 在 AI 时代称霸的根本原因。Java 走的是另一条路——JIT 让 Java 本身就快，原生互操作需求相对少，但在大数据领域（Hadoop/Spark）依然需要 JVM 的极致性能。

---

> **第 4 批章节（运行时与底层）到此结束。** 我们从解释器架构、执行流水线、内存模型、垃圾回收、标准库生态、原生互操作六个维度，深入对比了 Python 和 Java 的底层差异。CPython 的简洁与 JVM 的复杂，引用计数的即时与分代 GC 的批量，电池全含的友好与工程化标准的严谨——这些差异共同塑造了两门语言各自的"性格"。`,
  },
];
