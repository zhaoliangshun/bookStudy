// =============================================================
// Batch 9：异常处理（4 章）
// 33. py4-try           try/except/else/finally
// 34. py4-custom-exc    自定义异常、raise、异常链
// 35. py4-exc-chain      异常链、assert、ExceptionGroup（3.11+）
// 36. py4-context        with 上下文管理器、__enter__/__exit__
// =============================================================

export const chapters = [
  {
    id: "py4-try",
    group: "异常处理",
    icon: "🛡️",
    title: "try/except/else/finally",
    content: `
- \`try\`：包裹可能出错的代码
- \`except X as e\`：捕获特定异常
- 多个 except：从具体到宽泛排列
- \`else\`：无异常时执行
- \`finally\`：无论如何都执行（清理资源）
- 常见异常：\`ValueError / TypeError / KeyError / IndexError / ZeroDivisionError\`
`,
    code: `def divide(a, b):
    try:
        result = a / b
    except ZeroDivisionError as e:
        print("除零错误:", e)
        return None
    except (TypeError, ValueError) as e:
        print("类型/值错误:", e)
        return None
    else:
        print("正常执行")
        return result
    finally:
        print("finally: 清理资源")

print(divide(10, 2))
print("---")
print(divide(10, 0))
print("---")
print(divide("a", 2))

# 常见异常演示
errors = [
    (lambda: 1 / 0,        "ZeroDivisionError"),
    (lambda: int("abc"),    "ValueError"),
    (lambda: [1, 2][10],    "IndexError"),
    (lambda: {"a": 1}["b"], "KeyError"),
]
for fn, name in errors:
    try:
        fn()
    except Exception as e:
        print(f"{name}: {e}")
`,
  },
  {
    id: "py4-custom-exc",
    group: "异常处理",
    icon: "🔥",
    title: "自定义异常、raise、异常链",
    content: `
- 自定义异常：继承 \`Exception\`（或 \`ValueError\` 等具体类）
- \`raise\`：主动抛异常
- \`raise X from Y\`：链式异常（保留原始异常信息）
- 异常可带自定义属性（如错误码、数据）
`,
    code: `# 自定义异常
class InsufficientFundsError(Exception):
    def __init__(self, balance, amount):
        super().__init__(f"余额 {balance} 不足，需要 {amount}")
        self.balance = balance
        self.deficit = amount - balance

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFundsError(balance, amount)
    return balance - amount

try:
    withdraw(100, 200)
except InsufficientFundsError as e:
    print("异常:", e)
    print("deficit:", e.deficit)

# raise from：异常链
def parse_age(s):
    try:
        n = int(s)
        if n < 0:
            raise ValueError("age 不能为负")
        return n
    except ValueError as e:
        raise RuntimeError(f"解析 age 失败: {s!r}") from e

try:
    parse_age("-5")
except RuntimeError as e:
    print("外层异常:", e)
    print("原始异常:", e.__cause__)

# 带错误码的异常
class APIError(Exception):
    def __init__(self, code, message):
        super().__init__(f"[{code}] {message}")
        self.code = code

try:
    raise APIError(404, "Not Found")
except APIError as e:
    print("code:", e.code, "msg:", e)
`,
  },
  {
    id: "py4-exc-chain",
    group: "异常处理",
    icon: "⛓️",
    title: "异常链、assert、ExceptionGroup",
    content: `
- \`raise X from Y\`：保留原始异常链
- \`e.__cause__\` 查看原始异常，\`e.__context__\` 查看隐式链
- \`assert cond, msg\`：开发期断言（\`python -O\` 可关闭）
- \`ExceptionGroup\`（3.11+）：同时抛多个异常
- \`except* ExcType\`（3.11+）：匹配组内所有 ExcType
`,
    code: `# assert：开发期断言
def sqrt(x):
    assert x >= 0, "x 必须非负"
    return x ** 0.5

print(sqrt(9))
# sqrt(-1)  # AssertionError

# ExceptionGroup（3.11+）
try:
    raise ExceptionGroup("多错误", [
        ValueError("bad value"),
        TypeError("bad type"),
        KeyError("missing"),
    ])
except* ValueError as eg:
    print("捕获 ValueError:", eg.exceptions)
except* (TypeError, KeyError) as eg:
    print("捕获 TypeError/KeyError:", eg.exceptions)

# 拆解 ExceptionGroup
full = ExceptionGroup("outer", [
    ValueError("v1"),
    ExceptionGroup("inner", [ValueError("v2"), TypeError("t1")]),
    TypeError("t2"),
    KeyError("k1"),
])
val_sub = full.subgroup(ValueError)
type_sub = full.subgroup(TypeError)
print("ValueError 子组:", val_sub.exceptions)
print("TypeError 子组:", type_sub.exceptions)
# 拆分
match, rest = full.split((ValueError, TypeError))
print("匹配:", match.exceptions)
print("剩余:", rest.exceptions)
`,
  },
  {
    id: "py4-context",
    group: "异常处理",
    icon: "🔒",
    title: "with 上下文管理器",
    content: `
- 协议：实现 \`__enter__\`（返回资源）和 \`__exit__\`（释放）
- \`with\` 语句：进入调 \`__enter__\`，离开调 \`__exit__\`（即使异常）
- \`contextlib.contextmanager\`：把生成器装饰成上下文
- \`contextlib.ExitStack\`：动态管理多个上下文
- 应用：文件、锁、事务、计时、临时目录
`,
    code: `import time, contextlib, os, tempfile

# 1) 类实现上下文管理器
class Timer:
    def __enter__(self):
        self.t0 = time.perf_counter()
        return self
    def __exit__(self, exc_type, exc, tb):
        self.elapsed = time.perf_counter() - self.t0
        print(f"[Timer] cost {self.elapsed:.6f}s")
        return False   # 不吞异常

with Timer() as t:
    time.sleep(0.05)
print("outside:", round(t.elapsed, 4))

# 2) @contextmanager：生成器实现
@contextlib.contextmanager
def temp_chdir(path):
    old = os.getcwd()
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(old)

with temp_chdir("/tmp"):
    print("in with, cwd:", os.getcwd())
print("after, cwd:", os.getcwd())

# 3) 抑制异常
@contextlib.contextmanager
def suppress(*excs):
    try:
        yield
    except excs as e:
        print("suppressed:", e)

with suppress(ValueError, KeyError):
    int("abc")   # 异常被吞掉
print("继续运行")

# 4) ExitStack：动态管理多个上下文
with tempfile.TemporaryDirectory() as tmp:
    paths = []
    for i in range(3):
        p = os.path.join(tmp, f"f{i}.txt")
        with open(p, "w") as f:
            f.write(f"file {i}")
        paths.append(p)
    with contextlib.ExitStack() as stack:
        files = [stack.enter_context(open(p)) for p in paths]
        print("contents:", [f.read().strip() for f in files])
`,
  },
];