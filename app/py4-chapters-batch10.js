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
- 协议：\`__iter__\` 返回迭代器；\`__next__\` 返回下一值，耗尽抛 StopIteration
- 内置可迭代：list/tuple/dict/set/str/range/文件句柄
- \`iter(callable, sentinel)\`：把函数变成迭代器到 sentinel 停止
- 迭代器只能遍历一次
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
- 生成器函数：含 \`yield\` 的函数，调用返回生成器对象
- 每次 \`yield\` 暂停并返回值，下次从暂停处继续
- \`yield from\`：委托子迭代器
- 生成器自动实现 \`__iter__\` / \`__next__\`
- 适合：惰性序列、无限流、pipeline
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
- 无限：\`count / cycle / repeat\`
- 有限：\`accumulate / chain / compress / dropwhile / takewhile\`
- 组合：\`product / permutations / combinations / combinations_with_replacement\`
- 分组：\`groupby / islice / tee / zip_longest\`
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
- \`send(value)\`：向生成器发送值，\`yield\` 会收到该值
- \`throw(Exc)\`：在生成器内抛异常
- \`close()\`：关闭生成器（在 yield 处抛 GeneratorExit）
- 适合：协程风格的状态机、双向通信
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