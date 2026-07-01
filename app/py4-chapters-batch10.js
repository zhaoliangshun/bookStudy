// =============================================================
// Batch 10：迭代器与生成器（4 章）
// 37. py4-iter         迭代器协议、__iter__/__next__、iter()
// 38. py4-gen          生成器：yield、yield from、send
// 39. py4-itertools    itertools：chain/islice/groupby/product
// 40. py4-gen-adv     生成器进阶：协程、send、throw、close
// =============================================================

export const chapters = [
  {
    id: "py4-iter",
    group: "迭代器与生成器",
    icon: "🔁",
    title: "迭代器协议：__iter__/__next__",
    content: `
## 一、概念解释

**迭代器协议(Iterator Protocol)** 是 Python 遍历集合的核心机制,由两个魔法方法组成:

- \`__iter__()\`:返回一个迭代器对象。标识"我是可被迭代的"。
- \`__next__()\`:返回下一个值;没有更多值时**必须**抛出 \`StopIteration\` 异常。

只要一个对象同时实现这两个方法,它就是**迭代器(iterator)**;只实现 \`__iter__\` 的对象称为**可迭代对象(iterable)**。关键区别:可迭代对象"能被 for 遍历"但本身不能直接 \`next()\`;迭代器才能被 \`next()\` 取值。

\`\`\`python
lst = [1, 2, 3]                       # 可迭代,但没有 __next__
print(hasattr(lst, '__iter__'))       # True
print(hasattr(lst, '__next__'))       # False

it = iter(lst)                        # 等价于 lst.__iter__(),拿到迭代器
print(hasattr(it, '__next__'))        # True
print(next(it), next(it), next(it))   # 1 2 3
\`\`\`

## 二、设计原理

Python 把"遍历"抽象成**协议**而非基类,有三个好处:

1. **鸭子类型**:任何对象只要实现协议就能被 for 使用,不必继承特定类。
2. **职责分离**:可迭代对象负责"创建迭代器",迭代器负责"取出下一个值"。一个可迭代对象每次 \`iter()\` 可返回不同的迭代器。
3. **统一接口**:\`for / sum / max / min / list(...) / 解包\` 都依赖这套协议,一次实现处处可用。

为什么用 \`StopIteration\` 异常而不是返回 \`None\` 表示结束?因为 \`None\` 可能是合法数据(如 \`[1, None, 3]\`),异常机制能干净地表达"真的耗尽了"。

## 三、使用场景

- 自定义容器(树、图、链表)需要被 for 遍历
- 流式数据(读文件、网络读取)逐行产出,避免一次性载入
- 把带状态的函数(如反复调用 \`random\`)包装成迭代器
- 大数据集按需产出,节省内存

## 四、代码逐行讲解

### 1. 自定义迭代器 Countdown

\`\`\`python
class Countdown:
    def __init__(self, start):
        self.n = start            # 保存起始计数
    def __iter__(self):
        return self               # 自己就是迭代器,直接返回 self
    def __next__(self):
        if self.n <= 0:           # 计数到 0,触发结束
            raise StopIteration   # 必须抛这个异常,for 才知道停止
        self.n -= 1               # 先减
        return self.n + 1         # 返回 start, start-1, ..., 1

for x in Countdown(5):            # 输出 5 4 3 2 1
    print("cd:", x)
\`\`\`

**for 循环的本质** —— 下面两段代码完全等价:

\`\`\`python
for x in Countdown(5):
    print(x)

# 等价写法
_it = iter(Countdown(5))          # 调 __iter__
while True:
    try:
        x = next(_it)             # 调 __next__
    except StopIteration:
        break
    print(x)
\`\`\`

### 2. iter(callable, sentinel) 第二种形式

\`\`\`python
import random
rand_iter = iter(lambda: random.randint(1, 6), 6)
# 每次调用 lambda 取值,返回值等于 6 时停止(6 本身不产出)
for x in rand_iter:
    results.append(x)
\`\`\`

适合"不知道长度、但有终止信号"的场景:读文件直到 EOF、轮询传感器直到阈值。

### 3. 迭代器只能遍历一次

\`\`\`python
it2 = iter([1, 2, 3])
print("first:", list(it2))    # [1, 2, 3]
print("second:", list(it2))   # []  ← 已耗尽
\`\`\`

迭代器内部有"游标"状态,耗尽后不会自动重置。要再遍历必须重新 \`iter()\` 拿新迭代器。

## 五、对比:可迭代 vs 迭代器

| 维度 | 可迭代 iterable | 迭代器 iterator |
|------|----------------|----------------|
| 必备方法 | \`__iter__\` | \`__iter__\` + \`__next__\` |
| 是否可重复遍历 | 是(每次 iter 新建迭代器) | 否(耗尽即空) |
| \`next()\` 是否可用 | 否 | 是 |
| 典型代表 | list/tuple/dict/str/set/range | \`iter(...)\` 返回值、文件对象、生成器 |
| 多次 for 后状态 | 每次从 0 开始 | 第二次为空 |

## 六、易错点小结

| 易错点 | 现象 | 正确做法 |
|-------|------|---------|
| 忘记抛 \`StopIteration\` | for 死循环 | \`__next__\` 末尾必须 raise StopIteration |
| \`__iter__\` 返回非迭代器 | \`TypeError: iter() returned non-iterator\` | 返回值必须实现 \`__next__\` |
| 迭代器复用 | 第二次 \`list()\` 为空 | 重新 \`iter(obj)\` 或缓存为 list |
| 对 list 直接 \`next()\` | \`TypeError\` | 先 \`it = iter(lst)\` |
| \`iter(callable, sentinel)\` 记错 | sentinel 被产出 | sentinel 不产出,匹配即停 |
| 自递归 \`__iter__\` 调用 | 栈溢出 | \`__iter__\` 返回新迭代器,不要递归 |
`,
    code: `# 自定义迭代器
class Countdown:
    def __init__(self, start):
        self.n = start
    def __iter__(self):
        return self
    def __next__(self):
        if self.n <= 0:
            raise StopIteration
        self.n -= 1
        return self.n + 1

for x in Countdown(5):
    print("cd:", x)

# iter(callable, sentinel)
import random
# 一直掷骰子直到掷出 6
rand_iter = iter(lambda: random.randint(1, 6), 6)
results = []
for x in rand_iter:
    results.append(x)
print("rolls before 6:", results)

# 可迭代 vs 迭代器
lst = [1, 2, 3]
it = iter(lst)                 # 获取迭代器
print(next(it), next(it), next(it))
try:
    next(it)                   # StopIteration
except StopIteration:
    print("迭代结束")

# 迭代器只能消费一次
it2 = iter([1, 2, 3])
print("first:", list(it2))
print("second:", list(it2))    # []
`,
  },
  {
    id: "py4-gen",
    group: "迭代器与生成器",
    icon: "⚙️",
    title: "生成器：yield、yield from",
    content: `
## 一、概念解释

**生成器(Generator)** 是一种特殊的迭代器,用函数语法定义,通过 \`yield\` 关键字产出值。

- **生成器函数**:函数体中包含 \`yield\` 关键字,调用它**不会执行函数体**,而是返回一个生成器对象。
- **yield 暂停机制**:执行到 \`yield value\` 时,把 \`value\` 返回给调用方并**暂停**;下次 \`next()\` 时从暂停处继续执行,直到下一个 \`yield\` 或函数结束。
- **自动实现迭代器协议**:生成器对象自带 \`__iter__\`(返回自身)和 \`__next__\`,无需手写。
- **yield from**:把一个子迭代器的所有值"委托"产出,等价于 \`for x in sub: yield x\`,但还支持双向通信。

\`\`\`python
def count_up_to(n):
    i = 1
    while i <= n:
        yield i        # 产出 i 并暂停
        i += 1         # 下次 next() 从这里继续

g = count_up_to(3)
print(type(g))                    # <class 'generator'>
print(next(g), next(g), next(g))  # 1 2 3
\`\`\`

## 二、设计原理

生成器背后是**协程帧(stack frame)的暂停与恢复**:

1. 普通函数调用后栈帧一气呵成执行完就销毁;生成器函数的栈帧被"冻结"保存,等到 \`next()\` 才解冻。
2. \`yield\` 既是"返回值"也是"挂起点":它把控制权交还给调用方,同时保留所有局部变量。
3. 这种"惰性求值(lazy evaluation)"让生成器**不需要预先构造全部数据**,只在实际被消费时才计算。

为什么用 \`yield\` 而不是 \`return list\`?因为:

- 大数据集(1 亿个数)用 list 会撑爆内存,生成器只占固定空间。
- 无限序列(\`while True: yield\`)根本不可能用 list 表达。
- 流水线(pipeline)场景下,各阶段可以边产边消费,内存友好。

## 三、使用场景

- **惰性序列**:只在实际需要时才计算,如读取大文件每行
- **无限流**:\`while True: yield\` 表达自然数、事件流
- **数据管道**:多个生成器串联,逐级转换数据
- **替代手写迭代器**:用 \`yield\` 比写 \`__iter__/__next__\` 简洁得多
- **递归扁平化**:\`yield from\` 处理嵌套结构

## 四、代码逐行讲解

### 1. 基础生成器与斐波那契

\`\`\`python
def count_up_to(n):
    i = 1
    while i <= n:
        yield i        # 产出 i,暂停
        i += 1         # 恢复后继续

for x in count_up_to(5):
    print("yield:", x)  # 1 2 3 4 5

def fib(limit):
    a, b = 0, 1
    while a < limit:
        yield a        # 边算边产
        a, b = b, a + b
print("fib:", list(fib(50)))  # [0, 1, 1, 2, 3, 5, 8, ...]
\`\`\`

注意 \`a, b = b, a + b\` 是同时赋值:右侧先用旧的 a、b 求值,再一次性赋给左侧,因此不需要临时变量。

### 2. yield from 委托子迭代器

\`\`\`python
def chain(*iters):
    for it in iters:
        yield from it    # 把 it 的每个值逐个产出
print("chain:", list(chain([1, 2], (3, 4), "ab")))
# [1, 2, 3, 4, 'a', 'b']
\`\`\`

\`yield from it\` 等价于 \`for x in it: yield x\`,但它**还透明转发 send/throw/close**,在协程场景下不可或缺。也常用于递归扁平化:

\`\`\`python
def flatten(items):
    for x in items:
        if isinstance(x, list):
            yield from flatten(x)   # 递归委托
        else:
            yield x
print(list(flatten([1, [2, [3, 4]], 5])))  # [1, 2, 3, 4, 5]
\`\`\`

### 3. 无限流

\`\`\`python
def infinite_counter(start=0):
    while True:
        yield start
        start += 1

from itertools import islice
print("first 5:", list(islice(infinite_counter(100), 5)))
# [100, 101, 102, 103, 104]
\`\`\`

\`while True: yield\` 不会卡死,因为每次 yield 都把控制权还给调用方。必须配合 \`islice\` / \`takewhile\` 等取有限个,否则 for 会无限循环。

### 4. 生成器表达式(语法糖)

\`\`\`python
gen = (x * x for x in range(10_000_000))
print("type:", type(gen))    # <class 'generator'>
print("first 3:", list(islice(gen, 3)))  # [0, 1, 4]
\`\`\`

\`(expr for x in iterable)\` 是生成器函数的**语法糖**,等价于:

\`\`\`python
def _gen():
    for x in range(10_000_000):
        yield x * x
gen = _gen()
\`\`\`

\`[expr for x in ...]\` 是列表推导(立即生成全部),\`(expr for x in ...)\` 是生成器(惰性)。一千万个元素,列表推导要数百 MB,生成器只占几十字节。

## 五、对比:生成器 vs 普通函数 vs 列表推导

| 维度 | 普通函数 return | 生成器函数 yield | 列表推导 [...] | 生成器表达式 (...) |
|------|----------------|-----------------|---------------|-------------------|
| 返回值 | 单个值 | 生成器对象 | list | 生成器对象 |
| 执行时机 | 立即执行 | 调用时不执行,next 时执行 | 立即构造全部 | 惰性 |
| 内存 | 取决于返回值 | O(1) | O(n) | O(1) |
| 能否表达无限 | 否 | 是 | 否 | 是 |
| 实现迭代器协议 | 否 | 是 | 否(但是可迭代) | 是 |

## 六、易错点小结

| 易错点 | 现象 | 正确做法 |
|-------|------|---------|
| 调用生成器函数不执行 | \`g = gen()\` 后没输出 | 必须 \`next(g)\` 或 for 消费 |
| 多次遍历同一生成器 | 第二次为空 | 重新调用函数生成新对象 |
| \`return value\` 在生成器里 | 值被当作 \`StopIteration.value\` | 用 try/except 捕获 e.value |
| \`yield from\` 误用为 \`yield\` | 嵌套 list 没被展平 | 委托子迭代器用 yield from |
| 生成器表达式忘记外层括号 | 语法错误 | 单参数可省,如 \`sum(x for x in lst)\` |
| 无限生成器直接 \`list()\` | MemoryError | 配合 \`islice\` / \`takewhile\` 截断 |
`,
    code: `# 基础生成器
def count_up_to(n):
    i = 1
    while i <= n:
        yield i
        i += 1

for x in count_up_to(5):
    print("yield:", x)

# 斐波那契
def fib(limit):
    a, b = 0, 1
    while a < limit:
        yield a
        a, b = b, a + b

print("fib:", list(fib(50)))

# yield from：委托
def chain(*iters):
    for it in iters:
        yield from it

print("chain:", list(chain([1, 2], (3, 4), "ab")))

# 无限流
def infinite_counter(start=0):
    while True:
        yield start
        start += 1

from itertools import islice
print("first 5:", list(islice(infinite_counter(100), 5)))

# 生成器表达式（惰性）
gen = (x * x for x in range(10_000_000))
print("type:", type(gen))
print("first 3:", list(islice(gen, 3)))
`,
  },
  {
    id: "py4-itertools",
    group: "迭代器与生成器",
    icon: "🔧",
    title: "itertools：迭代器工具库",
    content: `
## 一、概念解释

**itertools** 是 Python 标准库的迭代器工具模块,提供一组**用 C 实现**的高效迭代器构造函数。所有函数都返回迭代器(惰性),适合处理大数据流。

主要分四类:

1. **无限迭代器**:\`count / cycle / repeat\` —— 永不停止,需配合 \`islice\` 等截断
2. **有限迭代器**:\`chain / islice / takewhile / dropwhile / accumulate / compress\` —— 处理已有可迭代对象
3. **组合迭代器**:\`product / permutations / combinations\` —— 笛卡尔积、排列、组合
4. **分组与填充**:\`groupby / zip_longest / tee\`

\`\`\`python
import itertools
print(list(itertools.chain([1, 2], [3, 4])))  # [1, 2, 3, 4]
\`\`\`

## 二、设计原理

itertools 的设计哲学:

- **一切都是迭代器**:返回值都是惰性迭代器,不预先物化,内存友好。
- **C 实现**:核心循环用 C 编写,比手写 Python 循环快几倍到几十倍。
- **组合优于继承**:小工具单一职责,通过 \`chain / islice / map\` 组合出复杂逻辑。
- **不修改输入**:不消耗原可迭代对象(除非你自己迭代)。

## 三、使用场景

- 处理大文件 / 流式数据,避免一次性载入
- 笛卡尔积、排列组合(暴力搜索、密码枚举)
- 数据分组、累积计算
- 替代手写循环,代码更短更快
- 链式 pipeline:多个 itertools 串联

## 四、代码逐行讲解

### 1. 无限迭代器

\`\`\`python
print("count:", list(itertools.islice(itertools.count(10, 2), 5)))
# count(10, 2):从 10 开始步长 2 → 10, 12, 14, 16, 18
print("cycle:", list(itertools.islice(itertools.cycle("AB"), 6)))
# cycle("AB"):无限循环 A B A B → A, B, A, B, A, B
# repeat(x, n):重复 x 共 n 次;不传 n 则无限
\`\`\`

- \`count(start, step)\`:等差数列,无上限
- \`cycle(iterable)\`:循环复述
- \`repeat(obj, times)\`:重复同一对象(注意是同一对象,不是拷贝)

### 2. 有限迭代器

\`\`\`python
print("chain:", list(itertools.chain([1, 2], [3, 4])))
# 把多个可迭代对象"拼接"成一个,[1, 2, 3, 4]

print("islice:", list(itertools.islice(range(100), 5, 10)))
# 惰性切片:range(100) 的第 5..9 个 → [5, 6, 7, 8, 9]

print("takewhile:", list(itertools.takewhile(lambda x: x < 5, [1, 3, 5, 1, 2])))
# "取到条件不满足为止" → [1, 3](遇到 5 停)

print("dropwhile:", list(itertools.dropwhile(lambda x: x < 5, [1, 3, 5, 1, 2])))
# "丢到条件不满足为止" → [5, 1, 2](遇到 5 开始保留)

print("accumulate:", list(itertools.accumulate([1, 2, 3, 4, 5])))
# 累积求和 → [1, 3, 6, 10, 15]
\`\`\`

**takewhile vs dropwhile**:都是"首次不满足就锁定",之后不再检查条件。注意 \`dropwhile\` 一旦开始保留就保留到底,后面的 1、2 也会被保留。

### 3. 组合迭代器

\`\`\`python
print("product:", list(itertools.product([1, 2], ["a", "b"])))
# 笛卡尔积 → [(1,'a'), (1,'b'), (2,'a'), (2,'b')]

print("permutations:", list(itertools.permutations([1, 2, 3], 2)))
# 排列(有序) → [(1,2),(1,3),(2,1),(2,3),(3,1),(3,2)]

print("combinations:", list(itertools.combinations([1, 2, 3, 4], 2)))
# 组合(无序) → [(1,2),(1,3),(1,4),(2,3),(2,4),(3,4)]
\`\`\`

- \`product\`:相当于多层 for 循环的扁平化,\`product(A, B)\` 等价于 \`[(a,b) for a in A for b in B]\`
- \`permutations(iter, r)\`:从 n 个里选 r 个的**有序**排列,\`A(n,r) = n!/(n-r)!\`
- \`combinations(iter, r)\`:从 n 个里选 r 个的**无序**组合,\`C(n,r) = n!/(r!(n-r)!)\`

### 4. groupby 相邻分组

\`\`\`python
print("groupby:", [(k, list(g)) for k, g in itertools.groupby("AABCCDA")])
# [('A', ['A','A']), ('B', ['B']), ('C', ['C','C']), ('D', ['D']), ('A', ['A'])]
\`\`\`

**关键陷阱**:\`groupby\` 只对**相邻**的相同元素分组!末尾的 \`A\` 因为不相邻,被单独成组。要按值全局分组,必须**先排序**:

\`\`\`python
data = sorted("AABCCDA")  # 先排序 → 'AAABCCD'
print([(k, list(g)) for k, g in itertools.groupby(data)])
# [('A', ['A','A','A']), ('B', ['B']), ('C', ['C','C']), ('D', ['D'])]
\`\`\`

### 5. zip_longest 对比内置 zip

\`\`\`python
print("zip_longest:", list(itertools.zip_longest([1, 2], "abc", fillvalue="?")))
# [(1,'a'), (2,'b'), ('?','c')]

# 对比内置 zip(短板效应)
print(list(zip([1, 2], "abc")))   # [(1,'a'), (2,'b')]  ← 'c' 丢失
\`\`\`

- 内置 \`zip\`:以**最短**为准,长的部分丢弃
- \`zip_longest\`:以**最长**为准,短的用 \`fillvalue\` 填充

## 五、对比:islice vs 列表切片,zip vs zip_longest

| 操作 | 列表切片 / 内置 zip | itertools 版本 |
|------|--------------------|----------------|
| 切片 | \`lst[5:10]\` 立即物化 | \`islice(it, 5, 10)\` 惰性 |
| 适用对象 | 序列(list/str) | 任意迭代器(含生成器) |
| 内存 | O(切片长度) | O(1) |
| zip 短的丢弃 | \`zip\` | \`zip_longest\` 填充 |
| 是否支持负步长 | 是 | 否(islice 不支持负数) |

## 六、易错点小结

| 易错点 | 现象 | 正确做法 |
|-------|------|---------|
| \`groupby\` 不排序 | 分组数比预期多 | 先 \`sorted(data)\` 再 groupby |
| 无限迭代器直接 \`list()\` | MemoryError | 配合 \`islice / takewhile\` 截断 |
| \`islice\` 用负数 | \`ValueError\` | islice 不支持负索引/负步长 |
| \`takewhile\` 后续被丢 | 以为还会继续取 | takewhile 首次 False 后丢弃全部后续 |
| \`permutations\` vs \`combinations\` 混淆 | 顺序敏感问题 | 有序用 permutations,无序用 combinations |
| \`product\` 忘记 \`repeat=\` 参数 | 多层嵌套难写 | \`product(A, repeat=3)\` 等价 3 层 |
| 返回值是迭代器 | 二次遍历为空 | 需要 \`list(...)\` 物化后再用 |
`,
    code: `import itertools

# 无限迭代器
print("count:", list(itertools.islice(itertools.count(10, 2), 5)))
print("cycle:", list(itertools.islice(itertools.cycle("AB"), 6)))

# 有限：chain / islice / takewhile / dropwhile
print("chain:", list(itertools.chain([1, 2], [3, 4])))
print("islice:", list(itertools.islice(range(100), 5, 10)))
print("takewhile:", list(itertools.takewhile(lambda x: x < 5, [1, 3, 5, 1, 2])))
print("dropwhile:", list(itertools.dropwhile(lambda x: x < 5, [1, 3, 5, 1, 2])))

# 组合
print("product:", list(itertools.product([1, 2], ["a", "b"])))
print("permutations:", list(itertools.permutations([1, 2, 3], 2)))
print("combinations:", list(itertools.combinations([1, 2, 3, 4], 2)))

# 分组
print("groupby:", [(k, list(g)) for k, g in itertools.groupby("AABCCDA")])
print("accumulate:", list(itertools.accumulate([1, 2, 3, 4, 5])))

# zip_longest
print("zip_longest:", list(itertools.zip_longest([1, 2], "abc", fillvalue="?")))
`,
  },
  {
    id: "py4-gen-adv",
    group: "迭代器与生成器",
    icon: "🚀",
    title: "生成器进阶：send、throw、close",
    content: `
## 一、概念解释

生成器不仅能"产出值",还能"接收值"。这赋予它**双向通信**能力,使其可作为简易协程(coroutine)。三个核心方法:

- **send(value)**:向生成器发送一个值,该值成为当前 \`yield\` 表达式的返回值,同时生成器继续执行到下一个 yield。
- **throw(Exc)**:在当前 \`yield\` 处抛出一个异常,生成器可以在内部 try/except 捕获。
- **close()**:关闭生成器,内部 \`yield\` 处会抛出 \`GeneratorExit\` 异常。

\`\`\`python
def echo():
    while True:
        x = yield       # yield 表达式有"返回值",由 send 设置
        print("got:", x)

g = echo()
next(g)                 # 启动:执行到 yield 暂停
g.send("hi")            # 把 "hi" 作为 yield 的返回值赋给 x
\`\`\`

\`yield\` 既是"产出语句"也是"表达式":\`x = yield value\` 表示先产出 value,暂停;下次 \`send(v)\` 时 v 成为整个 yield 表达式的值赋给 x。

## 二、设计原理

1. **yield 表达式的双面性**:\`yield value\` 产出 value 给调用方;\`received = yield\` 接收调用方 send 来的值。两条信息流共用一个 yield 点。
2. **必须先启动**:生成器函数体在第一次 \`next()\` 之前不会执行。直接 \`send(v)\` 会报 \`TypeError\`,因为此时还没有 yield 在等待值。
3. **return 的特殊语义**:生成器中 \`return value\` 不会让调用方直接拿到 value,而是把它放进 \`StopIteration.value\`。这是 PEP 380 (yield from) 用来传递子生成器返回值的机制。
4. **GeneratorExit 不可屏蔽**:\`close()\` 注入 \`GeneratorExit\`,生成器可以 cleanup 但**不能再 yield**,否则解释器抛 \`RuntimeError\`。

## 三、使用场景

- **协程风格的状态机**:如红绿灯、解析器、协议状态机
- **双向通信管道**:上游 send 数据,生成器处理后再 yield
- **生成器管道(pipeline)**:多个生成器串联,惰性逐级转换数据
- **资源管理**:用 close() 主动释放生成器持有的资源(文件、连接)
- **异步编程的雏形**:早期 async/await 之前用生成器实现协程

## 四、代码逐行讲解

### 1. send + return value

\`\`\`python
def accumulator():
    total = 0
    while True:
        x = yield total      # 产出当前 total,等待接收 x
        if x is None:
            break            # 收到 None → 退出循环
        total += x
    return total             # 生成器里的 return → StopIteration.value

acc = accumulator()
print("init:", next(acc))      # 启动:执行到第一个 yield,产出 total=0
print("send 1:", acc.send(1))  # x=1, total=1, yield 1
print("send 2:", acc.send(2))  # x=2, total=3, yield 3
print("send 3:", acc.send(3))  # x=3, total=6, yield 6
try:
    acc.send(None)             # 触发 break → return total → StopIteration
except StopIteration as e:
    print("final:", e.value)   # 6
\`\`\`

**逐行**:

- \`x = yield total\`:关键语句。先产出 total(给调用方看),然后暂停;下次 \`send(v)\` 时 v 成为 yield 表达式的值,赋给 x,继续执行 \`if x is None\`。
- \`next(acc)\` 第一次启动:必须做,等价于 \`acc.send(None)\`。因为此时还没有 yield 在等值,send 非 None 会报错。
- \`return total\`:在生成器里 return 触发 \`StopIteration\`,return 的值放在 \`e.value\`。要捕获才能拿到。

### 2. 状态机:红绿灯

\`\`\`python
def traffic_light():
    lights = ["red", "green", "yellow"]
    i = 0
    while True:
        command = yield lights[i % 3]   # 产出当前灯,等待命令
        if command == "next":
            i += 1                       # 切换到下一灯
        elif command == "reset":
            i = 0                        # 重置

tl = traffic_light()
print("init:", next(tl))          # red
print("next:", tl.send("next"))   # green
print("next:", tl.send("next"))   # yellow
print("reset:", tl.send("reset")) # red
\`\`\`

生成器内部用 \`i\` 记住状态,外部用 send 发命令。这就是"协程式"编程:生成器是被动的,由外部驱动推进。

### 3. throw 与 close

\`\`\`python
def safe_gen():
    try:
        while True:
            try:
                x = yield
            except ValueError:
                print("caught ValueError")
    finally:
        print("cleanup")

g = safe_gen()
next(g)
g.throw(ValueError)    # 在 yield 处抛 ValueError,被内部 except 捕获
g.close()              # 抛 GeneratorExit,触发 finally → "cleanup"
\`\`\`

- \`throw(Exc)\`:让生成器在 yield 暂停处"被抛异常",可用于错误信号传递。
- \`close()\`:等价于 \`throw(GeneratorExit)\`,但语义上是"我用完了,你收尾吧"。

### 4. 生成器管道

\`\`\`python
def read_lines():
    yield "1"; yield "2"; yield "3"; yield "hello"

def parse_ints(lines):
    for line in lines:
        try:
            yield int(line)        # 逐行解析
        except ValueError:
            pass                    # 跳过非数字

def multiply_by(n, nums):
    for x in nums:
        yield x * n                # 逐个乘 n

pipeline = multiply_by(10, parse_ints(read_lines()))
print("pipeline:", list(pipeline))  # [10, 20, 30]
\`\`\`

每个生成器只做一件事,串联起来形成流水线。数据**逐个**流过各级,而非先全部解析再全部相乘。对大文件来说,这种结构内存占用极低,且天然支持提前终止(如只取前 N 个)。

## 五、对比:next / send / throw / close

| 方法 | 作用 | yield 表达式的值 | 是否推进 |
|------|------|-----------------|---------|
| \`next(g)\` | 启动/推进 | \`None\` | 到下个 yield |
| \`g.send(v)\` | 推进并传值 | \`v\` | 到下个 yield |
| \`g.throw(Exc)\` | 注入异常 | (异常被抛出) | 取决于是否被捕获 |
| \`g.close()\` | 关闭 | — | 抛 GeneratorExit,生成器结束 |

**生命周期**:

| 阶段 | 状态 | 允许操作 |
|------|------|---------|
| 创建后未启动 | GEN_CREATED | 只能 \`next()\` 或 \`send(None)\` |
| 已启动暂停在 yield | GEN_SUSPENDED | \`next / send / throw / close\` |
| 已结束 | GEN_CLOSED | 任何操作都报 StopIteration |

## 六、易错点小结

| 易错点 | 现象 | 正确做法 |
|-------|------|---------|
| 未 next 直接 send 非 None | \`TypeError: can't send non-None value\` | 先 \`next(g)\` 启动 |
| 忘记捕获 StopIteration 取 return 值 | 拿不到 return 的值 | \`except StopIteration as e: e.value\` |
| close 后再 yield | \`RuntimeError: generator ignored GeneratorExit\` | 在 finally 中不要再 yield |
| 把 send 当 push 用 | 逻辑混乱 | send 既传值又推进,理解清楚 |
| 管道中提前 break | 上游生成器未关闭 | 用 \`with closing(g)\` 或 try/finally |
| \`yield from\` 子生成器 send 行为 | 以为没传过去 | yield from 透明转发 send/throw/close |
| 多次 next 启动 | 跳过第一个 yield 的产出 | 只需启动一次,后续用 send |
`,
    code: `# send：向生成器传值
def accumulator():
    total = 0
    while True:
        x = yield total
        if x is None:
            break
        total += x
    return total

acc = accumulator()
print("init:", next(acc))          # 启动生成器（到第一个 yield）
print("send 1:", acc.send(1))
print("send 2:", acc.send(2))
print("send 3:", acc.send(3))
try:
    acc.send(None)                 # 触发 break
except StopIteration as e:
    print("final:", e.value)       # 6

# 状态机用生成器
def traffic_light():
    lights = ["red", "green", "yellow"]
    i = 0
    while True:
        command = yield lights[i % 3]
        if command == "next":
            i += 1
        elif command == "reset":
            i = 0

tl = traffic_light()
print("init:", next(tl))
print("next:", tl.send("next"))
print("next:", tl.send("next"))
print("reset:", tl.send("reset"))

# 生成器管道
def read_lines():
    yield "1"
    yield "2"
    yield "3"
    yield "hello"

def parse_ints(lines):
    for line in lines:
        try:
            yield int(line)
        except ValueError:
            pass

def multiply_by(n, nums):
    for x in nums:
        yield x * n

pipeline = multiply_by(10, parse_ints(read_lines()))
print("pipeline:", list(pipeline))  # [10, 20, 30]
`,
  },
];