export const chapters = [
  {
    id: "py6-module-basic", group: "模块与包", icon: "📦", title: "模块基础",
    content: `## 📦 模块基础

### 什么是模块？

模块（Module）是一个包含 Python 定义和语句的 **.py 文件**。模块可以把相关的代码组织在一起，让代码更清晰、更好维护。

你可以把模块想象成一个"工具箱"：你不需要自己造锤子、螺丝刀，直接从工具箱里拿就可以了。

### import 的四种用法

Python 提供了多种导入模块的方式：

#### 1. import 模块名 —— 导入整个模块

\`\`\`python
import math
print(math.pi)  # 必须用 模块名.属性 的方式访问
\`\`\`

#### 2. import 模块名 as 别名 —— 导入模块并起别名

\`\`\`python
import numpy as np  # 常用库都有约定俗成的别名
# import math as m
\`\`\`

#### 3. from 模块名 import 成员 —— 导入指定成员

\`\`\`python
from math import pi, sqrt
print(pi)        # 直接使用，无需模块名前缀
print(sqrt(16))
\`\`\`

#### 4. from 模块名 import * —— 导入所有公开成员（不推荐）

\`\`\`python
from math import *  # 会污染命名空间，容易产生名字冲突
\`\`\`

### 为什么要用模块？

- **代码复用**：写一次，多处使用
- **命名空间隔离**：不同模块里可以有同名函数
- **代码组织**：按功能分文件，项目结构清晰
- **可维护性**：修改一个模块不影响其他模块

### 常见错误

| 错误写法 | 问题 |
|---------|------|
| \`import pi from math\` | 语法错误，Python 不是 JS |
| \`import math; print(pi)\` | 没有 math 前缀，找不到 pi |
| \`from math import pi; math.pi\` | 导入后不能再用 math.pi |
| 循环导入 | A import B，B 又 import A，会报错 |

### 小提示

- 模块名就是文件名（去掉 .py）
- 导入模块时，模块里的**顶层代码会被执行一次**
- 别名（as）在长模块名或避免命名冲突时特别有用
`,
    code: `# ========== 模块基础演示 ==========

# 方式1：import 模块名
import math
print("=== 方式1：import math ===")
print(f"圆周率 π = {math.pi}")
print(f"2 的平方根 = {math.sqrt(2)}")

# 方式2：import 模块名 as 别名
import math as m
print("\\n=== 方式2：import math as m ===")
print(f"使用别名 m 访问 π = {m.pi}")

# 方式3：from 模块名 import 指定成员
from math import pi, sqrt, factorial
print("\\n=== 方式3：from math import pi, sqrt, factorial ===")
print(f"直接用 pi = {pi}")
print(f"sqrt(100) = {sqrt(100)}")
print(f"factorial(5) = {factorial(5)}")  # 5! = 120

# 方式4：导入多个标准库模块
import datetime
import random
print("\\n=== 使用多个模块 ===")
print(f"当前时间: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"随机数: {random.randint(1, 100)}")

# 模块名冲突时用别名解决
import math as math_module
import random as random_module
print("\\n=== 别名避免冲突 ===")
print(f"math_module.pi = {math_module.pi}")
print(f"random_module.randint(1,10) = {random_module.randint(1, 10)}")

# 查看模块里有哪些可用的东西
print("\\n=== math 模块的部分属性/方法 ===")
print("pi, e, sqrt, pow, sin, cos, log, ceil, floor, factorial, gcd ...")
`,
  },
  {
    id: "py6-import-mechanism", group: "模块与包", icon: "⚙️", title: "import 机制详解",
    content: `## ⚙️ import 机制详解

你有没有好奇过，当你写 \`import math\` 的时候，Python 到底做了什么？

### import 的三个步骤

1. **搜索（Find）**：在 sys.path 指定的路径中查找模块文件
2. **加载（Load）**：读取模块代码并编译成字节码
3. **执行（Execute）**：执行模块中的顶层代码，创建模块对象
4. **缓存（Cache）**：将模块存入 \`sys.modules\` 字典，后续导入直接用缓存

### 模块缓存 sys.modules

Python 导入模块后，会把模块对象存在 \`sys.modules\` 字典中。第二次再 import 时，**不会重新执行模块代码**，而是直接从缓存中取。

这就是为什么你重复写 10 次 \`import math\`，math 也只会被导入一次。

### 重新加载模块

如果你在程序运行期间修改了模块文件，可以用 \`importlib.reload()\` 强制重新加载：

\`\`\`python
import importlib
importlib.reload(模块名)
\`\`\`

### 模块对象的属性

每个模块都有一些特殊属性：
- \`__name__\`：模块名，如果是直接运行则为 \`"__main__"\`
- \`__file__\`：模块文件的完整路径
- \`__dict__\`：模块的命名空间字典
- \`__doc__\`：模块的文档字符串

### 导入顶层代码会执行！

导入模块时，模块中不在函数/类里面的代码**都会被执行**。这可能导致意外行为！

### 避免重复导入的副作用

- 不要在模块顶层写 print 语句
- 不要在模块顶层写可能产生副作用的代码（如连接数据库、写文件）
- 用 \`if __name__ == '__main__'\` 包裹测试代码（后面章节会讲）
`,
    code: `# ========== import 机制详解 ==========
import sys
import math
import importlib

# 1. sys.modules 缓存了所有已导入的模块
print("=== sys.modules 缓存 ===")
# 查看几个已经导入的模块
for name in ['sys', 'math', 'builtins']:
    module = sys.modules.get(name)
    if module:
        print(f"  {name}: 已缓存 -> {module}")

# 2. 重复 import 不会重新执行
print("\\n=== 重复导入测试 ===")
print("第一次 import random ...")
import random
print("第二次 import random (直接使用缓存，不会重新执行) ...")
import random
print("random 模块不会被重新加载")

# 3. 模块的特殊属性
print("\\n=== math 模块的特殊属性 ===")
print(f"  __name__  = {math.__name__}")    # 模块名
print(f"  __doc__   = {str(math.__doc__)[:50]}...")  # 文档
try:
    print(f"  __file__  = {math.__file__}")  # 文件路径（内建模块可能没有）
except AttributeError:
    print("  __file__  = (内建模块，无文件路径)")

# 4. 查看一个模块有多少个属性/方法
print("\\n=== math 模块的成员数量 ===")
members = [x for x in dir(math) if not x.startswith('_')]
print(f"  math 模块共有 {len(members)} 个公开成员")
print(f"  部分成员: {members[:10]} ...")

# 5. 证明 sys.modules 是缓存
print("\\n=== 验证缓存机制 ===")
# 导入前检查
print(f"  导入前 statistics 在 sys.modules 中: {'statistics' in sys.modules}")
import statistics
print(f"  导入后 statistics 在 sys.modules 中: {'statistics' in sys.modules}")
print(f"  statistics 模块对象: {sys.modules['statistics']}")

# 6. reload 重新加载（仅演示，不实际修改文件）
print("\\n=== reload 说明 ===")
print("使用 importlib.reload(模块名) 可以强制重新加载模块")
print("通常用于交互式环境中修改了模块文件后刷新")
`,
  },
  {
    id: "py6-module-search", group: "模块与包", icon: "🔍", title: "模块搜索路径",
    content: `## 🔍 模块搜索路径

当你写 \`import xxx\` 时，Python 是怎么找到 xxx 模块的？答案就是 **sys.path**！

### sys.path 是什么？

\`sys.path\` 是一个字符串列表，Python 会按照列表顺序逐个目录查找模块文件：

1. **当前脚本所在目录**（或当前工作目录）
2. **PYTHONPATH 环境变量**指定的目录
3. **标准库安装目录**（site-packages 等）
4. **第三方包安装目录**（pip install 的包）

### 搜索顺序很重要！

Python 找到第一个匹配的模块就停止搜索。如果你的当前目录下有个叫 \`math.py\` 的文件，\`import math\` 就会导入你的文件，而不是标准库的 math！这是一个**常见陷阱**。

### 查看 sys.path

\`\`\`python
import sys
for p in sys.path:
    print(p)
\`\`\`

### 添加自定义路径

如果你有自己的模块放在其他目录，可以临时添加：

\`\`\`python
import sys
sys.path.append('/path/to/my/modules')
\`\`\`

也可以设置环境变量 \`PYTHONPATH\` 永久添加。

### 模块文件类型

Python 会查找：
- \`xxx.py\` —— Python 源文件
- \`xxx.pyc\` —— 编译后的字节码文件（在 __pycache__ 中）
- \`xxx\` 目录（包）—— 包含 __init__.py
- 内建模块（C 扩展，如 sys）

### 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| ModuleNotFoundError | 模块不在搜索路径中 | 检查 sys.path，或安装包 |
| 导入了错误的模块 | 当前目录有同名文件 | 避免和标准库重名 |
| 相对导入报错 | 在包外直接运行脚本 | 用 -m 参数运行或调整结构 |
`,
    code: `# ========== 模块搜索路径 ==========
import sys

# 1. 查看完整的搜索路径
print("=== Python 模块搜索路径 sys.path ===")
for i, path in enumerate(sys.path):
    print(f"  [{i}] {path}")

# 2. 内建模块列表（C语言编写，无.py文件）
print("\\n=== 部分内建模块 ===")
builtin_modules = ['sys', 'builtins', 'math', '_io', '_json', 'time']
for mod in builtin_modules:
    is_builtin = mod in sys.builtin_module_names
    print(f"  {mod:15s} -> {'内建模块(C扩展)' if is_builtin else '普通模块'}")

# 3. 查找某个模块的文件位置
print("\\n=== 模块文件位置 ===")
# json 是标准库模块
import json
print(f"  json 模块文件: {json.__file__}")

# os 也是标准库
import os
print(f"  os 模块文件: {os.__file__}")

# 4. 验证模块搜索优先级演示
print("\\n=== 搜索优先级说明 ===")
print("1. 内置模块（最快，直接在内存中）")
print("2. sys.path[0]（当前脚本目录）")
print("3. PYTHONPATH 目录")
print("4. 标准库目录")
print("5. site-packages（第三方包）")
print("⚠️  注意：不要创建和标准库同名的 .py 文件！")
print("   比如不要自己写 math.py，会覆盖标准库 math！")

# 5. 临时添加搜索路径（演示）
print("\\n=== 临时添加路径 ===")
print("sys.path.append('/my/custom/path')  # 添加到末尾")
print("sys.path.insert(0, '/priority/path') # 添加到开头（优先级最高）")
print("这种方式只在当前程序运行期间有效，程序退出后失效")

# 6. 查看 sys.path 中有多少路径
print(f"\\n当前 sys.path 共有 {len(sys.path)} 个搜索目录")
`,
  },
  {
    id: "py6-package", group: "模块与包", icon: "📁", title: "包",
    content: `## 📁 包（Package）

当模块文件太多的时候，我们需要把它们组织到文件夹里——这就是**包**。

### 什么是包？

包（Package）是一个包含 \`__init__.py\` 文件的**目录**，目录下可以有多个 .py 模块文件和子包。

### 包的目录结构示例

\`\`\`
my_package/          # 包目录
├── __init__.py      # 包初始化文件（Python3 中可选，但建议保留）
├── module1.py       # 模块1
├── module2.py       # 模块2
└── sub_package/     # 子包
    ├── __init__.py
    └── module3.py
\`\`\`

### __init__.py 的作用

1. **标识目录是一个 Python 包**（Python 3.3+ 支持命名空间包，可以省略 __init__.py，但建议加上）
2. **包初始化代码**：导入包时会执行这个文件
3. **控制 \`from package import *\` 的行为**：通过 \`__all__\` 列表指定导出哪些模块
4. **提前导入常用内容**：方便用户直接从包名访问

### 绝对导入 vs 相对导入

**绝对导入**（推荐）：从项目根目录开始写完整路径
\`\`\`python
from my_package.sub_package import module3
import my_package.module1
\`\`\`

**相对导入**：用 . 表示当前目录，.. 表示上级目录
\`\`\`python
from . import module1           # 同目录的 module1
from .. import module2          # 上级目录的 module2
from .sub_package import module3  # 子目录
\`\`\`

⚠️ 相对导入只能在包**内部**使用，不能在直接运行的脚本中用！

### from package import *

如果 __init__.py 里定义了 \`__all__ = ['mod1', 'mod2']\`，那么 \`from package import *\` 只会导入列出的模块。
`,
    code: `# ========== 包的概念演示 ==========
# 注意：这个文件只演示包的概念和结构，实际的包需要在文件系统中创建目录
# 我们用 tempfile 在运行时临时创建一个包结构来演示！

import tempfile
import os
import sys

# 创建临时目录来模拟包结构
temp_dir = tempfile.mkdtemp()
print(f"临时工作目录: {temp_dir}")
print("=" * 50)

# 在临时目录中创建包结构
pkg_dir = os.path.join(temp_dir, 'my_tools')
os.makedirs(pkg_dir, exist_ok=True)

# 1. 创建 __init__.py
init_path = os.path.join(pkg_dir, '__init__.py')
with open(init_path, 'w', encoding='utf-8') as f:
    f.write('''# my_tools 包的初始化文件
__version__ = "1.0.0"
__all__ = ["string_utils", "math_utils"]  # 控制 import * 时导出的内容
print("  [my_tools] __init__.py 被执行了！")
''')

# 2. 创建 string_utils.py 模块
str_utils_path = os.path.join(pkg_dir, 'string_utils.py')
with open(str_utils_path, 'w', encoding='utf-8') as f:
    f.write('''"""字符串工具模块"""
def reverse(s):
    """反转字符串"""
    return s[::-1]

def greet(name):
    return f"你好, {name}!"
''')

# 3. 创建 math_utils.py 模块
math_utils_path = os.path.join(pkg_dir, 'math_utils.py')
with open(math_utils_path, 'w', encoding='utf-8') as f:
    f.write('''"""数学工具模块"""
def add(a, b):
    return a + b

def multiply(a, b):
    return a * b

PI = 3.14159
''')

# 创建子包
sub_pkg_dir = os.path.join(pkg_dir, 'advanced')
os.makedirs(sub_pkg_dir, exist_ok=True)
with open(os.path.join(sub_pkg_dir, '__init__.py'), 'w') as f:
    f.write('')
with open(os.path.join(sub_pkg_dir, 'crypto.py'), 'w', encoding='utf-8') as f:
    f.write('''"""加密工具（简单演示）"""
def encrypt(text, shift=3):
    result = []
    for c in text:
        if c.isalpha():
            base = ord('A') if c.isupper() else ord('a')
            result.append(chr((ord(c) - base + shift) % 26 + base))
        else:
            result.append(c)
    return ''.join(result)
''')

# 把临时目录加入搜索路径
sys.path.insert(0, temp_dir)

print("\\n=== 包结构已创建 ===")
print(f"my_tools/")
print(f"├── __init__.py")
print(f"├── string_utils.py")
print(f"├── math_utils.py")
print(f"└── advanced/")
print(f"    ├── __init__.py")
print(f"    └── crypto.py")

# 导入包！
print("\\n=== 导入包测试 ===")
import my_tools
print(f"my_tools 版本: {my_tools.__version__}")

# 导入具体模块
from my_tools import string_utils, math_utils
print("\\n=== 使用 string_utils ===")
print(f"reverse('Python') = {string_utils.reverse('Python')}")
print(f"greet('小明') = {string_utils.greet('小明')}")

print("\\n=== 使用 math_utils ===")
print(f"add(3, 5) = {math_utils.add(3, 5)}")
print(f"multiply(4, 6) = {math_utils.multiply(4, 6)}")
print(f"math_utils.PI = {math_utils.PI}")

# 导入子包
from my_tools.advanced import crypto
print("\\n=== 使用子包 advanced.crypto ===")
print(f"encrypt('Hello') = {crypto.encrypt('Hello')}")

# 绝对导入 vs 相对导入说明
print("\\n=== 导入方式总结 ===")
print("绝对导入: from my_tools import string_utils")
print("相对导入: from . import string_utils  (包内部使用)")

# 清理临时文件
import shutil
sys.path.remove(temp_dir)
shutil.rmtree(temp_dir)
print("\\n=== 临时目录已清理 ===")
`,
  },
  {
    id: "py6-pip", group: "模块与包", icon: "📥", title: "pip 包管理",
    content: `## 📥 pip 包管理

pip 是 Python 的**包安装工具**，类似于手机里的应用商店。你可以用它来安装、卸载、升级第三方库。

### 常用 pip 命令

| 命令 | 作用 |
|------|------|
| \`pip install 包名\` | 安装包 |
| \`pip install 包名==版本\` | 安装指定版本 |
| \`pip install 包名>=版本\` | 安装最低版本 |
| \`pip uninstall 包名\` | 卸载包 |
| \`pip install --upgrade 包名\` | 升级包 |
| \`pip list\` | 列出已安装的包 |
| \`pip show 包名\` | 查看包详情 |
| \`pip freeze\` | 导出已安装包及版本 |
| \`pip install -r requirements.txt\` | 批量安装依赖 |

### requirements.txt 是什么？

\`requirements.txt\` 是一个文本文件，记录了项目依赖的所有包及其版本。别人拿到你的项目后，只需要一条命令就能安装所有依赖：

\`\`\`bash
pip install -r requirements.txt
\`\`\`

文件内容示例：
\`\`\`
requests==2.31.0
numpy>=1.24.0
flask
\`\`\`

### pip vs pip3

- Python 2 用 pip，Python 3 用 pip3
- 在某些系统中，pip 默认就是 pip3
- 稳妥做法：\`python -m pip install 包名\`（用当前 Python 解释器对应的 pip）

### 国内镜像源

官方源在国外，下载慢。可以使用国内镜像：

\`\`\`bash
pip install 包名 -i https://pypi.tuna.tsinghua.edu.cn/simple
\`\`\`

常用镜像：
- 清华：https://pypi.tuna.tsinghua.edu.cn/simple
- 阿里：https://mirrors.aliyun.com/pypi/simple/
- 中科大：https://pypi.mirrors.ustc.edu.cn/simple/

### PyPI 是什么？

PyPI（Python Package Index）是 Python 的官方软件仓库，地址：https://pypi.org
`,
    code: `# ========== pip 包管理命令演示 ==========
# 注意：这里只打印命令示例，不实际执行 pip install（避免污染环境）

import sys

print("=" * 60)
print("📥 pip 包管理 - 常用命令演示")
print("=" * 60)

# 显示 Python 和 pip 版本信息
print(f"\\n当前 Python 版本: {sys.version}")
print(f"Python 可执行文件: {sys.executable}")

# 定义常用命令列表
commands = [
    ("🔍 查看 pip 版本", "pip --version"),
    ("📦 安装包（最新版）", "pip install requests"),
    ("📌 安装指定版本", "pip install requests==2.31.0"),
    ("⬆️  升级包", "pip install --upgrade requests"),
    ("🗑️  卸载包", "pip uninstall requests"),
    ("📋 列出已安装的包", "pip list"),
    ("📄 查看包详情", "pip show requests"),
    ("💾 导出依赖列表", "pip freeze > requirements.txt"),
    ("📥 批量安装依赖", "pip install -r requirements.txt"),
    ("🚀 使用清华镜像安装", "pip install requests -i https://pypi.tuna.tsinghua.edu.cn/simple"),
    ("✅ 推荐：用 python -m pip", "python -m pip install requests"),
]

print("\\n=== 常用 pip 命令 ===")
for desc, cmd in commands:
    print(f"  {desc}")
    print(f"    $ {cmd}")
    print()

# requirements.txt 示例
print("=== requirements.txt 文件示例 ===")
requirements_example = """# 项目依赖清单
# === 方式1：精确版本（推荐用于生产环境）===
requests==2.31.0
flask==3.0.0
django==4.2.7

# === 方式2：最低版本 ===
numpy>=1.24.0
pandas>=2.0.0

# === 方式3：不指定版本（安装最新）===
pillow
beautifulsoup4
"""
print(requirements_example)

# 演示如何生成 requirements.txt
print("=== 生成和使用 requirements.txt 的流程 ===")
print("1. 开发时自由安装需要的包:")
print("   $ pip install requests flask numpy pandas")
print()
print("2. 项目完成后导出依赖列表:")
print("   $ pip freeze > requirements.txt")
print()
print("3. 别人拿到项目后一键安装:")
print("   $ pip install -r requirements.txt")

# 常用包简介
print("\\n=== 常用第三方包简介 ===")
packages = [
    ("requests", "HTTP 网络请求库"),
    ("numpy", "数值计算，多维数组"),
    ("pandas", "数据分析处理"),
    ("flask", "轻量级 Web 框架"),
    ("django", "全能型 Web 框架"),
    ("pillow", "图像处理"),
    ("beautifulsoup4", "HTML/XML 解析"),
    ("selenium", "浏览器自动化"),
    ("pytest", "单元测试框架"),
    ("matplotlib", "数据可视化绘图"),
]
for name, desc in packages:
    print(f"  {name:20s} → {desc}")

print("\\n⚠️  重要提示：")
print("  1. 本沙箱环境不执行 pip install，仅作概念演示")
print("  2. 建议在虚拟环境中使用 pip（见下一节 venv）")
print("  3. 使用 python -m pip 可以确保用对 Python 版本")
`,
  },
  {
    id: "py6-venv", group: "模块与包", icon: "🌱", title: "虚拟环境",
    content: `## 🌱 虚拟环境（venv）

### 为什么需要虚拟环境？

假设你有两个项目：
- 项目 A 需要 Django 3.2（旧版本）
- 项目 B 需要 Django 5.0（新版本）

如果把包都装在系统全局环境里，两个版本会冲突！**虚拟环境**就是用来解决这个问题的。

虚拟环境就像一个**独立的 Python "小房间"**，每个房间里可以有自己独立的包，互不干扰。

### 虚拟环境的核心概念

- 每个虚拟环境有自己独立的 \`pip\`、\`python\` 和已安装包
- 不同环境之间完全隔离
- 激活哪个环境，就用哪个环境的 Python 和包
- 可以随时创建、删除虚拟环境，不影响全局

### 创建和使用虚拟环境（标准流程）

\`\`\`bash
# 1. 创建虚拟环境（在项目目录下执行）
python -m venv myenv

# 2. 激活虚拟环境
# macOS/Linux:
source myenv/bin/activate
# Windows (cmd):
myenv\\Scripts\\activate.bat
# Windows (PowerShell):
myenv\\Scripts\\Activate.ps1

# 3. 激活后，命令行前面会出现 (myenv)
# 此时 pip install 的包都装在这个环境里
pip install requests flask

# 4. 退出虚拟环境
deactivate
\`\`\`

### 推荐项目结构

\`\`\`
my_project/
├── myenv/          # 虚拟环境目录（通常加进 .gitignore）
├── src/            # 你的源代码
├── requirements.txt # 依赖清单
└── README.md
\`\`\`

### 管理工具对比

| 工具 | 说明 |
|------|------|
| **venv** | Python 官方内置，Python 3.3+ 自带，最推荐 |
| virtualenv | 第三方工具，功能更强大，支持 Python 2 |
| conda | Anaconda 自带，适合数据科学，能管理非 Python 包 |
| poetry/pipenv | 现代依赖管理工具，锁定版本更精确 |

### 最佳实践

1. ✅ 每个项目一个虚拟环境
2. ✅ 虚拟环境目录加入 \`.gitignore\`（不要提交到 Git）
3. ✅ 用 \`requirements.txt\` 记录依赖
4. ❌ 不要在虚拟环境外开发项目
5. ❌ 不要把虚拟环境文件夹发给别人
`,
    code: `# ========== 虚拟环境概念演示 ==========
# 注意：这里只演示虚拟环境的概念和命令，不实际创建虚拟目录
# 实际使用时请在终端执行这些命令

import sys
import os

print("=" * 60)
print("🌱 Python 虚拟环境 (venv) - 概念与用法")
print("=" * 60)

# 当前 Python 环境信息
print("\\n=== 当前 Python 环境信息 ===")
print(f"  Python 可执行文件: {sys.executable}")
print(f"  Python 版本: {sys.version.split()[0]}")
print(f"  当前工作目录: {os.getcwd()}")

# 创建和使用流程
print("\\n=== 虚拟环境使用流程（命令行操作）===")
steps = [
    ("第1步", "进入项目目录", "cd /path/to/my_project"),
    ("第2步", "创建虚拟环境", "python -m venv venv"),
    ("第3步", "激活虚拟环境 (Mac/Linux)", "source venv/bin/activate"),
    ("第3步", "激活虚拟环境 (Windows)", r"venv\\Scripts\\activate"),
    ("第4步", "安装依赖包", "pip install requests flask"),
    ("第5步", "开发项目", "python app.py"),
    ("第6步", "导出依赖（给别人用）", "pip freeze > requirements.txt"),
    ("第7步", "退出虚拟环境", "deactivate"),
]

for step, desc, cmd in steps:
    print(f"\\n  {step}: {desc}")
    print(f"    $ {cmd}")

# 虚拟环境做了什么
print("\\n=== 虚拟环境创建了什么？===")
print("  venv/")
print("  ├── bin/ (Scripts on Windows)")
print("  │   ├── python        → 虚拟环境的 Python 解释器")
print("  │   ├── pip           → 虚拟环境的 pip")
print("  │   └── activate      → 激活脚本")
print("  ├── lib/")
print("  │   └── python3.13/")
print("  │       └── site-packages/  ← 安装的包都在这里！")
print("  ├── include/")
print("  └── pyvenv.cfg       → 配置文件")

# 为什么需要虚拟环境
print("\\n=== 为什么要用虚拟环境？===")
problems = [
    ("❌ 不用虚拟环境",
     ["所有包都装在全局，不同项目版本冲突",
      "项目A需要Django 3.2，项目B需要Django 5.0，无法同时安装",
      "系统Python被搞乱，可能影响系统功能",
      "无法区分哪些包是哪个项目需要的"]),
    ("✅ 使用虚拟环境",
     ["每个项目有独立的包空间",
      "想装什么版本就装什么版本，互不干扰",
      "项目打包时依赖清晰",
      "可以随时删除重建，不影响其他项目"]),
]
for title, items in problems:
    print(f"\\n  {title}:")
    for item in items:
        print(f"    • {item}")

# 如何在 VS Code / PyCharm 中选择虚拟环境
print("\\n=== 在编辑器中选择虚拟环境 ===")
print("  VS Code:  左下角选择 Python 解释器 → 选择 venv/bin/python")
print("  PyCharm:  Settings → Project → Python Interpreter → 添加 venv")

print("\\n⚠️  重要提示：")
print("  • 虚拟环境目录 (venv/) 不要提交到 Git！加到 .gitignore")
print("  • 分享项目时，分享 requirements.txt 而不是 venv 文件夹")
print("  • 别人拿到代码：python -m venv venv && pip install -r requirements.txt")

# requirements.txt 示例
print("\\n=== requirements.txt 示例 ===")
print("requests==2.31.0")
print("flask==3.0.0")
print("numpy>=1.24.0")
`,
  },
  {
    id: "py6-name-main", group: "模块与包", icon: "🎬", title: "if __name__ == '__main__'",
    content: `## 🎬 if __name__ == '__main__' 的含义

你可能经常在 Python 文件末尾看到这段神秘代码：

\`\`\`python
if __name__ == '__main__':
    # 测试代码...
\`\`\`

它到底是什么意思？

### __name__ 是什么？

每个 Python 模块（.py 文件）都有一个内置属性 \`__name__\`：
- 如果这个文件是**被直接运行**的，\`__name__\` 的值是 \`"__main__"\`
- 如果这个文件是**被别的文件 import** 的，\`__name__\` 的值就是**模块名**（也就是文件名）

### 它的作用

用来区分两种场景：
1. **直接运行这个文件**：执行测试代码或演示代码
2. **被当作模块导入**：不执行测试代码，只提供函数/类给别人用

### 比喻

把模块想象成一辆车：
- \`if __name__ == '__main__'\` 就像"试驾模式"
- 直接运行 = 去4S店试驾，开两圈试试
- import 导入 = 买回家，只有真正用车的时候才开，不试驾

### 实际用途

1. **模块自测**：写模块时顺便写测试代码，直接运行就能测试
2. **脚本入口**：既可以当模块被导入，也可以当脚本直接运行
3. **避免副作用**：防止导入模块时自动执行不该执行的代码

### 典型结构

\`\`\`python
#!/usr/bin/env python3
"""模块文档字符串"""

def greet(name):
    return f"Hello, {name}!"

def add(a, b):
    return a + b

# 文件末尾
if __name__ == '__main__':
    # 这里的代码只有直接运行时才会执行
    print(greet("World"))
    print(add(3, 5))
\`\`\`
`,
    code: `# ========== if __name__ == '__main__' 演示 ==========

print("===== 顶层代码开始执行 =====")
print(f"当前文件的 __name__ = {repr(__name__)}")
print()

# 定义一些函数和变量
def add(a, b):
    """加法函数"""
    return a + b

def greet(name):
    """问候函数"""
    return f"你好, {name}!"

TEST_VALUE = 100

# ========== 关键部分 ==========
# 下面的代码在"直接运行"时执行，被import时不执行

if __name__ == '__main__':
    print("===== 进入 if __name__ == '__main__' 块 =====")
    print("这说明当前文件是被直接运行的！")
    print()

    # 在这里放测试代码
    print("=== 自测代码 ===")
    print(f"add(3, 5) = {add(3, 5)}")
    print(f"add(10, 20) = {add(10, 20)}")
    print(f"greet('小明') = {greet('小明')}")
    print(f"TEST_VALUE = {TEST_VALUE}")
else:
    print("===== __name__ 不是 __main__ =====")
    print("这说明当前文件是被 import 的，不执行测试代码")
    print(f"__name__ 的值是: {repr(__name__)}")

print("\\n===== 所有代码执行完毕 =====")

# 补充演示：模拟被导入的情况
print("\\n===== 补充说明：被 import 时是什么样？=====")
print("假设另一个文件写了: import this_module")
print("  1. 模块顶层代码会执行（上面的 print 会输出）")
print("  2. add, greet 函数被定义")
print("  3. 但 if __name__ == '__main__' 里的自测代码不会执行！")
print("  4. __name__ 的值是 'this_module'（模块名）")
`,
  },
  {
    id: "py6-dir-help", group: "模块与包", icon: "📚", title: "dir() 和 help()",
    content: `## 📚 dir() 和 help() —— Python 自带的帮助工具

学会使用 \`dir()\` 和 \`help()\`，你就不用死记硬背所有方法了！它们是你的"内置文档"。

### dir() —— 查看对象有哪些成员

\`dir()\` 返回一个列表，包含对象的所有属性和方法名。

\`\`\`python
import math
print(dir(math))       # 查看 math 模块有什么
print(dir("hello"))    # 查看字符串有什么方法
print(dir([]))         # 查看列表有什么方法
\`\`\`

不带参数时，\`dir()\` 列出当前作用域的所有变量名。

### help() —— 查看帮助文档

\`help()\` 显示对象的帮助文档，包括：
- 模块/类/函数的说明
- 参数信息
- 使用示例

\`\`\`python
import math
help(math)        # 查看 math 模块完整帮助
help(math.sqrt)   # 查看 sqrt 函数的帮助
help(str)         # 查看字符串类的帮助
help(str.split)   # 查看 split 方法的帮助
\`\`\`

按 \`q\` 退出帮助界面（在终端中）。

### 常用组合用法

| 命令 | 作用 |
|------|------|
| \`dir(module)\` | 快速看模块里有哪些函数/变量 |
| \`help(函数名)\` | 详细了解某个函数怎么用 |
| \`type(obj)\` | 查看对象是什么类型 |
| \`obj.__doc__\` | 直接看文档字符串 |

### 其他查看信息的方法

- \`__doc__\`：查看文档字符串
- \`__file__\`：查看模块文件位置
- \`__all__\`：查看模块公开的接口

### 小技巧

在交互式环境（REPL）中：
- 输入 \`对象.\` 然后按 Tab 键自动补全
- 输入 \`函数?\`（IPython中）查看文档
- 善用 help()，比查 Google 还快！
`,
    code: `# ========== dir() 和 help() 演示 ==========

import math
import random
import sys

print("=" * 60)
print("📚 dir() 和 help() 使用演示")
print("=" * 60)

# 1. dir() - 查看模块的成员
print("\\n=== dir(math)：math 模块的所有成员 ===")
math_members = dir(math)
# 过滤掉私有成员（以_开头的）
public_members = [m for m in math_members if not m.startswith('_')]
print(f"math 模块共有 {len(public_members)} 个公开成员:")
print(public_members)

# 2. dir() - 查看字符串的方法
print("\\n=== dir('hello')：字符串对象的方法 ===")
s = "hello"
str_methods = [m for m in dir(s) if not m.startswith('_')]
print(f"字符串共有 {len(str_methods)} 个公开方法:")
print(str_methods)

# 3. dir() - 查看列表的方法
print("\\n=== dir([])：列表对象的方法 ===")
lst = []
list_methods = [m for m in dir(lst) if not m.startswith('_')]
print(f"列表共有 {len(list_methods)} 个公开方法:")
print(list_methods)

# 4. dir() 不带参数 - 查看当前作用域的变量
print("\\n=== dir() 无参数：当前作用域的名字 ===")
current_names = [n for n in dir() if not n.startswith('_')]
print(current_names)

# 5. __doc__ 查看文档字符串（help的精简版）
print("\\n=== __doc__ 属性：查看文档 ===")
print("math.sqrt 的文档:")
print(f"  {math.sqrt.__doc__}")
print()
print("random.randint 的文档:")
print(f"  {random.randint.__doc__}")

# 6. 模拟 help() 的输出（实际help()是交互式的，这里用 __doc__ 代替）
print("\\n=== 使用 print 查看文档（非交互式替代 help()）===")
print("help() 是交互式的，在脚本中我们可以打印 __doc__:")
print()
print("--- math.log 文档 ---")
print(math.log.__doc__)
print()
print("--- math.factorial 文档 ---")
print(math.factorial.__doc__)

# 7. 常见对象的类型查看
print("\\n=== type() 查看对象类型 ===")
objects = [42, 3.14, "hello", [1,2,3], (1,2), {'a':1}, {1,2}, True, None]
for obj in objects:
    print(f"  {repr(obj):20s} 的类型是 {type(obj).__name__}")

# 8. 实用技巧：快速查找函数
print("\\n=== 实用技巧：查找包含特定关键字的方法 ===")
# 比如查找 math 中包含 'log' 的函数
log_related = [m for m in dir(math) if 'log' in m.lower()]
print(f"math 中与 log 相关的: {log_related}")

# 查找字符串中与 'case' 相关的方法
case_methods = [m for m in dir(str) if 'case' in m.lower() or m.islower() or 'upper' in m.lower()]
print(f"字符串中大小写相关的方法(举例): {[m for m in dir(str) if 'case' in m.lower() or 'upper' in m.lower() or 'lower' in m.lower()]}")
`,
  },
  {
    id: "py6-stdlib-overview", group: "模块与包", icon: "🗺️", title: "Python 标准库概览",
    content: `## 🗺️ Python 标准库概览

Python 有一句名言：**"Batteries Included"（自带电池）**——意思是 Python 自带了非常丰富的标准库，很多功能不用安装第三方包就能实现。

### 标准库分类一览

#### 📄 文本处理
| 模块 | 用途 |
|------|------|
| \`string\` | 字符串常量和模板 |
| \`re\` | 正则表达式 |
| \`textwrap\` | 文本换行填充 |
| \`difflib\` | 文本差异比较 |

#### 🔢 数据类型
| 模块 | 用途 |
|------|------|
| \`collections\` | 高级容器：Counter, defaultdict, deque, namedtuple |
| \`datetime\` | 日期和时间处理 |
| \`calendar\` | 日历相关 |
| \`enum\` | 枚举类型 |
| \`array\` | 数组类型 |
| \`copy\` | 浅拷贝和深拷贝 |
| \`pprint\` | 美化打印 |

#### 🔧 数学与数字
| 模块 | 用途 |
|------|------|
| \`math\` | 数学函数 |
| \`random\` | 随机数 |
| \`statistics\` | 统计计算 |
| \`decimal\` | 精确十进制运算 |
| \`fractions\` | 分数 |

#### 📁 文件与系统
| 模块 | 用途 |
|------|------|
| \`os\` | 操作系统接口 |
| \`os.path\` | 路径操作 |
| \`pathlib\` | 现代路径操作（推荐）|
| \`shutil\` | 文件高级操作（复制/移动/删除）|
| \`glob\` | 文件通配符匹配 |
| \`tempfile\` | 临时文件 |

#### 📦 数据持久化
| 模块 | 用途 |
|------|------|
| \`json\` | JSON 编码解码 |
| \`csv\` | CSV 文件读写 |
| \`pickle\` | Python 对象序列化 |
| \`sqlite3\` | SQLite 数据库 |

#### 🌐 网络与互联网
| 模块 | 用途 |
|------|------|
| \`urllib\` | URL处理和HTTP请求 |
| \`http\` | HTTP 服务器/客户端 |
| \`socket\` | 底层网络接口 |
| \`email\` | 邮件处理 |

#### ⚡ 并发与并行
| 模块 | 用途 |
|------|------|
| \`threading\` | 多线程 |
| \`multiprocessing\` | 多进程 |
| \`asyncio\` | 异步IO |
| \`concurrent.futures\` | 高级并发接口 |

#### 🧪 测试与调试
| 模块 | 用途 |
|------|------|
| \`unittest\` | 单元测试框架 |
| \`logging\` | 日志记录 |
| \`timeit\` | 代码性能计时 |
| \`traceback\` | 异常栈追踪 |
`,
    code: `# ========== Python 标准库概览演示 ==========
# 这里演示一些常用标准库的基础用法，让你对"内置电池"有直观感受

import sys
import os
import math
import random
import datetime
import json
import collections
import statistics
import pprint

print("=" * 60)
print("🗺️ Python 标准库 - 综合演示")
print("=" * 60)

# ---------- 1. math 数学 ----------
print("\\n📐 math 模块:")
print(f"  π = {math.pi:.6f}")
print(f"  √16 = {math.sqrt(16)}")
print(f"  5! = {math.factorial(5)}")
print(f"  gcd(12, 8) = {math.gcd(12, 8)}")

# ---------- 2. random 随机数 ----------
print("\\n🎲 random 模块:")
print(f"  随机整数[1,10]: {random.randint(1, 10)}")
print(f"  随机选择: {random.choice(['苹果', '香蕉', '橙子'])}")
nums = [1, 2, 3, 4, 5]
random.shuffle(nums)
print(f"  打乱后: {nums}")

# ---------- 3. datetime 日期时间 ----------
print("\\n📅 datetime 模块:")
now = datetime.datetime.now()
print(f"  当前时间: {now.strftime('%Y年%m月%d日 %H:%M:%S')}")
print(f"  今天是周{now.isoweekday()}")
tomorrow = now + datetime.timedelta(days=1)
print(f"  明天: {tomorrow.strftime('%Y-%m-%d')}")

# ---------- 4. json 处理 ----------
print("\\n📋 json 模块:")
data = {"name": "小明", "age": 20, "hobbies": ["读书", "编程"]}
json_str = json.dumps(data, ensure_ascii=False, indent=2)
print("  Python对象 -> JSON字符串:")
print("  " + json_str.replace("\\n", "\\n  "))
parsed = json.loads(json_str)
print(f"  JSON字符串 -> Python对象: name={parsed['name']}")

# ---------- 5. collections 高级容器 ----------
print("\\n📦 collections 模块:")
# Counter 统计频次
words = ["apple", "banana", "apple", "orange", "banana", "apple"]
counter = collections.Counter(words)
print(f"  词频统计: {dict(counter)}")
print(f"  出现最多的2个: {counter.most_common(2)}")

# defaultdict 默认值字典
dd = collections.defaultdict(int)
for w in words:
    dd[w] += 1
print(f"  defaultdict统计: {dict(dd)}")

# deque 双端队列
d = collections.deque([1, 2, 3])
d.appendleft(0)
d.append(4)
print(f"  deque双端队列: {list(d)}")

# ---------- 6. statistics 统计 ----------
print("\\n📊 statistics 模块:")
scores = [85, 92, 78, 90, 88, 95, 82]
print(f"  数据: {scores}")
print(f"  平均值: {statistics.mean(scores):.1f}")
print(f"  中位数: {statistics.median(scores)}")
print(f"  标准差: {statistics.stdev(scores):.2f}")

# ---------- 7. pprint 美化打印 ----------
print("\\n🖨️  pprint 模块:")
complex_data = {
    "users": [
        {"name": "张三", "age": 25, "skills": ["Python", "Java"]},
        {"name": "李四", "age": 30, "skills": ["C++", "Go", "Rust"]},
    ]
}
print("  普通print:")
print(f"  {complex_data}")
print("  美化pprint:")
pprint.pprint(complex_data, indent=2, width=50)

# ---------- 8. os 系统信息 ----------
print("\\n🖥️  os/sys 模块:")
print(f"  当前平台: {sys.platform}")
print(f"  Python版本: {sys.version_info.major}.{sys.version_info.minor}")
print(f"  当前工作目录: {os.getcwd()}")

# ---------- 统计 ----------
print("\\n" + "=" * 60)
print("💡 Python 标准库有 200+ 个模块！")
print("   上面只展示了冰山一角")
print("   官方文档: https://docs.python.org/zh-cn/3/library/")
print("=" * 60)
`,
  },
  {
    id: "py6-sys", group: "模块与包", icon: "⚙️", title: "sys 模块",
    content: `## ⚙️ sys 模块 —— 系统相关参数和函数

\`sys\` 模块提供了与 Python 解释器**紧密交互**的变量和函数，比如命令行参数、模块搜索路径、退出程序等。

### 常用属性

| 属性 | 说明 |
|------|------|
| \`sys.argv\` | 命令行参数列表，\`argv[0]\` 是脚本名 |
| \`sys.path\` | 模块搜索路径列表 |
| \`sys.platform\` | 当前操作系统平台 |
| \`sys.version\` | Python 版本字符串 |
| \`sys.version_info\` | Python 版本元组 |
| \`sys.modules\` | 已加载模块的字典 |
| \`sys.stdin\` | 标准输入 |
| \`sys.stdout\` | 标准输出 |
| \`sys.stderr\` | 标准错误输出 |
| \`sys.excutable\` | Python 解释器路径 |
| \`sys.exit()\` | 退出程序 |

### sys.argv —— 命令行参数

\`sys.argv\` 是一个列表，包含了命令行传入的参数：

\`\`\`bash
python script.py hello world 123
# sys.argv = ['script.py', 'hello', 'world', '123']
\`\`\`

### sys.exit() —— 退出程序

\`sys.exit(0)\` 表示正常退出，非0表示异常退出。
在脚本中可以用它提前终止程序。

### sys.path —— 模块搜索路径

前面章节已经讲过，它决定了 import 到哪里找模块。

### stdin/stdout/stderr

- \`sys.stdin\`：标准输入（默认是键盘）
- \`sys.stdout\`：标准输出（默认是屏幕），\`print()\` 就是写到这里
- \`sys.stderr\`：标准错误（默认也是屏幕，但可以重定向）

你可以重定向它们，比如把输出写到文件里。
`,
    code: `# ========== sys 模块常用功能演示 ==========

import sys

print("=" * 60)
print("⚙️ sys 模块 - 系统交互")
print("=" * 60)

# 1. 版本信息
print("\\n=== Python 版本信息 ===")
print(f"  sys.version: {sys.version}")
print(f"  sys.version_info: {sys.version_info}")
print(f"  主版本号: {sys.version_info.major}")
print(f"  次版本号: {sys.version_info.minor}")
print(f"  微版本号: {sys.version_info.micro}")

# 2. 平台信息
print("\\n=== 平台信息 ===")
print(f"  sys.platform: {sys.platform}")
# 常见值: 'darwin'(macOS), 'win32'(Windows), 'linux'(Linux)
platform_names = {
    'darwin': 'macOS',
    'win32': 'Windows',
    'linux': 'Linux',
}
print(f"  当前操作系统: {platform_names.get(sys.platform, sys.platform)}")
print(f"  sys.executable (Python解释器路径): {sys.executable}")

# 3. 命令行参数
print("\\n=== 命令行参数 sys.argv ===")
print(f"  argv 列表: {sys.argv}")
print(f"  脚本名称(argv[0]): {sys.argv[0]}")
print(f"  参数个数: {len(sys.argv) - 1}")
if len(sys.argv) > 1:
    print("  传入的参数:")
    for i, arg in enumerate(sys.argv[1:], 1):
        print(f"    argv[{i}] = {arg}")
else:
    print("  (没有传入额外参数)")
print()
print("  使用方式示例: python script.py arg1 arg2")
print("  可以用来做命令行工具，比如:")
print("    python copy.py source.txt dest.txt")

# 4. 模块搜索路径
print("\\n=== 模块搜索路径 sys.path ===")
print(f"  共有 {len(sys.path)} 个搜索路径")
print("  前3个路径:")
for p in sys.path[:3]:
    print(f"    - {p}")

# 5. 已加载模块
print("\\n=== 已加载模块 sys.modules ===")
print(f"  当前已加载 {len(sys.modules)} 个模块")
# 看几个常见模块是否已加载
check_mods = ['sys', 'os', 'math', 'json', 'random', 'collections']
for mod in check_mods:
    status = "✓ 已加载" if mod in sys.modules else "✗ 未加载"
    print(f"    {mod:15s}: {status}")

# 6. 标准流
print("\\n=== 标准输入/输出/错误 ===")
print(f"  sys.stdin  = {sys.stdin}")
print(f"  sys.stdout = {sys.stdout}")
print(f"  sys.stderr = {sys.stderr}")
print("  print() 函数默认输出到 sys.stdout")

# 7. 字节序和递归限制
print("\\n=== 其他信息 ===")
print(f"  sys.maxsize (最大整数值): {sys.maxsize}")
print(f"  sys.recursionlimit (递归深度限制): {sys.getrecursionlimit()}")
print(f"  sys.byteorder (字节序): {sys.byteorder}")

# 8. sys.exit 说明（不实际调用，否则程序会退出）
print("\\n=== sys.exit() ===")
print("  sys.exit(0)    # 正常退出")
print("  sys.exit(1)    # 异常退出（非0表示错误）")
print("  sys.exit('错误信息')  # 打印信息并退出")
print("  （本演示不实际调用 exit，否则你就看不到下面的内容了！）")

# 9. 内存大小
print("\\n=== 对象占用内存大小 sys.getsizeof() ===")
print(f"  整数 0 占用: {sys.getsizeof(0)} 字节")
print(f"  整数 100 占用: {sys.getsizeof(100)} 字节")
print(f"  空字符串占用: {sys.getsizeof('')} 字节")
print(f"  空列表占用: {sys.getsizeof([])} 字节")
print(f"  空字典占用: {sys.getsizeof({})} 字节")
`,
  },
  {
    id: "py6-os", group: "模块与包", icon: "🖥️", title: "os 模块",
    content: `## 🖥️ os 模块 —— 操作系统接口

\`os\` 模块提供了很多与操作系统交互的函数，让你可以跨平台地操作文件系统、进程、环境变量等。

### 常用功能分类

#### 📁 目录操作
| 函数 | 说明 |
|------|------|
| \`os.getcwd()\` | 获取当前工作目录 |
| \`os.chdir(path)\` | 改变当前工作目录 |
| \`os.listdir(path)\` | 列出目录下的文件和子目录 |
| \`os.mkdir(path)\` | 创建目录（单层） |
| \`os.makedirs(path)\` | 创建目录（递归创建多层） |
| \`os.rmdir(path)\` | 删除空目录 |
| \`os.removedirs(path)\` | 递归删除空目录 |
| \`os.rename(src, dst)\` | 重命名文件/目录 |

#### 📄 文件操作
| 函数 | 说明 |
|------|------|
| \`os.remove(path)\` | 删除文件 |
| \`os.stat(path)\` | 获取文件状态信息 |
| \`os.path.exists(path)\` | 判断路径是否存在 |

#### 🌍 环境变量和进程
| 函数/属性 | 说明 |
|------|------|
| \`os.environ\` | 环境变量字典 |
| \`os.getenv(key)\` | 获取环境变量 |
| \`os.getpid()\` | 获取当前进程ID |
| \`os.getlogin()\` | 获取当前登录用户名 |
| \`os.system(cmd)\` | 执行系统命令（不推荐，用subprocess） |

#### 🔧 跨平台常量
| 常量 | 说明 |
|------|------|
| \`os.name\` | 操作系统名：'posix'(Linux/Mac) 或 'nt'(Windows) |
| \`os.sep\` | 路径分隔符：'/' 或 '\\\\' |
| \`os.linesep\` | 换行符：'
' 或 '
' |
| \`os.pathsep\` | 环境变量路径分隔符：':' 或 ';' |

### 重要安全提示

- \`os.system()\` 有安全风险（命令注入），不建议使用
- 删除文件/目录前一定要确认路径正确！
- 操作文件推荐使用 \`pathlib\` 或 \`shutil\` 模块
- 临时文件用 \`tempfile\` 模块自动管理和清理
`,
    code: `# ========== os 模块演示 ==========
# 所有文件操作都在临时目录中进行，最后自动清理

import os
import sys
import tempfile
import shutil

print("=" * 60)
print("🖥️ os 模块 - 操作系统接口")
print("=" * 60)

# 1. 平台信息
print("\\n=== 平台信息 ===")
print(f"  os.name: {os.name}")  # posix = Linux/Mac, nt = Windows
print(f"  os.sep (路径分隔符): '{os.sep}'")
print(f"  os.linesep (换行符): {repr(os.linesep)}")
print(f"  os.pathsep (路径分隔符): '{os.pathsep}'")

# 2. 进程信息
print("\\n=== 进程信息 ===")
print(f"  当前进程ID (pid): {os.getpid()}")
try:
    print(f"  父进程ID (ppid): {os.getppid()}")
except:
    pass
try:
    print(f"  当前登录用户: {os.getlogin()}")
except:
    print("  当前登录用户: (无法获取)")

# 3. 环境变量
print("\\n=== 环境变量 os.environ ===")
# 查看几个常见的环境变量
env_vars = ['HOME', 'PATH', 'USER', 'SHELL', 'LANG', 'PWD']
for var in env_vars:
    value = os.environ.get(var, '(未设置)')
    if var == 'PATH' and len(value) > 80:
        value = value[:80] + '...'
    print(f"  {var}: {value}")

# 获取单个环境变量
print(f"\\n  os.getenv('HOME') = {os.getenv('HOME', '(未找到)')}")

# 4. 创建临时目录进行文件操作演示
temp_dir = tempfile.mkdtemp()
print(f"\\n=== 在临时目录中演示文件操作 ===")
print(f"临时目录: {temp_dir}")

# 获取当前工作目录
original_cwd = os.getcwd()
print(f"当前工作目录: {original_cwd}")

# 5. 目录操作
os.chdir(temp_dir)
print(f"切换到临时目录: {os.getcwd()}")

# 创建子目录
os.mkdir('test_dir')
print(f"mkdir test_dir → 创建单层目录")
os.makedirs('a/b/c')
print(f"makedirs a/b/c → 递归创建多层目录")

# 列出目录内容
print(f"listdir('.') → {os.listdir('.')}")

# 创建空文件
with open('test_dir/hello.txt', 'w') as f:
    f.write('Hello, os module!')
print(f"创建了 test_dir/hello.txt")

print(f"listdir('test_dir') → {os.listdir('test_dir')}")

# 6. 文件信息
stat_info = os.stat('test_dir/hello.txt')
print(f"\\n=== 文件信息 os.stat() ===")
print(f"  文件大小: {stat_info.st_size} 字节")
print(f"  修改时间: {stat_info.st_mtime}")

# 7. 重命名
os.rename('test_dir/hello.txt', 'test_dir/world.txt')
print(f"rename hello.txt → world.txt")
print(f"listdir('test_dir') → {os.listdir('test_dir')}")

# 8. 删除操作
os.remove('test_dir/world.txt')
print(f"remove world.txt → 删除文件")
os.rmdir('test_dir')
print(f"rmdir test_dir → 删除空目录")
shutil.rmtree('a')  # 删除非空目录用 shutil
print(f"shutil.rmtree a → 删除非空目录树")

# 切换回原目录
os.chdir(original_cwd)

# 清理临时目录
shutil.rmtree(temp_dir)
print(f"\\n=== 临时目录已清理 ===")

# 9. os.path 常用功能预告
print("\\n=== os.path 预告（下一节详细讲）===")
print("  os.path.join() - 拼接路径")
print("  os.path.exists() - 判断路径是否存在")
print("  os.path.isfile() - 判断是否是文件")
print("  os.path.isdir() - 判断是否是目录")
print("  os.path.abspath() - 获取绝对路径")
`,
  },
  {
    id: "py6-os-path", group: "模块与包", icon: "🛤️", title: "os.path 路径操作",
    content: `## 🛤️ os.path 路径操作

路径处理是编程中非常常见的任务。\`os.path\` 模块提供了跨平台的路径操作函数，让你不用关心 Windows 和 Unix 的路径差异。

### 为什么需要 os.path？

Windows 路径用反斜杠 \`C:\Usersile.txt\`
macOS/Linux 路径用正斜杠 \`/home/user/file.txt\`

\`os.path.join()\` 等函数会自动使用正确的分隔符！

### 常用函数

| 函数 | 说明 |
|------|------|
| \`os.path.join(a, b, c)\` | 拼接路径（自动加分隔符）|
| \`os.path.abspath(path)\` | 返回绝对路径 |
| \`os.path.exists(path)\` | 路径是否存在 |
| \`os.path.isfile(path)\` | 是否是文件 |
| \`os.path.isdir(path)\` | 是否是目录 |
| \`os.path.basename(path)\` | 获取文件名（最后一部分）|
| \`os.path.dirname(path)\` | 获取目录名（前面的部分）|
| \`os.path.split(path)\` | 拆分成 (目录, 文件名) |
| \`os.path.splitext(path)\` | 拆分扩展名 (名字, .ext) |
| \`os.path.getsize(path)\` | 获取文件大小（字节）|
| \`os.path.getmtime(path)\` | 获取最后修改时间 |

### 路径拼接的正确方式

❌ 错误写法（不跨平台）：
\`\`\`python
path = dir + "/" + filename  # Windows上可能出错
\`\`\`

✅ 正确写法：
\`\`\`python
path = os.path.join(dir, filename)  # 自动处理分隔符
\`\`\`

### 绝对路径 vs 相对路径

- **相对路径**：相对于当前工作目录，如 \`data/file.txt\`
- **绝对路径**：从根目录开始，如 \`/home/user/data/file.txt\` (Linux/Mac) 或 \`C:\Usersile.txt\` (Windows)

用 \`os.path.abspath()\` 可以把相对路径转成绝对路径。

### 更现代的选择：pathlib

Python 3.4+ 推荐用 \`pathlib.Path\` 来代替 \`os.path\`，更面向对象、更简洁。下一节会介绍。
`,
    code: `# ========== os.path 路径操作演示 ==========
# 使用临时目录演示，不影响真实文件系统

import os
import tempfile
import shutil
import time

print("=" * 60)
print("🛤️ os.path 模块 - 路径操作")
print("=" * 60)

# 当前平台路径分隔符
print(f"\\n当前平台路径分隔符: '{os.sep}'")

# 创建临时目录进行演示
temp_dir = tempfile.mkdtemp()
print(f"临时目录: {temp_dir}")

# 在临时目录下创建一些文件和目录
os.makedirs(os.path.join(temp_dir, 'docs', 'notes'), exist_ok=True)
os.makedirs(os.path.join(temp_dir, 'images'), exist_ok=True)

# 创建几个文件
file1 = os.path.join(temp_dir, 'readme.txt')
file2 = os.path.join(temp_dir, 'docs', 'notes', 'memo.txt')
file3 = os.path.join(temp_dir, 'images', 'photo.jpg')

for fpath, content in [(file1, 'README'), (file2, '备忘录'), (file3, 'fake image')]:
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

print("演示目录结构:")
print(f"{temp_dir}/")
print(f"├── readme.txt")
print(f"├── docs/")
print(f"│   └── notes/")
print(f"│       └── memo.txt")
print(f"└── images/")
print(f"    └── photo.jpg")

# 1. os.path.join() 路径拼接
print("\\n=== os.path.join() 拼接路径 ===")
p1 = os.path.join(temp_dir, 'docs', 'notes', 'memo.txt')
print(f"  os.path.join(dir, 'docs', 'notes', 'memo.txt')")
print(f"  → {p1}")
p2 = os.path.join(temp_dir, 'images', 'photo.jpg')
print(f"  os.path.join(dir, 'images', 'photo.jpg')")
print(f"  → {p2}")

# 2. os.path.split() 拆分路径
print("\\n=== os.path.split() 拆分 (目录, 文件名) ===")
for path in [file1, file2, file3, temp_dir]:
    dir_part, file_part = os.path.split(path)
    print(f"  {path}")
    print(f"    目录: {dir_part}")
    print(f"    文件: {file_part if file_part else '(无，本身是目录)'}")

# 3. os.path.basename() 获取文件名
print("\\n=== os.path.basename() 获取文件名 ===")
print(f"  basename('{file1}') → '{os.path.basename(file1)}'")
print(f"  basename('{file2}') → '{os.path.basename(file2)}'")
print(f"  basename('{temp_dir}') → '{os.path.basename(temp_dir)}'")

# 4. os.path.dirname() 获取目录名
print("\\n=== os.path.dirname() 获取目录名 ===")
print(f"  dirname('{file1}') → '{os.path.dirname(file1)}'")
print(f"  dirname('{file2}') → '{os.path.dirname(file2)}'")

# 5. os.path.splitext() 拆分扩展名
print("\\n=== os.path.splitext() 拆分扩展名 ===")
test_files = ['report.pdf', 'image.tar.gz', 'noext', '.bashrc', 'index.html']
for name in test_files:
    stem, ext = os.path.splitext(name)
    print(f"  '{name}' → 主名: '{stem}', 扩展名: '{ext}'")

# 6. exists/isfile/isdir 判断
print("\\n=== exists/isfile/isdir 判断 ===")
paths_to_check = [
    (file1, "readme.txt"),
    (file2, "memo.txt"),
    (os.path.join(temp_dir, 'docs'), "docs目录"),
    (os.path.join(temp_dir, 'not_exist'), "不存在的路径"),
]
for path, label in paths_to_check:
    print(f"  {label}:")
    print(f"    exists: {os.path.exists(path)}")
    print(f"    isfile: {os.path.isfile(path)}")
    print(f"    isdir:  {os.path.isdir(path)}")

# 7. abspath 绝对路径
print("\\n=== os.path.abspath() 绝对路径 ===")
# 在临时目录中操作
orig_cwd = os.getcwd()
os.chdir(temp_dir)
print(f"  abspath('readme.txt') → {os.path.abspath('readme.txt')}")
print(f"  abspath('.') → {os.path.abspath('.')}")
print(f"  abspath('..') → {os.path.abspath('..')}")
os.chdir(orig_cwd)

# 8. getsize 文件大小
print("\\n=== os.path.getsize() 文件大小 ===")
print(f"  readme.txt: {os.path.getsize(file1)} 字节")
print(f"  memo.txt: {os.path.getsize(file2)} 字节")

# 清理临时文件
shutil.rmtree(temp_dir)
print("\\n=== 临时目录已清理 ===")

# 常见错误
print("\\n=== 常见错误提醒 ===")
print("  ❌ path = dir + '/' + file  → 不跨平台")
print("  ✅ path = os.path.join(dir, file)  → 正确")
print("  ❌ 假设路径分隔符永远是 '/'")
print("  ✅ 始终用 os.sep 或 os.path.join()")
print("  💡 Python 3.4+ 更推荐用 pathlib.Path（见下一节）")
`,
  },
  {
    id: "py6-pathlib", group: "模块与包", icon: "🌟", title: "pathlib 现代路径操作",
    content: `## 🌟 pathlib —— 现代路径操作

Python 3.4 引入了 \`pathlib\` 模块，用**面向对象**的方式处理路径，比 os.path 更直观、更优雅！

### 为什么推荐 pathlib？

- **面向对象**：路径是对象，不是字符串，可以直接调用方法
- **运算符重载**：用 \`/\` 拼接路径，比 os.path.join 更自然
- **功能更强大**：一个 Path 对象涵盖了 os + os.path + shutil + glob 的常用功能
- **代码更简洁**：链式调用，可读性更高

### Path 对象的基本用法

\`\`\`python
from pathlib import Path

# 创建 Path 对象
p = Path('/home/user/docs')       # 指定路径
p = Path.home()                    # 用户主目录
p = Path.cwd()                     # 当前工作目录
p = Path(__file__).parent          # 当前文件所在目录

# 用 / 运算符拼接路径（核心亮点！）
file_path = Path.cwd() / 'data' / 'readme.txt'

# 判断和属性
file_path.exists()      # 是否存在
file_path.is_file()     # 是否是文件
file_path.is_dir()      # 是否是目录
file_path.name          # 文件名 'readme.txt'
file_path.stem          # 主名 'readme'
file_path.suffix        # 扩展名 '.txt'
file_path.parent        # 父目录 Path 对象
file_path.absolute()    # 绝对路径
\`\`\`

### 读写文件（pathlib 自带！）

\`\`\`python
p = Path('hello.txt')
p.write_text('Hello!', encoding='utf-8')  # 写文件
content = p.read_text(encoding='utf-8')   # 读文件
\`\`\`

### 遍历目录

\`\`\`python
p = Path('.')
for f in p.iterdir():         # 遍历当前目录
    print(f.name)
for f in p.glob('*.py'):      # 匹配所有 .py 文件
    print(f)
for f in p.rglob('*.py'):     # 递归匹配所有子目录的 .py 文件
    print(f)
\`\`\`

### 创建/删除

\`\`\`python
Path('new_dir').mkdir(exist_ok=True)       # 创建目录
Path('new_dir').mkdir(parents=True, exist_ok=True)  # 递归创建
Path('file.txt').unlink()                  # 删除文件
Path('empty_dir').rmdir()                  # 删除空目录
\`\`\`
`,
    code: `# ========== pathlib 现代路径操作演示 ==========
# 使用临时目录演示，不影响真实文件系统

from pathlib import Path
import tempfile
import shutil
import os

print("=" * 60)
print("🌟 pathlib 模块 - 现代路径操作")
print("=" * 60)

# 1. 获取特殊路径
print("\\n=== 特殊路径 ===")
print(f"  Path.cwd() 当前工作目录: {Path.cwd()}")
print(f"  Path.home() 用户主目录: {Path.home()}")

# 2. 创建 Path 对象
print("\\n=== 创建 Path 对象 ===")
p = Path('example/file.txt')
print(f"  Path('example/file.txt') → {p}")
print(f"  类型: {type(p)}")

# 3. 用 / 运算符拼接路径（最大亮点！）
print("\\n=== 用 / 拼接路径 ===")
base = Path('/myproject')
subdir = 'src'
filename = 'main.py'
full_path = base / subdir / filename
print(f"  base / subdir / filename → {full_path}")
# 也可以和字符串混用
config_path = Path.cwd() / 'config' / 'settings.json'
print(f"  Path.cwd() / 'config' / 'settings.json' → {config_path}")

# 创建临时目录演示实际文件操作
temp_dir = Path(tempfile.mkdtemp())
print(f"\\n=== 在临时目录演示: {temp_dir} ===")

# 4. 创建目录
(temp_dir / 'docs').mkdir(exist_ok=True)
(temp_dir / 'src' / 'utils').mkdir(parents=True, exist_ok=True)
print("  mkdir: 创建了 docs/ 和 src/utils/")

# 5. 写文件（pathlib 自带方法！）
readme = temp_dir / 'readme.txt'
readme.write_text('欢迎使用 pathlib！\\n这是一个现代路径操作库。', encoding='utf-8')
print(f"  write_text: 写入了 {readme.name}")

# 在子目录中写文件
memo = temp_dir / 'docs' / 'memo.txt'
memo.write_text('备忘录内容', encoding='utf-8')
print(f"  write_text: 写入了 docs/memo.txt")

code_file = temp_dir / 'src' / 'main.py'
code_file.write_text('print("Hello from pathlib!")', encoding='utf-8')
print(f"  write_text: 写入了 src/main.py")

util_file = temp_dir / 'src' / 'utils' / 'helper.py'
util_file.write_text('# helper functions', encoding='utf-8')
print(f"  write_text: 写入了 src/utils/helper.py")

# 6. 读文件
print("\\n=== read_text 读文件 ===")
content = readme.read_text(encoding='utf-8')
print(f"  readme.txt 内容: {repr(content[:30])}...")

# 7. Path 属性
print("\\n=== Path 对象的属性 ===")
p = temp_dir / 'src' / 'main.py'
print(f"  路径: {p}")
print(f"  .name 文件名: {p.name}")
print(f"  .stem 主名: {p.stem}")
print(f"  .suffix 扩展名: {p.suffix}")
print(f"  .parent 父目录: {p.parent}")
print(f"  .parents[0] 父目录: {p.parents[0]}")
print(f"  .parents[1] 祖父目录: {p.parents[1]}")
print(f"  .anchor 根: {p.anchor}")
print(f"  .parts 各部分: {p.parts}")

# 8. exists/is_file/is_dir 判断
print("\\n=== 判断方法 ===")
paths_to_check = [readme, memo, temp_dir / 'docs', temp_dir / 'notexist']
for path in paths_to_check:
    print(f"  {path.name if path.name else str(path)}:")
    print(f"    exists={path.exists()}, is_file={path.is_file()}, is_dir={path.is_dir()}")

# 9. iterdir 遍历目录
print("\\n=== iterdir() 遍历目录 ===")
for item in temp_dir.iterdir():
    kind = "📁" if item.is_dir() else "📄"
    print(f"  {kind} {item.name}")

# 10. glob 模式匹配
print("\\n=== glob('*') 匹配所有文件 ===")
for f in temp_dir.glob('*'):
    print(f"  {f.name}")

print("\\n=== glob('*.txt') 匹配 .txt 文件 ===")
for f in temp_dir.glob('*.txt'):
    print(f"  {f.name}")

print("\\n=== rglob('*.py') 递归匹配所有 .py 文件 ===")
for f in temp_dir.rglob('*.py'):
    print(f"  {f.relative_to(temp_dir)}")

# 11. 文件大小和其他操作
print("\\n=== 文件信息 ===")
print(f"  readme.txt 大小: {readme.stat().st_size} 字节")
print(f"  readme.txt 是否绝对路径: {readme.is_absolute()}")
print(f"  readme.resolve() 绝对路径: {readme.resolve()}")

# 12. with_name / with_suffix 替换文件名/扩展名
print("\\n=== with_name / with_suffix ===")
original = Path('report.txt')
print(f"  原路径: {original}")
print(f"  with_name('final.pdf'): {original.with_name('final.pdf')}")
print(f"  with_suffix('.md'): {original.with_suffix('.md')}")

# 清理
shutil.rmtree(temp_dir)
print("\\n=== 临时目录已清理 ===")

# 对比 os.path vs pathlib
print("\\n=== os.path vs pathlib 对比 ===")
print("  功能               os.path 写法               pathlib 写法")
print("  ─────────────────────────────────────────────────────────────")
print("  拼接路径           os.path.join(a, b, c)      a / b / c")
print("  获取文件名         os.path.basename(p)        p.name")
print("  获取扩展名         os.path.splitext(p)[1]     p.suffix")
print("  获取父目录         os.path.dirname(p)         p.parent")
print("  判断存在           os.path.exists(p)          p.exists()")
print("  读文件             open(p).read()             p.read_text()")
print("  写文件             open(p,'w').write(t)       p.write_text(t)")
`,
  },
  {
    id: "py6-random", group: "模块与包", icon: "🎲", title: "random 随机数模块",
    content: `## 🎲 random 模块 —— 随机数生成

\`random\` 模块提供了生成伪随机数的各种函数。注意：Python 的 random 是**伪随机**，基于确定性算法，不要用于密码学场景！

### 常用函数

| 函数 | 说明 |
|------|------|
| \`random.random()\` | 生成 [0.0, 1.0) 之间的随机浮点数 |
| \`random.uniform(a, b)\` | 生成 [a, b] 之间的随机浮点数 |
| \`random.randint(a, b)\` | 生成 [a, b] 之间的随机整数（**包含b**）|
| \`random.randrange(start, stop, step)\` | 从 range 中随机选一个数（不包含stop）|
| \`random.choice(seq)\` | 从序列中随机选一个元素 |
| \`random.choices(seq, k=n)\` | 随机选n个元素（**有放回**，可重复）|
| \`random.sample(seq, k=n)\` | 随机选n个元素（**无放回**，不重复）|
| \`random.shuffle(seq)\` | 原地打乱序列顺序 |
| \`random.seed(n)\` | 设置随机种子（使结果可复现）|

### random() vs uniform()

- \`random()\` → 固定范围 [0, 1)
- \`uniform(a, b)\` → 指定范围 [a, b]

### randint() vs randrange()

- \`randint(a, b)\` → 包含 b，等价于 \`randrange(a, b+1)\`
- \`randrange(a, b)\` → 不包含 b
- \`randrange(0, 100, 2)\` → 随机偶数

### choice() vs choices() vs sample()

- \`choice(lst)\` → 选1个
- \`choices(lst, k=3)\` → 选3个，可能重复（有放回）
- \`sample(lst, k=3)\` → 选3个，不重复（无放回），且k不能超过序列长度

### seed 随机种子

随机数其实不是真正随机的，是通过算法算出来的。设置相同的 seed，每次运行得到的随机序列相同！这在需要**可复现**结果时很有用（比如测试、调试）。

### 安全提示

random 模块生成的是伪随机数，**不要用于密码学、安全相关场景**。如果需要安全的随机数，使用 \`secrets\` 模块。
`,
    code: `# ========== random 模块演示 ==========

import random

print("=" * 60)
print("🎲 random 模块 - 随机数生成")
print("=" * 60)

# 1. random() - [0.0, 1.0) 浮点数
print("\\n=== random() → [0.0, 1.0) 随机浮点数 ===")
for _ in range(5):
    print(f"  {random.random():.6f}")

# 2. uniform(a, b) - 指定范围浮点数
print("\\n=== uniform(10, 20) → [10, 20] 随机浮点数 ===")
for _ in range(5):
    print(f"  {random.uniform(10, 20):.4f}")

# 3. randint(a, b) - 随机整数（包含b！）
print("\\n=== randint(1, 6) → 掷骰子（1~6都可能）===")
dice_results = [random.randint(1, 6) for _ in range(10)]
print(f"  掷10次骰子: {dice_results}")
print(f"  ⚠️ 注意: randint(1,6) 包含6，和 range(1,6) 不同！")

# 4. randrange - 和 range 一样的参数
print("\\n=== randrange() ===")
print(f"  randrange(100): {random.randrange(100)} (0-99)")
print(f"  randrange(10, 20): {random.randrange(10, 20)} (10-19)")
print(f"  randrange(0, 100, 2): {random.randrange(0, 100, 2)} (随机偶数)")

# 5. choice - 从序列中选一个
print("\\n=== choice() 随机选一个 ===")
fruits = ['🍎 苹果', '🍌 香蕉', '🍊 橙子', '🍇 葡萄', '🍓 草莓', '🍉 西瓜']
print(f"  水果列表: {fruits}")
print(f"  随机选一个: {random.choice(fruits)}")
print(f"  再选一个: {random.choice(fruits)}")
print(f"  再选一个: {random.choice(fruits)}")

# 6. choices - 选多个（有放回，可能重复）
print("\\n=== choices(seq, k=n) 选n个（有放回，可重复）===")
chosen = random.choices(fruits, k=5)
print(f"  选5个水果（可能重复）: {chosen}")

# choices 还可以带权重！
print("\\n  === choices 带权重 weights ===")
prizes = ['一等奖', '二等奖', '三等奖', '谢谢参与']
weights = [1, 5, 20, 74]  # 权重
print(f"  奖项: {prizes}")
print(f"  权重: {weights}")
results = random.choices(prizes, weights=weights, k=20)
from collections import Counter
print(f"  抽20次结果统计: {dict(Counter(results))}")

# 7. sample - 选多个（无放回，不重复）
print("\\n=== sample(seq, k=n) 选n个（无放回，不重复）===")
sampled = random.sample(fruits, k=3)
print(f"  从6种水果中选3个（不重复）: {sampled}")
print(f"  ⚠️ sample的k不能超过序列长度，否则报错")
# 应用：随机抽样
print("\\n  应用: 从1-50中随机选6个彩票号码")
lottery = sorted(random.sample(range(1, 51), 6))
print(f"  彩票号码: {lottery}")

# 8. shuffle - 原地打乱
print("\\n=== shuffle() 打乱序列 ===")
cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
print(f"  原始牌: {cards}")
random.shuffle(cards)
print(f"  洗牌后: {cards}")
print(f"  发5张牌: {cards[:5]}")

# 9. seed 设置随机种子（可复现）
print("\\n=== seed() 设置随机种子（结果可复现）===")
print("  设置 seed(42) 后，每次运行随机序列都一样:")
random.seed(42)
seq1 = [random.randint(1, 100) for _ in range(5)]
print(f"  第1次 seed(42) → {seq1}")

random.seed(42)
seq2 = [random.randint(1, 100) for _ in range(5)]
print(f"  第2次 seed(42) → {seq2}")
print(f"  两次结果相同！seed相同，随机序列就相同")

# 不设seed时，默认用系统时间做种子，每次不同
random.seed()  # 不传参数则使用系统时间
seq3 = [random.randint(1, 100) for _ in range(5)]
print(f"  不用固定seed → {seq3} (每次运行不同)")

# 应用场景总结
print("\\n=== 应用场景 ===")
print("  random()     → 概率模拟、蒙特卡洛")
print("  randint()    → 掷骰子、抽奖、游戏")
print("  choice()     → 随机点名、抽签")
print("  choices()    → 带权重的随机选择（抽奖概率）")
print("  sample()     → 随机抽样、彩票、发牌")
print("  shuffle()    → 洗牌、打乱顺序")
print("  seed()       → 测试时需要可复现的结果")
print()
print("⚠️  重要提示: random 生成的是伪随机数")
print("   不要用于密码学/安全场景，安全场景请使用 secrets 模块")
`,
  },
  {
    id: "py6-math", group: "模块与包", icon: "📐", title: "math 数学模块",
    content: `## 📐 math 模块 —— 数学函数

\`math\` 模块提供了常用的数学函数和常量，都是浮点数运算（如果需要复数请用 \`cmath\` 模块）。

### 数学常量

| 常量 | 说明 | 近似值 |
|------|------|--------|
| \`math.pi\` | 圆周率 π | 3.1415926535... |
| \`math.e\` | 自然常数 e | 2.7182818284... |
| \`math.tau\` | 2π（周长与半径比）| 6.2831853071... |
| \`math.inf\` | 正无穷大 | float('inf') |
| \`math.nan\` | 非数字 | float('nan') |

### 数值运算

| 函数 | 说明 |
|------|------|
| \`math.ceil(x)\` | 向上取整（天花板）|
| \`math.floor(x)\` | 向下取整（地板）|
| \`math.trunc(x)\` | 截断取整（向0取整）|
| \`math.fabs(x)\` | 绝对值（返回float）|
| \`math.factorial(n)\` | 阶乘 n! |
| \`math.gcd(a, b)\` | 最大公约数 |
| \`math.lcm(a, b)\` | 最小公倍数（Python 3.9+）|
| \`math.pow(x, y)\` | x 的 y 次幂（返回float）|
| \`math.sqrt(x)\` | 平方根 |
| \`math.isqrt(n)\` | 整数平方根（Python 3.8+）|
| \`math.copysign(x, y)\` | 把y的符号给x |

### 指数和对数

| 函数 | 说明 |
|------|------|
| \`math.exp(x)\` | e 的 x 次方 |
| \`math.log(x)\` | 自然对数 ln(x) |
| \`math.log(x, base)\` | 指定底数的对数 |
| \`math.log2(x)\` | 以2为底的对数 |
| \`math.log10(x)\` | 以10为底的对数 |

### 三角函数（弧度制！）

| 函数 | 说明 |
|------|------|
| \`math.sin(x)\` | 正弦 |
| \`math.cos(x)\` | 余弦 |
| \`math.tan(x)\` | 正切 |
| \`math.asin(x)\` | 反正弦 |
| \`math.degrees(x)\` | 弧度 → 角度 |
| \`math.radians(x)\` | 角度 → 弧度 |

### 注意事项

- 三角函数用的是**弧度**，不是角度！记得用 \`math.radians()\` 转换。
- \`math.pow()\` 返回浮点数，整数幂可以直接用 \`**\` 运算符。
- Python 3.8+ 用 \`math.isqrt()\` 求整数平方根，比 int(math.sqrt()) 更准确。
- \`math.sqrt(-1)\` 会报错，需要负数开方请用 \`cmath.sqrt(-1)\`。
`,
    code: `# ========== math 模块演示 ==========

import math

print("=" * 60)
print("📐 math 模块 - 数学函数")
print("=" * 60)

# 1. 数学常量
print("\\n=== 数学常量 ===")
print(f"  π (pi)  = {math.pi:.10f}")
print(f"  e       = {math.e:.10f}")
print(f"  τ (tau) = {math.tau:.10f}  (2π)")
print(f"  inf     = {math.inf}")
print(f"  nan     = {math.nan}")

# 2. 取整函数
print("\\n=== 取整函数 ===")
nums = [3.14, 3.99, -2.3, -2.7, 2.0]
print(f"  {'数字':>8s} {'ceil':>6s} {'floor':>6s} {'trunc':>6s}")
print(f"  {'─'*8} {'─'*6} {'─'*6} {'─'*6}")
for n in nums:
    print(f"  {n:>8.2f} {math.ceil(n):>6d} {math.floor(n):>6d} {math.trunc(n):>6d}")
print()
print("  ceil(3.14)=4    向上取整(天花板)")
print("  floor(3.99)=3   向下取整(地板)")
print("  trunc(-2.7)=-2  向0截断")
print("  floor(-2.7)=-3  地板(往更小的方向)")

# 3. 幂和根
print("\\n=== 幂和根 ===")
print(f"  math.pow(2, 10) = {math.pow(2, 10)} (2^10=1024)")
print(f"  2 ** 10         = {2 ** 10} (整数运算符，推荐用于整数幂)")
print(f"  math.sqrt(144)  = {math.sqrt(144)} (平方根)")
print(f"  math.sqrt(2)    = {math.sqrt(2):.10f} (√2)")
print(f"  math.isqrt(144) = {math.isqrt(144)} (整数平方根, Python3.8+)")
print(f"  math.isqrt(15)  = {math.isqrt(15)} (整数平方根，只取整数部分)")

# 4. 阶乘、GCD、LCM
print("\\n=== 阶乘 / GCD / LCM ===")
for n in range(1, 11):
    print(f"  {n}! = {math.factorial(n)}")
print()
print(f"  gcd(24, 36) = {math.gcd(24, 36)} (最大公约数)")
print(f"  lcm(12, 18) = {math.lcm(12, 18)} (最小公倍数, Python3.9+)")
print(f"  gcd(100, 75, 50) = {math.gcd(math.gcd(100, 75), 50)} (多参数用法)")

# 5. 绝对值和符号
print("\\n=== 绝对值/符号 ===")
print(f"  math.fabs(-5.6) = {math.fabs(-5.6)} (浮点数绝对值)")
print(f"  abs(-5)         = {abs(-5)} (内置函数，支持整数)")
print(f"  math.copysign(5, -1) = {math.copysign(5, -1)} (把-1的符号给5)")
print(f"  math.copysign(-3, 1) = {math.copysign(-3, 1)} (把1的符号给-3)")

# 6. 指数和对数
print("\\n=== 指数和对数 ===")
print(f"  math.exp(1) = {math.exp(1):.10f} (e^1 = e)")
print(f"  math.exp(2) = {math.exp(2):.6f} (e^2)")
print(f"  math.log(math.e) = {math.log(math.e)} (自然对数 ln(e)=1)")
print(f"  math.log(100, 10) = {math.log(100, 10)} (log10(100)=2)")
print(f"  math.log2(1024) = {math.log2(1024)} (以2为底)")
print(f"  math.log10(1000) = {math.log10(1000)} (以10为底)")

# 7. 三角函数（注意是弧度！）
print("\\n=== 三角函数（弧度制）===")
print(f"  math.sin(0)          = {math.sin(0)}")
print(f"  math.sin(math.pi/2)  = {math.sin(math.pi/2):.1f} (sin(90°)=1)")
print(f"  math.cos(0)          = {math.cos(0)}")
print(f"  math.cos(math.pi)    = {math.cos(math.pi):.1f} (cos(180°)=-1)")
print(f"  math.tan(math.pi/4)  = {math.tan(math.pi/4):.1f} (tan(45°)=1)")

# 角度弧度转换
print("\\n=== 角度 ↔ 弧度 转换 ===")
angles_deg = [0, 30, 45, 60, 90, 180, 360]
print(f"  {'角度':>6s} {'弧度':>10s} {'sin':>10s} {'cos':>10s}")
print(f"  {'─'*6} {'─'*10} {'─'*10} {'─'*10}")
for deg in angles_deg:
    rad = math.radians(deg)
    s = math.sin(rad)
    c = math.cos(rad)
    print(f"  {deg:>5d}° {rad:>10.6f} {s:>10.4f} {c:>10.4f}")

print()
print(f"  math.degrees(math.pi) = {math.degrees(math.pi):.0f}° (π弧度 = 180°)")
print(f"  math.radians(180)     = {math.radians(180):.6f} (180° = π弧度)")

# 8. 双曲函数
print("\\n=== 其他常用函数 ===")
print(f"  math.hypot(3, 4) = {math.hypot(3, 4)} (勾股定理 √(3²+4²)=5)")
print(f"  math.dist((0,0), (3,4)) = {math.dist((0,0), (3,4))} (两点距离)")

# 9. 判断函数
print("\\n=== 判断函数 ===")
print(f"  math.isfinite(100)   = {math.isfinite(100)}")
print(f"  math.isfinite(inf)   = {math.isfinite(math.inf)}")
print(f"  math.isinf(math.inf) = {math.isinf(math.inf)}")
print(f"  math.isnan(math.nan) = {math.isnan(math.nan)}")
print(f"  math.isclose(0.1+0.2, 0.3) = {math.isclose(0.1+0.2, 0.3)}")
print(f"  （0.1+0.2在浮点数中不精确等于0.3，用isclose判断近似相等）")

# 10. 实际应用：计算圆的面积和周长
print("\\n=== 应用实例: 圆的计算 ===")
radius = 5
area = math.pi * radius ** 2
circumference = 2 * math.pi * radius
print(f"  半径 = {radius}")
print(f"  面积 = π × r² = {area:.2f}")
print(f"  周长 = 2πr = {circumference:.2f}")
`,
  },
];
