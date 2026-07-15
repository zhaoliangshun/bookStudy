// =============================================================
// 《Python工作实战手册》—— 第三批 · 控制流与函数：逻辑的骨架
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
    id: "py-if",
    group: "控制流与函数 · 逻辑的骨架",
    icon: "🔀",
    title: "条件判断if/elif/else",
    content: `## 条件判断if/elif/else

条件判断是程序逻辑的基础，让代码能够根据不同情况做出不同决策。工作中最常用的就是各种状态判断、权限校验、数据校验等场景。

### 基本语法

Python靠**缩进**区分代码块（使用4个空格，不要用Tab），这是Python最显著的特点！

\`\`\`python
# if基本结构：注意冒号和缩进！
order_status = "paid"

if order_status == "pending":
    print("订单待支付")
elif order_status == "paid":
    print("订单已支付")
elif order_status == "shipped":
    print("订单已发货")
else:
    print("其他状态")
\`\`\`

### 比较运算符

| 运算符 | 含义 |
|--------|------|
| == | 等于 |
| != | 不等于 |
| > / < | 大于/小于 |
| >= / <= | 大于等于/小于等于 |

### 逻辑运算符：and/or/not

- **and**：两边都为True才为True
- **or**：一边为True就为True
- **not**：取反

### 三元表达式

\`x if 条件 else y\`，适合简单条件判断：

\`\`\`python
status = "成年" if age >= 18 else "未成年"
\`\`\`

### is vs == 的区别（重点坑点！）

- **==**：判断值是否相等
- **is**：判断是否是同一个对象（内存地址相同）

**判断None一定要用is None！**

### 真值判断（Pythonic写法）

空字符串""、空列表[]、空字典{}、None、0、0.0都被视为False。

\`\`\`python
if username:  # 不是空字符串
if order_list:  # 不是空列表
if result is None:  # 判断None用is
\`\`\`
`,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第1章 demo：条件判断if/elif/else
演示：条件语法、逻辑运算、真值判断、is vs ==
工作场景：订单状态判断、用户权限判断、折扣计算
"""

def check_order_status(order):
    status = order["status"]
    is_paid = order["is_paid"]
    amount = order["amount"]
    stock_available = order["stock_available"]
    print(f"\\n订单号：{order['order_id']}")
    print(f"当前状态：{status}")
    if status == "pending":
        print("→ 待支付")
        if order["hours_since_create"] > 24:
            print("⚠️  超过24小时未支付，建议取消")
    elif status == "paid":
        print("→ 已支付")
        if stock_available and is_paid:
            print("✅ 可以发货")
        else:
            print("❌ 库存不足或支付异常")
    elif status == "shipped":
        print("→ 已发货")
    elif status == "completed":
        print("→ 已完成")
    elif status == "cancelled":
        print("→ 已取消")
    else:
        print(f"⚠️  未知状态：{status}")

def calculate_discount(user, order_amount):
    role = user["role"]
    is_vip = user["is_vip"]
    annual_consumption = user["annual_consumption"]
    print(f"\\n用户：{user['name']}")
    if role == "admin":
        discount = 0.7
        reason = "管理员"
    elif annual_consumption >= 50000:
        discount = 0.75
        reason = "钻石客户"
    elif annual_consumption >= 10000:
        discount = 0.8
        reason = "黄金客户"
    elif is_vip:
        discount = 0.85
        reason = "VIP会员"
    else:
        discount = 1.0
        reason = "无折扣"
    final = order_amount * discount
    print(f"折扣：{discount*10}折（{reason}），实付：{final:.2f}元")
    return discount

def main():
    print("=" * 60)
    print("第1章：条件判断if/elif/else")
    print("=" * 60)
    orders = [
        {"order_id": "ORD001", "status": "pending", "is_paid": False, "amount": 299, "stock_available": True, "hours_since_create": 5},
        {"order_id": "ORD002", "status": "pending", "is_paid": False, "amount": 599, "stock_available": True, "hours_since_create": 30},
        {"order_id": "ORD003", "status": "paid", "is_paid": True, "amount": 1299, "stock_available": True, "hours_since_create": 2},
        {"order_id": "ORD004", "status": "paid", "is_paid": True, "amount": 2599, "stock_available": False, "hours_since_create": 1},
    ]
    for o in orders:
        check_order_status(o)
    users = [
        {"name": "张三", "role": "user", "is_vip": False, "annual_consumption": 3000},
        {"name": "李四", "role": "user", "is_vip": True, "annual_consumption": 8000},
        {"name": "王五", "role": "admin", "is_vip": False, "annual_consumption": 500},
    ]
    for u in users:
        calculate_discount(u, 2000)
    print("\\n" + "=" * 60)
    print("要点：1. 4空格缩进 2. 判断None用is 3. 记得处理else")
    print("=" * 60)

if __name__ == "__main__":
    main()
`
  },
  {
    id: "py-for",
    group: "控制流与函数 · 逻辑的骨架",
    icon: "🔁",
    title: "for循环与迭代",
    content: `## for循环与迭代

for循环是工作中最常用的循环，用来遍历列表、字典、字符串等可迭代对象。

### 基本语法：for...in

\`\`\`python
for item in iterable:
    处理item
\`\`\`

### range()函数

- range(5) → 0,1,2,3,4
- range(1,10) → 1-9
- range(0,10,2) → 0,2,4,6,8

### enumerate()：同时拿索引和值

\`\`\`python
for idx, name in enumerate(names, start=1):
    print(f"{idx}. {name}")
\`\`\`

### zip()：并行遍历多个列表

\`\`\`python
for name, salary in zip(names, salaries):
    print(f"{name}: {salary}")
\`\`\`

### 遍历字典：items()最常用

\`\`\`python
for key, value in dict.items():
    print(f"{key}: {value}")
\`\`\`

### break/continue

- break：立即跳出循环
- continue：跳过本次，继续下一次

### ⚠️ 坑点：不要在循环中修改正在遍历的列表！
`,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第2章 demo：for循环与迭代
演示：for...in、range、enumerate、zip、break/continue
工作场景：批量处理订单、数据统计
"""

