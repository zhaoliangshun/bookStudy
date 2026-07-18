// =============================================================
// Python 开发常用知识点（pykit）—— 第五批章节
// -------------------------------------------------------------
// 本文件包含以下章节（group 统一为"错误处理与调试技巧"，共 4 章）：
//   1. pykit-21 — 异常处理最佳实践
//   2. pykit-22 — 调试技巧大全
//   3. pykit-23 — 类型提示与 dataclass
//   4. pykit-24 — Python 开发效率工具
//
// 每个章节包含：
//   id      : 唯一标识
//   group   : 分组名（本批为"错误处理与调试技巧"）
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解（含表格、列表、代码片段）
//   code    : 可独立运行、带详细中文注释的 Python 示例代码
//
// 代码运行环境约束：
//   - 用 python3 直接运行，仅使用 Python 标准库
//   - 通过 /api/run-py 执行，通过 print 输出结果
//   - 每一行 Python 代码都带有中文注释
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：异常处理最佳实践
  // =========================================================
  {
    id: "pykit-21",
    group: "错误处理与调试技巧",
    icon: "⚠️",
    title: "异常处理最佳实践",
    content: `## 异常处理最佳实践

异常处理是写出**健壮程序**的关键。一个没有异常处理的程序，遇到文件不存在、网络超时、用户输入错误时就会直接崩溃。但如果异常处理不当——比如到处 \`except Exception: pass\`——又会把真正的 bug 藏起来，让问题更难排查。

本章系统讲解 Python 异常处理的完整语法、最佳实践和常见陷阱，帮你写出"既不崩溃也不掩盖问题"的健壮代码。

---

## 一、try/except/else/finally 完整结构

Python 的异常处理有四个关键字，构成一个完整的执行流程：

\`\`\`python
try:
    # 尝试执行的代码（可能出错）
    result = 10 / x
except ZeroDivisionError as e:
    # 捕获到特定异常时执行
    print("除零错误", e)
else:
    # try 块没有抛出任何异常时执行（注意：else 里不应该再放可能出错的代码）
    print("结果是", result)
finally:
    # 无论是否异常，都会执行（常用于资源清理）
    print("清理完成")
\`\`\`

### 四个块的执行时机

| 块 | 执行时机 | 典型用途 |
| --- | --- | --- |
| \`try\` | 总是尝试执行 | 放可能出错的代码 |
| \`except\` | \`try\` 抛出匹配的异常时 | 处理异常、记录日志、降级 |
| \`else\` | \`try\` 没抛异常时 | 处理正常结果（避免把成功逻辑塞进 try） |
| \`finally\` | 无论如何都执行 | 关闭文件、释放锁、关闭连接 |

### 为什么要用 else

很多人习惯把所有逻辑都塞进 \`try\`，但这样会**误捕获**不属于"可能出错"代码的异常。正确做法是 \`try\` 只放最小范围的可能出错代码，成功后的逻辑放 \`else\`：

\`\`\`python
import json
# 不推荐：try 范围太大
try:
    data = json.loads(text)
    process(data)   # 如果这里出错，也会被 except 捕获，掩盖 bug
except json.JSONDecodeError:
    print("JSON 解析失败")

# 推荐：try 只放最小范围
try:
    data = json.loads(text)
except json.JSONDecodeError:
    print("JSON 解析失败")
else:
    process(data)   # 这里的异常不会被误捕获
\`\`\`

### finally 的关键特性

\`finally\` 块**总是会执行**，即使 \`try\` 或 \`except\` 里有 \`return\`、\`break\`、\`continue\`，甚至发生了未捕获的异常：

\`\`\`python
def demo():
    try:
        return "from try"
    finally:
        print("finally 依然会执行！")  # 会先打印这句，再 return

demo()
# 输出：
# finally 依然会执行！
\`\`\`

这就是为什么 \`finally\` 特别适合做**资源清理**——无论发生什么，资源都要被释放。

---

## 二、捕获多种异常类型

### 2.1 捕获多个不同的异常

可以用多个 \`except\` 分别处理不同异常，也可以用一个 \`except\` 同时捕获多种异常（用元组）：

\`\`\`python
# 方式一：分别处理
try:
    value = int(input_str)
except ValueError:
    print("不是合法整数")
except TypeError:
    print("类型不对")

# 方式二：统一处理（元组形式）
try:
    value = int(input_str)
except (ValueError, TypeError) as e:
    print(f"转换失败: {e}")
\`\`\`

### 2.2 捕获顺序很重要

\`except\` 是**从上到下匹配**的，子类异常必须写在父类**前面**，否则永远匹配不到：

\`\`\`python
# 错误顺序：Exception 会先匹配所有异常
try:
    ...
except Exception:          # 这个会"吃掉"所有异常
    print("其他错误")
except ValueError:         # 永远到不了这里！ValueError 是 Exception 子类
    print("值错误")

# 正确顺序：子类在前，父类在后
try:
    ...
except ValueError:         # 先匹配子类
    print("值错误")
except Exception:          # 兜底
    print("其他错误")
\`\`\`

### 2.3 异常对象的属性

捕获异常后，异常对象 \`e\` 包含丰富的信息：

\`\`\`python
try:
    1 / 0
except ZeroDivisionError as e:
    print(type(e).__name__)  # 异常类名：ZeroDivisionError
    print(str(e))            # 异常消息：division by zero
    print(e.args)            # 参数元组：('division by zero',)
\`\`\`

---

## 三、异常链（raise from）

### 3.1 重新抛出异常

在 \`except\` 中可以用不带参数的 \`raise\` 重新抛出当前异常（保留原始堆栈）：

\`\`\`python
import logging
try:
    1 / 0
except ZeroDivisionError:
    logging.error("发生除零错误")
    raise   # 重新抛出，让上层处理
\`\`\`

### 3.2 raise from：显式异常链

转换异常类型时，用 \`raise ... from ...\` 保留原始异常，便于追踪根因：

\`\`\`python
import json
try:
    data = json.loads(text)
except json.JSONDecodeError as e:
    raise ValueError("配置文件格式错误") from e
\`\`\`

这样 traceback 会显示：

\`\`\`
ValueError: 配置文件格式错误

The above exception was the direct cause of the following exception:

json.JSONDecodeError: ...
\`\`\`

### 3.3 raise from None：抑制异常链

如果确实不想暴露原始异常（比如出于安全考虑），可以用 \`raise ... from None\`：

\`\`\`python
try:
    db_query(user_input)
except Exception as e:
    raise RuntimeError("查询失败") from None   # 不暴露原始异常细节
\`\`\`

---

## 四、自定义异常类

### 4.1 为什么要自定义异常

内置异常太泛（如 \`Exception\`、\`ValueError\`），无法表达业务语义。自定义异常能：
- 让调用方**精确捕获**业务错误
- 携带**业务上下文**（错误码、字段名等）
- 让异常**层次化**，便于分类处理

### 4.2 自定义异常的基本写法

自定义异常应继承 \`Exception\`（不要继承 \`BaseException\`，因为 \`KeyboardInterrupt\`、\`SystemExit\` 也是 \`BaseException\` 子类，捕获它们会干扰程序退出）：

\`\`\`python
class AppError(Exception):
    """所有应用异常的基类"""
    pass

class DatabaseError(AppError):
    """数据库相关异常"""
    pass

class ValidationError(AppError):
    """数据校验异常"""
    def __init__(self, field, message):
        self.field = field          # 出错的字段名
        self.message = message      # 错误描述
        super().__init__(f"{field}: {message}")
\`\`\`

### 4.3 带业务信息的异常

\`\`\`python
class InsufficientBalanceError(Exception):
    def __init__(self, balance, amount):
        self.balance = balance      # 当前余额
        self.amount = amount        # 尝试扣除的金额
        super().__init__(
            f"余额不足：当前 {balance}，需要 {amount}，差 {amount - balance}"
        )

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientBalanceError(balance, amount)
    return balance - amount
\`\`\`

调用方可以精确捕获并拿到上下文：

\`\`\`python
try:
    withdraw(100, 150)
except InsufficientBalanceError as e:
    print(f"扣款失败：{e}，差额 {e.amount - e.balance}")
\`\`\`

---

## 五、不该捕获异常的情况

### 5.1 不要裸 except

\`\`\`python
# 极其危险：会捕获所有异常，包括 KeyboardInterrupt、SystemExit
try:
    do_something()
except:
    pass    # 静默吞掉所有错误——这是 bug 的温床
\`\`\`

如果一定要宽泛捕获，至少用 \`except Exception:\`（不包含 \`KeyboardInterrupt\` 等），并且**记录日志**：

\`\`\`python
import logging
try:
    do_something()
except Exception as e:
    logging.exception("操作失败")   # 至少要记录
    raise   # 通常是重新抛出，让上层决定
\`\`\`

### 5.2 不要捕获你无法处理的异常

如果捕获了异常却只是 \`pass\` 或打印一行，相当于**掩盖问题**。原则是：

> 只捕获你**能处理**的异常，其余的让它冒泡。

例如 \`KeyError\`——如果是配置缺失，你可以用默认值兜底（这是"能处理"）；但如果是 \`TypeError\` 说明程序逻辑有 bug，你不该捕获它，应该让它崩出来便于修复。

### 5.3 不要用异常控制正常流程

\`\`\`python
# 反模式：用异常判断键是否存在
try:
    value = d[key]
except KeyError:
    value = default

# 正确：用 get 或 in 判断
value = d.get(key, default)
# 或
if key in d:
    value = d[key]
else:
    value = default
\`\`\`

异常处理的代价远高于条件判断（抛异常要构造堆栈），不要用异常做"正常路径"。

---

## 六、异常 vs 返回值模式

### 6.1 两种错误处理风格

| 风格 | 代表语言 | 特点 |
| --- | --- | --- |
| 异常 | Python、Java | 错误和正常逻辑分离，调用方可以"不处理" |
| 返回值 | Go（多返回值）、C（错误码） | 每次调用都要检查，错误处理代码冗长 |

Python 社区**主流用异常**，因为：
- 不污染函数签名
- 不会忘记检查错误（未处理的异常会崩，比"忘了检查返回值导致用错误数据"更安全）
- 适合"深层调用栈"——错误可以一路冒泡到顶层

### 6.2 何时用返回值，何时用异常

- **异常**：用于**异常情况**（文件不存在、网络断了、数据损坏）——预期之外
- **返回值**：用于**预期内的失败**（如查找返回 \`None\`、校验返回错误列表）

经验法则：**如果失败是常见且预期的，用返回值；如果失败是罕见且代表真正的异常，用异常。**

### 6.3 Go 风格 vs Python 风格对比

\`\`\`go
// Go：每次都要检查 err
file, err := os.Open(path)
if err != nil {
    return err
}
defer file.Close()
\`\`\`

\`\`\`python
# Python：用异常，正常逻辑清爽
with open(path) as f:
    data = f.read()
# 文件不存在会抛 FileNotFoundError，由上层统一处理
\`\`\`

---

## 七、上下文管理器与异常

### 7.1 with 语句自动清理

\`with\` 语句（上下文管理器）能在异常发生时**保证资源释放**，比 \`try/finally\` 更简洁：

\`\`\`python
# 用 with：即使中间出错，文件也会被关闭
with open(path) as f:
    data = f.read()
    process(data)   # 这里出错也没关系

# 等价于手写 try/finally
f = open(path)
try:
    data = f.read()
    process(data)
finally:
    f.close()
\`\`\`

### 7.2 suppress：优雅地忽略特定异常

\`contextlib.suppress\` 是"忽略特定异常"的语义化写法，比 \`try/except: pass\` 更清晰：

\`\`\`python
import os
from contextlib import suppress

# 删除文件，不存在也不报错
with suppress(FileNotFoundError):
    os.remove("temp.txt")
# 等价于：
# try:
#     os.remove("temp.txt")
# except FileNotFoundError:
#     pass
\`\`\`

---

## 八、实战要点总结

| 场景 | 推荐做法 |
| --- | --- |
| 打开外部资源（文件/连接） | 用 \`with\` 或 \`try/finally\` |
| 转换异常类型 | \`raise NewError(...) from e\` |
| 调用方不关心的内部错误 | 捕获后记录日志并重新抛出 |
| 可恢复的错误（如重试） | 捕获后执行降级逻辑 |
| 不可恢复的 bug（TypeError 等） | 不要捕获，让它崩 |
| 配置缺失/格式错误 | 自定义异常 + 明确错误信息 |
| 第三方库异常 | 捕获后转成自己的业务异常 |

---

## 本节代码演示

下面的代码综合演示了异常处理的各个知识点：完整 try 结构、多异常捕获、异常链、自定义异常、重试机制、健壮的文件读取与模拟 API 请求重试。运行后观察输出，体会每种用法的作用。`,
    code: `# ============================================================
# 第一章代码演示：异常处理最佳实践
# ============================================================
# 本代码演示：try/except/else/finally 完整结构、多异常捕获、
# 异常链 raise from、自定义异常类、健壮文件读取、API 重试。

import json                                   # 导入 json 模块用于解析
import time                                   # 导入 time 模块用于重试间隔
import os                                     # 导入 os 模块用于路径操作
from contextlib import suppress               # 导入 suppress 上下文管理器

# ---- 1. try/except/else/finally 完整结构 ----
print("========== 1. try/except/else/finally ==========")  # 见上方说明
def safe_divide(a, b):                        # 定义一个安全除法函数
    try:                                      # 开始 try 块
        result = a / b                        # 尝试计算 a 除以 b
    except ZeroDivisionError as e:            # 捕获除零错误
        print(f"  [except] 除零错误: {e}")     # 打印错误信息
        return None                           # 返回 None 表示失败
    else:                                     # try 没抛异常时执行
        print(f"  [else] 计算成功: {a}/{b} = {result}")  # 打印成功结果
        return result                         # 返回计算结果
    finally:                                  # 无论是否异常都执行
        print(f"  [finally] 本次除法结束")     # 打印清理提示

safe_divide(10, 2)                            # 调用：正常情况
safe_divide(10, 0)                            # 调用：除零异常

# ---- 2. 捕获多种异常类型 ----
print("\\n========== 2. 捕获多种异常 ==========")  # 见上方说明
def parse_int(s):                             # 定义整数解析函数
    try:                                      # 开始 try 块
        return int(s)                         # 尝试把 s 转成整数
    except (ValueError, TypeError) as e:      # 用元组同时捕获两类异常
        print(f"  解析失败 '{s}': {type(e).__name__}")  # 打印异常类名
        return None                           # 返回 None

parse_int("42")                               # 解析正常字符串
parse_int("abc")                              # 触发 ValueError
parse_int(None)                               # 触发 TypeError
parse_int([1, 2])                             # 触发 TypeError

# ---- 3. 异常链 raise from ----
print("\\n========== 3. 异常链 raise from ==========")  # 见上方说明
def load_config(text):                        # 定义配置加载函数
    try:                                      # 开始 try 块
        return json.loads(text)               # 尝试解析 JSON
    except json.JSONDecodeError as e:         # 捕获 JSON 解析错误
        raise ValueError("配置文件格式错误") from e  # 转换异常并保留原始异常

try:                                          # 外层捕获转换后的异常
    load_config("{invalid}")                  # 调用：传入非法 JSON
except ValueError as e:                       # 捕获 ValueError
    print(f"  捕获到: {e}")                   # 打印异常消息
    print(f"  原始原因: {e.__cause__}")       # 打印原始异常（异常链）

# ---- 4. 自定义异常类 ----
print("\\n========== 4. 自定义异常类 ==========")  # 见上方说明
class AppError(Exception):                    # 定义应用异常基类
    pass                                      # 空实现，仅用于分类

class ValidationError(AppError):              # 定义校验异常，继承 AppError
    def __init__(self, field, message):       # 构造方法
        self.field = field                    # 保存出错字段名
        self.message = message                # 保存错误描述
        super().__init__(f"{field}: {message}")  # 调用父类构造

class InsufficientBalanceError(AppError):     # 定义余额不足异常
    def __init__(self, balance, amount):      # 构造方法
        self.balance = balance                # 保存当前余额
        self.amount = amount                  # 保存尝试扣除金额
        super().__init__(f"余额不足: 现有 {balance}, 需要 {amount}")  # 调用父类

def withdraw(balance, amount):                # 定义取款函数
    if amount > balance:                      # 如果金额超过余额
        raise InsufficientBalanceError(balance, amount)  # 抛出自定义异常
    return balance - amount                   # 返回新余额

try:                                          # 尝试取款
    withdraw(100, 150)                        # 余额不足
except InsufficientBalanceError as e:         # 精确捕获余额不足异常
    print(f"  取款失败: {e}")                 # 打印错误
    print(f"  差额: {e.amount - e.balance}")  # 利用异常携带的上下文
except AppError as e:                         # 父类兜底（演示层次化捕获）
    print(f"  其他应用错误: {e}")             # 打印其他错误

# ---- 5. 健壮的文件读取 ----
print("\\n========== 5. 健壮的文件读取 ==========")  # 见上方说明
def read_json_file(path, default=None):       # 定义健壮的 JSON 文件读取
    try:                                      # 开始 try 块
        with open(path, encoding="utf-8") as f:  # 用 with 打开文件，自动关闭
            return json.load(f)               # 解析 JSON 并返回
    except FileNotFoundError:                 # 文件不存在
        print(f"  文件不存在: {path}")         # 打印提示
        return default                        # 返回默认值
    except json.JSONDecodeError as e:         # JSON 格式错误
        print(f"  JSON 格式错误: {e}")         # 打印错误
        return default                        # 返回默认值
    except PermissionError:                   # 权限不足
        print(f"  无权限读取: {path}")         # 打印提示
        return default                        # 返回默认值

data = read_json_file("nonexistent.json", default={"name": "默认"})  # 读取不存在的文件
print(f"  结果: {data}")                      # 打印返回的默认值

# ---- 6. API 请求重试（模拟） ----
print("\\n========== 6. API 请求重试 ==========")  # 见上方说明
class NetworkError(Exception):                # 定义网络异常
    pass                                      # 空实现

call_count = 0                                # 模拟调用计数器
def fake_api_call():                          # 模拟一个不稳定的 API
    global call_count                         # 声明使用全局变量
    call_count += 1                           # 调用次数加 1
    if call_count < 3:                        # 前两次都失败
        raise NetworkError(f"连接超时 (第 {call_count} 次)")  # 抛出网络异常
    return {"status": "ok", "data": [1, 2, 3]}  # 第三次成功返回

def retry(func, max_retries=3, delay=0.1):    # 定义通用重试装饰逻辑
    last_error = None                         # 记录最后一次异常
    for attempt in range(1, max_retries + 1):  # 遍历重试次数
        try:                                  # 尝试调用
            return func()                     # 成功则返回结果
        except NetworkError as e:             # 捕获网络异常
            last_error = e                    # 记录异常
            print(f"  第 {attempt} 次失败: {e}")  # 打印失败信息
            if attempt < max_retries:         # 如果还能重试
                time.sleep(delay)             # 等待一段时间再重试
    raise last_error                          # 重试用尽，抛出最后异常

try:                                          # 调用带重试的 API
    result = retry(fake_api_call, max_retries=5)  # 最多重试 5 次
    print(f"  最终成功: {result}")            # 打印成功结果
except NetworkError as e:                     # 全部失败
    print(f"  重试用尽: {e}")                 # 打印最终失败

# ---- 7. suppress 优雅忽略 ----
print("\\n========== 7. suppress 优雅忽略 ==========")  # 见上方说明
with suppress(FileNotFoundError):             # 用 suppress 忽略文件不存在
    os.remove("/tmp/this_file_does_not_exist_xxx")  # 删除不存在的文件
print("  删除操作完成（即使文件不存在也没报错）")  # 这行会正常执行

print("\\n演示结束。")                         # 打印结束提示`,
  },

  // =========================================================
  // 第二章：调试技巧大全
  // =========================================================
  {
    id: "pykit-22",
    group: "错误处理与调试技巧",
    icon: "🔍",
    title: "调试技巧大全",
    content: `## 调试技巧大全

写代码 30% 的时间在写，70% 的时间在**调试**。掌握高效的调试技巧，能让你的开发效率成倍提升。Python 提供了从最简单的 \`print\` 到功能强大的 \`logging\`、\`pdb\` 调试器等多种工具。

本章系统介绍各种调试手段：从 \`print\` 的进阶用法，到企业级的 \`logging\` 日志体系，再到 \`traceback\` 堆栈分析和 \`pdb\` 交互式调试器。

---

## 一、print 调试法（进阶技巧）

\`print\` 是最直接的调试方式，但很多人只用最基础的形式。下面这些技巧能让 \`print\` 调试更高效。

### 1.1 打印变量名和值

调试时最常见的需求是"打印某个变量的值"。手动写 \`print("x =", x)\` 容易漏写变量名，Python 3.8+ 的 \`f"{x=}"\` 语法可以同时打印变量名和值：

\`\`\`python
x = 42
y = "hello"
print(f"{x=}")    # 输出：x=42
print(f"{y=}")    # 输出：y='hello'
print(f"{x + 1=}")  # 输出：x + 1=43（连表达式都能打印）
\`\`\`

### 1.2 用 pprint 打印复杂结构

普通 \`print\` 打印嵌套字典/列表时挤成一团，\`pprint\`（pretty print）能自动格式化：

\`\`\`python
from pprint import pprint
data = {"users": [{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]}
pprint(data, width=40, sort_dicts=False)
# {'users': [{'age': 30, 'name': 'Alice'},
#            {'age': 25, 'name': 'Bob'}]}
\`\`\`

### 1.3 打印对象的完整信息

调试时想看对象的所有属性，用 \`vars()\` 或 \`dir()\`：

\`\`\`python
class User:
    def __init__(self):
        self.name = "Alice"
        self.age = 30

u = User()
print(vars(u))   # {'name': 'Alice', 'age': 30}（实例属性）
print(dir(u))    # 所有属性和方法（含继承的）
\`\`\`

### 1.4 print 的 file 参数：输出到文件

\`\`\`python
with open("debug.log", "a") as f:
    print("调试信息", file=f)   # 写入文件而不是控制台
\`\`\`

---

## 二、logging 模块详解

\`print\` 适合临时调试，但**生产环境**必须用 \`logging\`。它支持分级、格式化、输出到文件、按时间切割等高级功能。

### 2.1 为什么不用 print

| 需求 | print | logging |
| --- | --- | --- |
| 控制是否输出 | 要手动注释代码 | 改日志级别即可 |
| 区分严重程度 | 不能 | DEBUG/INFO/WARNING/ERROR/CRITICAL |
| 输出到文件 | 要手动写 | 配置 handler 即可 |
| 自动加时间戳 | 要手动写 | 格式化器自动加 |
| 按大小/时间切割 | 不能 | RotatingFileHandler 支持 |
| 生产/开发不同行为 | 难 | 改配置即可 |

### 2.2 五个日志级别

\`\`\`python
import logging
logging.debug("详细调试信息")     # DEBUG   - 最详细，通常只在开发用
logging.info("一般信息")          # INFO    - 确认程序按预期运行
logging.warning("警告")           # WARNING - 表示有意外，但程序还能运行
logging.error("错误")             # ERROR   - 某功能无法执行
logging.critical("严重错误")      # CRITICAL- 程序可能无法继续
\`\`\`

默认级别是 \`WARNING\`，所以 \`debug\` 和 \`info\` 默认不输出。级别对照：

| 级别 | 数值 | 何时用 |
| --- | --- | --- |
| DEBUG | 10 | 详细调试信息（变量值、执行路径） |
| INFO | 20 | 确认程序正常工作（启动、完成） |
| WARNING | 30 | 意外但可处理（用了默认值、接近限额） |
| ERROR | 40 | 某操作失败（但程序继续） |
| CRITICAL | 50 | 严重错误（程序无法继续） |

### 2.3 logging.basicConfig 配置

\`\`\`python
import logging
logging.basicConfig(
    level=logging.DEBUG,                  # 设置最低输出级别
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",  # 格式
    datefmt="%Y-%m-%d %H:%M:%S",          # 时间格式
    filename="app.log",                   # 输出到文件（不设则输出到控制台）
    filemode="a",                         # 追加模式
)
\`\`\`

常用 format 占位符：

| 占位符 | 含义 |
| --- | --- |
| \`%(asctime)s\` | 时间 |
| \`%(levelname)s\` | 级别名 |
| \`%(name)s\` | logger 名 |
| \`%(message)s\` | 日志消息 |
| \`%(filename)s\` | 文件名 |
| \`%(lineno)d\` | 行号 |
| \`%(funcName)s\` | 函数名 |
| \`%(process)d\` | 进程 ID |

### 2.4 getLogger：模块化日志

\`basicConfig\` 配置的是 root logger，实际项目应**每个模块用独立 logger**：

\`\`\`python
# module_a.py
import logging
logger = logging.getLogger(__name__)   # __name__ = "module_a"
logger.info("模块 a 启动")

# module_b.py
logger = logging.getLogger(__name__)   # __name__ = "module_b"
logger.warning("模块 b 警告")
\`\`\`

这样做的好处：
- 日志能区分来源（\`%(name)s\` 会显示模块名）
- 可以**单独控制**某个模块的日志级别
- 模块间不会互相干扰

### 2.5 Handler 和 Formatter

\`logging\` 的架构是：Logger → Handler → Formatter。一个 Logger 可以有多个 Handler，比如同时输出到控制台和文件，且用不同格式：

\`\`\`python
import logging
logger = logging.getLogger("myapp")
logger.setLevel(logging.DEBUG)

# 控制台 handler：输出 INFO 及以上
console = logging.StreamHandler()
console.setLevel(logging.INFO)
console.setFormatter(logging.Formatter("%(levelname)s: %(message)s"))

# 文件 handler：输出 DEBUG 及以上（更详细）
file_handler = logging.FileHandler("debug.log")
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(
    logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")
)

logger.addHandler(console)
logger.addHandler(file_handler)
\`\`\`

### 2.6 按大小/时间切割日志

生产环境日志会越来越大，需要切割：

\`\`\`python
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler

# 按大小切割：每个文件 1MB，最多保留 3 个备份
handler = RotatingFileHandler("app.log", maxBytes=1_000_000, backupCount=3)

# 按时间切割：每天午夜切割，保留 7 天
handler = TimedRotatingFileHandler("app.log", when="midnight", backupCount=7)
\`\`\`

---

## 三、traceback 模块打印调用栈

### 3.1 打印完整堆栈

异常发生时，默认的 traceback 信息有时不够灵活。\`traceback\` 模块可以**精细控制**堆栈的打印和记录：

\`\`\`python
import logging
import traceback
try:
    1 / 0
except ZeroDivisionError:
    # 打印完整 traceback 到标准错误
    traceback.print_exc()
    # 或者格式化成字符串（用于记录日志）
    tb_str = traceback.format_exc()
    logging.error("发生错误:\\n%s", tb_str)
\`\`\`

### 3.2 traceback.format_exc vs print_exc

| 函数 | 作用 |
| --- | --- |
| \`traceback.print_exc()\` | 直接打印到 stderr |
| \`traceback.format_exc()\` | 返回字符串，便于记录 |
| \`traceback.print_stack()\` | 打印当前调用栈（没异常时也行） |
| \`traceback.format_stack()\` | 返回调用栈字符串列表 |

### 3.3 调试时打印调用栈

有时没异常，但你想知道"程序是怎么走到这里的"，可以主动打印调用栈：

\`\`\`python
import traceback
def deep_function():
    traceback.print_stack()   # 打印：谁调用了谁
deep_function()
\`\`\`

---

## 四、调试器 pdb 基本用法

### 4.1 启动 pdb

\`pdb\` 是 Python 自带的交互式调试器。最简单的启动方式是在代码里加：

\`\`\`python
import pdb; pdb.set_trace()
# Python 3.7+ 可以用更简洁的：
breakpoint()
\`\`\`

程序运行到这行会**暂停**，进入交互式调试界面。

### 4.2 常用 pdb 命令

| 命令 | 简写 | 作用 |
| --- | --- | --- |
| \`next\` | \`n\` | 执行下一行（不进入函数） |
| \`step\` | \`s\` | 执行下一行（进入函数） |
| \`continue\` | \`c\` | 继续运行到下个断点 |
| \`print x\` | \`p x\` | 打印变量 x |
| \`list\` | \`l\` | 显示当前代码上下文 |
| \`where\` | \`w\` | 显示调用栈 |
| \`break 42\` | \`b 42\` | 在第 42 行设断点 |
| \`quit\` | \`q\` | 退出调试器 |
| \`args\` | \`a\` | 显示当前函数参数 |
| \`pp x\` | - | pretty print 变量 |

### 4.3 pdb 实战流程

\`\`\`python
def calculate(data):
    total = 0
    for item in data:
        breakpoint()   # 每次循环都暂停，可以检查 item
        total += item
    return total

calculate([1, 2, 3])
\`\`\`

进入 pdb 后，输入 \`n\` 单步执行，\`p item\` 查看当前值，\`c\` 继续到下一次循环。

### 4.4 事后调试：pm

程序崩溃后，可以用 \`pdb.pm()\` 进入**事后调试**，在异常发生的位置检查现场：

\`\`\`python
import pdb
def buggy():
    return 1 / 0

try:
    buggy()
except:
    pdb.pm()   # 进入崩溃现场，可以查看变量
\`\`\`

---

## 五、调试策略与心法

### 5.1 二分法定位

bug 不知道在哪？用"二分法"：在代码中间加 \`print\` 或断点，看 bug 在前半段还是后半段，反复二分快速缩小范围。

### 5.2 缩小复现范围

把出问题的代码**最小化**——删掉无关部分，直到剩下能复现 bug 的最小例子。这个过程往往就能让你发现 bug 原因。

### 5.3 常见 bug 类型速查

| 症状 | 可能原因 | 调试方法 |
| --- | --- | --- |
| NameError | 变量名拼错/未定义 | 检查拼写和作用域 |
| TypeError | 类型不对 | \`print(type(x))\` |
| IndexError | 索引越界 | \`print(len(list))\` |
| KeyError | 字典键不存在 | 改用 \`.get()\` 或先 \`in\` 判断 |
| 无限循环 | 循环条件永真 | 在循环里 \`print\` 变量 |
| 结果不对 | 逻辑错误 | 打印中间步骤逐步核对 |

---

## 本节代码演示

下面的代码演示了：print 进阶调试、logging 多模块配置、不同日志级别、traceback 堆栈打印、以及模拟错误追踪。注意 logging 的 handler 配置方式。`,
    code: `# ============================================================
# 第二章代码演示：调试技巧大全
# ============================================================
# 本代码演示：print 进阶技巧、logging 多 handler 配置、
# 不同日志级别、traceback 堆栈打印、错误追踪。

import logging                                    # 导入日志模块
import traceback                                  # 导入堆栈追踪模块
from pprint import pprint                         # 导入漂亮打印函数

# ---- 1. print 进阶调试 ----
print("========== 1. print 进阶调试 ==========")  # 见上方说明
x = 42                                            # 定义变量 x
y = "hello"                                       # 定义变量 y
print(f"{x=}")                                    # f-string 同时打印变量名和值
print(f"{y=}")                                    # 打印 y 的名字和值
print(f"{x * 2 + 1=}")                            # 连表达式都能打印

data = {"users": [{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]}  # 构造嵌套数据
print("普通 print:", data)                        # 普通 print 输出挤成一团
print("pprint 输出:")                             # 提示接下来是 pprint
pprint(data, width=40, sort_dicts=False)          # 漂亮打印，自动换行缩进

# ---- 2. logging 配置（多 handler）----
print("\\n========== 2. logging 多 handler 配置 ==========")  # 见上方说明
logger = logging.getLogger("demo_app")            # 创建名为 demo_app 的 logger
logger.setLevel(logging.DEBUG)                    # 设置 logger 最低级别为 DEBUG

console_handler = logging.StreamHandler()         # 创建控制台 handler
console_handler.setLevel(logging.INFO)            # 控制台只输出 INFO 及以上
console_handler.setFormatter(                     # 设置控制台格式
    logging.Formatter("[%(levelname)s] %(message)s")  # 简洁格式
)  # 闭合括号

file_handler = logging.FileHandler("debug_demo.log", mode="w")  # 创建文件 handler（覆盖写）
file_handler.setLevel(logging.DEBUG)              # 文件记录所有 DEBUG 及以上
file_handler.setFormatter(                        # 设置文件格式（更详细）
    logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")  # 含时间
)  # 闭合括号

logger.handlers.clear()                           # 清除已有 handler 避免重复
logger.addHandler(console_handler)                # 添加控制台 handler
logger.addHandler(file_handler)                   # 添加文件 handler

# ---- 3. 不同日志级别 ----
print("\\n========== 3. 不同日志级别 ==========")  # 见上方说明
logger.debug("这是 DEBUG 信息（只在文件里能看到）")  # DEBUG 只进文件
logger.info("这是 INFO 信息（控制台和文件都有）")     # INFO 两处都有
logger.warning("这是 WARNING 警告")               # 警告级别
logger.error("这是 ERROR 错误")                   # 错误级别
logger.critical("这是 CRITICAL 严重错误")         # 严重错误

# ---- 4. 模块化日志 ----
print("\\n========== 4. 模块化日志 ==========")  # 见上方说明
def setup_logger(name, level=logging.INFO):       # 定义 logger 工厂函数
    lg = logging.getLogger(name)                  # 获取或创建 logger
    lg.setLevel(level)                            # 设置级别
    if not lg.handlers:                           # 避免重复添加 handler
        h = logging.StreamHandler()               # 创建控制台 handler
        h.setFormatter(                           # 设置格式，带模块名
                        logging.Formatter("%(name)s | %(levelname)s | %(message)s")  # 设置日志格式器
                )  # 闭合括号
        lg.addHandler(h)                          # 添加 handler
    return lg                                     # 返回配置好的 logger

logger_a = setup_logger("module_a")               # 创建模块 a 的 logger
logger_b = setup_logger("module_b", logging.DEBUG)  # 创建模块 b 的 logger（DEBUG 级别）
logger_a.info("模块 a 启动")                      # 模块 a 记录启动
logger_b.debug("模块 b 详细调试")                 # 模块 b 记录调试信息
logger_b.warning("模块 b 发现异常")               # 模块 b 记录警告

# ---- 5. traceback 堆栈打印 ----
print("\\n========== 5. traceback 堆栈打印 ==========")  # 见上方说明
def level_three():                                # 定义第三层函数
    return 1 / 0                                  # 制造除零错误

def level_two():                                  # 定义第二层函数
    return level_three()                          # 调用第三层

def level_one():                                  # 定义第一层函数
    return level_two()                            # 调用第二层

try:                                              # 尝试调用
    level_one()                                   # 调用会触发异常
except ZeroDivisionError:                         # 捕获除零错误
    print("  捕获到异常，打印堆栈:")               # 提示
    tb_str = traceback.format_exc()               # 把 traceback 格式化成字符串
    print(tb_str)                                 # 打印堆栈字符串

# ---- 6. 主动打印调用栈（无异常时）----
print("========== 6. 打印当前调用栈 ==========")  # 见上方说明
def show_call_stack():                            # 定义打印调用栈的函数
    stack = traceback.format_stack()              # 获取当前调用栈字符串列表
    print("  当前调用栈:")                         # 提示
    for line in stack:                            # 遍历每一层
        print("  " + line.strip())                # 打印并去掉首尾空白

def caller():                                     # 定义调用者
    show_call_stack()                             # 调用打印函数

caller()                                          # 触发调用栈打印

# ---- 7. logging.exception 记录完整异常 ----
print("\\n========== 7. logging.exception 记录异常 ==========")  # 见上方说明
def risky_operation(data):                        # 定义有风险的操作
    return data["key"]                            # 访问可能不存在的键

try:                                              # 尝试操作
    risky_operation({})                           # 传入空字典触发 KeyError
except KeyError:                                  # 捕获键错误
    logger.error("操作失败：缺少 key 字段")        # 记录错误级别日志
    logger.exception("异常详情如下")              # exception 会自动附带完整 traceback

# ---- 8. 错误追踪综合示例 ----
print("\\n========== 8. 错误追踪综合示例 ==========")  # 见上方说明
def parse_user(line):                             # 定义用户解析函数
    parts = line.split(",")                       # 按逗号分割
    if len(parts) != 3:                           # 字段数不对
        raise ValueError(f"格式错误: {line!r}")   # 抛出值错误
    name, age_str, email = parts                  # 解包三个字段
    return {"name": name.strip(), "age": int(age_str), "email": email.strip()}  # 返回字典

def process_users(lines):                         # 定义批量处理函数
    results = []                                  # 成功结果列表
    errors = []                                   # 错误列表
    for i, line in enumerate(lines, 1):           # 遍历每行（带行号）
        try:                                      # 尝试解析
            user = parse_user(line)               # 解析单行
            results.append(user)                  # 加入成功列表
            logger.info(f"第 {i} 行解析成功: {user['name']}")  # 记录成功
        except (ValueError, TypeError) as e:      # 捕获解析错误
            errors.append((i, str(e)))            # 记录错误
            logger.warning(f"第 {i} 行解析失败: {e}")  # 警告级别
    return results, errors                        # 返回结果和错误

raw_lines = [                                     # 构造测试数据
    "Alice, 30, alice@example.com",               # 正常
    "Bob, twenty, bob@example.com",               # 年龄非数字
    "Charlie, 25",                                # 字段不足
    "Diana, 28, diana@example.com",               # 正常
]  # 闭合列表

users, errs = process_users(raw_lines)            # 处理所有行
print(f"\\n  成功解析 {len(users)} 个用户:")        # 打印成功统计
for u in users:                                   # 遍历成功用户
    print(f"    - {u}")                           # 打印每个用户
print(f"  失败 {len(errs)} 行:")                   # 打印失败统计
for line_no, err in errs:                         # 遍历错误
    print(f"    第 {line_no} 行: {err}")          # 打印每个错误

print("\\n演示结束。详见 debug_demo.log 文件。")    # 结束提示`,
  },

  // =========================================================
  // 第三章：类型提示与 dataclass
  // =========================================================
  {
    id: "pykit-23",
    group: "错误处理与调试技巧",
    icon: "🧪",
    title: "类型提示与 dataclass",
    content: `## 类型提示与 dataclass

Python 是**动态类型**语言，运行时不会检查类型。这带来灵活性，但也带来隐患：函数参数类型搞错、返回值用错，往往要运行到那一行才报错。

**类型提示（Type Hints）** 和 **\`@dataclass\`** 是 Python 3.5+ 引入的两个重要特性。类型提示让代码**自带文档**、配合工具能**静态检查**错误；\`dataclass\` 让你用最少代码写出**类型安全的数据类**。

本章系统讲解类型提示语法、\`typing\` 模块、\`@dataclass\` 的各种用法。

---

## 一、类型提示基本语法

### 1.1 变量类型提示

\`\`\`python
name: str = "Alice"          # name 是字符串
age: int = 30                # age 是整数
scores: list = [90, 85, 88]  # scores 是列表
\`\`\`

注意：类型提示**不强制**运行时检查，只是给人和工具看的注解。\`name: str = 123\` 运行时不会报错（但静态检查工具会警告）。

### 1.2 函数参数和返回值提示

\`\`\`python
def greet(name: str, times: int = 1) -> str:
    return (f"Hello, {name}! " * times).strip()
\`\`\`

- \`name: str\` 表示参数 \`name\` 应为字符串
- \`times: int = 1\` 表示参数 \`times\` 是整数，默认值 1
- \`-> str\` 表示返回值是字符串

### 1.3 类型提示的好处

| 好处 | 说明 |
| --- | --- |
| 自带文档 | 不用看实现就能知道参数和返回类型 |
| IDE 智能补全 | PyCharm/VSCode 能根据类型提示补全方法 |
| 静态检查 | mypy/pyright 能在运行前发现类型错误 |
| 重构安全 | 改类型时工具能指出所有受影响的地方 |

### 1.4 用 \`\`__annotations__\`\` 查看注解

\`\`\`python
def greet(name: str, times: int = 1) -> str: ...
print(greet.__annotations__)
# {'name': <class 'str'>, 'times': <class 'int'>, 'return': <class 'str'>}
\`\`\`

类型提示存储在 \`__annotations__\` 属性里，运行时可访问。

---

## 二、typing 模块

Python 3.9+ 可以直接用 \`list\`、\`dict\` 等内置类型做泛型（如 \`list[int]\`），但为了兼容旧版本和表达复杂类型，\`typing\` 模块提供了更丰富的工具。

### 2.1 容器类型

\`\`\`python
from typing import List, Dict, Tuple, Set

# 列表：元素都是 int
scores: List[int] = [90, 85, 88]

# 字典：键是 str，值是 int
ages: Dict[str, int] = {"Alice": 30, "Bob": 25}

# 元组：固定结构 (str, int)
person: Tuple[str, int] = ("Alice", 30)

# 集合：元素是 str
tags: Set[str] = {"python", "web"}
\`\`\`

Python 3.9+ 等价写法（无需导入 typing）：

\`\`\`python
scores: list[int] = [90, 85, 88]
ages: dict[str, int] = {"Alice": 30}
person: tuple[str, int] = ("Alice", 30)
tags: set[str] = {"python", "web"}
\`\`\`

### 2.2 Optional：可能为 None

\`Optional[X]\` 等价于 \`X | None\`，表示"可以是 X 类型，也可以是 None"：

\`\`\`python
from typing import Optional

def find_user(user_id: int) -> Optional[dict]:
    # 可能返回 dict，也可能返回 None（找不到时）
    if user_id in db:
        return db[user_id]
    return None
\`\`\`

Python 3.10+ 可以用更简洁的 \`X | None\`：

\`\`\`python
def find_user(user_id: int) -> dict | None: ...
\`\`\`

### 2.3 Union：多种类型之一

\`Union[X, Y]\` 表示"可以是 X 或 Y"：

\`\`\`python
from typing import Union

def process(data: Union[str, bytes]) -> str:
    if isinstance(data, bytes):
        return data.decode()
    return data
\`\`\`

Python 3.10+ 用 \`|\` 符号：

\`\`\`python
def process(data: str | bytes) -> str: ...
\`\`\`

### 2.4 Any：任意类型

\`Any\` 表示"任意类型"，相当于关闭类型检查。尽量少用，用了就失去了类型提示的意义：

\`\`\`python
from typing import Any
def log(data: Any) -> None:   # 什么都能传，但失去了类型保护
    print(data)
\`\`\`

### 2.5 Callable：可调用对象

\`Callable[[参数类型], 返回类型]\` 表示函数类型：

\`\`\`python
from typing import Callable

def apply(func: Callable[[int, int], int], a: int, b: int) -> int:
    return func(a, b)

apply(lambda x, y: x + y, 3, 5)   # 8
\`\`\`

### 2.6 类型别名

复杂类型可以起别名，提高可读性：

\`\`\`python
from typing import Union
from typing import List, Dict

# JSON 数据结构别名
JSON = Union[Dict[str, "JSON"], List["JSON"], str, int, float, bool, None]

# 用户记录
User = Dict[str, Union[str, int]]
users: List[User] = [{"name": "Alice", "age": 30}]
\`\`\`

---

## 三、@dataclass 装饰器

### 3.1 为什么需要 dataclass

写一个数据类，传统方式要手写 \`__init__\`、\`__repr__\`、\`__eq__\` 等方法，代码冗长：

\`\`\`python
class UserOld:
    def __init__(self, name, age, email):
        self.name = name
        self.age = age
        self.email = email
    def __repr__(self):
        return f"UserOld(name={self.name}, age={self.age}, email={self.email})"
    def __eq__(self, other):
        return (self.name, self.age, self.email) == (other.name, other.age, other.email)
\`\`\`

\`@dataclass\` 自动生成这些样板代码：

\`\`\`python
from dataclasses import dataclass

@dataclass
class User:
    name: str
    age: int
    email: str
\`\`\`

两行代码就实现了上面所有功能：自动生成 \`__init__\`、\`__repr__\`、\`__eq__\`。

### 3.2 dataclass 自动生成的方法

| 方法 | 默认生成 | 作用 |
| --- | --- | --- |
| \`__init__\` | 是 | 构造函数 |
| \`__repr__\` | 是 | 打印表示 |
| \`__eq__\` | 是 | 相等比较（按字段值） |
| \`__ne__\` | 是 | 不等比较 |
| \`__hash__\` | 否（默认） | 哈希（默认禁用，因为可变） |
| \`__lt__\` 等 | 否 | 排序比较 |

### 3.3 默认值

\`\`\`python
from dataclasses import dataclass
@dataclass
class User:
    name: str
    age: int = 18              # 有默认值的字段
    email: str = ""            # 有默认值的字段
    active: bool = True        # 有默认值的字段
\`\`\`

**注意**：有默认值的字段必须放在没默认值的字段**后面**，和函数参数规则一致。

### 3.4 可变默认值陷阱

直接用 \`[]\` 或 \`{}\` 做默认值会**所有实例共享**同一个对象（这是 Python 经典陷阱）。dataclass 里要用 \`field(default_factory=...)\`：

\`\`\`python
from dataclasses import dataclass, field

@dataclass
class User:
    name: str
    tags: list = field(default_factory=list)   # 每个实例独立的新列表
    scores: dict = field(default_factory=dict)  # 每个实例独立的新字典
\`\`\`

### 3.5 field 选项详解

\`\`\`python
from dataclasses import dataclass, field

@dataclass
class User:
    name: str
    password: str = field(repr=False)              # repr=False：打印时不显示（敏感信息）
    age: int = field(default=0, compare=False)     # compare=False：比较时不参与
    internal_id: int = field(init=False, default=0)  # init=False：不在 __init__ 参数里

u = User("Alice", "secret123", 30)
print(u)   # User(name='Alice', age=30)（password 和 internal_id 不显示）
\`\`\`

\`field\` 常用参数：

| 参数 | 作用 |
| --- | --- |
| \`default\` | 默认值（不可变类型） |
| \`default_factory\` | 默认值工厂函数（可变类型） |
| \`init\` | 是否加入 \`__init__\` 参数（默认 True） |
| \`repr\` | 是否出现在 \`__repr__\` 里（默认 True） |
| \`compare\` | 是否参与相等/大小比较（默认 True） |
| \`hash\` | 是否参与哈希（默认跟 compare） |

---

## 四、dataclass 进阶用法

### 4.1 frozen：不可变 dataclass

\`\`\`python
from dataclasses import dataclass
@dataclass(frozen=True)
class Point:
    x: float
    y: float

p = Point(1.0, 2.0)
p.x = 3.0   # 报错！frozen 实例不可修改
\`\`\`

\`frozen=True\` 让实例**不可变**，且自动生成 \`__hash__\`，可以作为字典键或放入集合。

### 4.2 继承

\`\`\`python
from dataclasses import dataclass
@dataclass
class Base:
    id: int

@dataclass
class User(Base):
    name: str
    age: int = 18
\`\`\`

子类会继承父类字段，字段顺序是父类在前。注意：如果父类字段有默认值，子类字段也必须有默认值。

### 4.3 asdict 与 astuple

\`\`\`python
from dataclasses import dataclass
from dataclasses import asdict, astuple

@dataclass
class User:
    name: str
    age: int

u = User("Alice", 30)
asdict(u)   # {'name': 'Alice', 'age': 30}
astuple(u)  # ('Alice', 30)
\`\`\`

便于和 JSON、数据库等交互。

### 4.4 replace：创建修改后的副本

\`\`\`python
from dataclasses import replace

u1 = User("Alice", 30)
u2 = replace(u1, age=31)   # 基于 u1 创建新实例，只改 age
# u1 不变，u2.age == 31
\`\`\`

适合不可变 dataclass 的"修改"场景。

---

## 五、dataclass 与类型检查

### 5.1 配合 mypy 做静态检查

dataclass 的类型提示可以被 mypy 检查：

\`\`\`bash
# 安装 mypy
pip install mypy
# 检查
mypy my_script.py
\`\`\`

\`\`\`python
from dataclasses import dataclass
# mypy 会报错：age 应该是 int
@dataclass
class User:
    name: str
    age: int

u = User("Alice", "thirty")   # error: Argument "age" has incompatible type "str"
\`\`\`

### 5.2 运行时类型检查

类型提示默认**运行时不检查**。如果需要运行时验证，可以用 \`__post_init__\`：

\`\`\`python
from dataclasses import dataclass
@dataclass
class User:
    name: str
    age: int

    def __post_init__(self):
        if not isinstance(self.name, str):
            raise TypeError("name 必须是字符串")
        if self.age < 0:
            raise ValueError("age 不能为负")
\`\`\`

---

## 六、实战场景对比

### 6.1 配置模型

\`\`\`python
from dataclasses import field
from dataclasses import dataclass
@dataclass
class DatabaseConfig:
    host: str = "localhost"
    port: int = 5432
    user: str = "postgres"
    password: str = field(default="", repr=False)
    database: str = "myapp"
    pool_size: int = 10

# 用法
config = DatabaseConfig(host="db.example.com", port=5432)
print(config)   # 自动格式化打印
\`\`\`

### 6.2 API 数据结构

\`\`\`python
from dataclasses import dataclass
@dataclass
class ApiResponse:
    code: int
    message: str
    data: Optional[dict] = None

    @property
    def success(self) -> bool:
        return self.code == 0

resp = ApiResponse(0, "OK", {"id": 1})
if resp.success:
    print(resp.data)
\`\`\`

---

## 七、类型提示速查表

| 类型 | 写法 | 含义 |
| --- | --- | --- |
| 基本类型 | \`int\`, \`str\`, \`float\`, \`bool\` | 基本类型 |
| 列表 | \`list[int]\` 或 \`List[int]\` | 元素都是 int 的列表 |
| 字典 | \`dict[str, int]\` 或 \`Dict[str, int]\` | 键 str 值 int |
| 元组 | \`tuple[str, int]\` | 固定结构 |
| 可选 \| \`Optional[int]\` 或 \`int \| None\` | int 或 None |
| 联合 \| \`Union[str, int]\` 或 \`str \| int\` | str 或 int |
| 任意 | \`Any\` | 任意类型 |
| 可调用 | \`Callable[[int], str]\` | 接收 int 返回 str 的函数 |

---

## 本节代码演示

下面的代码演示了：类型提示语法、typing 模块各种类型、@dataclass 基本用法、field 选项、frozen 不可变类、配置模型和 API 数据结构的完整示例。`,
    code: `# ============================================================
# 第三章代码演示：类型提示与 dataclass
# ============================================================
# 本代码演示：类型提示语法、typing 模块、@dataclass 装饰器、
# field 选项、frozen 不可变类、配置模型、API 数据结构。

from dataclasses import dataclass, field, asdict, astuple, replace  # 导入 dataclass 相关工具
from typing import List, Dict, Optional, Union, Any, Callable       # 导入常用类型

# ---- 1. 基本类型提示 ----
print("========== 1. 基本类型提示 ==========")  # 见上方说明
name: str = "Alice"                                # 字符串变量
age: int = 30                                      # 整数变量
height: float = 1.68                               # 浮点变量
is_active: bool = True                             # 布尔变量
print(f"  {name=}, {age=}, {height=}, {is_active=}")  # 打印所有变量

def greet(name: str, times: int = 1) -> str:       # 定义带类型提示的函数
    return (f"Hello, {name}! " * times).strip()    # 拼接并去首尾空格

result = greet("Bob", 3)                           # 调用函数
print(f"  greet 结果: {result}")                   # 打印结果
print(f"  函数注解: {greet.__annotations__}")      # 查看类型注解字典

# ---- 2. typing 容器类型 ----
print("\\n========== 2. typing 容器类型 ==========")  # 见上方说明
scores: List[int] = [90, 85, 88]                   # 整数列表
ages: Dict[str, int] = {"Alice": 30, "Bob": 25}    # 字符串到整数的字典
person: tuple[str, int] = ("Charlie", 28)          # 字符串和整数的元组
print(f"  scores: {scores}")                       # 打印列表
print(f"  ages: {ages}")                           # 打印字典
print(f"  person: {person}")                       # 打印元组

# ---- 3. Optional 与 Union ----
print("\\n========== 3. Optional 与 Union ==========")  # 见上方说明
def find_user(user_id: int) -> Optional[str]:      # 返回值可能是 str 或 None
    users = {1: "Alice", 2: "Bob"}                 # 模拟数据库
    return users.get(user_id)                      # 找不到返回 None

print(f"  find_user(1): {find_user(1)!r}")         # 找到返回名字
print(f"  find_user(99): {find_user(99)!r}")       # 找不到返回 None

def format_value(v: Union[int, str]) -> str:       # 接收 int 或 str
    if isinstance(v, int):                         # 如果是整数
        return f"数字: {v}"                         # 格式化为数字
    return f"字符串: {v}"                           # 格式化为字符串

print(f"  format_value(42): {format_value(42)}")   # 传入整数
print(f"  format_value('hi'): {format_value('hi')}")  # 传入字符串

# ---- 4. Callable 类型 ----
print("\\n========== 4. Callable 类型 ==========")  # 见上方说明
def apply_op(func: Callable[[int, int], int], a: int, b: int) -> int:  # 接收函数和两个 int
    return func(a, b)                              # 调用函数并返回结果

print(f"  add: {apply_op(lambda x, y: x + y, 3, 5)}")   # 加法
print(f"  mul: {apply_op(lambda x, y: x * y, 3, 5)}")   # 乘法

# ---- 5. @dataclass 基本用法 ----
print("\\n========== 5. @dataclass 基本用法 ==========")  # 见上方说明
@dataclass                                          # 应用 dataclass 装饰器
class User:                                         # 定义 User 类
    name: str                                       # 名字字段
    age: int                                        # 年龄字段
    email: str = ""                                 # 邮箱字段，有默认值

u1 = User("Alice", 30, "alice@example.com")        # 创建实例
u2 = User("Bob", 25)                                # 用默认邮箱
print(f"  u1: {u1}")                                # 自动生成 __repr__
print(f"  u2: {u2}")                                # 打印 u2
print(f"  u1 == User('Alice', 30, 'alice@example.com'): {u1 == User('Alice', 30, 'alice@example.com')}")  # 自动 __eq__

# ---- 6. field 选项 ----
print("\\n========== 6. field 选项 ==========")  # 见上方说明
@dataclass  # 应用 dataclass 装饰器
class SecureUser:                                   # 定义带敏感字段的用户类
    name: str                                       # 名字（普通字段）
    password: str = field(repr=False)               # 密码（repr=False 不显示）
    tags: list = field(default_factory=list)        # 标签（可变默认值用工厂）
    scores: dict = field(default_factory=dict)      # 成绩（可变默认值用工厂）
    age: int = field(default=0, compare=False)      # 年龄（不参与比较）

su = SecureUser("Alice", "secret123", tags=["admin", "vip"])  # 创建实例
print(f"  repr（不含密码）: {su}")                   # 打印（密码不显示）
print(f"  tags: {su.tags}")                         # 打印标签
print(f"  password: {su.password}")                 # 单独访问密码

# ---- 7. frozen 不可变 dataclass ----
print("\\n========== 7. frozen 不可变 dataclass ==========")  # 见上方说明
@dataclass(frozen=True)                             # frozen=True 不可变
class Point:                                        # 定义点类
    x: float                                        # x 坐标
    y: float                                        # y 坐标

p1 = Point(1.0, 2.0)                               # 创建点
print(f"  p1: {p1}")                                # 打印点
print(f"  hash(p1): {hash(p1)}")                    # frozen 类可以哈希
try:                                                # 尝试修改
    p1.x = 3.0                                     # 修改会抛异常
except Exception as e:                             # 捕获异常
    print(f"  修改失败: {type(e).__name__}: {e}")    # 打印错误

# ---- 8. asdict / astuple / replace ----
print("\\n========== 8. asdict / astuple / replace ==========")  # 见上方说明
@dataclass  # 应用 dataclass 装饰器
class Product:                                      # 定义产品类
    name: str                                       # 产品名
    price: float                                    # 价格
    stock: int = 0                                  # 库存

prod = Product("笔记本", 99.9, 50)                  # 创建产品
print(f"  asdict: {asdict(prod)}")                  # 转成字典
print(f"  astuple: {astuple(prod)}")                # 转成元组
prod2 = replace(prod, price=89.9)                   # 创建修改后的副本
print(f"  原产品: {prod}")                          # 原产品不变
print(f"  新产品: {prod2}")                         # 新产品价格变了

# ---- 9. 实战：配置模型 ----
print("\\n========== 9. 配置模型 ==========")  # 见上方说明
@dataclass  # 应用 dataclass 装饰器
class DatabaseConfig:                               # 定义数据库配置类
    host: str = "localhost"                         # 主机
    port: int = 5432                               # 端口
    user: str = "postgres"                          # 用户名
    password: str = field(default="", repr=False)   # 密码（不显示）
    database: str = "myapp"                         # 数据库名
    pool_size: int = 10                             # 连接池大小

    def __post_init__(self):                        # 初始化后校验
        if self.port < 1 or self.port > 65535:      # 端口范围检查
            raise ValueError(f"端口非法: {self.port}")  # 抛出值错误
        if self.pool_size < 1:                      # 连接池至少 1
            raise ValueError("连接池大小必须 >= 1")   # 抛出值错误

config = DatabaseConfig(host="db.example.com", port=5432)  # 创建配置
print(f"  数据库配置: {config}")                    # 打印配置（密码隐藏）
print(f"  asdict: {asdict(config)}")                # 转字典便于序列化

# ---- 10. 实战：API 数据结构 ----
print("\\n========== 10. API 数据结构 ==========")  # 见上方说明
@dataclass  # 应用 dataclass 装饰器
class ApiResponse:                                  # 定义 API 响应类
    code: int                                       # 状态码
    message: str                                    # 消息
    data: Optional[dict] = None                     # 数据（可能为空）

    @property                                       # 定义属性
    def success(self) -> bool:                      # success 属性返回是否成功
        return self.code == 0                       # code 为 0 表示成功

    def to_dict(self) -> dict:                      # 序列化为字典
        return asdict(self)                         # 用 asdict 转换

resp1 = ApiResponse(0, "OK", {"id": 1, "name": "Alice"})  # 成功响应
resp2 = ApiResponse(404, "Not Found")               # 失败响应
print(f"  resp1.success: {resp1.success}")  # 结果为 True
print(f"  resp2.success: {resp2.success}")  # 结果为 False
print(f"  resp1.to_dict(): {resp1.to_dict()}")      # 序列化

# ---- 11. dataclass 继承 ----
print("\\n========== 11. dataclass 继承 ==========")  # 见上方说明
@dataclass  # 应用 dataclass 装饰器
class BaseRecord:                                   # 基类记录
    id: int                                         # 主键 id

@dataclass  # 应用 dataclass 装饰器
class Article(BaseRecord):                          # 文章类继承基类
    title: str                                      # 标题
    content: str = ""                               # 内容（有默认值）
    views: int = 0                                  # 浏览量（有默认值）

article = Article(1, "Python 教程", "内容...", 100)  # 创建文章
print(f"  文章: {article}")                         # 打印文章（含继承的 id）

print("\\n演示结束。")                               # 结束提示`,
  },

  // =========================================================
  // 第四章：Python 开发效率工具
  // =========================================================
  {
    id: "pykit-24",
    group: "错误处理与调试技巧",
    icon: "🚀",
    title: "Python 开发效率工具",
    content: `## Python 开发效率工具

写 Python 代码不仅是"能跑就行"，更要"跑得优雅、跑得高效"。本章介绍日常开发中**最常用的效率工具和惯用法**：虚拟环境管理、pip 包管理、\`__name__\` 惯用法、三元表达式、海象运算符、列表推导 vs 生成器的选择，以及常用内置函数速查。

掌握这些，能让你的代码更 Pythonic、开发更高效。

---

## 一、venv 虚拟环境管理

### 1.1 为什么需要虚拟环境

不同项目依赖不同版本的库（A 项目要 Django 3，B 项目要 Django 4）。如果全局装一个版本，另一个项目就跑不了。**虚拟环境**让每个项目有独立的依赖隔离。

### 1.2 创建和激活虚拟环境

\`\`\`bash
# 创建虚拟环境（在项目目录下）
python3 -m venv .venv

# 激活（macOS/Linux）
source .venv/bin/activate

# 激活（Windows PowerShell）
.venv\\Scripts\\Activate.ps1

# 激活后命令行前会出现 (.venv) 标志
# 此时 pip install 装的包只在虚拟环境里

# 退出虚拟环境
deactivate
\`\`\`

### 1.3 常用 venv 操作

| 操作 | 命令 |
| --- | --- |
| 创建 | \`python3 -m venv .venv\` |
| 激活 | \`source .venv/bin/activate\` |
| 退出 | \`deactivate\` |
| 删除 | 直接删 \`.venv\` 目录 |
| 指定 Python 版本 | \`python3.12 -m venv .venv\` |

### 1.4 requirements.txt 依赖管理

\`\`\`bash
# 导出当前环境的所有依赖
pip freeze > requirements.txt

# 根据文件安装依赖（在新环境）
pip install -r requirements.txt
\`\`\`

\`requirements.txt\` 示例：

\`\`\`
Django==4.2.0
requests>=2.28.0
psycopg2-binary>=2.9
\`\`\`

现代项目更推荐用 \`pyproject.toml\` + \`pip-tools\` 或 \`poetry\`，但 \`requirements.txt\` 仍是最通用的方式。

---

## 二、pip 常用命令

### 2.1 安装与卸载

\`\`\`bash
pip install requests              # 安装最新版
pip install requests==2.28.0      # 安装指定版本
pip install "requests>=2.28.0"    # 安装最低版本
pip install -r requirements.txt   # 从文件安装
pip uninstall requests            # 卸载
pip install --upgrade requests    # 升级到最新
\`\`\`

### 2.2 查询命令

\`\`\`bash
pip list                  # 列出已安装的所有包
pip list --outdated       # 列出有更新可用的包
pip show requests         # 查看某个包的详细信息
pip freeze                # 以 requirements 格式输出
pip search keywords       # 搜索包（需配置 PyPI JSON API）
\`\`\`

### 2.3 速查表

| 命令 | 作用 |
| --- | --- |
| \`pip install 包名\` | 安装包 |
| \`pip uninstall 包名\` | 卸载包 |
| \`pip list\` | 列出已装包 |
| \`pip show 包名\` | 查看包详情 |
| \`pip freeze\` | 导出依赖 |
| \`pip install -r file\` | 从文件安装 |
| \`pip install --upgrade 包名\` | 升级包 |
| \`pip cache purge\` | 清理缓存 |

---

## 三、\`\`__name__ == "__main__"\`\` 惯用法

### 3.1 什么是 \`\`__name__\`\`

每个 Python 模块都有 \`__name__\` 属性：
- 直接运行（\`python script.py\`）时，\`__name__\` 等于 \`"__main__"\`
- 被导入（\`import script\`）时，\`__name__\` 等于模块名（\`"script"\`）

### 3.2 惯用法

\`\`\`python
def main():
    print("程序主逻辑")

def helper():
    print("辅助函数")

if __name__ == "__main__":
    main()
\`\`\`

这样写的好处：
- **直接运行**时执行 \`main()\`
- **被导入**时不自动执行，只暴露函数供调用

### 3.3 为什么重要

不加这个判断，模块被 import 时会**自动执行**所有顶层代码，这通常不是你想要的：

\`\`\`python
# bad.py
print("我被导入了！")   # import bad 时会打印这行

# good.py
def main():
    print("运行主程序")

if __name__ == "__main__":
    main()   # 只在直接运行时执行
\`\`\`

### 3.4 标准项目入口结构

\`\`\`python
#!/usr/bin/env python3
"""模块文档字符串"""

import sys

def parse_args(argv):
    """解析命令行参数"""
    return argv[1:]

def main(argv=None):
    args = parse_args(argv or sys.argv)
    # 主逻辑
    return 0

if __name__ == "__main__":
    sys.exit(main())   # 返回退出码
\`\`\`

---

## 四、三元表达式

Python 的三元表达式（条件表达式）语法和其他语言略有不同：

\`\`\`python
# Python 语法：值1 if 条件 else 值2
status = "成年" if age >= 18 else "未成年"

# 对比其他语言
# C/Java: status = age >= 18 ? "成年" : "未成年"
# JS:     status = age >= 18 ? "成年" : "未成年"
\`\`\`

### 4.1 常见用法

\`\`\`python
# 简单赋值
level = "high" if score > 80 else "low"

# 避免重复计算
message = f"找到 {len(result)} 条" if result else "无结果"

# 配合函数参数
print("成功" if success else "失败")
\`\`\`

### 4.2 不要过度嵌套

三元表达式**可读性**很重要，嵌套多了反而难懂：

\`\`\`python
# 不推荐：嵌套三元，可读性差
level = "A" if s >= 90 else "B" if s >= 80 else "C" if s >= 60 else "D"

# 推荐：用普通 if/elif
if s >= 90:
    level = "A"
elif s >= 80:
    level = "B"
elif s >= 60:
    level = "C"
else:
    level = "D"
\`\`\`

---

## 五、海象运算符 :=

Python 3.8 引入的**海象运算符**（walrus operator），可以在表达式内部**赋值并返回值**。

### 5.1 基本语法

\`\`\`python
# 传统写法
n = len(data)
if n > 10:
    print(f"数据过长: {n}")

# 海象运算符：赋值和判断一步到位
if (n := len(data)) > 10:
    print(f"数据过长: {n}")
\`\`\`

### 5.2 经典场景：避免重复调用

\`\`\`python
# 传统：while 循环里要写两次 input()
line = input()
while line:
    process(line)
    line = input()

# 海象：一次搞定
while (line := input()):
    process(line)
\`\`\`

### 5.3 列表推导里的海象

\`\`\`python
# 传统：要计算两次 expensive_func
results = [transform(x) for x in data if transform(x) is not None]

# 海象：只计算一次
results = [y for x in data if (y := transform(x)) is not None]
\`\`\`

### 5.4 海象运算符的边界

海象运算符**不能**用于：
- 顶层表达式语句（必须加括号）
- 列表推导的可迭代对象位置

\`\`\`python
# 错误：顶层语句
x := 5   # SyntaxError

# 正确：加括号
(x := 5)
\`\`\`

---

## 六、列表推导 vs 生成器选择

### 6.1 列表推导

\`\`\`python
squares = [x ** 2 for x in range(10)]   # 一次性生成完整列表
\`\`\`

- 优点：可重复遍历、可索引、可 \`len()\`
- 缺点：数据量大时占内存

### 6.2 生成器表达式

\`\`\`python
squares_gen = (x ** 2 for x in range(10))   # 生成器，惰性计算
\`\`\`

- 优点：内存友好（一次只产出一个）
- 缺点：只能遍历一次、不能索引、不能 \`len()\`

### 6.3 选择原则

| 场景 | 选择 | 原因 |
| --- | --- | --- |
| 数据量小，需要多次访问 | 列表推导 | 方便重复使用 |
| 数据量大（百万级） | 生成器 | 省内存 |
| 只遍历一次（如求和、统计） | 生成器 | 不必先建列表 |
| 需要索引、切片、len | 列表推导 | 生成器不支持 |
| 作为函数参数（sum/max/any） | 生成器 | 直接传，省内存 |

\`\`\`python
# 推荐：生成器直接传给 sum
total = sum(x ** 2 for x in range(1000000))   # 不占额外内存

# 不推荐：先建列表再求和
total = sum([x ** 2 for x in range(1000000)])  # 先建百万元素的列表
\`\`\`

### 6.4 推导式的可读性

\`\`\`python
# 简单推导：可读性好
squares = [x ** 2 for x in range(10)]

# 复杂推导：可读性差，改用 for 循环
result = [transform(x) for item in data if valid(item) for x in parse(item) if x > 0]
# 上面这行没人看得懂，拆开更好
\`\`\`

原则：**推导式最多一层循环 + 一个条件**，超过就改用普通循环。

---

## 七、常用内置函数速查

### 7.1 any / all

\`\`\`python
any([False, False, True])   # True（只要有一个 True）
all([True, True, False])    # False（必须全部 True）
any([])   # False（空可迭代对象）
all([])   # True（空可迭代对象，注意这个）
\`\`\`

常用于条件检查：

\`\`\`python
users = [{"active": True}, {"active": False}]
if any(u["active"] for u in users):   # 至少有一个活跃用户
    print("有活跃用户")
if all(u["active"] for u in users):   # 全部活跃
    print("全部活跃")
\`\`\`

### 7.2 sum / min / max

\`\`\`python
sum([1, 2, 3, 4])              # 10
sum([1, 2, 3], 10)             # 16（初始值 10）
min([3, 1, 2])                 # 1
max([3, 1, 2])                 # 3
max([1, 2, 3], key=lambda x: -x)  # 1（按自定义规则）

# 配合生成器，处理大数据
total = sum(x for x in range(1000000))   # 不占额外内存
\`\`\`

### 7.3 map / filter

\`\`\`python
# map：对每个元素应用函数
squares = list(map(lambda x: x ** 2, [1, 2, 3]))   # [1, 4, 9]

# filter：过滤元素
evens = list(filter(lambda x: x % 2 == 0, [1, 2, 3, 4]))   # [2, 4]
\`\`\`

**现代 Python 更推荐用列表推导**，可读性更好：

\`\`\`python
squares = [x ** 2 for x in [1, 2, 3]]           # 比	map 清晰
evens = [x for x in [1, 2, 3, 4] if x % 2 == 0]  # 比 filter 清晰
\`\`\`

\`map\` 和 \`filter\` 返回迭代器（惰性），需要 \`list()\` 转换才能看到结果。

### 7.4 速查表

| 函数 | 作用 | 示例 |
| --- | --- | --- |
| \`any()\` | 是否有 True | \`any([0, 1, 0])\` → True |
| \`all()\` | 是否全 True | \`all([1, 1, 0])\` → False |
| \`sum()\` | 求和 | \`sum([1,2,3])\` → 6 |
| \`min()\` | 最小值 | \`min([3,1,2])\` → 1 |
| \`max()\` | 最大值 | \`max([3,1,2])\` → 3 |
| \`map()\` | 映射 | \`map(str, [1,2])\` → ['1','2'] |
| \`filter()\` | 过滤 | \`filter(bool, [0,1])\` → [1] |
| \`sorted()\` | 排序 | \`sorted([3,1,2])\` → [1,2,3] |
| \`enumerate()\` | 带序号 | \`enumerate('ab')\` → [(0,'a'),(1,'b')] |
| \`zip()\` | 并行组合 | \`zip([1,2],['a','b'])\` → [(1,'a'),(2,'b')] |

---

## 八、其他实用技巧

### 8.1 链式比较

\`\`\`python
# Python 支持链式比较，比其他语言优雅
if 0 < age < 120:   # 等价于 0 < age and age < 120
    print("合法年龄")
\`\`\`

### 8.2 多重赋值与解包

\`\`\`python
a, b, c = 1, 2, 3          # 多重赋值
a, b = b, a                # 优雅地交换变量
first, *rest = [1, 2, 3, 4]  # first=1, rest=[2,3,4]
\`\`\`

### 8.3 enumerate 和 zip

\`\`\`python
# enumerate：带索引遍历
for i, name in enumerate(["Alice", "Bob"], start=1):
    print(i, name)   # 1 Alice / 2 Bob

# zip：并行遍历
for name, age in zip(["Alice", "Bob"], [30, 25]):
    print(name, age)
\`\`\`

---

## 本节代码演示

下面的代码演示了：\`__name__\` 惯用法、三元表达式、海象运算符、列表推导 vs 生成器、常用内置函数、以及一个项目初始化脚本和代码质量检查的模拟。`,
    code: `# ============================================================
# 第四章代码演示：Python 开发效率工具
# ============================================================
# 本代码演示：__name__ 惯用法、三元表达式、海象运算符、
# 列表推导 vs 生成器、内置函数 any/all/sum/min/max/map/filter、
# 项目初始化脚本、代码质量检查。

import sys                                        # 导入 sys 模块
import os                                         # 导入 os 模块

# ---- 1. __name__ == "__main__" 惯用法 ----
print("========== 1. __name__ 惯用法 ==========")  # 见上方说明
print(f"  当前 __name__: {__name__}")             # 打印当前模块名

def main():                                       # 定义主函数
    print("  这是主程序逻辑")                       # 主函数内容

def helper():                                     # 定义辅助函数
    print("  这是辅助函数")                         # 辅助函数内容

# 演示惯用法（这里直接调用，因为示例就是主程序）
if __name__ == "__main__":                        # 判断是否直接运行
    main()                                        # 调用主函数

# ---- 2. 三元表达式 ----
print("\\n========== 2. 三元表达式 ==========")  # 见上方说明
age = 20                                          # 定义年龄
status = "成年" if age >= 18 else "未成年"          # 三元表达式赋值
print(f"  age={age}: {status}")                   # 打印结果

scores = [95, 67, 88, 45, 76]                     # 定义分数列表
for s in scores:                                 # 遍历分数
    level = "A" if s >= 90 else "B" if s >= 80 else "C" if s >= 60 else "D"  # 嵌套三元
    print(f"  分数 {s}: {level}")                  # 打印等级

result = []                                       # 定义空列表
message = f"找到 {len(result)} 条" if result else "无结果"  # 避免重复计算 len
print(f"  message: {message}")                    # 打印消息

# ---- 3. 海象运算符 := ----
print("\\n========== 3. 海象运算符 ==========")  # 见上方说明
data = [1, 2, 3, 4, 5]                            # 定义数据列表
if (n := len(data)) > 3:                          # 海象运算符：赋值并判断
    print(f"  数据长度 {n}，超过 3")               # 使用 n

# 列表推导中用海象避免重复调用
words = ["hello", "world", "python", "is", "great"]  # 定义单词列表
long_words = [w for w in words if (length := len(w)) > 4]  # 只保留长度>4的，同时记录长度
print(f"  长单词: {long_words}")                  # 打印结果

# while + 海象（模拟读取输入）
inputs = ["line1", "line2", ""]                   # 模拟输入列表
idx = 0                                           # 索引初始化
collected = []                                    # 收集列表
while (line := inputs[idx]) if idx < len(inputs) else "":  # 海象读取（简化版）
    collected.append(line)                        # 加入收集
    idx += 1                                      # 索引加 1
    if idx >= len(inputs):                        # 防止越界
        break                                     # 跳出循环
print(f"  收集到: {collected}")                    # 打印收集结果

# ---- 4. 列表推导 vs 生成器 ----
print("\\n========== 4. 列表推导 vs 生成器 ==========")  # 见上方说明
squares_list = [x ** 2 for x in range(10)]        # 列表推导：一次生成完整列表
squares_gen = (x ** 2 for x in range(10))         # 生成器表达式：惰性计算
print(f"  列表推导: {squares_list}")               # 可以直接打印
print(f"  生成器对象: {squares_gen}")              # 打印的是生成器对象
print(f"  生成器转列表: {list(squares_gen)}")       # 需要转列表才能看内容

# 内存对比：大数列求和
total_list = sum([x for x in range(100000)])      # 先建列表再求和（占内存）
total_gen = sum(x for x in range(100000))         # 生成器直接求和（省内存）
print(f"  列表求和: {total_list}, 生成器求和: {total_gen}")  # 结果相同

# ---- 5. any / all ----
print("\\n========== 5. any / all ==========")  # 见上方说明
users = [                                         # 定义用户列表
    {"name": "Alice", "active": True},            # 活跃用户
    {"name": "Bob", "active": False},             # 非活跃用户
    {"name": "Charlie", "active": True},          # 活跃用户
]  # 闭合列表
has_active = any(u["active"] for u in users)      # 是否有活跃用户
all_active = all(u["active"] for u in users)      # 是否全部活跃
print(f"  有活跃用户: {has_active}")  # 结果为 True
print(f"  全部活跃: {all_active}")  # 结果为 False

# 空可迭代对象的特性
print(f"  any([]): {any([])}")  # 结果为 False
print(f"  all([]): {all([])}")                    # True（注意这个）

# ---- 6. sum / min / max ----
print("\\n========== 6. sum / min / max ==========")  # 见上方说明
nums = [3, 1, 4, 1, 5, 9, 2, 6]                   # 定义数字列表
print(f"  sum: {sum(nums)}")                      # 求和
print(f"  sum(初始值10): {sum(nums, 10)}")         # 带初始值求和
print(f"  min: {min(nums)}")                      # 最小值
print(f"  max: {max(nums)}")                      # 最大值

students = [                                      # 定义学生列表
    {"name": "Alice", "score": 95},               # 学生1
    {"name": "Bob", "score": 88},                 # 学生2
    {"name": "Charlie", "score": 92},             # 学生3
]  # 闭合列表
top = max(students, key=lambda s: s["score"])     # 按 score 取最大
print(f"  最高分学生: {top['name']} ({top['score']})")  # 打印

# ---- 7. map / filter vs 列表推导 ----
print("\\n========== 7. map / filter ==========")  # 见上方说明
nums = [1, 2, 3, 4, 5, 6]                         # 定义数字列表
squares_map = list(map(lambda x: x ** 2, nums))   # map 映射
evens_filter = list(filter(lambda x: x % 2 == 0, nums))  # filter 过滤
print(f"  map 平方: {squares_map}")               # 打印 map 结果
print(f"  filter 偶数: {evens_filter}")            # 打印 filter 结果

# 推荐写法：列表推导更清晰
squares_comp = [x ** 2 for x in nums]             # 列表推导做映射
evens_comp = [x for x in nums if x % 2 == 0]      # 列表推导做过滤
print(f"  推导平方: {squares_comp}")              # 结果相同
print(f"  推导偶数: {evens_comp}")                 # 结果相同

# ---- 8. enumerate / zip ----
print("\\n========== 8. enumerate / zip ==========")  # 见上方说明
names = ["Alice", "Bob", "Charlie"]               # 名字列表
for i, name in enumerate(names, start=1):         # 带序号遍历
    print(f"  {i}. {name}")                       # 打印序号和名字

ages = [30, 25, 35]                               # 年龄列表
for name, age in zip(names, ages):                # 并行遍历
    print(f"  {name} - {age} 岁")                  # 打印组合

# ---- 9. 项目初始化脚本（模拟）----
print("\\n========== 9. 项目初始化脚本 ==========")  # 见上方说明
def init_project(project_name):                   # 定义项目初始化函数
    print(f"  初始化项目: {project_name}")          # 打印项目名
    structure = {                                 # 定义项目结构
        "src": ["__init__.py", "main.py"],        # src 目录文件
        "tests": ["__init__.py", "test_main.py"],  # tests 目录文件
        "": ["README.md", "requirements.txt", ".gitignore"],  # 根目录文件
        }  # 闭合字典
    for dir_name, files in structure.items():     # 遍历目录结构
        for f in files:                           # 遍历文件
            path = f"{dir_name}/{f}" if dir_name else f  # 拼接路径
            print(f"    创建: {project_name}/{path}")  # 模拟创建
    # 生成 requirements.txt 内容
    deps = ["requests>=2.28.0", "pytest>=7.0.0"]  # 默认依赖
    print(f"    requirements.txt 内容: {deps}")     # 打印依赖
    return structure                              # 返回结构

init_project("my_app")                            # 调用初始化

# ---- 10. 代码质量检查（模拟）----
print("\\n========== 10. 代码质量检查 ==========")  # 见上方说明
def check_code_quality(lines):                    # 定义代码检查函数
    issues = []                                   # 问题列表
    for i, line in enumerate(lines, 1):           # 带行号遍历
        stripped = line.strip()                   # 去首尾空白
        if len(stripped) == 0:                    # 空行跳过
            continue                              # 继续
        if stripped == line.rstrip():             # 没有前导空白（顶层）
            pass                                  # 顶层语句正常
        if len(line) > 79:                        # 行太长（PEP8 建议 79）
            issues.append((i, "行超过 79 字符"))    # 记录问题
        if "\\t" in line:                         # 有 Tab 缩进
            issues.append((i, "使用 Tab 缩进，建议用空格"))  # 记录问题
        if stripped.endswith("import *"):         # import * 不推荐
            issues.append((i, "避免 import *"))    # 记录问题
    return issues                                 # 返回问题列表

sample_code = [                                   # 模拟待检查代码
    "import os",                                  # 正常
    "from typing import *",                       # 有问题：import *
    "def very_long_function_name_that_exceeds_the_line_limit_here(a, b, c, d):",  # 太长
    "\\tbad_indentation = True",                  # 有问题：Tab 缩进
    "x = 1",                                      # 正常
]  # 闭合列表
issues = check_code_quality(sample_code)          # 执行检查
if issues:                                        # 有问题
    print(f"  发现 {len(issues)} 个问题:")          # 打印数量
    for line_no, msg in issues:                   # 遍历问题
        print(f"    第 {line_no} 行: {msg}")       # 打印每个问题
else:                                             # 没问题
    print("  代码质量良好")                         # 打印良好

# ---- 11. 综合技巧：链式比较与解包 ----
print("\\n========== 11. 链式比较与解包 ==========")  # 见上方说明
age = 25                                          # 定义年龄
if 0 < age < 120:                                 # 链式比较
    print(f"  {age} 是合法年龄")                   # 打印合法

a, b, c = 1, 2, 3                                 # 多重赋值
print(f"  多重赋值: a={a}, b={b}, c={c}")          # 打印
a, b = b, a                                       # 交换变量
print(f"  交换后: a={a}, b={b}")                   # 打印交换结果

first, *middle, last = [1, 2, 3, 4, 5]            # 星号解包
print(f"  解包: first={first}, middle={middle}, last={last}")  # 打印解包

print("\\n演示结束。")                              # 结束提示`,
  },
];
