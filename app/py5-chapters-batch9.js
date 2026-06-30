// =============================================================
// Batch 9：异常处理（4 章）
// 1. py5-try              try/except/else/finally、多 except、常见内置异常
// 2. py5-raise            raise、自定义异常、异常链 raise X from Y
// 3. py5-exceptiongroup   ExceptionGroup / except* / add_note()（3.11+）
// 4. py5-context          with、上下文管理器、@contextmanager、suppress
// =============================================================

export const chapters = [
  {
    id: "py5-try",
    group: "异常处理",
    icon: "🎯",
    title: "try/except/else/finally",
    content: `
- **try 块**：放置可能抛出异常的代码
- **except 块**：捕获并处理特定异常类型，可指定多个
- **else 块**：仅当 try 块没有异常时执行
- **finally 块**：无论是否发生异常都执行（常用于清理资源）
- **多 except 顺序**：先具体后一般，匹配到第一个就停止
- **常见内置异常**：\`ValueError\`, \`TypeError\`, \`IndexError\`, \`KeyError\`, \`FileNotFoundError\`, \`ZeroDivisionError\`
`,
    code: `def safe_divide(a, b):
    try:
        result = a / b
    except ZeroDivisionError:
        print(f"错误：不能除以零 (a={a}, b={b})")
        return None
    except TypeError as e:
        print(f"类型错误：{e}")
        return None
    else:
        print(f"计算成功：{a} / {b} = {result}")
        return result
    finally:
        print("  [finally] 资源清理")

safe_divide(10, 2)
print()
safe_divide(10, 0)
print()
safe_divide("10", 2)
print()

try:
    nums = [1, 2, 3]
    print(nums[5])
except (IndexError, KeyError) as e:
    print(f"索引/键错误：{type(e).__name__}: {e}")
except Exception as e:
    print(f"其他异常：{type(e).__name__}: {e}")
else:
    print("没有异常发生")
finally:
    print("[finally] 清理完成")
`,
  },
  {
    id: "py5-raise",
    group: "异常处理",
    icon: "🚨",
    title: "raise 与自定义异常",
    content: `
- **raise**：主动抛出异常
- **raise X from Y**：异常链，保留原始异常上下文（\`__cause__\`）
- **自定义异常**：继承 \`Exception\` 类创建业务异常类
- **raise from None**：抑制异常链，不显示原始异常
- 异常链有助于调试时追踪根本原因
`,
    code: `class InsufficientFundsError(Exception):
    def __init__(self, balance, amount):
        self.balance = balance
        self.amount = amount
        super().__init__(f"余额不足：账户余额 {balance}，需要 {amount}")

class InvalidAmountError(ValueError):
    pass

def withdraw(balance, amount):
    if amount < 0:
        raise InvalidAmountError(f"金额不能为负数：{amount}")
    if amount > balance:
        raise InsufficientFundsError(balance, amount)
    return balance - amount

try:
    new_bal = withdraw(100, 150)
except InsufficientFundsError as e:
    print(f"业务异常：{e}")
    print(f"  差额：{e.amount - e.balance}")

print()

def process_payment():
    try:
        withdraw(50, -10)
    except InvalidAmountError as e:
        raise RuntimeError("支付处理失败") from e

try:
    process_payment()
except RuntimeError as e:
    print(f"捕获异常：{e}")
    print(f"  原因链 (__cause__)：{e.__cause__}")

print()
print("异常链演示完成")
`,
  },
  {
    id: "py5-exceptiongroup",
    group: "异常处理",
    icon: "📦",
    title: "ExceptionGroup 与 except*",
    content: `
- **ExceptionGroup**（3.11+）：同时收集多个异常并一起抛出
- **except\***（3.11+）：选择性地处理 ExceptionGroup 中匹配类型的异常
- **add_note()**（3.11+）：为异常添加注释信息，不修改异常本身
- 未匹配的异常会被重新抛出，继续传播
- 适合并发场景中收集多个任务的错误
`,
    code: `def validate_inputs(data):
    errors = []
    if not isinstance(data.get("name"), str):
        e = TypeError("name 必须是字符串")
        e.add_note(f"当前类型：{type(data.get('name')).__name__}")
        errors.append(e)
    if data.get("age", 0) < 0:
        e = ValueError("age 不能为负数")
        e.add_note(f"当前值：{data.get('age')}")
        errors.append(e)
    if len(data.get("email", "")) < 3:
        e = ValueError("email 太短（至少3字符）")
        errors.append(e)
    if errors:
        raise ExceptionGroup("输入验证失败", errors)

try:
    validate_inputs({"name": 123, "age": -5, "email": "a"})
except* TypeError as eg:
    print(f"捕获 {len(eg.exceptions)} 个 TypeError:")
    for err in eg.exceptions:
        print(f"  - {err}")
        if hasattr(err, "__notes__"):
            for note in err.__notes__:
                print(f"    注释：{note}")
except* ValueError as eg:
    print(f"捕获 {len(eg.exceptions)} 个 ValueError:")
    for err in eg.exceptions:
        print(f"  - {err}")
        if hasattr(err, "__notes__"):
            for note in err.__notes__:
                print(f"    注释：{note}")

print()
print("ExceptionGroup 处理完成")
`,
  },
  {
    id: "py5-context",
    group: "异常处理",
    icon: "🔐",
    title: "with 语句与上下文管理器",
    content: `
- **with 语句**：确保资源被正确获取和释放（RAII 模式）
- **类-based 上下文管理器**：实现 \`__enter__\` 和 \`__exit__\` 方法
- **@contextmanager**：使用 contextlib 将生成器转换为上下文管理器
- **contextlib.suppress**：优雅地忽略指定异常
- \`__exit__\` 返回 True 可抑制异常传播
`,
    code: `from contextlib import contextmanager, suppress

class DatabaseConnection:
    def __init__(self, dsn):
        self.dsn = dsn
        self.connected = False
    def __enter__(self):
        print(f"连接数据库：{self.dsn}")
        self.connected = True
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        print(f"关闭数据库连接")
        self.connected = False
        if exc_type:
            print(f"  异常被抑制：{exc_val}")
            return True
        return False
    def query(self, sql):
        print(f"  执行SQL：{sql}")
        return [{"id": 1}]

with DatabaseConnection("sqlite:///test.db") as db:
    rows = db.query("SELECT 1")
    print(f"  结果：{rows}")
    raise ValueError("模拟错误")
print("  connected =", db.connected)

@contextmanager
def tag(name):
    print(f"<{name}>")
    yield
    print(f"</{name}>")

with tag("body"):
    print("  内容")

with suppress(FileNotFoundError):
    open("/nonexistent_file.txt")
print("suppress 后继续执行")
`,
  },
];
