// =============================================================
// Batch 7：模块与包（4 章）
// 9.  py5-import   import/as/from、__main__、sys.path、importlib
// 10. py5-stdlib   标准库速览：os/sys/platform/datetime/random/math/json/collections
// 11. py5-pip      pip、venv、requirements.txt、pyproject.toml
// 12. py5-package  包结构、__init__.py、相对导入、__all__
// =============================================================

export const chapters = [
  {
    id: "py5-import",
    group: "模块与包",
    icon: "📥",
    title: "import 机制",
    content: `
## 概述
Python 的 import 机制是模块化编程的核心，涉及模块查找路径、命名空间绑定与动态加载等多个层面。掌握 import 的各种形式和底层机制，是编写可维护、可复用代码的基础。

## 核心要点
- **基础导入**: \`import mod\` / \`import mod as alias\` / \`from mod import name\` - 三种形式对应不同的命名空间绑定方式
- **from import**: \`from os.path import join, exists\` - 直接将名字导入当前作用域，省略模块前缀
- **通配符导入**: \`from mod import *\` - 受 \`__all__\` 控制；未定义 \`__all__\` 时导入所有非下划线开头的名字
- **__name__ 判断**: \`if __name__ == "__main__":\` - 区分直接运行与被导入，便于复用与测试
- **sys.path**: 模块搜索路径列表，首项通常是脚本所在目录（或空字符串代表当前目录）
- **importlib.import_module**: \`importlib.import_module("json")\` - 运行时按字符串动态加载模块
- **dir()**: \`dir(mod)\` - 查看模块导出的所有名字
- **importlib.util**: \`spec_from_file_location\` 可从任意路径加载 .py 文件为模块

## 原理与机制
- **查找器+加载器**: import 系统基于 sys.meta_path 中的查找器（如 PathFinder），先找 spec 再由加载器执行模块代码
- **sys.path 顺序**: 脚本目录 → PYTHONPATH → 标准库 → site-packages，自定义模块可能遮蔽标准库
- **模块缓存**: 已导入模块存于 \`sys.modules\` 字典，重复 import 不会重新执行，仅绑定已有对象
- **PEP 328**: 提倡绝对导入（\`from pkg.mod import x\`）优先于 \`import mod\`；相对导入仅用于包内部
- **__pycache__**: 首次导入编译为 .pyc 缓存加速后续加载；源码修改后自动失效重建

## 易错点与陷阱
- **循环导入**: A 导入 B、B 又导入 A 会触发 ImportError；可重构为延迟导入或将公共部分抽到第三方模块
- **遮蔽标准库**: 在当前目录创建 \`os.py\`、\`sys.py\` 等同名文件，会覆盖标准库导致诡异错误
- **import * 命名污染**: 不易追踪来源、IDE 难以静态分析；生产代码应避免使用
- **from x import y 是引用快照**: y 是导入时绑定的对象，源模块重新赋值后不会同步更新

## 实战建议
- **建议**: 优先使用 \`import mod as alias\` 或 \`from mod import specific_name\`，避免 import *
- **建议**: 入口文件统一用 \`if __name__ == "__main__":\` 包裹主流程，便于被其他脚本复用
- **建议**: 调试导入问题时优先 \`print(sys.path)\` 与 \`print(sys.modules.keys())\` 排查路径与缓存
`,
    code: `import sys
import math as m
from datetime import datetime as dt
from os.path import join, exists

# 各种 import 方式
print("pi:", m.pi)
print("now:", dt.now().strftime("%H:%M:%S"))
print("join('/tmp','a'):", join("/tmp", "a"))
print("exists('/tmp'):", exists("/tmp"))

# __name__ 的值
print("__name__:", __name__)
print("当直接运行脚本时 __name__ == '__main__'")

# sys.path：模块搜索路径（前5个）
print("sys.path 前3:")
for p in sys.path[:3]:
    print(" ", p if p else "(当前目录)")

# importlib 动态导入
import importlib
json_mod = importlib.import_module("json")
data = json_mod.loads('[1, 2, 3]')
print("importlib 动态导入 json:", data)

# dir() 查看模块内容
print("json 模块导出数:", len([x for x in dir(json_mod) if not x.startswith("_")]))
`,
  },
  {
    id: "py5-stdlib",
    group: "模块与包",
    icon: "📚",
    title: "标准库速览",
    content: `
## 概述
Python 标准库涵盖操作系统、解释器、日期时间、随机数、数学、序列化、容器扩展等核心领域，是日常开发无需安装即可使用的基础工具集。Python 3.13 进一步优化了多个标准库模块的性能与一致性。

## 核心要点
- **os**: \`os.getcwd()\` / \`os.environ\` / \`os.path.join\` - 路径、环境变量、进程相关操作
- **sys**: \`sys.argv\` / \`sys.path\` / \`sys.version\` / \`sys.exit()\` - 解释器运行时信息
- **platform**: \`platform.platform()\` - 跨平台系统识别（macOS/Windows/Linux）
- **datetime**: \`datetime.now()\` / \`timedelta(days=1)\` - 日期时间运算与格式化
- **random**: \`random.randint(a,b)\` / \`random.choice(seq)\` - 伪随机数；可用 \`random.seed(42)\` 固定种子
- **math**: \`math.sqrt\` / \`math.pi\` / \`math.sin\` - 数学函数与常量
- **json**: \`json.dumps(obj)\` / \`json.loads(s)\` - JSON 序列化反序列化；\`ensure_ascii=False\` 保留中文
- **collections**: \`Counter\` 计数、\`defaultdict\` 默认值字典、\`deque\` 双端队列

## 原理与机制
- **os vs sys**: os 面向操作系统抽象（跨平台一致），sys 面向解释器自身（CPython 实现细节）
- **datetime 不可变**: datetime/timedelta 都是不可变对象，运算返回新对象，类似数值类型
- **random 是伪随机**: 默认 Mersenne Twister 算法，不适合安全场景；密钥学场景应使用 \`secrets\` 模块
- **json 类型映射**: dict↔object、list↔array、str↔string、int/float↔number、True/False↔bool、None↔null
- **collections 扩展内置容器**: 在 dict/list 基础上提供更高效的变体，多数为 C 实现

## 易错点与陷阱
- **datetime 不可变**: \`dt.year = 2025\` 会报错，必须用 \`dt.replace(year=2025)\` 或运算生成新对象
- **json.dumps 中文转义**: 默认 \`ensure_ascii=True\` 会输出 \\uXXXX，处理中文时应显式设为 False
- **random 跨进程同种子**: 多进程同时使用相同 seed 可能产生相同序列，导致 bug 或安全问题
- **os.path vs pathlib**: 旧代码多用 os.path.join，新代码推荐 pathlib.Path 的运算符 / 写法更直观

## 实战建议
- **建议**: 处理日期优先 datetime + timedelta，避免手写月份天数逻辑
- **建议**: 计数场景直接用 Counter，比手写 dict 累加更简洁且高效
- **建议**: 处理 JSON 时统一 \`ensure_ascii=False, indent=2\`，输出可读且中文不丢失
`,
    code: `import os, sys, platform, math, random, json
from datetime import datetime, timedelta
from collections import Counter, defaultdict, deque

# os / sys / platform
print("cwd:", os.getcwd())
print("python:", sys.version.split()[0])
print("platform:", platform.platform()[:50])

# datetime
now = datetime.now()
print("now:", now.strftime("%Y-%m-%d"))
print("tomorrow:", (now + timedelta(days=1)).strftime("%Y-%m-%d"))

# random
random.seed(42)
print("random int:", random.randint(1, 100))
print("random choice:", random.choice(["apple", "banana", "cherry"]))

# math
print(f"sqrt(2)={math.sqrt(2):.4f}, sin(pi/2)={math.sin(math.pi/2)}")

# json
data = {"name": "小明", "scores": [90, 85, 92], "active": True}
s = json.dumps(data, ensure_ascii=False, indent=2)
print("json dumps 首行:", s.split("\\n")[0])
print("json loads name:", json.loads(s)["name"])

# collections
words = "apple banana apple cherry banana apple".split()
print("Counter:", Counter(words))
dd = defaultdict(list)
dd["fruits"].append("apple")
print("defaultdict:", dict(dd))
dq = deque([1, 2, 3])
dq.appendleft(0)
dq.append(4)
print("deque:", list(dq))
`,
  },
  {
    id: "py5-pip",
    group: "模块与包",
    icon: "📦",
    title: "pip 与包管理",
    content: `
## 概述
pip 是 Python 官方包管理工具，配合 venv 虚拟环境隔离依赖、requirements.txt 锁定版本、pyproject.toml 标准化项目元数据，构成现代 Python 项目工程化的基础设施。Python 3.13 默认集成 pip 与 venv，无需额外安装。

## 核心要点
- **pip install**: \`pip install requests\` 安装最新版；\`pip install requests==2.32.3\` 指定版本；\`pip install -U pkg\` 升级
- **批量安装**: \`pip install -r requirements.txt\` 按 requirements 文件批量安装依赖
- **venv 创建**: \`python3.13 -m venv .venv\` 创建虚拟环境，目录通常加入 .gitignore
- **venv 激活**: macOS/Linux 用 \`source .venv/bin/activate\`，Windows 用 \`.venv\\Scripts\\activate\`
- **requirements.txt**: 格式 \`pkg==2.32.3\` 精确版本；\`>=\` / \`~=\` / \`<\` 表达版本范围
- **pyproject.toml**: PEP 518/621 标准化项目配置，包含 build-system、project、tool 等节
- **pip freeze**: \`pip freeze > requirements.txt\` 导出当前环境所有包及精确版本
- **pyproject optional-dependencies**: \`[project.optional-dependencies]\` 定义 dev/test 等可选依赖组

## 原理与机制
- **venv 隔离原理**: 复制 python 解释器入口 + 独立 site-packages 目录 + 修改 sys.prefix，实现项目级依赖隔离
- **pyproject.toml 三大节**: \`[build-system]\` 定义构建后端、\`[project]\` 定义项目元数据、\`[tool.*]\` 给工具配置
- **PEP 517/518**: 解耦构建工具与项目，构建后端（hatchling、setuptools、flit 等）由 pyproject.toml 声明
- **pip 缓存**: 默认缓存在 ~/Library/Caches/pip（macOS），可 \`pip cache purge\` 清理
- **pip 包来源**: PyPI（默认）、Git 仓库 (\`git+https://...\`)、本地路径 (\`./myapp\`)、压缩包 URL

## 易错点与陷阱
- **全局安装污染**: 不用 venv 直接 \`pip install\` 会污染系统 Python，可能损坏 macOS 系统工具
- **requirements.txt vs pyproject.toml**: 前者记录已安装环境、后者声明项目依赖；现代项目优先 pyproject.toml
- **版本锁定不全**: requirements.txt 不锁传递依赖，可重复性差；生产建议用 pip-compile 生成 lockfile
- **activate 后仍可访问全局**: venv 默认 \`--system-site-packages=False\`，但需注意 PATH 顺序

## 实战建议
- **建议**: 每个项目创建独立 .venv，并将 .venv/ 加入 .gitignore
- **建议**: 项目用 pyproject.toml 声明依赖，应用 \`pip install -e .\` 以可编辑模式安装自身
- **建议**: 生产部署用 lockfile（pip-tools / uv lock）锁全部传递依赖，保证可重复构建
`,
    code: `import sys
import subprocess

# 打印 pyproject.toml 示例结构
pyproject_example = '''[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "myapp"
version = "0.1.0"
description = "一个示例 Python 项目"
requires-python = ">=3.13"
dependencies = [
    "requests>=2.31",
    "rich>=13.0",
]

[project.optional-dependencies]
dev = ["pytest>=8.0", "ruff>=0.4"]

[tool.ruff]
line-length = 100
'''
print("=== pyproject.toml 示例 ===")
for line in pyproject_example.strip().split("\\n"):
    print(line)

# requirements.txt 示例
print("\\n=== requirements.txt 示例 ===")
print("requests==2.32.3")
print("rich==13.7.1")
print("pytest>=8.0  # dev dependency")
print("# 使用 pip install -r requirements.txt 安装")

# venv 基本用法
print("\\n=== venv 命令 ===")
print("创建: python3.13 -m venv .venv")
print("激活: source .venv/bin/activate  # macOS/Linux")
print("退出: deactivate")
print("当前 pip 路径:", sys.executable)

# pip 基本命令
print("\\n=== pip 常用命令 ===")
print("pip install requests        安装")
print("pip install requests==2.32  指定版本")
print("pip install -U pip          升级 pip")
print("pip list                    列出已安装包")
print("pip freeze                  导出 requirements")
`,
  },
  {
    id: "py5-package",
    group: "模块与包",
    icon: "📁",
    title: "包结构与导入",
    content: `
## 概述
Python 包是含模块的目录，通过 \`__init__.py\` 标识并执行初始化逻辑。Python 3.3+ 引入命名空间包，3.13 进一步完善 PEP 328 的相对导入规则。理解包结构、\`__all__\` 与相对导入机制，是组织大型项目的关键。

## 核心要点
- **包定义**: 含 \`__init__.py\` 的目录即为常规包；导入时执行 \`__init__.py\` 中的代码
- **__init__.py 作用**: 暴露包级 API、定义 \`__version__\` / \`__all__\`、执行初始化逻辑
- **__all__**: \`__all__ = ["greet", "Calculator"]\` 控制 \`from pkg import *\` 导入哪些名字
- **绝对导入**: \`from mypkg.core import greet\` - 显式包路径，可读性强，推荐写法
- **相对导入**: \`from . import x\`（同级）/ \`from .. import y\`（上级）- 仅在包内部使用
- **命名空间包**: 多个目录共同构成一个包，无需 \`__init__.py\`，PEP 420 引入
- **子包**: \`mypkg.sub.utils\` 通过点号路径访问嵌套目录结构
- **__main__.py**: 包目录下放 \`__main__.py\` 可让 \`python -m mypkg\` 直接运行整个包

## 原理与机制
- **PEP 328**: 推崇绝对导入为默认行为；相对导入必须用 \`from .\` 显式声明，避免歧义
- **__init__.py 执行时机**: 首次 import 包时执行一次（受 sys.modules 缓存控制），可放耗时初始化
- **__all__ 仅约束 import ***: 对 \`from pkg import specific\` 无效；不影响显式子模块访问
- **命名空间包机制**: sys.path 中多个目录的相同包名会被合并为一个虚拟包，常用于大型项目拆分
- **__path__ 属性**: 包的 \`__path__\` 是列表，决定子模块查找范围；命名空间包可包含多个路径

## 易错点与陷阱
- **相对导入只能在包内**: 直接运行包内模块（\`python mypkg/core.py\`）会触发 attempted relative import 错误，应改用 \`python -m mypkg.core\`
- **__init__.py 留空 vs 有内容**: 留空可作占位；包含逻辑时注意避免循环导入和耗时操作
- **__all__ 拼写错误**: 名字与实际子模块不符时不会报错，但 \`from pkg import *\` 会静默丢失名字
- **包名与内置冲突**: 避免命名 \`email\`、\`xml\`、\`json\` 等标准库同名，否则无法导入标准库

## 实战建议
- **建议**: 包级 API 在 \`__init__.py\` 中通过 \`from .core import X\` 显式 re-export，对外屏蔽内部结构
- **建议**: 始终定义 \`__all__\`，让 \`from pkg import *\` 行为可预测，也方便静态分析工具识别公开 API
- **建议**: 想运行包内某模块时用 \`python -m pkg.mod\` 而非直接 \`python pkg/mod.py\`，避免相对导入失败
`,
    code: `import sys
import tempfile
import os

with tempfile.TemporaryDirectory() as tmpdir:
    pkg_dir = os.path.join(tmpdir, "mypkg")
    sub_dir = os.path.join(pkg_dir, "sub")
    os.makedirs(sub_dir)

    # mypkg/__init__.py
    with open(os.path.join(pkg_dir, "__init__.py"), "w") as f:
        f.write('''__version__ = "1.0.0"
__all__ = ["greet", "Calculator"]
from .core import greet, Calculator
''')

    # mypkg/core.py
    with open(os.path.join(pkg_dir, "core.py"), "w") as f:
        f.write('''def greet(name):
    return f"Hello, {name}!"
class Calculator:
    def add(self, a, b):
        return a + b
    def sub(self, a, b):
        return a - b
''')

    # mypkg/sub/__init__.py
    with open(os.path.join(sub_dir, "__init__.py"), "w") as f:
        f.write('''from .utils import double
__all__ = ["double"]
''')

    # mypkg/sub/utils.py
    with open(os.path.join(sub_dir, "utils.py"), "w") as f:
        f.write('''from ..core import Calculator
def double(x):
    calc = Calculator()
    return calc.add(x, x)
''')

    # 临时目录加入 sys.path
    sys.path.insert(0, tmpdir)

    import mypkg
    from mypkg import greet, Calculator
    from mypkg.sub import double

    print("mypkg version:", mypkg.__version__)
    print("greet:", greet("Python"))
    calc = Calculator()
    print("calc.add(3, 4):", calc.add(3, 4))
    print("double(5) via relative import:", double(5))
    print("__all__:", mypkg.__all__)

    sys.path.remove(tmpdir)
print("临时包目录已自动清理")
`,
  },
];
