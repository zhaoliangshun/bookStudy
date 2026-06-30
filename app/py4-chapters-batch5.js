// =============================================================
// Batch 5：推导式（4 章）
// 17. py4-list-comp      列表推导式
// 18. py4-dict-comp      字典/集合推导式
// 19. py4-gen-expr       生成器表达式
// 20. py4-nested-comp    嵌套推导式 + 实战
// =============================================================

export const chapters = [
  {
    id: "py4-list-comp",
    group: "推导式",
    icon: "✨",
    title: "列表推导式：一行生成列表",
    content: `
- 语法：\`[expr for x in iter if cond]\`
- 比 for 循环 + append 更 Pythonic
- 可包含 if 过滤、if...else 映射
- 避免过长（超过 2 行拆成 for 循环）
- 适合：数据转换、过滤、展平
`,
    code: `nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# 基础：映射
squares = [x * x for x in nums]
print("squares:", squares)

# 过滤
evens = [x for x in nums if x % 2 == 0]
print("evens:", evens)

# 映射 + 过滤
odds_squared = [x * x for x in nums if x % 2 == 1]
print("odds_squared:", odds_squared)

# if...else（注意：条件在前，循环在后）
labels = ["even" if x % 2 == 0 else "odd" for x in nums]
print("labels:", labels)

# 对字符串操作
names = ["alice", "bob", "carol", "dave"]
upper = [n.upper() for n in names]
print("upper:", upper)
lengths = [len(n) for n in names]
print("lengths:", lengths)

# 对比：for 循环 vs 推导
result1 = []
for x in range(5):
    result1.append(x * 2)
result2 = [x * 2 for x in range(5)]
print(result1, result2, result1 == result2)
`,
  },
  {
    id: "py4-dict-comp",
    group: "推导式",
    icon: "📚",
    title: "字典/集合推导式",
    content: `
- 字典推导：\`{k: v for x in iter if cond}\`
- 集合推导：\`{expr for x in iter if cond}\`
- 适合：构建映射表、反转键值、去重
`,
    code: `# 字典推导：构建映射表
names = ["alice", "bob", "carol"]
lengths = {n: len(n) for n in names}
print("lengths:", lengths)

# 字典推导：反转键值
d = {"a": 1, "b": 2, "c": 3}
reversed_d = {v: k for k, v in d.items()}
print("reversed:", reversed_d)

# 字典推导 + 过滤
scores = {"alice": 90, "bob": 55, "carol": 85, "dave": 40}
passed = {k: v for k, v in scores.items() if v >= 60}
print("passed:", passed)

# 集合推导
nums = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
unique = {x for x in nums}
print("unique:", unique)

# 集合推导 + 过滤
words = ["hello", "HELLO", "world", "WORLD", "python"]
lower_unique = {w.lower() for w in words}
print("lower_unique:", lower_unique)

# 实战：分组统计
words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
counts = {w: words.count(w) for w in set(words)}
print("counts:", counts)
`,
  },
  {
    id: "py4-gen-expr",
    group: "推导式",
    icon: "⚡",
    title: "生成器表达式：惰性求值",
    content: `
- 语法：\`(expr for x in iter if cond)\`（圆括号）
- **惰性**：不一次性生成所有值，逐次 yield
- 内存友好：适合大文件/大数据流
- 适合：\`sum/any/all/max/min\` 等消费函数
- 注意：只能消费一次，再次遍历为空
- 对比：推导式用 []，生成器表达式用 ()
`,
    code: `import sys

# 生成器表达式
gen = (x * x for x in range(10_000_000))
print("type:", type(gen))
print("object size:", sys.getsizeof(gen), "bytes")

# 对比内存占用
nums = [x * x for x in range(1000)]
gen2 = (x * x for x in range(1000))
print("list size:", sys.getsizeof(nums), "bytes")
print("gen size:", sys.getsizeof(gen2), "bytes")

# 消费（只能一次）
gen3 = (x * x for x in range(5))
print("first:", list(gen3))
print("second:", list(gen3))          # []

# 与 sum/max/min 配合
print(sum(x * x for x in range(100))) # 328350
print(max(x for x in range(100) if x % 7 == 0))
print(any(x > 5 for x in range(3)))   # False

# 实战：一行统计大文件（模拟）
import io
data = io.StringIO("1\\n2\\n3\\n4\\n5\\n")
total = sum(int(line.strip()) for line in data)
print("total:", total)
`,
  },
  {
    id: "py4-nested-comp",
    group: "推导式",
    icon: "🪜",
    title: "嵌套推导式与实战",
    content: `
- 多层 for：\`[expr for x in iter1 for y in iter2]\`
- 展开矩阵：\`[v for row in matrix for v in row]\`
- 嵌套字典推导、嵌套集合推导
- 避免过深（超过 2 层 → 拆成循环）
`,
    code: `# 展平嵌套列表
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [v for row in matrix for v in row]
print("flat:", flat)

# 多层 for + 过滤
combos = [(x, y) for x in range(1, 4) for y in range(1, 4) if x != y]
print("combos:", combos)

# 嵌套字典推导
students = {
    "alice": {"math": 90, "eng": 85},
    "bob": {"math": 75, "eng": 95},
}
all_scores = {f"{name}_{subj}": score
              for name, scores in students.items()
              for subj, score in scores.items()}
print("all_scores:", all_scores)

# 实战：转置矩阵
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
transposed = [[row[i] for row in matrix] for i in range(len(matrix[0]))]
print("transposed:", transposed)

# 使用 zip 更简洁
print("zip:", list(zip(*matrix)))

# 实战：生成数独棋盘（9x9 全 0）
board = [[0 for _ in range(9)] for _ in range(9)]
print("board size:", len(board), "x", len(board[0]))

# 注意：不要用 [[0]*9]*9（浅复制会导致所有行共享引用）
`,
  },
];