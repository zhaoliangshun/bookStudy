// =============================================================
// Batch 1：快速入门（4 章）
// 1. py5-hello      Hello World、REPL、help/dir/type
// 2. py5-vars       变量、类型、int/float/bool/None
// 3. py5-operators  运算符（含海象 := 3.8+）
// 4. py5-builtins   常用内置函数
// =============================================================

export const chapters = [
  {
    id: "py5-hello",
    group: "快速入门",
    icon: "👋",
    title: "Hello World 与自省",
    content: `
- Python 3.13，运行 \`python3.13\` 进 REPL
- \`print()\` 输出；\`type(x)/dir(x)/help(x)\` 自省三件套
- \`if __name__ == "__main__":\` 作为脚本入口
`,
    code: `import sys, platform

print("Hello, Python", sys.version_info.major, ".", sys.version_info.minor, sep="")
print("平台:", platform.system(), platform.machine())

# 自省
x = [1, 2, 3]
print("type:", type(x).__name__)
print("len(x):", len(x))
print("dir(x) 前 6 个:", dir(x)[:6])
# help(x)  # 进分页，沙箱里不调用

# 脚本入口写法
if __name__ == "__main__":
    print("我是主程序")
`,
  },
  {
    id: "py5-vars",
    group: "快速入门",
    icon: "📦",
    title: "变量、类型与 None",
    content: `
- 动态强类型：变量无类型，对象有类型
- 基础：\`int / float / bool / str / NoneType\`
- 多变量赋值、任意精度 int
- \`bool\` 是 \`int\` 子类
`,
    code: `# 动态类型：一个变量可以先后指向不同类型的对象
x = 10
x = "hi"
x = 3.14
print("x =", x)

# 多变量 / 链式赋值
a, b, c = 1, 2, 3
x = y = z = 0
print(a, b, c, x, y, z)

# 任意精度整数
print("2**100 =", 2**100)

# bool 是 int 的子类：True=1, False=0
print("isinstance:", isinstance(True, int))
print("True+True =", True + True)

# 类型转换
print(int("42"), float("3.14"), str(123), bool(0), bool(""))

# None
v = None
print(v is None, v is not None)
`,
  },
  {
    id: "py5-operators",
    group: "快速入门",
    icon: "➕",
    title: "运算符（含海象运算符）",
    content: `
- 算术：\`+ - * / // % **\`（\`/\` 永远返回 float，\`//\` 整除）
- 比较：\`== != < > <= >=\`，**链式** \`1 < x < 10\`
- 逻辑：\`and/or/not\`（短路求值）
- 身份：\`is / is not\`；成员：\`in / not in\`
- 海象运算符 \`:=\`（3.8+）：在表达式里赋值
`,
    code: `# 算术
print(7 / 2, 7 // 2, 7 % 2, 2 ** 10)

# 链式比较
x = 5
print(1 < x < 10, 1 == x == 5)

# 短路求值
print(0 or "default")
print("a" and "b")
print(1 or print("不执行"))

# in / is
print("py" in "python", 1 in [1, 2, 3])
a = b = [1, 2]
c = [1, 2]
print("is:", a is b, "==", a == c, "is c:", a is c)

# 海象运算符 :=
# 在 while/if/推导式里边赋值边判断
import random
random.seed(42)
while (n := random.randint(0, 10)) != 0:
    pass
print("遇到 0，最后 n =", n)

# 列表推导里用海象
data = [10, 50, 3, 99, 2]
big = [y for x in data if (y := x * 2) > 20]
print("big:", big)
`,
  },
  {
    id: "py5-builtins",
    group: "快速入门",
    icon: "🧰",
    title: "常用内置函数",
    content: `
- 类型/转换：\`int/float/str/bool/list/dict/set/tuple\`
- 数学：\`abs/round/min/max/sum/divmod/pow\`
- 迭代：\`range/enumerate/zip/reversed/sorted\`
- 逻辑：\`any/all\`
- 其他：\`len/isinstance/issubclass/callable/hasattr/getattr/setattr\`
`,
    code: `nums = [3, 1, 4, 1, 5, 9, 2, 6]

# 数学
print("sum:", sum(nums), "max:", max(nums), "min:", min(nums))
print("abs:", abs(-10), "round:", round(3.14159, 2))
print("divmod(10,3):", divmod(10, 3))

# 迭代
print("sorted:", sorted(nums, reverse=True))
for i, v in enumerate(["a", "b", "c"], start=1):
    print(f"  {i}: {v}")
for name, score in zip(["alice", "bob"], [90, 85]):
    print(f"  {name}: {score}")

# any / all
print("all >0:", all(x > 0 for x in nums))
print("any >8:", any(x > 8 for x in nums))

# isinstance / callable / hasattr
print("isinstance:", isinstance(42, int), isinstance(42, (int, float)))
print("callable(print):", callable(print))
print("hasattr list pop:", hasattr([], "pop"))

# map / filter（偏函数式风格）
print("map:", list(map(str.upper, ["a", "b"])))
print("filter:", list(filter(lambda x: x > 5, nums)))
`,
  },
];