def demo_enumerate():
    print("\\n【enumerate：索引+值】")
    employees = ["张三", "李四", "王五"]
    for idx, name in enumerate(employees, start=1):
        print(f"  {idx}. {name}")

def demo_zip():
    print("\\n【zip：并行遍历】")
    names = ["张三", "李四", "王五"]
    salaries = [15000, 18000, 22000]
    for name, sal in zip(names, salaries):
        print(f"  {name}: {sal}元")

def batch_process_orders(order_list):
    print("\\n【批量处理订单】")
    total = 0
    vip_count = 0
    for o in order_list:
        total += o["amount"]
        if o["is_vip"]:
            vip_count += 1
    print(f"  总金额：{total}元，VIP订单：{vip_count}个")
    return total

def main():
    print("=" * 60)
    print("第2章：for循环与迭代")
    print("=" * 60)
    demo_enumerate()
    demo_zip()
    orders = [
        {"id": "ORD001", "amount": 14999, "is_vip": True},
        {"id": "ORD002", "amount": 299, "is_vip": False},
        {"id": "ORD003", "amount": 8999, "is_vip": False},
    ]
    batch_process_orders(orders)
    print("\\n" + "=" * 60)
    print("要点：enumerate拿索引，zip并行遍历，不要循环中改列表")
    print("=" * 60)

if __name__ == "__main__":
    main()
`
  },
  {
    id: "py-while",
    group: "控制流与函数 · 逻辑的骨架",
    icon: "🔂",
    title: "while循环与循环控制",
    content: `## while循环与循环控制

while循环在条件满足时重复执行，适合循环次数不确定的场景：重试、轮询、分页等。

### 基本语法

