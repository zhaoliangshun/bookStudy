// =============================================================
// Python 模块与包教程（pymod）—— 第二批章节（高级机制 + 工程实践，共 5 章）
// -------------------------------------------------------------
// 本批深入模块系统的内部机制与工程实践：
//   高级机制组：
//     1.  py-mod-dynamic  — 动态导入
//     2.  py-mod-circular — 循环导入
//     3.  py-mod-reload   — 模块重载
//   工程实践组：
//     4.  py-pkg-layout   — 包结构与项目布局
//     5.  py-mod-practice — 模块化最佳实践
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
  // 第一章：动态导入
  // =========================================================
  {
    id: "py-mod-dynamic",
    group: "高级机制",
    icon: "⚙️",
    title: "动态导入",
    content: `## 静态导入的局限

我们平时写的 \`import os\`、\`from json import loads\` 都是**静态导入**：模块名在写代码时就已经写死在源文件里，编译期（\`.py\` → \`.pyc\`）就能确定要导入哪些模块。

静态导入简单清晰、利于静态分析工具（如 pylint、IDE 跳转），但有些场景它力不从心：

| 场景 | 静态导入的问题 | 动态导入的解法 |
| --- | --- | --- |
| **插件系统** | 主程序写代码时不知道用户会装哪些插件，没法写死 import | 扫描目录，按名字字符串动态加载 |
| **配置驱动** | 用 \`json\` 还是 \`ujson\` 由配置文件决定 | 读配置后 \`import_module(名字)\` |
| **延迟加载** | 启动时 import 一堆大模块拖慢启动 | 第一次用到时才 import |
| **条件加载** | 不同平台用不同实现 | \`if 平台: import_module(实现A)\` |
| **REPL / 测试框架** | 用户输入字符串决定运行什么 | 把字符串当模块名导入 |

注意：动态导入牺牲了静态分析能力（IDE 看不出你导入了什么），所以**能用静态导入就用静态导入**，只在确有需求时才用动态导入。

## \`\`__import__\`\` 内置函数：最底层的导入接口

Python 的 \`import\` 语句底层调用的其实是内置函数 \`__import__(name, globals=None, locals=None, fromlist=(), level=0)\`。你也可以直接调用它：

\`\`\`python
os_mod = __import__("os")
print(os_mod.getcwd())
\`\`\`

但 \`__import__\` 的返回值语义**有点反直觉**，尤其在处理 \`from X.Y import Z\` 时：

\`\`\`python
import sys
import os
# import os.path  →  __import__ 不带 fromlist 时返回的是 os（顶层包）
mod = __import__("os.path")
print(mod is os)          # True，返回 os 而不是 os.path！

# 想直接拿到 os.path 本身，要给 fromlist 传非空列表
# 这模拟 from os.path import join 的底层调用
mod = __import__("os.path", fromlist=["join"])
print(mod is sys.modules["os.path"])   # True，带 fromlist 时返回叶子模块 os.path
\`\`\`

这个设计是为了配合两种 import 语句：\`import os.path\` 只需在命名空间绑定顶层名 \`os\`，所以编译成不带 fromlist 的 \`__import__("os.path")\` 返回 \`os\`；而 \`from os.path import join\` 需要从 \`os.path\` 上取 \`join\` 属性，所以编译成 \`__import__("os.path", fromlist=["join"])\` 返回叶子模块 \`os.path\`。**fromlist 是否为空决定了返回顶层包还是叶子模块**，但对人类直接调用来说这套规则很不直观。

## importlib.import_module：推荐的动态导入 API

\`importlib.import_module(name, package=None)\` 是 Python 官方推荐的动态导入接口，语义直观：

\`\`\`python
import sys
import importlib

# 导入顶层模块
json_mod = importlib.import_module("json")
print(json_mod.dumps({"a": 1}))

# 导入子模块，返回的就是子模块本身（不是顶层包）
path_mod = importlib.import_module("os.path")
print(path_mod is sys.modules["os.path"])   # True，直接返回 os.path
\`\`\`

### import_module 与 \`\`__import__\`\` 的区别

| 对比项 | \`__import__(name)\` | \`import_module(name)\` |
| --- | --- | --- |
| 返回值 | name 为 \`X.Y\` 时不带 fromlist 返回顶层 \`X\`，带 fromlist 返回叶子 \`X.Y\` | 始终返回 \`name\` 指定的模块 |
| 语义直观度 | 反直觉，需配合 \`fromlist\` | 直观，返回的就是你要的模块 |
| \`package\` 参数 | 用 \`level\` 表示相对导入层级 | \`package\` 直接写包名，更清晰 |
| 推荐度 | 仅在需要兼容底层时用 | **官方推荐**，日常动态导入首选 |

### package 参数：相对导入的动态版

\`import_module(name, package)\` 中，\`package\` 用于把相对名字解析为绝对名字，等价于"在 \`package\` 包内部执行 \`from . import name\`"：

\`\`\`python
# 假设你在 pkg 包内，想动态导入 pkg.sub
sub = importlib.import_module(".sub", "pkg")   # 等价于 import pkg.sub
\`\`\`

## 从文件路径加载模块

有时候模块不在 \`sys.path\` 上，而是任意一个文件路径（比如用户上传的脚本、扫描到的插件文件）。这时 \`import_module\` 找不到它，要用更底层的三步法：

\`\`\`python
import importlib.util

# 第 1 步：根据文件路径创建 ModuleSpec（模块规格说明）
spec = importlib.util.spec_from_file_location("模块名", "/path/to/mod.py")

# 第 2 步：根据 spec 创建空的模块对象
module = importlib.util.module_from_spec(spec)

# 第 3 步：用 loader 执行模块代码，填充 module.__dict__
spec.loader.exec_module(module)

# 现在 module 里就有了 mod.py 定义的所有变量/函数/类
print(module.某变量)
\`\`\`

**为什么要三步而不是一步？** 因为这把"找规格"和"执行代码"解耦了：你可以在 \`module_from_spec\` 之后、\`exec_module\` 之前往 \`module.__dict__\` 里预先注入依赖（高级技巧），也可以只创建对象不执行。

### 一个常见的坑：忘记 exec_module

\`\`\`python
spec = importlib.util.spec_from_file_location("m", "m.py")
module = importlib.util.module_from_spec(spec)
print(module.x)   # AttributeError！还没 exec_module，模块是空的
\`\`\`

## ModuleSpec 对象详解

\`ModuleSpec\` 是 Python 3.4 引入的"模块加载规格"，记录了一个模块该如何被加载：

\`\`\`python
import importlib.util
spec = importlib.util.spec_from_file_location("demo", "/tmp/demo.py")
print(spec.name)                    # 'demo' 模块名
print(spec.origin)                  # '/tmp/demo.py' 源文件路径
print(spec.loader)                  # 加载器对象
print(spec.submodule_search_locations)  # 包的搜索路径（普通模块为 None）
print(spec.has_location)            # True 表示 origin 是个文件路径
\`\`\`

| 属性 | 含义 | 普通模块 | 包 |
| --- | --- | --- | --- |
| \`name\` | 模块全名 | \`'demo'\` | \`'mypkg'\` |
| \`origin\` | 源文件路径 | \`'/x/demo.py'\` | \`'/x/mypkg/__init__.py'\` |
| \`loader\` | 加载器 | \`SourceFileLoader\` | \`SourceFileLoader\` |
| \`submodule_search_locations\` | 子模块搜索路径 | \`None\` | \`['/x/mypkg']\` 列表 |

\`submodule_search_locations\` 决定了"这个模块是不是包"：非 \`None\` 即为包，包的子模块会从这个路径列表里找。

## 动态导入的应用场景

### 1. 插件架构

主程序定义插件接口（基类/协议），扫描插件目录下所有 \`.py\` 文件，用 \`spec_from_file_location\` 加载，检查是否有符合接口的类，注册到插件管理器。这样用户只要丢一个 \`.py\` 文件到插件目录就能扩展功能，主程序无需修改。

### 2. REPL 与交互式环境

Python 解释器本身就是动态导入的受益者：你在 \`>>>\` 里输入 \`import foo\`，解释器把 \`foo\` 当字符串去查找加载。Jupyter Notebook 的 \`%import\` 魔术、IPython 的自动重载都是基于 \`importlib\` 实现的。

### 3. 测试框架

\`pytest\` 收集 \`test_*.py\` 文件后，用动态导入把它们加载成模块，再扫描其中以 \`test_\` 开头的函数执行。没有动态导入，这种"按约定发现测试"的机制就无法实现。

### 4. 延迟加载（lazy import）

把 \`import heavy_module\` 包进函数里，第一次调用时才真正加载，加快启动速度。更极致的做法是用 \`importlib\` 配合自定义 loader 实现"访问属性时才导入"。

## 安全性考虑

动态导入用户输入有**代码注入风险**：

\`\`\`python
user_input = input("模块名: ")   # 用户输入 "os; import shutil; shutil.rmtree('/')"
mod = importlib.import_module(user_input)   # 危险！
\`\`\`

虽然 \`import_module\` 本身不会执行分号后的语句（它只接受模块名），但如果你的逻辑里混用了 \`exec\`、\`eval\`，或者把用户输入拼进文件路径用 \`exec_module\` 加载，就可能执行任意代码。

防御措施：
- **白名单校验**：只允许预定义的模块名集合。
- **沙箱隔离**：在子进程/容器里执行不可信代码。
- **路径校验**：加载文件时校验路径必须在指定目录内，防止 \`../\` 越权。
- **永远不要 \`exec\` 不可信字符串**。

## 延迟加载的两种方式

延迟加载（lazy import）是动态导入的重要应用，目的是**加快启动速度**——把重型模块推迟到真正用时才加载。分两种粒度：

### 函数级延迟

把 import 放进函数体，第一次调用时才加载：

\`\`\`python
def render_chart(data):
    import matplotlib.pyplot as plt   # 重型库，用到才加载
    plt.plot(data)
    plt.show()
\`\`\`

优点：简单直观，无需额外 API。缺点：首次调用有导入延迟；每个用到该模块的函数都要重复写 import（虽然 import 缓存让开销只发生一次，但代码重复）。

### 模块级延迟（LazyLoader）

\`importlib.util.LazyLoader\` 让 \`import\` 时只创建一个**占位模块**，首次访问其属性时才真正加载执行：

\`\`\`python
import importlib.util
import importlib.machinery

# 包装一个真实的 loader，变成懒加载 loader
real_loader = importlib.machinery.SourceFileLoader
lazy_loader = importlib.util.LazyLoader(real_loader)
spec = importlib.util.spec_from_loader("heavy", lazy_loader, "/path/heavy.py")
heavy = importlib.util.module_from_spec(spec)
importlib.util.LazyLoader  # 占位，首次访问 heavy.xxx 才执行
\`\`\`

\`LazyLoader\` 比较实验性，生产中更常用的是函数级延迟或显式 \`import_module\`。它的局限是模块的 \`__dict__\` 在加载前是空的，某些反射用法会提前触发加载。

### 延迟加载适合什么

- **启动时间敏感**：CLI 工具、服务进程希望快速就绪。
- **少数路径才用**：某个功能只有 10% 用户用到，没必要让所有用户启动时都加载。
- **可选依赖**：\`try: import ujson except ImportError: import json\`，按环境选实现。

不适合：几乎每次运行都会用到的核心依赖——延迟只是把开销挪到首次调用，总成本不变，反而让首次调用变慢。

## 自定义加载器简介

\`importlib\` 允许自定义 \`Loader\`，实现从**非标准来源**加载模块：数据库、网络、加密文件、内存中的字符串。核心是继承 \`importlib.abc.Loader\` 并实现 \`create_module\`/\`exec_module\`：

\`\`\`python
from importlib.abc import Loader
class StringLoader(Loader):
    def __init__(self, source):
        self.source = source
    def exec_module(self, module):
        exec(self.source, module.__dict__)
\`\`\`

配合 \`spec_from_loader\` 就能从字符串加载模块。这是高级话题，插件框架、模板引擎、远程代码加载器会用到。日常项目很少需要自己写 loader，但了解它有助于理解 import 系统的扩展性。

## 本章小结

- 静态导入模块名写死在源码里；动态导入模块名是运行时字符串。
- \`__import__\` 是底层接口，返回值语义反直觉（\`from X.Y import Z\` 返回 \`X\`）。
- \`importlib.import_module(name, package)\` 是推荐 API，返回值就是目标模块。
- 从文件路径加载用三步法：\`spec_from_file_location\` → \`module_from_spec\` → \`exec_module\`。
- \`ModuleSpec\` 记录模块加载规格，\`submodule_search_locations\` 区分包与普通模块。
- 主要应用：插件系统、REPL、测试框架、延迟加载。
- 动态导入用户输入有注入风险，需白名单/沙箱防护。

下面运行示例代码，亲手验证这些概念。`,
    code: `# -*- coding: utf-8 -*-
# 第一章演示代码：动态导入
# 演示 importlib.import_module、__import__、从文件路径加载、插件系统

import sys
import os
import importlib
import importlib.util
import tempfile
import textwrap
import shutil

print("===== 1. importlib.import_module 动态导入标准库 =====")
# import_module 接收模块名字符串，返回模块对象
# 等价于 import json，但模块名是运行时才决定的
json_mod = importlib.import_module("json")
print("import_module('json') 返回:", json_mod)
print("json_mod.dumps({'a': 1}) =", json_mod.dumps({"a": 1}))

# 也可以导入子模块，返回值就是子模块本身
hash_mod = importlib.import_module("hashlib")
print("import_module('hashlib') 返回:", hash_mod)
print("md5('abc') =", hash_mod.md5(b"abc").hexdigest())

print("\\n===== 2. __import__ 内置函数（底层接口）=====")
# __import__ 是 import 语句底层调用的函数
# 但它的返回值语义有点反直觉
os_mod = __import__("os")
print("__import__('os') 返回:", os_mod)
print("os_mod.getcwd() =", os_mod.getcwd())

# 对比 from os.path import join 的情况
# 注意：带 fromlist 时，__import__ 返回的是叶子模块 os.path，不是 os
mod = __import__("os.path", fromlist=["join"])
print("__import__('os.path', fromlist=['join']) 返回:", mod)
print("返回的是 os.path:", mod is sys.modules["os.path"])
print("join 函数:", mod.join("a", "b"))

# import_module 对这种情况更直观，直接返回 os.path
path_mod = importlib.import_module("os.path")
print("import_module('os.path') 返回:", path_mod)
print("返回的是 os.path:", path_mod is sys.modules["os.path"])

print("\\n===== 3. import_module vs __import__ 对比表 =====")
# 用变量存标签，避免在 f-string 表达式里出现反斜杠（Python<3.12 不允许）
print(f"{'操作':<32}{'返回的模块'}")
print("-" * 65)
r1 = importlib.import_module('os')
r2 = __import__('os')
r3 = importlib.import_module('os.path')
r4 = __import__('os.path')   # 注意：__import__ 返回 os，不是 os.path！
# 标签是单引号字符串内含双引号，无需反斜杠转义
rows = [
    ('import_module("os")', r1),
    ('__import__("os")', r2),
    ('import_module("os.path")', r3),
    ('__import__("os.path")', r4),
]
for label, mod in rows:
    print(f"{label:<32}{mod}")
print("-> __import__('os.path') 返回的是 os（顶层包），不是 os.path")
print("-> import_module 语义更直观，推荐使用")

print("\\n===== 4. 从文件路径加载模块（三步法）=====")
# 当模块不在 sys.path 上，而是任意文件路径时
tmpdir = tempfile.mkdtemp()
mod_path = os.path.join(tmpdir, "myplugin.py")
with open(mod_path, "w", encoding="utf-8") as f:
    f.write(textwrap.dedent('''
        # 这是一个独立的 .py 文件，不在任何包里
        VERSION = "1.0.0"
        def greet(name):
            return f"你好，{name}！我是 myplugin"
        class Plugin:
            name = "myplugin"
            def run(self):
                return "插件运行中"
    ''').strip())

# 三步加载法
spec = importlib.util.spec_from_file_location("myplugin", mod_path)
print("ModuleSpec 对象:", spec)
print("spec.name   =", spec.name)
print("spec.origin =", spec.origin)        # 文件路径
print("spec.loader =", spec.loader)
print("spec.submodule_search_locations =", spec.submodule_search_locations)  # 普通模块为 None
print("spec.has_location =", spec.has_location)

module = importlib.util.module_from_spec(spec)  # 创建空模块对象
print("执行前 module 的自定义属性:", [k for k in vars(module) if not k.startswith("__")])
spec.loader.exec_module(module)                  # 执行模块代码，填充 __dict__
print("执行后 module 的自定义属性:", [k for k in vars(module) if not k.startswith("__")])

print("module.VERSION =", module.VERSION)
print("module.greet('世界') =", module.greet("世界"))
print("module.Plugin().run() =", module.Plugin().run())

print("\\n===== 5. 查看模块加载后的内部状态 =====")
print("module.__name__   =", module.__name__)
print("module.__file__   =", module.__file__)
print("module.__spec__   =", module.__spec__)
print("module.__loader__ =", module.__loader__)
print("module.__package__=", getattr(module, "__package__", None))

print("\\n===== 6. 模拟插件系统：扫描目录动态加载 =====")
# 插件系统：扫描目录，动态加载所有 .py 插件文件
plugins_dir = os.path.join(tmpdir, "plugins")
os.makedirs(plugins_dir)

# 写几个插件文件
with open(os.path.join(plugins_dir, "plugin_a.py"), "w", encoding="utf-8") as f:
    f.write("NAME = '插件A'\\nDESC = '第一个插件'\\nORDER = 1\\n")
with open(os.path.join(plugins_dir, "plugin_b.py"), "w", encoding="utf-8") as f:
    f.write("NAME = '插件B'\\nDESC = '第二个插件'\\nORDER = 2\\n")
# 这个下划线开头的文件应该被跳过（约定不作为插件）
with open(os.path.join(plugins_dir, "_base.py"), "w", encoding="utf-8") as f:
    f.write("NAME = '基类，不应被加载'\\n")

print("扫描到的插件：")
loaded_plugins = {}
for fname in sorted(os.listdir(plugins_dir)):
    if fname.endswith(".py") and not fname.startswith("_"):
        name = fname[:-3]
        path = os.path.join(plugins_dir, fname)
        spec = importlib.util.spec_from_file_location(f"plugin_{name}", path)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        loaded_plugins[name] = mod
        print(f"  加载 {name}: NAME={mod.NAME}, DESC={mod.DESC}")

print("\\n按 ORDER 排序调用所有插件：")
for name, mod in sorted(loaded_plugins.items(), key=lambda kv: kv[1].ORDER):
    print(f"  [{mod.ORDER}] {name} -> {mod.NAME}：{mod.DESC}")

print("\\n===== 7. 安全性提示：动态导入用户输入有风险 =====")
# 如果模块名来自不可信输入，需白名单校验
ALLOWED_MODULES = {"json", "hashlib", "math", "os"}
user_input = "json"  # 假装这是用户输入
if user_input not in ALLOWED_MODULES:
    print(f"拒绝导入 {user_input}：不在白名单中")
else:
    safe_mod = importlib.import_module(user_input)
    print(f"通过白名单校验，导入了 {user_input}，类型:", type(safe_mod).__name__)
print("-> 危险模块如 subprocess 应排除在白名单外")

print("\\n===== 8. package 参数说明 =====")
# import_module(name, package) 中 package 用于解析相对导入名
# import_module(".sub", "pkg") 等价于 import pkg.sub
print("package 参数把相对名字解析为绝对名字")
print("import_module('.sub', 'pkg') 等价于 import pkg.sub")
print("import_module('..sibling', 'pkg.sub') 等价于从 pkg.sub 导入 pkg.sibling")

# 清理临时目录
shutil.rmtree(tmpdir, ignore_errors=True)
print("\\n动态导入演示完成！")
`,
  },

  // =========================================================
  // 第二章：循环导入
  // =========================================================
  {
    id: "py-mod-circular",
    group: "高级机制",
    icon: "🔄",
    title: "循环导入",
    content: `## 什么是循环导入

**循环导入（circular import）** 指模块 A 导入 B，B 又导入 A，形成一个环。复杂的还可能是 A → B → C → A 这种多跳环。

\`\`\`
a.py: import b
b.py: import a
\`\`\`

循环导入本身**不是语法错误**（Python 不会编译期报错），但在运行时经常引发 \`AttributeError\` 或 \`ImportError\`，是 Python 项目里最常见的"玄学问题"之一。

## 为什么循环导入是问题

要理解循环导入为什么出错，必须先理解 Python 的导入机制：**模块对象先注册到 \`sys.modules\`，再执行模块顶层代码**。

正常导入 A 的流程：

1. 检查 \`sys.modules["a"]\`，没有就创建一个**空的模块对象**，注册到 \`sys.modules["a"]\`。
2. 开始执行 \`a.py\` 的顶层代码。
3. 执行到 \`import b\`，转去导入 B：
   - 检查 \`sys.modules["b"]\`，没有就创建空对象注册，执行 \`b.py\`。
   - \`b.py\` 执行到 \`import a\`，检查 \`sys.modules["a"]\`——**已经有了**（第 1 步注册的空对象），于是直接返回这个**还没执行完**的 A。
4. B 拿到的 A 是个"半成品"（只执行了 \`import b\` 之前的代码，之后的还没执行）。
5. 如果 B 接着访问 \`a.某名字\`，而这个名字恰好在 \`import b\` **之后**才定义，就会 \`AttributeError\`。

这就是经典的 **"partially initialized module"** 错误。

## 典型错误信息

\`\`\`
ImportError: cannot import name 'x' from partially initialized module 'a'
(most likely due to a circular import)
\`\`\`

Python 3.7+ 的错误信息已经会主动提示"很可能是因为循环导入"，非常友好。

## 循环导入的几种情况

### 情况一：顶层 import 形成环（出错）

\`\`\`python
# a.py
import b
def foo(): return b.bar()
print("a 加载完成")

# b.py
import a          # 此时 a 还没执行完！
def bar(): return a.foo()   # 运行时调用才出错
print("b 加载完成")
\`\`\`

\`python a.py\` 时：
- 注册空 a，执行 a.py → \`import b\` → 注册空 b，执行 b.py → \`import a\`（a 已存在，返回半成品）→ b.py 执行完 → 回到 a.py 继续。

这种**顶层 import 但不在导入时立刻访问属性**的情况，其实**可能不报错**（只是埋了雷）。但如果在顶层就 \`from a import foo\` 取属性，就立刻炸。

### 情况二：函数内 import（可行）

\`\`\`python
# a.py
import b
def foo(): return b.bar()

# b.py
def bar():
    import a       # 延迟到函数被调用时才 import
    return a.foo()
\`\`\`

把 \`import a\` 移到函数体内，调用 \`bar()\` 时 A 早已加载完毕，循环就被打破了。这是**最常用的快速解法**。

### 情况三：from import 取属性（必出错）

\`\`\`python
# a.py
from b import bar     # 导入时就要取 b.bar 这个属性
def foo(): return bar()

# b.py
from a import foo     # 导入时就要取 a.foo，但 a 还没定义 foo！
def bar(): return foo()
\`\`\`

\`from X import name\` 在导入瞬间就要访问 \`X.name\`，如果此时 X 没执行到 \`name\` 的定义，就 \`ImportError: cannot import name 'foo'\`。这是**最危险**的循环导入形式。

| 形式 | 是否出错 | 原因 |
| --- | --- | --- |
| \`import b\`（顶层，不立即取属性） | 多数不报错，但埋雷 | 拿到半成品模块对象，函数调用时才可能炸 |
| \`import b\` 放函数内 | 不出错 | 调用时模块已加载完 |
| \`from b import x\`（顶层） | 通常出错 | 导入瞬间就要取 \`b.x\`，而 \`b\` 还没定义 \`x\` |

## 解决循环导入的方法

### 方法一：重构消除循环（最佳）

循环导入往往是**设计问题**的信号：两个模块互相依赖，说明它们该被重新切分。把双方都依赖的东西抽到一个**更底层的公共模块**，让依赖方向变成单向：

\`\`\`
重构前：a ↔ b（双向）
重构后：a → common ← b（a 和 b 都依赖 common，互不依赖）
\`\`\`

依赖图应该是 **DAG（有向无环图）**，出现环就该警惕。

### 方法二：延迟导入（函数内 import）

把 \`import\` 移到函数体内，运行时才导入。简单有效，但会让函数每次调用的首次开销变大，且依赖关系不直观（看模块顶部 import 看不出依赖）。

\`\`\`python
def process(data):
    import heavy_module   # 用到才导入
    return heavy_module.handle(data)
\`\`\`

### 方法三：抽共享代码到第三模块

如果 A 和 B 都需要某个常量/函数，把它放进 \`common.py\`，A 和 B 都 \`import common\`，A 和 B 之间就不再互相依赖。

### 方法四：TYPE_CHECKING 保护类型注解

很多时候循环导入只是因为**类型注解**需要引用对方类，运行时根本用不到。用 \`typing.TYPE_CHECKING\` 守卫：

\`\`\`python
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    # 这个块只在类型检查器（mypy/pyright）里执行，运行时不执行
    from b import B   # 不会引发运行时循环导入

class A:
    def handle(self, b: "B") -> None: ...   # 用字符串前向引用
\`\`\`

\`TYPE_CHECKING\` 在运行时恒为 \`False\`，所以 \`import\` 不会真正执行，完美避开循环。

## 如何诊断循环导入

1. **看错误信息**：3.7+ 会提示 "most likely due to a circular import"。
2. **打印 \`sys.modules.keys()\`**：在可疑位置打印已加载模块，看谁还没加载完。
3. **看 traceback**：栈帧里出现 \`a → b → a\` 的来回跳转就是循环。
4. **用工具**：\`importx\`（pip install importx）的 \`importx.show\` 可可视化导入图。

## 真实场景：Web 应用里的循环导入

循环导入在真实项目里很常见。一个典型例子是 Flask/Django 应用里 \`models.py\` 与 \`extensions.py\` 互相引用：

\`\`\`python
# models.py
from extensions import db        # 需要 db 做基类
class User(db.Model):
    name = db.Column(db.String)

# extensions.py
from models import User          # 需要注册 User
db = SQLAlchemy()
db.register_models([User])
\`\`\`

\`models\` 在导入时就要 \`db.Model\`（\`extensions\` 必须先加载完），而 \`extensions\` 又要在导入时拿到 \`User\` 注册——形成死锁。

**解法**：把 \`db\` 的定义和 \`Model\` 的使用分开。\`extensions.py\` 只定义 \`db\`，不注册模型；注册推迟到应用初始化函数里（延迟到所有模型都加载完）：

\`\`\`python
# extensions.py
db = SQLAlchemy()   # 只定义，不引用 models

# models.py
from extensions import db
class User(db.Model): ...   # 此时 db 已完整

# app.py（入口）
import models
from extensions import db
db.register_models([models.User])   # 延迟注册
\`\`\`

依赖方向变成 \`app → models → extensions\`，单向无环。这是"把共享代码下沉"和"延迟到运行时"的综合运用。

## 循环导入一定是坏事吗

不一定。如果两个模块只是**顶层 \`import\`**（不立刻取属性），且实际访问都发生在函数被调用时（那时模块早已加载完），这种循环导入在运行时**不会报错**，只是设计上不优雅。

判断循环导入是否会出问题，看两点：

1. **导入时是否立刻取属性**：\`from X import name\` 会立刻取，\`import X\` 不会。
2. **取属性时模块是否已加载完**：函数内调用时通常已加载完，模块顶层取属性时可能没加载完。

\`\`\`python
# 这种循环导入通常能跑（不在导入瞬间取属性）
# a.py
import b
def use_b(): return b.value   # 调用时 b 已完整

# b.py
import a
def use_a(): return a.value   # 调用时 a 已完整
\`\`\`

但即便"能跑"，也应重构消除，因为：依赖图有环会让阅读、测试、重构都变难，且任何一次改动（比如加个顶层 \`from import\`）都可能引爆埋着的雷。**"现在没报错"不等于"安全"**。

## 小结：循环导入的排查清单

遇到疑似循环导入时，按这个清单排查：

1. 错误信息是否含 \`partially initialized module\` 或 \`cannot import name\`？
2. traceback 里是否出现 \`a → b → a\` 的来回跳转？
3. 把 \`from X import name\` 改成 \`import X\` + \`X.name\` 是否消失？（若是，就是 \`from import\` 取属性时机问题）
4. 把可疑 \`import\` 移进函数体是否消失？（若是，就是顶层导入循环）
5. 画依赖图，找环，重构消除。

## 本章小结

- 循环导入是模块 A 依赖 B、B 又依赖 A 形成的环。
- 根因：模块对象先注册到 \`sys.modules\` 再执行，循环时拿到的是"半成品"模块。
- 三种形式：顶层 \`import\`（埋雷）、函数内 \`import\`（安全）、\`from import\` 取属性（必炸）。
- 解决：优先重构消除环；快速止血用延迟导入；类型注解用 \`TYPE_CHECKING\`。
- 依赖图应是无环 DAG，出现环就是设计警告。

下面运行示例代码，亲手验证这些概念。`,
    code: `# -*- coding: utf-8 -*-
# 第二章演示代码：循环导入
# 用临时文件构造互相导入的模块，演示各种循环导入情况

import sys
import os
import tempfile
import textwrap
import shutil

print("===== 1. 演示顶层循环导入会报错 =====")
# 构造 a.py 和 b.py 互相 from import，会触发 ImportError
tmpdir = tempfile.mkdtemp()
with open(os.path.join(tmpdir, "a.py"), "w", encoding="utf-8") as f:
    f.write(textwrap.dedent('''
        from b import bar      # 导入瞬间就要取 b.bar
        def foo():
            return bar() + " <- from a"
        print("a 加载完成")
    ''').strip())
with open(os.path.join(tmpdir, "b.py"), "w", encoding="utf-8") as f:
    f.write(textwrap.dedent('''
        from a import foo      # 导入瞬间就要取 a.foo，但 a 还没定义完
        def bar():
            return "b.bar"
        print("b 加载完成")
    ''').strip())

sys.path.insert(0, tmpdir)
# 清理可能残留的缓存
for n in ("a", "b"):
    sys.modules.pop(n, None)

try:
    import a   # 触发循环导入
    print("居然没报错？", a.foo())
except ImportError as e:
    print("捕获到 ImportError（循环导入）：")
    print("  错误信息:", e)
except Exception as e:
    print("捕获到其他异常:", type(e).__name__, e)

# 清理缓存，为下一组演示做准备
for n in ("a", "b"):
    sys.modules.pop(n, None)

print("\\n===== 2. 演示函数内 import 可解决循环 =====")
# 把 b.py 的 import a 移到函数体内
with open(os.path.join(tmpdir, "b.py"), "w", encoding="utf-8") as f:
    f.write(textwrap.dedent('''
        def bar():
            import a            # 延迟到函数调用时才导入，此时 a 已加载完
            return "b.bar 调用了 " + a.foo()
        print("b 加载完成")
    ''').strip())
# a.py 也改成不立刻取属性
with open(os.path.join(tmpdir, "a.py"), "w", encoding="utf-8") as f:
    f.write(textwrap.dedent('''
        import b                # 顶层 import，拿到 b 模块对象（不取属性）
        def foo():
            return "a.foo"
        print("a 加载完成")
    ''').strip())

for n in ("a", "b"):
    sys.modules.pop(n, None)

import a
print("a 导入成功，a.foo() =", a.foo())
print("a.b.bar() =", a.b.bar())   # 调用时 b 内部才 import a，此时 a 已完整

print("\\n===== 3. 打印执行顺序，说明先注册后执行 =====")
with open(os.path.join(tmpdir, "a.py"), "w", encoding="utf-8") as f:
    f.write(textwrap.dedent('''
        print("[a] 开始执行 a.py 顶层代码")
        print("[a] 此时 sys.modules 里有 a 吗:", 'a' in __import__('sys').modules)
        import b
        print("[a] 导入 b 后，a 仍在 sys.modules:", 'a' in __import__('sys').modules)
        VALUE_IN_A = 42
        print("[a] a.py 执行完成，定义了 VALUE_IN_A =", VALUE_IN_A)
    ''').strip())
with open(os.path.join(tmpdir, "b.py"), "w", encoding="utf-8") as f:
    f.write(textwrap.dedent('''
        print("[b] 开始执行 b.py 顶层代码")
        import a
        print("[b] 拿到的 a 是否有 VALUE_IN_A:", hasattr(a, 'VALUE_IN_A'))
        print("[b] （如果没有，说明 a 是半成品）")
        VALUE_IN_B = 7
        print("[b] b.py 执行完成")
    ''').strip())

for n in ("a", "b"):
    sys.modules.pop(n, None)
print("--- 导入 a，观察执行顺序 ---")
import a
print("--- a 导入结束 ---")
print("结论：b 在执行时拿到的 a 是半成品，没有 VALUE_IN_A")

print("\\n===== 4. 演示 from import 在循环中的 AttributeError =====")
# from X import name 要求导入瞬间属性已存在
with open(os.path.join(tmpdir, "a.py"), "w", encoding="utf-8") as f:
    f.write(textwrap.dedent('''
        import b
        LATER = "定义在 import b 之后"
        print("[a] 执行完")
    ''').strip())
with open(os.path.join(tmpdir, "b.py"), "w", encoding="utf-8") as f:
    f.write(textwrap.dedent('''
        from a import LATER   # 此时 a 还没执行到 LATER 的定义
        print("[b] 拿到 LATER =", LATER)
    ''').strip())

for n in ("a", "b"):
    sys.modules.pop(n, None)
try:
    import b
    print("b 导入成功")
except ImportError as e:
    print("捕获到 ImportError（from import 取不到属性）：")
    print("  错误:", e)

print("\\n===== 5. 用 TYPE_CHECKING 解决类型注解的循环 =====")
# 演示 TYPE_CHECKING 守卫：运行时不执行 import，避免循环
with open(os.path.join(tmpdir, "a.py"), "w", encoding="utf-8") as f:
    f.write(textwrap.dedent('''
        from typing import TYPE_CHECKING
        if TYPE_CHECKING:
            from b import B    # 仅类型检查器执行，运行时跳过
        class A:
            def handle(self, b: "B") -> str:
                return "A 处理了 " + type(b).__name__
        print("[a] 加载完成")
    ''').strip())
with open(os.path.join(tmpdir, "b.py"), "w", encoding="utf-8") as f:
    f.write(textwrap.dedent('''
        from typing import TYPE_CHECKING
        if TYPE_CHECKING:
            from a import A
        class B:
            def __init__(self, name: str):
                self.name = name
            def link(self, a: "A") -> str:
                return a.handle(self)
        print("[b] 加载完成")
    ''').strip())

for n in ("a", "b"):
    sys.modules.pop(n, None)
import a
import b
print("TYPE_CHECKING 守卫下，a、b 都能正常导入")
inst_a = a.A()
inst_b = b.B("我的B")
print("调用跨类型方法:", inst_b.link(inst_a))

print("\\n===== 6. 诊断技巧：打印 sys.modules 状态 =====")
print("当前已加载的本地模块:", [k for k in sys.modules if k in ("a", "b")])
print("提示：循环导入报错时，看 traceback 里 a->b->a 的来回跳转即可定位")

# 清理
sys.path.remove(tmpdir)
for n in ("a", "b"):
    sys.modules.pop(n, None)
shutil.rmtree(tmpdir, ignore_errors=True)
print("\\n循环导入演示完成！")
`,
  },

  // =========================================================
  // 第三章：模块重载
  // =========================================================
  {
    id: "py-mod-reload",
    group: "高级机制",
    icon: "🔁",
    title: "模块重载",
    content: `## 为什么需要重载

Python 的 \`import\` 有个"只加载一次"的特性：模块首次导入后会被缓存进 \`sys.modules\`，之后所有 \`import\` 都直接返回缓存对象，**不会重新读取源文件**。

\`\`\`python
import mymod        # 第一次：读 mymod.py，执行，缓存
import mymod        # 第二次：直接返回缓存，不读文件
\`\`\`

这个特性对性能和模块单例语义很重要，但在**开发调试**时很烦：你在 REPL 里 \`import mymod\`，然后去改了 \`mymod.py\` 的源码，再 \`import mymod\`——拿到的是旧代码！必须重启解释器才能生效。

\`importlib.reload(module)\` 就是为这个场景设计的：**强制重新执行模块源码，更新模块对象**。

## importlib.reload(module)

\`\`\`python
import importlib
import mymod

# 改了 mymod.py 之后
importlib.reload(mymod)   # 重新读文件、重新执行、更新 mymod.__dict__
\`\`\`

注意 \`reload\` 接收的是**模块对象本身**（不是名字字符串），返回值是重载后的模块对象（通常就是同一个对象）。

## reload 的行为细节

理解 \`reload\` 必须抓住几个关键点：

### 1. 重新执行模块代码

\`reload\` 会重新读取模块源文件并执行顶层代码，所以源码里改了的变量值、函数定义都会被更新。

### 2. 模块对象本身不变（id 相同）

\`reload\` **不创建新的模块对象**，而是**在原对象上原地更新 \`__dict__\`**。所以 \`id(module)\` 前后不变，所有引用该模块的地方自动看到新代码。

\`\`\`python
m = mymod
importlib.reload(mymod)
print(m is mymod)   # True，同一对象
\`\`\`

### 3. __dict__ 是"覆盖更新"，不删除旧键

\`reload\` 重新执行代码，新定义的名字会覆盖旧的，**但原代码里删掉的名字不会从 \`__dict__\` 里消失**——旧的键会残留。这是 \`reload\` 一个容易踩的坑。

### 4. 不递归重载子模块

如果模块 \`pkg\` 导入了子模块 \`pkg.sub\`，\`reload(pkg)\` **不会**自动重载 \`pkg.sub\`。要单独 \`reload(pkg.sub)\`。

### 5. from import 的旧引用不会更新

这是最大的陷阱：

\`\`\`python
from mymod import x     # x 绑定到旧值
importlib.reload(mymod) # 重载，mymod.x 变成新值
print(x)                # 还是旧值！x 是独立引用，不随 reload 更新
\`\`\`

要拿到新值，必须重新 \`import mymod; mymod.x\` 或再次 \`from mymod import x\`。

## reload 的陷阱一览

| 陷阱 | 表现 | 应对 |
| --- | --- | --- |
| \`from mod import x\` 不更新 | \`x\` 还是旧值 | 改用 \`import mod; mod.x\` |
| 子模块不递归重载 | \`reload(pkg)\` 后 \`pkg.sub\` 仍是旧的 | 手动 \`reload(pkg.sub)\` |
| 旧键残留 | 删除的定义仍能访问 | 重启解释器最干净 |
| 类定义变成新对象 | 旧实例仍是旧类，\`isinstance\` 可能失败 | 重新创建实例 |
| 全局可变状态保留 | 列表/字典等被原地修改的值可能"半新半旧" | 避免依赖 reload 做生产热更 |

### 类定义的陷阱详解

\`\`\`python
# mod.py
class Foo:
    def m(self): return "v1"
\`\`\`

\`reload\` 后 \`mod.Foo\` 是**新的类对象**（因为重新执行了 \`class Foo\` 语句）。但之前创建的实例 \`old = mod.Foo()\` 仍是**旧类**的实例：

\`\`\`python
import importlib, mod
old = mod.Foo()
importlib.reload(mod)        # mod.Foo 变成新类
print(type(old) is mod.Foo)  # False！old 还是旧类
print(old.m())               # 旧类的 m，"v1"
\`\`\`

\`isinstance(old, mod.Foo)\` 甚至会变成 \`False\`，这对依赖类型检查的代码是灾难。

## reload 的应用场景

### 1. REPL / 交互式开发

在 \`python -i\` 或 IPython 里改完代码 \`reload\` 一下，不用重启，保留当前命名空间的状态。IPython 的 \`%autoreload\` 魔术就是自动帮你做这事。

### 2. Jupyter Notebook

Notebook 里 \`import\` 一次后改源码，\`reload\` 生效。配合 \`%autoreload 2\` 可以全自动重载。

### 3. 热更新（谨慎）

服务运行时 \`reload\` 配置模块实现"不停机更新配置"。但**生产环境慎用** reload 做代码热更，因为上面那些陷阱（旧引用、类对象变化）会导致状态不一致。真正的热更新应该用进程重启或专门的热更框架。

### 4. 调试

调试时改一行代码 \`reload\` 立即验证，比重启快得多。

## reload 不能用于 __main__

\`reload\` 要求模块已经在 \`sys.modules\` 里且来自可定位的源文件。\`__main__\` 模块（你直接 \`python script.py\` 运行的脚本）的 \`__spec__\` 通常是 \`None\`，找不到源文件，所以 \`reload(__main__)\` 会报错。

\`\`\`python
importlib.reload(__main__)   # ImportError/TypeError
\`\`\`

要在脚本里"重载自己"，得用别的方式（如 \`exec(open(__file__).read())\`，但很 hacky）。

## IPython / Jupyter 的自动重载

手动 \`reload\` 繁琐，IPython/Jupyter 提供了 \`%autoreload\` 魔术命令自动重载修改过的模块：

\`\`\`python
%load_ext autoreload
%autoreload 2     # 每次执行单元格前自动重载所有修改过的模块
\`\`\`

\`%autoreload\` 的模式：

| 模式 | 行为 |
| --- | --- |
| \`0\` | 关闭自动重载 |
| \`1\` | 只重载 \`%aimport\` 显式指定的模块 |
| \`2\` | 重载所有模块（除 \`%aimport -\` 排除的） |

它底层就是用 \`importlib.reload\`，但加了"检测文件修改时间"的智能判断。开发 Jupyter 时强烈建议开 \`%autoreload 2\`，改完源码立即生效，不用手动 reload。

注意：\`%autoreload\` 也逃不掉 reload 的那些陷阱（旧引用不更新、类对象变化），只是减少了手动 reload 的麻烦，并不能消除根本机制问题。所以 Notebook 里若发现"改了代码还报旧错"，多半是 autoreload 没覆盖到（如 \`from import\` 的旧引用）。

## reload 与可变全局状态

reload 后，模块里**重新赋值**的变量会更新，但**被外部原地修改**的可变对象（列表、字典）可能出现"半新半旧"的不一致：

\`\`\`python
# mod.py
config = {"a": 1}
\`\`\`

\`\`\`python
import importlib, mod
mod.config["b"] = 2          # 外部原地改了旧 dict
importlib.reload(mod)        # 重载，mod.config 被重新赋值为 {"a": 1}
print(mod.config)            # {"a": 1}，整个 dict 被新赋值覆盖
\`\`\`

但如果外部保存了对**旧 \`config\` 字典**的引用，那个引用还是旧的（带 \`b\`）：

\`\`\`python
old_cfg = mod.config         # 拿到旧 dict 引用
mod.config["b"] = 2
importlib.reload(mod)        # mod.config 指向新 dict
print(old_cfg)               # 旧 dict，仍有 b
print(mod.config)            # 新 dict，无 b
print(old_cfg is mod.config) # False，已不是同一对象
\`\`\`

这就是"模块内重新赋值 vs 外部持有的旧引用"的脱节，是 reload 最隐蔽的坑，也是生产环境不建议用 reload 做"配置热更"的根本原因——容易留下旧引用导致行为不一致。

## reload 的正确心态

记住 reload 的本质：**原地更新 \`__dict__\`，不创建新对象，不撤销旧引用**。所以：

- 用 \`import mod; mod.x\` 访问 → 总是最新值（推荐）。
- 用 \`from mod import x\` 拿到的 \`x\` → reload 后仍是旧值（坑）。
- 类、函数等"赋值型"定义 → reload 后是新对象，旧引用指向旧对象。
- 模块级的可变对象 → 看是"重新赋值"还是"原地改"，结果不同。

## reload vs 重新启动进程

| 对比项 | \`reload\` | 重启进程 |
| --- | --- | --- |
| 速度 | 快（不重初始化整个程序） | 慢（重新启动） |
| 状态保留 | 保留（部分） | 全部丢失 |
| 干净程度 | 旧键/旧引用残留 | 完全干净 |
| 可靠性 | 有陷阱（类/引用问题） | 100% 可靠 |
| 适用 | 开发调试、REPL | 生产部署 |

经验法则：**开发调试用 reload 图快；生产部署老老实实重启进程**。reload 是开发期工具，不是生产期的"热更新"银弹。

## 动手实现一个简易热重载

理解了 reload 的机制，可以写个简易的"文件变化即重载"循环（开发期工具雏形）：

\`\`\`python
import importlib, os, time
import mymodule

mt_old = os.path.getmtime(mymodule.__file__)
while True:
    mt_new = os.path.getmtime(mymodule.__file__)
    if mt_new != mt_old:
        importlib.reload(mymodule)   # 文件变了就重载
        mt_old = mt_new
        print("已重载", mymodule.__file__)
    time.sleep(1)
\`\`\`

这就是 \`%autoreload\` 的核心思路：轮询文件修改时间，变了就 reload。真实工具会加防抖、异常处理、递归重载子模块等，但原理一致。

注意这种热重载**只适合开发**：生产环境里循环轮询、reload 带来的状态不一致风险都不可接受。要真正的生产热更，用多进程 + 优雅重启（先停接收新请求，等旧请求处理完，再换新进程）。

## 本章小结

- \`import\` 只加载一次（\`sys.modules\` 缓存），改了源码要 \`importlib.reload\` 才生效。
- \`reload(module)\` 接收模块对象，重新执行源码，**原对象不变**（id 相同）。
- \`__dict__\` 是覆盖更新，旧键残留；\`from import\` 的引用不更新；子模块不递归重载。
- 类重载后是新类对象，旧实例仍是旧类，\`isinstance\` 可能失效。
- 主要用途：REPL/Jupyter 开发、调试、配置热更（生产慎用）。
- \`__main__\` 不能 reload。

下面运行示例代码，亲手验证这些概念。`,
    code: `# -*- coding: utf-8 -*-
# 第三章演示代码：模块重载
# 用临时文件演示 reload 的行为、陷阱、与 from import 的差异

import sys
import os
import importlib
import tempfile
import textwrap
import shutil

print("===== 1. 基本重载：修改源码后 reload 生效 =====")
tmpdir = tempfile.mkdtemp()
mod_path = os.path.join(tmpdir, "counter_mod.py")
sys.path.insert(0, tmpdir)

# 第一版：VALUE = 1
with open(mod_path, "w", encoding="utf-8") as f:
    f.write("VALUE = 1\\nTAG = '第一版'\\ndef get(): return VALUE\\n")

import counter_mod
print("首次导入: VALUE =", counter_mod.VALUE, ", TAG =", counter_mod.TAG)
print("get() =", counter_mod.get())

# 再次 import 不会重新加载（缓存）
import counter_mod as cm2
print("再次 import 是同一对象:", counter_mod is cm2)

# 修改源文件
with open(mod_path, "w", encoding="utf-8") as f:
    f.write("VALUE = 999\\nTAG = '第二版'\\ndef get(): return VALUE\\n")

# 直接 import 仍是旧值
print("改源码后直接 import（仍是旧值）: VALUE =", counter_mod.VALUE)

# reload 后变新值
importlib.reload(counter_mod)
print("reload 后: VALUE =", counter_mod.VALUE, ", TAG =", counter_mod.TAG)
print("reload 后 get() =", counter_mod.get())

print("\\n===== 2. 模块对象 id 不变（原地更新）=====")
obj_id_before = id(counter_mod)
importlib.reload(counter_mod)
obj_id_after = id(counter_mod)
print("reload 前 id =", obj_id_before)
print("reload 后 id =", obj_id_after)
print("id 相同（同一对象）:", obj_id_before == obj_id_after)
print("sys.modules 里的也是同一对象:", sys.modules["counter_mod"] is counter_mod)

print("\\n===== 3. 陷阱一：from import 的引用不更新 =====")
# 重新写一个干净版本
with open(mod_path, "w", encoding="utf-8") as f:
    f.write("X = '旧值'\\n")
# 清缓存重新导入
sys.modules.pop("counter_mod", None)
import counter_mod
from counter_mod import X        # X 绑定到当前值"旧值"
print("from import 拿到 X =", X)
print("counter_mod.X =", counter_mod.X)

# 改源码并 reload
with open(mod_path, "w", encoding="utf-8") as f:
    f.write("X = '新值'\\n")
importlib.reload(counter_mod)
print("reload 后 counter_mod.X =", counter_mod.X, "（已更新）")
print("但 from import 的 X 仍是:", X, "（未更新！）")
print("结论：要拿新值必须用 import mod; mod.X，或再次 from mod import X")

print("\\n===== 4. 陷阱二：旧键残留（不删除）=====")
with open(mod_path, "w", encoding="utf-8") as f:
    f.write("KEEP = 1\\nREMOVE_ME = '会被删的'\\n")
sys.modules.pop("counter_mod", None)
import counter_mod
print("第一版属性:", sorted(k for k in vars(counter_mod) if not k.startswith("__")))

# 改源码：删掉 REMOVE_ME，加个 NEW
with open(mod_path, "w", encoding="utf-8") as f:
    f.write("KEEP = 1\\nNEW = '新加的'\\n")
importlib.reload(counter_mod)
print("reload 后属性:", sorted(k for k in vars(counter_mod) if not k.startswith("__")))
print("REMOVE_ME 还在吗:", hasattr(counter_mod, "REMOVE_ME"), "（残留！）")
print("NEW 加上了吗:", hasattr(counter_mod, "NEW"))
print("结论：reload 不删除 __dict__ 里的旧键，重启才干净")

print("\\n===== 5. 陷阱三：类重载后是新类，旧实例仍是旧类 =====")
class_path = os.path.join(tmpdir, "klass_mod.py")
with open(class_path, "w", encoding="utf-8") as f:
    f.write("class Foo:\\n    def m(self): return 'v1'\\n")
import klass_mod
old_inst = klass_mod.Foo()
print("旧实例 old_inst.m() =", old_inst.m())

with open(class_path, "w", encoding="utf-8") as f:
    f.write("class Foo:\\n    def m(self): return 'v2'\\n")
importlib.reload(klass_mod)
print("reload 后 klass_mod.Foo().m() =", klass_mod.Foo().m(), "（新类）")
print("但 old_inst.m() =", old_inst.m(), "（旧实例仍是旧类）")
print("type(old_inst) is klass_mod.Foo:", type(old_inst) is klass_mod.Foo, "（类对象已变）")
print("isinstance(old_inst, klass_mod.Foo):", isinstance(old_inst, klass_mod.Foo), "（可能 False！）")

print("\\n===== 6. 陷阱四：reload 不递归重载子模块 =====")
pkg_dir = os.path.join(tmpdir, "mypkg")
os.makedirs(pkg_dir)
with open(os.path.join(pkg_dir, "__init__.py"), "w", encoding="utf-8") as f:
    f.write("from . import sub\\nINIT_TAG = 'init-v1'\\n")
with open(os.path.join(pkg_dir, "sub.py"), "w", encoding="utf-8") as f:
    f.write("SUB_TAG = 'sub-v1'\\n")

sys.modules.pop("mypkg", None)
sys.modules.pop("mypkg.sub", None)
import mypkg
print("首次导入: INIT_TAG =", mypkg.INIT_TAG, ", sub.SUB_TAG =", mypkg.sub.SUB_TAG)

# 只改 __init__ 和 sub 的源码
with open(os.path.join(pkg_dir, "__init__.py"), "w", encoding="utf-8") as f:
    f.write("from . import sub\\nINIT_TAG = 'init-v2'\\n")
with open(os.path.join(pkg_dir, "sub.py"), "w", encoding="utf-8") as f:
    f.write("SUB_TAG = 'sub-v2'\\n")

importlib.reload(mypkg)   # 只重载 mypkg，不递归 sub
print("reload(mypkg) 后: INIT_TAG =", mypkg.INIT_TAG, "（已更新）")
print("reload(mypkg) 后: sub.SUB_TAG =", mypkg.sub.SUB_TAG, "（仍是旧值！未递归）")
# 手动重载子模块
importlib.reload(mypkg.sub)
print("reload(mypkg.sub) 后: sub.SUB_TAG =", mypkg.sub.SUB_TAG, "（已更新）")

print("\\n===== 7. reload 不能用于 __main__ =====")
try:
    importlib.reload(sys.modules["__main__"])
    print("居然重载成功？不正常")
except Exception as e:
    print("重载 __main__ 失败:", type(e).__name__, "-", e)
    print("原因：__main__ 的 __spec__ 通常是 None，无法定位源文件")

# 清理
for n in list(sys.modules):
    if n.startswith(("counter_mod", "klass_mod", "mypkg")):
        sys.modules.pop(n, None)
sys.path.remove(tmpdir)
shutil.rmtree(tmpdir, ignore_errors=True)
print("\\n模块重载演示完成！")
`,
  },

  // =========================================================
  // 第四章：包结构与项目布局
  // =========================================================
  {
    id: "py-pkg-layout",
    group: "工程实践",
    icon: "🏗️",
    title: "包结构与项目布局",
    content: `## 项目目录结构：两种 layout

Python 项目有两种主流的目录布局：**flat layout** 和 **src layout**。

### flat layout（扁平布局）

包目录直接放在项目根：

\`\`\`
mypkg-project/
├── mypkg/              # 包目录就在根
│   ├── __init__.py
│   ├── core.py
│   └── utils.py
├── tests/
│   └── test_core.py
├── setup.py
└── README.md
\`\`\`

优点：简单直观。缺点：**测试时可能误用源码而非安装版**——因为项目根在 \`sys.path\` 上，\`import mypkg\` 直接拿到源码，绕过了打包安装的版本，可能掩盖打包配置错误。

### src layout（推荐）

把包放进 \`src/\` 目录：

\`\`\`
mypkg-project/
├── src/
│   └── mypkg/          # 包藏在 src 下
│       ├── __init__.py
│       ├── core.py
│       └── utils.py
├── tests/
│   └── test_core.py
├── pyproject.toml
└── README.md
\`\`\`

优点：**只有安装后才能 import**（src 不在默认 sys.path 上），测试一定测的是安装版，能发现打包配置遗漏。这是现代 Python 项目的**推荐布局**。

| 对比项 | flat layout | src layout |
| --- | --- | --- |
| 包位置 | 项目根 | \`src/\` 下 |
| 不安装能 import 吗 | 能（根目录在 path） | 不能（必须 pip install） |
| 测试覆盖打包配置 | 否（绕过安装） | 是（必须安装） |
| 推荐度 | 小项目可用 | **现代推荐** |

## pyproject.toml：现代打包配置

PEP 517/518/621 定义了 \`pyproject.toml\` 作为现代 Python 项目的标准配置文件，逐步取代 \`setup.py\`：

\`\`\`toml
[build-system]
requires = ["setuptools>=61.0"]      # 构建后端
build-backend = "setuptools.build_meta"

[project]
name = "mypkg"
version = "1.0.0"
description = "我的包"
requires-python = ">=3.9"
dependencies = [
    "requests>=2.20",
]

[project.optional-dependencies]
dev = ["pytest", "ruff"]

[tool.setuptools.packages.find]
where = ["src"]                      # src layout 告诉构建器去 src 下找包
\`\`\`

\`pyproject.toml\` 的好处：纯声明式、不执行任意代码（比 \`setup.py\` 安全）、统一了构建前端与后端的契约。

### setup.py / setup.cfg（传统配置）

老项目常见 \`setup.py\`：

\`\`\`python
from setuptools import setup, find_packages
setup(
    name="mypkg",
    version="1.0.0",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
)
\`\`\`

新项目建议迁移到 \`pyproject.toml\`，\`setup.py\` 仅在需要动态计算版本等场景保留。

## 包内资源访问：importlib.resources

包里常需要带一些非代码资源（数据文件、模板、默认配置）。老办法是用 \`__file__\` 拼路径：

\`\`\`python
import os
data_path = os.path.join(os.path.dirname(__file__), "data.txt")
with open(data_path) as f:
    data = f.read()
\`\`\`

这有个问题：如果包被打包成 zip（egg/whl）安装，\`__file__\` 指向 zip 内部，\`open\` 就失败了。

Python 3.9+ 的 \`importlib.resources\` 解决了这个问题，能正确处理各种安装形式：

\`\`\`python
from importlib import resources
# 读文本资源
text = resources.files("mypkg").joinpath("data.txt").read_text(encoding="utf-8")
# 读二进制
blob = resources.files("mypkg").joinpath("logo.png").read_bytes()
\`\`\`

\`resources.files(pkg)\` 返回 \`Traversable\` 对象，支持 \`joinpath\`/\`read_text\`/\`read_bytes\`/\`open\`，无论包是目录还是 zip 都能正确访问。

## __init__.py 的最佳实践

\`__init__.py\` 标志一个目录是包，但它也是包的"门面"。好的 \`__init__.py\` 应该：

### 1. 保持精简

\`__init__.py\` 里不要写大量逻辑，只做**导出公共 API**、定义 \`__version__\`、\`__all__\` 等。复杂逻辑放到子模块。

### 2. 导出公共 API

\`\`\`python
# mypkg/__init__.py
from .core import Core, process   # 把内部模块的接口"提"到包顶层
from .utils import helper

__all__ = ["Core", "process", "helper"]
__version__ = "1.0.0"
\`\`\`

这样用户写 \`from mypkg import Core\` 即可，不用关心 \`Core\` 实际在 \`mypkg.core\`。

### 3. 定义 __all__ 明确公共接口

\`__all__\` 是一个字符串列表，声明"这些是公开 API"。它影响 \`from mypkg import *\` 的行为，也是给用户的契约。

### 4. 定义 __version__

惯例：在 \`__init__.py\` 里定义 \`__version__ = "1.2.3"\`，用户可以 \`mypkg.__version__\` 查版本。

## 多层包结构的设计原则

大型项目会有多层包，设计时遵循"**高内聚低耦合**"：

\`\`\`
mypkg/
├── __init__.py
├── api/              # 对外接口层
│   ├── __init__.py
│   └── public.py
├── core/             # 核心逻辑层
│   ├── __init__.py
│   ├── engine.py
│   └── model.py
├── utils/            # 工具层
│   ├── __init__.py
│   └── io.py
└── cli/              # 命令行层
    ├── __init__.py
    └── main.py
\`\`\`

依赖方向应该**自顶向下单向**：\`api → core → utils\`，不能反过来。\`utils\` 是最底层，不依赖项目内任何其他包。

## 单文件模块 vs 包：何时用包

| 情况 | 用单文件模块 | 用包 |
| --- | --- | --- |
| 代码量 | 几百行以内 | 需要拆分多个文件 |
| 公开接口 | 简单，一个文件够 | 需要分层组织 |
| 资源文件 | 无 | 需要带数据/模板文件 |
| 子模块 | 无 | 有明确的子组件 |

经验法则：**当单个文件超过 ~1000 行，或需要带资源文件，或内部有清晰子组件时，就升级成包**。

## 可编辑安装（editable install）

src layout 下开发时，每次改代码都要重新 \`pip install\` 才能测试吗？不用。用**可编辑安装**：

\`\`\`bash
pip install -e .     # 在项目根（含 pyproject.toml）执行
\`\`\`

\`-e\`（\`--editable\`）把包以"软链接"方式安装：Python 看到的 \`mypkg\` 直接指向 \`src/mypkg\` 源码目录，改源码立即生效，无需重装。这是开发期连接 src layout 与 \`import\` 的标准方式。

可编辑安装的原理是在 \`sys.path\`（或 \`.pth\` 文件）里加入 src 目录的引用，所以 \`import mypkg\` 能找到 \`src/mypkg\`。

| 安装方式 | 改源码后 | 适合 |
| --- | --- | --- |
| \`pip install .\` | 需重装才生效 | 生产部署 |
| \`pip install -e .\` | 立即生效 | 开发期 |
| 手动加 \`sys.path\` | 立即生效 | 临时调试（如本教程代码） |

## 包的元数据访问

安装后的包可以通过 \`importlib.metadata\`（3.8+，3.10+ 完善稳定）查询元数据：

\`\`\`python
from importlib import metadata
print(metadata.version("requests"))          # 已安装版本
print(metadata.requires("requests"))         # 依赖列表
print(metadata.metadata("requests")["Author"])
\`\`\`

这读的是安装时打包进 \`.dist-info\` 目录的元数据，**不是**源码里的 \`__version__\`。两者应保持一致：\`pyproject.toml\` 的 \`version\` 与 \`__init__.py\` 的 \`__version__\` 要同步，可用 \`dynamic = ["version"]\` 让打包工具从 \`__version__\` 读取，避免重复维护。

## 本章小结

- 两种布局：flat（简单，易误用源码）和 src（推荐，强制走安装）。
- \`pyproject.toml\`（PEP 517/518/621）是现代打包配置标准，逐步取代 \`setup.py\`。
- 包内资源用 \`importlib.resources.files()\`（3.9+），不要用 \`__file__\` 拼路径。
- \`__init__.py\` 保持精简：导出公共 API、定义 \`__all__\` 和 \`__version__\`。
- 多层包遵循高内聚低耦合，依赖方向单向自顶向下。
- 单文件够用就用模块，复杂了再升级成包。

下面运行示例代码，亲手验证这些概念。`,
    code: `# -*- coding: utf-8 -*-
# 第四章演示代码：包结构与项目布局
# 用临时目录模拟一个完整的 src layout 项目，演示导入、资源访问、公共 API

import sys
import os
import tempfile
import textwrap
import shutil

print("===== 1. 模拟创建一个 src layout 项目结构 =====")
project_root = tempfile.mkdtemp()
src_dir = os.path.join(project_root, "src")
pkg_dir = os.path.join(src_dir, "mypkg")
os.makedirs(pkg_dir)
os.makedirs(os.path.join(project_root, "tests"))

# 写 __init__.py：精简、导出公共 API、定义 __version__ 和 __all__
with open(os.path.join(pkg_dir, "__init__.py"), "w", encoding="utf-8") as f:
    f.write(textwrap.dedent('''
        """mypkg —— 一个演示用的包。"""
        from .core import process, VERSION
        from .utils import format_result

        __all__ = ["process", "VERSION", "format_result"]
        __version__ = "1.2.3"
    ''').strip())

# 写 core.py：核心逻辑
with open(os.path.join(pkg_dir, "core.py"), "w", encoding="utf-8") as f:
    f.write(textwrap.dedent('''
        """核心处理逻辑。"""
        VERSION = "1.2.3"
        def process(data):
            """处理数据，返回结果。"""
            return {"input": data, "length": len(data), "processed": True}
    ''').strip())

# 写 utils.py：工具函数
with open(os.path.join(pkg_dir, "utils.py"), "w", encoding="utf-8") as f:
    f.write(textwrap.dedent('''
        """工具函数。"""
        def format_result(result):
            return f"结果: 输入={result['input']!r}, 长度={result['length']}"
    ''').strip())

# 写一个包内数据资源
with open(os.path.join(pkg_dir, "data.txt"), "w", encoding="utf-8") as f:
    f.write("这是包内数据资源\\n第二行配置\\n")

# 写 pyproject.toml（仅作展示，运行时不读取）
with open(os.path.join(project_root, "pyproject.toml"), "w", encoding="utf-8") as f:
    f.write(textwrap.dedent('''
        [build-system]
        requires = ["setuptools>=61.0"]
        build-backend = "setuptools.build_meta"
        [project]
        name = "mypkg"
        version = "1.2.3"
        [tool.setuptools.packages.find]
        where = ["src"]
    ''').strip())

print("项目结构（在", project_root, "下）：")
for root, dirs, files in os.walk(project_root):
    rel = os.path.relpath(root, project_root)
    indent = "  " * (rel.count(os.sep) if rel != "." else 0)
    print(f"{indent}{os.path.basename(root) or '.'}/")
    for fn in sorted(files):
        print(f"{indent}  {fn}")

print("\\n===== 2. 把 src 加入 sys.path，导入 mypkg =====")
sys.path.insert(0, src_dir)
import mypkg
print("导入成功:", mypkg)
print("mypkg.__version__ =", mypkg.__version__)
print("mypkg.__doc__ =", mypkg.__doc__)

# 公共 API 通过 __init__.py 直接可用，无需写 mypkg.core.process
result = mypkg.process("hello")
print("mypkg.process('hello') =", result)
print("mypkg.format_result(result) =", mypkg.format_result(result))

print("\\n===== 3. __all__ 控制公共 API =====")
print("mypkg.__all__ =", mypkg.__all__)
print("这些是承诺的公共接口，其他（如 core、utils 子模块）属于内部实现")

# 演示 from mypkg import * 只导入 __all__ 里的名字
ns = {}
exec("from mypkg import *", ns)
public_names = sorted(k for k in ns if not k.startswith("__"))
print("from mypkg import * 拿到的名字:", public_names)

print("\\n===== 4. 用 importlib.resources 访问包内资源 =====")
from importlib import resources
# resources.files(pkg) 返回 Traversable，能正确处理 zip 安装等场景
pkg_files = resources.files("mypkg")
print("resources.files('mypkg') =", pkg_files)
data_text = pkg_files.joinpath("data.txt").read_text(encoding="utf-8")
print("data.txt 内容：")
for line in data_text.strip().splitlines():
    print("  ", line)

# 列出包内所有资源
print("包内文件列表：")
for child in pkg_files.iterdir():
    print("  ", child.name, "(目录)" if child.is_dir() else "(文件)")

print("\\n===== 5. 对比：用 __file__ 拼路径的老办法 =====")
# 老办法：os.path.dirname(__file__) 拼路径
core_file = mypkg.core.__file__   # 子模块仍可访问
old_path = os.path.join(os.path.dirname(core_file), "data.txt")
print("老办法拼出的路径:", old_path)
print("文件存在:", os.path.exists(old_path))
print("-> 老办法在普通目录安装下能用，但 zip 安装会失败")
print("-> importlib.resources 是跨安装形式的安全做法")

print("\\n===== 6. 子模块与多层结构 =====")
import mypkg.core
import mypkg.utils
print("mypkg.core.__name__   =", mypkg.core.__name__)
print("mypkg.utils.__name__  =", mypkg.utils.__name__)
print("mypkg.core.__package__ =", mypkg.core.__package__)   # 'mypkg'
print("mypkg.__package__      =", mypkg.__package__)        # 'mypkg'（包的 __package__ 是自己）

print("\\n===== 7. src layout 的优势演示 =====")
# src layout 下，项目根不在 sys.path，必须安装或手动加 src
print("项目根在 sys.path 上吗:", project_root in sys.path)   # False
print("src 目录在 sys.path 上吗:", src_dir in sys.path)      # True（我们手动加的）
print("-> 真实项目用 pip install -e . 安装，src 自动进 path")
print("-> 这强制测试走安装版，能发现打包配置遗漏")

# 清理
sys.path.remove(src_dir)
for n in list(sys.modules):
    if n == "mypkg" or n.startswith("mypkg."):
        sys.modules.pop(n, None)
shutil.rmtree(project_root, ignore_errors=True)
print("\\n包结构演示完成！")
`,
  },

  // =========================================================
  // 第五章：模块化最佳实践
  // =========================================================
  {
    id: "py-mod-practice",
    group: "工程实践",
    icon: "✨",
    title: "模块化最佳实践",
    content: `## 命名规范

模块名是给所有使用者看的，命名要慎重：

- **小写 + 下划线**：\`my_module\`、\`user_service\`，不用驼峰。
- **避免与标准库冲突**：千万别叫 \`string.py\`、\`os.py\`、\`json.py\`，否则会遮蔽标准库导致诡异错误。
- **简短但有意义**：\`auth\` 优于 \`authentication_module\`，\`db\` 优于 \`database_connection_utilities\`。
- **不用下划线开头**：\`_private\` 是私有约定，模块名别用。
- **包名可比模块名更简短**：\`requests\`、\`numpy\` 都是单词。

| 规范 | 好 | 坏 |
| --- | --- | --- |
| 大小写 | \`user_service\` | \`UserService\`、\`userservice\` |
| 冲突 | \`myjson\` | \`json\` |
| 长度 | \`auth\`、\`db\` | \`the_user_authentication_module\` |
| 复数 | \`utils\`、\`models\` | \`util\`、\`model\`（看团队习惯）|

## 单一职责原则

**一个模块只做一件事**。判断标准：能否用一句话描述模块的职责？如果说不清，或要列举多件事，就该拆。

\`\`\`python
# 坏：一个文件里什么都塞
# kitchen_sink.py
def login(): ...
def send_email(): ...
def calculate_tax(): ...
def render_html(): ...

# 好：按职责拆分
# auth.py      —— 只管登录认证
# mailer.py    —— 只管发邮件
# tax.py       —— 只管税务计算
# renderer.py  —— 只管渲染
\`\`\`

单一职责让模块**易理解、易测试、易复用**。

## 模块大小

没有硬性行数限制，但经验：

- **200 行以内**：理想，单屏能看完。
- **500 行左右**：可接受，但要警惕。
- **1000 行以上**：强烈建议拆分。
- **超过 2000 行**：基本一定该拆。

行数不是唯一标准，**职责清晰度**更重要。一个 800 行但职责单一的模块，好过一个 300 行但塞了三件事的模块。

## 导入顺序（PEP 8）

PEP 8 规定 import 按三组排列，组间空行：

\`\`\`python
# 1. 标准库
import os
import sys
from datetime import datetime

# 2. 第三方
import requests
from flask import Flask

# 3. 本地（项目内）
from mypkg import core
from . import utils
\`\`\`

每组内按字母序排列。工具 \`isort\`、\`ruff\` 能自动排序。统一导入顺序减少 git diff 噪声、便于排查依赖。

## 避免 from mod import *

\`from mod import *\` 把模块所有公开名字倒入当前命名空间，问题很多：

- **命名污染**：不知道哪些名字来自哪里，易冲突。
- **可读性差**：看到一个 \`foo()\` 不知道哪来的。
- **静态分析失效**：IDE/工具看不出 \`foo\` 的定义位置。
- **可能被 __all__ 限制**：若模块定义了 \`__all__\`，\`*\` 只导入 \`__all__\` 里的；否则导入所有不以 \`_\` 开头的名字，更不可控。

唯一可接受的场景是**交互式 REPL** 里图省事。生产代码里一律用 \`import mod\` 或 \`from mod import name1, name2\`。

## 模块文档字符串

每个模块开头写 docstring，说明模块用途：

\`\`\`python
"""税务计算模块。

提供增值税、所得税等计算功能。
依赖税率表 tax_rates.yaml。
"""
\`\`\`

模块 docstring 是模块的 \`__doc__\` 属性，会被 \`help()\`、Sphinx、IDE 提示使用。好的 docstring 让人一眼明白模块干嘛的。

## if __name__ == "__main__" 惯用法

让模块既能被 import 又能直接运行：

\`\`\`python
def main():
    print("运行主程序")

if __name__ == "__main__":
    main()
\`\`\`

直接 \`python mod.py\` 时，\`__name__\` 是 \`"__main__"\`，\`main()\` 执行；\`import mod\` 时 \`__name__\` 是 \`"mod"\`，\`main()\` 不执行。这样模块既能作为库被导入，又能作为脚本运行测试/演示。

## __all__ 明确公共 API

\`\`\`python
__all__ = ["process", "Processor", "VERSION"]
\`\`\`

\`__all__\` 是给用户的契约："这些是我承诺维护的 API，其他都是内部实现，可能随时变"。定义 \`__all__\` 后，\`from mod import *\` 只导入这些名字。

## 私有成员约定

Python 没有真正的 private，靠**约定**：

- \`_name\`：单下划线前缀，表示"内部使用，别外部依赖"。工具/IDE 不会自动补全它。\`from mod import *\` 不会导入。
- \`__name\`：双下划线前缀触发**名称改写**（\`_ClassName__name\`），用于避免子类覆盖，不是真正的私有。
- \`__name__\`：双下划线前后包围是 Python 的**魔法属性**，别自己发明。

\`\`\`python
def public_api():        # 公开
    return _internal()   # 调用内部
def _internal():         # 约定内部，但仍可被外部访问
    return "内部实现"
\`\`\`

## 包的 __init__.py 策略

\`__init__.py\` 应**精简**：
- 导出公共 API（\`from .sub import X\`）。
- 定义 \`__version__\`、\`__all__\`。
- **不要**写复杂逻辑、不要做重计算。

把实现放子模块，\`__init__.py\` 只做"门面"聚合。

## 循环依赖的预防

- **依赖方向单一**：画依赖图，确保是无环 DAG。
- **依赖倒置**：高层模块不直接依赖低层细节，都依赖抽象接口。
- **共享代码下沉**：双方都用的东西抽到更底层公共模块。
- **类型注解用 TYPE_CHECKING**：仅类型检查需要的 import 用守卫，不引入运行时循环。

## 模块级状态 vs 实例状态

**避免模块级可变全局状态**，它是测试和并发的噩梦：

\`\`\`python
# 坏：模块级可变状态
_cache = {}
def get(key):
    if key not in _cache:
        _cache[key] = load(key)
    return _cache[key]

# 好：封装成实例/类
class Cache:
    def __init__(self):
        self._data = {}
    def get(self, key):
        if key not in self._data:
            self._data[key] = load(key)
        return self._data[key]
\`\`\`

模块级**不可变**常量（如 \`PI = 3.14\`）是 OK 的，**可变**全局状态（字典、列表、缓存）要警惕。

## 工具辅助

| 工具 | 作用 |
| --- | --- |
| \`isort\` / \`ruff --select I\` | 自动排序 import |
| \`ruff\` | 极快的 linter + formatter，替代 flake8 + isort |
| \`pylint\` | 更严格的静态检查 |
| \`mypy\` / \`pyright\` | 类型检查，提前发现类型错误 |
| \`pip-audit\` | 扫描依赖已知漏洞 |
| \`bandit\` | 安全漏洞扫描 |

现代项目推荐 \`ruff\`（lint + format）+ \`mypy\`（类型）组合。

## 测试模块的组织

- 放 \`tests/\` 目录，与源码分离。
- 测试文件以 \`test_\` 开头：\`test_core.py\`、\`test_utils.py\`，对应被测模块。
- 测试函数以 \`test_\` 开头：\`def test_process():\`。
- \`pytest\` 默认按此约定发现测试。

\`\`\`
mypkg/
└── ...
tests/
├── __init__.py
├── test_core.py
└── test_utils.py
\`\`\`

## 版本管理

- 在 \`__init__.py\` 定义 \`__version__ = "1.2.3"\`。
- 遵循**语义化版本**（SemVer）：\`MAJOR.MINOR.PATCH\`。
  - MAJOR：不兼容的 API 变更。
  - MINOR：向后兼容的新功能。
  - PATCH：向后兼容的 bug 修复。
- \`pyproject.toml\` 里版本与 \`__version__\` 保持一致（可用 \`dynamic\` 动态读取避免重复）。

## 本章小结

- 命名：小写下划线，避开标准库，简短有意义。
- 单一职责 + 合理大小，超过 ~1000 行考虑拆。
- 导入按"标准库→第三方→本地"三组排列，组间空行。
- 不用 \`import *\`；模块写 docstring；用 \`__all__\` 声明公共 API。
- \`_private\` 约定私有；\`__init__.py\` 保持精简做门面。
- 预防循环依赖：依赖方向单向、依赖倒置、TYPE_CHECKING。
- 避免模块级可变状态；用 ruff + mypy + pytest 工具链。
- 测试放 \`tests/test_*.py\`；版本用语义化版本。

下面运行示例代码，亲手验证这些概念。`,
    code: `# -*- coding: utf-8 -*-
# 第五章演示代码：模块化最佳实践
# 演示导入顺序、__all__、__name__ 惯用法、私有约定、docstring、依赖方向

# ---------- 导入顺序规范（PEP 8：三组，组间空行）----------
# 第一组：标准库
import os
import sys
from datetime import datetime

# 第二组：第三方（本演示无第三方依赖，用注释占位说明）
# import requests
# from flask import Flask

# 第三组：本地/项目内（用 importlib 动态构造演示）
import importlib
import importlib.util
import tempfile
import textwrap
import shutil
from importlib import resources

print("===== 1. 导入顺序规范（已在文件顶部演示）=====")
print("标准库 -> （空行）-> 第三方 -> （空行）-> 本地")
print("当前用到的标准库:", [m for m in ("os", "sys", "datetime") if m in sys.modules])

print("\\n===== 2. __all__ 控制 public API =====")
# 构造一个带 __all__ 的虚拟模块
tmpdir = tempfile.mkdtemp()
mod_path = os.path.join(tmpdir, "demo_api.py")
with open(mod_path, "w", encoding="utf-8") as f:
    f.write(textwrap.dedent('''
        """演示 __all__ 的模块。"""
        PUBLIC = "公开 API"
        PUBLIC_TOO = "也是公开的"
        _INTERNAL = "内部实现，不应外部依赖"
        def _helper():
            return "内部辅助"
        def public_func():
            return "公开函数"
        __all__ = ["PUBLIC", "PUBLIC_TOO", "public_func"]
    ''').strip())

spec = importlib.util.spec_from_file_location("demo_api", mod_path)
demo = importlib.util.module_from_spec(spec)
spec.loader.exec_module(demo)
sys.modules["demo_api"] = demo   # 注册到 sys.modules，使 from demo_api import * 能找到

print("模块定义的 __all__ =", demo.__all__)
print("from demo_api import * 只会导入这些名字")
ns = {}
exec("from demo_api import *", ns)
star_names = sorted(k for k in ns if not k.startswith("__"))
print("  import * 拿到:", star_names)
print("_INTERNAL 在 import * 里吗:", "_INTERNAL" in ns, "（约定不导出）")
print("但 _INTERNAL 仍能被显式访问:", demo._INTERNAL, "（Python 无真私有）")

print("\\n===== 3. if __name__ == '__main__' 惯用法 =====")
# 构造一个既可导入又可独立运行的模块
runnable = os.path.join(tmpdir, "runnable_mod.py")
with open(runnable, "w", encoding="utf-8") as f:
    f.write(textwrap.dedent('''
        def main():
            return "main 函数执行"
        if __name__ == "__main__":
            print("直接运行时才会打印这行")
            print(main())
    ''').strip())

spec2 = importlib.util.spec_from_file_location("runnable_mod", runnable)
rm = importlib.util.module_from_spec(spec2)
spec2.loader.exec_module(rm)
print("导入时 __name__ =", rm.__name__, "（不是 __main__，所以 if 块不执行）")
print("但 main() 仍可调用:", rm.main())

print("\\n===== 4. 单下划线私有成员的约定 =====")
priv = os.path.join(tmpdir, "priv_mod.py")
with open(priv, "w", encoding="utf-8") as f:
    f.write(textwrap.dedent('''
        PUBLIC_VAR = "公开"
        _PRIVATE_VAR = "约定私有"
        def public_api():
            return _private_impl()
        def _private_impl():
            return "内部实现细节"
    ''').strip())
spec3 = importlib.util.spec_from_file_location("priv_mod", priv)
pm = importlib.util.module_from_spec(spec3)
spec3.loader.exec_module(pm)
sys.modules["priv_mod"] = pm   # 注册到 sys.modules，使 from priv_mod import * 能找到
print("公开 API:", pm.public_api())
print("_PRIVATE_VAR 仍可访问:", pm._PRIVATE_VAR, "（约定但不强制）")
print("from priv_mod import * 不会带入 _ 开头的名字")
ns2 = {}
exec("from priv_mod import *", ns2)
print("  import * 拿到:", sorted(k for k in ns2 if not k.startswith("__")))

print("\\n===== 5. 模块文档字符串 __doc__ =====")
print("demo_api.__doc__ =", demo.__doc__)
print("priv_mod.__doc__ =", repr(getattr(pm, "__doc__", None)), "（没写就是 None）")
print("提示：每个模块开头都该写 docstring，help() 会用到")

print("\\n===== 6. importlib.resources 包内资源访问 =====")
pkg_dir = os.path.join(tmpdir, "respkg")
os.makedirs(pkg_dir)
with open(os.path.join(pkg_dir, "__init__.py"), "w", encoding="utf-8") as f:
    f.write('"""资源包演示。"""\\n')
with open(os.path.join(pkg_dir, "config.txt"), "w", encoding="utf-8") as f:
    f.write("debug=false\\nport=8080\\n")
sys.path.insert(0, tmpdir)
import respkg
cfg = resources.files("respkg").joinpath("config.txt").read_text(encoding="utf-8")
print("包内 config.txt 内容：")
for line in cfg.strip().splitlines():
    print("  ", line)
print("这是跨安装形式（目录/zip）的安全资源访问方式")

print("\\n===== 7. 依赖方向单一的设计原则 =====")
# 构造：api -> core -> utils，单向依赖
layers = os.path.join(tmpdir, "layered")
os.makedirs(os.path.join(layers, "api"))
os.makedirs(os.path.join(layers, "core"))
os.makedirs(os.path.join(layers, "utils"))
with open(os.path.join(layers, "__init__.py"), "w") as f:
    f.write("")
for sub in ("api", "core", "utils"):
    with open(os.path.join(layers, sub, "__init__.py"), "w") as f:
        f.write("")

# utils（最底层，不依赖项目内其他包）
with open(os.path.join(layers, "utils", "io.py"), "w", encoding="utf-8") as f:
    f.write('def read(): return "数据"\\n')
# core 依赖 utils
with open(os.path.join(layers, "core", "engine.py"), "w", encoding="utf-8") as f:
    f.write('from layered.utils import io\\ndef run(): return "处理:" + io.read()\\n')
# api 依赖 core
with open(os.path.join(layers, "api", "public.py"), "w", encoding="utf-8") as f:
    f.write('from layered.core import engine\\ndef serve(): return engine.run()\\n')

sys.path.insert(0, tmpdir)
from layered.api import public as api_pub
print("api.serve() =", api_pub.serve())
print("依赖方向：api -> core -> utils（单向 DAG，无环）")
print("如果 utils 反过来 import api，就形成环，是设计警告")

# 清理
sys.path.remove(tmpdir)
for n in list(sys.modules):
    if n.startswith(("demo_api", "runnable_mod", "priv_mod", "respkg", "layered")):
        sys.modules.pop(n, None)
shutil.rmtree(tmpdir, ignore_errors=True)
print("\\n模块化最佳实践演示完成！")
`,
  },
];
