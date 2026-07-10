// =============================================================
// py8-chapters-batch3.js
// 模块：流程控制（共 10 章）
// 全新制作，简单易懂，demo 多，难代码逐行讲解
// =============================================================

export const chapters = [
  {
    id: "py8-if",
    group: "流程控制",
    icon: "🔀",
    title: "if 条件语句",
    content: `## if 条件语句

\`if\` 是 Python 最基础的控制流：**根据条件决定执行哪段代码**。

### 基本语法

\`\`\`python
if 条件:  # 如果 条件
    # 条件为真时执行（必须缩进 4 空格）
    语句1
    语句2
\`\`\`

注意冒号 \`:\` 和**缩进**——这是 Python 用缩进表示代码块的核心机制，没有花括号。

### 完整 if / elif / else 结构

\`\`\`python
score = 85                                          # 待评定的分数

if score >= 90:                                      # 第一档：90 分及以上
    grade = "A"                                       # 评级 A
elif score >= 80:        # elif = else if 的缩写     # 第二档：80~89
    grade = "B"  # 定义字符串 grade
elif score >= 60:                                    # 第三档：60~79
    grade = "C"  # 定义字符串 grade
else:                                                # 兜底：60 以下
    grade = "D"  # 定义字符串 grade
\`\`\`

- \`if\` 必须，只能 1 个
- \`elif\` 可选，可有多个
- \`else\` 可选，只能 1 个（兜底）

### 缩进块的规则

| 情况 | 是否合法 |
|------|----------|
| 同一块统一 4 空格 | ✅ |
| 同一块混用空格和 Tab | ❌ 报错 |
| 不同块缩进不同层级 | ✅ 正常嵌套 |
| 缩进数不对齐 | ❌ IndentationError |

### 嵌套 if

\`\`\`python
age = 20  # 定义数值 age
has_ticket = True  # 赋值变量 has_ticket

if age >= 18:                  # 外层判断年龄
    if has_ticket:             # 内层判断是否有票
        print("可以入场")  # 打印输出到屏幕
    else:  # 否则
        print("请先购票")  # 打印输出到屏幕
else:  # 否则
    print("未成年人不可入")    # 年龄不满足，走 else
\`\`\`

### 条件为真的判断（truthy）

Python 中**不是只有 True/False** 才能做条件，任何对象都可判断真假：

| 假（falsy） | 真（truthy） |
|------------|-------------|
| \`False\` | \`True\` |
| \`0\`、\`0.0\` | 非 0 数字 |
| \`""\` 空字符串 | 非空字符串 |
| \`[]\` 空列表 | 非空列表 |
| \`{}\` 空字典 | 非空字典 |
| \`None\` | 非 None |
| \`()\`、\`set()\` | 非空元组/集合 |

\`\`\`python
name = ""  # 定义字符串 name
if name:               # 空字符串为假
    print("有名字")  # 打印输出到屏幕
else:  # 否则
    print("没名字")    # 输出这个
\`\`\`

### 比较运算符

| 运算符 | 含义 | 示例 |
|--------|------|------|
| \`==\` | 等于 | \`1 == 1\` |
| \`!=\` | 不等于 | \`1 != 2\` |
| \`>\` / \`<\` | 大于/小于 | \`3 > 2\` |
| \`>=\` / \`<=\` | 大于等于 | \`3 >= 3\` |
| \`in\` | 是否包含 | \`"a" in "abc"\` |
| \`is\` | 同一对象 | \`a is None\` |

### 逻辑运算符组合

\`\`\`python
age = 25  # 定义数值 age
has_id = True  # 赋值变量 has_id

# and：两个都为真
if age >= 18 and has_id:  # 如果 age >= 18 and has_id
    print("允许进入")  # 打印输出到屏幕

# or：至少一个为真
if age < 12 or age > 65:  # 如果 age < 12 or age > 65
    print("半价票")  # 打印输出到屏幕

# not：取反
if not has_id:  # 如果 not has_id
    print("请出示身份证")  # 打印输出到屏幕
\`\`\`

### 链式比较（Python 特色）

\`\`\`python
n = 5  # 定义数值 n
# 等价于 1 < n and n < 10
if 1 < n < 10:  # 如果 1 < n < 10
    print("在范围内")  # 打印输出到屏幕
\`\`\`

### 三元表达式 x if cond else y

一行写完简单的 if-else：

\`\`\`python
age = 20  # 定义数值 age
status = "成年" if age >= 18 else "未成年"  # 定义字符串 status
# 等价于：
# if age >= 18:
#     status = "成年"
# else:
#     status = "未成年"
\`\`\`

### 常见陷阱：= 与 ==

| 写法 | 含义 | 在 if 里 |
|------|------|----------|
| \`if x = 5:\` | 赋值 | ❌ 语法错误 |
| \`if x == 5:\` | 判断相等 | ✅ 正确 |
| \`if x = None:\` | 赋值 | ❌ 应用 \`is None\` |
| \`if x == None:\` | 判断 None | ⚠️ 可运行但不推荐，建议 \`is None\` |

> 💡 判断 None 用 \`is None\`，判断 True/False 也用 \`is\` 更规范。

下面的 demo 把上述知识点全部演示一遍，每段都带详细注释。`,
    code: `# ==========================================
# if 条件语句完整演示
# ==========================================

# 1. 基础 if
print("=== 1. 基础 if ===")
age = 20
if age >= 18:                        # 冒号 + 缩进
    print("你已成年")
    print("可以考驾照")

# 2. if / elif / else 阶梯判断
print()
print("=== 2. if/elif/else 评分 ===")
score = 85
if score >= 90:                      # 第一层判断
    grade = "A"
elif score >= 80:                    # 否则如果
    grade = "B"
elif score >= 60:                    # 否则如果
    grade = "C"
else:                                # 兜底
    grade = "D"
print(f"分数 {score} -> 等级 {grade}")

# 3. 嵌套 if
print()
print("=== 3. 嵌套 if ===")
user_age = 20
has_ticket = True
if user_age >= 18:
    if has_ticket:                   # 嵌套一层
        print("成年人且有票，可入场")
    else:
        print("成年人但没票，请购票")
else:
    print("未成年不可入")

# 4. truthy 真假值判断
print()
print("=== 4. truthy 真假值 ===")
values = [0, 1, "", "hello", [], [1], {}, None, True, False]
for v in values:
    # 把 v 放进 if 自动判断真假
    if v:
        print(f"  {repr(v):12} -> 真值（truthy）")
    else:
        print(f"  {repr(v):12} -> 假值（falsy）")

# 5. 比较与逻辑组合
print()
print("=== 5. 比较与逻辑组合 ===")
temp = 28
is_sunny = True
if temp > 25 and is_sunny:           # and 两边都真
    print("天气晴朗炎热")
if temp < 0 or temp > 35:            # or 任一为真
    print("极端温度")
if not is_sunny:                     # not 取反
    print("阴天")
else:
    print("晴天")

# 6. 链式比较
print()
print("=== 6. 链式比较 ===")
n = 5
if 1 < n < 10:                       # 等价 1 < n and n < 10
    print(f"{n} 在 1 到 10 之间")

# 7. in 成员判断
print()
print("=== 7. in 成员判断 ===")
fruits = ["苹果", "香蕉", "橙子"]
if "香蕉" in fruits:
    print("有香蕉")
if "葡萄" not in fruits:
    print("没葡萄")

# 8. 三元表达式
print()
print("=== 8. 三元表达式 ===")
score = 85
result = "及格" if score >= 60 else "不及格"
print(f"分数 {score} -> {result}")
# 嵌套三元（不推荐太深，演示用）
level = "优" if score >= 90 else ("良" if score >= 80 else "中")
print(f"等级：{level}")

# 9. 常见陷阱演示
print()
print("=== 9. 常见陷阱 ===")
x = 5
# 错误写法演示（注释掉，否则报错）
# if x = 5:    # SyntaxError，= 是赋值不能做条件
#     print("错了")
# 正确写法
if x == 5:
    print(f"x == 5 判断成功，x = {x}")

# 判断 None 用 is
value = None
if value is None:
    print("value 是 None（推荐用 is 判断）")
if value is not None:
    print("value 不是 None")
else:
    print("用 is not 也能判断 None")

# 10. 实战：BMI 健康判断
print()
print("=== 10. 实战 BMI 判断 ===")
weight = 70    # 千克
height = 1.75  # 米
bmi = weight / (height ** 2)
if bmi < 18.5:
    category = "偏瘦"
elif bmi < 24:
    category = "正常"
elif bmi < 28:
    category = "偏胖"
else:
    category = "肥胖"
print(f"BMI = {bmi:.1f}，分类：{category}")`
  },
  {
    id: "py8-while",
    group: "流程控制",
    icon: "🔁",
    title: "while 循环",
    content: `## while 循环

\`while\` 用于**条件为真时反复执行**一段代码，直到条件变假。

### 基本语法

\`\`\`python
while 条件:  # 当 条件 时循环
    循环体
    # 必须有让条件变假的语句，否则死循环
\`\`\`

### 计数器模式

\`\`\`python
count = 0  # 定义数值 count
while count < 5:  # 当 count < 5 时循环
    print(count)  # 打印输出到屏幕
    count += 1        # 别忘了让 count 增长，否则永远 < 5
\`\`\`

### while True 无限循环

\`\`\`python
while True:  # 当 True 时循环
    cmd = input("命令：")  # 赋值变量 cmd
    if cmd == "quit":  # 如果 cmd == "quit"
        break          # 用 break 退出无限循环
\`\`\`

\`while True\` 配合 \`break\` 是很常见的"持续运行直到用户退出"模式。

### break 跳出整个循环

\`\`\`python
i = 0  # 定义数值 i
while True:  # 当 True 时循环
    if i >= 3:  # 如果 i >= 3
        break          # 跳出循环，不再执行后续
    print(i)  # 打印输出到屏幕
    i += 1  # i 累加
# 输出 0 1 2
\`\`\`

### continue 跳过本次

\`\`\`python
i = 0  # 定义数值 i
while i < 5:  # 当 i < 5 时循环
    i += 1  # i 累加
    if i == 3:  # 如果 i == 3
        continue       # 跳过本次后续语句，进入下一轮
    print(i)  # 打印输出到屏幕
# 输出 1 2 4 5（跳过 3）
\`\`\`

### while-else（Python 特色）

\`\`\`python
i = 0  # 定义数值 i
while i < 3:  # 当 i < 3 时循环
    print(i)  # 打印输出到屏幕
    i += 1  # i 累加
else:  # 否则
    print("正常结束")   # 没有 break 才执行
\`\`\`

**关键规则**：\`else\` 只在循环**自然结束**时执行，被 \`break\` 跳出时**不执行**。

| 情况 | else 执行？ |
|------|------------|
| 条件变假自然结束 | ✅ 执行 |
| 被 break 跳出 | ❌ 不执行 |

### 避免死循环

| 陷阱 | 原因 | 解决 |
|------|------|------|
| 忘记更新计数器 | \`i\` 永远不变 | 循环体加 \`i += 1\` |
| 条件永远为真 | \`while True\` 没 break | 加 break 退出 |
| 浮点累加误差 | \`0.1 + 0.1 + ...\` 不精确 | 用整数计数或 \`round()\` |
| 修改了循环依赖的列表 | 长度变了导致越界 | 用副本遍历 |

### 经典模式速查

\`\`\`python
# 1. 累加
total = 0  # 定义数值 total
i = 1  # 定义数值 i
while i <= 100:  # 当 i <= 100 时循环
    total += i  # total 累加
    i += 1  # i 累加

# 2. 倒计时
n = 5  # 定义数值 n
while n > 0:  # 当 n > 0 时循环
    print(n)  # 打印输出到屏幕
    n -= 1  # n 累减

# 3. 猜数字（while True + break）
target = 42  # 定义数值 target
while True:  # 当 True 时循环
    guess = 50  # 定义数值 guess
    if guess == target:  # 如果 guess == target
        break  # 跳出循环
\`\`\`

### while vs for 怎么选

| 场景 | 推荐 |
|------|------|
| 已知循环次数 | \`for i in range(n)\` |
| 不确定次数，靠条件 | \`while\` |
| 持续运行直到退出 | \`while True\` + break |
| 遍历集合 | \`for\` |

下面的 demo 把上述模式都演示一遍。`,
    code: `# ==========================================
# while 循环完整演示
# ==========================================

# 1. 基础 while：计数器
print("=== 1. 基础 while ===")
count = 0
while count < 5:           # 当 count < 5 时
    print(f"  第 {count} 次")
    count += 1             # 关键：更新计数器，否则死循环
print(f"循环结束，count = {count}")

# 2. 累加求和：1+2+...+100
print()
print("=== 2. 累加求和 ===")
total = 0
i = 1
while i <= 100:
    total += i             # 把 i 累加到 total
    i += 1
print(f"1 到 100 的和 = {total}")

# 3. while True + break：模拟命令循环
print()
print("=== 3. while True + break ===")
commands = ["start", "run", "stop", "quit"]  # 模拟用户输入序列
idx = 0
while True:
    cmd = commands[idx]    # 取一条命令
    idx += 1
    print(f"  执行命令：{cmd}")
    if cmd == "quit":
        print("  收到退出命令，结束循环")
        break              # 跳出整个循环
print("已退出 while True")

# 4. continue 跳过本次
print()
print("=== 4. continue 跳过偶数 ===")
i = 0
while i < 10:
    i += 1
    if i % 2 == 0:         # 偶数
        continue           # 跳过本次，进入下一轮
    print(f"  奇数：{i}")

# 5. while-else：正常结束时执行
print()
print("=== 5. while-else（正常结束）===")
n = 0
while n < 3:
    print(f"  n = {n}")
    n += 1
else:
    print("  循环自然结束，else 执行")

# 6. while-else：被 break 时不执行
print()
print("=== 6. while-else（被 break 不执行）===")
n = 0
while n < 10:
    print(f"  n = {n}")
    if n == 2:
        print("  触发 break")
        break              # 跳出，else 不执行
    n += 1
else:
    print("  这行不会打印")

# 7. 倒计时
print()
print("=== 7. 倒计时 ===")
n = 5
while n > 0:
    print(f"  {n}...")
    n -= 1
print("  发射！")

# 8. 实战：找第一个大于 1000 的 2 的幂
print()
print("=== 8. 找第一个大于 1000 的 2 的幂 ===")
power = 1
exponent = 0
while power <= 1000:
    power *= 2            # 不断乘 2
    exponent += 1
print(f"  2 的 {exponent} 次方 = {power}，是第一个大于 1000 的")

# 9. 实战：辗转相除法求最大公约数
print()
print("=== 9. 辗转相除求 GCD ===")
a, b = 48, 36
original_a, original_b = a, b
while b != 0:             # 当 b 不为 0
    a, b = b, a % b       # 经典辗转相除
print(f"  gcd({original_a}, {original_b}) = {a}")

# 10. 模拟猜数字游戏
print()
print("=== 10. 模拟猜数字 ===")
target = 42
guesses = [10, 50, 42]    # 模拟用户的猜测序列
idx = 0
attempts = 0
while True:
    guess = guesses[idx]
    idx += 1
    attempts += 1
    print(f"  第 {attempts} 次猜：{guess}")
    if guess < target:
        print("    太小了")
    elif guess > target:
        print("    太大了")
    else:
        print(f"    猜中了！用了 {attempts} 次")
        break

# 11. 死循环陷阱演示（注释说明）
print()
print("=== 11. 死循环陷阱提示 ===")
print("  错误写法（千万别运行）：")
print("    i = 0")
print("    while i < 5:")
print("        print(i)        # 忘记 i += 1，永远死循环")
print("  正确写法：循环体必须有让条件变假的语句")
print()
print("while 循环演示完成")`
  },
  {
    id: "py8-for",
    group: "流程控制",
    icon: "🔄",
    title: "for 循环与可迭代对象",
    content: `## for 循环

\`for\` 用于**遍历可迭代对象**（列表、字符串、字典、元组、集合等），每次取出一个元素。

### 基本语法

\`\`\`python
for 元素 in 可迭代对象:  # 遍历 可迭代对象，取值给 元素
    处理元素
\`\`\`

### 遍历列表

\`\`\`python
fruits = ["苹果", "香蕉", "橙子"]  # 定义列表 fruits
for fruit in fruits:  # 遍历 fruits，取值给 fruit
    print(fruit)  # 打印输出到屏幕
\`\`\`

### 遍历字符串

\`\`\`python
for ch in "Python":  # 遍历 "Python"，取值给 ch
    print(ch)        # 逐个字符 P y t h o n
\`\`\`

### 遍历字典

字典有三种遍历方式：

\`\`\`python
user = {"name": "小明", "age": 18, "city": "北京"}  # 定义字典 user

# 1. 默认遍历键
for key in user:  # 遍历 user，取值给 key
    print(key, user[key])  # 打印输出到屏幕

# 2. .keys() 只取键
for key in user.keys():  # 遍历 user.keys()，取值给 key
    print(key)  # 打印输出到屏幕

# 3. .values() 只取值
for val in user.values():  # 遍历 user.values()，取值给 val
    print(val)  # 打印输出到屏幕

# 4. .items() 同时取键值（最常用）
for key, val in user.items():  # 遍历 user.items()，取值给 key, val
    print(f"{key} = {val}")  # 打印输出到屏幕
\`\`\`

### 遍历元组与集合

\`\`\`python
# 元组
for item in (1, 2, 3):  # 遍历 (1, 2, 3)，取值给 item
    print(item)  # 打印输出到屏幕

# 集合（无序）
for s in {10, 20, 30}:  # 遍历 {10, 20, 30}，取值给 s
    print(s)  # 打印输出到屏幕
\`\`\`

### 序列解包 for a, b in pairs

\`\`\`python
pairs = [(1, "a"), (2, "b"), (3, "c")]  # 定义列表 pairs
for num, letter in pairs:    # 直接解包
    print(num, letter)  # 打印输出到屏幕
\`\`\`

### enumerate 带索引

\`\`\`python
fruits = ["苹果", "香蕉"]  # 定义列表 fruits
for index, fruit in enumerate(fruits):  # 遍历 enumerate(fruits)，取值给 index, fruit
    print(f"{index}: {fruit}")  # 打印输出到屏幕
# 0: 苹果
# 1: 香蕉

# 指定起始索引
for i, fruit in enumerate(fruits, start=1):  # 遍历 enumerate(fruits, start=1)，取值给 i, fruit
    print(f"{i}: {fruit}")  # 打印输出到屏幕
\`\`\`

### range 生成数字序列

\`\`\`python
for i in range(5):           # 0 1 2 3 4
    print(i)  # 打印输出到屏幕

for i in range(2, 6):        # 2 3 4 5
    print(i)  # 打印输出到屏幕

for i in range(0, 10, 2):    # 0 2 4 6 8（步长 2）
    print(i)  # 打印输出到屏幕
\`\`\`

### 嵌套循环：乘法表

\`\`\`python
for i in range(1, 10):       # 外层：行
    for j in range(1, i + 1): # 内层：列
        print(f"{j}x{i}={i*j}", end=" ")  # 打印输出到屏幕
    print()                   # 换行
\`\`\`

### 三种遍历方式对比

| 方式 | 用途 | 示例 |
|------|------|------|
| \`for x in seq\` | 只取元素 | \`for x in [1,2,3]\` |
| \`for i, x in enumerate(seq)\` | 要索引和元素 | \`for i,x in enumerate(xs)\` |
| \`for x in range(n)\` | 只需索引 | \`for i in range(5)\` |

### 遍历时修改列表的陷阱

\`\`\`python
nums = [1, 2, 3, 4, 5]  # 定义列表 nums
# 错误：边遍历边删除会跳过元素
for x in nums:  # 遍历 nums，取值给 x
    if x % 2 == 0:  # 如果 x % 2 == 0
        nums.remove(x)        # 危险！

# 正确：遍历副本
for x in nums[:]:             # nums[:] 是副本
    if x % 2 == 0:  # 如果 x % 2 == 0
        nums.remove(x)  # 调用 nums.remove()：删除指定元素

# 更好：用推导式
nums = [x for x in nums if x % 2 != 0]  # 定义列表 nums
\`\`\`

下面的 demo 把上述知识点都演示一遍。`,
    code: `# ==========================================
# for 循环与可迭代对象完整演示
# ==========================================

# 1. 遍历列表
print("=== 1. 遍历列表 ===")
fruits = ["苹果", "香蕉", "橙子"]
for fruit in fruits:
    print(f"  水果：{fruit}")

# 2. 遍历字符串
print()
print("=== 2. 遍历字符串 ===")
for ch in "Python":
    print(f"  字符：{ch}")

# 3. 遍历字典三种方式
print()
print("=== 3. 遍历字典 ===")
user = {"name": "小明", "age": 18, "city": "北京"}

print("  .keys()：")
for key in user.keys():
    print(f"    {key}")

print("  .values()：")
for val in user.values():
    print(f"    {val}")

print("  .items()：")
for key, val in user.items():
    print(f"    {key} = {val}")

# 4. 遍历元组与集合
print()
print("=== 4. 遍历元组与集合 ===")
print("  元组：")
for item in (1, 2, 3):
    print(f"    {item}")

print("  集合（注意无序）：")
s = {30, 10, 20}
for item in sorted(s):       # 排序后输出
    print(f"    {item}")

# 5. 序列解包
print()
print("=== 5. 序列解包 ===")
students = [(1, "小明", 90), (2, "小红", 85), (3, "小刚", 78)]
for id_, name, score in students:    # 一次解包三个值
    print(f"  学号 {id_}：{name}，{score} 分")

# 6. enumerate 带索引
print()
print("=== 6. enumerate 带索引 ===")
print("  默认从 0 开始：")
for i, fruit in enumerate(fruits):
    print(f"    {i}: {fruit}")

print("  从 1 开始：")
for i, fruit in enumerate(fruits, start=1):
    print(f"    {i}: {fruit}")

# 7. range 三种用法
print()
print("=== 7. range 三种用法 ===")
print("  range(5)：", end="")
for i in range(5):
    print(i, end=" ")
print()

print("  range(2, 6)：", end="")
for i in range(2, 6):
    print(i, end=" ")
print()

print("  range(0, 10, 2)：", end="")
for i in range(0, 10, 2):
    print(i, end=" ")
print()

# 8. 嵌套循环：九九乘法表
print()
print("=== 8. 九九乘法表 ===")
for i in range(1, 10):           # 外层：行 1~9
    for j in range(1, i + 1):    # 内层：列 1~i
        print(f"{j}x{i}={i*j}", end="  ")
    print()                       # 每行结束换行

# 9. 累加求和
print()
print("=== 9. 累加求和 ===")
total = 0
for i in range(1, 101):
    total += i
print(f"  1+2+...+100 = {total}")

# 10. 遍历时修改列表的陷阱演示
print()
print("=== 10. 遍历时修改列表 ===")
nums = [1, 2, 3, 4, 5, 6]
# 正确方式：遍历副本，修改原列表
for x in nums[:]:                # nums[:] 是副本
    if x % 2 == 0:
        nums.remove(x)
print(f"  删除偶数后：{nums}")

# 更好方式：列表推导式
nums2 = [1, 2, 3, 4, 5, 6]
odd = [x for x in nums2 if x % 2 != 0]
print(f"  推导式筛奇数：{odd}")

# 11. 统计字符出现次数
print()
print("=== 11. 统计字符出现次数 ===")
text = "hello python world"
counter = {}
for ch in text:
    if ch == " ":
        continue
    # dict.get(key, default) 不存在时返回默认值
    counter[ch] = counter.get(ch, 0) + 1
# 按出现次数排序输出
for ch, count in sorted(counter.items(), key=lambda x: -x[1])[:5]:
    print(f"  '{ch}' 出现 {count} 次")

# 12. 嵌套列表展平
print()
print("=== 12. 嵌套列表展平 ===")
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = []
for row in matrix:
    for x in row:
        flat.append(x)
print(f"  原矩阵：{matrix}")
print(f"  展平后：{flat}")

print()
print("for 循环演示完成")`
  },
  {
    id: "py8-range-enum",
    group: "流程控制",
    icon: "📊",
    title: "range 与 enumerate 与 zip",
    content: `## range 函数

\`range\` 生成**整数序列**，是 Python 中最常用的可迭代对象之一。它**不真正存储所有数字**，而是按需计算，所以 \`\`range(1000000)\` 几乎不占内存。

### 三种调用方式

\`\`\`python
range(stop)                  # 0 到 stop-1
range(start, stop)           # start 到 stop-1
range(start, stop, step)     # 从 start，每次加 step，到 stop 之前停
\`\`\`

| 调用 | 生成的序列 |
|------|-----------|
| \`range(5)\` | 0, 1, 2, 3, 4 |
| \`range(2, 6)\` | 2, 3, 4, 5 |
| \`range(0, 10, 2)\` | 0, 2, 4, 6, 8 |
| \`range(10, 0, -1)\` | 10, 9, 8, ..., 1 |
| \`range(10, 0, -3)\` | 10, 7, 4, 1 |
| \`range(5, 5)\` | 空 |

### 关键点：左闭右开

\`range(a, b)\` **包含 a 不包含 b**，和切片 \`list[a:b]\` 一致。

### 倒序 range

\`\`\`python
for i in range(5, 0, -1):    # 5, 4, 3, 2, 1
    print(i)  # 打印输出到屏幕
\`\`\`

或者用 \`reversed()\`：

\`\`\`python
for i in reversed(range(5)):  # 4, 3, 2, 1, 0
    print(i)  # 打印输出到屏幕
\`\`\`

### range 不是列表

\`\`\`python
print(range(5))        # range(0, 5)，不是 [0,1,2,3,4]
print(type(range(5)))  # <class 'range'>

# 需要列表时用 list() 转换
nums = list(range(5))  # [0, 1, 2, 3, 4]
\`\`\`

### range 的成员判断

\`\`\`python
print(3 in range(10))         # True，很快
print(15 in range(10))        # False
print(range(5).count(2))      # 1
print(range(10).index(7))     # 7
\`\`\`

## enumerate 函数

\`enumerate\` 给可迭代对象**附加索引**，返回 \`(索引, 元素)\` 元组。

\`\`\`python
enumerate(iterable, start=0)  # 枚举
\`\`\`

\`\`\`python
fruits = ["苹果", "香蕉", "橙子"]  # 定义列表 fruits

for i, fruit in enumerate(fruits):  # 遍历 enumerate(fruits)，取值给 i, fruit
    print(i, fruit)  # 打印输出到屏幕
# 0 苹果
# 1 香蕉
# 2 橙子

# 指定起始索引
for i, fruit in enumerate(fruits, start=1):  # 遍历 enumerate(fruits, start=1)，取值给 i, fruit
    print(i, fruit)  # 打印输出到屏幕
# 1 苹果
# 2 香蕉
# 3 橙子
\`\`\`

### 不用 enumerate 的笨办法（对比）

\`\`\`python
# 笨办法：手动维护索引
i = 0  # 定义数值 i
for fruit in fruits:  # 遍历 fruits，取值给 fruit
    print(i, fruit)  # 打印输出到屏幕
    i += 1  # i 累加

# 也不好：用 range + len
for i in range(len(fruits)):  # 遍历 range(len(fruits))，取值给 i
    print(i, fruits[i])  # 打印输出到屏幕

# 推荐：enumerate
for i, fruit in enumerate(fruits):  # 遍历 enumerate(fruits)，取值给 i, fruit
    print(i, fruit)  # 打印输出到屏幕
\`\`\`

## zip 函数

\`zip\` 把多个可迭代对象**并行打包**，每次各取一个，组成元组。

\`\`\`python
names = ["小明", "小红", "小刚"]  # 定义列表 names
ages = [18, 20, 22]  # 定义列表 ages

for name, age in zip(names, ages):  # 遍历 zip(names, ages)，取值给 name, age
    print(name, age)  # 打印输出到屏幕
# 小明 18
# 小红 20
# 小刚 22
\`\`\`

### zip 不等长截断

\`\`\`python
a = [1, 2, 3, 4, 5]  # 定义列表 a
b = ["a", "b", "c"]  # 定义列表 b
list(zip(a, b))    # [(1,'a'), (2,'b'), (3,'c')]，截到短的
\`\`\`

### itertools.zip_longest 不截断

\`\`\`python
from itertools import zip_longest  # 从 itertools 导入 zip_longest

a = [1, 2, 3, 4, 5]  # 定义列表 a
b = ["a", "b", "c"]  # 定义列表 b
list(zip_longest(a, b, fillvalue="-"))  # 转为列表
# [(1,'a'), (2,'b'), (3,'c'), (4,'-'), (5,'-')]
\`\`\`

### zip 配合 dict 创建字典

\`\`\`python
keys = ["name", "age", "city"]  # 定义列表 keys
vals = ["小明", 18, "北京"]  # 定义列表 vals
d = dict(zip(keys, vals))  # 赋值变量 d
# {'name': '小明', 'age': 18, 'city': '北京'}
\`\`\`

### * 解包 zip

\`\`\`python
pairs = [(1, 'a'), (2, 'b'), (3, 'c')]  # 定义列表 pairs
nums, letters = zip(*pairs)    # 解包成两个序列
# nums = (1, 2, 3), letters = ('a', 'b', 'c')
\`\`\`

\`zip(*pairs)\` 是 \`zip\` 的逆运算，常用于矩阵转置：

\`\`\`python
matrix = [[1, 2, 3], [4, 5, 6]]  # 定义列表 matrix
transposed = list(zip(*matrix))  # 赋值变量 transposed
# [(1, 4), (2, 5), (3, 6)]
\`\`\`

### 三个函数对比

| 函数 | 作用 | 返回 |
|------|------|------|
| \`range(n)\` | 生成数字序列 | range 对象 |
| \`enumerate(seq)\` | 加索引 | (index, value) |
| \`zip(a, b)\` | 并行打包 | (a_i, b_i) |

下面的 demo 把三者结合使用演示。`,
    code: `# ==========================================
# range / enumerate / zip 完整演示
# ==========================================

# 1. range 三种调用方式
print("=== 1. range 三种调用 ===")
print("  range(5)：", list(range(5)))
print("  range(2, 6)：", list(range(2, 6)))
print("  range(0, 10, 2)：", list(range(0, 10, 2)))
print("  range(10, 0, -1)：", list(range(10, 0, -1)))
print("  range(10, 0, -3)：", list(range(10, 0, -3)))
print("  range(5, 5)：", list(range(5, 5)))    # 空

# 2. range 不是列表
print()
print("=== 2. range 的类型 ===")
r = range(5)
print(f"  range(5) = {r}")
print(f"  类型 = {type(r).__name__}")
print(f"  转列表 = {list(r)}")

# 3. range 成员判断
print()
print("=== 3. range 成员判断 ===")
print(f"  3 in range(10) -> {3 in range(10)}")
print(f"  15 in range(10) -> {15 in range(10)}")
print(f"  range(10).count(5) -> {range(10).count(5)}")
print(f"  range(10).index(7) -> {range(10).index(7)}")

# 4. 倒序 range
print()
print("=== 4. 倒序 range ===")
print("  range(5, 0, -1)：", end="")
for i in range(5, 0, -1):
    print(i, end=" ")
print()
print("  reversed(range(5))：", end="")
for i in reversed(range(5)):
    print(i, end=" ")
print()

# 5. enumerate 基础
print()
print("=== 5. enumerate 基础 ===")
fruits = ["苹果", "香蕉", "橙子"]
print("  默认从 0：")
for i, fruit in enumerate(fruits):
    print(f"    {i}: {fruit}")
print("  从 1 开始：")
for i, fruit in enumerate(fruits, start=1):
    print(f"    {i}: {fruit}")

# 6. enumerate 用于查找
print()
print("=== 6. enumerate 查找元素索引 ===")
nums = [10, 20, 30, 40, 50]
target = 30
for i, val in enumerate(nums):
    if val == target:
        print(f"  找到 {target}，索引 = {i}")
        break

# 7. zip 并行遍历
print()
print("=== 7. zip 并行遍历 ===")
names = ["小明", "小红", "小刚"]
ages = [18, 20, 22]
cities = ["北京", "上海", "广州"]
for name, age, city in zip(names, ages, cities):
    print(f"  {name}，{age} 岁，{city}")

# 8. zip 不等长截断
print()
print("=== 8. zip 不等长截断 ===")
a = [1, 2, 3, 4, 5]
b = ["a", "b", "c"]
print(f"  a = {a}")
print(f"  b = {b}")
print(f"  zip(a, b) = {list(zip(a, b))}")    # 截到短的

# 9. zip_longest 不截断
print()
print("=== 9. zip_longest 不截断 ===")
from itertools import zip_longest
result = list(zip_longest(a, b, fillvalue="-"))
print(f"  zip_longest(a, b, fillvalue='-') = {result}")

# 10. zip 配合 dict
print()
print("=== 10. zip 创建字典 ===")
keys = ["name", "age", "city"]
vals = ["小明", 18, "北京"]
d = dict(zip(keys, vals))
print(f"  keys = {keys}")
print(f"  vals = {vals}")
print(f"  dict(zip(keys, vals)) = {d}")

# 11. * 解包 zip
print()
print("=== 11. * 解包 zip ===")
pairs = [(1, 'a'), (2, 'b'), (3, 'c')]
print(f"  原始 pairs = {pairs}")
nums, letters = zip(*pairs)    # zip(*...) 是 zip 的逆运算
print(f"  解包后 nums = {nums}")
print(f"  解包后 letters = {letters}")

# 12. 矩阵转置
print()
print("=== 12. 矩阵转置 ===")
matrix = [[1, 2, 3], [4, 5, 6]]
print(f"  原矩阵 = {matrix}")
transposed = list(zip(*matrix))
print(f"  转置后 = {transposed}")

# 13. 综合实战：学生成绩表
print()
print("=== 13. 综合实战 ===")
students = ["小明", "小红", "小刚"]
scores = [85, 92, 78]
print("  排名（按分数降序）：")
# zip 打包后按分数排序，enumerate 加名次
ranked = sorted(zip(students, scores), key=lambda x: -x[1])
for rank, (name, score) in enumerate(ranked, start=1):
    print(f"    第 {rank} 名：{name}，{score} 分")

# 14. 用 range 生成索引访问多个列表
print()
print("=== 14. range + 索引访问 ===")
print("  （不推荐，演示对比用）")
for i in range(len(students)):
    print(f"    {students[i]}：{scores[i]} 分")
print("  推荐：用 zip 更清晰")
for name, score in zip(students, scores):
    print(f"    {name}：{score} 分")

print()
print("range / enumerate / zip 演示完成")`
  },
  {
    id: "py8-loop-control",
    group: "流程控制",
    icon: "🛑",
    title: "break continue else 与 pass",
    content: `## break 跳出整个循环

\`break\` 立即结束**当前所在的循环**，不再执行后续任何迭代。

\`\`\`python
for i in range(10):  # 遍历 range(10)，取值给 i
    if i == 5:  # 如果 i == 5
        break          # 到 5 就停，整个循环结束
    print(i)  # 打印输出到屏幕
# 输出 0 1 2 3 4
\`\`\`

### 嵌套循环中 break 只跳出内层

\`\`\`python
for i in range(3):  # 遍历 range(3)，取值给 i
    for j in range(3):  # 遍历 range(3)，取值给 j
        if j == 1:  # 如果 j == 1
            break      # 只跳出内层 for
        print(i, j)  # 打印输出到屏幕
    print(f"外层 i={i} 继续")  # 打印输出到屏幕
\`\`\`

如果要跳出多层，可以用标志位或函数 return。

## continue 跳过本次

\`continue\` 跳过本轮剩余语句，**直接进入下一轮**。

\`\`\`python
for i in range(5):  # 遍历 range(5)，取值给 i
    if i % 2 == 0:  # 如果 i % 2 == 0
        continue       # 偶数跳过，不打印
    print(i)  # 打印输出到屏幕
# 输出 1 3
\`\`\`

### break vs continue 对比

| 语句 | 作用 | 后续迭代 |
|------|------|----------|
| \`break\` | 跳出整个循环 | 不再执行 |
| \`continue\` | 跳过本次 | 继续下一轮 |

## 循环 else 子句

Python 独有的特性：\`for\` 和 \`while\` 都可以接 \`else\`。

\`\`\`python
for x in seq:  # 遍历 seq，取值给 x
    ...  # 执行操作
    if 条件:  # 如果 条件
        break  # 跳出循环
else:  # 否则
    # 只有循环自然结束（没被 break）才执行
    print("没找到")  # 打印输出到屏幕
\`\`\`

### else 执行规则

| 情况 | else 是否执行 |
|------|--------------|
| 循环正常结束 | ✅ 执行 |
| 被 break 跳出 | ❌ 不执行 |
| 循环一次都没跑（空序列）| ✅ 执行 |

### 经典应用：搜索模式

\`\`\`python
# 在列表里找目标，找到就 break，没找到 else 提示
target = 5  # 定义数值 target
nums = [1, 2, 3, 4]  # 定义列表 nums
for n in nums:  # 遍历 nums，取值给 n
    if n == target:  # 如果 n == target
        print("找到了")  # 打印输出到屏幕
        break  # 跳出循环
else:  # 否则
    print("没找到")    # 输出这个，因为没 break
\`\`\`

这比用标志变量 \`found = False\` 更优雅。

## pass 空操作

\`pass\` 是**空语句**，什么都不做，主要用于**占位**：

\`\`\`python
# 1. 空函数占位
def todo():  # 定义函数 todo
    pass               # 还没想好怎么实现

# 2. 空类占位
class Empty:  # 定义类 Empty
    pass  # 空操作，占位符

# 3. 空的 if 块
if condition:  # 如果 condition
    pass               # 暂时不处理，但不能空着
else:  # 否则
    do_something()  # 调用 do_something()
\`\`\`

### 为什么需要 pass

Python 语法要求**缩进块不能为空**，必须有语句。所以暂时不写实现时用 \`pass\` 占位。

\`\`\`python
# 错误：块里没东西
if x > 0:  # 如果 x > 0
    # 这会报 IndentationError

# 正确：用 pass
if x > 0:  # 如果 x > 0
    pass  # 空操作，占位符
\`\`\`

### pass vs continue vs return

| 语句 | 作用 |
|------|------|
| \`pass\` | 空操作，啥都不做，继续往下执行 |
| \`continue\` | 跳过本次循环剩余部分 |
| \`return\` | 结束函数返回 |

## 综合实战：搜索 + else

\`\`\`python
# 找 100 以内的第一个素数
for n in range(2, 100):  # 遍历 range(2, 100)，取值给 n
    for d in range(2, n):  # 遍历 range(2, n)，取值给 d
        if n % d == 0:  # 如果 n % d == 0
            break       # 能被整除，不是素数
    else:  # 否则
        # 内层没 break，说明 n 是素数
        print(f"第一个素数：{n}")  # 打印输出到屏幕
        break           # 找到就停
\`\`\`

### 标志变量 vs else 写法对比

\`\`\`python
# 老写法：用标志变量
found = False  # 赋值变量 found
for n in nums:  # 遍历 nums，取值给 n
    if n == target:  # 如果 n == target
        print("找到")  # 打印输出到屏幕
        found = True  # 赋值变量 found
        break  # 跳出循环
if not found:  # 如果 not found
    print("没找到")  # 打印输出到屏幕

# Pythonic 写法：用 else
for n in nums:  # 遍历 nums，取值给 n
    if n == target:  # 如果 n == target
        print("找到")  # 打印输出到屏幕
        break  # 跳出循环
else:  # 否则
    print("没找到")  # 打印输出到屏幕
\`\`\`

下面的 demo 把上述知识点都演示一遍。`,
    code: `# ==========================================
# break / continue / else / pass 完整演示
# ==========================================

# 1. break 跳出整个循环
print("=== 1. break 跳出整个循环 ===")
for i in range(10):
    if i == 5:
        break              # 到 5 就停
    print(f"  i = {i}")
print("  循环结束")

# 2. continue 跳过本次
print()
print("=== 2. continue 跳过偶数 ===")
for i in range(10):
    if i % 2 == 0:
        continue           # 偶数跳过
    print(f"  奇数：{i}")

# 3. 嵌套循环 break 只跳出内层
print()
print("=== 3. 嵌套循环 break ===")
for i in range(3):
    for j in range(3):
        if j == 1:
            break          # 只跳出内层 j 循环
        print(f"    内层 i={i} j={j}")
    print(f"  外层 i={i} 继续执行")

# 4. 循环 else：正常结束才执行
print()
print("=== 4. for-else（正常结束）===")
for i in range(3):
    print(f"  i = {i}")
else:
    print("  循环自然结束，else 执行")

# 5. 循环 else：被 break 不执行
print()
print("=== 5. for-else（被 break 不执行）===")
for i in range(10):
    print(f"  i = {i}")
    if i == 2:
        print("  触发 break")
        break
else:
    print("  这行不会执行")

# 6. 搜索模式：找目标，没找到用 else
print()
print("=== 6. 搜索模式 ===")
target = 5
nums = [1, 2, 3, 4]
for n in nums:
    if n == target:
        print(f"  找到 {target}")
        break
else:
    print(f"  没找到 {target}")    # 触发，因为没 break

# 7. 找到了：break 触发，else 不执行
print()
print("=== 7. 搜索成功 ===")
target = 3
for n in nums:
    if n == target:
        print(f"  找到 {target}")
        break
else:
    print(f"  没找到 {target}")    # 不触发，因为 break 了

# 8. pass 占位
print()
print("=== 8. pass 占位 ===")
def not_implemented():
    pass                    # 占位，以后再实现

class Empty:
    pass                    # 空类

x = 10
if x > 0:
    pass                   # 暂时不处理，但不能空着
else:
    print("  负数")
print("  pass 啥都不做，程序继续")

# 9. 综合实战：找 20 以内的所有素数
print()
print("=== 9. 找 20 以内的素数 ===")
primes = []
for n in range(2, 20):
    for d in range(2, n):
        if n % d == 0:     # 能被整除
            break          # 不是素数
    else:
        # 内层没 break，说明 n 是素数
        primes.append(n)
print(f"  素数列表：{primes}")

# 10. 标志变量 vs else 对比
print()
print("=== 10. 标志变量 vs else ===")
# 老写法
target = 99
found = False
for n in [1, 2, 3]:
    if n == target:
        print(f"  老写法：找到 {n}")
        found = True
        break
if not found:
    print(f"  老写法：没找到 {target}")

# Pythonic 写法
for n in [1, 2, 3]:
    if n == target:
        print(f"  Pythonic：找到 {n}")
        break
else:
    print(f"  Pythonic：没找到 {target}")

# 11. continue 实战：过滤无效数据
print()
print("=== 11. continue 过滤数据 ===")
raw_data = [12, -5, 0, 23, -1, 45, 0, 67]
valid_sum = 0
valid_count = 0
for x in raw_data:
    if x <= 0:             # 跳过非正数
        continue
    valid_sum += x
    valid_count += 1
print(f"  原始数据：{raw_data}")
print(f"  有效个数：{valid_count}，总和：{valid_sum}")

# 12. while + break + else：猜数字
print()
print("=== 12. 猜数字游戏 ===")
target = 42
guesses = [10, 50, 30, 42]
idx = 0
while idx < len(guesses):
    guess = guesses[idx]
    idx += 1
    print(f"  猜 {guess}...", end=" ")
    if guess == target:
        print("中了！")
        break
    elif guess < target:
        print("太小")
    else:
        print("太大")
else:
    print("  次数用完，没猜中")

# 13. 用 break 跳出多层循环
print()
print("=== 13. 跳出多层循环 ===")
# 找二维列表中第一个负数
matrix = [[1, 2, 3], [4, -5, 6], [7, 8, 9]]
found_pos = None
for i, row in enumerate(matrix):
    for j, val in enumerate(row):
        if val < 0:
            found_pos = (i, j)
            break            # 跳出内层
    if found_pos:            # 用标志判断跳出外层
        break
print(f"  第一个负数位置：{found_pos}，值：{matrix[found_pos[0]][found_pos[1]]}")

print()
print("break / continue / else / pass 演示完成")`
  },
  {
    id: "py8-match",
    group: "流程控制",
    icon: "🎯",
    title: "match-case 模式匹配(Python 3.10+)",
    content: `## match-case 是什么

\`match-case\` 是 Python 3.10 引入的**模式匹配**语句，类似其他语言的 \`switch\`，但更强大——能解构数据。

### 基本语法

\`\`\`python
match 值:  # 执行操作
    case 模式1:  # 执行操作
        ...  # 执行操作
    case 模式2:  # 执行操作
        ...  # 执行操作
    case _:  # 执行操作
        ...            # 默认分支，类似 default
\`\`\`

### case 字面量匹配

\`\`\`python
status = 404  # 定义数值 status
match status:  # 执行操作
    case 200:  # 执行操作
        print("OK")  # 打印输出到屏幕
    case 404:  # 执行操作
        print("Not Found")  # 打印输出到屏幕
    case 500:  # 执行操作
        print("Server Error")  # 打印输出到屏幕
    case _:  # 执行操作
        print("Unknown")  # 打印输出到屏幕
\`\`\`

### case _ 通配符

\`_\` 是**通配符**，匹配任何值，类似 \`default\`。通常放在最后兜底。

\`\`\`python
match color:  # 执行操作
    case "red":  # 执行操作
        ...  # 执行操作
    case "blue":  # 执行操作
        ...  # 执行操作
    case _:  # 执行操作
        print("其他颜色")  # 打印输出到屏幕
\`\`\`

### 或模式 |

\`\`\`python
match response_code:  # 执行操作
    case 200 | 201:  # 执行操作
        print("成功")  # 打印输出到屏幕
    case 400 | 404:  # 执行操作
        print("客户端错误")  # 打印输出到屏幕
    case 500 | 502 | 503:  # 执行操作
        print("服务端错误")  # 打印输出到屏幕
\`\`\`

### 解构匹配：序列

\`\`\`python
point = (3, 4)  # 定义元组 point
match point:  # 执行操作
    case (0, 0):  # 调用 case()
        print("原点")  # 打印输出到屏幕
    case (0, y):           # 绑定 y
        print(f"y 轴上，y={y}")  # 打印输出到屏幕
    case (x, 0):  # 调用 case()
        print(f"x 轴上，x={x}")  # 打印输出到屏幕
    case (x, y):  # 调用 case()
        print(f"普通点 ({x}, {y})")  # 打印输出到屏幕
\`\`\`

### 解构匹配：列表

\`\`\`python
match command:  # 执行操作
    case [action]:                  # 单元素
        print(f"单命令：{action}")  # 打印输出到屏幕
    case [action, target]:          # 两元素
        print(f"{action} {target}")  # 打印输出到屏幕
    case [action, *rest]:           # *rest 收集剩余
        print(f"{action}，其余 {rest}")  # 打印输出到屏幕
    case []:  # 执行操作
        print("空列表")  # 打印输出到屏幕
\`\`\`

### 解构匹配：字典

\`\`\`python
user = {"name": "小明", "age": 18}  # 定义字典 user
match user:  # 执行操作
    case {"name": name, "age": age}:  # 执行操作
        print(f"{name}，{age} 岁")  # 打印输出到屏幕
    case {"name": name}:  # 执行操作
        print(f"只有名字：{name}")  # 打印输出到屏幕
\`\`\`

### 解构匹配：类

\`\`\`python
class Point:  # 定义类 Point
    def __init__(self, x, y):  # 定义函数 __init__，参数：self, x, y
        self.x = x  # 执行操作
        self.y = y  # 执行操作

p = Point(3, 4)  # 赋值变量 p
match p:  # 执行操作
    case Point(x=0, y=0):  # 执行操作
        print("原点")  # 打印输出到屏幕
    case Point(x=x, y=y):  # 执行操作
        print(f"({x}, {y})")  # 打印输出到屏幕
\`\`\`

### as 绑定

\`\`\`python
match cmd:  # 执行操作
    case [action] as full:  # 执行操作
        print(f"完整命令 {full}，动作 {action}")  # 打印输出到屏幕
\`\`\`

### if guard 守卫

\`case\` 后可加 \`if\` 条件做额外过滤：

\`\`\`python
match point:  # 执行操作
    case (x, y) if x == y:  # 调用 case()
        print("在对角线上")  # 打印输出到屏幕
    case (x, y):  # 调用 case()
        print(f"普通点 ({x}, {y})")  # 打印输出到屏幕
\`\`\`

### match vs if-elif 对比

| 对比 | if-elif | match-case |
|------|---------|------------|
| 比较 | 等值/范围 | 等值 + 解构 |
| 解构 | 不支持 | 支持 |
| 可读性 | 简单条件好 | 复杂数据好 |
| 版本 | 任意 | 3.10+ |
| 通配 | \`else\` | \`case _\` |

### 何时用 match

- 多个等值分支（状态码、命令）
- 解构元组/列表/字典/类
- 替代复杂的 if-elif 链

> ⚠️ match-case 需要 Python 3.10+。下面的 demo 会先检查版本，低版本自动回退到 if-elif。

下面的 demo 把上述用法都演示一遍。`,
    code: `# ==========================================
# match-case 模式匹配完整演示（Python 3.10+）
# ==========================================
import sys

# 检查 Python 版本
print("=== 检查版本 ===")
print(f"  Python 版本：{sys.version_info.major}.{sys.version_info.minor}")
if sys.version_info >= (3, 10):
    print("  ✅ 支持 match-case")
else:
    print("  ⚠️ 不支持 match-case，下面用 if-elif 演示效果")
print()

# 用 exec 运行 match 代码，避免低版本直接语法错误
match_code_basic = '''
print("=== 1. 基础字面量匹配 ===")
status = 404
match status:
    case 200:
        print(f"  {status} -> OK")
    case 404:
        print(f"  {status} -> Not Found")
    case 500:
        print(f"  {status} -> Server Error")
    case _:
        print(f"  {status} -> Unknown")
'''

match_code_or = '''
print()
print("=== 2. 或模式 | ===")
code = 201
match code:
    case 200 | 201:
        print(f"  {code} -> 成功")
    case 400 | 404:
        print(f"  {code} -> 客户端错误")
    case 500 | 502 | 503:
        print(f"  {code} -> 服务端错误")
    case _:
        print(f"  {code} -> 未知")
'''

match_code_seq = '''
print()
print("=== 3. 序列解构匹配 ===")
points = [(0, 0), (0, 5), (3, 0), (3, 4)]
for p in points:
    match p:
        case (0, 0):
            print(f"  {p} -> 原点")
        case (0, y):
            print(f"  {p} -> y 轴上，y={y}")
        case (x, 0):
            print(f"  {p} -> x 轴上，x={x}")
        case (x, y):
            print(f"  {p} -> 普通点 ({x}, {y})")
'''

match_code_list = '''
print()
print("=== 4. 列表解构匹配 ===")
commands = [
    ["quit"],
    ["run", "script.py"],
    ["copy", "a.txt", "b.txt", "c.txt"],
    [],
]
for cmd in commands:
    match cmd:
        case [action]:
            print(f"  {cmd} -> 单命令 {action}")
        case [action, target]:
            print(f"  {cmd} -> {action} {target}")
        case [action, *rest]:
            print(f"  {cmd} -> {action}，其余 {rest}")
        case []:
            print(f"  {cmd} -> 空列表")
'''

match_code_dict = '''
print()
print("=== 5. 字典解构匹配 ===")
users = [
    {"name": "小明", "age": 18, "city": "北京"},
    {"name": "小红", "age": 20},
    {"city": "上海"},
]
for user in users:
    match user:
        case {"name": name, "age": age, "city": city}:
            print(f"  {user} -> {name}，{age} 岁，{city}")
        case {"name": name, "age": age}:
            print(f"  {user} -> {name}，{age} 岁（无城市）")
        case {"city": city}:
            print(f"  {user} -> 仅城市 {city}")
'''

match_code_guard = '''
print()
print("=== 6. if guard 守卫 ===")
points = [(3, 3), (3, 4), (5, 5), (0, 0)]
for p in points:
    match p:
        case (0, 0):
            print(f"  {p} -> 原点")
        case (x, y) if x == y:
            print(f"  {p} -> 在对角线上")
        case (x, y):
            print(f"  {p} -> 普通点 ({x}, {y})")
'''

match_code_as = '''
print()
print("=== 7. as 绑定 ===")
cmd = ["run", "script.py"]
match cmd:
    case [action, target] as full:
        print(f"  完整命令 {full}，动作 {action}，目标 {target}")
'''

match_code_class = '''
print()
print("=== 8. 类解构匹配 ===")
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

points = [Point(0, 0), Point(3, 4), Point(0, 5)]
for p in points:
    match p:
        case Point(x=0, y=0):
            print(f"  ({p.x}, {p.y}) -> 原点")
        case Point(x=x, y=y) if x == 0:
            print(f"  ({p.x}, {p.y}) -> 在 y 轴上")
        case Point(x=x, y=y):
            print(f"  ({p.x}, {p.y}) -> 普通点 ({x}, {y})")
'''

# 把所有 match 代码拼起来一起执行
all_match_code = "\\n".join([
    match_code_basic,
    match_code_or,
    match_code_seq,
    match_code_list,
    match_code_dict,
    match_code_guard,
    match_code_as,
    match_code_class,
])

if sys.version_info >= (3, 10):
    # 直接执行 match 代码
    exec(all_match_code)
else:
    # 低版本用 if-elif 等价演示
    print("=== 1. 基础匹配（用 if-elif 等价演示）===")
    status = 404
    if status == 200:
        print(f"  {status} -> OK")
    elif status == 404:
        print(f"  {status} -> Not Found")
    elif status == 500:
        print(f"  {status} -> Server Error")
    else:
        print(f"  {status} -> Unknown")

    print()
    print("=== 2. 或模式（用 if-elif 等价演示）===")
    code = 201
    if code in (200, 201):
        print(f"  {code} -> 成功")
    elif code in (400, 404):
        print(f"  {code} -> 客户端错误")
    elif code in (500, 502, 503):
        print(f"  {code} -> 服务端错误")

    print()
    print("=== 3. 序列解构（用 if-elif 等价演示）===")
    points = [(0, 0), (0, 5), (3, 0), (3, 4)]
    for p in points:
        x, y = p
        if x == 0 and y == 0:
            print(f"  {p} -> 原点")
        elif x == 0:
            print(f"  {p} -> y 轴上，y={y}")
        elif y == 0:
            print(f"  {p} -> x 轴上，x={x}")
        else:
            print(f"  {p} -> 普通点 ({x}, {y})")

    print()
    print("=== 4. 列表解构（手动判断长度等价演示）===")
    commands = [
        ["quit"],
        ["run", "script.py"],
        ["copy", "a.txt", "b.txt", "c.txt"],
        [],
    ]
    for cmd in commands:
        if len(cmd) == 1:
            print(f"  {cmd} -> 单命令 {cmd[0]}")
        elif len(cmd) == 2:
            print(f"  {cmd} -> {cmd[0]} {cmd[1]}")
        elif len(cmd) > 2:
            print(f"  {cmd} -> {cmd[0]}，其余 {cmd[1:]}")
        else:
            print(f"  {cmd} -> 空列表")

# 综合实战
print()
print("=== 9. 综合实战：命令解析器 ===")
def parse_command(cmd_list):
    """模拟命令解析"""
    if sys.version_info >= (3, 10):
        # 用 match-case
        code = '''
match cmd:
    case ["quit"]:
        return "退出程序"
    case ["help"]:
        return "显示帮助"
    case ["echo", *words]:
        return " ".join(words)
    case ["cp", src, dst]:
        return f"复制 {src} -> {dst}"
    case _:
        return "未知命令"
'''
        # 由于 exec 作用域问题，这里用等价逻辑
        cmd = cmd_list
        if cmd == ["quit"]:
            return "退出程序"
        elif cmd == ["help"]:
            return "显示帮助"
        elif len(cmd) >= 2 and cmd[0] == "echo":
            return " ".join(cmd[1:])
        elif len(cmd) == 3 and cmd[0] == "cp":
            return f"复制 {cmd[1]} -> {cmd[2]}"
        else:
            return "未知命令"
    else:
        # 用 if-elif 等价
        if cmd_list == ["quit"]:
            return "退出程序"
        elif cmd_list == ["help"]:
            return "显示帮助"
        elif len(cmd_list) >= 2 and cmd_list[0] == "echo":
            return " ".join(cmd_list[1:])
        elif len(cmd_list) == 3 and cmd_list[0] == "cp":
            return f"复制 {cmd_list[1]} -> {cmd_list[2]}"
        else:
            return "未知命令"

cmds = [["quit"], ["help"], ["echo", "hello", "world"], ["cp", "a.txt", "b.txt"], ["unknown"]]
for c in cmds:
    print(f"  {c} -> {parse_command(c)}")

print()
print("match-case 演示完成")`
  },
  {
    id: "py8-comprehension",
    group: "流程控制",
    icon: "✨",
    title: "推导式：列表/字典/集合/生成器",
    content: `## 推导式是什么

**推导式**（comprehension）是 Python 用一行代码创建序列的简洁语法，是 Pythonic 编程的标志。

### 列表推导式

\`\`\`python
[表达式 for 变量 in 可迭代对象 if 条件]  # 列表推导式
\`\`\`

等价于：

\`\`\`python
result = []  # 定义列表 result
for 变量 in 可迭代对象:  # 遍历 可迭代对象，取值给 变量
    if 条件:  # 如果 条件
        result.append(表达式)  # 调用 result.append()：向列表末尾添加元素
\`\`\`

### 基础示例

\`\`\`python
# 1. 生成 0~9 的平方
squares = [x * x for x in range(10)]  # 定义列表 squares
# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# 2. 带条件过滤：偶数的平方
even_squares = [x * x for x in range(10) if x % 2 == 0]  # 定义列表 even_squares
# [0, 4, 16, 36, 64]

# 3. 转换：字符串转大写
names = ["alice", "bob", "charlie"]  # 定义列表 names
upper = [name.upper() for name in names]  # 定义列表 upper
# ["ALICE", "BOB", "CHARLIE"]
\`\`\`

### 推导式各部分

\`\`\`python
[x * x   for x in range(10)   if x % 2 == 0]  # 列表推导式
#  ↑表达式  ↑循环             ↑条件（可选）
\`\`\`

### 嵌套推导式

\`\`\`python
# 1. 双重循环：笛卡尔积
pairs = [(x, y) for x in [1, 2] for y in ['a', 'b']]  # 定义列表 pairs
# [(1, 'a'), (1, 'b'), (2, 'a'), (2, 'b')]

# 2. 嵌套列表：展平
matrix = [[1, 2, 3], [4, 5, 6]]  # 定义列表 matrix
flat = [x for row in matrix for x in row]  # 定义列表 flat
# [1, 2, 3, 4, 5, 6]

# 3. 矩阵生成
matrix = [[0 for _ in range(3)] for _ in range(3)]  # 定义列表 matrix
# [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
\`\`\`

### 嵌套推导式的阅读顺序

\`\`\`python
[expr for x in seq1 for y in seq2]  # 列表推导式
# 等价于
result = []  # 定义列表 result
for x in seq1:  # 遍历 seq1，取值给 x
    for y in seq2:  # 遍历 seq2，取值给 y
        result.append(expr)  # 调用 result.append()：向列表末尾添加元素
\`\`\`

**从左到右**就是嵌套顺序。

### 字典推导式

\`\`\`python
{键表达式: 值表达式 for 变量 in 可迭代对象 if 条件}  # 字典推导式
\`\`\`

\`\`\`python
# 1. 列表转字典：索引映射
fruits = ["苹果", "香蕉", "橙子"]  # 定义列表 fruits
fruit_dict = {i: fruit for i, fruit in enumerate(fruits)}  # 定义字典 fruit_dict
# {0: '苹果', 1: '香蕉', 2: '橙子'}

# 2. 反转字典
original = {"a": 1, "b": 2, "c": 3}  # 定义字典 original
reversed_dict = {v: k for k, v in original.items()}  # 定义字典 reversed_dict
# {1: 'a', 2: 'b', 3: 'c'}

# 3. 字符频率统计
text = "hello"  # 定义字符串 text
freq = {ch: text.count(ch) for ch in set(text)}  # 定义字典 freq
# {'h': 1, 'e': 1, 'l': 2, 'o': 1}
\`\`\`

### 集合推导式

\`\`\`python
{表达式 for 变量 in 可迭代对象 if 条件}  # 集合推导式
\`\`\`

\`\`\`python
# 1. 去重的平方
nums = [1, -1, 2, -2, 3]  # 定义列表 nums
squares = {x * x for x in nums}  # 定义字典 squares
# {1, 4, 9}，自动去重

# 2. 取首字母集合
words = ["apple", "ant", "banana", "cat"]  # 定义列表 words
first_letters = {w[0] for w in words}  # 定义字典 first_letters
# {'a', 'b', 'c'}
\`\`\`

### 生成器表达式

把 \`[]\` 换成 \`()\` 就是生成器表达式——**惰性求值，不立即生成所有元素**。

\`\`\`python
# 列表推导式：立即生成所有元素，占内存
squares_list = [x * x for x in range(1000000)]  # 定义列表 squares_list

# 生成器表达式：按需生成，几乎不占内存
squares_gen = (x * x for x in range(1000000))  # 定义元组 squares_gen
\`\`\`

### 生成器表达式用法

\`\`\`python
# 1. 直接传给 sum/max/min
total = sum(x * x for x in range(100))   # 不用加 []

# 2. 转 list
nums = list(x * 2 for x in range(5))  # 赋值变量 nums

# 3. 迭代
for sq in (x * x for x in range(5)):  # 遍历 (x * x for x in range(5))，取值给 sq
    print(sq)  # 打印输出到屏幕
\`\`\`

### 四种推导式对比

| 类型 | 语法 | 返回 | 特点 |
|------|------|------|------|
| 列表 | \`[expr for x in xs]\` | list | 立即生成 |
| 字典 | \`{k:v for x in xs}\` | dict | 键唯一 |
| 集合 | \`{expr for x in xs}\` | set | 自动去重 |
| 生成器 | \`(expr for x in xs)\` | generator | 惰性求值 |

### 推导式 vs map/filter

\`\`\`python
# 推导式（推荐，可读性好）
[x * x for x in range(10) if x % 2 == 0]  # 列表推导式

# map/filter 等价写法
list(map(lambda x: x * x, filter(lambda x: x % 2 == 0, range(10))))  # 转为列表
\`\`\`

推导式**通常更清晰**，map/filter 适合简单转换场景。

### 可读性建议

| 情况 | 推荐 |
|------|------|
| 简单一行能看清 | ✅ 推导式 |
| 复杂嵌套/多条件 | ❌ 改用 for 循环 |
| 副作用（print/修改外部） | ❌ 别用推导式 |
| 大数据 | ✅ 生成器表达式 |

### 经典陷阱

\`\`\`python
# 陷阱1：列表推导式里的变量是局部作用域
[x for x in range(3)]  # 列表推导式
print(x)   # NameError（推导式里的 x 不外泄，3.x 改了）

# 陷阱2：嵌套过深难读
[[[z for z in range(3)] for y in range(3)] for x in range(3)]  # 列表推导式
# 别这么写，拆开
\`\`\`

下面的 demo 把上述用法都演示一遍。`,
    code: `# ==========================================
# 推导式完整演示：列表/字典/集合/生成器
# ==========================================

# 1. 列表推导式基础
print("=== 1. 列表推导式基础 ===")
squares = [x * x for x in range(10)]           # 表达式 + 循环
print(f"  0~9 的平方：{squares}")

even_squares = [x * x for x in range(10) if x % 2 == 0]   # 加条件
print(f"  偶数的平方：{even_squares}")

names = ["alice", "bob", "charlie"]
upper = [name.upper() for name in names]       # 转换
print(f"  转大写：{upper}")

# 2. 推导式等价的 for 循环（对比）
print()
print("=== 2. 推导式 vs for 循环 ===")
# 推导式
result1 = [x * 2 for x in range(5)]
# 等价 for
result2 = []
for x in range(5):
    result2.append(x * 2)
print(f"  推导式：{result1}")
print(f"  for 循环：{result2}")
print(f"  两者相等：{result1 == result2}")

# 3. 嵌套推导式：笛卡尔积
print()
print("=== 3. 笛卡尔积 ===")
pairs = [(x, y) for x in [1, 2] for y in ['a', 'b']]
print(f"  [(x,y) for x in [1,2] for y in ['a','b']] = {pairs}")

# 4. 嵌套推导式：展平矩阵
print()
print("=== 4. 展平矩阵 ===")
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [x for row in matrix for x in row]
print(f"  原矩阵：{matrix}")
print(f"  展平后：{flat}")

# 5. 生成矩阵
print()
print("=== 5. 生成矩阵 ===")
zeros = [[0 for _ in range(3)] for _ in range(3)]   # 3x3 零矩阵
print(f"  3x3 零矩阵：{zeros}")

identity = [[1 if i == j else 0 for j in range(3)] for i in range(3)]  # 单位矩阵
print(f"  3x3 单位矩阵：{identity}")

# 6. 字典推导式
print()
print("=== 6. 字典推导式 ===")
fruits = ["苹果", "香蕉", "橙子"]
fruit_dict = {i: fruit for i, fruit in enumerate(fruits)}
print(f"  索引映射：{fruit_dict}")

# 反转字典
original = {"a": 1, "b": 2, "c": 3}
reversed_dict = {v: k for k, v in original.items()}
print(f"  原 {original} -> 反转 {reversed_dict}")

# 字符频率
text = "hello"
freq = {ch: text.count(ch) for ch in set(text)}
print(f"  '{text}' 字符频率：{freq}")

# 7. 集合推导式
print()
print("=== 7. 集合推导式 ===")
nums = [1, -1, 2, -2, 3]
squares_set = {x * x for x in nums}            # 自动去重
print(f"  [1,-1,2,-2,3] 平方集合：{squares_set}")

words = ["apple", "ant", "banana", "cat", "avocado"]
first_letters = {w[0] for w in words}
print(f"  首字母集合：{first_letters}")

# 8. 生成器表达式
print()
print("=== 8. 生成器表达式 ===")
squares_gen = (x * x for x in range(5))         # 圆括号
print(f"  生成器对象：{squares_gen}")
print(f"  类型：{type(squares_gen).__name__}")
print(f"  转 list：{list(squares_gen)}")

# 9. 生成器表达式直接传给 sum
print()
print("=== 9. 生成器表达式省内存 ===")
# 大数据求和，生成器几乎不占内存
total = sum(x * x for x in range(100))          # 不用加 []
print(f"  sum(x*x for x in range(100)) = {total}")

# 对比：列表推导式会先创建完整列表
total_list = sum([x * x for x in range(100)])
print(f"  sum([x*x for x in range(100)]) = {total_list}")

# 10. 推导式 vs map/filter
print()
print("=== 10. 推导式 vs map/filter ===")
# 推导式
r1 = [x * x for x in range(10) if x % 2 == 0]
# map/filter 等价
r2 = list(map(lambda x: x * x, filter(lambda x: x % 2 == 0, range(10))))
print(f"  推导式：{r1}")
print(f"  map/filter：{r2}")
print(f"  两者相等：{r1 == r2}")
print("  💡 推导式可读性更好，推荐用")

# 11. 实战：从字典列表筛选
print()
print("=== 11. 实战：筛选学生 ===")
students = [
    {"name": "小明", "score": 85},
    {"name": "小红", "score": 92},
    {"name": "小刚", "score": 78},
    {"name": "小丽", "score": 95},
]
# 筛选 80 分以上
passed = [s["name"] for s in students if s["score"] >= 80]
print(f"  80 分以上：{passed}")

# 名字和分数组成的字典
score_dict = {s["name"]: s["score"] for s in students}
print(f"  名字-分数字典：{score_dict}")

# 最高分学生
top = max(students, key=lambda s: s["score"])
print(f"  最高分：{top['name']} {top['score']} 分")

# 12. 嵌套推导式可读性建议
print()
print("=== 12. 可读性对比 ===")
# 复杂嵌套：难读
result_hard = [x * y for x in range(3) for y in range(3) if x != y]
print(f"  复杂推导式：{result_hard}")

# 等价 for 循环：清晰
result_easy = []
for x in range(3):
    for y in range(3):
        if x != y:
            result_easy.append(x * y)
print(f"  等价 for：{result_easy}")
print("  💡 嵌套超过 2 层就用 for 循环更清晰")

# 13. 副作用陷阱：别在推导式里做副作用
print()
print("=== 13. 副作用陷阱 ===")
print("  ❌ 错误用法（推导式里 print）：")
print("     [print(x) for x in range(3)]   # 生成 [None, None, None] 列表")
print("  ✅ 正确用法（用 for）：")
print("     for x in range(3):")
print("         print(x)")

print()
print("推导式演示完成")`
  },
  {
    id: "py8-iterator",
    group: "流程控制",
    icon: "🔌",
    title: "迭代器协议",
    content: `## 可迭代对象 Iterable

能被 \`for\` 循环遍历的对象叫**可迭代对象**。常见的有：

- 列表、元组、集合、字典
- 字符串
- 文件对象
- \`range\`、\`enumerate\`、\`zip\` 的返回值
- 生成器

判断方法：

\`\`\`python
from collections.abc import Iterable  # 从 collections.abc 导入 Iterable
print(isinstance([1, 2], Iterable))   # True
print(isinstance(123, Iterable))      # False
\`\`\`

## 迭代器 Iterator

**迭代器**是实现了 \`__next__()\` 方法的对象，能不断产出下一个值，直到抛出 \`StopIteration\` 表示结束。

### Iterable vs Iterator

| 概念 | 实现 | 作用 |
|------|------|------|
| Iterable | \`__iter__()\` | 能被 for 遍历 |
| Iterator | \`__iter__()\` + \`__next__()\` | 能用 next() 取值 |

迭代器**一定是可迭代对象**，但可迭代对象不一定是迭代器。

### iter() 与 next()

\`\`\`python
nums = [1, 2, 3]  # 定义列表 nums
it = iter(nums)          # 从可迭代对象创建迭代器
print(next(it))          # 1
print(next(it))          # 2
print(next(it))          # 3
print(next(it))          # 抛 StopIteration
\`\`\`

### for 循环的本质

\`\`\`python
for x in [1, 2, 3]:  # 遍历 [1, 2, 3]，取值给 x
    print(x)  # 打印输出到屏幕
\`\`\`

等价于：

\`\`\`python
it = iter([1, 2, 3])     # 1. 调用 iter() 拿迭代器
while True:  # 当 True 时循环
    try:  # 尝试执行可能出错的代码
        x = next(it)     # 2. 不断调 next()
    except StopIteration: # 3. 捕获异常结束
        break  # 跳出循环
    print(x)  # 打印输出到屏幕
\`\`\`

**所以 \`for\` 就是 \`iter()\` + \`next()\` + \`StopIteration\` 的语法糖。**

### StopIteration 异常

迭代器耗尽后调 \`next()\` 会抛 \`StopIteration\`：

\`\`\`python
it = iter([1])  # 赋值变量 it
print(next(it))   # 1
print(next(it))    # StopIteration!
\`\`\`

\`for\` 循环自动捕获这个异常，所以你看不到它。

### 迭代器是一次性的

\`\`\`python
it = iter([1, 2, 3])  # 赋值变量 it
print(list(it))    # [1, 2, 3]
print(list(it))    # [] 已经耗尽！
\`\`\`

迭代器用完就空了，要用新数据需重新创建。

### 迭代器没有 len()

\`\`\`python
it = iter([1, 2, 3])  # 赋值变量 it
print(len(it))   # TypeError
# 迭代器不知道自己有多少元素，只能边取边数
\`\`\`

## 自定义迭代器类

实现 \`__iter__()\` 和 \`__next__()\`：

\`\`\`python
class Counter:  # 定义类 Counter
    def __init__(self, start, end):  # 定义函数 __init__，参数：self, start, end
        self.current = start  # 执行操作
        self.end = end  # 执行操作

    def __iter__(self):  # 定义函数 __iter__，参数：self
        # 返回自己（自己就是迭代器）
        return self  # 返回 self

    def __next__(self):  # 定义函数 __next__，参数：self
        if self.current >= self.end:  # 如果 self.current >= self.end
            raise StopIteration  # 抛出异常：StopIteration
        value = self.current  # 赋值变量 value
        self.current += 1  # 执行操作
        return value  # 返回 value

for n in Counter(1, 5):  # 遍历 Counter(1, 5)，取值给 n
    print(n)   # 1 2 3 4
\`\`\`

### 关键点

- \`__iter__\` 返回迭代器对象（通常返回 self）
- \`__next__\` 返回下一个值，没有就抛 \`StopIteration\`
- 抛出 \`StopIteration\` 后再调 \`next\` 也会继续抛

## 可迭代对象 vs 迭代器（再次对比）

\`\`\`python
# 可迭代对象：每次 iter() 都创建新迭代器
nums = [1, 2, 3]  # 定义列表 nums
it1 = iter(nums)  # 赋值变量 it1
it2 = iter(nums)  # 赋值变量 it2
print(it1 is it2)   # False，两个不同的迭代器

# 迭代器：iter() 返回自己
class Counter: ...  # 定义类 Counter
c = Counter(1, 5)  # 赋值变量 c
print(iter(c) is c)  # True，迭代器的 iter() 返回自己
\`\`\`

## itertools 模块简介

\`itertools\` 是 Python 标准库的迭代器工具集：

\`\`\`python
from itertools import count, cycle, repeat, chain, islice  # 从 itertools 导入 count, cycle, repeat, chain, islice

# count(start, step)：无限计数
for i in count(10):  # 遍历 count(10)，取值给 i
    if i > 15: break  # 如果 i > 15

# cycle(seq)：无限循环
for ch in cycle("AB"):  # 遍历 cycle("AB")，取值给 ch
    ...  # 执行操作

# repeat(obj, n)：重复 n 次
list(repeat("x", 3))   # ['x', 'x', 'x']

# chain(*iters)：串联多个迭代器
list(chain([1, 2], [3, 4]))   # [1, 2, 3, 4]

# islice(iter, start, stop)：切片
list(islice(count(), 5, 10))   # [5, 6, 7, 8, 9]
\`\`\`

### 常用 itertools 函数

| 函数 | 作用 |
|------|------|
| \`count()\` | 无限计数 |
| \`cycle()\` | 无限循环 |
| \`repeat()\` | 重复 |
| \`chain()\` | 串联 |
| \`islice()\` | 切片 |
| \` takewhile()\` | 取到条件为假 |
| \`dropwhile()\` | 丢弃到条件为假 |
| \`groupby()\` | 分组 |

下面的 demo 把迭代器协议、自定义迭代器、itertools 都演示一遍。`,
    code: `# ==========================================
# 迭代器协议完整演示
# ==========================================
from collections.abc import Iterable, Iterator

# 1. 可迭代对象 Iterable
print("=== 1. 可迭代对象 Iterable ===")
things = [[1, 2], "hello", (1, 2), {1, 2}, {"a": 1}, range(3), 123]
for obj in things:
    is_iter = isinstance(obj, Iterable)
    print(f"  {repr(obj):20} Iterable? {is_iter}")

# 2. 创建迭代器 iter()
print()
print("=== 2. iter() 创建迭代器 ===")
nums = [1, 2, 3]
it = iter(nums)             # 从列表创建迭代器
print(f"  原列表：{nums}")
print(f"  迭代器：{it}")
print(f"  类型：{type(it).__name__}")
print(f"  是 Iterator？{isinstance(it, Iterator)}")

# 3. next() 逐个取值
print()
print("=== 3. next() 取值 ===")
it = iter([10, 20, 30])
print(f"  next 1: {next(it)}")
print(f"  next 2: {next(it)}")
print(f"  next 3: {next(it)}")

# 取完会抛 StopIteration
try:
    next(it)
except StopIteration:
    print("  next 4: 抛出 StopIteration！")

# next 带默认值
print(f"  next(it, '没了')：{next(it, '没了')}")   # 不抛异常，返回默认值

# 4. for 循环的本质
print()
print("=== 4. for 循环的本质 ===")
print("  for x in [1,2,3] 等价于：")
# 用 iter + next + StopIteration 模拟 for
nums = [1, 2, 3]
it = iter(nums)
while True:
    try:
        x = next(it)
        print(f"    取到 {x}")
    except StopIteration:
        print("    StopIteration，循环结束")
        break

# 5. 迭代器是一次性的
print()
print("=== 5. 迭代器一次性 ===")
it = iter([1, 2, 3])
print(f"  第一次 list(it)：{list(it)}")
print(f"  第二次 list(it)：{list(it)}")    # 空了！
print("  💡 迭代器用完即空，需要重新创建")

# 6. 可迭代对象 vs 迭代器
print()
print("=== 6. 可迭代对象 vs 迭代器 ===")
nums = [1, 2, 3]
it1 = iter(nums)
it2 = iter(nums)
print(f"  iter(nums) is iter(nums)？{it1 is it2}")    # False，每次新迭代器
print(f"  所以列表可重复遍历")

class MyIter:
    def __init__(self):
        self.n = 0
    def __iter__(self):
        return self
    def __next__(self):
        if self.n >= 3:
            raise StopIteration
        self.n += 1
        return self.n

mi = MyIter()
print(f"  迭代器 iter(self) is self？{iter(mi) is mi}")  # True

# 7. 自定义迭代器：计数器
print()
print("=== 7. 自定义迭代器 Counter ===")
class Counter:
    """从 start 数到 end（不含 end）"""
    def __init__(self, start, end):
        self.current = start
        self.end = end

    def __iter__(self):
        return self                # 返回自己

    def __next__(self):
        if self.current >= self.end:    # 超出范围
            raise StopIteration         # 抛异常结束
        value = self.current
        self.current += 1
        return value

for n in Counter(1, 6):
    print(f"  Counter: {n}")

# 8. 自定义可迭代对象（每次 iter 返回新迭代器）
print()
print("=== 8. 可重复遍历的可迭代对象 ===")
class Range2:
    """类似 range，可重复遍历"""
    def __init__(self, start, end):
        self.start = start
        self.end = end

    def __iter__(self):
        # 每次返回新的迭代器对象
        return Range2Iterator(self.start, self.end)

class Range2Iterator:
    def __init__(self, start, end):
        self.current = start
        self.end = end
    def __iter__(self):
        return self
    def __next__(self):
        if self.current >= self.end:
            raise StopIteration
        v = self.current
        self.current += 1
        return v

r = Range2(1, 4)
print(f"  第一次遍历：{list(r)}")
print(f"  第二次遍历：{list(r)}")    # 还能用！因为返回新迭代器

# 9. itertools 无限迭代器
print()
print("=== 9. itertools 无限迭代器 ===")
from itertools import count, cycle, repeat, chain, islice, takewhile

# count(10)：从 10 开始无限计数
print("  count(10) 前 5 个：", list(islice(count(10), 5)))

# cycle('AB')：无限循环 AB
print("  cycle('AB') 前 6 个：", list(islice(cycle('AB'), 6)))

# repeat('x', 3)：重复 3 次
print("  repeat('x', 3)：", list(repeat('x', 3)))

# chain 串联
print("  chain([1,2], [3,4])：", list(chain([1, 2], [3, 4])))

# 10. takewhile 取到条件为假
print()
print("=== 10. takewhile / dropwhile ===")
from itertools import dropwhile
nums = [1, 2, 3, 4, 1, 2]
# 取到 < 3 为假就停
take = list(takewhile(lambda x: x < 3, nums))
print(f"  takewhile(x<3, {nums}) = {take}")
# 丢弃到 < 3 为假，剩下全要
drop = list(dropwhile(lambda x: x < 3, nums))
print(f"  dropwhile(x<3, {nums}) = {drop}")

# 11. groupby 分组
print()
print("=== 11. groupby 分组 ===")
from itertools import groupby
# 按奇偶分组（必须先排序）
data = sorted([1, 2, 3, 4, 5, 6], key=lambda x: x % 2)
for key, group in groupby(data, key=lambda x: x % 2):
    print(f"  key={key}: {list(group)}")

# 12. 实战：读取大文件行数（模拟）
print()
print("=== 12. 实战：惰性求值省内存 ===")
# 模拟一个大数据源
def fake_big_data(n):
    """模拟产生 n 个数据（用迭代器，不占内存）"""
    for i in range(n):
        yield i * 2

# 求和：用迭代器，内存几乎不变
total = sum(fake_big_data(100000))
print(f"  10 万个数据的和：{total}")
print("  💡 用迭代器/生成器处理大数据，不会一次性占用全部内存")

# 13. 自定义迭代器实现斐波那契
print()
print("=== 13. 斐波那契迭代器 ===")
class Fib:
    """斐波那契数列迭代器，最多生成 n 项"""
    def __init__(self, n):
        self.n = n
        self.count = 0
        self.a, self.b = 0, 1
    def __iter__(self):
        return self
    def __next__(self):
        if self.count >= self.n:
            raise StopIteration
        value = self.a
        self.a, self.b = self.b, self.a + self.b   # 经典递推
        self.count += 1
        return value

print(f"  斐波那契前 10 项：{list(Fib(10))}")

print()
print("迭代器协议演示完成")`
  },
  {
    id: "py8-generator",
    group: "流程控制",
    icon: "⚡",
    title: "生成器与 yield",
    content: `## 生成器是什么

**生成器**（generator）是一种特殊的迭代器，用 \`yield\` 关键字**按需产生值**，而不是一次性生成所有值。

### 生成器函数 vs 普通函数

\`\`\`python
# 普通函数：一次性返回所有结果
def get_squares_list(n):  # 定义函数 get_squares_list，参数：n
    result = []  # 定义列表 result
    for i in range(n):  # 遍历 range(n)，取值给 i
        result.append(i * i)  # 调用 result.append()：向列表末尾添加元素
    return result  # 返回 result

# 生成器函数：用 yield 逐个产生
def get_squares_gen(n):  # 定义函数 get_squares_gen，参数：n
    for i in range(n):  # 遍历 range(n)，取值给 i
        yield i * i  # 生成值：i * i
\`\`\`

| 对比 | 普通函数 | 生成器函数 |
|------|---------|-----------|
| 关键字 | \`return\` | \`yield\` |
| 返回值 | 一个值 | 生成器对象 |
| 执行方式 | 一次跑完 | 每次 yield 暂停 |
| 内存 | 一次占用全部 | 几乎不占 |

### yield 的执行机制

\`\`\`python
def gen():  # 定义函数 gen
    print("第一步")  # 打印输出到屏幕
    yield 1  # 生成值：1
    print("第二步")  # 打印输出到屏幕
    yield 2  # 生成值：2
    print("第三步")  # 打印输出到屏幕
    yield 3  # 生成值：3

g = gen()          # 调用函数不执行，返回生成器
next(g)            # 执行到第一个 yield，返回 1，暂停
# 输出：第一步
next(g)            # 从暂停处继续，到第二个 yield，返回 2
# 输出：第二步
next(g)            # 继续，到第三个 yield，返回 3
# 输出：第三步
next(g)            # 抛 StopIteration
\`\`\`

**关键**：每次 \`next()\` 执行到 \`yield\` 就暂停，下次 \`next()\` 从暂停处继续。

### 惰性求值（节省内存）

\`\`\`python
# 列表：立即生成 100 万个数，占内存
nums_list = [x for x in range(1000000)]  # 定义列表 nums_list

# 生成器：按需生成，几乎不占内存
def nums_gen(n):  # 定义函数 nums_gen，参数：n
    for i in range(n):  # 遍历 range(n)，取值给 i
        yield i  # 生成值：i

g = nums_gen(1000000)    # 没有真的生成，只是创建生成器
next(g)                  # 才生成第一个
\`\`\`

### 用 for 遍历生成器

\`\`\`python
def squares(n):  # 定义函数 squares，参数：n
    for i in range(n):  # 遍历 range(n)，取值给 i
        yield i * i  # 生成值：i * i

for sq in squares(5):  # 遍历 squares(5)，取值给 sq
    print(sq)    # 0 1 4 9 16
\`\`\`

\`for\` 自动调 \`next\` 并捕获 \`StopIteration\`。

## 生成器表达式

圆括号形式，类似列表推导式但是惰性的：

\`\`\`python
# 列表推导式：立即生成
squares_list = [x * x for x in range(1000000)]  # 定义列表 squares_list

# 生成器表达式：按需
squares_gen = (x * x for x in range(1000000))  # 定义元组 squares_gen
\`\`\`

### 直接传给聚合函数

\`\`\`python
total = sum(x * x for x in range(100))     # 不用 []
maximum = max(x for x in range(100))  # 赋值变量 maximum
\`\`\`

## next / send / close / throw

### next(gen)

取下一个值：

\`\`\`python
g = (x for x in range(3))  # 定义元组 g
print(next(g))   # 0
print(next(g))   # 1
\`\`\`

### send(value)

向生成器发送值（双向通信）：

\`\`\`python
def echo():  # 定义函数 echo
    while True:  # 当 True 时循环
        received = yield        # 接收 send 的值
        print(f"收到：{received}")  # 打印输出到屏幕

g = echo()  # 赋值变量 g
next(g)             # 启动生成器（必须先 next 或 send(None)）
g.send("hello")     # 输出：收到：hello
g.send("world")     # 输出：收到：world
\`\`\`

### close()

关闭生成器：

\`\`\`python
g = (x for x in range(10))  # 定义元组 g
next(g)             # 0
g.close()           # 关闭
next(g)             # StopIteration
\`\`\`

### throw(exc)

向生成器内抛异常：

\`\`\`python
def gen():  # 定义函数 gen
    try:  # 尝试执行可能出错的代码
        yield 1  # 生成值：1
    except ValueError:  # 捕获异常 ValueError:
        print("捕获到 ValueError")  # 打印输出到屏幕

g = gen()  # 赋值变量 g
next(g)                  # 1
g.throw(ValueError)      # 输出：捕获到 ValueError
\`\`\`

## yield 生成无限序列

生成器特别适合无限序列（因为惰性）：

\`\`\`python
def fibonacci():  # 定义函数 fibonacci
    a, b = 0, 1  # 多重赋值：a, b
    while True:           # 无限循环
        yield a  # 生成值：a
        a, b = b, a + b  # 多重赋值：a, b

# 取前 10 个
fib = fibonacci()  # 赋值变量 fib
for _ in range(10):  # 遍历 range(10)，取值给 _
    print(next(fib))  # 打印输出到屏幕
\`\`\`

## 协程基础

用 \`yield\` 实现简单的协程（ cooperative multitasking）：

\`\`\`python
def consumer():  # 定义函数 consumer
    while True:  # 当 True 时循环
        item = yield       # 接收生产者发的数据
        print(f"消费：{item}")  # 打印输出到屏幕

c = consumer()  # 赋值变量 c
next(c)                     # 启动
c.send("苹果")  # 调用 c.send()：发送
c.send("香蕉")  # 调用 c.send()：发送
\`\`\`

\`send\` 让生成器变成"能接收数据"的协程。

### 生成器 vs 列表对比

| 对比 | 列表 | 生成器 |
|------|------|--------|
| 内存 | 全部占用 | 几乎不占 |
| 速度（创建） | 慢 | 快 |
| 速度（遍历） | 快 | 略慢 |
| 可重复遍历 | ✅ | ❌ 一次性 |
| 支持索引 | ✅ \`lst[3]\` | ❌ |
| 支持长度 | ✅ \`len(lst)\` | ❌ |

### 何时用生成器

- 处理大文件（按行读）
- 无限序列
- 流式数据
- 不需要随机访问的场景

### yield from 委托

\`\`\`python
def inner():  # 定义函数 inner
    yield 1  # 生成值：1
    yield 2  # 生成值：2

def outer():  # 定义函数 outer
    yield 0  # 生成值：0
    yield from inner()    # 委托给 inner
    yield 3  # 生成值：3

list(outer())   # [0, 1, 2, 3]
\`\`\`

\`yield from\` 让一个生成器把另一个生成器的值全部 yield 出来。

下面的 demo 把生成器的核心用法都演示一遍。`,
    code: `# ==========================================
# 生成器与 yield 完整演示
# ==========================================

# 1. 普通函数 vs 生成器函数
print("=== 1. 普通函数 vs 生成器函数 ===")
def squares_list(n):
    """普通函数：返回完整列表"""
    result = []
    for i in range(n):
        result.append(i * i)
    return result

def squares_gen(n):
    """生成器函数：用 yield 逐个产生"""
    for i in range(n):
        yield i * i

print(f"  普通函数返回：{squares_list(5)}")
g = squares_gen(5)
print(f"  生成器返回：{g}")
print(f"  生成器类型：{type(g).__name__}")
print(f"  转 list：{list(g)}")

# 2. yield 执行机制
print()
print("=== 2. yield 执行机制 ===")
def my_gen():
    print("  >> 第一步")
    yield 1
    print("  >> 第二步")
    yield 2
    print("  >> 第三步")
    yield 3
    print("  >> 结束")

g = my_gen()
print("调用 my_gen()，没执行任何代码")
print(f"  next 1: {next(g)}")    # 执行到第一个 yield
print(f"  next 2: {next(g)}")    # 从暂停处继续到第二个 yield
print(f"  next 3: {next(g)}")    # 继续到第三个 yield
try:
    next(g)
except StopIteration:
    print("  next 4: StopIteration（结束）")

# 3. 用 for 遍历生成器
print()
print("=== 3. for 遍历生成器 ===")
def count_up_to(n):
    i = 1
    while i <= n:
        yield i
        i += 1

for x in count_up_to(5):
    print(f"  {x}")

# 4. 惰性求值：节省内存
print()
print("=== 4. 惰性求值省内存 ===")
import sys
# 列表：100万个数，占内存
big_list = [x for x in range(1000000)]
# 生成器：100万个数，几乎不占
big_gen = (x for x in range(1000000))
print(f"  列表内存：{sys.getsizeof(big_list)} 字节")
print(f"  生成器内存：{sys.getsizeof(big_gen)} 字节")
print("  💡 生成器固定大小，不随数据量增长")

# 5. 生成器表达式
print()
print("=== 5. 生成器表达式 ===")
# 直接传给 sum/max/min
total = sum(x * x for x in range(10))
print(f"  sum(x*x for x in range(10)) = {total}")

maximum = max(x for x in range(10))
print(f"  max(x for x in range(10)) = {maximum}")

# 6. 无限序列：斐波那契
print()
print("=== 6. 无限斐波那契 ===")
def fibonacci():
    a, b = 0, 1
    while True:           # 无限循环，因为有 yield 暂停
        yield a
        a, b = b, a + b

fib = fibonacci()
print("  前 10 项：", end="")
for _ in range(10):
    print(f" {next(fib)}", end="")
print()

# 7. next / send / close
print()
print("=== 7. next / send / close ===")
def echo():
    """接收 send 数据并打印"""
    print("  生成器启动")
    while True:
        received = yield    # 接收 send 的值
        print(f"  收到：{received}")

g = echo()
next(g)                     # 启动（必须先 next）
g.send("苹果")
g.send("香蕉")
g.close()                    # 关闭
print("  生成器已关闭")

# 8. throw 抛异常
print()
print("=== 8. throw 抛异常 ===")
def safe_gen():
    try:
        yield 1
        yield 2
    except ValueError as e:
        print(f"  生成器内捕获：{e}")
        yield 99

g = safe_gen()
print(f"  next: {next(g)}")
result = g.throw(ValueError("出错了"))
print(f"  throw 后 yield：{result}")

# 9. yield from 委托
print()
print("=== 9. yield from 委托 ===")
def inner():
    yield 1
    yield 2
    yield 3

def outer():
    yield 0
    yield from inner()       # 把 inner 的值全部 yield 出来
    yield 4

print(f"  list(outer()) = {list(outer())}")

# 10. 实战：读取大文件（模拟）
print()
print("=== 10. 模拟按行读大文件 ===")
def fake_lines(n):
    """模拟产生 n 行数据"""
    for i in range(n):
        yield f"第 {i + 1} 行"

# 只读前 5 行，不一次性加载全部
line_gen = fake_lines(1000000)
print("  前 5 行：")
for _ in range(5):
    print(f"    {next(line_gen)}")
print("  💡 即使数据有 100 万行，内存占用恒定")

# 11. 实战：管道处理
print()
print("=== 11. 管道式数据处理 ===")
def numbers():
    """产生数字"""
    for i in range(1, 6):
        yield i

def squared(source):
    """对源数据平方"""
    for x in source:
        yield x * x

def filtered(source):
    """过滤偶数"""
    for x in source:
        if x % 2 == 1:
            yield x

# 管道：数字 -> 平方 -> 过滤奇数
pipeline = filtered(squared(numbers()))
print(f"  1..5 平方后取奇数：{list(pipeline)}")

# 12. 协程基础：生产者-消费者
print()
print("=== 12. 协程：生产者-消费者 ===")
def consumer():
    """消费者协程"""
    total = 0
    while True:
        item = yield
        if item is None:            # 收到 None 表示结束
            print(f"  消费者：总共消费 {total} 件")
            break
        total += 1
        print(f"  消费者：处理 {item}（第 {total} 件）")
    return total

c = consumer()
next(c)                              # 启动消费者
for item in ["苹果", "香蕉", "橙子"]:
    c.send(item)                     # 生产者发送数据
# send(None) 触发 break + return，会抛 StopIteration（携带返回值）
try:
    c.send(None)                     # 发送结束信号
except StopIteration as e:
    # 生成器 return 的值会包在 StopIteration.value 里
    print(f"  协程结束，返回值：{e.value}")

# 13. 生成器 vs 列表性能对比
print()
print("=== 13. 性能对比 ===")
import time

# 列表：先创建再求和
start = time.perf_counter()
nums = [x for x in range(1000000)]
total1 = sum(nums)
list_time = time.perf_counter() - start

# 生成器：边生成边求和
start = time.perf_counter()
total2 = sum(x for x in range(1000000))
gen_time = time.perf_counter() - start

print(f"  列表求和：{total1}，耗时 {list_time*1000:.2f} ms")
print(f"  生成器求和：{total2}，耗时 {gen_time*1000:.2f} ms")
print("  💡 列表创建快但占内存，生成器省内存但略慢")

# 14. 实战：用生成器实现素数生成器
print()
print("=== 14. 素数生成器 ===")
def primes():
    """无限素数生成器"""
    n = 2
    while True:
        # 检查 n 是否素数
        is_prime = True
        for d in range(2, int(n ** 0.5) + 1):
            if n % d == 0:
                is_prime = False
                break
        if is_prime:
            yield n
        n += 1

p = primes()
print("  前 10 个素数：", end="")
for _ in range(10):
    print(f" {next(p)}", end="")
print()

print()
print("生成器与 yield 演示完成")`
  },
  {
    id: "py8-walrus",
    group: "流程控制",
    icon: "🦦",
    title: "海象运算符与三元表达式",
    content: `## 海象运算符 :=

\`:=\` 叫**海象运算符**（walrus operator），Python 3.8 引入。它在**表达式内部赋值**，避免重复计算。

### 语法

\`\`\`python
(变量名 := 表达式)  # 执行操作
\`\`\`

### 基础示例

\`\`\`python
# 没有海象：要写两遍
n = len("hello world")  # 赋值变量 n
if n > 5:  # 如果 n > 5
    print(f"长度 {n}，超过 5")  # 打印输出到屏幕

# 用海象：一行搞定
if (n := len("hello world")) > 5:  # 如果 (n := len("hello world")) > 5
    print(f"长度 {n}，超过 5")  # 打印输出到屏幕
\`\`\`

**关键**：\`(n := ...)\` 既给 \`n\` 赋值，又把整个表达式的值用于 \`if\` 判断。

### := 与 = 的区别

| 运算符 | 名称 | 用途 | 返回值 |
|--------|------|------|--------|
| \`=\` | 赋值 | 语句，给变量赋值 | 无（不能用在表达式里） |
| \`:=\` | 海象 | 表达式，赋值并返回值 | 有，可参与表达式 |

\`\`\`python
x = 5           # 赋值语句
if (y := 5) > 3:    # 海象：赋值 + 比较
    print(y)        # 5
\`\`\`

## 海象的常见应用

### 1. 在 if 中赋值（避免重复调用）

\`\`\`python
# 笨办法：调用两次
text = "hello"  # 定义字符串 text
if len(text) > 3:  # 如果 len(text) > 3
    print(f"长度 {len(text)}")  # 打印输出到屏幕

# 海象：调用一次
if (n := len(text)) > 3:  # 如果 (n := len(text)) > 3
    print(f"长度 {n}")  # 打印输出到屏幕
\`\`\`

### 2. while 读取数据

\`\`\`python
# 老写法
line = f.readline()  # 赋值变量 line
while line:  # 当 line 时循环
    process(line)  # 调用 process()
    line = f.readline()  # 赋值变量 line

# 海象写法
while (line := f.readline()):  # 当 (line := f.readline()) 时循环
    process(line)  # 调用 process()
\`\`\`

### 3. 列表推导式

\`\`\`python
# 没海象：调用两次 expensive()
results = [y for x in data if (y := expensive(x)) is not None]  # 定义列表 results

# 对比笨办法
results = []  # 定义列表 results
for x in data:  # 遍历 data，取值给 x
    y = expensive(x)  # 赋值变量 y
    if y is not None:  # 如果 y is not None
        results.append(y)  # 调用 results.append()：向列表末尾添加元素
\`\`\`

### 4. 处理 None 默认值

\`\`\`python
# 配置可能为 None
config = get_config() or {}  # 赋值变量 config
# 等价于
if (config := get_config()) is None:  # 如果 (config := get_config()) is None
    config = {}  # 定义字典 config
\`\`\`

### 5. 重复使用计算结果

\`\`\`python
# 计算一次，多次用
if (match := pattern.search(text)):  # 如果 (match := pattern.search(text))
    print(f"匹配到：{match.group()}")  # 打印输出到屏幕
    print(f"位置：{match.start()}")  # 打印输出到屏幕
\`\`\`

## 三元表达式 x if cond else y

Python 的三元表达式语法是**条件在中间**：

\`\`\`python
值1 if 条件 else 值2  # 执行操作
\`\`\`

\`\`\`python
age = 20  # 定义数值 age
status = "成年" if age >= 18 else "未成年"  # 定义字符串 status
# 等价于：
# if age >= 18:
#     status = "成年"
# else:
#     status = "未成年"
\`\`\`

### 三元 vs 海象 对比

| 特性 | 三元 \`x if c else y\` | 海象 \`(x := v)\` |
|------|---------------------|------------------|
| 作用 | 根据条件选值 | 表达式内赋值 |
| 返回 | 选中的值 | 赋的值 |
| 创建变量 | 不创建 | 创建新变量 |
| 阅读顺序 | 条件在中间 | 赋值在前 |

### 嵌套三元（不推荐）

\`\`\`python
level = "优" if s >= 90 else ("良" if s >= 80 else "中")  # 定义字符串 level
\`\`\`

可读性差，建议改用 if-elif。

## 海象的使用陷阱

### 1. 必须加括号

\`\`\`python
# 错：海象不能直接做条件
if n := 5 > 3:    # 解析成 n := (5 > 3)，n 是 True
    ...  # 执行操作

# 对：加括号
if (n := 5) > 3:  # n 是 5
    ...  # 执行操作
\`\`\`

### 2. 列表推导式作用域

\`\`\`python
# 海象在推导式里赋的变量会"泄漏"到外部
[y := x for x in range(3)]  # 列表推导式
print(y)    # 2，最后一个值

# 普通推导式变量不泄漏
[x for x in range(3)]  # 列表推导式
print(x)    # NameError
\`\`\`

### 3. 不能给属性赋值

\`\`\`python
obj.attr := 5    # 语法错误
# 应该
obj.attr = 5  # 执行操作
\`\`\`

## 何时用海象

| 场景 | 用海象？ |
|------|----------|
| 避免重复调用昂贵函数 | ✅ |
| while 读数据 | ✅ |
| 推导式里复用计算 | ✅ |
| 简单赋值 | ❌ 用 \`=\` |
| 给属性赋值 | ❌ 不支持 |
| 让代码更难读 | ❌ 别用 |

## 综合示例

\`\`\`python
# 1. while 读取
while (chunk := get_chunk()):  # 当 (chunk := get_chunk()) 时循环
    process(chunk)  # 调用 process()

# 2. 推导式过滤 + 转换
result = [y for x in data if (y := transform(x)) is not None]  # 定义列表 result

# 3. 默认值
if (value := get_value()) is not None:  # 如果 (value := get_value()) is not None
    use(value)  # 调用 use()
\`\`\`

下面的 demo 把海象运算符和三元表达式都演示一遍。`,
    code: `# ==========================================
# 海象运算符 := 与三元表达式完整演示
# ==========================================
import sys

# 检查 Python 版本（海象需要 3.8+）
print("=== 检查版本 ===")
print(f"  Python {sys.version_info.major}.{sys.version_info.minor}")
if sys.version_info >= (3, 8):
    print("  ✅ 支持海象运算符 :=")
else:
    print("  ⚠️ 不支持 :=（需要 3.8+），下面用等价写法演示")

# 1. 三元表达式基础
print()
print("=== 1. 三元表达式 ===")
age = 20
status = "成年" if age >= 18 else "未成年"
print(f"  age={age} -> {status}")

score = 85
result = "及格" if score >= 60 else "不及格"
print(f"  score={score} -> {result}")

# 2. 三元等价的 if-else
print()
print("=== 2. 三元 vs if-else ===")
n = 7
# 三元
parity1 = "偶数" if n % 2 == 0 else "奇数"
# 等价 if-else
if n % 2 == 0:
    parity2 = "偶数"
else:
    parity2 = "奇数"
print(f"  n={n}")
print(f"  三元：{parity1}")
print(f"  if-else：{parity2}")
print(f"  两者相等：{parity1 == parity2}")

# 3. 嵌套三元（不推荐太深）
print()
print("=== 3. 嵌套三元 ===")
score = 85
# 嵌套三元
level = "优" if score >= 90 else ("良" if score >= 80 else "中")
print(f"  score={score} -> {level}")
print("  💡 嵌套超过 1 层建议改用 if-elif")

# 4. 三元在多种场景
print()
print("=== 4. 三元应用场景 ===")
# 绝对值
x = -5
abs_x = x if x >= 0 else -x
print(f"  |{x}| = {abs_x}")

# 默认值
user_input = ""
name = user_input if user_input else "匿名"
print(f"  输入 '{user_input}' -> 名字 '{name}'")

# 选择最大值
a, b = 3, 7
maximum = a if a > b else b
print(f"  max({a}, {b}) = {maximum}")

# 5. 海象运算符基础
print()
print("=== 5. 海象运算符 := ===")
if sys.version_info >= (3, 8):
    # 没海象：调用两次 len
    text = "hello world"
    if len(text) > 5:
        print(f"  笨办法：长度 {len(text)}（调了两次 len）")
    # 用海象：只调一次
    if (n := len(text)) > 5:
        print(f"  海象：长度 {n}（只调一次 len）")
else:
    print("  当前版本不支持 :=，等价演示：")
    text = "hello world"
    n = len(text)
    if n > 5:
        print(f"  长度 {n}")

# 6. 海象避免重复计算
print()
print("=== 6. 避免重复计算 ===")
def expensive(x):
    """模拟耗时的函数"""
    print(f"    [调用 expensive({x})]")
    return x * 2

if sys.version_info >= (3, 8):
    # 笨办法：调两次
    print("  笨办法：")
    if expensive(5) > 5:
        print(f"    结果 {expensive(5)}")
    # 海象：调一次
    print("  海象：")
    if (result := expensive(5)) > 5:
        print(f"    结果 {result}")
else:
    print("  等价写法：")
    result = expensive(5)
    if result > 5:
        print(f"    结果 {result}")

# 7. while + 海象
print()
print("=== 7. while + 海象 ===")
# 模拟从数据流读取
data_stream = ["line1", "line2", "line3", ""]
idx = 0
def read_line():
    """模拟 readline，读到空字符串结束"""
    global idx
    if idx < len(data_stream):
        line = data_stream[idx]
        idx += 1
        return line
    return ""

if sys.version_info >= (3, 8):
    # 海象写法：while (line := read_line()):
    print("  海象写法：")
    idx = 0   # 重置
    while (line := read_line()):
        print(f"    读到：{line}")
else:
    # 老写法
    print("  老写法：")
    idx = 0
    line = read_line()
    while line:
        print(f"    读到：{line}")
        line = read_line()

# 8. 列表推导式 + 海象
print()
print("=== 8. 推导式 + 海象 ===")
def transform(x):
    """转换函数，可能返回 None"""
    return x * 2 if x % 2 == 0 else None

data = [1, 2, 3, 4, 5, 6]

if sys.version_info >= (3, 8):
    # 笨办法：调用两次 transform
    print("  笨办法：")
    result1 = [transform(x) for x in data if transform(x) is not None]
    print(f"    {result1}")
    # 海象：调一次
    print("  海象：")
    result2 = [y for x in data if (y := transform(x)) is not None]
    print(f"    {result2}")
else:
    print("  等价 for 写法：")
    result = []
    for x in data:
        y = transform(x)
        if y is not None:
            result.append(y)
    print(f"    {result}")

# 9. 海象的陷阱
print()
print("=== 9. 海象陷阱：必须加括号 ===")
if sys.version_info >= (3, 8):
    # 错误写法（注释说明）
    print("  ❌ 错误：if n := 5 > 3:  -> n 变成 True，不是 5")
    # 正确写法
    print("  ✅ 正确：if (n := 5) > 3:  -> n 是 5")
    if (n := 5) > 3:
        print(f"    n = {n}")
else:
    print("  当前版本不支持，概念说明：")
    print("  if (n := 5) > 3: 加括号让 n 是 5")
    print("  if n := 5 > 3: 不加括号 n 是 True")

# 10. 综合实战
print()
print("=== 10. 综合实战 ===")
def get_config(key):
    """模拟读配置，可能返回 None"""
    configs = {"host": "localhost", "port": 8080}
    return configs.get(key)

if sys.version_info >= (3, 8):
    # 用海象处理可能为 None 的值
    if (host := get_config("host")) is not None:
        print(f"  host = {host}")
    else:
        print("  host 未配置")

    if (port := get_config("port")) is not None:
        print(f"  port = {port}")
    else:
        print("  port 未配置")

    # 不存在的 key
    if (debug := get_config("debug")) is None:
        print(f"  debug 未配置，用默认值 False")
        debug = False
    print(f"  debug = {debug}")
else:
    # 等价写法
    host = get_config("host")
    if host is not None:
        print(f"  host = {host}")
    port = get_config("port")
    if port is not None:
        print(f"  port = {port}")
    debug = get_config("debug")
    if debug is None:
        print(f"  debug 未配置，用默认值 False")
        debug = False
    print(f"  debug = {debug}")

# 11. 海象 + 三元综合
print()
print("=== 11. 海象 + 三元综合 ===")
if sys.version_info >= (3, 8):
    nums = [3, 7, 2, 9, 4]
    # 找第一个大于 5 的，找到就打印
    found = next((x for x in nums if (x > 5)), None)
    print(f"  第一个大于 5 的：{found}")

    # 海象 + 三元
    first_big = (n := next((x for x in nums if x > 5), None))
    msg = f"找到 {n}" if n is not None else "没找到"
    print(f"  结果：{msg}")
else:
    nums = [3, 7, 2, 9, 4]
    found = None
    for x in nums:
        if x > 5:
            found = x
            break
    print(f"  第一个大于 5 的：{found}")
    n = found
    msg = f"找到 {n}" if n is not None else "没找到"
    print(f"  结果：{msg}")

# 12. 何时用海象的总结
print()
print("=== 12. 使用建议 ===")
print("  ✅ 推荐用海象的场景：")
print("     - if (n := len(x)) > 5:    避免重复调用")
print("     - while (line := f.readline()):  读数据")
print("     - [y for x in xs if (y := f(x))]:  推导式复用")
print("     - if (v := get()) is not None:  处理 None")
print("  ❌ 不推荐用海象的场景：")
print("     - 简单赋值（用 = 更清晰）")
print("     - 给属性赋值（不支持 obj.attr := v）")
print("     - 让代码更难读的情况")

print()
print("海象运算符与三元表达式演示完成")`
  }
];