\`\`\`python
while 条件:
    循环体
    # 记得更新条件变量，避免死循环！
\`\`\`

### while True + break模式

工作中常用这种模式：

\`\`\`python
retry_count = 0
while True:
    retry_count += 1
    if 成功:
        break
    if retry_count >= max_retry:
        break
\`\`\`

### break/continue/pass

- break：跳出整个循环
- continue：跳过本次
- pass：占位符，什么都不做

### ⚠️ 一定要避免无限循环！
设置最大重试/轮询次数，防止死循环。
`,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第3章 demo：while循环
演示：while基础、重试机制、分页、轮询
工作场景：API重试、分页拉取
"""

def retry_api(max_retry=3):
    """API重试机制"""
    print("\\n【API重试】")
    mock_results = ["timeout", "timeout", "success"]
    attempt = 0
    while True:
        attempt += 1
        print(f"  第{attempt}次调用...", end=" ")
        result = mock_results[attempt-1] if attempt <= len(mock_results) else "fail"
        if result == "success":
            print("✅ 成功")
            return True
        if attempt >= max_retry:
            print("❌ 重试耗尽")
            return False
        print("失败，重试...")

def fetch_pages(page_size=3, total=10):
    """分页拉取"""
    print("\\n【分页拉取】")
    all_data = []
    page = 1
    while True:
        start = (page-1)*page_size
        end = min(start+page_size, total)
        page_data = list(range(start+1, end+1))
        print(f"  第{page}页：{len(page_data)}条")
        all_data.extend(page_data)
        if len(page_data) < page_size:
            break
        page += 1
    print(f"  共{len(all_data)}条")
    return all_data

def main():
    print("=" * 60)
    print("第3章：while循环与循环控制")
    print("=" * 60)
    retry_api(3)
    fetch_pages()
    print("\\n" + "=" * 60)
    print("要点：while True+break最常用，一定要设置上限防死循环")
    print("=" * 60)

if __name__ == "__main__":
    main()
`
  },
  {
    id: "py-comprehensions",
    group: "控制流与函数 · 逻辑的骨架",
    icon: "⚡",
    title: "推导式：Pythonic数据处理",
    content: `## 推导式：Pythonic数据处理

推导式可以一行完成数据筛选转换，比for循环简洁。

### 列表推导式（最常用）

\`[表达式 for x in iter if 条件]\`

\`\`\`python
squares = [i**2 for i in range(1, 11)]
evens = [i for i in range(1, 11) if i%2 == 0]
\`\`\`

### 字典推导式

\`{k:v for k,v in ...}\`

### 集合推导式（自动去重）

\`{x for x in ...}\`

### 生成器表达式（省内存）

\`(x for x in ...)\`，处理大数据用，不占内存。

### ⚠️ 复杂逻辑不要硬写推导式，用for循环更清晰
`,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第4章 demo：推导式
演示：列表/字典/集合推导式、生成器
工作场景：数据筛选转换、统计
"""

def demo_list_comp():
    print("\\n【列表推导式】")
    employees = [
        {"name": "张三", "salary": 15000, "dept": "技术部"},
        {"name": "李四", "salary": 18000, "dept": "产品部"},
        {"name": "王五", "salary": 22000, "dept": "技术部"},
    ]
    names = [e["name"] for e in employees]
    tech = [e["name"] for e in employees if e["dept"] == "技术部"]
    high_sal = [e["name"] for e in employees if e["salary"] > 16000]
    print(f"  全员：{names}")
    print(f"  技术部：{tech}")
    print(f"  高薪（>16k）：{high_sal}")

def demo_dict_set_comp():
    print("\\n【字典&集合推导式】")
    employees = [
        {"name": "张三", "salary": 15000, "dept": "技术部"},
        {"name": "李四", "salary": 18000, "dept": "产品部"},
        {"name": "王五", "salary": 22000, "dept": "技术部"},
    ]
    name_salary = {e["name"]: e["salary"] for e in employees}
    depts = {e["dept"] for e in employees}
    print(f"  姓名-薪资：{name_salary}")
    print(f"  所有部门（去重）：{depts}")

