// =============================================================
// Python 文件操作教程 - 第 4 批章节(结构化数据读写)
// 转义规则:content 内部反引号写作 \`,\${ 写作 \$\{。
// =============================================================

export const chapters = [
  {
    id: "pyfile-csv",
    icon: "📋",
    title: "CSV 文件读写:csv 模块",
    group: "结构化数据读写",
    content: `# CSV 文件读写:csv 模块

## 一、引言

CSV(Comma-Separated Values,逗号分隔值)是最常见的**表格数据交换格式**。它本质上就是一个纯文本文件,每一行是一条记录,字段之间用逗号分隔。几乎所有支持表格的软件(Excel、WPS、数据库导出工具、Pandas)都能读写 CSV。

典型场景:
- **数据导出**:把数据库查询结果导出成 CSV,交给业务方用 Excel 查看
- **数据导入**:批量上传商品、用户、订单数据,后端解析 CSV 入库
- **日志分析**:服务器日志常常以 CSV 形式存储,便于后续统计
- **跨系统交换**:Python、Java、Go、Excel 之间传递表格数据

Python 标准库的 \`csv\` 模块专门处理 CSV 读写,它能正确处理引号、转义、换行等边界情况。**千万不要用 \`line.split(',')\` 自己解析**,后面会讲为什么。

## 二、CSV 格式长什么样

最简单的 CSV 就是这样:

\`\`\`
姓名,年龄,城市
张三,28,北京
李四,35,上海
王五,22,广州
\`\`\`

第一行通常是**表头(header)**,描述每一列的含义;后面每一行是一条数据记录。但 CSV 标准其实比较松散,真实世界里会遇到这些复杂情况:

| 情况 | 示例 | 说明 |
|------|------|------|
| 字段含逗号 | "张,三",28 | 整个字段用双引号包起来 |
| 字段含引号 | "他说\\"你好\\"",28 | 引号用两个双引号转义 |
| 字段含换行 | "第一行\\n第二行",28 | 整个字段用引号包裹 |
| 字段为空 | ,28, | 两个逗号之间什么都没有 |
| 首尾空格 | " 张三 ",28 | 引号内的空格保留 |

正因为这些边界情况,**自己写 split 解析 CSV 几乎一定会出 bug**,所以标准库的 csv 模块才是正道。

## 三、为什么不要用 split(',') 解析 CSV

新手最容易犯的错误:

\`\`\`python
# ❌ 错误示范:用 split 解析 CSV
with open("data.csv", encoding="utf-8") as f:
    for line in f:
        fields = line.strip().split(",")
        print(fields)
\`\`\`

这段代码在简单数据上看起来没问题,但遇到下面这行就崩了:

\`\`\`
"张,三",28,"北京,朝阳区"
\`\`\`

\`split(",")\` 会把它切成 4 段(\`['"张', '三"', '28', '"北京', '朝阳区"']\`),而正确的切法应该是 3 段(\`['张,三', '28', '北京,朝阳区']\`)。 引号包裹的字段里即使有逗号也不应该被切分,这只有 csv 模块能正确处理。

除此之外,split 还有这些问题:
- 不会自动剥离引号(字段值会带着引号)
- 不会处理引号转义(两个引号表示一个引号)
- 不能跨行读取(字段里有换行时一行读不全)
- Windows 换行符 \`\\r\\n\` 会残留在字段末尾

**结论**:只要数据可能含逗号、引号、换行,就用 \`csv\` 模块,不要自己造轮子。

## 四、csv.reader:读取 CSV

\`csv.reader\` 是最基础的读取接口,它接收一个**已打开的文件对象**,返回一个迭代器,每次迭代产出一行(一个列表)。

\`\`\`python
import csv

# 打开文件:newline='' 是关键!csv 模块自己处理换行符
# 如果不加 newline='',Windows 下可能出现空行
with open("users.csv", encoding="utf-8", newline="") as f:
    reader = csv.reader(f)
    for row in reader:
        # row 是一个 list,每个元素是一个字段(字符串)
        print(row)        # ['张三', '28', '北京']
        print(row[0])     # 张三
        print(len(row))   # 3
\`\`\`

**关键点**:
- \`newline=''\` 必填。csv 模块内部会处理 \`\\r\\n\` / \`\\n\` / \`\\r\` 三种换行,如果让 open 再做一次"通用换行"转换,就会造成空行或字符错乱。
- \`reader\` 是**迭代器**,只能遍历一次。要多次遍历得重新打开文件,或者把结果转成 \`list\`。
- 每个 row 都是 \`list[str]\`,即使原字段是数字,读出来也是字符串,需要自己转换类型。

## demo 1:csv.reader 基础读取

\`\`\`python
import csv

# 假设 users.csv 内容:
# 姓名,年龄,城市
# 张三,28,北京
# 李四,35,上海
# 王五,22,广州

with open("users.csv", encoding="utf-8", newline="") as f:
    reader = csv.reader(f)

    # 第一种用法:手动拿表头
    header = next(reader)  # next 取出迭代器的下一项,即第一行
    print(f"表头: {header}")  # ['姓名', '年龄', '城市']

    # 遍历剩余的数据行
    for row in reader:
        name, age, city = row  # 解构赋值,按顺序取
        # age 是字符串,需要 int() 转换
        print(f"{name} 今年 {int(age)} 岁,住在 {city}")
\`\`\`

**详解**:\`next(reader)\` 把第一行(表头)单独取出来,这样后续循环就只遍历数据行,不会把表头当成数据处理。 \`row\` 是列表,可以用 \`name, age, city = row\` 这种解构一次取出三个字段,前提是每行恰好三列。 如果某行列数不对,解构会抛 \`ValueError\`,所以更稳妥的写法是 \`row[0], row[1], row[2]\` 配合长度检查。

## demo 2:csv.writer 写入 CSV

\`\`\`python
import csv

# 准备要写入的数据:二维列表,每个子列表是一行
users = [
    ["姓名", "年龄", "城市"],   # 表头
    ["张三", 28, "北京"],
    ["李四", 35, "上海"],
    ["王五", 22, "广州"],
]

with open("output.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)

    # 方法一:writerow 写一行
    writer.writerow(users[0])  # 先写表头

    # 方法二:writerows 批量写多行
    writer.writerows(users[1:])  # 再写所有数据行
\`\`\`

**详解**:\`csv.writer(f)\` 返回一个 writer 对象,它把每一行(列表)序列化成 CSV 文本写入文件。 \`writerow\` 一次写一行,\`writerows\` 接收一个可迭代对象,一次写多行。 注意:数字 28 会被自动转成字符串 "28",不需要手动 str()。 写入时同样要 \`newline=''\`,否则 Windows 下每行之间会多一个空行。

## demo 3:csv.DictReader 用字典读取

当列数较多时,用下标 \`row[5]\` 读字段既不直观又容易出错(改了列顺序就崩)。 \`DictReader\` 把每行读成**字典**,用表头作为 key,代码可读性大幅提升。

\`\`\`python
import csv

with open("users.csv", encoding="utf-8", newline="") as f:
    reader = csv.DictReader(f)  # 自动把第一行当作表头

    for row in reader:
        # row 是 dict,key 来自表头
        print(row)
        # {'姓名': '张三', '年龄': '28', '城市': '北京'}

        # 用字段名访问,比 row[0] 直观得多
        print(row["姓名"], row["年龄"], row["城市"])

    # 查看表头(reader.fieldnames)
    print(reader.fieldnames)  # ['姓名', '年龄', '城市']
\`\`\`

**详解**:\`DictReader\` 把第一行作为字段名,后续每行转成以字段名为 key 的 dict。 \`reader.fieldnames\` 属性保存表头列表,遍历完之后还能查看。 好处是:**即使列顺序变了,代码不用改**,因为用字段名取值而不是下标。 缺点是每行多构造一个 dict,内存和速度略低于 reader,但日常开发完全够用。

## demo 4:csv.DictWriter 写入 CSV

\`\`\`python
import csv

# 字段名顺序决定了写入时列的顺序
fieldnames = ["姓名", "年龄", "城市"]

# 数据用 list[dict] 表示,每个 dict 是一行
users = [
    {"姓名": "张三", "年龄": 28, "城市": "北京"},
    {"姓名": "李四", "年龄": 35, "城市": "上海"},
    {"姓名": "王五", "年龄": 22, "城市": "广州"},
]

with open("dict_output.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)

    # 必须显式写表头(writer 不会自动写)
    writer.writeheader()

    # 用 writerows 批量写入
    writer.writerows(users)

    # 也可以用 writerow 写单行
    writer.writerow({"姓名": "赵六", "年龄": 40, "城市": "深圳"})
\`\`\`

**详解**:\`DictWriter\` 必须传 \`fieldnames\`,它决定了列的顺序——dict 本身是无序的,必须靠 fieldnames 指定顺序。 \`writeheader()\` 显式写表头,因为 DictWriter 不知道你要不要表头(有时候数据要追加到已有文件,就不该重复写表头)。 如果某行 dict 里有 fieldnames 之外的 key,会抛 \`ValueError\`;少了某个 key 则写成空值。 可以用 \`extrasaction='ignore'\` 忽略多余字段。

## demo 5:处理含逗号的字段

\`\`\`python
import csv

# 含特殊字符的数据:字段里有逗号、引号、换行
data = [
    ["name", "note"],
    ["张三", "喜欢,编程"],         # 字段含逗号
    ["李四", '他说"你好"'],         # 字段含引号
    ["王五", "第一行\\n第二行"],     # 字段含换行
]

with open("special.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerows(data)

# 读回来验证 csv 模块正确处理了特殊字符
with open("special.csv", encoding="utf-8", newline="") as f:
    for row in csv.reader(f):
        print(row)
# ['name', 'note']
# ['张三', '喜欢,编程']
# ['李四', '他说"你好"']
# ['王五', '第一行\\n第二行']
\`\`\`

**详解**:csv 模块会自动给含逗号、引号、换行的字段加上双引号,引号本身用两个双引号转义(\`""\` 表示一个 \`"\`)。 写入时你完全不用操心怎么转义,读取时也自动还原——这就是用标准库的最大价值。 如果用 split(','),第一行就会被切成三段,完全错乱。

## demo 6:自定义 dialect

当你的 CSV 来源不同(Excel 导出、Unix 工具生成),分隔符、引号规则可能不一样。 \`dialect\` 把一组格式参数封装起来,复用更方便。

\`\`\`python
import csv

# 内置三种 dialect:
# - excel:      默认,逗号分隔,\\r\\n 换行(Excel 导出格式)
# - excel-tab:  Tab 分隔(TSV),其它同 excel
# - unix:       \\n 换行,字段值始终加引号

# 自定义方言:用 | 分隔,不要自动加引号
csv.register_dialect(
    "pipe",
    delimiter="|",          # 分隔符
    quoting=csv.QUOTE_MINIMAL,  # 只在必要时加引号
    quotechar='"',           # 引号字符
    lineterminator="\\n",     # 换行符
)

data = [["name", "age"], ["Alice", 30], ["Bob", 25]]

# 用自定义方言写入
with open("data.txt", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f, dialect="pipe")
    writer.writerows(data)

# 用自定义方言读取
with open("data.txt", encoding="utf-8", newline="") as f:
    for row in csv.reader(f, dialect="pipe"):
        print(row)
# ['name', 'age']
# ['Alice', '30']
# ['Bob', '25']
\`\`\`

**详解**:\`register_dialect\` 注册一个具名方言,后续读写时传 \`dialect="pipe"\` 即可应用全部参数。 关键参数:\`delimiter\`(分隔符,默认逗号)、\`quotechar\`(引号字符,默认 \`"\`)、\`quoting\`(何时加引号,QUOTE_MINIMAL 表示只在必要时)、\`lineterminator\`(换行符)。 常见场景:TSV(Tab 分隔)直接用内置 \`excel-tab\`;管道分隔用自定义 dialect。 dialect 的好处是把格式参数集中管理,避免每次读写都重复传一长串参数。

## demo 7:处理中文 CSV(BOM 问题)

用 Excel 打开 UTF-8 的 CSV 时,如果文件**没有 BOM**,中文可能显示成乱码。 解决办法是写入时用 \`utf-8-sig\` 编码(带 BOM 的 UTF-8)。

\`\`\`python
import csv

# 写入中文 CSV:用 utf-8-sig 让 Excel 正确识别中文
rows = [
    ["姓名", "部门", "工资"],
    ["张三", "研发部", 25000],
    ["李四", "市场部", 18000],
    ["王五", "财务部", 22000],
]

# 注意编码是 utf-8-sig(不是 utf-8)
with open("salary.csv", "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f)
    writer.writerows(rows)

# 读取:utf-8-sig 能自动剥离 BOM,utf-8 也能读但第一个字段名前会有 \\ufeff
# 用 utf-8-sig 读取最安全,有无 BOM 都能正确处理
with open("salary.csv", encoding="utf-8-sig", newline="") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row["姓名"], row["部门"], int(row["工资"]) * 12, "元/年")
# 张三 研发部 300000 元/年
# 李四 市场部 216000 元/年
# 王五 财务部 264000 元/年
\`\`\`

**详解**:\`utf-8-sig\` 是"UTF-8 with BOM",文件开头会写入三个字节 \`\\xef\\xbb\\xbf\`。 Excel 看到这个标记就知道是 UTF-8,中文不会乱码。 读取时 \`utf-8-sig\` 会自动吃掉 BOM,而 \`utf-8\` 会把 BOM 当成普通字符,导致第一个字段名变成 \`\\ufeff姓名\`,后续按 \`row["姓名"]\` 取值就取不到。 **经验法则:涉及中文 CSV 且要给 Excel 用,统一用 utf-8-sig**。

## 五、reader vs DictReader 选择建议

| 维度 | csv.reader | csv.DictReader |
|------|-----------|-----------------|
| 返回类型 | list[str] | dict[str, str] |
| 字段访问 | row[0], row[1] | row["name"] |
| 列顺序变化 | 容易出错(下标写死) | 不受影响(用字段名) |
| 可读性 | 一般 | 好 |
| 性能 | 略快(少构造 dict) | 略慢 |
| 适用场景 | 列少、性能敏感、格式固定 | 列多、需要可读性、字段会变 |

**实用建议**:
- 日常开发优先用 **DictReader**,代码清晰、抗列顺序变化
- 只有当 CSV 列非常多、处理上百万行追求性能时,才考虑 reader
- 写入时同理,DictWriter 更直观,但要注意 fieldnames 必填

## 六、小结

- CSV 是最通用的表格数据交换格式,Excel/数据库/Pandas 都支持
- **永远不要用 split(',') 解析 CSV**,引号、转义、换行都会出错
- \`csv.reader\` / \`csv.writer\`:基础读写,返回列表
- \`csv.DictReader\` / \`csv.DictWriter\`:字典读写,可读性好
- \`dialect\` 封装格式参数,处理 TSV、管道分隔等非标准格式
- 中文 CSV 用 \`utf-8-sig\` 编码,Excel 才不会乱码
- \`open()\` 时务必加 \`newline=''\`,避免 Windows 换行问题
`,
  },
  {
    id: "pyfile-json",
    icon: "🧾",
    title: "JSON 文件处理:json 模块",
    group: "结构化数据读写",
    content: `# JSON 文件处理:json 模块

## 一、引言

JSON(JavaScript Object Notation)是当今**最流行的数据交换格式**。它源自 JavaScript,但已经独立于语言——几乎所有编程语言都支持 JSON。 REST API 返回的数据、配置文件、NoSQL 数据库(MongoDB)、前端与后端通信,几乎都用 JSON。

相比 CSV,JSON 的优势:
- 支持**嵌套结构**(对象里套对象、数组里套数组)
- 支持**多种数据类型**(字符串、数字、布尔、null)
- 可读性好,有缩进格式
- 跨语言通用,生态最完善

Python 标准库的 \`json\` 模块提供完整的 JSON 读写支持,日常开发用得极多。

## 二、JSON 数据类型与 Python 类型对照

JSON 只有 6 种数据类型,和 Python 类型对应关系如下:

| JSON 类型 | 示例 | Python 类型 | 说明 |
|-----------|------|-------------|------|
| object | {"k": "v"} | dict | 键值对,键必须是字符串 |
| array | [1, 2, 3] | list / tuple | 有序数组 |
| string | "hello" | str | 必须用双引号 |
| number | 42 / 3.14 | int / float | 不区分整数浮点 |
| true / false | true | True / False | 布尔,小写 |
| null | null | None | 空值 |

**不在 JSON 里的 Python 类型**:\`set\`、\`bytes\`、\`datetime\`、\`complex\`、自定义类实例——这些需要额外处理才能转成 JSON。

## 三、四个核心函数

| 函数 | 作用 | 输入 → 输出 |
|------|------|-------------|
| json.load(f) | 从**文件对象**读取 JSON | file → obj |
| json.loads(s) | 从**字符串**读取 JSON | str → obj |
| json.dump(obj, f) | 写入**文件对象** | obj → file |
| json.dumps(obj) | 转成**字符串** | obj → str |

记忆方法:带 \`s\` 后缀的是 string(字符串)版本,不带 \`s\` 的是 file(文件)版本。 \`load\` 是读,\`dump\` 是写。

## 四、从文件读取:json.load

\`\`\`python
import json

# data.json 内容:{"name": "张三", "age": 28, "skills": ["Python", "Go"]}
with open("data.json", encoding="utf-8") as f:
    data = json.load(f)  # 一次性读整个文件并解析

# data 已经是 Python dict
print(type(data))         # <class 'dict'>
print(data["name"])       # 张三
print(data["skills"][0])  # Python
\`\`\`

**详解**:\`json.load(f)\` 接收一个**文件对象**(不是路径字符串),内部读取全部内容并解析成 Python 对象。 一次调用就把整个 JSON 解析完,适合文件不大的场景(几十 MB 以内)。 如果文件很大,考虑 \`ijson\` 第三方库做流式解析。 注意 encoding 要和文件实际编码一致,JSON 文件通常是 UTF-8。

## demo 1:json.load 读取嵌套 JSON

\`\`\`python
import json

# config.json:一个嵌套的配置文件
# {
#   "app": {
#     "name": "myapp",
#     "version": "1.0.0",
#     "debug": true
#   },
#   "database": {
#     "host": "localhost",
#     "port": 5432,
#     "pool_size": 10,
#     "ssl": false
#   },
#   "features": ["auth", "logging", "cache"]
# }

with open("config.json", encoding="utf-8") as f:
    cfg = json.load(f)

# 嵌套访问:一层层用 [] 取
print(cfg["app"]["name"])          # myapp
print(cfg["database"]["port"])     # 5432 (int 类型,不是字符串)
print(cfg["features"])             # ['auth', 'logging', 'cache']
print(cfg["features"][-1])         # cache

# 安全访问:get 避免 KeyError
host = cfg.get("database", {}).get("host", "127.0.0.1")
print(host)  # localhost
\`\`\`

**详解**:JSON 的嵌套结构解析后保持嵌套——object 变成 dict、array 变成 list,层层嵌套对应。 访问时用 \`[]\` 链式取值。 注意 \`true/false\` 解析后是 Python 的 \`True/False\`(首字母大写),\`null\` 变成 \`None\`。 数字 5432 是 int 类型,可以直接参与运算,不用 int() 转换。 用 \`.get()\` 链式访问能避免 KeyError,但要注意中间层可能是 None 导致 \`.get\` 报错,所以写成 \`cfg.get("database", {}).get(...)\` 更安全。

## demo 2:json.dump 写入文件

\`\`\`python
import json

data = {
    "name": "张三",
    "age": 28,
    "skills": ["Python", "Go", "Rust"],
    "active": True,
    "score": None,
}

# 写入文件:dump(obj, file)
with open("output.json", "w", encoding="utf-8") as f:
    json.dump(data, f)
\`\`\`

**详解**:\`json.dump(data, f)\` 把 Python 对象序列化成 JSON 文本写入文件。 默认输出是**紧凑格式**(一行,无缩进),文件最小但不可读。 \`True\` 变成 \`true\`、\`None\` 变成 \`null\`,自动转换。 默认 \`ensure_ascii=True\`,中文会被转成 \`\\uXXXX\` 转义序列——下面专门讲这个问题。

## demo 3:ensure_ascii 处理中文

\`\`\`python
import json

data = {"name": "张三", "city": "北京"}

# ❌ 默认 ensure_ascii=True:中文变成 \\uXXXX
print(json.dumps(data))
# {"name": "\\u5f20\\u4e09", "city": "\\u5317\\u4eac"}

# ✅ ensure_ascii=False:保留原始中文
print(json.dumps(data, ensure_ascii=False))
# {"name": "张三", "city": "北京"}
\`\`\`

**详解**:JSON 标准允许用 \`\\uXXXX\` 表示任意 Unicode 字符,所以默认 \`ensure_ascii=True\` 把所有非 ASCII 字符(中文、emoji 等)转成转义序列——**纯 ASCII 输出,跨系统最安全**。 但人看不懂,而且文件变大。 日常开发几乎都设 \`ensure_ascii=False\`,直接输出 UTF-8 中文。 写文件时配合 \`encoding="utf-8"\` 即可。 **经验法则:面向程序交换用 True,面向人类阅读用 False**。

## demo 4:indent 格式化缩进

\`\`\`python
import json

data = {
    "app": "myapp",
    "db": {"host": "localhost", "port": 5432},
    "features": ["auth", "logging"],
}

# indent=2:每级缩进 2 个空格,易读
print(json.dumps(data, ensure_ascii=False, indent=2))
# {
#   "app": "myapp",
#   "db": {
#     "host": "localhost",
#     "port": 5432
#   },
#   "features": [
#     "auth",
#     "logging"
#   ]
# }

# indent=4:更宽的缩进
# 也可以传 indent="\\t" 用 Tab 缩进
print(json.dumps(data, ensure_ascii=False, indent="\\t"))
\`\`\`

**详解**:\`indent\` 控制缩进量,传整数表示空格数,传字符串表示自定义缩进字符。 配合 \`ensure_ascii=False\` 输出的 JSON 既美观又能正确显示中文,适合写配置文件给人看。 注意:缩进会增加文件大小(多了空格和换行),网络传输或存储大量数据时,用默认紧凑格式更省空间。 可以用 \`separators=(",", ":")\` 进一步压缩(去掉逗号和冒号后的空格)。

## demo 5:sort_keys 与 separators

\`\`\`python
import json

data = {"zebra": 1, "apple": 2, "mango": 3}

# sort_keys=True:按 key 字典序排序
print(json.dumps(data, sort_keys=True))
# {"apple": 2, "mango": 3, "zebra": 1}

# separators=(item_sep, key_sep)
# 默认是 (", ", ": ") 带空格;压缩成 (",", ":") 去空格
compact = json.dumps(data, separators=(",", ":"))
print(compact)  # {"zebra":1,"apple":2,"mango":3}

# 组合:排序 + 紧凑,常用于生成哈希稳定的 JSON
stable = json.dumps(data, sort_keys=True, separators=(",", ":"))
print(stable)  # {"apple":2,"mango":3,"zebra":1}
\`\`\`

**详解**:\`sort_keys=True\` 让输出的 key 按字典序排列,配合 \`separators=(",", ":")\` 去掉空格,可以生成**确定性输出**——同样数据每次序列化结果完全一样。 这在做**哈希、签名、缓存 key** 时很重要:如果 key 顺序随机,同样的数据哈希值却不同,缓存就会失效。 \`separators\` 第一个元素是字段间分隔符,第二个是 key-value 间分隔符。

## demo 6:loads 与 dumps 字符串操作

\`\`\`python
import json

# 从字符串解析:loads
json_str = '{"name": "张三", "age": 28, "skills": ["Python"]}'
data = json.loads(json_str)  # 注意是 loads,带 s
print(data["name"])          # 张三
print(type(data["skills"]))  # <class 'list'>

# 把对象转成字符串:dumps
obj = {"status": "ok", "code": 200}
text = json.dumps(obj, ensure_ascii=False)
print(text)  # {"status": "ok", "code": 200}
print(type(text))  # <class 'str'>

# 典型场景:从 HTTP 响应解析 JSON
import urllib.request
# resp = urllib.request.urlopen("https://api.example.com/users")
# body = resp.read().decode("utf-8")  # 字节流转字符串
# users = json.loads(body)            # 字符串转 dict
\`\`\`

**详解**:\`loads\`(load string)和 \`dumps\`(dump string)处理的是**字符串**而非文件。 网络 API 返回的 JSON 通常是字符串(或字节流先 decode 成字符串),用 loads 解析;反过来要发送 JSON 给服务器,用 dumps 转成字符串。 \`load\`/\`dump\` 处理文件,\`loads\`/\`dumps\` 处理字符串,两对函数覆盖所有场景。

## demo 7:自定义编码器(处理 datetime)

JSON 标准不支持 datetime,直接序列化会报错。 解决办法是写一个 \`JSONEncoder\` 子类,或者用 \`default\` 回调。

\`\`\`python
import json
from datetime import datetime, date

data = {
    "event": "登录",
    "time": datetime(2024, 1, 15, 10, 30, 0),
    "birthday": date(1995, 6, 20),
}

# 方法一:default 回调(简单场景推荐)
def default_encoder(obj):
    """遇到不认识的类型时调用,返回可序列化的值"""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()  # 转成 ISO 8601 字符串
    raise TypeError(f"无法序列化 {type(obj)}")

text = json.dumps(data, ensure_ascii=False, default=default_encoder)
print(text)
# {"event": "登录", "time": "2024-01-15T10:30:00", "birthday": "1995-06-20"}

# 方法二:继承 JSONEncoder(需要复用时推荐)
class MyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        return super().default(obj)  # 其它类型交给父类

text2 = json.dumps(data, ensure_ascii=False, cls=MyEncoder)
print(text2)
\`\`\`

**详解**:\`default\` 回调在遇到 JSON 不认识的类型时被调用,你返回一个"JSON 能理解的值"(字符串、数字、dict 等)即可。 \`cls=MyEncoder\` 是类版本,适合多处复用同一套编码逻辑。 \`isoformat()\` 输出 ISO 8601 格式(\`2024-01-15T10:30:00\`),这是跨语言通用的日期时间字符串。 反向解析时需要 \`object_hook\` 把字符串转回 datetime,但通常更推荐在应用层显式处理。

## demo 8:解析时处理 NaN / Infinity

JSON 标准不支持 \`NaN\` / \`Infinity\`,但 Python 的 json 模块**默认接受**它们,这会导致**跨语言不兼容**(JavaScript、Java 可能解析失败)。

\`\`\`python
import json
import math

data = {"score": float("nan"), "big": float("inf")}

# 默认行为:NaN/Infinity 会原样输出(不符合 JSON 标准)
text = json.dumps(data)
print(text)  # {"score": NaN, "big": Infinity}

# 严格模式:遇到 NaN/Infinity 抛异常
try:
    json.dumps(data, allow_nan=False)
except ValueError as e:
    print(e)  # Out of range float values are not JSON compliant

# 解析时用 parse_constant 钩子拦截 NaN/Infinity
def reject_constants(constant):
    """遇到 NaN/Infinity/-Infinity 时抛错"""
    raise ValueError(f"非法 JSON 常量: {constant}")

json.loads('{"x": NaN}', parse_constant=reject_constants)
\`\`\`

**详解**:Python 的 \`float('nan')\` 和 \`float('inf')\` 在数学上有效,但 JSON 标准不支持。 默认 \`allow_nan=True\` 会输出 \`NaN\`/\`Infinity\` 字面量(不是合法 JSON)。 **生产环境建议 \`allow_nan=False\`**,强制报错,避免输出别的语言无法解析的数据。 \`parse_constant\` 是解析时的钩子,可以自定义 NaN/Infinity 的处理方式(报错或转成 None)。

## 五、类型对照速查

| 场景 | Python → JSON | JSON → Python |
|------|---------------|---------------|
| 字典 | dict → object | object → dict |
| 列表/元组 | list/tuple → array | array → list |
| 字符串 | str → string | string → str |
| 整数 | int → number | number → int/float |
| 布尔 | True → true | true → True |
| 空值 | None → null | null → None |
| 不支持 | set/bytes/datetime → 报错 | — |

## 六、小结

- JSON 是跨语言数据交换的事实标准,支持嵌套结构和多类型
- 四个核心函数:\`load\`/\`loads\`(读)、\`dump\`/\`dumps\`(写),带 s 的处理字符串
- 中文场景设 \`ensure_ascii=False\`,配合 \`encoding="utf-8"\`
- \`indent\` 格式化、\`sort_keys\` 排序、\`separators\` 压缩
- 自定义类型用 \`default\` 回调或 \`cls=JSONEncoder\` 子类
- \`NaN\`/\`Infinity\` 不符合 JSON 标准,建议 \`allow_nan=False\`
`,
  },
  {
    id: "pyfile-config",
    icon: "⚙️",
    title: "配置文件:ini、toml、yaml",
    group: "结构化数据读写",
    content: `# 配置文件:ini、toml、yaml

## 一、引言

程序总有一些"会变的参数":数据库地址、端口、超时时间、日志级别、功能开关。 这些参数不该写死在代码里(改一下就要重新编译/部署),应该放到**配置文件**里,运维或用户改配置即可,代码不动。

常见的配置文件格式有三种:

| 格式 | 全称 | Python 支持 | 特点 |
|------|------|-------------|------|
| ini | initialization | 标准库 configparser | 简单,无嵌套,类型都是字符串 |
| toml | Tom's Obvious Minimal Language | 标准库 tomllib(3.11+) | 现代,支持类型,pyproject.toml 在用 |
| yaml | YAML Ain't Markup Language | 第三方 PyYAML | 最灵活,支持复杂嵌套和多行字符串 |

选择建议:
- **配置简单、扁平**:用 ini,标准库无需安装
- **现代 Python 项目**:用 toml(pyproject.toml 是新标准)
- **配置复杂、有嵌套**:用 yaml,DevOps 工具(k8s、CI)都在用

## 二、三种格式对比

| 维度 | ini | toml | yaml |
|------|-----|------|------|
| 可读性 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 类型支持 | 全是字符串 | 丰富(数字、布尔、日期、数组) | 丰富(还支持多行、锚点) |
| 嵌套结构 | 不支持 | 支持(表格嵌套) | 支持(缩进嵌套) |
| 注释 | 支持 ; | 支持 # | 支持 # |
| Python 版本 | 内置 | 内置(3.11+,写需第三方) | 需 PyYAML |
| 典型应用 | Windows 配置、旧项目 | pyproject.toml | k8s、CI/CD、Ansible |

## 三、configparser:读写 ini 文件

ini 文件用 \`[section]\` 分段,段内是 \`key = value\`。 优点是简单直观,缺点是**所有值都是字符串**(需要自己转 int/bool),且不支持嵌套。

\`\`\`ini
# database.ini 示例
[mysql]
host = localhost
port = 3306
user = root
password = secret

[redis]
host = 127.0.0.1
port = 6379
db = 0
\`\`\`

### ConfigParser 核心方法

| 方法 | 作用 |
|------|------|
| read(path) | 从文件加载(可传多个路径) |
| sections() | 返回所有段名列表(不含 DEFAULT) |
| options(section) | 返回某段的所有 key |
| get(section, key) | 取值(字符串) |
| getint / getfloat / getboolean | 取值并转类型 |
| set(section, key, value) | 修改/新增 |
| write(f) | 写入文件 |

## demo 1:读取 ini 文件

\`\`\`python
import configparser

cfg = configparser.ConfigParser()
cfg.read("database.ini", encoding="utf-8")

# 列出所有段
print(cfg.sections())  # ['mysql', 'redis']

# 取值:get 返回字符串
host = cfg.get("mysql", "host")
print(host)  # localhost

# getint / getfloat / getboolean 自动转类型
port = cfg.getint("mysql", "port")
print(port, type(port))  # 3306 <class 'int'>

# 遍历某段的所有配置项
for key in cfg.options("mysql"):
    print(f"  {key} = {cfg.get('mysql', key)}")
\`\`\`

**详解**:\`ConfigParser()\` 创建解析器对象,\`read\` 加载文件(可以传多个路径,依次尝试读取,常用于"用户配置覆盖默认配置"的场景)。 \`sections()\` 返回所有段名,\`DEFAULT\` 段不会出现在里面(它是特殊段,下面讲)。 \`get\` 返回字符串,\`getint\` / \`getfloat\` / \`getboolean\` 自动转类型——注意 \`getboolean\` 能识别 \`yes/no\`、\`on/off\`、\`true/false\`、\`1/0\` 等多种写法。

## demo 2:写入 ini 文件

\`\`\`python
import configparser

cfg = configparser.ConfigParser()

# 新增段并设置值
cfg["mysql"] = {
    "host": "localhost",
    "port": "3306",
    "user": "root",
    "password": "secret",
}
cfg["redis"] = {
    "host": "127.0.0.1",
    "port": "6379",
}

# 也可以用 set 单个设置
cfg.set("mysql", "timeout", "30")

# 写入文件
with open("new_config.ini", "w", encoding="utf-8") as f:
    cfg.write(f)
\`\`\`

**详解**:\`cfg["section"] = {...}\` 直接用字典语法创建段并赋值,比 \`add_section\` + \`set\` 更简洁。 **所有值都会被转成字符串**,所以写 3306 会被存成 "3306"。 \`write(f)\` 把配置写入文件,默认用 \`=\` 分隔 key 和 value,行尾是 \`\\n\`。 注意:ConfigParser 不保证段和 key 的顺序(老版本会乱序,3.7+ 默认保持插入顺序)。

## demo 3:类型转换与 DEFAULT 段

\`\`\`python
import configparser

# DEFAULT 段:所有段共享的默认值
cfg = configparser.ConfigParser()
cfg["DEFAULT"] = {
    "timeout": "30",
    "retries": "3",
}
cfg["mysql"] = {"host": "localhost"}
cfg["redis"] = {"host": "127.0.0.1", "timeout": "60"}  # 覆盖默认值

# DEFAULT 的值会被所有段继承
print(cfg.get("mysql", "timeout"))   # 30(继承 DEFAULT)
print(cfg.get("redis", "timeout"))   # 60(redis 自己覆盖了)
print(cfg.get("mysql", "retries"))   # 3(继承 DEFAULT)

# getboolean 识别多种写法
cfg.set("mysql", "debug", "yes")
print(cfg.getboolean("mysql", "debug"))  # True

# 带默认值的 get:取不到不报错
host = cfg.get("mysql", "charset", fallback="utf8")
print(host)  # utf8
\`\`\`

**详解**:\`DEFAULT\` 段是特殊的——它的 key 对所有段可见,相当于"全局默认值"。 某段自己定义了同名 key 就覆盖默认值,否则继承。 这在"多个段有公共配置"时很有用,避免重复。 \`getboolean\` 能识别 \`yes/no\`、\`on/off\`、\`true/false\`、\`1/0\`(大小写不敏感),非常宽容。 \`get\` 取不到 key 会抛 \`NoOptionError\`,用 \`fallback\` 参数给默认值更优雅。

## 四、tomllib:读取 toml 文件(Python 3.11+)

TOML 是新兴的配置格式,**Python 3.11+ 内置 \`tomllib\`** 用于读取。 写入需要第三方库 \`tomli-w\`。 \`pyproject.toml\` 是现代 Python 项目的标准配置文件,所以 toml 越来越重要。

TOML 语法示例:

\`\`\`toml
# app.toml
title = "My App"
debug = true
port = 8080

[database]
host = "localhost"
port = 5432
servers = ["db1", "db2", "db3"]

[owner]
name = "张三"
birth = 1995-06-20
\`\`\`

注意:字符串必须用双引号(不能单引号),数字直接写(不要引号),布尔是小写 \`true/false\`。

## demo 4:tomllib 读取 toml

\`\`\`python
import tomllib  # Python 3.11+ 内置

# 读取 toml 文件:load 接收二进制模式文件
with open("app.toml", "rb") as f:  # 注意是 rb,二进制
    cfg = tomllib.load(f)

print(cfg)
# {
#   'title': 'My App',
#   'debug': True,
#   'port': 8080,
#   'database': {'host': 'localhost', 'port': 5432, 'servers': ['db1', 'db2', 'db3']},
#   'owner': {'name': '张三', 'birth': datetime.date(1995, 6, 20)}
# }

# 类型已经正确:True 是 bool,8080 是 int
print(type(cfg["debug"]))  # <class 'bool'>
print(cfg["port"] + 1)     # 8081,可以直接运算

# 从字符串解析:loads
text = '''
name = "test"
nums = [1, 2, 3]
'''
cfg2 = tomllib.loads(text)
print(cfg2["nums"])  # [1, 2, 3]
\`\`\`

**详解**:\`tomllib.load(f)\` 必须用**二进制模式**(\`rb\`)打开文件,因为它内部用 UTF-8 解码。 TOML 自带类型——\`true\` 是 bool、\`8080\` 是 int、\`["db1", "db2"]\` 是 list,读出来直接是正确的 Python 类型,不用手动转换。 \`birth = 1995-06-20\` 这种写法会被解析成 \`datetime.date\` 对象,TOML 原生支持日期类型。 **tomllib 只能读不能写**,写需要第三方库 \`tomli-w\`(\`pip install tomli-w\`),API 类似 \`tomli_w.dump(obj, f)\`。

## 五、yaml:读写 yaml(PyYAML)

YAML 是最灵活的配置格式,用**缩进**表示嵌套,支持列表、字典、多行字符串、注释。 k8s、Docker Compose、Ansible、GitHub Actions 全用 YAML。 需要 \`pip install pyyaml\`。

YAML 语法示例:

\`\`\`yaml
# app.yaml
name: My App
debug: true
port: 8080

database:
  host: localhost
  port: 5432
  servers:
    - db1
    - db2
    - db3

description: |
  这是一个
  多行字符串
  换行会被保留
\`\`\`

## demo 5:yaml.safe_load 读取

\`\`\`python
import yaml  # 需要 pip install pyyaml

with open("app.yaml", encoding="utf-8") as f:
    cfg = yaml.safe_load(f)

print(cfg)
# {
#   'name': 'My App',
#   'debug': True,
#   'port': 8080,
#   'database': {
#     'host': 'localhost',
#     'port': 5432,
#     'servers': ['db1', 'db2', 'db3']
#   },
#   'description': '这是一个\\n多行字符串\\n换行会被保留\\n'
# }

# 类型已正确转换
print(type(cfg["debug"]))  # <class 'bool'>
print(cfg["database"]["servers"][0])  # db1
\`\`\`

**详解**:\`safe_load(f)\` 是**安全**的解析方法,只解析基本类型(dict/list/str/int/float/bool/null),不执行任意 Python 对象(避免安全风险)。 **永远用 safe_load,不要用 yaml.load 不带 SafeLoader**——后者能反序列化任意 Python 对象,有代码执行风险(类似 pickle)。 YAML 用缩进表示层级,**缩进必须用空格不能用 Tab**,这是新手常踩的坑。 \`|\` 表示"字面块",保留所有换行;\`>\` 表示"折叠块",把换行转成空格。

## demo 6:yaml.safe_dump 写入

\`\`\`python
import yaml

data = {
    "app": "myapp",
    "debug": True,
    "database": {
        "host": "localhost",
        "port": 5432,
    },
    "features": ["auth", "logging"],
}

# 写入文件:allow_unicode=True 保留中文
with open("output.yaml", "w", encoding="utf-8") as f:
    yaml.safe_dump(data, f, allow_unicode=True, sort_keys=False)

# sort_keys=False 保持原 dict 顺序
# allow_unicode=True 否则中文变转义
# default_flow_style=False 用块格式(默认),True 用流格式(类似 JSON)
\`\`\`

**详解**:\`safe_dump\` 把 Python 对象写成 YAML 文本。 \`allow_unicode=True\` 让中文原样输出(默认会转成 \`\\uXXXX\`)。 \`sort_keys=False\` 保持插入顺序(默认会按 key 排序)。 \`default_flow_style=False\` 用"块格式"(缩进表示层级,可读性好);True 用"流格式"(类似 JSON 的 \`[a, b]\`)。 同样**永远用 safe_dump**,不要用 \`yaml.dump\` 不带 SafeDumper。

## demo 7:三种格式对比实战

\`\`\`python
import configparser
import tomllib
import yaml  # pip install pyyaml

# 同一份配置用三种格式表达
config = {
    "app": {"name": "myapp", "port": 8080, "debug": True},
    "db": {"host": "localhost", "port": 5432},
}

# === ini(扁平化,所有值是字符串)===
ini_cfg = configparser.ConfigParser()
ini_cfg["app"] = {"name": "myapp", "port": "8080", "debug": "true"}
ini_cfg["db"] = {"host": "localhost", "port": "5432"}
with open("c.ini", "w") as f:
    ini_cfg.write(f)
# 读回来:port 是字符串,要 getint
ini_cfg2 = configparser.ConfigParser()
ini_cfg2.read("c.ini")
print(ini_cfg2.getint("app", "port"))  # 8080

# === toml(原生类型,推荐)===
with open("c.toml", "wb") as f:
    import tomli_w  # pip install tomli-w
    tomli_w.dump(config, f)
with open("c.toml", "rb") as f:
    t_cfg = tomllib.load(f)
print(t_cfg["app"]["port"])  # 8080 (int)

# === yaml(最灵活)===
with open("c.yaml", "w", encoding="utf-8") as f:
    yaml.safe_dump(config, f, allow_unicode=True, sort_keys=False)
with open("c.yaml", encoding="utf-8") as f:
    y_cfg = yaml.safe_load(f)
print(y_cfg["app"]["port"])  # 8080 (int)
\`\`\`

**详解**:同样是 \`port: 8080\`,ini 写入时必须手动转字符串(\`"8080"\`),读取时再 \`getint\` 转回来;而 toml 和 yaml 都自动保持 int 类型,读写都省心。 **选型结论**:简单配置用 ini(零依赖);现代 Python 项目用 toml(pyproject.toml 标准);复杂嵌套、DevOps 场景用 yaml。 实际项目里通常一个格式就够,不要混用。

## 六、小结

- **ini**:最简单,标准库 configparser,所有值是字符串,无嵌套
- **toml**:现代标准,Python 3.11+ 内置 tomllib 读取(写需 tomli-w),类型丰富
- **yaml**:最灵活,需 PyYAML,支持复杂嵌套和多行字符串,DevOps 主流
- **永远用 safe_load/safe_dump**,不要用不安全的 yaml.load
- YAML 缩进**必须用空格**,不能用 Tab
- configparser 的 DEFAULT 段提供全局默认值,所有段继承
`,
  },
  {
    id: "pyfile-pickle",
    icon: "🥒",
    title: "pickle 序列化",
    group: "结构化数据读写",
    content: `# pickle 序列化

## 一、引言

\`pickle\` 是 Python **原生的对象序列化模块**。 它能把几乎任何 Python 对象(包括自定义类的实例、函数、集合等)转成字节流,存到文件或网络传输,之后还能**完整还原**成原来的对象。

和 JSON 的本质区别:
- JSON 是**跨语言**的(Python/Java/JS 都能读),但只支持基本类型(dict/list/str/num/bool/null)
- pickle 是**Python 专属**的,但能序列化任意 Python 对象,还原后还能调用方法

典型场景:
- **机器学习模型**:训练好的 sklearn 模型用 pickle 保存,下次直接 load 就能预测
- **缓存**:把计算结果(复杂对象)pickle 后存 Redis,下次取出直接用
- **进程间传递**:multiprocessing 用 pickle 在进程间传对象
- **断点续算**:把中间状态 pickle,程序重启后恢复

## 二、pickle vs json 对比

| 维度 | pickle | json |
|------|--------|------|
| 类型范围 | 几乎所有 Python 对象 | 基本 6 种类型 |
| 可读性 | 二进制,人看不懂 | 文本,可读 |
| 跨语言 | ❌ Python 专属 | ✅ 通用 |
| 安全性 | ❌ 可执行代码(危险) | ✅ 仅数据 |
| 文件大小 | 略大(带类型信息) | 较小 |
| 速度 | 快 | 略慢(需类型转换) |
| 用途 | 内部缓存、ML 模型 | 跨系统数据交换 |

**核心原则**:**永远不要 unpickle 不可信的数据**——pickle 反序列化时**会执行代码**,收到恶意 pickle 等于被黑。 这是 pickle 最大的风险。

## 三、核心函数

| 函数 | 作用 |
|------|------|
| pickle.dump(obj, file) | 把对象写入文件 |
| pickle.load(file) | 从文件读取对象 |
| pickle.dumps(obj) | 转成字节串(内存) |
| pickle.loads(data) | 从字节串解析对象 |

和 json 的命名完全一致,只是处理的是**字节**而非字符串。 所以文件要用**二进制模式**(\`wb\`/\`rb\`)打开。

## demo 1:dump / load 文件读写

\`\`\`python
import pickle

data = {
    "name": "张三",
    "scores": [95, 88, 76],
    "active": True,
}

# 写入:必须用二进制模式 wb
with open("data.pkl", "wb") as f:
    pickle.dump(data, f)

# 读取:必须用二进制模式 rb
with open("data.pkl", "rb") as f:
    loaded = pickle.load(f)

print(loaded)  # {'name': '张三', 'scores': [95, 88, 76], 'active': True}
print(loaded == data)  # True,内容完全一致
\`\`\`

**详解**:\`pickle.dump(obj, f)\` 把对象序列化成字节流写入文件。 **文件必须用二进制模式**(\`wb\` 写、\`rb\` 读),如果用文本模式会报错(\`write() argument must be str, not bytes\`)。 \`load(f)\` 读取并还原对象,得到的对象和原来**值相等**(==),但不是同一个对象(is 不成立)。 文件扩展名常用 \`.pkl\` 或 \`.pickle\`,这只是约定,不是强制。

## demo 2:dumps / loads 内存操作

\`\`\`python
import pickle

data = {"name": "张三", "tags": {"a", "b", "c"}}  # 注意有 set

# dumps:转成字节串(不写文件)
byte_data = pickle.dumps(data)
print(type(byte_data))  # <class 'bytes'>
print(len(byte_data))   # 字节数,比如 60

# loads:从字节串还原
restored = pickle.loads(byte_data)
print(restored)  # {'name': '张三', 'tags': {'a', 'b', 'c'}}
print(restored["tags"])  # {'a', 'b', 'c'} set 也能还原
\`\`\`

**详解**:\`dumps\` 返回 \`bytes\`,适合存到 Redis、数据库 BLOB 字段、网络发送——这些场景不直接对应文件。 \`loads\` 从 bytes 还原。 注意 pickle **能序列化 set**,而 JSON 不行(set 不是 JSON 类型)。 这体现了 pickle 的优势:Python 原生类型几乎都能序列化,无需任何转换。

## demo 3:序列化自定义对象

\`\`\`python
import pickle

class User:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def greet(self):
        return f"我是 {self.name},今年 {self.age} 岁"

user = User("张三", 28)

# pickle 自定义对象:类定义必须在 load 时可访问
with open("user.pkl", "wb") as f:
    pickle.dump(user, f)

# 反序列化:必须能 import 到 User 类
with open("user.pkl", "rb") as f:
    loaded = pickle.load(f)

print(loaded.name)      # 张三
print(loaded.greet())   # 我是张三,今年 28 岁(方法还在!)
print(type(loaded))     # <class '__main__.User'>
\`\`\`

**详解**:pickle 不仅保存数据,还保存"对象属于哪个类",反序列化时按记录的类路径(\`__main__.User\`)重新 import 类并构造实例。 所以**类定义在 load 时必须能被 import 到**(同模块或可导入的模块)。 如果类被删了或重命名了,load 会抛 \`AttributeError\`。 还原后的对象**方法依然可用**,这是 JSON 做不到的(JSON 只能存数据,不能存"行为")。

## demo 4:protocol 协议版本对比

pickle 有多个 protocol 版本,版本越高效率越高但兼容性越差。

\`\`\`python
import pickle

data = list(range(1000))

# protocol 0:ASCII 文本格式,兼容老 Python,体积大
p0 = pickle.dumps(data, protocol=0)
print(f"protocol 0: {len(p0)} 字节")  # 最大

# protocol 2:Python 2.3 引入,二进制,兼容性好
p2 = pickle.dumps(data, protocol=2)
print(f"protocol 2: {len(p2)} 字节")

# protocol 4:Python 3.4+,支持大对象(>4GB)
p4 = pickle.dumps(data, protocol=4)
print(f"protocol 4: {len(p4)} 字节")

# protocol 5:Python 3.8+,支持带外数据(减少拷贝)
p5 = pickle.dumps(data, protocol=5)
print(f"protocol 5: {len(p5)} 字节")

# 默认 protocol(3.8+ 是 5)
default = pickle.dumps(data)
print(f"默认: {len(default)} 字节")

# HIGHEST_PROTOCOL:当前 Python 支持的最高版本
print(pickle.HIGHEST_PROTOCOL)  # 5
\`\`\`

**详解**:protocol 0 是可读的 ASCII 文本(像 \`(lp0\\nI0\\naI1\\n...\`),其它都是二进制。 版本越高,体积越小、速度越快,但只能被同等或更高版本的 Python 读取。 **实际开发用 \`pickle.HIGHEST_PROTOCOL\` 或默认值即可**,除非需要和旧 Python 交换数据才降低版本。 跨版本交换时,写入方和读取方的 protocol 要兼容(写用高版本,低版本 Python 读不了)。

## demo 5:序列化集合与嵌套结构

\`\`\`python
import pickle

# 各种 Python 原生类型
data = {
    "set": {1, 2, 3},                    # set
    "frozenset": frozenset({4, 5}),       # frozenset
    "tuple": (1, [2, 3], "a"),            # 含可变元素的 tuple
    "nested": {                            # 嵌套
        "list": [{"k": "v"}, [1, 2]],
        "bytes": b"hello",
    },
    "range": range(10),                   # range 对象
}

# 全部能序列化
data_bytes = pickle.dumps(data)

# 还原
restored = pickle.loads(data_bytes)
print(restored["set"])        # {1, 2, 3}
print(restored["tuple"])      # (1, [2, 3], 'a')
print(restored["nested"]["list"][0])  # {'k': 'v'}
print(restored["range"])      # range(0, 10)
\`\`\`

**详解**:pickle 能处理 set、frozenset、bytes、range、复杂嵌套,甚至循环引用(a 引用 b,b 引用 a)。 这是 JSON 完全做不到的——JSON 遇到 set 直接报错。 pickle 通过递归序列化对象的 \`__dict__\` 或 \`__reduce__\` 协议实现,几乎覆盖所有 Python 内置类型。 但有些类型不能序列化:打开的文件对象、socket、线程锁、生成器(这些代表"运行时状态",无法持久化)。

## demo 6:安全风险演示(重要!)

\`\`\`python
import pickle

# ⚠️ 警告:pickle.load 会执行 __reduce__ 返回的代码!
# 攻击者构造的恶意 pickle 可以在你 load 时执行任意命令

class SafeClass:
    pass

# 模拟恶意 pickle:__reduce__ 返回 (callable, args)
# load 时会执行 callable(*args)
class Malicious:
    def __reduce__(self):
        # 这里演示弹计算器(macOS),真实攻击可能 rm -rf /
        import os
        return (os.system, ("echo '你的代码被攻击了!'",))

# 把恶意对象 pickle
malicious_bytes = pickle.dumps(Malicious())

# ❌ 危险:直接 load 会执行 os.system("echo ...")
# pickle.loads(malicious_bytes)  # 会打印 "你的代码被攻击了!"

# ✅ 安全做法:只 unpickle 自己生成的、可信的数据
# 永远不要 loads 来自网络/用户上传的 pickle 文件
\`\`\`

**详解**:pickle 反序列化时,如果对象的类定义了 \`__reduce__\` 方法,pickle 会调用 \`__reduce__\` 返回的可调用对象——这就构成了**代码执行**。 攻击者可以构造一个 pickle,在 load 时执行 \`os.system("rm -rf /")\` 或下载木马。 **所以绝对不要 unpickle 不可信来源的数据**:用户上传的文件、网络抓包的数据、邮件附件里的 .pkl——通通不要 load。 需要交换数据就用 JSON(只解析数据,不执行代码)。

## 四、何时用 pickle,何时不用

**适合用 pickle**:
- 保存 ML 模型(sklearn 官方推荐)
- 程序内部缓存(只自己读写)
- multiprocessing 进程间传对象
- 需要保存复杂 Python 对象(自定义类、集合、嵌套)

**不要用 pickle**:
- 跨语言交换数据(用 JSON)
- 网络传输给外部(用 JSON,安全)
- 配置文件(用 toml/yaml,可读)
- 存储用户上传的数据(有安全风险)
- 长期归档(pickle 格式随 Python 版本变,可能以后读不了)

## 五、小结

- pickle 是 Python 原生序列化,能存几乎任何对象(含自定义类、set)
- 四个函数:\`dump\`/\`load\`(文件,二进制模式)、\`dumps\`/\`loads\`(字节串)
- 自定义对象 load 时类定义必须可 import,否则报错
- protocol 越高越高效,日常用 \`HIGHEST_PROTOCOL\`
- **安全红线:绝对不要 unpickle 不可信数据**,会执行任意代码
- 跨语言、对外、配置文件用 JSON/toml/yaml,不要用 pickle
`,
  },
  {
    id: "pyfile-xml",
    icon: "🌳",
    title: "XML 文件处理",
    group: "结构化数据读写",
    content: `# XML 文件处理

## 一、引言

XML(eXtensible Markup Language)是一种**标签式**的标记语言,用树形结构组织数据。 虽然现在 JSON 更流行,但 XML 依然在很多场景里活跃:配置文件(Java/Spring)、办公文档(docx/xlsx 内部是 XML)、SVG 图形、SOAP/WebService、RSS 订阅、Android 布局。

典型 XML 长这样:

\`\`\`xml
<bookstore>
  <book category="编程">
    <title lang="zh">Python 入门</title>
    <author>张三</author>
    <price>59.00</price>
  </book>
  <book category="小说">
    <title lang="zh">三体</title>
    <author>刘慈欣</author>
    <price>45.00</price>
  </book>
</bookstore>
\`\`\`

XML 的核心概念:
- **元素(element)**:\`<title>...</title>\` 一对标签构成一个元素
- **属性(attribute)**:\`category="编程"\` 写在开始标签里
- **文本(text)**:标签之间的内容,\`<price>59.00</price>\` 的 text 是 "59.00"
- **树形结构**:一个根元素 bookstore,下面是多个 book 子元素

Python 标准库 \`xml.etree.ElementTree\` 提供轻量级 XML 处理,日常开发够用。 需要完整 XPath、XSLT 时用第三方 \`lxml\`。

## 二、ElementTree 核心对象

| 对象 | 作用 |
|------|------|
| Element | 一个 XML 元素(tag/attrib/text/tail/children) |
| ElementTree | 整棵树,提供 parse/write 等文件操作 |
| SubElement(parent, tag) | 在 parent 下创建子元素 |

每个 Element 有四个核心属性:

| 属性 | 含义 | 示例 |
|------|------|------|
| tag | 标签名 | "title" |
| attrib | 属性字典 | {"lang": "zh"} |
| text | 开始标签和子元素之间的文本 | "Python 入门" |
| tail | 结束标签后的文本(混合内容时用) | 通常是 None |
| list(elem) | 子元素列表 | [<title>, <author>, <price>] |

## 三、parse:从文件读取

\`\`\`python
import xml.etree.ElementTree as ET

# parse 返回 ElementTree 对象
tree = ET.parse("bookstore.xml")
root = tree.getroot()  # 拿到根元素 <bookstore>

print(root.tag)        # bookstore
print(root.attrib)     # {}
print(len(root))       # 2,有两个 <book> 子元素

# 遍历直接子元素
for book in root:
    print(book.tag, book.attrib)  # book {'category': '编程'}
\`\`\`

**详解**:\`ET.parse(path)\` 一次性把整个 XML 解析成内存中的树,返回 \`ElementTree\` 对象。 \`getroot()\` 拿到根元素(\`<bookstore>\`)。 Element 既是节点也是容器——\`len(elem)\` 返回子元素个数,\`for child in elem\` 遍历直接子元素,支持索引 \`elem[0]\`。 \`attrib\` 是普通 dict,可以直接 \`elem.attrib["category"]\` 或 \`elem.get("category", "默认")\`。

## demo 1:parse 读取并访问属性

\`\`\`python
import xml.etree.ElementTree as ET

tree = ET.parse("bookstore.xml")
root = tree.getroot()

# 遍历所有 book,提取信息
for book in root.findall("book"):  # findall 找直接子元素
    category = book.get("category")  # 取属性,等价于 book.attrib["category"]
    title = book.find("title").text  # find 找第一个子元素,.text 取文本
    lang = book.find("title").get("lang")
    author = book.find("author").text
    price = float(book.find("price").text)  # 文本是字符串,要自己转数字

    print(f"[{category}] {title} (lang={lang}) - {author} - ¥{price}")
# [编程] Python 入门 (lang=zh) - 张三 - ¥59.00
# [小说] 三体 (lang=zh) - 刘慈欣 - ¥45.00
\`\`\`

**详解**:\`find(tag)\` 返回第一个匹配的子元素,\`findall(tag)\` 返回所有匹配的列表。 \`.text\` 取元素的文本内容(字符串),数字要自己 \`float()\` / \`int()\` 转。 \`.get(attr)\` 取属性值,取不到返回 None(可以传第二个参数作默认值)。 注意路径:find 只找**直接子元素**,孙元素要用 \`book/find("title")\` 这种相对路径,或 \`./title\`。

## demo 2:findall 与 XPath 子集

\`\`\`python
import xml.etree.ElementTree as ET

tree = ET.parse("bookstore.xml")
root = tree.getroot()

# findall 支持简化的 XPath
# 1. 直接子元素
books = root.findall("book")
print(len(books))  # 2

# 2. 所有后代(任意深度):.//tag
titles = root.findall(".//title")
print([t.text for t in titles])  # ['Python 入门', '三体']

# 3. 带条件筛选 [@attr='value']
prog_books = root.findall(".//book[@category='编程']")
print([b.find("title").text for b in prog_books])  # ['Python 入门']

# 4. 按位置 [.//title[1] 是第一个 title
first_title = root.find(".//title")
print(first_title.text)  # Python 入门

# 5. find 找单个(返回第一个匹配)
first_book = root.find("book")
print(first_book.get("category"))  # 编程
\`\`\`

**详解**:\`findall\` 支持 XPath 的一个子集,常用路径写法: \`tag\`(直接子元素)、\`.//tag\`(任意深度的后代)、\`[@attr='value']\`(属性筛选)、\`[1]\`(按位置,注意 XPath 是 1-based)。 **标准库 ElementTree 只支持 XPath 子集**,复杂查询(如 \`ancestor::\`、\`following-sibling::\` 轴)需要 lxml。 find 返回单个元素或 None,findall 返回列表(可能空),不会抛异常。

## demo 3:iter 递归遍历

\`\`\`python
import xml.etree.ElementTree as ET

tree = ET.parse("bookstore.xml")
root = tree.getroot()

# iter(tag):递归遍历所有后代(不限深度),返回迭代器
for title in root.iter("title"):
    print(title.text, "/", title.get("lang"))
# Python 入门 / zh
# 三体 / zh

# iter() 不传参:遍历所有元素
for elem in root.iter():
    print(elem.tag, elem.attrib)
# bookstore {}
# book {'category': '编程'}
# title {'lang': 'zh'}
# author {}
# price {}
# book {'category': '小说'}
# title {'lang': 'zh'}
# author {}
# price {}

# 实用场景:统计所有 price 的总和
total = sum(float(p.text) for p in root.iter("price"))
print(f"总价: {total}")  # 104.00
\`\`\`

**详解**:\`iter(tag)\` 递归遍历整棵树,找出所有匹配标签的元素,**不限深度**——这是和 findall 的关键区别(findall 默认只找直接子元素)。 \`iter()\` 不传参则遍历所有元素,适合"全树扫描"。 iter 返回的是迭代器,内存友好,适合大文件。 实际开发常用来统计、聚合:比如算所有 price 之和、找所有带特定属性的元素。

## demo 4:创建 XML

\`\`\`python
import xml.etree.ElementTree as ET

# 创建根元素
root = ET.Element("fruits")  # <fruits></fruits>

# 方法一:SubElement 创建子元素(自动挂到 parent)
apple = ET.SubElement(root, "fruit")
apple.set("name", "苹果")      # 设置属性
apple.set("color", "红色")
price = ET.SubElement(apple, "price")
price.text = "5.5"            # 设置文本

# 方法二:先创建再 append
banana = ET.Element("fruit", {"name": "香蕉", "color": "黄色"})  # 创建时传属性
root.append(banana)  # 手动挂到 parent
ET.SubElement(banana, "price").text = "3.2"

# 转成字符串看效果
xml_str = ET.tostring(root, encoding="unicode")
print(xml_str)
# <fruits><fruit name="苹果" color="红色"><price>5.5</price></fruit>
# <fruit name="香蕉" color="黄色"><price>3.2</price></fruit></fruits>
\`\`\`

**详解**:\`ET.Element(tag, attrib)\` 创建一个独立元素(不在任何树里)。 \`ET.SubElement(parent, tag, attrib)\` 创建子元素并**自动挂到 parent 下**,等价于 \`elem = Element(...); parent.append(elem)\`,但更简洁。 \`elem.set(key, value)\` 设置属性,\`elem.text = "..." 设置文本。 \`ET.tostring(root, encoding="unicode")\` 把树转成字符串;不传 encoding 返回 bytes。 默认输出是紧凑格式(无缩进),要美观输出用 \`ET.indent(tree, space="  ", level=0)\`(Python 3.9+)。

## demo 5:修改 XML 后保存

\`\`\`python
import xml.etree.ElementTree as ET

tree = ET.parse("bookstore.xml")
root = tree.getroot()

# 1. 修改现有元素:改 text
for price in root.iter("price"):
    new_price = float(price.text) * 1.1  # 涨价 10%
    price.text = f"{new_price:.2f}"
    price.set("currency", "CNY")  # 新增属性

# 2. 新增元素:给每个 book 加 <discount>
for book in root.findall("book"):
    discount = ET.SubElement(book, "discount")
    discount.text = "0.9"

# 3. 删除元素:remove 掉所有 author(演示用)
for book in root.findall("book"):
    author = book.find("author")
    if author is not None:
        book.remove(author)

# 美化缩进(Python 3.9+)
ET.indent(tree, space="  ")

# 写回文件:encoding 指定编码,xml_declaration 加声明
tree.write("bookstore_new.xml", encoding="utf-8", xml_declaration=True)
\`\`\`

**详解**:修改元素就改 \`.text\` / \`.attrib\` / \`.set()\`,改动立即生效。 新增用 \`SubElement\`。 删除用 \`parent.remove(child)\`,注意要先找到 child 再 remove。 \`ET.indent(tree)\` 是 3.9 新增,给树加缩进,让输出可读;之前要自己写或用 lxml。 \`tree.write()\` 把修改后的树写回文件,\`xml_declaration=True\` 会在文件头加 \`<?xml version='1.0' encoding='utf-8'?>\`,推荐加上。

## demo 6:属性处理与命名空间

\`\`\`python
import xml.etree.ElementTree as ET

# 带命名空间的 XML(SVG、SOAP 等常见)
xml = '''<root xmlns:dc="http://purl.org/dc/elements/1.1/">
  <item>
    <dc:title>文章标题</dc:title>
    <dc:creator>张三</dc:creator>
  </item>
</root>'''

root = ET.fromstring(xml)  # fromstring 从字符串解析

# 带命名空间的标签:全名是 {URI}localname
for elem in root.iter():
    print(elem.tag)
# root
# item
# {http://purl.org/dc/elements/1.1/}title
# {http://purl.org/dc/elements/1.1/}creator

# 查找带命名空间的元素:用 {URI}tag 完整路径
ns = {"dc": "http://purl.org/dc/elements/1.1/"}
title = root.find(".//dc:title", ns)  # 用命名空间前缀
print(title.text)  # 文章标题

# 遍历所有 dc: 元素
for elem in root.findall(".//dc:*", ns):
    print(elem.tag, "=", elem.text)
\`\`\`

**详解**:命名空间(namespace)是 XML 的复杂特性,标签会变成 \`{URI}localname\` 形式。 查找时要传 \`namespaces\` 参数,用前缀映射 URI。 这是因为不同命名空间可能有同名标签(比如 \`dc:title\` 和 \`xhtml:title\`),必须靠 URI 区分。 实际处理 SOAP、SVG、XHTML 都会遇到命名空间。 \`ET.fromstring(text)\` 从字符串解析,返回根元素(不是 ElementTree),适合处理网络返回的 XML 文本。

## 六、lxml 第三方库简介

标准库 ElementTree 的局限:
- 只支持 XPath 子集(没有 ancestor、following-sibling 等轴)
- 不支持 XSLT 转换
- 不支持 XML Schema 验证
- 大文件解析慢(虽然是全内存)

\`lxml\`( \`pip install lxml\`)的优势:

\`\`\`python
# pip install lxml
from lxml import etree

# API 和 ElementTree 几乎一样,但功能更强
tree = etree.parse("big.xml")
root = tree.getroot()

# 完整 XPath:支持所有轴
# 找所有有 <price> 子元素的 <book>
books = root.xpath("//book[price]")
print(len(books))

# 用 text() 取所有 title 的文本
titles = root.xpath("//title/text()")
print(titles)  # ['Python 入门', '三体']

# 用 lxml 解析大文件:iterparse 流式
for event, elem in etree.iterparse("big.xml", events=("end",)):
    if elem.tag == "book":
        # 处理完清空,释放内存
        process_book(elem)
        elem.clear()  # 清空元素内容,降低内存
\`\`\`

**详解**:lxml 的 API 和 ElementTree 兼容,迁移成本低,但底层用 C 实现,速度快 10 倍以上。 \`xpath()\` 方法支持完整 XPath,比 findall 强大。 \`iterparse\` 是流式解析,适合处理几个 G 的大 XML——边读边处理,处理完 \`clear()\` 释放内存,不会一次性全加载。 处理大型 XML(如维基百科 dump、RSS 聚合)推荐 lxml + iterparse。

## 七、小结

- XML 用标签树组织数据,标准库 \`xml.etree.ElementTree\` 提供轻量处理
- \`parse\` 读文件,Element 的 \`tag\`/\`attrib\`/\`text\` 是核心属性
- \`find\`/\`findall\` 支持 XPath 子集,\`iter\` 递归遍历
- 创建用 \`Element\` + \`SubElement\`,写入用 \`tree.write\`
- 修改后用 \`ET.indent\` 美化(Python 3.9+)
- 命名空间标签是 \`{URI}localname\`,查找时传 \`namespaces\` 参数
- 大文件或需完整 XPath 用第三方 \`lxml\`,支持 \`iterparse\` 流式解析
`,
  },
  {
    id: "pyfile-large-file",
    icon: "🐘",
    title: "大文件与流式处理",
    group: "结构化数据读写",
    content: `# 大文件与流式处理

## 一、引言

前面几章我们用 \`f.read()\` 或 \`json.load()\` 一次性把整个文件读进内存——文件小没问题,但遇到**几个 G 甚至几十 G 的日志文件**,内存马上撑爆,程序直接 OOM(Out of Memory)崩溃。

大文件处理的核心思想:**不要一次性读完,要边读边处理**。 这叫**流式处理(streaming)**:每次只读一小块/一行,处理完就丢,内存占用恒定,跟文件大小无关。

典型大文件场景:
- **日志分析**:nginx/apache 访问日志,几十 G
- **数据 ETL**:从数据库导出的 CSV,百万行
- **机器学习**:训练数据集,几个 G
- **基因组数据**:fastq/fasta,几十 G

本章讲透分块读取、逐行迭代、生成器管道,这些是处理大文件的三大法宝。

## 二、大文件处理的挑战

| 挑战 | 表现 | 解决方案 |
|------|------|----------|
| 内存爆 | \`read()\` 后内存涨到几个 G | 分块/逐行读 |
| 速度慢 | 处理几小时没结果 | 流式管道 + 进度反馈 |
| 稳定性 | 中途崩了要重来 | 边处理边写、断点续算 |
| 可观测 | 不知道进度,像卡死 | 进度条/日志 |

核心原则:**内存占用与文件大小无关,只与"单次处理单元"大小有关**。 一次处理一行,内存就只占一行的量;一次读 1MB,内存就占 1MB——不管文件是 1MB 还是 100GB。

## 三、反面教材:一次性 read 的危害

\`\`\`python
# ❌ 危险:read() 一次性把整个文件读进内存
with open("big.log") as f:
    content = f.read()  # 5GB 文件 → 内存涨到 5GB+

# ❌ 危险:readlines 也一次性读完
with open("big.log") as f:
    lines = f.readlines()  # 全部行存成 list,内存爆炸

# ❌ 危险:json.load 大 JSON
with open("big.json") as f:
    data = json.load(f)  # 整个 JSON 解析进内存
\`\`\`

**这些写法在 5GB 文件上几乎必崩**。 \`read()\` 返回一个 5GB 的字符串,Python 字符串还要额外开销,实际占用可能是文件大小的 2-3 倍。 \`readlines()\` 更糟——除了字符串本身,还要维护一个包含几百万行的 list。 正确做法是下面要讲的分块/逐行。

## 四、分块读取:read(chunk_size)

\`\`\`python
# ✅ 分块读取:每次只读 chunk_size 字节
chunk_size = 1024 * 1024  # 1MB
with open("big.bin", "rb") as f:  # 二进制模式适合任意文件
    while True:
        chunk = f.read(chunk_size)  # 每次读 1MB
        if not chunk:  # 读到空 bytes 表示文件结束
            break
        process(chunk)  # 处理这一块
\`\`\`

**关键点**:
- \`f.read(n)\` 最多读 n 字节,返回 bytes(二进制模式)或 str(文本模式)。 文件末尾再读返回空(\`b''\` 或 \`''\`),这就是循环退出条件。
- \`chunk_size\` 太小(如 1KB)IO 次数多慢;太大(如 100MB)内存占用高。 1MB 左右是常见平衡点。
- 二进制文件(图片、视频、压缩包)必须用 \`rb\`,且**不能按行读**(没有"行"概念)。
- 文本文件可以按行读(更推荐),也可以分块。

## demo 1:分块读取并统计大小

\`\`\`python
def get_size(path, chunk_size=1024 * 1024):
    """流式统计文件大小,不一次性读进内存"""
    total = 0
    with open(path, "rb") as f:  # 二进制模式,bytes 长度就是字节数
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            total += len(chunk)  # 这一块的字节数
    return total

# 实际上 os.path.getsize 更快(读 stat 不读内容)
# 但这个 demo 展示了分块模式,可改造为"边读边校验 hash"
import os
size = get_size("big.bin")
print(f"文件大小: {size} 字节 = {size / 1024 / 1024:.2f} MB")

# 改造:边读边算 MD5(流式哈希,内存恒定)
import hashlib
def md5_of_file(path, chunk_size=8192):
    h = hashlib.md5()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            h.update(chunk)  # 增量更新哈希
    return h.hexdigest()
\`\`\`

**详解**:\`f.read(n)\` 返回的 chunk 长度可能小于 n(文件末尾),用 \`len(chunk)\` 累加得到真实字节数。 \`if not chunk: break\` 是判断 EOF 的标准写法——注意不能用 \`if chunk == b''\`(虽然也对,但 \`not\` 更 Pythonic)。 流式哈希是大文件校验的经典模式:\`hashlib.md5().update(chunk)\` 支持增量更新,内存占用恒定(只有哈希状态),无论文件多大都能算。 \`os.path.getsize\` 是更快的替代(直接读 stat),但流式模式可扩展为"边读边算哈希/边过滤"。

## 五、逐行处理:for line in f

文本文件最佳实践:**逐行迭代**,每行一次处理,内存只占一行。

\`\`\`python
# ✅ 逐行迭代:Python 文件对象本身是迭代器
with open("big.log", encoding="utf-8") as f:
    for line in f:  # 每次 yield 一行(含换行符)
        process(line)
\`\`\`

**关键点**:
- \`for line in f\` 是**惰性迭代**,每次只读一行到内存,不是 \`readlines\` 全加载。
- \`line\` 末尾带 \`\\n\`,要自己 \`line.rstrip()\`(注意别用 \`strip()\`,会去掉行首空格,可能影响缩进敏感的数据)。
- 这是 Python 处理文本大文件的**默认推荐方式**,代码最简洁、内存最省。
- 配合 \`enumerate(f)\` 还能拿到行号。

## demo 2:逐行统计日志

\`\`\`python
from collections import Counter

def analyze_log(path):
    """逐行分析 nginx 日志,统计各 HTTP 状态码出现次数"""
    status_counter = Counter()
    line_count = 0

    with open(path, encoding="utf-8", errors="replace") as f:
        # errors='replace':遇到非法字节用 � 替换,避免崩溃
        for line in f:
            line_count += 1
            # 假设日志格式:... "GET / HTTP/1.1" 200 ...
            parts = line.split()
            if len(parts) >= 9:
                try:
                    status = int(parts[8])  # 第 9 段是状态码
                    status_counter[status] += 1
                except ValueError:
                    pass  # 状态码不是数字,跳过

    print(f"总行数: {line_count}")
    for status, count in status_counter.most_common():
        print(f"  {status}: {count} 次")

analyze_log("access.log")
# 总行数: 12345678
#   200: 11000000 次
#   404: 800000 次
#   500: 50000 次
\`\`\`

**详解**:\`for line in f\` 逐行读,内存只占一行,即使文件 100GB 也不会爆。 \`errors='replace'\` 处理日志里的非法 UTF-8 字节(常见于攻击请求里塞了乱码),避免 \`UnicodeDecodeError\` 中断整个处理。 \`Counter\` 统计频率,\`most_common()\` 按次数排序输出。 整个过程**内存恒定**(只保留 Counter 和当前行),却能处理几十 G 的日志。

## 六、生成器:yield 实现流式管道

生成器是处理大文件的**终极武器**。 用 \`yield\` 把"读一行、处理一行"封装成生成器函数,多个生成器串起来就是**管道(pipeline)**——像 Unix 的 \`cat | grep | wc\` 一样,数据在管道里流动,每个阶段只处理当前数据。

\`\`\`python
def read_lines(path):
    """生成器:逐行产出文件内容"""
    with open(path, encoding="utf-8") as f:
        for line in f:
            yield line  # 每次产出一行,暂停在这里

def parse_log(lines):
    """生成器:把每行解析成结构化数据"""
    for line in lines:
        parts = line.split()
        if len(parts) >= 9:
            yield {
                "ip": parts[0],
                "status": int(parts[8]),
                "path": parts[6],
            }

def filter_errors(records):
    """生成器:只保留错误状态码(4xx/5xx)"""
    for r in records:
        if r["status"] >= 400:
            yield r

# 串联三个生成器:数据流式通过,内存只占一份
lines = read_lines("access.log")       # 产出原始行
records = parse_log(lines)             # 产出解析后的 dict
errors = filter_errors(records)        # 产出过滤后的错误记录

for err in errors:
    print(err["ip"], err["status"], err["path"])
\`\`\`

**详解**:每个生成器函数用 \`yield\` 产出数据,**调用时返回生成器对象但不立即执行**——直到 \`for\` 循环去 \`next\` 它才执行到下一个 \`yield\`。 三个生成器串联后,\`for err in errors\` 触发整条管道:read_lines 读一行 → parse_log 解析 → filter_errors 过滤 → 输出。 **整条管道内存只占当前处理的那一条数据**,即使文件几亿行也只占几 KB。 这就是流式管道的威力——把"读、解析、过滤、输出"解耦成独立阶段,自由组合。

## demo 3:生成器处理 CSV

\`\`\`python
import csv

def read_csv(path):
    """生成器:逐行读 CSV,产出 dict"""
    with open(path, encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            yield row  # 每行一个 dict

def filter_active(users):
    """生成器:只保留 active 用户"""
    for u in users:
        if u["status"] == "active":
            yield u

def extract_names(users):
    """生成器:只取 name 字段"""
    for u in users:
        yield u["name"]

# 串联管道:读 CSV → 过滤 → 取名 → 收集成 list
# 但因为是生成器,数据是流式处理的,内存友好
users = read_csv("users.csv")          # 大 CSV
active = filter_active(users)          # 过滤活跃用户
names = extract_names(active)          # 提取名字

# 消费管道
for name in names:
    print(name)

# 或者收集成 list(注意:如果结果也很大,不要 collect,继续流式处理)
# all_names = list(names)  # 会把整个结果加载进内存
\`\`\`

**详解**:CSV 读取用 \`csv.DictReader\`,它本身是迭代器,逐行产出 dict,天然适合生成器管道。 三个生成器串联后,\`for name in names\` 触发链式处理:读一行 → 判断 active → 取 name → 输出。 **关键**:不要中途用 \`list()\` 收集,否则就失去流式优势了。 如果要分批处理,用 \`itertools.islice\` 取一批处理一批。 生成器的精髓是**惰性求值**——用到才算,不用不算,内存永远只占当前一份。

## demo 4:多生成器串联(管道式)

\`\`\`python
from itertools import islice

# 复杂管道:大日志 → 解析 → 过滤 5xx → 统计每分钟错误数
def read_lines(path):
    with open(path, encoding="utf-8", errors="replace") as f:
        yield from f  # yield from:委托给另一个迭代器

def parse(lines):
    for line in lines:
        parts = line.split()
        if len(parts) >= 9:
            try:
                yield {"ip": parts[0], "time": parts[3],
                       "status": int(parts[8]), "path": parts[6]}
            except (ValueError, IndexError):
                continue  # 跳过格式异常的行

def filter_5xx(records):
    for r in records:
        if 500 <= r["status"] < 600:
            yield r

def count_by_minute(errors):
    """统计每分钟错误数"""
    from collections import Counter
    counter = Counter()
    for e in errors:
        # 假设 time 格式 [15/Nov/2023:10:30:45,截取到分钟
        minute = e["time"][1:18]  # 15/Nov/2023:10:30
        counter[minute] += 1
    return counter  # 最后聚合(结果通常不大,可以 collect)

# 组装管道
pipeline = filter_5xx(parse(read_lines("access.log")))
result = count_by_minute(pipeline)
for minute, count in result.most_common(10):
    print(f"{minute}: {count} 次错误")
\`\`\`

**详解**:\`yield from iterable\` 是 \`for x in iterable: yield x\` 的简写,把另一个迭代器的元素逐个 yield 出来,常用于"委托"模式。 这个管道四层串联:读行 → 解析 → 过滤 5xx → 按分钟统计。 前 3 层都是流式,只有最后的 \`count_by_minute\` 需要聚合(因为要算总数,必须看完所有数据)——但聚合结果(每分钟的计数)通常很小,可以 collect。 这是流式处理的典型模式:**中间阶段全流式,只在必要时聚合**。

## demo 5:进度反馈

处理大文件时,没有进度反馈会让用户以为程序卡死了。 用 \`os.path.getsize\` 拿总大小,边读边算进度。

\`\`\`python
import os
import sys

def process_with_progress(path, chunk_size=1024 * 1024):
    """分块读取并显示进度条"""
    total = os.path.getsize(path)  # 总字节数
    done = 0

    with open(path, "rb") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break

            # 处理这一块(这里只是计数,实际做你的业务)
            done += len(chunk)

            # 显示进度条(\\r 回到行首覆盖)
            percent = done * 100 // total
            bar_len = 30
            filled = bar_len * percent // 100
            bar = "█" * filled + "-" * (bar_len - filled)
            sys.stdout.write(f"\\r[{bar}] {percent}% ({done}/{total})")
            sys.stdout.flush()  # 立即刷新输出

    print()  # 进度条后换行

process_with_progress("big.bin")
# [████████████████████------------] 53% (5300000/10000000)
\`\`\`

**详解**:\`os.path.getsize\` 读 stat 拿总大小(不读内容,很快)。 \`\\r\` 是回车符,让光标回到行首,下次输出会覆盖上一行,实现"原地更新"的进度条。 \`sys.stdout.flush()\` 强制立即输出,否则可能被缓冲,看不到实时进度。 实际项目用 \`tqdm\` 库(\`pip install tqdm\`)更省事——\`for chunk in tqdm(f, total=size)\` 自动进度条,还支持多进程。 逐行处理也能算进度:\`enumerate(f)\` 拿行号,但行长度不均,按字节算更准。

## demo 6:大文件复制

\`\`\`python
import os

def copy_large(src, dst, chunk_size=1024 * 1024):
    """流式复制大文件,内存恒定 1MB"""
    total = os.path.getsize(src)
    copied = 0

    with open(src, "rb") as fin, open(dst, "wb") as fout:
        while True:
            chunk = fin.read(chunk_size)
            if not chunk:
                break
            fout.write(chunk)  # 写入目标
            fout.flush()  # 可选:立即写盘(影响速度)
            copied += len(chunk)
            print(f"\\r复制进度: {copied*100//total}%", end="", flush=True)
    print("\\n复制完成")

# 实际开发推荐 shutil.copyfileobj(fin, fout, length=chunk_size)
# 它就是分块复制的标准实现
import shutil
with open("big.bin", "rb") as fin, open("copy.bin", "wb") as fout:
    shutil.copyfileobj(fin, fout, length=1024 * 1024)
\`\`\`

**详解**:大文件复制必须分块,不能 \`dst.write(src.read())\`(会把整个文件读进内存)。 \`fout.flush()\` 强制把缓冲区写盘,但频繁 flush 会拖慢速度,默认靠 OS 缓冲即可。 **实际上 \`shutil.copyfileobj\` 已经是分块复制**,直接用就行,不用自己写。 还要注意:\`shutil.copy2\` 会同时复制元数据(mtime 等),适合备份;纯复制内容用 \`copyfile\`/\`copyfileobj\`。

## demo 7:逐行过滤写入

\`\`\`python
def filter_large_file(src, dst, keyword):
    """从大文件中筛选含 keyword 的行,写入新文件"""
    matched = 0
    total = 0

    with open(src, encoding="utf-8", errors="replace") as fin, \\
         open(dst, "w", encoding="utf-8") as fout:

        for line in fin:  # 逐行读,内存恒定
            total += 1
            if keyword in line:
                fout.write(line)  # 匹配则写入新文件
                matched += 1

    print(f"扫描 {total} 行,匹配 {matched} 行,写入 {dst}")

# 实战:从 50GB 日志里提取所有 ERROR 行
filter_large_file("app.log", "errors.log", "ERROR")
# 扫描 12345678 行,匹配 12345 行,写入 errors.log
\`\`\`

**详解**:同时打开输入和输出文件,\`for line in fin\` 逐行读,\`fout.write(line)\` 逐行写,内存只占一行。 这是日志分析的常用模式:从超大日志里捞感兴趣的行(含 "ERROR" 的、某个用户的、某段时间的)。 \`\\\\\` 是行续行符,让长 with 语句换行写更易读。 注意输出文件用 \`w\` 模式会覆盖,如果想追加用 \`a\`。 这种"边读边写"模式让 50GB 文件处理只需几 MB 内存,是流式处理的精髓。

## 七、大文件处理三条原则

**1. 内存与文件大小无关**
不管文件 1MB 还是 100GB,内存占用只取决于"单次处理单元"——一行、一块、一条记录。 用 \`for line in f\` 或 \`read(chunk)\`,内存恒定。

**2. 边读边处理,不要全加载**
\`read()\` / \`readlines()\` / \`json.load()\` 大文件都危险。 改成 \`for line in f\` / 分块 / 生成器管道,数据流式通过。

**3. 中间结果也用生成器,最后才聚合**
管道中间阶段全用 \`yield\`,保持流式;只在"必须看完全部才能算"时聚合(如统计总数、排序)。 排序是大文件的大坑(要全加载),尽量用外部排序(\`sort\` 命令)或分批处理。

## 八、小结

- 大文件核心思想:**流式处理**,内存占用与文件大小无关
- 分块读取:\`f.read(chunk_size)\` + while 循环,适合二进制文件
- 逐行迭代:\`for line in f\`,文本文件首选,最简洁
- 生成器 \`yield\` 实现流式管道:读 → 解析 → 过滤 → 输出,内存恒定
- \`yield from\` 委托另一个迭代器,简化嵌套生成器
- 进度反馈:\`os.path.getsize\` 拿总量 + \`\\r\` 覆盖输出,或用 tqdm
- 大文件复制用 \`shutil.copyfileobj\`(分块)或 \`shutil.copy2\`(带元数据)
- 三原则:内存恒定、边读边处理、中间流式最后聚合
`,
  },
];
