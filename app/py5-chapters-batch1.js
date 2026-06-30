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
## 概述
本章带你写出第一个 Python 程序。Python 是解释型语言，代码无需编译，由解释器逐行执行；Python 3.13 是当前最新稳定版本，本教程所有 demo 都在该版本沙箱中实测可运行。

## 核心要点
- **运行 Python**：命令行输入 \`python3.13\` 进入交互式 REPL（Read-Eval-Print Loop），可逐行测试；或用 \`python3.13 file.py\` 运行脚本
- **输出**：\`print()\` 是最常用函数，支持多参数，默认用空格分隔，可用 \`sep\` 修改分隔符、\`end\` 修改结尾符
- **版本与平台**：\`sys.version\` / \`sys.version_info\` 拿到 Python 版本；\`platform.system()\` 拿到操作系统
- **自省三件套**：
  - \`type(x)\` 返回对象类型，如 \`<class 'list'>\`，用 \`.__name__\` 取类型名
  - \`dir(x)\` 列出对象所有属性和方法（含魔术方法）
  - \`help(x)\` 显示对象文档（REPL 里进入分页浏览）
- **脚本入口**：\`if __name__ == "__main__":\` 是 Python 惯用写法，确保代码只在直接运行时执行，被 import 时不执行

## 原理与机制
- **解释型语言**：Python 源码 → 字节码（\`.pyc\` 缓存）→ Python 虚拟机执行，无需手动编译
- **动态类型**：变量名只是标签，运行时才知道指向什么类型的对象；同一个变量可先后指向不同类型
- **\`__name__\` 取值规则**：直接运行时为 \`"__main__"\`，被 \`import\` 时为模块名（如 \`"hello"\`），可借此区分主程序/库

## 易错点与陷阱
- **不要用 \`python\`**：macOS / Linux 上 \`python\` 可能指向 Python 2，应使用 \`python3\` 或显式 \`python3.13\`
- **\`help()\` 在脚本中调用**：会进入交互分页器阻塞执行，建议只在 REPL 中使用
- **\`print\` 的 \`sep\` 和 \`end\`**：默认 \`sep=" "\`、\`end="\\n"\`，拼接自定义格式时记得改

## 实战建议
- 写脚本时养成加 \`if __name__ == "__main__":\` 的习惯，方便代码被其他模块复用
- 调试时多用 \`type()\` 和 \`dir()\` 查看对象真实属性，比查文档更快
- REPL 适合快速试验，正式代码应保存到 \`.py\` 文件以便版本管理与复用
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
## 概述
变量是 Python 编程的基础。Python 采用"动态强类型"：变量本身没有类型，它指向的对象才有类型；但不会像 JS 那样隐式转换类型。理解类型系统是写出健壮代码的前提。

## 核心要点
- **动态强类型**：变量可重新指向任何类型对象（动态），但运算不会隐式转换（强类型）—— \`1 + "a"\` 会报 \`TypeError\`
- **基础类型**：\`int\` 整数（任意精度）、\`float\` 浮点、\`bool\` 布尔、\`str\` 字符串、\`NoneType\` 空值
- **多变量赋值**：\`a, b, c = 1, 2, 3\` 同时赋值；\`x = y = z = 0\` 链式赋值（同一对象）
- **任意精度整数**：\`2 ** 100\` 不会溢出，Python 自动用大整数表示
- **\`bool\` 是 \`int\` 子类**：\`True == 1\`、\`False == 0\`，\`isinstance(True, int)\` 为 \`True\`
- **类型转换**：\`int("42")\` / \`float("3.14")\` / \`str(123)\` / \`bool(0)\`
- **None 判空**：用 \`is None\` / \`is not None\`，**不要用** \`== None\`（\`==\` 可能被重载）

## 原理与机制
- **变量是标签**：Python 变量是"名字 → 对象引用"，不是 C 那种"内存盒子"；赋值只是把名字绑定到对象
- **小整数缓存**：\`-5\` 到 \`256\` 的整数被缓存复用，所以 \`a = 100; b = 100; a is b\` 为 \`True\`，但大整数不一定
- **可变 vs 不可变**：\`int/float/str/tuple\` 不可变（修改等于新建）；\`list/dict/set\` 可变（原地修改）
- **\`id()\` 看身份**：返回对象唯一标识，配合 \`is\` 判断两个变量是否指向同一对象

## 易错点与陷阱
- **可变默认值陷阱**：\`def f(x=[])\` 的 \`[]\` 只创建一次，多次调用会共享同一个列表（应改用 \`None\` + 内部判断）
- **\`is\` vs \`==\`**：\`is\` 比较身份（同一对象），\`==\` 比较值；\`[1,2] == [1,2]\` 为 \`True\`，\`[1,2] is [1,2]\` 为 \`False\`
- **\`None\` 比较**：永远用 \`is None\`，不要用 \`== None\`（在 numpy/pandas 等场景 \`== None\` 会出错）
- **\`bool(0)\` / \`bool("")\` 为 \`False\`**：判空时直接 \`if x:\` 即可，但要注意 \`0\` 和 \`""\` 也为假

## 实战建议
- 判空用 \`if not x:\`（同时处理 \`None / 0 / "" / []\`），明确判 \`None\` 才用 \`is None\`
- 函数参数若需要可变默认值，用 \`None\` 哨兵：\`def f(items=None): items = items or []\`
- 对性能敏感时复用小整数/短字符串，但日常代码不用过度优化
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
## 概述
运算符是构造表达式的基本构件。Python 的运算符设计很人性化：链式比较 (\`1 < x < 10\`)、海象运算符 (\`:=\`)、短路求值等都让代码更简洁。掌握运算符的语义细节能避免很多隐蔽 bug。

## 核心要点
- **算术运算符**：
  - \`+ - * /\` 标准；\`/\` 永远返回 \`float\`，即使整除
  - \`//\` 整除（floor 除法，向负无穷取整）
  - \`%\` 取模；\`**\` 幂运算（\`2 ** 10 = 1024\`）
- **比较运算符**：\`== != < > <= >=\`，支持**链式比较** \`1 < x <= 10\`（等价于 \`1 < x and x <= 10\`）
- **逻辑运算符**：\`and\` / \`or\` / \`not\`（不是 \`&&\` / \`||\` / \`!\`），返回操作数本身而非 bool
- **短路求值**：\`a or b\` 若 \`a\` 为真就不算 \`b\`；\`a and b\` 若 \`a\` 为假就不算 \`b\`
- **身份运算符** \`is\` / \`is not\`：比较对象身份（内存地址），用于 \`None\` / \`True\` / \`False\` 判断
- **成员运算符** \`in\` / \`not in\`：判断元素是否在容器中
- **海象运算符 \`:=\`**（3.8+）：在表达式内部赋值，避免重复调用

## 原理与机制
- **链式比较**：Python 把 \`a < b < c\` 编译成 \`a < b and b < c\`，但 \`b\` 只计算一次
- **\`/\` vs \`//\`**：\`/\` 是 true division 永远 float；\`//\` 是 floor division，对负数向负无穷取整（\`-7 // 2 = -4\`，不是 -3）
- **\`is\` 的本质**：比较 \`id(a) == id(b)\`，即两个变量是否指向同一对象
- **\`and/or\` 返回值**：\`a or b\` 返回第一个真值或最后一个值；\`a and b\` 返回第一个假值或最后一个值

## 易错点与陷阱
- **\`//\` 对负数**：\`-7 // 2\` 是 \`-4\` 不是 \`-3\`（floor 而非 truncate），如果想要截断用 \`int(-7 / 2)\`
- **\`is\` 误用**：\`a is b\` 对小整数/短字符串可能为 \`True\`（缓存），但不要依赖，比较值用 \`==\`
- **\`and/or\` 优先级**：\`and\` 高于 \`or\`，\`a or b and c\` 等价于 \`a or (b and c)\`
- **海象作用域**：\`:=\` 赋值的变量在当前作用域生效，但**不能**用于类属性赋值

## 实战建议
- 默认值惯用法：\`name = input_name or "anonymous"\`（比 if 更简洁）
- 海象在 while/推导式中最有用：\`while (n := get()): process(n)\`
- 比较值用 \`==\`，比较身份（None/True/False）才用 \`is\`
- 链式比较可读性更好，优先用 \`0 <= x < 100\` 而非 \`x >= 0 and x < 100\`
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
## 概述
Python 内置了大量常用函数，无需 import 即可使用。这些函数覆盖类型转换、数学运算、迭代、逻辑判断等场景，是日常开发的高频工具。熟练掌握能显著提升编码效率。

## 核心要点
- **类型/转换**：\`int() / float() / str() / bool() / list() / dict() / set() / tuple()\`
- **数学**：
  - \`abs(x)\` 绝对值；\`round(x, n)\` 四舍五入到 n 位小数
  - \`min/max(iterable)\` 取最小/最大；\`sum(iterable, start)\` 求和
  - \`divmod(a, b)\` 返回 \`(a // b, a % b)\`；\`pow(a, b, mod)\` 幂运算可选模
- **迭代工具**：
  - \`range(start, stop, step)\` 惰性整数序列
  - \`enumerate(iter, start)\` 同时拿索引和值
  - \`zip(*iters)\` 并行遍历多个序列（以最短的为准）
  - \`reversed(seq)\` 反转；\`sorted(iter, key, reverse)\` 排序返回新列表
- **逻辑判断**：\`all(iter)\` 全真才真；\`any(iter)\` 有真即真（短路）
- **类型检查**：\`isinstance(x, T)\` / \`issubclass(A, B)\` / \`callable(x)\`
- **属性操作**：\`hasattr(obj, name)\` / \`getattr(obj, name, default)\` / \`setattr(obj, name, value)\`
- **函数式**：\`map(fn, iter)\` / \`filter(pred, iter)\` 返回迭代器

## 原理与机制
- **\`range\` 是惰性的**：不一次性生成所有值，节省内存；\`range(10**10)\` 不会撑爆内存
- **\`sorted\` vs \`list.sort\`**：\`sorted\` 返回新列表不修改原对象；\`list.sort\` 原地排序返回 \`None\`
- **\`zip\` 以最短为准**：\`zip([1,2,3], [4,5])\` 只产生 2 对；想保留所有值用 \`itertools.zip_longest\`
- **\`map/filter\` 返回迭代器**：消费一次后为空，需要列表用 \`list(map(...))\`

## 易错点与陷阱
- **\`round\` 的银行家舍入**：\`round(2.5) = 2\`，\`round(3.5) = 4\`（四舍六入五成双），不是常规四舍五入
- **\`sum\` 的 \`start\` 参数**：\`sum([[1],[2]], [])\` 拼接列表，但更高效用 \`itertools.chain\`
- **\`bool(0.0)\` / \`bool("")\`**：0 / 空字符串 / 空容器都为 \`False\`，判空时直接 \`if x:\` 即可
- **\`min/max\` 空 iterable**：\`min([])\` 抛 \`ValueError\`，需提供 \`default\` 参数

## 实战建议
- 排序对象用 \`key=lambda x: x.field\` 而非 \`cmp\`（3.0 移除），需要复杂比较用 \`functools.cmp_to_key\`
- 遍历需要索引时优先 \`enumerate\` 而非 \`range(len(x))\`
- 批量判断用生成器：\`any(x > 5 for x in nums)\` 比列表推导更省内存
- \`map/filter\` 能用推导式替代就替代，可读性更好：\`[x*2 for x in nums if x > 0]\`
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