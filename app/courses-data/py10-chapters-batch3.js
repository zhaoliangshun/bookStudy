// =============================================================
// Python 从入门到精通大全（终极版）—— 第3批章节
// 第三部分 流程控制（共 5 章）
// =============================================================

export const chapters = [
  // -----------------------------------------------------------
  // 第十一章：条件判断 if
  // -----------------------------------------------------------
  {
    id: "py10-ch11",
    group: "第三部分 流程控制",
    icon: "🔀",
    title: "第十一章 条件判断 if",
    content: `## 程序的"判断力"

前面写的代码都是"从上到下顺序执行"，但真实世界需要**判断**——"如果下雨就带伞，否则就不带"。Python 用 \`if\` 语句实现判断。

\`\`\`python
# 基本 if 语句
weather = "下雨"

if weather == "下雨":
    print("带伞")        # 这行有缩进，属于 if 内部

print("出门")            # 这行没缩进，不属于 if
\`\`\`

**缩进是关键**：\`if\` 后面缩进的代码块属于 \`if\`，条件为 True 时才执行。没有缩进的代码不归 \`if\` 管，总是执行。

## if 的基本语法

\`\`\`python
if 条件:
    # 条件为 True 时执行的代码块
    代码1
    代码2
\`\`\`

⚠️ **冒号不能少**！\`if 条件:\` 后面必须有冒号，否则报 SyntaxError。

\`\`\`python
# 错误：少冒号
# if x > 5
#     print(x)

# 正确
if x > 5:
    print(x)
\`\`\`

## if-else：二选一

\`\`\`python
age = 18

if age >= 18:
    print("成年人")
else:
    print("未成年人")
\`\`\`

\`else\` 后面也必须有冒号。\`else\` 块在条件为 False 时执行。

## if-elif-else：多选一

\`\`\`python
score = 85

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

print(f"成绩: {score}, 等级: {grade}")    # 成绩: 85, 等级: 良好
\`\`\`

**\`elif\` 是 "else if" 的缩写**。Python 会从上到下逐个判断，**一旦某个条件为 True 就执行对应代码块，后面的 elif/else 都不再判断**。

### 链式比较简化 if

\`\`\`python
# 传统写法
if score >= 80 and score < 90:
    grade = "良好"

# 链式比较（更简洁）
if 80 <= score < 90:
    grade = "良好"
\`\`\`

## 嵌套 if

\`\`\`python
age = 25
has_id = True

if age >= 18:
    if has_id:
        print("可以买酒")
    else:
        print("请出示身份证")
else:
    print("未成年不能买酒")
\`\`\`

嵌套 if 会让代码缩进变深，可读性下降。能用 \`and\` 合并条件就别嵌套：

\`\`\`python
# 改进：用 and 合并
if age >= 18 and has_id:
    print("可以买酒")
elif age >= 18:
    print("请出示身份证")
else:
    print("未成年不能买酒")
\`\`\`

## 条件表达式（三元运算符）

Python 的"三元运算符"语法：\`值1 if 条件 else 值2\`。

\`\`\`python
age = 20

# 传统写法
if age >= 18:
    status = "成年"
else:
    status = "未成年"

# 三元表达式（一行搞定）
status = "成年" if age >= 18 else "未成年"

# 嵌套三元（不推荐，可读性差）
grade = "优秀" if score >= 90 else "良好" if score >= 80 else "及格" if score >= 60 else "不及格"
\`\`\`

**何时用三元表达式？** 简单的"二选一赋值"用它最简洁。复杂的逻辑别用，可读性差。

### 实战：用三元简化代码

\`\`\`python
# 判断奇偶
n = 7
result = "偶数" if n % 2 == 0 else "奇数"
print(result)    # 奇数

# 设置默认值
user_input = ""
name = user_input.strip() or "匿名"    # 利用 or 短路
# 或
name = user_input.strip() if user_input.strip() else "匿名"

# 在 f-string 里用三元
score = 85
print(f"成绩{'优秀' if score >= 90 else '良好'}")
\`\`\`

## truthy 和 falsy

\`if\` 后面不一定要是布尔值——任何值都能被"判断真假"。

回顾第二章的 falsy 清单：**零、空、None 是假，其他都真**。

\`\`\`python
# 数字
if 0: print("不会执行")        # 0 是 falsy
if 42: print("会执行")          # 非 0 是 truthy
if 0.0: print("不会执行")
if -1: print("会执行")          # 负数也是 truthy

# 字符串
if "": print("不会执行")        # 空字符串是 falsy
if "hello": print("会执行")     # 非空字符串是 truthy

# 容器
if []: print("不会执行")        # 空列表是 falsy
if [0]: print("会执行")         # 非空列表是 truthy（哪怕元素是 0）
if {}: print("不会执行")
if {"a": 1}: print("会执行")

# None
if None: print("不会执行")
\`\`\`

### 利用 truthy/falsy 简化代码

\`\`\`python
# 列表是否非空
items = [1, 2, 3]

# 不推荐：冗余
if len(items) > 0:
    print("有元素")

# 推荐：直接判断
if items:
    print("有元素")

# 字符串是否非空
name = "张三"
if name:    # 等价于 if name != ""
    print(f"你好, {name}")

# 判断 None
result = None
if result is None:
    print("没有结果")
\`\`\`

## 短路求值

\`and\` 和 \`or\` 有"短路求值"特性，可以巧妙用在条件判断里。

\`\`\`python
# and：左边 False 就直接返回，不计算右边
# 用途：避免错误
x = 0
if x != 0 and 10 / x > 1:    # 先判断 x != 0，避免除零
    print("...")

# or：左边 True 就直接返回，不计算右边
# 用途：设置默认值
name = ""
display_name = name or "匿名"    # 空字符串是 falsy，取 "匿名"
\`\`\`

### 在 if 里组合多个条件

\`\`\`python
age = 25
has_degree = True
experience = 3

# and：所有条件都满足
if age >= 18 and has_degree and experience >= 1:
    print("符合条件")

# or：任一条件满足
if age < 18 or not has_degree:
    print("不符合条件")

# 混合用括号
if (age >= 18 and has_degree) or experience >= 5:
    print("符合条件")
\`\`\`

## 综合实战 demo

\`\`\`python
# ============================================
# 第十一章综合 demo：BMI 计算器
# 演示：if-elif-else、嵌套、三元、truthy
# ============================================

def calculate_bmi(weight, height):
    """计算 BMI 并返回等级"""
    # BMI = 体重(kg) / 身高²(m)
    bmi = weight / (height ** 2)

    # 用 if-elif 判断等级
    if bmi < 18.5:
        level = "偏瘦"
    elif bmi < 24:
        level = "正常"
    elif bmi < 28:
        level = "偏胖"
    elif bmi < 32:
        level = "肥胖"
    else:
        level = "重度肥胖"

    return bmi, level

def get_health_advice(level, age):
    """根据等级和年龄给建议"""
    # 用嵌套 if 处理年龄差异
    if level == "偏瘦":
        if age < 18:
            return "青少年偏瘦需关注营养，建议咨询医生"
        else:
            return "建议增加营养摄入，多摄入蛋白质"
    elif level == "正常":
        return "保持良好的生活习惯"
    elif level == "偏胖":
        return "建议适当运动，控制饮食"
    elif level == "肥胖":
        if age > 40:
            return "中年肥胖风险高，建议系统减肥"
        else:
            return "建议规律运动，调整饮食结构"
    else:
        return "建议尽快咨询医生"

# 测试数据
test_cases = [
    {"name": "小明", "weight": 50, "height": 1.75, "age": 16},
    {"name": "小红", "weight": 55, "height": 1.65, "age": 25},
    {"name": "大刚", "weight": 80, "height": 1.70, "age": 30},
    {"name": "老李", "weight": 95, "height": 1.70, "age": 50},
    {"name": "王五", "weight": 110, "height": 1.65, "age": 45},
]

# 用三元表达式定义输出符号
def format_bmi(bmi):
    # 用三元决定箭头方向
    arrow = "↑" if bmi > 24 else "↓" if bmi < 18.5 else "✓"
    return f"{bmi:.1f} {arrow}"

# 处理每个测试用例
print("=" * 50)
print("           BMI 健康分析报告")
print("=" * 50)
for case in test_cases:
    # 利用 truthy 判断数据完整性
    if not case.get("name"):
        continue

    bmi, level = calculate_bmi(case["weight"], case["height"])
    advice = get_health_advice(level, case["age"])

    print(f"\\n{case['name']} ({case['age']} 岁):")
    print(f"  体重: {case['weight']}kg, 身高: {case['height']}m")
    print(f"  BMI: {format_bmi(bmi)} ({level})")
    print(f"  建议: {advice}")

# 用短路求值设置默认值
print("\\n" + "=" * 50)
empty_input = ""
default_name = empty_input or "匿名用户"
print(f"测试默认值: {default_name}")
\`\`\`

这段 demo 综合用了：if-elif-else、嵌套 if、三元表达式、truthy 判断、短路求值、链式比较。**是条件判断的典型场景**。

## ⚠️ 初学者常见坑

### 坑一：少冒号

\`\`\`python
# 错误
# if x > 5
#     print(x)

# 正确
if x > 5:
    print(x)
\`\`\`

### 坑二：缩进不一致

\`\`\`python
if x > 5:
    print("a")
  print("b")    # IndentationError：缩进不一致

# 正确：缩进统一
if x > 5:
    print("a")
    print("b")
\`\`\`

### 坑三：用 = 而不是 ==

\`\`\`python
# 错误
# if x = 5:    # SyntaxError（= 是赋值）

# 正确
if x == 5:    # == 是比较
    pass
\`\`\`

### 坑四：浮点数直接比较

\`\`\`python
# 错误
# if 0.1 + 0.2 == 0.3:    # False（精度问题）

# 正确
if abs(0.1 + 0.2 - 0.3) < 1e-9:
    pass
\`\`\`

### 坑五：判断 None 用 ==

\`\`\`python
# 不推荐
# if x == None:    # 能跑但不规范

# 推荐
if x is None:
    pass
\`\`\`

## 小结

- \`if 条件:\` 必须有冒号，缩进的代码块属于 \`if\`
- \`if-elif-else\` 是多选一，从上到下逐个判断，匹配后跳出
- 链式比较 \`80 <= score < 90\` 比 \`score >= 80 and score < 90\` 更简洁
- 三元表达式 \`值1 if 条件 else 值2\` 适合简单的二选一赋值
- truthy/falsy："零、空、None 是假，其他都真"
- 简化判断：\`if items:\` 比 \`if len(items) > 0:\` 更 Pythonic
- 短路求值：\`and\` 避免错误（先判断安全条件），\`or\` 设置默认值
- 比较 None 用 \`is None\`，浮点数用容差判断

## 常见疑问 Q&A

**Q：if 和 switch/case 哪个好？**
A：Python 没有 switch，多分支用 if-elif。Python 3.10+ 引入了 match-case（下一章细讲），类似 switch 但更强大。

**Q：三元表达式能嵌套吗？**
A：能，但不推荐。\`a if c1 else b if c2 else d\` 太难读。复杂逻辑用 if-elif。

**Q：\`if x:\` 和 \`if x == True:\` 区别？**
A：\`if x:\` 用 truthy 规则（任何非空非零都 True）；\`if x == True:\` 严格判断是否等于 True。前者更 Pythonic，但要注意 \`if 1 == True:\` 也是 True（因为 True == 1）。

**Q：能写 \`if (a < b):\` 加括号吗？**
A：能，括号不影响逻辑，但 Python 风格里通常不写（除非有多个条件需要分组）。`
  },

  // -----------------------------------------------------------
  // 第十二章：while 循环
  // -----------------------------------------------------------
  {
    id: "py10-ch12",
    group: "第三部分 流程控制",
    icon: "🔁",
    title: "第十二章 while 循环",
    content: `## 循环：让代码"重复执行"

写代码经常需要"重复做一件事"——打印 1 到 100、处理列表每个元素、定时任务。Python 有两种循环：\`while\` 和 \`for\`。本章讲 \`while\`。

\`\`\`python
# while 循环：条件为 True 就一直执行
count = 0
while count < 5:
    print(f"第 {count + 1} 次")
    count += 1    # 别忘了更新条件，否则死循环！
\`\`\`

**\`while\` 的本质**：每次循环前判断条件，True 就执行循环体，False 就退出。

⚠️ **死循环陷阱**：如果条件永远为 True，循环会无限执行。所以循环体里必须有"让条件变 False"的代码（比如 \`count += 1\`）。

## while 基础语法

\`\`\`python
while 条件:
    # 循环体
    代码1
    代码2
    # 必须有让条件变 False 的代码
\`\`\`

### 累加求和

\`\`\`python
# 计算 1 + 2 + 3 + ... + 100
total = 0
n = 1
while n <= 100:
    total += n
    n += 1
print(f"1 到 100 的和: {total}")    # 5050
\`\`\`

### 倒计时

\`\`\`python
# 5 秒倒计时
import time
count = 5
while count > 0:
    print(f"\\r倒计时: {count}", end="", flush=True)
    time.sleep(1)
    count -= 1
print("\\r倒计时: 完成！   ")
\`\`\`

## break：立即跳出循环

\`break\` 让循环立即结束，不再判断条件。

\`\`\`python
# 找到第一个大于 5 的数就停止
nums = [1, 3, 5, 7, 9, 2, 4]
i = 0
while i < len(nums):
    if nums[i] > 5:
        print(f"找到了: {nums[i]}")
        break
    i += 1
\`\`\`

### 实战：用户输入循环

\`\`\`python
# 让用户反复输入，输入 quit 退出
while True:    # 死循环
    user_input = input("输入内容（quit 退出）: ")
    if user_input == "quit":
        print("再见！")
        break
    print(f"你输入了: {user_input}")
\`\`\`

**\`while True\` + \`break\`** 是常见的"无限循环直到某个条件"模式。

## continue：跳过本次，继续下一次

\`continue\` 跳过本次循环剩下的代码，直接进入下一次循环。

\`\`\`python
# 打印 1-10 里的奇数
n = 0
while n < 10:
    n += 1
    if n % 2 == 0:
        continue    # 跳过偶数
    print(n)
# 输出：1 3 5 7 9
\`\`\`

⚠️ **continue 的位置很关键**：\`n += 1\` 必须在 continue 之前，否则会死循环。

\`\`\`python
# 错误：continue 在 n += 1 之前，导致死循环
n = 0
while n < 10:
    if n % 2 == 0:
        continue    # 死循环！n 永远是 0
    n += 1
    print(n)
\`\`\`

## pass：什么都不做

\`pass\` 是"占位符"，表示"这里什么都不做"。主要用于语法上需要代码块但暂时没内容的地方。

\`\`\`python
# 还没想好怎么实现，先 pass
def todo_function():
    pass    # 没有 pass 会报语法错误

# 在循环里用 pass（没什么用，但语法合法）
for i in range(5):
    pass    # 什么都不做

# 在 if 里用 pass
if x > 5:
    pass    # 暂时不管，以后再写
else:
    print("x 不大于 5")
\`\`\`

**pass 的用途**：写代码时先搭骨架（函数、类、if），具体实现后续补，用 pass 占位避免语法错误。

## while-else：循环正常结束执行

Python 特色：\`while\` 可以配 \`else\`，循环**正常结束**（不是 break 跳出）时执行 else 块。

\`\`\`python
# 找一个列表里的负数
nums = [1, 3, 5, 7]
i = 0
while i < len(nums):
    if nums[i] < 0:
        print(f"找到负数: {nums[i]}")
        break
    i += 1
else:
    # 循环正常结束（没 break），说明没找到
    print("没有负数")
\`\`\`

**为什么用 while-else？** 比"加一个标志变量"更优雅。否则要这样写：

\`\`\`python
# 不用 else 的写法（啰嗦）
found = False
i = 0
while i < len(nums):
    if nums[i] < 0:
        print(f"找到负数: {nums[i]}")
        found = True
        break
    i += 1
if not found:
    print("没有负数")
\`\`\`

⚠️ **while-else 不常用**，很多人觉得可读性差。但它确实是 Python 的特性，看老代码时能看懂就行。

## 无限循环（死循环）

\`\`\`while True:\` 创建无限循环，必须用 \`break\` 退出。

\`\`\`python
# 服务器主循环（伪代码）
while True:
    request = wait_for_request()
    if request == "shutdown":
        break
    handle_request(request)
\`\`\`

### 死循环的中断

在终端里运行死循环，按 \`Ctrl+C\` 可以中断（抛 \`KeyboardInterrupt\`）。

\`\`\`python
# 演示：Ctrl+C 中断
try:
    while True:
        print("运行中...")
except KeyboardInterrupt:
    print("\\n用户中断")
\`\`\`

## 常见 while 模式

### 1. 累加/累积

\`\`\`python
# 计算 1*2*3*...*10（阶乘）
result = 1
n = 1
while n <= 10:
    result *= n
    n += 1
print(f"10! = {result}")    # 3628800
\`\`\`

### 2. 反复输入直到合法

\`\`\`python
# 让用户输入 1-100 的整数，错了就重输
while True:
    user_input = input("请输入 1-100 的整数: ")
    if user_input.isdigit():
        num = int(user_input)
        if 1 <= num <= 100:
            print(f"你输入了: {num}")
            break
    print("输入无效，请重试")
\`\`\`

### 3. 模拟游戏循环

\`\`\`python
# 猜数字游戏
import random

target = random.randint(1, 100)
attempts = 0
max_attempts = 7

print(f"猜 1-100 的数字，你有 {max_attempts} 次机会")

while attempts < max_attempts:
    attempts += 1
    guess = int(input(f"第 {attempts} 次猜测: "))

    if guess == target:
        print(f"恭喜！{attempts} 次猜对了")
        break
    elif guess < target:
        print("太小了")
    else:
        print("太大了")
else:
    # 循环正常结束（用完次数没猜对）
    print(f"很遗憾，正确答案是 {target}")
\`\`\`

### 4. 简单状态机

\`\`\`python
# 模拟红绿灯
import time

state = "红"
duration = {"红": 3, "绿": 2, "黄": 1}
next_state = {"红": "绿", "绿": "黄", "黄": "红"}

cycles = 0
while cycles < 3:    # 跑 3 个完整循环
    print(f"灯: {state}（持续 {duration[state]} 秒）")
    time.sleep(duration[state])
    state = next_state[state]
    if state == "红":
        cycles += 1
print("结束")
\`\`\`

### 5. 处理队列/栈

\`\`\`python
# 模拟任务队列
tasks = ["任务1", "任务2", "任务3", "任务4"]

while tasks:    # 列表非空就继续
    task = tasks.pop(0)    # 取出第一个
    print(f"处理: {task}")
print("所有任务完成")
\`\`\`

**\`while tasks:\` 利用了 truthy 判断**：列表非空为 True，空列表为 False。这是处理"未知长度集合"的常见模式。

## 综合实战 demo

\`\`\`python
# ============================================
# 第十二章综合 demo：交互式菜单系统
# 演示：while、break、continue、while-else
# ============================================

# 模拟一个简单的待办事项应用
todos = []

def show_menu():
    """显示菜单"""
    print("\\n" + "=" * 30)
    print("       待办事项管理")
    print("=" * 30)
    print("1. 查看待办")
    print("2. 添加待办")
    print("3. 完成待办")
    print("4. 删除待办")
    print("5. 退出")
    print("=" * 30)

def show_todos():
    """显示待办列表"""
    if not todos:
        print("（暂无待办）")
        return
    print("--- 待办列表 ---")
    for i, todo in enumerate(todos, 1):
        status = "✓" if todo["done"] else "✗"
        print(f"{i}. [{status}] {todo['task']}")

def add_todo():
    """添加待办"""
    # 模拟用户输入
    task = "新任务" + str(len(todos) + 1)
    todos.append({"task": task, "done": False})
    print(f"已添加: {task}")

def complete_todo():
    """完成待办"""
    if not todos:
        print("没有待办可完成")
        return
    # 完成第一个未完成的
    for todo in todos:
        if not todo["done"]:
            todo["done"] = True
            print(f"完成: {todo['task']}")
            return
    print("所有待办都已完成")

def delete_todo():
    """删除待办"""
    if not todos:
        print("没有待办可删除")
        return
    # 删除最后一个
    removed = todos.pop()
    print(f"删除: {removed['task']}")

# 模拟用户操作序列
user_actions = ["1", "2", "2", "1", "3", "1", "4", "1", "5"]
action_index = 0

print("欢迎使用待办事项管理系统")

# 主循环
while action_index < len(user_actions):
    show_menu()
    choice = user_actions[action_index]
    action_index += 1
    print(f"\\n选择: {choice}")

    if choice == "1":
        show_todos()
    elif choice == "2":
        add_todo()
    elif choice == "3":
        complete_todo()
    elif choice == "4":
        delete_todo()
    elif choice == "5":
        print("感谢使用，再见！")
        break
    else:
        print("无效选择，请重试")
        continue    # 跳过无效输入
else:
    # while-else：正常结束（用户没选 5 退出）
    print("操作序列用完，自动退出")

# 最终状态
print("\\n=== 最终状态 ===")
show_todos()
\`\`\`

这段 demo 综合用了：\`while\`、\`break\`、\`continue\`、\`while-else\`、嵌套函数调用。**是交互式应用的典型结构**。

## ⚠️ 初学者常见坑

### 坑一：忘记更新条件变量

\`\`\`python
# 死循环！n 永远是 0
n = 0
# while n < 10:
#     print(n)
# 忘记写 n += 1

# 正确
n = 0
while n < 10:
    print(n)
    n += 1
\`\`\`

### 坑二：continue 后忘记更新

\`\`\`python
# 死循环！continue 后 n 没自增
n = 0
# while n < 10:
#     if n % 2 == 0:
#         continue
#     print(n)
#     n += 1

# 正确：先自增
n = 0
while n < 10:
    n += 1
    if n % 2 == 0:
        continue
    print(n)
\`\`\`

### 坑三：break 用错地方

\`\`\`python
# 想跳过本次但用了 break（直接退出循环了）
for n in range(10):
    if n % 2 == 0:
        break    # 错！这会直接结束循环
    print(n)
# 想跳过用 continue
for n in range(10):
    if n % 2 == 0:
        continue
    print(n)
\`\`\`

### 坑四：浮点数当循环条件

\`\`\`python
# 错误：浮点数精度问题可能导致死循环
# i = 0
# while i != 1:
#     i += 0.1
# 0.1 + 0.1 + ... 可能永远不等于 1

# 正确：用整数计数，或用 < 代替 !=
i = 0
while i < 1:
    i += 0.1
    print(f"{i:.2f}")
\`\`\`

## 小结

- \`while 条件:\` 条件为 True 就执行循环体，必须有让条件变 False 的代码
- \`break\`：立即跳出循环
- \`continue\`：跳过本次，继续下一次
- \`pass\`：占位符，什么都不做
- \`while-else\`：循环正常结束（非 break）时执行 else
- \`while True\` + \`break\`：常见的"无限循环直到条件"模式
- 常见模式：累加、反复输入、游戏循环、状态机、处理队列
- 警惕死循环：必须更新条件变量，continue 后也要更新

## 常见疑问 Q&A

**Q：while 和 for 该用哪个？**
A：知道循环次数用 \`for\`（如遍历列表、range）；不知道循环次数用 \`while\`（如反复输入直到合法、用户主动退出）。

**Q：\`while True\` 会不会一直卡死？**
A：只要循环体内有 \`break\` 就不会。但忘记写 break 会死循环。运行时按 Ctrl+C 可以中断。

**Q：\`while-else\` 什么时候用？**
A：循环正常结束（不是 break）需要做收尾工作时用。但很多人觉得可读性差，用标志变量代替也可以。

**Q：怎么避免死循环？**
A：1）确保循环体里有更新条件变量的代码；2）continue 后也要更新；3）测试时加个最大循环次数保险。`
  },

  // -----------------------------------------------------------
  // 第十三章：for 循环与可迭代对象
  // -----------------------------------------------------------
  {
    id: "py10-ch13",
    group: "第三部分 流程控制",
    icon: "🔄",
    title: "第十三章 for 循环与可迭代对象",
    content: `## for 循环：遍历的利器

\`for\` 循环用来"遍历"一个序列/可迭代对象，对每个元素执行一段代码。是 Python 中用得最多的循环。

\`\`\`python
# 遍历列表
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)
# apple / banana / cherry

# 遍历字符串
for char in "hello":
    print(char)
# h / e / l / l / o
\`\`\`

**\`for\` 和 \`while\` 的区别**：
- \`for\`：知道要遍历多少次（遍历可迭代对象）
- \`while\`：不知道次数，根据条件决定是否继续

## range()：生成数字序列

\`range()\` 生成一个"数字序列"，常配合 \`for\` 使用。

\`\`\`python
# range(stop): 0 到 stop-1
for i in range(5):
    print(i)
# 0 1 2 3 4

# range(start, stop): start 到 stop-1
for i in range(2, 6):
    print(i)
# 2 3 4 5

# range(start, stop, step): 带步长
for i in range(0, 10, 2):
    print(i)
# 0 2 4 6 8

# 负步长
for i in range(10, 0, -1):
    print(i)
# 10 9 8 7 6 5 4 3 2 1
\`\`\`

⚠️ **\`range()\` 不是列表**，是"惰性序列"——按需生成数字，不占内存。

\`\`\`python
print(range(5))           # range(0, 5)
print(list(range(5)))     # [0, 1, 2, 3, 4]（转成列表才能看到内容）

# range 不占内存，即使生成 100 万个数字
big_range = range(1000000)
print(sys.getsizeof(big_range))    # 48 字节（很小）
\`\`\`

### range 的常见用法

\`\`\`python
# 1. 执行 N 次
for _ in range(5):
    print("hello")

# 2. 累加求和
total = sum(range(1, 101))    # 1+2+...+100 = 5050
print(total)

# 3. 用索引访问列表
fruits = ["apple", "banana", "cherry"]
for i in range(len(fruits)):
    print(f"{i}: {fruits[i]}")
\`\`\`

## enumerate()：同时拿索引和值

需要索引时，\`enumerate()\` 比 \`range(len())\` 更 Pythonic。

\`\`\`python
fruits = ["apple", "banana", "cherry"]

# 不推荐：range(len())
for i in range(len(fruits)):
    print(f"{i}: {fruits[i]}")

# 推荐：enumerate
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")

# 指定起始索引
for i, fruit in enumerate(fruits, start=1):
    print(f"第 {i} 个: {fruit}")
\`\`\`

**\`enumerate\` 返回的是 (索引, 元素) 元组**，可以直接解包。

## zip()：并行遍历多个序列

\`zip()\` 把多个序列"打包"在一起，同时遍历。

\`\`\`python
names = ["张三", "李四", "王五"]
ages = [25, 30, 28]
cities = ["北京", "上海", "广州"]

# zip 同时遍历三个列表
for name, age, city in zip(names, ages, cities):
    print(f"{name}, {age} 岁, {cities}")
\`\`\`

### zip 的细节

\`\`\`python
# 1. 长度不一致时，以最短的为准
a = [1, 2, 3, 4, 5]
b = ["a", "b", "c"]
for x, y in zip(a, b):
    print(x, y)
# 1 a / 2 b / 3 c（b 用完就停）

# 2. 用 zip(*matrix) 转置矩阵
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
transposed = list(zip(*matrix))
print(transposed)    # [(1, 4, 7), (2, 5, 8), (3, 6, 9)]

# 3. 用 zip 创建字典
keys = ["name", "age", "city"]
values = ["张三", 25, "北京"]
d = dict(zip(keys, values))
print(d)    # {'name': '张三', 'age': 25, 'city': '北京'}

# 4. zip_longest: 以最长的为准（需要 itertools）
from itertools import zip_longest
a = [1, 2, 3]
b = ["a", "b"]
for x, y in zip_longest(a, b, fillvalue="-"):
    print(x, y)
# 1 a / 2 b / 3 -
\`\`\`

## 遍历不同类型

### 遍历列表

\`\`\`python
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)
\`\`\`

### 遍历字符串

\`\`\`python
for char in "Python":
    print(char)
\`\`\`

### 遍历字典

\`\`\`python
user = {"name": "张三", "age": 25, "city": "北京"}

# 1. 遍历键（默认）
for key in user:
    print(key, user[key])

# 2. 遍历键（显式）
for key in user.keys():
    print(key)

# 3. 遍历值
for value in user.values():
    print(value)

# 4. 遍历键值对（最常用）
for key, value in user.items():
    print(f"{key}: {value}")
\`\`\`

### 遍历集合

\`\`\`python
fruits = {"apple", "banana", "cherry"}
for fruit in fruits:
    print(fruit)
# 顺序不定（集合无序）
\`\`\`

### 遍历元组

\`\`\`python
point = (3, 4, 5)
for coord in point:
    print(coord)
\`\`\`

### 遍历文件

\`\`\`python
# 遍历文件的每一行
# with open("data.txt", encoding="utf-8") as f:
#     for line in f:
#         print(line.rstrip())
\`\`\`

## 嵌套循环

\`\`\`python
# 打印九九乘法表
for i in range(1, 10):
    for j in range(1, i + 1):
        print(f"{j}×{i}={i*j}", end="\\t")
    print()
\`\`\`

### 嵌套循环的性能问题

\`\`\`python
# 嵌套循环要小心：N×M 次
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]

# 遍历二维列表
for row in matrix:
    for elem in row:
        print(elem, end=" ")
    print()

# 用推导式扁平化（更 Pythonic）
flat = [elem for row in matrix for elem in row]
print(flat)    # [1, 2, 3, 4, 5, 6, 7, 8, 9]
\`\`\`

## for-else

和 while-else 类似，\`for\` 也可以配 \`else\`，循环正常结束（没 break）时执行。

\`\`\`python
# 检查一个数是否是质数
def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False    # 找到因子，不是质数
    else:
        # 循环正常结束（没找到因子），是质数
        return True

# 测试
for n in [2, 7, 10, 13, 15, 17]:
    result = "质数" if is_prime(n) else "合数"
    print(f"{n}: {result}")
\`\`\`

**\`for-else\` 的应用场景**：循环里找东西，找到就 break；如果整个循环没找到，执行 else。比"加标志变量"更简洁。

## break 和 continue 在 for 里的用法

\`\`\`python
# break: 找到第一个就停
nums = [1, 3, 5, 7, 9, 2, 4]
for n in nums:
    if n > 5:
        print(f"找到: {n}")
        break
# 找到: 7

# continue: 跳过偶数
for n in range(10):
    if n % 2 == 0:
        continue
    print(n)
# 1 3 5 7 9
\`\`\`

## 跳出嵌套循环

\`break\` 只跳出**最内层**循环。要跳出多层循环有几种方法：

### 方法一：用标志变量

\`\`\`python
# 在二维列表里找第一个 5
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
found = False
for i in range(len(matrix)):
    for j in range(len(matrix[i])):
        if matrix[i][j] == 5:
            print(f"找到 5 在 ({i}, {j})")
            found = True
            break    # 只跳出内层
    if found:
        break        # 跳出外层
\`\`\`

### 方法二：用函数 + return

\`\`\`python
def find_5(matrix):
    for i in range(len(matrix)):
        for j in range(len(matrix[i])):
            if matrix[i][j] == 5:
                return (i, j)    # 直接返回，跳出所有循环
    return None

pos = find_5([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
print(pos)    # (1, 1)
\`\`\`

### 方法三：用异常

\`\`\`python
class FoundException(Exception):
    pass

try:
    for i in range(len(matrix)):
        for j in range(len(matrix[i])):
            if matrix[i][j] == 5:
                raise FoundException((i, j))
except FoundException as e:
    print(f"找到: {e}")
\`\`\`

### 方法四：用 itertools.product 扁平化

\`\`\`python
from itertools import product

for i, j in product(range(len(matrix)), range(len(matrix[0]))):
    if matrix[i][j] == 5:
        print(f"找到 5 在 ({i}, {j})")
        break
\`\`\`

**推荐**：函数 + return 是最简洁的方法。嵌套循环太深时，考虑重构成函数。

## 综合实战 demo

\`\`\`python
# ============================================
# 第十三章综合 demo：学生成绩分析
# 演示：for、range、enumerate、zip、推导式
# ============================================

# 学生数据
students = [
    {"name": "张三", "scores": {"语文": 85, "数学": 92, "英语": 78}},
    {"name": "李四", "scores": {"语文": 76, "数学": 88, "英语": 95}},
    {"name": "王五", "scores": {"语文": 90, "数学": 85, "英语": 82}},
    {"name": "赵六", "scores": {"语文": 88, "数学": 76, "英语": 91}},
]

# 1. 用 enumerate 遍历（带序号）
print("=" * 50)
print("学生成绩单")
print("=" * 50)
for i, student in enumerate(students, 1):
    scores = student["scores"]
    total = sum(scores.values())
    avg = total / len(scores)
    print(f"{i}. {student['name']}: 总分 {total}, 平均 {avg:.1f}")

# 2. 计算每科最高分（遍历 + 比较）
print("\\n--- 每科最高分 ---")
subjects = ["语文", "数学", "英语"]
for subject in subjects:
    max_score = 0
    max_student = ""
    for student in students:
        score = student["scores"][subject]
        if score > max_score:
            max_score = score
            max_student = student["name"]
    print(f"{subject}: {max_student} ({max_score} 分)")

# 3. 用 zip 同时遍历多科成绩
print("\\n--- 各科成绩对比 ---")
all_scores = [s["scores"] for s in students]
for student, scores in zip(students, all_scores):
    print(f"{student['name']}: ", end="")
    for subject in subjects:
        print(f"{subject}={scores[subject]} ", end="")
    print()

# 4. 用 for-else 找特定学生
print("\\n--- 查找学生 ---")
target = "王五"
for student in students:
    if student["name"] == target:
        print(f"找到: {target}, 总分 {sum(student['scores'].values())}")
        break
else:
    print(f"没找到: {target}")

# 5. 用嵌套 for 计算班级统计
print("\\n--- 班级统计 ---")
subject_totals = {subject: 0 for subject in subjects}
for student in students:
    for subject, score in student["scores"].items():
        subject_totals[subject] += score

for subject, total in subject_totals.items():
    avg = total / len(students)
    print(f"{subject} 平均分: {avg:.1f}")

# 6. 排名（按总分降序）
print("\\n--- 总分排名 ---")
# 用 sorted + 排序键
ranked = sorted(students, key=lambda s: sum(s["scores"].values()), reverse=True)
for i, student in enumerate(ranked, 1):
    total = sum(student["scores"].values())
    print(f"第 {i} 名: {student['name']} ({total} 分)")

# 7. 找出有"偏科"的学生（最高分 - 最低分 > 15）
print("\\n--- 偏科学生 ---")
for student in students:
    scores = list(student["scores"].values())
    diff = max(scores) - min(scores)
    if diff > 15:
        # 找出最高和最低的科目
        max_subject = max(student["scores"].items(), key=lambda x: x[1])
        min_subject = min(student["scores"].items(), key=lambda x: x[1])
        print(f"{student['name']}: 差距 {diff} 分 "
              f"(最强 {max_subject[0]}={max_subject[1]}, 最弱 {min_subject[0]}={min_subject[1]})")
\`\`\`

这段 demo 综合用了：\`for\`、\`enumerate\`、\`zip\`、\`for-else\`、嵌套循环、\`sorted\` + key。**是数据分析的典型场景**。

## ⚠️ 初学者常见坑

### 坑一：遍历时修改列表

\`\`\`python
nums = [1, 2, 2, 3, 4]
# 错误：遍历时删除会漏元素
# for n in nums:
#     if n % 2 == 0:
#         nums.remove(n)

# 正确：用推导式重建
nums = [n for n in nums if n % 2 != 0]
\`\`\`

### 坑二：range 不包括结束值

\`\`\`python
# range(1, 10) 是 1-9，不包括 10！
for i in range(1, 10):
    print(i)    # 1 2 3 4 5 6 7 8 9
\`\`\`

### 坑三：用 range(len()) 而不是 enumerate

\`\`\`python
fruits = ["a", "b", "c"]

# 不推荐
for i in range(len(fruits)):
    print(i, fruits[i])

# 推荐
for i, fruit in enumerate(fruits):
    print(i, fruit)
\`\`\`

### 坑四：break 只跳一层

\`\`\`python
# break 只跳出内层
for i in range(3):
    for j in range(3):
        if j == 1:
            break    # 只跳出内层，外层继续
    print(f"外层 {i}")
\`\`\`

## 小结

- \`for\` 用于遍历可迭代对象，\`while\` 用于条件循环
- \`range(start, stop, step)\` 生成数字序列，**不包括 stop**
- \`enumerate(iter, start)\` 同时拿索引和值，比 \`range(len())\` 更 Pythonic
- \`zip(a, b, c)\` 并行遍历多个序列，以最短的为准
- 遍历字典用 \`for k, v in d.items()\`
- \`for-else\`：循环正常结束（非 break）时执行 else
- 嵌套循环里 \`break\` 只跳一层，要跳多层用函数 + return
- 遍历时修改列表要用推导式重建或倒序遍历

## 常见疑问 Q&A

**Q：for 和 while 哪个更好？**
A：知道次数用 for（遍历、range），不知道次数用 while（条件循环）。for 更常用，更不容易死循环。

**Q：\`range(1000000)\` 会占很多内存吗？**
A：不会。range 是惰性序列，按需生成数字，无论多大都只占几十字节。要真正占内存得 \`list(range(1000000))\`。

**Q：怎么同时遍历索引和值？**
A：用 \`enumerate\`：\`for i, v in enumerate(lst):\`。比 \`range(len())\` 更 Pythonic。

**Q：怎么跳出多层循环？**
A：最简洁的方法是封装成函数，用 \`return\` 直接退出。或者用标志变量配合 break。`
  },

  // -----------------------------------------------------------
  // 第十四章：推导式与生成器表达式
  // -----------------------------------------------------------
  {
    id: "py10-ch14",
    group: "第三部分 流程控制",
    icon: "✨",
    title: "第十四章 推导式与生成器表达式",
    content: `## 推导式：Python 的优雅特性

**推导式**（comprehension）是 Python 最优雅的特性之一，用一行代码创建集合。比传统 for 循环更简洁、更高效。

Python 有四种推导式：

| 类型 | 语法 | 结果 |
|------|------|------|
| 列表推导式 | \`[expr for x in iter]\` | list |
| 字典推导式 | \`{k: v for x in iter}\` | dict |
| 集合推导式 | \`{expr for x in iter}\` | set |
| 生成器表达式 | \`(expr for x in iter)\` | generator |

## 列表推导式

### 基本语法

\`\`\`python
# 传统写法
squares = []
for x in range(10):
    squares.append(x ** 2)
print(squares)    # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# 列表推导式（一行）
squares = [x ** 2 for x in range(10)]
print(squares)    # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
\`\`\`

### 带条件过滤

\`\`\`python
# 只保留偶数的平方
even_squares = [x ** 2 for x in range(10) if x % 2 == 0]
print(even_squares)    # [0, 4, 16, 36, 64]

# 等价于
even_squares = []
for x in range(10):
    if x % 2 == 0:
        even_squares.append(x ** 2)
\`\`\`

### 带条件表达式（三元）

\`\`\`python
# if-else 在前面（不是过滤，是给每个元素选值）
labels = ["偶数" if x % 2 == 0 else "奇数" for x in range(5)]
print(labels)    # ['偶数', '奇数', '偶数', '奇数', '偶数']

# 注意 if-else 和 if 的位置区别
# [x for x in lst if cond]    # 过滤：只保留满足条件的
# [a if cond else b for x in lst]    # 选择：每个元素都给一个值
\`\`\`

### 嵌套循环

\`\`\`python
# 笛卡尔积
pairs = [(x, y) for x in [1, 2] for y in ['a', 'b']]
print(pairs)    # [(1, 'a'), (1, 'b'), (2, 'a'), (2, 'b')]

# 等价于
pairs = []
for x in [1, 2]:
    for y in ['a', 'b']:
        pairs.append((x, y))
\`\`\`

### 扁平化二维列表

\`\`\`python
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]

# 用推导式扁平化
flat = [num for row in matrix for num in row]
print(flat)    # [1, 2, 3, 4, 5, 6, 7, 8, 9]

# 等价于
flat = []
for row in matrix:
    for num in row:
        flat.append(num)
\`\`\`

### 实战示例

\`\`\`python
# 1. 字符串处理
words = ["Hello", "WORLD", "Python"]
lower_words = [w.lower() for w in words]
print(lower_words)    # ['hello', 'world', 'python']

# 2. 提取字典的某些键
user = {"name": "张三", "age": 25, "city": "北京", "email": "a@b.com"}
keys_wanted = ["name", "city"]
values = [user[k] for k in keys_wanted]
print(values)    # ['张三', '北京']

# 3. 处理文件名
files = ["report.pdf", "photo.jpg", "data.csv", "doc.txt"]
pdfs = [f for f in files if f.endswith(".pdf")]
print(pdfs)    # ['report.pdf']

# 4. 数学计算
# 生成斐波那契数列前 10 项（用推导式 + 元组解包）
fibs = [0, 1]
[fibs.append(fibs[-1] + fibs[-2]) for _ in range(8)]    # 滥用推导式的反例
print(fibs[:10])    # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
# 注意：这种"用推导式做副作用"是不推荐的，应该用普通 for 循环
\`\`\`

## 字典推导式

\`\`\`python
# 基本语法：{key_expr: value_expr for item in iterable}

# 1. 数字到平方
squares = {n: n**2 for n in range(5)}
print(squares)    # {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

# 2. 反转字典（键值互换）
original = {"a": 1, "b": 2, "c": 3}
reversed_dict = {v: k for k, v in original.items()}
print(reversed_dict)    # {1: 'a', 2: 'b', 3: 'c'}

# 3. 带条件过滤
prices = {"apple": 5, "banana": 3, "cherry": 8, "date": 2}
expensive = {k: v for k, v in prices.items() if v > 3}
print(expensive)    # {'apple': 5, 'cherry': 8}

# 4. 转换值类型
str_nums = {"a": "1", "b": "2", "c": "3"}
int_nums = {k: int(v) for k, v in str_nums.items()}
print(int_nums)    # {'a': 1, 'b': 2, 'c': 3}

# 5. 从两个列表创建字典
keys = ["name", "age", "city"]
values = ["张三", 25, "北京"]
user = {k: v for k, v in zip(keys, values)}
print(user)    # {'name': '张三', 'age': 25, 'city': '北京'}
# 或直接用 dict(zip(keys, values))
\`\`\`

### 字典推导式实战：词频统计

\`\`\`python
text = "the quick brown fox jumps over the lazy dog the fox"

# 传统写法
word_count = {}
for word in text.split():
    word_count[word] = word_count.get(word, 0) + 1

# 用 Counter（更简洁）
from collections import Counter
word_count = dict(Counter(text.split()))
print(word_count)
# {'the': 3, 'quick': 1, 'brown': 1, 'fox': 2, ...}

# 用字典推导式：反转词频（频次 -> 单词列表）
freq_to_words = {}
for word, count in word_count.items():
    freq_to_words.setdefault(count, []).append(word)
print(freq_to_words)
# {3: ['the'], 2: ['fox'], 1: ['quick', 'brown', ...]}
\`\`\`

## 集合推导式

\`\`\`python
# 基本语法：{expr for item in iterable}

# 1. 提取唯一字符
chars = {c for c in "hello world"}
print(chars)    # {'h', 'e', 'l', 'o', ' ', 'w', 'r', 'd'}

# 2. 数字平方去重
squares = {x**2 for x in range(-3, 4)}
print(squares)    # {0, 1, 4, 9}（自动去重）

# 3. 提取文件扩展名
files = ["a.pdf", "b.jpg", "c.pdf", "d.png", "e.txt"]
extensions = {f.split(".")[-1] for f in files}
print(extensions)    # {'pdf', 'jpg', 'png', 'txt'}
\`\`\`

## 生成器表达式

把列表推导式的 \`[]\` 换成 \`()\`，就变成**生成器表达式**——它不立即创建列表，而是"按需生成"。

\`\`\`python
# 列表推导式：立即创建列表，占内存
squares_list = [x ** 2 for x in range(1000000)]
print(type(squares_list))           # <class 'list'>
print(sys.getsizeof(squares_list))  # ~8448 KB（占内存）

# 生成器表达式：惰性生成，不占内存
squares_gen = (x ** 2 for x in range(1000000))
print(type(squares_gen))            # <class 'generator'>
print(sys.getsizeof(squares_gen))   # 200 字节（很小！）

# 遍历生成器
for sq in squares_gen:
    if sq > 100:
        break
    print(sq)
\`\`\`

### 生成器表达式的特点

1. **惰性求值**：用的时候才计算下一个值
2. **只能遍历一次**：遍历完就空了，不能重复用
3. **省内存**：不存储所有结果，只存当前值

\`\`\`python
gen = (x ** 2 for x in range(5))

# 遍历一次
for x in gen:
    print(x)    # 0 1 4 9 16

# 再遍历（已经空了）
for x in gen:
    print(x)    # 没输出
\`\`\`

### 生成器表达式的实战

\`\`\`python
# 1. 求和（不需要先创建列表）
total = sum(x ** 2 for x in range(101))
print(total)    # 338350（1² + 2² + ... + 100²）

# 2. 求最大值
max_len = max(len(word) for word in ["hello", "world", "python"])
print(max_len)    # 6

# 3. 配合 any / all
numbers = [1, 3, 5, 7, 9]
# 是否有偶数
has_even = any(n % 2 == 0 for n in numbers)
print(has_even)    # False

# 是否都是正数
all_positive = all(n > 0 for n in numbers)
print(all_positive)    # True

# 4. 配合 join
words = ["hello", "world"]
result = ", ".join(w.upper() for w in words)
print(result)    # HELLO, WORLD
\`\`\`

**生成器表达式的优势**：当只需要遍历一次、不需要保留结果时，比列表推导式省内存。

## 推导式 vs 普通循环：性能对比

\`\`\`python
import time

# 列表推导式（更快）
start = time.time()
squares = [x ** 2 for x in range(1000000)]
list_comp_time = time.time() - start

# 普通 for 循环（更慢）
start = time.time()
squares = []
for x in range(1000000):
    squares.append(x ** 2)
for_loop_time = time.time() - start

print(f"列表推导式: {list_comp_time:.3f} 秒")
print(f"普通循环: {for_loop_time:.3f} 秒")
print(f"推导式快 {for_loop_time / list_comp_time:.1f} 倍")
\`\`\`

**为什么推导式更快？**
1. 推导式在 CPython 内部用 C 实现，比 Python 字节码快
2. 普通 \`for + append\` 每次都要查 \`append\` 方法，有开销

## 推导式的可读性

### 适合用推导式的场景

\`\`\`python
# 简单转换：一目了然
squares = [x ** 2 for x in range(10)]

# 简单过滤：清晰
evens = [x for x in nums if x % 2 == 0]

# 简单映射：好懂
lengths = [len(w) for w in words]
\`\`\`

### 不适合用推导式的场景

\`\`\`python
# 太复杂，难读
# result = [transform(x) for x in data if validate(x) and x.value > threshold for y in x.items if y.active]

# 应该拆成普通循环
result = []
for x in data:
    if not validate(x):
        continue
    if x.value <= threshold:
        continue
    for y in x.items:
        if y.active:
            result.append(transform(x))
\`\`\`

**经验法则**：推导式不超过 2 个 \`for\` 和 1 个 \`if\`。复杂逻辑拆成普通循环，配以注释，可读性更好。

## 综合实战 demo

\`\`\`python
# ============================================
# 第十四章综合 demo：日志数据分析
# 演示：列表/字典/集合推导式、生成器表达式
# ============================================

# 模拟 Web 服务器日志
logs = """
2026-07-19 10:15:23 INFO  192.168.1.10 GET /api/users
2026-07-19 10:16:45 WARN  10.0.0.5 POST /api/login
2026-07-19 10:17:12 ERROR 192.168.1.20 GET /api/data
2026-07-19 10:18:30 INFO  192.168.1.10 GET /api/users
2026-07-19 10:19:00 WARN  10.0.0.5 GET /api/data
2026-07-19 10:20:15 ERROR 192.168.1.20 POST /api/upload
2026-07-19 10:21:00 INFO  192.168.1.10 GET /api/users
""".strip().splitlines()

# 1. 用列表推导式解析日志（每行变成字典）
parsed = [
    {
        "timestamp": parts[0] + " " + parts[1],
        "level": parts[2],
        "ip": parts[3],
        "method": parts[4],
        "path": parts[5]
    }
    for line in logs
    for parts in [line.split()]    # 技巧：用 for 给 split 结果命名
]
print(f"共解析 {len(parsed)} 条日志")

# 2. 用集合推导式提取所有 IP（去重）
ips = {log["ip"] for log in parsed}
print(f"独立 IP: {ips}")

# 3. 用集合推导式提取所有 API 路径
paths = {log["path"] for log in parsed}
print(f"访问的 API: {paths}")

# 4. 用字典推导式按日志级别分组计数
level_count = {level: sum(1 for log in parsed if log["level"] == level)
               for level in {"INFO", "WARN", "ERROR"}}
print(f"日志级别统计: {level_count}")

# 5. 用字典推导式按 IP 统计访问次数
ip_count = {ip: sum(1 for log in parsed if log["ip"] == ip) for ip in ips}
print(f"IP 访问次数: {ip_count}")

# 6. 用列表推导式筛选 ERROR 日志
errors = [log for log in parsed if log["level"] == "ERROR"]
print(f"\\n错误日志 ({len(errors)} 条):")
for e in errors:
    print(f"  {e['timestamp']} {e['ip']} {e['path']}")

# 7. 用生成器表达式计算总访问量（不需要先建列表）
total = sum(1 for _ in parsed)
print(f"\\n总访问量: {total}")

# 8. 用 any/all 检查
has_error = any(log["level"] == "ERROR" for log in parsed)
all_have_ip = all(log["ip"] for log in parsed)
print(f"有错误日志: {has_error}")
print(f"所有日志都有 IP: {all_have_ip}")

# 9. 用生成器表达式配合 max 找最活跃的 IP
most_active = max(ip_count.items(), key=lambda x: x[1])
print(f"最活跃 IP: {most_active[0]} ({most_active[1]} 次)")

# 10. 用字典推导式生成路径访问统计
path_count = {path: sum(1 for log in parsed if log["path"] == path) for path in paths}
print(f"路径访问统计: {path_count}")

# 按访问次数排序
print("\\n路径访问排名:")
for path, count in sorted(path_count.items(), key=lambda x: x[1], reverse=True):
    print(f"  {path}: {count} 次")
\`\`\`

这段 demo 综合用了：列表推导式、字典推导式、集合推导式、生成器表达式、any/all、max 配合生成器。**展示了推导式在实际数据处理中的威力**。

## ⚠️ 初学者常见坑

### 坑一：滥用推导式做副作用

\`\`\`python
# 不推荐：用推导式做副作用（虽然能跑，但不 Pythonic）
# [print(x) for x in range(5)]

# 推荐：用 for 循环
for x in range(5):
    print(x)
\`\`\`

### 坑二：嵌套循环顺序搞反

\`\`\`python
# 二维列表扁平化：for 的顺序很重要
matrix = [[1, 2], [3, 4]]

# 正确：外层循环在前，内层循环在后
flat = [num for row in matrix for num in row]
print(flat)    # [1, 2, 3, 4]

# 等价于
flat = []
for row in matrix:        # 外层
    for num in row:       # 内层
        flat.append(num)
\`\`\`

### 坑三：生成器表达式只能遍历一次

\`\`\`python
gen = (x ** 2 for x in range(5))
print(list(gen))    # [0, 1, 4, 9, 16]
print(list(gen))    # []（已经空了，不能再用）

# 需要重复用就转成列表
squares = list(x ** 2 for x in range(5))
\`\`\`

### 坑四：把生成器当列表用

\`\`\`python
gen = (x for x in range(5))
# gen[0]    # TypeError: 生成器不支持索引
# len(gen)  # TypeError: 生成器没有 len

# 要索引或长度，先转成列表
lst = list(gen)
print(lst[0])    # 0
print(len(lst))  # 5
\`\`\`

## 小结

- 列表推导式：\`[expr for x in iter if cond]\`，最常用
- 字典推导式：\`{k: v for x in iter if cond}\`，转换/反转字典
- 集合推导式：\`{expr for x in iter}\`，去重
- 生成器表达式：\`(expr for x in iter)\`，惰性求值，省内存
- 推导式比普通 for 循环**更快**（CPython 优化）
- 生成器表达式适合"只需遍历一次"的场景
- 配合 \`any/all/sum/max/min/join\` 使用生成器表达式，避免创建中间列表
- 复杂逻辑不要硬塞进推导式，用普通循环更清晰

## 常见疑问 Q&A

**Q：列表推导式和 for 循环哪个好？**
A：简单场景（1-2 个 for/if）用推导式更 Pythonic、更快。复杂逻辑用 for 循环更清晰。

**Q：生成器表达式和列表推导式怎么选？**
A：需要立即拿到所有结果、需要多次遍历、需要索引 → 列表推导式。只需要遍历一次（配合 sum/max/any 等）→ 生成器表达式（省内存）。

**Q：推导式能写多复杂？**
A：理论上无限嵌套，但**超过 2 个 for + 1 个 if 就别用**，可读性会急剧下降。复杂逻辑用普通循环。

**Q：为什么推导式比 for 循环快？**
A：CPython 解释器对推导式有专门优化，在 C 层面执行；普通 for 循环每次都要查 \`append\` 方法、执行 Python 字节码，开销大。`
  },

  // -----------------------------------------------------------
  // 第十五章：循环控制与 match-case
  // -----------------------------------------------------------
  {
    id: "py10-ch15",
    group: "第三部分 流程控制",
    icon: "🎯",
    title: "第十五章 循环控制与 match-case",
    content: `## break / continue / pass / else 深入

前面章节简单介绍过 \`break\`、\`continue\`、\`pass\`、\`else\`，本章深入讲透它们的细节。

### break：彻底跳出循环

\`\`\`python
# break 跳出整个循环
for i in range(10):
    if i == 5:
        break
    print(i)
# 0 1 2 3 4（5 之后跳出）

# 在 while 里
n = 0
while True:
    if n > 5:
        break
    print(n)
    n += 1
\`\`\`

**break 的关键点**：
- 跳出**最近的**循环（嵌套时只跳一层）
- 跳出后**不再执行**循环的 else 块
- 用于"找到就停"的场景

### continue：跳过本次

\`\`\`python
# continue 跳过本次循环剩下的代码
for i in range(10):
    if i % 2 == 0:
        continue    # 跳过偶数
    print(i)
# 1 3 5 7 9

# 注意 continue 的位置
n = 0
while n < 5:
    n += 1
    if n == 3:
        continue    # 跳过 n=3 的输出
    print(n)
# 1 2 4 5
\`\`\`

**continue 的关键点**：
- 只跳过**本次**循环，下一次继续
- 不影响 else 块的执行
- 用于"跳过某些情况"

### pass：占位符

\`\`\`python
# pass 什么都不做，只是占位
def todo():
    pass    # 函数体必须有内容，pass 占位

class Empty:
    pass    # 类体必须有内容

if x > 5:
    pass    # 暂时不处理
else:
    print("x 不大于 5")

# 在循环里（基本不用）
for i in range(5):
    pass    # 等同于 for i in range(5): ...
\`\`\`

**pass 的用途**：
- 写骨架时占位（先定义函数/类，后补实现）
- if 分支暂时没内容时占位

### else：循环正常结束

\`for\` 和 \`while\` 都能配 \`else\`，**循环正常结束（没 break）**时执行。

\`\`\`python
# for-else
for i in range(5):
    if i == 3:
        # break    # 取消注释就不执行 else
        pass
    print(i)
else:
    print("循环正常结束")
# 0 1 2 3 4 / 循环正常结束

# while-else
n = 0
while n < 5:
    print(n)
    n += 1
else:
    print("while 正常结束")
\`\`\`

**else 的应用场景**：循环里找东西，找到就 break，没找到执行 else。

\`\`\`python
# 检查列表里是否有负数
nums = [1, 3, 5, 7]
for n in nums:
    if n < 0:
        print(f"找到负数: {n}")
        break
else:
    print("没有负数")    # 循环没 break，执行这里

# 检查质数
def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    else:
        return True
\`\`\`

## Python 3.10+ 新特性：match-case

Python 3.10 引入了 \`match-case\`（结构化模式匹配），类似其他语言的 \`switch\`，但更强大。

### 基本语法

\`\`\`python
# 类似 switch-case
def handle_command(command):
    match command:
        case "quit":
            print("退出")
        case "help":
            print("显示帮助")
        case "list":
            print("列出所有")
        case _:    # _ 是通配符，匹配任何值
            print(f"未知命令: {command}")

handle_command("help")    # 显示帮助
handle_command("unknown") # 未知命令: unknown
\`\`\`

**\`_\` 是通配符**，匹配任何值，相当于 switch 的 \`default\`。必须放在最后。

### 多值匹配（OR 模式）

\`\`\`python
def get_season(month):
    match month:
        case 3 | 4 | 5:        # | 表示"或"
            return "春"
        case 6 | 7 | 8:
            return "夏"
        case 9 | 10 | 11:
            return "秋"
        case 12 | 1 | 2:
            return "冬"
        case _:
            return "无效月份"

print(get_season(7))    # 夏
\`\`\`

### 字面量匹配

\`\`\`python
# 匹配字面量（数字、字符串、True/False、None）
def describe(x):
    match x:
        case 0:
            return "零"
        case 1:
            return "一"
        case "hello":
            return "你好"
        case True:
            return "真"
        case None:
            return "空"
        case _:
            return "其他"

print(describe(0))       # 零
print(describe("hello")) # 你好
print(describe(None))    # 空
\`\`\`

### 捕获模式（绑定变量）

\`\`\`python
# 把匹配的值绑定到变量
def process_value(x):
    match x:
        case 0:
            print("零")
        case n:           # n 是变量，匹配任何值并绑定
            print(f"非零: {n}")

process_value(42)    # 非零: 42
\`\`\`

⚠️ **注意**：单字母变量名会被当作"捕获模式"（绑定变量），不是字面量匹配！

\`\`\`python
# 错误理解：以为匹配字面量 "x"
def wrong(x):
    match "y":
        case "x":
            print("匹配 x")
        case y:        # 这是绑定变量 y，匹配任何值
            print(f"绑定到 y: {y}")

wrong("anything")    # 绑定到 y: anything
\`\`\`

### 守卫（guard）：加条件

\`\`\`python
# case 后面加 if 条件
def classify_number(n):
    match n:
        case n if n < 0:
            return "负数"
        case n if n == 0:
            return "零"
        case n if n < 100:
            return "小正数"
        case _:
            return "大正数"

print(classify_number(-5))    # 负数
print(classify_number(50))    # 小正数
print(classify_number(200))   # 大正数
\`\`\`

### 序列模式（解构匹配）

\`\`\`python
# 匹配列表/元组的结构
def process_point(point):
    match point:
        case (0, 0):
            return "原点"
        case (0, y):
            return f"在 Y 轴上, y={y}"
        case (x, 0):
            return f"在 X 轴上, x={x}"
        case (x, y):
            return f"坐标: ({x}, {y})"
        case _:
            return "无效格式"

print(process_point((0, 0)))     # 原点
print(process_point((0, 5)))     # 在 Y 轴上, y=5
print(process_point((3, 4)))     # 坐标: (3, 4)
\`\`\`

### 序列模式：匹配长度

\`\`\`python
def describe_list(lst):
    match lst:
        case []:
            return "空列表"
        case [x]:
            return f"单元素: {x}"
        case [x, y]:
            return f"两元素: {x}, {y}"
        case [x, y, z]:
            return f"三元素: {x}, {y}, {z}"
        case [first, *rest]:
            return f"多元素: 第一个 {first}, 剩余 {len(rest)} 个"

print(describe_list([]))           # 空列表
print(describe_list([1]))          # 单元素: 1
print(describe_list([1, 2, 3, 4])) # 多元素: 第一个 1, 剩余 3 个
\`\`\`

**\`[first, *rest]\`** 类似解包，把第一个元素绑定到 \`first\`，剩余的绑定到 \`rest\`。

### 映射模式（字典匹配）

\`\`\`python
def handle_response(response):
    match response:
        case {"status": 200, "body": body}:
            return f"成功: {body}"
        case {"status": 404}:
            return "未找到"
        case {"status": 500, "error": err}:
            return f"服务器错误: {err}"
        case {"status": status}:
            return f"状态码: {status}"
        case _:
            return "未知响应"

print(handle_response({"status": 200, "body": "OK"}))    # 成功: OK
print(handle_response({"status": 404}))                   # 未找到
print(handle_response({"status": 403}))                   # 状态码: 403
\`\`\`

### 类模式（匹配对象）

\`\`\`python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

class Circle:
    def __init__(self, radius):
        self.radius = radius

def describe_shape(shape):
    match shape:
        case Point(x=0, y=0):
            return "原点"
        case Point(x=x, y=y):
            return f"点 ({x}, {y})"
        case Circle(radius=r):
            return f"圆，半径 {r}"
        case _:
            return "未知形状"

print(describe_shape(Point(3, 4)))      # 点 (3, 4)
print(describe_shape(Point(0, 0)))      # 原点
print(describe_shape(Circle(5)))        # 圆，半径 5
\`\`\`

### 类模式的位置参数

\`\`\`python
# 用位置参数（需要类有 __match_args__）
class Point:
    __match_args__ = ("x", "y")    # 声明位置参数顺序
    def __init__(self, x, y):
        self.x = x
        self.y = y

def describe(p):
    match p:
        case Point(0, 0):
            return "原点"
        case Point(x, y):
            return f"({x}, {y})"

print(describe(Point(3, 4)))    # (3, 4)
\`\`\`

### as 模式：把匹配值绑定

\`\`\`python
# 用 as 给匹配值起别名
def process(data):
    match data:
        case [x, y] as pair:
            return f"一对: {pair}, x={x}, y={y}"
        case {"key": value} as d:
            return f"字典: {d}, value={value}"
        case _:
            return "其他"

print(process([1, 2]))    # 一对: [1, 2], x=1, y=2
\`\`\`

### 嵌套模式

\`\`\`python
# 模式可以嵌套
def process_config(config):
    match config:
        case {"database": {"host": host, "port": port}, "debug": True}:
            return f"调试模式，数据库 {host}:{port}"
        case {"database": {"host": host, "port": port}}:
            return f"生产模式，数据库 {host}:{port}"
        case _:
            return "未知配置"

config = {"database": {"host": "localhost", "port": 5432}, "debug": True}
print(process_config(config))    # 调试模式，数据库 localhost:5432
\`\`\`

## 实战：用 match-case 写计算器

\`\`\`python
def calculate(a, op, b):
    """简单计算器，用 match-case 处理运算符"""
    match op:
        case "+":
            return a + b
        case "-":
            return a - b
        case "*":
            return a * b
        case "/":
            if b == 0:
                return "除零错误"
            return a / b
        case "//":
            if b == 0:
                return "除零错误"
            return a // b
        case "%":
            return a % b
        case "**":
            return a ** b
        case _:
            return f"未知运算符: {op}"

# 测试
print(calculate(10, "+", 5))     # 15
print(calculate(10, "/", 0))     # 除零错误
print(calculate(2, "**", 10))    # 1024
print(calculate(10, "?", 5))     # 未知运算符: ?
\`\`\`

## 实战：解析 JSON 命令

\`\`\`python
def handle_command(cmd):
    """解析 JSON 风格的命令"""
    match cmd:
        # 退出命令
        case {"action": "quit"}:
            return "再见"
        
        # 列出资源
        case {"action": "list", "type": resource_type}:
            return f"列出 {resource_type}"
        
        # 创建资源
        case {"action": "create", "type": resource_type, "data": data}:
            return f"创建 {resource_type}: {data}"
        
        # 删除资源
        case {"action": "delete", "type": resource_type, "id": res_id} if isinstance(res_id, int):
            return f"删除 {resource_type} #{res_id}"
        
        # 更新资源
        case {"action": "update", "type": resource_type, "id": res_id, "data": data}:
            return f"更新 {resource_type} #{res_id}: {data}"
        
        # 未知命令
        case _:
            return "未知命令"

# 测试
print(handle_command({"action": "quit"}))
# 再见
print(handle_command({"action": "list", "type": "user"}))
# 列出 user
print(handle_command({"action": "create", "type": "post", "data": {"title": "hello"}}))
# 创建 post: {'title': 'hello'}
print(handle_command({"action": "delete", "type": "post", "id": 42}))
# 删除 post #42
\`\`\`

## 综合实战 demo

\`\`\`python
# ============================================
# 第十五章综合 demo：简单的命令行解析器
# 演示：match-case 各种模式
# ============================================

def parse_command(input_str):
    """解析命令行输入"""
    parts = input_str.split()
    if not parts:
        return "空命令"
    
    # 用 match-case 处理不同命令
    match parts:
        # 无参数命令
        case ["quit" | "exit"]:
            return "退出程序"
        
        case ["help"]:
            return ("可用命令:\\n"
                    "  quit/exit - 退出\\n"
                    "  help - 帮助\\n"
                    "  list [type] - 列出资源\\n"
                    "  get <id> - 获取资源\\n"
                    "  create <type> <name> - 创建\\n"
                    "  calc <a> <op> <b> - 计算")
        
        case ["list"]:
            return "列出所有资源"
        
        # 带一个参数
        case ["list", resource_type]:
            return f"列出 {resource_type} 类型的资源"
        
        # get 命令
        case ["get", res_id] if res_id.isdigit():
            return f"获取资源 #{res_id}"
        
        # create 命令
        case ["create", resource_type, name]:
            return f"创建 {resource_type}: {name}"
        
        # calc 命令
        case ["calc", a, op, b] if a.lstrip('-').isdigit() and b.lstrip('-').isdigit():
            result = calculate(int(a), op, int(b))
            return f"{a} {op} {b} = {result}"
        
        # 错误格式
        case ["calc", *args]:
            return f"calc 命令格式错误，应为: calc <a> <op> <b>"
        
        # 未知命令
        case [cmd, *args]:
            return f"未知命令: {cmd}（参数: {args}）"
        
        case _:
            return "无法解析"


def calculate(a, op, b):
    """计算器（用 match-case）"""
    match op:
        case "+": return a + b
        case "-": return a - b
        case "*": return a * b
        case "/": return a / b if b != 0 else "除零错误"
        case _: return f"未知运算符 {op}"


# 测试各种命令
test_commands = [
    "quit",
    "help",
    "list",
    "list users",
    "get 42",
    "create user alice",
    "calc 10 + 5",
    "calc 100 / 7",
    "calc 10 * 0",
    "calc 10 ^ 5",      # 未知运算符
    "unknown arg1 arg2",
]

print("=" * 50)
print("      命令行解析器演示")
print("=" * 50)
for cmd in test_commands:
    result = parse_command(cmd)
    print(f"\\n$ {cmd}")
    print(f"  {result}")
\`\`\`

这段 demo 综合用了：序列模式、OR 模式、守卫（if 条件）、通配符、解构匹配。**展示了 match-case 在命令解析中的优雅**。

## match-case vs if-elif

### 何时用 match-case

1. **多分支判断同一个值**：\`match x:\` 比 \`if x == ...:\` 更清晰
2. **解构复杂数据**：序列模式、映射模式比手动取值好读
3. **类型分发**：根据对象类型执行不同代码

### 何时用 if-elif

1. **不同条件的判断**：每个分支条件不同
2. **复杂逻辑组合**：需要 \`and\` \`or\` 组合
3. **Python 3.10 以下**：不支持 match-case

\`\`\`python
# 用 if-elif（条件不同）
if age < 18:
    print("未成年")
elif age >= 65:
    print("老年")
elif has_job:
    print("在职")
else:
    print("其他")

# 用 match-case（同一个值的多分支）
match command:
    case "quit" | "exit":
        ...
    case "help":
        ...
\`\`\`

## ⚠️ 初学者常见坑

### 坑一：match-case 最低版本

\`\`\`python
# Python 3.10 之前不支持 match-case
# 会报 SyntaxError

# 检查版本
import sys
if sys.version_info < (3, 10):
    print("需要 Python 3.10+")
\`\`\`

### 坑二：变量名被当作捕获模式

\`\`\`python
match x:
    case 0:
        print("零")
    case n:    # n 是绑定变量，匹配任何值！
        print(f"非零: {n}")

# 想匹配字面量字符串 "n"，要用引号
match x:
    case "n":    # 匹配字符串 "n"
        print("是 n")
\`\`\`

### 坑三：忘记写 default（_）

\`\`\`python
# 没匹配上不会报错，但可能漏处理
match x:
    case 1:
        ...
    case 2:
        ...
# 如果 x 是 3，什么都不发生

# 推荐：总是加 default
match x:
    case 1: ...
    case 2: ...
    case _: print(f"未知: {x}")
\`\`\`

### 坑四：break 只跳一层

\`\`\`python
# 嵌套循环里 break 只跳出最内层
for i in range(3):
    for j in range(3):
        if j == 1:
            break    # 只跳内层
    print(f"外层 {i}")    # 还会执行
\`\`\`

## 小结

- \`break\`：彻底跳出循环；\`continue\`：跳过本次；\`pass\`：占位
- \`for/while-else\`：循环正常结束（没 break）时执行 else
- \`match-case\`（Python 3.10+）：结构化模式匹配，比 if-elif 更强大
- 模式类型：字面量、捕获（变量绑定）、序列解构、映射解构、类匹配
- \`_\` 是通配符，匹配任何值，相当于 default
- \`|\` 表示"或"，匹配多个值之一
- 守卫（\`if\`）给模式加额外条件
- \`as\` 给匹配值起别名
- match-case 适合"同一值的多分支"和"复杂数据解构"

## 常见疑问 Q&A

**Q：match-case 和 if-elif 哪个好？**
A：同一值的多分支判断用 match-case 更清晰；不同条件判断用 if-elif。复杂解构（字典、列表、对象）用 match-case 优势明显。

**Q：match-case 必须有 default 吗？**
A：不必须，但推荐加 \`case _:\` 处理"意外情况"，避免漏处理。

**Q：\`case n:\` 里的 n 是什么？**
A：是"捕获模式"——绑定变量，匹配任何值并把它赋给 n。要匹配字面量字符串 "n" 得用 \`case "n":\`。

**Q：match-case 性能比 if-elif 好吗？**
A：差不多。match-case 主要优势是**可读性**和**模式匹配能力**（解构、类型匹配），不是性能。

**Q：Python 3.9 及以下怎么办？**
A：用 if-elif 代替，或升级到 3.10+。match-case 是语法特性，无法用 import 兼容。`
  }
];
