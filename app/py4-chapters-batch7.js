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
## 一、什么是 import？模块到底是什么？

在 Python 中，**一个 .py 文件就是一个模块（module）**，文件名（去掉 .py）就是模块名。例如 \`utils.py\` 就是一个叫 \`utils\` 的模块，里面定义的函数、类、变量都可以被其他代码通过 \`import\` 拿来复用。

\`import\` 的本质是：**把另一个 .py 文件里的代码"加载进来"，让当前文件能使用它定义的名字**。

### import 的执行机制（重点理解）

1. 当 Python 第一次执行 \`import os\` 时，会做以下事情：
   - 在模块搜索路径（\`sys.path\`）中查找 \`os.py\`（或对应的已编译文件 \`os.pyc\`）。
   - **执行该模块文件顶层代码一次**（注意：只执行一次！）。
   - 把模块对象存入全局字典 \`sys.modules\` 作为**缓存**。
2. 之后任何地方再 \`import os\`，Python 不会重新执行文件，而是直接从 \`sys.modules\` 拿到已缓存的模块对象。
3. 这就是为什么：**模块里的顶层代码（如打印、赋值）在整个程序运行期间只会执行一次**。

\`\`\`python
import sys
import os       # 第一次：执行 os.py，缓存到 sys.modules
import os       # 第二次：直接取缓存，不重新执行
print("os" in sys.modules)  # True，证明 os 已被缓存
\`\`\`

> 设计原理：缓存机制避免了重复加载与重复执行带来的副作用和性能损耗，也保证模块里的"单例初始化"逻辑只发生一次。

---

## 二、import 的三种基本形式

### 形式 1：\`import 模块名\`

\`\`\`python
import os
print(os.getcwd())   # 必须带模块名前缀 os.
\`\`\`

- 优点：**名字空间清晰**，一眼能看出 \`getcwd\` 来自 \`os\`。
- 缺点：每次调用都要写前缀，略啰嗦。

### 形式 2：\`from 模块 import 名字\`

\`\`\`python
from os import getcwd
print(getcwd())      # 直接用，不用前缀
\`\`\`

- 优点：调用简洁。
- 缺点：如果从多个模块都 \`from x import foo\`，容易造成**同名覆盖**，且看不出 \`foo\` 来源。

也可以一次导入多个名字：

\`\`\`python
from os import getcwd, listdir, path
\`\`\`

### 形式 3：\`import 模块 as 别名\`

\`\`\`python
import numpy as np
import pandas as pd
\`\`\`

- 用 \`as\` 给模块起个短别名，是社区惯例（\`np\` / \`pd\` / \`plt\`）。
- 等价于：\`import numpy\` 之后 \`np = numpy\`，但更规范。

> 同样 \`from os import getcwd as cwd\` 也可以给函数起别名。

---

## 三、为什么不推荐 \`from x import *\`

\`\`\`python
from os import *      # 把 os 里所有公开名字一股脑塞进当前命名空间
getcwd()              # 看起来"方便"，但隐患巨大
\`\`\`

不推荐的原因：

| 问题 | 说明 |
|------|------|
| **命名污染** | 把模块里几十个名字全部倒进当前文件，很容易和你自己的变量重名覆盖 |
| **IDE 无法提示来源** | 编辑器看不出某个名字来自哪个模块，跳转/补全变得困难 |
| **可读性差** | 别人读你的代码时，不知道 \`getcwd\` 是哪里来的 |
| **可能覆盖内置** | 某些模块导出的名字会盖掉 Python 内置函数 |

**正确做法**：需要短就 \`import os as o\` 或 \`from os import getcwd\`，明确点名。

---

## 四、\`__name__\` 与 \`if __name__ == "__main__"\`

每个模块都有一个内置属性 \`__name__\`，它的值由**运行方式**决定：

| 运行方式 | \`__name__\` 的值 |
|----------|-------------------|
| 直接运行：\`python foo.py\` | \`"__main__"\` |
| 被导入：\`import foo\` | \`"foo"\`（模块名） |

### 这有什么用？

一个 .py 文件通常既是"工具库"（被别人 import），又可能想"自己跑一下做测试"。但如果你在文件顶层写了 \`print(...)\` 或测试代码，被别人 import 时这些代码也会执行，造成**副作用污染**。

\`if __name__ == "__main__":\` 就是用来**保护副作用代码**的：

\`\`\`python
# utils.py
def add(a, b):
    return a + b

# 这段只在直接运行 utils.py 时执行；被 import 时不会跑
if __name__ == "__main__":
    print("自测：", add(1, 2))
\`\`\`

- 直接 \`python utils.py\`：\`__name__\` 是 \`"__main__"\`，进入 if，打印测试。
- 别人 \`import utils\`：\`__name__\` 是 \`"utils"\`，跳过 if，不会打印。

> 这是 Python 工程的**标准写法**：每个可复用模块都应把"演示/自测/入口逻辑"放进 \`if __name__ == "__main__":\`，让文件既能独立运行又能被安全导入。

---

## 五、模块搜索路径 sys.path

\`import\` 去**哪里**找模块？由 \`sys.path\` 决定，它是一个列表，按顺序查找：

\`\`\`python
import sys
print(sys.path)
\`\`\`

典型内容（从前到后）：

1. **当前脚本所在目录**（最优先，所以自己写的 .py 文件能直接被同目录代码 import）。
2. **环境变量 \`PYTHONPATH\` 中的目录**。
3. **Python 安装目录及标准库目录**。
4. **第三方包目录**（site-packages，pip 装的库都在这）。

注意点：

- 如果你自己写了一个 \`os.py\` 放在当前目录，\`import os\` 可能会优先加载你的而不是标准库，造成诡异 bug——**别用标准库名字命名自己的文件**。
- 想让自定义模块被找到，要么放同目录，要么加进 \`sys.path\`，要么打包安装到 site-packages。

---

## 六、易错点小结

| 易错点 | 正确理解 |
|--------|----------|
| 以为 \`import\` 多次会执行多次 | 模块只执行一次，后续 import 取缓存 |
| \`from os import *\` 图省事 | 命名污染、IDE 难提示，禁用 |
| 忘记写 \`if __name__ == "__main__":\` | 被 import 时副作用代码也会跑 |
| 用 \`os.py\` / \`random.py\` 当文件名 | 会覆盖标准库，import 出错 |
| 以为 \`as\` 改变了模块本身 | 只是给当前作用域起个别名引用 |
| 找不到模块 \`ModuleNotFoundError\` | 检查 sys.path、文件位置、是否装了对应包 |

---

## 七、本节代码逐行讲解

\`\`\`python
import sys, os                       # 一次导入多个标准库模块
from datetime import datetime, timedelta  # 从 datetime 模块精确导入两个类
from collections import Counter as Cnt     # 导入并起别名 Cnt

# 通过 sys 看解释器信息
print("Python:", sys.version.split()[0])  # sys.version 是字符串，split 后取主版本号
print("平台:", sys.platform)              # 'darwin' = macOS, 'win32' = Windows
print("CWD:", os.getcwd())                # 当前工作目录
print("参数:", sys.argv[0])               # 启动脚本名，argv[1:] 才是用户传的参数

# 用别名调用 Counter
c = Cnt("abracadabra")                    # 统计每个字符出现次数
print("Counter:", c, c.most_common(2))    # most_common(2) 取出现最多的 2 个

# 关键：__name__ 演示
print("当前 __name__:", __name__)         # 直接运行显示 __main__，被导入显示模块名

# 运行条件保护：让"入口逻辑"只在直接运行时跑
if __name__ == "__main__":
    print("作为主模块运行")
else:
    print("作为模块被导入")
\`\`\`
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
## 一、Python 的「内置电池」哲学

Python 有一句著名口号：**"Batteries Included"（开箱即用、内置电池）**。

意思是：Python 自带了一个**非常丰富的标准库（Standard Library）**，覆盖操作系统、文件、网络、日期、数学、并发、加密等几乎所有常见领域。你装好 Python 后，**不需要再 pip install 任何东西**，就能用 \`os\`、\`sys\`、\`datetime\`、\`json\`、\`urllib\`、\`re\`、\`collections\` 等几百个模块。

> 为什么先学标准库？因为：
> 1. **避免重复造轮子**——你想做的，标准库大概率已经做好且经过充分测试。
> 2. **零依赖**——只用标准库写的代码，在任何装了 Python 的机器上都能跑。
> 3. **第三方库也是站在标准库肩膀上**——理解了标准库，看第三方库源码会轻松很多。

下面逐个介绍最常用的几个标准库模块。

---

## 二、os —— 操作系统接口

\`os\` 提供**与操作系统交互**的能力：文件路径、环境变量、进程、权限等。

\`\`\`python
import os

# 当前工作目录
print(os.getcwd())              # 当前在哪个目录运行

# 环境变量
print(os.environ.get("HOME"))   # 读环境变量 HOME（macOS/Linux 用户目录）
os.environ["MY_VAR"] = "123"    # 设置环境变量（仅当前进程有效）

# 路径操作（更推荐用 os.path 或 pathlib）
print(os.path.join("a", "b", "c"))   # 拼接路径：a/b/c
print(os.path.exists("/tmp"))        # 判断路径是否存在

# 执行外部命令（少用，推荐 subprocess）
# os.system("echo hello")
\`\`\`

| 常用 API | 作用 |
|----------|------|
| \`os.getcwd()\` | 获取当前工作目录 |
| \`os.environ\` | 环境变量字典 |
| \`os.path.join / split / exists\` | 路径拼接/分割/判断 |
| \`os.listdir(path)\` | 列出目录下文件 |
| \`os.system(cmd)\` | 执行 shell 命令（不推荐，用 subprocess） |

---

## 三、sys —— 解释器相关

\`sys\` 提供与 **Python 解释器本身**交互的能力：版本、命令行参数、模块搜索路径等。

\`\`\`python
import sys

print(sys.version)         # Python 版本完整字符串
print(sys.platform)        # 'darwin' / 'win32' / 'linux'
print(sys.argv)            # 命令行参数列表，argv[0] 是脚本名
print(sys.path)            # 模块搜索路径
print(sys.prefix)          # Python 安装前缀（虚拟环境识别）
\`\`\`

| 常用 API | 作用 |
|----------|------|
| \`sys.argv\` | 命令行参数，写 CLI 脚本时必用 |
| \`sys.path\` | 模块搜索路径列表，可动态添加 |
| \`sys.exit(code)\` | 退出程序 |
| \`sys.stdin/stdout/stderr\` | 标准输入/输出/错误流 |

> os 与 sys 区别：\`os\` 面向**操作系统**（文件/进程/环境），\`sys\` 面向 **Python 解释器**（版本/参数/路径）。

---

## 四、datetime —— 日期时间处理

\`\`\`python
from datetime import datetime, timedelta, date

now = datetime.now()                       # 当前日期时间
today = date.today()                       # 仅日期
print(now.isoformat(timespec="seconds"))   # ISO 8601 格式：2024-01-01T12:00:00

# 时间差：timedelta
future = now + timedelta(days=7)           # 7 天后
past = now - timedelta(hours=3)            # 3 小时前
print(future - now)                        # 7 days, 0:00:00
\`\`\`

| 类 | 用途 |
|----|------|
| \`datetime\` | 日期+时间 |
| \`date\` | 仅日期 |
| \`timedelta\` | 两个时间点的差，可加减 |
| \`isoformat()\` | 输出 ISO 8601 字符串，跨系统交换推荐 |

> 为什么用 \`isoformat\`？因为它格式统一、可排序、可被 JSON/databases 直接识别。

---

## 五、collections —— 容器扩展

\`collections\` 提供了几种**比 dict/list 更顺手的容器**：

### 5.1 Counter —— 计数器

\`\`\`python
from collections import Counter
c = Counter("abracadabra")
print(c)                  # Counter({'a': 5, 'b': 2, 'r': 2, 'c': 1, 'd': 1})
print(c.most_common(2))   # [('a', 5), ('b', 2)]  取最多的 2 个
\`\`\`

### 5.2 defaultdict —— 带默认值的 dict

\`\`\`python
from collections import defaultdict
d = defaultdict(list)     # 访问不存在的 key 时自动创建空 list
d["fruits"].append("apple")
d["fruits"].append("banana")
# 不需要先 if "fruits" in d: ...
\`\`\`

### 5.3 deque —— 双端队列

\`\`\`python
from collections import deque
q = deque([1, 2, 3])
q.appendleft(0)    # 左侧入队 O(1)
q.append(4)        # 右侧入队 O(1)
print(q)           # deque([0, 1, 2, 3, 4])
q.popleft()        # 左侧出队 O(1)（list.pop(0) 是 O(n)）
\`\`\`

### 5.4 OrderedDict（了解）

3.7 以后普通 dict **已经保持插入顺序**，所以 OrderedDict 用得少了，但它的 \`move_to_end\` / \`popitem(last=)\` 仍偶尔有用。

| 容器 | 替代什么 | 优势 |
|------|----------|------|
| \`Counter\` | dict 手动计数 | 一行搞定计数+排序 |
| \`defaultdict\` | dict + if 判断 | 自动初始化默认值 |
| \`deque\` | list 当队列 | 头部增删 O(1) |
| \`OrderedDict\` | dict | 显式有序（历史遗留场景） |

---

## 六、random —— 随机数

\`\`\`python
import random

print(random.randint(1, 100))              # 1~100 整数（含两端）
print(random.choice(["a", "b", "c"]))      # 随机选一个
print(random.random())                     # 0~1 浮点

random.seed(42)                            # 固定随机种子 → 可复现
print(random.random())                     # 每次运行结果相同
\`\`\`

> \`seed\` 的意义：让"随机"变成"可复现"。在机器学习、测试、调试时**必须固定种子**，否则结果不可比。

⚠️ \`random\` **不能用于安全场景**（密码、token），请用 \`secrets\` 模块。

---

## 七、math —— 数学函数

\`\`\`python
import math
print(math.pi)            # 3.141592653589793
print(math.sqrt(2))       # 1.4142...
print(math.factorial(5))  # 120
print(math.log(100, 10))  # 以 10 为底的对数
\`\`\`

- \`math\` 处理的是**标量**（单个数）。
- 要处理数组/矩阵请用第三方库 \`numpy\`。

---

## 八、itertools —— 迭代器工具

\`itertools\` 提供**高效、惰性**的迭代器组合，是函数式编程的好帮手：

\`\`\`python
import itertools

# 笛卡尔积
for combo in itertools.product("AB", "12"):
    print(combo)   # ('A','1') ('A','2') ('B','1') ('B','2')

# 排列 / 组合
print(list(itertools.permutations("ABC", 2)))   # 排列
print(list(itertools.combinations("ABC", 2)))   # 组合

# 链接多个迭代器
print(list(itertools.chain([1,2], [3,4])))      # [1, 2, 3, 4]
\`\`\`

特点：**惰性求值**，不一次性生成所有结果，节省内存，适合大数据流。

---

## 九、易错点小结

| 易错点 | 正确做法 |
|--------|----------|
| 用 \`random\` 生成密码 | 改用 \`secrets\` |
| \`list.pop(0)\` 当队列 | 改用 \`collections.deque\` |
| 手写字符计数循环 | 直接 \`Counter(s)\` |
| \`dict[key]\` 不存在报 KeyError | 用 \`defaultdict\` 或 \`dict.get(key, 默认)\` |
| 自己拼时间字符串 | 用 \`datetime.isoformat()\` |
| 重复造轮子 | 先查标准库有没有现成的 |

---

## 十、本节代码逐行讲解

\`\`\`python
import os, sys, random, math
from datetime import datetime, timedelta, date
from collections import Counter, defaultdict, deque

# os / sys
print("HOME:", os.environ.get("HOME"))     # 读环境变量，不存在返回 None
print("PATH:", sys.path[:2])               # 模块搜索路径前 2 项

# datetime
now = datetime.now()                       # 当前时间
print("now:", now)
print("+7d:", now + timedelta(days=7))     # 加 7 天
print("iso:", now.isoformat(timespec="seconds"))  # ISO 格式，精确到秒
print("today:", date.today())              # 仅日期

# collections
c = Counter("abracadabra")                 # 字符计数
print("counter:", c, c.most_common(2))     # 取最多的 2 项

dd = defaultdict(list)                     # 默认值为空 list
dd["fruits"].append("apple")               # key 不存在自动创建
print("defaultdict:", dict(dd))            # 转回普通 dict 打印

d = deque([1, 2, 3])
d.appendleft(0); d.append(4)               # 双端 O(1) 增删
print("deque:", d)

# random
print("random:", random.randint(1, 100), random.choice(["a","b","c"]))
random.seed(42); print("seeded:", random.random())  # 固定种子，结果可复现

# math
print("pi:", math.pi, "sqrt:", math.sqrt(2), "fact:", math.factorial(5))
\`\`\`
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
## 一、pip 是什么？

**pip 是 Python 的官方包管理器**，用来从 [PyPI（Python Package Index）](https://pypi.org) 安装、升级、卸载第三方库。

- PyPI 是 Python 的"应用商店"，上面有几十万个开源包（requests、numpy、django、flask……）。
- pip 随 Python 一起安装，开箱即用，无需额外配置。
- 推荐用 \`python3 -m pip ...\` 而不是直接 \`pip ...\`，确保用的是当前 Python 对应的 pip。

\`\`\`bash
# 推荐：明确指定 Python 解释器
python3 -m pip install requests
python3 -m pip --version
\`\`\`

---

## 二、pip 常用命令

| 命令 | 作用 |
|------|------|
| \`pip install xxx\` | 安装包（最新版） |
| \`pip install xxx==1.2.3\` | 安装指定版本 |
| \`pip install --upgrade xxx\` | 升级包 |
| \`pip uninstall xxx\` | 卸载包 |
| \`pip list\` | 列出已安装的包 |
| \`pip show xxx\` | 查看某包详细信息 |
| \`pip freeze\` | 以 \`name==version\` 格式输出已装包（用于生成依赖文件） |
| \`pip install -r requirements.txt\` | 批量安装依赖 |

\`\`\`bash
pip install requests pandas          # 一次装多个
pip install "django>=4.0,<5.0"      # 指定版本范围
pip list                            # 看看装了啥
\`\`\`

---

## 三、requirements.txt —— 锁定依赖、可复现环境

**为什么需要它？** 你的项目用了 requests 2.31、pandas 2.0……换台机器或同事接手时，必须装**完全相同的版本**，否则可能出 bug。\`requirements.txt\` 就是这份"清单"。

\`\`\`bash
# 1. 把当前环境的所有包及版本导出到文件
pip freeze > requirements.txt

# 2. 别人/别机拿到这个文件，一键复现
pip install -r requirements.txt
\`\`\`

文件内容长这样：

\`\`\`
requests==2.31.0
pandas==2.0.3
numpy==1.24.3
\`\`\`

> 进阶：大型项目用 [\`pip-tools\`](https://github.com/jazzband/pip-tools) 或 [\`poetry\`](https://python-poetry.org) / [\`uv\`](https://github.com/astral-sh/uv) 来管理依赖更专业（区分直接依赖与传递依赖）。

---

## 四、虚拟环境 venv —— 为什么必须有？

### 痛点：全局污染

假设项目 A 依赖 \`django==3.2\`，项目 B 依赖 \`django==4.2\`。如果你都装到系统 Python 里，**只能存在一个版本**，必然冲突。

### 解决：虚拟环境

\`venv\` 是 Python 自带的工具，能为**每个项目**创建一个独立的 Python 环境，拥有自己的 site-packages，互不干扰。

\`\`\`bash
# 1. 创建虚拟环境（在项目目录下生成 .venv 文件夹）
python3 -m venv .venv

# 2. 激活（macOS / Linux）
source .venv/bin/activate

# 2. 激活（Windows PowerShell）
.venv\\Scripts\\Activate.ps1

# 3. 激活后命令行前会出现 (.venv) 标识，此时 pip 装的包都进 .venv
pip install requests

# 4. 退出虚拟环境
deactivate
\`\`\`

激活后：

- \`python\` / \`pip\` 都指向 \`.venv\` 里的副本。
- 装的包只影响当前项目，**不会污染系统 Python**。
- 不同项目用不同 venv，版本互不冲突。

### 为什么不用系统 Python？

| 问题 | 说明 |
|------|------|
| **权限** | 系统目录可能要 sudo，容易出错 |
| **冲突** | 多项目共用一个环境，版本打架 |
| **不可控** | 系统升级可能改 Python 版本，项目突然跑不了 |
| **难复现** | 别人不知道你装了哪些包哪些版本 |

> 经验法则：**每个 Python 项目都应有一个独立的 venv**，并在 .gitignore 里忽略 \`.venv/\`。

---

## 五、uv —— 更快的现代替代

[\`uv\`](https://github.com/astral-sh/uv) 是 Astral 公司（ruff 作者）用 Rust 写的新一代 Python 包管理器，2024 年起迅速流行：

- 速度比 pip 快 **10~100 倍**。
- 一个工具整合了 pip + venv + pip-tools + poetry 的能力。
- 兼容 pip 命令，迁移成本低。

\`\`\`bash
# 安装
curl -LsSf https://astral.sh/uv/install.sh | sh

# 创建项目并管理依赖
uv init myproject
cd myproject
uv add requests pandas        # 自动创建 .venv 并安装
uv add --dev pytest           # 开发依赖
uv run python main.py         # 在虚拟环境里运行
\`\`\`

> 新项目推荐直接用 uv；老项目兼容用 pip + venv 也没问题。

---

## 六、pip vs npm 对比（给前端同学）

| 维度 | Python pip | Node npm |
|------|-----------|----------|
| 包仓库 | PyPI | npm registry |
| 安装命令 | \`pip install xxx\` | \`npm install xxx\` |
| 依赖清单 | \`requirements.txt\` | \`package.json\` |
| 锁文件 | 无（freeze 代替） | \`package-lock.json\` |
| 局部安装 | venv（手动创建） | \`node_modules\`（自动） |
| 全局安装 | 不推荐 | \`npm -g\` |
| 速度 | 较慢（uv 解决） | 较快 |

关键差异：**npm 默认就把包装进项目本地 \`node_modules\`，而 pip 默认装全局**——所以 Python 才需要 venv 来"局部化"。

---

## 七、易错点小结

| 易错点 | 正确做法 |
|--------|----------|
| 直接 \`pip install\` 装到系统 Python | 先 \`python3 -m venv .venv\` 再 activate |
| 忘记激活 venv 就装包 | 命令行前要有 \`(.venv)\` 标识 |
| 把 \`.venv/\` 提交到 git | 加入 \`.gitignore\` |
| 只提交代码不提交 requirements.txt | 必须提交，否则别人无法复现 |
| 用 \`pip\` 而非 \`python3 -m pip\` | 可能用到别的 Python 的 pip |
| 装包不带版本号 | 生产环境应锁定版本（==） |

---

## 八、本节代码逐行讲解

\`\`\`python
import sys, subprocess, os

# 显示当前 Python 和 pip 版本
print("Python:", sys.version.split()[0])
try:
    out = subprocess.run(
        [sys.executable, "-m", "pip", "--version"],   # 用当前 Python 调 pip
        capture_output=True, text=True, check=True
    )
    print("pip:", out.stdout.strip())
except Exception as e:
    print("pip 未安装:", e)

# 显示已安装的包（前 5 个）
try:
    out = subprocess.run(
        [sys.executable, "-m", "pip", "freeze"],      # 等价于 pip freeze
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
print("\\n是否在虚拟环境:", sys.prefix != sys.base_prefix)  # 激活后两者不同
print("site-packages:", sys.prefix)
\`\`\`

> \`sys.prefix != sys.base_prefix\` 是检测"是否处于虚拟环境"的常用技巧：在 venv 里 \`sys.prefix\` 指向 \`.venv\`，而 \`sys.base_prefix\` 指向系统 Python。
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
## 一、什么是「包」？

**模块（module）** 是单个 .py 文件；**包（package）** 则是**包含多个模块的目录**，让一堆相关模块能按目录组织起来。

判断一个目录是不是包的标志：**目录下有 \`__init__.py\` 文件**（哪怕是个空文件）。

\`\`\`
mypkg/
├── __init__.py      ← 这个文件让 mypkg 成为"包"
├── utils.py
└── sub/
    ├── __init__.py  ← sub 也是包（mypkg 的子包）
    └── helper.py
\`\`\`

> Python 3.3+ 引入了**命名空间包（namespace package）**，允许目录没有 \`__init__.py\` 也被当成包，主要用于跨多个目录合并的大型项目。日常工程仍推荐写 \`__init__.py\`，明确、兼容性好。

---

## 二、\`__init__.py\` 的三大作用

### 作用 1：标记目录为包

只要存在 \`__init__.py\`（哪怕空），Python 就把这个目录当成一个包，里面的 .py 文件能用 \`from mypkg.xxx import ...\` 导入。

### 作用 2：包初始化代码

\`__init__.py\` 在**包第一次被导入时执行一次**，常用来：

- 初始化包级变量（如 \`version = "0.1.0"\`）。
- 预加载子模块。
- 配置日志、读取配置。

### 作用 3：暴露公共 API + 控制 \`__all__\`

\`\`\`python
# mypkg/__init__.py
from .utils import hello        # 把子模块的函数"提升"到包层级
from .config import load_config

version = "0.1.0"

__all__ = ["hello", "version", "load_config"]   # 控制 from mypkg import * 的导出
\`\`\`

这样使用者只需：

\`\`\`python
from mypkg import hello, version   # 不用写 from mypkg.utils import hello
\`\`\`

> 这是包设计的**惯用法**：内部模块叫 \`utils\`/\`core\`/\`_internal\`，但通过 \`__init__.py\` 把对外 API 暴露在包顶层，使用方代码简洁、不受内部重构影响。

### \`__all__\` 是什么？

\`__all__\` 是一个**字符串列表**，决定 \`from pkg import *\` 时导出哪些名字：

- 不写 \`__all__\`：默认导出所有不以下划线开头的名字。
- 写了 \`__all__\`：**只导出列表里的名字**，更精确。

\`\`\`python
__all__ = ["hello", "version"]   # 只暴露这两个，其余即使是 public 名字也不导出
\`\`\`

---

## 三、绝对导入（推荐）

**绝对导入**：从顶层包名开始，写完整路径。

\`\`\`python
from mypkg.utils import hello
from mypkg.sub.helper import greet
import mypkg.config as cfg
\`\`\`

优点：

- **路径清晰**，一眼看出名字来自哪里。
- IDE 跳转、补全友好。
- 不受当前文件位置影响，重构时不易出错。

> 工程实践：**优先用绝对导入**，只有包内深层模块互相引用、路径太长时才考虑相对导入。

---

## 四、相对导入

**相对导入**：用 \`.\` 表示当前包，\`..\` 表示上一级包，仅在**包内部模块**之间使用。

\`\`\`python
# 文件位置：mypkg/sub/helper.py
from . import sibling        # . = 当前包 mypkg.sub，导入 mypkg/sub/sibling.py
from .. import utils         # .. = 上一级包 mypkg，导入 mypkg/utils.py
from ..config import load    # ..config = mypkg.config
\`\`\`

| 写法 | 含义 |
|------|------|
| \`from . import xxx\` | 当前包（同级目录）的 xxx |
| \`from .. import xxx\` | 上一级包的 xxx |
| \`from ... import xxx\` | 上上一级包（很少用，过深说明结构有问题） |

### 相对导入的"坑"：只能在包内用

相对导入**依赖"当前模块属于哪个包"这个信息**。如果你**直接运行**一个包内模块（\`python mypkg/sub/helper.py\`），它的 \`__package__\` 是 None，相对导入会直接报错：

\`\`\`
ImportError: attempted relative import with no known parent package
\`\`\`

解决方案：

1. **不要直接运行包内模块**——包是给人 import 的，不是给人直接跑的。
2. 在包外写一个入口脚本（如 \`main.py\`），用 \`from mypkg.sub.helper import ...\` 调用。
3. 用 \`python -m mypkg.sub.helper\` 方式运行（带 \`-m\` 让 Python 知道模块所属包）。

> 易错点小结：相对导入报错，99% 是因为"直接 \`python xxx.py\` 跑了包内文件"。记住——**包内模块通过 import 使用，不直接 run**。

---

## 五、绝对导入 vs 相对导入对比

| 维度 | 绝对导入 | 相对导入 |
|------|----------|----------|
| 写法 | \`from mypkg.sub import fn\` | \`from .sub import fn\` / \`from .. import fn\` |
| 清晰度 | 高（一眼看全路径） | 中（要看文件位置才能理解） |
| 重命名包 | 需改所有 import | 不用改（相对路径不变） |
| IDE 支持 | 好 | 一般 |
| 适用 | 跨包引用、入口脚本 | 包内部模块互相引用 |
| 直接运行该文件 | 可以 | 报错 |

---

## 六、典型项目结构

\`\`\`
myproject/
├── README.md
├── requirements.txt
├── main.py                   ← 入口脚本（用绝对导入 from mypkg import ...）
├── mypkg/                    ← 主包
│   ├── __init__.py           ← 暴露公共 API + 定义 __all__
│   ├── config.py
│   ├── utils.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── model.py          ← 内部模块可用相对导入
│   │   └── service.py
│   └── api/
│       ├── __init__.py
│       └── routes.py
└── tests/
    ├── __init__.py
    └── test_utils.py
\`\`\`

设计原则：

- 入口脚本（\`main.py\`）放包外，用绝对导入。
- 包内模块之间可用相对导入，避免包名硬编码。
- 通过 \`__init__.py\` 暴露简洁的对外 API，隐藏内部实现细节。

---

## 七、易错点小结

| 易错点 | 正确做法 |
|--------|----------|
| 目录没有 \`__init__.py\` 导致 import 失败 | 创建空 \`__init__.py\`（除非用命名空间包） |
| 直接 \`python mypkg/sub/helper.py\` 跑包内文件 | 改用 \`python -m mypkg.sub.helper\` 或写包外入口 |
| 相对导入报 "no known parent package" | 同上：包内文件不要直接 run |
| 在主模块用 \`from . import xxx\` | 主模块没有 \`__package__\`，不能用相对导入 |
| 滥用 \`from pkg import *\` | 用 \`__all__\` 控制导出，或显式点名 |
| 包名和标准库 / 第三方库重名 | 起独特的名字，避免覆盖 |

---

## 八、本节代码逐行讲解

\`\`\`python
import os, tempfile, textwrap

# 用临时目录演示"动态创建一个包并导入"
with tempfile.TemporaryDirectory() as tmp:
    pkg = os.path.join(tmp, "mypkg")
    os.makedirs(os.path.join(pkg, "sub"))      # 建 mypkg/sub 目录

    # 1) mypkg/__init__.py：暴露公共 API + 定义 __all__
    with open(os.path.join(pkg, "__init__.py"), "w") as f:
        f.write('__all__ = ["hello", "version"]\\n')   # 控制 from mypkg import * 的导出
        f.write('from .utils import hello\\n')         # 相对导入：把 utils.hello 提到包顶层
        f.write('version = "0.1.0"\\n')                # 包级变量

    # 2) mypkg/utils.py：实际实现
    with open(os.path.join(pkg, "utils.py"), "w") as f:
        f.write('def hello(): return "hello from mypkg"\\n')

    # 3) mypkg/sub/__init__.py：子包也用相对导入暴露 greet
    with open(os.path.join(pkg, "sub", "__init__.py"), "w") as f:
        f.write('from .helper import greet\\n')        # .helper = mypkg.sub.helper

    # 4) mypkg/sub/helper.py：子包里的实现
    with open(os.path.join(pkg, "sub", "helper.py"), "w") as f:
        f.write('def greet(name): return f"hi, {name}"\\n')

    # 把临时目录加入 sys.path，让 Python 能找到 mypkg
    sys.path.insert(0, tmp)
    import mypkg                          # 触发 mypkg/__init__.py 执行
    from mypkg.sub import greet           # 绝对导入：从 mypkg.sub 拿 greet

    print("mypkg.version:", mypkg.version)     # 包级变量
    print("mypkg.hello():", mypkg.hello())     # 通过 __init__.py 暴露的函数
    print("greet:", greet("alice"))            # 子包导出的函数

    sys.path.pop(0)                       # 清理：移除临时路径

# 展示典型包目录结构
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
\`\`\`

> 这段代码"程序化"地造出了一个完整的包结构，然后立刻 import 它——直观演示了 \`__init__.py\`、相对导入、绝对导入、\`__all__\` 的协作方式。真实项目里这些文件是你手写在磁盘上的，机制完全一致。
`,
    code: `import os, sys, tempfile, textwrap

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