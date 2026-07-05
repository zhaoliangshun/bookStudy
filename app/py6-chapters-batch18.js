export const chapters = [
  {
    id: "py6-memory-model",
    group: "底层原理与性能",
    icon: "🧠",
    title: "Python 内存模型与对象模型",
    content: `## Python 内存模型与对象模型

### 一、万物皆对象：PyObject 结构

CPython 中**一切皆对象**，连 \`int\`、\`function\`、\`class\` 本身都是对象。每个对象在 C 层面都由一个 \`PyObject\` 结构体开头：

\`\`\`c
// 简化的 PyObject 结构（CPython 源码）
typedef struct _object {
    int ob_refcnt;          // 引用计数
    PyTypeObject *ob_type;  // 类型指针
} PyObject;
\`\`\`

- \`ob_refcnt\`：记录有多少引用指向该对象，归零时立即释放
- \`ob_type\`：指向类型对象（如 \`int\`、\`str\`），决定对象的行为

这意味着 Python 中每个对象都有**运行时类型信息**，与 C/Java 的编译期类型截然不同。

### 二、引用语义 vs 值语义

Python 变量是**引用**（标签），不是盒子。赋值是把标签贴到对象上，不是复制内容：

\`\`\`python
a = [1, 2, 3]
b = a          # b 和 a 指向同一个 list 对象
b.append(4)
print(a)       # [1, 2, 3, 4]  ← a 也变了！
\`\`\`

这是新手最常踩的坑。对比 C 语言：

| 语言 | 赋值语义 | 结果 |
|------|---------|------|
| C（数组） | 值拷贝 | a 与 b 独立 |
| Python | 引用拷贝 | a 与 b 共享对象 |

要"拷贝内容"，需显式使用 \`copy.copy\`（浅拷贝）或 \`copy.deepcopy\`（深拷贝）。

### 三、id() 与对象身份

\`id()\` 返回对象的唯一标识（CPython 中是内存地址）：

\`\`\`python
a = 256
b = 256
print(id(a) == id(b))  # True（小整数缓存）

a = 1000
b = 1000
print(id(a) == id(b))  # False（大整数不缓存）
\`\`\`

\`is\` 比较身份（id 是否相同），\`==\` 比较值。规范上：\`is None\` / \`is True\` / \`is False\` 用 \`is\`，其他都用 \`==\`。

### 四、引用计数 sys.getrefcount

每个对象维护引用计数，\`sys.getrefcount\` 可查询（注意：调用本身会 +1）：

\`\`\`python
import sys
a = [1, 2, 3]
print(sys.getrefcount(a))  # 2（a 本身 + getrefcount 的形参）

b = a
print(sys.getrefcount(a))  # 3
\`\`\`

引用计数增加：赋值、传参、加入容器。减少：变量离开作用域、\`del\`、容器移除。

### 五、小整数缓存（-5 到 256）

CPython 启动时预创建 \`-5\` 到 \`256\` 的整数对象，所有引用共享：

\`\`\`python
a = 256
b = 256
print(a is b)  # True

a = 257
b = 257
print(a is b)  # False（交互式）；模块级可能是 True（编译优化）
\`\`\`

> 💡 **避坑提示**：永远用 \`==\` 比较数值，\`is\` 只用于 None/True/False。依赖缓存是未定义行为。

### 六、字符串驻留 intern

字符串字面量会被**驻留**（intern），相同字面量共享一个对象：

\`\`\`python
a = "hello"
b = "hello"
print(a is b)  # True（字面量驻留）

s1 = "hello!"
s2 = "hel" + "lo!"
print(s1 is s2)  # True（编译期常量折叠）

s3 = "".join(["hel", "lo!"])
print(s1 is s3)  # False（运行时拼接不驻留）
\`\`\`

可手动驻留：\`sys.intern(s)\`，适合大量重复字符串场景（如日志关键字）节省内存。

### 七、可变 vs 不可变对象

| 类型 | 可变性 | 例子 |
|------|--------|------|
| int / float / str / tuple / frozenset | 不可变 | \`x = 1; x += 1\` 创建新对象 |
| list / dict / set | 可变 | \`lst.append(1)\` 原地修改 |

不可变对象的"+="实际是创建新对象：

\`\`\`python
x = 1
print(id(x))   # 4374118320
x += 1
print(id(x))   # 4374118352 ← id 变了，是新对象
\`\`\`

> ⚠️ **避坑提示**：可变默认参数是经典陷阱：
> \`\`\`python
> def f(items=[]):  # ✗ 默认值只创建一次！
>     items.append(1)
>     return items
> # f() 调用多次会累积
> \`\`\`
> 正确写法：\`def f(items=None): if items is None: items = []\`

### 八、用 sys.getsizeof 实测内存

\`sys.getsizeof\` 返回对象自身占用字节数（不含引用的对象）：

| 对象 | 字节数（64 位 Python） |
|------|----------------------|
| \`int(0)\` | 28 |
| \`int(1)\` | 28 |
| \`int(10**18)\` | 36（大整数多占位） |
| \`"a"\` | 50 |
| \`[]\` | 56 |
| \`[1]\` | 88（含指针） |
| \`{}\` | 64 |

Python 对象内存远大于 C 的 4 字节 int，这是动态语言的代价。

### 九、业务场景：避免内存泄漏

1. **长生命周期容器**：全局 dict/list 持续增长，定期清理
2. **闭包捕获**：闭包捕获大对象无法释放，用 weakref 替代
3. **缓存无界**：\`functools.lru_cache\` 有 maxsize，手写缓存要限制大小
4. **回调注册未注销**：观察者模式中订阅者未取消订阅

### 十、原理深入

CPython 内存分配器分三层：
- **Arena**（256KB）：从操作系统申请的大块
- **Pool**（4KB）：Arena 内划分
- **Block**：Pool 内固定大小块，按对象大小分桶（8/16/24/...字节）

小对象（≤512B）走 pool 分配器，大对象直接 \`malloc\`。这种分层减少了内存碎片和系统调用。

### 十一、最佳实践总结

- 永远用 \`==\` 比较值，\`is\` 仅用于 None/True/False
- 拷贝用 \`copy.copy\`（浅）或 \`copy.deepcopy\`（深）
- 大量重复字符串用 \`sys.intern\` 节省内存
- 警惕可变默认参数，用 None 哨兵
- 长运行服务用 \`tracemalloc\` 监控内存增长`,
    code: `# Python 内存模型与对象模型演示
# 仅用标准库，演示对象身份、引用计数、缓存、内存占用

import sys
import copy

print("=== Python 内存模型与对象模型演示 ===\\n")

print("--- 1. 万物皆对象：连 class、function 都是对象 ---")
print(f"  type(1)        = {type(1)}")
print(f"  type('hello')  = {type('hello')}")
print(f"  type(len)      = {type(len)}")        # 内置函数
print(f"  type(int)      = {type(int)}")         # 类型本身也是对象
print(f"  (1).__class__  = {(1).__class__}")

print("\\n--- 2. 引用语义 vs 值语义 ---")
a = [1, 2, 3]
b = a                       # 引用拷贝：b 和 a 指向同一对象
b.append(4)
print(f"  a = [1,2,3]; b = a; b.append(4)")
print(f"  a = {a}")              # a 也被改了
print(f"  a is b = {a is b}")    # True，同一对象

# 浅拷贝：复制外层，内层仍共享
c = [1, 2, 3]
d = copy.copy(c)
d.append(4)
print(f"  c = {c}, d = {d}, c is d = {c is d}")  # c 不受影响

# 深拷贝：完全独立
e = [[1, 2], [3, 4]]
f = copy.deepcopy(e)
f[0].append(99)
print(f"  e = {e}, f = {f}")    # e 内层不受影响

print("\\n--- 3. id() 与对象身份 ---")
x = 256
y = 256
print(f"  x=256, y=256: id(x)==id(y) -> {id(x) == id(y)} (小整数缓存)")
x = 1000
y = 1000
print(f"  x=1000, y=1000: id(x)==id(y) -> {id(x) == id(y)} (大整数不缓存)")
print(f"  x == y -> {x == y}, x is y -> {x is y}")

print("\\n--- 4. 引用计数 sys.getrefcount ---")
a = [1, 2, 3]
print(f"  a = [1,2,3]; sys.getrefcount(a) = {sys.getrefcount(a)}")
b = a
print(f"  b = a;    sys.getrefcount(a) = {sys.getrefcount(a)}")
c = [a, a]
print(f"  c = [a,a]; sys.getrefcount(a) = {sys.getrefcount(a)}")
del c
del b
print(f"  del c, b; sys.getrefcount(a) = {sys.getrefcount(a)}")

print("\\n--- 5. 小整数缓存 -5 到 256 ---")
cached = []
for n in [-5, 0, 1, 100, 256]:
    a = n
    b = n
    cached.append((n, a is b))
uncached = []
for n in [257, 1000, 99999]:
    a = n
    b = n
    uncached.append((n, a is b))
print("  缓存范围（is 返回 True）:")
for n, ok in cached:
    print(f"    {n}: is -> {ok}")
print("  非缓存范围（is 可能 False）:")
for n, ok in uncached:
    print(f"    {n}: is -> {ok}")

print("\\n--- 6. 字符串驻留 intern ---")
a = "hello"
b = "hello"
print(f"  字面量 'hello' is 'hello' -> {a is b}")
s3 = "hel" + "lo!"   # 编译期折叠
s4 = "hello!"
print(f"  'hel'+'lo!' is 'hello!' -> {s3 is s4}")
# 运行时拼接不驻留
parts = ["hel", "lo!"]
s5 = "".join(parts)
print(f"  ''.join(['hel','lo!']) is 'hello!' -> {s5 is s4}")
# sys.intern 强制驻留
interned = sys.intern(s5)
print(f"  sys.intern(s5) is 'hello!' -> {interned is s4}")

print("\\n--- 7. 可变 vs 不可变对象 ---")
x = 1
id_before = id(x)
x += 1
id_after = id(x)
print(f"  int += 1: id {id_before} -> {id_after} (变化，新对象)")

lst = [1, 2, 3]
id_before = id(lst)
lst.append(4)
id_after = id(lst)
print(f"  list.append: id {id_before} -> {id_after} (不变，原地修改)")

# 可变默认参数陷阱
def bad_default(items=[]):
    items.append(1)
    return items
print(f"  bad_default() 第1次: {bad_default()}")
print(f"  bad_default() 第2次: {bad_default()} (累积了！)")

print("\\n--- 8. sys.getsizeof 实测内存 ---")
samples = [
    ("int(0)", 0),
    ("int(1)", 1),
    ("int(10**18)", 10**18),
    ("'a'", "a"),
    ("''", ""),
    ("[]", []),
    ("[1]", [1]),
    ("{}", {}),
    ("{'a':1}", {"a": 1}),
]
print(f"  {'对象':<18} {'字节数':<10}")
for desc, obj in samples:
    print(f"  {desc:<18} {sys.getsizeof(obj):<10}")

print("\\n--- 9. 业务场景：避免内存泄漏的常见模式 ---")
tips = [
    "长生命周期容器定期清理：del dict[key]",
    "闭包捕获大对象用 weakref 替代",
    "缓存用 functools.lru_cache(maxsize=128)，避免无界增长",
    "观察者模式：订阅后必须提供取消订阅方法",
    "全局变量监控：用 tracemalloc 追踪增长",
]
for i, tip in enumerate(tips, 1):
    print(f"  {i}. {tip}")

print("\\n=== 内存模型演示结束 ===")`
  },
  {
    id: "py6-gc",
    group: "底层原理与性能",
    icon: "♻️",
    title: "垃圾回收机制（引用计数+分代回收）",
    content: `## 垃圾回收机制（引用计数+分代回收）

### 一、引用计数（主要机制）

CPython 主要靠**引用计数**回收内存：每个对象维护 \`ob_refcnt\`，归零时立即释放。

\`\`\`python
import sys
a = [1, 2, 3]
print(sys.getrefcount(a))  # 2
b = a
print(sys.getrefcount(a))  # 3（b 引用了）
del b
print(sys.getrefcount(a))  # 2
\`\`\`

引用计数优点：**即时回收**，无停顿。缺点：**无法处理循环引用**。

### 二、循环引用问题

\`\`\`python
class Node:
    def __init__(self):
        self.ref = None

a = Node()
b = Node()
a.ref = b   # a 引用 b
b.ref = a   # b 引用 a
del a
del b
# 此时 a 和 b 的引用计数都是 1（互相引用），无法归零
# 引用计数失效！
\`\`\`

为此，CPython 引入**分代垃圾回收器**作为补充。

### 三、分代回收（0/1/2 代）

GC 将对象分为三代：

| 代 | 触发条件 | 阈值（默认） | 说明 |
|----|---------|-------------|------|
| 0 代 | 新对象 | 700 | 频繁扫描 |
| 1 代 | 0 代回收后 | 10 | 中频 |
| 2 代 | 1 代回收后 | 10 | 低频 |

每次 0 代回收后，存活对象晋升 1 代；1 代回收后晋升 2 代。**越老的对象越少被扫描**，分摊成本。

### 四、gc 模块 API

\`\`\`python
import gc

gc.enable()                  # 启用 GC（默认启用）
gc.disable()                 # 禁用 GC（极端性能场景）
gc.collect()                 # 手动全量回收，返回回收对象数
gc.collect(2)                # 只回收 2 代
gc.get_threshold()           # (700, 10, 10)
gc.set_threshold(1000, 15, 15)  # 调整阈值
gc.get_count()               # 当前各代计数
gc.garbage                   # 无法回收的对象列表（有 __del__ 循环）
\`\`\`

### 五、gc.collect() 手动回收

\`\`\`python
import gc

# 制造循环引用
class Node:
    pass
a = Node(); b = Node()
a.ref = b; b.ref = a
del a, b

collected = gc.collect()
print(f"回收了 {collected} 个对象")
\`\`\`

通常**不需要手动 collect**，调优时才用。某些实时系统会 \`gc.disable()\` 后定期手动 collect 控制停顿。

### 六、__del__ 析构方法

\`__del__\` 在对象被销毁时调用，但**有循环引用时不可靠**：

\`\`\`python
class Resource:
    def __init__(self, name):
        self.name = name
    def __del__(self):
        print(f"释放 {self.name}")

r = Resource("db_conn")
del r   # 立即触发 __del__（引用计数归零）
\`\`\`

> ⚠️ **避坑提示**：从 Python 3.4 起（PEP 442），循环引用中的 \`__del__\` 也能被调用，但顺序不保证。**不要在 \`__del__\` 中做关键清理**，用上下文管理器（\`with\`）替代。

### 七、weakref 弱引用

弱引用**不增加引用计数**，对象仍可被回收：

\`\`\`python
import weakref

class User:
    pass

u = User()
ref = weakref.ref(u)
print(ref())      # <User object>
del u
print(ref())      # None（对象已被回收）
\`\`\`

弱引用场景：
- **缓存**：缓存对象但不阻止回收
- **观察者**：订阅者弱引用，对象销毁自动失效
- **避免循环引用**：父子关系用弱引用打破环

### 八、实测循环引用回收

\`\`\`python
import gc
import weakref

class Node:
    pass

# 创建循环引用
a = Node(); b = Node()
a.ref = b; b.ref = a
weak = weakref.ref(a)
del a, b
print(weak())            # 可能还在（引用计数未归零）
gc.collect()
print(weak())            # None（GC 回收了）
\`\`\`

### 九、业务场景

1. **长连接对象**：连接池、会话，避免循环引用导致泄漏
2. **缓存**：用 \`weakref.WeakValueDictionary\` 自动失效
3. **观察者模式**：订阅者弱引用，避免持有大对象
4. **配置对象**：树形结构，子节点弱引用父节点

### 十、原理深入

分代回收基于**弱代假说**：**新对象大多早死，老对象大多长寿**。统计表明：
- 90%+ 对象在创建后很快变垃圾
- 老对象反复扫描是浪费

GC 算法：**标记-清除**（mark and sweep）：
1. 从根集合（GC roots：栈、全局变量）出发，遍历可达对象
2. 标记所有可达对象
3. 清除未标记对象（即循环引用垃圾）

### 十一、最佳实践总结

- 优先用 \`with\` 上下文管理器，不依赖 \`__del__\`
- 父子关系用弱引用打破循环
- 缓存用 \`WeakValueDictionary\` 或 \`lru_cache\`
- 一般不手动 \`gc.collect()\`，调优时再介入
- 监控 \`gc.garbage\` 列表，避免有 \`__del__\` 的循环引用`,
    code: `# 垃圾回收机制演示：引用计数、分代回收、循环引用、weakref
# 仅用标准库

import sys
import gc
import weakref
import time

print("=== Python 垃圾回收机制演示 ===\\n")

print("--- 1. 引用计数演示 ---")
class Node:
    pass

a = Node()
print(f"  a = Node(); getrefcount = {sys.getrefcount(a)}")  # 2
b = a
print(f"  b = a;       getrefcount = {sys.getrefcount(a)}")  # 3
c = [a]
print(f"  c = [a];     getrefcount = {sys.getrefcount(a)}")  # 4
del b, c
print(f"  del b, c;    getrefcount = {sys.getrefcount(a)}")  # 2

print("\\n--- 2. 循环引用问题演示 ---")
gc.disable()  # 临时禁用 GC 突出引用计数失效

# 制造循环引用
a = Node()
b = Node()
a.ref = b
b.ref = a
weak_a = weakref.ref(a)
del a
del b
# 引用计数失效，对象未回收
print(f"  循环引用 del 后, weak_a() is None: {weak_a() is None}")
print("  （引用计数都是 1，互相引用，无法归零）")

# 手动 GC 回收
collected = gc.collect()
print(f"  gc.collect() 回收对象数: {collected}")
print(f"  回收后 weak_a() is None: {weak_a() is None}")

gc.enable()  # 重新启用

print("\\n--- 3. 分代回收机制 ---")
print(f"  当前 GC 阈值: {gc.get_threshold()}")
print(f"  当前各代计数: {gc.get_count()}")
print("  说明：(700, 10, 10) 表示 0代满 700 触发，1代满 10 触发，2代满 10 触发")
print("  越老的对象扫描频率越低（弱代假说）")

# 制造一些对象触发 0 代回收
for _ in range(800):
    x = [1, 2, 3]
print(f"  创建 800 个对象后, 各代计数: {gc.get_count()}")

print("\\n--- 4. weakref 弱引用演示 ---")
class User:
    def __init__(self, name):
        self.name = name

u = User("Alice")
ref = weakref.ref(u)
print(f"  u = User('Alice'); ref() = {ref()}")
print(f"  ref().name = {ref().name}")

del u
print(f"  del u; ref() = {ref()}  (对象已被回收，弱引用不阻止回收)")

# WeakValueDictionary：缓存场景
cache = weakref.WeakValueDictionary()
user = User("Bob")
cache["bob"] = user
print(f"  cache['bob'].name = {cache['bob'].name}")
del user
print(f"  del user; 'bob' in cache: {'bob' in cache}  (自动失效)")

print("\\n--- 5. __del__ 析构方法 ---")
class Resource:
    def __init__(self, name):
        self.name = name
        print(f"  [创建] {self.name}")
    def __del__(self):
        print(f"  [释放] {self.name}")

print("  r = Resource('db_conn'):")
r = Resource("db_conn")
print("  del r:")
del r  # 立即触发 __del__

print("\\n--- 6. GC 性能对比：禁用 vs 启用 ---")
import timeit

# 大量短生命周期对象
def make_objects():
    for _ in range(10000):
        x = {"a": 1, "b": [1, 2, 3]}

# 启用 GC
gc.enable()
t_with_gc = timeit.timeit(make_objects, number=5)

# 禁用 GC
gc.disable()
t_without_gc = timeit.timeit(make_objects, number=5)
gc.enable()

print(f"  创建 5x10000 个短命对象:")
print(f"    启用 GC: {t_with_gc*1000:.1f} ms")
print(f"    禁用 GC: {t_without_gc*1000:.1f} ms")
print(f"    比值: {t_with_gc/t_without_gc:.2f}x")
print("  （禁用 GC 反而快，因为短命对象归零即释放，无需 GC 扫描）")

print("\\n--- 7. 业务场景：缓存用 weakref ---")
class ImageCache:
    def __init__(self):
        self._cache = weakref.WeakValueDictionary()
    def get(self, key, loader):
        img = self._cache.get(key)
        if img is None:
            img = loader(key)
            self._cache[key] = img
        return img

class Image:
    def __init__(self, name):
        self.name = name

cache = ImageCache()
img1 = cache.get("logo", lambda k: Image(k))
img2 = cache.get("logo", lambda k: Image(k))
print(f"  img1 is img2: {img1 is img2}  (缓存命中，同一对象)")
del img1, img2
img3 = cache.get("logo", lambda k: Image(k))
print(f"  del 后重新 get: img3 is None: {img3 is None} (已自动失效)")

print("\\n--- 8. 最佳实践总结 ---")
best = [
    "优先用 with 上下文管理器，不依赖 __del__",
    "父子关系用弱引用打破循环引用",
    "缓存用 WeakValueDictionary 或 lru_cache",
    "一般不手动 gc.collect()，调优时再介入",
    "监控 gc.garbage 列表，避免有 __del__ 的循环引用",
]
for i, b in enumerate(best, 1):
    print(f"  {i}. {b}")

print("\\n=== 垃圾回收演示结束 ===")`
  },
  {
    id: "py6-gil-deep",
    group: "底层原理与性能",
    icon: "🔒",
    title: "GIL 全局解释器锁深入",
    content: `## GIL 全局解释器锁深入

### 一、GIL 是什么

GIL（Global Interpreter Lock）是 CPython 的**全局解释器锁**：任何时刻只有一个线程能执行 Python 字节码。即使 8 核 CPU，多线程 Python 程序也只能用满 1 核。

\`\`\`python
import threading
# 两个线程死循环，CPU 占用约 100%（单核）
def loop():
    while True:
        pass
t1 = threading.Thread(target=loop)
t2 = threading.Thread(target=loop)
t1.start(); t2.start()
\`\`\`

### 二、为什么有 GIL

GIL 不是 Python 语言的特性，而是 **CPython 实现**的产物。原因：

1. **简化 C 扩展开发**：C 扩展无需关心锁，GIL 保证单线程执行
2. **单线程性能**：单线程下无需加锁，引用计数等操作更高效
3. **历史包袱**：1992 年引入，难以去除（C 扩展生态依赖）

Jython（Java 实现）和 IronPython（.NET 实现）**没有 GIL**，但生态弱于 CPython。

### 三、GIL 对 IO 密集型的影响小

IO 操作（网络、文件、sleep）会**主动释放 GIL**：

\`\`\`python
import threading, time, urllib.request

def fetch(url):
    urllib.request.urlopen(url)  # 阻塞时释放 GIL

# 多线程并发请求，能利用等待时间
threads = [threading.Thread(target=fetch, args=(url,)) for url in urls]
for t in threads: t.start()
for t in threads: t.join()
\`\`\`

所以 IO 密集型任务（爬虫、Web 服务器）多线程仍然有效。

### 四、GIL 对 CPU 密集型的限制

CPU 密集型任务多线程**不加速反减速**：

\`\`\`python
def cpu_task(n):
    total = 0
    for i in range(n):
        total += i ** 2
    return total

# 单线程
start = time.time()
cpu_task(10**7); cpu_task(10**7)
print(time.time() - start)  # ~1s

# 多线程（不会加速）
threads = [Thread(target=cpu_task, args=(10**7,)) for _ in range(2)]
start = time.time()
for t in threads: t.start()
for t in threads: t.join()
print(time.time() - start)  # ~1.2s（甚至更慢，GIL 切换开销）
\`\`\`

CPU 密集型用**多进程**（\`multiprocessing\`）绕过 GIL。

### 五、GIL 切换时机

GIL 不是"持有到结束"，而是**周期性切换**：

\`\`\`python
import sys
print(sys.getswitchinterval())  # 0.005（5ms）
sys.setswitchinterval(0.001)    # 改为 1ms
\`\`\`

默认每 5ms 强制切换 GIL 给其他线程。这保证：
- 线程不会饿死
- IO 线程能及时响应

但频繁切换有开销，CPU 密集型多线程反而变慢。

### 六、多线程 vs 多进程选择

| 场景 | 推荐 | 原因 |
|------|------|------|
| IO 密集（网络/文件） | 多线程 / asyncio | GIL 在 IO 时释放，线程开销小 |
| CPU 密集（计算） | 多进程 | 绕过 GIL，利用多核 |
| 混合型 | 进程池 + 线程池 | 各取所长 |

\`\`\`python
# 多进程示例
from multiprocessing import Pool
def cpu_task(n):
    return sum(i**2 for i in range(n))

with Pool(4) as p:
    results = p.map(cpu_task, [10**7]*4)  # 4 核并行
\`\`\`

### 七、Python 3.13+ 实验性 no-GIL

PEP 703 提出的 **free-threaded CPython** 在 3.13 进入实验阶段：

\`\`\`bash
# 编译 free-threaded 版本
./configure --disable-gil
make

# 运行
python3.13t script.py
\`\`\`

特点：
- 移除 GIL，多线程可真正并行
- 引用计数改为** biased reference counting **（线程局部+全局）
- 性能：单线程慢 ~10%，多线程 CPU 密集显著加速
- 生态：C 扩展需迁移（标记 \`Py_mod_gil\`）

> 💡 **避坑提示**：no-GIL 目前还处于实验阶段，主要 C 扩展（numpy/pandas）支持尚不完整。生产环境仍以 GIL 版本为主。

### 八、实测多线程 CPU 性能

\`\`\`python
import time, threading
from multiprocessing import Process

def cpu_task():
    total = 0
    for i in range(10**7):
        total += i ** 2

# 单线程
t0 = time.time(); cpu_task(); cpu_task()
print(f"单线程: {time.time()-t0:.2f}s")

# 多线程（受 GIL 限制）
t0 = time.time()
threads = [threading.Thread(target=cpu_task) for _ in range(2)]
for t in threads: t.start()
for t in threads: t.join()
print(f"多线程: {time.time()-t0:.2f}s")

# 多进程（绕过 GIL）
t0 = time.time()
procs = [Process(target=cpu_task) for _ in range(2)]
for p in procs: p.start()
for p in procs: p.join()
print(f"多进程: {time.time()-t0:.2f}s")
\`\`\`

### 九、业务场景

1. **Web 爬虫**：多线程 + requests，IO 等待时切换
2. **API 服务器**：用 asyncio 异步框架（FastAPI/aiohttp）
3. **数据处理**：multiprocessing 或 joblib 并行
4. **ML 训练**：numpy/torch 的 C 扩展在计算时释放 GIL

### 十、原理深入

GIL 在 CPython 源码中是 \`_PyRuntime.gil\` 中的一个互斥锁。字节码执行循环 \`_PyEval_EvalFrameDefault\` 周期性检查是否要释放 GIL：

\`\`\`c
// 简化的字节码循环
while (true) {
    if (--_Py_Ticker < 0) {
        // 释放 GIL，让其他线程运行
        _PyEval_SaveThread();
        _PyEval_RestoreThread();
        _Py_Ticker = 100;
    }
    execute_bytecode();  // 持有 GIL 执行
}
\`\`\`

C 扩展在 IO/计算密集时调用 \`Py_BEGIN_ALLOW_THREADS\` / \`Py_END_ALLOW_THREADS\` 主动释放 GIL。numpy 的矩阵运算就是这么做的。

### 十一、最佳实践总结

- IO 密集：多线程或 asyncio，不要用多进程
- CPU 密集：用 multiprocessing 或 C 扩展（释放 GIL）
- 混合型：进程池（绕 GIL）+ 线程池（IO 并发）
- 关注 PEP 703 进展，3.14+ free-threading 趋于成熟
- 性能瓶颈先 profile，再决定并行方案`,
    code: `# GIL 全局解释器锁演示：实测多线程 vs 多进程性能
# 仅用标准库 threading/multiprocessing

import sys
import time
import threading
import timeit
from multiprocessing import Process, Pool

print("=== GIL 全局解释器锁深入演示 ===\\n")

print("--- 1. GIL 基本概念 ---")
print(f"  当前 GIL 切换间隔: {sys.getswitchinterval()}s ({sys.getswitchinterval()*1000:.1f}ms)")
print("  GIL 限制：任何时刻只有一个线程执行 Python 字节码")
print("  => 8 核 CPU 多线程 Python 只能用满 1 核")

print("\\n--- 2. CPU 密集型：单线程 vs 多线程 vs 多进程 ---")

def cpu_task(n):
    """CPU 密集任务：累加平方"""
    total = 0
    for i in range(n):
        total += i * i
    return total

N = 3_000_000

# 单线程：跑两次
t0 = time.perf_counter()
cpu_task(N)
cpu_task(N)
t_single = time.perf_counter() - t0
print(f"  单线程（2 次任务）: {t_single*1000:.1f} ms")

# 多线程：2 个线程并行（受 GIL 限制，不会加速）
t0 = time.perf_counter()
threads = [threading.Thread(target=cpu_task, args=(N,)) for _ in range(2)]
for t in threads: t.start()
for t in threads: t.join()
t_multi_thread = time.perf_counter() - t0
print(f"  多线程（2 线程并行）: {t_multi_thread*1000:.1f} ms  (受 GIL 限制，未加速)")

# 多进程：2 个进程并行（绕过 GIL，真正并行）
if __name__ == "__main__":
    t0 = time.perf_counter()
    procs = [Process(target=cpu_task, args=(N,)) for _ in range(2)]
    for p in procs: p.start()
    for p in procs: p.join()
    t_multi_proc = time.perf_counter() - t0
    print(f"  多进程（2 进程并行）: {t_multi_proc*1000:.1f} ms  (绕过 GIL，接近单线程一半)")

    print(f"\\n  加速比:")
    print(f"    多线程 / 单线程 = {t_multi_thread/t_single:.2f}x (>1 说明反而变慢)")
    print(f"    多进程 / 单线程 = {t_multi_proc/t_single:.2f}x (<1 说明加速)")

print("\\n--- 3. IO 密集型：多线程有效 ---")

def io_task():
    """模拟 IO：sleep"""
    time.sleep(0.1)

# 单线程：2 次 IO
t0 = time.perf_counter()
io_task()
io_task()
t_single_io = time.perf_counter() - t0
print(f"  单线程（2 次 IO）: {t_single_io*1000:.1f} ms")

# 多线程：2 线程并发 IO（GIL 在 sleep 时释放，能并发）
t0 = time.perf_counter()
threads = [threading.Thread(target=io_task) for _ in range(2)]
for t in threads: t.start()
for t in threads: t.join()
t_multi_io = time.perf_counter() - t0
print(f"  多线程（2 线程并发 IO）: {t_multi_io*1000:.1f} ms  (GIL 在 sleep 时释放，并发有效)")
print(f"  加速比: {t_single_io/t_multi_io:.2f}x (接近 2x 说明并发成功)")

print("\\n--- 4. GIL 切换间隔影响 ---")
intervals = [0.001, 0.005, 0.050]
print(f"  测试不同 switchinterval 对 CPU 任务的影响:")
for interval in intervals:
    old = sys.getswitchinterval()
    sys.setswitchinterval(interval)
    t = timeit.timeit(lambda: cpu_task(500_000), number=3)
    print(f"    interval={interval*1000:.0f}ms: {t*1000:.1f} ms")
    sys.setswitchinterval(old)
print("  （切换太频繁会有开销，但差异通常不大）")

print("\\n--- 5. 业务场景：何时用多线程/多进程/asyncio ---")
scenarios = [
    ("Web 爬虫", "IO 密集", "多线程 / asyncio"),
    ("API 服务器", "IO 密集", "asyncio (FastAPI/aiohttp)"),
    ("数据处理", "CPU 密集", "multiprocessing / joblib"),
    ("ML 训练", "混合", "C 扩展自动释放 GIL (numpy/torch)"),
    ("实时计算", "CPU 密集", "Cython / C 扩展释放 GIL"),
]
print(f"  {'场景':<15} {'类型':<12} {'推荐方案'}")
for scene, kind, plan in scenarios:
    print(f"  {scene:<15} {kind:<12} {plan}")

print("\\n--- 6. Python 3.13+ no-GIL 进展 ---")
print("  PEP 703: free-threaded CPython (实验性)")
print("  编译: ./configure --disable-gil")
print("  特点:")
print("    - 移除 GIL，多线程真正并行")
print("    - 引用计数改为 biased reference counting")
print("    - 单线程慢约 10%，多线程 CPU 密集显著加速")
print("    - C 扩展需标记 Py_mod_gil 兼容")
print("  ⚠️ 当前生态支持不完整，生产仍以 GIL 版本为主")

print("\\n--- 7. threading 模块基本用法 ---")
import threading

results = []
def worker(name, n):
    for i in range(n):
        results.append(f"{name}-{i}")

threads = [
    threading.Thread(target=worker, args=("A", 3)),
    threading.Thread(target=worker, args=("B", 3)),
]
for t in threads: t.start()
for t in threads: t.join()
print(f"  2 个线程各写 3 条, results = {results}")
print("  注意：results.append 在 CPython 下因 GIL 是原子的，但不应依赖此特性")

print("\\n--- 8. 最佳实践总结 ---")
best = [
    "IO 密集：多线程或 asyncio，不要用多进程",
    "CPU 密集：multiprocessing 或 C 扩展（释放 GIL）",
    "混合型：进程池（绕 GIL）+ 线程池（IO 并发）",
    "关注 PEP 703 进展，3.14+ free-threading 趋于成熟",
    "性能瓶颈先 profile，再决定并行方案",
]
for i, b in enumerate(best, 1):
    print(f"  {i}. {b}")

print("\\n=== GIL 演示结束 ===")`
  },
  {
    id: "py6-bytecode",
    group: "底层原理与性能",
    icon: "📋",
    title: "字节码与 dis 模块",
    content: `## 字节码与 dis 模块

### 一、Python 执行流程

Python 不是直接执行源码，而是经过**两步编译**：

\`\`\`
源码 (.py) → 字节码 (.pyc) → PVM 执行
         词法分析     解释执行
         语法分析
         语义分析
\`\`\`

- **编译**：源码 → AST → 字节码（保存在 \`__pycache__/*.pyc\`）
- **执行**：PVM（Python Virtual Machine）循环解释字节码

\`.pyc\` 文件是字节码的缓存，下次导入时直接加载，跳过编译。

### 二、.pyc 文件生成

\`\`\`bash
# 导入模块时自动生成
python -c "import mymodule"  # 生成 __pycache__/mymodule.cpython-312.pyc

# 手动编译
python -m compileall mymodule.py
python -m py_compile mymodule.py
\`\`\`

\`.pyc\` 内容：
1. Magic number（版本标识）
2. 源码 mtime（判断是否过期）
3. 字节码对象（code object）

### 三、dis 模块反汇编

\`dis\` 是标准库反汇编工具，把字节码指令打印出来：

\`\`\`python
import dis

def add(a, b):
    return a + b

dis.dis(add)
\`\`\`

输出：
\`\`\`
2           0 RESUME                   0
3           2 LOAD_FAST                0 (a)
            4 LOAD_FAST                1 (b)
            6 BINARY_OP                0 (+)
           10 RETURN_VALUE
\`\`\`

第一列是源码行号，第二列是指令偏移，第三列是指令名，第四列是参数。

### 四、常见字节码指令

| 指令 | 作用 | 示例 |
|------|------|------|
| LOAD_CONST | 加载常量 | \`x = 1\` → LOAD_CONST 1 |
| LOAD_FAST | 加载局部变量 | \`y = x\` → LOAD_FAST x |
| LOAD_GLOBAL | 加载全局变量 | \`print(...)\` → LOAD_GLOBAL print |
| STORE_FAST | 存储局部变量 | \`x = 1\` → STORE_FAST x |
| BINARY_OP | 二元运算 | \`a + b\` → BINARY_OP + |
| CALL_FUNCTION | 调用函数 | \`f()\` → CALL_FUNCTION |
| RETURN_VALUE | 返回 | \`return x\` → RETURN_VALUE |
| POP_TOP | 丢弃栈顶 | 表达式语句 |

不同 Python 版本字节码有差异（3.11 大改，3.12 又改），用 \`dis\` 看真实输出。

### 五、字节码优化：局部变量比全局快

\`\`\`python
import dis

def use_local():
    x = 1
    for _ in range(100):
        x = x + 1

def use_global():
    global x
    x = 1
    for _ in range(100):
        x = x + 1

dis.dis(use_local)    # LOAD_FAST / STORE_FAST
dis.dis(use_global)   # LOAD_GLOBAL / STORE_GLOBAL（慢）
\`\`\`

\`LOAD_FAST\` 是数组索引访问（O(1)），\`LOAD_GLOBAL\` 是字典查找（O(1) 但常数大）。**循环内频繁访问的变量，应放局部**。

### 六、用 dis.dis 对比不同写法

#### 1. 字符串拼接

\`\`\`python
def concat_plus():
    s = ""
    for i in range(100):
        s = s + str(i)
    return s

def concat_join():
    return "".join(str(i) for i in range(100))

dis.dis(concat_plus)
dis.dis(concat_join)
\`\`\`

\`concat_plus\` 每次创建新字符串，\`concat_join\` 一次构建。字节码差异解释了性能差距。

#### 2. 列表推导 vs for 循环

\`\`\`python
def for_loop():
    result = []
    for i in range(100):
        result.append(i * 2)
    return result

def list_comp():
    return [i * 2 for i in range(100)]

dis.dis(for_loop)
dis.dis(list_comp)  # 字节码更少，迭代在 C 层完成
\`\`\`

列表推导**字节码更少**且迭代循环在 C 层，比 for 循环快。

### 七、业务场景

1. **性能调优**：用 dis 找出慢的字节码模式
2. **理解原理**：搞清楚 \`a += b\` 与 \`a = a + b\` 的差异
3. **代码混淆**：字节码层面分析混淆代码
4. **元编程**：动态修改字节码（高级用法）

### 八、原理深入

CPython 字节码基于**栈式虚拟机**：
- 操作数压栈，运算符弹栈运算后压回结果
- \`a + b\`：LOAD a → LOAD b → BINARY_OP + → 栈顶是结果
- 没有寄存器，所有操作通过栈

3.11 引入**自适应解释器**（PEP 659）：
- 热点字节码会被"特化"（specialize）
- 如 \`LOAD_ATTR\` 特化为 \`LOAD_ATTR_INSTANCE_VALUE\`（针对实例属性）
- 类似 JIT 的预处理，提速 10-60%

3.12 进一步引入**快速调用**优化，函数调用开销降低。

### 九、最佳实践总结

- 循环内频繁访问的变量放局部
- 字符串拼接用 \`"".join\`，不用 \`+=\`
- 用列表/字典/集合推导替代 for 循环
- 不需要时不要看字节码（可读性优先）
- 性能问题先 profile，再用 dis 分析热点`,
    code: `# 字节码与 dis 模块演示
# 仅用标准库 dis / timeit

import dis
import timeit
import sys

print("=== Python 字节码与 dis 模块演示 ===\\n")

print("--- 1. Python 执行流程 ---")
print("  源码 (.py) -> 字节码 (.pyc) -> PVM 解释执行")
print("  .pyc 缓存在 __pycache__/，加速重复导入")
print(f"  当前 Python 版本: {sys.version.split()[0]}")

print("\\n--- 2. dis 反汇编简单函数 ---")
def add(a, b):
    return a + b

print("  源码:")
print("    def add(a, b):")
print("        return a + b")
print("  字节码:")
# 用 dis.Bytecode 提取指令信息，避免直接打印干扰
bytecodes = []
for instr in dis.Bytecode(add):
    bytecodes.append(f"    {instr.offset:4d} {instr.opname:<20} {instr.argrepr}")
print("\\n".join(bytecodes))

print("\\n--- 3. 常见字节码指令速查 ---")
common = [
    ("LOAD_CONST", "加载常量", "x = 1"),
    ("LOAD_FAST", "加载局部变量", "y = x"),
    ("LOAD_GLOBAL", "加载全局变量", "print(x)"),
    ("STORE_FAST", "存储局部变量", "x = 1"),
    ("STORE_GLOBAL", "存储全局变量", "global x; x = 1"),
    ("BINARY_OP", "二元运算", "a + b"),
    ("CALL", "调用函数", "f()"),
    ("RETURN_VALUE", "返回", "return x"),
    ("POP_TOP", "丢弃栈顶", "表达式语句"),
    ("BUILD_LIST", "构建列表", "[1, 2, 3]"),
]
print(f"  {'指令':<18} {'作用':<18} {'示例'}")
for op, desc, ex in common:
    print(f"  {op:<18} {desc:<18} {ex}")

print("\\n--- 4. 局部变量 vs 全局变量字节码 ---")

# 局部变量版本
def use_local():
    x = 0
    for _ in range(100):
        x = x + 1
    return x

# 全局变量版本
g_x = 0
def use_global():
    global g_x
    g_x = 0
    for _ in range(100):
        g_x = g_x + 1
    return g_x

print("  use_local 关键字节码:")
for instr in dis.Bytecode(use_local):
    if instr.opname in ("LOAD_FAST", "STORE_FAST"):
        print(f"    {instr.offset:4d} {instr.opname:<20} {instr.argrepr}")
        break  # 只看一个例子

print("  use_global 关键字节码:")
for instr in dis.Bytecode(use_global):
    if instr.opname in ("LOAD_GLOBAL", "STORE_GLOBAL"):
        print(f"    {instr.offset:4d} {instr.opname:<20} {instr.argrepr}")
        break

# 实测性能
t_local = timeit.timeit(use_local, number=10000)
t_global = timeit.timeit(use_global, number=10000)
print(f"\\n  10000 次执行耗时:")
print(f"    局部变量: {t_local*1000:.1f} ms")
print(f"    全局变量: {t_global*1000:.1f} ms")
print(f"    比值: {t_global/t_local:.2f}x (全局慢于局部)")

print("\\n--- 5. 字符串拼接：+= vs join ---")
def concat_plus():
    s = ""
    for i in range(100):
        s = s + str(i)
    return s

def concat_join():
    return "".join(str(i) for i in range(100))

# 字节码指令数对比
bc_plus = len(list(dis.Bytecode(concat_plus)))
bc_join = len(list(dis.Bytecode(concat_join)))
print(f"  concat_plus 字节码指令数: {bc_plus}")
print(f"  concat_join  字节码指令数: {bc_join}")

t_plus = timeit.timeit(concat_plus, number=1000)
t_join = timeit.timeit(concat_join, number=1000)
print(f"\\n  1000 次执行耗时:")
print(f"    s + str(i) 循环: {t_plus*1000:.1f} ms")
print(f"    ''.join():       {t_join*1000:.1f} ms")
print(f"    比值: {t_plus/t_join:.1f}x (join 远快于 +=)")

print("\\n--- 6. for 循环 vs 列表推导字节码 ---")
def for_loop():
    result = []
    for i in range(100):
        result.append(i * 2)
    return result

def list_comp():
    return [i * 2 for i in range(100)]

bc_for = len(list(dis.Bytecode(for_loop)))
bc_lc = len(list(dis.Bytecode(list_comp)))
print(f"  for_loop 字节码指令数: {bc_for}")
print(f"  list_comp 字节码指令数: {bc_lc}")

t_for = timeit.timeit(for_loop, number=10000)
t_lc = timeit.timeit(list_comp, number=10000)
print(f"\\n  10000 次执行耗时:")
print(f"    for 循环 + append: {t_for*1000:.1f} ms")
print(f"    列表推导:          {t_lc*1000:.1f} ms")
print(f"    比值: {t_for/t_lc:.2f}x (列表推导快)")

print("\\n--- 7. a += b vs a = a + b 字节码对比 ---")
def aug_assign():
    a = [1]
    a += [2]
    return a

def full_assign():
    a = [1]
    a = a + [2]
    return a

print("  a += [2] 关键字节码:")
for instr in dis.Bytecode(aug_assign):
    if instr.opname == "BINARY_OP":
        print(f"    {instr.offset:4d} {instr.opname:<20} {instr.argrepr}")

print("  a = a + [2] 关键字节码:")
for instr in dis.Bytecode(full_assign):
    if instr.opname == "BINARY_OP":
        print(f"    {instr.offset:4d} {instr.opname:<20} {instr.argrepr}")
print("  说明: list 的 += 是 __iadd__（原地修改），+ 是 __add__（新建）")

print("\\n--- 8. 查看函数的 code object ---")
def sample():
    x = 1
    y = 2
    return x + y

co = sample.__code__
print(f"  函数名: {co.co_name}")
print(f"  参数数: {co.co_argcount}")
print(f"  局部变量: {co.co_varnames}")
print(f"  常量: {co.co_consts}")
print(f"  字节码长度: {len(co.co_code)} 字节")

print("\\n--- 9. 业务场景与最佳实践 ---")
tips = [
    "循环内频繁访问的变量放局部（LOAD_FAST 比 LOAD_GLOBAL 快）",
    "字符串拼接用 ''.join()，不用 += 循环",
    "用列表/字典/集合推导替代 for 循环",
    "不需要时不要看字节码（可读性优先）",
    "性能问题先 profile，再用 dis 分析热点",
    "Python 3.11+ 自适应解释器自动优化热点字节码",
]
for i, tip in enumerate(tips, 1):
    print(f"  {i}. {tip}")

print("\\n=== 字节码演示结束 ===")`
  },
  {
    id: "py6-c-extension",
    group: "底层原理与性能",
    icon: "🔧",
    title: "C 扩展与 ctypes/cffi",
    content: `## C 扩展与 ctypes/cffi

### 一、为什么需要 C 扩展

Python 性能瓶颈时，三种方案：
1. **C 扩展**：调用现有 C 库或手写性能关键路径
2. **Cython**：Python 超集，编译为 C（下章详述）
3. **Rust (PyO3)**：现代替代，内存安全

C 扩展三种方式：

| 方式 | 复杂度 | 性能 | 适用 |
|------|--------|------|------|
| ctypes | 低 | 中 | 调用现有 C 库，无需编写 C |
| cffi | 中 | 中高 | 调用 C 库，比 ctypes 灵活 |
| 原生 C API | 高 | 高 | 性能极致，写新模块 |

### 二、ctypes 加载共享库

\`ctypes\` 是标准库，无需安装，直接加载 \`.so\` / \`.dylib\` / \`.dll\`：

\`\`\`python
from ctypes import CDLL, c_int, c_double, c_char_p

# 加载 C 标准库
import ctypes
libc = ctypes.CDLL("libc.so.6")  # Linux
# macOS: libc = ctypes.CDLL("libc.dylib")
# Windows: libc = ctypes.CDLL("msvcrt.dll")

# 调用 printf
libc.printf(b"Hello %d\\n", 42)

# 调用 sqrt（libm）
libm = ctypes.CDLL("libm.so.6")
libm.sqrt.argtypes = [c_double]
libm.sqrt.restype = c_double
print(libm.sqrt(2.0))  # 1.414...
\`\`\`

### 三、ctypes 类型映射

| ctypes 类型 | C 类型 | Python 类型 |
|------------|--------|------------|
| c_int | int | int |
| c_double | double | float |
| c_char_p | char* | bytes |
| c_wchar_p | wchar_t* | str |
| POINTER(c_int) | int* | 指针 |
| c_void_p | void* | int（地址） |

### 四、声明函数签名

不声明也能调用，但建议显式声明 \`argtypes\` / \`restype\`：

\`\`\`python
libc.sqrt.argtypes = [c_double]  # 参数类型
libc.sqrt.restype = c_double     # 返回类型

# 这样 ctypes 会自动做类型转换和检查
\`\`\`

### 五、cffi 简介

\`cffi\` 是第三方库，比 ctypes 更强大：
- 用 C 声明语法（更接近原生 C）
- ABI 模式（无需编译）和 API 模式（编译更快）
- PyPy 上性能更好

\`\`\`python
from cffi import FFI
ffi = FFI()
ffi.cdef("double sqrt(double x);")
libm = ffi.dlopen("libm.so.6")
print(libm.sqrt(2.0))
\`\`\`

### 六、性能对比

\`\`\`python
import math, ctypes, timeit
libm = ctypes.CDLL("libm.so.6")
libm.sqrt.argtypes = [ctypes.c_double]
libm.sqrt.restype = ctypes.c_double

# 纯 Python
t1 = timeit.timeit(lambda: math.sqrt(2.0), number=10**6)
# ctypes
t2 = timeit.timeit(lambda: libm.sqrt(2.0), number=10**6)
# ctypes 有调用开销，比纯 Python 慢
\`\`\`

> 💡 **避坑提示**：ctypes 调用有**函数调用开销**（参数转换、GIL 不释放），简单函数反而比 Python 内置慢。只有**重计算函数**才值得用 ctypes。

### 七、业务场景

1. **调用现有 C 库**：libmysqlclient、libssl、libpng
2. **调用系统 API**：libc、Win32 API
3. **性能关键路径**：图像处理、加密算法
4. **硬件交互**：GPIO、传感器驱动

### 八、原生 C API 简介

性能最高但复杂，需写 .c 文件 + setup.py：

\`\`\`c
// fastmath.c
#include <Python.h>
static PyObject* fast_square(PyObject* self, PyObject* args) {
    double x;
    if (!PyArg_ParseTuple(args, "d", &x)) return NULL;
    return PyFloat_FromDouble(x * x);
}
static PyMethodDef methods[] = {
    {"fast_square", fast_square, METH_VARARGS, "Square a number"},
    {NULL, NULL, 0, NULL}
};
static struct PyModuleDef module = {
    PyModuleDef_HEAD_INIT, "fastmath", NULL, -1, methods
};
PyMODINIT_FUNC PyInit_fastmath(void) {
    return PyModule_Create(&module);
}
\`\`\`

\`\`\`python
# setup.py
from setuptools import setup, Extension
setup(ext_modules=[Extension("fastmath", ["fastmath.c"])])
# 编译: python setup.py build_ext --inplace
\`\`\`

### 九、原理深入

ctypes 调用流程：
1. 加载共享库（\`dlopen\`）
2. 通过函数名查找符号地址（\`dlsym\`）
3. 调用前：Python 对象 → C 类型（参数转换）
4. 调用 C 函数（**持有 GIL**，除非手动释放）
5. 调用后：C 返回值 → Python 对象

GIL 在 ctypes 调用期间**默认不释放**，但原生 C 扩展可用 \`Py_BEGIN_ALLOW_THREADS\` 释放，让其他线程并行。

### 十、ctypes vs cffi vs Cython vs Rust

| 方式 | 上手 | 性能 | GIL | 适用 |
|------|------|------|-----|------|
| ctypes | 简单 | 中 | 不释放 | 调用现有 C 库 |
| cffi | 中 | 中高 | 不释放 | 调用 C 库，PyPy 友好 |
| Cython | 中 | 高 | 可释放 | 性能瓶颈，科学计算 |
| 原生 C API | 难 | 极高 | 可释放 | 极致性能 |
| Rust (PyO3) | 中 | 高 | 可释放 | 现代替代，内存安全 |

### 十一、最佳实践总结

- 调用现有 C 库：优先 ctypes（标准库）或 cffi（更灵活）
- 性能瓶颈：用 Cython 或 Rust（PyO3）
- 简单函数不要用 ctypes，调用开销可能抵消收益
- 注意 GIL：长 C 计算应释放 GIL 让其他线程并行
- 跨平台：库名与路径在 Linux/macOS/Windows 不同`,
    code: `# C 扩展与 ctypes 演示：用 ctypes 调用 C 标准库
# 仅用标准库 ctypes（macOS/Linux/Windows 均自带）

import ctypes
import ctypes.util
import timeit
import math
import sys

print("=== C 扩展与 ctypes 演示 ===\\n")

print("--- 1. 查找并加载 C 标准库 ---")
# 跨平台加载 libc
libname = ctypes.util.find_library("c")
print(f"  find_library('c') = {libname}")
libc = ctypes.CDLL(libname)
print(f"  加载成功: {libc}")

# 跨平台加载 libm（数学库）
libm_name = ctypes.util.find_library("m")
print(f"  find_library('m') = {libm_name}")
if libm_name:
    libm = ctypes.CDLL(libm_name)
else:
    # Windows 上数学函数在 msvcrt
    libm = libc

print("\\n--- 2. ctypes 类型映射 ---")
type_map = [
    ("c_int", "int", "int"),
    ("c_double", "double", "float"),
    ("c_char_p", "char*", "bytes"),
    ("c_wchar_p", "wchar_t*", "str"),
    ("c_void_p", "void*", "int (地址)"),
    ("POINTER(c_int)", "int*", "指针"),
]
print(f"  {'ctypes 类型':<20} {'C 类型':<12} {'Python 类型'}")
for ct, c_t, py_t in type_map:
    print(f"  {ct:<20} {c_t:<12} {py_t}")

print("\\n--- 3. 调用 C 标准库函数 ---")
# 调用 abs
try:
    libc.abs.argtypes = [ctypes.c_int]
    libc.abs.restype = ctypes.c_int
    print(f"  libc.abs(-42) = {libc.abs(-42)}")
except AttributeError:
    print(f"  (此平台不支持 abs，跳过)")

# 调用 strlen
try:
    libc.strlen.argtypes = [ctypes.c_char_p]
    libc.strlen.restype = ctypes.c_size_t
    print(f"  libc.strlen(b'hello') = {libc.strlen(b'hello')}")
except AttributeError:
    print(f"  (此平台不支持 strlen，跳过)")

# 调用 sqrt
try:
    libm.sqrt.argtypes = [ctypes.c_double]
    libm.sqrt.restype = ctypes.c_double
    print(f"  libm.sqrt(2.0) = {libm.sqrt(2.0):.6f}")
except (AttributeError, OSError):
    print(f"  libm.sqrt 不可用，用 math.sqrt 模拟: {math.sqrt(2.0):.6f}")

print("\\n--- 4. 性能对比：Python 内置 vs ctypes ---")

# math.sqrt 是 C 实现，但已绑定到 Python，无 ctypes 调用开销
t_math = timeit.timeit(lambda: math.sqrt(2.0), number=1_000_000)
print(f"  math.sqrt  (内置 C): {t_math*1000:.1f} ms")

# 纯 Python 实现
def py_sqrt(n, iters=20):
    x = n
    for _ in range(iters):
        x = 0.5 * (x + n / x)
    return x
t_py = timeit.timeit(lambda: py_sqrt(2.0), number=100_000)
print(f"  纯 Python 牛顿法:   {t_py*1000:.1f} ms (100k 次)")

# ctypes 调用（有调用开销）
try:
    t_ctypes = timeit.timeit(lambda: libm.sqrt(2.0), number=1_000_000)
    print(f"  ctypes libm.sqrt:   {t_ctypes*1000:.1f} ms (有调用开销)")
    print(f"\\n  对比:")
    print(f"    math.sqrt / 纯 Python = {t_math/t_py*10:.2f}x (内置快)")
    print(f"    ctypes / math.sqrt    = {t_ctypes/t_math:.2f}x (ctypes 反而慢，调用开销)")
    print("  => 简单函数用 ctypes 反而慢，只有重计算才值得")
except (AttributeError, OSError):
    print("  ctypes sqrt 不可用，跳过此对比")

print("\\n--- 5. 模拟调用 C 库：字符串处理 ---")
# 演示 ctypes 处理字符串
try:
    # atoi: 字符串转 int
    libc.atoi.argtypes = [ctypes.c_char_p]
    libc.atoi.restype = ctypes.c_int
    print(f"  libc.atoi(b'12345') = {libc.atoi(b'12345')}")
    print(f"  libc.atoi(b'-42')   = {libc.atoi(b'-42')}")
except AttributeError:
    print("  libc.atoi 不可用")

print("\\n--- 6. ctypes vs cffi vs Cython vs Rust 对比 ---")
comparison = [
    ("ctypes",     "简单", "中",   "不释放", "调用现有 C 库"),
    ("cffi",       "中等", "中高", "不释放", "调用 C 库，PyPy 友好"),
    ("Cython",     "中等", "高",   "可释放", "性能瓶颈，科学计算"),
    ("原生 C API", "难",   "极高", "可释放", "极致性能"),
    ("Rust(PyO3)", "中等", "高",   "可释放", "现代替代，内存安全"),
]
print(f"  {'方式':<14} {'上手':<6} {'性能':<6} {'GIL':<8} {'适用'}")
for m, easy, perf, gil, use in comparison:
    print(f"  {m:<14} {easy:<6} {perf:<6} {gil:<8} {use}")

print("\\n--- 7. 模拟原生 C 扩展代码示例 ---")
print("  原生 C 扩展需要写 .c 文件 + setup.py:")
print("  // fastmath.c")
print("  #include <Python.h>")
print("  static PyObject* fast_square(PyObject* self, PyObject* args) {")
print("      double x;")
print('      if (!PyArg_ParseTuple(args, "d", &x)) return NULL;')
print("      return PyFloat_FromDouble(x * x);")
print("  }")
print("  # 编译: python setup.py build_ext --inplace")

print("\\n--- 8. 业务场景 ---")
scenarios = [
    ("调用现有 C 库", "libmysqlclient / libssl / libpng"),
    ("调用系统 API", "libc / Win32 API"),
    ("性能关键路径", "图像处理、加密算法"),
    ("硬件交互", "GPIO、传感器驱动"),
]
print(f"  {'场景':<18} {'示例'}")
for s, ex in scenarios:
    print(f"  {s:<18} {ex}")

print("\\n--- 9. 原理深入 ---")
print("  ctypes 调用流程:")
print("    1. dlopen 加载共享库")
print("    2. dlsym 查找函数符号地址")
print("    3. Python 对象 -> C 类型（参数转换）")
print("    4. 调用 C 函数（持有 GIL）")
print("    5. C 返回值 -> Python 对象")
print("  ⚠️ GIL 在 ctypes 调用期间默认不释放")
print("  原生 C 扩展可用 Py_BEGIN_ALLOW_THREADS 释放 GIL")

print("\\n--- 10. 最佳实践总结 ---")
best = [
    "调用现有 C 库：优先 ctypes（标准库）或 cffi（更灵活）",
    "性能瓶颈：用 Cython 或 Rust（PyO3）",
    "简单函数不要用 ctypes，调用开销可能抵消收益",
    "注意 GIL：长 C 计算应释放 GIL 让其他线程并行",
    "跨平台：库名与路径在 Linux/macOS/Windows 不同",
]
for i, b in enumerate(best, 1):
    print(f"  {i}. {b}")

print("\\n=== C 扩展演示结束 ===")`
  },
  {
    id: "py6-cython",
    group: "底层原理与性能",
    icon: "🚀",
    title: "Cython 性能优化",
    content: `## Cython 性能优化

### 一、Cython 是什么

Cython 是 **Python 的超集**，编译后生成 C 代码，再编译为 Python 扩展模块。它融合了：
- Python 的简洁语法
- C 的静态类型与高性能

通过给 Python 代码**加类型注解**，可获 10-100 倍加速。

### 二、Cython 语言特性

\`\`\`cython
# .pyx 文件
def fib(int n):           # C int 类型参数
    cdef int i            # C 局部变量
    cdef double a = 0.0   # C double
    cdef list result = [] # Python list
    a, b = 0, 1
    for i in range(n):
        result.append(b)
        a, b = b, a + b
    return result
\`\`\`

关键关键字：
- \`cdef\`：声明 C 类型变量/函数
- \`cpdef\`：同时可被 Python 和 Cython 调用
- \`cdef class\`：C 扩展类，属性 C 类型
- \`@cython.boundscheck(False)\`：禁用边界检查

### 三、cythonize 编译

\`\`\`bash
# 安装
pip install cython

# 编译 .pyx -> .c -> .so
cythonize -i mymodule.pyx
\`\`\`

或用 \`setup.py\`：

\`\`\`python
from setuptools import setup
from Cython.Build import cythonize
setup(ext_modules=cythonize("mymodule.pyx"))
# 编译: python setup.py build_ext --inplace
\`\`\`

### 四、用纯 Python 模拟类型声明效果

Cython 关键是**消除动态类型开销**。纯 Python 无法做到，但可模拟思路：

\`\`\`python
# 纯 Python（动态类型，每步都查类型）
def sum_python(n):
    total = 0
    for i in range(n):
        total += i
    return total

# Cython 等价（静态类型，无类型检查开销）
# cdef long sum_cython(long n):
#     cdef long i, total = 0
#     for i in range(n):
#         total += i
#     return total
\`\`\`

Cython 版本中，\`total\` 是 C long，\`+=\` 直接编译为机器码 \`ADD\`，无 Python 对象创建/销毁。

### 五、性能对比：纯 Python vs Cython

实测斐波那契：

\`\`\`python
# 纯 Python
def fib_py(n):
    if n < 2: return n
    return fib_py(n-1) + fib_py(n-2)

# Cython
# cpdef long fib_cy(long n):
#     if n < 2: return n
#     return fib_cy(n-1) + fib_cy(n-2)
\`\`\`

Cython 版本通常快 **50-100 倍**，因为：
- 递归调用走 C 函数调用，无 Python 调用开销
- 整数运算用 C long，无 Python int 对象
- 栈帧用 C 栈，不创建 Python frame

### 六、Cython 优化技巧

#### 1. cdef 类型注解

\`\`\`cython
def compute(int n):
    cdef int i
    cdef double total = 0.0
    for i in range(n):
        total += i * i
    return total
\`\`\`

#### 2. 禁用检查

\`\`\`cython
import cython
@cython.boundscheck(False)  # 禁用下标边界检查
@cython.wraparound(False)   # 禁用负索引
def sum_array(double[:] arr):
    cdef int i, n = arr.shape[0]
    cdef double total = 0.0
    for i in range(n):
        total += arr[i]
    return total
\`\`\`

#### 3. 用 memoryview 替代 numpy 数组

\`\`\`cython
# memoryview 比 numpy 数组访问更快
def process(double[:] data):  # memoryview
    cdef int i
    for i in range(data.shape[0]):
        data[i] *= 2
\`\`\`

#### 4. cdef class 扩展类

\`\`\`cython
cdef class Point:
    cdef double x, y
    def __init__(self, double x, double y):
        self.x = x
        self.y = y
    cpdef double dist(self, Point other):
        return ((self.x - other.x)**2 + (self.y - other.y)**2) ** 0.5
\`\`\`

### 七、业务场景

1. **科学计算**：numexpr、scipy 部分模块用 Cython
2. **性能瓶颈**：循环密集型计算
3. **包装 C/C++ 库**：Cython 可直接调用 C++ 类
4. **数据分析**：pandas 部分内核 Cython 实现

### 八、Cython vs Numba vs Rust

| 工具 | 上手 | 性能 | 编译 | 适用 |
|------|------|------|------|------|
| Cython | 中 | 高 | 需编译 | 科学计算，包装 C++ |
| Numba | 简单 | 高 | JIT | 数值计算，numpy 循环 |
| Rust (PyO3) | 难 | 高 | 需编译 | 现代替代，内存安全 |
| 原生 C | 难 | 极高 | 需编译 | 极致性能 |

### 九、原理深入

Cython 编译流程：
1. 解析 \`.pyx\`（Python 超集）
2. 类型推断：\`cdef\` 声明的变量转 C 类型
3. 生成 \`.c\` 文件（大量 CPython API 调用）
4. C 编译器编译为 \`.so\` 共享库
5. Python \`import\` 加载扩展模块

关键优化：
- **静态类型消除动态分派**：\`int + int\` 直接 \`ADD\`，不查 \`__add__\`
- **C 调用约定**：递归/调用走 C 栈，无 Python frame 开销
- **GIL 可释放**：\`cdef nogil\` 函数中可释放 GIL，多线程并行

\`\`\`cython
# nogil 函数：释放 GIL，可多线程并行
cdef double compute(double[:] data) nogil:
    cdef int i
    cdef double total = 0
    for i in range(data.shape[0]):
        total += data[i]
    return total
\`\`\`

### 十、最佳实践总结

- 循环密集型计算首选 Cython 或 Numba
- 用 \`cdef\` 注解热点循环变量
- numpy 数组用 \`memoryview\` 访问更快
- 禁用 \`boundscheck\` / \`wraparound\` 提速
- 包装 C++ 库用 Cython，新项目考虑 Rust`,
    code: `# Cython 性能优化演示：用纯 Python 模拟 Cython 优化思路
# 真实 Cython 需要 pip install cython + 编译，这里用纯 Python 对比

import timeit
import time

print("=== Cython 性能优化演示 ===\\n")

print("--- 1. Cython 简介 ---")
print("  Cython = Python 超集 + C 类型注解，编译为 .so 扩展")
print("  关键字: cdef (C 变量), cpdef (双调用), cdef class (扩展类)")
print("  优化原理: 静态类型消除动态分派，C 调用约定减少开销")

print("\\n--- 2. 模拟 Cython 类型声明效果 ---")
print("  纯 Python:")
print("    def sum_py(n):")
print("        total = 0  # 动态类型，每次 += 都查 __add__")
print("        for i in range(n):")
print("            total += i")
print("        return total")
print("  Cython 等价:")
print("    def sum_cy(int n):")
print("        cdef long i, total = 0  # C long，直接 ADD 指令")
print("        for i in range(n):")
print("            total += i")
print("        return total")

print("\\n--- 3. 实测：纯 Python 求和 ---")
def sum_py(n):
    total = 0
    for i in range(n):
        total += i
    return total

def sum_py_opt(n):
    # 用 sum + range，C 层循环
    return sum(range(n))

N = 10_000_000
t_py = timeit.timeit(lambda: sum_py(N), number=3)
t_opt = timeit.timeit(lambda: sum_py_opt(N), number=3)
print(f"  纯 Python for 循环: {t_py*1000:.1f} ms (3 次)")
print(f"  sum(range(n)) C 层: {t_opt*1000:.1f} ms (3 次)")
print(f"  C 层快 {t_py/t_opt:.1f}x (类似 Cython 优化效果)")
print("  Cython 真实优化后通常再快 5-20x")

print("\\n--- 4. 模拟 Cython 优化斐波那契 ---")
# 纯 Python 递归
def fib_py(n):
    if n < 2:
        return n
    return fib_py(n-1) + fib_py(n-2)

# 用缓存优化（模拟 Cython 的 C 调用开销降低）
from functools import lru_cache

@lru_cache(maxsize=None)
def fib_cached(n):
    if n < 2:
        return n
    return fib_cached(n-1) + fib_cached(n-2)

# 纯 Python 递归慢
t_recursive = timeit.timeit(lambda: fib_py(20), number=10)
t_memo = timeit.timeit(lambda: fib_cached(20), number=10)
print(f"  fib(20) 递归 10 次:")
print(f"    纯 Python: {t_recursive*1000:.1f} ms")
print(f"    带缓存:    {t_memo*1000:.1f} ms")
print("  Cython 静态类型版本通常比纯 Python 快 50-100x")

print("\\n--- 5. Cython 优化技巧演示 ---")
print("  # .pyx 文件示例")
print("  import cython")
print("  @cython.boundscheck(False)  # 禁用边界检查")
print("  @cython.wraparound(False)   # 禁用负索引")
print("  def sum_array(double[:] arr):  # memoryview")
print("      cdef int i, n = arr.shape[0]")
print("      cdef double total = 0.0")
print("      for i in range(n):")
print("          total += arr[i]")
print("      return total")

# 模拟数组求和优化
def sum_list_py(arr):
    total = 0
    for x in arr:
        total += x
    return total

def sum_list_builtin(arr):
    return sum(arr)

data = list(range(10000))
t_loop = timeit.timeit(lambda: sum_list_py(data), number=1000)
t_builtin = timeit.timeit(lambda: sum_list_builtin(data), number=1000)
print(f"\\n  对比 list 求和 1000 次:")
print(f"    for 循环:  {t_loop*1000:.1f} ms")
print(f"    sum() 内置: {t_builtin*1000:.1f} ms")
print(f"    内置快 {t_loop/t_builtin:.1f}x（C 层实现，类似 Cython）")

print("\\n--- 6. cdef class 扩展类示例 ---")
print("  cdef class Point:")
print("      cdef double x, y  # C 属性，无 __dict__")
print("      def __init__(self, double x, double y):")
print("          self.x = x")
print("          self.y = y")
print("      cpdef double dist(self, Point other):")
print("          return ((self.x-other.x)**2 + (self.y-other.y)**2) ** 0.5")
print("  优势: 属性访问直接 C 偏移，无 dict 查找")

print("\\n--- 7. nogil 释放 GIL 多线程并行 ---")
print("  cdef double compute(double[:] data) nogil:")
print("      cdef int i")
print("      cdef double total = 0")
print("      for i in range(data.shape[0]):")
print("          total += data[i]")
print("      return total")
print("  # nogil 块中可多线程真正并行")
print("  with nogil:")
print("      result = compute(data)")

print("\\n--- 8. 编译流程 ---")
print("  .pyx 源码")
print("    ↓ Cython 编译器")
print("  .c C 代码（大量 CPython API 调用）")
print("    ↓ C 编译器 (gcc/clang)")
print("  .so 共享库")
print("    ↓ Python import")
print("  扩展模块")
print("\\n  命令: cythonize -i mymodule.pyx")
print("  或:   python setup.py build_ext --inplace")

print("\\n--- 9. Cython vs Numba vs Rust 对比 ---")
comparison = [
    ("Cython",     "中等", "高",   "需编译",  "科学计算，包装 C++"),
    ("Numba",      "简单", "高",   "JIT",     "数值计算，numpy 循环"),
    ("Rust(PyO3)", "难",   "高",   "需编译",  "现代替代，内存安全"),
    ("原生 C",     "难",   "极高", "需编译",  "极致性能"),
]
print(f"  {'工具':<14} {'上手':<6} {'性能':<6} {'编译':<8} {'适用'}")
for t, easy, perf, comp, use in comparison:
    print(f"  {t:<14} {easy:<6} {perf:<6} {comp:<8} {use}")

print("\\n--- 10. 业务场景 ---")
scenarios = [
    ("科学计算", "numexpr / scipy 部分用 Cython"),
    ("性能瓶颈", "循环密集型计算"),
    ("包装 C/C++ 库", "Cython 可直接调用 C++ 类"),
    ("数据分析", "pandas 部分内核 Cython 实现"),
]
print(f"  {'场景':<18} {'示例'}")
for s, ex in scenarios:
    print(f"  {s:<18} {ex}")

print("\\n--- 11. 最佳实践总结 ---")
best = [
    "循环密集型计算首选 Cython 或 Numba",
    "用 cdef 注解热点循环变量",
    "numpy 数组用 memoryview 访问更快",
    "禁用 boundscheck / wraparound 提速",
    "包装 C++ 库用 Cython，新项目考虑 Rust",
]
for i, b in enumerate(best, 1):
    print(f"  {i}. {b}")

print("\\n=== Cython 演示结束 ===")`
  },
  {
    id: "py6-profiler",
    group: "底层原理与性能",
    icon: "📊",
    title: "性能分析工具（cProfile/line_profiler）",
    content: `## 性能分析工具（cProfile/line_profiler）

### 一、性能分析三层次

| 层次 | 工具 | 粒度 | 用途 |
|------|------|------|------|
| 函数级 | cProfile | 函数调用 | 找热点函数 |
| 行级 | line_profiler | 单行代码 | 找函数内热点行 |
| 微基准 | timeit | 单条语句 | 对比小代码片段 |

### 二、cProfile 标准库

cProfile 是标准库，无需安装，统计每个函数的调用次数与耗时：

\`\`\`python
import cProfile
import pstats

def slow_function():
    total = 0
    for i in range(10**6):
        total += i ** 2
    return total

cProfile.run("slow_function()", sort="cumulative")
\`\`\`

输出字段：
- \`ncalls\`：调用次数
- \`tottime\`：函数自身耗时（不含子调用）
- \`cumtime\`：累计耗时（含子调用）
- \`percall\`：平均耗时

### 三、pstats 统计报告

\`\`\`python
import cProfile, pstats
pr = cProfile.Profile()
pr.enable()
# 你的代码
slow_function()
pr.disable()

stats = pstats.Stats(pr)
stats.sort_stats("cumulative").print_stats(10)  # 前 10
stats.print_callers()    # 谁调用了
stats.print_callees()    # 调用了谁
\`\`\`

### 四、line_profiler 逐行分析

\`line_profiler\` 第三方库，逐行统计耗时：

\`\`\`bash
pip install line_profiler
\`\`\`

\`\`\`python
from line_profiler import LineProfiler

def slow_function():
    total = 0
    for i in range(10**6):
        total += i ** 2
    return total

lp = LineProfiler()
lp.add_function(slow_function)
lp_wrapper = lp(slow_function)
lp_wrapper()
lp.print_stats()
\`\`\`

输出每行：
- \`Hits\`：执行次数
- \`Time\`：总耗时
- \`Per Hit\`：平均耗时
- \`% Time\`：占函数总耗时百分比

### 五、timeit 微基准测试

\`timeit\` 标准库，对比小代码片段，自动多次运行取平均：

\`\`\`python
import timeit

# 对比列表推导 vs for 循环
t1 = timeit.timeit("[i**2 for i in range(100)]", number=10000)
t2 = timeit.timeit("""
result = []
for i in range(100):
    result.append(i**2)
""", number=10000)
print(f"列表推导: {t1:.3f}s")
print(f"for 循环: {t2:.3f}s")
\`\`\`

注意：
- \`number\` 控制执行次数
- \`repeat\` 多次测量取最小值（避免抖动）
- 默认禁用 GC（\`gc.disable()\`），减少干扰

### 六、用 cProfile 实测一段代码

\`\`\`python
import cProfile

def business_logic():
    data = []
    for i in range(10000):
        data.append(str(i).upper())
    return sum(len(s) for s in data)

cProfile.run("business_logic()", sort="tottime")
\`\`\`

输出会显示 \`str.upper\`、\`len\`、\`sum\` 等热点函数。

### 七、热点定位方法

1. **先用 cProfile 找函数**：哪个函数耗时长
2. **再用 line_profiler 找行**：函数内哪一行耗时
3. **用 timeit 对比优化方案**：验证改进效果
4. **不要凭直觉**：90% 的"瓶颈猜测"是错的

> 💡 **避坑提示**：cProfile 本身有开销（约 25% 减速），测得时间不准但**比例可信**。绝对时间用 \`time.perf_counter\` 单独测。

### 八、业务场景

1. **API 响应慢**：cProfile 跑一次请求，找耗时函数
2. **数据处理慢**：line_profiler 找循环内热点行
3. **算法对比**：timeit 对比不同实现
4. **生产监控**：py-spy 采样 profile 不停服

### 九、vs py-spy / pyinstrument

| 工具 | 类型 | 开销 | 特点 |
|------|------|------|------|
| cProfile | 确定性 | 高（25%） | 标准库，准确 |
| py-spy | 采样 | 低（<5%） | 不停服，C 实现 |
| pyinstrument | 采样 | 低 | 友好输出，调用栈 |
| line_profiler | 行级 | 极高 | 逐行精度 |

**生产环境**用 py-spy（采样、不停服），**开发环境**用 cProfile（准确）。

### 十、原理深入

cProfile 用 **C 实现的回调**记录每次函数调用：
- Python 解释器在函数调用/返回时调用 cProfile 钩子
- 钩子记录时间戳和函数对象
- 每次钩子有 ~1μs 开销，函数越多开销越大

py-spy 用 **采样**（sampling）：
- 每隔几毫秒读取目标进程的调用栈
- 不修改目标程序，无侵入
- 适合长时间运行的生产服务

### 十一、最佳实践总结

- 先用 cProfile 找热点函数，再用 line_profiler 找行
- 微基准用 timeit，自动多次运行
- 不要凭直觉优化，先 profile 再下手
- 生产环境用 py-spy 不停服采样
- 一次只优化一个热点，验证后再优化下一个`,
    code: `# 性能分析工具演示：cProfile / pstats / timeit
# 仅用标准库

import cProfile
import pstats
import io
import timeit
import time
import sys

print("=== 性能分析工具演示 ===\\n")

print("--- 1. cProfile 函数级分析 ---")

def slow_function():
    """模拟一个慢函数"""
    total = 0
    for i in range(100000):
        total += i ** 2
    return total

def fast_function():
    return sum(i ** 2 for i in range(100000))

def business_logic():
    data = []
    for i in range(1000):
        data.append(str(i).upper())
    return sum(len(s) for s in data)

# 用 cProfile 分析
pr = cProfile.Profile()
pr.enable()
for _ in range(5):
    slow_function()
    fast_function()
    business_logic()
pr.disable()

# 打印 top 10
s = io.StringIO()
ps = pstats.Stats(pr, stream=s).sort_stats("cumulative")
ps.print_stats(10)
output = s.getvalue()
# 提取关键行
print("  cProfile 输出（前 10 函数）:")
for line in output.split("\\n"):
    if line.strip() and ("function" in line or "ncalls" in line or
                          ".py" in line or "{" in line):
        print(f"    {line.strip()}")

print("\\n--- 2. cProfile 关键字段说明 ---")
fields = [
    ("ncalls", "调用次数"),
    ("tottime", "函数自身耗时（不含子调用）"),
    ("percall", "tottime / ncalls"),
    ("cumtime", "累计耗时（含子调用）"),
    ("percall", "cumtime / ncalls"),
    ("filename:lineno", "函数位置"),
]
print(f"  {'字段':<12} {'说明'}")
for f, d in fields:
    print(f"  {f:<12} {d}")

print("\\n--- 3. timeit 微基准：列表推导 vs for 循环 ---")
def list_comp():
    return [i ** 2 for i in range(1000)]

def for_loop():
    result = []
    for i in range(1000):
        result.append(i ** 2)
    return result

t_comp = timeit.timeit(list_comp, number=10000)
t_loop = timeit.timeit(for_loop, number=10000)
print(f"  10000 次执行耗时:")
print(f"    列表推导: {t_comp*1000:.1f} ms")
print(f"    for 循环: {t_loop*1000:.1f} ms")
print(f"    列表推导快 {t_loop/t_comp:.2f}x")

print("\\n--- 4. timeit repeat 多次测量取最小值 ---")
def sum_test():
    return sum(range(10000))

results = timeit.repeat(sum_test, number=1000, repeat=5)
print(f"  5 次测量结果 (ms): {[f'{r*1000:.1f}' for r in results]}")
print(f"  最小值: {min(results)*1000:.1f} ms (推荐)")
print(f"  平均值: {sum(results)/len(results)*1000:.1f} ms")
print(f"  最大值: {max(results)*1000:.1f} ms")
print("  取最小值避免系统抖动干扰")

print("\\n--- 5. timeit 对比字符串拼接 ---")
def concat_plus():
    s = ""
    for i in range(100):
        s = s + str(i)
    return s

def concat_join():
    return "".join(str(i) for i in range(100))

def concat_fstring():
    return f"{''.join(str(i) for i in range(100))}"

t_plus = timeit.timeit(concat_plus, number=1000)
t_join = timeit.timeit(concat_join, number=1000)
print(f"  1000 次字符串拼接:")
print(f"    s += str(i):   {t_plus*1000:.1f} ms")
print(f"    ''.join(...):  {t_join*1000:.1f} ms")
print(f"    join 快 {t_plus/t_join:.1f}x")

print("\\n--- 6. 模拟 line_profiler 行级分析 ---")
# line_profiler 是第三方库，这里模拟逐行计时
def profile_lines(func, *args):
    """简化版行级 profiler：用 sys.settrace 跟踪每行执行时间"""
    line_stats = {}
    last_time = [None]

    def tracer(frame, event, arg):
        if event == "line":
            now = time.perf_counter()
            if last_time[0] is not None:
                lineno = frame.f_lineno
                line_stats.setdefault(lineno, [0, 0.0])
                line_stats[lineno][0] += 1
                line_stats[lineno][1] += now - last_time[0]
            last_time[0] = now
        return tracer

    sys.settrace(tracer)
    try:
        func(*args)
    finally:
        sys.settrace(None)

    return line_stats

print("  模拟 line_profiler 逐行计时:")
line_stats = profile_lines(business_logic)
print(f"    {'行号':<6} {'次数':<6} {'耗时(ms)':<10}")
for lineno in sorted(line_stats.keys())[:8]:
    hits, total_time = line_stats[lineno]
    print(f"    {lineno:<6} {hits:<6} {total_time*1000:<10.3f}")

print("\\n--- 7. perf_counter 精确计时 ---")
t0 = time.perf_counter()
sum(i ** 2 for i in range(1000000))
t1 = time.perf_counter()
print(f"  perf_counter: 求和 100万 平方耗时 {(t1-t0)*1000:.2f} ms")
print("  perf_counter 是最高精度计时器，适合微基准")

print("\\n--- 8. 工具对比 ---")
tools = [
    ("cProfile",      "确定性", "高(25%)",     "标准库", "找热点函数"),
    ("line_profiler", "行级",   "极高",        "第三方", "找函数内热点行"),
    ("timeit",        "微基准", "低",          "标准库", "对比小代码片段"),
    ("py-spy",        "采样",   "低(<5%)",     "第三方", "生产不停服"),
    ("pyinstrument",  "采样",   "低",          "第三方", "友好输出"),
]
print(f"  {'工具':<16} {'类型':<8} {'开销':<10} {'来源':<8} {'用途'}")
for t, kind, oh, src, use in tools:
    print(f"  {t:<16} {kind:<8} {oh:<10} {src:<8} {use}")

print("\\n--- 9. 热点定位流程 ---")
steps = [
    "1. cProfile 找函数级热点（哪个函数耗时长）",
    "2. line_profiler 找行级热点（函数内哪行耗时）",
    "3. timeit 对比优化方案（验证改进效果）",
    "4. 不要凭直觉：90% 的瓶颈猜测是错的",
    "5. 一次只优化一个热点，验证后再优化下一个",
]
for step in steps:
    print(f"  {step}")

print("\\n--- 10. 业务场景 ---")
scenarios = [
    ("API 响应慢", "cProfile 跑一次请求，找耗时函数"),
    ("数据处理慢", "line_profiler 找循环内热点行"),
    ("算法对比", "timeit 对比不同实现"),
    ("生产监控", "py-spy 采样 profile 不停服"),
]
print(f"  {'场景':<15} {'方法'}")
for s, m in scenarios:
    print(f"  {s:<15} {m}")

print("\\n--- 11. 最佳实践总结 ---")
best = [
    "先用 cProfile 找热点函数，再用 line_profiler 找行",
    "微基准用 timeit，自动多次运行",
    "不要凭直觉优化，先 profile 再下手",
    "生产环境用 py-spy 不停服采样",
    "一次只优化一个热点，验证后再优化下一个",
    "cProfile 有 ~25% 开销，绝对时间用 perf_counter 测",
]
for i, b in enumerate(best, 1):
    print(f"  {i}. {b}")

print("\\n=== 性能分析演示结束 ===")`
  },
  {
    id: "py6-memory-profiler",
    group: "底层原理与性能",
    icon: "💾",
    title: "内存分析与优化",
    content: `## 内存分析与优化

### 一、sys.getsizeof 对象大小

\`sys.getsizeof\` 返回对象自身字节数（不含引用的对象）：

\`\`\`python
import sys
print(sys.getsizeof(1))           # 28
print(sys.getsizeof(1000000))     # 28
print(sys.getsizeof("a"))         # 50
print(sys.getsizeof([]))          # 56
print(sys.getsizeof([1, 2, 3]))   # 88
\`\`\`

注意：\`getsizeof\` 只算对象本身，**不含元素引用的对象**。如 \`[1, 2, 3]\` 只算 list 容器，不算里面的 int。

### 二、tracemalloc 标准库

\`tracemalloc\` 是 Python 3.4+ 标准库，**按代码行追踪内存分配**：

\`\`\`python
import tracemalloc

tracemalloc.start()
# 你的代码
data = [str(i) for i in range(100000)]
snapshot = tracemalloc.take_snapshot()
for stat in snapshot.statistics("lineno")[:10]:
    print(stat)
\`\`\`

输出每行代码分配的内存，类似 line_profiler 但针对内存。

### 三、内存快照对比

定位内存泄漏：对比两个时间点的快照：

\`\`\`python
import tracemalloc

tracemalloc.start()
snap1 = tracemalloc.take_snapshot()
# 执行可疑代码
leak_function()
snap2 = tracemalloc.take_snapshot()

for stat in snap2.compare_to(snap1, "lineno")[:10]:
    print(stat)
\`\`\`

输出：
\`\`\`
file.py:42: size=10MB (+10MB), count=100000 (+100000)
\`\`\`

\`+10MB\` 表示这行代码在两次快照间增加了 10MB 内存，极可能就是泄漏点。

### 四、常见内存泄漏模式

#### 1. 全局列表无限增长

\`\`\`python
cache = []
def add(x):
    cache.append(x)  # 永不清理，内存持续增长
\`\`\`

修复：用 \`lru_cache\` 或限制大小。

#### 2. 闭包捕获大对象

\`\`\`python
def make_handler(big_data):
    def handler():
        return big_data[0]  # 闭包持有 big_data 整个对象
    return handler
\`\`\`

修复：只捕获需要的部分。

#### 3. 缓存无界

\`\`\`python
result_cache = {}
def compute(key):
    if key not in result_cache:
        result_cache[key] = expensive(key)  # 永不淘汰
    return result_cache[key]
\`\`\`

修复：用 \`functools.lru_cache(maxsize=128)\`。

#### 4. 观察者未注销

\`\`\`python
class EventEmitter:
    def __init__(self):
        self.listeners = []
    def on(self, fn):
        self.listeners.append(fn)  # 持有 fn 引用，对象不释放
\`\`\`

修复：用 \`weakref.WeakSet\` 存弱引用。

### 五、生成器节省内存

\`\`\`python
# 列表：一次性生成所有，内存 O(n)
def squares_list(n):
    return [i ** 2 for i in range(n)]

# 生成器：惰性生成，内存 O(1)
def squares_gen(n):
    for i in range(n):
        yield i ** 2
\`\`\`

\`range(10**8)\` 用 list 会 OOM，用 \`range\`（生成器）只占几十字节。

### 六、__slots__ 节省对象内存

默认每个对象有 \`__dict__\` 存属性，占用大量内存。用 \`__slots__\` 显式声明属性，可省 40-50% 内存：

\`\`\`python
class PointDict:
    def __init__(self, x, y):
        self.x = x
        self.y = y

class PointSlots:
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x = x
        self.y = y

# 100 万个对象
import sys
p1 = PointDict(1, 2)
p2 = PointSlots(1, 2)
print(sys.getsizeof(p1) + sys.getsizeof(p1.__dict__))  # ~152
print(sys.getsizeof(p2))                                # ~48
\`\`\`

百万级对象场景，\`__slots__\` 可省 GB 级内存。

### 七、用 tracemalloc 实测

\`\`\`python
import tracemalloc

tracemalloc.start()
snap1 = tracemalloc.take_snapshot()

data = [PointDict(i, i+1) for i in range(100000)]
snap2 = tracemalloc.take_snapshot()

for stat in snap2.compare_to(snap1, "lineno")[:5]:
    print(stat)
\`\`\`

### 八、业务场景

1. **大数据处理**：用生成器/迭代器流式处理
2. **长运行服务**：监控内存增长，定位泄漏
3. **大量对象**：\`__slots__\` + 数组（\`array.array\`）替代 list
4. **缓存系统**：\`lru_cache\` 或 \`WeakValueDictionary\`

### 九、原理深入

CPython 对象内存构成：
- **PyObject 头**：16 字节（refcnt + type pointer）
- **类型特定数据**：如 int 的 ob_digit，str 的字符
- **__dict__**：属性字典（无 \`__slots__\` 时）

\`__slots__\` 的工作原理：
- 类声明 \`__slots__\` 后，**不再创建 \`__dict__\`**
- 属性用**类级别的描述符**访问，直接 C 偏移
- 每个实例省 96+ 字节（dict 开销）

### 十、内存优化工具对比

| 工具 | 用途 | 来源 |
|------|------|------|
| sys.getsizeof | 单对象大小 | 标准库 |
| tracemalloc | 按行追踪分配 | 标准库 |
| memory_profiler | 逐行内存 | 第三方 |
| objgraph | 对象引用图 | 第三方 |
| pympler | 对象统计 | 第三方 |

### 十一、最佳实践总结

- 大数据用生成器/迭代器，避免一次性 list
- 大量对象用 \`__slots__\` 节省内存
- 缓存用 \`lru_cache\` 限制大小，避免无界增长
- 监控长运行服务内存，用 tracemalloc 定位泄漏
- 观察者模式用 weakref 避免持有强引用`,
    code: `# 内存分析与优化演示：sys.getsizeof / tracemalloc / __slots__
# 仅用标准库

import sys
import tracemalloc
import time
import gc

print("=== Python 内存分析与优化演示 ===\\n")

print("--- 1. sys.getsizeof 单对象大小 ---")
samples = [
    ("int(0)", 0),
    ("int(1)", 1),
    ("int(10**18)", 10**18),
    ("'a'", "a"),
    ("''", ""),
    ("'hello'", "hello"),
    ("[]", []),
    ("[1]", [1]),
    ("[1,2,3]", [1, 2, 3]),
    ("{}", {}),
    ("{'a':1}", {"a": 1}),
    ("(1,)", (1,)),
    ("set()", set()),
]
print(f"  {'对象':<18} {'字节数':<10}")
for desc, obj in samples:
    print(f"  {desc:<18} {sys.getsizeof(obj):<10}")
print("  注意: getsizeof 只算对象本身，不含引用的对象")

print("\\n--- 2. tracemalloc 按代码行追踪内存 ---")
tracemalloc.start()
snap1 = tracemalloc.take_snapshot()

# 制造一些内存分配
data1 = [str(i) for i in range(50000)]
data2 = [i ** 2 for i in range(50000)]

snap2 = tracemalloc.take_snapshot()
print("  分配 100000 个对象后，内存 top 5（按行）:")
stats = snap2.compare_to(snap1, "lineno")
for stat in stats[:5]:
    print(f"    {stat}")

# 清理
del data1, data2
gc.collect()
tracemalloc.stop()

print("\\n--- 3. 生成器 vs 列表内存对比 ---")
# 列表：一次性生成所有
def squares_list(n):
    return [i ** 2 for i in range(n)]

# 生成器：惰性生成
def squares_gen(n):
    for i in range(n):
        yield i ** 2

# range 也是惰性
N = 1_000_000
lst = squares_list(N)
gen = squares_gen(N)
r = range(N)

print(f"  N = {N:,}")
print(f"  list  内存: {sys.getsizeof(lst):,} bytes")
print(f"  gen   内存: {sys.getsizeof(gen):,} bytes (生成器对象本身)")
print(f"  range 内存: {sys.getsizeof(r):,} bytes (惰性序列)")
print("  => range / 生成器在大数据下节省 GB 级内存")

del lst  # 释放内存

print("\\n--- 4. __slots__ 节省对象内存 ---")
class PointDict:
    """普通类，每个实例有 __dict__"""
    def __init__(self, x, y):
        self.x = x
        self.y = y

class PointSlots:
    """__slots__ 类，无 __dict__"""
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x = x
        self.y = y

p1 = PointDict(1, 2)
p2 = PointSlots(1, 2)

# 单对象大小对比
size_dict = sys.getsizeof(p1) + sys.getsizeof(p1.__dict__)
size_slots = sys.getsizeof(p2)
print(f"  PointDict 实例: {sys.getsizeof(p1)} + __dict__ {sys.getsizeof(p1.__dict__)} = {size_dict} bytes")
print(f"  PointSlots 实例: {size_slots} bytes (无 __dict__)")
print(f"  节省: {size_dict - size_slots} bytes / 对象 ({(1-size_slots/size_dict)*100:.0f}%)")

# 大量对象内存对比
tracemalloc.start()
snap1 = tracemalloc.take_snapshot()
points_dict = [PointDict(i, i+1) for i in range(100000)]
snap2 = tracemalloc.take_snapshot()
mem_dict = sum(s.size_diff for s in snap2.compare_to(snap1, "lineno"))
del points_dict
gc.collect()

snap3 = tracemalloc.take_snapshot()
points_slots = [PointSlots(i, i+1) for i in range(100000)]
snap4 = tracemalloc.take_snapshot()
mem_slots = sum(s.size_diff for s in snap4.compare_to(snap3, "lineno"))
del points_slots
gc.collect()
tracemalloc.stop()

print(f"\\n  100000 个对象内存:")
print(f"    PointDict:  {mem_dict/1024/1024:.1f} MB")
print(f"    PointSlots: {mem_slots/1024/1024:.1f} MB")
print(f"    节省: {(1-mem_slots/mem_dict)*100:.0f}%")

print("\\n--- 5. 常见内存泄漏模式 ---")
print("  1. 全局列表无限增长:")
print("     cache = []")
print("     def add(x): cache.append(x)  # 永不清理")
print("  2. 闭包捕获大对象:")
print("     def make_handler(big_data):")
print("         def handler(): return big_data[0]")
print("  3. 缓存无界:")
print("     result_cache = {}  # 永不淘汰")
print("  4. 观察者未注销:")
print("     self.listeners.append(fn)  # 持有 fn 强引用")

print("\\n--- 6. 内存优化技巧对比 ---")
tips = [
    ("生成器替代 list",   "O(1) 内存", "大数据流式处理"),
    ("__slots__",        "省 40-50%", "大量同类对象"),
    ("lru_cache",        "限制大小",  "函数结果缓存"),
    ("weakref",          "弱引用",    "缓存/观察者"),
    ("array.array",      "C 数组",    "纯数值列表"),
    ("del + gc.collect", "主动释放",  "大对象用完立即释放"),
]
print(f"  {'技巧':<22} {'效果':<12} {'场景'}")
for t, eff, scene in tips:
    print(f"  {t:<22} {eff:<12} {scene}")

print("\\n--- 7. array.array 替代 list 存数值 ---")
import array

# list 存整数：每个 int 对象 28 字节 + 指针 8 字节
lst = list(range(10000))
# array.array 存整数：直接 C int，4 字节/个
arr = array.array("i", range(10000))

print(f"  10000 个整数:")
print(f"    list:        {sys.getsizeof(lst):,} bytes")
print(f"    array.array: {sys.getsizeof(arr):,} bytes")
print(f"    节省: {(1-sys.getsizeof(arr)/sys.getsizeof(lst))*100:.0f}%")

print("\\n--- 8. 内存优化工具对比 ---")
tools = [
    ("sys.getsizeof", "单对象大小", "标准库"),
    ("tracemalloc", "按行追踪分配", "标准库"),
    ("memory_profiler", "逐行内存", "第三方"),
    ("objgraph", "对象引用图", "第三方"),
    ("pympler", "对象统计", "第三方"),
]
print(f"  {'工具':<20} {'用途':<18} {'来源'}")
for t, use, src in tools:
    print(f"  {t:<20} {use:<18} {src}")

print("\\n--- 9. 业务场景 ---")
scenarios = [
    ("大数据处理", "用生成器/迭代器流式处理"),
    ("长运行服务", "监控内存增长，定位泄漏"),
    ("大量对象", "__slots__ + array.array 替代 list"),
    ("缓存系统", "lru_cache 或 WeakValueDictionary"),
]
print(f"  {'场景':<15} {'方法'}")
for s, m in scenarios:
    print(f"  {s:<15} {m}")

print("\\n--- 10. 最佳实践总结 ---")
best = [
    "大数据用生成器/迭代器，避免一次性 list",
    "大量对象用 __slots__ 节省内存",
    "缓存用 lru_cache 限制大小，避免无界增长",
    "监控长运行服务内存，用 tracemalloc 定位泄漏",
    "观察者模式用 weakref 避免持有强引用",
    "纯数值列表用 array.array 替代 list",
]
for i, b in enumerate(best, 1):
    print(f"  {i}. {b}")

print("\\n=== 内存分析演示结束 ===")`
  },
  {
    id: "py6-jit",
    group: "底层原理与性能",
    icon: "⚡",
    title: "JIT 编译与 PyPy/Pyjion",
    content: `## JIT 编译与 PyPy/Pyjion

### 一、JIT 编译概念

JIT（Just-In-Time）即时编译：**运行时**把热点代码编译为机器码，下次执行直接跑机器码，跳过解释。

对比三种执行方式：

| 方式 | 时机 | 性能 | 代表 |
|------|------|------|------|
| 解释执行 | 运行时逐行 | 慢 | CPython |
| AOT 编译 | 运行前 | 快 | C/C++/Rust |
| JIT 编译 | 运行时热点 | 中快 | PyPy/Java/JS |

JIT 兼具**启动快**（先解释）和**长期快**（热点编译）的优点。

### 二、PyPy 解释器

PyPy 是 Python 的另一个实现，用 RPython 编写，内置 JIT：

\`\`\`bash
# 安装
brew install pypy3  # macOS
apt install pypy3   # Ubuntu

# 运行
pypy3 script.py
\`\`\`

PyPy 优势：
- **纯 Python 代码快 5-10 倍**
- 完全兼容 CPython 语法
- GC 更高效（增量式 mark-sweep）

劣势：
- 启动慢（JIT 预热）
- C 扩展兼容性差（cpyext 模拟慢）
- 内存占用大（JIT 编译缓存）

### 三、Pyjion（CPython JIT）

Pyjion 是微软开发的 CPython JIT 扩展，3.9+ 可用：

\`\`\`bash
pip install pyjion
\`\`\`

\`\`\`python
import pyjion
pyjion.enable()  # 启用 JIT
# 后续代码被 JIT 编译
def fib(n):
    if n < 2: return n
    return fib(n-1) + fib(n-2)
fib(30)
pyjion.disable()
\`\`\`

Pyjion 特点：
- 不换解释器，C Python 加 JIT
- 适合已有代码无侵入加速
- 加速比 PyPy 小（约 2-3x）

### 四、Numba 科学计算 JIT

Numba 是专为**数值计算**优化的 JIT，用 LLVM：

\`\`\`python
from numba import jit
import numpy as np

@jit(nopython=True)  # 强制编译为原生机器码
def matrix_sum(arr):
    total = 0.0
    for i in range(arr.shape[0]):
        for j in range(arr.shape[1]):
            total += arr[i, j]
    return total

arr = np.random.rand(1000, 1000)
print(matrix_sum(arr))  # 第一次调用编译，后续快
\`\`\`

Numba 优势：
- numpy 循环加速 50-100 倍
- @jit 装饰器无侵入
- 支持 GPU（CUDA）

劣势：
- 只优化数值计算
- 不支持所有 Python 特性
- 编译有首次开销

### 五、用 timeit 对比纯 Python vs 模拟 JIT 效果

\`\`\`python
import timeit

# 纯 Python 循环
def py_sum(n):
    total = 0
    for i in range(n):
        total += i ** 2
    return total

# 模拟 JIT 优化：用 sum + range（C 层循环）
def c_sum(n):
    return sum(i ** 2 for i in range(n))

# 模拟 JIT 极致优化：用数学公式
def formula_sum(n):
    return n * (n + 1) * (2 * n + 1) // 6

t1 = timeit.timeit(lambda: py_sum(10**6), number=10)
t2 = timeit.timeit(lambda: c_sum(10**6), number=10)
t3 = timeit.timeit(lambda: formula_sum(10**6), number=10)
print(f"纯 Python: {t1:.3f}s")
print(f"C 层循环:  {t2:.3f}s")
print(f"数学公式:  {t3:.3f}s")
\`\`\`

### 六、JIT 适用场景

✅ **JIT 加速明显**：
- 循环密集型（数值计算）
- 类型稳定的代码（变量类型不变）
- 长时间运行（JIT 预热后）

❌ **JIT 无效甚至更慢**：
- 启动后立即退出的脚本（JIT 没机会编译）
- 频繁调用的 C 扩展（已是机器码）
- 类型多态代码（每次都需重新编译）

### 七、业务场景

1. **数值计算**：Numba 加速 numpy 循环
2. **科学计算**：PyPy 跑纯 Python 算法
3. **Web 后端**：PyPy 跑 Django/Flask（启动慢但长期快）
4. **数据管道**：JIT 加速数据处理循环

### 八、原理深入

JIT 工作流程（PyPy 为例）：
1. **解释执行**：先用解释器跑，记录热点
2. **热点检测**：某循环/函数执行次数超阈值
3. **IR 生成**：把字节码转为中间表示
4. **优化**：常量折叠、内联、类型特化
5. **机器码生成**：编译为原生机器码
6. **执行**：下次调用直接跑机器码

关键优化：**类型特化**（type specialization）

\`\`\`python
def add(a, b):
    return a + b
# 第一次 add(1, 2)：特化为 int 版本，编译为 ADD 指令
# 第二次 add("a", "b")：类型不同，重新编译 str 版本
\`\`\`

CPython 每次都要查 \`__add__\`，JIT 第一次后直接机器码。

### 九、PyPy vs CPython vs Numba

| 实现 | 纯 Python | numpy | C 扩展 | 启动 |
|------|----------|-------|--------|------|
| CPython | 1x | 1x | 1x | 快 |
| PyPy | 5-10x | 慢 | 慢 | 慢 |
| Numba (@jit) | 50x+ | 50x+ | 不适用 | 中 |
| Cython | 50-100x | 1x | 1x | 快 |

### 十、最佳实践总结

- 纯 Python 循环密集：考虑 PyPy 或 Numba
- numpy 数值循环：Numba @jit(nopython=True)
- 通用 Python 服务：CPython + 优化算法
- 不要盲目依赖 JIT：先优化算法复杂度
- 注意 JIT 预热：基准测试要跑足够长时间`,
    code: `# JIT 编译与 PyPy/Pyjion 演示：用纯 Python 模拟 JIT 优化效果
# 真实 JIT 需要 PyPy/Numba，这里用纯 Python 对比优化层次

import timeit
import time

print("=== JIT 编译与 PyPy/Pyjion 演示 ===\\n")

print("--- 1. JIT 概念 ---")
print("  JIT (Just-In-Time) 即时编译：运行时把热点代码编译为机器码")
print("  对比三种执行方式:")
print("    解释执行: 慢，CPython")
print("    AOT 编译: 快，C/C++/Rust")
print("    JIT 编译: 中快，PyPy/Java/JS")
print("  JIT 兼具启动快（先解释）和长期快（热点编译）的优点")

print("\\n--- 2. 纯 Python vs 模拟 JIT 优化 ---")

# 纯 Python 循环（解释执行，最慢）
def py_sum(n):
    total = 0
    for i in range(n):
        total += i ** 2
    return total

# 模拟 JIT 优化：用 sum + 生成器（C 层循环）
def c_sum(n):
    return sum(i ** 2 for i in range(n))

# 模拟 JIT 极致优化：用数学公式（O(1)）
def formula_sum(n):
    return n * (n + 1) * (2 * n + 1) // 6

N = 1_000_000
t_py = timeit.timeit(lambda: py_sum(N), number=10)
t_c = timeit.timeit(lambda: c_sum(N), number=10)
t_formula = timeit.timeit(lambda: formula_sum(N), number=10)

print(f"  求 1 到 {N:,} 的平方和，10 次执行:")
print(f"    纯 Python for 循环: {t_py*1000:.1f} ms")
print(f"    sum + 生成器 (C 层): {t_c*1000:.1f} ms")
print(f"    数学公式 O(1):       {t_formula*1000:.1f} ms")
print(f"\\n  加速比:")
print(f"    C 层 / Python = {t_py/t_c:.1f}x")
print(f"    公式 / Python = {t_py/t_formula:.1f}x")
print("  PyPy JIT 通常加速纯 Python 5-10x，Numba 加速数值循环 50x+")

print("\\n--- 3. 模拟 PyPy vs CPython 性能对比 ---")
# 用纯 Python 模拟 PyPy 加速效果
def fib_py(n):
    """纯 Python 递归"""
    if n < 2:
        return n
    return fib_py(n-1) + fib_py(n-2)

def fib_iter(n):
    """迭代版本（更快，模拟 PyPy 优化后）"""
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

t_recursive = timeit.timeit(lambda: fib_py(20), number=100)
t_iterative = timeit.timeit(lambda: fib_iter(20), number=100)
print(f"  fib(20) 100 次执行:")
print(f"    递归 (CPython 典型): {t_recursive*1000:.1f} ms")
print(f"    迭代 (优化后):       {t_iterative*1000:.1f} ms")
print(f"    PyPy 递归通常快 5-10x (JIT 内联+优化)")

print("\\n--- 4. JIT 加速的代码模式 ---")
# 循环密集型 + 类型稳定 = JIT 友好
def jit_friendly():
    """JIT 友好：循环密集，类型稳定"""
    total = 0.0  # 一直是 float
    for i in range(10000):
        total += i * 0.1  # 同类型运算
    return total

def jit_unfriendly():
    """JIT 不友好：类型多态（用 list 收集避免类型错误）"""
    total = []  # 一直是 list，但元素类型多变
    for i in range(100):
        if i % 3 == 0:
            total.append("str")  # 元素是 str
        elif i % 3 == 1:
            total.append([i])    # 元素是 list
        else:
            total.append(i)      # 元素是 int
    return len(total)

t1 = timeit.timeit(jit_friendly, number=1000)
t2 = timeit.timeit(jit_unfriendly, number=1000)
print(f"  JIT 友好代码（类型稳定）: {t1*1000:.1f} ms")
print(f"  JIT 不友好代码（多态）:   {t2*1000:.1f} ms")
print("  PyPy 对类型稳定代码加速显著，多态代码收益小")

print("\\n--- 5. Numba @jit 模拟 ---")
print("  真实 Numba 用法:")
print("    from numba import jit")
print("    @jit(nopython=True)")
print("    def matrix_sum(arr):")
print("        total = 0.0")
print("        for i in range(arr.shape[0]):")
print("            for j in range(arr.shape[1]):")
print("                total += arr[i, j]")
print("        return total")
print("  加速效果: numpy 循环 50-100x")
print("  原理: LLVM 编译为原生机器码，类型特化")

print("\\n--- 6. JIT 适用场景 ---")
print("  ✅ JIT 加速明显:")
print("    - 循环密集型（数值计算）")
print("    - 类型稳定的代码（变量类型不变）")
print("    - 长时间运行（JIT 预热后）")
print("  ❌ JIT 无效甚至更慢:")
print("    - 启动后立即退出的脚本")
print("    - 频繁调用的 C 扩展（已是机器码）")
print("    - 类型多态代码（每次都需重新编译）")

print("\\n--- 7. JIT 工作流程（PyPy 为例） ---")
steps = [
    "1. 解释执行：先用解释器跑，记录热点",
    "2. 热点检测：某循环/函数执行次数超阈值",
    "3. IR 生成：把字节码转为中间表示",
    "4. 优化：常量折叠、内联、类型特化",
    "5. 机器码生成：编译为原生机器码",
    "6. 执行：下次调用直接跑机器码",
]
for step in steps:
    print(f"  {step}")

print("\\n--- 8. 类型特化示例 ---")
print("  def add(a, b): return a + b")
print("  第一次 add(1, 2): 特化为 int 版本，编译为 ADD 指令")
print("  第二次 add('a','b'): 类型不同，重新编译 str 版本")
print("  CPython 每次都要查 __add__，JIT 第一次后直接机器码")

print("\\n--- 9. PyPy vs CPython vs Numba 对比 ---")
comparison = [
    ("CPython",       "1x",    "1x",   "1x", "快"),
    ("PyPy",          "5-10x", "慢",   "慢", "慢"),
    ("Numba (@jit)",  "50x+",  "50x+", "不适用", "中"),
    ("Cython",        "50-100x", "1x", "1x", "快"),
]
print(f"  {'实现':<16} {'纯 Python':<10} {'numpy':<8} {'C 扩展':<10} {'启动'}")
for impl, py, np_, c, start in comparison:
    print(f"  {impl:<16} {py:<10} {np_:<8} {c:<10} {start}")

print("\\n--- 10. Pyjion (CPython JIT) ---")
print("  Pyjion 是微软开发的 CPython JIT 扩展:")
print("    pip install pyjion")
print("    import pyjion")
print("    pyjion.enable()  # 启用 JIT")
print("    # 后续代码被 JIT 编译")
print("    pyjion.disable()")
print("  特点: 不换解释器，加速比 PyPy 小（约 2-3x）")

print("\\n--- 11. 业务场景 ---")
scenarios = [
    ("数值计算", "Numba 加速 numpy 循环"),
    ("科学计算", "PyPy 跑纯 Python 算法"),
    ("Web 后端", "PyPy 跑 Django/Flask"),
    ("数据管道", "JIT 加速数据处理循环"),
]
print(f"  {'场景':<15} {'方法'}")
for s, m in scenarios:
    print(f"  {s:<15} {m}")

print("\\n--- 12. 最佳实践总结 ---")
best = [
    "纯 Python 循环密集：考虑 PyPy 或 Numba",
    "numpy 数值循环：Numba @jit(nopython=True)",
    "通用 Python 服务：CPython + 优化算法",
    "不要盲目依赖 JIT：先优化算法复杂度",
    "注意 JIT 预热：基准测试要跑足够长时间",
    "类型稳定的代码 JIT 收益最大",
]
for i, b in enumerate(best, 1):
    print(f"  {i}. {b}")

print("\\n=== JIT 演示结束 ===")`
  },
  {
    id: "py6-optimization-patterns",
    group: "底层原理与性能",
    icon: "🎯",
    title: "性能优化模式与反模式",
    content: `## 性能优化模式与反模式

### 一、优化模式

#### 1. 用字典替代 if-elif 链

\`\`\`python
# 反模式：长 if-elif 链
def get_discount_bad(level):
    if level == "bronze":
        return 0.05
    elif level == "silver":
        return 0.10
    elif level == "gold":
        return 0.15
    elif level == "platinum":
        return 0.20
    return 0

# 优化：字典查找 O(1)
DISCOUNTS = {
    "bronze": 0.05,
    "silver": 0.10,
    "gold": 0.15,
    "platinum": 0.20,
}
def get_discount_good(level):
    return DISCOUNTS.get(level, 0)
\`\`\`

字典查找 O(1)，if-elif 是 O(n)。分支超过 5 个就该用字典。

#### 2. 用集合替代列表 in

\`\`\`python
# 反模式：list in 是 O(n)
valid_users = ["alice", "bob", "carol", "dave"]  # list
if user in valid_users:  # O(n)
    ...

# 优化：set in 是 O(1)
valid_users = {"alice", "bob", "carol", "dave"}  # set
if user in valid_users:  # O(1)
    ...
\`\`\`

大集合查找用 set，速度提升 100-1000 倍。

#### 3. 用 join 替代 += 字符串

\`\`\`python
# 反模式：每次 += 创建新字符串
s = ""
for i in range(100):
    s += str(i)  # O(n²)

# 优化：join 一次构建
s = "".join(str(i) for i in range(100))  # O(n)
\`\`\`

字符串不可变，\`+=\` 每次都创建新对象，复杂度 O(n²)。

#### 4. 用推导式替代 for 循环

\`\`\`python
# 反模式
result = []
for i in range(100):
    result.append(i ** 2)

# 优化：推导式在 C 层迭代
result = [i ** 2 for i in range(100)]
\`\`\`

推导式比 for 循环快 30-50%。

### 二、反模式

#### 1. 可变默认参数

\`\`\`python
# 反模式：默认值只创建一次
def add_item(item, items=[]):  # ✗
    items.append(item)
    return items

# 正确：用 None 哨兵
def add_item(item, items=None):  # ✓
    if items is None:
        items = []
    items.append(item)
    return items
\`\`\`

#### 2. 循环内 import

\`\`\`python
# 反模式：每次循环都查 sys.modules
def process(data):
    for item in data:
        import json  # ✗ 放外面
        json.dumps(item)

# 正确：循环外 import
import json  # ✓
def process(data):
    for item in data:
        json.dumps(item)
\`\`\`

#### 3. 重复计算

\`\`\`python
# 反模式：循环内重复计算 len
for i in range(len(data)):
    process(data[len(data) - 1 - i])  # ✗ 每次 len()

# 正确：缓存结果
n = len(data)
for i in range(n):
    process(data[n - 1 - i])
\`\`\`

#### 4. 不必要的全局变量

\`\`\`python
# 反模式：循环内频繁访问全局
total = 0
for i in range(10**6):
    total += i  # 全局变量 LOAD_GLOBAL 慢

# 优化：放函数内（局部变量 LOAD_FAST 快）
def sum_loop():
    total = 0
    for i in range(10**6):
        total += i
    return total
\`\`\`

### 三、算法复杂度选择

\`\`\`python
# 查找：list O(n) vs set O(1)
data_list = list(range(10**6))
data_set = set(range(10**6))

# list in 慢
999999 in data_list  # ~50ms

# set in 快
999999 in data_set  # ~0.001ms
\`\`\`

| 操作 | list | set/dict |
|------|------|---------|
| \`x in coll\` | O(n) | O(1) |
| \`coll[i]\` | O(1) | O(1) |
| \`coll.append(x)\` | O(1) | - |
| \`coll.add(x)\` | - | O(1) |

### 四、缓存策略 lru_cache

\`\`\`python
from functools import lru_cache

@lru_cache(maxsize=128)
def expensive_compute(n):
    # 模拟耗时计算
    return sum(i ** 2 for i in range(n))

# 第一次调用计算
expensive_compute(1000)  # 慢
# 第二次命中缓存
expensive_compute(1000)  # 快
\`\`\`

\`lru_cache\` 自动缓存最近 128 次结果，适合**纯函数**（相同输入相同输出）。

### 五、惰性求值（生成器）

\`\`\`python
# 反模式：一次性生成所有
def get_all_users():
    return [fetch_user(i) for i in range(10000)]  # 全部加载到内存

# 优化：惰性生成
def iter_users():
    for i in range(10000):
        yield fetch_user(i)  # 按需生成

for user in iter_users():
    if user.active:
        process(user)
        break  # 找到就停，不浪费
\`\`\`

生成器节省内存，且支持提前退出。

### 六、用 timeit 实测各模式性能

\`\`\`python
import timeit

# 字典 vs if-elif
def if_elif(level):
    if level == "a": return 1
    elif level == "b": return 2
    elif level == "c": return 3
    elif level == "d": return 4
    return 0

D = {"a":1, "b":2, "c":3, "d":4}
def dict_lookup(level):
    return D.get(level, 0)

t1 = timeit.timeit(lambda: if_elif("d"), number=10**6)
t2 = timeit.timeit(lambda: dict_lookup("d"), number=10**6)
print(f"if-elif: {t1:.3f}s")
print(f"字典:    {t2:.3f}s")
\`\`\`

### 七、业务场景

1. **API 服务**：用字典路由 + 缓存热点结果
2. **数据处理**：生成器流式 + 集合去重
3. **爬虫**：\`lru_cache\` 缓存 URL 抓取结果
4. **算法实现**：选择合适数据结构（set/dict/heap）

### 八、过早优化的警告

> "Premature optimization is the root of all evil." — Donald Knuth

不要在没有瓶颈的地方优化：
- 90% 代码不需要优化，可读性优先
- 先写正确，再 profile，最后优化热点
- 优化前先有**基准测试**，否则不知道是否真的更快
- 优化的代码往往更难维护，权衡收益

### 九、原理深入

性能差异的根源：
- **数据结构**：dict/set 基于哈希表 O(1)，list 基于数组 O(n)
- **字节码**：局部变量 LOAD_FAST 比全局 LOAD_GLOBAL 快
- **C 层 vs Python 层**：\`sum()\` / \`"".join()\` 在 C 层，比 Python 循环快
- **对象创建**：不可变对象 += 每次创建新对象，可变对象原地修改

### 十、最佳实践总结

- 5+ 分支用字典替代 if-elif
- 大集合查找用 set，不要用 list
- 字符串拼接用 \`"".join()\`
- 用推导式替代 for 循环
- 缓存纯函数用 \`lru_cache\`，大数据用生成器
- 避免可变默认参数、循环内 import、重复计算
- 记住 Knuth 名言：过早优化是万恶之源，先 profile 再优化`,
    code: `# 性能优化模式与反模式演示：用 timeit 实测各模式
# 仅用标准库

import timeit
import time
from functools import lru_cache

print("=== 性能优化模式与反模式演示 ===\\n")

print("--- 1. 字典 vs if-elif 链 ---")
# 反模式：长 if-elif 链
def if_elif_chain(level):
    if level == "a":
        return 1
    elif level == "b":
        return 2
    elif level == "c":
        return 3
    elif level == "d":
        return 4
    elif level == "e":
        return 5
    return 0

# 优化：字典查找
LOOKUP = {"a": 1, "b": 2, "c": 3, "d": 4, "e": 5}
def dict_lookup(level):
    return LOOKUP.get(level, 0)

t_if = timeit.timeit(lambda: if_elif_chain("e"), number=1_000_000)
t_dict = timeit.timeit(lambda: dict_lookup("e"), number=1_000_000)
print(f"  100 万次查找 'e' (最后一个分支):")
print(f"    if-elif 链: {t_if*1000:.1f} ms")
print(f"    字典查找:   {t_dict*1000:.1f} ms")
print(f"    字典快 {t_if/t_dict:.2f}x")

print("\\n--- 2. set vs list in 查找 ---")
data_list = list(range(10000))
data_set = set(range(10000))

t_list = timeit.timeit(lambda: 9999 in data_list, number=10000)
t_set = timeit.timeit(lambda: 9999 in data_set, number=10000)
print(f"  10000 次 '9999 in' 查找:")
print(f"    list: {t_list*1000:.1f} ms (O(n))")
print(f"    set:  {t_set*1000:.1f} ms (O(1))")
print(f"    set 快 {t_list/t_set:.0f}x")

print("\\n--- 3. join vs += 字符串拼接 ---")
def concat_plus():
    s = ""
    for i in range(100):
        s += str(i)
    return s

def concat_join():
    return "".join(str(i) for i in range(100))

t_plus = timeit.timeit(concat_plus, number=10000)
t_join = timeit.timeit(concat_join, number=10000)
print(f"  10000 次拼接 100 个字符串:")
print(f"    s += str(i):  {t_plus*1000:.1f} ms (O(n²))")
print(f"    ''.join(...): {t_join*1000:.1f} ms (O(n))")
print(f"    join 快 {t_plus/t_join:.1f}x")

print("\\n--- 4. 列表推导 vs for 循环 ---")
def for_loop():
    result = []
    for i in range(1000):
        result.append(i ** 2)
    return result

def list_comp():
    return [i ** 2 for i in range(1000)]

t_for = timeit.timeit(for_loop, number=10000)
t_lc = timeit.timeit(list_comp, number=10000)
print(f"  10000 次生成 1000 个元素的列表:")
print(f"    for 循环 + append: {t_for*1000:.1f} ms")
print(f"    列表推导:          {t_lc*1000:.1f} ms")
print(f"    推导快 {t_for/t_lc:.2f}x (C 层迭代)")

print("\\n--- 5. 反模式：可变默认参数 ---")
def bad_default(items=[]):
    items.append(1)
    return items

def good_default(items=None):
    if items is None:
        items = []
    items.append(1)
    return items

print(f"  bad_default() 第1次: {bad_default()}")
print(f"  bad_default() 第2次: {bad_default()} (累积了！)")
print(f"  good_default() 第1次: {good_default()}")
print(f"  good_default() 第2次: {good_default()} (独立)")

print("\\n--- 6. 反模式：循环内 import ---")
print("  反模式: for item in data: import json; json.dumps(item)")
print("  正确:   import json; for item in data: json.dumps(item)")
print("  每次循环都查 sys.modules，虽不重新加载但有开销")

print("\\n--- 7. 反模式：重复计算 len ---")
data = list(range(1000))
# 反模式
def repeat_len():
    total = 0
    for i in range(len(data)):
        total += data[len(data) - 1 - i]
    return total
# 优化
def cache_len():
    total = 0
    n = len(data)
    for i in range(n):
        total += data[n - 1 - i]
    return total

t_repeat = timeit.timeit(repeat_len, number=10000)
t_cache = timeit.timeit(cache_len, number=10000)
print(f"  10000 次循环 len(data):")
print(f"    循环内重复 len(): {t_repeat*1000:.1f} ms")
print(f"    缓存 len():       {t_cache*1000:.1f} ms")
print(f"    缓存快 {t_repeat/t_cache:.2f}x")

print("\\n--- 8. 局部变量 vs 全局变量 ---")
g_total = 0
def use_global():
    global g_total
    g_total = 0
    for i in range(100000):
        g_total += i
    return g_total

def use_local():
    total = 0
    for i in range(100000):
        total += i
    return total

t_global = timeit.timeit(use_global, number=100)
t_local = timeit.timeit(use_local, number=100)
print(f"  100 次累加 10万:")
print(f"    全局变量: {t_global*1000:.1f} ms (LOAD_GLOBAL 慢)")
print(f"    局部变量: {t_local*1000:.1f} ms (LOAD_FAST 快)")
print(f"    局部快 {t_global/t_local:.2f}x")

print("\\n--- 9. lru_cache 缓存纯函数 ---")
@lru_cache(maxsize=128)
def expensive_compute(n):
    # 模拟耗时计算
    return sum(i ** 2 for i in range(n))

t_first = timeit.timeit(lambda: expensive_compute(10000), number=1)
t_cached = timeit.timeit(lambda: expensive_compute(10000), number=10000)
print(f"  expensive_compute(10000):")
print(f"    首次计算: {t_first*1000:.1f} ms")
print(f"    缓存命中 10000 次: {t_cached*1000:.1f} ms")
print(f"    加速 {t_first*10000/t_cached:.0f}x")

print("\\n--- 10. 生成器惰性求值 ---")
def squares_list(n):
    return [i ** 2 for i in range(n)]

def squares_gen(n):
    for i in range(n):
        yield i ** 2

# 提前退出场景
import sys
N = 1_000_000
lst = squares_list(N)  # 全部计算
gen = squares_gen(N)   # 惰性

# 找到第一个大于 100 的就停
def find_list():
    for x in squares_list(N):
        if x > 100:
            return x

def find_gen():
    for x in squares_gen(N):
        if x > 100:
            return x

t_list = timeit.timeit(find_list, number=100)
t_gen = timeit.timeit(find_gen, number=100)
print(f"  找第一个 > 100 的平方数 100 次:")
print(f"    list 全部生成: {t_list*1000:.1f} ms")
print(f"    gen 惰性求值: {t_gen*1000:.1f} ms")
print(f"    gen 快 {t_list/t_gen:.1f}x (提前退出)")

print("\\n--- 11. 算法复杂度对比 ---")
print(f"  {'操作':<20} {'list':<12} {'set/dict':<12}")
ops = [
    ("x in coll",       "O(n)",      "O(1)"),
    ("coll[i]",         "O(1)",      "O(1)"),
    ("coll.append(x)",  "O(1)",      "-"),
    ("coll.add(x)",     "-",         "O(1)"),
    ("del coll[i]",     "O(n)",      "O(1)"),
]
for op, l, s in ops:
    print(f"  {op:<20} {l:<12} {s:<12}")

print("\\n--- 12. 过早优化的警告 ---")
print('  "Premature optimization is the root of all evil." — Donald Knuth')
print("  ✓ 90% 代码不需要优化，可读性优先")
print("  ✓ 先写正确，再 profile，最后优化热点")
print("  ✓ 优化前先有基准测试，否则不知道是否真的更快")
print("  ✓ 优化的代码往往更难维护，权衡收益")

print("\\n--- 13. 最佳实践总结 ---")
best = [
    "5+ 分支用字典替代 if-elif",
    "大集合查找用 set，不要用 list",
    "字符串拼接用 ''.join()",
    "用推导式替代 for 循环",
    "缓存纯函数用 lru_cache",
    "大数据用生成器，支持提前退出",
    "避免可变默认参数、循环内 import、重复计算",
    "记住 Knuth 名言：过早优化是万恶之源，先 profile 再优化",
]
for i, b in enumerate(best, 1):
    print(f"  {i}. {b}")

print("\\n=== 性能优化模式演示结束 ===")`
  }
];