// =============================================================
// Python 交互式教程 - 第 3 批章节（进阶）
// =============================================================
// 本文件为 4 批中的第 3 批，主题为「进阶」组，共 4 章：
//   1. py-fileio     —— 文件与 I/O
//   2. py-exceptions —— 异常处理
//   3. py-modules    —— 模块与包
//   4. py-oop        —— 面向对象
//
// 每章包含 content（Markdown 讲解）与 code（可运行 Python 代码）。
// 文件操作 demo 优先使用 io.StringIO / io.BytesIO / tempfile，
// 避免在磁盘上真正写入文件造成混乱；pathlib / os.path 演示仅做
// 只读查询，不修改磁盘结构。
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：文件与 I/O
  // =========================================================
  {
    id: "py-fileio",
    group: "进阶",
    icon: "📂",
    title: "文件与 I/O",
    content: `# 文件与 I/O

文件是计算机存储数据的基本单位。无论是配置文件、日志、数据库的 dump、图片、视频还是 Excel 表格，最终都以"文件"的形式保存在磁盘上。Python 提供了极其强大又简洁的文件 I/O（Input/Output，输入/输出）能力：内置的 \`open()\` 函数加上 \`io\` / \`pathlib\` / \`os\` / \`os.path\` / \`shutil\` 等模块，几乎可以覆盖所有日常文件操作需求。

## 一、为什么文件 I/O 如此重要

程序运行时数据都住在内存里，一旦进程结束、电脑关机，内存里的数据就会全部消失。要让数据"持久化"（persist）下来，最朴素也最通用的方式就是写到文件里。文件 I/O 是几乎所有"真正有用"的程序的基石：

- **配置文件**：程序启动时读取 \`config.json\` / \`settings.yaml\` 获取参数。
- **日志系统**：把运行日志写到 \`app.log\`，方便事后排查问题。
- **数据处理**：从 \`users.csv\` 读入千万行数据做清洗、统计。
- **缓存**：把耗时的计算结果 pickle 到磁盘，下次直接加载。
- **导入导出**：把数据库查询结果导出成 Excel / CSV 给业务方。
- **多媒体**：图片压缩、视频转码，本质都是在读写二进制文件。

理解文件 I/O，就是理解程序如何与"持久化的外部世界"打交道。

## 二、open() 函数：一切的起点

Python 内置 \`open()\` 函数用于打开文件，返回一个**文件对象（file object）**。它的完整签名是：

\`\`\`python
open(
    file,
    mode='r',
    buffering=-1,
    encoding=None,
    errors=None,
    newline=None,
    closefd=True,
    opener=None,
)
\`\`\`

日常用得最多的是前两个参数 \`file\` 和 \`mode\`，以及文本模式下的 \`encoding\`。下面分别讲解。

### 2.1 file 参数

\`file\` 可以是：

- 一个**字符串路径**：\`"data.txt"\`、\`"/tmp/log.txt"\`、\`"../config/settings.json"\`。
- 一个**pathlib.Path 对象**：\`Path("data.txt")\`（推荐，跨平台更优雅）。
- 一个**整数文件描述符**（fd）：底层操作系统层面的句柄，一般用不到。

### 2.2 mode 参数：读写模式速查

\`mode\` 是一个字符串，描述"以什么方式打开文件"。它由两部分组合：**主模式**（决定读还是写）+ **修饰符**（决定文本还是二进制、是否追加、是否可读可写）。

#### 主模式

| 模式 | 含义 | 文件不存在时 | 文件已存在时 |
| --- | --- | --- | --- |
| \`'r'\` | 只读（read，默认） | 抛 \`FileNotFoundError\` | 从开头读 |
| \`'w'\` | 只写（write） | 创建新文件 | **清空原内容** |
| \`'a'\` | 追加（append） | 创建新文件 | 在末尾追加，不清空 |
| \`'x'\` | 独占创建（exclusive） | 创建新文件 | **抛 \`FileExistsError\`** |
| \`'+'\` | 读写修饰符（不能单独用） | — | 配合上面使用 |

#### 修饰符

| 修饰符 | 含义 |
| --- | --- |
| \`'t'\` | 文本模式（text，默认），读写 \`str\`，涉及编码转换 |
| \`'b'\` | 二进制模式（binary），读写 \`bytes\`，不做编码转换 |
| \`'+'\` | 打开为可读可写 |

#### 常见组合

\`\`\`python
open("a.txt")            # 等价 'rt'，文本只读
open("a.txt", "r")       # 文本只读
open("a.txt", "w")       # 文本只写（清空）
open("a.txt", "a")       # 文本追加
open("a.txt", "x")       # 文本独占创建
open("a.txt", "rb")      # 二进制只读
open("a.txt", "wb")      # 二进制只写
open("a.txt", "r+")      # 文本读写（不清空，光标在开头）
open("a.txt", "w+")      # 文本读写（先清空）
open("a.txt", "a+")      # 文本读写追加（光标在末尾）
open("a.txt", "rb+")     # 二进制读写
\`\`\`

> 注意：\`'w'\` 会**直接清空**原文件！这是一个非常容易踩坑的点，生产代码里如果只是想覆盖某个文件要三思。如果担心误删，可以先用 \`os.path.exists()\` 检查，或者用 \`'x'\` 模式防止覆盖。

### 2.3 encoding 参数

文本模式下，磁盘上的字节需要按某种**字符编码**解码成 \`str\`。如果不指定 \`encoding\`，Python 会使用平台默认编码（Windows 上常常是 \`cp1252\` 或 \`gbk\`，Linux/macOS 上通常是 \`utf-8\`），这会导致同一份代码在不同机器上行为不一致，是中文乱码的罪魁祸首。

**最佳实践**：处理文本文件时永远显式指定 \`encoding="utf-8"\`。

\`\`\`python
# 错误示范（依赖平台默认编码）
f = open("data.txt", "r")

# 正确做法
f = open("data.txt", "r", encoding="utf-8")
\`\`\`

二进制模式（\`'b'\`）下 \`encoding\` 参数无效，因为读写的就是原始字节，不涉及编码转换。

## 三、读取文件的 N 种姿势

打开文件对象 \`f\` 后，有 4 个常用读取方法：

### 3.1 f.read(size=-1)

一次性读取整个文件（或前 \`size\` 个字符/字节）。返回 \`str\`（文本模式）或 \`bytes\`（二进制模式）。

\`\`\`python
with open("note.txt", encoding="utf-8") as f:
    text = f.read()        # 一次读完
    print(text)

with open("note.txt", encoding="utf-8") as f:
    chunk = f.read(10)     # 只读前 10 个字符
\`\`\`

**警告**：\`read()\` 不带参数时会**把整个文件读进内存**。处理几个 GB 的大文件时这样做会让程序直接 OOM（内存溢出）。大文件请用后面讲的逐行迭代。

### 3.2 f.readline()

读取一行（包含行尾的 \`\\n\`，最后一行可能没有）。读到文件末尾返回空字符串 \`""\`。

\`\`\`python
with open("note.txt", encoding="utf-8") as f:
    first = f.readline()
    second = f.readline()
\`\`\`

### 3.3 f.readlines()

读取所有行，返回一个**列表**，每个元素是一行（含 \`\\n\`）。同样会把整个文件读进内存，只适合小文件。

\`\`\`python
with open("note.txt", encoding="utf-8") as f:
    lines = f.readlines()   # ['第一行\\n', '第二行\\n', ...]
\`\`\`

### 3.4 直接迭代文件对象（推荐）

文件对象本身是可迭代的，每次迭代产生一行。这是**处理大文件最优雅、最省内存**的方式，因为一次只在内存里保留一行：

\`\`\`python
with open("huge.log", encoding="utf-8") as f:
    for line in f:           # 一行一行读，不占内存
        process(line)
\`\`\`

这种写法在内部使用了缓冲读取，效率比 \`readline()\` 循环更高，代码也更短，是 Python 处理大文件的事实标准。

### 3.5 三种读取方式对比

\`\`\`python
# 方式 A：readlines，小文件 OK
lines = f.readlines()

# 方式 B：readline 循环，啰嗦
while True:
    line = f.readline()
    if not line:
        break
    process(line)

# 方式 C：直接迭代，最佳
for line in f:
    process(line)
\`\`\`

## 四、写入文件

### 4.1 f.write(s)

把字符串 \`s\` 写入文件，返回写入的字符数。**不会自动加换行**，需要自己加 \`\\n\`。

\`\`\`python
with open("out.txt", "w", encoding="utf-8") as f:
    f.write("hello\\n")
    f.write("world\\n")
\`\`\`

### 4.2 f.writelines(seq)

把一个可迭代对象里的每个字符串依次写入。同样**不会自动加换行**，名字很容易误导人——它不是"writes lines with newline"，而是"writes a sequence of strings"。

\`\`\`python
lines = ["苹果\\n", "香蕉\\n", "橙子\\n"]
with open("out.txt", "w", encoding="utf-8") as f:
    f.writelines(lines)
\`\`\`

如果原始数据没有 \`\\n\`，可以这样做：

\`\`\`python
items = ["苹果", "香蕉", "橙子"]
with open("out.txt", "w", encoding="utf-8") as f:
    f.writelines(x + "\\n" for x in items)
\`\`\`

### 4.3 print 到文件

\`print()\` 函数有个 \`file=\` 参数，可以直接把内容写到文件对象里，并且**自动加换行**，比 \`write\` 方便：

\`\`\`python
with open("out.txt", "w", encoding="utf-8") as f:
    print("hello", file=f)
    print("world", file=f)
    print("a", "b", "c", sep=",", file=f)   # a,b,c
\`\`\`

## 五、with 上下文管理器：资源安全的好习惯

文件用完必须关闭，否则会**占用文件描述符**，长期不关会导致操作系统"文件句柄耗尽"（Linux 默认每进程 1024 个）。传统写法：

\`\`\`python
f = open("data.txt", encoding="utf-8")
try:
    text = f.read()
finally:
    f.close()    # 必须在 finally 里保证关闭
\`\`\`

但这样太啰嗦，而且容易忘 \`finally\`。Python 的 \`with\` 语句可以在代码块结束时**自动调用 \`f.close()\`**，即使中间抛了异常也会关闭：

\`\`\`python
with open("data.txt", encoding="utf-8") as f:
    text = f.read()
# 离开 with 块，f 自动关闭
\`\`\`

**强烈建议**：只要打开文件就用 \`with\`，不要再写裸的 \`open()\`。这是 Python 社区的共识。

### with 的工作原理

\`with\` 实际上调用了文件对象的 \`__enter__()\` 和 \`__exit__()\` 方法：

\`\`\`python
with open("data.txt") as f:
    ...
# 等价于
f = open("data.txt")
f.__enter__()
try:
    ...
finally:
    f.__exit__(None, None, None)   # 内部调用 f.close()
\`\`\`

任何实现了 \`__enter__\` / \`__exit__\` 的对象都能用 \`with\`，这叫**上下文管理器协议**。后面异常处理章节会讲如何自定义。

### 同时打开多个文件

\`\`\`python
with open("in.txt", encoding="utf-8") as fin, open("out.txt", "w", encoding="utf-8") as fout:
    for line in fin:
        fout.write(line.upper())
\`\`\`

Python 3.10+ 还支持用括号换行：

\`\`\`python
with (
    open("in.txt", encoding="utf-8") as fin,
    open("out.txt", "w", encoding="utf-8") as fout,
):
    ...
\`\`\`

## 六、二进制模式：处理图片、音频、压缩包

文本模式读写 \`str\`，会做编码转换和换行符转换（Windows 上 \`\\n\` ↔ \`\\r\\n\`）。**处理非文本数据（图片、视频、PDF、zip）必须用二进制模式 \`'b'\`**，否则数据会被破坏。

\`\`\`python
# 复制一张图片（用二进制模式）
with open("a.png", "rb") as src, open("a_copy.png", "wb") as dst:
    dst.write(src.read())
\`\`\`

二进制模式下读写的是 \`bytes\` 对象，不是 \`str\`：

\`\`\`python
with open("data.bin", "wb") as f:
    f.write(b"\\x00\\x01\\x02\\xff")    # bytes 字面量

with open("data.bin", "rb") as f:
    data = f.read()      # b'\\x00\\x01\\x02\\xff'
\`\`\`

\`io.BytesIO\` 是二进制版的 \`StringIO\`，在内存里模拟二进制文件，常用于测试和序列化：

\`\`\`python
import io
buf = io.BytesIO()
buf.write(b"hello")
buf.write(b" world")
print(buf.getvalue())    # b'hello world'
\`\`\`

## 七、文件指针：seek / tell

文件对象内部有一个"光标"（文件指针），记录当前读写位置。每次读写后光标会自动后移。

- \`f.tell()\`：返回当前光标位置（文本模式下返回的是"不透明整数"，只能用来回 seek，不能当字符数理解）。
- \`f.seek(offset, whence=0)\`：移动光标。 \`whence\` 取值：
  - \`0\`（\`os.SEEK_SET\`，默认）：从文件开头算。
  - \`1\`（\`os.SEEK_CUR\`）：从当前位置算。
  - \`2\`（\`os.SEEK_END\`）：从文件末尾算。

\`\`\`python
with open("data.txt", "w+", encoding="utf-8") as f:
    f.write("hello world")
    f.seek(0)            # 回到开头
    print(f.read())      # hello world
    f.seek(6)            # 跳到 'w' 的位置
    print(f.read())      # world
\`\`\`

> 文本模式下 \`seek\` 只允许 \`seek(0)\` 之类的"安全"操作，或者用 \`f.seek(pos, 0)\` 回到 \`tell()\` 之前记下的位置。任意字节偏移的 \`seek\` 在文本模式下可能抛 \`OSError\`，因为多字节字符可能被切断。二进制模式则没有这个限制。

## 八、大文件逐行处理

处理几个 GB 的日志文件时，千万不能用 \`read()\` 或 \`readlines()\`，否则内存直接爆炸。正确做法是**逐行迭代 + 流式处理**：

\`\`\`python
# 统计一个 10GB 日志里 ERROR 出现的次数
count = 0
with open("huge.log", encoding="utf-8", errors="replace") as f:
    for line in f:
        if "ERROR" in line:
            count += 1
print(count)
\`\`\`

\`errors="replace"\` 表示遇到解码错误时用占位符替代，避免一行坏数据让整个任务崩溃。

如果要按块读取二进制大文件：

\`\`\`python
def read_in_chunks(f, chunk_size=8192):
    while True:
        chunk = f.read(chunk_size)
        if not chunk:
            break
        yield chunk

with open("big.bin", "rb") as f:
    for chunk in read_in_chunks(f):
        process(chunk)
\`\`\`

## 九、CSV 文件读写

CSV（Comma-Separated Values，逗号分隔值）是表格数据最常见的纯文本格式。Python 标准库 \`csv\` 模块专门处理它，**不要手写字符串 split**——CSV 里的字段本身可能包含逗号、引号、换行符，手写解析很容易出错。

### 9.1 写 CSV

\`\`\`python
import csv

rows = [
    ["姓名", "年龄", "城市"],
    ["张三", 28, "北京"],
    ["李四", 35, "上海"],
    ["王五", "逗号,在,里面", "广州"],
]
with open("users.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerows(rows)
\`\`\`

注意 \`newline=""\` 是 CSV 写入的关键——它关闭 Python 的"通用换行符转换"，让 \`csv\` 模块自己处理换行，否则在 Windows 上会出现空行。

\`csv.writer\` 会自动处理字段里的逗号和引号：\`"逗号,在,里面"\` 会被引号包裹。

### 9.2 读 CSV

\`\`\`python
import csv

with open("users.csv", encoding="utf-8", newline="") as f:
    reader = csv.reader(f)
    for row in reader:
        print(row)        # ['姓名', '年龄', '城市']  ...
\`\`\`

### 9.3 DictReader / DictWriter：把每行变成字典

\`\`\`python
import csv

with open("users.csv", encoding="utf-8", newline="") as f:
    reader = csv.DictReader(f)        # 第一行作为字段名
    for row in reader:
        print(row["姓名"], row["年龄"])   # 字典访问

# 写
with open("out.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "age"])
    writer.writeheader()
    writer.writerow({"name": "Alice", "age": 30})
\`\`\`

\`DictReader\` / \`DictWriter\` 让代码可读性大幅提升，是处理有表头的 CSV 的首选。

## 十、JSON 文件读写

JSON（JavaScript Object Notation）是现代 Web API、配置文件的事实标准。Python 标准库 \`json\` 模块负责 Python 对象与 JSON 字符串之间的转换。

### 10.1 序列化（Python → JSON）

\`\`\`python
import json

data = {"name": "Alice", "age": 30, "scores": [90, 85, 95]}

# 转成字符串
s = json.dumps(data, ensure_ascii=False, indent=2)
print(s)

# 直接写文件
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
\`\`\`

关键参数：
- \`ensure_ascii=False\`：允许输出中文（默认 \`True\` 会把中文转成 \`\\uXXXX\` 转义，可读性差）。
- \`indent=2\`：美化缩进，便于人读；不传则输出紧凑的单行。
- \`sort_keys=True\`：按 key 排序。

### 10.2 反序列化（JSON → Python）

\`\`\`python
import json

# 从字符串
data = json.loads('{"name": "Alice", "age": 30}')

# 从文件
with open("data.json", encoding="utf-8") as f:
    data = json.load(f)
\`\`\`

### 10.3 类型对应关系

| Python | JSON |
| --- | --- |
| \`dict\` | object \`{}\` |
| \`list\` / \`tuple\` | array \`[]\` |
| \`str\` | string |
| \`int\` / \`float\` | number |
| \`True\` / \`False\` | true / false |
| \`None\` | null |

注意：JSON 没有"元组"概念，\`tuple\` 会被序列化成 array，反序列化回来变成 \`list\`。 \`set\`、自定义类都不能直接序列化。

### 10.4 处理自定义对象

\`\`\`python
import json
from datetime import datetime

class Person:
    def __init__(self, name, birthday):
        self.name = name
        self.birthday = birthday

def person_to_dict(p):
    return {"name": p.name, "birthday": p.birthday.isoformat()}

p = Person("Alice", datetime(1995, 5, 1))
s = json.dumps(p, default=person_to_dict, ensure_ascii=False)
\`\`\`

\`default=\` 回调会在遇到不知道怎么序列化的对象时被调用。

## 十一、pathlib：现代路径操作

\`pathlib\` 是 Python 3.4 引入的面向对象路径库，比 \`os.path\` 更优雅、更易读。**新代码强烈推荐用 \`pathlib\`**。

### 11.1 创建 Path 对象

\`\`\`python
from pathlib import Path

p = Path("data") / "users.csv"     # 用 / 拼接路径，跨平台
p = Path("/home/alice/data.txt")
p = Path.cwd()                      # 当前工作目录
p = Path.home()                     # 用户家目录
\`\`\`

用 \`/\` 运算符拼接路径是 \`pathlib\` 最优雅的设计，比 \`os.path.join()\` 短得多。

### 11.2 路径组成部分

\`\`\`python
p = Path("/home/alice/data/users.csv")
p.parent        # Path('/home/alice/data')   父目录
p.name          # 'users.csv'                文件名
p.stem          # 'users'                    不带扩展名的文件名
p.suffix        # '.csv'                     扩展名
p.suffixes      # ['.csv']                   所有扩展名
p.parts         # ('/', 'home', 'alice', 'data', 'users.csv')
p.anchor        # '/'                        盘符或根目录
\`\`\`

### 11.3 路径查询

\`\`\`python
p = Path("data.txt")
p.exists()        # 是否存在
p.is_file()       # 是否是文件
p.is_dir()        # 是否是目录
p.stat().st_size  # 文件大小（字节）
p.stat().st_mtime # 修改时间戳
\`\`\`

### 11.4 创建 / 删除

\`\`\`python
p = Path("output")
p.mkdir(exist_ok=True)        # 创建目录，已存在不报错
p.mkdir(parents=True)         # 递归创建（类似 mkdir -p）

p.touch()                     # 创建空文件
p.unlink()                    # 删除文件
p.rmdir()                     # 删除空目录
\`\`\`

### 11.5 遍历与匹配

\`\`\`python
p = Path(".")
list(p.iterdir())                       # 列出当前目录所有条目
list(p.glob("*.py"))                    # 匹配当前目录下 .py 文件
list(p.rglob("*.py"))                   # 递归匹配所有子目录
\`\`\`

### 11.6 读写一行搞定

\`Path\` 对象直接提供了 \`read_text\` / \`read_bytes\` / \`write_text\` / \`write_bytes\`，省去 \`open\` 的样板代码：

\`\`\`python
p = Path("data.txt")
text = p.read_text(encoding="utf-8")        # 一行读完
p.write_text("hello", encoding="utf-8")     # 一行写入（会覆盖）
data = p.read_bytes()
p.write_bytes(b"\\x00\\x01")
\`\`\`

## 十二、os.path 常用函数

老代码里大量使用 \`os.path\`，新代码可以用 \`pathlib\` 替代，但读老代码必须看得懂：

\`\`\`python
import os.path as op

op.join("a", "b", "c.txt")    # 跨平台拼接：'a/b/c.txt' 或 'a\\\\b\\\\c.txt'
op.exists("a.txt")            # 是否存在
op.isfile("a.txt")            # 是否是文件
op.isdir("a")                 # 是否是目录
op.basename("/a/b/c.txt")     # 'c.txt'   文件名
op.dirname("/a/b/c.txt")      # '/a/b'    目录部分
op.split("/a/b/c.txt")        # ('/a/b', 'c.txt')
op.splitext("c.txt")          # ('c', '.txt')   拆扩展名
op.abspath("a.txt")           # 绝对路径
op.realpath("a.txt")          # 解析符号链接后的真实路径
op.expanduser("~/data")       # 展开家目录
op.getsize("a.txt")           # 文件大小
op.commonpath(["/a/b/c", "/a/b/d"])   # '/a/b'
\`\`\`

## 十三、shutil：高级文件操作

\`shutil\`（shell utility）模块提供"复制、移动、删除整棵目录树"等高级操作，相当于在 Python 里调用 \`cp\` / \`mv\` / \`rm -r\`。

\`\`\`python
import shutil

shutil.copy("a.txt", "b.txt")                # 复制文件（不含权限）
shutil.copy2("a.txt", "b.txt")               # 复制文件 + 元数据（mtime 等）
shutil.copytree("dir_a", "dir_b")            # 复制整棵目录树
shutil.move("a.txt", "b.txt")                # 移动/重命名
shutil.rmtree("dir")                         # 递归删除目录树（危险！）
shutil.disk_usage("/")                        # 磁盘使用情况
shutil.make_archive("backup", "zip", "dir")  # 打包成 zip
shutil.unpack_archive("backup.zip", "out")   # 解包
\`\`\`

> \`shutil.rmtree\` 是不可恢复的删除，**生产环境用之前一定要再三确认路径**。建议先 \`print\` 路径、用 \`os.path.abspath\` 解析后再删。

## 十四、临时文件：tempfile

写测试或缓存中间结果时，经常需要临时文件。\`tempfile\` 模块能安全地创建临时文件/目录，名字随机，用完自动清理：

\`\`\`python
import tempfile

# 临时文件，with 块结束自动删除
with tempfile.NamedTemporaryFile(mode="w+", suffix=".txt", delete=True) as f:
    f.write("hello")
    f.seek(0)
    print(f.read())
# 离开 with，文件被删除

# 临时目录
with tempfile.TemporaryDirectory() as d:
    path = d + "/data.txt"
    with open(path, "w") as f:
        f.write("hi")
# 离开 with，整个目录被删除
\`\`\`

\`delete=True\` 是默认值，配合 \`with\` 使用最安全。本教程的 demo 大量使用 \`io.StringIO\` 而不是 \`tempfile\`，因为 StringIO 完全在内存里，连临时文件都不创建，更适合纯演示。

## 十五、常见陷阱总结

1. **忘记 \`encoding\`**：导致中文乱码。永远写 \`encoding="utf-8"\`。
2. **忘记 \`with\`**：文件没关，句柄泄漏。永远用 \`with\`。
3. **大文件 \`read()\`**：内存爆炸。用 \`for line in f\` 逐行读。
4. **CSV 忘 \`newline=""\`**：Windows 上每行多一个空行。
5. **二进制文件用文本模式**：图片损坏。永远加 \`'b'\`。
6. **\`'w'\` 误删文件**：覆盖前先用 \`exists\` 检查，或用 \`'x'\`。
7. **\`writelines\` 期望自动换行**：它不会，要自己加 \`\\n\`。
8. **\`readlines\` 当大文件方案**：和 \`read()\` 一样占内存，逐行迭代更好。

掌握以上内容，你就能在 Python 里从容地处理几乎所有文件 I/O 场景。下一章我们会学习异常处理——文件操作中 \`FileNotFoundError\` / \`PermissionError\` 等异常无处不在，理解异常处理是写出健壮文件代码的必备技能。
`,
    code: `# ============================================================
# 文件与 I/O 演示代码
# 全部使用 io.StringIO / io.BytesIO / tempfile 等内存对象演示
# 不会在磁盘上留下垃圾文件，安全可重复运行
# ============================================================
import io
import csv
import json
import os
import sys
import tempfile
from pathlib import Path

print("=" * 60)
print("第 1 部分：io.StringIO 模拟文本文件")
print("=" * 60)

# StringIO 是内存里的文本文件，API 与真实文件完全一致
buf = io.StringIO()
buf.write("第一行\\n")
buf.write("第二行\\n")
buf.write("第三行")
print("当前光标位置 tell():", buf.tell())
buf.seek(0)  # 光标回到开头
text = buf.read()
print("read() 全部内容:")
print(text)
print("getvalue() 不受光标影响:", repr(buf.getvalue()))
buf.close()

print()
print("=" * 60)
print("第 2 部分：readline / readlines 对比")
print("=" * 60)

buf = io.StringIO("苹果\\n香蕉\\n橙子\\n葡萄")
print("readline() 第 1 次:", repr(buf.readline()))
print("readline() 第 2 次:", repr(buf.readline()))
print("readlines() 读剩余:", buf.readlines())

print()
print("=" * 60)
print("第 3 部分：writelines 写入多行")
print("=" * 60)

buf = io.StringIO()
colors = ["红色\\n", "绿色\\n", "蓝色\\n"]
buf.writelines(colors)
print("writelines 后内容:")
print(buf.getvalue())

print()
print("=" * 60)
print("第 4 部分：直接迭代文件对象（最优雅）")
print("=" * 60)

text = """姓名,年龄
张三,28
李四,35
王五,22"""
buf = io.StringIO(text)
for i, line in enumerate(buf, 1):
    print(f"第 {i} 行:", repr(line.rstrip("\\n")))

print()
print("=" * 60)
print("第 5 部分：seek / tell 光标控制")
print("=" * 60)

buf = io.StringIO("hello world")
print("写入前 tell():", buf.tell())
print("read 5 字符:", repr(buf.read(5)))
print("现在 tell():", buf.tell())
buf.seek(0)
print("seek(0) 后 read():", repr(buf.read()))
buf.seek(6)
print("seek(6) 后 read():", repr(buf.read()))

print()
print("=" * 60)
print("第 6 部分：io.BytesIO 模拟二进制文件")
print("=" * 60)

bbuf = io.BytesIO()
bbuf.write(b"\\x48\\x49")   # 'HI'
bbuf.write(b"\\x00\\xff")
bbuf.seek(0)
print("二进制内容:", bbuf.read())
print("十六进制:", bbuf.getvalue().hex())

print()
print("=" * 60)
print("第 7 部分：CSV 读写（用 StringIO 模拟）")
print("=" * 60)

# 写 CSV 到内存
out = io.StringIO()
writer = csv.writer(out)
writer.writerow(["姓名", "年龄", "城市"])
writer.writerow(["张三", 28, "北京"])
writer.writerow(["李四", 35, "上海,浦东"])  # 含逗号，会被引号包裹
csv_text = out.getvalue()
print("生成的 CSV 文本:")
print(csv_text)

# 读 CSV
print("解析回来:")
reader = csv.reader(io.StringIO(csv_text))
for row in reader:
    print("  行:", row)

# DictReader
print("DictReader 解析:")
reader = csv.DictReader(io.StringIO(csv_text))
for row in reader:
    print("  ", row["姓名"], row["年龄"], row["城市"])

print()
print("=" * 60)
print("第 8 部分：JSON 读写")
print("=" * 60)

data = {
    "name": "张三",
    "age": 28,
    "married": False,
    "spouse": None,
    "scores": [90, 85, 95],
}
s = json.dumps(data, ensure_ascii=False, indent=2)
print("序列化结果:")
print(s)

# 反序列化
back = json.loads(s)
print("反序列化后类型:", type(back).__name__)
print("scores 是 list 吗:", isinstance(back["scores"], list))

print()
print("=" * 60)
print("第 9 部分：pathlib 路径操作（只读查询）")
print("=" * 60)

p = Path("/home/alice/projects/demo/data/users.csv")
print("路径:", p)
print("parent:", p.parent)
print("name:", p.name)
print("stem:", p.stem)
print("suffix:", p.suffix)
print("parts:", p.parts)
print("anchor:", p.anchor)

# 拼接路径
new_p = Path("data") / "2024" / "report.csv"
print("拼接:", new_p)

# 当前目录与家目录（不修改，只查询）
print("当前工作目录:", Path.cwd())
print("用户家目录:", Path.home())

print()
print("=" * 60)
print("第 10 部分：os.path 常用函数")
print("=" * 60)

print("join('a','b','c.txt'):", os.path.join("a", "b", "c.txt"))
print("basename('/x/y/z.txt'):", os.path.basename("/x/y/z.txt"))
print("dirname('/x/y/z.txt'):", os.path.dirname("/x/y/z.txt"))
print("splitext('z.txt'):", os.path.splitext("z.txt"))
print("split('/x/y/z.txt'):", os.path.split("/x/y/z.txt"))
print("abspath('a.txt'):", os.path.abspath("a.txt"))
print("expanduser('~/data'):", os.path.expanduser("~/data"))

print()
print("=" * 60)
print("第 11 部分：tempfile 临时文件（自动清理）")
print("=" * 60)

# NamedTemporaryFile 在 with 块结束自动删除
with tempfile.NamedTemporaryFile(mode="w+", suffix=".txt", delete=True) as tf:
    tf.write("我是临时数据\\n")
    tf.flush()       # 确保写入磁盘
    tf.seek(0)
    print("临时文件路径:", tf.name)
    print("临时文件内容:", repr(tf.read()))
print("离开 with 后文件已自动删除")

print()
print("=" * 60)
print("第 12 部分：print 直接写到文件对象")
print("=" * 60)

buf = io.StringIO()
print("第一行", file=buf)
print("第二行", file=buf)
print("a", "b", "c", sep=", ", end="!\\n", file=buf)
print("最终内容:")
print(buf.getvalue())

print()
print("=" * 60)
print("第 13 部分：大文件流式处理模拟")
print("=" * 60)

# 模拟一个"大文件"，逐行处理，统计某关键字
big_text = "\\n".join(f"line {i} ERROR code={i%5}" if i % 7 == 0
                      else f"line {i} info ok"
                      for i in range(1, 51))
buf = io.StringIO(big_text)
error_count = 0
total = 0
for line in buf:
    total += 1
    if "ERROR" in line:
        error_count += 1
print(f"总行数 {total}，含 ERROR 行数 {error_count}")

print()
print("全部演示完成。")
`,
  },

  // =========================================================
  // 第二章：异常处理
  // =========================================================
  {
    id: "py-exceptions",
    group: "进阶",
    icon: "⚠️",
    title: "异常处理",
    content: `# 异常处理

写代码时不可能假设一切都会顺利：用户会输入奇怪的数据、文件会被删除、网络会断、内存会不够、除数会是 0、列表会越界……一个健壮的程序必须能**优雅地处理这些意外情况**，而不是直接崩溃。Python 用"异常（Exception）"机制来描述和管理运行时错误，本章系统讲解异常处理的方方面面。

## 一、什么是异常

**异常（Exception）** 是程序运行时发生的"非正常事件"，它会打断正常的指令流。如果异常没有被处理，Python 会一路向上抛，最终打印一长串 \`Traceback\` 并退出程序。

\`\`\`python
>>> 1 / 0
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
ZeroDivisionError: division by zero
\`\`\`

\`ZeroDivisionError\` 就是异常类型。Python 内置了上百种异常类，它们都继承自 \`BaseException\`，绝大多数继承自 \`Exception\`。

### 1.1 异常的组成

一个异常包含：
- **类型**：\`ZeroDivisionError\`、\`ValueError\` 等，描述"这是什么错"。
- **消息**：\`division by zero\`，人类可读的描述。
- **回溯（traceback）**：异常发生时的调用栈，告诉你"在哪一行抛出、怎么调过来的"。

### 1.2 异常 vs 错误 vs Bug

- **语法错误（SyntaxError）**：代码根本没法解析，比如括号没闭合。这是"编译期"问题，不是异常。
- **异常（Exception）**：语法没问题，但运行时遇到了无法处理的状况，比如除零、越界、文件不存在。
- **Bug**：代码逻辑错误，但不一定抛异常（比如算错结果）。异常机制救不了 Bug，得靠测试和审阅。

## 二、try / except：捕获异常

\`try/except\` 是异常处理的核心结构：把可能出错的代码放进 \`try\` 块，发生异常时跳到 \`except\` 块处理。

\`\`\`python
try:
    n = int(input("输入一个数字: "))
    print(10 / n)
except ZeroDivisionError:
    print("不能除以 0")
except ValueError:
    print("不是合法的数字")
\`\`\`

### 2.1 捕获多种异常

可以写多个 \`except\` 分支，按顺序匹配：

\`\`\`python
try:
    risky()
except ZeroDivisionError:
    ...
except ValueError:
    ...
except (KeyError, IndexError):
    ...   # 用元组一次捕获多种
\`\`\`

### 2.2 捕获异常对象

\`except ... as e\` 可以拿到异常对象，访问其消息或属性：

\`\`\`python
try:
    1 / 0
except ZeroDivisionError as e:
    print("类型:", type(e).__name__)
    print("消息:", e)
    print("args:", e.args)
\`\`\`

### 2.3 不要裸 except

\`\`\`python
try:
    risky()
except:        # 极度不推荐！
    pass
\`\`\`

裸 \`except\` 会捕获**所有异常**，包括 \`KeyboardInterrupt\`（Ctrl+C）、\`SystemExit\`、\`MemoryError\`……这会掩盖真正的 bug，让程序"看起来没出错"但其实在错误地继续运行。**永远写明具体异常类型**，最多用 \`except Exception:\`（排除掉系统级退出异常）。

### 2.4 异常类的层级

Python 所有异常的根是 \`BaseException\`。直接继承它的有：

- \`SystemExit\`：\`sys.exit()\` 抛出。
- \`KeyboardInterrupt\`：用户按 Ctrl+C。
- \`GeneratorExit\`：生成器被关闭。
- \`Exception\`：**所有"普通"异常的父类**。

日常捕获用 \`except Exception:\` 就能覆盖绝大多数情况，又不会误伤 \`KeyboardInterrupt\`。

\`\`\`
BaseException
├── SystemExit
├── KeyboardInterrupt
├── GeneratorExit
└── Exception
    ├── StopIteration
    ├── ArithmeticError
    │   ├── ZeroDivisionError
    │   └── OverflowError
    ├── LookupError
    │   ├── IndexError
    │   └── KeyError
    ├── ValueError
    │   └── UnicodeDecodeError
    ├── OSError
    │   ├── FileNotFoundError
    │   ├── PermissionError
    │   └── FileExistsError
    ├── TypeError
    ├── AttributeError
    ├── NameError
    ├── RuntimeError
    │   └── RecursionError
    └── ...
\`\`\`

捕获父类异常会同时捕获所有子类。所以 \`except OSError:\` 会同时捕获 \`FileNotFoundError\` / \`PermissionError\` 等。但**捕获顺序要从具体到宽泛**，否则宽泛的分支永远会先匹配：

\`\`\`python
try:
    open("missing.txt")
except FileNotFoundError:        # 先具体
    print("文件不存在")
except OSError:                  # 后宽泛
    print("其他 OS 错误")
\`\`\`

## 三、else 与 finally

\`try/except\` 还可以加 \`else\` 和 \`finally\` 两个子句。

### 3.1 else：没异常时才执行

\`\`\`python
try:
    f = open("data.txt", encoding="utf-8")
except FileNotFoundError:
    print("文件不存在")
else:
    # 只有 try 块没抛异常时才执行
    # 把"使用 f 的代码"放这里，避免被 except 误捕获
    data = f.read()
    f.close()
    print(data)
\`\`\`

\`else\` 的价值：把"可能出错的代码"和"使用结果的代码"分开，让 \`try\` 块尽量小，避免意外捕获了不该捕获的异常。

### 3.2 finally：无论如何都执行

\`\`\`python
try:
    f = open("data.txt", encoding="utf-8")
    data = f.read()
finally:
    f.close()   # 不管有没有异常，都会关闭
\`\`\`

\`finally\` 块**无论 try 块有没有抛异常、except 有没有捕获到、有没有 return，都会执行**。常用于资源清理：关文件、释放锁、关数据库连接。

> 现代代码用 \`with\` 代替 \`try/finally\` 关闭资源，更简洁。但 \`finally\` 仍适用于非上下文管理器的清理场景。

### 3.3 完整结构

\`\`\`python
try:
    # 可能出错的代码
except SomeError as e:
    # 处理某类异常
except OtherError:
    # 处理另一类
else:
    # 没异常时执行
finally:
    # 无论如何都执行
\`\`\`

执行顺序：
1. 执行 \`try\`。
2. 若抛异常 → 匹配 \`except\`，执行对应分支 → 跳过 \`else\`。
3. 若没抛异常 → 跳过 \`except\` → 执行 \`else\`。
4. 最后一定执行 \`finally\`。

## 四、raise：主动抛出异常

不只是被动捕获，你也可以主动 \`raise\` 异常，用于"输入不合法、前置条件不满足"等情况。

\`\`\`python
def divide(a, b):
    if b == 0:
        raise ValueError("除数不能为 0")
    return a / b

try:
    divide(10, 0)
except ValueError as e:
    print(e)   # 除数不能为 0
\`\`\`

### 4.1 重新抛出当前异常

在 except 块里 \`raise\` 不带参数，会把当前捕获的异常原样抛出，常用于"记录日志后继续往上抛"：

\`\`\`python
try:
    risky()
except Exception as e:
    log(e)
    raise    # 重新抛出，让上层处理
\`\`\`

### 4.2 raise from：异常链

有时你捕获了一个低层异常，想抛出一个更语义化的高层异常，但又不想丢失原始信息。这时用 \`raise ... from ...\` 建立"异常链"：

\`\`\`python
def load_config(path):
    try:
        with open(path, encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError as e:
        raise RuntimeError("配置文件丢失，请检查安装") from e

try:
    load_config("missing.conf")
except RuntimeError as e:
    print(e)               # 配置文件丢失...
    print(e.__cause__)     # 原始异常 FileNotFoundError
\`\`\`

异常链在 traceback 里会显示 \`The above exception was the direct cause of the following exception:\`，调试时非常有用。

### 4.3 raise from None：抑制链

有时你不想暴露原始异常（比如安全考虑），用 \`raise X from None\` 显式抑制：

\`\`\`python
try:
    ...
except SomeError:
    raise MyError("出错了") from None   # 不带原始链
\`\`\`

## 五、自定义异常类

业务代码里，定义自己的异常类可以让错误处理更精确、更具语义。约定：**自定义异常继承 \`Exception\`（不是 \`BaseException\`）**，类名以 \`Error\` / \`Exception\` 结尾。

\`\`\`python
class InventoryError(Exception):
    """库存相关异常的基类"""
    pass

class OutOfStockError(InventoryError):
    def __init__(self, item, available, requested):
        super().__init__(f"{item} 库存不足: 现有 {available}, 需要 {requested}")
        self.item = item
        self.available = available
        self.requested = requested

def deduct(item, qty, stock):
    if qty > stock:
        raise OutOfStockError(item, stock, qty)
    return stock - qty

try:
    deduct("iPhone", 5, 2)
except OutOfStockError as e:
    print(e.item, "缺货，差", e.requested - e.available, "件")
\`\`\`

自定义异常类的好处：
1. **语义清晰**：\`OutOfStockError\` 比 \`ValueError("out of stock")\` 更易理解。
2. **精确捕获**：上层可以只捕获 \`InventoryError\` 系列而忽略其他。
3. **携带数据**：异常对象上可以挂业务字段（\`item\`、\`qty\`），上层处理时直接用。
4. **层级设计**：\`InventoryError\` 作为基类，子类共享捕获入口。

## 六、assert 断言

\`assert\` 用于"声明某个条件必须成立"，主要用于**调试和测试**，不满足时抛 \`AssertionError\`。

\`\`\`python
def sqrt(x):
    assert x >= 0, f"sqrt 要求非负数，得到 {x}"
    return x ** 0.5
\`\`\`

等价于：

\`\`\`python
if not condition:
    raise AssertionError(message)
\`\`\`

### 6.1 assert 的陷阱：优化模式下被禁用

Python 启动时加 \`-O\` 选项（\`python -O script.py\`）会**移除所有 assert 语句**。所以**绝对不要用 assert 做生产逻辑的数据校验**：

\`\`\`python
# 错误示范：用 -O 启动后这行就没了！
assert user.is_admin, "无权限"
delete_database()

# 正确做法
if not user.is_admin:
    raise PermissionError("无权限")
\`\`\`

经验：\`assert\` 用来表达"我（开发者）确信这里一定成立，如果不成立那是我的 bug"。用户输入校验、权限检查、业务规则验证，统统用 \`if + raise\`。

## 七、常见内置异常速查

| 异常 | 触发场景 |
| --- | --- |
| \`ZeroDivisionError\` | 除以 0 |
| \`ValueError\` | 值类型对但内容非法，如 \`int("abc")\` |
| \`TypeError\` | 类型不对，如 \`"a" + 1\` |
| \`IndexError\` | 列表下标越界 |
| \`KeyError\` | 字典 key 不存在 |
| \`AttributeError\` | 访问不存在的属性 |
| \`NameError\` | 变量名未定义 |
| \`FileNotFoundError\` | 打开不存在的文件 |
| \`PermissionError\` | 权限不足 |
| \`FileExistsError\` | \`'x'\` 模式下文件已存在 |
| \`OSError\` | 各种 OS 错误的基类 |
| \`StopIteration\` | 迭代器耗尽 |
| \`KeyError\` | dict key 不存在 |
| \`RecursionError\` | 递归过深 |
| \`NotImplementedError\` | 抽象方法未实现 |
| \`RuntimeError\` | 其他运行时错误 |
| \`MemoryError\` | 内存不足 |
| \`ImportError\` / \`ModuleNotFoundError\` | 导入失败 |
| \`KeyboardInterrupt\` | 用户 Ctrl+C |
| \`SystemExit\` | \`sys.exit()\` |

记住这些"高频异常"对读 traceback 大有帮助。

## 八、traceback：提取异常信息

\`traceback\` 模块可以程序化地获取、格式化、打印异常的调用栈，常用于日志系统。

\`\`\`python
import traceback

try:
    1 / 0
except ZeroDivisionError:
    # 把完整 traceback 格式化成字符串
    tb_str = traceback.format_exc()
    print(tb_str)
    # 也可以写入日志文件
    # with open("error.log", "a") as f: f.write(tb_str)
\`\`\`

常用函数：
- \`traceback.format_exc()\`：返回当前异常的格式化字符串。
- \`traceback.print_exc()\`：直接打印到 stderr。
- \`traceback.format_exception(type, value, tb)\`：返回每一行的列表，可自定义格式化。

\`sys.exc_info()\` 返回当前异常的三元组 \`(type, value, traceback)\`：

\`\`\`python
import sys
try:
    1 / 0
except ZeroDivisionError:
    exc_type, exc_val, exc_tb = sys.exc_info()
    print(exc_type, exc_val)
\`\`\`

## 九、上下文管理器与 __enter__ / __exit__

\`with\` 语句背后的协议叫**上下文管理器（context manager）**。任何实现了 \`__enter__\` 和 \`__exit__\` 两个方法的对象都能用 \`with\`。

### 9.1 协议定义

\`\`\`python
class MyResource:
    def __enter__(self):
        print("进入 with 块，获取资源")
        return self            # as 变量拿到的是这个返回值

    def __exit__(self, exc_type, exc_val, exc_tb):
        print("离开 with 块，释放资源")
        # exc_type / exc_val / exc_tb：如果 with 块里抛了异常，三者不为 None
        # 返回 True 表示"异常已被处理"，不再向上抛
        # 返回 False / None 表示"异常继续向上抛"
        return False
\`\`\`

### 9.2 自定义上下文管理器示例

\`\`\`python
class Timer:
    def __enter__(self):
        import time
        self.start = time.time()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        import time
        self.elapsed = time.time() - self.start
        print(f"耗时 {self.elapsed:.4f} 秒")
        return False

with Timer() as t:
    sum(range(1000000))
\`\`\`

### 9.3 __exit__ 处理异常

\`__exit__\` 的三个参数在 with 块没异常时全为 \`None\`，有异常时分别是异常类型、值、traceback。返回 \`True\` 会"吞掉"异常：

\`\`\`python
class SuppressError:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is ValueError:
            print(f"吞掉了 ValueError: {exc_val}")
            return True     # 不再向上抛
        return False

with SuppressError():
    raise ValueError("test")   # 会被 __exit__ 吞掉
print("继续运行")
\`\`\`

### 9.4 contextlib：更简便的写法

标准库 \`contextlib\` 提供 \`@contextmanager\` 装饰器，让你用一个生成器函数代替写类：

\`\`\`python
from contextlib import contextmanager

@contextmanager
def timer():
    import time
    start = time.time()
    try:
        yield          # with 块的代码在这里执行
    finally:
        print(f"耗时 {time.time() - start:.4f} 秒")

with timer():
    sum(range(1000000))
\`\`\`

\`yield\` 之前的部分相当于 \`__enter__\`，\`yield\` 之后相当于 \`__exit__\`。配合 \`try/finally\` 能优雅地保证资源释放。

\`contextlib.suppress(SomeError)\` 是个现成的"吞掉特定异常"的上下文管理器：

\`\`\`python
from contextlib import suppress
with suppress(FileNotFoundError):
    os.remove("maybe_missing.txt")   # 文件不存在也不报错
\`\`\`

## 十、异常处理的最佳实践

1. **具体优先**：捕获具体的异常类型，不要裸 \`except\`。
2. **try 块尽量小**：只包住"真正可能出错"的那几行。
3. **不要吞异常**：\`except: pass\` 是反模式，至少要记录日志。
4. **资源用 with**：文件、锁、连接，都用上下文管理器。
5. **自定义业务异常**：建立自己的异常层级，让上层能精确捕获。
6. **raise from 保留链**：转换异常时用 \`from\` 保留原始信息。
7. **不要用 assert 做校验**：用户输入、权限、业务规则用 \`if + raise\`。
8. **日志带 traceback**：\`traceback.format_exc()\` 是排查神器。
9. **finally 做清理**：即使有异常也要保证资源释放。
10. **不要在 except 里 return**：容易把异常藏起来，产生难以追踪的 bug。

异常处理是写出"工业级"代码的关键技能。下一章我们会学习模块与包——随着代码量增长，如何把代码组织成可复用的模块、用标准库和第三方库扩展能力，是 Python 工程化的基础。
`,
    code: `# ============================================================
# 异常处理演示代码
# ============================================================
import sys
import traceback

print("=" * 60)
print("第 1 部分：try / except 基础捕获")
print("=" * 60)

def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError as e:
        print(f"  捕获到 {type(e).__name__}: {e}")
        return None

print("10 / 2 =", safe_divide(10, 2))
print("10 / 0 =", safe_divide(10, 0))

print()
print("=" * 60)
print("第 2 部分：多分支 except + 元组捕获")
print("=" * 60)

def parse_and_index(s, idx):
    try:
        n = int(s)
        lst = [10, 20, 30]
        return lst[idx] / n
    except ValueError as e:
        print(f"  ValueError: {e}")
    except IndexError as e:
        print(f"  IndexError: {e}")
    except ZeroDivisionError as e:
        print(f"  ZeroDivisionError: {e}")
    return None

print(parse_and_index("2", 1))     # 正常 10.0
print(parse_and_index("abc", 1))   # ValueError
print(parse_and_index("2", 10))    # IndexError
print(parse_and_index("0", 1))     # ZeroDivisionError

print()
print("=" * 60)
print("第 3 部分：else 与 finally")
print("=" * 60)

def read_first_line(text):
    try:
        lines = text.split("\\n")
        first = lines[0]
    except IndexError:
        print("  -> except 分支：空文本")
        return None
    else:
        print("  -> else 分支：try 没抛异常")
        return first
    finally:
        print("  -> finally 分支：无论如何都执行")

print(read_first_line("hello\\nworld"))
print(read_first_line(""))

print()
print("=" * 60)
print("第 4 部分：raise 主动抛出")
print("=" * 60)

def set_age(age):
    if not isinstance(age, int):
        raise TypeError("age 必须是整数")
    if age < 0 or age > 150:
        raise ValueError(f"age 取值非法: {age}")
    return age

for v in [25, "abc", 200]:
    try:
        set_age(v)
        print(f"  {v!r} 设置成功")
    except (TypeError, ValueError) as e:
        print(f"  {v!r} 失败: {type(e).__name__}: {e}")

print()
print("=" * 60)
print("第 5 部分：异常链 raise from")
print("=" * 60)

def load_user(user_id):
    users = {1: "Alice", 2: "Bob"}
    if user_id not in users:
        raise KeyError(user_id)
    return users[user_id]

def get_user_name(user_id):
    try:
        return load_user(user_id)
    except KeyError as e:
        raise RuntimeError(f"用户 {user_id} 不存在") from e

try:
    get_user_name(99)
except RuntimeError as e:
    print("  外层异常:", e)
    print("  原始 __cause__:", repr(e.__cause__))

print()
print("=" * 60)
print("第 6 部分：自定义异常类层级")
print("=" * 60)

class InventoryError(Exception):
    """库存异常基类"""
    pass

class OutOfStockError(InventoryError):
    def __init__(self, item, available, requested):
        super().__init__(f"{item} 库存不足")
        self.item = item
        self.available = available
        self.requested = requested

class InvalidItemError(InventoryError):
    def __init__(self, item):
        super().__init__(f"未知商品: {item}")
        self.item = item

def deduct(item, qty, stock_map):
    if item not in stock_map:
        raise InvalidItemError(item)
    if qty > stock_map[item]:
        raise OutOfStockError(item, stock_map[item], qty)
    stock_map[item] -= qty
    return stock_map[item]

stock = {"iPhone": 5, "iPad": 3}
for item, qty in [("iPhone", 2), ("MacBook", 1), ("iPad", 10)]:
    try:
        left = deduct(item, qty, stock)
        print(f"  {item} 扣减 {qty}，剩余 {left}")
    except OutOfStockError as e:
        print(f"  {e.item} 缺货，差 {e.requested - e.available}")
    except InvalidItemError as e:
        print(f"  {e.item} 不在售")
    except InventoryError as e:
        # 兜底捕获所有库存异常
        print(f"  库存异常: {e}")

print()
print("=" * 60)
print("第 7 部分：assert 断言")
print("=" * 60)

def sqrt(x):
    assert x >= 0, f"sqrt 要求非负数，得到 {x}"
    return x ** 0.5

for v in [16, -4]:
    try:
        print(f"  sqrt({v}) =", sqrt(v))
    except AssertionError as e:
        print(f"  sqrt({v}) 断言失败:", e)

print()
print("=" * 60)
print("第 8 部分：traceback 提取异常信息")
print("=" * 60)

def deep():
    return 1 / 0

def middle():
    return deep()

def outer():
    middle()

try:
    outer()
except ZeroDivisionError:
    print("  format_exc 输出:")
    tb_str = traceback.format_exc()
    for line in tb_str.rstrip().split("\\n"):
        print("   ", line)
    exc_type, exc_val, exc_tb = sys.exc_info()
    print(f"  sys.exc_info 类型: {exc_type.__name__}")
    print(f"  sys.exc_info 值: {exc_val}")

print()
print("=" * 60)
print("第 9 部分：自定义上下文管理器")
print("=" * 60)

class Timer:
    def __enter__(self):
        import time
        self.start = time.time()
        print("  [Timer] 开始计时")
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        import time
        elapsed = time.time() - self.start
        if exc_type is None:
            print(f"  [Timer] 正常结束，耗时 {elapsed:.6f} 秒")
        else:
            print(f"  [Timer] 异常结束 {exc_type.__name__}，耗时 {elapsed:.6f} 秒")
        return False   # 不吞异常

with Timer():
    total = sum(range(100000))
    print(f"  求和结果: {total}")

print()
print("=" * 60)
print("第 10 部分：__exit__ 返回 True 吞掉异常")
print("=" * 60)

class SuppressValueError:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is ValueError:
            print(f"  吞掉 ValueError: {exc_val}")
            return True
        return False

with SuppressValueError():
    raise ValueError("故意抛的")
print("  with 块之后继续运行")

print()
print("=" * 60)
print("第 11 部分：contextlib 简化上下文管理器")
print("=" * 60)

from contextlib import contextmanager, suppress

@contextmanager
def tag(name):
    print(f"  <{name}>")
    yield
    print(f"  </{name}>")

with tag("html"):
    print("    hello")

# suppress 现成工具
import os
with suppress(KeyError):
    {}["missing"]   # 不会抛错
print("  suppress 之后继续运行")

print()
print("全部演示完成。")
`,
  },

  // =========================================================
  // 第三章：模块与包
  // =========================================================
  {
    id: "py-modules",
    group: "进阶",
    icon: "📦",
    title: "模块与包",
    content: `# 模块与包

当代码从几十行增长到几千行、几万行，全部塞在一个 \`.py\` 文件里显然不可维护。Python 用**模块（module）** 和**包（package）** 来组织代码：一个 \`.py\` 文件就是一个模块，一个含 \`__init__.py\` 的目录就是一个包。本章系统讲解如何导入、组织、发布 Python 代码，并速览常用标准库。

## 一、为什么需要模块化

把所有代码放一个文件的痛点：

1. **命名冲突**：几千个函数挤一个文件，名字越来越难起。
2. **加载慢**：启动时要把整个文件解析一遍。
3. **无法复用**：项目 A 想用项目 B 的某个函数，没法单独拿。
4. **协作困难**：多人改同一个文件，Git 冲突不断。
5. **职责混乱**：UI、数据库、业务逻辑混在一起，难以理解。

模块化的好处：**分而治之、按需加载、命名隔离、便于复用与测试**。

## 二、import 语法详解

### 2.1 最基本的 import

\`\`\`python
import math
print(math.pi)
print(math.sqrt(2))
\`\`\`

\`import math\` 把整个 \`math\` 模块加载进来，绑定到当前命名空间的 \`math\` 这个名字上。使用其内部成员时必须加 \`math.\` 前缀。

### 2.2 from import：只拿需要的

\`\`\`python
from math import pi, sqrt
print(pi)
print(sqrt(2))
\`\`\`

\`from math import pi\` 只把 \`pi\` 这个名字引入当前命名空间，调用时不用前缀。好处是简洁，坏处是**可能污染命名空间**——如果你 \`from math import log\`，又 \`from logging import log\`，后一个会覆盖前一个。

### 2.3 from module import *

\`\`\`python
from math import *    # 把 math 里所有公开名字都导入
\`\`\`

**强烈不推荐**。你不知道导入了哪些名字，极易产生冲突，IDE 也难以静态分析。除非在交互式终端临时演示，正式代码不要这么写。

模块作者可以通过定义 \`__all__ = ["foo", "bar"]\` 列表来控制 \`import *\` 实际导出哪些名字。

### 2.4 as 别名

\`\`\`python
import numpy as np                  # 给模块起短别名
from math import sqrt as square_root # 给成员起别名
import django.conf as conf
\`\`\`

社区有一些约定俗成的别名（\`numpy as np\`、\`pandas as pd\`、\`matplotlib.pyplot as plt\`），跟随习惯即可。

### 2.5 import 是语句，不是声明

\`import\` 是普通语句，可以出现在任何位置，包括 \`if\` / \`try\` 里：

\`\`\`python
try:
    import cjson as json
except ImportError:
    import json
\`\`\`

也可以在函数里 import（懒加载），减少启动时间：

\`\`\`python
def parse_pdf(path):
    import pdfplumber   # 只在用的时候才加载
    ...
\`\`\`

## 三、__name__ == "__main__"

每个模块都有一个内置属性 \`__name__\`：
- 当模块**被直接运行**（\`python foo.py\`）时，\`__name__\` 等于 \`"__main__"\`。
- 当模块**被别人 import** 时，\`__name__\` 等于模块名（如 \`"foo"\`）。

利用这点可以把"测试代码 / 命令行入口"放在 \`if __name__ == "__main__":\` 里，保证 import 时不执行：

\`\`\`python
# mymath.py
def add(a, b):
    return a + b

def _test():
    assert add(1, 2) == 3
    print("所有测试通过")

if __name__ == "__main__":
    _test()
\`\`\`

\`python mymath.py\` 会跑测试；\`import mymath\` 不会。这是 Python 写"既能当库又能当脚本"的惯用手法。

## 四、模块搜索路径 sys.path

\`import foo\` 时，Python 按顺序在这些位置找 \`foo.py\`：

1. **当前脚本所在目录**（不是工作目录！）。
2. **环境变量 \`PYTHONPATH\`** 里的目录。
3. **标准库目录**。
4. **第三方库目录**（\`site-packages\`）。

\`\`\`python
import sys
print(sys.path)   # 看看实际搜索路径
\`\`\`

可以通过 \`sys.path.insert(0, "/my/dir")\` 临时添加路径，但更好的做法是用包结构或 \`pip install -e .\`。

## 五、包（package）与 __init__.py

**包**就是"包含模块的目录"。从 Python 3.3 起，分两种包：

### 5.1 普通包（含 __init__.py）

\`\`\`
myproject/
├── __init__.py
├── models/
│   ├── __init__.py
│   ├── user.py
│   └── order.py
└── utils/
    ├── __init__.py
    └── string.py
\`\`\`

\`__init__.py\` 可以是空文件，它的存在告诉 Python"这个目录是个包"。也可以在里面写包的初始化代码、定义 \`__all__\`、做 re-export：

\`\`\`python
# models/__init__.py
from .user import User
from .order import Order
__all__ = ["User", "Order"]
\`\`\`

这样外部就能 \`from models import User\`，不用写 \`from models.user import User\`。

### 5.2 命名空间包（无 __init__.py）

Python 3.3+ 支持无 \`__init__.py\` 的"命名空间包"，可以把一个包分散在多个目录里。日常项目用得少，了解即可。

## 六、相对导入

包**内部**模块互相导入时，可以用相对导入，\`.\` 表示当前包，\`..\` 表示上一级：

\`\`\`python
# models/order.py
from .user import User       # 同级模块
from ..utils import helper   # 上一级包里的 utils
\`\`\`

相对导入**只能用在包内部**，不能在顶层脚本里用。如果直接 \`python models/order.py\` 跑这个文件，相对导入会报错——因为它不在"包的上下文"里。这时应该用 \`python -m models.order\` 启动。

## 七、标准库概览

Python 最大的卖点之一就是"自带电池（batteries included）"——标准库极其丰富。下面按主题速览高频模块。

### 7.1 math：数学函数

\`\`\`python
import math
math.pi, math.e          # 常数
math.sqrt(16)            # 4.0   平方根
math.pow(2, 10)          # 1024.0
math.log(100, 10)        # 2.0   对数
math.factorial(5)        # 120   阶乘
math.gcd(12, 18)         # 6     最大公约数
math.ceil(3.2)           # 4     向上取整
math.floor(3.8)          # 3     向下取整
math.isnan(float("nan")) # True
\`\`\`

\`math\` 处理的是普通浮点数。需要高精度或符号运算用 \`decimal\` / \`fractions\` / 第三方 \`sympy\`。

### 7.2 random：随机数

\`\`\`python
import random
random.random()                  # [0, 1) 浮点
random.randint(1, 100)           # [1, 100] 整数（含两端）
random.choice(["a", "b", "c"])   # 随机选一个
random.sample(range(100), 5)     # 不重复抽 5 个
random.shuffle(my_list)          # 原地打乱
random.gauss(0, 1)               # 高斯分布
\`\`\`

> \`random\` 模块**不适合做安全相关随机数**（密码、token）。安全场景用 \`secrets\` 模块：\`secrets.token_hex(16)\` 生成 32 位十六进制 token。

设置 \`random.seed(42)\` 可以让结果可复现，调试和测试时很有用。

### 7.3 datetime：日期时间

\`\`\`python
from datetime import datetime, date, timedelta, timezone

now = datetime.now()                  # 当前本地时间
utc = datetime.now(timezone.utc)      # UTC 时间
today = date.today()

dt = datetime(2024, 6, 15, 10, 30)
dt.year, dt.month, dt.day
dt.strftime("%Y-%m-%d %H:%M")         # 格式化为字符串
datetime.strptime("2024-06-15", "%Y-%m-%d")  # 字符串解析

delta = timedelta(days=7)
next_week = now + delta               # 日期加减

diff = datetime(2024, 12, 31) - datetime(2024, 1, 1)
diff.days                             # 365
\`\`\`

常用格式化占位符：\`%Y\` 年、\`%m\` 月、\`%d\` 日、\`%H\` 时（24h）、\`%M\` 分、\`%S\` 秒、\`%A\` 星期名、\`%B\` 月名。

### 7.4 collections：高级容器

\`\`\`python
from collections import Counter, defaultdict, deque, OrderedDict, namedtuple

# Counter：计数器
c = Counter("abracadabra")
print(c)                  # Counter({'a': 5, 'b': 2, 'r': 2, 'c': 1, 'd': 1})
c.most_common(2)          # [('a', 5), ('b', 2)]

# defaultdict：带默认值的 dict
dd = defaultdict(list)
dd["a"].append(1)         # 不用先 setdefault
dd["a"].append(2)

# deque：双端队列，头尾都 O(1)
dq = deque([1, 2, 3])
dq.appendleft(0)
dq.pop()                  # 3
dq.popleft()              # 0

# namedtuple：具名元组，轻量级不可变对象
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
p.x, p.y                  # 3, 4
\`\`\`

### 7.5 itertools：迭代器工具

\`\`\`python
from itertools import chain, product, combinations, permutations, groupby, islice, count, cycle, repeat

list(chain([1,2], [3,4]))                 # [1, 2, 3, 4]  串接
list(product("AB", "12"))                 # 笛卡尔积
list(combinations("ABC", 2))              # 组合
list(permutations("ABC", 2))              # 排列
list(islice(count(10), 5))                # [10,11,12,13,14]  切片无限迭代器
for k, g in groupby(sorted(data, key=...), key=...):
    ...
\`\`\`

\`itertools\` 让你写"流式"代码处理大数据，内存友好。

### 7.6 functools：函数工具

\`\`\`python
from functools import lru_cache, partial, reduce, wraps

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n-1) + fib(n-2)
# 缓存递归结果，性能从指数级降到线性

add3 = partial(lambda a, b, c: a+b+c, 1, 2)   # 预填参数
add3(3)   # 6

reduce(lambda x, y: x+y, [1,2,3,4], 0)        # 10 抇积
\`\`\`

\`functools.wraps\` 在写装饰器时用来保留原函数的元信息（\`__name__\` / \`__doc__\`），后面装饰器章节会详细讲。

### 7.7 os 与 sys

\`os\` 提供"操作系统"相关功能：路径、环境变量、进程。

\`\`\`python
import os
os.getcwd()              # 当前工作目录
os.environ["HOME"]       # 环境变量
os.listdir(".")          # 列出目录
os.path.join("a", "b")   # 路径拼接
os.system("ls")          # 执行 shell 命令（简单用法）
\`\`\`

\`sys\` 提供"解释器自身"相关功能：

\`\`\`python
import sys
sys.argv             # 命令行参数列表
sys.path             # 模块搜索路径
sys.exit(0)          # 退出程序
sys.stdin / stdout / stderr
sys.version_info     # Python 版本
\`\`\`

## 八、pip：安装第三方包

Python 包主要托管在 **PyPI**（https://pypi.org）。安装命令：

\`\`\`bash
pip install requests               # 装最新版
pip install requests==2.31.0       # 装指定版本
pip install "requests>=2.25,<3"    # 版本范围
pip install -r requirements.txt    # 批量安装
pip install -e .                   # 以"可编辑"模式装当前项目
pip uninstall requests             # 卸载
pip list                           # 列出已装包
pip show requests                  # 查看包信息
pip freeze > requirements.txt      # 导出依赖
\`\`\`

国内访问 PyPI 较慢，可以换源：

\`\`\`bash
pip install requests -i https://pypi.tuna.tsinghua.edu.cn/simple
\`\`\`

## 九、虚拟环境 venv

不同项目可能依赖同一个包的不同版本（项目 A 要 \`requests 2.20\`，项目 B 要 \`requests 2.31\`）。如果都装到全局，必然冲突。**虚拟环境（virtual environment）** 给每个项目一份独立的 Python 环境，互不干扰。

### 9.1 创建与激活

\`\`\`bash
# 在项目目录里创建一个叫 .venv 的虚拟环境
python -m venv .venv

# 激活（macOS / Linux）
source .venv/bin/activate

# 激活（Windows PowerShell）
.venv\\Scripts\\Activate.ps1

# 激活后命令行前会出现 (.venv) 标记
which python        # 会指向 .venv/bin/python
pip install requests # 只装到这个虚拟环境

# 退出虚拟环境
deactivate
\`\`\`

激活后，\`python\` 和 \`pip\` 都指向虚拟环境里的版本，安装的包也只存在于 \`.venv\` 目录里，删除即"卸载"。

### 9.2 虚拟环境的最佳实践

1. **每个项目一个 venv**，放在项目根目录的 \`.venv\`，加入 \`.gitignore\`。
2. **导出 \`requirements.txt\`**，提交到 Git，别人 clone 后 \`pip install -r\` 即可。
3. **不要把 venv 目录提交到 Git**，体积大且跨平台不兼容。
4. 更现代的工具：\`poetry\` / \`uv\` / \`pdm\`，能同时管理虚拟环境和依赖锁文件。

## 十、name mangling：双下划线开头的"私有"

Python 没有真正的 \`private\` / \`protected\` 关键字，靠**约定**控制可见性：

- \`name\`：公开，外部可访问。
- \`_name\`：**约定为内部使用**（"弱私有"），IDE 不会自动补全，但外部强行访问也能拿到。
- \`__name\`：**名称改写（name mangling）**，类内定义的 \`__x\` 会被改写成 \`_ClassName__x\`，主要用来避免**多继承时同名属性冲突**，不是真正的访问控制。

\`\`\`python
class A:
    def __init__(self):
        self.public = 1
        self._internal = 2
        self.__mangled = 3

a = A()
print(a.public)        # 1
print(a._internal)     # 2  能访问，但约定不要
# print(a.__mangled)   # AttributeError
print(a._A__mangled)   # 3  改写后的名字能访问
\`\`\`

> 不要把 \`__双下划线\` 当成"私有化工具"，它只是为多继承设计的名字隔离。真正的"内部约定"用一个下划线就够了。

## 十一、模块的常见陷阱

1. **循环导入**：A import B、B import A，会导致其中一方拿到的还是"半初始化"的模块。解决：把公共部分抽到 C、或在函数内部 import、或重构。
2. **直接跑包内文件**：\`python models/user.py\` 里写相对导入会报错。用 \`python -m models.user\`。
3. **\`import *\` 污染**：少用。
4. **修改 sys.path**：临时方案能用，长期应该用包结构或 \`pip install -e .\`。
5. **命名与标准库冲突**：不要把文件叫 \`math.py\` / \`random.py\` / \`string.py\`，否则 \`import math\` 会导入你的文件而不是标准库。
6. **缓存**：模块只会被导入一次，后续 \`import\` 拿到的是缓存对象。要重新加载用 \`importlib.reload(mod)\`。

掌握模块与包，你就能把代码组织成可维护、可复用的结构。下一章我们学习面向对象编程——Python 用 class 表达"数据 + 行为"的方式，是构建大型系统的核心抽象。
`,
    code: `# ============================================================
# 模块与包演示代码
# 主要演示标准库模块的常用功能
# ============================================================
import math
import random
import sys
from datetime import datetime, date, timedelta, timezone
from collections import Counter, defaultdict, deque, namedtuple
from itertools import chain, product, combinations, permutations, islice, count
from functools import lru_cache, partial, reduce

print("=" * 60)
print("第 1 部分：math 数学函数")
print("=" * 60)
print("pi =", math.pi)
print("e  =", math.e)
print("sqrt(16)   =", math.sqrt(16))
print("pow(2, 10) =", math.pow(2, 10))
print("log(100,10)=", math.log(100, 10))
print("factorial(5)=", math.factorial(5))
print("gcd(12, 18)=", math.gcd(12, 18))
print("ceil(3.2) =", math.ceil(3.2))
print("floor(3.8)=", math.floor(3.8))
print("isnan(nan)=", math.isnan(float("nan")))

print()
print("=" * 60)
print("第 2 部分：random 随机数（设置 seed 可复现）")
print("=" * 60)
random.seed(42)
print("random()       =", random.random())
print("randint(1, 100)=", random.randint(1, 100))
print("choice   =", random.choice(["苹果", "香蕉", "橙子"]))
print("sample   =", random.sample(range(1, 50), 6))
lst = [1, 2, 3, 4, 5]
random.shuffle(lst)
print("shuffle  =", lst)

print()
print("=" * 60)
print("第 3 部分：datetime 日期时间")
print("=" * 60)
now = datetime.now()
print("now()        =", now)
utc = datetime.now(timezone.utc)
print("utcnow()     =", utc)
print("today date   =", date.today())
dt = datetime(2024, 6, 15, 10, 30)
print("自定义时间    =", dt)
print("strftime     =", dt.strftime("%Y-%m-%d %H:%M:%S"))
parsed = datetime.strptime("2024-06-15", "%Y-%m-%d")
print("strptime     =", parsed)
next_week = now + timedelta(days=7)
print("7 天后       =", next_week.strftime("%Y-%m-%d"))
diff = datetime(2024, 12, 31) - datetime(2024, 1, 1)
print("年内间隔天数  =", diff.days)

print()
print("=" * 60)
print("第 4 部分：collections 高级容器")
print("=" * 60)

c = Counter("abracadabra")
print("Counter     =", c)
print("most_common2=", c.most_common(2))

dd = defaultdict(list)
for word in ["apple", "banana", "avocado", "berry"]:
    dd[word[0]].append(word)
print("defaultdict =", dict(dd))

dq = deque([1, 2, 3])
dq.appendleft(0)
dq.append(4)
print("deque       =", list(dq))
print("pop()       =", dq.pop())
print("popleft()   =", dq.popleft())

Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
print("namedtuple  =", p, "x=", p.x, "y=", p.y)
print("distance    =", math.hypot(p.x, p.y))

print()
print("=" * 60)
print("第 5 部分：itertools 迭代器工具")
print("=" * 60)
print("chain       =", list(chain([1, 2], [3, 4])))
print("product     =", list(product("AB", "12")))
print("combinations=", list(combinations("ABC", 2)))
print("permutations=", list(permutations("AB", 2)))
print("islice      =", list(islice(count(10), 5)))

print()
print("=" * 60)
print("第 6 部分：functools 函数工具")
print("=" * 60)

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print("fib(30)     =", fib(30))
print("cache_info  =", fib.cache_info())

def add3(a, b, c):
    return a + b + c

add_1_2 = partial(add3, 1, 2)
print("partial     =", add_1_2(3))

total = reduce(lambda x, y: x + y, [1, 2, 3, 4, 5], 0)
print("reduce sum  =", total)

print()
print("=" * 60)
print("第 7 部分：os 与 sys 基础查询")
print("=" * 60)
import os
print("getcwd()    =", os.getcwd())
print("HOME env    =", os.environ.get("HOME", "未设置"))
print("listdir 前几个 =", sorted(os.listdir("."))[:5])
print("sys.argv    =", sys.argv)
print("sys.version =", sys.version.split()[0])
print("sys.platform=", sys.platform)
print("sys.path 数量 =", len(sys.path))

print()
print("=" * 60)
print("第 8 部分：__name__ == __main__ 模拟")
print("=" * 60)

# 演示模块名变化
def module_main_demo():
    print("  如果直接运行，__name__ =", __name__)
    if __name__ == "__main__":
        print("  -> 走 main 分支")
    else:
        print("  -> 走被导入分支")

module_main_demo()

print()
print("=" * 60)
print("第 9 部分：name mangling 名称改写")
print("=" * 60)

class Demo:
    def __init__(self):
        self.public = 1
        self._internal = 2
        self.__private = 3

d = Demo()
print("public     =", d.public)
print("_internal  =", d._internal)
print("_Demo__private =", d._Demo__private)
print("Demo 实例的属性列表:", [x for x in vars(d)])

print()
print("=" * 60)
print("第 10 部分：partial 与 reduce 组合实战")
print("=" * 60)

# 用 reduce 实现 cumsum
nums = [3, 1, 4, 1, 5, 9, 2, 6]
cumsum = []
reduce(lambda acc, x: (cumsum.append(acc + x), acc + x)[1], nums, 0)
print("原始:", nums)
print("累计:", cumsum)

# 用 partial 构造乘法器
multiply_by_3 = partial(lambda a, b: a * b, 3)
print("3 * 7 =", multiply_by_3(7))

print()
print("全部演示完成。")
`,
  },

  // =========================================================
  // 第四章：面向对象
  // =========================================================
  {
    id: "py-oop",
    group: "进阶",
    icon: "🎭",
    title: "面向对象",
    content: `# 面向对象编程

**面向对象编程（Object-Oriented Programming, OOP）** 是一种把"数据"和"操作数据的行为"打包到一起的组织范式。Python 是一门**多范式**语言——你可以写过程式、函数式，也可以写面向对象。但 Python 的标准库、第三方框架（Django、Flask、SQLAlchemy）大量使用类与对象，理解 OOP 是阅读和编写"工业级" Python 代码的必备技能。

## 一、为什么需要面向对象

假设你要管理一群学生：姓名、年龄、成绩、选课。用过程式写：

\`\`\`python
names = ["Alice", "Bob"]
ages = [20, 21]
scores = [85, 92]
# 加一个学生要在三个列表里同步 append，容易漏
\`\`\`

或者用字典：

\`\`\`python
students = [
    {"name": "Alice", "age": 20, "score": 85},
    {"name": "Bob", "age": 21, "score": 92},
]
# 每个学生都要重复写字段名，没有"行为"
\`\`\`

用类：

\`\`\`python
class Student:
    def __init__(self, name, age, score):
        self.name = name
        self.age = age
        self.score = score

    def grade(self):
        if self.score >= 90: return "A"
        if self.score >= 80: return "B"
        return "C"

students = [Student("Alice", 20, 85), Student("Bob", 21, 92)]
for s in students:
    print(s.name, s.grade())
\`\`\`

OOP 的好处：
1. **数据与行为打包**：学生知道自己怎么算等级。
2. **类型抽象**：\`Student\` 是一个清晰的概念。
3. **封装**：内部实现可以隐藏，对外只暴露接口。
4. **继承与多态**：复用代码，统一接口不同实现。

## 二、class 与 __init__

\`class\` 关键字定义一个类。\`__init__\` 是**初始化方法**，在创建实例时自动调用，用来设置实例属性。

\`\`\`python
class Dog:
    def __init__(self, name, age):
        self.name = name      # 实例属性
        self.age = age

    def bark(self):           # 实例方法
        print(f"{self.name} 汪汪！")
\`\`\`

### 2.1 self 是什么

\`self\` 是**实例本身的引用**。调用 \`d.bark()\` 时，Python 自动把 \`d\` 作为第一个参数传给 \`bark\`，所以方法第一个参数永远是 \`self\`（名字可以改但社区约定用 \`self\`）。

\`\`\`python
d = Dog("旺财", 3)
d.bark()         # 等价于 Dog.bark(d)
\`\`\`

### 2.2 类属性 vs 实例属性

类属性定义在类体里、所有方法外，被所有实例**共享**：

\`\`\`python
class Dog:
    species = "Canis lupus"   # 类属性
    count = 0

    def __init__(self, name):
        self.name = name      # 实例属性
        Dog.count += 1        # 修改类属性要用类名

d1 = Dog("A"); d2 = Dog("B")
print(Dog.count)              # 2
\`\`\`

> 实例属性通过 \`self.x = ...\` 赋值，类属性通过 \`ClassName.x\` 访问。如果在实例上读 \`self.species\`，会先找实例属性，找不到再找类属性——这叫**属性查找链**。但在实例上**赋值** \`self.species = ...\` 会在实例上新建一个属性，不会影响类属性，这是个常见坑。

## 三、实例方法 / 类方法 / 静态方法

类里可以定义三种方法：

### 3.1 实例方法（默认）

第一个参数是 \`self\`，能访问实例属性。最常见。

\`\`\`python
class Counter:
    def __init__(self):
        self.value = 0
    def inc(self):
        self.value += 1
\`\`\`

### 3.2 类方法 @classmethod

第一个参数是**类本身**（约定叫 \`cls\`），常用于"工厂方法"——以不同方式构造实例：

\`\`\`python
class Date:
    def __init__(self, year, month, day):
        self.year, self.month, self.day = year, month, day

    @classmethod
    def from_string(cls, s):
        y, m, d = map(int, s.split("-"))
        return cls(y, m, d)      # cls 就是 Date（或子类）

d = Date.from_string("2024-06-15")
\`\`\`

\`cls\` 在被继承时会自动变成子类，所以工厂方法对子类也友好。

### 3.3 静态方法 @staticmethod

没有 \`self\` 也没有 \`cls\`，本质上就是一个**放在类命名空间里的普通函数**。用来表达"这个函数逻辑上属于这个类，但不依赖实例或类状态"：

\`\`\`python
class MathUtils:
    @staticmethod
    def is_even(n):
        return n % 2 == 0

MathUtils.is_even(4)   # True
\`\`\`

能用模块函数就别用静态方法——只有当函数与类强相关时才放进来。

## 四、@property：把方法伪装成属性

\`@property\` 装饰器让一个方法**像属性一样访问**，常用于"计算属性"或"受控读写"：

\`\`\`python
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def area(self):
        return 3.14159 * self._radius ** 2

    @property
    def radius(self):
        return self._radius

    @radius.setter
    def radius(self, value):
        if value <= 0:
            raise ValueError("半径必须为正")
        self._radius = value

c = Circle(5)
print(c.area)        # 78.5...  像属性一样访问
c.radius = 10        # 走 setter，会校验
\`\`\`

\`@property\` 让你能在"公开属性"和"方法调用"之间无缝切换：一开始用普通属性，后来想加校验，改成 property 而调用方代码不用改——这是 Python 不强求 getter/setter 的优雅之处。

\`@property\` + \`@x.setter\` + \`@x.deleter\` 三件套可以完整控制一个属性的读、写、删。

## 五、继承

继承让子类**复用**父类的属性和方法，并可以扩展或修改：

\`\`\`python
class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self):
        print(f"{self.name} 发出声音")

class Dog(Animal):
    def speak(self):       # 重写父类方法
        print(f"{self.name} 汪汪！")

class Cat(Animal):
    def speak(self):
        print(f"{self.name} 喵～")

for a in [Dog("旺财"), Cat("咪咪")]:
    a.speak()              # 多态：同一个接口，不同行为
\`\`\`

### 5.1 super()：调用父类

\`super()\` 返回父类的"代理对象"，可以调用父类的方法。常用于子类 \`__init__\` 里复用父类初始化逻辑：

\`\`\`python
class Animal:
    def __init__(self, name):
        self.name = name

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)   # 调用 Animal.__init__
        self.breed = breed
\`\`\`

### 5.2 方法重写（override）

子类定义与父类同名的方法，调用时优先用子类的——这就是"重写"。子类方法可以通过 \`super().method()\` 复用父类逻辑后追加。

\`\`\`python
class Animal:
    def describe(self):
        return "一只动物"

class Dog(Animal):
    def describe(self):
        return super().describe() + "，是狗"
\`\`\`

### 5.3 isinstance 与 issubclass

\`\`\`python
isinstance(d, Dog)         # True
isinstance(d, Animal)      # True  子类实例也是父类
issubclass(Dog, Animal)    # True
type(d) is Dog             # True  严格类型判断，不考虑继承
\`\`\`

\`isinstance\` 考虑继承链，是 Python 里做类型判断的推荐方式（"鸭子类型"风格更推荐 \`hasattr\` / \`try\`）。

## 六、多继承与 MRO

Python 支持**多继承**——一个类可以继承多个父类：

\`\`\`python
class Flyable:
    def fly(self): print("飞")

class Swimmable:
    def swim(self): print("游")

class Duck(Flyable, Swimmable):
    pass

d = Duck()
d.fly(); d.swim()
\`\`\`

但多继承有个经典难题：**菱形继承**——A 是 B 和 C 的父类，B、C 都重写了 A 的方法，D 继承 B 和 C，那 D 调用 A 的方法时走 B 还是 C？

Python 用 **C3 线性化（C3 linearization）** 算法计算一个**方法解析顺序（Method Resolution Order, MRO）**，保证顺序"一致且合理"。可以用 \`ClassName.__mro__\` 或 \`ClassName.mro()\` 查看：

\`\`\`python
class A: pass
class B(A): pass
class C(A): pass
class D(B, C): pass
print(D.__mro__)
# (<class 'D'>, <class 'B'>, <class 'C'>, <class 'A'>, <class 'object'>)
\`\`\`

\`super()\` 在多继承下不是"调父类"，而是**调 MRO 里的下一个类**。这使得多继承下的协作式调用成为可能，但也让代码难以理解。新代码建议用 **Mixin 模式** + 组合，避免复杂的多继承。

## 七、魔术方法（dunder methods）

Python 通过一系列 \`__xxx__\` 双下划线方法（dunder = double underscore）让自定义类支持内置操作：\`str()\`、\`len()\`、\`==\`、\`<\`、\`[]\`、\`for\`、\`()\` 等。这是 Python OOP 最优雅的部分——让你的对象"看起来像内置类型"。

### 7.1 __str__ 与 __repr__

- \`__str__\`：给最终用户看的字符串，\`str(obj)\` / \`print(obj)\` 调用。
- \`__repr__\`：给开发者看的"官方"字符串，\`repr(obj)\` 调用；交互式终端直接显示对象时也用这个。理想情况下 \`repr\` 输出的字符串能 \`eval\` 回原对象。

\`\`\`python
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __repr__(self):
        return f"Point({self.x!r}, {self.y!r})"
    def __str__(self):
        return f"({self.x}, {self.y})"
\`\`\`

如果只实现一个，实现 \`__repr__\`——因为 \`__str__\` 缺失时会回退到 \`__repr__\`。

### 7.2 __eq__ 与 __lt__：比较

\`\`\`python
class Point:
    def __init__(self, x, y): self.x, self.y = x, y
    def __eq__(self, other):
        if not isinstance(other, Point): return NotImplemented
        return self.x == other.x and self.y == other.y
    def __lt__(self, other):
        return (self.x, self.y) < (other.x, other.y)
\`\`\`

实现了 \`__eq__\` 和 \`__lt__\` 后，\`==\` / \`<\` 可用，再用 \`functools.total_ordering\` 装饰器能自动补齐 \`<=\` / \`>\` / \`>=\`。

### 7.3 __len__、__getitem__、__contains__

\`\`\`python
class Stack:
    def __init__(self): self._data = []
    def __len__(self): return len(self._data)
    def __getitem__(self, i): return self._data[i]
    def __contains__(self, item): return item in self._data
\`\`\`

实现了这些方法后，\`len(stack)\`、\`stack[0]\`、\`x in stack\` 都能用，对象就像一个序列。

### 7.4 __iter__ 与 __next__：迭代

\`\`\`python
class Range2:
    def __init__(self, n): self.n = n; self.i = 0
    def __iter__(self): return self
    def __next__(self):
        if self.i >= self.n: raise StopIteration
        v = self.i; self.i += 1
        return v

for x in Range2(3): print(x)   # 0 1 2
\`\`\`

实现了 \`__iter__\` 的对象就能用在 \`for\` 循环、\`list()\`、\`sum()\` 等所有需要迭代的地方。

### 7.5 __call__：实例像函数一样调用

\`\`\`python
class Adder:
    def __init__(self, n): self.n = n
    def __call__(self, x): return self.n + x

add5 = Adder(5)
add5(3)   # 8
\`\`\`

实现 \`__call__\` 的对象叫"仿函数（functor）"，可以保留状态又像函数一样调用，常用于装饰器、回调。

### 7.6 常用魔术方法速查

| 方法 | 触发 |
| --- | --- |
| \`__init__\` | 构造实例 |
| \`__str__\` / \`__repr__\` | \`str()\` / \`repr()\` / \`print()\` |
| \`__eq__\` \`__ne__\` \`__lt__\` \`__le__\` \`__gt__\` \`__ge__\` | 比较运算符 |
| \`__hash__\` | \`hash()\`，可作 dict key |
| \`__bool__\` \`__len__\` | \`bool(obj)\` |
| \`__getitem__\` \`__setitem__\` \`__delitem__\` | \`obj[k]\` |
| \`__contains__\` | \`x in obj\` |
| \`__iter__\` \`__next__\` | \`for x in obj\` |
| \`__call__\` | \`obj(...)\` |
| \`__len__\` | \`len(obj)\` |
| \`__add__\` \`__sub__\` \`__mul__\` ... | 算术运算符 |
| \`__enter__\` \`__exit__\` | \`with obj\` |
| \`__getattr__\` \`__setattr__\` | 属性访问钩子 |

## 八、封装与"私有"

Python 没有真正的访问控制关键字，靠约定：

- \`public\`：普通名字，公开。
- \`_protected\`：一个下划线开头，约定"内部用"（弱私有）。
- \`__private\`：双下划线开头（且不以双下划线结尾），触发 **name mangling**，改写为 \`_ClassName__private\`，避免多继承同名冲突。

\`\`\`python
class Account:
    def __init__(self, owner, balance):
        self.owner = owner         # 公开
        self._balance = balance    # 内部约定
        self.__pin = "1234"        # name mangling

    @property
    def balance(self):
        return self._balance
\`\`\`

> Python 哲学："We are all consenting adults here"（大家都是成年人）。任何"私有"都能强行访问，约定胜过强制。真正的封装靠**清晰的接口设计 + property 控制读写**，而不是访问修饰符。

## 九、dataclass：现代数据类

Python 3.7 引入 \`@dataclass\` 装饰器，自动生成 \`__init__\` / \`__repr__\` / \`__eq__\` 等样板代码，写"数据载体"类极其简洁：

\`\`\`python
from dataclasses import dataclass, field

@dataclass
class Student:
    name: str
    age: int
    score: float = 0.0
    tags: list = field(default_factory=list)

s1 = Student("Alice", 20, 85.5)
s2 = Student("Alice", 20, 85.5)
print(s1)            # 自动生成的 __repr__
print(s1 == s2)      # True  自动生成的 __eq__
\`\`\`

\`@dataclass\` 的关键参数：
- \`frozen=True\`：实例不可变（可哈希，可作 dict key）。
- \`order=True\`：自动生成 \`__lt__\` 等比较方法，可排序。
- \`field(default_factory=...)\`：可变默认值必须用 factory，避免"所有实例共享同一个 list"的经典坑。

\`\`\`python
@dataclass(frozen=True, order=True)
class Point:
    x: float
    y: float

points = [Point(3, 4), Point(1, 2), Point(1, 1)]
sorted(points)    # 自动按 x 再按 y 排序
\`\`\`

\`dataclass\` 大幅减少了模板代码，是写"数据模型"的首选。比 \`namedtuple\` 更灵活（可变、可有方法、可有默认值）。

## 十、OOP 设计原则速览

1. **单一职责**：一个类只做一件事。
2. **开放-封闭**：对扩展开放，对修改封闭——用继承 / 组合扩展，少改老代码。
3. **里氏替换**：子类实例能无感替换父类实例，行为不破坏。
4. **组合优于继承**：has-a 关系用组合（把另一个对象作为属性），is-a 才用继承。继承层级过深是维护噩梦。
5. **依赖抽象**：依赖接口/抽象类，而不是具体实现。
6. **不要过度设计**：Python 鸭子类型本来就灵活，简单的数据用 dict / dataclass 就够，别为了"模式"硬套类层级。

掌握 OOP，你就能用 Python 写出结构清晰、易于扩展、便于测试的复杂系统。本章结束第 3 批"进阶"组的学习，下一批将进入更高级的主题。
`,
    code: `# ============================================================
# 面向对象演示代码
# ============================================================
import math
from dataclasses import dataclass, field
from functools import total_ordering

print("=" * 60)
print("第 1 部分：类与实例基础")
print("=" * 60)

class Dog:
    species = "Canis lupus"   # 类属性
    count = 0

    def __init__(self, name, age):
        self.name = name      # 实例属性
        self.age = age
        Dog.count += 1

    def bark(self):           # 实例方法
        return f"{self.name} 汪汪！"

d1 = Dog("旺财", 3)
d2 = Dog("小黑", 5)
print(d1.bark())
print(d2.bark())
print("类属性 species:", Dog.species)
print("实例总数 count:", Dog.count)

print()
print("=" * 60)
print("第 2 部分：类方法 / 静态方法 / 工厂")
print("=" * 60)

class Date:
    def __init__(self, year, month, day):
        self.year, self.month, self.day = year, month, day

    @classmethod
    def from_string(cls, s):
        y, m, d = map(int, s.split("-"))
        return cls(y, m, d)

    @staticmethod
    def is_leap(year):
        return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)

    def __repr__(self):
        return f"Date({self.year}, {self.month}, {self.day})"

d = Date.from_string("2024-06-15")
print("工厂方法构造:", d)
print("2024 是闰年吗:", Date.is_leap(2024))
print("2100 是闰年吗:", Date.is_leap(2100))

print()
print("=" * 60)
print("第 3 部分：@property 计算属性与受控读写")
print("=" * 60)

class Circle:
    def __init__(self, radius):
        self.radius = radius     # 走 setter

    @property
    def radius(self):
        return self._radius

    @radius.setter
    def radius(self, value):
        if value <= 0:
            raise ValueError("半径必须为正")
        self._radius = value

    @property
    def area(self):
        return math.pi * self._radius ** 2

    @property
    def perimeter(self):
        return 2 * math.pi * self._radius

c = Circle(5)
print("半径:", c.radius)
print("面积: %.4f" % c.area)
print("周长: %.4f" % c.perimeter)
c.radius = 10
print("改半径后面积: %.4f" % c.area)
try:
    c.radius = -1
except ValueError as e:
    print("捕获:", e)

print()
print("=" * 60)
print("第 4 部分：继承与 super()")
print("=" * 60)

class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self):
        return f"{self.name} 发出声音"
    def describe(self):
        return f"一只叫 {self.name} 的动物"

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)
        self.breed = breed
    def speak(self):                # 重写
        return f"{self.name} 汪汪！"
    def describe(self):             # 重写 + 复用父类
        return super().describe() + f"，品种 {self.breed}"

class Cat(Animal):
    def speak(self):
        return f"{self.name} 喵～"

# 多态
for a in [Dog("旺财", "柴犬"), Cat("咪咪")]:
    print(a.describe(), "|", a.speak())
print("Dog 是 Animal 子类吗:", issubclass(Dog, Animal))
print("d 是 Animal 实例吗:", isinstance(Dog("a", "b"), Animal))

print()
print("=" * 60)
print("第 5 部分：多继承与 MRO")
print("=" * 60)

class A:
    def greet(self): return "A"

class B(A):
    def greet(self): return "B -> " + super().greet()

class C(A):
    def greet(self): return "C -> " + super().greet()

class D(B, C):
    def greet(self): return "D -> " + super().greet()

d = D()
print("D.greet():", d.greet())
print("D 的 MRO:", [c.__name__ for c in D.__mro__])

print()
print("=" * 60)
print("第 6 部分：魔术方法 __str__ / __repr__ / __eq__ / __lt__")
print("=" * 60)

@total_ordering
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __repr__(self):
        return f"Point({self.x!r}, {self.y!r})"
    def __str__(self):
        return f"({self.x}, {self.y})"
    def __eq__(self, other):
        if not isinstance(other, Point):
            return NotImplemented
        return self.x == other.x and self.y == other.y
    def __lt__(self, other):
        return (self.x, self.y) < (other.x, other.y)
    def __hash__(self):
        return hash((self.x, self.y))

p1 = Point(1, 2)
p2 = Point(1, 2)
p3 = Point(3, 4)
print("repr(p1):", repr(p1))
print("str(p1): ", str(p1))
print("p1 == p2:", p1 == p2)
print("p1 <  p3:", p1 < p3)
print("p3 >= p1:", p3 >= p1)
print("排序:", sorted([Point(3, 4), Point(1, 2), Point(1, 1)]))
print("可哈希作 key:", {p1: "first", p3: "third"}[Point(1, 2)])

print()
print("=" * 60)
print("第 7 部分：__len__ / __getitem__ / __contains__ / __iter__")
print("=" * 60)

class IntRange:
    def __init__(self, start, end):
        self.start, self.end = start, end
    def __len__(self):
        return max(0, self.end - self.start)
    def __getitem__(self, i):
        if i < 0 or i >= len(self):
            raise IndexError(i)
        return self.start + i
    def __contains__(self, v):
        return self.start <= v < self.end
    def __iter__(self):
        i = self.start
        while i < self.end:
            yield i
            i += 1

r = IntRange(10, 15)
print("len:", len(r))
print("r[0], r[2], r[-1 尝试]")
print("r[0] =", r[0])
print("r[2] =", r[2])
try:
    print(r[-1])
except IndexError as e:
    print("IndexError:", e)
print("12 in r:", 12 in r)
print("99 in r:", 99 in r)
print("迭代:", list(r))
print("求和:", sum(r))

print()
print("=" * 60)
print("第 8 部分：__call__ 仿函数")
print("=" * 60)

class Adder:
    def __init__(self, n):
        self.n = n
    def __call__(self, x):
        return self.n + x

class Multiplier:
    def __init__(self, n):
        self.n = n
    def __call__(self, x):
        return self.n * x

add5 = Adder(5)
mul3 = Multiplier(3)
print("add5(10)  =", add5(10))
print("mul3(10)  =", mul3(10))
# 仿函数可以当函数用
funcs = [add5, mul3, lambda x: x - 1]
print("依次应用:", [f(10) for f in funcs])

print()
print("=" * 60)
print("第 9 部分：封装与 name mangling")
print("=" * 60)

class Account:
    def __init__(self, owner, balance, pin):
        self.owner = owner          # 公开
        self._balance = balance     # 约定内部
        self.__pin = pin            # name mangling

    @property
    def balance(self):
        return self._balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("存款必须为正")
        self._balance += amount
        return self._balance

acc = Account("Alice", 1000, "1234")
print("owner:", acc.owner)
print("balance:", acc.balance)
acc.deposit(500)
print("存款后:", acc.balance)
print("_balance 可直接读:", acc._balance)
print("__pin 改写后:", acc._Account__pin)

print()
print("=" * 60)
print("第 10 部分：dataclass 数据类")
print("=" * 60)

@dataclass
class Student:
    name: str
    age: int
    score: float = 0.0
    tags: list = field(default_factory=list)

s1 = Student("Alice", 20, 85.5)
s2 = Student("Alice", 20, 85.5)
s3 = Student("Bob", 21)
print("s1:", s1)
print("s1 == s2:", s1 == s2)
print("s3 默认 score:", s3.score, "tags:", s3.tags)
s3.tags.append("新生")
print("s3.tags:", s3.tags)
# 验证 default_factory 隔离
s4 = Student("Carol", 22)
print("s4.tags 与 s3.tags 是否同一个:", s4.tags is s3.tags)

print()
print("=" * 60)
print("第 11 部分：frozen dataclass 不可变 + 可排序")
print("=" * 60)

@dataclass(frozen=True, order=True)
class Point2D:
    x: float
    y: float

pts = [Point2D(3, 4), Point2D(1, 2), Point2D(1, 1), Point2D(2, 5)]
print("排序前:", pts)
print("排序后:", sorted(pts))
p = Point2D(1, 2)
print("可哈希:", hash(p))
try:
    p.x = 10
except Exception as e:
    print("修改 frozen 实例报错:", type(e).__name__, e)

print()
print("=" * 60)
print("第 12 部分：综合实战 —— 自定义可迭代容器")
print("=" * 60)

class Playlist:
    def __init__(self, name, songs=None):
        self.name = name
        self._songs = list(songs) if songs else []

    def add(self, song):
        self._songs.append(song)

    def __len__(self):
        return len(self._songs)

    def __getitem__(self, i):
        return self._songs[i]

    def __iter__(self):
        return iter(self._songs)

    def __contains__(self, song):
        return song in self._songs

    def __repr__(self):
        return f"Playlist({self.name!r}, {len(self)} 首)"

pl = Playlist("我的歌单", ["稻香", "晴天"])
pl.add("夜曲")
pl.add("七里香")
print(pl)
print("总数:", len(pl))
print("第 1 首:", pl[0])
print("夜曲 在歌单吗:", "夜曲" in pl)
print("遍历:")
for i, song in enumerate(pl, 1):
    print(f"  {i}. {song}")

print()
print("全部演示完成。")
`,
  },
];
