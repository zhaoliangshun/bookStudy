// =============================================================
// Batch 10：迭代器与生成器（4 章）
// 1. py5-iterator    迭代器协议 __iter__/__next__、iter()/next()、StopIteration
// 2. py5-generator   生成器 yield、yield from、生成器表达式
// 3. py5-itertools   itertools：count/cycle/chain/islice/product/combinations/groupby 等
// 4. py5-coroutine   高级生成器：send()/throw()/close()、协程管道
// =============================================================

export const chapters = [
  {
    id: "py5-iterator",
    group: "迭代器生成器",
    icon: "🔁",
    title: "迭代器协议",
    content: `
## 概述
迭代器协议是 Python 实现惰性遍历的核心机制，通过 \`__iter__\` 与 \`__next__\` 两个魔法方法定义迭代行为，配合内置函数 \`iter()\` / \`next()\` 使用。

## 核心要点
- **__iter__**: 返回迭代器对象自身 - 让对象可被 for 循环遍历
- **__next__**: 返回下一个值，无值时必须 \`raise StopIteration\`
- **iter()**: 从可迭代对象获取迭代器：\`it = iter([1, 2, 3])\`
- **next()**: 手动取下一个值：\`next(it)\`，可带默认值 \`next(it, None)\`
- **StopIteration**: 迭代耗尽信号，for 循环会自动捕获并终止
- **可迭代 vs 迭代器**: 可迭代实现 \`__iter__\` 返回迭代器；迭代器 \`__iter__\` 返回 self
- **一次性消耗**: 迭代器遍历完即耗尽，需重新 \`iter()\` 重建
- **惰性求值**: 按需生成值，处理大数据流不占内存
- **内置可迭代**: list/tuple/str/dict/set/range/file 都是可迭代对象
- **collections.abc**: \`Iterable\` / \`Iterator\` 抽象基类可用于 isinstance 校验

## 原理与机制
- **协议本质**: 鸭子类型约定，对象只要实现 \`__iter__\` 与 \`__next__\` 即视为迭代器
- **for 循环展开**: \`for x in obj\` 等价于 \`it = iter(obj)\` 循环调用 \`next(it)\` 直到 StopIteration
- **状态保持**: 迭代器在多次 \`__next__\` 之间维持内部状态（如指针、计数）
- **可重入性**: 可迭代对象每次 \`iter()\` 返回新迭代器；迭代器 \`iter()\` 返回自身不可重置
- **生成器即迭代器**: 生成器函数自动实现迭代器协议，无需手写两个方法

## 易错点与陷阱
- **陷阱**: \`__next__\` 中忘记 \`raise StopIteration\`，导致 for 循环无法终止或无限迭代
- **陷阱**: 让可迭代对象 \`__iter__\` 直接返回 self，导致对象只能遍历一次
- **陷阱**: 迭代器耗尽后再 \`next()\` 不报错（带默认值时），但业务逻辑可能已错
- **陷阱**: \`__next__\` 中先改状态再 return，导致首值被跳过或返回错位

## 实战建议
- **建议**: 自定义迭代器时让 \`__iter__\` 返回新迭代器实例，实现可重复遍历
- **建议**: 处理大文件或流数据时优先用迭代器，避免一次性 read() 全量加载
- **建议**: 需要 \`next()\` 默认值语义时用 \`next(it, None)\` 而非 try/except StopIteration
`,
    code: `class Countdown:
    def __init__(self, start):
        self.current = start

    def __iter__(self):
        return self

    def __next__(self):
        if self.current < 0:
            raise StopIteration
        val = self.current
        self.current -= 1
        return val

print("=== for 循环使用自定义迭代器 ===")
for num in Countdown(5):
    print(f"  倒计时：{num}")

print("\\n=== 手动使用 iter() 和 next() ===")
it = iter(Countdown(3))
print(f"  next: {next(it)}")
print(f"  next: {next(it)}")
print(f"  next: {next(it)}")
print(f"  next: {next(it)}")
try:
    print(f"  next: {next(it)}")
except StopIteration:
    print("  迭代器已耗尽 (StopIteration)")

print("\\n=== 内置可迭代对象 ===")
it = iter([10, 20, 30])
print(f"  list 迭代器: {next(it)}, {next(it)}, {next(it)}")
it = iter("AB")
print(f"  str 迭代器: {next(it)}, {next(it)}")
`,
  },
  {
    id: "py5-generator",
    group: "迭代器生成器",
    icon: "⚡",
    title: "生成器 yield",
    content: `
## 概述
生成器是创建迭代器的轻量方式，使用 \`yield\` 关键字暂停函数执行并产出值，无需手写 \`__iter__\` / \`__next__\`，天然支持惰性求值。

## 核心要点
- **yield**: 暂停并返回值：\`yield value\`，下次 \`next()\` 从此处继续
- **生成器函数**: 含 \`yield\` 的函数，调用返回 generator 对象而非立即执行
- **生成器表达式**: \`(x*x for x in range(n))\` 惰性版列表推导
- **yield from**: 委托给子生成器/可迭代对象：\`yield from sub_gen()\`
- **return value**: 生成器结束 \`return\` 的值会作为 \`StopIteration.value\`（PEP 380）
- **内存优势**: 生成器只保存当前帧，常量级内存占用
- **一次性**: 生成器遍历完即耗尽，需重新调用函数重建
- **类型检查**: \`type(gen)\` 为 generator，可用 \`isinstance(x, Generator)\` 校验
- **send()/close()**: 生成器亦可双向通信（见协程章节）
- **next 触发**: 调用函数本身不会执行函数体，必须 \`next()\` 或在 for 中触发

## 原理与机制
- **执行栈冻结**: \`yield\` 时保存函数栈帧（局部变量、指令指针），\`next()\` 恢复执行
- **帧对象属性**: 生成器持有 \`gi_frame\`，可检查 \`gi_frame.f_locals\` 调试局部变量
- **yield from 语义**: 等价于展开子生成器并透传 \`send()\` / \`throw()\`，避免手动 for yield
- **生成器表达式 vs 列表推导**: 前者惰性、占内存少；后者立即求值、可重复遍历
- **PEP 525 扩展**: Python 3.6+ 异步生成器 \`async def\` + \`yield\`，支持 \`async for\` 遍历

## 易错点与陷阱
- **陷阱**: 调用生成器函数 \`fibonacci(10)\` 不会执行函数体，必须 \`next()\` 或在 for 中触发
- **陷阱**: 生成器只能遍历一次，两次 \`for x in gen\` 第二次为空
- **陷阱**: \`yield from\` 中子生成器 return 的值作为表达式返回值，易被忽略
- **陷阱**: 生成器表达式中 if 过滤或多 for 子句优先级易错，需正确加括号

## 实战建议
- **建议**: 处理大数据流（日志、CSV、文件行）优先用生成器，避免一次性入内存
- **建议**: 递归扁平化嵌套结构用 \`yield from\` 递归调用，简洁高效
- **建议**: 比较内存占用可用 \`sys.getsizeof()\`，但注意生成器内存是常量级
`,
    code: `def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

print("=== 斐波那契生成器 ===")
fib = fibonacci(10)
print(f"  类型: {type(fib).__name__}")
print(f"  前10个: {list(fib)}")

def flatten(nested):
    for item in nested:
        if isinstance(item, list):
            yield from flatten(item)
        else:
            yield item

print("\\n=== yield from 扁平化嵌套列表 ===")
nested = [1, [2, 3, [4, 5]], 6, [7, 8]]
print(f"  原始: {nested}")
print(f"  扁平化: {list(flatten(nested))}")

print("\\n=== 生成器表达式 vs 列表推导 ===")
import sys
list_comp = [x * x for x in range(1000)]
gen_exp = (x * x for x in range(1000))
print(f"  列表推导内存: {sys.getsizeof(list_comp)} bytes")
print(f"  生成器表达式内存: {sys.getsizeof(gen_exp)} bytes")
print(f"  生成器前5个: {[next(gen_exp) for _ in range(5)]}")
print(f"  剩余求和: {sum(gen_exp)}")
`,
  },
  {
    id: "py5-itertools",
    group: "迭代器生成器",
    icon: "🛠️",
    title: "itertools 模块",
    content: `
## 概述
\`itertools\` 是 Python 标准库中处理迭代器的核心模块，提供高效、C 实现的迭代器构建工具，涵盖无限迭代、组合、过滤、分组等场景。

## 核心要点
- **count(start, step)**: 无限计数器 \`count(10, 2)\` → 10, 12, 14, ...
- **cycle(iterable)**: 无限循环可迭代对象 \`cycle('AB')\` → A, B, A, B, ...
- **repeat(obj, times)**: 重复对象 N 次 \`repeat(42, 3)\` → 42, 42, 42
- **chain(*iterables)**: 串联多个可迭代 \`chain([1,2], 'ab')\` → 1, 2, a, b
- **islice(iter, stop)** / **islice(iter, start, stop, step)**: 对迭代器切片
- **product(*iterables, repeat=1)**: 笛卡尔积 \`product('AB', repeat=2)\`
- **permutations(iter, r)**: 排列 \`permutations('ABC', 2)\`
- **combinations(iter, r)**: 组合（不重复）\`combinations('ABC', 2)\`
- **groupby(iter, key)**: 相邻相同键分组，需预先按 key 排序
- **accumulate(iter, func)**: 累积运算 \`accumulate([1,2,3], operator.mul)\`

## 原理与机制
- **C 实现**: 所有函数均用 C 实现，比手写 Python 循环快数倍
- **惰性求值**: 所有工具返回迭代器，仅在 \`next()\` 时计算，支持无限序列
- **groupby 仅分相邻**: 不全局分组，只合并连续相同键，故需先排序
- **chain.from_iterable**: 处理可迭代的可迭代：\`chain.from_iterable([[1,2],[3,4]])\`
- **组合 vs 排列**: \`combinations\` 不考虑顺序且不重复，\`permutations\` 考虑顺序

## 易错点与陷阱
- **陷阱**: 无限迭代器 \`count\` / \`cycle\` 不搭配 \`islice\` 或 break 直接 \`list()\` 会卡死
- **陷阱**: \`groupby\` 不预排序结果错误，输入必须按 key 排好序
- **陷阱**: \`islice\` 不支持负索引，且对原迭代器有副作用（消耗元素）
- **陷阱**: \`permutations\` / \`combinations\` 输入是字符串时返回元组，需 \`''.join()\` 还原

## 实战建议
- **建议**: 处理大数据流用 \`islice\` 取前 N 项，避免 \`list()\` 全量物化
- **建议**: 多个列表拼接优先用 \`chain()\` 而非 \`+\`，避免内存复制
- **建议**: 笛卡尔积/排列组合用于算法题（密码枚举、组合搜索）非常方便
`,
    code: `import itertools
import operator

print("=== 无限迭代器（有限取数）===")
counter = itertools.count(10, 2)
print(f"  count(10,2) 取5: {[next(counter) for _ in range(5)]}")
cycler = itertools.cycle("ABC")
print(f"  cycle('ABC') 取7: {[next(cycler) for _ in range(7)]}")
print(f"  repeat(42, 3): {list(itertools.repeat(42, 3))}")

print("\\n=== chain 和 islice ===")
print(f"  chain([1,2], 'abc', (5,6)): {list(itertools.chain([1,2], 'abc', (5,6)))}")
print(f"  islice(count(), 5, 10): {list(itertools.islice(itertools.count(), 5, 10))}")

print("\\n=== 组合学工具 ===")
print(f"  product('AB', [1,2]): {list(itertools.product('AB', [1,2]))}")
print(f"  permutations('ABC', 2): {list(itertools.permutations('ABC', 2))}")
print(f"  combinations('ABC', 2): {list(itertools.combinations('ABC', 2))}")

print("\\n=== accumulate 和 groupby ===")
nums = [1, 2, 3, 4, 5]
print(f"  accumulate 求和: {list(itertools.accumulate(nums))}")
print(f"  accumulate 求积: {list(itertools.accumulate(nums, operator.mul))}")

data = [("A", 1), ("A", 2), ("B", 3), ("B", 4), ("A", 5)]
data.sort(key=lambda x: x[0])
print("  groupby 结果:")
for key, group in itertools.groupby(data, key=lambda x: x[0]):
    print(f"    {key}: {[x[1] for x in group]}")

print(f"\\n  zip_longest: {list(itertools.zip_longest('AB', [1,2,3], fillvalue='-'))}")
`,
  },
  {
    id: "py5-coroutine",
    group: "迭代器生成器",
    icon: "🔀",
    title: "高级生成器与协程",
    content: `
## 概述
高级生成器通过 \`send()\` / \`throw()\` / \`close()\` 与外界双向通信，可作为协程基础，构建生产者→处理者→消费者的数据管道。

## 核心要点
- **send(value)**: 向暂停的 \`yield\` 发送值，作为 yield 表达式的返回值：\`v = yield\`
- **throw(exc)**: 在 yield 暂停处抛出异常，可被 try/except 捕获
- **close()**: 终止生成器，在 yield 处抛出 \`GeneratorExit\`
- **预激（prime）**: 首次必须 \`next(gen)\` 或 \`gen.send(None)\` 推进到第一个 yield
- **yield 表达式**: \`v = yield\` 中 yield 既产出值（None）又接收 send 值
- **管道模式**: 协程 A \`send()\` 到协程 B，形成数据流水线
- **GeneratorExit**: close() 触发，生成器应清理资源后正常退出，不应再 yield
- **双向通信**: 普通 \`next()\` 等价于 \`send(None)\`；\`send(v)\` 把 v 作为 yield 表达式的值

## 原理与机制
- **协程生命周期**: 创建 → 预激（prime）→ 运行中 → 关闭；未预激 send 非 None 会报 TypeError
- **throw 传递**: throw 在 yield 处抛异常，若生成器捕获并 yield 新值则继续，否则向上抛
- **close 内部**: 等价于 \`gen.throw(GeneratorExit)\`，生成器若再 yield 会触发 RuntimeError
- **数据流模式**: 管道中每个阶段 \`while True: v = yield; target.send(process(v))\`
- **yield from 透传**: \`yield from sub\` 会把 send/throw 透传给子生成器，便于协程组合

## 易错点与陷阱
- **陷阱**: 忘记预激直接 \`gen.send(10)\` 会抛 \`TypeError: can't send non-None value\`
- **陷阱**: 在 \`GeneratorExit\` 异常处理后再 \`yield\` 会触发 \`RuntimeError\`
- **陷阱**: 管道关闭顺序错误，先关生产者再关消费者，否则下游可能阻塞在 send
- **陷阱**: 协程未捕获异常会沿管道向上传播，导致整个管道崩溃

## 实战建议
- **建议**: 用装饰器自动预激协程，简化调用方代码
- **建议**: 协程管道适合流式数据处理，但生产场景可用 \`asyncio\` 异步协程替代
- **建议**: 生成器协程是早期协程方案，新代码应优先用 \`async def\` + \`await\`
`,
    code: `def printer(name):
    try:
        while True:
            v = yield
            print(f"  {name}: {v}")
    except GeneratorExit:
        pass

def doubler(target):
    while True:
        v = yield
        target.send(v * 2)

print("=== send/close: x2 管道 ===")
p = printer("结果")
next(p)
d = doubler(p)
next(d)
for i in range(1, 5):
    d.send(i)
d.close()
p.close()

print("\\n=== throw() 演示 ===")
def handler():
    while True:
        try:
            v = yield
            print(f"  值: {v}")
        except ValueError as e:
            print(f"  捕获: {e}")
h = handler()
next(h)
h.send(10)
h.throw(ValueError("错误"))
h.send(20)
h.close()
print("完成")
`,
  },
];
