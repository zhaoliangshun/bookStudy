// =============================================================
// Batch 2：数字与字符串（4 章）
// 1. py5-numbers   数字类型与数学运算
// 2. py5-strings   字符串（f-string 3.12 嵌套引号）
// 3. py5-regex     正则表达式 re 模块
// 4. py5-bytes     bytes/bytearray 与编解码
// =============================================================

export const chapters = [
  {
    id: "py5-numbers",
    group: "数字与字符串",
    icon: "🔢",
    title: "数字类型与数学运算",
    content: `
## 概述
Python 的数字类型设计有几个亮点：整数是任意精度（不会溢出）、浮点是 IEEE 754 双精度、还内置复数支持。理解这些类型和 \`math\` / \`decimal\` 模块的边界，能避免金融计算、科学计算中的精度问题。

## 核心要点
- **三类数字**：
  - \`int\`：整数，**任意精度**，\`2 ** 100\` 不会溢出
  - \`float\`：双精度浮点（64 位），有精度限制
  - \`complex\`：复数，\`1 + 2j\`，\`j\` 是虚数单位
- **进制字面量**：\`0b1010\`（二进制）、\`0o77\`（八进制）、\`0xFF\`（十六进制）
- **特殊浮点值**：\`float("inf")\` 正无穷；\`float("nan")\` 非数值；\`math.isinf()\` / \`math.isnan()\` 判断
- **\`math\` 模块**：\`pi\` / \`e\` 常量；\`sqrt/ceil/floor/gcd/factorial/log/sin\` 等函数
- **\`decimal.Decimal\`**：高精度十进制，适合金融；可设精度 \`getcontext().prec = 20\`
- **\`fractions.Fraction\`**：分数运算（如 \`Fraction(1, 3) + Fraction(1, 6)\`）

## 原理与机制
- **整数任意精度**：Python 3 的 \`int\` 自动扩展位数，没有 C 那种溢出问题，但运算成本随位数增长
- **浮点陷阱**：\`0.1 + 0.2 != 0.3\`（二进制无法精确表示 0.1），用 \`math.isclose(a, b)\` 比较
- **\`Decimal\` vs \`float\`**：\`Decimal("0.1") + Decimal("0.2") == Decimal("0.3")\` 为 \`True\`，因为十进制内部用整数存储
- **\`//\` 对浮点**：\`7.0 // 2\` = \`3.0\`，结果仍为 float

## 易错点与陷阱
- **浮点比较**：永远不要用 \`==\` 比较浮点，用 \`math.isclose(a, b, rel_tol=1e-9)\`
- **\`Decimal\` 必须传字符串**：\`Decimal(0.1)\` 已经丢失精度，必须 \`Decimal("0.1")\`
- **\`int(\"0x10\", 16)\`**：\`int()\` 第二参数指定进制，否则只解析十进制
- **\`pow(a, b, mod)\`** 比 \`a ** b % mod\` 快得多（模幂运算，用于密码学）

## 实战建议
- 金融/货币计算用 \`Decimal\`，避免浮点误差累积
- 大数运算（密码学、RSA）直接用 \`int\`，自带任意精度
- 科学计算大量数据用 \`numpy\`（外部库）替代 \`math\`，性能更高
- 判断 NaN 用 \`math.isnan(x)\`，不能 \`x == float("nan")\`（NaN 不等于自己）
`,
    code: `import math
from decimal import Decimal, getcontext

# int / float / complex
a = 42
b = 3.14
c = 1 + 2j
print(type(a).__name__, type(b).__name__, type(c).__name__)
print("复数运算:", c * c)

# 不同进制字面量
print("bin/hex/oct:", 0b1010, 0xFF, 0o77)

# math 模块常用函数
print("pi:", math.pi)
print("sqrt(2):", math.sqrt(2))
print("ceil/floor:", math.ceil(3.2), math.floor(3.9))
print("gcd:", math.gcd(48, 18))
print("factorial(5):", math.factorial(5))

# Decimal 精确计算
getcontext().prec = 20
d1 = Decimal("0.1")
d2 = Decimal("0.2")
print("Decimal 0.1+0.2 =", d1 + d2)
print("float 0.1+0.2 =", 0.1 + 0.2)

# inf / nan
inf = float("inf")
nan = float("nan")
print("inf+1:", inf + 1, "1/inf:", 1 / inf)
print("isnan:", math.isnan(nan), "isinf:", math.isinf(inf))
`,
  },
  {
    id: "py5-strings",
    group: "数字与字符串",
    icon: "🔤",
    title: "字符串处理",
    content: `
## 概述
字符串是 Python 最常用的数据类型之一，从日志输出、文件读写到 Web 接口拼接都离不开它。Python 3 把文本明确区分为 \`str\`（文本）和 \`bytes\`（字节），并且 3.12+ 的 f-string（PEP 701）允许同类型引号嵌套，写起来更顺手。掌握切片、方法库和格式化，是高效处理文本的基础。

## 核心要点
- **多种引号**：\`'a'\`、\`"a"\`、\`'''多行'''\`、\`"""多行"""\`，三引号保留换行
- **原始字符串 \`r""\`**：反斜杠不转义，写正则/路径时常用：\`r"C:\\Users"\`
- **f-string (PEP 701)**：3.12+ 支持嵌套同类型引号，\`f"{d["key"]}"\` 不再报错
- **f-string 调试**：\`f"{x=}"\` 自动打印变量名与值，调试很方便
- **切片 \`s[start:stop:step]\`**：负步长可反转字符串 \`s[::-1]\`
- **常用方法**：
  - \`strip()\` / \`lstrip()\` / \`rstrip()\` 去空白或指定字符
  - \`split(sep, maxsplit)\` 按分隔符切分返回 list
  - \`sep.join(list)\` 高效拼接（比 \`+\` 快）
  - \`replace(old, new, count)\` 替换
  - \`find(sub)\` 返回下标，找不到返回 \`-1\`（\`index()\` 找不到抛异常）
  - \`startswith()\` / \`endswith()\` 前缀后缀判断
- **大小写转换**：\`upper()\` / \`lower()\` / \`title()\` / \`capitalize()\` / \`swapcase()\`
- **格式化对齐**：\`"{:<10}"\` 左对齐、\`"{:^10}"\` 居中、\`"{:>10}"\` 右对齐、\`"{:0>5}"\` 补零
- **不可变性**：字符串不能原地修改，所有"修改"方法都返回新字符串

## 原理与机制
- **Unicode 存储**：Python 3 字符串以 Unicode 码点存储，\`len("中")\` 为 \`1\` 而非字节数
- **\`join\` 比 \`+\` 快**：\`+\` 拼接每次都生成新对象并复制数据，\`join\` 一次算出总长再分配
- **f-string 编译期解析**：3.12 起 f-string 走真正的语法解析器，不再是子串拼接，能正确处理嵌套引号和多行
- **\`split()\` 无参行为**：\`s.split()\` 按任意空白切分且去空串，与 \`s.split(" ")\` 不同
- **\`find\` vs \`index\`**：区别仅在找不到时的行为——返回 \`-1\` 还是抛 \`ValueError\`

## 易错点与陷阱
- **字符串不可变**：\`s[0] = "x"\` 会抛 \`TypeError\`，需 \`s = "x" + s[1:]\` 或转 list
- **\`split(" ")\` vs \`split()\`**：\`"a  b".split(" ")\` 得 \`['a', '', 'b']\`，\`split()\` 得 \`['a', 'b']\`
- **f-string 老版本兼容**：3.11 及更早写 \`f"{d['k']}"\` 必须换引号；嵌套同类型只在 3.12+ 才合法
- **\`strip\` 误用**：\`strip("ab")\` 是去掉两端的 a 或 b（字符集合），不是去掉子串 \`"ab"\`

## 实战建议
- 拼接大段文本优先用 \`"".join(parts)\`，不要用 \`+=\` 循环
- 写正则和 Windows 路径一律加 \`r\` 前缀，避免转义陷阱
- 需要安全查找时用 \`find\`，需要"找不到就报错"时用 \`index\`
- Python 3.13 项目大胆用 PEP 701 嵌套引号，老项目兼容则保持外双内单的写法
`,
    code: `# 多行字符串 & 原始字符串
multi = """第一行
第二行"""
print("多行:")
print(multi)
print("原始字符串 r:", r"C:\\Users\\name")

# f-string 3.12+ 嵌套引号 (PEP 701)：同一对引号内可以再用同类型引号
# Python 3.12 之前 dict 访问得换引号：f"score={user['name']}"
user = {"name": "Alice", "age": 30, "lang": "Python"}
print(f"用户 {user["name"]} 年龄 {user["age"]}，学{user["lang"]}")
print(f"计算：{2 ** 10 = }")

# 切片
s = "Hello, Python!"
print("s[0:5]:", s[0:5])
print("s[7:]:", s[7:])
print("s[::-1]:", s[::-1])
print("s[::2]:", s[::2])

# 常用方法
text = "  Hello World  "
print("strip:", repr(text.strip()))
print("split:", "a,b,c".split(","))
print("join:", "-".join(["a", "b", "c"]))
print("replace:", text.replace("World", "Python").strip())
print("find:", "hello world".find("world"))
print("startswith:", "https://x.com".startswith("https"))
print("endswith:", "photo.png".endswith(".png"))
print("upper/lower/title:", "hello python".upper(), "HELLO".lower(), "hello world".title())

# format 对齐
print("{:<10}|{:^10}|{:>10}".format("left", "center", "right"))
`,
  },
  {
    id: "py5-regex",
    group: "数字与字符串",
    icon: "🔍",
    title: "正则表达式",
    content: `
## 概述
正则表达式是处理文本模式匹配的利器，Python 通过 \`re\` 模块提供支持。无论是数据提取（手机号、邮箱）、批量替换还是日志解析，正则都能显著简化代码。但正则也容易"写时一时爽、维护火葬场"，需要明确 \`match\` / \`search\` / \`findall\` 的语义差异，并坚持用原始字符串 \`r""\` 避免转义陷阱。

## 核心要点
- **核心函数**：
  - \`re.match(pattern, s)\`：仅从字符串**开头**匹配
  - \`re.search(pattern, s)\`：扫描整个串找**第一个**匹配
  - \`re.findall(pattern, s)\`：返回所有匹配的**列表**
  - \`re.finditer(pattern, s)\`：返回匹配对象的**迭代器**（省内存）
  - \`re.sub(pattern, repl, s)\`：替换所有匹配
  - \`re.split(pattern, s)\`：按模式切分字符串
- **分组提取**：用 \`()\` 捕获分组，\`m.group(1)\` 取第 1 组，\`m.group(0)\` 取整体
- **命名分组**：\`(?P<name>\\d+)\`，用 \`m.group("name")\` 取值
- **原始字符串**：写正则一律加 \`r\` 前缀，\`r"\\d+"\` 比 \`"\\\\d+"\` 清晰
- **预编译**：\`re.compile(pattern)\` 提升循环里多次匹配的性能
- **常见字符类**：\`\\d\` 数字、\`\\w\` 单词字符、\`\\s\` 空白、\`\\.\` 任意位置字符（注意需转义）
- **量词**：\`*\` 0+、\`+\` 1+、\`?\` 0/1、\`{m,n}\` m~n 次

## 原理与机制
- **\`match\` vs \`search\`**：\`match\` 隐式锚定开头，等价于加了 \`^\`；\`search\` 任意位置都可
- **\`findall\` 返回类型**：无分组返回字符串列表；有分组返回元组列表；只有 1 个分组返回该组字符串列表
- **\`sub\` 反向引用**：替换串里 \`\\1\` 引用第 1 个分组，配合 \`r""\` 写成 \`r"\\1"\`
- **贪婪 vs 非贪婪**：\`.*\` 默认贪婪（吃最多），\`.*?\` 非贪婪（吃最少），提取标签内容时一定要加 \`?\`
- **回溯成本**：嵌套量词（如 \`(a+)+\`）可能引发灾难性回溯，处理大文本需警惕

## 易错点与陷阱
- **忘记加 \`r\`**：写 \`"\\d+"\` 需双反斜杠，漏写会触发 DeprecationWarning；统一用 \`r"\\d+"\` 最稳
- **\`match\` 不会自动锚定结尾**：\`re.match(r"\\d+", "123abc")\` 也会成功，需手动加 \`$\`
- **\`findall\` 返回值多变**：分组存在时返回元组列表，容易写出错的取值代码
- **特殊字符未转义**：\`re.split(".", "a.b")\` 返回 \`['', '', '', '']\`，要转义成 \`re.split(r"\\.", s)\`

## 实战建议
- 任何正则一律加 \`r\` 前缀，杜绝双反斜杠地狱
- 需要复用的正则用 \`re.compile\` 预编译，循环里能少一次解析开销
- 复杂正则加 \`re.VERBOSE\` 标志，把量词和分组分行对齐书写，方便后续维护
- 验证邮箱/手机号用 \`re.match\` + \`$\` 锚定结尾，避免局部匹配通过
`,
    code: `import re

# re.search vs re.match
text = "电话: 13812345678, 邮箱: test@example.com"
print("search 数字:", re.search(r"\\d+", text).group())
print("match 从头:", re.match(r"\\d+", text))  # None，不是数字开头

# re.findall 找所有数字
phones = re.findall(r"1[3-9]\\d{9}", text)
print("phones:", phones)

# 分组提取
m = re.search(r"(\\w+)@(\\w+\\.\\w+)", text)
if m:
    print("邮箱用户名:", m.group(1), "域名:", m.group(2))
    print("全部:", m.group(0))

# re.sub 替换
masked = re.sub(r"1[3-9]\\d{5}(\\d{4})", r"138****\\1", text)
print("打码:", masked)

# re.split 按分隔符切分
parts = re.split(r"[,\\s]+", "a, b  c   d,e")
print("split:", parts)

# 常用模式
email_pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$"
print("邮箱验证:", bool(re.match(email_pattern, "user@test.com")))
print("邮箱验证 bad:", bool(re.match(email_pattern, "bad-email")))

# finditer 迭代
for match in re.finditer(r"\\d+", "a1b22c333"):
    print(f"  位置 {match.start()}-{match.end()}: {match.group()}")
`,
  },
  {
    id: "py5-bytes",
    group: "数字与字符串",
    icon: "📟",
    title: "bytes 与 bytearray",
    content: `
## 概述
\`bytes\` 是字节序列（每个元素是 0-255 的整数），\`bytearray\` 是其可变版本；它们和 \`str\` 之间通过 \`encode\` / \`decode\` 互转。理解二进制数据对网络通信、文件 IO、加密（base64/hex）至关重要——Python 3 严格区分文本与字节，正是为了避免"乱码从哪来"的迷惑。

## 核心要点
- **字面量**：\`b"hello"\` 是 \`bytes\`；\`bytearray(b"hello")\` 创建可变版本
- **元素类型**：\`b[0]\` 返回 \`int\`（不是 \`str\`），\`b[0:1]\` 才返回长度 1 的 bytes
- **\`encode\` / \`decode\`**：
  - \`"文本".encode("utf-8")\` → \`bytes\`
  - \`b"\\xe4".decode("utf-8")\` → \`str\`
- **编码差异**：UTF-8 中文 3 字节、GBK 中文 2 字节，\`len("你".encode())\` 取决于编码
- **\`hex\` 转换**：\`b"\\xde\\xad".hex()\` → \`"dead"\`；\`bytes.fromhex("dead")\` 反向
- **\`base64\` 模块**：\`b64encode\` 编码、\`b64decode\` 解码，常用于二进制转 ASCII 安全传输
- **bytearray 操作**：\`ba[i] = 65\`、\`ba.append(65)\`、\`ba.extend(b"...")\`，类似 \`list\`
- **格式化限制**：\`f"{b'abc'}"\` 输出 \`b'abc'\`，不能直接拼到字符串里，需先 \`decode\`

## 原理与机制
- **str vs bytes 内存**：\`str\` 存 Unicode 码点；\`bytes\` 存原始字节，二者不能直接拼接（抛 \`TypeError\`）
- **默认编码 UTF-8**：\`encode()\` / \`decode()\` 不传参默认 UTF-8，Python 3 源码也是 UTF-8
- **不可变 vs 可变**：\`bytes\` 是不可变序列（像 \`tuple\`）；\`bytearray\` 可原地修改（像 \`list\`）
- **\`b"\\xff"\` 与 \`chr(255)\`**：字节字面量等价于 \`bytes([255])\`，每个字节就是 0-255 的整数
- **编码可逆性**：能 decode 的 bytes 一定能 encode 回去；但 encode 出错的字符会触发 \`UnicodeEncodeError\`

## 易错点与陷阱
- **bytes 元素是 int**：\`b"A"[0]\` 得 \`65\`（不是 \`"A"\`），\`chr(65)\` 才转回字符
- **拼接 str 与 bytes**：\`"x" + b"y"\` 抛 \`TypeError\`，必须显式 \`decode\` 或 \`encode\`
- **GBK 不支持 emoji**：\`"😊".encode("gbk")\` 抛 \`UnicodeEncodeError\`，必须用 UTF-8
- **decode 错误处理**：传 \`errors="ignore"\` / \`errors="replace"\` 容错，默认 \`strict\` 抛异常

## 实战建议
- 处理文件 / 网络二进制数据统一用 \`bytes\`，文本读写让 \`open()\` 默认处理编解码
- 网络协议（HTTP body、二进制协议）用 \`bytearray\` 增量拼装，比 \`bytes +=\` 高效
- 跨语言/平台交换中文优先 UTF-8，避免 GBK 在 emoji、生僻字上的兼容性问题
- 加密场景（hash / base64）输入必须是 \`bytes\`，养成 \`text.encode()\` 的肌肉记忆
`,
    code: `import base64

# bytes 字面量
b = b"hello"
print("bytes:", b, "len:", len(b), "第一个字节:", b[0])

# bytearray 可变
ba = bytearray(b"hello")
ba[0] = ord("H")
ba.append(ord("!"))
print("bytearray:", ba)

# encode / decode
s = "你好，Python!"
encoded = s.encode("utf-8")
print("utf-8 bytes:", encoded)
print("decode back:", encoded.decode("utf-8"))

# 其他编码（GBK 不含 emoji，所以用纯中文）
cn = "你好中国"
gbk_bytes = cn.encode("gbk")
utf8_bytes = cn.encode("utf-8")
print("中文 gbk len:", len(gbk_bytes), "utf-8 len:", len(utf8_bytes))
print("gbk decode:", gbk_bytes.decode("gbk"))

# hex 转换
hex_str = b"\\xde\\xad\\xbe\\xef".hex()
print("hex:", hex_str)
print("fromhex:", bytes.fromhex(hex_str))

# base64
raw = b"Hello, World!"
b64 = base64.b64encode(raw)
print("base64:", b64)
print("decode back:", base64.b64decode(b64))

# 遍历字节
data = b"ABC"
print("bytes list:", list(data))
`,
  },
];
