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
## 概述
本章覆盖 Python 异常处理的基础四段式结构 try/except/else/finally，以及多 except 分支的匹配规则与常见内置异常层级，是写出健壮代码的基石。

## 核心要点
- **try 块**：放置可能抛出异常的代码，只包含"可能失败"的最小范围
- **except 块**：\`except SomeError as e:\` 捕获特定类型，可同时指定多个：\`except (IndexError, KeyError):\`
- **else 块**：仅当 try 块无异常时执行，用于把"成功路径"代码移出 try，避免误捕获
- **finally 块**：无论是否异常都执行，常用于关闭文件、释放锁、断开连接
- **多 except 顺序**：先具体后一般，匹配到第一个就停止；\`except Exception\` 必须放最后
- **as 绑定**：\`except ValueError as e:\` 把异常对象绑定到 e，可访问 \`.args\`、\`str(e)\`
- **异常继承层级**：BaseException → Exception → ValueError/KeyError 等；\`KeyboardInterrupt\` 继承 BaseException 不会被 \`except Exception\` 捕获
- **常见内置异常**：\`ValueError\`（值类型对但不合法）、\`TypeError\`（类型不对）、\`IndexError\`/\`KeyError\`（容器越界/缺键）、\`FileNotFoundError\`、\`ZeroDivisionError\`、\`AttributeError\`
- **异常即对象**：\`type(e).__name__\` 获取类型名，\`e.args\` 获取参数元组

## 原理与机制
- **控制流跳转**：异常抛出后，解释器沿调用栈向上查找匹配的 except，未匹配则程序终止并打印 traceback
- **else 设计意图**：避免把后续逻辑也放进 try 而被意外捕获，让"成功代码"显式分离
- **finally 总会执行**：即使 try/except 中有 return，finally 也会在返回前执行；finally 中的 return 会覆盖之前的返回值
- **异常匹配按继承**：\`except Exception\` 能捕获所有 Exception 子类，但捕获 \`BaseException\` 是反模式

## 易错点与陷阱
- **顺序反了**：把 \`except Exception\` 放在具体异常前面，后面的具体分支永远不会执行（SyntaxWarning）
- **裸 except**：\`except:\` 会捕获所有异常包括 \`SystemExit\`/\`KeyboardInterrupt\`，应改用 \`except Exception:\`
- **finally 中 return**：会吞掉 try 中已抛出的异常，导致问题被掩盖
- **捕获后忽略**：\`except: pass\` 把错误静默掉，难以排查；至少要 log

## 实战建议
- **最小化 try 范围**：只包裹真正可能失败的代码，便于精确定位问题
- **优先捕获具体类型**：避免 \`except Exception\` 笼统捕获，保留可调试信息
- **资源用 with**：文件、锁优先用 \`with\` 而非 try/finally，更简洁安全
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
## 概述
本章介绍主动抛出异常的 raise 语句、异常链机制 raise X from Y，以及如何设计自定义异常类层次，是构建清晰错误处理体系的关键。

## 核心要点
- **raise**：\`raise ValueError("msg")\` 主动抛出；\`raise\` 单独使用可在 except 块内重新抛出当前异常
- **自定义异常**：\`class MyError(Exception):\` 继承 Exception，可扩展属性：\`def __init__(self, code, msg):\`
- **raise X from Y**：显式建立异常链，Y 成为 X 的 \`__cause__\`，traceback 显示 "The above exception was the direct cause of..."
- **raise from None**：\`raise RuntimeError("...") from None\` 抑制异常链，\`__cause__\` 设为 None，traceback 不显示上下文
- **隐式上下文**：except 块内抛新异常时，原异常自动存入 \`__context__\`，traceback 显示 "During handling of the above exception..."
- **异常类设计**：业务异常应有清晰继承层次，如 \`AppError → DatabaseError → ConnectionError\`
- **构造参数**：\`super().__init__(msg)\` 调用父类，自定义属性可在 except 中访问

## 原理与机制
- **__cause__ vs __context__**：前者由 \`from\` 显式设置，后者由解释器在异常处理中自动设置；\`__suppress_context__\` 控制是否显示
- **异常对象属性**：\`.args\` 元组、\`.__traceback__\`、\`.__cause__\`、\`.__context__\`、\`.__notes__\`（3.11+）
- **raise 重新抛出**：bare \`raise\` 保留原 traceback；\`raise e\` 也保留，但 \`raise type(e)(str(e))\` 会丢失原始 traceback
- **from 语义**：\`raise X from Y\` 表达"X 由 Y 直接引起"，比隐式 \`__context__\` 更明确意图

## 易错点与陷阱
- **from None 滥用**：用 \`from None\` 隐藏真实原因会让运维难以定位，仅在确实需要对外隔离实现细节时使用
- **吞掉再抛**：\`except: raise RuntimeError("失败")\` 丢失原始信息，应 \`raise RuntimeError("失败") from e\`
- **自定义异常不调 super**：忘记 \`super().__init__(...)\` 导致 \`.args\` 为空，str(e) 异常
- **过深继承**：自定义异常层级过深增加维护成本，2-3 层足够

## 实战建议
- **业务异常分层**：顶层 \`AppError\`，按模块分子类（\`DBError\`、\`AuthError\`），便于统一捕获
- **保留异常链**：转换异常时默认用 \`from e\`，除非有意隐藏
- **携带上下文**：自定义异常带 \`code\`、\`details\` 等结构化字段，方便前端/日志处理
`,
    code: `class InsufficientFundsError(Exception):
    def __init__(self, balance, amount):
        self.balance = balance
        self.amount = amount
        super().__init__(f"余额不足：{balance} < {amount}")

class InvalidAmountError(ValueError):
    pass

def withdraw(balance, amount):
    if amount < 0:
        raise InvalidAmountError(f"金额不能为负：{amount}")
    if amount > balance:
        raise InsufficientFundsError(balance, amount)
    return balance - amount

try:
    withdraw(100, 150)
except InsufficientFundsError as e:
    print(f"业务异常：{e}")

def process_payment():
    try:
        withdraw(50, -10)
    except InvalidAmountError as e:
        raise RuntimeError("支付失败") from e

try:
    process_payment()
except RuntimeError as e:
    print(f"捕获：{e}")
    print(f"  原因：{e.__cause__}")

print("异常链演示完成")
`,
  },
  {
    id: "py5-exceptiongroup",
    group: "异常处理",
    icon: "📦",
    title: "ExceptionGroup 与 except*",
    content: `
## 概述
本章覆盖 Python 3.11+ 引入的 ExceptionGroup 与 except* 语法（PEP 654），以及 add_note() 异常注释机制（PEP 678），用于在并发验证等场景中收集并处理多个异常。

## 核心要点
- **ExceptionGroup**（3.11+）：\`raise ExceptionGroup("msg", [e1, e2, e3])\` 一次性抛出多个异常
- **BaseExceptionGroup vs ExceptionGroup**：前者可包含 BaseException（如 \`KeyboardInterrupt\`），后者只能装 Exception 子类；\`.split()\`/\`.subgroup()\` 按类型拆分
- **except\***（3.11+）：\`except* TypeError as eg:\` 选择性处理组中匹配类型的异常，eg 是 ExceptionGroup
- **多 except\***：可连续写多个 \`except* A\` / \`except* B\`，各自处理组内对应类型的异常
- **add_note()**（3.11+，PEP 678）：\`e.add_note("extra info")\` 为异常追加注释，不修改异常类型与消息
- **__notes__ 属性**：注释存储在 \`e.__notes__\` 列表，traceback 末尾以 "Notes:" 形式展示
- **未匹配异常重抛**：except* 未处理的异常会自动组成新的 ExceptionGroup 重新抛出

## 原理与机制
- **eg.exceptions**：except* 绑定的对象是 ExceptionGroup，\`.exceptions\` 是包含的异常列表
- **空组省略**：若某类型在组中无匹配，对应 except* 不执行；所有 except* 处理完则组被消化
- **add_note 不可逆**：注释一旦添加无法撤销，但可直接修改 \`e.__notes__\` 列表
- **PEP 654 动机**：asyncio.TaskGroup、concurrent.futures 等并发场景需把多个任务错误一起汇报，避免一个失败掩盖其他

## 易错点与陷阱
- **except 与 except\* 混用**：同一 try 块不能同时使用 \`except\` 和 \`except*\`，会 SyntaxError
- **单个异常也包成组**：except* 捕获时 eg 可能只含 1 个异常，但仍是 ExceptionGroup，需用 \`eg.exceptions[0]\` 取
- **未捕获会重抛**：以为 except* 捕获了所有，实际未匹配类型会组成新组向上传播
- **add_note 滥用**：注释不是替代日志，应只放与异常本身强相关的诊断信息

## 实战建议
- **批量验证用 ExceptionGroup**：表单校验、多字段检查时收集所有错误一次返回，比遇第一个就停更友好
- **add_note 加上下文**：抛出前用 \`add_note\` 记录当时输入值、调用参数，便于事后排查
- **TaskGroup 优先**：3.11+ 并发用 \`asyncio.TaskGroup\`，它会自动把子任务异常组装成 ExceptionGroup
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
## 概述
本章覆盖 with 语句与上下文管理器协议（__enter__/__exit__）、@contextmanager 装饰器、contextlib.suppress 等工具，是 Python 资源管理（RAII 模式）的核心机制。

## 核心要点
- **with 语句**：\`with open(path) as f:\` 自动管理资源获取与释放，无论是否异常都保证清理
- **__enter__**：进入 with 块时调用，返回值绑定到 as 变量
- **__exit__**：\`def __exit__(self, exc_type, exc_val, tb):\` 退出时调用，三个参数为异常信息（无异常则全为 None）
- **__exit__ 返回 True**：抑制 with 块内抛出的异常，使其不再传播；返回 None/False 则继续抛出
- **@contextmanager**：\`from contextlib import contextmanager\`，把生成器函数转为上下文管理器，\`yield\` 前后分别对应 enter/exit
- **contextlib.suppress**：\`with suppress(FileNotFoundError):\` 优雅地忽略指定异常，等价于空 except
- **contextlib.ExitStack**：动态管理多个上下文，\`with ExitStack() as stack:\` 可在循环中 \`stack.enter_context(cm)\`

## 原理与机制
- **协议调用顺序**：\`__enter__\` → with 块代码 → \`__exit__\`（无论是否异常）；异常时 \`__exit__\` 收到异常三元组
- **生成器方案**：@contextmanager 用生成器实现，yield 之前是 enter，yield 之后是 exit；with 块抛异常会在 yield 处抛入生成器
- **异步版本**：\`async with\` 配合 \`__aenter__\`/\`__aexit__\`，@asynccontextmanager 用于 async 生成器
- **抑制异常的代价**：\`__exit__\` 返回 True 会吞掉异常，可能掩盖真实问题，需谨慎

## 易错点与陷阱
- **__exit__ 忘记返回值**：默认返回 None（falsy），异常会继续传播；想抑制必须显式 \`return True\`
- **生成器未处理 yield 异常**：@contextmanager 中 yield 后未 try/except，with 块抛异常会导致 GeneratorExit 警告
- **suppress 过宽**：\`suppress(Exception)\` 会吞掉所有异常包括编程错误，应只 suppress 预期的具体类型
- **嵌套 with 资源顺序**：\`with A() as a, B() as b:\` 等价于嵌套，退出顺序与进入相反，B 先于 A 关闭

## 实战建议
- **资源即用即关**：文件、锁、数据库连接、socket 一律用 with，杜绝忘记 close
- **简单场景用 @contextmanager**：不想写类时，用生成器函数 + 装饰器更简洁
- **__exit__ 中区分异常**：根据 exc_type 决定是否回滚事务，正常提交、异常回滚
`,
    code: `from contextlib import contextmanager, suppress

class DB:
    def __init__(self, name):
        self.name = name
        self.connected = False
    def __enter__(self):
        print(f"连接：{self.name}")
        self.connected = True
        return self
    def __exit__(self, exc_type, exc_val, tb):
        print("关闭连接")
        self.connected = False
        return bool(exc_type)
    def query(self, sql):
        return [{"id": 1}]

with DB("test.db") as db:
    print(f"结果：{db.query('SELECT 1')}")
    raise ValueError("模拟错误")
print("connected =", db.connected)

@contextmanager
def tag(name):
    print(f"<{name}>")
    yield
    print(f"</{name}>")

with tag("h1"):
    print("Hello")

with suppress(FileNotFoundError):
    open("/missing.txt")
print("完成")
`,
  },
];
