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
- \`import module\` / \`import module as alias\` / \`from module import name\`
- \`from module import *\` 导入所有（受 \`__all__\` 控制）
- \`if __name__ == "__main__":\` 区分脚本运行 vs 被导入
- \`sys.path\` 是模块搜索路径列表
- \`importlib\` 可动态导入模块
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
- \`os\`：操作系统接口（路径、环境变量、进程）
- \`sys\`：解释器信息（argv、path、version、exit）
- \`platform\`：平台信息；\`datetime\`：日期时间
- \`random\`：随机数；\`math\`：数学函数
- \`json\`：JSON 序列化；\`collections\`：Counter/defaultdict/deque
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
- \`pip install <pkg>\` 安装包；\`pip install -r requirements.txt\` 批量安装
- **venv 虚拟环境**：\`python3.13 -m venv .venv\` 隔离项目依赖
- \`requirements.txt\` 格式：\`pkg==version\` 一行一个
- \`pyproject.toml\`（PEP 518）是现代 Python 项目配置文件
- 激活 venv：\`source .venv/bin/activate\`（macOS/Linux）
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
- **包** = 含 \`__init__.py\` 的目录（Python 3.3+ 支持命名空间包可不加）
- \`__init__.py\` 在包被导入时执行，可放初始化代码和 \`__all__\`
- \`from . import x\` 相对导入（同包内）；\`from .. import y\` 上级包
- \`__all__ = ["name1", "name2"]\` 控制 \`from pkg import *\` 的行为
- 示例：用 \`tempfile\` 在 /tmp 下创建临时包演示
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
