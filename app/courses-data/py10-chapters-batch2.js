// =============================================================
// Python 从入门到精通大全（终极版）—— 第2批章节
// 第二部分 数据类型与字符串（共 5 章）
// =============================================================

export const chapters = [
  // -----------------------------------------------------------
  // 第六章：字符串方法大全
  // -----------------------------------------------------------
  {
    id: "py10-ch06",
    group: "第二部分 数据类型与字符串",
    icon: "🔤",
    title: "第六章 字符串方法大全",
    content: `## 字符串方法概览

Python 字符串有 **40+ 个内置方法**，是日常开发最常用的工具之一。本章按用途分类讲透所有方法。

⚠️ **重要前提**：字符串是**不可变**类型。所有"修改"方法都返回**新字符串**，原字符串不变。

\`\`\`python
s = "hello"
new_s = s.upper()    # 返回新字符串 "HELLO"
print(s)             # hello（原字符串没变！）
print(new_s)         # HELLO
\`\`\`

## 查找类方法

### find() / rfind()：查找子串位置

\`\`\`python
s = "hello world, hello python"

# find 返回第一次出现的索引，找不到返回 -1
print(s.find("hello"))       # 0（第一次出现在索引 0）
print(s.find("world"))       # 6
print(s.find("java"))        # -1（找不到）

# 指定查找范围 find(sub, start, end)
print(s.find("hello", 5))    # 13（从索引 5 开始找，找到第二个 hello）

# rfind 从右边开始找
print(s.rfind("hello"))      # 13（最后一次出现的位置）
\`\`\`

### index() / rindex()：和 find 一样但会报错

\`\`\`python
s = "hello world"

# index 找到返回索引
print(s.index("world"))      # 6

# 找不到抛 ValueError（区别于 find 返回 -1）
try:
    s.index("java")
except ValueError as e:
    print(f"找不到: {e}")    # 找不到: substring not found
\`\`\`

**find vs index 怎么选？**
- 不确定子串是否存在 → 用 \`find\`，返回 -1 不报错
- 确定子串一定存在 → 用 \`index\`，让异常帮你"断言"

### count()：统计出现次数

\`\`\`python
s = "hello world, hello python"

# 统计子串出现次数
print(s.count("hello"))      # 2
print(s.count("o"))          # 4
print(s.count("java"))       # 0（不存在返回 0）

# 也可以指定范围
print(s.count("o", 0, 5))    # 1（只看前 5 个字符里的 o）
\`\`\`

## 替换类方法

### replace()：替换子串

\`\`\`python
s = "我喜欢 Java，Java 很好用"

# 替换所有匹配
new_s = s.replace("Java", "Python")
print(new_s)    # 我喜欢 Python，Python 很好用

# 限制替换次数（第三个参数）
s = "a-b-c-d-e"
print(s.replace("-", "/", 2))    # a/b/c-d-e（只替换前 2 个）
\`\`\`

**注意**：replace 返回新字符串，原字符串不变。

\`\`\`python
s = "hello"
s.replace("l", "L")    # 这行没赋值，结果被丢弃
print(s)               # 还是 hello

# 必须接收返回值
s = s.replace("l", "L")
print(s)               # heLLo
\`\`\`

## 分割与拼接

### split() / rsplit()：分割字符串

\`\`\`python
# 默认按任意空白分割（空格、制表符、换行都算，多个连一起算一个）
s = "  hello   world\\tpython  "
print(s.split())        # ['hello', 'world', 'python']（自动去首尾空白）

# 按指定字符分割
s = "apple,banana,cherry"
print(s.split(","))     # ['apple', 'banana', 'cherry']

# 限制分割次数
s = "a-b-c-d-e"
print(s.split("-", 2))    # ['a', 'b', 'c-d-e']（只分割 2 次）

# rsplit 从右边开始
print(s.rsplit("-", 2))   # ['a-b-c', 'd', 'e']
\`\`\`

**为什么默认 split() 比 split(" ") 好？**
\`split(" ")\` 把每个空格当分隔符，连续空格会产生空字符串；\`split()\` 自动处理连续空白，更智能。

\`\`\`python
s = "hello  world"      # 两个空格
print(s.split(" "))     # ['hello', '', 'world']（中间有空字符串）
print(s.split())        # ['hello', 'world']（更干净）
\`\`\`

### splitlines()：按行分割

\`\`\`python
text = "第一行\\n第二行\\n第三行"
print(text.splitlines())         # ['第一行', '第二行', '第三行']

# 保留换行符
print(text.splitlines(keepends=True))    # ['第一行\\n', '第二行\\n', '第三行']

# 兼容不同系统的换行符（\\n \\r\\n \\r）
text = "line1\\r\\nline2\\rline3"
print(text.splitlines())         # ['line1', 'line2', 'line3']
\`\`\`

### partition() / rpartition()：分成三部分

\`\`\`python
# partition 把字符串分成 (前, 分隔符, 后) 三部分
s = "user@example.com"
print(s.partition("@"))    # ('user', '@', 'example.com')

# 分隔符不存在
print("hello".partition("@"))    # ('hello', '', '')（前=整个字符串，中和后为空）

# rpartition 从右边找分隔符
s = "a-b-c"
print(s.partition("-"))    # ('a', '-', 'b-c')
print(s.rpartition("-"))   # ('a-b', '-', 'c')
\`\`\`

**partition 的妙用**：解析"键值对"格式。

\`\`\`python
# 解析 key=value 格式
line = "name=张三"
key, sep, value = line.partition("=")
print(f"键: {key}, 值: {value}")    # 键: name, 值: 张三

# 解析 URL
url = "https://example.com/path"
protocol, sep, rest = url.partition("://")
print(f"协议: {protocol}, 剩余: {rest}")
\`\`\`

### join()：拼接（前面讲过，这里复习）

\`\`\`python
# 把列表拼成字符串
parts = ["2026", "07", "19"]
print("-".join(parts))     # 2026-07-19

# 注意：元素必须是字符串
# "-".join([1, 2, 3])    # TypeError

# 转换后拼接
nums = [1, 2, 3]
print("-".join(str(n) for n in nums))    # 1-2-3
\`\`\`

## 大小写转换

\`\`\`python
s = "Hello World"

# 全大写
print(s.upper())          # HELLO WORLD

# 全小写
print(s.lower())          # hello world

# 首字母大写（整个字符串的第一个字母）
print(s.capitalize())     # Hello world

# 每个单词首字母大写
print(s.title())          # Hello World

# 大小写互换
print(s.swapcase())       # hELLO wORLD

# 大小写转换的应用：忽略大小写比较
user_input = "YES"
if user_input.lower() == "yes":
    print("用户同意了")
\`\`\`

**\`title()\` 的陷阱**：它会把"非字母后的字母"也大写，包括数字、标点后的字母。

\`\`\`python
s = "hello 123world"
print(s.title())    # Hello 123World（W 被大写了，因为前面是数字）
\`\`\`

## 去空白与对齐

### strip() / lstrip() / rstrip()

\`\`\`python
s = "   hello world   "

# 去首尾空白
print(s.strip())      # "hello world"
print(s.lstrip())     # "hello world   "（只去开头）
print(s.rstrip())     # "   hello world"（只去结尾）

# 去指定字符
s = "###hello###"
print(s.strip("#"))   # hello

# 去多种字符（按字符去，不是去子串）
s = "abcHELLOabc"
print(s.strip("abc"))    # HELLO（去掉首尾的 a/b/c）
\`\`\`

### 对齐：ljust / rjust / center

\`\`\`python
s = "hello"

# ljust 左对齐，总宽 10，右边补空格
print(s.ljust(10) + "|")     # hello     |

# rjust 右对齐
print(s.rjust(10) + "|")     #      hello|

# center 居中
print(s.center(10) + "|")    #   hello   |

# 指定填充字符
print(s.ljust(10, "-"))      # hello-----
print(s.rjust(10, "*"))      # *****hello
print(s.center(10, "="))     # ==hello===
\`\`\`

### zfill()：用 0 填充到指定宽度

\`\`\`python
# zfill 在左边补 0，常用于编号、对齐数字
print("42".zfill(5))      # 00042
print("123".zfill(8))     # 00000123

# 处理负数时 0 在符号后面
print("-42".zfill(5))     # -0042
print("+42".zfill(5))     # +0042
\`\`\`

**\`zfill\` 的妙用**：补齐日期、订单号。

\`\`\`python
# 生成订单号：日期 + 4 位序号
date = "20260719"
for i in range(1, 4):
    order_id = date + str(i).zfill(4)
    print(order_id)
# 202607190001
# 202607190002
# 202607190003
\`\`\`

## 判断类方法

### 前后缀判断

\`\`\`python
# startswith 判断前缀
print("hello world".startswith("hello"))    # True
print("hello world".startswith("world"))    # False

# endswith 判断后缀（很常用，判断文件类型）
print("report.pdf".endswith(".pdf"))        # True
print("photo.jpg".endswith((".jpg", ".png", ".gif")))    # True（传元组）

# 指定范围判断
s = "hello world"
print(s.startswith("world", 6))    # True（从索引 6 开始判断）
\`\`\`

### 字符类型判断

\`\`\`python
# isdigit: 全是数字
print("12345".isdigit())      # True
print("12.34".isdigit())     # False（小数点不是数字）
print("①②③".isdigit())       # True（Unicode 数字也算）

# isalpha: 全是字母
print("hello".isalpha())     # True
print("hello123".isalpha())  # False

# isalnum: 字母或数字
print("hello123".isalnum())  # True
print("hello 123".isalnum()) # False（空格不算）

# isspace: 全是空白
print("   \\t\\n".isspace())  # True
print(" a ".isspace())       # False

# isupper / islower: 全大写 / 全小写
print("HELLO".isupper())     # True
print("hello".islower())     # True
print("Hello".isupper())     # False（有大写有小写）

# 实战：表单验证
def validate_username(name):
    """用户名必须是字母或数字，长度 3-20"""
    if not name.isalnum():
        return False, "用户名只能包含字母和数字"
    if len(name) < 3 or len(name) > 20:
        return False, "用户名长度必须是 3-20"
    return True, "通过"

print(validate_username("alice123"))    # (True, '通过')
print(validate_username("ali ce"))      # (False, '用户名只能包含字母和数字')
\`\`\`

### Python 3 的 isidentifier / isprintable

\`\`\`python
# isidentifier: 是否是合法的 Python 标识符
print("my_var".isidentifier())    # True
print("2name".isidentifier())     # False（不能以数字开头）
print("my-name".isidentifier())   # False（不能有 -）
print("class".isidentifier())     # True（关键字也是合法标识符）

# isprintable: 是否全是可打印字符
print("hello".isprintable())      # True
print("hello\\n".isprintable())   # False（换行符不可打印）
\`\`\`

## 编码与解码

### encode() / decode()

\`\`\`python
# 字符串 -> 字节串
s = "你好"
b = s.encode("utf-8")
print(b)                # b'\\xe4\\xbd\\xa0\\xe5\\xa5\\xbd'
print(type(b))          # <class 'bytes'>
print(len(b))           # 6（中文 UTF-8 占 3 字节）

# 字节串 -> 字符串
text = b.decode("utf-8")
print(text)             # 你好

# 不同编码
print("hello".encode("ascii"))           # b'hello'
print("你好".encode("gbk"))              # b'\\xc4\\xe3\\xba\\xc3'（GBK 占 2 字节）

# 错误处理
b = "你好".encode("utf-8")
# 用错误编码解码会抛 UnicodeDecodeError
# text = b.decode("ascii")    # UnicodeDecodeError

# 错误处理策略
text = b.decode("ascii", errors="ignore")      # 忽略错误字节
print(text)    # （空字符串，所有字节都被忽略）
text = b.decode("ascii", errors="replace")     # 用 ? 替代
print(text)    # ????
\`\`\`

**编码错误的 4 种处理方式**：

| errors 值 | 行为 |
|-----------|------|
| \`strict\`（默认） | 抛 UnicodeError |
| \`ignore\` | 忽略错误字节 |
| \`replace\` | 用 \`?\` 或 \`\\ufffd\` 替代 |
| \`backslashreplace\` | 用 \`\\x..\` 形式替代 |

## maketrans / translate：字符映射替换

比 \`replace\` 强大的"按映射表替换"。

\`\`\`python
# 1. 用 maketrans 创建映射表
# 把 'abc' 替换成 '123'
table = str.maketrans("abc", "123")

# 2. 用 translate 应用映射
s = "abcdefabc"
print(s.translate(table))    # 123def123

# 删除某些字符（第三参数）
table = str.maketrans("abc", "123", "xyz")
s = "abcxyzabc"
print(s.translate(table))    # 123123（xyz 被删除）

# 用字典创建映射表
table = str.maketrans({"a": "X", "b": "Y"})
print("abc".translate(table))    # XYc
\`\`\`

**translate 的实际用途**：批量替换、加密、清理文本。

\`\`\`python
# 实战：删除所有标点
import string
text = "你好，世界！Python, 很棒。"
# string.punctuation 是所有英文标点
table = str.maketrans("", "", string.punctuation + "，。！？、")
clean = text.translate(table)
print(clean)    # 你好世界Python 很棒
\`\`\`

## format_map：用字典格式化

\`\`\`python
# 用字典提供格式化变量
data = {"name": "张三", "age": 25}
# 注意：format_map 不支持格式说明符的 :.2f
print("我叫{name}，今年{age}岁".format_map(data))

# 比 .format(**data) 稍快，且不需要解包
print("我叫{name}，今年{age}岁".format(**data))
\`\`\`

## 综合实战 demo

\`\`\`python
# ============================================
# 第六章综合 demo：字符串方法综合实战
# 模拟：日志解析与统计
# ============================================

# 假装这是 Web 服务器日志
logs = """
2026-07-19 10:15:23 INFO  User alice logged in from 192.168.1.10
2026-07-19 10:16:45 WARN  Failed login attempt for user bob from 10.0.0.5
2026-07-19 10:17:12 ERROR Database connection failed
2026-07-19 10:18:30 INFO  User alice performed action: upload_file
2026-07-19 10:19:00 WARN  Slow query detected (3.5s)
2026-07-19 10:20:15 ERROR User charlie permission denied
""".strip()

# 1. 按行分割
lines = logs.splitlines()
print(f"共 {len(lines)} 条日志\\n")

# 2. 统计各级别日志数量
level_count = {"INFO": 0, "WARN": 0, "ERROR": 0}
for line in lines:
    for level in level_count:
        if level in line:
            level_count[level] += 1

print("--- 日志级别统计 ---")
for level, count in level_count.items():
    # 用 ljust 对齐
    print(f"{level.ljust(6)}: {count}")

# 3. 提取所有出现的 IP 地址
print()
print("--- 提到的 IP 地址 ---")
ips = set()    # 用集合去重
for line in lines:
    # 找形如 x.x.x.x 的内容（简单方法：split 后找点分数字）
    for word in line.split():
        # 简单判断：包含 3 个点且都是数字
        if word.count(".") == 3:
            parts = word.split(".")
            if all(p.isdigit() for p in parts):
                ips.add(word)

for ip in sorted(ips):
    print(f"  {ip}")

# 4. 提取所有用户名
print()
print("--- 出现的用户名 ---")
usernames = set()
for line in lines:
    # 找 "User xxx" 模式
    if "User" in line:
        # 用 partition 找到 User 后的内容
        _, _, rest = line.partition("User ")
        # 第一个单词就是用户名
        username = rest.split()[0]
        usernames.add(username)

for name in sorted(usernames):
    print(f"  {name}")

# 5. 统计每条日志的字符数
print()
print("--- 日志长度 ---")
for i, line in enumerate(lines, 1):
    # strip 后的长度
    length = len(line.strip())
    # 用 rjust 对齐序号
    print(f"日志 {str(i).rjust(2)}: {length} 字符")

# 6. 把 ERROR 日志高亮显示（这里用 [ERROR] 标记）
print()
print("--- ERROR 日志（标记） ---")
for line in lines:
    if "ERROR" in line:
        # 把 ERROR 替换成 [ERROR]
        marked = line.replace("ERROR", "[ERROR]")
        print(marked)
\`\`\`

这段 demo 综合用了：splitlines、split、count、partition、replace、isdigit、ljust、rjust、len、set 去重、sorted。**是日志分析的典型场景**。

## ⚠️ 常见坑

### 坑一：忘记字符串不可变

\`\`\`python
s = "hello"
s.replace("l", "L")    # 没赋值，结果丢失
print(s)               # 还是 hello

# 正确
s = s.replace("l", "L")
\`\`\`

### 坑二：split 和 split(" ") 的区别

\`\`\`python
s = "a  b"     # 两个空格
print(s.split())      # ['a', 'b']（智能处理连续空白）
print(s.split(" "))   # ['a', '', 'b']（每个空格都分割）
\`\`\`

### 坑三：strip 误以为是去"子串"

\`\`\`python
# strip 去的是"字符集合"，不是"子串"
s = "hello world"
print(s.strip("hello"))    # " world"（去掉了首尾的 h/e/l/l/o 字符）
# 不是去掉 "hello" 这个子串！

# 想去子串用 replace 或 removeprefix/removesuffix
print(s.removeprefix("hello"))    # " world"
\`\`\`

### 坑四：title() 对数字后字母的处理

\`\`\`python
print("hello 2world".title())    # Hello 2World（W 被大写）
\`\`\`

## removeprefix / removesuffix（Python 3.9+）

\`\`\`python
# Python 3.9 新增：精确去前缀/后缀（不是字符集合！）
s = "hello_world.py"

# 去后缀
print(s.removesuffix(".py"))     # hello_world

# 去前缀
print(s.removeprefix("hello_"))  # world.py

# 不匹配时不报错，返回原字符串
print("hello".removesuffix(".py"))    # hello（没变化）
\`\`\`

**vs strip 的区别**：
- \`strip("abc")\` 去掉首尾的 a/b/c 字符（按字符去）
- \`removeprefix("abc")\` 去掉开头的 "abc" 子串（按子串去）

## 小结

- 字符串不可变，所有"修改"方法返回新字符串
- 查找：\`find\`（找不到返回 -1）、\`index\`（找不到抛错）、\`count\`、\`rfind\`、\`rindex\`
- 替换：\`replace\`、\`translate\`（按映射表批量替换）
- 分割：\`split\`（默认智能处理空白）、\`rsplit\`、\`splitlines\`、\`partition\`（分三部分）
- 拼接：\`join\`（最高效）
- 大小写：\`upper/lower/capitalize/title/swapcase\`
- 去空白：\`strip/lstrip/rstrip\`；对齐：\`ljust/rjust/center/zfill\`
- 判断：\`startswith/endswith\`（支持元组）、\`isdigit/isalpha/isalnum/isspace/isupper/islower\`
- 编码：\`encode\`（字符串→字节）、\`decode\`（字节→字符串），支持 errors 参数
- Python 3.9+：\`removeprefix/removesuffix\` 精确去前缀后缀

## 常见疑问 Q&A

**Q：find 和 index 选哪个？**
A：不确定子串是否存在用 find（返回 -1 不报错）；确定存在用 index（让异常帮你断言）。

**Q：split() 和 split(" ") 有什么区别？**
A：\`split()\` 智能处理连续空白，\`split(" ")\` 把每个空格当分隔符，连续空格会产生空字符串。日常用 \`split()\` 更省心。

**Q：\`s.strip("abc")\` 是去掉子串 "abc" 吗？**
A：不是！是去掉首尾的 a/b/c 这三个字符的任意组合。想去子串用 \`removeprefix\` / \`removesuffix\`（3.9+）或 \`replace\`。

**Q：怎么把字符串里所有标点都删掉？**
A：用 \`str.maketrans("", "", string.punctuation)\` 创建映射表，然后 \`s.translate(table)\`。`
  },

  // -----------------------------------------------------------
  // 第七章：列表基础
  // -----------------------------------------------------------
  {
    id: "py10-ch07",
    group: "第二部分 数据类型与字符串",
    icon: "📋",
    title: "第七章 列表基础",
    content: `## 列表是什么

**列表**（list）是 Python 最常用的数据结构，用来存储"一组有序的数据"。

\`\`\`python
# 列表用方括号 [] 创建，元素用逗号分隔
fruits = ["apple", "banana", "cherry"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", True, 3.14]    # 可以混合不同类型（但不推荐）
empty = []                          # 空列表

# 列表里的元素可以是任何类型，包括另一个列表（嵌套）
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
\`\`\`

**列表的特点**：
- **有序**：元素有固定顺序
- **可变**：可以增删改元素
- **允许重复**：同一个值可以出现多次
- **异构**：可以放不同类型的元素（但不推荐）

## 列表创建

### 直接创建

\`\`\`python
# 字面量创建
nums = [1, 2, 3]
empty = []
\`\`\`

### list() 函数

\`\`\`python
# 把其他可迭代对象转成列表
print(list("hello"))        # ['h', 'e', 'l', 'l', 'o']
print(list(range(5)))       # [0, 1, 2, 3, 4]
print(list((1, 2, 3)))      # [1, 2, 3]（元组转列表）
print(list({1, 2, 3}))      # [1, 2, 3]（集合转列表，顺序不保证）
\`\`\`

### 重复创建

\`\`\`python
# [元素] * n 创建 n 个相同元素的列表
zeros = [0] * 5
print(zeros)               # [0, 0, 0, 0, 0]

# ⚠️ 坑：嵌套列表不能用这个方式
matrix = [[0] * 3] * 3     # 看起来是 3x3 矩阵
print(matrix)              # [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
matrix[0][0] = 1           # 改一个，结果全变了！
print(matrix)              # [[1, 0, 0], [1, 0, 0], [1, 0, 0]]

# 正确做法：用列表推导式
matrix = [[0] * 3 for _ in range(3)]
matrix[0][0] = 1
print(matrix)              # [[1, 0, 0], [0, 0, 0], [0, 0, 0]]
\`\`\`

**为什么 \`[[0]*3]*3\` 会有坑？** 因为内层的 \`[0]*3\` 只创建了一次，外层的 \`*3\` 是复制了 3 个**引用**——三个内层列表其实是同一个对象。改一个就全改了。

## 索引访问

列表的索引规则和字符串完全一样：**从 0 开始，支持负数**。

\`\`\`python
fruits = ["apple", "banana", "cherry", "date", "elderberry"]

# 正向索引
print(fruits[0])    # apple
print(fruits[2])    # cherry

# 负向索引
print(fruits[-1])   # elderberry（最后一个）
print(fruits[-2])   # date

# 越界报错
# print(fruits[10])    # IndexError: list index out of range
\`\`\`

## 切片

切片语法 \`list[start:stop:step]\`，和字符串完全一样。

\`\`\`python
nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

# 取前 3 个
print(nums[:3])        # [0, 1, 2]

# 取索引 3 到 5
print(nums[3:6])       # [3, 4, 5]

# 取最后 3 个
print(nums[-3:])       # [7, 8, 9]

# 每隔一个取
print(nums[::2])       # [0, 2, 4, 6, 8]

# 反转列表
print(nums[::-1])      # [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
\`\`\`

### 切片赋值（列表特有）

\`\`\`python
nums = [0, 1, 2, 3, 4, 5]

# 用切片替换一段元素
nums[1:3] = ["a", "b", "c"]    # 把索引 1-2 替换成 3 个元素
print(nums)    # [0, 'a', 'b', 'c', 3, 4, 5]（列表变长了）

# 用切片删除
nums = [0, 1, 2, 3, 4, 5]
nums[1:4] = []    # 等同于 del nums[1:4]
print(nums)       # [0, 4, 5]
\`\`\`

## 列表方法：增删改

### 增加元素

\`\`\`python
fruits = ["apple", "banana"]

# append: 在末尾添加一个元素
fruits.append("cherry")
print(fruits)    # ['apple', 'banana', 'cherry']

# insert: 在指定位置插入
fruits.insert(1, "blueberry")    # 在索引 1 插入
print(fruits)    # ['apple', 'blueberry', 'banana', 'cherry']

# extend: 把另一个可迭代对象的元素全部加进来
more = ["date", "elderberry"]
fruits.extend(more)
print(fruits)    # ['apple', 'blueberry', 'banana', 'cherry', 'date', 'elderberry']

# ⚠️ append vs extend 的区别
lst = [1, 2, 3]
lst.append([4, 5])      # 把 [4,5] 作为一个元素
print(lst)              # [1, 2, 3, [4, 5]]（嵌套了！）

lst = [1, 2, 3]
lst.extend([4, 5])      # 把 4 和 5 分别加进去
print(lst)              # [1, 2, 3, 4, 5]
\`\`\`

**append vs extend vs insert**：
- \`append\`：末尾加一个元素
- \`extend\`：末尾加多个元素（解开可迭代对象）
- \`insert\`：在指定位置插入

### 删除元素

\`\`\`python
fruits = ["apple", "banana", "cherry", "banana", "date"]

# remove: 删除第一个匹配的值
fruits.remove("banana")
print(fruits)    # ['apple', 'cherry', 'banana', 'date']

# 找不到会报错
# fruits.remove("grape")    # ValueError

# pop: 删除指定索引的元素并返回它（默认最后一个）
last = fruits.pop()
print(last)      # date
print(fruits)    # ['apple', 'cherry', 'banana']

second = fruits.pop(1)
print(second)    # cherry
print(fruits)    # ['apple', 'banana']

# clear: 清空整个列表
fruits.clear()
print(fruits)    # []

# del 语句：按索引或切片删除
nums = [1, 2, 3, 4, 5]
del nums[0]      # 删第一个
print(nums)      # [2, 3, 4, 5]
del nums[1:3]    # 删一段
print(nums)      # [2, 5]
\`\`\`

**remove vs pop vs del**：
- \`remove(值)\`：按值删，只删第一个匹配
- \`pop(索引)\`：按索引删，返回被删的值
- \`del list[索引]\`：按索引删，不返回值
- \`clear()\`：清空

### 修改元素

\`\`\`python
fruits = ["apple", "banana", "cherry"]

# 按索引修改
fruits[0] = "apricot"
print(fruits)    # ['apricot', 'banana', 'cherry']

# 切片批量修改
fruits[1:3] = ["blueberry", "cherry", "date"]
print(fruits)    # ['apricot', 'blueberry', 'cherry', 'date']
\`\`\`

## 查询方法

\`\`\`python
fruits = ["apple", "banana", "cherry", "banana"]

# index: 查找元素第一次出现的索引
print(fruits.index("banana"))    # 1
# 指定查找范围
print(fruits.index("banana", 2)) # 3（从索引 2 开始找）
# 找不到报错
# fruits.index("grape")    # ValueError

# count: 统计元素出现次数
print(fruits.count("banana"))    # 2
print(fruits.count("grape"))     # 0

# in: 判断元素是否在列表中
print("apple" in fruits)         # True
print("grape" in fruits)         # False
print("grape" not in fruits)     # True
\`\`\`

## 排序

### sort() 原地排序

\`\`\`python
nums = [3, 1, 4, 1, 5, 9, 2, 6]

# 默认升序
nums.sort()
print(nums)    # [1, 1, 2, 3, 4, 5, 6, 9]

# 降序
nums.sort(reverse=True)
print(nums)    # [9, 6, 5, 4, 3, 2, 1, 1]

# 用 key 函数指定排序依据
words = ["banana", "apple", "cherry", "date"]
words.sort(key=len)    # 按长度排序
print(words)           # ['date', 'apple', 'banana', 'cherry']

words.sort(key=len, reverse=True)    # 按长度降序
print(words)           # ['banana', 'cherry', 'apple', 'date']

# 大小写不敏感排序
words = ["Banana", "apple", "Cherry"]
words.sort(key=str.lower)    # 都按小写比较
print(words)                 # ['apple', 'Banana', 'Cherry']
\`\`\`

### sorted() 返回新列表

\`\`\`python
# sorted 不修改原列表，返回新列表
nums = [3, 1, 4, 1, 5]
new_nums = sorted(nums)
print(nums)        # [3, 1, 4, 1, 5]（原列表没变）
print(new_nums)    # [1, 1, 3, 4, 5]

# sorted 可以接受任何可迭代对象
print(sorted("hello"))              # ['e', 'h', 'l', 'l', 'o']
print(sorted({3, 1, 2}))            # [1, 2, 3]
print(sorted({"b": 2, "a": 1}))     # ['a', 'b']（对字典的键排序）
\`\`\`

**sort vs sorted 怎么选？**
- \`sort()\`：原地修改，没有返回值（返回 None）。不需要保留原列表时用
- \`sorted()\`：返回新列表，不改原对象。需要保留原列表，或排序非列表对象时用

### 用 key 函数实现复杂排序

\`\`\`python
# 按对象的某个属性排序
students = [
    {"name": "张三", "score": 85},
    {"name": "李四", "score": 92},
    {"name": "王五", "score": 78},
]

# 按 score 降序
students.sort(key=lambda x: x["score"], reverse=True)
for s in students:
    print(f"{s['name']}: {s['score']}")
# 李四: 92
# 张三: 85
# 王五: 78

# 多条件排序：先按 score 降序，score 相同按 name 升序
students = [
    {"name": "张三", "score": 85},
    {"name": "李四", "score": 92},
    {"name": "王五", "score": 85},    # 和张三同分
]
students.sort(key=lambda x: (-x["score"], x["name"]))
for s in students:
    print(f"{s['name']}: {s['score']}")
# 李四: 92
# 张三: 85（同分时按 name 排序）
# 王五: 85
\`\`\`

**多条件排序的技巧**：返回一个元组 \`(条件1, 条件2)\`，Python 会依次比较。想要某条件降序，对数字取负（\`-x["score"]\`）。

### reverse() 反转

\`\`\`python
nums = [1, 2, 3, 4, 5]
nums.reverse()    # 原地反转
print(nums)       # [5, 4, 3, 2, 1]

# 不修改原列表的反转
nums = [1, 2, 3, 4, 5]
reversed_nums = list(reversed(nums))
print(nums)             # [1, 2, 3, 4, 5]
print(reversed_nums)    # [5, 4, 3, 2, 1]

# 切片反转（最简洁）
nums = [1, 2, 3, 4, 5]
reversed_nums = nums[::-1]
print(reversed_nums)    # [5, 4, 3, 2, 1]
\`\`\`

## copy()：浅拷贝

\`\`\`python
# 赋值只是引用，不是拷贝
a = [1, 2, 3]
b = a
b.append(4)
print(a)    # [1, 2, 3, 4]（a 也变了！因为是同一个列表）

# copy() 创建新列表
a = [1, 2, 3]
b = a.copy()    # 等同于 b = a[:] 或 b = list(a)
b.append(4)
print(a)    # [1, 2, 3]（a 没变）
print(b)    # [1, 2, 3, 4]
\`\`\`

**注意**：\`copy()\` 是**浅拷贝**——只复制第一层，嵌套的可变对象还是共享。

\`\`\`python
a = [[1, 2], [3, 4]]
b = a.copy()
b[0][0] = 99    # 修改内层列表
print(a)        # [[99, 2], [3, 4]]（a 也变了！内层是共享的）

# 深拷贝用 copy 模块
import copy
a = [[1, 2], [3, 4]]
b = copy.deepcopy(a)
b[0][0] = 99
print(a)        # [[1, 2], [3, 4]]（a 没变，彻底独立）
\`\`\`

## 列表推导式

**列表推导式**（list comprehension）是 Python 最优雅的特性之一，用一行代码创建列表。

### 基本语法

\`\`\`python
# 传统写法
squares = []
for x in range(10):
    squares.append(x ** 2)
print(squares)    # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# 列表推导式
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

### 带条件表达式

\`\`\`python
# if-else 在前面（不是过滤，是给每个元素选值）
labels = ["偶数" if x % 2 == 0 else "奇数" for x in range(5)]
print(labels)    # ['偶数', '奇数', '偶数', '奇数', '偶数']
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

### 处理字符串列表

\`\`\`python
words = ["Hello", "WORLD", "Python"]

# 全转小写
lower_words = [w.lower() for w in words]
print(lower_words)    # ['hello', 'world', 'python']

# 只保留长度 > 4 的
long_words = [w for w in words if len(w) > 4]
print(long_words)     # ['Hello', 'WORLD', 'Python']

# 带转换
lengths = [(w, len(w)) for w in words]
print(lengths)        # [('Hello', 5), ('WORLD', 5), ('Python', 6)]
\`\`\`

### 推导式的可读性

\`\`\`python
# 推导式适合简单场景
squares = [x ** 2 for x in range(10)]    # 一眼能看懂

# 太复杂就别用推导式，老老实实写 for 循环
# 比如下面这个：能看懂但难读
result = [x if x % 2 == 0 else -x for x in range(20) if x > 5]
\`\`\`

**经验法则**：推导式不超过 2 个 \`for\` 和 1 个 \`if\`，超过就拆成普通循环。

## 嵌套列表

\`\`\`python
# 二维列表（矩阵）
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

# 访问元素：matrix[行][列]
print(matrix[0][0])    # 1
print(matrix[1][2])    # 6
print(matrix[2][1])    # 8

# 遍历二维列表
for row in matrix:
    for elem in row:
        print(elem, end=" ")
    print()
# 1 2 3
# 4 5 6
# 7 8 9

# 用推导式扁平化
flat = [elem for row in matrix for elem in row]
print(flat)    # [1, 2, 3, 4, 5, 6, 7, 8, 9]

# 转置矩阵（行列互换）
transposed = [[row[i] for row in matrix] for i in range(len(matrix[0]))]
print(transposed)
# [[1, 4, 7], [2, 5, 8], [3, 6, 9]]
\`\`\`

## 列表解包

\`\`\`python
# 解包：把列表元素分别赋给变量
nums = [1, 2, 3]
a, b, c = nums
print(a, b, c)    # 1 2 3

# 用 * 收集多余的元素
first, *rest = [1, 2, 3, 4, 5]
print(first)      # 1
print(rest)       # [2, 3, 4, 5]

*init, last = [1, 2, 3, 4, 5]
print(init)       # [1, 2, 3, 4]
print(last)       # 5

first, *middle, last = [1, 2, 3, 4, 5]
print(first)      # 1
print(middle)     # [2, 3, 4]
print(last)       # 5

# 嵌套解包
pairs = [(1, 'a'), (2, 'b'), (3, 'c')]
for num, letter in pairs:
    print(f"{num}: {letter}")
\`\`\`

## del 语句

\`\`\`python
nums = [1, 2, 3, 4, 5]

# 删除指定索引
del nums[0]
print(nums)    # [2, 3, 4, 5]

# 删除一段
del nums[1:3]
print(nums)    # [2, 5]

# 删除整个变量
del nums
# print(nums)    # NameError: name 'nums' is not defined
\`\`\`

## 综合实战 demo

\`\`\`python
# ============================================
# 第七章综合 demo：待办事项管理
# 演示：列表的增删改查、排序、推导式
# ============================================

# 待办事项列表（每项是字典）
todos = [
    {"task": "学习 Python", "priority": "高", "done": False},
    {"task": "买菜", "priority": "中", "done": True},
    {"task": "写报告", "priority": "高", "done": False},
    {"task": "运动", "priority": "低", "done": False},
    {"task": "读书", "priority": "中", "done": True},
]

# 1. 显示所有待办
print("=" * 40)
print("        我的待办事项")
print("=" * 40)
for i, todo in enumerate(todos, 1):
    # 用 ✓ 或 ✗ 标记完成状态
    status = "✓" if todo["done"] else "✗"
    print(f"{i}. [{status}] {todo['task']} (优先级: {todo['priority']})")

# 2. 添加新待办
new_todo = {"task": "学英语", "priority": "高", "done": False}
todos.append(new_todo)
print(f"\\n添加了: {new_todo['task']}")

# 3. 插入到开头
todos.insert(0, {"task": "早起", "priority": "高", "done": False})
print(f"插入了: {todos[0]['task']}")

# 4. 用推导式筛选未完成的
pending = [t for t in todos if not t["done"]]
print(f"\\n还有 {len(pending)} 项未完成:")
for t in pending:
    print(f"  - {t['task']}")

# 5. 用推导式按优先级筛选
high_priority = [t["task"] for t in todos if t["priority"] == "高"]
print(f"\\n高优先级任务: {high_priority}")

# 6. 按优先级排序（高 > 中 > 低）
priority_order = {"高": 0, "中": 1, "低": 2}
todos.sort(key=lambda x: priority_order[x["priority"]])
print("\\n按优先级排序后:")
for todo in todos:
    print(f"  [{todo['priority']}] {todo['task']}")

# 7. 标记第一个未完成的为已完成
for todo in todos:
    if not todo["done"]:
        todo["done"] = True
        print(f"\\n完成了: {todo['task']}")
        break

# 8. 删除所有已完成的
# 注意：遍历时删除要用切片拷贝或倒序
before = len(todos)
todos = [t for t in todos if not t["done"]]    # 用推导式重建
print(f"\\n删除了 {before - len(todos)} 项已完成任务")

# 9. 最终状态
print("\\n最终待办:")
for i, todo in enumerate(todos, 1):
    status = "✓" if todo["done"] else "✗"
    print(f"{i}. [{status}] {todo['task']} ({todo['priority']})")
\`\`\`

这段 demo 综合用了：append、insert、enumerate、推导式、sort 配合 key、列表重建删除、in 判断。**是列表操作的典型场景**。

## ⚠️ 初学者常见坑

### 坑一：遍历时删除元素

\`\`\`python
# 错误：遍历时删除会漏元素
nums = [1, 2, 3, 4, 5]
for n in nums:
    if n % 2 == 0:
        nums.remove(n)
print(nums)    # [1, 3, 5]（看起来对，但只是巧合）

# 真实场景会出错
nums = [1, 2, 2, 3, 4]
for n in nums:
    if n % 2 == 0:
        nums.remove(n)
print(nums)    # [1, 2, 3]（漏删一个 2！）

# 正确做法 1：用推导式重建
nums = [1, 2, 2, 3, 4]
nums = [n for n in nums if n % 2 != 0]
print(nums)    # [1, 3]

# 正确做法 2：倒序遍历
nums = [1, 2, 2, 3, 4]
for i in range(len(nums) - 1, -1, -1):
    if nums[i] % 2 == 0:
        del nums[i]
print(nums)    # [1, 3]
\`\`\`

### 坑二：\`[[0]*3]*3\` 共享引用

\`\`\`python
# 错误
matrix = [[0] * 3] * 3
matrix[0][0] = 1
print(matrix)    # [[1, 0, 0], [1, 0, 0], [1, 0, 0]]

# 正确
matrix = [[0] * 3 for _ in range(3)]
matrix[0][0] = 1
print(matrix)    # [[1, 0, 0], [0, 0, 0], [0, 0, 0]]
\`\`\`

### 坑三：sort 返回 None

\`\`\`python
nums = [3, 1, 2]
# 错误：sort 返回 None，赋值后变成 None
nums = nums.sort()
print(nums)    # None

# 正确：直接调用，原列表被修改
nums = [3, 1, 2]
nums.sort()
print(nums)    # [1, 2, 3]

# 想要返回新列表用 sorted
nums = [3, 1, 2]
new_nums = sorted(nums)
\`\`\`

### 坑四：浅拷贝的陷阱

\`\`\`python
a = [[1, 2], [3, 4]]
b = a.copy()       # 浅拷贝
b[0][0] = 99
print(a)           # [[99, 2], [3, 4]]（a 也变了）

# 深拷贝
import copy
a = [[1, 2], [3, 4]]
b = copy.deepcopy(a)
b[0][0] = 99
print(a)           # [[1, 2], [3, 4]]（a 没变）
\`\`\`

## 小结

- 列表用 \`[]\` 创建，有序、可变、允许重复
- 索引 \`lst[0]\` \`lst[-1]\`，切片 \`lst[1:5]\` \`lst[::-1]\`
- 增：\`append\`（末尾）、\`insert\`（指定位置）、\`extend\`（批量）
- 删：\`remove\`（按值）、\`pop\`（按索引返回）、\`clear\`、\`del\`
- 改：\`lst[i] = x\` 或切片赋值
- 查：\`index\`、\`count\`、\`in\`
- 排序：\`sort()\`（原地）、\`sorted()\`（返回新列表），支持 \`key\` 和 \`reverse\`
- \`copy()\` 是浅拷贝，深拷贝用 \`copy.deepcopy()\`
- 列表推导式：\`[x for x in lst if cond]\`，简洁高效
- 遍历时删除用推导式重建或倒序遍历

## 常见疑问 Q&A

**Q：append 和 extend 区别？**
A：append 把参数作为**一个元素**加到末尾；extend 把可迭代对象的元素**逐个**加到末尾。\`[1,2].append([3,4])\` 得到 \`[1,2,[3,4]]\`；\`[1,2].extend([3,4])\` 得到 \`[1,2,3,4]\`。

**Q：sort 和 sorted 选哪个？**
A：不需要保留原列表用 \`sort()\`（更快，原地改）；需要保留原列表或排序非列表对象用 \`sorted()\`。

**Q：列表推导式什么时候用？**
A：简单转换或过滤时用（1-2 个 for/if）。复杂逻辑用普通 for 循环更清晰。

**Q：怎么深拷贝嵌套列表？**
A：用 \`copy.deepcopy(lst)\`。\`lst.copy()\` 和 \`lst[:]\` 都是浅拷贝，只复制第一层。`
  },

  // -----------------------------------------------------------
  // 第八章：元组与解包
  // -----------------------------------------------------------
  {
    id: "py10-ch08",
    group: "第二部分 数据类型与字符串",
    icon: "📦",
    title: "第八章 元组与解包",
    content: `## 元组是什么

**元组**（tuple）和列表很像，但**不可变**——创建后不能增删改元素。

\`\`\`python
# 元组用圆括号 () 创建
fruits = ("apple", "banana", "cherry")
numbers = (1, 2, 3, 4, 5)
mixed = (1, "hello", True)

# 空元组
empty = ()

# 单元素元组（必须加逗号！）
single = (42,)       # 这是元组
not_tuple = (42)     # 这只是整数 42，加了括号而已
print(type(single))      # <class 'tuple'>
print(type(not_tuple))   # <class 'int'>
\`\`\`

**元组的特点**：
- **有序**：元素有固定顺序
- **不可变**：创建后不能修改
- **允许重复**
- **异构**：可以放不同类型

## 元组创建

### 直接创建

\`\`\`python
# 圆括号创建
t = (1, 2, 3)

# 圆括号可以省略（称为"打包"）
t = 1, 2, 3
print(t)             # (1, 2, 3)
print(type(t))       # <class 'tuple'>

# 单元素必须加逗号
t = 1,
print(t)             # (1,)
\`\`\`

### tuple() 函数

\`\`\`python
# 把其他可迭代对象转成元组
print(tuple([1, 2, 3]))       # (1, 2, 3)（列表转元组）
print(tuple("hello"))         # ('h', 'e', 'l', 'l', 'o')
print(tuple(range(5)))        # (0, 1, 2, 3, 4)
\`\`\`

## 元组的不可变性

\`\`\`python
t = (1, 2, 3)

# 不能修改元素
# t[0] = 99    # TypeError: 'tuple' object does not support item assignment

# 不能添加元素
# t.append(4)    # AttributeError: 'tuple' object has no attribute 'append'

# 不能删除元素
# del t[0]    # TypeError: 'tuple' object doesn't support item deletion
\`\`\`

**但要注意**：元组里如果有**可变元素**（如列表），那个可变元素本身是可以修改的。

\`\`\`python
t = (1, [2, 3], 4)
# t[1] = [9, 9]    # 错误：不能改元组的元素
t[1].append(99)     # 但可以改里面的列表
print(t)            # (1, [2, 3, 99], 4)
\`\`\`

**为什么这样？** 元组的"不可变"指的是**元素引用不可变**——元组里存的是"指向对象的引用"，引用不能改，但引用指向的对象本身可以改。

## 索引和切片

元组的索引和切片与列表完全一样。

\`\`\`python
t = ("a", "b", "c", "d", "e")

# 索引
print(t[0])      # a
print(t[-1])     # e

# 切片
print(t[1:3])    # ('b', 'c')
print(t[::-1])   # ('e', 'd', 'c', 'b', 'a')（反转）
\`\`\`

## 元组方法

元组只有两个方法（因为不可变，没有增删改方法）：

\`\`\`python
t = (1, 2, 2, 3, 2, 4)

# count: 统计元素出现次数
print(t.count(2))     # 3

# index: 查找元素第一次出现的索引
print(t.index(2))     # 1
# 找不到报错
# t.index(99)    # ValueError
\`\`\`

## 元组解包

**元组解包**（unpacking）是 Python 最优雅的特性之一，把元组的元素分别赋给变量。

### 基本解包

\`\`\`python
# 元素个数必须匹配
point = (3, 4)
x, y = point
print(x, y)    # 3 4

# 三维坐标
point_3d = (1, 2, 3)
x, y, z = point_3d
print(x, y, z)    # 1 2 3
\`\`\`

### 用 * 收集多余的元素

\`\`\`python
# * 收集剩余元素为列表
first, *rest = (1, 2, 3, 4, 5)
print(first)     # 1
print(rest)      # [2, 3, 4, 5]（注意是列表不是元组）

*init, last = (1, 2, 3, 4, 5)
print(init)      # [1, 2, 3, 4]
print(last)      # 5

first, *middle, last = (1, 2, 3, 4, 5)
print(first)     # 1
print(middle)    # [2, 3, 4]
print(last)      # 5
\`\`\`

### 解包的应用

\`\`\`python
# 1. 交换变量（不用临时变量）
a, b = 1, 2
a, b = b, a
print(a, b)    # 2 1

# 2. 函数返回多个值
def get_user_info():
    return "张三", 25, "北京"    # 返回元组

name, age, city = get_user_info()
print(f"{name}, {age} 岁, {city}")

# 3. 遍历键值对
user = {"name": "李四", "age": 30}
for key, value in user.items():
    print(f"{key}: {value}")

# 4. 同时遍历多个列表
names = ["张三", "李四", "王五"]
ages = [25, 30, 28]
for name, age in zip(names, ages):
    print(f"{name}: {age} 岁")
\`\`\`

### 嵌套解包

\`\`\`python
# 解包嵌套结构
data = ("张三", (25, "北京"))
name, (age, city) = data
print(name)    # 张三
print(age)     # 25
print(city)    # 北京

# 解包列表中的元组
points = [(1, 2), (3, 4), (5, 6)]
for x, y in points:
    print(f"({x}, {y})")
\`\`\`

## 何时用元组 vs 列表

### 用元组的场景

1. **数据不应该被修改**：坐标点 \`(\`x\`, \`y\`)、RGB 颜色 \`(255, 0, 0)\`
2. **函数返回多个值**：\`return name, age, city\`
3. **字典的键**：元组可以作字典键，列表不行
4. **作为常量集合**：一年四季 \`("春", "夏", "秋", "冬")\`

\`\`\`python
# 元组作字典键（列表不行！）
locations = {
    (39.9, 116.4): "北京",
    (31.2, 121.5): "上海",
}
print(locations[(39.9, 116.4)])    # 北京

# 列表不能作字典键
# locations = { [39.9, 116.4]: "北京" }    # TypeError
\`\`\`

### 用列表的场景

1. **数据需要增删改**：待办事项、购物车
2. **动态构建的集合**：循环中逐步添加元素
3. **需要排序的数据**：列表有 \`sort()\` 方法

### 性能对比

\`\`\`python
import sys

# 元组比列表更省内存
lst = [1, 2, 3, 4, 5]
tup = (1, 2, 3, 4, 5)
print(f"列表内存: {sys.getsizeof(lst)} 字节")
print(f"元组内存: {sys.getsizeof(tup)} 字节")
# 列表内存: 104 字节（大约）
# 元组内存: 80 字节（大约，比列表小）
\`\`\`

**为什么元组更省内存？** 列表要预留空间给后续添加元素，元组不可变不需要预留。

## namedtuple：具名元组

普通元组只能用索引访问（\`t[0]\`、\`t[1]\`），可读性差。\`namedtuple\` 让元组的字段有名字。

\`\`\`python
from collections import namedtuple

# 定义一个 Point 类型，有 x 和 y 两个字段
Point = namedtuple("Point", ["x", "y"])

# 创建实例
p = Point(3, 4)
print(p)         # Point(x=3, y=4)

# 用字段名访问（推荐）
print(p.x)       # 3
print(p.y)       # 4

# 也可以用索引访问
print(p[0])      # 3
print(p[1])      # 4

# 解包
x, y = p
print(x, y)      # 3 4
\`\`\`

### namedtuple 的实际用途

\`\`\`python
from collections import namedtuple

# 1. 表示学生
Student = namedtuple("Student", ["name", "age", "score"])
students = [
    Student("张三", 25, 85),
    Student("李四", 30, 92),
    Student("王五", 28, 78),
]

# 用字段名访问，可读性好
for s in students:
    print(f"{s.name}, {s.age} 岁, 分数 {s.score}")

# 2. 表示颜色
Color = namedtuple("Color", ["red", "green", "blue"])
red = Color(255, 0, 0)
print(f"红色 RGB: ({red.red}, {red.green}, {red.blue})")

# 3. 表示 HTTP 响应
Response = namedtuple("Response", ["status", "headers", "body"])
resp = Response(200, {"Content-Type": "application/json"}, '{"code": 0}')
print(f"状态码: {resp.status}, 体长: {len(resp.body)}")
\`\`\`

**namedtuple 的优点**：
- 比普通元组可读性好（\`p.x\` vs \`p[0]\`）
- 比类更轻量（不需要写 \`__init__\`）
- 内存占用和普通元组一样小
- 不可变，安全

### namedtuple 的方法

\`\`\`python
from collections import namedtuple
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)

# _asdict: 转成字典
print(p._asdict())           # {'x': 3, 'y': 4}

# _replace: 替换某些字段，返回新实例
p2 = p._replace(x=10)
print(p2)                    # Point(x=10, y=4)

# _fields: 查看所有字段名
print(Point._fields)         # ('x', 'y')

# _make: 从可迭代对象创建
p3 = Point._make([5, 6])
print(p3)                    # Point(x=5, y=6)
\`\`\`

## 综合实战 demo

\`\`\`python
# ============================================
# 第八章综合 demo：地理坐标处理
# 演示：元组、解包、namedtuple
# ============================================

from collections import namedtuple

# 1. 定义 City 类型
City = namedtuple("City", ["name", "country", "population", "coord"])

# 2. 创建城市数据
cities = [
    City("北京", "中国", 21540000, (39.9, 116.4)),
    City("上海", "中国", 24870000, (31.2, 121.5)),
    City("东京", "日本", 13960000, (35.7, 139.7)),
    City("纽约", "美国", 8399000, (40.7, -74.0)),
    City("伦敦", "英国", 8982000, (51.5, -0.1)),
]

# 3. 显示所有城市
print("=" * 60)
print("世界主要城市信息")
print("=" * 60)
for city in cities:
    # 用字段名访问，可读性好
    lat, lon = city.coord    # 解包坐标
    print(f"{city.name}({city.country}): 人口 {city.population:,}, 坐标 ({lat}, {lon})")

# 4. 人口最多的城市
biggest = max(cities, key=lambda c: c.population)
print(f"\\n人口最多: {biggest.name} ({biggest.population:,})")

# 5. 按人口排序
print("\\n按人口排序:")
sorted_cities = sorted(cities, key=lambda c: c.population, reverse=True)
for i, c in enumerate(sorted_cities, 1):
    print(f"{i}. {c.name}: {c.population:,}")

# 6. 按国家分组（用字典）
from collections import defaultdict
by_country = defaultdict(list)
for city in cities:
    by_country[city.country].append(city)

print("\\n按国家分组:")
for country, cities_in_country in by_country.items():
    print(f"{country}:")
    for c in cities_in_country:
        print(f"  - {c.name}")

# 7. 用 _replace 创建修改后的新城市
beijing = cities[0]
new_beijing = beijing._replace(population=22000000)
print(f"\\n修改后: {new_beijing.name} 人口 {new_beijing.population:,}")
print(f"原始: {beijing.name} 人口 {beijing.population:,}（没变）")

# 8. 转成字典
print(f"\\n北京转字典: {beijing._asdict()}")
\`\`\`

这段 demo 综合用了：namedtuple、元组解包、max/sorted 配合 key、defaultdict、_replace、_asdict。**展示了元组在数据建模中的优势**。

## ⚠️ 初学者常见坑

### 坑一：单元素元组忘记加逗号

\`\`\`python
# 错误
t = (42)       # 这不是元组，是带括号的整数
print(type(t)) # <class 'int'>

# 正确
t = (42,)
print(type(t)) # <class 'tuple'>
\`\`\`

### 坑二：误以为元组完全不可变

\`\`\`python
t = (1, [2, 3], 4)
# t[1] = [9, 9]    # 错：不能改元组元素
t[1].append(99)     # 对：可以改里面的列表
print(t)            # (1, [2, 3, 99], 4)
\`\`\`

### 坑三：解包数量不匹配

\`\`\`python
t = (1, 2, 3)
# a, b = t    # ValueError: too many values to unpack
# a, b, c, d = t    # ValueError: not enough values to unpack

# 用 * 收集多余
a, *b = t
print(a, b)    # 1 [2, 3]
\`\`\`

### 坑四：用列表当字典键

\`\`\`python
# 错误：列表不可哈希
# d = { [1, 2]: "value" }    # TypeError: unhashable type: 'list'

# 正确：用元组
d = { (1, 2): "value" }
print(d[(1, 2)])    # value
\`\`\`

## 小结

- 元组用 \`()\` 创建，**不可变**，元素引用不能改（但元素本身是可变的话可以改）
- 单元素元组必须加逗号：\`(42,)\`
- 只有 \`count\` 和 \`index\` 两个方法
- 解包：\`a, b, c = (1, 2, 3)\`，用 \`*\` 收集多余元素
- 嵌套解包：\`name, (age, city) = ("张三", (25, "北京"))\`
- 元组可作字典键、集合元素（因为不可变）
- 元组比列表省内存、访问更快
- \`namedtuple\` 给元组字段命名，可读性更好
- 不可变数据用元组，可变数据用列表

## 常见疑问 Q&A

**Q：单元素元组为什么必须加逗号？**
A：因为 \`()\` 在 Python 里既是元组的括号，也是普通括号（用于改变运算优先级）。\`(42)\` 被解析成"带括号的 42"，加逗号才明确是元组。

**Q：元组里的列表为什么能改？**
A：元组的不可变性指的是"元素引用不可变"——元组存的是指向对象的引用，引用不能换，但引用指向的对象本身可以改。

**Q：什么时候用元组？**
A：数据不应该被修改时（坐标、RGB 颜色）、函数返回多值、作字典键、作常量集合。需要增删改时用列表。

**Q：namedtuple 和普通类有什么区别？**
A：namedtuple 更轻量（不用写 \`__init__\`）、不可变、内存小。普通类更灵活，可以写方法、属性。数据类（dataclass）是另一个选择。`
  },

  // -----------------------------------------------------------
  // 第九章：字典基础
  // -----------------------------------------------------------
  {
    id: "py10-ch09",
    group: "第二部分 数据类型与字符串",
    icon: "📖",
    title: "第九章 字典基础",
    content: `## 字典是什么

**字典**（dict）是 Python 最强大的数据结构之一，用"键值对"存储数据。像查字典一样——通过"键"快速找到"值"。

\`\`\`python
# 字典用花括号 {} 创建，键值对用冒号 : 分隔
user = {
    "name": "张三",
    "age": 25,
    "city": "北京"
}

# 通过键访问值
print(user["name"])    # 张三
print(user["age"])     # 25
\`\`\`

**字典的特点**：
- **键值对**：每个键对应一个值
- **键唯一**：同一个键不能出现两次
- **可变**：可以增删改键值对
- **无序**（Python 3.7+ 保持插入顺序）
- **键必须可哈希**：字符串、数字、元组可以；列表、字典不行

## 字典创建

### 直接创建

\`\`\`python
# 字面量创建
user = {"name": "张三", "age": 25}

# 空字典
empty = {}
\`\`\`

### dict() 函数

\`\`\`python
# 用关键字参数创建
user = dict(name="张三", age=25)
print(user)    # {'name': '张三', 'age': 25}

# 用列表 of 元组创建
pairs = [("name", "张三"), ("age", 25)]
user = dict(pairs)
print(user)    # {'name': '张三', 'age': 25}

# 用两个列表 zip 创建
keys = ["name", "age", "city"]
values = ["张三", 25, "北京"]
user = dict(zip(keys, values))
print(user)    # {'name': '张三', 'age': 25, 'city': '北京'}
\`\`\`

### fromkeys()：用一组键创建字典

\`\`\`python
# 用一组键创建字典，所有值相同
keys = ["name", "age", "city"]
user = dict.fromkeys(keys)
print(user)    # {'name': None, 'age': None, 'city': None}

# 指定默认值
user = dict.fromkeys(keys, "未知")
print(user)    # {'name': '未知', 'age': '未知', 'city': '未知'}

# ⚠️ 坑：默认值是可变对象时会共享
users = dict.fromkeys(["user1", "user2"], [])
users["user1"].append("item")
print(users)    # {'user1': ['item'], 'user2': ['item']}（user2 也变了！）
\`\`\`

## 访问值

### 直接访问

\`\`\`python
user = {"name": "张三", "age": 25}

# 用 [] 访问
print(user["name"])    # 张三

# 键不存在会报错
# print(user["email"])    # KeyError: 'email'
\`\`\`

### get()：安全访问

\`\`\`python
user = {"name": "张三", "age": 25}

# get 不存在时返回 None（不报错）
print(user.get("email"))         # None

# 指定默认值
print(user.get("email", "未设置"))    # 未设置

# 实战：统计词频
text = "apple banana apple cherry banana apple"
word_count = {}
for word in text.split():
    # 如果 word 不存在，返回 0
    word_count[word] = word_count.get(word, 0) + 1
print(word_count)    # {'apple': 3, 'banana': 2, 'cherry': 1}
\`\`\`

**get vs []**：
- \`d[key]\`：键不存在抛 KeyError
- \`d.get(key)\`：键不存在返回 None（或指定默认值）

不确定键是否存在时用 \`get\`，确定存在时用 \`[]\`。

### setdefault()：不存在就设置

\`\`\`python
user = {"name": "张三"}

# setdefault: 键存在返回对应值，不存在则设置默认值并返回
email = user.setdefault("email", "unknown@example.com")
print(email)        # unknown@example.com
print(user)         # {'name': '张三', 'email': 'unknown@example.com'}

# 键已存在时不覆盖
user.setdefault("name", "李四")
print(user["name"])    # 张三（没被覆盖）

# 实战：分组
words = ["apple", "banana", "apricot", "blueberry", "cherry"]
groups = {}
for word in words:
    # 用首字母分组
    first = word[0]
    groups.setdefault(first, []).append(word)
print(groups)
# {'a': ['apple', 'apricot'], 'b': ['banana', 'blueberry'], 'c': ['cherry']}
\`\`\`

## 增删改

### 增加和修改

\`\`\`python
user = {"name": "张三"}

# 增加键值对
user["age"] = 25
print(user)    # {'name': '张三', 'age': 25}

# 修改已存在的键
user["age"] = 26
print(user)    # {'name': '张三', 'age': 26}

# update: 批量增加/修改
user.update({"city": "北京", "age": 27, "email": "a@b.com"})
print(user)    # {'name': '张三', 'age': 27, 'city': '北京', 'email': 'a@b.com'}
\`\`\`

### 删除

\`\`\`python
user = {"name": "张三", "age": 25, "city": "北京"}

# pop: 删除键并返回值
city = user.pop("city")
print(city)    # 北京
print(user)    # {'name': '张三', 'age': 25}

# pop 不存在的键会报错，但可以指定默认值
email = user.pop("email", "未设置")
print(email)    # 未设置（不报错）

# popitem: 删除并返回最后一个键值对（Python 3.7+ 是最后插入的）
last = user.popitem()
print(last)     # ('age', 25)
print(user)     # {'name': '张三'}

# del: 删除指定键
user = {"name": "张三", "age": 25}
del user["age"]
print(user)    # {'name': '张三'}

# clear: 清空字典
user.clear()
print(user)    # {}
\`\`\`

## 遍历字典

\`\`\`python
user = {"name": "张三", "age": 25, "city": "北京"}

# 1. 遍历键
for key in user.keys():
    print(key)
# name / age / city

# 2. 遍历值
for value in user.values():
    print(value)
# 张三 / 25 / 北京

# 3. 遍历键值对（最常用）
for key, value in user.items():
    print(f"{key}: {value}")
# name: 张三
# age: 25
# city: 北京

# 4. 直接遍历字典（默认遍历键）
for key in user:
    print(key, user[key])
\`\`\`

**\`items()\` 是最常用的遍历方式**，能同时拿到键和值。

### 判断键是否存在

\`\`\`python
user = {"name": "张三", "age": 25}

# 用 in 判断键是否存在
print("name" in user)        # True
print("email" in user)       # False

# 注意：判断的是键，不是值
print("张三" in user)        # False（张三是值，不是键）
print("张三" in user.values())    # True（在值里查找）
\`\`\`

## 字典方法汇总

\`\`\`python
user = {"name": "张三", "age": 25, "city": "北京"}

# 查询类
user.get("name")                  # 张三（不存在返回 None）
user.get("email", "未设置")        # 未设置

# 添加/修改类
user["email"] = "a@b.com"         # 直接赋值
user.update({"age": 26, "phone": "123"})    # 批量更新
user.setdefault("score", 0)       # 不存在才设置

# 删除类
user.pop("phone")                 # 删除并返回值
user.popitem()                    # 删除最后一个
del user["email"]                 # 用 del 删除
user.clear()                      # 清空

# 视图类
user.keys()                       # 所有键的视图
user.values()                     # 所有值的视图
user.items()                      # 所有键值对的视图

# 拷贝
user.copy()                       # 浅拷贝
\`\`\`

## 字典视图：keys() / values() / items()

\`keys()\`、\`values()\`、\`items()\` 返回的是"视图对象"，不是列表。视图是**动态的**——字典变化时视图也会变。

\`\`\`python
user = {"name": "张三", "age": 25}
keys = user.keys()
print(keys)              # dict_keys(['name', 'age'])

# 字典变化时视图也变
user["city"] = "北京"
print(keys)              # dict_keys(['name', 'age', 'city'])

# 视图支持集合操作
d1 = {"a": 1, "b": 2}
d2 = {"b": 3, "c": 4}
print(d1.keys() & d2.keys())    # {'b'}（交集）
print(d1.keys() | d2.keys())    # {'a', 'b', 'c'}（并集）
print(d1.keys() - d2.keys())    # {'a'}（差集）

# 转成列表
keys_list = list(user.keys())
print(keys_list)         # ['name', 'age', 'city']
\`\`\`

## 字典推导式

和列表推导式类似，但生成的是字典。

\`\`\`python
# 基本语法：{key_expr: value_expr for item in iterable}

# 1. 数字到平方的映射
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

# 4. 转换值
nums = {"a": "1", "b": "2", "c": "3"}
nums_int = {k: int(v) for k, v in nums.items()}
print(nums_int)    # {'a': 1, 'b': 2, 'c': 3}
\`\`\`

## 嵌套字典

\`\`\`python
# 学生成绩系统
students = {
    "张三": {"语文": 85, "数学": 92, "英语": 78},
    "李四": {"语文": 76, "数学": 88, "英语": 95},
    "王五": {"语文": 90, "数学": 85, "英语": 82},
}

# 访问嵌套值
print(students["张三"]["数学"])    # 92

# 添加新学生
students["赵六"] = {"语文": 88, "数学": 76, "英语": 91}

# 修改嵌套值
students["张三"]["数学"] = 95

# 遍历嵌套字典
for name, scores in students.items():
    total = sum(scores.values())
    avg = total / len(scores)
    print(f"{name}: 总分 {total}, 平均 {avg:.1f}")
\`\`\`

### 安全访问嵌套字典

\`\`\`python
# 不安全的访问（任一层不存在都报错）
# value = data["user"]["profile"]["name"]

# 安全访问方式 1：用 get 链
value = data.get("user", {}).get("profile", {}).get("name", "默认")

# 安全访问方式 2：try/except
try:
    value = data["user"]["profile"]["name"]
except (KeyError, TypeError):
    value = "默认"
\`\`\`

## 字典合并（Python 3.9+）

### 用 update 合并

\`\`\`python
d1 = {"a": 1, "b": 2}
d2 = {"b": 3, "c": 4}

# update: 原地修改 d1
d1.update(d2)
print(d1)    # {'a': 1, 'b': 3, 'c': 4}（b 被覆盖）

# 不修改原字典的合并
d1 = {"a": 1, "b": 2}
d2 = {"b": 3, "c": 4}
merged = {**d1, **d2}
print(merged)    # {'a': 1, 'b': 3, 'c': 4}
print(d1)        # {'a': 1, 'b': 2}（d1 没变）
\`\`\`

### Python 3.9+：用 | 运算符

\`\`\`python
d1 = {"a": 1, "b": 2}
d2 = {"b": 3, "c": 4}

# | 运算符返回新字典
merged = d1 | d2
print(merged)    # {'a': 1, 'b': 3, 'c': 4}

# |= 原地合并
d1 |= d2
print(d1)        # {'a': 1, 'b': 3, 'c': 4}
\`\`\`

## Python 3.7+ 字典有序

从 Python 3.7 开始，**字典保持插入顺序**。

\`\`\`python
# 插入顺序就是遍历顺序
d = {}
d["first"] = 1
d["second"] = 2
d["third"] = 3

for key in d:
    print(key)
# first / second / third（按插入顺序）
\`\`\`

之前要保证顺序得用 \`collections.OrderedDict\`，现在普通字典就有序了。\`OrderedDict\` 主要在需要 \`move_to_end\`、\`popitem(last=False)\` 等特殊操作时才用。

## 综合实战 demo

\`\`\`python
# ============================================
# 第九章综合 demo：商品库存管理
# 演示：字典的增删改查、推导式、嵌套
# ============================================

# 商品库存（嵌套字典）
inventory = {
    "苹果": {"price": 5.0, "stock": 100, "category": "水果"},
    "香蕉": {"price": 3.5, "stock": 80, "category": "水果"},
    "可乐": {"price": 4.0, "stock": 50, "category": "饮料"},
    "薯片": {"price": 8.0, "stock": 30, "category": "零食"},
}

# 1. 显示所有商品
print("=" * 50)
print("商品库存清单")
print("=" * 50)
print(f"{'商品':<8}{'类别':<8}{'价格':>8}{'库存':>8}")
print("-" * 50)
for name, info in inventory.items():
    print(f"{name:<8}{info['category']:<8}{info['price']:>8.1f}{info['stock']:>8}")

# 2. 添加新商品
inventory["牛奶"] = {"price": 6.5, "stock": 60, "category": "饮料"}
print(f"\\n添加了: 牛奶")

# 3. 修改价格
inventory["苹果"]["price"] = 5.5
print(f"苹果价格调整为: {inventory['苹果']['price']}")

# 4. 用 get 安全查询
item = "饼干"
info = inventory.get(item)
if info:
    print(f"{item} 库存: {info['stock']}")
else:
    print(f"{item} 不在库存中")

# 5. 用推导式筛选
print("\\n--- 库存低于 50 的商品 ---")
low_stock = {name: info["stock"] for name, info in inventory.items() if info["stock"] < 50}
for name, stock in low_stock.items():
    print(f"  {name}: 仅剩 {stock}")

# 6. 按类别分组
print("\\n--- 按类别分组 ---")
from collections import defaultdict
by_category = defaultdict(list)
for name, info in inventory.items():
    by_category[info["category"]].append(name)

for cat, items in by_category.items():
    print(f"{cat}: {', '.join(items)}")

# 7. 计算总库存价值
print("\\n--- 库存价值统计 ---")
total_value = sum(info["price"] * info["stock"] for info in inventory.values())
print(f"总库存价值: {total_value:.2f} 元")

# 8. 按库存价值排序
print("\\n--- 商品库存价值排名 ---")
values = {name: info["price"] * info["stock"] for name, info in inventory.items()}
for name, value in sorted(values.items(), key=lambda x: x[1], reverse=True):
    print(f"  {name}: {value:.2f} 元")

# 9. 用 setdefault 统计类别数
print("\\n--- 类别统计 ---")
category_count = {}
for info in inventory.values():
    cat = info["category"]
    category_count[cat] = category_count.get(cat, 0) + 1
for cat, count in category_count.items():
    print(f"  {cat}: {count} 种商品")
\`\`\`

这段 demo 综合用了：嵌套字典、get、推导式、defaultdict、sum 配合生成器、sorted 配合 key。**是字典在数据管理中的典型应用**。

## ⚠️ 初学者常见坑

### 坑一：遍历时修改字典

\`\`\`python
d = {"a": 1, "b": 2, "c": 3}

# 错误：遍历时删除会报错
# for key in d:
#     if d[key] < 2:
#         del d[key]    # RuntimeError: dictionary changed size during iteration

# 正确：先收集要删的键，再统一删
to_delete = [k for k, v in d.items() if v < 2]
for k in to_delete:
    del d[k]
print(d)    # {'b': 2, 'c': 3}

# 或者用推导式重建
d = {k: v for k, v in d.items() if v >= 2}
\`\`\`

### 坑二：fromkeys 用可变默认值

\`\`\`python
# 错误
d = dict.fromkeys(["a", "b"], [])
d["a"].append(1)
print(d)    # {'a': [1], 'b': [1]}（b 也变了！）

# 正确：用推导式
d = {k: [] for k in ["a", "b"]}
d["a"].append(1)
print(d)    # {'a': [1], 'b': []}
\`\`\`

### 坑三：用列表当键

\`\`\`python
# 错误：列表不可哈希
# d = { [1, 2]: "value" }    # TypeError

# 正确：用元组
d = { (1, 2): "value" }
\`\`\`

### 坑四：直接访问不存在的键

\`\`\`python
d = {"name": "张三"}
# print(d["age"])    # KeyError

# 用 get 安全访问
age = d.get("age", 0)
print(age)    # 0
\`\`\`

## 小结

- 字典用 \`{}\` 创建，键值对存储，键唯一、可变、有序（3.7+）
- 键必须可哈希：字符串、数字、元组可以；列表、字典不行
- 访问：\`d[key]\`（不存在抛 KeyError）、\`d.get(key, default)\`（安全）
- 增改：\`d[key] = value\`、\`update()\`、\`setdefault()\`
- 删：\`pop(key)\`（返回值）、\`popitem()\`、\`del d[key]\`、\`clear()\`
- 遍历：\`for k, v in d.items()\` 最常用
- 视图：\`keys()\`、\`values()\`、\`items()\` 是动态视图，支持集合操作
- 字典推导式：\`{k: v for k, v in items if cond}\`
- 合并：\`{**d1, **d2}\` 或 \`d1 | d2\`（3.9+）
- 嵌套字典访问要安全：用 \`get\` 链或 try/except

## 常见疑问 Q&A

**Q：字典的键可以是什么类型？**
A：任何**可哈希**的类型——字符串、数字、元组（元组里不能有可变对象）。列表、字典、集合不可哈希，不能作键。

**Q：\`d[key]\` 和 \`d.get(key)\` 区别？**
A：\`d[key]\` 键不存在抛 KeyError；\`d.get(key)\` 返回 None（或指定默认值）。不确定键是否存在时用 get。

**Q：字典是有序的吗？**
A：Python 3.7+ 字典保持插入顺序。早期版本（3.6 及之前）不保证顺序，需要用 \`OrderedDict\`。

**Q：怎么合并两个字典？**
A：\`{**d1, **d2}\`（3.5+）返回新字典；\`d1 | d2\`（3.9+）更直观；\`d1.update(d2)\` 原地修改。冲突的键用后者的值。`
  },

  // -----------------------------------------------------------
  // 第十章：集合与冻结集合
  // -----------------------------------------------------------
  {
    id: "py10-ch10",
    group: "第二部分 数据类型与字符串",
    icon: "🔢",
    title: "第十章 集合与冻结集合",
    content: `## 集合是什么

**集合**（set）是一个"无序、不重复"的容器，主要用于**去重**和**成员判断**。

\`\`\`python
# 集合用花括号 {} 创建（注意：{} 是空字典，不是空集合！）
fruits = {"apple", "banana", "cherry"}
print(fruits)    # {'cherry', 'banana', 'apple'}（顺序不定）

# 空集合必须用 set() 创建
empty = set()
print(type(empty))    # <class 'set'>

# ⚠️ {} 是空字典，不是空集合！
wrong = {}
print(type(wrong))    # <class 'dict'>
\`\`\`

**集合的特点**：
- **无序**：元素没有固定顺序
- **不重复**：相同元素只保留一个
- **可变**：可以增删元素
- **元素必须可哈希**：和字典键一样

## 集合创建

### 直接创建

\`\`\`python
# 字面量创建
s = {1, 2, 3, 4, 5}
print(s)    # {1, 2, 3, 4, 5}

# 自动去重
s = {1, 2, 2, 3, 3, 3}
print(s)    # {1, 2, 3}
\`\`\`

### set() 函数

\`\`\`python
# 从列表去重
nums = [1, 2, 2, 3, 3, 3, 4]
unique = set(nums)
print(unique)             # {1, 2, 3, 4}
print(list(unique))       # [1, 2, 3, 4]（顺序不定）

# 从字符串创建
print(set("hello"))       # {'h', 'e', 'l', 'o'}（l 只保留一个）

# 从元组创建
print(set((1, 2, 3)))     # {1, 2, 3}

# 从字典创建（用键）
print(set({"a": 1, "b": 2}))    # {'a', 'b'}
\`\`\`

### 集合推导式

\`\`\`python
# 集合推导式：{expr for item in iterable}
squares = {x**2 for x in range(-3, 4)}
print(squares)    # {0, 1, 4, 9}（自动去重，平方相同的合并）

# 带条件
evens = {x for x in range(20) if x % 2 == 0}
print(evens)      # {0, 2, 4, 6, 8, 10, 12, 14, 16, 18}
\`\`\`

## 集合的增删改

### 增加元素

\`\`\`python
s = {1, 2, 3}

# add: 添加单个元素
s.add(4)
print(s)    # {1, 2, 3, 4}

# 添加已存在的元素，集合不变
s.add(2)
print(s)    # {1, 2, 3, 4}（2 已经存在）

# update: 批量添加（接受任何可迭代对象）
s.update([5, 6, 7])
print(s)    # {1, 2, 3, 4, 5, 6, 7}

s.update({8, 9})
print(s)    # {1, 2, 3, 4, 5, 6, 7, 8, 9}

s.update("ab")    # 字符串也是可迭代对象
print(s)    # {1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b'}
\`\`\`

### 删除元素

\`\`\`python
s = {1, 2, 3, 4, 5}

# remove: 删除指定元素，不存在报错
s.remove(3)
print(s)    # {1, 2, 4, 5}
# s.remove(99)    # KeyError: 99

# discard: 删除指定元素，不存在不报错
s.discard(99)    # 不报错
print(s)         # {1, 2, 4, 5}

# pop: 随机删除并返回一个元素（集合无序，所以是"随机"）
removed = s.pop()
print(removed)   # 比如返回 1
print(s)         # {2, 4, 5}

# clear: 清空
s.clear()
print(s)         # set()
\`\`\`

**remove vs discard**：
- \`remove(elem)\`：不存在抛 KeyError
- \`discard(elem)\`：不存在静默返回 None

不确定元素是否存在时用 \`discard\` 更安全。

## 集合运算

集合最强大的特性是支持数学集合运算。

### 并集 union（|）

\`\`\`python
a = {1, 2, 3}
b = {3, 4, 5}

# | 运算符
print(a | b)         # {1, 2, 3, 4, 5}

# union 方法（等价）
print(a.union(b))    # {1, 2, 3, 4, 5}

# union 可以接受任何可迭代对象
print(a.union([4, 5, 6]))    # {1, 2, 3, 4, 5, 6}
\`\`\`

### 交集 intersection（&）

\`\`\`python
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

# & 运算符
print(a & b)               # {3, 4}

# intersection 方法
print(a.intersection(b))   # {3, 4}

# 多个集合交集
c = {4, 5, 6, 7}
print(a & b & c)           # {4}
\`\`\`

### 差集 difference（-）

\`\`\`python
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

# - 运算符：在 a 但不在 b
print(a - b)               # {1, 2}

# difference 方法
print(a.difference(b))     # {1, 2}

# 注意：a - b 和 b - a 不一样
print(b - a)               # {5, 6}
\`\`\`

### 对称差 symmetric_difference（^）

\`\`\`python
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

# ^ 运算符：只在 a 或只在 b，不同时在
print(a ^ b)                          # {1, 2, 5, 6}

# symmetric_difference 方法
print(a.symmetric_difference(b))      # {1, 2, 5, 6}

# 等价于 (a - b) | (b - a)
print((a - b) | (b - a))              # {1, 2, 5, 6}
\`\`\`

### 集合运算汇总

| 运算 | 运算符 | 方法 | 含义 |
|------|--------|------|------|
| 并集 | \`a \\| b\` | \`a.union(b)\` | 在 a 或在 b |
| 交集 | \`a & b\` | \`a.intersection(b)\` | 同时在 a 和 b |
| 差集 | \`a - b\` | \`a.difference(b)\` | 在 a 但不在 b |
| 对称差 | \`a ^ b\` | \`a.symmetric_difference(b)\` | 只在 a 或只在 b |

**运算符 vs 方法的区别**：
- 运算符（\`| & - ^\`）两边必须是集合
- 方法（\`union\`、\`intersection\` 等）可以接受任何可迭代对象

\`\`\`python
a = {1, 2, 3}
# a | [4, 5]    # TypeError: 运算符要求两边都是集合
a.union([4, 5])    # {1, 2, 3, 4, 5}（方法可以接受列表）
\`\`\`

## 子集与超集

\`\`\`python
a = {1, 2}
b = {1, 2, 3, 4}

# issubset: a 是否是 b 的子集
print(a.issubset(b))        # True（a 的元素都在 b 里）

# issuperset: b 是否是 a 的超集
print(b.issuperset(a))      # True（b 包含 a 的所有元素）

# isdisjoint: 是否没有交集
print(a.isdisjoint({5, 6}))    # True（没有共同元素）
print(a.isdisjoint({2, 5}))    # False（有共同元素 2）
\`\`\`

### 用运算符判断子集

\`\`\`python
a = {1, 2}
b = {1, 2, 3, 4}

# <= 真子集（a 是 b 的子集，且 a != b）
print(a <= b)    # True
print(a < b)     # True（a 是 b 的真子集，a != b）

# >= 超集
print(b >= a)    # True
print(b > a)     # True

# == 相等
print({1, 2} == {2, 1})    # True（顺序无所谓）
\`\`\`

## 集合的实际应用

### 1. 去重

\`\`\`python
# 列表去重
nums = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
unique = list(set(nums))
print(unique)    # [1, 2, 3, 4]（顺序不定）

# 保持顺序的去重
def dedupe_keep_order(lst):
    seen = set()
    result = []
    for item in lst:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result

nums = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
print(dedupe_keep_order(nums))    # [3, 1, 4, 5, 9, 2, 6]
\`\`\`

### 2. 成员判断（比列表快得多）

\`\`\`python
# 列表 in 操作是 O(n)，集合 in 操作是 O(1)
# 数据量大时差距明显

# 慢：在列表里查找
valid_emails = ["a@b.com", "c@d.com", "e@f.com", ...]  # 假设有 100 万个
# if "x@y.com" in valid_emails:    # O(n)，要遍历整个列表

# 快：用集合
valid_emails_set = set(valid_emails)
# if "x@y.com" in valid_emails_set:    # O(1)，瞬间查找
\`\`\`

### 3. 找两个列表的差异

\`\`\`python
old_users = {"alice", "bob", "charlie", "david"}
new_users = {"bob", "charlie", "eve", "frank"}

# 新增的用户
added = new_users - old_users
print(f"新增: {added}")    # {'eve', 'frank'}

# 删除的用户
removed = old_users - new_users
print(f"删除: {removed}")    # {'alice', 'david'}

# 保留的用户
kept = old_users & new_users
print(f"保留: {kept}")    # {'bob', 'charlie'}
\`\`\`

### 4. 统计两个列表的共同元素

\`\`\`python
list1 = [1, 2, 3, 4, 5]
list2 = [4, 5, 6, 7, 8]

common = set(list1) & set(list2)
print(common)    # {4, 5}

# 只在 list1 的
only_list1 = set(list1) - set(list2)
print(only_list1)    # {1, 2, 3}
\`\`\`

## frozenset：冻结集合

普通集合（set）是**可变**的，不能作字典键。\`frozenset\` 是**不可变**的集合，可以作字典键。

\`\`\`python
# 创建 frozenset
fs = frozenset([1, 2, 3])
print(fs)              # frozenset({1, 2, 3})
print(type(fs))        # <class 'frozenset'>

# frozenset 不可变
# fs.add(4)    # AttributeError: 'frozenset' object has no attribute 'add'

# 支持集合运算（返回新 frozenset）
fs2 = frozenset([3, 4, 5])
print(fs | fs2)        # frozenset({1, 2, 3, 4, 5})
print(fs & fs2)        # frozenset({3})

# frozenset 可以作字典键（set 不行）
d = {frozenset([1, 2]): "值"}
print(d[frozenset([1, 2])])    # 值
\`\`\`

### frozenset 的实际用途

\`\`\`python
# 1. 作字典键
graph = {
    frozenset({"A", "B"}): 1,    # 无向图的边
    frozenset({"B", "C"}): 2,
}
print(graph[frozenset({"B", "A"})])    # 1（顺序无关）

# 2. 缓存的键
def expensive_query(params):
    cache = {}
    key = frozenset(params.items())    # 把字典转成 frozenset 作键
    if key in cache:
        return cache[key]
    result = "查询结果"
    cache[key] = result
    return result

# 3. 不可变的全局常量
ALLOWED_EXTENSIONS = frozenset([".jpg", ".png", ".gif", ".webp"])
# 后续代码不会误修改这个集合
\`\`\`

## 综合实战 demo

\`\`\`python
# ============================================
# 第十章综合 demo：用户标签系统
# 演示：集合运算、去重、成员判断
# ============================================

# 用户兴趣标签
user_tags = {
    "alice": {"python", "java", "music", "travel"},
    "bob": {"python", "javascript", "music", "movie"},
    "charlie": {"java", "music", "book", "travel"},
    "david": {"python", "travel", "photo"},
    "eve": {"javascript", "music", "movie", "book"},
}

# 1. 所有出现过的标签
all_tags = set()
for tags in user_tags.values():
    all_tags.update(tags)
print(f"所有标签: {all_tags}")
print(f"标签总数: {len(all_tags)}")

# 2. alice 和 bob 的共同兴趣
common = user_tags["alice"] & user_tags["bob"]
print(f"\\nalice 和 bob 共同兴趣: {common}")

# 3. alice 独有的兴趣（其他人都没有）
others_tags = set()
for name, tags in user_tags.items():
    if name != "alice":
        others_tags.update(tags)
alice_unique = user_tags["alice"] - others_tags
print(f"alice 独有的兴趣: {alice_unique}")

# 4. 所有用户都有的兴趣
common_all = user_tags["alice"].copy()
for tags in user_tags.values():
    common_all &= tags
print(f"所有用户都有的兴趣: {common_all}")

# 5. 找兴趣最相似的两个用户
print("\\n--- 用户兴趣相似度 ---")
users = list(user_tags.keys())
max_similarity = 0
most_similar = None
for i in range(len(users)):
    for j in range(i + 1, len(users)):
        u1, u2 = users[i], users[j]
        common_count = len(user_tags[u1] & user_tags[u2])
        if common_count > max_similarity:
            max_similarity = common_count
            most_similar = (u1, u2)
        print(f"{u1} & {u2}: {common_count} 个共同兴趣")

print(f"\\n最相似: {most_similar}（{max_similarity} 个共同兴趣）")

# 6. 给 alice 推荐：bob 有但 alice 没有的兴趣
recommend = user_tags["bob"] - user_tags["alice"]
print(f"\\n给 alice 推荐: {recommend}")

# 7. 统计每个标签有多少用户喜欢
print("\\n--- 标签热度 ---")
tag_users = {}
for name, tags in user_tags.items():
    for tag in tags:
        tag_users.setdefault(tag, set()).add(name)

# 按热度排序
for tag, users_who_like in sorted(tag_users.items(), key=lambda x: len(x[1]), reverse=True):
    print(f"  {tag}: {len(users_who_like)} 人 -> {users_who_like}")
\`\`\`

这段 demo 综合用了：集合的并集、交集、差集、update、setdefault、sorted 配合 key。**是集合运算在用户画像分析中的典型应用**。

## ⚠️ 初学者常见坑

### 坑一：{} 是空字典不是空集合

\`\`\`python
empty_dict = {}
empty_set = set()

print(type(empty_dict))    # <class 'dict'>
print(type(empty_set))     # <class 'set'>
\`\`\`

### 坑二：集合元素必须可哈希

\`\`\`python
# 错误：列表不可哈希
# s = { [1, 2], [3, 4] }    # TypeError

# 正确：用元组
s = { (1, 2), (3, 4) }
print(s)    # {(1, 2), (3, 4)}
\`\`\`

### 坑三：集合无序

\`\`\`python
s = {3, 1, 4, 1, 5, 9, 2, 6}
print(s)    # 顺序不定，可能是 {1, 2, 3, 4, 5, 6, 9}

# 不要依赖顺序！需要有序用列表
\`\`\`

### 坑四：遍历时修改集合

\`\`\`python
s = {1, 2, 3, 4, 5}

# 错误：遍历时删除会报错
# for x in s:
#     if x % 2 == 0:
#         s.remove(x)    # RuntimeError

# 正确：用推导式重建
s = {x for x in s if x % 2 != 0}
print(s)    # {1, 3, 5}
\`\`\`

## 何时用集合

| 场景 | 推荐数据结构 |
|------|--------------|
| 去重 | 集合（\`set(list)\`） |
| 成员判断（频繁的 \`in\` 操作） | 集合（O(1)）vs 列表（O(n)） |
| 交集、并集、差集运算 | 集合 |
| 需要保持顺序 | 列表 |
| 需要键值对 | 字典 |
| 不可变集合（作字典键） | frozenset |

**性能对比**：

\`\`\`python
import time

# 创建大列表和大集合
big_list = list(range(1000000))
big_set = set(big_list)

# 列表查找（慢）
start = time.time()
for _ in range(100):
    _ = 999999 in big_list
list_time = time.time() - start

# 集合查找（快）
start = time.time()
for _ in range(100):
    _ = 999999 in big_set
set_time = time.time() - start

print(f"列表查找 100 次: {list_time:.4f} 秒")
print(f"集合查找 100 次: {set_time:.4f} 秒")
print(f"集合快 {list_time / set_time:.0f} 倍")
\`\`\`

10 万级以上的数据做成员判断，**集合比列表快几百倍**。

## 小结

- 集合用 \`{}\` 创建，无序、不重复、可变；空集合必须用 \`set()\`
- 元素必须可哈希（字符串、数字、元组可以，列表不行）
- 增：\`add\`（单个）、\`update\`（批量）
- 删：\`remove\`（不存在报错）、\`discard\`（不存在不报错）、\`pop\`、\`clear\`
- 集合运算：\`|\` 并集、\`&\` 交集、\`-\` 差集、\`^\` 对称差
- 子集判断：\`issubset\`、\`issuperset\`、\`isdisjoint\`，或运算符 \`<= < >= >\`
- 主要用途：去重、成员判断（O(1)）、集合运算
- \`frozenset\` 是不可变集合，可作字典键
- 大数据量成员判断用集合，比列表快几百倍

## 常见疑问 Q&A

**Q：集合和列表怎么选？**
A：需要去重、频繁 \`in\` 判断、集合运算时用集合；需要保持顺序、按索引访问、允许重复时用列表。

**Q：\`{}\` 是空集合吗？**
A：不是！\`{}\` 是空字典。空集合必须用 \`set()\` 创建。

**Q：为什么集合元素必须可哈希？**
A：集合用哈希表实现，元素存进集合时计算哈希值定位。可变对象（如列表）哈希值会变，无法稳定存储，所以不能作集合元素。

**Q：frozenset 和 set 区别？**
A：frozenset 不可变（不能增删改），可作字典键和集合元素；set 可变，不能作字典键。需要"不可变集合"时用 frozenset。

**Q：怎么保持顺序去重？**
A：用 \`dict.fromkeys(lst).keys()\`（3.7+ 字典有序）或手写 \`seen = set(); [x for x in lst if not (x in seen or seen.add(x))]\`。`
  }
];
