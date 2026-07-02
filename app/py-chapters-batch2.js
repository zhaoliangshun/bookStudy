// =============================================================
// Python 交互式教程 - 第 2 批章节（核心）
// -------------------------------------------------------------
// 本文件包含以下章节（共 4 章，属「核心」分组）：
//   1. py-controlflow    — 条件与循环
//   2. py-functions      — 函数
//   3. py-collections    — 列表 / 元组 / 集合 / 字典
//   4. py-comprehensions — 推导式与函数式工具
//
// 每个章节包含：
//   id      : 唯一标识
//   group   : 分组名（统一为「核心」）
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解（文字量大，含大量示例）
//   code    : 可用 python3 直接运行、带详尽中文注释的示例代码
//
// 编写约束：
//   - content 用模板字符串（反引号）包裹，内部字面反引号用 \` 转义，
//     代码块用三反引号 \`\`\` 包裹。
//   - code 字段同样是模板字符串，其中禁止出现 ${ 与单独的反引号字符；
//     Python f-string 使用 {} 安全。
//   - 所有注释、讲解文字均使用简体中文。
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：条件与循环
  // =========================================================
  {
    id: "py-controlflow",
    group: "核心",
    icon: "🔀",
    title: "条件与循环",
    content: `# 条件与循环

程序的本质是「**根据不同的情况，做不同的事，并反复执行某些步骤**」。本章把 Python 控制流的两条主线讲透：**条件判断**（if / elif / else、match-case 模式匹配）与**循环**（while、for-in、range、break / continue / pass、else 子句、enumerate / zip、嵌套循环）。我们会从最基础的语法讲到容易被忽略的细节，比如 for-else 这种「带 else 的循环」到底什么时候会执行。

---

## 一、条件判断：if / elif / else

### 1.1 最基本的 if 语句

\`if\` 是条件判断的起点。它的语法非常简洁：**关键字 if + 条件表达式 + 冒号 + 缩进的语句块**。注意 Python 不像 C/Java 那样用花括号 \`{}\` 划分代码块，而是用**缩进**（通常是 4 个空格）。缩进不一致会直接报错。

\`\`\`py
age = 20                          # 定义变量 age 并赋值
if age >= 18:           # 条件为 True 才执行下面的语句块
    print("你已成年")    # 缩进 4 空格表示属于 if 的语句块
\`\`\`

要点：
- 冒号 \`:\` 不能省，它是「下面有一个语句块」的信号。
- 缩进必须**统一**，同一层级的语句缩进量必须相同。
- 条件表达式会被求值为布尔值：为 \`True\` 则执行语句块，为 \`False\` 则跳过。

### 1.2 if-else 双分支

当条件不成立时，我们往往想走另一条路，这时用 \`else\`：

\`\`\`py
age = 15                          # 定义变量 age 并赋值
if age >= 18:        # 条件不成立
    print("成年")                    # 输出 "成年"
else:                # 走 else 分支
    print("未成年")   # 打印「未成年」
\`\`\`

\`else\` 后面也必须跟冒号，且不写条件——它表示「所有其他情况」。

### 1.3 多分支：elif

如果有多个互斥的条件，用 \`elif\`（else if 的缩写，Python 独有的关键字，比写 \`else if\` 两个单词更省事）。**elif 会按顺序判断，一旦某个条件成立就执行对应语句块，后面的 elif / else 都不再判断**。

\`\`\`py
score = 82                         # 将整数 82 赋给 score
if score >= 90:                 # 90 分及以上
    print("优秀")      # 82 < 90，跳过
elif score >= 80:               # elif 仅在前一条件不成立时判断
    print("良好")      # 命中这里，后面不再判断
elif score >= 60:                  # 否则如果 score >= 60 成立
    print("及格")      # 不会执行到这里
else:                              # 否则
    print("不及格")    # 不会执行到这里
\`\`\`

输出「良好」。注意 82 既 >= 80 也 >= 60，但因为 elif 是顺序短路求值，命中第一个就停。

> **常见陷阱**：把多个 if 写成并列的 if，而不是 elif 链，会导致多个分支都被执行。例如：

\`\`\`py
score = 82                         # 将整数 82 赋给 score
if score >= 90:          # 多个独立 if，彼此都会判断
    print("优秀")                    # 输出 "优秀"
if score >= 80:                    # 如果 score >= 80 成立
    print("良好")   # 会执行
if score >= 60:                    # 如果 score >= 60 成立
    print("及格")   # 也会执行！
\`\`\`

这里三个 if 是独立的，所以「良好」和「及格」都会打印。**只有用 elif 串起来才互斥**。

### 1.4 条件表达式（三元运算符）

Python 的三元表达式写作 \`值A if 条件 else 值B\`，注意顺序和 C 的 \`条件 ? A : B\` 不同：

\`\`\`py
age = 20                         # 定义变量 age
status = "成年" if age >= 18 else "未成年"   # 条件为真取"成年"，否则取"未成年"
print(status)   # 成年
\`\`\`

它适合「根据条件选一个值」的简单场景，让代码更紧凑。但**不要嵌套太深**，否则可读性会急剧下降：

\`\`\`py
# 不推荐：嵌套三元，难以阅读
level = "A" if s >= 90 else "B" if s >= 80 else "C" if s >= 60 else "D"   # 嵌套从右向左结合，可读性差
\`\`\`

这种情况用 if-elif 更清晰。

---

## 二、比较运算符与逻辑运算符

### 2.1 比较运算符

| 运算符 | 含义 | 示例 |
| --- | --- | --- |
| \`==\` | 等于（值相等） | \`1 == 1.0\` → True |
| \`!=\` | 不等于 | \`1 != 2\` → True |
| \`>\` / \`<\` | 大于 / 小于 | \`3 > 2\` → True |
| \`>=\` / \`<=\` | 大于等于 / 小于等于 | \`2 <= 2\` → True |
| \`is\` | 是否同一对象（身份比较） | \`a is None\` |
| \`is not\` | 不是同一对象 | \`a is not None\` |
| \`in\` | 是否属于（成员测试） | \`3 in [1,2,3]\` → True |

**\`==\` 与 \`is\` 的区别**（经典面试题）：
- \`==\` 比较**值**是否相等。
- \`is\` 比较**身份**（内存地址）是否相同。

\`\`\`py
a = [1, 2, 3]           # 值相同的两个独立列表
b = [1, 2, 3]                      # 创建列表并赋给 b
print(a == b)   # True，值相等
print(a is b)   # False，是两个不同的列表对象
\`\`\`

小整数（-5 到 256）和短字符串有「缓存」机制，\`is\` 可能恰好返回 True，但这是实现细节，**比较值永远用 ==，比较 None/True/False 才用 is**。

### 2.2 链式比较

Python 支持数学式的链式比较，非常优雅：

\`\`\`py
x = 5                       # 链式比较
print(1 < x < 10)   # True，等价于 1 < x and x < 10
print(1 < x > 3)    # True
\`\`\`

这比 \`1 < x and x < 10\` 更接近数学表达，且 \`x\` 只求值一次。

### 2.3 逻辑运算符 and / or / not

| 运算符 | 含义 | 特性 |
| --- | --- | --- |
| \`and\` | 与（都为真才真） | 短路：左边为假则不算右边 |
| \`or\` | 或（有一个真就真） | 短路：左边为真则不算右边 |
| \`not\` | 非（取反） | 返回布尔值 |

**短路求值**是关键：\`and\` 遇到假就停，\`or\` 遇到真就停，**且返回的是「决定结果的操作数」本身，而不一定是布尔值**：

\`\`\`py
print(0 and "hello")   # 0，因为 0 为假，直接返回 0
print(3 and "hello")   # "hello"，3 为真，还要看右边
print("" or "默认值")   # "默认值"，"" 为假，返回右边
print("存在" or "默认") # "存在"，左边为真，直接返回
\`\`\`

这个特性常用于**设置默认值**：\`name = input_name or "匿名"\`。

---

## 三、真值测试（truthy / falsy）

在 if / while 的条件位置，Python 会对任意对象做真值测试。以下值被视为 **False（假）**，其余皆为 **True（真）**：

| 类型 | 被视为 False 的值 |
| --- | --- |
| 布尔 | \`False\` |
| 数字 | \`0\`、\`0.0\`、\`0j\` |
| 序列 | 空字符串 \`""\`、空列表 \`[]\`、空元组 \`()\` |
| 映射 | 空字典 \`{}\` |
| None | \`None\` |
| 集合 | 空集合 \`set()\` |

所以判断一个列表是否非空，**推荐写** \`if my_list:\`，而**不是** \`if len(my_list) > 0:\`——前者更 Pythonic。

\`\`\`py
data = []                  # 空列表为假
if data:                   # 空列表为假
    print("有数据")                   # 输出 "有数据"
else:                              # 否则
    print("空")     # 打印「空」
\`\`\`

---

## 四、while 循环

\`while\` 是「**当条件成立时，反复执行**」的循环。语法：\`while 条件:\` + 缩进语句块。

\`\`\`py
n = 5                              # 将整数 5 赋给 n
while n > 0:        # 当 n 大于 0 时反复执行
    print(n)                # 输出当前 n
    n -= 1          # 别忘了更新条件变量，否则死循环！
print("发射")       # 循环结束后执行
\`\`\`

输出 5 4 3 2 1 发射。

**死循环**：如果条件永远为真且不 break，循环不会停。\`while True:\` 是常见的「无限循环 + break 退出」模式，用于菜单、读取输入等场景：

\`\`\`py
count = 0                          # 将整数 0 赋给 count
while True:          # 无限循环
    count += 1       # 每次加 1
    if count >= 3:                 # 如果 count >= 3 成立
        break       # 达到条件就跳出
print("count =", count)    # break 后跳出循环，执行此处
\`\`\`

---

## 五、for-in 循环

Python 的 \`for\` 和 C/Java 的 for 完全不同：它是**遍历（迭代）**循环，依次从一个「可迭代对象」里取出元素，而不是用计数器。语法：\`for 元素 in 可迭代对象:\`。

\`\`\`py
for fruit in ["苹果", "香蕉", "橘子"]:   # 遍历列表
    print(fruit)              # 输出当前元素

for ch in "Python":              # 遍历字符串
    print(ch)       # 逐字符遍历字符串

for key in {"a": 1, "b": 2}:    # 遍历字典
    print(key)      # 遍历字典默认得到键
\`\`\`

可迭代对象包括：列表、元组、字符串、字典、集合、range、文件对象、生成器等。**for 循环的本质是不断调用对象的 \`__next__()\` 直到抛出 StopIteration**。

---

## 六、range() 详解

当你需要「重复 N 次」或「按数字范围循环」时，用 \`range()\`。它生成一个整数序列（**惰性、不占用内存**），有三种用法：

| 用法 | 含义 | 生成的序列 |
| --- | --- | --- |
| \`range(stop)\` | 从 0 到 stop-1 | range(5) → 0,1,2,3,4 |
| \`range(start, stop)\` | 从 start 到 stop-1 | range(2,6) → 2,3,4,5 |
| \`range(start, stop, step)\` | 带步长 | range(0,10,2) → 0,2,4,6,8 |

\`\`\`py
for i in range(3):              # range(3) 生成 0,1,2
    print(i)            # 0 1 2

for i in range(2, 6):          # range(start, stop)，含 start 不含 stop
    print(i)            # 2 3 4 5

for i in range(0, 10, 2):      # range(start, stop, step)
    print(i)            # 0 2 4 6 8

# 步长可以是负数（倒数）
for i in range(5, 0, -1):      # 负步长从大到小
    print(i)            # 5 4 3 2 1
\`\`\`

要点：
- range 是**左闭右开**：包含 start，不包含 stop。
- range **不返回列表**，而是一个 range 对象，节省内存。要看内容可 \`list(range(5))\`。
- 步长为 0 会报 ValueError。

---

## 七、break / continue / pass

这三个关键字控制循环的执行流程。

### 7.1 break：立即跳出整个循环

\`\`\`py
for i in range(10):            # 遍历 0~9
    if i == 5:                     # 如果 i == 5 成立
        break      # i 到 5 就跳出，不再继续
    print(i)       # 打印 0 1 2 3 4
\`\`\`

对**嵌套循环**，break 只跳出**最内层**那一个循环，外层不受影响。

### 7.2 continue：跳过本次，进入下一次

\`\`\`py
for i in range(6):             # 遍历 0~5
    if i % 2 == 0:                 # 如果 i % 2 == 0 成立
        continue   # 偶数跳过，不执行下面的 print
    print(i)       # 只打印 1 3 5
\`\`\`

continue 是「这次不干了，直接下一次」。

### 7.3 pass：什么都不做（占位符）

\`pass\` 是一个**空操作语句**，它不执行任何动作。Python 的语法要求 if / for / def 等后面必须有语句块，当你暂时还不想写实现时，用 pass 占位，避免语法错误：

\`\`\`py
if age < 0:                 # 占位，逻辑待补
    pass          # TODO: 以后再处理负数情况

class Empty:           # 定义空类
    pass          # 空类

def todo():            # 定义空函数占位
    pass          # 空函数
\`\`\`

pass 与 continue 的区别：continue 会改变流程（跳过本次循环剩余部分），而 pass 只是个占位，流程继续往下走。

---

## 八、循环的 else 子句（for-else / while-else）

这是 Python 一个**独特且容易让人困惑**的特性：循环后面可以接一个 \`else\`。

**规则**：
- 当循环**正常结束**（没有被 break 打断）时，执行 else 块。
- 当循环被 **break** 跳出时，**不执行** else 块。

\`\`\`py
# 找一个列表里有没有负数
nums = [1, 2, 3, 4]                # 创建列表并赋给 nums
for n in nums:                  # 遍历每个元素
    if n < 0:                   # 发现负数
        print("发现负数:", n)          # 输出 "发现负数:", n
        break                      # 跳出循环
else:                           # for-else：循环正常结束（没 break）才执行
    print("没有负数")   # 因为没 break，正常结束，执行这里
\`\`\`

输出「没有负数」。这个 else 的语义可以理解为「**循环没被打断地跑完了**」，常用于**搜索失败时的处理**，比用标志变量更优雅：

\`\`\`py
# 传统写法：用 found 标志
found = False                   # 标志位记录是否找到
for n in nums:                  # 遍历列表
    if n < 0:                      # 如果 n < 0 成立
        found = True               # 将布尔值 True 赋给 found
        break                      # 跳出循环
if not found:                   # 用标志判断是否找到
    print("没有负数")                  # 输出 "没有负数"

# Pythonic 写法：用 for-else
for n in nums:                   # 同样遍历
    if n < 0:                      # 如果 n < 0 成立
        break                      # 跳出循环
else:                           # 没break即"没有负数"
    print("没有负数")                  # 输出 "没有负数"
\`\`\`

while-else 同理：while 条件变假而结束时执行 else，被 break 时不执行。

> 注意：很多人觉得 else 这个关键字用在这里语义不直观（它其实更接近「nobreak」）。但既然语言提供了，理解它的规则即可。

---

## 九、enumerate：同时拿到索引和元素

遍历列表时常常**既需要下标又需要元素**。传统 C 风格写法：

\`\`\`py
# 不推荐
for i in range(len(fruits)):    # 用下标遍历，啰嗦
    print(i, fruits[i])            # 输出 i, fruits[i]
\`\`\`

Pythonic 的写法是用 \`enumerate\`，它把可迭代对象包装成「(索引, 元素)」对：

\`\`\`py
fruits = ["苹果", "香蕉", "橘子"]           # 待遍历的列表
for index, value in enumerate(fruits):   # enumerate 同时给出下标和元素
    print(index, value)            # 输出 index, value
# 0 苹果
# 1 香蕉
# 2 橘子
\`\`\`

\`enumerate\` 还可以指定起始编号：\`enumerate(fruits, start=1)\` 从 1 开始计数，非常适合「给列表编号展示」的场景。

---

## 十、zip：并行遍历多个序列

\`zip\` 把多个可迭代对象「拉链式」配对，每次取出各序列的同位元素组成元组：

\`\`\`py
names = ["Alice", "Bob", "Carol"]      # 姓名列表
ages = [25, 30, 28]                    # 年龄列表，与 names 一一对应
for name, age in zip(names, ages):   # zip 按位置配对两个列表
    print(name, age)               # 输出 name, age
# Alice 25
# Bob 30
# Carol 28
\`\`\`

**长度不一致时，zip 以最短的为准**（多余元素被忽略）。如果要用最长的为准、缺失补 None，用 \`itertools.zip_longest\`。

zip 还可以用来**快速构造字典**：

\`\`\`py
keys = ["a", "b", "c"]               # 键列表
values = [1, 2, 3]                   # 值列表
d = dict(zip(keys, values))   # zip 配对后用 dict 转为字典
print(d)   # {'a': 1, 'b': 2, 'c': 3}
\`\`\`

以及**矩阵转置**（巧用 zip 解包）：

\`\`\`py
matrix = [[1, 2, 3], [4, 5, 6]]            # 二维列表（2 行 3 列）
transposed = list(zip(*matrix))   # * 解包 matrix，zip 按列配对
print(transposed)   # [(1, 4), (2, 5), (3, 6)]
\`\`\`

---

## 十一、嵌套循环

循环里面还可以套循环，常用于处理二维结构（矩阵、表格）：

\`\`\`py
# 打印九九乘法表
for i in range(1, 10):              # 外层循环控制行
    for j in range(1, i + 1):      # 内层循环控制列
        print(f"{j}x{i}={i*j}", end="\\t")   # end 用制表符替代换行
    print()   # 换行
\`\`\`

输出：
\`\`\`
1x1=1
1x2=2	2x2=4
1x3=3	2x3=6	3x3=9
...（一直到 9x9=81）
\`\`\`

要点：
- 内层循环每完成一轮，外层才前进一步。
- break / continue 只作用于**所在的那一层**循环。
- 嵌套层数过多（3 层以上）通常意味着可以用推导式或函数拆分来优化可读性。

\`print(..., end="\\t")\` 用 \`end\` 参数控制结尾字符（默认是换行 \\n），这里改成制表符让乘法表对齐。

---

## 十二、match-case 模式匹配（Python 3.10+）

Python 3.10 引入了 **结构化模式匹配**（structural pattern matching），语法类似其他语言的 switch，但功能强大得多——它不仅能匹配值，还能**解构数据结构**。

### 12.1 基本值匹配

\`\`\`py
def handle_command(cmd):       # 定义命令处理函数
    match cmd:                 # 匹配 cmd 的值
        case "quit":           # 值为 "quit"
            print("退出")      # 输出退出提示
        case "help":           # 值为 "help"
            print("帮助")      # 输出帮助提示
        case "reset":          # 值为 "reset"
            print("重置")      # 输出重置提示
        case _:                  # _ 是通配符，匹配任意值（类似 default）
            print("未知命令")          # 输出 "未知命令"
\`\`\`

\`_\` 是通配符，表示「其他所有情况」，相当于 switch 的 default。

### 12.2 字面量与或模式

\`\`\`py
match status:                  # 匹配 status
    case 200 | 201:        # | 表示「或」，多个值匹配同一分支
        print("成功")      # 2xx 状态码
    case 404:
        print("未找到")    # 资源不存在
    case 500:
        print("服务器错误")  # 服务端异常
\`\`\`

### 12.3 解构序列

match 可以解构列表/元组：

\`\`\`py
point = (3, 4)                 # 定义一个点
match point:                   # 对元组做结构化匹配
    case (0, 0):               # 精确匹配原点
        print("原点")                # 输出 "原点"
    case (0, y):           # 捕获第二个元素到变量 y
        print("在 y 轴上", y)         # 输出 "在 y 轴上", y
    case (x, 0):           # 捕获第一个元素到 x
        print("在 x 轴上", x)         # 输出 "在 x 轴上", x
    case (x, y):           # 捕获两个元素
        print(f"点 ({x}, {y})")     # 输出 f"点 ({x}, {y})"
\`\`\`

### 12.4 解构字典与类

\`\`\`py
match user:                              # 对字典做结构化匹配
    case {"name": name, "age": age}:   # 解构字典，提取 name 和 age
        print(f"用户 {name}, {age} 岁")  # 输出 f"用户 {name}, {age} 岁"
    case _:                             # 其他格式
        print("未知格式")              # 输出 "未知格式"
\`\`\`

模式匹配相比 if-elif 链的优势在于：**它能同时做匹配 + 提取变量**，代码更紧凑、更声明式。但需要 Python 3.10+，老项目可能用不了。

---

## 十三、本章小结

| 结构 | 用途 | 关键点 |
| --- | --- | --- |
| if / elif / else | 多分支条件 | elif 链互斥短路；缩进定义块 |
| 三元表达式 | 二选一取值 | \`A if cond else B\` |
| while | 条件循环 | 注意更新条件防死循环 |
| for-in | 遍历可迭代对象 | 本质是迭代 |
| range | 生成整数序列 | 左闭右开、惰性 |
| break / continue / pass | 流程控制 | break 跳出、continue 跳过、pass 占位 |
| for-else / while-else | 循环正常结束时执行 | 被 break 则不执行 |
| enumerate | 带索引遍历 | 可指定起始值 |
| zip | 并行遍历 | 以最短为准 |
| match-case | 模式匹配 | 3.10+，可解构 |

掌握控制流是写任何程序的基础。下一章我们把这些流程装进「函数」里，让代码可复用、可组织。
`,
    code: `# ============================================================
# 第一章代码演示：条件与循环全景
# ============================================================
# 本文件可用 python3 直接运行，逐步演示各种控制流结构。

print("========== 1. if / elif / else 多分支 ==========")
score = 82
if score >= 90:
    grade = "优秀"
elif score >= 80:
    grade = "良好"      # 命中这里，后面不再判断
elif score >= 60:
    grade = "及格"
else:
    grade = "不及格"
print("成绩", score, "等级:", grade)


print("\\n========== 2. 三元表达式与默认值 ==========")
age = 15
status = "成年" if age >= 18 else "未成年"
print("状态:", status)
# or 短路设置默认值
user_name = "" or "匿名用户"
print("用户名:", user_name)


print("\\n========== 3. 真值测试 ==========")
test_values = [0, "", [], {}, None, [0], "hello", 3.14]
for v in test_values:
    # bool(v) 看真值
    print(f"bool({v!r:8}) = {bool(v)}")


print("\\n========== 4. while 循环 ==========")
n = 5
while n > 0:
    print("倒计时:", n)
    n -= 1
print("发射！")


print("\\n========== 5. for-in 遍历 ==========")
for fruit in ["苹果", "香蕉", "橘子"]:
    print("水果:", fruit)
# 遍历字符串
for ch in "Py":
    print("字符:", ch)


print("\\n========== 6. range 三种用法 ==========")
print("range(5)      :", list(range(5)))
print("range(2,6)    :", list(range(2, 6)))
print("range(0,10,2) :", list(range(0, 10, 2)))
print("range(5,0,-1) :", list(range(5, 0, -1)))


print("\\n========== 7. break / continue / pass ==========")
for i in range(10):
    if i == 5:
        break          # 到 5 跳出
    print("break 演示 i =", i)

for i in range(6):
    if i % 2 == 0:
        continue       # 偶数跳过
    print("continue 演示奇数 i =", i)


print("\\n========== 8. for-else 子句 ==========")
# 找列表里有没有负数
nums = [1, 2, 3, 4]
for n in nums:
    if n < 0:
        print("发现负数:", n)
        break
else:
    print("没有负数（循环正常结束，执行 else）")


print("\\n========== 9. enumerate 带索引遍历 ==========")
fruits = ["苹果", "香蕉", "橘子"]
for idx, val in enumerate(fruits, start=1):
    print(f"第 {idx} 个: {val}")


print("\\n========== 10. zip 并行遍历 ==========")
names = ["Alice", "Bob", "Carol"]
ages = [25, 30, 28]
for name, age in zip(names, ages):
    print(f"{name} 今年 {age} 岁")
# 用 zip 构造字典
d = dict(zip(["a", "b", "c"], [1, 2, 3]))
print("zip 构造字典:", d)


print("\\n========== 11. 嵌套循环：九九乘法表 ==========")
for i in range(1, 4):              # 为节省篇幅只打印前 3 行
    line = ""
    for j in range(1, i + 1):
        line += f"{j}x{i}={i*j}\\t"
    print(line)


print("\\n========== 12. match-case 模式匹配 ==========")
def handle(point):
    match point:
        case (0, 0):
            return "原点"
        case (0, y):
            return f"在 y 轴上，y={y}"
        case (x, 0):
            return f"在 x 轴上，x={x}"
        case (x, y):
            return f"普通点 ({x}, {y})"
        case _:
            return "未知"

for p in [(0, 0), (0, 5), (3, 0), (3, 4)]:
    print(p, "->", handle(p))

# 值匹配 + 或模式
def http_msg(code):
    match code:
        case 200 | 201:
            return "成功"
        case 404:
            return "未找到"
        case 500:
            return "服务器错误"
        case _:
            return "其他"
print("HTTP 200:", http_msg(200))
print("HTTP 404:", http_msg(404))


print("\\n========== 13. 综合练习：猜数字逻辑（不读输入）==========")
# 模拟一个已固定的「答案」，演示循环 + 条件的综合用法
target = 7
guesses = [3, 9, 7]
for g in guesses:
    if g < target:
        print(f"猜 {g}：太小了")
    elif g > target:
        print(f"猜 {g}：太大了")
    else:
        print(f"猜 {g}：猜对了！")
        break
else:
    print("一次都没猜中")
`,
  },

  // =========================================================
  // 第二章：函数
  // =========================================================
  {
    id: "py-functions",
    group: "核心",
    icon: "🧩",
    title: "函数",
    content: `# 函数

**函数**是把一段「可复用的逻辑」打包起来的基本单位。掌握函数，代码才能从「流水账脚本」进化成「结构化程序」。本章覆盖：def 定义、参数传递（位置/关键字/默认/可变参数 \`\*args\`/\`\**kwargs\`）、return 多值、作用域 LEGB 规则、global / nonlocal、lambda、递归、文档字符串 docstring、类型注解 hints、高阶函数 map / filter / sorted、以及闭包初步。

---

## 一、定义函数：def

用 \`def\` 关键字定义函数，语法：

\`\`\`py
def 函数名(参数1, 参数2):              # 函数定义语法：def 函数名(参数)
    """文档字符串（可选）"""            # 三引号文档字符串说明用途
    函数体                             # 缩进的函数体语句
    return 返回值      # 可选
\`\`\`

\`\`\`py
def greet(name):                  # 定义函数 greet，接收参数 name
    return f"你好，{name}！"      # 返回格式化问候语

print(greet("小明"))   # 你好，小明！
\`\`\`

要点：
- 函数**先定义后调用**。调用时写 \`函数名(实参)\`。
- 没有 return 或 return 后无值，函数返回 \`None\`。
- 函数名其实就是「指向函数对象的变量」，可以把函数赋值给别的变量、作为参数传递。

---

## 二、参数传递

### 2.1 位置参数

最常见：实参按位置一一对应形参。

\`\`\`py
def add(a, b):              # 定义加法函数，接收 a、b
    return a + b            # 返回两数之和
print(add(2, 3))   # 5，2 给 a，3 给 b
\`\`\`

### 2.2 关键字参数

调用时用 \`参数名=值\` 指定，**顺序可以随意**：

\`\`\`py
def describe(name, age, city):              # 三个位置参数
    return f"{name}，{age} 岁，来自 {city}"  # 返回描述字符串

print(describe(age=30, city="北京", name="Alice"))   # 用关键字参数，顺序随意
\`\`\`

位置参数和关键字参数可以混用，但**位置参数必须在关键字参数前面**。

### 2.3 默认参数

给参数设默认值，调用时可省略：

\`\`\`py
def power(base, exp=2):        # exp 带默认值 2
    return base ** exp          # 返回 base 的 exp 次方

print(power(5))      # 25，exp 用默认值 2
print(power(5, 3))   # 125，exp 用传入的 3
\`\`\`

**经典陷阱：默认参数用可变对象**。默认值只在函数定义时求值**一次**，所以用列表/字典做默认值会被所有调用共享：

\`\`\`py
# 错误写法！
def add_item(item, lst=[]):       # 默认值在函数定义时求值，所有调用共享同一列表
    lst.append(item)             # 原地追加到默认列表
    return lst                   # 返回被修改的列表

print(add_item(1))   # [1]
print(add_item(2))   # [1, 2]  ← 上次的 1 还在！默认列表被共享了
\`\`\`

正确做法是**用 None 做哨兵**，在函数内部创建：

\`\`\`py
def add_item(item, lst=None):        # 用 None 作占位
    if lst is None:                  # 调用时未传 lst
        lst = []     # 每次调用都是新列表
    lst.append(item)                  # 原地追加
    return lst                        # 返回新列表
\`\`\`

**规则**：默认参数必须放在**没有默认值的参数后面**。

### 2.4 可变参数 \`\*args\`

当不确定要传多少个位置参数时，用 \`*args\` 收集成**元组**：

\`\`\`py
def sum_all(*args):           # *args 收集所有位置参数为元组
    total = 0                 # 累加器初始化
    for n in args:            # 遍历元组中的每个参数
        total += n           # 逐个累加
    return total              # 返回累加结果

print(sum_all(1, 2, 3))       # 6
print(sum_all(1, 2, 3, 4, 5)) # 15
\`\`\`

\`args\` 是约定俗成的名字，关键在 \`*\`。在函数内 \`args\` 是一个元组。

### 2.5 关键字可变参数 \`\**kwargs\`

收集**多余的关键字参数**成**字典**：

\`\`\`py
def make_profile(name, **kwargs):           # **kwargs 收集多余关键字参数为字典
    print("姓名:", name)                     # 输出必传的 name
    for key, value in kwargs.items():       # 遍历字典的键值对
        print(f"  {key}: {value}") # 输出 f"  {key}: {value}"

make_profile("Alice", age=30, city="北京", job="工程师")   # 多余的关键字进 kwargs
\`\`\`

\`kwargs\` 是字典，key 是字符串。

### 2.6 参数顺序总规则

完整参数顺序（从左到右）：
1. 位置参数 \`a\`
2. 默认参数 \`b=1\`
3. \`\*args\`
4. 仅关键字参数（在 *args 之后的普通参数）
5. \`\**kwargs\`

\`\`\`py
def func(a, b=2, *args, c, **kwargs):   # a 位置参数；b 默认参数；*args 可变位置；c 仅关键字；**kwargs 可变关键字
    print(a, b, args, c, kwargs)         # 输出各类参数的接收结果
func(1, 3, 4, 5, c=10, x=100)   # 1 3 (4,5) 10 {'x':100}
\`\`\`

\`c\` 在 *args 之后，所以**必须用关键字调用**（c=10），这种叫「仅关键字参数」。

### 2.7 解包传参

调用时可以用 \`*\` 和 \`**\` 把列表/字典**解包**成参数：

\`\`\`py
def add(a, b, c):                # 三参数加法
    return a + b + c             # 返回三数之和
nums = [1, 2, 3]                 # 待解包的列表
print(add(*nums))           # 6，* 解包列表，等价 add(1,2,3)

info = {"a": 1, "b": 2, "c": 3}  # 待解包的字典，键名需匹配形参
print(add(**info))          # 6，** 解包字典，等价 add(a=1,b=2,c=3)
\`\`\`

---

## 三、return 与多值返回

Python 函数用 \`return\` 返回值。**返回多个值时，实际上是返回一个元组**，调用方可以解包：

\`\`\`py
def min_max(nums):              # 接收一个数值序列
    return min(nums), max(nums)   # 返回元组 (min, max)

lo, hi = min_max([3, 1, 4, 1, 5])  # 元组解包到两个变量
print(lo, hi)   # 1 5
\`\`\`

\`return min(nums), max(nums)\` 等价于 \`return (min(nums), max(nums))\`，逗号构建元组。

---

## 四、作用域：LEGB 规则

变量名查找顺序遵循 **LEGB**：

| 层级 | 名称 | 说明 |
| --- | --- | --- |
| L | Local | 函数内部的局部变量 |
| E | Enclosing | 外层嵌套函数的变量 |
| G | Global | 模块级全局变量 |
| B | Built-in | 内置名（print、len、int 等） |

\`\`\`py
x = "global"          # G
def outer():          # 外层函数
    x = "enclosing"   # E
    def inner():      # 内层函数
        x = "local"   # L
        print(x)      # 找到 L: local
    inner()           # 调用内层函数
outer()                # 调用外层函数
\`\`\`

**函数内部读取全局变量没问题，但要想「修改」全局变量，必须用 global 声明**，否则 Python 会创建一个新的局部变量。

### 4.1 global

\`\`\`py
counter = 0                    # 模块级全局变量
def increment():                   # 定义函数 increment，无参数
    global counter     # 声明我要修改全局的 counter
    counter += 1                # 修改全局 counter
increment()                    # 调用一次
print(counter)   # 1
\`\`\`

### 4.2 nonlocal

修改**外层嵌套函数**的变量用 \`nonlocal\`（不是全局，也不是当前局部）：

\`\`\`py
def outer():                       # 定义函数 outer，无参数
    count = 0                # 外层函数的局部变量
    def inner():                   # 定义函数 inner，无参数
        nonlocal count   # 修改外层函数的 count
        count += 1            # 修改外层 count
    inner()                  # 调用内层
    print(count)   # 1
outer()                       # 调用外层
\`\`\`

> 经验：global 和 nonlocal 用多了会让状态难以追踪，**能用返回值替代就别用**。

---

## 五、lambda 匿名函数

\`lambda\` 创建一个「没有名字的小函数」，语法 \`lambda 参数: 表达式\`。它**只能是单个表达式**，不能有语句块：

\`\`\`py
square = lambda x: x ** 2          # 定义匿名函数，返回 x 的平方
print(square(5))   # 25           # 调用 lambda

# 常作为排序的 key
students = [("Alice", 90), ("Bob", 75), ("Carol", 88)]   # 姓名与分数的列表
students.sort(key=lambda s: s[1])   # 按元组的第二个元素（分数）排序
\`\`\`

lambda 适合「临时一次性用」的小逻辑。**逻辑复杂时请用 def**，可读性更好。

---

## 六、递归

函数**调用自己**就是递归。两个要素：**基线条件**（停止递归）+ **递归条件**（向基线靠近）。经典例子：阶乘。

\`\`\`py
def factorial(n):              # 定义阶乘函数
    if n <= 1:           # 基线条件：n 为 1 或 0 时停止递归
        return 1                   # 返回 1
    return n * factorial(n - 1)   # 递归条件：n 乘以 (n-1) 的阶乘

print(factorial(5))   # 120
\`\`\`

执行过程：\`5 * factorial(4) * ... * factorial(1)\`。

**注意**：Python 默认递归深度限制约 1000 层（\`sys.getrecursionlimit()\`），过深会抛 RecursionError。递归虽优雅，但很多场景迭代（循环）更高效。

---

## 七、文档字符串 docstring

函数、类、模块开头的**第一个字符串**就是 docstring，用三引号。它能被 \`help()\` 和 \`__doc__\` 读取，是 Python 的「自带文档系统」：

\`\`\`py
def divide(a, b):              # 定义除法函数
    """计算 a 除以 b。

    参数:
        a: 被除数
        b: 除数（不能为 0）

    返回:
        商
    """
    return a / b               # 返回 a / b 的商

print(divide.__doc__)   # 打印文档
help(divide)                    # 调用 help 查看完整文档
\`\`\`

规范：第一行是简要说明，空一行后写详细说明。**写 docstring 是好习惯**，IDE 会把它作为提示显示。

---

## 八、类型注解（Type Hints）

Python 是动态类型语言，但 3.5+ 支持**类型注解**——给参数和返回值标注期望类型。注解**不影响运行**（不会强制检查），但能被 IDE / mypy 等工具用来静态检查：

\`\`\`py
def greet(name: str, times: int = 1) -> str:   # name 标注 str，times 标注 int 默认 1，返回值标注 str
    return (f"Hello, {name}! ") * times       # 重复 times 次字符串

print(greet("Alice", 2))                      # 类型注解不强制，仅作提示
\`\`\`

常用类型：\`int\`、\`str\`、\`float\`、\`bool\`、\`list\`、\`dict\`、\`tuple\`、\`Optional[int]\`（可为 None）。复杂类型可从 \`typing\` 导入，如 \`List[int]\`、\`Dict[str, int]\`。

类型注解让代码更自文档化、更利于团队协作，是现代 Python 项目的标配。

---

## 九、高阶函数：map / filter / sorted

「高阶函数」是**接收函数作为参数**或**返回函数**的函数。

### 9.1 map

\`map(函数, 可迭代对象)\` 对每个元素应用函数，返回迭代器：

\`\`\`py
nums = [1, 2, 3, 4]                       # 原始列表
squares = list(map(lambda x: x ** 2, nums))   # map 对每个元素应用函数，list 转为列表
print(squares)   # [1, 4, 9, 16]
\`\`\`

### 9.2 filter

\`filter(函数, 可迭代对象)\` 保留使函数返回 True 的元素：

\`\`\`py
nums = [1, 2, 3, 4, 5, 6]                          # 原始列表
evens = list(filter(lambda x: x % 2 == 0, nums))   # filter 保留使函数为真的元素
print(evens)   # [2, 4, 6]
\`\`\`

> 现代 Python 中，map/filter 常被**推导式**取代（更易读），但理解它们依然重要。

### 9.3 sorted 与 key

\`sorted(可迭代对象, key=函数, reverse=bool)\` 返回**新**的有序列表（不改原数据）。key 函数指定排序依据：

\`\`\`py
words = ["banana", "apple", "cherry"]         # 待排序的单词列表
print(sorted(words))                          # 按字典序
print(sorted(words, key=len))                 # 按长度
print(sorted(words, key=len, reverse=True))   # 按长度降序
\`\`\`

\`list.sort()\` 是**原地排序**（修改原列表，返回 None），\`sorted()\` 是**返回新列表**。

---

## 十、闭包初步

**闭包**是「函数 + 它记住的外层变量」的组合。当一个内部函数引用了外层函数的变量，即使外层函数已返回，内部函数仍能访问那些变量：

\`\`\`py
def make_multiplier(factor):       # 外层函数接收 factor
    def multiply(x):               # 内层函数
        return x * factor          # 引用了外层的 factor（闭包）
    return multiply                # 返回内部函数（不调用）

double = make_multiplier(2)    # factor 被记住为 2
triple = make_multiplier(3)    # factor 被记住为 3
print(double(5))   # 10
print(triple(5))   # 15
\`\`\`

\`double\` 和 \`triple\` 是两个**独立**的闭包，各自记住了不同的 factor。闭包是装饰器、回调、函数工厂的基础，后续章节会深入。

> **闭包的一个常见陷阱**：如果在循环里创建闭包并引用循环变量，所有闭包会共享同一个变量（因为它们引用的是变量名，而非当时的值）。延迟绑定的结果往往让人意外：
>
> \`\`\`py
> funcs = []
> for i in range(3):
>     funcs.append(lambda: i)      # 都引用同一个 i
> print([f() for f in funcs])      # [2, 2, 2]，不是 [0,1,2]！
> # 修复：用默认参数把当时的值固定下来
> funcs = [lambda i=i: i for i in range(3)]
> print([f() for f in funcs])      # [0, 1, 2]
> \`\`\`

---

## 十一、函数是一等对象

在 Python 中，**函数本身就是对象**（一等公民 / first-class citizen）。这意味着函数可以：
- 赋值给变量
- 作为参数传给另一个函数
- 作为另一个函数的返回值
- 存进列表、字典等数据结构
- 拥有属性（如 \`__name__\`、\`__doc__\`）

\`\`\`py
def shout(text):              # 定义函数 shout
    return text.upper()      # 返回大写形式

# 1. 赋值给变量
yell = shout                 # 函数可赋给变量
print(yell("hi"))              # HI
print(yell.__name__)           # shout，函数对象保留原名

# 2. 存进列表，批量调用
ops = [str.upper, str.lower, str.title]   # 把方法放进列表
for op in ops:                     # 遍历 ops，每次取值赋给 op
    print(op("hello world"))             # 逐个调用

# 3. 作为参数
def apply(func, value):       # 接收函数作为参数
    return func(value)        # 调用传入的函数
print(apply(len, "abc"))       # 3
print(apply(abs, -5))          # 5

# 4. 作为字典的值，实现「命令分发」
commands = {                       # 将 { 赋给 commands
    "upper": str.upper,
    "lower": str.lower,
}
print(commands["upper"]("abc"))   # ABC
\`\`\`

正是「函数是一等对象」让 map / filter / sorted 等高阶函数成为可能，也是装饰器、回调、事件处理等机制的根基。

---

## 十二、偏函数 functools.partial

\`functools.partial\` 可以「固定」一个函数的部分参数，生成一个新函数，常用于简化重复调用、配置回调：

\`\`\`py
from functools import partial              # 导入偏函数工具

def power(base, exp):              # 通用幂函数
    return base ** exp            # 返回 base 的 exp 次方

square = partial(power, exp=2)   # 固定 exp=2
cube = partial(power, exp=3)     # 固定 exp=3
print(square(5))   # 25          # 只需传 base
print(cube(5))     # 125
\`\`\`

partial 不创建新逻辑，只是「预先绑定」部分参数，等价于：

\`\`\`py
def square(base):              # 偏函数的手写等价
    return power(base, exp=2)  # 固定 exp=2 调用 power
\`\`\`

它在配置回调（如 GUI 按钮的点击处理）、简化带很多默认参数的调用时非常实用。

---

## 十三、常见错误与最佳实践

1. **可变默认参数**：永远不要用 \`def f(x=[])\`，改用 \`x=None\` 哨兵（见 2.3）。
2. **忘了 return**：函数没有 return 会返回 \`None\`，调用方拿到 None 再运算会报 \`TypeError: unsupported operand\`。
3. **混淆 is 和 ==**：判断参数是否为 None 用 \`if x is None\`，不要用 \`if x == None\`。
4. **参数顺序错误**：位置参数必须在关键字参数前；默认参数必须在无默认参数后。
5. **滥用 global**：能用返回值传递结果就别用 global，会让状态难以追踪。
6. **命名**：函数名用小写加下划线（snake_case），如 \`calculate_total\`；动词开头更清晰。

**最佳实践小结**：
- 每个函数只做一件事（单一职责）。
- 函数不要太长，超过一屏考虑拆分。
- 写 docstring 说明参数和返回值。
- 关键函数加类型注解。
- 用 \`if __name__ == "__main__":\` 保护主流程，方便测试和复用。

---

## 十四、本章小结

| 概念 | 要点 |
| --- | --- |
| def / return | 定义函数；无 return 返回 None；多值返回是元组 |
| 参数 | 位置、关键字、默认、\`*args\`、\`**kwargs\`；默认参数避免用可变对象 |
| 作用域 | LEGB 查找；改全局用 global，改外层用 nonlocal |
| lambda | 单表达式匿名函数，常作 key |
| 递归 | 基线 + 递归条件；注意深度限制 |
| docstring | 三引号文档，help() 可读 |
| 类型注解 | 不影响运行，供静态检查 |
| 高阶函数 | map/filter/sorted；函数当参数 |
| 闭包 | 内部函数记住外层变量 |

函数是代码复用的基石。下一章我们学习 Python 最常用的数据容器：列表、元组、集合、字典。
`,
    code: `# ============================================================
# 第二章代码演示：函数全景
# ============================================================
print("========== 1. 基本定义与多值返回 ==========")
def min_max(nums):
    """返回列表的最小值和最大值（多值返回，本质是元组）"""
    return min(nums), max(nums)

lo, hi = min_max([3, 1, 4, 1, 5, 9])
print("min:", lo, "max:", hi)
print("min_max 文档:", min_max.__doc__)


print("\\n========== 2. 默认参数与可变默认值陷阱 ==========")
def power(base, exp=2):
    return base ** exp
print("power(5)   =", power(5))
print("power(5,3) =", power(5, 3))

# 正确做法：用 None 做哨兵
def add_item(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst
print("add_item(1):", add_item(1))
print("add_item(2):", add_item(2))   # 互不影响


print("\\n========== 3. *args 与 **kwargs ==========")
def sum_all(*args):
    total = 0
    for n in args:
        total += n
    return total
print("sum_all(1,2,3)    =", sum_all(1, 2, 3))
print("sum_all(1..5)     =", sum_all(1, 2, 3, 4, 5))

def make_profile(name, **kwargs):
    print("姓名:", name)
    for k, v in kwargs.items():
        print(f"  {k}: {v}")
make_profile("Alice", age=30, city="北京", job="工程师")


print("\\n========== 4. 解包传参 ==========")
def add3(a, b, c):
    return a + b + c
nums = [1, 2, 3]
print("add3(*[1,2,3]) =", add3(*nums))
info = {"a": 10, "b": 20, "c": 30}
print("add3(**info)   =", add3(**info))


print("\\n========== 5. 作用域 LEGB 与 global/nonlocal ==========")
counter = 0
def increment():
    global counter
    counter += 1
increment()
increment()
print("全局 counter =", counter)

def make_counter():
    count = 0
    def inner():
        nonlocal count
        count += 1
        return count
    return inner
c = make_counter()
print("闭包计数:", c(), c(), c())


print("\\n========== 6. lambda 与排序 ==========")
students = [("Alice", 90), ("Bob", 75), ("Carol", 88)]
by_score = sorted(students, key=lambda s: s[1])
print("按分数升序:", by_score)
by_score_desc = sorted(students, key=lambda s: s[1], reverse=True)
print("按分数降序:", by_score_desc)


print("\\n========== 7. 递归：阶乘与斐波那契 ==========")
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
print("5! =", factorial(5))

def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
print("fib(0..9):", [fib(i) for i in range(10)])


print("\\n========== 8. 类型注解 ==========")
def greet(name: str, times: int = 1) -> str:
    return (f"Hello, {name}! ") * times
print(greet("Alice", 2))


print("\\n========== 9. 高阶函数 map / filter / sorted ==========")
nums = [1, 2, 3, 4, 5, 6]
squares = list(map(lambda x: x ** 2, nums))
print("平方:", squares)
evens = list(filter(lambda x: x % 2 == 0, nums))
print("偶数:", evens)
words = ["banana", "apple", "cherry", "fig"]
print("按长度排序:", sorted(words, key=len))


print("\\n========== 10. 闭包：函数工厂 ==========")
def make_multiplier(factor):
    def multiply(x):
        return x * factor
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)
print("double(5) =", double(5))
print("triple(5) =", triple(5))


print("\\n========== 11. 综合练习：可变参数 + 高阶函数 ==========")
def apply_to_all(func, *values):
    """对每个 value 应用 func，返回结果列表"""
    return [func(v) for v in values]

print("全部平方:", apply_to_all(lambda x: x * x, 1, 2, 3, 4))
print("全部加倍:", apply_to_all(lambda x: x * 2, 10, 20, 30))
`,
  },

  // =========================================================
  // 第三章：列表 / 元组 / 集合 / 字典
  // =========================================================
  {
    id: "py-collections",
    group: "核心",
    icon: "🗃️",
    title: "列表 / 元组 / 集合 / 字典",
    content: `# 列表 / 元组 / 集合 / 字典

Python 内置了四种最常用的「容器」类型：**列表（list）**、**元组（tuple）**、**集合（set）**、**字典（dict）**。它们各自承担不同角色：列表是可变有序序列、元组是不可变有序序列、集合用于去重和集合运算、字典是键值映射。理解它们的特点和取舍，是写出高效 Python 代码的关键。

---

## 一、列表 list

### 1.1 创建

\`\`\`py
# 几种创建方式
a = [1, 2, 3]              # 字面量
b = list("abc")            # ['a','b','c']，从可迭代对象转换
c = [0] * 5                # [0,0,0,0,0]，重复
d = list(range(5))         # [0,1,2,3,4]，range 转列表
empty = []                 # 空列表
\`\`\`

列表元素可以是**任意类型**，甚至混合类型、嵌套列表。

### 1.2 索引与切片

**索引**从 0 开始，支持负数（-1 是最后一个）：

\`\`\`py
fruits = ["苹果", "香蕉", "橘子", "葡萄"]   # 列表可通过索引取元素
print(fruits[0])    # 苹果
print(fruits[-1])   # 葡萄
\`\`\`

**切片** \`[start:stop:step]\` 取一段子序列，左闭右开：

\`\`\`py
nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]   # 列表切片
print(nums[2:5])     # [2,3,4]
print(nums[:3])      # [0,1,2]   从头
print(nums[7:])      # [7,8,9]   到尾
print(nums[::2])     # [0,2,4,6,8]  步长 2
print(nums[::-1])    # [9,8,...,0]  反转
\`\`\`

切片是**浅拷贝**，返回新列表。\`nums[::-1]\` 是反转列表的经典技巧。

### 1.3 增删改查

\`\`\`py
lst = [1, 2, 3]       # 原列表
lst.append(4)         # 末尾追加 → [1,2,3,4]
lst.insert(0, 0)      # 指定位置插入 → [0,1,2,3,4]
lst.extend([5, 6])    # 扩展另一个列表 → [0,1,2,3,4,5,6]
lst[0] = 100          # 修改元素，按索引赋值
lst.remove(100)       # 按值删除第一个匹配
del lst[0]            # 按索引删除
popped = lst.pop()    # 弹出末尾元素并返回
\`\`\`

| 方法 | 作用 |
| --- | --- |
| \`append(x)\` | 末尾加一个元素 |
| \`insert(i, x)\` | 在位置 i 插入 |
| \`extend(iter)\` | 把可迭代对象逐个加进来 |
| \`pop(i)\` | 弹出（默认末尾）并返回 |
| \`remove(x)\` | 删除第一个值为 x 的元素 |
| \`index(x)\` | 返回 x 的索引 |
| \`count(x)\` | 统计 x 出现次数 |
| \`sort()\` | 原地排序 |
| \`reverse()\` | 原地反转 |

**查成员**用 \`in\`：\`3 in [1,2,3]\` → True。但列表 \`in\` 是线性扫描 O(n)，大列表频繁查成员请用集合。

### 1.4 列表推导式

\`\`\`py
squares = [x ** 2 for x in range(5)]        # [0,1,4,9,16]，对每个 x 求平方
evens = [x for x in range(10) if x % 2 == 0]  # 带条件，只保留偶数
\`\`\`

推导式是 Python 最具特色的写法之一，下一章会专门深入。

### 1.5 嵌套列表（二维）

\`\`\`py
matrix = [                         # 将 [ 赋给 matrix
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]                      # 二维列表（3 行 3 列）
print(matrix[1][2])   # 6，第 2 行第 3 列（先用 [1] 取行，再用 [2] 取列）
\`\`\`

**陷阱**：\`[[0]*3]*3\` 创建的三行会**共享同一个内层列表**（因为是引用复制），改一行会影响全部。正确写法用推导式：

\`\`\`py
bad = [[0]*3]*3       # 三行指向同一对象
bad[0][0] = 1                 # 改一行，三行都变（共享内层列表）
print(bad)            # [[1,0,0],[1,0,0],[1,0,0]] 全变！

good = [[0]*3 for _ in range(3)]   # 每行独立
good[0][0] = 1                 # 只改第一行
print(good)           # [[1,0,0],[0,0,0],[0,0,0]]
\`\`\`

---

## 二、元组 tuple

### 2.1 不可变序列

元组和列表很像，但**创建后不能修改**（不能增删改元素）：

\`\`\`py
t = (1, 2, 3)                      # 创建元组并赋给 t
print(t[0])       # 1，索引和列表一样
# t[0] = 10       # 报错！TypeError，元组不可变，不能赋值
\`\`\`

注意**单元素元组**要加逗号：\`(1,)\` 才是元组，\`(1)\` 只是括号里的整数 1。

### 2.2 为什么用元组

- **不可变更安全**：作为字典的键、集合的元素（列表不行，因为可变不可哈希）。
- **语义上表示「一组固定的字段」**：如坐标 \`(x, y)\`、RGB \`(r, g, b)\`。
- **性能略好**：创建和访问比列表快，占用内存更少。

### 2.3 打包与解包

元组天然支持「打包」和「解包」：

\`\`\`py
# 打包
point = 3, 4          # 不加括号也是元组 (3, 4)
# 解包
x, y = point          # x=3, y=4
# 交换变量
a, b = 1, 2
a, b = b, a           # 经典交换，无需临时变量
\`\`\`

**扩展解包**（3.x）：用 \`*\` 收集剩余元素：

\`\`\`py
first, *rest = [1, 2, 3, 4]   # first=1, rest=[2,3,4]，* 收集剩余元素
*a, last = [1, 2, 3, 4]       # a=[1,2,3], last=4
\`\`\`

### 2.4 命名元组 namedtuple

普通元组只能用索引访问，可读性差。\`collections.namedtuple\` 创建一个「有字段名」的元组子类：

\`\`\`py
from collections import namedtuple # 从 collections 导入 namedtuple
Point = namedtuple("Point", ["x", "y"])  # 将 namedtuple("Point", ["x", "y"]) 赋给 Point
p = Point(3, 4)                    # 将 Point(3, 4) 赋给 p
print(p.x, p.y)      # 3 4，用名字访问
print(p[0])          # 3，仍可索引
\`\`\`

既不可变又有可读性，适合表示简单记录。

---

## 三、集合 set

### 3.1 创建与特点

集合是**无序、不重复**的容器，**只存可哈希对象**：

\`\`\`py
s = {1, 2, 3, 3}     # {1, 2, 3}，自动去重
s2 = set([1, 2, 2, 3])   # 从列表创建集合，同样去重
empty = set()        # 空集合，注意不能写 {}（那是空字典）
\`\`\`

最大用途：**去重**和**成员测试**。集合的 \`in\` 是 O(1) 平均，比列表快得多。

\`\`\`py
nums = [1, 2, 2, 3, 3, 3]          # 创建列表并赋给 nums
unique = list(set(nums))   # set 去重后转回列表
\`\`\`

### 3.2 集合运算

\`\`\`py
a = {1, 2, 3, 4}                   # 创建集合并赋给 a
b = {3, 4, 5, 6}                   # 创建集合并赋给 b

print(a & b)    # 交集 {3, 4}
print(a | b)    # 并集 {1,2,3,4,5,6}
print(a - b)    # 差集 {1, 2}（a 有 b 没有）
print(a ^ b)    # 对称差 {1,2,5,6}（只在一个集合里）
\`\`\`

也有方法形式：\`a.intersection(b)\`、\`a.union(b)\` 等，运算符更简洁。

### 3.3 集合推导式

\`\`\`py
squares = {x ** 2 for x in range(5)}   # {0,1,4,9,16}
\`\`\`

### 3.4 frozenset

普通 set 是可变的（不能哈希，不能做集合元素或字典键）。\`frozenset\` 是**不可变集合**，可哈希：

\`\`\`py
fs = frozenset([1, 2, 3])          # 将 frozenset([1, 2, 3]) 赋给 fs
# fs.add(4)   # 报错，不可变
\`\`\`

---

## 四、字典 dict

### 4.1 创建

\`\`\`py
d = {"name": "Alice", "age": 30}    # 字面量
d2 = dict(name="Bob", age=25)        # 关键字参数
d3 = dict([("a", 1), ("b", 2)])      # 键值对列表
d4 = {k: v for k, v in zip(["x","y"], [1,2])}  # 推导式，zip 配对后构建
\`\`\`

字典是**键值映射**，键必须可哈希（字符串、数字、元组可以；列表、字典不行）。

### 4.2 访问

\`\`\`py
d = {"name": "Alice", "age": 30}   # 创建字典并赋给 d
print(d["name"])       # Alice
# print(d["city"])     # KeyError！键不存在会报错
print(d.get("city"))          # None，键不存在返回 None，不报错
print(d.get("city", "未知"))   # "未知"，指定默认值
\`\`\`

**用 \`get\` 比直接索引更安全**，避免 KeyError。

### 4.3 增删改

\`\`\`py
d = {"a": 1}                       # 创建字典并赋给 d
d["b"] = 2          # 新增键值对
d["a"] = 10         # 修改已有键的值
del d["b"]          # 删除键值对
d.pop("a")          # 弹出并返回值
\`\`\`

### 4.4 常用方法

| 方法 | 作用 |
| --- | --- |
| \`keys()\` | 所有键（视图） |
| \`values()\` | 所有值（视图） |
| \`items()\` | 所有 (键, 值) 对（视图） |
| \`get(k, default)\` | 安全取值，不存在返回 default |
| \`setdefault(k, v)\` | 取值；不存在则设为 v 并返回 v |
| \`update(other)\` | 用另一个字典更新（覆盖同键） |
| \`pop(k)\` | 删除并返回值 |
| \`in\` | 判断键是否存在 |

\`\`\`py
d = {"a": 1, "b": 2}               # 创建字典并赋给 d
print(list(d.keys()))    # ['a', 'b']
print(list(d.values()))  # [1, 2]
print(list(d.items()))   # [('a',1), ('b',2)]

# setdefault：不存在才设
d.setdefault("c", 3)     # c 不存在，设为 3
d.setdefault("c", 99)    # c 已存在，返回 3，不改

# update：合并覆盖
d.update({"a": 100, "d": 4})       # 对 d 调用 更新 方法，参数 {"a": 100, "d": 4}
print(d)   # {'a':100,'b':2,'c':3,'d':4}
\`\`\`

**\`keys()/values()/items()\` 返回的是「视图」而非列表**——它们会随字典变化实时更新，且支持 \`in\` 测试。要看列表用 \`list()\` 包一下。

### 4.5 字典推导式

\`\`\`py
# 翻转键值
d = {"a": 1, "b": 2}               # 创建字典并赋给 d
flipped = {v: k for k, v in d.items()}   # {1:'a', 2:'b'}
\`\`\`

### 4.6 遍历字典

\`\`\`py
d = {"a": 1, "b": 2}               # 创建字典并赋给 d
for key in d:                  # 默认遍历键
    print(key)                     # 输出 key
for key, value in d.items():   # 同时拿键值（推荐）
    print(key, value)              # 输出 key, value
\`\`\`

---

## 五、可变 vs 不可变对比

| 类型 | 可变？ | 有序？ | 重复？ | 用途 |
| --- | --- | --- | --- | --- |
| list | 可变 | 有序 | 允许重复 | 通用序列，频繁增删 |
| tuple | 不可变 | 有序 | 允许重复 | 固定记录、作字典键 |
| set | 可变 | 无序 | 不重复 | 去重、集合运算 |
| frozenset | 不可变 | 无序 | 不重复 | 不可变集合 |
| dict | 可变 | 有序（3.7+ 保插入序） | 键不重复 | 键值映射 |

**「可变」带来一个副作用**：可变对象不能哈希，所以不能当字典键或集合元素。这就是为什么字典键用元组而不用列表。

**浅拷贝陷阱**：列表/字典的拷贝（切片、copy()）是浅拷贝——内层嵌套对象仍是引用共享。要完全独立用 \`copy.deepcopy()\`。

\`\`\`py
import copy                        # 导入 copy 模块
a = [[1, 2], [3, 4]]               # 创建列表并赋给 a
b = a.copy()           # 浅拷贝
b[0][0] = 99
print(a)               # [[99,2],[3,4]] ← 内层被改了！
c = copy.deepcopy(a)   # 深拷贝，完全独立
\`\`\`

判断是否共享引用，可以用 \`is\`：\`a[0] is b[0]\` 为 True 说明内层是同一个对象。

---

## 六、排序详解：sort 与 sorted

\`list.sort()\` 和 \`sorted()\` 都用 TimSort 算法（稳定排序，平均 O(n log n)），区别在于：

| 特性 | \`list.sort()\` | \`sorted(iterable)\` |
| --- | --- | --- |
| 作用对象 | 列表本身 | 任意可迭代对象 |
| 是否原地 | 是（改原列表） | 否（返回新列表） |
| 返回值 | \`None\` | 新列表 |
| 适用类型 | 仅 list | list / tuple / str / dict / set 等 |

\`\`\`py
nums = [3, 1, 4, 1, 5, 9, 2, 6]    # 创建列表并赋给 nums
print(sorted(nums))         # [1, 1, 2, 3, 4, 5, 6, 9]，原列表不变
print(nums)                 # [3, 1, 4, ...] 原列表还在

nums.sort()                 # 原地排序，返回 None
print(nums)                 # [1, 1, 2, 3, 4, 5, 6, 9]

# sorted 可作用于字符串、元组
print(sorted("python"))     # ['h','n','o','p','t','y']
print(sorted((3, 1, 2)))    # [1, 2, 3]
\`\`\`

**稳定性**：TimSort 是稳定排序——相等元素的相对顺序保持不变。这对多关键字排序很重要：

\`\`\`py
# 先按年龄排，再按姓名排，最终姓名相同时年龄顺序不变
people = [("Alice", 30), ("Bob", 25), ("Alice", 25)]  # 创建列表并赋给 people
people.sort(key=lambda p: p[1])     # 先按年龄
people.sort(key=lambda p: p[0])     # 再按姓名，同龄 Alice 仍在前
\`\`\`

**反转**：\`reverse=True\` 降序，或对数值取负做 key。

---

## 七、字典进阶

### 7.1 字典视图的动态性

\`keys()/values()/items()\` 返回的是**视图对象**，会随字典变化实时反映：

\`\`\`py
d = {"a": 1, "b": 2}               # 创建字典并赋给 d
keys = d.keys()                    # 将 d.keys() 赋给 keys
print(keys)            # dict_keys(['a', 'b'])
d["c"] = 3             # 修改字典
print(keys)            # dict_keys(['a', 'b', 'c'])，视图自动更新
print("a" in keys)     # True，视图支持 in 测试
\`\`\`

视图不是列表，不能索引（\`keys[0]\` 报错），需要时用 \`list(keys)\` 转换。

### 7.2 保序与合并运算符

自 Python 3.7 起，**字典保证插入顺序**（3.6 是实现细节，3.7 写入语言规范）。遍历时按插入顺序输出。

Python 3.9+ 支持用 \`|\` 合并字典，\`|=\` 原地更新：

\`\`\`py
d1 = {"a": 1, "b": 2}              # 创建字典并赋给 d1
d2 = {"b": 20, "c": 3}             # 创建字典并赋给 d2
merged = d1 | d2       # {'a':1, 'b':20, 'c':3}，右边覆盖左边同键
d1 |= d2               # 等价于 d1.update(d2)
\`\`\`

### 7.3 字典 vs 列表：什么时候用什么

- **按键查值** → 字典（O(1)）；列表只能按位置查（O(1)）或按值查（O(n)）。
- **有序、允许重复、按位置访问** → 列表。
- **需要去重** → 集合。
- **键值映射、配置项、计数** → 字典。

\`\`\`py
# 词频统计：字典的经典用法
text = "the cat sat on the mat the cat"  # 将字符串 "the cat sat on the mat the cat" 赋给 text
freq = {}                          # 创建集合并赋给 freq
for word in text.split():           # 按空白分割成单词列表
    freq[word] = freq.get(word, 0) + 1   # 不存在时默认 0，再加 1
print(freq)   # {'the':3, 'cat':2, 'sat':1, 'on':1, 'mat':1}
\`\`\`

---

## 八、性能对比与选择指南

| 操作 | list | set | dict |
| --- | --- | --- | --- |
| 成员测试 \`x in ...\` | O(n) | O(1) 平均 | O(1) 平均 |
| 按索引/键访问 | O(1) | —— | O(1) |
| 追加 | O(1) 均摊 | O(1) | O(1) |
| 删除（按值/键） | O(n) | O(1) | O(1) |

**经验法则**：
- 要频繁 \`in\` 判断成员，且元素可哈希 → 用 **set**，别用 list。
- 要存「带名字的数据」→ 用 **dict**。
- 要保持顺序、允许重复、按位置操作 → 用 **list**。
- 数据一旦确定不应改变 → 用 **tuple**（还能当字典键）。

\`\`\`py
# 反面教材：用 list 做大量成员判断，慢
big = list(range(100000))          # 将 list(range(100000)) 赋给 big
# if 99999 in big: ...   # O(n)，要扫十万次

# 正确：转成 set
big_set = set(big)                 # 将 set(big) 赋给 big_set
# if 99999 in big_set: ...  # O(1)，飞快
\`\`\`

---

## 九、常见陷阱速查

1. **嵌套列表 \`[[0]*n]*n\` 共享引用**：用推导式 \`[[0]*n for _ in range(n)]\`。
2. **浅拷贝改内层**：嵌套结构要 \`copy.deepcopy\`。
3. **字典键必须可哈希**：列表、字典、set 不能当键，用 tuple。
4. **\`{}\` 是空字典不是空集合**：空集合写 \`set()\`。
5. **遍历时修改集合/字典**：会抛 RuntimeError。如需边遍历边删，先收集要删的键再统一删，或遍历副本 \`for k in list(d.keys())\`。
6. **元组「不可变」是浅层的**：元组里的可变元素（如内嵌列表）仍可改：\`t = ([1],); t[0].append(2)\` 合法。

---

## 十、本章小结

- **list**：可变有序，万能序列，注意嵌套共享引用。
- **tuple**：不可变有序，作固定记录、字典键；支持解包。
- **set**：去重 + 集合运算，成员测试 O(1)。
- **dict**：键值映射，用 get/setdefault 安全操作，items() 遍历。
- **可变 vs 不可变**：决定能否哈希、能否当键；深浅拷贝要分清。

这四种容器是 Python 编程的「四件套」，几乎每个程序都会用到。下一章我们深入学习「推导式」这一 Python 特色写法以及函数式工具。
`,
    code: `# ============================================================
# 第三章代码演示：列表 / 元组 / 集合 / 字典
# ============================================================
print("========== 1. 列表：索引与切片 ==========")
nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
print("原始:", nums)
print("nums[0]    =", nums[0])
print("nums[-1]   =", nums[-1])
print("nums[2:5]  =", nums[2:5])
print("nums[:3]   =", nums[:3])
print("nums[7:]   =", nums[7:])
print("nums[::2]  =", nums[::2])
print("nums[::-1] =", nums[::-1])


print("\\n========== 2. 列表增删改查 ==========")
lst = [1, 2, 3]
lst.append(4)
print("append(4):", lst)
lst.insert(0, 0)
print("insert(0,0):", lst)
lst.extend([5, 6])
print("extend([5,6]):", lst)
lst[0] = 100
print("改 lst[0]=100:", lst)
lst.remove(100)
print("remove(100):", lst)
del lst[0]
print("del lst[0]:", lst)
print("pop():", lst.pop(), "->", lst)
print("3 in lst?", 3 in lst)


print("\\n========== 3. 列表推导式与嵌套列表 ==========")
squares = [x ** 2 for x in range(5)]
print("平方推导式:", squares)
evens = [x for x in range(10) if x % 2 == 0]
print("偶数推导式:", evens)

# 嵌套列表（二维）
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
print("matrix[1][2] =", matrix[1][2])

# 嵌套共享引用陷阱
bad = [[0] * 3] * 3
bad[0][0] = 1
print("错误创建（共享引用）:", bad)
good = [[0] * 3 for _ in range(3)]
good[0][0] = 1
print("正确创建（独立）:", good)


print("\\n========== 4. 元组：不可变、解包、命名元组 ==========")
t = (1, 2, 3)
print("元组:", t, "第一个:", t[0])
point = 3, 4            # 打包
x, y = point            # 解包
print("解包:", x, y)
a, b = 10, 20
a, b = b, a             # 交换
print("交换后:", a, b)
first, *rest = [1, 2, 3, 4]
print("扩展解包 first, *rest:", first, rest)

from collections import namedtuple
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
print("命名元组 p.x, p.y:", p.x, p.y, "仍可索引 p[0]:", p[0])


print("\\n========== 5. 集合：去重与集合运算 ==========")
nums_list = [1, 2, 2, 3, 3, 3]
print("去重:", list(set(nums_list)))
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
print("a =", a, "b =", b)
print("交集 a & b :", a & b)
print("并集 a | b :", a | b)
print("差集 a - b :", a - b)
print("对称差 a ^ b:", a ^ b)
print("成员测试 3 in a:", 3 in a)
sq = {x ** 2 for x in range(5)}
print("集合推导式:", sq)


print("\\n========== 6. 字典：创建与访问 ==========")
d = {"name": "Alice", "age": 30}
print("d[name]:", d["name"])
print("get 不存在:", d.get("city"))
print("get 带默认:", d.get("city", "未知"))


print("\\n========== 7. 字典：增删改与常用方法 ==========")
d = {"a": 1, "b": 2}
d["c"] = 3
print("新增:", d)
d["a"] = 100
print("修改:", d)
d.pop("b")
print("pop b:", d)
print("keys:", list(d.keys()))
print("values:", list(d.values()))
print("items:", list(d.items()))
d.setdefault("c", 99)
print("setdefault c(已存在):", d)
d.setdefault("e", 5)
print("setdefault e(新):", d)
d.update({"a": 1, "f": 6})
print("update:", d)


print("\\n========== 8. 字典推导式与遍历 ==========")
d = {"a": 1, "b": 2, "c": 3}
flipped = {v: k for k, v in d.items()}
print("翻转键值:", flipped)
for key, value in d.items():
    print(f"  键 {key} -> 值 {value}")


print("\\n========== 9. 深浅拷贝对比 ==========")
import copy
original = [[1, 2], [3, 4]]
shallow = original.copy()
shallow[0][0] = 99
print("浅拷贝改内层后 original:", original)
deep = copy.deepcopy(original)
deep[0][0] = 0
print("深拷贝改后 original 不受影响:", original)


print("\\n========== 10. 综合练习：词频统计 ==========")
words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
freq = {}
for w in words:
    freq[w] = freq.get(w, 0) + 1
print("词频:", freq)
# 按频率降序
sorted_freq = sorted(freq.items(), key=lambda kv: kv[1], reverse=True)
print("按频率降序:", sorted_freq)
`,
  },

  // =========================================================
  // 第四章：推导式与函数式工具
  // =========================================================
  {
    id: "py-comprehensions",
    group: "核心",
    icon: "⚡",
    title: "推导式与函数式工具",
    content: `# 推导式与函数式工具

**推导式（comprehension）** 是 Python 最具特色的语法之一：用一行简洁的表达式从已有的可迭代对象「构造」出新的列表 / 字典 / 集合 / 生成器。它结合了循环、条件、表达式，既高效又易读。本章还会讲与之配套的**函数式工具**：map / filter / reduce、sorted 与 key、any / all，以及「推导式 vs 循环」在性能与可读性上的取舍。

---

## 一、列表推导式

### 1.1 基本语法

\`\`\`py
[表达式 for 变量 in 可迭代对象]
\`\`\`

它等价于：

\`\`\`py
result = []                        # 创建列表并赋给 result
for 变量 in 可迭代对象:                   # 遍历 可迭代对象，每次取值赋给 变量
    result.append(表达式)             # 对 result 调用 追加 方法，参数 表达式
\`\`\`

\`\`\`py
squares = [x ** 2 for x in range(5)]   # 对 0-4 每个数求平方
print(squares)   # [0, 1, 4, 9, 16]
\`\`\`

### 1.2 带条件的推导式

\`\`\`py
[表达式 for 变量 in 可迭代对象 if 条件]
\`\`\`

\`\`\`py
evens = [x for x in range(10) if x % 2 == 0]  # 创建列表并赋给 evens
print(evens)   # [0, 2, 4, 6, 8]

# 条件也可以放在表达式里（三元）
labels = ["偶" if x % 2 == 0 else "奇" for x in range(5)]  # 创建列表并赋给 labels
print(labels)   # ['偶', '奇', '偶', '奇', '偶']
\`\`\`

两种条件的区别：
- \`if\` 在**后面**：过滤，不满足条件的元素被**丢弃**。
- \`if-else\` 在**前面**（表达式位置）：保留所有元素，但值根据条件二选一。

---

## 二、字典推导式

用 \`{}\` + \`键:值\` 表达式：

\`\`\`py
squares = {x: x ** 2 for x in range(5)}  # 创建字典并赋给 squares
print(squares)   # {0:0, 1:1, 2:4, 3:9, 4:16}

# 翻转键值
d = {"a": 1, "b": 2}               # 创建字典并赋给 d
flipped = {v: k for k, v in d.items()}  # 创建字典并赋给 flipped
\`\`\`

字典推导式常用于「从一组数据构建映射」或「变换字典」。

---

## 三、集合推导式

用 \`{}\` 但表达式不是 \`键:值\`：

\`\`\`py
nums = [1, -2, 3, -4, 5]           # 创建列表并赋给 nums
abs_set = {abs(x) for x in nums}   # 创建集合并赋给 abs_set
print(abs_set)   # {1, 2, 3, 4, 5}，自动去重
\`\`\`

---

## 四、生成器推导式（generator expression）

把列表推导式的 \`[]\` 换成 \`()\`，得到一个**生成器**——它**惰性求值**，不一次性生成所有元素，节省内存：

\`\`\`py
gen = (x ** 2 for x in range(5))   # 创建元组并赋给 gen
print(gen)        # <generator object>，还不是列表
print(list(gen))  # [0, 1, 4, 9, 16]
\`\`\`

生成器一次只能遍历一次，遍历完就「耗尽」。它的最大价值是**配合 sum / max / min / any 等聚合函数**，避免创建中间列表：

\`\`\`py
# 求平方和，用生成器不建中间列表
total = sum(x ** 2 for x in range(1000000))  # 将 sum(x ** 2 for x in range(1000000)) 赋给 total
\`\`\`

这里 \`sum(...)\` 直接消费生成器，内存占用是 O(1) 而非 O(n)。

---

## 五、嵌套推导式

### 5.1 多重 for（扁平化嵌套）

\`\`\`py
# 把二维列表展平
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]  # 创建列表并赋给 matrix
flat = [num for row in matrix for num in row]  # 创建列表并赋给 flat
print(flat)   # [1,2,3,4,5,6,7,8,9]
\`\`\`

读法：**从左到右就是嵌套 for 的顺序**。等价于：

\`\`\`py
flat = []                          # 创建列表并赋给 flat
for row in matrix:                 # 遍历 matrix，每次取值赋给 row
    for num in row:                # 遍历 row，每次取值赋给 num
        flat.append(num)           # 对 flat 调用 追加 方法，参数 num
\`\`\`

### 5.2 嵌套表达式（生成二维）

\`\`\`py
# 3x4 的零矩阵
grid = [[0 for _ in range(4)] for _ in range(3)]  # 创建列表并赋给 grid
\`\`\`

注意外层是 \`[]\`（列表推导式），生成的是「列表的列表」。

> **可读性提醒**：嵌套超过两层就难读了，这时候老老实实用循环更清晰。

---

## 六、条件推导式进阶

\`\`\`py
# 同时带过滤条件和三元表达式
data = [1, -2, 3, -4, 5, -6]       # 创建列表并赋给 data
# 只取正数，并把它们标记
result = [x if x > 2 else 0 for x in data if x > 0]  # 创建列表并赋给 result
print(result)   # [1, 0, 3, 5]  ← 过滤掉负数，>2 的保留原值，其余为 0
\`\`\`

执行顺序：先 \`for x in data\`，再用 \`if x > 0\` 过滤，最后对留下的元素求 \`x if x>2 else 0\`。

---

## 七、map / filter / reduce

### 7.1 map

\`map(函数, 可迭代对象)\`：对每个元素应用函数，返回迭代器。

\`\`\`py
nums = [1, 2, 3, 4]                # 创建列表并赋给 nums
squares = list(map(lambda x: x ** 2, nums))  # 将 list(map(lambda x: x ** 2, nums)) 赋给 squares
# 等价推导式: [x**2 for x in nums]
\`\`\`

map 可以接受多个可迭代对象：\`map(lambda a,b: a+b, [1,2,3], [10,20,30])\`。

### 7.2 filter

\`filter(函数, 可迭代对象)\`：保留使函数返回真的元素。

\`\`\`py
nums = [1, 2, 3, 4, 5, 6]          # 创建列表并赋给 nums
evens = list(filter(lambda x: x % 2 == 0, nums))  # 将 list(filter(lambda x: x % 2 == 0, nums)) 赋给 evens
# 等价推导式: [x for x in nums if x%2==0]
\`\`\`

### 7.3 reduce

\`reduce\` 在 \`functools\` 模块，它把一个二元函数**累积**地作用到序列上，最终归约成一个值：

\`\`\`py
from functools import reduce       # 从 functools 导入 reduce
nums = [1, 2, 3, 4]                # 创建列表并赋给 nums
product = reduce(lambda a, b: a * b, nums)   # 1*2*3*4 = 24，累积相乘
total = reduce(lambda a, b: a + b, nums)     # 10，累积相加
\`\`\`

执行过程：\`((1*2)*3)*4\`。reduce 适合「连乘、连加、找最值」等需要「把序列压成一个值」的场景。但很多情况下 \`sum()\`、\`max()\` 等内置函数更直接。

> **现代建议**：能用推导式 + 内置聚合（sum/max/min）就别用 map/filter/reduce，可读性更好。但读别人代码时仍要能看懂。

---

## 八、sorted 与 key

\`sorted(可迭代对象, key=函数, reverse=bool)\` 返回新列表，\`key\` 指定「按什么排序」：

\`\`\`py
words = ["banana", "apple", "cherry", "fig"]  # 创建列表并赋给 words
print(sorted(words, key=len))               # 按长度
print(sorted(words, key=len, reverse=True)) # 按长度降序

students = [("Alice", 90), ("Bob", 75), ("Carol", 88)]  # 创建列表并赋给 students
print(sorted(students, key=lambda s: s[1])) # 按分数
\`\`\`

key 函数对每个元素调用一次，返回用于比较的值。**复杂排序用 key 比用 cmp 高效得多**（Python 3 已移除 cmp 参数）。

多关键字排序：用元组作 key。

\`\`\`py
data = [("Alice", 90, 18), ("Bob", 90, 20), ("Carol", 88, 19)]  # 创建列表并赋给 data
# 先按分数降序，分数相同按年龄升序
print(sorted(data, key=lambda s: (-s[1], s[2])))   # -s[1] 取负实现降序，s[2] 升序
\`\`\`

---

## 九、any 与 all

- \`any(可迭代对象)\`：**只要有一个**为真就返回 True（空可迭代返回 False）。
- \`all(可迭代对象)\`：**全部为真**才返回 True（空可迭代返回 True）。

\`\`\`py
nums = [0, 1, 2, 3]                # 创建列表并赋给 nums
print(any(nums))   # True，有非零
print(all(nums))   # False，有 0

print(any(x > 5 for x in nums))   # False，没有 >5 的
print(all(x >= 0 for x in nums))  # True，都 >=0
\`\`\`

any / all 都是**短路**的：any 遇到真就停，all 遇到假就停。配合生成器表达式，可以高效做「存在性 / 全称」判断，不用先建列表。

---

## 十、推导式 vs 循环：性能与可读性

### 10.1 性能

推导式通常比等价的 for 循环 + append **更快**，因为它的「循环 + 追加」在 CPython 解释器层面是优化过的专用字节码，省去了每次调用 \`append\` 方法和属性查找的开销。

\`\`\`py
# 推导式（更快）
squares = [x ** 2 for x in range(1000000)]  # 创建列表并赋给 squares
# 循环（较慢）
squares = []                       # 创建列表并赋给 squares
for x in range(1000000):           # 遍历 range(1000000)，每次取值赋给 x
    squares.append(x ** 2)         # 对 squares 调用 追加 方法，参数 x ** 2
\`\`\`

但**不要为了微小的性能牺牲可读性**。绝大多数场景，可读性比那点性能差异重要得多。

### 10.2 可读性取舍

**适合用推导式**：
- 简单的「变换 + 过滤」。
- 一行能清晰表达意图。
- 没有复杂副作用。

**应该用循环**：
- 逻辑复杂，有多个分支、嵌套判断。
- 需要副作用（如修改外部状态、打印）。
- 嵌套超过两层。
- 单行太长，读起来要停下来想。

\`\`\`py
# 推导式：清晰
evens = [x for x in nums if x % 2 == 0]  # 创建列表并赋给 evens

# 这种就该用循环：太复杂
# result = [transform(x) for x in data if condition(x) if other(x) for y in ...]
\`\`\`

**原则**：推导式是工具不是目标。让代码「一眼能懂」才是目标。

---

## 十一、生成器推导式 vs 列表推导式：内存与性能

列表推导式 \`[]\` 一次性把所有结果放进内存；生成器推导式 \`()\` 是惰性的，逐个产出，**内存占用 O(1)**。该如何选？

| 场景 | 选择 | 原因 |
| --- | --- | --- |
| 需要反复遍历、按索引访问 | 列表推导式 | 生成器遍历一次就耗尽，不能索引 |
| 只需迭代一次（求和、最大值、any/all） | 生成器推导式 | 省内存，不建中间结构 |
| 数据量巨大（百万级） | 生成器推导式 | 列表会占满内存 |
| 需要立即看到全部结果 | 列表推导式 | 生成器要触发求值才有内容 |

\`\`\`py
# 列表：占内存，但可重复使用
sq_list = [x ** 2 for x in range(5)]  # 创建列表并赋给 sq_list
print(sq_list)        # [0,1,4,9,16]
print(sq_list[2])     # 4，可索引
print(len(sq_list))   # 5，可取长度

# 生成器：省内存，但一次性
sq_gen = (x ** 2 for x in range(5))  # 创建元组并赋给 sq_gen
print(sq_gen)         # <generator object>
# print(sq_gen[2])    # 报错！生成器不能索引
print(sum(sq_gen))    # 30，聚合时消费
print(sum(sq_gen))    # 0，已耗尽，再用就是空的
\`\`\`

**关键认知**：生成器是「一次性」的。把它赋值给变量后遍历一次就没了，第二次遍历得到空结果。需要多次使用就转成列表，或重新创建生成器。

\`\`\`py
# 大数据求和：生成器 + sum，内存友好
total = sum(x * x for x in range(10_000_000))   # 不建一千万元素的列表
\`\`\`

注意 \`sum(x * x for x in ...)\` 里没有额外的方括号——这就是把生成器表达式直接传给 sum，省了一对括号。等价于 \`sum((x*x for x in ...))\`。

---

## 十二、推导式中的作用域

Python 3 中，**推导式有自己的局部作用域**，循环变量不会「泄漏」到外部：

\`\`\`py
# Python 3：i 只在推导式内有效
squares = [i ** 2 for i in range(3)]  # 创建列表并赋给 squares
print(squares)   # [0, 1, 4]
# print(i)       # NameError！i 不存在于外部作用域
\`\`\`

（在 Python 2 里 \`i\` 会泄漏到外部，这是个被修复的历史坑。）所以可以放心用 \`i\`、\`x\` 这种短变量名，不用担心污染外部。

但要注意：**推导式能读取外层变量**，但不能（也不应）修改外层变量。如果推导式里需要外层状态，通常说明该用循环了。

---

## 十三、实用技巧集锦

### 13.1 展平嵌套

\`\`\`py
nested = [[1, 2], [3, 4], [5, 6]]  # 创建列表并赋给 nested
flat = [x for row in nested for x in row]  # 创建列表并赋给 flat
print(flat)   # [1,2,3,4,5,6]
\`\`\`

### 13.2 矩阵转置

\`\`\`py
matrix = [[1, 2, 3], [4, 5, 6]]    # 创建列表并赋给 matrix
transposed = [[row[i] for row in matrix] for i in range(len(matrix[0]))]  # 创建列表并赋给 transposed
print(transposed)   # [[1,4],[2,5],[3,6]]
# 更简洁：zip 解包
print(list(zip(*matrix)))   # [(1,4),(2,5),(3,6)]
\`\`\`

### 13.3 用字典做分组（推导式思路）

\`\`\`py
people = [("Alice", 30), ("Bob", 25), ("Carol", 30)]  # 创建列表并赋给 people
# 按年龄分组
groups = {}                        # 创建集合并赋给 groups
for name, age in people:           # 遍历 people，每次取值赋给 name, age
    groups.setdefault(age, []).append(name)  # 对 groups 调用 设置默认值 方法，参数 age, []).append(name
print(groups)   # {30:['Alice','Carol'], 25:['Bob']}
\`\`\`

### 13.4 过滤 + 变换一次完成

\`\`\`py
# 取偶数的平方
nums = range(10)                   # 将 range(10) 赋给 nums
result = [x ** 2 for x in nums if x % 2 == 0]  # 创建列表并赋给 result
print(result)   # [0, 4, 16, 36, 64]
\`\`\`

### 13.5 字符串处理

\`\`\`py
# 提取所有单词的首字母
sentence = "the quick brown fox"   # 将字符串 "the quick brown fox" 赋给 sentence
initials = [w[0] for w in sentence.split()]  # 创建列表并赋给 initials
print(initials)   # ['t','q','b','f']

# 去除空字符串
words = ["a", "", "b", "", "c"]    # 创建列表并赋给 words
clean = [w for w in words if w]    # 创建列表并赋给 clean
print(clean)   # ['a','b','c']
\`\`\`

---

## 十四、itertools 与生成器配合

\`itertools\` 模块提供一堆高效迭代工具，常和生成器/推导式搭配：

\`\`\`py
from itertools import chain, islice, count  # 从 itertools 导入 chain, islice, count

# chain：把多个可迭代对象串起来
for x in chain([1, 2], [3, 4]):    # 遍历 chain([1, 2], [3, 4])，每次取值赋给 x
    print(x)        # 1 2 3 4

# islice：切片生成器（生成器不支持切片，用 islice）
gen = (x ** 2 for x in range(100)) # 创建元组并赋给 gen
print(list(islice(gen, 5)))   # [0,1,4,9,16]，只取前 5 个

# count：无限计数
for i in count(1):                 # 遍历 count(1)，每次取值赋给 i
    if i > 5:                      # 如果 i > 5 成立
        break                      # 跳出循环
    print(i)        # 1 2 3 4 5
\`\`\`

itertools 的函数都是惰性的，处理大数据流时几乎不占额外内存。

---

## 十五、调试技巧

推导式出错时不好调试（不能在里面打断点 / print）。两个办法：

1. **先写成普通循环**跑通，再改写成推导式。
2. **用函数提取复杂表达式**，方便单独测试：

\`\`\`py
# 难调试
result = [transform(x) for x in data if validate(x)]  # 创建列表并赋给 result

# 改用函数，可单独测试
def should_keep(x):                # 定义函数 should_keep，参数：x
    return validate(x)             # 返回 validate(x)

result = [transform(x) for x in data if should_keep(x)]  # 创建列表并赋给 result
\`\`\`

记住：**推导式是写给人看的**。如果一行推导式需要读三遍才懂，那就该拆成循环或函数。

---

## 十六、本章小结

| 工具 | 用途 | 备注 |
| --- | --- | --- |
| 列表推导式 \`[]\` | 生成列表 | 最常用 |
| 字典推导式 \`{}\` | 生成字典 | \`键:值\` 表达式 |
| 集合推导式 \`{}\` | 生成集合 | 自动去重 |
| 生成器推导式 \`()\` | 惰性序列 | 省内存，配合聚合函数 |
| map | 逐个变换 | 推导式可替代 |
| filter | 过滤 | 推导式可替代 |
| reduce | 归约 | functools，少用 |
| sorted(key=) | 排序 | key 比较值 |
| any / all | 存在/全称判断 | 短路，配生成器 |

推导式和函数式工具让 Python 代码既简洁又高效。但记住：**可读性永远是第一位的**。当推导式变复杂时，勇敢地退回到普通循环。
`,
    code: `# ============================================================
# 第四章代码演示：推导式与函数式工具
# ============================================================
print("========== 1. 列表推导式 ==========")
squares = [x ** 2 for x in range(5)]
print("平方:", squares)
evens = [x for x in range(10) if x % 2 == 0]
print("偶数(过滤):", evens)
labels = ["偶" if x % 2 == 0 else "奇" for x in range(5)]
print("三元标记:", labels)


print("\\n========== 2. 字典推导式 ==========")
sq_dict = {x: x ** 2 for x in range(5)}
print("平方字典:", sq_dict)
d = {"a": 1, "b": 2, "c": 3}
flipped = {v: k for k, v in d.items()}
print("翻转键值:", flipped)


print("\\n========== 3. 集合推导式 ==========")
nums = [1, -2, 3, -4, 5]
abs_set = {abs(x) for x in nums}
print("绝对值集合(去重):", abs_set)


print("\\n========== 4. 生成器推导式 ==========")
gen = (x ** 2 for x in range(5))
print("生成器对象:", gen)
print("转列表:", list(gen))
# 配合 sum 省内存
total = sum(x ** 2 for x in range(10))
print("0-9 平方和:", total)


print("\\n========== 5. 嵌套推导式 ==========")
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [num for row in matrix for num in row]
print("展平二维:", flat)
grid = [[0 for _ in range(4)] for _ in range(3)]
print("3x4 零矩阵:", grid)


print("\\n========== 6. 条件推导式进阶 ==========")
data = [1, -2, 3, -4, 5, -6]
result = [x if x > 2 else 0 for x in data if x > 0]
print("过滤负数后标记:", result)


print("\\n========== 7. map / filter / reduce ==========")
nums = [1, 2, 3, 4, 5, 6]
print("map 平方:", list(map(lambda x: x ** 2, nums)))
print("filter 偶数:", list(filter(lambda x: x % 2 == 0, nums)))
from functools import reduce
print("reduce 连乘:", reduce(lambda a, b: a * b, nums))
print("reduce 连加:", reduce(lambda a, b: a + b, nums))


print("\\n========== 8. sorted 与 key ==========")
words = ["banana", "apple", "cherry", "fig"]
print("按长度升序:", sorted(words, key=len))
print("按长度降序:", sorted(words, key=len, reverse=True))

students = [("Alice", 90), ("Bob", 75), ("Carol", 88)]
print("按分数排序:", sorted(students, key=lambda s: s[1]))

# 多关键字：分数降序，同分年龄升序
data = [("Alice", 90, 18), ("Bob", 90, 20), ("Carol", 88, 19)]
print("多关键字排序:", sorted(data, key=lambda s: (-s[1], s[2])))


print("\\n========== 9. any 与 all ==========")
nums = [0, 1, 2, 3]
print("any(nums):", any(nums))
print("all(nums):", all(nums))
print("any(>5):", any(x > 5 for x in nums))
print("all(>=0):", all(x >= 0 for x in nums))
print("all([]):", all([]), " any([]):", any([]))   # 空可迭代


print("\\n========== 10. 推导式 vs 循环对比 ==========")
# 推导式写法
sq1 = [x ** 2 for x in range(10)]
# 等价循环写法
sq2 = []
for x in range(10):
    sq2.append(x ** 2)
print("推导式:", sq1)
print("循环  :", sq2)
print("两者相等:", sq1 == sq2)


print("\\n========== 11. 综合练习：用推导式处理数据 ==========")
# 给定一组成绩，计算：及格人数、平均分、最高分、按等级分类
scores = [55, 78, 92, 45, 88, 67, 95, 30, 72]
passed = [s for s in scores if s >= 60]
print("及格的:", passed)
print("及格人数:", len(passed))
print("平均分:", sum(scores) / len(scores))
print("最高分:", max(scores))
grade_map = [(s, "优秀" if s >= 90 else "良好" if s >= 80 else "及格" if s >= 60 else "不及格") for s in scores]
print("等级分类:", grade_map)

# 用生成器 + any/all 做判断
print("是否有人满分:", any(s == 100 for s in scores))
print("是否全员及格:", all(s >= 60 for s in scores))
`,
  },
];
