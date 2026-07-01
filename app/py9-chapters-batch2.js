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
    content: `## 列表的"增删改查"

列表是可变的，所以有一堆方法来改变它。记住：这些方法**直接改原列表**，大多返回 \`None\`（不是新列表），和字符串方法不一样——字符串不可变所以返回新的。

### 增加
\`\`\`python
lst.append(x)      # 末尾加一个元素
lst.insert(i, x)   # 在下标 i 处插入 x
lst.extend(其他列表) # 把另一个列表的元素全加进来
\`\`\`

### 删除
\`\`\`python
lst.pop()        # 删除并返回末尾元素
lst.pop(i)       # 删除并返回下标 i 的元素
lst.remove(x)    # 删除第一个等于 x 的元素
del lst[i]       # 用 del 语句删下标 i
lst.clear()      # 清空
\`\`\`

### 修改
\`\`\`python
lst[i] = 新值          # 改一个
lst[i:j] = [新列表]    # 改一段
\`\`\`

### 查找和排序
\`\`\`python
lst.index(x)     # x 的下标，找不到抛异常
lst.count(x)     # x 出现几次
lst.sort()       # 原地排序（改原列表）
lst.reverse()    # 原地反转
sorted(lst)      # 返回新排序列表，不改原列表
\`\`\`

### append vs extend（常考）

\`\`\`python
a = [1, 2]
a.append([3, 4])   # a = [1, 2, [3, 4]]  把列表当一个元素
a.extend([3, 4])   # a = [1, 2, 3, 4]    把元素拆开加进去
\`\`\`

## 浅拷贝的坑

\`\`\`python
a = [1, 2, 3]
b = a               # 这不是拷贝！b 和 a 是同一份
b.append(4)         # a 也变了
c = a.copy()        # 这才是浅拷贝，c 独立
\`\`\`

回顾第 4 章"变量是标签"，就能理解为什么 \`b = a\` 会同步变化。

## 本章 demo

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
    content: `## 元组是什么

元组和列表几乎一样，**唯一区别：元组不可变**。创建后不能增删改元素。

\`\`\`python
t = (1, 2, 3)
t = 1, 2, 3        # 括号可省略
one = (1,)         # 单元素元组，逗号必须有！
\`\`\`

⚠️ 单元素元组必须加逗号：\`(1,)\` 是元组，\`(1)\` 只是数字 1。

## 为什么要不可变

- **安全**：数据不会被意外修改，比如经纬度坐标、RGB 颜色
- **可哈希**：元组能当字典的 key、能放集合里，列表不行
- **函数多返回值**：\`return a, b\` 实际返回的是元组

## 能做什么

索引、切片、遍历、\`len\`、\`in\`、\`count\`、\`index\`、\`max/min/sum\` 都和列表一样。只是不能改：

\`\`\`python
t = (1, 2, 3)
t[0] = 9    # 报错！TypeError
\`\`\`

## 解包（unpacking）

元组（和列表）可以"拆开"赋值给多个变量：

\`\`\`python
point = (3, 4)
x, y = point       # x=3, y=4
a, b, c = 1, 2, 3  # 其实右边是元组
\`\`\`

### 用 \`*\` 收集多余的

\`\`\`python
first, *rest = [1, 2, 3, 4]   # first=1, rest=[2,3,4]
a, *b, c = [1, 2, 3, 4, 5]   # a=1, b=[2,3,4], c=5
\`\`\`

## 交换变量的真相

\`a, b = b, a\` 其实就是元组解包：右边 \`b, a\` 先组成元组，再解包给左边的 \`a, b\`。

## 本章 demo

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
    content: `## 字典是什么

列表用"下标"找元素，字典用"键"找元素。它存的是**键值对**，像一本"词典"——用词查解释。

