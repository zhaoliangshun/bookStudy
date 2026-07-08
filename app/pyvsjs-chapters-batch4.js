// =============================================================
// Python vs JavaScript/TypeScript/Node.js 深度对比 —— 第 4 批
// -------------------------------------------------------------
// 转义规则：content 内部反引号写作 \`，${ 写作 \$\{
// =============================================================

export const chapters = [
  {
    id: "pyvsjs-interpreter",
    icon: "🔧",
    title: "解释器架构：CPython vs V8",
    group: "运行时与底层",
    content: `# 第 16 章 解释器架构：CPython vs V8

解释器架构决定了语言的运行性能特征。Python 和 JavaScript 虽然都是动态类型语言，但它们的官方实现 CPython 和 V8 采取了截然不同的策略：CPython 选择了一条朴素的字节码解释器路线，而 V8 则走上了激进的 JIT 编译道路。这种选择直接造就了两者在性能上的巨大差距——V8 在计算密集任务上通常比 CPython 快 1-2 个数量级。

## 16.1 CPython 的架构：从树遍历到字节码

CPython 的执行流程可以概括为三步：

1. **词法分析与语法分析**：源码 → Token → CST → AST
2. **编译**：AST → 字节码（缓存到 .pyc 文件）
3. **执行**：字节码由 ceval 主循环逐条解释执行

\`\`\`
源码 → Token → CST → AST → 字节码(.pyc) → ceval 主循环 → 结果
\`\`\`

CPython 的核心是 \`Python/ceval.c\` 中的 \`PyEval_EvalFrameDefault\` 函数（Python 3.11 后引入了帧栈优化），它本质上是一个巨大的 switch-case 循环，对每条字节码指令进行分发执行。

### ceval 主循环简化示意

\`\`\`c
// Python/ceval.c 简化版（实际远比这复杂）
PyObject* PyEval_EvalFrame(PyThreadState *tstate, PyFrameObject *f) {
    while (true) {
        int opcode = NEXTOP();          // 取下一条指令
        int oparg = NEXTARG();          // 取指令参数
        switch (opcode) {
            case LOAD_FAST: {
                PyObject *value = GETLOCAL(oparg);
                PUSH(value);            // 压入操作数栈
                break;
            }
            case BINARY_ADD: {
                PyObject *right = POP();
                PyObject *left = POP();
                PyObject *res = PyNumber_Add(left, right);
                PUSH(res);
                Py_DECREF(left);
                Py_DECREF(right);
                break;
            }
            case CALL_FUNCTION: {
                // 函数调用的复杂处理...
                break;
            }
            case RETURN_VALUE:
                return POP();
        }
    }
}
\`\`\`

这是一个典型的**栈式字节码解释器**：操作数栈 + 指令指针。每条指令都要经过"取指 → 译码 → 执行"三步，且每一步都伴随着 C 函数调用、指针解引用、引用计数维护。

### CPython 的性能瓶颈

- **每次操作都分配对象**：\`a + b\` 在 CPython 中要新建一个 int 对象，即使 a、b 都是小整数
- **类型检查开销**：每次 \`PyNumber_Add\` 都要查询对象的 \`ob_type\`，调用对应的 \`nb_add\` 槽函数
- **解释器开销**：每条字节码都要进入 switch-case 分发，无法内联
- **引用计数开销**：每次 PUSH/POP 都要调整引用计数
- **GIL 限制**：多线程无法真正并行执行 Python 字节码

## 16.2 V8 的架构：分层 JIT 编译

V8 走的是完全不同的路线。早期 V8（2017 年前）直接把源码 JIT 编译为机器码，启动慢但峰值高。自 2017 年引入 Ignition 字节码解释器后，形成了多层编译架构：

\`\`\`
源码 → AST → 字节码(Ignition) → 热点代码 → Sparkplug → Maglev → TurboFan(机器码)
\`\`\`

### V8 的分层编译策略

| 层级 | 名称 | 作用 | 优化级别 | 启用时间 |
|------|------|------|----------|----------|
| 1 | Ignition | 字节码解释器 + profiling | 无 | 2017 |
| 2 | Sparkplug | 基线编译器（非优化 JIT） | 低 | 2021 |
| 3 | Maglev | 中等优化 JIT | 中 | 2023 |
| 4 | TurboFan | 顶级优化 JIT | 高 | 2017 |

**Ignition** 负责快速启动和收集类型反馈（type feedback）。它会记录每个变量的实际类型、调用目标等信息，存入反馈向量（feedback vector）。

**TurboFan** 在 Ignition 收集到足够"热点"后介入，基于类型反馈做激进优化：
- **类型特化**：假设变量永远是 int，直接生成机器指令
- **内联**：把小函数直接展开到调用处
- **逃逸分析**：把堆对象分配转为栈分配
- **去虚拟化**：把动态调用静态化

### V8 优化后的伪机器码

\`\`\`javascript
function add(a, b) { return a + b; }
// Ignition 收集到 a、b 总是 SMI（小整数）后
// TurboFan 生成接近原生性能的机器码：
\`\`\`

\`\`\`asm
; 优化后的伪机器码（无对象分配、无类型检查）
mov rax, [a]          ; 直接读 a
mov rcx, [b]          ; 直接读 b
add rax, rcx          ; 一条指令完成加法
ret                   ; 返回
\`\`\`

对比 CPython 的 \`BINARY_ADD\` 需要：弹出栈、查类型表、调用 \`nb_add\`、分配新对象、压栈、调整引用计数——大约 20-30 条机器指令才能完成同样的事。

## 16.3 为什么 V8 比 CPython 快

| 维度 | CPython | V8 |
|------|---------|-----|
| 执行方式 | 字节码解释 | JIT 编译为机器码 |
| 类型信息 | 运行时反复查询 | 编译期特化 |
| 函数调用 | 通用调用约定 | 内联展开 |
| 内存分配 | 频繁分配对象 | 栈分配/寄存器分配 |
| 循环开销 | switch-case 分发 | 直接顺序执行 |
| 启动速度 | 快 | 慢（需预热） |
| 峰值性能 | 低 | 高 |
| 可预测性 | 稳定 | 有去优化抖动 |

**核心差异**：CPython 在执行时还在"翻译"每条字节码（每条都要走 switch-case 分发），而 V8 把热点代码"翻译"了一次后，后续就是直接跑机器码——只有首次编译开销和偶尔的去优化。

## 16.4 实际性能对比

\`\`\`python
# Python：累加求和
def sum_n(n):
    s = 0
    for i in range(n):
        s += i
    return s

print(sum_n(10_000_000))  # CPython ≈ 0.6s
\`\`\`

\`\`\`javascript
// JavaScript：同样逻辑
function sumN(n) {
    let s = 0;
    for (let i = 0; i < n; i++) s += i;
    return s;
}
console.log(sumN(10_000_000));  // V8 ≈ 0.05s（约 12 倍快）
\`\`\`

注意：JavaScript 中如果用 \`var\` 而非 \`let\`，或者把 \`s\` 改成对象属性访问，V8 的优化会大打折扣。**JIT 只能优化它"看得懂"的代码**——这也是为什么 TypeScript 能间接提升性能（类型信息帮助 V8 做更激进的优化假设）。

## 16.5 CPython 的演进方向

CPython 团队并非不知道这些差距，但他们选择了不同的优先级：
- **可维护性**：ceval.c 简单清晰，便于社区开发者理解
- **兼容性**：庞大的 C 扩展生态依赖稳定的 C API
- **3.11 的 specializing interpreter**：在字节码层做特化（如 \`BINARY_OP_ADD_INT\`）
- **3.12-3.13 的 copy-and-patch**：实验性的快速编译技术
- **PEP 703 的 nogil**：移除 GIL，让多线程真正并行

### 3.13 的 specializing interpreter

\`\`\`python
# Python 3.11+ 会在执行时把通用指令特化为具体变体
# 例如 BINARY_OP 会变成 BINARY_OP_ADD_INT / BINARY_OP_ADD_FLOAT
import dis
def f(a, b):
    return a + b

dis.dis(f)
#  3           0 LOAD_FAST                0 (a)
#              2 LOAD_FAST                1 (b)
#              4 BINARY_OP                0 (+)    ← 通用指令
#              6 RETURN_VALUE

# 多次调用后，CPython 会特化：
#              4 BINARY_OP_ADD_INT        ← 特化版本，跳过类型检查
\`\`\`

## 16.6 第三方实现

也有第三方实现追求性能：

| 实现 | 策略 | 性能 | 兼容性 |
|------|------|------|--------|
| PyPy | JIT 编译 | 接近 V8 的 1/3 | 大部分兼容 |
| Cython | 编译为 C | 接近 C | 需类型注解 |
| Numba | 科学计算 JIT | 接近 Fortran | 仅数值场景 |
| GraalPy | 基于 GraalVM | 接近 V8 的 1/2 | 实验性 |
| Pyston | JIT（Dropbox） | 约 2 倍 CPython | 部分兼容 |

PyPy 是最完整的替代方案，但它对 C 扩展的支持有限——这正是 NumPy、Pandas 等关键库无法在 PyPy 上跑得快的原因。

## 16.7 设计哲学对比

| 哲学 | CPython | V8 |
|------|---------|-----|
| 优先级 | 生态、可维护性 | 性能、启动-峰值平衡 |
| 复杂度 | 低（核心约 5 万行 C） | 高（核心约 100 万行 C++） |
| 优化激进程度 | 保守 | 激进（去优化是常态） |
| 适用场景 | 胶水语言、脚本、AI | 浏览器、服务端、高并发 |

## 16.8 小结

CPython 和 V8 代表了动态语言实现的两种哲学：
- **CPython**：简单、可移植、可扩展，性能换生态
- **V8**：复杂、激进优化、性能优先，但牺牲了启动速度和可预测性

CPython 的"慢"是刻意的设计选择——它换来了 Python 庞大的 C 扩展生态和极致的可移植性。而 V8 的"快"则建立在复杂的分层编译、激进的类型假设和频繁的去优化之上。

下一章我们会深入 Python 的字节码反汇编和 V8 的分层编译细节，看具体是怎么一步步执行的。`,
  },
  {
    id: "pyvsjs-execution",
    icon: "⚙️",
    title: "执行流水线：字节码 vs JIT",
    group: "运行时与底层",
    content: `# 第 17 章 执行流水线：字节码 vs JIT

上一章我们看了 CPython 和 V8 的整体架构。这一章深入到执行流水线的细节：源码是怎么一步步变成可执行结果的？Python 的 \`dis\` 模块能让我们看到字节码；V8 的 \`--print-bytecode\` 和 \`--trace-turbo\` 能看到 JIT 的全过程。

## 17.1 Python 的编译流程

Python 的编译流程是**完全 Ahead-of-Time**的（在执行前一次性编译完）：

\`\`\`
源码(.py)
   ↓ lexer + parser
CST (具体语法树)
   ↓ AST 优化器
AST (抽象语法树)
   ↓ compiler
字节码 (Code Object)
   ↓ 写入 .pyc 文件（缓存）
ceval 解释执行
\`\`\`

### 用 dis 模块反汇编字节码

\`\`\`python
import dis

def add(a, b):
    return a + b

dis.dis(add)
#  1           0 RESUME                   0
#  2           2 LOAD_FAST                0 (a)
#              4 LOAD_FAST                1 (b)
#              6 BINARY_OP                0 (+)
#             10 RETURN_VALUE
\`\`\`

每条字节码指令由：**操作码（opcode）+ 参数（oparg）** 组成。CPython 3.6+ 使用"固定 2 字节指令"格式（wordcode），每条指令占 2 字节：1 字节 opcode + 1 字节 oparg。

### 字节码的关键指令类别

| 类别 | 示例指令 | 作用 |
|------|----------|------|
| 加载/存储 | LOAD_FAST, STORE_FAST | 局部变量进出栈 |
| 常量 | LOAD_CONST | 加载常量到栈 |
| 二元运算 | BINARY_OP | 加减乘除等 |
| 调用 | CALL, PRECALL | 函数调用 |
| 跳转 | JUMP_FORWARD, POP_JUMP_IF_FALSE | 控制流 |
| 名称 | LOAD_NAME, STORE_NAME | 全局/模块变量 |

### .pyc 文件缓存

\`\`\`python
# 第一次运行 mymodule.py 会生成：
# __pycache__/mymodule.cpython-311.pyc
# 包含：magic number + 源码 mtime + 字节码

# 下次导入时，CPython 检查 mtime，
# 如果 .py 没改，直接加载 .pyc，跳过编译
\`\`\`

## 17.2 V8 的执行流程

V8 的流程是**多层渐进**的：先快速编译成字节码跑起来，跑得多了再逐步优化。

\`\`\`
源码(.js)
   ↓ parser (lazy parsing)
AST (抽象语法树)
   ↓ Ignition 编译器
字节码 (Ignition)
   ↓ 执行 + profiling（收集类型反馈）
   ↓ 检测到热点（同一段代码执行多次）
Sparkplug（基线编译，快速生成未优化机器码）
   ↓ 更高热度
Maglev（中等优化 JIT）
   ↓ 最高热度 + 类型反馈稳定
TurboFan（顶级优化 JIT，机器码）
   ↓ 类型假设被违反
去优化（deopt）→ 回到 Ignition
\`\`\`

### V8 字节码示例

\`\`\`bash
# 用 --print-bytecode 看字节码
node --print-bytecode -e "function add(a,b){return a+b}; add(1,2)"
\`\`\`

\`\`\`
# 输出大致（简化）：
Lda a                    [0]    # 加载 a 到累加器
Star r0                         # 存到寄存器 r0
Lda a                    [1]    # 加载 b
Star r1                         # 存到 r1
LdaSmi 0x2                      # 加载常量 2（Add 操作码）
Add r0, r1                      # r0 + r1
Return                          # 返回
\`\`\`

注意 V8 的字节码是**基于寄存器**的（不像 CPython 基于栈），这减少了很多 PUSH/POP 操作。

## 17.3 JIT 的工作原理

JIT 的核心是**"用观察到的运行时信息做编译期假设"**。三个关键机制：

### 1. Profiling（性能分析）

Ignition 在执行字节码时，会把每个操作的实际类型记录到**反馈向量**里：

\`\`\`javascript
function add(a, b) { return a + b; }

add(1, 2);       // 反馈：a、b 都是 SMI（小整数）
add(3, 4);       // 再次确认
// 反馈向量现在记录：(a: SMI, b: SMI) → SMI
\`\`\`

### 2. 热点检测（Hot Spot Detection）

V8 用调用计数器跟踪每段代码的执行次数。当计数器超过阈值（默认几千次），就触发上一层编译：

\`\`\`
执行次数 < 1000         → Ignition 解释执行
1000 < 次数 < 10000     → Sparkplug 编译
10000 < 次数 < 100000   → Maglev 编译
次数 > 100000           → TurboFan 编译
\`\`\`

### 3. 去优化（Deoptimization）

如果运行时假设被违反，V8 必须丢弃优化代码，回到 Ignition：

\`\`\`javascript
function add(a, b) { return a + b; }

for (let i = 0; i < 100000; i++) add(1, 2);  // TurboFan 假设 a、b 是 int
add("hello", "world");                          // 类型违反！触发去优化
// 优化代码被丢弃，回到 Ignition，重新收集反馈
\`\`\`

去优化是有成本的：要把寄存器状态映射回栈帧，可能产生几毫秒的停顿。**频繁去优化会导致性能抖动**——这是 JIT 程序"时快时慢"的根源。

## 17.4 为什么 JIT 比 AST 解释器快但启动慢

| 维度 | AST 解释器（旧 V8） | 字节码解释器（CPython/Ignition） | JIT（TurboFan） |
|------|---------------------|--------------------------------|-----------------|
| 启动速度 | 慢（要编译 AST） | 快 | 慢（要编译机器码） |
| 峰值性能 | 低 | 中 | 高 |
| 内存占用 | 低 | 低（字节码紧凑） | 高（机器码 + 反馈） |
| 可预测性 | 高 | 高 | 低（去优化抖动） |

**JIT 启动慢的原因**：
1. 必须先跑 Ignition 收集反馈
2. 反馈足够后才能启动 TurboFan 编译（编译本身耗时）
3. 编译后的代码可能被去优化，需要重新编译

**JIT 峰值高的原因**：
1. 机器码直接执行，无解释开销
2. 类型特化省去了运行时类型检查
3. 函数内联消除了调用开销
4. 寄存器分配比栈式解释更高效

## 17.5 Python 3.13 的 specializing interpreter

CPython 3.11 引入了 **specializing interpreter**——一个介于纯解释器和 JIT 之间的中间方案。

### 特化原理

通用字节码 \`BINARY_OP\` 在执行时会根据操作数类型，被**原地替换**为特化版本：

\`\`\`python
# 3.11+ 的特化指令示例
BINARY_OP_ADD_INT       # 两个 int 相加，跳过类型检查
BINARY_OP_ADD_FLOAT     # 两个 float 相加
BINARY_OP_ADD_UNICODE   # 字符串拼接
LOAD_FAST__LOAD_FAST    # 连续两个 LOAD_FAST 合并
STORE_FAST__LOAD_FAST   # STORE 后立即 LOAD 的合并
\`\`\`

### 特化的触发

\`\`\`python
import dis
import opcode

def f(a, b):
    return a + b

# 先调用几次让解释器观察类型
f(1, 2); f(3, 4); f(5, 6)

dis.dis(f)
# 注意 BINARY_OP 可能已变成 BINARY_OP_ADD_INT
\`\`\`

这其实是一种"穷人版 JIT"——不做完整编译，但在字节码层做特化。3.11 在不破坏 C API 的前提下获得了 10-60% 的提速。

### 3.13 的 copy-and-patch

\`\`\`python
# Python 3.13 引入实验性 JIT：copy-and-patch
# 不像 V8 那样复杂，而是把每条字节码对应的机器码模板"复制粘贴"出来
# 启用方式：
# python -X jit myscript.py
\`\`\`

这是一个轻量级 JIT，目标是接近 PyPy 的性能，但保持 CPython 的兼容性。

## 17.6 启动时间对比

| 场景 | CPython | Node.js (V8) |
|------|---------|--------------|
| 启动时间 | ~30ms | ~50ms |
| 首次执行 | 立即 | 需 Ignition 编译 |
| 稳定性能 | 早期就稳定 | 预热后才稳定 |
| 短脚本 | CPython 占优 | V8 启动开销大 |
| 长期服务 | CPython 慢 | V8 优化后快 |

这就是为什么 **CLI 工具用 Python 更合适**（启动快、无预热），而 **长期运行的服务用 Node.js 更合适**（JIT 优化后吞吐高）。

## 17.7 实战：观察 JIT 优化

\`\`\`bash
# Node.js：观察优化过程
node --trace-opt --trace-deopt -e "
function hot(x) { return x + 1; }
for (let i = 0; i < 100000; i++) hot(i);
hot('oops');  // 触发去优化
"
\`\`\`

输出会显示：
- 何时函数被 Sparkplug/Maglev/TurboFan 编译
- 何时被去优化
- 去优化的原因（类型不匹配等）

\`\`\`python
# Python：观察特化
import dis
import sys

def hot(x):
    return x + 1

for i in range(100000):
    hot(i)

# 3.11+ 可以看到特化指令
if sys.version_info >= (3, 11):
    dis.dis(hot)
    # BINARY_OP 可能已被特化为 BINARY_OP_ADD_INT
\`\`\`

## 17.8 总结对比表

| 维度 | CPython | V8 |
|------|---------|-----|
| 编译时机 | AOT（导入时） | 渐进（运行时） |
| 中间表示 | 字节码（基于栈） | 字节码（基于寄存器）+ 机器码 |
| 优化层级 | 1 层（3.13 加 specializing） | 4 层（Ignition/Sparkplug/Maglev/TurboFan） |
| 类型反馈 | 无（3.13 实验性） | 有（feedback vector） |
| 去优化 | 无需（无激进假设） | 有（类型违反时） |
| 启动速度 | 快 | 慢 |
| 峰值性能 | 低 | 高 |
| 字节码缓存 | .pyc | 无（每次启动重新编译） |
| 调试可见性 | dis 模块清晰 | 需 --trace-* 标志 |

## 17.9 小结

CPython 的执行流水线是"**一次编译，反复解释**"——简单、可预测、启动快，但峰值低。

V8 的执行流水线是"**渐进编译，按需优化**"——复杂、有抖动、启动慢，但峰值高。

Python 3.11+ 的 specializing interpreter 是一次重要尝试：在不引入完整 JIT 复杂度的前提下，用字节码特化获得可观提速。而 3.13 的 copy-and-patch 实验性 JIT 则预示着 CPython 未来可能走上 JIT 之路——但会是一条与 V8 截然不同的、保守而兼容的道路。

下一章我们会深入两边的内存模型——对象在内存里到底长什么样？`,
  },
  {
    id: "pyvsjs-memory",
    icon: "💾",
    title: "内存模型与对象表示",
    group: "运行时与底层",
    content: `# 第 18 章 内存模型与对象表示

理解一门语言的内存模型，是理解其性能特征的关键。Python 的"一切皆对象"和 JavaScript 的"隐藏类 + 内联缓存"代表了两种截然不同的对象表示哲学——前者追求简单统一，后者追求性能优化。

## 18.1 CPython：一切皆 PyObject

在 CPython 中，**所有对象**都以 \`PyObject\` 结构开头：

\`\`\`c
// Python/object.h（简化）
typedef struct _object {
    Py_ssize_t ob_refcnt;       // 引用计数
    PyTypeObject *ob_type;      // 类型指针
} PyObject;

// int 对象（不可变）
typedef struct {
    PyObject ob_base;           // 必须在开头
    Py_ssize_t ob_size;         // 数字个数（可正可负，表示符号）
    digit ob_digit[1];          // 柔性数组，30 位数字
} PyLongObject;

// list 对象
typedef struct {
    PyObject ob_base;
    Py_ssize_t ob_size;         // 当前长度
    PyObject **ob_item;         // 指针数组
    Py_ssize_t allocated;       // 已分配容量
} PyListObject;
\`\`\`

每个 Python 对象至少占用 **16 字节**（64 位系统）：8 字节 refcnt + 8 字节 type 指针。

### 小整数缓存

\`\`\`python
# CPython 缓存了 -5 到 256 的整数
a = 256
b = 256
print(a is b)   # True，同一个对象

c = 257
d = 257
print(c is d)   # False，不同对象（每行新创建）
\`\`\`

## 18.2 int 对象：30 位数字数组

Python 的 int 是**任意精度**的，没有溢出问题：

\`\`\`c
// 一个 PyLongObject 用 30 位的 digit 数组表示大数
// 例如 2**100 需要 4 个 digit：
// ob_digit[0] = 低 30 位
// ob_digit[1] = 次 30 位
// ob_digit[2] = ...
// ob_digit[3] = 高 30 位
\`\`\`

\`\`\`python
# 验证：大整数运算不会溢出
big = 2 ** 1000
print(big)  # 302 位的十进制数，依然精确
print(big + 1 == big)  # False

# 但代价是慢：每次运算都要分配新对象
import time
start = time.time()
s = 0
for i in range(10_000_000):
    s += i
print(time.time() - start)  # ~0.6s，远慢于 int64
\`\`\`

为什么用 30 位而不是 32 位？因为 30 位留出了 2 位用于进位检测，使得 C 语言实现加法时不需要处理溢出。

## 18.3 list：指针数组

Python 的 list 不是直接存对象，而是存**指向对象的指针**：

\`\`\`
list 对象
┌──────────────┐
│ ob_refcnt    │
│ ob_type      │
│ ob_size = 3  │
│ allocated=8  │
│ ob_item ─────┼───→ [ptr0][ptr1][ptr2][...][...][...][...][...]
└──────────────┘                    │      │      │
                                    ↓      ↓      ↓
                                 int(1) str(2) list(...)
\`\`\`

\`\`\`python
# list 的内存特征
import sys
lst = [1, 2, 3]
print(sys.getsizeof(lst))  # ~88 字节（对象头 + 8 个指针槽）

# 每个 int 元素还要单独占 28 字节
print(sys.getsizeof(1))    # 28 字节
# 总占用：88 + 3*28 = 172 字节，存 3 个数字！
\`\`\`

对比：C 语言存 3 个 int64 只需 24 字节。Python 的开销是 **7 倍以上**。

## 18.4 dict：哈希表 + 开放寻址

Python 3.6+ 的 dict 用**紧凑哈希表**实现，分两层：

\`\`\`
dict 内部结构：
┌──────────────────┐
│ indices 数组      │ ← 稀疏，存索引（1/2/4 字节）
│ [_, 0, _, 1, _]  │
└──────────────────┘
        ↓ 指向
┌──────────────────┐
│ entries 数组      │ ← 紧凑，存 hash/key/value
│ [hash0,k0,v0]    │
│ [hash1,k1,v1]    │
└──────────────────┘
\`\`\`

\`\`\`python
# dict 的特性
d = {'a': 1, 'b': 2, 'c': 3}
# 3.7+ 保证插入顺序
print(list(d.keys()))  # ['a', 'b', 'c']

# 内存：紧凑存储节省 20-25%
import sys
print(sys.getsizeof(d))  # ~64 字节（小 dict）
\`\`\`

### dict 的关键设计

- **开放寻址**：冲突时往后找空位，不用链表
- **扰动函数**：hash 后再扰动一次，减少聚集
- **2/3 装载因子**：超过就 rehash 扩容
- **紧凑布局**：indices 和 entries 分离，节省内存

## 18.5 V8：隐藏类（Hidden Class）

V8 完全不同的策略——用**隐藏类（Map）**跟踪对象的"形状"：

\`\`\`javascript
// V8 给每个对象关联一个隐藏类
let p1 = { x: 1, y: 2 };
// 隐藏类：[Map: {x, y}]

let p2 = { x: 3, y: 4 };
// 隐藏类：[Map: {x, y}]  ← 与 p1 共享！

p2.z = 5;
// 隐藏类：[Map: {x, y, z}]  ← 转移到新 Map
\`\`\`

### 隐藏类转移链

\`\`\`
Map0 (空)
  ↓ 添加 x
Map1 ({x})
  ↓ 添加 y
Map2 ({x, y})  ← p1, p2 共享
  ↓ 添加 z
Map3 ({x, y, z})  ← p2 转移到此
\`\`\`

**为什么这样设计**？因为同一形状的对象，属性在内存中的偏移量相同。JIT 编译时可以生成"直接访问 offset N"的代码，无需每次哈希查找。

### 影响隐藏类的最佳实践

\`\`\`javascript
// ✅ 好：所有实例形状一致
function Point(x, y) {
    this.x = x;
    this.y = y;
}
const p1 = new Point(1, 2);
const p2 = new Point(3, 4);  // 同一隐藏类

// ❌ 坏：动态加属性，隐藏类分叉
const p3 = new Point(5, 6);
p3.color = 'red';  // 新隐藏类，无法共享优化

// ❌ 坏：属性顺序不同导致不同隐藏类
const a = { x: 1, y: 2 };
const b = { y: 2, x: 1 };  // 不同隐藏类！
\`\`\`

## 18.6 内联缓存（Inline Cache）

V8 在每个属性访问点都埋了"内联缓存"，记录上次访问的隐藏类和偏移量：

\`\`\`javascript
function getX(p) { return p.x; }

// 第一次调用：慢路径，记录 (隐藏类→偏移)
getX({x: 1, y: 2});

// 后续调用：检查隐藏类匹配，直接用缓存的偏移
getX({x: 3, y: 4});  // 快路径
\`\`\`

### 内联缓存的状态机

| 状态 | 含义 |
|------|------|
| uninitialized | 从未执行过 |
| monomorphic | 只见过一种隐藏类（最快） |
| polymorphic | 见过 2-4 种（中等） |
| megamorphic | 见过 5+ 种（退化为慢路径） |

\`\`\`javascript
// monomorphic：最快
function f1(p) { return p.x; }
f1({x:1, y:2}); f1({x:3, y:4});  // 都是同一形状

// megamorphic：最慢
function f2(p) { return p.x; }
f2({x:1}); f2({x:1,y:2}); f2({x:1,y:2,z:3}); f2({x:1,y:2,z:3,w:4}); f2({x:1,y:2,z:3,w:4,v:5});
// 5 种形状后，内联缓存失效
\`\`\`

## 18.7 JS 对象的属性存储

V8 对象的属性分三种存储模式：

| 模式 | 存储位置 | 访问速度 | 适用场景 |
|------|----------|----------|----------|
| in-object | 对象内部 | 最快 | 少量固定属性 |
| fast | properties 数组 | 快 | 中等数量 |
| slow | 字典 | 慢 | 动态增删属性 |

\`\`\`javascript
// in-object properties：构造时确定的属性
const p = { x: 1, y: 2 };  // x、y 直接存在对象内

// fast properties：超出预留给 in-object 的槽位
const big = {};
for (let i = 0; i < 100; i++) big['k' + i] = i;  // 后期加的进 properties 数组

// slow/dictionary mode：频繁增删导致
const dyn = {};
for (let i = 0; i < 1000; i++) dyn['k' + i] = i;
delete dyn.k500;  // 触发转为字典模式
\`\`\`

## 18.8 数组的实现对比

### CPython list

\`\`\`python
# Python list：指针数组，元素可以是任意类型
lst = [1, "hello", [2, 3], None]
# 内部：[ptr→int, ptr→str, ptr→list, ptr→None]
# 每个元素都是独立的 PyObject
\`\`\`

### V8 Array

V8 的数组有多种模式：

\`\`\`javascript
// PACKED_SMI：连续小整数（最紧凑）
const a = [1, 2, 3, 4];

// PACKED_DOUBLE：连续浮点（次紧凑）
const b = [1.1, 2.2, 3.3];

// PACKED_ELEMENTS：混合类型（每个元素是指针）
const c = [1, "hello", {}];

// HOLEY：有空洞（退化）
const d = [1, 2, 3];
d[10] = 10;  // 中间 4-9 是 hole，退化为 HOLEY
\`\`\`

| 数组类型 | 内存占用 | 访问速度 |
|----------|----------|----------|
| PACKED_SMI | 4 字节/元素 | 最快 |
| PACKED_DOUBLE | 8 字节/元素 | 快 |
| PACKED_ELEMENTS | 8 字节指针 + 对象 | 慢 |
| HOLEY_* | 同上但需检查 hole | 更慢 |

## 18.9 内存占用对比

\`\`\`python
# Python：存 100 万个整数
import sys
lst = list(range(1_000_000))
total = sys.getsizeof(lst)
for x in lst:
    total += sys.getsizeof(x)
print(total / 1024 / 1024, "MB")
# ≈ 28 MB（list 头 + 100 万个 28 字节 int）
# 实际由于小整数缓存，0-256 复用，约 27 MB
\`\`\`

\`\`\`javascript
// JavaScript：同样数据
const arr = new Array(1_000_000);
for (let i = 0; i < 1_000_000; i++) arr[i] = i;
// V8 用 PACKED_SMI：4 字节/元素
// 总计 ≈ 4 MB
\`\`\`

**Python 比 V8 多用约 7 倍内存**——这就是"一切皆对象"的代价。

## 18.10 总结对比表

| 维度 | CPython | V8 |
|------|---------|-----|
| 对象头 | 16 字节（refcnt + type） | 4-12 字节（隐藏类指针） |
| int 表示 | 任意精度（30 位数字数组） | SMI（31 位）/ HeapNumber |
| list/array | 指针数组 | 类型化连续数组 |
| dict/object | 哈希表（紧凑） | 隐藏类 + in-object |
| 属性访问 | 哈希查找 | 偏移量直接访问 |
| 内存效率 | 低 | 高 |
| 类型灵活性 | 极高 | 中（隐藏类限制） |
| 优化空间 | 小 | 大（JIT 利用形状） |

## 18.11 小结

CPython 的对象模型追求**简单统一**——所有对象共享 \`PyObject\` 头部，类型在运行时查询。这让 Python 极度灵活，但付出了内存和性能的代价。

V8 的对象模型追求**性能优化**——隐藏类跟踪形状，内联缓存加速访问，类型化数组节省内存。这让 JavaScript 在数值计算上接近原生性能，但限制了灵活性（动态增删属性会破坏优化）。

**NumPy 之所以快**，正是因为它绕过了 Python 的对象模型——用 C 数组存储连续的 int64/float64，而不是 Python 对象指针数组。下一章我们会看垃圾回收机制，看这些对象如何被回收。`,
  },
  {
    id: "pyvsjs-gc",
    icon: "🗑️",
    title: "垃圾回收机制对比",
    group: "运行时与底层",
    content: `# 第 19 章 垃圾回收机制对比

垃圾回收（GC）是动态语言的核心基础设施。CPython 和 V8 采取了截然不同的策略：CPython 以**引用计数为主、分代标记清除为辅**，V8 则用**分代复制 + 标记清除**。这导致两者在停顿时间、吞吐量、可预测性上各有取舍。

## 19.1 CPython 的 GC：引用计数 + 分代

### 引用计数（主）

CPython 的主要回收机制是**引用计数**。每个 \`PyObject\` 都有 \`ob_refcnt\` 字段：

\`\`\`c
// 引用计数规则
Py_INCREF(op)   // 引用增加：op->ob_refcnt++
Py_DECREF(op)   // 引用减少：op->ob_refcnt--
                 // 若减到 0，立即释放并递归 DECREF 引用的对象
\`\`\`

\`\`\`python
# 引用计数的变化
import sys

a = []                  # refcnt = 1
b = a                   # refcnt = 2
c = [a]                 # refcnt = 3
print(sys.getrefcount(a))  # 4（getrefcount 自身也临时引用一次）

del b                   # refcnt = 3
c.pop()                 # refcnt = 2
del a                   # refcnt = 1（局部变量 a 还在）
# 函数结束时 refcnt = 0，立即释放
\`\`\`

### 引用计数的优点

- **实时性**：对象一旦无引用立即释放，无延迟
- **可预测**：内存使用稳定，不会突然堆积
- **实现简单**：无需复杂算法
- **适合 RAII**：可以依赖 \`__del__\` 做资源清理

### 引用计数的缺点

- **无法处理循环引用**：
\`\`\`python
# 循环引用：引用计数无法回收
a = []
b = [a]
a.append(b)
del a
del b
# a 和 b 互相引用，refcnt 都是 1，但外部已无引用
# 这就是为什么需要分代标记清除
\`\`\`

- **维护开销大**：每次赋值、传参都要调整 refcnt
- **线程不安全**：多线程调整 refcnt 需要锁（GIL 间接保证了这一点）
- **缓存不友好**：refcnt 字段频繁修改，破坏缓存局部性

### 分代标记清除（辅）

为处理循环引用，CPython 加了**分代 GC**：

\`\`\`python
import gc

# 三代：0 代（年轻）、1 代、2 代（年老）
# 新对象进 0 代，经历 GC 未被回收则晋升到下一代
# 触发条件：分配数 - 释放数 > 阈值

gc.get_threshold()  # (700, 10, 10)
# 0 代阈值 700：每分配 700 个对象触发 0 代 GC
# 1 代阈值 10：每 10 次 0 代 GC 触发 1 次 1 代 GC
# 2 代阈值 10：每 10 次 1 代 GC 触发 1 次 2 代 GC
\`\`\`

### 标记清除的工作流程

\`\`\`
1. 标记阶段：从 GC roots 出发，遍历所有可达对象
2. 清除阶段：扫描所有容器对象，未被标记的视为垃圾
3. 循环引用检测：单独处理"只被循环引用"的对象组
\`\`\`

\`\`\`python
# 手动控制 GC
gc.disable()           # 关闭分代 GC（引用计数仍在工作）
gc.collect()           # 强制全量回收
gc.collect(0)          # 只回收 0 代
gc.set_threshold(1000, 15, 15)  # 调整阈值
\`\`\`

## 19.2 V8 的 GC：分代回收

V8 没有（也不需要）引用计数，完全依赖**分代垃圾回收**：

\`\`\`
堆内存
┌─────────────────────────────────┐
│  Young Generation（年轻代）      │
│  ┌───────────┐  ┌───────────┐  │
│  │ From-Space│  │ To-Space  │  │  ← Scavenge 算法（复制）
│  └───────────┘  └───────────┘  │
├─────────────────────────────────┤
│  Old Generation（老年代）        │
│  ┌─────────────────────────────┐│
│  │ 已晋升的对象                 ││  ← Mark-Sweep / Mark-Compact
│  │ 大对象直接进此区             ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
\`\`\`

### Scavenge（年轻代复制算法）

\`\`\`
1. From-Space 中存新对象
2. GC 时：从 roots 遍历，把存活对象复制到 To-Space
3. 复制时整理内存（消除碎片）
4. 交换 From/To
5. 经历两次 Scavenge 仍存活的对象晋升到老年代
\`\`\`

**为什么年轻代用复制算法**？因为大多数对象"朝生夕死"——复制少量存活对象比标记清除整个空间快得多。

### Mark-Sweep / Mark-Compact（老年代）

\`\`\`
1. Mark（标记）：从 roots 出发，标记所有可达对象
2. Sweep（清除）：扫描整个老年代，回收未标记对象
3. Compact（整理）：移动存活对象，消除碎片
\`\`\`

老年代用标记整理而非复制，因为复制老年代（可能几个 GB）开销太大。

### V8 GC 的停顿优化

V8 用多种技术减少 STW（Stop-The-World）停顿：

| 技术 | 作用 |
|------|------|
| 增量标记 | 把标记拆成小步，穿插在 JS 执行中 |
| 并发标记 | 标记阶段用辅助线程并行 |
| 并发清除 | 清除在辅助线程进行 |
| 并行 Scavenge | 年轻代 GC 用多线程 |
| 写屏障 | 跟踪老→新引用，保证标记正确 |

\`\`\`bash
# 观察 V8 GC
node --trace-gc -e "
let arr = [];
for (let i = 0; i < 1e6; i++) arr.push({x: i, y: i*2});
arr = null;  # 触发 GC
"
\`\`\`

## 19.3 停顿时间对比

| 维度 | CPython | V8 |
|------|---------|-----|
| 主要机制 | 引用计数（无停顿） | 分代 GC（有停顿） |
| 平均停顿 | 接近 0 | 几毫秒 |
| 最大停顿 | 接近 0 | 几十毫秒（大堆） |
| 吞吐量 | 中等 | 高 |
| 可预测性 | 高（无突变） | 中（有 GC 抖动） |

\`\`\`python
# CPython：引用计数让回收分散在每次赋值
def loop():
    for i in range(10_000_000):
        x = [i]      # 创建
        # 循环结束 x 立即释放，无需 GC 停顿
loop()  # 整体平稳
\`\`\`

\`\`\`javascript
// V8：对象累积到阈值后批量回收
function loop() {
    for (let i = 0; i < 10_000_000; i++) {
        let x = [i];
        // x 不会立即释放，等 Scavenge 时才回收
    }
}
loop();  # 中间会有几次几毫秒的 GC 停顿
\`\`\`

## 19.4 weakref vs WeakMap/WeakSet

两者都有"弱引用"机制，但实现和使用方式不同。

### Python weakref

\`\`\`python
import weakref

class Resource:
    pass

r = Resource()
ref = weakref.ref(r)     # 弱引用，不增加 refcnt

print(ref())             # <Resource object>，取出对象
del r                    # 强引用消失，对象立即释放
print(ref())             # None，弱引用失效

# WeakKeyDictionary / WeakValueDictionary
d = weakref.WeakValueDictionary()
d['x'] = Resource()      # 值是弱引用
# 当 Resource 没有其他强引用时，自动从 d 移除
\`\`\`

### JavaScript WeakMap/WeakSet

\`\`\`javascript
const wm = new WeakMap();
let key = {};
wm.set(key, 'value');

console.log(wm.get(key));  // 'value'
key = null;                # 强引用消失
// 此时 wm 里的条目可能被回收，但时机由 GC 决定
// 且无法枚举 wm 的键（防止观察 GC 时机）

// WeakRef（ES2021）：显式弱引用
const ref = new WeakRef({});
console.log(ref.deref());  // {} 或 undefined（已回收）
\`\`\`

**关键区别**：Python 的 weakref 在对象释放时**立即**失效；JS 的 WeakMap 条目在 GC 时**才**被清除，且无法观察时机。

## 19.5 __del__ vs FinalizationRegistry

### Python __del__

\`\`\`python
class FileWrapper:
    def __init__(self, path):
        self.f = open(path)
    def __del__(self):
        # 对象被回收时调用（引用计数到 0 时）
        self.f.close()
        print("文件已关闭")

# 引用计数到 0 时立即调用
fw = FileWrapper('test.txt')
del fw  # 立即输出"文件已关闭"
\`\`\`

\`__del__\` 的特性：
- 引用计数到 0 时**立即**调用
- 但循环引用时，调用时机由分代 GC 决定（可能延迟）
- 解释器退出时不保证调用（CPython 3.4+ 会调用，但其他实现不保证）
- 异常被吞掉（只打印到 stderr）

### JavaScript FinalizationRegistry

\`\`\`javascript
const registry = new FinalizationRegistry((value) => {
    console.log(\`对象被回收: \${value}\`);
});

let obj = { data: 'important' };
registry.register(obj, 'my-object');

obj = null;  // 强引用消失
// 某次 GC 后才会回调，时机不确定
// 且不保证一定调用（程序退出前可能未触发）
\`\`\`

**关键区别**：
- Python \`__del__\` 基于引用计数，**通常立即**调用
- JS FinalizationRegistry 基于 GC，**时机不确定**，甚至**可能不调用**
- 两者都**不应**用于关键资源清理——应该用 \`with\` 或 \`try/finally\`

### 正确的资源清理

\`\`\`python
# Python：用 contextlib 保证清理
from contextlib import contextmanager

@contextmanager
def open_file(path):
    f = open(path)
    try:
        yield f
    finally:
        f.close()  # 保证执行

with open_file('test.txt') as f:
    data = f.read()
\`\`\`

\`\`\`javascript
// JavaScript：用 try/finally 或显式 close
function useFile(path) {
    const f = open(path);
    try {
        return f.read();
    } finally {
        f.close();  // 保证执行
    }
}
\`\`\`

## 19.6 GC 调优实战

### Python

\`\`\`python
import gc

# 场景 1：批量处理，可暂时禁用 GC 提速
gc.disable()
try:
    big_data = process_all()  # 中间对象不触发 GC
finally:
    gc.enable()
    gc.collect()  # 一次性回收

# 场景 2：长寿命对象多，调大阈值减少 GC 频率
gc.set_threshold(50000, 100, 100)

# 场景 3：调试循环引用
gc.set_debug(gc.DEBUG_LEAK)
gc.collect()
print(gc.garbage)  # 无法回收的循环引用对象（有 __del__）
\`\`\`

### Node.js

\`\`\`bash
# 调整堆大小
node --max-old-space-size=4096 app.js  # 4 GB 老年代

# 强制 GC（需 --expose-gc）
node --expose-gc -e "global.gc()"

# 观察 GC 日志
node --trace-gc app.js
node --trace-gc-verbose app.js
\`\`\`

## 19.7 总结对比表

| 维度 | CPython | V8 |
|------|---------|-----|
| 主回收机制 | 引用计数 | 分代 GC |
| 辅助机制 | 分代标记清除 | - |
| 循环引用 | 分代 GC 处理 | 自动（GC 内建） |
| 停顿时间 | 接近 0 | 几毫秒到几十毫秒 |
| 吞吐量 | 中 | 高 |
| 可预测性 | 高 | 中（GC 抖动） |
| 弱引用 | weakref（立即失效） | WeakMap/WeakRef（GC 时失效） |
| 终结器 | __del__（通常立即） | FinalizationRegistry（不确定） |
| 资源清理 | with 语句 | try/finally |
| 调优难度 | 低（阈值） | 中（堆大小、并发） |

## 19.8 小结

CPython 的 GC 设计是"**实时性优先**"——引用计数让对象一旦无引用就立即释放，停顿接近 0。代价是无法处理循环引用（需分代 GC 辅助）、维护开销大。

V8 的 GC 设计是"**吞吐量优先**"——分代 GC 批量处理，停顿时间可控但非零。代价是有 GC 抖动、对实时性要求高的场景需谨慎。

引用计数 vs 分代 GC 是经典的权衡：
- 引用计数：实时性好，但循环引用难处理、缓存不友好
- 分代 GC：吞吐量高，但有停顿、内存占用大

这就是为什么 Python 适合做"短生命周期对象多"的脚本（引用计数优势发挥），而 Node.js 适合做"长生命周期对象多"的服务（分代 GC 优势发挥）。`,
  },
  {
    id: "pyvsjs-stdlib",
    icon: "📚",
    title: "标准库与运行时环境",
    group: "运行时与底层",
    content: `# 第 20 章 标准库与运行时环境

标准库的丰富程度直接决定了语言的"开箱即用"体验。Python 奉行"**电池全含（batteries included）**"哲学，标准库覆盖了几乎所有常见需求；JavaScript 的标准库则极薄，依赖运行时环境（Node.js / 浏览器 / Deno）补充。这种差异深刻影响了两门语言的工程实践。

## 20.1 Python：电池全含哲学

Python 标准库有 **200+ 模块**，覆盖：

| 领域 | 模块 | 作用 |
|------|------|------|
| 文件系统 | os, pathlib, shutil | 路径、文件操作 |
| 系统调用 | sys, subprocess | 进程、解释器 |
| 数据格式 | json, csv, pickle, xml | 序列化 |
| 字符串 | re, string, textwrap | 正则、文本 |
| 网络 | urllib, http, socket, ssl | HTTP、套接字 |
| 并发 | threading, multiprocessing, asyncio | 多线程、异步 |
| 数据结构 | collections, heapq, bisect | 容器扩展 |
| 日期时间 | datetime, time, calendar | 时间处理 |
| 数学 | math, random, statistics | 数值计算 |
| 加密 | hashlib, hmac, secrets | 哈希、签名 |
| 日志 | logging | 结构化日志 |
| 调试 | pdb, profile, tracemalloc | 调试、性能分析 |
| 测试 | unittest, doctest, mock | 单元测试 |

\`\`\`python
# 一个真实例子：用标准库写 HTTP 客户端
import urllib.request
import json
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)

def fetch_and_save(url, path):
    logging.info(f"请求 {url}")
    with urllib.request.urlopen(url) as resp:
        data = json.loads(resp.read())
    
    Path(path).write_text(json.dumps(data, indent=2))
    logging.info(f"已保存到 {path}")

fetch_and_save('https://api.github.com/repos/python/cpython', 'cpython.json')
# 全程只用标准库，无需 pip install 任何东西
\`\`\`

## 20.2 JavaScript：薄标准库

JavaScript 语言本身的标准库（ECMAScript 规范）极薄，只有：

| 类别 | 内置对象 |
|------|----------|
| 数据结构 | Array, Object, Map, Set, WeakMap, WeakSet |
| Promise | Promise, async/await |
| 数学 | Math, Number, BigInt |
| 字符串 | String, RegExp |
| JSON | JSON |
| 反射 | Reflect, Proxy |
| 错误 | Error 及子类 |
| 全局 | globalThis, parseInt, setTimeout 等 |

**没有**文件系统、网络、加密、流、进程等——这些由宿主环境提供。

\`\`\`javascript
// 纯 ECMAScript：能做的事很有限
const data = JSON.parse('{"a":1}');
const arr = [1, 2, 3].map(x => x * 2);
const promise = new Promise(resolve => resolve(42));
// 没法读文件、发请求、操作进程
\`\`\`

## 20.3 Node.js 的补充模块

Node.js 在 ECMAScript 之上补充了核心模块：

| 模块 | 作用 |
|------|------|
| fs | 文件系统 |
| http / https | HTTP 服务端/客户端 |
| net / dgram | TCP/UDP |
| crypto | 加密 |
| path | 路径处理 |
| url | URL 解析 |
| stream | 流 |
| os | 操作系统信息 |
| child_process | 子进程 |
| events | EventEmitter |
| buffer | 二进制数据 |
| util | 工具函数 |

\`\`\`javascript
// Node.js：同样功能
const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchAndSave(url, filePath) {
    console.log(\`请求 \${url}\`);
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const json = JSON.parse(data);
            fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
            console.log(\`已保存到 \${filePath}\`);
        });
    });
}

fetchAndSave('https://api.github.com/repos/nodejs/node', 'node.json');
\`\`\`

## 20.4 浏览器 API 又不同

浏览器提供的是另一套 API（DOM、BOM、Web API）：

\`\`\`javascript
// 浏览器：又是另一套 API
fetch('https://api.github.com/repos/microsoft/TypeScript')
    .then(res => res.json())
    .then(data => {
        localStorage.setItem('ts', JSON.stringify(data));
        console.log('已保存到 localStorage');
    });

// 注意：
// - 浏览器有 fetch、localStorage、DOM、IndexedDB
// - 浏览器没有 fs、http、child_process
// - Node.js 18+ 才有 fetch（实验性）
\`\`\`

**这就是 JavaScript 生态碎片化的根源**：同样的语言，三套 API（浏览器 / Node.js / Deno），代码不能直接复用。

## 20.5 常用功能对比

### 文件路径处理

\`\`\`python
# Python：pathlib 面向对象
from pathlib import Path

p = Path('/Users/me') / 'docs' / 'file.txt'
print(p.parent)       # /Users/me/docs
print(p.name)         # file.txt
print(p.suffix)       # .txt
print(p.exists())     # True/False

# 遍历
for f in Path('.').rglob('*.py'):
    print(f)
\`\`\`

\`\`\`javascript
// Node.js：path 模块（函数式）
const path = require('path');

const p = path.join('/Users/me', 'docs', 'file.txt');
console.log(path.dirname(p));    // /Users/me/docs
console.log(path.basename(p));   // file.txt
console.log(path.extname(p));    // .txt
// exists 需要 fs 模块
const fs = require('fs');
console.log(fs.existsSync(p));

// 遍历需要手写递归
const { readdirSync, statSync } = require('fs');
function walk(dir) {
    for (const name of readdirSync(dir)) {
        const full = path.join(dir, name);
        if (statSync(full).isDirectory()) walk(full);
        else if (name.endsWith('.js')) console.log(full);
    }
}
\`\`\`

### HTTP 请求

\`\`\`python
# Python：urllib（同步）或 httpx（异步）
import urllib.request

resp = urllib.request.urlopen('https://api.github.com/users/torvalds')
data = json.loads(resp.read())
print(data['name'])
\`\`\`

\`\`\`javascript
// Node.js：http/https 模块（基于流，较繁琐）
const https = require('https');

https.get('https://api.github.com/users/torvalds', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(JSON.parse(data).name);
    });
});

// 现代 Node.js 18+：fetch API
const resp = await fetch('https://api.github.com/users/torvalds');
const data = await resp.json();
console.log(data.name);
\`\`\`

### 加密

\`\`\`python
# Python：hashlib + hmac
import hashlib, hmac

digest = hashlib.sha256(b'hello').hexdigest()
sig = hmac.new(b'secret', b'message', hashlib.sha256).hexdigest()
\`\`\`

\`\`\`javascript
// Node.js：crypto 模块
const crypto = require('crypto');

const digest = crypto.createHash('sha256').update('hello').digest('hex');
const sig = crypto.createHmac('sha256', 'secret').update('message').digest('hex');
\`\`\`

### 子进程

\`\`\`python
# Python：subprocess
import subprocess

result = subprocess.run(['ls', '-l'], capture_output=True, text=True)
print(result.stdout)

# 管道
p1 = subprocess.Popen(['ls'], stdout=subprocess.PIPE)
p2 = subprocess.Popen(['grep', 'py'], stdin=p1.stdout, stdout=subprocess.PIPE)
print(p2.communicate()[0].decode())
\`\`\`

\`\`\`javascript
// Node.js：child_process
const { execSync, spawn } = require('child_process');

const result = execSync('ls -l', { encoding: 'utf-8' });
console.log(result);

// 流式
const ls = spawn('ls');
const grep = spawn('grep', ['py']);
ls.stdout.pipe(grep.stdin);
grep.stdout.on('data', data => console.log(data.toString()));
\`\`\`

## 20.6 urllib vs http/fetch 对比

\`\`\`python
# Python urllib：同步阻塞
import urllib.request, urllib.parse, json

# GET
url = 'https://httpbin.org/get?' + urllib.parse.urlencode({'q': 'python'})
resp = urllib.request.urlopen(url)
data = json.loads(resp.read())

# POST
req = urllib.request.Request(
    'https://httpbin.org/post',
    data=json.dumps({'name': 'py'}).encode(),
    headers={'Content-Type': 'application/json'},
    method='POST'
)
resp = urllib.request.urlopen(req)
\`\`\`

\`\`\`javascript
// Node.js fetch（异步，Promise 风格）
const resp = await fetch('https://httpbin.org/get?q=' + encodeURIComponent('python'));
const data = await resp.json();

const resp2 = await fetch('https://httpbin.org/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'js' })
});
const data2 = await resp2.json();
\`\`\`

**关键差异**：
- Python urllib 是**同步**的（阻塞），简单直接
- Node.js fetch 是**异步**的（基于 Promise），需要 await
- Python 异步 HTTP 需要 \`aiohttp\` 或 \`httpx\`（第三方）
- Node.js 天生异步，fetch 是原生的

## 20.7 哲学差异

| 维度 | Python | JavaScript |
|------|--------|------------|
| 标准库范围 | 极广（200+ 模块） | 极薄（仅语言核心） |
| 文件/网络 | 标准库提供 | 宿主环境提供 |
| 同步/异步 | 默认同步，asyncio 可选 | 默认异步（Node.js） |
| 跨环境一致性 | 高（CPython 标准化） | 低（浏览器/Node/Deno 各异） |
| 依赖第三方 | 较少 | 极多（npm 生态） |
| 开箱即用 | 是 | 否（需装包） |

**Python 的优势**：写脚本、原型、运维工具时，几乎所有功能都在标准库，无需 \`pip install\`。

**JavaScript 的优势**：生态极度繁荣（npm 上有 200+ 万包），第三方库质量高、更新快。但代价是依赖管理复杂、安全审计难。

## 20.8 运行时环境差异

| 维度 | CPython | Node.js | 浏览器 |
|------|---------|---------|--------|
| 入口 | python script.py | node script.js | HTML 加载 |
| 模块系统 | import / __init__.py | CommonJS + ESM | ESM |
| 包管理 | pip + venv | npm + node_modules | npm/bundler |
| 全局对象 | __name__, __file__ | global, process | window, document |
| 文件系统 | os/pathlib | fs | 无（沙箱） |
| 网络 | socket/http | net/http | fetch/WebSocket |
| 进程 | subprocess | child_process | 无 |
| 退出码 | sys.exit(n) | process.exit(n) | 无 |

## 20.9 小结

Python 的"电池全含"让它在脚本、运维、数据科学领域无可替代——一个干净的 Python 解释器就能完成 90% 的常见任务。代价是标准库演进慢（要兼容性），新特性往往落后于社区。

JavaScript 的"薄标准库 + 丰富生态"让它在 Web 领域无可替代——npm 生态的活力是 Python 难以匹敌的。代价是环境碎片化、依赖管理痛苦、安全审计困难。

**选择建议**：
- 写脚本、工具、原型 → Python（标准库够用）
- 写 Web 服务、前端 → JavaScript（生态成熟）
- 写跨平台 CLI → 都可以，看团队偏好

下一章我们会看 C 扩展和原生互操作——当标准库不够用时，如何用 C 提速。`,
  },
  {
    id: "pyvsjs-cinterop",
    icon: "🔌",
    title: "C 扩展与原生互操作",
    group: "运行时与底层",
    content: `# 第 21 章 C 扩展与原生互操作

当解释器性能不够、需要调用现有 C 库、或想暴露底层 API 时，C 扩展是关键逃生通道。Python 和 Node.js 都提供了多种 C 互操作方案，但设计哲学差异巨大：Python 的 C API 历史悠久但侵入性强，Node.js 的 N-API 更注重 ABI 稳定性。

## 21.1 Python 的 C 扩展生态

Python 有**至少 5 种**主流的 C 互操作方式：

| 方案 | 类型 | 易用性 | 性能 | 典型用户 |
|------|------|--------|------|----------|
| CPython C API | 手写 C | 难 | 最快 | NumPy, Cython 底层 |
| ctypes | FFI | 易 | 中 | 简单调用 |
| cffi | FFI | 中 | 中 | PyPy 友好 |
| Cython | 编译 | 中 | 快 | NumPy 部分, pandas |
| pybind11 | 模板 | 中 | 快 | C++ 绑定 |

### CPython C API

最底层、最强大的方式，直接操作 \`PyObject\`：

\`\`\`c
// myext.c：CPython C 扩展示例
#include <Python.h>

// 实现 Python 可调用的函数
static PyObject* fast_sum(PyObject* self, PyObject* args) {
    PyObject* list;
    if (!PyArg_ParseTuple(args, "O", &list)) return NULL;
    
    long sum = 0;
    Py_ssize_t n = PyList_Size(list);
    for (Py_ssize_t i = 0; i < n; i++) {
        PyObject* item = PyList_GetItem(list, i);
        long val = PyLong_AsLong(item);
        if (val == -1 && PyErr_Occurred()) return NULL;
        sum += val;
    }
    return PyLong_FromLong(sum);
}

// 模块方法表
static PyMethodDef methods[] = {
    {"fast_sum", fast_sum, METH_VARARGS, "Sum a list of ints"},
    {NULL, NULL, 0, NULL}
};

// 模块定义
static struct PyModuleDef module = {
    PyModuleDef_HEAD_INIT, "myext", NULL, -1, methods
};

// 初始化函数
PyMODINIT_FUNC PyInit_myext(void) {
    return PyModule_Create(&module);
}
\`\`\`

\`\`\`python
# setup.py
from setuptools import setup, Extension
setup(ext_modules=[Extension('myext', sources=['myext.c'])])

# 编译：python setup.py build_ext --inplace
# 使用：
import myext
print(myext.fast_sum([1, 2, 3, 4, 5]))  # 15
\`\`\`

**优点**：性能最优，能直接访问解释器内部。
**缺点**：API 繁琐、引用计数易错、ABI 与 Python 版本绑定（要为每个版本编译）。

### ctypes：动态调用

\`\`\`python
# ctypes：无需编译，直接调用 .so/.dylib/.dll
import ctypes

# 加载 C 标准库
libc = ctypes.CDLL('libc.so.6')  # Linux
# libc = ctypes.CDLL('libc.dylib')  # macOS

# 调用 printf
libc.printf(b"Hello from C: %d\\n", 42)

# 调用数学库
libm = ctypes.CDLL('libm.so.6')
libm.sqrt.restype = ctypes.c_double
libm.sqrt.argtypes = [ctypes.c_double]
print(libm.sqrt(16.0))  # 4.0
\`\`\`

**优点**：无需写 C 代码、无需编译。
**缺点**：每次调用有 FFI 开销、类型不安全、无法回调 Python。

### Cython：Python 超集编译

\`\`\`python
# mysum.pyx：Cython 代码（Python 语法 + 类型注解）
def fast_sum(list lst):
    cdef long sum = 0
    cdef long val
    cdef Py_ssize_t i, n = len(lst)
    for i in range(n):
        val = lst[i]
        sum += val
    return sum
\`\`\`

\`\`\`bash
# 编译
cythonize -i mysum.pyx
# 生成 mysum.cpython-311-x86_64-linux-gnu.so
\`\`\`

\`\`\`python
import mysum
print(mysum.fast_sum(list(range(1_000_000))))  # 比纯 Python 快 50-100 倍
\`\`\`

Cython 是 NumPy、pandas 等科学计算库的常用选择——能在保留 Python 语法的同时获得 C 级性能。

### pybind11：C++ 绑定

\`\`\`cpp
// mymodule.cpp
#include <pybind11/pybind11.h>
#include <pybind11/stl.h>

long fast_sum(const std::vector<long>& vec) {
    long sum = 0;
    for (auto v : vec) sum += v;
    return sum;
}

PYBIND11_MODULE(mymodule, m) {
    m.def("fast_sum", &fast_sum, "Sum a vector of ints");
}
\`\`\`

pybind11 适合已有 C++ 代码库的情况——能用 C++ 模板元编程简化绑定编写。

## 21.2 Node.js 的 N-API

Node.js 历史上 C 扩展 API 变动频繁（NaN、NAN），导致每次 Node 升级原生模块都要重编译。**N-API**（Node 8+）解决了这个问题——提供**ABI 稳定**的 C API：

\`\`\`c
// addon.c：N-API 示例
#include <node_api.h>

napi_value FastSum(napi_env env, napi_callback_info info) {
    size_t argc = 1;
    napi_value args[1];
    napi_get_cb_info(env, info, &argc, args, NULL, NULL);
    
    // 读取数组
    uint32_t length;
    napi_get_array_length(env, args[0], &length);
    
    double sum = 0;
    for (uint32_t i = 0; i < length; i++) {
        napi_value item;
        napi_get_element(env, args[0], i, &item);
        double val;
        napi_get_value_double(env, item, &val);
        sum += val;
    }
    
    napi_value result;
    napi_create_double(env, sum, &result);
    return result;
}

napi_value Init(napi_env env, napi_value exports) {
    napi_value fn;
    napi_create_function(env, "fastSum", NAPI_AUTO_LENGTH, FastSum, NULL, &fn);
    napi_set_named_property(env, exports, "fastSum", fn);
    return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
\`\`\`

\`\`\`javascript
// 使用
const addon = require('./build/Release/addon');
console.log(addon.fastSum([1, 2, 3, 4, 5]));  // 15
\`\`\`

### node-addon-api：C++ 封装

\`\`\`cpp
// addon.cpp：node-addon-api（C++ 包装）
#include <napi.h>

Napi::Number FastSum(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    auto arr = info[0].As<Napi::Array>();
    double sum = 0;
    for (uint32_t i = 0; i < arr.Length(); i++) {
        sum += arr.Get(i).As<Napi::Number>().DoubleValue();
    }
    return Napi::Number::New(env, sum);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("fastSum", Napi::Function::New(env, FastSum));
    return exports;
}

NODE_API_MODULE(addon, Init)
\`\`\`

**N-API 的关键优势**：**ABI 稳定**——一次编译的 .node 文件可在不同 Node 版本间复用，无需重编译。

## 21.3 FFI 对比

| 维度 | Python | Node.js |
|------|--------|---------|
| 直接 C API | CPython C API | N-API |
| 动态 FFI | ctypes, cffi | node-ffi-napi |
| 编译型 | Cython, pybind11 | node-addon-api |
| ABI 稳定性 | 差（绑定版本） | 好（N-API 稳定） |
| 易用性 | Cython 较易 | node-addon-api 中等 |
| 生态 | NumPy 等大量 C 扩展 | 较少原生模块 |

**关键差异**：
- Python 的 C 扩展深度嵌入解释器，能直接操作 \`PyObject\`
- Node.js 的 N-API 是"黑盒"——通过句柄操作，不能直接访问 V8 内部

## 21.4 为什么 NumPy 快

NumPy 是 Python 生态的奇迹——它让 Python 在数值计算上接近 C/Fortran 的性能。原理：

\`\`\`python
import numpy as np
import time

# 纯 Python：100 万个 Python int 对象
start = time.time()
lst = list(range(1_000_000))
s = sum(lst)
print(f"Python list: {time.time()-start:.3f}s")  # ~0.1s

# NumPy：连续的 C 数组
start = time.time()
arr = np.arange(1_000_000, dtype=np.int64)
s = arr.sum()
print(f"NumPy: {time.time()-start:.3f}s")  # ~0.005s（20 倍快）
\`\`\`

### NumPy 快的原因

1. **连续内存**：\`np.array([1,2,3])\` 是连续的 int64 数组，不是指针数组
2. **C 实现**：核心运算用 C 写，编译为机器码
3. **SIMD 指令**：底层用 AVX/SSE 向量化
4. **无对象开销**：不创建 100 万个 PyObject
5. **缓存友好**：连续访问让 CPU 缓存命中率高

\`\`\`python
# NumPy 的内存布局
arr = np.array([1, 2, 3, 4], dtype=np.int64)
# 内存：连续 32 字节 [01 00 00 00 00 00 00 00] [02 00 ...] ...

# 对比 Python list
lst = [1, 2, 3, 4]
# 内存：4 个指针 [ptr→int][ptr→int][ptr→int][ptr→int]
#        每个 int 还要 28 字节的 PyObject
\`\`\`

## 21.5 性能边界：何时该用 C 扩展

\`\`\`python
# 场景 1：纯数值循环 → C 扩展收益巨大
def python_sum(n):
    s = 0
    for i in range(n):
        s += i
    return s
# C 扩展可以快 50-100 倍

# 场景 2：调用已有 C 库 → 用 ctypes/cffi
import ctypes
libc = ctypes.CDLL('libc.so.6')
# 直接复用成熟的 C 实现

# 场景 3：IO 密集 → C 扩展收益小
def read_files(paths):
    return [open(p).read() for p in paths]
# 瓶颈是 IO，不是 CPU，C 扩展没用

# 场景 4：调 Python 标准库 → 不要重写
import json
json.loads(big_string)
# CPython 的 json 已经是 C 实现，无需自己写
\`\`\`

**经验法则**：
- CPU 密集 + 大量对象创建 → 用 C 扩展（NumPy/Cython）
- 调用已有 C 库 → 用 ctypes/cffi
- IO 密集 → 用 asyncio，不需要 C 扩展
- 调用标准库 → 检查是否已是 C 实现

## 21.6 WebAssembly：跨语言互操作新方案

WebAssembly（WASM）是新的跨语言互操作方案，Python 和 Node.js 都支持：

\`\`\`python
# Python 调用 WASM 模块（用 wasmer）
from wasmer import import_wat, Instance

# 加载编译好的 .wasm 文件
with open('fast.wasm', 'rb') as f:
    instance = Instance(f.read())

result = instance.exports.fast_sum([1, 2, 3, 4, 5])
print(result)
\`\`\`

\`\`\`javascript
// Node.js 调用 WASM
const fs = require('fs');
const wasmBuffer = fs.readFileSync('fast.wasm');

WebAssembly.instantiate(wasmBuffer).then(({ instance }) => {
    const result = instance.exports.fast_sum([1, 2, 3, 4, 5]);
    console.log(result);
});
\`\`\`

**WASM 的优势**：
- 语言无关：Rust/C++/Go 都能编译成 WASM
- 沙箱安全：不能直接访问内存
- 跨平台：浏览器、Node.js、Python 都能跑
- 启动快：比 JIT 编译快

**WASM 的局限**：
- 不能直接调用 OS API（需通过宿主）
- 与 GC 集成弱（WASM GC 提案还在推进）
- 调用开销比原生 C 扩展高

## 21.7 总结对比表

| 维度 | Python | Node.js |
|------|--------|---------|
| 原生 API | CPython C API | N-API |
| 动态 FFI | ctypes, cffi | node-ffi-napi |
| 编译型 | Cython, pybind11 | node-addon-api |
| ABI 稳定性 | 差 | 好 |
| 直接访问解释器 | 是 | 否 |
| WASM 支持 | wasmer, wasmtime | 原生 |
| 典型 C 扩展 | NumPy, pandas, Pillow | sharp, bcrypt |
| 性能提升幅度 | 50-100 倍 | 5-20 倍 |

## 21.8 小结

Python 的 C 扩展生态是它能在 AI/数据科学领域称王的关键——NumPy、PyTorch、TensorFlow 全部是 C/C++ 扩展。代价是 C API 复杂、ABI 不稳定、迁移到 PyPy 等替代实现困难。

Node.js 的 N-API 设计更现代——ABI 稳定、API 简洁、但侵入性低（不能直接操作 V8 内部）。这让 Node.js 的原生模块生态更稳定，但缺少 NumPy 这种深度优化场景。

**WebAssembly 是未来的方向**：它让 Python、JavaScript、Rust、C++ 都能互操作，且无需为每个运行时单独写扩展。但在性能敏感场景，原生 C 扩展仍是不可替代的选择——WASM 的调用开销和沙箱限制使其暂时无法匹敌直接的 C API。

至此，"运行时与底层"部分的 6 章已经讲完：从解释器架构、执行流水线、内存模型、垃圾回收，到标准库和 C 互操作。这些底层知识是理解两门语言性能差异、做出技术选型的基础。下一批章节我们会进入**生态与工程**领域。`,
  },
];