def demo_generator():
    print("\\n【生成器表达式（省内存）】")
    total = sum(x for x in range(1, 1001) if x%2 == 0)
    print(f"  1-1000偶数和：{total}")

def main():
    print("=" * 60)
    print("第4章：推导式")
    print("=" * 60)
    demo_list_comp()
    demo_dict_set_comp()
    demo_generator()
    print("\\n" + "=" * 60)
    print("要点：推导式简洁但别滥用，复杂逻辑用for循环更清晰")
    print("=" * 60)

if __name__ == "__main__":
    main()
`
  },
  {
    id: "py-functions-basic",
    group: "控制流与函数 · 逻辑的骨架",
    icon: "📐",
    title: "函数基础：定义与调用",
    content: `## 函数基础：定义与调用

函数是可复用的代码块，把重复逻辑封装起来。

### def定义函数

\`\`\`python
def greet(name):
    """docstring文档字符串"""
    return f"你好，{name}！"
\`\`\`

### 参数：位置参数 vs 关键字参数

\`\`\`python
# 位置参数（按顺序）
create_order("ORD001", "MacBook", 14999)
# 关键字参数（指定名字，更清晰）
create_order(product="iPhone", amount=8999, order_id="ORD002")
\`\`\`

### return返回值

- return可以返回任何类型
- 没有return默认返回None
- 多返回值实际是返回元组

### ⚠️ 默认参数大坑：不要用可变对象！

\`\`\`python
# ❌ 错误：默认列表只初始化一次，会累积
def bad_func(item, lst=[]):
    lst.append(item)
    return lst

# ✅ 正确：用None做默认值，函数内初始化
def good_func(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst
\`\`\`
`,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第5章 demo：函数基础
演示：def定义、参数、return、默认参数坑点
工作场景：数据校验、业务逻辑封装
"""

def format_currency(amount, symbol="¥"):
    """格式化金额显示"""
    return f"{symbol}{amount:,.2f}"

def calculate_order_subtotal(items, discount_rate=1.0):
    """计算订单小计"""
    subtotal = sum(item["price"] * item["quantity"] for item in items)
    discount_amount = subtotal * (1 - discount_rate)
    total = subtotal - discount_amount
    return {"subtotal": subtotal, "discount": discount_amount, "total": total}

def validate_user(user_data):
    """校验用户数据"""
    errors = []
    username = user_data.get("username")
    if not username or len(username) < 3:
        errors.append("用户名至少3位")
    age = user_data.get("age")
    if age is None or age < 18:
        errors.append("必须年满18岁")
    return len(errors) == 0, errors

def demo_default_arg_pitfall():
    print("\\n【⚠️ 默认参数坑点】")
    def bad_add(item, lst=[]):
        lst.append(item)
        return lst
    print(f"  bad_add(1): {bad_add(1)}")
    print(f"  bad_add(2): {bad_add(2)}")
    print("  → 累积了！因为默认列表只在定义时创建一次")
    def good_add(item, lst=None):
        if lst is None:
            lst = []
        lst.append(item)
        return lst
    print(f"  good_add(1): {good_add(1)}")
    print(f"  good_add(2): {good_add(2)}")
    print("  → 每次都是新列表，正确！")

def main():
    print("=" * 60)
    print("第5章：函数基础")
    print("=" * 60)
    print(f"格式化金额：{format_currency(14999)}")
    print(f"格式化美元：{format_currency(999, '$')}")
    cart = [
        {"name": "Python教程", "price": 99, "quantity": 2},
        {"name": "键盘", "price": 299, "quantity": 1},
    ]
    result = calculate_order_subtotal(cart, 0.85)
    print(f"\\n订单计算：小计{format_currency(result['subtotal'])}，"
          f"优惠{format_currency(result['discount'])}，实付{format_currency(result['total'])}")
    demo_default_arg_pitfall()
    print("\\n" + "=" * 60)
    print("要点：默认参数不要用列表/字典！用None")
    print("=" * 60)

if __name__ == "__main__":
    main()
`
  },
  {
    id: "py-functions-args",
    group: "控制流与函数 · 逻辑的骨架",
    icon: "🎯",
    title: "函数参数进阶",
    content: `## 函数参数进阶

掌握*args、**kwargs写出更灵活的函数。

### *args：可变位置参数（打包成元组）

\`\`\`python
def sum_all(*args):
    return sum(args)
sum_all(1,2,3) # 6
\`\`\`

### **kwargs：可变关键字参数（打包成字典）

\`\`\`python
def create_user(name, **kwargs):
    user = {"name": name}
    user.update(kwargs)
    return user
create_user("张三", age=28, city="北京")
\`\`\`

### Keyword-only参数（*之后）

*后面的参数必须用关键字传入，防止顺序传错：

\`\`\`python
def create_order(order_id, product, *, amount=0, discount=1.0):
    pass
create_order("ORD001", "MacBook", amount=14999) # ✅
# create_order("ORD001", "MacBook", 14999)     # ❌ 报错
\`\`\`

### 参数解包：*list和**dict

\`\`\`python
args = [14999, 2]
calc_total(*args) # 等价于calc_total(14999, 2)
kwargs = {"price": 8999, "quantity": 1}
calc_total(**kwargs)
\`\`\`

### 类型提示Type Hints（推荐！）

\`\`\`python
def calculate(amount: float, is_vip: bool) -> float:
    return amount * 0.85 if is_vip else amount
\`\`\`
`,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第6章 demo：函数参数进阶
演示：*args、**kwargs、keyword-only、参数解包、类型提示
工作场景：通用工具函数、API封装
"""

