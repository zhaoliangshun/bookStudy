// =============================================================
// Python 交互式教程 - 第 7 批章节（数据处理与持久化）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. py-regex              — 正则表达式深入
//   2. py-json-xml-csv       — JSON/XML/CSV 数据格式
//   3. py-sqlite             — SQLite 数据库
//   4. py-pathlib-filesystem — 文件系统进阶
//   5. py-serialization      — 序列化与反序列化
//   6. py-config-args        — 配置文件与命令行参数
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（统一为「数据处理与持久化」）
//   content : Markdown 格式的详细讲解（文字量大，含大量示例）
//   code    : 可运行的 Python 代码（python3 直接执行，print 输出）
//
// 注意事项：
//   - 所有注释和讲解使用简体中文
//   - code 字段为纯 Python 代码，不含反引号与 ${ 字符
//   - SQLite demo 使用内存数据库 :memory:，文件系统 demo 使用 tempfile
//   - 所有代码可在 Python 3.13 直接运行
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：正则表达式深入
  // =========================================================
  {
    id: "py-regex",
    group: "数据处理与持久化",
    icon: "🔍",
    title: "正则表达式深入",
    content: `# 正则表达式深入

正则表达式（Regular Expression，简称 regex 或 regexp）是描述字符串模式的一种「迷你语言」。它用一套特殊的符号体系，在一行文本里表达「我要找什么样的字符串」。从校验邮箱、提取网页里的链接，到日志清洗、爬虫数据抽取，正则表达式几乎是每个程序员迟早要面对的工具。

Python 通过标准库 \`re\` 提供正则支持。本章会从最基础的字符匹配讲起，一路深入到零宽断言、反向引用、性能优化和常见陷阱，力求让你看完后能「看懂别人写的正则」「写出可维护的正则」「避开正则的坑」。

---

## 一、为什么需要正则表达式

### 1.1 字符串方法的局限

如果只是判断一个字符串是否「包含」某个子串，\`str.find\` / \`in\` 就够了：

\`\`\`python
text = "我的邮箱是 tom@example.com"     # 将字符串 "我的邮箱是 tom@example.com" 赋给 text
print("tom" in text)            # True
print(text.find("@") != -1)     # True
\`\`\`

但需求一旦变成「从一段文本里找出所有形如 xxx@xxx.xxx 的邮箱」，字符串方法就力不从心了——你不知道邮箱的具体内容，只知道它的「形状」。正则表达式就是用来描述这种「形状」的。

\`\`\`python
import re                          # 导入 re 模块
text = "联系我：tom@example.com 或者 jerry@demo.org"  # 将字符串 "联系我：tom@example.com 或者 jerry@demo.org" 赋给 text
emails = re.findall(r"[\\w.]+@[\\w.]+", text)  # 将 re.findall(r"[\\w.]+@[\\w.]+", text) 赋给 emails
print(emails)  # ['tom@example.com', 'jerry@demo.org']
\`\`\`

### 1.2 正则是一把双刃剑

正则表达式的优点是**极其强大**，缺点是**可读性差、容易写错、容易过度使用**。社区有句名言：

> 有些人面对一个问题时会想：「我知道，我用正则表达式。」于是他们现在有了两个问题。

这并不是说正则不好，而是提醒你：**能用字符串方法解决的，别用正则；能用解析器（如 HTML 解析器）解决的，别用正则去硬刚嵌套结构**。正则最适合「扁平文本的模式匹配」，不适合「有递归/嵌套结构的解析」（比如 HTML 标签嵌套、带括号的表达式）。

---

## 二、re 模块的核心函数

Python 的 \`re\` 模块提供了一组顶层函数，日常使用频率最高的是下面这几个：

| 函数 | 作用 | 返回 |
|------|------|------|
| \`re.match(pattern, string)\` | 从**字符串开头**匹配 | Match 对象或 None |
| \`re.search(pattern, string)\` | 扫描**整个**字符串找第一个匹配 | Match 对象或 None |
| \`re.fullmatch(pattern, string)\` | 要求**整个**字符串完全匹配 | Match 对象或 None |
| \`re.findall(pattern, string)\` | 找出**所有**匹配 | 字符串列表（有分组时返回元组列表） |
| \`re.finditer(pattern, string)\` | 找出所有匹配的迭代器 | 迭代器，元素为 Match 对象 |
| \`re.sub(pattern, repl, string)\` | 替换所有匹配 | 新字符串 |
| \`re.subn(pattern, repl, string)\` | 替换并返回次数 | (新字符串, 替换次数) |
| \`re.split(pattern, string)\` | 按模式分割 | 字符串列表 |
| \`re.compile(pattern)\` | 预编译模式 | Pattern 对象 |

### 2.1 match vs search vs fullmatch

这三者最容易混淆，区别在于「匹配的位置要求」：

\`\`\`python
import re                          # 导入 re 模块

s = "hello world"                  # 将字符串 "hello world" 赋给 s

# match 从开头匹配，不要求匹配到末尾
print(re.match(r"hello", s))        # <Match object>
print(re.match(r"world", s))        # None（开头不是 world）

# search 扫描整个字符串，找第一个出现的位置
print(re.search(r"world", s))       # <Match object>
print(re.search(r"o", s).start())   # 4（第一个 o 在索引 4）

# fullmatch 要求整个字符串都匹配
print(re.fullmatch(r"hello world", s))  # <Match object>
print(re.fullmatch(r"hello", s))        # None（后面还有 world）
\`\`\`

记忆口诀：
- \`match\` = 「**从头开始**，匹配前缀」
- \`search\` = 「**到处找**，找到第一个就停」
- \`fullmatch\` = 「**整个**字符串都得匹配」

### 2.2 Match 对象

\`match\` / \`search\` / \`fullmatch\` 返回的是 \`Match\` 对象（没匹配到返回 \`None\`）。Match 对象常用方法：

\`\`\`python
m = re.search(r"(\\w+)@(\\w+)", "联系 tom@example.com")  # 将 re.search(r"(\\w+)@(\\w+)", "联系 tom@example.com") 赋给 m
print(m.group(0))   # tom@example —— 整个匹配
print(m.group(1))   # tom —— 第 1 个分组
print(m.group(2))   # example —— 第 2 个分组
print(m.groups())   # ('tom', 'example') —— 所有分组
print(m.start())    # 3 —— 匹配起始位置
print(m.end())      # 15 —— 匹配结束位置
print(m.span())     # (3, 15) —— (start, end)
\`\`\`

⚠️ 注意：用 \`match\` / \`search\` 时，**一定要先判断是否为 None 再调用 \`.group()\`**，否则没匹配到会抛 \`AttributeError\`。

\`\`\`python
m = re.search(r"xyz", "hello")     # 将 re.search(r"xyz", "hello") 赋给 m
if m:                              # 如果 m 成立
    print(m.group())               # 输出 m.group()
else:                              # 否则
    print("没匹配到")                  # 输出 "没匹配到"
\`\`\`

### 2.3 findall 与 finditer

\`findall\` 返回所有匹配的**字符串**（或元组），\`finditer\` 返回 Match 对象的迭代器。

\`\`\`python
import re                          # 导入 re 模块
text = "电话：13800138000，备选：13900139000"  # 将字符串 "电话：13800138000，备选：13900139000" 赋给 text

# 无分组：返回匹配的字符串列表
print(re.findall(r"\\d{11}", text))  # ['13800138000', '13900139000']

# 有一个分组：返回分组内容列表
print(re.findall(r"(\\d{3})\\d{8}", text))  # ['138', '139']

# 有多个分组：返回元组列表
print(re.findall(r"(\\d{3})-(\\d{4})", "010-1234, 021-5678"))  # 输出 re.findall(r"(\\d{3})-(\\d{4})", "010-1234, 021-5678")
# [('010', '1234'), ('021', '5678')]
\`\`\`

\`finditer\` 在匹配结果很多、字符串很大时更省内存，因为它「惰性」地一个一个 yield：

\`\`\`python
for m in re.finditer(r"\\d+", "a1 b22 c333"):  # 遍历 re.finditer(r"\\d+", "a1 b22 c333")，每次取值赋给 m
    print(m.group(), m.span())     # 输出 m.group(), m.span()
# 1 (1, 2)
# 22 (4, 6)
# 333 (8, 12)
\`\`\`

### 2.4 sub 与 subn 替换

\`re.sub(pattern, repl, string, count=0)\` 把匹配到的部分替换成 \`repl\`。\`repl\` 可以是字符串，也可以是函数。

\`\`\`python
import re                          # 导入 re 模块

# 字符串替换
print(re.sub(r"\\d+", "#", "a1 b22 c333"))       # a# b# c#
print(re.sub(r"\\d+", "#", "a1 b22 c333", count=2))  # a# b# c333（只替换 2 个）

# subn 返回 (新字符串, 替换次数)
new, n = re.subn(r"\\d+", "#", "a1 b22 c333")
print(new, n)  # a# b# c# 3
\`\`\`

**函数替换**是 \`sub\` 最强大的用法：每个匹配会被传给函数，函数返回的字符串作为替换结果：

\`\`\`python
# 把所有数字加 1
def add_one(m):                    # 定义函数 add_one，参数：m
    return str(int(m.group()) + 1) # 返回 str(int(m.group()) + 1)

print(re.sub(r"\\d+", add_one, "a1 b22 c333"))  # a2 b23 c334

# 用 lambda 隐藏手机号中间 4 位
print(re.sub(r"(\\d{3})\\d{4}(\\d{4})", r"\\1****\\2", "13812345678"))  # 输出 re.sub(r"(\\d{3})\\d{4}(\\d{4})", r"\\1****\\2", "13812345678")
# 138****5678
\`\`\`

注意替换字符串里的 \`\\1\`、\`\\2\` 是「反向引用」，引用第几个分组的内容。

### 2.5 split 分割

\`re.split\` 比 \`str.split\` 强大，能按「模式」分割：

\`\`\`python
import re                          # 导入 re 模块

# 按任意空白/逗号分割
print(re.split(r"[\\s,]+", "a, b ,  c ,d"))  # 输出 re.split(r"[\\s,]+", "a, b ,  c ,d")
# ['a', 'b', 'c', 'd']

# 保留分隔符（用捕获分组）
print(re.split(r"(\\s,)+", "a, b ,  c"))  # 输出 re.split(r"(\\s,)+", "a, b ,  c")
# ['a', ', ', 'b', ', ', 'c']

# 限制分割次数
print(re.split(r"\\d+", "a1b2c3d", maxsplit=2))  # 输出 re.split(r"\\d+", "a1b2c3d", maxsplit=2)
# ['a', 'b', 'c3d']
\`\`\`

⚠️ \`re.split\` 在模式有**捕获分组**时，分隔符也会出现在结果列表里；没有分组则不出现。这是常见坑点。

---

## 三、编译 compile 与 flags

### 3.1 为什么要 compile

如果你**反复用同一个模式**匹配很多字符串，预编译能提升性能——模式只需解析一次：

\`\`\`python
import re                          # 导入 re 模块

# 预编译一次
phone_re = re.compile(r"1[3-9]\\d{9}")  # 将 re.compile(r"1[3-9]\\d{9}") 赋给 phone_re

# 反复使用
for s in ["13800138000", "12345", "19900001111"]:  # 遍历 ["13800138000", "12345", "19900001111"]，每次取值赋给 s
    if phone_re.fullmatch(s):      # 如果 phone_re.fullmatch(s) 成立
        print(s, "是合法手机号")         # 输出 s, "是合法手机号"
\`\`\`

预编译对象拥有和 \`re\` 模块一样的方法：\`pattern.match()\`、\`pattern.search()\`、\`pattern.findall()\` 等等。

\`pattern.pattern\` 和 \`pattern.flags\` 可以查看模式和标志：

\`\`\`python
p = re.compile(r"abc", re.IGNORECASE)  # 将 re.compile(r"abc", re.IGNORECASE) 赋给 p
print(p.pattern)  # abc
print(p.flags)    # 34（IGNORECASE=2 + UNICODE=32 等）
\`\`\`

### 3.2 常用 flags

| 标志 | 缩写 | 作用 |
|------|------|------|
| \`re.IGNORECASE\` | \`re.I\` | 忽略大小写 |
| \`re.MULTILINE\` | \`re.M\` | 多行模式，\`^\` 和 \`$\` 匹配每行首尾 |
| \`re.DOTALL\` | \`re.S\` | 让 \`.\` 也匹配换行符 |
| \`re.VERBOSE\` | \`re.X\` | 详细模式，允许在模式里写注释和空白 |
| \`re.ASCII\` | \`re.A\` | 让 \`\\w\` \`\\d\` 等只匹配 ASCII |
| \`re.UNICODE\` | \`re.U\` | （默认）\`\\w\` 匹配 Unicode 字符 |

\`\`\`python
import re                          # 导入 re 模块

# IGNORECASE
print(re.findall(r"python", "Python PYTHON pyTHON", re.I))  # 输出 re.findall(r"python", "Python PYTHON pyTHON", re.I)
# ['Python', 'PYTHON', 'pyTHON']

# MULTILINE：^ $ 匹配每行
text = "line1\\nline2\\nline3"     # 将字符串 "line1\\nline2\\nline3" 赋给 text
print(re.findall(r"^line\\w+", text, re.M))  # 输出 re.findall(r"^line\\w+", text, re.M)
# ['line1', 'line2', 'line3']
# 不加 re.M 的话，^ 只匹配整个字符串开头，只能找到 line1

# DOTALL：. 匹配换行
html = "<div>hello\\nworld</div>"  # 将字符串 "<div>hello\\nworld</div>" 赋给 html
print(re.search(r"<div>(.*?)</div>", html, re.S).group(1))  # 输出 re.search(r"<div>(.*?)</div>", html, re.S).group(1)
# hello\\nworld（不加 re.S 则 .* 碰到换行就停，匹配不到）

# VERBOSE：写注释，忽略模式中的空白
phone = re.compile(r"""            # 将 re.compile(r""" 赋给 phone
    1            # 手机号第 1 位固定是 1
    [3-9]        # 第 2 位 3~9
    \\d{9}       # 后面 9 位数字
""", re.VERBOSE)
print(phone.fullmatch("13812345678"))  # <Match object>
\`\`\`

**VERBOSE 模式非常推荐**——它让你能在复杂的正则里写注释、换行，大幅提升可读性。注释用 \`#\`，模式里的空白会被忽略（要匹配空白得用 \`\\ \` 或 \`\\s\`）。

### 3.3 flags 可以叠加

多个标志用 \`|\` 叠加：

\`\`\`python
re.findall(r"hello", "HELLO\\nworld\\nHELLO", re.I | re.M)  # 对 re 调用 findall 方法，参数 r"hello", "HELLO\\nworld\\nHELLO", re.I | re.M
\`\`\`

也可以在模式开头用内联标志 \`(?i)\`、\`(?m)\`、\`(?s)\`、\`(?x)\`，只对局部生效：

\`\`\`python
print(re.findall(r"(?i)python", "Python PYTHON"))  # ['Python', 'PYTHON']
\`\`\`

---

## 四、字符类与元字符

### 4.1 普通字符与元字符

正则里大部分字符（字母、数字）匹配它们自己，但有一批**元字符**有特殊含义：\`. ^ $ * + ? { } [ ] \\ | ( )\`。要匹配元字符本身，需要用反斜杠转义：\`\\.\` \`\\*\` \`\\(\` 等。

### 4.2 字符类 [ ]

方括号 \`[ ]\` 表示「匹配其中任意一个字符」：

\`\`\`python
[aeiou]      # 匹配任意一个元音字母
[a-z]        # 匹配任意小写字母
[A-Za-z0-9]  # 匹配字母数字
[^0-9]       # ^ 在开头表示「取反」，匹配非数字
[a.]         # 字符类里 . 就是普通点，不用转义
\`\`\`

⚠️ 字符类内部的元字符规则和外部不同：\`.\` \`*\` \`+\` 在 \`[ ]\` 内都是普通字符；\`^\` 只有在**开头**才表示取反，在其他位置是普通字符；\`-\` 表示范围，要匹配字面 \`-\` 需放在开头或结尾 \`[-a]\`。

### 4.3 预定义字符类

| 写法 | 等价 | 含义 |
|------|------|------|
| \`\\d\` | \`[0-9]\` | 数字 |
| \`\\D\` | \`[^0-9]\` | 非数字 |
| \`\\w\` | \`[A-Za-z0-9_]\` | 单词字符（含中文，Unicode 模式下） |
| \`\\W\` | \`[^\\w]\` | 非单词字符 |
| \`\\s\` | \`[ \\t\\n\\r\\f\\v]\` | 空白 |
| \`\\S\` | \`[^\\s]\` | 非空白 |
| \`.\` | （除换行） | 任意字符（DOTALL 下含换行） |

\`\`\`python
import re                          # 导入 re 模块
print(re.findall(r"\\w+", "hello 你好 world_1"))  # ['hello', '你好', 'world_1']
print(re.findall(r"\\d+", "a12b3"))                # ['12', '3']
print(re.findall(r"\\s+", "a b  c"))               # [' ', '  ']
\`\`\`

### 4.4 锚点

锚点不匹配具体字符，而是匹配「位置」：

| 锚点 | 含义 |
|------|------|
| \`^\` | 字符串开头（MULTILINE 下每行开头） |
| \`$\` | 字符串结尾（MULTILINE 下每行结尾） |
| \`\\A\` | 字符串开头（不受 MULTILINE 影响） |
| \`\\Z\` | 字符串结尾（不受 MULTILINE 影响） |
| \`\\b\` | 单词边界（\\w 和 \\W 的交界） |
| \`\\B\` | 非单词边界 |

\`\`\`python
import re                          # 导入 re 模块

# 单词边界：精确匹配 cat，不匹配 category
print(re.findall(r"\\bcat\\b", "a cat category cat."))  # ['cat', 'cat']

# ^ 和 $
print(re.findall(r"^\\w+", "hello\\nworld", re.M))  # ['hello', 'world']
\`\`\`

\`\\b\` 是「单词边界」，它匹配的是「一侧是 \`\\w\`，另一侧不是 \`\\w\`」的位置。常用于避免 \`cat\` 匹配到 \`category\`。

---

## 五、量词：匹配多少次

### 5.1 基本量词

| 量词 | 含义 |
|------|------|
| \`*\` | 0 次或多次 |
| \`+\` | 1 次或多次 |
| \`?\` | 0 次或 1 次 |
| \`{n}\` | 恰好 n 次 |
| \`{n,}\` | 至少 n 次 |
| \`{n,m}\` | n 到 m 次 |

\`\`\`python
import re                          # 导入 re 模块
print(re.findall(r"\\d{3}", "12 123 1234 12345"))  # ['123', '123', '123']
print(re.findall(r"\\d{2,4}", "1 12 123 1234 12345"))  # 输出 re.findall(r"\\d{2,4}", "1 12 123 1234 12345")
# ['12', '123', '1234', '1234']
\`\`\`

### 5.2 贪婪与非贪婪

默认量词是**贪婪**的——会尽可能多地匹配。在量词后加 \`?\` 变成**非贪婪**（lazy / 懒惰）——尽可能少地匹配：

\`\`\`python
import re                          # 导入 re 模块
html = "<b>bold</b><i>italic</i>"  # 将字符串 "<b>bold</b><i>italic</i>" 赋给 html

# 贪婪：.* 会一直匹配到最后一个 >
print(re.findall(r"<.*>", html))      # ['<b>bold</b><i>italic</i>']

# 非贪婪：.*? 匹配到第一个 > 就停
print(re.findall(r"<.*?>", html))     # ['<b>', '</b>', '<i>', '</i>']
\`\`\`

⚠️ 处理 HTML/XML 这类「有开始结束标记」的内容，**几乎总是用非贪婪 \`.*?\`**。但这又回到前面的忠告：正则解析嵌套 HTML 不可靠，复杂场景请用 BeautifulSoup / lxml。

### 5.3 占有量词（Python 3.11+）

Python 3.11 引入了**占有量词**（possessive）：\`*+\`、\`++\`、\`?+\`、\`{n,m}+\`。它和贪婪一样尽量多匹配，但**不会回溯**——一旦匹配上就不让出来。在模式很长、容易回溯爆炸时能提升性能：

\`\`\`python
# 贪婪会回溯，占有量词不会
# 下面这个例子：占有版本在匹配失败时更快
import re                          # 导入 re 模块
print(re.match(r"\\d++", "12345").group())  # 12345
\`\`\`

---

## 六、分组与捕获

### 6.1 捕获分组 ( )

用括号 \`( )\` 括起来的部分是**分组**，会被「捕获」，可以用 \`group(1)\`、\`\\1\` 等引用：

\`\`\`python
import re                          # 导入 re 模块

date = "2024-03-15"                # 将字符串 "2024-03-15" 赋给 date
m = re.match(r"(\\d{4})-(\\d{2})-(\\d{2})", date)  # 将 re.match(r"(\\d{4})-(\\d{2})-(\\d{2})", date) 赋给 m
print(m.group(1))  # 2024
print(m.group(2))  # 03
print(m.group(3))  # 15
print(m.groups())  # ('2024', '03', '15')

# 重新组装
print("-".join(reversed(m.groups())))  # 15-03-2024
\`\`\`

### 6.2 命名分组 (?P<name>)

数字编号容易混淆，命名分组可读性更好：

\`\`\`python
import re                          # 导入 re 模块

m = re.match(r"(?P<year>\\d{4})-(?P<month>\\d{2})-(?P<day>\\d{2})", "2024-03-15")  # 将 re.match(r"(?P<year>\\d{4})-(?P<month>\\d{2})-(?P<day>\\d{2})", "2024-03-15") 赋给 m
print(m.group("year"))   # 2024
print(m.group("month"))  # 03
print(m.groupdict())     # {'year': '2024', 'month': '03', 'day': '15'}
\`\`\`

引用命名分组：在模式内用 \`(?P=name)\`，在替换里用 \`\\g<name>\`：

\`\`\`python
# 匹配重复的单词
print(re.search(r"\\b(\\w+)\\s+(?P=\\1)\\b", "the the cat").group())  # 输出 re.search(r"\\b(\\w+)\\s+(?P=\\1)\\b", "the the cat").group()
# the the

# 替换时用命名引用
print(re.sub(r"(?P<word>\\w+)", r"[\\g<word>]", "hi cat"))  # 输出 re.sub(r"(?P<word>\\w+)", r"[\\g<word>]", "hi cat")
# [hi] [cat]
\`\`\`

### 6.3 非捕获分组 (?: )

如果分组只是用来「分组」（比如应用量词），不需要捕获，用 \`(?:...)\` 非捕获分组，性能更好且不占用分组编号：

\`\`\`python
import re                          # 导入 re 模块

# 捕获分组
m1 = re.match(r"(https?)://(\\w+)", "https://abc")  # 将 re.match(r"(https?)://(\\w+)", "https://abc") 赋给 m1
print(m1.groups())  # ('https', 'abc')

# 非捕获分组：http 后的 s 不被捕获
m2 = re.match(r"https?://(\\w+)", "https://abc")  # 将 re.match(r"https?://(\\w+)", "https://abc") 赋给 m2
print(m2.groups())  # ('abc')
\`\`\`

养成习惯：**不需要捕获的括号都用 \`(?:...)\`**，能让分组编号更清晰、性能更优。

### 6.4 分组编号规则

分组按**左括号**出现的先后顺序编号。嵌套分组也按左括号顺序：

\`\`\`python
import re                          # 导入 re 模块
# (a(b)c(d)e) -> 1=abcde, 2=b, 3=d
m = re.match(r"(a(b)c(d)e)", "abcde")  # 将 re.match(r"(a(b)c(d)e)", "abcde") 赋给 m
print(m.group(1), m.group(2), m.group(3))  # abcde b d
\`\`\`

---

## 七、零宽断言（环视）

零宽断言（lookaround）用于「断言某个位置的前后是什么」，但**不消耗字符**。这是正则里比较高级但非常实用的特性。

| 写法 | 名称 | 含义 |
|------|------|------|
| \`(?=...)\` | 正向先行断言 | 右边必须匹配 ... |
| \`(?!...)\` | 负向先行断言 | 右边不能匹配 ... |
| \`(?<=...)\` | 正向后行断言 | 左边必须匹配 ... |
| \`(?<!...)\` | 负向后行断言 | 左边不能匹配 ... |

### 7.1 正向先行断言 (?=)

「后面跟着 ...」但不包含在结果里。经典用法：给数字加千分位逗号：

\`\`\`python
import re                          # 导入 re 模块
# 匹配「后面还有 3 的倍数个数字」的位置，插入逗号
s = "1234567"                      # 将字符串 "1234567" 赋给 s
print(re.sub(r"(?<=\\d)(?=(\\d{3})+$)", ",", s))  # 1,234,567
\`\`\`

提取价格里的数字（去掉 ¥ 符号）：

\`\`\`python
# 找出 ¥ 后面的数字，但不包含 ¥
print(re.findall(r"(?<=￥)\\d+", "￥100 和 ￥200"))  # 输出 re.findall(r"(?<=￥)\\d+", "￥100 和 ￥200")
# ['100', '200']
\`\`\`

### 7.2 负向先行断言 (?!)

「后面不是 ...」。比如匹配 foo 但后面不能是 bar：

\`\`\`python
import re                          # 导入 re 模块
# 匹配 Windows 后面不是 95/98 的
print(re.findall(r"Windows(?!95|98)", "Windows95 Windows7 Windows10"))  # 输出 re.findall(r"Windows(?!95|98)", "Windows95 Windows7 Windows10")
# ['Windows', 'Windows']（匹配 Windows7、Windows10 的 Windows）
\`\`\`

### 7.3 正向后行断言 (?<=)

「前面是 ...」。提取书名号里的内容：

\`\`\`python
import re                          # 导入 re 模块
print(re.findall(r"(?<=《)[^》]+", "我看《三体》和《活着》"))  # 输出 re.findall(r"(?<=《)[^》]+", "我看《三体》和《活着》")
# ['三体', '活着']
\`\`\`

### 7.4 负向后行断言 (?<!)

「前面不是 ...」。比如匹配不以 0 开头的数字：

\`\`\`python
import re                          # 导入 re 模块
print(re.findall(r"(?<!\\d)\\d+", "a01 b2"))  # 不行，这是看前面不是数字
\`\`\`

⚠️ Python 的后行断言要求**断言模式长度固定**（3.13 之前）。像 \`(?<=a|bb)\` 这种变长的会报错，3.13 开始支持变长后行断言。

---

## 八、反向引用

反向引用让你在模式里**引用前面捕获分组匹配到的内容**，常用于「匹配成对出现」的内容，比如 HTML 标签、引号包裹。

### 8.1 用 \\1 引用

\`\`\`python
import re                          # 导入 re 模块

# 匹配连续重复的单词
m = re.search(r"\\b(\\w+)\\s+\\1\\b", "I love love you")  # 将 re.search(r"\\b(\\w+)\\s+\\1\\b", "I love love you") 赋给 m
print(m.group())  # love love

# 匹配成对引号（单引号或双引号）
print(re.findall(r"(['\\\"])(.*?)\\1", "say 'hi' and \\"bye\\""))  # 输出 re.findall(r"(['\\\"])(.*?)\\1", "say 'hi' and \\"bye\\"")
# [("'", 'hi'), ('"', 'bye')]

# 匹配对称的 HTML 标签
html = "<b>bold</b> <i>italic</i>" # 将字符串 "<b>bold</b> <i>italic</i>" 赋给 html
print(re.findall(r"<(\\w+)>(.*?)</\\1>", html))  # 输出 re.findall(r"<(\\w+)>(.*?)</\\1>", html)
# [('b', 'bold'), ('i', 'italic')]
\`\`\`

\`\\1\` 在**模式里**引用第 1 个分组；在**替换字符串**里用 \`\\1\` 或 \`\\g<1>\` 引用。两者语法相似但语境不同。

### 8.2 命名反向引用

\`\`\`python
import re                          # 导入 re 模块
# 用命名分组 + 命名引用
print(re.search(r"(?P<tag>\\w+)=(?P=tag)", "x=x y=y").group())  # x=x
\`\`\`

---

## 九、常见模式库

下面是一些实用的正则模式，注意**正则没有「绝对完美」的邮箱/URL 正则**，这些是「够用」版本，生产环境按需调整。

### 9.1 邮箱

\`\`\`python
import re                          # 导入 re 模块
email_re = r"[\\w.+-]+@[\\w-]+\\.[\\w.-]+"  # 将 r"[\\w.+-]+@[\\w-]+\\.[\\w.-]+" 赋给 email_re
print(re.findall(email_re, "联系 tom@example.com 或 a.b+test@demo.org"))  # 输出 re.findall(email_re, "联系 tom@example.com 或 a.b+test@demo.org")
# ['tom@example.com', 'a.b+test@demo.org']
\`\`\`

### 9.2 手机号（中国大陆）

\`\`\`python
import re                          # 导入 re 模块
phone_re = r"1[3-9]\\d{9}"         # 将 r"1[3-9]\\d{9}" 赋给 phone_re
print(re.findall(phone_re, "电话13800138000，备选19900001111"))  # 输出 re.findall(phone_re, "电话13800138000，备选19900001111")
# ['13800138000', '19900001111']
\`\`\`

### 9.3 URL

\`\`\`python
import re                          # 导入 re 模块
url_re = r"https?://[\\w.-]+(?:/[\\w./?=&%-]*)?"  # 将 r"https?://[\\w.-]+(?:/[\\w./?=&%-]*)?" 赋给 url_re
print(re.findall(url_re, "访问 http://abc.com/x?a=1 或 https://demo.org"))  # 输出 re.findall(url_re, "访问 http://abc.com/x?a=1 或 https://demo.org")
# ['http://abc.com/x?a=1', 'https://demo.org']
\`\`\`

### 9.4 IPv4

\`\`\`python
import re                          # 导入 re 模块
ip_re = r"(?:\\d{1,3}\\.){3}\\d{1,3}"  # 将 r"(?:\\d{1,3}\\.){3}\\d{1,3}" 赋给 ip_re
print(re.findall(ip_re, "服务器 192.168.1.1 和 10.0.0.1"))  # 输出 re.findall(ip_re, "服务器 192.168.1.1 和 10.0.0.1")
# ['192.168.1.1', '10.0.0.1']
# 注意：这只校验格式，不校验范围（255.999.1.1 也能匹配）
\`\`\`

严格校验每段 0-255：

\`\`\`python
import re                          # 导入 re 模块
seg = r"(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)"  # 将 r"(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)" 赋给 seg
ip_strict = re.compile(rf"^{seg}\\.{seg}\\.{seg}\\.{seg}$")  # 将 re.compile(rf"^{seg}\\.{seg}\\.{seg}\\.{seg}$") 赋给 ip_strict
print(bool(ip_strict.fullmatch("192.168.1.1")))   # True
print(bool(ip_strict.fullmatch("999.1.1.1")))     # False
\`\`\`

### 9.5 身份证号（18 位）

\`\`\`python
import re                          # 导入 re 模块
id_re = r"[1-9]\\d{5}(?:19|20)\\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]"  # 将 r"[1-9]\\d{5}(?:19|20)\\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]" 赋给 id_re
print(re.findall(id_re, "身份证 11010119900307391X 不可用"))  # 输出 re.findall(id_re, "身份证 11010119900307391X 不可用")
# ['11010119900307391X']
\`\`\`

---

## 十、re.escape 与动态模式

当模式里需要包含「来自用户输入的字符串」时，那些字符串里可能含有正则元字符，必须转义。\`re.escape\` 自动帮你转义所有特殊字符：

\`\`\`python
import re                          # 导入 re 模块

user_input = "price is $5.00 each"  # 用户搜的关键字
pattern = re.escape(user_input)    # 将 re.escape(user_input) 赋给 pattern
print(pattern)  # price\\ is\\ \\$5\\.00\\ each
print(re.findall(pattern, "the price is $5.00 each today"))  # 输出 re.findall(pattern, "the price is $5.00 each today")
# ['price is $5.00 each']
\`\`\`

**安全提醒**：永远不要用字符串拼接把用户输入塞进正则模式，要么用 \`re.escape\`，要么用参数化思路。否则用户输入 \`.*\` 会匹配一切，甚至可能触发 ReDoS。

---

## 十一、性能优化与 ReDoS

### 11.1 编译复用

同一个模式匹配多个字符串，预编译 \`re.compile\` 比每次调用 \`re.findall\` 快——后者每次都要重新解析模式。

### 11.2 避免回溯爆炸（ReDoS）

ReDoS（Regular Expression Denial of Service）是指某些正则在遇到特定输入时，回溯次数呈指数增长，导致程序卡死。典型危险模式：**嵌套量词 + 重叠分支**，如 \`(a+)+\` 或 \`(a|a)*\`：

\`\`\`python
# 危险！这段代码在恶意输入下会卡很久
# import re
# re.match(r"^(a+)+$", "a" * 30 + "b")  # 指数级回溯
\`\`\`

防范：
- 避免嵌套量词（\`(a+)+\`）
- 用占有量词 \`++\`（3.11+）阻止回溯
- 用 \`re.search\` 而非给整段加 \`^...$\` 再全量匹配
- 对用户输入的待匹配文本长度设上限
- 用 \`re.match\` 配合 \`timeout\`（标准库暂无，可用 \`signal\` 在主线程限制）

### 11.3 用具体字符类替代 .

\`.\` 会匹配几乎所有字符，回溯空间大。能用 \`[^<>]\` 这种「明确的非匹配」就别用 \`.*\`。比如提取 HTML 标签内容：

\`\`\`python
# 不推荐：.* 回溯空间大
re.search(r"<b>(.*?)</b>", html)   # 对 re 调用 search 方法，参数 r"<b>(.*?)</b>", html
# 推荐：明确「不是 <」的字符
re.search(r"<b>([^<]*)</b>", html) # 对 re 调用 search 方法，参数 r"<b>([^<]*)</b>", html
\`\`\`

### 11.4 锚定位置

能加 \`^\` \`$\` \`\\b\` 锚定就加，能大幅减少搜索范围：

\`\`\`python
# 不加锚，每个位置都尝试匹配
re.search(r"\\d{11}", text)        # 对 re 调用 search 方法，参数 r"\\d{11}", text
# 加锚定，只在边界处尝试
re.search(r"\\b\\d{11}\\b", text)  # 对 re 调用 search 方法，参数 r"\\b\\d{11}\\b", text
\`\`\`

---

## 十二、正则常见陷阱

### 12.1 贪婪导致「吃太多」

\`\`\`python
import re                          # 导入 re 模块
# 想提取两个引号之间的内容
s = 'a "hi" b "bye" c'             # 将字符串 'a "hi" b "bye" c' 赋给 s
print(re.findall(r'".*"', s))     # ['"hi" b "bye"'] —— 贪婪吃到最后
print(re.findall(r'".*?"', s))    # ['"hi"', '"bye"'] —— 非贪婪正确
\`\`\`

### 12.2 findall 返回值随分组变化

\`\`\`python
import re                          # 导入 re 模块
# 无分组：返回整个匹配
print(re.findall(r"\\d+", "a1 b2"))   # ['1', '2']
# 有 1 个分组：返回分组
print(re.findall(r"(\\d)", "a1 b2"))  # ['1', '2']
# 有 2 个分组：返回元组
print(re.findall(r"(\\w)(\\d)", "a1 b2"))  # [('a', '1'), ('b', '2')]
\`\`\`

如果只想让括号分组但不影响 \`findall\` 返回，用 \`(?:...)\` 非捕获。

### 12.3 点号不匹配换行

\`\`\`python
import re                          # 导入 re 模块
text = "start\\nend"               # 将字符串 "start\\nend" 赋给 text
print(re.search(r"start.*end", text))        # None —— . 不匹配换行
print(re.search(r"start.*end", text, re.S))  # 匹配 —— DOTALL 让 . 匹配换行
\`\`\`

### 12.4 反斜杠与原始字符串

正则里反斜杠多，Python 字符串里反斜杠也是转义符，两层叠加极易出错。**永远用原始字符串 \`r""\` 写正则**：

\`\`\`python
# 错误：\\\\d 在普通字符串里是 \\d，但容易写错
# 正确：用 r"" 让反斜杠原样传递
re.findall(r"\\d+", "a1")   # ['1']
\`\`\`

\`r"\\d"\` 里的 \`\\d\` 是两个字符 \`\\\` 和 \`d\`，传给 re 后被解释为「数字」。

### 12.5 字符集里的特殊字符

\`\`\`python
import re                          # 导入 re 模块
# [.] 里的 . 是字面点，不需要转义
print(re.findall(r"[.]", "a.b"))   # ['.', '.'] —— 等价 [\\.]
# [-a] 把 - 放开头，匹配 - 或 a
print(re.findall(r"[-a]", "a-b"))  # ['a', '-', 'b']
\`\`\`

---

## 十三、本章小结

- **match/search/fullmatch** 三者对位置要求不同：开头、任意、全部
- **findall** 返回值随分组数量变化，需特别留意
- **compile** 复用模式提性能，**flags** 改变匹配行为（I/M/S/X 最常用）
- **贪婪 \`*\`** 默认多匹配，**非贪婪 \`*?\`** 少匹配，处理成对标记用非贪婪
- **分组** \`()\` 捕获、\`(?:)\` 非捕获、\`(?P<name>)\` 命名、\`\\1\` 反向引用
- **零宽断言** \`(?=)\` \`(?<=)\` 等，断言位置不消耗字符
- **re.escape** 转义用户输入，防注入防 ReDoS
- **永远用 \`r""\` 写正则**，避免反斜杠双重转义地狱

正则表达式是「写一次头疼，用无数次省事」的工具。掌握本章后，你遇到字符串模式匹配问题，第一反应应该先是「这个用正则合适吗」，合适再动手——这才是成熟工程师的正则观。

下一章我们将学习 JSON / XML / CSV 三种数据格式的读写，它们是数据持久化与交换的基础。
`,
    code: `# ============================================================
# 第一章演示代码：正则表达式深入
# 直接运行 python3 此文件即可看到全部输出
# ============================================================

import re

# ------------------------------------------------------------
# 1. match / search / fullmatch 的区别
# ------------------------------------------------------------
print("=" * 60)
print("1. match / search / fullmatch")
print("=" * 60)

s = "hello world"

print("match hello:", bool(re.match(r"hello", s)))      # True
print("match world:", bool(re.match(r"world", s)))      # False
print("search world:", bool(re.search(r"world", s)))    # True
print("fullmatch 'hello world':", bool(re.fullmatch(r"hello world", s)))  # True
print("fullmatch 'hello':", bool(re.fullmatch(r"hello", s)))             # False

# Match 对象的常用方法
m = re.search(r"(\\w+)@(\\w+)", "邮箱: tom@example")
print("group(0):", m.group(0))
print("group(1):", m.group(1))
print("group(2):", m.group(2))
print("groups:", m.groups())
print("span:", m.span())
print("start/end:", m.start(), m.end())


# ------------------------------------------------------------
# 2. findall 与 finditer
# ------------------------------------------------------------
print()
print("=" * 60)
print("2. findall 与 finditer")
print("=" * 60)

text = "电话13800138000，备选13900139000"

# 无分组
print("无分组:", re.findall(r"\\d{11}", text))
# 有一个分组
print("一个分组:", re.findall(r"(\\d{3})\\d{8}", text))
# 多个分组
print("多分组:", re.findall(r"(\\d{3})-(\\d{4})", "010-1234, 021-5678"))

# finditer 惰性迭代
print("finditer:")
for mt in re.finditer(r"\\d+", "a1 b22 c333"):
    print("  ", mt.group(), mt.span())


# ------------------------------------------------------------
# 3. sub / subn 替换
# ------------------------------------------------------------
print()
print("=" * 60)
print("3. sub / subn 替换")
print("=" * 60)

print("字符串替换:", re.sub(r"\\d+", "#", "a1 b22 c333"))
print("限次替换:", re.sub(r"\\d+", "#", "a1 b22 c333", count=2))

new, n = re.subn(r"\\d+", "#", "a1 b22 c333")
print("subn:", new, n)

# 函数替换：数字加 1
def add_one(m):
    return str(int(m.group()) + 1)

print("函数替换:", re.sub(r"\\d+", add_one, "a1 b22 c333"))

# 反向引用替换：隐藏手机号
print("隐藏手机:", re.sub(r"(\\d{3})\\d{4}(\\d{4})", r"\\1****\\2", "13812345678"))


# ------------------------------------------------------------
# 4. split 分割
# ------------------------------------------------------------
print()
print("=" * 60)
print("4. split 分割")
print("=" * 60)

print("多分隔符:", re.split(r"[\\s,]+", "a, b ,  c ,d"))
print("带分组:", re.split(r"(\\s,)+", "a, b ,  c"))
print("限次:", re.split(r"\\d+", "a1b2c3d", maxsplit=2))


# ------------------------------------------------------------
# 5. compile 与 flags
# ------------------------------------------------------------
print()
print("=" * 60)
print("5. compile 与 flags")
print("=" * 60)

phone_re = re.compile(r"1[3-9]\\d{9}")
for num in ["13800138000", "12345", "19900001111"]:
    print("  ", num, "->", bool(phone_re.fullmatch(num)))

# IGNORECASE
print("IGNORECASE:", re.findall(r"python", "Python PYTHON pyTHON", re.I))

# MULTILINE
ml_text = "line1\\nline2\\nline3"
print("MULTILINE:", re.findall(r"^line\\w+", ml_text, re.M))

# DOTALL
ds = "<div>hello\\nworld</div>"
print("DOTALL:", re.search(r"<div>(.*?)</div>", ds, re.S).group(1))

# VERBOSE 详细模式
verbose_re = re.compile(r"""
    1            # 第1位固定1
    [3-9]        # 第2位 3-9
    \\d{9}       # 后9位
""", re.VERBOSE)
print("VERBOSE:", bool(verbose_re.fullmatch("13812345678")))

# 内联标志
print("内联(?i):", re.findall(r"(?i)python", "Python PYTHON"))

print("pattern/flags:", phone_re.pattern, phone_re.flags)


# ------------------------------------------------------------
# 6. 字符类与预定义
# ------------------------------------------------------------
print()
print("=" * 60)
print("6. 字符类与预定义字符")
print("=" * 60)

print("\\\\w+:", re.findall(r"\\w+", "hello 你好 world_1"))
print("\\\\d+:", re.findall(r"\\d+", "a12b3"))
print("\\\\s+:", re.findall(r"\\s+", "a b  c"))
print("[aeiou]:", re.findall(r"[aeiou]", "hello world"))
print("[^0-9]:", re.findall(r"[^0-9]+", "a1b2c3"))

# 锚点
print("\\\\bcat\\\\b:", re.findall(r"\\bcat\\b", "a cat category cat."))
print("^\\\\w+ M:", re.findall(r"^\\w+", "hello\\nworld", re.M))


# ------------------------------------------------------------
# 7. 量词：贪婪与非贪婪
# ------------------------------------------------------------
print()
print("=" * 60)
print("7. 量词")
print("=" * 60)

print("\\\\d{3}:", re.findall(r"\\d{3}", "12 123 1234 12345"))
print("\\\\d{2,4}:", re.findall(r"\\d{2,4}", "1 12 123 1234 12345"))

html = "<b>bold</b><i>italic</i>"
print("贪婪 .*:", re.findall(r"<.*>", html))
print("非贪婪 .*?:", re.findall(r"<.*?>", html))

# 占有量词 (3.11+)
print("占有 *+:", re.match(r"\\d++", "12345").group())


# ------------------------------------------------------------
# 8. 分组与命名
# ------------------------------------------------------------
print()
print("=" * 60)
print("8. 分组与命名")
print("=" * 60)

date = "2024-03-15"
m = re.match(r"(\\d{4})-(\\d{2})-(\\d{2})", date)
print("年月日:", m.group(1), m.group(2), m.group(3))
print("groups:", m.groups())
print("重组:", "-".join(reversed(m.groups())))

# 命名分组
m2 = re.match(r"(?P<year>\\d{4})-(?P<month>\\d{2})-(?P<day>\\d{2})", date)
print("命名:", m2.groupdict())

# 非捕获分组
m3 = re.match(r"https?://(\\w+)", "https://abc")
print("非捕获:", m3.groups())

# 分组编号
m4 = re.match(r"(a(b)c(d)e)", "abcde")
print("嵌套编号:", m4.group(1), m4.group(2), m4.group(3))


# ------------------------------------------------------------
# 9. 零宽断言
# ------------------------------------------------------------
print()
print("=" * 60)
print("9. 零宽断言")
print("=" * 60)

# 正向先行：千分位
print("千分位:", re.sub(r"(?<=\\d)(?=(\\d{3})+$)", ",", "1234567"))

# 正向后行：提取书名号内容
print("书名号:", re.findall(r"(?<=《)[^》]+", "我看《三体》和《活着》"))

# 正向后行：￥ 后的数字
print("￥金额:", re.findall(r"(?<=￥)\\d+", "￥100 和 ￥200"))

# 负向先行：Windows 后不是 95/98
print("负向先行:", re.findall(r"Windows(?!95|98)", "Windows95 Windows7 Windows10"))


# ------------------------------------------------------------
# 10. 反向引用
# ------------------------------------------------------------
print()
print("=" * 60)
print("10. 反向引用")
print("=" * 60)

# 重复单词
print("重复单词:", re.search(r"\\b(\\w+)\\s+\\1\\b", "I love love you").group())

# 成对引号
print("成对引号:", re.findall(r"(['\\\"])(.*?)\\1", "say 'hi' and \\"bye\\""))

# 对称 HTML 标签
print("对称标签:", re.findall(r"<(\\w+)>(.*?)</\\1>", "<b>bold</b> <i>italic</i>"))

# 命名反向引用
print("命名反向:", re.search(r"(?P<tag>\\w+)=(?P=tag)", "x=x y=y").group())


# ------------------------------------------------------------
# 11. 常见模式库
# ------------------------------------------------------------
print()
print("=" * 60)
print("11. 常见模式库")
print("=" * 60)

email_re = r"[\\w.+-]+@[\\w-]+\\.[\\w.-]+"
print("邮箱:", re.findall(email_re, "联系 tom@example.com 或 a.b+test@demo.org"))

phone_re2 = r"1[3-9]\\d{9}"
print("手机:", re.findall(phone_re2, "电话13800138000，备选19900001111"))

url_re = r"https?://[\\w.-]+(?:/[\\w./?=&%-]*)?"
print("URL:", re.findall(url_re, "访问 http://abc.com/x?a=1 或 https://demo.org"))

ip_re = r"(?:\\d{1,3}\\.){3}\\d{1,3}"
print("IPv4(松):", re.findall(ip_re, "服务器 192.168.1.1 和 10.0.0.1"))

# 严格 IPv4
seg = r"(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)"
ip_strict = re.compile(seg + r"\\." + seg + r"\\." + seg + r"\\." + seg)
print("IPv4(严) 192.168.1.1:", bool(ip_strict.fullmatch("192.168.1.1")))
print("IPv4(严) 999.1.1.1:", bool(ip_strict.fullmatch("999.1.1.1")))

id_re = r"[1-9]\\d{5}(?:19|20)\\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]"
print("身份证:", re.findall(id_re, "身份证 11010119900307391X 不可用"))


# ------------------------------------------------------------
# 12. re.escape
# ------------------------------------------------------------
print()
print("=" * 60)
print("12. re.escape")
print("=" * 60)

user_input = "price is $5.00 each"
escaped = re.escape(user_input)
print("转义后:", escaped)
print("匹配:", re.findall(escaped, "the price is $5.00 each today"))


# ------------------------------------------------------------
# 13. 陷阱演示
# ------------------------------------------------------------
print()
print("=" * 60)
print("13. 常见陷阱")
print("=" * 60)

# 贪婪陷阱
s = 'a "hi" b "bye" c'
print("贪婪引号:", re.findall(r'".*"', s))
print("非贪婪引号:", re.findall(r'".*?"', s))

# findall 返回值随分组变化
print("无分组:", re.findall(r"\\d+", "a1 b2"))
print("1分组:", re.findall(r"(\\d)", "a1 b2"))
print("2分组:", re.findall(r"(\\w)(\\d)", "a1 b2"))

# 点号不匹配换行
t = "start\\nend"
print("无 DOTALL:", bool(re.search(r"start.*end", t)))
print("有 DOTALL:", bool(re.search(r"start.*end", t, re.S)))

# 字符集内特殊字符
print("[.]:", re.findall(r"[.]", "a.b"))
print("[-a]:", re.findall(r"[-a]", "a-b"))


# ------------------------------------------------------------
# 14. 性能对比：编译 vs 不编译
# ------------------------------------------------------------
print()
print("=" * 60)
print("14. 性能对比")
print("=" * 60)

import timeit

pattern_str = r"\\d{3}-\\d{4}"
compiled = re.compile(pattern_str)
data = ["010-1234", "021-5678", "abc", "999-0000"] * 1000

def use_compiled():
    for d in data:
        compiled.fullmatch(d)

def use_inline():
    for d in data:
        re.fullmatch(pattern_str, d)

t1 = timeit.timeit(use_compiled, number=3)
t2 = timeit.timeit(use_inline, number=3)
print("编译复用: %.4f 秒" % t1)
print("每次解析: %.4f 秒" % t2)
print("编译快 %.1f 倍" % (t2 / t1))


# ------------------------------------------------------------
# 15. 综合实战：日志解析
# ------------------------------------------------------------
print()
print("=" * 60)
print("15. 综合实战：日志解析")
print("=" * 60)

log = """
[2024-03-15 10:23:45] INFO  login user=tom ip=192.168.1.10
[2024-03-15 10:24:01] WARN  retry user=tom ip=192.168.1.10
[2024-03-15 10:25:33] ERROR crash user=jerry ip=10.0.0.5
"""

log_re = re.compile(
    r"\\[(?P<time>\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2})\\]\\s+"
    r"(?P<level>\\w+)\\s+"
    r"(?P<msg>\\w+)\\s+"
    r"user=(?P<user>\\w+)\\s+"
    r"ip=(?P<ip>\\d+\\.\\d+\\.\\d+\\.\\d+)"
)

for line in log.strip().splitlines():
    m = log_re.search(line)
    if m:
        d = m.groupdict()
        print("  时间:%s 级别:%s 用户:%s IP:%s" % (d["time"], d["level"], d["user"], d["ip"]))

print()
print("正则演示全部完成！")
`,
  },
  // =========================================================
  // 第二章：JSON/XML/CSV 数据格式
  // =========================================================
  {
    id: "py-json-xml-csv",
    group: "数据处理与持久化",
    icon: "📋",
    title: "JSON/XML/CSV 数据格式",
    content: `# JSON/XML/CSV 数据格式

程序要持久化数据、要和其他程序通信，就得把内存里的对象「翻译」成一种**双方都能读懂的文本格式**。JSON、XML、CSV 是三种最通用的数据交换格式，各自擅长不同场景：

- **JSON**：Web API 的事实标准，结构化、可读、轻量
- **XML**：配置文件、文档、企业级数据交换，标签式、可扩展
- **CSV**：表格数据，最简单，一行一条记录，Excel 友好

本章会分别讲 Python 标准库对这三种格式的读写，最后简介 YAML 和 TOML。

---

## 一、JSON 基础

JSON（JavaScript Object Notation）用「键值对」和「数组」描述数据，结构和 Python 的 dict / list 几乎一一对应，所以 Python 处理 JSON 特别顺手。

### 1.1 JSON 与 Python 类型对照

| JSON | Python |
|------|--------|
| object \`{}\` | dict |
| array \`[]\` | list |
| string | str |
| number (int) | int |
| number (float) | float |
| true / false | True / False |
| null | None |

注意：JSON 没有元组、集合、日期、字节等概念，这些需要特殊处理。

### 1.2 dumps / loads：字符串与对象互转

\`json.dumps(obj)\` 把 Python 对象**序列化成 JSON 字符串**，\`json.loads(s)\` 把 JSON 字符串**反序列化回 Python 对象**。\`s\` 是 string 的缩写。

\`\`\`python
import json                        # 导入 json 模块

# 对象 -> JSON 字符串
data = {"name": "tom", "age": 18, "scores": [90, 85, 88]}  # 创建字典并赋给 data
s = json.dumps(data)               # 将 json.dumps(data) 赋给 s
print(s)  # {"name": "tom", "age": 18, "scores": [90, 85, 88]}
print(type(s))  # <class 'str'>

# JSON 字符串 -> 对象
obj = json.loads(s)                # 将 json.loads(s) 赋给 obj
print(obj["name"])   # tom
print(obj["scores"]) # [90, 85, 88]
\`\`\`

### 1.3 dump / load：直接读写文件

\`json.dump(obj, f)\` 把对象写进文件，\`json.load(f)\` 从文件读出来。省去你自己 \`open\` + \`read\` 再 \`loads\` 的步骤。

\`\`\`python
import json                        # 导入 json 模块

data = {"name": "tom", "age": 18}  # 创建字典并赋给 data
# 写文件
with open("data.json", "w", encoding="utf-8") as f:  # 使用上下文管理器 open("data.json", "w", encoding="utf-8")，绑定到 f
    json.dump(data, f)             # 对 json 调用 dump 方法，参数 data, f

# 读文件
with open("data.json", encoding="utf-8") as f:  # 使用上下文管理器 open("data.json", encoding="utf-8")，绑定到 f
    obj = json.load(f)             # 将 json.load(f) 赋给 obj
print(obj)  # {'name': 'tom', 'age': 18}
\`\`\`

⚠️ 写含中文的 JSON 一定要加 \`ensure_ascii=False\`（见下节），否则中文会变成 \`\\uXXXX\` 转义。

---

## 二、dumps 的常用参数

### 2.1 ensure_ascii

默认 \`ensure_ascii=True\`，所有非 ASCII 字符（中文等）会被转成 \`\\uXXXX\` 转义序列。这在只给机器看时没问题，但人读不了：

\`\`\`python
import json                        # 导入 json 模块
print(json.dumps({"名": "张三"}))                    # {"\\u540d": "\\u5f20\\u4e09"}
print(json.dumps({"名": "张三"}, ensure_ascii=False)) # {"名": "张三"}
\`\`\`

**写中文 JSON 一律加 \`ensure_ascii=False\`**，这是最常见的需求。

### 2.2 indent 缩进美化

默认 \`dumps\` 输出单行紧凑 JSON。加 \`indent=2\` 会带缩进，方便人读：

\`\`\`python
import json                        # 导入 json 模块
data = {"name": "tom", "scores": [90, 85]}  # 创建字典并赋给 data
print(json.dumps(data, indent=2, ensure_ascii=False))  # 输出 json.dumps(data, indent=2, ensure_ascii=False)
# {
#   "name": "tom",
#   "scores": [
#     90,
#     85
#   ]
# }
\`\`\`

\`indent\` 的值是缩进的空格数。也可以传字符串如 \`indent="\\t"\` 用制表符。

### 2.3 sort_keys

\`sort_keys=True\` 会按 key 排序输出。在「生成配置文件、做缓存对比」时有用——保证同样数据生成同样字符串（确定性输出）：

\`\`\`python
import json                        # 导入 json 模块
data = {"b": 1, "a": 2, "c": 3}    # 创建字典并赋给 data
print(json.dumps(data, sort_keys=True))  # {"a": 2, "b": 1, "c": 3}
\`\`\`

### 2.4 separators

\`separators=(item_sep, key_sep)\` 控制分隔符。默认在紧凑模式下是 \`(', ', ': ')\`。要更紧凑可以去掉空格：

\`\`\`python
import json                        # 导入 json 模块
data = {"a": 1, "b": 2}            # 创建字典并赋给 data
print(json.dumps(data, separators=(",", ":")))  # {"a":1,"b":2}
\`\`\`

这在数据量大、需要省带宽时有用。

---

## 三、处理不可序列化对象

### 3.1 报错场景

JSON 只认 dict/list/str/number/bool/None。遇到日期、集合、自定义对象会抛 \`TypeError\`：

\`\`\`python
import json                        # 导入 json 模块
from datetime import datetime      # 从 datetime 导入 datetime
data = {"now": datetime.now(), "tags": {1, 2}}  # 创建字典并赋给 data
# json.dumps(data)  # TypeError: Object of type datetime is not JSON serializable
\`\`\`

### 3.2 方式一：default 函数

\`dumps\` 接受 \`default\` 参数，遇到不能序列化的对象时调用它。返回一个可序列化的值即可：

\`\`\`python
import json                        # 导入 json 模块
from datetime import datetime, date  # 从 datetime 导入 datetime, date

def default(o):                    # 定义函数 default，参数：o
    if isinstance(o, (datetime, date)):  # 如果 isinstance(o, (datetime, date)) 成立
        return o.isoformat()       # 返回 o.isoformat()
    if isinstance(o, set):         # 如果 isinstance(o, set) 成立
        return list(o)             # 返回 list(o)
    raise TypeError("不会处理: " + repr(o))  # 抛出异常：TypeError("不会处理: " + repr(o))

data = {"now": datetime(2024, 3, 15, 10, 0), "tags": {1, 2}}  # 创建字典并赋给 data
print(json.dumps(data, default=default, ensure_ascii=False))  # 输出 json.dumps(data, default=default, ensure_ascii=False)
# {"now": "2024-03-15T10:00:00", "tags": [1, 2]}
\`\`\`

### 3.3 方式二：自定义 JSONEncoder

继承 \`json.JSONEncoder\` 重写 \`default\` 方法，传给 \`cls\` 参数。适合复用：

\`\`\`python
import json                        # 导入 json 模块
from datetime import datetime, date  # 从 datetime 导入 datetime, date

class MyEncoder(json.JSONEncoder): # 定义类 MyEncoder，继承自 json.JSONEncoder
    def default(self, o):          # 定义函数 default，参数：self, o
        if isinstance(o, (datetime, date)):  # 如果 isinstance(o, (datetime, date)) 成立
            return o.isoformat()   # 返回 o.isoformat()
        if isinstance(o, set):     # 如果 isinstance(o, set) 成立
            return sorted(o)       # 返回 sorted(o)
        return super().default(o)  # 返回 super().default(o)

data = {"now": datetime(2024, 3, 15), "tags": {3, 1, 2}}  # 创建字典并赋给 data
print(json.dumps(data, cls=MyEncoder, ensure_ascii=False))  # 输出 json.dumps(data, cls=MyEncoder, ensure_ascii=False)
\`\`\`

### 3.4 反序列化：object_hook

\`loads\` 接受 \`object_hook\` 参数，每解析到一个 dict 就传给它，可以转换成自定义对象。常用来「把 ISO 日期字符串还原成 datetime」：

\`\`\`python
import json                        # 导入 json 模块
from datetime import datetime      # 从 datetime 导入 datetime

def as_date(d):                    # 定义函数 as_date，参数：d
    for k, v in d.items():         # 遍历 d.items()，每次取值赋给 k, v
        if isinstance(v, str) and "T" in v:  # 如果 isinstance(v, str) and "T" in v 成立
            try:                   # 尝试执行以下代码块
                d[k] = datetime.fromisoformat(v)
            except ValueError:     # 捕获 ValueError 异常
                pass               # 空操作，占位
    return d                       # 返回 d

s = '{"now": "2024-03-15T10:00:00"}'  # 将字符串 '{"now": "2024-03-15T10:00:00"}' 赋给 s
obj = json.loads(s, object_hook=as_date)  # 将 json.loads(s, object_hook=as_date) 赋给 obj
print(obj)            # {'now': datetime.datetime(2024, 3, 15, 10, 0)}
print(type(obj["now"]))            # 输出 type(obj["now"])
\`\`\`

### 3.5 自定义对象的序列化套路

让自定义类支持 \`__\`json\`\` 或在 default 里判断类型：

\`\`\`python
import json                        # 导入 json 模块

class User:                        # 定义类 User
    def __init__(self, name, age): # 定义函数 __init__，参数：self, name, age
        self.name = name
        self.age = age
    def to_dict(self):             # 定义函数 to_dict，参数：self
        return {"name": self.name, "age": self.age}  # 返回 {"name": self.name, "age": self.age}

u = User("tom", 18)                # 将 User("tom", 18) 赋给 u
print(json.dumps(u, default=lambda o: o.to_dict() if isinstance(o, User) else None))  # 输出 json.dumps(u, default=lambda o: o.to_dict() if isinstance(o, User) else None)
# {"name": "tom", "age": 18}
\`\`\`

更通用的做法是定义一个「能识别多种类型」的 default 函数。

---

## 四、JSON 进阶

### 4.1 嵌套与多层

JSON 可以任意嵌套，Python 的 dict/list 也能对应：

\`\`\`python
import json                        # 导入 json 模块
api = {                            # 将 { 赋给 api
    "code": 0,
    "data": {
        "users": [
            {"id": 1, "name": "tom"},
            {"id": 2, "name": "jerry"}
        ],
        "total": 2
    }
}
s = json.dumps(api, ensure_ascii=False, indent=2)  # 将 json.dumps(api, ensure_ascii=False, indent=2) 赋给 s
obj = json.loads(s)                # 将 json.loads(s) 赋给 obj
print(obj["data"]["users"][0]["name"])  # tom
\`\`\`

### 4.2 JSONDecodeError 错误处理

解析非法 JSON 会抛 \`json.JSONDecodeError\`，它是 \`ValueError\` 的子类。处理外部数据时务必 try：

\`\`\`python
import json                        # 导入 json 模块
try:                               # 尝试执行以下代码块
    obj = json.loads("{bad json")  # 将 json.loads("{bad json") 赋给 obj
except json.JSONDecodeError as e:
    print("JSON 解析失败:", e.msg, "位置", e.pos)  # 输出 "JSON 解析失败:", e.msg, "位置", e.pos
\`\`\`

### 4.3 流式解析：大文件

\`json.load\` 会把整个文件读进内存。如果是几 GB 的 JSON 数组，可以用 \`ijson\` 第三方库流式解析。标准库对此支持有限，但可以按行解析「JSON Lines」格式（每行一个独立 JSON 对象）：

\`\`\`python
# 假设 data.jsonl 每行一个 JSON
# with open("data.jsonl") as f:
#     for line in f:
#         obj = json.loads(line)
#         process(obj)
\`\`\`

---

## 五、XML 解析：ElementTree

XML 用标签描述结构，比 JSON 啰嗦但更「文档化」。Python 标准库 \`xml.etree.ElementTree\` 是解析 XML 的首选（轻量够用）。

### 5.1 XML 长什么样

\`\`\`xml
<users>
    <user id="1">
        <name>tom</name>
        <age>18</age>
    </user>
    <user id="2">
        <name>jerry</name>
        <age>20</age>
    </user>
</users>
\`\`\`

### 5.2 解析：fromstring / parse

\`\`\`python
import xml.etree.ElementTree as ET # 导入 xml.etree.ElementTree 模块并取别名 ET

xml_str = """                      # 将字符串 """ 赋给 xml_str
<users>
    <user id="1"><name>tom</name><age>18</age></user>
    <user id="2"><name>jerry</name><age>20</age></user>
</users>
"""
root = ET.fromstring(xml_str)      # 将 ET.fromstring(xml_str) 赋给 root
print(root.tag)  # users

# 从文件解析
# tree = ET.parse("data.xml")
# root = tree.getroot()
\`\`\`

### 5.3 遍历：find / findall / iter

- \`find(tag)\`：找第一个直接子节点
- \`findall(tag)\`：找所有直接子节点
- \`iter(tag)\`：递归找所有后代节点

\`\`\`python
import xml.etree.ElementTree as ET # 导入 xml.etree.ElementTree 模块并取别名 ET

root = ET.fromstring("""           # 将 ET.fromstring(""" 赋给 root
<users>
    <user id="1"><name>tom</name><age>18</age></user>
    <user id="2"><name>jerry</name><age>20</age></user>
</users>
""")

for user in root.findall("user"):  # 遍历 root.findall("user")，每次取值赋给 user
    uid = user.get("id")            # 属性
    name = user.find("name").text   # 子节点文本
    age = user.find("age").text    # 将 user.find("age").text 赋给 age
    print(uid, name, age)          # 输出 uid, name, age
# 1 tom 18
# 2 jerry 20
\`\`\`

⚠️ 注意 XPath 的路径：\`findall("user")\` 只找**直接子节点** user；要找任意层级的 user 用 \`.//user\`。

### 5.4 Element 的属性与文本

\`\`\`python
elem = root.find("user")           # 将 root.find("user") 赋给 elem
print(elem.get("id"))     # 1 —— 取属性
print(elem.attrib)        # {'id': '1'} —— 所有属性字典
print(elem.find("name").text)  # tom —— 取文本
\`\`\`

---

## 六、XML 生成：Element / SubElement / tostring

### 6.1 构建树

\`\`\`python
import xml.etree.ElementTree as ET # 导入 xml.etree.ElementTree 模块并取别名 ET

root = ET.Element("users")         # 将 ET.Element("users") 赋给 root
for u in [{"id": "1", "name": "tom", "age": "18"},
          {"id": "2", "name": "jerry", "age": "20"}]:
    user = ET.SubElement(root, "user", id=u["id"])  # 将 ET.SubElement(root, "user", id=u["id"]) 赋给 user
    ET.SubElement(user, "name").text = u["name"]
    ET.SubElement(user, "age").text = u["age"]

xml_bytes = ET.tostring(root, encoding="unicode")  # 将 ET.tostring(root, encoding="unicode") 赋给 xml_bytes
print(xml_bytes)                   # 输出 xml_bytes
\`\`\`

### 6.2 缩进美化 (3.9+)

\`ET.indent(tree, space="  ")\` 给 XML 加缩进：

\`\`\`python
import xml.etree.ElementTree as ET # 导入 xml.etree.ElementTree 模块并取别名 ET
root = ET.Element("a")             # 将 ET.Element("a") 赋给 root
ET.SubElement(root, "b").text = "1"
ET.indent(root, space="  ")        # 对 ET 调用 indent 方法，参数 root, space="  "
print(ET.tostring(root, encoding="unicode"))  # 输出 ET.tostring(root, encoding="unicode")
# <a>
#   <b>1</b>
# </a>
\`\`\`

### 6.3 写文件

\`\`\`python
tree = ET.ElementTree(root)        # 将 ET.ElementTree(root) 赋给 tree
tree.write("data.xml", encoding="utf-8", xml_declaration=True)  # 对 tree 调用 write 方法，参数 "data.xml", encoding="utf-8", xml_declaration=True
\`\`\`

⚠️ XML 生成要注意**转义**：\`<\` \`>\` \`&\` 等字符，\`tostring\` 会自动处理。但如果手工拼接 XML 字符串（不推荐），要自己转义，否则会产生非法 XML。**永远用 ElementTree 构建树，别手工拼字符串**。

---

## 七、CSV 读写

CSV（Comma-Separated Values）是最简单的表格格式，每行一条记录，字段用逗号分隔。Python 标准库 \`csv\` 处理它。

### 7.1 reader 读取

\`\`\`python
import csv                         # 导入 csv 模块
# 假设 data.csv 内容：
# name,age
# tom,18
# jerry,20
# with open("data.csv", encoding="utf-8") as f:
#     reader = csv.reader(f)
#     header = next(reader)  # 第一行
#     for row in reader:
#         print(row)  # ['tom', '18']
\`\`\`

\`csv.reader\` 每行返回一个**列表**。注意所有值都是字符串，数字要自己转换。

### 7.2 writer 写入

\`\`\`python
import csv                         # 导入 csv 模块
# with open("out.csv", "w", newline="", encoding="utf-8") as f:
#     writer = csv.writer(f)
#     writer.writerow(["name", "age"])
#     writer.writerows([["tom", 18], ["jerry", 20]])
\`\`\`

⚠️ 写 CSV 一定要加 \`newline=""\`，否则在 Windows 上会出现空行（因为 csv 模块自己处理换行，再叠加文本模式的换行转换会重复）。

### 7.3 DictReader / DictWriter

用字典方式读写，每行是 \`{字段: 值}\`，可读性更好：

\`\`\`python
import csv                         # 导入 csv 模块
# 读
# with open("data.csv", encoding="utf-8") as f:
#     reader = csv.DictReader(f)
#     for row in reader:
#         print(row["name"], row["age"])

# 写
# with open("out.csv", "w", newline="", encoding="utf-8") as f:
#     writer = csv.DictWriter(f, fieldnames=["name", "age"])
#     writer.writeheader()
#     writer.writerow({"name": "tom", "age": 18})
\`\`\`

\`DictReader\` 用第一行作为字段名（存于 \`reader.fieldnames\`）。\`DictWriter\` 必须指定 \`fieldnames\`。

### 7.4 CSV 与 Excel 的坑

- **编码**：Excel 在 Windows 上读 CSV 默认用 GBK，写含中文的 CSV 给 Excel 用，要么用 \`gbk\` 编码，要么用 \`utf-8-sig\`（带 BOM）让 Excel 识别为 UTF-8
- **分隔符**：欧洲 Excel 有时用分号 \`;\`，\`csv.reader(f, delimiter=";")\`
- **引号**：字段含逗号时要用引号包裹，\`csv\` 模块自动处理；\`quoting=csv.QUOTE_MINIMAL\` 是默认
- **真要用 Excel**：复杂需求用 \`openpyxl\` 第三方库直接写 xlsx

---

## 八、YAML 简介

YAML 用缩进表示层级，比 JSON 更适合人写配置。但 YAML 标准库不在 Python 标准库里，需要 \`pip install pyyaml\`：

\`\`\`python
# 需要 pip install pyyaml
# import yaml
# data = yaml.safe_load("name: tom\\nscores:\\n  - 90\\n  - 85")
# print(data)  # {'name': 'tom', 'scores': [90, 85]}
# print(yaml.dump(data, allow_unicode=True))
\`\`\`

⚠️ YAML **永远用 \`safe_load\` 而非 \`load\`**——后者能反序列化任意 Python 对象，有安全风险。

YAML 的特点：缩进敏感、支持注释、支持多种类型（日期、集合等）。适合写配置，不适合做 API 数据交换（解析慢、标准复杂）。

---

## 九、TOML（3.11+）

TOML（Tom's Obvious, Minimal Language）是专为配置文件设计的格式，Python 3.11+ 标准库内置 \`tomllib\`（只读）。写 TOML 用第三方 \`tomli-w\` 或 \`tomlkit\`。

\`\`\`toml
title = "项目"

[database]
host = "localhost"
port = 5432
\`\`\`

\`\`\`python
import tomllib                     # 导入 tomllib 模块
# with open("config.toml", "rb") as f:
#     config = tomllib.load(f)
#     print(config["database"]["host"])
\`\`\`

⚠️ \`tomllib.load\` 要求文件以**二进制模式**打开（\`"rb"\`），因为它内部处理编码。\`tomllib.loads\` 接受字符串。

TOML 的优势：类型丰富（有日期、数组、表）、语法明确（不像 YAML 有那么多隐式规则）、Python 官方推荐做配置格式。\`pyproject.toml\` 就是 TOML。

---

## 十、三种格式对比

| 格式 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| JSON | 通用、轻量、API 标准 | 不支持注释、类型少 | Web API、NoSQL、配置 |
| XML | 可扩展、有 schema、属性+文本 | 啰嗦、解析慢 | 文档、企业数据、SVG |
| CSV | 极简、Excel 友好 | 只能表格、无类型 | 表格数据、导出 |
| YAML | 可读、支持注释、类型多 | 缩进敏感、解析复杂 | 配置文件 |
| TOML | 明确、类型丰富、注释 | 较新、生态尚在发展 | Python 配置 |

选择建议：
- 和前端/Web 通信 → JSON
- 表格导出/Excel → CSV
- 复杂文档/有标签语义 → XML
- 人写的配置 → TOML（Python 项目）或 YAML（通用）

---

## 十一、本章小结

- **JSON**：\`dumps/loads\` 处理字符串，\`dump/load\` 处理文件；中文加 \`ensure_ascii=False\`；自定义对象用 \`default\` 或 \`JSONEncoder\`
- **XML**：\`ElementTree\` 的 \`fromstring/parse\` 解析，\`find/findall/iter\` 遍历，\`Element/SubElement/tostring\` 生成
- **CSV**：\`reader/writer\` 处理列表，\`DictReader/DictWriter\` 处理字典；写文件务必 \`newline=""\`
- **YAML**：用 \`safe_load\`，避免 \`load\` 的安全风险
- **TOML**：3.11+ 内置 \`tomllib\` 只读，二进制打开

数据格式是程序之间「对话的语言」。掌握它们，你就能让 Python 程序和 Web、数据库、Excel、配置文件无缝协作。

下一章我们将进入 SQLite 数据库，学习如何用结构化方式持久化大量数据。
`,
    code: `# ============================================================
# 第二章演示代码：JSON / XML / CSV 数据格式
# 直接运行 python3 此文件即可看到全部输出
# 使用 io.StringIO / tempfile 避免真写磁盘
# ============================================================

import json
import io
import csv
import xml.etree.ElementTree as ET
from datetime import datetime, date

# ------------------------------------------------------------
# 1. JSON dumps / loads
# ------------------------------------------------------------
print("=" * 60)
print("1. JSON dumps / loads")
print("=" * 60)

data = {"name": "tom", "age": 18, "scores": [90, 85, 88], "vip": True, "note": None}
s = json.dumps(data)
print("序列化:", s)
print("类型:", type(s).__name__)

obj = json.loads(s)
print("反序列化:", obj["name"], obj["scores"], obj["vip"], obj["note"])


# ------------------------------------------------------------
# 2. dumps 常用参数
# ------------------------------------------------------------
print()
print("=" * 60)
print("2. dumps 常用参数")
print("=" * 60)

cn = {"名": "张三", "城市": "北京"}
print("默认(ascii):", json.dumps(cn))
print("中文显示:", json.dumps(cn, ensure_ascii=False))

nested = {"name": "tom", "scores": [90, 85]}
print("缩进美化:")
print(json.dumps(nested, indent=2, ensure_ascii=False))

unsorted = {"b": 1, "a": 2, "c": 3}
print("排序:", json.dumps(unsorted, sort_keys=True))
print("紧凑:", json.dumps(unsorted, separators=(",", ":")))


# ------------------------------------------------------------
# 3. dump / load 文件（用 io.StringIO 模拟文件）
# ------------------------------------------------------------
print()
print("=" * 60)
print("3. dump / load 文件")
print("=" * 60)

buf = io.StringIO()
json.dump({"x": 1, "y": 2}, buf)
buf.seek(0)
loaded = json.load(buf)
print("从 StringIO 读取:", loaded)


# ------------------------------------------------------------
# 4. 处理不可序列化对象
# ------------------------------------------------------------
print()
print("=" * 60)
print("4. 处理不可序列化对象")
print("=" * 60)

# 报错演示（注释掉）
# json.dumps({"now": datetime.now()})

# 方式一：default 函数
def default_fn(o):
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    if isinstance(o, set):
        return sorted(o)
    raise TypeError("不会处理: " + repr(o))

data4 = {"now": datetime(2024, 3, 15, 10, 0), "tags": {3, 1, 2}}
print("default:", json.dumps(data4, default=default_fn, ensure_ascii=False))

# 方式二：自定义 JSONEncoder
class MyEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, (datetime, date)):
            return o.isoformat()
        if isinstance(o, set):
            return sorted(o)
        return super().default(o)

print("Encoder:", json.dumps(data4, cls=MyEncoder, ensure_ascii=False))

# object_hook 反序列化
def as_date(d):
    for k, v in list(d.items()):
        if isinstance(v, str) and "T" in v:
            try:
                d[k] = datetime.fromisoformat(v)
            except ValueError:
                pass
    return d

s4 = '{"now": "2024-03-15T10:00:00", "name": "tom"}'
obj4 = json.loads(s4, object_hook=as_date)
print("object_hook:", obj4, "| now类型:", type(obj4["now"]).__name__)


# ------------------------------------------------------------
# 5. 自定义对象序列化
# ------------------------------------------------------------
print()
print("=" * 60)
print("5. 自定义对象序列化")
print("=" * 60)

class User:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    def to_dict(self):
        return {"name": self.name, "age": self.age}

u = User("tom", 18)
def my_default(o):
    if isinstance(o, User):
        return o.to_dict()
    raise TypeError(repr(o))

print(json.dumps({"user": u, "ok": True}, default=my_default, ensure_ascii=False))


# ------------------------------------------------------------
# 6. JSON 错误处理
# ------------------------------------------------------------
print()
print("=" * 60)
print("6. JSON 错误处理")
print("=" * 60)

try:
    json.loads("{bad json")
except json.JSONDecodeError as e:
    print("捕获错误:", e.msg, "| 位置:", e.pos)


# ------------------------------------------------------------
# 7. JSON 嵌套
# ------------------------------------------------------------
print()
print("=" * 60)
print("7. JSON 嵌套")
print("=" * 60)

api = {
    "code": 0,
    "data": {
        "users": [{"id": 1, "name": "tom"}, {"id": 2, "name": "jerry"}],
        "total": 2
    }
}
s7 = json.dumps(api, ensure_ascii=False)
back = json.loads(s7)
print("取值:", back["data"]["users"][0]["name"], back["data"]["total"])


# ------------------------------------------------------------
# 8. XML 解析
# ------------------------------------------------------------
print()
print("=" * 60)
print("8. XML 解析")
print("=" * 60)

xml_str = """<?xml version="1.0"?>
<users>
    <user id="1">
        <name>tom</name>
        <age>18</age>
    </user>
    <user id="2">
        <name>jerry</name>
        <age>20</age>
    </user>
</users>
"""

root = ET.fromstring(xml_str)
print("根标签:", root.tag)

for user in root.findall("user"):
    uid = user.get("id")
    name = user.find("name").text
    age = user.find("age").text
    print("  id=%s name=%s age=%s" % (uid, name, age))

# attrib 与 iter
first = root.find("user")
print("属性字典:", first.attrib)
print("iter name:", [e.text for e in root.iter("name")])


# ------------------------------------------------------------
# 9. XML 生成
# ------------------------------------------------------------
print()
print("=" * 60)
print("9. XML 生成")
print("=" * 60)

root9 = ET.Element("users")
for u in [{"id": "1", "name": "tom", "age": "18"},
          {"id": "2", "name": "jerry", "age": "20"}]:
    user = ET.SubElement(root9, "user", id=u["id"])
    ET.SubElement(user, "name").text = u["name"]
    ET.SubElement(user, "age").text = u["age"]

# 缩进美化
ET.indent(root9, space="  ")
xml_out = ET.tostring(root9, encoding="unicode")
print(xml_out)

# 写到 StringIO
tree = ET.ElementTree(root9)
buf9 = io.StringIO()
tree.write(buf9, encoding="unicode", xml_declaration=True)
print("写出长度:", len(buf9.getvalue()))


# ------------------------------------------------------------
# 10. CSV 读写
# ------------------------------------------------------------
print()
print("=" * 60)
print("10. CSV 读写")
print("=" * 60)

# 写
buf10 = io.StringIO()
writer = csv.writer(buf10)
writer.writerow(["name", "age", "city"])
writer.writerows([["tom", 18, "北京"], ["jerry", 20, "上海"]])
print("CSV 内容:")
print(buf10.getvalue(), end="")

# 读
buf10.seek(0)
reader = csv.reader(buf10)
header = next(reader)
print("表头:", header)
for row in reader:
    print("  行:", row, "| name=", row[0])


# ------------------------------------------------------------
# 11. CSV DictReader / DictWriter
# ------------------------------------------------------------
print()
print("=" * 60)
print("11. CSV DictReader / DictWriter")
print("=" * 60)

buf11 = io.StringIO()
dw = csv.DictWriter(buf11, fieldnames=["name", "age", "city"])
dw.writeheader()
dw.writerow({"name": "tom", "age": 18, "city": "北京"})
dw.writerow({"name": "jerry", "age": 20, "city": "上海"})
print("DictWriter 输出:")
print(buf11.getvalue(), end="")

# 读
buf11.seek(0)
dr = csv.DictReader(buf11)
print("字段名:", dr.fieldnames)
for row in dr:
    print("  ", row["name"], row["age"], row["city"])


# ------------------------------------------------------------
# 12. CSV 特殊字符与引号
# ------------------------------------------------------------
print()
print("=" * 60)
print("12. CSV 特殊字符")
print("=" * 60)

buf12 = io.StringIO()
w12 = csv.writer(buf12, quoting=csv.QUOTE_MINIMAL)
w12.writerow(["name", "desc"])
w12.writerow(["tom", "hello, world"])     # 含逗号自动加引号
w12.writerow(["jerry", '带"引号"'])         # 含引号自动转义
print(buf12.getvalue(), end="")

# 读回
buf12.seek(0)
for row in csv.reader(buf12):
    print("  读回:", row)


# ------------------------------------------------------------
# 13. TOML 读取（3.11+）
# ------------------------------------------------------------
print()
print("=" * 60)
print("13. TOML 读取")
print("=" * 60)

import tomllib

toml_str = '''
title = "我的项目"
version = "1.0.0"

[database]
host = "localhost"
port = 5432
debug = true

[[users]]
name = "tom"
age = 18

[[users]]
name = "jerry"
age = 20
'''

config = tomllib.loads(toml_str)
print("title:", config["title"])
print("version:", config["version"])
print("db host:", config["database"]["host"])
print("db port:", config["database"]["port"])
print("users:", config["users"])


# ------------------------------------------------------------
# 14. 综合实战：JSON 配置读写
# ------------------------------------------------------------
print()
print("=" * 60)
print("14. 综合实战：JSON 配置读写")
print("=" * 60)

def save_config(config, path_like):
    json.dump(config, path_like, ensure_ascii=False, indent=2, sort_keys=True)

def load_config(path_like):
    return json.load(path_like)

cfg = {
    "app_name": "demo",
    "version": "1.0",
    "features": ["auth", "log"],
    "db": {"host": "localhost", "port": 5432}
}

buf14 = io.StringIO()
save_config(cfg, buf14)
print("保存的配置:")
print(buf14.getvalue())

buf14.seek(0)
loaded_cfg = load_config(buf14)
print("读回 db.port:", loaded_cfg["db"]["port"])
print("读回 features:", loaded_cfg["features"])


# ------------------------------------------------------------
# 15. 格式对比演示
# ------------------------------------------------------------
print()
print("=" * 60)
print("15. 同一数据三种格式对比")
print("=" * 60)

same = [{"name": "tom", "age": 18}, {"name": "jerry", "age": 20}]

print("--- JSON ---")
print(json.dumps(same, ensure_ascii=False))

print("--- CSV ---")
buf15 = io.StringIO()
wc = csv.DictWriter(buf15, fieldnames=["name", "age"])
wc.writeheader()
wc.writerows(same)
print(buf15.getvalue(), end="")

print("--- XML ---")
root15 = ET.Element("people")
for p in same:
    pe = ET.SubElement(root15, "person")
    ET.SubElement(pe, "name").text = p["name"]
    ET.SubElement(pe, "age").text = str(p["age"])
ET.indent(root15, space="  ")
print(ET.tostring(root15, encoding="unicode"))

print()
print("数据格式演示全部完成！")
`,
  },
  // =========================================================
  // 第三章：SQLite 数据库
  // =========================================================
  {
    id: "py-sqlite",
    group: "数据处理与持久化",
    icon: "🗄️",
    title: "SQLite 数据库",
    content: `# SQLite 数据库

当数据量变大、需要按条件查询、要保证事务一致性时，文件和 JSON 就不够用了，得上**数据库**。SQLite 是一个**嵌入式**的轻量级关系型数据库——不需要单独的服务进程，整个数据库就是一个文件（或内存），Python 标准库 \`sqlite3\` 开箱即用。

SQLite 适合：单机应用、配置存储、原型开发、移动端、测试。不适合：高并发写入（写锁是库级别的）、超大数据。学会 SQLite，再学 MySQL/PostgreSQL 会有触类旁通的感觉——SQL 语法和事务概念是相通的。

---

## 一、sqlite3 入门

### 1.1 连接数据库

\`sqlite3.connect(database)\` 建立连接。\`database\` 是文件路径，特殊值 \`":memory:"\` 表示内存数据库（程序结束就消失，适合测试和 demo）：

\`\`\`python
import sqlite3                     # 导入 sqlite3 模块

# 连接到文件（不存在会创建）
# conn = sqlite3.connect("app.db")

# 内存数据库（每次连接都是全新的）
conn = sqlite3.connect(":memory:") # 将 sqlite3.connect(":memory:") 赋给 conn

# 用完关闭
conn.close()                       # 对 conn 调用 close 方法
\`\`\`

\`conn\` 是连接对象，负责事务提交、关闭、创建游标。

### 1.2 游标 cursor 与 execute

\`conn.cursor()\` 创建游标，游标负责执行 SQL、获取结果：

\`\`\`python
import sqlite3                     # 导入 sqlite3 模块
conn = sqlite3.connect(":memory:") # 将 sqlite3.connect(":memory:") 赋给 conn
cur = conn.cursor()                # 将 conn.cursor() 赋给 cur

# 执行建表
cur.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)")  # 对 cur 调用 execute 方法，参数 "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)"

# 插入
cur.execute("INSERT INTO users (name, age) VALUES ('tom', 18)")  # 对 cur 调用 execute 方法，参数 "INSERT INTO users (name, age) VALUES ('tom', 18)"

# 查询
cur.execute("SELECT * FROM users") # 对 cur 调用 execute 方法，参数 "SELECT * FROM users"
print(cur.fetchall())  # [(1, 'tom', 18)]

conn.commit()  # 提交事务
conn.close()                       # 对 conn 调用 close 方法
\`\`\`

### 1.3 execute / executemany / executescript

- \`execute(sql, params)\`：执行一条语句
- \`executemany(sql, seq_of_params)\`：批量执行（同一条语句，多组参数）
- \`executescript(sql_script)\`：一次执行多条语句（用分号分隔）

\`\`\`python
import sqlite3                     # 导入 sqlite3 模块
conn = sqlite3.connect(":memory:") # 将 sqlite3.connect(":memory:") 赋给 conn
cur = conn.cursor()                # 将 conn.cursor() 赋给 cur
cur.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)")  # 对 cur 调用 execute 方法，参数 "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)"

# executemany 批量插入
data = [("tom", 18), ("jerry", 20), ("spike", 22)]  # 创建列表并赋给 data
cur.executemany("INSERT INTO users (name, age) VALUES (?, ?)", data)  # 对 cur 调用 executemany 方法，参数 "INSERT INTO users (name, age) VALUES (?, ?)", data

# executescript 执行多条
cur.executescript("""
    INSERT INTO users (name, age) VALUES ('tyke', 5);
    UPDATE users SET age = age + 1 WHERE name = 'tom';
""")
conn.commit()                      # 对 conn 调用 commit 方法
\`\`\`

---

## 二、参数化查询：防 SQL 注入

### 2.1 为什么不能用字符串拼接

新手最危险的错误是**用字符串拼接或 f-string 构造 SQL**：

\`\`\`python
# 危险！SQL 注入漏洞
name = input("名字: ")               # 将 input("名字: ") 赋给 name
cur.execute("SELECT * FROM users WHERE name = '" + name + "'")  # 对 cur 调用 execute 方法，参数 "SELECT * FROM users WHERE name = '" + name + "'"
# 如果输入: tom'; DROP TABLE users; --
# 整个表就没了
\`\`\`

**永远不要这样写**。正确做法是用**参数化查询**，让 sqlite3 帮你转义。

### 2.2 问号占位符 ?

\`\`\`python
cur.execute("SELECT * FROM users WHERE name = ?", ("tom",))  # 对 cur 调用 execute 方法，参数 "SELECT * FROM users WHERE name = ?", ("tom",)
cur.execute("SELECT * FROM users WHERE age > ? AND age < ?", (15, 25))  # 对 cur 调用 execute 方法，参数 "SELECT * FROM users WHERE age > ? AND age < ?", (15, 25)
\`\`\`

参数必须是**元组**（单个参数要写成 \`(value,)\`，那个逗号不能少）。

### 2.3 命名占位符 :name

\`\`\`python
cur.execute("SELECT * FROM users WHERE name = :name AND age > :age",
            {"name": "tom", "age": 15})
\`\`\`

命名占位符用字典传参，可读性更好，参数多时尤其方便。

### 2.4 executemany 批量

\`\`\`python
data = [("tom", 18), ("jerry", 20)]  # 创建列表并赋给 data
cur.executemany("INSERT INTO users (name, age) VALUES (?, ?)", data)  # 对 cur 调用 executemany 方法，参数 "INSERT INTO users (name, age) VALUES (?, ?)", data
\`\`\`

批量插入比循环 \`execute\` 快得多——因为只解析一次 SQL。

---

## 三、CRUD：增删改查

### 3.1 建表 CREATE

\`\`\`python
cur.execute("""
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER DEFAULT 0,
        email TEXT UNIQUE,
        created_at TEXT DEFAULT (datetime('now'))
    )
""")
\`\`\`

SQLite 常用类型：\`INTEGER\`（整数）、\`TEXT\`（文本）、\`REAL\`（浮点）、\`BLOB\`（二进制）、\`NULL\`。\`PRIMARY KEY\` 主键，\`AUTOINCREMENT\` 自增。

### 3.2 插入 INSERT

\`\`\`python
cur.execute("INSERT INTO users (name, age, email) VALUES (?, ?, ?)",
            ("tom", 18, "tom@abc.com"))
print(cur.lastrowid)  # 插入行的 id
\`\`\`

### 3.3 查询 SELECT

\`\`\`python
cur.execute("SELECT id, name, age FROM users WHERE age >= ?", (18,))  # 对 cur 调用 execute 方法，参数 "SELECT id, name, age FROM users WHERE age >= ?", (18,)

# fetchone 取一条
print(cur.fetchone())       # (1, 'tom', 18)

# fetchall 取全部
cur.execute("SELECT * FROM users") # 对 cur 调用 execute 方法，参数 "SELECT * FROM users"
print(cur.fetchall())       # [(...), (...)]

# 遍历（推荐，省内存）
cur.execute("SELECT * FROM users") # 对 cur 调用 execute 方法，参数 "SELECT * FROM users"
for row in cur:                    # 遍历 cur，每次取值赋给 row
    print(row)                     # 输出 row
\`\`\`

### 3.4 更新 UPDATE / 删除 DELETE

\`\`\`python
cur.execute("UPDATE users SET age = ? WHERE name = ?", (19, "tom"))  # 对 cur 调用 execute 方法，参数 "UPDATE users SET age = ? WHERE name = ?", (19, "tom")
print(cur.rowcount)  # 影响的行数

cur.execute("DELETE FROM users WHERE age < ?", (10,))  # 对 cur 调用 execute 方法，参数 "DELETE FROM users WHERE age < ?", (10,)
print(cur.rowcount)                # 输出 cur.rowcount
\`\`\`

⚠️ UPDATE/DELETE 一定要带 WHERE，否则会改/删全表！\`cur.rowcount\` 返回受影响行数。

---

## 四、事务：commit / rollback

### 4.1 事务的概念

事务（Transaction）是一组「要么全做、要么全不做」的操作。比如转账：A 扣钱和 B 加钱必须一起成功，不能扣了 A 的钱但 B 没加上。

SQLite 默认在**自动提交**关闭时，每条写操作会隐式开启事务，需要手动 \`commit\` 才真正写入；出错时可以 \`rollback\` 回滚到之前状态。

\`\`\`python
import sqlite3                     # 导入 sqlite3 模块
conn = sqlite3.connect(":memory:") # 将 sqlite3.connect(":memory:") 赋给 conn
cur = conn.cursor()                # 将 conn.cursor() 赋给 cur
cur.execute("CREATE TABLE account (id INTEGER PRIMARY KEY, balance INTEGER)")  # 对 cur 调用 execute 方法，参数 "CREATE TABLE account (id INTEGER PRIMARY KEY, balance INTEGER)"
cur.execute("INSERT INTO account (balance) VALUES (100), (100)")  # 对 cur 调用 execute 方法，参数 "INSERT INTO account (balance) VALUES (100), (100)"
conn.commit()                      # 对 conn 调用 commit 方法

try:                               # 尝试执行以下代码块
    cur.execute("UPDATE account SET balance = balance - 30 WHERE id = 1")  # 对 cur 调用 execute 方法，参数 "UPDATE account SET balance = balance - 30 WHERE id = 1"
    cur.execute("UPDATE account SET balance = balance + 30 WHERE id = 2")  # 对 cur 调用 execute 方法，参数 "UPDATE account SET balance = balance + 30 WHERE id = 2"
    conn.commit()  # 两条都成功才提交
except Exception as e:             # 捕获 Exception 异常并绑定到 e
    conn.rollback()  # 出错回滚，两条都不生效
    raise                          # 抛出异常
\`\`\`

### 4.2 自动提交模式

\`sqlite3.connect(db, isolation_level=None)\` 开启自动提交，每条语句立即生效，无需手动 commit。适合简单场景：

\`\`\`python
conn = sqlite3.connect(":memory:", isolation_level=None)  # 将 sqlite3.connect(":memory:", isolation_level=None) 赋给 conn
\`\`\`

### 4.3 with 上下文管理器

\`with conn\` 是一个**事务上下文**——退出 with 块时，如果没有异常就自动 commit，有异常就自动 rollback：

\`\`\`python
import sqlite3                     # 导入 sqlite3 模块
conn = sqlite3.connect(":memory:") # 将 sqlite3.connect(":memory:") 赋给 conn
cur = conn.cursor()                # 将 conn.cursor() 赋给 cur
cur.execute("CREATE TABLE t (x INTEGER)")  # 对 cur 调用 execute 方法，参数 "CREATE TABLE t (x INTEGER)"

try:                               # 尝试执行以下代码块
    with conn:                     # 使用上下文管理器 conn
        cur.execute("INSERT INTO t VALUES (1)")  # 对 cur 调用 execute 方法，参数 "INSERT INTO t VALUES (1)"
        cur.execute("INSERT INTO t VALUES (2)")  # 对 cur 调用 execute 方法，参数 "INSERT INTO t VALUES (2)"
        # 正常退出 -> 自动 commit
except Exception:                  # 捕获 Exception 异常
    # 异常 -> 自动 rollback
    pass                           # 空操作，占位

cur.execute("SELECT * FROM t")     # 对 cur 调用 execute 方法，参数 "SELECT * FROM t"
print(cur.fetchall())              # 输出 cur.fetchall()
\`\`\`

⚠️ 注意 \`with conn\` 提交的是**事务**，不是「关闭连接」。连接还是要手动 \`conn.close()\`。

### 4.4 with 自动关闭连接（3.x）

\`with sqlite3.connect(...)\` 在某些版本里也会管理连接关闭。但更稳妥的是显式 \`conn.close()\`，或用 try/finally。

---

## 五、row_factory：行作为字典

默认查询返回的是**元组**，靠位置取值不直观。\`conn.row_factory = sqlite3.Row\` 后返回 \`Row\` 对象，可以按列名取值：

\`\`\`python
import sqlite3                     # 导入 sqlite3 模块
conn = sqlite3.connect(":memory:") # 将 sqlite3.connect(":memory:") 赋给 conn
conn.row_factory = sqlite3.Row
cur = conn.cursor()                # 将 conn.cursor() 赋给 cur
cur.execute("CREATE TABLE users (id INTEGER, name TEXT, age INTEGER)")  # 对 cur 调用 execute 方法，参数 "CREATE TABLE users (id INTEGER, name TEXT, age INTEGER)"
cur.execute("INSERT INTO users VALUES (1, 'tom', 18)")  # 对 cur 调用 execute 方法，参数 "INSERT INTO users VALUES (1, 'tom', 18)"
conn.commit()                      # 对 conn 调用 commit 方法

cur.execute("SELECT * FROM users") # 对 cur 调用 execute 方法，参数 "SELECT * FROM users"
row = cur.fetchone()               # 将 cur.fetchone() 赋给 row
print(row["name"])       # tom —— 按列名
print(row["age"])        # 18
print(dict(row))         # {'id': 1, 'name': 'tom', 'age': 18} —— 转字典
print(row[0])            # 1 —— 仍可按下标
\`\`\`

**强烈推荐设 \`row_factory = sqlite3.Row\`**，代码可读性大幅提升。

---

## 六、PRAGMA 配置

PRAGMA 是 SQLite 的配置命令，用来调整数据库行为：

\`\`\`python
# 开启外键约束（默认关闭！）
conn.execute("PRAGMA foreign_keys = ON")  # 对 conn 调用 execute 方法，参数 "PRAGMA foreign_keys = ON"

# 查看 SQLite 版本
print(conn.execute("PRAGMA database_list").fetchall())  # 输出 conn.execute("PRAGMA database_list").fetchall()

# 设置页大小、缓存等（建库时设）
conn.execute("PRAGMA journal_mode = WAL")  # 写时更少锁
\`\`\`

⚠️ SQLite **默认不开启外键约束**，必须 \`PRAGMA foreign_keys = ON\`，否则你定义了 FOREIGN KEY 也不生效。

---

## 七、表关系与 JOIN

### 7.1 外键

\`\`\`python
import sqlite3                     # 导入 sqlite3 模块
conn = sqlite3.connect(":memory:") # 将 sqlite3.connect(":memory:") 赋给 conn
conn.execute("PRAGMA foreign_keys = ON")  # 对 conn 调用 execute 方法，参数 "PRAGMA foreign_keys = ON"
cur = conn.cursor()                # 将 conn.cursor() 赋给 cur

cur.executescript("""
    CREATE TABLE classes (
        id INTEGER PRIMARY KEY,
        name TEXT
    );
    CREATE TABLE students (
        id INTEGER PRIMARY KEY,
        name TEXT,
        class_id INTEGER,
        FOREIGN KEY (class_id) REFERENCES classes(id)
    );
""")
cur.execute("INSERT INTO classes VALUES (1, '一班')")  # 对 cur 调用 execute 方法，参数 "INSERT INTO classes VALUES (1, '一班')"
cur.execute("INSERT INTO students VALUES (1, 'tom', 1)")  # 对 cur 调用 execute 方法，参数 "INSERT INTO students VALUES (1, 'tom', 1)"
cur.execute("INSERT INTO students VALUES (2, 'jerry', 1)")  # 对 cur 调用 execute 方法，参数 "INSERT INTO students VALUES (2, 'jerry', 1)"
conn.commit()                      # 对 conn 调用 commit 方法
\`\`\`

外键保证 students.class_id 必须指向一个真实存在的 classes.id，插入非法 class_id 会被拒绝。

### 7.2 JOIN 连接查询

\`\`\`python
# INNER JOIN：取两表都有的
cur.execute("""
    SELECT s.name, c.name
    FROM students s
    JOIN classes c ON s.class_id = c.id
""")
for row in cur:                    # 遍历 cur，每次取值赋给 row
    print(row)  # ('tom', '一班'), ('jerry', '一班')

# LEFT JOIN：左表全保留，右表没有则 NULL
cur.execute("""
    SELECT c.name, COUNT(s.id) AS cnt
    FROM classes c
    LEFT JOIN students s ON s.class_id = c.id
    GROUP BY c.id
""")
\`\`\`

JOIN 类型：\`INNER JOIN\`（交集）、\`LEFT JOIN\`（左全保留）、\`RIGHT JOIN\`、\`FULL JOIN\`（SQLite 3.39+ 支持）。

### 7.3 聚合与分组

\`\`\`python
cur.execute("SELECT class_id, COUNT(*) FROM students GROUP BY class_id")  # 对 cur 调用 execute 方法，参数 "SELECT class_id, COUNT(*) FROM students GROUP BY class_id"
cur.execute("SELECT class_id, AVG(age) FROM students GROUP BY class_id HAVING COUNT(*) > 2")  # 对 cur 调用 execute 方法，参数 "SELECT class_id, AVG(age) FROM students GROUP BY class_id HAVING COUNT(*) > 2"
\`\`\`

常用聚合函数：\`COUNT\` \`SUM\` \`AVG\` \`MIN\` \`MAX\`。\`GROUP BY\` 分组，\`HAVING\` 过滤分组后的结果（WHERE 过滤的是行）。

---

## 八、索引

索引能加速查询，但会拖慢写入、占空间。给「经常作为查询条件」的列建索引：

\`\`\`python
cur.execute("CREATE INDEX idx_users_name ON users(name)")  # 对 cur 调用 execute 方法，参数 "CREATE INDEX idx_users_name ON users(name)"
cur.execute("CREATE INDEX idx_users_email ON users(email)")  # 对 cur 调用 execute 方法，参数 "CREATE INDEX idx_users_email ON users(email)"
\`\`\`

查看查询是否用上索引：\`EXPLAIN QUERY PLAN SELECT ...\`：

\`\`\`python
print(conn.execute("EXPLAIN QUERY PLAN SELECT * FROM users WHERE name = ?",
                   ("tom",)).fetchall())
\`\`\`

索引建议：
- 主键和 UNIQUE 列自动有索引，不用再建
- 给 WHERE / JOIN / ORDER BY 频繁用的列建索引
- 小表不用索引（全表扫描更快）
- 不要建太多索引（拖慢写入）

---

## 九、常用 SQL 函数

\`\`\`python
# 字符串
cur.execute("SELECT UPPER(name), LENGTH(name) FROM users")  # 对 cur 调用 execute 方法，参数 "SELECT UPPER(name), LENGTH(name) FROM users"
# 日期
cur.execute("SELECT date('now'), datetime('now')")  # 对 cur 调用 execute 方法，参数 "SELECT date('now'), datetime('now')"
cur.execute("SELECT date('now', '-1 month')")  # 一个月前
# 数学
cur.execute("SELECT ROUND(AVG(age), 2) FROM users")  # 对 cur 调用 execute 方法，参数 "SELECT ROUND(AVG(age), 2) FROM users"
# NULL 处理
cur.execute("SELECT COALESCE(email, '无') FROM users")  # email 为 NULL 返回 '无'
# 条件
cur.execute("SELECT name, CASE WHEN age >= 18 THEN '成年' ELSE '未成年' END FROM users")  # 对 cur 调用 execute 方法，参数 "SELECT name, CASE WHEN age >= 18 THEN '成年' ELSE '未成年' END FROM users"
\`\`\`

---

## 十、ORM 概念对比

直接写 SQL 叫「原生 SQL」，用 ORM（对象关系映射）则把表映射成类、行映射成对象：

\`\`\`python
# 原生 SQL
cur.execute("SELECT * FROM users WHERE id = ?", (1,))  # 对 cur 调用 execute 方法，参数 "SELECT * FROM users WHERE id = ?", (1,)

# ORM（如 SQLAlchemy / Django ORM，伪代码）
# user = session.query(User).filter_by(id=1).first()
\`\`\`

ORM 优点：面向对象、防注入、可换数据库。缺点：性能略低、复杂查询难写、有学习成本。本章专注原生 SQL，掌握后再学 ORM 会很轻松。

---

## 十一、内存数据库 vs 文件数据库

- \`:memory:\`：内存数据库，连接关闭即消失，速度快，适合测试、缓存、demo
- 文件路径：持久化到磁盘，程序重启数据还在

⚠️ 内存数据库在**同一连接**内共享。如果多次 \`connect(":memory:")\` 会得到**不同**的库。要多个连接共享内存库，用 \`file::memory:?cache=shared\`：

\`\`\`python
# 共享内存库（可被多个连接访问）
conn1 = sqlite3.connect("file::memory:?cache=shared", uri=True)  # 将 sqlite3.connect("file::memory:?cache=shared", uri=True) 赋给 conn1
conn2 = sqlite3.connect("file::memory:?cache=shared", uri=True)  # 将 sqlite3.connect("file::memory:?cache=shared", uri=True) 赋给 conn2
\`\`\`

---

## 十二、实战 CRUD 示例

下面是一个完整的「用户管理」CRUD 封装：

\`\`\`python
import sqlite3                     # 导入 sqlite3 模块

class UserDB:                      # 定义类 UserDB
    def __init__(self, conn):      # 定义函数 __init__，参数：self, conn
        self.conn = conn
        self.conn.row_factory = sqlite3.Row
        self._init()               # 对 self 调用 _init 方法

    def _init(self):               # 定义函数 _init，参数：self
        with self.conn:            # 使用上下文管理器 self.conn
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    age INTEGER,
                    email TEXT UNIQUE
                )
            """)

    def add(self, name, age, email):  # 定义函数 add，参数：self, name, age, email
        with self.conn:            # 使用上下文管理器 self.conn
            cur = self.conn.execute(  # 将 self.conn.execute( 赋给 cur
                "INSERT INTO users (name, age, email) VALUES (?, ?, ?)",
                (name, age, email))
            return cur.lastrowid   # 返回 cur.lastrowid

    def get(self, uid):            # 定义函数 get，参数：self, uid
        cur = self.conn.execute("SELECT * FROM users WHERE id = ?", (uid,))  # 将 self.conn.execute("SELECT * FROM users WHERE id = ?", (uid,)) 赋给 cur
        return dict(cur.fetchone()) if cur.fetchone() else None  # 返回 dict(cur.fetchone()) if cur.fetchone() else None

    def list_all(self):            # 定义函数 list_all，参数：self
        cur = self.conn.execute("SELECT * FROM users ORDER BY id")  # 将 self.conn.execute("SELECT * FROM users ORDER BY id") 赋给 cur
        return [dict(r) for r in cur]  # 返回 [dict(r) for r in cur]

    def update_age(self, uid, age):  # 定义函数 update_age，参数：self, uid, age
        with self.conn:            # 使用上下文管理器 self.conn
            cur = self.conn.execute(  # 将 self.conn.execute( 赋给 cur
                "UPDATE users SET age = ? WHERE id = ?", (age, uid))
            return cur.rowcount    # 返回 cur.rowcount

    def delete(self, uid):         # 定义函数 delete，参数：self, uid
        with self.conn:            # 使用上下文管理器 self.conn
            cur = self.conn.execute("DELETE FROM users WHERE id = ?", (uid,))  # 将 self.conn.execute("DELETE FROM users WHERE id = ?", (uid,)) 赋给 cur
            return cur.rowcount    # 返回 cur.rowcount
\`\`\`

用 \`with self.conn\` 保证事务安全，用参数化防注入，用 \`row_factory\` 让结果可按列名取。

---

## 十三、本章小结

- **连接**：\`sqlite3.connect()\`，\`:memory:\` 内存库，\`conn.close()\` 关闭
- **游标**：\`cursor()\` + \`execute/executemany/executescript\`
- **防注入**：永远用 \`?\` 或 \`:name\` 参数化，**绝不拼接 SQL**
- **事务**：\`commit\` 提交、\`rollback\` 回滚、\`with conn\` 自动管理
- **row_factory**：\`sqlite3.Row\` 让结果按列名取，强烈推荐
- **外键**：必须 \`PRAGMA foreign_keys = ON\` 才生效
- **JOIN**：关联多表，INNER/LEFT 最常用
- **索引**：给查询条件列建索引，加速查询但拖慢写入

SQLite 是 Python 程序员「装上 Python 就有」的数据库，掌握它你就能处理绝大多数单机数据持久化需求。下一章我们深入文件系统操作。
`,
    code: `# ============================================================
# 第三章演示代码：SQLite 数据库
# 全部使用内存数据库 :memory:，不写磁盘
# ============================================================

import sqlite3

# ------------------------------------------------------------
# 1. 连接与建表
# ------------------------------------------------------------
print("=" * 60)
print("1. 连接与建表")
print("=" * 60)

conn = sqlite3.connect(":memory:")
cur = conn.cursor()
cur.execute("""
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER DEFAULT 0,
        email TEXT
    )
""")
print("建表完成")


# ------------------------------------------------------------
# 2. 插入数据
# ------------------------------------------------------------
print()
print("=" * 60)
print("2. 插入数据")
print("=" * 60)

# 单条
cur.execute("INSERT INTO users (name, age, email) VALUES (?, ?, ?)",
            ("tom", 18, "tom@abc.com"))
print("插入 id:", cur.lastrowid)

# 批量
data = [("jerry", 20, "jerry@abc.com"),
        ("spike", 22, "spike@abc.com"),
        ("tyke", 5, "tyke@abc.com")]
cur.executemany("INSERT INTO users (name, age, email) VALUES (?, ?, ?)", data)
print("批量插入完成")

conn.commit()


# ------------------------------------------------------------
# 3. 查询数据
# ------------------------------------------------------------
print()
print("=" * 60)
print("3. 查询数据")
print("=" * 60)

cur.execute("SELECT * FROM users")
print("fetchone:", cur.fetchone())
print("fetchmany(2):", cur.fetchmany(2))
print("fetchall:", cur.fetchall())

# 遍历
cur.execute("SELECT id, name, age FROM users ORDER BY age")
for row in cur:
    print("  遍历:", row)


# ------------------------------------------------------------
# 4. 参数化查询（防注入）
# ------------------------------------------------------------
print()
print("=" * 60)
print("4. 参数化查询")
print("=" * 60)

# 问号占位符
cur.execute("SELECT * FROM users WHERE age >= ? AND age <= ?", (15, 25))
print("问号:", cur.fetchall())

# 命名占位符
cur.execute("SELECT * FROM users WHERE name = :name", {"name": "tom"})
print("命名:", cur.fetchone())


# ------------------------------------------------------------
# 5. 更新与删除
# ------------------------------------------------------------
print()
print("=" * 60)
print("5. 更新与删除")
print("=" * 60)

cur.execute("UPDATE users SET age = ? WHERE name = ?", (19, "tom"))
print("更新行数:", cur.rowcount)

cur.execute("DELETE FROM users WHERE age < ?", (10,))
print("删除行数:", cur.rowcount)
conn.commit()

cur.execute("SELECT name, age FROM users")
for row in cur:
    print("  剩余:", row)


# ------------------------------------------------------------
# 6. row_factory = sqlite3.Row
# ------------------------------------------------------------
print()
print("=" * 60)
print("6. row_factory = sqlite3.Row")
print("=" * 60)

conn.row_factory = sqlite3.Row
cur = conn.cursor()
cur.execute("SELECT * FROM users WHERE name = ?", ("tom",))
row = cur.fetchone()
print("按列名 name:", row["name"])
print("按列名 age:", row["age"])
print("转字典:", dict(row))
print("按下标:", row[0])


# ------------------------------------------------------------
# 7. 事务 commit / rollback
# ------------------------------------------------------------
print()
print("=" * 60)
print("7. 事务 commit / rollback")
print("=" * 60)

conn2 = sqlite3.connect(":memory:")
c2 = conn2.cursor()
c2.execute("CREATE TABLE account (id INTEGER PRIMARY KEY, balance INTEGER)")
c2.execute("INSERT INTO account (balance) VALUES (100), (100)")
conn2.commit()

try:
    c2.execute("UPDATE account SET balance = balance - 30 WHERE id = 1")
    c2.execute("UPDATE account SET balance = balance + 30 WHERE id = 2")
    conn2.commit()
    print("转账成功")
except Exception:
    conn2.rollback()
    print("转账失败，回滚")

c2.execute("SELECT * FROM account ORDER BY id")
print("余额:", c2.fetchall())

# with conn 自动事务
print("--- with conn 自动事务 ---")
try:
    with conn2:
        c2.execute("INSERT INTO account (balance) VALUES (999)")
        c2.execute("INSERT INTO account (balance) VALUES (888)")
    print("with 块成功 -> 自动 commit")
except Exception:
    print("with 块异常 -> 自动 rollback")

c2.execute("SELECT COUNT(*) FROM account")
print("账户数:", c2.fetchone()[0])


# ------------------------------------------------------------
# 8. executescript 执行多语句
# ------------------------------------------------------------
print()
print("=" * 60)
print("8. executescript")
print("=" * 60)

conn2.row_factory = sqlite3.Row
c2 = conn2.cursor()
c2.executescript("""
    CREATE TABLE log (id INTEGER PRIMARY KEY, msg TEXT);
    INSERT INTO log (msg) VALUES ('启动');
    INSERT INTO log (msg) VALUES ('运行中');
    INSERT INTO log (msg) VALUES ('关闭');
""")
c2.execute("SELECT * FROM log")
for r in c2.fetchall():
    print("  日志:", dict(r))


# ------------------------------------------------------------
# 9. 表关系与 JOIN
# ------------------------------------------------------------
print()
print("=" * 60)
print("9. 表关系与 JOIN")
print("=" * 60)

conn3 = sqlite3.connect(":memory:")
conn3.execute("PRAGMA foreign_keys = ON")
conn3.row_factory = sqlite3.Row
c3 = conn3.cursor()

c3.executescript("""
    CREATE TABLE classes (id INTEGER PRIMARY KEY, name TEXT);
    CREATE TABLE students (
        id INTEGER PRIMARY KEY,
        name TEXT,
        age INTEGER,
        class_id INTEGER,
        FOREIGN KEY (class_id) REFERENCES classes(id)
    );
""")
c3.execute("INSERT INTO classes VALUES (1, '一班')")
c3.execute("INSERT INTO classes VALUES (2, '二班')")
c3.executemany("INSERT INTO students (name, age, class_id) VALUES (?, ?, ?)",
               [("tom", 18, 1), ("jerry", 20, 1), ("spike", 22, 2), ("tyke", 5, 1)])
conn3.commit()

# INNER JOIN
print("INNER JOIN:")
c3.execute("""
    SELECT s.name AS student, c.name AS class
    FROM students s
    JOIN classes c ON s.class_id = c.id
    ORDER BY s.id
""")
for r in c3.fetchall():
    print("  ", dict(r))

# LEFT JOIN + 聚合
print("LEFT JOIN + 聚合:")
c3.execute("""
    SELECT c.name AS class, COUNT(s.id) AS cnt, AVG(s.age) AS avg_age
    FROM classes c
    LEFT JOIN students s ON s.class_id = c.id
    GROUP BY c.id
""")
for r in c3.fetchall():
    print("  ", dict(r))

# 外键约束测试
print("外键约束:")
try:
    c3.execute("INSERT INTO students (name, age, class_id) VALUES (?, ?, ?)",
               ("x", 10, 999))
except sqlite3.IntegrityError as e:
    print("  插入非法 class_id 被拒绝:", e)


# ------------------------------------------------------------
# 10. 索引
# ------------------------------------------------------------
print()
print("=" * 60)
print("10. 索引")
print("=" * 60)

conn3.execute("CREATE INDEX idx_students_name ON students(name)")
plan = conn3.execute(
    "EXPLAIN QUERY PLAN SELECT * FROM students WHERE name = ?", ("tom",)
).fetchall()
print("查询计划:", [dict(r) for r in plan])

plan2 = conn3.execute(
    "EXPLAIN QUERY PLAN SELECT * FROM students WHERE age > ?", (10,)
).fetchall()
print("无索引列计划:", [dict(r) for r in plan2])


# ------------------------------------------------------------
# 11. 常用 SQL 函数
# ------------------------------------------------------------
print()
print("=" * 60)
print("11. 常用 SQL 函数")
print("=" * 60)

c3.execute("SELECT UPPER(name), LENGTH(name) FROM students LIMIT 2")
print("UPPER/LEN:", [dict(r) for r in c3.fetchall()])

c3.execute("SELECT date('now') AS today, datetime('now') AS now")
print("日期:", dict(c3.fetchone()))

c3.execute("SELECT COALESCE(NULL, '默认值') AS v")
print("COALESCE:", c3.fetchone()["v"])

c3.execute("""
    SELECT name, age,
        CASE WHEN age >= 18 THEN '成年' ELSE '未成年' END AS tag
    FROM students ORDER BY id
""")
print("CASE:")
for r in c3.fetchall():
    print("  ", dict(r))


# ------------------------------------------------------------
# 12. 聚合与分组
# ------------------------------------------------------------
print()
print("=" * 60)
print("12. 聚合与分组")
print("=" * 60)

c3.execute("""
    SELECT class_id, COUNT(*) AS cnt, MIN(age) AS min_age, MAX(age) AS max_age
    FROM students GROUP BY class_id
""")
print("分组统计:")
for r in c3.fetchall():
    print("  ", dict(r))

c3.execute("SELECT AVG(age) AS avg_age FROM students")
print("全班平均年龄:", round(c3.fetchone()["avg_age"], 2))


# ------------------------------------------------------------
# 13. PRAGMA 配置
# ------------------------------------------------------------
print()
print("=" * 60)
print("13. PRAGMA 配置")
print("=" * 60)

print("SQLite 版本:", sqlite3.sqlite_version)
print("foreign_keys:", conn3.execute("PRAGMA foreign_keys").fetchone()[0])

# 表结构
print("students 表结构:")
for r in conn3.execute("PRAGMA table_info(students)").fetchall():
    print("  ", dict(r))


# ------------------------------------------------------------
# 14. 自动提交模式
# ------------------------------------------------------------
print()
print("=" * 60)
print("14. 自动提交模式")
print("=" * 60)

conn4 = sqlite3.connect(":memory:", isolation_level=None)
c4 = conn4.cursor()
c4.execute("CREATE TABLE t (x INTEGER)")
c4.execute("INSERT INTO t VALUES (1)")
# 无需 commit，立即生效
c4.execute("SELECT COUNT(*) FROM t")
print("自动提交已生效，行数:", c4.fetchone()[0])


# ------------------------------------------------------------
# 15. 综合实战：CRUD 封装
# ------------------------------------------------------------
print()
print("=" * 60)
print("15. 综合实战：CRUD 封装")
print("=" * 60)

class UserDB:
    def __init__(self, conn):
        self.conn = conn
        self.conn.row_factory = sqlite3.Row
        self._init()

    def _init(self):
        with self.conn:
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    age INTEGER,
                    email TEXT UNIQUE
                )
            """)

    def add(self, name, age, email):
        with self.conn:
            cur = self.conn.execute(
                "INSERT INTO users (name, age, email) VALUES (?, ?, ?)",
                (name, age, email))
            return cur.lastrowid

    def get(self, uid):
        cur = self.conn.execute("SELECT * FROM users WHERE id = ?", (uid,))
        r = cur.fetchone()
        return dict(r) if r else None

    def list_all(self):
        cur = self.conn.execute("SELECT * FROM users ORDER BY id")
        return [dict(r) for r in cur]

    def update_age(self, uid, age):
        with self.conn:
            cur = self.conn.execute(
                "UPDATE users SET age = ? WHERE id = ?", (age, uid))
            return cur.rowcount

    def delete(self, uid):
        with self.conn:
            cur = self.conn.execute("DELETE FROM users WHERE id = ?", (uid,))
            return cur.rowcount

db = UserDB(sqlite3.connect(":memory:"))
i1 = db.add("alice", 25, "alice@x.com")
i2 = db.add("bob", 30, "bob@x.com")
print("新增 id:", i1, i2)
print("查单条:", db.get(i1))
print("全列表:")
for u in db.list_all():
    print("  ", u)
print("更新行数:", db.update_age(i1, 26))
print("更新后:", db.get(i1)["age"])
print("删除行数:", db.delete(i2))
print("删除后数量:", len(db.list_all()))

# 唯一约束测试
print("唯一约束:")
try:
    db.add("alice2", 1, "alice@x.com")
except sqlite3.IntegrityError as e:
    print("  重复 email 被拒绝:", e)

for c in [conn, conn2, conn3, conn4]:
    try:
        c.close()
    except Exception:
        pass

print()
print("SQLite 演示全部完成！")
`,
  },
  // =========================================================
  // 第四章：文件系统进阶
  // =========================================================
  {
    id: "py-pathlib-filesystem",
    group: "数据处理与持久化",
    icon: "📁",
    title: "文件系统进阶",
    content: `# 文件系统进阶

程序要和「文件」打交道——读配置、写日志、处理上传、遍历目录。Python 提供了三套层次递进的工具：

- **\`pathlib\`**：面向对象的现代路径 API（推荐首选）
- **\`os.path\`** + **\`os\`**：传统的函数式路径与系统操作
- **\`shutil\`**：高级文件操作（复制、移动、删除目录树）
- **\`tempfile\`**：临时文件与目录

本章会从 pathlib 讲起，覆盖日常文件操作的所有场景。

---

## 一、pathlib：面向对象的路径

\`pathlib\` 用 \`Path\` 对象表示路径，把路径操作变成「对象方法」，比 \`os.path\` 的函数式风格更优雅、更易读。

### 1.1 创建 Path 对象

\`\`\`python
from pathlib import Path           # 从 pathlib 导入 Path

p = Path("/home/user/demo.txt")    # 将 Path("/home/user/demo.txt") 赋给 p
p = Path("a/b/c.py")               # 将 Path("a/b/c.py") 赋给 p
p = Path.cwd()        # 当前工作目录
p = Path.home()       # 用户主目录
\`\`\`

Path 会自动处理路径分隔符——在 Windows 上用 \`\\\`，在 Linux/Mac 上用 \`/\`，你写代码用 \`/\` 即可，Path 帮你转换。

### 1.2 / 运符拼接路径

Path 重载了 \`/\` 运算符，让路径拼接像拼字符串一样直观：

\`\`\`python
from pathlib import Path           # 从 pathlib 导入 Path
base = Path("/home/user")          # 将 Path("/home/user") 赋给 base
config = base / "config" / "app.json"  # 将 base / "config" / "app.json" 赋给 config
print(config)  # /home/user/config/app.json

# 也能和字符串拼
p = base / "data" / "file.txt"     # 将 base / "data" / "file.txt" 赋给 p
\`\`\`

⚠️ \`/\` 两边至少有一个是 Path 对象，\`"a" / "b"\` 会报错（字符串不支持 /）。第一个用 Path，后面可以接字符串。

### 1.3 路径组成部分

\`\`\`python
from pathlib import Path           # 从 pathlib 导入 Path
p = Path("/home/user/docs/report.tar.gz")  # 将 Path("/home/user/docs/report.tar.gz") 赋给 p

print(p.name)      # report.tar.gz —— 文件名
print(p.stem)      # report —— 不含后缀的文件名
print(p.suffix)    # .gz —— 最后一个后缀
print(p.suffixes)  # ['.tar', '.gz'] —— 所有后缀
print(p.parent)    # /home/user/docs —— 父目录
print(p.parents)   # 父目录序列：/home/user/docs, /home/user, /home, /
print(p.parts)     # ('/', 'home', 'user', 'docs', 'report.tar.gz')
\`\`\`

\`with_suffix(new)\` 改后缀，\`with_name(new)\` 改文件名，返回新 Path（不改原对象）：

\`\`\`python
p = Path("report.tar.gz")          # 将 Path("report.tar.gz") 赋给 p
print(p.with_suffix(".zip"))    # report.tar.zip
print(p.with_name("data.csv"))  # data.csv
\`\`\`

⚠️ \`with_suffix\` 要求参数以 \`.\` 开头，传空字符串 \`""\` 可以去掉后缀。

---

## 二、读写文件

### 2.1 read_text / read_bytes

Path 对象直接提供读写方法，省去 \`open\`：

\`\`\`python
from pathlib import Path           # 从 pathlib 导入 Path
p = Path("note.txt")               # 将 Path("note.txt") 赋给 p
p.write_text("hello\\nworld", encoding="utf-8")  # 对 p 调用 write_text 方法，参数 "hello\\nworld", encoding="utf-8"
print(p.read_text(encoding="utf-8"))   # hello\\nworld
print(p.read_bytes())                   # b'hello\\nworld'
\`\`\`

\`read_text/read_bytes\` 一次性读全部，适合小文件。大文件还是用 \`open\` 逐行读。

### 2.2 write_text / write_bytes

\`\`\`python
from pathlib import Path           # 从 pathlib 导入 Path
Path("out.txt").write_text("内容", encoding="utf-8")  # 调用 Path，参数 "out.txt").write_text("内容", encoding="utf-8"
Path("data.bin").write_bytes(b"\\x00\\x01\\x02")  # 调用 Path，参数 "data.bin").write_bytes(b"\\x00\\x01\\x02"
\`\`\`

⚠️ \`write_text\` 是**覆盖写**（truncate），每次调用都会覆盖原内容。要追加用 \`open(p, "a")\`。

---

## 三、目录操作

### 3.1 mkdir / rmdir / unlink / rename

\`\`\`python
from pathlib import Path           # 从 pathlib 导入 Path

# 建目录
p = Path("newdir")                 # 将 Path("newdir") 赋给 p
p.mkdir()                    # 目录已存在会报错
p.mkdir(exist_ok=True)       # 存在也不报错
p.mkdir(parents=True)        # 递归创建父目录（类似 mkdir -p）

# 删目录（必须为空）
p.rmdir()                          # 对 p 调用 rmdir 方法

# 删文件
Path("a.txt").unlink()       # 不存在会报错
Path("a.txt").unlink(missing_ok=True)  # 不存在也不报错

# 重命名/移动
Path("old.txt").rename("new.txt")  # 调用 Path，参数 "old.txt").rename("new.txt"
\`\`\`

### 3.2 touch 创建空文件

\`\`\`python
Path("flag.txt").touch()  # 已存在则更新修改时间，不报错
\`\`\`

### 3.3 iterdir 遍历目录

\`\`\`python
from pathlib import Path           # 从 pathlib 导入 Path
for child in Path("/tmp").iterdir():  # 遍历 Path("/tmp").iterdir()，每次取值赋给 child
    print(child.name, child.is_dir(), child.is_file())  # 输出 child.name, child.is_dir(), child.is_file()
\`\`\`

\`iterdir\` 只列直接子项，不递归。

---

## 四、glob 模式匹配

### 4.1 glob / rglob

\`\`\`python
from pathlib import Path           # 从 pathlib 导入 Path

# 当前目录下所有 .py
for p in Path(".").glob("*.py"):   # 遍历 Path(".").glob("*.py")，每次取值赋给 p
    print(p)                       # 输出 p

# 递归所有 .py（rglob 等价于 glob("**/*.py")）
for p in Path(".").rglob("*.py"):  # 遍历 Path(".").rglob("*.py")，每次取值赋给 p
    print(p)                       # 输出 p

# 通配符
Path(".").glob("data*")     # 以 data 开头
Path(".").glob("?.txt")     # 单字符文件名
Path(".").glob("**/*.csv")  # 递归所有 .csv
\`\`\`

\`*\` 匹配任意字符（不含路径分隔符），\`?\` 匹配单字符，\`**\` 递归任意层目录。

### 4.2 glob vs rglob

- \`glob("*.py")\`：当前层
- \`glob("**/*.py")\`：递归（含子目录）
- \`rglob("*.py")\`：等价于 \`glob("**/*.py")\`，更简洁

### 4.3 返回生成器

\`glob\` 返回生成器，惰性遍历，省内存。要列表用 \`list(Path(".").glob("*.py"))\`。

---

## 五、文件信息与判断

### 5.1 exists / is_file / is_dir

\`\`\`python
from pathlib import Path           # 从 pathlib 导入 Path
p = Path("note.txt")               # 将 Path("note.txt") 赋给 p
print(p.exists())    # 是否存在
print(p.is_file())   # 是否是文件
print(p.is_dir())    # 是否是目录
\`\`\`

### 5.2 stat 文件信息

\`\`\`python
from pathlib import Path           # 从 pathlib 导入 Path
import datetime                    # 导入 datetime 模块
p = Path("note.txt")               # 将 Path("note.txt") 赋给 p
st = p.stat()                      # 将 p.stat() 赋给 st
print(st.st_size)              # 字节数
print(st.st_mtime)             # 修改时间戳
print(datetime.datetime.fromtimestamp(st.st_mtime))  # 转可读时间
print(st.st_mode)              # 权限模式
\`\`\`

\`st.st_size\` 大小（字节）、\`st.st_mtime\` 修改时间、\`st.st_ctime\` 创建时间、\`st.st_atime\` 访问时间。

### 5.3 权限 chmod

\`\`\`python
from pathlib import Path           # 从 pathlib 导入 Path
Path("script.sh").chmod(0o755)  # rwxr-xr-x
\`\`\`

权限用八进制：\`0o755\` = 拥有者 rwx、组 r-x、其他 r-x。

---

## 六、os.path 与 os 模块

\`os.path\` 是传统的路径函数，\`pathlib\` 出现前的主力。现在新代码推荐 pathlib，但老代码里到处都是 os.path，得能看懂。

### 6.1 os.path 常用

\`\`\`python
import os.path as op               # 导入 os.path 模块并取别名 op

op.join("a", "b", "c.py")   # a/b/c.py —— 拼接（跨平台）
op.exists("a.txt")          # 是否存在
op.isfile("a.txt")          # 是否文件
op.isdir("a")               # 是否目录
op.basename("/a/b/c.py")    # c.py —— 文件名
op.dirname("/a/b/c.py")     # /a/b —— 目录
op.split("/a/b/c.py")       # ('/a/b', 'c.py')
op.splitext("c.py")         # ('c', '.py')
op.abspath("a.py")          # 绝对路径
op.expanduser("~/x")        # 展开家目录
op.getsize("a.txt")         # 字节数
\`\`\`

### 6.2 os 模块

\`\`\`python
import os                          # 导入 os 模块

os.getcwd()              # 当前工作目录
os.listdir(".")          # 列出目录（返回文件名列表）
os.remove("a.txt")       # 删文件
os.rename("a", "b")      # 重命名
os.makedirs("a/b/c")     # 递归建目录
os.environ               # 环境变量字典
os.environ.get("HOME")   # 取环境变量
os.system("ls")          # 执行系统命令（返回退出码）
\`\`\`

⚠️ \`os.system\` 执行命令不安全（注入风险），要执行外部程序用 \`subprocess\` 模块。

---

## 七、shutil：高级文件操作

\`shutil\` 提供目录级别的操作（复制、移动、删除整棵树），这些 \`os\` 和 \`pathlib\` 不直接支持。

### 7.1 copy / copy2 / copyfile

\`\`\`python
import shutil                      # 导入 shutil 模块

shutil.copy("a.txt", "b.txt")        # 复制文件内容+权限
shutil.copy2("a.txt", "b.txt")       # 复制内容+权限+元数据（修改时间等）
shutil.copyfile("a.txt", "b.txt")    # 只复制内容
\`\`\`

\`copy2\` 保留的元数据最多，推荐用它做文件备份。

### 7.2 copytree / rmtree

\`\`\`python
import shutil                      # 导入 shutil 模块

# 复制整棵目录树
shutil.copytree("src", "dst")      # 对 shutil 调用 copytree 方法，参数 "src", "dst"

# 删除整棵目录树（含内容）
shutil.rmtree("dst")               # 对 shutil 调用 rmtree 方法，参数 "dst"
\`\`\`

### 7.3 move

\`\`\`python
import shutil                      # 导入 shutil 模块
shutil.move("a.txt", "b.txt")   # 移动/重命名
shutil.move("file.txt", "/other/dir/")  # 移到别的目录
\`\`\`

### 7.4 disk_usage

\`\`\`python
import shutil                      # 导入 shutil 模块
total, used, free = shutil.disk_usage("/")
print("总:", total // (1024**3), "GB")  # 输出 "总:", total // (1024**3), "GB"
print("已用:", used // (1024**3), "GB")  # 输出 "已用:", used // (1024**3), "GB"
print("可用:", free // (1024**3), "GB")  # 输出 "可用:", free // (1024**3), "GB"
\`\`\`

---

## 八、tempfile：临时文件

\`tempfile\` 生成临时文件/目录，系统会自动清理，适合缓存、中间数据。

### 8.1 NamedTemporaryFile

\`\`\`python
import tempfile                    # 导入 tempfile 模块

# 创建有名字的临时文件，关闭后自动删除
with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=True) as f:  # 使用上下文管理器 tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=True)，绑定到 f
    f.write("hello")               # 对 f 调用 write 方法，参数 "hello"
    f.flush()                      # 对 f 调用 flush 方法
    print(f.name)  # 临时文件路径
# with 退出后文件被删除
\`\`\`

### 8.2 TemporaryDirectory

\`\`\`python
import tempfile                    # 导入 tempfile 模块

with tempfile.TemporaryDirectory() as d:  # 使用上下文管理器 tempfile.TemporaryDirectory()，绑定到 d
    print(d)  # 临时目录路径
    # 在 d 里干活
    Path(d, "a.txt").write_text("x")  # 调用 Path，参数 d, "a.txt").write_text("x"
# with 退出后目录及内容被删除
\`\`\`

### 8.3 mkstemp / mkdtemp

低层级 API，返回文件描述符和路径，需要自己关闭、删除：

\`\`\`python
import tempfile                    # 导入 tempfile 模块
fd, path = tempfile.mkstemp(suffix=".log")
# 用 fd 操作后，os.close(fd) + os.remove(path)
\`\`\`

---

## 九、fnmatch 与 glob 模式

\`fnmatch\` 用 shell 风格通配符匹配文件名（不是正则）：

\`\`\`python
import fnmatch                     # 导入 fnmatch 模块
print(fnmatch.fnmatch("report.csv", "*.csv"))   # True
print(fnmatch.fnmatch("data2024.txt", "data????.txt"))  # True

# 过滤目录
import os                          # 导入 os 模块
csvs = [f for f in os.listdir(".") if fnmatch.fnmatch(f, "*.csv")]  # 创建列表并赋给 csvs
\`\`\`

通配符：\`*\` 任意字符、\`?\` 单字符、\`[seq]\` 字符集、\`[!seq]\` 取反。

---

## 十、路径遍历实战

### 10.1 递归找最大文件

\`\`\`python
from pathlib import Path           # 从 pathlib 导入 Path

def find_largest(root, pattern="*"):  # 定义函数 find_largest，参数：root, pattern="*"
    largest = None                 # 将 None 赋给 largest
    size = 0                       # 将整数 0 赋给 size
    for p in Path(root).rglob(pattern):  # 遍历 Path(root).rglob(pattern)，每次取值赋给 p
        if p.is_file():            # 如果 p.is_file() 成立
            s = p.stat().st_size   # 将 p.stat().st_size 赋给 s
            if s > size:           # 如果 s > size 成立
                size, largest = s, p
    return largest, size           # 返回 largest, size
\`\`\`

### 10.2 统计各类型文件数量

\`\`\`python
from pathlib import Path           # 从 pathlib 导入 Path
from collections import Counter    # 从 collections 导入 Counter

def count_types(root):             # 定义函数 count_types，参数：root
    c = Counter()                  # 将 Counter() 赋给 c
    for p in Path(root).rglob("*"):  # 遍历 Path(root).rglob("*")，每次取值赋给 p
        if p.is_file():            # 如果 p.is_file() 成立
            c[p.suffix or "(无后缀)"] += 1
    return c                       # 返回 c
\`\`\`

### 10.3 安全拼接用户输入路径

\`\`\`python
from pathlib import Path           # 从 pathlib 导入 Path

def safe_path(base, user_input):   # 定义函数 safe_path，参数：base, user_input
    base = Path(base).resolve()    # 将 Path(base).resolve() 赋给 base
    target = (base / user_input).resolve()  # 创建元组并赋给 target
    # 防目录穿越：target 必须在 base 下
    if not str(target).startswith(str(base)):  # 如果 not str(target).startswith(str(base)) 成立
        raise ValueError("非法路径")   # 抛出异常：ValueError("非法路径")
    return target                  # 返回 target
\`\`\`

⚠️ 处理用户提供的路径要防**目录穿越攻击**——用户传 \`../../etc/passwd\` 可能读到不该读的文件。用 \`resolve()\` 解析后检查是否在允许的根目录下。

---

## 十一、pathlib vs os.path 对照

| 功能 | pathlib | os.path |
|------|---------|---------|
| 当前目录 | \`Path.cwd()\` | \`os.getcwd()\` |
| 家目录 | \`Path.home()\` | \`os.path.expanduser("~")\` |
| 拼接 | \`a / b\` | \`os.path.join(a, b)\` |
| 文件名 | \`p.name\` | \`os.path.basename(p)\` |
| 目录 | \`p.parent\` | \`os.path.dirname(p)\` |
| 后缀 | \`p.suffix\` | \`os.path.splitext(p)[1]\` |
| 存在 | \`p.exists()\` | \`os.path.exists(p)\` |
| 绝对路径 | \`p.resolve()\` | \`os.path.abspath(p)\` |
| 大小 | \`p.stat().st_size\` | \`os.path.getsize(p)\` |

新项目用 pathlib，读老代码认识 os.path 即可。

---

## 十二、本章小结

- **pathlib**：面向对象路径，\`/\` 拼接、\`glob/rglob\` 查找、\`read_text/write_text\` 读写，新代码首选
- **路径组成**：\`name/stem/suffix/parent/parts\`，\`with_suffix/with_name\` 返回新 Path
- **os.path/os**：传统函数式 API，跨平台拼接 \`os.path.join\`，看懂老代码用
- **shutil**：\`copy/copytree/rmtree/move/disk_usage\`，目录级操作
- **tempfile**：\`NamedTemporaryFile/TemporaryDirectory\`，临时文件自动清理
- **安全**：用户输入路径要防目录穿越，用 \`resolve()\` + 前缀检查

文件操作是程序和外部世界交互的桥梁。掌握 pathlib，你就能优雅地处理配置、日志、缓存、上传文件等各种场景。

下一章我们学习序列化与反序列化，把内存对象「冻结」成字节持久保存。
`,
    code: `# ============================================================
# 第四章演示代码：文件系统进阶
# 使用 tempfile 避免污染真实文件系统
# ============================================================

import os
import shutil
import tempfile
import fnmatch
from pathlib import Path
from collections import Counter
import datetime

# 在临时目录里工作，结束后自动清理
WORK = tempfile.mkdtemp(prefix="pydemo_")
print("工作目录:", WORK)

# ------------------------------------------------------------
# 1. Path 对象与拼接
# ------------------------------------------------------------
print()
print("=" * 60)
print("1. Path 对象与拼接")
print("=" * 60)

p = Path(WORK) / "docs" / "report.tar.gz"
print("拼接:", p)
print("name:", p.name)
print("stem:", p.stem)
print("suffix:", p.suffix)
print("suffixes:", p.suffixes)
print("parent:", p.parent)
print("parts:", p.parts)
print("with_suffix:", p.with_suffix(".zip"))
print("with_name:", p.with_name("data.csv"))


# ------------------------------------------------------------
# 2. 读写文件
# ------------------------------------------------------------
print()
print("=" * 60)
print("2. 读写文件")
print("=" * 60)

txt = Path(WORK) / "note.txt"
txt.write_text("第一行\\n第二行\\n", encoding="utf-8")
print("read_text:", repr(txt.read_text(encoding="utf-8")))

binary = Path(WORK) / "data.bin"
binary.write_bytes(b"\\x00\\x01\\x02\\x03")
print("read_bytes:", binary.read_bytes())

# 追加写
with open(txt, "a", encoding="utf-8") as f:
    f.write("第三行\\n")
print("追加后:", repr(txt.read_text(encoding="utf-8")))


# ------------------------------------------------------------
# 3. 目录操作
# ------------------------------------------------------------
print()
print("=" * 60)
print("3. 目录操作")
print("=" * 60)

d1 = Path(WORK) / "sub1" / "deep"
d1.mkdir(parents=True, exist_ok=True)
print("创建深层目录:", d1.exists(), d1.is_dir())

# touch
flag = Path(WORK) / "flag.txt"
flag.touch()
flag.touch()  # 再 touch 不报错
print("touch 后存在:", flag.exists())

# iterdir
Path(WORK, "a.txt").write_text("a")
Path(WORK, "b.txt").write_text("b")
print("iterdir:")
for child in Path(WORK).iterdir():
    print("  ", child.name, "is_dir=", child.is_dir())


# ------------------------------------------------------------
# 4. glob 模式匹配
# ------------------------------------------------------------
print()
print("=" * 60)
print("4. glob 模式匹配")
print("=" * 60)

# 建一些文件
base = Path(WORK) / "proj"
(base / "src").mkdir(parents=True)
(base / "src" / "a.py").write_text("x")
(base / "src" / "b.py").write_text("y")
(base / "src" / "c.txt").write_text("z")
(base / "src" / "sub").mkdir()
(base / "src" / "sub" / "d.py").write_text("w")

print("当前层 *.py:", sorted(p.name for p in (base / "src").glob("*.py")))
print("递归 *.py:", sorted(p.relative_to(base).as_posix() for p in base.rglob("*.py")))
print("通配 data*:", list(Path(WORK).glob("data*")))


# ------------------------------------------------------------
# 5. 文件信息与判断
# ------------------------------------------------------------
print()
print("=" * 60)
print("5. 文件信息")
print("=" * 60)

info = Path(WORK) / "info.txt"
info.write_text("hello world")
st = info.stat()
print("exists:", info.exists())
print("is_file:", info.is_file())
print("is_dir:", info.is_dir())
print("size:", st.st_size, "字节")
print("mtime:", datetime.datetime.fromtimestamp(st.st_mtime))

# chmod
sh_path = Path(WORK) / "script.sh"
sh_path.write_text("#!/bin/sh\\necho hi")
sh_path.chmod(0o755)
print("chmod 后 mode:", oct(sh_path.stat().st_mode))


# ------------------------------------------------------------
# 6. 重命名与删除
# ------------------------------------------------------------
print()
print("=" * 60)
print("6. 重命名与删除")
print("=" * 60)

old = Path(WORK) / "old_name.txt"
old.write_text("rename me")
new = old.rename(Path(WORK) / "new_name.txt")
print("重命名:", new.exists(), "原文件:", old.exists())

# unlink
todelete = Path(WORK) / "todelete.txt"
todelete.write_text("del")
todelete.unlink()
print("删除后存在:", todelete.exists())
todelete.unlink(missing_ok=True)  # 不存在也不报错


# ------------------------------------------------------------
# 7. os.path 对照
# ------------------------------------------------------------
print()
print("=" * 60)
print("7. os.path 对照")
print("=" * 60)

import os.path as op
sample = Path(WORK) / "x" / "y" / "file.csv"
print("join:", op.join(WORK, "x", "y", "file.csv"))
print("basename:", op.basename(str(sample)))
print("dirname:", op.dirname(str(sample)))
print("splitext:", op.splitext("file.tar.gz"))
print("abspath:", op.abspath("a.py"))
print("expanduser:", op.expanduser("~"))
print("getsize:", op.getsize(str(Path(WORK) / "info.txt")))


# ------------------------------------------------------------
# 8. os 模块
# ------------------------------------------------------------
print()
print("=" * 60)
print("8. os 模块")
print("=" * 60)

print("getcwd:", os.getcwd())
print("listdir 数量:", len(os.listdir(WORK)))
print("environ HOME:", os.environ.get("HOME", "无"))


# ------------------------------------------------------------
# 9. shutil 高级操作
# ------------------------------------------------------------
print()
print("=" * 60)
print("9. shutil 高级操作")
print("=" * 60)

# copy
src_file = Path(WORK) / "info.txt"
dst_file = Path(WORK) / "info_copy.txt"
shutil.copy2(str(src_file), str(dst_file))
print("copy2 后:", dst_file.exists(), "大小:", dst_file.stat().st_size)

# copytree
src_tree = Path(WORK) / "tree_src"
(src_tree / "d").mkdir(parents=True)
(src_tree / "a.txt").write_text("aaa")
(src_tree / "d" / "b.txt").write_text("bbb")
dst_tree = Path(WORK) / "tree_dst"
shutil.copytree(str(src_tree), str(dst_tree))
print("copytree 后存在:", dst_tree.exists())
print("复制内容:", sorted(p.name for p in dst_tree.rglob("*")))

# move
moved = Path(WORK) / "moved.txt"
moved.write_text("move me")
shutil.move(str(moved), str(Path(WORK) / "moved2.txt"))
print("move 后:", Path(WORK, "moved2.txt").exists(), "原:", moved.exists())

# disk_usage
total, used, free = shutil.disk_usage(WORK)
print("磁盘 总/用/空(GiB):", total // (1024**3), used // (1024**3), free // (1024**3))

# rmtree
shutil.rmtree(str(src_tree))
shutil.rmtree(str(dst_tree))
print("rmtree 后 src 存在:", src_tree.exists())


# ------------------------------------------------------------
# 10. tempfile 临时文件与目录
# ------------------------------------------------------------
print()
print("=" * 60)
print("10. tempfile")
print("=" * 60)

# NamedTemporaryFile
with tempfile.NamedTemporaryFile(mode="w", suffix=".tmp", delete=True) as tf:
    tf.write("临时数据")
    tf.flush()
    print("临时文件路径:", tf.name)
    print("临时文件存在:", Path(tf.name).exists())
print("退出后存在:", Path(tf.name).exists() if "tf" in dir() else "已删除")

# TemporaryDirectory
with tempfile.TemporaryDirectory(prefix="td_") as td:
    print("临时目录:", td)
    Path(td, "a.txt").write_text("x")
    print("目录内文件:", [p.name for p in Path(td).iterdir()])
print("退出后目录存在:", Path(td).exists())

# mkstemp / mkdtemp
fd, tmp_path = tempfile.mkstemp(suffix=".log", prefix="mk_")
print("mkstemp 路径:", tmp_path)
os.close(fd)
os.remove(tmp_path)

tmp_dir = tempfile.mkdtemp(prefix="mkd_")
print("mkdtemp 路径:", tmp_dir)
shutil.rmtree(tmp_dir)


# ------------------------------------------------------------
# 11. fnmatch 模式匹配
# ------------------------------------------------------------
print()
print("=" * 60)
print("11. fnmatch")
print("=" * 60)

names = ["report.csv", "data2024.txt", "notes.md", "data2025.txt"]
print("*.csv:", [f for f in names if fnmatch.fnmatch(f, "*.csv")])
print("data????.txt:", [f for f in names if fnmatch.fnmatch(f, "data????.txt")])
print("[nd]*:", [f for f in names if fnmatch.fnmatch(f, "[nd]*")])
print("[!r]*:", [f for f in names if fnmatch.fnmatch(f, "[!r]*")])


# ------------------------------------------------------------
# 12. 路径遍历实战
# ------------------------------------------------------------
print()
print("=" * 60)
print("12. 路径遍历实战")
print("=" * 60)

# 造一些测试文件
demo = Path(WORK) / "files"
(demo).mkdir(parents=True)
(demo / "a.py").write_text("x" * 100)
(demo / "b.py").write_text("y" * 50)
(demo / "c.txt").write_text("z" * 200)
(demo / "d.csv").write_text("1,2,3")
(demo / "sub").mkdir()
(demo / "sub" / "e.py").write_text("w" * 300)

# 找最大文件
def find_largest(root, pattern="*"):
    largest = None
    size = 0
    for fp in Path(root).rglob(pattern):
        if fp.is_file():
            s = fp.stat().st_size
            if s > size:
                size, largest = s, fp
    return largest, size

lp, ls = find_largest(demo)
print("最大文件:", lp.name, "大小:", ls, "字节")

# 统计各类型
def count_types(root):
    c = Counter()
    for fp in Path(root).rglob("*"):
        if fp.is_file():
            c[fp.suffix or "(无后缀)"] += 1
    return c

print("类型统计:", dict(count_types(demo)))

# 安全路径拼接
def safe_path(base, user_input):
    base_r = Path(base).resolve()
    target = (base_r / user_input).resolve()
    if not str(target).startswith(str(base_r)):
        raise ValueError("非法路径: " + user_input)
    return target

print("安全路径 normal:", safe_path(demo, "a.py").name)
try:
    safe_path(demo, "../../etc/passwd")
except ValueError as e:
    print("安全路径 拦截:", e)


# ------------------------------------------------------------
# 13. pathlib vs os.path 对照
# ------------------------------------------------------------
print()
print("=" * 60)
print("13. pathlib vs os.path")
print("=" * 60)

sample = Path(demo) / "a.py"
print("Path.cwd:", Path.cwd())
print("Path.home:", Path.home())
print("p.exists:", sample.exists())
print("p.resolve:", sample.resolve())
print("p.stat().st_size:", sample.stat().st_size)
print("os.path.exists:", op.exists(str(sample)))
print("os.path.abspath:", op.abspath(str(sample)))


# ------------------------------------------------------------
# 14. 综合实战：批量重命名
# ------------------------------------------------------------
print()
print("=" * 60)
print("14. 综合实战：批量重命名")
print("=" * 60)

rename_dir = Path(WORK) / "rename"
rename_dir.mkdir()
for i in range(3):
    (rename_dir / ("IMG_" + str(i) + ".JPG")).write_text("img")

print("重命名前:", sorted(p.name for p in rename_dir.iterdir()))
count = 0
for fp in rename_dir.glob("*.JPG"):
    new_name = fp.stem.lower() + ".jpg"
    fp.rename(fp.with_name(new_name))
    count += 1
print("重命名后:", sorted(p.name for p in rename_dir.iterdir()))
print("共重命名:", count, "个文件")


# ------------------------------------------------------------
# 15. 清理工作目录
# ------------------------------------------------------------
print()
print("=" * 60)
print("15. 清理")
print("=" * 60)

shutil.rmtree(WORK)
print("工作目录已清理:", not Path(WORK).exists())

print()
print("文件系统演示全部完成！")
`,
  },
  // =========================================================
  // 第五章：序列化与反序列化
  // =========================================================
  {
    id: "py-serialization",
    group: "数据处理与持久化",
    icon: "📦",
    title: "序列化与反序列化",
    content: `# 序列化与反序列化

**序列化**（serialization）是把内存里的对象转换成**字节流**（或字符串）的过程，目的是存储到磁盘或通过网络传输；**反序列化**（deserialization）则是把字节流还原成内存对象。上一章的 JSON 就是一种序列化格式，但它只能处理基本类型。本章的主角是 Python 的 \`pickle\`——它能序列化**几乎任何 Python 对象**，包括自定义类、嵌套结构，甚至函数（部分）。

pickle 极其强大，但也极其危险：**反序列化不可信的 pickle 数据等于执行任意代码**。本章会讲清楚它的能力边界和安全红线，并对比 \`shelve\`、\`marshal\`、\`copyreg\` 等相关工具。

---

## 一、为什么需要序列化

程序运行时，对象存在内存里，关机就消失。但很多场景需要把对象「保存」下来：

- **缓存**：把计算结果存磁盘，下次直接读，省得重算
- **持久化**：游戏存档、会话状态、任务队列
- **跨进程通信**：multiprocessing 用 pickle 在进程间传对象
- **分布式计算**：把任务对象序列化发到远程 worker

JSON 能做一部分，但它只认 dict/list/str/number/bool/None。如果你有一个 \`User\` 对象、一个 \`datetime\`、一个嵌套的自定义类，JSON 就得你手动转。pickle 则「原样」保存，反序列化后还是原来的对象。

---

## 二、pickle 基础

### 2.1 dumps / loads：字节互转

\`pickle.dumps(obj)\` 把对象序列化成 \`bytes\`，\`pickle.loads(data)\` 把 \`bytes\` 还原成对象：

\`\`\`python
import pickle                      # 导入 pickle 模块

data = {"name": "tom", "scores": [90, 85], "vip": True}  # 创建字典并赋给 data

# 序列化
b = pickle.dumps(data)             # 将 pickle.dumps(data) 赋给 b
print(type(b))  # <class 'bytes'>
print(b)        # b'\\x80\\x05...' 一串字节

# 反序列化
obj = pickle.loads(b)              # 将 pickle.loads(b) 赋给 obj
print(obj)            # {'name': 'tom', 'scores': [90, 85], 'vip': True}
print(obj == data)    # True（值相等）
print(obj is data)    # False（不是同一个对象）
\`\`\`

注意 \`dumps\` 返回的是 \`bytes\`（不是字符串），\`loads\` 接收 \`bytes\`。\`s\` 是 string 的旧称，但在 pickle 里其实是 bytes。

### 2.2 dump / load：直接读写文件

\`pickle.dump(obj, file)\` 写入文件对象（必须二进制模式），\`pickle.load(file)\` 从文件读出：

\`\`\`python
import pickle                      # 导入 pickle 模块

data = {"name": "tom"}             # 创建字典并赋给 data
with open("data.pkl", "wb") as f:   # 注意是 wb 二进制写
    pickle.dump(data, f)           # 对 pickle 调用 dump 方法，参数 data, f

with open("data.pkl", "rb") as f:   # rb 二进制读
    obj = pickle.load(f)           # 将 pickle.load(f) 赋给 obj
print(obj)  # {'name': 'tom'}
\`\`\`

⚠️ pickle 文件必须用**二进制模式**打开（\`wb\` / \`rb\`），用文本模式会损坏数据。

### 2.3 一次文件存多个对象

pickle 支持在同一个文件里**连续 dump 多个对象**，再用循环 load 读出：

\`\`\`python
import pickle                      # 导入 pickle 模块
import io                          # 导入 io 模块

buf = io.BytesIO()                 # 将 io.BytesIO() 赋给 buf
pickle.dump({"a": 1}, buf)         # 对 pickle 调用 dump 方法，参数 {"a": 1}, buf
pickle.dump({"b": 2}, buf)         # 对 pickle 调用 dump 方法，参数 {"b": 2}, buf
pickle.dump({"c": 3}, buf)         # 对 pickle 调用 dump 方法，参数 {"c": 3}, buf

buf.seek(0)                        # 对 buf 调用 seek 方法，参数 0
while True:                        # 当 True 为真时重复执行
    try:                           # 尝试执行以下代码块
        obj = pickle.load(buf)     # 将 pickle.load(buf) 赋给 obj
        print(obj)                 # 输出 obj
    except EOFError:               # 捕获 EOFError 异常
        break                      # 跳出循环
# {'a': 1}
# {'b': 2}
# {'c': 3}
\`\`\`

读到末尾会抛 \`EOFError\`，用它判断结束。这种「流式存多个对象」在任务队列、日志场景有用。

---

## 三、pickle 协议版本

pickle 有多个「协议版本」（protocol），版本越高，序列化越紧凑、越快，但只能被相同或更高版本的 Python 读取。

\`\`\`python
import pickle                      # 导入 pickle 模块
print(pickle.HIGHEST_PROTOCOL)  # 当前最高版本（如 5）
print(pickle.DEFAULT_PROTOCOL)  # 默认版本
\`\`\`

\`dumps\` / \`dump\` 可指定 \`protocol\`：

\`\`\`python
pickle.dumps(data, protocol=pickle.HIGHEST_PROTOCOL)  # 对 pickle 调用 dumps 方法，参数 data, protocol=pickle.HIGHEST_PROTOCOL
\`\`\`

| 协议 | 引入版本 | 特点 |
|------|----------|------|
| 0 | 最早 | ASCII 可读，兼容老 Python |
| 1 | 早期 | 二进制，老格式 |
| 2 | 2.3 | 支持 \`__newargs__\`、新式类 |
| 3 | 3.0 | 支持 bytes |
| 4 | 3.4 | 支持大对象、嵌套优化 |
| 5 | 3.8 | 支持带外数据（PEP 574） |

**建议**：要跨版本兼容就用 \`protocol=2\`；只在自家程序内部用就用 \`HIGHEST_PROTOCOL\`。默认值已经是较高版本，一般够用。

⚠️ pickle 协议**向后兼容**（新 Python 能读旧协议），但**不一定向前兼容**（旧 Python 读不了协议 5 的数据）。把数据发给老版本 Python 时要降级协议。

---

## 四、序列化自定义对象

pickle 默认能序列化自定义类的实例，只要类的定义在反序列化时**还能 import 到**：

\`\`\`python
import pickle                      # 导入 pickle 模块

class User:                        # 定义类 User
    def __init__(self, name, age): # 定义函数 __init__，参数：self, name, age
        self.name = name
        self.age = age
    def __repr__(self):            # 定义函数 __repr__，参数：self
        return "User(%s, %d)" % (self.name, self.age)  # 返回 "User(%s, %d)" % (self.name, self.age)

u = User("tom", 18)                # 将 User("tom", 18) 赋给 u
b = pickle.dumps(u)                # 将 pickle.dumps(u) 赋给 b
u2 = pickle.loads(b)               # 将 pickle.loads(b) 赋给 u2
print(u2)         # User(tom, 18)
print(type(u2))   # <class 'User'>
\`\`\`

⚠️ 关键限制：pickle 存的是「类所在的模块路径 + 实例数据」，**不存类的定义**。反序列化时，Python 会去 import 对应的类。如果你把 \`User\` 类删了或改名了，反序列化会抛 \`AttributeError\`。

这就是为什么 pickle 不适合「长期存档」——代码一改，旧数据就读不回来了。

---

## 五、__getstate__ / __setstate__：自定义序列化

类可以实现 \`__getstate__\` 和 \`__setstate__\` 来控制「存什么、怎么还原」。

### 5.1 默认行为

默认 \`__getstate__\` 返回 \`self.__dict__\`（实例的所有属性）。反序列化时 \`__setstate__\` 把这个字典还原到 \`__dict__\`。

### 5.2 过滤敏感字段

比如对象里有数据库连接（不可序列化）或密码（不想存），可以在 \`__getstate__\` 里剔除：

\`\`\`python
import pickle                      # 导入 pickle 模块

class Session:                     # 定义类 Session
    def __init__(self, user, password):  # 定义函数 __init__，参数：self, user, password
        self.user = user
        self.password = password  # 不想被 pickle
    def __getstate__(self):        # 定义函数 __getstate__，参数：self
        state = self.__dict__.copy()  # 将 self.__dict__.copy() 赋给 state
        del state["password"]    # 序列化时去掉密码
        return state               # 返回 state
    def __setstate__(self, state): # 定义函数 __setstate__，参数：self, state
        self.__dict__.update(state)
        self.password = None      # 反序列化时设为 None

s = Session("tom", "secret123")    # 将 Session("tom", "secret123") 赋给 s
b = pickle.dumps(s)                # 将 pickle.dumps(s) 赋给 b
s2 = pickle.loads(b)               # 将 pickle.loads(b) 赋给 s2
print(s2.user)      # tom
print(s2.password)  # None —— 密码没被存
\`\`\`

### 5.3 处理不可序列化属性

对象里若有文件句柄、锁、网络连接，序列化会失败。在 \`__getstate__\` 里把它们排除，\`__setstate__\` 里重建：

\`\`\`python
class Worker:                      # 定义类 Worker
    def __init__(self, name):      # 定义函数 __init__，参数：self, name
        self.name = name
        self.cache = dict()  # 可序列化
        self.conn = None     # 不可序列化，运行时建立
    def __getstate__(self):        # 定义函数 __getstate__，参数：self
        state = self.__dict__.copy()  # 将 self.__dict__.copy() 赋给 state
        state["conn"] = None  # 不存连接
        return state               # 返回 state
    def __setstate__(self, state): # 定义函数 __setstate__，参数：self, state
        self.__dict__.update(state)
        self.conn = self._connect()  # 反序列化时重建
    def _connect(self):            # 定义函数 _connect，参数：self
        return "连接对象(模拟)"          # 返回 "连接对象(模拟)"
\`\`\`

\`__getstate__\` 返回的可以是任意可序列化对象（不一定是 dict），\`__setstate__\` 接收它做还原。如果只实现 \`__getstate__\` 不实现 \`__setstate__\`，则用返回值直接更新 \`__dict__\`。

---

## 六、pickle 的安全红线

### 6.1 pickle 能执行任意代码

pickle 的字节流里可以包含「指令」，反序列化时会**调用**指定函数。这意味着：**反序列化不可信的 pickle 数据，等于让对方在你的机器上执行任意代码**。

\`\`\`python
# 概念演示：恶意 pickle 可以在 load 时执行任意操作
# 下面这段只是说明原理，不要真去构造
import pickle, os

class Exploit:                     # 定义类 Exploit
    def __reduce__(self):          # 定义函数 __reduce__，参数：self
        # __reduce__ 告诉 pickle 用什么函数重建对象
        # 恶意者会在这里放 os.system("rm -rf /") 之类
        return (print, ("我被执行了",)) # 返回 (print, ("我被执行了",))

bad = pickle.dumps(Exploit())      # 将 pickle.dumps(Exploit()) 赋给 bad
# pickle.loads(bad)  # 会调用 print("我被执行了")
\`\`\`

\`__reduce__\` 是 pickle 的底层钩子：它返回一个 \`(callable, args)\` 元组，反序列化时执行 \`callable(*args)\`。恶意数据把 callable 设成 \`os.system\`，args 设成恶意命令，load 时就执行了。

### 6.2 安全准则

- **永远不要 \`pickle.load\` 来自不可信来源的数据**（用户上传、网络、邮件）
- 要交换数据，用 JSON、CSV 这类「纯数据」格式
- 必须接收 pickle 时，用沙箱、签名校验
- \`multiprocessing\` 内部用 pickle 传对象，所以传给子进程的对象必须是可信的

这是 pickle 最重要的安全知识：**pickle 不是数据交换格式，是 Python 内部的对象存档机制**。

---

## 七、shelve：持久化字典

\`shelve\` 在 pickle 之上封装了一个「像字典一样用，但存在磁盘上」的对象。每个 value 被 pickle 存到一个 dbm 文件：

\`\`\`python
import shelve                      # 导入 shelve 模块

# 打开（创建）一个 shelf
with shelve.open("mydb") as db:    # 使用上下文管理器 shelve.open("mydb")，绑定到 db
    db["user1"] = {"name": "tom", "age": 18}
    db["user2"] = {"name": "jerry", "age": 20}
    print(db["user1"])      # {'name': 'tom', 'age': 18}
    print("user1" in db)    # True
    print(list(db.keys()))  # ['user1', 'user2']

# 再次打开，数据还在
with shelve.open("mydb") as db:    # 使用上下文管理器 shelve.open("mydb")，绑定到 db
    print(db["user2"]["name"])  # jerry
\`\`\`

⚠️ shelve 默认**不会自动写回**修改的可变对象。如果你 \`db["user1"]["age"] = 19\`，修改的是临时取出的副本，没存回去：

\`\`\`python
with shelve.open("mydb") as db:    # 使用上下文管理器 shelve.open("mydb")，绑定到 db
    db["user1"]["age"] = 19      # 可能不生效！
    # 正确做法 1：整体替换
    u = db["user1"]                # 将 db["user1"] 赋给 u
    u["age"] = 19
    db["user1"] = u
    # 正确做法 2：开 writeback
\`\`\`

\`shelve.open(path, writeback=True)\` 开启「写回」模式，所有访问的对象缓存在内存，关闭时统一写回。代价是占内存、关闭慢。

shelve 适合「键值对」式持久化，比手动 pickle 多个文件到字典方便。但 value 同样用 pickle，**同样有安全风险**，不要存不可信数据。

---

## 八、marshal 模块

\`marshal\` 是更底层的序列化模块，主要给 Python 内部用（存 \`.pyc\` 字节码）。它比 pickle 快，但能处理的类型少，且**不保证跨版本兼容**：

\`\`\`python
import marshal                     # 导入 marshal 模块
b = marshal.dumps({"a": 1, "b": [2, 3]})  # 将 marshal.dumps({"a": 1, "b": [2, 3]}) 赋给 b
obj = marshal.loads(b)             # 将 marshal.loads(b) 赋给 obj
\`\`\`

⚠️ 官方文档明确说：marshal **不保证**不同 Python 版本间兼容，不要拿它做持久化或数据交换。一般你不需要直接用 marshal，了解即可。

---

## 九、json vs pickle 对比

| 特性 | json | pickle |
|------|------|--------|
| 格式 | 文本 | 二进制 |
| 类型 | dict/list/str/num/bool/None | 几乎所有 Python 对象 |
| 自定义对象 | 需手动转 | 自动 |
| 安全 | 安全（纯数据） | 危险（可执行代码） |
| 跨语言 | 是（JS/Go/Java 都支持） | 否（仅 Python） |
| 可读性 | 好 | 差（二进制） |
| 体积 | 较大 | 较小 |

选择：
- 跨语言、对外、不可信来源 → **JSON**
- Python 内部、可信、要存复杂对象 → **pickle**
- 持久化键值对 → **shelve**

---

## 十、copyreg：注册构造器

\`copyreg\` 让你为类的 pickle 行为注册一个「构造器」，影响 \`pickle.dumps\` 如何序列化该类。常用于「让旧版本代码能读新数据」或「全局调整某类的序列化」：

\`\`\`python
import pickle                      # 导入 pickle 模块
import copyreg                     # 导入 copyreg 模块

class Point:                       # 定义类 Point
    def __init__(self, x, y):      # 定义函数 __init__，参数：self, x, y
        self.x = x
        self.y = y

def pickle_point(p):               # 定义函数 pickle_point，参数：p
    return Point, (p.x, p.y)   # 返回 (构造函数, 参数元组)

copyreg.pickle(Point, pickle_point)  # 对 copyreg 调用 pickle 方法，参数 Point, pickle_point

p = Point(1, 2)                    # 将 Point(1, 2) 赋给 p
b = pickle.dumps(p)                # 将 pickle.dumps(p) 赋给 b
p2 = pickle.loads(b)               # 将 pickle.loads(b) 赋给 p2
print(p2.x, p2.y)  # 1 2
\`\`\`

\`copyreg.pickle(cls, func)\` 等价于给类实现 \`__reduce__\`，但全局生效、不用改类源码。在「类的 \`\`__init__\`\` 签名变了，但要兼容旧 pickle」时有用。

---

## 十一、序列化函数与闭包的限制

pickle 能序列化**模块顶层定义的函数**（存模块名 + 函数名），但不能序列化：

- 闭包（捕获了局部变量的内层函数）
- lambda（在 3.x 可序列化顶层 lambda，但有限制）
- 生成器、协程
- 内置/C 实现的函数（部分可）

\`\`\`python
import pickle                      # 导入 pickle 模块

def top_func(x):       # 顶层函数，可序列化
    return x * 2                   # 返回 x * 2

print(pickle.loads(pickle.dumps(top_func))(5))  # 10

# 闭包：不可序列化
def make_adder(n):                 # 定义函数 make_adder，参数：n
    def adder(x):                  # 定义函数 adder，参数：x
        return x + n               # 返回 x + n
    return adder                   # 返回 adder

adder = make_adder(10)             # 将 make_adder(10) 赋给 adder
# pickle.dumps(adder)  # PicklingError
\`\`\`

如果要把「带状态的函数」序列化，通常改成「可序列化的对象 + \`__call__\`」。

---

## 十二、dataclass 与 pickle

\`dataclass\` 定义的类默认支持 pickle（和普通类一样），但要注意 \`field(default_factory=...)\` 等会在反序列化时正确重建：

\`\`\`python
from dataclasses import dataclass, field  # 从 dataclasses 导入 dataclass, field
import pickle                      # 导入 pickle 模块

@dataclass
class Config:                      # 定义类 Config
    name: str
    tags: list = field(default_factory=list)

c = Config("app", ["a", "b"])      # 将 Config("app", ["a", "b"]) 赋给 c
c2 = pickle.loads(pickle.dumps(c)) # 将 pickle.loads(pickle.dumps(c)) 赋给 c2
print(c2)  # Config(name='app', tags=['a', 'b'])
\`\`\`

如果 dataclass 用了 \`slots=True\`（3.10+），pickle 仍可工作（3.11+ 完善了 slots 类的 pickle 支持）。

---

## 十三、版本兼容性策略

代码会演进，类的字段会增删。要兼容旧 pickle 数据：

1. **新增字段**：在 \`__setstate__\` 里给新字段默认值
2. **删除字段**：\`__setstate__\` 忽略多余键
3. **重命名字段**：\`__setstate__\` 做迁移

\`\`\`python
class User:                        # 定义类 User
    def __setstate__(self, state): # 定义函数 __setstate__，参数：self, state
        # 兼容旧数据：旧版本叫 fullname，新版本叫 name
        if "fullname" in state and "name" not in state:  # 如果 "fullname" in state and "name" not in state 成立
            state["name"] = state.pop("fullname")
        # 新增字段给默认值
        state.setdefault("version", 1)  # 对 state 调用 设置默认值 方法，参数 "version", 1
        self.__dict__.update(state)
\`\`\`

---

## 十四、实战：对象持久化与磁盘缓存

下面是一个「计算结果缓存到磁盘」的实用模式：

\`\`\`python
import pickle                      # 导入 pickle 模块
import os                          # 导入 os 模块
from pathlib import Path           # 从 pathlib 导入 Path

class DiskCache:                   # 定义类 DiskCache
    def __init__(self, path):      # 定义函数 __init__，参数：self, path
        self.path = Path(path)
    def get(self, key):            # 定义函数 get，参数：self, key
        fp = self.path / (key + ".pkl")  # 将 self.path / (key + ".pkl") 赋给 fp
        if fp.exists():            # 如果 fp.exists() 成立
            with open(fp, "rb") as f:  # 使用上下文管理器 open(fp, "rb")，绑定到 f
                return pickle.load(f)  # 返回 pickle.load(f)
        return None                # 返回 None
    def set(self, key, value):     # 定义函数 set，参数：self, key, value
        self.path.mkdir(parents=True, exist_ok=True)
        fp = self.path / (key + ".pkl")  # 将 self.path / (key + ".pkl") 赋给 fp
        with open(fp, "wb") as f:  # 使用上下文管理器 open(fp, "wb")，绑定到 f
            pickle.dump(value, f, protocol=pickle.HIGHEST_PROTOCOL)  # 对 pickle 调用 dump 方法，参数 value, f, protocol=pickle.HIGHEST_PROTOCOL

cache = DiskCache(".cache")        # 将 DiskCache(".cache") 赋给 cache
# cache.set("result", {"data": [1, 2, 3]})
# print(cache.get("result"))
\`\`\`

这个模式在机器学习（缓存预处理结果）、爬虫（缓存页面）、计算密集任务里很常见。

---

## 十五、本章小结

- **pickle**：\`dumps/loads\` 处理字节，\`dump/load\` 处理文件（二进制模式）；能序列化几乎任何 Python 对象
- **协议版本**：\`HIGHEST_PROTOCOL\` 最紧凑，跨版本要降级
- **自定义对象**：默认存 \`__dict__\`，用 \`__getstate__/__setstate__\` 控制存什么
- **安全红线**：**绝不反序列化不可信数据**，pickle 可执行任意代码
- **shelve**：pickle 封装的磁盘字典，注意 writeback 和写回问题
- **marshal**：内部用，不保证兼容，别用于持久化
- **json vs pickle**：对外用 json，内部存复杂对象用 pickle
- **copyreg**：全局注册构造器，兼容旧数据
- **版本兼容**：用 \`__setstate__\` 做字段迁移

pickle 是 Python 「对象持久化」的瑞士军刀，但务必记住它的安全边界——它属于「自己人之间」的工具，不是对外数据交换的格式。

下一章我们学习配置文件与命令行参数，让程序能灵活接受用户配置。
`,
    code: `# ============================================================
# 第五章演示代码：序列化与反序列化
# 使用 io.BytesIO / tempfile 避免真写磁盘
# ============================================================

import pickle
import io
import os
import tempfile
import marshal
import copyreg
from dataclasses import dataclass, field
from pathlib import Path

# ------------------------------------------------------------
# 1. pickle dumps / loads
# ------------------------------------------------------------
print("=" * 60)
print("1. pickle dumps / loads")
print("=" * 60)

data = {"name": "tom", "scores": [90, 85], "vip": True, "note": None}
b = pickle.dumps(data)
print("类型:", type(b).__name__)
print("字节长度:", len(b))

obj = pickle.loads(b)
print("还原:", obj)
print("值相等:", obj == data)
print("同一对象:", obj is data)


# ------------------------------------------------------------
# 2. dump / load 文件（用 BytesIO）
# ------------------------------------------------------------
print()
print("=" * 60)
print("2. dump / load 文件")
print("=" * 60)

buf = io.BytesIO()
pickle.dump({"name": "tom", "age": 18}, buf)
buf.seek(0)
loaded = pickle.load(buf)
print("从 BytesIO 读取:", loaded)


# ------------------------------------------------------------
# 3. 一个文件存多个对象
# ------------------------------------------------------------
print()
print("=" * 60)
print("3. 流式存多个对象")
print("=" * 60)

buf3 = io.BytesIO()
pickle.dump({"a": 1}, buf3)
pickle.dump({"b": 2}, buf3)
pickle.dump({"c": 3}, buf3)

buf3.seek(0)
results = []
while True:
    try:
        results.append(pickle.load(buf3))
    except EOFError:
        break
print("读出:", results)


# ------------------------------------------------------------
# 4. 协议版本
# ------------------------------------------------------------
print()
print("=" * 60)
print("4. 协议版本")
print("=" * 60)

print("HIGHEST_PROTOCOL:", pickle.HIGHEST_PROTOCOL)
print("DEFAULT_PROTOCOL:", pickle.DEFAULT_PROTOCOL)

for proto in range(pickle.HIGHEST_PROTOCOL + 1):
    size = len(pickle.dumps(data, protocol=proto))
    print("  协议 %d -> %d 字节" % (proto, size))


# ------------------------------------------------------------
# 5. 序列化自定义对象
# ------------------------------------------------------------
print()
print("=" * 60)
print("5. 序列化自定义对象")
print("=" * 60)

class User:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    def __repr__(self):
        return "User(%s, %d)" % (self.name, self.age)

u = User("tom", 18)
b5 = pickle.dumps(u)
u2 = pickle.loads(b5)
print("还原:", u2)
print("类型:", type(u2).__name__)
print("属性:", u2.name, u2.age)


# ------------------------------------------------------------
# 6. __getstate__ / __setstate__ 过滤敏感字段
# ------------------------------------------------------------
print()
print("=" * 60)
print("6. 过滤敏感字段")
print("=" * 60)

class Session:
    def __init__(self, user, password):
        self.user = user
        self.password = password
    def __getstate__(self):
        state = self.__dict__.copy()
        del state["password"]
        return state
    def __setstate__(self, state):
        self.__dict__.update(state)
        self.password = None

s = Session("tom", "secret123")
b6 = pickle.dumps(s)
s2 = pickle.loads(b6)
print("user:", s2.user)
print("password:", s2.password)


# ------------------------------------------------------------
# 7. 处理不可序列化属性
# ------------------------------------------------------------
print()
print("=" * 60)
print("7. 不可序列化属性")
print("=" * 60)

class Worker:
    def __init__(self, name):
        self.name = name
        self.cache = dict()
        self.conn = "模拟连接对象"
    def __getstate__(self):
        state = self.__dict__.copy()
        state["conn"] = None
        return state
    def __setstate__(self, state):
        self.__dict__.update(state)
        self.conn = self._connect()
    def _connect(self):
        return "重建的连接对象"
    def __repr__(self):
        return "Worker(name=%s, conn=%s)" % (self.name, self.conn)

w = Worker("w1")
bw = pickle.dumps(w)
w2 = pickle.loads(bw)
print("还原:", w2)
print("conn 已重建:", w2.conn)


# ------------------------------------------------------------
# 8. 安全演示：__reduce__
# ------------------------------------------------------------
print()
print("=" * 60)
print("8. 安全演示：__reduce__")
print("=" * 60)

class Exploit:
    def __reduce__(self):
        return (print, ("__reduce__ 触发的调用",))

bad = pickle.dumps(Exploit())
print("反序列化时执行:")
pickle.loads(bad)
print("说明: 恶意 pickle 可调用任意函数，绝不要 load 不可信数据")


# ------------------------------------------------------------
# 9. shelve 持久化字典（用 tempfile）
# ------------------------------------------------------------
print()
print("=" * 60)
print("9. shelve 持久化字典")
print("=" * 60)

import shelve

tmpdir = tempfile.mkdtemp(prefix="shelve_")
dbpath = str(Path(tmpdir) / "mydb")

with shelve.open(dbpath) as db:
    db["user1"] = {"name": "tom", "age": 18}
    db["user2"] = {"name": "jerry", "age": 20}
    print("user1:", db["user1"])
    print("包含 user1:", "user1" in db)
    print("keys:", list(db.keys()))

    # writeback=False 时改可变对象不生效
    db["user1"]["age"] = 99
    print("直接改后(不生效):", db["user1"]["age"])

    # 正确做法：整体替换
    u = db["user1"]
    u["age"] = 19
    db["user1"] = u
    print("整体替换后:", db["user1"]["age"])

# 重新打开，数据持久化
with shelve.open(dbpath) as db:
    print("重开 user1:", db["user1"])

# writeback 模式
with shelve.open(dbpath, writeback=True) as db:
    db["user2"]["age"] = 25
    print("writeback 改 user2.age:", db["user2"]["age"])

with shelve.open(dbpath) as db:
    print("writeback 持久化:", db["user2"]["age"])


# ------------------------------------------------------------
# 10. marshal 模块
# ------------------------------------------------------------
print()
print("=" * 60)
print("10. marshal")
print("=" * 60)

mb = marshal.dumps({"a": 1, "b": [2, 3], "c": (4, 5)})
print("marshal 字节:", len(mb))
print("还原:", marshal.loads(mb))


# ------------------------------------------------------------
# 11. copyreg 注册构造器
# ------------------------------------------------------------
print()
print("=" * 60)
print("11. copyreg")
print("=" * 60)

class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def __repr__(self):
        return "Point(%d, %d)" % (self.x, self.y)

def pickle_point(p):
    return Point, (p.x, p.y)

copyreg.pickle(Point, pickle_point)

p = Point(1, 2)
bp = pickle.dumps(p)
p2 = pickle.loads(bp)
print("copyreg 还原:", p2)


# ------------------------------------------------------------
# 12. 函数序列化限制
# ------------------------------------------------------------
print()
print("=" * 60)
print("12. 函数序列化限制")
print("=" * 60)

def top_func(x):
    return x * 2

fb = pickle.dumps(top_func)
f2 = pickle.loads(fb)
print("顶层函数:", f2(5))

# 闭包不可序列化
def make_adder(n):
    def adder(x):
        return x + n
    return adder

adder = make_adder(10)
try:
    pickle.dumps(adder)
except (pickle.PicklingError, TypeError, AttributeError) as e:
    print("闭包不可序列化:", type(e).__name__, e)


# ------------------------------------------------------------
# 13. dataclass 与 pickle
# ------------------------------------------------------------
print()
print("=" * 60)
print("13. dataclass 与 pickle")
print("=" * 60)

@dataclass
class Config:
    name: str
    tags: list = field(default_factory=list)

c = Config("app", ["a", "b"])
cb = pickle.dumps(c)
c2 = pickle.loads(cb)
print("dataclass 还原:", c2)
print("值相等:", c == c2)


# ------------------------------------------------------------
# 14. 版本兼容性
# ------------------------------------------------------------
print()
print("=" * 60)
print("14. 版本兼容性")
print("=" * 60)

class UserV2:
    def __init__(self, name="x"):
        self.name = name
        self.version = 2
    def __setstate__(self, state):
        if "fullname" in state and "name" not in state:
            state["name"] = state.pop("fullname")
        state.setdefault("version", 1)
        self.__dict__.update(state)
    def __repr__(self):
        return "UserV2(name=%s, version=%d)" % (self.name, self.version)

# 模拟旧数据：字段叫 fullname，没有 version
old_state = {"fullname": "tom"}

# 顶层函数：pickle 只能序列化顶层函数，不能序列化闭包
def _legacy_recon(state):
    u = UserV2.__new__(UserV2)
    u.__setstate__(state)
    return u

class Legacy:
    def __reduce__(self):
        return (_legacy_recon, (old_state,))

legacy_bytes = pickle.dumps(Legacy())
restored = pickle.loads(legacy_bytes)
print("旧数据迁移:", restored)


# ------------------------------------------------------------
# 15. 综合实战：磁盘缓存
# ------------------------------------------------------------
print()
print("=" * 60)
print("15. 综合实战：磁盘缓存")
print("=" * 60)

class DiskCache:
    def __init__(self, path):
        self.path = Path(path)
    def get(self, key):
        fp = self.path / (key + ".pkl")
        if fp.exists():
            with open(fp, "rb") as f:
                return pickle.load(f)
        return None
    def set(self, key, value):
        self.path.mkdir(parents=True, exist_ok=True)
        fp = self.path / (key + ".pkl")
        with open(fp, "wb") as f:
            pickle.dump(value, f, protocol=pickle.HIGHEST_PROTOCOL)

cache_dir = Path(tmpdir) / "cache"
cache = DiskCache(cache_dir)
cache.set("result", {"data": [1, 2, 3], "user": User("tom", 18)})
print("缓存写入:", cache.get("result") is not None)
got = cache.get("result")
print("缓存读取:", got["data"], got["user"])

# 清理临时目录
import shutil
shutil.rmtree(tmpdir)
print("临时目录已清理")

print()
print("序列化演示全部完成！")
`,
  },
  // =========================================================
  // 第六章：配置文件与命令行参数
  // =========================================================
  {
    id: "py-config-args",
    group: "数据处理与持久化",
    icon: "⚙️",
    title: "配置文件与命令行参数",
    content: `# 配置文件与命令行参数

程序要灵活，就得让用户能「不改代码就改行为」。常见的配置方式有四种：

- **配置文件**：INI / JSON / TOML / YAML，适合复杂、持久的配置
- **环境变量**：\`os.environ\`，适合部署环境相关的少量配置（数据库地址、密钥）
- **命令行参数**：\`argparse\`，适合一次运行时的选项（输入文件、开关）
- **默认值**：代码里硬编码的兜底值

一个好的程序通常**组合使用**：默认值 < 配置文件 < 环境变量 < 命令行参数（后者覆盖前者）。本章讲清楚每种方式，最后给出一个实用的 CLI 工具示例。

---

## 一、configparser：INI 配置文件

INI 是最经典的配置格式，用 \`[节]\` 分组，\`键 = 值\` 配置。Python 标准库 \`configparser\` 读写它。

### 1.1 INI 长什么样

\`\`\`ini
[database]
host = localhost
port = 5432
debug = true

[app]
name = myapp
max_connections = 10
\`\`\`

### 1.2 读取

\`\`\`python
import configparser                # 导入 configparser 模块

cfg = configparser.ConfigParser()  # 将 configparser.ConfigParser() 赋给 cfg
cfg.read("config.ini")             # 对 cfg 调用 read 方法，参数 "config.ini"

# 按 节.键 取值
host = cfg["database"]["host"]     # 将 cfg["database"]["host"] 赋给 host
port = cfg.getint("database", "port")      # 转整数
debug = cfg.getboolean("database", "debug") # 转 bool

print(host, port, debug)           # 输出 host, port, debug
\`\`\`

\`cfg["节"]["键"]\` 返回的是**字符串**，要数字用 \`getint\`，布尔用 \`getboolean\`（识别 true/false/yes/no/1/0），浮点用 \`getfloat\`。

### 1.3 DEFAULT 节

\`[DEFAULT]\` 节里的键对**所有节**生效，相当于全局默认值：

\`\`\`ini
[DEFAULT]
timeout = 30

[server1]
host = a.com
# server1 自动有 timeout = 30

[server2]
host = b.com
timeout = 60   # 自己覆盖默认值
\`\`\`

\`\`\`python
print(cfg["server1"]["timeout"])  # 30（来自 DEFAULT）
print(cfg["server2"]["timeout"])  # 60（自己覆盖）
\`\`\`

### 1.4 插值（变量替换）

configparser 支持 \`%(键)s\` 引用同节或 DEFAULT 的值：

\`\`\`ini
[DEFAULT]
base = /opt/app

[path]
log = %(base)s/log/app.log
data = %(base)s/data
\`\`\`

\`\`\`python
print(cfg["path"]["log"])  # /opt/app/log/app.log
\`\`\`

### 1.5 写入

\`\`\`python
import configparser                # 导入 configparser 模块

cfg = configparser.ConfigParser()  # 将 configparser.ConfigParser() 赋给 cfg
cfg["database"] = {"host": "localhost", "port": "5432"}
cfg["app"] = {"name": "demo"}

with open("config.ini", "w", encoding="utf-8") as f:  # 使用上下文管理器 open("config.ini", "w", encoding="utf-8")，绑定到 f
    cfg.write(f)                   # 对 cfg 调用 write 方法，参数 f
\`\`\`

### 1.6 注意事项

- INI 的值**都是字符串**，取出来要自己转类型
- 节名、键名不区分大小写（默认），值区分
- 注释用 \`#\` 或 \`;\`
- INI 不支持嵌套结构（节只有一层），复杂配置考虑 TOML/JSON

---

## 二、JSON 配置文件

JSON 也能做配置，优点是支持嵌套、类型丰富，缺点是不支持注释（人写不方便）：

\`\`\`python
import json                        # 导入 json 模块

# 读取
with open("config.json", encoding="utf-8") as f:  # 使用上下文管理器 open("config.json", encoding="utf-8")，绑定到 f
    cfg = json.load(f)             # 将 json.load(f) 赋给 cfg
print(cfg["database"]["host"])     # 输出 cfg["database"]["host"]

# 写入
cfg = {"database": {"host": "localhost", "port": 5432}}  # 创建字典并赋给 cfg
with open("config.json", "w", encoding="utf-8") as f:  # 使用上下文管理器 open("config.json", "w", encoding="utf-8")，绑定到 f
    json.dump(cfg, f, ensure_ascii=False, indent=2)  # 对 json 调用 dump 方法，参数 cfg, f, ensure_ascii=False, indent=2
\`\`\`

JSON 配置适合「程序生成、程序读取」的场景；要给人手写，TOML 和 YAML 更友好。

---

## 三、TOML 配置（3.11+）

TOML 是 Python 官方推荐的配置格式（\`pyproject.toml\` 就是它）。3.11+ 内置 \`tomllib\` 只读：

\`\`\`toml
title = "我的项目"

[database]
host = "localhost"
port = 5432
debug = true
tags = ["prod", "cache"]

[server]
host = "0.0.0.0"
\`\`\`

\`\`\`python
import tomllib                     # 导入 tomllib 模块
with open("config.toml", "rb") as f:   # 必须二进制模式
    cfg = tomllib.load(f)          # 将 tomllib.load(f) 赋给 cfg
print(cfg["database"]["port"])   # 5432（int）
print(cfg["database"]["tags"])   # ['prod', 'cache']
\`\`\`

TOML 的优势：有类型（int/float/bool/数组/日期）、支持注释、语法明确。写 TOML 用第三方 \`tomli-w\` 或 \`tomlkit\`。

---

## 四、环境变量

环境变量是「部署相关」配置的最佳实践——不同环境（开发/测试/生产）用不同环境变量，代码不用改。

### 4.1 读取

\`\`\`python
import os                          # 导入 os 模块

# 方式一：os.environ（字典）
host = os.environ.get("DB_HOST", "localhost")  # 带默认值
# os.environ["DB_HOST"]  # 不存在会 KeyError

# 方式二：os.getenv（等价于 environ.get）
port = os.getenv("DB_PORT", "5432")  # 将 os.getenv("DB_PORT", "5432") 赋给 port
\`\`\`

\`os.getenv\` 和 \`os.environ.get\` 等价，都返回字符串（环境变量永远是字符串），要数字自己转 \`int(os.getenv("PORT", "5432"))\`。

### 4.2 设置

\`\`\`python
import os                          # 导入 os 模块
os.environ["MY_VAR"] = "value"  # 当前进程及子进程可见
\`\`\`

在命令行设置（仅本次运行）：

\`\`\`bash
DB_HOST=prod.db.com python app.py
\`\`\`

### 4.3 .env 文件

很多项目用 \`.env\` 文件存环境变量，配合 \`python-dotenv\` 第三方库加载：

\`\`\`python
# 需要 pip install python-dotenv
# from dotenv import load_dotenv
# load_dotenv()
# import os
# print(os.getenv("DB_HOST"))
\`\`\`

⚠️ \`.env\` 文件含密钥，**必须加入 .gitignore**，不要提交到版本库。

### 4.4 配置优先级

典型优先级（高覆盖低）：
1. 命令行参数
2. 环境变量
3. 配置文件
4. 代码默认值

\`\`\`python
import os                          # 导入 os 模块

def get_port(cli_port=None):       # 定义函数 get_port，参数：cli_port=None
    if cli_port is not None:       # 如果 cli_port is not None 成立
        return cli_port           # 命令行最高
    if os.getenv("APP_PORT"):      # 如果 os.getenv("APP_PORT") 成立
        return int(os.getenv("APP_PORT"))  # 环境变量
    return 8080                   # 默认值
\`\`\`

---

## 五、argparse：命令行参数解析

\`argparse\` 是标准库的命令行解析器，能处理位置参数、可选参数、子命令，自动生成帮助。

### 5.1 最简单的例子

\`\`\`python
import argparse                    # 导入 argparse 模块

parser = argparse.ArgumentParser(description="示例程序")  # 将 argparse.ArgumentParser(description="示例程序") 赋给 parser
parser.add_argument("name", help="用户名")           # 位置参数
parser.add_argument("-a", "--age", type=int, default=18, help="年龄")  # 可选参数

args = parser.parse_args()         # 将 parser.parse_args() 赋给 args
print(args.name, args.age)         # 输出 args.name, args.age
\`\`\`

运行：
\`\`\`bash
python app.py tom --age 20
# args.name = "tom", args.age = 20
python app.py tom
# args.name = "tom", args.age = 18（默认值）
\`\`\`

### 5.2 位置参数 vs 可选参数

- **位置参数**：不带 \`-\` 前缀，必填，按顺序。存为 \`args.名字\`
- **可选参数**：带 \`-\`（短）或 \`--\`（长），可省略（有 default）。存为 \`args.长名\`（去掉 \`--\`）

\`\`\`python
parser.add_argument("input")              # 位置，args.input
parser.add_argument("-o", "--output")     # 可选，args.output
parser.add_argument("-v", "--verbose", action="store_true")  # 开关，args.verbose
\`\`\`

### 5.3 type 类型转换

\`type=\` 指定参数类型，argparse 会自动转换并在转换失败时报错：

\`\`\`python
parser.add_argument("--port", type=int)  # 对 parser 调用 add_argument 方法，参数 "--port", type=int
parser.add_argument("--ratio", type=float)  # 对 parser 调用 add_argument 方法，参数 "--ratio", type=float
parser.add_argument("--input", type=argparse.FileType("r"))  # 直接打开文件
\`\`\`

### 5.4 choices 限制取值

\`\`\`python
parser.add_argument("--mode", choices=["dev", "test", "prod"], default="dev")  # 对 parser 调用 add_argument 方法，参数 "--mode", choices=["dev", "test", "prod"], default="dev"
\`\`\`

传入不在 choices 里的值会报错。

### 5.5 nargs 数量

\`\`\`python
parser.add_argument("files", nargs="+")    # 至少一个，存为列表
parser.add_argument("--tags", nargs="*")   # 零或多个
parser.add_argument("--opt", nargs="?")    # 零或一个
parser.add_argument("--pair", nargs=2)     # 恰好两个
\`\`\`

| nargs | 含义 | 结果 |
|-------|------|------|
| \`N\` | 恰好 N 个 | 列表 |
| \`?\` | 零或一个 | 单值或 default |
| \`*\` | 零或多个 | 列表 |
| \`+\` | 一个或多个 | 列表 |

### 5.6 action 动作

\`\`\`python
parser.add_argument("-v", action="store_true")   # 出现则 True
parser.add_argument("-c", action="count")        # 出现次数 -ccc -> 3
parser.add_argument("--list", action="append")   # 多次出现累加成列表
parser.add_argument("--mode", action="store", default="x")  # 默认动作
\`\`\`

### 5.7 子命令

像 \`git add\`、\`git commit\` 这种「主命令 + 子命令」结构，用 \`add_subparsers\`：

\`\`\`python
parser = argparse.ArgumentParser(prog="mytool")  # 将 argparse.ArgumentParser(prog="mytool") 赋给 parser
sub = parser.add_subparsers(dest="cmd", required=True)  # 将 parser.add_subparsers(dest="cmd", required=True) 赋给 sub

p_add = sub.add_parser("add", help="添加")  # 将 sub.add_parser("add", help="添加") 赋给 p_add
p_add.add_argument("name")         # 对 p_add 调用 add_argument 方法，参数 "name"

p_del = sub.add_parser("delete", help="删除")  # 将 sub.add_parser("delete", help="删除") 赋给 p_del
p_del.add_argument("name")         # 对 p_del 调用 add_argument 方法，参数 "name"

args = parser.parse_args()         # 将 parser.parse_args() 赋给 args
if args.cmd == "add":              # 如果 args.cmd == "add" 成立
    print("添加", args.name)         # 输出 "添加", args.name
elif args.cmd == "delete":         # 否则如果 args.cmd == "delete" 成立
    print("删除", args.name)         # 输出 "删除", args.name
\`\`\`

### 5.8 互斥参数

\`add_mutually_exclusive_group\` 让一组参数只能出现一个：

\`\`\`python
group = parser.add_mutually_exclusive_group()  # 将 parser.add_mutually_exclusive_group() 赋给 group
group.add_argument("--verbose", action="store_true")  # 对 group 调用 add_argument 方法，参数 "--verbose", action="store_true"
group.add_argument("--quiet", action="store_true")  # 对 group 调用 add_argument 方法，参数 "--quiet", action="store_true"
# --verbose 和 --quiet 不能同时给
\`\`\`

### 5.9 参数分组

\`add_argument_group\` 把参数分到不同组，帮助信息更清晰：

\`\`\`python
g = parser.add_argument_group("数据库选项")  # 将 parser.add_argument_group("数据库选项") 赋给 g
g.add_argument("--db-host")        # 对 g 调用 add_argument 方法，参数 "--db-host"
g.add_argument("--db-port", type=int)  # 对 g 调用 add_argument 方法，参数 "--db-port", type=int
\`\`\`

---

## 六、argparse 解析原理

1. \`ArgumentParser()\` 创建解析器
2. \`add_argument\` 注册参数规则
3. \`parse_args()\` 读取 \`sys.argv[1:]\`，按规则匹配、转换、校验
4. 返回 \`Namespace\` 对象，属性即参数名

\`parse_args()\` 默认读 \`sys.argv\`，也可传列表测试：\`parser.parse_args(["tom", "--age", "20"])\`。

出错时（缺参数、类型错、choices 不符）argparse 会**打印帮助并 sys.exit(2)**，不用你自己处理。

\`parser.parse_known_args()\` 允许有未知参数（返回 (args, unknown_list)），适合「父解析器 + 子解析器组合」场景。

---

## 七、实际 CLI 工具示例

下面是一个整合配置文件 + 环境变量 + 命令行参数的完整示例：

\`\`\`python
import argparse                    # 导入 argparse 模块
import configparser                # 导入 configparser 模块
import os                          # 导入 os 模块

def load_config():                 # 定义函数 load_config，无参数
    # 1. 默认值
    cfg = {"host": "localhost", "port": 8080, "debug": False}  # 创建字典并赋给 cfg
    # 2. 配置文件覆盖
    cp = configparser.ConfigParser()  # 将 configparser.ConfigParser() 赋给 cp
    cp.read("app.ini")             # 对 cp 调用 read 方法，参数 "app.ini"
    if "server" in cp:             # 如果 "server" in cp 成立
        cfg["host"] = cp["server"].get("host", cfg["host"])
        cfg["port"] = cp["server"].getint("port", cfg["port"])
    # 3. 环境变量覆盖
    cfg["host"] = os.getenv("APP_HOST", cfg["host"])
    cfg["port"] = int(os.getenv("APP_PORT", cfg["port"]))
    return cfg                     # 返回 cfg

def main():                        # 定义函数 main，无参数
    base = load_config()           # 将 load_config() 赋给 base
    parser = argparse.ArgumentParser(description="我的应用")  # 将 argparse.ArgumentParser(description="我的应用") 赋给 parser
    parser.add_argument("--host", default=base["host"])  # 对 parser 调用 add_argument 方法，参数 "--host", default=base["host"]
    parser.add_argument("--port", type=int, default=base["port"])  # 对 parser 调用 add_argument 方法，参数 "--port", type=int, default=base["port"]
    parser.add_argument("--debug", action="store_true", default=base["debug"])  # 对 parser 调用 add_argument 方法，参数 "--debug", action="store_true", default=base["debug"]
    args = parser.parse_args()     # 将 parser.parse_args() 赋给 args
    print("最终配置:", args.host, args.port, args.debug)  # 输出 "最终配置:", args.host, args.port, args.debug

if __name__ == "__main__":         # 如果 __name__ == "__main__" 成立
    main()                         # 调用 main
\`\`\`

这个结构实现了「默认值 → 配置文件 → 环境变量 → 命令行」的优先级覆盖。

---

## 八、日志配置

配置好之后，程序通常要记日志。标准库 \`logging\` 是基础。

### 8.1 basicConfig 快速配置

\`\`\`python
import logging                     # 导入 logging 模块
logging.basicConfig(
    level=logging.INFO,            # 将 logging.INFO, 赋给 level
    format="%(asctime)s [%(levelname)s] %(message)s",  # 将字符串 "%(asctime)s [%(levelname)s] %(message)s", 赋给 format
    datefmt="%Y-%m-%d %H:%M:%S"    # 将字符串 "%Y-%m-%d %H:%M:%S" 赋给 datefmt
)
logging.info("启动")                 # 对 logging 调用 info 方法，参数 "启动"
logging.warning("警告")              # 对 logging 调用 warning 方法，参数 "警告"
\`\`\`

### 8.2 getLogger / handler / formatter

复杂场景用「日志器 → 处理器 → 格式器」三层结构：

\`\`\`python
import logging                     # 导入 logging 模块

logger = logging.getLogger("myapp")  # 将 logging.getLogger("myapp") 赋给 logger
logger.setLevel(logging.DEBUG)     # 对 logger 调用 setLevel 方法，参数 logging.DEBUG

# 控制台 handler
ch = logging.StreamHandler()       # 将 logging.StreamHandler() 赋给 ch
ch.setLevel(logging.INFO)          # 对 ch 调用 setLevel 方法，参数 logging.INFO

# 文件 handler
fh = logging.FileHandler("app.log", encoding="utf-8")  # 将 logging.FileHandler("app.log", encoding="utf-8") 赋给 fh
fh.setLevel(logging.DEBUG)         # 对 fh 调用 setLevel 方法，参数 logging.DEBUG

# 格式
fmt = logging.Formatter("%(asctime)s [%(name)s] %(levelname)s: %(message)s")  # 将 logging.Formatter("%(asctime)s [%(name)s] %(levelname)s: %(message)s") 赋给 fmt
ch.setFormatter(fmt)               # 对 ch 调用 setFormatter 方法，参数 fmt
fh.setFormatter(fmt)               # 对 fh 调用 setFormatter 方法，参数 fmt

logger.addHandler(ch)              # 对 logger 调用 addHandler 方法，参数 ch
logger.addHandler(fh)              # 对 logger 调用 addHandler 方法，参数 fh

logger.info("信息")                  # 对 logger 调用 info 方法，参数 "信息"
logger.debug("调试")  # 控制台不显示（INFO 以上），文件显示
\`\`\`

日志级别从低到高：\`DEBUG < INFO < WARNING < ERROR < CRITICAL\`。设了某个级别，低于它的不输出。

### 8.3 配置文件驱动日志

\`logging.config.fileConfig\` 能从 INI 文件读日志配置，把日志配置和代码分离：

\`\`\`ini
[loggers]
keys=root

[handlers]
keys=console

[formatters]
keys=simple

[logger_root]
level=INFO
handlers=console

[handler_console]
class=StreamHandler
level=INFO
formatter=simple
args=(sys.stdout,)

[formatter_simple]
format=%(asctime)s %(levelname)s %(message)s
\`\`\`

\`\`\`python
# import logging.config
# logging.config.fileConfig("logging.ini")
\`\`\`

---

## 九、配置方式选择建议

| 场景 | 推荐方式 |
|------|----------|
| 部署环境差异（DB/密钥） | 环境变量 |
| 用户可调的运行选项 | 命令行参数 |
| 复杂、持久的配置 | TOML（3.11+）或 INI |
| 结构化、程序生成 | JSON |
| 日志配置 | INI 文件 或 代码配置 |

原则：
- **密钥用环境变量**，绝不写进配置文件提交
- **命令行参数**适合「这次运行」的临时选项
- **配置文件**适合「长期、不常改」的设置
- 提供**合理默认值**，让程序不配也能跑

---

## 十、本章小结

- **configparser**：读 INI，\`[节]/键\` 结构，值都是字符串要转类型，DEFAULT 节做全局默认，支持 \`%()\` 插值
- **JSON/TOML**：JSON 适合程序生成；TOML（3.11+ \`tomllib\` 只读，二进制打开）适合人写配置
- **环境变量**：\`os.environ.get\` / \`os.getenv\`，部署差异配置首选，永远是字符串
- **argparse**：\`add_argument\` 注册参数，\`type/choices/default/nargs/action\` 控制行为，子命令用 \`add_subparsers\`，互斥用 \`add_mutually_exclusive_group\`
- **优先级**：命令行 > 环境变量 > 配置文件 > 默认值
- **logging**：\`basicConfig\` 快速配置，\`getLogger/handler/formatter\` 三层结构，级别 \`DEBUG<INFO<WARNING<ERROR<CRITICAL\`

配置与参数是程序和用户「对话」的接口。设计得好，程序既灵活又易用；设计得差，用户每次运行都要翻文档。掌握本章，你就能写出专业级的命令行工具。

至此，「数据处理与持久化」这一组六章全部完成。从正则表达式到数据格式、数据库、文件系统、序列化、配置参数，你已具备用 Python 处理各种数据持久化与交换任务的能力。
`,
    code: `# ============================================================
# 第六章演示代码：配置文件与命令行参数
# 使用 io.StringIO / tempfile 避免污染真实文件系统
# ============================================================

import configparser
import json
import io
import os
import tempfile
import argparse
import logging
import tomllib
from pathlib import Path

# ------------------------------------------------------------
# 1. configparser 读取 INI
# ------------------------------------------------------------
print("=" * 60)
print("1. configparser 读取 INI")
print("=" * 60)

ini_text = """
[DEFAULT]
timeout = 30

[database]
host = localhost
port = 5432
debug = true

[app]
name = myapp
max_conn = 10
"""

cfg = configparser.ConfigParser()
cfg.read_string(ini_text)

print("host:", cfg["database"]["host"])
print("port:", cfg.getint("database", "port"))
print("debug:", cfg.getboolean("database", "debug"))
print("max_conn:", cfg.getint("app", "max_conn"))
print("DEFAULT timeout:", cfg["app"]["timeout"])  # 30 来自 DEFAULT


# ------------------------------------------------------------
# 2. DEFAULT 节与覆盖
# ------------------------------------------------------------
print()
print("=" * 60)
print("2. DEFAULT 节与覆盖")
print("=" * 60)

ini2 = """
[DEFAULT]
timeout = 30

[server1]
host = a.com

[server2]
host = b.com
timeout = 60
"""
cfg2 = configparser.ConfigParser()
cfg2.read_string(ini2)
print("server1 timeout:", cfg2["server1"]["timeout"])  # 30
print("server2 timeout:", cfg2["server2"]["timeout"])  # 60


# ------------------------------------------------------------
# 3. 插值（变量替换）
# ------------------------------------------------------------
print()
print("=" * 60)
print("3. 插值")
print("=" * 60)

ini3 = """
[DEFAULT]
base = /opt/app

[path]
log = %(base)s/log/app.log
data = %(base)s/data
"""
cfg3 = configparser.ConfigParser()
cfg3.read_string(ini3)
print("log:", cfg3["path"]["log"])
print("data:", cfg3["path"]["data"])


# ------------------------------------------------------------
# 4. configparser 写入
# ------------------------------------------------------------
print()
print("=" * 60)
print("4. configparser 写入")
print("=" * 60)

cfg4 = configparser.ConfigParser()
cfg4["database"] = {"host": "localhost", "port": "5432"}
cfg4["app"] = {"name": "demo", "debug": "false"}

buf4 = io.StringIO()
cfg4.write(buf4)
print("写入的 INI:")
print(buf4.getvalue(), end="")

# 读回验证
buf4.seek(0)
cfg4b = configparser.ConfigParser()
cfg4b.read_file(buf4)
print("读回 host:", cfg4b["database"]["host"])


# ------------------------------------------------------------
# 5. JSON 配置
# ------------------------------------------------------------
print()
print("=" * 60)
print("5. JSON 配置")
print("=" * 60)

json_cfg = {"database": {"host": "localhost", "port": 5432}, "app": {"name": "demo"}}
buf5 = io.StringIO()
json.dump(json_cfg, buf5, ensure_ascii=False, indent=2)
print("写入的 JSON:")
print(buf5.getvalue())

buf5.seek(0)
loaded5 = json.load(buf5)
print("读回 port:", loaded5["database"]["port"])


# ------------------------------------------------------------
# 6. TOML 配置（3.11+）
# ------------------------------------------------------------
print()
print("=" * 60)
print("6. TOML 配置")
print("=" * 60)

toml_text = '''
title = "我的项目"
version = "1.0.0"

[database]
host = "localhost"
port = 5432
debug = true
tags = ["prod", "cache"]

[[users]]
name = "tom"
age = 18
'''
config6 = tomllib.loads(toml_text)
print("title:", config6["title"])
print("db host:", config6["database"]["host"])
print("db port:", config6["database"]["port"], type(config6["database"]["port"]).__name__)
print("db tags:", config6["database"]["tags"])
print("users:", config6["users"])


# ------------------------------------------------------------
# 7. 环境变量
# ------------------------------------------------------------
print()
print("=" * 60)
print("7. 环境变量")
print("=" * 60)

os.environ["PYDEMO_KEY"] = "abc123"
print("getenv:", os.getenv("PYDEMO_KEY"))
print("getenv 默认:", os.getenv("NOT_EXIST", "默认值"))
print("environ.get:", os.environ.get("PYDEMO_KEY"))

# 优先级演示
def get_port(cli_port=None):
    if cli_port is not None:
        return cli_port
    if os.getenv("PYDEMO_PORT"):
        return int(os.getenv("PYDEMO_PORT"))
    return 8080

print("默认:", get_port())
os.environ["PYDEMO_PORT"] = "9090"
print("环境变量:", get_port())
print("命令行:", get_port(7070))


# ------------------------------------------------------------
# 8. argparse 基础
# ------------------------------------------------------------
print()
print("=" * 60)
print("8. argparse 基础")
print("=" * 60)

parser = argparse.ArgumentParser(description="示例程序")
parser.add_argument("name", help="用户名")
parser.add_argument("-a", "--age", type=int, default=18, help="年龄")
parser.add_argument("--mode", choices=["dev", "test", "prod"], default="dev")

args = parser.parse_args(["tom", "--age", "20", "--mode", "prod"])
print("name:", args.name)
print("age:", args.age)
print("mode:", args.mode)


# ------------------------------------------------------------
# 9. argparse nargs / action
# ------------------------------------------------------------
print()
print("=" * 60)
print("9. argparse nargs / action")
print("=" * 60)

p9 = argparse.ArgumentParser()
p9.add_argument("files", nargs="+")
p9.add_argument("--tags", nargs="*", default=[])
p9.add_argument("-v", action="store_true")
p9.add_argument("-c", action="count", default=0)
p9.add_argument("--item", action="append", default=[])

a9 = p9.parse_args(["a.txt", "b.txt", "-v", "-ccc", "--item", "x", "--item", "y"])
print("files:", a9.files)
print("tags:", a9.tags)
print("verbose:", a9.v)
print("count:", a9.c)
print("item:", a9.item)


# ------------------------------------------------------------
# 10. argparse 子命令
# ------------------------------------------------------------
print()
print("=" * 60)
print("10. argparse 子命令")
print("=" * 60)

p10 = argparse.ArgumentParser(prog="mytool")
sub = p10.add_subparsers(dest="cmd", required=True)

p_add = sub.add_parser("add", help="添加")
p_add.add_argument("name")

p_del = sub.add_parser("delete", help="删除")
p_del.add_argument("name")
p_del.add_argument("-f", "--force", action="store_true")

a10 = p10.parse_args(["add", "tom"])
print("cmd:", a10.cmd, "| name:", a10.name)

a10b = p10.parse_args(["delete", "jerry", "--force"])
print("cmd:", a10b.cmd, "| name:", a10b.name, "| force:", a10b.force)


# ------------------------------------------------------------
# 11. argparse 互斥参数与分组
# ------------------------------------------------------------
print()
print("=" * 60)
print("11. 互斥参数与分组")
print("=" * 60)

p11 = argparse.ArgumentParser()
g = p11.add_argument_group("数据库选项")
g.add_argument("--db-host", default="localhost")
g.add_argument("--db-port", type=int, default=5432)

mx = p11.add_mutually_exclusive_group()
mx.add_argument("--verbose", action="store_true")
mx.add_argument("--quiet", action="store_true")

a11 = p11.parse_args(["--db-host", "1.2.3.4", "--verbose"])
print("db_host:", a11.db_host)
print("db_port:", a11.db_port)
print("verbose:", a11.verbose)


# ------------------------------------------------------------
# 12. parse_known_args 容忍未知参数
# ------------------------------------------------------------
print()
print("=" * 60)
print("12. parse_known_args")
print("=" * 60)

p12 = argparse.ArgumentParser()
p12.add_argument("--known")
a12, unknown = p12.parse_known_args(["--known", "x", "--unknown1", "y", "z"])
print("known:", a12.known)
print("unknown:", unknown)


# ------------------------------------------------------------
# 13. 综合实战：配置优先级整合
# ------------------------------------------------------------
print()
print("=" * 60)
print("13. 综合实战：配置优先级")
print("=" * 60)

tmpdir = tempfile.mkdtemp(prefix="config_")
ini_path = str(Path(tmpdir) / "app.ini")

# 写一个配置文件
with open(ini_path, "w", encoding="utf-8") as f:
    f.write("[server]\\nhost = file.com\\nport = 6000\\n")

def load_config(cli_args):
    # 1. 默认值
    cfg = {"host": "localhost", "port": 8080, "debug": False}
    # 2. 配置文件
    cp = configparser.ConfigParser()
    cp.read(ini_path, encoding="utf-8")
    if "server" in cp:
        cfg["host"] = cp["server"].get("host", cfg["host"])
        cfg["port"] = cp["server"].getint("port", cfg["port"])
    # 3. 环境变量
    cfg["host"] = os.getenv("DEMO_HOST", cfg["host"])
    cfg["port"] = int(os.getenv("DEMO_PORT", cfg["port"]))
    # 4. 命令行
    p = argparse.ArgumentParser()
    p.add_argument("--host", default=cfg["host"])
    p.add_argument("--port", type=int, default=cfg["port"])
    p.add_argument("--debug", action="store_true")
    a = p.parse_args(cli_args)
    return a

print("默认值:", load_config([]))
print("环境变量覆盖:", )
os.environ["DEMO_HOST"] = "env.com"
print("  ", load_config([]))
print("命令行覆盖:", load_config(["--host", "cli.com", "--debug"]))

# 清理环境变量
del os.environ["DEMO_HOST"]


# ------------------------------------------------------------
# 14. logging basicConfig
# ------------------------------------------------------------
print()
print("=" * 60)
print("14. logging basicConfig")
print("=" * 60)

logger14 = logging.getLogger("demo14")
logger14.handlers.clear()
logger14.setLevel(logging.DEBUG)
h14 = logging.StreamHandler(io.StringIO())
h14.setLevel(logging.INFO)
h14.setFormatter(logging.Formatter("[%(levelname)s] %(message)s"))
logger14.addHandler(h14)

logger14.info("信息日志")
logger14.warning("警告日志")
logger14.debug("调试日志(不显示)")

# 取出 StreamHandler 缓存的内容
output14 = h14.stream.getvalue()
print("日志输出:")
print(output14, end="")


# ------------------------------------------------------------
# 15. logging 多 handler（控制台 + 文件）
# ------------------------------------------------------------
print()
print("=" * 60)
print("15. logging 多 handler")
print("=" * 60)

log_file = str(Path(tmpdir) / "app.log")
logger15 = logging.getLogger("demo15")
logger15.handlers.clear()
logger15.setLevel(logging.DEBUG)

# 控制台 handler（用 StringIO 模拟）
ch = logging.StreamHandler(io.StringIO())
ch.setLevel(logging.INFO)
ch.setFormatter(logging.Formatter("%(asctime)s [%(name)s] %(levelname)s: %(message)s",
                                   datefmt="%H:%M:%S"))
logger15.addHandler(ch)

# 文件 handler
fh = logging.FileHandler(log_file, encoding="utf-8")
fh.setLevel(logging.DEBUG)
fh.setFormatter(logging.Formatter("%(asctime)s [%(name)s] %(levelname)s: %(message)s",
                                   datefmt="%H:%M:%S"))
logger15.addHandler(fh)

logger15.info("信息日志")
logger15.debug("调试日志(只在文件)")
logger15.error("错误日志")

print("控制台输出(INFO以上):")
print(ch.stream.getvalue(), end="")

print("文件内容(全部):")
with open(log_file, encoding="utf-8") as f:
    print(f.read(), end="")


# ------------------------------------------------------------
# 16. 清理临时目录
# ------------------------------------------------------------
print()
print("=" * 60)
print("16. 清理")
print("=" * 60)

import shutil
shutil.rmtree(tmpdir)
print("临时目录已清理:", not Path(tmpdir).exists())

print()
print("配置与命令行参数演示全部完成！")
`,
  },
];