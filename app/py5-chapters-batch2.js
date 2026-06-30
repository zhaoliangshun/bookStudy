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
- 三类：\`int\`（任意精度）、\`float\`（双精度）、\`complex\`（复数）
- 字面量：二进制 \`0b\`、八进制 \`0o\`、十六进制 \`0x\`
- \`math\` 模块：常用数学函数；\`decimal\` 用于精确十进制计算
- 特殊值：\`float("inf")\` 无穷、\`math.isnan()\` 判断 NaN
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
- 单/双/三引号均可；\`r""\` 原始字符串（不转义反斜杠）
- **f-string**：3.12+ 支持嵌套引号（同类型引号可嵌套）
- 切片：\`s[start:end:step]\`；常用方法：\`strip/split/join/replace/find\`
- 其他方法：\`startswith/endswith/upper/lower/title/format\`
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
- \`re.match\`：从头匹配；\`re.search\`：找第一个匹配
- \`re.findall\`：找所有匹配；\`re.sub\`：替换；\`re.split\`：按模式切分
- 用 \`r""\` 原始字符串写正则，避免双重转义
- 用 \`()\` 分组提取子串
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
- \`b""\` 定义不可变字节序列；\`bytearray\` 是可变版本
- \`.encode()\` 把 str → bytes；\`.decode()\` 把 bytes → str（默认 UTF-8）
- \`.hex()\` 转十六进制字符串；\`bytes.fromhex()\` 反向
- \`base64\` 模块做 base64 编码
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