def calculate_average(*args: float) -> float:
    """*args：任意多个数求平均"""
    if not args:
        return 0.0
    return sum(args) / len(args)

def create_employee(name: str, **kwargs):
    """**kwargs：接收任意额外字段"""
    emp = {"name": name}
    emp.update(kwargs)
    return emp

def create_order(order_id: str, product: str, *, amount: float = 0, quantity: int = 1, discount_rate: float = 1.0):
    """*后面必须关键字传参"""
    total = amount * quantity * discount_rate
    return {"order_id": order_id, "product": product, "total": total}

def demo_unpacking():
    """参数解包"""
    print("\\n【参数解包】")
    def calc(price, quantity, discount=1.0):
        return price * quantity * discount
    args_list = [14999, 2]
    total1 = calc(*args_list)
    print(f"  列表解包：{total1}")
    args_dict = {"price": 8999, "quantity": 1, "discount": 0.9}
    total2 = calc(**args_dict)
    print(f"  字典解包：{total2}")

def demo_mutable_arg_risk():
    """⚠️ 可变参数传递风险"""
    print("\\n【⚠️ 可变对象传参风险】")
    def add_item(lst, item):
        lst.append(item)
    my_list = [1, 2, 3]
    print(f"  调用前：{my_list}")
    add_item(my_list, 999)
    print(f"  调用后：{my_list}（被修改了！）")

def main():
    print("=" * 60)
    print("第6章：函数参数进阶")
    print("=" * 60)
    print(f"平均分(85,92,78)：{calculate_average(85, 92, 78):.1f}")
    print(f"平均分(90,88,95,82)：{calculate_average(90, 88, 95, 82):.1f}")
    emp = create_employee("张三", age=28, department="技术部", salary=18000)
    print(f"\\n创建员工：{emp}")
    order = create_order("ORD001", "MacBook Pro", amount=14999, quantity=1, discount_rate=0.85)
    print(f"创建订单：{order}")
    demo_unpacking()
    demo_mutable_arg_risk()
    print("\\n" + "=" * 60)
    print("要点：*args元组、**kwargs字典、*后必须关键字传参")
    print("=" * 60)

if __name__ == "__main__":
    main()
`
  },
  {
    id: "py-lambda",
    group: "控制流与函数 · 逻辑的骨架",
    icon: "λ",
    title: "lambda与高阶函数",
    content: `## lambda与高阶函数

lambda是匿名函数，适合写简单的、只用一次的小函数。

