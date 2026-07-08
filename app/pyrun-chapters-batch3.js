// =============================================================
// Python 执行代码原理（pyrun）—— 第三批章节
// -------------------------------------------------------------
// 主题：函数调用的秘密（共 5 章，第 11 ~ 15 章）
// 涵盖：函数调用机制、栈帧、传参机制、递归原理、装饰器原理
// 风格：大白话讲原理，多用比喻和生活例子，demo 可独立运行
// =============================================================

export const chapters = [
  {
    id: "pyrun-11",
    group: "函数调用的秘密",
    icon: "📞",
    title: "函数调用发生了什么",
    content: `## 函数调用：编程世界的"打电话"

你每天都在写函数、调用函数，但你有没有想过：**当你在代码里写下 \`greet("小明")\` 时，Python 到底做了哪些事？**

这一章我们就把函数调用这件事拆开看，让你彻底搞懂它。

打个比方：**函数调用就像打电话**。

- 你拨号（发起调用）→ 对方接听（创建一个执行环境）→ 通话（执行函数体）→ 挂断（返回结果）→ 你回到之前在做的事（继续往下执行）

整个过程背后，Python 解释器干了一大堆活。我们一层层来看。

---

## 一、函数定义：创建一个"函数对象"

很多人以为 \`def\` 就是"声明一个函数"，但 Python 里**函数是一等公民**——它本质上是一个**对象**。

\`\`\`python
def greet(name):       # def 关键字：告诉 Python "我要定义函数"
    return "hi " + name  # 函数体：调用时才执行
\`\`\`

当你执行这段代码时，Python 做了三件事：

1. **编译函数体**：把函数体里的代码编译成一个**代码对象**（code object），里面包含字节码、常量、变量名等
2. **创建函数对象**：基于代码对象创建一个 function 类型的对象，它有自己的属性（\`__name__\`、\`__code__\`、\`__defaults__\` 等）
3. **绑定名字**：把函数对象和名字 \`greet\` 关联起来，存到当前命名空间

所以函数对象其实是个"包裹"，里面装着：

| 属性 | 含义 | 例子 |
|------|------|------|
| \`__name__\` | 函数的名字 | \`"greet"\` |
| \`__code__\` | 函数的代码对象（字节码等） | 一个 code 对象 |
| \`__defaults__\` | 默认参数的值 | \`None\` 或元组 |
| \`__globals__\` | 全局命名空间字典 | 当前模块的 globals |
| \`__dict__\` | 函数自己的属性字典 | \`{}\` |

> 💡 重点：\`def\` 执行时，函数体**根本不会运行**，只是被"打包"起来。真正运行是在你**调用**它的时候。

---

## 二、函数调用：六步走

当你写下 \`greet("小明")\`，Python 解释器走下面这个流程：

### 第 1 步：参数匹配

Python 把你传入的实参和函数定义的形参一一对应。匹配规则很灵活：

\`\`\`python
def add(a, b, c=0):
    return a + b + c

add(1, 2)           # 位置参数：a=1, b=2, c 用默认 0
add(1, 2, 3)        # 位置参数：a=1, b=2, c=3
add(1, b=2, c=3)    # 混合：a=1，b 和 c 用关键字指定
add(c=3, a=1, b=2)  # 全关键字：顺序无所谓
\`\`\`

### 第 2 步：创建栈帧（Frame）

这是最关键的一步。Python 为这次调用**创建一个全新的栈帧对象**，可以理解为"这次通话的工作台"。栈帧里装着：

- **代码对象**：要执行的字节码
- **局部变量表**：这个函数里定义的变量
- **操作数栈**：字节码运算用的临时空间
- **返回地址**：执行完要回到哪里继续
- **上一个帧的引用**：调用我的那个函数的帧

### 第 3 步：压入调用栈

把新建的栈帧**压到调用栈顶部**，让它成为"当前活动帧"。解释器从现在开始执行这个帧里的字节码。

### 第 4 步：执行字节码

解释器一条条地执行函数体的字节码指令。比如 \`a + b\` 会被拆成 \`LOAD_FAST\`、\`LOAD_FAST\`、\`BINARY_ADD\` 这几条指令。

### 第 5 步：遇到 return

当执行到 \`return\` 语句（或函数体执行完），Python 把返回值准备好，准备"挂电话"。

### 第 6 步：弹出栈帧，回到调用处

把当前栈帧从调用栈**弹出**，恢复上一个帧为活动帧，把返回值交给调用者，继续执行调用处的下一条指令。

---

## 三、用字节码看清"调用"这件事

Python 自带一个 \`dis\` 模块（disassemble，反汇编），能把函数翻译成字节码指令。这是理解函数调用最直接的工具。

\`\`\`python
import dis

def add(a, b):
    result = a + b
    return result

dis.dis(add)
\`\`\`

你会看到类似这样的输出：

\`\`\`
  2           0 LOAD_FAST                0 (a)
              2 LOAD_FAST                1 (b)
              4 BINARY_ADD
              6 STORE_FAST               2 (result)

  3           8 LOAD_FAST                2 (result)
             10 RETURN_VALUE
\`\`\`

解读一下：

| 指令 | 含义 |
|------|------|
| \`LOAD_FAST\` | 从局部变量表里取一个变量压到操作数栈顶 |
| \`BINARY_ADD\` | 弹出栈顶两个值，相加，结果压回栈顶 |
| \`STORE_FAST\` | 把栈顶的值存到局部变量 |
| \`RETURN_VALUE\` | 把栈顶值作为返回值，结束当前帧 |

看到了吗？**所有的运算都是"压栈、弹栈"**。函数调用本身也对应一条指令：\`CALL_FUNCTION\`（或新版 \`CALL\`）。

---

## 四、参数是怎么"传"进去的

参数匹配发生在函数**被调用之前**。Python 按这个顺序处理：

1. **位置参数**：从左到右依次填入没有默认值的形参
2. **关键字参数**：按名字填入对应形参
3. **默认值**：没传也没指定的，用定义时的默认值
4. **\*args**：多余的位置参数打包成元组
5. **\**kwargs**：多余的关键字参数打包成字典

这些参数最终都会被放到**新栈帧的局部变量表**里。也就是说，形参 \`a\`、\`b\` 在函数内部其实就是局部变量，只是它们一开始就有值。

---

## 五、return 是怎么把结果带回去的

\`return\` 语句做两件事：

1. 把返回值压到操作数栈顶
2. 执行 \`RETURN_VALUE\` 字节码，触发"帧结束"逻辑

解释器拿到这个返回值后，**当前栈帧被销毁**（局部变量全部消失），返回值被"递交"给调用方的表达式。

\`\`\`python
def add(a, b):
    return a + b     # 返回值被压栈，帧结束

x = add(1, 2)        # add 的返回值 3 被赋给 x
print(x)             # 输出 3
\`\`\`

如果函数没有 \`return\`，或者 \`return\` 后面没写值，Python 默认返回 \`None\`。

---

## 六、用 sys._getframe 看调用栈

\`sys._getframe()\` 能拿到**当前正在执行的栈帧对象**，沿着 \`f_back\` 一路往上，就能看到整个调用栈。这是窥探函数调用机制的神器。

\`\`\`python
import sys

def inner():
    frame = sys._getframe()       # 拿到 inner 的帧
    while frame is not None:
        print(frame.f_code.co_name)  # 打印这一层函数的名字
        frame = frame.f_back         # 往上一层

def outer():
    inner()

outer()
\`\`\`

输出会是：

\`\`\`
inner
outer
<module>
\`\`\`

从最内层 \`inner\` 往外，一直到模块顶层。这就是**调用栈**的真实结构。

---

## 七、生活比喻总结

| 编程概念 | 生活比喻 |
|----------|----------|
| 函数定义 | 把一份"通话脚本"写好放在抽屉里 |
| 函数调用 | 拿出脚本，拨通电话开始念 |
| 栈帧 | 通话时面前的工作台，放着你正在用的资料 |
| 调用栈 | 几张工作台叠在一起，最上面那张是当前在用的 |
| 局部变量 | 工作台上的私人物品，通话结束就清空 |
| 返回值 | 通话结束前，对方交代给你的"任务结果" |
| return | 挂电话，把结果带回，收起工作台 |

---

## 八、常见误区

1. **"函数定义时函数体就执行了"** ❌ 错。定义只是打包，调用才执行。
2. **"参数是复制一份传进去的"** ❌ 不完全对。Python 传的是对象的引用（下一章详讲）。
3. **"return 之后的代码还会执行"** ❌ 错。return 一执行，函数立即结束。
4. **"局部变量在函数定义时就分配好了"** ❌ 错。局部变量在**调用时**才在新帧里创建。

---

## 九、这一章的 demo

下面的代码会：

1. 用 \`__code__\` 查看函数对象的内部结构
2. 用 \`dis\` 反汇编函数，看真实的字节码
3. 用 \`sys._getframe\` 遍历调用栈，亲眼看到"函数是怎么一层层调用的"

跑一遍，你对函数调用的理解会从"知道怎么用"升级到"知道背后发生了什么"。`,
    code: `# ==========================================
# 第 11 章 demo：函数调用发生了什么
# 用 dis 看字节码，用 sys._getframe 看调用栈
# ==========================================
import dis      # dis 模块：反汇编 Python 字节码
import sys      # sys 模块：访问解释器内部信息

# 先定义一个简单函数，观察它的"内部结构"
def add(a, b):          # 定义函数 add，接收两个参数
    result = a + b      # 把 a 和 b 相加，结果存到 result
    return result       # 把 result 作为返回值返回

# 第一部分：函数对象本身长什么样
print("=" * 50)         # 打印分隔线，让输出更清晰
print("第一部分：函数对象的内部结构")  # 打印这部分的小标题
print("=" * 50)         # 打印分隔线
print("函数名字：", add.__name__)              # 打印函数的名字
print("参数名：", add.__code__.co_varnames)    # 打印函数的所有局部变量名
print("参数个数：", add.__code__.co_argcount)  # 打印函数接收几个参数
print("常量：", add.__code__.co_consts)        # 打印函数里用到的常量

# 第二部分：用 dis 看字节码
print()                 # 打印一个空行，让输出不挤在一起
print("=" * 50)         # 打印分隔线
print("第二部分：add 函数的字节码（反汇编）")  # 打印这部分的小标题
print("=" * 50)         # 打印分隔线
dis.dis(add)            # 把 add 函数翻译成字节码指令并打印

# 第三部分：函数调用的字节码
print()                 # 打印空行
print("=" * 50)         # 打印分隔线
print("第三部分：调用方代码的字节码")  # 打印这部分的小标题
print("=" * 50)         # 打印分隔线

def caller():                # 定义一个会调用 add 的函数
    x = add(10, 20)         # 调用 add，把结果存到 x
    return x                # 返回 x

dis.dis(caller)             # 看看 caller 是怎么"调用"add 的

# 第四部分：用 sys._getframe 看调用栈
print()                 # 打印空行
print("=" * 50)         # 打印分隔线
print("第四部分：实时调用栈")  # 打印这部分的小标题
print("=" * 50)         # 打印分隔线

def inner():                 # 最内层函数
    frame = sys._getframe()  # 拿到当前这一层的栈帧
    depth = 0                # 用来记录当前是第几层
    print("调用栈（从内往外）：")  # 打印提示信息
    while frame is not None:            # 只要还有上一层，就继续
        name = frame.f_code.co_name     # 取这一层函数的名字
        lineno = frame.f_lineno         # 取这一层当前执行到第几行
        local = frame.f_locals          # 取这一层的局部变量
        print(f"  第 {depth} 层：函数={name}, 行号={lineno}, 局部变量={local}")  # 打印这一层信息
        frame = frame.f_back            # 跳到调用我的那一层
        depth += 1                      # 层数加一

def middle():                # 中间层函数
    value = "我在中间"       # 定义一个局部变量
    inner()                  # 调用 inner

def outer():                 # 最外层函数
    tag = 100                # 定义一个局部变量
    middle()                 # 调用 middle

# 真正触发调用链：outer -> middle -> inner
print("触发调用链：outer -> middle -> inner")  # 打印提示
print()                     # 打印空行
outer()                     # 从这里开始，一层层调进去

# 第五部分：return 的行为
print()                 # 打印空行
print("=" * 50)         # 打印分隔线
print("第五部分：return 的行为")  # 打印这部分的小标题
print("=" * 50)         # 打印分隔线

def no_return():             # 这个函数没有 return
    total = 1 + 1            # 算了个结果但没 return

result = no_return()         # 接收返回值
print("没有 return 的函数返回了：", result)    # 会是 None
print("它的类型是：", type(result))            # 打印类型

def early_return():          # 演示 return 后面的代码不执行
    print("这一行会执行")    # 这行会运行
    return "我回来了"        # return 之后函数立即结束
    print("这一行永远不会执行")  # 死代码，不会运行

print()                     # 打印空行
msg = early_return()         # 调用并接收返回值
print("拿到返回值：", msg)   # 打印拿到的返回值

print()                     # 打印空行
print("✅ 现在你应该明白：函数调用 = 创建栈帧 + 执行字节码 + return 返回")  # 总结`
  },
  {
    id: "pyrun-12",
    group: "函数调用的秘密",
    icon: "📚",
    title: "栈帧：函数的执行环境",
    content: `## 栈帧：函数的"工作台"

上一章我们提到，每次函数调用都会创建一个**栈帧**。这一章我们把这个"工作台"彻底拆开看。

**大白话比喻**：栈帧就像办公桌上的一摞文件。

- 你正在做任务 A（最下面那张文件）
- 突然需要做任务 B，于是把 B 的文件**放在 A 上面**，开始做 B
- B 做到一半又要做 C，把 C 的文件**再放到 B 上面**
- C 做完，**拿走 C 的文件**，回到 B 继续做
- B 做完，拿走 B 的文件，回到 A

这"一摞文件"就是**调用栈**，每一张文件就是一个**栈帧**。

---

## 一、栈帧到底装了什么

一个栈帧对象包含了函数执行所需的**全部上下文**。主要字段有：

| 字段 | 含义 | 通俗解释 |
|------|------|----------|
| \`f_code\` | 正在执行的代码对象 | "脚本"：这次要执行的指令 |
| \`f_locals\` | 局部变量字典 | "工作台上的私人物品" |
| \`f_globals\` | 全局变量字典 | "公共资料柜" |
| \`f_builtins\` | 内置名字字典 | "出厂自带工具箱" |
| \`f_back\` | 调用者的栈帧 | "下面那张文件" |
| \`f_lineno\` | 当前执行到第几行 | "看到第几行了" |
| \`f_lasti\` | 上一条字节码的索引 | "念到哪一句了" |
| \`f_valuestack\` | 操作数栈 | "草稿纸" |

这些字段合在一起，构成了"函数正在运行"的完整现场。

---

## 二、代码对象 vs 函数对象 vs 栈帧

这三个概念容易混淆，我们对比一下：

\`\`\`python
def foo(x):
    y = x + 1
    return y
\`\`\`

| 概念 | 是什么 | 什么时候存在 | 数量 |
|------|--------|--------------|------|
| **代码对象** | 编译后的字节码 + 常量 + 变量名表 | 定义函数时编译产生 | 1 份（共享） |
| **函数对象** | 代码对象的"包装" + 默认参数等 | \`def\` 执行时创建 | 1 份 |
| **栈帧** | 一次调用的运行现场 | **每次调用**时新建 | 调用几次就有几份 |

重点：**代码对象只有一份**，但**每次调用都生成一个新的栈帧**。所以同一个函数递归调用自己，会产生多个栈帧，它们共用同一个代码对象。

\`\`\`python
def f(n):
    if n > 0:
        f(n - 1)   # 这里又创建一个新帧，但用的是同一份代码对象
\`\`\`

---

## 三、调用栈：函数调用的嵌套

调用栈是一个**后进先出（LIFO）** 的结构。看这个例子：

\`\`\`python
def a():
    b()

def b():
    c()

def c():
    print("我在最里面")

a()
\`\`\`

执行到 \`print\` 时，调用栈长这样：

\`\`\`
栈顶 → c 的栈帧   ← 当前在执行
       b 的栈帧
       a 的栈帧
栈底 → 模块栈帧
\`\`\`

\`c\` 执行完，它的栈帧被弹出，\`b\` 成为栈顶继续执行。\`b\` 执行完弹出，\`a\` 继续……直到模块层。

---

## 四、局部变量为什么是"私有的"

每个栈帧都有自己的 \`f_locals\`，这就是为什么**不同函数里同名变量互不干扰**：

\`\`\`python
def func_a():
    x = 10       # 这是 func_a 的帧里的 x
    print(x)

def func_b():
    x = 20       # 这是 func_b 的帧里的 x，跟上面的 x 没关系
    print(x)
\`\`\`

每次调用都新建帧 → 新建 locals → 函数结束后帧销毁 → locals 一起消失。这就是局部变量"用完即弃"的原理。

---

## 五、栈溢出：递归太深的后果

调用栈不是无限大的。每多一层调用，栈就多一层。如果函数**无限嵌套**（比如递归没有正确的终止条件），栈就会"撑爆"。

\`\`\`python
def infinite():
    infinite()    # 自己调用自己，没有终止

infinite()        # 报错：RecursionError
\`\`\`

Python 默认的递归深度限制是 **1000**（可以用 \`sys.getrecursionlimit()\` 查看）。

\`\`\`python
import sys
print(sys.getrecursionlimit())   # 1000
\`\`\`

这个限制是**保护机制**，防止栈无限增长导致程序崩溃或吃光内存。

> ⚠️ 注意：递归深度限制不是"代码行数限制"，而是"同时存在的栈帧数量限制"。每多一层递归，栈帧就多一个。

---

## 六、为什么是"栈"而不是别的结构

为什么调用栈用的是**栈**这种后进先出的结构？

因为函数调用天然满足"后调用先返回"的规律：

- A 调用 B，B 调用 C
- C 一定**先返回**，然后 B 才能返回，然后 A 才能返回

这正好是栈的"后进先出"特性。如果用队列（先进先出）就乱套了。

---

## 七、用 f_locals 看每一层的变量

栈帧的 \`f_locals\` 是个字典，能直接看到这一层的所有局部变量。我们可以在递归里用它观察"每一层都装了什么"：

\`\`\`python
import sys

def countdown(n):
    frame = sys._getframe()
    print(f"这一层 n={n}, 局部变量={frame.f_locals}")
    if n > 0:
        countdown(n - 1)

countdown(3)
\`\`\`

你会看到每一层的 \`n\` 都不同，因为每一层都是独立的栈帧，有独立的 locals。

---

## 八、生活比喻总结

| 栈帧概念 | 办公桌比喻 |
|----------|------------|
| 栈帧 | 一张文件（任务清单） |
| 调用栈 | 桌上一摞文件 |
| 压栈 | 新任务放最上面 |
| 出栈 | 做完拿走最上面的 |
| f_back | 这张文件下面那张 |
| f_locals | 这张文件上的便签 |
| 栈溢出 | 文件堆太高，桌子塌了 |

---

## 九、常见疑问

**Q：栈帧什么时候销毁？**
A：函数返回时，栈帧从栈顶弹出，如果没有其他引用，就会被垃圾回收。局部变量随之消失。

**Q：能不能手动拿到上一层的局部变量？**
A：能用 \`sys._getframe().f_back.f_locals\`，但这是黑科技，正常代码不要这么做，会破坏封装。

**Q：递归深度能调大吗？**
A：能，\`sys.setrecursionlimit(5000)\`，但调太大可能真的导致 C 栈溢出，进程崩溃。

**Q：协程、生成器的栈帧和普通函数一样吗？**
A：生成器有自己的帧（\`gi_frame\`），但它是"挂起"的，不在主调用栈上。这是后面异步章节的内容。

---

## 十、这一章的 demo

下面的代码用递归函数 \`factorial\` 演示：

1. 每进入一层递归，打印当前栈帧的信息（函数名、行号、局部变量）
2. 计算"当前在第几层"（通过遍历 f_back）
3. 展示递归返回时，栈帧一层层消失的过程
4. 演示递归深度限制

跑一遍，你会清楚地看到"栈帧是怎么堆起来又怎么消失的"。`,
    code: `# ==========================================
# 第 12 章 demo：栈帧——函数的执行环境
# 递归中打印每一层的帧信息
# ==========================================
import sys      # sys 模块：访问解释器内部，包括栈帧

# 辅助函数：计算当前在调用栈的第几层
def get_call_depth():           # 定义辅助函数，用来数当前在第几层
    frame = sys._getframe()    # 拿到当前帧（即 get_call_depth 自己的帧）
    depth = 0                  # 计数器从 0 开始
    while frame is not None:   # 一直往上层走，直到没有上层
        depth += 1             # 每走一层，深度加一
        frame = frame.f_back   # 跳到调用我的那一层
    return depth - 1           # 减去自己这一层，得到真实调用深度

# 递归计算阶乘，同时打印每一层的栈帧信息
def factorial(n):              # 定义递归阶乘函数，参数是 n
    depth = get_call_depth()                 # 计算当前是第几层
    frame = sys._getframe()                  # 拿到当前栈帧
    indent = "    " * depth                  # 根据深度生成缩进，让输出好看
    print(f"{indent}↓ 进入第 {depth} 层：factorial({n})")  # 打印进入这一层
    print(f"{indent}  栈帧对象：{frame}")    # 打印栈帧对象
    print(f"{indent}  函数名：{frame.f_code.co_name}")  # 打印函数名
    print(f"{indent}  当前行号：{frame.f_lineno}")      # 打印当前行号
    print(f"{indent}  局部变量：{frame.f_locals}")      # 打印局部变量

    if n <= 1:                               # 基线条件：n 等于 1 或更小
        print(f"{indent}↑ 到达最底层，返回 1")  # 打印到达最底层
        return 1                             # 直接返回 1，不再递归

    sub = factorial(n - 1)                   # 递归调用，进入下一层
    result = n * sub                         # 当前层的结果 = n * 下一层的结果
    print(f"{indent}↑ 第 {depth} 层返回：{n} * {sub} = {result}")  # 打印回溯
    return result                            # 返回这一层的结果

# 第一部分：查看系统默认的递归深度限制
print("=" * 55)               # 打印分隔线
print("第一部分：递归深度限制")  # 打印这部分的小标题
print("=" * 55)               # 打印分隔线
print("系统默认最大递归深度：", sys.getrecursionlimit())   # 查看限制

# 第二部分：执行递归，观察栈帧
print()                       # 打印空行
print("=" * 55)               # 打印分隔线
print("第二部分：递归过程中的栈帧")  # 打印这部分的小标题
print("=" * 55)               # 打印分隔线
final = factorial(4)          # 计算 4 的阶乘
print()                       # 打印空行
print("最终结果：4! =", final)  # 打印最终结果

# 第三部分：观察局部变量的独立性
print()                       # 打印空行
print("=" * 55)               # 打印分隔线
print("第三部分：每层栈帧的局部变量是独立的")  # 打印这部分的小标题
print("=" * 55)               # 打印分隔线

def show_locals(level):       # 定义函数，演示每层局部变量独立
    frame = sys._getframe()              # 拿到当前帧
    local_x = "第" + str(level) + "层专属"  # 每层定义自己的 x
    print(f"  level={level}, 这层的 locals={frame.f_locals}")  # 打印这层的局部变量
    if level > 0:                        # 如果还没到最底层
        show_locals(level - 1)           # 继续往下递归

show_locals(3)                # 调用，观察每层 locals 不同

# 第四部分：演示栈溢出
print()                       # 打印空行
print("=" * 55)               # 打印分隔线
print("第四部分：栈溢出演示")  # 打印这部分的小标题
print("=" * 55)               # 打印分隔线

def boom(counter):            # 定义一个无限递归的函数
    counter += 1              # 每调用一次，计数器加一
    return boom(counter)      # 无限递归，没有终止条件

try:                          # 尝试执行可能出错的代码
    boom(0)                   # 尝试无限递归
except RecursionError as e:   # 捕获递归深度超限的错误
    print("捕获到 RecursionError：", e)  # 打印错误信息
    print("说明：调用栈被撑爆了，Python 强行阻止了继续递归")  # 打印说明

# 第五部分：f_back 的作用
print()                       # 打印空行
print("=" * 55)               # 打印分隔线
print("第五部分：f_back 指向调用者")  # 打印这部分的小标题
print("=" * 55)               # 打印分隔线

def child():                  # 定义子函数
    my_frame = sys._getframe()              # 当前帧（child）
    parent_frame = my_frame.f_back          # 上一层帧（parent）
    print("  child 的函数名：", my_frame.f_code.co_name)        # 打印 child 名字
    print("  调用者函数名：", parent_frame.f_code.co_name)      # 打印调用者名字
    print("  调用者的局部变量：", parent_frame.f_locals)        # 打印调用者的局部变量

def parent():                 # 定义父函数
    msg = "我是 parent"       # parent 的局部变量
    child()                   # 调用 child

parent()                      # 从这里开始

print()                       # 打印空行
print("✅ 栈帧 = 一次调用的完整现场，调用栈 = 一摞栈帧")  # 总结`
  },
  {
    id: "pyrun-13",
    group: "函数调用的秘密",
    icon: "📦",
    title: "传参机制：值还是引用",
    content: `## Python 传参：到底是"传值"还是"传引用"

这是 Python 面试里最经典的问题之一，也是新手最容易踩坑的地方。

先说结论：**Python 既不是"传值"，也不是"传引用"，而是"传对象引用"（pass by object reference）**，也有人叫"传共享"（pass by sharing）。

**大白话比喻**：传参就像给别人一把**钥匙**。

- 对方拿着钥匙能**打开你的柜子**，修改里面的东西（可变对象，内部修改影响外面）
- 但对方**不能换掉你的柜子**（重新赋值不影响外面，因为外面那把钥匙还指向旧柜子）

---

## 一、先理解"变量"和"对象"的关系

在 Python 里，**变量不是盒子，而是标签**。

\`\`\`python
a = [1, 2, 3]
b = a
b.append(4)
print(a)   # [1, 2, 3, 4]  ← a 也变了！
\`\`\`

为什么？因为 \`a\` 和 \`b\` 是两张**贴在同一个列表对象上的标签**。\`b.append(4)\` 修改的是那个列表本身，\`a\` 看到的当然是修改后的。

用 \`id()\` 能看到对象的"身份证号"：

\`\`\`python
a = [1, 2, 3]
b = a
print(id(a), id(b))   # 两个 id 一样，说明是同一个对象
\`\`\`

---

## 二、可变对象 vs 不可变对象

这是理解传参的关键。Python 的对象分两类：

| 类型 | 可变性 | 例子 |
|------|--------|------|
| **可变对象** | 创建后能改内容 | list、dict、set |
| **不可变对象** | 创建后不能改内容 | int、float、str、tuple |

"不可变"不是说变量不能重新赋值，而是**对象本身的内容不能改**。当你写 \`x = x + 1\`，Python 不是修改原来的整数对象，而是**创建了一个新的整数对象**，把 \`x\` 重新指向它。

\`\`\`python
x = 10
print(id(x))    # 比如 4300000000
x = x + 1
print(id(x))    # 变了！比如 4300000016，是新对象
\`\`\`

而列表：

\`\`\`python
lst = [1, 2]
print(id(lst))     # 比如 4500000000
lst.append(3)
print(id(lst))     # 还是 4500000000，同一个对象
\`\`\`

---

## 三、传不可变对象：外面不受影响

当你把一个不可变对象传给函数：

\`\`\`python
def modify(x):
    x = x + 10      # 这里创建了新对象，x 指向新对象
    print("函数内 x =", x)

a = 5
modify(a)
print("外面 a =", a)   # 还是 5，没变
\`\`\`

原理：函数里的 \`x\` 一开始和外面的 \`a\` 指向同一个整数 5。但 \`x = x + 10\` 创建了一个新整数 15，让 \`x\` 指向它。**外面的 \`a\` 还是指向 5**，没受影响。

这就是"不能换掉你的柜子"。

---

## 四、传可变对象：内部修改影响外面

当你把一个可变对象传给函数：

\`\`\`python
def modify(lst):
    lst.append(100)    # 原地修改，没创建新对象
    print("函数内 lst =", lst)

my = [1, 2]
modify(my)
print("外面 my =", my)   # [1, 2, 100]，变了！
\`\`\`

原理：函数里的 \`lst\` 和外面的 \`my\` 指向**同一个列表**。\`lst.append(100)\` 修改的是这个列表本身，所以外面看到的也变了。

这就是"对方能打开你的柜子，往里塞东西"。

---

## 五、但是！重新赋值不影响外面

注意区分"修改对象"和"重新赋值"：

\`\`\`python
def reassign(lst):
    lst = [9, 9, 9]     # 这是重新赋值，让 lst 指向一个新列表
    print("函数内 lst =", lst)

my = [1, 2]
reassign(my)
print("外面 my =", my)   # 还是 [1, 2]，没变！
\`\`\`

为什么？因为 \`lst = [9,9,9]\` 是让**函数内的局部变量 lst 指向一个全新的列表**，外面的 \`my\` 还是指向原来的那个 \[1, 2\]。

| 操作 | 影响 | 原因 |
|------|------|------|
| \`lst.append(x)\` | 外面变 | 修改原对象 |
| \`lst[0] = x\` | 外面变 | 修改原对象 |
| \`lst = 新列表\` | 外面不变 | 局部变量重新指向 |
| \`lst += [x]\` | list 外面变，int 外面不变 | list 的 += 是原地操作 |

---

## 六、经典陷阱：可变默认参数

这是 Python 最著名的坑之一：

\`\`\`python
def add_item(item, lst=[]):    # 默认值是空列表
    lst.append(item)
    return lst

print(add_item(1))   # [1]
print(add_item(2))   # [1, 2]  ← 不是 [2]！
print(add_item(3))   # [1, 2, 3]  ← 越来越长！
\`\`\`

为什么会这样？因为**默认参数的值在函数定义时只创建一次**，之后所有调用共用同一个默认列表对象。

正确写法是用 \`None\` 当哨兵：

\`\`\`python
def add_item(item, lst=None):
    if lst is None:
        lst = []       # 每次调用都新建
    lst.append(item)
    return lst
\`\`\`

记住这条规则：**永远不要用可变对象（list、dict、set）做默认参数**。

---

## 七、*args 和 **kwargs 的本质

\`*args\` 和 \`**kwargs\` 不是什么神秘语法，它们只是**自动打包**机制：

\`\`\`python
def func(*args, **kwargs):
    print(type(args))     # <class 'tuple'>
    print(type(kwargs))   # <class 'dict'>
    print(args)
    print(kwargs)

func(1, 2, 3, name="Tom", age=20)
# args   = (1, 2, 3)            多余的位置参数打包成元组
# kwargs = {'name':'Tom', 'age':20}  多余的关键字参数打包成字典
\`\`\`

| 语法 | 位置 | 作用 |
|------|------|------|
| \`*args\` | 形参 | 收集多余位置参数为元组 |
| \`**kwargs\` | 形参 | 收集多余关键字参数为字典 |
| \`*lst\` | 实参 | 把列表/元组拆开当位置参数传 |
| \`**dct\` | 实参 | 把字典拆开当关键字参数传 |

\`\`\`python
def add(a, b, c):
    return a + b + c

nums = [1, 2, 3]
print(add(*nums))        # 等价于 add(1, 2, 3)

info = {'a': 1, 'b': 2, 'c': 3}
print(add(**info))       # 等价于 add(a=1, b=2, c=3)
\`\`\`

---

## 八、一张图总结传参机制

\`\`\`
调用方               函数内
  a ──┐               ┌── x
      ↓               ↓
      [同一个对象] ←─────  传的是引用（钥匙）
      ↑               ↑
  my ──┘               └── lst

- 如果函数内 lst.append() → 修改对象 → my 看得到变化
- 如果函数内 lst = 新对象 → x 指向新对象 → my 不受影响
\`\`\`

---

## 九、生活比喻总结

| 传参场景 | 钥匙比喻 |
|----------|----------|
| 传可变对象 | 给对方一把能开你柜子的钥匙 |
| 函数内 append/修改 | 对方往你柜子里放东西，你当然看得到 |
| 函数内重新赋值 | 对方拿了把新钥匙开别的柜子，你那把还是开你柜子 |
| 传不可变对象 | 给对方一张不能改的便签，对方要"改"只能抄一张新的 |
| 可变默认参数 | 函数配了一把"公共钥匙"，所有人共用一个柜子 |

---

## 十、这一章的 demo

下面的代码完整演示：

1. 不可变对象传参：用 id 追踪对象变化
2. 可变对象传参：append 影响外面
3. 重新赋值 vs 原地修改的区别
4. 可变默认参数的陷阱
5. *args 和 **kwargs 的打包与拆包

跑完这个 demo，传参机制你就彻底搞懂了。`,
    code: `# ==========================================
# 第 13 章 demo：传参机制——值还是引用
# 演示可变/不可变参数的行为差异
# ==========================================

# 第一部分：不可变对象（整数）作为参数
print("=" * 55)               # 打印分隔线
print("第一部分：不可变对象传参")  # 打印这部分的小标题
print("=" * 55)               # 打印分隔线

def modify_immutable(x):      # 定义函数，接收一个不可变对象
    print(f"  进入函数，x = {x}, id = {id(x)}")   # 打印刚进来时的 x 和地址
    x = x + 10                                     # 创建新整数对象，x 指向新对象
    print(f"  修改后，  x = {x}, id = {id(x)}")   # 打印修改后的 x，地址应该变了
    return x                                       # 返回新值

a = 5                                              # 定义一个整数 a
print(f"调用前，a = {a}, id = {id(a)}")            # 打印调用前 a 的值和地址
modify_immutable(a)                                # 把 a 传进函数
print(f"调用后，a = {a}, id = {id(a)}")            # 打印调用后 a，值和地址都没变
print("结论：不可变对象传参，外面不受影响")          # 打印结论

# 第二部分：可变对象（列表）作为参数
print()                       # 打印空行
print("=" * 55)               # 打印分隔线
print("第二部分：可变对象传参（原地修改）")  # 打印这部分的小标题
print("=" * 55)               # 打印分隔线

def modify_mutable(lst):      # 定义函数，接收一个可变对象
    print(f"  进入函数，lst = {lst}, id = {id(lst)}")   # 打印进来时的列表和地址
    lst.append(100)                                     # 原地修改：往列表末尾加元素
    print(f"  append 后，lst = {lst}, id = {id(lst)}")  # 打印修改后，地址应该没变

my_list = [1, 2, 3]                                     # 定义一个列表
print(f"调用前，my_list = {my_list}, id = {id(my_list)}")  # 打印调用前
modify_mutable(my_list)                                 # 把列表传进函数
print(f"调用后，my_list = {my_list}, id = {id(my_list)}")  # 打印调用后，值变了
print("结论：可变对象被原地修改，外面看得到变化")      # 打印结论

# 第三部分：重新赋值 vs 原地修改
print()                       # 打印空行
print("=" * 55)               # 打印分隔线
print("第三部分：重新赋值不影响外面")  # 打印这部分的小标题
print("=" * 55)               # 打印分隔线

def reassign_list(lst):       # 定义函数，演示重新赋值
    print(f"  进入函数，lst = {lst}, id = {id(lst)}")   # 打印进来时的列表
    lst = [9, 9, 9]                                     # 重新赋值：指向一个全新列表
    print(f"  重新赋值，lst = {lst}, id = {id(lst)}")   # 打印新列表，地址变了

original = [1, 2, 3]                                    # 定义原始列表
print(f"调用前，original = {original}, id = {id(original)}")  # 打印调用前
reassign_list(original)                                 # 调用函数
print(f"调用后，original = {original}, id = {id(original)}")  # 打印调用后，没变
print("结论：函数内重新赋值 = 换了把钥匙，不影响外面")  # 打印结论

# 第四部分：可变默认参数陷阱
print()                       # 打印空行
print("=" * 55)               # 打印分隔线
print("第四部分：可变默认参数的陷阱")  # 打印这部分的小标题
print("=" * 55)               # 打印分隔线

def append_bad(item, lst=[]): # 默认值是空列表（危险！）
    lst.append(item)          # 往默认列表里加元素
    return lst                # 返回列表

print("第一次调用 append_bad(1)：", append_bad(1))    # 看似返回 [1]
print("第二次调用 append_bad(2)：", append_bad(2))    # 居然返回 [1, 2]
print("第三次调用 append_bad(3)：", append_bad(3))    # 越来越长 [1,2,3]
print("原因：默认列表在定义时只创建一次，所有调用共享")  # 打印原因

def append_good(item, lst=None):  # 正确做法：用 None 当哨兵
    if lst is None:               # 如果没传 lst
        lst = []                  # 每次都新建一个空列表
    lst.append(item)              # 往列表里加元素
    return lst                    # 返回列表

print()                        # 打印空行
print("正确做法：")             # 打印小标题
print("第一次 append_good(1)：", append_good(1))      # 返回 [1]
print("第二次 append_good(2)：", append_good(2))      # 返回 [2]，互不影响

# 第五部分：*args 和 **kwargs
print()                       # 打印空行
print("=" * 55)               # 打印分隔线
print("第五部分：*args 和 **kwargs 的本质")  # 打印这部分的小标题
print("=" * 55)               # 打印分隔线

def show_args(*args, **kwargs):          # *收集位置参数，**收集关键字参数
    print(f"  args 类型：{type(args).__name__}, 值：{args}")       # args 是元组
    print(f"  kwargs 类型：{type(kwargs).__name__}, 值：{kwargs}") # kwargs 是字典

print("调用 show_args(1, 2, 3, name='Tom', age=20)：")  # 打印提示
show_args(1, 2, 3, name="Tom", age=20)   # 传位置参数和关键字参数

# 拆包：把列表/字典拆开传进去
print()                       # 打印空行
print("拆包演示：")           # 打印小标题
def add_three(a, b, c):       # 一个需要三个参数的函数
    return a + b + c          # 返回三者之和

nums = [10, 20, 30]           # 一个列表
print(f"  add_three(*{nums}) =", add_three(*nums))     # *nums 拆成三个位置参数

info = {"a": 100, "b": 200, "c": 300}    # 一个字典
print(f"  add_three(**info) =", add_three(**info))     # **info 拆成三个关键字参数

print()                       # 打印空行
print("✅ 传参传的是对象引用：可变改得了，不可变改不了，重新赋值不影响外面")  # 总结`
  },
  {
    id: "pyrun-14",
    group: "函数调用的秘密",
    icon: "🔄",
    title: "递归原理：自己调用自己",
    content: `## 递归：函数调用自己

递归是函数调用里最"烧脑"也最优雅的一种形式：**一个函数在自己的函数体里调用自己**。

**大白话比喻**：递归就像**俄罗斯套娃**。

- 你打开一个大娃娃，里面有个小一点的
- 再打开，里面还有更小的
- 一直打开，直到最小的那个"不能再打开"（基线条件）
- 然后从最小的开始，一层层把结果"装回去"

---

## 一、递归的两个必备要素

写递归，必须有两样东西，缺一不可：

### 1. 基线条件（Base Case）

告诉函数"什么时候停"。没有基线条件，递归就会无限进行，直到栈溢出。

\`\`\`python
def factorial(n):
    if n <= 1:          # 基线条件：n 是 1 或更小，不用再递归
        return 1
    return n * factorial(n - 1)   # 递归条件：继续往下
\`\`\`

### 2. 递归条件（Recursive Case）

函数调用自己，但**参数必须朝着基线条件逼近**。上面例子里 \`n - 1\` 就是让问题规模变小，最终会到达 \`n <= 1\`。

| 要素 | 作用 | 阶乘例子 |
|------|------|----------|
| 基线条件 | 停止递归 | \`n <= 1\` 时返回 1 |
| 递归条件 | 继续递归，规模缩小 | \`n * factorial(n-1)\` |

> ⚠️ 如果递归条件里参数不缩小（比如写成 \`factorial(n)\`），永远到不了基线条件，就会栈溢出。

---

## 二、递归的执行过程：栈不断增长

我们用 \`factorial(4)\` 来看递归到底发生了什么：

\`\`\`
factorial(4)
  → 4 * factorial(3)
       → 3 * factorial(2)
            → 2 * factorial(1)
                 → 返回 1              （基线条件触发）
            ← 2 * 1 = 2               （回溯）
       ← 3 * 2 = 6                    （回溯）
  ← 4 * 6 = 24                        （回溯）
返回 24
\`\`\`

注意两个阶段：

1. **递进阶段**（→）：不断调用，栈帧一层层堆上去
2. **回溯阶段**（←）：从最深一层开始返回，栈帧一层层消失，结果一层层算出来

每递进一层，调用栈就多一个栈帧。所以递归的**最大深度 = 同时存在的栈帧数量**。

---

## 三、Python 的递归深度限制

Python 默认限制递归深度为 **1000**：

\`\`\`python
import sys
print(sys.getrecursionlimit())   # 1000
\`\`\`

这是保护机制。如果你写了个没有正确基线条件的递归：

\`\`\`python
def bad():
    return bad()
bad()   # RecursionError: maximum recursion depth exceeded
\`\`\`

Python 会在栈帧数量达到 1000 时抛出 \`RecursionError\`，而不是让程序崩溃。

你可以用 \`sys.setrecursionlimit()\` 调大，但**不建议调太大**——因为 Python 的栈帧是在 C 栈上分配的，调太大可能直接导致段错误（进程崩溃），而不是优雅的异常。

---

## 四、为什么 Python 没有尾递归优化

**尾递归**是指：递归调用是函数的**最后一步**，返回值直接就是递归调用的结果，不需要再做运算。

\`\`\`python
# 这是尾递归：return 的就是递归调用本身
def factorial_tail(n, acc=1):
    if n <= 1:
        return acc
    return factorial_tail(n - 1, n * acc)   # 最后一步就是递归
\`\`\`

在一些语言（Scheme、Haskell）里，编译器会做**尾递归优化（TCO）**：识别出尾递归后，**复用当前栈帧**，不再新建。这样尾递归就不会栈溢出，跟循环一样高效。

**但 Python 不做尾递归优化**。原因是 Python 之父亲自表态：

- 尾递归优化会让调试更困难（调用栈被改写，traceback 不完整）
- Python 强调可读性和可调试性，优先于此

所以在 Python 里，**递归深度受限是天然的限制**。深层递归要改成迭代。

---

## 五、递归 vs 迭代

任何递归都能改成迭代（循环），反之亦然。但各有优劣：

| 维度 | 递归 | 迭代 |
|------|------|------|
| 代码可读性 | 高（符合数学直觉） | 中（需要维护循环变量） |
| 内存占用 | 高（每层一个栈帧） | 低（固定变量） |
| 深度限制 | 有（默认 1000） | 无（受时间限制） |
| 适合场景 | 树/图遍历、分治 | 线性计算、简单重复 |

**经验法则**：

- 问题本身是递归定义的（如树结构、分治算法）→ 用递归，代码清晰
- 只是简单重复计算 → 用迭代，性能好、不爆栈
- 递归深度可能很大 → 改成迭代，或者用显式栈模拟

---

## 六、递归的经典例子：斐波那契

\`\`\`python
def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)
\`\`\`

这个写法**非常低效**，因为它会重复计算（\`fib(5)\` 会算两次 \`fib(3)\`，三次 \`fib(2)\`）。可以用记忆化或改成迭代优化。

但作为"理解递归"的例子，它很直观：斐波那契本身就是递归定义的。

### 用记忆化优化递归

朴素的 \`fib\` 会重复计算同一个子问题。加个"记事本"就能避免：

\`\`\`python
def fib_memo(n, cache={}):
    if n in cache:              # 算过了，直接查表
        return cache[n]
    if n <= 1:
        return n
    cache[n] = fib_memo(n-1) + fib_memo(n-2)   # 算完存起来
    return cache[n]
\`\`\`

这叫**记忆化（memoization）**：把已经算过的结果记下来，下次直接用。标准库的 \`functools.lru_cache\` 就是干这个的，一行装饰器就能搞定。

---

## 六点五、写递归的三步思维法

新手写递归容易懵，按这三步走就不慌：

1. **先想基线条件**：最小的问题是什么？直接能给出答案的那种。比如阶乘的基线是 \`n=1 时返回 1\`。
2. **假设小一号的问题已经解决了**：相信 \`factorial(n-1)\` 能正确返回 \`(n-1)!\`，不要去脑子里一步步展开。
3. **用小问题的答案拼出当前问题的答案**：\`n! = n * (n-1)!\`，把递归调用当成"已经算好的值"用。

关键是第 2 步——**不要在脑子里展开所有层**，那会绕晕。只要相信"小问题能解决"，再拼装就行。这叫"递归信仰之跃"。

| 步骤 | 阶乘例子 | 斐波那契例子 |
|------|----------|--------------|
| 基线条件 | \`n<=1 返回 1\` | \`n<=1 返回 n\` |
| 假设小问题已解 | \`factorial(n-1)\` 是对的 | \`fib(n-1)\`、\`fib(n-2)\` 是对的 |
| 拼装答案 | \`n * factorial(n-1)\` | \`fib(n-1) + fib(n-2)\` |

---

## 七、递归的典型应用场景

| 场景 | 为什么适合递归 |
|------|----------------|
| 树遍历（文件系统、DOM 树） | 树本身就是递归结构 |
| 分治算法（归并排序、快速排序） | 把大问题拆成小问题 |
| 回溯算法（八皇后、迷宫） | 尝试-撤销天然递归 |
| JSON 解析 | 嵌套结构 |
| 汉诺塔 | 递归定义的问题 |

---

## 八、生活比喻总结

| 递归概念 | 套娃比喻 |
|----------|----------|
| 递归调用 | 打开一个套娃，发现里面还有一个 |
| 基线条件 | 最小的那个套娃，打不开了 |
| 递进阶段 | 从大到小一层层打开 |
| 回溯阶段 | 从小到大一层层装回去、算结果 |
| 栈帧 | 每打开一层，桌上就多一个套娃 |
| 栈溢出 | 套娃太多，桌子塌了 |
| 尾递归优化 | 打开新的同时收起旧的，桌上始终一个 |

---

## 九、常见误区

1. **"递归一定比循环慢"** ❌ 不一定，但 Python 里递归确实有函数调用开销
2. **"递归深度限制是 bug"** ❌ 它是保护机制
3. **"尾递归在 Python 里更安全"** ❌ Python 不做尾递归优化，尾递归照样受 1000 限制
4. **"递归只要有 return 就行"** ❌ 必须有正确的**基线条件**，且参数要朝基线逼近

---

## 十、这一章的 demo

下面的代码：

1. 实现阶乘递归，**打印每一层的调用深度和局部变量**
2. 展示递进和回溯两个阶段
3. 用迭代方式做对比
4. 演示递归深度限制和 \`RecursionError\`
5. 展示一个"没有基线条件"的反面例子

跑完你会看到：递归就是"栈帧一层层堆上去，再一层层消失"的过程。`,
    code: `# ==========================================
# 第 14 章 demo：递归原理——自己调用自己
# 阶乘递归 + 打印调用栈深度
# ==========================================
import sys      # sys 模块：访问递归深度限制

# 辅助函数：计算当前在调用栈的第几层
def current_depth():           # 定义辅助函数，数当前在第几层
    frame = sys._getframe()    # 拿到当前帧（current_depth 自己的帧）
    depth = 0                  # 计数器
    while frame is not None:   # 一直往上走
        depth += 1             # 每走一层加一
        frame = frame.f_back   # 跳到上一层
    return depth - 1           # 减去 current_depth 自己这一层

# 递归版本阶乘：打印每一层的过程
def factorial_recursive(n):    # 定义递归阶乘函数
    depth = current_depth()                    # 当前在第几层
    indent = "    " * depth                    # 缩进让输出更直观
    print(f"{indent}↓ 第 {depth} 层进入：factorial({n})")  # 打印进入这一层

    if n <= 1:                                 # 基线条件：n 是 1 或更小
        print(f"{indent}★ 基线条件触发，直接返回 1")  # 打印基线触发
        return 1                               # 不再递归，返回 1

    print(f"{indent}  准备调用 factorial({n - 1})，进入下一层")  # 打印准备递归
    sub_result = factorial_recursive(n - 1)    # 递归调用，规模缩小
    result = n * sub_result                    # 当前层结果 = n * 下一层结果
    print(f"{indent}↑ 第 {depth} 层回溯：{n} * {sub_result} = {result}")  # 打印回溯
    return result                              # 返回当前层结果

# 迭代版本阶乘：用循环实现
def factorial_iterative(n):    # 定义迭代阶乘函数
    result = 1                          # 累乘器，从 1 开始
    for i in range(1, n + 1):           # 从 1 循环到 n
        result = result * i             # 依次乘上去
    return result                       # 返回最终结果

# 第一部分：查看递归深度限制
print("=" * 55)               # 打印分隔线
print("第一部分：Python 的递归深度限制")  # 打印这部分的小标题
print("=" * 55)               # 打印分隔线
print("系统默认最大递归深度：", sys.getrecursionlimit())   # 查看限制值
print("说明：超过这个深度，Python 会抛出 RecursionError")  # 打印说明

# 第二部分：递归执行过程
print()                       # 打印空行
print("=" * 55)               # 打印分隔线
print("第二部分：递归执行 factorial(5) 的完整过程")  # 打印这部分的小标题
print("=" * 55)               # 打印分隔线
answer = factorial_recursive(5)  # 递归计算 5 的阶乘
print()                       # 打印空行
print("最终结果：5! =", answer)  # 打印最终结果

# 第三部分：迭代版本对比
print()                       # 打印空行
print("=" * 55)               # 打印分隔线
print("第三部分：迭代版本（用循环实现）")  # 打印这部分的小标题
print("=" * 55)               # 打印分隔线
answer2 = factorial_iterative(5)  # 迭代计算 5 的阶乘
print("迭代版本结果：5! =", answer2)  # 打印迭代结果
print("两种方式结果一样：", answer == answer2)  # 打印对比

# 第四部分：递归深度限制演示
print()                       # 打印空行
print("=" * 55)               # 打印分隔线
print("第四部分：递归深度限制演示")  # 打印这部分的小标题
print("=" * 55)               # 打印分隔线

def count_up(counter):        # 定义一个无限递归的函数
    counter = counter + 1     # 每层加一
    return count_up(counter)  # 无限递归，没有基线条件

try:                          # 尝试执行可能出错的代码
    count_up(0)               # 尝试无限递归
except RecursionError as e:   # 捕获递归超限错误
    print("捕获到 RecursionError：", e)  # 打印错误信息
    print("说明：到达递归深度上限，Python 强行阻止了继续调用")  # 打印说明

# 第五部分：错误的递归——参数没有缩小
print()                       # 打印空行
print("=" * 55)               # 打印分隔线
print("第五部分：反面例子——参数不缩小也会爆栈")  # 打印这部分的小标题
print("=" * 55)               # 打印分隔线

def wrong_factorial(n):       # 定义一个错误的阶乘函数
    if n <= 1:                # 基线条件
        return 1              # 返回 1
    return n * wrong_factorial(n)  # 错误：参数还是 n，不会到达基线

try:                          # 尝试执行可能出错的代码
    wrong_factorial(5)        # 参数不缩小，无限递归
except RecursionError as e:   # 捕获错误
    print("捕获到 RecursionError：", e)  # 打印错误信息
    print("教训：递归条件的参数必须朝基线条件逼近，否则永远停不下来")  # 打印教训

# 第六部分：递归适合的场景——树形结构
print()                       # 打印空行
print("=" * 55)               # 打印分隔线
print("第六部分：递归适合的场景（树形遍历）")  # 打印这部分的小标题
print("=" * 55)               # 打印分隔线

# 用嵌套字典模拟一棵树
tree = {                      # 定义树的根节点
    "name": "根",             # 根节点名字
    "children": [             # 子节点列表
        {"name": "子A", "children": [  # 子节点 A
            {"name": "孙A1", "children": []},  # 孙节点 A1
        ]},                             # 子节点 A 的 children 列表结束
        {"name": "子B", "children": []},  # 子节点 B
    ]                                   # children 列表结束
}                                       # tree 字典定义结束

def print_tree(node, level=0):  # 定义递归遍历树的函数
    indent = "  " * level               # 根据深度缩进
    print(f"{indent}- {node['name']}")  # 打印当前节点
    for child in node["children"]:      # 遍历每个子节点
        print_tree(child, level + 1)    # 递归打印子树，深度加一

print("遍历树形结构：")       # 打印提示
print_tree(tree)              # 从根开始遍历

print()                       # 打印空行
print("✅ 递归 = 递进（栈增长）+ 回溯（栈收缩），基线条件是停止开关")  # 总结`
  },
  {
    id: "pyrun-15",
    group: "函数调用的秘密",
    icon: "⚡",
    title: "装饰器原理：函数包装函数",
    content: `## 装饰器：给函数"套个壳"

装饰器是 Python 里非常优雅的特性，但很多人觉得它"难懂"。其实理解了前面几章的函数调用、闭包，装饰器就是一层窗户纸。

**大白话比喻**：装饰器就像**给手机套个壳**。

- 手机还是那个手机（原函数还在）
- 但套了壳之后，它多了些功能（防摔、计时、日志……）
- 你用手机的方式没变（调用方式不变）

装饰器**接收一个函数，返回一个新函数**，新函数在原函数基础上"加点料"。

---

## 一、装饰器的本质：高阶函数

装饰器本质就是一个**高阶函数**：参数是函数，返回值也是函数。

\`\`\`python
def my_decorator(func):          # 接收一个函数作为参数
    def wrapper():               # 定义一个新函数
        print("调用前")          # 加点料
        func()                   # 调用原函数
        print("调用后")          # 加点料
    return wrapper               # 返回新函数

def hello():
    print("hello!")

hello = my_decorator(hello)      # 手动"装饰"
hello()                          # 现在调用 hello 会打印"调用前"和"调用后"
\`\`\`

关键点：

1. \`my_decorator\` 接收 \`hello\`，返回 \`wrapper\`
2. \`hello\` 这个名字被重新指向了 \`wrapper\`
3. 以后调用 \`hello()\`，实际执行的是 \`wrapper()\`

---

## 二、@ 语法糖：只是简写

\`@\` 符号是**语法糖**（syntactic sugar），让装饰器写起来更简洁：

\`\`\`python
@my_decorator
def hello():
    print("hello!")
\`\`\`

它完全等价于：

\`\`\`python
def hello():
    print("hello!")
hello = my_decorator(hello)     # 这一行被 @ 自动做了
\`\`\`

所以 \`@my_decorator\` 的意思就是："定义完 hello 后，立刻执行 \`hello = my_decorator(hello)\`"。

> 💡 记住：\`@decorator\` 只是 \`func = decorator(func)\` 的简写，没有任何魔法。

---

## 三、装饰带参数的函数

上面的 \`wrapper\` 没有参数。如果原函数有参数怎么办？用 \`*args, **kwargs\` 通吃：

\`\`\`python
def my_decorator(func):
    def wrapper(*args, **kwargs):        # 接收任意参数
        print("调用前")
        result = func(*args, **kwargs)   # 把参数原样传给原函数
        print("调用后")
        return result                    # 把原函数的返回值传出去
    return wrapper

@my_decorator
def add(a, b):
    return a + b

print(add(1, 2))   # 会打印"调用前"、"调用后"，再打印 3
\`\`\`

**重点**：\`wrapper\` 必须用 \`*args, **kwargs\` 才能适配任意签名的函数，并且要 \`return result\` 把原函数的返回值传出去，否则原函数的返回值会被吞掉。

---

## 四、functools.wraps：保留原函数信息

被装饰后，\`hello\` 实际指向的是 \`wrapper\`，所以 \`hello.__name__\` 会变成 \`"wrapper"\`，文档字符串也丢了。

\`\`\`python
@my_decorator
def hello():
    """这是 hello 的文档"""
    print("hello")

print(hello.__name__)   # "wrapper"  ← 不是 "hello"！
print(hello.__doc__)    # None       ← 文档丢了！
\`\`\`

解决办法是用 \`functools.wraps\`：

\`\`\`python
from functools import wraps

def my_decorator(func):
    @wraps(func)                        # 把 func 的元信息复制到 wrapper
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
\`\`\`

\`@wraps(func)\` 会把原函数的 \`__name__\`、\`__doc__\`、\`__module__\` 等属性复制到 \`wrapper\` 上。**写装饰器时永远加上这一行**。

---

## 五、闭包在装饰器中的作用

装饰器能"记住"原函数，靠的就是**闭包**。

\`\`\`python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)   # wrapper 引用了外层的 func
    return wrapper
\`\`\`

\`wrapper\` 是在内层定义的，它**引用了外层作用域的 \`func\`**。即使 \`my_decorator\` 已经执行完毕返回了，\`func\` 这个变量依然被 \`wrapper\` 的闭包"持有"，不会消失。

这就是为什么装饰器返回的 \`wrapper\` 还能调用 \`func\`——闭包把 \`func\` "绑"在了 \`wrapper\` 身上。

| 概念 | 在装饰器里的角色 |
|------|------------------|
| 外层函数 | 装饰器本身，接收原函数 |
| 内层函数 | wrapper，替换原函数 |
| 闭包变量 | 原函数 func，被 wrapper 持有 |

---

## 六、多个装饰器的执行顺序

可以叠加多个装饰器：

\`\`\`python
@decorator_a
@decorator_b
def hello():
    print("hello")
\`\`\`

等价于：

\`\`\`python
hello = decorator_a(decorator_b(hello))
\`\`\`

注意顺序：**离函数近的装饰器先执行（先包装），离函数远的后执行（外层包装）**。

调用时的执行顺序像洋葱：

\`\`\`
调用 hello()
  → A 的"调用前"
    → B 的"调用前"
      → 真正的 hello()
    → B 的"调用后"
  → A 的"调用后"
\`\`\`

| 时机 | 顺序 |
|------|------|
| 装饰时（定义阶段） | 从下往上：先 B 后 A |
| 调用时（运行阶段） | 从外往内：A 前 → B 前 → 函数 → B 后 → A 后 |

---

## 七、带参数的装饰器

如果装饰器自己也要参数（比如 \`@repeat(3)\`），需要**再套一层**：

\`\`\`python
def repeat(times):                  # 外层：接收装饰器参数
    def decorator(func):            # 中层：接收原函数
        def wrapper(*args, **kwargs):
            for _ in range(times):  # 重复执行
                func(*args, **kwargs)
        return wrapper
    return decorator

@repeat(3)
def say():
    print("hi")

say()   # 打印三次 hi
\`\`\`

结构是三层嵌套：\`参数 → 装饰器 → wrapper\`。

---

## 八、类装饰器

除了用函数写装饰器，还可以用**类**。利用 \`__call__\` 方法，让类的实例"像函数一样被调用"：

\`\`\`python
class CountCalls:
    def __init__(self, func):
        self.func = func        # 保存原函数
        self.count = 0          # 记录调用次数

    def __call__(self, *args, **kwargs):
        self.count += 1         # 每次调用加一
        print(f"第 {self.count} 次调用")
        return self.func(*args, **kwargs)   # 调用原函数

@CountCalls
def say():
    print("hi")

say()   # 第 1 次调用 / hi
say()   # 第 2 次调用 / hi
print(say.count)   # 2
\`\`\`

类装饰器的优势：可以用**实例属性**保存状态（比如调用次数），比闭包写法更清晰。

| 装饰器类型 | 写法 | 保存状态 |
|------------|------|----------|
| 函数装饰器 | 嵌套函数 + 闭包 | 靠闭包变量 |
| 类装饰器 | \`__init__\` + \`__call__\` | 靠实例属性 |

---

## 九、装饰器的常见用途

| 用途 | 例子 |
|------|------|
| 计时 | 测量函数执行耗时 |
| 日志 | 自动记录函数调用 |
| 权限校验 | 检查用户是否登录 |
| 缓存 | \`functools.lru_cache\` |
| 重试 | 失败自动重试 |
| 限流 | 控制调用频率 |

Web 框架里到处都是装饰器：Flask 的 \`@app.route\`、Django 的 \`@login_required\`。

---

## 十、生活比喻总结

| 装饰器概念 | 手机壳比喻 |
|------------|------------|
| 装饰器函数 | 卖手机壳的店 |
| 原函数 | 你的手机 |
| wrapper | 套了壳的手机 |
| @语法 | "帮我套壳"的快捷说法 |
| 闭包 | 壳里预留的卡槽，把手机"卡住" |
| 多个装饰器 | 先套硅胶壳，再套皮革壳 |
| 带参数装饰器 | 选壳的颜色和款式 |
| 类装饰器 | 用一个"壳套"对象管理多件事 |

---

## 十一、这一章的 demo

下面的代码完整演示：

1. 实现一个**计时装饰器**，测量函数耗时
2. 用 \`functools.wraps\` 保留原函数信息
3. 演示**多个装饰器**的洋葱式执行顺序
4. 实现**带参数的装饰器**（重复执行 N 次）
5. 实现**类装饰器**（统计调用次数）

跑完你会看到：装饰器就是把"原函数"包进"新函数"，调用时一层层剥开。`,
    code: `# ==========================================
# 第 15 章 demo：装饰器原理——函数包装函数
# 实现计时装饰器，查看被装饰后的函数结构
# ==========================================
import time           # time 模块：计时
import functools      # functools 模块：提供 wraps 等工具

# 第一部分：最基本的装饰器
print("=" * 55)               # 打印分隔线
print("第一部分：计时装饰器")  # 打印这部分的小标题
print("=" * 55)               # 打印分隔线

def timer(func):              # 定义计时装饰器，接收原函数
    @functools.wraps(func)                    # 保留原函数的名称和文档
    def wrapper(*args, **kwargs):             # 用 *args/**kwargs 适配任意参数
        start = time.time()                   # 记录开始时间
        result = func(*args, **kwargs)        # 调用原函数，拿到返回值
        end = time.time()                     # 记录结束时间
        elapsed = end - start                 # 计算耗时
        print(f"  ⏱ {func.__name__} 耗时 {elapsed:.6f} 秒")  # 打印耗时
        return result                         # 把原函数的返回值传出去
    return wrapper                            # 返回新函数

@timer                                        # 等价于 slow = timer(slow)
def slow_function():                          # 定义一个慢函数
    """模拟一个慢函数"""                       # 文档字符串
    time.sleep(0.1)                           # 睡 0.1 秒，模拟耗时操作
    return "慢函数完成"                        # 返回结果

@timer                                        # 用计时装饰器装饰
def calc_sum(n):                              # 定义求和函数
    """计算 0 到 n-1 的和"""                   # 文档字符串
    total = 0                                 # 累加器
    for i in range(n):                        # 循环 n 次
        total = total + i                     # 累加
    return total                              # 返回总和

msg = slow_function()                         # 调用被装饰的函数
print("  返回值：", msg)                      # 打印返回值
print()                                       # 打印空行
s = calc_sum(100000)                          # 调用另一个被装饰的函数
print("  求和结果：", s)                      # 打印求和结果

# 第二部分：验证 functools.wraps 的作用
print()                       # 打印空行
print("=" * 55)               # 打印分隔线
print("第二部分：functools.wraps 保留原函数信息")  # 打印这部分的小标题
print("=" * 55)               # 打印分隔线

print("slow_function 的名字：", slow_function.__name__)      # 应该是 slow_function
print("slow_function 的文档：", slow_function.__doc__)       # 应该保留文档
print("是否被包装过：", hasattr(slow_function, "__wrapped__"))  # True

# 第三部分：多个装饰器的执行顺序
print()                       # 打印空行
print("=" * 55)               # 打印分隔线
print("第三部分：多个装饰器（洋葱模型）")  # 打印这部分的小标题
print("=" * 55)               # 打印分隔线

def decorator_a(func):        # 装饰器 A
    def wrapper(*args, **kwargs):          # 定义 wrapper
        print("  [A] 调用前")              # A 的前半部分
        result = func(*args, **kwargs)     # 调用内层
        print("  [A] 调用后")              # A 的后半部分
        return result                      # 返回结果
    return wrapper                          # 返回 wrapper

def decorator_b(func):        # 装饰器 B
    def wrapper(*args, **kwargs):          # 定义 wrapper
        print("  [B] 调用前")              # B 的前半部分
        result = func(*args, **kwargs)     # 调用内层
        print("  [B] 调用后")              # B 的后半部分
        return result                      # 返回结果
    return wrapper                          # 返回 wrapper

@decorator_a                                  # 先包 A（外层）
@decorator_b                                  # 再包 B（内层）
def say_hello():                              # 定义被装饰的函数
    print("  >>> 你好！")                      # 真正的函数体

print("调用 say_hello()：")   # 打印提示
say_hello()                   # 调用，观察洋葱式顺序

# 第四部分：带参数的装饰器
print()                       # 打印空行
print("=" * 55)               # 打印分隔线
print("第四部分：带参数的装饰器（重复执行 N 次）")  # 打印这部分的小标题
print("=" * 55)               # 打印分隔线

def repeat(times):            # 最外层：接收装饰器参数
    def decorator(func):      # 中层：接收原函数
        def wrapper(*args, **kwargs):         # 内层：实际替换的函数
            results = []                      # 收集每次的结果
            for i in range(times):            # 重复 times 次
                print(f"  第 {i + 1} 次执行")  # 打印第几次
                r = func(*args, **kwargs)     # 调用原函数
                results.append(r)             # 收集结果
            return results                    # 返回所有结果
        return wrapper                        # 中层返回 wrapper
    return decorator                          # 最外层返回 decorator

@repeat(3)                    # 重复 3 次
def greet(name):              # 定义被装饰的函数
    print(f"    你好，{name}！")  # 打印问候
    return name               # 返回名字

greet("小明")                 # 调用，会执行 3 次

# 第五部分：类装饰器
print()                       # 打印空行
print("=" * 55)               # 打印分隔线
print("第五部分：类装饰器（统计调用次数）")  # 打印这部分的小标题
print("=" * 55)               # 打印分隔线

class CountCalls:             # 类装饰器
    def __init__(self, func):                 # 初始化时接收原函数
        self.func = func                      # 保存原函数
        self.count = 0                        # 调用次数归零

    def __call__(self, *args, **kwargs):      # 让实例可以像函数一样被调用
        self.count = self.count + 1           # 每次调用，次数加一
        print(f"  第 {self.count} 次调用 {self.func.__name__}")  # 打印第几次
        return self.func(*args, **kwargs)     # 调用原函数并返回结果

@CountCalls                   # 用类装饰器装饰
def say_hi():                 # 定义被装饰的函数
    print("    Hi!")          # 打印 Hi
    return None               # 返回 None

say_hi()                      # 第 1 次
say_hi()                      # 第 2 次
say_hi()                      # 第 3 次
print("  总共调用了", say_hi.count, "次")  # 通过实例属性查看次数

# 第六部分：@ 语法糖等价于手动赋值
print()                       # 打印空行
print("=" * 55)               # 打印分隔线
print("第六部分：@ 语法糖等价于手动赋值")  # 打印这部分的小标题
print("=" * 55)               # 打印分隔线

def simple_decorator(func):   # 一个简单的装饰器
    def wrapper():            # 定义 wrapper
        print("  装饰器加的前缀")  # 打印前缀
        func()                # 调用原函数
        print("  装饰器加的后缀")  # 打印后缀
    return wrapper            # 返回 wrapper

def plain():                  # 定义普通函数
    print("  我是普通函数")   # 打印

print("方式一：手动装饰")     # 打印小标题
plain = simple_decorator(plain)  # 手动把 plain 替换成包装版
plain()                      # 调用

print()                       # 打印空行
print("方式二：@ 语法糖（等价）")  # 打印小标题

@simple_decorator             # 这一行等价于 manual = simple_decorator(manual)
def manual():                 # 定义普通函数
    print("  我是普通函数")   # 打印

manual()                      # 调用，效果一样

print()                       # 打印空行
print("✅ 装饰器 = 接收函数、返回新函数；@ 只是 func = decorator(func) 的简写")  # 总结`
  }
];
