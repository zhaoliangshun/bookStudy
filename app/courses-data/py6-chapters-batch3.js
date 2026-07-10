export const chapters = [
  {
    id: "py6-list-basic",
    group: "数据结构",
    icon: "📋",
    title: "列表基础（创建/访问/len/in/+/*）",
    content: `## 列表基础

列表（list）是 Python 中最常用的数据结构之一，它是一个**有序、可变**的元素集合，可以存储任意类型的数据。

### 创建列表

使用方括号 \`[]\` 创建列表，元素之间用逗号分隔：

\`\`\`python
# 用方括号 [] 创建空列表
# 空列表
empty_list = []
# 列表中可存放一组数字
# 包含数字的列表
numbers = [1, 2, 3, 4, 5]
# 列表元素类型可以不同
# 包含不同类型元素的列表
mixed = [1, "hello", 3.14, True]
# list() 把可迭代对象转换为列表
# 使用 list() 函数创建
# 字符串被按字符拆分成列表
chars = list("Python")  # ['P', 'y', 't', 'h', 'o', 'n']
\`\`\`

### 访问元素

列表使用**索引**访问元素，索引从 0 开始：

\`\`\`python
# 创建水果列表
fruits = ["苹果", "香蕉", "橙子"]
# 索引 0 表示第一个元素
print(fruits[0])  # 苹果（第一个元素）
# 索引 2 表示第三个元素
print(fruits[2])  # 橙子（第三个元素）
# 负数索引从末尾倒数，-1 为最后一个元素
print(fruits[-1]) # 橙子（负数索引表示从末尾数）
\`\`\`

### 常用操作

- \`len()\`：获取列表长度
- \`in\`：判断元素是否在列表中
- \`+\`：拼接两个列表
- \`*\`：重复列表

### 注意事项

- 列表索引从 0 开始，不是 1
- 访问不存在的索引会抛出 \`IndexError\`
- 列表可以包含重复元素`,
    code: `# 列表基础操作演示
print("=== 1. 创建列表 ===")
# 创建空列表
empty = []
print("空列表:", empty)

# 创建包含多种类型元素的列表
fruits = ["苹果", "香蕉", "橙子", "葡萄"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "你好", 3.14, True]
print("水果列表:", fruits)
print("数字列表:", numbers)
print("混合列表:", mixed)

# 使用list()从字符串创建列表
chars = list("Python")
print("从字符串创建:", chars)

print("\\n=== 2. 访问元素 ===")
# 通过索引访问（从0开始）
print("第一个水果:", fruits[0])
print("第三个水果:", fruits[2])
print("最后一个水果:", fruits[-1])  # 负数索引从末尾数
print("倒数第二个水果:", fruits[-2])

print("\\n=== 3. len() 获取长度 ===")
print("水果列表长度:", len(fruits))
print("数字列表长度:", len(numbers))

print("\\n=== 4. in 运算符 ===")
print("香蕉在列表中吗?", "香蕉" in fruits)
print("西瓜在列表中吗?", "西瓜" in fruits)
print("3不在数字列表中吗?", 3 not in numbers)

print("\\n=== 5. + 拼接列表 ===")
list1 = [1, 2, 3]
list2 = [4, 5, 6]
combined = list1 + list2
print("拼接结果:", combined)

print("\\n=== 6. * 重复列表 ===")
zeros = [0] * 5
print("重复5次:", zeros)
hi = ["嗨"] * 3
print("重复3次:", hi)

print("\\n=== 7. 错误示例（注释掉）===")
# print(fruits[10])  # IndexError: 索引超出范围会报错`
  },
  {
    id: "py6-list-methods",
    group: "数据结构",
    icon: "🛠️",
    title: "列表常用方法（append/extend/insert/remove/pop/index/count/sort/reverse/copy/clear）",
    content: `## 列表常用方法

列表是可变对象，提供了丰富的内置方法来修改和操作列表。

### 添加元素

- \`append(x)\`：在末尾添加一个元素
- \`extend(iterable)\`：在末尾添加多个元素（可迭代对象）
- \`insert(i, x)\`：在指定位置插入元素

### 删除元素

- \`remove(x)\`：删除第一个出现的指定元素
- \`pop(i)\`：删除并返回指定位置的元素（默认最后一个）
- \`clear()\`：清空列表所有元素
- \`del lst[i]\`：按索引删除单个元素（语句，不是方法）
- \`del lst[i:j]\`：删除一段切片

### 成员判断

- \`x in lst\`：判断 x 是否在列表中（返回 True/False）
- \`x not in lst\`：判断 x 是否不在列表中

### 查询元素

- \`index(x)\`：返回元素第一次出现的索引
- \`count(x)\`：统计元素出现的次数

### 其他方法

- \`sort()\`：原地排序
- \`reverse()\`：原地反转
- \`copy()\`：浅拷贝列表

### 注意事项

- \`append\` 和 \`extend\` 的区别：append 把参数当作一个元素添加，extend 把参数展开添加
- \`remove\` 删除不存在的元素会抛出 \`ValueError\`
- \`sort()\` 是原地修改，返回 \`None\``,
    code: `# 列表常用方法演示
print("=== 1. 添加元素 ===")
fruits = ["苹果", "香蕉"]
print("初始列表:", fruits)

# append: 在末尾添加一个元素
fruits.append("橙子")
print("append橙子后:", fruits)

# extend: 添加多个元素（扩展列表）
fruits.extend(["葡萄", "芒果"])
print("extend葡萄、芒果后:", fruits)

# 注意append和extend的区别
test_list = [1, 2, 3]
test_list.append([4, 5])  # 把整个列表作为一个元素添加
print("append一个列表:", test_list)

test_list2 = [1, 2, 3]
test_list2.extend([4, 5])  # 把列表中的元素逐个添加
print("extend一个列表:", test_list2)

# insert: 在指定位置插入
fruits.insert(1, "西瓜")  # 在索引1位置插入西瓜
print("insert西瓜到位置1:", fruits)

print("\\n=== 2. 删除元素 ===")
numbers = [1, 2, 3, 4, 5, 3, 6]
print("初始数字列表:", numbers)

# remove: 删除第一个出现的指定元素
numbers.remove(3)
print("remove第一个3后:", numbers)

# pop: 删除并返回指定位置元素（默认最后一个）
last = numbers.pop()
print("pop()最后一个元素:", last, "，列表变为:", numbers)

second = numbers.pop(1)  # 删除索引1的元素
print("pop(1)索引1的元素:", second, "，列表变为:", numbers)

# clear: 清空列表
temp = [1, 2, 3]
temp.clear()
print("clear清空后:", temp)

# del 语句：按索引删除（不是方法，是语句）
del_list = [10, 20, 30, 40, 50]
del del_list[1]  # 删除索引1的元素（20）
print("del[1]后:", del_list)
del del_list[1:3]  # 删除一段切片（30,40）
print("del[1:3]后:", del_list)

# in / not in 成员判断
print("30在列表中吗?", 30 in del_list)
print("30不在列表中吗?", 30 not in del_list)

print("\\n=== 3. 查询方法 ===")
nums = [10, 20, 30, 20, 40, 20]
print("列表:", nums)
print("20第一次出现的索引:", nums.index(20))
print("20出现的次数:", nums.count(20))
print("50出现的次数:", nums.count(50))

print("\\n=== 4. 排序和反转 ===")
scores = [88, 76, 92, 65, 95]
print("原分数:", scores)

# sort: 原地排序（修改原列表）
scores.sort()
print("sort升序后:", scores)

scores.sort(reverse=True)  # 降序排序
print("sort降序后:", scores)

# reverse: 原地反转
letters = ["a", "b", "c", "d"]
letters.reverse()
print("reverse反转后:", letters)

print("\\n=== 5. copy 复制 ===")
original = [1, 2, 3]
copied = original.copy()
copied.append(4)
print("原列表:", original)
print("复制后修改副本:", copied)
print("原列表未受影响:", original)`
  },
  {
    id: "py6-list-slice",
    group: "数据结构",
    icon: "✂️",
    title: "列表索引与切片详解",
    content: `## 列表索引与切片详解

切片（slice）是 Python 中非常强大的功能，可以方便地获取列表的子序列。

### 基本语法

\`\`\`python
# 切片语法：start 起始、stop 结束（不含）、step 步长，三者均可省略
list[start:stop:step]
\`\`\`

- \`start\`：起始索引（包含），默认 0
- \`stop\`：结束索引（不包含），默认列表长度
- \`step\`：步长，默认 1

### 常见用法

- \`list[1:4]\`：获取索引 1 到 3 的元素
- \`list[:3]\`：获取前 3 个元素
- \`list[2:]\`：从索引 2 到末尾
- \`list[::2]\`：每隔一个取一个
- \`list[::-1]\`：反转列表

### 重要特性

- 切片不会越界，超出范围会自动截断
- 切片返回的是新列表，不修改原列表
- 可以用于赋值，批量修改/删除元素
- 字符串、元组也支持切片操作`,
    code: `# 列表切片详解
numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
print("原列表:", numbers)

print("\\n=== 1. 基本切片 [start:stop] ===")
# 获取索引1到4的元素（包含1，不包含4）
print("numbers[1:4] =", numbers[1:4])
# 从开头到索引5（不包含5）
print("numbers[:5] =", numbers[:5])
# 从索引5到末尾
print("numbers[5:] =", numbers[5:])
# 获取全部元素（复制列表）
print("numbers[:] =", numbers[:])

print("\\n=== 2. 步长 [start:stop:step] ===")
# 每隔2个取一个（步长为2）
print("numbers[::2] =", numbers[::2])
# 从索引1开始，每隔2个取一个
print("numbers[1::2] =", numbers[1::2])
# 步长为负数表示反向
print("numbers[::-1] =", numbers[::-1])  # 反转列表
print("numbers[8:2:-1] =", numbers[8:2:-1])  # 从索引8反向到2

print("\\n=== 3. 负数索引 ===")
# 最后3个元素
print("最后3个:", numbers[-3:])
# 除了最后3个
print("除了最后3个:", numbers[:-3])
# 中间部分（去掉首尾各2个）
print("去掉首尾各2个:", numbers[2:-2])

print("\\n=== 4. 切片不会报错（越界安全）===")
print("numbers[5:100] =", numbers[5:100])  # 超出范围自动截断
print("numbers[100:] =", numbers[100:])    # 返回空列表

print("\\n=== 5. 切片赋值 ===")
lst = [0, 1, 2, 3, 4, 5]
print("原列表:", lst)
# 替换一段元素
lst[1:4] = [10, 20, 30]
print("替换索引1-3后:", lst)
# 插入元素（步长为1时长度可以不同）
lst[2:2] = [15, 16]
print("在索引2处插入:", lst)
# 删除一段
lst[1:4] = []
print("删除索引1-3后:", lst)

print("\\n=== 6. 字符串切片也一样 ===")
text = "Hello,Python!"
print("字符串:", text)
print("前5个字符:", text[:5])
print("反转字符串:", text[::-1])`
  },
  {
    id: "py6-list-sort",
    group: "数据结构",
    icon: "📊",
    title: "列表排序（sort/sorted/key/reverse/自定义排序）",
    content: `## 列表排序

Python 提供了两种排序方式：
- \`list.sort()\`：原地排序，修改原列表，返回 None
- \`sorted(list)\`：返回新的排序后的列表，不修改原列表

### 基本参数

- \`reverse=True\`：降序排序（默认升序）
- \`key=函数\`：指定排序依据的函数

### key 参数的用法

\`key\` 参数接收一个函数，该函数作用于每个元素，返回值作为排序的依据：

\`\`\`python
# key 指定排序依据函数：len 取字符串长度
# 按字符串长度排序
words.sort(key=len)
# abs 取绝对值后再排序
# 按绝对值排序
numbers.sort(key=abs)
# lambda 定义临时函数，返回元组第二项作为排序依据
# 按元组的第二个元素排序
pairs.sort(key=lambda x: x[1])
\`\`\`

### 排序稳定性

Python 的排序是**稳定排序**：当两个元素 key 值相同时，它们的相对顺序保持不变。

### 注意事项

- 列表元素类型需要一致才能排序（数字和字符串混合会报错）
- \`sort()\` 返回 None，不要写 \`lst = lst.sort()\`（这样会得到 None）`,
    code: `# 列表排序演示
print("=== 1. sort() 原地排序 vs sorted() 返回新列表 ===")
numbers1 = [3, 1, 4, 1, 5, 9, 2, 6]
numbers2 = [3, 1, 4, 1, 5, 9, 2, 6]

# sort() 原地修改
print("原列表:", numbers1)
result = numbers1.sort()
print("sort()返回值:", result)  # None！注意不要写成 numbers1 = numbers1.sort()
print("sort()后原列表:", numbers1)

# sorted() 返回新列表
print("\\n原列表:", numbers2)
sorted_nums = sorted(numbers2)
print("sorted()返回新列表:", sorted_nums)
print("原列表不变:", numbers2)

print("\\n=== 2. reverse 参数（降序）===")
nums = [5, 2, 9, 1, 5, 6]
print("升序:", sorted(nums))
print("降序:", sorted(nums, reverse=True))

print("\\n=== 3. key 参数（自定义排序规则）===")
words = ["banana", "apple", "cherry", "date", "blueberry"]
print("原单词:", words)
# 按单词长度排序
print("按长度排序:", sorted(words, key=len))

# 按绝对值排序
neg_nums = [-5, 3, -1, 8, -2]
print("\\n原数字:", neg_nums)
print("按绝对值排序:", sorted(neg_nums, key=abs))

# 按字符串小写排序（不区分大小写）
names = ["Alice", "bob", "Charlie", "david"]
print("\\n原名字:", names)
print("区分大小写排序:", sorted(names))
print("不区分大小写排序:", sorted(names, key=str.lower))

print("\\n=== 4. 复杂结构排序 ===")
students = [
    {"name": "小明", "score": 85},
    {"name": "小红", "score": 92},
    {"name": "小刚", "score": 78},
    {"name": "小华", "score": 92},
]
print("按分数排序:")
# 按score字段排序
by_score = sorted(students, key=lambda s: s["score"], reverse=True)
for s in by_score:
    print(f"  {s['name']}: {s['score']}分")

# 元组列表排序
pairs = [(1, "one"), (3, "three"), (2, "two"), (4, "four")]
print("\\n元组列表（按第一个元素排序）:", sorted(pairs))
print("按第二个元素排序:", sorted(pairs, key=lambda x: x[1]))

print("\\n=== 5. 多级排序 ===")
# 先按分数降序，分数相同按名字排序
students2 = [
    ("小明", 85), ("小红", 92), ("小刚", 85), ("小华", 92)
]
# key返回元组，先按分数降序，再按名字升序
sorted_students = sorted(students2, key=lambda x: (-x[1], x[0]))
print("先按分数降序，再按名字升序:")
for name, score in sorted_students:
    print(f"  {name}: {score}分")`
  },
  {
    id: "py6-tuple",
    group: "数据结构",
    icon: "🎯",
    title: "元组（不可变序列/打包解包/命名元组简单版）",
    content: `## 元组（Tuple）

元组是**不可变**的序列类型，一旦创建就不能修改。使用圆括号 \`()\` 定义。

### 创建元组

\`\`\`python
# 用括号定义元组，元素不可修改
# 普通方式
point = (3, 4)
# 单元素元组必须加逗号，否则被当作普通括号表达式
# 单个元素的元组必须加逗号！
single = (5,)  # 注意逗号
# 不写括号也会自动打包成元组
# 省略括号（打包）
coords = 1, 2, 3
# tuple() 把可迭代对象转为元组
# tuple() 转换
chars = tuple("abc")
\`\`\`

### 元组的特点

- **不可变**：不能增删改元素（安全性）
- **可哈希**：可以作为字典的键
- **比列表快**：遍历和访问速度稍快
- 支持索引、切片、\`in\`、\`+\`、\`*\` 等操作

### 打包与解包

- **打包**：多个值自动组合成元组
- **解包**：元组的值分别赋给多个变量

### 注意事项

- 单个元素的元组必须加逗号，\`(5)\` 只是整数 5，\`(5,)\` 才是元组
- 元组不可变，但如果元组包含可变元素（如列表），该元素内部仍可修改`,
    code: `# 元组演示
print("=== 1. 创建元组 ===")
# 基本方式
point = (3, 4)
print("坐标点:", point)

# 省略括号（打包）
person = "张三", 25, "北京"
print("打包元组:", person)
print("类型:", type(person))

# 单个元素必须加逗号！
single = (42,)
print("单个元素元组:", single, "类型:", type(single))
not_a_tuple = (42)
print("没有逗号是整数:", not_a_tuple, "类型:", type(not_a_tuple))

# 空元组
empty = ()
print("空元组:", empty)

# 从其他序列转换
from_list = tuple([1, 2, 3])
from_str = tuple("Python")
print("从列表转换:", from_list)
print("从字符串转换:", from_str)

print("\\n=== 2. 访问元素（和列表一样）===")
colors = ("红", "绿", "蓝", "黄")
print("第一个:", colors[0])
print("最后一个:", colors[-1])
print("切片:", colors[1:3])
print("长度:", len(colors))
print("绿在里面吗?", "绿" in colors)

print("\\n=== 3. 元组不可变（注意）===")
# colors[0] = "黑"  # TypeError! 元组不能修改
# 但如果元组包含可变元素...
nested = ([1, 2], [3, 4])
print("包含列表的元组:", nested)
nested[0].append(3)  # 列表本身可以修改
print("修改内部列表后:", nested)

print("\\n=== 4. 解包（Unpacking）===")
x, y = point  # 解包
print(f"解包point: x={x}, y={y}")

name, age, city = person
print(f"解包person: 姓名={name}, 年龄={age}, 城市={city}")

# 用*收集多余的值
a, b, *rest = (1, 2, 3, 4, 5)
print(f"a={a}, b={b}, rest={rest}")

first, *middle, last = (1, 2, 3, 4, 5)
print(f"first={first}, middle={middle}, last={last}")

print("\\n=== 5. 元组的用途 ===")
# 多返回值（函数打包返回多个值）
def get_min_max(numbers):
    return min(numbers), max(numbers)  # 返回元组

result = get_min_max([3, 1, 4, 1, 5])
min_val, max_val = result  # 解包
print(f"最小值={min_val}, 最大值={max_val}")

# 交换变量（不需要临时变量！）
a = 10
b = 20
print(f"交换前: a={a}, b={b}")
a, b = b, a  # 元组解包交换
print(f"交换后: a={a}, b={b}")

# 作为字典的键（列表不行）
locations = {
    (39.9, 116.4): "北京",
    (31.2, 121.5): "上海",
}
print("坐标字典:", locations[(39.9, 116.4)])`
  },
  {
    id: "py6-dict-basic",
    group: "数据结构",
    icon: "📖",
    title: "字典基础（创建/访问/添加/修改/删除）",
    content: `## 字典基础

字典（dict）是**键值对（key-value）**的无序集合，通过键来存取数据，查找速度极快。

### 创建字典

\`\`\`python
# 用花括号直接书写字面量键值对
# 花括号创建
person = {"name": "张三", "age": 25}
# dict() 用关键字参数构造字典
# dict() 构造函数
d = dict(name="李四", age=30)
# 空 {} 即空字典
# 空字典
empty = {}
# dict() 不传参也得到空字典
empty2 = dict()
# 用键值对列表构造字典
# 从键值对序列创建
pairs = [("a", 1), ("b", 2)]
# dict 把序列转为字典
d2 = dict(pairs)
\`\`\`

### 基本操作

- 访问：\`d[key]\` 或 \`d.get(key)\`
- 添加/修改：\`d[key] = value\`
- 删除：\`del d[key]\` 或 \`d.pop(key)\`

### 键的要求

- 键必须是**不可变**类型：字符串、数字、元组（包含不可变元素）
- 键不能重复（重复会覆盖）
- 值可以是任意类型

### 注意事项

- 直接用 \`d[key]\` 访问不存在的键会抛出 \`KeyError\`
- Python 3.7+ 字典保持插入顺序`,
    code: `# 字典基础演示
print("=== 1. 创建字典 ===")
# 方式1：花括号
student = {"name": "小明", "age": 18, "grade": 90}
print("学生字典:", student)

# 方式2：dict()关键字参数
person = dict(name="小红", city="上海", job="工程师")
print("人物字典:", person)

# 方式3：键值对列表
items = [("apple", 5), ("banana", 3), ("orange", 4)]
fruits = dict(items)
print("水果字典:", fruits)

# 空字典
empty = {}
print("空字典:", empty, type(empty))

print("\\n=== 2. 访问值 ===")
print("name:", student["name"])
print("age:", student["age"])
print("grade:", student["grade"])

# 访问不存在的键会报错（注释掉）
# print(student["gender"])  # KeyError!

# 用in检查键是否存在
print("gender存在吗?", "gender" in student)
print("name存在吗?", "name" in student)

print("\\n=== 3. 添加和修改 ===")
d = {"a": 1}
print("初始:", d)

# 添加新键值对
d["b"] = 2
print("添加b=2:", d)

# 修改已有键的值
d["a"] = 100
print("修改a=100:", d)

# 批量添加多个键值对
d.update({"c": 3, "d": 4})
print("update批量添加:", d)

print("\\n=== 4. 删除 ===")
inventory = {"笔": 10, "本子": 5, "橡皮": 8, "尺子": 3}
print("初始库存:", inventory)

# del 删除指定键
del inventory["尺子"]
print("del尺子后:", inventory)

# pop 删除并返回值
eraser_count = inventory.pop("橡皮")
print(f"pop橡皮: 数量={eraser_count}, 剩余={inventory}")

# popitem 删除并返回最后插入的键值对(Python3.7+)
item = inventory.popitem()
print(f"popitem: 删除了{item}, 剩余={inventory}")

# clear 清空
inventory.clear()
print("clear清空后:", inventory)

print("\\n=== 5. 键的类型 ===")
# 键可以是字符串、数字、元组（不可变类型）
valid_dict = {
    "name": "测试",
    123: "数字键",
    (1, 2): "元组键",
}
print("合法键:", valid_dict["name"], valid_dict[123], valid_dict[(1, 2)])

# 列表不能作为键（可变类型）
# invalid = {[1, 2]: "列表键"}  # TypeError!

print("\\n=== 6. len() 键值对数量 ===")
print("student字典长度:", len(student))`
  },
  {
    id: "py6-dict-methods",
    group: "数据结构",
    icon: "🔧",
    title: "字典常用方法（get/keys/values/items/update/pop/setdefault/fromkeys）",
    content: `## 字典常用方法

字典提供了丰富的方法来操作键值对。

### 查询方法

- \`get(key, default)\`：安全获取值，不存在返回 default（默认 None）
- \`keys()\`：返回所有键的视图
- \`values()\`：返回所有值的视图
- \`items()\`：返回所有 (键, 值) 元组的视图

### 修改方法

- \`update(dict2)\`：用另一个字典更新当前字典
- \`pop(key, default)\`：删除并返回值，不存在返回 default
- \`popitem()\`：删除并返回最后插入的键值对
- \`setdefault(key, default)\`：键存在返回值，不存在设置并返回 default
- \`clear()\`：清空字典
- \`copy()\`：浅拷贝

### 类方法

- \`dict.fromkeys(keys, value)\`：创建新字典，所有键对应同一个值

### 视图对象

\`keys()\`、\`values()\`、\`items()\` 返回的是**视图对象**，不是列表，它们会动态反映字典的变化。可以用 \`list()\` 转换成列表。`,
    code: `# 字典常用方法演示
print("=== 1. get() 安全访问 ===")
user = {"name": "张三", "age": 25}
print("字典:", user)

# 直接访问可能报错
# print(user["email"])  # KeyError!

# get() 不存在返回None
print("name:", user.get("name"))
print("email:", user.get("email"))  # None，不报错
print("email带默认值:", user.get("email", "未设置"))

print("\\n=== 2. keys()、values()、items() ===")
scores = {"语文": 85, "数学": 92, "英语": 78}
print("字典:", scores)

print("keys()所有键:", scores.keys())
print("values()所有值:", scores.values())
print("items()所有键值对:", scores.items())

# 转换成列表
print("键列表:", list(scores.keys()))
print("值列表:", list(scores.values()))

print("\\n=== 3. update() 合并字典 ===")
d1 = {"a": 1, "b": 2}
d2 = {"b": 20, "c": 3}
print("d1:", d1)
print("d2:", d2)
d1.update(d2)  # d2的键覆盖d1中同名的键
print("d1.update(d2)后:", d1)

# update也可以用关键字参数
d1.update(d=4, e=5)
print("update关键字参数后:", d1)

print("\\n=== 4. setdefault() ===")
counter = {}
words = ["apple", "banana", "apple", "orange", "banana", "apple"]

for word in words:
    # 如果键不存在，设置为0；存在则不改变
    counter.setdefault(word, 0)
    counter[word] += 1

print("单词计数:", counter)

# 对比：存在则返回现有值
print("apple的值:", counter.setdefault("apple", 0))
print("grape的值(新增):", counter.setdefault("grape", 100))
print("现在:", counter)

print("\\n=== 5. fromkeys() 创建字典 ===")
# 所有键初始化为同一个值
keys = ["name", "age", "city"]
person = dict.fromkeys(keys, "未填写")
print("fromkeys创建:", person)

# 注意：可变默认值会共享引用！
keys2 = ["a", "b", "c"]
bad = dict.fromkeys(keys2, [])  # 所有键指向同一个列表！
bad["a"].append(1)
print("(警告)用可变默认值:", bad)  # b和c也变了！

print("\\n=== 6. pop() 和 popitem() ===")
d = {"x": 10, "y": 20, "z": 30}
print("初始:", d)
val = d.pop("y")
print(f"pop('y')={val}, 剩余:", d)
val = d.pop("w", "不存在")  # 带默认值不报错
print(f"pop('w')={val}")

item = d.popitem()
print(f"popitem()={item}, 剩余:", d)

print("\\n=== 7. copy() 浅拷贝 ===")
original = {"a": 1, "b": [1, 2]}
copied = original.copy()
copied["a"] = 100
copied["b"].append(3)
print("原字典:", original)  # 注意b列表也被改了（浅拷贝）
print("拷贝修改后:", copied)`
  },
  {
    id: "py6-dict-iterate",
    group: "数据结构",
    icon: "🔄",
    title: "字典遍历技巧",
    content: `## 字典遍历技巧

遍历字典是常见操作，有多种方式，效率也不同。

### 基本遍历方式

1. **遍历键**：\`for key in d\` 或 \`for key in d.keys()\`
2. **遍历值**：\`for value in d.values()\`
3. **遍历键值对**：\`for key, value in d.items()\`（最常用）

### 推荐做法

- 需要键和值时，用 \`items()\` 直接解包，不要在循环里再 \`d[key]\`
- 需要修改值时，可以遍历键，然后通过键修改
- Python 3.7+ 按插入顺序遍历

### 常见错误

- 遍历字典时不能直接添加/删除键，会导致 \`RuntimeError\`
- 如果需要删除，先把键转成列表再遍历

### 性能提示

- \`key in d\` 是 O(1) 操作（非常快）
- \`key in list(d.keys())\` 是 O(n) 操作（慢），不要这么写`,
    code: `# 字典遍历技巧演示
student = {
    "name": "小明",
    "age": 18,
    "score": 95,
    "city": "北京",
    "grade": "高三"
}
print("学生字典:", student)

print("\\n=== 1. 遍历键（两种写法）===")
# 方式1：直接遍历（默认遍历键）
print("方式1: for key in d:")
for key in student:
    print(f"  {key}")

# 方式2：显式keys()
print("\\n方式2: for key in d.keys():")
for key in student.keys():
    print(f"  {key}")

print("\\n=== 2. 遍历值 ===")
print("for value in d.values():")
for value in student.values():
    print(f"  {value}")

print("\\n=== 3. 遍历键值对（最常用！）===")
print("for key, value in d.items():")
for key, value in student.items():
    print(f"  {key}: {value}")

print("\\n=== 4. 遍历中修改值 ===")
scores = {"语文": 85, "数学": 78, "英语": 92}
print("加分前:", scores)
# 遍历键，然后给每个分数加5分
for key in scores:
    scores[key] += 5
print("加分后:", scores)

print("\\n=== 5. 遍历中不要直接增删键 ===")
# 错误写法（会报错）:
# d = {"a": 1, "b": 2, "c": 3}
# for key in d:
#     if key == "b":
#         del d[key]  # RuntimeError!

# 正确写法：先把键转成列表
d = {"a": 1, "b": 2, "c": 3, "d": 4}
print("原字典:", d)
keys_to_delete = []
for key in d:
    if d[key] % 2 == 0:  # 删除偶数值的键
        keys_to_delete.append(key)
for key in keys_to_delete:
    del d[key]
print("删除偶数值后:", d)

# 或者用字典推导式更简洁
d2 = {"a": 1, "b": 2, "c": 3, "d": 4}
d2 = {k: v for k, v in d2.items() if v % 2 == 1}
print("字典推导式过滤:", d2)

print("\\n=== 6. 带索引遍历（enumerate）===")
# items()加enumerate可以获取序号
print("带序号遍历:")
for i, (key, value) in enumerate(student.items(), 1):
    print(f"  {i}. {key}: {value}")

print("\\n=== 7. 检查键是否存在（高效写法）===")
print("'name' in student:", "name" in student)  # O(1) 很快
print("不要这么写: 'name' in list(student.keys())")`
  },
  {
    id: "py6-dict-merge",
    group: "数据结构",
    icon: "🤝",
    title: "字典合并与更新（|运算符合并/update/**解包）",
    content: `## 字典合并与更新

Python 提供了多种合并字典的方式，不同方式有不同的行为。

### 方法对比

1. **\`{**d1, **d2}\`**：解包方式，返回新字典（Python 3.5+）
2. **\`d1 | d2\`**：合并运算符，返回新字典（Python 3.9+）
3. **\`d1 |= d2\`**：原地合并，修改 d1（Python 3.9+）
4. **\`d1.update(d2)\`**：原地更新，修改 d1（所有版本）

### 合并规则

- 相同的键，后面的字典会**覆盖**前面的
- \`|\` 和 \`{**d1, **d2}\` 返回新字典，不影响原字典
- \`|=\` 和 \`update()\` 是原地修改

### 多个字典合并

\`\`\`python
# 用 ** 解包多个字典到新字典中合并
# 解包多个
merged = {**d1, **d2, **d3}
# | 运算符合并字典，右侧覆盖左侧同键
# | 链式合并
merged = d1 | d2 | d3
\`\`\`

### 注意事项

- \`|\` 运算符要求两边都是字典，不像 update 可以传键值对
- 嵌套字典的合并不是深合并，内层字典仍会被覆盖`,
    code: `# 字典合并与更新演示
print("=== 1. 准备测试字典 ===")
d1 = {"a": 1, "b": 2}
d2 = {"b": 20, "c": 3}
d3 = {"c": 30, "d": 4}
print(f"d1 = {d1}")
print(f"d2 = {d2}")
print(f"d3 = {d3}")

print("\\n=== 2. {**d1, **d2} 解包合并（Python3.5+）===")
merged1 = {**d1, **d2}
print(f"{{**d1, **d2}} = {merged1}")
print(f"d1未改变: {d1}")

# 多个字典合并
merged_multi = {**d1, **d2, **d3}
print(f"三个合并: {merged_multi}")

# 也可以在解包时直接加键值对
merged_extra = {**d1, **d2, "e": 5, "f": 6}
print(f"合并后加新键: {merged_extra}")

print("\\n=== 3. | 运算符合并（Python3.9+）===")
merged2 = d1 | d2
print(f"d1 | d2 = {merged2}")
print(f"d1未改变: {d1}")

# 链式合并多个
merged3 = d1 | d2 | d3
print(f"d1 | d2 | d3 = {merged3}")

print("\\n=== 4. |= 原地合并（Python3.9+）===")
d1_copy = d1.copy()
print(f"合并前: {d1_copy}")
d1_copy |= d2
print(f"d1 |= d2后: {d1_copy}")  # d1被修改了

print("\\n=== 5. update() 原地更新 ===")
d1_copy2 = d1.copy()
print(f"更新前: {d1_copy2}")
d1_copy2.update(d2)
print(f"update(d2)后: {d1_copy2}")

# update还可以用关键字参数
d1_copy2.update(e=5, f=6)
print(f"update(e=5,f=6)后: {d1_copy2}")

print("\\n=== 6. 覆盖规则演示 ===")
config_default = {"host": "localhost", "port": 3306, "debug": False}
config_user = {"host": "192.168.1.100", "debug": True}
print(f"默认配置: {config_default}")
print(f"用户配置: {config_user}")
# 用户配置覆盖默认配置
final_config = {**config_default, **config_user}
print(f"最终配置: {final_config}")

print("\\n=== 7. 注意：不是深合并 ===")
dict_a = {"info": {"name": "张三", "age": 20}, "id": 1}
dict_b = {"info": {"city": "北京"}}
print(f"dict_a = {dict_a}")
print(f"dict_b = {dict_b}")
# info整个被覆盖，不是合并
merged_shallow = {**dict_a, **dict_b}
print(f"普通合并结果: {merged_shallow}")
print("(info里的name和age丢失了！)")`
  },
  {
    id: "py6-set",
    group: "数据结构",
    icon: "🧮",
    title: "集合（创建/添加/删除/集合运算/去重）",
    content: `## 集合（Set）

集合是**无序、不重复**的元素集合，类似于数学中的集合概念，主要用于去重和成员检测。

### 创建集合

\`\`\`python
# 花括号创建集合，元素自动去重
# 花括号创建（注意：空集合不能用{}，那是空字典）
s = {1, 2, 3}
# set() 创建空集合，或从可迭代对象生成集合
# set()构造函数（可从任意可迭代对象创建）
empty_set = set()
# 列表中重复元素会被去除
from_list = set([1, 2, 2, 3, 3, 3])  # 自动去重
# 字符串按字符去重生成集合
from_str = set("hello")  # {'h', 'e', 'l', 'o'}
\`\`\`

### 基本操作

- \`add(x)\`：添加元素
- \`remove(x)\`：删除元素（不存在报错）
- \`discard(x)\`：删除元素（不存在不报错）
- \`pop()\`：随机删除并返回一个元素
- \`clear()\`：清空集合

### 主要用途

1. **去重**：快速去除列表中的重复元素
2. **成员检测**：\`x in s\` 是 O(1) 极快
3. **集合运算**：交集、并集、差集等

### frozenset 不可变集合

\`frozenset\` 是集合的**不可变**版本，创建后不能增删元素。因为不可变所以可哈希，可以作为字典的键或放入另一个集合中（普通 \`set\` 不行）。

\`\`\`python
# frozenset 创建后不可修改，自动去重
fs = frozenset([1, 2, 3, 2, 1])
print(fs)  # frozenset({1, 2, 3})
# fs.add(4)  # AttributeError! frozenset 不可变
# 不可变 → 可哈希 → 可作为字典的键或集合的元素
d = {frozenset([1, 2]): "一对"}
print(d[frozenset([1, 2])])  # 一对
\`\`\`

### 注意事项

- 元素必须是**不可变**类型（和字典键一样）
- 集合是无序的，没有索引，不能切片
- 空集合必须用 \`set()\`，\`{}\` 是空字典`,
    code: `# 集合基础演示
print("=== 1. 创建集合 ===")
# 基本创建
fruits = {"苹果", "香蕉", "橙子", "苹果"}  # 重复的自动去重
print("自动去重:", fruits)

# set()从列表创建
numbers = set([1, 2, 2, 3, 3, 3, 4])
print("从列表创建:", numbers)

# set()从字符串创建
chars = set("hello world")
print("从字符串创建:", chars)  # 每个字符去重

# 空集合必须用set()
empty = set()
print("空集合:", empty, type(empty))
not_empty_dict = {}  # 这是空字典！
print("{{}}类型:", type(not_empty_dict))

print("\\n=== 2. 添加元素 ===")
s = {1, 2, 3}
print("初始:", s)
s.add(4)
print("add(4):", s)
s.add(2)  # 添加已存在的元素，无效果
print("add(2)(已存在):", s)

# update添加多个元素
s.update([5, 6])
s.update({7, 8})
s.update([9], [10])
print("update添加多个:", s)

print("\\n=== 3. 删除元素 ===")
s2 = {1, 2, 3, 4, 5}
print("初始:", s2)

# remove: 删除元素，不存在报错KeyError
s2.remove(3)
print("remove(3):", s2)
# s2.remove(100)  # KeyError!

# discard: 删除元素，不存在不报错
s2.discard(5)
print("discard(5):", s2)
s2.discard(100)  # 不报错
print("discard(100)(不存在):", s2)

# pop: 随机删除并返回一个（无序所以随机）
popped = s2.pop()
print(f"pop()删除了{popped}, 剩余:", s2)

# clear清空
s2.clear()
print("clear后:", s2)

print("\\n=== 4. 集合运算 ===")
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
print(f"a = {a}")
print(f"b = {b}")

# 交集：两个集合都有的元素
print("交集a & b:", a & b)
print("交集a.intersection(b):", a.intersection(b))

# 并集：两个集合所有元素
print("并集a | b:", a | b)
print("并集a.union(b):", a.union(b))

# 差集：a有b没有的
print("差集a - b:", a - b)
print("差集a.difference(b):", a.difference(b))

# 对称差集：只在其中一个集合的元素
print("对称差集a ^ b:", a ^ b)
print("对称差集a.symmetric_difference(b):", a.symmetric_difference(b))

print("\\n=== 5. 常用场景：去重 ===")
# 列表去重
names = ["小明", "小红", "小明", "小刚", "小红", "小明"]
unique_names = list(set(names))
print("原列表:", names)
print("去重后:", unique_names)
print("注意：顺序可能变了（集合无序）")

# 如果要保持顺序，用dict.fromkeys（Python3.7+保序）
unique_ordered = list(dict.fromkeys(names))
print("保序去重:", unique_ordered)

print("\\n=== 6. 成员检测（超快）===")
big_set = set(range(1000000))
big_list = list(range(1000000))
# 集合查找是O(1)，列表是O(n)
print("999999在集合中:", 999999 in big_set)  # 瞬间完成

print("\\n=== 7. frozenset 不可变集合 ===")
# frozenset 创建后不可修改，自动去重
fs = frozenset([1, 2, 3, 2, 1])
print("frozenset:", fs, "类型:", type(fs).__name__)
# fs.add(4)  # AttributeError! 不可变
# frozenset 支持集合运算（但不支持原地修改运算）
print("frozenset 交集:", fs & frozenset([2, 3, 4]))

# frozenset 可哈希，可作为字典的键（普通 set 不行）
d = {frozenset(["a", "b"]): "字母对"}
print("作为字典键:", d[frozenset(["a", "b"])])
# 也可作为另一个集合的元素
nested = {frozenset([1, 2]), frozenset([3, 4])}
print("集合套frozenset:", nested)`
  },
  {
    id: "py6-set-operations",
    group: "数据结构",
    icon: "➕➖",
    title: "集合运算详解（交集/并集/差集/对称差集/子集超集）",
    content: `## 集合运算详解

集合支持完整的数学集合运算，运算符和方法两种形式都可以使用。

### 基础集合运算

| 运算 | 运算符 | 方法 | 含义 |
|------|--------|------|------|
| 交集 | \`a & b\` | \`a.intersection(b)\` | 同时在a和b中的元素 |
| 并集 | \`a | b\` | \`a.union(b)\` | 在a或b中的所有元素 |
| 差集 | \`a - b\` | \`a.difference(b)\` | 在a中但不在b中的元素 |
| 对称差集 | \`a ^ b\` | \`a.symmetric_difference(b)\` | 只在其中一个集合的元素 |

### 关系判断

- \`a <= b\` / \`a.issubset(b)\`：a是b的子集
- \`a >= b\` / \`a.issuperset(b)\`：a是b的超集
- \`a.isdisjoint(b)\`：a和b没有共同元素（交集为空）

### 原地修改版本

很多方法有 \`update\` 版本，原地修改集合：
- \`a &= b\` / \`a.intersection_update(b)\`
- \`a |= b\` / \`a.update(b)\`
- \`a -= b\` / \`a.difference_update(b)\`
- \`a ^= b\` / \`a.symmetric_difference_update(b)\`

### 注意事项

- 运算符版本两边必须都是集合
- 方法版本可以接受任意可迭代对象`,
    code: `# 集合运算详解
print("=== 1. 交集 & / intersection() ===")
math_class = {"小明", "小红", "小刚", "小华"}
english_class = {"小红", "小华", "小李", "小王"}
print("数学班:", math_class)
print("英语班:", english_class)

# 两个班都参加的学生（交集）
both = math_class & english_class
print("两个班都参加:", both)
both2 = math_class.intersection(english_class)
print("intersection():", both2)

# intersection可以接受多个参数
physics_class = {"小刚", "小明", "小王"}
all_three = math_class & english_class & physics_class
print("三个班都参加:", all_three)

print("\\n=== 2. 并集 | / union() ===")
# 参加任意一个班的学生
all_students = math_class | english_class
print("参加至少一个班:", all_students)

print("\\n=== 3. 差集 - / difference() ===")
# 只参加数学班的
only_math = math_class - english_class
print("只参加数学班:", only_math)
# 只参加英语班的
only_english = english_class - math_class
print("只参加英语班:", only_english)

print("\\n=== 4. 对称差集 ^ / symmetric_difference() ===")
# 只参加一个班（不同时参加两个）
one_class = math_class ^ english_class
print("只参加一个班:", one_class)

print("\\n=== 5. 子集和超集 ===")
a = {1, 2}
b = {1, 2, 3, 4}
c = {1, 2}
print(f"a={a}, b={b}, c={c}")

print("a是b的子集吗?", a <= b)
print("a.issubset(b):", a.issubset(b))
print("b是a的超集吗?", b >= a)
print("b.issuperset(a):", b.issuperset(a))
print("a是c的子集吗?", a <= c, "(相等也是子集)")
print("a是c的真子集吗?", a < c, "(真子集要求严格小于)")

# isdisjoint: 没有共同元素
d = {5, 6}
print("a和d有交集吗?", a.isdisjoint(d))

print("\\n=== 6. 原地更新版本 ===")
s = {1, 2, 3, 4}
print("初始:", s)

s &= {2, 3, 4, 5}  # 原地保留交集
print("&=后:", s)

s |= {6, 7}  # 原地并集
print("|=后:", s)

s -= {2, 6}  # 原地差集
print("-=后:", s)

s ^= {3, 7, 8}  # 原地对称差集
print("^=后:", s)

print("\\n=== 7. 实际应用：找出差异 ===")
# 找出两个列表的不同
old_users = ["alice", "bob", "charlie", "david"]
new_users = ["bob", "charlie", "eve", "frank"]

old_set = set(old_users)
new_set = set(new_users)

print("新增用户:", new_set - old_set)
print("流失用户:", old_set - new_set)
print("共同用户:", old_set & new_set)`
  },
  {
    id: "py6-nested",
    group: "数据结构",
    icon: "🪆",
    title: "嵌套数据结构（列表套字典/字典套列表等）",
    content: `## 嵌套数据结构

实际编程中，我们经常需要组合列表、字典、集合、元组来表示复杂的数据。

### 常见嵌套模式

1. **列表套字典**：表示对象列表（如多个用户信息）
2. **字典套列表**：一个键对应多个值（如班级-学生列表）
3. **字典套字典**：复杂对象（如用户详细信息）
4. **多层嵌套**：更复杂的结构

### 访问嵌套元素

一层一层用方括号访问即可：

\`\`\`python
# students[0] 取列表第一项（字典），再按 "name" 取值
# 获取第一个学生的姓名
students[0]["name"]
# 先取学生字典，再取其 scores 字典中的 math 键
# 获取数学成绩
students[0]["scores"]["math"]
\`\`\`

### 遍历嵌套结构

外层遍历列表，内层遍历字典，或者反过来，根据结构来。

### 注意事项

- 访问前注意检查键/索引是否存在，否则会报错
- 嵌套结构不要太深（一般不超过3层），否则代码难维护
- 深拷贝需要用 \`copy.deepcopy()\``,
    code: `# 嵌套数据结构演示
print("=== 1. 列表套字典（对象列表）===")
# 每个字典代表一个学生
students = [
    {"name": "小明", "age": 18, "score": 85},
    {"name": "小红", "age": 17, "score": 92},
    {"name": "小刚", "age": 18, "score": 78},
]
print("学生列表:")
for student in students:
    print(f"  {student['name']}: {student['score']}分")

# 访问嵌套元素
print(f"第一个学生姓名: {students[0]['name']}")
print(f"第二个学生分数: {students[1]['score']}")

# 修改嵌套值
students[2]["score"] = 88
print(f"修改小刚分数后: {students[2]}")

print("\\n=== 2. 字典套列表 ===")
# 键是班级，值是学生列表
classes = {
    "一班": ["小明", "小红", "小刚"],
    "二班": ["小华", "小李", "小王"],
    "三班": ["小张", "小陈"],
}
print("班级字典:", classes)
print("一班学生:", classes["一班"])
print("二班第二个学生:", classes["二班"][1])

# 给一班添加学生
classes["一班"].append("小赵")
print("添加后一班:", classes["一班"])

print("\\n=== 3. 字典套字典 ===")
# 复杂对象
user = {
    "name": "张三",
    "age": 30,
    "contact": {
        "email": "zhangsan@example.com",
        "phone": "13800138000",
        "address": {
            "city": "北京",
            "district": "朝阳区",
        }
    },
    "scores": {
        "语文": 88,
        "数学": 95,
    }
}
print("用户信息:", user["name"])
print("邮箱:", user["contact"]["email"])
print("城市:", user["contact"]["address"]["city"])
print("数学分数:", user["scores"]["数学"])

print("\\n=== 4. 更复杂的混合嵌套 ===")
# 班级-学生-成绩 多层嵌套
school = {
    "一年级": {
        "1班": [
            {"name": "小明", "scores": {"语文": 85, "数学": 90}},
            {"name": "小红", "scores": {"语文": 92, "数学": 88}},
        ],
        "2班": [
            {"name": "小刚", "scores": {"语文": 78, "数学": 85}},
        ]
    }
}

# 访问
print("一年级1班第一个学生:")
print(f"  姓名: {school['一年级']['1班'][0]['name']}")
print(f"  数学: {school['一年级']['1班'][0]['scores']['数学']}")

print("\\n=== 5. 遍历嵌套结构 ===")
print("遍历所有班级学生:")
for class_name, student_list in classes.items():
    print(f"{class_name}:")
    for i, student_name in enumerate(student_list, 1):
        print(f"  {i}. {student_name}")

print("\\n计算所有学生总分:")
total = 0
count = 0
for student in students:
    total += student["score"]
    count += 1
print(f"总分: {total}, 平均分: {total/count:.1f}")

print("\\n=== 6. 添加新元素 ===")
# 添加新班级
classes["四班"] = ["小周", "小吴"]
print("添加四班后:", list(classes.keys()))

# 给学生添加新字段
students[0]["gender"] = "男"
print("添加性别字段:", students[0])`
  },
  {
    id: "py6-copy",
    group: "数据结构",
    icon: "📑",
    title: "浅拷贝与深拷贝（copy.copy/copy.deepcopy/赋值引用区别）",
    content: `## 浅拷贝与深拷贝

Python 中赋值、浅拷贝、深拷贝是三个不同的概念，理解它们对避免 bug 非常重要。

### 三种方式的区别

1. **直接赋值（\`b = a\`）**：
   - 只是复制引用，b 和 a 指向**同一个对象**
   - 修改 b 会影响 a，反之亦然

2. **浅拷贝（\`copy.copy(a)\` / \`a.copy()\` / \`a[:]\`）**：
   - 创建新对象，但内部元素还是引用
   - 修改外层不影响，但修改**内部嵌套的可变对象**会互相影响

3. **深拷贝（\`copy.deepcopy(a)\`）**：
   - 完全递归拷贝所有层次
   - 两个对象完全独立，修改任何地方都互不影响

### 浅拷贝的几种写法

\`\`\`python
# 三种等价的列表浅拷贝方式，仅复制外层容器
# 列表浅拷贝
new_list = old_list.copy()
# list() 转换也会产生新列表
new_list = list(old_list)
# 切片 [:] 同样返回浅拷贝
new_list = old_list[:]
# 字典也有 copy 方法做浅拷贝
# 字典浅拷贝
new_dict = old_dict.copy()
\`\`\`

### 什么时候用深拷贝

当数据结构中有嵌套的可变对象（如列表套列表、字典套字典），并且你需要完全独立的副本时。

### 注意事项

- 浅拷贝比深拷贝快，没有嵌套时用浅拷贝足够
- 不可变元素（数字、字符串、元组）即使浅拷贝也没关系，因为不能修改`,
    code: `# 浅拷贝与深拷贝演示
import copy

print("=== 1. 直接赋值：引用同一个对象 ===")
a = [1, 2, 3]
b = a  # 只是引用，不是复制
print(f"a = {a}, id = {id(a)}")
print(f"b = {b}, id = {id(b)}")
print("a和b是同一个对象吗?", a is b)

b.append(4)
print(f"b.append(4)后:")
print(f"a = {a}  <-- a也变了！")
print(f"b = {b}")

print("\\n=== 2. 浅拷贝：外层新对象，内层还是引用 ===")
a = [1, 2, [3, 4]]  # 嵌套列表
b = a.copy()  # 浅拷贝
print(f"a = {a}, id = {id(a)}")
print(f"b = {b}, id = {id(b)}")
print("a和b是同一个对象吗?", a is b)

# 修改外层不影响
b.append(5)
print(f"\\nb.append(5)后(外层):")
print(f"a = {a}")
print(f"b = {b}  <-- 只有b变了")

# 修改内层列表会影响！
b[2].append(6)
print(f"\\nb[2].append(6)后(内层):")
print(f"a = {a}  <-- a的内层也变了！")
print(f"b = {b}")
print("因为内层列表还是同一个对象:", a[2] is b[2])

print("\\n=== 3. 其他浅拷贝方式 ===")
lst1 = [1, 2, 3]
lst2 = list(lst1)  # list()构造
lst3 = lst1[:]     # 切片
print(f"原列表: {lst1}")
lst2.append(4)
lst3.append(5)
print(f"list()拷贝: {lst2}")
print(f"[:]切片拷贝: {lst3}")
print(f"原列表不受影响: {lst1}")

# 字典的浅拷贝
d1 = {"a": 1, "b": [1, 2]}
d2 = d1.copy()
d2["a"] = 100
d2["b"].append(3)
print(f"\\n字典浅拷贝:")
print(f"d1 = {d1}  <-- b列表被影响了")
print(f"d2 = {d2}")

print("\\n=== 4. 深拷贝：完全独立 ===")
a = [1, 2, [3, 4]]
b = copy.deepcopy(a)
print(f"a = {a}")
print(f"b = {b}")

b[2].append(5)
b.append(6)
print(f"\\n修改b后:")
print(f"a = {a}  <-- a完全不受影响！")
print(f"b = {b}")
print("内层列表是不同对象:", a[2] is b[2])

print("\\n=== 5. 实际例子：避免模板污染 ===")
# 错误写法（浅拷贝导致共享）
student_template = {"name": "", "scores": []}
s1 = student_template.copy()
s1["name"] = "小明"
s1["scores"].append(85)  # 所有学生的scores都是同一个列表！

s2 = student_template.copy()
s2["name"] = "小红"
s2["scores"].append(92)

print("浅拷贝的问题:")
print(f"s1 = {s1}")
print(f"s2 = {s2}  <-- 小明的分数跑到小红这里了！")

# 正确写法（深拷贝或者每次新建）
def new_student(name):
    return {"name": name, "scores": []}

s3 = new_student("小明")
s3["scores"].append(85)
s4 = new_student("小红")
s4["scores"].append(92)
print("\\n正确写法:")
print(f"s3 = {s3}")
print(f"s4 = {s4}")`
  },
  {
    id: "py6-list-comprehension",
    group: "数据结构",
    icon: "⚡",
    title: "列表推导式（基础/带条件/嵌套/矩阵转置）",
    content: `## 列表推导式

列表推导式（List Comprehension）是 Python 中非常优雅且高效的创建列表的方式，可以替代很多 for 循环。

### 基本语法

\`\`\`python
# 列表推导式语法：对每个元素求表达式，收集成新列表
[表达式 for 变量 in 可迭代对象]
# 等价于：
# 创建空列表存放结果
result = []
# 遍历可迭代对象的每个元素
for 变量 in 可迭代对象:
    # 把表达式结果追加到结果列表
    result.append(表达式)
\`\`\`

### 带条件筛选

\`\`\`python
# 带条件的列表推导式：仅对满足条件的元素求表达式
[表达式 for 变量 in 可迭代对象 if 条件]
\`\`\`

### 嵌套循环

\`\`\`python
# 嵌套循环的列表推导式：外层循环在前，内层循环在后
[表达式 for 变量1 in 可迭代对象1 for 变量2 in 可迭代对象2]
\`\`\`

### 优点

- 代码简洁，一行搞定
- 比普通 for 循环 + append 更快（底层优化）
- 可读性好（熟悉之后）

### 注意事项

- 不要写太复杂的推导式（超过2层循环就考虑用普通循环）
- 不要为了用推导式而用推导式，简单清晰最重要
- 推导式里的赋值（海象运算符:=）Python 3.8+ 支持`,
    code: `# 列表推导式演示
print("=== 1. 基础列表推导式 ===")
# 生成1-10的平方
squares = [x**2 for x in range(1, 11)]
print("1-10的平方:", squares)

# 等价的普通写法
squares2 = []
for x in range(1, 11):
    squares2.append(x**2)
print("普通写法结果:", squares2)

# 对列表元素做处理
names = ["alice", "bob", "charlie"]
upper_names = [name.upper() for name in names]
print("转大写:", upper_names)

print("\\n=== 2. 带if条件筛选 ===")
# 只取偶数
evens = [x for x in range(1, 21) if x % 2 == 0]
print("1-20的偶数:", evens)

# 过滤短单词
words = ["apple", "is", "a", "fruit", "it", "tastes", "good"]
long_words = [w for w in words if len(w) > 3]
print("长度大于3的单词:", long_words)

# 条件转换（奇数变负数，偶数不变）
nums = [1, 2, 3, 4, 5, 6]
transformed = [x if x % 2 == 0 else -x for x in nums]
print("奇数变负:", transformed)

print("\\n=== 3. 嵌套循环推导式 ===")
# 扁平化二维列表
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flattened = [num for row in matrix for num in row]
print("扁平化矩阵:", flattened)

# 等价于：
flattened2 = []
for row in matrix:
    for num in row:
        flattened2.append(num)
print("普通循环结果:", flattened2)

# 笛卡儿积
colors = ["红", "蓝"]
sizes = ["S", "M", "L"]
combos = [c + s for c in colors for s in sizes]
print("颜色x尺码组合:", combos)

print("\\n=== 4. 矩阵转置 ===")
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
print("原矩阵:")
for row in matrix:
    print(" ", row)

# 用zip转置
transposed = [list(col) for col in zip(*matrix)]
print("\\n转置后:")
for row in transposed:
    print(" ", row)

# 不使用zip，嵌套推导式
transposed2 = [[matrix[j][i] for j in range(len(matrix))] for i in range(len(matrix[0]))]
print("嵌套推导式转置:", transposed2)

print("\\n=== 5. 实用例子 ===")
# 提取字典中所有值
data = [{"name": "小明", "age": 18}, {"name": "小红", "age": 17}]
ages = [d["age"] for d in data]
print("所有年龄:", ages)

# 列表去重并保持顺序
numbers = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
unique = []
[unique.append(x) for x in numbers if x not in unique]
print("保序去重:", unique)  # 不过更推荐dict.fromkeys方式`
  },
  {
    id: "py6-dict-set-comprehension",
    group: "数据结构",
    icon: "🚀",
    title: "字典和集合推导式",
    content: `## 字典和集合推导式

和列表推导式类似，Python 也支持字典和集合的推导式，语法非常相似。

### 字典推导式

\`\`\`python
# 字典推导式：用键值表达式为每个元素生成键值对
{键表达式: 值表达式 for 变量 in 可迭代对象}
# 可加 if 过滤元素
{键表达式: 值表达式 for 变量 in 可迭代对象 if 条件}
\`\`\`

### 集合推导式

\`\`\`python
# 集合推导式：对元素求表达式并自动去重
{表达式 for 变量 in 可迭代对象}
# 可加 if 条件过滤元素
{表达式 for 变量 in 可迭代对象 if 条件}
\`\`\`

### 常见用法

1. **字典推导式**：
   - 两个列表合并成字典
   - 键值互换
   - 过滤/修改字典内容

2. **集合推导式**：
   - 去重
   - 集合运算的简化写法

### 注意事项

- 字典推导式用冒号 \`:\` 分隔键和值，集合推导式没有
- 集合推导式和字典推导式都用花括号 \`{}\`
- 没有元组推导式！圆括号写出来的是**生成器表达式**`,
    code: `# 字典和集合推导式演示
print("=== 1. 集合推导式 ===")
# 生成平方集合
square_set = {x**2 for x in range(-5, 6)}
print("平方集合:", square_set)  # 自动去重

# 字符串中字符集合
chars = {c for c in "hello world" if c != " "}
print("字符集合(去空格):", chars)

# 列表去重
numbers = [1, 2, 2, 3, 3, 3, 4, 5, 5]
unique_set = {x for x in numbers}
print("去重集合:", unique_set)

print("\\n=== 2. 字典推导式基础 ===")
# 数字: 平方 的字典
square_dict = {x: x**2 for x in range(1, 6)}
print("数字:平方:", square_dict)

# 从两个列表创建字典
keys = ["name", "age", "city"]
values = ["小明", 18, "北京"]
person = {k: v for k, v in zip(keys, values)}
print("从两个列表:", person)

# 等价于dict(zip(...))
person2 = dict(zip(keys, values))
print("dict(zip)方式:", person2)

print("\\n=== 3. 键值互换 ===")
english_chinese = {"apple": "苹果", "banana": "香蕉", "orange": "橙子"}
chinese_english = {v: k for k, v in english_chinese.items()}
print("英→中:", english_chinese)
print("中→英:", chinese_english)

# 注意：值有重复时，后面的会覆盖前面的
duplicate_values = {"a": 1, "b": 2, "c": 1}
flipped = {v: k for k, v in duplicate_values.items()}
print("值重复时交换:", flipped, "  <-- 1对应a丢失了")

print("\\n=== 4. 过滤字典 ===")
scores = {"小明": 85, "小红": 92, "小刚": 58, "小华": 76, "小李": 95}
print("所有成绩:", scores)

# 只保留及格的（>=60）
passed = {name: score for name, score in scores.items() if score >= 60}
print("及格的:", passed)

# 键转大写
upper_keys = {k.upper(): v for k, v in scores.items()}
print("键大写:", upper_keys)

print("\\n=== 5. 统一处理值 ===")
prices = {"apple": 5.5, "banana": 3.2, "orange": 4.8}
print("原价:", prices)
# 全部打8折
sale_prices = {k: round(v * 0.8, 2) for k, v in prices.items()}
print("8折后:", sale_prices)

# 值分类
nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
categories = {
    "偶数": [n for n in nums if n % 2 == 0],
    "奇数": [n for n in nums if n % 2 == 1],
}
print("分类:", categories)

print("\\n=== 6. 字符计数（字典推导式进阶）===")
text = "hello python"
char_count = {c: text.count(c) for c in set(text) if c != " "}
print("字符计数:", char_count)

print("\\n=== 7. 注意：没有元组推导式！===")
# ()里的是生成器表达式，不是元组推导式
gen = (x**2 for x in range(5))
print("()的类型:", type(gen))  # generator
print("转成列表:", list(gen))
# 要创建元组用tuple()
tuple_result = tuple(x**2 for x in range(5))
print("元组结果:", tuple_result)`
  },
  {
    id: "py6-unpacking",
    group: "数据结构",
    icon: "📤",
    title: "解包操作（*解包/**解包/多变量赋值/交换变量）",
    content: `## 解包操作（Unpacking）

解包是 Python 中非常优雅的特性，可以把可迭代对象中的元素"拆开"赋值给变量。

### 基础解包

\`\`\`python
# 把列表元素依次赋给多个变量
a, b, c = [1, 2, 3]  # 列表解包
# 元组同样可以解包
x, y, z = (4, 5, 6)  # 元组解包
# 注意：变量数量必须和元素数量一致，否则会抛出 ValueError
# 注意：变量数量必须和元素数量一致
\`\`\`

### * 号解包（收集多余元素）

\`\`\`python
# 星号把剩余元素收集为列表赋给 rest
first, *rest = [1, 2, 3, 4, 5]
# first=1, rest=[2,3,4,5]
# 星号也可放在中间，收集中间部分
first, *middle, last = [1, 2, 3, 4, 5]
# first=1, middle=[2,3,4], last=5
\`\`\`

### 函数调用中的解包

- \`*iterable\`：解包位置参数
- \`**dict\`：解包关键字参数

### 常见用途

1. 交换变量：\`a, b = b, a\`
2. 函数多返回值解包
3. 合并列表/字典：\`[*list1, *list2]\`、\`{**d1, **d2}\`
4. 忽略某些值：用 \`_\` 作为占位符`,
    code: `# 解包操作演示
print("=== 1. 基础多变量赋值 ===")
# 列表解包
a, b, c = [1, 2, 3]
print(f"列表解包: a={a}, b={b}, c={c}")

# 元组解包（括号可以省略）
x, y, z = 4, 5, 6
print(f"元组解包: x={x}, y={y}, z={z}")

# 字符串解包
p, y, t, h, o, n = "Python"
print(f"字符串解包: {p}{y}{t}{h}{o}{n}")

# 数量必须匹配！
# a, b = [1, 2, 3]  # ValueError（太多值）
# a, b, c = [1, 2]  # ValueError（不够值）

print("\\n=== 2. 交换变量（最常用！）===")
m = 10
n = 20
print(f"交换前: m={m}, n={n}")
m, n = n, m  # 不需要临时变量！
print(f"交换后: m={m}, n={n}")

# 多个变量也可以交换
a, b, c = 1, 2, 3
print(f"轮换前: a={a}, b={b}, c={c}")
a, b, c = c, a, b
print(f"轮换后: a={a}, b={b}, c={c}")

print("\\n=== 3. *号收集多余元素 ===")
first, *rest = [1, 2, 3, 4, 5]
print(f"first={first}, rest={rest}")

*head, last = [1, 2, 3, 4, 5]
print(f"head={head}, last={last}")

first, *middle, last = [1, 2, 3, 4, 5]
print(f"first={first}, middle={middle}, last={last}")

# 只取首尾
name, *_, score = ["小明", 18, "男", "北京", 95]
print(f"姓名={name}, 分数={score}, 用_忽略中间: {_}")

print("\\n=== 4. 函数返回值解包 ===")
def get_user():
    return "张三", 25, "工程师"  # 返回元组

# 直接解包
name, age, job = get_user()
print(f"姓名={name}, 年龄={age}, 职业={job}")

# 只要部分信息
name, *_ = get_user()
print(f"只要姓名: {name}")

print("\\n=== 5. 函数调用时解包 ===")
def add(a, b, c):
    return a + b + c

nums = [1, 2, 3]
# result = add(nums)  # TypeError!
result = add(*nums)  # 解包成3个位置参数
print(f"add(*[1,2,3]) = {result}")

# **解包字典作为关键字参数
def greet(name, age, city):
    return f"你好，我是{name}，今年{age}岁，来自{city}"

person = {"name": "李四", "age": 30, "city": "上海"}
msg = greet(**person)
print(msg)

print("\\n=== 6. 合并列表/元组 ===")
list1 = [1, 2, 3]
list2 = [4, 5]
combined = [*list1, *list2, 6, 7]
print(f"[*list1, *list2, 6, 7] = {combined}")

# 合并元组
t1 = (1, 2)
t2 = (3, 4)
combined_t = (*t1, *t2, 5)
print(f"(*t1, *t2, 5) = {combined_t}")

print("\\n=== 7. 解包嵌套结构 ===")
data = ("小明", [85, 90, 88])
name, (chinese, math, english) = data
print(f"姓名={name}, 语文={chinese}, 数学={math}, 英语={english}")

# 循环中的解包
pairs = [("苹果", 5), ("香蕉", 3), ("橙子", 4)]
print("\\n水果价格:")
for fruit, price in pairs:
    print(f"  {fruit}: {price}元")

# enumerate也用了解包
for i, (fruit, price) in enumerate(pairs, 1):
    print(f"  {i}. {fruit}: {price}元")`
  },
  {
    id: "py6-collections-counter",
    group: "数据结构",
    icon: "🔢",
    title: "collections.Counter 计数",
    content: `## collections.Counter 计数

\`Counter\` 是 \`collections\` 模块中专门用于计数的类，是字典的子类，用来统计可哈希对象的数量。

### 基本用法

\`\`\`python
# 从 collections 导入 Counter 计数器类
from collections import Counter
# 传入可迭代对象，自动统计每个元素出现次数
# 从可迭代对象创建
# 统计字符串中每个字符的出现次数
cnt = Counter("hello world")  # 字符计数
# 统计列表中每个元素的出现次数
cnt = Counter([1, 2, 2, 3])   # 列表元素计数
# 也可直接传入字典或关键字参数指定计数
# 手动创建
cnt = Counter({"apple": 3, "banana": 2})
# 关键字参数形式等价
cnt = Counter(apple=3, banana=2)
\`\`\`

### 常用方法

- \`most_common(n)\`：返回出现次数最多的 n 个元素
- \`elements()\`：返回所有元素（重复 count 次）的迭代器
- \`update(iterable)\`：增加计数
- \`subtract(iterable)\`：减少计数
- \`total()\`：总计数（Python 3.10+）

### 运算

Counter 支持加减法：
- \`c1 + c2\`：计数相加
- \`c1 - c2\`：计数相减（正数保留）
- \`& \` 和 \`|\`：交集、并集

### 注意事项

- 访问不存在的键不会报错，返回 0
- 计数可以是零或负数（subtract后）`,
    code: `# collections.Counter 演示
from collections import Counter

print("=== 1. 创建Counter ===")
# 从字符串（字符计数）
char_cnt = Counter("hello python programming")
print("字符计数:", char_cnt)

# 从列表
fruits = ["苹果", "香蕉", "苹果", "橙子", "香蕉", "苹果", "香蕉"]
fruit_cnt = Counter(fruits)
print("水果计数:", fruit_cnt)

# 手动创建
cnt1 = Counter({"红": 5, "蓝": 3})
cnt2 = Counter(红=5, 蓝=3)
print("手动创建:", cnt1)

print("\\n=== 2. 访问计数 ===")
# 像字典一样访问
print("苹果出现次数:", fruit_cnt["苹果"])
# 不存在的键返回0（不报错！）
print("西瓜出现次数:", fruit_cnt["西瓜"])

print("\\n=== 3. most_common() 出现最多的 ===")
print("所有水果按次数排序:", fruit_cnt.most_common())
print("出现最多的2个:", fruit_cnt.most_common(2))
print("出现最少的（负数索引）:", fruit_cnt.most_common()[-2:])

# 找出字符串中最常见的字符
text = "abracadabra"
cnt = Counter(text)
print(f"'{text}'中最常见的3个字符:", cnt.most_common(3))

print("\\n=== 4. elements() 获取所有元素 ===")
cnt = Counter(a=3, b=2, c=1)
print("Counter:", cnt)
print("elements():", list(cnt.elements()))  # a出现3次，b出现2次...

print("\\n=== 5. update() 增加计数 ===")
cnt = Counter([1, 2, 2])
print("初始:", cnt)
cnt.update([2, 3, 3, 3])
print("update([2,3,3,3])后:", cnt)
cnt.update({1: 5, 4: 2})
print("update字典后:", cnt)

print("\\n=== 6. subtract() 减少计数 ===")
cnt = Counter(a=5, b=3, c=2)
print("初始:", cnt)
cnt.subtract({"a": 2, "b": 5, "d": 1})
print("subtract后:", cnt)
print("注意：b变成-2，d是-1")

print("\\n=== 7. Counter运算 ===")
c1 = Counter(a=3, b=2, c=1)
c2 = Counter(a=1, b=2, d=4)
print(f"c1 = {c1}")
print(f"c2 = {c2}")
print("c1 + c2 (相加):", c1 + c2)
print("c1 - c2 (相减，只保留正数):", c1 - c2)
print("c1 & c2 (交集取最小):", c1 & c2)
print("c1 | c2 (并集取最大):", c1 | c2)

print("\\n=== 8. 实用例子 ===")
# 统计单词频率
text = """Python is great and Java is also great
Python is easy to learn and Java is also easy
I love Python programming and I also love Java"""
words = text.lower().split()
word_cnt = Counter(words)
print("单词频率Top5:", word_cnt.most_common(5))

# total()总数量(Python3.10+)
print("总单词数:", word_cnt.total())

# 找两个列表的共同元素
list1 = [1, 2, 2, 3, 4, 4, 4]
list2 = [2, 2, 3, 3, 4, 5]
common = Counter(list1) & Counter(list2)
print(f"list1={list1}")
print(f"list2={list2}")
print("共同元素（取最小次数）:", common)
print("共同元素列表:", list(common.elements()))`
  },
  {
    id: "py6-collections-defaultdict",
    group: "数据结构",
    icon: "🗂️",
    title: "collections.defaultdict/OrderedDict/namedtuple",
    content: `## collections 模块常用类

\`collections\` 模块提供了几个非常实用的容器类型，这里介绍三个最常用的。

### defaultdict

\`defaultdict\` 是字典的子类，它可以为不存在的键提供默认值，避免 KeyError。

\`\`\`python
# 导入 defaultdict，访问不存在的键时自动生成默认值
from collections import defaultdict
# 传入 list 作为默认工厂，新键默认值为空列表
# 默认值是list（每个键对应一个列表）
d = defaultdict(list)
# 访问新键时自动创建空列表，可直接 append
d["fruits"].append("apple")  # 不需要先初始化！
# 传入 int 作为默认工厂，新键默认值为 0，便于计数
# 默认值是int（用于计数）
d = defaultdict(int)
# 计数时无需先判断键是否存在
d["apple"] += 1
\`\`\`

### namedtuple 命名元组

命名元组让元组的字段有名字，访问更清晰：

\`\`\`python
# 导入 namedtuple，用于创建具名元组
from collections import namedtuple
# 创建名为 Point 的具名元组类型，字段为 x、y
Point = namedtuple("Point", ["x", "y"])
# 按位置传参创建实例
p = Point(1, 2)
# 可用字段名访问，比下标更清晰
print(p.x, p.y)  # 比p[0], p[1]清晰
\`\`\`

### OrderedDict

Python 3.7+ 普通 dict 已经保序了，但 OrderedDict 还有额外方法：
- \`move_to_end(key)\`：移动键到末尾/开头
- \`popitem(last=True)\`：弹出开头/末尾元素`,
    code: `# collections 模块演示
from collections import defaultdict, namedtuple, OrderedDict

print("=== 1. defaultdict：带默认值的字典 ===")
# 例1：分组（默认list）
students = [("一班", "小明"), ("二班", "小红"), ("一班", "小刚"), ("二班", "小华")]
classes = defaultdict(list)  # 不存在的键默认是空列表
for class_name, student in students:
    classes[class_name].append(student)  # 不需要先判断键是否存在
print("按班级分组:")
for name, members in classes.items():
    print(f"  {name}: {members}")

# 例2：计数（默认int，初始值0）
words = ["apple", "banana", "apple", "orange", "banana", "apple"]
word_count = defaultdict(int)
for word in words:
    word_count[word] += 1
print("单词计数:", dict(word_count))

# 例3：默认set（去重分组）
data = [("A", 1), ("B", 2), ("A", 2), ("B", 1), ("A", 1)]
groups = defaultdict(set)
for k, v in data:
    groups[k].add(v)
print("去重分组:", {k: list(v) for k, v in groups.items()})

# 对比普通dict的写法（更麻烦）
normal_dict = {}
for word in words:
    if word not in normal_dict:
        normal_dict[word] = 0
    normal_dict[word] += 1
print("普通dict实现计数:", normal_dict)

print("\\n=== 2. namedtuple：命名元组 ===")
# 定义Point类型，有x和y两个字段
Point = namedtuple("Point", ["x", "y"])
p1 = Point(3, 4)
p2 = Point(x=5, y=12)
print("p1:", p1)
print("p2:", p2)

# 可以按名字访问（比索引清晰！）
print(f"p1.x={p1.x}, p1.y={p1.y}")
print(f"p2.x={p2[0]}, p2.y={p2[1]}")  # 也支持索引

# 有元组的优点：不可变、可解包
x, y = p1
print(f"解包: x={x}, y={y}")

# 实用例子：表示学生信息
Student = namedtuple("Student", ["name", "age", "score"])
students = [
    Student("小明", 18, 85),
    Student("小红", 17, 92),
    Student("小刚", 18, 78),
]
print("\\n学生列表:")
for s in students:
    print(f"  {s.name}: {s.score}分")

# _replace创建修改后的新元组（因为元组不可变）
s3 = students[0]._replace(score=90)
print(f"修改小明分数: {s3}")
print(f"原元组不变: {students[0]}")

# _asdict()转成字典
print(f"转成字典: {s3._asdict()}")

print("\\n=== 3. OrderedDict：有序字典 ===")
# Python3.7+普通dict已经保序，但OrderedDict有额外方法
od = OrderedDict()
od["a"] = 1
od["b"] = 2
od["c"] = 3
od["d"] = 4
print("OrderedDict:", od)

# move_to_end: 移动键到末尾或开头
od.move_to_end("b")  # 移到末尾
print("b移到末尾:", od)
od.move_to_end("c", last=False)  # last=False移到开头
print("c移到开头:", od)

# popitem
print("弹出末尾:", od.popitem())  # 默认last=True
print("弹出开头:", od.popitem(last=False))
print("剩余:", od)

# 应用：LRU缓存简单实现
print("\\n=== 4. 综合例子：统计出现次数并分组 ===")
text = "the quick brown fox jumps over the lazy dog"
words = text.split()
# 按首字母分组
by_first = defaultdict(list)
for word in words:
    by_first[word[0]].append(word)
print("按首字母分组:")
for letter, word_list in sorted(by_first.items()):
    print(f"  {letter}: {word_list}")`
  }
]
