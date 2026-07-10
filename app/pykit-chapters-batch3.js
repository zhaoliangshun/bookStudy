// =============================================================
// Python 开发常用知识点（pykit）—— 第三批章节
// -------------------------------------------------------------
// 主题：函数与装饰器（共 5 章：第 11 ~ 15 章）
// 转义规则：content 内部反引号写作 \`，${ 写作 \$\{。
// code 字段为 Python 源代码，前端通过 /api/run-py 执行，仅用标准库。
// =============================================================

export const chapters = [
  // =========================================================
  // 第十一章：函数参数技巧
  // =========================================================
  {
    id: "pykit-11",
    group: "函数与装饰器",
    icon: "🔧",
    title: "函数参数技巧",
    content: `# 函数参数技巧

## 一、引言：参数是函数的接口

函数是 Python 组织代码的基本单位，而**参数（parameter）就是函数对外的接口**。一个设计良好的参数列表，能让函数既灵活又安全：调用方用得舒服，维护者改得放心。

Python 的参数机制远比其他语言丰富。本章系统讲解五类参数及其进阶用法，这些技巧在真实项目里几乎天天用到——日志函数、配置构建、API 封装都离不开它们。

\`\`\`text
参数全家福
├── 位置参数（positional）       def f(a, b)
├── 关键字参数（keyword）        f(a=1, b=2)
├── 默认参数（default）          def f(a, b=10)
├── *args 可变位置参数           def f(*args)
├── **kwargs 可变关键字参数      def f(**kwargs)
├── 仅关键字参数（* 之后）       def f(a, *, key)
└── 仅位置参数（/ 之前）         def f(a, b, /)
\`\`\`

---

## 二、位置参数与关键字参数

最基础的两种传参方式：

\`\`\`python
def greet(name, greeting):           # 两个位置参数
    return f"{greeting}, {name}!"

greet("Alice", "Hello")              # 位置传参：按顺序对应
greet(name="Alice", greeting="Hi")   # 关键字传参：按名字对应
greet("Alice", greeting="Hi")        # 混合：位置在前，关键字在后
\`\`\`

**规则**：位置参数必须在关键字参数前面。下面这样是错的：

\`\`\`python
greet(name="Alice", "Hi")  # SyntaxError: positional argument follows keyword argument
\`\`\`

| 传参方式 | 优点                 | 缺点                       |
| -------- | -------------------- | -------------------------- |
| 位置传参 | 简洁                 | 依赖顺序，可读性差         |
| 关键字传参 | 可读性好，顺序无关 | 略啰嗦                     |
| 混合传参 | 兼顾简洁与可读       | 位置必须在关键字前         |

**建议**：参数超过 3 个时，优先用关键字传参，避免调用方数错位置。

---

## 三、*args 收集任意多个位置参数

当函数需要接收**数量不确定**的位置参数时，用 \`*args\`：

\`\`\`python
def sum_all(*args):              # args 是一个元组
    return sum(args)

sum_all(1, 2, 3)                 # args = (1, 2, 3) -> 6
sum_all(1, 2, 3, 4, 5)           # args = (1, 2, 3, 4, 5) -> 15
\`\`\`

要点：

1. \`*args\` 把多余的位置参数打包成一个**元组**。
2. 参数名 \`args\` 只是约定俗成，写成 \`*nums\` 也行，但 \`*args\` 是社区惯例。
3. \`*args\` 之后不能再有普通位置参数，否则无法判断从哪开始。

\`\`\`python
def f(*args, x):     # x 必须用关键字传
    pass
f(1, 2, 3, x=10)     # args=(1,2,3), x=10
\`\`\`

---

## 四、**kwargs 收集任意多个关键字参数

\`**kwargs\` 收集所有未匹配的关键字参数，打包成**字典**：

\`\`\`python
def make_request(url, **kwargs):
    print(url, kwargs)

make_request("http://x.com", method="GET", timeout=30, retry=3)
# kwargs = {'method': 'GET', 'timeout': 30, 'retry': 3}
\`\`\`

这是构建**灵活配置接口**的利器：调用方想传什么就传什么，函数内部按需取用。

\`\`\`python
def connect(**kwargs):
    host = kwargs.get("host", "localhost")  # 取不到就给默认值
    port = kwargs.get("port", 3306)
    return f"{host}:{port}"
\`\`\`

| 特性     | *args        | **kwargs       |
| -------- | ------------ | -------------- |
| 打包类型 | 元组 tuple   | 字典 dict      |
| 收集对象 | 位置参数     | 关键字参数     |
| 解包语法 | f(*list)     | f(**dict)      |

---

## 五、默认参数陷阱：可变默认值

这是 Python 最经典的坑之一。看这段代码：

\`\`\`python
def append_to(item, lst=[]):       # 默认值是可变列表
    lst.append(item)
    return lst

print(append_to(1))                # [1]
print(append_to(2))                # [1, 2]  ← 不是 [2]！
print(append_to(3))                # [1, 2, 3]
\`\`\`

**原因**：默认值在函数**定义时**只计算一次，所有调用共享同一个列表对象。

正确写法：用 \`None\` 作哨兵，在函数内部创建：

\`\`\`python
def append_to(item, lst=None):
    if lst is None:
        lst = []                   # 每次调用都是新列表
    lst.append(item)
    return lst
\`\`\`

| 默认值类型        | 是否安全 | 说明                       |
| ----------------- | -------- | -------------------------- |
| 不可变（int/str） | 安全     | 每次重新赋值不会影响默认   |
| None（哨兵）      | 安全     | 推荐做法                   |
| list/dict/set     | 危险     | 多次调用共享同一对象       |

> 黄金法则：**默认参数永远不要用可变对象**，用 None 代替。

---

## 六、仅关键字参数（* 分隔符）

在 \`*\` 之后的参数**必须**用关键字传递，不能用位置：

\`\`\`python
def connect(host, port, *, timeout=30, retry=3):
    print(host, port, timeout, retry)

connect("localhost", 3306)                  # 正确：timeout/retry 用默认
connect("localhost", 3306, timeout=10)      # 正确：关键字传 timeout
connect("localhost", 3306, 10)              # 报错：timeout 不能位置传
\`\`\`

**用途**：把"重要参数"放前面用位置传，把"配置参数"放 \`*\` 后面强制关键字，避免调用方数错位置。标准库大量使用，如 \`sorted(iterable, *, key=None, reverse=False)\`。

---

## 七、仅位置参数（/ 分隔符）

Python 3.8 引入 \`/\`，在它**之前**的参数只能用位置传，不能用关键字：

\`\`\`python
def power(x, y, /):       # x, y 只能位置传
    return x ** y

power(2, 3)               # 正确
power(x=2, y=3)           # 报错：不能关键字传
\`\`\`

**用途**：

1. 参数名只是实现细节，不想暴露给调用方（方便以后重命名）。
2. 避免关键字冲突，比如 \`len(obj, /)\` 保证 \`obj\` 不会和某个叫 \`obj\` 的关键字打架。

把 \`/\` 和 \`*\` 组合，就能精确控制每个参数的传参方式：

\`\`\`python
def f(a, b, /, c, d, *, e, f):
    pass
# a, b：仅位置
# c, d：位置或关键字
# e, f：仅关键字
\`\`\`

---

## 八、参数解包：* 和 **

调用函数时，可以用 \`*\` 和 \`**\` 把容器解包成参数：

\`\`\`python
def f(a, b, c):
    print(a, b, c)

args = [1, 2, 3]
f(*args)              # 等价于 f(1, 2, 3)

kwargs = {"a": 1, "b": 2, "c": 3}
f(**kwargs)           # 等价于 f(a=1, b=2, c=3)
\`\`\`

这是**转发参数**的核心技巧。装饰器、代理函数、子类调用父类方法都靠它：

\`\`\`python
def log_and_call(fn, *args, **kwargs):
    print(f"调用 {fn.__name__}，参数 {args} {kwargs}")
    return fn(*args, **kwargs)     # 原样转发
\`\`\`

---

## 九、参数顺序总规则

一个函数的参数必须按以下顺序排列：

\`\`\`text
def f(仅位置 /, 普通参数, *args, 仅关键字, **kwargs):
\`\`\`

| 位置 | 写法       | 收集/约束          |
| ---- | ---------- | ------------------ |
| 1    | a, b, /    | 仅位置参数         |
| 2    | c, d       | 普通参数（位置/关键字均可）|
| 3    | *args      | 收集多余位置参数   |
| 4    | e, f       | 仅关键字参数       |
| 5    | **kwargs   | 收集多余关键字参数 |

---

## 十、本章 demo 说明

下面代码演示两个真实场景：

1. **灵活的日志函数**：用 \`*args\` + \`**kwargs\` 接收任意上下文，用仅关键字参数控制级别。
2. **配置构建器**：用可变默认值陷阱的正确写法，叠加默认配置与用户配置。

运行后会看到参数如何被收集、解包、合并，以及默认值陷阱被正确规避。

---

## 十一、易错点小结

| 易错点                       | 错误做法                     | 正确做法                       |
| ---------------------------- | ---------------------------- | ------------------------------ |
| 可变默认值                   | def f(lst=[])                | def f(lst=None) 后内部判断     |
| 位置在关键字后               | f(a=1, 2)                    | 位置参数在前                   |
| 误以为 args 是列表           | args.append(x)               | args 是元组，不可变            |
| 仅关键字参数用位置传         | connect(h, p, 10)            | connect(h, p, timeout=10)      |
| 解包类型不匹配               | f(**[1,2])                   | f(*[1,2]) 列表用 * 解包        |
| 修改 kwargs 后忘了返回       | kwargs.update(...) 不返回    | 用新字典接收结果               |
`,
    code: `# ============================================================
# 第十一章演示：函数参数技巧
# 场景 1：灵活的日志函数（*args / **kwargs / 仅关键字参数）
# 场景 2：配置构建器（默认值陷阱的正确写法 + 参数解包）
# ============================================================
import json  # 导入 json 模块，用于把字典序列化成可读字符串

print("=" * 60)  # 打印分隔线，便于区分输出段落
print("场景 1：灵活的日志函数")  # 打印当前场景标题
print("=" * 60)  # 打印分隔线

# 定义一个日志函数：message 是位置参数，level 必须用关键字传
def log(message, *args, level="INFO", **kwargs):  # 声明日志函数，level 为仅关键字参数
    formatted = message % args if args else message  # 若有 args 则用其填充 message 占位符
    context = ", ".join(f"{k}={v}" for k, v in kwargs.items())  # 把 kwargs 拼成 key=value 上下文
    line = f"[{level}] {formatted}"  # 组装日志主体（级别 + 消息）
    if context:  # 如果存在附加上下文
        line += f" | {context}"  # 把上下文追加到日志行末尾
    print(line)  # 打印这一行日志
    return line  # 返回组装好的字符串，方便测试断言

# 普通调用：只传消息
log("服务启动")  # 仅传位置参数，输出 [INFO] 服务启动

# 用 args 填充占位符（类似 C 的 printf 风格）
log("用户 %s 登录，耗时 %d ms", "alice", 120)  # 用位置参数填充 %s 和 %d

# 用 level 关键字覆盖级别
log("数据库连接失败", level="ERROR")  # 通过关键字参数指定 ERROR 级别

# 用 kwargs 附加结构化上下文
log("订单完成", level="INFO", order_id=8829, amount=99.5, user_id=1024)  # 附加订单上下文

# 同时用 args 和 kwargs
log("重试第 %d 次，状态码 %d", 3, 503, level="WARNING", service="payment")  # 同时用位置和关键字参数

print()  # 打印空行分隔不同场景
print("=" * 60)  # 打印分隔线
print("场景 2：配置构建器（规避默认值陷阱）")  # 打印场景标题
print("=" * 60)  # 打印分隔线

# 错误示范（注释掉，仅作说明）：用可变默认值会共享状态
# def build_config(base={}):   # 危险：多次调用共享同一个 dict
#     base["version"] = "1.0"
#     return base

# 正确写法：用 None 作哨兵，每次创建新字典
def build_config(**user_overrides):  # 声明配置构建器，接收任意关键字覆盖项
    defaults = {  # 定义默认配置模板
        "host": "localhost",     # 默认主机地址
        "port": 3306,            # 默认端口
        "timeout": 30,           # 默认超时（秒）
        "retry": 3,              # 默认重试次数
        "debug": False,          # 默认关闭调试
    }  # 默认配置模板定义结束
    config = dict(defaults)  # 复制一份新配置，避免共享默认字典
    config.update(user_overrides)  # 用用户传入的覆盖项更新配置
    return config  # 返回组装好的配置字典

# 调用 1：全部用默认值
c1 = build_config()  # 不传任何覆盖项
print("默认配置：", json.dumps(c1, ensure_ascii=False))  # 打印默认配置（中文不转义）

# 调用 2：覆盖部分配置（用关键字参数）
c2 = build_config(host="10.0.0.1", port=5432, debug=True)  # 覆盖主机、端口、调试开关
print("自定义配置：", json.dumps(c2, ensure_ascii=False))  # 打印自定义配置

# 调用 3：再调一次默认，确认没有被 c2 污染（验证陷阱已规避）
c3 = build_config()  # 再次不传覆盖项
print("再次默认配置：", json.dumps(c3, ensure_ascii=False))  # 打印再次默认配置
# 断言三次调用的 host 互不影响
assert c1["host"] == "localhost"  # 断言 c1 仍是默认主机
assert c2["host"] == "10.0.0.1"  # 断言 c2 是自定义主机
assert c3["host"] == "localhost"  # 断言 c3 没被 c2 污染
print("断言通过：每次调用都是独立配置，无共享污染。")  # 打印断言结果

print()  # 打印空行
print("=" * 60)  # 打印分隔线
print("场景 3：参数解包与转发")  # 打印场景标题
print("=" * 60)  # 打印分隔线

# 准备一个列表和一个字典，用解包方式调用 log
positional = ("处理了 %d 条记录，耗时 %.2f s", 1500, 2.35)  # 准备位置参数元组
options = {"level": "DEBUG", "worker": "pool-1", "queue": "jobs"}  # 准备关键字参数字典

# 用 * 解包列表为位置参数，用 ** 解包字典为关键字参数
log(*positional, **options)  # 解包元组和字典后调用 log

# 演示仅关键字参数：把 retry 和 timeout 强制用关键字传
def fetch(url, /, method, *, timeout=10, retry=1):  # url 仅位置，timeout/retry 仅关键字
    print(f"  fetch url={url} method={method} timeout={timeout} retry={retry}")  # 打印调用参数
    return {"url": url, "method": method}  # 返回一个模拟结果

# 正确调用：url 用位置，method 用位置，timeout/retry 用关键字
fetch("https://api.example.com", "GET", timeout=5, retry=2)  # 按约束正确调用 fetch

# 演示参数转发：写一个通用包装器
def with_timer(fn, *args, **kwargs):  # 声明通用包装器，透传所有参数
    print(f"  调用 {fn.__name__}，参数 args={args} kwargs={kwargs}")  # 打印调用信息
    result = fn(*args, **kwargs)  # 透传参数并执行被包装函数
    return result  # 返回执行结果

# 用转发方式调用 build_config
cfg = with_timer(build_config, host="db.prod", port=3306, pool_size=20)  # 通过包装器调用 build_config
print("  转发得到的配置：", json.dumps(cfg, ensure_ascii=False))  # 打印转发得到的配置

print()  # 打印空行
print("全部演示完成。")  # 打印结束语
`,
  },

  // =========================================================
  // 第十二章：匿名函数与高阶函数
  // =========================================================
  {
    id: "pykit-12",
    group: "函数与装饰器",
    icon: "🔄",
    title: "匿名函数与高阶函数",
    content: `# 匿名函数与高阶函数

## 一、引言：函数是一等公民

在 Python 中，**函数是一等对象（first-class object）**：可以赋值给变量、作为参数传递、作为返回值返回、存进数据结构。这个特性催生了两个强大工具：

- **匿名函数（lambda）**：随手定义的小函数，无需起名。
- **高阶函数（higher-order function）**：接收函数作为参数，或返回函数的函数。

二者结合，能用极简的代码表达复杂的数据处理逻辑，是函数式编程的核心武器。

---

## 二、lambda 表达式

\`lambda\` 用来创建**单行小函数**，语法：

\`\`\`python
lambda 参数1, 参数2: 表达式
\`\`\`

等价于：

\`\`\`python
def __unnamed(参数1, 参数2):
    return 表达式
\`\`\`

示例：

\`\`\`python
add = lambda a, b: a + b        # 赋值给变量
print(add(2, 3))                # 5

# 通常不赋值，而是直接用在需要函数的地方
nums = [3, 1, 4, 1, 5, 9, 2, 6]
print(sorted(nums, key=lambda x: -x))   # 降序排序
\`\`\`

| 特性       | lambda                  | def                  |
| ---------- | ----------------------- | -------------------- |
| 行数       | 单行                    | 多行                 |
| 语句       | 只能是表达式            | 可含任意语句         |
| 函数名     | 无（匿名）              | 有                   |
| 可读性     | 简单逻辑好，复杂则差    | 始终清晰             |
| 调试       | traceback 显示 <lambda> | 显示函数名           |

**建议**：lambda 适合"一行能写完且逻辑简单"的场景。一旦需要循环、赋值、多行，就用 def。

---

## 三、map：对每个元素做映射

\`map(fn, iterable)\` 把 \`fn\` 依次应用到每个元素，返回一个迭代器：

\`\`\`python
nums = [1, 2, 3, 4]
squared = list(map(lambda x: x ** 2, nums))   # [1, 4, 9, 16]
\`\`\`

等价的列表推导式：

\`\`\`python
squared = [x ** 2 for x in nums]              # 更 Pythonic
\`\`\`

| 写法       | 优点                       | 适用场景             |
| ---------- | -------------------------- | -------------------- |
| map+lambda | 函数式风格                 | 已有现成函数时       |
| 列表推导式 | 可读性好，Python 社区推荐  | 大多数场景           |

**经验**：如果 \`fn\` 是现成的（如 \`str\`、\`int\`），用 \`map\` 很简洁：\`list(map(str, [1,2,3]))\`；否则优先列表推导式。

---

## 四、filter：过滤元素

\`filter(fn, iterable)\` 保留让 \`fn\` 返回真值的元素：

\`\`\`python
nums = [1, 2, 3, 4, 5, 6]
evens = list(filter(lambda x: x % 2 == 0, nums))   # [2, 4, 6]
\`\`\`

同样，列表推导式版本：

\`\`\`python
evens = [x for x in nums if x % 2 == 0]
\`\`\`

\`filter\` 传 \`None\` 时，会过滤掉所有"假值"（0、空串、None 等）：

\`\`\`python
list(filter(None, [0, 1, "", "a", None, 2]))   # [1, 'a', 2]
\`\`\`

---

## 五、reduce：累积归约

\`reduce\` 在 \`functools\` 模块，它把一个二元函数反复作用到序列上，最终"归约"成一个值：

\`\`\`python
from functools import reduce

nums = [1, 2, 3, 4]
product = reduce(lambda a, b: a * b, nums)   # 1*2*3*4 = 24
\`\`\`

执行过程：

\`\`\`text
步骤1: a=1, b=2 -> 2
步骤2: a=2, b=3 -> 6
步骤3: a=6, b=4 -> 24
\`\`\`

\`reduce\` 适合"把列表压缩成一个值"的场景：连乘、求最大、合并字典。但**可读性较差**，能用 \`sum\`、\`max\`、\`math.prod\` 替代时就别用 reduce。

---

## 六、sorted 的 key 参数

\`sorted\` 的 \`key\` 参数是高阶函数最常用的地方。它接收一个函数，\`sorted\` 用该函数的返回值作为比较依据：

\`\`\`python
students = [
    {"name": "Alice", "score": 88},
    {"name": "Bob", "score": 95},
    {"name": "Carol", "score": 72},
]

# 按分数升序
by_score = sorted(students, key=lambda s: s["score"])

# 按分数降序
by_score_desc = sorted(students, key=lambda s: s["score"], reverse=True)

# 按名字长度
by_name_len = sorted(students, key=lambda s: len(s["name"]))
\`\`\`

**多条件排序**：key 返回元组，依次比较：

\`\`\`python
# 先按分数降序，分数相同按名字升序
sorted(students, key=lambda s: (-s["score"], s["name"]))
\`\`\`

| 需求             | key 写法                       |
| ---------------- | ------------------------------ |
| 按字段升序       | key=lambda x: x["field"]       |
| 按字段降序       | key=lambda x: x["field"], reverse=True |
| 多条件           | key=lambda x: (cond1, cond2)   |
| 字符串忽略大小写 | key=str.lower                  |
| 自定义对象       | key=attrgetter("attr")         |

---

## 七、函数作为参数传递（回调模式）

函数当参数传，就是**回调（callback）**。这是事件处理、策略模式的基础：

\`\`\`python
def process(data, handler):
    return [handler(item) for item in data]

process([1, 2, 3], lambda x: x * 10)     # [10, 20, 30]
process([1, 2, 3], str)                   # ['1', '2', '3']
\`\`\`

真实场景：排序时传不同 key、定时器传任务函数、Web 框架把路由函数注册到框架。

---

## 八、partial 偏函数

\`functools.partial\` 把一个函数的**部分参数固定**，生成新函数：

\`\`\`python
from functools import partial

def power(base, exponent):
    return base ** exponent

square = partial(power, exponent=2)   # 固定 exponent=2
cube = partial(power, exponent=3)     # 固定 exponent=3

print(square(5))   # 25
print(cube(5))     # 125
\`\`\`

**用途**：

1. 简化频繁调用：\`log_info = partial(log, level="INFO")\`，之后 \`log_info("msg")\` 即可。
2. 适配接口：把需要多个参数的函数，包装成只接收一个参数，配合 map 使用。

\`\`\`python
from functools import partial
int2 = partial(int, base=2)           # 二进制转换器
print(int2("1010"))                   # 10
\`\`\`

---

## 九、本章 demo 说明

下面代码演示两个真实场景：

1. **数据处理管道**：用 map/filter/sorted 组合，清洗并排序一批订单数据。
2. **回调模式**：用 partial 预设策略，对同一份数据应用不同处理函数。

运行后可以看到高阶函数如何让数据流转清晰、可组合。

---

## 十、易错点小结

| 易错点                       | 错误做法                     | 正确做法                       |
| ---------------------------- | ---------------------------- | ------------------------------ |
| lambda 写多行                | lambda 里塞 for/赋值         | 改用 def                       |
| 忘记 list() 包裹 map/filter  | 直接打印 map 对象            | list(map(...)) 才能看到结果    |
| reduce 滥用                  | 用 reduce 求和               | 直接用 sum()                   |
| sorted 误用 cmp              | key 返回 True/False          | key 返回比较依据值             |
| partial 固定顺序错           | partial(f, 10) 固定错参数    | 用关键字 partial(f, x=10)      |
| 闭包捕获循环变量             | lambda 引用循环变量          | 用默认参数 lambda x=i: x       |
`,
    code: `# ============================================================
# 第十二章演示：匿名函数与高阶函数
# 场景 1：数据处理管道（map / filter / sorted）
# 场景 2：回调模式与偏函数（partial）
# ============================================================
from functools import reduce, partial  # 导入 reduce 累积函数和 partial 偏函数

print("=" * 60)  # 打印分隔线
print("场景 1：数据处理管道")  # 打印场景标题
print("=" * 60)  # 打印分隔线

# 模拟一批原始订单数据（含脏数据）
orders = [  # 定义原始订单列表
    {"id": "A001", "amount": 99.5, "status": "paid"},  # 正常已支付订单
    {"id": "A002", "amount": 0, "status": "cancelled"},     # 无效订单（金额为 0）
    {"id": "A003", "amount": 250.0, "status": "paid"},  # 正常已支付订单
    {"id": "A004", "amount": 12.9, "status": "refunded"},  # 已退款订单
    {"id": "A005", "amount": 88.0, "status": "paid"},  # 正常已支付订单
    {"id": "A006", "amount": 1500.0, "status": "paid"},  # 大额已支付订单
    {"id": "A007", "amount": -5, "status": "paid"},          # 异常负数订单
]  # 订单列表定义结束

# 第 1 步：过滤掉无效订单（金额<=0 或状态非 paid）
valid = list(filter(lambda o: o["amount"] > 0 and o["status"] == "paid", orders))  # 用 filter 保留有效订单
# 打印过滤结果
print("有效订单：", [o["id"] for o in valid])  # 用列表推导式提取有效订单 id

# 第 2 步：映射成统一的输出格式（id + 含税金额）
def to_receipt(order, tax_rate=0.06):  # 声明收据生成函数，默认税率 6%
    # 计算含税金额
    total = round(order["amount"] * (1 + tax_rate), 2)  # 计算含税金额并保留两位小数
    # 返回标准收据结构
    return {"id": order["id"], "total": total}  # 返回 id 和含税总额的字典
# 用 map 对每个有效订单生成收据
receipts = list(map(to_receipt, valid))  # 对每个有效订单调用 to_receipt
print("收据列表：", receipts)  # 打印所有收据

# 第 3 步：按含税金额降序排序
ranked = sorted(receipts, key=lambda r: r["total"], reverse=True)  # 按 total 降序排序
print("按金额降序：", [r["id"] for r in ranked])  # 打印降序后的订单 id

# 第 4 步：用 reduce 累加总金额
total_revenue = reduce(lambda acc, r: acc + r["total"], ranked, 0.0)  # 从 0.0 开始累加每笔含税金额
print("总营收（含税）：", total_revenue)  # 打印总营收

# 第 5 步：用列表推导式实现同样的过滤（对比写法）
valid_lc = [o["id"] for o in orders if o["amount"] > 0 and o["status"] == "paid"]  # 列表推导式版本
print("列表推导式结果：", valid_lc)  # 打印列表推导式结果

print()  # 打印空行
print("=" * 60)  # 打印分隔线
print("场景 2：回调模式与偏函数")  # 打印场景标题
print("=" * 60)  # 打印分隔线

# 定义一个通用处理函数：对每个元素应用 transform
def transform_all(items, transform):  # 声明通用处理函数，接收数据和处理函数
    # 用列表推导式对每个元素调用 transform
    return [transform(x) for x in items]  # 对每个元素应用 transform 并收集结果

# 准备原始数据
nums = [1, 2, 3, 4, 5]  # 定义原始数字列表

# 策略 1：用 lambda 翻倍
doubled = transform_all(nums, lambda x: x * 2)  # 传入翻倍的 lambda 作为回调
print("翻倍：", doubled)  # 打印翻倍结果

# 策略 2：用 lambda 求平方
squared = transform_all(nums, lambda x: x ** 2)  # 传入求平方的 lambda 作为回调
print("平方：", squared)  # 打印平方结果

# 用 partial 预设一个带税率的收据生成器
receipt_with_tax = partial(to_receipt, tax_rate=0.13)  # 固定税率为 13% 生成偏函数
# 对几个订单生成收据
sample_orders = [  # 定义示例订单列表
    {"id": "B001", "amount": 100.0, "status": "paid"},  # 示例订单 1
    {"id": "B002", "amount": 200.0, "status": "paid"},  # 示例订单 2
]  # 示例订单列表结束
taxed = list(map(receipt_with_tax, sample_orders))  # 用偏函数对示例订单生成收据
print("13% 税率收据：", taxed)  # 打印含 13% 税的收据

# 用 partial 构造一个"打印日志"的便捷函数
def log(message, level, module):  # 声明日志函数，需传消息、级别、模块
    # 组装日志行
    print(f"[{level}] [{module}] {message}")  # 打印格式化日志
# 固定 level 和 module，得到只接收 message 的函数
info_pay = partial(log, level="INFO", module="payment")  # 预设级别和模块得到便捷函数
# 调用时只需传消息
info_pay("开始处理支付")  # 只传消息即可
info_pay("支付完成")  # 只传消息即可

# 演示闭包捕获循环变量的陷阱与正确写法
funcs_bad = [lambda: i for i in range(3)]      # 错误：所有 lambda 都引用同一个 i
funcs_good = [lambda i=i: i for i in range(3)] # 正确：用默认参数固定每次的 i
print("闭包陷阱（错误）：", [f() for f in funcs_bad])   # 全是 2，因为 i 最终是 2
print("闭包修正（正确）：", [f() for f in funcs_good])  # 0,1,2，因为每次都固定了 i

# 演示 sorted 多条件排序
people = [  # 定义人员列表
    {"name": "Alice", "age": 30, "dept": "eng"},  # 工程部 30 岁
    {"name": "Bob", "age": 25, "dept": "eng"},  # 工程部 25 岁
    {"name": "Carol", "age": 30, "dept": "sales"},  # 销售部 30 岁
    {"name": "Dave", "age": 25, "dept": "sales"},  # 销售部 25 岁
]  # 人员列表结束
# 先按部门升序，部门相同按年龄升序
ordered = sorted(people, key=lambda p: (p["dept"], p["age"]))  # key 返回元组实现多条件排序
print("多条件排序：", [(p["dept"], p["age"], p["name"]) for p in ordered])  # 打印排序结果

print()  # 打印空行
print("全部演示完成。")  # 打印结束语
`,
  },

  // =========================================================
  // 第十三章：装饰器入门与实战
  // =========================================================
  {
    id: "pykit-13",
    group: "函数与装饰器",
    icon: "✨",
    title: "装饰器入门与实战",
    content: `# 装饰器入门与实战

## 一、引言：装饰器是什么

**装饰器（decorator）是一种"在不修改原函数的前提下，给函数增加功能"的机制。** 它本质是一个高阶函数：接收一个函数，返回一个新函数。

典型用途：日志、计时、缓存、权限校验、重试、事务——这些"横切关注点"如果写进每个函数，代码会重复且混乱；用装饰器抽离出来，业务函数保持干净。

\`\`\`text
调用方
   │  调用 my_func()
   ▼
[装饰器返回的包装函数]  ← 在这里加料（日志/计时/校验）
   │
   ▼
[原函数 my_func]        ← 真正的业务逻辑
\`\`\`

---

## 二、装饰器的本质：函数包装函数

先忘掉 \`@\` 语法，手写一个装饰器：

\`\`\`python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        print("函数执行前")
        result = func(*args, **kwargs)
        print("函数执行后")
        return result
    return wrapper

def say_hello(name):
    print(f"Hello, {name}")

# 手动"装饰"
say_hello = my_decorator(say_hello)
say_hello("Alice")
# 输出：
# 函数执行前
# Hello, Alice
# 函数执行后
\`\`\`

关键点：

1. \`wrapper\` 用 \`*args, **kwargs\` 接收任意参数，原样转发给 \`func\`。
2. \`wrapper\` 要 \`return func(...)\`，不能吞掉返回值。
3. 装饰器返回的是 \`wrapper\`，不是调用它。

---

## 三、@ 语法糖

\`@decorator\` 只是上面"手动装饰"的语法糖：

\`\`\`python
@my_decorator
def say_hello(name):
    print(f"Hello, {name}")

# 等价于：
# def say_hello(name): ...
# say_hello = my_decorator(say_hello)
\`\`\`

可以叠加多个装饰器，**从下往上**应用，**从上往下**执行：

\`\`\`python
@dec_a
@dec_b
def f(): pass
# 等价于 f = dec_a(dec_b(f))
# 执行时：dec_a 的 wrapper 先进入，再调 dec_b 的 wrapper，最后调 f
\`\`\`

---

## 四、functools.wraps 保留元信息

装饰器会把原函数替换成 \`wrapper\`，导致 \`__name__\`、\`__doc__\` 都变成 wrapper 的。这会让文档生成、调试、反射出问题：

\`\`\`python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@my_decorator
def f():
    """这是 f 的文档"""
    pass

print(f.__name__)   # wrapper  ← 不是 f！
print(f.__doc__)    # None     ← 文档丢了
\`\`\`

解决办法：用 \`functools.wraps\` 把原函数的元信息拷给 wrapper：

\`\`\`python
from functools import wraps

def my_decorator(func):
    @wraps(func)                # 关键这一行
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
\`\`\`

> **铁律**：写装饰器一定要加 \`@wraps(func)\`，没有例外。

---

## 五、带参数的装饰器

如果装饰器本身需要参数（比如指定重试次数、日志级别），就再加一层嵌套：

\`\`\`python
from functools import wraps
def repeat(times):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(times=3)
def greet(name):
    print(f"Hi, {name}")

greet("Alice")   # 打印 3 次
\`\`\`

结构：\`repeat(times)\` 返回 \`decorator\`，\`decorator(func)\` 返回 \`wrapper\`。三层嵌套是"带参装饰器"的固定模式。

---

## 六、常用装饰器一：计时器

\`\`\`python
import time
from functools import wraps

def timed(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} 耗时 {elapsed:.4f}s")
        return result
    return wrapper
\`\`\`

---

## 七、常用装饰器二：缓存

\`functools.lru_cache\` 是标准库自带的装饰器，自动缓存函数结果，对递归、纯函数效果显著：

\`\`\`python
from functools import lru_cache

@lru_cache(maxsize=128)
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(100))   # 瞬间出结果，无缓存会慢到不可用
\`\`\`

| 缓存方式        | 适用                 | 注意                       |
| --------------- | -------------------- | -------------------------- |
| lru_cache       | 纯函数、参数可哈希   | 参数不可哈希（list）会报错 |
| 手写 dict 缓存  | 需要自定义 key       | 要处理失效                 |

---

## 八、类装饰器

类也能做装饰器，用 \`__init__\` 接收被装饰函数，用 \`__call__\` 实现"调用"：

\`\`\`python
from functools import wraps
class CallCounter:
    def __init__(self, func):
        self.func = func
        self.count = 0
        wraps(func)(self)          # 保留元信息

    def __call__(self, *args, **kwargs):
        self.count += 1
        return self.func(*args, **kwargs)

@CallCounter
def hello():
    print("hi")

hello(); hello()
print(hello.count)   # 2
\`\`\`

类装饰器适合需要**维护状态**的场景（调用计数、限流、熔断）。

---

## 九、本章 demo 说明

下面代码演示三个实战装饰器：

1. **性能计时器**：测量函数耗时，支持多函数对比。
2. **自动重试**：失败自动重试 N 次，可指定异常类型。
3. **权限检查**：根据当前用户角色决定是否放行。

运行后会看到装饰器如何让业务函数保持纯粹，横切逻辑被干净抽离。

---

## 十、易错点小结

| 易错点                       | 错误做法                     | 正确做法                       |
| ---------------------------- | ---------------------------- | ------------------------------ |
| 忘记 @wraps                  | wrapper 不拷元信息           | @wraps(func)                   |
| 吞掉返回值                   | wrapper 里不 return          | return func(*args, **kwargs)   |
| 带参装饰器少一层             | 直接 def decorator(func)     | 三层嵌套                       |
| 装饰器顺序搞反               | 以为从上往下应用             | 从下往上应用                   |
| 类装饰器忘 __call__          | 只写 __init__                | 必须实现 __call__              |
| lru_cache 用在含副作用函数   | 缓存了带随机/时间的函数      | 只缓存纯函数                   |
`,
    code: `# ============================================================
# 第十三章演示：装饰器入门与实战
# 场景 1：性能计时器
# 场景 2：自动重试
# 场景 3：权限检查
# ============================================================
import time  # 导入 time 模块，用于高精度计时和延时
from functools import wraps  # 导入 wraps，用于保留被装饰函数的元信息

print("=" * 60)  # 打印分隔线
print("场景 1：性能计时器")  # 打印场景标题
print("=" * 60)  # 打印分隔线

# 定义一个带参数的计时装饰器（可选择是否打印）
def timed(verbose=True):  # 声明带参装饰器，verbose 控制是否打印
    # 第二层：接收被装饰函数
    def decorator(func):  # 这一层接收被装饰的函数
        # 用 wraps 保留原函数元信息
        @wraps(func)  # 保留原函数的 __name__、__doc__ 等元信息
        def wrapper(*args, **kwargs):  # 定义包装函数，透传所有参数
            # 记录开始时间（高精度）
            start = time.perf_counter()  # 记录开始时间戳
            # 调用真正的函数
            result = func(*args, **kwargs)  # 执行被装饰函数并拿到结果
            # 记录结束时间
            elapsed = time.perf_counter() - start  # 计算耗时
            # 根据 verbose 决定是否打印
            if verbose:  # 如果需要打印
                print(f"  [{func.__name__}] 耗时 {elapsed:.6f}s")  # 打印函数名和耗时
            # 返回函数结果和耗时（演示用）
            return result, elapsed  # 返回结果和耗时组成的元组
        # 返回包装函数
        return wrapper  # 返回包装后的函数
    # 返回真正的装饰器
    return decorator  # 返回 decorator 本身

# 用计时装饰器装饰一个累加函数
@timed(verbose=True)  # 应用计时装饰器
def slow_sum(n):  # 声明累加函数
    # 初始化总和
    total = 0  # 总和初始化为 0
    # 循环累加
    for i in range(n):  # 遍历 0 到 n-1
        total += i  # 累加到总和
    # 返回总和
    return total  # 返回累加结果

# 调用被装饰的函数
result, cost = slow_sum(1000000)  # 调用被装饰函数，解包结果和耗时
print(f"  结果 = {result}")  # 打印累加结果

# 对比两种实现的速度
@timed(verbose=True)  # 应用计时装饰器
def sum_with_comprehension(n):  # 声明内置求和函数
    # 用 sum + range 直接求和（C 层实现，更快）
    return sum(range(n))  # 用内置 sum 求和

# 运行对比
_, cost1 = slow_sum(500000)  # 运行循环版，忽略结果只取耗时
_, cost2 = sum_with_comprehension(500000)  # 运行内置版，忽略结果只取耗时
print(f"  循环版/内置版 耗时比 = {cost1/cost2:.1f}x")  # 打印两种实现的耗时比

print()  # 打印空行
print("=" * 60)  # 打印分隔线
print("场景 2：自动重试")  # 打印场景标题
print("=" * 60)  # 打印分隔线

# 定义一个带参装饰器：失败自动重试
def retry(times=3, delay=0.1, exceptions=(Exception,)):  # 声明重试装饰器，可配次数/延时/异常类型
    # 第二层：接收被装饰函数
    def decorator(func):  # 这一层接收被装饰的函数
        # 用 wraps 保留元信息
        @wraps(func)  # 保留原函数元信息
        def wrapper(*args, **kwargs):  # 定义包装函数
            # 记录最后一次异常
            last_exc = None  # 初始化最后一次异常为 None
            # 尝试 times 次
            for attempt in range(1, times + 1):  # 从 1 到 times 逐次尝试
                try:  # 尝试执行
                    # 尝试调用函数
                    return func(*args, **kwargs)  # 成功则直接返回结果
                except exceptions as e:  # 捕获指定类型的异常
                    # 记录异常
                    last_exc = e  # 保存本次异常
                    # 打印重试信息
                    print(f"  [{func.__name__}] 第 {attempt} 次失败: {e}")  # 打印失败信息
                    # 如果不是最后一次，就等待后重试
                    if attempt < times:  # 如果还没到最后一次
                        time.sleep(delay)  # 等待一段时间后重试
            # 全部失败则抛出最后一次的异常
            raise last_exc  # 重试耗尽，抛出最后的异常
        # 返回包装函数
        return wrapper  # 返回包装后的函数
    # 返回装饰器
    return decorator  # 返回 decorator 本身

# 模拟一个不稳定的服务调用
import random  # 导入 random 模块用于模拟随机失败
random.seed(42)  # 固定随机种子便于复现结果

@retry(times=4, delay=0.05, exceptions=(ValueError,))  # 应用重试装饰器，最多 4 次
def fetch_data():  # 声明模拟数据获取函数
    # 模拟 70% 概率失败
    if random.random() < 0.7:  # 70% 概率进入失败分支
        # 抛出模拟异常
        raise ValueError("服务暂不可用")  # 抛出 ValueError 模拟服务异常
    # 成功则返回数据
    return {"data": [1, 2, 3]}  # 30% 概率返回成功数据

# 调用，观察自动重试过程
try:  # 尝试调用
    data = fetch_data()  # 调用被装饰的函数
    print(f"  最终成功拿到数据：{data}")  # 打印成功结果
except ValueError as e:  # 捕获重试耗尽后的异常
    print(f"  重试耗尽仍失败：{e}")  # 打印最终失败信息

print()  # 打印空行
print("=" * 60)  # 打印分隔线
print("场景 3：权限检查")  # 打印场景标题
print("=" * 60)  # 打印分隔线

# 用一个全局变量模拟当前用户（真实场景从 session/token 取）
current_user = {"name": "alice", "role": "guest"}  # 定义当前用户，初始角色为 guest

# 定义权限检查装饰器
def require_role(*allowed_roles):  # 声明权限装饰器，接收允许的角色列表
    # 第二层
    def decorator(func):  # 接收被装饰函数
        # wraps 保留元信息
        @wraps(func)  # 保留原函数元信息
        def wrapper(*args, **kwargs):  # 定义包装函数
            # 取出当前用户角色
            role = current_user.get("role", "guest")  # 取出当前用户角色
            # 检查角色是否在允许列表
            if role not in allowed_roles:  # 如果角色不在允许列表中
                # 权限不足则抛异常
                raise PermissionError(f"{current_user['name']}({role}) 无权访问 {func.__name__}")  # 抛出权限错误
            # 权限通过则调用原函数
            return func(*args, **kwargs)  # 权限通过，调用原函数
        # 返回包装函数
        return wrapper  # 返回包装后的函数
    # 返回装饰器
    return decorator  # 返回 decorator 本身

# 定义一个只有 admin 能调用的函数
@require_role("admin")  # 应用权限装饰器，只允许 admin
def delete_user(user_id):  # 声明删除用户函数
    # 模拟删除用户
    print(f"  已删除用户 {user_id}")  # 打印删除动作
    return True  # 返回成功标志

# guest 尝试调用，会被拦截
try:  # 尝试以 guest 身份调用
    delete_user(1024)  # 调用删除函数
except PermissionError as e:  # 捕获权限错误
    print(f"  权限拦截：{e}")  # 打印拦截信息

# 切换为 admin 后再调用
current_user["role"] = "admin"  # 把当前用户角色改为 admin
delete_user(1024)  # 再次调用，这次权限通过

# 验证 wraps 保留了元信息
print(f"  delete_user.__name__ = {delete_user.__name__}")  # 应为 delete_user 而非 wrapper
print(f"  slow_sum.__name__ = {slow_sum.__name__}")  # 验证 slow_sum 的元信息也被保留

print()  # 打印空行
print("全部演示完成。")  # 打印结束语
`,
  },

  // =========================================================
  // 第十四章：上下文管理器
  // =========================================================
  {
    id: "pykit-14",
    group: "函数与装饰器",
    icon: "⏱️",
    title: "上下文管理器",
    content: `# 上下文管理器

## 一、引言：资源管理的痛点

凡是"用完必须释放"的资源——文件、数据库连接、锁、网络套接字、临时目录——都面临同一个问题：**如何保证无论中间是否出错，资源都能被正确清理？**

传统写法靠 \`try/finally\`：

\`\`\`python
f = open("data.txt")
try:
    data = f.read()
finally:
    f.close()        # 无论是否异常都关闭
\`\`\`

这写法啰嗦还容易漏。Python 的 \`with\` 语句把这套"进入-使用-退出"的套路封装成**上下文管理器（context manager）**，让资源管理既安全又简洁。

\`\`\`python
with open("data.txt") as f:
    data = f.read()
# 离开 with 块自动 close，即使 read 抛异常也不影响
\`\`\`

---

## 二、with 语句的执行原理

\`with\` 语句背后调用的是对象的两个特殊方法：

\`\`\`text
with obj as x:
    语句块
        │
        ├─ 1. 调用 obj.__enter__()，返回值绑定给 x
        ├─ 2. 执行语句块
        └─ 3. 无论是否异常，调用 obj.__exit__(exc_type, exc_val, exc_tb)
             └─ 如果 __exit__ 返回 True，异常被"吞掉"；返回 False/None，异常继续传播
\`\`\`

\`__exit__\` 的三个参数：

| 参数       | 含义                       | 无异常时     |
| ---------- | -------------------------- | ------------ |
| exc_type   | 异常类型                   | None         |
| exc_val    | 异常实例                   | None         |
| exc_tb     | traceback 对象             | None         |

在 \`__exit__\` 里判断 \`exc_type is None\` 就知道有没有出错，从而决定是"正常清理"还是"异常清理"。

---

## 三、__enter__ / __exit__ 协议

实现这两个方法，任何类都能用在 \`with\` 里：

\`\`\`python
class MyResource:
    def __init__(self, name):
        self.name = name

    def __enter__(self):
        print(f"获取资源 {self.name}")
        return self            # 通常返回自己，绑定给 as 后的变量

    def __exit__(self, exc_type, exc_val, exc_tb):
        print(f"释放资源 {self.name}")
        return False           # 不吞异常，让它继续传

with MyResource("db_conn") as r:
    print(f"使用 {r.name}")
# 输出：获取 -> 使用 -> 释放
\`\`\`

要点：

1. \`__enter__\` 返回的对象会被 \`as\` 绑定。返回 \`self\` 最常见，但也可以返回别的。
2. \`__exit__\` 一定要做清理，且**默认返回 False**（不吞异常），除非有特殊需求。
3. \`__exit__\` 即使语句块抛异常也会被调用，这是它取代 finally 的关键。

---

## 四、contextlib.contextmanager 装饰器

写两个魔术方法略显啰嗦。\`contextlib.contextmanager\` 让你用一个生成器函数就能实现上下文管理器：

\`\`\`python
from contextlib import contextmanager

@contextmanager
def my_resource(name):
    print(f"获取资源 {name}")
    try:
        yield name            # yield 之前 = __enter__，yield 的值 = as 绑定的值
        # yield 之后 = __exit__（正常路径）
    finally:
        print(f"释放资源 {name}")   # 异常路径也会走到这里

with my_resource("db") as r:
    print(f"使用 {r}")
\`\`\`

执行模型：

\`\`\`text
调用 my_resource(name)
   │
   ▼
执行到 yield（= __enter__ 返回 yield 的值）
   │
   ▼
执行 with 块的语句
   │  ── 如果语句抛异常，异常会在 yield 处重新抛出
   ▼
执行 yield 之后的代码（= __exit__）
\`\`\`

**注意**：\`yield\` 后面最好用 \`try/finally\` 包裹，确保异常情况下也能清理。如果 with 块抛了异常，会在 \`yield\` 处重新抛出，没有 try/finally 就会跳过清理代码。

---

## 五、自定义上下文管理器实战

一个典型的"打开-使用-关闭"资源，比如数据库连接：

\`\`\`python
class DBConnection:
    def __init__(self, dsn):
        self.dsn = dsn
        self.conn = None

    def __enter__(self):
        self.conn = self._connect(self.dsn)   # 真实场景用驱动连接
        return self.conn

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.conn is not None:
            if exc_type is not None:
                self.conn.rollback()          # 出错就回滚
            else:
                self.conn.commit()            # 正常就提交
            self.conn.close()                 # 总是关闭
        return False
\`\`\`

这样业务代码只需：

\`\`\`python
with DBConnection(dsn) as conn:
    conn.execute("INSERT ...")     # 出错自动回滚，成功自动提交
\`\`\`

事务边界、连接释放全部由上下文管理器接管，业务函数完全不操心。

---

## 六、ExitStack 管理多个资源

当需要同时管理多个资源，且数量动态时，用 \`contextlib.ExitStack\`：

\`\`\`python
from contextlib import ExitStack

files = []
with ExitStack() as stack:
    for path in ["a.txt", "b.txt", "c.txt"]:
        f = stack.enter_context(open(path))   # 注册进栈
        files.append(f)
    # 离开 with 时，按"后进先出"自动关闭所有文件
\`\`\`

\`ExitStack\` 还能注册任意清理回调：

\`\`\`python
from contextlib import ExitStack
with ExitStack() as stack:
    stack.callback(print, "清理动作 1")
    stack.callback(print, "清理动作 2")
    # 离开时按 LIFO 顺序调用：先打印"清理动作 2"再"清理动作 1"
\`\`\`

| 场景                 | 选择                       |
| -------------------- | -------------------------- |
| 固定单个资源         | with obj as x              |
| 固定多个资源         | with a() as x, b() as y    |
| 动态数量资源         | ExitStack + enter_context  |
| 需要注册任意清理     | ExitStack + callback       |

---

## 七、本章 demo 说明

下面代码演示两个真实场景：

1. **数据库连接管理**：用类实现事务的自动提交/回滚/关闭。
2. **临时文件处理**：用 contextmanager 创建临时目录，用完自动删除。

运行后会看到无论是否抛异常，资源都被正确释放。

---

## 八、易错点小结

| 易错点                       | 错误做法                     | 正确做法                       |
| ---------------------------- | ---------------------------- | ------------------------------ |
| __exit__ 吞掉异常            | return True                  | 默认 return False              |
| contextmanager 不用 try      | yield 后无 finally           | yield 放 try，清理放 finally   |
| 忘记返回 self                | __enter__ 不 return          | return self                    |
| 多资源嵌套过深               | with with with 套娃          | 用 ExitStack                   |
| 把 with 对象用在 with 外     | f = open(); with f: ...      | 直接 with open() as f          |
| 在 __exit__ 里漏关资源       | 只处理异常不 close           | 无论异常与否都清理             |
`,
    code: `# ============================================================
# 第十四章演示：上下文管理器
# 场景 1：数据库连接管理（类实现，自动提交/回滚）
# 场景 2：临时文件处理（contextmanager + ExitStack）
# ============================================================
import os  # 导入 os 模块，用于路径拼接和文件存在检查
import shutil  # 导入 shutil 模块，用于递归删除目录
import tempfile  # 导入 tempfile 模块，用于创建临时文件和目录
from contextlib import contextmanager, ExitStack  # 导入上下文管理工具

print("=" * 60)  # 打印分隔线
print("场景 1：数据库连接管理")  # 打印场景标题
print("=" * 60)  # 打印分隔线

# 用一个假数据库连接类演示事务管理（不依赖真实数据库）
class FakeDBConnection:  # 定义假数据库连接类
    # 初始化，接收连接配置
    def __init__(self, dsn):  # 构造方法，接收数据源名称
        # 保存连接字符串
        self.dsn = dsn  # 保存数据源名称
        # 连接对象占位
        self.conn = None  # 连接对象初始化为 None
        # 执行过的 SQL 列表（用于演示）
        self.statements = []  # 初始化已执行 SQL 列表

    # 真实场景会调用驱动建立连接，这里用打印模拟
    def _connect(self):  # 定义内部连接方法
        # 打印连接动作
        print(f"  [连接] 已连接到 {self.dsn}")  # 打印连接成功信息
        # 返回自身模拟连接对象
        return self  # 返回自身作为连接对象

    # 模拟执行 SQL
    def execute(self, sql):  # 定义执行 SQL 方法
        # 记录 SQL
        self.statements.append(sql)  # 把 SQL 加入已执行列表
        # 打印执行动作
        print(f"  [执行] {sql}")  # 打印执行的 SQL

    # 模拟提交
    def commit(self):  # 定义提交方法
        print(f"  [提交] 共 {len(self.statements)} 条语句生效")  # 打印提交的语句数

    # 模拟回滚
    def rollback(self):  # 定义回滚方法
        print(f"  [回滚] 撤销 {len(self.statements)} 条语句")  # 打印回滚的语句数
        # 清空已执行记录
        self.statements.clear()  # 清空已执行 SQL 列表

    # 模拟关闭
    def close(self):  # 定义关闭方法
        print(f"  [关闭] 连接已释放")  # 打印关闭信息

    # 进入上下文：建立连接并返回自身
    def __enter__(self):  # 定义进入上下文方法
        # 建立连接
        self.conn = self._connect()  # 调用内部方法建立连接
        # 返回连接对象供 as 绑定
        return self.conn  # 返回连接对象给 with ... as 变量

    # 离开上下文：根据是否异常决定提交或回滚，最后关闭
    def __exit__(self, exc_type, exc_val, exc_tb):  # 定义退出上下文方法，接收异常信息
        # 如果连接存在
        if self.conn is not None:  # 如果连接对象存在
            # 判断是否发生异常
            if exc_type is not None:  # 如果发生了异常
                # 有异常则回滚
                self.rollback()  # 调用回滚
            else:  # 如果没有异常
                # 无异常则提交
                self.commit()  # 调用提交
            # 无论提交还是回滚，都要关闭连接
            self.close()  # 关闭连接
        # 返回 False 表示不吞异常，让它继续传播
        return False  # 返回 False，异常继续向上传播

# 演示正常路径：自动提交
print("--- 正常路径（自动提交）---")  # 打印正常路径标题
with FakeDBConnection("mysql://localhost/shop") as db:  # 进入上下文，建立连接
    db.execute("INSERT INTO orders VALUES (1, 99.5)")  # 执行插入
    db.execute("UPDATE stock SET qty = qty - 1 WHERE sku = 'A'")  # 执行更新

# 演示异常路径：自动回滚
print("--- 异常路径（自动回滚）---")  # 打印异常路径标题
try:  # 尝试执行会抛异常的事务
    with FakeDBConnection("mysql://localhost/shop") as db:  # 进入上下文
        db.execute("INSERT INTO orders VALUES (2, 50.0)")  # 执行插入
        # 模拟中途出错
        raise RuntimeError("库存不足，触发异常")  # 抛出运行时异常
        # 这行不会执行
        db.execute("UPDATE stock SET qty = qty - 1")  # 永远不会执行到这里
except RuntimeError as e:  # 捕获运行时异常
    print(f"  捕获到业务异常：{e}")  # 打印捕获到的异常

print()  # 打印空行
print("=" * 60)  # 打印分隔线
print("场景 2：临时文件处理")  # 打印场景标题
print("=" * 60)  # 打印分隔线

# 用 contextmanager 实现一个"临时工作目录"
@contextmanager  # 用装饰器把生成器函数变成上下文管理器
def temp_workspace(prefix="pykit_"):  # 定义临时工作目录生成器
    # 创建临时目录（真实场景用 tempfile.mkdtemp）
    path = tempfile.mkdtemp(prefix=prefix)  # 创建一个临时目录
    # 打印创建信息
    print(f"  [创建] 临时目录 {path}")  # 打印创建的目录路径
    try:  # 用 try 保证清理
        # yield 把目录路径交给 with 块使用
        yield path  # 把目录路径交给 with 块
    finally:  # 无论是否异常都执行清理
        # 无论是否异常都删除整个目录
        shutil.rmtree(path, ignore_errors=True)  # 递归删除临时目录
        # 打印清理信息
        print(f"  [清理] 已删除临时目录 {path}")  # 打印清理完成信息

# 在临时目录里写几个文件再读回
with temp_workspace() as workdir:  # 进入临时工作目录上下文
    # 拼接文件路径
    f1 = os.path.join(workdir, "a.txt")  # 拼接 a.txt 路径
    f2 = os.path.join(workdir, "b.txt")  # 拼接 b.txt 路径
    # 写入内容
    with open(f1, "w") as f:  # 打开 a.txt 写入
        f.write("hello")  # 写入内容
    with open(f2, "w") as f:  # 打开 b.txt 写入
        f.write("world")  # 写入内容
    # 读回验证
    with open(f1) as f:  # 打开 a.txt 读取
        print(f"  读到 a.txt = {f.read()}")  # 打印读到的内容
    # 列出目录内容
    print(f"  目录内容 = {sorted(os.listdir(workdir))}")  # 打印目录内文件列表
# 离开 with 后目录已自动删除
print(f"  离开后目录是否存在：{os.path.exists(workdir)}")  # 验证目录已被删除

print()  # 打印空行
print("=" * 60)  # 打印分隔线
print("场景 3：ExitStack 管理动态多个资源")  # 打印场景标题
print("=" * 60)  # 打印分隔线

# 用 ExitStack 同时管理多个临时文件
file_paths = []  # 初始化文件路径列表
with ExitStack() as stack:  # 进入 ExitStack 上下文
    # 动态创建 3 个临时文件
    for i in range(3):  # 循环 3 次
        # 创建临时文件并注册到栈（离开时自动关闭）
        f = stack.enter_context(tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False))  # 创建临时文件并注册
        # 写入内容
        f.write(f"文件 {i} 的内容")  # 写入内容
        # 记录路径
        file_paths.append(f.name)  # 记录文件路径
        # 打印创建信息
        print(f"  创建 {f.name}")  # 打印创建的文件名
    # 在 with 内部所有文件都还开着
    print(f"  with 内：已创建 {len(file_paths)} 个文件")  # 打印已创建文件数

# with 结束后，注册的清理回调（删文件）按 LIFO 执行
print(f"  with 外：检查文件是否还在")  # 打印检查提示
# 清理由 NamedTemporaryFile 自己处理 delete=False 时需要手动删
for p in file_paths:  # 遍历所有文件路径
    # 检查并删除残留文件
    if os.path.exists(p):  # 如果文件还存在
        os.unlink(p)  # 删除文件
        print(f"  手动清理 {p}")  # 打印清理信息

# 演示 callback 注册任意清理动作
print("--- ExitStack.callback 注册清理 ---")  # 打印回调演示标题
with ExitStack() as stack:  # 进入 ExitStack 上下文
    # 注册多个清理回调（LIFO 顺序执行）
    stack.callback(print, "  清理 1（最先注册）")  # 注册第一个清理回调
    stack.callback(print, "  清理 2（其次注册）")  # 注册第二个清理回调
    stack.callback(print, "  清理 3（最后注册，最先执行）")  # 注册第三个清理回调
    print("  with 块执行中...")  # 打印 with 块执行信息
# 离开时打印顺序：清理 3 -> 清理 2 -> 清理 1

print()  # 打印空行
print("全部演示完成。")  # 打印结束语
`,
  },

  // =========================================================
  // 第十五章：生成器与迭代器
  // =========================================================
  {
    id: "pykit-15",
    group: "函数与装饰器",
    icon: "🏗️",
    title: "生成器与迭代器",
    content: `# 生成器与迭代器

## 一、引言：惰性求值的威力

当你处理 10GB 的日志文件，或者生成一个无限序列时，\`list\` 会直接把内存撑爆。**生成器（generator）**用"按需产出"的惰性求值解决了这个问题：你要一个我给一个，不提前算完。

\`\`\`text
列表推导式：         [x*x for x in range(10**9)]   ← 立刻 OOM
生成器表达式：       (x*x for x in range(10**9))   ← 几乎不占内存
\`\`\`

生成器是 Python 处理大数据流、流式处理、协程的基础。掌握它，你写出的代码更省内存、更优雅。

---

## 二、迭代器协议

要理解生成器，先理解迭代器。Python 的 \`for\` 循环背后是**迭代器协议**：

\`\`\`text
iter(iterable) -> iterator
   │
   ▼
反复调用 next(iterator)
   │
   └─ 直到抛出 StopIteration 表示结束
\`\`\`

任何实现了 \`__iter__\` 和 \`__next__\` 的对象都是迭代器：

\`\`\`python
class CountDown:
    def __init__(self, start):
        self.current = start

    def __iter__(self):
        return self            # 自己就是迭代器

    def __next__(self):
        if self.current <= 0:
            raise StopIteration   # 用这个异常表示"结束"
        self.current -= 1
        return self.current + 1

for n in CountDown(3):
    print(n)        # 3, 2, 1
\`\`\`

| 概念       | 方法                  | 说明                     |
| ---------- | --------------------- | ------------------------ |
| 可迭代     | __iter__              | 能被 for 遍历            |
| 迭代器     | __iter__ + __next__   | 能被 next() 取下一个     |
| 生成器     | 含 yield 的函数       | 自动实现迭代器协议       |

---

## 三、yield 关键字

\`yield\` 是生成器的灵魂。函数里出现 \`yield\`，它就不再是普通函数，而变成"生成器工厂"：

\`\`\`python
def count_down(n):
    while n > 0:
        yield n          # 暂停并产出 n
        n -= 1

gen = count_down(3)      # 调用不执行，只返回生成器对象
print(next(gen))         # 3：执行到 yield 暂停
print(next(gen))         # 2：从上次暂停处继续
print(next(gen))         # 1
print(next(gen))         # 抛 StopIteration
\`\`\`

执行模型：

\`\`\`text
调用 count_down(3)
   │  ── 不执行函数体，返回生成器
   ▼
next() -> 执行到 yield n，暂停，返回 n
   │  ── 函数状态（局部变量、PC）被冻结
   ▼
next() -> 从上次 yield 处继续，执行到下一个 yield
   │
   ▼
函数结束 / return -> 抛 StopIteration
\`\`\`

关键认知：

1. \`yield\` 让函数"暂停"而非"结束"，下次 \`next\` 从暂停处继续。
2. 局部变量在暂停期间被保留，这是生成器省内存的根本原因。
3. \`return value\` 会作为 \`StopIteration.value\`，可用于协程返回结果。

---

## 四、生成器表达式 vs 列表推导式

把列表推导式的 \`[]\` 换成 \`()\`，就得到生成器表达式：

\`\`\`python
# 列表推导式：立即计算，占内存
squares_list = [x * x for x in range(1000000)]

# 生成器表达式：惰性求值，几乎不占内存
squares_gen = (x * x for x in range(1000000))

print(sum(squares_gen))    # 逐个产出求和，不存整个列表
\`\`\`

| 维度       | 列表推导式 [...]   | 生成器表达式 (...)       |
| ---------- | ------------------ | ------------------------ |
| 求值时机   | 立即               | 惰性                     |
| 内存       | O(n)               | O(1)                     |
| 可重复遍历 | 可以               | 只能遍历一次             |
| 可索引     | 可以 lst[i]        | 不可以                   |
| 适用场景   | 需要多次访问/索引  | 只遍历一次、大数据流     |

**经验**：只遍历一次就用生成器表达式；需要多次访问或随机访问才用列表。

---

## 五、yield from 委托生成器

\`yield from\` 让一个生成器把"产出"委托给另一个生成器，避免手动 for + yield：

\`\`\`python
def inner():
    yield 1
    yield 2
    yield 3

def outer_bad():
    for x in inner():     # 手动转发
        yield x

def outer_good():
    yield from inner()    # 委托，更简洁
\`\`\`

\`yield from\` 还会正确传递 \`send()\`、\`throw()\` 和返回值，是构建生成器管道的关键：

\`\`\`python
def flatten(nested):
    for item in nested:
        if isinstance(item, list):
            yield from flatten(item)   # 递归委托
        else:
            yield item

list(flatten([1, [2, [3, 4], 5], 6]))   # [1, 2, 3, 4, 5, 6]
\`\`\`

---

## 六、itertools 常用函数

\`itertools\` 是生成器的"瑞士军刀"，提供大量高效迭代工具：

| 函数          | 作用                         | 示例                                  |
| ------------- | ---------------------------- | ------------------------------------- |
| chain(*it)    | 把多个可迭代对象串起来       | chain([1,2], [3,4]) -> 1,2,3,4        |
| product(*it)  | 笛卡尔积                     | product('AB', '12') -> A1 A2 B1 B2    |
| combinations | 组合（不放回）               | combinations('ABC', 2) -> AB AC BC    |
| permutations  | 排列（有顺序）               | permutations('ABC', 2) -> AB AC BA... |
| islice        | 切片（支持生成器）           | islice(gen, 5) 取前 5 个              |
| count         | 无限计数                     | count(10) -> 10,11,12,...             |
| cycle         | 无限循环                     | cycle('AB') -> A,B,A,B,...            |
| groupby       | 分组（需先排序）             | 按key分组                             |

示例：

\`\`\`python
from itertools import chain, product, combinations, permutations

# 串接多个列表
list(chain([1,2], [3,4], [5]))          # [1, 2, 3, 4, 5]

# 笛卡尔积：所有颜色×尺码组合
list(product(["红", "蓝"], ["S", "M"]))  # [('红','S'), ('红','M'), ...]

# 从 5 人中选 2 人的组合
list(combinations("ABCDE", 2))          # 10 种

# 全排列
len(list(permutations("ABC")))          # 6 种
\`\`\`

---

## 七、自定义迭代器类

当生成器不够用（比如需要随机访问、状态复杂），可以实现迭代器协议：

\`\`\`python
class Fib:
    def __init__(self, n):
        self.n = n
        self.a, self.b = 0, 1
        self.count = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.count >= self.n:
            raise StopIteration
        value = self.a
        self.a, self.b = self.b, self.a + self.b
        self.count += 1
        return value

list(Fib(10))   # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
\`\`\`

迭代器一旦耗尽就"死"了，不能重用。要可重用，把 \`__iter__\` 写成生成器函数即可。

---

## 八、本章 demo 说明

下面代码演示两个真实场景：

1. **大文件逐行读取**：用生成器按行产出，常驻内存恒定。
2. **无限序列**：用 itertools + 生成器构造无限流，按需取用。

运行后会看到惰性求值如何让"无限"和"巨大"变得可控。

---

## 九、易错点小结

| 易错点                       | 错误做法                     | 正确做法                       |
| ---------------------------- | ---------------------------- | ------------------------------ |
| 以为生成器能重复遍历         | for 两遍 gen                 | 转成 list 或重新创建           |
| 忘记 yield 让函数变生成器    | 直接调用想拿返回值           | 用 next 或 for 取值            |
| 生成器表达式用索引           | gen[0]                       | 先转 list 或用 islice          |
| 迭代器耗尽后还 next          | 抛 StopIteration             | 用 for 自动处理结束            |
| 想用 len()                   | len(生成器)                  | 改用 list 或计数               |
| groupby 前没排序             | 分组错乱                     | 先按 key 排序再 groupby        |
`,
    code: `# ============================================================
# 第十五章演示：生成器与迭代器
# 场景 1：大文件逐行读取（生成器，恒定内存）
# 场景 2：无限序列（itertools + 生成器按需取用）
# ============================================================
import os  # 导入 os 模块，用于文件路径和存在性检查
import tempfile  # 导入 tempfile 模块，用于创建临时文件
from itertools import islice, count, cycle, chain, product, combinations, groupby  # 导入常用迭代工具

print("=" * 60)  # 打印分隔线
print("场景 1：大文件逐行读取")  # 打印场景标题
print("=" * 60)  # 打印分隔线

# 先造一个"大"文件（演示用，写 10000 行）
tmp = tempfile.NamedTemporaryFile(mode="w", suffix=".log", delete=False)  # 创建临时文件
# 写入 10000 行日志
for i in range(10000):  # 循环 10000 次
    # 写入模拟日志行
    tmp.write(f"2026-07-08 {i:05d} INFO event_{i}" + chr(10))  # 写入一行日志（chr(10) 为换行符）
# 关闭文件
tmp.close()  # 关闭临时文件
print(f"  已生成日志文件：{os.path.basename(tmp.name)}，约 {os.path.getsize(tmp.name)} 字节")  # 打印文件信息

# 定义一个生成器：逐行读取文件，按需产出
def read_lines(path):  # 定义逐行读取生成器
    # 打开文件（with 保证关闭）
    with open(path, encoding="utf-8") as f:  # 打开文件并指定编码
        # 逐行读取，遇到 yield 暂停
        for line in f:  # 逐行迭代文件对象
            # 去掉换行符后产出
            yield line.rstrip(chr(10))  # 去掉换行符后产出该行

# 用生成器读取，内存恒定
lines_gen = read_lines(tmp.name)  # 创建生成器对象（尚未读取）
# 只取前 3 行预览
print("  前 3 行预览：")  # 打印预览标题
for line in islice(lines_gen, 3):  # 用 islice 只取前 3 行
    print(f"    {line}")  # 打印这一行

# 用生成器表达式统计行数（不存整个列表）
total = sum(1 for _ in read_lines(tmp.name))  # 用生成器表达式逐行计数
print(f"  文件总行数：{total}")  # 打印总行数

# 演示生成器只能遍历一次
g = read_lines(tmp.name)  # 新建一个生成器
first = next(g)              # 取第一行
print(f"  再次读取第一行：{first[:30]}...")  # 打印第一行前 30 个字符

# 用生成器函数实现"过滤 + 转换"的流式管道
def parse_line(line):  # 定义行解析函数
    # 按空格切分日志行
    parts = line.split()  # 按空白切分
    # 返回 (序号, 级别, 事件名)
    return parts[1], parts[2], parts[3]  # 返回序号、级别、事件名组成的元组

# 流式处理：逐行读取 -> 过滤序号能被 1000 整除的行 -> 解析 -> 取事件名
def even_events(path):  # 定义流式过滤生成器
    # 逐行读取，内存恒定
    for line in read_lines(path):  # 逐行读取文件
        # 解析这一行得到元组
        idx, level, event = parse_line(line)  # 解析当前行
        # 只保留序号能被 1000 整除的行
        if int(idx) % 1000 == 0:  # 如果序号能被 1000 整除
            # 产出事件名
            yield event  # 产出事件名

# 取前 5 个匹配的事件名
sample = list(islice(even_events(tmp.name), 5))  # 取前 5 个匹配的事件名
print(f"  流式管道取到的事件名：{sample}")  # 打印结果

# 清理临时文件
os.unlink(tmp.name)  # 删除临时文件
print(f"  已清理临时文件，存在？{os.path.exists(tmp.name)}")  # 验证已删除

print()  # 打印空行
print("=" * 60)  # 打印分隔线
print("场景 2：无限序列")  # 打印场景标题
print("=" * 60)  # 打印分隔线

# itertools.count 生成无限计数序列
natural = count(start=1)            # 1, 2, 3, ... 无限
# 用 islice 只取前 5 个（无限序列必须配合 islice）
print(f"  count 前 5 个：{list(islice(natural, 5))}")  # 取前 5 个并打印

# itertools.cycle 无限循环一个有限序列
turns = cycle(["A", "B", "C"])      # A, B, C, A, B, C, ... 无限
# 取前 7 个
print(f"  cycle 前 7 个：{list(islice(turns, 7))}")  # 取前 7 个并打印

# 自定义无限斐波那契生成器
def fib():  # 定义无限斐波那契生成器
    # 初始化前两项
    a, b = 0, 1  # 初始化前两项为 0 和 1
    # 无限循环产出
    while True:  # 无限循环
        # 产出当前值
        yield a  # 产出当前项
        # 推进到下一项
        a, b = b, a + b  # 同时更新 a 和 b

# 取斐波那契前 10 项
fibs = list(islice(fib(), 10))  # 取前 10 项
print(f"  斐波那契前 10 项：{fibs}")  # 打印前 10 项

# 用 yield from 委托：展平嵌套结构
def flatten(nested):  # 定义展平嵌套生成器
    # 遍历每个元素
    for item in nested:  # 遍历顶层元素
        # 如果是列表就递归委托
        if isinstance(item, list):  # 如果元素是列表
            yield from flatten(item)  # 递归委托给子生成器
        else:  # 如果不是列表
            # 否则直接产出
            yield item  # 直接产出该元素

# 展平一个多层嵌套列表
nested = [1, [2, [3, 4], 5], 6, [7, [8, [9]]]]  # 定义多层嵌套列表
print(f"  展平嵌套：{list(flatten(nested))}")  # 打印发平结果

# 演示 itertools 组合工具
print("--- 组合工具 ---")  # 打印组合工具标题
# chain 串接多个可迭代对象
chained = list(chain([1, 2], [3, 4], [5]))  # 用 chain 串接三个列表
print(f"  chain 串接：{chained}")  # 打印串接结果

# product 笛卡尔积
combos = list(product(["红", "蓝"], ["S", "M", "L"]))  # 计算颜色和尺码的笛卡尔积
print(f"  product 笛卡尔积（颜色×尺码）：{combos}")  # 打印笛卡尔积

# combinations 组合
pairs = list(combinations("ABCD", 2))  # 从 ABCD 中选 2 个的组合
print(f"  combinations 从 ABCD 选 2：{pairs}")  # 打印组合结果

# groupby 分组（必须先按 key 排序）
data = [("a", 1), ("a", 2), ("b", 3), ("a", 4), ("b", 5)]  # 定义原始数据
# 按 key 排序（groupby 要求连续）
data_sorted = sorted(data, key=lambda x: x[0])  # 按 key 排序使相同 key 连续
# 分组统计每组数量
for key, group in groupby(data_sorted, key=lambda x: x[0]):  # 按 key 分组
    # 把生成器转成列表统计
    members = list(group)  # 把分组生成器转成列表
    print(f"  groupby 组 {key}：{members}")  # 打印该组成员

# 自定义迭代器类：限定次数的斐波那契
class FibIterator:  # 定义斐波那契迭代器类
    # 初始化，指定要取多少项
    def __init__(self, n):  # 构造方法，指定项数
        # 保存项数上限
        self.n = n  # 保存项数上限
        # 初始化斐波那契前两项
        self.a, self.b = 0, 1  # 初始化前两项
        # 已产出计数
        self.count = 0  # 已产出计数初始化为 0

    # 返回自身作为迭代器
    def __iter__(self):  # 定义 __iter__ 方法
        return self  # 返回自身作为迭代器

    # 取下一个值
    def __next__(self):  # 定义 __next__ 方法
        # 如果已达上限就停止
        if self.count >= self.n:  # 如果已达上限
            raise StopIteration  # 抛出 StopIteration 表示结束
        # 取当前值
        value = self.a  # 取当前斐波那契值
        # 推进到下一项
        self.a, self.b = self.b, self.a + self.b  # 推进到下一项
        # 计数加一
        self.count += 1  # 计数加一
        # 返回当前值
        return value  # 返回当前值

# 用自定义迭代器取前 8 项斐波那契
print(f"  自定义迭代器 FibIterator(8)：{list(FibIterator(8))}")  # 用迭代器取前 8 项并打印

print()  # 打印空行
print("全部演示完成。")  # 打印结束语
`,
  },
];