### lambda语法

\`lambda 参数: 表达式\`

\`\`\`python
add = lambda a, b: a + b
square = lambda x: x**2
\`\`\`

### 最常用场景：sorted/max/min的key参数

这是工作中最常用lambda的地方！

\`\`\`python
employees = [{"name": "张三", "salary": 15000}, {"name": "李四", "salary": 18000}]
sorted(employees, key=lambda e: e["salary"]) # 按薪资排序
max(employees, key=lambda e: e["salary"])   # 薪资最高
\`\`\`

### 多字段排序

返回元组实现多字段排序：

\`\`\`python
sorted(emps, key=lambda e: (e["dept"], -e["salary"]))
# 先按部门升序，同部门薪资降序
\`\`\`

### 什么时候用lambda，什么时候用def？

| 场景 | lambda | def |
|------|--------|-----|
| 简单一行、只用一次 | ✅ | 可以但没必要 |
| 复杂逻辑、多行 | ❌ | ✅ |
| 需要复用、要docstring | ❌ | ✅ |
`,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第7章 demo：lambda与高阶函数
演示：lambda语法、sorted/max/min的key、自定义排序
工作场景：按字段排序、自定义排序规则
"""

def demo_sorted_key():
    """sorted+lambda排序（最常用！）"""
    print("\\n【sorted+lambda：按字段排序】")
    employees = [
        {"name": "张三", "salary": 15000, "age": 28, "dept": "技术部"},
        {"name": "李四", "salary": 18000, "age": 32, "dept": "产品部"},
        {"name": "王五", "salary": 22000, "age": 30, "dept": "技术部"},
        {"name": "赵六", "salary": 13000, "age": 24, "dept": "运营部"},
    ]
    by_salary = sorted(employees, key=lambda e: e["salary"], reverse=True)
    print("  按薪资降序：")
    for e in by_salary:
        print(f"    {e['name']}: {e['salary']}元")
    by_age = sorted(employees, key=lambda e: e["age"])
    print("  按年龄升序：")
    for e in by_age:
        print(f"    {e['name']}: {e['age']}岁")

def demo_max_min():
    """max/min+lambda找最值"""
    print("\\n【max/min找最值】")
    orders = [
        {"id": "ORD001", "amount": 299},
        {"id": "ORD002", "amount": 14999},
        {"id": "ORD003", "amount": 8999},
    ]
    highest = max(orders, key=lambda o: o["amount"])
    lowest = min(orders, key=lambda o: o["amount"])
    print(f"  金额最高：{highest['id']} {highest['amount']}元")
    print(f"  金额最低：{lowest['id']} {lowest['amount']}元")

def demo_multi_field_sort():
    """多字段排序"""
    print("\\n【多字段排序：先部门，后薪资降序】")
    employees = [
        {"name": "张三", "salary": 18000, "dept": "技术部"},
        {"name": "李四", "salary": 15000, "dept": "产品部"},
        {"name": "王五", "salary": 22000, "dept": "技术部"},
        {"name": "赵六", "salary": 16000, "dept": "产品部"},
    ]
    sorted_emps = sorted(employees, key=lambda e: (e["dept"], -e["salary"]))
    current_dept = None
    for e in sorted_emps:
        if e["dept"] != current_dept:
            print(f"  【{e['dept']}】")
            current_dept = e["dept"]
        print(f"    {e['name']}: {e['salary']}元")

def main():
    print("=" * 60)
    print("第7章：lambda与高阶函数")
    print("=" * 60)
    demo_sorted_key()
    demo_max_min()
    demo_multi_field_sort()
    print("\\n" + "=" * 60)
    print("要点：lambda最常用于sorted/max/min的key参数")
    print("简单一行用lambda，复杂逻辑用def更清晰")
    print("=" * 60)

if __name__ == "__main__":
    main()
`
  },
  {
    id: "py-scope",
    group: "控制流与函数 · 逻辑的骨架",
    icon: "🏠",
    title: "作用域与命名空间",
    content: `## 作用域与命名空间

理解变量在哪里可以访问，避免命名冲突。

### LEGB规则

Python按这个顺序查找变量：
1. **L**ocal：函数内部
2. **E**nclosing：外层嵌套函数
3. **G**lobal：模块全局
4. **B**uilt-in：内置（print/len等）

\`\`\`python
x = "global" # 全局
def outer():
    x = "enclosing" # 外层
    def inner():
        x = "local" # 局部
        print(x) # 用local
    inner()
outer()
\`\`\`

### global关键字（尽量避免）

在函数内修改全局变量需要global声明，但工作中尽量少用全局变量！

\`\`\`python
count = 0
def increment():
    global count # 声明用全局变量
    count += 1
\`\`\`

### nonlocal关键字（闭包中用）

修改外层嵌套函数的变量：

\`\`\`python
def outer():
    count = 0
    def inner():
        nonlocal count
        count += 1
        return count
    return inner
\`\`\`

### 最佳实践

- 尽量少用全局变量
- 多用参数传递和返回值
- 函数通过参数接收输入，通过返回值输出
- 避免副作用（函数修改外部状态）
`,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第8章 demo：作用域与命名空间
演示：LEGB规则、global、nonlocal、可变对象全局状态风险
工作场景：理解变量查找顺序、避免命名冲突
"""

