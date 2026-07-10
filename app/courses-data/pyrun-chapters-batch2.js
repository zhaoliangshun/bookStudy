// =============================================================
// Python 执行代码原理（pyrun）—— 第二批章节
// 主题：名字与作用域（共 5 章：第6章 ~ 第10章）
// =============================================================

export const chapters = [
  {
    id: "pyrun-06",
    group: "名字与作用域",
    icon: "🏷️",
    title: "变量名到底存了什么",
    content: `
# 变量名到底存了什么

## 开篇：一个让新手抓狂的现象

先看一段代码，猜猜输出是什么：

\`\`\`python
a = [1, 2, 3]
b = a
b.append(4)
print(a)
\`\`\`

如果你觉得 \`a\` 还是 \`[1, 2, 3]\`，恭喜你——你和 90% 的 Python 新手踩了同一个坑。实际输出是 \`[1, 2, 3, 4]\`。

为什么会这样？因为 Python 的变量名**不是盒子**，而是**便利贴**。

这个认知差异是理解 Python 内存模型的第一道门槛。跨过去，后面的一切都会豁然开朗。

## 一、变量名是标签，不是盒子

### 1.1 盒子模型 vs 标签模型

在很多语言（比如 C、Java）的教学中，变量被比作"盒子"：变量名是盒子的标签，盒子里装着值。你把 3 放进盒子 \`a\`，盒子 \`a\` 里就是 3。

但 Python 不是这样。Python 的变量名是一张**便利贴**（标签），你把便利贴贴到某个对象上。对象本身独立存在于内存中，变量名只是指向它的一个引用。

| 模型 | 比喻 | 赋值含义 | 修改含义 |
|------|------|---------|---------|
| 盒子模型 | 变量是装东西的盒子 | 把值放进盒子 | 改变盒子里的东西 |
| 标签模型（Python） | 变量是贴在对象上的便利贴 | 把标签贴到对象上 | 通过标签找到对象并改对象 |

用一幅图来理解：

\`\`\`
盒子模型（C/Java）：          标签模型（Python）：

  ┌─────┐                    a ──┐
a │  3  │                        ├──→ 【对象 3】
  └─────┘                    b ──┘

  变量 a 是盒子                a、b 都是标签
  盒子里装着 3                 都贴在对象 3 上
\`\`\`

### 1.2 赋值的真相

在 Python 中，\`a = 3\` 做了什么？

1. 在内存中创建（或找到）一个整数对象 \`3\`
2. 创建一个名字 \`a\`
3. 把名字 \`a\` 和对象 \`3\` 关联起来（贴标签）

注意：**没有把 3 "放进" a**。是 \`a\` 指向了 \`3\`。

\`\`\`python
a = 3       # 创建对象 3，把标签 a 贴上去
b = a       # 把标签 b 也贴到对象 3 上
\`\`\`

此时 \`a\` 和 \`b\` 指向**同一个对象**。用 \`id()\` 可以验证：

\`\`\`python
print(id(a))  # 输出对象 3 的内存地址
print(id(b))  # 输出同一个地址（因为是同一个对象）
\`\`\`

### 1.3 回到开头的问题

现在再看开头的代码：

\`\`\`python
a = [1, 2, 3]   # 创建列表对象 [1,2,3]，贴标签 a
b = a           # 把标签 b 也贴到同一个列表上
b.append(4)     # 通过标签 b 找到列表，往里加 4
print(a)        # 通过标签 a 看同一个列表 → [1, 2, 3, 4]
\`\`\`

\`a\` 和 \`b\` 是同一张便利贴的两份副本，贴在同一个列表对象上。改了列表，两个标签看到的都是改后的结果。

> 💡 **大白话**：变量名就像便利贴，贴在对象上。对象才是真实存在的东西。多个变量名可以贴在同一个对象上。

## 二、一切皆对象

### 2.1 Python 的世界观

Python 有一条核心哲学：**一切皆对象**。

数字是对象，字符串是对象，列表是对象，函数是对象，类本身也是对象，甚至模块也是对象。

\`\`\`python
x = 42          # 整数是对象
s = "hello"     # 字符串是对象
L = [1, 2, 3]   # 列表是对象

def foo():      # 函数也是对象
    pass

print(type(x))    # <class 'int'>
print(type(s))    # <class 'str'>
print(type(foo))  # <class 'function'>
\`\`\`

每个对象都有：
- **类型**（type）：决定了对象能做什么
- **身份**（id）：内存中的唯一标识
- **值**（value）：对象承载的数据

### 2.2 函数也是对象

因为函数是对象，所以你可以像对待普通变量一样对待函数：

\`\`\`python
def greet(name):
    return f"Hello, {name}!"

say = greet        # 把函数对象赋给另一个名字
print(say("Tom"))  # 通过新名字调用 → Hello, Tom!

funcs = [greet, print, len]  # 函数放进列表
for f in funcs:
    print(f, type(f))
\`\`\`

这就是 Python 灵活的根源——没有"特殊公民"，所有东西都是对象，都可以传来传去。

## 三、id() 和 type()：对象的身份证

### 3.1 id() —— 对象的唯一编号

\`id()\` 返回对象的身份标识，在 CPython 中就是对象在内存中的地址。

\`\`\`python
a = 100
print(id(a))   # 比如输出 4303281232
b = 100
print(id(b))   # 可能和 a 一样（小整数池）
c = 200
print(id(c))   # 不同于 a 和 b
\`\`\`

两个对象如果 \`id\` 相同，它们就是同一个对象。

### 3.2 type() —— 对象的类型

\`type()\` 返回对象的类型，类型决定了对象支持哪些操作。

\`\`\`python
print(type(42))        # <class 'int'>
print(type("hello"))   # <class 'str'>
print(type([1,2]))     # <class 'list'>
\`\`\`

类型也是对象（元类 \`type\` 的实例），但这个话题我们先不深入。

## 四、is vs ==：身份比较 vs 值比较

### 4.1 两种比较的区别

| 操作符 | 名称 | 比较什么 | 等价于 |
|--------|------|---------|--------|
| \`is\` | 身份比较 | 两个变量是否指向同一个对象 | \`id(a) == id(b)\` |
| \`==\` | 值比较 | 两个对象的值是否相等 | 调用 \`a.__eq__(b)\` |

\`\`\`python
a = [1, 2, 3]
b = [1, 2, 3]   # 新列表，值相同
c = a            # 同一个对象

print(a == b)   # True，值相等
print(a is b)   # False，不是同一个对象
print(a is c)   # True，是同一个对象
\`\`\`

### 4.2 什么时候用 is

- 判断是否为 \`None\`：\`if x is None\`
- 判断是否为同一个对象：\`if a is b\`
- 不要用 \`is\` 比较数字和字符串的值（因为小整数池可能误导你）

> ⚠️ **常见错误**：用 \`is\` 代替 \`==\` 比较值。有时能"碰巧"对，有时又不对，非常隐蔽。

### 4.3 一个经典的坑

\`\`\`python
a = 256
b = 256
print(a is b)   # True（小整数池）

c = 257
d = 257
print(c is d)   # 可能 False！（超出小整数池范围）
\`\`\`

这就是下一节要讲的小整数池。

## 五、小整数池：Python 的小聪明

### 5.1 什么是小整数池

CPython 启动时，会预先创建 -5 到 256 的整数对象，缓存起来。当你写 \`a = 100\` 时，Python 不会新建对象，而是直接把 \`a\` 指向缓存中已有的 100。

为什么要这样做？因为这些小整数使用频率极高，缓存可以避免反复创建和销毁，提升性能。

\`\`\`python
# 在 -5 到 256 范围内
a = 100
b = 100
print(a is b)   # True，指向同一个缓存对象

# 超出范围
c = 300
d = 300
print(c is d)   # False（交互模式下），各自创建新对象
\`\`\`

> 注意：在脚本文件中（而非交互模式），Python 编译器有时会做额外优化，把同一作用域内的相同常量合并，所以 \`c is d\` 可能也为 True。但这是实现细节，不要依赖。

### 5.2 类似的优化

除了小整数池，Python 还有一些类似的缓存优化：
- 短字符串可能被驻留（interning）
- 空元组是单例：\`() is ()\` 永远为 True
- True/False/None 都是单例

\`\`\`python
print(() is ())         # True，空元组是单例
print(True is True)     # True，布尔值是单例
print(None is None)     # True，None 是单例
\`\`\`

## 六、综合理解

### 6.1 一张图总结

\`\`\`
内存中的对象                    变量名（标签）

  【对象: int 42】  ←────────  a
  id=4303...
  type=int
  value=42           ←────────  b

  【对象: list [1,2,3]】  ←───  c
  id=4512...                ←───  d
  type=list
  value=[1,2,3]
\`\`\`

### 6.2 核心要点

1. **变量名是标签**，不是盒子。赋值 = 贴标签
2. **一切皆对象**，数字、字符串、函数都是对象
3. **id() 看地址**，type() 看类型
4. **is 比身份**，== 比值
5. **小整数池**缓存了 -5 到 256，是性能优化

### 6.3 实践建议

- 理解了标签模型，就不会对"修改 b 导致 a 也变了"感到惊讶
- 判断是否为 None 永远用 \`is None\`
- 比较值用 \`==\`，比较身份用 \`is\`
- 不要依赖小整数池的行为，它是实现细节

## 七、常见问题

**Q：字符串也有类似小整数池的优化吗？**

A：有，叫字符串驻留（interning）。符合标识符规则的字符串（只含字母、数字、下划线）可能会被自动驻留，但不符合的（如含空格、特殊字符）通常不会。

**Q：为什么 \`a = a + 1\` 不会"原地修改"整数？**

A：因为整数是不可变对象。\`a + 1\` 创建了一个新对象，然后把标签 \`a\` 从旧对象撕下来，贴到新对象上。

**Q：函数参数传递是值传递还是引用传递？**

A：严格说是"对象引用传递"（pass by object reference）。你传进去的是一个标签，函数内的标签和外面的标签贴在同一个对象上。如果对象可变，函数内修改会影响外面；如果不可变，函数内"修改"其实是创建了新对象，不影响外面。

> 💡 本章代码用 \`id()\` 和 \`is\` 演示变量引用关系，运行看看结果，加深理解。
    `,
    code: `
# =============================================================
# 变量名到底存了什么 —— 演示代码
# 演示：变量是标签、id()、is vs ==、小整数池
# =============================================================

import sys  # 导入 sys 模块，用于获取对象信息

print("=" * 60)  # 打印分隔线
print("  变量名到底存了什么")  # 打印章节标题
print("=" * 60)  # 打印分隔线

# -------------------------------------------------------------
# 第一部分：变量是标签，不是盒子
# -------------------------------------------------------------
print("\\n【第一部分】变量是标签，不是盒子\\n")  # 打印第一部分标题

a = [1, 2, 3]  # 创建列表对象 [1,2,3]，把标签 a 贴上去
b = a  # 把标签 b 也贴到同一个列表对象上（不是复制！）
print(f"  a = {a}")  # 打印 a 的值
print(f"  b = {b}")  # 打印 b 的值
print(f"  id(a) = {id(a)}")  # 打印 a 指向对象的内存地址
print(f"  id(b) = {id(b)}")  # 打印 b 指向对象的内存地址
print(f"  a is b: {a is b}")  # 判断 a 和 b 是否为同一对象
b.append(4)  # 通过标签 b 修改列表，追加元素 4
print(f"  b.append(4) 后：a = {a}")  # 打印 a，发现也变了
print("  → a 和 b 是同一对象的两个标签")  # 解释结论

# -------------------------------------------------------------
# 第二部分：一切皆对象
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  【第二部分】一切皆对象")  # 打印第二部分标题
print("=" * 60)  # 打印分隔线

x = 42  # 创建整数对象
s = "hello"  # 创建字符串对象
L = [1, 2, 3]  # 创建列表对象
def foo():  # 定义一个函数（函数也是对象）
    return "I am a function"  # 函数返回一个字符串
items = [x, s, L, foo]  # 把不同类型的对象放进同一个列表
for item in items:  # 遍历列表中的每个对象
    name = str(item)[:20]  # 截取对象的字符串表示前 20 个字符
    print(f"  {name:22s} → 类型: {type(item).__name__}")  # 打印对象类型

# -------------------------------------------------------------
# 第三部分：is vs ==
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  【第三部分】is vs ==")  # 打印第三部分标题
print("=" * 60)  # 打印分隔线

list1 = [1, 2, 3]  # 创建新列表 [1,2,3]
list2 = [1, 2, 3]  # 再创建一个值相同的新列表
list3 = list1  # 把 list3 也贴到 list1 指向的对象上
print(f"  list1 == list2: {list1 == list2}")  # 值比较：True
print(f"  list1 is list2: {list1 is list2}")  # 身份比较：False
print(f"  list1 is list3: {list1 is list3}")  # 身份比较：True
print(f"  id(list1) = {id(list1)}")  # 打印 list1 的地址
print(f"  id(list2) = {id(list2)}")  # 打印 list2 的地址（不同）
print(f"  id(list3) = {id(list3)}")  # 打印 list3 的地址（同 list1）

# -------------------------------------------------------------
# 第四部分：小整数池（-5 到 256）
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  【第四部分】小整数池（-5 到 256）")  # 打印第四部分标题
print("=" * 60)  # 打印分隔线

small_a = 100  # 在小整数池范围内的整数
small_b = 100  # 另一个 100
print(f"  100 is 100: {small_a is small_b}")  # True，指向缓存对象
big_a = 300  # 超出小整数池范围
big_b = 300  # 另一个 300
print(f"  300 is 300: {big_a is big_b}")  # 可能 False
print(f"\\n  小整数池范围测试：")  # 打印小标题
for n in [-6, -5, 0, 100, 256, 257]:  # 测试边界值
    x1 = n  # 赋值
    x2 = n  # 再次赋值
    print(f"    {n:4d}: is same = {x1 is x2}")  # 打印是否同一对象

# -------------------------------------------------------------
# 第五部分：特殊单例对象
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  【第五部分】特殊单例对象")  # 打印第五部分标题
print("=" * 60)  # 打印分隔线

print(f"  None is None: {None is None}")  # None 是单例
print(f"  True is True: {True is True}")  # True 是单例
print(f"  False is False: {False is False}")  # False 是单例
t1 = ()  # 创建空元组
t2 = ()  # 再创建空元组
print(f"  () is (): {t1 is t2}")  # 空元组也是单例

# -------------------------------------------------------------
# 总结
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  🎯 本章总结")  # 打印总结标题
print("=" * 60)  # 打印分隔线
print("""
  1. 变量名是标签，贴在对象上，不是装东西的盒子
  2. Python 中一切皆对象，函数也是对象
  3. is 比较身份（是否同一对象），== 比较值
  4. 小整数池缓存 -5 到 256，是性能优化
  5. None、True、False、空元组都是单例
""")  # 打印总结内容
`,
  },
  {
    id: "pyrun-07",
    group: "名字与作用域",
    icon: "📦",
    title: "对象的内部结构",
    content: `
# 对象的内部结构

## 开篇：对象长什么样

上一章我们知道了变量名是便利贴，贴在对象上。那对象本身长什么样？它内部有什么结构？

答案是：每个 Python 对象在底层都是一个 C 结构体 \`PyObject\`，包含三个核心部分——**引用计数**、**类型指针**、**数据**。

理解了这个结构，你就能明白 Python 如何管理内存、如何判断对象可变不可变、以及垃圾回收的原理。

## 一、PyObject：所有对象的祖宗

### 1.1 结构体的样子

在 CPython 源码中，每个对象都以一个 \`PyObject\` 头部开始。用大白话来说，每个对象就像一个快递包裹，上面贴着三样东西：

\`\`\`c
// 简化版，实际定义在 object.h 中
typedef struct _object {
    Py_ssize_t ob_refcnt;    // 引用计数：有多少个标签贴着我
    PyTypeObject *ob_type;   // 类型指针：我是什么类型的对象
    // ... 后面是具体数据
} PyObject;
\`\`\`

| 字段 | 含义 | 比喻 |
|------|------|------|
| ob_refcnt | 引用计数 | 包裹上贴的"被领取次数"计数器 |
| ob_type | 类型指针 | 包裹上的"种类"标签（衣服/书籍/食品） |
| 数据 | 实际值 | 包裹里装的东西 |

> 💡 **大白话**：每个对象就像一个快递包裹，上面贴着"被引用次数"计数器、类型标签，里面装着实际内容。别人每贴一个标签（变量名），计数器 +1；撕掉一个标签，计数器 -1。

### 1.2 所有对象共享这个结构

无论是整数、字符串、列表还是自定义类的实例，底层都是 \`PyObject\` 加上各自的数据部分。这就是 Python 能用统一方式管理所有对象的秘密。

\`\`\`
整数对象 42：                列表对象 [1,2,3]：
┌──────────────┐            ┌──────────────┐
│ refcnt = 2   │            │ refcnt = 1   │
│ type  = int  │            │ type  = list │
│ value = 42   │            │ items = [→]  │
└──────────────┘            └──────────────┘
\`\`\`

### 1.3 对象的三个属性

每个 Python 对象都有三个基本属性，正好对应 \`PyObject\` 的三个部分：

| 属性 | 获取方式 | 含义 | 比喻 |
|------|---------|------|------|
| 身份（identity） | \`id(obj)\` | 对象的唯一编号（内存地址） | 身份证号 |
| 类型（type） | \`type(obj)\` | 对象的类型 | 工种 |
| 值（value） | \`print(obj)\` | 对象承载的数据 | 实际内容 |

\`\`\`python
obj = 42
print(id(obj))      # 身份：比如 4303281232
print(type(obj))    # 类型：<class 'int'>
print(obj)          # 值：42
\`\`\`

## 二、引用计数：对象被多少人盯着

### 2.1 什么是引用计数

引用计数（reference count）记录了有多少个变量名（或其他对象）引用了这个对象。当引用计数归零时，对象就会被回收。

\`\`\`python
import sys

a = [1, 2, 3]          # 创建列表，引用计数 = 1
print(sys.getrefcount(a))  # 输出 2（因为传参时又多了一个引用）

b = a                  # b 也引用了，引用计数 +1 = 2（或 3）
c = a                  # c 也引用了，引用计数 +1
del b                  # 删除 b，引用计数 -1
\`\`\`

> 注意：\`sys.getrefcount(obj)\` 的返回值比你预期的多 1，因为调用函数时参数本身就是一个临时引用。

### 2.2 引用计数的变化时机

引用计数在以下情况 **+1**：
- 赋值：\`b = a\`
- 传参：\`func(a)\`
- 放入容器：\`lst = [a]\`

引用计数在以下情况 **-1**：
- 离开作用域（局部变量被销毁）
- \`del\` 删除变量
- 容器被销毁或移除元素

\`\`\`
a = [1,2,3]     refcnt=1
b = a           refcnt=2  （b 也引用了）
c = [a]         refcnt=3  （列表 c 里也引用了 a）
del b           refcnt=2  （b 被删除）
del c           refcnt=1  （c 被删除，里面的引用也没了）
del a           refcnt=0  → 对象被回收！
\`\`\`

### 2.3 用 gc.get_referrers() 查看谁引用了对象

\`gc\` 模块提供了一个强大的函数 \`get_referrers()\`，可以查看谁引用了某个对象：

\`\`\`python
import gc

a = [1, 2, 3]
b = a
c = {"key": a}
print(gc.get_referrers(a))  # 会列出引用 a 的所有容器
\`\`\`

这就像查快递：看看这个包裹被哪些人"签收"了。

## 三、可变 vs 不可变对象

### 3.1 核心区别

| 类型 | 可变？ | 修改时发生什么 | 例子 |
|------|--------|--------------|------|
| int, float | 不可变 | 创建新对象，标签贴到新对象 | \`a = 1; a += 1\` |
| str | 不可变 | 创建新字符串对象 | \`s = "ab"; s += "c"\` |
| tuple | 不可变 | 不能增删改元素 | \`t = (1,2)\` |
| list | 可变 | 原地修改，地址不变 | \`L.append(4)\` |
| dict | 可变 | 原地增删改键值对 | \`d["k"] = v\` |
| set | 可变 | 原地增删元素 | \`s.add(1)\` |

### 3.2 不可变对象的"修改"

对于不可变对象（如整数、字符串），"修改"其实是创建新对象：

\`\`\`python
a = 1
print(id(a))   # 地址 X
a = a + 1      # 创建新对象 2，把 a 贴过去
print(id(a))   # 地址 Y（不同！）

s = "hello"
print(id(s))   # 地址 A
s += " world"  # 创建新字符串，把 s 贴过去
print(id(s))   # 地址 B（不同！）
\`\`\`

### 3.3 可变对象的"修改"

对于可变对象（如列表），修改是原地的，地址不变：

\`\`\`python
L = [1, 2, 3]
print(id(L))   # 地址 X
L.append(4)    # 原地修改
print(id(L))   # 还是地址 X（没变！）
\`\`\`

### 3.4 一个经典的坑：可变默认参数

\`\`\`python
def add_item(item, lst=[]):  # 默认值是可变对象！
    lst.append(item)
    return lst

print(add_item(1))  # [1]
print(add_item(2))  # [1, 2] —— 不是 [2]！
\`\`\`

因为默认参数 \`[]\` 在函数定义时只创建一次，后续调用共用同一个列表对象。

> ⚠️ **永远不要用可变对象作为函数默认参数**。正确做法是用 \`None\`：
> \`\`\`python
> def add_item(item, lst=None):
>     if lst is None:
>         lst = []
>     lst.append(item)
>     return lst
> \`\`\`

## 四、tuple 的特殊性

### 4.1 tuple 是"不可变"的，但元素可能可变

tuple 本身不可变（不能增删元素），但如果元素是可变对象，元素本身可以被修改：

\`\`\`python
t = ([1, 2], [3, 4])
t[0].append(99)   # 合法！修改的是列表，不是 tuple
print(t)           # ([1, 2, 99], [3, 4])
# t[0] = [1]       # 报错！不能替换 tuple 的元素
\`\`\`

### 4.2 tuple 的内存优势

tuple 比列表更省内存，因为不可变意味着不需要预留修改空间：

\`\`\`python
import sys
print(sys.getsizeof([1, 2, 3]))   # 列表占更多空间
print(sys.getsizeof((1, 2, 3)))   # 元组占更少空间
\`\`\`

## 五、深入理解引用计数

### 5.1 引用计数的好处

- **即时回收**：计数归零，立即释放内存，没有延迟
- **简单高效**：不需要复杂的算法，增减计数即可
- **可预测**：对象生命周期清晰

### 5.2 引用计数的缺陷：循环引用

引用计数有一个致命问题——**循环引用**：

\`\`\`python
a = []
b = []
a.append(b)   # a 引用 b
b.append(a)   # b 引用 a
del a
del b
# 此时两个列表的引用计数都是 1（互相引用）
# 但已经没有外部变量能访问它们了
# 引用计数无法回收 → 内存泄漏！
\`\`\`

这就需要 Python 的另一个机制——**垃圾回收器**（gc 模块）来兜底，这是第 10 章的内容。

## 六、综合理解

### 6.1 对象生命周期

\`\`\`
创建 → 引用计数=1 → 被引用(+1) / 被释放(-1) → 计数=0 → 回收
\`\`\`

### 6.2 核心要点

1. 每个对象 = 引用计数 + 类型指针 + 数据
2. \`id()\` 看地址，\`type()\` 看类型，值就是数据
3. 引用计数追踪对象被引用次数，归零时回收
4. 不可变对象"修改"是创建新对象，可变对象是原地修改
5. 引用计数无法解决循环引用，需要 gc 模块

### 6.3 实践建议

- 不要用可变对象做函数默认参数
- 大量数据用 tuple 比 list 省内存
- 理解可变性，避免意外的共享修改
- 用 \`sys.getrefcount()\` 调试引用问题

> 💡 本章代码用 \`sys.getrefcount()\` 查看引用计数变化，亲眼看看对象被引用的过程。
    `,
    code: `
# =============================================================
# 对象的内部结构 —— 演示代码
# 演示：PyObject 结构、引用计数、可变/不可变、gc.get_referrers
# =============================================================

import sys  # 导入 sys 模块，用于查看对象大小和引用计数
import gc  # 导入 gc 模块，用于查看对象的引用者

print("=" * 60)  # 打印分隔线
print("  对象的内部结构")  # 打印章节标题
print("=" * 60)  # 打印分隔线

# -------------------------------------------------------------
# 第一部分：对象的三个属性（id、type、value）
# -------------------------------------------------------------
print("\\n【第一部分】对象的三个属性\\n")  # 打印第一部分标题

obj = 42  # 创建一个整数对象
print(f"  对象: {obj}")  # 打印对象的值
print(f"  id()   = {id(obj)}")  # 打印对象的内存地址（身份）
print(f"  type() = {type(obj)}")  # 打印对象的类型
print(f"  value  = {obj}")  # 打印对象的值
text = "hello"  # 创建一个字符串对象
print(f"\\n  对象: {text!r}")  # 打印字符串对象
print(f"  id()   = {id(text)}")  # 打印字符串的地址
print(f"  type() = {type(text)}")  # 打印字符串的类型
lst = [1, 2, 3]  # 创建一个列表对象
print(f"\\n  对象: {lst}")  # 打印列表对象
print(f"  id()   = {id(lst)}")  # 打印列表的地址
print(f"  type() = {type(lst)}")  # 打印列表的类型

# -------------------------------------------------------------
# 第二部分：引用计数的变化
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  【第二部分】引用计数的变化")  # 打印第二部分标题
print("=" * 60)  # 打印分隔线

a = [10, 20, 30]  # 创建列表，引用计数 = 1
cnt1 = sys.getrefcount(a)  # 查看当前引用计数（会多 1，因为传参）
print(f"  创建 a 后，引用计数 = {cnt1}")  # 打印引用计数
b = a  # b 也引用了同一对象，引用计数 +1
cnt2 = sys.getrefcount(a)  # 再次查看引用计数
print(f"  b = a 后，引用计数 = {cnt2}（增加了 1）")  # 打印变化
c = [a, a]  # 列表 c 里引用了 a 两次，引用计数 +2
cnt3 = sys.getrefcount(a)  # 再次查看
print(f"  c = [a, a] 后，引用计数 = {cnt3}（增加了 2）")  # 打印变化
del b  # 删除 b，引用计数 -1
cnt4 = sys.getrefcount(a)  # 查看删除后的计数
print(f"  del b 后，引用计数 = {cnt4}（减少了 1）")  # 打印变化
del c  # 删除列表 c，引用计数 -2
cnt5 = sys.getrefcount(a)  # 查看删除后的计数
print(f"  del c 后，引用计数 = {cnt5}（减少了 2）")  # 打印变化

# -------------------------------------------------------------
# 第三部分：可变 vs 不可变对象
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  【第三部分】可变 vs 不可变对象")  # 打印第三部分标题
print("=" * 60)  # 打印分隔线

print("\\n  不可变对象（int）—— 修改时地址变化：")  # 打印小标题
n = 1  # 创建整数对象 1
print(f"    n=1, id={id(n)}")  # 打印地址
n = n + 1  # 创建新对象 2，n 指向新对象
print(f"    n=2, id={id(n)} （地址变了！）")  # 打印新地址
print("\\n  可变对象（list）—— 修改时地址不变：")  # 打印小标题
L = [1, 2, 3]  # 创建列表对象
print(f"    L=[1,2,3], id={id(L)}")  # 打印地址
L.append(4)  # 原地修改列表
print(f"    L.append(4), id={id(L)} （地址没变！）")  # 打印地址
print(f"    L = {L}")  # 打印修改后的值

# -------------------------------------------------------------
# 第四部分：gc.get_referrers() 查看谁引用了对象
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  【第四部分】gc.get_referrers() 查看引用者")  # 打印第四部分标题
print("=" * 60)  # 打印分隔线

target = [100, 200]  # 创建目标列表
holder1 = target  # holder1 引用 target
holder2 = {"data": target}  # 字典引用 target
holder3 = (target, "extra")  # 元组引用 target
referrers = gc.get_referrers(target)  # 获取所有引用 target 的容器
print(f"  目标对象: {target}")  # 打印目标对象
print(f"  引用者数量: {len(referrers)}")  # 打印引用者数量
for i, ref in enumerate(referrers):  # 遍历引用者
    ref_type = type(ref).__name__  # 获取引用者类型名
    print(f"    引用者 {i+1}: 类型={ref_type}")  # 打印引用者类型

# -------------------------------------------------------------
# 第五部分：对象大小比较
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  【第五部分】对象内存大小比较")  # 打印第五部分标题
print("=" * 60)  # 打印分隔线

print(f"  int 的大小:    {sys.getsizeof(42)} 字节")  # 打印整数大小
print(f"  str 的大小:    {sys.getsizeof('hello')} 字节")  # 打印字符串大小
print(f"  list 的大小:   {sys.getsizeof([1,2,3])} 字节")  # 打印列表大小
print(f"  tuple 的大小:  {sys.getsizeof((1,2,3))} 字节")  # 打印元组大小
print(f"  dict 的大小:   {sys.getsizeof({'a':1})} 字节")  # 打印字典大小
print(f"  set 的大小:    {sys.getsizeof({1,2,3})} 字节")  # 打印集合大小

# -------------------------------------------------------------
# 第六部分：tuple 的特殊性
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  【第六部分】tuple 的特殊性")  # 打印第六部分标题
print("=" * 60)  # 打印分隔线

t = ([1, 2], [3, 4])  # 创建包含列表的元组
print(f"  原始 tuple: {t}")  # 打印原始元组
t[0].append(99)  # 修改元组内的列表（合法！）
print(f"  t[0].append(99) 后: {t}")  # 打印修改后的元组
print("  → tuple 本身不可变，但内部的列表是可变的")  # 解释结论

# -------------------------------------------------------------
# 总结
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  🎯 本章总结")  # 打印总结标题
print("=" * 60)  # 打印分隔线
print("""
  1. 每个对象 = 引用计数 + 类型指针 + 数据
  2. id() 看地址，type() 看类型，值就是数据
  3. 引用计数追踪被引用次数，归零时回收
  4. 不可变对象"修改"是创建新对象，可变对象是原地修改
  5. tuple 不可变，但内部的可变元素可以被修改
""")  # 打印总结内容
`,
  },
  {
    id: "pyrun-08",
    group: "名字与作用域",
    icon: "🏠",
    title: "作用域：名字的可见范围",
    content: `
# 作用域：名字的可见范围

## 开篇：客厅和卧室

想象你住在一栋房子里。房子有客厅、卧室、厨房。客厅里放的东西，全家人都能看到、都能用；但你卧室里的私人物品，只有进到你卧室的人才能看到。

Python 的作用域就像这栋房子：
- **全局变量** = 客厅里的东西，所有人（所有函数）都能看到
- **局部变量** = 卧室里的东西，只有当前函数能看到

理解作用域，就是搞清楚"在哪个位置能用到哪个名字"。

## 一、LEGB 规则：找名字的四层楼

### 1.1 什么是 LEGB

Python 查找变量名时，按 **L → E → G → B** 的顺序逐层查找：

| 层级 | 名称 | 比喻 | 说明 |
|------|------|------|------|
| L | Local（局部） | 你的卧室 | 当前函数内部定义的变量 |
| E | Enclosing（嵌套） | 隔壁卧室 | 外层嵌套函数的变量 |
| G | Global（全局） | 客厅 | 模块级别定义的变量 |
| B | Built-in（内置） | 小区公共设施 | Python 内置的名字（print、len、int...） |

\`\`\`
查找顺序：

  L（局部）→ E（嵌套）→ G（全局）→ B（内置）→ 找不到就报错

  ┌─────────────────────────────────┐
  │  B (Built-in)  print, len, int  │  ← 最外层
  │  ┌───────────────────────────┐  │
  │  │  G (Global)  x = 10       │  │  ← 模块级
  │  │  ┌─────────────────────┐  │  │
  │  │  │  E (Enclosing) y=20 │  │  │  ← 外层函数
  │  │  │  ┌───────────────┐  │  │  │
  │  │  │  │  L (Local) z  │  │  │  │  ← 当前函数
  │  │  │  └───────────────┘  │  │  │
  │  │  └─────────────────────┘  │  │
  │  └───────────────────────────┘  │
  └─────────────────────────────────┘
\`\`\`

### 1.2 一个完整示例

\`\`\`python
x = "全局变量"  # G 层

def outer():
    y = "外层变量"  # E 层

    def inner():
        z = "局部变量"  # L 层
        print(z)   # 找到 L 层的 z
        print(y)   # L 层没有 → 找到 E 层的 y
        print(x)   # L、E 都没有 → 找到 G 层的 x
        print(len) # 都没有 → 找到 B 层的 len

    inner()

outer()
\`\`\`

### 1.3 找不到名字怎么办

如果四层都找不到，Python 抛出 \`NameError\`：

\`\`\`python
def foo():
    print(not_defined)  # LEBG 都没有 → NameError!
foo()
\`\`\`

## 二、局部作用域：函数的卧室

### 2.1 函数内部创建的变量，外面看不到

\`\`\`python
def foo():
    a = 100  # 局部变量，只在 foo 内部可见

foo()
print(a)  # NameError: name 'a' is not defined
\`\`\`

这就像你不能从客厅直接看到卧室里的东西。

### 2.2 函数参数也是局部变量

\`\`\`python
def greet(name):  # name 是局部变量
    print(f"Hello, {name}")

greet("Tom")
print(name)  # NameError! name 只在 greet 内部可见
\`\`\`

### 2.3 每次调用都是独立的作用域

\`\`\`python
def counter():
    count = 0   # 每次调用都重新创建
    count += 1
    return count

print(counter())  # 1
print(counter())  # 1（不是 2！每次都是新的 count）
\`\`\`

## 三、全局作用域：模块的客厅

### 3.1 模块级别的变量

在文件顶层定义的变量就是全局变量，在整个模块内可见：

\`\`\`python
PI = 3.14159  # 全局变量

def area(r):
    return PI * r * r  # 函数内可以读取全局变量

print(area(5))  # 78.5
\`\`\`

### 3.2 函数内不能直接修改全局变量

\`\`\`python
count = 0

def increment():
    count = count + 1  # 报错！UnboundLocalError

increment()
\`\`\`

为什么报错？因为 Python 看到函数内有 \`count =\`，就认为 \`count\` 是局部变量。但在赋值前就使用了它，所以报"未绑定"错误。

### 3.3 用 global 声明修改全局变量

\`\`\`python
count = 0

def increment():
    global count  # 声明 count 是全局变量
    count = count + 1  # 现在可以修改了

increment()
print(count)  # 1
\`\`\`

> ⚠️ **慎用 global**。大量使用 global 会让代码难以维护。更好的方式是用返回值或类。

## 四、nonlocal：修改外层函数的变量

### 4.1 什么时候用 nonlocal

在嵌套函数中，如果想修改外层函数（E 层）的变量，需要用 \`nonlocal\`：

\`\`\`python
def outer():
    x = 10

    def inner():
        nonlocal x  # 声明 x 是外层函数的变量
        x = x + 1   # 修改外层的 x
        print(x)

    inner()
    print(x)  # 11，被 inner 修改了

outer()
\`\`\`

### 4.2 global vs nonlocal

| 关键字 | 修改哪一层 | 使用场景 |
|--------|----------|---------|
| \`global\` | 全局（G 层） | 函数内修改模块级变量 |
| \`nonlocal\` | 嵌套（E 层） | 内层函数修改外层函数的变量 |

### 4.3 nonlocal 的典型应用：计数器

\`\`\`python
def make_counter():
    count = 0  # 外层函数的变量

    def counter():
        nonlocal count  # 引用外层变量
        count += 1
        return count

    return counter

c = make_counter()
print(c())  # 1
print(c())  # 2
print(c())  # 3
\`\`\`

这就是**闭包**的核心机制，下一章会详细讲。

## 五、globals() 和 locals()：查看作用域

### 5.1 globals()

\`globals()\` 返回全局命名空间的字典：

\`\`\`python
x = 100
def foo():
    pass

print(globals())
# {'x': 100, 'foo': <function foo>, '__name__': '__main__', ...}
\`\`\`

### 5.2 locals()

\`locals()\` 返回当前局部命名空间的字典：

\`\`\`python
def foo(a, b):
    c = a + b
    print(locals())  # {'a': 1, 'b': 2, 'c': 3}

foo(1, 2)
\`\`\`

### 5.3 在不同位置调用结果不同

\`\`\`python
x = "全局"

def outer():
    y = "外层"
    print("outer 中的 locals:", locals())  # {'y': '外层'}

    def inner():
        z = "局部"
        print("inner 中的 locals:", locals())  # {'z': '局部'}
        print("inner 中的 globals 有 x:", 'x' in globals())

    inner()

outer()
\`\`\`

## 六、作用域的常见陷阱

### 6.1 循环中的闭包陷阱

\`\`\`python
funcs = []
for i in range(3):
    funcs.append(lambda: i)  # 所有 lambda 都引用同一个 i

print([f() for f in funcs])  # [2, 2, 2] 不是 [0, 1, 2]！
\`\`\`

因为 \`i\` 是全局变量，循环结束后 \`i = 2\`，所有 lambda 都返回 2。

修复方法：用默认参数捕获当前值

\`\`\`python
funcs = []
for i in range(3):
    funcs.append(lambda i=i: i)  # 默认参数在定义时求值

print([f() for f in funcs])  # [0, 1, 2]
\`\`\`

### 6.2 列表推导式有自己的作用域

\`\`\`python
# 列表推导式中的变量不会泄漏到外部
result = [x for x in range(5)]
print(x)  # NameError（Python 3 中）
\`\`\`

但在 Python 2 中，\`x\` 会泄漏到外部作用域！这是 Py2 和 Py3 的一个重要区别。

## 七、综合理解

### 7.1 核心要点

1. **LEGB 规则**：L → E → G → B 逐层查找
2. **函数内看不到外面的局部变量**，但能看到全局变量
3. **修改全局变量用 \`global\`**，修改外层函数变量用 \`nonlocal\`
4. **globals() / locals()** 查看当前命名空间
5. **作用域在定义时确定**，不是调用时

### 7.2 实践建议

- 尽量避免修改全局变量，用返回值代替
- 理解 LEGB 规则，避免命名冲突
- 注意闭包中的循环变量陷阱
- 用 \`locals()\` 调试作用域问题

> 💡 本章代码用 \`globals()\` 和 \`locals()\` 查看不同作用域的变量，亲眼看看 LEGB 规则。
    `,
    code: `
# =============================================================
# 作用域：名字的可见范围 —— 演示代码
# 演示：LEGB 规则、global/nonlocal、globals()/locals()
# =============================================================

print("=" * 60)  # 打印分隔线
print("  作用域：名字的可见范围")  # 打印章节标题
print("=" * 60)  # 打印分隔线

# -------------------------------------------------------------
# 全局变量定义（G 层）
# -------------------------------------------------------------
global_var = "我是全局变量"  # 定义一个全局变量

# -------------------------------------------------------------
# 第一部分：LEGB 规则演示
# -------------------------------------------------------------
print("\\n【第一部分】LEGB 规则演示\\n")  # 打印第一部分标题

def outer_func():  # 定义外层函数
    enclosing_var = "我是外层变量"  # 定义 E 层变量（Enclosing）
    def inner_func():  # 定义内层函数
        local_var = "我是局部变量"  # 定义 L 层变量（Local）
        print(f"  L (局部): {local_var}")  # 打印局部变量
        print(f"  E (嵌套): {enclosing_var}")  # 打印外层变量
        print(f"  G (全局): {global_var}")  # 打印全局变量
        print(f"  B (内置): {len.__name__}")  # 打印内置函数名
    inner_func()  # 调用内层函数
    print("  → inner_func 按 L→E→G→B 顺序查找名字")  # 解释结论

outer_func()  # 调用外层函数

# -------------------------------------------------------------
# 第二部分：局部变量外面看不到
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  【第二部分】局部变量外面看不到")  # 打印第二部分标题
print("=" * 60)  # 打印分隔线

def create_local():  # 定义一个创建局部变量的函数
    secret = "卧室里的秘密"  # 这是一个局部变量
    return "函数执行完毕"  # 返回一个字符串
result = create_local()  # 调用函数
print(f"  函数返回: {result}")  # 打印返回值
print(f"  'secret' 在全局吗: {'secret' in globals()}")  # 检查 secret 是否在全局

# -------------------------------------------------------------
# 第三部分：global 关键字
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  【第三部分】global 关键字")  # 打印第三部分标题
print("=" * 60)  # 打印分隔线

counter = 0  # 定义全局计数器
def increment_global():  # 定义递增函数
    global counter  # 声明使用全局变量 counter
    counter = counter + 1  # 修改全局变量
print(f"  初始 counter = {counter}")  # 打印初始值
increment_global()  # 调用一次
increment_global()  # 再调用一次
increment_global()  # 再调用一次
print(f"  调用 3 次后 counter = {counter}")  # 打印修改后的值

# -------------------------------------------------------------
# 第四部分：nonlocal 关键字
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  【第四部分】nonlocal 关键字")  # 打印第四部分标题
print("=" * 60)  # 打印分隔线

def make_counter():  # 定义一个创建计数器的函数
    count = 0  # 外层函数的变量
    def counter():  # 定义内层计数器函数
        nonlocal count  # 声明 count 是外层变量
        count = count + 1  # 修改外层变量
        return count  # 返回当前计数值
    return counter  # 返回计数器函数
my_counter = make_counter()  # 创建计数器
print(f"  第 1 次调用: {my_counter()}")  # 打印 1
print(f"  第 2 次调用: {my_counter()}")  # 打印 2
print(f"  第 3 次调用: {my_counter()}")  # 打印 3

# -------------------------------------------------------------
# 第五部分：globals() 和 locals()
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  【第五部分】globals() 和 locals()")  # 打印第五部分标题
print("=" * 60)  # 打印分隔线

g = globals()  # 获取全局命名空间字典
print(f"  全局变量数量: {len(g)}")  # 打印全局变量数量
print(f"  global_var 在全局吗: {'global_var' in g}")  # 检查全局变量
print(f"  counter 在全局吗: {'counter' in g}")  # 检查 counter
print(f"  print 在全局吗: {'print' in g}")  # print 也在全局字典中
def scope_demo(a, b):  # 定义一个演示作用域的函数
    local_x = a + b  # 创建局部变量
    local_y = a * b  # 创建另一个局部变量
    loc = locals()  # 获取局部命名空间
    print(f"\\n  函数内的 locals():")  # 打印小标题
    for key in sorted(loc.keys()):  # 遍历局部变量
        if not key.startswith("_"):  # 跳过以下划线开头的
            print(f"    {key} = {loc[key]}")  # 打印变量名和值
scope_demo(3, 4)  # 调用函数

# -------------------------------------------------------------
# 第六部分：闭包循环陷阱
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  【第六部分】闭包循环陷阱")  # 打印第六部分标题
print("=" * 60)  # 打印分隔线

funcs_bad = []  # 创建空列表存放函数
for i in range(3):  # 循环 0,1,2
    funcs_bad.append(lambda: i)  # 添加 lambda（引用同一个 i）
print(f"  陷阱版: {[f() for f in funcs_bad]}")  # 打印 [2,2,2]
funcs_good = []  # 创建空列表存放函数
for i in range(3):  # 循环 0,1,2
    funcs_good.append(lambda i=i: i)  # 用默认参数捕获当前值
print(f"  修复版: {[f() for f in funcs_good]}")  # 打印 [0,1,2]

# -------------------------------------------------------------
# 总结
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  🎯 本章总结")  # 打印总结标题
print("=" * 60)  # 打印分隔线
print("""
  1. LEGB 规则：L(局部)→E(嵌套)→G(全局)→B(内置)
  2. 函数内部的变量，外面看不到
  3. global 修改全局变量，nonlocal 修改外层函数变量
  4. globals() 和 locals() 查看命名空间
  5. 注意闭包中的循环变量陷阱，用默认参数修复
""")  # 打印总结内容
`,
  },
  {
    id: "pyrun-09",
    group: "名字与作用域",
    icon: "🔒",
    title: "闭包：函数带着记忆",
    content: `
# 闭包：函数带着记忆

## 开篇：带着笔记本的员工

想象公司里有个员工，他要调到别的部门去了。走之前，他把自己需要用的资料抄在笔记本上带走。到了新部门，虽然原来的办公室已经不在了，但他靠着笔记本上的资料，依然能完成工作。

**闭包就是这个带着笔记本的员工**。

一个内层函数引用了外层函数的变量，当外层函数执行完毕后，内层函数依然能"记住"那些变量。这个"带着记忆"的函数，就是闭包。

## 一、闭包是什么

### 1.1 从一个例子开始

\`\`\`python
def make_greeting(greeting):  # 外层函数
    def greet(name):          # 内层函数
        return f"{greeting}, {name}!"  # 引用了外层的 greeting
    return greet              # 返回内层函数（不调用！）

say_hello = make_greeting("Hello")
say_hi = make_greeting("Hi")

print(say_hello("Tom"))  # Hello, Tom!
print(say_hi("Tom"))     # Hi, Tom!
\`\`\`

注意：\`make_greeting\` 执行完毕后，\`greeting\` 这个局部变量本该消失。但 \`say_hello\` 和 \`say_hi\` 各自"记住"了自己的 \`greeting\`。

这就是闭包。

### 1.2 闭包的正式定义

**闭包 = 函数 + 它引用的外层变量**

更准确地说：如果一个内层函数引用了外层函数的变量，并且被返回到外部使用，就形成了一个闭包。闭包"捕获"了外层变量的值，即使外层函数已经执行完毕。

\`\`\`
make_greeting("Hello") 执行时：
  ┌─────────────────────────┐
  │ greeting = "Hello"       │  ← 外层变量
  │  ┌───────────────────┐  │
  │  │ def greet(name):  │  │  ← 内层函数，引用 greeting
  │  │   return greeting  │  │
  │  └───────────────────┘  │
  └─────────────────────────┘
           ↓ return greet
  say_hello 现在带着 "Hello" 这个记忆独立存在
\`\`\`

### 1.3 闭包的三要素

形成闭包需要三个条件：
1. **嵌套函数**：函数内部定义了另一个函数
2. **引用外层变量**：内层函数用到了外层函数的变量
3. **返回内层函数**：外层函数把内层函数返回出去

> 💡 **大白话**：闭包就像一个带着笔记本的员工，调走时把需要的资料抄在笔记本上带走。即使原来的办公室（外层函数）拆了，他靠着笔记本（捕获的变量）依然能工作。

## 二、__closure__：查看闭包的记忆

### 2.1 闭包的秘密藏在 __closure__

每个函数对象都有一个 \`__closure__\` 属性，记录了它捕获的外层变量：

\`\`\`python
def make_adder(n):
    def adder(x):
        return x + n  # 引用外层的 n
    return adder

add5 = make_adder(5)
print(add5.__closure__)        # (<cell at 0x...: int object at 0x...>,)
print(add5.__closure__[0].cell_contents)  # 5
\`\`\`

\`__closure__\` 是一个元组，每个元素是一个 \`cell\` 对象，\`cell.cell_contents\` 就是捕获的值。

### 2.2 每个闭包有独立的记忆

\`\`\`python
add5 = make_adder(5)
add10 = make_adder(10)

print(add5.__closure__[0].cell_contents)   # 5
print(add10.__closure__[0].cell_contents)  # 10
\`\`\`

\`add5\` 和 \`add10\` 各自记住了不同的 \`n\`，互不影响。

### 2.3 没有闭包时 __closure__ 是 None

\`\`\`python
def normal_func(x):
    return x * 2

print(normal_func.__closure__)  # None（没有引用外层变量）
\`\`\`

## 三、闭包的应用

### 3.1 计数器

\`\`\`python
def make_counter():
    count = 0
    def counter():
        nonlocal count
        count += 1
        return count
    return counter

c = make_counter()
print(c())  # 1
print(c())  # 2
print(c())  # 3
\`\`\`

\`count\` 被闭包"藏"起来了，外部无法直接访问，只能通过 \`c()\` 间接修改。这就是一种**封装**。

### 3.2 装饰器

装饰器本质上是闭包的应用：

\`\`\`python
def log(func):
    def wrapper(*args, **kwargs):
        print(f"调用 {func.__name__}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} 返回 {result}")
        return result
    return wrapper

@log
def add(a, b):
    return a + b

add(1, 2)
# 输出：
# 调用 add
# add 返回 3
\`\`\`

\`wrapper\` 引用了外层的 \`func\`，形成了闭包。

### 3.3 配置生成器

\`\`\`python
def make_url(base):
    def path(endpoint):
        return f"{base}{endpoint}"
    return path

api = make_url("https://api.example.com")
print(api("/users"))    # https://api.example.com/users
print(api("/products")) # https://api.example.com/products
\`\`\`

### 3.4 回调函数

\`\`\`python
def make_handler(user_id):
    def on_click():
        print(f"用户 {user_id} 点击了按钮")
    return on_click

handler = make_handler(42)
# 后面调用 handler() 时，依然知道 user_id 是 42
\`\`\`

## 四、闭包 vs 类：两种保持状态的方式

### 4.1 同一个需求，两种写法

需求：实现一个计数器

**闭包写法：**
\`\`\`python
def make_counter():
    count = 0
    def counter():
        nonlocal count
        count += 1
        return count
    return counter
\`\`\`

**类写法：**
\`\`\`python
class Counter:
    def __init__(self):
        self.count = 0
    def __call__(self):
        self.count += 1
        return self.count
\`\`\`

两种方式效果一样：

\`\`\`python
c1 = make_counter()
c2 = Counter()
print(c1())  # 1
print(c2())  # 1
\`\`\`

### 4.2 闭包 vs 类对比

| 特性 | 闭包 | 类 |
|------|------|-----|
| 保持状态 | ✅ 通过捕获变量 | ✅ 通过实例属性 |
| 封装 | ✅ 变量对外不可见 | 需要私有属性约定 |
| 多方法 | ❌ 只能返回一个函数 | ✅ 可以有多个方法 |
| 继承 | ❌ 不支持 | ✅ 支持 |
| 可读性 | 简单场景更简洁 | 复杂场景更清晰 |
| 适用场景 | 简单状态、回调、装饰器 | 复杂对象、多方法 |

### 4.3 什么时候用闭包

- 状态简单（一两个变量）
- 只需要一个"可调用"的接口
- 写装饰器
- 回调函数需要捕获上下文

### 4.4 什么时候用类

- 状态复杂（多个属性）
- 需要多个方法
- 需要继承
- 需要更规范的结构

## 五、闭包的常见陷阱

### 5.1 循环变量陷阱

\`\`\`python
funcs = []
for i in range(3):
    funcs.append(lambda: i)

print([f() for f in funcs])  # [2, 2, 2]
\`\`\`

所有 lambda 共享同一个 \`i\`，循环结束后 \`i=2\`。

**修复方法 1：默认参数**
\`\`\`python
for i in range(3):
    funcs.append(lambda i=i: i)
\`\`\`

**修复方法 2：用闭包捕获**
\`\`\`python
for i in range(3):
    def make_func(n):
        return lambda: n
    funcs.append(make_func(i))
\`\`\`

### 5.2 共享变量问题

\`\`\`python
def make_funcs():
    funcs = []
    for i in range(3):
        def f():
            return i
        funcs.append(f)
    return funcs

f0, f1, f2 = make_funcs()
print(f0(), f1(), f2())  # 2 2 2（共享同一个 i）
\`\`\`

### 5.3 意外的闭包

有时候你并不想创建闭包，但不知不觉就创建了：

\`\`\`python
# 在模块顶层定义，不是闭包
x = 10
def foo():
    print(x)  # 不是闭包！x 是全局变量

# 在函数内定义，是闭包
def bar():
    y = 10
    def inner():
        print(y)  # 是闭包！y 是外层变量
    return inner
\`\`\`

## 六、综合理解

### 6.1 闭包的本质

闭包不是一个特殊语法，而是一种**自然产生的现象**：当内层函数引用外层变量并被返回时，Python 自动把那些变量"打包"进 \`__closure__\`，让函数带着记忆离开。

### 6.2 核心要点

1. **闭包 = 函数 + 捕获的外层变量**
2. **\`__closure__\`** 属性查看捕获的变量
3. **每个闭包有独立的记忆**，互不影响
4. **闭包 vs 类**：简单状态用闭包，复杂逻辑用类
5. **注意循环变量陷阱**：用默认参数或工厂函数修复

### 6.3 实践建议

- 用闭包实现计数器、缓存、装饰器
- 检查 \`__closure__\` 理解闭包捕获了什么
- 简单状态优先用闭包，复杂逻辑用类
- 警惕循环中的闭包陷阱

> 💡 本章代码实现一个计数器闭包，用 \`__closure__\` 查看捕获的变量，亲手感受闭包的"记忆"。
    `,
    code: `
# =============================================================
# 闭包：函数带着记忆 —— 演示代码
# 演示：闭包基本原理、__closure__、计数器、闭包 vs 类
# =============================================================

print("=" * 60)  # 打印分隔线
print("  闭包：函数带着记忆")  # 打印章节标题
print("=" * 60)  # 打印分隔线

# -------------------------------------------------------------
# 第一部分：闭包基本演示
# -------------------------------------------------------------
print("\\n【第一部分】闭包基本演示\\n")  # 打印第一部分标题

def make_greeting(greeting):  # 外层函数，接收问候语
    def greet(name):  # 内层函数，接收名字
        message = f"{greeting}, {name}!"  # 引用外层的 greeting（闭包！）
        return message  # 返回拼接后的消息
    return greet  # 返回内层函数本身（不调用）
say_hello = make_greeting("Hello")  # 创建一个说 Hello 的闭包
say_hi = make_greeting("Hi")  # 创建另一个说 Hi 的闭包
print(f"  say_hello('Tom') = {say_hello('Tom')}")  # Hello, Tom!
print(f"  say_hi('Tom') = {say_hi('Tom')}")  # Hi, Tom!
print("  → make_greeting 执行完了，但 greeting 被记住了")  # 解释结论

# -------------------------------------------------------------
# 第二部分：查看 __closure__
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  【第二部分】查看 __closure__")  # 打印第二部分标题
print("=" * 60)  # 打印分隔线

def make_adder(n):  # 外层函数，接收一个数 n
    def adder(x):  # 内层函数，接收另一个数 x
        return x + n  # 引用外层的 n（闭包！）
    return adder  # 返回内层函数
add5 = make_adder(5)  # 创建一个"加5"的闭包
add10 = make_adder(10)  # 创建一个"加10"的闭包
print(f"  add5(3) = {add5(3)}")  # 8
print(f"  add10(3) = {add10(3)}")  # 13
closure5 = add5.__closure__  # 获取 add5 的闭包信息
closure10 = add10.__closure__  # 获取 add10 的闭包信息
print(f"  add5.__closure__ = {closure5}")  # 打印闭包 cell 对象
print(f"  add5 记住的值 = {closure5[0].cell_contents}")  # 5
print(f"  add10 记住的值 = {closure10[0].cell_contents}")  # 10
def normal_func(x):  # 定义一个普通函数
    return x * 2  # 没有引用外层变量
print(f"  普通函数的 __closure__ = {normal_func.__closure__}")  # None

# -------------------------------------------------------------
# 第三部分：计数器闭包
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  【第三部分】计数器闭包")  # 打印第三部分标题
print("=" * 60)  # 打印分隔线

def make_counter():  # 定义创建计数器的函数
    count = 0  # 外层函数的变量（初始值为0）
    def counter():  # 内层计数器函数
        nonlocal count  # 声明要修改外层的 count
        count = count + 1  # 计数加 1
        return count  # 返回当前计数值
    return counter  # 返回计数器函数
c1 = make_counter()  # 创建第一个计数器
c2 = make_counter()  # 创建第二个计数器
print(f"  c1 第1次: {c1()}")  # 1
print(f"  c1 第2次: {c1()}")  # 2
print(f"  c1 第3次: {c1()}")  # 3
print(f"  c2 第1次: {c2()}")  # 1（独立计数！）
print(f"  c1 第4次: {c1()}")  # 4
print(f"  c1 记住的 count = {c1.__closure__[0].cell_contents}")  # 4
print(f"  c2 记住的 count = {c2.__closure__[0].cell_contents}")  # 1

# -------------------------------------------------------------
# 第四部分：闭包 vs 类
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  【第四部分】闭包 vs 类")  # 打印第四部分标题
print("=" * 60)  # 打印分隔线

class CounterClass:  # 定义计数器类
    def __init__(self):  # 初始化方法
        self.count = 0  # 实例属性，初始值为 0
    def __call__(self):  # 让实例可以像函数一样调用
        self.count = self.count + 1  # 计数加 1
        return self.count  # 返回当前值
    def reset(self):  # 重置方法（类可以有多个方法）
        self.count = 0  # 重置为 0
print("  用闭包实现计数器：")  # 打印小标题
closure_counter = make_counter()  # 创建闭包计数器
print(f"    {closure_counter()}, {closure_counter()}, {closure_counter()}")  # 1,2,3
print("  用类实现计数器：")  # 打印小标题
class_counter = CounterClass()  # 创建类计数器
print(f"    {class_counter()}, {class_counter()}, {class_counter()}")  # 1,2,3
print("  类可以重置，闭包不行：")  # 打印小标题
class_counter.reset()  # 调用重置方法
print(f"    重置后: {class_counter()}")  # 1

# -------------------------------------------------------------
# 第五部分：闭包循环陷阱
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  【第五部分】闭包循环陷阱")  # 打印第五部分标题
print("=" * 60)  # 打印分隔线

funcs_bad = []  # 创建空列表
for i in range(3):  # 循环 0,1,2
    funcs_bad.append(lambda: i)  # 所有 lambda 共享同一个 i
print(f"  陷阱版: {[f() for f in funcs_bad]}")  # [2, 2, 2]
funcs_good = []  # 创建空列表
for i in range(3):  # 循环 0,1,2
    def make_func(n):  # 工厂函数，用闭包捕获当前值
        return lambda: n  # 返回引用 n 的 lambda
    funcs_good.append(make_func(i))  # 每次捕获不同的 i
print(f"  修复版: {[f() for f in funcs_good]}")  # [0, 1, 2]

# -------------------------------------------------------------
# 第六部分：闭包实现配置生成器
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  【第六部分】闭包实现配置生成器")  # 打印第六部分标题
print("=" * 60)  # 打印分隔线

def make_url_builder(base_url):  # 外层函数，接收基础 URL
    def build(endpoint):  # 内层函数，接收路径
        return base_url + endpoint  # 拼接 URL（闭包引用 base_url）
    return build  # 返回内层函数
api_url = make_url_builder("https://api.example.com")  # 创建 API URL 构建器
web_url = make_url_builder("https://www.example.com")  # 创建 Web URL 构建器
print(f"  {api_url('/users')}")  # https://api.example.com/users
print(f"  {api_url('/products')}")  # https://api.example.com/products
print(f"  {web_url('/home')}")  # https://www.example.com/home

# -------------------------------------------------------------
# 总结
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  🎯 本章总结")  # 打印总结标题
print("=" * 60)  # 打印分隔线
print("""
  1. 闭包 = 函数 + 它捕获的外层变量
  2. __closure__ 属性查看闭包记住的变量
  3. 每个闭包有独立的记忆，互不影响
  4. 闭包适合简单状态，类适合复杂逻辑
  5. 注意循环变量陷阱，用工厂函数修复
""")  # 打印总结内容
`,
  },
  {
    id: "pyrun-10",
    group: "名字与作用域",
    icon: "♻️",
    title: "垃圾回收：对象怎么被清理",
    content: `
# 垃圾回收：对象怎么被清理

## 开篇：小区物业的两种打扫方式

想象一个小区的物业管理：
- **日常巡查**：物业每天巡逻，看到哪家的快递包裹没人要了（没人引用了），立刻收走
- **定期大扫除**：每隔一段时间，物业搞一次大扫除，专门清理那些互相纠缠、没人来领的废弃物品

Python 的垃圾回收（Garbage Collection，简称 GC）用的就是这两招：
- **日常巡查** = 引用计数（reference counting）
- **定期大扫除** = 分代回收（generational collection）

理解垃圾回收，你就能搞清楚对象什么时候被销毁、内存什么时候被释放。

## 一、引用计数：日常巡查

### 1.1 基本原理

每个对象都有一个引用计数（ob_refcnt），记录有多少个变量名引用了它。当引用计数归零时，对象立即被回收。

\`\`\`python
a = [1, 2, 3]   # 创建列表，refcnt = 1
b = a           # refcnt = 2
c = a           # refcnt = 3
del b           # refcnt = 2
del c           # refcnt = 1
del a           # refcnt = 0 → 立即回收！
\`\`\`

### 1.2 引用计数的变化规则

**计数 +1 的情况：**
- 赋值：\`b = a\`
- 传参：\`func(a)\`
- 放入容器：\`lst = [a]\`

**计数 -1 的情况：**
- \`del a\`
- 变量离开作用域
- 容器被销毁或移除元素

### 1.3 引用计数的优点

| 优点 | 说明 |
|------|------|
| 即时回收 | 计数归零，立即释放，没有延迟 |
| 简单高效 | 只需维护一个整数，开销小 |
| 可预测 | 对象生命周期清晰 |

### 1.4 引用计数的致命缺陷：循环引用

\`\`\`python
a = []
b = []
a.append(b)   # a 引用 b
b.append(a)   # b 引用 a
del a         # a 的 refcnt = 1（b 还引用它）
del b         # b 的 refcnt = 1（a 还引用它）
# 此时两个列表的 refcnt 都是 1（互相引用）
# 但已经没有外部能访问它们了
# 引用计数无法回收 → 内存泄漏！
\`\`\`

这就像两个人互相抱着对方，谁也不松手，物业巡查时看到他们"还有人抱着"，就不会收走——但他们其实已经是孤儿了。

## 二、分代回收：定期大扫除

### 2.1 为什么需要分代回收

为了解决循环引用，Python 引入了分代垃圾回收器。它的核心思想是：

> **新创建的对象更容易变成垃圾，存活越久的对象越可能继续存活。**

这就像小区里：新到的快递更容易被遗弃，放了很久的东西主人通常还会要。

### 2.2 三代回收

Python 把对象分成三代：

| 代 | 说明 | 回收频率 |
|----|------|---------|
| 第 0 代 | 新创建的对象 | 最频繁 |
| 第 1 代 | 经历过 0 代回收仍存活 | 中等 |
| 第 2 代 | 经历过 1 代回收仍存活 | 最少 |

\`\`\`
新对象 → 第0代 → 存活 → 第1代 → 存活 → 第2代
          ↓               ↓               ↓
        回收             回收             回收
\`\`\`

### 2.3 回收触发条件

- **第 0 代**：当分配的对象数量减去释放的数量超过阈值（默认 700）
- **第 1 代**：第 0 代回收超过 10 次
- **第 2 代**：第 1 代回收超过 10 次

\`\`\`python
import gc
print(gc.get_threshold())  # (700, 10, 10)
\`\`\`

### 2.4 分代回收的过程

1. 给所有容器对象打标记
2. 从可疑对象出发，遍历引用链
3. 找到循环引用组
4. 检查组内是否有外部引用
5. 没有外部引用的组 → 整体回收

## 三、gc 模块：手动控制垃圾回收

### 3.1 gc 模块常用功能

\`\`\`python
import gc

gc.collect()           # 手动触发回收
gc.get_threshold()     # 查看回收阈值
gc.set_threshold(700, 10, 10)  # 设置阈值
gc.disable()           # 禁用自动回收（慎用！）
gc.enable()            # 重新启用
gc.get_stats()         # 查看各代回收统计
\`\`\`

### 3.2 观察循环引用的回收

\`\`\`python
import gc

class Node:
    def __init__(self, name):
        self.name = name
        self.parent = None
        self.children = []
    
    def __repr__(self):
        return f"Node({self.name})"

# 创建循环引用
a = Node("A")
b = Node("B")
a.children.append(b)   # A 引用 B
b.parent = a           # B 引用 A

del a
del b
# 此时 A 和 B 互相引用，引用计数不为 0

gc.collect()  # 手动触发分代回收，解决循环引用
\`\`\`

### 3.3 查看回收统计

\`\`\`python
import gc

print(gc.get_stats())
# 每一代的统计：collections（回收次数）、collected（回收对象数）、uncollectable（无法回收数）
\`\`\`

## 四、__del__ 方法：对象的遗言

### 4.1 什么是 __del__

\`__del__\` 是对象的析构方法，在对象被销毁时调用。你可以把它理解为对象的"遗言"。

\`\`\`python
class MyClass:
    def __init__(self, name):
        self.name = name
        print(f"{self.name} 出生了")
    
    def __del__(self):
        print(f"{self.name} 被销毁了")

obj = MyClass("Tom")  # Tom 出生了
del obj               # Tom 被销毁了
\`\`\`

### 4.2 __del__ 的注意事项

> ⚠️ **不要在 __del__ 中做重要工作**，因为：
> - 不确定什么时候被调用（依赖垃圾回收时机）
> - 循环引用 + __del__ 会导致对象无法回收（Python 3.4 之前）
> - 异常会被忽略

### 4.3 更好的资源管理：上下文管理器

对于需要清理的资源（文件、连接），用 \`with\` 语句比 \`__del__\` 更可靠：

\`\`\`python
class FileManager:
    def __init__(self, filename):
        self.filename = filename
        self.file = None
    
    def __enter__(self):
        self.file = open(self.filename, 'r')
        return self.file
    
    def __exit__(self, *args):
        if self.file:
            self.file.close()

with FileManager("test.txt") as f:
    data = f.read()
# 离开 with 块，自动调用 __exit__，确保文件关闭
\`\`\`

## 五、weakref：不增加引用计数的引用

### 5.1 什么是弱引用

弱引用（weak reference）可以访问对象，但**不会增加引用计数**。当对象只被弱引用引用时，仍然会被回收。

\`\`\`python
import weakref

class MyClass:
    pass

obj = MyClass()
ref = weakref.ref(obj)  # 创建弱引用

print(ref())   # <MyClass object>（通过弱引用访问对象）
del obj        # 删除强引用，对象被回收
print(ref())   # None（弱引用还在，但对象已不存在）
\`\`\`

### 5.2 弱引用的用途

- **缓存**：缓存对象但不阻止回收
- **观察者模式**：观察者不阻止被观察对象销毁
- **避免循环引用**：一方用弱引用打破循环

\`\`\`python
import weakref

class Cache:
    def __init__(self):
        self._cache = weakref.WeakValueDictionary()
    
    def get(self, key, factory):
        if key in self._cache:
            return self._cache[key]
        obj = factory()
        self._cache[key] = obj
        return obj
\`\`\`

## 六、综合理解

### 6.1 Python 垃圾回收全景

\`\`\`
对象创建
  ↓
引用计数追踪
  ├── 计数归零 → 立即回收
  └── 循环引用 → 分代回收
       ├── 第 0 代（最频繁）
       ├── 第 1 代（中等）
       └── 第 2 代（最少）
\`\`\`

### 6.2 核心要点

1. **引用计数**是主要机制：计数归零，立即回收
2. **循环引用**是引用计数的盲区，需要**分代回收**解决
3. **分代回收**按对象年龄分代，新对象更容易被回收
4. **gc 模块**可以手动控制回收
5. **__del__** 是对象销毁时的回调，但不要依赖它
6. **weakref** 弱引用不增加计数，适合缓存场景

### 6.3 实践建议

- 尽量避免循环引用，或用 weakref 打破
- 不要在 \`__del__\` 中做重要清理，用 \`with\` 代替
- 大量创建对象时关注 gc 统计
- 理解引用计数，避免意外的内存泄漏

## 七、常见问题

**Q：Python 会内存泄漏吗？**

A：会。虽然 GC 解决了循环引用，但以下情况仍可能泄漏：
- C 扩展中的引用计数 bug
- 全局变量持有不再需要的对象
- 未关闭的文件/连接
- 循环引用 + \`__del__\`（Python 3.4 前的问题）

**Q：手动 gc.collect() 好吗？**

A：通常不需要。Python 会自动在合适时机回收。频繁手动调用反而影响性能。但在批处理后显式调用一次可以及时释放内存。

**Q：如何检测内存泄漏？**

A：用 \`gc.get_objects()\` 查看所有对象，或用 \`tracemalloc\` 模块追踪内存分配。

> 💡 本章代码用 gc 模块观察循环引用和回收过程，亲眼看看垃圾回收是怎么工作的。
    `,
    code: `
# =============================================================
# 垃圾回收：对象怎么被清理 —— 演示代码
# 演示：引用计数、循环引用、分代回收、gc 模块、__del__
# =============================================================

import sys  # 导入 sys 模块，用于查看引用计数
import gc  # 导入 gc 模块，用于垃圾回收控制
import weakref  # 导入 weakref 模块，用于弱引用

print("=" * 60)  # 打印分隔线
print("  垃圾回收：对象怎么被清理")  # 打印章节标题
print("=" * 60)  # 打印分隔线

# -------------------------------------------------------------
# 第一部分：引用计数演示
# -------------------------------------------------------------
print("\\n【第一部分】引用计数演示\\n")  # 打印第一部分标题

a = [1, 2, 3]  # 创建列表，引用计数 = 1
cnt1 = sys.getrefcount(a)  # 查看引用计数（传参会多 1）
print(f"  创建 a 后，refcnt = {cnt1}")  # 打印计数
b = a  # b 也引用，计数 +1
cnt2 = sys.getrefcount(a)  # 再次查看
print(f"  b = a 后，refcnt = {cnt2}（+1）")  # 打印变化
c = a  # c 也引用，计数 +1
cnt3 = sys.getrefcount(a)  # 再次查看
print(f"  c = a 后，refcnt = {cnt3}（+1）")  # 打印变化
del b  # 删除 b，计数 -1
cnt4 = sys.getrefcount(a)  # 查看删除后的计数
print(f"  del b 后，refcnt = {cnt4}（-1）")  # 打印变化
del c  # 删除 c，计数 -1
cnt5 = sys.getrefcount(a)  # 查看删除后的计数
print(f"  del c 后，refcnt = {cnt5}（-1）")  # 打印变化

# -------------------------------------------------------------
# 第二部分：循环引用问题
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  【第二部分】循环引用问题")  # 打印第二部分标题
print("=" * 60)  # 打印分隔线

class Node:  # 定义节点类
    def __init__(self, name):  # 初始化方法
        self.name = name  # 节点名称
        self.parent = None  # 父节点引用
        self.children = []  # 子节点列表
    def __repr__(self):  # 定义字符串表示
        return f"Node({self.name})"  # 返回节点描述

gc.collect()  # 先清理一次，确保干净
before_count = len(gc.get_objects())  # 记录回收前对象数
node_a = Node("A")  # 创建节点 A
node_b = Node("B")  # 创建节点 B
node_a.children.append(node_b)  # A 引用 B
node_b.parent = node_a  # B 引用 A（循环引用！）
print(f"  创建了循环引用: A ↔ B")  # 打印说明
print(f"  node_a 的 refcnt = {sys.getrefcount(node_a)}")  # 查看引用计数
del node_a  # 删除外部引用 a
del node_b  # 删除外部引用 b
print("  del node_a, node_b 后：")  # 打印提示
after_del = len(gc.get_objects())  # 记录删除后对象数
print(f"  对象数变化: {before_count} → {after_del}（循环引用未被回收！）")  # 打印结果
collected = gc.collect()  # 手动触发垃圾回收
print(f"  gc.collect() 回收了 {collected} 个对象")  # 打印回收数量
after_gc = len(gc.get_objects())  # 记录回收后对象数
print(f"  对象数变化: {after_del} → {after_gc}（循环引用被清理了！）")  # 打印结果

# -------------------------------------------------------------
# 第三部分：分代回收统计
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  【第三部分】分代回收统计")  # 打印第三部分标题
print("=" * 60)  # 打印分隔线

thresholds = gc.get_threshold()  # 获取回收阈值
print(f"  回收阈值: {thresholds}")  # 打印阈值 (700, 10, 10)
print(f"  第0代阈值: {thresholds[0]}（分配数-释放数超过此值触发）")  # 解释第0代
print(f"  第1代阈值: {thresholds[1]}（第0代回收超过此次数触发）")  # 解释第1代
print(f"  第2代阈值: {thresholds[2]}（第1代回收超过此次数触发）")  # 解释第2代
stats = gc.get_stats()  # 获取回收统计
print(f"\\n  各代回收统计：")  # 打印小标题
for i, stat in enumerate(stats):  # 遍历每代统计
    print(f"    第{i}代: 回收{stat['collections']}次, "  # 打印回收次数
          f"清理{stat['collected']}个对象, "  # 打印清理对象数
          f"不可回收{stat['uncollectable']}个")  # 打印不可回收数

# -------------------------------------------------------------
# 第四部分：__del__ 方法演示
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  【第四部分】__del__ 方法演示")  # 打印第四部分标题
print("=" * 60)  # 打印分隔线

class TempFile:  # 定义临时文件类
    def __init__(self, filename):  # 初始化方法
        self.filename = filename  # 文件名
        print(f"  [{self.filename}] 创建")  # 打印创建信息
    def __del__(self):  # 析构方法（对象销毁时调用）
        print(f"  [{self.filename}] 被销毁")  # 打印销毁信息
    def read(self):  # 读方法
        return f"{self.filename} 的内容"  # 返回内容
print("  创建对象：")  # 打印提示
f1 = TempFile("data.txt")  # 创建对象
f2 = TempFile("config.txt")  # 再创建一个
print("  删除 f1：")  # 打印提示
del f1  # 删除 f1，触发 __del__
print("  删除 f2：")  # 打印提示
del f2  # 删除 f2，触发 __del__

# -------------------------------------------------------------
# 第五部分：弱引用 weakref
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  【第五部分】弱引用 weakref")  # 打印第五部分标题
print("=" * 60)  # 打印分隔线

class Data:  # 定义数据类
    def __init__(self, val):  # 初始化方法
        self.value = val  # 数据值
    def __repr__(self):  # 字符串表示
        return f"Data({self.value})"  # 返回描述
obj = Data(42)  # 创建强引用对象
weak_ref = weakref.ref(obj)  # 创建弱引用（不增加引用计数）
print(f"  原始对象: {obj}")  # 打印原始对象
print(f"  弱引用访问: {weak_ref()}")  # 通过弱引用访问对象
strong_count = sys.getrefcount(obj)  # 查看引用计数
print(f"  引用计数: {strong_count}（弱引用不增加计数）")  # 打印计数
del obj  # 删除强引用
print(f"  del obj 后，弱引用访问: {weak_ref()}")  # 打印 None（对象已回收）
print("  → 弱引用不阻止对象被回收")  # 解释结论

# -------------------------------------------------------------
# 第六部分：手动控制 gc
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  【第六部分】手动控制 gc")  # 打印第六部分标题
print("=" * 60)  # 打印分隔线

gc.enable()  # 确保自动回收开启
print(f"  自动回收开启: {gc.isenabled()}")  # 打印状态
print("  创建一批临时对象...")  # 打印提示
temp_list = [[i] for i in range(1000)]  # 创建 1000 个临时列表
del temp_list  # 删除它们
collected = gc.collect()  # 手动触发回收
print(f"  gc.collect() 回收了 {collected} 个对象")  # 打印回收数
gc_stats = gc.get_count()  # 获取当前各代计数
print(f"  各代当前计数: {gc_stats}")  # 打印计数

# -------------------------------------------------------------
# 总结
# -------------------------------------------------------------
print("\\n" + "=" * 60)  # 打印分隔线
print("  🎯 本章总结")  # 打印总结标题
print("=" * 60)  # 打印分隔线
print("""
  1. 引用计数是主要机制：计数归零，立即回收
  2. 循环引用是引用计数的盲区，需要分代回收解决
  3. 分代回收按对象年龄分代，新对象更容易被回收
  4. gc 模块可以手动控制和观察回收过程
  5. __del__ 是对象销毁回调，但不要依赖它做重要清理
  6. weakref 弱引用不增加计数，适合缓存场景
""")  # 打印总结内容
`,
  },
];
