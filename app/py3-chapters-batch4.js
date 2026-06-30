// =============================================================
// 第四批章节（工程化，4 章）
// 13. decorators          装饰器、参数化装饰器、functools.wraps
// 14. iterators           iter()、__iter__/__next__、itertools
// 15. stdlib              collections / itertools / functools / contextlib
// 16. tooling             pip / venv / pyproject / uv
// =============================================================

export const chapters = [
  {
    id: "py3-decorators",
    group: "工程化",
    icon: "🎁",
    title: "装饰器：函数装饰、参数化、类装饰",
    content: `
# 装饰器

- 本质：\`@decorator\` 等价于 \`fn = decorator(fn)\`
- 用 \`functools.wraps\` 保留原函数 \`__name__\` / \`__doc__\`
- **带参数装饰器**：三层嵌套（外层接收参数、中层接收函数、内层 wrapper）
- **类装饰器**：装饰类（修改 \`__init__\`，或加方法）
- **内置装饰器**：\`@staticmethod / @classmethod / @property / @functools.lru_cache\`
- 多个装饰器：自下而上应用
`,
    code: `import functools, time

# 1) 基础装饰器
def my_logger(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        print(f"[call] {fn.__name__}{args}")
        result = fn(*args, **kwargs)
        print(f"[ret ] {fn.__name__} -> {result}")
        return result
    return wrapper

@my_logger
def add(a, b):
    """add a and b"""
    return a + b

add(3, 5)
print("name:", add.__name__, "doc:", add.__doc__)

# 2) 参数化装饰器
def repeat(times):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = fn(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def greet(name):
    print(f"hi, {name}")

greet("alice")

# 3) 计时装饰器（实战）
def timer(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        t0 = time.perf_counter()
        result = fn(*args, **kwargs)
        print(f"[{fn.__name__}] cost {time.perf_counter() - t0:.6f}s")
        return result
    return wrapper

@timer
def slow():
    time.sleep(0.05)

slow()

# 4) lru_cache（最常用的内置装饰器）
@functools.lru_cache(maxsize=128)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print("fib(35):", fib(35))
print("cache info:", fib.cache_info())
`,
  },

  {
    id: "py3-iterators",
    group: "工程化",
    icon: "🔁",
    title: "迭代器：iter / next / 自定义 / itertools",
    content: `
# 迭代器

- 协议：对象实现 \`__iter__\` 返回 iterator，实现 \`__next__\` 返回下一值
- 内置可迭代：list / tuple / dict / set / str / range / 文件
- **iter(callable, sentinel)**：把单参数函数变成迭代器，到 sentinel 停止
- **itertools**：chain / cycle / islice / count / takewhile / groupby / product
- **生成器函数** 含 \`yield\`：自动实现迭代器协议
- **生成器表达式**：\`(x*x for x in range(n))\`，惰性
`,
    code: `import itertools

# 1) 自定义迭代器
class Countdown:
    def __init__(self, start):
        self.n = start
    def __iter__(self):
        return self
    def __next__(self):
        if self.n <= 0:
            raise StopIteration
        self.n -= 1
        return self.n + 1

for x in Countdown(5):
    print("cd:", x)

# 2) 生成器函数（yield）
def fib_gen(limit):
    a, b = 0, 1
    while a < limit:
        yield a
        a, b = b, a + b

print(list(fib_gen(50)))  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

# 3) yield from：委托子迭代器
def chain(*iters):
    for it in iters:
        yield from it

print(list(chain([1, 2], (3, 4), "ab")))  # [1, 2, 3, 4, 'a', 'b']

# 4) iter(callable, sentinel)
import random
rand_iter = iter(lambda: random.randint(1, 6), 6)  # 一直掷骰子直到掷出 6
print("rand before 6:", [next(rand_iter) for _ in range(20)])

# 5) itertools
print("chain:", list(itertools.chain([1, 2], [3, 4])))
print("islice:", list(itertools.islice(range(100), 5, 10)))
print("takewhile:", list(itertools.takewhile(lambda x: x < 5, [1, 3, 5, 1, 2])))
print("groupby:", [(k, list(g)) for k, g in itertools.groupby("AABCCDA")])
print("product:", list(itertools.product([1, 2], ["a", "b"])))
print("count:", list(itertools.islice(itertools.count(10, 2), 5)))  # [10, 12, 14, 16, 18]
`,
  },

  {
    id: "py3-stdlib",
    group: "工程化",
    icon: "📦",
    title: "常用标准库：collections / itertools / functools",
    content: `
# 标准库精选

- **collections**：Counter / defaultdict / OrderedDict / deque / namedtuple / ChainMap
- **itertools**：chain / islice / takewhile / dropwhile / groupby / product / permutations
- **functools**：reduce / lru_cache / partial / wraps / singledispatch
- **contextlib**：\`@contextmanager\` 把生成器变成上下文管理器
- **pathlib**：面向对象路径操作（详见 pathlib 章）
`,
    code: `import collections, functools, itertools
from contextlib import contextmanager

# 1) collections
c = collections.Counter("abracadabra")
print("Counter:", c, "most_common:", c.most_common(3))

dd = collections.defaultdict(list)
dd["fruits"].append("apple")
dd["fruits"].append("banana")
print("defaultdict:", dict(dd))

d = collections.deque([1, 2, 3])
d.appendleft(0)
d.append(4)
print("deque:", d, "rotate:", d.rotate(1))

Point = collections.namedtuple("Point", "x y")
print(Point(1, 2), Point(1, 2).x)

# 2) functools
nums = [1, 2, 3, 4, 5]
print("reduce sum:", functools.reduce(lambda a, b: a + b, nums))
print("reduce max:", functools.reduce(lambda a, b: a if a > b else b, nums))

# partial：固定部分参数
import datetime
now = datetime.datetime.now()
log = functools.partial(print, "[LOG]", sep=" ")
log(now)

# 3) itertools 组合
print("permutations:", list(itertools.permutations([1, 2, 3], 2)))
print("combinations:", list(itertools.combinations([1, 2, 3, 4], 2)))
print("accumulate (cumsum):", list(itertools.accumulate([1, 2, 3, 4, 5])))

# 4) contextlib：把生成器函数变成 with 上下文
@contextmanager
def timer(label):
    t0 = time.perf_counter() if (time := __import__("time")) else 0
    print(f"[{label}] start")
    yield
    print(f"[{label}] cost {__import__('time').perf_counter() - t0:.4f}s")

import time as _t
@contextmanager
def timer2(label):
    t0 = _t.perf_counter()
    print(f"[{label}] start")
    yield
    print(f"[{label}] cost {_t.perf_counter() - t0:.4f}s")

with timer2("block"):
    _t.sleep(0.05)
`,
  },

  {
    id: "py3-tooling",
    group: "工程化",
    icon: "🛠️",
    title: "工程工具：pip / venv / pyproject / uv",
    content: `
# Python 工程工具

- **pip**：标准包管理器，\`pip install / uninstall / freeze / list\`
- **venv**：标准虚拟环境（\`python3 -m venv .venv\`）
- **pyproject.toml**（PEP 621）：现代项目元数据/依赖配置（取代 setup.py）
- **uv**（Astral）：Rust 写的极速 pip + venv 替代，\`uv add / uv run / uv lock\`
- **build / twine**：打包与发布到 PyPI
- **ruff**：超快的 linter + formatter（替代 flake8 + black + isort）
- **mypy / pyright**：静态类型检查
`,
    code: `# 这个 demo 用代码展示"工具"概念：纯 Python 模拟 venv / 包管理器的目录结构
import os, sys, subprocess, tempfile, textwrap, json

# 1) 展示当前 Python 和 pip 版本
print("Python:", sys.version.split()[0])
try:
    out = subprocess.run([sys.executable, "-m", "pip", "--version"], capture_output=True, text=True, check=True)
    print("pip:", out.stdout.strip())
except Exception as e:
    print("pip: 未安装", e)

# 2) 在临时目录模拟一个标准 venv 目录结构（不实际创建）
with tempfile.TemporaryDirectory() as tmp:
    venv = os.path.join(tmp, ".venv")
    os.makedirs(os.path.join(venv, "lib", "site-packages"), exist_ok=True)
    pyvenv_cfg = os.path.join(venv, "pyvenv.cfg")
    with open(pyvenv_cfg, "w") as f:
        f.write(textwrap.dedent("""
            home = /usr/local/bin
            include-system-site-packages = false
            version = 3.12.4
        """).strip())
    print("venv 目录结构:", sorted(os.listdir(venv)))
    with open(pyvenv_cfg) as f:
        print("pyvenv.cfg:", f.read().splitlines()[0], "...")

# 3) pyproject.toml 样例（以 dict 形式展示）
pyproject = {
    "project": {
        "name": "myapp",
        "version": "0.1.0",
        "requires-python": ">=3.12",
        "dependencies": ["fastapi>=0.110", "pydantic>=2.6"],
        "scripts": {"myapp": "myapp.cli:main"},
    },
    "build-system": {"build-backend": "hatchling.build"},
}
print("pyproject.toml:", json.dumps(pyproject, indent=2, ensure_ascii=False))

# 4) uv 的常用命令（注释形式）
print(textwrap.dedent("""
    uv 常用命令:
      uv init myapp            # 初始化项目
      uv add fastapi           # 加依赖
      uv add --dev pytest      # 加开发依赖
      uv run pytest            # 在虚拟环境里跑
      uv lock                  # 生成 uv.lock
      uv pip install -r requirements.txt  # 兼容 pip
""").strip())
`,
  },
];