GLOBAL_COMPANY = "科技有限公司" # 全局变量（大写表示常量）

def demo_legb():
    """LEGB规则演示"""
    print("\\n【LEGB查找顺序】")
    x = "enclosing（外层函数）"
    def inner():
        x = "local（内层函数）"
        print(f"  inner内部x：{x}")
        print(f"  访问全局公司名：{GLOBAL_COMPANY}")
    inner()
    print(f"  outer内部x：{x}")

call_count = 0 # 全局计数器（不推荐！）

def demo_global():
    """global关键字（尽量避免）"""
    print("\\n【global关键字（尽量少用）】")
    global call_count
    call_count += 1
    print(f"  函数被调用次数：{call_count}")

def demo_best_practice():
    """最佳实践：用参数和返回值，不用全局变量"""
    print("\\n【最佳实践：用参数和返回值代替全局变量】")
    def increment(count):
        return count + 1
    count = 0
    count = increment(count)
    count = increment(count)
    print(f"  count = {count}（通过返回值传递，无副作用）")

def demo_mutable_global_risk():
    """⚠️ 可变对象作为全局状态的风险"""
    print("\\n【⚠️ 可变全局状态风险】")
    global_config = {"debug": False, "env": "prod"}
    def bad_func():
        global_config["debug"] = True # 直接修改全局字典！
    print(f"  调用前：{global_config}")
    bad_func()
    print(f"  调用后：{global_config}（被偷偷修改了！难调试！）")
    def good_func(config):
        new_config = config.copy() # 操作副本
        new_config["debug"] = True
        return new_config
    config = {"debug": False, "env": "prod"}
    new_config = good_func(config)
    print(f"  good_func原配置不变：{config}")
    print(f"  返回新配置：{new_config}")

def make_counter():
    """闭包：nonlocal演示"""
    print("\\n【闭包+nonlocal：计数器工厂】")
    count = 0
    def counter():
        nonlocal count # 声明用外层函数的count
        count += 1
        return count
    return counter

def main():
    print("=" * 60)
    print("第8章：作用域与命名空间")
    print("=" * 60)
    demo_legb()
    demo_global()
    demo_global()
    demo_best_practice()
    demo_mutable_global_risk()
    counter1 = make_counter()
    print(f"  counter1: {counter1()}")
    print(f"  counter1: {counter1()}")
    print(f"  counter1: {counter1()}")
    counter2 = make_counter()
    print(f"  counter2（独立）: {counter2()}")
    print("\\n" + "=" * 60)
    print("要点：LEGB顺序，少用global，多用参数和返回值")
    print("避免可变全局状态，减少副作用")
    print("=" * 60)

if __name__ == "__main__":
    main()
`
  }
];
