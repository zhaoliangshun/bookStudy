// =============================================================
// Python 从入门到精通大全（终极版）—— 第9批章节
// 第九部分 异常处理（共 5 章）
// =============================================================

const chapters = [
  // ============================================================
  // 第四十一章 异常基础
  // ============================================================
  {
    id: 'py10-ch41',
    group: '第九部分 异常处理',
    icon: '⚠️',
    title: '第四十一章 异常基础',
    content: `## 第四十一章 异常基础

异常（Exception）是程序运行时遇到"无法处理的意外情况"时产生的信号——比如除零、读取不存在的键、文件找不到。Python 用 \`try/except\` 捕获异常，避免程序崩溃。这一章先把异常的基础语法和最常见的内置异常讲透。

### 一、什么是异常

简单说，**异常就是程序运行过程中发生的错误事件**。如果不处理，Python 会打印一段红色的 traceback 并终止程序。看一个最经典的例子：

\`\`\`python
# 最常见的异常：除以零
# Python 不会返回"无穷大"，而是抛出 ZeroDivisionError
result = 10 / 0
print(result)  # 这行根本不会执行
\`\`\`

运行后会看到类似这样的输出：

\`\`\`
ZeroDivisionError: division by zero
\`\`\`

这就是异常——它带类型（ZeroDivisionError）、带消息（division by zero）、带调用栈（traceback）。

### 二、try/except 基本语法

\`try\` 块放可能出错的代码，\`except\` 块放出错后怎么处理：

\`\`\`python
# try/except 最简单的形式
try:
    # 尝试执行除法
    result = 10 / 0
except:
    # 捕获到任何异常都会执行这里
    # 注意：裸 except 会捕获所有异常（包括 KeyboardInterrupt），不推荐
    print("出错了，但不知道是什么错")

print("程序没有崩溃，继续往下走")
\`\`\`

但**裸 \`except:\` 是反模式**——它会捕获所有异常，包括用户按 Ctrl+C 触发的 \`KeyboardInterrupt\`，导致程序无法正常退出。生产代码至少要写 \`except Exception:\`。

### 三、捕获特定异常

更推荐的做法是**只捕获你预期会发生的异常**：

\`\`\`python
# 只捕获 ZeroDivisionError，其他异常照样抛出
def safe_divide(a, b):
    try:
        # 如果 b=0 会抛 ZeroDivisionError
        return a / b
    except ZeroDivisionError:
        # 这里我们明确知道：除零时返回 None 是合理的
        # 因为这是函数语义允许的"无效结果"
        print("警告：除数不能为 0，返回 None")
        return None

print(safe_divide(10, 2))   # 5.0
print(safe_divide(10, 0))    # 警告：除数不能为 0，返回 None  → None
\`\`\`

### 四、多个 except 分支

不同异常可能需要不同处理逻辑，可以写多个 \`except\`：

\`\`\`python
# 处理字符串转整数：可能输入不是数字，也可能为空
def parse_int(s):
    try:
        # int() 转换失败会抛 ValueError
        # 如果传入 None 会抛 TypeError
        return int(s)
    except ValueError:
        # 字符串不是合法数字
        print(f"无法把 '{s}' 转成整数：不是合法数字")
        return None
    except TypeError:
        # 参数类型不对（比如 None）
        print(f"类型错误：不能把 {type(s).__name__} 转成整数")
        return None

print(parse_int("42"))      # 42
print(parse_int("hello"))   # ValueError 分支
print(parse_int(None))      # TypeError 分支
\`\`\`

也可以用一个 \`except\` 同时捕获多种异常：

\`\`\`python
# 一个 except 捕获多个异常，写成元组
try:
    value = int("abc")
except (ValueError, TypeError) as e:
    # as e 把异常对象赋给变量 e，可以打印它的消息
    # 这里把 ValueError 和 TypeError 都当作"输入非法"处理
    print(f"输入非法：{e}")
\`\`\`

### 五、else 和 finally

完整的 \`try\` 结构包括：\`try\` / \`except\` / \`else\` / \`finally\`。

\`\`\`python
# 完整结构演示
def read_config(filename):
    try:
        # 尝试打开并读取文件
        f = open(filename, 'r', encoding='utf-8')
        content = f.read()
    except FileNotFoundError:
        # 文件不存在时的处理
        print(f"配置文件 {filename} 不存在，使用默认配置")
        return {}
    else:
        # else 块：try 没抛异常时才执行
        # 为什么不直接写在 try 里？因为如果写在 try 里，
        # 后续代码出错也会被 except 捕获，掩盖真实问题
        print("配置文件读取成功")
        return {"raw": content}
    finally:
        # finally 块：无论是否异常都执行（包括 return 之后）
        # 常用于资源清理：关闭文件、释放锁、断开连接
        # 注意：这里要先判断 f 是否存在，因为可能 open 就失败了
        if 'f' in dir():
            f.close()
            print("文件已关闭")

read_config("nonexistent.yaml")
\`\`\`

**else 和 finally 的区别要记清**：
- \`else\`：try 没出错才执行（避免把后续代码也纳入 try 范围）
- \`finally\`：不管出不出错都执行（用于清理资源）

### 六、访问异常对象

用 \`as\` 关键字绑定异常对象，可以拿到详细信息：

\`\`\`python
try:
    # 访问字典不存在的键会抛 KeyError
    d = {"name": "张三"}
    print(d["age"])
except KeyError as e:
    # e 就是异常对象，打印它能看到缺失的键
    # 这里 e.args[0] 就是 "age"
    print(f"缺少字段：{e.args[0]}")
    # 也可以直接打印 e，会显示缺失的键
    print(f"原始异常：{e!r}")
\`\`\`

### 七、常见内置异常一览

Python 内置异常非常多，但日常 80% 场景只用到下面这几个：

| 异常类型 | 触发场景 | 典型例子 |
|---------|---------|---------|
| \`ValueError\` | 值的格式不对 | \`int("abc")\` |
| \`TypeError\` | 类型不匹配 | \`"a" + 1\` |
| \`KeyError\` | 字典键不存在 | \`{}["k"]\` |
| \`IndexError\` | 索引越界 | \`[][0]\` |
| \`AttributeError\` | 属性不存在 | \`None.foo\` |
| \`ZeroDivisionError\` | 除以零 | \`1/0\` |
| \`FileNotFoundError\` | 文件不存在 | \`open("x")\` |
| \`NameError\` | 变量未定义 | \`print(x)\` |
| \`StopIteration\` | 迭代器结束 | \`next(iter([]))\` |

看几个真实触发：

\`\`\`python
# IndexError：列表越界
def get_first(items):
    try:
        # 如果 items 是空列表，items[0] 会越界
        return items[0]
    except IndexError:
        # 空列表返回 None 是合理的语义
        return None

print(get_first([1, 2, 3]))  # 1
print(get_first([]))         # None

# AttributeError：调用不存在的方法
try:
    # None 没有 .split 方法
    None.split(",")
except AttributeError as e:
    print(f"属性错误：{e}")

# TypeError：类型不支持的操作
try:
    # 字符串和数字不能直接相加
    result = "数量：" + 100
except TypeError as e:
    print(f"类型错误：{e}")
    # 正确做法：先转成字符串
    result = "数量：" + str(100)
    print(f"修复后：{result}")
\`\`\`

### 八、异常继承体系

所有异常都继承自 \`BaseException\`，但日常用到的几乎都继承自 \`Exception\`：

\`\`\`python
# 异常继承关系（简化版）
# BaseException
#  ├── SystemExit          ← sys.exit() 触发
#  ├── KeyboardInterrupt  ← Ctrl+C 触发
#  ├── GeneratorExit      ← 生成器被关闭
#  └── Exception          ← 所有普通异常的根
#       ├── ValueError
#       ├── TypeError
#       ├── KeyError  (LookupError 的子类)
#       ├── IndexError (LookupError 的子类)
#       ├── OSError
#       │    └── FileNotFoundError
#       └── ...

# 验证继承关系
print(issubclass(KeyError, LookupError))   # True
print(issubclass(KeyError, Exception))     # True
print(issubclass(FileNotFoundError, OSError))  # True
\`\`\`

### 九、Exception vs BaseException

**永远不要捕获 \`BaseException\` 或写裸 \`except:\`**：

\`\`\`python
import sys

# 错误示范：捕获所有异常（包括 SystemExit、KeyboardInterrupt）
# try:
#     sys.exit(0)
# except BaseException:
#     print("捕获到了")  # 程序永远退不出去，因为 sys.exit 也被吞了

# 正确做法：只捕获 Exception
try:
    # 这里只关心"业务异常"，KeyboardInterrupt 等系统信号应该正常传播
    value = int("abc")
except Exception as e:
    # Exception 是所有"普通异常"的根，但不会捕获 SystemExit / KeyboardInterrupt
    # 这样用户按 Ctrl+C 仍然能正常终止程序
    print(f"业务异常：{type(e).__name__}: {e}")
\`\`\`

记住这条规则：**\`except Exception:\` 是底线，\`except:\` 是雷区**。

### 十、捕获异常后的信息获取

异常对象除了消息，还能拿到 traceback：

\`\`\`python
import traceback

def risky():
    # 这里故意制造一个深层调用栈
    def inner():
        # 列表索引越界
        return [1, 2, 3][100]
    return inner()

try:
    risky()
except IndexError:
    # traceback.format_exc() 返回完整的调用栈字符串
    # 用于记录日志，便于排查问题
    full_traceback = traceback.format_exc()
    print("=== 异常调用栈 ===")
    print(full_traceback)
    print("==================")
\`\`\`

### 十一、异常不捕获会一直向上传播

异常会沿着调用栈向上抛，直到被某个 \`try\` 捕获，否则程序崩溃：

\`\`\`python
def level3():
    # 最底层抛出异常
    raise ValueError("最底层的问题")

def level2():
    # 不捕获，异常会向上传
    return level3()

def level1():
    # 也不捕获，异常继续向上传
    return level2()

try:
    # 顶层捕获
    level1()
except ValueError as e:
    # 异常一路从 level3 → level2 → level1 传到这
    print(f"在顶层捕获到：{e}")
\`\`\`

这就是异常的核心价值——**错误处理代码不需要层层 if 判断返回值，可以集中在一处处理**。

### 十二、finally 的执行时机陷阱

\`finally\` 总会执行，即使 \`try\` 块里有 \`return\`：

\`\`\`python
def demo_finally():
    try:
        print("try 块开始")
        return "try 的返回值"
    finally:
        # 即使 try 已经 return，finally 仍会执行
        # 这是因为资源清理必须保证执行
        print("finally 块执行（在 return 之前）")
    # 这行不会执行
    print("try/finally 之后")

result = demo_finally()
print(f"函数返回：{result}")
\`\`\`

注意一个坑：**不要在 finally 里 return**，它会覆盖 try 的返回值和异常：

\`\`\`python
def bad_finally():
    try:
        raise ValueError("原始异常")
    finally:
        # 千万别这么写：finally 里的 return 会"吞掉"异常
        # 调用方根本看不到 ValueError
        return "finally 的返回值"  # 这行让异常消失了！

result = bad_finally()
print(f"返回值：{result}")  # 没有任何异常信息
\`\`\`

### 十三、嵌套 try

\`try\` 可以嵌套，内层异常如果没被捕获，会传到外层：

\`\`\`python
def nested_example():
    try:
        try:
            # 内层抛出 KeyError
            d = {}
            print(d["missing"])
        except ValueError:
            # 内层只捕获 ValueError，所以 KeyError 会向上传
            print("内层捕获 ValueError（不会执行）")
        # 如果内层没捕获，异常会传到外层
        print("这行不会执行")
    except KeyError:
        # 外层捕获 KeyError
        print("外层捕获 KeyError")

nested_example()
\`\`\`

### 十四、一个小工具：安全类型转换

把前面学的组合起来，写一个实用的安全转换函数：

\`\`\`python
def safe_convert(value, target_type, default=None):
    """把 value 安全转成 target_type，失败返回 default。"""
    try:
        return target_type(value)
    except (ValueError, TypeError) as e:
        # 同时捕获两种常见异常：值不合法、类型不对
        # 用 e 记录日志方便排查
        print(f"转换失败：{value!r} → {target_type.__name__}，原因：{e}")
        return default

# 各种测试用例
print(safe_convert("42", int))            # 42
print(safe_convert("3.14", int))           # 转换失败，返回 None
print(safe_convert("hello", int))          # 转换失败，返回 None
print(safe_convert("3.14", float))         # 3.14
print(safe_convert(None, int))             # 转换失败，返回 None
print(safe_convert("hello", str, ""))      # "hello"（str 不会失败）
\`\`\`

### 十五、常见误区对比

| 反模式 | 推荐 |
|-------|------|
| \`except:\` | \`except Exception:\` |
| \`except Exception: pass\` | 至少记录日志 |
| 把所有代码塞进一个 try | 只 try 真正可能出错的小段代码 |
| 捕获后用 print 不抛出 | 业务异常用 logging 模块记录 |
| 用异常控制流程（如循环退出） | 异常是"异常"情况，正常流程用 if/return |

\`\`\`python
# 反模式：用异常代替条件判断（性能差、可读性差）
def is_int(s):
    try:
        int(s)
        return True
    except ValueError:
        return False

# 这个写法没有错，但只在没有更好方法时用
# 如果可以用 str.isdigit()，优先用
def is_int_better(s):
    return s.lstrip('-').isdigit() if isinstance(s, str) else False

print(is_int("42"))        # True
print(is_int_better("42")) # True
\`\`\`

### 十六、捕获 OSError 的子类

文件操作相关的异常都是 \`OSError\` 的子类，可以一起捕获：

\`\`\`python
import os

def safe_remove(path):
    try:
        os.remove(path)
    except FileNotFoundError:
        # 文件本来就不存在，等同于删除成功
        print(f"{path} 不存在，无需删除")
    except PermissionError:
        # 权限不足，无法删除
        print(f"权限不足，无法删除 {path}")
    except OSError as e:
        # OSError 的其他子类（如 IsADirectoryError）
        print(f"删除失败：{e}")

safe_remove("/tmp/nonexistent_file_xyz.txt")
\`\`\`

## 小结

- ⭐ \`try/except/else/finally\` 是异常处理的完整结构：\`try\` 试运行、\`except\` 捕获、\`else\` 成功时执行、\`finally\` 必执行。
- ⭐ **只捕获预期的特定异常**，写 \`except Exception:\` 是底线，永远别写裸 \`except:\`。
- ⭐ \`as e\` 绑定异常对象，\`e.args\` / \`traceback.format_exc()\` 拿详情。
- 记住常用异常：\`ValueError\` / \`TypeError\` / \`KeyError\` / \`IndexError\` / \`AttributeError\` / \`ZeroDivisionError\` / \`FileNotFoundError\`。
- 异常会沿调用栈向上传播，错误处理代码可以集中在一处。
- \`finally\` 里**不要 return**，否则会吞掉异常或覆盖返回值。

下一章讲 \`raise\`、自定义异常、Python 3.11 的 \`except*\` 和 \`ExceptionGroup\`，把异常处理提升到工程级别。`,
  },

  // ============================================================
  // 第四十二章 异常进阶
  // ============================================================
  {
    id: 'py10-ch42',
    group: '第九部分 异常处理',
    icon: '🛡️',
    title: '第四十二章 异常进阶',
    content: `## 第四十二章 异常进阶

上一章学了怎么"接住"异常，这一章学怎么"主动抛出"异常，以及如何设计自己的异常体系。当你在写库或者大型项目时，**自定义异常类型**几乎是必备技能——它让调用方能精确捕获特定错误，而不是只能写 \`except Exception\`。

### 一、raise 主动抛出异常

\`raise\` 用于主动抛出异常，常见于**输入校验失败**的场景：

\`\`\`python
def set_age(age):
    """设置用户年龄，必须是非负整数。"""
    if not isinstance(age, int):
        # 类型不对：抛 TypeError
        # 用 raise + 异常类（实例化）抛出
        raise TypeError(f"年龄必须是整数，得到 {type(age).__name__}")
    if age < 0 or age > 150:
        # 值不合法：抛 ValueError
        # 错误信息要具体，方便调用方排查
        raise ValueError(f"年龄必须在 0-150 之间，得到 {age}")
    return age

try:
    set_age(-5)
except ValueError as e:
    print(f"值错误：{e}")
except TypeError as e:
    print(f"类型错误：{e}")
\`\`\`

### 二、raise 重新抛出当前异常

在 except 块里，\`raise\` 不带参数会把当前捕获的异常重新抛出：

\`\`\`python
def fetch_user(user_id):
    try:
        # 模拟数据库查询
        if user_id < 0:
            raise ValueError("user_id 不能为负数")
        return {"id": user_id, "name": "张三"}
    except ValueError:
        # 记录日志后，让异常继续向上传播
        # 这样上层调用者也能感知到错误
        print(f"[日志] fetch_user 失败：user_id={user_id}")
        # 不带参数的 raise：重新抛出当前异常
        # 不要写 raise e，那样会丢失原始 traceback
        raise

try:
    fetch_user(-1)
except ValueError as e:
    print(f"上层捕获到：{e}")
\`\`\`

### 三、raise from 链式异常

\`raise ... from ...\` 把一个异常"链接"到另一个异常上，保留因果关系：

\`\`\`python
def load_config(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError as e:
        # 把 FileNotFoundError 包装成更具体的业务异常
        # from e 保留原始异常，调用方能看到完整因果链
        raise RuntimeError(f"配置加载失败：{path}") from e

try:
    load_config("/nonexistent.yaml")
except RuntimeError as e:
    print(f"业务异常：{e}")
    # e.__cause__ 是原始异常（FileNotFoundError）
    print(f"原始原因：{e.__cause__!r}")
\`\`\`

### 四、__cause__ vs __context__

这两个属性容易混淆，记住区别：

- \`__cause__\`：用 \`raise ... from ...\` 显式指定的原因
- \`__context__\`：except 块里又抛了新异常时，Python 自动设置的原异常

\`\`\`python
def demo_context():
    try:
        # 触发原始异常
        1 / 0
    except ZeroDivisionError:
        # 在 except 块里又抛了新异常（没用 from）
        # Python 会自动把 ZeroDivisionError 设为新异常的 __context__
        raise ValueError("处理除零时发生了新问题")

try:
    demo_context()
except ValueError as e:
    print(f"新异常：{e}")
    print(f"__context__（自动）：{e.__context__!r}")
    print(f"__cause__（显式）：{e.__cause__!r}")  # None，因为没有 from

def demo_cause():
    try:
        1 / 0
    except ZeroDivisionError as e:
        # 用 from 显式指定原因
        raise ValueError("处理除零时发生了新问题") from e

try:
    demo_cause()
except ValueError as e:
    print(f"\\n新异常：{e}")
    print(f"__cause__（显式）：{e.__cause__!r}")
\`\`\`

简单口诀：**\`from\` 明确因果，\`__context__\` 自动追踪**。

### 五、raise from None 隐藏上下文

如果你不想让用户看到原始异常，可以用 \`raise ... from None\`：

\`\`\`python
def authenticate(token):
    try:
        # 解码 token（细节不重要）
        # 这里故意制造一个错误来演示
        if not token:
            raise ValueError("空 token")
    except ValueError:
        # 不想暴露内部实现细节给调用方
        # 用 from None 隐藏 __context__
        raise PermissionError("认证失败") from None

try:
    authenticate("")
except PermissionError as e:
    print(f"对外暴露：{e}")
    print(f"__context__（被 from None 隐藏）：{e.__context__!r}")
\`\`\`

### 六、自定义异常类

自定义异常只要继承 \`Exception\` 即可。一个有意义的异常体系应该是**层级结构**：

\`\`\`python
# 自定义异常体系
class AppError(Exception):
    """所有应用异常的基类。
    自定义异常都继承 Exception，并写好 docstring。
    """
    pass

class DatabaseError(AppError):
    """数据库相关异常。"""
    pass

class ConnectionError(DatabaseError):
    """数据库连接失败。"""
    pass

class QueryError(DatabaseError):
    """SQL 查询失败。"""
    pass

class AuthError(AppError):
    """认证相关异常。"""
    pass

# 使用时调用方可以精确捕获
def query_user(user_id):
    if user_id < 0:
        # 抛具体的异常，而不是笼统的 Exception
        raise QueryError(f"user_id 不能为负数：{user_id}")
    return {"id": user_id}

try:
    query_user(-1)
except QueryError as e:
    # 只捕获 QueryError
    print(f"查询错误：{e}")
except DatabaseError as e:
    # 也能捕获所有数据库异常（QueryError 是它的子类）
    print(f"数据库错误：{e}")
except AppError as e:
    # 顶层异常捕获，所有应用异常
    print(f"应用错误：{e}")
\`\`\`

### 七、给自定义异常加属性

异常可以有额外属性，方便调用方拿到结构化信息：

\`\`\`python
class ValidationError(Exception):
    """表单校验失败异常，带字段名和错误信息。"""
    def __init__(self, field, message):
        # 调用父类初始化，保证 message 正常工作
        super().__init__(f"{field}: {message}")
        # 自定义属性，方便调用方读取
        self.field = field
        self.message = message

def validate_email(email):
    if "@" not in email:
        # 抛异常时传入结构化信息
        raise ValidationError("email", "缺少 @ 符号")

try:
    validate_email("invalid-email")
except ValidationError as e:
    # 调用方可以读取 e.field 做针对性处理
    print(f"字段 {e.field} 校验失败：{e.message}")
    # 也能直接打印 e，因为 __init__ 设了 message
    print(f"完整异常：{e}")
\`\`\`

### 八、自定义 __str__ 让异常更友好

\`\`\`python
class OrderError(Exception):
    """订单异常。"""
    def __init__(self, order_id, reason, code=None):
        self.order_id = order_id
        self.reason = reason
        self.code = code or "UNKNOWN"
        # 把 message 传给父类
        super().__init__(self._format())

    def _format(self):
        return f"[{self.code}] 订单 {self.order_id} 失败：{self.reason}"

try:
    raise OrderError("ORD-2026-001", "库存不足", code="OUT_OF_STOCK")
except OrderError as e:
    # __str__ 自动调用，打印效果友好
    print(e)  # [OUT_OF_STOCK] 订单 ORD-2026-001 失败：库存不足
    # 结构化属性还能用
    print(f"订单号：{e.order_id}，错误码：{e.code}")
\`\`\`

### 九、Python 3.11+ ExceptionGroup 和 except*

Python 3.11 引入了 \`ExceptionGroup\`（异常组）和 \`except*\` 语法，用于**同时处理多个异常**。这在线程并发、并行任务调度场景特别有用。

\`\`\`python
# ExceptionGroup：把多个异常打包成一个组
def parallel_tasks():
    # 模拟并行任务，多个任务可能同时失败
    errors = []
    # 任务 1：值错误
    try:
        int("abc")
    except ValueError as e:
        errors.append(e)
    # 任务 2：键错误
    try:
        {}["missing"]
    except KeyError as e:
        errors.append(e)
    # 把所有错误打包抛出
    if errors:
        # ExceptionGroup 第一个参数是描述信息
        raise ExceptionGroup("并行任务失败", errors)

# 传统方式只能捕获整个组，无法分别处理
try:
    parallel_tasks()
except ExceptionGroup as eg:
    print(f"捕获到异常组：{eg.exceptions}")
\`\`\`

\`except*\` 语法可以**按类型分别处理组内异常**：

\`\`\`python
# except* 语法：按类型分别处理异常组里的异常
def run_all():
    # 故意制造一个混合异常组
    raise ExceptionGroup("批量任务失败", [
        ValueError("第一个值错误"),
        TypeError("类型不对"),
        ValueError("第二个值错误"),
        KeyError("键不存在"),
    ])

try:
    run_all()
# except* 会从异常组里筛出对应类型，分别处理
# 不同类型的异常走不同分支，没被捕获的会重新打包成组继续抛
except* ValueError as eg:
    # eg 是 ExceptionGroup，里面只装 ValueError
    print(f"处理了 {len(eg.exceptions)} 个 ValueError")
    for e in eg.exceptions:
        print(f"  - {e}")
except* TypeError as eg:
    print(f"处理了 {len(eg.exceptions)} 个 TypeError")
    for e in eg.exceptions:
        print(f"  - {e}")
# KeyError 没被捕获，会被重新打包抛出
\`\`\`

### 十、add_note 给异常添加备注

Python 3.11+ 的 \`add_note\` 可以在不修改异常的情况下补充上下文信息：

\`\`\`python
def process_data(data):
    try:
        # 复杂数据处理
        result = data["users"][0]["name"]
        return result.upper()
    except KeyError as e:
        # 不修改原异常，补充上下文
        # 上面有完整数据快照，便于排查
        e.add_note(f"处理数据时缺少字段 {e.args[0]}")
        e.add_note(f"数据概览：{list(data.keys())}")
        # 重新抛出，traceback 会带上这些 note
        raise

try:
    process_data({"users": []})  # users[0] 会 IndexError，但这里演示 KeyError
except (KeyError, IndexError) as e:
    print(f"异常：{e}")
    # __notes__ 保存了所有添加的备注
    if hasattr(e, '__notes__'):
        print("备注：")
        for note in e.__notes__:
            print(f"  → {note}")
\`\`\`

### 十一、异常与迭代器：StopIteration

\`StopIteration\` 是一个特殊异常，迭代器用它表示"迭代结束"，不能在外部直接 catch：

\`\`\`python
class MyRange:
    """简单的迭代器实现。"""
    def __init__(self, start, end):
        self.current = start
        self.end = end

    def __iter__(self):
        return self

    def __next__(self):
        if self.current >= self.end:
            # 迭代结束：抛 StopIteration
            # for 循环会自动捕获这个异常，停止循环
            raise StopIteration
        value = self.current
        self.current += 1
        return value

# for 循环内部捕获 StopIteration，调用方感知不到
for i in MyRange(1, 4):
    print(i, end=" ")
print()

# 但手动调用 next() 时，StopIteration 会传出来
it = iter(MyRange(1, 3))
print(next(it))  # 1
print(next(it))  # 2
print(next(it))  # StopIteration
\`\`\`

⚠️ 注意：在生成器函数里**不要用 return 抛 StopIteration**，应该直接 return（生成器会自动处理）。

### 十二、重新抛出异常的几种写法对比

\`\`\`python
import traceback

# 写法 1：raise（推荐）
def m1():
    try:
        1 / 0
    except ZeroDivisionError:
        print("记录日志")
        # 重新抛出，保留原始 traceback
        raise

# 写法 2：raise e（不推荐）
def m2():
    try:
        1 / 0
    except ZeroDivisionError as e:
        # 也能工作，但 traceback 会被"截断"
        # 显示的调用栈会从这里开始，丢失了上面的上下文
        raise e

# 写法 3：raise Exception(str(e))（错误）
def m3():
    try:
        1 / 0
    except ZeroDivisionError as e:
        # 完全丢失类型信息，调用方只能 except Exception
        raise Exception(str(e))

for fn in [m1, m2, m3]:
    try:
        fn()
    except Exception as e:
        print(f"{fn.__name__} → {type(e).__name__}: {e}")
\`\`\`

记住：**except 块里要重新抛出，用 \`raise\`（不带参数）**。

### 十三、自定义异常实战：业务错误码

在 API 开发中，常把异常映射到 HTTP 状态码：

\`\`\`python
class APIError(Exception):
    """API 异常基类，带状态码。"""
    status_code = 500

    def __init__(self, message, status_code=None):
        super().__init__(message)
        if status_code:
            self.status_code = status_code

class NotFoundError(APIError):
    """资源不存在。"""
    status_code = 404

class BadRequestError(APIError):
    """请求参数错误。"""
    status_code = 400

class UnauthorizedError(APIError):
    """未认证。"""
    status_code = 401

# 视图层统一处理
def handle_request(handler):
    try:
        return handler()
    except APIError as e:
        # 业务异常：返回对应状态码
        return {"status": e.status_code, "error": str(e)}
    except Exception as e:
        # 未知异常：500
        return {"status": 500, "error": "服务器内部错误"}

# 测试
def get_user():
    # 模拟找不到用户
    raise NotFoundError("用户不存在")

print(handle_request(get_user))
# {'status': 404, 'error': '用户不存在'}
\`\`\`

### 十四、自定义异常的 __repr__ 调试友好

\`\`\`python
class ConfigError(Exception):
    def __init__(self, key, value, expected_type):
        self.key = key
        self.value = value
        self.expected_type = expected_type
        super().__init__(
            f"配置项 {key!r} 期望 {expected_type.__name__}，"
            f"得到 {type(value).__name__}={value!r}"
        )

    def __repr__(self):
        # __repr__ 用于调试，应该能"复制粘贴即代码"
        return (f"ConfigError(key={self.key!r}, "
                f"value={self.value!r}, "
                f"expected_type={self.expected_type.__name__})")

try:
    raise ConfigError("port", "abc", int)
except ConfigError as e:
    print(f"str: {e}")        # 用户友好
    print(f"repr: {e!r}")     # 调试友好
\`\`\`

### 十五、异常的性能注意

异常处理在"没抛异常"时几乎零成本，但**抛异常本身较慢**：

\`\`\`python
import time

def benchmark_exception():
    start = time.perf_counter()
    count = 0
    for i in range(100000):
        try:
            # 每次都抛异常（极慢）
            raise ValueError
        except ValueError:
            count += 1
    elapsed = time.perf_counter() - start
    print(f"10万次抛+捕获：{elapsed:.3f}秒")

def benchmark_if():
    start = time.perf_counter()
    count = 0
    for i in range(100000):
        # 用 if 判断（快很多）
        if i < 0:
            count += 1
    elapsed = time.perf_counter() - start
    print(f"10万次 if 判断：{elapsed:.6f}秒")

benchmark_exception()
benchmark_if()
\`\`\`

所以**别用异常做循环退出、流程控制**，只在真正"异常"的场景用。

## 小结

- ⭐ \`raise\` 主动抛异常；except 里 \`raise\`（不带参数）重新抛出当前异常，保留 traceback。
- ⭐ \`raise ... from ...\` 链接异常，\`__cause__\` 显式因果，\`__context__\` 自动追踪；\`from None\` 隐藏上下文。
- ⭐ 自定义异常要建**层级体系**，调用方能按基类捕获，也能按子类精确处理。
- 异常可以带属性、自定义 \`__str__\` / \`__repr__\`，让信息更友好。
- Python 3.11+ 的 \`ExceptionGroup\` + \`except*\` 适合批量并行任务的错误处理。
- \`add_note\` 给异常补充上下文，不修改原始异常。
- 异常抛出有性能成本，不要用于正常流程控制。

下一章讲 \`with\` 语句和上下文管理器——把资源清理的样板代码用 \`with\` 简化掉。`,
  },

  // ============================================================
  // 第四十三章 上下文管理器 with
  // ============================================================
  {
    id: 'py10-ch43',
    group: '第九部分 异常处理',
    icon: '📦',
    title: '第四十三章 上下文管理器 with',
    content: `## 第四十三章 上下文管理器 with

\`with\` 语句是 Python 处理资源管理的标准方式——文件、锁、数据库连接、网络会话，只要进入"占用资源→使用→释放"的模式，都该用 \`with\`。它的核心价值是：**即使中间出异常，资源也保证被释放**。

### 一、为什么需要 with

先看不用 with 的痛点：

\`\`\`python
# 传统写法：必须手动 close，容易漏
f = open("test.txt", "w", encoding="utf-8")
try:
    f.write("hello")
    # 如果这里抛异常，下面的 close 不会执行
    raise RuntimeError("故意出错")
finally:
    f.close()  # 必须写在 finally 里

# with 写法：自动 close，代码更简洁
with open("test.txt", "w", encoding="utf-8") as f:
    f.write("hello")
    # 即使这里抛异常，离开 with 块时也会自动 close
# 离开 with 块后 f 已经关闭，不能再 write
\`\`\`

### 二、with 的工作原理

\`with\` 调用对象的 \`__enter__\` 和 \`__exit__\` 方法：

\`\`\`python
class MyContext:
    """演示 with 的工作流程。"""
    def __init__(self, name):
        self.name = name

    def __enter__(self):
        # 进入 with 块时调用
        # 返回值会赋给 as 后面的变量
        print(f"[{self.name}] __enter__ 被调用")
        return self  # 也可以返回其他对象

    def __exit__(self, exc_type, exc_val, exc_tb):
        # 离开 with 块时调用（无论是否异常）
        # exc_type: 异常类型，没异常时是 None
        # exc_val: 异常对象
        # exc_tb: traceback 对象
        print(f"[{self.name}] __exit__ 被调用")
        if exc_type is not None:
            print(f"[{self.name}] 检测到异常：{exc_type.__name__}: {exc_val}")
        # 返回 False 或 None：异常继续传播
        # 返回 True：吞掉异常（不推荐，除非你知道在干什么）
        return False

# 使用
with MyContext("demo") as ctx:
    print("with 块内")
print("with 块外")
\`\`\`

### 三、完整生命周期演示

\`\`\`python
class Step:
    def __init__(self, name):
        self.name = name

    def __enter__(self):
        print(f"→ 进入步骤：{self.name}")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            print(f"← 步骤 {self.name} 正常完成")
        else:
            print(f"✗ 步骤 {self.name} 因异常终止：{exc_val}")
        return False  # 不吞异常

# 场景 1：正常流程
print("=== 正常流程 ===")
with Step("加载数据"):
    print("  数据加载中...")

# 场景 2：中间出异常
print("\\n=== 异常流程 ===")
try:
    with Step("处理数据"):
        print("  处理中...")
        raise ValueError("数据格式错误")
except ValueError as e:
    print(f"外部捕获：{e}")
\`\`\`

### 四、实现一个数据库连接上下文

\`\`\`python
# 模拟数据库连接
class DatabaseConnection:
    """模拟数据库连接（实际项目用真实驱动）。"""
    def __init__(self, dsn):
        self.dsn = dsn
        self.connected = False

    def __enter__(self):
        # 进入 with：建立连接
        print(f"连接数据库：{self.dsn}")
        self.connected = True
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        # 离开 with：断开连接
        # 无论是否异常，连接都要释放
        if self.connected:
            if exc_type is not None:
                print(f"出现异常，回滚事务：{exc_val}")
            else:
                print("提交事务")
            print(f"断开连接：{self.dsn}")
            self.connected = False
        return False

    def query(self, sql):
        if not self.connected:
            raise RuntimeError("未连接")
        print(f"执行 SQL：{sql}")
        return [("row1",), ("row2",)]

# 使用
with DatabaseConnection("postgres://localhost/mydb") as db:
    rows = db.query("SELECT * FROM users")
    print(f"查询到 {len(rows)} 行")
\`\`\`

### 五、contextlib.contextmanager 装饰器

实现 \`__enter__\` / \`__exit__\` 比较啰嗦，\`contextlib.contextmanager\` 可以用生成器简化：

\`\`\`python
from contextlib import contextmanager
import time

@contextmanager
def timer(name):
    """计时器上下文：自动记录代码块耗时。"""
    # 这部分相当于 __enter__
    start = time.perf_counter()
    print(f"[{name}] 开始")
    try:
        # yield 之前的代码是 __enter__
        # yield 的值会赋给 as 后面的变量
        yield start
    except Exception as e:
        # 捕获异常相当于 __exit__ 的异常分支
        print(f"[{name}] 出错：{e}")
        raise
    finally:
        # finally 相当于 __exit__ 的清理部分
        elapsed = time.perf_counter() - start
        print(f"[{name}] 结束，耗时 {elapsed:.3f}s")

# 使用
with timer("数据处理") as t:
    # t 是 yield 的值（start 时间戳）
    total = sum(range(1000000))
    print(f"计算结果：{total}")
\`\`\`

### 六、用 contextmanager 实现文件锁

\`\`\`python
import threading
from contextlib import contextmanager

# 全局锁池
_locks = {}
_lock_guard = threading.Lock()

@contextmanager
def named_lock(name):
    """按名称获取锁，自动释放。"""
    # 双重检查：避免重复创建锁
    lock = _locks.get(name)
    if lock is None:
        with _lock_guard:
            lock = _locks.get(name)
            if lock is None:
                lock = threading.Lock()
                _locks[name] = lock

    # 获取锁
    lock.acquire()
    try:
        # yield 后才执行 with 块内的代码
        yield
    finally:
        # 无论如何都释放锁
        lock.release()

# 使用
with named_lock("user_cache"):
    # 这段代码同一时刻只有一个线程能执行
    print("正在更新用户缓存...")
\`\`\`

### 七、嵌套 with

多个 with 可以嵌套，也可以写成一行：

\`\`\`python
# 嵌套写法
with open("input.txt", "w", encoding="utf-8") as fin:
    fin.write("hello\\nworld")
with open("input.txt", "r", encoding="utf-8") as fin, \\
     open("output.txt", "w", encoding="utf-8") as fout:
    # 同时操作两个文件
    content = fin.read()
    fout.write(content.upper())

# Python 3.10+ 推荐用括号写法（更清晰）
with (
    open("input.txt", "r", encoding="utf-8") as fin,
    open("output.txt", "r", encoding="utf-8") as fout,
):
    print("两个文件都已打开")

# 验证结果
with open("output.txt", "r", encoding="utf-8") as f:
    print(f"输出：{f.read()!r}")
\`\`\`

### 八、ExitStack 动态管理多个资源

如果资源数量运行时才知道，用 \`ExitStack\`：

\`\`\`python
from contextlib import ExitStack

# 假设要打开多个文件，文件名列表运行时确定
filenames = ["input.txt"]  # 这里只放一个，演示用

# ExitStack 可以累积多个上下文管理器
# 退出时按 LIFO 顺序（后进先出）依次清理
with ExitStack() as stack:
    files = []
    for name in filenames:
        # enter_context 进入一个上下文，注册清理函数
        f = stack.enter_context(open(name, 'r', encoding='utf-8'))
        files.append(f)

    # 现在所有文件都已打开
    for i, f in enumerate(files):
        content = f.read()
        print(f"文件 {i} 内容：{content!r}")

# 离开 with 块时，ExitStack 自动按相反顺序关闭所有文件
\`\`\`

### 九、callback 注册清理函数

\`ExitStack.callback\` 可以注册一个普通函数作为清理逻辑：

\`\`\`python
from contextlib import ExitStack

def cleanup_resource(name):
    """普通的清理函数。"""
    print(f"清理资源：{name}")

with ExitStack() as stack:
    # 注册多个清理函数
    # 退出时会按相反顺序调用（LIFO）
    stack.callback(cleanup_resource, "数据库连接")
    stack.callback(cleanup_resource, "文件句柄")
    stack.callback(cleanup_resource, "网络会话")

    print("正在使用资源...")

# 输出：
# 正在使用资源...
# 清理资源：网络会话
# 清理资源：文件句柄
# 清理资源：数据库连接
\`\`\`

### 十、suppress 抑制特定异常

\`contextlib.suppress\` 是一个内置的上下文管理器，用于忽略特定异常：

\`\`\`python
from contextlib import suppress
import os

# 传统写法
try:
    os.remove("nonexistent.txt")
except FileNotFoundError:
    pass  # 文件不存在就算了

# 用 suppress 更简洁
# 只抑制 FileNotFoundError，其他异常照常抛
with suppress(FileNotFoundError):
    os.remove("nonexistent.txt")

print("删除完成（即使文件不存在也不报错）")

# 也可以抑制多个异常
with suppress(FileNotFoundError, PermissionError):
    os.remove("/root/some_file")  # 即使没权限也不报错
\`\`\`

### 十一、redirect_stdout 重定向输出

调试时把 stdout 重定向到 StringIO 或文件：

\`\`\`python
from contextlib import redirect_stdout
import io

# 用 StringIO 接住所有 print 输出
buffer = io.StringIO()
with redirect_stdout(buffer):
    # 这里的 print 不会显示在屏幕上，而是写到 buffer
    print("这行被重定向了")
    print("这行也是")

# 离开 with 后恢复原 stdout
print(f"buffer 里收到：{buffer.getvalue()!r}")
\`\`\`

### 十二、closing 包装有 close 方法的对象

\`\`\`python
from contextlib import closing
from urllib.request import urlopen

# closing 调用对象的 close 方法作为清理
# 适合有 close() 但没实现 __enter__/__exit__ 的对象
# 注意：urlopen 其实支持 with，这里只是演示 closing 的用法
class SimpleResource:
    def __init__(self):
        print("资源已创建")
    def close(self):
        print("资源已关闭")
    def do_work(self):
        print("工作中...")

with closing(SimpleResource()) as r:
    r.do_work()
\`\`\`

### 十三、自定义上下文管理器：临时切换状态

\`\`\`python
from contextlib import contextmanager

@contextmanager
def temporary_attr(obj, **kwargs):
    """临时修改对象属性，离开时恢复。"""
    # 保存原始值
    old_values = {}
    for key, new_value in kwargs.items():
        old_values[key] = getattr(obj, key, None)
        setattr(obj, key, new_value)
    try:
        yield obj
    finally:
        # 恢复原始值
        for key, old_value in old_values.items():
            setattr(obj, key, old_value)

# 使用
class User:
    def __init__(self, name):
        self.name = name
        self.is_admin = False

u = User("张三")
print(f"初始：{u.name}, admin={u.is_admin}")

with temporary_attr(u, is_admin=True, name="管理员"):
    # 临时变成管理员
    print(f"with 内：{u.name}, admin={u.is_admin}")

print(f"恢复后：{u.name}, admin={u.is_admin}")
\`\`\`

### 十四、自定义上下文管理器：临时目录

\`\`\`python
import tempfile
import os
from contextlib import contextmanager

@contextmanager
def temp_workspace(prefix="work_"):
    """创建临时目录，离开时自动删除。"""
    # mkdtemp 创建一个真实存在的临时目录
    path = tempfile.mkdtemp(prefix=prefix)
    print(f"创建临时目录：{path}")
    try:
        yield path
    finally:
        # 离开时清理整个目录
        # shutil.rmtree 更彻底，但这里演示用 os
        import shutil
        shutil.rmtree(path, ignore_errors=True)
        print(f"已清理临时目录：{path}")

# 使用：在临时目录里做实验，不污染工作区
with temp_workspace() as workdir:
    # 在临时目录里创建文件
    filepath = os.path.join(workdir, "test.txt")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("hello")
    print(f"在临时目录写入文件：{filepath}")
\`\`\`

### 十五、异步上下文管理器

异步代码用 \`async with\`，对应的协议是 \`__aenter__\` / \`__aexit__\`：

\`\`\`python
import asyncio
from contextlib import asynccontextmanager

class AsyncDB:
    """模拟异步数据库连接。"""
    async def __aenter__(self):
        # 异步进入：建立连接
        print("→ 异步连接数据库")
        await asyncio.sleep(0.1)  # 模拟网络延迟
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        # 异步退出：断开连接
        await asyncio.sleep(0.1)
        print("← 异步断开连接")
        return False

    async def query(self, sql):
        await asyncio.sleep(0.1)
        return f"结果：{sql}"

# 用 asynccontextmanager 装饰器
@asynccontextmanager
async def async_timer(name):
    import time
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        print(f"[{name}] 耗时 {elapsed:.3f}s")

async def main():
    # 异步 with 必须在 async 函数里用
    async with AsyncDB() as db:
        async with async_timer("查询"):
            result = await db.query("SELECT 1")
            print(result)

asyncio.run(main())
\`\`\`

### 十六、真实案例：事务处理

\`\`\`python
from contextlib import contextmanager

@contextmanager
def transaction(conn):
    """数据库事务：成功提交，异常回滚。"""
    try:
        # 进入事务
        print("BEGIN TRANSACTION")
        yield conn
        # 如果 yield 之后没异常，提交
        print("COMMIT")
    except Exception:
        # 出异常，回滚
        print("ROLLBACK")
        raise  # 继续抛出异常，让上层感知

class FakeConn:
    def execute(self, sql):
        print(f"  执行：{sql}")

# 场景 1：正常
print("=== 正常事务 ===")
with transaction(FakeConn()) as conn:
    conn.execute("INSERT INTO users VALUES (1, '张三')")
    conn.execute("UPDATE balance SET amount = 100 WHERE user_id = 1")

# 场景 2：异常
print("\\n=== 异常事务 ===")
try:
    with transaction(FakeConn()) as conn:
        conn.execute("INSERT INTO users VALUES (2, '李四')")
        raise RuntimeError("余额不足")
        # 下面这行不会执行
        conn.execute("UPDATE balance SET amount = 0")
except RuntimeError as e:
    print(f"外部捕获：{e}")
\`\`\`

### 十七、__exit__ 返回值的陷阱

\`\`\`python
class SwallowException:
    """演示 __exit__ 返回 True 会吞异常。"""
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        # 返回 True 表示"我处理了，不用传播"
        # 返回 False / None 表示"异常继续传播"
        if exc_type is not None:
            print(f"吞掉了异常：{exc_val}")
        return True  # ⚠️ 危险：吞掉所有异常

# 异常被吞了，调用方感知不到
with SwallowException():
    raise ValueError("这个异常会消失")

print("程序继续执行（异常被吞了）")
\`\`\`

⚠️ **大多数时候不要返回 True**，除非你是写框架/库，明确知道要吞掉特定异常。否则会掩盖 bug。

### 十八、contextlib 进入多个上下文的安全顺序

\`\`\`python
from contextlib import ExitStack

# 假设资源之间有依赖：A 依赖 B，B 依赖 C
# 必须按 C → B → A 顺序打开，按 A → B → C 顺序关闭
class Resource:
    def __init__(self, name):
        self.name = name
    def __enter__(self):
        print(f"打开 {self.name}")
        return self
    def __exit__(self, *args):
        print(f"关闭 {self.name}")
        return False

with ExitStack() as stack:
    # 按顺序进入，ExitStack 会自动按相反顺序退出
    stack.enter_context(Resource("C（底层）"))
    stack.enter_context(Resource("B（中层）"))
    stack.enter_context(Resource("A（上层）"))
    print("所有资源已就绪")
# 退出顺序：A → B → C
\`\`\`

## 小结

- ⭐ \`with\` 通过 \`__enter__\` / \`__exit__\` 协议自动管理资源，**即使异常也保证清理**。
- ⭐ \`contextlib.contextmanager\` 用生成器简化实现，比写类更简洁。
- ⭐ \`ExitStack\` 用于运行时才知道数量的资源，\`callback\` 注册普通清理函数。
- 内置上下文管理器：\`suppress\`（忽略异常）、\`redirect_stdout\`（重定向输出）、\`closing\`（包装 close）。
- 异步场景用 \`async with\` + \`__aenter__\` / \`__aexit__\`。
- \`__exit__\` 返回 True 会吞异常，**绝大多数情况返回 False**。
- 真实场景：文件、锁、连接、事务、临时目录——都该用 with。

下一章讲异常处理的工程化最佳实践：什么时候该捕获、什么时候该让它飞、日志怎么打、重试怎么做。`,
  },

  // ============================================================
  // 第四十四章 异常处理最佳实践
  // ============================================================
  {
    id: 'py10-ch44',
    group: '第九部分 异常处理',
    icon: '✅',
    title: '第四十四章 异常处理最佳实践',
    content: `## 第四十四章 异常处理最佳实践

异常处理不是"会写 try/except 就行"，更重要的是**什么时候捕获、什么时候让它飞、怎么记录、怎么恢复**。这一章讲工程化的最佳实践，帮你的代码在出错时也能优雅地降级。

### 一、EAFP vs LBYL

两种编程风格的对比：

- **LBYL**（Look Before You Leap，三思而后行）：先检查再操作
- **EAFP**（Easier to Ask Forgiveness than Permission，宽恕比许可更容易）：先操作，错了再处理

\`\`\`python
# LBYL 风格：先检查
def get_value_lbyl(d, key):
    if key in d:  # 先检查
        return d[key]
    return None

# EAFP 风格：先试，错了再处理
def get_value_eafp(d, key):
    try:
        return d[key]
    except KeyError:
        return None

# Python 推荐 EAFP，原因有二：
# 1. 避免 TOCTOU（Time Of Check To Time Of Use）竞态
# 2. 代码更简洁，减少分支
d = {"name": "张三"}
print(get_value_lbyl(d, "name"))
print(get_value_eafp(d, "age"))
\`\`\`

**Python 文化偏好 EAFP**——异常处理的开销在"不抛异常"时几乎为零，比每次都 if 检查更优雅。

### 二、什么时候该捕获异常

只在以下三种情况捕获：

1. **你确实能恢复**（比如用默认值替代）
2. **你需要清理资源**（比如关文件）
3. **你需要给异常加上下文再抛出**（链式异常）

\`\`\`python
# 场景 1：能恢复
def get_config_value(key, default=None):
    try:
        # 从配置文件读
        return read_config()[key]
    except (FileNotFoundError, KeyError):
        # 配置缺失用默认值，这是合理的恢复
        return default

def read_config():
    # 模拟：文件不存在
    raise FileNotFoundError

print(get_config_value("port", 8080))  # 8080

# 场景 2：清理资源
def process_file(path):
    f = open(path, 'r', encoding='utf-8')
    try:
        # 复杂处理可能抛异常
        return f.read().upper()
    finally:
        # 不论成败，关闭文件
        f.close()

# 场景 3：加上下文再抛
def load_user(user_id):
    try:
        return fetch_from_db(user_id)
    except Exception as e:
        # 加上业务上下文，方便排查
        raise RuntimeError(f"加载用户 {user_id} 失败") from e

def fetch_from_db(user_id):
    raise ConnectionError("数据库连接失败")

try:
    load_user(42)
except RuntimeError as e:
    print(f"捕获：{e}")
    print(f"原因：{e.__cause__}")
\`\`\`

### 三、什么时候让它传播

不要在每个函数里都加 try/except——**只在"能处理的边界"处理**：

\`\`\`python
# 反模式：层层捕获，每层都吞异常
def level3_bad():
    try:
        return 1 / 0
    except Exception:
        return None  # 异常被吞，调用方根本不知道出错了

def level2_bad():
    result = level3_bad()
    if result is None:
        return -1  # 又一层"特殊值"
    return result * 2

def level1_bad():
    r = level2_bad()
    if r == -1:
        return "ERROR"  # 最终变成字符串，调用方一头雾水
    return r

print(level1_bad())  # "ERROR"，但根本不知道是除零

# 正确做法：让异常传播到能处理的边界
def level3_good():
    return 1 / 0  # 不捕获，让异常往上飞

def level2_good():
    return level3_good() * 2  # 也不捕获

def level1_good():
    try:
        return level2_good()
    except ZeroDivisionError as e:
        # 在最顶层（如 API 入口）处理
        # 记录日志、返回错误响应
        print(f"日志：{e}")
        return None

print(level1_good())
\`\`\`

### 四、异常吞咽的反模式

\`\`\`python
# ❌ 反模式 1：空 except
def bad1():
    try:
        do_something()
    except:
        pass  # 吞掉所有异常，包括 KeyboardInterrupt
            # 出 bug 也没人知道

# ❌ 反模式 2：太宽泛
def bad2():
    try:
        do_something()
    except Exception:
        pass  # 同样吞掉所有业务异常

# ❌ 反模式 3：只 print 不记录
def bad3():
    try:
        do_something()
    except Exception as e:
        print(e)  # print 不会被日志系统收集，调试时找不到

# ✅ 正确做法
import logging
logger = logging.getLogger(__name__)

def good():
    try:
        do_something()
    except SpecificError as e:
        # 记录完整 traceback 到日志
        logger.exception("处理失败")  # 自动带 traceback
        # 决定是否继续抛出或返回默认值
        raise

def do_something():
    raise ValueError("模拟错误")

try:
    good()
except ValueError:
    print("已记录日志并重新抛出")
\`\`\`

### 五、用 logging.exception 记录异常

\`logging.exception\` 会自动带上完整的 traceback：

\`\`\`python
import logging
import sys

# 配置日志：输出到 stderr，包含时间、级别、消息
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    stream=sys.stderr
)
logger = logging.getLogger("demo")

def divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        # logger.exception 自动记录 traceback
        # 必须在 except 块里调用，才能拿到当前异常
        logger.exception("除法失败：a=%s, b=%s", a, b)
        # 决定是抛出还是返回默认值
        return None

print(divide(10, 0))
\`\`\`

### 六、cleanup 必须放在 finally

资源清理的黄金法则：**finally 而不是 except**。

\`\`\`python
# ❌ 错误：在 except 里清理
def wrong_cleanup(path):
    f = open(path, 'r', encoding='utf-8')
    try:
        return f.read()
    except Exception:
        f.close()  # 只有出错才关，正常路径不关！
        raise

# ✅ 正确：在 finally 里清理
def right_cleanup(path):
    f = open(path, 'r', encoding='utf-8')
    try:
        return f.read()
    finally:
        # 不论成功失败都关闭
        f.close()

# ✅ 更好：用 with
def best_cleanup(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

# 测试
import tempfile, os
with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt', encoding='utf-8') as tmp:
    tmp.write("hello")
    path = tmp.name

print(right_cleanup(path))
os.unlink(path)
\`\`\`

### 七、重试模式

网络请求、外部服务调用经常需要重试：

\`\`\`python
import time
import random

def retry(max_attempts=3, delay=1.0, exceptions=(Exception,)):
    """重试装饰器：失败时等待后重试。"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    print(f"第 {attempt}/{max_attempts} 次失败：{e}")
                    if attempt < max_attempts:
                        time.sleep(delay)
                    # 不立即抛出，继续重试
            # 全部失败，抛出最后一次的异常
            raise last_exception
        return wrapper
    return decorator

# 模拟不稳定的服务
call_count = 0
@retry(max_attempts=4, delay=0.1, exceptions=(ConnectionError,))
def fetch_data():
    global call_count
    call_count += 1
    # 模拟前 3 次都失败，第 4 次成功
    if call_count < 4:
        raise ConnectionError(f"连接失败（第 {call_count} 次）")
    return "数据"

try:
    result = fetch_data()
    print(f"成功：{result}")
except Exception as e:
    print(f"最终失败：{e}")
\`\`\`

### 八、指数退避重试

固定间隔重试可能压垮服务，用指数退避更友好：

\`\`\`python
import time
import random

def retry_with_backoff(max_attempts=5, base_delay=0.1, max_delay=10.0,
                      exceptions=(Exception,)):
    """带指数退避和抖动的重试。"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt >= max_attempts:
                        break
                    # 延迟 = base * 2^(attempt-1) + 随机抖动
                    delay = min(base_delay * (2 ** (attempt - 1)), max_delay)
                    # 加抖动避免"惊群效应"——所有重试同时打到服务
                    delay += random.uniform(0, delay * 0.1)
                    print(f"第 {attempt} 次失败，{delay:.2f}s 后重试：{e}")
                    time.sleep(delay)
            raise last_exception
        return wrapper
    return decorator

call_count = 0
@retry_with_backoff(max_attempts=4, base_delay=0.05,
                     exceptions=(ConnectionError,))
def unstable_api():
    global call_count
    call_count += 1
    if call_count < 3:
        raise ConnectionError("服务暂不可用")
    return "OK"

try:
    print(f"结果：{unstable_api()}")
except ConnectionError as e:
    print(f"最终失败：{e}")
\`\`\`

### 九、断路器模式（Circuit Breaker）

连续失败到一定次数后，**直接停止尝试**，避免压垮下游：

\`\`\`python
import time

class CircuitBreaker:
    """简单的断路器实现。"""
    def __init__(self, failure_threshold=5, recovery_timeout=30):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = 0
        self.state = "CLOSED"  # CLOSED / OPEN / HALF_OPEN

    def __call__(self, func):
        def wrapper(*args, **kwargs):
            # 检查断路器状态
            if self.state == "OPEN":
                # 看是否到了恢复时间
                if time.time() - self.last_failure_time > self.recovery_timeout:
                    self.state = "HALF_OPEN"
                    print("[断路器] 进入半开状态，尝试一次")
                else:
                    raise RuntimeError("断路器打开，请求被拒绝")

            try:
                result = func(*args, **kwargs)
                # 成功：重置
                if self.state == "HALF_OPEN":
                    self.state = "CLOSED"
                    print("[断路器] 恢复正常")
                self.failure_count = 0
                return result
            except Exception as e:
                self.failure_count += 1
                self.last_failure_time = time.time()
                if self.failure_count >= self.failure_threshold:
                    self.state = "OPEN"
                    print(f"[断路器] 打开！失败 {self.failure_count} 次")
                raise
        return wrapper

breaker = CircuitBreaker(failure_threshold=3, recovery_timeout=1)

@breaker
def unstable_service():
    raise ConnectionError("服务不可用")

for i in range(5):
    try:
        unstable_service()
    except Exception as e:
        print(f"第 {i+1} 次：{e}")
\`\`\`

### 十、不要捕获后忽略细节

\`\`\`python
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ❌ 丢失堆栈信息
def bad_log():
    try:
        risky()
    except Exception as e:
        # 只记录消息字符串，丢失 traceback
        logger.error(f"出错：{e}")
        raise

# ✅ 用 logger.exception 记录完整堆栈
def good_log():
    try:
        risky()
    except Exception:
        # logger.exception 自动带上当前异常的 traceback
        # 必须在 except 块里调用
        logger.exception("处理失败")
        raise

def risky():
    raise ValueError("数据格式错误")

try:
    bad_log()
except ValueError:
    pass

print("---")

try:
    good_log()
except ValueError:
    pass
\`\`\`

### 十一、把异常转成业务错误码

API 边界把异常映射成结构化错误：

\`\`\`python
class ServiceResult:
    """统一返回结构。"""
    def __init__(self, success, data=None, error=None, code=None):
        self.success = success
        self.data = data
        self.error = error
        self.code = code

    @classmethod
    def ok(cls, data):
        return cls(True, data=data)

    @classmethod
    def fail(cls, error, code):
        return cls(False, error=error, code=code)

    def __repr__(self):
        if self.success:
            return f"Ok({self.data!r})"
        return f"Fail(code={self.code!r}, error={self.error!r})"

def api_get_user(user_id):
    """API 层：把异常转成统一返回结构。"""
    try:
        if not isinstance(user_id, int):
            raise TypeError("user_id 必须是整数")
        if user_id < 0:
            raise ValueError("user_id 不能为负数")
        # 模拟查找
        if user_id == 0:
            raise KeyError("用户不存在")
        return ServiceResult.ok({"id": user_id, "name": "张三"})
    except TypeError as e:
        return ServiceResult.fail(str(e), code="INVALID_TYPE")
    except ValueError as e:
        return ServiceResult.fail(str(e), code="INVALID_VALUE")
    except KeyError as e:
        return ServiceResult.fail(str(e), code="NOT_FOUND")
    except Exception as e:
        # 兜底：未知异常统一 500
        return ServiceResult.fail("服务器内部错误", code="INTERNAL")

print(api_get_user(1))      # Ok({'id': 1, 'name': '张三'})
print(api_get_user(-1))     # Fail(code='INVALID_VALUE', ...)
print(api_get_user(0))      # Fail(code='NOT_FOUND', ...)
print(api_get_user("x"))    # Fail(code='INVALID_TYPE', ...)
\`\`\`

### 十二、断言（assert）的使用边界

\`assert\` 用于**契约检查**——验证"不可能发生的情况没发生"：

\`\`\`python
def calculate_average(numbers):
    # assert 用于检查程序内部不变量
    # 不是用于校验外部输入！
    assert isinstance(numbers, list), f"期望 list，得到 {type(numbers).__name__}"
    assert len(numbers) > 0, "列表不能为空"

    total = sum(numbers)
    avg = total / len(numbers)
    # 验证结果合理性
    assert min(numbers) <= avg <= max(numbers), "平均值不在合理范围"
    return avg

print(calculate_average([1, 2, 3, 4, 5]))

# 注意：assert 可以用 -O 选项禁用
# python -O script.py 会跳过所有 assert
# 所以不要用 assert 做必要的校验（比如输入检查）
\`\`\`

**规则**：
- \`assert\`：内部不变量、debug 检查（可被禁用）
- \`if + raise\`：外部输入校验（不能被禁用）

### 十三、异常处理流程图

整理一下决策思路：

\`\`\`python
def handle_exception_decision(exception, can_recover, is_boundary, has_resource):
    """决策示例（伪代码风格）。"""
    # 1. 有资源要清理吗？
    if has_resource:
        # 必须在 finally 里清理
        pass

    # 2. 能恢复吗？（比如用默认值）
    if can_recover:
        # 捕获并处理
        pass

    # 3. 是系统边界吗？（API 入口、消息消费）
    if is_boundary:
        # 捕获、记录日志、转成业务错误
        pass

    # 4. 都不是：让它传播
    # raise

# 决策表
print("""
| 场景               | 处理方式                  |
|-------------------|--------------------------|
| 能恢复（默认值）   | 捕获并处理                |
| 资源清理           | finally 或 with           |
| 系统边界（API）    | 捕获、记录、转错误码       |
| 内部不变量         | assert                    |
| 外部输入校验       | if + raise                |
| 其他情况           | 让它传播                  |
""")
\`\`\`

### 十四、可重试 vs 不可重试异常

\`\`\`python
# 区分可重试和不可重试异常
class RetryableError(Exception):
    """可重试错误：网络、临时故障。"""
    pass

class NonRetryableError(Exception):
    """不可重试错误：参数错误、业务逻辑错误。"""
    pass

def call_external_service(data):
    """模拟外部调用。"""
    if not data:
        # 参数错误：重试也没用
        raise NonRetryableError("参数不能为空")
    if len(data) > 100:
        # 业务错误：重试也没用
        raise NonRetryableError("数据过长")
    # 模拟网络抖动：每次 50% 概率失败
    import random
    if random.random() < 0.5:
        raise RetryableError("服务暂时不可用")
    return f"处理了 {len(data)} 字节"

# 只重试可重试异常
import random
random.seed(42)
for attempt in range(5):
    try:
        result = call_external_service("hello")
        print(f"第 {attempt+1} 次成功：{result}")
        break
    except RetryableError as e:
        print(f"第 {attempt+1} 次可重试失败：{e}")
    except NonRetryableError as e:
        print(f"第 {attempt+1} 次不可重试：{e}，直接放弃")
        break
\`\`\`

### 十五、不要在 except 里做复杂逻辑

\`\`\`python
import logging
logger = logging.getLogger(__name__)

# ❌ except 块里做复杂操作，可能引发新异常
def bad_handler():
    try:
        risky_operation()
    except Exception:
        # 这里如果再抛异常，会变成新的异常
        # 而且可能丢失原始上下文
        cleanup_database()  # 这个可能也失败
        send_alert_email()  # 网络可能不通
        write_log_to_file()  # 磁盘可能满

# ✅ except 块尽量简单，复杂逻辑交给专门的处理器
def good_handler():
    try:
        risky_operation()
    except Exception:
        # 只做最简单的事：记录、抛出
        logger.exception("操作失败")
        # 把异常包装成业务异常，交给上层
        raise

def risky_operation():
    raise RuntimeError("模拟失败")

try:
    good_handler()
except RuntimeError:
    print("已记录并重新抛出")
\`\`\`

### 十六、文档化异常

函数 docstring 要说明会抛什么异常：

\`\`\`python
def divide(a, b):
    """两个数相除。

    Args:
        a: 被除数
        b: 除数

    Returns:
        商

    Raises:
        ZeroDivisionError: 当 b 为 0 时
        TypeError: 当 a 或 b 不是数字时
    """
    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise TypeError("参数必须是数字")
    if b == 0:
        raise ZeroDivisionError("除数不能为 0")
    return a / b

# 调用方一看 docstring 就知道要捕获什么
try:
    print(divide(10, 0))
except (ZeroDivisionError, TypeError) as e:
    print(f"捕获：{e}")
\`\`\`

### 十七、综合实战：健壮的 HTTP 请求封装

\`\`\`python
import time
import logging
from contextlib import contextmanager

logger = logging.getLogger("http_client")

class HTTPError(Exception):
    """HTTP 请求异常。"""
    def __init__(self, message, status_code=None, retryable=False):
        super().__init__(message)
        self.status_code = status_code
        self.retryable = retryable

@contextmanager
def measure_time(name):
    start = time.perf_counter()
    try:
        yield
    finally:
        logger.info(f"{name} 耗时 {time.perf_counter()-start:.3f}s")

def robust_http_get(url, max_retries=3, timeout=5):
    """健壮的 HTTP GET，带重试和异常分类。"""
    last_error = None
    for attempt in range(1, max_retries + 1):
        try:
            with measure_time(f"GET {url} (attempt {attempt})"):
                # 模拟请求
                if "fail" in url:
                    raise ConnectionError("连接失败")
                if "500" in url:
                    raise HTTPError("服务器错误", 500, retryable=True)
                if "404" in url:
                    raise HTTPError("未找到", 404, retryable=False)
                return f"<html>{url}</html>"
        except ConnectionError as e:
            # 网络错误：可重试
            last_error = HTTPError(str(e), retryable=True)
            logger.warning(f"网络错误，重试：{e}")
        except HTTPError as e:
            if not e.retryable:
                # 不可重试：直接返回错误
                raise
            last_error = e
            logger.warning(f"HTTP {e.status_code}，重试")
        # 指数退避
        time.sleep(0.1 * attempt)

    # 全部重试失败
    raise last_error

# 测试
logging.basicConfig(level=logging.INFO)
for url in ["https://example.com/ok", "https://example.com/404",
            "https://example.com/fail"]:
    try:
        result = robust_http_get(url, max_retries=2)
        print(f"成功：{result}")
    except HTTPError as e:
        print(f"失败 [{e.status_code}]：{e}，可重试={e.retryable}")
\`\`\`

## 小结

- ⭐ Python 文化偏好 **EAFP**（先做错了再处理）而不是 LBYL。
- ⭐ 只在**能恢复 / 要清理 / 边界处理**三种情况捕获；其他时候让异常传播。
- ⭐ 用 \`logger.exception\` 而不是 \`print\` 或 \`logger.error\` 记录异常，自动带 traceback。
- ⭐ 资源清理放 \`finally\` 或 \`with\`，绝不能只在 \`except\` 里。
- 重试用**指数退避 + 抖动**，避免压垮服务；连续失败用**断路器**熔断。
- 区分**可重试异常**（网络故障）和**不可重试异常**（参数错误）。
- \`assert\` 用于内部不变量，外部输入校验用 \`if + raise\`。
- API 边界把异常转成**统一错误结构**，方便调用方处理。

下一章讲调试与日志——\`logging\` 模块、\`pdb\` 调试器、\`traceback\` 模块、\`warnings\` 模块。`,
  },

  // ============================================================
  // 第四十五章 调试与日志
  // ============================================================
  {
    id: 'py10-ch45',
    group: '第九部分 异常处理',
    icon: '🔍',
    title: '第四十五章 调试与日志',
    content: `## 第四十五章 调试与日志

程序出错时，**日志和调试器**是排查问题的两件套。\`print\` 调试简单粗暴但只能临时用——生产代码必须用 \`logging\` 模块。这一章讲清楚日志体系、调试技巧和排查工具。

### 一、为什么不用 print

\`print\` 有几个硬伤：
- 没法分级（debug / info / warning / error）
- 不能控制输出位置（文件 vs 控制台）
- 不能按模块过滤
- 没有时间戳、调用位置等元信息

\`\`\`python
# print 的痛点
def buggy_function(x):
    # 调试时到处加 print
    print(f"调试：x={x}")  # 上线后忘了删
    result = x * 2
    print(f"调试：result={result}")  # 用户也看到这些
    return result

buggy_function(5)

# 用 logging 就优雅多了
import logging
logging.basicConfig(level=logging.DEBUG, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

def good_function(x):
    logger.debug(f"输入 x={x}")  # 上线后改 level=INFO 就看不到
    result = x * 2
    logger.debug(f"结果 result={result}")
    return result

good_function(5)
\`\`\`

### 二、logging 模块基础

\`logging\` 的核心是四个概念：
- **Logger**：记录器，发出日志的入口
- **Handler**：处理器，决定日志去哪（控制台、文件）
- **Formatter**：格式器，日志长什么样
- **Level**：级别，决定哪些日志会被记录

\`\`\`python
import logging

# 最简单的配置：basicConfig
# 必须在第一次调用 logging.info 之前调用
logging.basicConfig(
    level=logging.DEBUG,  # 最低级别（DEBUG 及以上都输出）
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# 直接用根 logger
logging.debug("调试信息")
logging.info("一般信息")
logging.warning("警告信息")
logging.error("错误信息")
logging.critical("严重错误")
\`\`\`

### 三、日志级别

级别从低到高，**设置了某个级别就只输出该级别及以上的**：

| 级别 | 数值 | 用途 |
|------|-----|------|
| \`DEBUG\` | 10 | 详细调试信息（开发用） |
| \`INFO\` | 20 | 确认程序按预期运行 |
| \`WARNING\` | 30 | 警告，程序仍能运行 |
| \`ERROR\` | 40 | 错误，某些功能失效 |
| \`CRITICAL\` | 50 | 严重错误，程序可能无法继续 |

\`\`\`python
import logging
logging.basicConfig(level=logging.WARNING)  # 只输出 WARNING 及以上

logging.debug("这行不会输出")     # 级别不够
logging.info("这行也不会输出")    # 级别不够
logging.warning("这行会输出")    # 刚好
logging.error("这行也会输出")     # 更高
\`\`\`

### 四、getLogger 模块化日志

每个模块用自己的 logger，便于按模块控制级别：

\`\`\`python
import logging

logging.basicConfig(level=logging.DEBUG,
                    format='%(name)s [%(levelname)s] %(message)s')

# 每个模块用 __name__ 作为 logger 名
# __name__ 在模块里是模块路径，天然按模块分组
logger = logging.getLogger(__name__)

# 子 logger 会继承父 logger 的配置
db_logger = logging.getLogger("app.database")
api_logger = logging.getLogger("app.api")

db_logger.info("数据库已连接")
api_logger.warning("API 响应慢")

# 可以单独调整某个模块的级别
db_logger.setLevel(logging.WARNING)  # 数据库模块只输出 WARNING 以上
db_logger.debug("这行不会输出")
db_logger.warning("这行会输出")
\`\`\`

### 五、Handler 控制输出位置

\`\`\`python
import logging

# 创建自定义 logger（不用 basicConfig）
logger = logging.getLogger("myapp")
logger.setLevel(logging.DEBUG)

# 1. 控制台 handler：输出到 stderr
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)  # 控制台只看 INFO 以上
console_format = logging.Formatter('%(levelname)s: %(message)s')
console_handler.setFormatter(console_format)
logger.addHandler(console_handler)

# 2. 文件 handler：写到日志文件
file_handler = logging.FileHandler('app.log', encoding='utf-8')
file_handler.setLevel(logging.DEBUG)  # 文件记录所有 DEBUG 以上
file_format = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
file_handler.setFormatter(file_format)
logger.addHandler(file_handler)

# 测试
logger.debug("调试信息：只进文件")
logger.info("一般信息：进文件 + 控制台")
logger.error("错误信息：进文件 + 控制台")

# 清理（避免重复输出）
import os
logger.handlers.clear()
if os.path.exists('app.log'):
    os.remove('app.log')
\`\`\`

### 六、按大小 / 时间滚动日志

生产环境日志文件会变大，需要滚动：

\`\`\`python
import logging
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
import os

logger = logging.getLogger("rotating_demo")
logger.setLevel(logging.DEBUG)

# 按大小滚动：每个文件最大 1KB，保留 3 个备份
# 当文件超过 1KB 时，自动重命名为 app.log.1，新日志写 app.log
size_handler = RotatingFileHandler(
    'app_rotating.log', maxBytes=1024, backupCount=3, encoding='utf-8'
)
size_handler.setFormatter(logging.Formatter(
    '%(asctime)s [%(levelname)s] %(message)s'
))
logger.addHandler(size_handler)

# 写入一些日志触发滚动
for i in range(50):
    logger.info(f"这是第 {i} 条日志，用于演示按大小滚动")

# 按时间滚动：每天一个文件
time_handler = TimedRotatingFileHandler(
    'app_timed.log', when='midnight', backupCount=7, encoding='utf-8'
)
logger.addHandler(time_handler)
logger.info("这条会按天滚动")

# 清理演示文件
logger.handlers.clear()
for f in ['app_rotating.log', 'app_timed.log']:
    if os.path.exists(f):
        os.remove(f)
for i in range(4):
    backup = f'app_rotating.log.{i}' if i > 0 else None
    if backup and os.path.exists(backup):
        os.remove(backup)
print("演示完成，已清理文件")
\`\`\`

### 七、logging.exception 记录异常

\`\`\`python
import logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

def risky_calc(x):
    # 故意制造异常
    return 10 / x

try:
    risky_calc(0)
except ZeroDivisionError:
    # logger.exception 只能在 except 块里调用
    # 自动记录当前异常的完整 traceback
    logger.exception("计算失败")
    # 等价于 logger.error("...", exc_info=True)
\`\`\`

### 八、Formatter 的高级字段

\`\`\`python
import logging
import os

# Formatter 支持的字段
fmt = logging.Formatter(
    # %(name)s: logger 名
    # %(filename)s: 调用日志的源文件名
    # %(lineno)d: 行号
    # %(funcName)s: 函数名
    # %(process)d / %(thread)d: 进程/线程 ID
    # %(module)s: 模块名
    '%(asctime)s | %(process)d:%(thread)d | %(name)s | '
    '%(filename)s:%(lineno)d %(funcName)s() | %(levelname)s | %(message)s'
)

handler = logging.StreamHandler()
handler.setFormatter(fmt)

logger = logging.getLogger("advanced")
logger.setLevel(logging.INFO)
logger.addHandler(handler)

def do_something():
    logger.info("在 do_something 里调用")

do_something()
\`\`\`

### 九、logging.config 配置文件

复杂日志配置可以写成 JSON/YAML：

\`\`\`python
import logging.config

# 字典形式的配置
LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,  # 不禁用已有的 logger
    'formatters': {
        'standard': {
            'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
        },
        'detailed': {
            'format': '%(asctime)s [%(levelname)s] %(filename)s:%(lineno)d: %(message)s'
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'level': 'INFO',
            'formatter': 'standard',
        },
    },
    'loggers': {
        'myapp': {
            'level': 'DEBUG',
            'handlers': ['console'],
            'propagate': False,  # 不向父 logger 传播
        },
    },
    'root': {  # 根 logger
        'level': 'WARNING',
        'handlers': ['console'],
    },
}

# 应用配置
logging.config.dictConfig(LOGGING_CONFIG)

# 测试
logger = logging.getLogger("myapp")
logger.debug("myapp 的 DEBUG")
logger.info("myapp 的 INFO")

root_logger = logging.getLogger()
root_logger.info("根 logger 的 INFO（不会输出，level=WARNING）")
root_logger.warning("根 logger 的 WARNING")
\`\`\`

### 十、traceback 模块

\`traceback\` 模块用于格式化和打印异常堆栈：

\`\`\`python
import traceback
import sys

def deep_function():
    # 模拟深层调用栈
    def level1():
        def level2():
            # 这里抛出异常
            raise ValueError("深层错误")
        level2()
    level1()

# 场景 1：打印完整 traceback
try:
    deep_function()
except ValueError:
    # traceback.print_exc() 直接打印到 stderr
    # 这里我们捕获格式化字符串
    tb_str = traceback.format_exc()
    print("=== 完整 traceback ===")
    print(tb_str)

# 场景 2：只取最近的几行
try:
    deep_function()
except ValueError:
    # extract_tb 返回 FrameInfo 列表
    tb = sys.exc_info()[2]
    frames = traceback.extract_tb(tb)
    print(f"=== 调用栈深度：{len(frames)} 层 ===")
    for frame in frames[-3:]:  # 只看最后 3 帧
        print(f"  {frame.filename}:{frame.lineno} in {frame.name}")
        print(f"    {frame.line}")
\`\`\`

### 十一、自定义 traceback 输出

\`\`\`python
import traceback
import sys

def print_compact_traceback():
    """紧凑版 traceback：只显示关键信息。"""
    exc_type, exc_val, exc_tb = sys.exc_info()
    if exc_tb is None:
        print("没有异常上下文")
        return

    # 取出所有栈帧
    frames = traceback.extract_tb(exc_tb)

    print(f"异常：{exc_type.__name__}: {exc_val}")
    print(f"栈深度：{len(frames)}")
    print("最近 3 帧：")
    for frame in frames[-3:]:
        # 用相对路径，更易读
        filename = frame.filename.split('/')[-1] if '/' in frame.filename else frame.filename
        print(f"  → {filename}:{frame.lineno} {frame.name}()")
        if frame.line:
            print(f"      {frame.line.strip()}")

try:
    def a(): b()
    def b(): c()
    def c(): raise RuntimeError("测试异常")
    a()
except:
    print_compact_traceback()
\`\`\`

### 十二、warnings 模块

\`warnings\` 用于警告——不是错误，但需要提醒开发者注意：

\`\`\`python
import warnings

# 发出警告
warnings.warn("这个函数已弃用，请用 new_func()", DeprecationWarning)
warnings.warn("参数已弃用", UserWarning)
warnings.warn("资源使用率高", ResourceWarning)

# 警告不会终止程序
print("程序继续执行")

# 控制警告行为
warnings.simplefilter('error')  # 把所有警告转成异常
try:
    warnings.warn("这会抛异常", UserWarning)
except UserWarning as e:
    print(f"警告变成异常：{e}")

# 恢复默认
warnings.simplefilter('default')
warnings.warn("又是普通警告", UserWarning)
print("依然继续")
\`\`\`

### 十三、自定义警告类型

\`\`\`python
import warnings

class APIDeprecationWarning(UserWarning):
    """API 弃用警告。"""
    pass

def old_function():
    """旧 API，推荐用 new_function。"""
    # 自定义警告，带更详细的上下文
    warnings.warn(
        "old_function 将在 v2.0 移除，请迁移到 new_function",
        APIDeprecationWarning,
        stacklevel=2  # 指向调用方而不是这行
    )
    return "old result"

def new_function():
    return "new result"

# 调用旧函数会触发警告
import warnings
with warnings.catch_warnings(record=True) as w:
    warnings.simplefilter("always")
    result = old_function()
    print(f"结果：{result}")
    for warning in w:
        print(f"警告 [{warning.category.__name__}]: {warning.message}")
\`\`\`

### 十四、assert 断言

\`assert\` 用于内部不变量检查，失败时抛 \`AssertionError\`：

\`\`\`python
def transfer(amount, balance):
    """转账：amount 必须为正，且不超过余额。"""
    # 用 assert 验证内部不变量
    # 注意：assert 可以被 python -O 禁用
    # 所以必要校验用 if + raise
    assert amount > 0, f"金额必须为正：{amount}"
    assert amount <= balance, f"余额不足：{balance} < {amount}"

    balance -= amount
    return balance

print(transfer(100, 500))  # 400

try:
    transfer(-50, 500)
except AssertionError as e:
    print(f"断言失败：{e}")

try:
    transfer(1000, 500)
except AssertionError as e:
    print(f"断言失败：{e}")
\`\`\`

**重要：\`python -O\` 会跳过所有 assert**，所以业务校验不能用 assert：

\`\`\`python
def validate_age(age):
    """校验用户输入的年龄。"""
    # ❌ 错误：用 assert 校验外部输入
    # 用 python -O 启动时，这个校验就没了
    # assert 0 <= age <= 150

    # ✅ 正确：用 if + raise
    if not isinstance(age, int):
        raise TypeError("年龄必须是整数")
    if not 0 <= age <= 150:
        raise ValueError("年龄必须在 0-150 之间")
    return age

print(validate_age(25))
try:
    validate_age(200)
except ValueError as e:
    print(f"校验失败：{e}")
\`\`\`

### 十五、pdb 调试器

\`pdb\` 是 Python 内置调试器，在脚本里插入断点：

\`\`\`python
# 程序运行到 breakpoint() 会暂停，进入交互式调试
# pdb 常用命令：
#   n (next): 执行下一行，不进入函数
#   s (step): 执行下一行，进入函数
#   c (continue): 继续执行到下一个断点
#   p var (print): 打印变量
#   l (list): 查看当前代码位置
#   q (quit): 退出调试
#   b (break): 设置断点
#   w (where): 查看调用栈

# 演示：不要直接运行（会卡住），用 PDB_DEBUG=True 控制
PDB_DEBUG = False

def buggy_sum(numbers):
    total = 0
    for i, n in enumerate(numbers):
        if PDB_DEBUG:
            # 程序运行到这会暂停，可以输入命令调试
            breakpoint()
        total += n
        print(f"加 {n}，当前总和：{total}")
    return total

print(buggy_sum([1, 2, 3, 4, 5]))
\`\`\`

### 十六、用 traceback 调试未知异常

\`\`\`python
import sys
import traceback

def debug_exception(exc_info):
    """从 sys.exc_info() 提取调试信息。"""
    exc_type, exc_val, exc_tb = exc_info

    print("\\n=== 异常诊断 ===")
    print(f"类型：{exc_type.__module__}.{exc_type.__name__}")
    print(f"消息：{exc_val}")
    print(f"参数：{getattr(exc_val, 'args', None)}")

    # 自定义属性
    for attr in ['code', 'field', 'status_code']:
        if hasattr(exc_val, attr):
            print(f"{attr}: {getattr(exc_val, attr)}")

    print("\\n=== 调用栈 ===")
    # format_exception 返回字符串列表
    tb_lines = traceback.format_exception(exc_type, exc_val, exc_tb)
    # 只显示最后 5 行 traceback
    print(''.join(tb_lines[-5:]))

# 触发异常
class CustomError(Exception):
    def __init__(self, message, code):
        super().__init__(message)
        self.code = code

def trigger():
    raise CustomError("业务错误", code="ERR_001")

try:
    trigger()
except:
    debug_exception(sys.exc_info())
\`\`\`

### 十七、日志的最佳实践

\`\`\`python
import logging

# 配置一次，全局使用
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s:%(lineno)d: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# 1. 用占位符而不是字符串拼接
# ✅ 好
logger.info("用户 %s 登录，IP=%s", "张三", "127.0.0.1")
# ❌ 不好：即使日志级别不够也会执行字符串拼接
# logger.info("用户 " + "张三" + " 登录")

# 2. 异常用 logger.exception
try:
    1 / 0
except ZeroDivisionError:
    # 自动带 traceback，比 logger.error(str(e)) 信息全
    logger.exception("计算失败")

# 3. 大量数据用 repr 而不是 str
big_list = list(range(100))
logger.debug("处理大数据：长度=%d，前 5 个=%r", len(big_list), big_list[:5])

# 4. 关键操作打 INFO，调试信息打 DEBUG
def process_order(order_id):
    logger.info("开始处理订单 %s", order_id)
    # ... 处理逻辑
    logger.debug("订单 %s 处理中，当前步骤=校验库存", order_id)
    # ... 更多逻辑
    logger.info("订单 %s 处理完成", order_id)

process_order("ORD-001")
\`\`\`

### 十八、警告 vs 日志 vs 异常

三者用途区别：

| 机制 | 用途 | 终止程序 | 示例 |
|------|------|---------|------|
| \`logging\` | 记录事件 | 不终止 | "用户登录成功" |
| \`warnings\` | 提醒开发者 | 不终止 | "API 已弃用" |
| \`raise\` | 处理错误 | 抛异常 | "参数非法" |

\`\`\`python
import logging
import warnings

logger = logging.getLogger(__name__)

def deprecated_function():
    """已弃用的函数。"""
    # warnings：给开发者看的，提醒"该迁移了"
    warnings.warn(
        "deprecated_function 将在 v2.0 移除",
        DeprecationWarning,
        stacklevel=2
    )
    return "old result"

def get_user(user_id):
    if not isinstance(user_id, int):
        # raise：调用方必须处理
        raise TypeError("user_id 必须是整数")

    logger.info("查询用户 %s", user_id)
    # ... 业务逻辑
    if user_id < 0:
        # raise：业务异常
        raise ValueError("user_id 不能为负数")

    logger.debug("用户 %s 查询完成", user_id)
    return {"id": user_id}

# 演示
deprecated_function()
try:
    get_user(-1)
except ValueError as e:
    logger.error("查询失败：%s", e)
\`\`\`

### 十九、综合实战：带请求追踪的日志

\`\`\`python
import logging
import uuid
import time
from contextlib import contextmanager

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] [%(request_id)s] %(message)s'
)

# 用 LoggerAdapter 给日志加上下文
class RequestLoggerAdapter(logging.LoggerAdapter):
    """给日志加上 request_id 字段。"""
    def process(self, msg, kwargs):
        # 从 extra 取 request_id
        request_id = self.extra.get('request_id', 'no-request')
        # LoggerAdapter 会把 extra 中的字段填入 format
        kwargs.setdefault('extra', {}).update(self.extra)
        return msg, kwargs

@contextmanager
def request_scope(operation_name):
    """请求作用域：生成 request_id 并记录耗时。"""
    request_id = uuid.uuid4().hex[:8]
    base_logger = logging.getLogger(operation_name)
    # 用 adapter 包装，所有日志都带 request_id
    logger = RequestLoggerAdapter(base_logger, {'request_id': request_id})

    start = time.perf_counter()
    logger.info("请求开始：%s", operation_name)
    try:
        yield logger
        elapsed = time.perf_counter() - start
        logger.info("请求完成，耗时 %.3fs", elapsed)
    except Exception:
        elapsed = time.perf_counter() - start
        logger.exception("请求失败，耗时 %.3fs", elapsed)
        raise

# 使用
def fetch_user(user_id):
    with request_scope("fetch_user") as log:
        log.debug("查询数据库：user_id=%s", user_id)
        if user_id < 0:
            raise ValueError("user_id 不能为负数")
        log.info("用户 %s 查询成功", user_id)
        return {"id": user_id}

try:
    fetch_user(42)
    fetch_user(-1)
except ValueError:
    print("上层处理了异常")
\`\`\`

### 二十、性能注意事项

\`\`\`python
import logging
import time

logger = logging.getLogger("perf")
logger.setLevel(logging.WARNING)  # WARNING 级别，DEBUG 不会输出

# 反模式：先格式化再判断级别
def bad():
    start = time.perf_counter()
    for i in range(100000):
        # 即使 DEBUG 不输出，f-string 仍然会执行
        msg = f"处理第 {i} 个，状态 {i * 2}"
        logger.debug(msg)
    print(f"反模式：{time.perf_counter()-start:.3f}s")

# 优化 1：用占位符，logging 内部会判断级别
def better():
    start = time.perf_counter()
    for i in range(100000):
        # 占位符只有级别够时才会格式化
        logger.debug("处理第 %d 个，状态 %d", i, i * 2)
    print(f"占位符：{time.perf_counter()-start:.3f}s")

# 优化 2：先判断级别
def best():
    start = time.perf_counter()
    for i in range(100000):
        # 显式判断，避免函数调用开销
        if logger.isEnabledFor(logging.DEBUG):
            logger.debug("处理第 %d 个，状态 %d", i, i * 2)
    print(f"先判断：{time.perf_counter()-start:.3f}s")

bad()
better()
best()
\`\`\`

## 小结

- ⭐ \`logging\` 模块四要素：**Logger（记录器）/ Handler（处理器）/ Formatter（格式器）/ Level（级别）**。
- ⭐ 五个级别从低到高：\`DEBUG\` / \`INFO\` / \`WARNING\` / \`ERROR\` / \`CRITICAL\`。
- ⭐ \`logger.exception()\` 在 except 块里自动记录 traceback，比 \`logger.error(str(e))\` 信息全。
- ⭐ 每个模块用 \`logging.getLogger(__name__)\` 创建自己的 logger。
- ⭐ 生产环境用 \`RotatingFileHandler\` / \`TimedRotatingFileHandler\` 滚动日志。
- \`traceback\` 模块格式化异常堆栈，\`sys.exc_info()\` 拿当前异常三元组。
- \`warnings\` 用于开发者警告（弃用、配置问题），\`logging\` 用于运行时事件。
- \`assert\` 用于内部不变量，**不要用于外部输入校验**（\`python -O\` 会禁用）。
- \`breakpoint()\` 内置函数进入 \`pdb\` 调试器，常用命令：\`n\` / \`s\` / \`c\` / \`p\` / \`l\` / \`q\`。
- 日志性能优化：用占位符 \`%s\` 而不是 f-string，必要时用 \`isEnabledFor\` 先判断。

下一部分进入文件 IO 与模块，先讲 \`open()\` 的各种模式和 \`pathlib\` 现代化的路径操作。`,
  },
];

export { chapters };
