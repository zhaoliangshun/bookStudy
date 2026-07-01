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
## 一、概念解释

异常（Exception）是程序运行时发生的错误信号。Python 用 \`try\` 语句把"可能出错"的代码包裹起来，用 \`except\` 捕获并处理，用 \`else\` 放"成功路径"代码，用 \`finally\` 做"善后清理"。这套机制让正常逻辑与错误处理逻辑分离，代码更清晰、更健壮。

- \`try\`：包裹"可能出错"的代码块
- \`except X as e\`：捕获特定类型 X 的异常，绑定到变量 e
- \`else\`：try 块没有抛出任何异常时才执行
- \`finally\`：无论是否异常、是否 return，都会执行

## 二、设计原理

异常处理遵循 **EAFP**（Easier to Ask Forgiveness than Permission，请求宽恕比许可更简单）风格：先做，出错再处理。这与 **LBYL**（Look Before You Leap，三思而后行）的 \`if hasattr(obj, 'x')\` 形成对比。EAFP 在并发场景下更安全（避免 TOCTOU 竞态），也更符合 Python 习惯。

异常类构成继承树：\`BaseException\` 是根，\`Exception\` 是普通异常基类，\`ValueError / TypeError / KeyError / IndexError / ZeroDivisionError\` 等都是 \`Exception\` 的子类。\`except\` 按顺序匹配，一旦命中就停止，因此必须"从具体到宽泛"排列。

## 三、使用场景

- 读取用户输入、解析配置文件、调用外部 API（可能格式错误）
- 除法、下标访问、字典查找（可能 KeyError/IndexError/ZeroDivisionError）
- 文件/数据库连接（用 finally 保证关闭）
- 调用第三方库（捕获其抛出的特定异常）

## 四、代码逐行讲解

\`\`\`python
def divide(a, b):
    try:
        result = a / b          # 可能 ZeroDivisionError 或 TypeError
    except ZeroDivisionError as e:   # 最具体的异常放最前
        print("除零错误:", e)
        return None
    except (TypeError, ValueError) as e:  # 元组可一次捕获多种
        print("类型/值错误:", e)
        return None
    else:
        print("正常执行")        # try 没异常才走这里，逻辑更清晰
        return result           # 成功路径独立，避免误捕获
    finally:
        print("finally: 清理资源")  # 即使 return 也会先执行
\`\`\`

关键点：
1. \`except ... as e\` 把异常对象绑定到 e，可读取 \`e.args\`、\`str(e)\`
2. 多个 except 必须从具体到宽泛，否则宽泛的先命中，后面的永远执行不到
3. \`else\` 把"成功后续"从 try 中剥离，避免成功代码的异常被误捕获
4. \`finally\` 即使 try/except 中有 return，也会在 return 之前执行

## 五、对比

| 写法 | 优点 | 缺点 |
|------|------|------|
| LBYL（if 检查） | 简单直观 | 并发下有竞态，代码冗长 |
| EAFP（try/except） | Python 风格，并发安全 | 异常路径有性能开销 |
| 裸 \`except:\` | 写起来短 | 会吞掉 KeyboardInterrupt/SystemExit，危险 |
| \`except Exception:\` | 安全，不捕获系统退出异常 | 仍较宽泛，建议尽量具体 |

## 六、易错点小结

| 易错点 | 说明 | 正确做法 |
|--------|------|----------|
| except 顺序反了 | 宽泛在前，具体永远抓不到 | 从具体到宽泛排列 |
| 裸 \`except:\` | 捕获 BaseException，连 Ctrl+C 也吞 | 用 \`except Exception:\` |
| 把成功代码塞进 try | 可能误捕获不该捕获的异常 | 用 else 隔离 |
| 以为 finally 不执行 | 即使 return/异常也会执行 | 利用它做资源清理 |
| 捕获后不处理 | \`except: pass\` 隐藏 bug | 至少 log 或 re-raise |

## 七、常见异常类型表

| 异常 | 触发场景 |
|------|----------|
| \`ValueError\` | 值类型对但不合法，如 \`int("abc")\` |
| \`TypeError\` | 类型不对，如 \`"a" + 1\` |
| \`KeyError\` | 字典 key 不存在 |
| \`IndexError\` | 列表下标越界 |
| \`ZeroDivisionError\` | 除以零 |
| \`AttributeError\` | 访问不存在的属性 |
| \`FileNotFoundError\` | 打开不存在的文件 |
| \`ImportError\` | 模块导入失败 |
| \`StopIteration\` | 迭代器耗尽 |
| \`KeyboardInterrupt\` | 用户按 Ctrl+C（继承 BaseException） |
| \`SystemExit\` | sys.exit() 触发（继承 BaseException） |
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
## 一、概念解释

自定义异常是用户通过继承内置异常类创建的异常类型。Python 内置异常偏底层（如 \`ValueError\`、\`TypeError\`），无法表达业务语义。自定义异常让错误信息"自解释"，调用方一眼就知道发生了什么业务问题。

- 自定义异常通常继承 \`Exception\` 或其具体子类（如 \`ValueError\`）
- \`raise\` 主动抛出异常，通知调用方"这里出错了"
- \`raise X from Y\` 把异常 Y 作为 X 的"原因"，形成异常链

## 二、设计原理

为什么自定义？对比两种写法：

\`\`\`python
# 差：调用方不知道为什么失败
raise Exception("失败")

# 好：语义清晰，调用方可以按类型分别处理
raise InsufficientFundsError(balance=100, amount=200)
\`\`\`

自定义异常的好处：
1. **语义清晰**：类名本身就是文档
2. **可分类捕获**：调用方可以 \`except InsufficientFundsError\` 精确处理
3. **携带上下文**：异常对象可以带 balance、deficit 等业务数据
4. **可扩展**：可以为不同业务错误定义不同异常族

继承选择：
- 继承 \`Exception\`：通用自定义异常
- 继承 \`ValueError\`：表示"值不合法"的语义复用
- 继承 \`RuntimeError\`：表示"运行时不可预期"

## 三、使用场景

- 业务校验：余额不足、库存不够、权限不够
- API 封装：把底层 HTTP 错误转成业务异常
- 数据解析：把格式错误转成带上下文的自定义异常
- 状态机：非法状态转移

## 四、代码逐行讲解

### 1. 定义带属性的自定义异常

\`\`\`python
class InsufficientFundsError(Exception):
    def __init__(self, balance, amount):
        # 调用父类构造，设置异常消息（args[0]）
        super().__init__(f"余额 {balance} 不足，需要 {amount}")
        self.balance = balance          # 自定义属性：当前余额
        self.deficit = amount - balance # 自定义属性：缺口
\`\`\`

\`super().__init__(...)\` 必须调用，否则 \`str(e)\` 和 \`e.args\` 不工作。

### 2. raise 主动抛出

\`\`\`python
def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFundsError(balance, amount)  # 主动抛出
    return balance - amount
\`\`\`

\`raise\` 后面跟异常类或异常实例。\`raise InsufficientFundsError(...)\` 会自动实例化。

### 3. raise from 异常链

\`\`\`python
def parse_age(s):
    try:
        n = int(s)
        if n < 0:
            raise ValueError("age 不能为负")
        return n
    except ValueError as e:
        # from e 把 e 作为新异常的"原因"
        raise RuntimeError(f"解析 age 失败: {s!r}") from e
\`\`\`

\`raise X from Y\` 设置 \`X.__cause__ = Y\`，调试时 traceback 会显示 "The above exception was the direct cause of..."：

\`\`\`python
try:
    parse_age("-5")
except RuntimeError as e:
    print("外层异常:", e)
    print("原始异常:", e.__cause__)   # 访问原始异常
\`\`\`

### 4. 带错误码的异常

\`\`\`python
class APIError(Exception):
    def __init__(self, code, message):
        super().__init__(f"[{code}] {message}")  # 父类构造
        self.code = code                          # 错误码属性

try:
    raise APIError(404, "Not Found")
except APIError as e:
    print("code:", e.code, "msg:", e)
\`\`\`

## 五、对比

| 写法 | 语义 | 调用方处理 |
|------|------|-----------|
| \`raise Exception("...")\` | 模糊 | 只能 except Exception，无法区分 |
| \`raise InsufficientFundsError(...)\` | 清晰 | 可精确捕获，可读属性 |
| \`raise X from Y\` | 保留原因 | 可追溯完整调用链 |
| \`raise X\`（无 from） | 丢失原因 | 难以调试 |

## 六、易错点小结

| 易错点 | 说明 | 正确做法 |
|--------|------|----------|
| 忘记 \`super().__init__()\` | \`str(e)\` 为空，丢失消息 | 必须调用父类构造 |
| 继承 \`BaseException\` | 会被裸 except 漏掉或行为异常 | 继承 \`Exception\` 或其子类 |
| 异常名不以 Error 结尾 | 不符合 Python 命名约定 | 类名用 \`XxxError\` |
| 异常携带可变状态 | 如带文件句柄，可能未关闭 | 只带不可变快照数据 |
| \`raise X from None\` 误用 | 会显式清空 __cause__ | 想保留原因就 \`from e\` |
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
## 一、概念解释

异常链（Exception Chaining）让一个异常可以"携带"另一个异常作为原因，调试时能看到完整的因果链。Python 还提供 \`assert\` 做开发期断言，以及 3.11+ 新增的 \`ExceptionGroup\` 同时抛出多个异常。

- \`raise X from Y\`：显式链，设置 \`X.__cause__ = Y\`
- 隐式链：在 except 块中 raise 新异常，自动设置 \`X.__context__\`
- \`assert cond, msg\`：断言条件为真，否则抛 \`AssertionError\`
- \`ExceptionGroup\`：3.11+，把多个异常打包成一组抛出
- \`except*\`：3.11+，按类型拆解 ExceptionGroup

## 二、设计原理

### 显式链 vs 隐式链

\`\`\`python
# 显式链：__cause__，traceback 显示 "direct cause"
try:
    int("abc")
except ValueError as e:
    raise RuntimeError("解析失败") from e   # 明确说"是因为 e"

# 隐式链：__context__，traceback 显示 "during handling"
try:
    int("abc")
except ValueError:
    raise RuntimeError("解析失败")   # 没写 from，但 Python 自动记下上下文
\`\`\`

区别：
- \`__cause__\`：程序员主动声明因果关系（用 \`from\`）
- \`__context__\`：Python 自动记录"在处理 A 时又抛了 B"
- \`from None\`：显式清空 __cause__，表示"和原异常无关"

### assert 的本质

\`assert cond, msg\` 等价于：
\`\`\`python
if __debug__:
    if not cond:
        raise AssertionError(msg)
\`\`\`

用 \`python -O\` 运行时 \`__debug__ = False\`，所有 assert 被编译器跳过。所以 assert 只用于开发期不变式检查，**不能**做生产数据校验。

### ExceptionGroup 设计动机

传统 raise 一次只能抛一个异常，但并发任务（如 \`asyncio.gather\`）可能同时失败多个。3.11 引入 \`ExceptionGroup\` 让多个异常"一起"抛出，调用方可以用 \`except*\` 按类型分别处理。

## 三、使用场景

- 异常链：封装底层异常为业务异常（API 层）
- assert：函数前置条件、循环不变式、单元测试
- ExceptionGroup：并发任务汇总错误、批量校验报告所有错误

## 四、代码逐行讲解

### 1. assert 开发期断言

\`\`\`python
def sqrt(x):
    assert x >= 0, "x 必须非负"   # 开发期检查，生产 -O 会跳过
    return x ** 0.5

print(sqrt(9))
# sqrt(-1)  # AssertionError: x 必须非负
\`\`\`

### 2. ExceptionGroup 与 except*

\`\`\`python
try:
    raise ExceptionGroup("多错误", [
        ValueError("bad value"),
        TypeError("bad type"),
        KeyError("missing"),
    ])
except* ValueError as eg:        # 匹配组内所有 ValueError
    print("捕获 ValueError:", eg.exceptions)
except* (TypeError, KeyError) as eg:  # 匹配剩余的 TypeError/KeyError
    print("捕获 TypeError/KeyError:", eg.exceptions)
\`\`\`

\`except*\` 会把组里"匹配类型"的异常挑出来，剩下的继续给下一个 \`except*\` 处理。所有 except* 处理完后，如果还有未匹配的异常，会重新抛出。

### 3. subgroup / split 拆解

\`\`\`python
full = ExceptionGroup("outer", [
    ValueError("v1"),
    ExceptionGroup("inner", [ValueError("v2"), TypeError("t1")]),  # 嵌套组
    TypeError("t2"),
])
val_sub = full.subgroup(ValueError)   # 只保留 ValueError（递归到嵌套组）
type_sub = full.subgroup(TypeError)
print("ValueError 子组:", val_sub.exceptions)
print("TypeError 子组:", type_sub.exceptions)
\`\`\`

\`subgroup(T)\` 返回一个只含 T 类型异常的新 ExceptionGroup（保持嵌套结构）。

\`\`\`python
# 拆分
match, rest = full.split(ValueError, TypeError)
# match: 匹配 ValueError/TypeError 的部分
# rest: 剩余部分（本例为空，因为都在列表里）
print("匹配:", match.exceptions)
print("剩余:", rest.exceptions)
\`\`\`

\`split(*types)\` 一次性按类型把组拆成"匹配"和"剩余"两份。

## 五、对比

| 机制 | 用途 | 版本 |
|------|------|------|
| \`raise X from Y\` | 显式因果链 | 3.x 通用 |
| 隐式 \`__context__\` | 自动记录上下文 | 3.x 通用 |
| \`assert\` | 开发期断言 | 通用（可被 -O 关闭） |
| \`ExceptionGroup\` | 多异常一起抛 | 3.11+ |
| \`except*\` | 拆解异常组 | 3.11+ |
| \`subgroup/split\` | 程序化拆解组 | 3.11+ |

## 六、易错点小结

| 易错点 | 说明 | 正确做法 |
|--------|------|----------|
| assert 做生产校验 | \`-O\` 后被跳过，校验失效 | 生产用 \`if ... raise\` |
| \`except\` 捕获 ExceptionGroup | 普通 except 抓不到组里成员 | 用 \`except*\` |
| \`except*\` 后还有未匹配异常 | 会重新抛出，程序崩溃 | 确保覆盖所有类型 |
| 忘记 \`from e\` | 失去原因，难调试 | 封装异常时显式 \`from\` |
| \`from None\` 滥用 | 清空原因链 | 只在确无关联时用 |
| 嵌套 ExceptionGroup | subgroup 递归保留结构 | 注意拆解时的层级 |
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
])
val_sub = full.subgroup(ValueError)
type_sub = full.subgroup(TypeError)
print("ValueError 子组:", val_sub.exceptions)
print("TypeError 子组:", type_sub.exceptions)
# 拆分
match, rest = full.split(ValueError, TypeError)
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
## 一、概念解释

上下文管理器（Context Manager）定义了一段代码的"进入"和"退出"行为，用 \`with\` 语句调用。最典型的应用是资源管理：进入时获取资源，退出时释放资源，即使中间抛异常也能保证释放。

协议由两个魔术方法组成：
- \`__enter__(self)\`：进入 with 块时调用，返回值赋给 \`as\` 后的变量
- \`__exit__(self, exc_type, exc, tb)\`：离开 with 块时调用，负责清理

## 二、设计原理

### 为什么用 with 而不是 try/finally？

\`\`\`python
# 传统 try/finally
f = open("data.txt")
try:
    data = f.read()
finally:
    f.close()

# with 等价但更简洁
with open("data.txt") as f:
    data = f.read()
\`\`\`

with 的优势：
1. **简洁**：一行搞定获取+释放
2. **不易忘**：不会忘记写 close
3. **作用域明确**：资源生命周期清晰
4. **异常安全**：\`__exit__\` 一定被调用，即使 with 块内抛异常

### __exit__ 的返回值

\`__exit__\` 的返回值决定异常是否被"吞掉"：
- 返回 \`True\`：异常被吞，with 块后的代码继续执行
- 返回 \`False\`（或 None）：异常继续传播

\`\`\`python
class SwallowError:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc, tb):
        return True   # 吞掉所有异常（慎用！）
\`\`\`

### @contextmanager 装饰器

不用写类，用生成器函数实现上下文管理器：
- \`yield\` 之前的代码 = \`__enter__\`
- \`yield\` 的值 = \`__enter__\` 的返回值
- \`yield\` 之后的代码 = \`__exit__\`

\`\`\`python
@contextlib.contextmanager
def tag(name):
    print(f"<{name}>")     # __enter__ 逻辑
    yield                   # with 块在这里执行
    print(f"</{name}>")    # __exit__ 逻辑
\`\`\`

如果 with 块抛异常，生成器会在 yield 处抛出，需要用 try/finally 包裹 yield 来保证清理：

\`\`\`python
@contextlib.contextmanager
def temp_chdir(path):
    old = os.getcwd()
    os.chdir(path)
    try:
        yield            # with 块在此执行，可能抛异常
    finally:
        os.chdir(old)    # 无论异常都恢复
\`\`\`

## 三、使用场景

- **文件操作**：\`with open(...) as f\` 自动关闭
- **线程锁**：\`with lock:\` 自动释放
- **数据库事务**：\`with conn:\` 自动 commit/rollback
- **临时环境**：\`with temp_chdir("/tmp"):\` 临时改目录
- **计时**：\`with Timer():\` 自动打印耗时
- **临时目录/文件**：\`with tempfile.TemporaryDirectory() as d:\`
- **抑制异常**：\`contextlib.suppress(FileNotFoundError)\`

## 四、代码逐行讲解

### 1. 类实现上下文管理器

\`\`\`python
class Timer:
    def __enter__(self):
        self.t0 = time.perf_counter()   # 进入时记录起始时间
        return self                      # 返回 self，赋给 as 后变量
    def __exit__(self, exc_type, exc, tb):
        self.elapsed = time.perf_counter() - self.t0  # 计算耗时
        print(f"[Timer] cost {self.elapsed:.6f}s")
        return False   # False = 不吞异常，继续传播
\`\`\`

\`exc_type, exc, tb\` 三个参数是 with 块内抛出的异常信息（类型、实例、traceback），没异常时全是 None。

\`\`\`python
with Timer() as t:
    time.sleep(0.05)        # with 块内的代码
# 离开 with 块时自动调用 __exit__
print("outside:", round(t.elapsed, 4))   # 仍可访问 t.elapsed
\`\`\`

### 2. @contextmanager 生成器实现

\`\`\`python
@contextlib.contextmanager
def temp_chdir(path):
    old = os.getcwd()       # __enter__ 部分
    os.chdir(path)
    try:
        yield               # with 块在此处执行
    finally:
        os.chdir(old)       # __exit__ 部分，保证恢复

with temp_chdir("/tmp"):
    print("in with, cwd:", os.getcwd())
print("after, cwd:", os.getcwd())
\`\`\`

### 3. 抑制异常的 contextmanager

\`\`\`python
@contextlib.contextmanager
def suppress(*excs):
    try:
        yield
    except excs as e:       # 捕获指定异常 = __exit__ 返回 True 的效果
        print("suppressed:", e)

with suppress(ValueError, KeyError):
    int("abc")   # ValueError 被吞
print("继续运行")
\`\`\`

### 4. ExitStack 动态管理多个上下文

\`\`\`python
with tempfile.TemporaryDirectory() as tmp:
    paths = []
    for i in range(3):
        p = os.path.join(tmp, f"f{i}.txt")
        with open(p, "w") as f:
            f.write(f"file {i}")
        paths.append(p)
    with contextlib.ExitStack() as stack:
        # 动态压入多个上下文，退出时按 LIFO 顺序统一清理
        files = [stack.enter_context(open(p)) for p in paths]
        print("contents:", [f.read().strip() for f in files])
# 离开 with 时，ExitStack 自动关闭所有 files
\`\`\`

\`ExitStack\` 适用于：上下文数量在运行时才知道（如动态打开 N 个文件）、需要统一清理的场景。

## 五、对比

| 方式 | 优点 | 缺点 |
|------|------|------|
| 类（__enter__/__exit__） | 灵活，可保存状态 | 代码量大 |
| @contextmanager | 简洁，易读 | yield 处的异常处理需小心 |
| try/finally | 不需协议 | 易忘写 finally |
| ExitStack | 动态多上下文 | 略复杂 |

## 六、易错点小结

| 易错点 | 说明 | 正确做法 |
|--------|------|----------|
| \`__exit__\` 返回 True 误用 | 吞掉所有异常，隐藏 bug | 默认返回 False |
| @contextmanager 不写 try/finally | 异常时清理代码不执行 | yield 用 try/finally 包裹 |
| with 块内 return | 以为 __exit__ 不执行 | 实际仍会执行，可放心 return |
| 重用同一个上下文对象 | 状态被污染 | 每次用 with 重新进入 |
| ExitStack 顺序错误 | 清理顺序与依赖相反 | 按 LIFO，后进先清理 |
| 把资源赋值给 with 外变量 | with 结束后资源已释放 | 在 with 块内使用资源 |

## 七、应用场景速查

| 场景 | 典型用法 |
|------|----------|
| 文件 | \`with open(p) as f\` |
| 锁 | \`with lock:\` |
| 事务 | \`with db.transaction():\` |
| 计时 | \`with Timer() as t:\` |
| 临时目录 | \`with tempfile.TemporaryDirectory() as d:\` |
| 临时环境变量 | \`with mock.patch(...):\` |
| 抑制异常 | \`with contextlib.suppress(...):\` |
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