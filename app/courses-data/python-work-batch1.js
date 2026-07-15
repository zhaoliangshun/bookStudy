// =============================================================
// 《Python工作实战手册》—— 第一批 · 基础语法入门
// -------------------------------------------------------------
// 面向工作中常用Python的开发者，重点覆盖日常开发高频用法
// 每章含：讲解（Markdown，内嵌Python代码块）+ 可复制代码（code字段）
// 代码要求：
//   - 多demo、多注释（中文注释，解释每一行/每一段的作用）
//   - 贴近真实工作场景，不是玩具示例
//   - 避免使用input()等交互式输入
//   - 使用固定示例数据，脚本可直接运行
// =============================================================

export const chapters = [
  {
    id: "py-hello",
    group: "基础语法入门 · 打好地基",
    icon: "🚀",
    title: "第一个Python程序与环境",
    content: `## 第一个Python程序

Python是解释型语言，写完就能跑，不需要编译。语法简洁优雅，被广泛应用于数据分析、自动化脚本、Web开发、人工智能等工作场景。

### 安装与运行

工作中推荐使用Python 3.8+。检查版本：

\`\`\`bash
python3 --version
\`\`\`

运行Python文件：

\`\`\`bash
python3 hello.py
\`\`\`

### Hello World

\`\`\`python
# 这是注释，Python用#表示单行注释
# print()是输出函数，括号里放要打印的内容
print("Hello, Python!")  # 打印字符串
print("你好，世界！")      # Python 3默认支持中文

# f-string格式化（Python 3.6+推荐用法，工作中最常用）
name = "张三"
age = 28
print(f"姓名：{name}，年龄：{age}")  # f前面的字符串可以直接嵌入变量
\`\`\`

### 工作中的Python脚本结构

一个规范的Python脚本通常这样写：

\`\`\`python
#!/usr/bin/env python3          # shebang行，告诉系统用python3执行（Linux/Mac）
# -*- coding: utf-8 -*-         # 声明文件编码（Python 3默认utf-8，可省略）
"""
文件说明：这是一个示例脚本
作者：xxx
日期：2025-01-01
"""

def main():
    """主函数：程序入口"""
    print("程序开始执行")
    # 在这里写你的逻辑

if __name__ == "__main__":
    # 当文件直接运行时（不是被import时），执行main函数
    main()
\`\`\`

**为什么要有 \`if __name__ == "__main__"\`？**
当这个文件被其他文件 import 时，\`__name__\` 的值是模块名（不是"__main__"），main()不会执行，避免了导入时就跑代码的问题。这是工作中的标准写法。`,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第一章 demo：第一个Python程序
演示：print输出、f-string格式化、脚本标准结构
工作场景：员工基本信息展示
"""

def main():
    # 1. 最基本的输出
    print("=" * 50)
    print("Hello, Python! 你好，世界！")
    print("=" * 50)

    # 2. 变量定义与f-string格式化（工作中最常用）
    name = "张三"           # 字符串变量：员工姓名
    age = 28                # 整数变量：员工年龄
    salary = 15000.50       # 浮点数变量：员工月薪
    is_active = True        # 布尔变量：是否在职
    department = "技术部"    # 字符串变量：所属部门

    # f-string：在字符串前加f，用{}嵌入变量或表达式
    print(f"姓名：{name}")
    print(f"年龄：{age}岁")
    print(f"薪资：{salary}元")
    print(f"部门：{department}")
    print(f"在职状态：{'在职' if is_active else '离职'}")

    # 3. 表达式也可以放进{}里
    print(f"明年年龄：{age + 1}岁")
    print(f"年薪（12个月）：{salary * 12:.2f}元")  # :.2f表示保留2位小数

    # 4. 打印分隔线
    print("=" * 50)
    print("程序执行完毕")

if __name__ == "__main__":
    main()
`
  },
  {
    id: "py-variables",
    group: "基础语法入门 · 打好地基",
    icon: "📦",
    title: "变量与数据类型",
    content: `## 变量与数据类型

变量是存储数据的容器。Python是动态类型语言，不需要声明变量类型，解释器会自动推断。

### 基本数据类型

工作中最常用的5种基本类型：

| 类型 | 说明 | 示例 |
|------|------|------|
| int | 整数 | 28, -5, 10000 |
| float | 浮点数（小数） | 15000.50, 3.14 |
| str | 字符串 | "张三", 'hello' |
| bool | 布尔值 | True, False |
| NoneType | 空值 | None |

\`\`\`python
# 使用type()查看变量类型
employee_name = "李四"
employee_age = 30
employee_salary = 18000.0
is_fulltime = True
manager = None  # 还未分配经理

print(type(employee_name))   # <class 'str'>
print(type(employee_age))    # <class 'int'>
print(type(employee_salary)) # <class 'float'>
print(type(is_fulltime))     # <class 'bool'>
print(type(manager))         # <class 'NoneType'>
\`\`\`

### 类型转换

工作中经常需要在不同类型之间转换：

\`\`\`python
# 字符串转整数
age_str = "25"
age = int(age_str)
print(age + 1)  # 26

# 整数转字符串
order_id = 10086
order_id_str = str(order_id)
print("订单号：" + order_id_str)

# 字符串转浮点数
price_str = "99.9"
price = float(price_str)
print(price * 2)  # 199.8

# 浮点数转整数（直接截断小数部分，不是四舍五入！）
print(int(99.9))  # 99
print(int(-99.9)) # -99
\`\`\`

### 多变量赋值

\`\`\`python
# 同时给多个变量赋值
name, age, salary = "王五", 32, 22000.0

# 交换两个变量的值（工作中常用，不需要临时变量）
a, b = 10, 20
a, b = b, a
print(a, b)  # 20 10
\`\`\`

### 变量命名规范（PEP 8）

- 只能包含字母、数字、下划线
- 不能以数字开头
- 不能用Python关键字（if, for, while, class等）
- 小写字母+下划线：\`employee_name\`、\`order_total\`（蛇形命名，工作推荐）
- 见名知意：不要用a/b/c，要用name/age/salary

**工作场景提示：** 处理CSV/Excel数据时，经常需要把读进来的字符串转换成数字类型进行计算。`,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第二章 demo：变量与数据类型
演示：基本数据类型、type()、类型转换、多变量赋值
工作场景：员工信息数据处理（从CSV读取后的数据类型转换）
"""

def main():
    print("=" * 60)
    print("【员工信息数据类型处理演示】")
    print("=" * 60)

    # ========== 1. 定义不同类型的员工数据 ==========
    # 模拟从CSV文件读入的数据（CSV读入默认都是字符串）
    emp_id_str = "EMP001"
    name_str = "李四"
    age_str = "30"
    salary_str = "18500.75"
    is_fulltime_str = "True"
    department = "技术部"
    bonus_rate = 0.15  # 奖金比例15%

    print("\\n--- 原始数据（从CSV读取，大多是字符串）---")
    print(f"工号: {emp_id_str}, 类型: {type(emp_id_str)}")
    print(f"姓名: {name_str}, 类型: {type(name_str)}")
    print(f"年龄字符串: {age_str}, 类型: {type(age_str)}")
    print(f"薪资字符串: {salary_str}, 类型: {type(salary_str)}")

    # ========== 2. 类型转换（工作中高频操作）==========
    # 字符串转整数：用于年龄、数量等计算
    age = int(age_str)
    
    # 字符串转浮点数：用于薪资、价格等精确计算
    salary = float(salary_str)
    
    # 字符串转布尔值（注意：bool("False")是True！工作中常见坑）
    is_fulltime = is_fulltime_str.lower() == "true"

    print("\\n--- 类型转换后（可进行数学计算）---")
    print(f"年龄: {age}岁, 类型: {type(age)}")
    print(f"薪资: {salary}元, 类型: {type(salary)}")
    print(f"是否正式员工: {is_fulltime}, 类型: {type(is_fulltime)}")

    # ========== 3. 多变量赋值（工作中常用技巧）==========
    # 同时给多个变量赋值
    manager_name, manager_age, manager_salary = "张经理", 35, 35000.0
    print("\\n--- 多变量赋值示例 ---")
    print(f"经理：{manager_name}, {manager_age}岁, 月薪{manager_salary}元")

    # 交换两个变量（不需要临时变量）
    junior_salary, senior_salary = 12000, 25000
    print(f"\\n交换前 - 初级：{junior_salary}, 高级：{senior_salary}")
    junior_salary, senior_salary = senior_salary, junior_salary
    print(f"交换后 - 初级：{junior_salary}, 高级：{senior_salary}")

    # ========== 4. 实际计算场景 ==========
    print("\\n--- 薪资计算 ---")
    annual_salary = salary * 12
    bonus = salary * bonus_rate
    total_annual = annual_salary + bonus
    
    print(f"基本工资（年）: {annual_salary:.2f}元")
    print(f"年终奖金: {bonus:.2f}元")
    print(f"年度总收入: {total_annual:.2f}元")
    print(f"5年后年龄: {age + 5}岁")

    # ========== 5. None的使用 ==========
    # None表示空值，工作中常用于"还没有值"的状态
    resign_date = None  # 离职日期：None表示在职
    if resign_date is None:
        print("\\n离职日期：未离职（None表示空值）")

    print("\\n" + "=" * 60)
    print("数据处理完成")

if __name__ == "__main__":
    main()
`
  },
  {
    id: "py-numbers",
    group: "基础语法入门 · 打好地基",
    icon: "🔢",
    title: "数字与运算",
    content: `## 数字与运算

Python支持多种数字类型，工作中最常用的是int（整数）和float（浮点数）。

### 算术运算符

| 运算符 | 说明 | 示例 | 结果 |
|--------|------|------|------|
| + | 加法 | 10 + 3 | 13 |
| - | 减法 | 10 - 3 | 7 |
| * | 乘法 | 10 * 3 | 30 |
| / | 除法（结果总是float） | 10 / 3 | 3.333... |
| // | 整数除法（地板除，向下取整） | 10 // 3 | 3 |
| % | 取余（取模） | 10 % 3 | 1 |
| ** | 幂运算 | 10 ** 3 | 1000 |

\`\`\`python
# /和//的区别是工作中高频坑点！
print(10 / 3)   # 3.3333333333333335  （普通除法，返回float）
print(10 // 3)  # 3                    （整数除法，只取整数部分）
print(-10 // 3) # -4                   （注意！向下取整，不是-3）

# %取余的常用场景：判断奇偶、分页
print(7 % 2)   # 1  奇数
print(8 % 2)   # 0  偶数
print(100 % 10) # 0  能被10整除
\`\`\`

### 浮点数精度问题（工作常见坑）

\`\`\`python
# 坑！浮点数不是精确存储的
print(0.1 + 0.2)  # 0.30000000000000004，不是0.3！

# 工作中处理金额：用round()四舍五入，或用decimal模块
print(round(0.1 + 0.2, 2))  # 0.3
\`\`\`

### math模块常用函数

\`\`\`python
import math

print(math.ceil(3.2))   # 4  向上取整
print(math.floor(3.9))  # 3  向下取整
print(math.sqrt(16))    # 4.0  平方根
print(math.pi)          # 3.141592653589793
print(round(3.14159, 2))  # 3.14  四舍五入保留2位小数
\`\`\`

### 数字格式化（千分位）

\`\`\`python
revenue = 12345678.9
print(f"{revenue:,}")           # 12,345,678.9  千分位分隔
print(f"{revenue:,.2f}")        # 12,345,678.90 千分位+2位小数
print(f"{revenue:,.0f}")        # 12,345,679  千分位+取整
\`\`\`

**工作场景提示：** 计算订单金额、工资、库存时要特别注意整数除法和浮点数精度问题。金额计算建议使用decimal模块。`,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第三章 demo：数字与运算
演示：算术运算符、//和/的区别、浮点数精度、math模块、千分位格式化
工作场景：订单金额计算、库存管理、数据统计
"""

import math

def main():
    print("=" * 60)
    print("【数字运算 - 订单与库存计算场景】")
    print("=" * 60)

    # ========== 1. 算术运算符基础 ==========
    print("\\n--- 基础算术运算 ---")
    product_price = 99.9
    quantity = 12
    discount_rate = 0.8  # 8折

    subtotal = product_price * quantity
    discount_amount = subtotal * (1 - discount_rate)
    total = subtotal * discount_rate

    print(f"商品单价：{product_price}元")
    print(f"购买数量：{quantity}件")
    print(f"小计金额：{subtotal:.2f}元")
    print(f"优惠金额：{discount_amount:.2f}元")
    print(f"实付金额：{total:.2f}元")

    # ========== 2. //和/的区别（工作高频坑）==========
    print("\\n--- 整数除法// vs 普通除法/ ---")
    total_stock = 100
    items_per_box = 8

    boxes_full = total_stock // items_per_box  # 能装满多少箱
    remaining = total_stock % items_per_box    # 剩余多少件
    boxes_needed = math.ceil(total_stock / items_per_box)  # 需要多少箱

    print(f"总库存：{total_stock}件")
    print(f"每箱装：{items_per_box}件")
    print(f"可装满：{boxes_full}箱")
    print(f"剩余：{remaining}件")
    print(f"总共需要箱子：{boxes_needed}个（ceil向上取整）")

    # 负数除法注意事项
    print(f"\\n注意：-10 // 3 = {-10 // 3}（向下取整，不是-3）")

    # ========== 3. 浮点数精度问题（工作常见坑）==========
    print("\\n--- 浮点数精度问题演示 ---")
    price1 = 0.1
    price2 = 0.2
    sum_price = price1 + price2
    print(f"0.1 + 0.2 = {sum_price}")  # 不是0.3！这是浮点数存储问题
    print(f"round后：{round(sum_price, 2)}")  # 用round解决

    # 金额计算正确做法：用round保留2位小数
    item1 = 19.99
    item2 = 29.99
    item3 = 9.99
    order_total = round(item1 + item2 + item3, 2)
    print(f"\\n订单金额计算：")
    print(f"商品1：{item1}元")
    print(f"商品2：{item2}元")
    print(f"商品3：{item3}元")
    print(f"总计（round后）：{order_total}元")

    # ========== 4. math模块常用函数 ==========
    print("\\n--- math模块常用函数 ---")
    monthly_sales = [125000, 138000, 142000, 118000, 155000, 162000]
    total_sales = sum(monthly_sales)
    avg_sales = total_sales / len(monthly_sales)
    
    print(f"上半年销售总额：{total_sales:,}元")
    print(f"月均销售额：{avg_sales:,.2f}元")
    print(f"月均向上取整：{math.ceil(avg_sales):,}元")
    print(f"月均向下取整：{math.floor(avg_sales):,}元")
    print(f"sqrt(144) = {math.sqrt(144)}")

    # ========== 5. 幂运算和增长率计算 ==========
    print("\\n--- 幂运算：复合增长率计算 ---")
    initial_users = 10000
    monthly_growth = 0.05  # 月增长5%
    months = 12

    # ** 是幂运算：计算12个月后的用户数
    users_after = initial_users * (1 + monthly_growth) ** months
    print(f"初始用户：{initial_users:,}人")
    print(f"月增长率：{monthly_growth*100}%")
    print(f"{months}个月后用户数：{users_after:,.0f}人")

    # ========== 6. 数字格式化（千分位）==========
    print("\\n--- 千分位格式化（报表常用）---")
    revenue = 12345678.9123
    print(f"原样输出：{revenue}")
    print(f"千分位分隔：{revenue:,}")
    print(f"千分位+2位小数：{revenue:,.2f}")
    print(f"千分位+取整：{revenue:,.0f}")

    print("\\n" + "=" * 60)
    print("数字运算演示完成")

if __name__ == "__main__":
    main()
`
  },
  {
    id: "py-strings-basic",
    group: "基础语法入门 · 打好地基",
    icon: "📝",
    title: "字符串基础操作",
    content: `## 字符串基础操作

字符串（str）是工作中最常用的数据类型之一，用于存储文本信息，如姓名、地址、日志、JSON等。

### 字符串的定义

\`\`\`python
# 单引号和双引号都可以（工作中两种都常见，保持统一即可）
name1 = '张三'
name2 = "李四"

# 三引号用于多行字符串
message = """这是第一行
这是第二行
这是第三行"""

# 字符串中包含引号
sentence1 = "I'm a developer"  # 双引号里可以用单引号
sentence2 = '他说："你好"'      # 单引号里可以用双引号
\`\`\`

### 字符串拼接与重复

\`\`\`python
# 拼接：+号
first_name = "张"
last_name = "三"
full_name = first_name + last_name  # "张三"

# 重复：*号
line = "-" * 50  # 50个横杠，工作中常用来打印分隔线
print(line)
\`\`\`

### 索引与切片（工作中极其常用）

\`\`\`python
s = "Hello, Python!"

# 索引：从0开始
print(s[0])   # H  第一个字符
print(s[-1])  # !  最后一个字符
print(s[-2])  # n  倒数第二个字符

# 切片：s[起始:结束]  左闭右开（包含起始，不包含结束）
print(s[0:5])    # Hello  前5个字符
print(s[7:])     # Python!  从第7个到最后
print(s[:5])     # Hello  从开头到第4个
print(s[-6:])    # Python  最后6个字符
print(s[::2])    # HloPto  步长为2，每隔一个取一个
\`\`\`

### len()与in判断

\`\`\`python
phone = "13812345678"
print(len(phone))  # 11  字符串长度

# in判断子串是否存在（工作中高频）
email = "zhangsan@company.com"
print("@" in email)        # True
print("company" in email)  # True
print("gmail" in email)    # False
\`\`\`

### 字符串不可变性

\`\`\`python
# 字符串是不可变的！不能直接修改某个字符
s = "hello"
# s[0] = "H"  # 报错！字符串不支持修改

# 正确做法：创建新字符串
s = "H" + s[1:]  # "Hello"
\`\`\`

**工作场景提示：** 切片常用于提取固定格式的数据，如从身份证号提取出生日期、从URL提取参数、从日志中提取时间戳等。`,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第四章 demo：字符串基础操作
演示：字符串定义、拼接、索引切片、len()、in判断、不可变性
工作场景：员工信息处理、日志分析、数据提取
"""

def main():
    print("=" * 60)
    print("【字符串基础操作演示】")
    print("=" * 60)

    # ========== 1. 字符串定义 ==========
    print("\\n--- 字符串定义 ---")
    emp_id = "EMP001"
    name = "张三"
    department = "技术研发部"
    print(f"工号：{emp_id}")
    print(f"姓名：{name}")
    print(f"部门：{department}")

    # 三引号多行字符串：用于长文本、SQL语句等
    sql_query = """
    SELECT id, name, salary
    FROM employees
    WHERE department = '技术部'
      AND salary > 15000
    ORDER BY salary DESC
    """
    print("\\nSQL查询语句：")
    print(sql_query)

    # ========== 2. 字符串拼接与重复 ==========
    print("--- 字符串拼接与重复 ---")
    first_name = "张"
    last_name = "三"
    full_name = first_name + last_name
    position = "高级工程师"
    
    # 拼接：+号
    intro = full_name + " - " + position
    print(f"简介：{intro}")

    # 重复：*号（打印分隔线非常好用）
    divider = "=" * 60
    dash_line = "-" * 40
    print(divider)
    print("分隔线演示")
    print(dash_line)

    # ========== 3. 索引与切片（最常用！）==========
    print("\\n--- 索引与切片（数据提取场景）---")
    
    # 身份证号提取出生日期
    id_card = "110101199001011234"
    print(f"身份证号：{id_card}")
    print(f"长度：{len(id_card)}位")
    print(f"前6位（地区码）：{id_card[:6]}")
    print(f"第7-14位（出生日期）：{id_card[6:14]}")
    birth_year = id_card[6:10]
    birth_month = id_card[10:12]
    birth_day = id_card[12:14]
    print(f"生日：{birth_year}年{birth_month}月{birth_day}日")
    print(f"最后4位：{id_card[-4:]}")

    # 手机号脱敏处理
    phone = "13812345678"
    masked_phone = phone[:3] + "****" + phone[-4:]
    print(f"\\n原始手机号：{phone}")
    print(f"脱敏后：{masked_phone}")

    # 邮箱提取用户名和域名
    email = "zhangsan@company.com"
    at_pos = email.index("@")
    username = email[:at_pos]
    domain = email[at_pos+1:]
    print(f"\\n邮箱：{email}")
    print(f"用户名：{username}")
    print(f"域名：{domain}")

    # 字符串反转（步长-1）
    original = "Python"
    reversed_str = original[::-1]
    print(f"\\n原字符串：{original}")
    print(f"反转后：{reversed_str}")

    # ========== 4. len()与in判断 ==========
    print("\\n--- len()与in判断 ---")
    
    # 验证手机号长度
    phone1 = "13812345678"
    phone2 = "12345"
    print(f"手机号{phone1}长度：{len(phone1)} {'✓合法' if len(phone1) == 11 else '✗不合法'}")
    print(f"手机号{phone2}长度：{len(phone2)} {'✓合法' if len(phone2) == 11 else '✗不合法'}")

    # in判断：敏感词过滤、日志分类
    log_message = "ERROR: 数据库连接失败，请检查网络"
    print(f"\\n日志：{log_message}")
    print(f"是否包含ERROR：{'ERROR' in log_message}")
    print(f"是否包含WARNING：{'WARNING' in log_message}")
    print(f"是否包含数据库：{'数据库' in log_message}")

    # 检查文件扩展名
    filename = "report_2025.pdf"
    print(f"\\n文件名：{filename}")
    print(f"是否是PDF：{filename.endswith('.pdf')}")
    print(f"是否是Excel：{'.xlsx' in filename or '.xls' in filename}")

    # ========== 5. 字符串不可变性演示 ==========
    print("\\n--- 字符串不可变性 ---")
    greeting = "hello world"
    print(f"原始：{greeting}")
    
    # 不能直接修改：greeting[0] = "H" 会报错
    # 正确做法：创建新字符串
    new_greeting = "H" + greeting[1:]
    print(f"首字母大写后：{new_greeting}")

    # 将所有小写字母转为大写（也是创建新字符串）
    upper_greeting = greeting.upper()
    print(f"全部大写：{upper_greeting}")

    print("\\n" + "=" * 60)
    print("字符串基础操作演示完成")

if __name__ == "__main__":
    main()
`
  },
  {
    id: "py-strings-methods",
    group: "基础语法入门 · 打好地基",
    icon: "🔤",
    title: "字符串常用方法（工作必备）",
    content: `## 字符串常用方法（工作必备）

Python字符串提供了非常多内置方法，这些方法**不会修改原字符串**（因为字符串不可变），而是返回新字符串。

### 去空白：strip/lstrip/rstrip

工作中处理用户输入、Excel数据时必备！

\`\`\`python
s = "  Hello, World!  "
print(s.strip())   # "Hello, World!"  去掉两边空白
print(s.lstrip())  # "Hello, World!  "  只去左边
print(s.rstrip())  # "  Hello, World!"  只去右边
\`\`\`

### split分割与join合并（最常用！）

\`\`\`python
# split：按分隔符把字符串切成列表
date_str = "2025-01-15"
year, month, day = date_str.split("-")  # ["2025", "01", "15"]

# join：把列表合并成字符串（注意：join是字符串方法，不是列表方法）
items = ["苹果", "香蕉", "橙子"]
result = "、".join(items)  # "苹果、香蕉、橙子"
\`\`\`

### replace替换

\`\`\`python
text = "我喜欢Java，Java很好用"
new_text = text.replace("Java", "Python")
print(new_text)  # "我喜欢Python，Python很好用"
\`\`\`

### 查找与统计：find/index/count/startswith/endswith

\`\`\`python
s = "Hello Python Python"
print(s.find("Python"))     # 6  返回第一个出现的位置，找不到返回-1
print(s.count("Python"))    # 2  统计出现次数
print(s.startswith("Hello"))# True  是否以...开头
print(s.endswith("Python")) # True  是否以...结尾
\`\`\`

### 大小写转换与判断

\`\`\`python
s = "Hello, World!"
print(s.upper())      # "HELLO, WORLD!"
print(s.lower())      # "hello, world!"
print(s.title())      # "Hello, World!"
print("123".isdigit()) # True  是否全是数字
print("abc".isalpha()) # True  是否全是字母
\`\`\`

### 对齐：zfill/rjust/ljust

\`\`\`python
# zfill补零：常用于编号、日期补零
print("5".zfill(3))       # "005"
print("12".zfill(3))      # "012"
print("abc".rjust(10))    # "       abc"  右对齐
print("abc".ljust(10))    # "abc       "  左对齐
\`\`\`

**工作场景提示：** 
- **split+join**：CSV/日志解析最常用
- **strip**：清洗数据时去掉多余空格
- **replace**：批量替换文本
- **startswith/endswith**：过滤特定类型的文件/日志`,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第五章 demo：字符串常用方法
演示：strip、split、join、replace、find、count、startswith、endswith等
工作场景：日志解析、数据清洗、CSV处理、用户输入处理
"""

def main():
    print("=" * 60)
    print("【字符串常用方法 - 日志解析与数据清洗场景】")
    print("=" * 60)

    # ========== 1. strip：去空白（数据清洗必备）==========
    print("\\n--- 1. strip：去空白 ---")
    # 模拟从Excel/用户输入读到的数据，经常有多余空格
    raw_data = [
        "  张三  ",
        "李四   ",
        "   王五",
        "  赵 六  "
    ]
    print("原始数据（含空格）：")
    for name in raw_data:
        print(f"  '{name}'")

    cleaned_data = [name.strip() for name in raw_data]
    print("\\n清洗后（strip()）：")
    for name in cleaned_data:
        print(f"  '{name}'")

    # 去掉特定字符
    price_str = "￥199.00元"
    price = float(price_str.strip("￥元"))
    print(f"\\n价格字符串：'{price_str}'")
    print(f"提取数值：{price}元")

    # ========== 2. split分割（CSV/日志解析核心）==========
    print("\\n--- 2. split：分割字符串 ---")
    # 模拟CSV一行数据
    csv_line = "EMP001,张三,技术部,15000,2025-01-15"
    print(f"CSV原始行：{csv_line}")
    
    fields = csv_line.split(",")
    print(f"分割后字段：{fields}")
    emp_id, emp_name, dept, salary, hire_date = fields
    print(f"工号：{emp_id}")
    print(f"姓名：{emp_name}")
    print(f"部门：{dept}")
    print(f"薪资：{salary}元")

    # 按日期分割
    year, month, day = hire_date.split("-")
    print(f"入职日期：{year}年{month}月{day}日")

    # 分割日志（常见日志格式）
    log_line = "2025-01-15 14:30:22 [ERROR] 用户登录失败: 用户名或密码错误"
    print(f"\\n日志行：{log_line}")
    parts = log_line.split(" ", 3)  # 最多分割3次
    log_date = parts[0]
    log_time = parts[1]
    log_level = parts[2].strip("[]")
    log_msg = parts[3]
    print(f"日期：{log_date}")
    print(f"时间：{log_time}")
    print(f"级别：{log_level}")
    print(f"消息：{log_msg}")

    # ========== 3. join合并（比+拼接高效得多）==========
    print("\\n--- 3. join：合并列表为字符串 ---")
    # 拼接路径（工作中推荐用os.path.join，这里演示join用法）
    path_parts = ["home", "user", "documents", "report.pdf"]
    file_path = "/".join(path_parts)
    print(f"路径拼接：{file_path}")

    # 拼接SQL的IN条件
    user_ids = ["1001", "1002", "1003", "1004"]
    sql_in = "','".join(user_ids)
    sql = f"SELECT * FROM users WHERE id IN ('{sql_in}')"
    print(f"SQL拼接：{sql}")

    # ========== 4. replace替换 ==========
    print("\\n--- 4. replace：替换 ---")
    # 敏感词替换
    comment = "这个产品太差了，服务也差！"
    cleaned_comment = comment.replace("差", "*")
    print(f"原始评论：{comment}")
    print(f"敏感词替换后：{cleaned_comment}")

    # 模板变量替换
    template = "您好，{name}！您的订单{order_id}已发货，金额{amount}元。"
    msg = template.replace("{name}", "张三").replace("{order_id}", "ORD12345").replace("{amount}", "299")
    print(f"\\n模板替换后：{msg}")

    # ========== 5. 查找与统计 ==========
    print("\\n--- 5. 查找与统计 ---")
    article = "Python是一门优雅的语言。Python简单易学，Python功能强大。我喜欢Python！"
    
    python_count = article.count("Python")
    print(f"文章中'Python'出现次数：{python_count}")
    
    first_pos = article.find("Python")
    print(f"第一次出现位置：{first_pos}")
    
    print(f"是否以'Python'开头：{article.startswith('Python')}")
    print(f"是否以'！'结尾：{article.endswith('！')}")

    # 统计日志中ERROR数量
    logs = [
        "INFO: 程序启动",
        "ERROR: 数据库连接失败",
        "WARNING: 内存使用率过高",
        "ERROR: 网络超时",
        "INFO: 重试成功",
        "ERROR: 文件不存在"
    ]
    error_count = sum(1 for log in logs if "ERROR" in log)
    print(f"\\n日志总数：{len(logs)}")
    print(f"ERROR数量：{error_count}")

    # ========== 6. 大小写转换与类型判断 ==========
    print("\\n--- 6. 大小写转换与判断 ---")
    username_input = "  ZhangSan  "
    username = username_input.strip().lower()  # 统一转小写存储
    print(f"用户输入用户名：'{username_input}'")
    print(f"标准化后：'{username}'")

    # 判断验证码（不区分大小写）
    captcha = "AbC123"
    user_input = "abc123"
    print(f"\\n验证码：{captcha}")
    print(f"用户输入：{user_input}")
    print(f"验证是否通过：{captcha.lower() == user_input.lower()}")

    # isdigit判断是否是数字
    inputs = ["123", "abc", "12.3", "-45", "0"]
    print("\\n数字判断：")
    for inp in inputs:
        print(f"  '{inp}' 是否全是数字：{inp.isdigit()}")

    # ========== 7. 对齐与补零 ==========
    print("\\n--- 7. 对齐与补零（生成编号/报表）---")
    # 生成订单号（补零）
    for i in range(1, 6):
        order_num = str(i).zfill(6)
        print(f"订单号：ORD{order_num}")

    # 报表对齐
    print("\\n员工薪资报表：")
    print("-" * 40)
    print(f"{'姓名':<8}{'部门':<10}{'薪资':>10}")
    print("-" * 40)
    employees = [
        ("张三", "技术部", 18000),
        ("李四", "市场部", 15000),
        ("王五五", "财务部", 16500),
    ]
    for name, dept, salary in employees:
        print(f"{name:<8}{dept:<10}{salary:>10,}元")
    print("-" * 40)

    print("\\n" + "=" * 60)
    print("字符串方法演示完成")

if __name__ == "__main__":
    main()
`
  },
  {
    id: "py-input-output",
    group: "基础语法入门 · 打好地基",
    icon: "💬",
    title: "输入输出与格式化",
    content: `## 输入输出与格式化

### print高级用法

\`\`\`python
# sep参数：设置多个值之间的分隔符（默认是空格）
print("2025", "01", "15", sep="-")  # 2025-01-15

# end参数：设置结尾字符（默认是换行\\n）
print("Loading", end="")
print("...", end="")
print("Done")  # Loading...Done（三行打印在同一行）
\`\`\`

### f-string进阶（Python 3.6+，工作首选）

f-string是目前最推荐的字符串格式化方式，功能强大且易读：

\`\`\`python
name = "张三"
salary = 15000.567

# 基础用法
print(f"姓名：{name}")

# 精度控制
print(f"薪资：{salary:.2f}元")  # 保留2位小数：15000.57

# 千分位分隔
print(f"年薪：{salary*12:,.2f}元")  # 180,006.80

# 对齐与填充
print(f"|{name:>10}|")  # 右对齐，宽度10：|      张三|
print(f"|{name:<10}|")  # 左对齐：|张三      |
print(f"|{name:^10}|")  # 居中：|   张三   |
print(f"|{name:*^10}|") # 用*填充居中：|***张三****|

# 百分比
rate = 0.875
print(f"完成率：{rate:.1%}")  # 87.5%
\`\`\`

### str.format()（了解即可，老代码常见）

\`\`\`python
print("姓名：{}，年龄：{}".format("张三", 28))
print("姓名：{0}，年龄：{1}，{0}的工资是{2}".format("张三", 28, 15000))
print("姓名：{name}，薪资：{salary}".format(name="李四", salary=18000))
\`\`\`

### %旧式格式化（了解即可，不推荐新代码使用）

\`\`\`python
print("姓名：%s，年龄：%d" % ("张三", 28))  # %s字符串，%d整数，%f浮点数
\`\`\`

**工作中关于input()的建议：**
- 脚本自动化、数据处理时**避免使用input()**，因为它需要人工交互，无法自动化运行
- 配置信息推荐写在配置文件、常量、或命令行参数中
- 本教程所有demo都使用硬编码数据，脚本可以直接运行

**工作场景提示：** 生成报表、日志输出、打印进度条时，f-string的对齐和格式化功能非常有用。`,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第六章 demo：输入输出与格式化
演示：print高级用法、f-string进阶（对齐/填充/精度/千分位/百分比）
工作场景：报表生成、日志输出、格式化展示
"""

def main():
    print("=" * 70)
    print("【print高级用法与f-string格式化 - 员工报表场景】")
    print("=" * 70)

    # ========== 1. print的sep和end参数 ==========
    print("\\n--- 1. print的sep和end参数 ---")
    
    # sep：分隔符，用于拼接日期、时间等
    print("日期拼接：", end="")
    print(2025, 1, 15, sep="-")
    
    print("时间拼接：", end="")
    print(14, 30, 45, sep=":")

    # end：不换行，常用于进度条、加载动画
    print("\\n模拟进度：", end="", flush=True)
    for i in range(10):
        print("█", end="", flush=True)
        import time
        time.sleep(0.1)
    print(" 完成！")

    # ========== 2. f-string基础与精度控制 ==========
    print("\\n--- 2. f-string精度控制 ---")
    employee_name = "张三"
    basic_salary = 15000.5678
    bonus_rate = 0.15678
    tax_rate = 0.135

    print(f"员工：{employee_name}")
    print(f"基本工资：{basic_salary:.2f}元")           # 保留2位小数
    print(f"基本工资：{basic_salary:.0f}元")           # 取整
    print(f"奖金比例：{bonus_rate:.2%}")               # 百分比
    print(f"税率：{tax_rate:.1%}")                     # 百分比，1位小数

    # ========== 3. 千分位分隔（财务报表必备）==========
    print("\\n--- 3. 千分位格式化 ---")
    annual_revenue = 123456789.12345
    total_cost = 98765432.5678
    profit = annual_revenue - total_cost

    print(f"年度营收：{annual_revenue:,.2f}元")
    print(f"年度成本：{total_cost:,.2f}元")
    print(f"年度利润：{profit:,.2f}元")

    # ========== 4. 对齐与填充（表格打印）==========
    print("\\n--- 4. 对齐与填充（打印整齐表格）---")
    
    employees = [
        ("EMP001", "张三", "技术部", "高级工程师", 25000),
        ("EMP002", "李四", "市场部", "经理", 28000),
        ("EMP003", "王五五", "财务部", "会计", 16000),
        ("EMP004", "赵六六六", "人事部", "HR", 14000),
        ("EMP005", "钱七", "技术部", "架构师", 35000),
    ]

    # 打印表头
    print("-" * 80)
    print(f"|{'工号':^8}|{'姓名':^10}|{'部门':^10}|{'职位':^12}|{'薪资':>12}|")
    print("-" * 80)

    # 打印数据行
    for emp_id, name, dept, position, salary in employees:
        print(f"|{emp_id:^8}|{name:^10}|{dept:^10}|{position:^12}|{salary:>10,}元|")
    print("-" * 80)

    # 填充字符（生成美观的标题）
    title = "员工薪资报表"
    print()
    print(f"{title:=^50}")
    print(f"{title:-^50}")
    print(f"{title:*^50}")

    # ========== 5. f-string表达式与函数调用 ==========
    print("\\n--- 5. f-string中使用表达式和函数 ---")
    price = 99.9
    quantity = 12
    
    print(f"单价：{price}元 × 数量：{quantity} = 总价：{price * quantity:,.2f}元")
    
    # 在{}里调用函数
    import math
    radius = 5
    print(f"半径为{radius}的圆面积：{math.pi * radius ** 2:.2f}")

    # 条件表达式
    score = 85
    print(f"考试分数：{score}，评级：{'优秀' if score >= 90 else '良好' if score >= 80 else '及格' if score >= 60 else '不及格'}")

    # ========== 6. 数字补零和特殊格式 ==========
    print("\\n--- 6. 编号补零、日期格式化 ---")
    for i in range(1, 11):
        order_no = f"ORD{2025}{i:04d}"
        print(f"生成订单号：{order_no}")

    # 日期数字补零
    month = 1
    day = 5
    print(f"\\n日期：2025年{month:02d}月{day:02d}日")

    # ========== 7. str.format()和%格式化（了解老代码）==========
    print("\\n--- 7. 旧格式化方式（了解即可）---")
    name = "李四"
    age = 30
    salary = 18000
    
    # str.format()
    print("str.format()：姓名：{}，年龄：{}，薪资：{:.2f}".format(name, age, salary))
    print("指定位置：{0}的薪资是{2:.0f}，{0}今年{1}岁".format(name, age, salary))
    
    # %旧式格式化
    print("%%格式化：姓名：%s，年龄：%d，薪资：%.2f" % (name, age, salary))

    print("\\n" + "=" * 70)
    print("格式化输出演示完成")

if __name__ == "__main__":
    main()
`
  },
  {
    id: "py-comments",
    group: "基础语法入门 · 打好地基",
    icon: "📋",
    title: "注释、文档字符串与代码规范",
    content: `## 注释、文档字符串与代码规范

好的注释和规范让代码更易维护，这在工作中至关重要——你写的代码会被同事（包括未来的你）反复阅读。

### 单行注释：#

\`\`\`python
# 这是单行注释，解释下面代码的作用
salary = 15000  # 也可以写在代码后面，用两个空格隔开
\`\`\`

### 多行注释：三引号

三引号本质是字符串，但没有赋值给变量时，常被当作多行注释使用：

\`\`\`python
"""
这是多行注释
可以写很多行
常用于文件头部说明、复杂逻辑说明
"""
\`\`\`

### 文档字符串（docstring）

文档字符串是函数、类、模块的第一个语句，用三引号包裹，用于说明这个东西是做什么的。可以通过\`help()\`查看。

\`\`\`python
def calculate_salary(basic, bonus, tax_rate):
    """
    计算员工税后工资
    
    Args:
        basic (float): 基本工资
        bonus (float): 奖金
        tax_rate (float): 税率，如0.1表示10%
    
    Returns:
        float: 税后工资金额
    
    Example:
        >>> calculate_salary(10000, 2000, 0.1)
        10800.0
    """
    total = basic + bonus
    tax = total * tax_rate
    return total - tax

# 查看文档字符串
help(calculate_salary)
\`\`\`

### PEP 8代码规范概要

PEP 8是Python官方的代码风格指南，工作中务必遵守：

| 项目 | 规范 |
|------|------|
| 缩进 | 4个空格（不要用Tab） |
| 行宽 | 每行不超过79或99个字符 |
| 空行 | 函数/类之间空两行，方法之间空一行 |
| 命名（变量/函数） | 小写+下划线：\`employee_name\`、\`calculate_salary\` |
| 命名（类） | 大驼峰：\`Employee\`、\`SalaryCalculator\` |
| 命名（常量） | 全大写+下划线：\`MAX_RETRY\`、\`DEFAULT_TIMEOUT\` |
| 导入 | 每个import单独一行，顺序：标准库→第三方库→本地模块 |

### 工作中为什么写注释？

- **解释"为什么"**：代码本身说明"做什么"，注释解释"为什么这么做"
- **标记坑点**：哪里有bug、哪里是临时方案、哪里需要注意
- **快速理解**：同事接手你的代码时，不用逐行读就能懂逻辑
- **文档生成**：docstring可以自动生成API文档

**不要写无用注释：**
\`\`\`python
# 不好的注释：代码已经说明一切了
x = x + 1  # x加1
\`\`\``,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
文档字符串（docstring）：
这个文件演示Python的注释规范与PEP 8代码风格
用于演示如何写出规范、易维护的Python代码
对应章节：第七章 - 注释、文档字符串与代码规范
"""

import math
from datetime import datetime


MAX_WORK_HOURS_PER_WEEK = 60
DEFAULT_TAX_RATE = 0.13


def calculate_monthly_salary(basic_salary, work_days, overtime_hours=0, bonus=0):
    """
    计算员工月薪
    
    工作场景：根据基本工资、出勤天数、加班时长、奖金计算当月工资
    注意：加班工资按基本工资的1.5倍计算，超出最大工时部分不计算
    
    Args:
        basic_salary (float): 月基本工资
        work_days (int): 当月实际出勤天数
        overtime_hours (int): 当月加班小时数，默认为0
        bonus (float): 当月奖金，默认为0
    
    Returns:
        dict: 包含工资明细的字典，键值包括：
            - gross: 税前总工资
            - tax: 个人所得税
            - net: 税后实发工资
            - overtime_pay: 加班费
            - details: 明细说明
    
    Example:
        >>> result = calculate_monthly_salary(15000, 22, overtime_hours=10, bonus=2000)
        >>> print(f"实发工资：{result['net']:.2f}元")
    """
    daily_wage = basic_salary / 22
    hourly_wage = daily_wage / 8
    
    overtime_pay = overtime_hours * hourly_wage * 1.5
    
    gross = basic_salary + overtime_pay + bonus
    
    tax = gross * DEFAULT_TAX_RATE
    
    net = gross - tax
    
    details = {
        "gross": round(gross, 2),
        "tax": round(tax, 2),
        "net": round(net, 2),
        "overtime_pay": round(overtime_pay, 2),
        "basic": basic_salary,
        "bonus": bonus,
        "work_days": work_days,
        "overtime_hours": overtime_hours,
    }
    
    return details


def format_salary_report(employee_list):
    """
    格式化打印员工工资报表
    
    Args:
        employee_list (list): 员工列表，每个元素是(姓名, 部门, 工资详情)的元组
    
    Returns:
        无返回值，直接打印报表
    """
    report_width = 80
    print("=" * report_width)
    print(f"{'员工工资月报表':^{report_width}}")
    print(f"报表生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * report_width)
    
    header = f"|{'姓名':^8}|{'部门':^10}|{'基本工资':>10}|{'加班费':>8}|{'奖金':>8}|{'税前':>10}|{'个税':>8}|{'实发':>10}|"
    print(header)
    print("-" * report_width)
    
    total_basic = 0
    total_overtime = 0
    total_bonus = 0
    total_gross = 0
    total_tax = 0
    total_net = 0
    
    for name, dept, salary_detail in employee_list:
        print(
            f"|{name:^8}|"
            f"{dept:^10}|"
            f"{salary_detail['basic']:>10,}|"
            f"{salary_detail['overtime_pay']:>8,}|"
            f"{salary_detail['bonus']:>8,}|"
            f"{salary_detail['gross']:>10,}|"
            f"{salary_detail['tax']:>8,}|"
            f"{salary_detail['net']:>10,}|"
        )
        total_basic += salary_detail["basic"]
        total_overtime += salary_detail["overtime_pay"]
        total_bonus += salary_detail["bonus"]
        total_gross += salary_detail["gross"]
        total_tax += salary_detail["tax"]
        total_net += salary_detail["net"]
    
    print("-" * report_width)
    print(
        f"|{'合计':^8}|"
        f"{'-':^10}|"
        f"{total_basic:>10,.0f}|"
        f"{total_overtime:>8,.0f}|"
        f"{total_bonus:>8,.0f}|"
        f"{total_gross:>10,.0f}|"
        f"{total_tax:>8,.0f}|"
        f"{total_net:>10,.0f}|"
    )
    print("=" * report_width)


def is_valid_salary(salary):
    """
    验证工资金额是否合法
    
    合法条件：
    1. 必须是数字（int或float）
    2. 必须大于0
    3. 不能超过100万（防止误输入）
    """
    if not isinstance(salary, (int, float)):
        return False
    if salary <= 0:
        return False
    if salary > 1000000:
        return False
    return True


def main():
    """主函数：演示注释规范与工资计算"""
    print("【注释与代码规范演示 - 工资计算系统】\\n")
    
    zhang_san = calculate_monthly_salary(
        basic_salary=15000,
        work_days=22,
        overtime_hours=12,
        bonus=3000
    )
    
    li_si = calculate_monthly_salary(
        basic_salary=18000,
        work_days=21,
        overtime_hours=8,
        bonus=2000
    )
    
    wang_wu = calculate_monthly_salary(
        basic_salary=25000,
        work_days=22,
        overtime_hours=0,
        bonus=5000
    )
    
    employees = [
        ("张三", "技术部", zhang_san),
        ("李四", "市场部", li_si),
        ("王五", "技术部", wang_wu),
    ]
    
    format_salary_report(employees)
    
    print("\\n【代码规范要点提示】")
    print("1. 缩进：4个空格，不要用Tab")
    print("2. 命名：变量函数用snake_case，类用CamelCase，常量用UPPER_CASE")
    print("3. 每行不超过79-99字符，长表达式换行对齐")
    print("4. 函数之间空2行，逻辑块之间空1行")
    print("5. 必须写docstring说明函数用途、参数、返回值")
    print("6. 注释解释'为什么'，不是重复代码说的'做什么'")
    print("7. import顺序：标准库 → 第三方库 → 本地模块")


if __name__ == "__main__":
    main()
`
  },
  {
    id: "py-operators",
    group: "基础语法入门 · 打好地基",
    icon: "➕",
    title: "运算符与表达式",
    content: `## 运算符与表达式

运算符是各种操作的基础，工作中需要熟练掌握，尤其要注意几个容易踩坑的地方。

### 算术运算符（复习）

| 运算符 | 说明 | 工作常用场景 |
|--------|------|-------------|
| + | 加法 | 金额、数量求和 |
| - | 减法 | 找零、差额计算 |
| * | 乘法 | 单价×数量 |
| / | 除法 | 平均值计算（结果是float） |
| // | 整数除法 | 分页、装箱计算 |
| % | 取余 | 判断奇偶、循环分组 |
| ** | 幂 | 复利、增长率计算 |

### 比较运算符

| 运算符 | 说明 | 注意 |
|--------|------|------|
| == | 值相等 | 比较内容是否一样 |
| != | 值不相等 | |
| > / < | 大于/小于 | |
| >= / <= | 大于等于/小于等于 | |
| **is** | 身份相同 | 比较是不是同一个对象！ |
| is not | 身份不同 | |

**⚠️ 工作大坑：== vs is**
- \`==\` 比较**值**是否相等
- \`is\` 比较**内存地址**是否相同（是不是同一个对象）

\`\`\`python
# is 用于None判断是推荐写法
a = None
if a is None:  # 推荐
    print("a是None")

# 整数、字符串小的缓存问题，不要用is比较值！
x = 256
y = 256
print(x is y)  # True（小整数缓存）

x = 257
y = 257
print(x is y)  # 可能是False！不要这么写！
print(x == y)  # True，比较值请用==
\`\`\`

### 逻辑运算符：and/or/not

| 运算符 | 说明 | 示例 |
|--------|------|------|
| and | 与（两个都真才真） | age >= 18 and has_id_card |
| or | 或（一个真就真） | is_vip or is_admin |
| not | 非（取反） | not is_empty |

**短路求值（工作中常用技巧）：**
\`\`\`python
# and：如果第一个是False，第二个不执行
result = has_permission and delete_file()  # 有权限才删文件

# or：如果第一个是True，第二个不执行
name = input_name or "匿名用户"  # input_name为空时用默认值
\`\`\`

### 赋值运算符

\`\`\`python
x = 10
x += 5   # 等价于 x = x + 5
x -= 3   # x = x - 3
x *= 2   # x = x * 2
x /= 4   # x = x / 4
x //= 2  # x = x // 2
x %= 3   # x = x % 3
\`\`\`

### 成员运算符：in/not in

\`\`\`python
# 判断元素是否在序列中
fruits = ["苹果", "香蕉", "橙子"]
print("苹果" in fruits)  # True
print("西瓜" not in fruits)  # True

# 字符串中也常用
print("error" in log_message)
\`\`\`

### 运算符优先级

优先级从高到低（括号最高）：
1. **括号** \`()\` （不确定就加括号！）
2. 幂 \`**\`
3. 正负号 \`+x\` \`-x\`
4. 乘除 \`* / // %\`
5. 加减 \`+ -\`
6. 比较 \`== != > < >= <= is is not in not in\`
7. 逻辑非 \`not\`
8. 逻辑与 \`and\`
9. 逻辑或 \`or\`

**工作建议：不确定优先级就加括号()，可读性好不会错。**

### and/or优先级坑

\`\`\`python
# 坑！and优先级比or高，结果可能不是你想的那样
a = True
b = False
c = False
result = a or b and c  # 实际是 a or (b and c) = True
# 不是你以为的 (a or b) and c = False
print(result)  # True

# 最佳实践：加括号！
result = (a or b) and c  # 明确意图
\`\`\``,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第八章 demo：运算符与表达式
演示：算术、比较、逻辑、赋值、成员运算符，==vs is，短路求值，优先级坑
工作场景：权限判断、数据验证、条件过滤、业务逻辑计算
"""

def main():
    print("=" * 70)
    print("【运算符与表达式 - 员工权限与订单验证场景】")
    print("=" * 70)

    # ========== 1. 算术运算符：订单计算 ==========
    print("\\n--- 1. 算术运算符：订单金额计算 ---")
    product_price = 129.99
    quantity = 7
    discount_threshold = 5
    discount_rate = 0.9 if quantity >= discount_threshold else 1.0
    shipping_fee = 0 if (product_price * quantity) >= 99 else 10

    subtotal = product_price * quantity
    discount_amount = subtotal * (1 - discount_rate)
    total = subtotal * discount_rate + shipping_fee
    items_per_carton = 6
    cartons = quantity // items_per_carton
    remaining_items = quantity % items_per_carton

    print(f"商品单价：{product_price}元")
    print(f"购买数量：{quantity}件")
    print(f"满足折扣：{'是' if quantity >= discount_threshold else '否'}（{discount_threshold}件以上9折）")
    print(f"商品小计：{subtotal:.2f}元")
    print(f"优惠金额：{discount_amount:.2f}元")
    print(f"运费：{shipping_fee}元（满99包邮）")
    print(f"应付总额：{total:.2f}元")
    print(f"装箱：{cartons}整箱 + {remaining_items}件零散")

    # ========== 2. 比较运算符：年龄与权限验证 ==========
    print("\\n--- 2. 比较运算符：员工权限验证 ---")
    employee = {
        "name": "张三",
        "age": 28,
        "years_of_service": 3,
        "level": 3,
        "department": "技术部",
        "is_manager": False,
        "last_login_days_ago": 2,
    }

    print(f"员工：{employee['name']}")
    
    can_take_leave = employee["years_of_service"] >= 1
    print(f"是否可以申请年假：{'可以' if can_take_leave else '不可以'}（入职满1年）")

    can_access_admin = employee["level"] >= 5 or employee["is_manager"]
    print(f"是否有管理员权限：{'有' if can_access_admin else '无'}（level>=5或经理）")

    is_account_active = employee["last_login_days_ago"] <= 30
    print(f"账户是否活跃：{'是' if is_account_active else '否'}（30天内有登录）")

    # ========== 3. 大坑：== vs is ==========
    print("\\n--- 3. 重点坑：== vs is 的区别 ---")
    
    # None判断必须用is（这是Python推荐写法）
    resign_date = None
    print(f"resign_date is None：{resign_date is None}（判断None推荐is）")
    
    # 比较值请用==，不要用is！
    salary1 = 15000
    salary2 = 15000
    print(f"\\nsalary1 = {salary1}, salary2 = {salary2}")
    print(f"salary1 == salary2：{salary1 == salary2}（值相等，推荐用==）")
    print(f"salary1 is salary2：{salary1 is salary2}（是否同一对象，不可靠！）")

    # 小整数缓存坑（-5到256会被缓存）
    a = 256
    b = 256
    print(f"\\na=256, b=256：a is b = {a is b}（小整数缓存，碰巧True）")
    
    a = 257
    b = 257
    print(f"a=257, b=257：a is b = {a is b}（不缓存，结果可能False！）")
    print(f"a == b：{a == b}（比较值永远正确）")
    
    print("\\n✓ 记住：比较值用==，判断None用is")

    # ========== 4. 逻辑运算符and/or/not与短路求值 ==========
    print("\\n--- 4. 逻辑运算符与短路求值（工作常用技巧）---")
    
    is_logged_in = True
    is_vip = False
    is_admin = True
    has_coupon = False

    can_view_price = is_logged_in
    can_get_discount = is_logged_in and (is_vip or is_admin or has_coupon)
    can_access_all = is_logged_in and is_admin
    
    print(f"已登录：{is_logged_in}")
    print(f"VIP：{is_vip}")
    print(f"管理员：{is_admin}")
    print(f"有优惠券：{has_coupon}")
    print(f"可查看价格：{can_view_price}")
    print(f"可享受折扣：{can_get_discount}")
    print(f"可访问全部功能：{can_access_all}")

    # 短路求值技巧1：or设置默认值
    username = ""  # 模拟空输入
    display_name = username or "游客"  # username为空时用"游客"
    print(f"\\n用户名显示：{display_name}（空值用默认）")

    # 短路求值技巧2：and做条件执行
    debug_mode = False
    debug_mode and print("\\n[调试信息] 这行只在debug_mode=True时打印")
    
    debug_mode = True
    debug_mode and print("[调试信息] 调试模式已开启，可以看到这行")

    # not取反
    is_empty = True
    print(f"\\n数据是否为空：{is_empty}")
    print(f"是否有数据：{not is_empty}")

    # ========== 5. 成员运算符in/not in ==========
    print("\\n--- 5. 成员运算符in/not in（高频使用）---")
    
    allowed_departments = ["技术部", "产品部", "设计部"]
    emp_dept = "市场部"
    print(f"允许访问的部门：{allowed_departments}")
    print(f"员工部门：{emp_dept}")
    print(f"是否允许访问：{emp_dept in allowed_departments}")

    # 关键词过滤
    comment = "这个产品真的很差劲，不要买！"
    blacklist = ["差劲", "垃圾", "骗子"]
    has_bad_word = any(word in comment for word in blacklist)
    print(f"\\n评论内容：{comment}")
    print(f"是否包含敏感词：{has_bad_word}")

    # 文件类型判断
    filename = "report_data.xlsx"
    allowed_exts = (".xlsx", ".xls", ".csv")
    is_allowed_file = filename.endswith(allowed_exts)
    print(f"\\n文件名：{filename}")
    print(f"是否是允许的表格文件：{is_allowed_file}")

    # ========== 6. 运算符优先级坑 ==========
    print("\\n--- 6. 运算符优先级坑（一定要加括号！）---")
    
    # 坑：and优先级比or高
    is_vip = True
    has_coupon = False
    is_new_user = False
    
    # 不加括号，实际是 is_vip or (has_coupon and is_new_user)
    result1 = is_vip or has_coupon and is_new_user
    # 你可能以为是 (is_vip or has_coupon) and is_new_user
    result2 = (is_vip or has_coupon) and is_new_user
    
    print(f"is_vip={is_vip}, has_coupon={has_coupon}, is_new_user={is_new_user}")
    print(f"is_vip or has_coupon and is_new_user = {result1}")
    print(f"(is_vip or has_coupon) and is_new_user = {result2}")
    print("结论：不确定优先级就加括号，明确意图不踩坑！")

    # 复合赋值运算符
    print("\\n--- 7. 复合赋值运算符 ---")
    score = 60
    print(f"初始积分：{score}")
    score += 10  # 签到加10分
    print(f"签到+10：{score}")
    score *= 2   # 活动翻倍
    print(f"活动翻倍：{score}")
    score -= 5   # 兑换扣5分
    print(f"兑换-5：{score}")

    # 实际业务逻辑综合演示
    print("\\n--- 8. 综合演示：员工年终奖计算条件 ---")
    emp = {
        "name": "李四",
        "performance_score": 92,
        "attendance_rate": 0.98,
        "has_violation": False,
        "years": 4,
    }
    
    # 年终奖条件：绩效>=80 且 出勤率>=95% 且 无违规记录 且 入职满1年
    eligible = (
        emp["performance_score"] >= 80
        and emp["attendance_rate"] >= 0.95
        and not emp["has_violation"]
        and emp["years"] >= 1
    )
    
    bonus_multiplier = 1.0
    if emp["performance_score"] >= 90:
        bonus_multiplier += 0.5
    if emp["years"] >= 3:
        bonus_multiplier += 0.3
    
    print(f"员工：{emp['name']}")
    print(f"绩效得分：{emp['performance_score']}")
    print(f"出勤率：{emp['attendance_rate']*100:.0f}%")
    print(f"是否有违规：{emp['has_violation']}")
    print(f"司龄：{emp['years']}年")
    print(f"是否有资格拿年终奖：{'是' if eligible else '否'}")
    print(f"年终奖系数：{bonus_multiplier}个月工资")

    print("\\n" + "=" * 70)
    print("运算符演示完成")

if __name__ == "__main__":
    main()
`
  },
];