\`\`\`python
person = {"name": "小明", "age": 18, "city": "北京"}
person["name"]    # '小明'，用键查值
\`\`\`

- **键**必须唯一，且不可变（字符串、数字、元组都行，列表不行）
- **值**随便，什么类型都行，可重复
- 字典**可变**，能增删改
- Python 3.7+ 字典**保持插入顺序**

## 增删改查

\`\`\`python
d = {}
d["name"] = "小明"      # 增：键不存在就是新增
d["age"] = 18
d["age"] = 20           # 改：键存在就是修改
del d["age"]            # 删
d.get("name")           # 查（推荐）
\`\`\`

### get 的好处

\`\`\`python
d["xxx"]        # 键不存在会报 KeyError
d.get("xxx")    # 不存在返回 None，不报错
d.get("xxx", "默认值")  # 不存在返回"默认值"
\`\`\`

## 遍历

\`\`\`python
for key in d:                    # 遍历键
for key in d.keys():             # 同上
for value in d.values():         # 遍历值
for key, value in d.items():     # 遍历键值对（最常用）
\`\`\`

## 常用方法

\`\`\`python
d.keys()        # 所有键
d.values()      # 所有值
d.items()       # 所有键值对
d.update(另一个字典)  # 合并
d.pop(key)      # 删除并返回
\`\`\`

## 字典 vs 列表

| | 列表 | 字典 |
|---|---|---|
| 查找方式 | 按下标 | 按键 |
| 查找速度 | 慢（要遍历） | 快（哈希） |
| 有序 | 是 | 是（3.7+） |
| 适合 | 有序数据 | 映射关系 |

## 本章 demo

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
    content: `## 集合是什么

集合像字典的"键的集合"——**元素唯一、无序**。

\`\`\`python
s = {1, 2, 3}
s = set([1, 2, 2, 3])   # 从列表建，自动去重 → {1, 2, 3}
\`\`\`

两个核心特性：
- **去重**：放进去重复的自动没了
- **无序**：没有下标，不能 \`s[0]\`

## 什么时候用

- **去重**：把列表变集合再变回来，重复就没了
- **判断成员**：\`x in set\` 比在列表里快得多
- **集合运算**：交集、并集、差集

## 增删

\`\`\`python
s.add(x)       # 加
s.remove(x)    # 删，不存在报错
s.discard(x)   # 删，不存在不报错（推荐）
s.pop()        # 随机删一个
\`\`\`

## 集合运算

\`\`\`python
a = {1, 2, 3}
b = {3, 4, 5}
a | b    # 并集 {1,2,3,4,5}
a & b    # 交集 {3}
a - b    # 差集 {1,2}（a有b没有）
a ^ b    # 对称差 {1,2,4,5}（只在一边的）
\`\`\`

## 不可变集合 frozenset

普通 set 可变，不能当字典 key。\`frozenset\` 不可变，可以。

## 本章 demo

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
    content: `## 让程序会做选择

前面代码都是"从头到尾一条线"。真实程序要"看情况"——这就是 \`if\`。

\`\`\`python
age = 20
if age >= 18:
    print("成年")
\`\`\`

\`if\` 后面跟一个**条件**（布尔值），条件为真就执行缩进的代码块。

## if / elif / else

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
- \`elif\` 是 \`else if\` 的缩写
- \`else\` 是"以上都不满足"的兜底
- 每个分支后跟**缩进的代码块**，缩进结束就表示分支结束

## 嵌套 if

if 里还能再套 if：

\`\`\`python
if age >= 18:
    if has_id:
        print("可以进")
    else:
        print("没带身份证")
\`\`\`

但**别嵌套太深**，超过 3 层就该重构了。

## 条件表达式（三元运算符）

\`\`\`python
result = "及格" if score >= 60 else "不及格"
\`\`\`

简单的二选一用这个，比 if/else 紧凑。

## 常见坑

\`\`\`python
if score >= 0 and <= 100:    # 语法错误！
if 0 <= score <= 100:        # 正确，链式比较
\`\`\`

## 本章 demo

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
    content: `## 重复做事

计算机最擅长重复。循环让一段代码重复执行。Python 有两种循环：\`while\` 和 \`for\`。

\`\`\`python
count = 0
while count < 3:
    print(count)
    count += 1
\`\`\`

\`while 条件:\` —— 条件为真就**一直执行**缩进块，条件变假就停。

## 关键：条件要能变假

循环体里必须改"条件涉及的变量"，否则**死循环**：

\`\`\`python
while True:          # 永远真
    print("卡死了")  # 一直打印，停不下来
\`\`\`

新手最常犯的死循环：忘了 \`count += 1\`。

## break 和 continue

\`\`\`python
while True:
    n = 某个值
    if n == 0:
        break       # 直接跳出整个循环
    if n < 0:
        continue    # 跳过本次，进入下一次
\`\`\`

## while 适合什么

- **不确定次数**：比如"用户一直输入直到输入 quit"
- **基于条件**：比如"一直找直到找到目标"

确定次数的遍历用 \`for\`（下一章）更合适。

## 本章 demo

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
    content: `## for 比 while 更常用

