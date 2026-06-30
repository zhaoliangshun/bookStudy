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
- **迭代器协议**：\`__iter__\` 返回迭代器对象，\`__next__\` 返回下一个值
- **iter()**：从可迭代对象获取迭代器
- **next()**：获取迭代器下一个值，耗尽时抛出 \`StopIteration\`
- **for 循环**：内部自动调用 \`iter()\` 和 \`next()\` 处理 StopIteration
- **自定义迭代器类**：实现 \`__iter__\` 和 \`__next__\` 方法
- 迭代器是惰性的，按需生成值，节省内存
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
- **生成器函数**：使用 \`yield\` 关键字的函数，调用时返回生成器对象
- **yield**：暂停执行并返回值，下次 \`next()\` 从暂停处继续
- **yield from**：委托给另一个生成器/可迭代对象（Python 3.3+）
- **生成器表达式**：\`(x for x in ...)\` 类似列表推导但惰性求值
- 生成器自动实现迭代器协议，无需手动写 \`__iter__/__next__\`
- 生成器是一次性的，遍历完后需要重新创建
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
- **无限迭代器**：\`count()\` 计数、\`cycle()\` 循环、\`repeat()\` 重复
- **迭代器合并**：\`chain()\` 连接多个可迭代对象
- **切片**：\`islice()\` 对迭代器切片（无需转列表）
- **组合学**：\`product()\` 笛卡尔积、\`permutations()\` 排列、\`combinations()\` 组合
- **分组**：\`groupby()\` 按键分组（需先排序）
- **其他实用**：\`zip_longest()\`, \`accumulate()\`
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
- **send(value)**：向暂停的 \`yield\` 发送值，恢复执行并返回下一个 yield 值
- **throw(exception)**：在 yield 暂停处抛出异常
- **close()**：终止生成器（在 yield 处抛出 \`GeneratorExit\`）
- 生成器可作为协程基础，实现数据管道（生产者→处理→消费者）
- **预激（prime）**：首次必须 \`next()\` 或 \`send(None)\` 启动到第一个 yield
- 管道中每个阶段用 \`send()\` 把数据传给下一个协程
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
