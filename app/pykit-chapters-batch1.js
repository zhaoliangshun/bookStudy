// =============================================================
// Python 开发常用知识点（pykit）—— 第一批章节
// -------------------------------------------------------------
// 聚焦日常开发最高频使用的 Python 知识点，总结性 + 实用 demo。
// 每行代码都有中文注释，demo 可直接运行（仅标准库）。
// 本批主题：字符串与文本处理（共 5 章）
//   1. pykit-01 📝 字符串基础与常用方法
//   2. pykit-02 🔍 正则表达式实战
//   3. pykit-03 ✂️ 字符串格式化详解
//   4. pykit-04 📋 文本处理技巧
//   5. pykit-05 🔐 编码与解码
// 转义规则：content 内部反引号写作 \`，\${ 写作 \$\{。
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：字符串基础与常用方法
  // =========================================================
  {
    id: "pykit-01",
    group: "字符串与文本处理",
    icon: "📝",
    title: "字符串基础与常用方法",
    content: `## 字符串基础与常用方法

**字符串**是 Python 中最常用的数据类型之一，几乎每个程序都离不开它：解析用户输入、拼接日志、处理配置、清洗数据。Python 的字符串功能非常丰富，标准库直接提供了几十个内置方法。本章把日常开发最高频的字符串操作集中讲清楚，让你写代码时不再反复查文档。

### 一、字符串的本质

Python 中字符串是**不可变（immutable）的 Unicode 字符序列**。这意味着：

- 任何"修改"字符串的操作（\`replace\`、\`strip\`、\`upper\` 等）都是**返回一个新字符串**，原字符串不变。
- 字符串支持**索引**和**切片**，和列表一样。
- 字符串是**可迭代**的，可以用 \`for ch in s\` 逐字符遍历。

\`\`\`python
s = "Python"                # 定义字符串
print(s[0])                 # 索引取字符: P
print(s[-1])                # 负索引从右数: n
print(s[0:3])               # 切片: Pyt
print(s[::-1])              # 反转: nohtyP
for ch in s:                # 遍历每个字符
    print(ch, end=" ")      # P y t h o n
\`\`\`

#### 单引号、双引号、三引号

| 写法 | 适用场景 | 示例 |
| --- | --- | --- |
| 单引号 \`'...'\` | 简短字符串，不含单引号 | \`'hello'\` |
| 双引号 \`"..."\` | 字符串内含单引号 | \`"it's ok"\` |
| 三引号 \`'''...'''\` 或 \`"""..."""\` | 多行字符串、文档字符串 | \`"""多行\\n文本"""\` |

三引号会保留字符串内部的换行，常用于函数文档字符串（docstring）和大段文本。

### 二、字符串拼接的 4 种方式

拼接是最高频的操作，Python 提供了 4 种主流方式，性能和可读性各异。

#### 方式 1：\`+\` 运算符

\`\`\`python
s = "Hello" + ", " + "World"     # 用 + 拼接
\`\`\`

\`+\` 拼接**每次都会创建新字符串**，在循环里大量拼接性能很差（O(n²)）。因为字符串不可变，\`a + b\` 要把 a 和 b 复制到一块新内存。

#### 方式 2：\`str.join()\`（推荐）

\`\`\`python
parts = ["Hello", ",", "World"]
s = "".join(parts)               # 用空串连接: Hello,World
s = " ".join(parts)              # 用空格连接: Hello , World
s = "-".join(["2024", "01", "01"])  # 2024-01-01
\`\`\`

\`join\` 是**最高效**的拼接方式，内部一次性分配内存。拼接列表里的多个字符串时，**永远首选 join**。

#### 方式 3：f-string（Python 3.6+，推荐）

\`\`\`python
name = "Alice"
age = 30
s = f"{name} 今年 {age} 岁"      # Alice 今年 30 岁
\`\`\`

f-string 既直观又快，是嵌入变量的首选。后面格式化章节会详细讲。

#### 方式 4：\`str.format()\`

\`\`\`python
s = "{} 今年 {} 岁".format("Alice", 30)       # 按位置
s = "{name} 今年 {age} 岁".format(name="Alice", age=30)  # 按名称
\`\`\`

\`format\` 是 f-string 出现前的主流方式，现在主要用于把模板存在变量里、运行时再填充的场景。

#### 性能对比

| 方式 | 拼接 10000 次耗时 | 适用场景 |
| --- | --- | --- |
| \`+\` 在循环中 | 慢（约 50ms） | 少量拼接 |
| \`"".join(list)\` | 极快（约 0.5ms） | 批量拼接列表 |
| f-string | 快 | 嵌入变量 |
| \`format\` | 较快 | 模板延迟填充 |

**经验法则**：少量变量用 f-string；批量拼接列表用 join；不要在循环里用 \`+\`。

### 三、字符串分割：split / partition

#### \`split(sep, maxsplit)\`

按分隔符把字符串切成列表。

\`\`\`python
"a,b,c,d".split(",")            # ['a', 'b', 'c', 'd']
"2024-01-01".split("-", 1)      # ['2024', '01-01']（只切 1 次）
"  hello   world  ".split()     # ['hello', 'world']（无参：按任意空白切，去空）
\`\`\`

**重点**：\`split()\` 不带参数时会**自动合并连续空白并去除首尾空白**，这是清洗用户输入的利器。

#### \`rsplit()\` 从右往左切

\`\`\`python
"path/to/file.txt".rsplit("/", 1)   # ['path/to', 'file.txt']
\`\`\`

#### \`partition(sep)\` 三元分割

把字符串分成 \`(前半, 分隔符, 后半)\` 三部分，总返回 3 个元素。

\`\`\`python
"key=value".partition("=")      # ('key', '=', 'value')
"nosep".partition("=")          # ('nosep', '', '')
\`\`\`

\`partition\` 特别适合"键值对"解析，即使没有分隔符也不会报错。

#### \`splitlines()\` 按行分割

\`\`\`python
"line1\\nline2\\nline3".splitlines()   # ['line1', 'line2', 'line3']
"a\\nb\\nc".splitlines(keepends=True)  # ['a\\n', 'b\\n', 'c']（保留换行符）
\`\`\`

\`splitlines\` 能识别 \`\\n\`、\`\\r\`、\`\\r\\n\` 等各种换行符，跨平台处理文本文件很方便。

### 四、字符串查找：find / index / count

| 方法 | 找不到时 | 返回值 |
| --- | --- | --- |
| \`s.find(sub)\` | 返回 \`-1\` | 子串首次出现的下标 |
| \`s.index(sub)\` | 抛 \`ValueError\` | 子串首次出现的下标 |
| \`s.count(sub)\` | 返回 \`0\` | 子串出现次数 |
| \`s.rfind(sub)\` | 返回 \`-1\` | 从右往左找的下标 |

\`\`\`python
"hello world".find("world")     # 6
"hello world".find("xyz")       # -1
"hello world".index("world")    # 6
"hello world".count("l")        # 3
"hello world".rfind("o")        # 7
\`\`\`

**选择建议**：不确定子串是否存在时用 \`find\`（返回 -1 好处理）；确定存在时用 \`index\`（找不到直接报错，能尽早暴露 bug）。

还可以用 \`in\` 运算符做存在性判断，最简洁：

\`\`\`python
"world" in "hello world"        # True
\`\`\`

### 五、字符串替换：replace / translate

#### \`replace(old, new, count)\`

\`\`\`python
"a-b-c".replace("-", "+")       # a+b+c
"a-b-c".replace("-", "+", 1)    # a+b-c（只替换 1 次）
\`\`\`

#### \`translate(table)\` 批量字符替换

\`translate\` 用一张映射表**一次性替换多个字符**，比多次 \`replace\` 高效。映射表用 \`str.maketrans\` 生成。

\`\`\`python
table = str.maketrans("aeiou", "12345")   # a→1 e→2 i→3 o→4 u→5
"hello world".translate(table)            # h2ll4 w4rld
# 删除字符：第三参数是"要删除的字符"串
table2 = str.maketrans("", "", "aeiou")   # 只删不替换
"hello world".translate(table2)           # hll wrld
\`\`\`

\`translate\` 适合做"过滤敏感字符""大小写归一化前的去标点"等场景。

### 六、字符串判断：isxxx 系列

判断字符串是否满足某种特征，返回布尔值。

| 方法 | 判断内容 | 示例 True |
| --- | --- | --- |
| \`isdigit()\` | 全是数字（0-9 及 Unicode 数字） | \`"123".isdigit()\` |
| \`isalpha()\` | 全是字母 | \`"abc".isalpha()\` |
| \`isalnum()\` | 全是字母或数字 | \`"a1".isalnum()\` |
| \`isspace()\` | 全是空白（空格/制表/换行） | \`" \\t\\n".isspace()\` |
| \`isupper()\` | 全是大写字母 | \`"ABC".isupper()\` |
| \`islower()\` | 全是小写字母 | \`"abc".islower()\` |
| \`istitle()\` | 每个单词首字母大写 | \`"Hello World".istitle()\` |
| \`isnumeric()\` | 全是数值字符（含中文数字） | \`"壹贰叁".isnumeric()\` |

**注意坑**：\`isdigit()\`、\`isnumeric()\`、\`isdecimal()\` 三者对 Unicode 字符的判断范围不同。判断"能否转成 int"用 \`str.isdecimal()\` 最严格。

\`\`\`python
"123".isdigit()         # True
"12.3".isdigit()        # False（有小数点）
"abc123".isalnum()      # True
"  ".isspace()          # True
\`\`\`

### 七、去空白：strip / lstrip / rstrip

\`\`\`python
"  hello  ".strip()     # 'hello'（去两端空白）
"  hello  ".lstrip()    # 'hello  '（去左端）
"  hello  ".rstrip()    # '  hello'（去右端）
\`\`\`

\`strip\` 还能指定要去除的字符集合（顺序无关，去除两端所有这些字符）：

\`\`\`python
"###hello###".strip("#")    # 'hello'
"\\n\\thello\\n".strip()      # 'hello'（\\n \\t 都算空白）
"abcHELLOabc".strip("abc")  # 'HELLO'（去掉两端的 a/b/c）
\`\`\`

**清洗用户输入的标配**：\`input().strip()\` 去掉前后多余空白。

### 八、前缀后缀判断：startswith / endswith

\`\`\`python
"hello.jpg".endswith(".jpg")          # True
"hello.jpg".endswith((".jpg", ".png"))# True（传元组，任一匹配即可）
"https://x".startswith("https://")    # True
\`\`\`

\`endswith\` 传**元组**判断多种后缀，是判断文件类型的常用技巧，比 \`s[-4:] == ".jpg"\` 更清晰、更安全。

### 九、大小写转换

| 方法 | 作用 | 示例 |
| --- | --- | --- |
| \`upper()\` | 全转大写 | \`"ab".upper()\` → \`"AB"\` |
| \`lower()\` | 全转小写 | \`"AB".lower()\` → \`"ab"\` |
| \`title()\` | 每词首字母大写 | \`"hi tom".title()\` → \`"Hi Tom"\` |
| \`capitalize()\` | 句首大写 | \`"hi".capitalize()\` → \`"Hi"\` |
| \`swapcase()\` | 大小写互换 | \`"Hi".swapcase()\` → \`"hI"\` |

**比较用户输入时统一转小写**，避免大小写差异导致匹配失败。

### 十、实战 demo 说明

下面这段代码演示一个真实场景：从用户提交的 CSV 行中解析字段、清洗数据（去空白、统一大小写、过滤无效行）。这是日常后端处理表单数据、ETL 清洗的典型套路。`,
    code: `# === 字符串基础与常用方法 demo ===
# 每行代码都有注释，可直接 python3 运行
# 演示：CSV 行解析 + 用户输入清洗

# ---- 1. 字符串拼接的 4 种方式 ----
print("===== 1. 字符串拼接 4 种方式 =====")
parts = ["Python", "开发", "常用"]          # 定义一个字符串列表
s_join = "".join(parts)                     # 用 join 拼接（最高效）
print("join:", s_join)                      # 输出 join 结果
s_plus = "Hello" + ", " + "World"           # 用 + 拼接
print("plus:", s_plus)                      # 输出 + 拼接结果
name, age = "Alice", 30                     # 定义变量供 f-string 使用
s_f = f"{name} 今年 {age} 岁"               # f-string 嵌入变量
print("f-string:", s_f)                     # 输出 f-string 结果
s_fmt = "{} 今年 {} 岁".format("Bob", 25)   # format 方法按位置填充
print("format:", s_fmt)                     # 输出 format 结果

# ---- 2. split / partition 分割 ----
print("\\n===== 2. split / partition =====")
csv_line = "  Alice , 30 ,  beijing  "       # 模拟带空白的 CSV 行
fields = csv_line.split(",")                # 按逗号分割成列表
print("split:", fields)                     # 输出分割结果（含空白）
cleaned = [f.strip() for f in fields]       # 列表推导：每个字段去空白
print("清洗后:", cleaned)                    # 输出去空白后的字段
kv = "name=Alice".partition("=")            # 三元分割键值对
print("partition:", kv)                     # 输出 (key, =, value)
path = "/home/user/file.txt".rsplit("/", 1) # 从右切 1 次，分离目录和文件名
print("rsplit:", path)                      # 输出 ['目录', '文件名']

# ---- 3. find / index / count 查找 ----
print("\\n===== 3. find / index / count =====")
text = "hello world, hello python"          # 待查找的文本
pos = text.find("hello")                    # 从左找 hello 的位置
print("find hello:", pos)                   # 输出首次出现下标
pos2 = text.rfind("hello")                  # 从右找 hello 的位置
print("rfind hello:", pos2)                 # 输出最后出现下标
cnt = text.count("hello")                   # 统计 hello 出现次数
print("count hello:", cnt)                  # 输出次数
print("world in text:", "world" in text)    # in 判断是否存在

# ---- 4. replace / translate 替换 ----
print("\\n===== 4. replace / translate =====")
r1 = "a-b-c".replace("-", "+")             # 把所有 - 替换成 +
print("replace 全部:", r1)                  # 输出 a+b+c
r2 = "a-b-c".replace("-", "+", 1)          # 只替换第 1 个 -
print("replace 1 次:", r2)                  # 输出 a+b-c
table = str.maketrans("aeiou", "12345")    # 构造 a→1 e→2 ... 映射表
r3 = "hello world".translate(table)         # 一次性替换多个字符
print("translate:", r3)                     # 输出 h2ll4 w4rld
del_table = str.maketrans("", "", "aeiou")  # 构造"删除元音"映射表
r4 = "hello world".translate(del_table)     # 删除所有元音字母
print("删元音:", r4)                         # 输出 hll wrld

# ---- 5. isxxx 判断 ----
print("\\n===== 5. isxxx 判断 =====")
print("'123'.isdigit():", "123".isdigit())          # 判断是否全数字
print("'12.3'.isdigit():", "12.3".isdigit())        # 含小数点非全数字
print("'abc123'.isalnum():", "abc123".isalnum())    # 判断是否字母或数字
print("'  '.isspace():", "  ".isspace())            # 判断是否全空白
print("'ABC'.isupper():", "ABC".isupper())          # 判断是否全大写

# ---- 6. strip / startswith / endswith ----
print("\\n===== 6. strip / startswith / endswith =====")
user_input = "   hello.jpg   "               # 模拟用户输入的首尾空白
clean = user_input.strip()                   # 去掉首尾空白
print("strip 后:", repr(clean))              # 用 repr 显示引号边界
print("是图片吗:", clean.endswith((".jpg", ".png")))  # 判断是否图片后缀
url = "https://example.com"                  # 定义一个 URL
print("是 https 吗:", url.startswith("https://"))    # 判断 https 前缀

# ---- 7. 实战：CSV 行解析 + 用户输入清洗 ----
print("\\n===== 7. 实战：CSV 解析与输入清洗 =====")
raw_rows = [                                 # 模拟从文件读到的若干 CSV 行
    "  Alice , 30 ,  Beijing  ",
    "bob,25,shanghai",
    "  , ,  ",                               # 无效行（全空白字段）
    "Charlie ,  ,  Guangzhou",               # 缺失年龄
]
valid_records = []                           # 收集清洗后的有效记录
for idx, line in enumerate(raw_rows):        # 逐行处理
    line = line.strip()                      # 先去掉整行首尾空白
    if not line:                             # 空行直接跳过
        print(f"  行{idx}: 空行，跳过")
        continue                             # 继续下一行
    fields = [f.strip() for f in line.split(",")]  # 分割并清洗每个字段
    name, age_str, city = fields[0], fields[1], fields[2]  # 解包三个字段
    if not name:                             # 名字为空视为无效
        print(f"  行{idx}: 名字为空，跳过")
        continue                             # 跳过无效行
    if not age_str.isdigit():                # 年龄不是数字则置为 None
        age = None                           # 标记年龄缺失
    else:                                    # 否则
        age = int(age_str)                   # 把年龄转成整数
    city = city.title()                      # 城市名首字母大写归一化
    valid_records.append((name, age, city))  # 加入有效记录列表
    print(f"  行{idx}: name={name}, age={age}, city={city}")  # 输出该行结果

print("\\n有效记录汇总:")                     # 汇总输出
for rec in valid_records:                    # 遍历有效记录
    print("  ", rec)                         # 打印每条记录

# ---- 8. 性能对比：join vs + 循环 ----
print("\\n===== 8. 性能对比：join vs + 循环 =====")
import time                                   # 导入时间模块
n = 50000                                     # 拼接次数
t0 = time.perf_counter()                      # 记录开始时间
s = ""                                        # 初始空串
for i in range(n):                            # 循环用 + 拼接
    s = s + "x"                               # 每次都创建新串（慢）
t1 = time.perf_counter()                      # 记录结束时间
print(f"+ 循环 {n} 次: {t1 - t0:.4f} 秒")     # 输出 + 拼接耗时
t0 = time.perf_counter()                      # 再次记录开始时间
s = "".join(["x"] * n)                        # 用 join 一次拼接
t1 = time.perf_counter()                      # 记录结束时间
print(f"join {n} 次: {t1 - t0:.4f} 秒")       # 输出 join 耗时
print("结论：批量拼接永远首选 join")            # 输出结论
`,
  },

  // =========================================================
  // 第二章：正则表达式实战
  // =========================================================
  {
    id: "pykit-02",
    group: "字符串与文本处理",
    icon: "🔍",
    title: "正则表达式实战",
    content: `## 正则表达式实战

**正则表达式（Regular Expression，regex）** 是描述字符串模式的小型语言。当你需要"从一段文本里提取所有邮箱""验证手机号格式""把所有 \`<a>\` 标签的链接拿出来"时，普通字符串方法会力不从心，而正则能一行搞定。Python 标准库 \`re\` 模块提供了完整的正则支持。本章聚焦实战中最常用的 API 和模式。

### 一、正则的基础语法速查

| 语法 | 含义 | 示例 |
| --- | --- | --- |
| \`.\` | 任意字符（除换行） | \`a.c\` → abc/axc |
| \`\\d\` | 数字 0-9 | \`\\d{3}\` → 123 |
| \`\\D\` | 非数字 | \`\\D\` → a |
| \`\\w\` | 字母数字下划线 | \`\\w+\` → hello_1 |
| \`\\W\` | 非字母数字下划线 | \`\\W\` → 空格 |
| \`\\s\` | 空白字符 | \`\\s\` → 空格/制表 |
| \`\\S\` | 非空白 | \`\\S\` → a |
| \`^\` | 字符串开头 | \`^Hello\` |
| \`$\` | 字符串结尾 | \`world$\` |
| \`*\` | 0 次或多次 | \`a*\` |
| \`+\` | 1 次或多次 | \`a+\` |
| \`?\` | 0 次或 1 次 | \`a?\` |
| \`{m,n}\` | m 到 n 次 | \`\\d{2,4}\` |
| \`[...]\` | 字符集合 | \`[aeiou]\` |
| \`[^...]\` | 取反集合 | \`[^0-9]\` |
| \`(...)\` | 捕获分组 | \`(ab)+\` |
| \`(?:...)\` | 非捕获分组 | \`(?:ab)+\` |
| \`(?P<name>...)\` | 命名分组 | \`(?P<year>\\d{4})\` |
| \`a|b\` | a 或 b | \`cat|dog\` |

**Python 中转义**：正则里反斜杠多，写模式时建议用**原始字符串** \`r"\\d+"\`，避免 \`\\\\d\` 这种双重转义地狱。

### 二、re 的三大匹配函数

#### \`re.search(pattern, string)\` —— 搜索第一个匹配

在字符串中**任意位置**搜索第一个匹配，找到返回 \`Match\` 对象，没找到返回 \`None\`。

\`\`\`python
import re
m = re.search(r"\\d{4}", "订单号 2024 年提交")   # 搜索 4 位数字
print(m.group())   # 2024
\`\`\`

#### \`re.match(pattern, string)\` —— 从开头匹配

只从**字符串开头**匹配，开头不匹配就返回 \`None\`。

\`\`\`python
re.match(r"Hello", "Hello world")   # 匹配
re.match(r"world", "Hello world")   # None（开头不是 world）
\`\`\`

#### \`re.fullmatch(pattern, string)\` —— 完整匹配

要求**整个字符串**完全匹配，常用于格式校验。

\`\`\`python
re.fullmatch(r"\\d{11}", "13800138000")   # 匹配（11 位手机号）
re.fullmatch(r"\\d{11}", "1380013800")    # None（只有 10 位）
\`\`\`

#### 三者区别

| 函数 | 匹配位置 | 是否要求匹配到结尾 |
| --- | --- | --- |
| \`search\` | 任意位置 | 否 |
| \`match\` | 必须开头 | 否 |
| \`fullmatch\` | 必须开头 | 必须结尾 |

### 三、提取所有匹配：findall / finditer

#### \`re.findall(pattern, string)\` —— 返回字符串列表

\`\`\`python
re.findall(r"\\d+", "a1 b22 c333")   # ['1', '22', '333']
\`\`\`

**注意**：当模式有分组时，\`findall\` 只返回分组内容：

\`\`\`python
re.findall(r"(\\d)(\\d)", "12 34")   # [('1','2'), ('3','4')]
\`\`\`

如果不想被分组干扰，用 \`(?:...)\` 非捕获分组。

#### \`re.finditer(pattern, string)\` —— 返回 Match 迭代器

返回每个匹配的 \`Match\` 对象，能拿到匹配的位置信息，适合大文本（节省内存）。

\`\`\`python
for m in re.finditer(r"\\d+", "a1 b22"):
    print(m.group(), m.span())   # 1 (1,2)  22 (4,6)
\`\`\`

### 四、替换：re.sub（含回调函数）

#### 基本替换

\`\`\`python
re.sub(r"\\d+", "#", "a1 b22 c333")   # a# b# c#
re.sub(r"\\d+", "#", "a1 b22", count=1)  # a# b22（只替换 1 次）
\`\`\`

#### 回调函数替换（高级用法）

\`re.sub\` 的第二个参数可以是**函数**，函数接收 \`Match\` 对象，返回替换字符串。这让替换逻辑可以非常灵活。

\`\`\`python
# 把所有数字加 1
def add_one(m):
    return str(int(m.group()) + 1)
re.sub(r"\\d+", add_one, "a1 b22 c333")   # a2 b23 c334
\`\`\`

回调函数常用于：脱敏（手机号中间 4 位变 \`*\`）、单位换算、模板变量填充。

### 五、分割：re.split

\`\`\`python
re.split(r"[,;\\s]+", "a, b; c  d")   # ['a', 'b', 'c', 'd']
re.split(r"(-)", "2024-01-01")        # ['2024', '-', '01', '-', '01']（保留分隔符）
\`\`\`

\`re.split\` 比 \`str.split\` 强在：可以用**多种分隔符**和**正则模式**分割。

### 六、分组与命名分组

#### 普通分组 \`()\`

\`\`\`python
m = re.search(r"(\\d{4})-(\\d{2})-(\\d{2})", "2024-01-15")
m.group(0)   # '2024-01-15'（整个匹配）
m.group(1)   # '2024'（第 1 组）
m.group(2)   # '01'
m.groups()   # ('2024', '01', '15')
\`\`\`

#### 命名分组 \`(?P<name>...)\`

\`\`\`python
m = re.search(r"(?P<year>\\d{4})-(?P<month>\\d{2})", "2024-01")
m.group("year")    # '2024'
m.group("month")   # '01'
m.groupdict()      # {'year': '2024', 'month': '01'}
\`\`\`

命名分组让正则可读性大增，复杂模式强烈推荐用命名分组。

### 七、预编译：re.compile

同个模式要多次使用时，先用 \`re.compile\` 编译，提升性能并复用：

\`\`\`python
date_re = re.compile(r"\\d{4}-\\d{2}-\\d{2}")
date_re.search("日期 2024-01-15")
date_re.findall("2024-01-15 和 2024-02-20")
\`\`\`

### 八、常用正则模式

| 场景 | 模式 |
| --- | --- |
| 邮箱 | \`r"[\\w.+-]+@[\\w-]+\\.[\\w.-]+"\` |
| 手机号（中国） | \`r"1[3-9]\\d{9}"\` |
| URL | \`r"https?://[\\w./?-]+"\` |
| IPv4 | \`r"(?:\\d{1,3}\\.){3}\\d{1,3}"\` |
| 日期 | \`r"\\d{4}-\\d{2}-\\d{2}"\` |
| 身份证号 | \`r"\\d{17}[\\dXx]"\` |
| 邮编 | \`r"\\d{6}"\` |

**生产提示**：邮箱的"完美正则"非常复杂（RFC 5322），上面这个够用于 99% 的实际场景。严格校验请用专用库。

### 九、实战 demo 说明

下面代码演示两个真实场景：(1) 从一段 HTML 中提取所有超链接的 URL 和文字；(2) 解析 Nginx 风格的访问日志行，提取 IP、时间、路径、状态码。这是爬虫和日志分析的基础技能。`,
    code: `# === 正则表达式实战 demo ===
# 每行代码都有注释，可直接 python3 运行
# 演示：从 HTML 提取链接、解析日志行

import re                                     # 导入正则模块

# ---- 1. search / match / fullmatch 区别 ----
print("===== 1. search / match / fullmatch =====")
text = "订单号 2024 年提交"                   # 待匹配文本
m = re.search(r"\\d{4}", text)                # 任意位置搜 4 位数字
print("search:", m.group() if m else None)    # 输出 2024
m = re.match(r"订单号", text)                 # 从开头匹配"订单号"
print("match 开头:", m.group() if m else None)  # 输出 订单号
m = re.fullmatch(r"\\d{11}", "13800138000")   # 完整匹配 11 位手机号
print("fullmatch 手机号:", bool(m))           # 输出 True

# ---- 2. findall / finditer 提取所有 ----
print("\\n===== 2. findall / finditer =====")
nums = re.findall(r"\\d+", "a1 b22 c333")     # 找所有连续数字
print("findall:", nums)                       # 输出 ['1','22','333']
for mm in re.finditer(r"\\d+", "a1 b22"):     # 迭代每个匹配对象
    print("  匹配:", mm.group(), "位置:", mm.span())  # 输出内容和下标范围

# ---- 3. re.sub 替换（含回调）----
print("\\n===== 3. re.sub 替换 =====")
r = re.sub(r"\\d+", "#", "a1 b22 c333")       # 把数字全替换成 #
print("基本替换:", r)                          # 输出 a# b# c#
def mask_phone(m):                            # 定义脱敏回调函数
    phone = m.group()                         # 取出匹配到的手机号
    return phone[:3] + "****" + phone[7:]     # 中间 4 位替换成 *
masked = re.sub(r"1\\d{10}", mask_phone, "联系 13812345678 或 13987654321")  # 脱敏
print("手机号脱敏:", masked)                    # 输出脱敏后的文本

# ---- 4. re.split 分割 ----
print("\\n===== 4. re.split 分割 =====")
parts = re.split(r"[,;\\s]+", "a, b; c  d")   # 用逗号/分号/空白分割
print("多分隔符分割:", parts)                   # 输出 ['a','b','c','d']

# ---- 5. 分组与命名分组 ----
print("\\n===== 5. 分组与命名分组 =====")
date_str = "2024-01-15"                       # 待解析的日期字符串
m = re.search(r"(?P<year>\\d{4})-(?P<month>\\d{2})-(?P<day>\\d{2})", date_str)  # 命名分组
print("year:", m.group("year"))               # 按名字取 year
print("month:", m.group("month"))             # 按名字取 month
print("groupdict:", m.groupdict())            # 输出全部命名分组字典

# ---- 6. 常用模式校验 ----
print("\\n===== 6. 常用模式校验 =====")
patterns = {                                  # 定义常用正则模式字典
    "邮箱": r"^[\\w.+-]+@[\\w-]+\\.[\\w.-]+$",
    "手机号": r"^1[3-9]\\d{9}$",
    "URL": r"^https?://[\\w./?-]+$",
    "IPv4": r"^(?:\\d{1,3}\\.){3}\\d{1,3}$",
    "日期": r"^\\d{4}-\\d{2}-\\d{2}$",
}
test_cases = [                                # 定义测试用例列表
    ("邮箱", "alice@example.com"),
    ("邮箱", "not-an-email"),
    ("手机号", "13812345678"),
    ("手机号", "12345678901"),                 # 不是 1[3-9] 开头
    ("URL", "https://example.com/path?q=1"),
    ("IPv4", "192.168.1.1"),
    ("日期", "2024-01-15"),
]
for kind, value in test_cases:                # 遍历测试用例
    pat = patterns[kind]                      # 取对应模式
    ok = bool(re.fullmatch(pat, value))       # 完整匹配判断
    print(f"  {kind:6} {value:30} -> {'合法' if ok else '非法'}")  # 输出校验结果

# ---- 7. 实战 1：从 HTML 提取链接 ----
print("\\n===== 7. 实战：从 HTML 提取链接 =====")
html = '''<div>
<a href="https://example.com/page1">第一页</a>
<a href="https://example.com/page2" class="nav">第二页</a>
<a href="/relative/path">相对链接</a>
</div>'''                                    # 模拟一段 HTML
link_re = re.compile(r'<a\\s+[^>]*href="([^"]+)"[^>]*>(.*?)</a>')  # 编译链接正则
links = link_re.findall(html)                # 找所有 (url, 文字)
for url, text in links:                      # 遍历结果
    print(f"  链接: {url:35} 文字: {text}")  # 输出每条链接

# ---- 8. 实战 2：解析日志行 ----
print("\\n===== 8. 实战：解析日志行 =====")
log_lines = [                                # 模拟 Nginx 风格日志
    '192.168.1.10 - - [10/Jan/2024:13:55:36] "GET /api/users HTTP/1.1" 200 1234',
    '10.0.0.5 - - [10/Jan/2024:13:56:01] "POST /api/login HTTP/1.1" 401 89',
    '203.0.113.7 - - [10/Jan/2024:13:57:22] "GET /index.html HTTP/1.1" 404 512',
]
log_re = re.compile(                         # 编译日志解析正则
    r'(?P<ip>\\d+\\.\\d+\\.\\d+\\.\\d+)'     # IP 地址命名组
    r'.*?\\[(?P<time>[^\\]]+)\\]'            # 时间命名组
    r'\\s+"(?P<method>\\w+)\\s+(?P<path>\\S+)'  # 请求方法 + 路径
    r'[^"]*"\\s+(?P<status>\\d+)\\s+(?P<size>\\d+)'  # 状态码 + 字节数
)
for line in log_lines:                       # 逐行解析
    m = log_re.search(line)                  # 在该行中搜索匹配
    if m:                                    # 匹配成功
        d = m.groupdict()                    # 取出命名分组字典
        print(f"  IP={d['ip']:15} {d['method']:5} {d['path']:15} 状态={d['status']}")  # 输出关键字段
    else:                                    # 匹配失败
        print("  无法解析:", line)            # 输出失败行

# ---- 9. 统计日志状态码分布 ----
print("\\n===== 9. 统计状态码分布 =====")
status_count = {}                            # 状态码计数字典
for line in log_lines:                       # 再次遍历日志
    m = log_re.search(line)                  # 解析每行
    if m:                                    # 成功则统计
        st = m.group("status")               # 取状态码
        status_count[st] = status_count.get(st, 0) + 1  # 计数 +1
for st, cnt in sorted(status_count.items()):  # 按状态码排序输出
    print(f"  状态 {st}: {cnt} 次")          # 输出每个状态码次数
print("正则实战 demo 结束")                   # 结束提示
`,
  },

  // =========================================================
  // 第三章：字符串格式化详解
  // =========================================================
  {
    id: "pykit-03",
    group: "字符串与文本处理",
    icon: "✂️",
    title: "字符串格式化详解",
    content: `## 字符串格式化详解

把变量嵌入字符串、把数字按指定小数位/对齐方式显示，是每个 Python 程序员天天做的事。Python 历史上出现了**三种**格式化方式：古老的 \`%\`、中期的 \`str.format()\`、现代的 **f-string**。本章把三者讲透，并重点掌握数字格式化、对齐填充、日期格式化——这些是生成报表和对齐输出的核心技能。

### 一、三种格式化方式概览

| 方式 | 出现版本 | 语法 | 推荐度 |
| --- | --- | --- | --- |
| \`%\` 格式化 | 最早 | \`"%s" % name\` | 仅维护老代码 |
| \`str.format()\` | 3.0 | \`"{}".format(x)\` | 模板需延迟填充时 |
| f-string | 3.6+ | \`f"{x}"\` | **日常首选** |

### 二、% 格式化（老式）

语法：\`"%[flags][width][.precision]type" % value\`

\`\`\`python
"%s 今年 %d 岁" % ("Alice", 30)        # Alice 今年 30 岁
"%.2f" % 3.14159                        # 3.14（保留 2 位小数）
"%05d" % 42                             # 00042（宽度 5 补 0）
"%-10s|" % "hi"                         # hi        |（左对齐宽度 10）
\`\`\`

常用类型码：

| 类型码 | 含义 | 示例 |
| --- | --- | --- |
| \`%s\` | 字符串 | \`"%s" % "hi"\` |
| \`%d\` | 整数 | \`"%d" % 42\` |
| \`%f\` | 浮点数 | \`"%f" % 3.14\` |
| \`%e\` | 科学计数法 | \`"%e" % 12345\` |
| \`%x\` | 十六进制 | \`"%x" % 255\` → ff |
| \`%o\` | 八进制 | \`"%o" % 8\` → 10 |
| \`%%\` | 输出 % 本身 | \`"100%%"\` |

**缺点**：参数多时可读性差，类型不匹配会报错。新代码不推荐。

### 三、str.format() 方法

用 \`{}\` 占位符，\`format\` 方法按顺序或名称填充。

\`\`\`python
"{} {}".format("Hello", "World")              # 按位置
"{0} {1} {0}".format("a", "b")                # 复用位置
"{name} {age}".format(name="Alice", age=30)   # 按名称
"{:>10}".format("hi")                          # 右对齐宽度 10
"{:.2f}".format(3.14159)                       # 保留 2 位小数
\`\`\`

\`format\` 的优势是**占位符可以存在变量里**，运行时再填：

\`\`\`python
template = "{user} 在 {time} 登录"
msg = template.format(user="Alice", time="10:00")
\`\`\`

这种"模板 + 延迟填充"在国际化、配置文件场景很有用，f-string 做不到。

### 四、f-string（现代首选）

f-string 在字符串前加 \`f\`，\`{}\` 内直接写**任意 Python 表达式**。

\`\`\`python
name = "Alice"
age = 30
f"{name} 今年 {age} 岁"               # Alice 今年 30 岁
f"{2 + 3}"                            # 5（可写表达式）
f"{name.upper()}"                     # ALICE（可调用方法）
f"{'Python':>10}"                     #     Python（对齐）
\`\`\`

#### 调试技巧：\`{x=}\`（Python 3.8+）

\`\`\`python
x = 42
print(f"{x=}")                        # x=42（自动显示变量名和值）
\`\`\`

调试时一行就能打印"变量名 = 值"，非常方便。

#### f-string 的格式说明符

语法：\`f"{value:format_spec}"\`，\`format_spec\` 格式为：

\`\`\`
[[fill]align][sign][#][0][width][grouping_option][.precision][type]
\`\`\`

### 五、数字格式化（重点）

| 需求 | 写法 | 示例结果 |
| --- | --- | --- |
| 保留 2 位小数 | \`f"{3.14159:.2f}"\` | \`3.14\` |
| 千分位分隔 | \`f"{1234567:,}"\` | \`1,234,567\` |
| 千分位 + 2 位小数 | \`f"{1234567.89:,.2f}"\` | \`1,234,567.89\` |
| 百分比 | \`f"{0.85:.1%}"\` | \`85.0%\` |
| 科学计数法 | \`f"{123456:.2e}"\` | \`1.23e+05\` |
| 补零 | \`f"{42:05d}"\` | \`00042\` |
| 正负号 | \`f"{42:+d}"\` | \`+42\` |
| 二进制 | \`f"{10:b}"\` | \`1010\` |
| 十六进制 | \`f"{255:x}"\` | \`ff\` |
| 十六进制（带 0x） | \`f"{255:#x}"\` | \`0xff\` |
| 八进制 | \`f"{8:o}"\` | \`10\` |

\`\`\`python
pi = 3.14159265
money = 1234567.891
ratio = 0.857
print(f"π={pi:.3f}")              # π=3.142
print(f"金额={money:,.2f}元")     # 金额=1,234,567.89元
print(f"完成率={ratio:.1%}")      # 完成率=85.7%
\`\`\`

### 六、对齐与填充

语法 \`{value:[fill][align][width]}\`，对齐符：

| 符号 | 含义 |
| --- | --- |
| \`<\` | 左对齐（字符串默认） |
| \`>\` | 右对齐（数字默认） |
| \`^\` | 居中对齐 |

\`\`\`python
f"{'hi':<10}|"     # hi        |（左对齐宽度 10）
f"{'hi':>10}|"     #         hi|（右对齐）
f"{'hi':^10}|"     #     hi    |（居中）
f"{'hi':*^10}|"    # ****hi****|（用 * 填充居中）
f"{42:05d}"        # 00042（数字补 0）
\`\`\`

### 七、日期格式化

f-string 配合 \`strftime\` 格式化日期：

\`\`\`python
from datetime import datetime
now = datetime.now()
now.strftime("%Y-%m-%d %H:%M:%S")    # 2024-01-15 13:55:00
now.strftime("%Y年%m月%d日")          # 2024年01月15日
\`\`\`

常用 strftime 占位符：

| 占位符 | 含义 | 示例 |
| --- | --- | --- |
| \`%Y\` | 4 位年 | 2024 |
| \`%m\` | 月（01-12） | 01 |
| \`%d\` | 日（01-31） | 15 |
| \`%H\` | 时（24h） | 13 |
| \`%M\` | 分 | 55 |
| \`%S\` | 秒 | 00 |
| \`%A\` | 星期全名 | Monday |
| \`%w\` | 星期数字 | 1 |
| \`%j\` | 年内第几天 | 015 |
| \`%U\` | 年内第几周 | 02 |

### 八、三种方式对比

\`\`\`python
name, age = "Alice", 30
# % 方式
"%s 今年 %d 岁" % (name, age)
# format 方式
"{} 今年 {} 岁".format(name, age)
# f-string（最简洁）
f"{name} 今年 {age} 岁"
\`\`\`

**性能**：f-string 最快，\`%\` 次之，\`format\` 最慢。

### 九、实战 demo 说明

下面代码演示生成一份销售报表：把多条销售记录按对齐的表格输出，金额带千分位和小数位，完成率用百分比。这是命令行工具、运维脚本生成报表的典型场景。`,
    code: `# === 字符串格式化详解 demo ===
# 每行代码都有注释，可直接 python3 运行
# 演示：三种格式化方式 + 生成对齐报表

from datetime import datetime              # 导入日期时间模块

# ---- 1. % 格式化（老式）----
print("===== 1. % 格式化 =====")
s = "%s 今年 %d 岁" % ("Alice", 30)        # 用 % 格式化字符串
print(s)                                   # 输出结果
print("保留2位小数: %.2f" % 3.14159)        # 浮点数保留 2 位
print("补零: %05d" % 42)                    # 整数补零到宽度 5
print("左对齐: |%-10s|" % "hi")             # 字符串左对齐宽度 10
print("十六进制: %x" % 255)                 # 输出十六进制 ff
print("百分比: %.1f%%" % 85.7)              # 输出百分比字面量

# ---- 2. str.format() 方法 ----
print("\\n===== 2. str.format() =====")
s = "{} + {} = {}".format(1, 2, 3)         # 按位置填充
print(s)                                   # 输出 1 + 2 = 3
s = "{name} 的年龄是 {age}".format(name="Bob", age=25)  # 按名称填充
print(s)                                   # 输出 Bob 的年龄是 25
template = "{user} 在 {time} 登录"          # 模板存变量，延迟填充
print(template.format(user="Carl", time="10:00"))  # 运行时填充
print("右对齐: {:>10}|".format("hi"))       # 右对齐宽度 10
print("居中: {:^10}|".format("hi"))         # 居中对齐宽度 10

# ---- 3. f-string（现代首选）----
print("\\n===== 3. f-string =====")
name, age = "Alice", 30                    # 定义变量
print(f"{name} 今年 {age} 岁")             # f-string 嵌入变量
print(f"表达式: {2 + 3 * 4}")              # {} 内可写表达式
print(f"调用方法: {name.upper()}")          # {} 内可调用方法
x = 42                                     # 定义变量 x
print(f"{x=}")                             # 调试技巧：显示变量名=值

# ---- 4. 数字格式化 ----
print("\\n===== 4. 数字格式化 =====")
pi = 3.14159265                            # 定义圆周率
money = 1234567.891                        # 定义金额
ratio = 0.857                              # 定义比率
print(f"保留3位小数: {pi:.3f}")             # 3.142
print(f"千分位: {money:,}")                 # 1,234,567.891
print(f"千分位+2位小数: {money:,.2f}")      # 1,234,567.89
print(f"百分比: {ratio:.1%}")               # 85.7%
print(f"科学计数法: {123456:.2e}")          # 1.23e+05
print(f"补零: {42:05d}")                    # 00042
print(f"带符号: {42:+d}")                   # +42
print(f"二进制: {10:b}")                    # 1010
print(f"十六进制: {255:x}")                 # ff
print(f"带0x: {255:#x}")                    # 0xff

# ---- 5. 对齐与填充 ----
print("\\n===== 5. 对齐与填充 =====")
print(f"{'左对齐':<10}|")                   # 左对齐宽度 10
print(f"{'右对齐':>10}|")                   # 右对齐
print(f"{'居中':^10}|")                     # 居中
print(f"{'填充星号':*^12}|")                # 用 * 填充居中
print(f"{'填充减号':-^12}|")                # 用 - 填充居中

# ---- 6. 日期格式化 ----
print("\\n===== 6. 日期格式化 =====")
now = datetime.now()                       # 获取当前时间
print(now.strftime("%Y-%m-%d %H:%M:%S"))   # 标准日期时间格式
print(now.strftime("%Y年%m月%d日"))         # 中文日期格式
print(now.strftime("%Y/%m/%d"))            # 斜杠分隔格式
print(now.strftime("星期%w 第%j天"))        # 星期和年内天数

# ---- 7. 实战：生成销售报表 ----
print("\\n===== 7. 实战：销售报表 =====")
sales = [                                  # 销售记录列表
    ("Alice", 123456.789, 0.857),
    ("Bob", 987654.321, 0.642),
    ("Charlie", 4567890.12, 0.951),
    ("Diana", 34567.89, 0.500),
]
# 表头
header = f"{'姓名':<10}{'销售额(元)':>18}{'完成率':>12}"  # 表头对齐
print(header)                              # 输出表头
print("-" * 40)                            # 输出分隔线
total = 0.0                                # 累计销售额
for name, amount, ratio in sales:          # 遍历每条记录
    total += amount                        # 累加到总计
    line = f"{name:<10}{amount:>18,.2f}{ratio:>12.1%}"  # 格式化一行
    print(line)                            # 输出该行
print("-" * 40)                            # 输出分隔线
print(f"{'合计':<10}{total:>18,.2f}")       # 输出合计行

# ---- 8. 三种方式性能对比 ----
print("\\n===== 8. 三种方式性能对比 =====")
import time                                # 导入时间模块
n = 100000                                 # 测试次数
t0 = time.perf_counter()                   # 记录开始时间
for _ in range(n):                         # 测试 % 方式
    s = "%s-%d" % ("x", 1)                 # % 格式化
t1 = time.perf_counter()                   # 记录结束
print(f"% 方式 {n} 次: {t1 - t0:.4f} 秒")  # 输出 % 耗时
t0 = time.perf_counter()                   # 记录开始
for _ in range(n):                         # 测试 format 方式
    s = "{}-{}".format("x", 1)             # format 格式化
t1 = time.perf_counter()                   # 记录结束
print(f"format {n} 次: {t1 - t0:.4f} 秒")  # 输出 format 耗时
t0 = time.perf_counter()                   # 记录开始
for _ in range(n):                         # 测试 f-string 方式
    s = f"{'x'}-{1}"                       # f-string 格式化
t1 = time.perf_counter()                   # 记录结束
print(f"f-string {n} 次: {t1 - t0:.4f} 秒")  # 输出 f-string 耗时
print("结论：f-string 最快，日常首选")       # 输出结论
`,
  },

  // =========================================================
  // 第四章：文本处理技巧
  // =========================================================
  {
    id: "pykit-04",
    group: "字符串与文本处理",
    icon: "📋",
    title: "文本处理技巧",
    content: `## 文本处理技巧

除了 \`str\` 和 \`re\`，Python 标准库还有几个专门处理文本的模块，能在很多场景替你省下大量手写代码：\`textwrap\`（折行/截断）、\`difflib\`（文本比较）、\`string\`（字符常量）、\`unicodedata\`（Unicode 信息）。配合字符串切片技巧，能优雅地解决文本摘要、diff 输出、字符分类等问题。

### 一、textwrap：文本折行与截断

\`textwrap\` 用于把长文本按指定宽度折行，或截断超长字符串加省略号。命令行工具输出、生成短信、控制台表格都要用它。

#### \`textwrap.fill(text, width)\` —— 折行

\`\`\`python
import textwrap
long = "Python 是一种广泛使用的高级编程语言，由 Guido van Rossum 创建。"
print(textwrap.fill(long, width=20))
# 输出：每行不超过 20 字符，自动在空格/标点处折行
\`\`\`

#### \`textwrap.shorten(text, width, placeholder)\` —— 截断加省略号

\`\`\`python
textwrap.shorten("Hello World Python Programming", width=15, placeholder="...")
# 'Hello World...'
\`\`\`

\`shorten\` 会智能在词边界截断，不会把单词从中间切断。

#### \`textwrap.dedent(text)\` —— 去除多行字符串公共缩进

\`\`\`python
s = """
    第一行
    第二行
    """
print(textwrap.dedent(s))   # 去掉每行开头的公共 4 空格
\`\`\`

写多行模板字符串时，源码里要缩进，但输出不想要缩进，\`dedent\` 正好解决。

#### \`textwrap.indent(text, prefix)\` —— 给每行加前缀

\`\`\`python
textwrap.indent("line1\\nline2", "> ")
# > line1
# > line2
\`\`\`

### 二、difflib：文本比较

\`difflib\` 用于比较两段文本的差异，生成类似 git diff 的输出。代码审查、配置变更对比、文档版本对比都用到它。

#### \`difflib.unified_diff\` —— 统一格式 diff

\`\`\`python
import difflib
old = ["line1\\n", "line2\\n", "line3\\n"]
new = ["line1\\n", "line2 modified\\n", "line3\\n"]
diff = difflib.unified_diff(old, new, fromfile="old", tofile="new")
print("".join(diff))
\`\`\`

#### \`difflib.ndiff\` —— 逐字符 diff

\`\`\`python
diff = difflib.ndiff(["hello"], ["hallo"])
# 标记每个字符的增删改
\`\`\`

#### \`difflib.SequenceMatcher.ratio()\` —— 相似度

\`\`\`python
sm = difflib.SequenceMatcher(None, "hello", "hallo")
sm.ratio()   # 0.8（80% 相似）
\`\`\`

\`ratio()\` 返回 0-1 的相似度，可用于模糊匹配、查重、拼写建议。

#### \`difflib.get_close_matches\` —— 模糊匹配建议

\`\`\`python
difflib.get_close_matches("pyton", ["python", "java", "ruby"])
# ['python']
\`\`\`

这正是命令行工具"你是不是想输入 xxx"功能的核心。

### 三、string 模块：字符常量

\`string\` 模块提供常用字符集合常量，免去手写 \`"abcdefghijklmnopqrstuvwxyz"\`。

| 常量 | 内容 |
| --- | --- |
| \`string.ascii_lowercase\` | \`abcdefghijklmnopqrstuvwxyz\` |
| \`string.ascii_uppercase\` | \`ABCDEFGHIJKLMNOPQRSTUVWXYZ\` |
| \`string.ascii_letters\` | 大小写字母合集 |
| \`string.digits\` | \`0123456789\` |
| \`string.hexdigits\` | \`0123456789abcdef\` |
| \`string.octdigits\` | \`01234567\` |
| \`string.punctuation\` | 标点符号 \`!"#$%&'()*+,-./:;<=>?@[\]^\_\`+\`{|}~\` |
| \`string.whitespace\` | 空白字符 \` \\t\\n\\r\\x0b\\x0c\` |

典型用途：生成随机验证码、过滤标点。

\`\`\`python
import string, random
code = "".join(random.choices(string.digits, k=6))   # 6 位数字验证码
\`\`\`

### 四、unicodedata：Unicode 信息

\`unicodedata\` 提供查询 Unicode 字符信息的能力，处理多语言文本、规范化字符时有用。

#### \`unicodedata.name(ch)\` —— 字符的官方名称

\`\`\`python
import unicodedata
unicodedata.name("A")     # 'LATIN CAPITAL LETTER A'
unicodedata.name("中")    # 'CJK UNIFIED IDEOGRAPH-4E2D'
unicodedata.name("😀")    # 'GRINNING FACE'
\`\`\`

#### \`unicodedata.category(ch)\` —— 字符分类

\`\`\`python
unicodedata.category("A")   # 'Lu'（Letter, uppercase）
unicodedata.category("1")   # 'Nd'（Number, decimal digit）
unicodedata.category(" ")   # 'Zs'（Separator, space）
\`\`\`

#### \`unicodedata.normalize(form, text)\` —— 规范化

Unicode 中有些字符有多种表示（如 \`é\` 可由单字符或 \`e\`+组合符表示），\`normalize\` 统一它们：

\`\`\`python
s1 = "é"              # 单个字符
s2 = "e\\u0301"        # e + 组合重音
s1 == s2              # False（视觉相同但编码不同）
unicodedata.normalize("NFC", s1) == unicodedata.normalize("NFC", s2)   # True
\`\`\`

做文本去重、搜索时，先 normalize 能避免"看起来一样却匹配不上"的坑。

### 五、字符串反转与切片技巧

#### 反转字符串

\`\`\`python
s = "Python"
s[::-1]              # nohtyP（最优雅的反转）
"".join(reversed(s)) # nohtyP（等价写法）
\`\`\`

#### 切片技巧汇总

| 操作 | 写法 | 示例 |
| --- | --- | --- |
| 反转 | \`s[::-1]\` | \`"abc"[::-1]\` → \`"cba"\` |
| 取偶数位 | \`s[::2]\` | \`"abcdef"[::2]\` → \`"ace"\` |
| 取奇数位 | \`s[1::2]\` | \`"abcdef"[1::2]\` → \`"bdf"\` |
| 去首字符 | \`s[1:]\` | \`"abc"[1:]\` → \`"bc"\` |
| 去尾字符 | \`s[:-1]\` | \`"abc"\[:-1]\` → \`"ab"\` |
| 取后 N 个 | \`s[-3:]\` | \`"abcdef"[-3:]\` → \`"def"\` |

#### \`removeprefix\` / \`removesuffix\`（Python 3.9+）

比 \`strip\` 更精确：只去掉**指定的**前缀/后缀，而不是"字符集合"。

\`\`\`python
"HelloWorld".removeprefix("Hello")    # World
"file.txt".removesuffix(".txt")       # file
\`\`\`

**\`strip\` vs \`removeprefix\` 的坑**：

\`\`\`python
"csv_file.csv".strip("csv")    # "_file." （把两端 c/v/s 全去了！）
"csv_file.csv".removeprefix("csv")  # _file.csv（只去前缀）
\`\`\`

### 六、实战 demo 说明

下面代码演示两个场景：(1) 对一段长文本生成摘要（按宽度折行 + 截断加省略号）；(2) 比较两段配置文本，输出 unified diff，并计算相似度。这是文档工具、配置管理、代码审查场景的常见需求。`,
    code: `# === 文本处理技巧 demo ===
# 每行代码都有注释，可直接 python3 运行
# 演示：textwrap 折行 + difflib 文本比较 + 摘要生成

import textwrap                            # 导入文本折行模块
import difflib                             # 导入文本比较模块
import string                              # 导入字符常量模块
import unicodedata                         # 导入 Unicode 数据模块
import random                              # 导入随机模块

# ---- 1. textwrap 折行与截断 ----
print("===== 1. textwrap 折行 =====")
long_text = "Python 是一种广泛使用的高级编程语言，由 Guido van Rossum 创建，强调代码可读性。"  # 长文本
wrapped = textwrap.fill(long_text, width=20)  # 按宽度 20 折行
print(wrapped)                             # 输出折行结果
print()                                    # 空行分隔
short = textwrap.shorten(long_text, width=25, placeholder="...")  # 截断加省略号
print("截断摘要:", short)                   # 输出截断结果

# ---- 2. dedent 去除公共缩进 ----
print("\\n===== 2. dedent 去缩进 =====")
template = """                             # 多行模板（带缩进）
    第一行内容
    第二行内容
    第三行内容
"""                                        # 模板定义结束
print("原始（带缩进）:")                    # 提示
print(template)                            # 输出原始带缩进版本
print("dedent 后:")                        # 提示
print(textwrap.dedent(template))           # 输出去缩进版本

# ---- 3. indent 给每行加前缀 ----
print("===== 3. indent 加前缀 =====")
block = "line1\\nline2\\nline3"            # 多行文本
quoted = textwrap.indent(block, "> ")      # 每行加 "> " 前缀
print(quoted)                              # 输出加前缀结果

# ---- 4. difflib unified_diff ----
print("\\n===== 4. difflib 文本比较 =====")
old_lines = ["line1\\n", "line2\\n", "line3\\n", "line4\\n"]  # 旧版本行列表
new_lines = ["line1\\n", "line2 modified\\n", "line3\\n", "line5\\n"]  # 新版本行列表
diff = difflib.unified_diff(old_lines, new_lines, fromfile="old.txt", tofile="new.txt")  # 生成 diff
print("".join(diff))                       # 输出 unified diff

# ---- 5. ndiff 逐字符 diff ----
print("===== 5. ndiff 逐字符比较 =====")
nd = difflib.ndiff(["hello world\\n"], ["hallo wor1d\\n"])  # 逐字符比较
print("".join(nd))                         # 输出逐字符 diff

# ---- 6. 相似度 ratio ----
print("\\n===== 6. 相似度计算 =====")
sm = difflib.SequenceMatcher(None, "hello world", "hallo world")  # 构造比较器
print("相似度:", round(sm.ratio(), 2))      # 输出相似度 0.91

# ---- 7. get_close_matches 模糊建议 ----
print("\\n===== 7. 模糊匹配建议 =====")
words = ["python", "java", "ruby", "golang", "rust"]  # 候选词列表
suggestions = difflib.get_close_matches("pyton", words, n=2, cutoff=0.6)  # 找接近的词
print("输入 pyton 的建议:", suggestions)    # 输出 ['python']

# ---- 8. string 模块常量 ----
print("\\n===== 8. string 模块常量 =====")
print("ascii_lowercase:", string.ascii_lowercase[:10], "...")  # 小写字母前 10 个
print("digits:", string.digits)            # 数字字符
print("punctuation:", string.punctuation)  # 标点符号
code = "".join(random.choices(string.digits, k=6))  # 生成 6 位数字验证码
print("随机验证码:", code)                  # 输出验证码

# ---- 9. unicodedata 字符信息 ----
print("\\n===== 9. unicodedata 字符信息 =====")
chars = ["A", "中", "1", " ", "😀"]        # 待查询的字符列表
for ch in chars:                           # 遍历每个字符
    try:                                   # 尝试获取名称
        name = unicodedata.name(ch)        # 获取 Unicode 名称
    except ValueError:                     # 没有名称的字符
        name = "(无名称)"                   # 标记无名称
    cat = unicodedata.category(ch)         # 获取字符分类
    print(f"  字符 {ch!r:6} 名称: {name:35} 分类: {cat}")  # 输出信息

# ---- 10. normalize 规范化 ----
print("\\n===== 10. normalize 规范化 =====")
s1 = "é"                                   # 单字符 é
s2 = "e\\u0301"                            # e + 组合重音
print(f"s1 == s2: {s1 == s2}")             # 直接比较 False
n1 = unicodedata.normalize("NFC", s1)      # 规范化 s1
n2 = unicodedata.normalize("NFC", s2)      # 规范化 s2
print(f"规范化后相等: {n1 == n2}")          # 输出 True

# ---- 11. 切片技巧 ----
print("\\n===== 11. 切片技巧 =====")
s = "Python"                               # 定义字符串
print(f"反转: {s[::-1]}")                  # nohtyP
print(f"偶数位: {s[::2]}")                 # Pto
print(f"奇数位: {s[1::2]}")                # yhn
print(f"后3个: {s[-3:]}")                  # hon

# ---- 12. removeprefix / removesuffix ----
print("\\n===== 12. removeprefix / removesuffix =====")
print("HelloWorld".removeprefix("Hello"))  # World
print("file.txt".removesuffix(".txt"))     # file
print("csv_file.csv".strip("csv"))         # _file. （strip 的坑）
print("csv_file.csv".removeprefix("csv"))  # _file.csv（精确去前缀）

# ---- 13. 实战：生成文本摘要 ----
print("\\n===== 13. 实战：文本摘要 =====")
article = """Python 是一种解释型、高级、通用的编程语言。它由 Guido van Rossum 于 1991 年首次发布。
Python 的设计哲学强调代码的可读性和简洁性，尤其使用缩进来划分代码块。
Python 拥有动态类型系统和垃圾回收功能，支持多种编程范式，包括面向对象、命令式、函数式和过程式编程。
Python 拥有庞大的标准库和丰富的第三方生态，被广泛用于 Web 开发、数据科学、人工智能、自动化运维等领域。"""  # 长文章
print("原文折行展示（width=40）:")          # 提示
print(textwrap.fill(article, width=40))    # 按宽度 40 折行输出
print()                                    # 空行
summary = textwrap.shorten(article.replace("\\n", " "), width=50, placeholder="...")  # 生成摘要
print("50 字摘要:", summary)               # 输出摘要

# ---- 14. 实战：配置 diff ----
print("\\n===== 14. 实战：配置变更 diff =====")
config_old = """[server]
host = 127.0.0.1
port = 8080
debug = true
[db]
url = sqlite:///local.db
"""                                        # 旧配置
config_new = """[server]
host = 0.0.0.0
port = 8080
debug = false
workers = 4
[db]
url = postgres://prod.db
"""                                        # 新配置
old_list = config_old.splitlines(keepends=True)  # 旧行列表
new_list = config_new.splitlines(keepends=True)  # 新行列表
diff = difflib.unified_diff(old_list, new_list, fromfile="old.ini", tofile="new.ini", lineterm="")  # 生成 diff
print("".join(diff))                       # 输出配置 diff
sm = difflib.SequenceMatcher(None, config_old, config_new)  # 构造比较器
print(f"\\n配置相似度: {sm.ratio():.1%}")   # 输出相似度百分比
print("文本处理 demo 结束")                 # 结束提示
`,
  },

  // =========================================================
  // 第五章：编码与解码
  // =========================================================
  {
    id: "pykit-05",
    group: "字符串与文本处理",
    icon: "🔐",
    title: "编码与解码",
    content: `## 编码与解码

"乱码"是每个程序员都踩过的坑：读文件变成 \`\\ufffd\`、中文文件名变成 \`???\`、网络传输后变成乱码。这些问题的根源都是**编码**。理解 ASCII/Unicode/UTF-8 的关系、掌握 \`encode\`/\`decode\` 和 \`bytes\`/\`str\` 的区别，能让你彻底告别乱码。本章还涉及 base64 编码——传输二进制数据的常用方案。

### 一、ASCII / Unicode / UTF-8 的关系

这三者是"概念 → 标准 → 实现方案"的关系，常被混淆。

#### ASCII：最早的字符编码

**ASCII**（American Standard Code for Information Interchange）用 **7 位二进制**（0-127）表示 128 个字符：英文字母、数字、标点和控制符。

\`\`\`
'A' → 65    'a' → 97    '0' → 48    ' ' → 32
\`\`\`

ASCII 的局限：只能表示英文，中文、日文、emoji 都无法表示。

#### Unicode：统一字符集

**Unicode** 是一个**字符集**（charset），目标是为世界上**所有字符**分配唯一编号（码位 code point）。目前收录超过 14 万字符，覆盖几乎所有语言和符号。

- 码位用 \`U+XXXX\` 表示，如 \`A\` = \`U+0041\`，\`中\` = \`U+4E2D\`，\`😀\` = \`U+1F600\`。
- Unicode 只规定"字符 → 编号"，**不规定编号怎么存成字节**。

#### UTF-8：Unicode 的存储方案

**UTF-8** 是 Unicode 的**编码方式**（encoding）之一，用变长字节存储码位：

| 字符范围 | 字节数 | 示例 |
| --- | --- | --- |
| ASCII（0-127） | 1 字节 | \`A\` → \`0x41\` |
| 拉丁/希腊等 | 2 字节 | \`é\` → \`0xC3 0xA9\` |
| 中文常用 | 3 字节 | \`中\` → \`0xE4 0xB8 0xAD\` |
| emoji 等 | 4 字节 | \`😀\` → \`0xF0 0x9F 0x98 0x80\` |

UTF-8 的优势：
- **兼容 ASCII**：纯英文文本和 ASCII 完全一样，节省空间。
- **变长**：常用字符字节少，存储高效。
- **自同步**：从任意字节能找到字符边界，适合流式传输。

UTF-8 是**互联网的事实标准**，超过 98% 的网页用 UTF-8。

#### 三者关系图

\`\`\`
Unicode（字符集：规定每个字符的编号）
   │
   ├── UTF-8（变长 1-4 字节，最常用）
   ├── UTF-16（变长 2 或 4 字节）
   └── UTF-32（定长 4 字节）

ASCII（128 字符的旧标准）≈ Unicode 的前 128 字符 = UTF-8 的单字节部分
\`\`\`

#### 其他常见编码

| 编码 | 说明 | 用途 |
| --- | --- | --- |
| \`utf-8\` | Unicode 变长编码 | **默认首选** |
| \`gbk\` / \`gb2312\` | 中文国标码 | 老旧 Windows 中文系统 |
| \`big5\` | 繁体中文 | 港台老旧系统 |
| \`latin-1\` / \`iso-8859-1\` | 西欧语言 | 老旧系统 |
| \`shift_jis\` | 日文 | 日本老旧系统 |

### 二、str vs bytes：Python 中的关键区别

Python 3 严格区分两种文本类型：

| 类型 | 含义 | 示例 |
| --- | --- | --- |
| \`str\` | Unicode 文本（人类可读） | \`"中文"\` |
| \`bytes\` | 字节序列（机器存储） | \`b'\\xe4\\xb8\\xad'\` |

\`\`\`python
s = "中文"                # str 类型
b = s.encode("utf-8")     # str → bytes：b'\\xe4\\xb8\\xad\\xe6\\x96\\x87'
s2 = b.decode("utf-8")    # bytes → str："中文"
\`\`\`

**核心记忆**：
- \`str\` 是**解码后**的文本，\`bytes\` 是**编码后**的字节。
- \`str\` 只存在于内存里；要存文件、发网络，必须 \`encode\` 成 \`bytes\`。
- 读文件/收网络得到的是 \`bytes\`，要 \`decode\` 成 \`str\` 才能处理。

### 三、encode / decode 方法

#### \`str.encode(encoding, errors)\`

\`\`\`python
"中文".encode("utf-8")        # b'\\xe4\\xb8\\xad\\xe6\\x96\\x87'
"中文".encode("gbk")          # b'\\xd6\\xd0\\xce\\xc4'
"ABC".encode("ascii")         # b'ABC'
\`\`\`

#### \`bytes.decode(encoding, errors)\`

\`\`\`python
b'\\xe4\\xb8\\xad'.decode("utf-8")   # '中'
b'ABC'.decode("ascii")             # 'ABC'
\`\`\`

#### 默认编码

Python 3 的默认编码是 **UTF-8**，所以 \`"中文".encode()\` 等价于 \`"中文".encode("utf-8")\`。

可以用 \`sys.getdefaultencoding()\` 查看默认编码。

### 四、errors 参数：编码错误处理

当遇到无法编码/解码的字节时，\`errors\` 参数决定怎么办：

| errors 值 | 行为 |
| --- | --- |
| \`"strict"\`（默认） | 抛 \`UnicodeDecodeError\` / \`UnicodeEncodeError\` |
| \`"ignore"\` | 直接忽略错误字符 |
| \`"replace"\` | 用 \`\\ufffd\`（解码）或 \`?\`（编码）替换 |
| \`"backslashreplace"\` | 用 \`\\xNN\` 转义 |
| \`"xmlcharrefreplace"\` | 用 XML 实体 \`&#NNN;\` 替换（编码时） |

\`\`\`python
b'\\xe4\\xb8'.decode("utf-8", errors="strict")    # 报错（不完整的 UTF-8）
b'\\xe4\\xb8'.decode("utf-8", errors="replace")   # '�'
b'\\xe4\\xb8'.decode("utf-8", errors="ignore")    # ''（直接丢掉）
"中文".encode("ascii", errors="replace")          # b'??'
"中文".encode("ascii", errors="xmlcharrefreplace")  # b'&#20013;&#25991;'
\`\`\`

**生产建议**：处理来源不明的数据（如爬虫抓取的网页）时，用 \`errors="replace"\` 或 \`errors="ignore"\` 避免程序崩溃，但要意识到会有信息丢失。

### 五、bytes 的操作

\`bytes\` 类似 \`str\`，也是不可变序列，支持索引、切片、拼接：

\`\`\`python
b = b"hello"
b[0]            # 104（整数，不是字符！）
b[1:3]          # b'el'
b + b" world"   # b'hello world'
len(b)          # 5
\`\`\`

**注意**：\`bytes\` 索引返回的是**整数**（0-255），不是字符。要字符用 \`b[0:1]\` 切片。

#### \`bytearray\`：可变的 bytes

\`\`\`python
ba = bytearray(b"hello")
ba[0] = 72          # 可修改
ba.append(33)       # 可追加
\`\`\`

\`bytearray\` 适合需要频繁修改字节序列的场景。

### 六、base64 编码

**Base64** 把任意二进制数据用 64 个可打印 ASCII 字符（\`A-Za-z0-9+/\`）表示，常用于：
- 邮件附件（SMTP 只能传 ASCII）
- Data URL（把图片嵌入 HTML/CSS）
- JSON 中传输二进制数据
- HTTP Basic 认证

#### base64 模块

\`\`\`python
import base64
data = b"Hello, World"
encoded = base64.b64encode(data)   # b'SGVsbG8sIFdvcmxk'
decoded = base64.b64decode(encoded)  # b'Hello, World'
\`\`\`

**重点**：base64 的输入和输出都是 \`bytes\`。处理字符串时要先 encode，处理后 decode。

\`\`\`python
# 字符串 → base64
s = "中文"
b64 = base64.b64encode(s.encode("utf-8")).decode("ascii")  # '5Lit5paH'
# base64 → 字符串
original = base64.b64decode(b64).decode("utf-8")  # '中文'
\`\`\`

#### URL 安全的 base64

标准 base64 含 \`+\` \`/\`，在 URL 中有歧义。用 \`urlsafe_b64encode\` 替换成 \`-\` \`_\`：

\`\`\`python
base64.urlsafe_b64encode(data)
\`\`\`

### 七、实战 demo 说明

下面代码演示：(1) 查看"中文"在不同编码下的字节表示，理解 UTF-8 和 GBK 的差异；(2) 模拟处理中文文件名（编码 → 传输 → 解码还原）；(3) 用 base64 编码一段文本和模拟的小图片数据。这些是跨系统传输中文、在 JSON/HTML 中嵌入二进制数据的真实场景。`,
    code: `# === 编码与解码 demo ===
# 每行代码都有注释，可直接 python3 运行
# 演示：编码对比、中文文件名处理、base64 编码解码

import sys                                  # 导入系统模块
import base64                               # 导入 base64 模块

# ---- 1. 查看 Python 默认编码 ----
print("===== 1. 默认编码 =====")
print("默认编码:", sys.getdefaultencoding())  # 输出默认编码 utf-8
print("文件系统编码:", sys.getfilesystemencoding())  # 输出文件系统编码

# ---- 2. ASCII / Unicode / UTF-8 关系 ----
print("\\n===== 2. ASCII / Unicode / UTF-8 =====")
print("ASCII 字符 A 的码位:", ord("A"))      # 输出 A 的 Unicode 码位 65
print("中文 '中' 的码位:", hex(ord("中")))    # 输出 中的码位 0x4e2d
print("emoji '😀' 的码位:", hex(ord("😀")))   # 输出 emoji 码位
b_utf8 = "中".encode("utf-8")               # 用 UTF-8 编码"中"
print("'中' 的 UTF-8 字节:", b_utf8, "长度:", len(b_utf8))  # 输出 3 字节
b_gbk = "中".encode("gbk")                  # 用 GBK 编码"中"
print("'中' 的 GBK 字节:", b_gbk, "长度:", len(b_gbk))  # 输出 2 字节
b_ascii = "A".encode("ascii")               # 用 ASCII 编码 A
print("'A' 的 ASCII 字节:", b_ascii, "长度:", len(b_ascii))  # 输出 1 字节

# ---- 3. str vs bytes 类型对比 ----
print("\\n===== 3. str vs bytes =====")
s = "中文"                                  # 定义 str
b = s.encode("utf-8")                       # 编码成 bytes
print(f"str: {s!r}  类型: {type(s).__name__}")  # 输出 str 信息
print(f"bytes: {b!r}  类型: {type(b).__name__}")  # 输出 bytes 信息
print(f"bytes 索引 b[0]: {b[0]} (整数)")     # bytes 索引返回整数
print(f"bytes 切片 b[0:1]: {b[0:1]!r} (bytes)")  # 切片返回 bytes
s2 = b.decode("utf-8")                      # 解码回 str
print(f"解码后: {s2!r}  相等: {s == s2}")    # 输出解码结果和相等性

# ---- 4. encode / decode 基本用法 ----
print("\\n===== 4. encode / decode =====")
text = "Hello 世界"                         # 定义混合文本
encoded = text.encode("utf-8")              # 编码成 UTF-8 字节
print("编码:", encoded)                     # 输出字节序列
decoded = encoded.decode("utf-8")           # 解码回字符串
print("解码:", decoded)                     # 输出还原字符串
print("往返一致:", text == decoded)          # 验证往返一致

# ---- 5. errors 参数：错误处理 ----
print("\\n===== 5. errors 错误处理 =====")
bad_bytes = b'\\xe4\\xb8'                    # 不完整的 UTF-8 字节
try:                                        # 尝试严格解码
    bad_bytes.decode("utf-8", errors="strict")  # 严格模式
except UnicodeDecodeError as e:             # 捕获解码错误
    print("strict 模式报错:", e)             # 输出错误信息
print("replace 模式:", bad_bytes.decode("utf-8", errors="replace"))  # 用 ? 替换
print("ignore 模式:", repr(bad_bytes.decode("utf-8", errors="ignore")))  # 忽略错误
encoded_replace = "中文".encode("ascii", errors="replace")  # 用 ? 替换无法编码的
print("ascii 替换:", encoded_replace)       # 输出 b'??'
encoded_xml = "中文".encode("ascii", errors="xmlcharrefreplace")  # XML 实体替换
print("ascii xmlcharref:", encoded_xml)     # 输出 XML 实体字节

# ---- 6. bytes 操作 ----
print("\\n===== 6. bytes 操作 =====")
b = b"hello"                               # 定义 bytes
print(f"b = {b!r}")                         # 输出 b
print("b[0]:", b[0])                        # 索引返回整数 104
print("b[1:3]:", b[1:3])                    # 切片返回 bytes
print("b + b' world':", b + b" world")      # 拼接
print("len(b):", len(b))                    # 长度
ba = bytearray(b"hello")                   # 创建可变 bytearray
ba[0] = 72                                  # 修改第一个字节
ba.append(33)                               # 追加字节 33（!）
print("bytearray 修改后:", ba)              # 输出修改后的 bytearray

# ---- 7. base64 编码解码 ----
print("\\n===== 7. base64 编码解码 =====")
data = b"Hello, World"                     # 待编码的字节
b64 = base64.b64encode(data)               # base64 编码
print("原始字节:", data)                    # 输出原始字节
print("base64 编码:", b64)                  # 输出编码结果
decoded_data = base64.b64decode(b64)       # base64 解码
print("base64 解码:", decoded_data)         # 输出解码结果
print("往返一致:", data == decoded_data)    # 验证一致

# ---- 8. base64 编码字符串（先 encode 再 b64）----
print("\\n===== 8. base64 编码中文字符串 =====")
text = "中文测试"                          # 定义中文字符串
b64_str = base64.b64encode(text.encode("utf-8")).decode("ascii")  # 字符串→bytes→base64→str
print(f"原文: {text}")                     # 输出原文
print(f"base64: {b64_str}")                # 输出 base64 字符串
original = base64.b64decode(b64_str).decode("utf-8")  # base64→bytes→str
print(f"还原: {original}")                 # 输出还原结果
print("往返一致:", text == original)        # 验证一致

# ---- 9. URL 安全 base64 ----
print("\\n===== 9. URL 安全 base64 =====")
raw = bytes([62, 63, 64, 0xFF])             # 含 + / 对应字节的原始数据
standard = base64.b64encode(raw)            # 标准 base64
urlsafe = base64.urlsafe_b64encode(raw)     # URL 安全 base64
print("原始字节:", raw)                     # 输出原始字节
print("标准 base64:", standard)             # 输出标准 base64（含 + /）
print("URL 安全:", urlsafe)                 # 输出 URL 安全 base64（- _ 替换）

# ---- 10. 实战 1：模拟处理中文文件名 ----
print("\\n===== 10. 实战：中文文件名传输 =====")
filename = "项目报告_2024年.xlsx"           # 模拟中文文件名
print("原始文件名:", filename)              # 输出原文
# 模拟通过网络传输（只能传字节）
encoded_bytes = filename.encode("utf-8")    # 编码成字节用于传输
print("传输的字节:", encoded_bytes)         # 输出字节
# 模拟接收端解码
received = encoded_bytes.decode("utf-8")    # 解码回字符串
print("接收的文件名:", received)            # 输出还原
print("文件名一致:", filename == received)  # 验证
# 演示错误：用错误编码解码会乱码
wrong = encoded_bytes.decode("gbk", errors="replace")  # 用 GBK 解 UTF-8 字节
print("用 GBK 错误解码:", wrong)            # 输出乱码

# ---- 11. 实战 2：base64 嵌入图片数据 ----
print("\\n===== 11. 实战：base64 模拟图片数据 =====")
# 模拟一个 1x1 红色 PNG 的二进制数据（这里用简单字节模拟）
fake_png = bytes([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0xFF, 0x00])  # 模拟 PNG 头
print("图片字节:", fake_png)                # 输出图片字节
b64_img = base64.b64encode(fake_png).decode("ascii")  # 编码成 base64 字符串
print("图片 base64:", b64_img)              # 输出 base64
data_url = f"data:image/png;base64,{b64_img}"  # 生成 Data URL
print("Data URL:", data_url)                # 输出 Data URL
# 接收端还原
prefix = "data:image/png;base64,"           # Data URL 前缀
b64_part = data_url[len(prefix):]           # 截取 base64 部分
restored = base64.b64decode(b64_part)       # 解码回字节
print("还原图片字节:", restored)            # 输出还原字节
print("图片往返一致:", fake_png == restored)  # 验证一致

# ---- 12. 各编码字节长度对比 ----
print("\\n===== 12. 编码字节长度对比 =====")
sample = "Hello 世界 😀"                    # 含 ASCII/中文/emoji 的样本
for enc in ["utf-8", "utf-16", "gbk", "big5"]:  # 遍历多种编码
    try:                                   # 尝试编码
        b = sample.encode(enc)             # 用该编码编码
        print(f"  {enc:8} 长度: {len(b):3} 字节  {b[:20]}...")  # 输出长度
    except UnicodeEncodeError as e:        # 不支持的字符
        print(f"  {enc:8} 无法编码: {e}")   # 输出错误
print("编码与解码 demo 结束")               # 结束提示
`,
  },
];
