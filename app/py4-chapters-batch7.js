// =============================================================
// Batch 7：模块与包（4 章）
// 25. py4-import       import、from、as、__name__
// 26. py4-stdlib      常用标准库速览：os/sys/datetime/collections
// 27. py4-pip           pip、venv、第三方包安装
// 28. py4-package      包结构、__init__.py、相对导入
// =============================================================

export const chapters = [
  {
    id: "py4-import",
    group: "模块与包",
    icon: "📥",
    title: "import：导入模块与函数",
    content: `
- 导入模块：\`import os\` → \`os.getcwd()\`
- 导入特定函数：\`from os import getcwd\` → \`getcwd()\`
- 别名：\`import numpy as np\`
- 导入全部（不推荐）：\`from os import *\`
- \`__name__\`：直接运行是 \`"__main__"\`，被导入是模块名
- \`if __name__ == "__main__":\` 保护代码只在直接运行时执行
`,
    code: `import sys, os
from datetime import datetime, timedelta
from collections import Counter as Cnt

# 导入系统信息
print("Python:", sys.version.split()[0])
print("平台:", sys.platform)
print("CWD:", os.getcwd())
print("参数:", sys.argv[0])

# 别名使用
c = Cnt("abracadabra")
print("Counter:", c, c.most_common(2))

# __name__ 演示
print("当前 __name__:", __name__)

# 运行条件保护
if __name__ == "__main__":
    print("作为主模块运行")
else:
    print("作为模块被导入")
`,
  },
  {
    id: "py4-stdlib",
    group: "模块与包",
    icon: "📚",
    title: "标准库速览：os/sys/datetime/collections",
    content: `
- **os**：操作系统接口（路径、环境变量、进程）
- **sys**：解释器相关（版本、参数、路径）
- **datetime**：日期时间处理
- **collections**：Counter、defaultdict、deque、OrderedDict 等
- **random**：随机数生成
- **math**：数学函数
- **itertools**：迭代器工具
`,
    code: `import os, sys, random, math
from datetime import datetime, timedelta, date
from collections import Counter, defaultdict, deque

# os / sys
print("HOME:", os.environ.get("HOME"))
print("PATH:", sys.path[:2])

# datetime
now = datetime.now()
print("now:", now)
print("+7d:", now + timedelta(days=7))
print("iso:", now.isoformat(timespec="seconds"))
print("today:", date.today())

# collections
c = Counter("abracadabra")
print("counter:", c, c.most_common(2))

dd = defaultdict(list)
dd["fruits"].append("apple")
print("defaultdict:", dict(dd))

d = deque([1, 2, 3])
d.appendleft(0); d.append(4)
print("deque:", d)

# random
print("random:", random.randint(1, 100), random.choice(["a","b","c"]))
random.seed(42); print("seeded:", random.random())

# math
print("pi:", math.pi, "sqrt:", math.sqrt(2), "fact:", math.factorial(5))
`,
  },
  {
    id: "py4-pip",
    group: "模块与包",
    icon: "📦",
    title: "pip 与虚拟环境：安装第三方包",
    content: `
- \`pip install xxx\` 安装包
- \`pip freeze\` 列出已安装
- \`pip install -r requirements.txt\` 批量安装
- 虚拟环境（venv）：隔离项目依赖
- 创建：\`python3 -m venv .venv\`
- 激活：\`source .venv/bin/activate\`
- 退出：\`deactivate\`
- 推荐 \`uv\`（更快）：\`uv add xxx\`
`,
    code: `import sys, subprocess, os

# 显示当前 Python 和 pip 版本
print("Python:", sys.version.split()[0])
try:
    out = subprocess.run(
        [sys.executable, "-m", "pip", "--version"],
        capture_output=True, text=True, check=True
    )
    print("pip:", out.stdout.strip())
except Exception as e:
    print("pip 未安装:", e)

# 显示已安装的包（前 5 个）
try:
    out = subprocess.run(
        [sys.executable, "-m", "pip", "freeze"],
        capture_output=True, text=True, check=True
    )
    for line in out.stdout.strip().splitlines()[:5]:
        print("  installed:", line)
except Exception:
    print("could not list packages")

# 模拟 venv 目录结构
print("\\nvenv 常用命令:")
print("  python3 -m venv .venv          # 创建")
print("  source .venv/bin/activate      # 激活")
print("  pip install requests pandas    # 安装")
print("  pip freeze > requirements.txt  # 导出")
print("  deactivate                     # 退出")

# 显示当前是否在虚拟环境中
print("\\n是否在虚拟环境:", sys.prefix != sys.base_prefix)
print("site-packages:", sys.prefix)
`,
  },
  {
    id: "py4-package",
    group: "模块与包",
    icon: "📁",
    title: "包结构：__init__.py、相对导入",
    content: `
- 包 = 含 \`__init__.py\` 的目录
- \`__init__.py\`：包的初始化文件，可为空
- 绝对导入：\`from mypkg.sub import fn\`
- 相对导入：\`from . import sibling\` / \`from ..parent import fn\`
- 相对导入只在包内可用（不能在主模块用）
- \`__all__\`：控制 \`from pkg import *\` 导出的内容
`,
    code: `import os, tempfile, textwrap

# 模拟包结构
with tempfile.TemporaryDirectory() as tmp:
    pkg = os.path.join(tmp, "mypkg")
    os.makedirs(os.path.join(pkg, "sub"))
    
    # __init__.py
    with open(os.path.join(pkg, "__init__.py"), "w") as f:
        f.write('__all__ = ["hello", "version"]\\n')
        f.write('from .utils import hello\\n')
        f.write('version = "0.1.0"\\n')
    
    # utils.py
    with open(os.path.join(pkg, "utils.py"), "w") as f:
        f.write('def hello(): return "hello from mypkg"\\n')
    
    # sub/__init__.py  
    with open(os.path.join(pkg, "sub", "__init__.py"), "w") as f:
        f.write('from .helper import greet\\n')
    
    # sub/helper.py
    with open(os.path.join(pkg, "sub", "helper.py"), "w") as f:
        f.write('def greet(name): return f"hi, {name}"\\n')
    
    # 把包目录加入 sys.path 来导入
    sys.path.insert(0, tmp)
    import mypkg
    from mypkg.sub import greet
    
    print("mypkg.version:", mypkg.version)
    print("mypkg.hello():", mypkg.hello())
    print("greet:", greet("alice"))
    
    sys.path.pop(0)

# 包目录结构展示
print("\\n典型包结构:")
print(textwrap.dedent("""
    mypkg/
    ├── __init__.py          # 包初始化，可定义 __all__
    ├── utils.py             # 普通模块
    ├── constants.py         # 常量
    └── sub/
        ├── __init__.py
        └── helper.py
"""))
`,
  },
];