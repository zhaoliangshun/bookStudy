// =============================================================
// py8-chapters-batch8.js
// 模块：文件IO与模块（共 10 章）
// 全新制作，简单易懂，demo 多，难代码逐行讲解
// =============================================================

export const chapters = [
  {
    id: "py8-file-open",
    group: "文件IO与模块",
    icon: "📂",
    title: "文件打开与读写",
    content: `## 文件操作基础

Python 中用内置函数 \`open()\` 打开文件，得到**文件对象**，通过它读写内容。

### open() 函数

\`\`\`python
open(file, mode='r', encoding=None, ...)  # 打开文件
\`\`\`

| 参数 | 说明 |
|------|------|
| \`file\` | 文件路径（字符串或 pathlib.Path） |
| \`mode\` | 打开模式，默认 \`'r'\`（只读） |
| \`encoding\` | 编码，推荐始终指定 \`'utf-8'\` |

### mode 模式详解

| 模式 | 含义 |
|------|------|
| \`'r'\` | 只读（文件必须存在） |
| \`'w'\` | 只写（覆盖，文件不存在则创建） |
| \`'a'\` | 追加（在末尾写，文件不存在则创建） |
| \`'x'\` | 创建新文件（文件已存在则报错） |
| \`'b'\` | 二进制模式（如 \`'rb'\`, \`'wb'\`） |
| \`'t'\` | 文本模式（默认） |
| \`'+'\` | 读写模式（如 \`'r+'\`, \`'w+'\`） |

### with open 自动关闭（推荐）

\`\`\`python
# 推荐：使用 with 语句，自动关闭
with open("data.txt", "r", encoding="utf-8") as f:  # 使用上下文管理器：open("data.txt", "r", encoding="utf-8") as f
    content = f.read()  # 赋值变量 content
# 离开 with 块后，f.close() 自动执行

# 不推荐：手动打开关闭
f = open("data.txt", "r")  # 赋值变量 f
content = f.read()  # 赋值变量 content
f.close()  # 容易忘记！
\`\`\`

### 读取方法

| 方法 | 作用 |
|------|------|
| \`f.read()\` | 读全部内容 |
| \`f.read(size)\` | 读指定字节/字符数 |
| \`f.readline()\` | 读一行（含换行符） |
| \`f.readlines()\` | 读所有行，返回列表 |
| \`for line in f\` | 逐行迭代（推荐，不占内存） |

### 写入方法

| 方法 | 作用 |
|------|------|
| \`f.write(s)\` | 写入字符串 |
| \`f.writelines(lines)\` | 写入字符串列表（不自动加换行） |

### 文件指针操作

- \`f.tell()\`：返回当前指针位置（字节偏移）
- \`f.seek(offset, whence)\`：移动指针
  - \`whence=0\`：从开头（默认）
  - \`whence=1\`：从当前位置
  - \`whence=2\`：从末尾
- \`f.flush()\`：强制刷新缓冲区到磁盘

### newline 处理

\`open()\` 的 \`newline\` 参数控制换行符转换：
- \`newline=None\`（默认）：读时把 \`\\r\\n\`、\`\\r\` 都转为 \`\\n\`，写时用系统默认
- \`newline=''\`：不转换，原样读写（二进制模式默认）
- \`newline='\\n'\`：只用 \`\\n\`

下面的 demo 演示文件读写的完整流程，包括多种模式、指针操作和缓冲区刷新。`,
    code: `# 文件打开与读写完整演示
import os
import tempfile

print("=" * 50)
print("        文件打开与读写演示")
print("=" * 50)

# 创建临时目录来演示，避免污染真实文件系统
tmp_dir = tempfile.mkdtemp(prefix="py8_file_")

# ============ 1. 写入文件：w 模式 ============
print()
print("=== 1. 写入文件（w 模式）===")
file_path = os.path.join(tmp_dir, "demo.txt")
with open(file_path, "w", encoding="utf-8") as f:
    f.write("第一行内容\\n")
    f.write("第二行内容\\n")
    f.write("第三行，最后一行\\n")
print(f"已写入文件：{file_path}")

# ============ 2. read() 读取全部 ============
print()
print("=== 2. read() 读取全部 ===")
with open(file_path, "r", encoding="utf-8") as f:
    whole = f.read()
print(f"全部内容（{len(whole)}个字符）：")
print(repr(whole))

# ============ 3. read(size) 读指定字符数 ============
print()
print("=== 3. read(size) 按大小读取 ===")
with open(file_path, "r", encoding="utf-8") as f:
    print("第一次读3个字符：", repr(f.read(3)))
    print("第二次读5个字符：", repr(f.read(5)))
    print("剩余全部：", repr(f.read()))

# ============ 4. readline() 逐行读 ============
print()
print("=== 4. readline() 逐行读 ===")
with open(file_path, "r", encoding="utf-8") as f:
    line1 = f.readline()
    line2 = f.readline()
    line3 = f.readline()
    print("第一行：", repr(line1))
    print("第二行：", repr(line2))
    print("第三行：", repr(line3))

# ============ 5. readlines() 一次读所有行 ============
print()
print("=== 5. readlines() 读所有行 ===")
with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()
print(f"共 {len(lines)} 行：")
for i, line in enumerate(lines):
    print(f"  行{i+1}：{repr(line)}")

# ============ 6. for line in f 逐行迭代（推荐） ============
print()
print("=== 6. for line in f 逐行迭代（推荐）===")
with open(file_path, "r", encoding="utf-8") as f:
    for i, line in enumerate(f, 1):
        stripped = line.rstrip("\\n")  # 去掉结尾换行符
        print(f"  行{i}：{stripped}")

# ============ 7. writelines() 批量写入 ============
print()
print("=== 7. writelines() 批量写入 ===")
batch_path = os.path.join(tmp_dir, "batch.txt")
lines_to_write = ["苹果\\n", "香蕉\\n", "橙子\\n"]
with open(batch_path, "w", encoding="utf-8") as f:
    f.writelines(lines_to_write)
print("writelines 写入完成，读取验证：")
with open(batch_path, "r", encoding="utf-8") as f:
    print(f.read())

# ============ 8. a 模式追加 ============
print()
print("=== 8. a 追加模式 ===")
with open(batch_path, "a", encoding="utf-8") as f:
    f.write("追加的内容\\n")
with open(batch_path, "r", encoding="utf-8") as f:
    print(f.read())

# ============ 9. x 模式创建新文件 ============
print()
print("=== 9. x 创建模式 ===")
new_path = os.path.join(tmp_dir, "new.txt")
try:
    with open(new_path, "x", encoding="utf-8") as f:
        f.write("通过 x 模式创建\\n")
    print(f"x 模式创建成功：{new_path}")
except FileExistsError:
    print("文件已存在，x 模式报错")

# ============ 10. seek / tell 指针操作 ============
print()
print("=== 10. seek / tell 指针操作 ===")
with open(file_path, "rb") as f:  # 二进制模式 seek 更精确
    print(f"初始位置 tell() = {f.tell()}")
    data = f.read(6)
    print(f"读6字节后 tell() = {f.tell()}, 内容 = {repr(data)}")
    # seek(0) 回到开头
    f.seek(0)
    print(f"seek(0) 后 tell() = {f.tell()}")
    # seek(0, 2) 跳到末尾
    f.seek(0, 2)
    print(f"seek(0, 2) 跳到末尾 tell() = {f.tell()}")

# ============ 11. flush() 刷新缓冲区 ============
print()
print("=== 11. flush() 刷新缓冲区 ===")
flush_path = os.path.join(tmp_dir, "flush.txt")
with open(flush_path, "w", encoding="utf-8") as f:
    f.write("数据写入缓冲区\\n")
    f.flush()  # 立即刷到磁盘
    print("flush() 已把缓冲区内容刷到磁盘")

# ============ 12. r+ 读写模式 ============
print()
print("=== 12. r+ 读写模式 ===")
rw_path = os.path.join(tmp_dir, "rw.txt")
with open(rw_path, "w", encoding="utf-8") as f:
    f.write("ABCDEFGHIJ\\n")
with open(rw_path, "r+", encoding="utf-8") as f:
    content = f.read()
    print(f"读取内容：{repr(content)}")
    f.seek(0)  # 回到开头
    f.write("1234")  # 从开头覆盖4个字符
    f.seek(0)
    print(f"覆盖后：{repr(f.read())}")

# ============ 13. 二进制读写 b 模式 ============
print()
print("=== 13. 二进制 b 模式读写 ===")
bin_path = os.path.join(tmp_dir, "data.bin")
# 写入二进制数据
with open(bin_path, "wb") as f:
    f.write(bytes([0, 1, 2, 255, 100, 200]))
# 读取二进制数据
with open(bin_path, "rb") as f:
    data = f.read()
print(f"二进制数据：{list(data)}")

# ============ 14. newline 处理 ============
print()
print("=== 14. newline 换行符处理 ===")
nl_path = os.path.join(tmp_dir, "newline.txt")
with open(nl_path, "w", encoding="utf-8", newline="") as f:
    f.write("line1\\r\\nline2\\r\\n")
# 默认 newline=None 会把 \\r\\n 转为 \\n
with open(nl_path, "r", encoding="utf-8") as f:
    print(f"默认 newline=None：{repr(f.read())}")
# newline="" 不转换
with open(nl_path, "r", encoding="utf-8", newline="") as f:
    print(f"newline=''：{repr(f.read())}")

# ============ 15. 编码处理 ============
print()
print("=== 15. 编码处理 ===")
cn_path = os.path.join(tmp_dir, "cn.txt")
with open(cn_path, "w", encoding="utf-8") as f:
    f.write("你好，Python 文件操作！\\n")
    f.write("中文、emoji 🎉 都支持\\n")
with open(cn_path, "r", encoding="utf-8") as f:
    print(f.read())

# 清理临时目录
import shutil
shutil.rmtree(tmp_dir)
print()
print("✅ 文件操作演示完成，临时目录已清理")`
  },
  {
    id: "py8-file-path",
    group: "文件IO与模块",
    icon: "🗺️",
    title: "路径操作 os.path 与 pathlib",
    content: `## 路径操作两大类

Python 提供两套路径操作方案：

| 方案 | 特点 | 风格 |
|------|------|------|
| \`os.path\` | 传统函数式，标准库老牌 | 函数调用 |
| \`pathlib\` | Python 3.4+ 面向对象，现代推荐 | 对象方法 |

### os.path 常用函数

| 函数 | 作用 | 示例 |
|------|------|------|
| \`os.path.join(a, b)\` | 拼接路径 | \`os.path.join("a", "b")\` → \`"a/b"\` |
| \`os.path.split(p)\` | 拆成(目录, 文件名) | \`("a/b", "c.txt")\` |
| \`os.path.basename(p)\` | 取文件名 | \`"c.txt"\` |
| \`os.path.dirname(p)\` | 取目录部分 | \`"a/b"\` |
| \`os.path.exists(p)\` | 路径是否存在 | \`True/False\` |
| \`os.path.isfile(p)\` | 是否是文件 | \`True/False\` |
| \`os.path.isdir(p)\` | 是否是目录 | \`True/False\` |
| \`os.path.abspath(p)\` | 绝对路径 | \`"/home/user/a"\` |
| \`os.path.splitext(p)\` | 拆扩展名 | \`("a/b/c", ".txt")\` |
| \`os.path.getsize(p)\` | 文件大小（字节） | \`1024\` |
| \`os.path.getmtime(p)\` | 最后修改时间戳 | \`1678901234.5\` |

### pathlib.Path 对象操作

\`\`\`python
from pathlib import Path  # 从 pathlib 导入 Path

p = Path("/home/user/data.txt")  # 赋值变量 p

# 属性和方法
p.name          # "data.txt"   文件名
p.stem          # "data"       不带扩展名
p.suffix         # ".txt"       扩展名
p.parent         # Path("/home/user")  父目录
p.parents        # 所有祖先目录的序列
p.parts          # ("/", "home", "user", "data.txt")

# 路径拼接（用 / 运算符）
sub = p / "subdir" / "file.py"   # 太优雅了！

# 遍历
p.glob("*.txt")      # 匹配当前目录
p.rglob("*.py")      # 递归匹配（**/*.py）
p.iterdir()          # 遍历目录内容

# 判断
p.exists(), p.is_file(), p.is_dir()  # 调用 p.exists()：判断是否存在

# 操作
p.mkdir()            # 创建目录
p.read_text()        # 读文本
p.write_text("hi")   # 写文本
p.read_bytes()       # 读二进制
p.stat()             # 获取文件信息
\`\`\`

### os.path vs pathlib 对比

\`\`\`python
# os.path 函数式
import os  # 导入模块 os
path = os.path.join("a", "b", "c.txt")  # 赋值变量 path
name = os.path.basename(path)  # 赋值变量 name

# pathlib 面向对象
from pathlib import Path  # 从 pathlib 导入 Path
path = Path("a") / "b" / "c.txt"  # 赋值变量 path
name = path.name  # 赋值变量 name
\`\`\`

**推荐新代码使用 pathlib**，更直观、更安全。但 os.path 在很多老代码中仍广泛使用，需要了解。

下面的 demo 用 os.path 和 pathlib 两种方式演示路径操作，方便对比学习。`,
    code: `# 路径操作 os.path 与 pathlib 完整对比
import os
import os.path
from pathlib import Path
import tempfile
import time

print("=" * 50)
print("   路径操作 os.path 与 pathlib 对比")
print("=" * 50)

# 创建临时目录和文件供演示
tmp_dir = tempfile.mkdtemp(prefix="py8_path_")
Path(tmp_dir, "data.txt").write_text("Hello Pathlib!")
Path(tmp_dir, "subdir").mkdir(exist_ok=True)
Path(tmp_dir, "subdir", "script.py").write_text("print('hello')")
Path(tmp_dir, "subdir", "test.js").write_text("console.log('hi')")

base = tmp_dir
file_path = Path(base) / "data.txt"

# ============ 1. 路径拼接 ============
print("=== 1. 路径拼接 ===")
# os.path 方式
osp_joined = os.path.join(base, "subdir", "script.py")
print(f"os.path.join：{osp_joined}")

# pathlib 方式
pl_joined = Path(base) / "subdir" / "script.py"
print(f"pathlib / 拼接：{pl_joined}")

# ============ 2. 路径拆分 ============
print()
print("=== 2. 路径拆分 ===")
# os.path
osp_dir, osp_file = os.path.split(osp_joined)
print(f"os.path.split：目录={osp_dir}  文件名={osp_file}")

# pathlib
pl_path = Path(osp_joined)
print(f"pathlib.parent：{pl_path.parent}")
print(f"pathlib.name：{pl_path.name}")

# ============ 3. 文件名与扩展名 ============
print()
print("=== 3. 文件名与扩展名 ===")
# os.path
print(f"os.path.basename：{os.path.basename(osp_joined)}")
print(f"os.path.dirname：{os.path.dirname(osp_joined)}")
root, ext = os.path.splitext(osp_joined)
print(f"os.path.splitext：主体={root}  扩展名={ext}")

# pathlib
print(f"pathlib.stem：{pl_path.stem}")
print(f"pathlib.suffix：{pl_path.suffix}")
print(f"pathlib.suffixes：{pl_path.suffixes}")  # 多级扩展名
print(f"pathlib.parts：{pl_path.parts}")

# ============ 4. 路径判断 ============
print()
print("=== 4. 路径判断 ===")
p = Path(base) / "data.txt"
# os.path
print(f"os.path.exists：{os.path.exists(str(p))}")
print(f"os.path.isfile：{os.path.isfile(str(p))}")
print(f"os.path.isdir：{os.path.isdir(str(p))}")

# pathlib
print(f"pathlib.exists()：{p.exists()}")
print(f"pathlib.is_file()：{p.is_file()}")
print(f"pathlib.is_dir()：{p.is_dir()}")
print(f"pathlib.is_absolute()：{p.is_absolute()}")

# ============ 5. 文件信息 ============
print()
print("=== 5. 文件信息 ===")
# os.path
size = os.path.getsize(str(p))
mtime = os.path.getmtime(str(p))
print(f"os.path.getsize：{size} 字节")
print(f"os.path.getmtime：{time.ctime(mtime)}")

# pathlib
stat = p.stat()
print(f"pathlib.stat().st_size：{stat.st_size} 字节")
print(f"pathlib.stat().st_mtime：{time.ctime(stat.st_mtime)}")

# ============ 6. 绝对路径与规范化 ============
print()
print("=== 6. 绝对路径与规范化 ===")
# os.path
print(f"os.path.abspath('.')：{os.path.abspath('.')}")
print(f"os.path.normpath('a/./b/../c')：{os.path.normpath('a/./b/../c')}")

# pathlib
print(f"pathlib.resolve()：{Path('.').resolve()}")
print(f"pathlib.cwd()：{Path.cwd()}")

# 模拟一个不规范路径
messy = Path("a/./b/../c/d.txt")
print(f"不规范路径：{messy}")
print(f"规范化后：{messy.resolve()}")

# ============ 7. glob 文件匹配 ============
print()
print("=== 7. glob 文件匹配 ===")
# os.path 没有 glob，只能配合 glob 模块
import glob as glob_mod
pattern = os.path.join(base, "subdir", "*.py")
print(f"glob 模块匹配 {pattern}：")
for f in glob_mod.glob(pattern):
    print(f"  {f}")

# pathlib 内置 glob
print(f"pathlib.glob('*.py')：")
subdir = Path(base) / "subdir"
for f in subdir.glob("*.py"):
    print(f"  {f}")

print(f"pathlib.rglob('*.py') 递归：")
for f in Path(base).rglob("*.py"):
    print(f"  {f}")

# ============ 8. iterdir 遍历目录 ============
print()
print("=== 8. iterdir 遍历目录 ===")
print(f"遍历 {base}：")
for item in Path(base).iterdir():
    typ = "目录" if item.is_dir() else "文件"
    print(f"  {typ}：{item.name}")

# ============ 9. pathlib 读写快捷方法 ============
print()
print("=== 9. pathlib 读写快捷方法 ===")
test_path = Path(base) / "quick.txt"
# 写文本
test_path.write_text("通过 pathlib 写入的内容\\n第二行")
print(f"write_text 写入：{test_path}")
# 读文本
content = test_path.read_text()
print(f"read_text 读取：{repr(content)}")
# 写二进制
bin_path = Path(base) / "quick.bin"
bin_path.write_bytes(b"\\x00\\x01\\x02")
print(f"write_bytes 写入二进制：{bin_path}")
# 读二进制
data = bin_path.read_bytes()
print(f"read_bytes 读取二进制：{list(data)}")

# ============ 10. home / cwd 等 ============
print()
print("=== 10. 常用路径 ===")
print(f"Path.home()：{Path.home()}")
print(f"Path.cwd()：{Path.cwd()}")
print(f"Path(__file__)：{Path(__file__)}")

# 清理
import shutil
shutil.rmtree(tmp_dir)
print()
print("✅ 路径操作演示完成，临时目录已清理")`
  },
  {
    id: "py8-file-dir",
    group: "文件IO与模块",
    icon: "📁",
    title: "目录操作与文件遍历",
    content: `## 目录操作

Python 通过 \`os\` 和 \`shutil\` 模块进行目录和文件的高级操作。

### 创建和删除目录

| 函数 | 作用 |
|------|------|
| \`os.mkdir(path)\` | 创建单层目录（父目录必须存在） |
| \`os.makedirs(path)\` | 递归创建多层目录（\`exist_ok=True\` 避免报错） |
| \`os.rmdir(path)\` | 删除空目录（目录必须为空） |
| \`os.removedirs(path)\` | 递归删除空目录 |
| \`shutil.rmtree(path)\` | 删除整个目录树（包括非空目录） |

### 文件遍历

| 方法 | 特点 | 适用场景 |
|------|------|----------|
| \`os.listdir(path)\` | 返回文件名列表，一层 | 简单遍历 |
| \`os.scandir(path)\` | 返回 DirEntry 迭代器，高效 | 需判断文件/目录 |
| \`os.walk(path)\` | 递归遍历所有子目录 | 全文搜索 |
| \`glob.glob(pattern)\` | 通配符匹配文件 | 按模式查找 |
| \`pathlib.Path.glob()\` | 面向对象 glob | 新代码推荐 |

### os.walk 详解

\`os.walk(top)\` 返回三元组 \`(dirpath, dirnames, filenames)\`：

\`\`\`python
import os
for root, dirs, files in os.walk("/path"):  # 遍历 os.walk("/path")，取值给 root, dirs, files
    for f in files:  # 遍历 files，取值给 f
        print(os.path.join(root, f))  # 每个文件的完整路径
\`\`\`

### shutil 高级文件操作

| 函数 | 作用 |
|------|------|
| \`shutil.copy(src, dst)\` | 复制文件（保留权限） |
| \`shutil.copy2(src, dst)\` | 复制文件（保留元数据） |
| \`shutil.move(src, dst)\` | 移动文件/目录 |
| \`shutil.copytree(src, dst)\` | 复制整个目录树 |
| \`shutil.rmtree(path)\` | 删除整个目录树 |
| \`shutil.disk_usage(path)\` | 查看磁盘使用情况 |

### tempfile 临时文件

\`\`\`python
import tempfile  # 导入模块 tempfile

# 临时文件（自动删除）
with tempfile.NamedTemporaryFile() as f:  # 使用上下文管理器：tempfile.NamedTemporaryFile() as f
    f.write(b"data")  # 调用 f.write()：写入

# 临时目录
with tempfile.TemporaryDirectory() as d:  # 使用上下文管理器：tempfile.TemporaryDirectory() as d
    pass  # 离开 with 自动删除
\`\`\`

### glob 文件模式匹配

\`\`\`python
import glob  # 导入模块 glob
glob.glob("*.py")          # 当前目录所有 .py
glob.glob("**/*.py", recursive=True)  # 递归所有 .py
glob.glob("[abc]*.txt")    # a/b/c 开头的 txt
glob.glob("?.txt")         # 单字符名的 txt
\`\`\`

下面的 demo 综合演示目录创建、遍历、文件匹配和 shutil 操作。`,
    code: `# 目录操作与文件遍历完整演示
import os
import shutil
import tempfile
import glob as glob_mod
from pathlib import Path

print("=" * 50)
print("     目录操作与文件遍历演示")
print("=" * 50)

# 创建临时目录结构
tmp = tempfile.mkdtemp(prefix="py8_dir_")
print(f"临时目录：{tmp}")

# ============ 1. 创建目录结构 ============
print()
print("=== 1. 创建目录结构 ===")
# os.mkdir 创建单层
os.mkdir(os.path.join(tmp, "level1"))
print("os.mkdir level1 完成")

# os.makedirs 递归创建多层
os.makedirs(os.path.join(tmp, "level1", "level2", "level3"), exist_ok=True)
print("os.makedirs level1/level2/level3 完成")

# 创建几个测试文件
for i in range(1, 4):
    Path(tmp, "level1", f"file{i}.txt").write_text(f"文件{i}的内容")
Path(tmp, "level1", "level2", "data.json").write_text('{"key": "value"}')
Path(tmp, "level1", "level2", "level3", "deep.py").write_text("print('deep')")

# ============ 2. os.listdir 列出目录 ============
print()
print("=== 2. os.listdir 列出目录 ===")
items = os.listdir(os.path.join(tmp, "level1"))
print(f"level1 内容：{items}")

# ============ 3. os.scandir 高效遍历 ============
print()
print("=== 3. os.scandir 高效遍历（带类型判断）===")
with os.scandir(os.path.join(tmp, "level1")) as entries:
    for entry in entries:
        typ = "DIR " if entry.is_dir() else "FILE"
        size = entry.stat().st_size if entry.is_file() else 0
        print(f"  {typ}  {entry.name:20}  {size} B")

# ============ 4. os.walk 递归遍历 ============
print()
print("=== 4. os.walk 递归遍历 ===")
for root, dirs, files in os.walk(tmp):
    level = root.replace(tmp, "").count(os.sep)
    indent = "  " * level
    dir_name = os.path.basename(root) or os.path.basename(tmp)
    print(f"{indent}[{dir_name}]/")
    for f in files:
        print(f"{indent}  - {f}")

# ============ 5. glob 文件匹配 ============
print()
print("=== 5. glob 文件匹配 ===")
# 匹配所有 .txt
txt_files = glob_mod.glob(os.path.join(tmp, "**", "*.txt"), recursive=True)
print(f"所有 .txt 文件（{len(txt_files)}个）：")
for f in txt_files:
    print(f"  {os.path.relpath(f, tmp)}")

# 匹配所有 .py
py_files = glob_mod.glob(os.path.join(tmp, "**", "*.py"), recursive=True)
print(f"所有 .py 文件（{len(py_files)}个）：")
for f in py_files:
    print(f"  {os.path.relpath(f, tmp)}")

# ============ 6. shutil.copy 复制文件 ============
print()
print("=== 6. shutil.copy 复制文件 ===")
src = os.path.join(tmp, "level1", "file1.txt")
dst = os.path.join(tmp, "level1", "file1_copy.txt")
shutil.copy(src, dst)
print(f"复制：{os.path.basename(src)} -> {os.path.basename(dst)}")
print(f"目标存在：{os.path.exists(dst)}")

# ============ 7. shutil.move 移动文件 ============
print()
print("=== 7. shutil.move 移动文件 ===")
src_move = os.path.join(tmp, "level1", "file2.txt")
dst_move = os.path.join(tmp, "level1", "level2", "file2.txt")
shutil.move(src_move, dst_move)
print(f"移动：file2.txt -> level2/file2.txt")
print(f"原位置存在：{os.path.exists(src_move)}")
print(f"新位置存在：{os.path.exists(dst_move)}")

# ============ 8. shutil.copytree 复制目录树 ============
print()
print("=== 8. shutil.copytree 复制目录树 ===")
src_tree = os.path.join(tmp, "level1", "level2")
dst_tree = os.path.join(tmp, "level2_backup")
shutil.copytree(src_tree, dst_tree)
print(f"复制目录树：level2 -> level2_backup")
print(f"备份目录内容：{os.listdir(dst_tree)}")

# ============ 9. shutil.rmtree 删除目录树 ============
print()
print("=== 9. shutil.rmtree 删除目录树 ===")
to_remove = os.path.join(tmp, "level2_backup")
shutil.rmtree(to_remove)
print(f"rmtree {to_remove}")
print(f"已删除：{not os.path.exists(to_remove)}")

# ============ 10. os.rmdir / os.removedirs ============
print()
print("=== 10. os.rmdir 删除空目录 ===")
empty_dir = os.path.join(tmp, "empty_folder")
os.mkdir(empty_dir)
print(f"创建空目录：{empty_dir}")
os.rmdir(empty_dir)
print(f"os.rmdir 删除：{not os.path.exists(empty_dir)}")

# ============ 11. tempfile 临时文件 ============
print()
print("=== 11. tempfile 临时文件 ===")
# NamedTemporaryFile
with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False, encoding="utf-8") as tf:
    tf.write("临时文件内容")
    temp_name = tf.name
    print(f"临时文件路径：{temp_name}")
with open(temp_name, "r", encoding="utf-8") as f:
    print(f"读取内容：{f.read()}")
os.unlink(temp_name)  # 手动删除

# TemporaryDirectory
with tempfile.TemporaryDirectory() as td:
    temp_file = os.path.join(td, "temp.txt")
    with open(temp_file, "w") as f:
        f.write("临时目录中的文件")
    print(f"临时目录：{td}")
    print(f"目录内容：{os.listdir(td)}")
print(f"临时目录已自动删除：{not os.path.exists(td)}")

# ============ 12. shutil.disk_usage 磁盘使用 ============
print()
print("=== 12. shutil.disk_usage 磁盘使用 ===")
usage = shutil.disk_usage(tmp)
print(f"总空间：{usage.total / 1024**3:.1f} GB")
print(f"已使用：{usage.used / 1024**3:.1f} GB")
print(f"可用：{usage.free / 1024**3:.1f} GB")

# 清理
shutil.rmtree(tmp)
print()
print("✅ 目录操作演示完成，所有临时文件已清理")`
  },
  {
    id: "py8-json",
    group: "文件IO与模块",
    icon: "📄",
    title: "JSON 数据处理",
    content: `## JSON 基础

JSON（JavaScript Object Notation）是最通用的数据交换格式，**几乎所有的 Web API 都用 JSON**。

### Python JSON 类型映射

| JSON 类型 | Python 类型 |
|-----------|-------------|
| object | dict |
| array | list |
| string | str |
| number (int) | int |
| number (real) | float |
| true | True |
| false | False |
| null | None |

### 核心函数

| 函数 | 作用 |
|------|------|
| \`json.dumps(obj)\` | Python 对象 → JSON 字符串 |
| \`json.dump(obj, f)\` | Python 对象 → JSON 文件 |
| \`json.loads(s)\` | JSON 字符串 → Python 对象 |
| \`json.load(f)\` | JSON 文件 → Python 对象 |

### 常用参数

\`\`\`python
json.dumps(obj, indent=2, ensure_ascii=False, sort_keys=True)  # 调用 json.dumps()
\`\`\`

| 参数 | 作用 |
|------|------|
| \`indent\` | 缩进美化（None 压缩，2/4 缩进） |
| \`ensure_ascii\` | \`False\` 保留中文，\`True\`（默认）转义 |
| \`sort_keys\` | 按键排序 |
| \`separators\` | 分隔符，\`(',', ':')\` 压缩 |
| \`default\` | 自定义序列化函数（处理非标准类型） |
| \`object_hook\` | 自定义反序列化函数 |

### 自定义序列化 default

当遇到 \`datetime\`、\`Decimal\` 等 JSON 不支持的类型时：

\`\`\`python
import json  # 导入模块 json
from datetime import datetime  # 从 datetime 导入 datetime

def custom_encoder(obj):  # 定义函数 custom_encoder，参数：obj
    if isinstance(obj, datetime):  # 如果 isinstance(obj, datetime)
        return obj.isoformat()  # 返回 obj.isoformat()
    raise TypeError(f"无法序列化 {type(obj)}")  # 抛出异常：TypeError(f"无法序列化 {type(obj)}")

json.dumps({"time": datetime.now()}, default=custom_encoder)  # 调用 json.dumps()
\`\`\`

### 自定义反序列化 object_hook

\`\`\`python
import json
def as_person(d):  # 定义函数 as_person，参数：d
    if "name" in d and "age" in d:  # 如果 "name" in d and "age" in d
        return Person(d["name"], d["age"])  # 返回 Person(d["name"], d["age"])
    return d  # 返回 d

json.loads(s, object_hook=as_person)  # 调用 json.loads()
\`\`\`

### JSON Schema 简介

JSON Schema 用于**验证 JSON 数据结构**，描述字段类型、是否必填等：

\`\`\`json
{
  "type": "object",
  "properties": {
    "name": {"type": "string"},
    "age": {"type": "integer", "minimum": 0}
  },
  "required": ["name"]
}
\`\`\`

下面的 demo 演示 JSON 序列化、反序列化、中文处理、自定义编码器和文件读写。`,
    code: `# JSON 数据处理完整演示
import json
import os
import tempfile
from datetime import datetime, date

print("=" * 50)
print("         JSON 数据处理演示")
print("=" * 50)

# ============ 1. 基本序列化 dumps ============
print("=== 1. 基本序列化 json.dumps ===")
data = {
    "name": "小明",
    "age": 25,
    "scores": [90, 85, 95],
    "is_student": True,
    "address": None,
}
# 默认：紧凑格式，中文转义
compact = json.dumps(data)
print(f"紧凑格式：{compact}")

# indent 缩进美化
pretty = json.dumps(data, indent=2, ensure_ascii=False)
print(f"缩进美化：\\n{pretty}")

# sort_keys 排序
sorted_json = json.dumps(data, indent=2, ensure_ascii=False, sort_keys=True)
print(f"按键排序：\\n{sorted_json}")

# ============ 2. 基本反序列化 loads ============
print()
print("=== 2. 基本反序列化 json.loads ===")
json_str = '{"name": "小红", "age": 30, "hobbies": ["读书", "跑步"]}'
obj = json.loads(json_str)
print(f"原始JSON：{json_str}")
print(f"解析结果：{obj}")
print(f"name={obj['name']}, age={obj['age']}, hobbies={obj['hobbies']}")

# ============ 3. JSON 类型对照 ============
print()
print("=== 3. JSON 与 Python 类型对照 ===")
type_data = {
    "string": "hello",
    "integer": 42,
    "float": 3.14,
    "boolean_true": True,
    "boolean_false": False,
    "null_value": None,
    "array": [1, "a", True, None],
    "nested": {"inner": "value"},
}
json_text = json.dumps(type_data, indent=2, ensure_ascii=False)
print(json_text)
parsed = json.loads(json_text)
for k, v in parsed.items():
    print(f"  {k:15} -> {type(v).__name__:8} = {v}")

# ============ 4. ensure_ascii 中文处理 ============
print()
print("=== 4. ensure_ascii 中文处理 ===")
cn = {"消息": "你好世界", "emoji": "😊🎉"}
# 默认 ensure_ascii=True：中文转义
ascii_ver = json.dumps(cn)
print(f"ensure_ascii=True：{ascii_ver}")
# ensure_ascii=False：保留中文
cn_ver = json.dumps(cn, ensure_ascii=False)
print(f"ensure_ascii=False：{cn_ver}")
# 两者都能正确还原
print(f"还原True：{json.loads(ascii_ver)}")
print(f"还原False：{json.loads(cn_ver)}")

# ============ 5. separators 压缩 ============
print()
print("=== 5. separators 压缩输出 ===")
big = {"items": list(range(5))}
normal = json.dumps(big)
compressed = json.dumps(big, separators=(",", ":"))
print(f"普通：{normal}")
print(f"压缩：{compressed}")
print(f"普通 {len(normal)} 字符，压缩 {len(compressed)} 字符")

# ============ 6. default 自定义序列化 ============
print()
print("=== 6. default 自定义序列化 ===")
def custom_serializer(obj):
    """处理 JSON 不支持的类型"""
    if isinstance(obj, datetime):
        return obj.strftime("%Y-%m-%d %H:%M:%S")
    if isinstance(obj, date):
        return obj.isoformat()
    if isinstance(obj, set):
        return list(obj)
    raise TypeError(f"类型 {type(obj)} 不支持序列化")

complex_data = {
    "created_at": datetime(2024, 6, 30, 14, 30, 0),
    "birthday": date(2020, 1, 1),
    "tags": {"Python", "JSON", "教程"},
    "name": "测试",
}
json_result = json.dumps(complex_data, default=custom_serializer,
                          ensure_ascii=False, indent=2)
print(json_result)

# ============ 7. object_hook 自定义反序列化 ============
print()
print("=== 7. object_hook 自定义反序列化 ===")
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def __repr__(self):
        return f"Person(name='{self.name}', age={self.age})"

def person_hook(d):
    """如果字典有 name 和 age，就转成 Person 对象"""
    if "name" in d and "age" in d:
        return Person(d["name"], d["age"])
    return d

people_json = '[{"name": "张三", "age": 20}, {"name": "李四", "age": 25}]'
people = json.loads(people_json, object_hook=person_hook)
print(f"原始JSON：{people_json}")
print(f"反序列化结果：{people}")
for p in people:
    print(f"  {p}")

# ============ 8. JSON 文件读写 dump/load ============
print()
print("=== 8. JSON 文件读写 dump/load ===")
tmp_dir = tempfile.mkdtemp(prefix="py8_json_")
file_path = os.path.join(tmp_dir, "data.json")

# 写入文件
save_data = {
    "title": "Python 学习笔记",
    "chapters": [
        {"id": 1, "name": "文件操作", "done": True},
        {"id": 2, "name": "JSON 处理", "done": True},
        {"id": 3, "name": "路径操作", "done": False},
    ],
    "author": "小明",
    "version": 1.0,
}
with open(file_path, "w", encoding="utf-8") as f:
    json.dump(save_data, f, indent=2, ensure_ascii=False)
print(f"已写入文件：{file_path}")

# 读取文件
with open(file_path, "r", encoding="utf-8") as f:
    loaded = json.load(f)
print(f"读取文件成功：")
print(f"  标题：{loaded['title']}")
print(f"  作者：{loaded['author']}")
print(f"  章节数：{len(loaded['chapters'])}")
for ch in loaded["chapters"]:
    status = "✅" if ch["done"] else "⬜"
    print(f"    {status} {ch['name']}")

# ============ 9. JSON Schema 验证模拟 ============
print()
print("=== 9. JSON Schema 验证模拟 ===")
# 模拟 JSON Schema 验证逻辑
def validate_person(data):
    """简单验证 JSON 数据是否符合 person schema"""
    errors = []
    if not isinstance(data, dict):
        errors.append("根对象必须是字典")
        return errors
    if "name" not in data:
        errors.append("缺少必填字段 name")
    elif not isinstance(data["name"], str):
        errors.append("name 必须是字符串")
    if "age" in data and not isinstance(data["age"], int):
        errors.append("age 必须是整数")
    return errors

# 验证合法数据
valid = {"name": "小明", "age": 25}
errs = validate_person(valid)
print(f"验证 {valid}：{'✅ 通过' if not errs else '❌ ' + str(errs)}")

# 验证非法数据
invalid = {"name": 123, "age": "不是数字"}
errs = validate_person(invalid)
print(f"验证 {invalid}：{'✅ 通过' if not errs else '❌ ' + str(errs)}")

# ============ 10. pretty print 对比 ============
print()
print("=== 10. 各种输出格式对比 ===")
demo = {"a": 1, "b": [1, 2, 3], "c": {"deep": "value"}}
print(f"无缩进：{json.dumps(demo)}")
print(f"indent=2：\\n{json.dumps(demo, indent=2)}")
print(f"indent=4：\\n{json.dumps(demo, indent=4)}")
print(f"压缩：{json.dumps(demo, separators=(',', ':'))}")

# 清理
import shutil
shutil.rmtree(tmp_dir)
print()
print("✅ JSON 数据处理演示完成")`
  },
  {
    id: "py8-csv",
    group: "文件IO与模块",
    icon: "📊",
    title: "CSV 表格处理",
    content: `## CSV 简介

CSV（Comma-Separated Values）是表格数据的纯文本格式，**Excel、数据库、数据分析工具都支持**。

### csv 模块核心组件

| 组件 | 作用 |
|------|------|
| \`csv.reader\` | 逐行读取 CSV，返回列表 |
| \`csv.writer\` | 逐行写入 CSV |
| \`csv.DictReader\` | 读 CSV，每行是字典（推荐） |
| \`csv.DictWriter\` | 写 CSV，用字典写入（推荐） |
| \`csv.Sniffer\` | 自动嗅探 CSV 格式 |

### 关键参数

\`\`\`python
import csv
csv.reader(f, delimiter=',', quotechar='"')  # 调用 csv.reader()
csv.writer(f, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)  # 调用 csv.writer()
\`\`\`

| 参数 | 说明 |
|------|------|
| \`delimiter\` | 分隔符，默认逗号 |
| \`quotechar\` | 引号字符，默认双引号 |
| \`quoting\` | 引用模式 |
| \`lineterminator\` | 行终止符 |

### quoting 引用模式

| 常量 | 说明 |
|------|------|
| \`QUOTE_MINIMAL\` | 只在必要时引用（默认） |
| \`QUOTE_ALL\` | 全部字段都引用 |
| \`QUOTE_NONNUMERIC\` | 非数字字段引用 |
| \`QUOTE_NONE\` | 不引用 |

### DictReader / DictWriter 字典式

\`\`\`python
# 读取（自动用第一行作为列名）
with open("data.csv") as f:  # 使用上下文管理器：open("data.csv") as f
    reader = csv.DictReader(f)  # 赋值变量 reader
    for row in reader:  # 遍历 reader，取值给 row
        print(row["name"], row["age"])  # 打印输出到屏幕

# 写入
with open("out.csv", "w", newline="") as f:  # 使用上下文管理器：open("out.csv", "w", newline="") as f
    writer = csv.DictWriter(f, fieldnames=["name", "age"])  # 赋值变量 writer
    writer.writeheader()  # 调用 writer.writeheader()
    writer.writerow({"name": "小明", "age": 18})  # 调用 writer.writerow()
\`\`\`

### Sniffer 嗅探格式

\`\`\`python
import csv
dialect = csv.Sniffer().sniff(sample_text)  # 赋值变量 dialect
# 自动检测分隔符、引号等
\`\`\`

### 处理中文 CSV

\`\`\`python
with open("data.csv", "r", encoding="utf-8-sig") as f:  # 使用上下文管理器：open("data.csv", "r", encoding="utf-8-sig") as f
    # utf-8-sig 去掉 BOM 头（Excel 导出的 CSV 常有）
\`\`\`

### 与 Excel 兼容

- 写入时加 \`newline=''\` 避免多余空行
- 编码用 \`utf-8-sig\`（带 BOM 让 Excel 正确识别中文）
- 分隔符 \`','\` 对中文 Excel 可能不友好，可用 \`'\\t'\`（TSV）

下面的 demo 演示 CSV 读写、字典式操作、格式嗅探和中文处理。`,
    code: `# CSV 表格处理完整演示
import csv
import os
import tempfile
import io

print("=" * 50)
print("         CSV 表格处理演示")
print("=" * 50)

tmp_dir = tempfile.mkdtemp(prefix="py8_csv_")

# ============ 1. csv.writer 写入 CSV ============
print("=== 1. csv.writer 写入 CSV ===")
file1 = os.path.join(tmp_dir, "students.csv")
with open(file1, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    # 写入表头
    writer.writerow(["姓名", "年龄", "成绩", "班级"])
    # 写入数据行
    writer.writerow(["小明", 18, 95.5, "一班"])
    writer.writerow(["小红", 17, 88.0, "二班"])
    writer.writerow(["小刚", 19, 76.5, "一班"])
    # writerows 批量写入
    writer.writerows([
        ["小丽", 18, 92.0, "三班"],
        ["小强", 17, 85.5, "二班"],
    ])
print(f"已写入：{file1}")

# ============ 2. csv.reader 读取 CSV ============
print()
print("=== 2. csv.reader 读取 CSV ===")
with open(file1, "r", encoding="utf-8") as f:
    reader = csv.reader(f)
    for i, row in enumerate(reader):
        print(f"  行{i}：{row}")

# ============ 3. csv.DictWriter 字典式写入 ============
print()
print("=== 3. csv.DictWriter 字典式写入 ===")
file2 = os.path.join(tmp_dir, "products.csv")
fieldnames = ["id", "name", "price", "stock"]
with open(file2, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()  # 写入表头
    writer.writerow({"id": 1, "name": "Python书", "price": 59.9, "stock": 100})
    writer.writerow({"id": 2, "name": "键盘", "price": 299.0, "stock": 50})
    writer.writerow({"id": 3, "name": "鼠标", "price": 129.0, "stock": 200})
    writer.writerows([
        {"id": 4, "name": "显示器", "price": 1599.0, "stock": 30},
        {"id": 5, "name": "耳机", "price": 399.0, "stock": 80},
    ])
print(f"已写入：{file2}")

# ============ 4. csv.DictReader 字典式读取 ============
print()
print("=== 4. csv.DictReader 字典式读取 ===")
with open(file2, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    print(f"列名：{reader.fieldnames}")
    print("数据行：")
    for row in reader:
        # 可以直接用列名访问
        print(f"  {row['id']:>2} | {row['name']:6} | ¥{row['price']:>6} | 库存{row['stock']:>3}")

# ============ 5. delimiter 自定义分隔符 ============
print()
print("=== 5. 自定义分隔符 delimiter ===")
# 使用制表符分隔（TSV格式）
file3 = os.path.join(tmp_dir, "data.tsv")
with open(file3, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f, delimiter="\\t")
    writer.writerow(["城市", "人口", "面积"])
    writer.writerow(["北京", 2154, 16410])
    writer.writerow(["上海", 2487, 6340])
print(f"TSV 文件已写入：{file3}")

with open(file3, "r", encoding="utf-8") as f:
    reader = csv.reader(f, delimiter="\\t")
    for row in reader:
        print(f"  {row}")

# 使用分号分隔（欧洲常见）
with open(file3, "r", encoding="utf-8") as f:
    content = f.read()
print(f"\\nTSV 原始内容：\\n{content}")

# ============ 6. quotechar 与 quoting 引用模式 ============
print()
print("=== 6. quotechar 与 quoting 引用模式 ===")
# 创建一个包含逗号和引号的数据
special_data = [
    ["产品", "描述"],
    ["苹果", "新鲜, 多汁, 甜美"],
    ['引用测试', '他说"你好"'],
    ["常规", "普通文本"],
]

file4 = os.path.join(tmp_dir, "quote.csv")
# QUOTE_MINIMAL（默认）：只在需要时引用
with open(file4, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
    writer.writerows(special_data)
print("QUOTE_MINIMAL（默认）：")
with open(file4, "r", encoding="utf-8") as f:
    print(f.read())

# QUOTE_ALL：全部引用
with open(file4, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f, quoting=csv.QUOTE_ALL)
    writer.writerows(special_data)
print("QUOTE_ALL（全部引用）：")
with open(file4, "r", encoding="utf-8") as f:
    print(f.read())

# QUOTE_NONNUMERIC：非数字引用
with open(file4, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f, quoting=csv.QUOTE_NONNUMERIC)
    writer.writerows(special_data)
print("QUOTE_NONNUMERIC（非数字引用）：")
with open(file4, "r", encoding="utf-8") as f:
    print(f.read())

# ============ 7. Sniffer 嗅探格式 ============
print()
print("=== 7. Sniffer 嗅探格式 ===")
sample = "姓名,年龄,成绩\\n小明,18,95.5\\n小红,17,88.0\\n"
sniffer = csv.Sniffer()
# 检测是否有表头
has_header = sniffer.has_header(sample)
print(f"Sample 检测：有表头？{has_header}")

# 检测分隔符和格式
dialect = sniffer.sniff(sample)
print(f"检测到的分隔符：'{dialect.delimiter}'")
print(f"检测到的引号符：'{dialect.quotechar}'")

# 用 Sniffer 检测 TSV
tsv_sample = "城市\\t人口\\t面积\\n北京\\t2154\\t16410\\n"
tsv_dialect = sniffer.sniff(tsv_sample)
print(f"TSV 检测到的分隔符：'{tsv_dialect.delimiter}'")

# ============ 8. 中文 CSV 处理 ============
print()
print("=== 8. 中文 CSV 处理 ===")
file5 = os.path.join(tmp_dir, "cn_data.csv")
with open(file5, "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.writer(f)
    writer.writerow(["序号", "姓名", "部门", "薪资"])
    writer.writerow([1, "张三", "技术部", 15000])
    writer.writerow([2, "李四", "市场部", 12000])
    writer.writerow([3, "王五", "人事部", 11000])
print(f"中文 CSV 已写入（utf-8-sig）：{file5}")

with open(file5, "r", encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)
    print("读取中文 CSV：")
    total_salary = 0
    count = 0
    for row in reader:
        salary = int(row["薪资"])
        total_salary += salary
        count += 1
        print(f"  {row['序号']} | {row['姓名']} | {row['部门']} | ¥{salary}")
    print(f"  共 {count} 人，平均薪资 ¥{total_salary / count:.0f}")

# ============ 9. 用 StringIO 模拟内存 CSV 操作 ============
print()
print("=== 9. 内存 CSV 操作（StringIO）===")
csv_buffer = io.StringIO()
writer = csv.writer(csv_buffer)
writer.writerow(["A", "B", "C"])
writer.writerow([1, 2, 3])
writer.writerow([4, 5, 6])
csv_buffer.seek(0)
reader = csv.reader(csv_buffer)
for row in reader:
    print(f"  {row}")

# ============ 10. 处理不规则 CSV ============
print()
print("=== 10. 处理不规则 CSV ===")
# 有些 CSV 行数不一致
irregular = io.StringIO("a,b,c\\n1,2\\n4,5,6,7\\n")
reader = csv.reader(irregular)
for i, row in enumerate(reader):
    print(f"  行{i}（{len(row)}列）：{row}")

# 清理
import shutil
shutil.rmtree(tmp_dir)
print()
print("✅ CSV 表格处理演示完成")`
  },
  {
    id: "py8-pickle",
    group: "文件IO与模块",
    icon: "🥒",
    title: "pickle 序列化",
    content: `## pickle 简介

pickle 是 Python 独有的序列化方案，可以序列化**几乎任何 Python 对象**（函数、类、自定义对象等），而 JSON 只能序列化基础类型。

### 核心函数

| 函数 | 作用 |
|------|------|
| \`pickle.dump(obj, f)\` | 对象 → 文件 |
| \`pickle.dumps(obj)\` | 对象 → 字节串 |
| \`pickle.load(f)\` | 文件 → 对象 |
| \`pickle.loads(data)\` | 字节串 → 对象 |

### protocol 版本

\`\`\`python
pickle.dump(obj, f, protocol=pickle.HIGHEST_PROTOCOL)  # 调用 pickle.dump()
\`\`\`

| 协议 | Python 版本 | 特点 |
|------|-------------|------|
| 0 | 全部 | ASCII 文本，可读 |
| 1 | 全部 | 旧二进制 |
| 2 | 2.3+ | 更高效的类 |
| 3 | 3.0+ | Python 3 默认 |
| 4 | 3.4+ | 支持大对象 |
| 5 | 3.8+ | 带外数据 |

\`pickle.HIGHEST_PROTOCOL\` 自动选择当前版本最高协议。

### pickle vs JSON

| 对比 | pickle | JSON |
|------|--------|------|
| 支持类型 | 几乎所有 Python 对象 | 基础类型 |
| 可读性 | 二进制，不可读 | 文本，可读 |
| 跨语言 | 仅 Python | 所有语言 |
| 安全性 | **不安全**（代码执行风险） | 安全 |
| 效率 | 高效 | 较慢 |
| 文件大小 | 通常更小 | 通常更大 |

### ⚠️ 安全警告

**绝不要用 pickle 加载不可信来源的数据！** pickle 在反序列化时会执行任意代码，是常见的安全漏洞。

\`\`\`python
import pickle
# 危险！不要这样做
data = pickle.loads(untrusted_data)  # 可能执行恶意代码
\`\`\`

### 可序列化对象

可以 pickle 的类型：
- 基础类型：int, str, list, dict, tuple, set, bool, None
- 函数（顶层定义的）、类
- 自定义对象（含 \`__dict__\`）

不可以 pickle 的：
- 文件对象、网络连接、线程锁
- lambda 匿名函数
- 生成器对象

### __getstate__ / __setstate__

控制对象的序列化行为：

\`\`\`python
class MyClass:  # 定义类 MyClass
    def __getstate__(self):  # 定义函数 __getstate__，参数：self
        # 返回要序列化的状态
        return self.__dict__.copy()  # 返回 self.__dict__.copy()

    def __setstate__(self, state):  # 定义函数 __setstate__，参数：self, state
        # 从状态恢复对象
        self.__dict__.update(state)  # 执行操作
\`\`\`

下面的 demo 演示 pickle 序列化、安全警告、协议版本对比和自定义序列化控制。`,
    code: `# pickle 序列化完整演示
import pickle
import os
import tempfile

print("=" * 50)
print("        pickle 序列化演示")
print("=" * 50)

tmp_dir = tempfile.mkdtemp(prefix="py8_pickle_")

# ============ 1. 基本 dumps/loads ============
print("=== 1. 基本 dumps/loads ===")
data = {
    "name": "小明",
    "age": 25,
    "scores": [90, 85, 95],
    "nested": {"key": [1, 2, 3]},
}
# 序列化（对象 -> 字节）
serialized = pickle.dumps(data)
print(f"原始数据：{data}")
print(f"序列化后（{len(serialized)} 字节）：{serialized[:50]}...")

# 反序列化（字节 -> 对象）
restored = pickle.loads(serialized)
print(f"反序列化：{restored}")
print(f"还原正确：{data == restored}")

# ============ 2. dump/load 文件读写 ============
print()
print("=== 2. dump/load 文件读写 ===")
file_path = os.path.join(tmp_dir, "data.pkl")
my_list = [1, "hello", {"key": "value"}, (1, 2, 3)]

# 写入文件
with open(file_path, "wb") as f:
    pickle.dump(my_list, f)
print(f"已写入 pickle 文件：{file_path}")

# 读取文件
with open(file_path, "rb") as f:
    loaded = pickle.load(f)
print(f"读取结果：{loaded}")
print(f"还原正确：{loaded == my_list}")

# ============ 3. protocol 版本对比 ============
print()
print("=== 3. protocol 版本对比 ===")
data = {"a": 1, "b": [1, 2, 3], "c": "hello"}
for proto in range(pickle.HIGHEST_PROTOCOL + 1):
    try:
        result = pickle.dumps(data, protocol=proto)
        print(f"  protocol={proto}：{len(result)} 字节")
    except (ValueError, pickle.PickleError) as e:
        print(f"  protocol={proto}：不支持 ({e})")
print(f"  HIGHEST_PROTOCOL = {pickle.HIGHEST_PROTOCOL}")

# ============ 4. 序列化自定义对象 ============
print()
print("=== 4. 序列化自定义对象 ===")
class Student:
    def __init__(self, name, age, grades):
        self.name = name
        self.age = age
        self.grades = grades

    def __repr__(self):
        return f"Student(name='{self.name}', age={self.age}, grades={self.grades})"

s1 = Student("小明", 18, [90, 85, 95])
s2 = Student("小红", 17, [88, 92, 79])

# 序列化
s1_bytes = pickle.dumps(s1)
print(f"序列化 Student：{s1}")
print(f"字节数：{len(s1_bytes)}")

# 反序列化
s1_restored = pickle.loads(s1_bytes)
print(f"还原 Student：{s1_restored}")
print(f"还原正确：{s1.name == s1_restored.name and s1.grades == s1_restored.grades}")

# ============ 5. 序列化多个对象 ============
print()
print("=== 5. 序列化多个对象到同一文件 ===")
multi_path = os.path.join(tmp_dir, "multi.pkl")
with open(multi_path, "wb") as f:
    pickle.dump(s1, f)
    pickle.dump(s2, f)
    pickle.dump("独立字符串", f)
    pickle.dump([10, 20, 30], f)

with open(multi_path, "rb") as f:
    print("依次读取：")
    while True:
        try:
            obj = pickle.load(f)
            print(f"  {obj}")
        except EOFError:
            print("  读取完毕")
            break

# ============ 6. __getstate__ / __setstate__ ============
print()
print("=== 6. __getstate__ / __setstate__ 自定义序列化 ===")
class Database:
    """模拟数据库连接——连接对象不能 pickle"""
    def __init__(self, db_name):
        self.db_name = db_name
        self.connection = f"<连接对象: {db_name}>"  # 模拟不可序列化的连接
        self.cache = {}

    def __getstate__(self):
        """返回可序列化的状态（排除连接对象）"""
        state = self.__dict__.copy()
        print("  __getstate__ 被调用：排除 connection")
        state.pop("connection", None)  # 去掉不可序列化的连接
        return state

    def __setstate__(self, state):
        """从状态恢复对象（重建连接）"""
        self.__dict__.update(state)
        self.connection = f"<重建连接: {self.db_name}>"
        print(f"  __setstate__ 被调用：重建连接 {self.connection}")

    def __repr__(self):
        return f"Database(db='{self.db_name}', conn={self.connection}, cache={self.cache})"

db = Database("my_db")
db.cache["key1"] = "value1"
print(f"原始对象：{db}")

db_bytes = pickle.dumps(db)
db_restored = pickle.loads(db_bytes)
print(f"还原对象：{db_restored}")

# ============ 7. 不能序列化的类型 ============
print()
print("=== 7. 不能序列化的类型 ===")
# 文件对象不能 pickle
try:
    with open(file_path, "rb") as f:
        pickle.dumps(f)
except (TypeError, pickle.PickleError) as e:
    print(f"文件对象序列化失败：{type(e).__name__}")

# lambda 不能 pickle
try:
    f = lambda x: x + 1
    pickle.dumps(f)
except (AttributeError, pickle.PickleError) as e:
    print(f"lambda 序列化失败：{type(e).__name__}")

# ============ 8. 安全警告演示 ============
print()
print("=== 8. 安全警告（仅演示概念）===")
print("⚠️  安全警告：绝不要用 pickle.load 加载不可信来源的数据！")
print("   pickle 反序列化时会执行任意代码，可能造成安全漏洞。")
print("   如果需要跨语言或接收外部数据，请使用 JSON 代替。")

# ============ 9. pickle vs JSON 对比 ============
print()
print("=== 9. pickle vs JSON 对比 ===")
import json
test_data = {
    "numbers": list(range(100)),
    "text": "hello" * 20,
    "nested": {str(i): i for i in range(50)},
}
# pickle 序列化
pkl_bytes = pickle.dumps(test_data)
print(f"pickle 大小：{len(pkl_bytes)} 字节")
# JSON 序列化
json_bytes = json.dumps(test_data).encode("utf-8")
print(f"JSON  大小：{len(json_bytes)} 字节")
print(f"pickle 比 JSON 小：{len(pkl_bytes) / len(json_bytes) * 100:.1f}%")

# ============ 10. pickle 存储复杂嵌套结构 ============
print()
print("=== 10. pickle 存储复杂嵌套结构 ===")
complex_data = {
    "users": [
        {"name": "张三", "data": {"score": 95}},
        {"name": "李四", "data": {"score": 88}},
    ],
    "metadata": {"version": "1.0", "tags": ["test", "demo"]},
    "raw": bytes([0, 1, 2, 3]),
}
pkl = pickle.dumps(complex_data, protocol=pickle.HIGHEST_PROTOCOL)
restored = pickle.loads(pkl)
print(f"原始：{complex_data}")
print(f"还原：{restored}")
print(f"完全一致：{complex_data == restored}")

# 清理
import shutil
shutil.rmtree(tmp_dir)
print()
print("✅ pickle 序列化演示完成")`
  },
  {
    id: "py8-xml-html",
    group: "文件IO与模块",
    icon: "🌐",
    title: "XML 与 HTML 解析",
    content: `## XML 解析

XML（可扩展标记语言）是结构化数据的标记语言，配置、API 响应、文档格式中广泛使用。

### xml.etree.ElementTree

Python 标准库中最常用的 XML 解析方案，**轻量、Pythonic**。

\`\`\`python
import xml.etree.ElementTree as ET  # 导入模块 xml.etree.ElementTree
\`\`\`

### 解析 XML 的三种方式

\`\`\`python
# 1. 从字符串解析
root = ET.fromstring(xml_string)  # 赋值变量 root

# 2. 从文件解析
tree = ET.parse("file.xml")  # 赋值变量 tree
root = tree.getroot()  # 赋值变量 root

# 3. 构建 XML
root = ET.Element("root")  # 赋值变量 root
\`\`\`

### Element 核心操作

| 方法/属性 | 作用 |
|-----------|------|
| \`elem.tag\` | 标签名 |
| \`elem.text\` | 文本内容 |
| \`elem.attrib\` | 属性字典 |
| \`elem.find("tag")\` | 查找第一个匹配子元素 |
| \`elem.findall("tag")\` | 查找所有匹配子元素 |
| \`elem.iter("tag")\` | 递归遍历所有匹配元素 |
| \`ET.SubElement(parent, "tag")\` | 创建子元素 |
| \`elem.set("key", "val")\` | 设置属性 |
| \`elem.append(child)\` | 添加子元素 |

### 构建 XML 示例

\`\`\`python
root = ET.Element("users")  # 赋值变量 root
user = ET.SubElement(root, "user", {"id": "1"})  # 赋值变量 user
name = ET.SubElement(user, "name")  # 赋值变量 name
name.text = "小明"  # 执行操作
# 输出：<users><user id="1"><name>小明</name></user></users>
\`\`\`

### HTML 解析

标准库 \`html.parser.HTMLParser\` 提供基础的 HTML 解析能力：

\`\`\`python
from html.parser import HTMLParser  # 从 html.parser 导入 HTMLParser

class MyParser(HTMLParser):  # 定义类 MyParser
    def handle_starttag(self, tag, attrs):  # 定义函数 handle_starttag，参数：self, tag, attrs
        print(f"开始标签: {tag}")  # 打印输出到屏幕
    def handle_data(self, data):  # 定义函数 handle_data，参数：self, data
        print(f"数据: {data}")  # 打印输出到屏幕
\`\`\`

### html 模块工具函数

| 函数 | 作用 |
|------|------|
| \`html.escape(s)\` | HTML 转义（\`<\` → \`&lt;\`） |
| \`html.unescape(s)\` | HTML 反转义 |

### 其他 XML 解析方案

| 方案 | 特点 |
|------|------|
| \`xml.dom.minidom\` | DOM 解析（W3C 标准，较重） |
| \`xml.sax\` | SAX 解析（流式，省内存） |
| \`lxml\`（第三方） | 功能最强，支持 XPath |

一般推荐 ElementTree 入门，需要 XPath 时用 lxml。

下面的 demo 演示 XML 解析、构建、HTML 解析和转义处理。`,
    code: `# XML 与 HTML 解析完整演示
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
import html
import os
import tempfile

print("=" * 50)
print("      XML 与 HTML 解析演示")
print("=" * 50)

tmp_dir = tempfile.mkdtemp(prefix="py8_xml_")

# ============ 1. 从字符串解析 XML ============
print("=== 1. 从字符串解析 XML ===")
xml_string = """<?xml version="1.0" encoding="utf-8"?>
<bookstore>
    <book category="编程">
        <title lang="zh">Python 入门</title>
        <author>张三</author>
        <year>2024</year>
        <price>59.90</price>
    </book>
    <book category="编程">
        <title lang="en">Learning Python</title>
        <author>Mark Lutz</author>
        <year>2023</year>
        <price>89.00</price>
    </book>
    <book category="小说">
        <title lang="zh">三体</title>
        <author>刘慈欣</author>
        <year>2008</year>
        <price>39.00</price>
    </book>
</bookstore>"""

root = ET.fromstring(xml_string)
print(f"根元素标签：{root.tag}")
print(f"根元素属性：{root.attrib}")

# ============ 2. 遍历子元素 findall ============
print()
print("=== 2. findall 遍历子元素 ===")
for book in root.findall("book"):
    title = book.find("title").text
    author = book.find("author").text
    category = book.attrib.get("category", "未知")
    price = book.find("price").text
    print(f"  [{category}] 《{title}》 by {author}  ¥{price}")

# ============ 3. iter 递归遍历 ============
print()
print("=== 3. iter 递归遍历所有 book 元素 ===")
programming_books = []
for book in root.iter("book"):
    cat = book.get("category")
    title = book.findtext("title")  # findtext 直接取文本
    if cat == "编程":
        programming_books.append(title)
print(f"编程类书籍：{programming_books}")

# ============ 4. Element 属性操作 ============
print()
print("=== 4. Element 属性操作 ===")
first_book = root.find("book")
# 获取属性
print(f"第一个 book 的 category：{first_book.get('category')}")
# 获取所有属性
print(f"第一个 book 所有属性：{first_book.attrib}")
# 修改属性
first_book.set("category", "技术")
print(f"修改后：{first_book.attrib}")

# 获取 title 元素的 lang 属性
title_elem = first_book.find("title")
print(f"title 的 lang 属性：{title_elem.get('lang')}")
print(f"title 的 text：{title_elem.text}")

# ============ 5. 构建 XML ============
print()
print("=== 5. 构建 XML ===")
# 创建根元素
users = ET.Element("users")

# 创建子元素
user1 = ET.SubElement(users, "user", {"id": "1", "role": "admin"})
name1 = ET.SubElement(user1, "name")
name1.text = "张三"
email1 = ET.SubElement(user1, "email")
email1.text = "zhangsan@example.com"

user2 = ET.SubElement(users, "user", {"id": "2", "role": "user"})
name2 = ET.SubElement(user2, "name")
name2.text = "李四"
email2 = ET.SubElement(user2, "email")
email2.text = "lisi@example.com"

# 输出 XML
# ET.tostring 序列化
xml_output = ET.tostring(users, encoding="unicode")
print(xml_output)

# 美化输出
ET.indent(users, space="  ")  # Python 3.9+
print(ET.tostring(users, encoding="unicode"))

# ============ 6. XML 文件读写 ============
print()
print("=== 6. XML 文件读写 ===")
file_path = os.path.join(tmp_dir, "data.xml")
# 写入文件
tree = ET.ElementTree(users)
tree.write(file_path, encoding="utf-8", xml_declaration=True)
print(f"XML 文件已写入：{file_path}")

# 读取文件
tree2 = ET.parse(file_path)
root2 = tree2.getroot()
print(f"读取 XML 文件，根元素：{root2.tag}")
for user in root2.findall("user"):
    print(f"  {user.get('id')}: {user.findtext('name')} ({user.findtext('email')})")

# ============ 7. XPath 风格查找 ============
print()
print("=== 7. XPath 风格查找 ===")
# 查找所有 book 下的 title
for title in root.findall(".//title"):
    print(f"  标题：{title.text}")

# 查找 category 为编程的 book
for book in root.findall("./book[@category='编程']"):
    print(f"  编程类：{book.findtext('title')}")

# 查找有 lang 属性的 title
for title in root.findall(".//title[@lang]"):
    print(f"  有 lang 属性的标题：{title.text} (lang={title.get('lang')})")

# ============ 8. HTMLParser 解析 HTML ============
print()
print("=== 8. HTMLParser 解析 HTML ===")
class MyHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.headings = []
        self.in_h1 = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "a" and "href" in attrs_dict:
            self.links.append(attrs_dict["href"])
        if tag in ("h1", "h2", "h3"):
            self.current_heading = tag

    def handle_data(self, data):
        data = data.strip()
        if data and hasattr(self, "current_heading"):
            self.headings.append((self.current_heading, data))
            del self.current_heading

    def handle_endtag(self, tag):
        pass

html_sample = """<html>
<head><title>测试页面</title></head>
<body>
    <h1>Python 教程</h1>
    <p>欢迎学习 Python！</p>
    <h2>链接列表</h2>
    <a href="https://python.org">Python官网</a>
    <a href="https://docs.python.org">Python文档</a>
    <a href="https://pypi.org">PyPI</a>
    <h2>简介</h2>
    <p>Python 是一门简洁优雅的语言。</p>
</body>
</html>"""

parser = MyHTMLParser()
parser.feed(html_sample)
print("提取的链接：")
for link in parser.links:
    print(f"  {link}")
print("提取的标题：")
for level, text in parser.headings:
    print(f"  {level}: {text}")

# ============ 9. html.escape / unescape ============
print()
print("=== 9. html.escape / unescape ===")
raw = '<script>alert("危险")</script>'
escaped = html.escape(raw)
print(f"原始：{raw}")
print(f"转义：{escaped}")
print(f"还原：{html.unescape(escaped)}")

# 常用 HTML 实体
entities = {
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "&": "&amp;",
}
print("常用 HTML 实体对照：")
for char, entity in entities.items():
    print(f"  {repr(char)} -> {entity}")

# ============ 10. 处理命名空间 XML ============
print()
print("=== 10. 处理命名空间 XML ===")
ns_xml = """<root xmlns:ns="http://example.com/ns">
    <ns:item id="1">命名空间项1</ns:item>
    <ns:item id="2">命名空间项2</ns:item>
</root>"""

ns_root = ET.fromstring(ns_xml)
# 带命名空间的查找需要写完整
for item in ns_root.findall(".//{http://example.com/ns}item"):
    print(f"  id={item.get('id')}, text={item.text}")

# ============ 11. xml.dom.minidom 演示 ============
print()
print("=== 11. xml.dom.minidom 演示 ===")
import xml.dom.minidom as minidom
# 用 minidom 美化 XML
dom = minidom.parseString(ET.tostring(users, encoding="unicode"))
pretty_xml = dom.toprettyxml(indent="  ")
print("minidom 美化输出：")
print(pretty_xml)

# 清理
import shutil
shutil.rmtree(tmp_dir)
print("✅ XML 与 HTML 解析演示完成")`
  },
  {
    id: "py8-module",
    group: "文件IO与模块",
    icon: "📦",
    title: "模块与包机制",
    content: `## 模块是什么

每个 \`.py\` 文件就是一个**模块**。模块是 Python 组织代码的基本单位，用 \`import\` 导入。

### import 的几种方式

\`\`\`python
import math                  # 导入整个模块
import math as m             # 导入并起别名
from math import sqrt        # 导入指定函数
from math import sqrt, pi    # 导入多个
from math import *           # 导入全部（不推荐）
from math import sqrt as s   # 导入并重命名
\`\`\`

### 模块搜索路径 sys.path

Python 按以下顺序查找模块：

1. 当前目录（脚本所在目录）
2. \`PYTHONPATH\` 环境变量
3. 标准库目录
4. 第三方库目录（site-packages）

\`\`\`python
import sys  # 导入模块 sys
print(sys.path)  # 查看搜索路径列表
\`\`\`

### __init__.py 包标记

**包**是一组模块的集合，是包含 \`__init__.py\` 的目录。

\`\`\`
my_package/
├── __init__.py       # 包标记（可为空，也可写初始化代码）
├── module_a.py
├── module_b.py
└── sub_package/
    ├── __init__.py
    └── module_c.py
\`\`\`

Python 3.3+ 后 \`__init__.py\` 不是必须的（命名空间包），但**推荐的实践仍建议保留**。

### 相对导入

在包内部，用相对导入引用兄弟模块：

\`\`\`python
# 在 module_a.py 中
from . import module_b          # 同目录的 module_b
from .module_b import my_func   # 从 module_b 导入指定函数
from .. import other_package    # 上级目录
from ..sub_pkg import module_c  # 兄弟包的子模块
\`\`\`

### __all__ 控制导出

当别人 \`from package import *\` 时，\`__all__\` 控制哪些符号被导出：

\`\`\`python
# __init__.py
__all__ = ["func_a", "ClassA"]  # 只有这些被 import * 导入
\`\`\`

### 模块缓存 sys.modules

Python 导入模块后会缓存，**重复 import 不会重新执行**：

\`\`\`python
import sys  # 导入模块 sys
print("math" in sys.modules)  # True（已缓存）
\`\`\`

### 重新加载模块

\`\`\`python
import importlib  # 导入模块 importlib
importlib.reload(module_name)  # 调用 importlib.reload()
\`\`\`

### 模块的内置属性

| 属性 | 说明 |
|------|------|
| \`__name__\` | 模块名（直接运行是 \`"__main__"\`） |
| \`__file__\` | 模块文件路径 |
| \`__doc__\` | 模块文档字符串 |
| \`__package__\` | 包名 |

下面的 demo 演示模块导入、搜索路径、相对导入模拟和模块缓存机制。`,
    code: `# 模块与包机制完整演示
import sys
import os
import importlib
import math
import tempfile
from pathlib import Path

print("=" * 50)
print("       模块与包机制演示")
print("=" * 50)

# ============ 1. import 的各种方式 ============
print("=== 1. import 的各种方式 ===")
# 导入整个模块
import math
print(f"import math -> math.sqrt(16) = {math.sqrt(16)}")

# 导入并起别名
import math as m
print(f"import math as m -> m.pi = {m.pi}")

# 从模块导入指定函数
from math import sqrt, pi
print(f"from math import sqrt, pi -> sqrt(25) = {sqrt(25)}, pi = {pi}")

# 导入并重命名
from math import factorial as fact
print(f"from math import factorial as fact -> fact(5) = {fact(5)}")

# ============ 2. sys.path 模块搜索路径 ============
print()
print("=== 2. sys.path 模块搜索路径 ===")
print("当前搜索路径：")
for i, p in enumerate(sys.path):
    if p:
        label = ""
        if i == 0:
            label = "  ← 当前目录（优先）"
        print(f"  [{i}] {p}{label}")
    else:
        print(f"  [{i}] ''  ← 当前目录（空字符串）")

# ============ 3. __name__ 与 __file__ ============
print()
print("=== 3. 模块内置属性 ===")
print(f"__name__ = {__name__}")
print(f"__file__ = {__file__}")
print(f"__package__ = {__package__ if __package__ else '(顶层模块)'}")

# 查看 math 模块的属性
print(f"\\nmath 模块属性：")
print(f"  math.__name__ = {math.__name__}")
print(f"  math.__file__ = {math.__file__}")
print(f"  math.__doc__ 首行 = {math.__doc__[:50] if math.__doc__ else 'None'}...")

# ============ 4. 模块缓存 sys.modules ============
print()
print("=== 4. 模块缓存 sys.modules ===")
print(f"math 在 sys.modules 中：{'math' in sys.modules}")
print(f"os 在 sys.modules 中：{'os' in sys.modules}")
print(f"已加载的模块总数：{len(sys.modules)}")

# 演示：重复 import 不会重新执行
# 用 id() 证明是同一个对象
import io as io2
print(f"import io 两次，是同一个对象吗？{id(sys.modules['io']) == id(io2)}")

# ============ 5. 动态创建模块并模拟包结构 ============
print()
print("=== 5. 动态创建模块模拟包结构 ===")
tmp_dir = tempfile.mkdtemp(prefix="py8_module_")

# 创建包结构
pkg = Path(tmp_dir) / "mypkg"
pkg.mkdir()
# __init__.py
(pkg / "__init__.py").write_text("""
# mypkg 包初始化
print("mypkg 包被导入")
__all__ = ["greet", "Calculator"]

def greet(name):
    return f"你好，{name}！"

class Calculator:
    def add(self, a, b):
        return a + b
    def multiply(self, a, b):
        return a * b
""")
# 子模块
(pkg / "utils.py").write_text("""
def double(x):
    return x * 2

def triple(x):
    return x * 3
""")
print(f"包结构创建完成：{pkg}")
print(f"  mypkg/")
print(f"    __init__.py")
print(f"    utils.py")

# ============ 6. 导入自定义包 ============
print()
print("=== 6. 导入自定义包 ===")
# 把临时目录加入 sys.path
sys.path.insert(0, tmp_dir)
import mypkg
print(f"mypkg 导入成功，__all__ = {mypkg.__all__}")
print(f"调用 greet()：{mypkg.greet('小明')}")
calc = mypkg.Calculator()
print(f"Calculator.add(3, 5) = {calc.add(3, 5)}")
print(f"Calculator.multiply(3, 5) = {calc.multiply(3, 5)}")

# 导入子模块
from mypkg import utils
print(f"utils.double(10) = {utils.double(10)}")
print(f"utils.triple(10) = {utils.triple(10)}")

# ============ 7. importlib.reload 重新加载 ============
print()
print("=== 7. importlib.reload 重新加载 ===")
# 修改 utils 模块
utils_file = pkg / "utils.py"
original = utils_file.read_text()
utils_file.write_text(original + "\\ndef quadruple(x): return x * 4\\n")
print("utils.py 已修改（添加了 quadruple 函数）")

# 重新加载
importlib.reload(utils)
print(f"重新加载后 quadruple(10) = {utils.quadruple(10)}")

# 恢复原文件
utils_file.write_text(original)

# ============ 8. 相对导入概念演示 ============
print()
print("=== 8. 相对导入概念演示 ===")
print("相对导入语法（概念演示）：")
examples = [
    "from . import sibling_module    # 从同目录导入兄弟模块",
    "from .module_b import func      # 从兄弟模块导入函数",
    "from .. import parent_pkg       # 从上级目录导入",
    "from ..sub_pkg import module    # 从兄弟包的子模块导入",
    "from .sub_pkg.module import cls # 从子包模块导入",
]
for ex in examples:
    print(f"  {ex}")

# ============ 9. from ... import * 与 __all__ ============
print()
print("=== 9. from ... import * 与 __all__ ===")
# 由于 __all__ 的限制，import * 只会导入 greet 和 Calculator
# 我们模拟这个行为
namespace = {}
exec("from mypkg import *", namespace)
print(f"from mypkg import * 导入的符号：")
for name in sorted(namespace):
    if not name.startswith("_"):
        print(f"  {name}")

# ============ 10. 模块路径解析 ============
print()
print("=== 10. 模块路径解析 ===")
# 查看一个模块的路径
import json
print(f"json 模块路径：{json.__file__}")
print(f"json 包目录：{os.path.dirname(json.__file__)}")

# 列出 json 包内容
json_dir = os.path.dirname(json.__file__)
if os.path.isdir(json_dir):
    contents = os.listdir(json_dir)
    print(f"json 包内容（{len(contents)}个文件）：")
    for f in sorted(contents)[:10]:
        print(f"  {f}")

# 清理
sys.path.remove(tmp_dir)
import shutil
shutil.rmtree(tmp_dir)
print()
print("✅ 模块与包机制演示完成")`
  },
  {
    id: "py8-package",
    group: "文件IO与模块",
    icon: "📚",
    title: "包管理与发布",
    content: `## 包结构设计

一个规范的 Python 包目录结构：

\`\`\`
my_package/
├── pyproject.toml          # 现代项目配置（推荐）
├── setup.py                # 传统打包脚本（旧方式）
├── README.md               # 项目说明
├── LICENSE                 # 许可证
├── src/
│   └── my_package/         # 源码包
│       ├── __init__.py
│       ├── core.py
│       └── utils.py
├── tests/                  # 测试
│   ├── __init__.py
│   └── test_core.py
└── scripts/                # 可执行脚本
    └── my_cli
\`\`\`

### setup.py（传统方式）

\`\`\`python
from setuptools import setup, find_packages  # 从 setuptools 导入 setup, find_packages

setup(  # 调用 setup()
    name="my_package",  # 定义字符串 name
    version="0.1.0",  # 定义字符串 version
    packages=find_packages(),  # 赋值变量 packages
    install_requires=["requests>=2.31"],  # 定义列表 install_requires
    entry_points={  # 定义字典 entry_points
        "console_scripts": [  # 执行操作
            "mycli=my_package.cli:main",  # 执行操作
        ],
    },
)
\`\`\`

### pyproject.toml（现代方式，推荐）

\`\`\`toml
[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.backends._legacy:_Backend"

[project]
name = "my_package"
version = "0.1.0"
description = "一个示例包"
requires-python = ">=3.10"
dependencies = ["requests>=2.31"]

[project.scripts]
mycli = "my_package.cli:main"

[project.entry-points."my_package.plugins"]
plugin_a = "my_package.plugins.a:PluginA"
\`\`\`

### entry_points 入口点

入口点让包可以注册**命令行工具**和**插件**：

\`\`\`python
# 安装后，在终端直接运行 mycli
# 等价于执行 my_package.cli.main()
\`\`\`

### 版本号规范

遵循 **语义化版本**（SemVer）：

\`\`\`
MAJOR.MINOR.PATCH
1.2.3

- MAJOR：不兼容的 API 修改
- MINOR：向后兼容的新功能
- PATCH：向后兼容的 bug 修复
\`\`\`

### 命名空间包

**命名空间包**是跨多个目录的包（无 \`__init__.py\`），用于大型项目分拆：

\`\`\`
# 两个不同的目录，但都贡献到 myorg.utils 包
/opt/proj_a/myorg/utils/image.py
/opt/proj_b/myorg/utils/text.py

# 可以这样导入
from myorg.utils import image
from myorg.utils import text
\`\`\`

### 发布到 PyPI 流程

\`\`\`bash
# 1. 安装构建工具
pip install build twine

# 2. 构建分发包
python -m build

# 3. 检查分发包
twine check dist/*

# 4. 上传到 TestPyPI 测试
twine upload -r testpypi dist/*

# 5. 上传到 PyPI 正式
twine upload dist/*
\`\`\`

### 可执行脚本

在 \`setup.py\` 中配置 \`scripts\` 参数，或使用 \`entry_points\` 的 \`console_scripts\`。

下面的 demo 模拟演示包结构搭建、pyproject.toml 解析和入口点机制。`,
    code: `# 包管理与发布完整演示
import os
import sys
import tempfile
import json
from pathlib import Path

print("=" * 50)
print("       包管理与发布演示")
print("=" * 50)

tmp_dir = tempfile.mkdtemp(prefix="py8_pkg_")

# ============ 1. 创建标准包结构 ============
print("=== 1. 创建标准包结构 ===")
pkg_root = Path(tmp_dir) / "my_package"
src = pkg_root / "src" / "my_package"
tests = pkg_root / "tests"
scripts = pkg_root / "scripts"

# 创建目录
src.mkdir(parents=True)
tests.mkdir(parents=True)
scripts.mkdir(parents=True)

# __init__.py
(src / "__init__.py").write_text('''
"""my_package - 一个示例包"""

__version__ = "0.1.0"
__all__ = ["core", "utils"]

from .core import greet, add, Calculator
''')

# core.py
(src / "core.py").write_text('''
"""核心功能模块"""

def greet(name="世界"):
    """打招呼"""
    return f"你好，{name}！"

def add(a, b):
    """加法"""
    return a + b

class Calculator:
    """计算器类"""
    def multiply(self, a, b):
        return a * b

    def divide(self, a, b):
        if b == 0:
            raise ValueError("除数不能为零")
        return a / b
''')

# utils.py
(src / "utils.py").write_text('''
"""工具函数模块"""

def format_size(bytes_count):
    """格式化文件大小"""
    for unit in ["B", "KB", "MB", "GB"]:
        if bytes_count < 1024:
            return f"{bytes_count:.1f} {unit}"
        bytes_count /= 1024
    return f"{bytes_count:.1f} TB"

def chunk_list(lst, size):
    """将列表按大小分块"""
    return [lst[i:i+size] for i in range(0, len(lst), size)]
''')

# cli.py（入口点）
(src / "cli.py").write_text('''
"""命令行入口"""

def main():
    print("my_package CLI 工具")
    print("用法：mycli <command>")
    print("命令：greet, add, info")
''')

# tests/test_core.py
(tests / "__init__.py").write_text("")
(tests / "test_core.py").write_text('''
"""核心模块测试"""
from my_package.core import greet, add, Calculator

def test_greet():
    assert "小明" in greet("小明")

def test_add():
    assert add(2, 3) == 5
''')

# scripts/my_cli
(scripts / "my_cli").write_text('''#!/usr/bin/env python3
"""可执行脚本示例"""
from my_package.cli import main
main()
''')

print("包结构：")
for root, dirs, files in os.walk(pkg_root):
    level = root.replace(str(pkg_root), "").count(os.sep)
    indent = "  " * level
    print(f"{indent}[{os.path.basename(root) or os.path.basename(pkg_root)}]/")
    for f in sorted(files):
        print(f"{indent}  {f}")

# ============ 2. 创建 pyproject.toml ============
print()
print("=== 2. pyproject.toml 配置 ===")
pyproject = '''[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.backends._legacy:_Backend"

[project]
name = "my_package"
version = "0.1.0"
description = "一个示例Python包"
readme = "README.md"
license = {text = "MIT"}
requires-python = ">=3.10"
authors = [
    {name = "小明", email = "xiaoming@example.com"}
]
keywords = ["example", "tutorial"]
classifiers = [
    "Programming Language :: Python :: 3",
    "License :: OSI Approved :: MIT License",
]

dependencies = [
    "requests>=2.31.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "black>=24.0.0",
]

[project.scripts]
mycli = "my_package.cli:main"

[project.entry-points."my_package.plugins"]
plugin_a = "my_package.plugins.a:PluginA"
plugin_b = "my_package.plugins.b:PluginB"

[tool.setuptools]
packages = ["my_package"]
package-dir = {"" = "src"}

[tool.pytest.ini_options]
testpaths = ["tests"]
'''
(pkg_root / "pyproject.toml").write_text(pyproject)
print("pyproject.toml 已创建")

# 尝试用 tomllib 解析
try:
    import tomllib
    config = tomllib.loads(pyproject)
    proj = config.get("project", {})
    print(f"\\n解析 pyproject.toml：")
    print(f"  项目名：{proj.get('name')}")
    print(f"  版本：{proj.get('version')}")
    print(f"  描述：{proj.get('description')}")
    print(f"  Python 要求：{proj.get('requires-python')}")
    deps = proj.get("dependencies", [])
    print(f"  依赖（{len(deps)}个）：{deps}")
    scripts = proj.get("scripts", {})
    print(f"  命令行入口：{scripts}")
except ModuleNotFoundError:
    print("(当前 Python 版本较低，无法解析 TOML，仅展示文件内容)")

# ============ 3. setup.py 传统方式 ============
print()
print("=== 3. setup.py 传统打包方式 ===")
setup_py = '''from setuptools import setup, find_packages

setup(
    name="my_package",
    version="0.1.0",
    description="一个示例包",
    author="小明",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "requests>=2.31.0",
    ],
    extras_require={
        "dev": ["pytest>=7.4.0"],
    },
    entry_points={
        "console_scripts": [
            "mycli=my_package.cli:main",
        ],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
    ],
    python_requires=">=3.10",
)
'''
(pkg_root / "setup.py").write_text(setup_py)
print("setup.py 已创建（传统方式）")

# ============ 4. 版本号规范 ============
print()
print("=== 4. 语义化版本号 SemVer ===")
print("格式：MAJOR.MINOR.PATCH  (如 1.2.3)")
print()
print("版本号升级规则：")
examples = [
    ("1.0.0 → 2.0.0", "MAJOR 升级：不兼容的 API 变更"),
    ("1.0.0 → 1.1.0", "MINOR 升级：向后兼容的新功能"),
    ("1.0.0 → 1.0.1", "PATCH 升级：向后兼容的 Bug 修复"),
    ("0.0.1 → 0.1.0", "0.x 阶段：API 不稳定，不遵循 SemVer"),
]
for version, desc in examples:
    print(f"  {version:20} {desc}")

# ============ 5. 入口点 entry_points 演示 ============
print()
print("=== 5. 入口点 entry_points 演示 ===")
print("console_scripts 入口点：")
print("  安装后，在终端直接运行 mycli 命令")
print("  等价于执行：python -m my_package.cli")
print()
print("  示例配置文件中的入口点：")
print("    mycli = my_package.cli:main")
print("    含义：命令 mycli 调用 my_package.cli 模块的 main() 函数")

# 模拟入口点调用
sys.path.insert(0, str(src.parent))
import my_package
import my_package.cli  # 显式导入 cli 子模块
print()
print("模拟入口点调用：")
my_package.cli.main()

# ============ 6. 命名空间包概念 ============
print()
print("=== 6. 命名空间包概念 ===")
print("命名空间包：无 __init__.py 的包目录")
print("多个目录可以贡献到同一个命名空间包")
print()
print("例如：")
print("  /opt/proj_a/myorg/utils/image.py")
print("  /opt/proj_b/myorg/utils/text.py")
print("  from myorg.utils import image, text  # 两者都可导入")

# 创建命名空间包演示
ns_dir = Path(tmp_dir) / "namespace_demo"
(ns_dir / "myorg" / "utils").mkdir(parents=True)
Path(ns_dir, "myorg", "utils", "image.py").write_text("def load(): return 'image loaded'")
Path(ns_dir, "myorg", "utils", "text.py").write_text("def parse(): return 'text parsed'")

sys.path.insert(0, str(ns_dir))
from myorg.utils import image, text
print(f"  image.load() = {image.load()}")
print(f"  text.parse() = {text.parse()}")

# ============ 7. 发布到 PyPI 流程 ============
print()
print("=== 7. 发布到 PyPI 流程 ===")
steps = [
    ("1. 安装构建工具", "pip install build twine"),
    ("2. 清理旧构建", "rm -rf dist/ build/"),
    ("3. 构建分发包", "python -m build"),
    ("4. 检查分发包", "twine check dist/*"),
    ("5. 上传到 TestPyPI", "twine upload -r testpypi dist/*"),
    ("6. 测试安装", "pip install -i https://test.pypi.org/simple/ my_package"),
    ("7. 上传到 PyPI", "twine upload dist/*"),
]
for step, cmd in steps:
    print(f"  {step}")
    print(f"    $ {cmd}")

# ============ 8. README.md ============
print()
print("=== 8. README.md 示例 ===")
readme = '''# my_package

一个示例 Python 包，用于演示打包流程。

## 安装

\`\`\`bash
pip install my_package
\`\`\`

## 使用

\`\`\`python
from my_package import greet  # 从 my_package 导入 greet
print(greet("世界"))  # 打印输出到屏幕
\`\`\`

## 开发

\`\`\`bash
git clone https://github.com/user/my_package.git
cd my_package
pip install -e ".[dev]"
pytest
\`\`\`
'''
(pkg_root / "README.md").write_text(readme)
print("README.md 示例内容已创建")

# ============ 9. 测试包导入 ============
print()
print("=== 9. 测试包导入 ===")
print(f"my_package 版本：{my_package.__version__}")
print(f"greet('世界') = {my_package.greet('世界')}")
print(f"add(10, 20) = {my_package.add(10, 20)}")
calc = my_package.Calculator()
print(f"calc.multiply(6, 7) = {calc.multiply(6, 7)}")
print(f"calc.divide(100, 4) = {calc.divide(100, 4)}")

# 测试 utils
from my_package import utils
print(f"utils.format_size(1024) = {utils.format_size(1024)}")
print(f"utils.format_size(1048576) = {utils.format_size(1048576)}")
print(f"utils.chunk_list([1,2,3,4,5], 2) = {utils.chunk_list([1,2,3,4,5], 2)}")

# 清理
import shutil
shutil.rmtree(tmp_dir)
print()
print("✅ 包管理与发布演示完成")`
  },
  {
    id: "py8-env-config",
    group: "文件IO与模块",
    icon: "⚙️",
    title: "环境变量与配置文件",
    content: `## 环境变量

环境变量是操作系统级别的配置，Python 通过 \`os.environ\` 访问。

### 基本操作

\`\`\`python
import os  # 导入模块 os

# 获取环境变量
os.environ["HOME"]       # 如果不存在会报 KeyError
os.environ.get("HOME")   # 不存在返回 None
os.getenv("HOME")        # 同上，可设默认值
os.getenv("MY_VAR", "默认值")  # 调用 os.getenv()

# 设置环境变量（仅影响当前进程）
os.environ["MY_VAR"] = "my_value"  # 执行操作

# 列出所有环境变量
for key, value in os.environ.items():  # 遍历 os.environ.items()，取值给 key, value
    print(f"{key}={value}")  # 打印输出到屏幕
\`\`\`

### python-dotenv 概念

\`python-dotenv\` 是流行的第三方库，从 \`.env\` 文件加载环境变量。这里我们模拟其原理：

\`\`\`python
# .env 文件内容
DATABASE_URL=postgres://localhost/mydb  # 赋值变量 DATABASE_URL
SECRET_KEY=my-secret-key  # 赋值变量 SECRET_KEY
DEBUG=True  # 赋值变量 DEBUG
\`\`\`

### configparser 解析 INI 文件

\`\`\`ini
[app]
name = MyApp
version = 1.0
debug = true

[database]
host = localhost
port = 5432
user = admin
\`\`\`

\`\`\`python
import configparser  # 导入模块 configparser
config = configparser.ConfigParser()  # 赋值变量 config
config.read("config.ini")  # 调用 config.read()：读取
print(config["database"]["host"])  # localhost
print(config.getboolean("app", "debug"))  # True
\`\`\`

### YAML 概念（模拟）

YAML 是更人性化的配置格式（需要 \`PyYAML\` 第三方库），这里用字典模拟：

\`\`\`yaml
app:
  name: MyApp
  debug: true

database:
  host: localhost
  port: 5432
\`\`\`

### TOML 配置

Python 3.11+ 内置 \`tomllib\` 读取 TOML：

\`\`\`toml
[app]
name = "MyApp"
version = "1.0"

[database]
host = "localhost"
port = 5432
\`\`\`

### 环境变量优先级

多环境配置的优先级（从高到低）：

1. 命令行参数
2. 环境变量
3. \`.env\` 文件
4. 配置文件
5. 代码默认值

### 开发/生产环境配置

\`\`\`python
import os  # 导入模块 os
ENV = os.getenv("APP_ENV", "development")  # 赋值变量 ENV

config = {  # 定义字典 config
    "development": {"debug": True, "db": "sqlite:///dev.db"},  # 执行操作
    "production": {"debug": False, "db": "postgres://..."},  # 执行操作
}
current = config[ENV]  # 赋值变量 current
\`\`\`

下面的 demo 演示环境变量读写、INI 配置解析、TOML 配置和模拟 .env 加载。`,
    code: `# 环境变量与配置文件完整演示
import os
import sys
import configparser
import tempfile
import json
from pathlib import Path

print("=" * 50)
print("     环境变量与配置文件演示")
print("=" * 50)

tmp_dir = tempfile.mkdtemp(prefix="py8_env_")

# ============ 1. os.environ 环境变量 ============
print("=== 1. os.environ 环境变量 ===")
# 设置一个环境变量（仅影响当前进程）
os.environ["PY8_DEMO_VAR"] = "hello_from_py8"
print(f"os.environ['PY8_DEMO_VAR'] = {os.environ['PY8_DEMO_VAR']}")

# os.getenv 安全获取（不存在不报错）
print(f"os.getenv('PY8_DEMO_VAR') = {os.getenv('PY8_DEMO_VAR')}")
print(f"os.getenv('NOT_EXIST_VAR') = {os.getenv('NOT_EXIST_VAR')}")
print(f"os.getenv('NOT_EXIST_VAR', '默认值') = {os.getenv('NOT_EXIST_VAR', '默认值')}")

# 列出一些关键环境变量
print()
print("常见系统环境变量：")
common_vars = ["HOME", "USER", "PATH", "SHELL", "LANG", "PYTHONPATH"]
for var in common_vars:
    val = os.getenv(var)
    if val and len(val) > 60:
        val = val[:57] + "..."
    print(f"  {var:12} = {val if val else '(未设置)'}")

# ============ 2. 模拟 .env 文件加载 ============
print()
print("=== 2. 模拟 .env 文件加载（python-dotenv 原理）===")
env_content = """# 数据库配置
DATABASE_URL=postgres://localhost:5432/mydb
DATABASE_USER=admin
DATABASE_PASSWORD=secret123

# 应用配置
APP_NAME=MyApp
APP_DEBUG=true
APP_PORT=8080

# 密钥（生产环境请用真实密钥）
SECRET_KEY=super-secret-key-2024
"""
env_path = Path(tmp_dir) / ".env"
env_path.write_text(env_content)
print(f".env 文件内容：")
print(env_content)

# 模拟 dotenv 加载逻辑
def load_dotenv(filepath):
    """模拟 python-dotenv 的 load_dotenv 功能"""
    loaded = {}
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            # 跳过空行和注释
            if not line or line.startswith("#"):
                continue
            # 解析 KEY=VALUE
            if "=" in line:
                key, _, value = line.partition("=")
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                os.environ[key] = value
                loaded[key] = value
    return loaded

loaded_vars = load_dotenv(env_path)
print(f"\\n已加载的环境变量（{len(loaded_vars)}个）：")
for k, v in loaded_vars.items():
    # 隐藏密码
    display = v if "PASSWORD" not in k and "SECRET" not in k else "***"
    print(f"  {k} = {display}")

# ============ 3. configparser 解析 INI 文件 ============
print()
print("=== 3. configparser 解析 INI 文件 ===")
ini_content = """[app]
name = MyApp
version = 1.0
debug = true
language = zh-CN

[database]
host = localhost
port = 5432
user = admin
password = db_secret
max_connections = 100

[logging]
level = INFO
file = /var/log/myapp.log
format = %%(asctime)s - %%(name)s - %%(levelname)s - %%(message)s
"""
ini_path = Path(tmp_dir) / "config.ini"
ini_path.write_text(ini_content)
print(f"config.ini 文件内容：")
print(ini_content)

config = configparser.ConfigParser()
config.read(ini_path, encoding="utf-8")

print("解析结果：")
print(f"  所有节（sections）：{config.sections()}")
print(f"  [app] name = {config.get('app', 'name')}")
print(f"  [app] version = {config.getfloat('app', 'version')}")
print(f"  [app] debug = {config.getboolean('app', 'debug')}")
print(f"  [database] host = {config.get('database', 'host')}")
print(f"  [database] port = {config.getint('database', 'port')}")
print(f"  [database] max_connections = {config.getint('database', 'max_connections')}")

# 遍历某个节的所有键值
print(f"\\n  [database] 所有配置：")
for key, value in config.items("database"):
    print(f"    {key} = {value}")

# ============ 4. 写入 INI 配置文件 ============
print()
print("=== 4. 写入 INI 配置文件 ===")
write_config = configparser.ConfigParser()
write_config["server"] = {
    "host": "0.0.0.0",
    "port": "8000",
    "workers": "4",
}
write_config["cache"] = {
    "enabled": "yes",
    "ttl": "3600",
    "backend": "redis",
}
write_path = Path(tmp_dir) / "generated.ini"
with open(write_path, "w", encoding="utf-8") as f:
    write_config.write(f)
print(f"已写入 {write_path}：")
print(write_path.read_text())

# ============ 5. TOML 配置解析 ============
print()
print("=== 5. TOML 配置解析 ===")
toml_content = """[app]
name = "MyApp"
version = "1.0"
debug = true

[database]
host = "localhost"
port = 5432
max_connections = 100

[[users]]
name = "admin"
role = "administrator"

[[users]]
name = "guest"
role = "viewer"
"""
toml_path = Path(tmp_dir) / "config.toml"
toml_path.write_text(toml_content)
print(f"config.toml 内容：")
print(toml_content)

try:
    import tomllib
    toml_config = tomllib.loads(toml_content)
    print("解析 TOML：")
    print(f"  app.name = {toml_config['app']['name']}")
    print(f"  app.debug = {toml_config['app']['debug']}")
    print(f"  database.host = {toml_config['database']['host']}")
    print(f"  users = {toml_config['users']}")
except ModuleNotFoundError:
    print("(当前 Python 版本较低，无法使用 tomllib，仅展示文件内容)")
    # 手动简单解析（仅演示）
    print("手动解析结果：")
    print("  app: {name: MyApp, version: 1.0, debug: true}")
    print("  database: {host: localhost, port: 5432}")
    print("  users: [{name: admin}, {name: guest}]")

# ============ 6. YAML 配置概念模拟 ============
print()
print("=== 6. YAML 配置概念模拟 ===")
print("YAML 是一种人性化的配置格式（需要 PyYAML 第三方库）")
print("这里用字典模拟 YAML 的结构：")

yaml_like = {
    "app": {
        "name": "MyApp",
        "version": "1.0",
        "debug": True,
        "features": ["auth", "api", "logging"],
    },
    "database": {
        "host": "localhost",
        "port": 5432,
        "pool": {"min": 5, "max": 20},
    },
    "logging": {
        "level": "INFO",
        "handlers": ["console", "file"],
    },
}
print("YAML 结构（字典表示）：")
print(json.dumps(yaml_like, indent=2, ensure_ascii=False))

# ============ 7. 环境变量优先级演示 ============
print()
print("=== 7. 环境变量优先级演示 ===")
print("配置优先级（从高到低）：")
print("  1. 命令行参数")
print("  2. 环境变量")
print("  3. .env 文件")
print("  4. 配置文件")
print("  5. 代码默认值")

def get_config_with_priority():
    """演示配置优先级"""
    # 第5级：代码默认值
    db_host = "localhost"
    db_port = 5432
    debug = False

    # 第4级：配置文件覆盖
    if config.has_section("database"):
        db_host = config.get("database", "host", fallback=db_host)
        db_port = config.getint("database", "port", fallback=db_port)
    if config.has_section("app"):
        debug = config.getboolean("app", "debug", fallback=debug)

    # 第3级：.env 文件覆盖
    db_host = os.getenv("DATABASE_URL", db_host)

    # 第2级：环境变量覆盖
    db_host = os.getenv("DB_HOST", db_host)
    db_port = int(os.getenv("DB_PORT", str(db_port)))
    debug = os.getenv("DEBUG", str(debug)).lower() in ("true", "1", "yes")

    return {"db_host": db_host, "db_port": db_port, "debug": debug}

# 测试：无环境变量覆盖
result = get_config_with_priority()
print(f"\\n默认配置（无环境变量覆盖）：")
print(f"  db_host = {result['db_host']}")
print(f"  db_port = {result['db_port']}")
print(f"  debug = {result['debug']}")

# 测试：环境变量覆盖
os.environ["DB_HOST"] = "prod.example.com"
os.environ["DB_PORT"] = "3306"
os.environ["DEBUG"] = "true"
result2 = get_config_with_priority()
print(f"\\n环境变量覆盖后：")
print(f"  db_host = {result2['db_host']}")
print(f"  db_port = {result2['db_port']}")
print(f"  debug = {result2['debug']}")

# ============ 8. 开发/生产环境配置 ============
print()
print("=== 8. 开发/生产环境配置切换 ===")
# 模拟多环境配置
configs = {
    "development": {
        "debug": True,
        "db_url": "sqlite:///dev.db",
        "log_level": "DEBUG",
        "cache_enabled": False,
    },
    "staging": {
        "debug": True,
        "db_url": "postgres://staging-db:5432/app",
        "log_level": "INFO",
        "cache_enabled": True,
    },
    "production": {
        "debug": False,
        "db_url": "postgres://prod-db:5432/app",
        "log_level": "WARNING",
        "cache_enabled": True,
    },
}

# 模拟根据 APP_ENV 选择配置
for env_name in ["development", "staging", "production"]:
    os.environ["APP_ENV"] = env_name
    current_env = os.getenv("APP_ENV", "development")
    cfg = configs.get(current_env, configs["development"])
    print(f"\\n  APP_ENV = {current_env}：")
    for k, v in cfg.items():
        print(f"    {k} = {v}")

# ============ 9. 配置验证 ============
print()
print("=== 9. 配置验证 ===")
def validate_config(cfg):
    """验证配置完整性和合法性"""
    errors = []
    required = {
        "db_host": str,
        "db_port": int,
        "debug": bool,
    }
    for key, expected_type in required.items():
        if key not in cfg:
            errors.append(f"缺少必填配置项：{key}")
        elif not isinstance(cfg[key], expected_type):
            errors.append(
                f"{key} 类型错误：期望 {expected_type.__name__}，"
                f"实际 {type(cfg[key]).__name__}"
            )
    return errors

valid_cfg = {"db_host": "localhost", "db_port": 5432, "debug": True}
errs = validate_config(valid_cfg)
print(f"验证合法配置：{'✅ 通过' if not errs else '❌ ' + str(errs)}")

invalid_cfg = {"db_host": "localhost", "db_port": "not_a_number"}
errs = validate_config(invalid_cfg)
print(f"验证非法配置：{'✅ 通过' if not errs else '❌ ' + str(errs)}")

# 清理
import shutil
shutil.rmtree(tmp_dir)
print()
print("✅ 环境变量与配置文件演示完成")`
  }
];