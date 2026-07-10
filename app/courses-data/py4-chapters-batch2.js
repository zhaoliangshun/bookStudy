// =============================================================
// Batch 2：控制流（4 章）
// 5. py4-if-else      if/elif/else、三元、条件表达式
// 6. py4-loops         for/while/break/continue/range/enumerate/zip
// 7. py4-match         match-case 模式匹配（3.10+）
// 8. py4-bool          布尔运算、短路、truthy/falsy、比较运算符
// =============================================================

export const chapters = [
  {
    id: "py4-if-else",
    group: "控制流",
    icon: "🔀",
    title: "if / elif / else、三元表达式",
    content: `
## 概念解释

\`if / elif / else\` 是 Python 的条件分支语句，根据布尔表达式的真假选择执行不同的代码块。三元表达式 \`x if cond else y\` 则是表达式形式的条件判断，有返回值。

\`\`\`python
if 条件1:           # if 开头，条件为 True 时执行下方代码块
    执行体1          # 4 空格缩进表示属于 if 分支
elif 条件2:         # 上一条件为 False 才判断；elif 是独立关键字，不是 else if
    执行体2
else:               # 所有条件都不满足时的兜底分支，可省略
    执行体3
\`\`\`

核心要点：Python 用 \`elif\` 而不是 \`else if\`——这是一个**独立关键字**，不是两个词的组合。

## 设计原理

### 为什么是 \`elif\` 而不是 \`else if\`？

C/Java 的 \`else if\` 本质是 \`else { if {...} }\` 的嵌套，靠大括号消歧。Python 靠缩进划分块，若用 \`else if\` 会强制多一层缩进，写多了变成"阶梯"。引入 \`elif\` 关键字后，所有分支处于同一缩进层级，可读性更好。这个设计继承自 ABC 语言（Python 的前辈）。

### 条件表达式为什么自动转 bool？

\`if\` 接受任意表达式，内部调用 \`bool(x)\` 转换。这避免了 C 那样 \`if (x)\` 只能是数值的束缚，让 \`if my_list:\`（判空）、\`if obj:\`（判 None）等写法非常自然。

### 为什么 Python 长期没有 switch？

0.x 到 3.9 整整约 30 年 Python 都没有 \`switch\`。Guido 的理由：
1. \`if/elif/else\` 已经够用，字典分发 \`{key: func}\` 也能模拟等值分发；
2. C 的 switch 默认 fall-through（穿透），忘写 \`break\` 是经典 bug 源；
3. 没有比 if/elif 更优雅的语义值得引入。

直到 3.10 才引入 \`match-case\`，但它本质是"结构模式匹配"，能力远超 switch（见 py4-match 章）。

## 使用场景

- **多分支互斥判断**（成绩分级、状态分支）：用 if/elif/else
- **二选一赋值**：用三元表达式 \`x if cond else y\`
- **5 个以上等值分支**：考虑字典分发，或 3.10+ 用 match-case
- **避免使用**：嵌套超过 3 层的 if——应提前 return、抽函数、或用字典

## 代码逐行讲解

\`\`\`python
score = 85

# 基础 if/elif/else
if score >= 90:        # 第一条件，先判断；冒号不能省
    grade = "A"        # 缩进 4 空格，表示属于 if 块
elif score >= 80:      # 上面为假才到这里；elif 是独立关键字
    grade = "B"
elif score >= 60:      # 继续向下兜底
    grade = "C"
else:                  # 所有条件都不满足时的兜底
    grade = "F"
print(f"score={score}, grade={grade}")   # f-string 格式化输出
\`\`\`

注意 \`elif\` 和 \`else\` 必须跟在 \`if\` 或上一个 \`elif\` 之后，不能单独出现；\`else\` 可省略。

\`\`\`python
# 多条件同时判断
x, y = 5, 15
if x > 0 and y > 0:        # 两个都为真
    print("both positive")
elif x > 0 or y > 0:       # 至少一个为真
    print("at least one positive")
\`\`\`

\`and\` / \`or\` 是逻辑运算符（不是 \`&&\` / \`||\`），有短路特性，详见 py4-bool 章。

\`\`\`python
# 三元表达式（条件表达式）
result = "pass" if score >= 60 else "fail"
# 等价于：
# if score >= 60:
#     result = "pass"
# else:
#     result = "fail"
\`\`\`

三元是**表达式**（有返回值），可出现在赋值右侧、函数参数里。\`x if cond else y\` 的读法："cond 为真取 x，否则取 y"——注意条件在中间，和 C 的 \`cond ? x : y\` 顺序不同。

\`\`\`python
# 嵌套三元（不推荐，但偶尔有用）
parity = "even" if x % 2 == 0 else ("odd-pos" if x > 0 else "odd-neg")
# 外层先判奇偶，奇数时再判正负；括号仅辅助可读性
\`\`\`

外层先判奇偶，奇数时再判正负。括号只是辅助可读性，不影响语义。**嵌套超过一层就别用三元**，改成 if/else 语句更清晰，调试也方便。

## 对比

| 特性 | if/elif/else | C/Java switch | Python match-case (3.10+) |
|------|--------------|---------------|---------------------------|
| 分支依据 | 任意布尔表达式 | 等值匹配 | 模式匹配（结构、字面量、类型） |
| fall-through | 无 | 默认穿透，需 break | 无 |
| 默认分支 | else | default | case _ |
| 适合场景 | 范围判断、复杂条件 | 等值分发 | 结构化解构、类型分支 |

## 易错点小结

| 坑 | 错误写法 | 正确做法 |
|----|----------|----------|
| 写成 \`else if\` | \`else if x:\` | \`elif x:\` |
| 忘记冒号 | \`if x > 0\` | \`if x > 0:\` |
| 缩进混用 | 一会 2 空格一会 4 空格 | 全程 4 空格（PEP8） |
| 三元当语句用 | \`if cond: x else y\` | \`x if cond else y\` |
| 嵌套过深 | 5 层 if 套 if | 提前 return / 字典分发 / match-case |
| 比较用 \`=\` | \`if x = 5:\` | \`if x == 5:\`（赋值是 \`=\`，比较是 \`==\`） |
`,
    code: `score = 85

# 基础 if/elif/else
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 60:
    grade = "C"
else:
    grade = "F"
print(f"score={score}, grade={grade}")

# 多条件同时判断
x, y = 5, 15
if x > 0 and y > 0:
    print("both positive")
elif x > 0 or y > 0:
    print("at least one positive")

# 三元表达式
result = "pass" if score >= 60 else "fail"
print(result)

# 嵌套三元（不推荐，但偶尔有用）
parity = "even" if x % 2 == 0 else ("odd-pos" if x > 0 else "odd-neg")
print(parity)
`,
  },
  {
    id: "py4-loops",
    group: "控制流",
    icon: "🔁",
    title: "for / while / range / enumerate / zip",
    content: `
## 概念解释

Python 的循环有两套：\`for\` 遍历可迭代对象（iterable），\`while\` 按条件重复。核心配套工具有 \`range\`（惰性整数序列）、\`enumerate\`（带索引）、\`zip\`（并行遍历）、\`break\` / \`continue\` / \`for...else\`（流程控制）。

\`\`\`python
for 元素 in 可迭代对象:   # for 遍历可迭代对象（list/str/dict 等），每次取一个元素
    循环体               # 循环体用 4 空格缩进；无下标概念，直接拿元素
while 条件:               # while 按条件重复，条件为 True 就继续执行循环体
    循环体               # 注意：需在循环体内改变条件，否则死循环
\`\`\`

## 设计原理

### Python for 和 C for 的本质区别

C 的 \`for (int i=0; i<n; i++)\` 是**计数器循环**：维护一个下标，按步长递增，按下标访问数组。

Python 的 \`for x in iterable:\` 是**迭代器循环**：调用 \`iter(iterable)\` 拿到迭代器，反复 \`next()\` 取元素，直到抛出 \`StopIteration\`。**没有下标概念**，自然支持列表、字典、文件、生成器等任意可迭代对象。

这是 Python "鸭子类型"哲学的体现：只要对象实现 \`__iter__\` 或 \`__getitem__\`，就能被 for 遍历，无需关心内部结构。

### 为什么 range 是惰性的？

\`range(10**10)\` 几乎不占内存——它不预生成 100 亿个数，只在被 \`next()\` 时按公式算下一个。这避免了 Python2 \`xrange\` vs \`range\` 的内存坑，Python3 统一为惰性 \`range\`。

### 为什么有 \`for...else\`？

\`for...else\` 的 else 在循环**正常结束**（没 break）时执行。典型场景：在循环里找东西，找到了 break，没找到走 else 兜底。比加一个 \`found\` 标志变量更优雅。

## 使用场景

- **遍历集合**：\`for x in list/dict/str\`
- **按次数循环**：\`for i in range(n)\`
- **要索引**：\`for i, x in enumerate(seq)\`
- **并行多个序列**：\`for a, b in zip(s1, s2)\`
- **不确定次数的条件循环**：\`while cond\`（如读文件、轮询）
- **避免**：在 for 里用 \`range(len(seq))\` 再下标访问——直接 \`for x in seq\` 或 \`enumerate\`

## 代码逐行讲解

\`\`\`python
# for + range
for i in range(3):        # range(3) 生成 0,1,2（不含 3）
    print("i =", i)

# 步长
print("range step 2:", list(range(0, 10, 2)))   # 0,2,4,6,8；list() 强制求值
\`\`\`

\`range(start, stop, step)\` 三个参数：start 默认 0，step 默认 1，stop **不含**。负步长可倒序：\`range(5, 0, -1)\` → 5,4,3,2,1。

\`\`\`python
# enumerate + zip
names = ["alice", "bob", "carol"]
ages = [30, 25, 28]
for idx, name in enumerate(names, start=1):   # start=1 让索引从 1 开始
    print(f"{idx}. {name}")
for name, age in zip(names, ages):            # 配对取元素
    print(f"{name} is {age}")
\`\`\`

\`enumerate\` 返回 \`(索引, 元素)\` 元组。\`zip\` 按最短序列截断（长的部分被丢弃），想保留全长用 \`itertools.zip_longest\`。

\`\`\`python
# while + break/continue
n = 0
while n < 10:              # 条件为真就继续
    n += 1
    if n % 2 == 0:         # 偶数跳过
        continue           # 跳到下一次循环判断
    if n > 7:              # 超过 7 就退出
        break              # 立即跳出整个循环
    print("odd:", n)       # 只打印 1,3,5,7
\`\`\`

\`continue\` 跳过本次剩余语句进入下一次判断；\`break\` 直接终止循环。注意 \`n += 1\` 必须在 continue 之前，否则偶数会死循环。

\`\`\`python
# for...else：正常结束才执行
for x in [1, 3, 5]:
    if x == 100:
        break
else:
    print("not found")  # 会执行，因为没有 break
\`\`\`

else 块**仅在循环没被 break 时执行**。这里没找到 100，没 break，所以 else 执行；如果循环里 break 触发了，else 就不执行。这是 Python 最反直觉的语法之一，但用在"搜索"场景很顺手。

\`\`\`python
# reversed / sorted
print(list(reversed(range(5))))              # 4,3,2,1,0；reversed 返回迭代器
print(sorted([3, 1, 4, 1, 5], reverse=True)) # 5,4,3,1,1；返回新列表
\`\`\`

\`reversed(seq)\` 返回惰性迭代器，不修改原序列。\`sorted(seq)\` 返回新列表，原数据不变；\`list.sort()\` 才是原地排序。

## 对比

| 特性 | for | while |
|------|-----|-------|
| 适用 | 已知迭代对象/次数 | 不确定次数，靠条件 |
| 典型场景 | 遍历集合、range 计数 | 读到 EOF、轮询、游戏主循环 |
| 死循环风险 | 低（迭代完就停） | 高（忘改条件） |
| 配套 | range/enumerate/zip | 通常配合 break |

| 特性 | range | 普通列表 |
|------|-------|----------|
| 内存 | O(1)（惰性） | O(n) |
| 元素 | 整数 | 任意 |
| 可重复遍历 | 是（每次新迭代器） | 是 |

## 易错点小结

| 坑 | 错误写法 | 正确做法 |
|----|----------|----------|
| 用下标遍历 | \`for i in range(len(s)): s[i]\` | \`for x in s\` 或 \`enumerate\` |
| 忘了 range 不含 stop | \`range(1, 10)\` 期望含 10 | 记住含 start 不含 stop |
| continue 前忘改计数器 | while 死循环 | 先 \`n += 1\` 再判断 continue |
| 误以为 else 是条件分支 | \`for...else\` 当成 if else | else 是"正常结束才执行" |
| 边遍历边改列表 | \`for x in lst: lst.remove(x)\` | 遍历副本 \`for x in lst[:]\` 或用推导式 |
| zip 截断没察觉 | 长短序列 zip 丢数据 | 用 \`zip_longest\` |
| reversed 当列表用 | \`reversed([1,2]).append(3)\` | 先 \`list(reversed(...))\` |
`,
    code: `# for + range
for i in range(3):
    print("i =", i)

# 步长
print("range step 2:", list(range(0, 10, 2)))

# enumerate + zip
names = ["alice", "bob", "carol"]
ages = [30, 25, 28]
for idx, name in enumerate(names, start=1):
    print(f"{idx}. {name}")
for name, age in zip(names, ages):
    print(f"{name} is {age}")

# while + break/continue
n = 0
while n < 10:
    n += 1
    if n % 2 == 0:
        continue
    if n > 7:
        break
    print("odd:", n)

# for...else：正常结束才执行
for x in [1, 3, 5]:
    if x == 100:
        break
else:
    print("not found")  # 会执行

# reversed / sorted
print(list(reversed(range(5))))
print(sorted([3, 1, 4, 1, 5], reverse=True))
`,
  },
  {
    id: "py4-match",
    group: "控制流",
    icon: "🧩",
    title: "match-case：结构模式匹配",
    content: `
## 概念解释

\`match-case\` 是 Python 3.10（2021 年）引入的**结构模式匹配**（Structural Pattern Matching），PEP 634 提出。它远不止是 switch——它能在匹配的同时**解构**数据，把字面量、序列、映射、类对象、OR 模式都作为匹配目标。

\`\`\`python
match 主语:                      # match 后跟要匹配的表达式（3.10+ 新语法）
    case 模式1:                  # case 尝试匹配模式，命中则执行并跳出（无 fall-through）
        执行体1
    case 模式2 if 守卫条件:       # if 附加守卫条件，模式匹配且条件为真才执行
        执行体2
    case _:                      # _ 是通配符，匹配任意值（类似 switch 的 default）
        默认执行体
\`\`\`

## 设计原理

### 3.10 引入的背景

之前 Python 多分支判断只能用 if/elif 链，处理嵌套结构（JSON、dataclass、元组）时尤其啰嗦，需要层层 \`isinstance\` + 取字段 + 再判断。match-case 借鉴 Rust / Scala / Erlang，**一次匹配 + 解构**，把"判断类型 + 拆字段 + 条件"三步合一。

### 和 switch 的本质区别

最关键的能力是**模式绑定**：\`case [x, y]:\` 不仅匹配长度 2 的列表，还把元素绑定到 \`x\`、\`y\`，后续可直接用。switch 只能做等值匹配，做不到解构。

### 为什么 demo 同时给 3.9 兼容写法和 3.10+ 写法？

3.10 之前的解释器（含 3.9、3.8）遇到 \`match\` 关键字会**直接语法报错**。为了让这份代码在任意 Python 版本都能跑，作者先用 if/elif + isinstance 模拟出等价逻辑（可运行），再把 3.10+ 的 match-case 写法放在注释里展示。这是教学场景的常见妥协：兼容性优先，但要让读者看到新语法的样子。

## 可匹配的模式一览

- **字面量模式**：\`case 0:\`、\`case "echo":\`
- **序列模式**：\`case [x, y]:\`、\`case [a, *rest]:\`（解构列表/元组）
- **映射模式**：\`case {"action": "echo", "msg": msg}:\`（解构字典，多余键被忽略）
- **类模式**：\`case Point(x=0, y=0):\`（按类型 + 字段匹配）
- **OR 模式**：\`case 1 | 2 | 3:\`（任一匹配）
- **通配符**：\`case _:\`（匹配任意，不绑定，必须放最后）
- **guard 守卫**：\`case X if cond:\`（匹配成功后再加条件）
- **as 绑定**：\`case ["left" | "right" as d, n]:\`（把 OR 匹配结果整体命名）

## 使用场景

- **解析结构化数据**（JSON、AST、协议消息）：match-case 一把梭
- **类型分支**（不同 dataclass 子类走不同逻辑）
- **替代冗长 if/elif 链**（5 个以上分支）
- **避免**：Python 3.9 及以下环境（语法不支持）；简单二选一用 if/else 更轻

## 代码逐行讲解

\`\`\`python
from dataclasses import dataclass
import sys

@dataclass            # 自动生成 __init__、__eq__、__repr__ 等
class Point:
    x: int
    y: int
\`\`\`

\`@dataclass\` 装饰器让类自动有构造器和比较方法，后面 match-case 才能 \`case Point(x=0, y=0)\` 这样匹配字段。

\`\`\`python
# === 3.9 兼容写法：用 if/elif 模拟 match-case（可运行）===
def describe(shape):
    if isinstance(shape, list) and len(shape) == 2:    # 判断是 list 且长度 2
        x, y = shape                                    # 解构赋值，把两元素分别给 x, y
        if x == 0 and y == 0:
            return "origin"                             # 原点
        if y == 0:
            return f"x-axis at {x}"                     # 在 x 轴上
        if x == 0:
            return f"y-axis at {y}"                     # 在 y 轴上
        return f"point ({x}, {y})"                      # 普通点
    if isinstance(shape, list) and len(shape) == 2 and shape[0] in ("left", "right"):
        direction, n = shape                            # 解构出方向和步数
        return f"move {direction} {n}"
    if isinstance(shape, Point):                        # 类型判断：是否 Point 实例
        if shape.x == 0 and shape.y == 0:
            return "Point at origin"
        if shape.x == shape.y:
            return f"diagonal ({shape.x},{shape.y})"    # 在对角线上
        return f"Point({shape.x},{shape.y})"
    if isinstance(shape, dict) and shape.get("action") == "echo":   # 字典匹配 action 字段
        return f"echo: {shape.get('msg')}"
    return "unknown"                                    # 兜底返回
\`\`\`

这段 if/elif 链模拟了 match-case 的全部能力：序列长度、元素解构、字面量判断、类型分支、字典字段。注意每一步都要手动 \`isinstance\` + 取字段，**啰嗦且易错**——这正是 match-case 要解决的痛点。

\`\`\`python
tests = [
    [0, 0], [3, 0], [5, 5],                             # 列表测试用例
    Point(0, 0), Point(2, 3), Point(4, 4),              # Point 实例用例
    ["left", 10], {"action": "echo", "msg": "hi"},      # 方向命令、字典用例
]
for t in tests:
    print(f"{str(t):45} -> {describe(t)}")   # :45 字段宽度，左对齐补空格
\`\`\`

构造一批测试用例覆盖各种模式：列表、Point、字典。\`:45\` 是 f-string 的字段宽度，对齐输出。

\`\`\`python
# === 3.10+ match-case 写法（仅在 Python 3.10+ 运行，此处注释展示）===
# def describe(shape):
#     match shape:
#         case [0, 0]: return "origin"                              # 字面量序列
#         case [x, 0]: return f"x-axis at {x}"                      # 序列模式 + 绑定
#         case [0, y]: return f"y-axis at {y}"
#         case [x, y]: return f"point ({x}, {y})"
#         case ["left" | "right" as direction, n]: return f"move {direction} {n}"   # OR 模式 + as 绑定
#         case Point(x=0, y=0): return "Point at origin"            # 类模式 + 字面量
#         case Point(x=x, y=y) if x == y: return f"diagonal ({x},{y})"   # 类模式 + guard 守卫
#         case Point(x=x, y=y): return f"Point({x},{y})"
#         case {"action": "echo", "msg": msg}: return f"echo: {msg}"  # 映射（字典）模式
#         case _: return "unknown"                                  # 通配符，必须放最后
\`\`\`

对比两版代码，3.10+ 版本每行只做一件事，**不再需要 isinstance 和手动取字段**。要点：
- \`case [x, y]:\` 序列模式自动解构，小写名是变量（绑定），\`0\` 这种字面量是匹配值
- \`"left" | "right"\` 是 OR 模式，匹配任一；\`as direction\` 把匹配结果整体绑定
- \`case Point(x=x, y=y)\` 类模式：\`x=x\` 左边是字段名，右边是绑定变量名
- \`if x == y\` 是 guard 守卫，匹配成功后再加条件
- \`case _\` 通配符匹配任意，**必须放最后**（\`_\` 不绑定变量）

## 对比

| 写法 | 行数 | 可读性 | 兼容性 |
|------|------|--------|--------|
| if/elif + isinstance | 多 | 啰嗦，类型判断和解构分离 | 全版本 |
| match-case | 少 | 清晰，匹配即解构 | 3.10+ |
| 字典分发 | 最少 | 只能等值匹配，不能解构 | 全版本 |

| 维度 | C/Java switch | Python match-case |
|------|---------------|-------------------|
| 匹配对象 | 字面量等值 | 模式（结构、类型、字面量） |
| 能否解构 | 不能 | 能（绑定变量） |
| fall-through | 默认穿透 | 无 |
| 守卫 | 无 | \`case X if cond\` |
| 通配符 | default | \`case _\` |

## 易错点小结

| 坑 | 错误/误解 | 正确做法 |
|----|-----------|----------|
| 大写名当变量 | \`case [X, Y]:\` 会被当成字面量 | 变量用小写或下划线开头 |
| 通配符位置 | \`case _\` 放中间 | 必须放最后，否则后面分支永不执行 |
| 忘了 guard 语法 | \`case X if cond\` 写成 \`case X and cond\` | 用 \`if\` 关键字 |
| 3.9 跑 match | 直接写 match-case | 3.9 及以下要用 if/elif 模拟 |
| 类模式字段名 | \`case Point(0, 0)\` 当位置参数 | 用关键字 \`Point(x=0, y=0)\` 更安全 |
| 以为有 fall-through | 担心忘 break | match-case 无穿透，匹配即退出 |
| 序列模式匹配字符串 | \`case [a, b]:\` 想匹配两字符 | 字符串不是序列模式，要用字面量或正则 |
`,
    code: `from dataclasses import dataclass
import sys

@dataclass
class Point:
    x: int
    y: int

# === 3.9 兼容写法：用 if/elif 模拟 match-case（可运行）===
def describe(shape):
    if isinstance(shape, list) and len(shape) == 2:
        x, y = shape
        if x == 0 and y == 0:
            return "origin"
        if y == 0:
            return f"x-axis at {x}"
        if x == 0:
            return f"y-axis at {y}"
        return f"point ({x}, {y})"
    if isinstance(shape, list) and len(shape) == 2 and shape[0] in ("left", "right"):
        direction, n = shape
        return f"move {direction} {n}"
    if isinstance(shape, Point):
        if shape.x == 0 and shape.y == 0:
            return "Point at origin"
        if shape.x == shape.y:
            return f"diagonal ({shape.x},{shape.y})"
        return f"Point({shape.x},{shape.y})"
    if isinstance(shape, dict) and shape.get("action") == "echo":
        return f"echo: {shape.get('msg')}"
    return "unknown"

tests = [
    [0, 0], [3, 0], [5, 5],
    Point(0, 0), Point(2, 3), Point(4, 4),
    ["left", 10], {"action": "echo", "msg": "hi"},
]
for t in tests:
    print(f"{str(t):45} -> {describe(t)}")

# === 3.10+ match-case 写法（仅在 Python 3.10+ 运行，此处注释展示）===
# def describe(shape):
#     match shape:
#         case [0, 0]: return "origin"
#         case [x, 0]: return f"x-axis at {x}"
#         case [0, y]: return f"y-axis at {y}"
#         case [x, y]: return f"point ({x}, {y})"
#         case ["left" | "right" as direction, n]: return f"move {direction} {n}"
#         case Point(x=0, y=0): return "Point at origin"
#         case Point(x=x, y=y) if x == y: return f"diagonal ({x},{y})"
#         case Point(x=x, y=y): return f"Point({x},{y})"
#         case {"action": "echo", "msg": msg}: return f"echo: {msg}"
#         case _: return "unknown"
`,
  },
  {
    id: "py4-bool",
    group: "控制流",
    icon: "✅",
    title: "布尔运算、短路、比较",
    content: `
## 概念解释

Python 布尔运算三件套：\`and\` / \`or\` / \`not\`（**不是** \`&&\` / \`||\` / \`!\`）。配套有比较运算符 \`==\`、\`!=\`、\`<\`、\`in\`、\`is\` 等，以及内置 \`all()\` / \`any()\`。

\`\`\`python
a and b    # 两个都真才真；返回第一个 falsy，没有则返回最后一个
a or b     # 至少一个真就真；返回第一个 truthy，没有则返回最后一个
not a      # 取反，返回 True 或 False
1 < x < 10 # 链式比较（Python 特色），等价 1<x and x<10
\`\`\`

## 设计原理

### 为什么用 \`and/or/not\` 而非符号？

Python 走"可读性优先"路线：\`if a and b or c\` 比 \`if a && b || c\` 更接近自然语言。这套关键字继承自 ABC 语言，Pascal 也用同样写法。好处是新手一眼能懂，坏处是打字多几下。

### 短路求值（Short-circuit）

\`a and b\`：若 \`a\` 为假，**直接返回 a，不再算 b**。
\`a or b\`：若 \`a\` 为真，**直接返回 a，不再算 b**。

注意返回的是**原值**，不是布尔！\`0 or "default"\` 返回 \`"default"\`，\`"a" and "b"\` 返回 \`"b"\`。这特性常用来给默认值：\`name = input_name or "anonymous"\`，或避免 None 报错：\`if obj and obj.attr:\`。

### 链式比较

\`1 < x < 10\` 在 Python 里等价于 \`1 < x and x < 10\`，但 \`x\` 只求值一次。C/Java 不支持这种写法——\`1 < x < 10\` 在 C 里会被解析成 \`(1 < x) < 10\`，恒为真（因为 \`(1<x)\` 是 0/1，总 <10）。

### \`is\` vs \`==\`

- \`==\` 比较**值相等**（调用 \`__eq__\`，可重载）
- \`is\` 比较**身份相同**（是否同一对象，看 \`id()\` 内存地址，不可重载）

\`a = [1,2]; b = [1,2]; a == b\` 为 True（值同），\`a is b\` 为 False（两个不同对象）。\`is\` 通常只用来判 None：\`if x is None\`（PEP8 推荐，比 \`== None\` 更准更快，还能避免 \`__eq__\` 被恶意重载）。

## 使用场景

- **逻辑组合**：\`if a and not b:\`
- **默认值**：\`name = raw or "default"\`
- **避免 None 报错**：\`if obj and obj.attr:\`（短路保护）
- **判空**：\`if not my_list:\`（空列表为 falsy）
- **身份判断**：\`if x is None\`、\`if x is True\`
- **批量判断**：\`all(iterable)\` / \`any(iterable)\`
- **避免**：用 \`is\` 比较普通值（\`x is 5\` 行为不定，CPython 整数缓存会骗人）

## 代码逐行讲解

\`\`\`python
# 链式比较（Python 特色）
x = 5
print(1 < x < 10)                   # True；等价 1<x and x<10，x 只算一次
print(1 == x == 5)                  # True；1==x 且 x==5
print(1 < x <= 10)                  # True；混合链式也行
\`\`\`

链式比较任意长度都行：\`0 < x < 100\`、\`a < b < c < d\`。读起来像数学不等式，非常直观。

\`\`\`python
# 短路求值
print(0 or "default")               # 'default'；0 falsy，返回右边的 "default"
print("a" and "b")                  # 'b'；"a" truthy，返回右边的 "b"
print(1 or print("不会执行"))        # 1；1 truthy，print 不被执行（短路）
\`\`\`

记住口诀：\`and\` 返回第一个 falsy（没有就返回最后一个）；\`or\` 返回第一个 truthy（没有就返回最后一个）。

\`\`\`python
# in / not in
print("py" in "python", 1 in [1, 2, 3])   # True True；in 检查成员关系
print("x" not in "abc")                   # True；not in 是 in 的取反
\`\`\`

\`in\` 检查成员关系：字符串子串、列表元素、字典键、集合元素。注意字典 \`in\` 查的是**键**不是值。

\`\`\`python
# is vs ==
a = b = [1, 2]                      # a 和 b 指向同一个列表
print(a is b, a == b)               # True True；同一对象，值当然也相等
c = [1, 2]                          # 新建一个内容相同的列表
print(a is c, a == c)               # False True；不同对象但值相等
\`\`\`

\`is\` 看 \`id()\`（内存地址），\`==\` 看 \`__eq__\`（值）。日常用 \`==\`，判 None 用 \`is\`。

\`\`\`python
# all / any
nums = [1, 2, 3, 0, 5]
print(all(x > 0 for x in nums))     # False；有 0，不全部 >0
print(any(x > 0 for x in nums))     # True；至少有一个 >0
print(all([True, True, False]))     # False；有一个 False 就 False
\`\`\`

\`all\` 全真才真（空可迭代对象返回 True）；\`any\` 一真即真（空可迭代对象返回 False）。配合生成器表达式 \`x > 0 for x in nums\`，**惰性求值**，遇到第一个 False/True 就短路返回。

## truthy / falsy 规则

**falsy 值**（\`bool(x)\` 为 False）：
- \`False\`、\`None\`
- 数字 0：\`0\`、\`0.0\`、\`0j\`、\`Decimal(0)\`
- 空容器：\`""\`、\`[]\`、\`{}\`、\`set()\`、\`()\`、\`range(0)\`
- 自定义类：定义 \`__bool__\` 返回 False 或 \`__len__\` 返回 0

**truthy 值**：除上述外都是 True。注意 \`"0"\`（字符串）、\`[0]\`（含 0 的列表）都是 truthy——非空就是真。

## 对比

| 运算 | Python | C/Java | 说明 |
|------|--------|--------|------|
| 与 | \`and\` | \`&&\` | Python 返回原值，C 返回 0/1 |
| 或 | \`or\` | \`||\` | 同上 |
| 非 | \`not\` | \`!\` | Python 返回 True/False |
| 链式比较 | \`1<x<10\` | 不支持 | C 写 \`1<x && x<10\` |

| 比较 | \`==\` | \`is\` |
|------|-------|-------|
| 比较对象 | 值 | 身份（id） |
| 可重载 | 是（\`__eq__\`） | 否 |
| 用于 | 普通值比较 | None/True/False、单例 |
| 速度 | 慢（可能调用方法） | 快（比指针） |

## 易错点小结

| 坑 | 错误写法 | 正确做法 |
|----|----------|----------|
| 用 \`&&\` | \`a && b\` | \`a and b\` |
| 用 \`is\` 比较值 | \`if x is 5:\` | \`if x == 5:\`（\`is\` 留给 None/单例） |
| 用 \`== None\` | \`if x == None:\` | \`if x is None:\`（PEP8 推荐） |
| 短路当布尔用 | \`if (a or b) == True\` | \`if a or b\`（返回值非布尔） |
| 链式比较误用 | 担心 \`1 < x < 10\` 解析错 | 放心用，Python 原生支持 |
| \`in\` 字典查值 | \`v in d\` 想查值 | \`v in d\` 查键，查值用 \`.values()\` |
| 空集合当 False 漏判 | \`if lst == []:\` | \`if not lst:\`（更 Pythonic） |
| 整数缓存骗人 | \`a=256; b=256; a is b\` 为 True | 别依赖，永远用 \`==\` 比值 |
`,
    code: `# 链式比较（Python 特色）
x = 5
print(1 < x < 10)                   # True
print(1 == x == 5)                  # True
print(1 < x <= 10)                  # True

# 短路求值
print(0 or "default")               # 'default'
print("a" and "b")                  # 'b'
print(1 or print("不会执行"))        # 1（print 不会执行）

# in / not in
print("py" in "python", 1 in [1, 2, 3])
print("x" not in "abc")

# is vs ==
a = b = [1, 2]
print(a is b, a == b)               # True True
c = [1, 2]
print(a is c, a == c)               # False True

# all / any
nums = [1, 2, 3, 0, 5]
print(all(x > 0 for x in nums))     # False
print(any(x > 0 for x in nums))     # True
print(all([True, True, False]))     # False
`,
  },
];