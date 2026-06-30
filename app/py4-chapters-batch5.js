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
## 一、概念解释

**列表推导式（List Comprehension）** 是 Python 中用一行表达式从一个可迭代对象构造新列表的语法糖。它把"循环 + 收集结果"两件事压成一条语句，既简洁又往往更快。

最通用的语法形式：

\`\`\`
[expr for x in iter if cond]
\`\`\`

读作：对 \`.iter\` 中的每个元素 \`x\`，若满足 \`if cond\`，则计算 \`expr\` 并把结果收集进新列表。三段顺序固定：**表达式 → 循环 → 过滤**。

## 二、设计原理

Python 之父 Guido 在 PEP 202 中提出列表推导，灵感来自 Haskell/SETL。其设计目标有两个：

1. **让"映射 + 过滤"这种最常见的列表构造写法更声明式**——直接描述"我要什么样的列表"，而不是描述"如何一步步填充列表"。
2. **在 CPython 解释器层面走 C 级快速路径**：推导式在编译后调用 \`LIST_APPEND\` 这条字节码，直接在 C 层追加元素，省去了 Python 层的 \`append\` 属性查找和函数调用开销。

## 三、比 for + append 更 Pythonic

同样是"把 1..10 平方后装进列表"：

\`\`\`python
# 写法 A：传统 for 循环
squares = []
for x in range(1, 11):
    squares.append(x * x)

# 写法 B：列表推导式
squares = [x * x for x in range(1, 11)]
\`\`\`

写法 B 把"做什么"（\`x * x\`）放在最前面，把"循环范围"放在后面，读起来像数学里的集合描述 \`{x² | x ∈ [1,10]}\`，这就是 **Pythonic** 的核心：贴近意图、贴近数学表达。

## 四、if 过滤 vs if...else 映射：位置决定语义

这是新手最常踩坑的地方。同样是 \`if\`，**放在循环后是"过滤"，放在表达式前是"映射"**。

\`\`\`python
nums = [1, 2, 3, 4, 5, 6]

# ① if 在循环之后 → 过滤：只保留偶数
evens = [x for x in nums if x % 2 == 0]
# 结果：[2, 4, 6]

# ② if...else 在表达式之前 → 映射：每个元素都进列表，但取值由条件决定
labels = ["even" if x % 2 == 0 else "odd" for x in nums]
# 结果：['odd', 'even', 'odd', 'even', 'odd', 'even']
\`\`\`

记忆口诀：

- **过滤型 if** 写在 \`for\` **后面**，没有 else，元素可能被丢弃；
- **映射型 if...else** 写在 \`for\` **前面**，是三目表达式，元素一个不丢，只是取值不同。

## 五、性能：C 级实现比 for 循环更快

\`\`\`python
import timeit

n = 1_000_000

# for + append
def loop_version():
    out = []
    for x in range(n):
        out.append(x * x)
    return out

# 列表推导
def comp_version():
    return [x * x for x in range(n)]

print(timeit.timeit(loop_version, number=3))   # 通常更慢
print(timeit.timeit(comp_version, number=3))   # 通常快 20%~40%
\`\`\`

原因：

1. 推导式调用的是 \`LIST_APPEND\` 字节码（C 层直追加），而 \`for + append\` 每次都要在 \`out\` 上做属性查找 \`append\`、再执行一次 Python 函数调用。
2. 推导式有自己的局部作用域，循环变量 \`x\` 不会污染外层命名空间（Python 3 起）。

## 六、和 map / filter 的对比

\`\`\`python
nums = [1, 2, 3, 4, 5]

# 平方
list(map(lambda x: x * x, nums))      # [1, 4, 9, 16, 25]
[x * x for x in nums]                 # 同上

# 过滤偶数
list(filter(lambda x: x % 2 == 0, nums))   # [2, 4]
[x for x in nums if x % 2 == 0]            # 同上

# 平方且只要偶数：map + filter 要嵌套两层 lambda
list(filter(lambda x: x % 2 == 0, map(lambda x: x * x, nums)))
[x * x for x in nums if x % x == 0 and x % 2 == 0]   # 推导式更直观
\`\`\`

经验法则：**当逻辑里出现 lambda + map/filter 组合，往往可以改写成更清晰的推导式**。但 \`map\` 接受已有函数名（如 \`map(str, nums)\`）时，可读性也不错，不必强改。

## 七、可读性取舍：超过 2 行就拆

推导式是"小工具"，不是"压缩器"。下面这种写法虽然是合法的，但已经失去可读性：

\`\`\`python
# ❌ 不推荐：嵌套 + 多条件 + 复杂表达式挤一行
result = [(x, y, x * y) for x in range(10) if x % 2 == 0 for y in range(10) if y > x if y < x + 5]

# ✅ 推荐：超过 2 行或 2 层 for 就改回普通循环
result = []
for x in range(10):
    if x % 2 == 0:
        for y in range(x + 1, x + 5):
            result.append((x, y, x * y))
\`\`\`

## 八、适用场景

1. **数据转换**：\`[line.strip() for line in lines]\`
2. **数据过滤**：\`[n for n in nums if n > 0]\`
3. **映射 + 过滤合一**：\`[x * x for x in nums if x % 2 == 0]\`
4. **展平一层嵌套**：\`[v for row in matrix for v in row]\`
5. **构造初值列表**：\`[0 for _ in range(9)]\`（注意不要用 \`[0] * 9\` 当元素是可变对象时）

## 九、易错点小结

| 易错点 | 错误写法 | 正确写法 | 说明 |
| --- | --- | --- | --- |
| if 位置混淆 | \`[x if x % 2 == 0 for x in nums]\` | \`[x for x in nums if x % 2 == 0]\` | 过滤型 if 必须在 for 之后，且不能单独 if 不带 else 放在表达式处 |
| 漏写 else | \`["even" if x%2==0 for x in nums]\` | \`["even" if x%2==0 else "odd" for x in nums]\` | 表达式位置的 if 必须配 else |
| 误用 \`*\` 复制可变元素 | \`[[0]*3]*3\` | \`[[0]*3 for _ in range(3)]\` | \`*\` 是浅复制，三行共享同一对象 |
| 推导式太复杂 | 多 for + 多 if 挤一行 | 拆成普通循环 | 超过 2 层 for 或 2 行就放弃推导 |
| 污染外层变量（Py2 遗留） | 以为 \`x\` 会泄漏 | Python 3 已修复 | 推导式有自己的作用域，循环变量不外泄 |
| 把推导式当语句用 | \`[print(x) for x in nums]\` | \`for x in nums: print(x)\` | 有副作用的动作不要用推导式，它返回的列表也用不上 |
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
## 一、概念解释

把列表推导式的方括号 \`[]\` 换成花括号 \`{}\`，就得到两种新的推导式：

- **字典推导式**：\`{k: v for x in iter if cond}\` —— 生成 \`dict\`，键值对用冒号分隔。
- **集合推导式**：\`{expr for x in iter if cond}\` —— 生成 \`set\`，单个表达式，无冒号。

辨别的关键在于：**花括号里有没有冒号**。有冒号 → 字典；无冒号 → 集合。空花括号 \`{}\` 在 Python 中表示空字典（不是空集合），空集合只能用 \`set()\`。

\`\`\`python
# 字典推导：键 → 值，注意冒号
{s: len(s) for s in ["ab", "abc", "abcd"]}
# {'ab': 2, 'abc': 3, 'abcd': 4}

# 集合推导：只有表达式，没有冒号
{len(s) for s in ["ab", "abc", "abcd"]}
# {2, 3, 4}
\`\`\`

## 二、设计原理

PEP 274 引入字典/集合推导式，目的是让"以可迭代对象为原料构造映射或去重集合"这件事也能像列表推导一样声明式表达，避免 \`dict()\` + \`zip()\` 或显式 \`for\` 循环的样板代码。底层上，字典推导走 \`MAP_ADD\`、集合推导走 \`SET_ADD\` 字节码，同样在 C 层直接插入元素，比 \`for + d[k] = v\` 更快。

## 三、和列表推导的语法对比

| 维度 | 列表推导 | 字典推导 | 集合推导 |
| --- | --- | --- | --- |
| 定界符 | \`[]\` | \`{}\` | \`{}\` |
| 表达式 | 单个 \`expr\` | 键值对 \`k: v\` | 单个 \`expr\` |
| 结果类型 | \`list\` | \`dict\` | \`set\` |
| 是否去重 | 否 | 键去重 | 元素去重 |
| 是否有序 | 是（按生成顺序） | 是（Py3.7+ 保持插入顺序） | 否（无序） |
| 索引访问 | \`lst[i]\` | \`d[k]\` | 不支持 |

\`\`\`python
nums = [1, 2, 2, 3, 3, 3]

[x for x in nums]              # [1, 2, 2, 3, 3, 3]   保留重复
{x: 1 for x in nums}          # {1: 1, 2: 1, 3: 1}   键去重
{x for x in nums}             # {1, 2, 3}            元素去重
\`\`\`

## 四、经典用途 1：构建映射表

把一组数据按某种规则映射成字典，是最常见的场景。

\`\`\`python
names = ["alice", "bob", "carol"]
# 名字 → 长度
lengths = {n: len(n) for n in names}
# {'alice': 5, 'bob': 3, 'carol': 5}

# 名字 → 首字母大写
capitalized = {n: n.capitalize() for n in names}
# {'alice': 'Alice', 'bob': 'Bob', 'carol': 'Carol'}
\`\`\`

逐行讲解：

- \`{n: len(n) for n in names}\`：对 \`names\` 中每个 \`n\`，用 \`n\` 作为键、\`len(n)\` 作为值，组装进新字典。
- 冒号 \`:\` 是字典推导的标志，前面是键、后面是值。

## 五、经典用途 2：反转键值

把一个字典的键和值互换。当值唯一时，反转后还能再反转回来；当值重复时，后写的键会覆盖前面的。

\`\`\`python
d = {"a": 1, "b": 2, "c": 3}
reversed_d = {v: k for k, v in d.items()}
# {1: 'a', 2: 'b', 3: 'c'}
\`\`\`

逐行讲解：

- \`d.items()\` 返回 \`(键, 值)\` 元组序列；
- \`for k, v in d.items()\` 解包成两个变量；
- \`{v: k ...}\` 把原来的值 \`v\` 当键、原来的键 \`k\` 当值，实现反转。

**注意**：若原字典有重复值，反转后只会保留最后一个键：

\`\`\`python
d = {"a": 1, "b": 1}
{v: k for k, v in d.items()}   # {1: 'b'}，'a' 被覆盖
\`\`\`

## 六、经典用途 3：过滤字典

按值筛选符合条件的键值对，常用于"从成绩表里挑出及格的人"。

\`\`\`python
scores = {"alice": 90, "bob": 55, "carol": 85, "dave": 40}
passed = {k: v for k, v in scores.items() if v >= 60}
# {'alice': 90, 'carol': 85}
\`\`\`

\`if v >= 60\` 写在 \`for\` 之后，是过滤条件（和列表推导规则一致），不满足的元素直接丢弃。

## 七、经典用途 4：分组统计

利用"键去重 + 值累加"的组合，可以一行完成计数。下面这种写法虽然简洁，但效率不高（\`words.count\` 是 O(n)，整体 O(n²)）；数据量大时建议用 \`collections.Counter\`。

\`\`\`python
words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
counts = {w: words.count(w) for w in set(words)}
# {'apple': 3, 'banana': 2, 'cherry': 1}
\`\`\`

逐行讲解：

- \`set(words)\` 先去重得到不重复的单词集合；
- 对每个不重复单词 \`w\`，用 \`words.count(w)\` 数它在原列表中出现的次数；
- 组装成 \`{单词: 次数}\` 字典。

更高效的写法：

\`\`\`python
from collections import Counter
counts = dict(Counter(words))   # O(n)
\`\`\`

## 八、经典用途 5：去重应用

集合推导天然去重，比 \`list(set(xs))\` 更灵活，因为可以在去重的同时做转换。

\`\`\`python
words = ["hello", "HELLO", "world", "WORLD", "python"]
# 大小写无关去重：转小写后再装进集合
lower_unique = {w.lower() for w in words}
# {'hello', 'world', 'python'}
\`\`\`

对比 \`list(set(words))\`：那只去重完全相同的字符串，无法先做小写转换。

## 九、适用场景速查

| 场景 | 推荐写法 | 例子 |
| --- | --- | --- |
| 构建映射表 | 字典推导 | \`{n: len(n) for n in names}\` |
| 反转键值 | 字典推导 | \`{v: k for k, v in d.items()}\` |
| 过滤字典 | 字典推导 + if | \`{k: v for k, v in d.items() if v > 0}\` |
| 简单去重 | 集合推导 | \`{x for x in nums}\` |
| 转换后去重 | 集合推导 | \`{line.strip() for line in lines}\` |
| 计数 | 字典推导 / Counter | \`{w: words.count(w) for w in set(words)}\` |

## 十、易错点小结

| 易错点 | 错误写法 | 正确写法 | 说明 |
| --- | --- | --- | --- |
| 漏冒号变集合 | \`{n for n in names}\`（想要字典） | \`{n: ... for n in names}\` | 没有 \`:\` 就是集合推导 |
| 空花括号以为是空集合 | \`{}\` | \`set()\` | \`{}\` 是空字典 |
| 反转时值重复丢键 | 以为 \`{v:k ...}\` 安全 | 先检查值是否唯一 | 后写覆盖前写，数据丢失无警告 |
| 用可变对象当键 | \`{[1,2]: 'a' ...}\` | 改用元组 \`(1,2)\` | dict 键必须可哈希，list/set/dict 都不行 |
| 依赖集合顺序 | \`for x in {3,1,2}\` 想按顺序 | 改用列表或 \`sorted()\` | 集合无序，遍历顺序不保证 |
| 大数据用 \`.count\` 计数 | \`{w: xs.count(w) for w in set(xs)}\` | \`Counter(xs)\` | O(n²) 在大数据下会卡住 |
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
## 一、概念解释

**生成器表达式（Generator Expression）** 是列表推导式的"惰性版本"：把方括号 \`[]\` 换成圆括号 \`()\`，它不再一次性生成全部结果，而是返回一个 \`generator\` 对象，**每次只产出一个值**，要一个算一个。

\`\`\`
(expr for x in iter if cond)
\`\`\`

\`\`\`python
# 列表推导：立刻算出全部，占用整块内存
lst = [x * x for x in range(5)]      # [0, 1, 4, 9, 16]

# 生成器表达式：返回一个生成器对象，什么都没算
gen = (x * x for x in range(5))      # <generator object ...>
print(next(gen))   # 0  —— 现才算第一个
print(next(gen))   # 1
print(list(gen))   # [4, 9, 16]  —— 把剩下的全取出来
\`\`\`

## 二、惰性求值原理

列表推导式在执行时，会**立刻遍历整个可迭代对象**，把所有结果算好放进一个新列表里。生成器表达式则像"挂起的循环"：

- 创建生成器对象时，**什么计算都没发生**；
- 调用 \`next()\` 时，才推进循环到下一次 \`yield\`，产出一个值；
- 调用者不再要值（耗尽、抛出 \`StopIteration\`、或被垃圾回收）时，生成器就停。

这种"按需计算"的模式叫 **惰性求值（lazy evaluation）**，对应的概念是"拉取式"数据流：消费者要一个，生产者给一个。

\`\`\`python
gen = (x * x for x in range(3))

# 等价于下面这个生成器函数：
def gen_func():
    for x in range(3):
        yield x * x
\`\`\`

事实上，生成器表达式就是上面这种 \`yield\` 生成器函数的语法糖，只是写得更紧凑。

## 三、内存优势：对比 list 占用

生成器对象本身只是一个固定大小的小结构（约 100~200 字节），不管它背后要产出 10 个还是 10 亿个值，自身占用基本不变。而列表推导要为每个元素分配内存。

\`\`\`python
import sys

lst = [x * x for x in range(1_000_000)]   # 立刻分配 ~8MB+
gen = (x * x for x in range(1_000_000))   # 几乎不占内存

print(sys.getsizeof(lst))   # 8448728 字节左右
print(sys.getsizeof(gen))   # 200 字节左右
\`\`\`

注意 \`sys.getsizeof(gen)\` 只测量生成器对象本身的"外壳"大小，不包括背后引用的可迭代对象；但它确实反映了"生成器不持有结果列表"这一事实。

## 四、只能消费一次：耗尽即空

生成器是"一次性流"，**没有回头路**。一旦迭代到末尾，再次遍历就是空的，不能像列表那样反复用。

\`\`\`python
gen = (x * x for x in range(5))

print(list(gen))   # [0, 1, 4, 9, 16]
print(list(gen))   # []  —— 已经耗尽！

# 列表则可以反复遍历
lst = [x * x for x in range(5)]
print(list(lst))   # [0, 1, 4, 9, 16]
print(list(lst))   # [0, 1, 4, 9, 16]  —— 仍然完整
\`\`\`

原因：生成器内部维护一个"当前位置指针"，迭代时只前进不回退；耗尽后指针已到末尾，没有"重新开始"的机制。如果需要多次遍历，要么重新创建一个生成器，要么改用列表。

## 五、和 sum / max / min / any / all 配合：无需额外括号

这是生成器表达式最舒服的用法。当一个函数只接收**一个**可迭代参数时，Python 允许省略生成器表达式外面的圆括号，直接写：

\`\`\`python
# 标准写法
print(sum((x * x for x in range(100))))   # 328350

# 省略外层括号，更简洁
print(sum(x * x for x in range(100)))     # 328350

# 配合 max / min / any / all 都很自然
print(max(x for x in range(100) if x % 7 == 0))   # 98
print(any(x > 5 for x in range(3)))               # False
print(all(x < 10 for x in range(5)))              # True
\`\`\`

逐行讲解：

- \`sum(x * x for x in range(100))\`：\`sum\` 是单参数函数，生成器表达式省略外层括号；\`sum\` 内部逐次 \`next()\` 取值累加，全程不构造中间列表。
- \`any(x > 5 for x in range(3))\`：\`any\` 在遇到第一个 \`True\` 时就短路返回；这里 \`range(3)\` 全是 0、1、2，没有大于 5 的，所以遍历完返回 \`False\`。

**省略括号只对"单参数函数调用"有效**，多参数或嵌套时仍需加括号：

\`\`\`python
# 错误：sorted 还接收 key/reverse 参数，外层括号不能省
sorted((x for x in nums), reverse=True)
\`\`\`

## 六、和生成器函数 yield 的关系

生成器表达式和 \`def + yield\` 的生成器函数本质相同，都是返回 \`generator\` 对象、按需产出值。区别只在写法：

| 维度 | 生成器表达式 | 生成器函数 |
| --- | --- | --- |
| 语法 | \`(expr for x in iter)\` 一行 | \`def f(): yield ...\` 多行 |
| 复杂度 | 单表达式，无法写多语句 | 可以写任意控制流、try/except |
| 参数 | 只能从可迭代对象取值 | 可以接收参数、维护状态 |
| 复用 | 一次性，每次要重新写表达式 | 函数可重复调用得到新生成器 |
| 适用 | 简单的映射/过滤流 | 复杂逻辑、有状态的迭代器 |

\`\`\`python
# 生成器表达式：简单转换
def squares_gen(n):
    return (x * x for x in range(n))

# 生成器函数：能写更复杂的逻辑
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b
\`\`\`

经验：能用一行表达式说清楚的，用生成器表达式；需要 \`if/elif\`、\`try\`、多步计算、跨调用维护状态时，用生成器函数。

## 七、何时用生成器表达式，何时用列表推导

判断依据很简单：**是否需要多次遍历、随机索引、或反复合并**。

| 需求 | 选择 | 原因 |
| --- | --- | --- |
| 只算一次聚合（sum/max/any/all/any） | 生成器表达式 | 省内存，不需要中间列表 |
| 流式处理大文件、大数据 | 生成器表达式 | 不可能把全部数据装进内存 |
| 需要多次遍历同一份数据 | 列表推导 | 生成器耗尽即空，无法复用 |
| 需要 \`lst[i]\` 索引、切片 | 列表推导 | 生成器不支持索引/切片 |
| 需要 \`len()\` | 列表推导 | 生成器没有长度（除非耗尽它） |
| 结果要做多次 \`in\` 查询 | 列表/集合 | 生成器 \`in\` 查询要消费元素 |
| 嵌套进另一推导式当 \`iter\` | 都可以，生成器更省内存 | 列表会建中间结果 |

\`\`\`python
# ✅ 一次聚合：用生成器表达式
total = sum(int(line) for line in open("big.txt"))

# ✅ 需要反复用：用列表推导
squares = [x * x for x in range(100)]
print(sum(squares))
print(max(squares))
print(squares[50])     # 索引访问
\`\`\`

## 八、实战：流式处理大文件

\`\`\`python
import io

# 模拟一个逐行产生数据的大文件
data = io.StringIO("1\\n2\\n3\\n4\\n5\\n")

# 生成器表达式逐行读取 + 转换 + 求和，全程不把所有行同时放进内存
total = sum(int(line.strip()) for line in data)
print("total:", total)   # 15
\`\`\`

逐行讲解：

- \`for line in data\`：文件对象本身也是惰性迭代器，按行产出；
- \`int(line.strip())\`：每行去掉空白后转整数；
- \`sum(...)\`：把生成器喂给 \`sum\`，逐项累加；
- 整条流水线：磁盘 → 行迭代器 → 生成器表达式 → \`sum\`，全程只有"当前这一行"在内存里。

## 九、易错点小结

| 易错点 | 错误写法/理解 | 正确做法 | 说明 |
| --- | --- | --- | --- |
| 以为能反复遍历 | \`g = (...); list(g); list(g)\` 想拿两次 | 重新构造生成器或用列表 | 生成器耗尽即空 |
| 想索引访问 | \`g[0]\` | 改用列表或 \`next(g)\` | 生成器不支持 \`[]\` |
| 想取长度 | \`len(g)\` | \`len(list(g))\` 或边遍历边数 | 生成器没有 \`__len__\` |
| 多参数函数漏括号 | \`sorted(x for x in s, key=...)\` | \`sorted((x for x in s), key=...)\` | 仅单参数调用才能省外层括号 |
| 提前消费破坏后续 | \`next(g)\` 后又 \`list(g)\` | 注意 \`next\` 会"吃掉"一个值 | 生成器有内部指针，前进不回退 |
| 把生成器当列表返回 | \`return (x for x in s)\` 给外部多次用 | 改返回列表或封装成函数 | 调用方拿到的也是一次性对象 |
| 误以为省内存就一定快 | 大数据用生成器做多次聚合 | 一次聚合用生成器，多次用列表 | 生成器每次都要重算，列表复用更快 |
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
## 一、概念解释

**嵌套推导式** 是在一条推导式里写多个 \`for\` 子句，逻辑等价于多层嵌套循环。语法：

\`\`\`
[expr for x in iter1 for y in iter2 for z in iter3 if cond]
\`\`\`

读法：**从左到右就是从外到内的循环层次**。第一个 \`for\` 是最外层，最后一个 \`for\` 是最内层，与手写嵌套 \`for\` 的顺序完全一致。

\`\`\`python
# 推导式：两层 for
pairs = [(x, y) for x in range(2) for y in range(2)]
# [(0,0), (0,1), (1,0), (1,1)]

# 等价的嵌套 for
pairs = []
for x in range(2):
    for y in range(2):
        pairs.append((x, y))
# 顺序完全相同
\`\`\`

## 二、设计原理：为什么 for 的顺序是这样

PEP 202 规定推导式中 \`for\` 的顺序"与等价的嵌套循环一致"。这样设计的妙处在于：

- **可以机械地把推导式展开成多层 for**：照抄 \`for\` 子句的顺序，从外到内一层层写；
- **反过来说，也能把多层 for 机械地压成推导式**：把循环头按原顺序排进推导式即可。

记忆口诀：**"for 写在前面的，是外层循环"**。

## 三、经典用途 1：展平矩阵

把二维列表压成一维，是嵌套推导式最常见的应用。

\`\`\`python
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [v for row in matrix for v in row]
# [1, 2, 3, 4, 5, 6, 7, 8, 9]
\`\`\`

逐行讲解：

- 第一个 \`for row in matrix\`：外层循环，逐行取出 \`[1,2,3]\`、\`[4,5,6]\`、\`[7,8,9]\`；
- 第二个 \`for v in row\`：内层循环，对当前 \`row\` 逐元素取出 \`v\`；
- 表达式 \`v\`：把每个元素直接收进结果列表。

等价的嵌套循环：

\`\`\`python
flat = []
for row in matrix:          # 外层
    for v in row:           # 内层
        flat.append(v)
\`\`\`

对比 \`itertools.chain.from_iterable\`：标准库提供了同样功能且更高效，但推导式更直观、可加过滤条件。

## 四、经典用途 2：多层 for + 过滤

笛卡尔积加条件筛选，比如生成"不重复的二元组"。

\`\`\`python
combos = [(x, y) for x in range(1, 4) for y in range(1, 4) if x != y]
# [(1,2),(1,3),(2,1),(2,3),(3,1),(3,2)]
\`\`\`

逐行讲解：

- \`for x in range(1, 4)\`：外层 x 取 1、2、3；
- \`for y in range(1, 4)\`：内层 y 取 1、2、3；
- \`if x != y\`：过滤掉 x == y 的组合（在两个 for 都结束后判断）；
- 表达式 \`(x, y)\`：把符合条件的组合成元组收集。

## 五、经典用途 3：嵌套字典推导

字典推导也可以多层 \`for\`，常用于把"嵌套字典"压成"扁平字典"。

\`\`\`python
students = {
    "alice": {"math": 90, "eng": 85},
    "bob":   {"math": 75, "eng": 95},
}

all_scores = {
    f"{name}_{subj}": score
    for name, scores in students.items()
    for subj, score in scores.items()
}
# {'alice_math': 90, 'alice_eng': 85, 'bob_math': 75, 'bob_eng': 95}
\`\`\`

逐行讲解：

- 外层 \`for name, scores in students.items()\`：解包出学生姓名和该学生的科目字典；
- 内层 \`for subj, score in scores.items()\`：再解包出科目和分数；
- 表达式 \`f"{name}_{subj}": score\`：用 \`name_subject\` 作为键、分数作为值，组装扁平字典。

## 六、经典用途 4：转置矩阵

把矩阵的行列互换，行 i 列 j → 行 j 列 i。可以用"列表推导嵌套列表推导"实现。

\`\`\`python
matrix = [[1, 2, 3],
          [4, 5, 6],
          [7, 8, 9]]

# 外层推导生成新矩阵的每一行（即原矩阵的每一列）
transposed = [[row[i] for row in matrix] for i in range(len(matrix[0]))]
# [[1, 4, 7], [2, 5, 8], [3, 6, 9]]
\`\`\`

逐行讲解：

- 外层 \`for i in range(len(matrix[0]))\`：遍历原矩阵的列索引 0、1、2；
- 内层 \`for row in matrix\`：对每个列索引，遍历所有行；
- 表达式 \`row[i]\`：取出第 i 列的元素；
- 外层用 \`[]\` 包起来：每生成一列就组装成一个新行。

更地道的写法是 \`zip(*matrix)\`：

\`\`\`python
list(zip(*matrix))   # [(1,4,7), (2,5,8), (3,6,9)]
\`\`\`

\`*\` 把矩阵解包成多个参数喂给 \`zip\`，\`zip\` 按位置配对，正好完成转置。

## 七、陷阱：\`[[0]*9]*9\` 浅复制导致行共享引用

构造二维初值矩阵时，新手常犯的错：

\`\`\`python
# ❌ 错误：所有行都是同一个列表对象
board = [[0] * 9] * 9
board[0][0] = 1
print(board[1][0])   # 1！第二行也被改了
\`\`\`

原因拆解：

- \`[0] * 9\` 生成一个长度为 9 的列表 \`[0,0,...,0]\`（元素是不可变整数，没问题）；
- \`[...] * 9\` 把这个**同一个列表对象**复制了 9 次引用，9 个"行"全部指向同一个内存；
- 改任一行的任一元素，所有行都跟着变。

正确写法：用推导式，每行都新建一个列表。

\`\`\`python
# ✅ 正确：每次循环都新建一行
board = [[0] * 9 for _ in range(9)]
board[0][0] = 1
print(board[1][0])   # 0，互不影响
\`\`\`

为什么 \`[0] * 9\` 安全而 \`[[...]] * 9\` 不安全？因为整数 0 不可变，"共享同一个 0"不会出问题；而内层列表可变，"共享同一个列表"就会被改坏。一句话：**\`*\` 复制的是引用，不是深拷贝**；当元素是可变对象时就有共享陷阱。

## 八、可读性边界：超过 2 层就拆

嵌套推导式威力大但容易写过头。一个经验法则：

| 嵌套层数 | 建议 |
| --- | --- |
| 1 层 for | 推导式首选，清晰 |
| 2 层 for（展平、笛卡尔积） | 推导式可接受，注意分行写 |
| 3 层及以上 | 改回普通 for 循环，或拆成多个步骤 |
| 嵌套字典推导里套列表推导 | 拆开，命名中间变量 |

\`\`\`python
# ❌ 太复杂：3 层 for + 多 if，没人能一眼看懂
result = [(x, y, z) for x in range(5) if x % 2 == 0
                     for y in range(5) if y > x
                     for z in range(5) if z == x + y]

# ✅ 拆成普通循环
result = []
for x in range(5):
    if x % 2 == 0:
        for y in range(x + 1, 5):
            for z in range(5):
                if z == x + y:
                    result.append((x, y, z))
\`\`\`

可读性比"短"更重要。当推导式需要换行才能放下、或者要回读两遍才理解时，就该拆了。

## 九、适用场景速查

| 场景 | 推荐写法 | 例子 |
| --- | --- | --- |
| 展平二维列表 | 嵌套推导 | \`[v for row in m for v in row]\` |
| 笛卡尔积 + 过滤 | 嵌套推导 | \`[(x,y) for x in A for y in B if x!=y]\` |
| 扁平化嵌套字典 | 嵌套字典推导 | \`{f"{a}_{b}":v for a,d in m.items() for b,v in d.items()}\` |
| 转置矩阵 | 嵌套推导 / zip | \`[list(col) for col in zip(*m)]\` |
| 构造初值二维数组 | 推导式（非 \`*\`） | \`[[0]*n for _ in range(m)]\` |
| 3 层及以上嵌套 | 普通循环 | 拆开，命名中间变量 |

## 十、易错点小结

| 易错点 | 错误写法 | 正确写法 | 说明 |
| --- | --- | --- | --- |
| for 顺序写反 | \`[v for v in row for row in matrix]\` | \`[v for row in matrix for v in row]\` | 第一个 for 是外层，名字必须先在前面定义 |
| 内层引用未定义变量 | \`[y for y in x for x in A]\` | \`[y for x in A for y in x]\` | 内层变量不能比外层先出现 |
| \`*\` 浅复制二维数组 | \`[[0]*n]*m\` | \`[[0]*n for _ in range(m)]\` | 行共享同一引用，改一行全变 |
| 转置用错长度 | \`for i in range(len(matrix))\` | \`for i in range(len(matrix[0]))\` | 列数才是新矩阵的行数，矩形矩阵要小心 |
| 推导式套太深 | 3 层 for 挤一行 | 拆成普通循环 | 超过 2 层就放弃推导，优先可读性 |
| 把过滤 if 放错位置 | \`[x if cond for x in xs for y in ys]\` | \`[... for x in xs for y in ys if cond]\` | 过滤 if 在所有 for 之后；映射 if...else 在最前 |
| 忘了内层可以是任意可迭代 | 只用列表当内层 | 也可用字符串、range、生成器 | \`for ch in word\`、\`for line in file\` 都行 |
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