\`for\` 用来**遍历**一个"可迭代对象"（列表、字符串、字典、range 等），把每个元素拿出来一次。

\`\`\`python
for x in [1, 2, 3]:
    print(x)

for ch in "hello":
    print(ch)
\`\`\`

## range：生成数字序列

\`\`\`python
range(5)        # 0,1,2,3,4
range(2, 8)     # 2,3,4,5,6,7
range(0, 10, 2) # 0,2,4,6,8（步长2）
\`\`\`

注意 \`range(5)\` 是 0 到 4，**不包含 5**，和切片规则一致。

\`\`\`python
for i in range(5):
    print(i)    # 0 1 2 3 4
\`\`\`

## 遍历的几种姿势

\`\`\`python
# 遍历元素
for x in lst:
    ...

# 要下标：用 range
for i in range(len(lst)):
    print(i, lst[i])

# 要下标+元素：用 enumerate（推荐！）
for i, x in enumerate(lst):
    print(i, x)

# 同时遍历两个：用 zip
for a, b in zip(list1, list2):
    print(a, b)
\`\`\`

## zip：拉链

\`\`\`python
names = ["小明", "小红"]
ages = [18, 19]
for name, age in zip(names, ages):
    print(name, age)
\`\`\`

长度不等时，zip 会按**短的**截断。

## for 也能 break / continue

和 while 一样。

## 本章 demo

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
    content: `## 复习 break 和 continue

- \`break\`：**彻底跳出**整个循环
- \`continue\`：**跳过本次**，进入下一次循环

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

## 循环 else（Python 特色，少用但要知道）

\`for\` / \`while\` 后面可以接 \`else\`，**循环正常结束（没 break）才执行**：

\`\`\`python
for n in range(2, 100):
    for i in range(2, n):
        if n % i == 0:
            break          # 找到因子，break
    else:
        print(n, "是素数")  # 内层没break，说明没因子
\`\`\`

这个 \`else\` 属于 \`for\`，不是 \`if\`。意思是"循环没被打断"。

> 很多人觉得这个语法反直觉，所以实际代码用得少，但读懂老代码需要。

## 嵌套循环的 break

break 只跳出**最内层**循环。要跳多层用标志位或 \`return\`。

## pass：占位符

\`\`\`python
if x > 0:
    pass    # 啥也不做（占位，后面再写）
\`\`\`

Python 语法要求代码块不能为空，暂时不写就用 \`pass\`。

## 本章 demo

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
    content: `## 一行生成列表

Python 有个特色写法叫**推导式**，能用一行代码生成列表、字典、集合：

\`\`\`python
# 传统写法
squares = []
for i in range(10):
    squares.append(i ** 2)

# 推导式（等价，更简洁）
squares = [i ** 2 for i in range(10)]
\`\`\`

## 列表推导式

格式：\`[表达式 for 变量 in 可迭代 if 条件]\`

\`\`\`python
[i**2 for i in range(10)]              # 0,1,4,9,...81
[x for x in nums if x > 0]            # 过滤：只要正数
[x.upper() for x in words]            # 处理每个元素
\`\`\`

### 带条件的三元
\`\`\`python
["偶" if x%2==0 else "奇" for x in range(5)]
\`\`\`

## 字典推导式

\`\`\`python
{k: v for k, v in pairs}
{s: len(s) for s in words}     # 单词到长度的映射
\`\`\`

## 集合推导式

\`\`\`python
{x % 3 for x in nums}    # 去重
\`\`\`

## 生成器表达式

把 \`[]\` 换成 \`()\`，得到**生成器**——不立即生成所有数据，按需产生，省内存：

\`\`\`python
gen = (i**2 for i in range(1000000))   # 不占内存
sum(gen)                                # 用时才算
\`\`\`

## 什么时候用

- **简单的一行变换**：用推导式，简洁
- **逻辑复杂、要嵌套好几层**：用普通 for 循环，别硬塞推导式

## 本章 demo

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
    content: `## 把前面学的串起来

这一章不用新知识，而是把 if、while、for、列表、字典组合起来，做几个完整小例子。学编程关键是"把零件组装成产品"。

### 例子1：学生成绩管理系统

用字典存学生，列表存成绩，用循环做查询统计。

### 例子2：简易计算器

循环接收"运算+两个数"，用 if 分支选操作。

### 例子3：单词统计

读一段文字，统计每个单词出现次数（字典的经典应用）。

### 例子4：打印图形

用嵌套循环打印三角形、菱形。

## 写程序的思路

1. **先想清楚要做什么**，用中文写步骤
2. **想清楚用什么数据结构存**
3. **从粗到细**：先写主流程，再填细节
4. **边写边测**：写一点运行一点，别写一大堆再测

本章 demo 把上面 4 个例子都跑一遍。`,
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
