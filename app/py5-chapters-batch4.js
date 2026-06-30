// =============================================================
// Batch 4：控制流（4 章）
// 9.  py5-if            if/elif/else 与三元表达式
// 10. py5-loops         for/while 循环、break/continue/else、迭代助手
// 11. py5-match         match-case 结构模式匹配 (3.10+)
// 12. py5-comprehensions 推导式深入与生成器表达式
// =============================================================

export const chapters = [
  {
    id: "py5-if",
    group: "控制流",
    icon: "🔀",
    title: "if/elif/else 条件判断",
    content: `
## 概述
\`if/elif/else\` 是 Python 条件分支的基础语法，配合三元表达式 \`x if cond else y\` 与真值判断规则，可以优雅地处理绝大多数条件分支场景。

## 核心要点
- **基本结构**: \`if cond: ... elif cond2: ... else: ...\` - 每条分支以冒号结尾，靠 4 空格缩进界定代码块
- **三元表达式**: \`x if cond else y\` - 先求值条件，为真返回 x，否则返回 y；优先级低于其他表达式
- **链式比较**: \`18 <= age < 30\` - 等价于 \`18 <= age and age < 30\`，但 age 只求值一次
- **真值判断**: \`0 / "" / [] / {} / None / False\` - 这些均为假值，其他对象默认为真
- **逻辑运算符**: \`and / or / not\` - 短路求值，\`a or b\` 当 a 为真时直接返回 a
- **身份判断**: \`if x is None\` - 用于身份判断（尤其判 None），区别于 \`==\` 的值相等
- **成员判断**: \`if "py" in "python"\` - 适配字符串、列表、字典（查键）、集合等容器
- **嵌套三元**: \`"正" if x>0 else ("负" if x<0 else "零")\` - 括号可读，但不建议嵌套过深
- **f-string 配合**: \`status = "真" if v else "假"\` - 三元表达式可嵌入字符串模板

## 原理与机制
- **真值协议**: 对象通过 \`__bool__()\` 返回布尔值，未定义时回退到 \`__len__()\`，两者都无则视为真
- **短路求值**: \`a and b\` 若 a 为假则不计算 b；\`a or b\` 若 a 为真则不计算 b，常用于默认值
- **链式比较展开**: \`a < b < c\` 被解析为 \`(a < b) and (b < c)\`，且 b 只求值一次
- **elif 不是 else if**: \`elif\` 是独立关键字，避免 \`else: if ...\` 多一层缩进
- **三元是表达式而非语句**: 必须有返回值，不能写 \`x = (print() if cond else pass)\`

## 易错点与陷阱
- **混淆 == 与 is**: 判断 None 必须用 \`is None\`，用 \`== None\` 可能被 \`__eq__\` 重载且语义不准
- **None 与空容器**: \`if lst:\` 在 lst 为 None 时抛 AttributeError；判空应写 \`if lst is None or not lst\`
- **三元嵌套陷阱**: \`x if c1 else y if c2 else z\` 阅读困难，多分支应改用 if/elif 或 match-case
- **可变默认值**: \`def f(x=[])\` 共享同一列表，是常见陷阱（虽与 if 无直接关系）

## 实战建议
- **优先真值判断**: 写 \`if lst:\` 而非 \`if len(lst) > 0:\`，更 Pythonic
- **默认值惯用法**: \`display = name or "匿名"\` 利用短路返回；若要区分空串与 None，用 \`name if name is not None else "匿名"\`
- **多分支扁平化**: 超过 3 个 elif 时考虑字典映射或 match-case（3.10+）
`,
    code: `# 基本 if/elif/else
score = 85
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"
print(f"score={score}, grade={grade}")

# 链式比较
age = 25
if 18 <= age < 30:
    print("青年")

# 真值判断
values = [0, 1, "", "hello", [], [1], None, False, True]
for v in values:
    status = "真" if v else "假"
    print(f"  {repr(v):10} -> {status}")

# 三元表达式（条件表达式）
x = 10
y = 20
max_val = x if x > y else y
print("max:", max_val)

# 嵌套三元（谨慎使用）
result = "正" if x > 0 else ("负" if x < 0 else "零")
print("result:", result)

# and / or 短路
name = ""
display = name or "匿名"
print("display:", display)

# is 判 None
value = None
if value is None:
    print("value is None")
if value is not None:
    print("不会走到这")

# in 成员判断
if "py" in "python":
    print("py 在 python 中")
`,
  },
  {
    id: "py5-loops",
    group: "控制流",
    icon: "🔁",
    title: "for/while 循环",
    content: `
## 概述
\`for\` 与 \`while\` 是 Python 两种循环结构，配合 \`break / continue\` 控制流转换，以及 \`range / enumerate / zip\` 等迭代助手，能够处理绝大多数遍历与重复任务。

## 核心要点
- **for 遍历**: \`for item in iterable:\` - 通用迭代协议，可遍历列表、字符串、字典、range、生成器等
- **while 条件循环**: \`while cond:\` - 适合未知次数的循环，必须确保条件最终为假，否则死循环
- **range 三参数**: \`range(start, stop, step)\` - 左闭右开；\`range(5)\` 产生 0~4；\`range(2,10,2)\` 产生 2,4,6,8
- **break**: 立即跳出最近一层循环，常用于提前终止搜索
- **continue**: 跳过当前迭代剩余语句，进入下一次循环；过滥用降低可读性
- **循环的 else**: 循环正常结束（未被 break）时执行，是 Python 独有特性，常配合 break 用于查找
- **enumerate**: \`for idx, val in enumerate(seq, start=1):\` - 同时获取索引和值，避免 \`range(len(seq))\` 反模式
- **zip**: \`for a, b in zip(seq1, seq2):\` - 并行遍历，以最短序列为准；\`zip_longest\` 处理不等长
- **reversed / sorted**: 返回新迭代器/列表，不修改原序列；\`sorted\` 支持 \`key\` 和 \`reverse\` 参数
- **pass 占位**: 空循环体必须写 \`pass\`，否则语法错误

## 原理与机制
- **迭代协议**: \`for x in obj\` 调用 \`obj.__iter__()\` 获得迭代器，再反复 \`__next__()\` 直到 StopIteration
- **range 惰性**: \`range(10**9)\` 几乎不占内存，仅存储 start/stop/step，按需计算
- **else 触发条件**: 仅当循环因条件为假（while）或迭代耗尽（for）退出时执行；break 跳出则不执行
- **zip 短板效应**: 默认以最短输入为准；3.10+ \`zip(strict=True)\` 不等长时抛 ValueError
- **enumerate 是生成器**: 每次产生 (index, value) 元组，不创建中间列表

## 易错点与陷阱
- **修改迭代中的列表**: 在 \`for x in lst\` 中 \`lst.remove(x)\` 会跳过元素，应改用列表推导或倒序遍历
- **else 语义反直觉**: \`for...else\` 的 else 不是 "if 不成立时执行"，而是 "循环正常结束时执行"
- **while 死循环**: 忘记更新循环变量导致 \`while True\` 永不退出；务必有终止条件
- **zip 不等长静默截断**: 默认行为不报错，可能丢数据；3.10+ 用 \`strict=True\` 显式校验

## 实战建议
- **优先 for 而非 while**: 已知次数或可迭代时用 for，更简洁且不易死循环
- **查找用 for...else**: \`for x in seq: if cond: break\` 后接 \`else:\` 处理未找到的情况，比设标志位更优雅
- **并行遍历用 zip**: 避免 \`for i in range(len(a)): b[i]\` 这种反模式，直接 \`for x, y in zip(a, b):\`
`,
    code: `# for + range
print("for range(5):")
for i in range(5):
    print(i, end=" ")
print()

# range 起始、结束、步长
print("range(2, 10, 2):", list(range(2, 10, 2)))

# while 循环
n = 1
total = 0
while n <= 100:
    total += n
    n += 1
print("1~100 sum:", total)

# break：找第一个合数
for num in range(2, 20):
    is_prime = True
    for i in range(2, int(num ** 0.5) + 1):
        if num % i == 0:
            print(f"{num} 不是素数，被 {i} 整除")
            is_prime = False
            break
    if is_prime:
        print(f"{num} 是素数")

# continue：跳过偶数
print("奇数:", end=" ")
for i in range(10):
    if i % 2 == 0:
        continue
    print(i, end=" ")
print()

# 循环的 else：未被 break 才执行
for n in [4, 6, 8, 9]:
    for d in range(2, n):
        if n % d == 0:
            print(f"{n} 有因子 {d}")
            break
    else:
        print(f"{n} 是素数")
else:
    print("循环全部完成，未被外层 break")

# enumerate / zip
for idx, ch in enumerate(["a", "b", "c"], start=1):
    print(f"  [{idx}] {ch}")
for name, score in zip(["Alice", "Bob"], [95, 87]):
    print(f"  {name}: {score}")

# reversed / sorted
print("reversed:", list(reversed([1, 2, 3])))
print("sorted:", sorted([3, 1, 2], reverse=True))
`,
  },
  {
    id: "py5-match",
    group: "控制流",
    icon: "🎯",
    title: "match-case 模式匹配（3.10+）",
    content: `
## 概述
\`match-case\` 是 Python 3.10+ (PEP 634) 引入的结构模式匹配，远比 switch 强大：可匹配字面量、序列、映射、类，并支持守卫和值绑定，是替代复杂 if/elif 链的现代方案。

## 核心要点
- **基本字面量**: \`case 0:\` / \`case "quit":\` - 按值匹配，类似 switch
- **通配符**: \`case _:\` - 匹配任意值，必须放在最后，相当于 default
- **OR 模式**: \`case 1 | 2 | 3:\` - 多个模式用 \`|\` 连接，匹配任一即可
- **捕获绑定**: \`case str() as s:\` - 匹配类型并把值绑定到变量 s
- **守卫**: \`case int() if x > 100:\` - 模式匹配后附加条件，false 则继续下一个 case
- **序列模式**: \`case [x, y]:\` / \`case [first, *rest, last]:\` - 匹配列表/元组，\`*\` 捕获剩余元素
- **映射模式**: \`case {"action": "greet", "name": name}:\` - 匹配字典键，多余键不报错（子集匹配）
- **类模式**: \`case Circle(radius=r):\` - 按类类型匹配并提取属性，需 \`@dataclass\` 或显式 \`__match_args__\`
- **字面量 vs 捕获**: \`case 0:\` 是字面量匹配；\`case x:\` 是捕获（无类型前缀即绑定）
- **海象配合**: 守卫中可用 \`:=\` 绑定，模式内也已自动绑定值

## 原理与机制
- **匹配而非相等**: 序列/映射/类模式按结构递归匹配，比 \`==\` 更精确表达意图
- **顺序匹配**: case 从上到下匹配，第一个成功即停止；通配符 \`_\` 永远匹配，放最后
- **子集匹配语义**: 映射模式只要求包含指定键，多余键忽略；序列模式则需精确长度（除非用 \`*\`）
- **变量捕获规则**: 单个标识符（非 _）在 case 中永远是捕获变量，不是字面量；想匹配值必须用字面量或带类型
- **\`__match__\` 协议**: 自定义类通过 \`__match_args__\` 声明位置参数，dataclass 自动生成

## 易错点与陷阱
- **变量 vs 字面量混淆**: \`case x:\` 不会判断 \`x == x\`，而是捕获任意值到 x；要匹配变量值需用守卫或字面量
- **类模式需要属性**: 普通 \`class Foo: pass\` 用 \`case Foo(a=1):\` 会报错，需 \`@dataclass\` 或 \`__match_args__\`
- **映射模式不查严格相等**: 字典有多余键也能匹配，需要严格匹配应改用守卫
- **守卫中的变量作用域**: 守卫可引用模式捕获的变量，但若抛异常会被吞掉继续下一 case
- **None 用 is 匹配**: \`case None:\` 实际编译为 \`is None\`，正确；自定义类型需谨慎

## 实战建议
- **替代复杂 if/elif**: 超过 3 个分支且涉及类型/结构判断时优先 match-case
- **数据解析场景**: JSON、命令分发、AST 处理等场景天然适合映射/序列模式
- **始终用 \`case _:\` 兜底**: 避免未来新增类型未匹配导致静默错误
`,
    code: `# 基本字面量匹配
def describe(x):
    match x:
        case 0:
            return "零"
        case 1 | 2:
            return "小数字"
        case int() if x > 100:
            return "大整数"
        case str() as s:
            return f"字符串，长度={len(s)}"
        case list() as lst:
            return f"列表，长度={len(lst)}"
        case _:
            return f"其他: {type(x).__name__}"

print(describe(0))
print(describe(2))
print(describe(200))
print(describe("hello"))
print(describe([1, 2, 3]))
print(describe(3.14))

# 序列模式匹配
def process_point(p):
    match p:
        case [0, 0]:
            return "原点"
        case [x, 0]:
            return f"X 轴上，x={x}"
        case [0, y]:
            return f"Y 轴上，y={y}"
        case [x, y]:
            return f"点({x},{y})"
        case [x, y, z]:
            return f"3D 点({x},{y},{z})"
        case _:
            return "未知格式"

print(process_point([0, 0]))
print(process_point([5, 0]))
print(process_point([3, 4]))
print(process_point([1, 2, 3]))

# *rest 捕获剩余
match [1, 2, 3, 4, 5]:
    case [first, *rest, last]:
        print(f"first={first}, last={last}, rest={rest}")

# 映射模式（字典）
def handle_cmd(cmd):
    match cmd:
        case {"action": "greet", "name": name}:
            print(f"你好，{name}！")
        case {"action": "calc", "op": "+", "a": a, "b": b}:
            print(f"{a} + {b} = {a + b}")
        case {"action": "quit"}:
            print("再见")
        case _:
            print("未知命令:", cmd)

handle_cmd({"action": "greet", "name": "Alice"})
handle_cmd({"action": "calc", "op": "+", "a": 3, "b": 4})
handle_cmd({"action": "quit"})

# 类模式
from dataclasses import dataclass

@dataclass
class Circle:
    radius: float

@dataclass
class Rect:
    w: float
    h: float

def area(shape):
    match shape:
        case Circle(radius=r):
            return 3.14159 * r * r
        case Rect(w=w, h=h):
            return w * h
        case _:
            return None

print("圆面积:", area(Circle(5)))
print("矩形面积:", area(Rect(4, 6)))
`,
  },
  {
    id: "py5-comprehensions",
    group: "控制流",
    icon: "🧬",
    title: "推导式与生成器表达式",
    content: `
## 概述
推导式（comprehension）是 Python 中以声明式方式构造列表/集合/字典的语法糖，生成器表达式则提供了惰性求值的迭代器版本，两者是写出地道 Python 代码的关键工具。

## 核心要点
- **列表推导**: \`[expr for x in seq]\` - 等价于 for 循环 append，更简洁；比 \`map/filter\` 更可读
- **带条件过滤**: \`[x for x in seq if x % 2 == 0]\` - if 在 for 之后过滤元素
- **条件表达式**: \`["偶" if x%2==0 else "奇" for x in seq]\` - 三目在 for 之前，做映射变换
- **集合推导**: \`{x for x in seq}\` - 自动去重，无序
- **字典推导**: \`{k: v for k, v in items}\` - 常用于键值互换、反向映射
- **多重循环**: \`[(x, y) for x in A for y in B]\` - 等价于嵌套 for，产生笛卡儿积
- **嵌套推导**: \`[[row[i] for row in matrix] for i in range(n)]\` - 矩阵转置等场景
- **生成器表达式**: \`(expr for x in seq)\` - 圆括号语法，惰性求值，仅迭代一次
- **传给聚合函数**: \`sum(x for x in range(101))\` / \`max(...)\` / \`any(...)\` / \`all(...)\` - 不创建中间列表
- **单参数可省括号**: \`sum(x for x in seq)\` - 唯一参数时生成器外的圆括号可省

## 原理与机制
- **作用域隔离**: 推导式在 3.0+ 有自己的作用域，循环变量不会泄漏到外部
- **生成器惰性**: \`(x for x in seq)\` 返回 generator 对象，仅在 \`__next__\` 时计算，单次消费
- **内存对比**: \`[x for x in range(10**8)]\` 占数百 MB，\`(x for x in range(10**8))\` 仅占 ~200 字节
- **执行顺序**: 多重 for 从左到右对应外到内嵌套；多个 if 是 AND 关系
- **推导式 vs map/filter**: 列表推导通常更快（避免函数调用开销），但生成器表达式在大数据下更省内存

## 易错点与陷阱
- **生成器只能迭代一次**: \`g = (x for x in range(5))\` 第二次 \`list(g)\` 得到空列表；需重新生成或转 list
- **过长的推导式难读**: 多重 for + if 嵌套超过 2 层时应拆成普通循环，可读性优先
- **集合推导顺序无序**: \`{x for x in seq}\` 不保证顺序，依赖顺序的场景应用列表推导
- **字典推导键冲突**: 后出现的键会覆盖前者，\`{v: k for k, v in pairs}\` 若有重复 v 会丢数据

## 实战建议
- **优先推导式而非 map/filter**: 列表场景推导式更 Pythonic，可读性更好
- **大数据用生成器**: 处理大文件、流式数据时用生成器表达式配 \`sum/max/any\`，避免内存爆炸
- **配合 any/all 短路**: \`any(x > 100 for x in seq)\` 找到第一个即停，比 \`len([x for x in seq if x>100]) > 0\` 高效
`,
    code: `# 列表推导：基础
nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
squares = [x ** 2 for x in nums]
print("squares:", squares)

# 带条件
evens = [x for x in nums if x % 2 == 0]
print("evens:", evens)

# 条件表达式（三目）在推导中
labels = ["偶" if x % 2 == 0 else "奇" for x in range(1, 6)]
print("labels:", labels)

# 嵌套循环：笛卡儿积
pairs = [(x, y) for x in [1, 2, 3] for y in ["a", "b"]]
print("pairs:", pairs)

# 嵌套推导：矩阵转置
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
transposed = [[row[i] for row in matrix] for i in range(3)]
print("matrix:", matrix)
print("transposed:", transposed)

# 集合推导
words = ["apple", "banana", "apple", "cherry", "banana"]
unique_lengths = {len(w) for w in words}
print("unique_lengths:", unique_lengths)

# 字典推导
word_to_len = {w: len(w) for w in words}
print("word_to_len:", word_to_len)

# 字典推导：键值互换
original = {"a": 1, "b": 2, "c": 3}
swapped = {v: k for k, v in original.items()}
print("swapped:", swapped)

# 生成器表达式：惰性，节省内存
# 不用方括号/花括号，用圆括号
total = sum(x for x in range(1, 101))
print("sum 1~100:", total)

max_val = max(x * x for x in range(20))
print("max square <20:", max_val)

# 对比 list vs generator 内存
import sys
list_comp = [x for x in range(1000)]
gen_exp = (x for x in range(1000))
print("list 大小:", sys.getsizeof(list_comp), "bytes")
print("generator 大小:", sys.getsizeof(gen_exp), "bytes")

# any/all 配合生成器
nums2 = [2, 4, 6, 7, 8]
print("有奇数:", any(x % 2 == 1 for x in nums2))
print("全偶数:", all(x % 2 == 0 for x in nums2))
`,
  },
];
