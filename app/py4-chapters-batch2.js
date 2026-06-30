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
- \`if / elif / else\`：注意是 \`elif\` 不是 \`else if\`
- 三元：\`x if cond else y\`
- 条件可以是任意表达式，Python 自动转 bool
- 可以嵌套，但避免过深（超过 3 层考虑重构）
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
- \`for x in iterable:\` 遍历可迭代对象
- \`while cond:\` 条件循环
- \`break\` 跳出循环；\`continue\` 跳到下一次；\`else\` 正常结束才执行
- \`range(start, stop, step)\`：惰性整数序列，不含 stop
- \`enumerate(iter)\`：同时拿索引和元素
- \`zip(*iters)\`：并行遍历多个序列
- \`reversed(seq)\` / \`sorted(seq)\`：反转/排序迭代
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
- 3.10+ 新增，比 if/elif 链更清晰
- 可匹配：字面量、序列、映射、类对象、OR 模式
- **guard**：\`case X if cond:\` 加额外条件
- 通配 \`_\` 匹配任意但不绑定
- 类模式匹配字段：\`case Point(x=0, y=0):\`
- 不像 switch：case 从上到下依次尝试，第一个匹配即执行
`,
    code: `from dataclasses import dataclass

@dataclass
class Point:
    x: int
    y: int

def describe(shape):
    match shape:
        # 序列模式
        case [0, 0]:
            return "origin"
        case [x, 0]:
            return f"x-axis at {x}"
        case [0, y]:
            return f"y-axis at {y}"
        case [x, y]:
            return f"point ({x}, {y})"
        # OR + 捕获
        case ["left" | "right" as direction, n]:
            return f"move {direction} {n}"
        # 类模式
        case Point(x=0, y=0):
            return "Point at origin"
        case Point(x=x, y=y) if x == y:
            return f"diagonal ({x},{y})"
        case Point(x=x, y=y):
            return f"Point({x},{y})"
        # 映射模式
        case {"action": "echo", "msg": msg}:
            return f"echo: {msg}"
        case _:
            return "unknown"

tests = [
    [0, 0], [3, 0], [5, 5],
    Point(0, 0), Point(2, 3), Point(4, 4),
    ["left", 10], {"action": "echo", "msg": "hi"},
]
for t in tests:
    print(f"{str(t):45} -> {describe(t)}")
`,
  },
  {
    id: "py4-bool",
    group: "控制流",
    icon: "✅",
    title: "布尔运算、短路、比较",
    content: `
- 逻辑运算符：\`and\` / \`or\` / \`not\`（不是 \`&&\` / \`||\` / \`!\`）
- **短路求值**：\`a or b\` 若 a 为真就不算 b
- 成员：\`in / not in\`；身份：\`is / is not\`（比 \`==\` 更严格）
- 链式比较：\`1 < x < 10\`（Python 特色）
- Falsy 值：\`0, 0.0, None, "", [], {}, set(), False\`
- \`all()\` / \`any()\`：批量判断
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