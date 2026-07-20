// =============================================================
// Python 开发常用知识点（pykit）—— 第二批章节
// -------------------------------------------------------------
// 本文件为 pykit 教程的第二批，主题：数据结构与集合（共 5 章）
//   第 6 章：列表常用操作
//   第 7 章：字典高级技巧
//   第 8 章：元组与命名元组
//   第 9 章：集合运算
//   第 10 章：collections 模块
//
// 章节对象结构：
//   { id, group, icon, title, content, code }
//   - content : Markdown 格式详细讲解
//   - code    : 仅用标准库、可独立运行、每行带中文注释的 Python 脚本
// =============================================================

export const chapters = [
  {
    id: "pykit-06",
    group: "数据结构与集合",
    icon: "📦",
    title: "列表常用操作",
    content: `
# 📦 列表常用操作

## 引言：为什么列表是 Python 最常用的容器

在 Python 开发中，**列表（list）** 几乎无处不在：处理接口返回的 JSON 数组、批量操作数据库记录、缓存一批待处理的任务……可以说，没有哪个 Python 项目能离开列表。

列表之所以如此常用，是因为它同时具备三个特性：

1. **有序**：元素按插入顺序排列，可通过下标访问
2. **可变**：可以原地增、删、改
3. **异构**：一个列表里可以放任意类型的对象

但这并不意味着列表"万能"。用好列表的关键，在于掌握 Python 提供的一整套**惯用写法（idiom）**——它们不仅让代码更短，还往往更快、更不易出错。本章带你系统梳理这些常用操作。

## 一、列表推导式

### 1.1 基本语法

列表推导式（list comprehension）是 Python 中最具代表性的语法糖，它用一行表达式完成"遍历 + 过滤 + 变换"。

\`\`\`python
# 传统写法
squares = []
for x in range(10):
    squares.append(x * x)

# 推导式写法
squares = [x * x for x in range(10)]
\`\`\`

通用形式：

\`\`\`
[表达式 for 变量 in 可迭代对象 if 条件]
\`\`\`

执行顺序是：**先 for 循环 → 再 if 过滤 → 最后表达式求值**。

### 1.2 常见用法对照表

| 需求 | 传统写法 | 推导式 |
|------|---------|--------|
| 平方 | \`for x in r: a.append(x*x)\` | \`[x*x for x in r]\` |
| 过滤偶数 | \`for x in r: if x%2==0: a.append(x)\` | \`[x for x in r if x%2==0]\` |
| 字符串大写 | \`for s in lst: a.append(s.upper())\` | \`[s.upper() for s in lst]\` |
| 提取字段 | \`for u in users: a.append(u['name'])\` | \`[u['name'] for u in users]\` |
| 带条件表达式 | if/else 拼接 | \`[x if x>0 else 0 for x in r]\` |

### 1.3 嵌套推导式

推导式可以嵌套，用来展开二维结构：

\`\`\`python
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
# 展平
flat = [num for row in matrix for num in row]  # [1,2,...,9]
\`\`\`

> ⚠️ 嵌套超过两层时，可读性会急剧下降，此时建议改用普通的 for 循环。

### 1.4 推导式的性能优势

推导式在 CPython 中会被专门优化，比"循环 + append"快 **20%~40%**，因为它避免了每次循环都查找 \`append\` 方法。

## 二、切片技巧

切片（slicing）通过 \`[start:stop:step]\` 语法取出列表的一段，**start 含、stop 不含**。

### 2.1 切片语法速查

| 写法 | 含义 | 示例（a=[0,1,2,3,4,5]） |
|------|------|------------------------|
| \`a[:]\` | 浅拷贝整个列表 | \`[0,1,2,3,4,5]\` |
| \`a[2:5]\` | 下标 2、3、4 | \`[2,3,4]\` |
| \`a[:3]\` | 前 3 个 | \`[0,1,2]\` |
| \`a[3:]\` | 第 4 个到最后 | \`[3,4,5]\` |
| \`a[-2:]\` | 最后 2 个 | \`[4,5]\` |
| \`a[::2]\` | 每隔一个取一个 | \`[0,2,4]\` |
| \`a[::-1]\` | 反转列表 | \`[5,4,3,2,1,0]\` |
| \`a[1:-1]\` | 去掉首尾 | \`[1,2,3,4]\` |

### 2.2 切片的妙用

- **反转序列**：\`a[::-1]\` 是最经典的反转写法，字符串也适用。
- **去头去尾**：\`a[1:-1]\` 常用于剥离首尾标记。
- **分段取数**：\`a[::3]\` 每 3 个取一个，做采样。
- **删除一段**：\`del a[1:3]\` 原地删除下标 1、2 的元素。
- **替换一段**：\`a[1:3] = [9, 9, 9]\` 长度可以不一致。

### 2.3 切片是"浅拷贝"

切片产生的是新列表，但里面的元素仍是**同一批对象的引用**。对嵌套列表做切片时要特别小心：

\`\`\`python
a = [[1, 2], [3, 4]]
b = a[:]
b[0][0] = 99   # a[0][0] 也变成 99，因为是浅拷贝
\`\`\`

需要深拷贝时使用 \`copy.deepcopy(a)\`。

## 三、append / extend / insert 的区别

这三个方法都向列表添加元素，但行为不同。

| 方法 | 作用 | 参数 | 时间复杂度 |
|------|------|------|-----------|
| \`append(x)\` | 末尾追加**一个**元素 | 单个对象 | O(1) 均摊 |
| \`extend(iter)\` | 末尾追加**多个**元素 | 可迭代对象 | O(k) |
| \`insert(i, x)\` | 在下标 i 处插入 | 下标 + 对象 | O(n) |

关键区别示例：

\`\`\`python
a = [1, 2, 3]
a.append([4, 5])     # a = [1, 2, 3, [4, 5]]   把列表当成一个元素
a = [1, 2, 3]
a.extend([4, 5])     # a = [1, 2, 3, 4, 5]     把元素逐个追加
a = [1, 2, 3]
a += [4, 5]          # 等价于 extend
\`\`\`

> 💡 经验法则：要加一个元素用 \`append\`；要合并另一个序列用 \`extend\`；\`insert\` 尽量少用，因为它要把后面的元素全部后移，频繁 insert 会拖慢程序。如果需要在头部频繁插入，请用 \`collections.deque\`。

## 四、sort 与 sorted 的区别

| 特性 | \`list.sort()\` | \`sorted(iterable)\` |
|------|----------------|---------------------|
| 是否原地修改 | 是，返回 None | 否，返回新列表 |
| 适用对象 | 只有 list | 任何可迭代对象 |
| 是否稳定 | 稳定 | 稳定 |

两者都支持 \`key\` 和 \`reverse\` 参数：

\`\`\`python
users = [{"name": "Tom", "age": 20}, {"name": "Ann", "age": 20}]

# 按年龄排序，年龄相同按姓名
users.sort(key=lambda u: (u["age"], u["name"]))

# 降序
sorted(users, key=lambda u: u["age"], reverse=True)
\`\`\`

### 4.1 key 函数的设计技巧

- **多字段排序**：返回元组 \`key=lambda x: (x.a, x.b)\`，按元组字典序比较。
- **按字符串长度**：\`key=len\`。
- **忽略大小写**：\`key=str.lower\`。
- **混合正负数排序**：\`key=abs\`。

### 4.2 稳定排序的妙用

Python 的排序是**稳定**的——相等元素的相对顺序不变。利用这一点，可以"分多次排序"实现多关键字：先排次要关键字，再排主要关键字。

\`\`\`python
data.sort(key=lambda x: x["age"])     # 先按次要关键字 age
data.sort(key=lambda x: x["salary"])  # 再按主要关键字 salary
# 最终：salary 为主，age 相同者保持 age 升序
\`\`\`

## 五、reverse 反转

反转列表有三种常见方式：

\`\`\`python
a.reverse()      # 原地反转，返回 None
b = a[::-1]      # 切片反转，产生新列表
c = list(reversed(a))  # 返回迭代器，需 list() 转换
\`\`\`

- 需要**就地**节省内存：\`a.reverse()\`
- 需要**保留原列表**：\`a[::-1]\` 或 \`list(reversed(a))\`

## 六、enumerate：遍历时同时拿到索引和值

新手常这样写：

\`\`\`python
i = 0
for name in names:
    print(i, name)
    i += 1
\`\`\`

Pythonic 的写法是：

\`\`\`python
for i, name in enumerate(names):
    print(i, name)
\`\`\`

\`enumerate\` 还支持指定起始序号：\`enumerate(names, start=1)\`，这在输出"第几条"时特别方便。

## 七、zip：并行遍历多个列表

\`zip\` 把多个可迭代对象"拉链式"配对：

\`\`\`python
names = ["Tom", "Ann", "Bob"]
ages  = [20, 22, 21]
for name, age in zip(names, ages):
    print(name, age)
\`\`\`

### 7.1 zip 的常见用途

- **并行遍历**多个等长列表
- **构造字典**：\`dict(zip(keys, values))\`
- **矩阵转置**：\`list(zip(*matrix))\`
- **解压**：\`zip(*pairs)\` 把配对列表拆成两个序列

### 7.2 长度不一致时

- \`zip(a, b)\`：以**最短**为准，多余元素被丢弃。
- \`itertools.zip_longest(a, b, fillvalue=None)\`：以**最长**为准，缺失用 fillvalue 填充。

## 八、列表去重并保持顺序

最朴素的方法是 \`list(set(data))\`，但它**会打乱顺序**。要保持原顺序：

\`\`\`python
def dedup(seq):
    seen = set()
    result = []
    for x in seq:
        if x not in seen:
            seen.add(x)
            result.append(x)
    return result
\`\`\`

Python 3.7+ 还可以更简洁（利用 dict 保持插入序）：

\`\`\`python
deduped = list(dict.fromkeys(seq))
\`\`\`

## 九、性能对比与选择建议

| 操作 | 时间复杂度 | 备注 |
|------|-----------|------|
| 索引 \`a[i]\` | O(1) | 列表强项 |
| \`append\` | O(1) 均摊 | 末尾追加很快 |
| \`insert(0, x)\` | O(n) | 头部插入慢 |
| \`in a\` 查找 | O(n) | 大数据量改用 set |
| \`sort\` | O(n log n) | 稳定排序 |
| 切片 \`a[i:j]\` | O(k) | k 为切片长度 |

> 💡 **关键经验**：需要频繁"判断某元素是否存在"且数据量大时，列表的 \`in\` 是 O(n) 很慢，应该改用 \`set\`（O(1)）。这是最常见的性能坑之一。

## 十、本章小结

| 想做的事 | 推荐写法 |
|---------|---------|
| 生成新列表 | 列表推导式 |
| 取一段 | 切片 |
| 末尾加一个 / 多个 | append / extend |
| 排序 | sorted（新）/ sort（原地） |
| 反转 | a[::-1] 或 a.reverse() |
| 带索引遍历 | enumerate |
| 并行遍历 | zip |
| 顺序去重 | dict.fromkeys |

掌握这些惯用法，你写出的 Python 代码会既简洁又高效。下面的演示代码用一个"用户数据处理"的真实场景把它们串起来。
`,
    code: `
# =============================================================
# 列表常用操作演示 —— 用户数据处理与数据筛选
# 本脚本仅使用 Python 标准库，演示：推导式、切片、排序、
# enumerate、zip、去重、append/extend/insert、reverse
# =============================================================

# 模拟一批用户数据：每个用户是字典，含姓名、年龄、城市、薪资
users = [                                                                 # 定义用户列表
    {"name": "张三", "age": 28, "city": "北京", "salary": 18000},          # 用户记录
    {"name": "李四", "age": 35, "city": "上海", "salary": 25000},          # 用户记录
    {"name": "王五", "age": 22, "city": "北京", "salary": 12000},          # 用户记录
    {"name": "赵六", "age": 40, "city": "深圳", "salary": 32000},          # 用户记录
    {"name": "钱七", "age": 28, "city": "北京", "salary": 18000},          # 与张三重复
    {"name": "孙八", "age": 31, "city": "上海", "salary": 21000},          # 用户记录
    {"name": "周九", "age": 26, "city": "深圳", "salary": 16000},          # 用户记录
    {"name": "吴十", "age": 45, "city": "北京", "salary": 38000},          # 用户记录
]

print("=" * 60)                                                            # 打印分隔线
print("  列表常用操作演示 —— 用户数据处理")                                  # 打印标题
print("=" * 60)                                                            # 打印分隔线

# -------------------------------------------------------------
# 第一部分：列表推导式 —— 筛选北京用户并提取姓名
# -------------------------------------------------------------
beijing_names = [u["name"] for u in users if u["city"] == "北京"]          # 推导式：过滤城市并取姓名
print("\\n【1】列表推导式：北京用户姓名 =", beijing_names)                    # 输出结果

# 推导式带条件表达式：高薪标记
tags = [u["name"] + "(高薪)" if u["salary"] > 30000 else u["name"] for u in users]  # 条件表达式推导式
print("    薪资标记 =", tags)                                              # 输出标记结果

# -------------------------------------------------------------
# 第二部分：切片 —— 取薪资前 3 名
# -------------------------------------------------------------
top3_salary = sorted(users, key=lambda u: u["salary"], reverse=True)[:3]  # 先排序再切片取前 3
print("\\n【2】切片：薪资前 3 名")                                           # 输出标题
for u in top3_salary:                                                     # 遍历前 3 名
    print(f"    {u['name']}：{u['salary']}")                              # 打印姓名和薪资

# -------------------------------------------------------------
# 第三部分：append / extend / insert 区别
# -------------------------------------------------------------
log = []                                                                  # 新建空列表模拟日志
log.append("启动服务")                                                     # append 追加一个字符串
log.extend(["加载数据", "连接数据库"])                                      # extend 追加多个字符串
log.insert(0, "[开始]")                                                    # insert 在头部插入
print("\\n【3】append/extend/insert：日志 =", log)                          # 输出日志列表

# -------------------------------------------------------------
# 第四部分：sort 与 sorted —— 多字段排序
# -------------------------------------------------------------
by_city_then_age = sorted(users, key=lambda u: (u["city"], u["age"]))     # 先城市后年龄升序
print("\\n【4】sorted 多字段排序（城市→年龄）")                              # 输出标题
for u in by_city_then_age:                                                # 遍历排序结果
    print(f"    {u['city']}-{u['name']}：{u['age']}岁")                    # 打印城市姓名年龄

# -------------------------------------------------------------
# 第五部分：reverse 反转
# -------------------------------------------------------------
ages_desc = sorted([u["age"] for u in users])                             # 升序得到年龄列表
ages_desc.reverse()                                                       # 原地反转变为降序
print("\\n【5】reverse 反转后年龄 =", ages_desc)                            # 输出反转结果

# -------------------------------------------------------------
# 第六部分：enumerate —— 带序号输出薪资榜
# -------------------------------------------------------------
print("\\n【6】enumerate：薪资排行榜")                                      # 输出标题
for rank, u in enumerate(                                                 # enumerate 同时取序号和元素
    sorted(users, key=lambda u: u["salary"], reverse=True),               # 按薪资降序
    start=1,                                                              # 序号从 1 开始
):
    print(f"    第{rank}名：{u['name']} - {u['salary']}元")                # 打印排名信息

# -------------------------------------------------------------
# 第七部分：zip —— 并行遍历姓名与城市，构造显示串
# -------------------------------------------------------------
names = [u["name"] for u in users]                                        # 提取姓名列表
cities = [u["city"] for u in users]                                       # 提取城市列表
cards = [f"{n}@{c}" for n, c in zip(names, cities)]                       # zip 配对后生成展示串
print("\\n【7】zip 并行遍历：名片 =", cards)                                # 输出名片列表

# zip 还能快速构造字典
name_to_city = dict(zip(names, cities))                                   # zip 构造姓名→城市字典
print("    构造字典 =", name_to_city)                                      # 输出字典

# -------------------------------------------------------------
# 第八部分：去重并保持顺序 —— 用 dict.fromkeys
# -------------------------------------------------------------
raw_cities = [u["city"] for u in users]                                   # 取出所有城市（含重复）
unique_cities = list(dict.fromkeys(raw_cities))                           # 利用 dict 保序去重
print("\\n【8】保序去重：城市出现顺序 =", unique_cities)                     # 输出去重后的城市

# 另一种写法：seen 集合手动去重
seen = set()                                                              # 建空集合记录已出现城市
ordered = []                                                              # 结果列表
for c in raw_cities:                                                      # 遍历原始城市列表
    if c not in seen:                                                     # 若未出现过
        seen.add(c)                                                       # 加入 seen 集合
        ordered.append(c)                                                 # 加入结果列表
print("    手动去重 =", ordered)                                           # 输出手动去重结果

# -------------------------------------------------------------
# 第九部分：综合实战 —— 找出北京高薪用户并生成报表
# -------------------------------------------------------------
print("\\n【9】综合实战：北京高薪（>=18000）用户报表")                       # 输出标题
report = [                                                                # 构造报表列表
    {"序号": i, "姓名": u["name"], "薪资": u["salary"], "评级": "A" if u["salary"] > 30000 else "B"}
    for i, u in enumerate(users, 1)                                       # 推导式 + enumerate
    if u["city"] == "北京" and u["salary"] >= 18000                       # 过滤条件
]
for row in report:                                                        # 遍历报表行
    print(f"    #{row['序号']} {row['姓名']} 薪资{row['薪资']} 评级{row['评级']}")  # 打印每行

print("\\n  💡 小结：推导式、切片、sorted、enumerate、zip、去重是日常最高频的列表操作。")
print("=" * 60)                                                            # 打印结束分隔线
`,
  },

  {
    id: "pykit-07",
    group: "数据结构与集合",
    icon: "🗂️",
    title: "字典高级技巧",
    content: `
# 🗂️ 字典高级技巧

## 引言：字典是 Python 的"瑞士军刀"

字典（dict）在 Python 中的地位比在其他语言里更高：JSON 解析的结果是字典，函数关键字参数 \`**kwargs\` 是字典，模块的命名空间也是字典。可以说，**写 Python 就是和字典打交道**。

Python 3.7 起，字典**保证插入顺序**，这让它在很多场景下能替代专门的有序结构。本章聚焦那些"会用就优雅、不会用就啰嗦"的字典高级技巧。

## 一、字典推导式

和列表推导式对应，字典推导式用 \`{k: v for ...}\` 一行构造字典。

\`\`\`python
# 传统写法
d = {}
for k, v in pairs:
    d[k] = v

# 推导式写法
d = {k: v for k, v in pairs}
\`\`\`

常见用法：

\`\`\`python
# 反转键值
inv = {v: k for k, v in d.items()}

# 过滤
filtered = {k: v for k, v in d.items() if v > 0}

# 初始化平方表
squares = {i: i*i for i in range(10)}
\`\`\`

## 二、get / defaultdict / Counter：取值时的三种武器

### 2.1 dict.get 的用法

直接 \`d[key]\` 在 key 不存在时会抛 \`KeyError\`。而 \`d.get(key, default)\` 在缺失时返回 default（默认 None），更安全。

\`\`\`python
count = {}
for word in words:
    count[word] = count.get(word, 0) + 1   # 缺失返回 0，再加 1
\`\`\`

### 2.2 defaultdict：自动初始化缺失键

\`collections.defaultdict\` 在访问缺失键时自动调用工厂函数生成默认值：

\`\`\`python
from collections import defaultdict
count = defaultdict(int)            # int() 返回 0
for word in words:
    count[word] += 1                # 缺失键自动初始化为 0
\`\`\`

常见工厂函数对照：

| 工厂 | 缺失键默认值 | 适用场景 |
|------|-------------|---------|
| \`int\` | 0 | 计数 |
| \`list\` | [] | 分组（一对多） |
| \`set\` | set() | 分组去重 |
| \`dict\` | {} | 嵌套字典 |

**分组示例**——把用户按城市分组：

\`\`\`python
from collections import defaultdict
by_city = defaultdict(list)
for u in users:
    by_city[u["city"]].append(u)
\`\`\`

### 2.3 Counter：专用计数器

\`collections.Counter\` 是为计数量身定制的字典子类：

\`\`\`python
from collections import Counter
c = Counter("abracadabra")
c.most_common(3)   # 出现最多的 3 个
c.update("xxx")    # 追加计数
c["a"]             # 直接取某项计数
\`\`\`

Counter 还支持加减运算（合并/抵消计数），非常适合做词频统计、投票统计。

## 三、setdefault：取值或设置默认

\`d.setdefault(key, default)\` 的语义是：**如果 key 存在，返回其值；如果不存在，先设置 d[key]=default 再返回 default**。

它最典型的用途是"懒初始化嵌套结构"：

\`\`\`python
tree = {}
# 给 tree[a][b][c] 追加值，多层都要初始化
tree.setdefault(a, {}).setdefault(b, {}).setdefault(c, []).append(v)
\`\`\`

对比三种取值方式：

| 方式 | 缺失键行为 | 是否写入默认值 |
|------|-----------|---------------|
| \`d[key]\` | 抛 KeyError | 否 |
| \`d.get(key, default)\` | 返回 default | **否** |
| \`d.setdefault(key, default)\` | 返回 default | **是** |

> ⚠️ 注意 \`get\` 和 \`setdefault\` 的关键区别：\`get\` **不会**写入字典，\`setdefault\` **会**写入。这影响后续判断和内存占用。

## 四、字典合并：| 运算符（Python 3.9+）

Python 3.9 引入了 \`|\` 和 \`|=\` 用于字典合并：

\`\`\`python
defaults = {"host": "localhost", "port": 3306}
override = {"port": 5432, "user": "admin"}
merged = defaults | override   # 右侧覆盖左侧
# {'host': 'localhost', 'port': 5432, 'user': 'admin'}
\`\`\`

在 3.9 之前，合并字典常用 \`{**a, **b}\`，语义相同（右侧覆盖左侧）。

\`|=\` 用于原地更新：

\`\`\`python
config = {"a": 1}
config |= {"b": 2, "a": 9}   # config 变为 {'a': 9, 'b': 2}
\`\`\`

## 五、keys / values / items 遍历

\`\`\`python
for k in d.keys():       # 只遍历键
for v in d.values():     # 只遍历值
for k, v in d.items():   # 同时遍历键值（最常用）
\`\`\`

要点：

- 在 Python 3 中 \`keys()/values()/items()\` 返回的是**视图对象（view）**，不是列表。视图会随字典实时变化，且支持集合运算。
- 不要在遍历 \`keys()\` 的同时修改字典大小（增删键），会抛 RuntimeError。需要边遍历边改时，先 \`list(d.keys())\` 固化。
- 视图的集合运算很方便：\`d1.keys() & d2.keys()\` 求公共键。

## 六、嵌套字典处理

### 6.1 安全取深层值

直接 \`d[a][b][c]\` 在任一层缺失时就报错。安全的写法：

\`\`\`python
d.get(a, {}).get(b, {}).get(c)   # 链式 get
\`\`\`

或更通用的工具函数：

\`\`\`python
def deep_get(d, *keys, default=None):
    for k in keys:
        if not isinstance(d, dict):
            return default
        d = d.get(k, default)
    return d
\`\`\`

### 6.2 嵌套字典的合并

深度合并两个嵌套字典（而非浅替换）：

\`\`\`python
def deep_merge(a, b):
    for k, v in b.items():
        if k in a and isinstance(a[k], dict) and isinstance(v, dict):
            deep_merge(a[k], v)   # 递归合并
        else:
            a[k] = v              # 否则直接覆盖
    return a
\`\`\`

## 七、OrderedDict 与"字典有序"的真相

Python 3.7+ 普通 dict **保证插入顺序**，所以 99% 的场景不需要 OrderedDict。但 OrderedDict 仍有独特价值：

| 特性 | dict | OrderedDict |
|------|------|-------------|
| 保序 | 3.7+ 保证 | 一直保证 |
| \`popitem(last=False)\` | 不支持 | 支持，可 FIFO 弹出 |
| \`move_to_end(key)\` | 不支持 | 支持，调整顺序 |
| 相等判断 | 只看内容 | 还看顺序 |
| 内存占用 | 更省 | 略大 |

因此当你需要"调整顺序"或"实现 LRU"时，OrderedDict 仍是首选。

## 八、性能与陷阱

| 操作 | 复杂度 | 说明 |
|------|--------|------|
| \`d[k] = v\` | O(1) | 增改 |
| \`d[k]\` | O(1) | 取值 |
| \`k in d\` | O(1) | 判断存在 |
| \`del d[k]\` | O(1) | 删除 |
| 遍历 | O(n) | — |

常见陷阱：

1. **不要用可变对象做键**：键必须是可哈希的，list/dict/set 不能做键。
2. **遍历时改大小**：会报错，先 list 化。
3. **浅拷贝陷阱**：\`d.copy()\` 是浅拷贝，嵌套对象仍是共享引用。

## 九、本章小结

| 需求 | 推荐 |
|------|------|
| 安全取值 | \`d.get(key, default)\` |
| 计数 | \`Counter\` 或 \`defaultdict(int)\` |
| 分组 | \`defaultdict(list)\` |
| 懒初始化嵌套 | \`setdefault\` |
| 合并字典 \| \`a \| b\`（3.9+）或 \`{**a, **b}\` |
| 调整顺序 / LRU | \`OrderedDict\` |
| 反转键值 | 字典推导式 |

下面的演示用"词频统计"和"配置合并"两个真实场景把这些技巧串起来。
`,
    code: `
# =============================================================
# 字典高级技巧演示 —— 词频统计与配置合并
# 本脚本仅使用 Python 标准库，演示：推导式、get/defaultdict/
# Counter、setdefault、字典合并、嵌套处理、OrderedDict
# =============================================================

from collections import defaultdict, Counter, OrderedDict   # 导入常用容器

print("=" * 60)                                              # 打印分隔线
print("  字典高级技巧演示 —— 词频统计与配置合并")             # 打印标题
print("=" * 60)                                              # 打印分隔线

# -------------------------------------------------------------
# 第一部分：词频统计的三种写法对比
# -------------------------------------------------------------
text = "the quick brown fox the lazy dog the quick fox"     # 待统计的英文句子
words = text.split()                                        # 按空白切分成单词列表

# 写法 A：dict.get
count_a = {}                                                # 新建空字典
for w in words:                                             # 遍历每个单词
    count_a[w] = count_a.get(w, 0) + 1                      # 缺失返回 0 再加 1
print("\\n【1A】dict.get 词频 =", dict(count_a))             # 输出统计结果

# 写法 B：defaultdict(int)
count_b = defaultdict(int)                                  # 缺失键自动为 0
for w in words:                                             # 遍历每个单词
    count_b[w] += 1                                         # 直接自增
print("【1B】defaultdict 词频 =", dict(count_b))            # 输出统计结果

# 写法 C：Counter（最推荐）
count_c = Counter(words)                                    # 一行完成计数
print("【1C】Counter 词频 =", dict(count_c))                # 输出统计结果
print("    出现最多的 2 个 =", count_c.most_common(2))       # 取最高频 2 项

# -------------------------------------------------------------
# 第二部分：defaultdict 分组 —— 按首字母分组单词
# -------------------------------------------------------------
groups = defaultdict(list)                                  # 值默认为空列表
for w in words:                                             # 遍历每个单词
    groups[w[0]].append(w)                                  # 按首字母分组追加
print("\\n【2】defaultdict 分组（首字母）:")                  # 输出标题
for letter, ws in sorted(groups.items()):                   # 按字母排序遍历
    print(f"    {letter}: {ws}")                            # 打印字母和该组单词

# -------------------------------------------------------------
# 第三部分：setdefault —— 构建嵌套索引
# -------------------------------------------------------------
index = {}                                                  # 新建空字典做倒排索引
docs = [("doc1", "python"), ("doc1", "list"), ("doc2", "python"), ("doc3", "dict")]  # 文档-词对
for doc, word in docs:                                      # 遍历文档词对
    index.setdefault(word, []).append(doc)                  # 缺失则初始化为空列表再追加
print("\\n【3】setdefault 倒排索引 =", index)               # 输出倒排索引

# -------------------------------------------------------------
# 第四部分：字典推导式 —— 反转键值、过滤
# -------------------------------------------------------------
word_to_count = dict(count_c)                               # 取 Counter 为普通字典
count_to_word = {v: k for k, v in word_to_count.items()}    # 推导式反转键值
print("\\n【4】字典推导式反转 =", count_to_word)             # 输出反转结果
hot = {w: c for w, c in word_to_count.items() if c >= 2}    # 推导式过滤高频词
print("    高频词(>=2) =", hot)                              # 输出高频词字典

# -------------------------------------------------------------
# 第五部分：字典合并 —— | 运算符与 {**a, **b}
# -------------------------------------------------------------
default_cfg = {"host": "localhost", "port": 3306, "timeout": 30}  # 默认配置
user_cfg = {"port": 5432, "user": "admin"}                  # 用户覆盖配置
merged1 = {**default_cfg, **user_cfg}                       # 解包合并（右侧覆盖左侧）
print("\\n【5】{**a,**b} 合并 =", merged1)                   # 输出合并结果
try:                                                        # 尝试使用 | 运算符
    merged2 = default_cfg | user_cfg                        # 3.9+ 字典合并运算符
    print("    a | b 合并   =", merged2)                    # 输出合并结果
except TypeError:                                           # 兼容旧版本
    print("    当前 Python 不支持 | 合并运算符")             # 提示版本过低

# 原地合并
base = {"a": 1, "b": 2}                                     # 基础字典
base |= {"b": 9, "c": 3}                                    # 原地合并更新
print("    a |= b 后    =", base)                           # 输出原地合并结果

# -------------------------------------------------------------
# 第六部分：嵌套字典的安全访问与深度合并
# ------------------------------------------------============
def deep_get(d, *keys, default=None):                       # 定义深层取值函数
    cur = d                                                 # 当前指针指向字典
    for k in keys:                                          # 逐层取键
        if not isinstance(cur, dict):                       # 中途不是字典
            return default                                  # 返回默认值
        cur = cur.get(k, default)                           # 取下一层
    return cur                                              # 返回最终值

def deep_merge(a, b):                                       # 定义深度合并函数
    for k, v in b.items():                                  # 遍历右侧字典
        if k in a and isinstance(a[k], dict) and isinstance(v, dict):  # 两边都是字典
            deep_merge(a[k], v)                             # 递归合并
        else:                                               # 否则
            a[k] = v                                        # 直接覆盖
    return a                                                # 返回合并结果

cfg1 = {"db": {"host": "127.0.0.1", "port": 3306}, "log": "info"}  # 配置 1
cfg2 = {"db": {"port": 5432, "user": "admin"}, "cache": True}      # 配置 2
deep_merge(cfg1, cfg2)                                      # 深度合并到 cfg1
print("\\n【6】深度合并配置 =", cfg1)                        # 输出合并后配置
print("    安全取 db.user =", deep_get(cfg1, "db", "user")) # 安全取深层值
print("    安全取 db.pass =", deep_get(cfg1, "db", "pass", default="(无)"))  # 缺失返回默认

# -------------------------------------------------------------
# 第七部分：OrderedDict —— 调整顺序实现简易 LRU
# -------------------------------------------------------------
print("\\n【7】OrderedDict 模拟 LRU 缓存")                   # 输出标题
lru = OrderedDict()                                         # 新建有序字典
lru["a"] = 1                                                # 写入 a
lru["b"] = 2                                                # 写入 b
lru["c"] = 3                                                # 写入 c
print("    初始 =", list(lru.items()))                      # 输出初始顺序
lru.move_to_end("a")                                        # 访问 a，移到末尾表示最近使用
print("    访问a后 =", list(lru.items()))                   # 输出调整后顺序
lru.popitem(last=False)                                     # 弹出最久未使用（头部）
print("    淘汰后 =", list(lru.items()))                    # 输出淘汰后顺序

print("\\n  💡 小结：Counter 做计数、defaultdict 做分组、setdefault 做懒初始化、| 做合并。")
print("=" * 60)                                             # 打印结束分隔线
`,
  },

  {
    id: "pykit-08",
    group: "数据结构与集合",
    icon: "🔗",
    title: "元组与命名元组",
    content: `
# 🔗 元组与命名元组

## 引言：被低估的元组

很多初学者把元组（tuple）理解为"不可变的列表"，这只说对了一半。元组真正的价值在于它是**固定结构的记录**：一组含义不同但相关的字段被打包在一起，比如一个二维坐标 \`(x, y)\`、一条 RGB 颜色 \`(r, g, b)\`。

理解这一点，你就能用好元组解包、命名元组这些 Python 里极其优雅的特性。

## 一、元组的不可变性

元组一旦创建，**长度和元素地址都不可变**：

\`\`\`python
t = (1, 2, 3)
t[0] = 9     # TypeError: 元组不可赋值
t.append(4)  # AttributeError: 元组没有 append
\`\`\`

但要注意"不可变"指的是**元组本身**，如果元素是可变对象，那个对象内部仍可改：

\`\`\`python
t = ([1, 2], [3, 4])
t[0].append(99)   # 合法！t 变成 ([1,2,99], [3,4])
\`\`\`

> ⚠️ 因此含有可变元素的元组是**不可哈希**的，不能作为字典键。要作为键，元素必须全部可哈希。

## 二、元组解包

### 2.1 基本解包

\`\`\`python
point = (3, 4)
x, y = point          # x=3, y=4
\`\`\`

### 2.2 \* 展开剩余

\`\`\`python
first, *rest = [1, 2, 3, 4]   # first=1, rest=[2,3,4]
*init, last = [1, 2, 3, 4]    # init=[1,2,3], last=4
a, *mid, b = [1, 2, 3, 4, 5]  # a=1, mid=[2,3,4], b=5
\`\`\`

### 2.3 交换变量

Python 的解包让变量交换无需临时变量：

\`\`\`python
a, b = b, a
\`\`\`

### 2.4 嵌套解包

\`\`\`python
pairs = [(1, "a"), (2, "b")]
for num, ch in pairs:
    print(num, ch)
\`\`\`

## 三、命名元组 namedtuple

普通元组靠位置访问 \`t[0]\`、\`t[1]\`，可读性差。\`collections.namedtuple\` 给每个字段一个名字：

\`\`\`python
from collections import namedtuple
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
p.x        # 3，按名字访问
p.y        # 4
p[0]       # 3，仍可按下标访问
\`\`\`

### 3.1 namedtuple 的优势

| 对比项 | 普通元组 | namedtuple | 类 |
|--------|---------|------------|-----|
| 按名访问 | ❌ | ✅ | ✅ |
| 不可变 | ✅ | ✅ | ❌（默认） |
| 可哈希做键 | ✅ | ✅ | 取决于实现 |
| 内存占用 | 最低 | 很低 | 较高 |
| 定义成本 | 无 | 一行 | 多行 |

命名元组本质是"自带字段名的、不可变的、轻量级类"。当你需要"一个只有数据、没有行为"的小对象时，namedtuple 比 class 更合适。

### 3.2 _replace 与 _asdict

\`\`\`python
p = Point(3, 4)
p2 = p._replace(x=10)   # 返回新实例，原 p 不变
p._asdict()             # 转成 OrderedDict {'x':3,'y':4}
\`\`\`

\`_replace\` 体现了不可变对象的"修改"模式：**返回一个新副本而非原地改**。

### 3.3 typing.NamedTuple（更现代的写法）

Python 3.6+ 推荐用 \`typing.NamedTuple\`，写法像类、支持类型注解：

\`\`\`python
from typing import NamedTuple
class Point(NamedTuple):
    x: float
    y: float
    label: str = "origin"
\`\`\`

它和 \`collections.namedtuple\` 等价，但可读性更好、IDE 提示更友好。

## 四、元组作为字典键

元组不可变且可哈希，常被用作"复合键"：

\`\`\`python
# 用 (年份, 月份) 作键
sales = {}
sales[(2024, 1)] = 1000
sales[(2024, 2)] = 1200
\`\`\`

典型场景：网格坐标、矩阵稀疏存储、多维分组统计。

## 五、元组 vs 列表：怎么选

| 维度 | 元组 tuple | 列表 list |
|------|-----------|----------|
| 可变性 | 不可变 | 可变 |
| 语义 | 固定记录（异构字段） | 同类元素序列 |
| 内存 | 更省 | 略多 |
| 可哈希 | ✅（元素可哈希时） | ❌ |
| 做字典键 | ✅ | ❌ |
| 性能 | 创建略快 | — |

**选择原则**：
- 字段含义不同、数量固定、整体代表"一条记录" → **元组**
- 同类型、数量可变、需要增删 → **列表**

例如：\`(name, age, email)\` 用元组；\`[score1, score2, ...]\` 用列表。

## 六、元组的常见惯用法

### 6.1 函数返回多值

\`\`\`python
def min_max(nums):
    return min(nums), max(nums)   # 实际返回元组

lo, hi = min_max([3, 1, 4, 1, 5])
\`\`\`

### 6.2 多关键字排序

\`\`\`python
# key 返回元组，按元组字典序比较
students.sort(key=lambda s: (s.grade, -s.age))
\`\`\`

### 6.3 解包遍历 dict.items

\`\`\`python
for k, v in d.items():
    ...
\`\`\`

## 七、本章小结

| 需求 | 工具 |
|------|------|
| 固定结构记录 | 元组 |
| 给字段命名 | namedtuple / NamedTuple |
| 一次返回多值 | return a, b |
| 复合字典键 | 元组 |
| 多字段排序 | key 返回元组 |
| 修改不可变对象 | \_replace 返回新实例 |

下面的演示用"坐标运算"和"函数多值返回"两个场景展示元组的实际用法。
`,
    code: `
# =============================================================
# 元组与命名元组演示 —— 坐标处理与函数多值返回
# 本脚本仅使用 Python 标准库，演示：解包、* 展开、
# namedtuple、元组作键、元组 vs 列表
# =============================================================

from collections import namedtuple   # 导入命名元组工厂
from typing import NamedTuple        # 导入类型化命名元组基类
import math                          # 导入数学库用于距离计算

print("=" * 60)                       # 打印分隔线
print("  元组与命名元组演示 —— 坐标与多值返回")  # 打印标题
print("=" * 60)                       # 打印分隔线

# -------------------------------------------------------------
# 第一部分：元组解包与 * 展开
# -------------------------------------------------------------
record = ("张三", 28, "北京", "Python", "高级")  # 一条用户记录元组
name, age, city, *skills = record     # 解包，剩余收入 skills 列表
print("\\n【1】元组解包：")              # 输出标题
print(f"    姓名={name}, 年龄={age}, 城市={city}")  # 打印前三字段
print(f"    技能={skills}")            # 打印剩余字段

# 交换变量
a, b = 10, 20                         # 初始化两个变量
a, b = b, a                           # 元组解包交换
print(f"    交换后 a={a}, b={b}")      # 输出交换结果

# -------------------------------------------------------------
# 第二部分：namedtuple —— 定义二维点
# -------------------------------------------------------------
Point = namedtuple("Point", ["x", "y"])   # 定义命名元组 Point
p1 = Point(3, 4)                      # 创建点 p1
p2 = Point(0, 0)                      # 创建点 p2
print("\\n【2】namedtuple Point：")      # 输出标题
print(f"    p1 = {p1}, p1.x={p1.x}, p1.y={p1.y}")  # 按名字访问字段
print(f"    p1[0] = {p1[0]}（按下标也可访问）")     # 按下标访问

def distance(a, b):                   # 定义距离计算函数
    return math.hypot(a.x - b.x, a.y - b.y)  # 计算欧氏距离
print(f"    p1 到 p2 距离 = {distance(p1, p2)}")  # 输出距离

# _replace 返回新实例
p3 = p1._replace(x=10)               # 修改 x，返回新点
print(f"    p1._replace(x=10) = {p3}")  # 输出新点
print(f"    原 p1 不变 = {p1}")        # 原 namedtuple 不变
print(f"    p1._asdict() = {p1._asdict()}")  # 转为字典视图

# -------------------------------------------------------------
# 第三部分：typing.NamedTuple —— 带类型注解的点
# -------------------------------------------------------------
class LabeledPoint(NamedTuple):       # 定义类型化命名元组
    x: float                          # x 坐标，浮点
    y: float                          # y 坐标，浮点
    label: str = "未命名"              # 标签，带默认值

lp = LabeledPoint(1.5, 2.5, "起点")   # 创建带标签的点
print("\\n【3】typing.NamedTuple：")    # 输出标题
print(f"    lp = {lp}")               # 输出该点
print(f"    类型注解 label 默认 = {LabeledPoint(0, 0).label}")  # 演示默认值

# -------------------------------------------------------------
# 第四部分：函数返回多值 —— 统计数据集
# -------------------------------------------------------------
def summarize(nums):                 # 定义统计函数
    """返回 (个数, 最小, 最大, 均值)"""  # 文档字符串
    n = len(nums)                    # 元素个数
    lo = min(nums)                   # 最小值
    hi = max(nums)                   # 最大值
    avg = sum(nums) / n              # 均值
    return n, lo, hi, avg            # 返回元组（多值）

data = [88, 72, 95, 60, 78, 83]      # 一组成绩
count, lowest, highest, mean = summarize(data)  # 解包接收多值
print("\\n【4】函数返回多值：")          # 输出标题
print(f"    数据 {data}")             # 输出原始数据
print(f"    个数={count}, 最低={lowest}, 最高={highest}, 均值={mean:.1f}")  # 输出统计

# -------------------------------------------------------------
# 第五部分：元组作字典键 —— 网格点存值
# -------------------------------------------------------------
grid = {}                           # 新建空字典
grid[(0, 0)] = "起点"               # 用元组 (0,0) 作键
grid[(1, 0)] = "向东一步"           # 用元组 (1,0) 作键
grid[(0, 1)] = "向北一步"           # 用元组 (0,1) 作键
print("\\n【5】元组作字典键（网格）：")  # 输出标题
for pos, desc in grid.items():      # 遍历键值
    print(f"    {pos} -> {desc}")   # 打印坐标和描述
print(f"    (2,2) 是否存在 = {(2, 2) in grid}")  # 判断键是否存在

# -------------------------------------------------------------
# 第六部分：多关键字排序（key 返回元组）
# -------------------------------------------------------------
students = [                        # 学生列表
    {"name": "Tom", "grade": "B", "age": 20},   # 学生记录
    {"name": "Ann", "grade": "A", "age": 22},   # 学生记录
    {"name": "Bob", "grade": "B", "age": 18},   # 学生记录
    {"name": "Zoe", "grade": "A", "age": 19},   # 学生记录
]
# 先按 grade 升序，grade 相同再按 age 升序
ordered = sorted(students, key=lambda s: (s["grade"], s["age"]))  # key 返回元组
print("\\n【6】多关键字排序（grade→age）：")  # 输出标题
for s in ordered:                   # 遍历排序结果
    print(f"    {s['grade']} - {s['name']}（{s['age']}岁）")  # 打印结果

# -------------------------------------------------------------
# 第七部分：元组 vs 列表对比
# -------------------------------------------------------------
import sys                          # 导入 sys 查看对象大小
tup = (1, 2, 3, 4, 5)              # 同样数据的元组
lst = [1, 2, 3, 4, 5]             # 同样数据的列表
print("\\n【7】元组 vs 列表：")        # 输出标题
print(f"    元组大小 = {sys.getsizeof(tup)} 字节")  # 输出元组内存
print(f"    列表大小 = {sys.getsizeof(lst)} 字节")  # 输出列表内存
print(f"    元组可哈希 = {hash((1, 2, 3))}")       # 元组可哈希做键
# hash([1,2,3]) 会抛 TypeError，故仅做说明
print("    列表不可哈希（不能做字典键）")          # 说明列表限制

print("\\n  💡 小结：元组=固定记录，namedtuple=带名字的记录，元组可做键、可多值返回。")
print("=" * 60)                     # 打印结束分隔线
`,
  },

  {
    id: "pykit-09",
    group: "数据结构与集合",
    icon: "🎯",
    title: "集合运算",
    content: `
# 🎯 集合运算

## 引言：集合是"去重与关系判断"的利器

当你的需求是"判断成员资格""求两批数据的差异/交集""去重"时，集合（set）比列表快得多——**列表的 \`in\` 是 O(n)，集合的 \`in\` 是 O(1)**。在数据量大时，这一个差别就是秒级与毫秒级的差距。

集合还直接支持数学上的交、并、差、对称差运算，一行代码就能完成"找出两份名单的差异"这类任务。

## 一、set 与 frozenset

### 1.1 set

\`\`\`python
s = {1, 2, 3}        # 字面量
s = set([1, 2, 2, 3])  # 从可迭代对象构造，自动去重 -> {1,2,3}
s.add(4)             # 添加
s.discard(10)        # 删除（不存在不报错）
s.remove(1)          # 删除（不存在抛 KeyError）
\`\`\`

要点：
- 元素必须**可哈希**（int/str/tuple 可以，list/dict/set 不行）
- **无序**（不要依赖遍历顺序）——注：CPython 3.7+ 的 set 实现上整数等会"看起来有序"，但这是实现细节，不能依赖
- 元素**唯一**

### 1.2 frozenset

\`frozenset\` 是 set 的**不可变**版本，创建后不能增删。因为不可变，所以**可哈希**，可以放进另一个 set 里、或作为字典键。

\`\`\`python
fs = frozenset([1, 2, 3])
# fs.add(4)  # 报错
d = {fs: "一组权限"}   # frozenset 可做键
\`\`\`

| 特性 | set | frozenset |
|------|-----|-----------|
| 可变 | ✅ | ❌ |
| 可哈希（做键/元素） | ❌ | ✅ |
| 支持交并差运算 | ✅ | ✅ |

## 二、四大集合运算

设 A、B 是两个集合：

| 运算 | 运算符 | 方法 | 含义 |
|------|--------|------|------|
| 交集 | \`A & B\` | \`A.intersection(B)\` | 同时属于两者 |
| 并集 \| \`A \| B\` | \`A.union(B)\` | 属于任一者 |
| 差集 | \`A - B\` | \`A.difference(B)\` | 属于 A 不属于 B |
| 对称差 | \`A ^ B\` | \`A.symmetric_difference(B)\` | 只属于其一者 |

示例：

\`\`\`python
A = {1, 2, 3, 4}
B = {3, 4, 5, 6}
A & B   # {3, 4}
A | B   # {1, 2, 3, 4, 5, 6}
A - B   # {1, 2}
A ^ B   # {1, 2, 5, 6}
\`\`\`

### 2.1 运算符 vs 方法的区别

- **运算符** (\`&\` \`|\` \`-\` \`^\`)：要求两边**都是 set/frozenset**。
- **方法** (\`intersection\` 等)：参数可以是**任意可迭代对象**，更灵活。

\`\`\`python
A.intersection([3, 4, 5])   # ✅ 方法接受列表
# A & [3,4,5]               # ❌ 运算符不接受列表
\`\`\`

### 2.2 原地更新版本

每个运算都有对应的"原地更新"方法（返回 None）：

\`\`\`python
A.intersection_update(B)   # A = A & B（原地）
A.update(B)                # A |= B（原地并）
A.difference_update(B)     # A -= B（原地差）
A.symmetric_difference_update(B)  # A ^= B
\`\`\`

## 三、集合推导式

和列表/字典推导式同理：

\`\`\`python
{s.lower() for s in words}        # 全部小写去重
{x % 5 for x in range(20)}        # 20 以内对 5 取模的集合
{frozenset(p) for p in pairs}     # 生成 frozenset 集合
\`\`\`

## 四、子集与超集

\`\`\`python
A = {1, 2}
B = {1, 2, 3, 4}
A <= B          # True，A 是 B 的子集
A.issubset(B)   # 等价写法
B >= A          # True，B 是 A 的超集
B.issuperset(A) # 等价写法
A < B           # True，真子集（A<=B 且 A!=B）
\`\`\`

还有"不相交"判断：

\`\`\`python
A.isdisjoint(B)   # A 与 B 没有公共元素时 True
\`\`\`

## 五、集合去重

最经典的去重一行：

\`\`\`python
unique = list(set(data))   # 去重，但不保序
\`\`\`

如果要**保序去重**，见上一章（dict.fromkeys）。set 去重适用于"只关心有哪些元素、不关心顺序"的场景。

## 六、性能与陷阱

| 操作 | 复杂度 |
|------|--------|
| \`x in s\` | O(1) 平均 |
| \`s.add(x)\` | O(1) 平均 |
| \`s \| t\` \| O(len(s)+len(t)) |
| \`s & t\` | O(min(len(s),len(t))) |

常见陷阱：

1. **空集合只能用 \`set()\`**：\`{}\` 是空**字典**，不是空集合。
2. **不要依赖顺序**：集合无序，遍历顺序不保证。
3. **元素必须可哈希**：list/dict 不能放进 set。
4. **运算符要求两边都是 set**：与列表混合用方法形式。

## 七、典型应用场景

### 7.1 找两批数据的差异

\`\`\`python
old_ids = {101, 102, 103}
new_ids = {102, 103, 104}
added = new_ids - old_ids      # 新增：{104}
removed = old_ids - new_ids    # 删除：{101}
changed = old_ids ^ new_ids    # 变动：{101, 104}
\`\`\`

这是数据同步、增量更新里最高频的写法。

### 7.2 标签系统

\`\`\`python
user_tags = {"vip", "active", "north"}
target = {"vip", "premium"}
if user_tags & target:         # 有任一目标标签
    ...
user_tags |= {"verified"}      # 添加标签
\`\`\`

### 7.3 去重 + 成员判断

把一个大列表转成 set 后判断成员，是常见的性能优化：

\`\`\`python
valid = set(huge_list)         # 预处理一次
for x in stream:
    if x in valid:             # O(1) 判断
        ...
\`\`\`

## 八、本章小结

| 需求 | 写法 |
|------|------|
| 去重（不保序） | \`set(data)\` |
| 交集 | \`A & B\` |
| 并集 \| \`A \| B\` |
| 差集 | \`A - B\` |
| 对称差 | \`A ^ B\` |
| 子集判断 | \`A <= B\` |
| 可哈希集合 | \`frozenset\` |
| 灵活参数 | 用方法形式 \`A.intersection(...)\` |

下面的演示用"数据差异比对"和"标签系统"两个场景展示集合运算的威力。
`,
    code: `
# =============================================================
# 集合运算演示 —— 数据差异比对与标签系统
# 本脚本仅使用 Python 标准库，演示：set/frozenset、交并差对称差、
# 集合推导式、子集超集、去重
# =============================================================

print("=" * 60)                       # 打印分隔线
print("  集合运算演示 —— 数据差异与标签系统")  # 打印标题
print("=" * 60)                       # 打印分隔线

# -------------------------------------------------------------
# 第一部分：四大集合运算
# -------------------------------------------------------------
A = {1, 2, 3, 4}                     # 定义集合 A
B = {3, 4, 5, 6}                     # 定义集合 B
print("\\n【1】四大集合运算：")         # 输出标题
print(f"    A = {A}, B = {B}")        # 输出两个集合
print(f"    交集 A & B   = {A & B}")  # 输出交集
print(f"    并集 A | B   = {A | B}")  # 输出并集
print(f"    差集 A - B   = {A - B}")  # 输出差集
print(f"    对称差 A ^ B = {A ^ B}")  # 输出对称差

# 方法形式可接受任意可迭代对象
print(f"    A.intersection([3,4,5]) = {A.intersection([3, 4, 5])}")  # 方法接受列表

# -------------------------------------------------------------
# 第二部分：frozenset —— 不可变、可哈希
# -------------------------------------------------------------
fs = frozenset(["vip", "active", "north"])  # 创建 frozenset
print("\\n【2】frozenset：")           # 输出标题
print(f"    fs = {fs}")               # 输出 frozenset
tag_map = {fs: "用户组A"}             # frozenset 可作字典键
print(f"    作字典键 = {tag_map}")     # 输出字典
print(f"    fs 可哈希 = {hash(fs) != None}")  # 演示可哈希

# -------------------------------------------------------------
# 第三部分：找两批数据的差异 —— 增量同步
# -------------------------------------------------------------
old_ids = {101, 102, 103, 104}        # 旧数据 id 集合
new_ids = {102, 103, 104, 105, 106}   # 新数据 id 集合
added = new_ids - old_ids             # 新增的 id（新有旧无）
removed = old_ids - new_ids           # 删除的 id（旧有新无）
kept = old_ids & new_ids              # 保留的 id（都有）
changed = old_ids ^ new_ids           # 变动的 id（增+删）
print("\\n【3】数据差异比对：")         # 输出标题
print(f"    旧 id = {sorted(old_ids)}")  # 输出旧 id（排序便于查看）
print(f"    新 id = {sorted(new_ids)}")  # 输出新 id
print(f"    新增 added   = {sorted(added)}")   # 输出新增
print(f"    删除 removed = {sorted(removed)}") # 输出删除
print(f"    保留 kept    = {sorted(kept)}")    # 输出保留
print(f"    变动 changed = {sorted(changed)}") # 输出变动

# -------------------------------------------------------------
# 第四部分：标签系统 —— 权限判断
# -------------------------------------------------------------
user_tags = {"vip", "active", "north"}  # 用户当前标签
required = {"vip", "premium"}          # 某功能需要的标签
print("\\n【4】标签系统：")            # 输出标题
print(f"    用户标签 = {user_tags}")   # 输出用户标签
has_any = bool(user_tags & required)   # 交集非空表示满足任一标签
print(f"    满足任一所需标签 = {has_any}")  # 输出判断结果
has_all = required.issubset(user_tags) # 所需标签全是子集表示全部满足
print(f"    满足全部所需标签 = {has_all}")  # 输出判断结果

# 添加与移除标签
user_tags |= {"verified"}             # 原地并：添加标签
user_tags.discard("north")            # 移除标签（不存在不报错）
print(f"    更新后标签 = {user_tags}")  # 输出更新后标签

# -------------------------------------------------------------
# 第五部分：集合推导式 —— 字符归一去重
# -------------------------------------------------------------
words = ["Apple", "apple", "BANANA", "banana", "apple"]  # 含大小写重复的词
lower_unique = {w.lower() for w in words}  # 推导式转小写并去重
print("\\n【5】集合推导式去重：")       # 输出标题
print(f"    原始词 = {words}")         # 输出原始词
print(f"    小写去重 = {lower_unique}")  # 输出去重结果

# 数字取模集合
mods = {x % 5 for x in range(20)}     # 0~19 对 5 取模的集合
print(f"    0~19 对5取模集合 = {sorted(mods)}")  # 输出取模集合

# -------------------------------------------------------------
# 第六部分：子集 / 超集 / 不相交
# -------------------------------------------------------------
small = {1, 2}                        # 小集合
big = {1, 2, 3, 4}                    # 大集合
other = {9, 10}                       # 无关集合
print("\\n【6】子集与超集：")           # 输出标题
print(f"    {small} <= {big} ? {small <= big}")  # 子集判断
print(f"    {big} >= {small} ? {big >= small}")  # 超集判断
print(f"    {small} < {big}（真子集）? {small < big}")  # 真子集
print(f"    {small}.isdisjoint({other}) ? {small.isdisjoint(other)}")  # 不相交

# -------------------------------------------------------------
# 第七部分：性能对比 —— set 判断 vs list 判断
# -------------------------------------------------------------
import time                          # 导入时间模块
big_list = list(range(100000))       # 10 万个元素的列表
big_set = set(big_list)              # 转为集合
needle = 99999                       # 要查找的值
t0 = time.perf_counter()             # 记录开始时间
for _ in range(1000):                # 重复 1000 次
    _ = needle in big_list           # 列表 in 查找 O(n)
t_list = time.perf_counter() - t0    # 列表耗时
t0 = time.perf_counter()             # 记录开始时间
for _ in range(1000):                # 重复 1000 次
    _ = needle in big_set            # 集合 in 查找 O(1)
t_set = time.perf_counter() - t0     # 集合耗时
print("\\n【7】成员判断性能（1000 次）：")  # 输出标题
print(f"    list 耗时 = {t_list:.5f}s")  # 输出列表耗时
print(f"    set  耗时 = {t_set:.5f}s")   # 输出集合耗时
print(f"    set 比 list 快约 {t_list / max(t_set, 1e-9):.0f} 倍")  # 输出倍数

print("\\n  💡 小结：集合做去重和关系判断极快，A&B/|/-/^ 一行搞定数据差异。")
print("=" * 60)                      # 打印结束分隔线
`,
  },

  {
    id: "pykit-10",
    group: "数据结构与集合",
    icon: "📚",
    title: "collections 模块",
    content: `
# 📚 collections 模块

## 引言：标准库里的"高阶容器工具箱"

Python 内置的 list/dict/set/tuple 已经很强，但在实际开发中常遇到一些"略显啰嗦"的需求：计数、分组、双端操作、多字典联动……\`collections\` 模块正是为这些场景提供的高性能容器。

掌握 collections，你写出的代码会少很多 if/else，也更不容易出 bug。本章覆盖它最常用的六个工具。

## 一、Counter：计数器

\`Counter\` 是 dict 子类，专门用于**计数可哈希对象**。

\`\`\`python
from collections import Counter
c = Counter("abracadabra")
c                      # Counter({'a': 5, 'b': 2, 'r': 2, 'c': 1, 'd': 1})
c.most_common(2)       # [('a', 5), ('b', 2)]
c.total()              # 11（3.10+ 求总数）
\`\`\`

### 1.1 常用方法

| 方法/特性 | 作用 |
|-----------|------|
| \`c[x]\` | 取 x 的计数（缺失返回 0，不抛错） |
| \`c.most_common(n)\` | 出现最多的 n 个 |
| \`c.update(iter)\` | 追加计数 |
| \`c.subtract(iter)\` | 减少计数（可为负） |
| \`c.elements()\` | 展开成元素迭代器 |
| \`c.total()\` | 总数（3.10+） |

### 1.2 计数运算

Counter 支持 \`+\` \`-\` \`&\` \`|\`：

\`\`\`python
from collections import Counter
c1 = Counter(a=3, b=1)
c2 = Counter(a=1, b=2)
c1 + c2   # {'a':4, 'b':3}  对应相加
c1 - c2   # {'a':2}          对应相减（<=0 的丢弃）
c1 & c2   # {'a':1, 'b':1}    交集取最小
c1 | c2   # {'a':3, 'b':2}    并集取最大
\`\`\`

典型用途：词频统计、投票统计、库存增减。

## 二、defaultdict：默认字典

访问缺失键时自动调用工厂函数生成默认值，省去"先判断再初始化"。

\`\`\`python
from collections import defaultdict
d = defaultdict(list)
d["a"].append(1)   # 不需先初始化 d["a"]=[]
\`\`\`

常见工厂与场景：

| 工厂 | 默认值 | 场景 |
|------|--------|------|
| \`int\` | 0 | 计数 |
| \`list\` | [] | 分组 |
| \`set\` | set() | 分组去重 |
| \`dict\` | {} | 嵌套 |

**分组示例**：

\`\`\`python
from collections import defaultdict
by_dept = defaultdict(list)
for emp in employees:
    by_dept[emp["dept"]].append(emp)
\`\`\`

> ⚠️ defaultdict 与 \`dict.setdefault\` 的区别：defaultdict 在**第一次访问**缺失键时就建好默认值，代码更简洁；\`setdefault\` 是显式调用，灵活但啰嗦。

## 三、OrderedDict：有序字典

虽然 3.7+ 普通 dict 也保序，但 OrderedDict 提供独有的"调序"能力：

\`\`\`python
from collections import OrderedDict
od = OrderedDict()
od["a"] = 1
od["b"] = 2
od["c"] = 3
od.move_to_end("a")    # 把 a 移到末尾
od.popitem(last=False)  # 弹出最前面（最久未用）
\`\`\`

| 独有能力 | 说明 |
|----------|------|
| \`move_to_end(key)\` | 把某键移到首/尾 |
| \`popitem(last=...) \` | 从首/尾弹出 |
| 顺序敏感相等 | \`==\` 还比较顺序 |

这使 OrderedDict 成为实现 **LRU 缓存**的理想结构。

## 四、deque：双端队列

\`collections.deque\`（发音 "deck"）是**双端队列**，两端增删都是 O(1)。对比 list 的 \`insert(0, x)\` 是 O(n)，deque 在头部操作场景碾压 list。

\`\`\`python
from collections import deque
dq = deque([1, 2, 3])
dq.appendleft(0)      # 头部入队：O(1)
dq.append(4)          # 尾部入队：O(1)
dq.popleft()          # 头部出队：O(1)
dq.pop()              # 尾部出队：O(1)
\`\`\`

| 操作 | list | deque |
|------|------|-------|
| 末尾 append/pop | O(1) | O(1) |
| 头部 insert(0)/pop(0) | O(n) | O(1) |
| 随机访问 a[i] | O(1) | O(n) |
| 固定长度 maxlen | ❌ | ✅ 自动淘汰 |

### 4.1 maxlen：自动滑窗

\`\`\`python
from collections import deque
dq = deque(maxlen=3)
for i in range(5):
    dq.append(i)   # 满了自动从另一端挤掉
# deque([2, 3, 4], maxlen=3)
\`\`\`

这非常适合"保留最近 N 条记录""滑动窗口"等场景。

## 五、namedtuple：命名元组

（上一章已详细介绍）这里强调它在 collections 中的位置：用 namedtuple 定义轻量、不可变、可按名访问的记录类型。

\`\`\`python
from collections import namedtuple
Employee = namedtuple("Employee", ["name", "dept", "salary"])
e = Employee("Tom", "RD", 20000)
e.dept   # 'RD'
\`\`\`

## 六、ChainMap：合并映射

\`ChainMap\` 把多个字典"逻辑串联"成一个视图，**不复制数据**，查找时按顺序遍历：

\`\`\`python
from collections import ChainMap
defaults = {"host": "localhost", "port": 3306}
env = {"port": 5432}
cli = {"port": 8000}
cfg = ChainMap(cli, env, defaults)   # 查找顺序：cli→env→defaults
cfg["port"]   # 8000（先在 cli 找到）
cfg["host"]   # localhost（一路找到 defaults）
\`\`\`

### 6.1 ChainMap vs 字典合并的对比

| 对比 | \`{**a, **b}\` / \`a \| b\` | \`ChainMap(a, b)\` |
|------|--------------------------|--------------------|
| 是否复制 | 是，生成新字典 | 否，仅视图 |
| 写入影响 | 写新字典 | 写入会影响第一个映射 |
| 多级优先级 | 需手动多次合并 | 天然支持多级 |
| 适合场景 | 一次性合并 | 多级配置查找、可变配置层 |

ChainMap 的经典用途是**多级配置**：命令行参数 > 环境变量 > 项目配置 > 默认配置。每一层都是一个 dict，ChainMap 按优先级串联。

## 七、综合应用：LRU 缓存

OrderedDict + 容量限制 = 简易 LRU：

\`\`\`python
from collections import OrderedDict
class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.od = OrderedDict()
    def get(self, key):
        if key not in self.od:
            return None
        self.od.move_to_end(key)   # 命中则移到末尾
        return self.od[key]
    def put(self, key, value):
        if key in self.od:
            self.od.move_to_end(key)
        self.od[key] = value
        if len(self.od) > self.cap:
            self.od.popitem(last=False)  # 淘汰最久未用
\`\`\`

## 八、各工具选择速查

| 需求 | 工具 |
|------|------|
| 计数 / 排行 | Counter |
| 分组 / 嵌套默认值 | defaultdict |
| 调整顺序 / LRU | OrderedDict |
| 双端操作 / 滑动窗口 | deque |
| 轻量记录类型 | namedtuple |
| 多级配置查找 | ChainMap |

## 九、本章小结

collections 模块把"容器使用中最常见的痛点"逐一封装成高性能工具。记住一个原则：**当你发现自己在写"先判断 key 在不在、不在就初始化"这类样板代码时，去 collections 里找找，多半已有现成工具**。

下面的演示用一个完整的"LRU 缓存 + 多级配置查找"场景把本模块串起来。
`,
    code: `
# =============================================================
# collections 模块演示 —— LRU 缓存与多级配置查找
# 本脚本仅使用 Python 标准库，演示：Counter、defaultdict、
# OrderedDict、deque、namedtuple、ChainMap
# =============================================================

from collections import (              # 从 collections 导入多个工具
    Counter,                           # 计数器
    defaultdict,                       # 默认字典
    OrderedDict,                       # 有序字典
    deque,                             # 双端队列
    namedtuple,                        # 命名元组
    ChainMap,                          # 链式映射
)

print("=" * 60)                        # 打印分隔线
print("  collections 模块演示 —— LRU 与多级配置")  # 打印标题
print("=" * 60)                        # 打印分隔线

# -------------------------------------------------------------
# 第一部分：Counter —— 商品销量统计
# -------------------------------------------------------------
orders = ["apple", "banana", "apple", "cherry", "banana", "apple"]  # 订单商品列表
sales = Counter(orders)               # 一行统计每种商品销量
print("\\n【1】Counter 商品销量：")     # 输出标题
print(f"    销量 = {dict(sales)}")     # 输出销量字典
print(f"    最畅销 = {sales.most_common(1)}")  # 输出最畅销商品
print(f"    apple 卖了 {sales['apple']} 件")  # 输出某商品销量
print(f"    grape 卖了 {sales['grape']} 件（缺失返回0）")  # 缺失键返回 0

# Counter 运算
new_batch = Counter(["apple", "cherry", "cherry"])  # 新一批订单
total_sales = sales + new_batch       # 计数相加
print(f"    追加后总销量 = {dict(total_sales)}")  # 输出相加结果

# -------------------------------------------------------------
# 第二部分：defaultdict —— 按部门分组
# -------------------------------------------------------------
employees = [                         # 员工列表
    ("Tom", "RD"),                    # 员工记录
    ("Ann", "RD"),                    # 员工记录
    ("Bob", "HR"),                    # 员工记录
    ("Zoe", "HR"),                    # 员工记录
    ("Lee", "FIN"),                   # 员工记录
]
by_dept = defaultdict(list)           # 值默认为空列表
for name, dept in employees:          # 遍历员工
    by_dept[dept].append(name)        # 按部门分组追加
print("\\n【2】defaultdict 分组：")     # 输出标题
for dept, names in by_dept.items():   # 遍历分组结果
    print(f"    {dept}: {names}")     # 输出部门和成员

# -------------------------------------------------------------
# 第三部分：deque —— 滑动窗口与双端操作
# -------------------------------------------------------------
stream = list(range(1, 11))           # 数据流 1..10
window = deque(maxlen=3)              # 固定长度 3 的滑动窗口
print("\\n【3】deque 滑动窗口（最近3个）：")  # 输出标题
for x in stream:                      # 遍历数据流
    window.append(x)                  # 入队，满 3 自动淘汰最旧
    print(f"    入 {x} -> 窗口 {list(window)}")  # 打印当前窗口

# 双端操作
dq = deque([2, 3, 4])                 # 新建 deque
dq.appendleft(1)                      # 头部入队
dq.append(5)                          # 尾部入队
print(f"    双端操作后 = {list(dq)}")  # 输出结果
print(f"    popleft 得到 {dq.popleft()}，剩 {list(dq)}")  # 头部出队

# -------------------------------------------------------------
# 第四部分：namedtuple —— 定义员工记录类型
# -------------------------------------------------------------
Employee = namedtuple("Employee", ["name", "dept", "salary"])  # 定义命名元组
staff = [                             # 员工记录列表
    Employee("Tom", "RD", 20000),     # 员工实例
    Employee("Ann", "HR", 18000),     # 员工实例
    Employee("Bob", "RD", 24000),     # 员工实例
]
print("\\n【4】namedtuple 员工记录：")  # 输出标题
for e in staff:                       # 遍历员工
    print(f"    {e.name} | {e.dept} | {e.salary}")  # 按字段名访问
avg_salary = sum(e.salary for e in staff) / len(staff)  # 计算平均薪资
print(f"    平均薪资 = {avg_salary:.0f}")  # 输出平均薪资

# -------------------------------------------------------------
# 第五部分：OrderedDict —— 实现 LRU 缓存
# -------------------------------------------------------------
class LRUCache:                       # 定义 LRU 缓存类
    def __init__(self, capacity):     # 构造函数
        self.cap = capacity           # 缓存容量
        self.od = OrderedDict()       # 用 OrderedDict 存数据
    def get(self, key):               # 查询方法
        if key not in self.od:        # 未命中
            return None               # 返回 None
        self.od.move_to_end(key)      # 命中则移到末尾（最近使用）
        return self.od[key]           # 返回值
    def put(self, key, value):        # 写入方法
        if key in self.od:            # 已存在
            self.od.move_to_end(key)  # 先移到末尾
        self.od[key] = value          # 写入值
        if len(self.od) > self.cap:   # 超出容量
            self.od.popitem(last=False)  # 淘汰头部（最久未用）

cache = LRUCache(3)                   # 容量为 3 的缓存
print("\\n【5】LRU 缓存（容量3）：")    # 输出标题
ops = [("put", "a", 1), ("put", "b", 2), ("put", "c", 3),  # 操作序列
       ("get", "a", None), ("put", "d", 4), ("get", "b", None)]  # 含淘汰
for op in ops:                        # 依次执行操作
    if op[0] == "put":                # put 操作
        cache.put(op[1], op[2])       # 写入
        print(f"    put {op[1]}={op[2]} -> 缓存 {list(cache.od.items())}")  # 输出状态
    else:                             # get 操作
        v = cache.get(op[1])          # 查询
        print(f"    get {op[1]} -> {v}（None 表示被淘汰）, 缓存 {list(cache.od.items())}")  # 输出结果

# -------------------------------------------------------------
# 第六部分：ChainMap —— 多级配置查找
# -------------------------------------------------------------
defaults = {"host": "localhost", "port": 3306, "timeout": 30, "debug": False}  # 默认配置
project = {"port": 5432, "debug": True}  # 项目配置
env = {"host": "10.0.0.1"}            # 环境变量配置
cli = {"port": 8000}                  # 命令行参数（最高优先级）
cfg = ChainMap(cli, env, project, defaults)  # 按优先级串联
print("\\n【6】ChainMap 多级配置：")    # 输出标题
print(f"    优先级：cli > env > project > defaults")  # 说明优先级
for key in ["host", "port", "timeout", "debug"]:  # 遍历各配置项
    print(f"    {key} = {cfg[key]}")  # 输出最终生效值
print(f"    所有键 = {sorted(cfg.keys())}")  # 输出合并后的所有键

# ChainMap 不复制数据，写入会影响第一个映射
cfg["retries"] = 3                    # 写入新键
print(f"    写入 retries 后 cli = {cli}")  # 写入落到第一个映射 cli

# -------------------------------------------------------------
# 第七部分：综合 —— 用 Counter + deque 分析访问日志
# -------------------------------------------------------------
log = [                               # 模拟访问日志
    "/home", "/about", "/home", "/contact", "/home",  # 访问记录
    "/about", "/home", "/login", "/home", "/about",   # 访问记录
]
recent = deque(log, maxlen=5)         # 只保留最近 5 条访问
top = Counter(log).most_common(2)     # 统计历史 Top2
print("\\n【7】综合：访问日志分析")     # 输出标题
print(f"    最近5条访问 = {list(recent)}")  # 输出最近访问
print(f"    历史 Top2 = {top}")        # 输出最热路径

print("\\n  💡 小结：Counter 计数、defaultdict 分组、deque 双端/滑窗、OrderedDict 做 LRU、ChainMap 做多级配置。")
print("=" * 60)                       # 打印结束分隔线
`,
  },
];
