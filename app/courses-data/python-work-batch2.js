/**
 * 《Python工作实战手册》第二批章节数据
 * 主题：数据结构 · 处理数据的利器
 * 共8章：列表基础/进阶、元组、字典基础/进阶、集合、collections模块、数据类型转换
 */

export const chapters = [
  {
    id: "py-lists-basic",
    group: "第二篇 数据结构 · 处理数据的利器",
    icon: "📋",
    title: "列表基础：有序可变集合",
    content: `# 列表基础：有序可变集合

列表是Python中最常用的数据结构之一，用于存储**有序、可变**的元素集合。就像Excel表格中的一列数据，可以随时添加、删除、修改其中的项。

## 创建列表

有两种常用方式创建列表：
- 使用方括号 \`[]\`（最常用，性能更好）
- 使用 \`list()\` 构造函数

\`\`\`python
# 推荐：直接用[]创建，更直观性能更好
employee_names = ["张三", "李四", "王五", "赵六"]

# 使用list()构造函数，适合转换其他可迭代对象
product_prices = list((99.9, 199.0, 299.5))  # 从元组转换
\`\`\`

## 索引访问：正索引和负索引

列表是有序的，每个元素都有位置编号：
- **正索引**：从0开始，0是第一个元素
- **负索引**：从-1开始，-1是最后一个元素

\`\`\`python
products = ["笔记本电脑", "鼠标", "键盘", "显示器"]

# 正索引访问
first_product = products[0]   # "笔记本电脑"
second_product = products[1]  # "鼠标"

# 负索引访问（工作中经常用！拿最后几个元素特别方便）
last_product = products[-1]   # "显示器"
second_last = products[-2]    # "键盘"
\`\`\`

## 切片操作：获取子列表

切片语法 \`[start:stop:step]\` 是列表的强大功能：
- \`start\`：起始位置（包含），默认0
- \`stop\`：结束位置（不包含），默认末尾
- \`step\`：步长，默认1

\`\`\`python
order_ids = [1001, 1002, 1003, 1004, 1005, 1006]

# 取前3个订单（不包含索引3）
first_three = order_ids[0:3]  # [1001, 1002, 1003]

# 简写：从开头到索引3
first_three = order_ids[:3]

# 从索引2取到末尾
from_third = order_ids[2:]  # [1003, 1004, 1005, 1006]

# 步长2：隔一个取一个
even_positions = order_ids[::2]  # [1001, 1003, 1005]

# 【工作常用技巧】反转列表
reversed_orders = order_ids[::-1]  # [1006, 1005, ..., 1001]
\`\`\`

> **坑点提醒**：切片是左闭右开区间！\`list[a:b]\` 包含a但不包含b，新手很容易在这里出错。

## 添加元素：append/extend/insert

三种添加方式，工作中各有用途：
- \`append(x)\`：在末尾添加**单个元素**
- \`extend(iterable)\`：在末尾添加**多个元素**（把另一个列表接进来）
- \`insert(i, x)\`：在指定位置插入元素

\`\`\`python
cart = ["商品A"]

# append：添加单个商品到购物车
cart.append("商品B")  # ["商品A", "商品B"]

# extend：批量添加多个商品（注意和append的区别！）
cart.extend(["商品C", "商品D"])
# 结果：["商品A", "商品B", "商品C", "商品D"]
# 如果用append(["商品C","商品D"])会把整个列表作为一个元素加进去！

# insert：在指定位置插入（比如置顶商品）
cart.insert(0, "置顶商品")  # 插入到开头
\`\`\`

## 删除元素：pop/remove/clear

- \`pop(i=-1)\)：按**索引**删除，返回被删除的元素（默认删最后一个）
- \`remove(x)\)：按**值**删除第一个匹配的元素
- \`clear()\`：清空整个列表

\`\`\`python
tasks = ["写报告", "开会", "回邮件", "写代码"]

# pop：删除并返回元素，像"弹出"一样
finished_task = tasks.pop()    # 删除"写代码"，返回它
first_task = tasks.pop(0)      # 删除"写报告"

# remove：按值删除（注意：只删第一个匹配的！）
tasks.remove("开会")  # 删除"开会"
# 如果值不存在会抛ValueError，工作中最好先if x in list判断

# clear：清空所有
tasks.clear()
\`\`\`

## 其他常用操作

\`\`\`python
employees = ["张三", "李四", "王五"]

# len()：获取列表长度（元素个数）
employee_count = len(employees)  # 3

# in：判断元素是否存在（工作中经常用）
has_zhangsan = "张三" in employees  # True

# 列表遍历：for循环（工作中最常用）
for name in employees:
    print(f"员工：{name}")

# 列表拼接 +
team1 = ["张三", "李四"]
team2 = ["王五", "赵六"]
all_employees = team1 + team2  # 合并两个列表

# 列表重复 *
separator = ["-"] * 10  # 快速生成分隔线
\`\`\`

## 工作场景总结

| 场景 | 推荐操作 |
|------|---------|
| 维护员工列表、商品列表 | 创建、append添加 |
| 取最新几条记录 | 负索引、切片 |
| 栈结构（后进先出） | append + pop() |
| 队列结构（先进先出） | append + pop(0)（但推荐用collections.deque） |
| 判断某值是否存在 | in 关键字 |
`,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
列表基础实战：员工管理系统
工作场景：HR系统中维护员工列表，进行增删改查操作
为什么这样写：列表是工作中最常用的数据结构，掌握基础操作是处理批量数据的第一步
"""


def main():
    print("=" * 50)
    print("列表基础实战：员工管理系统")
    print("=" * 50)

    # ---------- 1. 创建列表 ----------
    # 为什么用[]而不是list()：[]更简洁、性能更好，是工作中的首选
    # 场景：初始化部门员工列表
    employee_list = ["张三", "李四", "王五", "赵六", "钱七"]
    print(f"\\n【1】初始员工列表：{employee_list}")
    print(f"员工人数：{len(employee_list)}人")

    # ---------- 2. 索引访问 ----------
    # 场景：快速获取第一个/最后一个员工
    # 为什么用负索引：不需要算长度，employee_list[-1]直接拿最后一个，代码更简洁
    print(f"\\n【2】索引访问：")
    print(f"第一位员工：{employee_list[0]}")
    print(f"最后一位员工：{employee_list[-1]}")  # 工作中高频使用！
    print(f"倒数第二位员工：{employee_list[-2]}")

    # ---------- 3. 切片操作 ----------
    # 场景：分页显示员工列表，每页显示3人
    # 为什么切片好用：不需要写循环，一行代码搞定子列表
    print(f"\\n【3】切片操作（分页显示）：")
    page1 = employee_list[:3]  # 第1页：前3人
    page2 = employee_list[3:]  # 第2页：剩下的
    print(f"第1页员工：{page1}")
    print(f"第2页员工：{page2}")

    # 【坑点演示】切片是左闭右开！[:3]是索引0,1,2，不包含3
    print(f"注意：[:3]取到的是索引0-2，共{len(employee_list[:3])}个元素")

    # ---------- 4. 添加元素 ----------
    print(f"\\n【4】添加元素：")

    # append：添加新入职员工到末尾
    # 为什么用append：这是添加单个元素最高效的方式，O(1)时间复杂度
    employee_list.append("孙八")
    print(f"新员工孙八入职后：{employee_list}")

    # extend：批量添加（注意和append的区别！）
    # 场景：部门合并，一次性加入多个员工
    # 为什么不用append：append会把整个列表作为一个元素加进去，变成嵌套列表
    new_employees = ["周九", "吴十"]
    employee_list.extend(new_employees)
    print(f"批量添加周九、吴十后：{employee_list}")

    # 错误示范对比：如果用append会怎样？
    demo_list = ["A", "B"]
    demo_list.append(["C", "D"])
    print(f"【坑点】用append加列表会嵌套：{demo_list}")  # ['A', 'B', ['C', 'D']]

    # insert：置顶/插队场景
    # 注意：insert(0, x)性能较差，因为要移动所有元素，大数据量时慎用
    employee_list.insert(0, "VIP员工")
    print(f"插入VIP员工到开头：{employee_list}")

    # ---------- 5. 删除元素 ----------
    print(f"\\n【5】删除元素：")

    # pop：按索引删除，返回被删除的值
    # 场景：员工离职，办理完手续后从列表移除
    # 为什么pop好用：既能删除又能拿到值，方便记录日志
    removed = employee_list.pop()  # 默认删最后一个
    print(f"员工{removed}离职（pop）：{employee_list}")

    removed_first = employee_list.pop(0)  # 删第一个
    print(f"员工{removed_first}离职（pop(0)）：{employee_list}")

    # remove：按值删除
    # 场景：知道员工名字要删除，不需要知道他在哪个位置
    # 注意坑点：remove只删第一个匹配的，如果有重名只删第一个！
    # 注意坑点：值不存在会抛ValueError，工作中必须先判断或捕获异常
    target_name = "李四"
    if target_name in employee_list:
        employee_list.remove(target_name)
        print(f"员工{target_name}离职（remove）：{employee_list}")
    else:
        print(f"员工{target_name}不在列表中")

    # ---------- 6. in判断和遍历 ----------
    print(f"\\n【6】成员判断和遍历：")

    check_name = "王五"
    if check_name in employee_list:
        print(f"✓ {check_name} 在员工列表中")
    else:
        print(f"✗ {check_name} 不在员工列表中")

    print("\\n当前所有员工：")
    # 工作中遍历列表最常用的方式
    for idx, name in enumerate(employee_list):
        print(f"  {idx + 1}. {name}")

    # ---------- 7. 列表拼接和重复 ----------
    print(f"\\n【7】列表拼接：")
    sales_team = ["郑十一", "王十二"]
    tech_team = ["冯十三", "陈十四"]
    all_team = sales_team + tech_team
    print(f"销售团队：{sales_team}")
    print(f"技术团队：{tech_team}")
    print(f"合并后：{all_team}")

    # 列表重复：快速创建重复元素（比如初始化占位符）
    print(f"\\n分隔线：{'=' * 30}")
    placeholders = ["待分配"] * 3
    print(f"占位列表：{placeholders}")

    print("\\n" + "=" * 50)
    print("列表基础操作演示完成！")
    print("=" * 50)


if __name__ == "__main__":
    main()
`,
  },
  {
    id: "py-lists-advanced",
    group: "第二篇 数据结构 · 处理数据的利器",
    icon: "📊",
    title: "列表进阶操作",
    content: `# 列表进阶操作

掌握基础后，这一章学习工作中真正高频使用的列表技巧：排序、筛选、拷贝、推导式等。

## 排序：sort() 和 sorted()

排序是工作中最常用的操作之一。Python提供两种排序方式：
- \`list.sort()\`：**原地排序**，修改原列表，返回None
- \`sorted(list)\`：**返回新列表**，原列表不变

两者都有重要参数：
- \`reverse=True\`：降序排序
- \`key\`：指定排序依据（工作中极常用！）

\`\`\`python
# 商品数据：实际工作中经常需要按价格、销量等排序
products = [
    {"name": "笔记本", "price": 5999, "sales": 1200},
    {"name": "鼠标", "price": 99, "sales": 5000},
    {"name": "键盘", "price": 299, "sales": 3000},
]

# sorted：返回新列表，不修改原数据（推荐！安全）
products_by_price = sorted(products, key=lambda p: p["price"])
products_by_sales = sorted(products, key=lambda p: p["sales"], reverse=True)

# lambda是什么：匿名函数，p是参数，p["price"]是返回值
# 意思是"按每个商品的price字段排序"
\`\`\`

## 列表反转

\`\`\`python
numbers = [1, 2, 3, 4, 5]

# 方法1：reverse()原地反转
numbers.reverse()  # 修改原列表

# 方法2：切片反转（更常用，不修改原列表）
reversed_numbers = numbers[::-1]  # 返回新列表
\`\`\`

## 查找和统计

\`\`\`python
scores = [85, 92, 78, 92, 90, 85, 92]

# index：找某个值第一次出现的位置
# 注意：找不到会抛ValueError，建议先in判断
if 92 in scores:
    pos = scores.index(92)  # 1（第一个92的位置）

# count：统计某个值出现的次数（统计分数段时有用）
count_92 = scores.count(92)  # 3
\`\`\`

## 浅拷贝：三种方式

拷贝列表是新手常踩坑的地方！为什么不能直接 \`list2 = list1\`？因为这只是**引用赋值**，两个变量指向同一个列表！

\`\`\`python
original = [1, 2, 3]

# ❌ 错误：不是拷贝，是别名！修改一个另一个也变
bad_copy = original

# ✅ 正确的三种浅拷贝方式
copy1 = list(original)    # 用list()构造函数
copy2 = original[:]       # 用切片（最简洁常用）
copy3 = original.copy()   # 用copy()方法

# 浅拷贝的限制：只能拷贝第一层，嵌套列表还是共享的！
# 深拷贝需要用copy.deepcopy()，后面章节讲
\`\`\`

## 列表推导式：Python的精华！

列表推导式是Python最有特色、最优雅的语法之一，可以**一行代码代替多行循环**，工作中高频使用。

基本语法：\`[表达式 for 变量 in 可迭代对象 if 条件]\`

\`\`\`python
# 场景1：转换数据 - 把所有价格打8折
prices = [100, 200, 300, 400, 500]
discounted = [p * 0.8 for p in prices]
# 等价于：discounted = []
#         for p in prices:
#             discounted.append(p * 0.8)

# 场景2：筛选数据 - 找出价格大于300的商品
expensive = [p for p in prices if p > 300]  # [400, 500]

# 场景3：转换+筛选 - 大于200的打8折
result = [p * 0.8 for p in prices if p > 200]

# 场景4：嵌套循环推导式
# 工作中不要写太复杂的推导式，超过2层循环可读性会下降！
\`\`\`

> **建议**：列表推导式虽好，但不要过度使用。如果逻辑太复杂（超过2个for或2个if），还是写普通for循环更清晰，代码是写给人看的。

## enumerate：同时拿索引和值

遍历列表时经常需要同时知道"这是第几个元素"，用\`enumerate\`比自己维护计数器优雅多了：

\`\`\`python
employees = ["张三", "李四", "王五"]

# 不推荐：自己维护索引（容易写错）
# for i in range(len(employees)):
#     print(i+1, employees[i])

# ✅ 推荐：用enumerate（Pythonic写法）
for idx, name in enumerate(employees, start=1):  # start=1从1开始编号
    print(f"第{idx}位：{name}")
\`\`\`

## zip：并行遍历多个列表

\`\`\`python
# 场景：有两个列表，一个是名字，一个是分数，要一一对应
names = ["张三", "李四", "王五"]
scores = [85, 92, 78]

# zip把两个列表"打包"成一对一对的
for name, score in zip(names, scores):
    print(f"{name}: {score}分")

# 注意坑点：如果两个列表长度不一样，zip以短的为准！
\`\`\`

## 嵌套列表

列表可以包含列表，这就是二维数组（类似Excel表格）：

\`\`\`python
# 3个学生，每个学生3门课成绩
score_matrix = [
    [85, 92, 78],   # 张三
    [90, 88, 95],   # 李四
    [76, 82, 88],   # 王五
]

# 访问：先找外层，再找内层
zhangsan_math = score_matrix[0][1]  # 张三的第二门课：92

# 遍历二维列表
for i, student_scores in enumerate(score_matrix):
    total = sum(student_scores)
    print(f"学生{i+1}总分：{total}")
\`\`\`

## 工作场景总结

| 需求 | 推荐方案 |
|------|---------|
| 不修改原列表排序 | sorted()，指定key参数 |
| 修改原列表排序 | list.sort() |
| 复制列表 | lst[:] 或 list(lst) |
| 转换/筛选数据 | 列表推导式（简单逻辑）|
| 遍历需要索引 | enumerate() |
| 多个列表并行遍历 | zip() |
| 二维表格数据 | 嵌套列表 |
`,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
列表进阶实战：商品销售数据分析
工作场景：电商系统中对商品列表进行排序、筛选、统计
为什么这样写：这些操作是数据处理的基础，每天都要用
"""

from copy import deepcopy


def main():
    print("=" * 60)
    print("列表进阶实战：商品销售数据分析")
    print("=" * 60)

    # ---------- 准备商品数据 ----------
    # 工作场景：从数据库/API拿到的商品列表，每个商品是字典
    products = [
        {"id": 1, "name": "ThinkPad笔记本", "price": 6999, "sales": 1200, "category": "电脑"},
        {"id": 2, "name": "Logitech鼠标", "price": 129, "sales": 8500, "category": "外设"},
        {"id": 3, "name": "机械键盘", "price": 399, "sales": 4200, "category": "外设"},
        {"id": 4, "name": "Dell显示器", "price": 1599, "sales": 2100, "category": "电脑"},
        {"id": 5, "name": "USB-C扩展坞", "price": 299, "sales": 3600, "category": "配件"},
        {"id": 6, "name": "无线耳机", "price": 899, "sales": 5800, "category": "外设"},
    ]

    print(f"\\n共{len(products)}个商品数据")

    # ---------- 1. 排序 sorted() ----------
    print("\\n" + "-" * 60)
    print("【1】排序操作：sorted() 不修改原数据（推荐）")

    # 为什么用sorted而不是sort：
    # 工作中原始数据通常还要保留，用sorted返回新列表更安全
    # key=lambda x: x["price"] 表示"按每个商品的price字段排序"
    # lambda是匿名函数，这里就是告诉sorted排序的依据是什么

    # 按价格从低到高排序
    by_price_asc = sorted(products, key=lambda p: p["price"])
    print("\\n📈 按价格升序：")
    for p in by_price_asc:
        print(f"  {p['name']:<15} ¥{p['price']:>5}  销量:{p['sales']}")

    # 按销量从高到低排序（reverse=True）
    by_sales_desc = sorted(products, key=lambda p: p["sales"], reverse=True)
    print("\\n📊 按销量降序（爆款榜）：")
    for p in by_sales_desc:
        print(f"  {p['name']:<15} ¥{p['price']:>5}  销量:{p['sales']}")

    # 【工作技巧】多字段排序：先按分类，再按价格
    # key返回元组时，会按元组顺序依次排序
    by_category_price = sorted(products, key=lambda p: (p["category"], p["price"]))
    print("\\n📑 按分类+价格排序：")
    current_cat = None
    for p in by_category_price:
        if p["category"] != current_cat:
            print(f"  --- {p['category']}类 ---")
            current_cat = p["category"]
        print(f"    {p['name']:<15} ¥{p['price']:>5}")

    # ---------- 2. 列表拷贝：避坑！---------
    print("\\n" + "-" * 60)
    print("【2】列表拷贝：为什么不能直接用 = 赋值？")

    original_scores = [85, 92, 78]

    # ❌ 坑：直接=不是拷贝，是起别名！两个变量指向同一个列表
    bad_copy = original_scores
    bad_copy.append(100)
    print(f"修改bad_copy后，original也变了：{original_scores}")  # 原数据被改了！
    # 工作中这是严重bug，原始数据意外被污染

    # ✅ 正确：浅拷贝的三种方式
    original_scores = [85, 92, 78]  # 恢复
    copy1 = list(original_scores)
    copy2 = original_scores[:]
    copy3 = original_scores.copy()

    copy1.append(100)
    print(f"正确拷贝后修改copy1，原数据不变：{original_scores}")

    # 【浅拷贝的局限】嵌套列表（二维数据）只拷贝第一层
    matrix = [[1, 2], [3, 4]]
    shallow = matrix[:]
    shallow[0].append(99)
    print(f"\\n【浅拷贝坑点】修改嵌套元素，原数据也变了：{matrix}")
    # 因为浅拷贝只拷贝了外层列表，内层的子列表还是共享的！

    # 解决方案：深拷贝
    matrix = [[1, 2], [3, 4]]
    deep = deepcopy(matrix)
    deep[0].append(99)
    print(f"深拷贝后，原数据安全：{matrix}")

    # ---------- 3. 列表推导式（核心！）---------
    print("\\n" + "-" * 60)
    print("【3】列表推导式：一行代码搞定转换/筛选")

    prices = [p["price"] for p in products]
    print(f"所有商品价格：{prices}")

    # 场景1：提取特定字段（工作中极常用！）
    product_names = [p["name"] for p in products]
    print(f"所有商品名称：{product_names}")

    # 场景2：筛选 - 只看价格低于500的商品
    cheap_products = [p for p in products if p["price"] < 500]
    print(f"\\n价格低于500元的商品（共{len(cheap_products)}个）：")
    for p in cheap_products:
        print(f"  {p['name']} - ¥{p['price']}")

    # 场景3：转换+筛选 - 所有商品打9折，但只显示打折后>5000的
    premium_discounted = [
        {"name": p["name"], "final_price": round(p["price"] * 0.9, 2)}
        for p in products
        if p["price"] * 0.9 > 1000
    ]
    print(f"\\n折后价>1000元的商品（9折）：")
    for item in premium_discounted:
        print(f"  {item['name']}: ¥{item['final_price']}")

    # 【工作建议】：推导式里逻辑太复杂时（超过2个条件），
    # 还是写普通for循环，可读性优先，别为了炫技写天书

    # ---------- 4. enumerate：带索引遍历 ----------
    print("\\n" + "-" * 60)
    print("【4】enumerate：同时拿序号和值")

    # 为什么不用range(len())：容易写错，enumerate更Pythonic
    print("\\n商品排行榜：")
    for rank, p in enumerate(by_sales_desc, start=1):
        print(f"  第{rank}名：{p['name']} (销量:{p['sales']})")

    # ---------- 5. zip：并行遍历 ----------
    print("\\n" + "-" * 60)
    print("【5】zip：同时遍历多个列表")

    months = ["1月", "2月", "3月", "4月"]
    sales_data = [120000, 156000, 134000, 189000]

    print("\\n月度销售额：")
    for month, amount in zip(months, sales_data):
        print(f"  {month}：¥{amount:,}")

    # 【坑点提醒】两个列表长度不同时，zip以短的为准
    # 长的部分会被丢弃！要处理不等长用itertools.zip_longest

    # ---------- 6. index和count ----------
    print("\\n" + "-" * 60)
    print("【6】查找与统计")

    categories = [p["category"] for p in products]
    print(f"所有分类：{categories}")
    print(f"'外设'出现次数：{categories.count('外设')}")

    # index找位置，找不到会报错，所以先in判断
    target_name = "机械键盘"
    if target_name in product_names:
        idx = product_names.index(target_name)
        print(f"'{target_name}'在列表中的位置：{idx}")
    else:
        print(f"'{target_name}'未找到")

    # ---------- 7. 嵌套列表处理 ----------
    print("\\n" + "-" * 60)
    print("【7】嵌套列表：二维表格数据处理")

    # 场景：各季度各部门销售额（二维表）
    sales_matrix = [
        # Q1    Q2    Q3    Q4
        [120, 145, 160, 180],  # 销售部（单位：万元）
        [80,  85,  95,  110],  # 技术部
        [50,  55,  60,  75],   # 行政部
    ]
    dept_names = ["销售部", "技术部", "行政部"]

    print("\\n各部门年度销售额统计：")
    for dept_idx, dept_sales in enumerate(sales_matrix):
        total = sum(dept_sales)
        avg = total / len(dept_sales)
        max_q = max(dept_sales)
        print(f"  {dept_names[dept_idx]}：总计¥{total}万，均¥{avg:.1f}万，最高¥{max_q}万")

    print("\\n" + "=" * 60)
    print("列表进阶操作演示完成！")
    print("=" * 60)


if __name__ == "__main__":
    main()
`,
  },
  {
    id: "py-tuples",
    group: "第二篇 数据结构 · 处理数据的利器",
    icon: "🔒",
    title: "元组：不可变序列",
    content: `# 元组：不可变序列

元组（tuple）和列表很像，都是有序序列，但有一个关键区别：**元组是不可变的**——创建后就不能修改、添加、删除元素。

> **为什么需要不可变？** 工作中有些数据从定义开始就不应该被修改，比如坐标点(x,y)、RGB颜色值、数据库记录的一行——用元组可以防止意外修改，让代码更安全。

## 创建元组

\`\`\`python
# 方式1：用小括号()（最常用）
point = (10, 20)
rgb_color = (255, 128, 0)

# 方式2：省略括号（Python允许，逗号才是元组的标志）
coords = 100, 200  # 这也是元组！

# 方式3：tuple()构造函数，从其他类型转换
name_tuple = tuple(["张三", "李四"])

# 【超级大坑】单元素元组必须加逗号！
not_a_tuple = (5)     # ❌ 这是整数5，不是元组！
single_tuple = (5,)   # ✅ 这才是包含一个元素5的元组
\`\`\`

> **坑点警告**：单元素元组不加逗号是Python新手排名前三的坑！(x) 不是元组，(x,) 才是。逗号比括号更重要。

## 元组的操作

元组支持列表的"读操作"，但不支持"写操作"：

\`\`\`python
employee = ("EMP001", "张三", "技术部", 15000)

# ✅ 可以：索引、切片、遍历、in、len、+、*
print(employee[1])          # "张三"
print(employee[:2])         # ("EMP001", "张三")
print(len(employee))        # 4
print("张三" in employee)   # True

# ❌ 不可以：修改、添加、删除
# employee[1] = "李四"      # 报错！TypeError: 'tuple' object does not support item assignment
# employee.append("新来的") # 报错！元组没有append方法
\`\`\`

## 元组解包（超级好用！）

元组解包是Python的优雅语法，工作中天天用：

\`\`\`python
# 场景：一个函数返回多个值，其实就是返回元组
def get_min_max(numbers):
    return min(numbers), max(numbers)  # 返回(最小值, 最大值)元组

# 解包：直接把元组的元素分别赋值给变量
min_val, max_val = get_min_max([3, 1, 4, 1, 5, 9])
print(min_val, max_val)  # 1 9

# 经典用法：交换两个变量（不需要临时变量！）
a, b = 10, 20
a, b = b, a  # 交换！这行背后就是元组解包
print(a, b)  # 20 10

# 用*接收多个元素（Python 3+）
first, *rest, last = (1, 2, 3, 4, 5)
print(first)  # 1
print(rest)   # [2, 3, 4]
print(last)   # 5
\`\`\`

## 元组 vs 列表：什么时候用哪个？

| 特性 | 列表 list | 元组 tuple |
|------|----------|-----------|
| 可变性 | 可变（可增删改） | 不可变（创建后不能改） |
| 语法 | [] | () 或逗号 |
| 性能 | 稍慢 | 稍快（因为不可变） |
| 可哈希 | ❌ 不能做字典key | ✅ 可以做字典key |
| 用途 | 同类元素的集合，会变化 | 固定结构的数据，不会变 |

**工作经验总结**：
- 表示"一堆同类的东西"用列表：员工列表、商品列表
- 表示"一个东西的多个属性"用元组：坐标(x,y)、RGB颜色、数据库行记录

## 元组作为字典的key

因为元组不可变、可哈希，所以可以作为字典的key，这在某些场景非常有用：

\`\`\`python
# 场景：用(城市, 产品)作为key，存销售额
sales = {}
sales[("北京", "笔记本")] = 500
sales[("上海", "笔记本")] = 600
sales[("北京", "鼠标")] = 2000

# 列表不能当key：
# sales_key = ["北京", "笔记本"]
# sales[sales_key] = 500  # ❌ 报错！列表不可哈希
\`\`\`

## namedtuple：命名元组（工作中处理结构化数据超好用）

普通元组只能用索引访问，\`employee[3]\`谁知道3代表什么？\`namedtuple\`可以给字段起名字，让代码可读性飙升：

\`\`\`python
from collections import namedtuple

# 定义一个"员工"类型，有id、name、dept、salary字段
Employee = namedtuple("Employee", ["id", "name", "dept", "salary"])

# 创建实例
emp = Employee("EMP001", "张三", "技术部", 15000)

# 可以像元组一样用索引
print(emp[1])  # "张三"

# 【重点】还可以用属性名访问！代码可读性大幅提升
print(emp.name)    # "张三"
print(emp.salary)  # 15000

# 但它还是元组，不可修改！
# emp.salary = 20000  # 报错！
\`\`\`

> **什么时候用namedtuple？** 当你需要一个"轻量级的类"，只有数据没有方法，而且数据不该被修改时——比定义class简洁，比普通元组清晰。

## 为什么用元组？总结

1. **安全性**：防止数据被意外修改，相当于给数据加了"只读保护"
2. **可哈希**：可以作为字典的key，也可以放在集合里
3. **性能好**：元组比列表稍快（创建、遍历都快一点）
4. **语义清晰**：看到元组就知道"这是固定结构的数据，不应该改"
5. **解包方便**：多返回值、变量交换都靠它
`,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
元组实战：坐标系统、员工记录、数据安全保护
工作场景：
1. 表示不该被修改的固定数据（坐标、配置、数据库记录）
2. 函数返回多个值
3. 作为字典key建立复合索引
为什么用元组：不可变性保证数据安全，代码意图更清晰
"""

from collections import namedtuple


def analyze_sales(quarterly_sales):
    """
    分析季度销售数据
    为什么返回元组：因为返回的是(最小值, 最大值, 总和, 平均值)的固定结构，
    不会改变，用元组语义更清晰，也防止调用者意外修改
    """
    min_sale = min(quarterly_sales)
    max_sale = max(quarterly_sales)
    total = sum(quarterly_sales)
    avg = total / len(quarterly_sales)
    return min_sale, max_sale, total, avg  # 这就是在返回元组！


def main():
    print("=" * 60)
    print("元组实战：不可变数据结构的正确使用")
    print("=" * 60)

    # ---------- 1. 创建元组 ----------
    print("\\n【1】创建元组 & 单元素坑点")

    # 地理坐标：经纬度是固定值，不该被修改，用元组正合适
    beijing = (39.9042, 116.4074)
    shanghai = (31.2304, 121.4737)
    print(f"北京坐标：{beijing}")
    print(f"上海坐标：{shanghai}")

    # 【大坑演示】单元素元组
    x = (5)
    print(f"\\n(5)的类型：{type(x)}，值：{x}")  # <class 'int'>！是整数不是元组
    x = (5,)
    print(f"(5,)的类型：{type(x)}，值：{x}")  # 这才是元组

    # 为什么这样设计：因为括号还用来表示数学运算优先级，
    # 所以Python用"逗号"作为元组的真正标志，括号只是可选的

    # ---------- 2. 元组不可变性：安全保护 ----------
    print("\\n" + "-" * 60)
    print("【2】不可变性：为什么重要？")

    # RGB颜色值：定义后就不该修改
    COLOR_RED = (255, 0, 0)
    COLOR_GREEN = (0, 255, 0)
    COLOR_BLUE = (0, 0, 255)

    # 如果用列表，万一代码某个地方不小心改了，整个UI颜色都错了
    # 而且这种bug很难排查！
    print(f"\\n红色RGB：{COLOR_RED}")
    print(f"绿色RGB：{COLOR_GREEN}")

    # 尝试修改会报错（注释掉避免程序中断，你可以放开试试）
    # COLOR_RED[0] = 128  # ❌ TypeError: 'tuple' object does not support item assignment
    print("尝试修改元组会报错：TypeError，防止数据被意外篡改")

    # ---------- 3. 元组解包（工作中最高频用法！）---------
    print("\\n" + "-" * 60)
    print("【3】元组解包：函数多返回值、变量交换")

    quarterly = [120, 156, 134, 189]
    min_s, max_s, total, avg = analyze_sales(quarterly)
    print(f"\\n季度销售数据分析：")
    print(f"  最低：{min_s}万")
    print(f"  最高：{max_s}万")
    print(f"  总额：{total}万")
    print(f"  平均：{avg:.1f}万")

    # 经典应用：交换两个变量
    print(f"\\n交换变量（不需要临时变量！）：")
    a, b = 100, 200
    print(f"  交换前：a={a}, b={b}")
    a, b = b, a  # 这就是元组解包！右边先组装成(b,a)元组，再解包给左边
    print(f"  交换后：a={a}, b={b}")

    # *号接收多个元素（Python3特性，处理变长数据很好用）
    first, *middle, last = (10, 20, 30, 40, 50)
    print(f"\\n*解包：first={first}, middle={middle}, last={last}")

    # ---------- 4. 元组作为字典key（复合索引）---------
    print("\\n" + "-" * 60)
    print("【4】元组作为字典key：复合键场景")

    # 场景：按(地区, 产品)维度统计销售额
    # 为什么不用列表当key：因为列表可变，Python不允许
    sales_data = {}
    sales_data[("华东", "笔记本")] = 520
    sales_data[("华东", "鼠标")] = 1800
    sales_data[("华北", "笔记本")] = 480
    sales_data[("华北", "键盘")] = 920
    sales_data[("华南", "笔记本")] = 610

    print("\\n区域销售数据：")
    for (region, product), amount in sales_data.items():
        print(f"  {region} - {product}: {amount}台")

    # 查询方便
    key = ("华东", "笔记本")
    if key in sales_data:
        print(f"\\n华东笔记本销量：{sales_data[key]}台")

    # ---------- 5. namedtuple：命名元组（推荐！）---------
    print("\\n" + "-" * 60)
    print("【5】namedtuple：有字段名的元组（可读性神器）")

    # 为什么用namedtuple：
    # 普通元组emp[3]谁知道3是什么？用namedtuple可以emp.salary，代码自己说话
    Employee = namedtuple("Employee", ["emp_id", "name", "department", "salary"])

    emp1 = Employee("E001", "张三", "技术部", 18000)
    emp2 = Employee("E002", "李四", "销售部", 15000)
    emp3 = Employee("E003", "王五", "技术部", 22000)

    employees = [emp1, emp2, emp3]

    print("\\n员工信息（用属性名访问，清晰！）：")
    for emp in employees:
        # 比 emp[1], emp[3] 可读性强一万倍！
        print(f"  {emp.emp_id}: {emp.name} | {emp.department} | ¥{emp.salary}")

    # 技术部员工工资总额
    tech_total = sum(e.salary for e in employees if e.department == "技术部")
    print(f"\\n技术部工资总额：¥{tech_total}")

    # namedtuple还是元组，所以不可修改！
    # emp1.salary = 20000  # ❌ 报错！防止误改

    # 但可以用_replace()创建一个新的（注意是返回新对象，不是修改原对象）
    emp1_updated = emp1._replace(salary=20000)
    print(f"\\n涨薪后：{emp1_updated.name} 新工资 ¥{emp1_updated.salary}")
    print(f"原对象没变：{emp1.name} 原工资 ¥{emp1.salary}")

    # ---------- 6. 列表 vs 元组 选择指南 ----------
    print("\\n" + "-" * 60)
    print("【6】什么时候用列表？什么时候用元组？")
    print("""
  列表 []  → "我有一堆相同类型的东西，数量可能变化"
             例如：员工列表、商品列表、订单列表、待办事项

  元组 () → "这是一个东西的多个属性/坐标，固定不变"
             例如：经纬度(lat,lng)、RGB颜色、(年,月,日)、数据库行记录
""")

    # 实际例子对比：
    shopping_cart = ["笔记本", "鼠标"]  # 购物车：商品会增减 → 列表
    order_record = ("ORD12345", "张三", 2527.0, "已付款")  # 订单记录：不可变 → 元组

    print(f"购物车（列表，可变）：{shopping_cart}")
    print(f"订单记录（元组，不可变）：{order_record}")

    print("\\n" + "=" * 60)
    print("元组操作演示完成！记住：不可变是一种保护，不是限制。")
    print("=" * 60)


if __name__ == "__main__":
    main()
`,
  },
  {
    id: "py-dicts-basic",
    group: "第二篇 数据结构 · 处理数据的利器",
    icon: "📖",
    title: "字典基础：键值对存储",
    content: `# 字典基础：键值对存储

字典（dict）是Python中最重要的数据结构之一，存储**键值对（key-value）**映射关系，类似现实中的字典——通过"词"（key）查"释义"（value）。

> **工作场景**：字典无处不在！用户信息、配置项、API返回数据、数据库记录——几乎所有结构化数据都是用字典表示的。

## 创建字典

\`\`\`python
# 方式1：花括号{}（最常用）
user = {
    "id": 1001,
    "name": "张三",
    "age": 28,
    "department": "技术部"
}

# 方式2：dict()构造函数（键名不加引号时）
user2 = dict(id=1002, name="李四", age=30)

# 方式3：从键值对列表创建
user3 = dict([("id", 1003), ("name", "王五")])
\`\`\`

## 访问值：[] vs get()

\`\`\`python
user = {"name": "张三", "age": 28}

# 方式1：用[]访问（key不存在会报错！）
print(user["name"])  # "张三"
# print(user["phone"])  # ❌ KeyError！崩溃

# 方式2：用get()访问（推荐！key不存在返回None或默认值，不报错）
print(user.get("name"))           # "张三"
print(user.get("phone"))          # None（不报错！）
print(user.get("phone", "无"))    # "无"（指定默认值）
\`\`\`

> **坑点提醒**：工作中**几乎永远用get()**而不是[]来访问字典值，除非你100%确定key存在（比如刚定义的字典）。KeyError是生产环境常见bug。

## 添加/修改键值对

\`\`\`python
user = {"name": "张三", "age": 28}

# 直接赋值：key存在就修改，不存在就添加（太方便了！）
user["age"] = 29              # 修改：age变成29
user["department"] = "技术部"  # 添加：新增department字段
user["phone"] = "138xxxx"     # 添加：新增phone字段

print(user)
# {'name': '张三', 'age': 29, 'department': '技术部', 'phone': '138xxxx'}
\`\`\`

## 删除键值对

\`\`\`python
user = {"name": "张三", "age": 28, "temp_data": "xxx"}

# 方式1：del语句（key不存在报错）
del user["temp_data"]

# 方式2：pop(key)（推荐！删除并返回值，key不存在可给默认值）
age = user.pop("age")  # age=28，user中age被删除
phone = user.pop("phone", None)  # key不存在返回None，不报错

# 方式3：clear()清空所有
user.clear()
\`\`\`

## 遍历字典：keys() / values() / items()

\`\`\`python
product = {"name": "笔记本", "price": 5999, "stock": 50}

# 只遍历key（默认就是遍历key）
for key in product:
    print(key)

# 只遍历value
for value in product.values():
    print(value)

# 【最常用】同时遍历key和value（items()）
for key, value in product.items():
    print(f"{key}: {value}")
\`\`\`

## 其他常用操作

\`\`\`python
user = {"name": "张三", "age": 28}

# in：判断key是否存在（注意：是判断key，不是value！）
print("name" in user)   # True
print("phone" in user)  # False
print("张三" in user)   # False！（判断的是key不是值）

# len()：键值对数量
print(len(user))  # 2
\`\`\`

> **注意**：Python 3.7+ 字典是**保持插入顺序**的（3.6是实现细节，3.7正式成为语言特性）。但不要依赖这个写代码，如果需要有序用collections.OrderedDict更明确。

## 字典的key必须是可哈希的（不可变类型）

\`\`\`python
# ✅ 可以作为key的：字符串、数字、元组（元组里元素也必须可哈希）
d = {}
d["name"] = "张三"
d[123] = "数字key"
d[(10, 20)] = "元组key"

# ❌ 不可以作为key的：列表、字典、集合（可变类型）
# d[[1,2]] = "列表key"    # 报错！TypeError: unhashable type: 'list'
\`\`\`

## 工作场景：用户信息处理

\`\`\`python
# 从API/数据库拿到的用户数据就是这种结构
user_info = {
    "user_id": "U10086",
    "username": "zhangsan",
    "email": "zhangsan@example.com",
    "profile": {
        "real_name": "张三",
        "age": 28,
        "city": "北京"
    },
    "is_vip": True,
    "balance": 158.5
}

# 安全访问：用get()链式调用要小心，中间某层为None会报错
# 更好的方式是用collections.defaultdict或自己写安全访问函数
city = user_info.get("profile", {}).get("city", "未知")
print(city)  # "北京"
\`\`\`

## 本章重点总结

| 操作 | 推荐方式 | 注意事项 |
|------|---------|---------|
| 访问值 | dict.get(key, default) | []访问key不存在会KeyError |
| 添加/修改 | dict[key] = value | key存在就改，不存在就加 |
| 删除 | dict.pop(key, default) | 删除同时返回值，不报错 |
| 遍历 | for k, v in dict.items() | 最常用的遍历方式 |
| 判断存在 | key in dict | 注意判断的是key不是value |
`,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
字典基础实战：用户信息管理系统
工作场景：处理用户、商品、订单等结构化数据，字典是最常用的载体
为什么这样写：
1. 字典是Python的核心数据结构，必须熟练
2. get()避免KeyError是生产代码的基本要求
3. items()遍历是处理字典的标准姿势
"""


def main():
    print("=" * 60)
    print("字典基础实战：用户信息管理系统")
    print("=" * 60)

    # ---------- 1. 创建字典 ----------
    print("\\n【1】创建字典：存储用户信息")

    # 场景：从数据库查询出来的用户记录就是这样的字典
    # 为什么用字典：每个字段有明确的名字，比用元组/列表可读性强太多
    user = {
        "user_id": "U10001",
        "username": "zhangsan",
        "real_name": "张三",
        "age": 28,
        "department": "技术部",
        "salary": 18000,
        "is_active": True
    }

    print(f"用户ID：{user['user_id']}")
    print(f"用户名：{user['username']}")
    print(f"姓名：{user['real_name']}")

    # ---------- 2. 访问值：[] vs get() ----------
    print("\\n" + "-" * 60)
    print("【2】访问值：为什么推荐用get()而不是[]？")

    # []访问：key必须存在，否则直接崩溃（KeyError是生产环境常见bug）
    print(f"\\n用[]访问部门：{user['department']}")

    # get()访问：key不存在返回None（或指定默认值），不会崩溃
    # 工作中这至关重要：不是每个用户都填了所有字段！
    phone = user.get("phone")
    print(f"用get()访问phone（不存在）：{phone}")

    phone = user.get("phone", "未填写")
    print(f"用get()访问phone（带默认值）：{phone}")

    # 【反面教材】如果用[]访问不存在的key
    try:
        print(user["phone"])
    except KeyError as e:
        print(f"\\n❌ 用[]访问不存在的key会抛KeyError: {e}")
        print("   工作中这会导致整个接口/程序崩溃！")

    # ---------- 3. 添加/修改字段 ----------
    print("\\n" + "-" * 60)
    print("【3】添加/修改：直接赋值即可（太方便了）")

    # 添加新字段：用户补填了手机号
    user["phone"] = "13800138000"
    print(f"添加phone后：{user.get('phone')}")

    # 修改字段：涨薪了
    old_salary = user["salary"]
    user["salary"] = 20000
    print(f"薪资从 ¥{old_salary} 修改为 ¥{user['salary']}")

    # 添加多个字段：update()方法（进阶章会详讲）
    user.update({
        "city": "北京",
        "entry_date": "2022-03-15",
        "email": "zhangsan@company.com"
    })
    print(f"\\n批量更新后用户信息：")
    for k, v in user.items():
        print(f"  {k}: {v}")

    # ---------- 4. 删除操作 ----------
    print("\\n" + "-" * 60)
    print("【4】删除字段：pop()最安全")

    # pop()：删除并返回值，key不存在可以给默认值不报错
    # 场景：用户注销账户，清理敏感字段
    if "phone" in user:
        removed_phone = user.pop("phone")
        print(f"已删除手机号：{removed_phone}")

    # pop带默认值：如果key不存在也不报错（安全！）
    removed_value = user.pop("non_exist_key", None)
    print(f"删除不存在的key（带默认值）：{removed_value}（不会报错）")

    # 对比del：key不存在会报错
    # del user["non_exist_key"]  # ❌ KeyError!

    # ---------- 5. 遍历字典：items()是最常用方式 ----------
    print("\\n" + "-" * 60)
    print("【5】遍历字典：三种方式")

    # 准备商品数据
    product = {
        "name": "ThinkPad X1 Carbon",
        "price": 9999,
        "stock": 35,
        "category": "笔记本电脑",
        "brand": "联想"
    }

    print("\\n方式1：遍历key（默认）")
    for key in product:
        print(f"  key: {key}")

    print("\\n方式2：遍历value")
    for value in product.values():
        print(f"  value: {value}")

    print("\\n方式3：同时遍历key和value（✅最常用）")
    for key, value in product.items():
        print(f"  {key}: {value}")

    # ---------- 6. 成员判断 in ----------
    print("\\n" + "-" * 60)
    print("【6】in判断：注意判断的是key不是value！")

    print(f"\\n'name' in product：{'name' in product}")  # True（key存在）
    print(f"'联想' in product：{'联想' in product}")  # False！（判断key不是value）

    # 要判断value是否存在，用.values()
    print(f"'联想' in product.values()：{'联想' in product.values()}")  # True

    # 【高频工作场景】：配置项检查
    app_config = {"debug": False, "port": 8080}
    required_keys = ["host", "port", "debug"]
    missing = [k for k in required_keys if k not in app_config]
    if missing:
        print(f"\\n⚠️ 配置缺失：{missing}")
        print("   工作中服务启动前常做这种检查！")

    # ---------- 7. 嵌套字典：真实世界的数据结构 ----------
    print("\\n" + "-" * 60)
    print("【7】嵌套字典：API/数据库返回的数据都长这样")

    # 场景：从API获取的订单数据，多层嵌套
    order = {
        "order_id": "ORD202401001",
        "user": {
            "user_id": "U10001",
            "name": "张三",
            "contact": {
                "phone": "138xxxx",
                "address": "北京市朝阳区xxx"
            }
        },
        "items": [
            {"name": "笔记本", "price": 6999, "qty": 1},
            {"name": "鼠标", "price": 129, "qty": 2}
        ],
        "total_amount": 7257,
        "status": "已付款"
    }

    # 逐层访问
    print(f"\\n订单号：{order['order_id']}")
    print(f"下单人：{order['user']['name']}")
    # 安全访问嵌套字典：每一层都用get()防止中间缺失崩溃
    address = order.get("user", {}).get("contact", {}).get("address", "地址未知")
    print(f"收货地址：{address}")

    print(f"\\n商品明细：")
    for item in order["items"]:
        subtotal = item["price"] * item["qty"]
        print(f"  {item['name']} x{item['qty']} = ¥{subtotal}")
    print(f"订单总额：¥{order['total_amount']}")

    print("\\n" + "=" * 60)
    print("字典基础操作演示完成！记住：遇到结构化数据就用字典。")
    print("=" * 60)


if __name__ == "__main__":
    main()
`,
  },
  {
    id: "py-dicts-advanced",
    group: "第二篇 数据结构 · 处理数据的利器",
    icon: "🗂️",
    title: "字典进阶与实用技巧",
    content: `# 字典进阶与实用技巧

掌握基础后，这一章学习字典的进阶技巧，这些是工作中处理复杂数据的利器。

## setdefault：设置默认值（很常用！）

\`dict.setdefault(key, default)\`：如果key存在，返回它的值；如果不存在，设置为default并返回default。

最经典的用途：**分组统计**时初始化列表/计数器。

\`\`\`python
# 场景：把员工按部门分组
employees = [
    ("张三", "技术部"),
    ("李四", "销售部"),
    ("王五", "技术部"),
    ("赵六", "销售部"),
]

dept_groups = {}
for name, dept in employees:
    # 如果dept这个key不存在，先设置为[]，然后append
    dept_groups.setdefault(dept, []).append(name)

print(dept_groups)
# {'技术部': ['张三', '王五'], '销售部': ['李四', '赵六']}

# 不用setdefault要写这么多（麻烦）：
# if dept not in dept_groups:
#     dept_groups[dept] = []
# dept_groups[dept].append(name)
\`\`\`

## update：批量更新字典

\`\`\`python
user = {"name": "张三", "age": 28}

# 一次性添加/修改多个字段
user.update({
    "age": 29,           # 修改
    "phone": "138xxx",   # 添加
    "city": "北京"       # 添加
})

# Python 3.9+ 还可以用 | 合并字典
# new_user = user | {"phone": "139xxx"}  # 返回新字典
\`\`\`

## 字典推导式

和列表推导式类似，快速生成字典：

\`\`\`python
# 场景1：从两个列表生成映射字典
keys = ["name", "age", "city"]
values = ["张三", 28, "北京"]
user_dict = {k: v for k, v in zip(keys, values)}
# {'name': '张三', 'age': 28, 'city': '北京'}

# 场景2：筛选/转换字典
prices = {"笔记本": 5999, "鼠标": 99, "键盘": 299}
expensive = {k: v for k, v in prices.items() if v > 100}
# {'笔记本': 5999, '键盘': 299}

# 场景3：key和value互换（前提是value唯一且可哈希）
name_to_id = {"张三": 1, "李四": 2}
id_to_name = {v: k for k, v in name_to_id.items()}
# {1: '张三', 2: '李四'}
\`\`\`

## collections.defaultdict：默认值字典（分组统计神器！）

普通字典访问不存在的key会报错，\`defaultdict\`会自动给你创建默认值，**分组统计时超级好用**。

\`\`\`python
from collections import defaultdict

# 场景：按部门分组员工
dept_employees = defaultdict(list)  # 访问不存在的key自动创建空列表

employees = [("张三", "技术部"), ("李四", "销售部"), ("王五", "技术部")]
for name, dept in employees:
    dept_employees[dept].append(name)  # 不需要先判断key存不存在！

print(dept_employees["技术部"])  # ['张三', '王五']
print(dept_employees["行政部"])  # [] （不存在也不报错，返回空列表）

# 其他常用默认类型
int_counter = defaultdict(int)    # 默认0，用于计数
set_groups = defaultdict(set)     # 默认空集合
\`\`\`

## collections.Counter：计数统计（工作中最常用！）

Counter是专门用来**计数**的字典子类，词频统计、数据统计时一天能用八次！

\`\`\`python
from collections import Counter

# 场景1：统计列表中元素出现次数
scores = [85, 92, 85, 78, 92, 85, 90]
score_count = Counter(scores)
print(score_count)  # Counter({85: 3, 92: 2, 78: 1, 90: 1})

# 场景2：统计文本词频（最经典用法）
text = "Python是好语言 Python是真的好 Python真强大"
words = text.split()
word_count = Counter(words)
print(word_count)  # Counter({'Python': 3, '是': 2, ...})

# 【重点方法】most_common(n)：取出现次数最多的前n个
print(word_count.most_common(2))  # [('Python', 3), ('是', 2)]

# Counter还支持加减法
c1 = Counter(a=3, b=1)
c2 = Counter(a=1, b=2)
print(c1 + c2)  # Counter({'a': 4, 'b': 3})
print(c1 - c2)  # Counter({'a': 2})（只保留正数）
\`\`\`

## 合并字典的几种方式

\`\`\`python
d1 = {"a": 1, "b": 2}
d2 = {"b": 3, "c": 4}

# 方式1：update（修改d1）
d1.update(d2)  # d1变成{'a':1, 'b':3, 'c':4}

# 方式2：{**d1, **d2}（Python 3.5+，返回新字典）
merged = {**d1, **d2}  # 后面的key覆盖前面的

# 方式3：d1 | d2（Python 3.9+，最简洁）
# merged = d1 | d2
\`\`\`

## 遍历字典的实用技巧

\`\`\`python
data = {"b": 2, "a": 1, "c": 3}

# 遍历排序后的key
for key in sorted(data):
    print(key, data[key])  # a:1  b:2  c:3

# 遍历value排序的项
for key, value in sorted(data.items(), key=lambda x: x[1]):
    print(key, value)  # a:1  b:2  c:3（按value排序）
\`\`\`

## 嵌套字典处理技巧

\`\`\`python
# 复杂嵌套结构（API响应常见）
api_response = {
    "code": 0,
    "data": {
        "list": [
            {"id": 1, "name": "商品A"},
            {"id": 2, "name": "商品B"}
        ],
        "total": 100
    }
}

# 安全访问：用一连串get()，但比较长
# 更好的方式：写一个工具函数，或者用python-box、pydantic等库
def safe_get(d, *keys, default=None):
    for key in keys:
        if isinstance(d, dict):
            d = d.get(key, default)
        else:
            return default
    return d

total = safe_get(api_response, "data", "total")  # 100
item_name = safe_get(api_response, "data", "list", 0, "name")  # "商品A"
not_exist = safe_get(api_response, "data", "xxx", default="N/A")  # "N/A"
\`\`\`

## 工作场景选择指南

| 需求 | 用什么 |
|------|-------|
| 普通键值对存储 | dict |
| 分组时自动初始化列表 | defaultdict(list) |
| 统计元素出现次数/词频 | Counter |
| 第一次访问才设置默认值 | setdefault |
| 批量更新 | update() |
| 安全访问多层嵌套 | 写safe_get或用pydantic |
`,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
字典进阶实战：销售数据统计与分析
工作场景：
1. 按地区/分类分组统计数据（defaultdict神器）
2. 商品销量/词频统计（Counter天天用）
3. 合并配置、处理API响应数据
为什么这样写：
- defaultdict和Counter是collections模块里最实用的两个
- 熟练掌握可以让你少写很多if判断，代码更简洁健壮
"""

from collections import defaultdict, Counter


def safe_get(d, *keys, default=None):
    """
    安全访问嵌套字典的工具函数
    工作中处理API返回的多层嵌套数据时非常有用，避免KeyError崩溃
    """
    current = d
    for key in keys:
        if isinstance(current, dict):
            current = current.get(key, default)
        elif isinstance(current, list) and isinstance(key, int):
            if 0 <= key < len(current):
                current = current[key]
            else:
                return default
        else:
            return default
    return current


def main():
    print("=" * 60)
    print("字典进阶实战：销售数据分组统计")
    print("=" * 60)

    # ---------- 准备模拟数据 ----------
    # 场景：电商系统中的订单商品明细
    order_items = [
        {"product": "笔记本电脑", "category": "电脑", "region": "华东", "amount": 6999, "qty": 1},
        {"product": "机械键盘", "category": "外设", "region": "华东", "amount": 399, "qty": 2},
        {"product": "无线鼠标", "category": "外设", "region": "华北", "amount": 129, "qty": 5},
        {"product": "笔记本电脑", "category": "电脑", "region": "华北", "amount": 6999, "qty": 1},
        {"product": "27寸显示器", "category": "电脑", "region": "华南", "amount": 1599, "qty": 3},
        {"product": "无线鼠标", "category": "外设", "region": "华东", "amount": 129, "qty": 3},
        {"product": "USB扩展坞", "category": "配件", "region": "华南", "amount": 299, "qty": 4},
        {"product": "机械键盘", "category": "外设", "region": "华北", "amount": 399, "qty": 1},
        {"product": "笔记本电脑", "category": "电脑", "region": "华东", "amount": 6999, "qty": 2},
        {"product": "无线耳机", "category": "外设", "region": "华南", "amount": 899, "qty": 2},
    ]
    print(f"\\n共{len(order_items)}条销售明细")

    # ---------- 1. defaultdict：分组统计神器 ----------
    print("\\n" + "-" * 60)
    print("【1】defaultdict：按地区、按品类分组统计")

    # 为什么不用普通dict？因为普通dict访问不存在的key会报KeyError，
    # 每次都要写if key not in d: d[key] = [] 太麻烦了！
    # defaultdict(list) 访问不存在的key时自动创建空列表

    # 按地区分组商品
    region_products = defaultdict(list)
    # 按品类统计销售额
    category_sales = defaultdict(float)
    # 按地区统计销量
    region_qty = defaultdict(int)

    for item in order_items:
        region_products[item["region"]].append(item["product"])
        category_sales[item["category"]] += item["amount"] * item["qty"]
        region_qty[item["region"]] += item["qty"]

    print("\\n📦 各地区销售的商品：")
    for region, products in sorted(region_products.items()):
        unique_products = list(set(products))
        print(f"  {region}：{unique_products}")

    print("\\n💰 各品类销售额：")
    for cat, sales in sorted(category_sales.items(), key=lambda x: x[1], reverse=True):
        print(f"  {cat}：¥{sales:,}")

    print("\\n📊 各地区销量：")
    for region, qty in sorted(region_qty.items(), key=lambda x: x[1], reverse=True):
        print(f"  {region}：{qty}件")

    # ---------- 2. Counter：计数统计王 ----------
    print("\\n" + "-" * 60)
    print("【2】Counter：商品销量排行榜、词频统计")

    # 统计每个商品卖了多少件
    product_counter = Counter()
    for item in order_items:
        product_counter[item["product"]] += item["qty"]

    print("\\n🏆 商品销量排行榜：")
    # most_common(n)：取前N名，这是Counter最有用的方法！
    for rank, (product, qty) in enumerate(product_counter.most_common(), start=1):
        print(f"  第{rank}名：{product} - {qty}件")

    # Counter还能直接统计列表
    all_categories = [item["category"] for item in order_items]
    cat_counter = Counter(all_categories)
    print(f"\\n品类出现频次：{cat_counter}")

    # 词频统计场景（日志分析、评论分析都用这个）
    print("\\n📝 词频统计示例：")
    comments = "好 很好 非常好 好 不错 不错 好 一般 好 很好"
    word_list = comments.split()
    word_freq = Counter(word_list)
    print(f"  评论词频：{word_freq}")
    print(f"  Top 2关键词：{word_freq.most_common(2)}")

    # ---------- 3. setdefault：单字典默认值操作 ----------
    print("\\n" + "-" * 60)
    print("【3】setdefault：首次访问设置默认值")

    # 场景：按首字母分组城市（不用defaultdict时用这个）
    cities = ["Beijing", "Shanghai", "Shenzhen", "Guangzhou", "Hangzhou", "Nanjing"]
    city_groups = {}

    for city in cities:
        first_letter = city[0].upper()
        # 如果key不存在，设为空列表，然后append
        city_groups.setdefault(first_letter, []).append(city)

    print("\\n城市按首字母分组：")
    for letter in sorted(city_groups.keys()):
        print(f"  {letter}: {city_groups[letter]}")

    # ---------- 4. 字典推导式 ----------
    print("\\n" + "-" * 60)
    print("【4】字典推导式：快速转换字典")

    # 场景1：提取商品id和价格映射（从商品列表生成dict）
    products_list = [
        {"id": 1, "name": "商品A", "price": 100},
        {"id": 2, "name": "商品B", "price": 200},
        {"id": 3, "name": "商品C", "price": 300},
    ]
    id_price_map = {p["id"]: p["price"] for p in products_list}
    print(f"\\n商品ID→价格映射：{id_price_map}")

    # 场景2：筛选价格>150的商品
    expensive_map = {p["name"]: p["price"] for p in products_list if p["price"] > 150}
    print(f"价格>150的商品：{expensive_map}")

    # 场景3：key value互换（做反查表）
    # 前提：value必须唯一且可哈希
    user_id_name = {101: "张三", 102: "李四", 103: "王五"}
    user_name_id = {v: k for k, v in user_id_name.items()}
    print(f"\\n姓名→ID反查：{user_name_id}")
    print(f"张三的ID：{user_name_id['张三']}")

    # ---------- 5. 合并字典 ----------
    print("\\n" + "-" * 60)
    print("【5】合并字典的几种方式")

    base_config = {"host": "0.0.0.0", "port": 8080, "debug": False}
    dev_config = {"debug": True, "db": "dev.db"}
    prod_config = {"debug": False, "db": "prod.db", "workers": 4}

    # 方式1：update修改原字典
    dev_merged = base_config.copy()
    dev_merged.update(dev_config)
    print(f"开发环境配置：{dev_merged}")

    # 方式2：{**d1, **d2} 返回新字典（Python3.5+常用）
    prod_merged = {**base_config, **prod_config}
    print(f"生产环境配置：{prod_merged}")

    # 方式3：d1 | d2（Python3.9+，最简洁）
    # prod_merged = base_config | prod_config

    # ---------- 6. 嵌套字典安全访问 ----------
    print("\\n" + "-" * 60)
    print("【6】嵌套字典安全访问：处理API响应")

    # 这是真实API返回的数据结构
    api_data = {
        "code": 0,
        "message": "success",
        "data": {
            "page": 1,
            "page_size": 10,
            "total": 156,
            "list": [
                {"id": 1001, "name": "商品A", "stock": 50},
                {"id": 1002, "name": "商品B", "stock": 30}
            ]
        }
    }

    # 直接链式[]访问很危险，中间某层缺失就崩溃
    # print(api_data["data"]["xxx"]["yyy"])  # ❌ KeyError!

    # 用我们写的safe_get安全访问
    total = safe_get(api_data, "data", "total")
    first_product = safe_get(api_data, "data", "list", 0, "name")
    not_exist = safe_get(api_data, "data", "not_exist", "nested", default="默认值")

    print(f"\\n总数：{total}")
    print(f"第一个商品：{first_product}")
    print(f"不存在的字段：{not_exist}（不崩溃！）")

    print("\\n" + "=" * 60)
    print("字典进阶技巧演示完成！")
    print("defaultdict和Counter是日常写代码的左膀右臂，一定要熟练！")
    print("=" * 60)


if __name__ == "__main__":
    main()
`,
  },
  {
    id: "py-sets",
    group: "第二篇 数据结构 · 处理数据的利器",
    icon: "🎯",
    title: "集合：去重与关系运算",
    content: `# 集合：去重与关系运算

集合（set）是**无序、不重复**的元素集合，主要用于：
1. **快速去重**：把列表转成集合就自动去重
2. **关系运算**：交集、并集、差集、对称差集
3. **快速成员判断**：in操作O(1)时间复杂度，比列表快得多！

## 创建集合

\`\`\`python
# 方式1：花括号{}（注意和字典区别：里面不是键值对）
tags = {"Python", "Java", "Go", "Python"}  # 重复的"Python"自动去重
print(tags)  # {'Python', 'Java', 'Go'}（顺序不保证）

# 方式2：set()构造函数（从其他可迭代对象转换）
# 【坑】空集合必须用set()，不能用{}！{}是空字典！
empty_set = set()  # ✅ 空集合
empty_dict = {}    # ❌ 这是空字典，不是空集合！

# 从列表转集合：自动去重（最常用）
numbers = [1, 2, 2, 3, 3, 3, 4]
unique_numbers = set(numbers)  # {1, 2, 3, 4}

# 集合的元素必须是可哈希的（不可变类型），和字典key一样
# s = {[1,2]}  # ❌ 列表不能作为集合元素
# s = {{1:2}}  # ❌ 字典也不行
s = {(1, 2), (3, 4)}  # ✅ 元组可以
\`\`\`

## 添加和删除元素

\`\`\`python
skills = set()

# add：添加单个元素
skills.add("Python")
skills.add("SQL")
skills.add("Python")  # 重复添加不报错，但不会加进去

# update：批量添加多个元素（可迭代对象）
skills.update(["Linux", "Git", "Docker"])

# 删除元素
# remove：元素不存在会报错
skills.remove("Git")
# skills.remove("Java")  # ❌ KeyError!

# discard：元素不存在不报错（推荐！安全）
skills.discard("Java")  # 不存在也没事，不报错

# pop：随机弹出一个元素（集合无序，所以是随机）
item = skills.pop()

# clear：清空
skills.clear()
\`\`\`

## 集合运算：交集、并集、差集、对称差集（核心！）

这是集合最有价值的功能，做用户群体分析、标签筛选时超级好用：

\`\`\`python
group_a = {"Python", "SQL", "Java", "Go"}
group_b = {"Python", "JavaScript", "Go", "Rust"}

# 交集 & 或 intersection()：两个集合都有的元素
print(group_a & group_b)  # {'Python', 'Go'}
# 场景：同时学了A语言和B语言的用户

# 并集 | 或 union()：两个集合所有元素（去重）
print(group_a | group_b)  # {'Python', 'SQL', 'Java', 'Go', 'JavaScript', 'Rust'}
# 场景：学过A或B任意一种语言的所有用户

# 差集 - 或 difference()：在A但不在B中的元素
print(group_a - group_b)  # {'SQL', 'Java'}
# 场景：学了A但没学B的用户
print(group_b - group_a)  # {'JavaScript', 'Rust'}

# 对称差集 ^ 或 symmetric_difference()：只在其中一个集合中出现的
print(group_a ^ group_b)  # {'SQL', 'Java', 'JavaScript', 'Rust'}
# 场景：只学了其中一种，没有同时学两种的用户
\`\`\`

## 集合关系判断：子集、超集

\`\`\`python
all_skills = {"Python", "SQL", "Java", "Go", "JavaScript"}
my_skills = {"Python", "SQL"}

# issubset：子集判断，my_skills是all_skills的子集吗？
print(my_skills.issubset(all_skills))  # True

# issuperset：超集判断，all_skills包含my_skills所有元素吗？
print(all_skills.issuperset(my_skills))  # True

# isdisjoint：两个集合有没有共同元素（完全不相交）
python_skills = {"Python", "Django", "Flask"}
java_skills = {"Java", "Spring", "Hibernate"}
print(python_skills.isdisjoint(java_skills))  # True（没有交集）
\`\`\`

## in判断O(1)速度——集合vs列表性能对比

这是集合最重要的性能优势：

\`\`\`python
# 场景：判断一个用户是否在黑名单中
blacklist = [f"user{i}" for i in range(100000)]
blacklist_set = set(blacklist)

# 列表的in是O(n)：要一个个找，列表越长越慢
# 集合的in是O(1)：哈希表直接定位，不管多少元素速度都一样！
# 大数据量时差距是几百上千倍！

# 工作经验：
# 如果只是判断存在性，尤其是数据量大、判断次数多的时候，
# 一定要转成集合，性能差很多！
\`\`\`

## 工作场景总结

| 场景 | 用集合方法 |
|------|-----------|
| 列表快速去重 | list(set(my_list))（注意会丢失顺序） |
| 两个用户群体的共同好友/标签 | 交集 & |
| 两个群体的所有用户/标签 | 并集 \| |
| 有A标签但没有B标签的用户 | 差集 - |
| 大数据量的成员判断 | 转set，x in s（O(1)） |
| 判断是否全部包含/被包含 | issubset/issuperset |
`,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
集合实战：用户标签系统与群体分析
工作场景：
1. 用户兴趣标签去重、标签云
2. 用户群体交集/差集分析（同时买了A和B的用户）
3. 黑名单、敏感词等需要高频判断是否存在的数据
为什么这样写：
- 集合的哈希表结构让in判断O(1)速度，大数据量下比列表快几百倍
- 集合运算（交并差）是数据分析师必备技能，写SQL时也是同样思维
"""

import time


def main():
    print("=" * 60)
    print("集合实战：用户标签分析与关系运算")
    print("=" * 60)

    # ---------- 1. 创建集合与去重 ----------
    print("\\n【1】集合创建 & 自动去重")

    # 场景：用户兴趣标签，可能有重复标签（前端重复提交、历史数据问题）
    user_tags_raw = ["Python", "Java", "Python", "SQL", "Java", "Go", "Linux", "SQL"]
    print(f"原始标签（有重复）：{user_tags_raw}")

    # 转set自动去重（最常用！一行代码搞定去重）
    user_tags = set(user_tags_raw)
    print(f"去重后标签：{user_tags}")
    print(f"去重前：{len(user_tags_raw)}个，去重后：{len(user_tags)}个")

    # 【坑点提醒】空集合不能用{}，{}是空字典！
    empty_s = set()
    empty_d = {}
    print(f"\\nset()类型：{type(empty_s)}")
    print(f"{{}}类型：{type(empty_d)}  ← 注意！这是字典！")

    # ---------- 2. 集合运算（核心功能！）---------
    print("\\n" + "-" * 60)
    print("【2】集合关系运算：用户群体分析")

    # 场景：电商用户行为标签
    users_bought_laptop = {"U001", "U002", "U003", "U004", "U005"}
    users_bought_phone = {"U003", "U004", "U006", "U007"}
    users_bought_tablet = {"U002", "U005", "U007", "U008"}

    print(f"买笔记本的用户：{users_bought_laptop}")
    print(f"买手机的用户：{users_bought_phone}")
    print(f"买平板的用户：{users_bought_tablet}")

    # 交集 &：同时买了笔记本和手机的用户（高价值用户，推荐套餐）
    both_laptop_phone = users_bought_laptop & users_bought_phone
    print(f"\\n🤝 同时买笔记本+手机：{both_laptop_phone}")

    # 并集 |：买过任意数码产品的用户（全量营销）
    all_buyers = users_bought_laptop | users_bought_phone | users_bought_tablet
    print(f"📢 买过任意数码产品：{all_buyers}（共{len(all_buyers)}人）")

    # 差集 -：买了笔记本但没买手机的（推荐手机配件/以旧换新）
    laptop_only = users_bought_laptop - users_bought_phone
    print(f"💻 买了笔记本没买手机：{laptop_only}")

    # 对称差集 ^：只买了其中一样，没同时买（精准推荐）
    # 即：买了笔记本没买手机 + 买了手机没买笔记本
    phone_or_laptop_not_both = users_bought_laptop ^ users_bought_phone
    print(f"🎯 只买了笔记本或手机其中一样：{phone_or_laptop_not_both}")

    # ---------- 3. 子集超集判断 ----------
    print("\\n" + "-" * 60)
    print("【3】子集/超集：权限判断、标签包含")

    all_permissions = {"read", "write", "delete", "share", "export", "admin"}
    admin_perms = {"read", "write", "delete", "share", "export", "admin"}
    editor_perms = {"read", "write", "share", "export"}
    viewer_perms = {"read", "share"}

    # issubset：A是不是B的子集（A的所有元素B都有）
    print(f"\\n查看者权限是编辑者子集：{viewer_perms.issubset(editor_perms)}")  # True
    print(f"编辑者权限是管理员子集：{editor_perms.issubset(admin_perms)}")  # True

    # issuperset：A是不是包含B所有元素
    print(f"管理员包含编辑者所有权限：{admin_perms.issuperset(editor_perms)}")  # True

    # isdisjoint：有没有交集（完全没关系）
    guest_perms = {"guest_view"}
    print(f"游客权限和管理员无交集：{guest_perms.isdisjoint(admin_perms)}")  # True

    # 实际应用：权限校验
    def has_permission(user_perms, required_perm):
        return required_perm in user_perms or "admin" in user_perms

    print(f"\\n编辑者是否有删除权限：{has_permission(editor_perms, 'delete')}")  # False
    print(f"管理员是否有删除权限：{has_permission(admin_perms, 'delete')}")  # True

    # ---------- 4. 集合方法：添加删除 ----------
    print("\\n" + "-" * 60)
    print("【4】集合元素增删：标签管理功能")

    my_skills = {"Python", "SQL"}
    print(f"初始技能标签：{my_skills}")

    # add添加单个标签
    my_skills.add("Git")
    print(f"add('Git')后：{my_skills}")

    # update批量添加（比如用户一次性勾选多个技能）
    my_skills.update(["Linux", "Docker", "Python"])  # Python重复了，不影响
    print(f"update批量添加后：{my_skills}")

    # discard安全删除（推荐）：标签不存在不报错
    my_skills.discard("Java")  # 没有Java也不报错
    print(f"discard('Java')（不存在不报错）：{my_skills}")

    # remove删除：不存在会报错，所以先判断或用discard
    if "SQL" in my_skills:
        my_skills.remove("SQL")
        print(f"remove('SQL')后：{my_skills}")

    # ---------- 5. 性能对比：集合vs列表的in判断（大数据量！）---------
    print("\\n" + "-" * 60)
    print("【5】性能对比：集合in判断有多快？")

    # 构造10万条数据测试
    test_size = 100000
    big_list = list(range(test_size))
    big_set = set(big_list)
    test_item = test_size - 1  # 找最后一个元素（列表最慢的情况）

    # 列表in判断：O(n)，从头找到尾
    start = time.time()
    for _ in range(1000):
        _ = test_item in big_list
    list_time = time.time() - start

    # 集合in判断：O(1)，哈希直接定位
    start = time.time()
    for _ in range(1000):
        _ = test_item in big_set
    set_time = time.time() - start

    print(f"\\n数据量：{test_size}，测试1000次in判断：")
    print(f"  列表耗时：{list_time:.4f}秒")
    print(f"  集合耗时：{set_time:.6f}秒")
    print(f"  集合比列表快：{list_time/set_time:.0f}倍！")
    print("\\n⚠️ 工作经验：如果需要频繁做in判断，尤其是大数据量，")
    print("   一定要转成set！这个性能差距在生产环境是致命的。")

    # ---------- 6. 实战案例：共同好友推荐 ----------
    print("\\n" + "-" * 60)
    print("【6】实战案例：社交网络好友推荐")

    # 模拟社交网络好友关系
    friend_map = {
        "张三": {"李四", "王五", "赵六", "钱七"},
        "李四": {"张三", "王五", "周八"},
        "王五": {"张三", "李四", "赵六", "孙九"},
        "赵六": {"张三", "王五", "钱七"},
        "钱七": {"张三", "赵六"},
        "周八": {"李四", "吴十"},
        "吴十": {"周八"},
        "孙九": {"王五"},
    }

    user = "张三"
    user_friends = friend_map[user]
    print(f"\\n{user}的好友：{user_friends}")

    # 找到"好友的好友"，排除已经是好友的和自己（推荐可能认识的人）
    friend_recommend = set()
    for friend in user_friends:
        # 把好友的好友都加进来
        friend_recommend.update(friend_map[friend])

    # 排除自己和已经是好友的
    friend_recommend.discard(user)
    friend_recommend -= user_friends

    print(f"推荐认识的人：{friend_recommend}")

    # 找出共同好友最多的推荐（二度好友权重）
    print("\\n推荐理由（共同好友数）：")
    for candidate in friend_recommend:
        common = user_friends & friend_map[candidate]
        print(f"  {candidate}：共同好友{len(common)}人 - {common}")

    print("\\n" + "=" * 60)
    print("集合操作演示完成！记住：去重、关系运算、快速in判断用集合。")
    print("=" * 60)


if __name__ == "__main__":
    main()
`,
  },
  {
    id: "py-collections",
    group: "第二篇 数据结构 · 处理数据的利器",
    icon: "🧰",
    title: "collections模块：高级数据结构",
    content: `# collections模块：高级数据结构

collections是Python标准库中的模块，提供了几个**非常实用**的高级数据结构，可以说是"开箱即用的神器"。

我们已经学过\`defaultdict\`和\`Counter\`，这一章完整学习这个模块的其他工具。

## Counter：计数器（复习+深入）

Counter是dict子类，专门用来**计数**，比自己写字典计数方便太多。

\`\`\`python
from collections import Counter

# 创建方式
c1 = Counter()                           # 空计数器
c2 = Counter("abracadabra")              # 从可迭代对象（字符串也是可迭代）
c3 = Counter({"a": 3, "b": 2})          # 从映射
c4 = Counter(cats=4, dogs=8)            # 从关键字参数

# 最常用方法：most_common(n)取前N名
# 统计词频、销量排行等等，天天用
words = "to be or not to be".split()
cnt = Counter(words)
print(cnt.most_common(2))  # [('to', 2), ('be', 2)]

# 特殊：访问不存在的key不报错，返回0
print(cnt["python"])  # 0（普通字典会KeyError！）

# 计数器加减法
c = Counter(a=3, b=1)
d = Counter(a=1, b=2)
c + d  # Counter({'a': 4, 'b': 3})  相加
c - d  # Counter({'a': 2})           相减（只保留正数）
&      # 交集取min
|      # 并集取max
\`\`\`

## defaultdict：默认值字典（复习+深入）

访问不存在的key时自动创建默认值，避免KeyError，分组统计必备：

\`\`\`python
from collections import defaultdict

# 常用的default_factory：
dd_list = defaultdict(list)    # 默认[]
dd_int = defaultdict(int)      # 默认0
dd_set = defaultdict(set)      # 默认set()

# 工作中90%的场景是这三个：
# defaultdict(list) → 分组时收集元素
# defaultdict(int) → 计数（但计数其实Counter更方便）
# defaultdict(set) → 分组去重

# 自定义默认值
def default_value():
    return "未知"
dd_custom = defaultdict(default_value)
\`\`\`

## OrderedDict：有序字典

Python 3.7+ 普通dict已经保持插入顺序了，OrderedDict主要用于旧代码兼容，以及一些特殊方法：
- \`move_to_end(key, last=True)\`：把key移动到开头/末尾
- \`popitem(last=True)\`：弹出开头/末尾的元素（类似LRU缓存操作）

\`\`\`python
from collections import OrderedDict

od = OrderedDict(a=1, b=2, c=3)
od.move_to_end("a")       # 把a移到最后
od.move_to_end("c", last=False)  # 把c移到最前面
od.popitem(last=False)    # 弹出第一个元素
\`\`\`

## deque：双端队列（高效队列/栈）

\*\*deque = double-ended queue\*\*，双端队列，**两端添加/删除都是O(1)**，而列表在头部插入/删除是O(n)（要移动所有元素）。

工作中用作：
- 队列（FIFO先进先出）：任务队列、消息队列
- 栈（LIFO后进先出）：其实列表的append/pop就够了，但deque也能做
- 滑动窗口：只保留最近N条数据

\`\`\`python
from collections import deque

# 创建deque，maxlen指定最大长度（超过自动丢弃另一端）
dq = deque(maxlen=3)
dq.append(1)
dq.append(2)
dq.append(3)
dq.append(4)  # 超过maxlen=3，最左边的1被自动丢弃
print(dq)  # deque([2, 3, 4], maxlen=3)

# 两端操作
dq.append("right")         # 右端添加
dq.appendleft("left")      # 左端添加
dq.pop()                   # 右端弹出
dq.popleft()               # 左端弹出

# extend批量添加
dq.extend([5, 6])
dq.extendleft([0, -1])     # 注意：左端extend是逆序插入

# rotate旋转：轮转元素
d = deque([1, 2, 3, 4, 5])
d.rotate(2)   # 右移2步：[4, 5, 1, 2, 3]
d.rotate(-2)  # 左移2步：回到原顺序
\`\`\`

> **为什么不用list做队列？** list的append和pop()（尾部）是O(1)，但pop(0)和insert(0, x)是O(n)——因为要移动所有元素。数据量大时差距明显，所以队列一定要用deque。

## ChainMap：多字典合并查找

ChainMap把多个字典"链"在一起，查找时依次找，**不复制数据**，适合多层配置场景：

\`\`\`python
from collections import ChainMap

# 场景：配置优先级：命令行参数 > 环境变量 > 默认配置
defaults = {"host": "0.0.0.0", "port": 8080, "debug": False}
env_config = {"port": 9090, "debug": True}
cli_args = {"debug": False}  # 命令行最高优先级

config = ChainMap(cli_args, env_config, defaults)
# 查找顺序：cli_args → env_config → defaults
print(config["host"])   # defaults里的
print(config["port"])   # env_config覆盖了defaults
print(config["debug"])  # cli_args优先级最高

# 注意：修改只影响第一个字典
# ChainMap不复制原数据，原字典改了它也能看到
\`\`\`

## 其他：namedtuple（元组章讲过）

namedtuple在元组章节已经讲过了，这里不再重复。它用来创建带字段名的元组，轻量级数据类。

## collections模块选择指南

| 需求 | 用什么 |
|------|-------|
| 统计元素出现次数、词频统计 | Counter |
| 分组（按key收集元素到列表/集合） | defaultdict(list/set) |
| 任务队列、FIFO、滑动窗口 | deque |
| 多层配置查找、多字典视图 | ChainMap |
| 需要移动元素位置、LRU类逻辑 | OrderedDict |
| 不可变的结构化数据、轻量级对象 | namedtuple |
`,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
collections模块实战：日志分析、任务队列、配置管理
工作场景：
1. Counter做日志访问统计、热词分析
2. defaultdict做日志按级别/日期分组
3. deque做任务队列、最近访问记录
4. ChainMap做多层配置合并
为什么用collections：
- 这些工具都是标准库内置，不用装第三方包
- 都是C实现，性能比自己用Python写好很多
- 代码简洁，少写很多样板代码
"""

from collections import Counter, defaultdict, deque, ChainMap, OrderedDict
from datetime import datetime, timedelta
import random


def analyze_access_logs(logs):
    """
    分析访问日志（Counter实战）
    工作场景：Nginx日志分析、API访问统计，每天都要做的事
    """
    ip_counter = Counter()
    url_counter = Counter()
    status_counter = Counter()

    for log in logs:
        ip_counter[log["ip"]] += 1
        url_counter[log["url"]] += 1
        status_counter[log["status"]] += 1

    return ip_counter, url_counter, status_counter


def main():
    print("=" * 60)
    print("collections模块实战：日志分析+任务队列+配置管理")
    print("=" * 60)

    # ---------- 1. Counter：日志访问统计 ----------
    print("\\n【1】Counter：网站访问日志分析")

    # 模拟Nginx访问日志
    access_logs = [
        {"ip": "192.168.1.1", "url": "/home", "status": 200},
        {"ip": "192.168.1.2", "url": "/home", "status": 200},
        {"ip": "192.168.1.1", "url": "/products", "status": 200},
        {"ip": "192.168.1.3", "url": "/home", "status": 200},
        {"ip": "192.168.1.1", "url": "/api/login", "status": 200},
        {"ip": "192.168.1.2", "url": "/products", "status": 200},
        {"ip": "192.168.1.4", "url": "/admin", "status": 403},
        {"ip": "192.168.1.1", "url": "/api/user", "status": 200},
        {"ip": "192.168.1.5", "url": "/notfound", "status": 404},
        {"ip": "192.168.1.2", "url": "/api/login", "status": 200},
        {"ip": "192.168.1.1", "url": "/products", "status": 200},
        {"ip": "192.168.1.3", "url": "/api/login", "status": 500},
    ]

    ip_cnt, url_cnt, status_cnt = analyze_access_logs(access_logs)

    print("\\n🌐 IP访问量Top 3：")
    for ip, count in ip_cnt.most_common(3):
        print(f"  {ip}: {count}次")

    print("\\n📄 热门页面Top 3：")
    for url, count in url_cnt.most_common(3):
        print(f"  {url}: {count}次")

    print("\\n⚠️ 状态码统计：")
    for status, count in sorted(status_cnt.items()):
        if status >= 400:
            print(f"  ❌ {status}: {count}次（错误）")
        else:
            print(f"  ✅ {status}: {count}次")

    # Counter特性：访问不存在key返回0不报错
    print(f"\\n404错误数量：{status_cnt[404]}")
    print(f"500错误数量：{status_cnt[500]}")
    print(f"401错误数量：{status_cnt[401]}（返回0不报错）")

    # ---------- 2. defaultdict：日志按日期/级别分组 ----------
    print("\\n" + "-" * 60)
    print("【2】defaultdict：日志按级别和日期分组")

    # 模拟应用日志
    app_logs = [
        {"level": "INFO", "date": "2024-01-15", "msg": "用户登录"},
        {"level": "ERROR", "date": "2024-01-15", "msg": "数据库连接失败"},
        {"level": "WARNING", "date": "2024-01-15", "msg": "内存使用率过高"},
        {"level": "INFO", "date": "2024-01-16", "msg": "订单创建成功"},
        {"level": "ERROR", "date": "2024-01-16", "msg": "支付接口超时"},
        {"level": "ERROR", "date": "2024-01-16", "msg": "文件上传失败"},
        {"level": "INFO", "date": "2024-01-16", "msg": "缓存刷新完成"},
        {"level": "DEBUG", "date": "2024-01-16", "msg": "SQL执行耗时120ms"},
    ]

    # 按日志级别分组（defaultdict(list)自动创建空列表）
    logs_by_level = defaultdict(list)
    for log in app_logs:
        logs_by_level[log["level"]].append(log["msg"])

    print("\\n📋 按日志级别分组：")
    for level in ["ERROR", "WARNING", "INFO", "DEBUG"]:
        msgs = logs_by_level.get(level, [])
        print(f"\\n  {level} ({len(msgs)}条):")
        for msg in msgs:
            print(f"    - {msg}")

    # defaultdict(set)分组去重：每个IP访问过哪些URL
    ip_urls = defaultdict(set)
    for log in access_logs:
        ip_urls[log["ip"]].add(log["url"])

    print("\\n🔍 各IP访问过的URL：")
    for ip, urls in sorted(ip_urls.items()):
        print(f"  {ip}: {sorted(urls)}")

    # ---------- 3. deque：任务队列 & 滑动窗口 ----------
    print("\\n" + "-" * 60)
    print("【3】deque：双端队列（任务处理、最近记录）")

    # 场景1：任务队列（FIFO先进先出）
    # 为什么不用list？list.pop(0)是O(n)，deque.popleft()是O(1)
    task_queue = deque()
    task_queue.append("发送邮件给张三")
    task_queue.append("生成日报表")
    task_queue.append("同步数据到仓库")
    task_queue.append("清理临时文件")

    print("\\n📋 任务队列：")
    while task_queue:
        task = task_queue.popleft()
        print(f"  处理任务：{task}")

    # 场景2：滑动窗口 - 只保留最近N条操作记录（maxlen=N自动丢弃旧的）
    recent_ops = deque(maxlen=5)
    ops = ["登录", "浏览首页", "搜索商品", "查看详情", "加入购物车", "提交订单", "支付"]
    print("\\n🕐 最近5条操作（滑动窗口）：")
    for op in ops:
        recent_ops.append(op)
        print(f"  添加 '{op}' 后：{list(recent_ops)}")
    print(f"最终最近操作：{list(recent_ops)}")  # 只保留最后5个

    # 场景3：轮转调度（rotate）
    staff = deque(["张三", "李四", "王五", "赵六"])
    print("\\n🔄 值班轮转：")
    for week in range(1, 5):
        on_duty = staff[0]
        print(f"  第{week}周值班：{on_duty}")
        staff.rotate(-1)  # 左移一位，下个人值班

    # ---------- 4. OrderedDict：有序操作（了解即可）---------
    print("\\n" + "-" * 60)
    print("【4】OrderedDict：特定场景的有序操作")

    # 场景：最近使用排序（move_to_end实现简单LRU）
    recent_files = OrderedDict()
    recent_files["report.docx"] = "2024-01-10"
    recent_files["data.xlsx"] = "2024-01-12"
    recent_files["notes.txt"] = "2024-01-15"

    print(f"\\n初始文件列表：{list(recent_files.keys())}")

    # 打开了data.xlsx，把它移到最后（最近使用）
    recent_files.move_to_end("data.xlsx")
    print(f"打开data.xlsx后：{list(recent_files.keys())}")

    # 弹出最久没使用的（第一个）
    oldest = recent_files.popitem(last=False)
    print(f"最久未使用：{oldest[0]}，弹出后：{list(recent_files.keys())}")

    # ---------- 5. ChainMap：多层配置 ----------
    print("\\n" + "-" * 60)
    print("【5】ChainMap：多层配置优先级管理")

    # 场景：应用配置优先级
    # 默认配置 < 环境变量配置 < 命令行参数
    default_config = {
        "host": "0.0.0.0",
        "port": 8080,
        "debug": False,
        "log_level": "INFO",
        "workers": 2
    }

    env_config = {
        "port": 9090,
        "log_level": "DEBUG",
        "db_url": "mysql://localhost:3306/dev"
    }

    cli_config = {
        "debug": True,
        "workers": 4
    }

    # ChainMap按参数顺序查找，前面的优先级高
    # 好处：不复制原数据，原配置改了这里也生效
    config = ChainMap(cli_config, env_config, default_config)

    print("\\n⚙️ 最终配置：")
    for key in sorted(set(list(default_config.keys()) + list(env_config.keys()) + list(cli_config.keys()))):
        source = "默认"
        if key in cli_config:
            source = "命令行"
        elif key in env_config:
            source = "环境变量"
        print(f"  {key}: {config[key]} (来源：{source})")

    print("\\n" + "=" * 60)
    print("collections模块演示完成！")
    print("Counter/defaultdict/deque是工作中最常用的三个，务必熟练。")
    print("=" * 60)


if __name__ == "__main__":
    main()
`,
  },
  {
    id: "py-data-conversion",
    group: "第二篇 数据结构 · 处理数据的利器",
    icon: "🔄",
    title: "数据类型转换与嵌套结构",
    content: `# 数据类型转换与嵌套结构

实际工作中数据不是单一类型，经常需要在列表、元组、集合、字典之间转换，还要处理JSON序列化、嵌套结构访问等问题。

## 基础类型互转

Python的数据结构之间用构造函数可以互相转换：

\`\`\`python
# list()：转列表
list("abc")         # ['a', 'b', 'c']（字符串拆成字符）
list((1, 2, 3))     # [1, 2, 3]（元组转列表）
list({1, 2, 3})     # [1, 2, 3]（集合转列表，顺序不保证）
list({"a":1, "b":2})  # ['a', 'b']（字典转列表只取key！）

# tuple()：转元组（和list类似）
tuple([1, 2, 3])    # (1, 2, 3)

# set()：转集合（自动去重）
set([1, 2, 2, 3])   # {1, 2, 3}

# dict()：转字典（有特殊要求，见下）
dict([("a", 1), ("b", 2)])  # {'a': 1, 'b': 2}（键值对列表）
dict(a=1, b=2)              # {'a': 1, 'b': 2}
\`\`\`

> **坑点提醒**：字典转list/set/tuple**默认只取key**！如果要取value或键值对，要用\`.values()\`或\`.items()\`。

## 列表↔字典转换（常见场景）

\`\`\`python
# 两个列表转字典（zip配对）
keys = ["name", "age", "city"]
values = ["张三", 28, "北京"]
user = dict(zip(keys, values))
# {'name': '张三', 'age': 28, 'city': '北京'}

# 字典转列表
user = {"name": "张三", "age": 28}
list(user)           # ['name', 'age']（只取key）
list(user.values())  # ['张三', 28]（只取value）
list(user.items())   # [('name','张三'), ('age',28)]（键值对元组）
\`\`\`

## JSON序列化/反序列化（工作必备！）

JSON是API数据交换的标准格式，Python处理JSON用内置的\`json\`模块：
- \`json.dumps()\`：Python对象 → JSON字符串（序列化）
- \`json.loads()\`：JSON字符串 → Python对象（反序列化）

\`\`\`python
import json

user = {
    "name": "张三",
    "age": 28,
    "is_vip": True,
    "tags": ["Python", "SQL"],
    "balance": None  # None自动转JSON的null
}

# dumps：Python字典 → JSON字符串
json_str = json.dumps(user, ensure_ascii=False, indent=2)
# ensure_ascii=False：中文不转义（重要！否则中文变成\\uXXXX）
# indent=2：格式化输出，方便阅读
print(json_str)

# loads：JSON字符串 → Python字典
# 场景：处理API返回的JSON响应
api_response = '{"code":0,"data":{"id":1,"name":"商品A"}}'
result = json.loads(api_response)
print(result["code"])  # 0
\`\`\`

**Python类型 ↔ JSON类型对应表：**

| Python | JSON |
|--------|------|
| dict | object |
| list/tuple | array |
| str | string |
| int/float | number |
| True/False | true/false |
| None | null |

> **注意**：JSON不支持集合！set要先转list才能序列化；JSON也没有元组，元组转成JSON数组后反序列化回来是list。

## 嵌套数据结构访问

工作中从API/数据库拿到的数据都是**多层嵌套**的：字典里面套列表，列表里面套字典……

\`\`\`python
# 典型的API响应结构
data = {
    "code": 0,
    "data": {
        "users": [
            {"id": 1, "name": "张三", "orders": [{"id": 101, "amount": 99}]},
            {"id": 2, "name": "李四"}
        ],
        "total": 100
    }
}

# 逐层访问，每一层都要注意类型：
# data是dict → ["data"]是dict → ["users"]是list → [0]是dict → ["name"]是str
print(data["data"]["users"][0]["name"])  # "张三"

# 坑点：路径上任意一层不存在/类型不对，就会报错
# print(data["data"]["xxx"][0])  # KeyError或TypeError
\`\`\`

安全访问嵌套结构的方法：
1. 每层用\`.get()\`：啰嗦但可控
2. 写工具函数\`safe_get\`
3. 用第三方库如\`python-box\`、\`pydantic\`（大项目推荐）

## 浅拷贝 vs 深拷贝

拷贝嵌套结构时这是重灾区：

\`\`\`python
import copy

original = {
    "name": "张三",
    "scores": [85, 92, 78]  # 嵌套的列表
}

# 浅拷贝：只拷贝第一层，内层嵌套还是共享引用！
shallow = original.copy()  # 或者 dict(original), {**original}
shallow["name"] = "李四"    # 不影响original
shallow["scores"].append(100)  # ❌ 这会影响original！因为scores列表是共享的

# 深拷贝：完全独立，递归拷贝所有层
deep = copy.deepcopy(original)
deep["scores"].append(99)  # ✅ 不影响original
\`\`\`

> **坑点总结**：
> - 没有嵌套的简单结构：浅拷贝就够了（\`copy()\`, \`dict()\`, \`[:]\`等）
> - **有嵌套结构（字典里有列表/字典）：必须用\`copy.deepcopy()\`才能完全独立**
> - 分不清的时候直接用deepcopy，性能开销在绝大多数场景可以忽略

## 常见数据转换坑点总结

1. **字典转列表只取key**：要用values()或items()
2. **JSON序列化中文乱码**：dumps时加\`ensure_ascii=False\`
3. **集合不能直接JSON序列化**：先转list
4. **浅拷贝嵌套结构共享内层**：有嵌套用deepcopy
5. **列表/集合遍历的时候不要增删元素**：会导致索引错乱或跳过元素
6. **zip长度不一致以短的为准**：需要处理不等长用itertools.zip_longest
`,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据类型转换实战：API响应处理、数据ETL、JSON序列化
工作场景：
1. 处理前端/第三方API返回的JSON数据（最常见！）
2. 数据库查询结果转换为API需要的格式
3. 数据导出导入时的格式转换
4. 深拷贝避免原始数据被意外修改
为什么这些重要：
- 90%的bug都出在数据类型转换和嵌套访问上
- JSON是前后端交互的通用语言，必须熟练
- 深浅拷贝问题隐蔽，出bug特别难排查
"""

import json
import copy


def safe_get(d, *keys, default=None):
    """
    安全访问嵌套数据结构的工具函数
    支持字典key访问和列表索引访问，路径不存在返回default
    工作中处理API响应必备，避免KeyError/TypeError崩溃
    """
    current = d
    for key in keys:
        if isinstance(current, dict):
            current = current.get(key, default)
        elif isinstance(current, (list, tuple)) and isinstance(key, int):
            if 0 <= key < len(current):
                current = current[key]
            else:
                return default
        else:
            return default
        if current is None:
            return default
    return current


def main():
    print("=" * 60)
    print("数据类型转换实战：API数据处理全流程")
    print("=" * 60)

    # ---------- 1. 基础类型互转 ----------
    print("\\n【1】列表/元组/集合互转")

    # 场景：用户ID列表去重后排序
    user_ids_raw = [105, 102, 105, 101, 103, 102, 104]
    print(f"原始ID列表：{user_ids_raw}")

    # list → set 去重
    unique_ids_set = set(user_ids_raw)
    print(f"转集合去重：{unique_ids_set}（顺序不保证）")

    # set → list 然后排序
    unique_ids_sorted = sorted(list(unique_ids_set))
    print(f"转回列表并排序：{unique_ids_sorted}")

    # 元组：固定配置项，不该被修改
    allowed_methods = ("GET", "POST", "PUT", "DELETE")
    print(f"\\n允许的HTTP方法（元组）：{allowed_methods}")
    # 元组转列表（需要修改时）
    methods_list = list(allowed_methods)
    methods_list.append("PATCH")
    print(f"转列表添加PATCH后：{methods_list}")

    # 【坑点演示】字典转list默认只取key！
    product = {"id": 1, "name": "笔记本", "price": 6999}
    print(f"\\n字典直接转list：{list(product)}")  # ['id','name','price'] 只有key!
    print(f"字典取values：{list(product.values())}")  # 才是值
    print(f"字典取items：{list(product.items())}")  # 键值对元组列表

    # ---------- 2. 列表 ↔ 字典转换 ----------
    print("\\n" + "-" * 60)
    print("【2】列表和字典互转（zip配对）")

    # 场景：数据库查询返回两列，转成key-value映射
    # 比如：查询商品名称和价格
    product_names = ["笔记本", "鼠标", "键盘", "显示器"]
    product_prices = [6999, 129, 399, 1599]

    # zip把两个列表配对，dict转成字典
    price_map = dict(zip(product_names, product_prices))
    print(f"\\n商品→价格映射：{price_map}")
    print(f"鼠标价格：{price_map['鼠标']}")

    # 【坑点】zip长度不同时，以短的为准！
    names_short = ["A", "B"]
    values_long = [1, 2, 3, 4]
    zipped = dict(zip(names_short, values_long))
    print(f"\\n长度不同zip结果：{zipped}")  # 只有两个，3和4丢了！

    # 场景：数据库的一行记录转字典
    db_columns = ["user_id", "username", "email", "age"]
    db_row = (1001, "zhangsan", "zhangsan@example.com", 28)
    user_dict = dict(zip(db_columns, db_row))
    print(f"\\n数据库记录转字典：{user_dict}")

    # ---------- 3. JSON序列化/反序列化（核心！）---------
    print("\\n" + "-" * 60)
    print("【3】JSON处理：和API打交道必备技能")

    # 场景：构造API请求/响应，或者日志中记录结构化数据
    api_response_data = {
        "code": 0,
        "message": "success",
        "data": {
            "order_id": "ORD2024010001",
            "user": {
                "user_id": 1001,
                "name": "张三",
                "phone": "138xxxx"
            },
            "items": [
                {"name": "笔记本电脑", "price": 6999, "qty": 1},
                {"name": "无线鼠标", "price": 129, "qty": 2}
            ],
            "total_amount": 7257,
            "is_paid": True,
            "discount": None
        },
        "timestamp": 1705000000
    }

    # dumps：Python字典 → JSON字符串（发送给前端/写入日志）
    # ensure_ascii=False：中文正常显示，不转成\\uXXXX（生产环境必加！）
    # indent=2：格式化输出，方便阅读调试
    json_output = json.dumps(api_response_data, ensure_ascii=False, indent=2)
    print("\\nAPI响应JSON：")
    print(json_output[:500] + "...")  # 只显示前500字符

    # 反过来：loads把JSON字符串（比如前端传来的请求体）转成Python字典
    # 场景：后端接收前端POST请求的body
    request_json = '''
    {
        "user_id": 1001,
        "action": "purchase",
        "items": [
            {"product_id": 1, "qty": 2},
            {"product_id": 3, "qty": 1}
        ],
        "coupon_code": "NEWYEAR2024"
    }
    '''
    request_data = json.loads(request_json)
    print(f"\\n解析请求JSON：")
    print(f"  用户ID：{request_data['user_id']}")
    print(f"  动作：{request_data['action']}")
    print(f"  商品数量：{len(request_data['items'])}项")
    print(f"  优惠券：{request_data.get('coupon_code')}")

    # 【坑点1】集合不能JSON序列化！
    tags_set = {"Python", "SQL", "Java"}
    try:
        json.dumps(tags_set)
    except TypeError as e:
        print(f"\\n❌ 集合序列化错误：{e}")
        print("   解决：转成list再序列化")
        tags_json = json.dumps(list(tags_set), ensure_ascii=False)
        print(f"   转list后：{tags_json}")

    # 【坑点2】中文乱码问题（忘记加ensure_ascii=False）
    bad_json = json.dumps({"name": "张三"})
    good_json = json.dumps({"name": "张三"}, ensure_ascii=False)
    print(f"\\nensure_ascii=True（默认）：{bad_json}")
    print(f"ensure_ascii=False：{good_json} ← 正常显示中文")

    # ---------- 4. 嵌套结构安全访问 ----------
    print("\\n" + "-" * 60)
    print("【4】嵌套结构访问：避免KeyError崩溃")

    # 用前面的API响应数据演示
    # 正确路径可以访问
    order_id = safe_get(api_response_data, "data", "order_id")
    first_item_name = safe_get(api_response_data, "data", "items", 0, "name")
    print(f"\\n订单号：{order_id}")
    print(f"第一个商品：{first_item_name}")

    # 访问不存在的路径：返回默认值，不崩溃！
    not_exist = safe_get(api_response_data, "data", "user", "address", "city", default="未知")
    print(f"不存在的字段：{not_exist}（不会崩溃）")

    # 列表越界也安全
    item_99 = safe_get(api_response_data, "data", "items", 99, "name", default="无")
    print(f"第99个商品：{item_99}（不会崩溃）")

    # ---------- 5. 浅拷贝 vs 深拷贝（大坑！）---------
    print("\\n" + "-" * 60)
    print("【5】深浅拷贝：嵌套结构修改的坑")

    # 场景：修改订单数据，保留原始数据备份
    original_order = {
        "order_id": "ORD001",
        "customer": "张三",
        "items": [
            {"name": "商品A", "price": 100},
            {"name": "商品B", "price": 200}
        ]
    }

    # ❌ 浅拷贝：只拷第一层，内层items列表还是共享的！
    shallow_copy = original_order.copy()
    shallow_copy["customer"] = "李四"  # 修改外层字符串：不影响original
    shallow_copy["items"].append({"name": "商品C", "price": 300})  # 修改内层列表：original也变了！

    print(f"\\n浅拷贝后添加商品C：")
    print(f"  原订单customer：{original_order['customer']}（不变）")
    print(f"  原订单items数量：{len(original_order['items'])}（❌ 也变成3个了！被污染了！）")

    # 重新初始化
    original_order = {
        "order_id": "ORD001",
        "customer": "张三",
        "items": [
            {"name": "商品A", "price": 100},
            {"name": "商品B", "price": 200}
        ]
    }

    # ✅ 深拷贝：完全独立，递归拷贝所有层级
    deep_copy = copy.deepcopy(original_order)
    deep_copy["customer"] = "李四"
    deep_copy["items"].append({"name": "商品C", "price": 300})

    print(f"\\n深拷贝后添加商品C：")
    print(f"  原订单customer：{original_order['customer']}（不变）")
    print(f"  原订单items数量：{len(original_order['items'])}（✅ 还是2个，安全！）")
    print(f"  拷贝订单items数量：{len(deep_copy['items'])}（新订单是3个）")

    print("\\n⚠️ 重要经验：")
    print("  只要数据有嵌套（字典里有列表/字典），")
    print("  想要独立拷贝就用copy.deepcopy()，不要抱侥幸心理！")
    print("  这个bug特别隐蔽，出问题很难排查。")

    # ---------- 6. 常见坑点总结 ----------
    print("\\n" + "-" * 60)
    print("【6】数据转换常见坑点总结")
    print("""
  ❌ 坑1：字典转list默认只取key
     解决：要用values()取value，items()取键值对

  ❌ 坑2：JSON序列化中文变\\uXXXX
     解决：dumps时加 ensure_ascii=False

  ❌ 坑3：集合不能直接JSON序列化
     解决：先转list再序列化

  ❌ 坑4：浅拷贝修改嵌套数据污染原对象
     解决：有嵌套结构用copy.deepcopy()

  ❌ 坑5：遍历列表/集合时增删元素
     解决：遍历副本，或收集要删除的项最后统一删

  ❌ 坑6：zip长度不等长的部分丢失
     解决：需要处理不等长用itertools.zip_longest
""")

    print("\\n" + "=" * 60)
    print("数据类型转换演示完成！")
    print("JSON处理、嵌套访问、深浅拷贝是工作中的高频操作，务必熟练！")
    print("=" * 60)


if __name__ == "__main__":
    main()
`,
  },
];
