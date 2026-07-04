export const chapters = [
  {
    id: "py6-if",
    group: "流程控制",
    icon: "🔀",
    title: "if/elif/else 条件判断",
    content: `## if/elif/else 条件判断

条件判断是程序"做选择"的方式——根据不同条件执行不同代码。这是流程控制中最基础也是最重要的语句。

### 基本 if 语句

\`\`\`python
if 条件:  # 条件为 True 时执行下方缩进块，注意行尾冒号
    # 条件为真时要执行的具体语句，必须缩进
    条件为真时执行的代码块
\`\`\`

注意：
1. 条件后面必须有**冒号** \`:\`
2. 条件成立时执行的代码必须**缩进**（通常4个空格）
3. 没有大括号，**靠缩进区分代码块**！

### if-else 语句

\`\`\`python
if 条件:  # 条件成立走这里
    # 条件成立时执行的语句
    条件为真时执行
else:  # 否则走这里
    # 条件不成立时执行的语句
    条件为假时执行
\`\`\`

### if-elif-else 多条件

\`\`\`python
if 条件1:  # 先判断条件1
    # 条件1成立时执行
    条件1成立
elif 条件2:  # 条件1不成立才判断条件2
    # 条件1不成立、条件2成立时执行
    条件1不成立，但条件2成立
elif 条件3:  # 前面都不成立才判断条件3
    # 条件1、2都不成立、条件3成立时执行
    条件1、2都不成立，条件3成立
else:  # 以上都不成立时执行
    # 所有条件都不成立时执行
    以上条件都不成立
\`\`\`

- \`elif\` 是 \`else if\` 的缩写，可以有多个
- \`elif\` 和 \`else\` 都是可选的
- 条件是**从上到下**依次判断，第一个满足的执行，后面的跳过

### 缩进！缩进！缩进！

Python 用缩进（而不是大括号）表示代码块，这是 Python 最显著的特点：

\`\`\`python
if True:  # 条件恒为真，进入缩进块
    print("这行缩进了，属于if块")  # 缩进4空格表示属于 if
    print("这行也缩进了，也属于if块")  # 同属一个代码块
print("这行没缩进，无论条件如何都执行")  # 无缩进，已脱离 if 块
\`\`\`

⚠️ 同一个代码块的缩进量必须一致（建议用4个空格），不要混用 Tab 和空格！

### 条件可以是什么？

if 后面的条件本质上是一个布尔值：
- 比较运算：\`age >= 18\`
- 布尔值：\`is_student\`
- 其他值（真值/假值）：非零数字、非空字符串为True

### 嵌套 if

if 语句里面可以再放 if 语句：

\`\`\`python
if age >= 18:  # 外层判断年龄
    if has_id:  # 内层再判断是否有身份证
        # 满足年龄且有身份证，允许进入
        print("可以进入")
    else:
        # 年龄够但没有身份证
        print("需要身份证")
else:  # 年龄不足
    # 未成年，禁止进入
    print("未成年人不得进入")
\`\`\`

嵌套不要太深（一般不超过3层），否则代码难读。`,
    code: `# if/elif/else 条件判断演示

print("=== 1. 基本 if 语句 ===")
age = 20
if age >= 18:  # 条件后面必须有冒号
    # 缩进的代码块在条件为True时执行
    print("你是成年人")
    print("可以独立承担法律责任")
print("这行不管条件如何都会执行（没有缩进）")

print("\\n=== 2. if-else 语句 ===")
score = 55
if score >= 60:
    print(f"分数{score}，考试及格了！")
else:
    print(f"分数{score}，没及格，下次加油！")

print("\\n=== 3. if-elif-else 多条件判断 ===")
score = 85
print(f"分数：{score}")
if score >= 90:
    grade = "优秀"
elif score >= 80:
    grade = "良好"
elif score >= 70:
    grade = "中等"
elif score >= 60:
    grade = "及格"
else:
    grade = "不及格"
print(f"等级：{grade}")

# 注意：elif是从上往下判断，第一个满足的就执行
# 如果第一个条件满足，后面的elif不会再判断

print("\\n=== 4. 多个条件用 and/or 组合 ===")
age = 22
has_ticket = True
if age >= 18 and has_ticket:
    print("可以入场观看电影")
else:
    print("不能入场")

is_weekend = False
is_holiday = True
if is_weekend or is_holiday:
    print("今天休息！")
else:
    print("今天要上班/上学")

print("\\n=== 5. if 嵌套 ===")
username = "admin"
password = "123456"
if username == "admin":
    if password == "123456":
        print("登录成功，欢迎管理员！")
    else:
        print("密码错误！")
else:
    print("用户名不存在")

print("\\n=== 6. 真值/假值直接作为条件 ===")
# 不需要写 if name != ""
name = "小明"
if name:  # 非空字符串为True
    print(f"你好，{name}")
else:
    print("名字为空")

items = []
if items:  # 空列表为False
    print("列表有内容")
else:
    print("列表是空的")

x = 0
if x:  # 0是False
    print("x不是0")
else:
    print("x是0")

print("\\n=== 7. 实用例子：成绩等级+评语 ===")
def evaluate(score):
    """根据分数给出评语"""
    if score < 0 or score > 100:
        return "分数无效（0-100）"
    elif score >= 95:
        return "非常优秀！继续保持！"
    elif score >= 85:
        return "很棒！再接再厉！"
    elif score >= 70:
        return "不错，还有提升空间"
    elif score >= 60:
        return "及格了，但需要努力"
    else:
        return "不及格，要加油了！"

for s in [98, 88, 75, 65, 50, 105]:
    print(f"  分数{s}: {evaluate(s)}")

print("\\n=== 8. 实用例子：BMI指数判断 ===")
weight = 70
height = 1.75
bmi = weight / (height ** 2)
print(f"体重{weight}kg，身高{height}m，BMI={bmi:.1f}")
if bmi < 18.5:
    print("体型：偏瘦，建议增加营养")
elif bmi < 24:
    print("体型：正常，继续保持")
elif bmi < 28:
    print("体型：偏胖，建议运动")
else:
    print("体型：肥胖，建议控制饮食+运动")`
  },
  {
    id: "py6-while",
    group: "流程控制",
    icon: "🔄",
    title: "while 循环",
    content: `## while 循环

循环让程序**重复执行**一段代码。\`while\` 循环是"当条件为真时，重复执行"。

### 基本语法

\`\`\`python
while 条件:  # 条件为 True 时重复执行循环体
    循环体（重复执行的代码）
\`\`\`

执行流程：
1. 判断条件是否为 True
2. 如果是 True，执行循环体
3. 回到步骤1，再次判断条件
4. 如果条件为 False，退出循环

### 简单例子：打印1-5

\`\`\`python
i = 1
while i <= 5:  # 当 i 不超过 5 时继续
    # 打印当前 i 的值
    print(i)
    i = i + 1  # 别忘了更新计数器，否则会死循环！使条件最终变 False
\`\`\`

⚠️ **死循环警告**：如果循环条件一直是 True，循环永远不会停止！

\`\`\`python
# 这是死循环！永远不会停止（按 Ctrl+C 中断）
while True:  # 条件恒为真，循环永不退出
    print("无限循环...")
\`\`\`

写 while 循环时一定要确保**循环体能让条件最终变成 False**。

### while 循环的三要素

1. **初始化计数器**：\`i = 1\`
2. **条件判断**：\`while i <= 5\`
3. **更新计数器**：\`i = i + 1\`（或简写 \`i += 1\`）

缺一个都不行！

### 计数循环 vs 条件循环

- **计数循环**：知道要循环多少次（比如打印100次）——后面学的 for 循环更适合
- **条件循环**：不知道循环多少次，直到某个条件满足才停——while 更适合

比如：不断让用户输入，直到输入"quit"为止。

### 累加/累乘模式

\`\`\`python
# 计算1+2+3+...+100
sum = 0  # 累加器初始化为 0
# 计数器 i 从 1 开始
i = 1
while i <= 100:  # 从 1 加到 100
    sum += i  # 等价于 sum = sum + i
    i += 1  # 计数器加 1
print(sum)  # 5050，输出累加结果
\`\`\`

### 循环控制

- \`break\`：立即跳出整个循环
- \`continue\`：跳过本次循环，进入下一次

后面会详细讲。`,
    code: `# while 循环演示

print("=== 1. 基本 while 循环：打印 1~5 ===")
i = 1               # 1. 初始化计数器
while i <= 5:       # 2. 条件判断
    print(i, end=" ")
    i = i + 1       # 3. 更新计数器（非常重要！）
print()  # 换行

print("\\n=== 2. 计算 1+2+3+...+10 ===")
total = 0  # 累加器，初始为0
i = 1
while i <= 10:
    total = total + i  # 把i加到总和里
    i = i + 1
print("1+2+...+10 =", total)  # 应该是55

print("\\n=== 3. 计算 1+3+5+...+99（奇数和）===")
total = 0
i = 1
while i <= 100:
    total += i
    i += 2  # 每次加2，就是奇数
print("1+3+5+...+99 =", total)  # 2500

print("\\n=== 4. 计算 n!（阶乘）===")
n = 10
result = 1  # 累乘器，初始为1（不是0！）
i = 1
while i <= n:
    result = result * i
    i = i + 1
print(f"{n}! =", result)  # 3628800

print("\\n=== 5. 倒计时 ===")
count = 5
while count > 0:
    print(f"{count}...", end=" ", flush=True)
    count -= 1
print("发射！🚀")

print("\\n=== 6. while 循环做猜数字（预设答案演示）===")
# 模拟猜数字游戏（预设答案，不用input交互）
secret = 42
# 猜测序列
guesses = [10, 50, 30, 42]
guess_index = 0
tries = 0
found = False
print(f"秘密数字是1-100之间，开始猜！")
while guess_index < len(guesses) and not found:
    guess = guesses[guess_index]
    tries += 1
    print(f"  第{tries}次猜：{guess}", end=" -> ")
    if guess == secret:
        print(f"恭喜你猜对了！用了{tries}次")
        found = True
    elif guess < secret:
        print("太小了！")
    else:
        print("太大了！")
    guess_index += 1

print("\\n=== 7. 打印乘法表（while版）===")
row = 1
while row <= 9:
    col = 1
    while col <= row:
        print(f"{col}×{row}={row*col:<2}", end=" ")
        col += 1
    print()  # 换行
    row += 1

print("\\n=== 8. 注意：避免死循环 ===")
print("死循环是指条件永远为True，循环永远不停止")
print("例如：忘记更新计数器 i=i+1 就会造成死循环")
print("遇到死循环按 Ctrl+C 可以中断程序")
print("所以写while循环一定要记得：更新条件变量！")`
  },
  {
    id: "py6-for",
    group: "流程控制",
    icon: "🔁",
    title: "for 循环与 range",
    content: `## for 循环与 range

\`for\` 循环是 Python 中最常用的循环，用来**遍历**（逐个访问）可迭代对象（序列、集合、字典等）。

### 基本语法

\`\`\`python
for 变量 in 可迭代对象:  # 每次循环变量取序列中一个元素
    循环体
\`\`\`

### 遍历字符串

\`\`\`python
for ch in "Python":  # 逐个取出字符串中的字符
    print(ch)  # 依次输出 P y t h o n
\`\`\`

### 遍历列表

\`\`\`python
# 定义水果列表
fruits = ["苹果", "香蕉", "橙子"]
for fruit in fruits:  # 遍历列表每个元素
    print(f"我喜欢吃{fruit}")  # f-string 插入当前元素
\`\`\`

### range() 函数

\`range()\` 用来生成整数序列，配合 for 做计数循环：

| 用法 | 含义 | 例子 |
|------|------|------|
| \`range(n)\` | 0到n-1 | range(5) → 0,1,2,3,4 |
| \`range(start, stop)\` | start到stop-1 | range(2,5) → 2,3,4 |
| \`range(start, stop, step)\` | 步长为step | range(1,10,2) → 1,3,5,7,9 |
| 负步长 | 倒序 | range(10,0,-1) → 10,9,...,1 |

⚠️ range 是"左闭右开"：包含start，不包含stop！

\`\`\`python
# 打印0到4
for i in range(5):  # range(5) 生成 0,1,2,3,4
    print(i)

# 打印1到10
for i in range(1, 11):  # 从 1 到 10（不含 11）
    print(i)

# 打印10以内偶数
for i in range(0, 11, 2):  # 步长 2，取 0,2,4,6,8,10
    print(i)

# 倒序：从10到1（负步长）
for i in range(10, 0, -1):  # step=-1，从 10 递减到 1（不含 0）
    print(i)
\`\`\`

### for vs while 怎么选？

- **知道循环次数**：用 \`for + range\`
- **遍历序列**：直接用 \`for item in sequence\`
- **不知道次数，条件触发结束**：用 \`while\`

### for 循环的变量

每次循环，变量会依次取到可迭代对象中的每个元素：

\`\`\`python
for i in range(3):  # i 依次取 0、1、2
    print(i)  # 依次是 0, 1, 2
\`\`\`

### 小技巧

- 想按索引遍历列表：\`for i in range(len(lst)):\`
- 想同时要索引和值：用 \`enumerate()\`（后面章节讲）
- 想同时遍历多个列表：用 \`zip()\`（后面章节讲）`,
    code: `# for 循环与 range 演示

print("=== 1. 遍历字符串 ===")
word = "Python"
print(f"遍历 '{word}':")
for ch in word:
    print(f"  字符: {ch}")

print("\\n=== 2. 遍历列表 ===")
fruits = ["苹果", "香蕉", "橙子", "葡萄"]
print("水果列表:")
for fruit in fruits:
    print(f"  - {fruit}")

print("\\n=== 3. range() 基本用法 ===")
print("range(5) →", end=" ")
for i in range(5):  # 0,1,2,3,4
    print(i, end=" ")
print()

print("range(2, 7) →", end=" ")
for i in range(2, 7):  # 2,3,4,5,6
    print(i, end=" ")
print()

print("range(1, 10, 2) →", end=" ")
for i in range(1, 10, 2):  # 1,3,5,7,9
    print(i, end=" ")
print()

print("range(10, 0, -1) →", end=" ")
for i in range(10, 0, -1):  # 倒序: 10,9,...,1
    print(i, end=" ")
print()

print("\\n=== 4. 用 for 计算 1+2+...+100 ===")
total = 0
for i in range(1, 101):
    total += i
print("1+2+...+100 =", total)  # 5050

print("\\n=== 5. for 循环打印图形 ===")
print("直角三角形:")
for i in range(1, 6):  # i是行数
    print("*" * i)

print("\\n=== 6. 打印 9×9 乘法表（for版）===")
for i in range(1, 10):
    for j in range(1, i + 1):
        print(f"{j}×{i}={i*j:<2}", end=" ")
    print()

print("\\n=== 7. 遍历列表时获取索引（两种方式）===")
colors = ["红", "绿", "蓝"]
# 方式1：用range+len
print("方式1（range+len）:")
for i in range(len(colors)):
    print(f"  索引{i}: {colors[i]}")

# 方式2：用enumerate（推荐！后面章节详细讲）
print("方式2（enumerate）:")
for i, color in enumerate(colors):
    print(f"  索引{i}: {color}")

print("\\n=== 8. 实用例子：判断质数 ===")
def is_prime(n):
    """判断n是不是质数"""
    if n < 2:
        return False
    for i in range(2, n):
        if n % i == 0:  # 能整除，不是质数
            return False
    return True

print("1-30中的质数:")
primes = []
for num in range(2, 31):
    if is_prime(num):
        primes.append(str(num))
print("  " + " ".join(primes))

print("\\n=== 9. for vs while 选择 ===")
print("- 遍历序列/知道次数 → 用 for")
print("- 条件触发结束/不知道次数 → 用 while")
print("大多数情况下 for 更简洁好用！")`
  },
  {
    id: "py6-break-continue",
    group: "流程控制",
    icon: "⏭️",
    title: "break/continue/pass",
    content: `## break/continue/pass

这三个关键字用于控制循环的执行流程：

- \`break\`：**立即终止**整个循环
- \`continue\`：**跳过当前这一次**循环，直接进入下一次
- \`pass\`：什么都不做，占位用

### break —— 跳出循环

当遇到 \`break\` 时，循环立即结束，程序跳到循环后面继续执行：

\`\`\`python
for i in range(1, 10):  # i 取 1 到 9
    # 判断 i 是否等于 5
    if i == 5:
        break  # 当 i 等于 5 时，直接退出整个循环（break 立即终止）
    # 打印未触发 break 的数字
    print(i)
# 输出：1 2 3 4
\`\`\`

break 常用于：
- 找到目标后提前结束循环（不用遍历完所有元素）
- 满足某个条件时强制退出

### continue —— 跳过本次

\`continue\` 跳过本次循环剩余的代码，直接进入下一轮循环：

\`\`\`python
for i in range(1, 6):  # i 取 1 到 5
    # 命中需要跳过的值
    if i == 3:
        continue  # 跳过 i=3 这次，进入下一轮循环
    # 打印未被跳过的数字
    print(i)
# 输出：1 2 4 5（注意没有3）
\`\`\`

continue 常用于：
- 过滤掉不需要处理的情况
- 遇到某些条件时跳过，继续下一个

### break vs continue 对比

\`\`\`
break:    循环1 循环2 循环3 [遇到break] → 完全结束循环
continue: 循环1 循环2 [跳过3] 循环4 循环5 → 继续后面的循环
\`\`\`

### pass —— 空占位

\`pass\` 是一个空语句，什么都不做，纯粹是为了语法需要占位：

\`\`\`python
if x > 0:  # x 为正数时
    pass  # 还没想好写什么，先用 pass 占位（空语句，保证语法合法）
else:  # 否则
    # 条件不成立时执行
    print("x<=0")
\`\`\`

Python 的代码块不能为空（if/for/def/class后面必须有内容），
还没实现时可以用 pass 占位，保证语法正确。

### break 在嵌套循环中

\`break\` 只能跳出**它所在的那一层**循环，不会跳出外层：

\`\`\`python
for i in range(3):  # 外层循环
    for j in range(3):  # 内层循环
        if j == 1:
            break  # 只跳出内层 j 循环，外层 i 循环继续（break 仅作用于所在层）
        # 打印满足条件的下标组合
        print(i, j)
\`\`\`

### 循环的 else 子句（可选）

for/while 可以带 else，在循环**正常结束**（没有被break打断）时执行：

\`\`\`python
for i in range(5):  # i 取 0 到 4
    if i == 10:  # 条件永不成立，break 不会触发
        break
else:  # 循环未被 break 打断，执行 else
    print("循环正常结束，没有被break")  # 会执行
\`\`\`

后面章节会详细讲。`,
    code: `# break/continue/pass 演示

print("=== 1. break：立即终止循环 ===")
print("找1-10中第一个能被7整除的数:")
for i in range(1, 11):
    print(f"  检查 {i}...", end=" ")
    if i % 7 == 0:
        print(f"找到了！{i}能被7整除")
        break  # 找到后立即退出，不再检查后面的数
    print("不行")

print("\\n=== 2. continue：跳过本次循环 ===")
print("打印1-10，跳过偶数（只打印奇数）:")
for i in range(1, 11):
    if i % 2 == 0:  # 偶数
        continue     # 跳过本次，不执行后面的print
    print(i, end=" ")
print()

print("\\n=== 3. continue 跳过负数求和 ===")
numbers = [5, -2, 10, -8, 3, 0, 7]
print("数字列表:", numbers)
total = 0
count = 0
for num in numbers:
    if num < 0:
        continue  # 负数跳过，不加到总和
    total += num
    count += 1
print(f"正数之和: {total}，共{count}个正数")

print("\\n=== 4. 对比：break vs continue ===")
print("break效果：")
for i in range(1, 6):
    if i == 3:
        break
    print(f"  {i}", end="")
print(" → 遇到3完全停止")

print("continue效果：")
for i in range(1, 6):
    if i == 3:
        continue
    print(f"  {i}", end="")
print(" → 跳过3，继续后面的")

print("\\n=== 5. pass：什么都不做，占位符 ===")
# pass 用于语法上需要语句但暂时不想写任何内容的地方
print("演示pass占位（if块里暂时没内容）:")
x = 10
if x > 0:
    pass  # 这里以后要写代码，先占位
else:
    print("x <= 0")
print("pass不影响程序继续运行")

# 也用于定义空的类或函数
class EmptyClass:
    pass

def empty_function():
    pass

print("空类和空函数已定义（用pass占位）")

print("\\n=== 6. 实战：登录验证（最多3次机会）===")
password = "abc123"
# 预设的输入序列（模拟用户输入）
inputs = ["111111", "abc123", "wrong"]
attempt = 0
login_success = False
max_attempts = 3

idx = 0
while attempt < max_attempts:
    if idx < len(inputs):
        user_input = inputs[idx]
        idx += 1
    else:
        user_input = ""
    attempt += 1
    print(f"第{attempt}次输入密码: {'*' * len(user_input)}")
    if user_input == password:
        login_success = True
        break  # 登录成功，跳出循环
    if attempt < max_attempts:
        print(f"  密码错误，还有{max_attempts - attempt}次机会")

if login_success:
    print("登录成功！欢迎回来！")
else:
    print("3次都输错了，账号被锁定")

print("\\n=== 7. 实战：找质数 ===")
print("找出20以内的所有质数：")
for n in range(2, 21):
    is_prime = True
    for i in range(2, n):
        if n % i == 0:
            is_prime = False
            break  # 找到一个因子就够了，不用再试
    if is_prime:
        print(n, end=" ")
print()`
  },
  {
    id: "py6-match",
    group: "流程控制",
    icon: "🎯",
    title: "match-case 模式匹配（Python 3.10+）",
    content: `## match-case 模式匹配

\`match-case\` 是 Python 3.10 引入的新特性，类似于其他语言的 switch-case，但更强大，支持**模式匹配**。

### 基本语法

\`\`\`python
match 变量:  # 对变量进行模式匹配
    case 值1:  # 值等于值1时
        匹配值1时执行
    case 值2:
        匹配值2时执行
    case _:  # 下划线通配符，匹配所有其他情况
        都不匹配时执行（默认分支）
\`\`\`

- \`match\` 后面是要匹配的值
- \`case\` 后面是模式
- \`case _\` 是通配符，匹配所有情况（类似 else）
- 匹配是从上到下，第一个匹配的执行

### 简单例子：星期几

\`\`\`python
# 假设今天是星期三
day = 3
match day:  # 匹配 day 的值
    # 匹配星期一
    case 1:
        # 输出星期一
        print("星期一")
    # 匹配星期二
    case 2:
        # 输出星期二
        print("星期二")
    # 匹配星期三
    case 3:
        print("星期三")  # day=3 命中此分支
    case _:
        print("其他")  # 其余值走默认分支
\`\`\`

### 多值匹配

一个 case 可以匹配多个值，用 \`|\` 分隔：

\`\`\`python
# 对 day 进行模式匹配
match day:
    case 1 | 2 | 3 | 4 | 5:  # | 表示或，匹配任一值
        # 命中工作日分支
        print("工作日")
    case 6 | 7:
        # 命中周末分支
        print("周末")
\`\`\`

### 捕获变量（捕获模式）

case 中可以用变量名捕获匹配到的值（小写名是变量，会捕获；引号包裹的是字面量）：

\`\`\`python
match point:  # point 是二元组
    case (0, 0):  # 字面量模式：精确匹配原点 (0,0)
        print("原点")
    case (x, 0):  # 捕获模式：x 是变量（捕获任意值），y 必须为 0
        print(f"在X轴上，x={x}")
    case (0, y):  # 捕获模式：x 必须为 0，y 捕获任意值
        print(f"在Y轴上，y={y}")
    case (x, y):  # 捕获模式：x、y 都捕获任意值（匹配所有二元组）
        print(f"点坐标({x}, {y})")
\`\`\`

⚠️ 注意：变量名小写才会捕获，大写名会被当作**值**（枚举/常量）来匹配。

### 列表/元组模式

可以匹配序列的结构：

\`\`\`python
match lst:  # 按列表结构匹配
    case []:  # 空列表
        print("空列表")
    case [x]:  # 仅一个元素，捕获为 x
        print(f"只有一个元素: {x}")
    case [x, y]:  # 恰好两个元素
        print(f"两个元素: {x}, {y}")
    case [x, y, *rest]:  # *rest 收集剩余元素
        # 打印前两个元素及剩余部分
        print(f"前两个是{x},{y}，后面还有{rest}")
\`\`\`

### 字典模式（映射模式）

\`\`\`python
match data:  # data 是字典
    case {"name": name, "age": age}:  # 按键解构并捕获值
        # 打印解构出的姓名和年龄
        print(f"姓名{name}，年龄{age}")
\`\`\`

映射模式只匹配列出的键，字典中多余的键会被忽略。

### 类模式（Python 3.10+）

类模式可以匹配对象的类型并解构其属性：

\`\`\`python
# 定义一个简单的二维点类
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

# 对 point 对象进行类模式匹配
match point:
    case Point(x=0, y=0):  # 匹配原点（x 和 y 属性都为 0）
        print("原点")
    case Point(x=0, y=y):  # x 属性为 0，捕获 y 属性
        print(f"在Y轴上，y={y}")
    case Point(x=x, y=0):  # y 属性为 0，捕获 x 属性
        print(f"在X轴上，x={x}")
    case Point(x=x, y=y):  # 捕获两个属性
        print(f"点坐标({x}, {y})")
    case _:  # 不是 Point 类型
        print("不是点对象")
\`\`\`

也可以用位置参数解构（需要 \`__match_args__\`）：

\`\`\`python
class Point:
    __match_args__ = ("x", "y")  # 声明位置匹配顺序
    def __init__(self, x, y):
        self.x = x
        self.y = y

match point:
    case Point(0, 0):  # 位置匹配，等价于 Point(x=0, y=0)
        print("原点")
    case Point(x, y):  # 位置捕获 x 和 y
        print(f"({x}, {y})")
\`\`\`

### 模式类型总结

| 模式类型 | 语法示例 | 说明 |
|---------|---------|------|
| 字面量模式 | \`case 1:\`, \`case "hello":\` | 匹配具体的值 |
| 捕获模式 | \`case x:\` | 捕获匹配的值到变量 |
| 通配符模式 | \`case _:\` | 匹配任何值（不捕获） |
| 或模式 | \`case 1 \\| 2 \\| 3:\` | 匹配多个值之一 |
| 序列模式 | \`case [x, y]:\` | 匹配列表/元组结构 |
| 映射模式 | \`case {"k": v}:\` | 匹配字典结构 |
| 类模式 | \`case Point(x=0, y=0):\` | 匹配对象类型和属性 |
| 守卫 | \`case x if x > 0:\` | 加 if 条件进一步筛选 |

### 带条件的 case（守卫）

可以加 \`if\` 条件进一步筛选：

\`\`\`python
match score:  # 匹配分数
    case s if s >= 90:  # 捕获为 s 并加 if 守卫条件
        print("优秀")
    case s if s >= 60:
        print("及格")
    case _:  # 其余情况
        print("不及格")
\`\`\`

### match vs if-elif

- **简单的值匹配**：match 更清晰
- **复杂条件判断**：if-elif 更灵活
- match 支持结构化匹配（解构），if 做不到`,
    code: `# match-case 模式匹配演示
# 注意：match-case 需要 Python 3.10 或更高版本

print("=== 1. 基本 match-case：判断星期 ===")
def get_weekday(day_num):
    match day_num:
        case 1:
            return "星期一"
        case 2:
            return "星期二"
        case 3:
            return "星期三"
        case 4:
            return "星期四"
        case 5:
            return "星期五"
        case 6:
            return "星期六"
        case 7:
            return "星期日"
        case _:  # 通配符，匹配所有其他情况
            return "无效的星期数字（1-7）"

for d in [1, 3, 5, 7, 0, 8]:
    print(f"  {d} -> {get_weekday(d)}")

print("\\n=== 2. 多值匹配（| 分隔）===")
def is_workday(day_num):
    match day_num:
        case 1 | 2 | 3 | 4 | 5:
            return True
        case 6 | 7:
            return False
        case _:
            return None

print("周一到周五是否工作日:", is_workday(3))
print("周六是否工作日:", is_workday(6))
print("周日是否工作日:", is_workday(7))

print("\\n=== 3. 简单的运算结果 ===")
def calc(a, op, b):
    match op:
        case "+":
            return a + b
        case "-":
            return a - b
        case "*":
            return a * b
        case "/":
            return a / b if b != 0 else "除数不能为0"
        case _:
            return f"不支持的运算符: {op}"

print(f"10 + 5 = {calc(10, '+', 5)}")
print(f"10 - 5 = {calc(10, '-', 5)}")
print(f"10 * 5 = {calc(10, '*', 5)}")
print(f"10 / 5 = {calc(10, '/', 5)}")
print(f"10 / 0 = {calc(10, '/', 0)}")
print(f"10 % 3 = {calc(10, '%', 3)}")

print("\\n=== 4. 带守卫条件（if 子句）===")
def grade_evaluate(score):
    match score:
        case s if s < 0 or s > 100:
            return "无效分数"
        case s if s >= 90:
            return "优秀"
        case s if s >= 80:
            return "良好"
        case s if s >= 70:
            return "中等"
        case s if s >= 60:
            return "及格"
        case _:
            return "不及格"

for s in [95, 85, 75, 65, 50, -5, 105]:
    print(f"  分数{s}: {grade_evaluate(s)}")

print("\\n=== 5. 元组/列表模式匹配（坐标点）===")
def describe_point(point):
    match point:
        case (0, 0):
            return "原点"
        case (0, y):
            return f"Y轴上，y坐标={y}"
        case (x, 0):
            return f"X轴上，x坐标={x}"
        case (x, y) if x > 0 and y > 0:
            return f"第一象限({x},{y})"
        case (x, y) if x < 0 and y > 0:
            return f"第二象限({x},{y})"
        case (x, y) if x < 0 and y < 0:
            return f"第三象限({x},{y})"
        case (x, y) if x > 0 and y < 0:
            return f"第四象限({x},{y})"
        case _:
            return "其他位置"

points = [(0, 0), (5, 0), (0, 3), (2, 3), (-2, 3), (-2, -3), (2, -3)]
for p in points:
    print(f"  {p} -> {describe_point(p)}")

print("\\n=== 6. 列表模式 ===")
def describe_list(lst):
    match lst:
        case []:
            return "空列表"
        case [x]:
            return f"只有一个元素: {x}"
        case [a, b]:
            return f"两个元素: {a}和{b}"
        case [first, *rest]:
            return f"第一个是{first}，后面还有{len(rest)}个元素"

print(describe_list([]))
print(describe_list([42]))
print(describe_list([1, 2]))
print(describe_list([1, 2, 3, 4, 5]))

print("\\n=== 7. 类模式（匹配对象类型和属性）===")
class Point:
    __match_args__ = ("x", "y")  # 声明位置匹配顺序
    def __init__(self, x, y):
        self.x = x
        self.y = y

def describe_point_obj(p):
    match p:
        # 类模式：匹配类型 Point 并解构属性
        case Point(0, 0):
            return "原点"
        case Point(0, y):
            return f"Y轴上，y={y}"
        case Point(x, 0):
            return f"X轴上，x={x}"
        case Point(x, y):
            return f"普通点({x},{y})"
        case _:
            return "不是Point对象"

for p in [Point(0, 0), Point(0, 5), Point(3, 0), Point(2, 7), "hello"]:
    print(f"  {p if not isinstance(p, Point) else f'Point({p.x},{p.y})'} -> {describe_point_obj(p)}")

print("\\n=== match vs if-elif 怎么选？===")
print("- 对值进行精确匹配（如枚举状态）→ match 更清晰")
print("- 解构复杂结构（元组/列表/字典/类）→ match 更强大")
print("- 复杂逻辑条件组合 → if-elif 更灵活")
print("- 简单条件判断 → 两者皆可，看哪个更易读")`
  },
  {
    id: "py6-ternary",
    group: "流程控制",
    icon: "❓",
    title: "条件表达式（三元运算符）",
    content: `## 条件表达式（三元运算符）

条件表达式（也叫三元运算符）是 if-else 的简写形式，用于**在一行中**根据条件选择值。

### 语法

\`\`\`python
# 三元表达式：条件为真取值1，否则取值2
值1 if 条件 else 值2
\`\`\`

如果条件为 True，返回**值1**；否则返回**值2**。

### 基本例子

\`\`\`python
# 定义年龄变量
age = 20
# 三元表达式根据年龄赋值状态
status = "成年" if age >= 18 else "未成年"
print(status)  # 成年
\`\`\`

等价于：

\`\`\`python
# 条件分支写法
if age >= 18:
    # 成年赋值
    status = "成年"
else:
    # 未成年赋值
    status = "未成年"
\`\`\`

可以看到三元表达式更简洁。

### 什么时候用？

✅ **适合用三元表达式**：
- 简单的二选一赋值
- 根据条件选择值，逻辑简单
- 在 f-string、列表推导式等地方需要条件判断

❌ **不适合用**：
- 条件复杂，有多个 elif
- if 或 else 块里需要执行多条语句
- 嵌套太多层（可读性下降）

### 嵌套三元表达式（不推荐）

理论上可以嵌套，但会降低可读性，不建议：

\`\`\`python
# 能运行但难读
# 嵌套三元表达式，可读性差
result = "优秀" if score >= 90 else "良好" if score >= 80 else "及格" if score >= 60 else "不及格"
\`\`\`

这种情况还是用 if-elif-else 更清晰。

### 常见用法

#### 1. 赋值

\`\`\`python
# 三元表达式取两数较大值
max_val = a if a > b else b
\`\`\`

#### 2. 在 print 中

\`\`\`python
# 三元表达式直接用于打印
print("及格" if score >= 60 else "不及格")
\`\`\`

#### 3. 在列表推导式中

\`\`\`python
# 列表推导式中嵌入三元表达式，正数保留否则置 0
[x if x > 0 else 0 for x in numbers]
\`\`\`

### 和其他语言对比

- C/Java/JS：\`条件 ? 值1 : 值2\`
- Python：\`值1 if 条件 else 值2\`（更像英语句子）

Python 的设计是为了可读性，读起来就是"X if 条件 else Y"。

### 注意

三元表达式是**表达式**，不是语句，它返回一个值，可以用在任何需要值的地方。`,
    code: `# 条件表达式（三元运算符）演示

print("=== 1. 基本用法 ===")
age = 20
status = "成年人" if age >= 18 else "未成年人"
print(f"年龄{age}：{status}")

score = 55
result = "及格" if score >= 60 else "不及格"
print(f"分数{score}：{result}")

# 对比：用普通if-else写
age = 15
if age >= 18:
    status2 = "成年人"
else:
    status2 = "未成年人"
print(f"年龄{age}：{status2}")

print("\\n=== 2. 求最大值和最小值 ===")
a = 10
b = 20
max_num = a if a > b else b
min_num = a if a < b else b
print(f"a={a}, b={b}")
print(f"较大值：{max_num}")
print(f"较小值：{min_num}")

print("\\n=== 3. 奇偶判断 ===")
for n in [1, 2, 3, 4, 5]:
    parity = "奇数" if n % 2 == 1 else "偶数"
    print(f"{n} 是 {parity}")

print("\\n=== 4. 绝对值（自己实现）===")
def my_abs(x):
    return x if x >= 0 else -x

print(f"my_abs(5) = {my_abs(5)}")
print(f"my_abs(-3) = {my_abs(-3)}")
print(f"my_abs(0) = {my_abs(0)}")

print("\\n=== 5. 在print中直接使用 ===")
is_logged_in = True
print("用户状态：" + ("已登录" if is_logged_in else "未登录"))
is_logged_in = False
print("用户状态：" + ("已登录" if is_logged_in else "未登录"))

print("\\n=== 6. 处理用户输入的默认值 ===")
# user_input = input("输入名字：")
user_input = ""  # 模拟用户没输入
name = user_input if user_input else "匿名用户"
print(f"你好，{name}！")

user_input = "小明"
name = user_input if user_input else "匿名用户"
print(f"你好，{name}！")

print("\\n=== 7. 嵌套三元表达式（可以用但要节制）===")
def grade(score):
    return ("优秀" if score >= 90 else
            "良好" if score >= 80 else
            "中等" if score >= 70 else
            "及格" if score >= 60 else
            "不及格")
# 这种写法虽然能运行，但如果条件多还是建议用if-elif

for s in [95, 85, 75, 65, 50]:
    print(f"  {s}分：{grade(s)}")

print("\\n=== 8. 和逻辑表达式的技巧 ===")
# 有时候用 and/or 也能实现类似效果，但三元更清晰
a = 0
b = a or 10  # 如果a是假值（0），取10
print(f"a={a}, b=a or 10 → b={b}")
a = 5
b = a or 10
print(f"a={a}, b=a or 10 → b={b}")

# 但还是推荐用三元，意图更明确
b = a if a != 0 else 10

print("\\n=== 总结 ===")
print("三元表达式语法：值A if 条件 else 值B")
print("适合：简单二选一赋值、内联条件")
print("不适合：复杂逻辑、多分支、多条语句")
print("原则：保持简洁，一行写不下就别用三元了")`
  },
  {
    id: "py6-nested-loops",
    group: "流程控制",
    icon: "🌀",
    title: "嵌套循环",
    content: `## 嵌套循环

**嵌套循环**就是循环里面还有循环。外层循环每执行一次，内层循环要完整执行完所有轮次。

### 基本概念

\`\`\`python
for i in range(3):       # 外层循环
    for j in range(3):   # 内层循环
        print(i, j)
\`\`\`

执行顺序：
- 外层 i=0，内层 j 跑 0,1,2
- 外层 i=1，内层 j 跑 0,1,2
- 外层 i=2，内层 j 跑 0,1,2

总共执行 3×3=9 次。

### 嵌套循环的执行次数

如果外层循环 m 次，内层循环 n 次，总共执行 **m × n** 次。

⚠️ 嵌套太多层会很慢！3层以上就要考虑能不能优化了。

### 典型应用：打印图形

嵌套循环最常见的用途之一是打印二维图形：

\`\`\`python
# 打印矩形
for i in range(5):        # 行
    for j in range(5):    # 列
        # 打印星号不换行
        print("*", end="")
    print()  # 换行
\`\`\`

### 典型应用：乘法表

九九乘法表是嵌套循环的经典例子：

\`\`\`python
# 外层控制行（被乘数）
for i in range(1, 10):
    # 内层控制列（乘数）
    for j in range(1, i+1):
        # 打印一个乘法项
        print(f"{j}×{i}={i*j}", end=" ")
    # 一行结束后换行
    print()
\`\`\`

### break 在嵌套循环中

break 只跳出**当前那一层**循环：

\`\`\`python
# 外层循环 i
for i in range(3):
    # 内层循环 j
    for j in range(3):
        # 判断是否需要跳出
        if j == 1:
            break  # 只跳出内层j循环，外层i继续
        # 打印未跳出时的组合
        print(i, j)
\`\`\`

要跳出多层循环，可以用标志变量：

\`\`\`python
# 标记是否找到
found = False
# 外层遍历 i
for i in range(10):
    # 内层遍历 j
    for j in range(10):
        # 满足查找条件
        if some_condition:
            # 标记已找到
            found = True
            # 跳出内层循环
            break
    # 若已找到
    if found:
        # 跳出外层循环
        break
\`\`\`

### 嵌套循环 vs 扁平化

不是所有嵌套都必要。有些情况可以用其他方式替代：
- itertools.product
- 列表推导式
- 更好的算法

但作为初学者，先掌握嵌套循环的基本思想。`,
    code: `# 嵌套循环演示

print("=== 1. 基本嵌套循环：3x3 ===")
for i in range(3):
    for j in range(3):
        print(f"({i},{j})", end=" ")
    print()  # 内层结束后换行

print("\\n=== 2. 打印矩形 ===")
rows, cols = 4, 6
for i in range(rows):
    for j in range(cols):
        print("*", end="")
    print()

print("\\n=== 3. 打印直角三角形 ===")
for i in range(1, 6):  # 第i行
    for j in range(i):  # 每行有i个星号
        print("*", end="")
    print()

print("\\n=== 4. 打印倒三角形 ===")
for i in range(5, 0, -1):
    print("*" * i)

print("\\n=== 5. 九九乘法表 ===")
for i in range(1, 10):
    for j in range(1, i + 1):
        print(f"{j}×{i}={i*j:<2}", end=" ")
    print()

print("\\n=== 6. 找两个数组合中等于目标值的对 ===")
nums1 = [1, 3, 5]
nums2 = [2, 4, 6]
target = 7
print(f"在{nums1}和{nums2}中找和为{target}的组合：")
pairs = []
for a in nums1:
    for b in nums2:
        if a + b == target:
            pairs.append((a, b))
print("找到:", pairs)

print("\\n=== 7. 打印3x3x3组合（演示三层）===")
count = 0
for x in [1, 2]:
    for y in [1, 2]:
        for z in [1, 2]:
            count += 1
            # 只打印前几个示意
            if count <= 4:
                print(f"  ({x},{y},{z})")
print(f"三层循环共 {count} 种组合")

print("\\n=== 8. break 在嵌套循环中（只跳出内层）===")
for i in range(3):
    print(f"外层 i={i}:", end=" ")
    for j in range(5):
        if j == 2:
            print("break!", end="")
            break  # 只跳出内层j循环
        print(j, end=" ")
    print()

print("\\n=== 9. 用标志变量跳出多层循环 ===")
target_i, target_j = -1, -1
found = False
for i in range(10):
    for j in range(10):
        if i == 3 and j == 5:  # 模拟找到目标
            target_i, target_j = i, j
            found = True
            break  # 跳出内层
    if found:
        break  # 跳出外层
print(f"找到目标位置: ({target_i}, {target_j})")

print("\\n=== 10. 简单的排序思路：冒泡排序演示 ===")
arr = [5, 2, 8, 1, 9]
print("原数组:", arr)
n = len(arr)
for i in range(n):
    for j in range(0, n - i - 1):
        if arr[j] > arr[j + 1]:
            # 交换
            arr[j], arr[j + 1] = arr[j + 1], arr[j]
print("排序后:", arr)
print("（冒泡排序是经典的双层循环例子）")`
  },
  {
    id: "py6-loop-else",
    group: "流程控制",
    icon: "🔗",
    title: "循环的 else 子句",
    content: `## 循环的 else 子句

Python 的 for/while 循环有一个比较特别的语法：**else 子句**。这个 else 不是和 if 配对，而是和**循环**配对。

### 语法

\`\`\`python
for 变量 in 序列:
    循环体
else:
    循环正常结束后执行

while 条件:
    循环体
else:
    循环正常结束后执行
\`\`\`

### 关键：什么时候执行 else？

else 子句在循环**正常执行完毕**（没有被 break 打断）时执行。

- ✅ 循环正常跑完了 → 执行 else
- ❌ 循环被 break 提前终止 → **不执行** else

这是很多人理解错的地方！

### 经典用法：判断质数

循环的 else 最常见的用途是**判断循环中有没有找到目标**：

\`\`\`python
# 定义判断质数的函数，参数 n
def is_prime(n):
    # 小于 2 的数不是质数
    if n < 2:
        # 直接返回 False
        return False
    # 遍历 2 到 n-1 寻找因子
    for i in range(2, n):
        # 若能整除说明有因子
        if n % i == 0:
            # 找到因子了，return 提前返回，else 不会执行
            # （return 和 break 一样会阻止 else 执行）
            return False
    else:
        # 循环正常结束（没找到因子），说明是质数
        return True
\`\`\`

### 理解例子

\`\`\`python
# 例子1：循环正常跑完（没遇到break），else 会执行
for i in range(3):
    print(i)
else:
    # for 正常结束后走到这里
    print("循环正常结束")
# 输出：0 1 2 循环正常结束

# 例子2：循环被 break 打断，else 不会执行
for i in range(3):
    print(i)
    if i == 1:
        # break 触发后，else 被跳过
        break
else:
    # 因 break 触发，此处不执行
    print("循环正常结束")
# 输出 0 1（没有"循环正常结束"）
\`\`\`

### while 循环的 else

while 的 else 也是一样：正常结束才执行：

\`\`\`python
# 正常结束
# 计数器从 0 开始
n = 0
# 当 n 小于 3 时继续
while n < 3:
    # 打印当前 n
    print(n)
    # 计数器自增
    n += 1
else:
    # 打印正常结束提示
    print("while正常结束")
\`\`\`

### 实际用途总结

1. **搜索/查找**：遍历完没找到 → else 处理"没找到"的情况
2. **判断质数/因数**：循环完没找到因子 → 是质数
3. **重试逻辑**：尝试多次都失败 → else 处理全部失败

### 不用 else 也能实现

其实 else 能做的事，用一个标志变量也能做：

\`\`\`python
# 标记是否找到目标
found = False
# 遍历每个元素
for item in items:
    # 判断是否为目标
    if item == target:
        # 标记已找到
        found = True
        # 跳出循环
        break
# 若未找到
if not found:
    # 提示没找到
    print("没找到")
\`\`\`

循环 else 只是让代码更简洁一点，用不用看个人习惯。`,
    code: `# 循环的 else 子句演示

print("=== 1. for循环正常结束，else执行 ===")
for i in range(1, 4):
    print(f"  循环中 i={i}")
else:
    print("  → 循环正常跑完了，执行else")

print("\\n=== 2. for循环被break打断，else不执行 ===")
for i in range(1, 4):
    print(f"  循环中 i={i}")
    if i == 2:
        print("  → 遇到break，跳出循环")
        break
else:
    print("  → 这句不会打印，因为被break了")

print("\\n=== 3. while循环的else ===")
n = 3
while n > 0:
    print(f"  倒计时: {n}")
    n -= 1
else:
    print("  → while正常结束，发射！")

print("\\n=== 4. while被break打断 ===")
n = 5
while n > 0:
    print(f"  n={n}")
    if n == 3:
        print("  → break!")
        break
    n -= 1
else:
    print("  → 这句不会执行")

print("\\n=== 5. 经典例子：判断质数 ===")
def is_prime(n):
    if n < 2:
        return False
    for i in range(2, n):
        if n % i == 0:
            # 找到因子了，return 提前返回，else 不执行
            print(f"    {n} 能被 {i} 整除，不是质数")
            return False
    else:
        # 循环正常结束，没找到因子，是质数
        return True

for num in [2, 3, 4, 5, 7, 9, 11, 15, 17]:
    print(f"  {num} 是质数吗？", is_prime(num))

print("\\n=== 6. 查找元素：找到/没找到 ===")
def find_item(lst, target):
    """在列表中找目标，返回位置"""
    for idx, item in enumerate(lst):
        if item == target:
            print(f"    找到了！在位置{idx}")
            return idx
    else:
        print(f"    没找到 {target}")
        return -1

fruits = ["苹果", "香蕉", "橙子", "葡萄"]
find_item(fruits, "橙子")
find_item(fruits, "西瓜")

print("\\n=== 7. 登录重试例子 ===")
password = "secret"
attempts = ["wrong1", "wrong2", "secret", "wrong3"]
idx = 0
max_try = 3
try_count = 0
while idx < len(attempts) and try_count < max_try:
    pwd = attempts[idx]
    idx += 1
    try_count += 1
    print(f"  第{try_count}次尝试...")
    if pwd == password:
        print("  登录成功！")
        break
else:
    # while正常结束意味着try_count达到max_try且没有break
    print("  3次机会用完，登录失败")

print("\\n=== 8. 对比：用标志变量实现相同功能 ===")
def is_prime_flag(n):
    """用标志变量实现，不依赖else子句"""
    if n < 2:
        return False
    prime = True
    for i in range(2, n):
        if n % i == 0:
            prime = False
            break
    return prime

print("  用标志变量判断质数:")
for num in [2, 4, 7, 9]:
    print(f"    {num}: {is_prime_flag(num)}")

print("\\n=== 总结 ===")
print("- 循环else在 正常结束（无break）时执行")
print("- 循环被break打断时，else不执行")
print("- 典型用途：搜索/查找失败时的处理、判断质数")
print("- 本质是'循环完成了所有迭代都没break'的标志")
print("- 用不用看个人习惯，标志变量写法也能实现同样功能")`
  },
  {
    id: "py6-enumerate",
    group: "流程控制",
    icon: "#️⃣",
    title: "enumerate 枚举",
    content: `## enumerate 枚举

\`enumerate()\` 是 Python 内置函数，用于在遍历序列时**同时获取索引和值**。比用 \`range(len())\` 更优雅。

### 为什么需要 enumerate？

在遍历列表时，经常需要同时知道：
- 当前元素是什么
- 当前元素的索引（位置）

没有 enumerate 的写法：

\`\`\`python
# 水果列表
fruits = ["苹果", "香蕉", "橙子"]
# 用 range(len) 取下标遍历
for i in range(len(fruits)):
    # 同时打印下标和元素
    print(i, fruits[i])
\`\`\`

这种写法不够 Pythonic。

### enumerate 基本用法

\`\`\`python
for 索引, 值 in enumerate(序列):
    # 循环体，使用索引和值
    ...
\`\`\`

例子：

\`\`\`python
# 水果列表
fruits = ["苹果", "香蕉", "橙子"]
# enumerate 同时取下标和元素
for i, fruit in enumerate(fruits):
    # 打印序号和水果名
    print(f"第{i+1}个水果是{fruit}")
\`\`\`

### 指定起始索引

enumerate 默认从 0 开始计数，可以通过 \`start\` 参数指定起始值：

\`\`\`python
# start=1 让序号从 1 开始
for i, fruit in enumerate(fruits, start=1):
    # 打印序号和水果
    print(f"{i}. {fruit}")
# 输出：
# 1. 苹果
# 2. 香蕉
# 3. 橙子
\`\`\`

### enumerate 返回什么？

enumerate 返回一个 enumerate 对象（迭代器），每次产出 \`(索引, 值)\` 的元组：

\`\`\`python
# enumerate 把序列转成 (下标, 元素) 列表
list(enumerate(["a", "b", "c"]))
# [(0, 'a'), (1, 'b'), (2, 'c')]
\`\`\`\`

### 常见使用场景

1. **打印带序号的列表**
2. **需要知道元素位置时**（查找位置、修改特定位置）
3. **记录遍历进度**

### enumerate vs range(len)

| 方式 | 优点 | 缺点 |
|------|------|------|
| \`enumerate(lst)\` | 简洁、Pythonic、不容易出错 | 需要同时获取索引和值时 |
| \`range(len(lst))\` | 熟悉 | 繁琐、不够优雅 |
| \`for item in lst\` | 最简单 | 拿不到索引 |

**结论**：需要索引和值时，首选 enumerate！

### 注意事项

- enumerate 不会修改原列表
- start 参数只是改变计数的起始数字，不影响遍历从哪个元素开始
- enumerate 可以用于任何可迭代对象（列表、元组、字符串等）`,
    code: `# enumerate 枚举演示

print("=== 1. 基本 enumerate：索引+值 ===")
fruits = ["苹果", "香蕉", "橙子", "葡萄"]
print("水果列表:")
for i, fruit in enumerate(fruits):
    print(f"  索引{i}: {fruit}")

print("\\n=== 2. 指定 start 参数（从1开始编号）===")
print("待办清单:")
todos = ["写代码", "吃饭", "睡觉"]
for idx, todo in enumerate(todos, start=1):
    print(f"  {idx}. {todo}")

print("\\n=== 3. 对比：range(len()) vs enumerate ===")
colors = ["红", "绿", "蓝"]
print("老写法（range+len）:")
for i in range(len(colors)):
    print(f"  {i}: {colors[i]}")
print("新写法（enumerate，推荐）:")
for i, color in enumerate(colors):
    print(f"  {i}: {color}")

print("\\n=== 4. enumerate 字符串 ===")
word = "Python"
print(f"遍历 '{word}' 的每个字符及位置:")
for pos, ch in enumerate(word):
    print(f"  位置{pos}: '{ch}'")

print("\\n=== 5. 实用例子：找第一个负数的位置 ===")
numbers = [3, 7, 2, -5, 8, -1]
print("数字列表:", numbers)
for idx, num in enumerate(numbers):
    if num < 0:
        print(f"第一个负数在位置{idx}，值为{num}")
        break

print("\\n=== 6. 实用例子：带序号的选项菜单 ===")
options = ["开始游戏", "读取存档", "设置", "退出"]
print("=== 游戏菜单 ===")
for i, opt in enumerate(options, start=1):
    print(f"  {i}. {opt}")
# 模拟用户选择
choice = 2
if 1 <= choice <= len(options):
    print(f"你选择了: {options[choice-1]}")

print("\\n=== 7. enumerate 可以转换为列表查看结果 ===")
result = list(enumerate(["a", "b", "c"], start=10))
print("list(enumerate(['a','b','c'], start=10)):")
print(" ", result)
# 每个元素是 (索引, 值) 的元组

print("\\n=== 8. 实用例子：同时修改列表元素 ===")
scores = [85, 92, 78, 90, 65]
print("原始分数:", scores)
# 给每个人加5分加分
for i, score in enumerate(scores):
    scores[i] = score + 5
print("加5分后:", scores)
# 或者更Pythonic的写法：scores = [s + 5 for s in scores]

print("\\n=== 9. 带进度的处理 ===")
data = list(range(1, 11))  # 模拟10条数据
total = len(data)
for i, item in enumerate(data, start=1):
    # 模拟处理数据
    if i % 3 == 0 or i == total:
        print(f"  处理进度: {i}/{total} ({i/total*100:.0f}%)")

print("\\n=== 总结 ===")
print("- 遍历同时需要索引和值 → 用 enumerate")
print("- enumerate(iterable, start=0)")
print("- 比 range(len()) 更简洁优雅")
print("- 任何可迭代对象都能用 enumerate")`
  },
  {
    id: "py6-zip",
    group: "流程控制",
    icon: "🔗",
    title: "zip 并行迭代",
    content: `## zip 并行迭代

\`zip()\` 用于**同时遍历多个可迭代对象**，把多个序列中对应位置的元素配对。

### 为什么需要 zip？

有时我们有多个相关的列表，需要同时遍历它们。比如：
- 学生姓名列表 + 对应成绩列表
- x坐标列表 + y坐标列表

没有 zip 的写法（需要用索引）：

\`\`\`python
# 姓名列表
names = ["小明", "小红"]
# 分数列表
scores = [95, 88]
# 用下标同时访问两个列表
for i in range(len(names)):
    # 打印姓名和对应分数
    print(names[i], scores[i])
\`\`\`

用 zip 更简洁。

### zip 基本用法

\`\`\`python
for item1, item2, ... in zip(序列1, 序列2, ...):
    # 循环体，使用多个序列的元素
    ...
\`\`\`

例子：

\`\`\`python
# 姓名列表
names = ["小明", "小红", "小刚"]
# 分数列表
scores = [95, 88, 76]
# zip 配对同时遍历两个列表
for name, score in zip(names, scores):
    # 打印姓名和分数
    print(f"{name}: {score}分")
\`\`\`

### zip 做了什么？

zip 把多个序列"拉链"一样配对起来：

\`\`\`
names:  ["小明", "小红", "小刚"]
scores: [95,     88,     76]
           ↓       ↓       ↓
zip:   ("小明",95) ("小红",88) ("小刚",76)
\`\`\`

结果是元组的序列。

### 长度不一致时

zip 以**最短的**序列为准，长的部分会被截断：

\`\`\`python
# 较长的列表
a = [1, 2, 3]
# 较短的列表
b = ["a", "b"]
list(zip(a, b))  # [(1, 'a'), (2, 'b')] —— 3被丢弃了
\`\`\`

如果不想截断，可以用 \`itertools.zip_longest()\`。

### strict 参数（Python 3.10+）

默认 zip 会**静默截断**长序列，这可能隐藏 bug。Python 3.10 新增了 \`strict=True\` 参数，当序列长度不一致时**抛出 ValueError**：

\`\`\`python
# strict=True：长度不一致时报错，避免数据丢失
list(zip([1, 2, 3], ["a", "b"], strict=True))
# ValueError: zip() argument 2 is shorter than argument 1

# strict=False（默认）：静默截断
list(zip([1, 2, 3], ["a", "b"]))
# [(1, 'a'), (2, 'b')] —— 3 被丢弃，无警告
\`\`\`

建议：如果你期望两个序列等长，加上 \`strict=True\` 更安全！

### itertools.zip_longest：不截断，用默认值填充

\`\`\`python
from itertools import zip_longest

# 长度不一致时，短的用 fillvalue 填充（默认 None）
list(zip_longest([1, 2, 3], ["a", "b"], fillvalue="?"))
# [(1, 'a'), (2, 'b'), (3, '?')] —— 不截断，3 配上了 '?'
\`\`\`

### zip 创建字典

zip 可以方便地从两个列表创建字典：

\`\`\`python
# 键列表
keys = ["name", "age", "city"]
# 值列表
values = ["小明", 18, "北京"]
# zip 配对后用 dict 转字典
d = dict(zip(keys, values))
# {'name': '小明', 'age': 18, 'city': '北京'}
\`\`\`

### zip 解压（反向操作）

用 \`zip(*zipped)\` 可以把配对的数据"解压"回来：

\`\`\`python
# 键值对列表
pairs = [("小明", 95), ("小红", 88)]
# zip(*...) 解包并转置，分离姓名和分数
names, scores = zip(*pairs)
# names = ("小明", "小红"), scores = (95, 88)
\`\`\`

### enumerate vs zip

- \`enumerate\`：一个序列，同时拿索引和值
- \`zip\`：多个序列，同时拿各序列对应位置的值

两者也可以结合使用！

\`\`\`python
# 同时取下标和配对值
for i, (name, score) in enumerate(zip(names, scores)):
    # 打印三者
    print(i, name, score)
\`\`\``,
    code: `# zip 并行迭代演示

print("=== 1. 基本zip：同时遍历两个列表 ===")
names = ["小明", "小红", "小刚", "小丽"]
scores = [95, 88, 76, 92]
print("姓名列表:", names)
print("成绩列表:", scores)
print("\\n并行遍历结果:")
for name, score in zip(names, scores):
    print(f"  {name}: {score}分")

print("\\n=== 2. zip三个列表 ===")
products = ["苹果", "香蕉", "橙子"]
prices = [5.99, 3.50, 4.80]
stocks = [100, 200, 50]
print(f"{'商品':<6}{'单价':<8}{'库存':<6}")
print("-" * 20)
for prod, price, stock in zip(products, prices, stocks):
    print(f"{prod:<6}￥{price:<6.2f}{stock:<6}斤")

print("\\n=== 3. zip长度不一致：以短的为准 ===")
a = [1, 2, 3, 4, 5]
b = ["a", "b", "c"]
print(f"列表a: {a} (长度{len(a)})")
print(f"列表b: {b} (长度{len(b)})")
print("zip结果:")
for x, y in zip(a, b):
    print(f"  ({x}, '{y}')")
print("注意：a中后面的4和5被丢弃了")

print("\\n=== 3b. strict=True：长度不等时报错（Python 3.10+）===")
print("zip([1,2,3], ['a','b'], strict=True) 会抛 ValueError:")
try:
    list(zip([1, 2, 3], ["a", "b"], strict=True))
except ValueError as e:
    print(f"  ValueError: {e}")
print("  → 期望等长时加 strict=True 可避免数据丢失")

print("\\n=== 3c. zip_longest：不截断，用默认值填充 ===")
from itertools import zip_longest
a = [1, 2, 3]
b = ["a", "b"]
result = list(zip_longest(a, b, fillvalue="?"))
print(f"zip_longest({a}, {b}, fillvalue='?'):")
print(f"  {result}")
print("  → 短的用 fillvalue 填充，不丢数据")

print("\\n=== 4. 用zip创建字典 ===")
keys = ["姓名", "年龄", "城市", "职业"]
values = ["张三", 25, "上海", "工程师"]
person = dict(zip(keys, values))
print("keys:", keys)
print("values:", values)
print("dict(zip(keys, values)):")
for k, v in person.items():
    print(f"  {k}: {v}")

print("\\n=== 5. zip解压：把配对数据还原 ===")
pairs = [("小明", 95), ("小红", 88), ("小刚", 76)]
print("配对数据:", pairs)
names_back, scores_back = zip(*pairs)  # 注意*号
print("解压后names:", names_back)
print("解压后scores:", scores_back)

print("\\n=== 6. enumerate和zip结合 ===")
subjects = ["语文", "数学", "英语"]
scores1 = [85, 92, 78]
scores2 = [90, 88, 95]
print("两科成绩对比:")
print(f"{'序号':<4}{'科目':<6}{'小明':<6}{'小红':<6}")
for i, (subj, s1, s2) in enumerate(zip(subjects, scores1, scores2), start=1):
    print(f"{i:<4}{subj:<6}{s1:<6}{s2:<6}")

print("\\n=== 7. zip转列表查看内部结构 ===")
list1 = [1, 2, 3]
list2 = ["x", "y", "z"]
zipped = list(zip(list1, list2))
print("list(zip([1,2,3], ['x','y','z'])):")
print(" ", zipped)
# 每个元素是元组

print("\\n=== 8. 实用例子：计算点之间的距离 ===")
x_coords = [0, 3, 5]
y_coords = [0, 4, 12]
print("坐标点:")
for i, (x, y) in enumerate(zip(x_coords, y_coords), start=1):
    dist = (x**2 + y**2) ** 0.5
    print(f"  点{i}: ({x}, {y}), 到原点距离: {dist:.1f}")

print("\\n=== 9. 同时遍历字典的键和值（items()本质类似zip）===")
student = {"姓名": "小明", "年龄": 18, "成绩": 95}
# dict.items()已经是键值对了，不需要zip
print("学生信息:")
for key, value in student.items():
    print(f"  {key}: {value}")

print("\\n=== 总结 ===")
print("- zip(*iterables) 并行遍历多个序列")
print("- 返回元组，对应位置元素配对")
print("- 长度不一致时以最短的为准（静默截断）")
print("- strict=True（3.10+）长度不等时报错，更安全")
print("- zip_longest 不截断，用 fillvalue 填充")
print("- dict(zip(keys, values)) 方便创建字典")
print("- zip(*pairs) 可以解压（还原）")
print("- 可以和enumerate组合使用")`
  },
  {
    id: "py6-loop-techniques",
    group: "流程控制",
    icon: "🎪",
    title: "实用循环技巧（逆序/排序/去重）",
    content: `## 实用循环技巧

这一章总结 Python 循环中常用的技巧和模式，让你的代码更简洁、更 Pythonic。

### 1. 逆序遍历

#### 方法1：reversed()

\`\`\`python
# reversed 倒序遍历 range
for i in reversed(range(1, 6)):
    print(i)  # 5, 4, 3, 2, 1
\`\`\`

#### 方法2：range 负步长

\`\`\`python
# 用负步长倒序遍历
for i in range(5, 0, -1):
    print(i)  # 5, 4, 3, 2, 1
\`\`\`

reversed() 不修改原序列，返回一个反向迭代器。

### 2. 排序后遍历

#### sorted() 返回排序后的新列表

\`\`\`python
# 水果列表（无序）
fruits = ["banana", "apple", "cherry"]
# sorted 返回排序后的新列表
for fruit in sorted(fruits):
    print(fruit)  # apple, banana, cherry
\`\`\`

- \`sorted(iterable)\`：升序
- \`sorted(iterable, reverse=True)\`：降序
- \`sorted(iterable, key=函数)\`：按指定规则排序

#### sorted 不改变原列表

### 3. 去重遍历

如果列表中有重复元素，想只遍历不重复的：

#### 方法1：转 set

\`\`\`python
# 遍历去重后的集合
for item in set([1, 2, 2, 3, 3, 3]):
    print(item)  # 顺序可能变
\`\`\`

⚠️ set 会**打乱顺序**！

#### 方法2：保持顺序去重

\`\`\`python
# 用集合记录已见过的元素
seen = set()
# 遍历原始列表
for item in original_list:
    # 若元素未见过
    if item not in seen:
        # 记录到集合
        seen.add(item)
        # 打印（实现去重）
        print(item)
\`\`\`

### 4. 遍历字典

\`\`\`python
d = {"a": 1, "b": 2}
for key in d:              # 遍历键
for value in d.values():   # 遍历值
for key, value in d.items():  # 遍历键值对
\`\`\`

### 5. 同时获取索引和值

用 \`enumerate()\`（前面章节讲过）。

### 6. 同时遍历多个序列

用 \`zip()\`（前面章节讲过）。

### 7. 循环中修改列表的坑

遍历列表时**不要直接修改列表**（增删元素），容易出问题：

\`\`\`python
# 危险！可能跳过元素或出错
# 遍历列表
for item in lst:
    # 满足条件
    if some_condition:
        # 边遍历边删除，易出错
        lst.remove(item)
\`\`\`

正确做法：
- 遍历副本：\`for item in lst.copy():\`
- 用列表推导式创建新列表
- 倒序遍历删除

### 8. 列表推导式

循环生成新列表的简洁写法：

\`\`\`python
# 列表推导式生成 0-9 的平方数列表
squares = [i**2 for i in range(10)]
# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
\`\`\`

后面数据结构章节会详细讲。`,
    code: `# 实用循环技巧演示

print("=== 1. 逆序遍历 ===")
print("reversed() 逆序:")
for i in reversed(range(1, 6)):
    print(i, end=" ")
print()

print("range负步长逆序:")
for i in range(5, 0, -1):
    print(i, end=" ")
print()

# 逆序遍历列表
fruits = ["苹果", "香蕉", "橙子"]
print("逆序遍历水果:")
for fruit in reversed(fruits):
    print(" ", fruit)
print("原列表没变:", fruits)

print("\\n=== 2. 排序后遍历 ===")
scores = [85, 92, 78, 90, 65, 88]
print("原顺序:", scores)
print("升序遍历:")
for s in sorted(scores):
    print(" ", s, end="")
print()
print("降序遍历:")
for s in sorted(scores, reverse=True):
    print(" ", s, end="")
print()

# 按字符串长度排序
words = ["python", "is", "awesome", "hi"]
print("\\n按长度排序:")
for w in sorted(words, key=len):
    print(f"  '{w}' (长度{len(w)})")

print("\\n=== 3. 去重遍历 ===")
numbers = [1, 2, 2, 3, 3, 3, 2, 1, 4]
print("原列表:", numbers)

# 方法1：转set（顺序不保证）
print("方法1（set去重，顺序可能乱）:")
for n in set(numbers):
    print(" ", n, end="")
print()

# 方法2：保持顺序去重
print("方法2（保持顺序）:")
seen = set()
unique_ordered = []
for n in numbers:
    if n not in seen:
        seen.add(n)
        unique_ordered.append(n)
print(" ", unique_ordered)

print("\\n=== 4. 字典遍历技巧 ===")
student = {"姓名": "小明", "年龄": 18, "成绩": 95, "城市": "北京"}
print("字典内容:", student)
print("\\n遍历键:")
for k in student:
    print(" ", k, end="")
print()
print("遍历值:")
for v in student.values():
    print(" ", v, end="")
print()
print("遍历键值对:")
for k, v in student.items():
    print(f"  {k}: {v}")

print("\\n=== 5. 遍历的同时安全删除元素 ===")
nums = [1, -2, 3, -4, 5, -6]
print("原列表:", nums)
# 错误写法（遍历中删除会跳过元素）：
# for n in nums:
#     if n < 0:
#         nums.remove(n)
# 正确写法1：遍历副本
for n in nums.copy():
    if n < 0:
        nums.remove(n)
print("删除负数后:", nums)

nums2 = [1, -2, 3, -4, 5, -6]
# 正确写法2：列表推导式（最推荐）
nums2_positive = [n for n in nums2 if n >= 0]
print("列表推导式结果:", nums2_positive)

print("\\n=== 6. 找出最大/最小值及其位置 ===")
data = [45, 22, 89, 33, 89, 15]
print("数据:", data)
max_val = max(data)
min_val = min(data)
print(f"最大值: {max_val}, 最小值: {min_val}")
print("最大值出现位置:", [i for i, v in enumerate(data) if v == max_val])

print("\\n=== 7. 生成统计信息 ===")
scores = [85, 92, 78, 90, 65, 88, 95, 72]
print("分数列表:", scores)
total = 0
highest = scores[0]
lowest = scores[0]
pass_count = 0
for s in scores:
    total += s
    if s > highest:
        highest = s
    if s < lowest:
        lowest = s
    if s >= 60:
        pass_count += 1
avg = total / len(scores)
print(f"总分: {total}, 平均分: {avg:.1f}")
print(f"最高: {highest}, 最低: {lowest}")
print(f"及格人数: {pass_count}/{len(scores)}")

print("\\n=== 8. 列表推导式：简洁的循环生成列表 ===")
# 生成平方数
squares = [i * i for i in range(1, 11)]
print("1-10的平方:", squares)
# 带条件：只要偶数的平方
even_squares = [i * i for i in range(1, 11) if i % 2 == 0]
print("偶数的平方:", even_squares)
# 字符串处理
words = ["hello", "world", "python"]
upper_words = [w.upper() for w in words]
print("大写:", upper_words)`
  },
  {
    id: "py6-truthy-falsy",
    group: "流程控制",
    icon: "✅❌",
    title: "真值与假值深入",
    content: `## 真值与假值深入

之前我们简单提过真值和假值，这一章深入理解 Python 中"什么是真，什么是假"。这对写出简洁优雅的条件判断非常重要。

### 假值（Falsy）—— 这些都等于 False

在 Python 中，以下值在布尔上下文中被当作 \`False\`：

| 类型 | 假值 |
|------|------|
| 布尔 | \`False\` |
| 空值 | \`None\` |
| 整数 | \`0\` |
| 浮点数 | \`0.0\` |
| 复数 | \`0j\` |
| 字符串 | \`""\`（空字符串）|
| 列表 | \`[]\`（空列表）|
| 元组 | \`()\`（空元组）|
| 字典 | \`{}\`（空字典）|
| 集合 | \`set()\`（空集合）|
| 范围 | \`range(0)\` |
| 自定义对象 | 如果定义了 \`__bool__()\` 返回False或\`__len__()\`返回0 |

除此之外的**所有值都是 True**（真值，Truthy）。

### 容易搞错的真值

这些值虽然看起来"像假的"，但实际上是 **True**：

- 非零数字（即使是负数）：\`-1\`, \`0.0001\` 都是 True
- 非空字符串：\`"0"\`, \`"False"\`, \`"false"\`, \`"None"\`, \`" "\`（空格字符串）都是 True
- 非空容器：\`[0]\`, \`[""]\` 都是 True（虽然里面的元素是假值，但容器本身非空）；而 \`{}\`（空字典）是 False——\`{"": None}\` 是 True，因为不是空字典
- 任何自定义类的实例默认都是 True

\`\`\`python
bool("0")       # True！字符串"0"非空
bool("False")   # True！字符串"False"非空
bool(-1)        # True！非零
bool([0])       # True！列表非空（虽然里面是0）
bool(" ")       # True！空格也是字符
\`\`\`

### 利用真值写简洁条件

#### 1. 判断字符串是否为空

\`\`\`python
# 啰嗦写法
if name != "":
    ...
# Pythonic写法
if name:
    ...
\`\`\`

#### 2. 判断列表是否为空

\`\`\`python
# 啰嗦写法
if len(items) != 0:
    ...
# Pythonic写法
if items:
    ...
\`\`\`

#### 3. 判断数字是否为0

\`\`\`python
# 把 count 当布尔值判断
if count:
    # count不为0时
else:
    # count为0时
\`\`\`

⚠️ 但注意：如果变量可能是 None，要区分"None"和"0/空"的话，要明确判断：

\`\`\`python
# 可能有歧义（None和0都是假值）
# 隐式判断，None 和 0 都被视为假
if data:
# 明确判断是否为None
# 明确判断非 None
if data is not None:
\`\`\`

### or 提供默认值

利用真值可以给变量设置默认值：

\`\`\`python
# 用 or 提供默认值
name = user_input or "匿名"
# 如果user_input是假值（空字符串、None等），使用"匿名"
\`\`\`

### any() 和 all()

- \`any(iterable)\`：有一个为True就返回True
- \`all(iterable)\`：所有都为True才返回True

\`\`\`python
# any 任一为真即返回真
any([0, 0, 1, 0])  # True
# all 全部为真才返回真
all([1, 1, 1, 0])  # False
\`\`\``,
    code: `# 真值与假值深入演示

print("=== 1. 假值一览表 ===")
falsy_values = [
    ("False", False),
    ("None", None),
    ("0（整数）", 0),
    ("0.0（浮点数）", 0.0),
    ("0j（复数）", 0j),
    ('""（空字符串）', ""),
    ("[]（空列表）", []),
    ("()（空元组）", ()),
    ("{}（空字典）", {}),
    ("set()（空集合）", set()),
]
print("以下值的bool()都是False：")
for desc, val in falsy_values:
    print(f"  bool({desc}) = {bool(val)}")

print("\\n=== 2. 容易搞错的真值（都是True！）===")
tricky_values = [
    '-1（负整数）', -1,
    '0.0001（非零小数）', 0.0001,
    '"0"（字符串0）', "0",
    '"False"（字符串False）', "False",
    '" "（空格字符串）', " ",
    '[0]（含0的列表）', [0],
    '[""]（含空串的列表）', [""],
]
for i in range(0, len(tricky_values), 2):
    desc = tricky_values[i]
    val = tricky_values[i + 1]
    print(f"  bool({desc}) = {bool(val)}")

print("\\n=== 3. Pythonic 条件判断写法 ===")

# 判断空字符串
name1 = ""
name2 = "小明"
print("名字1:", repr(name1), end=" → ")
if name1:
    print("有名字")
else:
    print("名字为空")
print("名字2:", repr(name2), end=" → ")
if name2:
    print("有名字")
else:
    print("名字为空")

# 判断空列表
cart1 = []
cart2 = ["苹果", "香蕉"]
print("购物车1有", len(cart1), "件商品 →", "空" if not cart1 else "有商品")
print("购物车2有", len(cart2), "件商品 →", "空" if not cart2 else "有商品")

print("\\n=== 4. or 提供默认值 ===")
# 如果用户输入为空（假值），使用默认值
user_inputs = ["", "张三", None, "李四"]
for inp in user_inputs:
    name = inp or "匿名用户"
    print(f"  输入{repr(inp)} → 名字: {name}")

print("\\n=== 5. and/or 短路求值与真值 ===")
# and 返回第一个假值，或最后一个真值
# or 返回第一个真值，或最后一个假值
print("0 and 5 =", 0 and 5, "（0是假值，直接返回0）")
print("3 and 5 =", 3 and 5, "（3是真值，继续看5，返回5）")
print("0 or 5 =", 0 or 5, "（0是假值，继续看5，返回5）")
print("3 or 5 =", 3 or 5, "（3是真值，直接返回3）")
print("'' or '默认' =", repr("" or "默认"))
print("'已有值' or '默认' =", repr("已有值" or "默认"))

print("\\n=== 6. any() 和 all() ===")
def truthy_count(lst):
    """统计列表中真值的个数"""
    true_count = sum(1 for x in lst if x)
    return true_count, len(lst)

# any()：有一个True就True
tests = [
    ([0, 0, 0], "全0"),
    ([0, 1, 0], "含一个非零"),
    ([False, None, ""], "全假值"),
    ([False, 1, ""], "混合"),
]
print("any()：是否至少一个为真")
for lst, desc in tests:
    print(f"  {desc}: any={any(lst)}")

print("\\nall()：是否全部为真")
tests2 = [
    ([1, 2, 3], "全非零数字"),
    ([1, 0, 3], "包含0"),
    (["a", "b", ""], "包含空串"),
    ([True, 1, "hi"], "全真"),
]
for lst, desc in tests2:
    print(f"  {desc}: all={all(lst)}")

print("\\n=== 7. 实用例子：表单验证 ===")
def validate_form(username, password, email):
    """验证表单，所有字段都非空才通过"""
    errors = []
    if not username:
        errors.append("用户名不能为空")
    if not password:
        errors.append("密码不能为空")
    if not email:
        errors.append("邮箱不能为空")
    if len(password) < 6 and password:  # 有密码但太短
        errors.append("密码至少6位")
    return errors

# 测试
cases = [
    ("", "", ""),
    ("admin", "123", "a@b.com"),
    ("admin", "123456", "a@b.com"),
]
for uname, pwd, mail in cases:
    errs = validate_form(uname, pwd, mail)
    status = "❌ 不通过" if errs else "✅ 通过"
    print(f"  {uname}/{pwd}/{mail}: {status}")
    for e in errs:
        print(f"    - {e}")

print("\\n=== 8. 注意：要区分None和0/空时要明确 ===")
value = 0
# 这个写法分不清是None还是0
if value:
    print("值存在（其实0时这不会执行！）")
else:
    print("值不存在或为0/空")
# 如果0是有效值，应该明确判断
if value is not None:
    print(f"值存在，是{value}（即使是0也是有效数据）")
else:
    print("值是None")`
  },
  {
    id: "py6-short-circuit",
    group: "流程控制",
    icon: "⚡",
    title: "短路求值原理",
    content: `## 短路求值原理

**短路求值**（Short-circuit evaluation）是指逻辑运算符 \`and\` 和 \`or\` 在计算时，只要能确定结果就不再计算后面的表达式。

### and 的短路规则

\`A and B\`：
- 如果 A 是**假值**，直接返回 A（不需要看B，结果一定是假）
- 如果 A 是**真值**，返回 B（结果取决于B）

\`\`\`python
0 and print("这句不会打印")  # 0是假值，直接返回0，print不执行
1 and print("这句会打印")    # 1是真值，继续看B，print执行
\`\`\`

### or 的短路规则

\`A or B\`：
- 如果 A 是**真值**，直接返回 A（不需要看B，结果一定是真）
- 如果 A 是**假值**，返回 B（结果取决于B）

\`\`\`python
1 or print("这句不会打印")   # 1是真值，直接返回1，print不执行
0 or print("这句会打印")     # 0是假值，继续看B，print执行
\`\`\`

### 短路求值的意义

1. **提高效率**：不需要的计算不做
2. **避免错误**：可以做"安全检查"后再操作

### 经典用法：安全访问/避免除零

\`\`\`python
# 先检查分母不为0，再做除法（避免ZeroDivisionError）
# 短路：分母非 0 才计算除法
denominator != 0 and numerator / denominator

# 先判断对象不是None，再访问属性
# 短路：对象非 None 才访问属性
obj is not None and obj.value
\`\`\`

但这种写法太技巧化，用 if 语句更清晰。

### 经典用法：设置默认值

\`\`\`python
# 用 or 给空输入提供默认值
name = user_input or "匿名"
# user_input为空时，用"匿名"作为默认值
\`\`\`

### and/or 返回值不一定是布尔值

Python 的 and/or **返回的是实际的操作数**，不是布尔值 True/False：

\`\`\`python
# and 规则：A为假返回A，A为真返回B（返回操作数本身，不是布尔值）
3 and 5      # 3为真 → 返回B=5（不是True！）
0 and 5      # 0为假 → 直接返回A=0（不是False！）
# or 规则：A为真返回A，A为假返回B
3 or 5       # 3为真 → 直接返回A=3
0 or 5       # 0为假 → 返回B=5
"" or "默认" # ""为假 → 返回B="默认"（常用于设置默认值）
\`\`\`

这个特性让 and/or 可以做很多有用的事情，但在 if 语句中，返回值会被自动转成布尔值判断。

### 链式短路

多个 and/or 连在一起也遵循短路规则：

\`\`\`python
# 有一个假值就停
# and 链：遇到假值即停止
a and b and c and d
# 找到第一个真值就停
# or 链：遇到真值即停止
a or b or c or d
\`\`\`

### 常见陷阱

1. **有副作用的表达式放在 and/or 后面**：如果短路了，后面代码不执行！

\`\`\`python
# 危险：如果condition是False，函数不会被调用
# 用 and 触发函数调用，可读性差
condition and do_something()

# 更清晰的写法
# 条件成立
if condition:
    # 调用函数，更清晰
    do_something()
\`\`\`

2. **以为 and/or 返回布尔值**：其实返回的是操作数本身

\`\`\`python
result = x and y  # result可能不是True/False！
\`\`\``,
    code: `# 短路求值原理演示

print("=== 1. and 短路：左边为假，右边不执行 ===")
def check_and(name):
    print(f"  检查{name}...")
    return True

# 第一个是假值(0)，直接返回0，后面的函数不调用
print("测试: 0 and check_and('A') and check_and('B')")
result = 0 and check_and("A") and check_and("B")
print(f"结果: {result}")
print("（注意：check_and没有被调用，因为短路了）")

print("\\n=== 2. and 短路：左边为真，继续看右边 ===")
print("测试: 1 and check_and('A') and check_and('B')")
result = 1 and check_and("A") and check_and("B")
print(f"结果: {result}")
print("（前面都是真，一直执行到最后）")

print("\\n=== 3. or 短路：左边为真，右边不执行 ===")
print("测试: 1 or check_and('A') or check_and('B')")
result = 1 or check_and("A") or check_and("B")
print(f"结果: {result}")
print("（1是真值，直接返回，后面不执行）")

print("\\n=== 4. or 短路：左边为假，继续看右边 ===")
print("测试: 0 or check_and('A') or check_and('B')")
result = 0 or check_and("A") or check_and("B")
print(f"结果: {result}")
print("（0是假值，继续往后找真值）")

print("\\n=== 5. and/or 返回的是操作数本身（不一定是布尔值）===")
print("3 and 5 =", repr(3 and 5), "（返回最后一个真值）")
print("0 and 5 =", repr(0 and 5), "（返回第一个假值）")
print("3 or 5 =", repr(3 or 5), "（返回第一个真值）")
print("0 or 5 =", repr(0 or 5), "（返回最后那个值）")
print('"hello" and "world" =', repr("hello" and "world"))
print('"" or "默认值" =', repr("" or "默认值"))
print("None or 0 or [] or '最终' =", repr(None or 0 or [] or "最终"))

print("\\n=== 6. 实用：设置默认值 ===")
def greet(name=None):
    # 如果name是None/空字符串，使用"朋友"
    display_name = name or "朋友"
    print(f"你好，{display_name}！")

greet()
greet("小明")
greet("")  # 空字符串是假值，也会用默认值

print("\\n=== 7. 实用：避免除零错误 ===")
def safe_divide(a, b):
    """安全除法：b为0时返回None而非报错"""
    # b不为0时才计算除法
    return b != 0 and a / b

print(f"10 / 2 = {safe_divide(10, 2)}")
print(f"10 / 0 = {safe_divide(10, 0)}（返回假值而非报错）")

print("\\n=== 8. 实用：链式条件检查 ===")
# 检查多个条件时，前面不满足就不检查后面
age = 16
has_id = True
has_ticket = True
can_enter = age >= 18 and has_id and has_ticket
print(f"年龄{age}，有ID={has_id}，有票={has_ticket}")
print(f"能入场吗？{can_enter}")
print("（年龄不够，has_id和has_ticket根本不会被判断）")

print("\\n=== 9. all() 和 any() 本质也是短路 ===")
# 注意：不能用列表字面量演示短路！因为列表在创建时所有元素就已经被求值
# 正确做法：用生成器函数，每次 yield 时打印，才能看到短路在哪里停止
def trace_gen(name, values):
    """生成器：每次产出值前先打印，用来观察短路位置"""
    for v in values:
        print(f"    [{name}] 检查 {v!r}...")
        yield v

# any()遇到第一个真值就停，后面的不会yield
print("any()演示（遇到第一个真值即停止）：")
result = any(trace_gen("any", [0, False, None, "", "找到我了", "不会到这里"]))
print(f"  any结果: {result}")

# all()遇到第一个假值就停，后面的不会yield
print("\\nall()演示（遇到第一个假值即停止）：")
result = all(trace_gen("all", [1, True, "hello", 0, "不会到这里"]))
print(f"  all结果: {result}")

print("\\n=== 10. 注意：有副作用的代码不要依赖短路顺序 ===")
counter = 0
def increment():
    global counter
    counter += 1
    return True

# 这种写法函数不一定被调用！
cond = False
x = cond and increment()  # cond是False，increment()不会执行
print(f"cond={cond}, counter={counter}（increment没执行）")

# 正确做法：如果需要函数一定执行，先调用
counter = 0
cond = False
increment()  # 确保执行
if cond:
    pass
print(f"cond={cond}, counter={counter}（increment已执行）")

print("\\n=== 总结 ===")
print("- A and B：A为假直接返回A，A为真返回B")
print("- A or B：A为真直接返回A，A为假返回B")
print("- 短路：确定结果后，后面的表达式不计算")
print("- 利用短路可以写默认值：name = input or '默认'")
print("- and/or返回操作数本身，不一定是布尔值")
print("- 有副作用的代码不要放在短路后面，可能不执行")
print("- 复杂逻辑用if比短路技巧更清晰")`
  },
  {
    id: "py6-assert",
    group: "流程控制",
    icon: "🔍",
    title: "assert 断言",
    content: `## assert 断言

\`assert\` 语句用于**调试检查**，在代码中设置"检查点"：如果条件不满足，立即抛出错误。

### 基本语法

\`\`\`python
# assert 语法：条件为假时抛 AssertionError
assert 条件, 错误信息（可选）
\`\`\`

等价于：

\`\`\`python
# assert 底层等价于以下代码（受 __debug__ 全局变量控制）
# __debug__ 在正常模式为 True，用 python -O 运行时为 False
if __debug__:                # 优化模式下 __debug__=False，整块代码被跳过
    if not 条件:             # 条件取反判断
        raise AssertionError(错误信息)  # 抛出断言异常，附带错误信息
\`\`\`

### 简单例子

\`\`\`python
# 年龄变量
age = 15
# 断言年龄不小于 18，否则报错
assert age >= 18, "必须年满18岁"
# AssertionError: 必须年满18岁
\`\`\`

条件为True时，assert什么都不做，程序继续。
条件为False时，抛出 \`AssertionError\`。

### assert 的用途

assert 主要用于：

1. **调试时验证假设**：确保程序运行到某步时某个条件一定成立
2. **检查参数合法性**：在函数开头检查传入参数
3. **检查不可能发生的情况**：作为"防御性编程"

### assert 不是用来处理用户错误的！

⚠️ **重要区别**：

- **assert**：用于**开发/调试阶段**发现程序员自己的错误
- **if+raise/异常处理**：用于**运行时**处理用户输入、外部数据等预期可能出错的情况

Python 可以用 \`-O\`（优化）参数运行，此时 **assert 会被完全移除**！所以：

❌ 错误用法：
\`\`\`python
assert user_input.is_valid(), "输入无效"  # 优化模式下这个检查没了！
\`\`\`

✅ 正确用法：
\`\`\`python
# 判断输入是否有效
if not user_input.is_valid():
    # 用 raise 抛异常，不会被优化掉
    raise ValueError("输入无效")  # 永远不会被优化掉
\`\`\`

### 常见使用场景

#### 1. 函数参数前置检查

\`\`\`python
# 定义开方函数
def calculate_square_root(x):
    # 断言参数非负
    assert x >= 0, "x不能是负数"
    # 返回平方根
    return x ** 0.5
\`\`\`

（但更正式的参数校验应该用 raise ValueError）

#### 2. 验证函数返回值

\`\`\`python
# 调用复杂计算
result = some_complex_calculation()
# 断言结果非 None
assert result is not None, "计算结果不应该是None"
\`\`\`

#### 3. 测试中

assert 在单元测试中大量使用：

\`\`\`python
# 断言加法结果为 3
assert add(1, 2) == 3
# 断言列表长度为 3
assert len([1,2,3]) == 3
\`\`\`

### assert 的消息

总是给 assert 加错误消息，方便定位问题：

\`\`\`python
# 断言用户列表非空，提示检查数据加载
assert len(users) > 0, "用户列表不应该为空，检查数据加载逻辑"
\`\`\``,
    code: `# assert 断言演示

print("=== 1. 基本 assert 用法 ===")
# 条件为True时，什么都不发生
x = 10
assert x > 0, "x应该是正数"
print(f"x={x}，assert通过了")

# 条件为False时，抛出AssertionError
# assert 2 + 2 == 5, "数学出错了！"  # 这行如果取消注释会报错

print("\\n=== 2. assert 用于函数参数检查 ===")
def calculate_avg(numbers):
    """计算平均值"""
    # 确保numbers不是空列表
    assert len(numbers) > 0, "列表不能为空，否则会除零错误"
    total = sum(numbers)
    return total / len(numbers)

print("calculate_avg([1,2,3,4,5]) =", calculate_avg([1, 2, 3, 4, 5]))
# calculate_avg([])  # 取消注释会抛出AssertionError

print("\\n=== 3. assert 验证程序逻辑（永远不该发生的情况）===")
def get_grade(score):
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    elif score >= 60:
        return "D"
    elif score >= 0:
        return "F"
    else:
        # 分数不应该是负数，如果走到这里说明前面逻辑错了
        assert False, f"无效分数: {score}"

print("get_grade(95):", get_grade(95))
print("get_grade(55):", get_grade(55))
# get_grade(-10)  # 会触发assert

print("\\n=== 4. assert 验证数据结构 ===")
user = {"name": "小明", "age": 18}
assert "name" in user, "用户必须有name字段"
assert "age" in user, "用户必须有age字段"
assert isinstance(user["age"], int), "age必须是整数"
assert user["age"] >= 0, "年龄不能为负"
print("用户数据验证通过:", user)

print("\\n=== 5. 对比：assert vs 真正的错误处理 ===")
print("assert：开发调试时用，帮助发现bug")
print("if+raise：处理运行时预期可能发生的错误（如用户输入）")

def divide(a, b):
    # 这里用raise而不是assert，因为用户可能传b=0
    if b == 0:
        raise ValueError("除数不能为0")
    return a / b

print("divide(10, 2) =", divide(10, 2))
try:
    divide(10, 0)
except ValueError as e:
    print(f"divide(10, 0) 错误: {e}")

print("\\n=== 6. assert 用于简单测试 ===")
def add(a, b):
    return a + b

def factorial(n):
    if n < 0:
        raise ValueError("负数没有阶乘")
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result

# 一系列assert作为测试用例
assert add(2, 3) == 5
assert add(-1, 1) == 0
assert add(0, 0) == 0
assert factorial(0) == 1
assert factorial(1) == 1
assert factorial(5) == 120
print("所有assert测试通过！")

print("\\n=== 7. 注意：-O 优化模式下assert会被移除 ===")
print("如果用 python -O script.py 运行，")
print("所有assert语句都会被当作不存在！")
print("所以assert不要用来做关键的数据校验，")
print("只能用于调试和开发阶段的检查。")

print("\\n=== 什么时候不该用assert？===")
print("❌ 不要用来验证用户输入（用户可能输错，不是bug）")
print("❌ 不要用来验证外部数据（文件、网络、数据库）")
print("❌ 不要用assert做业务逻辑的判断")
print("✅ 应该用来检查：程序员自己的错误（bug）")
print("✅ 应该用来检查：代码逻辑上不可能发生的情况")
print("✅ 应该用来：单元测试中的断言")
print("✅ 应该用来：开发时快速验证假设")`
  },
  {
    id: "py6-bitwise",
    group: "流程控制",
    icon: "💻",
    title: "位运算实际应用",
    content: `## 位运算实际应用

位运算是直接对二进制位进行操作的运算。虽然日常开发用得不多，但在某些场景下非常高效：权限控制、状态标记、算法优化、底层开发等。

### 复习：位运算符

| 运算符 | 名称 | 作用 | 例子（a=60=00111100, b=13=00001101）|
|--------|------|------|------|
| \`&\` | 按位与 | 两位都是1才是1 | a&b=12 (00001100) |
| \`|\` | 按位或 | 有一位是1就是1 | a\\|b=61 (00111101) |
| \`^\` | 按位异或 | 两位不同才是1 | a^b=49 (00110001) |
| \`~\` | 按位取反 | 0变1，1变0 | ~a=-61 |
| \`<<\` | 左移 | 向左移动n位，右边补0 | a<<2=240 (11110000) |
| \`>>\` | 右移 | 向右移动n位 | a>>2=15 (00001111) |

### 应用1：权限控制（经典！）

用一个整数的不同二进制位表示不同权限，非常节省空间：

\`\`\`python
# 每个权限占一个二进制位（互不冲突）
READ = 1 << 0    # 0001 = 1，读权限
WRITE = 1 << 1   # 0010 = 2，写权限
EXEC = 1 << 2    # 0100 = 4，执行权限
DELETE = 1 << 3  # 1000 = 8，删除权限

# 组合权限：用按位或 |（对应位都置1）
user_perm = READ | WRITE  # 0011 = 3，有读+写权限

# 检查权限：用按位与 &（对应位都为1才非0）
if user_perm & READ:      # 0011 & 0001 = 0001，非0 → 有读权限
    print("有读权限")

# 添加权限：用按位或 |（把对应位设为1）
user_perm = user_perm | EXEC  # 0011 | 0100 = 0111 = 7

# 移除权限：用按位与取反 & ~（把对应位设为0）
user_perm = user_perm & ~WRITE  # 0111 & ~0010 = 0111 & 1101 = 0101 = 5
\`\`\`

Linux文件权限（rwx=4+2+1=7）就是这个原理！

### 应用2：奇偶判断

\`x & 1\` 等于0是偶数，等于1是奇数（比 \`x%2 == 0\` 略快）：

\`\`\`python
# 用 x & 1 判断奇偶
if x & 1:
    # 打印奇数
    print("奇数")
else:
    # 打印偶数
    print("偶数")
\`\`\`

### 应用3：乘除法（2的幂次）

- \`x << n\` 等于 \`x * 2^n\`
- \`x >> n\` 等于 \`x // 2^n\`

\`\`\`python
# 左移 1 位相当于乘 2
5 << 1   # 10（=5*2）
# 左移 2 位相当于乘 4
5 << 2   # 20（=5*4）
# 右移 2 位相当于除 4
20 >> 2  # 5（=20//4）
\`\`\`

### 应用4：交换两个数（不用临时变量）

\`\`\`python
# 三次异或交换 a、b 第一步
a ^= b
# 第二步
b ^= a
# 第三步，完成交换
a ^= b
\`\`\`

（实际写代码建议用 \`a, b = b, a\`，更清晰）

### 应用5：找唯一不重复的数

数组中其他数都出现两次，只有一个出现一次，用异或：

\`\`\`python
# 累加器初始化为 0
result = 0
# 遍历所有数
for num in nums:
    # 异或：成对抵消，留下唯一值
    result ^= num
# result就是那个唯一的数
\`\`\`

原理：\`a^a=0\`，\`a^0=a\`，异或满足交换律和结合律。

### 应用6：判断2的幂

\`(x & (x-1)) == 0\` 则x是2的幂（注意括号，因为 \`==\` 优先级高于 \`&\`）：

\`\`\`python
# 注意：& 优先级低于 ==，必须加括号写成 (n & (n-1)) == 0
(8 & 7) == 0   # True, 8是2^3（8=1000, 7=0111, 按位与=0000）
(6 & 5) == 0   # False, 6不是2的幂（6=110, 5=101, 按位与=100=4，非0）
# ⚠️ 如果写成 8 & 7 == 0，会被解析为 8 & (7==0) 即 8 & False = 0，结果错误！
\`\`\``,
    code: `# 位运算实际应用演示

print("=== 1. 位运算符基本演示 ===")
a = 60  # 二进制: 0011 1100
b = 13  # 二进制: 0000 1101
print(f"a={a} (二进制 {a:08b})")
print(f"b={b} (二进制 {b:08b})")
print(f"a & b = {a&b:3} (二进制 {a&b:08b})  # 按位与")
print(f"a | b = {a|b:3} (二进制 {a|b:08b})  # 按位或")
print(f"a ^ b = {a^b:3} (二进制 {a^b:08b})  # 按位异或")
print(f"a << 2 = {a<<2:3} (二进制 {a<<2:08b})  # 左移2位（×4）")
print(f"a >> 2 = {a>>2:3} (二进制 {a>>2:08b})  # 右移2位（÷4）")

print("\\n=== 2. 应用：奇偶判断 ===")
for n in [0, 1, 2, 3, 4, 5, 100, 101]:
    # x & 1 结果为1是奇数，为0是偶数
    parity = "奇数" if n & 1 else "偶数"
    print(f"  {n} 是 {parity}")

print("\\n=== 3. 应用：用左移做乘2的幂 ===")
x = 5
print(f"x = {x}")
print(f"x << 1 = {x << 1}  (x*2 = {x*2})")
print(f"x << 2 = {x << 2}  (x*4 = {x*4})")
print(f"x << 3 = {x << 3}  (x*8 = {x*8})")
# 右移做整除2的幂
y = 80
print(f"y = {y}")
print(f"y >> 1 = {y >> 1}  (y//2 = {y//2})")
print(f"y >> 2 = {y >> 2}  (y//4 = {y//4})")

print("\\n=== 4. 应用：标志位/状态开关 ===")
# 用不同的二进制位表示不同状态
HAS_WATER = 1 << 0   # 0001 = 1 有水
HAS_FOOD = 1 << 1    # 0010 = 2 有食物
HAS_MAP = 1 << 2     # 0100 = 4 有地图
HAS_COMPASS = 1 << 3 # 1000 = 8 有指南针

# 初始装备：有水和食物
backpack = HAS_WATER | HAS_FOOD
print("背包状态（二进制）:", f"{backpack:04b}")

# 检查有没有某物品
print("有水吗？", bool(backpack & HAS_WATER))
print("有地图吗？", bool(backpack & HAS_MAP))

# 添加地图
backpack = backpack | HAS_MAP
print("拿到地图后（二进制）:", f"{backpack:04b}")
print("有地图吗？", bool(backpack & HAS_MAP))

# 水喝完了
backpack = backpack & ~HAS_WATER
print("水喝完后（二进制）:", f"{backpack:04b}")
print("有水吗？", bool(backpack & HAS_WATER))

# 计算有多少件物品（数1的个数）
count = bin(backpack).count("1")
print(f"现有物品数量: {count}")

print("\\n=== 5. 应用：权限控制（类似Linux）===")
READ = 4    # 100
WRITE = 2   # 010
EXEC = 1    # 001
# 权限组合: 7=111=rwx, 6=110=rw-, 5=101=r-x, 4=100=r--
perms = {
    "所有者": READ | WRITE | EXEC,  # 7
    "群组": READ | EXEC,           # 5
    "其他人": READ,                 # 4
}
for who, p in perms.items():
    r = "r" if p & READ else "-"
    w = "w" if p & WRITE else "-"
    x = "x" if p & EXEC else "-"
    print(f"  {who}: {r}{w}{x} (数值{p})")

print("\\n=== 6. 应用：找唯一不重复的数 ===")
# 数组中其他数都出现两次，只有一个出现一次
nums = [3, 5, 3, 7, 5, 1, 7]
print("数组:", nums)
result = 0
for num in nums:
    result ^= num  # 异或：a^a=0, a^0=a
print(f"唯一不重复的数是: {result}")
# 解释: 3^5^3^7^5^1^7 = (3^3)^(5^5)^(7^7)^1 = 0^0^0^1 = 1

print("\\n=== 7. 应用：判断是否是2的幂 ===")
def is_power_of_two(n):
    """判断n是不是2的幂"""
    return n > 0 and (n & (n - 1)) == 0

for n in [1, 2, 3, 4, 8, 10, 16, 32, 100]:
    print(f"  {n} 是2的幂？{is_power_of_two(n)}")

print("\\n=== 8. 应用：交换两个变量（异或法）===")
a, b = 10, 20
print(f"交换前: a={a}, b={b}")
# 用Python的元组解包最清晰（推荐）
a, b = b, a
print(f"交换后: a={a}, b={b}")
# 异或交换法（了解即可，不用写这种）
a ^= b
b ^= a
a ^= b
print(f"再交换一次: a={a}, b={b}")

print("\\n=== 9. 颜色RGB打包/解包 ===")
# 把RGB三个通道打包成一个整数
r, g, b = 255, 128, 0
color = (r << 16) | (g << 8) | b
print(f"RGB({r},{g},{b}) 打包为整数: {color} (0x{color:06X})")
# 解包
r2 = (color >> 16) & 0xFF
g2 = (color >> 8) & 0xFF
b2 = color & 0xFF
print(f"解包: RGB({r2},{g2},{b2})")`
  },
  {
    id: "py6-bool-tricks",
    group: "流程控制",
    icon: "💡",
    title: "布尔判断常用技巧",
    content: `## 布尔判断常用技巧

这一章总结 Python 中布尔判断的常用技巧和惯用写法（idioms），让你写出更地道的 Python 代码。

### 技巧1：直接判断真值，不要写 == True

\`\`\`python
# 啰嗦写法
if is_valid == True:
if len(lst) > 0:
if x != None:

# Pythonic写法
if is_valid:
if lst:
if x is not None:
\`\`\`

### 技巧2：判断是否在范围内

Python 支持数学式的连续比较：

\`\`\`python
# 其他语言写法
if 0 <= x and x <= 100:

# Python写法
if 0 <= x <= 100:
\`\`\`

甚至：

\`\`\`python
# 连续比较，等价于 a<b 且 b<c 且 c<d
if a < b < c < d:
if x == y == z:  # 三个值相等
\`\`\`

### 技巧3：in 判断成员关系

\`\`\`python
# 啰嗦写法
if fruit == "苹果" or fruit == "香蕉" or fruit == "橙子":

# Pythonic写法
if fruit in ["苹果", "香蕉", "橙子"]:
\`\`\`

### 技巧4：is None / is not None

判断 None 用 \`is\`，不要用 \`==\`：

\`\`\`python
if x is None:     # ✅ 推荐
if x is not None: # ✅ 推荐
if x == None:     # ❌ 不推荐（虽然通常能用，但不规范）
\`\`\`

### 技巧5：字符串判断

\`\`\`python
# 空判断
if not name:  # 空字符串

# 判断前缀后缀
if filename.endswith('.py'):
if url.startswith('https://'):

# 判断包含
if 'error' in message.lower():
\`\`\`

### 技巧6：any() / all() 做多条件

\`\`\`python
# 有一个满足即可
if any([cond1, cond2, cond3]):

# 所有都要满足
if all([user_valid, password_ok, has_permission]):
\`\`\`

### 技巧7：用 get() 安全访问字典

\`\`\`python
# 啰嗦写法
if 'key' in d:
    value = d['key']
else:
    value = default

# Pythonic写法
value = d.get('key', default)
\`\`\`

### 技巧8：条件表达式（三元）

\`\`\`python
# 三元表达式结果赋值
result = A if cond else B
\`\`\`

### 技巧9：德摩根定律

想否定多个条件时，注意：
- \`not (A and B)\` 等价于 \`not A or not B\`
- \`not (A or B)\` 等价于 \`not A and not B\`

有时候翻转条件让代码更清晰。

### 技巧10：避免深层嵌套，早返回

\`\`\`python
# 不好：嵌套深
# 定义处理函数（嵌套写法）
def process(x):
    # 第一层：非空判断
    if x is not None:
        # 第二层：正数判断
        if x > 0:
            # 第三层：上限判断
            if x < 100:
                # 满足条件返回双倍值
                return x * 2
    # 默认返回 None
    return None

# 好：早返回（guard clause）
# 定义处理函数（早返回写法）
def process(x):
    # 为空直接返回 None
    if x is None:
        return None
    # 非正数直接返回 None
    if x <= 0:
        return None
    # 超过上限直接返回 None
    if x >= 100:
        return None
    # 满足全部条件返回双倍值
    return x * 2
\`\`\``,
    code: `# 布尔判断常用技巧演示

print("=== 技巧1：直接判断真值 ===")
flag = True
items = [1, 2, 3]
name = "小明"
x = 0

# Pythonic写法
if flag:
    print("  flag是True")
if items:
    print("  列表非空")
if name:
    print("  名字非空")
if not x:
    print("  x是0（假值）")

print("\\n=== 技巧2：链式比较 ===")
score = 85
# 其他语言要写 if score >= 60 and score < 90:
if 60 <= score < 90:
    print(f"  {score}分：成绩在60-89之间（及格到良好）")

x = 5
if 0 < x < 10:
    print(f"  x={x} 在(0,10)范围内")

a, b, c = 1, 2, 3
if a < b < c:
    print("  a < b < c 成立")

x = y = z = 42
if x == y == z:
    print("  x、y、z都相等（42）")

print("\\n=== 技巧3：in 判断包含关系 ===")
fruit = "苹果"
# 啰嗦写法：if fruit == "苹果" or fruit == "香蕉" or fruit == "橙子":
if fruit in ["苹果", "香蕉", "橙子"]:
    print(f"  '{fruit}' 在水果列表里")

status = "error"
if status in ("pending", "processing", "completed"):
    print("  正常状态")
else:
    print(f"  '{status}' 不是预期状态")

# 判断子串
message = "Error: something went wrong"
if "error" in message.lower():
    print("  消息中包含error")

print("\\n=== 技巧4：is None / is not None ===")
value = None
if value is None:
    print("  value是None")
value = 42
if value is not None:
    print(f"  value不是None，是{value}")

print("\\n=== 技巧5：字符串常用判断 ===")
filename = "script.py"
if filename.endswith(".py"):
    print(f"  '{filename}' 是Python文件")
if filename.startswith("script"):
    print(f"  '{filename}' 以script开头")

text = "  Hello  "
if text.strip():
    print(f"  文本strip后非空: '{text.strip()}'")
else:
    print("  空白文本")

print("\\n=== 技巧6：any()和all() ===")
# 检查是否有任何一个满足
scores = [85, 92, 78, 55]
has_fail = any(s < 60 for s in scores)
print(f"  分数列表{scores}有不及格的吗？{has_fail}")

# 检查是否全部满足
all_pass = all(s >= 60 for s in scores)
print(f"  全部及格了吗？{all_pass}")

# 检查多个条件
conditions = [True, True, True]
print(f"  所有条件都满足？{all(conditions)}")

print("\\n=== 技巧7：字典get()提供默认值 ===")
config = {"host": "localhost", "port": 3306}
# get找不到时返回默认值，不报错
host = config.get("host", "127.0.0.1")
port = config.get("port", 8080)
debug = config.get("debug", False)  # 没有debug键，返回默认值False
print(f"  host={host}, port={port}, debug={debug}")

print("\\n=== 技巧8：三元表达式简洁赋值 ===")
age = 20
status = "成年" if age >= 18 else "未成年"
print(f"  {age}岁：{status}")

a, b = 10, 20
max_val = a if a > b else b
print(f"  a={a}, b={b}, 较大值是{max_val}")

print("\\n=== 技巧9：德摩根定律（否定条件）===")
# not (A and B) = not A or not B
# not (A or B) = not A and not B
is_weekend = False
is_holiday = False
# 既不是周末也不是假期
if not is_weekend and not is_holiday:
    print("  今天是工作日")
# 等价于：if not (is_weekend or is_holiday):

has_money = True
has_time = False
# 不能去旅行（不是钱和时间都有）
if not (has_money and has_time):
    print("  钱或时间不够，不能去旅行")

print("\\n=== 技巧10：早返回避免深层嵌套 ===")
def check_age(age):
    # 不满足条件先返回（guard clause），主体逻辑不缩进
    if age is None:
        return "请输入年龄"
    if not isinstance(age, (int, float)):
        return "年龄必须是数字"
    if age < 0 or age > 150:
        return "年龄范围无效"
    if age < 18:
        return "未成年"
    return "成年"

print("  check_age(None):", check_age(None))
print("  check_age('abc'):", check_age("abc"))
print("  check_age(-5):", check_age(-5))
print("  check_age(15):", check_age(15))
print("  check_age(25):", check_age(25))

print("\\n=== 技巧11：标志变量 ===")
found = False
target = 7
numbers = [1, 3, 5, 7, 9]
for n in numbers:
    if n == target:
        found = True
        break
print(f"  在{numbers}中找{target}？{'找到了' if found else '没找到'}")

print("\\n=== 总结 ===")
print("Python惯用写法：")
print("  if x:          而不是 if x == True/len(x)>0")
print("  if not x:      而不是 if x == False/len(x)==0")
print("  if a <= x <= b:  范围判断")
print("  if x in [...]:   成员判断")
print("  if x is None:  判断None")
print("  value = A if cond else B:  三元表达式")
print("  any()/all():   多条件判断")
print("  d.get(key, default):  安全取字典值")
print("  早返回减少嵌套:  guard clause模式")`
  }
];
