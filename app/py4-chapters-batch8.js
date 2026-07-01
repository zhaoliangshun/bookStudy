// =============================================================
// Batch 8：文件与 IO（4 章）
// 29. py4-file-read    文本读写、with、encoding
// 30. py4-file-binary   二进制读写、seek/tell
// 31. py4-pathlib       pathlib：面向对象路径操作
// 32. py4-serial        json/csv/toml 序列化
// =============================================================

export const chapters = [
  {
    id: "py4-file-read",
    group: "文件与 IO",
    icon: "📄",
    title: "文本文件读写：with、encoding",
    content: `
文件读写是 Python 最基础也最容易踩坑的 IO 操作。本节从底层原理出发，讲清楚 open() 模式、上下文管理器、编码、各种读写方法的差异。

## 一、open() 的打开模式

\`open(file, mode, encoding)\` 返回一个文件对象。mode 是一个字符串，由「主模式 + 修饰符」组合而成：

| 模式 | 含义 | 文件不存在时 | 文件已存在时 |
|------|------|--------------|--------------|
| \`r\` | 只读（默认） | 抛 \`FileNotFoundError\` | 从头读 |
| \`w\` | 覆盖写 | 创建新文件 | **清空原内容** |
| \`a\` | 追加写 | 创建新文件 | 在文件末尾追加 |
| \`x\` | 排他创建 | 创建新文件 | **抛 \`FileExistsError\`** |
| \`r+\` | 读写（不截断） | 抛 \`FileNotFoundError\` | 保留原内容，可读可写 |

设计原理：
- \`w\` 覆盖写是一种"破坏性"操作，使用前一定要确认；它是为了让"写新文件"语义清晰（不用先删再建）。
- \`x\` 是 Python3 新增的，专门解决「并发写同一个文件」竞态问题——比"先 exists() 判断再 w"更原子，避免 TOCTOU（time-of-check to time-of-use）漏洞。
- \`r+\` 不会清空文件，但写入会覆盖对应位置的原始字节，要小心。

## 二、with open() as f：上下文管理器自动关闭

\`\`\`python
with open("a.txt", "r", encoding="utf-8") as f:
    data = f.read()
# 离开 with 块后 f 自动 close，即使上面抛异常也会关闭
\`\`\`

原理：
- \`with\` 语句会调用文件对象的 \`__enter__()\`（返回文件对象本身）和 \`__exit__()\`。
- \`__exit__()\` 内部保证调用 \`f.close()\`，**即使 \`with\` 块内抛异常也会执行**。
- 等价于 \`try ... finally: f.close()\`，但更简洁、更不容易漏写。

为什么必须关闭文件？
1. 操作系统对每个进程的文件描述符（fd）数量有限制（Linux 默认 1024），不关闭会泄漏。
2. 写操作通常先写入缓冲区，\`close()\` 会触发 flush，否则数据可能没真正落盘。
3. 在 Windows 上未关闭的文件会被锁定，其他进程无法访问。

## 三、为什么必须显式指定 encoding="utf-8"

\`\`\`python
# 错误写法（依赖系统默认编码）
with open("a.txt", "r") as f:        # Windows 上默认是 gbk
    data = f.read()

# 正确写法
with open("a.txt", "r", encoding="utf-8") as f:
    data = f.read()
\`\`\`

跨平台乱码原理：
- \`open()\` 不传 encoding 时，使用 \`locale.getpreferredencoding()\`：
  - Linux/macOS：通常是 \`utf-8\`
  - **Windows（中文版）：默认是 \`gbk\`（cp936）**
- 在 Windows 上用 \`w\` 默认编码写文件，再传到 Linux 服务器读，就会 \`UnicodeDecodeError\` 或乱码。
- **生产代码必须显式指定 encoding**，把行为确定下来，不依赖运行环境。

## 四、读取方法的四种姿势

\`\`\`python
with open("big.txt", "r", encoding="utf-8") as f:
    # 1) read()：一次读完整个文件，返回 str
    s = f.read()           # 也可 f.read(1024) 读指定字节数

    # 2) readline()：读一行（含末尾 \\n）
    line = f.readline()

    # 3) readlines()：把每一行装进 list，返回 list[str]
    lines = f.readlines()  # ["行1\\n", "行2\\n", ...]

    # 4) for line in f：逐行迭代（推荐）
    for line in f:
        process(line)
\`\`\`

四种方法对比：

| 方法 | 返回类型 | 内存占用 | 适用场景 |
|------|----------|----------|----------|
| \`read()\` | str（全量） | O(文件大小) | 小文件、需要整体处理 |
| \`readline()\` | str（一行） | O(行长) | 按行协议解析、读到某行停止 |
| \`readlines()\` | list[str] | O(文件大小) | 需要随机访问某行、行数有限 |
| \`for line in f\` | 迭代器 | O(行长) | **大文件、流式处理（推荐）** |

**大文件为什么必须用逐行迭代？**
- \`read()\` 和 \`readlines()\` 会把整个文件加载进内存。一个 10GB 日志文件直接 \`read()\` 会让进程内存爆掉。
- \`for line in f\` 走的是迭代器协议，文件对象内部维护一个缓冲区（通常 8KB），每次只读一小块，按需切出"一行"。内存占用恒定，与文件大小无关。
- 这是 Python 处理日志、ETL 流式数据的标准范式。

## 五、写入方法：write() vs writelines()

\`\`\`python
with open("out.txt", "w", encoding="utf-8") as f:
    f.write("第一行\\n")              # 返回写入的字符数
    f.writelines(["第二行\\n", "第三行\\n"])  # 接收可迭代对象，批量写
\`\`\`

关键差异：
- \`write(s)\`：写一个字符串。
- \`writelines(iterable)\`：批量写，**名字误导**——它**不会自动加换行符**，只是把可迭代对象里的每个 str 拼接写入，等价于 \`for s in it: f.write(s)\`。
- 名字来源于 C 标准库的 \`writelines\`，设计上为了高效批量写入，换行由调用者控制。

## 六、易错点小结

| 易错点 | 后果 | 解决方案 |
|--------|------|----------|
| 忘记 \`with\`，文件不关闭 | fd 泄漏、数据没落盘 | 一律用 \`with open()\` |
| 不指定 encoding | 跨平台乱码 | 永远显式 \`encoding="utf-8"\` |
| \`w\` 模式覆盖原文件 | 数据丢失 | 写之前 \`exists()\` 判断或用 \`x\` |
| \`writelines\` 期待自动换行 | 输出全挤一行 | 每个元素自己加 \`\\n\` |
| 大文件 \`read()\` 全读 | 内存爆掉 | 用 \`for line in f\` |
| \`r+\` 读写混用时忘记 \`seek()\` | 读写在错误位置 | 读后写前显式 \`seek()\` |
| Windows 文本模式写 \`\\n\` 变 \`\\r\\n\` | 字节数不一致 | 二进制场景用 \`b\` 模式 |
`,
    code: `import os, tempfile

with tempfile.TemporaryDirectory() as tmp:
    p = os.path.join(tmp, "demo.txt")
    
    # 写文本
    with open(p, "w", encoding="utf-8") as f:
        f.write("第一行\\n")
        f.writelines(["第二行\\n", "第三行\\n"])
    
    # 读全部
    with open(p, "r", encoding="utf-8") as f:
        print("read():", repr(f.read()))
    
    # 按行读
    with open(p, "r", encoding="utf-8") as f:
        print("readlines():", f.readlines())
    
    # 逐行迭代（推荐，内存友好）
    with open(p, "r", encoding="utf-8") as f:
        for i, line in enumerate(f, 1):
            print(f"line {i}: {line.strip()}")
    
    # 追加
    with open(p, "a", encoding="utf-8") as f:
        f.write("第四行\\n")
    
    with open(p, "r", encoding="utf-8") as f:
        print("after append:", f.read().strip().split("\\n"))

print("done")
`,
  },
  {
    id: "py4-file-binary",
    group: "文件与 IO",
    icon: "💾",
    title: "二进制读写、seek/tell",
    content: `
二进制模式让 Python 像处理"原始字节流"一样读写文件，是处理图片、音频、压缩包、序列化数据的标准方式。本节讲透二进制模式、bytes 类型、seek/tell 文件指针。

## 一、什么是二进制模式

在 mode 字符串后面加 \`b\` 即为二进制模式：

| 模式 | 含义 |
|------|------|
| \`rb\` | 二进制只读 |
| \`wb\` | 二进制覆盖写 |
| \`ab\` | 二进制追加 |
| \`r+b\` / \`w+b\` / \`a+b\` | 二进制读写 |

二进制模式与文本模式的本质区别：
- **不做编码转换**：读出来直接是 \`bytes\`，不是 \`str\`。
- **不做换行转换**：Windows 文本模式会把 \`\\n\` 转成 \`\\r\\n\`，二进制模式保持原样。
- **不能指定 encoding 参数**：传了会抛 \`ValueError\`。

## 二、bytes vs str 的区别

\`\`\`python
s = "hello"          # str：Unicode 字符序列
b = b"hello"         # bytes：字节序列，字面量前缀 b

# str -> bytes（编码）
b = s.encode("utf-8")        # b'hello'
b = "你好".encode("utf-8")   # b'\\xe4\\xbd\\xbd\\xe5\\xa5\\xbd'（6 字节）

# bytes -> str（解码）
s = b.decode("utf-8")

# bytes 也可以用 bytes() 构造
b = bytes([72, 101, 108, 108, 111])   # b'Hello'
\`\`\`

设计原理：
- \`str\` 是抽象的「文本」，\`bytes\` 是具体的「字节」。
- 网络传输、磁盘存储都是字节流，必须用 \`bytes\`；展示给人看才需要 \`str\`。
- Python3 严格区分两者，是为了消除 Python2 时代 \`str\` 既是字节又是文本的混乱。

## 三、seek(offset, whence)：移动文件指针

文件对象内部维护一个"当前读/写位置"的指针（cursor）。\`seek\` 主动移动它。

\`\`\`python
f.seek(offset, whence)
# offset：偏移量（字节数）
# whence：参考点
#   0 = io.SEEK_SET = 文件开头（默认）
#   1 = io.SEEK_CUR = 当前位置
#   2 = io.SEEK_END = 文件末尾
\`\`\`

注意：
- 二进制模式下 \`whence\` 三个值都支持，\`offset\` 可以是任意整数（正负都行）。
- 文本模式下 **只允许 \`whence=0\` 且 \`offset=0\`**（或同 \`tell()\` 返回值），因为多字节字符无法在中间任意位置对齐。

\`tell()\` 返回当前指针的**字节偏移量**。

## 四、代码逐行讲解

\`\`\`python
import os, tempfile

with tempfile.TemporaryDirectory() as tmp:
    p = os.path.join(tmp, "data.bin")

    # 写二进制：write 必须传 bytes，传 str 会 TypeError
    with open(p, "wb") as f:
        f.write(b"hello world")          # 写入 11 字节 ASCII
        f.write(bytes([0, 1, 2, 255]))   # 写入 4 字节 0x00 0x01 0x02 0xFF

    # 读二进制：返回 bytes
    with open(p, "rb") as f:
        data = f.read()                  # bytes, 共 15 字节
        print("all bytes:", data)        # b'hello world\\x00\\x01\\x02\\xff'
        print("hex:", data.hex())        # 68656c6c6f...便于看十六进制

    # seek / tell
    with open(p, "rb") as f:
        print("pos start:", f.tell())    # 0
        f.seek(5)                        # 移到第 5 字节，whence 默认 0
        print("after seek(5):", f.read(3))  # b'wor'（从 world 读 3 字节）
        f.seek(0, 2)                     # whence=2：移到末尾
        print("size:", f.tell())         # 15，文件总大小
        f.seek(0)                        # 回到开头
        print("after seek(0):", f.read(5))  # b'hello'
\`\`\`

逐行要点：
- \`f.write(b"...")\` 必须是 \`bytes\`；如果有一个 \`"hello"\` 写成字符串会报 \`TypeError: a bytes-like object is required\`。
- \`bytes([0,1,2,255])\` 用 0~255 的整数列表构造字节序列，常用于构造二进制协议头。
- \`data.hex()\` 把每个字节转成两位十六进制，方便调试二进制格式（比如看 PNG 文件头 \`89504e47\`）。
- \`f.seek(0, 2)\` 是个经典技巧——把指针移到末尾再 \`tell()\`，就能拿到文件字节数，不用 \`os.path.getsize\`。

## 五、二进制的使用场景

- **图片/音频/视频**：\`open("a.png", "rb").read()\` 拿到原始字节，再交给 PIL/scipy 解码。
- **压缩包**：\`zipfile\`、\`tarfile\` 内部都用二进制。
- **pickle 序列化**：\`pickle.dump(obj, f)\` 必须 \`wb\` 模式。
- **网络协议**：TCP/HTTP body 都是 bytes。
- **struct 二进制协议**：固定字节布局的结构化数据。

## 六、文本文件不要用 seek 跳着读

\`\`\`python
# 假设 utf-8 文件内容是 "你好世界"，每个汉字 3 字节，共 12 字节
with open("x.txt", "r", encoding="utf-8") as f:
    f.seek(1)        # 跳到第 1 字节（落在 "你" 中间）
    f.read()         # UnicodeDecodeError: invalid start byte
\`\`\`

原因：utf-8 编码下汉字占 3 字节，\`seek(1)\` 落在了字符中间，\`read\` 解码时遇到非法字节序列就抛错。

**结论**：文本文件按"行"或"整体"读，绝不要用 \`seek\` 在字节间跳。需要随机定位的字节流，统一用二进制模式。

## 七、hex() 查看字节十六进制

\`\`\`python
b = b"\\x00\\x01\\xffHello"
print(b.hex())        # '0001ff48656c6c6f'
print(b.hex(" "))     # '00 01 ff 48 65 6c 6c 6f'（3.8+ 支持分隔符）
print(" ".join(f"{x:02x}" for x in b))  # 等价写法
\`\`\`

用途：
- 看 PNG/JPG 文件魔数判断格式。
- 调试二进制协议字段。
- 比对编码差异（utf-8 vs gbk 同一字符串字节不同）。

## 八、易错点小结

| 易错点 | 后果 | 解决方案 |
|--------|------|----------|
| 二进制模式传 \`encoding\` | \`ValueError\` | 二进制模式不传 encoding |
| \`write("hello")\` 写二进制 | \`TypeError\` | 写 \`b"hello"\` 或 \`s.encode()\` |
| 文本模式 \`seek(1)\` 跳半字符 | \`UnicodeDecodeError\` | 文本文件不要随意 seek |
| 文本模式 \`whence=1/2\` | \`io.UnsupportedOperation\` | 文本只能 \`seek(0)\` 或回到 \`tell()\` 位置 |
| 把 \`bytes\` 当 \`str\` 用 |\`+\` 拼接 str 报错 | 先 \`decode\` 再操作 |
| 以为 \`bytes[0]\` 是字符 | 是 \`int\`，不是 \`str\` | \`b"a"[0] == 97\` |
| 写图片用 \`w\` 模式 | 内容损坏 | 用 \`wb\`，永远不带 \`b\` 不读图 |
`,
    code: `import os, tempfile

with tempfile.TemporaryDirectory() as tmp:
    p = os.path.join(tmp, "data.bin")
    
    # 写二进制
    with open(p, "wb") as f:
        f.write(b"hello world")
        f.write(bytes([0, 1, 2, 255]))
    
    # 读二进制
    with open(p, "rb") as f:
        data = f.read()
        print("all bytes:", data)
        print("hex:", data.hex())
    
    # seek/tell
    with open(p, "rb") as f:
        print("pos start:", f.tell())
        f.seek(5)
        print("after seek(5):", f.read(3))
        f.seek(0, 2)           # 移到末尾
        print("size:", f.tell())
        f.seek(0)              # 回到开头
        print("after seek(0):", f.read(5))

# 实战：批量写入 + 读取
with tempfile.TemporaryDirectory() as tmp:
    p = os.path.join(tmp, "nums.txt")
    with open(p, "w") as f:
        for i in range(100):
            f.write(f"{i}\\n")
    with open(p, "r") as f:
        lines = f.readlines()
        print("wrote 100 lines, first 5:", [l.strip() for l in lines[:5]])

print("done")
`,
  },
  {
    id: "py4-pathlib",
    group: "文件与 IO",
    icon: "📂",
    title: "pathlib：面向对象路径操作",
    content: `
pathlib 是 Python 3.4 引入的"面向对象路径操作"模块，把"路径"抽象成一个 \`Path\` 对象，用方法/属性替代 \`os.path\` 一堆函数。它更现代、更 Pythonic，被官方推荐替代 \`os.path\`。

## 一、Path 对象 vs os.path 字符串

\`\`\`python
import os.path
from pathlib import Path

# os.path：把路径当字符串，调用一堆函数
p_str = os.path.join("a", "b", "c.txt")    # 'a/b/c.txt'
name = os.path.basename(p_str)              # 'c.txt'
ext  = os.path.splitext(p_str)[1]           # '.txt'
parent = os.path.dirname(p_str)             # 'a/b'

# pathlib：把路径当对象，调用方法/属性
p = Path("a") / "b" / "c.txt"
p.name      # 'c.txt'
p.suffix    # '.txt'
p.stem      # 'c'
p.parent    # Path('a/b')
\`\`\`

设计原理对比：
- \`os.path\` 是函数式风格，每个操作都是 \`os.path.xxx(path_str)\`，路径只是一个 str。
- \`pathlib\` 是 OOP 风格，路径是 \`Path\` 对象，操作是 \`p.xxx()\`，链式调用更自然。
- \`Path\` 内部用 \`PurePath\` 维护各组件（drive/root/part），跨平台行为一致。

## 二、用 / 运算符构造路径（跨平台关键）

\`\`\`python
from pathlib import Path

p = Path("a") / "b" / "c.txt"
# 等价于 Path("a/b/c.txt")，但用 / 更直观
# Windows 上自动变成 'a\\\\b\\\\c.txt'，Linux 上是 'a/b/c.txt'
\`\`\`

\`/\` 运算符原理：
- \`Path.__truediv__\` 被重载，\`Path("a") / "b"\` 等价于 \`Path("a").joinpath("b")\`。
- 自动用当前系统的分隔符（\`os.sep\`）拼接，**写一份代码跨平台跑**，再也不用 \`os.path.join\`。
- 注意：左侧必须是一个 \`Path\`，如果写成 \`"a" / "b"\` 会报错。可以 \`Path("a") / "b" / "c"\` 链式拼接。

绝对路径与拼接规则：
- \`Path("/etc") / "nginx" / "nginx.conf"\` → \`/etc/nginx/nginx.conf\`
- 如果拼接遇到绝对路径 \`Path("a") / "/b"\`，会丢弃前面的 \`a\`，结果是 \`/b\`。

## 三、属性：name / stem / suffix / parent / parents

\`\`\`python
p = Path("/home/alice/work/report.tar.gz")

p.name        # 'report.tar.gz'  完整文件名
p.stem        # 'report.tar'     去掉最后一个后缀
p.suffix      # '.gz'            最后一个后缀（含点）
p.suffixes    # ['.tar', '.gz']  全部后缀列表
p.parent      # Path('/home/alice/work')  上一级
p.parents     # <PosixPath.parents> 可迭代祖先
list(p.parents)
# [Path('/home/alice/work'), Path('/home/alice'), Path('/home'), Path('/')]
p.parts       # ('/', 'home', 'alice', 'work', 'report.tar.gz')
\`\`\`

属性速查表：

| 属性 | 含义 | 示例（report.tar.gz） |
|------|------|----------------------|
| \`name\` | 完整文件名 | \`report.tar.gz\` |
| \`stem\` | 名字去后缀 | \`report.tar\` |
| \`suffix\` | 最后一个后缀 | \`.gz\` |
| \`suffixes\` | 全部后缀 | \`['.tar', '.gz']\` |
| \`parent\` | 父目录 | \`/home/alice/work\` |
| \`parents\` | 祖先链 | 父、祖父…直到根 |
| \`parts\` | 路径组件元组 | \`('/', 'home', ...)\` |
| \`anchor\` | 根/drive 部分 | \`/\` 或 \`C:\\\\\\\\\` |

## 四、操作：exists / is_file / mkdir / read_text / write_text

\`\`\`python
from pathlib import Path

p = Path("data.txt")

# 判断
p.exists()              # 是否存在
p.is_file()             # 是否文件
p.is_dir()              # 是否目录

# 创建/删除
p.mkdir(parents=True, exist_ok=True)   # 类似 mkdir -p
p.rmdir()                              # 删空目录
p.unlink()                             # 删文件

# 一行读写文本（小文件神器）
p.write_text("hello", encoding="utf-8")    # 等价 open(w)+write+close
s = p.read_text(encoding="utf-8")          # 等价 open(r)+read+close

# 一行读写二进制
p.write_bytes(b"\\x00\\x01")
b = p.read_bytes()

# 文件信息
st = p.stat()           # os.stat 结果
st.st_size              # 字节数
st.st_mtime             # 修改时间戳
\`\`\`

设计亮点：
- \`read_text()\` / \`write_text()\` 把"open + with + read/write + close"四步合一，**小文件场景一行搞定**。
- \`mkdir(parents=True, exist_ok=True)\` 等价 \`mkdir -p\`，不会因目录已存在而报错。
- \`stat()\` 复用 \`os.stat\`，结果结构一致。

注意：\`read_text/write_text\` 内部用 \`with open\`，所以**每次调用都会重新打开关闭文件**——写大文件、追加内容还是应该手动 \`open\`。

## 五、遍历：iterdir / glob / rglob

\`\`\`python
from pathlib import Path

root = Path("/project")

# 1) iterdir：列出直接子项（不递归）
for child in root.iterdir():
    print(child.name, child.is_dir())

# 2) glob：当前目录匹配（支持通配符）
list(root.glob("*.py"))            # 直接子目录里的 .py
list(root.glob("*/*.py"))          # 一层子目录下的 .py

# 3) rglob：递归匹配（自动加 **）
list(root.rglob("*.py"))           # 任意深度下所有 .py
list(root.glob("**/*.py"))         # 等价写法
\`\`\`

三者对比：

| 方法 | 是否递归 | 返回 | 典型用途 |
|------|---------|------|----------|
| \`iterdir()\` | 否 | 直接子项 | 列目录内容 |
| \`glob(pattern)\` | 取决于模式 | 匹配的项 | 单层 / 多层模式匹配 |
| \`rglob(pattern)\` | 是（隐含 \`**\`） | 全部匹配 | 全树搜索 |

返回的是生成器，惰性求值——大目录遍历不会一次全加载进内存。

## 六、Path.home() / Path.cwd()

\`\`\`python
Path.cwd()      # 当前工作目录，等价 os.getcwd()
Path.home()     # 用户主目录，等价 os.path.expanduser("~")
\`\`\`

跨平台说明：
- Linux/macOS：\`Path.home()\` → \`/home/alice\` 或 \`/Users/alice\`
- Windows：\`Path.home()\` → \`C:\\\\Users\\\\alice\`（自动处理 \`USERPROFILE\`）

## 七、为什么推荐 pathlib 替代 os.path

\`\`\`python
# 老写法：os.path + os + shutil 一堆函数
import os, os.path, shutil
p = os.path.join(base, "sub", "x.txt")
if os.path.exists(p):
    os.remove(p)
files = [f for f in os.listdir(base) if f.endswith(".py")]

# 新写法：pathlib 统一接口
from pathlib import Path
p = Path(base) / "sub" / "x.txt"
if p.exists():
    p.unlink()
files = [f.name for f in Path(base).glob("*.py")]
\`\`\`

理由：
1. **面向对象**：操作围绕 \`Path\` 对象，比散落的函数更好组合、更易链式调用。
2. **跨平台**：\`/\` 运算符自动处理分隔符，比 \`os.path.join\` 直观。
3. **读写一体化**：\`read_text/write_text\` 减少样板代码。
4. **官方推荐**：PEP 428 引入，Python 文档多次建议新代码用 \`pathlib\`。
5. **与第三方库协同**：很多库（如 \`open()\`、\`shutil\`、\`json.load\`）都接受 \`Path\` 对象，因为 \`Path\` 实现了 \`__fspath__\` 协议。

何时仍需 os 模块：
- \`os.environ\`、\`os.system\`、\`os.walk\`（如果需要 topdown 控制等高级特性）。
- 大部分场景 \`pathlib\` 已能覆盖。

## 八、易错点小结

| 易错点 | 后果 | 解决方案 |
|--------|------|----------|
| \`"a" / "b"\` 拼接 | \`TypeError\` | 左侧必须是 \`Path\` |
| \`Path("a") / "/b"\` | 丢掉 \`a\` | 拼接绝对路径会重置 |
| \`read_text\` 不传 encoding | 跨平台乱码 | 显式 \`encoding="utf-8"\` |
| \`read_text\` 读大文件 | 内存爆掉 | 用 \`open()\` 逐行 |
| \`mkdir()\` 父目录不存在 | \`FileNotFoundError\` | 加 \`parents=True\` |
| \`mkdir()\` 目录已存在 | \`FileExistsError\` | 加 \`exist_ok=True\` |
| \`rmdir()\` 删非空目录 | \`OSError\` | 用 \`shutil.rmtree\` |
| \`glob("*")\` 期望排序 | 顺序不定 | 用 \`sorted(...)\` |
| \`stem\` 期待去掉所有后缀 | 只去最后一个 | \`.name\` 后手动处理 |
`,
    code: `import pathlib, tempfile, os

# 构造路径
p = pathlib.Path("a") / "b" / "c.txt"
print("p:", p)
print("name:", p.name, "stem:", p.stem, "suffix:", p.suffix)
print("parent:", p.parent)
print("parents:", [str(x) for x in p.parents])

# 读写
with tempfile.TemporaryDirectory() as tmp:
    root = pathlib.Path(tmp)
    f = root / "hello.txt"
    f.write_text("你好，pathlib！", encoding="utf-8")
    print("read:", f.read_text(encoding="utf-8"))
    print("size:", f.stat().st_size, "bytes")
    
    # 创建子目录
    (root / "sub" / "deep").mkdir(parents=True, exist_ok=True)
    for child in root.iterdir():
        print("child:", child.name, "is_dir:", child.is_dir())

# glob / rglob
with tempfile.TemporaryDirectory() as tmp:
    root = pathlib.Path(tmp)
    for sub in ["a", "b", "c"]:
        (root / sub).mkdir()
        for i in range(3):
            (root / sub / f"file_{i}.py").write_text(f"# {sub}-{i}")
    print("*.py:", sorted(p.name for p in root.glob("*.py")))
    print("**/*.py:", sorted(str(p.relative_to(root)) for p in root.rglob("*.py")))

# Path vs os.path
print("cwd:", pathlib.Path.cwd())
print("home:", pathlib.Path.home())
print("os.path join:", os.path.join("a", "b", "c"))
print("pathlib join:", pathlib.Path("a") / "b" / "c")
`,
  },
  {
    id: "py4-serial",
    group: "文件与 IO",
    icon: "🧾",
    title: "JSON / CSV / TOML 序列化",
    content: `
序列化（Serialization）就是把 Python 对象转成可存储/传输的格式。Python 标准库内置三大格式：JSON、CSV、TOML，各自定位不同。本节讲透三者用法与选型。

## 一、三种格式的定位

| 格式 | 全称 | 定位 | 典型场景 | Python 模块 |
|------|------|------|----------|-------------|
| **JSON** | JavaScript Object Notation | 接口传输 | REST API、配置文件、跨语言数据交换 | \`json\`（内置） |
| **CSV** | Comma-Separated Values | 表格数据 | 数据导出、Excel 互通、ETL | \`csv\`（内置） |
| **TOML** | Tom's Obvious, Minimal Language | 项目配置 | \`pyproject.toml\`、Cargo.toml | \`tomllib\`（3.11+ 内置） |

为什么需要三种？
- JSON 表达力强（嵌套对象/数组），但**不支持注释**，写配置不友好。
- CSV 只能表达二维表，但**和 Excel/pandas 完美互通**，列数据。
- TOML 专为配置而生，**支持注释、类型丰富**，逐渐替代 ini/yaml 在 Python 生态的位置。

## 二、json 模块详解

### 2.1 dumps / loads vs dump / load

\`\`\`python
import json

data = {"name": "alice", "scores": [90, 85, 92], "active": True}

# dumps/loads：操作 str（dumps = dump string）
s = json.dumps(data)            # str: '{"name": "alice", ...}'
data2 = json.loads(s)           # dict

# dump/load：操作文件对象
with open("a.json", "w", encoding="utf-8") as f:
    json.dump(data, f)          # 直接写文件
with open("a.json", "r", encoding="utf-8") as f:
    data3 = json.load(f)        # 直接读文件
\`\`\`

记忆口诀：
- 带 \`s\` 的（\`dumps/loads\`）= string，操作字符串。
- 不带 \`s\` 的（\`dump/load\`）= 文件，操作文件对象。
- \`s\` 是"字符串"的 s，不是复数。

### 2.2 ensure_ascii=False：中文不转义

\`\`\`python
json.dumps({"name": "张三"})
# '{"name": "\\\\u5f20\\\\u4e09"}'   ← 默认把中文转成 \\uXXXX

json.dumps({"name": "张三"}, ensure_ascii=False)
# '{"name": "张三"}'                  ← 原样保留中文
\`\`\`

原理：JSON 规范允许字符串用 \`\\uXXXX\` 转义非 ASCII 字符。Python \`json\` 默认 \`ensure_ascii=True\`，把所有非 ASCII 字符转成 \`\\u\` 形式，**保证 ASCII 安全传输**（老系统兼容）。但生成的文件人眼读不了，调试痛苦。

**生产建议**：写入文件时一律加 \`ensure_ascii=False\` + \`encoding="utf-8"\`，得到可读的中文 JSON。只有在传输给不确定的老系统时才保留默认。

### 2.3 indent：缩进美化

\`\`\`python
json.dumps(data, indent=2)
# {
#   "name": "alice",
#   "scores": [
#     90,
#     85,
#     92
#   ],
#   "active": true
# }
\`\`\`

- \`indent=2\`：每级缩进 2 空格。
- \`indent=4\`：4 空格（更宽）。
- 不传 \`indent\`：单行紧凑，体积最小，适合网络传输。

### 2.4 类型映射

| Python | JSON |
|--------|------|
| \`dict\` | object |
| \`list\` / \`tuple\` | array |
| \`str\` | string |
| \`int\` / \`float\` | number |
| \`True/False\` | true/false |
| \`None\` | null |

JSON 不支持的 Python 类型：\`set\`、\`bytes\`、\`datetime\`、自定义类。需要时可实现 \`JSONEncoder\` 子类或写 \`default\` 钩子。

## 三、csv 模块详解

### 3.1 为什么不能用字符串 split(",")

\`\`\`python
# 危险写法
with open("a.csv") as f:
    for line in f:
        fields = line.split(",")    # 字段里有逗号就错了
\`\`\`

CSV 规范比想象复杂：
- 字段可能含逗号、引号、换行，需要用引号包裹并转义。
- 不同地区分隔符不同（欧洲常用 \`;\`）。
- 编码、BOM、行结束符都有坑。

标准库 \`csv\` 帮你处理所有这些细节，**永远不要自己 split**。

### 3.2 DictReader / DictWriter

\`\`\`python
import csv

# 写：DictWriter 按字典写
rows = [
    {"name": "alice", "age": "30", "city": "Beijing"},
    {"name": "bob",   "age": "25", "city": "Shanghai"},
]
with open("people.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["name", "age", "city"])
    w.writeheader()         # 写表头
    w.writerows(rows)       # 批量写

# 读：DictReader 按字典读
with open("people.csv", "r", encoding="utf-8") as f:
    for r in csv.DictReader(f):
        print(r["name"], r["age"])
        # r 是 dict: {"name": ..., "age": ..., "city": ...}
\`\`\`

DictReader/DictWriter 优势：
- 用列名访问（\`r["name"]\`），比下标 \`row[0]\` 可读。
- 字段顺序由 \`fieldnames\` 控制，跨版本稳定。
- 自动用第一行做表头。

也有低层 \`csv.reader/csv.writer\`，返回 list，适合无表头场景。

### 3.3 newline="" 防止 Windows 空行

\`\`\`python
# 错误写法（Windows 上会多出空行）
with open("a.csv", "w", encoding="utf-8") as f:
    csv.writer(f).writerow(["a", "b"])

# 正确写法
with open("a.csv", "w", newline="", encoding="utf-8") as f:
    csv.writer(f).writerow(["a", "b"])
\`\`\`

原理：
- csv 模块自己处理换行（写 \`\\r\\n\`）。
- Windows 文本模式 \`open\` 又会把 \`\\n\` 转 \`\\r\\n\`，结果变成 \`\\r\\r\\n\`，每行后多个空行。
- 传 \`newline=""\` 关闭 \`open\` 的换行转换，让 csv 模块全权处理。
- 这是 csv 模块的"必背咒语"，无论读写都建议加。

## 四、tomllib 模块详解（3.11+ 内置）

### 4.1 历史

- Python 3.11 之前：需要 \`pip install tomli\` 第三方库。
- Python 3.11+：标准库内置 \`tomllib\`，**API 和 tomli 完全一致**，只是改名。
- 注意：\`tomllib\` **只能读，不能写**（TOML 官方认为配置是手写的，不需要程序生成）。要写 TOML 可装 \`tomli-w\` 或 \`tomlkit\`。

### 4.2 用法

\`\`\`python
import tomllib

# 从字符串读（loads，注意是 loads 不是 load！）
toml_text = '''
[project]
name = "demo"
version = "0.1.0"

[project.dependencies]
fastapi = ">=0.110"
'''
data = tomllib.loads(toml_text)
# {'project': {'name': 'demo', 'version': '0.1.0',
#              'dependencies': {'fastapi': '>=0.110'}}}

# 从文件读（load，必须传以 rb 打开的文件）
with open("pyproject.toml", "rb") as f:
    data = tomllib.load(f)
\`\`\`

注意：
- \`tomllib.load(f)\` 要求文件以 **\`rb\` 二进制模式**打开（因为它内部自己解码 UTF-8，避免文本模式再做一次换行转换）。
- API 命名与 \`json\` 一致：\`loads\` 操作 str，\`load\` 操作文件。

### 4.3 兼容写法

\`\`\`python
try:
    import tomllib
except ModuleNotFoundError:
    import tomli as tomllib   # pip install tomli
\`\`\`

老项目或需要支持 3.10- 的代码常用这个兼容片段。

## 五、什么时候用哪种格式

| 场景 | 推荐格式 | 理由 |
|------|----------|------|
| REST API 请求/响应 | JSON | 跨语言、Web 标准 |
| 给前端 / 跨语言传数据 | JSON | 所有语言都有 JSON 库 |
| 导出 Excel 友好的表格 | CSV | 双击就能用 Excel 打开 |
| pandas 数据导入导出 | CSV | \`pd.read_csv\` 一行搞定 |
| Python 项目元数据（\`pyproject.toml\`） | TOML | PEP 621 标准 |
| 应用配置文件（带注释） | TOML | 支持注释、类型丰富 |
| 简单 key=value 配置 | JSON / TOML | 看团队习惯 |
| 大数据交换（>100MB） | 都不合适 | 用 Parquet / Arrow / protobuf |

## 六、易错点小结

| 易错点 | 后果 | 解决方案 |
|--------|------|----------|
| \`json.dumps\` 中文变 \`\\uXXXX\` | 文件不可读 | 加 \`ensure_ascii=False\` |
| \`json.load\` 文件没指定 encoding | Windows 乱码 | \`encoding="utf-8"\` |
| \`json.dumps(set(...))\` | \`TypeError\` | set 不支持，转 list |
| \`json.dumps(datetime)\` | \`TypeError\` | 写 \`default\` 钩子或转 str |
| CSV 用 \`line.split(",")\` | 字段含逗号就错 | 用 \`csv.reader\` |
| CSV 不加 \`newline=""\` | Windows 多空行 | 一律加 \`newline=""\` |
| \`DictWriter\` 不 \`writeheader\` | 没表头 | 显式调用 |
| \`tomllib.load(open("x"))\` | \`TypeError\` | 必须 \`rb\` 模式 |
| 3.10 直接 \`import tomllib\` | \`ModuleNotFoundError\` | 装第三方 \`tomli\` |
| 期待 \`tomllib\` 能写 | 没这功能 | 用 \`tomli-w\` |
| JSON 文件 BOM 头 | \`json.JSONDecodeError\` | 用 \`utf-8-sig\` 读 |
`,
    code: `import json, csv, io, tempfile, os

# 1) json
data = {"name": "alice", "scores": [90, 85, 92], "active": True}
s = json.dumps(data, ensure_ascii=False, indent=2)
print("json:", s)
print("parse:", json.loads(s)["name"])

# 2) json 文件读写
with tempfile.TemporaryDirectory() as tmp:
    p = os.path.join(tmp, "data.json")
    with open(p, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    with open(p, "r", encoding="utf-8") as f:
        print("loaded:", json.load(f))

# 3) csv 读写
with tempfile.TemporaryDirectory() as tmp:
    p = os.path.join(tmp, "people.csv")
    rows = [
        {"name": "alice", "age": "30", "city": "Beijing"},
        {"name": "bob", "age": "25", "city": "Shanghai"},
    ]
    with open(p, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["name", "age", "city"])
        w.writeheader()
        w.writerows(rows)
    with open(p, "r", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            print("csv row:", r)

# 4) tomllib（3.11+）
toml_text = '''
[project]
name = "demo"
version = "0.1.0"
[project.dependencies]
fastapi = ">=0.110"
'''
try:
    import tomllib
    print("toml:", tomllib.loads(toml_text)["project"])
except ImportError:
    print("Python < 3.11，没有内置 tomllib")
`,
  },
];