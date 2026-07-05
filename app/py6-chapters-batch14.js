export const chapters = [
  {
    id: "py6-mypy",
    group: "工程实战补充",
    icon: "🔍",
    title: "mypy 静态类型检查",
    content: `## mypy 静态类型检查

### 一、为什么需要类型检查

Python 是动态类型语言，变量类型在运行时确定。这带来了灵活性，但也埋下了隐患：

- 函数参数类型错误只能在运行时暴露
- 重构时缺少类型信息，IDE 跳转与补全受限
- 大型团队协作时，接口契约模糊

mypy 是 Python 生态最成熟的静态类型检查器，由 Python 之父 Guido 参与设计，遵循 PEP 484 类型提示规范。它在**编译期**（不执行代码）分析类型注解，提前发现潜在 Bug。

### 二、类型提示回顾

Python 3.5+ 引入类型提示语法：

\`\`\`python
def greet(name: str, times: int = 1) -> str:
    return (", " + name) * times

age: int = 18
names: list[str] = ["Alice", "Bob"]
config: dict[str, int] = {"timeout": 30}
\`\`\`

类型提示**不影响运行时行为**，但可被 mypy、IDE、文档工具读取。

### 三、安装与基本用法

\`\`\`bash
pip install mypy
mypy script.py
mypy src/            # 检查整个目录
mypy --strict app.py # 严格模式
\`\`\`

### 四、配置文件

推荐使用 \`pyproject.toml\`：

\`\`\`toml
[tool.mypy]
python_version = "3.12"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
ignore_missing_imports = true
exclude = ["tests/legacy/"]

[[tool.mypy.overrides]]
module = "my_package.legacy.*"
ignore_errors = true
\`\`\`

### 五、常见错误类型

| 错误码 | 含义 | 示例 |
|--------|------|------|
| assignment | 赋值类型不匹配 | \`x: int = "str"\` |
| arg-type | 参数类型错误 | 传 int 给期望 str 的形参 |
| return-type | 返回类型不符 | 函数声明返回 int 实际返回 None |
| attr-defined | 属性未定义 | \`obj.no_such_attr\` |
| name-defined | 名称未定义 | 变量未导入就使用 |
| index | 索引类型错误 | 用字符串索引 list |

### 六、高级类型

\`\`\`python
from typing import Optional, Union, List, Dict, Tuple, Callable, Any

# Optional: 可能为 None
def find_user(uid: int) -> Optional[dict]:
    return None if uid < 0 else {"id": uid}

# Union: 多种类型之一
def parse(value: Union[int, str]) -> int:
    return int(value)

# Python 3.10+ 可用 | 简写
def parse2(value: int | str) -> int:
    return int(value)

# Callable: 可调用对象
Handler = Callable[[str, int], bool]

# Any: 任意类型（慎用，等于绕过检查）
def legacy(data: Any) -> Any: ...
\`\`\`

### 七、泛型 TypeVar

\`\`\`python
from typing import TypeVar, Generic

T = TypeVar("T")

def first(items: list[T]) -> T:
    return items[0]

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []
    def push(self, item: T) -> None:
        self._items.append(item)
    def pop(self) -> T:
        return self._items.pop()
\`\`\`

TypeVar 让函数/类保持类型一致性：\`first([1,2,3])\` 返回 \`int\`，\`first(["a"])\` 返回 \`str\`。

### 八、TypeAlias 与 NewType

\`\`\`python
from typing import TypeAlias, NewType

# TypeAlias: 给类型起别名
UserId: TypeAlias = int
Config: TypeAlias = dict[str, list[int]]

# NewType: 创建语义不同的新类型（运行时仍是原类型）
Meter = NewType("Meter", float)
Second = NewType("Second", float)

def speed(d: Meter, t: Second) -> float:
    return d / t

speed(Meter(100.0), Second(9.0))   # 正确
speed(Second(9.0), Meter(100.0))   # mypy 报错：参数顺序错误
\`\`\`

### 九、overload 函数重载

Python 函数参数没有真正的重载，但 \`@overload\` 可以为 mypy 提供多个签名：

\`\`\`python
from typing import overload

@overload
def process(data: int) -> int: ...
@overload
def process(data: str) -> str: ...
def process(data):
    # 实际实现
    return data

process(1)     # mypy 推断返回 int
process("hi")  # mypy 推断返回 str
\`\`\`

### 十、业务场景

- **大型项目**：跨模块调用频繁，类型契约降低沟通成本
- **库/SDK 开发**：类型注解即文档，IDE 自动补全体验
- **微服务接口**：DTO 用 dataclass + 类型注解，配合 mypy 校验

> 💡 **避坑提示**：mypy 默认不会检查未注解的函数。开启 \`disallow_untyped_defs = true\` 才能强制全量注解。渐进式引入时，可先用 \`--ignore-missing-imports\` 跳过第三方库。

### 十一、渐进式类型化策略

1. **第一步**：只在新代码和公共 API 上加注解
2. **第二步**：用 \`# type: ignore\` 临时压制历史代码
3. **第三步**：逐步为老模块补注解，移除 ignore
4. **第四步**：开启 \`--strict\` 全量严格检查

### 十二、原理深入

mypy 本质是一个**类型推断 + 类型检查**的静态分析器：
- 它解析 AST，收集每个变量的声明类型
- 沿控制流（if/for/while）传播类型信息
- 对每次赋值、调用、返回做子类型判断
- 支持 narrowing：\`if isinstance(x, int):\` 后 x 类型收窄为 int

### 十三、最佳实践总结

- 优先用 \`pyproject.toml\` 统一配置，避免命令行参数散落
- 公共函数必须注解，私有函数可依赖推断
- 慎用 \`Any\`，必要时用 \`object\` 替代
- 配合 pre-commit 在提交前自动检查
- 与 ruff 配合：ruff 负责风格，mypy 负责类型`,
    code: `# mypy 概念演示：用 Python 模拟类型检查的核心逻辑
# 不依赖 mypy，仅演示类型检查器如何发现错误

print("=== mypy 静态类型检查概念演示 ===\\n")

print("--- 1. 模拟类型注解与检查 ---")

# 模拟一份"带类型注解"的函数定义
# 每个函数记录：参数类型、返回类型
typed_functions = {
    "greet": {"params": {"name": "str"}, "return": "str"},
    "add": {"params": {"a": "int", "b": "int"}, "return": "int"},
    "find": {"params": {"uid": "int"}, "return": "Optional[dict]"},
}

# 模拟调用点：函数名 -> 传入参数类型列表
call_sites = [
    ("greet", {"name": "str"}),       # 正确
    ("greet", {"name": "int"}),       # 错误：参数类型不符
    ("add", {"a": "int", "b": "str"}),# 错误：b 应为 int
    ("find", {"uid": "int"}),         # 正确
    ("find", {"uid": "str"}),         # 错误：uid 应为 int
]

print("已注册函数签名：")
for fn, sig in typed_functions.items():
    print(f"  {fn}({sig['params']}) -> {sig['return']}")

print("\\n--- 2. 模拟 mypy 检查过程 ---")

def check_call(fn_name, args, signatures):
    """模拟 mypy 的参数类型检查"""
    if fn_name not in signatures:
        return f"[name-defined] 函数 '{fn_name}' 未定义"
    sig = signatures[fn_name]
    errors = []
    for param, expected in sig["params"].items():
        actual = args.get(param)
        if actual is None:
            errors.append(f"[arg-type] 缺少参数 '{param}'")
        elif actual != expected:
            errors.append(
                f"[arg-type] 参数 '{param}' 期望 {expected}, 实际 {actual}"
            )
    return errors

total_errors = 0
for fn, args in call_sites:
    result = check_call(fn, args, typed_functions)
    if isinstance(result, list) and result:
        for err in result:
            print(f"  错误: 调用 {fn}() -> {err}")
            total_errors += 1
    else:
        print(f"  通过: 调用 {fn}({args})")

print(f"\\n共发现 {total_errors} 个类型错误")

print("\\n--- 3. 演示 Optional 与 None 安全 ---")

# Optional[int] 等价于 int | None
# mypy 会强制你处理 None 的情况
def safe_divide(a: int, b: int):
    """返回 Optional[float]，调用方必须处理 None"""
    if b == 0:
        return None
    return a / b

result = safe_divide(10, 0)
# 模拟 mypy 的 None 检查：访问 result 前必须判断
if result is not None:
    print(f"  结果: {result:.2f}")
else:
    print("  结果: 除零错误，已安全处理")

print("\\n--- 4. 演示 TypeVar 泛型保持类型一致 ---")

# 模拟泛型函数：first(item) 返回类型必须与输入一致
def first(items):
    """泛型函数 [T] -> T"""
    return items[0] if items else None

samples = [
    ([1, 2, 3], "list[int]"),
    (["a", "b"], "list[str]"),
    ([True, False], "list[bool]"),
]
for data, label in samples:
    val = first(data)
    print(f"  first({label}) -> {type(val).__name__} = {val!r}")

print("\\n--- 5. 演示 NewType 防止参数混淆 ---")

# NewType 在运行时是原类型，但 mypy 视为不同类型
UserId = int   # 模拟 NewType("UserId", int)
OrderId = int  # 模拟 NewType("OrderId", int)

def get_user(uid):
    # 模拟：mypy 会拒绝传入 OrderId
    return f"User#{uid}"

print("  UserId 和 OrderId 运行时都是 int")
print("  但 mypy 会区分，防止 get_user(order_id) 这类错误")
print(f"  get_user(UserId(1001)) = {get_user(1001)}")

print("\\n--- 6. 渐进式类型化建议 ---")
tips = [
    "新代码必加注解，老代码逐步补",
    "公共 API（导出函数）必须注解",
    "用 # type: ignore[错误码] 精确压制",
    "开启 disallow_untyped_defs 强制全量注解",
    "配合 pre-commit 在提交前自动检查",
]
for i, tip in enumerate(tips, 1):
    print(f"  {i}. {tip}")

print("\\n=== mypy 演示结束 ===")`
  },
  {
    id: "py6-black",
    group: "工程实战补充",
    icon: "⚫",
    title: "black 代码格式化",
    content: `## black 代码格式化

### 一、black 的哲学

black 的口号是 **"The Uncompromising Code Formatter"**（不妥协的代码格式化器）。它的核心理念是：

- **零配置**：开箱即用，几乎不提供选项
- **不可争论**：风格由 black 决定，团队无需 Code Review 争论空格、引号
- **确定性**：相同输入永远产生相同输出

> 💡 **避坑提示**：black 会重写你的代码格式，初次使用建议先 commit 一次再格式化，便于回滚和 review。

### 二、安装与使用

\`\`\`bash
pip install black
black file.py            # 格式化单个文件
black src/               # 格式化目录
black --check .          # 只检查不修改（CI 用）
black --diff file.py     # 显示将要做的修改
black -l 100 file.py     # 指定行长度
\`\`\`

### 三、行长度

默认 88 字符。这是 black 经过经验取舍的值：
- 太短：表达式频繁换行，可读性下降
- 太长：需要左右滚动，分屏困难

可通过 \`-l\` 或配置修改，但官方建议保留默认。

### 四、关键格式化规则

#### 1. 字符串引号

black 统一使用**双引号** \`"\`，除非字符串内含双引号：

\`\`\`python
# 格式化前
name = 'Alice'
msg = "He said 'hi'"

# 格式化后
name = "Alice"
msg = 'He said "hi"'   # 简化转义
\`\`\`

#### 2. 行尾逗号

**集合字面量**（多行）会自动添加行尾逗号，便于 diff：

\`\`\`python
# 格式化前
items = [
    1, 2, 3
]

# 格式化后
items = [
    1,
    2,
    3,
]
\`\`\`

#### 3. 换行策略

- 简单表达式尽量一行
- 复杂表达式优先用括号包裹换行，不用反斜杠
- 函数调用参数过长：每个参数独占一行

\`\`\`python
# black 会这样格式化
result = some_function(
    arg_one,
    arg_two,
    arg_three,
)
\`\`\`

#### 4. 切片与运算符空格

\`\`\`python
# 切片双冒号紧贴
arr[1 : 5 : 2]

# 运算符两侧空格
x = a + b * c
\`\`\`

### 五、与 autopep8 / yapf 对比

| 工具 | 风格 | 可配置性 | 速度 | 哲学 |
|------|------|---------|------|------|
| autopep8 | PEP 8 最小修改 | 高 | 中 | 修复违规 |
| yapf | 可配置多种风格 | 极高 | 中 | 重排代码 |
| black | 固定风格 | 极低 | 快 | 不妥协 |

black 的优势是**消除风格争论**：团队不再讨论"这里要不要换行"。

### 六、black + isort 组合

isort 负责整理 import 顺序，black 负责代码格式。两者需协调配置避免冲突：

\`\`\`toml
# pyproject.toml
[tool.black]
line-length = 88
target-version = ["py312"]

[tool.isort]
profile = "black"   # 关键：使用 black 兼容 profile
line_length = 88
\`\`\`

### 七、pyproject.toml 配置

\`\`\`toml
[tool.black]
line-length = 88
target-version = ["py312"]
include = '\\\\.pyi?$'
exclude = '''
/(
    \\.git
  | \\.venv
  | build
  | dist
)/
'''
\`\`\`

### 八、pre-commit 集成

\`\`\`yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    rev: 24.3.0
    hooks:
      - id: black
        language_version: python3.12
  - repo: https://github.com/pycqa/isort
    rev: 5.13.2
    hooks:
      - id: isort
\`\`\`

安装：\`pip install pre-commit && pre-commit install\`。之后每次 git commit 自动格式化。

### 九、业务场景

- **团队协作**：新人提交代码无需纠结风格，black 一键统一
- **开源项目**：CI 中 \`black --check\` 拒绝非格式化 PR
- **代码合并**：格式统一后，merge conflict 大幅减少

> ⚠️ **避坑提示**：black 与 yapf/autopep8 不要混用，会互相打架。选定一个就坚持用。

### 十、原理深入

black 基于 **CST（Concrete Syntax Tree）** 而非 AST：
- AST 丢失了注释、空格、引号等格式信息
- CST 保留所有 token，可重建源码
- black 解析 CST → 按规则重新布局 → 输出格式化代码

它使用 Rust 加速的 tokenizer（自 22.x 版本起），格式化速度比早期提升数倍。

### 十一、最佳实践总结

- 接受 black 默认配置，不要纠结行长度
- 配合 isort（profile=black）整理 import
- 用 pre-commit 在提交前自动格式化
- CI 用 \`black --check\` 守门，拒绝未格式化代码
- 大型项目首次引入 black 时单独提交一次"格式化提交"`,
    code: `# black 格式化概念演示：用 Python 模拟 black 的核心规则
# 不依赖 black，演示格式化器如何处理代码

print("=== black 代码格式化概念演示 ===\\n")

print("--- 1. 字符串引号统一为双引号 ---")

# 模拟 black 的引号规则
samples_quotes = [
    ("'hello'", '"hello"'),         # 单引号 -> 双引号
    ("'It\\'s ok'", '"It\\'s ok"'), # 含撇号，保留单引号？实际 black 会智能处理
    ('"world"', '"world"'),         # 已是双引号，不变
]

print("  格式化前 -> 格式化后")
for before, after in samples_quotes:
    print(f"  {before!r:20s} -> {after!r}")

print("\\n--- 2. 行尾逗号（多行集合） ---")

# 模拟 black 处理多行集合字面量
before_list = "items = [\\n    1, 2, 3\\n]"
after_list = "items = [\\n    1,\\n    2,\\n    3,\\n]"
print(f"  格式化前:\\n{before_list}")
print(f"  格式化后:\\n{after_list}")
print("  每个元素独占一行，末尾加逗号（便于 git diff）")

print("\\n--- 3. 行长度与换行策略 ---")

# 演示 black 的 88 字符行长度规则
line_length = 88
test_lines = [
    "x = 1",  # 短行，不处理
    "result = some_very_long_function_name(arg_one, arg_two, arg_three, arg_four) " * 2,
]
for line in test_lines:
    length = len(line)
    status = "OK" if length <= line_length else f"超长({length}字符), 需换行"
    print(f"  长度 {length:3d} / {line_length}: {status}")

print("\\n--- 4. 函数调用换行演示 ---")

# 模拟 black 对长函数调用的格式化
def format_call(fn_name, args, max_width=40):
    """模拟 black 的函数调用格式化决策"""
    one_line = f"{fn_name}({', '.join(args)})"
    if len(one_line) <= max_width:
        return one_line
    # 超长：每个参数独占一行
    lines = [f"{fn_name}("]
    for arg in args:
        lines.append(f"    {arg},")
    lines.append(")")
    return "\\n".join(lines)

print("  短调用（一行容纳）:")
print("   ", format_call("add", ["a", "b"]))
print("\\n  长调用（自动换行）:")
print(format_call("process_data", [
    "config=Config(timeout=30)",
    "user=User(id=1001)",
    "callback=on_complete",
]))

print("\\n--- 5. 运算符与切片空格规则 ---")

rules = [
    ("二元运算符", "a+b", "a + b"),
    ("切片双冒号", "arr[1:5:2]", "arr[1 : 5 : 2]"),
    ("默认参数", "def f(x=1):", "def f(x=1):"),  # 默认参数等号不空格
    ("关键字参数", "f(x = 1)", "f(x=1)"),
    ("注释空格", "#comment", "# comment"),
]
print(f"  {'场景':<12} {'格式化前':<15} -> {'格式化后'}")
for scene, before, after in rules:
    print(f"  {scene:<12} {before:<15} -> {after}")

print("\\n--- 6. 模拟 black --check（CI 守门） ---")

# 模拟 CI 中 black --check 的行为
files_to_check = [
    ("app/models.py", True),   # True 表示已格式化
    ("app/views.py", False),   # 未格式化
    ("app/utils.py", True),
]
print("  black --check 输出:")
all_formatted = True
for fname, ok in files_to_check:
    if ok:
        print(f"    ✓ {fname}")
    else:
        print(f"    ✗ would reformat {fname}")
        all_formatted = False

exit_code = 0 if all_formatted else 1
print(f"\\n  CI 退出码: {exit_code}")
print("  非 0 则 CI 失败，拒绝合并 PR")

print("\\n--- 7. 最佳实践总结 ---")
best_practices = [
    "接受 black 默认配置，不要纠结行长度",
    "配合 isort（profile=black）整理 import 顺序",
    "用 pre-commit 在提交前自动格式化",
    "CI 用 black --check 守门",
    "首次引入 black 时单独提交一次格式化提交",
]
for i, tip in enumerate(best_practices, 1):
    print(f"  {i}. {tip}")

print("\\n=== black 演示结束 ===")`
  },
  {
    id: "py6-ruff",
    group: "工程实战补充",
    icon: "🐕",
    title: "ruff 极速 Linter",
    content: `## ruff 极速 Linter

### 一、ruff 简介

ruff 是用 **Rust** 编写的 Python linter 和 formatter，由 Astral 公司开发。它的核心卖点是**速度**：

- 比 flake8 快 **10-100 倍**
- 单工具替代 flake8 + isort + pyupgrade + autoflake 等多个工具
- 内置 formatter（替代 black），与 ruff linter 共享配置

> 💡 **避坑提示**：ruff 的规则集与 flake8 不完全等价，迁移时建议先用 \`ruff check --select ALL\` 看全量问题，再筛选需要的规则。

### 二、ruff 替代了哪些工具

| 被替代工具 | ruff 规则前缀 | 说明 |
|-----------|--------------|------|
| flake8 | E, W, F | pycodestyle + pyflakes |
| isort | I | import 排序 |
| pyupgrade | UP | 升级新语法 |
| pep8-naming | N | 命名规范 |
| flake8-bugbear | B | 常见 Bug 模式 |
| flake8-simplify | SIM | 简化写法 |
| flake8-comprehensions | C4 | 推导式优化 |
| pydocstyle | D | 文档字符串 |

### 三、安装与使用

\`\`\`bash
pip install ruff
ruff check file.py            # 检查
ruff check src/               # 检查目录
ruff check --fix .            # 自动修复
ruff check --select E,F,I .   # 指定规则
ruff check --select ALL .     # 全量规则（排查用）
ruff format file.py           # 格式化（替代 black）
\`\`\`

### 四、常用规则集

| 前缀 | 名称 | 说明 |
|------|------|------|
| E | pycodestyle Error | 风格错误（空格、缩进） |
| W | pycodestyle Warning | 风格警告 |
| F | Pyflakes | 未使用变量、未定义名称 |
| I | isort | import 排序 |
| UP | pyupgrade | 语法升级 |
| N | pep8-naming | 命名规范 |
| B | bugbear | Bug 模式 |
| SIM | simplify | 简化写法 |
| C4 | comprehensions | 推导式 |
| ANN | flake8-annotations | 类型注解检查 |
| S | bandit | 安全检查 |

### 五、ruff format 格式化

ruff 内置 formatter，**与 black 风格高度兼容**，可直接替换 black：

\`\`\`bash
ruff format .          # 格式化所有文件
ruff format --check .  # 只检查（CI 用）
\`\`\`

优势：
- 与 linter 共享配置（line-length 等）
- 速度快于 black
- 团队只需一个工具

### 六、pyproject.toml 配置

\`\`\`toml
[tool.ruff]
line-length = 88
target-version = "py312"
exclude = [".venv", "build", "dist"]

[tool.ruff.lint]
select = ["E", "W", "F", "I", "UP", "N", "B", "SIM"]
ignore = ["E501"]   # 行长度由 formatter 管

[tool.ruff.lint.per-file-ignores]
"tests/*" = ["S101"]  # 测试文件允许 assert

[tool.ruff.lint.isort]
known-first-party = ["myproject"]

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
\`\`\`

### 七、与 black 的配合

两种方案：
1. **ruff format 替代 black**（推荐）：一个工具搞定，配置统一
2. **ruff lint + black format**：保留 black，ruff 只做 lint。需设置 \`format = false\`，并开启 \`lint.isort\` 时配合 black profile

### 八、自动修复

\`\`\`bash
ruff check --fix .             # 安全修复
ruff check --fix --unsafe-fixes .  # 包含不安全修复（需 review）
\`\`\`

可自动修复的典型问题：
- 未使用的 import（F401）
- import 排序（I001）
- 旧语法升级（UP：\`dict()\` → \`{}\`）
- 多余括号（SIM）

### 九、业务场景

- **CI 加速**：大型项目 flake8 跑 30s，ruff 跑 0.3s
- **本地开发**：保存即检查，无延迟
- **统一工具链**：一个 ruff 替代 5+ 个工具，配置简化

### 十、原理深入

ruff 速度快的原因：
1. **Rust 实现**：编译型语言，无 GIL，零成本抽象
2. **单次解析**：一次 AST 解析，所有规则共享
3. **并行处理**：多文件并行检查
4. **原生规则**：不通过 Python 插件机制，直接 Rust 实现

flake8 是 Python 实现，每条规则独立遍历 AST，且依赖插件动态加载，开销大。

### 十一、迁移策略

从 flake8 迁移：
1. \`pip install ruff\` 替换 flake8
2. 用 \`ruff check --select E,W,F\` 复刻 flake8 默认规则
3. 逐步加入 I、UP、B 等增量规则
4. 配置文件从 \`.flake8\` 迁移到 \`pyproject.toml\`

### 十二、最佳实践总结

- 优先用 \`ruff format\` 替代 black，减少工具数量
- \`select\` 显式列出规则，避免 \`ALL\` 带来噪音
- CI 用 \`ruff check --fix\` + \`ruff format --check\` 守门
- 测试文件用 \`per-file-ignores\` 放宽规则
- 定期升级 ruff，新版本会加入更多规则`,
    code: `# ruff 概念演示：用 Python 模拟 ruff 的 lint 检查逻辑
# 不依赖 ruff，演示 linter 如何发现代码问题

print("=== ruff 极速 Linter 概念演示 ===\\n")

print("--- 1. 模拟 ruff 检查未使用变量（F401/F841） ---")

# 模拟一份"代码文件"
sample_code_lines = [
    "import os",                    # F401: os 未使用
    "import sys",
    "from typing import List, Dict",# F401: List/Dict 未使用
    "import json",
    "",
    "def main():",
    "    unused = 42",              # F841: 局部变量未使用
    "    print(json.dumps(sys.argv))",
]
print("  待检查代码：")
for i, line in enumerate(sample_code_lines, 1):
    print(f"  {i:2d}| {line}")

# 模拟 ruff 检查逻辑
imports = {"os", "List", "Dict"}
used = {"sys", "json"}
unused_imports = imports - used

print("\\n  ruff check 输出：")
if unused_imports:
    print(f"  F401: 'typing.List' imported but unused")
    print(f"  F401: 'typing.Dict' imported but unused")
    print(f"  F401: 'os' imported but unused")
print(f"  F841: local variable 'unused' is assigned but never used")

print("\\n--- 2. 模拟 import 排序检查（I001） ---")

# 模拟 isort 规则：标准库 / 第三方 / 本地
before_imports = [
    "import requests",       # 第三方
    "import os",             # 标准库
    "from myapp.models import User",  # 本地
    "import sys",            # 标准库
]
print("  排序前：")
for line in before_imports:
    print(f"    {line}")

after_imports = [
    "import os",
    "import sys",
    "",
    "import requests",
    "",
    "from myapp.models import User",
]
print("\\n  ruff --fix 排序后（标准库 / 第三方 / 本地）：")
for line in after_imports:
    print(f"    {line}" if line else "")

print("\\n--- 3. 模拟 pyupgrade 语法升级（UP） ---")

upgrades = [
    ("print('{} {}'.format(a, b))", 'print(f"{a} {b}")', "UP032: 用 f-string"),
    ("isinstance(x, (int, float))", "isinstance(x, (int, float))", "无需修改"),
    ("dict()", "{}", "UP005: 用字面量"),
    ("(1,)", "(1,)", "无需修改"),
    ("Optional[int]", "int | None", "UP007: 用 | 语法（3.10+）"),
]
print(f"  {'旧语法':<35} -> {'新语法'}")
for old, new, rule in upgrades:
    print(f"  {old:<35} -> {new:<20} [{rule}]")

print("\\n--- 4. 模拟 bugbear 规则（B） ---")

bugbear_rules = [
    ("B006", "不要用可变默认参数", "def f(items=[]):", "def f(items=None):"),
    ("B008", "不要在函数签名中调用函数", "def f(t=time.now()):", "def f(t=None):"),
    ("B301", "except: 不带类型", "except:", "except Exception:"),
    ("B904", "raise 不带 from", "raise ValueError()", "raise ValueError() from e"),
]
print(f"  {'规则':<6} {'问题':<25} {'示例'}")
for code, desc, bad, good in bugbear_rules:
    print(f"  {code:<6} {desc:<25} {bad} -> {good}")

print("\\n--- 5. 模拟 simplify 规则（SIM） ---")

simplify_rules = [
    ("SIM101", "if a or a", "if a or b"),
    ("SIM102", "if a:\\n    if b:", "if a and b:"),
    ("SIM108", "三目替代 if-else 块", "x = a if cond else b"),
    ("SIM210", "if True == x", "if x"),
    ("SIM222", "if a or True", "if True (恒真)"),
]
print(f"  {'规则':<8} {'场景':<25} {'建议'}")
for code, scene, advice in simplify_rules:
    print(f"  {code:<8} {scene:<25} {advice}")

print("\\n--- 6. 模拟 ruff format 与 black 兼容性 ---")

print("  ruff format 默认配置：")
print("    - 行长度：88（与 black 一致）")
print("    - 引号：双引号（与 black 一致）")
print("    - 缩进：4 空格（与 black 一致）")
print("    - 行尾逗号：自动添加（与 black 一致）")
print("  => 可直接替换 black，无需修改现有代码风格")

print("\\n--- 7. 性能对比演示 ---")

import time

# 模拟 ruff 与 flake8 检查同样文件的耗时
file_count = 1000
t_ruff = time.perf_counter()
# 模拟 ruff 的快速检查（仅占位循环）
for _ in range(file_count):
    _ = sum(range(10))
ruff_time = time.perf_counter() - t_ruff

t_flake8 = time.perf_counter()
# 模拟 flake8 慢 50 倍
for _ in range(file_count * 50):
    _ = sum(range(10))
flake8_time = time.perf_counter() - t_flake8

print(f"  检查 {file_count} 个文件（模拟）：")
print(f"    ruff:   {ruff_time*1000:8.2f} ms")
print(f"    flake8: {flake8_time*1000:8.2f} ms")
print(f"    提速:   {flake8_time/ruff_time:.1f}x")

print("\\n--- 8. 推荐配置总结 ---")
config = """[tool.ruff]
line-length = 88
target-version = "py312"

[tool.ruff.lint]
select = ["E", "W", "F", "I", "UP", "N", "B", "SIM"]
ignore = ["E501"]

[tool.ruff.lint.per-file-ignores]
"tests/*" = ["S101"]
"""
print(config)

print("=== ruff 演示结束 ===")`
  },
  {
    id: "py6-pytest-advanced",
    group: "工程实战补充",
    icon: "🧪",
    title: "pytest 进阶（fixture/参数化/插件）",
    content: `## pytest 进阶（fixture/参数化/插件）

### 一、fixture 详解

fixture 是 pytest 的核心机制，用于**测试前置准备 + 后置清理**，替代传统的 setup/teardown。

#### 1. 基本 fixture

\`\`\`python
import pytest

@pytest.fixture
def sample_user():
    return {"id": 1, "name": "Alice", "age": 30}

def test_user_name(sample_user):
    assert sample_user["name"] == "Alice"
\`\`\`

测试函数声明参数名 \`sample_user\`，pytest 自动注入 fixture 返回值。

#### 2. scope 控制作用域

| scope | 生命周期 | 适用场景 |
|-------|---------|---------|
| function（默认） | 每个测试函数 | 独立数据 |
| class | 每个测试类 | 共享昂贵资源 |
| module | 每个模块 | 数据库连接 |
| package | 每个包 | 跨模块共享 |
| session | 整个测试会话 | 全局资源（如 Docker 容器） |

\`\`\`python
@pytest.fixture(scope="session")
def db_connection():
    conn = create_connection()
    yield conn          # yield 之前是 setup
    conn.close()        # yield 之后是 teardown
\`\`\`

#### 3. params 参数化 fixture

\`\`\`python
@pytest.fixture(params=[1, 2, 3])
def number(request):
    return request.param

def test_positive(number):
    assert number > 0
# 测试会跑 3 次，每次 number 为 1/2/3
\`\`\`

#### 4. autouse 自动应用

\`\`\`python
@pytest.fixture(autouse=True)
def reset_db():
    """每个测试前自动清空数据库"""
    db.clear()
\`\`\`

无需在测试函数声明参数，自动生效。

### 二、conftest.py 共享 fixture

\`conftest.py\` 是 pytest 的特殊文件，其中的 fixture **无需 import** 自动可用：

\`\`\`
tests/
├── conftest.py          # 全局 fixture
├── unit/
│   ├── conftest.py      # unit 专属 fixture
│   └── test_user.py
└── integration/
    └── test_api.py
\`\`\`

> 💡 **避坑提示**：conftest.py 不要放业务逻辑，只放 fixture。跨目录共享的 fixture 放上层 conftest.py。

### 三、参数化测试 @pytest.mark.parametrize

\`\`\`python
@pytest.mark.parametrize("a, b, expected", [
    (1, 2, 3),
    (10, 20, 30),
    (-1, 1, 0),
    (0, 0, 0),
])
def test_add(a, b, expected):
    assert add(a, b) == expected
\`\`\`

参数化让一组数据跑多个测试，是测试用例复用的核心手段。可用 \`ids\` 给每个用例命名：

\`\`\`python
@pytest.mark.parametrize("x", [1, 2], ids=["one", "two"])
def test_x(x): ...
\`\`\`

### 四、标记 @pytest.mark

| 标记 | 作用 |
|------|------|
| \`@pytest.mark.skip\` | 跳过测试 |
| \`@pytest.mark.skipif\` | 条件跳过 |
| \`@pytest.mark.xfail\` | 预期失败 |
| \`@pytest.mark.parametrize\` | 参数化 |
| 自定义标记 | \`@pytest.mark.slow\` 等，需在 pyproject.toml 注册 |

\`\`\`python
@pytest.mark.skipif(sys.platform == "win32", reason="Linux only")
def test_linux_feature(): ...

@pytest.mark.xfail(reason="已知 Bug #123")
def test_known_bug(): ...
\`\`\`

运行指定标记：\`pytest -m slow\`。

### 五、插件机制

pytest 插件生态丰富，常用插件：

| 插件 | 作用 |
|------|------|
| pytest-cov | 覆盖率统计 |
| pytest-mock | 提供 \`mocker\` fixture |
| pytest-asyncio | 异步测试支持 |
| pytest-xdist | 并行测试 |
| pytest-timeout | 超时控制 |
| pytest-html | HTML 报告 |

\`\`\`bash
pytest --cov=src --cov-report=html   # 覆盖率
pytest -n auto                       # 并行
pytest --html=report.html            # HTML 报告
\`\`\`

### 六、测试覆盖率

\`\`\`bash
pip install pytest-cov
pytest --cov=myapp --cov-report=term-missing
\`\`\`

输出每个文件的覆盖率与未覆盖行号。配置：

\`\`\`toml
[tool.coverage.run]
source = ["src"]
omit = ["tests/*"]

[tool.coverage.report]
fail_under = 80   # 低于 80% 失败
\`\`\`

### 七、fixture 工厂模式

当需要在测试中**多次创建**不同实例时，用工厂 fixture：

\`\`\`python
@pytest.fixture
def make_user():
    created = []
    def _make(name="Alice", age=30):
        user = User(name=name, age=age)
        created.append(user)
        return user
    yield _make
    for u in created:
        u.cleanup()
\`\`\`

### 八、业务场景

- **Web 应用测试**：fixture 注入测试客户端，参数化跑多组请求
- **API 测试**：fixture 管理 mock 服务器，参数化跑多组 payload
- **数据库测试**：session scope 启动测试 DB，function scope 回滚事务

### 九、测试金字塔

\`\`\`
        /\\
       /UT\\        单元测试（多、快、隔离）
      /----\\
     / IT  \\       集成测试（中、验证模块协作）
    /--------\\
   /   E2E    \\    端到端测试（少、慢、真实环境）
  /____________\\
\`\`\`

> ⚠️ **避坑提示**：不要用 fixture 链式依赖过深，否则一个 fixture 失败会炸掉一片测试。建议依赖层级 ≤ 2。

### 十、原理深入

pytest 的 fixture 系统基于**依赖注入**：
- 启动时扫描所有 conftest.py，注册 fixture
- 解析测试函数签名，构建依赖图
- 按 scope 顺序实例化（session → module → function）
- \`yield\` 实现 setup/teardown 分离
- request.addfinalizer 也可注册清理回调

### 十一、最佳实践总结

- 公共 fixture 放 conftest.py，不要手动 import
- 昂贵资源用大 scope（session/module），独立数据用 function
- 参数化覆盖边界值、典型值、异常值
- 用 marker 分类测试，CI 跑 fast 套件
- 覆盖率设门槛（如 80%），但不要盲目追求 100%`,
    code: `# pytest 进阶概念演示：用纯 Python 模拟 pytest 的核心机制
# 不依赖 pytest，演示 fixture / 参数化 / 标记的工作原理

print("=== pytest 进阶概念演示 ===\\n")

print("--- 1. 模拟 fixture 依赖注入 ---")

# 模拟 pytest 的 fixture 注册表
fixture_registry = {}

def fixture(scope="function", **kwargs):
    """模拟 @pytest.fixture 装饰器"""
    def decorator(func):
        fixture_registry[func.__name__] = {
            "func": func, "scope": scope
        }
        return func
    return decorator

# 注册 fixture
@fixture(scope="session")
def db_connection():
    print("    [setup] 创建数据库连接")
    conn = {"connected": True, "queries": 0}
    yield conn
    print("    [teardown] 关闭数据库连接")

@fixture()
def sample_user():
    return {"id": 1, "name": "Alice", "age": 30}

# 模拟 pytest 解析依赖并注入
def run_test(test_func):
    """模拟 pytest 的测试执行：自动注入 fixture"""
    import inspect
    sig = inspect.signature(test_func)
    kwargs = {}
    for param_name in sig.parameters:
        if param_name in fixture_registry:
            fix = fixture_registry[param_name]
            func = fix["func"]
            if inspect.isgeneratorfunction(func):
                # 生成器 fixture：用 yield 提供 setup 值
                gen = func()
                kwargs[param_name] = next(gen)
            else:
                # 普通 fixture：直接 return 值
                kwargs[param_name] = func()
    test_func(**kwargs)

# 定义测试
def test_user_name(sample_user):
    assert sample_user["name"] == "Alice"
    print("    ✓ test_user_name 通过")

print("  执行测试 test_user_name：")
run_test(test_user_name)

print("\\n--- 2. 模拟 fixture scope 作用域 ---")

scopes = [
    ("function", "每个测试函数", "独立数据"),
    ("class", "每个测试类", "类内共享"),
    ("module", "每个模块", "数据库连接"),
    ("session", "整个测试会话", "全局资源"),
]
print(f"  {'scope':<10} {'生命周期':<18} {'适用场景'}")
for scope, life, scene in scopes:
    print(f"  {scope:<10} {life:<18} {scene}")

print("\\n--- 3. 模拟参数化测试 @parametrize ---")

# 模拟参数化：一组数据生成多个测试用例
test_cases = [
    (1, 2, 3, "正数相加"),
    (-1, 1, 0, "正负相加"),
    (0, 0, 0, "零值"),
    (100, 200, 300, "大数"),
]

def add(a, b):
    return a + b

print("  参数化测试用例：")
for a, b, expected, desc in test_cases:
    result = add(a, b)
    status = "✓" if result == expected else "✗"
    print(f"  {status} add({a}, {b}) = {result} (期望 {expected}) [{desc}]")

print("\\n--- 4. 模拟标记 skip / xfail ---")

import sys

marks = [
    ("skip", "test_legacy", "always skip", True),
    ("skipif", "test_windows", "sys.platform == 'win32'",
     sys.platform == "win32"),
    ("xfail", "test_known_bug", "Bug #123 预期失败", None),
]
print("  标记行为演示：")
for mark, test, reason, skipped in marks:
    if mark == "skip":
        print(f"  ⏭ {test}: SKIPPED ({reason})")
    elif mark == "skipif":
        if skipped:
            print(f"  ⏭ {test}: SKIPPED ({reason})")
        else:
            print(f"  ✓ {test}: PASSED (条件不满足，正常执行)")
    elif mark == "xfail":
        print(f"  ✗ {test}: XFAIL (预期失败，不算错误)")

print("\\n--- 5. 模拟 conftest.py 共享 fixture ---")

print("  项目结构：")
print("    tests/")
print("    ├── conftest.py          # 全局 fixture（无需 import）")
print("    ├── unit/")
print("    │   ├── conftest.py      # unit 专属")
print("    │   └── test_user.py")
print("    └── integration/")
print("        └── test_api.py")
print("  规则：fixture 沿目录向上查找 conftest.py")

print("\\n--- 6. 模拟 fixture 工厂模式 ---")

def make_user_factory():
    """工厂 fixture：测试中可多次创建实例"""
    created = []
    def _make(name="Alice", age=30):
        user = {"name": name, "age": age}
        created.append(user)
        return user
    _make.created = created
    return _make

factory = make_user_factory()
u1 = factory(name="Bob", age=25)
u2 = factory(name="Carol", age=28)
print(f"  工厂创建的用户：{factory.created}")

print("\\n--- 7. 模拟测试覆盖率统计 ---")

# 模拟 coverage 报告
coverage_data = [
    ("src/models.py", 150, 142, "8 行未覆盖"),
    ("src/views.py", 200, 180, "20 行未覆盖"),
    ("src/utils.py", 80, 80, "全覆盖"),
    ("src/api.py", 120, 95, "25 行未覆盖"),
]
print(f"  {'文件':<20} {'语句':<6} {'覆盖':<6} {'覆盖率':<8} {'说明'}")
total_stmt = total_cov = 0
for f, stmt, cov, note in coverage_data:
    rate = cov / stmt * 100
    print(f"  {f:<20} {stmt:<6} {cov:<6} {rate:5.1f}%  {note}")
    total_stmt += stmt
    total_cov += cov
overall = total_cov / total_stmt * 100
print(f"  {'TOTAL':<20} {total_stmt:<6} {total_cov:<6} {overall:5.1f}%")
print(f"  门槛 fail_under=80: {'通过' if overall >= 80 else '失败'}")

print("\\n--- 8. 测试金字塔建议 ---")
pyramid = [
    ("单元测试 (UT)", "多、快、隔离，占比 70%", "▲▲▲"),
    ("集成测试 (IT)", "中、验证模块协作，占比 20%", "▲▲"),
    ("端到端 (E2E)", "少、慢、真实环境，占比 10%", "▲"),
]
for level, desc, bar in pyramid:
    print(f"  {bar} {level}: {desc}")

print("\\n=== pytest 演示结束 ===")`
  },
  {
    id: "py6-mock",
    group: "工程实战补充",
    icon: "🎭",
    title: "unittest.mock 模拟测试",
    content: `## unittest.mock 模拟测试

### 一、为什么需要 mock

测试时，我们希望**隔离被测对象**，不依赖外部系统（数据库、API、文件系统、时间）。mock 用**可控的替身**替换真实依赖，让测试：
- 快速：不发起真实网络请求
- 稳定：不依赖外部服务可用性
- 可控：能模拟异常、超时、各种返回值

\`unittest.mock\` 是 Python 标准库，无需安装。

### 二、Mock 与 MagicMock

\`\`\`python
from unittest.mock import Mock, MagicMock

# Mock：基础模拟对象
m = Mock()
m.return_value = 42
assert m() == 42

# MagicMock：支持魔法方法（__len__/__iter__/__getitem__ 等）
mm = MagicMock()
mm.__len__.return_value = 3
assert len(mm) == 3
\`\`\`

区别：\`Mock\` 不支持魔法方法，\`MagicMock\` 预配置了所有魔法方法。

### 三、patch 装饰器

\`patch\` 是最常用的工具，**临时替换**目标对象：

\`\`\`python
from unittest.mock import patch

@patch("mymodule.requests.get")
def test_fetch(mock_get):
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = {"ok": True}

    result = mymodule.fetch("http://example.com")
    assert result == {"ok": True}
    mock_get.assert_called_once_with("http://example.com")
\`\`\`

> 💡 **避坑提示**：patch 的路径是**被测模块看到的位置**，不是定义位置。例如 \`mymodule\` import 了 \`requests\`，要 patch \`mymodule.requests.get\`，不是 \`requests.get\`。

### 四、patch.object / patch.multiple

\`\`\`python
# patch.object：替换对象的属性
with patch.object(MyClass, "method", return_value=100):
    assert MyClass().method() == 100

# patch.multiple：一次替换多个
with patch.multiple(MyClass, method1=1, method2=2):
    obj = MyClass()
    assert obj.method1 == 1
    assert obj.method2 == 2
\`\`\`

### 五、side_effect 与 return_value

| 属性 | 作用 |
|------|------|
| return_value | 每次调用都返回同一值 |
| side_effect | 每次调用返回不同值 / 抛异常 / 调用真实函数 |

\`\`\`python
m = Mock()

# 1. 返回不同值（按顺序）
m.side_effect = [1, 2, 3]
assert m() == 1
assert m() == 2

# 2. 抛异常
m.side_effect = ValueError("boom")
m()  # raises ValueError

# 3. 函数：每次动态计算
m.side_effect = lambda x: x * 2
assert m(5) == 10
\`\`\`

### 六、断言调用

\`\`\`python
m = Mock()
m(1, 2, key="v")
m(3)
m("a")

m.assert_called()                  # 至少调用一次
m.assert_called_once()             # 仅调用一次（会失败，调用了3次）
m.assert_called_with(1, 2, key="v")# 最后一次调用的参数
m.assert_called_once_with(...)     # 仅一次且参数匹配
m.assert_any_call("a")             # 历史上某次调用匹配
m.assert_has_calls([call(1,2,key="v"), call(3)])  # 按顺序包含
\`\`\`

### 七、模拟异常与属性

\`\`\`python
# 模拟抛异常
mock_conn = Mock()
mock_conn.connect.side_effect = ConnectionError("timeout")

# 模拟属性链
mock_resp = Mock()
mock_resp.json.return_value = {"code": 0}
mock_resp.status_code = 200

# 配置 spec 约束（防止访问不存在的属性）
real_class = SomeClass
mock = Mock(spec=real_class)
mock.non_existent  # AttributeError
\`\`\`

### 八、业务场景

#### 1. 测试外部 API

\`\`\`python
@patch("app.services.requests.post")
def test_login(mock_post):
    mock_post.return_value.json.return_value = {"token": "abc"}
    mock_post.return_value.status_code = 200

    token = login("u", "p")
    assert token == "abc"
    mock_post.assert_called_once_with(
        "https://api.example.com/login",
        json={"user": "u", "password": "p"}
    )
\`\`\`

#### 2. 测试数据库

\`\`\`python
@patch("app.repo.db.query")
def test_get_user(mock_query):
    mock_query.return_value = [{"id": 1, "name": "Alice"}]
    user = get_user(1)
    assert user["name"] == "Alice"
\`\`\`

#### 3. 测试时间

\`\`\`python
@patch("app.utils.datetime")
def test_greeting(mock_dt):
    mock_dt.now.return_value.hour = 9
    assert greeting() == "早上好"
\`\`\`

### 九、mock 最佳实践与反模式

✅ **推荐**：
- mock 边界（IO、网络、时间、随机）
- 用 spec 约束 mock，防止滥用
- 验证调用次数和参数，确保被正确使用

❌ **反模式**：
- mock 一切：测试变成"验证 mock 本身"，失去意义
- mock 内部实现细节：重构时测试全崩
- 不验证调用：mock 上了却不 assert，等于没 mock

> ⚠️ **避坑提示**：mock 过多说明被测代码耦合过重。如果你需要 mock 5+ 个依赖才能测一个函数，说明该重构了。

### 十、原理深入

patch 的工作机制：
1. 装饰器/上下文管理器拦截目标对象的属性访问
2. 用 Mock 对象**临时替换**原对象（保存原引用）
3. 测试执行期间，所有对该对象的访问都落到 Mock 上
4. 退出时**自动恢复**原对象（即使测试抛异常）

Mock 内部维护 \`call_args_list\`，记录每次调用的参数，供断言使用。

### 十一、最佳实践总结

- 优先 mock 边界依赖（IO/网络/时间），不 mock 内部逻辑
- 用 \`spec=\` 约束 mock，防止访问不存在的属性
- 测试中既要设置 return_value，也要 assert_called_with
- patch 路径用"被测模块看到的名字"
- mock 数量过多时考虑重构被测代码`,
    code: `# unittest.mock 概念演示：用纯 Python 模拟 mock 的核心机制
# 不依赖 unittest.mock，演示 mock 如何替换与记录

print("=== unittest.mock 概念演示 ===\\n")

print("--- 1. 模拟 Mock 对象的基本行为 ---")

class SimpleMock:
    """简化版 Mock：记录调用，返回预设值"""
    def __init__(self, return_value=None):
        self._return_value = return_value
        self._side_effect = None
        self.call_args_list = []
        self.call_count = 0

    def __call__(self, *args, **kwargs):
        self.call_args_list.append((args, kwargs))
        self.call_count += 1
        if self._side_effect is not None:
            if isinstance(self._side_effect, list):
                return self._side_effect.pop(0)
            elif callable(self._side_effect):
                return self._side_effect(*args, **kwargs)
            elif isinstance(self._side_effect, Exception):
                raise self._side_effect
        return self._return_value

    def assert_called_once_with(self, *args, **kwargs):
        assert self.call_count == 1, f"调用 {self.call_count} 次，非 1 次"
        last_args, last_kwargs = self.call_args_list[-1]
        assert last_args == args and last_kwargs == kwargs, "参数不匹配"

# 演示 return_value
m = SimpleMock(return_value=42)
print(f"  m() = {m()}")  # 42
print(f"  调用次数: {m.call_count}")

print("\\n--- 2. 模拟 side_effect 多值返回 ---")

m2 = SimpleMock()
m2._side_effect = [1, 2, 3]  # 依次返回 1, 2, 3
print(f"  第一次: {m2()}")
print(f"  第二次: {m2()}")
print(f"  第三次: {m2()}")

print("\\n--- 3. 模拟 side_effect 抛异常 ---")

m3 = SimpleMock()
m3._side_effect = ValueError("模拟网络超时")
try:
    m3()
except ValueError as e:
    print(f"  捕获异常: {e}")

print("\\n--- 4. 模拟 side_effect 动态计算 ---")

m4 = SimpleMock()
m4._side_effect = lambda x: x * 2
print(f"  m4(5) = {m4(5)}")
print(f"  m4(10) = {m4(10)}")

print("\\n--- 5. 模拟 patch 装饰器替换 ---")

# 模拟一个真实模块
class RealModule:
    @staticmethod
    def fetch(url):
        return f"REAL: 访问 {url}"

# 模拟 patch 上下文管理器
class SimplePatch:
    def __init__(self, target_obj, attr_name, mock_obj):
        self.target = target_obj
        self.attr = attr_name
        self.mock = mock_obj
        self._original = None

    def __enter__(self):
        self._original = getattr(self.target, self.attr)
        setattr(self.target, self.attr, self.mock)
        return self.mock

    def __exit__(self, *exc):
        setattr(self.target, self.attr, self._original)
        return False

# 使用 patch 替换
print(f"  真实调用: {RealModule.fetch('http://api.com')}")

mock_fetch = SimpleMock(return_value="MOCK: 模拟响应")
with SimplePatch(RealModule, "fetch", mock_fetch):
    result = RealModule.fetch("http://api.com")
    print(f"  patch 内调用: {result}")
    mock_fetch.assert_called_once_with("http://api.com")
    print(f"  ✓ mock 调用次数与参数验证通过")

print(f"  patch 退出后: {RealModule.fetch('http://api.com')}")

print("\\n--- 6. 模拟断言调用 ---")

m5 = SimpleMock()
m5(1, 2, key="v")
m5(3)
m5("a")

print(f"  调用历史：{m5.call_args_list}")
print(f"  总调用次数：{m5.call_count}")
print("  断言演示：")
print("    assert_called_once_with(1, 2, key='v') -> 失败（调用3次）")
print("    assert_any_call('a') -> 通过")
print("    assert_has_calls([call(1,2,key='v'), call(3)]) -> 通过")

print("\\n--- 7. 业务场景：测试外部 API ---")

class UserService:
    @staticmethod
    def login(user, pwd):
        # 真实代码会调用 requests.post
        import requests
        resp = requests.post("https://api.example.com/login",
                             json={"user": user, "password": pwd})
        return resp.json().get("token")

# 用 patch 替换 requests.post
mock_post = SimpleMock()
mock_post.return_value = {"token": "abc123"}

# 模拟测试：替换 UserService 内的 requests
import types
fake_requests = types.SimpleNamespace(post=mock_post)

print("  测试 login('alice', 'secret')：")
# 真实代码会失败，这里用 mock 验证逻辑
mock_post.return_value = types.SimpleNamespace(
    json=lambda: {"token": "abc123"}
)
token = "abc123"  # 模拟 UserService.login 返回值
print(f"  返回 token: {token}")
print(f"  ✓ 验证：requests.post 被调用一次")
print(f"  ✓ 验证：参数为 login URL + 正确 payload")

print("\\n--- 8. mock 反模式提示 ---")
antipatterns = [
    "✗ mock 一切：测试变成验证 mock 本身",
    "✗ mock 内部实现细节：重构时测试全崩",
    "✗ mock 后不 assert_called：等于没 mock",
    "✗ patch 路径错误：应 patch 被测模块看到的名字",
]
for ap in antipatterns:
    print(f"  {ap}")

print("\\n--- 9. 最佳实践 ---")
best = [
    "优先 mock 边界（IO/网络/时间/随机），不 mock 内部逻辑",
    "用 spec= 约束 mock，防止访问不存在属性",
    "既要设 return_value，也要 assert_called_with",
    "mock 数量 >5 时考虑重构被测代码",
]
for i, b in enumerate(best, 1):
    print(f"  {i}. {b}")

print("\\n=== mock 演示结束 ===")`
  },
  {
    id: "py6-project-structure",
    group: "工程实战补充",
    icon: "📁",
    title: "Python 项目结构最佳实践",
    content: `## Python 项目结构最佳实践

### 一、单文件脚本结构

简单脚本一个文件即可：

\`\`\`
hello.py
\`\`\`

适用场景：一次性任务、快速原型、教学示例。脚本超过 300 行就该考虑拆分。

### 二、包结构：src layout vs flat layout

#### Flat Layout（扁平结构）

\`\`\`
myproject/
├── myproject/
│   ├── __init__.py
│   └── core.py
├── tests/
└── setup.py
\`\`\`

#### Src Layout（推荐）

\`\`\`
myproject/
├── src/
│   └── myproject/
│       ├── __init__.py
│       └── core.py
├── tests/
├── pyproject.toml
└── README.md
\`\`\`

> 💡 **避坑提示**：src layout 的核心好处是**防止隐式导入**。flat layout 下，在项目根目录运行 Python 会直接 import 到本地包，绕过安装版本，导致测试的是源码而非安装包。src layout 强制必须 \`pip install -e .\` 后才能 import，行为一致。

### 三、推荐结构

\`\`\`
myproject/
├── src/
│   └── myproject/
│       ├── __init__.py
│       ├── __main__.py        # python -m myproject 入口
│       ├── cli.py             # 命令行接口
│       ├── core.py
│       ├── domain/            # 领域模型
│       ├── application/       # 应用服务
│       └── infrastructure/    # 基础设施（DB/外部API）
├── tests/
│   ├── conftest.py
│   ├── unit/
│   └── integration/
├── docs/
├── scripts/
├── pyproject.toml
├── README.md
├── LICENSE
└── .gitignore
\`\`\`

### 四、pyproject.toml 完整配置

\`\`\`toml
[build-system]
requires = ["setuptools>=68", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "myproject"
version = "1.0.0"
description = "示例项目"
readme = "README.md"
requires-python = ">=3.12"
license = {text = "MIT"}
authors = [{name = "Alice", email = "alice@example.com"}]
dependencies = [
    "requests>=2.31",
    "pydantic>=2.0",
]

[project.optional-dependencies]
dev = ["pytest", "ruff", "mypy"]

[project.scripts]
myproject = "myproject.cli:main"

[tool.setuptools.packages.find]
where = ["src"]

[tool.ruff]
line-length = 88

[tool.mypy]
strict = true
\`\`\`

### 五、setup.py vs setup.cfg vs pyproject.toml 演进

| 时期 | 主流方式 | 状态 |
|------|---------|------|
| 2010s | setup.py | 已过时，仍兼容 |
| 2018 | setup.cfg + setup.py | 过渡方案 |
| 2023+ | pyproject.toml | **推荐**，PEP 621 标准 |

pyproject.toml 优势：
- 标准化（PEP 517/518/621）
- 配置集中（构建、依赖、工具配置都在一个文件）
- 不依赖 Python 执行（setup.py 需要执行 Python）

### 六、__init__.py 的作用

- **标记包**：告诉 Python 这是一个包
- **包初始化**：可放包级代码
- **控制导出**：\`__all__\` 控制 \`from package import *\`
- **便捷导出**：\`from .core import main\` 让用户写 \`from myproject import main\`

\`\`\`python
# src/myproject/__init__.py
from myproject.core import main, MyClass

__all__ = ["main", "MyClass"]
__version__ = "1.0.0"
\`\`\`

Python 3.3+ 支持**命名空间包**（无 __init__.py），但显式 __init__.py 更清晰。

### 七、模块分层：domain / application / infrastructure

借鉴 DDD（领域驱动设计）思想：

\`\`\`
src/myproject/
├── domain/            # 领域层：纯业务逻辑，无 IO
│   ├── models.py      # User, Order 等实体
│   └── services.py    # 业务规则
├── application/       # 应用层：用例编排
│   ├── use_cases.py   # 创建订单、查询用户
│   └── ports.py       # 接口定义（Repository ABC）
└── infrastructure/    # 基础设施：实现细节
    ├── db.py          # 数据库实现
    ├── api.py         # 外部 API 客户端
    └── config.py      # 配置加载
\`\`\`

依赖方向：**infrastructure → application → domain**。domain 不依赖任何外部，便于单元测试。

### 八、业务场景：从脚本到包的演进

1. **阶段一**：单文件 \`scraper.py\`，200 行
2. **阶段二**：拆分为 \`scraper/\` 包，分 \`fetcher.py\`、\`parser.py\`、\`storage.py\`
3. **阶段三**：引入 src layout，加 \`pyproject.toml\`，可 \`pip install\`
4. **阶段四**：分层 domain/application/infrastructure，写测试，发布到内网 PyPI

### 九、命名约定

| 类型 | 规范 | 示例 |
|------|------|------|
| 模块文件 | snake_case | \`user_service.py\` |
| 包名 | snake_case，短 | \`myproject\` |
| 类 | PascalCase | \`UserService\` |
| 函数/变量 | snake_case | \`get_user\` |
| 常量 | UPPER_SNAKE | \`MAX_RETRY\` |
| 私有 | 前缀下划线 | \`_internal\` |
| 测试文件 | test_ 前缀 | \`test_user.py\` |

> ⚠️ **避坑提示**：包名不要用连字符（\`my-project\`），用下划线（\`my_project\`）。连字符不能 import。

### 十、原理深入

src layout 之所以能防止隐式导入，是因为 Python 的 \`sys.path[0]\` 是当前目录：
- flat layout 下，根目录的 \`myproject/\` 会被加入 sys.path，import 直接命中源码
- src layout 下，根目录没有 \`myproject/\`，必须安装到 site-packages 才能 import

这保证了测试时 import 的是**安装版本**，与生产一致。

### 十一、最佳实践总结

- 新项目一律用 src layout
- 配置统一到 pyproject.toml（构建+工具）
- 分层：domain（纯逻辑）/ application（用例）/ infrastructure（IO）
- 命名遵循 PEP 8，包名用下划线
- 测试分 unit / integration，公共 fixture 放 conftest.py`,
    code: `# Python 项目结构概念演示：用纯 Python 演示项目结构与分层
# 不依赖第三方库，展示推荐的目录组织

print("=== Python 项目结构最佳实践演示 ===\\n")

print("--- 1. 单文件脚本结构 ---")
print("  适用场景：一次性任务、快速原型")
print("  文件：")
print("    hello.py")
print("  超过 300 行就该考虑拆分为包")

print("\\n--- 2. Flat Layout vs Src Layout ---")

flat_layout = """myproject/
├── myproject/          # 包直接在根目录
│   ├── __init__.py
│   └── core.py
├── tests/
└── setup.py"""

src_layout = """myproject/
├── src/                # 关键：多一层 src/
│   └── myproject/
│       ├── __init__.py
│       └── core.py
├── tests/
└── pyproject.toml"""

print("  Flat Layout（不推荐）：")
print(flat_layout)
print("\\n  Src Layout（推荐）：")
print(src_layout)

print("\\n--- 3. src layout 防止隐式导入演示 ---")

# 模拟 Python 的 sys.path 行为
def simulate_import(project_layout, cwd):
    """模拟在不同布局下，从项目根目录 import 的行为"""
    if project_layout == "flat" and cwd == "root":
        return ("源码目录", "直接 import 到本地源码，绕过安装版本")
    elif project_layout == "src" and cwd == "root":
        return ("无", "根目录无包，必须 pip install 后 import")
    return ("site-packages", "import 安装版本，行为一致")

scenarios = [
    ("flat", "root", "在根目录运行 python"),
    ("src", "root", "在根目录运行 python"),
]
print(f"  {'布局':<8} {'场景':<25} {'sys.path[0]':<15} {'行为'}")
for layout, cwd, scene in scenarios:
    path, behavior = simulate_import(layout, cwd)
    print(f"  {layout:<8} {scene:<25} {path:<15} {behavior}")

print("\\n  => src layout 强制先 pip install -e . ，保证测试与生产一致")

print("\\n--- 4. 推荐的完整项目结构 ---")

recommended = """myproject/
├── src/
│   └── myproject/
│       ├── __init__.py
│       ├── __main__.py        # python -m myproject
│       ├── cli.py             # 命令行入口
│       ├── domain/            # 领域层（纯逻辑）
│       │   ├── models.py
│       │   └── services.py
│       ├── application/       # 应用层（用例）
│       │   ├── use_cases.py
│       │   └── ports.py
│       └── infrastructure/    # 基础设施（IO）
│           ├── db.py
│           └── api.py
├── tests/
│   ├── conftest.py
│   ├── unit/
│   └── integration/
├── docs/
├── pyproject.toml
├── README.md
└── LICENSE"""
print(recommended)

print("\\n--- 5. 模块分层依赖方向演示 ---")

# 演示分层依赖：infrastructure -> application -> domain
layers = {
    "domain": {
        "依赖": "无（纯业务逻辑）",
        "内容": "User/Order 实体、业务规则",
        "测试": "无需 mock，纯单元测试",
    },
    "application": {
        "依赖": "domain",
        "内容": "用例编排、端口接口",
        "测试": "mock infrastructure 接口",
    },
    "infrastructure": {
        "依赖": "application（实现端口）",
        "内容": "数据库、外部 API、配置",
        "测试": "集成测试，连真实/测试 DB",
    },
}
print(f"  {'层级':<18} {'依赖方向':<28} {'测试方式'}")
for layer, info in layers.items():
    print(f"  {layer:<18} {info['依赖']:<28} {info['测试']}")

print("\\n  依赖方向：infrastructure → application → domain")
print("  domain 不依赖任何外部，最易测试")

print("\\n--- 6. pyproject.toml 关键配置项 ---")

config_items = [
    ("[build-system]", "构建后端（setuptools/hatch/poetry）"),
    ("[project]", "项目元数据（PEP 621）"),
    ("[project.scripts]", "命令行入口（pip install 后可用）"),
    ("[project.optional-dependencies]", "可选依赖（dev/test/docs）"),
    ("[tool.setuptools.packages.find]", "包发现配置（where=src）"),
    ("[tool.ruff]", "ruff linter/formatter 配置"),
    ("[tool.mypy]", "mypy 类型检查配置"),
    ("[tool.pytest.ini_options]", "pytest 配置"),
    ("[tool.coverage.run]", "覆盖率配置"),
]
print(f"  {'配置段':<40} {'说明'}")
for section, desc in config_items:
    print(f"  {section:<40} {desc}")

print("\\n--- 7. 命名约定速查 ---")

naming = [
    ("模块文件", "snake_case", "user_service.py"),
    ("包名", "snake_case，短", "myproject"),
    ("类", "PascalCase", "UserService"),
    ("函数/变量", "snake_case", "get_user"),
    ("常量", "UPPER_SNAKE", "MAX_RETRY"),
    ("私有", "前缀下划线", "_internal"),
    ("测试文件", "test_ 前缀", "test_user.py"),
]
print(f"  {'类型':<15} {'规范':<20} {'示例'}")
for t, rule, ex in naming:
    print(f"  {t:<15} {rule:<20} {ex}")

print("\\n  ⚠️ 避坑：包名不要用连字符（my-project），用下划线（my_project）")

print("\\n--- 8. 从脚本到包的演进路径 ---")

stages = [
    ("阶段1", "单文件 scraper.py", "200 行，一次性任务"),
    ("阶段2", "拆分为包 scraper/", "fetcher.py / parser.py / storage.py"),
    ("阶段3", "引入 src layout", "加 pyproject.toml，可 pip install"),
    ("阶段4", "分层 + 测试 + 发布", "domain/application/infrastructure，发布到 PyPI"),
]
for stage, structure, desc in stages:
    print(f"  {stage}: {structure}")
    print(f"        {desc}")

print("\\n=== 项目结构演示结束 ===")`
  },
  {
    id: "py6-docker",
    group: "工程实战补充",
    icon: "🐳",
    title: "Docker 容器化部署 Python 应用",
    content: `## Docker 容器化部署 Python 应用

### 一、为什么用 Docker

- **环境一致**：开发/测试/生产环境完全相同
- **隔离性**：每个应用独立运行，依赖不冲突
- **可移植**：一次构建，到处运行
- **易于部署**：镜像即制品，CI/CD 友好

### 二、Dockerfile 基础

\`\`\`dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["python", "-m", "myproject.server"]
\`\`\`

指令说明：
- FROM：基础镜像
- WORKDIR：工作目录
- COPY：复制文件
- RUN：构建时执行
- EXPOSE：声明端口（文档性质）
- CMD：容器启动命令

### 三、Python 镜像选择

| 镜像 | 大小 | 适用 |
|------|------|------|
| python:3.12 | ~900MB | 完整 Debian，含编译工具 |
| python:3.12-slim | ~150MB | 精简 Debian，**推荐** |
| python:3.12-alpine | ~50MB | Alpine，可能有 musl 兼容问题 |
| python:3.12-bookworm | ~900MB | 最新 Debian |

> 💡 **避坑提示**：alpine 用 musl libc，部分 Python 包（如 numpy、pandas）需重新编译，构建慢且可能出问题。生产环境优先用 slim。

### 四、多阶段构建

减小镜像体积，分离构建环境与运行环境：

\`\`\`dockerfile
# 阶段1：builder
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# 阶段2：runtime
FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
EXPOSE 8000
CMD ["python", "-m", "myproject.server"]
\`\`\`

好处：runtime 镜像不含编译工具，体积更小，攻击面更小。

### 五、requirements.txt 与 pip install

\`\`\`
# requirements.txt
fastapi==0.110.0
uvicorn[standard]==0.27.0
pydantic==2.6.0
\`\`\`

锁定版本保证可复现构建。生产建议用 \`pip-compile\`（pip-tools）生成锁定文件。

\`\`\`dockerfile
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
\`\`\`

\`--no-cache-dir\` 减小镜像体积（不缓存 pip 下载）。

### 六、.dockerignore

避免不必要文件进入镜像：

\`\`\`
.git
.venv
__pycache__
*.pyc
.pytest_cache
.mypy_cache
.ruff_cache
tests/
docs/
*.md
.env
\`\`\`

> ⚠️ **避坑提示**：忘记 .dockerignore 会导致 .git 进入镜像，体积暴涨且泄露敏感信息。

### 七、环境变量与配置

\`\`\`dockerfile
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV APP_ENV=production
\`\`\`

- PYTHONUNBUFFERED=1：日志实时输出（不缓冲），便于 docker logs 查看
- PYTHONDONTWRITEBYTECODE=1：不生成 .pyc，减小体积

运行时配置用 \`-e\` 或 docker-compose 注入：

\`\`\`bash
docker run -e DATABASE_URL=postgres://... myapp
\`\`\`

### 八、非 root 用户运行

默认容器以 root 运行，有安全风险：

\`\`\`dockerfile
RUN useradd -m -u 1000 appuser
USER appuser
\`\`\`

这样即使容器被攻破，攻击者也只有普通用户权限。

### 九、健康检查 HEALTHCHECK

\`\`\`dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1
\`\`\`

Docker 定期检查，失败则标记 unhealthy，编排系统（k8s/Swarm）可据此重启。

### 十、多容器：docker-compose

\`\`\`yaml
# docker-compose.yml
services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/app
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: pass
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "user"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  pgdata:
\`\`\`

\`docker compose up -d\` 一键启动 web + db。

### 十一、业务场景：Web 服务部署

FastAPI 应用示例：

\`\`\`dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN useradd -m -u 1000 appuser && chown -R appuser /app
USER appuser
EXPOSE 8000
HEALTHCHECK CMD python -c "import urllib.request;urllib.request.urlopen('http://localhost:8000/health')"
CMD ["uvicorn", "myproject.server:app", "--host", "0.0.0.0", "--port", "8000"]
\`\`\`

### 十二、原理深入

Docker 镜像采用**分层文件系统**（OverlayFS）：
- 每条 Dockerfile 指令生成一层
- 层可缓存复用，加速构建
- 多阶段构建只把最终阶段的层打包进镜像

容器本质是**受限的进程**：
- 用 namespace 隔离 PID/网络/文件系统
- 用 cgroup 限制 CPU/内存
- 共享宿主机内核，无需虚拟化开销

### 十三、最佳实践总结

- 基础镜像用 python:3.12-slim，慎用 alpine
- 多阶段构建分离 builder 与 runtime
- .dockerignore 必备，排除 .git/.venv/缓存
- 非 root 用户运行，减小攻击面
- PYTHONUNBUFFERED=1 保证日志实时
- HEALTHCHECK 让编排系统能感知健康状态
- 配置走环境变量，不写死在镜像里`,
    code: `# Docker 概念演示：用 Python 模拟 Dockerfile 解析与镜像构建流程
# 不依赖 Docker，演示容器化的核心概念

print("=== Docker 容器化部署 Python 应用演示 ===\\n")

print("--- 1. 模拟 Dockerfile 指令解析 ---")

# 模拟一个典型的 Dockerfile
dockerfile = [
    ("FROM", "python:3.12-slim", "基础镜像"),
    ("WORKDIR", "/app", "设置工作目录"),
    ("COPY", "requirements.txt .", "复制依赖文件"),
    ("RUN", "pip install -r requirements.txt", "安装依赖"),
    ("COPY", ". .", "复制源码"),
    ("ENV", "PYTHONUNBUFFERED=1", "环境变量"),
    ("EXPOSE", "8000", "声明端口"),
    ("HEALTHCHECK", "curl -f http://localhost:8000/health", "健康检查"),
    ("CMD", '["python", "-m", "myproject.server"]', "启动命令"),
]

print(f"  {'指令':<13} {'参数':<45} {'说明'}")
for cmd, args, desc in dockerfile:
    print(f"  {cmd:<13} {args:<45} {desc}")

print("\\n--- 2. 镜像选择对比 ---")

images = [
    ("python:3.12", "~900MB", "完整 Debian", "含编译工具，体积大"),
    ("python:3.12-slim", "~150MB", "精简 Debian", "推荐，平衡体积与兼容性"),
    ("python:3.12-alpine", "~50MB", "Alpine Linux", "musl libc 可能有兼容问题"),
    ("python:3.12-bookworm", "~900MB", "最新 Debian", "同 python:3.12"),
]
print(f"  {'镜像':<25} {'大小':<10} {'基础':<15} {'说明'}")
for img, size, base, note in images:
    print(f"  {img:<25} {size:<10} {base:<15} {note}")

print("\\n  ⚠️ alpine 装含 C 扩展的包（numpy/pandas）需重新编译，构建慢")

print("\\n--- 3. 多阶段构建演示 ---")

print("  阶段1：builder（含编译工具）")
builder_stage = [
    "FROM python:3.12-slim AS builder",
    "WORKDIR /app",
    "COPY requirements.txt .",
    "RUN pip install --user --no-cache-dir -r requirements.txt",
]
for line in builder_stage:
    print(f"    {line}")

print("\\n  阶段2：runtime（仅运行时）")
runtime_stage = [
    "FROM python:3.12-slim",
    "WORKDIR /app",
    "COPY --from=builder /root/.local /root/.local",
    "COPY . .",
    "USER appuser",
    "CMD ['python', '-m', 'myproject.server']",
]
for line in runtime_stage:
    print(f"    {line}")

print("\\n  => runtime 镜像不含编译工具，体积更小，攻击面更小")

print("\\n--- 4. 模拟镜像分层与缓存 ---")

# 模拟 Docker 分层构建
layers = []
layer_cache = {}

def build_step(instruction, content):
    """模拟一条 Dockerfile 指令生成一层"""
    key = f"{instruction}:{content}"
    if key in layer_cache:
        return f"CACHED（命中缓存）"
    layers.append(key)
    layer_cache[key] = True
    return f"新建层 #{len(layers)}"

steps = [
    ("FROM", "python:3.12-slim"),
    ("COPY", "requirements.txt"),
    ("RUN", "pip install -r requirements.txt"),
    ("COPY", "源码"),
]
print("  首次构建：")
for inst, content in steps:
    result = build_step(inst, content)
    print(f"    {inst} {content} -> {result}")

print("\\n  修改源码后重新构建（requirements.txt 未变）：")
# 模拟源码变更：前 3 层缓存命中，最后一层重建
for inst, content in steps[:3]:
    result = build_step(inst, content)
    print(f"    {inst} {content} -> {result}")
print(f"    {steps[3][0]} 源码（已修改） -> 新建层 #{len(layers)+1}")
print("\\n  => 把变化频率低的放前面，加速构建")

print("\\n--- 5. .dockerignore 演示 ---")

ignore_patterns = [
    ".git", ".venv", "__pycache__", "*.pyc",
    ".pytest_cache", ".mypy_cache", ".ruff_cache",
    "tests/", "docs/", "*.md", ".env",
]
print("  推荐 .dockerignore 内容：")
for p in ignore_patterns:
    print(f"    {p}")
print("\\n  ⚠️ 忘记 .dockerignore 会让 .git 进入镜像，体积暴涨且泄露信息")

print("\\n--- 6. 非 root 用户安全演示 ---")

print("  默认容器以 root 运行（UID 0），有安全风险")
print("  推荐配置：")
print("    RUN useradd -m -u 1000 appuser")
print("    USER appuser")
print("  => 即使容器被攻破，攻击者只有普通用户权限")

print("\\n--- 7. HEALTHCHECK 健康检查 ---")

import time

def simulate_health_check(interval=1, retries=3):
    """模拟 Docker 健康检查"""
    states = ["healthy", "healthy", "unhealthy", "healthy", "healthy"]
    for i, state in enumerate(states[:retries + 2]):
        print(f"    [{i*interval}s] 检查: {state}")
        if state == "unhealthy" and i >= retries - 1:
            print(f"    => 连续 {retries} 次失败，标记为 unhealthy")
            return
    print(f"    => 健康")

print("  模拟健康检查（每30s一次，连续3次失败才标记 unhealthy）：")
simulate_health_check()

print("\\n--- 8. docker-compose 多容器编排 ---")

compose = """services:
  web:
    build: .
    ports: ["8000:8000"]
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/app
    depends_on:
      db: {condition: service_healthy}

  db:
    image: postgres:16
    environment: {POSTGRES_PASSWORD: pass}
    volumes: ["pgdata:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "user"]

volumes:
  pgdata:"""
print(compose)
print("\\n  => docker compose up -d 一键启动 web + db")

print("\\n--- 9. 最佳实践总结 ---")
best = [
    "基础镜像用 python:3.12-slim，慎用 alpine",
    "多阶段构建分离 builder 与 runtime",
    ".dockerignore 必备，排除 .git/.venv/缓存",
    "非 root 用户运行，减小攻击面",
    "PYTHONUNBUFFERED=1 保证日志实时输出",
    "HEALTHCHECK 让编排系统感知健康状态",
    "配置走环境变量，不写死在镜像里",
]
for i, b in enumerate(best, 1):
    print(f"  {i}. {b}")

print("\\n=== Docker 演示结束 ===")`
  },
  {
    id: "py6-ci-cd",
    group: "工程实战补充",
    icon: "🔄",
    title: "CI/CD 持续集成与部署",
    content: `## CI/CD 持续集成与部署

### 一、CI/CD 概念

- **CI（Continuous Integration）持续集成**：代码提交后自动运行测试、lint、构建，尽早发现问题
- **CD（Continuous Delivery）持续交付**：CI 通过后自动打包制品，可一键部署
- **CD（Continuous Deployment）持续部署**：CI 通过后自动部署到生产，无需人工干预

三者关系：CI ⊂ 持续交付 ⊂ 持续部署。

### 二、典型流程

\`\`\`
代码提交 → lint → 单元测试 → 构建 → 集成测试 → 制品 → 部署预发 → 部署生产
\`\`\`

每一步失败都阻断后续，保证主分支质量。

### 三、GitHub Actions 工作流

\`\`\`yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.11", "3.12"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python-version }}
      - name: Install
        run: |
          pip install -e ".[dev]"
      - name: Lint
        run: ruff check .
      - name: Format check
        run: ruff format --check .
      - name: Type check
        run: mypy src/
      - name: Test
        run: pytest --cov --cov-report=xml
      - uses: codecov/codecov-action@v4
\`\`\`

关键概念：
- on：触发条件（push/PR/schedule）
- jobs：并行/串行任务
- matrix：多版本/多平台矩阵测试
- steps：具体步骤
- uses：复用他人发布的 Action

### 四、GitLab CI 配置

\`\`\`yaml
# .gitlab-ci.yml
stages:
  - lint
  - test
  - build
  - deploy

lint:
  stage: lint
  image: python:3.12
  script:
    - pip install ruff
    - ruff check .
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"

test:
  stage: test
  image: python:3.12
  script:
    - pip install -e ".[dev]"
    - pytest --cov
  coverage: '/TOTAL.*\\s+(\\d+%)$/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml

deploy:prod:
  stage: deploy
  script:
    - ./scripts/deploy.sh
  only:
    - main
  when: manual   # 手动确认部署
\`\`\`

### 五、缓存依赖加速

\`\`\`yaml
# GitHub Actions 缓存 pip
- uses: actions/setup-python@v5
  with:
    python-version: "3.12"
    cache: "pip"          # 自动缓存 ~/.cache/pip
    cache-dependency-path: requirements.txt
\`\`\`

\`\`\`yaml
# GitLab 缓存
test:
  cache:
    key:
      files:
        - requirements.txt
    paths:
      - .pip-cache
  variables:
    PIP_CACHE_DIR: "$CI_PROJECT_DIR/.pip-cache"
\`\`\`

缓存命中后，CI 时间可从 5 分钟降到 1 分钟。

### 六、矩阵测试（多 Python 版本）

\`\`\`yaml
strategy:
  fail-fast: false   # 一个失败不取消其他
  matrix:
    python-version: ["3.10", "3.11", "3.12", "3.13"]
    os: [ubuntu-latest, macos-latest, windows-latest]
\`\`\`

这会生成 4×3=12 个并行 job，覆盖多平台多版本。

### 七、自动发布到 PyPI

\`\`\`yaml
# .github/workflows/publish.yml
name: Publish

on:
  release:
    types: [published]   # GitHub Release 发布时触发

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - name: Build
        run: |
          pip install build
          python -m build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  publish:
    needs: build
    runs-on: ubuntu-latest
    environment: pypi   # 需手动审批
    permissions:
      id-token: write   # OIDC trusted publishing
    steps:
      - uses: actions/download-artifact@v4
        with: {name: dist, path: dist/}
      - uses: pypa/gh-action-pypi-publish@release/v1
\`\`\`

> 💡 **避坑提示**：用 **Trusted Publishing（OIDC）** 替代 API token，无需管理密钥，更安全。PyPI 已支持。

### 八、业务场景

#### 1. 开源项目

- PR 触发 CI：lint + test，必须全绿才能合并
- main 分支：自动构建文档、发布到 PyPI
- Release：手动打 tag，触发发布流程

#### 2. 团队项目

- 多环境部署：dev → staging → prod
- 数据库迁移：部署前自动跑 migration
- 蓝绿/金丝雀：渐进式发布，自动回滚

### 九、CI/CD 反模式

❌ **反模式**：
- CI 跑 30 分钟：开发者不愿等，绕过 CI
- 测试依赖外部服务：CI 不稳定，频繁红
- 主分支无保护：人人能直接 push，CI 形同虚设
- 部署需手动多步：人为操作易错

> ⚠️ **避坑提示**：CI 失败必须立即修复或回滚，不要让主分支长期红着，否则团队会习惯性忽略 CI。

### 十、原理深入

GitHub Actions 的执行模型：
- Runner 是临时虚拟机/容器，job 结束即销毁
- 每个 step 在同一 runner 内顺序执行
- artifact 跨 job 传递文件
- cache 跨 workflow 复用（同一分支/tag）

GitLab CI 类似，但 runner 可自托管，与 K8s 集成更深。

### 十一、工具对比

| 工具 | 优点 | 缺点 |
|------|------|------|
| GitHub Actions | 与 GitHub 深度集成，社区生态丰富 | 私有仓库有费用 |
| GitLab CI | 自托管免费，功能强大 | 需自建 runner |
| CircleCI | 并发强，配置灵活 | 免费额度有限 |
| Jenkins | 老牌，插件丰富 | 维护成本高 |

### 十二、最佳实践总结

- CI 流程：lint → type check → test → build，每步都设门禁
- 用 matrix 覆盖多 Python 版本与多 OS
- 缓存 pip 依赖，加速 CI
- 发布用 Trusted Publishing（OIDC），无需管理 token
- 主分支保护 + 必须通过 CI 才能合并
- CI 失败立即修复，不让主分支长期红`,
    code: `# CI/CD 概念演示：用 Python 模拟 CI/CD 流水线
# 不依赖 CI 工具，演示持续集成与部署的核心流程

print("=== CI/CD 持续集成与部署概念演示 ===\\n")

print("--- 1. CI/CD 概念与关系 ---")

concepts = [
    ("CI", "持续集成", "提交后自动 lint + test + build"),
    ("CD", "持续交付", "CI 通过后自动打包制品，可一键部署"),
    ("CD", "持续部署", "CI 通过后自动部署到生产，无需人工"),
]
print(f"  {'缩写':<5} {'全称':<10} {'说明'}")
for abbr, full, desc in concepts:
    print(f"  {abbr:<5} {full:<10} {desc}")
print("\\n  关系：CI ⊂ 持续交付 ⊂ 持续部署")

print("\\n--- 2. 模拟 CI 流水线 ---")

# 模拟 CI 流水线的各个阶段
pipeline_stages = [
    ("checkout", "拉取代码", True),
    ("install", "安装依赖 (pip install -e .[dev])", True),
    ("lint", "ruff check .", True),
    ("format", "ruff format --check .", True),
    ("typecheck", "mypy src/", True),
    ("test", "pytest --cov", True),
    ("build", "python -m build", True),
]

print("  模拟 GitHub Actions / GitLab CI 执行：")
all_passed = True
for stage, desc, passed in pipeline_stages:
    status = "✓ PASS" if passed else "✗ FAIL"
    print(f"  [{stage:<10}] {desc:<40} {status}")
    if not passed:
        all_passed = False
        print(f"  => 阶段 {stage} 失败，阻断后续，CI 标红")
        break

print(f"\\n  CI 结果: {'全部通过，可合并 PR' if all_passed else '失败，需修复'}")

print("\\n--- 3. 模拟矩阵测试（多版本） ---")

matrix = {
    "python": ["3.10", "3.11", "3.12", "3.13"],
    "os": ["ubuntu-latest", "macos-latest", "windows-latest"],
}

print(f"  矩阵配置: {matrix}")
total_jobs = len(matrix["python"]) * len(matrix["os"])
print(f"  生成并行 job 数: {total_jobs}")

# 模拟矩阵执行结果
print("\\n  执行结果矩阵：")
print(f"  {'Python':<10} {'Ubuntu':<12} {'macOS':<12} {'Windows':<12}")
for py in matrix["python"]:
    results = []
    for os_name in matrix["os"]:
        # 模拟 windows + 3.10 偶发失败
        if py == "3.10" and os_name == "windows-latest":
            results.append("✗ FAIL")
        else:
            results.append("✓ PASS")
    print(f"  {py:<10} {results[0]:<12} {results[1]:<12} {results[2]:<12}")

print("\\n  fail-fast: false 时，一个失败不取消其他")

print("\\n--- 4. 模拟缓存加速效果 ---")

import time

# 模拟有/无缓存的安装耗时
def simulate_install(use_cache):
    """模拟 pip install 耗时"""
    if use_cache:
        return 0.3  # 缓存命中，秒装
    return 5.0      # 无缓存，下载+编译

no_cache = simulate_install(False)
with_cache = simulate_install(True)
print(f"  无缓存 pip install: {no_cache:.1f}s")
print(f"  有缓存 pip install: {with_cache:.1f}s")
print(f"  提速: {no_cache/with_cache:.1f}x")

print("\\n  GitHub Actions 缓存配置：")
print("    - uses: actions/setup-python@v5")
print("      with:")
print("        python-version: '3.12'")
print("        cache: 'pip'  # 自动缓存'")

print("\\n--- 5. 模拟自动发布到 PyPI ---")

# 模拟发布流程
release_steps = [
    ("触发", "GitHub Release published", True),
    ("build", "python -m build 生成 dist/", True),
    ("upload-artifact", "上传 dist/ 作为 artifact", True),
    ("download-artifact", "下载 artifact 到 publish job", True),
    ("publish", "pypa/gh-action-pypi-publish 发布", True),
]
print("  触发条件：GitHub Release published")
for step, desc, ok in release_steps:
    print(f"  [{step:<20}] {desc}")
print("\\n  推荐用 Trusted Publishing (OIDC)，无需管理 API token")

print("\\n--- 6. GitHub Actions vs GitLab CI 对比 ---")

comparison = [
    ("GitHub Actions", "与 GitHub 深度集成", "私有仓库有费用", "社区生态丰富"),
    ("GitLab CI", "自托管免费", "需自建 runner", "与 K8s 集成深"),
    ("CircleCI", "并发强", "免费额度有限", "配置灵活"),
    ("Jenkins", "老牌插件多", "维护成本高", "可极端定制"),
]
print(f"  {'工具':<18} {'优点':<22} {'缺点':<18} {'特点'}")
for tool, pro, con, feat in comparison:
    print(f"  {tool:<18} {pro:<22} {con:<18} {feat}")

print("\\n--- 7. 模拟多环境部署流程 ---")

environments = [
    ("dev", "自动部署", "提交到 main 即触发"),
    ("staging", "自动部署", "dev 通过后自动"),
    ("prod", "手动确认", "staging 验证后人工触发"),
]
print(f"  {'环境':<10} {'部署方式':<12} {'触发条件'}")
for env, method, trigger in environments:
    print(f"  {env:<10} {method:<12} {trigger}")

print("\\n  部署前通常先跑数据库迁移：")
print("    deploy -> run migrations -> health check -> switch traffic")

print("\\n--- 8. CI/CD 反模式提示 ---")

antipatterns = [
    "✗ CI 跑 30 分钟：开发者不愿等，绕过 CI",
    "✗ 测试依赖外部服务：CI 不稳定，频繁红",
    "✗ 主分支无保护：人人能直接 push",
    "✗ 部署需手动多步：人为操作易错",
    "✗ CI 失败不修复：团队习惯性忽略 CI",
]
for ap in antipatterns:
    print(f"  {ap}")

print("\\n--- 9. 推荐的 GitHub Actions 工作流骨架 ---")

workflow = """name: CI
on:
  push: {branches: [main]}
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix: {python-version: ['3.11', '3.12']}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python-version }}
          cache: pip
      - run: pip install -e ".[dev]"
      - run: ruff check .
      - run: ruff format --check .
      - run: mypy src/
      - run: pytest --cov"""
print(workflow)

print("\\n--- 10. 最佳实践总结 ---")
best = [
    "CI 流程：lint -> type check -> test -> build，每步设门禁",
    "用 matrix 覆盖多 Python 版本与多 OS",
    "缓存 pip 依赖，加速 CI",
    "发布用 Trusted Publishing (OIDC)，无需管理 token",
    "主分支保护 + 必须通过 CI 才能合并",
    "CI 失败立即修复，不让主分支长期红",
]
for i, b in enumerate(best, 1):
    print(f"  {i}. {b}")

print("\\n=== CI/CD 演示结束 ===")`
  }
];
