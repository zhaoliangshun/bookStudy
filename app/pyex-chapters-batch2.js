// =============================================================
// Python 异常处理教程 —— 第二批章节（共 6 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   抛出与自定义（3 章）：
//     7.  pyex-raise               — raise 主动抛出异常
//     8.  pyex-custom-exception     — 自定义异常类
//     9.  pyex-exception-chaining  — 异常链 raise from
//   高级与实战（3 章）：
//     10. pyex-context-manager      — 上下文管理器与异常
//     11. pyex-assert              — assert 语句与断言
//     12. pyex-best-practices       — 异常处理最佳实践与真实案例
//
// 每个章节包含：
//   id      : 唯一标识
//   group   : 分组名
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解
//   code    : 可运行、带详细中文注释的 Python 示例代码
//
// 转义规则：content/code 内部反引号写作 \`，\${ 写作 \$\{，
//           Python 代码中的 \n 写作 \\n。
// =============================================================

export const chapters = [
  // =========================================================
  // 第七章：raise 主动抛出异常
  // =========================================================
  {
    id: "pyex-raise",
    group: "抛出与自定义",
    icon: "🎯",
    title: "raise 主动抛出异常",
    content: `# raise 主动抛出异常

前面的章节我们都在讨论"被动"地捕获异常——程序哪里抛了就去哪里接。但在实际工程中，更常见的需求是**主动**抛出异常：当函数收到的参数不合法、对象状态不满足前置条件、API 契约被违反时，我们应该主动 \`raise\`，把错误暴露给调用方。本章系统讲解 \`raise\` 的完整语法、使用场景和常见误区。

## 一、为什么需要主动抛出异常

被动等异常发生，和主动检查并抛出，是两种完全不同的工程态度。来看一个典型场景——一个除法函数：

\`\`\`python
def divide(a, b):
    return a / b   # 如果 b == 0，会被动触发 ZeroDivisionError
\`\`\`

这看起来"自动"会出错，但问题在于：\`ZeroDivisionError\` 的消息是 \`division by zero\`，对调用方毫无帮助——它不知道是在哪个函数、哪次调用、用什么参数出的问题。更糟的是，如果调用方传入的是字符串、None 等非数字，会触发 \`TypeError\`，错误类型五花八门，难以统一处理。

**主动抛出**的好处：

1. **防御性编程**：在错误扩散前尽早发现。
2. **参数校验**：函数入口检查参数合法性，不合法立即拒绝。
3. **状态检查**：操作前确认对象处于正确状态。
4. **语义化错误**：抛出有意义的异常类型和消息，调用方一看就懂。
5. **API 契约**：明确告诉调用方"违反了使用约定"。

\`\`\`python
def divide(a, b):
    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise TypeError("divide 的参数必须是数字")  # 主动校验类型
    if b == 0:
        raise ValueError("除数不能为 0")  # 主动校验值
    return a / b
\`\`\`

## 二、raise 语句的完整语法

\`raise\` 有三种形式，从简单到复杂：

### 2.1 形式一：裸 raise（重新抛出当前异常）

\`\`\`python
try:                               # 尝试执行以下代码块
    risky()
except ValueError as e:
    log_error(e)
    raise                          # 不带参数，重新抛出当前异常
\`\`\`

裸 \`raise\` 只能在 \`except\` 块里用（或被异常处理上下文中），它会重新抛出当前正在处理的异常，**保留原始 traceback**。常用于"记录日志后让上层处理"。

### 2.2 形式二：raise 异常类或实例

\`\`\`python
raise ValueError                    # 抛出异常类，相当于 raise ValueError()
raise ValueError("消息")            # 抛出带消息的实例
raise ValueError("消息", code, extra)  # 多参数，存到 e.args
\`\`\`

推荐写 \`raise ValueError("消息")\`（带括号实例化），而不是 \`raise ValueError\`，前者更明确。

### 2.3 形式三：raise ... from（异常链）

\`\`\`python
try:                               # 尝试执行以下代码块
    low_level_api()
except LowLevelError as e:
    raise HighLevelError("上层错误") from e   # 建立异常链
\`\`\`

\`from e\` 把原始异常 \`e\` 关联到新异常的 \`__cause__\` 属性，traceback 会显示"The above exception was the direct cause of..."。下一章会详细讲异常链。

### 2.4 三种形式对比

| 形式 | 语法 | 用途 |
| --- | --- | --- |
| 裸 raise | \`raise\` | except 内重新抛出当前异常 |
| 抛实例 | \`raise ValueError("msg")\` | 主动抛出新异常 |
| 异常链 | \`raise NewErr() from e\` | 抛新异常并关联原因 |
| 抑制链 | \`raise NewErr() from None\` | 抛新异常并隐藏原因 |

## 三、何时该抛异常 vs 返回错误码 vs 返回 None

这是新手最纠结的问题。选择依据是"错误是否是异常情况"：

### 3.1 该抛异常的情况

- **违反前置条件**：参数类型/值不合法，函数无法执行。
- **不可恢复的状态**：对象状态损坏，继续执行毫无意义。
- **API 契约违反**：调用方违反了使用约定。
- **环境异常**：文件不存在、网络断开等。

\`\`\`python
def withdraw(account, amount):
    if amount <= 0:
        raise ValueError("取款金额必须大于 0")  # 前置条件
    if amount > account.balance:
        raise ValueError("余额不足")  # 业务规则违反
    account.balance -= amount
\`\`\`

### 3.2 该返回错误码/状态的情况

- **预期的、常见的失败**：找不到资源、查询无结果。
- **调用方需要根据结果分支**：返回 \`None\` / \`False\` / 枚举。

\`\`\`python
def find_user(user_id):
    # 找不到返回 None 是合理的，"找不到"是正常情况
    return database.get(user_id, None)
\`\`\`

### 3.3 该返回哨兵值的情况

\`\`\`python
def get_config(key, default=None):
    # 用 default 参数表达"找不到"，不抛异常
    return config.get(key, default)
\`\`\`

**判断标准**：如果"失败"是调用方预期会处理且常见的，返回值；如果"失败"是异常的、调用方很可能忘记处理的，抛异常。

## 四、异常的性能成本

抛异常是有开销的——构造异常对象、收集 traceback、栈展开，都比普通 \`if/return\` 慢得多（大约慢 1-2 个数量级）。

\`\`\`python
# 反模式：用异常做正常控制流（慢且难读）
def get_value(key):
    try:
        return data[key]
    except KeyError:
        return None

# 正确：用 get 方法（快且清晰）
def get_value(key):
    return data.get(key)
\`\`\`

**原则**：异常用于**异常**情况。如果你的代码每秒抛几千次异常做控制流，就是滥用。但不要因噜于性能而回避异常——在真正的错误路径上，异常的开销可以忽略。

## 五、常见抛异常场景

### 5.1 参数校验

\`\`\`python
def create_user(name, age, email):
    if not isinstance(name, str) or not name.strip():
        raise ValueError("name 不能为空")
    if not isinstance(age, int) or age < 0 or age > 150:
        raise ValueError(f"age 不合法: {age}")
    if "@" not in email:
        raise ValueError(f"email 格式错误: {email}")
    return User(name, age, email)
\`\`\`

### 5.2 前置条件检查

\`\`\`python
def transfer(from_acc, to_acc, amount):
    if from_acc is to_acc:
        raise ValueError("不能给自己转账")  # 前置条件
    if from_acc.closed:
        raise RuntimeError("源账户已关闭")  # 状态检查
    ...
\`\`\`

### 5.3 状态机非法状态

\`\`\`python
class Order:
    def cancel(self):
        if self.status == "cancelled":
            raise RuntimeError("订单已经是取消状态")  # 非法状态转换
        self.status = "cancelled"
\`\`\`

### 5.4 API 契约违反

\`\`\`python
def process(data):
    if "id" not in data:
        raise KeyError("data 必须包含 id 字段")  # 契约违反
    ...
\`\`\`

## 六、raise 与 re-raise 的区别

\`\`\`python
try:                               # 尝试执行以下代码块
    risky()
except SomeError as e:
    log(e)
    raise        # re-raise：抛出同一个异常对象，保留 traceback
    # raise e    # 也能抛出，但会重置 traceback 到当前行（不推荐）
    # raise SomeError(str(e)) from e  # 抛新异常，建立链
\`\`\`

| 写法 | 行为 |
| --- | --- |
| \`raise\` | 重新抛出当前异常，traceback 完整保留 |
| \`raise e\` | 抛出 e，traceback 可能被重置（行为有差异） |
| \`raise X("msg") from e\` | 抛新异常 X，关联原始 e |
| \`raise X("msg") from None\` | 抛新异常 X，隐藏原始 e |

**推荐**：在 except 里重新抛出用裸 \`raise\`，转换异常用 \`raise NewError() from e\`。

## 七、实际案例

### 7.1 配置校验

\`\`\`python
def load_config(path):
    if not path.endswith(".json"):
        raise ValueError(f"配置文件必须是 .json: {path}")
    try:                               # 尝试执行以下代码块
        with open(path) as f:
            return json.load(f)
    except FileNotFoundError:
        raise FileNotFoundError(f"配置文件不存在: {path}") from None
\`\`\`

### 7.2 用户输入校验

\`\`\`python
def parse_age(input_str):
    try:                               # 尝试执行以下代码块
        age = int(input_str)
    except ValueError:
        raise ValueError(f"年龄必须是整数: {input_str!r}") from None
    if age < 0 or age > 150:
        raise ValueError(f"年龄范围 0-150: {age}")
    return age
\`\`\`

## 八、本章小结

- 主动 \`raise\` 用于防御性编程、参数校验、状态检查、契约违反。
- \`raise\` 三种形式：裸 \`raise\`（重抛）、\`raise X("msg")\`（新异常）、\`raise X() from e\`（异常链）。
- 异常用于异常情况，不要用异常做正常控制流（性能差且难读）。
- 该抛异常：违反前置条件、不可恢复状态。该返回值：预期失败、常见无结果。
- except 里重抛用裸 \`raise\`，转换用 \`raise NewError() from e\`。

下一章学习如何自定义异常类，让错误信息更有语义、携带更多业务数据。
`,
    code: `# ============================================================
# 第七章演示：raise 主动抛出异常
# ============================================================
import json
import io

print("=" * 60)
print("第 1 部分：raise 的三种基本形式")
print("=" * 60)

# 形式一：抛出异常类（不推荐，但合法）
try:
    raise ValueError   # 等价于 raise ValueError()
except ValueError as e:
    print(f"  形式一 raise ValueError: args={e.args}")

# 形式二：抛出带消息的实例（推荐）
try:
    raise ValueError("这是一个错误消息")
except ValueError as e:
    print(f"  形式二 raise ValueError('msg'): {e}")

# 形式三：多参数抛出
try:
    raise ValueError("错误描述", 1001, "extra_data")
except ValueError as e:
    print(f"  形式三 多参数: args={e.args}")

print()
print("=" * 60)
print("第 2 部分：参数校验函数示例")
print("=" * 60)

def create_user(name, age, email):
    """创建用户，参数不合法时主动抛出异常"""
    # 校验 name：必须是非空字符串
    if not isinstance(name, str) or not name.strip():
        raise ValueError(f"name 不能为空，得到: {name!r}")
    # 校验 age：必须是合理范围的整数
    if not isinstance(age, int):
        raise TypeError(f"age 必须是整数，得到: {type(age).__name__}")
    if age < 0 or age > 150:
        raise ValueError(f"age 范围 0-150，得到: {age}")
    # 校验 email：必须包含 @
    if not isinstance(email, str) or "@" not in email:
        raise ValueError(f"email 格式错误: {email!r}")
    return {"name": name, "age": age, "email": email}

# 测试各种参数校验
test_cases = [
    ("Alice", 30, "alice@example.com"),  # 合法
    ("", 30, "alice@example.com"),      # name 为空
    ("Bob", "三十", "bob@example.com"), # age 类型错
    ("Carol", 200, "carol@example.com"),# age 超范围
    ("Dave", 25, "dave-no-at-sign"),    # email 格式错
]

for name, age, email in test_cases:
    try:
        user = create_user(name, age, email)
        print(f"  成功: {user}")
    except (ValueError, TypeError) as e:
        print(f"  失败: {type(e).__name__}: {e}")

print()
print("=" * 60)
print("第 3 部分：用异常做控制流的反例对比")
print("=" * 60)

data = {"a": 1, "b": 2, "c": 3}
keys_to_find = ["a", "x", "b", "y", "c"]

# 反模式：用异常做正常控制流（慢且难读）
print("  反模式：try/except KeyError 做查找")
results_bad = []
for key in keys_to_find:
    try:
        results_bad.append(data[key])
    except KeyError:
        results_bad.append(None)
print(f"    结果: {results_bad}")

# 正确：用 get 方法（快且清晰）
print("  正确：用 dict.get 做查找")
results_good = [data.get(key) for key in keys_to_find]
print(f"    结果: {results_good}")

print()
print("=" * 60)
print("第 4 部分：raise 重新抛出（裸 raise）")
print("=" * 60)

def inner_function():
    raise ValueError("来自最底层的错误")

def middle_function():
    try:
        inner_function()
    except ValueError as e:
        print(f"    middle: 记录日志 -> {e}")
        raise   # 裸 raise，保留原始 traceback 重新抛出

def outer_function():
    try:
        middle_function()
    except ValueError as e:
        print(f"    outer: 最终捕获 -> {e}")

print("  演示裸 raise 重新抛出:")
outer_function()

print()
print("=" * 60)
print("第 5 部分：raise from 转换异常（简介，下章详讲）")
print("=" * 60)

def load_json_config(config_text):
    """把底层 JSON 解析错误包装成业务异常"""
    try:
        return json.loads(config_text)
    except json.JSONDecodeError as e:
        # 抛出新异常并关联原始异常
        raise ValueError("配置文件格式错误") from e

try:
    load_json_config('{invalid json}')
except ValueError as e:
    print(f"  捕获业务异常: {e}")
    print(f"  原始原因 (__cause__): {e.__cause__}")

print()
print("=" * 60)
print("第 6 部分：状态机非法状态检查")
print("=" * 60)

class Order:
    """订单类，演示状态检查"""
    def __init__(self, order_id):
        self.order_id = order_id
        self.status = "pending"   # pending / paid / shipped / cancelled

    def pay(self):
        if self.status != "pending":
            raise RuntimeError(
                f"订单 {self.order_id} 状态为 {self.status}，不能支付"
            )
        self.status = "paid"
        print(f"    订单 {self.order_id} 已支付")

    def ship(self):
        if self.status != "paid":
            raise RuntimeError(
                f"订单 {self.order_id} 状态为 {self.status}，不能发货"
            )
        self.status = "shipped"
        print(f"    订单 {self.order_id} 已发货")

    def cancel(self):
        if self.status == "shipped":
            raise RuntimeError(
                f"订单 {self.order_id} 已发货，不能取消"
            )
        self.status = "cancelled"
        print(f"    订单 {self.order_id} 已取消")

order = Order("A001")
order.pay()

# 尝试对已支付订单再次支付（非法状态转换）
try:
    order.pay()
except RuntimeError as e:
    print(f"    状态检查拦截: {e}")

order.ship()

# 尝试取消已发货订单
try:
    order.cancel()
except RuntimeError as e:
    print(f"    状态检查拦截: {e}")

print()
print("=" * 60)
print("第 7 部分：配置校验实战")
print("=" * 60)

def validate_config(config):
    """校验配置字典，不合法则抛 ValueError"""
    required_keys = ["host", "port", "debug"]
    for key in required_keys:
        if key not in config:
            raise ValueError(f"配置缺少必需字段: {key}")

    if not isinstance(config["port"], int):
        raise TypeError(f"port 必须是整数: {config['port']!r}")
    if not (1 <= config["port"] <= 65535):
        raise ValueError(f"port 范围 1-65535: {config['port']}")
    if not isinstance(config["debug"], bool):
        raise TypeError(f"debug 必须是布尔值: {config['debug']!r}")

    return True

configs = [
    {"host": "localhost", "port": 8080, "debug": False},       # 合法
    {"host": "localhost", "port": 8080},                       # 缺 debug
    {"host": "localhost", "port": "8080", "debug": False},     # port 类型错
    {"host": "localhost", "port": 99999, "debug": False},      # port 超范围
    {"host": "localhost", "port": 8080, "debug": "yes"},       # debug 类型错
]

for i, cfg in enumerate(configs, 1):
    try:
        validate_config(cfg)
        print(f"  配置 {i}: 校验通过")
    except (ValueError, TypeError) as e:
        print(f"  配置 {i}: 校验失败 -> {type(e).__name__}: {e}")

print()
print("=" * 60)
print("第 8 部分：何时抛异常 vs 返回 None 对比")
print("=" * 60)

def find_user(user_id, database):
    """查找用户：找不到是正常情况，返回 None"""
    return database.get(user_id)

def get_required_user(user_id, database):
    """获取必需用户：找不到是异常情况，抛异常"""
    user = database.get(user_id)
    if user is None:
        raise KeyError(f"用户不存在: {user_id}")
    return user

db = {1: "Alice", 2: "Bob"}

# find_user：找不到返回 None，调用方用 if 判断
user = find_user(999, db)
print(f"  find_user(999): {user}（正常返回 None）")

# get_required_user：找不到抛异常，调用方必须处理
try:
    user = get_required_user(999, db)
except KeyError as e:
    print(f"  get_required_user(999): 抛出 {e}")

print()
print("全部演示完成。")
`,
  },

  // =========================================================
  // 第八章：自定义异常类
  // =========================================================
  {
    id: "pyex-custom-exception",
    group: "抛出与自定义",
    icon: "🏗️",
    title: "自定义异常类",
    content: `# 自定义异常类

内置异常（\`ValueError\`、\`TypeError\` 等）描述的是"通用错误类型"，但在真实业务里，你需要更精确的异常语义：\`UserNotFoundError\`、\`InsufficientBalanceError\`、\`InvalidTokenError\`……这些用 \`ValueError\` 表达不清楚。本章讲解如何自定义异常类、设计异常层级、携带业务数据，以及什么时候**不该**自定义。

## 一、为什么需要自定义异常

### 1.1 内置异常的局限

\`\`\`python
def withdraw(account, amount):
    if amount <= 0:
        raise ValueError("金额必须大于 0")
    if amount > account.balance:
        raise ValueError("余额不足")   # 都是 ValueError，调用方怎么区分？
\`\`\`

调用方如果想对"余额不足"做特殊处理（比如提示充值），对"金额非法"做另一种处理，靠 \`ValueError\` + 字符串匹配是脆弱的——消息一改就崩。

### 1.2 自定义异常的三大价值

1. **语义化**：\`InsufficientBalanceError\` 一眼看出是余额不足。
2. **精细化捕获**：\`except InsufficientBalanceError\` 精确捕获，不误伤其他 \`ValueError\`。
3. **携带额外数据**：异常对象上可以挂载 \`account_id\`、\`current_balance\`、\`required_amount\` 等业务字段。

\`\`\`python
class InsufficientBalanceError(Exception):
    def __init__(self, account_id, current, required):
        self.account_id = account_id
        self.current = current
        self.required = required
        super().__init__(
            f"账户 {account_id} 余额不足: 当前 {current}, 需要 {required}"
        )

try:                               # 尝试执行以下代码块
    withdraw(acc, 1000)
except InsufficientBalanceError as e:
    print(f"余额不足，差 {e.required - e.current}")
    prompt_recharge(e.account_id)   # 用异常携带的业务数据
\`\`\`

## 二、最简单的自定义异常

\`\`\`python
class MyError(Exception):
    pass
\`\`\`

继承 \`Exception\`，加个 \`pass\`，就是一个合法的自定义异常。它继承了 \`Exception\` 的所有行为，可以被 \`except MyError\` 精确捕获，也可以被 \`except Exception\` 兜底捕获。

\`\`\`python
raise MyError("出错了")   # 等价于 raise MyError(("出错了",))
\`\`\`

## 三、命名规范

### 3.1 Error 后缀

自定义异常类名**必须以 \`Error\` 结尾**，这是 Python 社区的强约定：

\`\`\`python
# 推荐
class UserNotFoundError(Exception): ...
class InvalidTokenError(Exception): ...
class DatabaseConnectionError(Exception): ...

# 不推荐（不符合约定）
class UserNotFound(Exception): ...
class BadToken(Exception): ...
\`\`\`

为什么？看到 \`Error\` 后缀就知道这是异常类，能被 raise/except。内置异常也遵循这个约定（\`ValueError\`、\`TypeError\`、\`FileNotFoundError\`）。

### 3.2 Warning 后缀用于警告

如果你的类继承自 \`Warning\` 而不是 \`Exception\`，用 \`Warning\` 后缀：

\`\`\`python
class DeprecationNotice(Warning):
    pass
\`\`\`

## 四、继承哪个基类

### 4.1 继承 Exception（最常见）

\`\`\`python
class BusinessError(Exception):
    """所有业务异常的基类"""
    pass
\`\`\`

这是最通用的选择，你的异常会被 \`except Exception\` 捕获。

### 4.2 继承具体内置异常（语义复用）

如果自定义异常**本质上是一种 ValueError**，继承 \`ValueError\`：

\`\`\`python
class InvalidEmailError(ValueError):
    """非法邮箱，本质是值错误"""
    pass

# 现在它既能被 except InvalidEmailError 捕获，
# 也能被 except ValueError 兜底捕获
\`\`\`

### 4.3 继承自自定义基类（异常层级）

\`\`\`python
class AppError(Exception):
    """应用所有异常的基类"""
    pass

class DatabaseError(AppError):
    """数据库相关异常"""
    pass

class ConnectionError(DatabaseError):
    """数据库连接异常"""
    pass
\`\`\`

这样 \`except AppError\` 能捕获所有应用异常，\`except DatabaseError\` 能捕获所有数据库异常，分层捕获很灵活。

## 五、添加额外属性

自定义异常的核心价值之一是携带业务数据：

\`\`\`python
class InsufficientBalanceError(Exception):
    def __init__(self, account_id, current, required):
        # 把业务数据存到 self 上
        self.account_id = account_id
        self.current = current
        self.required = required
        # 调用父类 __init__ 设置消息（存到 self.args）
        super().__init__(
            f"账户 {account_id} 余额不足: 当前 {current}, 需要 {required}"
        )
\`\`\`

调用方可以访问这些属性：

\`\`\`python
try:                               # 尝试执行以下代码块
    withdraw(acc, 1000)
except InsufficientBalanceError as e:
    print(e.account_id)    # 访问业务数据
    print(e.current)       # 当前余额
    print(e.required)      # 需要的金额
    print(e)               # 人类可读消息（来自 super().__init__）
\`\`\`

> 要点：\`__init__\` 里**一定要调用 \`super().__init__(...)\`**，否则 \`str(e)\` 和 \`e.args\` 会是空的。

## 六、自定义 __str__ 和 __repr__

默认 \`str(e)\` 返回 \`self.args\` 的内容。如果你想自定义字符串表示：

\`\`\`python
class ValidationError(Exception):
    def __init__(self, field, message, code=None):
        self.field = field
        self.message = message
        self.code = code
        super().__init__(message)

    def __str__(self):
        return f"[{self.field}] {self.message}"

    def __repr__(self):
        return f"ValidationError(field={self.field!r}, code={self.code!r})"
\`\`\`

\`\`\`python
e = ValidationError("email", "格式错误", code="INVALID_EMAIL")
print(str(e))   # [email] 格式错误
print(repr(e))  # ValidationError(field='email', code='INVALID_EMAIL')
\`\`\`

## 七、异常层级设计

真实项目里，异常不是扁平的，而是有层级的。设计原则：**先定义业务基类，再派生具体异常**。

\`\`\`text
AppError                          ← 所有应用异常的根
├── DatabaseError                ← 数据库层
│   ├── ConnectionError
│   ├── QueryError
│   └── TransactionError
├── ValidationError              ← 数据校验层
│   ├── InvalidEmailError
│   └── InvalidAgeError
├── AuthError                    ← 认证授权层
│   ├── InvalidTokenError
│   ├── ExpiredTokenError
│   └── PermissionDeniedError
└── BusinessError                ← 业务逻辑层
    ├── InsufficientBalanceError
    └── OrderNotFoundError
\`\`\`

这样的层级让调用方可以灵活选择捕获粒度：

\`\`\`python
try:                               # 尝试执行以下代码块
    do_business()
except InvalidTokenError:          # 最细：只处理 token 无效
    redirect_login()
except AuthError:                  # 中等：处理所有认证问题
    handle_auth_error()
except AppError:                   # 最粗：兜底所有应用异常
    log_and_show_generic_error()
\`\`\`

## 八、实际案例：异常族设计

### 8.1 网络请求异常族

\`\`\`python
class HttpError(Exception):
    """HTTP 请求异常基类"""
    def __init__(self, url, status_code, message=""):
        self.url = url
        self.status_code = status_code
        super().__init__(message or f"HTTP {status_code}: {url}")

class HttpTimeoutError(HttpError):
    """请求超时"""
    pass

class HttpServerError(HttpError):
    """5xx 服务器错误"""
    pass

class HttpClientError(HttpError):
    """4xx 客户端错误"""
    pass

class HttpNotFoundError(HttpClientError):
    """404 资源不存在"""
    def __init__(self, url):
        super().__init__(url, 404, f"资源不存在: {url}")
\`\`\`

### 8.2 数据验证异常族

\`\`\`python
class ValidationError(Exception):
    """数据校验异常基类"""
    def __init__(self, field, message):
        self.field = field
        self.message = message
        super().__init__(f"[{field}] {message}")

class MissingFieldError(ValidationError):
    """缺少必需字段"""
    def __init__(self, field):
        super().__init__(field, f"字段缺失")

class InvalidTypeError(ValidationError):
    """字段类型错误"""
    def __init__(self, field, expected, got):
        self.expected = expected
        self.got = got
        super().__init__(field, f"期望 {expected}, 得到 {got}")
\`\`\`

## 九、不要过度设计

自定义异常很强大，但**简单场景不要滥用**：

\`\`\`python
# 过度设计：一个简单工具脚本搞一堆异常类
class ConfigFileError(Exception): ...
class ConfigParseError(ConfigFileError): ...
class ConfigKeyError(ConfigParseError): ...
class ConfigValueError(ConfigParseError): ...

# 简单场景：直接用内置异常
def load_config(path):
    if not os.path.exists(path):
        raise FileNotFoundError(path)
    ...
\`\`\`

**判断标准**：如果调用方需要区分多种错误并做不同处理，自定义值得；如果调用方只会"捕获并打印"，用内置异常就够了。

## 十、本章小结

- 自定义异常的三大价值：语义化、精细化捕获、携带业务数据。
- 命名必须 \`Error\` 后缀；继承 \`Exception\` 或具体内置异常或自定义基类。
- \`__init__\` 里存业务数据到 \`self\`，**必须调用 \`super().__init__()\`** 设置消息。
- 设计异常层级：业务基类 → 分类基类 → 具体异常，支持分层捕获。
- 简单场景不要过度设计，直接用内置异常。

下一章学习异常链（\`raise from\`），把底层异常包装成上层语义异常时保留因果关系。
`,
    code: `# ============================================================
# 第八章演示：自定义异常类
# ============================================================
import json

print("=" * 60)
print("第 1 部分：最简单的自定义异常")
print("=" * 60)

class SimpleError(Exception):
    """最简单的自定义异常，只继承 Exception"""
    pass

# 抛出并捕获
try:
    raise SimpleError("这是一个简单错误")
except SimpleError as e:
    print(f"  捕获 SimpleError: {e}")
    print(f"  是 Exception 子类吗: {isinstance(e, Exception)}")
    print(f"  args: {e.args}")

print()
print("=" * 60)
print("第 2 部分：继承具体内置异常")
print("=" * 60)

class InvalidEmailError(ValueError):
    """非法邮箱，本质是 ValueError"""
    pass

class InvalidAgeError(ValueError):
    """非法年龄"""
    pass

# 既能被具体异常捕获，也能被 ValueError 兜底捕获
try:
    raise InvalidEmailError("邮箱缺少 @ 符号")
except InvalidEmailError as e:
    print(f"  InvalidEmailError 捕获: {e}")
    print(f"  是 ValueError 子类吗: {isinstance(e, ValueError)}")

# ValueError 能兜底捕获 InvalidEmailError
try:
    raise InvalidEmailError("又是坏邮箱")
except ValueError as e:
    print(f"  ValueError 兜底捕获: {type(e).__name__}: {e}")

print()
print("=" * 60)
print("第 3 部分：带额外数据的异常")
print("=" * 60)

class InsufficientBalanceError(Exception):
    """余额不足异常，携带业务数据"""
    def __init__(self, account_id, current, required):
        # 存业务数据到实例属性
        self.account_id = account_id
        self.current = current
        self.required = required
        self.shortage = required - current   # 差额
        # 调用父类 __init__ 设置消息（重要！否则 str(e) 为空）
        super().__init__(
            f"账户 {account_id} 余额不足: 当前 {current}, 需要 {required} (差 {self.shortage})"
        )

def withdraw(account_id, balance, amount):
    """模拟取款，余额不足抛异常"""
    if amount > balance:
        raise InsufficientBalanceError(account_id, balance, amount)
    return balance - amount

try:
    withdraw("ACC-001", 500, 1000)
except InsufficientBalanceError as e:
    print(f"  错误消息: {e}")
    print(f"  账户 ID: {e.account_id}")
    print(f"  当前余额: {e.current}")
    print(f"  需要金额: {e.required}")
    print(f"  差额: {e.shortage}")
    # 可以用业务数据做后续处理
    print(f"  -> 建议充值至少 {e.shortage} 元")

print()
print("=" * 60)
print("第 4 部分：自定义 __str__ 和 __repr__")
print("=" * 60)

class ValidationError(Exception):
    """校验异常，自定义字符串表示"""
    def __init__(self, field, message, code=None):
        self.field = field
        self.message = message
        self.code = code
        super().__init__(message)

    def __str__(self):
        # 自定义 str 表示
        if self.code:
            return f"[{self.field}:{self.code}] {self.message}"
        return f"[{self.field}] {self.message}"

    def __repr__(self):
        return f"ValidationError(field={self.field!r}, message={self.message!r}, code={self.code!r})"

e = ValidationError("email", "格式错误", code="INVALID_EMAIL")
print(f"  str(e):  {str(e)}")
print(f"  repr(e): {repr(e)}")
print(f"  e.field: {e.field}")
print(f"  e.code:  {e.code}")

# 抛出后捕获，str 也会用自定义版本
try:
    raise ValidationError("age", "必须大于 0")
except ValidationError as ex:
    print(f"  捕获后 str: {ex}")

print()
print("=" * 60)
print("第 5 部分：异常层级设计")
print("=" * 60)

# 定义异常层级
class AppError(Exception):
    """应用所有异常的基类"""
    pass

class DatabaseError(AppError):
    """数据库相关异常"""
    pass

class ConnectionError(DatabaseError):
    """数据库连接异常"""
    pass

class QueryError(DatabaseError):
    """查询异常"""
    pass

class ValidationError(AppError):
    """数据校验异常"""
    pass

# 演示分层捕获
def risky_operation(kind):
    if kind == "connection":
        raise ConnectionError("无法连接数据库")
    elif kind == "query":
        raise QueryError("SQL 语法错误")
    elif kind == "validation":
        raise ValidationError("字段不合法")

# 最细：只捕获 ConnectionError
try:
    risky_operation("connection")
except ConnectionError as e:
    print(f"  ConnectionError: {e}")

# 中等：捕获所有 DatabaseError
try:
    risky_operation("query")
except DatabaseError as e:
    print(f"  DatabaseError (含 QueryError): {type(e).__name__}: {e}")

# 最粗：兜底所有 AppError
try:
    risky_operation("validation")
except AppError as e:
    print(f"  AppError (含 ValidationError): {type(e).__name__}: {e}")

# 验证继承关系
print("  继承关系验证:")
print(f"    ConnectionError -> DatabaseError: {issubclass(ConnectionError, DatabaseError)}")
print(f"    DatabaseError -> AppError: {issubclass(DatabaseError, AppError)}")
print(f"    AppError -> Exception: {issubclass(AppError, Exception)}")

print()
print("=" * 60)
print("第 6 部分：实际业务场景——网络请求异常族")
print("=" * 60)

class HttpError(Exception):
    """HTTP 请求异常基类"""
    def __init__(self, url, status_code, message=""):
        self.url = url
        self.status_code = status_code
        super().__init__(message or f"HTTP {status_code}: {url}")

    def __str__(self):
        return f"[{self.status_code}] {self.url}: {self.args[0] if self.args else ''}"

class HttpTimeoutError(HttpError):
    def __init__(self, url):
        super().__init__(url, 0, "请求超时")

class HttpServerError(HttpError):
    """5xx 服务器错误"""
    pass

class HttpClientError(HttpError):
    """4xx 客户端错误"""
    pass

class HttpNotFoundError(HttpClientError):
    """404 资源不存在"""
    def __init__(self, url):
        super().__init__(url, 404, f"资源不存在")

def fetch(url):
    """模拟 HTTP 请求，根据 URL 抛不同异常"""
    if "timeout" in url:
        raise HttpTimeoutError(url)
    elif "notfound" in url:
        raise HttpNotFoundError(url)
    elif "server" in url:
        raise HttpServerError(url, 500, "服务器内部错误")
    elif "badrequest" in url:
        raise HttpClientError(url, 400, "请求参数错误")
    return f"来自 {url} 的数据"

# 测试各种 HTTP 错误
urls = [
    "https://api.example.com/ok",
    "https://api.example.com/timeout",
    "https://api.example.com/notfound",
    "https://api.example.com/server",
    "https://api.example.com/badrequest",
]

for url in urls:
    try:
        result = fetch(url)
        print(f"  {url}: 成功 -> {result}")
    except HttpNotFoundError as e:
        print(f"  {url}: 404 处理 -> {e}")
    except HttpClientError as e:
        print(f"  {url}: 4xx 处理 -> {e}")
    except HttpServerError as e:
        print(f"  {url}: 5xx 处理（重试）-> {e}")
    except HttpTimeoutError as e:
        print(f"  {url}: 超时处理 -> {e}")
    except HttpError as e:
        print(f"  {url}: 其他 HTTP 错误 -> {e}")

print()
print("=" * 60)
print("第 7 部分：数据验证异常族")
print("=" * 60)

class DataValidationError(Exception):
    """数据校验异常基类"""
    def __init__(self, field, message):
        self.field = field
        self.message = message
        super().__init__(f"[{field}] {message}")

class MissingFieldError(DataValidationError):
    """缺少必需字段"""
    def __init__(self, field):
        super().__init__(field, "字段缺失")

class InvalidTypeError(DataValidationError):
    """字段类型错误"""
    def __init__(self, field, expected, got):
        self.expected = expected
        self.got = got
        super().__init__(field, f"期望 {expected}, 得到 {got}")

class OutOfRangeError(DataValidationError):
    """值超出范围"""
    def __init__(self, field, value, min_val, max_val):
        self.value = value
        super().__init__(field, f"值 {value} 不在范围 [{min_val}, {max_val}]")

def validate_user(user):
    """校验用户字典，违反规则抛对应异常"""
    if "name" not in user:
        raise MissingFieldError("name")
    if not isinstance(user["name"], str):
        raise InvalidTypeError("name", "str", type(user["name"]).__name__)
    if "age" not in user:
        raise MissingFieldError("age")
    if not isinstance(user["age"], int):
        raise InvalidTypeError("age", "int", type(user["age"]).__name__)
    if user["age"] < 0 or user["age"] > 150:
        raise OutOfRangeError("age", user["age"], 0, 150)
    return True

# 测试数据校验
test_users = [
    {"name": "Alice", "age": 30},                    # 合法
    {"age": 25},                                      # 缺 name
    {"name": 123, "age": 25},                         # name 类型错
    {"name": "Bob", "age": "二十"},                   # age 类型错
    {"name": "Carol", "age": 200},                    # age 超范围
]

for i, user in enumerate(test_users, 1):
    try:
        validate_user(user)
        print(f"  用户 {i}: 校验通过")
    except DataValidationError as e:
        print(f"  用户 {i}: {type(e).__name__} -> {e}")

print()
print("=" * 60)
print("第 8 部分：不要过度设计——简单场景用内置异常")
print("=" * 60)

# 简单工具脚本，直接用内置异常
def read_file_simple(path):
    try:
        with open(path) as f:
            return f.read()
    except FileNotFoundError:
        # 简单场景：不需要自定义异常，直接 re-raise 带更清晰的 message
        raise FileNotFoundError(f"配置文件不存在: {path}") from None

try:
    read_file_simple("/tmp/这个文件不存在_xxx.json")
except FileNotFoundError as e:
    print(f"  简单场景用内置异常: {e}")
    print("  -> 不需要为一次性脚本定义一堆异常类")

print()
print("全部演示完成。")
`,
  },

  // =========================================================
  // 第九章：异常链 raise from
  // =========================================================
  {
    id: "pyex-exception-chaining",
    group: "抛出与自定义",
    icon: "🔗",
    title: "异常链 raise from",
    content: `# 异常链 raise from

在 except 块里抛新异常时，原始异常的信息很容易丢失——你捕获了 \`ConnectionError\`，抛出了 \`ServiceUnavailableError\`，但调用方只看到后者，根本不知道是连接出了问题。Python 3 引入的**异常链**机制解决了这个问题：它能把"新异常"和"原始异常"关联起来，traceback 里会同时显示两者，保留完整的因果链。

## 一、什么是异常链

异常链是指：抛出一个新异常时，把它和一个"原因异常"关联起来，让 traceback 能展示完整的因果关系。Python 提供两种关联方式：

1. **显式异常链**（\`__cause__\`）：用 \`raise NewError() from original\` 主动建立。
2. **隐式异常链**（\`__context__\`）：在 except 块里 raise 新异常时自动建立。

traceback 里的提示语会区分两者：

- \`The above exception was the direct cause of the following exception\`（显式，\`__cause__\`）
- \`During handling of the above exception, another exception occurred\`（隐式，\`__context__\`）

## 二、隐式异常链 __context__

当你在 \`except\` 块里 \`raise\` 一个**新**异常（不是 re-raise），Python 会自动把"正在处理的异常"存到新异常的 \`__context__\` 属性：

\`\`\`python
try:                               # 尝试执行以下代码块
    1 / 0                          # 抛 ZeroDivisionError
except ZeroDivisionError:
    # 在处理 ZeroDivisionError 时抛了新异常
    raise ValueError("计算失败")   # ValueError.__context__ = ZeroDivisionError 实例
\`\`\`

即使你不写 \`from\`，\`__context__\` 也会被自动设置。traceback 会显示：

\`\`\`text
ZeroDivisionError: division by zero

During handling of the above exception, another exception occurred:

ValueError: 计算失败
\`\`\`

**隐式链的问题**：它总是被设置，哪怕你**不希望**关联（比如新异常和旧异常无关）。这时需要用 \`raise from None\` 显式抑制。

## 三、raise ... from 显式建立异常链

用 \`raise NewError() from original\` 显式声明因果关系：

\`\`\`python
try:                               # 尝试执行以下代码块
    low_level_api()                # 抛 LowLevelError
except LowLevelError as e:
    # 把底层异常包装成上层语义异常，显式关联
    raise HighLevelError("服务不可用") from e
\`\`\`

\`from e\` 把 \`e\` 存到新异常的 \`__cause__\` 属性。traceback 会显示：

\`\`\`text
LowLevelError: ...

The above exception was the direct cause of the following exception:

HighLevelError: 服务不可用
\`\`\`

**显式 vs 隐式的区别**：

| 特性 | \`__cause__\`（显式 from） | \`__context__\`（隐式） |
| --- | --- | --- |
| 设置方式 | \`raise X from e\` | except 内 raise 新异常自动设置 |
| traceback 提示 | "was the direct cause of" | "During handling of..." |
| 语义 | 明确的因果关系 | 偶然的上下文关系 |
| 是否抑制 | 不抑制 | 可被 \`from None\` 抑制 |

## 四、raise ... from None 抑制异常链

有时你在 except 里抛新异常，但**不希望**关联原始异常（因为新异常完全取代了它，原始信息对调用方无用/有误导）：

\`\`\`python
try:                               # 尝试执行以下代码块
    int(user_input)
except ValueError:
    # 抛出更语义化的异常，并隐藏原始的 ValueError
    raise InvalidInputError("输入必须是数字") from None
\`\`\`

\`from None\` 把 \`__cause__\` 设为 \`None\`，并设置 \`__suppress_context__ = True\`，traceback 就**不会**显示原始异常链：

\`\`\`text
InvalidInputError: 输入必须是数字
\`\`\`

**何时用 \`from None\`**：当原始异常是"实现细节"，对调用方没有价值、甚至有误导时。比如把 \`KeyError\` 转成业务异常时，原始 KeyError 的 key 名可能泄露内部结构。

## 五、__cause__ vs __context__ 的区别

\`\`\`python
try:                               # 尝试执行以下代码块
    risky()
except LowLevelError as e:
    new_err = HighLevelError("新错误")
    # __context__ 会被自动设为 e（因为我们在 except 块里）
    raise new_err
    # 等价于 new_err.__context__ = e, __cause__ = None
\`\`\`

\`\`\`python
try:                               # 尝试执行以下代码块
    risky()
except LowLevelError as e:
    raise HighLevelError("新错误") from e
    # 现在 __cause__ = e, __context__ = e, __suppress_context__ = True
\`\`\`

判断逻辑（Python 内部）：

- 如果 \`__cause__\` 不是 \`None\`，traceback 显示 \`__cause__\`（"direct cause"）。
- 否则如果 \`__context__\` 不是 \`None\` 且 \`__suppress_context__\` 为 \`False\`，显示 \`__context__\`（"During handling"）。
- \`raise from None\` 设置 \`__suppress_context__ = True\`，抑制 \`__context__\` 显示。

## 六、何时用 raise from、何时用 raise from None

### 6.1 用 raise from e（保留原因）

当新异常和原始异常有**明确因果关系**，且原始信息对调试有帮助时：

\`\`\`python
try:                               # 尝试执行以下代码块
    response = urllib.request.urlopen(url)
except URLError as e:
    raise ServiceUnavailableError(f"无法访问 {url}") from e
    # 保留 URLError，调用方能知道是网络问题
\`\`\`

### 6.2 用 raise from None（隐藏原因）

当原始异常是**实现细节**，对调用方无价值或有误导时：

\`\`\`python
try:                               # 尝试执行以下代码块
    value = data_dict[internal_key]   # internal_key 是实现细节
except KeyError:
    raise ConfigError("配置项缺失") from None
    # 隐藏 KeyError，不泄露内部 key 名
\`\`\`

### 6.3 不用 from（让 __context__ 自动处理）

如果你不确定，或者觉得隐式链已经够了，可以不写 \`from\`，Python 会自动设置 \`__context__\`。但**推荐显式**：要么 \`from e\` 保留，要么 \`from None\` 隐藏，意图更清晰。

## 七、异常链在 traceback 中的显示

\`\`\`text
Traceback (most recent call last):
  File "main.py", line 3, in <module>
    low_level_api()
  File "low.py", line 5, in low_level_api
    raise ConnectionError("无法连接")
ConnectionError: 无法连接

The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "main.py", line 8, in <module>
    raise ServiceError("服务不可用") from e
ServiceError: 服务不可用
\`\`\`

两段 traceback 都会显示，调试时能看到完整的因果链。

## 八、实际案例：底层 API 异常包装

最常见的应用：把底层库的异常包装成业务异常，同时保留底层原因供调试。

\`\`\`python
import requests                       # 导入 requests 库

class GithubAPIError(Exception):      # 业务异常基类
    pass

class GithubAuthError(GithubAPIError):# 认证异常
    pass

class GithubRateLimitError(GithubAPIError):  # 限流异常
    pass

def get_user(username):
    try:                               # 尝试执行以下代码块
        resp = requests.get(f"https://api.github.com/users/{username}")
        resp.raise_for_status()
    except requests.HTTPError as e:
        # 把 HTTP 错误包装成业务异常，保留原始原因
        if resp.status_code == 401:
            raise GithubAuthError("Token 无效") from e
        elif resp.status_code == 403:
            raise GithubRateLimitError("API 限流") from e
        else:
            raise GithubAPIError(f"GitHub API 错误: {resp.status_code}") from e
    return resp.json()
\`\`\`

调用方可以精确捕获业务异常，同时 traceback 保留了 HTTP 错误的细节。

## 九、本章小结

- 异常链让"新异常"和"原因异常"关联，traceback 展示完整因果。
- \`__context__\`：隐式，except 内 raise 新异常自动设置。
- \`__cause__\`：显式，\`raise X from e\` 主动设置。
- \`raise X from None\`：抑制异常链，隐藏实现细节。
- 有明确因果关系用 \`from e\`，原始是细节用 \`from None\`。
- 实际应用：底层库异常包装成业务异常时保留原因。

下一章进入"高级与实战"组，学习上下文管理器如何与异常协作。
`,
    code: `# ============================================================
# 第九章演示：异常链 raise from
# ============================================================
import json

print("=" * 60)
print("第 1 部分：隐式异常链 __context__")
print("=" * 60)

# 在 except 块里抛新异常，__context__ 会自动设置
try:
    try:
        # 触发一个底层异常
        value = int("不是数字")
    except ValueError:
        # 处理时抛新异常，不写 from
        raise RuntimeError("数据处理失败")
except RuntimeError as e:
    print(f"  捕获到: {type(e).__name__}: {e}")
    print(f"  __context__ (隐式): {type(e.__context__).__name__}: {e.__context__}")
    print(f"  __cause__ (显式): {e.__cause__}")
    print(f"  __suppress_context__: {e.__suppress_context__}")
    print("  -> __context__ 被自动设为原始的 ValueError")

print()
print("=" * 60)
print("第 2 部分：显式异常链 raise from e")
print("=" * 60)

class LowLevelError(Exception):
    """底层异常"""
    pass

class HighLevelError(Exception):
    """高层异常"""
    pass

def low_level_api():
    """模拟底层 API 抛异常"""
    raise LowLevelError("数据库连接失败")

try:
    try:
        low_level_api()
    except LowLevelError as e:
        # 显式建立异常链：from e
        raise HighLevelError("服务不可用") from e
except HighLevelError as e:
    print(f"  捕获到: {type(e).__name__}: {e}")
    print(f"  __cause__ (显式原因): {type(e.__cause__).__name__}: {e.__cause__}")
    print(f"  __context__ (隐式上下文): {type(e.__context__).__name__}: {e.__context__}")
    print(f"  __suppress_context__: {e.__suppress_context__}")
    print("  -> __cause__ 被设为原始 LowLevelError")

print()
print("=" * 60)
print("第 3 部分：raise from None 抑制异常链")
print("=" * 60)

class InvalidInputError(Exception):
    """输入异常"""
    pass

try:
    try:
        # 触发一个内部细节异常
        data = {"secret_internal_key": "value"}
        value = data["another_key"]   # KeyError，泄露内部 key 名
    except KeyError:
        # 抛业务异常，隐藏原始 KeyError
        raise InvalidInputError("输入项缺失") from None
except InvalidInputError as e:
    print(f"  捕获到: {type(e).__name__}: {e}")
    print(f"  __cause__: {e.__cause__}")
    print(f"  __context__: {type(e.__context__).__name__ if e.__context__ else None}: {e.__context__}")
    print(f"  __suppress_context__: {e.__suppress_context__}")
    print("  -> __suppress_context__ 为 True，traceback 不会显示原始 KeyError")

print()
print("=" * 60)
print("第 4 部分：三种写法对比")
print("=" * 60)

# 对比：不写 from / from e / from None
def demo_no_from():
    try:
        1 / 0
    except ZeroDivisionError:
        raise ValueError("不写 from")

def demo_from_e():
    try:
        1 / 0
    except ZeroDivisionError as e:
        raise ValueError("from e") from e

def demo_from_none():
    try:
        1 / 0
    except ZeroDivisionError:
        raise ValueError("from None") from None

for name, fn in [("不写 from", demo_no_from), ("from e", demo_from_e), ("from None", demo_from_none)]:
    try:
        fn()
    except ValueError as e:
        cause = type(e.__cause__).__name__ if e.__cause__ else "None"
        context = type(e.__context__).__name__ if e.__context__ else "None"
        suppress = e.__suppress_context__
        print(f"  {name:12s}: cause={cause:20s} context={context:20s} suppress={suppress}")

print()
print("=" * 60)
print("第 5 部分：实际场景——模拟 requests 异常包装")
print("=" * 60)

# 模拟一个 HTTP 客户端，不用真实网络
class FakeHTTPError(Exception):
    """模拟 HTTP 错误"""
    def __init__(self, status_code, message):
        self.status_code = status_code
        super().__init__(message)

# 定义业务异常族
class GithubAPIError(Exception):
    """GitHub API 异常基类"""
    pass

class GithubAuthError(GithubAPIError):
    """认证失败"""
    pass

class GithubRateLimitError(GithubAPIError):
    """限流"""
    pass

class GithubNotFoundError(GithubAPIError):
    """资源不存在"""
    pass

def fake_github_request(username):
    """模拟 GitHub API 请求，根据用户名抛不同异常"""
    if username == "unauthorized":
        raise FakeHTTPError(401, "Unauthorized")
    elif username == "rate_limited":
        raise FakeHTTPError(403, "Forbidden - rate limit")
    elif username == "ghost":
        raise FakeHTTPError(404, "Not Found")
    elif username == "server_error":
        raise FakeHTTPError(500, "Internal Server Error")
    return {"login": username, "name": "Test User"}

def get_github_user(username):
    """包装底层 HTTP 异常为业务异常，保留原因"""
    try:
        return fake_github_request(username)
    except FakeHTTPError as e:
        # 根据 status_code 抛对应业务异常，from e 保留原因
        if e.status_code == 401:
            raise GithubAuthError("Token 无效或已过期") from e
        elif e.status_code == 403:
            raise GithubRateLimitError("API 调用次数超限") from e
        elif e.status_code == 404:
            raise GithubNotFoundError(f"用户 {username} 不存在") from e
        else:
            raise GithubAPIError(f"GitHub API 错误: {e.status_code}") from e

# 测试各种情况
test_users = ["alice", "unauthorized", "rate_limited", "ghost", "server_error"]

for username in test_users:
    try:
        user = get_github_user(username)
        print(f"  {username:15s}: 成功 -> {user}")
    except GithubAuthError as e:
        print(f"  {username:15s}: 认证错误 -> {e}")
        print(f"  {'':17s} 原因: {type(e.__cause__).__name__}: {e.__cause__}")
    except GithubRateLimitError as e:
        print(f"  {username:15s}: 限流错误 -> {e}")
        print(f"  {'':17s} 原因: {type(e.__cause__).__name__}: {e.__cause__}")
    except GithubNotFoundError as e:
        print(f"  {username:15s}: 未找到  -> {e}")
        print(f"  {'':17s} 原因: {type(e.__cause__).__name__}: {e.__cause__}")
    except GithubAPIError as e:
        print(f"  {username:15s}: API 错误 -> {e}")
        print(f"  {'':17s} 原因: {type(e.__cause__).__name__}: {e.__cause__}")

print()
print("=" * 60)
print("第 6 部分：JSON 解析异常包装")
print("=" * 60)

class ConfigError(Exception):
    """配置异常"""
    pass

def load_config(config_text):
    """解析 JSON 配置，把 JSONDecodeError 包装成 ConfigError"""
    try:
        return json.loads(config_text)
    except json.JSONDecodeError as e:
        # 保留原始解析错误（含行号列号），用 from e
        raise ConfigError(f"配置文件格式错误: 第 {e.lineno} 行, 第 {e.colno} 列") from e

# 测试
configs = [
    '{"name": "Alice", "age": 30}',     # 合法
    '{invalid json}',                    # 格式错误
    '{"name": "Alice", "age":}',         # 语法错误
]

for cfg in configs:
    try:
        result = load_config(cfg)
        print(f"  解析成功: {result}")
    except ConfigError as e:
        print(f"  ConfigError: {e}")
        print(f"    原始原因: {type(e.__cause__).__name__}: {e.__cause__}")

print()
print("=" * 60)
print("第 7 部分：查看完整的异常链属性")
print("=" * 60)

# 综合演示：展示异常对象的三个关键属性
class A(Exception): pass
class B(Exception): pass

# 场景 1：隐式链
try:
    try:
        raise A("原始 A")
    except A:
        raise B("新异常 B（隐式）")
except B as e:
    print("  场景 1 - 隐式链:")
    print(f"    __cause__ = {e.__cause__}")
    print(f"    __context__ = {type(e.__context__).__name__}: {e.__context__}")
    print(f"    __suppress_context__ = {e.__suppress_context__}")

# 场景 2：显式链
try:
    try:
        raise A("原始 A")
    except A as orig:
        raise B("新异常 B（显式）") from orig
except B as e:
    print("  场景 2 - 显式链:")
    print(f"    __cause__ = {type(e.__cause__).__name__}: {e.__cause__}")
    print(f"    __context__ = {type(e.__context__).__name__}: {e.__context__}")
    print(f"    __suppress_context__ = {e.__suppress_context__}")

# 场景 3：抑制链
try:
    try:
        raise A("原始 A")
    except A:
        raise B("新异常 B（抑制）") from None
except B as e:
    print("  场景 3 - 抑制链:")
    print(f"    __cause__ = {e.__cause__}")
    print(f"    __context__ = {type(e.__context__).__name__}: {e.__context__}")
    print(f"    __suppress_context__ = {e.__suppress_context__}")

print()
print("全部演示完成。")
`,
  },

  // =========================================================
  // 第十章：上下文管理器与异常
  // =========================================================
  {
    id: "pyex-context-manager",
    group: "高级与实战",
    icon: "🚪",
    title: "上下文管理器与异常",
    content: `# 上下文管理器与异常

\`with\` 语句不只是"自动关闭文件"——它是 Python 管理资源和异常的核心机制。上下文管理器通过 \`__enter__\` / \`__exit__\` 协议，把"获取资源 → 使用 → 释放"的代码模式标准化，并在异常发生时保证清理。本章深入讲解上下文管理器与异常的关系，包括 \`__exit__\` 如何控制异常传播、\`contextlib\` 工具库、以及事务回滚等实战场景。

## 一、with 语句与异常的关系

\`with\` 语句的本质是 \`try/finally\` 的语法糖，但更强大：它把"进入"和"退出"的逻辑封装在对象里，保证无论 \`with\` 块里是否抛异常，\`__exit__\` 都会被调用。

\`\`\`python
# with 的等价形式
manager = ResourceManager()
manager.__enter__()
try:                               # 尝试执行以下代码块
    # with 块的代码
    do_work()
finally:                           # 无论是否异常都执行
    manager.__exit__(exc_type, exc_val, exc_tb)
\`\`\`

\`__exit__\` 接收三个参数：

- \`exc_type\`：异常类型（无异常时为 \`None\`）。
- \`exc_val\`：异常实例（无异常时为 \`None\`）。
- \`exc_tb\`：traceback 对象（无异常时为 \`None\`）。

通过这三个参数，\`__exit__\` 可以知道"有没有异常、是什么异常"，并决定是否抑制它。

## 二、__enter__ / __exit__ 协议

### 2.1 最基本的上下文管理器

\`\`\`python
class MyResource:
    def __enter__(self):
        print("获取资源")
        return self   # as 变量绑定的值

    def __exit__(self, exc_type, exc_val, exc_tb):
        print("释放资源")
        # 返回 None/False：异常继续传播
        # 返回 True：异常被抑制（不传播）

with MyResource() as r:
    print("使用资源")
print("with 块结束")
\`\`\`

输出：

\`\`\`text
获取资源
使用资源
释放资源
with 块结束
\`\`\`

### 2.2 __exit__ 接收异常信息

\`\`\`python
class DebugContext:
    def __enter__(self):
        print("进入 with 块")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            print("with 块正常结束，无异常")
        else:
            print(f"with 块抛了异常: {exc_type.__name__}: {exc_val}")
        # 返回 None，异常继续传播
\`\`\`

\`\`\`python
with DebugContext():
    print("正常代码")
# 输出：with 块正常结束，无异常

with DebugContext():
    1 / 0
# 输出：with 块抛了异常: ZeroDivisionError: division by zero
# 然后 ZeroDivisionError 继续传播
\`\`\`

## 三、__exit__ 返回 True 会抑制异常

\`__exit__\` 的返回值决定异常是否被抑制：

- 返回 \`True\`：异常被**吞掉**，\`with\` 块外的代码继续执行。
- 返回 \`False\` / \`None\`：异常**继续传播**。

\`\`\`python
class SwallowZeroDivision:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is ZeroDivisionError:
            print("吞掉 ZeroDivisionError")
            return True   # 抑制这个异常
        return False      # 其他异常继续传播

with SwallowZeroDivision():
    1 / 0   # 异常会被 __exit__ 吞掉
print("这行会执行，因为异常被抑制了")
\`\`\`

> 警告：抑制异常要谨慎。如果你不确定为什么异常发生，吞掉它可能掩盖 bug。只在"明确知道异常可以安全忽略"时才返回 \`True\`。

## 四、__exit__ 返回 False/None 会继续传播异常

大多数上下文管理器（如 \`open()\`）的 \`__exit__\` 返回 \`None\`，让异常正常传播——它只负责清理，不负责处理异常：

\`\`\`python
class DatabaseConnection:
    def __enter__(self):
        self.conn = connect()
        return self.conn

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.conn.close()   # 无论是否异常都关闭
        # 不 return 或 return None：异常继续传播
        # 如果有异常，事务需要回滚（见后文）
\`\`\`

## 五、contextlib.contextmanager 装饰器

手写 \`__enter__\` / \`__exit__\` 比较繁琐。\`contextlib.contextmanager\` 把一个生成器函数变成上下文管理器：\`yield\` 前的代码相当于 \`__enter__\`，\`yield\` 后的代码相当于 \`__exit__\`。

\`\`\`python
from contextlib import contextmanager

@contextmanager
def managed_resource(name):
    print(f"获取资源: {name}")
    resource = {"name": name}
    try:
        yield resource   # yield 的值赋给 as 变量
    finally:
        print(f"释放资源: {name}")

with managed_resource("DB") as r:
    print(f"使用资源: {r['name']}")
\`\`\`

### 5.1 在 contextmanager 中处理异常

如果 \`with\` 块里抛了异常，异常会在 \`yield\` 处重新抛出，你可以用 try/except 捕获：

\`\`\`python
@contextmanager
def tolerant_context():
    try:
        yield
    except ValueError as e:
        print(f"吞掉 ValueError: {e}")
    # 其他异常继续传播（没有捕获的）

with tolerant_context():
    raise ValueError("被吞掉")
print("继续执行")
\`\`\`

## 六、contextlib.suppress 忽略指定异常

\`suppress\` 是一个内置的上下文管理器，专门用来"忽略"指定的异常，比 \`try/except: pass\` 更清晰：

\`\`\`python
from contextlib import suppress
import os                           # 导入 os 模块

# 等价于 try: os.remove(path) except FileNotFoundError: pass
with suppress(FileNotFoundError):
    os.remove("/tmp/maybe_not_exist.txt")
print("执行继续")
\`\`\`

\`suppress\` 内部就是 \`__exit__\` 返回 \`True\` 来抑制指定异常。它只抑制你列出的类型，其他异常正常传播。

## 七、contextlib.ExitStack 动态管理多个上下文

当你需要动态地管理数量不定的资源时，用 \`ExitStack\`：

\`\`\`python
from contextlib import ExitStack

files = []
with ExitStack() as stack:
    for path in paths:
        f = stack.enter_context(open(path))
        files.append(f)
    # 所有文件在 with 块结束时自动关闭
\`\`\`

\`ExitStack\` 还能注册回调（\`callback\`）和动态进入上下文，是构建复杂资源管理的利器。

\`\`\`python
with ExitStack() as stack:
    stack.callback(print, "清理 1")
    stack.callback(print, "清理 2")
    print("工作中")
# 退出时按 LIFO 顺序调用回调：清理 2 -> 清理 1
\`\`\`

## 八、自定义上下文管理器处理异常的案例

### 8.1 计时器（记录异常情况）

\`\`\`python
import time

class Timer:
    def __enter__(self):
        self.start = time.time()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        elapsed = time.time() - self.start
        if exc_type is None:
            print(f"耗时 {elapsed:.3f}s（成功）")
        else:
            print(f"耗时 {elapsed:.3f}s（失败: {exc_type.__name__}）")
        return False   # 不抑制异常
\`\`\`

### 8.2 数据库事务回滚

\`\`\`python
class Transaction:
    def __enter__(self):
        self.conn = connect()
        self.conn.begin()
        return self.conn

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            self.conn.commit()   # 无异常，提交
        else:
            self.conn.rollback() # 有异常，回滚
        self.conn.close()
        return False   # 不抑制异常，让上层知道出错了
\`\`\`

## 九、try/finally vs with 的选择

| 特性 | try/finally | with |
| --- | --- | --- |
| 资源管理 | 手动，容易忘 | 自动，强制 |
| 异常处理 | 可以捕获处理 | 主要做清理（也可抑制） |
| 复用性 | 代码重复 | 封装在类里，复用 |
| 可读性 | 嵌套深时差 | 清晰 |
| 灵活性 | 任意清理逻辑 | 需要 \_\_enter\_\_/\_\_exit\_\_ 协议 |

**推荐**：能用 \`with\` 就用 \`with\`（文件、锁、连接），需要复杂清理逻辑或恢复全局状态时用 \`try/finally\`。

## 十、本章小结

- \`with\` 是 \`try/finally\` 的标准化封装，\`__exit__\` 一定被调用。
- \`__exit__(exc_type, exc_val, exc_tb)\` 接收异常信息，返回 \`True\` 抑制异常。
- \`contextlib.contextmanager\` 用生成器简化上下文管理器编写。
- \`contextlib.suppress\` 优雅地忽略指定异常。
- \`contextlib.ExitStack\` 动态管理多个资源。
- 典型应用：计时器、事务回滚、资源管理。

下一章学习 \`assert\` 语句——开发期的断言检查。
`,
    code: `# ============================================================
# 第十章演示：上下文管理器与异常
# ============================================================
import time
from contextlib import contextmanager, suppress, ExitStack

print("=" * 60)
print("第 1 部分：基本 __enter__ / __exit__")
print("=" * 60)

class MyResource:
    """最简单的上下文管理器"""
    def __enter__(self):
        print("    -> 获取资源")
        return self   # as 变量绑定的值

    def __exit__(self, exc_type, exc_val, exc_tb):
        # exc_type 为 None 表示无异常
        if exc_type is None:
            print("    -> 释放资源（正常退出）")
        else:
            print(f"    -> 释放资源（异常: {exc_type.__name__}: {exc_val})")
        return None   # 不抑制异常，让其传播

print("  情况 1：无异常")
with MyResource() as r:
    print("    -> 使用资源中")

print()
print("  情况 2：有异常")
try:
    with MyResource() as r:
        print("    -> 使用资源中")
        raise ValueError("出错了")
except ValueError as e:
    print(f"  外层捕获: {e}")

print()
print("=" * 60)
print("第 2 部分：__exit__ 返回 True 抑制异常")
print("=" * 60)

class SwallowValueError:
    """只吞掉 ValueError 的上下文管理器"""
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is ValueError:
            print(f"    -> 吞掉 ValueError: {exc_val}")
            return True    # 抑制 ValueError
        print(f"    -> 不抑制 {exc_type.__name__ if exc_type else 'None'}")
        return False   # 其他异常继续传播

print("  情况 1：ValueError 被抑制")
with SwallowValueError():
    raise ValueError("这个会被吞掉")
print("  -> with 块后继续执行（异常被抑制）")

print()
print("  情况 2：TypeError 继续传播")
try:
    with SwallowValueError():
        raise TypeError("这个不会被吞")
except TypeError as e:
    print(f"  外层捕获: {e}")

print()
print("=" * 60)
print("第 3 部分：contextmanager 装饰器")
print("=" * 60)

@contextmanager
def managed_section(name):
    """用生成器实现的上下文管理器"""
    print(f"    -> 进入 {name}")
    try:
        yield {"section": name}   # yield 的值给 as 变量
    finally:
        print(f"    -> 退出 {name}")

print("  基本用法:")
with managed_section("数据处理") as ctx:
    print(f"    -> 使用: {ctx}")

print()
print("  异常情况:")
try:
    with managed_section("异常块"):
        raise RuntimeError("块内出错")
except RuntimeError as e:
    print(f"  外层捕获: {e}")

print()
print("=" * 60)
print("第 4 部分：contextmanager 中处理异常")
print("=" * 60)

@contextmanager
def tolerant_of_value_error():
    """在 yield 处捕获 ValueError 并吞掉"""
    try:
        yield
    except ValueError as e:
        print(f"    -> 上下文管理器吞掉 ValueError: {e}")
    # 其他异常没被捕获，会继续传播

print("  ValueError 被上下文管理器吞掉:")
with tolerant_of_value_error():
    raise ValueError("被吞")
print("  -> 继续执行")

print()
print("  TypeError 不被处理，继续传播:")
try:
    with tolerant_of_value_error():
        raise TypeError("不被吞")
except TypeError as e:
    print(f"  外层捕获: {e}")

print()
print("=" * 60)
print("第 5 部分：contextlib.suppress")
print("=" * 60)

import os

print("  suppress 忽略 FileNotFoundError:")
with suppress(FileNotFoundError):
    os.remove("/tmp/这个文件肯定不存在_xxx_suppress.txt")
    print("    -> 删除成功（不会执行，因为文件不存在）")
print("    -> suppress 后继续执行，无需 try/except")

print()
print("  suppress 只忽略指定类型，其他异常仍传播:")
try:
    with suppress(FileNotFoundError):
        1 / 0   # ZeroDivisionError 不在 suppress 范围
except ZeroDivisionError as e:
    print(f"    -> 捕获到 ZeroDivisionError: {e}")

print()
print("  对比：try/except pass vs suppress")
print("    try:")
print("      try: os.remove(path)")
print("      except FileNotFoundError: pass")
print("    suppress 更简洁：")
print("      with suppress(FileNotFoundError): os.remove(path)")

print()
print("=" * 60)
print("第 6 部分：ExitStack 动态管理多个资源")
print("=" * 60)

class FakeFile:
    """模拟文件资源"""
    def __init__(self, name):
        self.name = name
        self.closed = False
    def close(self):
        self.closed = True
        print(f"    -> 关闭 {self.name}")

@contextmanager
def open_fake(name):
    """模拟打开文件的上下文管理器"""
    f = FakeFile(name)
    print(f"    -> 打开 {name}")
    try:
        yield f
    finally:
        f.close()

# 动态打开多个文件
paths = ["file1.txt", "file2.txt", "file3.txt"]
print("  动态管理多个文件:")
with ExitStack() as stack:
    files = [stack.enter_context(open_fake(p)) for p in paths]
    print(f"    -> 使用 {len(files)} 个文件")
    for f in files:
        print(f"       - {f.name} (closed={f.closed})")
# 退出时按 LIFO 顺序关闭

print()
print("  ExitStack 注册回调:")
with ExitStack() as stack:
    stack.callback(print, "    -> 清理回调 1")
    stack.callback(print, "    -> 清理回调 2")
    stack.callback(print, "    -> 清理回调 3")
    print("    -> 主体工作")
# 退出时 LIFO: 3 -> 2 -> 1

print()
print("=" * 60)
print("第 7 部分：计时器上下文管理器")
print("=" * 60)

class Timer:
    """计时器，记录执行时间和成功/失败"""
    def __enter__(self):
        self.start = time.time()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.elapsed = time.time() - self.start
        if exc_type is None:
            print(f"    -> 耗时 {self.elapsed:.6f}s（成功）")
        else:
            print(f"    -> 耗时 {self.elapsed:.6f}s（失败: {exc_type.__name__}）")
        return False   # 不抑制异常

print("  计时成功操作:")
with Timer():
    total = sum(range(100000))
    print(f"    -> 计算结果: {total}")

print()
print("  计时失败操作:")
try:
    with Timer():
        raise ValueError("计算失败")
except ValueError as e:
    print(f"  外层捕获: {e}")

print()
print("=" * 60)
print("第 8 部分：数据库事务回滚（模拟）")
print("=" * 60)

class FakeDB:
    """模拟数据库连接"""
    def __init__(self, name):
        self.name = name
        self.committed = False
        self.rolled_back = False
        self.closed = False
    def begin(self):
        print(f"    -> [{self.name}] 开启事务")
    def commit(self):
        self.committed = True
        print(f"    -> [{self.name}] 提交事务")
    def rollback(self):
        self.rolled_back = True
        print(f"    -> [{self.name}] 回滚事务")
    def close(self):
        self.closed = True
        print(f"    -> [{self.name}] 关闭连接")
    def execute(self, sql):
        print(f"    -> [{self.name}] 执行: {sql}")

class Transaction:
    """事务上下文管理器：异常时回滚，正常时提交"""
    def __init__(self, db):
        self.db = db
    def __enter__(self):
        self.db.begin()
        return self.db
    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            if exc_type is None:
                self.db.commit()   # 无异常，提交
            else:
                self.db.rollback() # 有异常，回滚
        finally:
            self.db.close()
        return False   # 不抑制异常

# 场景 1：正常提交
print("  场景 1：事务成功提交")
db1 = FakeDB("DB-1")
with Transaction(db1) as conn:
    conn.execute("INSERT INTO users VALUES (1, 'Alice')")
    conn.execute("INSERT INTO users VALUES (2, 'Bob')")
print(f"    提交={db1.committed}, 回滚={db1.rolled_back}")

print()
# 场景 2：异常回滚
print("  场景 2：事务异常回滚")
db2 = FakeDB("DB-2")
try:
    with Transaction(db2) as conn:
        conn.execute("INSERT INTO users VALUES (1, 'Alice')")
        raise RuntimeError("第二条插入失败")
        conn.execute("INSERT INTO users VALUES (2, 'Bob')")  # 不会执行
except RuntimeError as e:
    print(f"  外层捕获: {e}")
print(f"    提交={db2.committed}, 回滚={db2.rolled_back}")

print()
print("=" * 60)
print("第 9 部分：try/finally vs with 对比")
print("=" * 60)

class Lock:
    """模拟锁"""
    def __init__(self, name):
        self.name = name
        self.locked = False
    def acquire(self):
        self.locked = True
        print(f"    -> 加锁 {self.name}")
    def release(self):
        self.locked = False
        print(f"    -> 解锁 {self.name}")

# try/finally 写法
print("  try/finally 写法:")
lock = Lock("L1")
lock.acquire()
try:
    print("    -> 临界区工作")
finally:
    lock.release()

print()
# with 写法（需要包装成上下文管理器）
@contextmanager
def locked(lock):
    lock.acquire()
    try:
        yield
    finally:
        lock.release()

print("  with 写法:")
lock2 = Lock("L2")
with locked(lock2):
    print("    -> 临界区工作")

print()
print("全部演示完成。")
`,
  },

  // =========================================================
  // 第十一章：assert 语句与断言
  // =========================================================
  {
    id: "pyex-assert",
    group: "高级与实战",
    icon: "⚡",
    title: "assert 语句与断言",
    content: `# assert 语句与断言

\`assert\` 是 Python 里一个"特殊"的语句：它看起来像检查，但能被全局禁用。很多人误用 \`assert\` 做参数校验，结果在生产环境（用 \`python -O\` 启动）校验全部失效，酿成安全漏洞。本章彻底讲清 \`assert\` 的原理、正确用法和致命误区。

## 一、assert 语法和原理

\`assert\` 语句的形式：

\`\`\`python
assert 表达式                    # 表达式为 False 时抛 AssertionError
assert 表达式, 消息              # 带消息的断言
\`\`\`

\`\`\`python
assert x > 0                     # 如果 x <= 0，抛 AssertionError
assert x > 0, f"x 必须为正, 得到 {x}"   # 带消息
\`\`\`

### 1.1 assert 的等价形式

\`assert condition, message\` 在没有 \`-O\` 优化时等价于：

\`\`\`python
if __debug__:
    if not condition:
        raise AssertionError(message)
\`\`\`

\`__debug__\` 是一个内置常量，正常情况下为 \`True\`。当用 \`python -O\` 启动时，\`__debug__\` 变成 \`False\`，所有 \`assert\` 语句被编译成空操作（不执行）。

## 二、AssertionError 异常

\`assert\` 失败时抛出 \`AssertionError\`，它继承自 \`Exception\`：

\`\`\`python
try:                               # 尝试执行以下代码块
    assert False, "断言失败"
except AssertionError as e:
    print(e)   # 断言失败
\`\`\`

理论上 \`AssertionError\` 可以被 \`except\` 捕获，但**不应该**这么做——断言失败意味着 bug，应该让它崩溃并修复代码，而不是"处理"掉。

## 三、assert 的第二个参数（消息）

\`\`\`python
def divide(a, b):
    assert b != 0, f"除数不能为 0，得到 b={b}"
    return a / b
\`\`\`

消息会被存到 \`AssertionError.args\`，调试时能看到。好的断言消息应该说明"期望什么、实际什么"：

\`\`\`python
# 好的消息
assert isinstance(x, int), f"x 必须是 int，得到 {type(x).__name__}"
assert len(data) > 0, f"data 不能为空，得到长度 {len(data)}"

# 差的消息（没说清楚）
assert x
assert data
\`\`\`

## 四、assert 与 if/raise 的区别

\`\`\`python
# 用 assert
def divide(a, b):
    assert b != 0, "除数不能为 0"
    return a / b

# 用 if/raise
def divide(a, b):
    if b == 0:
        raise ValueError("除数不能为 0")
    return a / b
\`\`\`

| 特性 | assert | if/raise |
| --- | --- | --- |
| 能被禁用 | 是（python -O） | 否 |
| 异常类型 | AssertionError | 任意（ValueError 等） |
| 用途 | 开发期不变式检查 | 运行时校验 |
| 失败含义 | 程序有 bug | 用户输入/外部条件错 |
| 生产环境 | 可能被禁用 | 总是执行 |

**核心区别**：\`assert\` 是"开发期检查"，能被禁用；\`if/raise\` 是"运行时校验"，永远执行。

## 五、assert 可以被禁用——不能用于数据校验！

这是 \`assert\` 最重要的特性，也是最常被误用的地方。用 \`python -O\`（optimize）启动时，\`__debug__\` 为 \`False\`，所有 \`assert\` 语句被**完全移除**，不执行：

\`\`\`bash
# 正常启动：assert 生效
python script.py

# 优化模式：assert 全部失效！
python -O script.py
\`\`\`

### 5.1 致命的误用：用 assert 做权限校验

\`\`\`python
# 危险！用 -O 启动后这段校验完全消失
def delete_user(user_id):
    assert current_user.is_admin, "需要管理员权限"   # -O 下被移除
    db.delete(user_id)   # 任何人都能删除！
\`\`\`

如果生产环境用 \`python -O\`（很多框架为了性能会这么做），\`assert\` 被移除，权限校验形同虚设——这是**安全漏洞**。

### 5.2 正确做法：用 if/raise

\`\`\`python
def delete_user(user_id):
    if not current_user.is_admin:
        raise PermissionError("需要管理员权限")   # 永远执行
    db.delete(user_id)
\`\`\`

\`raise\` 不会被 \`-O\` 移除，无论怎么启动都会校验。

## 六、assert 的正确用途

\`assert\` 用于**开发期不变式检查（invariant checking）**——断言"程序逻辑上一定为真"的条件，如果为假说明代码有 bug。

### 6.1 检查函数内部不变式

\`\`\`python
def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        assert lo <= mid <= hi, f"mid 越界: lo={lo}, mid={mid}, hi={hi}"  # 不变式
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
\`\`\`

如果 \`mid\` 越界，说明算法实现有 bug，断言帮你在开发期立刻发现。

### 6.2 检查前后置条件

\`\`\`python
def sort_list(lst):
    assert isinstance(lst, list), "输入必须是 list"   # 前置条件（开发期）
    result = sorted(lst)
    assert result == sorted(result), "排序结果不正确"  # 后置条件
    return result
\`\`\`

### 6.3 检查"不可能"的状态

\`\`\`python
def handle_event(event):
    if event.type == "click":
        ...
    elif event.type == "scroll":
        ...
    elif event.type == "key":
        ...
    else:
        # 理论上不应该到这里
        assert False, f"未知事件类型: {event.type}"
\`\`\`

如果未来加了新事件类型但忘了处理，断言会提醒你。

### 6.4 检查私有函数的内部假设

\`\`\`python
def _normalize(data):
    # 私有函数，假设调用方已校验
    assert all(x >= 0 for x in data), "data 应该已经校验过非负"  # 开发期确认假设
    return [x / sum(data) for x in data]
\`\`\`

## 七、assert 的错误用法

### 7.1 参数校验（公开 API）

\`\`\`python
# 错误：公开 API 用 assert 校验参数
def create_account(name, age):
    assert isinstance(name, str), "name 必须是字符串"   # -O 下失效
    assert age >= 0, "age 不能为负"                      # -O 下失效
    ...
\`\`\`

公开 API 的参数校验必须用 \`if/raise\`，因为用户可能用 \`-O\` 启动。

### 7.2 权限检查

\`\`\`python
# 错误：用 assert 检查权限
def admin_action():
    assert is_admin(), "需要管理员权限"   # -O 下任何人可执行
    ...
\`\`\`

### 7.3 数据完整性检查

\`\`\`python
# 错误：用 assert 检查数据
def transfer(amount):
    assert amount > 0, "金额必须为正"   # -O 下可转负数
    assert balance >= amount, "余额不足"  # -O 下可透支
    ...
\`\`\`

## 八、断言失败应该意味着 bug

记住这条原则：**\`assert\` 失败 = 程序员写错了代码**，不是用户操作错了。

- 用户输入了非法值 → 用 \`if/raise ValueError\`（用户错误）。
- 内部状态违反了不变式 → 用 \`assert\`（程序员 bug）。

\`\`\`python
# 用户错误：if/raise
def set_age(age):
    if not isinstance(age, int) or age < 0:
        raise ValueError(f"age 不合法: {age}")  # 用户输入错
    self.age = age

# 程序 bug：assert
def _update_balance(self, delta):
    assert isinstance(delta, (int, float)), "内部调用应该保证 delta 是数字"  # 开发期假设
    self.balance += delta
\`\`\`

## 九、__debug__ 变量

\`__debug__\` 是内置常量，控制 \`assert\` 是否生效：

\`\`\`python
print(__debug__)   # 正常模式: True；-O 模式: False
\`\`\`

你也可以用它写"只在开发期执行"的代码：

\`\`\`python
if __debug__:
    # 这段代码在 -O 模式下不会执行
    expensive_validation(data)
\`\`\`

## 十、unittest 中的 assertXXX 方法

测试框架里的 \`self.assertEqual\`、\`self.assertTrue\` 等是**普通方法**，不是 \`assert\` 语句，它们**不受 \`-O\` 影响**，永远执行：

\`\`\`python
import unittest

class TestMath(unittest.TestCase):
    def test_add(self):
        self.assertEqual(1 + 1, 2)   # 这是方法调用，不是 assert 语句
        self.assertTrue(len("abc") == 3)
\`\`\`

所以测试代码用 \`self.assertXxx\` 是安全的，不要误以为它们会被禁用。

## 十一、本章小结

- \`assert condition, msg\` 失败时抛 \`AssertionError\`，可被 \`-O\` 禁用。
- \`assert\` 用于**开发期不变式检查**，失败意味着 bug。
- \`if/raise\` 用于**运行时校验**，永远执行，用于参数/权限/数据校验。
- **绝对不要用 \`assert\` 做安全相关校验**（权限、金额），\`-O\` 下会失效。
- 测试里的 \`self.assertXxx\` 是方法，不受 \`-O\` 影响。

下一章是本系列的总结，讲解异常处理最佳实践和真实项目案例。
`,
    code: `# ============================================================
# 第十一章演示：assert 语句与断言
# ============================================================
import sys

print("=" * 60)
print("第 1 部分：assert 基本用法")
print("=" * 60)

# 基本断言
x = 10
assert x > 0   # 通过，不抛异常
print(f"  assert x > 0 通过 (x={x})")

# 带消息的断言
y = -5
try:
    assert y > 0, f"y 必须为正, 得到 y={y}"
except AssertionError as e:
    print(f"  assert y > 0 失败: {e}")

# 断言相等
assert 1 + 1 == 2, "算术错误"
print("  assert 1 + 1 == 2 通过")

# 断言类型
name = "Alice"
assert isinstance(name, str), "name 必须是字符串"
print(f"  assert isinstance(name, str) 通过 (name={name!r})")

print()
print("=" * 60)
print("第 2 部分：AssertionError 异常")
print("=" * 60)

# AssertionError 继承自 Exception
print(f"  AssertionError 是 Exception 子类: {issubclass(AssertionError, Exception)}")

# 可以捕获（但不推荐"处理"，应该修 bug）
try:
    assert False, "演示断言失败"
except AssertionError as e:
    print(f"  捕获到 AssertionError: {e}")
    print(f"  args: {e.args}")

print()
print("=" * 60)
print("第 3 部分：__debug__ 变量与 -O 模式")
print("=" * 60)

# __debug__ 控制 assert 是否生效
print(f"  __debug__ = {__debug__}")
if __debug__:
    print("  -> 正常模式，assert 生效")
else:
    print("  -> 优化模式 (-O)，assert 被禁用")

# 用 __debug__ 写开发期代码
def process_data(data):
    if __debug__:
        # 这段代码在 -O 模式下不执行
        print(f"    [debug] 输入数据长度: {len(data)}")
        assert all(isinstance(x, (int, float)) for x in data), "data 应全是数字"
    return sum(data) / len(data) if data else 0

print(f"  process_data([1, 2, 3]) = {process_data([1, 2, 3])}")

print()
print("=" * 60)
print("第 4 部分：正确用法——不变式检查")
print("=" * 60)

def binary_search(arr, target):
    """二分查找，用 assert 检查内部不变式"""
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        # 不变式：mid 应该在 [lo, hi] 范围内
        assert lo <= mid <= hi, f"mid 越界: lo={lo}, mid={mid}, hi={hi}"
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

# 测试
data = [1, 3, 5, 7, 9, 11, 13]
idx = binary_search(data, 7)
print(f"  binary_search 找到 7 在位置: {idx}")
assert idx == 3, "二分查找结果应该正确"

# 检查"不可能"的状态
def handle_event(event_type):
    """处理事件，未知类型断言失败"""
    if event_type == "click":
        return "处理点击"
    elif event_type == "scroll":
        return "处理滚动"
    elif event_type == "key":
        return "处理按键"
    else:
        # 理论上不应该到这里
        assert False, f"未知事件类型: {event_type}"

print(f"  handle_event('click') = {handle_event('click')!r}")
try:
    handle_event("unknown")
except AssertionError as e:
    print(f"  handle_event('unknown') 断言失败: {e}")

print()
print("=" * 60)
print("第 5 部分：正确用法——前后置条件")
print("=" * 60)

def sort_list(lst):
    """排序，用 assert 检查前后置条件"""
    # 前置条件
    assert isinstance(lst, list), f"输入必须是 list，得到 {type(lst).__name__}"
    n = len(lst)
    result = sorted(lst)
    # 后置条件：结果应该有序
    assert all(result[i] <= result[i+1] for i in range(len(result)-1)), "排序结果无序"
    assert len(result) == n, f"长度变化: 输入 {n}, 输出 {len(result)}"
    return result

print(f"  sort_list([3, 1, 2]) = {sort_list([3, 1, 2])}")
print(f"  sort_list([]) = {sort_list([])}")

print()
print("=" * 60)
print("第 6 部分：错误用法——参数校验（演示，勿模仿）")
print("=" * 60)

# 错误示范：用 assert 校验公开 API 参数
def bad_create_account(name, age):
    """错误：公开 API 用 assert，-O 下校验消失"""
    assert isinstance(name, str), "name 必须是字符串"   # -O 下失效！
    assert isinstance(age, int), "age 必须是整数"       # -O 下失效！
    assert age >= 0, "age 不能为负"                      # -O 下失效！
    return {"name": name, "age": age}

# 正确示范：用 if/raise 校验
def good_create_account(name, age):
    """正确：用 if/raise，永远生效"""
    if not isinstance(name, str):
        raise TypeError(f"name 必须是字符串，得到 {type(name).__name__}")
    if not isinstance(age, int):
        raise TypeError(f"age 必须是整数，得到 {type(age).__name__}")
    if age < 0 or age > 150:
        raise ValueError(f"age 范围 0-150，得到 {age}")
    return {"name": name, "age": age}

# 对比
print("  错误写法（assert，-O 下失效）:")
try:
    bad_create_account(123, -5)   # 正常模式能拦住
except AssertionError as e:
    print(f"    被拦住: {e}")
print("    警告: 如果用 python -O 启动，这些校验会全部消失！")

print()
print("  正确写法（if/raise，永远生效）:")
try:
    good_create_account(123, -5)
except (TypeError, ValueError) as e:
    print(f"    被拦住: {type(e).__name__}: {e}")

print()
print("=" * 60)
print("第 7 部分：错误用法——权限检查（安全漏洞）")
print("=" * 60)

# 模拟当前用户
class CurrentUser:
    is_admin = False
current_user = CurrentUser()

# 错误：用 assert 检查权限
def bad_delete_user(user_id):
    assert current_user.is_admin, "需要管理员权限"  # -O 下失效！
    return f"已删除用户 {user_id}"

# 正确：用 if/raise 检查权限
def good_delete_user(user_id):
    if not current_user.is_admin:
        raise PermissionError("需要管理员权限")  # 永远生效
    return f"已删除用户 {user_id}"

print("  错误写法（assert 检查权限）:")
try:
    result = bad_delete_user(1)   # 正常模式可能被拦
    print(f"    {result}")
except AssertionError as e:
    print(f"    被拦住: {e}")
print("    警告: -O 模式下非管理员也能删除！这是安全漏洞")

print()
print("  正确写法（if/raise 检查权限）:")
try:
    good_delete_user(1)
except PermissionError as e:
    print(f"    被拦住: {e}")

print()
print("=" * 60)
print("第 8 部分：断言失败 = bug，不是用户错误")
print("=" * 60)

# 区分：用户错误用 if/raise，程序 bug 用 assert
class BankAccount:
    def __init__(self, balance):
        # 公开 API：用户输入校验用 if/raise
        if balance < 0:
            raise ValueError("初始余额不能为负")  # 用户错误
        self.balance = balance

    def _internal_transfer(self, amount):
        # 私有方法：内部假设用 assert
        assert amount > 0, f"内部调用应保证 amount 为正: {amount}"  # 程序 bug
        assert self.balance >= amount, f"内部应已校验余额: {self.balance} < {amount}"
        self.balance -= amount
        return amount

# 正常使用
acc = BankAccount(1000)
transferred = acc._internal_transfer(300)
print(f"  转账成功: {transferred}, 余额: {acc.balance}")

# 用户错误：初始余额为负（用 if/raise 拦）
try:
    BankAccount(-100)
except ValueError as e:
    print(f"  用户错误被拦: {e}")

# 程序 bug：内部调用传了负数（用 assert 拦）
try:
    acc._internal_transfer(-50)
except AssertionError as e:
    print(f"  程序 bug 被断言拦住: {e}")

print()
print("=" * 60)
print("第 9 部分：unittest 的 assertXXX 不受 -O 影响")
print("=" * 60)

# 演示测试框架的方法是普通方法调用，不是 assert 语句
import unittest

class TestExample(unittest.TestCase):
    def test_demo(self):
        # 这些是方法调用，不是 assert 语句，不受 -O 影响
        self.assertEqual(1 + 1, 2)
        self.assertTrue(isinstance("a", str))
        self.assertIn(2, [1, 2, 3])

# 运行测试（简化版，不真的用 unittest.main）
t = TestExample()
t.test_demo()
print("  unittest 的 assertEqual/assertTrue 等是方法调用，不是 assert 语句")
print("  -> 不受 python -O 影响，测试中可以放心使用")

print()
print("=" * 60)
print("第 10 部分：总结对比")
print("=" * 60)

print("  assert vs if/raise 对比:")
print("  +------------------+-------------------+-------------------+")
print("  | 特性             | assert            | if/raise          |")
print("  +------------------+-------------------+-------------------+")
print("  | 能被 -O 禁用     | 是                | 否                |")
print("  | 异常类型         | AssertionError    | 任意              |")
print("  | 用途             | 开发期不变式检查  | 运行时校验        |")
print("  | 失败含义         | 程序 bug          | 用户/外部错误     |")
print("  | 适用场景         | 内部假设、私有函数 | 公开 API、参数校验|")
print("  +------------------+-------------------+-------------------+")

print()
print("全部演示完成。")
`,
  },

  // =========================================================
  // 第十二章：异常处理最佳实践与真实案例
  // =========================================================
  {
    id: "pyex-best-practices",
    group: "高级与实战",
    icon: "📚",
    title: "异常处理最佳实践与真实案例",
    content: `# 异常处理最佳实践与真实案例

前面十一章我们学了异常的语法、捕获、抛出、自定义、链、上下文管理器、断言。本章是总结篇：把零散知识整合成一套**工程实践方法论**，并用真实项目案例（Web 框架、数据库事务、重试机制、批处理）演示如何落地。

## 一、异常处理的黄金法则

> **只捕获你能处理的异常，让它处理不了的传播出去。**

这句话是异常处理的灵魂。展开来说：

1. **精确捕获**：捕获你能处理的具体异常，不要 \`except Exception\` 一把梭。
2. **要么处理，要么传播**：不要 \`except: pass\` 吞掉异常。
3. **处理要彻底**：要么恢复，要么转换成更合适的异常，要么记录后重抛。
4. **不要假装没发生**：异常是真实的错误，假装不存在只会让 bug 更难找。

\`\`\`python
# 反面教材
try:                               # 尝试执行以下代码块
    do_everything()
except Exception:
    pass   # 吞掉所有错误，灾难

# 正确做法
try:                               # 尝试执行以下代码块
    data = load_config()           # 只包住可能出错的部分
except FileNotFoundError:
    data = default_config()        # 文件不存在，用默认值（这是"处理"）
except json.JSONDecodeError as e:
    log.error("配置文件格式错误: %s", e)
    raise   # 不能处理的，记录后重抛
\`\`\`

## 二、EAFP vs LBYL

Python 社区推崇两种编程风格：

- **EAFP**（Easier to Ask Forgiveness than Permission）：先做，出错了再处理。
- **LBYL**（Look Before You Leap）：先检查，没问题再做。

\`\`\`python
# LBYL：先检查
if key in data:
    value = data[key]
else:
    value = None

# EAFP：先做，捕获异常
try:
    value = data[key]
except KeyError:
    value = None
\`\`\`

Python 风格指南**推荐 EAFP**，原因：

1. **避免竞态条件**：LBYL 的检查和使用之间状态可能变化（\`if os.path.exists(p)\` 后文件可能被删）。
2. **更简洁**：try/except 比 if/else 嵌套少。
3. **更 Pythonic**：这是社区共识。

但 EAFP 不是绝对的——当"失败是常见且廉价的"时，LBYL 更合适（比如 \`dict.get\` 比捕获 \`KeyError\` 快）。

\`\`\`python
# EAFP 适合：失败少见且昂贵
try:
    with open(path) as f:
        data = f.read()
except FileNotFoundError:
    data = ""

# LBYL 适合：失败常见且廉价
value = data.get(key, default)   # 比 try/except KeyError 快
\`\`\`

## 三、异常粒度：try 块要尽量小

\`\`\`python
# 不好：try 块太大，混在一起
try:                               # 尝试执行以下代码块
    data = open(path).read()      # OSError
    config = json.loads(data)     # JSONDecodeError
    result = process(config)      # 各种业务异常
    save(result)                  # OSError
except Exception:
    log("出错了")                  # 到底哪一步出错？

# 好：try 块精确，分别处理
try:                               # 尝试执行以下代码块
    data = open(path).read()
except FileNotFoundError:
    data = default_data()

try:
    config = json.loads(data)
except json.JSONDecodeError as e:
    raise ConfigError("配置格式错误") from e

result = process(config)   # 让业务异常自然传播
\`\`\`

## 四、不要捕获你无法处理的异常

\`\`\`python
# 错误：捕获了但不知道怎么处理
try:                               # 尝试执行以下代码块
    business_logic()
except Exception as e:
    pass   # 你根本不知道 business_logic 抛什么，吞掉就是埋雷

# 正确：让异常传播，让上层（可能更了解上下文）处理
def caller():
    try:                           # 尝试执行以下代码块
        business_logic()
    except SpecificBusinessError as e:
        # 只捕获你能处理的
        handle_specific(e)
    # 其他异常自然传播
\`\`\`

## 五、日志记录最佳实践

### 5.1 logging.exception 自动记录 traceback

\`\`\`python
import logging
logger = logging.getLogger(__name__)

try:                               # 尝试执行以下代码块
    risky()
except Exception:
    logger.exception("操作失败")   # 自动带 traceback
    raise
\`\`\`

\`logger.exception\` 必须在 except 块里调用，它会自动附加当前异常的 traceback。

### 5.2 traceback 模块格式化

\`\`\`python
import traceback

try:                               # 尝试执行以下代码块
    risky()
except Exception as e:
    # 获取格式化的 traceback 字符串
    tb_str = ''.join(traceback.format_exception(type(e), e, e.__traceback__))
    log.error("失败:\\n" + tb_str)
\`\`\`

## 六、异常与函数设计

设计函数时，要决定"这个错误该函数处理，还是让调用方处理"：

- **函数能恢复** → 内部捕获，返回正常值或默认值。
- **函数无法恢复但调用方可能能处理** → 抛语义化异常。
- **错误是程序 bug** → 不要捕获，让它崩溃（fail fast）。

\`\`\`python
def find_user(user_id):
    # 能恢复：返回 None 表示找不到
    return db.get(user_id)

def get_required_user(user_id):
    # 调用方需要明确处理"不存在"：抛异常
    user = db.get(user_id)
    if user is None:
        raise UserNotFoundError(user_id)
    return user
\`\`\`

## 七、异常与 API 设计

公开 API 应该**声明可能抛出的异常**（文档/类型注解），并尽量抛**语义化**的异常：

\`\`\`python
def withdraw(account, amount):
    """取款

    Args:
        account: 账户对象
        amount: 取款金额

    Raises:
        ValueError: amount 非正或超过余额
        AccountClosedError: 账户已关闭
    """
    if amount <= 0:
        raise ValueError("amount 必须为正")
    ...
\`\`\`

API 异常是**契约的一部分**，不要随便改异常类型，否则调用方代码会崩。

## 八、性能考量

异常处理在"不抛异常"时几乎零开销（现代 Python 优化过）。但**抛异常**的开销不小（构造对象、收集 traceback、栈展开），所以：

- 不要用异常做正常控制流（每秒抛几千次异常就是滥用）。
- 真正的错误路径上，异常开销可以忽略。
- 热点路径里，用 LBYL（\`dict.get\`、\`getattr\` 默认值）代替 EAFP。

\`\`\`python
# 慢：异常做控制流
def get_all(data, keys):
    result = []
    for k in keys:
        try:
            result.append(data[k])
        except KeyError:
            result.append(None)
    return result

# 快：用 get
def get_all(data, keys):
    return [data.get(k) for k in keys]
\`\`\`

## 九、调试技巧

### 9.1 breakpoint()

\`\`\`python
try:                               # 尝试执行以下代码块
    risky()
except Exception:
    breakpoint()   # 进入交互式调试器，可以 inspect 现场
    raise
\`\`\`

### 9.2 traceback 模块

\`\`\`python
import traceback

try:                               # 尝试执行以下代码块
    risky()
except Exception as e:
    # 打印完整 traceback 到 stderr
    traceback.print_exc()
    # 或者获取字符串
    tb = traceback.format_exc()
\`\`\`

### 9.3 sys.exc_info()

\`\`\`python
import sys

try:                               # 尝试执行以下代码块
    risky()
except Exception:
    exc_type, exc_val, exc_tb = sys.exc_info()
    print(f"类型: {exc_type}, 值: {exc_val}")
\`\`\`

## 十、真实项目案例分析

### 10.1 Web 框架的异常处理

Django/Flask 用中间件统一捕获异常，转换成 HTTP 响应：

\`\`\`python
# Flask 风格的错误处理
@app.errorhandler(404)
def not_found(e):
    return render_template("404.html"), 404

@app.errorhandler(Exception)
def handle_exception(e):
    logger.exception("未捕获异常")
    return render_template("500.html"), 500
\`\`\`

业务代码抛业务异常，框架统一处理：

\`\`\`python
class PaymentError(Exception): ...

@app.route("/pay")
def pay():
    try:
        process_payment()
    except PaymentError as e:
        return {"error": str(e)}, 400   # 业务错误返回 4xx
    except Exception:
        logger.exception("系统错误")
        return {"error": "内部错误"}, 500  # 系统错误返回 5xx
\`\`\`

### 10.2 数据库事务的异常处理

\`\`\`python
def transfer(from_id, to_id, amount):
    """转账，用 with 管理事务"""
    with db.transaction():   # 异常时自动回滚
        from_acc = db.get(Account, from_id)
        to_acc = db.get(Account, to_id)
        if from_acc.balance < amount:
            raise InsufficientBalanceError(from_id, from_acc.balance, amount)
        from_acc.balance -= amount
        to_acc.balance += amount
        db.save(from_acc)
        db.save(to_acc)
    # with 正常退出时提交，异常时回滚
\`\`\`

### 10.3 重试机制（retry pattern）

网络请求、外部 API 调用常用重试模式：

\`\`\`python
import time
from functools import wraps

def retry(max_retries=3, delay=1, exceptions=(Exception,)):
    """重试装饰器"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(1, max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    logger.warning(f"第 {attempt} 次失败: {e}")
                    if attempt < max_retries:
                        time.sleep(delay)
            raise last_exception
        return wrapper
    return decorator

@retry(max_retries=3, delay=0.1, exceptions=(ConnectionError, TimeoutError))
def fetch_data(url):
    return requests.get(url).json()
\`\`\`

### 10.4 批处理的容错策略

处理大量数据时，一条出错不应中断整个批处理：

\`\`\`python
def process_batch(records):
    success, failures = [], []
    for i, record in enumerate(records):
        try:
            result = process(record)
            success.append(result)
        except (ValueError, KeyError) as e:
            # 已知错误：记录并跳过
            failures.append({"index": i, "error": str(e)})
            logger.warning(f"记录 {i} 处理失败: {e}")
        except Exception as e:
            # 未知错误：记录完整 traceback，但仍继续
            failures.append({"index": i, "error": str(e), "traceback": traceback.format_exc()})
            logger.exception(f"记录 {i} 未知错误")
    return {"success": success, "failures": failures}
\`\`\`

## 十一、异常处理检查清单

写完一段异常处理代码，对照这张清单检查：

- [ ] 是否捕获了**过于宽泛**的异常（\`except Exception\` / 裸 \`except\`）？
- [ ] 是否 \`except: pass\` 吞掉了错误？
- [ ] \`try\` 块是否**过大**，混入了不该捕获的代码？
- [ ] 捕获后是否**真的处理**了（恢复/转换/记录重抛），还是假装没发生？
- [ ] 是否用了 \`logging.exception\` 而不是 \`print\` 记录错误？
- [ ] 重新抛出是否用了裸 \`raise\`（保留 traceback）？
- [ ] 转换异常是否用了 \`raise X from e\`（保留原因）？
- [ ] 公开 API 是否用 \`if/raise\` 而非 \`assert\` 校验参数？
- [ ] 资源是否用了 \`with\` 管理而非手动 \`try/finally\`？
- [ ] 循环里的异常是否在循环内捕获（避免一条出错中断全部）？

## 十二、本章小结

- 黄金法则：只捕获能处理的异常，让它处理不了的传播。
- Python 偏好 EAFP，但热点路径用 LBYL（\`dict.get\`、\`getattr\` 默认值）。
- \`try\` 块要小，捕获要精确，处理要彻底。
- 用 \`logging.exception\` 记录错误，用 \`traceback\` 模块格式化。
- 真实场景：Web 框架中间件统一处理、数据库事务自动回滚、重试装饰器、批处理容错。
- 对照检查清单，审查自己的异常处理代码。

恭喜你完成整个 Python 异常处理教程！从认识异常、捕获处理，到主动抛出、自定义、异常链，再到上下文管理器、断言、最佳实践——你现在具备了写出工业级健壮代码的全部知识。
`,
    code: `# ============================================================
# 第十二章演示：异常处理最佳实践与真实案例
# ============================================================
import logging
import traceback
import sys
import time
from functools import wraps
from contextlib import contextmanager

# 配置日志（输出到 stderr，简化演示）
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s", stream=sys.stderr)
logger = logging.getLogger(__name__)

print("=" * 60)
print("第 1 部分：EAFP vs LBYL 对比")
print("=" * 60)

data = {"a": 1, "b": 2, "c": 3}
keys = ["a", "x", "b", "y", "c"]

# LBYL：先检查
print("  LBYL 风格（先检查）:")
result_lbyl = []
for k in keys:
    if k in data:
        result_lbyl.append(data[k])
    else:
        result_lbyl.append(None)
print(f"    结果: {result_lbyl}")

# EAFP：先做，捕获异常
print("  EAFP 风格（先做后捕获）:")
result_eafp = []
for k in keys:
    try:
        result_eafp.append(data[k])
    except KeyError:
        result_eafp.append(None)
print(f"    结果: {result_eafp}")

# 推荐场景对比
print("  EAFP 适合：失败少见（如文件操作）")
print("  LBYL 适合：失败常见且廉价（如 dict.get）")
print(f"    dict.get 风格: {[data.get(k) for k in keys]}")

print()
print("=" * 60)
print("第 2 部分：try 块要小——对比")
print("=" * 60)

import json

# 反面：try 块太大
def bad_process(config_text):
    try:
        data = config_text                    # 可能没问题
        config = json.loads(data)             # JSONDecodeError
        port = config["port"]                 # KeyError
        result = 1000 / port                  # ZeroDivisionError / TypeError
        return result
    except Exception as e:
        print(f"    [bad] 不知道哪步出错: {type(e).__name__}: {e}")
        return None

# 正面：try 块精确
def good_process(config_text):
    try:
        config = json.loads(config_text)
    except json.JSONDecodeError as e:
        print(f"    [good] JSON 解析失败: {e}")
        return None

    try:
        port = config["port"]
    except KeyError:
        print(f"    [good] 缺少 port 字段，用默认 8080")
        port = 8080

    try:
        result = 1000 / port
    except (TypeError, ZeroDivisionError) as e:
        print(f"    [good] 计算失败: {e}")
        return None

    return result

print("  bad_process('{bad json}'):")
bad_process("{bad json}")
print("  good_process('{bad json}'):")
good_process("{bad json}")

print()
print("  bad_process('{\\"port\\": 0}'):")
bad_process('{"port": 0}')
print("  good_process('{\\"port\\": 0}'):")
good_process('{"port": 0}')

print()
print("=" * 60)
print("第 3 部分：logging.exception 记录完整 traceback")
print("=" * 60)

# logging.exception 会自动记录 traceback（输出到 stderr）
def risky_operation():
    raise ValueError("演示错误：数据不合法")

try:
    try:
        risky_operation()
    except ValueError:
        print("  捕获到错误，用 logging.exception 记录（traceback 在 stderr）:")
        logger.exception("操作失败")   # 自动带 traceback
        print("  记录后重新抛出")
        raise
except ValueError:
    print("  外层捕获到重新抛出的异常（演示 re-raise 完成）")

print()
print("=" * 60)
print("第 4 部分：traceback 模块格式化")
print("=" * 60)

def level_a():
    return level_b()

def level_b():
    return level_c()

def level_c():
    raise RuntimeError("来自最深处的错误")

try:
    level_a()
except Exception as e:
    # 获取格式化的 traceback 字符串
    tb_str = ''.join(traceback.format_exception(type(e), e, e.__traceback__))
    print("  traceback.format_exception 输出:")
    for line in tb_str.split('\\n'):
        print(f"    {line}")

print()
print("  sys.exc_info() 获取异常三元组:")
try:
    1 / 0
except Exception:
    exc_type, exc_val, exc_tb = sys.exc_info()
    print(f"    exc_type: {exc_type.__name__}")
    print(f"    exc_val:  {exc_val}")
    print(f"    exc_tb:   {type(exc_tb).__name__} (traceback 对象)")

print()
print("=" * 60)
print("第 5 部分：重试装饰器实现")
print("=" * 60)

def retry(max_retries=3, delay=0.01, exceptions=(Exception,)):
    """重试装饰器：失败时自动重试"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(1, max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    print(f"    第 {attempt}/{max_retries} 次失败: {type(e).__name__}: {e}")
                    if attempt < max_retries:
                        time.sleep(delay)
                        print(f"      等待后重试...")
            # 达到最大重试次数仍失败
            print(f"    达到最大重试次数 {max_retries}，抛出最后异常")
            raise last_exception
        return wrapper
    return decorator

# 测试重试装饰器
call_count = 0

@retry(max_retries=4, delay=0.01, exceptions=(ValueError,))
def unreliable_function():
    """模拟第 3 次才成功的函数"""
    global call_count
    call_count += 1
    if call_count < 3:
        raise ValueError(f"模拟失败（第 {call_count} 次）")
    return f"成功！调用 {call_count} 次后返回"

print("  测试重试（第 3 次成功）:")
result = unreliable_function()
print(f"  最终结果: {result}")

# 测试一直失败
print()
print("  测试一直失败:")
call_count = 0

@retry(max_retries=3, delay=0.01, exceptions=(ValueError,))
def always_fail():
    global call_count
    call_count += 1
    raise ValueError(f"永远失败（第 {call_count} 次）")

try:
    always_fail()
except ValueError as e:
    print(f"  最终捕获: {e}")

print()
print("=" * 60)
print("第 6 部分：批处理容错策略")
print("=" * 60)

def process_record(record):
    """处理单条记录，可能抛各种异常"""
    if record is None:
        raise ValueError("记录为空")
    if isinstance(record, str):
        raise TypeError(f"记录应是字典，得到字符串: {record!r}")
    if "value" not in record:
        raise KeyError("缺少 value 字段")
    if record["value"] < 0:
        raise ValueError(f"value 不能为负: {record['value']}")
    return {"id": record["id"], "doubled": record["value"] * 2}

def process_batch(records):
    """批处理：一条出错不中断全部"""
    success = []
    failures = []
    for i, record in enumerate(records, 1):
        try:
            result = process_record(record)
            success.append(result)
        except (ValueError, TypeError, KeyError) as e:
            # 已知错误：记录并跳过
            failures.append({"index": i, "error": f"{type(e).__name__}: {e}"})
        except Exception as e:
            # 未知错误：记录完整 traceback，但仍继续
            failures.append({
                "index": i,
                "error": str(e),
                "traceback": traceback.format_exc()
            })
    return {"success": success, "failures": failures}

# 测试数据
records = [
    {"id": 1, "value": 10},          # 成功
    None,                              # ValueError
    "bad string",                     # TypeError
    {"id": 2, "value": 20},          # 成功
    {"id": 3},                        # KeyError 缺 value
    {"id": 4, "value": -5},          # ValueError 负值
    {"id": 5, "value": 30},          # 成功
]

print("  批处理结果:")
result = process_batch(records)
print(f"    总数: {len(records)}")
print(f"    成功: {len(result['success'])} 条")
for s in result["success"]:
    print(f"      {s}")
print(f"    失败: {len(result['failures'])} 条")
for f in result["failures"]:
    print(f"      第 {f['index']} 条: {f['error']}")

print()
print("=" * 60)
print("第 7 部分：数据库事务模拟（with 管理事务）")
print("=" * 60)

class FakeDB:
    def __init__(self):
        self.data = {}
        self.committed = False
        self.rolled_back = False
    def begin(self):
        self._backup = dict(self.data)
        self.committed = False
        self.rolled_back = False
        print("    -> 开启事务")
    def commit(self):
        self.committed = True
        print("    -> 提交事务")
    def rollback(self):
        self.data = self._backup
        self.rolled_back = True
        print("    -> 回滚事务（数据已恢复）")
    def insert(self, key, value):
        self.data[key] = value
        print(f"    -> 插入 {key}={value}")

@contextmanager
def transaction(db):
    """事务上下文管理器：异常回滚，正常提交"""
    db.begin()
    try:
        yield db
    except Exception as e:
        db.rollback()
        raise   # 让上层知道出错了
    else:
        db.commit()

db = FakeDB()
db.data["init"] = 1

print("  场景 1：事务成功提交")
with transaction(db):
    db.insert("a", 10)
    db.insert("b", 20)
print(f"    提交={db.committed}, 回滚={db.rolled_back}, 数据={db.data}")

print()
print("  场景 2：事务异常回滚")
try:
    with transaction(db):
        db.insert("c", 30)
        raise RuntimeError("插入 c 后出错")
        db.insert("d", 40)   # 不会执行
except RuntimeError as e:
    print(f"  外层捕获: {e}")
print(f"    提交={db.committed}, 回滚={db.rolled_back}")
print(f"    数据={db.data}（c 被回滚）")

print()
print("=" * 60)
print("第 8 部分：综合实战——健壮的 API 客户端")
print("=" * 60)

# 业务异常族
class APIError(Exception):
    """API 错误基类"""
    pass

class APIAuthError(APIError):
    pass

class APIRateLimitError(APIError):
    def __init__(self, retry_after):
        self.retry_after = retry_after
        super().__init__(f"限流，{retry_after}s 后重试")

class APINotFoundError(APIError):
    pass

class APIServerError(APIError):
    pass

# 模拟 API 调用
def call_api(endpoint, fail_mode=None):
    """模拟 API 调用"""
    if fail_mode == "auth":
        raise APIAuthError("Token 无效")
    elif fail_mode == "rate_limit":
        raise APIRateLimitError(60)
    elif fail_mode == "not_found":
        raise APINotFoundError(f"资源不存在: {endpoint}")
    elif fail_mode == "server":
        raise APIServerError("服务器内部错误")
    elif fail_mode == "network":
        raise ConnectionError("网络中断")
    return {"endpoint": endpoint, "data": "success"}

@retry(max_retries=3, delay=0.01, exceptions=(APIServerError, ConnectionError))
def robust_api_call(endpoint, fail_mode=None):
    """健壮的 API 调用：可重试错误自动重试，不可重试错误立即抛出"""
    try:
        return call_api(endpoint, fail_mode=fail_mode)
    except APIAuthError as e:
        # 认证错误：不可重试，立即抛出
        print(f"    [客户端] 认证失败，不可重试: {e}")
        raise
    except APIRateLimitError as e:
        # 限流：不可重试（演示），立即抛出
        print(f"    [客户端] 被限流: {e}")
        raise
    except APINotFoundError as e:
        # 资源不存在：返回 None（业务上合理）
        print(f"    [客户端] 资源不存在，返回 None: {e}")
        return None
    except (APIServerError, ConnectionError) as e:
        # 服务器错误/网络错误：可重试
        print(f"    [客户端] 可重试错误: {e}")
        raise   # 交给 retry 装饰器重试

# 测试各种场景
test_cases = [
    ("api/users/1", None,         "正常调用"),
    ("api/users/999", "not_found", "资源不存在"),
    ("api/auth", "auth",          "认证失败"),
    ("api/limited", "rate_limit", "被限流"),
    ("api/server", "server",      "服务器错误（会重试）"),
]

for endpoint, fail_mode, desc in test_cases:
    print(f"  测试: {desc}")
    try:
        result = robust_api_call(endpoint, fail_mode=fail_mode)
        print(f"    结果: {result}")
    except APIError as e:
        print(f"    捕获业务异常: {type(e).__name__}: {e}")
    print()

print("=" * 60)
print("第 9 部分：异常处理检查清单")
print("=" * 60)

checklist = [
    "是否捕获了过于宽泛的异常（except Exception / 裸 except）？",
    "是否 except: pass 吞掉了错误？",
    "try 块是否过大，混入了不该捕获的代码？",
    "捕获后是否真的处理了（恢复/转换/记录重抛）？",
    "是否用 logging.exception 而非 print 记录错误？",
    "重新抛出是否用裸 raise（保留 traceback）？",
    "转换异常是否用 raise X from e（保留原因）？",
    "公开 API 是否用 if/raise 而非 assert 校验参数？",
    "资源是否用 with 管理而非手动 try/finally？",
    "循环里的异常是否在循环内捕获（避免一条出错中断全部）？",
]

print("  审查异常处理代码时对照检查:")
for i, item in enumerate(checklist, 1):
    print(f"    [ ] {i}. {item}")

print()
print("全部演示完成。恭喜完成 Python 异常处理教程！")
`,
  },
];
