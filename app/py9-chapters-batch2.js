// =============================================================
// Python 逐层深入教程 - batch2
// 章节 11-20：数据结构进阶（列表方法/元组/字典/集合）+ 流程控制
// =============================================================

export const chapters = [
  // -----------------------------------------------------------
  // 第 11 章：列表方法
  // -----------------------------------------------------------
  {
    id: "py9-11",
    group: "数据：Python 里的东西",
    icon: "🔧",
    title: "列表（二）：增删改查方法",
    content: `## 列表方法：给列表"动手术"的工具箱

还记得前面我们说列表是"能装东西的盒子"吗？盒子里的东西不是一成不变的——你可以往里塞新东西、把旧东西掏出来、把某个位置的东西换成新的。Python 给列表准备了一整套"手术工具"，叫做**列表方法**。

这一章我们挨个认识这些工具。学完之后，你就能像操作购物车一样自如地增删改查列表了。

### 先理解一个关键概念：原地修改 vs 返回新对象

在开始之前，必须先建立一个观念，否则后面会越学越乱。

列表方法是"原地修改"的——它直接改原列表，**大多数返回 None**。这跟字符串方法完全相反：字符串不可变，所以字符串方法都返回新字符串。

打个比方：列表方法像在白板上擦掉重写（白板还是那块白板），字符串方法像把白板上的内容抄到一张新纸上（原来的纸不变）。

\`\`\`python
nums = [3, 1, 2]
result = nums.sort()
print(result)    # None！不是排好序的列表
print(nums)      # [1, 2, 3]，原列表已经变了

s = "hello"
result = s.upper()
print(result)    # "HELLO"
print(s)         # "hello"，原字符串不变
\`\`\`

⚠️ 这是最常踩的坑之一：新手以为 \`nums.sort()\` 会返回排好序的列表，于是写 \`new = nums.sort()\`，结果 new 是 None。

### 一、增加元素：往列表里塞东西

列表有三招"加法"，各有用途：

\`\`\`python
lst.append(x)       # 末尾加一个元素
lst.insert(i, x)    # 在下标 i 处插入 x
lst.extend(其他列表) # 把另一个列表的元素全加进来
\`\`\`

**append** 是最常用的——往最后加一个东西。就像排队时来个人站到队尾。

**insert** 是"插队"——在指定位置插入，原来这个位置及之后的元素都往后挪一位。注意：insert 比 append 慢，因为它要移动后面所有元素。所以能在末尾加就别在中间插。

**extend** 是"整队加入"——把另一个列表的每个元素都拆开加进来。

#### append vs extend（面试常考）

这是最容易混淆的一对。看代码：

\`\`\`python
a = [1, 2]
a.append([3, 4])   # a = [1, 2, [3, 4]]  ← 把列表当一个整体塞进去
a.extend([3, 4])   # a = [1, 2, 3, 4]    ← 把元素拆开一个个加
\`\`\`

生活类比：append 像把一箱苹果整箱放进购物车，extend 像把箱子打开把苹果一个个放进去。

记住：append 加的是"一个元素"（不管这个元素本身是不是列表），extend 加的是"一堆元素"。

### 二、删除元素：从列表里拿掉东西

删除有四种方式，对应不同场景：

\`\`\`python
lst.pop()        # 删除并返回末尾元素
lst.pop(i)       # 删除并返回下标 i 的元素
lst.remove(x)    # 删除第一个等于 x 的元素
del lst[i]       # 用 del 语句删下标 i
lst.clear()      # 清空整个列表
\`\`\`

**pop** 像"弹夹弹出一颗子弹"——删掉的同时还能拿到那个值。不写下标默认删末尾。这是唯一会"返回被删元素"的删除方法。

**remove** 是"按值删"——找到第一个等于 x 的删掉。如果列表里有多个相同的值，只删第一个。⚠️ 如果 x 不在列表里，会抛 \`ValueError\`。

**del** 是 Python 语句（不是方法），按位置删。也能切片删：\`del lst[1:3]\` 一次删一片。

**clear** 是"全倒掉"，列表变空但列表本身还在。

\`\`\`python
nums = [10, 20, 30, 40]
removed = nums.pop()    # 删40，removed=40
nums.remove(20)         # 删第一个20
del nums[0]             # 删下标0
\`\`\`

### 三、修改元素：把某个位置换成新的

最简单的修改就是直接用下标赋值：

\`\`\`python
lst[i] = 新值          # 改一个
lst[i:j] = [新列表]    # 改一段（切片赋值）
\`\`\`

切片赋值很灵活：可以用 3 个替换 2 个，甚至可以用来插入或删除。但新手用得少，知道就行：

\`\`\`python
nums = [1, 2, 3, 4, 5]
nums[0] = 99              # [99, 2, 3, 4, 5]
nums[1:3] = [20, 30, 40]  # 长度可以变
\`\`\`

### 四、查找和排序

\`\`\`python
lst.index(x)     # x 的下标，找不到抛异常
lst.count(x)     # x 出现几次
lst.sort()       # 原地排序（改原列表）
lst.reverse()    # 原地反转
sorted(lst)      # 返回新排序列表，不改原列表
\`\`\`

**index** 找位置，**count** 数次数。⚠️ index 找不到会抛 \`ValueError\`，所以用之前最好先 \`in\` 判断一下，或者用 try/except。

**sort vs sorted** 是另一对常考的：

| | \`lst.sort()\` | \`sorted(lst)\` |
|---|---|---|
| 是方法还是函数 | 列表的方法 | 内置函数 |
| 改不改原列表 | 改（原地） | 不改（返回新的）|
| 返回值 | None | 排好序的新列表 |
| 适用对象 | 只有列表 | 任何可迭代对象 |

口诀：**"sort 改自己，sorted 给新的"**。

#### sort 的高级用法：按规则排序

\`\`\`python
students = [("小明", 90), ("小红", 85)]
students.sort(key=lambda x: x[1])           # 按分数排
students.sort(key=lambda x: x[1], reverse=True)  # 降序
\`\`\`

key 接一个函数，告诉 sort"用什么作为比较依据"。lambda 是临时小函数，后面会专门讲。这里只要知道：sort 不是只能按默认顺序，你想按啥排都行。

### 五、拷贝的坑：为什么改了一个，另一个也变了

这是新手必踩的坑。先看代码：

\`\`\`python
a = [1, 2, 3]
b = a               # 这不是拷贝！b 和 a 是同一份
b.append(4)         # a 也变了！
print(a)            # [1, 2, 3, 4]
\`\`\`

为什么？回顾第 4 章"变量是标签"——\`b = a\` 只是把 b 这个标签也贴到了同一份列表上，a 和 b 指向同一块内存。改 b 就是改 a，它们是同一个东西的两个名字。

要真正拷贝，得用：

\`\`\`python
c = a.copy()        # 浅拷贝，c 是独立的新列表
c.append(5)         # a 不变
\`\`\`

⚠️ 注意这是"浅拷贝"——只复制了第一层。如果列表里嵌套了列表，内层还是共享的：

\`\`\`python
a = [[1, 2], [3, 4]]
b = a.copy()
b[0].append(99)     # 改的是内层列表
print(a)            # a 也变了！
\`\`\`

要彻底独立，得用 \`copy.deepcopy(a)\`（深拷贝）。这个进阶概念现在知道就行。

### 六、方法一览表

| 方法 | 作用 | 返回值 | 改原列表 |
|---|---|---|---|
| append(x) | 末尾加一个 | None | 是 |
| insert(i, x) | 位置 i 插入 | None | 是 |
| extend(可迭代) | 批量加 | None | 是 |
| pop(i) | 删并返回 | 被删的值 | 是 |
| remove(x) | 按值删 | None | 是 |
| clear() | 清空 | None | 是 |
| index(x) | 找下标 | 下标 | 否 |
| count(x) | 数次数 | 次数 | 否 |
| sort() | 排序 | None | 是 |
| reverse() | 反转 | None | 是 |
| copy() | 浅拷贝 | 新列表 | 否 |

### 小结

- 列表方法大多"原地修改"返回 None，和字符串方法相反
- append 加一个、extend 加一堆，这是面试高频
- sort 改自己、sorted 给新的，记牢这对比
- \`b = a\` 不是拷贝，要独立用 \`a.copy()\`
- 嵌套结构要彻底独立得用 deepcopy

### 常见疑问 Q&A

**Q1：append 和 += 有什么区别？**
A：\`lst += [x]\` 等价于 \`lst.extend([x])\`，是拆开加。而 \`lst.append(x)\` 是加一个。如果 x 是列表，行为不同。

**Q2：remove 删多个相同的值怎么办？**
A：用循环 + remove，或者用推导式重建：\`lst = [x for x in lst if x != target]\`。

**Q3：sort 排字典列表怎么按某个键排？**
A：\`lst.sort(key=lambda d: d["age"])\`。

**Q4：列表方法和字符串方法为啥一个返回 None 一个返回新的？**
A：因为列表可变（改自己就行），字符串不可变（改不了，只能造新的）。

**Q5：为什么我的 \`new = nums.sort()\` 是 None？**
A：sort 原地改，返回 None。要新的用 \`new = sorted(nums)\`。

### 本章 demo

demo 把增删改查、排序、拷贝都演示一遍，重点对比 append/extend 和 =/copy。`,
    code: `# ============================================
# 第 11 章：列表方法
# ============================================

# --- 1. 增加 ---
print("=== 1. 增加 ===")
fruits = ["苹果", "香蕉"]
print(f"初始: {fruits}")
fruits.append("橘子")              # 末尾加一个
print(f"append('橘子'): {fruits}")
fruits.insert(1, "葡萄")           # 在下标1处插入
print(f"insert(1,'葡萄'): {fruits}")
fruits.extend(["西瓜", "梨"])      # 把另一个列表的元素加进来
print(f"extend(['西瓜','梨']): {fruits}")

# append vs extend 对比
print("\\n--- append vs extend ---")
a = [1, 2]
a.append([3, 4])
print(f"append([3,4]) → {a}    ← 把列表当一个元素")
b = [1, 2]
b.extend([3, 4])
print(f"extend([3,4]) → {b}    ← 元素拆开加进来")

# --- 2. 删除 ---
print("\\n=== 2. 删除 ===")
nums = [10, 20, 30, 40, 50, 30]
print(f"初始: {nums}")
last = nums.pop()                  # 删末尾，返回被删的值
print(f"pop() → 删了{last}, 剩 {nums}")
mid = nums.pop(1)                  # 删下标1
print(f"pop(1) → 删了{mid}, 剩 {nums}")
nums.remove(30)                    # 删第一个等于30的
print(f"remove(30) → {nums}")
del nums[0]                        # 用 del 删下标0
print(f"del nums[0] → {nums}")

# --- 3. 查找 ---
print("\\n=== 3. 查找 ===")
nums = [10, 20, 30, 20, 40]
print(f"nums = {nums}")
print(f"nums.index(20) = {nums.index(20)}    ← 第一个20的下标")
print(f"nums.count(20) = {nums.count(20)}    ← 20出现几次")
# nums.index(99)  # 找不到会抛 ValueError

# --- 4. 排序 ---
print("\\n=== 4. 排序 ===")
scores = [78, 92, 85, 67, 95]
print(f"原始: {scores}")
scores.sort()                      # 原地升序，改原列表
print(f"sort()升序: {scores}")
scores.sort(reverse=True)          # 降序
print(f"sort(reverse=True)降序: {scores}")
# sorted() 返回新列表，不改原列表
original = [3, 1, 4, 1, 5]
new_sorted = sorted(original)
print(f"sorted({original}) = {new_sorted}，原列表没变: {original}")

# 按条件排序
students = [("小明", 90), ("小红", 85), ("小刚", 92)]
students.sort(key=lambda x: x[1])  # 按分数排（lambda 后面讲）
print(f"按分数排: {students}")

# --- 5. 拷贝的坑 ---
print("\\n=== 5. 拷贝 ===")
a = [1, 2, 3]
b = a                       # 不是拷贝！同一份
b.append(4)
print(f"a = {a}, b = {b}    ← 改 b，a 也变")
c = a.copy()                # 浅拷贝，独立
c.append(5)
print(f"a = {a}, c = {c}    ← 改 c，a 不变")

# --- 6. 实用：统计成绩 ---
print("\\n=== 6. 实用 ===")
scores = [85, 92, 78, 95, 67, 88, 72, 95, 90]
print(f"成绩: {scores}")
print(f"最高: {max(scores)}, 最低: {min(scores)}")
print(f"平均: {sum(scores)/len(scores):.1f}")
print(f"95分出现: {scores.count(95)} 次")
scores.sort(reverse=True)
print(f"排名: {scores[:3]} 前三")`
  },

  // -----------------------------------------------------------
  // 第 12 章：元组
  // -----------------------------------------------------------
  {
    id: "py9-12",
    group: "数据：Python 里的东西",
    icon: "📦",
    title: "元组：不可变的列表",
    content: `## 元组：列表的" immutable 双胞胎"

上一章我们学了列表，它什么都能干——加、删、改。但有时候你**不希望**数据被改。比如一个人的出生日期、一个城市的经纬度、一个 RGB 颜色——这些一旦定下来就不该变。

Python 提供了"不可变的列表"来满足这种需求，它叫**元组（tuple）**。

### 元组是什么

元组和列表几乎一样，**唯一区别：元组不可变**。创建后不能增删改元素。

\`\`\`python
t = (1, 2, 3)
t = 1, 2, 3        # 括号可省略
one = (1,)         # 单元素元组，逗号必须有！
\`\`\`

生活类比：列表像可擦写的白板，元组像刻在石头上的字——写好就改不了了。

⚠️ 单元素元组必须加逗号：\`(1,)\` 是元组，\`(1)\` 只是数字 1。这是新手最容易踩的坑。Python 看到 \`"(1)"\` 会理解成"括号里的 1"（数学上的优先级括号），所以结果是整数 1；只有加逗号 \`"(1,)"\` 才明确告诉 Python"这是一个元组"。

\`\`\`python
print(type((1)))    # <class 'int'>  ← 不是元组！
print(type((1,)))   # <class 'tuple'> ← 这才是元组
print(type(()))     # <class 'tuple'> ← 空元组没问题
\`\`\`

### 为什么要"不可变"？多此一举吗？

你可能会问：列表啥都能干，还要元组干嘛？原因有三个：

**1. 安全**：数据不会被意外修改。比如经纬度坐标 \`(39.9, 116.4)\`，一旦写成元组，谁也改不了——这能避免很多 bug。想象一下，如果坐标被某段代码不小心改了，地图定位就错了，而且很难查。

**2. 可哈希**：元组能当字典的 key、能放集合里，列表不行。这是因为字典和集合底层用"哈希"实现，要求元素不可变（这样哈希值才稳定）。

\`\`\`python
# 元组能当 key
cities = {(39, 116): "北京", (31, 121): "上海"}

# 列表不行
# cities = {[39, 116]: "北京"}  # TypeError!
\`\`\`

**3. 函数多返回值**：\`return a, b\` 实际返回的就是元组。Python 没有"多返回值"语法，靠元组巧妙实现了这个效果。

### 元组能做什么

索引、切片、遍历、\`len\`、\`in\`、\`count\`、\`index\`、\`max/min/sum\` 都和列表一样。只是不能改：

\`\`\`python
t = (1, 2, 3)
t[0] = 9    # 报错！TypeError: 'tuple' object does not support item assignment
\`\`\`

⚠️ 注意：元组的"不可变"指的是元素不能增删改，但如果元素本身是可变的（比如列表），那个元素内部还能改：

\`\`\`python
t = (1, [2, 3], 4)
t[1].append(99)    # 这个能行！改的是里面的列表，不是元组本身
print(t)           # (1, [2, 3, 99], 4)
t[1] = [9]         # 这个不行！这是改元组的元素
\`\`\`

### 解包（unpacking）：元组的杀手锏

元组（和列表）可以"拆开"赋值给多个变量，这叫**解包**：

\`\`\`python
point = (3, 4)
x, y = point       # x=3, y=4
a, b, c = 1, 2, 3  # 其实右边是元组
\`\`\`

生活类比：解包像拆快递——一个包裹（元组）里装了三件东西，你把它们分别放到三个抽屉（变量）里。

#### 用 \`*\` 收集多余的

\`\`\`python
first, *rest = [1, 2, 3, 4]   # first=1, rest=[2,3,4]
a, *b, c = [1, 2, 3, 4, 5]   # a=1, b=[2,3,4], c=5
\`\`\`

\`*\` 像"剩下的都给我装进这个袋子"。注意：收集起来的是**列表**，不是元组。

### 交换变量的真相

还记得这个神奇写法吗？

\`\`\`python
a, b = b, a
\`\`\`

这就是元组解包！右边 \`b, a\` 先组成元组 \`(b, a)\`，再解包给左边的 \`a, b\`。整个过程不需要临时变量，Python 内部帮你搞定。在其他语言里交换两个变量得用 temp：

\`\`\`python
# 其他语言的写法
temp = a
a = b
b = temp

# Python 利用元组解包，一行搞定
a, b = b, a
\`\`\`

### 元组 vs 列表 对比

| 特性 | 列表 | 元组 |
|---|---|---|
| 可变性 | 可变 | 不可变 |
| 创建语法 | \`[1, 2]\` | \`(1, 2)\` 或 \`1, 2\` |
| 能增删改 | 能 | 不能 |
| 当字典 key | 不能 | 能（元素也要不可变）|
| 性能 | 稍慢 | 稍快（创建快、占用少）|
| 适用场景 | 数据会变 | 数据不变、当 key、多返回值 |

### 元组的常见使用场景

\`\`\`python
# 1. 多返回值
def min_max(nums):
    return min(nums), max(nums)   # 返回元组
low, high = min_max([3, 1, 4, 1, 5])

# 2. 同时遍历键值对
students = [("小明", 90), ("小红", 85)]
for name, score in students:    # 直接解包
    print(name, score)

# 3. 坐标、颜色等不可变数据
RGB_RED = (255, 0, 0)
BEIJING = (39.9, 116.4)
\`\`\`

### 小结

- 元组 = 不可变的列表，创建后不能增删改
- 单元素元组必须加逗号：\`(1,)\`，否则只是数字
- 元组能当字典 key、能放集合里（列表不行）
- 解包是元组的核心技能，交换变量、多返回值都靠它
- 元组的"不可变"是浅层的，元素本身可变的话内部还能改

### 常见疑问 Q&A

**Q1：什么时候用元组，什么时候用列表？**
A：数据会变用列表，数据不变用元组。坐标、颜色、配置这类"定死"的数据用元组更安全。

**Q2：元组能遍历吗？**
A：能，和列表一模一样：\`for x in t:\`。

**Q3：\`(1)\` 为什么不是元组？**
A：因为括号在 Python 里有两个作用：元组标记 和 数学优先级。\`(1)\` 被当成数学括号，所以是 1。加逗号 \`(1,)\` 才明确是元组。

**Q4：元组性能比列表好吗？**
A：创建稍快、占用内存稍少，但日常使用差别不大。选元组主要是为了安全和能当 key，不是为了性能。

**Q5：元组里有列表，列表能改吗？**
A：能。元组不可变指的是"指向的元素不能换"，但元素自身如果是可变对象，内部可以改。

### 本章 demo

demo 演示元组的创建、不可变、解包、当字典 key。`,
    code: `# ============================================
# 第 12 章：元组
# ============================================

# --- 1. 创建 ---
print("=== 1. 创建 ===")
t1 = (1, 2, 3)
t2 = 1, 2, 3           # 括号可省略
t3 = ()                # 空元组
t4 = (1,)              # 单元素，逗号必须有！
not_tuple = (1)        # 这只是数字1，不是元组
print(f"t1 = {t1}, 类型 {type(t1)}")
print(f"t2 = {t2}")
print(f"t4 = {t4}, 类型 {type(t4)}")
print(f"not_tuple = {not_tuple}, 类型 {type(not_tuple)}  ← 没逗号就是普通数字")

# --- 2. 索引切片（和列表一样）---
print("\\n=== 2. 索引切片 ===")
t = ("a", "b", "c", "d")
print(f"t = {t}")
print(f"t[0] = {t[0]}, t[-1] = {t[-1]}")
print(f"t[1:3] = {t[1:3]}")
print(f"len(t) = {len(t)}")

# --- 3. 不可变 ---
print("\\n=== 3. 不可变 ===")
# t[0] = "x"  # 会报 TypeError
print("元组不能改元素，但可以'重新赋值'整个变量")
t = ("x",) + t[1:]     # 造一个新的
print(f"重新赋值后: {t}")

# --- 4. 解包 ---
print("\\n=== 4. 解包 ===")
point = (3, 4)
x, y = point
print(f"point={point} → x={x}, y={y}")

a, b, c = 1, 2, 3      # 右边其实是元组
print(f"a={a}, b={b}, c={c}")

# 用 * 收集多余的
first, *rest = [1, 2, 3, 4]
print(f"first={first}, rest={rest}")
a, *middle, c = [1, 2, 3, 4, 5]
print(f"a={a}, middle={middle}, c={c}")

# --- 5. 元组当字典 key（列表不行！）---
print("\\n=== 5. 元组当 key ===")
# 用坐标存城市名
cities = {(39, 116): "北京", (31, 121): "上海", (23, 113): "广州"}
print(f"cities = {cities}")
print(f"(39,116) 对应: {cities[(39, 116)]}")
# 列表不能当 key，因为它可变
# cities = {[]: "x"}  # 报 TypeError

# --- 6. 函数多返回值 ---
print("\\n=== 6. 多返回值 ===")
def min_max(nums):
    return min(nums), max(nums)   # 返回的是元组
result = min_max([3, 1, 4, 1, 5, 9])
print(f"min_max 返回: {result}, 类型 {type(result)}")
low, high = min_max([3, 1, 4, 1, 5, 9])   # 直接解包
print(f"最小={low}, 最大={high}")

# --- 7. 遍历 ---
print("\\n=== 7. 遍历 ===")
students = [("小明", 90), ("小红", 85), ("小刚", 92)]
for name, score in students:    # 直接解包
    print(f"  {name}: {score}分")`
  },

  // -----------------------------------------------------------
  // 第 13 章：字典
  // -----------------------------------------------------------
  {
    id: "py9-13",
    group: "数据：Python 里的东西",
    icon: "🗂️",
    title: "字典：键值对的魔法",
    content: `## 字典：键值对的魔法容器

前面我们学了列表——用"下标"找东西，0 号、1 号、2 号。但下标是数字，很多时候不够用。比如你想存一个人的信息：姓名、年龄、城市，用 \`person[0]\`、\`person[1]\`、\`person[2]\` 来取，过几天自己都忘了 0 是啥。

我们想要的是：用**有意义的名字**去取值，比如 \`person["name"]\`、\`person["age"]\`。这就是**字典（dict）**——用"键"找"值"。

### 字典是什么

字典存的是**键值对**，像一本真正的词典——用"词"查"解释"。

\`\`\`python
person = {"name": "小明", "age": 18, "city": "北京"}
person["name"]    # '小明'，用键查值
\`\`\`

生活类比：列表像一排编号的抽屉（0号、1号…），字典像一本通讯录（按名字查电话）。

字典的四个核心特点：
- **键**必须唯一，且不可变（字符串、数字、元组都行，列表不行）
- **值**随便，什么类型都行，可重复
- 字典**可变**，能增删改
- Python 3.7+ 字典**保持插入顺序**（早先版本不保证顺序）

⚠️ 键重复会怎样？后写的覆盖先写的：

\`\`\`python
d = {"a": 1, "a": 2}   # d = {"a": 2}，前面那个被覆盖
\`\`\`

### 增删改查

\`\`\`python
d = {}
d["name"] = "小明"      # 增：键不存在就是新增
d["age"] = 18
d["age"] = 20           # 改：键存在就是修改
del d["age"]            # 删
d.get("name")           # 查（推荐）
\`\`\`

记住一个规律：**用 \`d[key]\` 赋值时，键不存在就新增，键存在就修改**。这一个操作干了"增"和"改"两件事。

#### get 的好处

直接用 \`d[key]\` 查找，键不存在会报错。但 \`get\` 不会：

\`\`\`python
d["xxx"]        # 键不存在会报 KeyError，程序崩！
d.get("xxx")    # 不存在返回 None，不报错
d.get("xxx", "默认值")  # 不存在返回"默认值"
\`\`\`

⚠️ 这是新手常踩的坑：用 \`d[key]\` 取不存在的键，程序直接 KeyError 崩溃。养成习惯：不确定键存不存在就用 \`get\`。

生活类比：\`d[key]\` 像查通讯录没找到就摔手机报错，\`get\` 像查不到就心平气和说"没这个人"。

### 遍历

\`\`\`python
for key in d:                    # 遍历键
for key in d.keys():             # 同上
for value in d.values():         # 遍历值
for key, value in d.items():     # 遍历键值对（最常用）
\`\`\`

最常用的是 \`d.items()\`——一次拿到键和值，写起来最爽：

\`\`\`python
scores = {"语文": 90, "数学": 85}
for subject, score in scores.items():
    print(f"{subject}: {score}分")
\`\`\`

⚠️ 新手常犯的错：想取值却遍历键，写成 \`for key in d: print(d[key])\`。能用 items 就别这么绕。

### 常用方法

\`\`\`python
d.keys()        # 所有键
d.values()      # 所有值
d.items()       # 所有键值对
d.update(另一个字典)  # 合并
d.pop(key)      # 删除并返回
\`\`\`

注意 \`keys()\`、\`values()\`、\`items()\` 返回的不是列表，是"视图对象"。要当列表用得套一层 \`list()\`：\`list(d.keys())\`。

\`update\` 是合并字典，相同键会被新字典的覆盖：

\`\`\`python
d1 = {"a": 1, "b": 2}
d2 = {"b": 3, "c": 4}
d1.update(d2)   # d1 = {"a": 1, "b": 3, "c": 4}，b 被覆盖
\`\`\`

### 字典 vs 列表

| | 列表 | 字典 |
|---|---|---|
| 查找方式 | 按下标 | 按键 |
| 查找速度 | 慢（要遍历） | 快（哈希，瞬间）|
| 有序 | 是 | 是（3.7+）|
| 适合 | 有序数据 | 映射关系 |
| 键/下标类型 | 整数 | 任何不可变类型 |

字典查找为什么快？因为它底层用"哈希表"——给每个键算一个"地址"，存的时候按地址放，取的时候按地址直接拿，不用从头找。就像图书馆按书号分区放，找书直接去对应区，不用一本本翻。

### 嵌套字典：表示复杂结构

字典的值可以是任何类型，包括另一个字典。这就让你能表示复杂的数据：

\`\`\`python
students = {
    "小明": {"age": 18, "scores": [90, 85, 88]},
    "小红": {"age": 19, "scores": [95, 92, 90]},
}
students["小明"]["scores"][1]   # 小明的第二个分数：85
\`\`\`

这种"字典套字典套列表"的结构在处理 JSON、配置文件时非常常见。逐层往下取就行，像剥洋葱。

### 经典应用：词频统计

字典最经典的用法是"计数"。统计一串东西里每个出现了几次：

\`\`\`python
words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
count = {}
for w in words:
    count[w] = count.get(w, 0) + 1    # 不存在当0，+1
# count = {"apple": 3, "banana": 2, "cherry": 1}
\`\`\`

这个 \`count.get(w, 0) + 1\` 是精髓：如果 w 没出现过，get 返回 0，加 1 变 1；如果出现过，get 返回当前次数，加 1。一行搞定计数逻辑。

### 成员判断

\`\`\`python
"name" in d   # 判断键是否存在（注意：是判断键，不是值！）
\`\`\`

⚠️ 新手常以为 \`in\` 是判断值，其实判断的是**键**。要判断值在不在，得用 \`"小明" in d.values()\`。

### 小结

- 字典用键找值，键必须唯一且不可变
- \`d[key] = v\`：键不存在就增，存在就改
- 不确定键存不存在就用 \`get\`，避免 KeyError
- 遍历键值对用 \`d.items()\`，最常用
- 字典查找快（哈希），适合映射关系
- 词频统计是经典应用，\`get(w, 0) + 1\` 记住

### 常见疑问 Q&A

**Q1：字典的键能用列表吗？**
A：不能。键必须不可变（要能算哈希）。用元组代替列表当键。

**Q2：字典有序吗？**
A：Python 3.7+ 有序（按插入顺序）。但老代码别依赖顺序，3.6 之前不保证。

**Q3：\`in\` 判断的是键还是值？**
A：判断键。要判断值用 \`v in d.values()\`。

**Q4：怎么按值排序字典？**
A：\`sorted(d.items(), key=lambda x: x[1])\`，返回的是列表不是字典。

**Q5：嵌套字典怎么取值？**
A：一层层往下取：\`d["小明"]["scores"][0]\`。像剥洋葱。

### 本章 demo

demo 演示增删改查、get、遍历、嵌套字典。`,
    code: `# ============================================
# 第 13 章：字典
# ============================================

# --- 1. 创建 ---
print("=== 1. 创建 ===")
person = {"name": "小明", "age": 18, "city": "北京"}
print(f"person = {person}")
empty = {}                      # 空字典
print(f"空字典: {empty}")
# 用 dict() 构造
d = dict(name="小红", age=20)
print(f"dict()构造: {d}")

# --- 2. 增删改查 ---
print("\\n=== 2. 增删改查 ===")
d = {"name": "小明"}
print(f"初始: {d}")
d["age"] = 18                   # 增
print(f"d['age']=18: {d}")
d["age"] = 20                   # 改（键已存在）
print(f"d['age']=20: {d}")
print(f"查 d['name'] = {d['name']}")

# get 的好处
print(f"\\nd.get('name') = {d.get('name')}")
print(f"d.get('xxx') = {d.get('xxx')}          ← 不存在返回None")
print(f"d.get('xxx', '默认') = {d.get('xxx', '默认')}  ← 不存在返回默认值")
# d['xxx']  # 这会报 KeyError

del d["age"]
print(f"del d['age'] 后: {d}")

# --- 3. 遍历 ---
print("\\n=== 3. 遍历 ===")
scores = {"语文": 90, "数学": 85, "英语": 95}
print("遍历键:")
for k in scores:
    print(f"  {k}", end=" ")
print()
print("遍历值:")
for v in scores.values():
    print(f"  {v}", end=" ")
print()
print("遍历键值对:")
for subject, score in scores.items():
    print(f"  {subject}: {score}分")

# --- 4. 常用方法 ---
print("\\n=== 4. 常用方法 ===")
d1 = {"a": 1, "b": 2}
d2 = {"b": 3, "c": 4}
d1.update(d2)                   # 合并，相同键被覆盖
print(f"d1.update(d2) = {d1}    ← b被覆盖，c新增")
popped = d1.pop("a")            # 删除并返回
print(f"pop('a')={popped}, d1={d1}")
print(f"keys: {list(d1.keys())}")
print(f"values: {list(d1.values())}")

# --- 5. 成员判断 ---
print("\\n=== 5. 成员判断 ===")
print(f"'a' in d1: {'a' in d1}    ← 判断键是否存在（不是值！）")
print(f"'c' in d1: {'c' in d1}")

# --- 6. 嵌套字典 ---
print("\\n=== 6. 嵌套字典 ===")
students = {
    "小明": {"age": 18, "scores": [90, 85, 88]},
    "小红": {"age": 19, "scores": [95, 92, 90]},
}
print(f"students = {students}")
print(f"小明的年龄: {students['小明']['age']}")
print(f"小红的数学: {students['小红']['scores'][1]}")
# 遍历
for name, info in students.items():
    avg = sum(info["scores"]) / len(info["scores"])
    print(f"  {name}: 平均{avg:.1f}")

# --- 7. 统计词频（经典应用）---
print("\\n=== 7. 词频统计 ===")
words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
count = {}
for w in words:
    count[w] = count.get(w, 0) + 1    # 不存在当0，+1
print(f"词频: {count}")
print(f"apple 出现 {count['apple']} 次")`
  },

  // -----------------------------------------------------------
  // 第 14 章：集合
  // -----------------------------------------------------------
  {
    id: "py9-14",
    group: "数据：Python 里的东西",
    icon: "🧮",
    title: "集合：去重与集合运算",
    content: `## 集合：去重与集合运算的利器

你有没有遇到过这种情况：一个列表里有一堆数据，但里面有重复的，你想去掉重复的？或者你想知道"两个列表有哪些共同的元素"、"哪些只在 A 里不在 B 里"？

这些需求用列表做得很费劲（要写循环一个个比对），但用**集合（set）**就是一行代码的事。

### 集合是什么

集合像字典的"键的集合"——**元素唯一、无序**。你可以把它理解成"只存键不存值的字典"。

\`\`\`python
s = {1, 2, 3}
s = set([1, 2, 2, 3])   # 从列表建，自动去重 → {1, 2, 3}
\`\`\`

两个核心特性：
- **去重**：放进去重复的自动没了
- **无序**：没有下标，不能 \`s[0]\`

生活类比：集合像一个"会员俱乐部"——每个人只能进一次（去重），但俱乐部不按编号排座位（无序），你只能问"某人在不在俱乐部"，不能问"3 号是谁"。

⚠️ 空集合必须用 \`set()\` 创建，不能用 \`{}\`——因为 \`{}\` 是空字典！

\`\`\`python
empty_set = set()      # 空集合
empty_dict = {}        # 这是空字典，不是空集合！
\`\`\`

### 什么时候用集合

集合有三大用途：

**1. 去重**：把列表变集合再变回来，重复就没了

\`\`\`python
nums = [1, 2, 2, 3, 3, 3, 4]
unique = list(set(nums))   # [1, 2, 3, 4]
\`\`\`

⚠️ 注意：因为集合无序，去重后顺序可能变了。要保持原顺序得用别的办法（比如 \`dict.fromkeys\`）。

**2. 判断成员**：\`x in set\` 比在列表里快得多

\`\`\`python
9999 in big_list   # 列表要遍历，慢
9999 in big_set    # 集合哈希，瞬间
\`\`\`

为什么集合快？因为集合和字典一样底层是哈希表，查一个元素不用从头扫到尾，直接算地址定位。数据量大时差距非常明显。

**3. 集合运算**：交集、并集、差集——这是集合的"看家本领"。

### 增删

\`\`\`python
s.add(x)       # 加
s.remove(x)    # 删，不存在报错
s.discard(x)   # 删，不存在不报错（推荐）
s.pop()        # 随机删一个
\`\`\`

⚠️ \`remove\` 和 \`discard\` 的区别：元素不存在时，\`remove\` 报错，\`discard\` 不报错。日常用 \`discard\` 更安全，省得先判断存不存在。

\`pop\` 是"随机删一个"——因为集合无序，没有"第一个"的概念，所以删的也是随机的。

### 集合运算：集合的灵魂

这是集合最强大的功能。回忆一下小学数学的集合运算，Python 全支持：

\`\`\`python
a = {1, 2, 3}
b = {3, 4, 5}
a | b    # 并集 {1,2,3,4,5}   ← 两边合起来
a & b    # 交集 {3}           ← 两边都有的
a - b    # 差集 {1,2}         ← a有b没有
a ^ b    # 对称差 {1,2,4,5}   ← 只在一边的
\`\`\`

生活类比：
- 并集 \`|\`：两个班的所有学生合一起
- 交集 \`&\`：既报了数学又报了英语的学生
- 差集 \`-\`：报了数学但没报英语的学生
- 对称差 \`^\`：只报了一门的学生

这些运算符还能写成方法形式：\`a.union(b)\`、\`a.intersection(b)\`、\`a.difference(b)\`、\`a.symmetric_difference(b)\`。运算符简洁，方法名清楚，看你喜欢。

#### 子集和超集

\`\`\`python
big = {1, 2, 3, 4, 5}
small = {1, 2, 3}
small <= big    # True，small 是 big 的子集
big >= small    # True，big 是 small 的超集
small < big     # True，真子集（不等于）
\`\`\`

### 集合运算的实战例子

**找两个列表的共同元素：**

\`\`\`python
list_a = ["apple", "banana", "cherry"]
list_b = ["banana", "cherry", "date"]
common = set(list_a) & set(list_b)   # {"banana", "cherry"}
\`\`\`

如果用列表写，得双重循环一个个比，又慢又丑。用集合一行搞定。

**找只在 A 不在 B 的：**

\`\`\`python
only_a = set(list_a) - set(list_b)   # {"apple"}
\`\`\`

### 不可变集合 frozenset

普通 set 可变，不能当字典 key（原理和列表一样：可变对象哈希值会变）。\`frozenset\` 不可变，可以。

\`\`\`python
fs = frozenset([1, 2, 3])
d = {fs: "value"}   # frozenset 能当 key
\`\`\`

日常用得少，知道有这东西就行。

### 集合 vs 列表 vs 字典

| 特性 | 列表 | 集合 | 字典 |
|---|---|---|---|
| 元素唯一 | 否 | 是 | 键唯一 |
| 有序 | 是 | 否 | 是（3.7+）|
| 有下标 | 是 | 否 | 否（按键）|
| 成员判断速度 | 慢 | 快 | 快 |
| 主要用途 | 有序数据 | 去重、集合运算 | 映射关系 |

### 小结

- 集合元素唯一、无序，最适合去重和集合运算
- 空集合用 \`set()\`，不能用 \`{}\`
- 删除用 \`discard\` 比 \`remove\` 安全（不存在不报错）
- 集合运算 \`| & - ^\` 是看家本领，一行搞定列表要写循环的事
- \`x in set\` 比 \`x in list\` 快得多，大数据量判断成员优先用集合

### 常见疑问 Q&A

**Q1：集合能排序吗？**
A：集合本身无序，但可以 \`sorted(s)\` 返回排好序的列表。

**Q2：去重后顺序会变吗？**
A：会。集合无序，去重不保证顺序。要保持顺序用 \`list(dict.fromkeys(lst))\`。

**Q3：\`remove\` 和 \`discard\` 用哪个？**
A：不确定元素在不在就用 \`discard\`（不报错）；确定在就用 \`remove\`（不存在会报错，能帮你发现 bug）。

**Q4：集合能放列表吗？**
A：不能。集合元素必须不可变（要能算哈希）。要放"一组数据"用元组。

**Q5：并集运算 \`|\` 和 \`union()\` 有区别吗？**
A：功能一样。但 \`|\` 要求两边都是集合，\`union()\` 能接受任何可迭代对象（比如列表）。

### 本章 demo

demo 演示去重、成员判断、集合运算。`,
    code: `# ============================================
# 第 14 章：集合
# ============================================

# --- 1. 创建和去重 ---
print("=== 1. 创建和去重 ===")
s1 = {1, 2, 3, 3, 2, 1}        # 重复自动去掉
print(f"s1 = {s1}")
nums = [1, 2, 2, 3, 3, 3, 4]
s2 = set(nums)
print(f"set({nums}) = {s2}    ← 去重")
unique = list(set(nums))       # 列表去重常用法
print(f"去重回列表: {unique}")
empty = set()                   # 空集合必须用 set()，{} 是空字典
print(f"空集合: {empty}, 类型 {type(empty)}")

# --- 2. 无序，无下标 ---
print("\\n=== 2. 无序无下标 ===")
s = {"a", "b", "c"}
# s[0]  # 报错！集合没有下标
print("集合不能 s[0]，但能遍历:")
for x in s:
    print(f"  {x}", end=" ")
print()

# --- 3. 增删 ---
print("\\n=== 3. 增删 ===")
s = {1, 2, 3}
s.add(4)
print(f"add(4): {s}")
s.add(1)                       # 已存在，无变化
print(f"add(1) 已存在: {s}")
s.discard(2)
print(f"discard(2): {s}")
s.discard(99)                  # 不存在也不报错
print(f"discard(99) 不存在: {s}")
# s.remove(99)  # 不存在会报 KeyError

# --- 4. 成员判断（集合比列表快得多）---
print("\\n=== 4. 成员判断 ===")
big_list = list(range(10000))
big_set = set(big_list)
print(f"9999 in list: {9999 in big_list}    ← 列表要遍历")
print(f"9999 in set : {9999 in big_set}    ← 集合哈希，瞬间")

# --- 5. 集合运算 ---
print("\\n=== 5. 集合运算 ===")
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
print(f"a = {a}, b = {b}")
print(f"a | b 并集 = {a | b}")
print(f"a & b 交集 = {a & b}")
print(f"a - b 差集 = {a - b}    ← a有b没有")
print(f"a ^ b 对称差 = {a ^ b}    ← 只在一边的")
# 方法形式
print(f"a.union(b) = {a.union(b)}")
print(f"a.intersection(b) = {a.intersection(b)}")

# --- 6. 子集超集 ---
print("\\n=== 6. 子集超集 ===")
big = {1, 2, 3, 4, 5}
small = {1, 2, 3}
print(f"small ⊆ big? {small <= big}    ← small是big的子集")
print(f"big ⊇ small? {big >= small}    ← big是small的超集")
print(f"small ⊂ big (真子集)? {small < big}")

# --- 7. 实用例子 ---
print("\\n=== 7. 实用例子 ===")
# 找两个列表的共同元素
list_a = ["apple", "banana", "cherry"]
list_b = ["banana", "cherry", "date", "fig"]
common = set(list_a) & set(list_b)
print(f"两个列表共同元素: {common}")
# 找只在a里不在b里的
only_a = set(list_a) - set(list_b)
print(f"只在a里: {only_a}")`
  },

  // -----------------------------------------------------------
  // 第 15 章：if 判断
  // -----------------------------------------------------------
  {
    id: "py9-15",
    group: "流程：判断与重复",
    icon: "🔀",
    title: "if 判断：程序的分岔路口",
    content: `## if 判断：让程序学会"看情况"

前面我们写的代码都是"从头到尾一条线"——每一行都执行，按顺序走。但真实世界的程序不是这样，它要"看情况"：年龄够才让进、分数够才及格、有票才让上车。这种"看情况做不同事"的能力，就靠 \`if\`。

### if 的基本语法

\`\`\`python
age = 20
if age >= 18:
    print("成年")
\`\`\`

\`if\` 后面跟一个**条件**（结果是布尔值 True/False），条件为真就执行缩进的代码块。

生活类比：\`if\` 像地铁闸机——"刷卡成功（条件真）就开门让你过（执行代码）"，否则就拦着。

Python 用**缩进**（4 个空格）表示代码块，不用大括号 \`{}\`。这是 Python 的特色，也是新手第一个要适应的点。缩进结束就表示这个代码块结束。

### if / elif / else：多选一

很多时候不止两种情况。比如成绩分级：优秀、良好、及格、不及格。这时用 \`elif\`：

\`\`\`python
score = 85
if score >= 90:
    print("优秀")
elif score >= 80:
    print("良好")
elif score >= 60:
    print("及格")
else:
    print("不及格")
\`\`\`

要点：
- 从上往下判断，**命中一个就停止**，后面的不再看
- \`elif\` 是 \`else if\` 的缩写（别的语言写成 else if，Python 简写成 elif）
- \`else\` 是"以上都不满足"的兜底，可选
- 每个分支后跟**缩进的代码块**

⚠️ 新手常犯的错：以为每个条件都会判断。其实一旦命中某个分支，后面的就不看了。所以判断顺序很重要——把严格的条件放前面。

为什么顺序重要？看这个反面教材：

\`\`\`python
score = 85
if score >= 60:        # 85 命中了"及格"
    print("及格")      # 输出"及格"，后面都不看了
elif score >= 80:      # 这行根本不会执行
    print("良好")
\`\`\`

所以要把"高门槛"放前面：\`>= 90\` 在 \`>= 80\` 前，\`>= 80\` 在 \`>= 60\` 前。

### 嵌套 if

if 里还能再套 if，表示"满足 A 的前提下，再判断 B"：

\`\`\`python
if age >= 18:
    if has_id:
        print("可以进")
    else:
        print("没带身份证")
\`\`\`

⚠️ 但**别嵌套太深**，超过 3 层就该重构了。嵌套太深代码会变成"楔形"，难读难改。很多嵌套可以用 \`and\` 或者提前 return 来扁平化。

### 多条件组合：and / or / not

\`\`\`python
if age >= 18 and has_ticket:    # 两个都满足
    print("可以入场")
if has_car or has_bike:         # 满足一个就行
    print("有交通工具")
if not is_vip:                  # 取反
    print("不是会员")
\`\`\`

生活类比：
- \`and\` 像"既要…又要…"，两个条件缺一不可
- \`or\` 像"要么…要么…"，满足一个就行
- \`not\` 像"不"，把真变假、假变真

### 链式比较：Python 的贴心语法

判断一个分数在 0-100 之间，很多语言得写 \`score >= 0 and score <= 100\`。Python 支持链式比较，更直观：

\`\`\`python
if 0 <= score <= 100:    # 正确，像数学写法
    print("合法分数")
\`\`\`

⚠️ 别写成 \`if 0 <= score and <= 100\`——这是语法错误！\`and\` 两边都要是完整的条件。

### 条件表达式（三元运算符）：一行二选一

简单的二选一可以写成一行：

\`\`\`python
result = "及格" if score >= 60 else "不及格"
\`\`\`

读起来像英语："result 是'及格' 如果 分数>=60 否则 '不及格'"。

这个比完整的 if/else 紧凑，但**只适合简单的赋值**。逻辑复杂就别硬塞，老老实实写 if/else。

还能用在 f-string 里：

\`\`\`python
n = 7
print(f"{n} 是{'偶数' if n % 2 == 0 else '奇数'}")
\`\`\`

### 判断"空"：Python 的真值规则

Python 里很多值会被当作"假"：\`False\`、\`0\`、\`""\`（空字符串）、\`[]\`（空列表）、\`{}\`（空字典）、\`None\`。其他都是"真"。

所以判断"列表是不是空"不用写 \`len(lst) > 0\`，直接写：

\`\`\`python
if items:        # 列表非空就是真
    print("有东西")
else:
    print("空")
\`\`\`

这种写法叫"Pythonic"，是社区推荐的风格。

### 真值规则表

| 值 | 当作 |
|---|---|
| \`True\`, 非零数字, 非空字符串/列表/字典 | True |
| \`False\`, \`0\`, \`""\`, \`[]\`, \`{}\`, \`None\` | False |

### 小结

- \`if/elif/else\` 从上往下判断，命中一个就停，顺序很重要
- 用缩进表示代码块，4 个空格
- 多条件用 \`and/or/not\` 组合
- 链式比较 \`0 <= x <= 100\` 是 Python 特色
- 三元表达式 \`a if cond else b\` 适合简单二选一
- 判空直接 \`if items:\`，不用 \`len > 0\`

### 常见疑问 Q&A

**Q1：elif 和 else if 一样吗？**
A：一样。Python 把 else if 简写成 elif，少打几个字。

**Q2：if 后面一定要跟 else 吗？**
A：不用。只有一个条件判断也行，else 是可选的。

**Q3：缩进用空格还是 Tab？**
A：用 4 个空格。Python 官方推荐，别混用空格和 Tab，会报错。

**Q4：为什么我的 \`if 0 < x < 100\` 能用，\`if x > 0 and < 100\` 不行？**
A：\`and\` 两边都要是完整条件，\`< 100\` 不是完整条件（缺左边）。用链式比较 \`0 < x < 100\`。

**Q5：嵌套 if 太深怎么办？**
A：用 \`and\` 合并条件，或者用"提前 return"（函数里不满足就 return）来减少嵌套。

### 本章 demo

demo 演示成绩分级、闰年判断、嵌套、三元。`,
    code: `# ============================================
# 第 15 章：if 判断
# ============================================

# --- 1. 基本 if ---
print("=== 1. 基本 if ===")
age = 20
if age >= 18:
    print(f"{age}岁，成年了")
if age < 18:
    print(f"{age}岁，未成年")    # 这行不会执行，因为age=20

# --- 2. if / elif / else ---
print("\\n=== 2. 成绩分级 ===")
score = 85
if score >= 90:
    grade = "优秀"
elif score >= 80:
    grade = "良好"
elif score >= 60:
    grade = "及格"
else:
    grade = "不及格"
print(f"分数{score} → {grade}")
# 测试多个分数
for s in [95, 82, 70, 45]:
    if s >= 90: g = "优秀"
    elif s >= 80: g = "良好"
    elif s >= 60: g = "及格"
    else: g = "不及格"
    print(f"  {s} → {g}")

# --- 3. 嵌套 if ---
print("\\n=== 3. 嵌套 if ===")
age = 25
has_id = True
if age >= 18:
    print("年龄达标")
    if has_id:
        print("带了身份证，可以进入")
    else:
        print("没带身份证，不能进入")
else:
    print("未成年，禁止进入")

# --- 4. 三元表达式 ---
print("\\n=== 4. 三元表达式 ===")
score = 55
result = "及格" if score >= 60 else "不及格"
print(f"{score}分: {result}")
# 用在 print 里
n = 7
print(f"{n} 是{'偶数' if n % 2 == 0 else '奇数'}")

# --- 5. 多条件组合 ---
print("\\n=== 5. 多条件 ===")
age = 25
has_ticket = True
# 必须成年 且 有票
if age >= 18 and has_ticket:
    print("可以入场")
else:
    print("不能入场")

# 链式比较
score = 85
if 80 <= score < 90:
    print("成绩在80-90之间")

# --- 6. 实用：闰年判断 ---
print("\\n=== 6. 闰年判断 ===")
def is_leap(year):
    # 能被4整除且不能被100整除，或能被400整除
    if year % 400 == 0:
        return True
    if year % 100 == 0:
        return False
    if year % 4 == 0:
        return True
    return False
for y in [2000, 2024, 2100, 2023]:
    print(f"  {y}年: {'闰年' if is_leap(y) else '平年'}")

# --- 7. if 判断空容器 ---
print("\\n=== 7. 判断空 ===")
items = []
if items:                      # 列表非空
    print("有物品")
else:
    print("空列表 ← []被当作假")

name = "小明"
if name:                       # 字符串非空
    print(f"名字是: {name}")`
  },

  // -----------------------------------------------------------
  // 第 16 章：while 循环
  // -----------------------------------------------------------
  {
    id: "py9-16",
    group: "流程：判断与重复",
    icon: "🔄",
    title: "while 循环：只要满足就继续",
    content: `## while 循环：只要满足就继续

计算机最擅长的事就是重复——让它算 1 加到 100，它不会傻乎乎写 100 行，而是用循环让一段代码重复执行。Python 有两种循环：\`while\` 和 \`for\`。这一章先讲 \`while\`。

### while 的基本语法

\`\`\`python
count = 0
while count < 3:
    print(count)
    count += 1
\`\`\`

\`while 条件:\` —— 条件为真就**一直执行**缩进块，条件变假就停。

生活类比：\`while\` 像"只要天没黑，就继续踢球"。每次踢之前先看天黑没，黑了就停，没黑就继续。

逐行分析上面这段：
1. \`count = 0\`：初始化计数器
2. \`while count < 3\`：检查条件，0 < 3 为真，进入循环
3. \`print(count)\`：打印 0
4. \`count += 1\`：count 变成 1
5. 回到第 2 步，1 < 3 为真，继续……
6. 直到 count 变成 3，3 < 3 为假，循环结束

### 关键：条件要能变假，否则死循环

循环体里**必须**改"条件涉及的变量"，否则条件永远为真，变成**死循环**——程序卡死，一直跑停不下来。

\`\`\`python
while True:          # 永远真
    print("卡死了")  # 一直打印，停不下来
\`\`\`

新手最常犯的死循环：忘了 \`count += 1\`。

\`\`\`python
count = 0
while count < 3:
    print(count)
    # 忘了 count += 1，count 永远是 0，永远 < 3
\`\`\`

⚠️ 如果你不小心写了死循环，在命令行按 \`Ctrl + C\` 能强制中断。

### break 和 continue：控制循环流程

有时候你想在循环中间"提前退出"或"跳过这一次"，就需要 \`break\` 和 \`continue\`。

\`\`\`python
while True:
    n = 某个值
    if n == 0:
        break       # 直接跳出整个循环
    if n < 0:
        continue    # 跳过本次，进入下一次
\`\`\`

- \`break\`：**彻底跳出**整个循环，后面的代码不执行了，循环结束
- \`continue\`：**跳过本次**剩下的代码，直接进入下一次循环（条件还得判断）

生活类比：
- \`break\` 像看电影看到一半发现很烂，直接走人（不看了）
- \`continue\` 像看连续剧跳过片头曲（这一集跳过开头，继续看下一集）

⚠️ 用 continue 时要小心：如果 continue 在 \`count += 1\` 之前，那这次自增就跳过了，可能又死循环。

### while 适合什么场景

while 适合"不确定次数"或"基于条件"的循环：

- **不确定次数**：比如"用户一直输入直到输入 quit"——你不知道用户会输几次
- **基于条件**：比如"一直找直到找到目标"——找到就停，不知道要找几轮
- **数值逼近**：比如"不断逼近直到误差足够小"

确定次数的遍历用 \`for\`（下一章）更合适、更简洁。

\`\`\`python
# 适合 while：不确定次数
while user_input != "quit":
    user_input = input("请输入：")

# 适合 for：确定次数
for i in range(10):
    print(i)
\`\`\`

### while 的经典用法

#### 1. 计数循环

\`\`\`python
count = 0
while count < 5:
    print(count)
    count += 1
\`\`\`

#### 2. 累加

\`\`\`python
total = 0
i = 1
while i <= 100:
    total += i
    i += 1
# total = 5050
\`\`\`

#### 3. while True + break（最常用模式）

不确定什么时候停，就用 \`while True\` 开头，里面用 \`break\` 退出：

\`\`\`python
while True:
    cmd = input("输入命令：")
    if cmd == "quit":
        break
    print(f"执行：{cmd}")
\`\`\`

这种写法很常见，比"先读一次再循环"简洁。

#### 4. 数位拆分

while 适合"不断操作直到某条件"的场景。比如把一个数的各位数字拆出来：

\`\`\`python
num = 12345
while num > 0:
    digit = num % 10    # 取个位
    print(digit)
    num = num // 10     # 去掉个位
# 输出 5 4 3 2 1
\`\`\`

### 嵌套循环

while 里还能套 while，比如打印九九乘法表。外层控制行，内层控制列。

⚠️ 嵌套循环时，内层循环的条件变量每次都要重置，否则第二次外层循环时内层条件已经不满足了。

\`\`\`python
i = 1
while i <= 9:
    j = 1                # 每次外层循环开始，j 都要重置！
    while j <= i:
        print(f"{j}×{i}={i*j}", end=" ")
        j += 1
    print()
    i += 1
\`\`\`

### while vs for 对比

| | while | for |
|---|---|---|
| 适用场景 | 不确定次数、基于条件 | 确定次数、遍历 |
| 条件控制 | 自己管理计数器 | range/可迭代对象自动 |
| 死循环风险 | 高（容易忘改条件）| 低（遍历完就停）|
| 代码简洁度 | 稍啰嗦 | 简洁 |

### 小结

- \`while 条件:\` 条件为真就一直执行，变假就停
- 循环体里必须改条件变量，否则死循环
- \`break\` 跳出整个循环，\`continue\` 跳过本次
- while 适合不确定次数的场景，\`while True + break\` 是常用模式
- 嵌套循环时内层条件变量每次要重置
- 确定次数用 for 更合适

### 常见疑问 Q&A

**Q1：while True 一定会死循环吗？**
A：不一定。里面如果有 break 就能退出。\`while True + break\` 是很常用的模式。

**Q2：break 和 continue 能用在 if 里吗？**
A：break/continue 只对**最近的循环**起作用，写在 if 里也只是"条件成立时 break/continue"，跳出的是循环不是 if。

**Q3：怎么跳出嵌套循环？**
A：break 只跳一层。要跳多层用标志位，或者把循环包成函数用 return。

**Q4：while 能遍历列表吗？**
A：能，但很别扭（要手动管下标）。遍历用 for 才是对的工具。

**Q5：死循环了怎么办？**
A：命令行按 \`Ctrl + C\` 强制中断。写代码时养成习惯：写 while 先想好"条件怎么变假"。

### 本章 demo

demo 演示计数循环、累加、break/continue、猜数字。`,
    code: `# ============================================
# 第 16 章：while 循环
# ============================================

# --- 1. 基本计数 ---
print("=== 1. 基本计数 ===")
count = 0
while count < 5:
    print(f"count = {count}")
    count += 1          # 关键！不然死循环
print("循环结束，count =", count)

# --- 2. 累加 ---
print("\\n=== 2. 累加 1+2+...+100 ===")
total = 0
i = 1
while i <= 100:
    total += i
    i += 1
print(f"1加到100 = {total}")

# --- 3. break 跳出 ---
print("\\n=== 3. break ===")
n = 0
while True:             # 看似死循环
    n += 1
    if n > 5:
        break           # 到6就跳出
    print(f"  n = {n}")
print(f"break 后 n = {n}")

# --- 4. continue 跳过 ---
print("\\n=== 4. continue（打印1-10的奇数）===")
n = 0
while n < 10:
    n += 1
    if n % 2 == 0:      # 偶数跳过
        continue
    print(f"  {n}", end=" ")
print()

# --- 5. 模拟用户输入（用固定值）---
print("\\n=== 5. 模拟输入直到quit ===")
inputs = ["hello", "world", "quit", "ignored"]
index = 0
while index < len(inputs):
    cmd = inputs[index]
    index += 1
    if cmd == "quit":
        print("收到quit，退出")
        break
    print(f"  处理: {cmd}")

# --- 6. 猜数字游戏 ---
print("\\n=== 6. 猜数字 ===")
target = 42
guesses = [10, 50, 42]
idx = 0
attempts = 0
while idx < len(guesses):
    guess = guesses[idx]
    idx += 1
    attempts += 1
    if guess < target:
        print(f"  猜{guess}，太小了")
    elif guess > target:
        print(f"  猜{guess}，太大了")
    else:
        print(f"  猜{guess}，对了！用了{attempts}次")
        break

# --- 7. 嵌套循环：九九乘法表 ---
print("\\n=== 7. 九九乘法表 ===")
i = 1
while i <= 9:
    j = 1
    row = ""
    while j <= i:
        row += f"{j}×{i}={i*j}\t"
        j += 1
    print(row)
    i += 1

# --- 8. 数位拆分 ---
print("\\n=== 8. 数位拆分 ===")
num = 12345
print(f"{num} 的各位数字:")
while num > 0:
    digit = num % 10        # 取个位
    print(f"  {digit}", end=" ")
    num = num // 10         # 去掉个位
print("（从个位开始）")`
  },

  // -----------------------------------------------------------
  // 第 17 章：for 循环
  // -----------------------------------------------------------
  {
    id: "py9-17",
    group: "流程：判断与重复",
    icon: "🔁",
    title: "for 循环：遍历一切可遍历",
    content: `## for 循环：遍历一切的利器

上一章的 \`while\` 适合"不确定次数"的循环。但大多数时候我们是知道要遍历什么的——遍历一个列表、遍历一个字符串、遍历数字 1 到 10。这种"逐个拿出来"的场景，\`for\` 循环比 while 简洁得多，也更常用。

### for 的基本语法

\`for\` 用来**遍历**一个"可迭代对象"（列表、字符串、字典、range 等），把每个元素拿出来一次。

\`\`\`python
for x in [1, 2, 3]:
    print(x)

for ch in "hello":
    print(ch)
\`\`\`

生活类比：\`for\` 像老师发卷子——把一摞卷子（列表）一张张发给同学，每张发完发下一张，发完为止。你不用数有几张，发完自动停。

这就是 for 比 while 优雅的地方：**不用自己管计数器，不用担心死循环**。遍历完自然就结束。

### range：生成数字序列

很多时候我们想"重复 n 次"或者"从 1 数到 10"，这时候用 \`range\`：

\`\`\`python
range(5)        # 0,1,2,3,4
range(2, 8)     # 2,3,4,5,6,7
range(0, 10, 2) # 0,2,4,6,8（步长2）
\`\`\`

注意 \`range(5)\` 是 0 到 4，**不包含 5**，和切片规则一致。这是 Python 的统一约定："左闭右开"。

\`\`\`python
for i in range(5):
    print(i)    # 0 1 2 3 4
\`\`\`

range 的三种用法：
- \`range(5)\`：从 0 到 4，共 5 个数
- \`range(2, 8)\`：从 2 到 7（不含 8）
- \`range(0, 10, 2)\`：从 0 到 8，步长 2（0,2,4,6,8）

⚠️ range 不会真的生成一个大列表，它是个"按需生成"的对象，省内存。所以 \`range(1000000)\` 不会占多少内存。

倒序用负步长：\`range(10, 0, -1)\` 得到 10,9,8,...,1。

### 遍历的几种姿势

这是 for 循环的重点，新手要熟练掌握。

#### 姿势一：只遍历元素

\`\`\`python
for x in lst:
    print(x)
\`\`\`

不需要下标时用这个，最简洁。

#### 姿势二：要下标（不推荐）

\`\`\`python
for i in range(len(lst)):
    print(i, lst[i])
\`\`\`

⚠️ 这种写法啰嗦又容易出错（下标算错）。除非真的需要下标，否则别这么写。

#### 姿势三：要下标+元素（推荐 enumerate）

\`\`\`python
for i, x in enumerate(lst):
    print(i, x)
\`\`\`

\`enumerate\` 同时给你下标和元素，干净利落。这是 Python 推荐的写法。

\`enumerate\` 还能指定起始下标：\`enumerate(lst, start=1)\` 从 1 开始数。

#### 姿势四：同时遍历两个（用 zip）

\`\`\`python
for a, b in zip(list1, list2):
    print(a, b)
\`\`\`

### zip：拉链

\`zip\` 像"拉拉链"——把两个序列的元素一对一配对：

\`\`\`python
names = ["小明", "小红"]
ages = [18, 19]
for name, age in zip(names, ages):
    print(name, age)
# 小明 18
# 小红 19
\`\`\`

⚠️ 长度不等时，zip 会按**短的**截断。比如一个有 3 个、一个有 5 个，配对 3 对就停。

生活类比：zip 像把两根绳子按长度短的那根剪齐，多出来的部分丢掉。

### 遍历字典

字典有几种遍历方式：

\`\`\`python
scores = {"语文": 90, "数学": 85}

# 遍历键（默认）
for subject in scores:
    print(subject)

# 遍历值
for score in scores.values():
    print(score)

# 遍历键值对（最常用）
for subject, score in scores.items():
    print(f"{subject}: {score}")
\`\`\`

最常用的是 \`d.items()\`——一次拿到键和值，写起来最爽。

### for 也能 break / continue

和 while 一样，for 里也能用 break（提前退出）和 continue（跳过本次）：

\`\`\`python
# 找第一个大于 85 的
for s in [78, 92, 85, 95]:
    if s > 85:
        print(f"找到: {s}")
        break

# 跳过偶数
for i in range(10):
    if i % 2 == 0:
        continue
    print(i)   # 只打印奇数
\`\`\`

### 嵌套循环

for 里套 for，最经典的是九九乘法表：

\`\`\`python
for i in range(1, 10):          # 外层：行
    for j in range(1, i + 1):   # 内层：列
        print(f"{j}×{i}={i*j}", end="\\t")
    print()                     # 换行
\`\`\`

外层每跑一次，内层跑一整轮。所以嵌套循环的总次数是"外层次数 × 内层次数"。

⚠️ 嵌套循环性能要注意：如果两个都是 1000 次，总共就是 100 万次。大数据量嵌套循环会很慢。

### 找素数：for + break 的经典应用

判断一个数是不是素数：从 2 试到它的平方根，找到因子就不是素数，break 退出。

\`\`\`python
for n in range(2, 100):
    is_prime = True
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            is_prime = False
            break
    if is_prime:
        print(n)
\`\`\`

为什么只试到平方根？因为如果 n 有因子 a，那 n = a × b，a 和 b 至少有一个 ≤ √n。试到平方根就够了，省一半时间。

### enumerate vs range(len) 对比

| | \`enumerate(lst)\` | \`range(len(lst))\` |
|---|---|---|
| 同时拿到 | 下标和元素 | 只有下标 |
| 代码 | 简洁 | 啰嗦 |
| 易错性 | 低 | 高（下标算错）|
| 推荐 | ⭐⭐⭐ | 不推荐 |

### 小结

- for 用来遍历可迭代对象，比 while 简洁，不会死循环
- \`range(n)\` 是 0 到 n-1，左闭右开
- 要下标+元素用 \`enumerate\`，别用 \`range(len)\`
- 同时遍历两个序列用 \`zip\`，按短的截断
- 遍历字典键值对用 \`d.items()\`
- 嵌套循环总次数 = 外层 × 内层，注意性能

### 常见疑问 Q&A

**Q1：range 生成的列表在哪？**
A：range 不是列表，是"按需生成"的对象。要列表得 \`list(range(5))\`。这样设计是为了省内存。

**Q2：for 能像 while 那样死循环吗？**
A：遍历有限的可迭代对象不会。但 \`for x in itertools.count()\` 这种无限迭代会，不过日常用不到。

**Q3：enumerate 的下标从 1 开始怎么办？**
A：\`enumerate(lst, start=1)\`。

**Q4：zip 长度不等怎么处理？**
A：默认按短的截断。要按长的（缺的填默认值）用 \`itertools.zip_longest\`。

**Q5：遍历时能修改列表吗？**
A：不建议。遍历时增删元素会导致下标错乱、跳过元素。要修改先复制一份遍历，或者收集要改的再统一改。

### 本章 demo

demo 演示 range、enumerate、zip、遍历字典、嵌套循环。`,
    code: `# ============================================
# 第 17 章：for 循环
# ============================================

# --- 1. 遍历列表和字符串 ---
print("=== 1. 遍历 ===")
for x in [10, 20, 30]:
    print(x, end=" ")
print()
for ch in "abc":
    print(ch, end="-")
print()

# --- 2. range ---
print("\\n=== 2. range ===")
print("range(5):", list(range(5)))
print("range(2,8):", list(range(2, 8)))
print("range(0,10,2):", list(range(0, 10, 2)))
print("range(10,0,-2):", list(range(10, 0, -2)))   # 倒序
# 累加
total = 0
for i in range(1, 11):
    total += i
print(f"1+2+...+10 = {total}")

# --- 3. enumerate 拿下标 ---
print("\\n=== 3. enumerate ===")
fruits = ["苹果", "香蕉", "橘子"]
for i, fruit in enumerate(fruits):
    print(f"  第{i}个: {fruit}")
# enumerate 还能指定起始下标
for i, fruit in enumerate(fruits, start=1):
    print(f"  {i}. {fruit}")

# --- 4. zip 同时遍历 ---
print("\\n=== 4. zip ===")
names = ["小明", "小红", "小刚"]
ages = [18, 19, 20]
for name, age in zip(names, ages):
    print(f"  {name} {age}岁")
# 长度不等，按短的截断
for a, b in zip([1, 2, 3], ["a", "b"]):
    print(f"  {a}-{b}")

# --- 5. 遍历字典 ---
print("\\n=== 5. 遍历字典 ===")
scores = {"语文": 90, "数学": 85, "英语": 95}
for subject in scores:              # 默认遍历键
    print(f"  {subject}: {scores[subject]}")
for subject, score in scores.items():
    print(f"  {subject}={score}", end=" ")
print()

# --- 6. break / continue ---
print("\\n=== 6. break/continue ===")
# 找第一个大于85的
for s in [78, 92, 85, 95]:
    if s > 85:
        print(f"  找到: {s}")
        break
# 跳过偶数
for i in range(10):
    if i % 2 == 0:
        continue
    print(f"  奇数: {i}", end=" ")
print()

# --- 7. 嵌套循环：乘法表 ---
print("\\n=== 7. 九九乘法表 ===")
for i in range(1, 10):
    for j in range(1, i + 1):
        print(f"{j}×{i}={i*j}", end="\t")
    print()

# --- 8. 找素数 ---
print("\\n=== 8. 找100以内素数 ===")
primes = []
for n in range(2, 100):
    is_prime = True
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            is_prime = False
            break
    if is_prime:
        primes.append(n)
print(f"100以内素数共{len(primes)}个:")
print(primes)`
  },

  // -----------------------------------------------------------
  // 第 18 章：循环 else 与控制
  // -----------------------------------------------------------
  {
    id: "py9-18",
    group: "流程：判断与重复",
    icon: "🎯",
    title: "break / continue / 循环 else",
    content: `## break / continue / 循环 else：精细控制循环

上一章我们简单提了 break 和 continue，这一章深入讲清楚它们的区别，以及 Python 一个比较特别的语法——循环 else。

### 复习 break 和 continue

- \`break\`：**彻底跳出**整个循环，循环结束
- \`continue\`：**跳过本次**剩下的代码，进入下一次循环

\`\`\`python
for i in range(10):
    if i == 5:
        break       # 到5就停，5不打印
    print(i)        # 打印 0 1 2 3 4

for i in range(10):
    if i == 5:
        continue    # 跳过5
    print(i)        # 打印 0 1 2 3 4 6 7 8 9
\`\`\`

生活类比再强化一下：
- \`break\` 像逛超市逛到一半家里打电话有事，直接结账走人（不逛了）
- \`continue\` 像逛超市看到某货架不感兴趣，跳过这个货架继续逛下一个

### break vs continue 对比

| | break | continue |
|---|---|---|
| 作用 | 跳出整个循环 | 跳过本次 |
| 循环是否继续 | 否，结束 | 是，进入下一次 |
| 后面代码执行 | 不执行 | 本次不执行，下次正常 |

⚠️ 新手常混淆：continue 不是"结束循环"，是"结束这一次"。循环还会继续。

### break 的典型用法：找东西

找到目标就停，不用继续找了：

\`\`\`python
# 找第一个能被7整除且个位是7的数
for n in range(10, 100):
    if n % 7 == 0 and n % 10 == 7:
        print(f"找到: {n}")
        break
\`\`\`

没有 break 的话，即使找到了也会继续遍历完整个范围，浪费。break 让你"见好就收"。

### continue 的典型用法：跳过不符合的

只处理符合条件的，跳过不符合的：

\`\`\`python
# 只处理奇数
for i in range(10):
    if i % 2 == 0:
        continue    # 偶数跳过
    print(i)        # 只打印奇数
\`\`\`

⚠️ 用 continue 时要小心：如果 continue 在自增语句之前，那这次自增就跳过了，可能死循环（在 while 里）。

### 循环 else：Python 特色（少用但要知道）

这是 Python 一个比较反直觉的语法。\`for\` / \`while\` 后面可以接 \`else\`，**循环正常结束（没 break）才执行**：

\`\`\`python
for n in range(2, 100):
    for i in range(2, n):
        if n % i == 0:
            break          # 找到因子，break
    else:
        print(n, "是素数")  # 内层没break，说明没因子
\`\`\`

这个 \`else\` 属于 \`for\`，不是 \`if\`。意思是"循环没被打断就执行"。

生活类比：循环 else 像保安巡逻——"如果巡逻一圈没发现异常（没 break），就报告一切正常（执行 else）；如果发现异常（break 了），就不报告"。

#### 为什么用 else 找素数很合适？

判断素数的逻辑是"试遍所有可能的因子，都没找到能整除的"。如果用普通写法得加个标志位：

\`\`\`python
for n in range(2, 20):
    is_prime = True
    for i in range(2, n):
        if n % i == 0:
            is_prime = False
            break
    if is_prime:
        print(f"{n} 是素数")
\`\`\`

用循环 else 省掉标志位：

\`\`\`python
for n in range(2, 20):
    for i in range(2, n):
        if n % i == 0:
            break
    else:
        print(f"{n} 是素数")   # 没 break 才执行
\`\`\`

⚠️ 这个语法很多人觉得反直觉——"else"这个词让人以为是"否则"，其实是"循环正常结束"。所以实际代码用得少，但读懂老代码需要。

### while 的 else

while 也有 else，规则一样：没 break 才执行。

\`\`\`python
n = 0
while n < 5:
    print(n)
    n += 1
else:
    print("正常结束")   # 会执行，因为没 break
\`\`\`

加了 break 就不执行 else：

\`\`\`python
n = 0
while n < 5:
    if n == 3:
        break
    n += 1
else:
    print("这行不执行")   # break 了，else 不执行
\`\`\`

### 嵌套循环的 break：只跳一层

⚠️ 这是新手常踩的坑：break 只跳出**最内层**循环，外层继续。

\`\`\`python
for i in range(3):
    for j in range(3):
        if j == 2:
            break           # 只跳出内层
        print(f"i={i},j={j}")
    print(f"外层 i={i} 继续")  # 外层照常
\`\`\`

#### 要跳多层怎么办？

**方法一：用标志位**

\`\`\`python
found = False
for i in range(5):
    for j in range(5):
        if i == 2 and j == 2:
            found = True
            break       # 跳内层
    if found:
        break           # 跳外层
\`\`\`

**方法二：包成函数，用 return**

\`\`\`python
def search():
    for i in range(5):
        for j in range(5):
            if i == 2 and j == 2:
                return (i, j)   # 直接退出函数，跳出所有循环
\`\`\`

函数法更干净，推荐。

### pass：占位符

Python 语法要求代码块不能为空（if、for、def、class 后面必须有内容）。但有时候你还没想好写啥，或者这个分支暂时不需要做事，就用 \`pass\` 占位：

\`\`\`python
if x > 0:
    pass        # 先占位，以后再写
elif x < 0:
    pass
else:
    print("x是0")
\`\`\`

\`pass\` 啥也不做，纯粹让语法合法。生活类比：pass 像填空题先写个"略"，等会儿再补上。

⚠️ pass 和 continue 不一样：pass 是"啥也不做就过去"，continue 是"跳过本次循环剩余部分"。pass 在循环里不会跳过任何东西。

### 小结

- break 跳出整个循环，continue 只跳过本次
- 循环 else：没 break 才执行，适合"找东西没找到"的场景
- break 只跳一层，跳多层用标志位或函数 return
- pass 是占位符，让空代码块语法合法
- continue 要小心别跳过自增语句导致死循环

### 常见疑问 Q&A

**Q1：循环 else 和 if else 有关系吗？**
A：没有。只是用了同一个关键字。循环 else 是"没 break 才执行"，if else 是"条件不满足才执行"。

**Q2：break 能跳出 if 吗？**
A：不能。break 只对循环起作用。写在 if 里只是"条件成立时 break"，跳的是循环。

**Q3：continue 会跳过循环条件判断吗？**
A：不会。continue 跳过的是"本次循环剩余代码"，下一次循环的条件还是会判断。

**Q4：pass 和注释有什么区别？**
A：注释是给人看的，Python 忽略；pass 是给 Python 看的，让代码块合法。空代码块用注释会报错，用 pass 才行。

**Q5：循环 else 实际用得多吗？**
A：不多。因为反直觉，很多人宁愿用标志位。但读老代码可能遇到，要能看懂。

### 本章 demo

demo 演示 break/continue 区别、循环 else、pass、嵌套 break。`,
    code: `# ============================================
# 第 18 章：break / continue / else
# ============================================

# --- 1. break vs continue ---
print("=== 1. break vs continue ===")
print("break 在 i==5 时停:")
for i in range(10):
    if i == 5:
        break
    print(f"  {i}", end="")
print()
print("continue 在 i==5 时跳过:")
for i in range(10):
    if i == 5:
        continue
    print(f"  {i}", end="")
print()

# --- 2. break 找目标 ---
print("\\n=== 2. 找第一个能被7整除的 ===")
for n in range(10, 100):
    if n % 7 == 0 and n % 10 == 7:
        print(f"  找到: {n}")
        break

# --- 3. 循环 else：找素数 ---
print("\\n=== 3. 循环 else 找素数 ===")
for n in range(2, 20):
    for i in range(2, n):
        if n % i == 0:
            break            # 找到因子，跳出
    else:
        print(f"  {n} 是素数（内层没break）")

# 对比：不用 else 的写法
print("\\n--- 不用else的等价写法 ---")
for n in range(2, 20):
    is_prime = True
    for i in range(2, n):
        if n % i == 0:
            is_prime = False
            break
    if is_prime:
        print(f"  {n} 是素数")

# --- 4. while 的 else ---
print("\\n=== 4. while 的 else ===")
n = 0
while n < 5:
    print(f"  n={n}", end=" ")
    n += 1
else:
    print("→ while 正常结束（没break）")
# 加 break 试试
print("加break的情况:")
n = 0
while n < 5:
    if n == 3:
        break
    n += 1
else:
    print("→ 这行不会执行，因为break了")
print(f"  （n={n} 时break，else没执行）")

# --- 5. 嵌套循环的 break ---
print("\\n=== 5. break 只跳内层 ===")
for i in range(3):
    for j in range(3):
        if j == 2:
            break           # 只跳出内层
        print(f"  i={i},j={j}", end=" ")
    print()

# --- 6. pass 占位 ---
print("\\n=== 6. pass 占位 ===")
x = 10
if x > 0:
    pass                    # 先占位，以后再写
elif x < 0:
    pass
else:
    print("x是0")
print("pass 让语法合法，先跑起来")

# --- 7. 用标志位跳出多层 ---
print("\\n=== 7. 跳出多层 ===")
found = False
for i in range(5):
    for j in range(5):
        if i == 2 and j == 2:
            found = True
            break           # 跳内层
    if found:
        break               # 跳外层
    print(f"  外层 i={i}")
print(f"  在 i=2,j=2 跳出多层")`
  },

  // -----------------------------------------------------------
  // 第 19 章：推导式
  // -----------------------------------------------------------
  {
    id: "py9-19",
    group: "流程：判断与重复",
    icon: "✨",
    title: "推导式：Pythonic 的精简写法",
    content: `## 推导式：Pythonic 的精简写法

Python 有个让其他语言羡慕的特色——**推导式（comprehension）**。它能用一行代码生成列表、字典、集合，比传统写法简洁得多。学会推导式，你写的代码会更有"Python 味"。

### 一行生成列表

先看对比。传统写法生成平方数列表：

\`\`\`python
squares = []
for i in range(10):
    squares.append(i ** 2)
\`\`\`

推导式写法：

\`\`\`python
squares = [i ** 2 for i in range(10)]
\`\`\`

一行搞定，效果完全一样。

生活类比：传统写法像"一个一个挑水果放进篮子"，推导式像"给我一筐这种水果"——一句话表达意图，Python 自己去装。

### 列表推导式

格式：\`[表达式 for 变量 in 可迭代 if 条件]\`

\`\`\`python
[i**2 for i in range(10)]              # 0,1,4,9,...81
[x for x in nums if x > 0]            # 过滤：只要正数
[x.upper() for x in words]            # 处理每个元素
\`\`\`

推导式分三部分，对应三种操作：
- **表达式**：每个元素变成什么样（\`i**2\`、\`x.upper()\`）
- **for 循环**：从哪里取元素（\`for i in range(10)\`）
- **if 条件**（可选）：哪些元素要（\`if x > 0\`）

#### 三种基本模式

**1. 变换：对每个元素做处理**

\`\`\`python
[x * 2 for x in [1, 2, 3]]         # [2, 4, 6]
[w.upper() for w in ["hi", "yo"]]  # ["HI", "YO"]
\`\`\`

**2. 过滤：只留符合条件的**

\`\`\`python
[x for x in nums if x > 0]         # 只要正数
[x for x in range(20) if x % 2 == 0]  # 只要偶数
\`\`\`

**3. 变换 + 过滤**

\`\`\`python
[x**2 for x in nums if x > 0]      # 正数的平方
\`\`\`

### 带条件的三元表达式

推导式里还能用三元表达式，对每个元素"二选一"：

\`\`\`python
["偶" if x%2==0 else "奇" for x in range(5)]
# ["偶", "奇", "偶", "奇", "偶"]
\`\`\`

注意这里的 if 是"三元表达式的 if"（每个元素二选一），不是"过滤的 if"。区别：
- 三元 if：\`["偶" if x%2==0 else "奇" for x in ...]\` —— 每个元素都处理，只是结果不同
- 过滤 if：\`[x for x in ... if x%2==0]\` —— 只留符合条件的元素

⚠️ 别混淆：三元的 if 在 for **前面**，过滤的 if 在 for **后面**。

\`\`\`python
# 取绝对值
[x if x >= 0 else -x for x in [1, -2, 3, -4]]   # [1, 2, 3, 4]
\`\`\`

### 字典推导式

把 \`[]\` 换成 \`{}\`，再加个冒号，就是字典推导式：

\`\`\`python
{k: v for k, v in pairs}
{s: len(s) for s in words}     # 单词到长度的映射
\`\`\`

经典应用——翻转字典的键值：

\`\`\`python
pairs = {"a": 1, "b": 2, "c": 3}
flipped = {v: k for k, v in pairs.items()}   # {1: "a", 2: "b", 3: "c"}
\`\`\`

从列表建字典：

\`\`\`python
students = [("小明", 90), ("小红", 85)]
score_dict = {name: score for name, score in students}
# {"小明": 90, "小红": 85}
\`\`\`

### 集合推导式

把 \`[]\` 换成 \`{}\`（不带冒号），就是集合推导式，自动去重：

\`\`\`python
{x % 3 for x in [1, 2, 3, 4, 5]}   # {0, 1, 2}
{x**2 for x in [1, 2, 2, 3]}       # {1, 4, 9}  ← 去重了
\`\`\`

### 嵌套循环推导式

推导式里可以写多个 for，等价于嵌套循环：

\`\`\`python
# 笛卡尔积
pairs = [(i, j) for i in range(2) for j in range(3)]
# [(0,0), (0,1), (0,2), (1,0), (1,1), (1,2)]
\`\`\`

展平二维列表：

\`\`\`python
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [x for row in matrix for x in row]
# [1, 2, 3, 4, 5, 6, 7, 8, 9]
\`\`\`

⚠️ 嵌套推导式读起来有点绕，顺序是"从左到右对应从外到内"。太复杂的嵌套建议改用普通 for 循环，可读性更重要。

### 生成器表达式：省内存的推导式

把 \`[]\` 换成 \`()\`，得到**生成器**——不立即生成所有数据，按需产生，省内存：

\`\`\`python
gen = (i**2 for i in range(1000000))   # 不占内存
sum(gen)                                # 用时才算
\`\`\`

列表推导式会立即生成所有元素占内存，生成器表达式是"懒"的——你要一个我算一个，不提前算。

| | 列表推导式 \`[]\` | 生成器表达式 \`()\` |
|---|---|---|
| 立即生成 | 是 | 否（按需）|
| 占内存 | 多 | 少 |
| 能重复遍历 | 能 | 不能（用完就没了）|
| 能下标访问 | 能 | 不能 |

⚠️ 生成器只能遍历一次，遍历完就空了。要重复用得重新生成，或者转成列表。

\`\`\`python
gen = (i**2 for i in range(5))
print(list(gen))   # [0, 1, 4, 9, 16]
print(list(gen))   # [] ← 空了！用完了
\`\`\`

### 什么时候用推导式

推导式虽好，但不是万能的。

**适合用推导式的场景：**
- 简单的一行变换（平方、过滤、转换）
- 逻辑能一眼看懂的
- 生成列表/字典/集合

**不适合用的场景：**
- 逻辑复杂、要嵌套好几层
- 有副作用（比如在推导式里 print、修改外部变量）
- 一行写完超过 80 字符

⚠️ 别为了"炫技"把复杂的 for 循环硬塞成推导式。可读性永远是第一位的。一行看不懂的推导式，不如五行的普通 for 循环。

\`\`\`python
# 好：简单清晰
[x**2 for x in range(10) if x % 2 == 0]

# 坏：太复杂，别这么写
result = [transform(x) for x in data if check(x) for y in related(x) if valid(y)]
\`\`\`

### 小结

- 推导式格式：\`[表达式 for 变量 in 可迭代 if 条件]\`
- 三元 if 在 for 前（变换），过滤 if 在 for 后（筛选）
- 字典推导式用 \`{k: v for ...}\`，集合用 \`{x for ...}\`
- 生成器表达式 \`()\` 省内存，但只能用一次
- 简单变换用推导式，复杂逻辑用普通 for 循环
- 可读性优先，别硬塞

### 常见疑问 Q&A

**Q1：推导式比 for 循环快吗？**
A：通常快一点点（C 层面优化），但差距不大。选推导式主要是为了简洁，不是为了性能。

**Q2：推导式里能写 print 吗？**
A：语法上能，但别这么干。推导式是用来"生成数据"的，不是用来"执行副作用"的。要 print 用普通 for 循环。

**Q3：三元 if 和过滤 if 怎么区分？**
A：在 for **前面**的是三元（变换），在 for **后面**的是过滤（筛选）。

**Q4：生成器表达式能下标访问吗？**
A：不能。生成器是"按需生成"的，没有"第几个"的概念。要下标先转列表。

**Q5：嵌套推导式太绕怎么办？**
A：改用普通 for 循环。可读性比简洁重要。复杂逻辑硬塞成一行是反模式。

### 本章 demo

demo 演示各种推导式和生成器表达式。`,
    code: `# ============================================
# 第 19 章：推导式
# ============================================

# --- 1. 列表推导式基础 ---
print("=== 1. 列表推导式 ===")
squares = [i**2 for i in range(10)]
print(f"平方: {squares}")

# 对比传统写法
trad = []
for i in range(10):
    trad.append(i**2)
print(f"传统: {trad}    ← 效果一样")

# --- 2. 带条件过滤 ---
print("\\n=== 2. 过滤 ===")
nums = [1, -2, 3, -4, 5, -6]
positives = [x for x in nums if x > 0]
print(f"只要正数: {positives}")
evens = [x for x in range(20) if x % 2 == 0]
print(f"偶数: {evens}")

# --- 3. 处理元素 ---
print("\\n=== 3. 处理 ===")
words = ["hello", "world", "python"]
upper = [w.upper() for w in words]
print(f"转大写: {upper}")
lengths = [len(w) for w in words]
print(f"长度: {lengths}")

# --- 4. 三元条件 ---
print("\\n=== 4. 三元条件 ===")
labels = ["偶" if x % 2 == 0 else "奇" for x in range(6)]
print(f"奇偶标签: {labels}")
nums = [1, -2, 3, -4]
abs_vals = [x if x >= 0 else -x for x in nums]
print(f"绝对值: {abs_vals}")

# --- 5. 嵌套循环推导式 ---
print("\\n=== 5. 嵌套 ===")
pairs = [(i, j) for i in range(2) for j in range(3)]
print(f"组合: {pairs}")
# 展平二维列表
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [x for row in matrix for x in row]
print(f"展平: {flat}")

# --- 6. 字典推导式 ---
print("\\n=== 6. 字典推导式 ===")
words = ["apple", "banana", "cherry"]
word_len = {w: len(w) for w in words}
print(f"单词长度: {word_len}")
# 翻转键值
pairs = {"a": 1, "b": 2, "c": 3}
flipped = {v: k for k, v in pairs.items()}
print(f"翻转: {flipped}")

# --- 7. 集合推导式 ---
print("\\n=== 7. 集合推导式 ===")
nums = [1, 2, 2, 3, 3, 3, 4]
unique_squares = {x**2 for x in nums}
print(f"平方去重: {unique_squares}")

# --- 8. 生成器表达式 ---
print("\\n=== 8. 生成器表达式 ===")
gen = (i**2 for i in range(5))
print(f"生成器: {gen}    ← 它是个对象，不立即算")
print(f"转列表: {list(gen)}")
# 生成器只能用一次
gen2 = (i**2 for i in range(1000000))
print(f"大生成器求和: {sum(gen2)}    ← 不占内存")

# --- 9. 实用：从列表建字典 ---
print("\\n=== 9. 实用 ===")
students = [("小明", 90), ("小红", 85), ("小刚", 92)]
score_dict = {name: score for name, score in students}
print(f"成绩表: {score_dict}")
# 找优秀的学生
excellent = {name: score for name, score in students if score >= 90}
print(f"优秀: {excellent}")`
  },

  // -----------------------------------------------------------
  // 第 20 章：流程控制综合实战
  // -----------------------------------------------------------
  {
    id: "py9-20",
    group: "流程：判断与重复",
    icon: "🧩",
    title: "流程控制综合实战",
    content: `## 流程控制综合实战：把零件组装成产品

前面几章我们学了各种"零件"——列表、字典、元组、集合、if、while、for、break/continue、推导式。但只会零件还不够，学编程的关键是"把零件组装成产品"。

这一章不用新知识，而是把学过的东西组合起来，做几个完整的小例子。每个例子都是真实编程中常见的模式，掌握了它们，你就有了"动手做事"的能力。

### 写程序的通用思路

在开始例子之前，先讲一个重要的方法论——怎么把一个需求变成代码。很多新手拿到题目就懵，其实有套路：

1. **先想清楚要做什么**：用中文把步骤写下来，别急着写代码
2. **想清楚用什么数据结构存**：列表？字典？还是组合？
3. **从粗到细**：先写主流程（骨架），再填细节（血肉）
4. **边写边测**：写一点运行一点，别写一大堆再测

举个生活类比：盖房子不是一上来就砌砖，而是先画图纸（想清楚）、打地基（数据结构）、搭框架（主流程）、再装修（细节）。

### 例子1：学生成绩管理系统

**需求**：存几个学生的成绩，计算每人平均分，找出最高分，统计各科平均。

**思路**：
- 每个学生有名字和多个成绩 → 用字典存学生信息，列表存成绩
- 多个学生 → 用列表装字典
- 算平均 → 循环遍历，sum/len
- 找最高 → 循环比较，记录最大值

\`\`\`python
students = [
    {"name": "小明", "scores": [90, 85, 88]},
    {"name": "小红", "scores": [95, 92, 90]},
]
best = None
best_avg = 0
for s in students:
    avg = sum(s["scores"]) / len(s["scores"])
    s["avg"] = round(avg, 1)        # 存进字典
    if avg > best_avg:
        best_avg = avg
        best = s["name"]
\`\`\`

这个例子综合用了：字典（存学生）、列表（存成绩）、for 循环（遍历）、if 判断（找最大）、动态添加键值对（\`s["avg"] = ...\`）。

### 例子2：简易计算器

**需求**：根据运算符对两个数做运算。

**思路**：
- 运算符是分类判断 → 用 if/elif/else
- 要处理除零错误 → 单独判断

\`\`\`python
for op, a, b in [("+", 10, 5), ("/", 10, 0)]:
    if op == "+":
        r = a + b
    elif op == "-":
        r = a - b
    elif op == "/":
        if b == 0:
            print("除零错误")
            continue
        r = a / b
    print(f"{a} {op} {b} = {r}")
\`\`\`

⚠️ 注意除零错误的处理：在除之前先判断 b 是不是 0，是 0 就 continue 跳过。这种"先检查再操作"的模式很常见，能避免程序崩溃。

### 例子3：单词统计（词频统计）

**需求**：统计一段文字里每个单词出现几次。

**思路**：
- 单词到次数的映射 → 字典
- 切分文字成单词 → \`split()\`
- 统计 → 循环 + \`get(w, 0) + 1\`
- 排序 → \`sorted\` + lambda

\`\`\`python
text = "the cat sat on the mat the cat ate the rat"
words = text.split()
count = {}
for w in words:
    count[w] = count.get(w, 0) + 1
sorted_words = sorted(count.items(), key=lambda x: x[1], reverse=True)
\`\`\`

这是字典的经典应用。词频统计在文本分析、搜索引擎、数据分析里到处都是。\`count.get(w, 0) + 1\` 这个写法要刻在脑子里。

### 例子4：打印图形

**需求**：用嵌套循环打印三角形、菱形。

**思路**：
- 图形是行×列 → 外层循环控制行，内层控制每行内容
- 每行的字符数和行号有关 → 用 i 控制每行打几个

\`\`\`python
# 直角三角形
for i in range(1, 6):
    print("*" * i)

# 等腰三角形
for i in range(1, 6):
    spaces = " " * (5 - i)
    stars = "*" * (2 * i - 1)
    print(spaces + stars)
\`\`\`

打印图形是练嵌套循环的经典题。关键想清楚"第 i 行要几个空格、几个星"。

### 例子5：找数对

**需求**：从一个列表里找出所有和为 10 的数对。

**思路**：
- 两个数配对 → 双重循环，外层取第一个，内层取第二个
- 避免重复配对 → 内层从外层的下一个开始

\`\`\`python
nums = [1, 3, 5, 7, 8, 2, 9]
pairs = []
for i in range(len(nums)):
    for j in range(i + 1, len(nums)):
        if nums[i] + nums[j] == 10:
            pairs.append((nums[i], nums[j]))
\`\`\`

\`range(i + 1, len(nums))\` 是关键——内层从 i+1 开始，避免重复配对（比如 (3,7) 和 (7,3) 只算一次）。

### 例子6：购物车

**需求**：算购物车里商品的总价，打印小票。

**思路**：
- 每个商品有名字、单价、数量 → 字典
- 多个商品 → 列表装字典
- 算总价 → 循环累加
- 格式化输出 → f-string 对齐

\`\`\`python
cart = [
    {"name": "苹果", "price": 5, "qty": 2},
    {"name": "香蕉", "price": 3, "qty": 5},
]
total = 0
for item in cart:
    subtotal = item["price"] * item["qty"]
    total += subtotal
    print(f"{item['name']:<8}{item['price']:<6}{subtotal}")
print(f"总计: {total}元")
\`\`\`

\`{name:<8}\` 是 f-string 的对齐语法：左对齐，占 8 个字符宽度。打印表格时很有用。

### 数据结构 + 流程控制 = 程序

回顾这 6 个例子，你会发现一个规律：**程序 = 数据结构 + 流程控制**。

- 数据结构（列表、字典）解决"数据怎么存"
- 流程控制（if、for、while）解决"怎么处理数据"

把这两块学扎实，你就能写大多数日常程序了。后面的函数、类、模块，都是在这些基础上做组织和封装。

### 写代码的几个好习惯

1. **变量名要有意义**：用 \`student_scores\` 别用 \`s\`，代码是给人读的
2. **先让程序跑起来，再优化**：能跑的烂代码比不能跑的好代码强
3. **边写边测**：写一小段就 print 看看对不对，别写一大堆才发现错
4. **复杂逻辑先写注释**：用中文写思路，再翻译成代码
5. **重复的代码考虑用函数**：一段代码复制了三遍，就该抽成函数了

### 小结

- 程序 = 数据结构 + 流程控制，选对数据结构事半功倍
- 写代码先想思路（中文写步骤），再翻译成代码
- 边写边测，别攒一大堆再调试
- 词频统计（字典+循环）、找数对（嵌套循环）、计算器（if分支）是经典模式
- f-string 的 \`:<8\` 对齐语法在打印表格时很有用

### 常见疑问 Q&A

**Q1：拿到需求不知道怎么下手怎么办？**
A：先用中文把步骤写下来（"先做什么、再做什么"），然后想每步用什么数据结构和流程控制，最后翻译成代码。

**Q2：什么时候用列表什么时候用字典？**
A：数据有顺序、按下标取用列表；数据有"名字"、按键取用字典。学生成绩用字典（按名字取），全班学生列表用列表（有序）。

**Q3：嵌套循环太多怎么办？**
A：考虑能不能用集合、字典优化（比如找数对可以用字典存"已见过的数"），或者把内层循环抽成函数。

**Q4：怎么调试找 bug？**
A：在关键位置 print 变量看对不对；缩小输入范围（先用小数据测）；分段注释掉代码定位问题。

**Q5：代码写得很乱正常吗？**
A：正常。新手阶段先让代码跑起来，等熟练了再追求整洁。能跑的代码是第一步，整洁是第二步。

### 本章 demo

本章 demo 把上面 6 个例子都跑一遍，重点是看"数据结构 + 流程控制"怎么组合解决实际问题。`,
    code: `# ============================================
# 第 20 章：综合实战
# ============================================

# --- 1. 学生成绩管理 ---
print("=== 1. 学生成绩管理 ===")
students = [
    {"name": "小明", "scores": [90, 85, 88]},
    {"name": "小红", "scores": [95, 92, 90]},
    {"name": "小刚", "scores": [78, 65, 72]},
]

# 计算每人平均分，并找最高分
best = None
best_avg = 0
for s in students:
    avg = sum(s["scores"]) / len(s["scores"])
    s["avg"] = round(avg, 1)        # 存进字典
    print(f"  {s['name']}: 平均 {s['avg']}")
    if avg > best_avg:
        best_avg = avg
        best = s["name"]
print(f"  >> 最高分: {best} ({best_avg:.1f})")

# 统计各科平均
print("  各科平均:")
for subject_idx in range(3):
    total = sum(s["scores"][subject_idx] for s in students)
    print(f"    科目{subject_idx+1}: {total/len(students):.1f}")

# --- 2. 简易计算器 ---
print("\\n=== 2. 简易计算器 ===")
commands = [("+", 10, 5), ("-", 10, 5), ("*", 10, 5), ("/", 10, 5), ("%", 10, 3)]
for op, a, b in commands:
    if op == "+":
        r = a + b
    elif op == "-":
        r = a - b
    elif op == "*":
        r = a * b
    elif op == "/":
        if b == 0:
            print(f"  {a}{op}{b} = 除零错误")
            continue
        r = a / b
    elif op == "%":
        r = a % b
    else:
        print(f"  未知运算: {op}")
        continue
    print(f"  {a} {op} {b} = {r}")

# --- 3. 单词统计 ---
print("\\n=== 3. 单词统计 ===")
text = "the cat sat on the mat the cat ate the rat"
words = text.split()
count = {}
for w in words:
    count[w] = count.get(w, 0) + 1
# 按出现次数排序
sorted_words = sorted(count.items(), key=lambda x: x[1], reverse=True)
print(f"文本: {text}")
print("词频统计:")
for w, c in sorted_words:
    print(f"  {w}: {c} {'*'*c}")

# --- 4. 打印图形 ---
print("\\n=== 4. 打印三角形 ===")
n = 5
print("直角三角形:")
for i in range(1, n + 1):
    print("*" * i)
print("\\n倒三角:")
for i in range(n, 0, -1):
    print("*" * i)
print("\\n等腰三角形:")
for i in range(1, n + 1):
    spaces = " " * (n - i)
    stars = "*" * (2 * i - 1)
    print(spaces + stars)

# --- 5. 找数字组合 ---
print("\\n=== 5. 找和为10的数对 ===")
nums = [1, 3, 5, 7, 8, 2, 9]
pairs = []
for i in range(len(nums)):
    for j in range(i + 1, len(nums)):
        if nums[i] + nums[j] == 10:
            pairs.append((nums[i], nums[j]))
print(f"数组: {nums}")
print(f"和为10的数对: {pairs}")

# --- 6. 简易购物车 ---
print("\\n=== 6. 购物车 ===")
cart = [
    {"name": "苹果", "price": 5, "qty": 2},
    {"name": "香蕉", "price": 3, "qty": 5},
    {"name": "牛奶", "price": 8, "qty": 1},
]
total = 0
print(f"{'商品':<8}{'单价':<6}{'数量':<6}{'小计'}")
for item in cart:
    subtotal = item["price"] * item["qty"]
    total += subtotal
    print(f"{item['name']:<8}{item['price']:<6}{item['qty']:<6}{subtotal}")
print(f"{'总计':<20}{total}元")`
  },
];
