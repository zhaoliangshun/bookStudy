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
- 基本结构：\`if cond1: ... elif cond2: ... else: ...\`
- 缩进决定代码块（4 空格）
- 三元表达式：\`x if cond else y\`（条件表达式）
- Python 中 \`0/"" / [] / {} / None\` 均为假值
- 用 \`and/or/not\` 组合条件，支持链式比较
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
- \`for item in iterable\` 遍历；\`while cond\` 条件循环
- \`break\` 跳出循环；\`continue\` 跳过当前迭代
- **循环的 else 子句**：循环正常结束（未 break）时执行
- 迭代助手：\`range / enumerate / zip / reversed / sorted\`
- 嵌套循环、\`pass\` 占位
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
- 3.10+ 引入的结构模式匹配（类似 switch 但强得多）
- 字面量模式、通配符 \`_\`、OR 模式 \`| \`
- 序列模式：\`[a, b, *rest]\` 匹配列表/元组
- 守卫：\`case ... if cond:\` 附加条件
- 映射模式：匹配字典键；类模式匹配对象
- 海象 \`:= \` 可在模式中绑定值
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
- 列表推导：\`[x for x in seq if cond]\`（比 map/filter 更可读）
- 集合推导：\`{x for x in seq}\`；字典推导：\`{k: v for ...}\`
- 支持多重循环和条件过滤
- **生成器表达式**：\`(x for x in seq)\` 惰性求值，节省内存
- 适合传给 \`sum/max/min/all/any/any\` 等聚合函数
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
