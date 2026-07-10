// =============================================================
// Python 模块与包教程（pymod）—— 第一批章节（模块基础 + 包与导入，共 7 章）
// -------------------------------------------------------------
// 本教程系统讲解 Python 的模块与包机制，是组织大型代码的基础。
// 包含以下章节：
//   模块基础组：
//     1. py-mod-intro      — 模块入门
//     2. py-mod-import     — import 语句详解
//     3. py-mod-search     — 模块搜索路径
//     4. py-mod-attributes — 模块属性
//   包与导入组：
//     5. py-pkg-intro      — 包入门
//     6. py-pkg-relative   — 相对导入与绝对导入
//     7. py-pkg-namespace  — 命名空间包
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细讲解（文字量大，含大量 demo）
//   code    : 可运行、带详细中文注释的 Python 示例代码
//
// 代码运行环境约束：
//   - 用 python3 直接运行，5 秒超时
//   - 仅使用 Python 标准库（不能用 numpy/requests 等第三方库）
//   - 通过 print 输出结果
//   - 代码必须是单文件可独立运行的脚本
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：模块入门
  // =========================================================
  {
    id: "py-mod-intro",
    group: "模块基础",
    icon: "📦",
    title: "模块入门",
    content: `## 什么是模块？

在 Python 中，**模块（module）** 是组织代码的基本单位。最直接的理解是：**一个 \`\\\`.py\` 文件就是一个模块**。当你把一段相关的代码写进 \`mymod.py\`，就创建了一个名为 \`mymod\` 的模块，其他程序可以通过 \`import mymod\` 来复用它。

\`\`\`python
# 文件：greet.py
def hello(name):
    return f"你好，{name}！"

PI = 3.14159
\`\`\`

在另一个文件里使用：

\`\`\`python
# 文件：main.py
import greet                # 导入 greet 模块
print(greet.hello("小明"))   # 调用模块里的函数
print(greet.PI)              # 访问模块里的变量
\`\`\`

这就是模块最朴素的用法：**把代码分文件存放，通过 import 互相调用**。模块名就是文件名去掉 \`.py\` 后缀。

### 为什么需要模块？

如果没有模块机制，所有代码都得写在一个文件里，这在大项目里是不可想象的。模块解决了四个核心问题：

| 问题 | 模块如何解决 |
| --- | --- |
| **代码复用** | 把通用功能写进模块，多个程序 import 同一个模块即可复用 |
| **命名空间隔离** | 模块自带命名空间，\`moduleA.foo\` 和 \`moduleB.foo\` 互不冲突 |
| **可维护性** | 按功能拆分到不同文件，单个文件不会膨胀到几千行 |
| **协作开发** | 不同人负责不同模块，通过 import 组装，避免改同一个文件冲突 |

#### 1. 代码复用

你在 \`utils.py\` 写了一个格式化日期的函数，项目里十几个脚本都需要它，只要 \`import utils\` 就行，不需要复制粘贴。

#### 2. 命名空间隔离

两个模块都可以定义 \`process()\` 函数：

\`\`\`python
import image_utils
import text_utils
image_utils.process()   # 处理图片
text_utils.process()    # 处理文本
\`\`\`

因为名字前面带了模块名前缀，所以不会冲突。模块本身就是天然的命名空间。

#### 3. 可维护性

把一个 5000 行的 \`app.py\` 拆成 \`models.py\`、\`views.py\`、\`routes.py\`、\`utils.py\`，每个文件职责单一，读起来、改起来都轻松得多。

#### 4. 协作开发

团队里小张负责 \`auth.py\`，小李负责 \`payment.py\`，两人各自维护各自文件，通过 import 互相调用，git 合并时几乎不会冲突。

### 模块的三种来源

Python 中能 import 的模块有三类来源：

| 来源 | 说明 | 例子 | 安装方式 |
| --- | --- | --- | --- |
| **标准库模块** | Python 自带，装好 Python 就能用 | \`os\`、\`sys\`、\`math\`、\`json\`、\`re\` | 随 Python 安装 |
| **第三方模块** | 社区开发，发布在 PyPI | \`requests\`、\`numpy\`、\`flask\` | \`pip install xxx\` |
| **自定义模块** | 你自己写的 \`.py\` 文件 | \`greet\`、\`utils\` | 自己写 |

标准库模块最方便，开箱即用，所以有"**batteries included（自带电池）**"的说法。本教程的演示代码全部使用标准库，保证在沙箱里能直接跑。

### 模块的物理形式

模块在磁盘上不一定是 \`.py\` 源文件，它有多种物理形式：

| 形式 | 扩展名 | 说明 |
| --- | --- | --- |
| **源文件** | \`.py\` | 最常见，文本形式，人能读 |
| **字节码缓存** | \`.pyc\` | 源码编译后的字节码，加载更快，存在 \`__pycache__\` 里 |
| **C 扩展** | \`.so\`（Linux/macOS）、\`.pyd\`（Windows） | 用 C 编写编译成的共享库，性能高 |
| **内置模块** | 无文件 | 编译进解释器，如 \`sys\`、\`builtins\`，没有 \`__file__\` |

\`\`\`bash
# 查看 Python 安装目录下的标准库 .py 文件
$ python3 -c "import os; print(os.__file__)"
# 查看 __pycache__ 里的字节码
$ ls __pycache__/
\`\`\`

内置模块比较特殊，它们没有对应的磁盘文件，是直接编进解释器里的：

\`\`\`python
import sys
print('sys' in sys.builtin_module_names)   # True，sys 是内置模块
import math
print('math' in sys.builtin_module_names)  # True，math 也是内置模块
\`\`\`

### 模块的执行特性：导入即执行，且只执行一次

这是模块最关键也最容易踩坑的特性：**第一次 import 一个模块时，会从头到尾执行该模块的顶层代码（不在函数/类里的代码），然后把模块对象缓存起来；之后再 import 同一个模块，直接返回缓存对象，顶层代码不再执行**。

\`\`\`python
# 文件：counter.py
print("counter 模块被加载了！")
count = 0

def inc():
    global count
    count += 1
    return count
\`\`\`

\`\`\`python
# 文件：main.py
import counter   # 打印 "counter 模块被加载了！"
import counter   # 不打印，因为已缓存
import counter   # 还是不打印
print(counter.count)   # 0
\`\`\`

无论 import 多少次，\`counter.py\` 里的 \`print("counter 模块被加载了！")\` 只执行一次。这个缓存存放在 \`sys.modules\` 字典里。

#### 为什么要"只执行一次"？

1. **性能**：避免重复加载和执行，导入开销只付一次。
2. **一致性**：保证整个程序里同一个模块是同一个对象（单例），模块里定义的状态（如全局变量）能被所有引用方共享。

#### 单例性的副作用

因为模块是单例，模块顶层的可变对象会被所有 import 它的代码共享，修改它会影响全局：

\`\`\`python
# 文件：config.py
settings = {"debug": False}

# 文件：a.py
import config
config.settings["debug"] = True   # 改了！

# 文件：b.py
import config
print(config.settings["debug"])   # True，能看到 a.py 的修改
\`\`\`

这既是便利也是陷阱：模块级状态可以当"全局配置"用，但被多方修改时容易出 bug。

### 模块是单例对象

一个模块在整个 Python 进程中**只有一个实例**。可以用 \`id()\` 验证：

\`\`\`python
import math
import math as m2     # 别名导入
print(math is m2)     # True，是同一个对象
print(id(math) == id(m2))   # True
\`\`\`

\`is\` 运算符判断两个变量是否指向同一对象。模块的"同一性"是 import 系统的核心保证。

### 模块作为命名空间

模块对象内部维护着一个字典 \`__dict__\`，存放模块里定义的所有名字（变量、函数、类）。访问 \`module.name\` 本质上是从这个字典里取值。

\`\`\`python
import math
print(math.__dict__["pi"])   # 3.141592653589793，等价于 math.pi
print(math.pi is math.__dict__["pi"])   # True
\`\`\`

模块的名字不会"泄漏"到导入方：你 \`import math\` 后，\`math\` 这个名字进入了你的命名空间，但 \`math\` 里的 \`pi\`、\`sin\` 等并没有，必须通过 \`math.pi\` 访问。这就实现了命名空间隔离。

### import 语句的最简形式

最简单的导入：

\`\`\`python
import math
print(math.sqrt(2))
\`\`\`

这一行做了三件事：
1. 在 \`sys.modules\` 查找 \`math\`，没有就找到源码/内置模块并加载执行；
2. 把模块对象存入 \`sys.modules["math"]\` 缓存；
3. 在当前命名空间绑定名字 \`math\` 指向该模块对象。

后续章节会详细展开 import 的四种形式和搜索机制。

### 与其他语言的对比

理解 Python 模块时，对比其他语言能更清晰：

| 语言 | 代码组织单位 | 引入方式 | 特点 |
| --- | --- | --- | --- |
| **C** | 头文件 \`.h\` + 源文件 \`.c\` | \`#include "header.h"\` | 预处理期**文本展开**，没有模块概念（C23 才引入） |
| **Java** | 类（\`public class\`），包（package） | \`import java.util.List;\` | 引入的是类名，一个文件一个 public 类 |
| **Node.js** | 模块（一个文件） | \`require('./mod')\` / \`import\` | CommonJS 是运行时加载，ESM 是静态加载 |
| **Python** | 模块（一个 \`.py\` 文件） | \`import mod\` | 运行时加载，导入即执行，单例缓存 |

C 的 \`#include\` 是**文本复制**，所以同一个头文件被 include 多次要用 \`#ifndef\` 守卫；Python 的 import 天然有 \`sys.modules\` 缓存，多次 import 同一模块不会重复执行，无需手动守卫。

Java 的 import 只是**引入类名的简写**，不执行代码；Python 的 import 会**执行模块顶层代码**，这是本质区别。

Node.js 的 \`require\` 和 Python 的 import 最像：都有缓存（Node 的 \`require.cache\` 对应 Python 的 \`sys.modules\`），都是单例。

### 本章小结

- 模块 = 一个 \`.py\` 文件，是 Python 组织代码的基本单位。
- 模块解决复用、命名空间、维护、协作四大问题。
- 模块有四种物理形式：\`.py\`、\`.pyc\`、C 扩展、内置模块。
- **导入即执行顶层代码，且只执行一次**（因为有 \`sys.modules\` 缓存）。
- 模块是单例对象，整个进程里只有一个实例。
- 模块自身是一个命名空间，名字通过 \`module.name\` 访问。

下面运行示例代码，亲手验证这些概念。`,
    code: `# -*- coding: utf-8 -*-
# 第一章演示代码：模块入门
# 验证模块是对象、是单例、有命名空间、可手动构造等核心概念

import sys
import os
import math
import types

print("===== 1. 模块就是一个对象 =====")
# 模块在 Python 里是一等对象，可以用 type() 查看类型
print("type(math) =", type(math))
print("type(os)    =", type(os))
print("type(sys)   =", type(sys))
# 所有模块的类型都是 module
print("math 的类型名 =", type(math).__name__)

print("\\n===== 2. 模块是单例（核心特性）=====")
# 无论 import 多少次，同一个模块在进程里只有一个实例
import math as math_alias       # 用别名再导入一次
print("math is math_alias:", math is math_alias)
print("id(math)     =", id(math))
print("id(math_alias) =", id(math_alias))
print("id 相同:", id(math) == id(math_alias))
# sys.modules 就是这个单例缓存的字典
print("sys.modules['math'] is math:", sys.modules["math"] is math)

print("\\n===== 3. 模块的常用属性 =====")
print("math.__name__ =", math.__name__)          # 模块全名
print("os.__file__   =", os.__file__)            # 源文件路径
print("math.__doc__ 前60字:")
print(" ", (math.__doc__ or "")[:60], "...")     # 文档字符串
# 内置模块（如 sys）没有 __file__
print("sys 是否内置模块:", 'sys' in sys.builtin_module_names)
print("sys 有 __file__ 吗:", hasattr(sys, "__file__"))

print("\\n===== 4. 用 types.ModuleType 手动创建模块对象 =====")
# 模块可以用代码凭空构造，不一定来自 .py 文件
mymod = types.ModuleType("mymod")          # 创建一个名为 mymod 的模块对象
mymod.__doc__ = "我手动创建的模块，演示模块的本质"
mymod.PI = 3.14159                          # 往模块里塞变量
mymod.greet = lambda name: f"你好，{name}！"  # 往模块里塞函数
mymod.items = [1, 2, 3]                     # 往模块里塞可变对象

print("type(mymod) =", type(mymod))
print("mymod.__name__ =", mymod.__name__)
print("mymod.PI =", mymod.PI)
print("mymod.greet('世界') =", mymod.greet("世界"))

print("\\n===== 5. 把手动创建的模块注册到 sys.modules =====")
# 注册到 sys.modules 后，就能用 import 语句导入它了
sys.modules["mymod"] = mymod
import mymod    # 此时不会再去找 mymod.py，直接用 sys.modules 里的缓存
print("import 后仍是同一对象:", mymod is sys.modules["mymod"])
print("mymod.greet('Python') =", mymod.greet("Python"))

print("\\n===== 6. 模块是命名空间（不会污染全局）=====")
# 模块里的名字通过 module.name 访问，不会进到全局命名空间
mymod.x = 999
print("'x' 在 globals() 里吗:", "x" in globals())      # False，x 在模块里
print("'mymod' 在 globals() 里吗:", "mymod" in globals())  # True，模块名在
print("访问 mymod.x =", mymod.x)
# 模块的 __dict__ 就是它的命名空间字典
print("mymod.__dict__ 里的部分键:", [k for k in mymod.__dict__ if not k.startswith("__")][:6])

print("\\n===== 7. 模块的三种来源演示 =====")
print("标准库模块 math，来自:", math.__file__)
print("内置模块 sys（编译进解释器，无 __file__）")
# 手动构造的模块也是一种"来源"
print("手动构造的模块 mymod，无 __file__:", not hasattr(mymod, "__file__"))

print("\\n===== 8. 单例的副作用：共享可变状态 =====")
# 演示模块级可变对象被多方共享
config = types.ModuleType("shared_config")
config.settings = {"debug": False}
sys.modules["shared_config"] = config

import shared_config as c1   # 模拟 a.py 导入
import shared_config as c2   # 模拟 b.py 导入
c1.settings["debug"] = True  # c1 修改了
print("c2 看到的 settings:", c2.settings)         # c2 能看到修改
print("c1.settings is c2.settings:", c1.settings is c2.settings)  # 同一对象
print("-> 这就是模块单例带来的共享副作用")

print("\\n模块入门演示完成！")
`,
  },

  // =========================================================
  // 第二章：import 语句详解
  // =========================================================
  {
    id: "py-mod-import",
    group: "模块基础",
    icon: "📥",
    title: "import 语句详解",
    content: `## import 的四种形式

Python 提供了四种导入模块的形式，分别对应不同的使用场景：

\`\`\`python
# 形式一：导入整个模块
import 模块名

# 形式二：导入模块并起别名
import 模块名 as 别名

# 形式三：从模块导入特定名字
from 模块名 import 名字1, 名字2

# 形式四：导入模块的所有公开名字
from 模块名 import *
\`\`\`

下面逐一详解。

### 形式一：\`import mod\`

把**模块对象**绑定到当前命名空间。使用模块里的东西必须加模块名前缀。

\`\`\`python
import os
print(os.getcwd())        # 通过 os. 前缀访问
print(os.path.join("a", "b"))
\`\`\`

执行后，当前命名空间里多了一个名字 \`os\`，指向 os 模块对象。可以用 \`locals()\` 查看：

\`\`\`python
import os
print('os' in locals())   # True
\`\`\`

**优点**：名字来源清晰，不会和当前作用域的名字冲突。
**缺点**：每次访问都要写前缀，长名字略繁琐。

### 形式二：\`import mod as alias\`

给模块起个简短或避开冲突的别名。

\`\`\`python
import numpy as np                # 业界约定俗成的别名
import xml.etree.ElementTree as ET  # 简化长模块名
import myutils as mu
\`\`\`

别名绑定的是**同一个模块对象**，只是换了个名字：

\`\`\`python
import math
import math as m
print(m is math)   # True
\`\`\`

\`as\` 解决两类问题：
1. **简化长名**：\`xml.etree.ElementTree\` → \`ET\`。
2. **避免冲突**：两个模块都有同名函数，可以给其中一个起别名。

### 形式三：\`from mod import name\`

把模块里的**特定名字**直接绑定到当前命名空间，用的时候**不加模块前缀**。

\`\`\`python
from os import getcwd, listdir
print(getcwd())        # 直接用，不用 os.
print(listdir("."))
\`\`\`

执行后，当前命名空间里有 \`getcwd\`、\`listdir\`，但**没有 \`os\`**：

\`\`\`python
from os import getcwd
print('getcwd' in locals())   # True
print('os' in locals())       # False，os 没被绑定
\`\`\`

可以一次导入多个名字：

\`\`\`python
from os.path import join, dirname, basename, exists
\`\`\`

也可以给导入的名字起别名：

\`\`\`python
from os import getcwd as pwd
print(pwd())
\`\`\`

#### from import 的陷阱：可变对象

\`from mod import name\` 绑定的是**对象引用**，不是"魔法链接"。如果导入的是可变对象并修改它，原模块里的对象也会变（因为本来就是同一个）：

\`\`\`python
# 文件：data.py
items = [1, 2, 3]

# 文件：main.py
from data import items
items.append(4)
print(items)              # [1, 2, 3, 4]
import data
print(data.items)         # [1, 2, 3, 4]，原模块也变了！
\`\`\`

但如果重新赋值（不是修改）：

\`\`\`python
from data import items
items = [100]             # 重新绑定到新对象
import data
print(data.items)         # [1, 2, 3]，原模块没变
\`\`\`

**关键区别**：\`items.append()\` 是**修改对象**，影响所有引用；\`items = [100]\` 是**重新绑定名字**，只改变当前命名空间。

### 形式四：\`from mod import *\`

导入模块的**所有公开名字**。这里的"公开"受 \`__all__\` 控制：

- 如果模块定义了 \`__all__ = ["foo", "bar"]\`，则只导入 \`foo\`、\`bar\`。
- 如果没有 \`__all__\`，则导入所有**不以 \`_\` 开头**的名字。

\`\`\`python
# 文件：mymod.py
__all__ = ["public_func"]    # 显式声明公开 API

public_func = lambda: "公开"
_helper = lambda: "私有"      # 不在 __all__ 里
also_public = lambda: "也公开"  # 不在 __all__ 里，import * 不会导入

# 文件：main.py
from mymod import *
print(public_func())   # OK
print(_helper())       # NameError，未导入
print(also_public())   # NameError，未导入（被 __all__ 限制）
\`\`\`

#### 为什么不推荐 \`import *\`？

1. **污染命名空间**：导入一堆名字，可能和你自己的变量冲突。
2. **可读性差**：看到一个名字不知道从哪来的。
3. **难以追踪**：IDE 也无法静态分析名字来源。

PEP 8 明确建议**避免在顶层使用 \`from mod import *\`**，只在交互式解释器里为了方便偶尔用用。模块作者应该用 \`__all__\` 明确公开 API，这样即使用 \`import *\` 也只导出受控的名字。

### import 与 from 的本质区别

很多人混淆 \`import\` 和 \`from import\`，其实它们绑定的东西不同：

| 语句 | 绑定到当前命名空间的是 | 访问模块内名字的方式 |
| --- | --- | --- |
| \`import mod\` | **模块对象** \`mod\` | \`mod.name\`（带前缀） |
| \`from mod import name\` | **模块内的具体对象** \`name\` | 直接 \`name\`（无前缀） |
| \`from mod import *\` | 模块内**所有公开对象** | 直接用名字 |

看一个对比：

\`\`\`python
import json
print(json)            # <module 'json'>，json 是模块对象
print(json.dumps)      # 通过模块访问函数

from json import dumps
print(dumps)           # <function dumps>，dumps 是函数对象本身
# print(json)          # NameError，json 没被绑定
\`\`\`

### importlib.import_module：动态导入

除了 \`import\` 语句，还可以用 \`importlib.import_module(name)\` 动态导入，模块名是字符串，可以运行时决定：

\`\`\`python
import importlib
mod_name = "json"           # 可以是变量、用户输入等
m = importlib.import_module(mod_name)
print(m.dumps({"a": 1}))    # 和 import json 等价
\`\`\`

它和 \`import\` 语句完全等价，都会查 \`sys.modules\` 缓存、执行模块、返回模块对象。区别只是模块名可以是动态字符串，适合插件系统、按配置加载等场景。

\`\`\`python
# 动态导入子模块
m = importlib.import_module("os.path")
print(m.join("a", "b"))     # a/b
\`\`\`

### 模块内函数如何访问同模块的名字

模块内的函数访问同模块的其他名字时，用的是模块的命名空间（\`__dict__\`），不是导入方的命名空间：

\`\`\`python
# 文件：calc.py
PI = 3.14159
def area(r):
    return PI * r * r    # 直接用 PI，因为是同模块的名字
\`\`\`

即使导入方 \`from calc import area\`，\`area\` 内部依然能访问 \`calc.PI\`，因为函数定义时绑定了 \`calc\` 模块的 \`__dict__\` 作为全局作用域。这是"闭包式"的全局查找机制。

### 本章小结

| 形式 | 用法 | 何时用 |
| --- | --- | --- |
| \`import mod\` | \`os.getcwd()\` | 默认推荐，前缀清晰 |
| \`import mod as a\` | \`np.array()\` | 长名简化、避免冲突 |
| \`from mod import name\` | \`getcwd()\` | 常用函数免去前缀 |
| \`from mod import *\` | 尽量别用 | 仅交互式临时用 |

- \`import\` 绑定模块对象，\`from import\` 绑定模块内对象。
- \`from import\` 可变对象有副作用陷阱。
- \`import *\` 受 \`__all__\` 控制，不推荐日常使用。
- \`importlib.import_module\` 用于动态导入。

下面运行代码，亲手验证这些绑定行为。`,
    code: `# -*- coding: utf-8 -*-
# 第二章演示代码：import 语句详解
# 演示四种导入形式，对比它们对命名空间的不同影响

import sys
import os
import types
import importlib

print("===== 1. import os 后 os 在命名空间里 =====")
import os                      # 形式一
print("'os' in locals():", "os" in locals())
print("os.getcwd() =", os.getcwd())

print("\\n===== 2. from os import getcwd 后 getcwd 在、os 不在 =====")
from os import getcwd          # 形式三
print("'getcwd' in locals():", "getcwd" in locals())
print("'os' still in locals():", "os" in locals())   # os 之前已导入，所以还在
print("getcwd() =", getcwd())

print("\\n===== 3. from os.path import join（从子模块导入名字）=====")
from os.path import join, dirname, basename
print("join('a','b','c')    =", join("a", "b", "c"))
print("dirname('/usr/bin/python') =", dirname("/usr/bin/python"))
print("basename('/usr/bin/python') =", basename("/usr/bin/python"))

print("\\n===== 4. as 别名（形式二）=====")
import os as myos              # 给模块起别名
print("myos.getcwd() =", myos.getcwd())
print("myos is os:", myos is os)         # 同一对象
from os import getcwd as pwd   # 给导入的名字起别名
print("pwd() =", pwd())
print("pwd is getcwd:", pwd is getcwd)

print("\\n===== 5. importlib.import_module 等价于 import =====")
m = importlib.import_module("os.path")   # 动态导入，模块名是字符串
print("type(m) =", type(m).__name__)
print("m.join('x','y') =", m.join("x", "y"))
# 和 import os.path 后的 os.path 是同一对象
import os.path
print("m is os.path:", m is os.path)

print("\\n===== 6. 对比 import 和 from import 的 locals() =====")
# 清理一下，重新演示
ns_before = set(globals().keys())
import json                   # import 形式
ns_after_import = set(globals().keys())
print("import json 新增的名字:", sorted(ns_after_import - ns_before))
# from json import dumps 会把 dumps 加进命名空间，但 json 已经在了
from json import dumps, loads
ns_after_from = set(globals().keys())
print("from json import dumps, loads 后新增:", sorted(ns_after_from - ns_after_import))
print("dumps({'a':1}) =", dumps({"a": 1}))

print("\\n===== 7. from import * 的行为（受 __all__ 控制）=====")
# 动态创建一个带 __all__ 的模块来观察 import * 的效果
demo = types.ModuleType("star_demo")
demo.public_a = "公开A"
demo.public_b = "公开B"
demo._private = "私有"
demo.helper = "辅助"        # 不在 __all__ 里
demo.__all__ = ["public_a", "public_b"]   # 只导出这两个
sys.modules["star_demo"] = demo

# 用 exec 在干净命名空间里执行 from star_demo import *
ns = {}
exec("from star_demo import *", ns)
exported = sorted(k for k in ns if not k.startswith("_"))
print("from star_demo import * 导出的名字:", exported)
print("public_a 是否导出:", "public_a" in ns)
print("public_b 是否导出:", "public_b" in ns)
print("helper 是否导出（不在 __all__）:", "helper" in ns)
print("->_private 是否导出（下划线开头）:", "_private" in ns)

print("\\n===== 8. 没有定义 __all__ 时 import * 的行为 =====")
demo2 = types.ModuleType("star_demo2")
demo2.visible = "可见"
demo2.also_visible = "也可见"
demo2._hidden = "隐藏"
sys.modules["star_demo2"] = demo2
# 没有 __all__，则导入所有不以 _ 开头的名字
ns2 = {}
exec("from star_demo2 import *", ns2)
exported2 = sorted(k for k in ns2 if not k.startswith("_"))
print("无 __all__ 时导出的名字:", exported2)
print("->_hidden 是否导出:", "_hidden" in ns2)

print("\\n===== 9. from import 可变对象的副作用 =====")
# 创建一个带列表的模块，演示修改可变对象的影响
modlist = types.ModuleType("modlist")
modlist.items = [1, 2, 3]
sys.modules["modlist"] = modlist

from modlist import items     # 导入列表对象
print("导入时 items =", items)
items.append(4)               # 修改可变对象
print("修改后 modlist.items =", modlist.items)   # 原模块也变了
print("同一对象:", items is modlist.items)
print("-> 修改可变对象会影响原模块，因为是同一对象")

print("\\n===== 10. 重新赋值不影响原模块 =====")
items = [100]                 # 重新绑定到新对象（不是修改）
print("重新赋值后 items =", items)
print("modlist.items 仍是:", modlist.items)   # 原模块没变
print("-> 重新赋值只改变当前命名空间，原模块不受影响")

print("\\nimport 语句详解演示完成！")
`,
  },

  // =========================================================
  // 第三章：模块搜索路径
  // =========================================================
  {
    id: "py-mod-search",
    group: "模块基础",
    icon: "🔍",
    title: "模块搜索路径",
    content: `## import 时 Python 去哪里找模块？

当你写 \`import foo\` 时，Python 不是漫无目的地在整个磁盘上找 \`foo.py\`，而是按一套明确的顺序查找。理解这个顺序，是解决"明明文件就在那儿却 import 报错"的关键。

### 查找顺序（四步走）

Python 的 import 机制按以下顺序查找模块：

\`\`\`
1. sys.modules 缓存    ← 已加载过的模块直接返回
2. 内置模块            ← sys.builtin_module_names 里的模块
3. sys.path 冻结路径   ← 解释器内置的搜索路径
4. sys.path 动态路径   ← 运行时拼接的搜索路径
\`\`\`

| 顺序 | 来源 | 说明 |
| --- | --- | --- |
| 1 | \`sys.modules\` | 字典缓存，命中直接返回，不再查找 |
| 2 | 内置模块 | 编译进解释器，如 \`sys\`、\`math\`、\`builtins\` |
| 3 | 冻结路径 | CPython 启动时固化的标准库路径 |
| 4 | 动态路径 | 脚本目录 + \`PYTHONPATH\` + site-packages |

**关键点**：一旦在某一步找到，就不再继续。所以如果你在脚本目录建了一个 \`math.py\`，标准库的 \`math\` 不会被屏蔽（因为内置模块优先级更高），但如果你建了 \`json.py\`，可能就会屏蔽标准库 \`json\`（因为 json 不是内置模块，按 sys.path 顺序找，脚本目录通常在最前）。

### sys.modules：模块缓存

\`sys.modules\` 是一个字典，记录所有已加载的模块。第一次 import 某模块时，加载完成后会写入这个字典；之后再 import，直接从字典取，不再执行模块代码。

\`\`\`python
import sys
print(type(sys.modules))            # <class 'dict'>
print(len(sys.modules))             # 已经加载的模块数量
print('os' in sys.modules)          # True（import 过 os）
print(sys.modules['os'])            # <module 'os' ...>
\`\`\`

这解释了为什么模块顶层代码只执行一次。如果你想"重新加载"模块（开发时改了代码），要用 \`importlib.reload()\`：

\`\`\`python
import importlib
import mymod
importlib.reload(mymod)    # 重新执行 mymod 顶层代码
\`\`\`

注意 \`reload\` 只在交互式开发调试时用，生产代码几乎不用。

### 内置模块：sys.builtin_module_names

\`sys.builtin_module_names\` 是一个元组，列出所有编译进解释器的模块：

\`\`\`python
import sys
print(sys.builtin_module_names)
# ('_abc', '_ast', '_codecs', '_collections', '_functools', '_io',
#  '_operator', '_signal', '_sre', '_stat', '_string', '_thread',
#  '_tracemalloc', '_warnings', '_weakref', 'atexit', 'builtins',
#  'errno', 'gc', 'imp', 'itertools', 'marshal', 'math', 'posix',
#  'pwd', 'sys', 'time', ...)
\`\`\`

这些模块没有对应的 \`.py\` 文件，\`__file__\` 属性也不存在。它们用 C 写成，编译进解释器，导入极快。

### sys.path：动态搜索路径

\`sys.path\` 是一个列表，决定了 Python 去哪些目录找模块。它的组成（按顺序）：

\`\`\`
1. 当前脚本所在目录（或交互式解释器的当前工作目录）
2. PYTHONPATH 环境变量里的目录（用冒号分隔）
3. 安装时写入的默认目录（标准库所在）
4. site-packages 目录（pip 装的第三方包在这）
\`\`\`

\`\`\`python
import sys
for i, p in enumerate(sys.path):
    print(i, p)
\`\`\`

典型输出：

\`\`\`bash
0 /Users/me/project          # 脚本所在目录
1 /opt/homebrew/lib/python3.13/site-packages  # site-packages
2 /opt/homebrew/Cellar/python/3.13/lib/python3.13  # 标准库
...
\`\`\`

#### sys.path 的特点

- 它是**列表**，可以运行时修改：\`sys.path.append("/my/libs")\`、\`sys.path.insert(0, "/my/libs")\`。
- **insert(0, ...)** 把目录放到最前，优先级最高，可以用来"覆盖"已有模块。
- 修改只在当前进程有效，进程退出后失效。
- 永久修改要用 \`PYTHONPATH\` 环境变量或安装到 site-packages。

### PYTHONPATH 环境变量

\`PYTHONPATH\` 是环境变量，作用类似 shell 的 \`PATH\`，但专给 Python 用。它里面的目录会插入到 \`sys.path\` 中（在脚本目录之后、标准库之前）。

\`\`\`bash
# 临时设置
export PYTHONPATH=/Users/me/mylibs:/Users/me/another
python3 main.py

# 单次设置
PYTHONPATH=/Users/me/mylibs python3 main.py
\`\`\`

适合需要让多个脚本共享某个自定义模块目录、又不想改代码的场景。

### ModuleNotFoundError：找不到模块的报错

当模块在所有搜索路径里都找不到时，抛 \`ModuleNotFoundError\`（\`ImportError\` 的子类）：

\`\`\`python
try:
    import this_module_does_not_exist_xyz
except ModuleNotFoundError as e:
    print(e)   # No module named 'this_module_does_not_exist_xyz'
\`\`\`

常见原因：
1. 模块名拼错了。
2. 模块没安装（第三方库忘了 \`pip install\`）。
3. 模块文件不在 \`sys.path\` 里（路径问题）。
4. 虚拟环境没激活，找不到包。

### 包搜索与模块搜索的关系

包的查找和模块查找用的是**同一套机制**。当 import 一个包 \`mypkg.sub.mod\` 时：
1. 先在 \`sys.modules\` 找 \`mypkg\`；
2. 再按 \`sys.path\` 找 \`mypkg\` 目录（含 \`__init__.py\` 或命名空间包）；
3. 找到后，在 \`mypkg.__path__\` 指定的目录里找 \`sub\`；
4. 依此类推找 \`mod\`。

所以包内的子模块搜索用的是**包的 \`__path__\`**，而不是顶层 \`sys.path\`。这是包能形成层级命名空间的关键。

### site 模块和 site-packages

\`site\` 模块在 Python 启动时自动执行，负责：
- 把 \`site-packages\` 目录加入 \`sys.path\`；
- 处理 \`.pth\` 文件（额外的路径配置）；
- 设置一些默认编码。

\`pip install xxx\` 装的包就放在 \`site-packages\`，所以能被直接 import。可以用 \`site.getsitepackages()\` 查看具体位置：

\`\`\`python
import site
print(site.getsitepackages())
\`\`\`

启动时加 \`-S\` 参数（\`python3 -S script.py\`）会跳过 site 处理，得到一个"干净"的 \`sys.path\`，常用于排查环境问题。

### __pycache__ 和 .pyc 字节码缓存

第一次 import 一个 \`.py\` 模块时，CPython 会把它编译成字节码，存到 \`__pycache__/modulename.cpython-3x.pyc\`。下次 import 时，如果源码没改，直接加载 \`.pyc\`，跳过编译，加快启动。

\`\`\`bash
$ ls __pycache__/
mod1.cpython-313.pyc
mod2.cpython-313.pyc
\`\`\`

特点：
- \`.pyc\` 文件名带 Python 版本号，不同版本互不干扰。
- 源码修改后，下次 import 会重新编译。
- \`.pyc\` 只是缓存，删了无所谓，下次运行会重新生成。
- 内置模块和 C 扩展不需要 \`.pyc\`。

可以用 \`python3 -m compileall .\` 批量预编译目录下所有模块。

### 本章小结

- import 查找顺序：\`sys.modules\` → 内置模块 → \`sys.path\`。
- \`sys.modules\` 是已加载模块的缓存字典，保证单例和"只执行一次"。
- \`sys.builtin_module_names\` 列出编译进解释器的模块。
- \`sys.path\` 是动态搜索路径列表，由脚本目录、\`PYTHONPATH\`、标准库、site-packages 组成。
- 找不到模块抛 \`ModuleNotFoundError\`。
- \`__pycache__\` 存字节码缓存，加快重复导入。

下面运行代码，实地查看这些路径和缓存。`,
    code: `# -*- coding: utf-8 -*-
# 第三章演示代码：模块搜索路径
# 查看 sys.path / sys.modules / 内置模块，演示动态添加路径与找不到模块的报错

import sys
import os
import tempfile
import shutil

print("===== 1. sys.path 搜索路径 =====")
print("sys.path 共", len(sys.path), "个路径:")
for i, p in enumerate(sys.path):
    print(f"  [{i}] {p}")
print("-> 第 0 项通常是脚本所在目录或当前工作目录")

print("\\n===== 2. sys.builtin_module_names 内置模块 =====")
print("内置模块数量:", len(sys.builtin_module_names))
print("前 20 个内置模块:", sys.builtin_module_names[:20])
print("sys 是否内置:", "sys" in sys.builtin_module_names)
print("math 是否内置:", "math" in sys.builtin_module_names)
print("os 是否内置:", "os" in sys.builtin_module_names)   # False，os 是 .py 文件

print("\\n===== 3. sys.modules 已加载模块缓存 =====")
print("已加载模块总数:", len(sys.modules))
# 查看几个常见模块是否在缓存里
for name in ["os", "sys", "math", "json", "re"]:
    print(f"  {name} in sys.modules: {name in sys.modules}")
# 演示缓存命中：import 后 sys.modules 里就有
import json
print("import json 后 'json' in sys.modules:", "json" in sys.modules)
print("sys.modules['json'] =", sys.modules["json"])

print("\\n===== 4. ModuleNotFoundError 演示 =====")
# 尝试导入一个不存在的模块，捕获异常
try:
    import this_module_does_not_exist_xyz123
except ModuleNotFoundError as e:
    print(f"捕获到异常: {type(e).__name__}")
    print(f"错误信息: {e}")
    print(f"ModuleNotFoundError 是 ImportError 的子类:", issubclass(ModuleNotFoundError, ImportError))

print("\\n===== 5. 动态向 sys.path 添加路径并导入 =====")
# 用临时目录演示：创建一个模块文件，加入 sys.path，然后导入
tmpdir = tempfile.mkdtemp(prefix="searchdemo_")
print("创建临时目录:", tmpdir)

mod_path = os.path.join(tmpdir, "tmpmod.py")
with open(mod_path, "w", encoding="utf-8") as f:
    f.write('# 临时生成的模块\\n')
    f.write('GREETING = "我来自临时目录的模块"\\n')
    f.write('def hello(name):\\n')
    f.write('    return f"Hello, {name}! 来自 tmpmod"\\n')
    f.write('print("tmpmod 模块正在被加载执行...")\\n')

# 添加前确认模块不在
print("添加前 'tmpmod' in sys.modules:", "tmpmod" in sys.modules)
# 把临时目录加入搜索路径（插到最前，优先级最高）
sys.path.insert(0, tmpdir)
print("已将临时目录插入 sys.path[0]")

import tmpmod   # 现在能找到了
print("导入成功！")
print("tmpmod.GREETING =", tmpmod.GREETING)
print("tmpmod.hello('Python') =", tmpmod.hello("Python"))
print("tmpmod.__file__ =", tmpmod.__file__)
print("tmpmod 在 sys.modules:", "tmpmod" in sys.modules)

print("\\n===== 6. sys.modules 缓存验证（只执行一次）=====")
import tmpmod as tmp2   # 再次 import，不会重新执行（不会再次打印"正在被加载"）
print("两次导入是同一对象:", tmpmod is tmp2)
print("-> 注意上面没有再次打印 'tmpmod 模块正在被加载执行...'，因为命中了缓存")

print("\\n===== 7. __pycache__ 字节码缓存 =====")
pycache_dir = os.path.join(tmpdir, "__pycache__")
print("__pycache__ 目录是否存在:", os.path.exists(pycache_dir))
if os.path.exists(pycache_dir):
    files = os.listdir(pycache_dir)
    print("__pycache__ 内容:", files)
    print("-> .pyc 文件名带 Python 版本号，下次导入会直接用字节码加速")

print("\\n===== 8. 用 importlib.reload 重新加载模块 =====")
import importlib
# 修改源文件
with open(mod_path, "w", encoding="utf-8") as f:
    f.write('GREETING = "我已被修改过"\\n')
    f.write('def hello(name):\\n')
    f.write('    return f"Hi, {name}! 新版本"\\n')
    f.write('print("tmpmod 重新加载执行...")\\n')
# 清掉 __pycache__ 防止旧缓存
shutil.rmtree(pycache_dir, ignore_errors=True)
print("reload 前 GREETING:", tmpmod.GREETING)
importlib.reload(tmpmod)   # 重新执行顶层代码
print("reload 后 GREETING:", tmpmod.GREETING)

print("\\n===== 9. site-packages 与标准库位置 =====")
try:
    import site
    site_packages = site.getsitepackages()
    print("site-packages 目录:", site_packages)
except Exception as e:
    print("获取 site-packages 失败:", e)
# 标准库模块的位置
import json as _json
print("标准库 json 路径:", _json.__file__)

# 清理临时目录
shutil.rmtree(tmpdir, ignore_errors=True)
print("\\n模块搜索路径演示完成！")
`,
  },

  // =========================================================
  // 第四章：模块属性
  // =========================================================
  {
    id: "py-mod-attributes",
    group: "模块基础",
    icon: "🏷️",
    title: "模块属性",
    content: `## 模块的"双下划线"属性

每个模块对象都自带一组以双下划线包裹的特殊属性（dunder attributes），它们记录了模块的元信息。掌握这些属性，能让你更精准地操控模块系统。

### 属性总览

| 属性 | 含义 | 示例值 |
| --- | --- | --- |
| \`__name__\` | 模块全名；顶层执行时为 \`"__main__"\` | \`"os"\`、\`"__main__"\` |
| \`__file__\` | 源文件路径 | \`"/usr/lib/python3.13/os.py"\` |
| \`__doc__\` | 模块文档字符串 | 模块顶部三引号字符串 |
| \`__all__\` | 控制 \`from mod import *\` 的公开名单 | \`["foo", "bar"]\` |
| \`__dict__\` | 模块命名空间字典 | 包含所有定义的名字 |
| \`__package__\` | 所属包名（顶层模块为 \`None\` 或 \`""\`） | \`"os"\`、\`None\` |
| \`__spec__\` | 模块规格说明（ModuleSpec 对象） | \`ModuleSpec(...)\` |
| \`__loader__\` | 加载器对象 | \`SourceFileLoader(...)\` |
| \`__builtins__\` | 内置名字 | builtins 模块或其 dict |

下面逐个详解。

### __name__：模块的名字

\`__name__\` 是模块的全名字符串。导入的模块，\`__name__\` 就是模块名：

\`\`\`python
import os
print(os.__name__)      # 'os'
import os.path
print(os.path.__name__) # 'posixpath'（os.path 实际指向 posixpath 模块）
\`\`\`

对于**直接运行的脚本**，\`__name__\` 是 \`"__main__"\`。这就是著名的 \`if __name__ == "__main__":\` 惯用法的根源。

#### __name__ == "__main__" 惯用法

\`\`\`python
# 文件：mymath.py
def add(a, b):
    return a + b

def test():
    print("测试 add(2,3) =", add(2, 3))

if __name__ == "__main__":
    # 只有直接运行 mymath.py 时才执行
    # 被 import 时不执行
    test()
\`\`\`

- 直接运行 \`python mymath.py\`：\`__name__\` 是 \`"__main__"\`，执行 \`test()\`。
- 在别的文件 \`import mymath\`：\`mymath.__name__\` 是 \`"mymath"\`，不执行 \`test()\`。

这个惯用法让一个文件**既能当模块被导入，又能当脚本独立运行**，常用来放测试代码或命令行入口。

### __file__：源文件路径

\`__file__\` 指向模块的源文件（或字节码文件）：

\`\`\`python
import os
print(os.__file__)   # /usr/lib/python3.13/os.py
\`\`\`

注意：
- **内置模块**（如 \`sys\`、\`math\`）没有 \`__file__\`，因为是编译进解释器的。
- **命名空间包**没有 \`__file__\`（只有 \`__path__\`）。
- **手动构造的模块**（\`types.ModuleType\`）默认也没有 \`__file__\`，除非你手动设置。

\`\`\`python
import sys
print(hasattr(sys, '__file__'))   # False，sys 是内置模块
\`\`\`

### __doc__：文档字符串

模块顶部的第一个字符串字面量就是 \`__doc__\`：

\`\`\`python
# 文件：mymod.py
"""这是 mymod 模块的文档字符串。
说明这个模块是做什么的。
"""

def foo():
    """foo 的文档。"""
    pass

print(mymod.__doc__)   # 打印模块文档
print(mymod.foo.__doc__)  # 打印函数文档
\`\`\`

文档字符串可以被 \`help()\`、\`pydoc\`、IDE 提取，是 Python 自文档化的核心机制。养成给模块和函数写 \`__doc__\` 的习惯，非常重要。

### __all__：公开名单

\`__all__\` 是一个字符串列表，声明模块的"公开 API"。它影响两件事：

1. \`from mod import *\` 只导入 \`__all__\` 里列的名字。
2. 一些工具（如 \`pydoc\`）用它判断哪些是公开 API。

\`\`\`python
# 文件：api.py
__all__ = ["public_func", "PublicClass"]

def public_func():
    pass

class PublicClass:
    pass

def _internal():
    pass   # 不在 __all__，被视为内部实现
\`\`\`

**最佳实践**：公开发布的模块应该定义 \`__all__\`，明确告诉用户"这些是我承诺维护的 API，其他都是内部实现，别依赖"。

### __dict__：命名空间字典

模块的 \`__dict__\` 是一个字典，存放模块里定义的所有名字。访问 \`mod.name\` 等价于 \`mod.__dict__['name']\`（大部分情况）。

\`\`\`python
import math
print('pi' in math.__dict__)        # True
print(math.__dict__['pi'])          # 3.141592653589793
print(math.pi is math.__dict__['pi'])  # True
\`\`\`

模块的 \`__dict__\` 就是它的命名空间。给模块加属性就是往这个字典写：

\`\`\`python
import os
os.my_attr = 123
print('my_attr' in os.__dict__)   # True
\`\`\`

### __package__：所属包名

\`__package__\` 表示模块所属的包：
- 顶层模块（不在任何包里）：\`__package__\` 是 \`None\` 或空字符串 \`""\`。
- 包内的模块：\`__package__\` 是所在包的全名。

\`\`\`python
import os
print(os.__package__)      # ''（顶层模块）

import os.path
print(os.path.__package__) # 'os'（os.path 属于 os 包）
\`\`\`

\`__package__\` 是**相对导入**定位当前包的关键依据（下一章详解）。包自身的 \`__package__\` 是它自己的全名：

\`\`\`python
import urllib
print(urllib.__package__)   # 'urllib'
\`\`\`

### __spec__：模块规格说明

\`__spec__\` 是一个 \`importlib.machinery.ModuleSpec\` 对象，记录模块的"加载规格"：

\`\`\`python
import os
spec = os.__spec__
print(spec.name)      # 'os'，模块名
print(spec.origin)    # '/usr/lib/python3.13/os.py'，源文件
print(spec.loader)    # 加载器对象
print(spec.submodule_search_locations)  # 包的搜索路径（仅包有）
\`\`\`

\`ModuleSpec\` 是 Python 3.4 引入的（PEP 451），把模块的"如何加载"信息集中到一个对象里，替代了过去散落在 \`__loader__\`、\`__file__\`、\`__path__\` 各处的信息。导入系统现在用 spec 来驱动整个加载流程。

### __loader__：加载器

\`__loader__\` 是实际加载模块代码的对象，不同类型的模块有不同的 loader：
- \`.py\` 文件：\`SourceFileLoader\`
- \`.pyc\` 文件：\`SourcelessFileLoader\`
- 内置模块：\`BuiltinImporter\`
- C 扩展：\`ExtensionFileLoader\`

\`\`\`python
import os
print(os.__loader__)   # <_frozen_importlib_external.SourceFileLoader object>
\`\`\`

通常你不需要直接和 loader 打交道，除非在写自定义导入钩子（meta path finder）。

### __builtins__：内置名字

每个模块的 \`__dict__\` 里都有一个 \`__builtins__\`，提供 \`print\`、\`len\`、\`int\`、\`Exception\` 等内置名字。在主模块里它通常是 \`builtins\` 模块本身，在其他模块里通常是 \`builtins\` 模块的 \`__dict__\`。

\`\`\`python
print(__builtins__)
print('print' in dir(__builtins__))   # True
\`\`\`

这是为什么你在任何模块里都能直接用 \`print\`、\`len\` 而不用 import——它们来自 \`__builtins__\`。

### 本章小结

- \`__name__\`：模块名，顶层运行时为 \`"__main__"\`，支撑 \`if __name__ == "__main__":\` 惯用法。
- \`__file__\`：源文件路径，内置模块和命名空间包没有。
- \`__doc__\`：文档字符串，自文档化核心。
- \`__all__\`：控制 \`import *\`，声明公开 API。
- \`__dict__\`：模块命名空间字典，访问属性的底层数据结构。
- \`__package__\`：所属包名，相对导入的定位依据。
- \`__spec__\` / \`__loader__\`：模块加载规格和加载器。
- \`__builtins__\`：提供内置名字。

下面运行代码，逐一查看这些属性。`,
    code: `# -*- coding: utf-8 -*-
# 第四章演示代码：模块属性
# 查看 os 模块的各种双下划线属性，演示 __all__ 和 __name__=="__main__"

import os
import sys
import types

print("===== 1. os 模块的核心属性 =====")
print("os.__name__      =", os.__name__)
print("os.__file__      =", os.__file__)
print("os.__package__   =", repr(os.__package__))     # 顶层模块，为空字符串
print("os.__doc__ 前80字:")
print(" ", (os.__doc__ or "")[:80].replace("\\n", " "), "...")

print("\\n===== 2. __spec__ 模块规格说明 =====")
spec = os.__spec__
print("type(spec)               =", type(spec).__name__)
print("spec.name                =", spec.name)
print("spec.origin              =", spec.origin)
print("spec.loader              =", spec.loader)
print("spec.submodule_search_locations =", spec.submodule_search_locations)  # 顶层模块为 None

print("\\n===== 3. __dict__ 模块命名空间字典 =====")
keys = list(os.__dict__.keys())
print("os.__dict__ 里的属性总数:", len(keys))
print("部分属性:", keys[:12])
# 验证 os.name 等价于 os.__dict__['name']
print("os.sep is os.__dict__['sep']:", os.sep is os.__dict__["sep"])
# 给模块加属性就是往 __dict__ 写
os.my_custom_attr = "hello"
print("加了 my_custom_attr 后在 __dict__:", "my_custom_attr" in os.__dict__)

print("\\n===== 4. __name__ == '__main__' 惯用法 =====")
print("当前脚本的 __name__ =", __name__)
if __name__ == "__main__":
    print("-> 因为直接运行，__name__ 是 '__main__'，所以执行了这段")
    print("-> 如果这个文件被 import，__name__ 会是模块名，这段就不会执行")

print("\\n===== 5. 创建带 __all__ 和 __doc__ 的模块，观察 import * =====")
mymod = types.ModuleType("attr_demo")
mymod.__doc__ = "演示 __all__ 控制公开名单的模块"
mymod.public_func = lambda x: f"公开: {x}"
mymod.helper = lambda: "辅助函数"
mymod._internal = "内部使用"
mymod.__all__ = ["public_func"]     # 只公开 public_func
sys.modules["attr_demo"] = mymod

# 在干净命名空间执行 from attr_demo import *
ns = {}
exec("from attr_demo import *", ns)
exported = sorted(k for k in ns if not k.startswith("_"))
print("__all__ =", mymod.__all__)
print("from attr_demo import * 导出:", exported)
print("public_func 导出:", "public_func" in ns)
print("helper 导出（不在 __all__）:", "helper" in ns)
print("-> __all__ 精确控制了 import * 的导出范围")

print("\\n===== 6. __package__ 在包内模块的值 =====")
import os.path
print("os.__package__         =", repr(os.__package__))         # ''
print("os.path.__package__    =", repr(os.path.__package__))    # 'os'
print("os.path.__file__       =", os.path.__file__)
# os.path 是否有 __path__（它是模块不是包）
print("os.path 有 __path__ 吗:", hasattr(os.path, "__path__"))

print("\\n===== 7. __loader__ 加载器 =====")
print("os.__loader__ =", os.__loader__)
print("loader 类型:", type(os.__loader__).__name__)
# 内置模块的 loader
print("sys.__loader__ =", sys.__loader__)
print("sys loader 类型:", type(sys.__loader__).__name__)

print("\\n===== 8. __builtins__ 内置名字 =====")
print("'__builtins__' in globals():", "__builtins__" in globals())
print("type(__builtins__):", type(__builtins__).__name__)
# 验证内置函数来自 __builtins__
print("'print' 在 __builtins__ 里:", "print" in dir(__builtins__))
print("'len' 在 __builtins__ 里:", "len" in dir(__builtins__))

print("\\n===== 9. 标准库包的属性对比 =====")
import json
print("json.__name__    =", json.__name__)
print("json.__package__ =", repr(json.__package__))
print("json.__file__    =", json.__file__)
print("json.__doc__ 前60字:", (json.__doc__ or "")[:60], "...")

print("\\n===== 10. 模块属性「完整性」检查 =====")
# 一个典型 .py 模块应有的属性
expected = ["__name__", "__doc__", "__package__", "__loader__", "__spec__"]
for attr in expected:
    print(f"  os 有 {attr}:", hasattr(os, attr))
print("  os 有 __file__:", hasattr(os, "__file__"))
print("  sys 有 __file__（内置模块）:", hasattr(sys, "__file__"))

print("\\n模块属性演示完成！")
`,
  },

  // =========================================================
  // 第五章：包入门
  // =========================================================
  {
    id: "py-pkg-intro",
    group: "包与导入",
    icon: "📁",
    title: "包入门",
    content: `## 什么是包？

**包（package）** 是一种特殊的模块，它对应一个**目录**，用来把多个相关的模块组织在一起。简单说：**一个含 \`__init__.py\` 的目录就是一个包**。

\`\`\`
myproject/
├── mypkg/                  ← 包（目录）
│   ├── __init__.py         ← 包的初始化文件（标识这是一个包）
│   ├── models.py           ← 子模块
│   ├── views.py            ← 子模块
│   └── utils.py            ← 子模块
└── main.py
\`\`\`

在 main.py 里：

\`\`\`python
import mypkg                # 导入包
import mypkg.models         # 导入包里的子模块
from mypkg import views     # 从包里导入子模块
from mypkg.utils import helper  # 从子模块导入名字
\`\`\`

### 包的作用

| 作用 | 说明 |
| --- | --- |
| **组织多个模块** | 把相关模块归类到一个目录，避免顶层一堆散乱的 .py 文件 |
| **避免命名冲突** | \`myapp.utils\` 和 \`otherapp.utils\` 互不冲突 |
| **形成层级命名空间** | 用点号分隔的包路径，\`a.b.c\` 清晰反映结构 |

### 常规包 vs 命名空间包

Python 有两种包：

| 类型 | 标志 | 来源 |
| --- | --- | --- |
| **常规包** | 目录里有 \`__init__.py\` | Python 一直支持 |
| **命名空间包** | 目录里**没有** \`__init__.py\` | PEP 420，Python 3.3+ |

本章重点讲常规包，命名空间包在第七章详解。

\`\`\`
# 常规包结构
mypkg/
├── __init__.py     ← 有这个文件就是常规包
└── mod.py

# 命名空间包结构
nspkg/
└── mod.py          ← 没有 __init__.py，靠 PEP 420 隐式成为命名空间包
\`\`\`

### __init__.py 的作用

\`__init__.py\` 有四个作用：

1. **标识包**：告诉 Python 这个目录是个包（在 PEP 420 之前这是必须的）。
2. **执行初始化代码**：包被 import 时，\`__init__.py\` 的顶层代码会执行一次。
3. **控制公共 API**：在 \`__init__.py\` 里 import 子模块的名字，对外提供统一入口。
4. **定义 \`__all__\`**：控制 \`from pkg import *\` 的导出。

#### __init__.py 可以为空

\`__init__.py\` 可以是空文件，仅起"标识"作用：

\`\`\`python
# mypkg/__init__.py（空文件）
\`\`\`

这时 \`import mypkg\` 只是建立包对象，不做任何初始化。

#### __init__.py 做初始化

\`\`\`python
# mypkg/__init__.py
print("mypkg 包被加载了")
PKG_VERSION = "1.0"

# 把子模块的常用名字提到包级别，方便外部使用
from mypkg.models import User
from mypkg.utils import helper
\`\`\`

这样外部可以直接 \`from mypkg import User\`，不用写 \`from mypkg.models import User\`。这是"门面模式"的常见用法。

### 多层包结构

包可以嵌套，形成多层结构：

\`\`\`
myapp/
├── __init__.py
├── api/
│   ├── __init__.py
│   ├── v1/
│   │   ├── __init__.py
│   │   ├── users.py
│   │   └── posts.py
│   └── v2/
│       ├── __init__.py
│       └── users.py
└── core/
    ├── __init__.py
    └── db.py
\`\`\`

导入深层子模块：

\`\`\`python
import myapp.api.v1.users
from myapp.api.v2.users import create_user
from myapp.core.db import Database
\`\`\`

每一层目录都要有 \`__init__.py\`（常规包）。点号路径反映目录层级，非常直观。

### 包的导入方式

\`\`\`python
# 1. 导入包本身
import mypkg

# 2. 导入包的子模块
import mypkg.models
mypkg.models.do_something()

# 3. 从包导入子模块
from mypkg import models
models.do_something()

# 4. 从子模块导入名字
from mypkg.models import User
user = User()

# 5. 导入多层子模块
from mypkg.api.v1.users import get_user
\`\`\`

注意 \`import mypkg.models\` 后，必须用完整路径 \`mypkg.models.xxx\` 访问；而 \`from mypkg import models\` 后，用 \`models.xxx\` 即可。

### 包也是模块对象，有 __path__

包本质上也是一种模块对象（\`type(pkg) is module\`），但它有一个普通模块没有的特殊属性：\`__path__\`。

\`\`\`python
import urllib
print(type(urllib))         # <class 'module'>
print(urllib.__path__)      # _NamespacePath(['/usr/lib/python3.13/urllib'])
\`\`\`

- 普通模块的 \`__path__\` 不存在。
- 包的 \`__path__\` 是一个可迭代对象，指向包所在的**目录**（可以是多个，命名空间包）。
- 导入包的子模块时，Python 在 \`__path__\` 列出的目录里查找。

\`__path__\` 是包区别于普通模块的根本标志。

### 常见标准库包举例

Python 标准库里有大量包，本教程的演示代码会导入它们来展示真实包结构：

| 包路径 | 说明 | 子模块举例 |
| --- | --- | --- |
| \`os.path\` | 路径操作（os.path 实际指向 posixpath 模块） | — |
| \`xml.etree.ElementTree\` | XML 解析 | \`xml\`、\`xml.etree\` 是包 |
| \`urllib.parse\` | URL 解析 | \`urllib\` 是包，\`parse\` 是子模块 |
| \`email.mime.text\` | MIME 文本 | \`email\`、\`email.mime\` 是包 |
| \`logging.handlers\` | 日志处理器 | \`logging\` 是包 |
| \`http.server\` | HTTP 服务 | \`http\` 是包 |

\`\`\`python
import xml
import urllib.parse            # urllib 是包，parse 是子模块
print(urllib.__path__)         # 包有 __path__
print(urllib.parse.__file__)   # 子模块有 __file__

import xml.etree.ElementTree as ET
print(xml.__path__)            # xml 包的 __path__
print(ET.__package__)          # 'xml.etree'
\`\`\`

### 本章小结

- 包 = 含 \`__init__.py\` 的目录，是模块的集合。
- 常规包有 \`__init__.py\`，命名空间包没有（第七章）。
- \`__init__.py\` 负责标识、初始化、控制公共 API、定义 \`__all__\`。
- 包可以多层嵌套，点号路径对应目录层级。
- 包也是模块对象，但有 \`__path__\` 属性指向目录。

下面运行代码，查看标准库包的真实结构，并手动构建一个虚拟包。`,
    code: `# -*- coding: utf-8 -*-
# 第五章演示代码：包入门
# 查看标准库包的 __path__/__file__/__package__，并手动构建虚拟包

import sys
import os
import types
import importlib

print("===== 1. 标准库包结构：xml.etree.ElementTree =====")
import xml
import xml.etree
import xml.etree.ElementTree as ET
print("xml 是包吗（有 __path__）:", hasattr(xml, "__path__"))
print("xml.__path__ =", list(xml.__path__))
print("xml.etree 是包吗:", hasattr(xml.etree, "__path__"))
print("xml.etree.__path__ =", list(xml.etree.__path__))
print("ET 是模块（有 __file__）:", hasattr(ET, "__file__"))
print("ET.__file__ =", ET.__file__)
print("ET.__package__ =", repr(ET.__package__))   # 'xml.etree'

print("\\n===== 2. urllib 包结构 =====")
import urllib
import urllib.parse
print("urllib 是包:", hasattr(urllib, "__path__"))
print("urllib.__path__ =", list(urllib.__path__))
print("urllib.__file__ =", urllib.__file__)       # urllib/__init__.py
print("urllib.parse.__file__ =", urllib.parse.__file__)
print("urllib.parse.__package__ =", repr(urllib.parse.__package__))   # 'urllib'

print("\\n===== 3. email 包 =====")
import email
print("email 是包:", hasattr(email, "__path__"))
print("email.__path__ =", list(email.__path__))
print("email.__file__ =", email.__file__)         # email/__init__.py
print("email.__package__ =", repr(email.__package__))

print("\\n===== 4. os.path：是模块而非包 =====")
import os.path
print("os.path.__file__ =", os.path.__file__)
print("os.path 有 __path__ 吗:", hasattr(os.path, "__path__"))   # False
print("os.path.__package__ =", repr(os.path.__package__))        # 'os'
print("os.path 实际类型:", type(os.path).__name__)
print("-> os.path 其实是 os 包里的一个普通模块（指向 posixpath）")

print("\\n===== 5. 手动构建一个虚拟包 mypkg =====")
# 模拟包结构：mypkg/__init__.py + mypkg/child.py
# 包的标志是 __path__ 属性指向一个目录
parent = types.ModuleType("mypkg")
parent.__path__ = ["/virtual/mypkg"]    # 包必须有 __path__（指向目录）
parent.__package__ = "mypkg"
parent.__doc__ = "虚拟包 mypkg，演示包的本质"
# 模拟 __init__.py 里的初始化代码
parent.PKG_VERSION = "1.0"
parent.PKG_INIT_RAN = True
parent.HELLO = "来自 __init__.py 的初始化"
sys.modules["mypkg"] = parent

# 子模块 child
child = types.ModuleType("mypkg.child")
child.__package__ = "mypkg"
child.__doc__ = "子模块 child"
child.greet = lambda: "Hello from mypkg.child"
child.VALUE = 42
sys.modules["mypkg.child"] = child
parent.child = child   # 把子模块挂为父包的属性（import 系统加载子模块时默认会做这一步）

# 现在导入
import mypkg
import mypkg.child
print("type(mypkg) =", type(mypkg).__name__)
print("mypkg 是包吗（有 __path__）:", hasattr(mypkg, "__path__"))
print("mypkg.__path__ =", list(mypkg.__path__))
print("mypkg.PKG_VERSION =", mypkg.PKG_VERSION)       # __init__ 初始化效果
print("mypkg.HELLO =", mypkg.HELLO)
print("mypkg.child.greet() =", mypkg.child.greet())
print("mypkg.child.VALUE =", mypkg.child.VALUE)
print("child 作为 mypkg 的属性:", "child" in mypkg.__dict__)

print("\\n===== 6. 包也是模块对象 =====")
import os
print("type(mypkg) == type(os):", type(mypkg) == type(os))
print("mypkg.__name__ =", mypkg.__name__)
print("mypkg.child.__name__ =", mypkg.child.__name__)

print("\\n===== 7. from 包 import 子模块 =====")
from mypkg import child as c
print("from mypkg import child 成功:", c)
print("c is mypkg.child:", c is mypkg.child)
from mypkg.child import greet
print("from mypkg.child import greet:", greet())

print("\\n===== 8. importlib.import_module 导入包的子模块 =====")
m = importlib.import_module("mypkg.child")
print("import_module('mypkg.child') =", m)
print("与 mypkg.child 是同一对象:", m is mypkg.child)

print("\\n===== 9. 子模块的 __package__ 反映所属包 =====")
print("mypkg.__package__        =", repr(mypkg.__package__))         # 'mypkg'
print("mypkg.child.__package__  =", repr(mypkg.child.__package__))   # 'mypkg'
print("-> 子模块的 __package__ 就是它所在的包名")

print("\\n===== 10. __init__.py 等效：包级 API 聚合 =====")
# 模拟 __init__.py 把子模块的名字提到包级别
parent.child_greet = child.greet   # 等效于在 __init__.py 里 from mypkg.child import greet
print("mypkg.child_greet() =", mypkg.child_greet())
print("-> 这就是 __init__.py 做'门面'的原理")

print("\\n包入门演示完成！")
`,
  },

  // =========================================================
  // 第六章：相对导入与绝对导入
  // =========================================================
  {
    id: "py-pkg-relative",
    group: "包与导入",
    icon: "🔗",
    title: "相对导入与绝对导入",
    content: `## 两种导入风格

在包内部，模块之间互相导入有两种写法：

- **绝对导入**：从顶级包开始写完整路径，\`import pkg.sub.mod\`。
- **相对导入**：基于当前模块所在包，用点号表示层级，\`from . import mod\`、\`from .. import mod\`。

### 绝对导入

绝对导入就是写完整的点号路径：

\`\`\`python
# 文件：myapp/api/v1/users.py
from myapp.core.db import Database     # 从顶级包 myapp 开始
from myapp.api.v1.posts import Post    # 完整路径
import myapp.utils.logger              # 完整路径
\`\`\`

优点：
- 路径清晰，一眼看出依赖在哪儿。
- 不会因为包改名或移动当前文件而改变语义（只要顶级包名不变）。
- IDE 静态分析友好。

缺点：
- 顶级包名很长时，写起来啰嗦。
- 如果整个包改名，所有绝对导入都要改。

### 相对导入

相对导入用点号表示当前包的层级：

| 语法 | 含义 |
| --- | --- |
| \`from . import mod\` | 从**当前包**导入 \`mod\` |
| \`from .mod import name\` | 从当前包的 \`mod\` 导入 \`name\` |
| \`from .. import mod\` | 从**上级包**导入 \`mod\` |
| \`from ..mod import name\` | 从上级包的 \`mod\` 导入 |
| \`from ... import mod\` | 从**上上级包**导入 |

一个点 \`.\` 是当前包，两个点 \`..\` 是上一级包，三个点 \`...\` 是上两级，以此类推。

\`\`\`python
# 文件：myapp/api/v1/users.py，当前包是 myapp.api.v1
from . import posts          # 导入同包的 posts（myapp.api.v1.posts）
from .posts import Post      # 同上，导入 Post
from .. import v2            # 导入上级包（myapp.api）的 v2
from ...core import db       # 导入 myapp.core.db（上两级 myapp 的 core）
\`\`\`

### 相对导入如何定位？__package__ 和 __name__

相对导入靠当前模块的 \`__package__\` 来定位"当前包"。具体规则：

- 若 \`__package__\` 已设置（非 None），用它作为当前包。
- 否则用 \`__name__\` 推导：\`__package__ = __name__.rpartition('.')[0]\`。

所以一个模块的 \`__package__\` 决定了相对导入的"起点"。这就是为什么相对导入必须在包内模块使用——顶层脚本的 \`__package__\` 是 \`None\`，没有起点。

### 相对导入只能在包内模块使用

**关键限制**：相对导入只能在**包内的模块**里用，不能在顶层脚本（直接运行的 \`__main__\` 模块）里用。

\`\`\`python
# 文件：main.py（直接 python main.py 运行）
from . import something   # ❌ ImportError: attempted relative import with no known parent package
\`\`\`

因为顶层脚本 \`__name__\` 是 \`"__main__"\`，\`__package__\` 是 \`None\`，Python 不知道"当前包"是谁，所以相对导入报错。

错误信息通常是：

\`\`\`
ImportError: attempted relative import with no known parent package
\`\`\`

#### 为什么不能在顶层脚本用相对导入？

顶层脚本不在任何包里——它没有"父包"。相对导入的语义是"相对于我所在的包"，但顶层脚本没有包，所以无意义。

如果你确实想让一个文件既能当脚本跑、又能当模块导入，应该用绝对导入，并用 \`if __name__ == "__main__":\` 处理脚本入口。

### 相对导入 vs 绝对导入 对比

| 维度 | 绝对导入 | 相对导入 |
| --- | --- | --- |
| **写法** | \`from myapp.core import db\` | \`from ...core import db\` |
| **可读性** | 高（路径明确） | 中（要数点号、看当前包） |
| **包改名** | 顶级包改名要全改 | 不受影响（点号相对） |
| **文件移动** | 顶级包不变就不受影响 | 跨层级移动要改点号数 |
| **使用范围** | 任何地方 | 只能在包内模块 |
| **顶层脚本** | 可用 | 不可用 |
| **IDE 支持** | 好 | 一般 |

### PEP 328 与相对导入的历史

Python 早期（2.x）只有绝对导入，\`from X import Y\` 既可能是相对的也可能是绝对的，导致混乱。PEP 328（Python 2.5+）引入了显式相对导入（\`from . import\`），并在 Python 3 默认改为绝对导入优先。

Python 3 的规则：
- \`import X\` 和 \`from X import Y\` 都是**绝对导入**（X 从顶级包开始）。
- 必须用 \`from . import Y\` 这种带点号的才是相对导入。
- \`from __future__ import absolute_import\` 在 Python 3 已是默认，无需声明。

### 推荐做法

| 场景 | 推荐 |
| --- | --- |
| **应用代码**（顶层项目） | 绝对导入，清晰可读 |
| **库/包内部** | 相对导入，解耦包名 |
| **跨包引用** | 绝对导入 |
| **同包兄弟模块** | 相对导入 \`from . import sibling\` |

很多大型开源项目（如 Django、Flask）在包内部用相对导入，这样把整个包改名或拷贝到别处，内部导入不用改。

\`\`\`python
# 包内部推荐：相对导入
from .models import User       # 同包兄弟
from ..utils import helper     # 上级包的工具
\`\`\`

\`\`\`python
# 应用代码推荐：绝对导入
from myproject.users.models import User
from myproject.common.utils import helper
\`\`\`

### 本章小结

- 绝对导入：完整路径 \`from pkg.sub import mod\`，清晰、通用。
- 相对导入：点号路径 \`from . import mod\`，基于当前包，只能在包内用。
- 相对导入靠 \`__package__\` 定位，顶层脚本没有 \`__package__\`，所以不能用。
- PEP 328 引入显式相对导入，Python 3 默认绝对导入。
- 应用代码用绝对导入，包内部用相对导入。

下面运行代码，用虚拟包演示绝对和相对导入。`,
    code: `# -*- coding: utf-8 -*-
# 第六章演示代码：相对导入与绝对导入
# 用虚拟包结构演示绝对导入、相对导入，以及顶层脚本不能用相对导入

import sys
import types

print("===== 1. 构建虚拟包结构 relpkg/a, relpkg/b =====")
# 父包 relpkg
pkg = types.ModuleType("relpkg")
pkg.__path__ = ["/virtual/relpkg"]
pkg.__package__ = "relpkg"
pkg.__doc__ = "用于演示导入的虚拟包"
sys.modules["relpkg"] = pkg

# 子模块 a
mod_a = types.ModuleType("relpkg.a")
mod_a.__package__ = "relpkg"
mod_a.__name__ = "relpkg.a"
mod_a.A_VALUE = "模块 a"
sys.modules["relpkg.a"] = mod_a
pkg.a = mod_a   # 把子模块挂为父包属性（手动构造包时需补这步，否则 relpkg.a 访问不到）

# 子模块 b
mod_b = types.ModuleType("relpkg.b")
mod_b.__package__ = "relpkg"
mod_b.__name__ = "relpkg.b"
mod_b.B_VALUE = "模块 b"
mod_b.hello = lambda: "hello from b"
sys.modules["relpkg.b"] = mod_b
pkg.b = mod_b   # 同上，挂为父包属性

# 在子模块 a 里用【绝对导入】引用 b
# 绝对导入从顶级包开始写完整路径
exec(
    "import relpkg.b\\n"
    "def use_b_absolute():\\n"
    "    return 'a 通过绝对导入调用 ' + relpkg.b.B_VALUE",
    mod_a.__dict__,
)
import relpkg.a
print("relpkg.a.A_VALUE =", relpkg.a.A_VALUE)
print("relpkg.a.use_b_absolute() =", relpkg.a.use_b_absolute())
print("relpkg.b.B_VALUE =", relpkg.b.B_VALUE)

print("\\n===== 2. __package__ 的值 =====")
print("relpkg.__package__        =", repr(relpkg.__package__))
print("relpkg.a.__package__      =", repr(relpkg.a.__package__))
print("relpkg.b.__package__      =", repr(relpkg.b.__package__))
print("当前顶层脚本 __package__   =", repr(__package__))   # None 或 ''
print("当前顶层脚本 __name__      =", __name__)             # '__main__'

print("\\n===== 3. 绝对导入演示（import relpkg.b）=====")
# import relpkg.b 是绝对导入，从顶级包 relpkg 开始
print("绝对导入 relpkg.b 成功:", relpkg.b)
print("relpkg.b.hello():", relpkg.b.hello())
print("-> 绝对导入路径清晰，任何地方都能用")

print("\\n===== 4. 相对导入演示（from . import b）=====")
# 创建子模块 c，用相对导入 from . import b
mod_c = types.ModuleType("relpkg.c")
mod_c.__package__ = "relpkg"      # 关键：相对导入依赖 __package__ 定位当前包
mod_c.__name__ = "relpkg.c"
sys.modules["relpkg.c"] = mod_c
pkg.c = mod_c   # 挂为父包属性
# 相对导入代码：from . import b 等价于 from relpkg import b
rel_code = (
    "from . import b\\n"
    "C_VALUE = '模块 c，通过相对导入引用 b: ' + b.B_VALUE\\n"
)
try:
    exec(rel_code, mod_c.__dict__)
    print("相对导入 from . import b 成功!")
    import relpkg.c
    print("relpkg.c.C_VALUE =", relpkg.c.C_VALUE)
except (ImportError, SystemError) as e:
    print("相对导入失败:", type(e).__name__, e)

print("\\n===== 5. from .mod import name 形式 =====")
# 创建子模块 d，用 from .b import hello 引用 b 的函数
mod_d = types.ModuleType("relpkg.d")
mod_d.__package__ = "relpkg"
mod_d.__name__ = "relpkg.d"
sys.modules["relpkg.d"] = mod_d
pkg.d = mod_d   # 挂为父包属性
rel_code2 = (
    "from .b import hello, B_VALUE\\n"
    "D_VALUE = 'd 引用 b.hello(): ' + hello()\\n"
)
try:
    exec(rel_code2, mod_d.__dict__)
    print("相对导入 from .b import hello 成功!")
    import relpkg.d
    print("relpkg.d.D_VALUE =", relpkg.d.D_VALUE)
except (ImportError, SystemError) as e:
    print("相对导入失败:", type(e).__name__, e)

print("\\n===== 6. 上级包相对导入 from .. import =====")
# 构造 relpkg.sub.d，d 用 from .. import b 引用上级包的 b
sub_pkg = types.ModuleType("relpkg.sub")
sub_pkg.__path__ = ["/virtual/relpkg/sub"]
sub_pkg.__package__ = "relpkg.sub"
sub_pkg.__name__ = "relpkg.sub"
sys.modules["relpkg.sub"] = sub_pkg
pkg.sub = sub_pkg   # 子包挂为父包属性

mod_e = types.ModuleType("relpkg.sub.e")
mod_e.__package__ = "relpkg.sub"     # 当前包是 relpkg.sub，.. 指向 relpkg
mod_e.__name__ = "relpkg.sub.e"
sys.modules["relpkg.sub.e"] = mod_e
sub_pkg.e = mod_e   # 子模块挂为子包属性
up_code = (
    "from .. import b\\n"             # .. 指向 relpkg，导入 relpkg.b
    "E_VALUE = 'e 通过上级相对导入引用 b: ' + b.B_VALUE\\n"
)
try:
    exec(up_code, mod_e.__dict__)
    print("上级包相对导入 from .. import b 成功!")
    import relpkg.sub.e
    print("relpkg.sub.e.E_VALUE =", relpkg.sub.e.E_VALUE)
except (ImportError, SystemError) as e:
    print("上级包相对导入失败:", type(e).__name__, e)

print("\\n===== 7. 顶层脚本尝试相对导入会报错 =====")
print("当前脚本 __package__ =", repr(__package__))
print("当前脚本 __name__    =", __name__)
print("尝试在顶层执行 from . import something:")
try:
    # 顶层脚本 __package__ 为 None 或空，没有父包，相对导入会失败
    exec("from . import something", {"__name__": "__main__", "__package__": None})
    print("(未报错)")
except (ImportError, SystemError, TypeError) as e:
    print(f"  捕获到错误: {type(e).__name__}: {e}")
print("-> 这就是'顶层脚本不能用相对导入'的原因")

print("\\n===== 8. 绝对导入 vs 相对导入 对比 =====")
print("绝对导入: import relpkg.b          —— 从顶级包完整路径，清晰")
print("相对导入: from . import b          —— 基于当前包 __package__，包内解耦")
print("相对导入: from .b import hello     —— 同包子模块的具体名字")
print("相对导入: from .. import b         —— 引用上级包（两个点）")
print("-> 应用代码推荐绝对导入，包内部推荐相对导入")

print("\\n相对导入与绝对导入演示完成！")
`,
  },

  // =========================================================
  // 第七章：命名空间包
  // =========================================================
  {
    id: "py-pkg-namespace",
    group: "包与导入",
    icon: "🌐",
    title: "命名空间包",
    content: `## PEP 420：隐式命名空间包

从 Python 3.3 起（PEP 420），**没有 \`__init__.py\` 的目录也能被导入**，这种包叫**命名空间包（namespace package）**。

\`\`\`
# 目录结构（注意：没有 __init__.py）
nspkg/
└── mod.py

# 仍然能导入！
import nspkg.mod
\`\`\`

这在 Python 3.3 之前是不可能的——没有 \`__init__.py\` 的目录不能被 import。

### 命名空间包的核心特性：跨目录

命名空间包最大的特点是：**多个目录可以贡献同一个命名空间包**。也就是说，\`nspkg\` 这个包可以由磁盘上多个不同位置的 \`nspkg/\` 目录共同组成。

\`\`\`
目录1:  /path/A/nspkg/mod1.py
目录2:  /path/B/nspkg/mod2.py
\`\`\`

如果 \`/path/A\` 和 \`/path/B\` 都在 \`sys.path\` 里，那么：

\`\`\`python
import nspkg.mod1   # 来自 /path/A/nspkg
import nspkg.mod2   # 来自 /path/B/nspkg
print(nspkg.__path__)   # 同时包含 /path/A/nspkg 和 /path/B/nspkg
\`\`\`

\`nspkg.__path__\` 是一个特殊的可迭代对象 \`_NamespacePath\`，包含**多个**目录。子模块查找时会扫描所有这些目录。

### 为什么需要命名空间包？

#### 1. 大型项目拆分到多个仓库

一个公司有 \`mycompany.auth\`、\`mycompany.billing\`、\`mycompany.crm\` 等多个子包，分别由不同团队、不同仓库维护。每个仓库只包含 \`mycompany/<自己的子包>\`，没有顶层的 \`mycompany/__init__.py\`。各仓库独立安装后，Python 自动把它们合并成同一个 \`mycompany\` 命名空间包。

\`\`\`
仓库1: mycompany/auth/...
仓库2: mycompany/billing/...
仓库3: mycompany/crm/...
\`\`\`

每个仓库都没有 \`mycompany/__init__.py\`，安装到 site-packages 后，三个 \`mycompany/\` 目录被合并。

#### 2. 插件系统

主程序定义一个命名空间 \`myapp.plugins\`，第三方插件各自往自己的 \`myapp/plugins/xxx\` 目录放文件，主程序扫描命名空间包的 \`__path__\` 就能发现所有插件，无需修改主程序代码。

#### 3. 扩展包

某个核心库 \`megapkg.core\` 发布后，第三方可以发布 \`megapkg.extras\` 扩展，两者共享 \`megapkg\` 命名空间，用户感觉是同一个大包。

### __path__ 是 _NamespacePath

命名空间包的 \`__path__\` 不是普通列表，而是 \`importlib._bootstrap_external._NamespacePath\` 对象：

\`\`\`python
import nspkg
print(type(nspkg.__path__))
# <class 'importlib._bootstrap_external._NamespacePath'>
print(list(nspkg.__path__))
# ['/path/A/nspkg', '/path/B/nspkg']
\`\`\`

它是一个可迭代对象，可以包含多个目录，并且是"懒"的——它会根据当前 \`sys.path\` 动态计算。

### 与常规包的区别

| 维度 | 常规包 | 命名空间包 |
| --- | --- | --- |
| **\`__init__.py\`** | 有 | 没有 |
| **\`__file__\`** | 有（指向 \`__init__.py\`） | 没有（为 None 或不存在） |
| **\`__path__\`** | 普通列表，通常一个目录 | \`_NamespacePath\`，可多个目录 |
| **\`__spec__.origin\`** | 指向 \`__init__.py\` | \`None\` |
| **\`__spec__.loader\`** | \`SourceFileLoader\` 等 | \`None\` |
| **初始化代码** | \`__init__.py\` 会执行 | 不执行（没有 \`__init__\`） |
| **跨目录** | 不能 | 能 |

\`\`\`python
# 常规包
import urllib   # urllib 在标准库里其实是命名空间包，但举例说明
print(urllib.__file__)   # 常规包有 __file__

# 命名空间包
# nspkg 没有 __file__
print(hasattr(nspkg, '__file__'))   # False 或值为 None
\`\`\`

### 命名空间包的 __init__ 不执行

因为命名空间包根本没有 \`__init__.py\`，所以包级别没有任何初始化代码执行。你不能在命名空间包里写 \`__all__\`、不能做包级初始化。如果需要这些，就用常规包。

### 显式命名空间包（pkgutil 风格）vs 隐式（PEP 420）

在 PEP 420 之前，有一种"显式命名空间包"的写法（pkgutil 风格），在 \`__init__.py\` 里写：

\`\`\`python
# mypkg/__init__.py
__path__ = __import__('pkgutil').extend_path(__path__, __name__)
\`\`\`

这让多个目录的 \`mypkg\` 能合并。这种写法现在仍在一些老项目里见到（如 setuptools 的 namespace_packages）。

| 风格 | 标志 | 兼容性 |
| --- | --- | --- |
| **隐式（PEP 420）** | 无 \`__init__.py\` | Python 3.3+ |
| **显式（pkgutil）** | \`__init__.py\` 里 \`pkgutil.extend_path\` | Python 2.3+，兼容性好 |
| **显式（pkg_resources）** | \`__init__.py\` 里 \`pkg_resources.declare_namespace\` | setuptools 风格，较老 |

新项目推荐用 PEP 420 隐式命名空间包，简单干净。

### 如何判断一个包是命名空间包？

看 \`__spec__.origin\`：如果是 \`None\` 且 \`__spec__.submodule_search_locations\` 不为 \`None\`，就是命名空间包。

\`\`\`python
import importlib.util
spec = importlib.util.find_spec("nspkg")
if spec.origin is None and spec.submodule_search_locations is not None:
    print("nspkg 是命名空间包")
\`\`\`

也可以看 \`__file__\`：命名空间包没有 \`__file__\`（或为 None）。

### 实际例子：标准库里的命名空间包

Python 标准库本身也用了命名空间包。例如 \`urllib\` 在某些版本里就是命名空间包（没有 \`__init__.py\`）：

\`\`\`python
import urllib
print(hasattr(urllib, '__file__'))   # 视版本而定
\`\`\`

### 本章小结

- PEP 420（Python 3.3+）：没有 \`__init__.py\` 的目录也能被导入，叫命名空间包。
- 命名空间包的 \`__path__\` 可包含多个目录，多个目录贡献同一命名空间。
- 适用场景：多仓库拆分、插件系统、扩展包。
- 与常规包区别：无 \`__init__.py\`、无 \`__file__\`、\`__spec__.origin\` 为 \`None\`、不执行初始化代码。
- 判断方法：\`spec.origin is None and spec.submodule_search_locations is not None\`。
- 老式 pkgutil/pkg_resources 风格仍存在，新项目用 PEP 420。

下面运行代码，用临时目录实地创建命名空间包并观察其特性。`,
    code: `# -*- coding: utf-8 -*-
# 第七章演示代码：命名空间包
# 用临时目录创建无 __init__.py 的包结构，演示命名空间包的各种特性

import sys
import os
import tempfile
import shutil
import importlib.util

print("===== 1. 创建无 __init__.py 的目录结构 =====")
tmpdir1 = tempfile.mkdtemp(prefix="nspkg1_")
pkg_dir1 = os.path.join(tmpdir1, "nspkg")
os.makedirs(pkg_dir1)
# 注意：故意不创建 __init__.py，让它成为命名空间包
with open(os.path.join(pkg_dir1, "mod1.py"), "w", encoding="utf-8") as f:
    f.write('VALUE = "我来自目录1的 mod1"\\n')
    f.write('def who(): return "mod1 from dir1"\\n')

print("临时目录1:", tmpdir1)
print("nspkg 目录:", pkg_dir1)
print("nspkg 有 __init__.py 吗:", os.path.exists(os.path.join(pkg_dir1, "__init__.py")))

# 把临时目录加入 sys.path
sys.path.insert(0, tmpdir1)
# 清除可能存在的缓存
for key in list(sys.modules):
    if key == "nspkg" or key.startswith("nspkg."):
        del sys.modules[key]

print("\\n===== 2. 导入命名空间包 =====")
import nspkg
print("type(nspkg) =", type(nspkg).__name__)
print("nspkg.__name__ =", nspkg.__name__)
print("nspkg 有 __file__ 吗:", hasattr(nspkg, "__file__") and nspkg.__file__ is not None)
print("nspkg.__file__ =", getattr(nspkg, "__file__", None))
print("nspkg 有 __path__ 吗:", hasattr(nspkg, "__path__"))
print("nspkg.__path__ =", list(nspkg.__path__))
print("nspkg.__spec__.origin =", nspkg.__spec__.origin)   # None
print("nspkg.__spec__.loader =", nspkg.__spec__.loader)   # None

print("\\n===== 3. 导入命名空间包的子模块 =====")
import nspkg.mod1
print("nspkg.mod1.VALUE =", nspkg.mod1.VALUE)
print("nspkg.mod1.who() =", nspkg.mod1.who())
print("nspkg.mod1.__file__ =", nspkg.mod1.__file__)       # 子模块有 __file__

print("\\n===== 4. 对比常规包（os.path 有 __file__）=====")
import os.path
print("os.path 类型:", type(os.path).__name__)
print("os.path.__file__ =", os.path.__file__)
print("命名空间包 nspkg.__file__ =", getattr(nspkg, "__file__", "无（命名空间包没有 __file__）"))
print("-> 常规包/模块有 __file__，命名空间包没有")

print("\\n===== 5. 两个目录贡献同一命名空间 =====")
# 在第二个临时目录也建一个 nspkg 目录（也无 __init__.py），放 mod2
tmpdir2 = tempfile.mkdtemp(prefix="nspkg2_")
pkg_dir2 = os.path.join(tmpdir2, "nspkg")
os.makedirs(pkg_dir2)
with open(os.path.join(pkg_dir2, "mod2.py"), "w", encoding="utf-8") as f:
    f.write('VALUE = "我来自目录2的 mod2"\\n')
    f.write('def who(): return "mod2 from dir2"\\n')

print("临时目录2:", tmpdir2)
# 把第二个目录也加入 sys.path
sys.path.insert(0, tmpdir2)

# 清除缓存，让 nspkg 重新被查找（这次会扫描到两个目录）
for key in list(sys.modules):
    if key == "nspkg" or key.startswith("nspkg."):
        del sys.modules[key]

import nspkg                    # 重新导入
print("重新导入后 nspkg.__path__ =", list(nspkg.__path__))
print("__path__ 包含的目录数:", len(list(nspkg.__path__)))
print("-> 两个目录都被合并到同一个命名空间包里了！")

import nspkg.mod1               # 来自目录1
import nspkg.mod2               # 来自目录2
print("nspkg.mod1.VALUE =", nspkg.mod1.VALUE)
print("nspkg.mod2.VALUE =", nspkg.mod2.VALUE)
print("mod1 来源:", os.path.dirname(nspkg.mod1.__file__))
print("mod2 来源:", os.path.dirname(nspkg.mod2.__file__))
print("-> 同一个 nspkg 包，子模块来自不同目录")

print("\\n===== 6. 用 importlib.util.find_spec 查看命名空间包的 spec =====")
spec = importlib.util.find_spec("nspkg")
print("spec.name                          =", spec.name)
print("spec.origin                        =", spec.origin)   # None
print("spec.loader                        =", spec.loader)   # None
print("spec.submodule_search_locations    =", list(spec.submodule_search_locations))
print("-> origin 和 loader 都是 None，这是命名空间包的标志")

print("\\n===== 7. 判断一个包是否是命名空间包 =====")
def is_namespace_package(pkg_name):
    """通过 spec 判断是否命名空间包"""
    spec = importlib.util.find_spec(pkg_name)
    if spec is None:
        return False
    # 命名空间包：origin 为 None 且有 submodule_search_locations
    return spec.origin is None and spec.submodule_search_locations is not None

print("nspkg 是命名空间包吗:", is_namespace_package("nspkg"))
print("os 是命名空间包吗:", is_namespace_package("os"))
print("json 是命名空间包吗:", is_namespace_package("json"))

print("\\n===== 8. 命名空间包没有 __init__ 执行 =====")
# 常规包导入时会执行 __init__.py，命名空间包不会（因为根本没有）
import os
print("常规包 os 有 __file__（执行了 __init__.py）:", hasattr(os, "__file__"))
print("命名空间包 nspkg 无 __file__（无 __init__）:", getattr(nspkg, "__file__", None) is None)

print("\\n===== 9. 对比常规包 vs 命名空间包 =====")
print("=" * 50)
print(f"{'属性':<25}{'常规包(os)':<20}{'命名空间包(nspkg)'}")
print("-" * 50)
print(f"{'有 __init__.py':<25}{'是':<20}{'否'}")
print(f"{'有 __file__':<25}{str(hasattr(os, '__file__')):<20}{str(getattr(nspkg, '__file__', None) is not None)}")
print(f"{'spec.origin':<25}{str(os.__spec__.origin)[:18]:<20}{str(spec.origin)}")
print(f"{'spec.loader':<25}{'非None':<20}{'None'}")
print(f"{'__path__ 目录数':<25}{'1':<20}{len(list(nspkg.__path__))}")
print("=" * 50)

# 清理临时目录
shutil.rmtree(tmpdir1, ignore_errors=True)
shutil.rmtree(tmpdir2, ignore_errors=True)
print("\\n命名空间包演示完成！")
`,
  },
];
