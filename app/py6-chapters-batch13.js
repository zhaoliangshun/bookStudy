export const chapters = [
  {
    id: "py6-walrus",
    group: "函数与并发进阶",
    icon: "🦭",
    title: "海象运算符 :=（赋值表达式）",
    content: `## 海象运算符 :=（赋值表达式 / PEP 572 / Python 3.8+）

### 什么是海象运算符

海象运算符 \`:=\`（walrus operator）是 Python 3.8 引入的**赋值表达式**（assignment expression）语法，因 \`:=\` 形似海象的眼睛和牙齿而得名。它的核心价值在于：**在表达式内部完成赋值**，把"计算"和"绑定变量名"合二为一。

\`\`\`python
# 赋值语句（传统写法）：赋值是一个语句，没有返回值
n = 10
# 赋值表达式（海象运算符）：赋值是一个表达式，有返回值
if (n := 10) > 5:
    print(n)  # n 在 if 内部就可用了
\`\`\`

### 赋值表达式 vs 赋值语句

这是理解 \`:=\` 的关键。Python 中 \`=\` 是**语句**（statement），不能出现在表达式位置；而 \`:=\` 是**表达式**（expression），可以出现在任何表达式允许的位置（if 条件、while 条件、列表推导式、函数参数等）。

| 特性 | 赋值语句 \`=\` | 赋值表达式 \`:=\` |
|------|---------------|-------------------|
| 类别 | 语句（statement） | 表达式（expression） |
| 返回值 | 无 | 有，返回被赋的值 |
| 出现位置 | 独立一行 | if/while/推导式/参数等表达式位置 |
| 引入版本 | 一直存在 | Python 3.8+（PEP 572） |
| 可链式 | a = b = 1 | 支持 (a := b := 1) 但不推荐 |
| 作用域 | 当前作用域 | 当前作用域（注意推导式作用域） |

### 经典场景 1：while 读取循环

传统写法需要"读一行 → 判断 → 处理 → 再读一行"，导致 \`readline()\` 调用重复出现：

\`\`\`python
# 传统写法：readline 重复出现
line = f.readline()
while line:
    process(line)
    line = f.readline()  # 重复调用

# 海象运算符：一行搞定，无重复
while (line := f.readline()):
    process(line)
\`\`\`

### 经典场景 2：条件判断中捕获计算结果

当我们需要在 if 条件里调用一个函数，然后在 if 体内再次使用该结果时，传统写法要么调用两次（浪费），要么提前定义变量（多一行）：

\`\`\`python
# 传统写法：调用两次或提前定义
n = len(data)
if n > 10:
    print(f"数据过长: {n}")

# 海象运算符：在条件中赋值，if 体内直接用
if (n := len(data)) > 10:
    print(f"数据过长: {n}")
\`\`\`

### 经典场景 3：列表推导式中过滤 + 转换

推导式中如果过滤条件和结果都需要调用同一个昂贵函数，海象运算符可以避免重复调用：

\`\`\`python
# 传统写法：expensive_func 被调用两次
results = [transform(x) for x in data if transform(x) is not None]

# 海象运算符：只调用一次
results = [y for x in data if (y := transform(x)) is not None]
\`\`\`

### 经典场景 4：与正则匹配结合

正则匹配的结果 \`Match\` 对象需要先判断是否匹配成功，再使用 \`group()\`：

\`\`\`python
import re
# 传统写法
m = pattern.search(text)
if m:
    print(m.group(1))

# 海象运算符
if (m := pattern.search(text)):
    print(m.group(1))
\`\`\`

### 原理深入：作用域与求值顺序

\`:=\` 的赋值发生在**当前作用域**（不是表达式作用域）。在推导式中要特别注意：推导式有自己的作用域，但在其中使用 \`:=\` 赋值的变量会"泄漏"到外层作用域。

\`\`\`python
data = [1, 2, 3]
# last 会泄漏到外层
filtered = [y for x in data if (y := x * 2) > 2]
print(y)  # 6（最后一个赋的值，泄漏到外层）
\`\`\`

> ⚠️ **避坑提示**：推导式中使用 \`:=\` 时，赋值变量会泄漏到外层作用域。如果不想泄漏，请使用不同的变量名或避免在推导式中使用 \`:=\`。

### 业务场景

1. **简化重复计算**：当某个函数调用结果需要在条件判断和后续逻辑中都用时，\`:=\` 避免重复调用（尤其适合昂贵的 IO 或计算函数）。
2. **流式读取处理**：逐行读取大文件、逐块读取网络流时，\`while (chunk := stream.read(4096))\` 是最简洁的写法。
3. **配置解析**：解析配置时先尝试获取值，再判断是否有效：\`if (val := config.get("key")) is not None\`。
4. **数据清洗管道**：在推导式中过滤并转换数据，避免对同一元素调用两次转换函数。

### 滥用警告

> 💡 **最佳实践**：海象运算符的目标是**减少重复**和**提升可读性**。如果使用 \`:=\` 让代码更难懂，就不要用。可读性永远优先于"炫技"。

**不该用的场景**：
- 简单赋值：\`x := 5\`（直接用 \`x = 5\`）
- 过度嵌套：\`if (a := (b := f()) and g(b)) > 0\`（拆开写）
- 在不需要的地方强行使用

### 对比表：传统写法 vs 海象写法

| 场景 | 传统写法 | 海象写法 | 优势 |
|------|---------|---------|------|
| while 读行 | 两行 readline | 一行搞定 | 无重复 |
| if 条件赋值 | 提前定义变量 | 行内赋值 | 少一行 |
| 推导式过滤转换 | 调用两次 | 调用一次 | 性能提升 |
| 正则匹配 | 两步走 | 一步到位 | 更简洁 |
| any/all 短路 | 无法捕获首个 True | 可捕获 | 实用 |

### 最佳实践总结

1. **目标是消除重复**：只在能消除重复调用或重复代码时使用。
2. **可读性优先**：如果 \`:=\` 让一行代码过长或过于复杂，拆开写。
3. **注意作用域泄漏**：推导式中的 \`:=\` 变量会泄漏到外层，注意命名。
4. **用括号明确优先级**：\`if (n := f()) > 0\` 中的括号是必须的，因为 \`:=\` 优先级很低。
5. **Python 3.8+ 才支持**：老项目需确认最低运行版本。`,
    code: `# ========================================
# 海象运算符 := 演示（Python 3.8+）
# ========================================
import re
import sys

print("=== 1. 基础：赋值表达式 vs 赋值语句 ===\\n")

# 赋值语句：n = 10，没有返回值，不能写在表达式位置
n = 10
print(f"赋值语句: n = {n}")

# 赋值表达式：(n := 20) 有返回值，可以出现在 if 条件中
if (n := 20) > 15:
    print(f"赋值表达式: n = {n}，条件成立（n 在 if 内可用）")

print("\\n=== 2. 经典场景：while 读取循环 ===\\n")

# 模拟逐行读取（用列表模拟文件对象）
lines = ["第一行数据", "第二行数据", "第三行数据", ""]
idx = 0
def fake_readline():
    global idx
    if idx < len(lines):
        line = lines[idx]
        idx += 1
        return line
    return ""

# 传统写法：readline 重复调用
print("--- 传统写法 ---")
idx = 0
line = fake_readline()
while line:
    print(f"  读取: {line}")
    line = fake_readline()

# 海象写法：无重复
print("--- 海象写法 ---")
idx = 0
while (line := fake_readline()):
    print(f"  读取: {line}")

print("\\n=== 3. 条件判断中捕获计算结果 ===\\n")

# 业务场景：校验用户输入长度，避免重复调用 len()
user_input = "这是一个很长的用户输入字符串用于测试"
if (length := len(user_input)) > 10:
    print(f"输入过长: {length} 字符（超过 10）")

# 业务场景：配置解析
config = {"host": "localhost", "port": 8080, "timeout": None}
if (timeout := config.get("timeout")) is not None:
    print(f"超时设置: {timeout}s")
else:
    print("超时未设置，使用默认值 30s")

print("\\n=== 4. 列表推导式：过滤 + 转换一次完成 ===\\n")

# 模拟昂贵的转换函数
def parse_price(s):
    """模拟解析价格，无效返回 None"""
    try:
        val = float(s)
        return val if val > 0 else None
    except (ValueError, TypeError):
        return None

raw_prices = ["99.5", "abc", "0", "128.0", "-5", "66.6"]

# 传统写法：parse_price 被调用两次
valid1 = [parse_price(x) for x in raw_prices if parse_price(x) is not None]
print(f"传统写法结果: {valid1}")

# 海象写法：只调用一次（性能更好）
valid2 = [y for x in raw_prices if (y := parse_price(x)) is not None]
print(f"海象写法结果: {valid2}")

print("\\n=== 5. 与正则匹配结合 ===\\n")

# 业务场景：从日志中提取时间戳
log_pattern = re.compile(r'\\[(\\d{4}-\\d{2}-\\d{2})\\]')
logs = [
    "[2024-01-15] 系统启动",
    "无时间戳的日志",
    "[2024-01-16] 服务就绪",
]

print("--- 提取日志日期 ---")
for log in logs:
    # 海象运算符：匹配和取值一步到位
    if (m := log_pattern.search(log)):
        print(f"  日期: {m.group(1)} | 日志: {log}")
    else:
        print(f"  无日期 | 日志: {log}")

print("\\n=== 6. any() 短路捕获首个匹配 ===\\n")

# 业务场景：在用户列表中查找第一个管理员
users = [
    {"name": "张三", "role": "user"},
    {"name": "李四", "role": "admin"},
    {"name": "王五", "role": "user"},
]

# 海象运算符配合 any：捕获第一个满足条件的元素
if any((admin := u) for u in users if u["role"] == "admin"):
    print(f"找到管理员: {admin['name']}")
else:
    print("未找到管理员")

print("\\n=== 7. 三元表达式中的赋值 ===\\n")

# 业务场景：根据数据量选择处理策略
data_size = 1500
strategy = (big := "批量处理") if data_size > 1000 else (small := "单条处理")
print(f"数据量: {data_size}，策略: {strategy}")

print("\\n=== 8. 避坑：作用域泄漏 ===\\n")

numbers = [1, 2, 3, 4, 5]
# 推导式中的 := 变量会泄漏到外层作用域
filtered = [y for x in numbers if (y := x * 2) > 4]
print(f"过滤结果: {filtered}")
print(f"泄漏的 y 值: {y}（最后一个 x*2 的结果）")

print("\\n=== 最佳实践总结 ===")
print("1. 目标是消除重复调用/重复代码")
print("2. 可读性优先，不要为用而用")
print("3. if/while 条件中用 := 必须加括号")
print("4. 推导式中注意变量作用域泄漏")
print("5. 需要 Python 3.8+")
print(f"当前 Python 版本: {sys.version_info[:2]}")`,
  },
  {
    id: "py6-closure-traps",
    group: "函数与并发进阶",
    icon: "🪤",
    title: "闭包陷阱与延迟绑定",
    content: `## 闭包陷阱与延迟绑定

### 闭包基础回顾

闭包（closure）是指**捕获了外部作用域变量的函数**。在 Python 中，嵌套函数天然可以读取外层函数的变量，这种机制就是闭包。

\`\`\`python
def make_counter():
    count = 0  # 外层变量
    def inner():
        nonlocal count  # 捕获外层变量
        count += 1
        return count
    return inner  # 返回闭包

c = make_counter()
print(c())  # 1
print(c())  # 2
\`\`\`

闭包的核心特性：**函数捕获的是变量的引用（名字），而非变量当时的值**。这正是"延迟绑定"陷阱的根源。

### 陷阱 1：循环中的闭包（延迟绑定）

这是 Python 中最经典的闭包陷阱。在 for 循环中创建多个 lambda，期望每个 lambda 捕获不同的循环变量值，但实际它们捕获的是同一个变量引用——循环结束后，该变量的值是最后一次迭代的值。

\`\`\`python
# 经典反例：所有 lambda 返回同一个值
funcs = []
for i in range(3):
    funcs.append(lambda: i)

print([f() for f in funcs])  # [2, 2, 2] 不是 [0, 1, 2]！
\`\`\`

**原理**：lambda 捕获的是变量 \`i\` 这个**名字**（引用），而非 \`i\` 当时的值。当循环结束后 \`i = 2\`，所有 lambda 调用时都去查 \`i\` 的当前值，得到 2。

### 解决方法 1：默认参数捕获（最经典）

利用默认参数在**函数定义时**求值的特性，把循环变量的值"冻结"到默认参数中：

\`\`\`python
funcs = []
for i in range(3):
    funcs.append(lambda x=i: x)  # 默认参数在定义时求值

print([f() for f in funcs])  # [0, 1, 2] ✓
\`\`\`

### 解决方法 2：functools.partial

\`partial\` 在创建时就绑定了参数值：

\`\`\`python
from functools import partial
funcs = [partial(lambda x: x, i) for i in range(3)]
print([f() for f in funcs])  # [0, 1, 2] ✓
\`\`\`

### 解决方法 3：立即执行的工厂函数

用一个立即调用的外层函数，把循环变量作为参数传入，强制在每次迭代时求值：

\`\`\`python
funcs = [(lambda x: (lambda: x))(i) for i in range(3)]
print([f() for f in funcs])  # [0, 1, 2] ✓
\`\`\`

### 三种方法对比

| 方法 | 写法 | 原理 | 可读性 | 推荐度 |
|------|------|------|--------|--------|
| 默认参数 | \`lambda x=i: x\` | 定义时求值 | 较好 | ★★★★★ |
| partial | \`partial(f, i)\` | 创建时绑定 | 好 | ★★★★ |
| 工厂函数 | \`(lambda x: lambda: x)(i)\` | 立即调用 | 差 | ★★ |

### 陷阱 2：可变默认参数

这虽然不是严格意义上的闭包陷阱，但原理相似——默认参数在**函数定义时**只创建一次，之后所有调用共享同一个默认对象。

\`\`\`python
# 反例：所有调用共享同一个列表
def append_to(item, lst=[]):
    lst.append(item)
    return lst

print(append_to(1))  # [1]
print(append_to(2))  # [1, 2] 不是 [2]！
\`\`\`

**正确写法**：用 \`None\` 作为哨兵，在函数内部创建新对象：

\`\`\`python
def append_to(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst
\`\`\`

### 原理深入：LEGB 规则与闭包单元格

Python 变量查找遵循 **LEGB** 规则：Local → Enclosing → Global → Built-in。闭包捕获的变量存储在函数对象的 \`__closure__\` 属性中（每个单元格 cell 持有一个引用）。

\`\`\`python
def outer():
    x = 10
    def inner():
        return x
    return inner

f = outer()
print(f.__closure__)        # (<cell at 0x...: int object at 0x...>,)
print(f.__closure__[0].cell_contents)  # 10
\`\`\`

闭包单元格存储的是**引用**，这就是延迟绑定的底层原因：所有在循环中创建的闭包共享同一个 cell，cell 里的值随循环变化。

### 闭包 vs 对象：状态封装对比

闭包和对象都可以封装状态，它们是等价的表达方式：

| 维度 | 闭包 | 对象 |
|------|------|------|
| 状态存储 | \`__closure__\` 单元格 | 实例属性 |
| 访问方式 | 函数调用 | 方法调用 |
| 封装性 | 天然私有（无法直接访问 cell） | 需 \`\_\_\` 约定 |
| 可调试性 | 较差（\`__closure__\` 不直观） | 好（属性可查看） |
| 适用场景 | 简单状态、回调、装饰器 | 复杂状态、多方法 |

### 业务场景

1. **回调函数**：GUI/事件驱动编程中，回调函数捕获上下文变量。
2. **事件处理器**：Web 框架中注册路由处理函数，捕获配置。
3. **延迟执行**：定时任务、批处理任务中捕获任务参数。
4. **装饰器**：装饰器内部用闭包保存状态（如调用计数、缓存）。
5. **配置工厂**：根据配置生成定制化的处理函数。

### 调试技巧：如何排查闭包问题

1. **检查 \`__closure__\`**：打印函数的 \`__closure__\` 属性，查看捕获了哪些变量及其当前值。
2. **检查 \`__defaults__\`**：打印函数的 \`__defaults__\`，查看默认参数是否被意外修改。
3. **用 \`inspect\` 模块**：\`inspect.getclosurevars(func)\` 可以详细列出闭包捕获的变量来源。
4. **逐步缩小范围**：怀疑闭包问题时，把 lambda 替换成显式 def 函数，便于调试。

> ⚠️ **避坑提示**：在循环中创建闭包（lambda 或嵌套函数）时，永远检查是否需要捕获循环变量的"当前值"。如果需要，用默认参数 \`x=i\` 或 \`partial\`。

> 💡 **最佳实践**：可变默认参数永远用 \`None\` 哨兵模式。这是 Python 社区的通用约定。循环中创建闭包时，优先用默认参数 \`x=i\` 捕获当前值，它比 \`partial\` 更简洁，比工厂函数更易读。`,
    code: `# ========================================
# 闭包陷阱与延迟绑定 演示
# ========================================
import functools

print("=== 1. 闭包基础回顾 ===\\n")

def make_counter():
    """创建计数器闭包"""
    count = 0
    def inner():
        nonlocal count
        count += 1
        return count
    return inner

c = make_counter()
print(f"计数器: {c()}, {c()}, {c()}")  # 1, 2, 3

# 查看闭包单元格
print(f"闭包单元格: {c.__closure__}")
print(f"单元格内容: {c.__closure__[0].cell_contents}")

print("\\n=== 2. 经典陷阱：循环中的闭包（延迟绑定）===\\n")

# 反例：所有 lambda 返回同一个值
funcs_bad = []
for i in range(3):
    funcs_bad.append(lambda: i)  # 捕获的是 i 的引用，不是值

print("--- 反例：延迟绑定 ---")
print(f"期望 [0, 1, 2]，实际: {[f() for f in funcs_bad]}")
print("原理：所有 lambda 共享同一个 i 引用，循环结束后 i=2")

print("\\n=== 3. 解决方法对比 ===\\n")

# 方法 1：默认参数（定义时求值，冻结值）
funcs_default = []
for i in range(3):
    funcs_default.append(lambda x=i: x)
print(f"方法1 默认参数: {[f() for f in funcs_default]}")

# 方法 2：functools.partial（创建时绑定）
funcs_partial = [functools.partial(lambda x: x, i) for i in range(3)]
print(f"方法2 partial:  {[f() for f in funcs_partial]}")

# 方法 3：立即执行的工厂函数
funcs_factory = [(lambda x: (lambda: x))(i) for i in range(3)]
print(f"方法3 工厂函数: {[f() for f in funcs_factory]}")

print("\\n=== 4. 业务场景：事件处理器 ===\\n")

# 模拟按钮点击事件处理器
buttons = ["保存", "删除", "取消"]

# 反例：所有按钮点击都返回"取消"
handlers_bad = [lambda: f"点击了{btn}" for btn in buttons]
print("--- 反例：所有处理器返回同一个按钮 ---")
for h in handlers_bad:
    print(f"  {h()}")

# 正确写法：默认参数捕获
handlers_good = [lambda b=btn: f"点击了{b}" for btn in buttons]
print("--- 正确写法：每个处理器独立 ---")
for h in handlers_good:
    print(f"  {h()}")

print("\\n=== 5. 陷阱：可变默认参数 ===\\n")

# 反例：所有调用共享同一个列表
def append_bad(item, lst=[]):
    lst.append(item)
    return lst

print("--- 反例：可变默认参数 ---")
print(f"第一次调用: {append_bad(1)}")
print(f"第二次调用: {append_bad(2)}")  # [1, 2] 不是 [2]
print(f"默认参数被污染: {append_bad.__defaults__}")

# 正确写法：None 哨兵
def append_good(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst

print("--- 正确写法：None 哨兵 ---")
print(f"第一次调用: {append_good(1)}")
print(f"第二次调用: {append_good(2)}")  # [2] ✓

print("\\n=== 6. 闭包 vs 对象：状态封装对比 ===\\n")

# 用闭包实现计数器
def make_counter_closure(start=0):
    count = start
    def increment():
        nonlocal count
        count += 1
        return count
    def get_value():
        return count
    return increment, get_value

# 用对象实现计数器
class Counter:
    def __init__(self, start=0):
        self.count = start
    def increment(self):
        self.count += 1
        return self.count
    def get_value(self):
        return self.count

print("--- 闭包实现 ---")
inc_c, get_c = make_counter_closure(10)
print(f"初始值: {get_c()}")
print(f"自增后: {inc_c()}")
print(f"当前值: {get_c()}")

print("--- 对象实现 ---")
counter = Counter(10)
print(f"初始值: {counter.get_value()}")
print(f"自增后: {counter.increment()}")
print(f"当前值: {counter.get_value()}")

print("\\n=== 7. 闭包保存状态：配置工厂 ===\\n")

def make_url_builder(base_url):
    """创建 URL 构建器闭包"""
    def build(path):
        return f"{base_url.rstrip('/')}/{path.lstrip('/')}"
    return build

# 不同配置的 URL 构建器
api_builder = make_url_builder("https://api.example.com/")
cdn_builder = make_url_builder("https://cdn.example.com")

print(f"API: {api_builder('/users/123')}")
print(f"CDN: {cdn_builder('images/logo.png')}")

print("\\n=== 最佳实践总结 ===")
print("1. 循环中创建闭包用默认参数 x=i 捕获当前值")
print("2. 可变默认参数永远用 None 哨兵")
print("3. 复杂状态用对象，简单状态用闭包")
print("4. 理解 LEGB 和 __closure__ 原理")
print("5. partial 是替代默认参数的清晰方案")`,
  },
  {
    id: "py6-decorator-practice",
    group: "函数与并发进阶",
    icon: "🎁",
    title: "装饰器实战合集",
    content: `## 装饰器实战合集

### 装饰器本质

装饰器（decorator）本质是一个**高阶函数**：接收函数作为参数，返回一个新函数。\`@decorator\` 语法糖等价于 \`func = decorator(func)\`。

\`\`\`python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        print("调用前")
        result = func(*args, **kwargs)
        print("调用后")
        return result
    return wrapper

@my_decorator
def hello():
    print("hello")
# 等价于 hello = my_decorator(hello)
\`\`\`

### functools.wraps 的作用

装饰器会改变函数的 \`__name__\`、\`__doc__\` 等元信息。\`functools.wraps\` 把原函数的元信息复制到 wrapper 上，保持调试信息正确：

\`\`\`python
from functools import wraps
def my_decorator(func):
    @wraps(func)  # 必须加！
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
\`\`\`

> ⚠️ **避坑提示**：永远在 wrapper 上加 \`@wraps(func)\`，否则调试时函数名会变成 \`wrapper\`，文档丢失，inspect 模块失效。

### 实战装饰器 1：@timer 计时

\`\`\`python
import time
from functools import wraps

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} 耗时 {elapsed:.4f}s")
        return result
    return wrapper
\`\`\`

### 实战装饰器 2：@retry 重试（含指数退避）

\`\`\`python
import time
from functools import wraps

def retry(times=3, delay=1, backoff=2):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            wait = delay
            for attempt in range(times):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == times - 1:
                        raise
                    time.sleep(wait)
                    wait *= backoff
        return wrapper
    return decorator
\`\`\`

### 实战装饰器 3：@cache 缓存

Python 3.9+ 内置 \`@functools.cache\`，3.8 用 \`@functools.lru_cache(maxsize=None)\`：

\`\`\`python
from functools import lru_cache

@lru_cache(maxsize=128)
def expensive_compute(n):
    return sum(i * i for i in range(n))
\`\`\`

### 实战装饰器 4：@log 日志记录

\`\`\`python
from functools import wraps

def log(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print(f"[LOG] 调用 {func.__name__}(args={args}, kwargs={kwargs})")
        result = func(*args, **kwargs)
        print(f"[LOG] {func.__name__} 返回 {result}")
        return result
    return wrapper
\`\`\`

### 实战装饰器 5：@require_auth 权限校验

\`\`\`python
from functools import wraps

def require_auth(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        user = kwargs.get("user") or (args[0] if args else None)
        if not user or not getattr(user, "is_admin", False):
            raise PermissionError("需要管理员权限")
        return func(*args, **kwargs)
    return wrapper
\`\`\`

### 实战装饰器 6：@rate_limit 频率限制

\`\`\`python
import time
from collections import deque
from functools import wraps

def rate_limit(calls=5, period=1):
    def decorator(func):
        timestamps = deque()
        @wraps(func)
        def wrapper(*args, **kwargs):
            now = time.time()
            while timestamps and timestamps[0] < now - period:
                timestamps.popleft()
            if len(timestamps) >= calls:
                sleep_time = period - (now - timestamps[0])
                time.sleep(sleep_time)
            timestamps.append(time.time())
            return func(*args, **kwargs)
        return wrapper
    return decorator
\`\`\`

### 带参数的装饰器模板

带参数的装饰器需要**三层嵌套**：参数 → 装饰器 → wrapper

\`\`\`python
def decorator_with_args(arg1, arg2):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # 使用 arg1, arg2
            return func(*args, **kwargs)
        return wrapper
    return decorator
\`\`\`

### 类装饰器（用 __call__）

类装饰器通过 \`__call__\` 方法实现，适合需要维护复杂状态的场景：

\`\`\`python
class CallCounter:
    def __init__(self, func):
        self.func = func
        self.count = 0
    def __call__(self, *args, **kwargs):
        self.count += 1
        return self.func(*args, **kwargs)
\`\`\`

### 函数装饰器 vs 类装饰器

| 维度 | 函数装饰器 | 类装饰器 |
|------|-----------|---------|
| 写法 | 嵌套函数 + wraps | __init__ + __call__ |
| 状态管理 | 闭包变量（不直观） | 实例属性（清晰） |
| 可调试性 | 一般 | 好 |
| 适用场景 | 简单包装 | 复杂状态、多方法 |
| 继承扩展 | 不支持 | 支持 |

### 业务场景

1. **Web API**：\`@app.route\`、\`@require_auth\`、\`@rate_limit\` 组合使用。
2. **性能监控**：\`@timer\` + \`@log\` 记录所有接口耗时。
3. **容错处理**：\`@retry\` 包装网络请求、数据库操作。
4. **缓存优化**：\`@lru_cache\` 缓存纯函数计算结果。
5. **权限控制**：\`@require_auth\`、\`@require_role("admin")\`。

### 装饰器叠加顺序

多个装饰器**从下往上**包装，**从上往下**执行：

\`\`\`python
@A
@B
@C
def f(): pass
# 等价于 f = A(B(C(f)))
# 执行顺序：A 前置 → B 前置 → C 前置 → f → C 后置 → B 后置 → A 后置
\`\`\`

> 💡 **最佳实践**：装饰器要保持函数签名兼容（用 \`*args, **kwargs\`），永远加 \`@wraps\`，有返回值的一定要 \`return\` 原函数结果。`,
    code: `# ========================================
# 装饰器实战合集 演示
# ========================================
import time
import functools
from collections import deque

print("=== 1. @timer 计时装饰器 ===\\n")

def timer(func):
    """计时装饰器：测量函数执行时间"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"  [timer] {func.__name__} 耗时 {elapsed:.6f}s")
        return result
    return wrapper

@timer
def slow_sum(n):
    return sum(i * i for i in range(n))

print(f"结果: {slow_sum(100000)}")

print("\\n=== 2. @retry 重试装饰器（指数退避）===\\n")

def retry(times=3, delay=0.1, backoff=2):
    """重试装饰器：失败自动重试，指数退避"""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            wait = delay
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    print(f"  [retry] 第{attempt}次失败: {e}")
                    if attempt == times:
                        raise
                    print(f"  [retry] 等待 {wait:.2f}s 后重试...")
                    time.sleep(wait)
                    wait *= backoff
        return wrapper
    return decorator

call_count = 0
@retry(times=4, delay=0.05, backoff=2)
def flaky_api():
    """模拟不稳定的 API 调用"""
    global call_count
    call_count += 1
    if call_count < 3:
        raise ConnectionError("网络超时")
    return f"成功！第{call_count}次调用"

print(f"最终结果: {flaky_api()}")

print("\\n=== 3. @lru_cache 缓存装饰器 ===\\n")

@functools.lru_cache(maxsize=128)
def fibonacci(n):
    """带缓存的斐波那契"""
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(f"fibonacci(50) = {fibonacci(50)}")
print(f"缓存信息: {fibonacci.cache_info()}")

print("\\n=== 4. @log 日志装饰器 ===\\n")

def log(func):
    """日志装饰器：记录函数调用和返回值"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        arg_str = ", ".join([repr(a) for a in args] + [f"{k}={v!r}" for k, v in kwargs.items()])
        print(f"  [LOG] 调用 {func.__name__}({arg_str})")
        result = func(*args, **kwargs)
        print(f"  [LOG] {func.__name__} -> {result!r}")
        return result
    return wrapper

@log
def calculate_price(quantity, unit_price, discount=0):
    return quantity * unit_price * (1 - discount)

calculate_price(10, 99.5, discount=0.1)

print("\\n=== 5. @require_auth 权限校验装饰器 ===\\n")

class User:
    def __init__(self, name, is_admin=False):
        self.name = name
        self.is_admin = is_admin

def require_auth(admin_only=False):
    """权限校验装饰器"""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(user, *args, **kwargs):
            if not user:
                raise PermissionError("未登录")
            if admin_only and not user.is_admin:
                raise PermissionError(f"{user.name} 需要管理员权限")
            return func(user, *args, **kwargs)
        return wrapper
    return decorator

@require_auth(admin_only=True)
def delete_user(admin, target_id):
    return f"{admin.name} 删除了用户 {target_id}"

admin = User("超级管理员", is_admin=True)
guest = User("访客", is_admin=False)

print(f"管理员操作: {delete_user(admin, 1001)}")
try:
    delete_user(guest, 1001)
except PermissionError as e:
    print(f"权限拦截: {e}")

print("\\n=== 6. @rate_limit 频率限制装饰器 ===\\n")

def rate_limit(calls=3, period=1):
    """频率限制装饰器：滑动窗口算法"""
    def decorator(func):
        timestamps = deque()
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            now = time.time()
            while timestamps and timestamps[0] < now - period:
                timestamps.popleft()
            if len(timestamps) >= calls:
                sleep_time = period - (now - timestamps[0])
                print(f"  [rate_limit] 超限，等待 {sleep_time:.2f}s")
                time.sleep(sleep_time)
            timestamps.append(time.time())
            return func(*args, **kwargs)
        return wrapper
    return decorator

@rate_limit(calls=3, period=0.5)
def send_message(msg):
    return f"发送: {msg}"

print("--- 快速发送 5 条消息（限流 3 条/0.5s）---")
for i in range(5):
    print(f"  {send_message(f'消息{i+1}')}")

print("\\n=== 7. 类装饰器（CallCounter）===\\n")

class CallCounter:
    """类装饰器：统计函数调用次数"""
    def __init__(self, func):
        self.func = func
        self.count = 0
        functools.update_wrapper(self, func)
    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"  [counter] {self.func.__name__} 第 {self.count} 次调用")
        return self.func(*args, **kwargs)

@CallCounter
def greet(name):
    return f"Hello, {name}!"

greet("Alice")
greet("Bob")
print(f"总调用次数: {greet.count}")

print("\\n=== 8. 装饰器叠加顺序 ===\\n")

def make_decorator(name):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            print(f"  [{name}] 前置")
            result = func(*args, **kwargs)
            print(f"  [{name}] 后置")
            return result
        return wrapper
    return decorator

@make_decorator("A")
@make_decorator("B")
@make_decorator("C")
def demo():
    print("  --- 函数执行 ---")

print("叠加 @A @B @C（从下往上包装，从上往下执行）:")
demo()

print("\\n=== 最佳实践总结 ===")
print("1. 永远加 @functools.wraps(func) 保留元信息")
print("2. wrapper 用 *args, **kwargs 保持签名兼容")
print("3. 有返回值必须 return 原函数结果")
print("4. 带参数装饰器需要三层嵌套")
print("5. 复杂状态用类装饰器更清晰")`,
  },
  {
    id: "py6-generator-pipeline",
    group: "函数与并发进阶",
    icon: "🛢️",
    title: "生成器管道与数据流",
    content: `## 生成器管道与数据流

### 生成器管道概念

生成器管道（generator pipeline）是将多个生成器串联起来，像 Unix 管道一样逐级处理数据流。核心思想是**惰性求值**（lazy evaluation）：数据按需流转，不在内存中累积完整结果。

\`\`\`python
def read_lines(data):
    for line in data:
        yield line

def filter_empty(lines):
    for line in lines:
        if line.strip():
            yield line

def strip_lines(lines):
    for line in lines:
        yield line.strip()

# 管道串联：read → filter → strip
pipeline = strip_lines(filter_empty(read_lines(data)))
\`\`\`

### yield + yield from 组合

\`yield from\`（Python 3.3+）用于**委托给子生成器**，把一个生成器的所有产出"透传"给外层：

\`\`\`python
def sub_gen():
    yield 1
    yield 2

def main_gen():
    yield 0
    yield from sub_gen()  # 等价于 yield 1; yield 2
    yield 3

list(main_gen())  # [0, 1, 2, 3]
\`\`\`

\`yield from\` 的价值：
1. 扁平化嵌套生成器
2. 生成器之间的双向通信（send/throw）
3. 代码更简洁，避免显式 for 循环 yield

### 经典管道：读取 → 过滤 → 转换 → 聚合

\`\`\`python
def read_data(filename):
    with open(filename) as f:
        yield from f  # 逐行产出

def filter_lines(lines, keyword):
    for line in lines:
        if keyword in line:
            yield line

def parse_fields(lines):
    for line in lines:
        yield line.strip().split(",")

def sum_field(rows, index):
    total = 0
    for row in rows:
        total += float(row[index])
    yield total  # 最终聚合

# 管道：全程惰性，内存恒定
pipeline = sum_field(parse_fields(filter_lines(read_data("data.csv"), "ERROR")), 2)
result = next(pipeline)
\`\`\`

### 与 Unix 管道哲学的对比

Unix 管道：\`cat file | grep ERROR | awk '{print $3}' | sum\`
Python 生成器管道：\`sum_field(parse_fields(filter_lines(read_data(file))))\`

| 维度 | Unix 管道 | 生成器管道 |
|------|----------|-----------|
| 数据流 | 字节流 | Python 对象 |
| 进程间通信 | 管道（进程间） | 函数间（同进程） |
| 内存 | 流式，恒定 | 流式，恒定 |
| 类型安全 | 无 | 有 |
| 可组合性 | 强 | 强 |
| 调试 | strace/ltrace | pdb/print |

### itertools 在管道中的应用

\`itertools\` 模块提供了大量生成器管道工具：

- **chain(*iterables)**：串联多个迭代器
- **tee(iterable, n)**：复制迭代器（一变多）
- **islice(iterable, start, stop, step)**：切片
- **starmap(func, iterable)**：解包参数后调用
- **takewhile/dropwhile**：条件取/舍
- **groupby**：分组

\`\`\`python
from itertools import chain, islice, groupby

# 串联多个数据源
all_lines = chain(file1, file2, file3)
# 取前 100 行
first_100 = islice(all_lines, 100)
# 按 key 分组
for key, group in groupby(sorted(data, key=fn), key=fn):
    process(list(group))
\`\`\`

### 内存对比：列表 vs 生成器处理大文件

\`\`\`python
# 列表方式：全部加载到内存
lines = [line for line in open("big.log")]  # 10GB 文件 → 10GB 内存

# 生成器方式：逐行处理，内存恒定
for line in open("big.log"):  # 内存 ≈ 1 行
    process(line)
\`\`\`

| 处理方式 | 10GB 文件内存占用 | 速度 | 适用场景 |
|---------|-------------------|------|---------|
| read() 全读 | ~10GB | 快 | 小文件 |
| readlines() | ~10GB | 中 | 中等文件 |
| 逐行迭代 | ~几KB | 稳定 | 大文件 |
| 生成器管道 | ~几KB | 稳定 | 大文件+多步处理 |

### 协程管道（send 数据）

生成器不仅可以用 \`next()\` 拉取数据，还可以用 \`send()\` 推送数据，实现双向数据流：

\`\`\`python
def coroutine():
    while True:
        data = yield  # 接收 send 推送的数据
        print(f"处理: {data}")

c = coroutine()
next(c)        # 启动协程（prime）
c.send("A")    # 处理: A
c.send("B")    # 处理: B
\`\`\`

管道中的协程模式：

\`\`\`python
def producer(target):
    for item in data:
        target.send(item)

def filter_coroutine(target):
    while True:
        item = yield
        if condition(item):
            target.send(item)

def consumer():
    while True:
        item = yield
        print(f"消费: {item}")
\`\`\`

### 业务场景

1. **日志分析**：读取大日志文件 → 过滤 ERROR → 提取字段 → 统计聚合。
2. **ETL 数据处理**：抽取（read）→ 转换（transform）→ 加载（load），全程流式。
3. **流处理**：实时数据流（传感器、消息队列）的过滤、转换、聚合。
4. **CSV/JSON 处理**：逐行解析大型数据文件，避免 OOM。
5. **分页数据拉取**：生成器封装分页 API，对外暴露统一迭代器。

### 原理深入：生成器的执行机制

生成器函数遇到 \`yield\` 时**暂停执行**（挂起栈帧），\`next()\` 时从暂停处恢复。这使得生成器：
- **内存恒定**：不存储全部结果，只保留当前栈帧。
- **惰性求值**：只在需要时才计算下一个值。
- **可中断**：可以在任意 yield 处暂停。

> ⚠️ **避坑提示**：
> 1. 生成器只能迭代一次！需要多次遍历请用 \`list()\` 转换或 \`itertools.tee\` 复制。
> 2. 生成器管道中如果某一步抛异常，整个管道会中断。
> 3. \`yield from\` 不仅透传 yield，还透传 send/throw/close。

> 💡 **最佳实践**：处理大数据流时，优先用生成器管道而非列表推导。保持每个生成器职责单一（只做一件事），通过组合构建复杂管道。`,
    code: `# ========================================
# 生成器管道与数据流 演示
# ========================================
import itertools

print("=== 1. 生成器管道基础 ===\\n")

# 模拟数据源
raw_data = [
    "  Alice,25,engineer  ",
    "",
    "  Bob,30,manager  ",
    "  Charlie,22,  ",
    "  Diana,28,designer  ",
    "",
]

# 管道各阶段：每个生成器只做一件事
def read_lines(data):
    """阶段1：读取数据"""
    for line in data:
        yield line

def filter_empty(lines):
    """阶段2：过滤空行"""
    for line in lines:
        if line.strip():
            yield line

def strip_lines(lines):
    """阶段3：去除空白"""
    for line in lines:
        yield line.strip()

def parse_records(lines):
    """阶段4：解析为记录"""
    for line in lines:
        parts = line.split(",")
        if len(parts) == 3:
            yield {"name": parts[0], "age": int(parts[1]), "job": parts[2]}

# 串联管道：全程惰性求值
pipeline = parse_records(strip_lines(filter_empty(read_lines(raw_data))))
print("--- 管道处理结果 ---")
for record in pipeline:
    print(f"  {record}")

print("\\n=== 2. yield from 委托生成器 ===\\n")

def sub_generator():
    """子生成器"""
    yield 1
    yield 2
    yield 3

def main_generator():
    """主生成器：用 yield from 委托给子生成器"""
    yield 0
    yield from sub_generator()  # 透传子生成器的所有产出
    yield 4

print(f"yield from 结果: {list(main_generator())}")

# 扁平化嵌套列表
def flatten(nested):
    """递归展平嵌套结构"""
    for item in nested:
        if isinstance(item, (list, tuple)):
            yield from flatten(item)  # 递归委托
        else:
            yield item

nested = [1, [2, 3, [4, 5]], 6, [7, [8, [9]]]]
print(f"展平嵌套: {list(flatten(nested))}")

print("\\n=== 3. 经典管道：日志分析 ===\\n")

# 模拟日志数据
logs = [
    "2024-01-15 10:00:00 INFO  服务启动",
    "2024-01-15 10:01:00 ERROR 数据库连接失败",
    "2024-01-15 10:02:00 WARN  重试连接",
    "2024-01-15 10:03:00 ERROR 权限校验失败",
    "2024-01-15 10:04:00 INFO  恢复正常",
    "2024-01-15 10:05:00 ERROR 磁盘空间不足",
]

def filter_by_level(logs, level):
    """过滤指定级别日志"""
    for log in logs:
        if level in log:
            yield log

def extract_timestamp(logs):
    """提取时间戳"""
    for log in logs:
        yield log.split(" ")[0]

def count_by_key(items):
    """按 key 计数（聚合）"""
    counts = {}
    for item in items:
        counts[item] = counts.get(item, 0) + 1
    yield counts

# 管道：过滤 ERROR → 提取日期 → 按日期计数
error_logs = filter_by_level(logs, "ERROR")
dates = extract_timestamp(error_logs)
counter = count_by_key(dates)
result = next(counter)
print(f"ERROR 日志按日统计: {result}")

print("\\n=== 4. itertools 在管道中的应用 ===\\n")

# chain：串联多个数据源
list1 = [1, 2, 3]
list2 = [4, 5, 6]
list3 = [7, 8, 9]
chained = itertools.chain(list1, list2, list3)
print(f"chain 串联: {list(chained)}")

# islice：对生成器切片（无需 list 转换）
def infinite_counter():
    n = 0
    while True:
        yield n
        n += 1

first_5 = itertools.islice(infinite_counter(), 5)
print(f"islice 取前5: {list(first_5)}")

# takewhile：条件取值
evens = itertools.takewhile(lambda x: x < 10, infinite_counter())
print(f"takewhile <10: {list(evens)}")

# groupby：分组（需先排序）
students = [
    ("一班", "张三"), ("二班", "李四"),
    ("一班", "王五"), ("二班", "赵六"),
    ("一班", "钱七"),
]
students_sorted = sorted(students, key=lambda x: x[0])
print("--- groupby 分组 ---")
for cls, group in itertools.groupby(students_sorted, key=lambda x: x[0]):
    names = [s[1] for s in group]
    print(f"  {cls}: {names}")

print("\\n=== 5. 内存对比：列表 vs 生成器 ===\\n")

import sys

# 模拟大范围数据
big_range = range(1000000)

# 列表方式：全部加载到内存
big_list = [x for x in big_range]
list_size = sys.getsizeof(big_list) + sum(sys.getsizeof(x) for x in big_list[:10])

# 生成器方式：逐个产出，内存恒定
big_gen = (x for x in big_range)
gen_size = sys.getsizeof(big_gen)

print(f"100万数据列表内存: ~{list_size / 1024 / 1024:.1f} MB")
print(f"100万数据生成器内存: ~{gen_size} bytes")
print(f"内存节省: {list_size / gen_size:.0f} 倍")

print("\\n=== 6. 协程管道（send 数据）===\\n")

def coroutine(func):
    """协程启动装饰器：自动 prime"""
    def wrapper(*args, **kwargs):
        gen = func(*args, **kwargs)
        next(gen)  # 启动到第一个 yield
        return gen
    return wrapper

@coroutine
def filter_coroutine(target):
    """过滤协程：接收数据，符合条件的转发给 target"""
    while True:
        item = yield
        if item % 2 == 0:
            target.send(item)

@coroutine
def square_coroutine(target):
    """平方协程"""
    while True:
        item = yield
        target.send(item * item)

@coroutine
def printer_coroutine():
    """打印协程：管道末端"""
    results = []
    while True:
        item = yield
        results.append(item)
        if len(results) >= 3:
            print(f"  收集到: {results}")
            results.clear()

# 构建协程管道：filter → square → printer
print("--- 协程管道：偶数 → 平方 → 收集 ---")
printer = printer_coroutine()
squared = square_coroutine(printer)
filtered = filter_coroutine(squared)

for i in range(1, 7):
    filtered.send(i)

print("\\n=== 最佳实践总结 ===")
print("1. 大数据流处理优先用生成器管道，内存恒定")
print("2. 每个生成器职责单一，通过组合构建复杂管道")
print("3. yield from 简化嵌套生成器和委托")
print("4. 生成器只能迭代一次，需要重复用请转 list 或 tee")
print("5. itertools 是管道工具箱，chain/islice/groupby 最常用")`,
  },
  {
    id: "py6-coroutine",
    group: "函数与并发进阶",
    icon: "🔄",
    title: "协程基础（send/throw/close）",
    content: `## 协程基础（send/throw/close）

### 协程历史（PEP 342）

Python 协程起源于 **PEP 342**（Python 2.5），它为生成器增加了 \`send()\`、\`throw()\`、\`close()\` 方法，使生成器从单纯的数据生产者演变为可以接收数据的数据消费者——即"协程"。

注意：这里的"协程"指**基于生成器的协程**（generator-based coroutine），与现代 \`async def\` 协程不同。现代代码推荐用 \`async def\`，但理解生成器协程有助于掌握 Python 异步演进。

### 生成器演进为协程

普通生成器用 \`yield\` **产出**数据（生产者），协程用 \`yield\` **接收**数据（消费者）：

\`\`\`python
# 普通生成器（生产者）：yield 产出值
def generator():
    yield 1
    yield 2

# 协程（消费者）：yield 接收值
def coroutine():
    while True:
        data = yield  # 接收 send 推送的值
        print(f"收到: {data}")
\`\`\`

关键区别：\`yield\` 作为**表达式**（\`data = yield\`），其返回值来自 \`send()\`。

### yield 表达式的返回值

\`yield\` 既是语句也是表达式。作为表达式，它的返回值取决于调用方式：

| 调用方式 | yield 表达式的返回值 |
|---------|---------------------|
| \`next(gen)\` | \`None\` |
| \`gen.send(value)\` | \`value\` |
| \`gen.throw(exc)\` | 在 yield 处抛出异常 |

\`\`\`python
def demo():
    print("开始")
    x = yield 1   # next() → 返回 1，x = None；send(10) → 返回 1，x = 10
    print(f"x = {x}")
    y = yield 2
    print(f"y = {y}")
    return "结束"

g = demo()
print(next(g))      # 开始 → 1（yield 1 的值）
print(g.send(10))   # x = 10 → 2（yield 2 的值）
print(g.send(20))   # y = 20 → StopIteration: 结束
\`\`\`

### 协程状态

协程有三种状态，存储在 \`gi_frame.f_lasti\` 或通过 inspect 查看：

| 状态 | 说明 | 可执行操作 |
|------|------|-----------|
| \`GEN_CREATED\` | 已创建未启动 | 只能 next() 或 send(None) |
| \`GEN_SUSPENDED\` | 在 yield 处暂停 | 可 send() / throw() / close() |
| \`GEN_CLOSED\` | 已关闭 | 任何操作都报 StopIteration |

\`\`\`python
import inspect
g = demo()
print(inspect.getgeneratorstate(g))  # GEN_CREATED
next(g)
print(inspect.getgeneratorstate(g))  # GEN_SUSPENDED
g.close()
print(inspect.getgeneratorstate(g))  # GEN_CLOSED
\`\`\`

### .send(value) 推送数据

\`send()\` 向协程发送数据，\`yield\` 表达式接收该值并恢复执行：

\`\`\`python
def accumulator():
    total = 0
    while True:
        value = yield total  # 产出当前 total，接收新 value
        total += value

acc = accumulator()
next(acc)        # 启动（prime），返回初始 total=0
acc.send(10)     # total=10，返回 10
acc.send(20)     # total=30，返回 30
acc.send(5)      # total=35，返回 35
\`\`\`

> ⚠️ **避坑提示**：刚创建的协程处于 \`GEN_CREATED\` 状态，**不能直接 send(value)**，必须先用 \`next()\` 或 \`send(None)\` 启动（称为 "prime"）。否则报 \`TypeError: can't send non-None value to a just-started generator\`。

### .throw(exc) 抛异常

\`throw()\` 在协程当前暂停的 \`yield\` 处抛出异常。协程可以 try/except 捕获并处理：

\`\`\`python
def handler():
    while True:
        try:
            data = yield
            print(f"处理: {data}")
        except ValueError as e:
            print(f"捕获异常: {e}")

h = handler()
next(h)
h.send("A")              # 处理: A
h.throw(ValueError("坏数据"))  # 捕获异常: 坏数据
h.send("B")              # 处理: B（协程继续运行）
\`\`\`

### .close() 关闭协程

\`close()\` 在 yield 处抛出 \`GeneratorExit\`，协程应清理资源后退出：

\`\`\`python
def worker():
    try:
        while True:
            data = yield
            print(f"工作: {data}")
    except GeneratorExit:
        print("协程被关闭，清理资源...")

w = worker()
next(w)
w.send("任务1")
w.close()  # 协程被关闭，清理资源...
\`\`\`

> ⚠️ **避坑提示**：\`close()\` 抛出的 \`GeneratorExit\` 不能被捕获后继续 yield（会报 \`RuntimeError: generator ignored GeneratorExit\`）。如果捕获，只能清理资源然后 return。

### 用协程实现状态机

协程天然适合实现状态机——每个状态是一个协程，状态切换通过 \`yield from\` 委托：

\`\`\`python
def state_machine():
    state = "idle"
    while True:
        event = yield state
        if state == "idle" and event == "start":
            state = "running"
        elif state == "running" and event == "pause":
            state = "paused"
        elif state == "paused" and event == "resume":
            state = "running"
        elif event == "stop":
            state = "idle"
\`\`\`

### 业务场景

1. **生产者-消费者**：生产者 \`send\` 数据，消费者协程处理。
2. **数据管道**：多个协程串联，每个协程处理一个阶段。
3. **事件循环基础**：asyncio 的早期实现基于生成器协程。
4. **状态机**：游戏逻辑、协议解析、工作流。
5. **惰性计算**：按需推送数据，避免一次性加载。

### 生成器协程 vs async 协程

| 维度 | 生成器协程 | async def 协程 |
|------|-----------|---------------|
| 定义 | \`def\` + yield | \`async def\` |
| 推进 | send() | await |
| 引入 | PEP 342 (2.5) | PEP 492 (3.5) |
| 现状 | 过时，不推荐 | 主流，推荐 |
| 兼容 | @asyncio.coroutine（已废弃） | 原生支持 |

> 💡 **最佳实践**：现代代码用 \`async def\` 协程。理解生成器协程有助于掌握 asyncio 底层原理和 \`yield from\` 的委托机制。`,
    code: `# ========================================
# 协程基础（send/throw/close）演示
# ========================================
import inspect

print("=== 1. yield 表达式的返回值 ===\\n")

def demo():
    """演示 yield 作为表达式的返回值"""
    print("  协程启动")
    x = yield 1       # next() 时 x=None；send(10) 时 x=10
    print(f"  收到 x = {x}")
    y = yield 2       # send(20) 时 y=20
    print(f"  收到 y = {y}")
    return "协程结束"

g = demo()
print(f"next(g) → {next(g)}")        # 启动，yield 1 的值
print(f"g.send(10) → {g.send(10)}")  # x=10，yield 2 的值
try:
    g.send(20)                        # y=20，协程结束
except StopIteration as e:
    print(f"返回值: {e.value}")

print("\\n=== 2. 协程三状态 ===\\n")

def simple_coro():
    yield 1
    yield 2

g = simple_coro()
print(f"创建后: {inspect.getgeneratorstate(g)}")  # GEN_CREATED
next(g)
print(f"第一次 next: {inspect.getgeneratorstate(g)}")  # GEN_SUSPENDED
g.close()
print(f"close 后: {inspect.getgeneratorstate(g)}")  # GEN_CLOSED

print("\\n=== 3. send() 推送数据：累加器 ===\\n")

def accumulator():
    """累加器协程：持续接收数据并累加"""
    total = 0
    while True:
        value = yield total  # 产出当前 total，接收新 value
        total += value

acc = accumulator()
print(f"启动（prime）: {next(acc)}")  # 启动协程，返回初始 total=0
print(f"send(10) → {acc.send(10)}")  # total=10
print(f"send(20) → {acc.send(20)}")  # total=30
print(f"send(5)  → {acc.send(5)}")   # total=35
print(f"send(100)→ {acc.send(100)}") # total=135

print("\\n=== 4. send() 业务场景：数据处理管道 ===\\n")

def data_processor():
    """数据处理器：接收数据，转换后产出"""
    count = 0
    while True:
        data = yield count
        # 模拟数据处理：大写转换
        processed = data.upper()
        count += 1
        print(f"  处理第 {count} 条: '{data}' → '{processed}'")

processor = data_processor()
next(processor)  # prime
processor.send("hello")
processor.send("world")
processor.send("coroutine")

print("\\n=== 5. throw() 抛异常 ===\\n")

def error_handler():
    """带异常处理的协程"""
    while True:
        try:
            data = yield
            print(f"  处理: {data}")
        except ValueError as e:
            print(f"  ⚠ 捕获 ValueError: {e}，跳过该数据")
        except ZeroDivisionError as e:
            print(f"  ⚠ 捕获 ZeroDivisionError: {e}")

h = error_handler()
next(h)
h.send("数据A")
h.throw(ValueError, "数据格式错误")  # 在 yield 处抛异常
h.send("数据B")                       # 协程继续运行
h.throw(ZeroDivisionError, "除以零")
h.send("数据C")

print("\\n=== 6. close() 关闭协程 ===\\n")

def resource_worker():
    """模拟资源管理的协程"""
    print("  协程启动，申请资源")
    try:
        while True:
            data = yield
            print(f"  处理: {data}")
    except GeneratorExit:
        print("  收到 close()，释放资源...")

w = resource_worker()
next(w)
w.send("任务1")
w.send("任务2")
w.close()  # 触发 GeneratorExit
print("  协程已关闭")

print("\\n=== 7. 用协程实现状态机 ===\\n")

def state_machine():
    """订单状态机：idle → running → paused → done"""
    state = "idle"
    print(f"  初始状态: {state}")
    while True:
        event = yield state
        old_state = state
        if state == "idle" and event == "start":
            state = "running"
        elif state == "running" and event == "pause":
            state = "paused"
        elif state == "paused" and event == "resume":
            state = "running"
        elif state == "running" and event == "finish":
            state = "done"
        elif event == "reset":
            state = "idle"
        else:
            print(f"  ⚠ 非法转换: {state} + {event}")
            continue
        print(f"  {old_state} --{event}--> {state}")

sm = state_machine()
next(sm)  # prime
sm.send("start")
sm.send("pause")
sm.send("resume")
sm.send("finish")
sm.send("reset")

print("\\n=== 8. 生产者-消费者模式 ===\\n")

def consumer():
    """消费者协程"""
    total = 0
    while True:
        item = yield
        if item is None:  # 结束信号
            print(f"  消费者：消费完毕，总计 {total}")
            break
        total += item
        print(f"  消费者：消费 {item}，累计 {total}")

def producer(consumer_coro, items):
    """生产者：生产数据并发送给消费者"""
    for item in items:
        print(f"  生产者：生产 {item}")
        try:
            consumer_coro.send(item)
        except StopIteration:
            return
    try:
        consumer_coro.send(None)  # 发送结束信号
    except StopIteration:
        pass

c = consumer()
next(c)  # prime
producer(c, [10, 20, 30, 40])

print("\\n=== 9. 避坑：未 prime 直接 send ===\\n")

def unstarted():
    while True:
        data = yield
        print(f"  收到: {data}")

bad = unstarted()
try:
    bad.send("data")  # 报错：协程未启动
except TypeError as e:
    print(f"  ⚠ 错误: {e}")
    print("  正确做法：先 next(gen) 启动协程")

print("\\n=== 最佳实践总结 ===")
print("1. 协程必须先 prime（next 或 send(None)）才能 send(value)")
print("2. throw() 可在 yield 处抛异常，协程可 try/except 捕获")
print("3. close() 抛 GeneratorExit，不能捕获后继续 yield")
print("4. 协程适合状态机、数据管道、生产者-消费者")
print("5. 现代代码用 async def，生成器协程主要用于理解原理")`,
  },
  {
    id: "py6-concurrent-futures",
    group: "函数与并发进阶",
    icon: "🌐",
    title: "concurrent.futures 线程池与进程池",
    content: `## concurrent.futures 线程池与进程池

### 模块概览

\`concurrent.futures\`（Python 3.2+）是 Python 标准库的高层并发 API，提供统一的**线程池**和**进程池**接口，屏蔽了底层 \`threading\` 和 \`multiprocessing\` 的复杂细节。

核心两个类：
- **ThreadPoolExecutor**：线程池，适合 IO 密集型（网络请求、文件读写）
- **ProcessPoolExecutor**：进程池，适合 CPU 密集型（数值计算、图像处理）

\`\`\`python
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

with ThreadPoolExecutor(max_workers=4) as executor:
    future = executor.submit(func, arg1, arg2)
    result = future.result()
\`\`\`

### submit() vs map()

| 方法 | 返回值 | 特点 | 适用场景 |
|------|--------|------|---------|
| \`submit(func, *args)\` | 单个 Future | 异步提交，可链式回调 | 不同函数/不同参数 |
| \`map(func, iterable)\` | 迭代器（按顺序） | 批量提交，按输入顺序返回 | 相同函数批量处理 |
| \`as_completed(futures)\` | 迭代器（完成顺序） | 谁先完成谁先返回 | 不关心顺序，追求最快响应 |

\`\`\`python
# submit：灵活，可提交不同函数
futures = [executor.submit(func, arg) for arg in args]
for future in as_completed(futures):
    print(future.result())

# map：简洁，按顺序返回
results = list(executor.map(func, args))
\`\`\`

### Future 对象

\`Future\` 是对异步操作结果的封装：

| 方法 | 说明 |
|------|------|
| \`result(timeout=None)\` | 获取结果（阻塞，可超时） |
| \`exception()\` | 获取异常（无异常返回 None） |
| \`done()\` | 是否完成 |
| \`cancelled()\` | 是否已取消 |
| \`cancel()\` | 尝试取消（未开始才能取消） |
| \`add_done_callback(fn)\` | 完成后回调 |

### as_completed() 与 wait()

\`as_completed(futures)\`：返回一个迭代器，哪个 Future 先完成就先 yield 哪个。

\`wait(futures, return_when=ALL_COMPLETED)\`：阻塞等待，支持三种模式：
- \`ALL_COMPLETED\`：全部完成（默认）
- \`FIRST_COMPLETED\`：任一完成
- \`FIRST_EXCEPTION\`：任一异常

\`\`\`python
from concurrent.futures import wait, FIRST_COMPLETED

futures = [executor.submit(task, i) for i in range(10)]
done, not_done = wait(futures, return_when=FIRST_COMPLETED)
print(f"第一个完成: {done.pop().result()}")
\`\`\`

### 线程池 vs 进程池

| 维度 | ThreadPoolExecutor | ProcessPoolExecutor |
|------|-------------------|---------------------|
| 并发单位 | 线程 | 进程 |
| GIL 限制 | 受限（同时只一个执行 Python） | 不受限（各进程独立 GIL） |
| 内存共享 | 共享（注意线程安全） | 不共享（需序列化传输） |
| 启动开销 | 小 | 大 |
| 适合场景 | IO 密集型 | CPU 密集型 |
| 参数限制 | 无 | 必须可 pickle |
| 全局变量 | 直接共享 | 各进程独立副本 |

### 业务场景

1. **批量 HTTP 请求**：线程池并发请求多个 URL（IO 密集型）。
2. **批量图像处理**：进程池并行处理图片缩放/滤镜（CPU 密集型）。
3. **批量文件读写**：线程池并发读取多个文件。
4. **数据库批量查询**：线程池并发查询多个分片。
5. **数值计算并行**：进程池加速矩阵运算、科学计算。

### max_workers 设置建议

- **IO 密集型**：\`max_workers = min(32, os.cpu_count() * 5)\`（Python 3.8+ 默认）
- **CPU 密集型**：\`max_workers = os.cpu_count()\` 或 \`os.cpu_count() + 1\`
- **经验法则**：IO 密集型可以远多于 CPU 核数（等待时让出 GIL）；CPU 密集型不要超过核数（多了反而增加切换开销）

> ⚠️ **避坑提示**：
> 1. 进程池的参数和返回值必须可 pickle（不能传 lambda、不能传连接对象）。
> 2. 线程池中不要执行 CPU 密集任务（GIL 导致无法真正并行）。
> 3. \`with\` 语句会在退出时调用 \`shutdown(wait=True)\`，确保所有任务完成。
> 4. \`map()\` 按输入顺序返回结果，如果某个任务异常，整个 map 会抛异常。

### with 语句自动关闭

\`Executor\` 实现了上下文管理器协议，\`with\` 退出时自动 \`shutdown(wait=True)\`：

\`\`\`python
with ThreadPoolExecutor(max_workers=4) as executor:
    executor.submit(task)
# 退出 with 块时自动等待所有任务完成
\`\`\`

### 原理深入：线程池如何绕过 GIL

Python 的 GIL（全局解释器锁）同一时刻只允许一个线程执行 Python 字节码。但 IO 操作（socket.read、file.read、time.sleep）会**释放 GIL**，所以线程池在 IO 密集型场景能真正并发。

CPU 密集型任务受 GIL 限制，多线程无法并行——这时必须用进程池，每个进程有独立 GIL。

> 💡 **最佳实践**：
> - IO 密集型 → \`ThreadPoolExecutor\`
> - CPU 密集型 → \`ProcessPoolExecutor\`
> - 不确定时先测线程池，不够再换进程池
> - 永远用 \`with\` 管理执行器生命周期`,
    code: `# ========================================
# concurrent.futures 线程池与进程池 演示
# ========================================
import time
import os
from concurrent.futures import (
    ThreadPoolExecutor, ProcessPoolExecutor,
    as_completed, wait, FIRST_COMPLETED
)

print("=== 1. ThreadPoolExecutor 基础（submit）===\\n")

def fetch_url(url, delay=0.3):
    """模拟网络请求（IO 密集型）"""
    time.sleep(delay)  # 模拟网络延迟
    return f"来自 {url} 的响应（耗时 {delay}s）"

# 串行执行
print("--- 串行执行 3 个请求 ---")
start = time.time()
for url in ["url-A", "url-B", "url-C"]:
    print(f"  {fetch_url(url)}")
print(f"  串行总耗时: {time.time() - start:.2f}s")

# 线程池并行执行
print("--- 线程池并行 3 个请求 ---")
start = time.time()
with ThreadPoolExecutor(max_workers=3) as executor:
    future_a = executor.submit(fetch_url, "url-A")
    future_b = executor.submit(fetch_url, "url-B")
    future_c = executor.submit(fetch_url, "url-C")
    # result() 阻塞等待结果
    print(f"  {future_a.result()}")
    print(f"  {future_b.result()}")
    print(f"  {future_c.result()}")
print(f"  并行总耗时: {time.time() - start:.2f}s（应约为单次耗时）")

print("\\n=== 2. map() 批量处理 ===\\n")

urls = [f"url-{i}" for i in range(5)]
delays = [0.1, 0.3, 0.2, 0.4, 0.15]

print("--- map 按顺序返回结果 ---")
start = time.time()
with ThreadPoolExecutor(max_workers=5) as executor:
    # map 按输入顺序返回（不是完成顺序）
    results = executor.map(fetch_url, urls, delays)
    for url, result in zip(urls, results):
        print(f"  {url} → {result}")
print(f"  总耗时: {time.time() - start:.2f}s")

print("\\n=== 3. as_completed() 谁先完成谁先返回 ===\\n")

print("--- as_completed 完成顺序 ---")
start = time.time()
with ThreadPoolExecutor(max_workers=5) as executor:
    futures = {executor.submit(fetch_url, url, delay): url
               for url, delay in zip(urls, delays)}
    for future in as_completed(futures):
        url = futures[future]
        result = future.result()
        print(f"  {url} 完成: {result}")
print(f"  总耗时: {time.time() - start:.2f}s（最慢的决定总时间）")

print("\\n=== 4. Future 对象详解 ===\\n")

with ThreadPoolExecutor(max_workers=2) as executor:
    future = executor.submit(fetch_url, "test-url", 0.1)

    print(f"  提交后 done(): {future.done()}")
    print(f"  提交后 cancelled(): {future.cancelled()}")

    result = future.result(timeout=5)  # 带超时等待
    print(f"  result(): {result}")
    print(f"  完成后 done(): {future.done()}")
    print(f"  exception(): {future.exception()}")  # None 表示无异常

    # 模拟异常任务
    def failing_task():
        raise ValueError("模拟任务失败")
    bad_future = executor.submit(failing_task)
    try:
        bad_future.result()
    except ValueError as e:
        print(f"  异常任务 exception(): {e}")

print("\\n=== 5. add_done_callback 回调 ===\\n")

def on_complete(future):
    """任务完成回调"""
    try:
        print(f"  [回调] 任务完成: {future.result()}")
    except Exception as e:
        print(f"  [回调] 任务失败: {e}")

with ThreadPoolExecutor(max_workers=2) as executor:
    future = executor.submit(fetch_url, "callback-url", 0.1)
    future.add_done_callback(on_complete)  # 注册回调
    # 主线程可以继续做其他事

print("\\n=== 6. wait() 等待策略 ===\\n")

with ThreadPoolExecutor(max_workers=5) as executor:
    futures = [executor.submit(fetch_url, f"wait-{i}", 0.1 + i * 0.05)
               for i in range(4)]

    print("--- FIRST_COMPLETED：任一完成即返回 ---")
    done, not_done = wait(futures, return_when=FIRST_COMPLETED)
    print(f"  完成数: {len(done)}, 未完成数: {len(not_done)}")
    for f in done:
        print(f"  第一个完成: {f.result()}")

    print("--- 等待全部完成 ---")
    done, not_done = wait(futures)
    print(f"  完成数: {len(done)}, 未完成数: {len(not_done)}")

print("\\n=== 7. ProcessPoolExecutor（CPU 密集型）===\\n")

def cpu_heavy(n):
    """CPU 密集型任务：计算平方和"""
    return sum(i * i for i in range(n))

def demo_process_pool():
    """进程池演示：需在 __main__ 保护下运行，避免 spawn 模式下重复导入导致死循环"""
    # 串行 vs 进程池
    numbers = [5000000, 5000000, 5000000, 5000000]
    cpu_count = os.cpu_count()
    print(f"CPU 核心数: {cpu_count}")

    print("--- 串行执行 CPU 密集任务 ---")
    start = time.time()
    results_serial = [cpu_heavy(n) for n in numbers]
    print(f"  串行结果: {results_serial}")
    print(f"  串行耗时: {time.time() - start:.2f}s")

    print("--- 进程池并行执行 ---")
    start = time.time()
    with ProcessPoolExecutor(max_workers=min(4, cpu_count)) as executor:
        results_parallel = list(executor.map(cpu_heavy, numbers))
    print(f"  并行结果: {results_parallel}")
    print(f"  并行耗时: {time.time() - start:.2f}s")

if __name__ == '__main__':
    demo_process_pool()

print("\\n=== 8. 业务场景：批量文件处理 ===\\n")

def process_file(filename):
    """模拟文件处理"""
    time.sleep(0.1)  # 模拟 IO
    return f"已处理 {filename}，大小 {len(filename) * 100} bytes"

files = [f"document_{i}.txt" for i in range(8)]

print("--- 线程池批量处理文件 ---")
start = time.time()
with ThreadPoolExecutor(max_workers=4) as executor:
    futures = {executor.submit(process_file, f): f for f in files}
    for future in as_completed(futures):
        print(f"  {future.result()}")
print(f"  总耗时: {time.time() - start:.2f}s")

print("\\n=== 最佳实践总结 ===")
print("1. IO 密集型用 ThreadPoolExecutor，CPU 密集型用 ProcessPoolExecutor")
print("2. submit 灵活，map 简洁，as_completed 不关心顺序")
print("3. 永远用 with 管理执行器，自动 shutdown")
print("4. 进程池参数和返回值必须可 pickle")
print("5. max_workers: IO 型可多于核数，CPU 型等于核数")`,
  },
  {
    id: "py6-asyncio-advanced",
    group: "函数与并发进阶",
    icon: "⚡",
    title: "asyncio 进阶（Queue/Event/Lock/信号量）",
    content: `## asyncio 进阶（Queue/Event/Lock/信号量）

### asyncio 同步原语概览

asyncio 提供了一套与 \`threading\` 平行的同步原语，但**不是线程安全**的，仅在 asyncio 事件循环内使用。它们的共同特点是：\`await\` 而非阻塞。

| 原语 | threading 对应 | 用途 |
|------|---------------|------|
| \`asyncio.Lock\` | \`threading.Lock\` | 互斥访问共享资源 |
| \`asyncio.Event\` | \`threading.Event\` | 事件通知（一对多） |
| \`asyncio.Condition\` | \`threading.Condition\` | 条件变量（等待+通知） |
| \`asyncio.Semaphore\` | \`threading.Semaphore\` | 限制并发数 |
| \`asyncio.Queue\` | \`queue.Queue\` | 协程间安全传递数据 |

### asyncio.Lock 互斥锁

\`Lock\` 确保同一时刻只有一个协程访问共享资源：

\`\`\`python
lock = asyncio.Lock()
async def safe_update():
    async with lock:  # 获取锁（await 而非阻塞）
        # 临界区：只有一个协程能进入
        shared_state += 1
\`\`\`

\`async with lock\` 是推荐写法（自动释放），也可以手动 \`await lock.acquire()\` / \`lock.release()\`。

### asyncio.Event 事件

\`Event\` 用于"通知"——一个协程设置事件，其他协程等待事件：

\`\`\`python
event = asyncio.Event()
async def waiter():
    await event.wait()  # 等待事件被 set
    print("事件触发！")
async def setter():
    await asyncio.sleep(1)
    event.set()  # 触发事件
\`\`\`

与 \`threading.Event\` 区别：asyncio 版本的 \`wait()\` 是 \`await\` 的，不阻塞线程。

### asyncio.Condition 条件变量

\`Condition\` 结合了 Lock 和 Event，支持更复杂的等待/通知模式：

\`\`\`python
condition = asyncio.Condition()
async def consumer():
    async with condition:
        await condition.wait()  # 释放锁并等待
        # 被唤醒后重新获取锁
async def producer():
    async with condition:
        condition.notify_all()  # 唤醒所有等待者
\`\`\`

### asyncio.Semaphore 信号量（限流）

\`Semaphore\` 限制同时访问的协程数量，是**并发限流**的核心工具：

\`\`\`python
sem = asyncio.Semaphore(5)  # 最多 5 个并发
async def fetch(url):
    async with sem:  # 超过 5 个会等待
        async with session.get(url) as resp:
            return await resp.text()
\`\`\`

### asyncio.Queue 队列

\`Queue\` 实现协程间安全的数据传递，是**生产者-消费者模式**的基础：

\`\`\`python
queue = asyncio.Queue(maxsize=10)
async def producer():
    await queue.put(item)  # 队列满时 await 等待
async def consumer():
    item = await queue.get()  # 队列空时 await 等待
    queue.task_done()  # 标记任务完成
\`\`\`

### 生产者-消费者模式

\`\`\`python
async def producer(queue, items):
    for item in items:
        await queue.put(item)
    await queue.put(None)  # 哨兵，表示结束

async def consumer(queue):
    while True:
        item = await queue.get()
        if item is None:
            break
        process(item)
        queue.task_done()

queue = asyncio.Queue()
await asyncio.gather(
    producer(queue, data),
    consumer(queue)
)
\`\`\`

### gather vs wait vs as_completed

| API | 返回值 | 特点 | 异常处理 |
|-----|--------|------|---------|
| \`gather(*coros)\` | 结果列表（按顺序） | 高层 API，自动调度 | 默认任一异常全部取消 |
| \`wait(coros)\` | (done, pending) 集合 | 底层 API，可控制返回条件 | 不自动抛异常 |
| \`as_completed(coros)\` | 迭代器（完成顺序） | 谁先完成谁先返回 | result() 时抛异常 |

\`\`\`python
# gather：最常用，按顺序返回结果
results = await asyncio.gather(coro1, coro2, coro3)

# wait：更灵活，可指定 return_when
done, pending = await asyncio.wait(
    [coro1, coro2, coro3],
    return_when=asyncio.FIRST_COMPLETED
)

# as_completed：按完成顺序处理
for coro in asyncio.as_completed([coro1, coro2, coro3]):
    result = await coro
\`\`\`

### 业务场景

1. **爬虫限流**：\`Semaphore\` 控制并发请求数，避免被封 IP。
2. **并发请求池**：\`gather\` + \`Semaphore\` 批量请求 API。
3. **生产者-消费者**：\`Queue\` 解耦数据生产和消费。
4. **事件通知**：\`Event\` 实现启动信号、关闭信号。
5. **资源互斥**：\`Lock\` 保护共享状态（如连接池计数）。

### 死锁避免

asyncio 中死锁的常见原因和预防：

| 死锁原因 | 预防方法 |
|---------|---------|
| 锁嵌套（A 持有锁 1 等锁 2，B 持有锁 2 等锁 1） | 统一锁顺序 |
| Queue 满了 put，空了 get（互相等待） | 设置 maxsize + timeout |
| Semaphore 循环依赖 | 避免嵌套信号量 |
| 未 await 的协程（创建但没调度） | 必须 await 或 create_task |

> ⚠️ **避坑提示**：
> 1. asyncio 同步原语**不是线程安全**的，只能在同一个事件循环内使用。
> 2. \`Lock\` 获取后必须释放，推荐 \`async with\`。
> 3. \`Queue.get()\` 和 \`put()\` 可能永久阻塞，生产环境建议加 \`timeout\`。
> 4. \`gather\` 默认任一任务异常就抛出，其他任务被取消。用 \`return_exceptions=True\` 可改为收集异常。

> 💡 **最佳实践**：
> - 限流用 \`Semaphore\`，不要用 \`Lock + 计数器\`（容易出错）。
> - 生产者-消费者用 \`Queue\`，不要用共享列表 + \`sleep\` 轮询。
> - 永远用 \`async with\` 管理锁和信号量。
> - \`gather\` 加 \`return_exceptions=True\` 避免一个失败全部取消。`,
    code: `# ========================================
# asyncio 进阶（Queue/Event/Lock/信号量）演示
# ========================================
import asyncio
import time

print("=== 1. asyncio.Lock 互斥锁 ===\\n")

async def lock_demo():
    """演示 Lock 保护共享资源"""
    shared_counter = 0
    lock = asyncio.Lock()

    async def increment(name, times):
        nonlocal shared_counter
        for _ in range(times):
            async with lock:  # 获取锁（await 不阻塞线程）
                current = shared_counter
                await asyncio.sleep(0.0001)  # 模拟异步操作
                shared_counter = current + 1

    # 不加锁会丢失更新，加锁后结果正确
    await asyncio.gather(
        increment("A", 100),
        increment("B", 100),
        increment("C", 100),
    )
    print(f"  期望 300，实际: {shared_counter}")

asyncio.run(lock_demo())

print("\\n=== 2. asyncio.Event 事件通知 ===\\n")

async def event_demo():
    """演示 Event 实现启动信号"""
    event = asyncio.Event()

    async def waiter(name):
        print(f"  {name} 等待启动信号...")
        await event.wait()  # 等待事件触发
        print(f"  {name} 收到信号，开始工作！")

    async def starter():
        await asyncio.sleep(0.3)
        print("  [启动器] 发送启动信号！")
        event.set()  # 触发事件，所有 wait() 返回

    # 多个 waiter 等待同一个事件
    await asyncio.gather(
        waiter("服务A"), waiter("服务B"), waiter("服务C"),
        starter()
    )

asyncio.run(event_demo())

print("\\n=== 3. asyncio.Semaphore 信号量限流 ===\\n")

async def semaphore_demo():
    """演示 Semaphore 限制并发数"""
    sem = asyncio.Semaphore(3)  # 最多 3 个并发
    active = 0
    max_active = 0

    async def fetch(url):
        nonlocal active, max_active
        async with sem:  # 超过 3 个会等待
            active += 1
            max_active = max(max_active, active)
            print(f"  开始 {url}（当前并发 {active}）")
            await asyncio.sleep(0.1)  # 模拟网络请求
            active -= 1
            return f"完成 {url}"

    urls = [f"url-{i}" for i in range(8)]
    results = await asyncio.gather(*[fetch(u) for u in urls])
    print(f"  最大并发数: {max_active}（限制为 3）")
    print(f"  完成数: {len(results)}")

asyncio.run(semaphore_demo())

print("\\n=== 4. asyncio.Queue 生产者-消费者 ===\\n")

async def queue_demo():
    """演示 Queue 实现生产者-消费者"""
    queue = asyncio.Queue(maxsize=5)

    async def producer(name, items):
        for item in items:
            await queue.put(item)  # 队列满时 await 等待
            print(f"  [生产者{name}] 生产: {item}")
            await asyncio.sleep(0.05)
        await queue.put(None)  # 哨兵：表示结束

    async def consumer(name):
        processed = 0
        while True:
            item = await queue.get()  # 队列空时 await 等待
            if item is None:
                queue.task_done()
                break  # 收到结束信号
            print(f"  [消费者{name}] 消费: {item}")
            processed += 1
            await asyncio.sleep(0.08)
            queue.task_done()
        return processed

    # 2 个生产者 + 2 个消费者
    await asyncio.gather(
        producer("P1", ["A1", "A2", "A3"]),
        producer("P2", ["B1", "B2", "B3"]),
        consumer("C1"),
        consumer("C2"),
    )

asyncio.run(queue_demo())

print("\\n=== 5. gather vs wait vs as_completed ===\\n")

async def comparison_demo():
    async def task(name, delay):
        await asyncio.sleep(delay)
        return f"{name}({delay}s)"

    # gather：按顺序返回结果
    print("--- gather（按顺序返回）---")
    results = await asyncio.gather(
        task("A", 0.3), task("B", 0.1), task("C", 0.2)
    )
    print(f"  结果: {results}")

    # wait：返回 done/pending 集合
    print("--- wait（返回集合）---")
    done, pending = await asyncio.wait([
        asyncio.create_task(task("A", 0.3)),
        asyncio.create_task(task("B", 0.1)),
        asyncio.create_task(task("C", 0.2)),
    ])
    print(f"  完成数: {len(done)}")

    # as_completed：按完成顺序返回
    print("--- as_completed（完成顺序）---")
    tasks = [task("A", 0.3), task("B", 0.1), task("C", 0.2)]
    for coro in asyncio.as_completed(tasks):
        result = await coro
        print(f"  完成: {result}")

asyncio.run(comparison_demo())

print("\\n=== 6. gather 异常处理 ===\\n")

async def exception_demo():
    async def good_task(name):
        await asyncio.sleep(0.1)
        return f"{name} 成功"

    async def bad_task():
        await asyncio.sleep(0.15)
        raise ValueError("任务失败！")

    # 默认：任一异常，全部取消
    print("--- 默认行为（任一异常即抛出）---")
    try:
        await asyncio.gather(good_task("A"), bad_task(), good_task("B"))
    except ValueError as e:
        print(f"  捕获异常: {e}")

    # return_exceptions=True：异常作为结果返回
    print("--- return_exceptions=True（收集异常）---")
    results = await asyncio.gather(
        good_task("A"), bad_task(), good_task("B"),
        return_exceptions=True
    )
    for r in results:
        if isinstance(r, Exception):
            print(f"  异常: {r}")
        else:
            print(f"  结果: {r}")

asyncio.run(exception_demo())

print("\\n=== 7. 业务场景：并发爬虫限流 ===\\n")

async def crawler_demo():
    """模拟爬虫：Semaphore 限流 + Queue 任务队列"""
    sem = asyncio.Semaphore(3)  # 最多 3 个并发
    results = []

    async def crawl(url):
        async with sem:
            print(f"  开始爬取 {url}")
            await asyncio.sleep(0.15)  # 模拟请求
            result = f"<html>{url}</html>"
            results.append(result)
            print(f"  完成 {url}")
            return result

    urls = [f"https://example.com/page/{i}" for i in range(6)]
    start = time.time()
    await asyncio.gather(*[crawl(u) for u in urls])
    elapsed = time.time() - start
    print(f"  爬取 {len(urls)} 页，并发限制 3，总耗时 {elapsed:.2f}s")
    print(f"  （串行需 {len(urls) * 0.15:.2f}s）")

asyncio.run(crawler_demo())

print("\\n=== 8. asyncio.Condition 条件变量 ===\\n")

async def condition_demo():
    """演示 Condition 实现等待/通知"""
    condition = asyncio.Condition()
    ready = False

    async def waiter(name):
        async with condition:
            while not ready:
                print(f"  {name} 等待条件满足...")
                await condition.wait()
            print(f"  {name} 条件满足，继续执行")

    async def setter():
        nonlocal ready
        await asyncio.sleep(0.2)
        async with condition:
            ready = True
            print("  [setter] 条件满足，通知所有等待者")
            condition.notify_all()

    await asyncio.gather(waiter("W1"), waiter("W2"), setter())

asyncio.run(condition_demo())

print("\\n=== 最佳实践总结 ===")
print("1. 限流用 Semaphore，互斥用 Lock，通知用 Event")
print("2. 生产者-消费者用 Queue，永远 async with 管理锁")
print("3. gather 最常用，加 return_exceptions=True 防全取消")
print("4. asyncio 同步原语不是线程安全的，只在事件循环内用")
print("5. 避免死锁：统一锁顺序，Queue 设 maxsize + timeout")`,
  },
  {
    id: "py6-async-sync-bridge",
    group: "函数与并发进阶",
    icon: "🌉",
    title: "异步与同步代码桥接",
    content: `## 异步与同步代码桥接

### 桥接的两个方向

异步与同步代码混合时，面临两个方向的桥接：

1. **同步 → 异步**：在同步代码中调用 async 函数（如 Flask 中用 asyncio 库）
2. **异步 → 同步**：在 async 函数中调用同步阻塞代码（如 asyncio 中用 requests）

| 方向 | 场景 | 解决方案 |
|------|------|---------|
| 同步 → 异步 | 在 Flask/Django 调 async 库 | \`asyncio.run()\` |
| 异步 → 同步 | 在 asyncio 调阻塞代码 | \`run_in_executor()\` / \`to_thread()\` |
| 多线程 → 协程 | 子线程中调度协程 | \`run_coroutine_threadsafe()\` |

### 同步代码调用异步：asyncio.run()

\`asyncio.run(coro)\`（Python 3.7+）是同步代码调用协程的标准方式：创建事件循环、运行协程、关闭循环。

\`\`\`python
# 同步代码
def sync_function():
    result = asyncio.run(async_function())  # 调用协程
    return result

# 异步代码
async def async_function():
    await asyncio.sleep(1)
    return "done"
\`\`\`

> ⚠️ **避坑提示**：\`asyncio.run()\` 每次调用都会创建**新的事件循环**。不能在已有事件循环内调用 \`asyncio.run()\`（会报 \`RuntimeError: asyncio.run() cannot be called from a running event loop\`）。

### 异步代码中调用同步阻塞：run_in_executor

在 async 函数中直接调用同步阻塞函数（如 \`time.sleep\`、\`requests.get\`）会**阻塞整个事件循环**，导致所有协程都无法执行。正确做法是用 \`run_in_executor\` 把阻塞函数放到线程池：

\`\`\`python
import asyncio
import requests

async def fetch(url):
    loop = asyncio.get_event_loop()
    # 把阻塞的 requests.get 放到线程池执行
    resp = await loop.run_in_executor(None, requests.get, url)
    return resp.text
\`\`\`

\`None\` 表示使用默认线程池（\`ThreadPoolExecutor\`），也可以传入自定义执行器。

### asyncio.to_thread（Python 3.9+）

\`asyncio.to_thread()\`（Python 3.9+）是 \`run_in_executor\` 的简化版，更符合直觉：

\`\`\`python
# 3.9+ 推荐写法
result = await asyncio.to_thread(blocking_function, arg1, arg2)

# 等价于（3.8 及更早）
loop = asyncio.get_event_loop()
result = await loop.run_in_executor(None, blocking_function, arg1, arg2)
\`\`\`

\`to_thread\` 的优势：
- 支持 keyword 参数（\`run_in_executor\` 不支持，需用 \`partial\`）
- 语法更简洁
- 语义更清晰（"把函数放到线程中运行"）

\`\`\`python
# to_thread 支持 kwargs
result = await asyncio.to_thread(func, arg1, arg2, kw1=val1)

# run_in_executor 不支持 kwargs，需 partial
from functools import partial
result = await loop.run_in_executor(None, partial(func, arg1, arg2, kw1=val1))
\`\`\`

### loop.run_in_executor 自定义执行器

可以传入自定义的 \`ThreadPoolExecutor\` 或 \`ProcessPoolExecutor\`：

\`\`\`python
from concurrent.futures import ThreadPoolExecutor

# 自定义线程池大小
executor = ThreadPoolExecutor(max_workers=4)
loop = asyncio.get_event_loop()
result = await loop.run_in_executor(executor, blocking_func, arg)

# 进程池（CPU 密集型阻塞任务）
from concurrent.futures import ProcessPoolExecutor
proc_executor = ProcessPoolExecutor()
result = await loop.run_in_executor(proc_executor, cpu_heavy_func, arg)
\`\`\`

### 在多线程中调度协程：run_coroutine_threadsafe

当需要从**其他线程**向事件循环提交协程时，用 \`asyncio.run_coroutine_threadsafe(coro, loop)\`：

\`\`\`python
import asyncio
import threading

async def async_task():
    await asyncio.sleep(1)
    return "done"

# 主线程运行事件循环
loop = asyncio.new_event_loop()

def worker():
    # 从子线程向主线程的事件循环提交协程
    future = asyncio.run_coroutine_threadsafe(async_task(), loop)
    result = future.result(timeout=5)  # 阻塞等待结果
    print(f"子线程得到结果: {result}")

# 启动事件循环线程
threading.Thread(target=loop.run_forever).start()
threading.Thread(target=worker).start()
\`\`\`

### 业务场景

#### 场景 1：Flask/Django 同步框架中用异步库

\`\`\`python
# Flask 中调用 asyncio 库（如 aiohttp）
from flask import Flask
import asyncio

app = Flask(__name__)

async def async_fetch(url):
    # 模拟异步操作
    await asyncio.sleep(0.1)
    return f"data from {url}"

@app.route("/")
def index():
    # 同步路由中调用协程
    result = asyncio.run(async_fetch("https://api.example.com"))
    return result
\`\`\`

#### 场景 2：异步框架中用同步数据库驱动

\`\`\`python
# asyncio 中用同步的 sqlite3 / psycopg2
import asyncio
import sqlite3

async def query_db():
    def sync_query():
        conn = sqlite3.connect("db.sqlite")
        cursor = conn.execute("SELECT * FROM users")
        return cursor.fetchall()
    # 放到线程池避免阻塞事件循环
    return await asyncio.to_thread(sync_query)
\`\`\`

#### 场景 3：CPU 密集型任务在 asyncio 中执行

\`\`\`python
async def process_data(data):
    def cpu_heavy(d):
        return sum(i * i for i in range(d))
    # CPU 密集型放到进程池（不是线程池，避免 GIL）
    loop = asyncio.get_running_loop()
    from concurrent.futures import ProcessPoolExecutor
    with ProcessPoolExecutor() as pool:
        result = await loop.run_in_executor(pool, cpu_heavy, data)
    return result
\`\`\`

### 阻塞调用的识别与包装

常见的阻塞调用：

| 类型 | 示例 | 包装方式 |
|------|------|---------|
| 网络 IO | \`requests.get\`、\`urllib\` | \`to_thread\` 或换 \`aiohttp\` |
| 文件 IO | \`open().read()\`、\`os.listdir\` | \`to_thread\` 或 \`aiofiles\` |
| 数据库 | \`sqlite3\`、\`psycopg2\` | \`to_thread\` 或异步驱动 |
| CPU 计算 | 大循环、数值计算 | 进程池 \`run_in_executor\` |
| sleep | \`time.sleep\` | 换 \`asyncio.sleep\` |
| 子进程 | \`subprocess.run\` | \`asyncio.create_subprocess_exec\` |

> 💡 **原则**：优先使用原生异步库（\`aiohttp\` > \`requests\`，\`aiomysql\` > \`pymysql\`），没有异步替代品时才用 \`to_thread\` 包装。

### 性能与并发权衡

\`\`\`python
# 错误：阻塞事件循环
async def bad():
    time.sleep(1)  # 所有协程都被阻塞！

# 正确：放到线程池
async def good():
    await asyncio.to_thread(time.sleep, 1)  # 不阻塞事件循环
\`\`\`

| 方案 | 并发能力 | CPU 利用 | 适用 |
|------|---------|---------|------|
| 原生异步库 | 高（万级并发） | 低 | IO 密集，有异步库 |
| to_thread 包装 | 中（百级并发） | 中 | IO 密集，无异步库 |
| 进程池 | 低（十级） | 高 | CPU 密集型 |

### 原理深入：为什么阻塞调用会卡死事件循环

asyncio 事件循环是**单线程**的，通过 IO 多路复用（epoll/kqueue）切换协程。如果一个协程调用阻塞函数（如 \`time.sleep\`），整个线程被阻塞，事件循环无法切换到其他协程。

\`run_in_executor\` 的原理：把阻塞函数提交到**单独的线程池**，事件循环继续运行其他协程。当线程池中的函数完成后，通过 future 通知事件循环恢复等待的协程。

> ⚠️ **避坑提示**：
> 1. 不要在 async 函数中直接调用 \`time.sleep\`、\`requests.get\` 等阻塞函数。
> 2. \`asyncio.run()\` 不能在已有事件循环内调用。
> 3. \`to_thread\` 是 Python 3.9+，老版本用 \`run_in_executor\` + \`partial\`。
> 4. \`run_coroutine_threadsafe\` 返回的是 \`concurrent.futures.Future\`，不是 asyncio Future。

> 💡 **最佳实践**：
> - 优先用原生异步库，其次用 \`to_thread\` 包装。
> - CPU 密集型用进程池，IO 阻塞型用线程池。
> - 同步框架中用 \`asyncio.run()\` 调协程，注意不要在协程内嵌套 \`run()\`。
> - 多线程→协程用 \`run_coroutine_threadsafe\`。`,
    code: `# ========================================
# 异步与同步代码桥接 演示
# ========================================
import asyncio
import time
import threading
from functools import partial
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

print("=== 1. 同步调用异步：asyncio.run() ===\\n")

async def async_fetch_data(url):
    """模拟异步获取数据"""
    print(f"  [异步] 请求 {url}")
    await asyncio.sleep(0.2)  # 异步等待
    return f"数据来自 {url}"

def sync_caller():
    """同步函数中调用协程"""
    print("  [同步] 调用异步函数...")
    result = asyncio.run(async_fetch_data("https://api.example.com"))
    print(f"  [同步] 收到结果: {result}")
    return result

sync_caller()

print("\\n=== 2. 异步调用同步阻塞：to_thread（3.9+）===\\n")

def blocking_io_task(task_id, duration=0.2):
    """模拟同步阻塞 IO 操作"""
    print(f"  [阻塞IO-{task_id}] 开始执行...")
    time.sleep(duration)  # 阻塞！
    print(f"  [阻塞IO-{task_id}] 完成")
    return f"结果-{task_id}"

async def async_with_blocking():
    """异步函数中调用阻塞函数"""
    # 错误做法：直接调用会阻塞事件循环
    # blocking_io_task("bad")

    # 正确做法 1：to_thread（Python 3.9+）
    print("--- to_thread 包装阻塞函数 ---")
    start = time.time()
    results = await asyncio.gather(
        asyncio.to_thread(blocking_io_task, "A"),
        asyncio.to_thread(blocking_io_task, "B"),
        asyncio.to_thread(blocking_io_task, "C"),
    )
    print(f"  3 个并发，耗时 {time.time() - start:.2f}s（阻塞 0.2s）")
    return results

asyncio.run(async_with_blocking())

print("\\n=== 3. run_in_executor（3.8 及更早）===\\n")

async def run_in_executor_demo():
    """用 run_in_executor 包装阻塞函数"""
    loop = asyncio.get_event_loop()

    # 无参数的阻塞函数
    def simple_block():
        time.sleep(0.1)
        return "完成"

    print("--- 无参数阻塞函数 ---")
    result = await loop.run_in_executor(None, simple_block)
    print(f"  结果: {result}")

    # 带位置参数
    print("--- 带位置参数 ---")
    result = await loop.run_in_executor(None, blocking_io_task, "X", 0.1)
    print(f"  结果: {result}")

    # 带 keyword 参数（必须用 partial）
    def task_with_kwargs(task_id, delay=0.1, tag="default"):
        time.sleep(delay)
        return f"{task_id}:{tag}"

    print("--- 带 kwargs（用 partial）---")
    result = await loop.run_in_executor(
        None, partial(task_with_kwargs, "Y", tag="custom")
    )
    print(f"  结果: {result}")

asyncio.run(run_in_executor_demo())

print("\\n=== 4. 自定义执行器 ===\\n")

# 模块级函数：进程池要求函数可 pickle，局部函数（闭包内）无法 pickle
def cpu_task(n):
    return sum(i * i for i in range(n))

async def custom_executor_demo():
    """使用自定义线程池和进程池"""
    # 自定义线程池（IO 密集型）
    thread_pool = ThreadPoolExecutor(max_workers=4)
    loop = asyncio.get_event_loop()

    def io_task(n):
        time.sleep(0.1)
        return f"IO任务{n}完成"

    print("--- 自定义线程池（IO 密集型）---")
    start = time.time()
    results = await asyncio.gather(*[
        loop.run_in_executor(thread_pool, io_task, i) for i in range(4)
    ])
    print(f"  结果: {results}")
    print(f"  耗时: {time.time() - start:.2f}s")

    thread_pool.shutdown()

    # 进程池（CPU 密集型）
    print("--- 进程池（CPU 密集型）---")
    proc_pool = ProcessPoolExecutor(max_workers=2)
    start = time.time()
    results = await asyncio.gather(*[
        loop.run_in_executor(proc_pool, cpu_task, 2000000) for _ in range(2)
    ])
    print(f"  结果: {[r for r in results]}")
    print(f"  耗时: {time.time() - start:.2f}s")

    proc_pool.shutdown()

if __name__ == '__main__':
    asyncio.run(custom_executor_demo())

print("\\n=== 5. 多线程中调度协程 ===\\n")

def multithread_coroutine_demo():
    """从子线程向事件循环提交协程"""
    loop = asyncio.new_event_loop()

    async def async_work(task_id):
        await asyncio.sleep(0.1)
        return f"协程{task_id}完成"

    def worker(task_id):
        """子线程：向主线程的事件循环提交协程"""
        print(f"  [子线程] 提交协程 {task_id}")
        future = asyncio.run_coroutine_threadsafe(
            async_work(task_id), loop
        )
        result = future.result(timeout=5)  # 阻塞等待结果
        print(f"  [子线程] 收到结果: {result}")

    # 启动事件循环线程
    loop_thread = threading.Thread(target=loop.run_forever, daemon=True)
    loop_thread.start()

    # 启动工作线程
    workers = [threading.Thread(target=worker, args=(i,)) for i in range(3)]
    for w in workers:
        w.start()
    for w in workers:
        w.join()

    # 停止事件循环
    loop.call_soon_threadsafe(loop.stop)
    loop_thread.join()
    loop.close()
    print("  事件循环已关闭")

multithread_coroutine_demo()

print("\\n=== 6. 业务场景：Flask 中用异步库 ===\\n")

# 模拟 Flask 同步框架中调用异步函数
class MockFlask:
    """模拟 Flask 应用"""
    def route(self, path):
        def decorator(func):
            self.routes = getattr(self, 'routes', {})
            self.routes[path] = func
            return func
        return decorator

app = MockFlask()

async def async_db_query(user_id):
    """模拟异步数据库查询"""
    await asyncio.sleep(0.1)
    return {"id": user_id, "name": f"用户{user_id}"}

async def async_cache_get(key):
    """模拟异步缓存查询"""
    await asyncio.sleep(0.05)
    return f"cached:{key}"

@app.route("/user/<id>")
def get_user(user_id):
    """同步路由中调用多个协程"""
    # 用 asyncio.run 在同步函数中执行协程
    async def _fetch():
        cache, user = await asyncio.gather(
            async_cache_get(f"user:{user_id}"),
            async_db_query(user_id),
        )
        return {"cache": cache, "user": user}

    return asyncio.run(_fetch())

result = app.routes["/user/<id>"]("12345")
print(f"  Flask 路由结果: {result}")

print("\\n=== 7. 避坑：阻塞事件循环的对比 ===\\n")

async def blocking_comparison():
    """对比阻塞 vs 非阻塞对并发的影响"""
    async def good_task(name, delay):
        await asyncio.sleep(delay)  # 异步 sleep
        return f"{name}完成"

    def bad_sleep(name, delay):
        time.sleep(delay)  # 阻塞 sleep
        return f"{name}完成"

    print("--- 正确：asyncio.sleep（不阻塞）---")
    start = time.time()
    results = await asyncio.gather(
        good_task("A", 0.1), good_task("B", 0.1), good_task("C", 0.1)
    )
    print(f"  并发3个，耗时 {time.time() - start:.2f}s（应≈0.1s）")

    print("--- 错误：time.sleep 直接调用（阻塞事件循环）---")
    start = time.time()
    results = await asyncio.gather(
        asyncio.to_thread(bad_sleep, "A", 0.1),
        asyncio.to_thread(bad_sleep, "B", 0.1),
        asyncio.to_thread(bad_sleep, "C", 0.1),
    )
    print(f"  用 to_thread 包装，耗时 {time.time() - start:.2f}s")
    print("  如果直接 time.sleep() 会串行执行，耗时 0.3s")

asyncio.run(blocking_comparison())

print("\\n=== 最佳实践总结 ===")
print("1. 同步调异步用 asyncio.run()，但不能嵌套在事件循环内")
print("2. 异步调阻塞用 to_thread(3.9+) 或 run_in_executor")
print("3. CPU 密集型用进程池，IO 阻塞型用线程池")
print("4. 优先用原生异步库，其次才用 to_thread 包装")
print("5. 多线程→协程用 run_coroutine_threadsafe")`,
  },
];
