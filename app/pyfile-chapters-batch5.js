// =============================================================
// Python 文件操作教程 - 第 5 批章节(进阶实战)
// 转义规则:content 内部反引号写作 \`,\${ 写作 \$\{。
// =============================================================

export const chapters = [
  {
    id: "pyfile-seek-pointer",
    icon: "🎯",
    title: "文件指针与随机访问:seek、tell",
    group: "进阶实战",
    content: `# 文件指针与随机访问:seek、tell

## 一、引言

前面我们学的文件读写都是「顺序访问」:从文件开头一路读到结尾。但在很多实际场景下,我们需要「随机访问」——直接跳到文件的某个位置读取或写入。比如:

- 读取一个大文件的最后 100 字节(快速定位,不用读完整个文件)
- 读取二进制文件的头部「魔数」判断文件类型(PNG、ZIP 都有固定头部)
- 修改文件中间的某几个字节,而不需要重写整个文件
- 实现一个简单的数据库,根据偏移量快速查找记录

Python 通过 \`tell()\` 和 \`seek()\` 两个方法提供了对文件指针的完整控制。本章我们深入学习它们。

## 二、文件指针的概念

文件指针(file pointer)是文件对象内部的一个「游标」,记录当前读写位置(以字节为单位的偏移量)。

可以用一个表格对比理解:

| 概念 | 类比 | 说明 |
|------|------|------|
| 文件对象 | 一本书 | 被读取的数据载体 |
| 文件指针 | 书签 | 标记当前读到哪里 |
| \`read()\` | 往后翻书 | 读取后指针向后移动 |
| \`tell()\` | 查看书签位置 | 返回当前指针位置 |
| \`seek(n)\` | 把书签挪到第 n 页 | 移动指针到指定位置 |

每次 \`read()\` / \`readline()\` / \`write()\` 之后,指针都会自动向后移动相应的字节数。

## 三、tell():获取当前指针位置

\`tell()\` 返回文件指针当前的位置(整数,单位:字节)。

\`\`\`python
# demo 1:用 tell 观察指针随读取的变化
with open("sample.txt", "w", encoding="utf-8") as f:
    f.write("Hello, Python!")  # 写入 13 个字符(英文,UTF-8 下每字符 1 字节)

with open("sample.txt", "r", encoding="utf-8") as f:
    print(f.tell())       # 0  刚打开,指针在文件开头
    chunk = f.read(5)     # 读取 5 个字节:"Hello"
    print(f.tell())       # 5  指针移动到第 5 字节
    rest = f.read()       # 读完剩余:", Python!"
    print(f.tell())       # 13 指针到达文件末尾
\`\`\`

**详解**:刚打开文件时,指针位于 0(文件开头)。每次 \`read(n)\` 读取 n 个字节后,指针前移 n。读完全部内容后,指针指向文件末尾(位置等于文件大小)。这里文件内容是 13 个 ASCII 字符,在 UTF-8 编码下正好占 13 字节,所以最终 \`tell()\` 返回 13。

## 四、seek(offset, whence):移动指针

\`seek(offset, whence=0)\` 把指针移动到指定位置。

- \`offset\`:偏移量,正数向后、负数向前
- \`whence\`:参考点,有三种取值

| whence | 含义 | 备注 |
|--------|------|------|
| 0 | 从文件开头(seek_SET) | 默认值,offset 必须非负 |
| 1 | 从当前位置(seek_CUR) | 二进制模式可用 |
| 2 | 从文件末尾(seek_END) | 二进制模式可用,offset 通常为负 |

### demo 2:三种 whence 用法

\`\`\`python
# 准备一个 12 字节的文件
with open("seek_demo.bin", "wb") as f:
    f.write(b"ABCDEFGHIJKL")  # 12 个字节

with open("seek_demo.bin", "rb") as f:
    # whence=0:从开头跳到第 3 字节
    f.seek(3, 0)              # 指针 -> 3
    print(f.read(3))          # b'DEF'

    # whence=1:从当前位置(6)向前跳 2 字节到位置 8
    f.seek(2, 1)              # 指针 -> 8
    print(f.read(3))          # b'IJK'

    # whence=2:从末尾往前跳 4 字节到位置 8
    f.seek(-4, 2)            # 指针 -> 8
    print(f.read(4))         # b'IJKL'
\`\`\`

**详解**:
- \`seek(3, 0)\`:从开头算起跳到位置 3,读到的是 \`b'DEF'\`(A 是位置 0、B 是 1、C 是 2、D 是 3)。
- \`seek(2, 1)\`:当前位置是 6(刚读完 DEF 三个字节),向前 2 字节到位置 8,读到 \`b'IJK'\`。
- \`seek(-4, 2)\`:从末尾(位置 12)往回数 4 字节到位置 8,读到 \`b'IJKL'\`。
注意:whence=1 和 whence=2 在「文本模式」下受限,详见下文。

## 五、文本模式 vs 二进制模式的 seek 限制

这是一个非常容易踩坑的点。

### 文本模式的限制

在文本模式(\`r\` / \`w\` / \`a\`)下,由于字符编码可能占用可变字节数(比如 UTF-8 中一个汉字 3 字节),Python 不允许任意 seek,只允许:

1. \`seek(0, 0)\` 或 \`seek(0)\`:跳到文件开头
2. \`seek(n, 0)\`:跳到 \`tell()\` 返回过的位置 n

如果违反,会抛出 \`OSError: can't do nonzero cur-relative seeks\` 之类的错误。

### demo 3:文本模式只能 seek 到开头或 tell 记录的位置

\`\`\`python
# 写入中文内容
with open("text_seek.txt", "w", encoding="utf-8") as f:
    f.write("你好世界")  # 4 个汉字,UTF-8 下占 12 字节

with open("text_seek.txt", "r", encoding="utf-8") as f:
    print(f.tell())        # 0
    f.read(1)              # 读 1 个字符 "你"
    pos = f.tell()         # 记录当前位置:3(一个汉字占 3 字节)
    print(pos)             # 3

    # ✅ 合法:seek 到开头
    f.seek(0)
    print(f.read(1))       # "你"

    # ✅ 合法:seek 到 tell 记录过的位置
    f.seek(pos)
    print(f.read(1))       # "好"

    # ❌ 非法:在文本模式下用 whence=1
    # f.seek(2, 1)  # 会抛出 OSError
\`\`\`

**详解**:文本模式下,\`read(1)\` 读 1 个字符(可能跨多字节),所以读 1 个汉字后指针从 0 跳到 3。我们可以把 \`tell()\` 返回过的 3 存下来,之后用 \`seek(3)\` 跳回去。但绝对不能在文本模式下用 \`seek(x, 1)\` 或 \`seek(x, 2)\`,因为字符边界不可预测。

### demo 4:二进制模式自由 seek

\`\`\`python
# 二进制模式下,seek 没有任何限制
with open("text_seek.txt", "rb") as f:
    # 跳到第 6 字节(第 3 个汉字的起始位置)
    f.seek(6, 0)
    print(f.read(3))      # b'\xe5\xa5\xbd'  "好" 的 UTF-8 字节

    # 用 whence=1 往回 3 字节
    f.seek(-3, 1)
    print(f.read(3))      # 同样是 "好"

    # 用 whence=2 跳到末尾前 3 字节(最后一个汉字)
    f.seek(-3, 2)
    print(f.read(3))     # "界" 的 UTF-8 字节
\`\`\`

**详解**:二进制模式把文件当作「字节流」,没有字符边界问题,所以 \`whence=1\` 和 \`whence=2\` 都可用,offset 也可以是负数。这就是为什么处理二进制文件(PNG、ZIP、MP3)时,推荐用 \`'rb'\` / \`'wb'\` 模式。

## 六、读取文件头部魔数

很多二进制文件格式在文件头部都有「魔数」(magic number),用来标识文件类型。例如:

| 文件类型 | 魔数(头部字节) |
|----------|-------------------|
| PNG | \`\\x89PNG\\r\\n\\x1a\\n\` |
| JPEG | \`\\xff\\xd8\\xff\` |
| GIF | \`GIF87a\` 或 \`GIF89a\` |
| ZIP | \`PK\\x03\\x04\` |
| PDF | \`%PDF-\` |

### demo 5:通过魔数识别文件类型

\`\`\`python
import os

def detect_file_type(path):
    """根据文件头部魔数判断真实文件类型"""
    # 用二进制模式只读前 8 字节,不加载整个文件
    with open(path, "rb") as f:
        header = f.read(8)   # 读取前 8 个字节

    # 比对各种文件类型的魔数
    if header.startswith(b"\\x89PNG"):
        return "PNG 图片"
    elif header.startswith(b"\\xff\\xd8\\xff"):
        return "JPEG 图片"
    elif header.startswith(b"GIF87a") or header.startswith(b"GIF89a"):
        return "GIF 图片"
    elif header.startswith(b"PK\\x03\\x04"):
        return "ZIP 压缩包"
    elif header.startswith(b"%PDF-"):
        return "PDF 文档"
    else:
        return "未知类型"

# 测试:把任意一个真实文件丢进去看看
# print(detect_file_type("photo.png"))     # PNG 图片
# print(detect_file_type("archive.zip"))   # ZIP 压缩包
\`\`\`

**详解**:
- 用 \`'rb'\` 模式打开,只读前 8 字节(\`f.read(8)\`),非常高效——哪怕文件有 1GB 也只读 8 字节。
- 各种文件格式的魔数都是公开标准,可以用 \`startswith\` 快速判断。
- 这种「基于内容」的判断比看扩展名可靠得多,因为扩展名可以随便改。

## 七、修改文件中间内容(覆盖而非插入)

**重要**:seek 后写文件会「覆盖」原有内容,而不是「插入」新内容。文件大小不会自动增长。

### demo 6:覆盖文件中间的字节

\`\`\`python
# 初始内容:ABCDEFGHIJKL
with open("overwrite.bin", "wb") as f:
    f.write(b"ABCDEFGHIJKL")

# 把位置 3~5 的 "DEF" 改成 "XYZ"
with open("overwrite.bin", "r+b") as f:   # r+b:读写二进制模式
    f.seek(3)                  # 指针 -> 3
    f.write(b"XYZ")            # 覆盖 3 字节
    # 现在文件内容:ABCXYZGHIJKL

# 验证结果
with open("overwrite.bin", "rb") as f:
    print(f.read())           # b'ABCXYZGHIJKL'
\`\`\`

**详解**:
- \`'r+b'\` 模式表示「读写二进制」,既能读又能写,且不截断文件。如果用 \`'wb'\` 会清空文件,不能用。
- \`seek(3)\` 把指针移到位置 3(D 的位置),然后 \`write(b"XYZ")\` 把 D、E、F 三个字节覆盖成 X、Y、Z。
- 文件长度不变,因为只覆盖了 3 字节,没多没少。如果写入字节数比原内容多,会向后覆盖;如果少,后面会留尾巴。

### demo 7:在文件末尾追加(用 seek(0, 2))

\`\`\`python
# 'r+b' 模式下,默认指针在开头。如果想追加,需要先 seek 到末尾
with open("overwrite.bin", "r+b") as f:
    f.seek(0, 2)              # whence=2:跳到末尾
    f.write(b"-END")          # 在末尾追加 4 字节

with open("overwrite.bin", "rb") as f:
    print(f.read())           # b'ABCXYZGHIJKL-END'
\`\`\`

**详解**:\`seek(0, 2)\` 是惯用写法,表示「从末尾偏移 0」,即跳到文件末尾。配合 \`'r+b'\` 模式,可以在保留原内容的同时追加新数据。这比先读后写更高效。

## 八、实战:实现简单的固定长度记录数据库

### demo 8:基于 seek 的简易记录存储

\`\`\`python
import struct

# 假设每条记录 16 字节:1 个 int(4 字节)+ 1 个 long(8 字节)+ 1 个 short(2 字节)+ 2 字节填充
# 用 struct 把数据打包成固定 16 字节,然后按偏移读写
RECORD_FMT = "<iHq"            # < 小端,int(4) + short(2) + long(8) = 14 字节
RECORD_SIZE = struct.calcsize(RECORD_FMT)   # 14

def write_record(path, index, id_val, count, timestamp):
    """写入第 index 条记录(覆盖式)"""
    with open(path, "r+b" if os.path.exists(path) else "w+b") as f:
        f.seek(index * RECORD_SIZE)                    # 计算偏移
        f.write(struct.pack(RECORD_FMT, id_val, count, timestamp))

def read_record(path, index):
    """读取第 index 条记录"""
    with open(path, "rb") as f:
        f.seek(index * RECORD_SIZE)
        data = f.read(RECORD_SIZE)
        return struct.unpack(RECORD_FMT, data)        # 返回 (id, count, ts)

import os
# 测试:写 3 条记录,然后随机读第 2 条
write_record("records.db", 0, 1001, 5, 1700000000)
write_record("records.db", 1, 1002, 8, 1700000001)
write_record("records.db", 2, 1003, 3, 1700000002)

print(read_record("records.db", 1))   # (1002, 8, 1700000001)
\`\`\`

**详解**:
- \`struct.pack\` 把 Python 数字打包成固定字节串,\`struct.unpack\` 反解。
- 每条记录定长 14 字节,所以第 n 条记录的偏移就是 \`n * 14\`。
- 用 \`seek\` 跳过前面 n 条记录,直接读写目标记录,不用遍历整个文件——这就是「随机访问」的核心价值。
- 这种设计是数据库索引、B 树的基础思想。

## 九、文本模式 seek 限制说明(总结)

| 模式 | whence=0 | whence=1 | whence=2 | 负 offset |
|------|---------|----------|----------|------------|
| 文本模式 r/w/a | ✅ 仅 0 或 tell 返回值 | ❌ 不支持 | ❌ 不支持 | ❌ |
| 二进制模式 rb/wb/ab | ✅ 任意 | ✅ 任意 | ✅ 任意 | ✅ 任意 |

**记忆口诀**:文本模式受字符边界限制,只让 seek 开头或记录过的位置;二进制模式无限制,任意 seek。

## 十、小结

- \`tell()\` 查指针,\`seek(offset, whence)\` 移指针。
- 二进制模式才是 seek 的「主场」,文本模式只能 seek 开头或 tell 记录过的位置。
- 修改文件中间用 \`'r+b'\` 模式 + seek + write,是覆盖不是插入。
- 文件末尾追加用 \`seek(0, 2)\`。
- 读取二进制文件头判断类型,是 seek 最实用的应用之一。`,
  },
  {
    id: "pyfile-archive",
    icon: "📦",
    title: "文件压缩归档:zipfile、tarfile",
    group: "进阶实战",
    content: `# 文件压缩归档:zipfile、tarfile

## 一、引言

日常开发中,我们经常需要把一堆文件「打包」成一个文件,比如:

- 备份项目代码到 zip
- 把日志文件压缩归档节省磁盘
- 给用户打包下载多个文件
- 在服务器之间传输大量小文件(打包后传一个大文件更高效)

Python 标准库提供了三个层次的工具:

| 层次 | 模块 | 适用场景 |
|------|------|---------|
| 高层封装 | \`shutil.make_archive\` / \`unpack_archive\` | 一行代码打包/解压整个目录 |
| 通用归档 | \`zipfile\` / \`tarfile\` | 控制 zip/tar 内部结构 |
| 底层压缩 | \`gzip\` / \`bz2\` / \`lzma\` | 单个文件的流式压缩 |

本章重点讲 \`zipfile\` 和 \`tarfile\`,并简要介绍 \`shutil\` 的高层封装。

## 二、zipfile 模块

\`zipfile\` 是 Python 标准库中最常用的压缩库,跨平台支持好,几乎所有操作系统都能直接打开 zip。

### 核心 API

| API | 作用 |
|-----|------|
| \`ZipFile(path, mode)\` | 打开/创建 zip 文件,mode: \`r\`/\`w\`/\`a\`/\`x\` |
| \`write(file, arcname)\` | 把本地文件加入 zip,arcname 是包内路径 |
| \`writestr(arcname, data)\` | 直接写入字符串/字节,不需要本地文件 |
| \`read(name)\` | 读取包内某个文件内容 |
| \`extract(name, path)\` | 解压单个文件到 path |
| \`extractall(path)\` | 解压全部文件 |
| \`namelist()\` | 返回所有文件名列表 |
| \`infolist()\` | 返回 ZipInfo 对象列表(含元信息) |

### demo 1:用 ZipFile 创建压缩包

\`\`\`python
import zipfile
import os

# 准备几个待压缩的文件
os.makedirs("zip_src", exist_ok=True)
with open("zip_src/a.txt", "w") as f:
    f.write("这是文件 A 的内容")
with open("zip_src/b.txt", "w") as f:
    f.write("这是文件 B 的内容")

# 创建 zip 压缩包
with zipfile.ZipFile("output.zip", "w", zipfile.ZIP_DEFLATED) as zf:
    # ZIP_DEFLATED 表示用 deflate 算法压缩(默认推荐)
    zf.write("zip_src/a.txt", arcname="a.txt")   # arcname 指定包内文件名
    zf.write("zip_src/b.txt", arcname="sub/b.txt")  # 可以带子目录

print("压缩完成,文件大小:", os.path.getsize("output.zip"))
\`\`\`

**详解**:
- \`ZipFile\` 上下文管理器(\`with\`)会自动关闭文件,推荐用法。
- \`ZIP_DEFLATED\` 是常用的压缩算法,兼容性好;还有 \`ZIP_BZIP2\`、\`ZIP_LZMA\`(压缩率更高但慢)。
- \`arcname\` 是文件在 zip 内的路径,可以跟磁盘路径不一样,甚至可以放到子目录 \`sub/b.txt\`。
- 如果不传 arcname,会用磁盘完整路径 \`zip_src/a.txt\` 作为包内路径,通常会带多余的目录前缀,不优雅。

### demo 2:writestr 直接写入字符串

\`\`\`python
# writestr:不需要本地文件,直接把字符串/字节写入 zip
with zipfile.ZipFile("output2.zip", "w", zipfile.ZIP_DEFLATED) as zf:
    # 写入字符串(Python 会自动按 UTF-8 编码?其实不会,需要手动编码)
    zf.writestr("readme.txt", "这是直接写入的字符串内容")
    # 写入字节
    zf.writestr("data.bin", b"\\x00\\x01\\x02\\x03")

# 验证
with zipfile.ZipFile("output2.zip") as zf:
    print(zf.read("readme.txt").decode("utf-8"))
\`\`\`

**详解**:
- \`writestr\` 适合「在内存里生成内容,直接打包」的场景,比如把数据库查询结果导出成 CSV 再压缩。
- 注意:\`writestr\` 的第二个参数既可以是 str 也可以是 bytes。如果传 str,Python 会按 UTF-8 编码存为字节。
- 读取时 \`zf.read(name)\` 返回的是 bytes,文本内容需要 \`decode\`。

### demo 3:namelist 和 infolist 查看压缩包内容

\`\`\`python
with zipfile.ZipFile("output.zip") as zf:
    # namelist:返回所有文件名
    print(zf.namelist())  # ['a.txt', 'sub/b.txt']

    # infolist:返回 ZipInfo 对象列表,含元信息
    for info in zf.infolist():
        print(f"文件名: {info.filename}")
        print(f"  原始大小: {info.file_size} 字节")
        print(f"  压缩后: {info.compress_size} 字节")
        print(f"  压缩率: {info.compress_size / max(info.file_size, 1):.2%}")
        print(f"  修改时间: {info.date_time}")  # (年, 月, 日, 时, 分, 秒)
\`\`\`

**详解**:
- \`namelist()\` 简单粗暴,只返回名字字符串列表。
- \`infolist()\` 返回 \`ZipInfo\` 对象,可以拿到原始大小、压缩后大小、修改时间等元信息。
- 用 \`compress_size / file_size\` 计算压缩率,衡量压缩效果。

### demo 4:extract 解压单个文件

\`\`\`python
import os

with zipfile.ZipFile("output.zip") as zf:
    # extract:解压单个文件到指定目录
    zf.extract("a.txt", path="extracted")  # 解压到 extracted/a.txt

    # extractall:解压所有文件
    zf.extractall(path="extracted_all")  # 解压到 extracted_all/

# 验证解压结果
for root, dirs, files in os.walk("extracted_all"):
    for fname in files:
        full = os.path.join(root, fname)
        print(full)
\`\`\`

**详解**:
- \`extract(name, path)\` 解压指定文件,\`path\` 是目标目录(默认当前目录)。
- \`extractall(path)\` 解压全部,会自动创建子目录。
- 安全提示:解压来自不可信来源的 zip 时,要警惕「zip 炸弹」(小压缩包解压出超大文件)和「路径穿越攻击」(包内文件名含 \`../\`)。Python 3.6+ 的 \`extractall\` 会拒绝路径穿越,但仍然要小心。

### demo 5:压缩整个目录

\`\`\`python
import os
import zipfile

def zip_directory(src_dir, zip_path):
    """把整个目录打包成 zip,保留相对路径"""
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        # os.walk 遍历目录树
        for root, dirs, files in os.walk(src_dir):
            for fname in files:
                full_path = os.path.join(root, fname)              # 磁盘完整路径
                # 计算包内相对路径(去掉 src_dir 前缀)
                arcname = os.path.relpath(full_path, src_dir)
                zf.write(full_path, arcname)
                print(f"已添加: {arcname}")

# 测试
zip_directory("zip_src", "dir_archive.zip")
\`\`\`

**详解**:
- \`os.walk\` 递归遍历目录,返回 (root, dirs, files) 三元组。
- \`os.path.relpath(full, base)\` 计算相对路径,确保包内路径不含 \`zip_src/\` 前缀,解压时不会多套一层目录。
- 这是打包目录的标准模式。

## 三、tarfile 模块

\`tarfile\` 在 Unix/Linux 世界更常见,tar 本身是「归档」(不压缩),但可以配合 gzip/bzip2/xz 压缩。tar 的优势是保留 Unix 文件权限、软链接等信息。

### demo 6:tarfile 创建归档

\`\`\`python
import tarfile

# 创建普通 tar(不压缩)
with tarfile.open("archive.tar", "w") as tf:
    # add 方法添加文件,arcname 指定包内路径
    tf.add("zip_src/a.txt", arcname="a.txt")
    tf.add("zip_src/b.txt", arcname="sub/b.txt")

# 创建 gzip 压缩的 tar
with tarfile.open("archive.tar.gz", "w:gz") as tf:
    tf.add("zip_src", arcname="src")  # 直接添加整个目录

# 创建 xz 压缩的 tar(压缩率最高,但慢)
with tarfile.open("archive.tar.xz", "w:xz") as tf:
    tf.add("zip_src", arcname="src")
\`\`\`

**详解**:
- mode 的格式是 \`<动作>:<算法>\`:
  - \`w\`:写入(不压缩)
  - \`w:gz\`:gzip 压缩(常用)
  - \`w:bz2\`:bzip2 压缩(压缩率更高)
  - \`w:xz\`:xz/lzma 压缩(压缩率最高,但慢)
- \`add(path, arcname)\` 添加文件或目录,目录会递归添加。
- \`w\` 模式会覆盖已有文件,用 \`a\` 模式追加。

### demo 7:tarfile 读取和解压

\`\`\`python
with tarfile.open("archive.tar.gz", "r:gz") as tf:
    # getmembers:返回 TarInfo 对象列表
    for member in tf.getmembers():
        print(f"名称: {member.name}")
        print(f"  大小: {member.size} 字节")
        print(f"  类型: {'目录' if member.isdir() else '文件'}")
        print(f"  权限: {oct(member.mode)}")   # Unix 权限位

    # getnames:只返回名称列表
    print(tf.getnames())

    # extractall:解压全部
    tf.extractall(path="tar_extracted")

    # extract:解压单个文件
    # tf.extract("src/a.txt", path="tar_extracted")
\`\`\`

**详解**:
- \`TarInfo\` 比 \`ZipInfo\` 信息更丰富,包含 Unix 权限、所有者、链接类型等。
- \`isdir()\` / \`isfile()\` / \`issym()\` 判断成员类型。
- 解压时同样要注意路径穿越攻击,Python 3.12+ 增加了 \`filter='data'\` 参数用于安全过滤。

## 四、shutil 高层封装

\`shutil\` 提供了一行代码打包/解压的便捷函数,适合简单场景。

### demo 8:shutil.make_archive 和 unpack_archive

\`\`\`python
import shutil

# make_archive(base_name, format, root_dir)
# base_name:输出文件名(不含扩展名)
# format:支持的格式 zip / tar / gztar / bztar / xztar
# root_dir:要打包的目录
shutil.make_archive("backup", "gztar", root_dir="zip_src")
# 生成 backup.tar.gz

# unpack_archive(filename, extract_dir)
shutil.unpack_archive("backup.tar.gz", extract_dir="shutil_extracted")

# 查看支持的格式
print(shutil.get_archive_formats())
# [('zip', 'ZIP file'), ('tar', 'uncompressed tar file'), ('gztar', "gzip'ed tar-file"), ...]
\`\`\`

**详解**:
- \`make_archive\` 是最简单的打包方式,一行搞定,但灵活性不如直接用 \`zipfile\` / \`tarfile\`。
- \`unpack_archive\` 自动识别格式(zip、tar、gz 等)。
- 适合「我只想打包整个目录」的简单需求。如果需要控制包内结构、添加注释、设置密码,就要回到 \`zipfile\` / \`tarfile\`。

## 五、zipfile 加密(注意限制)

\`\`\`python
# zipfile 支持传统 ZipCrypto 加密,但安全性弱
with zipfile.ZipFile("secret.zip", "w") as zf:
    zf.setpassword(b"mypassword")  # 设置密码
    zf.write("zip_src/a.txt", arcname="a.txt")

# 读取时需要密码
with zipfile.ZipFile("secret.zip") as zf:
    zf.setpassword(b"mypassword")
    print(zf.read("a.txt").decode("utf-8"))
\`\`\`

**详解**:
- \`setpassword\` 设置密码,后续 \`write\` 和 \`read\` 都用这个密码。
- **严重警告**:zipfile 的加密是传统 ZipCrypto,容易被破解,不适合保护敏感数据。如果需要强加密,建议用 \`cryptography\` 库先加密文件再打包,或者用 \`pyzipper\` 第三方库(支持 AES)。

## 六、zipfile vs tarfile 选择

| 维度 | zipfile | tarfile |
|------|---------|---------|
| 平台 | 跨平台(Windows/Mac/Linux 都能直接打开) | Unix 系为主(Windows 需要工具) |
| 压缩 | 每个文件单独压缩 | 整体打包后压缩(对大量小文件压缩率更高) |
| 权限 | 不保留 Unix 权限 | 保留权限、所有者、软链接 |
| 加密 | 支持(弱) | 不支持(需要外层加密) |
| 流式追加 | 支持 \`a\` 模式 | 支持 \`a\` 模式 |
| 适用场景 | 跨平台分发、给用户的下载包 | Linux 服务器备份、保留权限 |

**选择建议**:Windows 用户多 → zip;Linux 服务器备份 → tar.gz;需要保留权限 → tar;跨平台且要密码 → zip(弱加密)或用 pyzipper。

## 七、小结

- \`zipfile\` 跨平台友好,\`writestr\` 可以直接写内存内容,\`namelist\`/\`infolist\` 查看包内结构。
- \`tarfile\` 适合 Unix 场景,支持 gz/bz2/xz 多种压缩算法,保留文件权限。
- \`shutil.make_archive\` / \`unpack_archive\` 一行搞定简单打包解压。
- 加密用 zipfile 的传统加密不安全,敏感数据要用外层加密。
- 解压不可信来源时警惕路径穿越和 zip 炸弹。`,
  },
  {
    id: "pyfile-encoding",
    icon: "🌐",
    title: "文件编码深入:字符编码处理",
    group: "进阶实战",
    content: `# 文件编码深入:字符编码处理

## 一、引言

「乱码」是中文开发者永恒的痛。一份从 Windows 同事那里收来的中文 txt,在 Mac 上打开全是问号;从数据库导出的 CSV 在 Excel 里显示乱码;Git 提交日志在终端里变成 \`\\xe4\\xb8\\xad\`……

要根治乱码,必须理解字符编码。本章系统讲清楚编码的本质、常见编码的区别、BOM 的处理、编码检测、编码转换,以及乱码排查方法。

## 二、字符编码的历史脉络

| 时代 | 编码 | 说明 |
|------|------|------|
| 1960s | ASCII | 7 位,128 个字符,只够英文 |
| 1980s | GB2312 / GBK | 中文扩展,2 字节表示一个汉字 |
| 1990s | ISO-8859-1 (Latin-1) | 西欧语言,1 字节 |
| 1990s | Unicode | 统一码,目标是收录所有字符 |
| 2000s | UTF-8 | Unicode 的可变长编码(1~4 字节),互联网主流 |
| 2000s | UTF-16 | Unicode 的定长(2 或 4 字节),Windows 内部用 |

### 编码 vs 解码

- **编码(encode)**:字符串 → 字节(\`str.encode()\`)
- **解码(decode)**:字节 → 字符串(\`bytes.decode()\`)

\`\`\`python
s = "你好"
b = s.encode("utf-8")      # str -> bytes,编码
print(b)                    # b'\\xe4\\xbd\\xa0\\xe5\\xa5\\xbd'
print(b.decode("utf-8"))   # bytes -> str,解码 -> "你好"
\`\`\`

**关键原则**:用编码 A 写的文件,必须用同样的编码 A 读,否则会乱码或报错。

## 三、demo 1:UTF-8 文件读写

\`\`\`python
# 写入 UTF-8 文件(Python 3 默认就是 UTF-8)
content = "你好世界 Hello World 123"
with open("utf8_demo.txt", "w", encoding="utf-8") as f:
    f.write(content)

# 读取 UTF-8 文件
with open("utf8_demo.txt", "r", encoding="utf-8") as f:
    data = f.read()
    print(data)  # 你好世界 Hello World 123

# 不指定 encoding 时,Python 用平台默认编码(Windows 是 GBK,Mac/Linux 是 UTF-8)
# 显式指定 encoding="utf-8" 是好习惯,保证跨平台一致
\`\`\`

**详解**:
- Python 3 的 \`open()\` 默认 encoding 跟操作系统相关:Windows 上是 GBK(cp936),Mac/Linux 上是 UTF-8。这就是为什么同一份代码在不同平台行为可能不同。
- **强烈建议**显式写 \`encoding="utf-8"\`,除非有特殊历史原因要读老文件。
- UTF-8 是互联网标准,优先选用。

## 四、demo 2:GBK 文件处理

\`\`\`python
# 老的 Windows 中文系统默认 GBK 编码
# 很多遗留的 .txt / .csv 文件是 GBK

# 用 GBK 写入文件
with open("gbk_demo.txt", "w", encoding="gbk") as f:
    f.write("你好,这是 GBK 编码的文件")

# 用 GBK 读取
with open("gbk_demo.txt", "r", encoding="gbk") as f:
    print(f.read())

# ❌ 错误示范:用 UTF-8 读 GBK 文件
# with open("gbk_demo.txt", "r", encoding="utf-8") as f:
#     f.read()  # UnicodeDecodeError 或乱码
\`\`\`

**详解**:
- GBK 是 2 字节编码,只覆盖中文和英文,不支持 emoji、生僻字。
- Windows 系统记事本默认保存的文件,中文版可能是 GBK 或 UTF-8(取决于记事本版本和设置)。
- 用错编码读 GBK 文件,要么直接 \`UnicodeDecodeError\`,要么读出一堆乱码字符。

## 五、BOM(Byte Order Mark)

BOM 是文件开头的几个特殊字节,用来标识编码类型和字节序。

| 编码 | BOM 字节 | 说明 |
|------|----------|------|
| UTF-8 | \`\\xef\\xbb\\xbf\` | 可选,标识「这是 UTF-8」 |
| UTF-16 BE | \`\\xfe\\xff\` | 大端序 |
| UTF-16 LE | \`\\xff\\xfe\` | 小端序(Windows 常见) |
| UTF-32 BE | \`\\x00\\x00\\xfe\\xff\` | 大端序 |

### demo 3:BOM 的产生与处理

\`\`\`python
# utf-8 编码不写 BOM
with open("no_bom.txt", "w", encoding="utf-8") as f:
    f.write("hello")

# utf-8-sig 编码会写入 BOM(Windows 记事本保存为 UTF-8 时常用)
with open("with_bom.txt", "w", encoding="utf-8-sig") as f:
    f.write("hello")

# 看看字节差异
with open("no_bom.txt", "rb") as f:
    print(f.read())   # b'hello'
with open("with_bom.txt", "rb") as f:
    print(f.read())   # b'\\xef\\xbb\\xbfhello'

# 读取时,BOM 会被当作内容的一部分
with open("with_bom.txt", "r", encoding="utf-8") as f:
    print(repr(f.read()))   # '\\ufeffhello'  ← 多了个 \\ufeff

# 用 utf-8-sig 读取,会自动去掉 BOM
with open("with_bom.txt", "r", encoding="utf-8-sig") as f:
    print(repr(f.read()))   # 'hello'  ← 干净了
\`\`\`

**详解**:
- \`\\ufeff\` 是 BOM 字符(ZERO WIDTH NO-BREAK SPACE),打印出来是看不见的,但确实存在,会污染内容。
- Windows 记事本「另存为 UTF-8」实际是 UTF-8 with BOM,这就是为什么 Mac/Linux 读这些文件时字符串开头总有个看不见的字符。
- **最佳实践**:读取未知来源的 UTF-8 文件时,用 \`encoding="utf-8-sig"\`,它会自动处理有/无 BOM 两种情况。
- 写入时除非要兼容 Windows 老软件,否则用普通 \`utf-8\`,不要写 BOM。

## 六、编码检测:chardet / charset-normalizer

当不知道文件编码时,可以用第三方库自动检测。

### demo 4:用 charset-normalizer 检测编码

\`\`\`python
# pip install charset-normalizer
# 这是 chardet 的现代替代品,Python 标准库已内置( requests 也在用)

import charset_normalizer

# 读取文件的原始字节
with open("gbk_demo.txt", "rb") as f:
    raw_bytes = f.read()

# 检测编码
result = charset_normalizer.detect(raw_bytes)
print(result)
# {'encoding': 'gbk', 'language': 'Chinese', 'confidence': 0.99}

# 用检测到的编码读取
encoding = result["encoding"]
with open("gbk_demo.txt", "r", encoding=encoding) as f:
    print(f.read())
\`\`\`

**详解**:
- \`charset_normalizer.detect(bytes)\` 接收字节,返回 \`{"encoding": ..., "confidence": ...}\`。
- 检测不是 100% 准确,特别是短文本或混合编码时,要看 \`confidence\`。
- 老牌的 \`chardet\` 也能用,API 类似,但 \`charset-normalizer\` 更现代更快。
- 实际项目里,优先知道编码就用指定编码,检测是兜底方案。

## 七、demo 5:编码转换(读一种编码,写另一种编码)

\`\`\`python
def convert_encoding(src_path, src_enc, dst_path, dst_enc):
    """把文件从 src_enc 转换为 dst_enc"""
    # 1. 用原编码读入为字符串
    with open(src_path, "r", encoding=src_enc) as f:
        content = f.read()

    # 2. 用目标编码写出
    with open(dst_path, "w", encoding=dst_enc) as f:
        f.write(content)

    print(f"已转换: {src_enc} -> {dst_enc}")

# 把 GBK 文件转成 UTF-8
convert_encoding("gbk_demo.txt", "gbk", "converted_utf8.txt", "utf-8")

# 把 UTF-8 文件转成 GBK(注意:如果有 GBK 不支持的字符会报错)
# convert_encoding("converted_utf8.txt", "utf-8", "back_gbk.txt", "gbk")
\`\`\`

**详解**:
- 编码转换的核心:\`bytes -> str (decode) -> str -> bytes (encode)\`。
- 中间经过 Python 内部的 Unicode 字符串过渡,这是「正确的方式」。
- 注意:目标编码可能不支持某些字符(比如 GBK 不支持 emoji),会抛 \`UnicodeEncodeError\`。可以用 \`errors="replace"\` 替换为问号。

## 八、demo 6:乱码排查与修复

\`\`\`python
# 模拟一个常见乱码场景:GBK 字节被当成 UTF-8 解码
original = "你好"
gbk_bytes = original.encode("gbk")        # b'\\xc4\\xe3\\xba\\xc3'
print(gbk_bytes)

# ❌ 用 UTF-8 解码 GBK 字节,会报错
try:
    wrong = gbk_bytes.decode("utf-8")
except UnicodeDecodeError as e:
    print(f"解码失败: {e}")

# ❌ 用 Latin-1 解码,不报错但出乱码
wrong_text = gbk_bytes.decode("latin-1")
print(wrong_text)  # ÄãºÃ  ← 经典乱码

# ✅ 修复:用正确的编码解码
correct = gbk_bytes.decode("gbk")
print(correct)  # 你好
\`\`\`

**详解**:
- 乱码的本质:用错误的编码解码字节流。
- \`Latin-1\`(ISO-8859-1)是个「万能解码器」——任何字节都能映射成字符,所以从不会报错,但会出乱码。这就是为什么 Latin-1 读取任何文件都不报错但内容怪异。
- 排查乱码步骤:
  1. 用二进制模式读出原始字节
  2. 用 \`charset_normalizer.detect\` 检测编码
  3. 用检测到的编码重新读取
  4. 看是否还有乱码,如果是混合编码,可能要分段处理

### 「锟斤拷」「烫烫烫」经典乱码

- **锟斤拷**:UTF-8 字节被当成 GBK 解码。原因:UTF-8 替换字符 \`\\ufffd\` 编码成 \`\\xef\\xbf\\xbd\`,被 GBK 解读成「锟斤拷」。
- **烫烫烫**:VC 调试器把未初始化内存(\`0xCC\`)当成字符显示,刚好是 GBK 的「烫」。
- **屯屯屯**:类似,未初始化堆内存(\`0xCD\`)。

记住这些特征,看到对应乱码就能反推原因。

## 九、demo 7:errors 参数处理解码错误

\`\`\`python
# 写入一个 UTF-8 文件,里面有个无法用 GBK 表示的 emoji
with open("mixed.txt", "w", encoding="utf-8") as f:
    f.write("你好 Hello 😀 emoji")

# 用 GBK 读取会报错,因为 GBK 不支持 emoji
# with open("mixed.txt", "r", encoding="gbk") as f:
#     f.read()  # UnicodeDecodeError

# errors="replace":用 ? 替换无法解码的字符
with open("mixed.txt", "r", encoding="gbk", errors="replace") as f:
    print(f.read())  # 你好 Hello ?? emoji(大概)

# errors="ignore":直接跳过无法解码的字符
with open("mixed.txt", "r", encoding="gbk", errors="ignore") as f:
    print(f.read())

# errors="backslashreplace":用 \\xHH 转义
with open("mixed.txt", "r", encoding="gbk", errors="backslashreplace") as f:
    print(f.read())
\`\`\`

**详解**:
\`errors\` 参数控制遇到错误时的行为:

| 值 | 行为 |
|----|------|
| \`strict\`(默认) | 抛 \`UnicodeError\` |
| \`replace\` | 用 \`?\`(解码)或 \`?/\`\\\\ufffd\`(编码)替换 |
| \`ignore\` | 跳过错误字符 |
| \`backslashreplace\` | 用 \`\\xHH\` / \`\\uHHHH\` 转义 |
| \`surrogateescape\` | 保留字节信息,可无损还原(适合未知编码的文件) |

**实用建议**:处理日志文件时,可以用 \`errors="replace"\` 防止单行损坏导致整个文件读不出来。

## 十、编码选择建议表

| 场景 | 推荐编码 | 理由 |
|------|----------|------|
| 新项目所有文本文件 | UTF-8(无 BOM) | 互联网标准,跨平台 |
| 给 Windows Excel 导出 CSV | UTF-8 with BOM (\`utf-8-sig\`) | Excel 才能正确识别中文 |
| 读 Windows 老文件 | GBK (cp936) | Windows 中文系统默认 |
| 处理日文 | Shift-JIS / UTF-8 | 看具体来源 |
| 处理 Linux 系统文件 | UTF-8 | Linux 默认 |
| Web 接口返回 JSON | UTF-8 | HTTP/JSON 规范 |
| 内部数据库存储 | UTF-8 | 通用 |

## 十一、混合编码文件的处理策略

某些遗留系统会产生「一个文件里多种编码混用」的情况(比如日志里既有 UTF-8 也有 GBK)。处理思路:

\`\`\`python
def safe_read_lines(path, primary="utf-8", fallback="gbk"):
    """尝试用主编码读,失败行用备用编码读"""
    results = []
    # 用二进制模式按字节读,再手动分行
    with open(path, "rb") as f:
        raw = f.read()
    # 按换行符切分(保留换行)
    for line_bytes in raw.split(b"\\n"):
        try:
            line = line_bytes.decode(primary)
        except UnicodeDecodeError:
            try:
                line = line_bytes.decode(fallback)
            except UnicodeDecodeError:
                line = line_bytes.decode(primary, errors="replace")
        results.append(line)
    return results

# 这种处理很 hack,根本方案是统一编码
\`\`\`

**详解**:
- 混合编码是反模式,治本方法是统一编码。
- 如果实在没法,用「行级 fallback」逐行尝试不同编码。
- 更复杂的可以用 \`surrogateescape\` 保留原始字节,处理完再写回。

## 十二、小结

- 编码 = str → bytes,解码 = bytes → str,读写要配对。
- 默认用 UTF-8,Windows Excel 用 utf-8-sig,老文件可能要 GBK。
- BOM 用 \`utf-8-sig\` 读写自动处理。
- 未知编码用 \`charset-normalizer\` 检测,但不一定准。
- 乱码本质是用错编码,看到「锟斤拷」反推是 UTF-8 被当 GBK 读。
- \`errors\` 参数控制错误处理,\`replace\` 最实用。
- 治本方案:统一用 UTF-8。`,
  },
  {
    id: "pyfile-file-lock",
    icon: "🔒",
    title: "文件锁与并发访问",
    group: "进阶实战",
    content: `# 文件锁与并发访问

## 一、引言

当多个进程/线程同时读写同一个文件时,会出现严重问题:

- 两个进程同时写,内容互相覆盖,数据丢失
- 一个进程写一半,另一个进程读到了「半截」内容
- 日志文件被多进程追加,出现交错乱序

这些都是「竞态条件」(race condition)。解决方法是「文件锁」(file lock),确保同一时刻只有一个进程能修改文件。

本章讲清楚文件锁的类型、不同平台的使用方式、跨平台方案、以及原子写入的替代方案。

## 二、并发访问文件的问题

### demo 1:演示并发写问题

\`\`\`python
# 模拟 100 个进程同时给计数器 +1
import multiprocessing
import os

def increment_counter(file_path):
    """读取-修改-写回,非原子操作"""
    with open(file_path, "r") as f:
        val = int(f.read().strip())
    val += 1
    with open(file_path, "w") as f:
        f.write(str(val))

def test_without_lock():
    counter_file = "counter.txt"
    with open(counter_file, "w") as f:
        f.write("0")

    # 100 个进程并发 +1
    procs = []
    for _ in range(100):
        p = multiprocessing.Process(target=increment_counter, args=(counter_file,))
        procs.append(p)
        p.start()
    for p in procs:
        p.join()

    with open(counter_file) as f:
        print(f"最终值(期望 100):{f.read()}")  # 实际可能是 70、50 等小于 100 的值

# test_without_lock()  # 取消注释运行,会看到计数丢失
\`\`\`

**详解**:
- 「读取-修改-写回」是经典的非原子操作,中间有时间窗口。
- 进程 A 读到 5,还没写回;进程 B 也读到 5;然后 A 写 6,B 也写 6,本来应该是 7。
- 多进程并发执行,\`open(file, "w")\` 会立即截断文件,如果两个进程同时打开,数据就乱了。
- 解决方案:用文件锁确保「读-改-写」是原子的。

## 三、文件锁的类型

| 锁类型 | 说明 | 适用场景 |
|--------|------|---------|
| 共享锁(SH,读锁) | 多个进程可同时持有,只读 | 多个进程同时读 |
| 排他锁(EX,写锁) | 独占,其他锁都被阻塞 | 修改文件时 |

规则:多个共享锁可共存;共享锁和排他锁互斥;多个排他锁互斥。

## 四、fcntl 模块(Unix 专用)

\`fcntl\` 是 Unix/Linux/Mac 的文件锁方案,通过 \`flock\` 系统调用实现。

### 核心 API

| API | 作用 |
|-----|------|
| \`fcntl.flock(fd, operation)\` | 对文件描述符加锁/解锁 |
| \`fcntl.LOCK_SH\` | 共享锁(读) |
| \`fcntl.LOCK_EX\` | 排他锁(写) |
| \`fcntl.LOCK_UN\` | 解锁 |
| \`fcntl.LOCK_NB\` | 非阻塞(配合 \| 使用) |

### demo 2:fcntl 排他锁

\`\`\`python
import fcntl
import time
import os

def write_with_lock(file_path, content):
    """用排他锁安全写入文件"""
    # 用 'a' 模式打开,不截断
    with open(file_path, "a") as f:
        # 加排他锁(会阻塞直到拿到锁)
        fcntl.flock(f.fileno(), fcntl.LOCK_EX)
        try:
            # 拿到锁后,安全写入
            f.write(content + "\\n")
            f.flush()           # 立即刷到操作系统缓冲
            os.fsync(f.fileno()) # 强制刷到磁盘
            print(f"已写入: {content}")
        finally:
            # 释放锁
            fcntl.flock(f.fileno(), fcntl.LOCK_UN)

# 多个进程同时调用,会自动排队
write_with_lock("app.log", f"[{time.time()}] hello from process {os.getpid()}")
\`\`\`

**详解**:
- \`flock\` 是「建议性锁」(advisory lock)——只有大家都用 flock 才有效,不用的进程可以无视。
- \`f.fileno()\` 拿到文件描述符(整数),fcntl 操作的是 fd 而不是文件对象。
- \`LOCK_EX\` 默认是阻塞的:如果锁被占用,会一直等。
- \`f.flush()\` 把 Python 缓冲刷到 OS,\`os.fsync()\` 把 OS 缓冲刷到磁盘,确保掉电不丢数据。
- \`with\` 退出时即使忘了 UN,文件关闭也会自动释放锁(但显式 UN 更清晰)。

### demo 3:fcntl 共享锁(多进程同时读)

\`\`\`python
import fcntl

def read_with_shared_lock(file_path):
    """用共享锁读取文件,允许多个读者"""
    with open(file_path, "r") as f:
        fcntl.flock(f.fileno(), fcntl.LOCK_SH)   # 加共享锁
        try:
            content = f.read()
            return content
        finally:
            fcntl.flock(f.fileno(), fcntl.LOCK_UN)

# 多个进程可以同时持有 LOCK_SH,并发读取不阻塞
data = read_with_shared_lock("app.log")
print(data[:100])
\`\`\`

**详解**:
- \`LOCK_SH\` 是共享锁,允许多个进程同时读,但任何进程要写(EX)时必须等所有 SH 释放。
- 典型应用:配置文件、只读缓存的并发读。
- 如果只是读文件而不加锁,通常也能读(因为读不破坏数据),但加 SH 锁可以防止「读到正在被写的半截内容」。

### demo 4:非阻塞锁(LOCK_NB)

\`\`\`python
import fcntl
import time

def try_write(file_path, content):
    """尝试加锁,拿不到立即返回而不等待"""
    with open(file_path, "a") as f:
        try:
            # LOCK_EX | LOCK_NB:拿不到锁就抛异常,不阻塞
            fcntl.flock(f.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            print("文件被锁,稍后再试")
            return False
        try:
            f.write(content + "\\n")
            return True
        finally:
            fcntl.flock(f.fileno(), fcntl.LOCK_UN)

try_write("app.log", "尝试写入")
\`\`\`

**详解**:
- \`LOCK_NB\`(non-blocking)配合 \`LOCK_EX\` 使用:拿不到锁立即抛 \`BlockingIOError\`,不等待。
- 适合「拿不到锁就跳过」的场景,比如定时任务检测:如果上次任务还在跑,就跳过本次。
- 也可以配合 \`time.sleep\` 实现简单的「重试 N 次」逻辑。

## 五、Windows 的文件锁:msvcrt.locking

Windows 没有 fcntl,但有 \`msvcrt\` 模块提供 \`locking\` 函数。

\`\`\`python
import msvcrt  # 仅 Windows 可用

def windows_lock_write(file_path, content):
    with open(file_path, "a") as f:
        # msvcrt.locking(fd, mode, nbytes)
        # mode: LK_LOCK(阻塞) / LK_NBLCK(非阻塞) / LK_UNLCK(解锁)
        msvcrt.locking(f.fileno(), msvcrt.LK_LOCK, 1)
        try:
            f.write(content + "\\n")
        finally:
            # 解锁时锁定 0 字节
            msvcrt.locking(f.fileno(), msvcrt.LK_UNLCK, 1)
\`\`\`

**详解**:
- \`msvcrt.locking\` 锁的是「字节范围」,需要指定锁多少字节。
- 锁 1 字节常用作「整个文件的标志位」。
- API 比 fcntl 麻烦,实际项目很少直接用,通常用跨平台库。

## 六、跨平台方案:portalocker

\`portalocker\` 是第三方库,封装了 fcntl(Unix)和 msvcrt(Windows),API 统一。

### demo 5:portalocker 跨平台加锁

\`\`\`python
# pip install portalocker
import portalocker

def cross_platform_write(file_path, content):
    """跨平台的安全写入"""
    # portalocker.lock 自动选择 fcntl 或 msvcrt
    with open(file_path, "a") as f:
        # LOCK_EX:排他锁;timeout=5 等待 5 秒
        portalocker.lock(f, portalocker.LOCK_EX, timeout=5)
        try:
            f.write(content + "\\n")
            f.flush()
        finally:
            portalocker.unlock(f)

cross_platform_write("app.log", "跨平台写入")
\`\`\`

**详解**:
- \`portalocker.lock(f, mode, timeout)\` 接收文件对象(不是 fd),API 更友好。
- \`timeout\` 参数支持「等待 N 秒拿不到就抛异常」,不用手写重试循环。
- 自动适配平台,代码同一份能在 Windows / Mac / Linux 跑。
- **强烈推荐**:生产环境用 portalocker,不要手写平台判断。

## 七、原子写入:临时文件 + rename

文件锁解决「并发修改」,但还有一种场景:写入过程中断(程序崩溃、断电),文件可能损坏成「半截」。

**原子写入**(atomic write)的思路:写到临时文件,写完后用 \`os.rename\` 替换原文件。\`rename\` 在同一文件系统下是原子的。

### demo 6:原子写入模式

\`\`\`python
import os
import tempfile

def atomic_write(file_path, content):
    """原子写入:先写临时文件,再 rename 替换"""
    dir_name = os.path.dirname(file_path) or "."
    # 在同目录创建临时文件(关键:必须在同一文件系统才能原子 rename)
    fd, tmp_path = tempfile.mkstemp(dir=dir_name, prefix=".tmp_")
    try:
        with os.fdopen(fd, "w") as f:
            f.write(content)
            f.flush()
            os.fsync(f.fileno())
        # rename 是原子的:要么成功(看到新内容),要么失败(看到旧内容)
        # 不会出现「半截」状态
        os.replace(tmp_path, file_path)  # Python 3.3+ 跨平台原子替换
    except Exception:
        # 出错时清理临时文件
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
        raise

atomic_write("config.json", '{"key": "value"}')
\`\`\`

**详解**:
- \`tempfile.mkstemp(dir=...)\` 创建临时文件,**必须和目标文件在同一目录**,因为 \`rename\` 跨文件系统不是原子的(会退化为复制+删除)。
- \`os.replace\` 是 \`os.rename\` 的「跨平台覆盖版」:目标已存在时会覆盖,Windows 上 \`rename\` 目标存在会失败。
- 写完后 \`fsync\` 确保数据落盘,再 rename,保证一致性。
- 异常时清理临时文件,避免垃圾残留。
- 这种模式广泛应用于:配置文件更新、数据库 WAL、版本切换。

## 八、demo 7:多进程安全的计数器(综合方案)

\`\`\`python
import fcntl
import os
import tempfile

def safe_increment(file_path):
    """带文件锁的原子计数器"""
    # 用 'r+' 模式:既能读又能写,不截断
    # 如果文件不存在,先创建
    if not os.path.exists(file_path):
        with open(file_path, "w") as f:
            f.write("0")

    with open(file_path, "r+") as f:
        fcntl.flock(f.fileno(), fcntl.LOCK_EX)  # 排他锁
        try:
            val = int(f.read().strip())
            val += 1
            f.seek(0)        # 指针回到开头
            f.truncate()     # 清空原内容(因为新值可能更短)
            f.write(str(val))
            f.flush()
            os.fsync(f.fileno())
            return val
        finally:
            fcntl.flock(f.fileno(), fcntl.LOCK_UN)

# 现在 100 个进程并发 +1,最终一定是 100
print(safe_increment("safe_counter.txt"))
\`\`\`

**详解**:
- \`'r+'\` 模式读写不截断,适合「读-改-写」。
- 加 \`LOCK_EX\` 后,整个读改写过程是原子的,其他进程会排队。
- \`truncate()\` 必要:如果新值比旧值短(比如 100 -> 99 是减 1,或 999 -> 1000 是增 1 但其实是从 999 涨到 1000,新值更长……不 truncate 的话,从 9 涨到 10,写 "10" 后文件是 "10" + 原来的尾部 "9" = "109" 这种 bug)。先 \`seek(0)\` 再 \`truncate()\` 清空再写。
- 这是「文件锁 + seek + truncate」的标准模式。

## 九、跨平台注意事项表

| 平台 | 推荐方案 | 备注 |
|------|----------|------|
| Linux/Mac | \`fcntl.flock\` | 原生支持,简单可靠 |
| Windows | \`msvcrt.locking\` | API 麻烦,字节范围锁 |
| 跨平台 | \`portalocker\` | 第三方库,推荐 |
| 任何平台 | 原子写入(temp+rename) | 不需要锁,适合配置文件 |
| 网络文件系统(NFS) | \`fcntl.flock\` 可能不可靠 | NFS 锁实现复杂,推荐用本地文件 |

## 十、文件锁 vs 数据库锁

| 场景 | 选择 |
|------|------|
| 单机多进程共享一个文件 | 文件锁(本章) |
| 多机器分布式 | 数据库 / Redis 分布式锁 |
| 高并发高频更新 | 数据库(行锁、事务) |
| 低频配置更新 | 原子写入 |

文件锁适合「低频、单机」场景。如果是高频更新或多机,应该用数据库。

## 十一、小结

- 并发写文件会丢数据,必须加锁或用原子写入。
- Unix 用 \`fcntl.flock\`,Windows 用 \`msvcrt.locking\`,跨平台用 \`portalocker\`。
- 共享锁(LOCK_SH)给读,排他锁(LOCK_EX)给写。
- \`LOCK_NB\` 非阻塞,拿不到锁立即返回。
- 原子写入(临时文件 + \`os.replace\`)不需要锁,适合配置文件。
- 配置文件用原子写入,日志/计数器用文件锁。`,
  },
  {
    id: "pyfile-case-study",
    icon: "🚀",
    title: "实战案例:日志分析器与文件同步工具",
    group: "进阶实战",
    content: `# 实战案例:日志分析器与文件同步工具

## 一、引言

本章把前面学的所有知识(逐行读取、路径处理、seek、编码、文件锁、压缩等)综合起来,实现三个实战工具:

1. **日志分析器**:解析 Nginx/Apache 日志,统计访问量、找出错误
2. **文件同步工具**:比较两个目录,把新增/修改的文件复制过去
3. **批量重命名工具**:按规则批量重命名文件

每个案例都是完整可运行的脚本,注释详尽,并强调错误处理与边界情况。

## 二、案例一:日志分析器

### 需求

读取一个 Nginx 访问日志文件,统计:

- 总请求数
- 各 HTTP 状态码数量
- 访问量 Top 10 的 URL
- 所有 5xx 错误的详情

### 用到的技术

- 逐行读取(大文件友好)
- 正则表达式解析日志行
- \`collections.Counter\` 统计
- 生成器(yield)按需处理
- 编码处理(\`errors="replace"\` 防止单行损坏)

### 完整实现

\`\`\`python
import re
from collections import Counter, defaultdict
from pathlib import Path

# Nginx 默认日志格式示例:
# 192.168.1.1 - - [10/Jan/2024:13:55:36 +0800] "GET /api/users HTTP/1.1" 200 1234
# 用正则提取 IP、时间、方法、URL、协议、状态码、字节数
LOG_PATTERN = re.compile(
    r'(?P<ip>\\d+\\.\\d+\\.\\d+\\.\\d+)'                         # IP 地址
    r'\\s+-\\s+-\\s+'                                              # 固定分隔
    r'\\[(?P<time>[^\\]]+)\\]\\s+'                                 # 时间 [10/Jan/...]
    r'"(?P<method>\\w+)\\s+(?P<url>\\S+)\\s+(?P<proto>[^"]+)"\\s+'  # "GET /url HTTP/1.1"
    r'(?P<status>\\d+)\\s+'                                        # 状态码 200
    r'(?P<size>\\d+|-)'                                            # 字节数
)

def parse_log_line(line):
    """解析单行日志,返回字典或 None"""
    match = LOG_PATTERN.search(line)
    if not match:
        return None
    d = match.groupdict()
    # 状态码转 int,size 处理 '-'
    d["status"] = int(d["status"])
    d["size"] = 0 if d["size"] == "-" else int(d["size"])
    return d

def iter_log_lines(path):
    """生成器:逐行读取日志文件,大文件友好"""
    # errors="replace" 防止单行编码错误导致整个文件读不了
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        for line in f:           # 逐行迭代,不会一次性载入内存
            yield line.rstrip("\\n")

def analyze_log(path):
    """分析日志,返回统计结果"""
    total = 0
    status_counter = Counter()      # 状态码计数
    url_counter = Counter()         # URL 访问计数
    errors_5xx = []                 # 5xx 错误详情

    for line in iter_log_lines(path):
        parsed = parse_log_line(line)
        if not parsed:
            continue                # 跳过无法解析的行

        total += 1
        status_counter[parsed["status"]] += 1
        url_counter[parsed["url"]] += 1

        if 500 <= parsed["status"] < 600:
            errors_5xx.append(parsed)

    return {
        "total": total,
        "status": status_counter,
        "top_urls": url_counter.most_common(10),
        "errors": errors_5xx,
    }

def print_report(result):
    """打印分析报告"""
    print(f"总请求数:{result['total']}")
    print("\\n状态码分布:")
    for status, count in sorted(result["status"].items()):
        print(f"  {status}: {count}")

    print("\\nTop 10 URL:")
    for url, count in result["top_urls"]:
        print(f"  {count:5d}  {url}")

    print(f"\\n5xx 错误数:{len(result['errors'])}")
    for err in result["errors"][:5]:   # 只显示前 5 条
        print(f"  {err['ip']} -> {err['url']}  [{err['status']}]")

# 使用示例
# result = analyze_log("access.log")
# print_report(result)
\`\`\`

**详解**:
- **正则解析**:\`re.compile\` 预编译正则,性能更好。用命名分组 \`(?P<name>...)\` 提取字段。
- **生成器**:\`iter_log_lines\` 用 \`yield\` 逐行产出,即使日志有 10GB 也只占一行内存。
- **errors="replace"**:日志可能含损坏字符(攻击者注入、编码混乱),用 replace 防止整个文件读不出来。
- **Counter**:\`most_common(10)\` 直接拿 Top 10,比手写排序高效。
- **边界情况**:跳过无法解析的行(\`if not parsed: continue\`),保证健壮性。

## 三、案例二:文件同步工具(简易版)

### 需求

比较源目录和目标目录,把「新增或修改」的文件复制到目标目录,实现单向同步。

### 用到的技术

- \`pathlib.Path\` 路径处理
- \`os.stat\` / \`Path.stat()\` 获取修改时间
- \`shutil.copy2\` 保留元数据复制
- 字典比较

### 完整实现

\`\`\`python
import shutil
from pathlib import Path
import filecmp

def list_files(root):
    """递归列出目录下所有文件,返回 {相对路径: Path} 字典"""
    root = Path(root)
    files = {}
    for path in root.rglob("*"):          # 递归遍历
        if path.is_file():
            rel = path.relative_to(root)  # 相对路径作为 key
            files[str(rel)] = path
    return files

def should_copy(src_path, dst_path):
    """判断是否需要复制:目标不存在,或内容不同"""
    if not dst_path.exists():
        return True
    # filecmp.cmp 比较文件内容(不是只看时间,更可靠)
    return not filecmp.cmp(src_path, dst_path, shallow=False)

def sync_directory(src, dst):
    """单向同步:把 src 的新增/修改复制到 dst"""
    src, dst = Path(src), Path(dst)
    src_files = list_files(src)
    dst_files = list_files(dst)

    copied = 0
    skipped = 0

    for rel, src_path in src_files.items():
        dst_path = dst / rel
        if should_copy(src_path, dst_path):
            # 创建目标子目录(如果不存在)
            dst_path.parent.mkdir(parents=True, exist_ok=True)
            # copy2 保留元数据(修改时间、权限)
            shutil.copy2(src_path, dst_path)
            print(f"已复制: {rel}")
            copied += 1
        else:
            skipped += 1

    # 可选:删除目标中多余的文件(谨慎!)
    # for rel in dst_files:
    #     if rel not in src_files:
    #         (dst / rel).unlink()
    #         print(f"已删除多余: {rel}")

    print(f"\\n同步完成:复制 {copied},跳过 {skipped}")

# 使用示例
# sync_directory("/path/to/src", "/path/to/dst")
\`\`\`

**详解**:
- **\`Path.rglob("*")\`** 递归遍历,\`is_file()\` 过滤掉目录。
- **\`relative_to\`** 计算相对路径,作为同步的 key,确保 src 和 dst 的目录结构对应。
- **\`filecmp.cmp(shallow=False)\`** 真正比较文件内容字节,\`shallow=True\`(默认)只看 stat(大小+时间),快但可能误判。生产场景用 \`shallow=False\` 更可靠。
- **\`mkdir(parents=True, exist_ok=True)\`** 自动创建多级目录,\`exist_ok=True\` 不报错如果已存在。
- **\`shutil.copy2\`** 比 \`shutil.copy\` 多保留元数据(修改时间、权限位)。
- **删除多余文件**默认注释掉,因为危险——确认逻辑没问题再开。

### 边界情况考虑

1. **符号链接**:\`Path.rglob\` 默认不跟随软链接,避免循环。
2. **权限错误**:\`shutil.copy2\` 可能因权限失败,可以包 \`try/except\`。
3. **大文件比较**:\`filecmp.cmp\` 内部会分块比较,不会一次性载入内存。
4. **并发修改**:同步过程中文件被修改可能出问题,生产环境要加文件锁。

## 四、案例三:批量重命名工具

### 需求

按规则批量重命名目录下的文件:

- 给图片按序号重命名(\`IMG_001.jpg\`, \`IMG_002.jpg\`...)
- 按修改日期重命名
- 统一扩展名(\`.jpeg\` → \`.jpg\`)

### 完整实现

\`\`\`python
import os
from pathlib import Path
from datetime import datetime

def rename_sequential(directory, prefix="IMG_", start=1, exts=None):
    """按序号批量重命名"""
    directory = Path(directory)
    # 收集符合条件的文件
    if exts:
        # 统一小写比较
        exts_lower = {e.lower() for e in exts}
        files = [p for p in directory.iterdir()
                 if p.is_file() and p.suffix.lower() in exts_lower]
    else:
        files = [p for p in directory.iterdir() if p.is_file()]

    # 按文件名排序,保证顺序稳定
    files.sort(key=lambda p: p.name)

    # 先全部改名成临时名,避免冲突
    # 比如把 a.jpg -> IMG_001.jpg,但可能已有 IMG_001.jpg
    temp_names = []
    for i, path in enumerate(files):
        tmp = directory / f"__tmp_{i}_{path.name}"
        path.rename(tmp)
        temp_names.append(tmp)

    # 再改成最终名
    for i, tmp in enumerate(temp_names):
        new_name = f"{prefix}{start + i:03d}{tmp.suffix}"
        final = directory / new_name
        tmp.rename(final)
        print(f"{temp_names[i].name if False else ''} -> {new_name}")

def rename_by_date(directory, exts=None):
    """按修改时间批量重命名"""
    directory = Path(directory)
    if exts:
        exts_lower = {e.lower() for e in exts}
        files = [p for p in directory.iterdir()
                 if p.is_file() and p.suffix.lower() in exts_lower]
    else:
        files = [p for p in directory.iterdir() if p.is_file()]

    # 同样用临时名避免冲突
    temp_names = []
    for i, path in enumerate(files):
        tmp = directory / f"__tmp_{i}_{path.name}"
        path.rename(tmp)
        temp_names.append((tmp, path.stat().st_mtime))

    # 按时间排序
    temp_names.sort(key=lambda x: x[1])

    for i, (tmp, mtime) in enumerate(temp_names):
        dt = datetime.fromtimestamp(mtime)
        new_name = f"{dt.strftime('%Y%m%d_%H%M%S')}_{i:03d}{tmp.suffix}"
        final = directory / new_name
        tmp.rename(final)
        print(f"-> {new_name}")

def normalize_extension(directory, mapping):
    """统一扩展名:mapping = {'.jpeg': '.jpg'}"""
    directory = Path(directory)
    for path in directory.iterdir():
        if path.is_file():
            ext = path.suffix.lower()
            if ext in mapping:
                new_path = path.with_suffix(mapping[ext])
                path.rename(new_path)
                print(f"{path.name} -> {new_path.name}")

# 使用示例
# rename_sequential("photos", prefix="vacation_", start=1, exts=[".jpg", ".png"])
# rename_by_date("photos", exts=[".jpg"])
# normalize_extension("photos", {".jpeg": ".jpg", ".jpe": ".jpg"})
\`\`\`

**详解**:
- **两步重命名避免冲突**:先把所有文件改成临时名 \`__tmp_X_\`,再改成最终名。这样即使最终名跟现有文件冲突,也不会覆盖。
- **\`Path.iterdir()\`** 列出目录内容,不递归(\`rglob\` 才递归)。
- **\`Path.suffix\`** 拿扩展名,\`with_suffix\` 替换扩展名,API 很优雅。
- **\`path.rename(new_path)\`** 等同 \`os.rename\`,原子操作(同文件系统下)。
- **\`st_mtime\`** 是修改时间戳,用 \`datetime.fromtimestamp\` 转成可读格式。
- **dry run 模式**:生产代码建议加一个 \`dry_run=True\` 参数,只打印不真的改名,先预览。

## 五、综合技巧总结

### 1. 大文件处理

- **逐行读**:\`for line in f\` 内存友好
- **分块读**:\`f.read(8192)\` 控制块大小
- **生成器**:\`yield\` 按需产出,不一次性载入

### 2. 错误处理

\`\`\`python
# 处理文件时的健壮模式
try:
    with open(path, encoding="utf-8", errors="replace") as f:
        content = f.read()
except FileNotFoundError:
    print(f"文件不存在: {path}")
except PermissionError:
    print(f"权限不足: {path}")
except OSError as e:
    print(f"系统错误: {e}")
\`\`\`

### 3. 路径处理

- **\`Path\` 优于 \`os.path\`**:API 更现代,链式调用
- **\`Path / "sub" / "file"\`** 拼接路径,跨平台
- **\`rglob\`** 递归,\`glob\` 单层

### 4. 元数据保留

- \`shutil.copy2\` 保留修改时间、权限
- \`shutil.copyfile\` 只复制内容
- \`shutil.copytree\` 递归复制目录

### 5. 临时文件

\`\`\`python
import tempfile
# 自动清理的临时文件
with tempfile.NamedTemporaryFile(mode="w", suffix=".tmp", delete=False) as f:
    f.write("data")
    tmp_path = f.name
# 用完手动 unlink(如果 delete=False)
\`\`\`

## 六、性能优化建议

| 场景 | 优化手段 |
|------|---------|
| 大文件读取 | 逐行 / 分块,不要 \`read()\` 全部 |
| 大量小文件 | 用 \`os.scandir\` 替代 \`os.listdir\`(快 2 倍) |
| 频繁写入 | 用缓冲(\`BufferedWriter\`),批量 flush |
| 文件比较 | 先比 size(快),不同则比内容 |
| 目录遍历 | \`Path.rglob\` 简洁,\`os.walk\` 更可控 |

## 七、本章小结

三个案例综合运用了前面所有知识:

- **日志分析器**:逐行读取 + 正则 + Counter + 生成器 + 编码容错
- **文件同步工具**:pathlib + filecmp + shutil + 字典比较
- **批量重命名**:pathlib + 临时文件 + rename 原子性

实战中最重要的几点:

1. **大文件用迭代,不要一次性载入**
2. **路径用 pathlib,API 现代化**
3. **错误处理要全面:文件不存在、权限、编码**
4. **原子操作:临时文件 + rename 避免半截状态**
5. **生产代码先 dry run 预览,再实际执行**

掌握这些模式,日常的文件处理任务都能从容应对。`,
  },
];
