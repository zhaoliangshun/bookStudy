// =============================================================
// Python 原理图解教程 —— 第二批章节（共 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   对象模型与内存（5 章）：
//     7. pyint-object     — Python 对象模型：一切皆对象
//     8. pyint-pyobject   — PyObject 结构：对象的内部表示
//     9. pyint-refcount   — 引用计数：内存管理的核心
//     10. pyint-cache     — 缓存机制：小整数与字符串驻留
//     11. pyint-namespace — 命名空间：名字与对象的绑定
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
//   - 仅使用 Python 标准库（sys, gc, weakref 等）
//   - 通过 print 输出结果
//   - 单文件可独立运行
//
// 转义规则：content/code 内部反引号写作 \`，\${ 写作 \$\{，
//           Python 代码中的 \n 写作 \\n。
// =============================================================

export const chapters = [
  // =========================================================
  // 第七章：Python 对象模型
  // =========================================================
  {
    id: "pyint-object",
    group: "对象模型与内存",
    icon: "📦",
    title: "Python 对象模型：一切皆对象",
    content: `## 一、什么是一切皆对象

Python 有一句名言："**一切皆对象**"。这不是夸张修辞，而是字面事实——在 Python 中，数字、字符串、列表是对象；函数、类、模块也是对象；甚至连 \`int\`、\`str\`、\`list\` 这种"类型"本身，也是对象。

\`\`\`text
  在 Python 中：
    42        → int 对象
    "hello"   → str 对象
    [1, 2, 3] → list 对象
    def f():  → function 对象
    class C:  → class 对象（也是 type 的实例）
    import os → module 对象
    int       → type 对象（类型本身也是对象）
\`\`\`

这意味着 Python 里的所有"东西"都可以被赋值给变量、作为参数传递、作为返回值，因为它们都遵循统一的"对象协议"。

## 二、对象的三个要素

每个 Python 对象都有三个核心要素：**身份（id）、类型（type）、值（value）**。

| 要素 | 含义 | 查看方式 | 是否可变 |
|------|------|----------|----------|
| 身份 id | 对象在内存中的唯一标识 | \`id(obj)\` | 不可变（终身不变） |
| 类型 type | 对象属于哪种类型 | \`type(obj)\` | 不可变（绝大多数情况） |
| 值 value | 对象实际承载的数据 | 直接访问 | 取决于类型 |

\`\`\`text
  对象 = (id, type, value)
    id   → 对象的"身份证号"，唯一且不变
    type → 对象的"种族"，决定能做什么操作
    value→ 对象的"内容"，可能可变也可能不可变
\`\`\`

### 1. 身份（id）

\`id()\` 函数返回对象的身份，在 CPython 中就是该对象在内存中的地址（一个整数）。每个对象的 id 在其生命周期内**唯一且不变**。可以用 \`is\` 运算符比较两个对象的 id 是否相同。

### 2. 类型（type）

\`type()\` 函数返回对象的类型。类型决定了对象支持哪些操作、占用多少内存。例如 \`int\` 类型支持加减乘除，\`str\` 类型支持拼接和切片。

### 3. 值（value）

值是对象承载的数据。能否修改值，取决于对象是"可变"还是"不可变"。

## 三、可变对象 vs 不可变对象

这是 Python 中最重要的区分之一，理解它才能避免很多隐蔽的 bug。

| 类型 | 可变？ | 代表 |
|------|--------|------|
| int / float / bool | 不可变 | 数字 |
| str / bytes | 不可变 | 字符串 |
| tuple / frozenset | 不可变 | 元组 |
| list / dict / set | 可变 | 容器 |

\`\`\`text
  不可变对象（int）：
    a = 1
    a = a + 1   → 不是修改 1，而是创建新对象 2，a 重新绑定
    (对象 1 永远是 1，不能被改成 2)

  可变对象（list）：
    lst = [1, 2]
    lst.append(3)  → 在原对象上修改，不创建新对象
    (同一个 list 对象，内容变了)
\`\`\`

### 用 id 验证差异

\`\`\`python
# 不可变对象：修改后 id 变化
a = 10
print(id(a))   # 地址 X
a = a + 1
print(id(a))   # 地址 Y（变了！创建了新对象）

# 可变对象：修改后 id 不变
lst = [1, 2]
print(id(lst)) # 地址 X
lst.append(3)
print(id(lst)) # 地址 X（不变！同一个对象）
\`\`\`

## 四、is 与 == 的区别

| 运算符 | 比较什么 | 示例 |
|--------|----------|------|
| \`is\` | 身份（id 是否相同） | \`a is b\` → id(a) == id(b) |
| \`==\` | 值（内容是否相等） | \`a == b\` → a 的值等于 b 的值 |

\`\`\`text
  a = [1, 2]
  b = [1, 2]
  a == b   → True（内容一样）
  a is b   → False（两个不同的 list 对象）
\`\`\`

## 五、为什么"一切皆对象"很重要

1. **统一的行为**：所有对象都有 id、type，都可以用 \`is\` 比较，都能被引用。
2. **可以传递**：函数、类都可以作为参数传给其他函数（这是装饰器、回调的基础）。
3. **可以反射**：用 \`type()\`、\`id()\`、\`dir()\` 可以在运行时探查任何对象的属性。
4. **动态特性**：类也是对象，所以可以在运行时创建类（\`type(name, bases, dict)\`）。

## 六、常见误解

### 误解 1：\`a += 1\` 修改了 a 的值

**事实**：int 是不可变对象，\`a += 1\` 是创建了一个新的 int 对象，然后把 \`a\` 重新绑定到新对象。原来的 1 没有被修改。

### 误解 2：\`a = b\` 复制了对象

**事实**：\`a = b\` 只是让 \`a\` 和 \`b\` 绑定到**同一个对象**（id 相同）。要复制对象需要用 \`copy\` 模块或切片等手段。

### 误解 3：元组完全不可变

**事实**：元组本身不可变（不能增删元素），但如果元素是可变对象（如列表），元素内部仍可修改。\`t = ([1,2],)\` 中 \`t[0].append(3)\` 是合法的。

下面这段代码演示 type()、id() 以及可变/不可变对象的差异。`,
    code: `# ============================================================
# 第七章代码演示：一切皆对象
# ============================================================
# 演示：
#   1. 用 type() 查看各种对象的类型
#   2. 用 id() 查看对象的身份
#   3. 对象三要素：id、type、value
#   4. 可变对象 vs 不可变对象的差异
#   5. 赋值是绑定，不是复制

# ========== 1. type() 查看对象类型 ==========
print("========== 1. type() 查看对象类型 ==========")
# Python 中一切皆对象，type() 可以返回任意对象的类型
n = 42
s = "hello"
lst = [1, 2, 3]
print(f"数字 42 的类型: {type(n)}")        # <class 'int'>
print(f"字符串的类型: {type(s)}")           # <class 'str'>
print(f"列表的类型: {type(lst)}")           # <class 'list'>

# 函数也是对象
def my_func():
    pass
print(f"函数的类型: {type(my_func)}")       # <class 'function'>

# 类本身也是对象（type 的实例）
print(f"int 的类型: {type(int)}")           # <class 'type'>
print(f"str 的类型: {type(str)}")           # <class 'type'>
print(f"type 的类型: {type(type)}")         # <class 'type'>（type 是自己的类型）

# 模块也是对象
import math
print(f"模块的类型: {type(math)}")          # <class 'module'>

# ========== 2. id() 查看对象身份 ==========
print("\\n========== 2. id() 查看对象身份 ==========")
# id() 返回对象的唯一身份（CPython 中是内存地址）
a = 100
b = 100
print(f"a 的 id: {id(a)}")
print(f"b 的 id: {id(b)}")
print(f"a is b: {a is b}")  # True —— 小整数缓存，同一对象

# 不同对象 id 不同
c = object()  # 创建一个全新对象
d = object()
print(f"新对象 c 的 id: {id(c)}")
print(f"新对象 d 的 id: {id(d)}")
print(f"c is d: {c is d}")  # False —— 两个不同对象

# ========== 3. 对象三要素 ==========
print("\\n========== 3. 对象三要素 ==========")
obj = [1, 2, 3]
print(f"对象: {obj}")
print(f"  id    = {id(obj)}")     # 身份
print(f"  type  = {type(obj)}")   # 类型
print(f"  value = {obj}")         # 值

# ========== 4. 不可变对象：修改后 id 变化 ==========
print("\\n========== 4. 不可变对象（int / str）==========")
x = 10
print(f"x = 10, id = {id(x)}")
x = x + 1  # int 不可变，这里创建了新对象 11，x 重新绑定
print(f"x = x + 1, id = {id(x)}  ← id 变了，说明是新对象")

# 字符串也是不可变对象
s1 = "hello"
print(f"\\ns1 = 'hello', id = {id(s1)}")
s2 = s1 + " world"  # 拼接创建新字符串，不修改原字符串
print(f"s2 = s1 + ' world', id(s2) = {id(s2)}  ← 新对象")
print(f"原 s1 仍然是: {s1!r}")  # s1 没变

# ========== 5. 可变对象：修改后 id 不变 ==========
print("\\n========== 5. 可变对象（list）==========")
lst = [1, 2, 3]
print(f"lst = {lst}, id = {id(lst)}")
lst.append(4)  # 原地修改，不创建新对象
print(f"lst.append(4) 后, id = {id(lst)}  ← id 不变，同一对象")
print(f"lst 现在是: {lst}")

lst[0] = 99  # 修改元素，对象身份不变
print(f"lst[0] = 99 后, id = {id(lst)}  ← id 还是不变")
print(f"lst 现在是: {lst}")

# ========== 6. 赋值是绑定，不是复制 ==========
print("\\n========== 6. 赋值是绑定 ==========")
p = [1, 2, 3]
q = p  # q 和 p 绑定到同一个 list 对象
print(f"p = {p}, id(p) = {id(p)}")
print(f"q = p, id(q) = {id(q)}")
print(f"p is q: {p is q}")  # True —— 同一对象
q.append(4)
print(f"q.append(4) 后, p = {p}  ← p 也变了！因为是同一个对象")

# ========== 7. is vs == ==========
print("\\n========== 7. is vs == ==========")
m = [1, 2]
nn = [1, 2]
print(f"m = {m}, nn = {nn}")
print(f"m == nn: {m == nn}")  # True —— 值相等
print(f"m is nn: {m is nn}")  # False —— 不是同一对象

# ========== 总结 ==========
print("\\n========== 总结 ==========")
print("Python 一切皆对象，每个对象有三要素：id、type、value")
print("  id()   → 对象身份（内存地址）")
print("  type() → 对象类型")
print("不可变对象（int/str/tuple）修改 = 创建新对象，id 变化")
print("可变对象（list/dict/set）修改 = 原地修改，id 不变")
print("赋值 a = b 是绑定，不是复制，两者指向同一对象")
print("is 比较身份，== 比较值")
`,
  },

  // =========================================================
  // 第八章：PyObject 结构
  // =========================================================
  {
    id: "pyint-pyobject",
    group: "对象模型与内存",
    icon: "🧱",
    title: "PyObject 结构：对象的内部表示",
    content: `## 一、PyObject 是什么

在 CPython（用 C 实现的 Python）中，**所有 Python 对象在底层都是一个 C 结构体**。这个结构体的最基础部分叫 \`PyObject\`，它是所有对象的"根基"。

\`\`\`text
  Python 层：    42   "hi"   [1,2]   def f()
                    │      │      │       │
                    ▼      ▼      ▼       ▼
  C 层：      都是 PyObject 结构体的扩展
\`\`\`

不管是整数、字符串还是函数，在 C 层都以 \`PyObject\` 为头部，再加上各自特有的字段。

## 二、PyObject 的 C 结构

CPython 中 \`PyObject\` 的定义大致如下（简化版）：

\`\`\`c
// 在 CPython 源码 Include/object.h 中
typedef struct _object {
    Py_ssize_t ob_refcnt;    // 引用计数
    PyTypeObject *ob_type;   // 类型指针
} PyObject;
\`\`\`

| 字段 | 含义 | 作用 |
|------|------|------|
| \`ob_refcnt\` | 引用计数 | 记录有多少引用指向该对象，用于内存管理 |
| \`ob_type\` | 类型指针 | 指向该对象的类型对象（决定它是什么） |

\`\`\`text
  一个 int 对象在内存中的样子（简化）：

  ┌─────────────────────┐
  │ ob_refcnt = 1       │ ← 引用计数
  ├─────────────────────┤
  │ ob_type  → int 类型  │ ← 类型指针
  ├─────────────────────┤
  │ ob_size  = 1        │ ← int 特有：数字位数
  ├─────────────────────┤
  │ ob_digit[0] = 42    │ ← int 特有：实际数值
  └─────────────────────┘
\`\`\`

每个对象都**以 PyObject 头部开始**，后面跟着各自类型特有的字段。这样 CPython 可以用统一的 \`PyObject *\` 指针操作所有对象。

## 三、引用计数 ob_refcnt

\`ob_refcnt\` 记录"有多少个引用指向这个对象"。当引用计数降为 0 时，对象会被立即回收。

\`\`\`text
  a = [1, 2, 3]      → list 对象的 ob_refcnt = 1
  b = a              → ob_refcnt = 2（a 和 b 都引用它）
  del a              → ob_refcnt = 1
  del b              → ob_refcnt = 0 → 立即回收！
\`\`\`

可以用 \`sys.getrefcount(obj)\` 查看一个对象的引用计数（注意：传参会临时多一个引用，所以结果至少是 2）。

## 四、类型指针 ob_type

\`ob_type\` 指向该对象的"类型对象"。类型对象本身也是一个 \`PyObject\`，记录了这种类型的所有信息：名字、支持的操作、占多少字节等。

\`\`\`text
  对象 42
    ob_type ──→ PyLong_Type（int 类型对象）
                  tp_name = "int"
                  tp_repr = ...（如何显示）
                  nb_add = ...（如何做加法）
\`\`\`

| 操作 | Python 层 | 实际查询的字段 |
|------|-----------|----------------|
| \`type(42)\` | 返回 int | 读取 \`ob_type\` |
| \`42 + 1\` | 加法 | 查 \`ob_type->tp_as_number->nb_add\` |
| \`len([1,2])\` | 求长度 | 查 \`ob_type->tp_as_sequence->sq_length\` |

## 五、为什么小整数会被缓存（-5 到 256）

整数是 Python 中使用最频繁的对象（循环计数、索引、比较……）。如果每次用到 \`1\` 都创建新对象，会非常浪费内存和 CPU。

所以 CPython 在启动时就**预先创建了 -5 到 256 这些小整数对象**，并缓存起来。所有用到这些数字的地方都共享同一个对象。

\`\`\`text
  启动时：
    创建 int 对象 -5, -4, ..., 0, 1, ..., 256
    存入 small_ints 数组

  运行 a = 100 时：
    不创建新对象，直接返回 small_ints[100 - (-5)] 的指针
    → 所以 a = 100; b = 100; a is b → True
\`\`\`

| 数字范围 | 是否缓存 | \`a = n; b = n; a is b\` |
|----------|----------|-------------------------|
| -5 到 256 | 缓存 | True（同一对象） |
| 超出范围 | 不缓存 | 通常 False（各自新建） |

### 为什么是 -5 到 256？

- 负数到 -5：覆盖常见的负数索引、哨兵值
- 0 到 256：覆盖字节值（0-255）、常见循环计数、字母 ASCII 码
- 这个范围是经验值，兼顾内存占用和命中率

## 六、定长对象 vs 变长对象

\`\`\`text
  定长对象（PyObject）：
    int（小整数）、float、bool、None
    → 大小固定，PyObject 头 + 固定字段

  变长对象（PyVarObject）：
    str、list、tuple、dict、bytes
    → 大小可变，PyVarObject 多一个 ob_size 字段
\`\`\`

\`\`\`c
typedef struct {
    PyObject ob_base;      // 继承 PyObject
    Py_ssize_t ob_size;    // 元素个数
} PyVarObject;
\`\`\`

\`len()\` 函数实际上就是读取 \`ob_size\` 字段，所以 \`len()\` 是 O(1) 的。

## 七、对日常开发的理解

1. **理解对象开销**：每个 int 至少占 28 字节（PyObject 头 + 数值），所以 Python 比 C 占更多内存。
2. **理解小整数缓存**：用 \`is\` 比较两个小整数总是 True，但这只是缓存副作用，比较值还是应该用 \`==\`。
3. **理解 \`sys.getrefcount()\`**：调试内存泄漏时可以查看对象引用数。
4. **理解 \`type()\` 的本质**：它就是读取 \`ob_type\` 指针。

下面这段代码演示引用计数和小整数缓存。`,
    code: `# ============================================================
# 第八章代码演示：PyObject 结构与引用计数
# ============================================================
# 演示：
#   1. sys.getrefcount() 查看引用计数
#   2. 引用增加/减少时计数的变化
#   3. 小整数缓存（-5 到 256）
#   4. 类型的类型（ob_type 指针）

import sys

# ========== 1. sys.getrefcount() 查看引用计数 ==========
print("========== 1. sys.getrefcount() 查看引用计数 ==========")
# 创建一个全新对象（用 object() 避开小整数缓存等干扰）
obj = object()
# getrefcount 返回引用计数
# 注意：传参时函数会临时持有一个引用，所以结果至少是 2
#       (obj 这个变量 + getrefcount 的参数)
print(f"刚创建的 obj 的引用计数: {sys.getrefcount(obj)}")  # 2

# 增加一个引用
ref1 = obj
print(f"ref1 = obj 后, 引用计数: {sys.getrefcount(obj)}")  # 3

# 再增加一个引用
ref2 = obj
print(f"ref2 = obj 后, 引用计数: {sys.getrefcount(obj)}")  # 4

# 删除引用
del ref1
print(f"del ref1 后, 引用计数: {sys.getrefcount(obj)}")    # 3

del ref2
print(f"del ref2 后, 引用计数: {sys.getrefcount(obj)}")    # 2

# ========== 2. 容器引用也会增加计数 ==========
print("\\n========== 2. 容器引用也增加计数 ==========")
o = object()
print(f"创建后: {sys.getrefcount(o)}")           # 2
lst = [o]                                        # 列表持有 o 的引用
print(f"放入列表后: {sys.getrefcount(o)}")       # 3
lst.append(o)                                    # 再放一次
print(f"再放一次后: {sys.getrefcount(o)}")       # 4
del lst                                          # 删除列表
print(f"删除列表后: {sys.getrefcount(o)}")       # 2

# ========== 3. 小整数缓存（-5 到 256）==========
print("\\n========== 3. 小整数缓存（-5 到 256）==========")
# CPython 启动时预先创建 -5 到 256 的整数对象
# 所有用到这些数字的地方共享同一对象
print("缓存范围内的整数（is 应为 True）：")
for n in [-5, 0, 1, 100, 256]:
    a = n
    b = n
    print(f"  {n}: (a is b) = {a is b}")  # True —— 同一对象

# 超出范围：用 int() 在运行时构造，避免编译期常量折叠
print("超出缓存范围（运行时构造，is 应为 False）：")
a = 257
b = int("257")  # 运行时新建对象
print(f"  a = 257, b = int('257'): (a is b) = {a is b}")  # False
a = 1000
b = int("1000")
print(f"  a = 1000, b = int('1000'): (a is b) = {a is b}")  # False

# ========== 4. 类型的类型（ob_type 指针）==========
print("\\n========== 4. 类型的类型（ob_type 指针）==========")
# type() 实际上是读取对象的 ob_type 字段
print(f"type(42)        = {type(42)}")          # <class 'int'>
print(f"type('hello')   = {type('hello')}")     # <class 'str'>
print(f"type([1,2])     = {type([1, 2])}")      # <class 'list'>
print(f"type(None)      = {type(None)}")        # <class 'NoneType'>

# 类型对象本身也是对象，它的类型是 type
print(f"\\ntype(int)  = {type(int)}")            # <class 'type'>
print(f"type(str)  = {type(str)}")              # <class 'type'>
print(f"type(type) = {type(type)}")             # <class 'type'>（type 的类型是自己）

# 类型对象的属性（来自 ob_type 指向的类型对象）
print(f"\\nint 的名字: {int.__name__}")          # 'int'
print(f"int 的基类: {int.__bases__}")           # (<class 'object'>,)

# ========== 5. len() 读取的是 ob_size ==========
print("\\n========== 5. len() 读取 ob_size ==========")
# 变长对象（str/list/tuple/dict）有 ob_size 字段
# len() 直接读这个字段，所以是 O(1) 操作
data = [1, 2, 3, 4, 5]
print(f"列表 {data} 的长度: {len(data)}")       # 5 —— 直接读 ob_size
text = "hello"
print(f"字符串 {text!r} 的长度: {len(text)}")    # 5
big_list = list(range(1000000))
print(f"百万元素列表的 len() 仍然 O(1): {len(big_list)}")

# ========== 总结 ==========
print("\\n========== 总结 ==========")
print("CPython 中所有对象底层都是 PyObject 结构体")
print("  ob_refcnt → 引用计数（用 sys.getrefcount 查看）")
print("  ob_type   → 类型指针（用 type() 查看）")
print("小整数 -5 到 256 被缓存，所有引用共享同一对象")
print("变长对象额外有 ob_size 字段，len() 直接读取它")
print("每个 int 对象至少占 28 字节，比 C 的 int 大得多")
`,
  },

  // =========================================================
  // 第九章：引用计数
  // =========================================================
  {
    id: "pyint-refcount",
    group: "对象模型与内存",
    icon: "🔢",
    title: "引用计数：内存管理的核心",
    content: `## 一、引用计数工作原理

CPython 主要靠**引用计数（Reference Counting）**来管理内存。每个对象内部都有一个计数器（\`ob_refcnt\`），记录"有多少个引用指向我"。当计数降为 0 时，对象会被**立即回收**。

\`\`\`text
  a = [1, 2, 3]      →  对象 ob_refcnt = 1
  b = a              →  ob_refcnt = 2
  c = a              →  ob_refcnt = 3
  del a              →  ob_refcnt = 2
  del b              →  ob_refcnt = 1
  del c              →  ob_refcnt = 0 → 立即释放内存！
\`\`\`

引用计数的特点：

| 特点 | 说明 |
|------|------|
| 即时回收 | 计数为 0 时立刻释放，不等周期 |
| 简单高效 | 增减引用时只需更新计数器 |
| 无法处理循环引用 | 需要分代垃圾收集器辅助 |

## 二、引用增加 / 减少的场景

### 引用增加（+1）

| 场景 | 示例 |
|------|------|
| 赋值 | \`a = obj\` |
| 加入容器 | \`lst.append(obj)\` |
| 传参 | \`func(obj)\`（函数内引用） |
| 返回值 | \`return obj\` |

### 引用减少（-1）

| 场景 | 示例 |
|------|------|
| 离开作用域 | 函数返回，局部变量销毁 |
| del 语句 | \`del a\` |
| 容器销毁 | \`del lst\`（容器内元素引用消失） |
| 重新赋值 | \`a = None\`（原来对象的引用 -1） |

\`\`\`text
  def f(x):          # x 引用对象，ob_refcnt +1
      return x       # 返回值又引用一次
  a = [1, 2]
  b = f(a)           # f 内部 ob_refcnt 一度 = 2，返回后 = 1
\`\`\`

## 三、del 语句的作用

\`del\` **不是删除对象**，而是**解除名字与对象的绑定**，让引用计数 -1。只有当计数降为 0 时对象才会被回收。

\`\`\`text
  a = [1, 2]
  b = a           # a 和 b 都引用同一个 list
  del a           # 解除 a 的绑定，list 的 ob_refcnt = 1
  print(b)        # [1, 2] —— 对象还在！b 还引用着
  del b           # ob_refcnt = 0 → 对象被回收
\`\`\`

| 操作 | 作用 |
|------|------|
| \`del a\` | 删除名字 \`a\`（从命名空间移除） |
| \`del a[0]\` | 删除列表元素（调用 \`__delitem__\`） |
| \`del a.attr\` | 删除属性（调用 \`__delattr__\`） |

## 四、循环引用问题

引用计数有一个致命弱点：**无法处理循环引用**。两个对象互相引用时，即使外部没有任何引用，它们的计数都不会降为 0。

\`\`\`text
  n1 = Node()
  n2 = Node()
  n1.partner = n2   # n1 引用 n2
  n2.partner = n1   # n2 引用 n1
  del n1            # n1 对象的 ob_refcnt 仍 = 1（被 n2.partner 引用）
  del n2            # n2 对象的 ob_refcnt 仍 = 1（被 n1.partner 引用）

  → 两个对象形成孤岛，引用计数都是 1，永远无法回收！
\`\`\`

\`\`\`text
       ┌─────────┐         ┌─────────┐
       │   n1    │ ◀────── │   n2    │
       │         │ ──────▶ │         │
       └─────────┘  互引用  └─────────┘
            ▲                    ▲
            │                    │
         (无外部引用，但 ob_refcnt 都是 1)
\`\`\`

## 五、gc 模块：处理循环引用

为了解决循环引用，CPython 引入了**分代垃圾收集器（Generational GC）**，由 \`gc\` 模块控制。它会定期扫描对象图，找出"只被彼此引用"的对象组并回收。

\`\`\`text
  引用计数（即时）   +   分代 GC（周期性）
       │                      │
       ▼                      ▼
  大部分对象立即回收    少量循环引用对象被周期清理
\`\`\`

### 分代 GC 的三代

| 代 | 存放对象 | 回收频率 |
|----|----------|----------|
| 第 0 代 | 新创建的对象 | 最频繁 |
| 第 1 代 | 经历过 0 代回收仍存活 | 较少 |
| 第 2 代 | 经历过 1 代回收仍存活 | 最少 |

### gc 模块常用函数

| 函数 | 作用 |
|------|------|
| \`gc.collect()\` | 手动触发完整回收，返回回收的对象数 |
| \`gc.get_objects()\` | 获取 GC 跟踪的所有对象 |
| \`gc.disable()\` | 关闭分代 GC（引用计数仍工作） |
| \`gc.enable()\` | 开启分代 GC |

## 六、weakref 弱引用

\`weakref\` 提供一种**不增加引用计数**的引用方式。弱引用让访问对象成为可能，但不会阻止对象被回收。

\`\`\`python
import weakref
class Obj: pass
o = Obj()
r = weakref.ref(o)   # 创建弱引用，ob_refcnt 不变
print(r())           # <Obj object>（通过 r() 取到对象）
del o                # 对象被回收（弱引用不阻止）
print(r())           # None（对象已消失）
\`\`\`

| 引用类型 | 增加引用计数 | 阻止回收 |
|----------|--------------|----------|
| 强引用（普通赋值） | 是 | 是 |
| 弱引用（weakref） | 否 | 否 |

弱引用常用于**缓存**：缓存用弱引用持有对象，对象没人用时自动消失，不会内存泄漏。

## 七、对日常开发的帮助

1. **避免循环引用**：自定义类如果有互引用，尽量用 \`weakref\`。
2. **\`__del__\` 谨慎使用**：定义了 \`__del__\` 的对象进入循环引用时，旧版本 Python 不会回收（3.4+ 已修复，PEP 442）。
3. **大对象及时解除引用**：\`del\` 大列表/大字典可以让内存立即释放，不必等函数结束。
4. **调试内存泄漏**：用 \`gc.get_objects()\` 配合 \`sys.getrefcount()\` 排查。

下面这段代码演示引用计数变化、weakref 和 gc 回收循环引用。`,
    code: `# ============================================================
# 第九章代码演示：引用计数、weakref 与 gc
# ============================================================
# 演示：
#   1. sys.getrefcount() 观察引用计数变化
#   2. del 的作用（解除绑定，不是删除对象）
#   3. weakref 弱引用不增加引用计数
#   4. 循环引用问题与 gc.collect() 的回收

import sys
import gc
import weakref

# ========== 1. 引用计数的变化 ==========
print("========== 1. 引用计数的变化 ==========")
obj = object()  # 用 object() 避开缓存干扰
print(f"刚创建 obj: refcnt = {sys.getrefcount(obj)}")  # 2 (obj + 参数)

a = obj                                                   # 增加引用
print(f"a = obj 后: refcnt = {sys.getrefcount(obj)}")    # 3
b = obj                                                   # 再增加
print(f"b = obj 后: refcnt = {sys.getrefcount(obj)}")    # 4
del a                                                     # 减少引用
print(f"del a 后: refcnt = {sys.getrefcount(obj)}")      # 3
del b                                                     # 再减少
print(f"del b 后: refcnt = {sys.getrefcount(obj)}")      # 2

# ========== 2. del 是解除绑定，不是删除对象 ==========
print("\\n========== 2. del 是解除绑定 ==========")
x = [1, 2, 3]
y = x                  # x 和 y 都绑定到同一个 list
print(f"x = {x}, y = {y}")
print(f"x is y: {x is y}")
del x                  # 只解除 x 的绑定，对象还在（y 仍引用）
print("del x 后...")
print(f"y 仍然存在: {y}")   # [1, 2, 3] —— 对象没被删除
print(f"'x' 在 globals 中: {'x' in globals()}")  # False

# ========== 3. weakref 弱引用不增加引用计数 ==========
print("\\n========== 3. weakref 弱引用 ==========")
class Resource:
    pass

r_obj = Resource()
print(f"创建后: refcnt = {sys.getrefcount(r_obj)}")   # 2
# 创建弱引用（不增加引用计数）
weak = weakref.ref(r_obj)
print(f"创建 weakref 后: refcnt = {sys.getrefcount(r_obj)}")  # 仍是 2
print(f"weak() 取到对象: {weak()}")                    # <Resource 对象>
print(f"weak() is r_obj: {weak() is r_obj}")          # True

# 删除强引用后，对象被回收，弱引用返回 None
del r_obj
print("del r_obj 后...")
print(f"weak() 现在返回: {weak()}")                   # None —— 对象已回收

# ========== 4. 循环引用问题 ==========
print("\\n========== 4. 循环引用问题 ==========")
# 先关掉 GC，让循环引用无法被自动清理
gc.disable()

class Node:
    pass

# 创建两个互相引用的节点
n1 = Node()
n2 = Node()
n1.partner = n2   # n1 引用 n2
n2.partner = n1   # n2 引用 n1
print(f"n1 的引用计数: {sys.getrefcount(n1)}")   # 3 (n1 + n2.partner + 参数)
print(f"n2 的引用计数: {sys.getrefcount(n2)}")   # 3

# 记录对象数量
before_count = len(gc.get_objects())

# 删除外部引用，只留互相引用
node_ids = {id(n1), id(n2)}
del n1
del n2

# 引用计数仍为 1（互相引用），不会自动回收
# 但 gc 可以检测到这种"孤岛"并回收
gc.enable()                       # 重新开启 GC
collected = gc.collect()          # 手动触发完整回收
print(f"gc.collect() 回收的对象数: {collected}")
after_count = len(gc.get_objects())
print(f"GC 跟踪对象数变化: {before_count} → {after_count}")
print("→ 引用计数无法处理循环引用，需要 gc 介入")

# ========== 5. 观察 gc 的工作 ==========
print("\\n========== 5. gc 的分代信息 ==========")
print(f"GC 当前阈值: {gc.get_threshold()}")   # (700, 10, 10)
print(f"GC 当前计数: {gc.get_count()}")
print(f"GC 是否开启: {gc.isenabled()}")

# ========== 总结 ==========
print("\\n========== 总结 ==========")
print("CPython 内存管理 = 引用计数 + 分代 GC")
print("  引用计数：ob_refcnt，为 0 时立即回收（即时）")
print("  分代 GC：处理循环引用（周期性）")
print("del 是解除名字绑定，引用计数 -1，不一定是删除对象")
print("weakref 弱引用不增加引用计数，适合做缓存")
print("循环引用需 gc.collect() 介入才能回收")
`,
  },

  // =========================================================
  // 第十章：缓存机制
  // =========================================================
  {
    id: "pyint-cache",
    group: "对象模型与内存",
    icon: "💾",
    title: "缓存机制：小整数与字符串驻留",
    content: `## 一、为什么要缓存

Python 中"一切皆对象"，每个整数、字符串都是堆上的对象。如果每次写 \`1\` 都新建一个对象，会非常浪费内存和 CPU。所以 CPython 对**常用对象做了缓存**，让多处引用共享同一个对象。

\`\`\`text
  没有缓存：a = 1, b = 1, c = 1  → 三个不同的 int 对象（浪费）
  有缓存：  a = 1, b = 1, c = 1  → 都指向同一个缓存对象（省内存）
\`\`\`

主要有两类缓存：

| 缓存类型 | 对象 | 范围 |
|----------|------|------|
| 小整数缓存 | int | -5 到 256 |
| 字符串驻留 | str | 符合标识符规则的字符串等 |

## 二、小整数缓存（-5 到 256）

CPython 启动时就预先创建 -5 到 256 共 262 个整数对象，存放在 \`small_ints\` 数组中。所有用到这些数字的地方都返回同一个对象的指针。

\`\`\`text
  启动时：
    small_ints[0]  = int 对象 -5
    small_ints[5]  = int 对象 0
    small_ints[6]  = int 对象 1
    ...
    small_ints[261] = int 对象 256

  运行 a = 100：
    直接返回 small_ints[105]，不新建对象
\`\`\`

| 数字 | 是否缓存 | \`a = n; b = n; a is b\` |
|------|----------|-------------------------|
| -5 | 是 | True |
| 0 | 是 | True |
| 100 | 是 | True |
| 256 | 是 | True |
| 257 | 否 | 通常 False |
| 1234 | 否 | 通常 False |

### 验证

\`\`\`python
a = 100
b = 100
print(a is b)   # True —— 同一个缓存对象

# 超出范围，运行时构造确保是新对象
a = 257
b = int("257")
print(a is b)   # False —— 两个不同对象
\`\`\`

### 为什么是 -5 到 256

- 负数到 -5：覆盖常见哨兵值、负数运算结果
- 0 到 256：覆盖字节值（0-255）、ASCII 字母、常见循环计数
- 这是经验值，兼顾内存和命中率

## 三、字符串驻留（Interning）

字符串驻留是另一种缓存：**内容相同的字符串共享同一个对象**。但并不是所有字符串都会驻留，CPython 有一套规则。

### 自动驻留的字符串

| 条件 | 示例 | 是否驻留 |
|------|------|----------|
| 符合标识符规则（字母/数字/下划线） | \`"python"\`、\`"my_var"\` | 是 |
| 包含空格或特殊字符 | \`"hello world"\` | 不一定 |
| 运行时拼接产生 | \`"".join(["a","b"])\` | 否 |
| 文件读取的字符串 | \`f.read()\` | 否 |

\`\`\`text
  字面量 "python" → 编译期确定，符合标识符规则 → 驻留
  字面量 "hello world" → 含空格，规则因版本而异
  "".join([...]) → 运行时构造，不驻留
\`\`\`

### 手动驻留：sys.intern()

可以用 \`sys.intern()\` 强制驻留一个字符串：

\`\`\`python
import sys
s1 = sys.intern("".join(["py", "thon"]))
s2 = "python"
print(s1 is s2)   # True —— 手动驻留后共享同一对象
\`\`\`

### 为什么驻留有用

1. **节省内存**：相同字符串只存一份。
2. **加速比较**：驻留后可以用 \`is\`（指针比较）代替 \`==\`（逐字符比较），O(1) vs O(n)。

\`\`\`text
  普通字符串比较（==）：逐字符比较，O(n)
  驻留字符串比较（is）：比较指针，O(1)
  → 字典的键会自动驻留，所以查找很快
\`\`\`

## 四、id 相同的原因

当两个变量 \`is\` 比较为 True，说明它们 id 相同——指向**同一个对象**。这通常是因为：

| 原因 | 示例 |
|------|------|
| 小整数缓存 | \`a = 100; b = 100\` |
| 字符串驻留 | \`a = "hi"; b = "hi"\`（符合标识符规则） |
| 显式赋值 | \`b = a\` |
| 单例对象 | \`a = None; b = None\`、\`True\`、\`False\` |

\`\`\`text
  None、True、False 都是单例 → 所有引用共享同一对象
  a = None; b = None; a is b → True
\`\`\`

## 五、is vs == 的区别

| 运算符 | 比较什么 | 速度 | 适用场景 |
|--------|----------|------|----------|
| \`is\` | 身份（id 是否相同） | O(1) | 判断是否同一对象、与 None 比较 |
| \`==\` | 值（内容是否相等） | O(n) | 比较内容是否相等 |

\`\`\`python
a = 257
b = int("257")
print(a == b)   # True  —— 值相等
print(a is b)   # False —— 不是同一对象

a = "python"
b = "python"
print(a == b)   # True
print(a is b)   # True  —— 驻留了，是同一对象
\`\`\`

### PEP 8 建议

- 与 \`None\` 比较用 \`is\`：\`if x is None\`
- 比较值用 \`==\`：\`if x == 5\`
- 不要依赖小整数缓存用 \`is\` 比较数字（虽然可行但不规范）

## 六、常见陷阱

### 陷阱 1：在 REPL 和脚本中行为不同

\`\`\`text
  脚本中：a = 257; b = 257; a is b
    → 编译器可能把两个 257 折叠成同一常量 → True

  REPL 中：>>> a = 257
           >>> b = 257
           >>> a is b
    → 每行单独编译，不折叠 → False
\`\`\`

所以用 \`is\` 比较大整数不可靠，行为受执行环境影响。

### 陷阱 2：字符串驻留规则不固定

不同 Python 版本对字符串驻留的规则略有差异，不要依赖"某字符串一定驻留"。需要保证时用 \`sys.intern()\`。

### 陷阱 3：可变对象不会被缓存

\`\`\`text
  a = [1, 2]
  b = [1, 2]
  a is b   → False（list 不缓存，每次新建）
\`\`\`

## 七、对日常开发的帮助

1. **比较用 \`==\`，判断 None 用 \`is\`**：这是规范，避免依赖缓存副作用。
2. **大量重复字符串可用 \`sys.intern()\`**：节省内存、加速比较。
3. **理解 id 相同的原因**：调试时不要被"两个变量是同一对象"迷惑。
4. **理解字典快的原因**：字典的键被驻留，可以用 \`is\` 加速查找。

下面这段代码演示小整数缓存、字符串驻留和 is vs == 的差异。`,
    code: `# ============================================================
# 第十章代码演示：小整数缓存与字符串驻留
# ============================================================
# 演示：
#   1. 小整数缓存（-5 到 256）
#   2. 字符串驻留（自动 + 手动 sys.intern）
#   3. is vs == 的区别
#   4. 单例对象（None / True / False）

import sys

# ========== 1. 小整数缓存 ==========
print("========== 1. 小整数缓存（-5 到 256）==========")
# CPython 启动时预先创建 -5 到 256 的整数对象
print("缓存范围内的整数（is 应为 True）：")
for n in [-5, -1, 0, 1, 42, 100, 255, 256]:
    a = n
    b = n
    print(f"  {n}: (a is b) = {a is b}")  # True

# 超出范围：用 int() 在运行时构造，避免编译期常量折叠
print("超出缓存范围（运行时构造，is 应为 False）：")
a = 257
b = int("257")
print(f"  a = 257, b = int('257'): (a is b) = {a is b}")    # False
a = 1000
b = int("1000")
print(f"  a = 1000, b = int('1000'): (a is b) = {a is b}")  # False

# ========== 2. 字符串驻留（自动）==========
print("\\n========== 2. 字符串驻留（自动）==========")
# 符合标识符规则的字符串字面量会被自动驻留
s1 = "python"
s2 = "python"
print(f"字面量 'python' is 'python': {s1 is s2}")  # True

# 运行时构造的字符串不会自动驻留
s_runtime = "".join(["py", "thon"])
print(f"运行时拼接 is 字面量: {s1 is s_runtime}")  # False

# 含空格的字符串行为不一定（不依赖）
s_sp1 = "hello world"
s_sp2 = "hello world"
print(f"含空格 'hello world' is: {s_sp1 is s_sp2}")  # 因环境而异

# ========== 3. 手动驻留 sys.intern() ==========
print("\\n========== 3. 手动驻留 sys.intern() ==========")
# sys.intern() 强制让字符串共享同一对象
joined = "".join(["py", "thon"])         # 运行时构造，未驻留
interned = sys.intern(joined)            # 手动驻留
print(f"驻留前: joined is 'python' 字面量 = {joined is s1}")   # False
print(f"驻留后: interned is 'python' 字面量 = {interned is s1}")  # True

# 驻留的好处：可以用 is 快速比较
big1 = sys.intern("a" * 1 + "b" * 1)  # 仅演示
big2 = sys.intern("ab")
print(f"两个驻留字符串 is 比较: {big1 is big2}")  # True

# ========== 4. is vs == ==========
print("\\n========== 4. is vs == ==========")
a = 257
b = int("257")
print(f"a = 257, b = int('257')")
print(f"  a == b: {a == b}")   # True  —— 值相等
print(f"  a is b: {a is b}")   # False —— 不是同一对象

# 列表永不缓存
m = [1, 2, 3]
nn = [1, 2, 3]
print(f"\\n两个列表 [1,2,3]")
print(f"  m == nn: {m == nn}")  # True  —— 内容相同
print(f"  m is nn: {m is nn}")  # False —— 不同对象

# ========== 5. 单例对象 ==========
print("\\n========== 5. 单例对象（None / True / False）==========")
# None、True、False 全局唯一，所有引用都是同一对象
print(f"None is None: {None is None}")     # True
print(f"True is True: {True is True}")     # True
print(f"False is False: {False is False}") # True
# 多个 None 引用都是同一对象
nv1 = None
nv2 = None
print(f"nv1 = None; nv2 = None; nv1 is nv2: {nv1 is nv2}")  # True

# 比较 None 应该用 is，不用 ==
x = None
print(f"\\n判断 x 是否为 None:")
print(f"  x is None: {x is None}")     # True（推荐写法）
print(f"  x == None: {x == None}")     # True（不推荐）

# ========== 6. id 相同的原因汇总 ==========
print("\\n========== 6. id 相同的原因 ==========")
cases = [
    ("小整数缓存", 100, 100),
    ("字符串驻留", "abc", "abc"),
    ("单例 None", None, None),
    ("单例 True", True, True),
]
for desc, v1, v2 in cases:
    print(f"  {desc}: {v1!r} is {v2!r} = {v1 is v2}")

# ========== 总结 ==========
print("\\n========== 总结 ==========")
print("小整数缓存：-5 到 256 共享同一对象，is 比较为 True")
print("字符串驻留：符合标识符规则的字面量自动驻留")
print("sys.intern() 可手动驻留字符串，节省内存并加速比较")
print("is 比较身份（id），== 比较值（内容）")
print("判断 None 用 is，比较值用 ==")
print("不要依赖大整数的 is 比较，行为受执行环境影响")
`,
  },

  // =========================================================
  // 第十一章：命名空间
  // =========================================================
  {
    id: "pyint-namespace",
    group: "对象模型与内存",
    icon: "🗂️",
    title: "命名空间：名字与对象的绑定",
    content: `## 一、什么是命名空间

**命名空间（Namespace）** 是从"名字"到"对象"的映射。可以把它理解成一本**字典**：键是变量名，值是对象。

\`\`\`text
  命名空间（一个 dict）：
    ┌──────────────────────────────┐
    │ "x"     →  int 对象 100       │
    │ "name"  →  str 对象 "Alice"   │
    │ "data"  →  list 对象 [1,2,3]  │
    │ "f"     →  function 对象      │
    └──────────────────────────────┘
\`\`\`

**变量赋值的本质**，就是往命名空间这个字典里添加/更新一条记录：\`x = 100\` 等价于 \`namespace["x"] = 100\`。

## 二、三种命名空间

Python 有三种核心命名空间，对应不同的作用域：

| 命名空间 | 查看方式 | 存放内容 |
|----------|----------|----------|
| 局部命名空间 | \`locals()\` | 函数内的变量 |
| 全局命名空间 | \`globals()\` | 模块级的变量 |
| 内置命名空间 | \`dir(builtins)\` | \`len\`、\`print\` 等内置名 |

\`\`\`text
  变量查找顺序（LEGB 规则）：
    Local（局部）→ Enclosing（外层函数）→ Global（全局）→ Built-in（内置）
\`\`\`

### 1. 局部命名空间

每个函数调用都会创建一个**新的局部命名空间**，函数返回时销毁。

\`\`\`python
def f(a, b):
    c = a + b
    print(locals())   # {'a': 1, 'b': 2, 'c': 3}
f(1, 2)
\`\`\`

### 2. 全局命名空间

模块级别的变量都在全局命名空间，用 \`globals()\` 查看。

\`\`\`python
x = 100
print(globals()["x"])   # 100
\`\`\`

### 3. 内置命名空间

Python 启动时把 \`len\`、\`print\`、\`int\` 等内置名字加载到 \`builtins\` 模块。所有模块都能直接用这些名字。

\`\`\`python
import builtins
print("len" in dir(builtins))   # True
print(builtins.len([1,2,3]))    # 3
\`\`\`

## 三、赋值就是绑定

Python 的"变量"和 C 的变量不同。C 的变量是"装值的盒子"，Python 的变量是"贴在对象上的标签"。

\`\`\`text
  C 语言：            Python：
    int a = 1;          a → [对象 1]   （a 是标签）
    a = 2;              a → [对象 2]   （a 重新贴到 2，对象 1 还在/被回收）
    (盒子 a 的内容变了)  (标签 a 换地方了)
\`\`\`

所以 \`x = y\` 不是复制对象，而是**让 x 和 y 绑定到同一个对象**：

\`\`\`python
a = [1, 2, 3]
b = a           # b 和 a 是同一对象的两个标签
b.append(4)
print(a)        # [1, 2, 3, 4] —— a 也变了！
\`\`\`

\`\`\`text
  a ──┐
      ▼
    [1, 2, 3, 4]   ← 同一个 list 对象
      ▲
  b ──┘
\`\`\`

## 四、del 是解除绑定

\`del x\` 不是删除对象，而是**从命名空间中移除 "x" 这个名字**，让对象的引用计数 -1。只有当计数降为 0 时对象才被回收。

\`\`\`text
  a = [1, 2]
  b = a           # ob_refcnt = 2
  del a           # 移除名字 a，ob_refcnt = 1，对象还在
  print(b)        # [1, 2] —— b 仍可访问
\`\`\`

| 操作 | 作用 |
|------|------|
| \`del x\` | 从命名空间移除名字 x |
| \`del lst[0]\` | 调用 \`lst.__delitem__(0)\` |
| \`del obj.attr\` | 调用 \`obj.__delattr__('attr')\` |

## 五、不同作用域的命名空间

### 模块的命名空间

每个 \`.py\` 文件是一个模块，有自己的全局命名空间。模块内的顶层变量、函数、类都放在这里。

\`\`\`python
# mymod.py
X = 10
def f(): pass
# globals() = {'X': 10, 'f': <function>, ...}
\`\`\`

### 函数的命名空间

每次调用函数都创建新的局部命名空间，参数和函数内变量都在这里。函数返回时命名空间销毁（闭包除外）。

\`\`\`text
  def f(x):       # 调用 f(1) → 局部空间 {'x': 1}
      y = x + 1   # 局部空间 {'x': 1, 'y': 2}
      return y    # 返回后局部空间销毁
\`\`\`

### 类的命名空间

类定义体执行时，有一个临时命名空间，类创建完成后变成类的 \`__dict__\`。

\`\`\`python
class C:
    count = 0          # 进入 C 的命名空间
    def method(self):  # 进入 C 的命名空间
        pass
# C.__dict__ 包含 'count' 和 'method'
\`\`\`

## 六、globals() 和 locals() 的细节

\`\`\`python
x = 1
def outer():
    y = 2
    def inner():
        z = 3
        print(locals())   # {'z': 3}（只有自己的）
        print(globals()['x'])  # 1（模块级）
    inner()
\`\`\`

| 函数 | 模块级调用 | 函数内调用 |
|------|-----------|-----------|
| \`locals()\` | 等于 \`globals()\` | 当前函数的局部变量 |
| \`globals()\` | 模块的命名空间 | 模块的命名空间（不变） |
| \`vars()\` | 等于 \`globals()\` | 等于 \`locals()\` |

## 七、对日常开发的帮助

1. **理解"两个变量同步变化"**：因为它们绑定到同一个可变对象。
2. **避免可变默认参数陷阱**：\`def f(lst=[])\` 中的 \`[]\` 在函数定义时只创建一次，所有调用共享。
3. **理解作用域查找**：函数内能读全局变量，但赋值会创建局部变量（除非用 \`global\`/\`nonlocal\`）。
4. **调试命名空间**：用 \`locals()\` 和 \`globals()\` 查看变量绑定，排查命名冲突。

下面这段代码演示命名空间的查看与赋值即绑定的行为。`,
    code: `# ============================================================
# 第十一章代码演示：命名空间与名字绑定
# ============================================================
# 演示：
#   1. globals() 查看全局命名空间
#   2. locals() 查看局部命名空间
#   3. builtins 内置命名空间
#   4. 赋值是绑定（不是复制）
#   5. del 是解除绑定
#   6. 类的命名空间

# ========== 1. globals() 全局命名空间 ==========
print("========== 1. globals() 全局命名空间 ==========")
# 模块级变量都在 globals() 中
chapter_title = "命名空间"   # 定义一个全局变量
PI = 3.14159
print(f"'chapter_title' 在 globals 中: {'chapter_title' in globals()}")  # True
print(f"globals()['chapter_title'] = {globals()['chapter_title']}")
print(f"globals()['PI'] = {globals()['PI']}")

# 赋值就是往 globals 字典里加记录
new_var = 42
print(f"赋值 new_var = 42 后, 'new_var' in globals: {'new_var' in globals()}")

# ========== 2. locals() 局部命名空间 ==========
print("\\n========== 2. locals() 局部命名空间 ==========")

def compute(a, b):
    # 函数内的变量都在 locals() 中
    result = a + b
    detail = {"sum": result, "args": (a, b)}
    print(f"  compute({a}, {b}) 的 locals():")
    for k, v in locals().items():
        print(f"    {k} = {v!r}")
    return result

compute(10, 20)
# 函数返回后，局部命名空间销毁

# 模块级 locals() 等于 globals()
print(f"\\n模块级 locals() is globals(): {locals() is globals()}")  # True

# ========== 3. builtins 内置命名空间 ==========
print("\\n========== 3. builtins 内置命名空间 ==========")
import builtins
# 内置名字（len、print、int 等）都在 builtins 模块中
builtin_names = ["len", "print", "int", "str", "list", "dict", "range", "enumerate"]
for name in builtin_names:
    print(f"  '{name}' in builtins: {hasattr(builtins, name)}")

# 直接调用 == 通过 builtins 调用
print(f"\\nlen([1,2,3]) = {len([1, 2, 3])}")
print(f"builtins.len([1,2,3]) = {builtins.len([1, 2, 3])}")

# ========== 4. 赋值是绑定（不是复制）==========
print("\\n========== 4. 赋值是绑定 ==========")
a = [1, 2, 3]
b = a   # b 和 a 绑定到同一个 list 对象
print(f"a = {a}, id(a) = {id(a)}")
print(f"b = a, id(b) = {id(b)}")
print(f"a is b: {a is b}")   # True —— 同一对象

# 修改 b，a 也变（因为是同一个对象）
b.append(4)
print(f"b.append(4) 后:")
print(f"  a = {a}  ← a 也变了！")
print(f"  b = {b}")

# 不可变对象的"绑定"看不出同步变化（因为修改 = 重新绑定）
x = 10
y = x
y = 20   # y 重新绑定到新对象 20，x 不受影响
print(f"\\nx = 10; y = x; y = 20 后:")
print(f"  x = {x}  ← x 不变（int 不可变，y=20 是重新绑定）")
print(f"  y = {y}")

# ========== 5. del 是解除绑定 ==========
print("\\n========== 5. del 是解除绑定 ==========")
data = [1, 2, 3]
alias = data   # 两个名字指向同一对象
print(f"data = {data}, alias = {alias}")
print(f"data is alias: {data is alias}")

del data   # 只移除 'data' 这个名字，对象还在
print(f"del data 后:")
print(f"  'data' in globals: {'data' in globals()}")   # False
print(f"  alias 仍可访问: {alias}")                      # [1, 2, 3]

# ========== 6. 类的命名空间 ==========
print("\\n========== 6. 类的命名空间 ==========")
class Counter:
    """一个简单的计数器类"""
    total = 0   # 类变量，进入类的命名空间

    def __init__(self, name):
        self.name = name   # 实例变量，进入实例的命名空间
        Counter.total += 1

    def show(self):
        print(f"  {self.name}: total={Counter.total}")

# 类的 __dict__ 就是它的命名空间
print("Counter 类的命名空间（__dict__ 的键）:")
for key in Counter.__dict__:
    if not key.startswith("__") or key in ("__doc__",):
        print(f"  {key}")

c1 = Counter("A")
c2 = Counter("B")
c1.show()
c2.show()
print(f"Counter.total = {Counter.total}")   # 2

# 实例也有自己的命名空间 __dict__
print(f"c1.__dict__ = {c1.__dict__}")   # {'name': 'A'}
print(f"c2.__dict__ = {c2.__dict__}")   # {'name': 'B'}

# ========== 总结 ==========
print("\\n========== 总结 ==========")
print("命名空间 = 名字到对象的映射（本质是 dict）")
print("  locals()   → 当前函数的局部命名空间")
print("  globals()  → 模块的全局命名空间")
print("  builtins   → 内置名字（len/print/int 等）")
print("赋值 x = y 是绑定，x 和 y 指向同一对象（不是复制）")
print("del x 是解除绑定（移除名字），不一定是删除对象")
print("可变对象绑定后，修改一方会影响另一方；不可变对象不会")
`,
  },
];
