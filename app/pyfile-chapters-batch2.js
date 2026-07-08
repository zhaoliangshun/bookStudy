// =============================================================
// Python 文件操作教程 - 第 2 批章节(路径与目录)
// 转义规则:content 内部反引号写作 \`,\${ 写作 \$\{。
// =============================================================

export const chapters = [
  {
    id: "pyfile-os-path",
    icon: "🛤️",
    title: "os.path 路径操作大全",
    group: "路径与目录",
    content: `# os.path 路径操作大全

## 一、引言:为什么路径操作这么重要

在 Python 文件操作中,路径(path)是最基础也最容易踩坑的部分。你可能会想:"不就是字符串拼接吗?用 \`+\` 不就行了?"——这种想法在 Windows 上会立刻翻车。

### 路径操作的核心痛点

1. **跨平台分隔符不同**:Windows 用 \`\\\`,Linux/macOS 用 \`/\`
2. **硬编码路径不可维护**:换一台机器就跑不起来
3. **相对路径与绝对路径混淆**:程序在不同目录运行结果不同
4. **路径规范化问题**:\`a/b/../c\` 这种路径需要简化

\`os.path\` 模块就是为解决这些问题而生,它屏蔽了平台差异,提供了一整套路径操作函数。

## 二、os.path.join:跨平台拼接路径

\`os.path.join\` 是路径操作的"瑞士军刀",它会根据当前操作系统自动选择分隔符。

### demo 1:路径拼接对比

\`\`\`python
import os

# ❌ 错误写法:用字符串拼接,跨平台必崩
# path = "folder" + "/" + "sub" + "/" + "file.txt"  # Windows 上会有问题

# ✅ 正确写法:用 os.path.join
path = os.path.join("folder", "sub", "file.txt")
print(path)
# Windows 输出: folder\\sub\\file.txt
# Linux/macOS 输出: folder/sub/file.txt

# os.path.join 会自动处理已有分隔符的情况
path2 = os.path.join("/home", "user", "docs")
print(path2)  # Linux: /home/user/docs

# 注意:绝对路径会"吃掉"前面的部分
path3 = os.path.join("/home", "/user", "docs")
print(path3)  # Linux: /user/docs(因为 /user 是绝对路径)
\`\`\`

**详细解释**:
- 第 4 行:字符串拼接 \`"folder" + "/" + "sub"\` 在 Linux 上看似正常,但一旦部署到 Windows,文件就找不到了——因为 Windows 不认 \`/\`(虽然部分 API 容错,但不保证)。
- \`os.path.join("folder", "sub", "file.txt")\`:参数个数不限,函数会智能地在每段之间插入当前系统的分隔符。
- 第 14 行:当某个参数是绝对路径(以 \`/\` 或 \`C:\\\` 开头)时,前面的参数会被丢弃——这是一个常见陷阱,要避免误传绝对路径。

## 三、os.path.split / dirname / basename:拆分路径

### demo 2:拆分路径的多种方式

\`\`\`python
import os

path = "/home/user/docs/report.txt"

# split:一次拆成 (目录, 文件名) 两部分
result = os.path.split(path)
print(result)  # ('/home/user/docs', 'report.txt')

# dirname:只取目录部分
dirname = os.path.dirname(path)
print(dirname)  # /home/user/docs

# basename:只取最后一级(文件名或最末目录名)
basename = os.path.basename(path)
print(basename)  # report.txt

# split 和 dirname+basename 的关系
# os.path.split(path) == (os.path.dirname(path), os.path.basename(path))
print((os.path.dirname(path), os.path.basename(path)) == result)  # True

# 对于目录路径,basename 返回最末一级
print(os.path.basename("/home/user/docs/"))  # docs(注意末尾斜杠)
print(os.path.basename("/home/user/docs"))   # docs
\`\`\`

**详细解释**:
- \`split\` 返回一个元组,等价于 \`dirname\` 和 \`basename\` 的组合,但调用一次更高效。
- \`dirname\` 只做"字符串切分",**不会**检查路径是否存在。例如 \`os.path.dirname("不存在的路径/文件.txt")\` 仍然返回 \`"不存在的路径"\`。
- 第 18-19 行:末尾斜杠会被 \`basename\` 忽略,但行为在不同 Python 版本间略有差异,建议先 \`rstrip(os.sep)\` 再处理。

## 四、os.path.splitext:分离扩展名

### demo 3:获取扩展名

\`\`\`python
import os

# splitext 把路径拆成 (root, ext) 两部分
filename = "report.tar.gz"
root, ext = os.path.splitext(filename)
print(root, ext)  # report.tar .gz(只切最后一个点)

# 多个点的处理
print(os.path.splitext("archive.tar.gz"))   # ('archive.tar', '.gz')
print(os.path.splitext("no_extension"))      # ('no_extension', '')
print(os.path.splitext(".hidden_file"))     # ('.hidden_file', '') 隐藏文件无扩展名
print(os.path.splitext("/path/to/file.PY")) # ('/path/to/file', '.PY') 扩展名保留大小写

# 实用场景:批量改扩展名
old_path = "/data/images/photo.bmp"
root, ext = os.path.splitext(old_path)
new_path = root + ".png"
print(new_path)  # /data/images/photo.png
\`\`\`

**详细解释**:
- \`splitext\` 的核心逻辑是"找最后一个点",点之前是 root,点之后(含点)是 ext。所以 \`archive.tar.gz\` 切出来是 \`.gz\` 而不是 \`.tar.gz\`。
- 第 7 行:无点的文件名,ext 返回空字符串。
- 第 8 行:以点开头的隐藏文件(如 \`.gitignore\`)被认为是"无扩展名",这是 Unix 习惯——整个名字都是文件名。
- 扩展名**保留大小写**和**包含点**(\`.py\` 而不是 \`py\`),这是设计上的统一性,方便拼接。

## 五、os.path.exists / isfile / isdir:路径判断

### demo 4:判断文件类型

\`\`\`python
import os

path = "/tmp/test_file.txt"

# 先创建一个测试文件
with open(path, "w") as f:
    f.write("hello")

# exists:路径是否存在(文件或目录都算)
print(os.path.exists(path))  # True

# isfile:是否存在且是普通文件
print(os.path.isfile(path))  # True
print(os.path.isfile("/tmp"))  # False(/tmp 是目录)

# isdir:是否存在且是目录
print(os.path.isdir(path))  # False
print(os.path.isdir("/tmp"))  # True

# islink:是否是符号链接(注意:跟随链接后 isfile/isdir 仍可能为 True)
print(os.path.islink(path))  # False

# 重要:exists/isfile/isdir 之间存在竞态(time-of-check to time-of-use)
# 例如:
if os.path.exists(path):
    # 这里 path 可能已经被别的进程删除了!
    with open(path) as f:  # 可能抛 FileNotFoundError
        data = f.read()
# 更安全的做法:直接尝试打开,捕获异常(EAFP 风格)
\`\`\`

**详细解释**:
- \`exists\` 对文件和目录都返回 \`True\`,如果你只想确认是文件,必须用 \`isfile\`。
- 第 22-26 行:**TOCTOU 竞态**是系统编程的经典陷阱。在 \`exists\` 通过之后、真正操作之前,文件可能被其他进程删除。Python 推崇的 EAFP(Easier to Ask Forgiveness than Permission)风格建议直接 \`try: open()\`,捕获 \`FileNotFoundError\`,这样既安全又高效。
- \`islink\` 不会跟随符号链接,而 \`isfile\`/\`isdir\` 会跟随——这是它们的区别。

## 六、os.path.getsize / getmtime / getatime / getctime:文件属性

### demo 5:获取文件大小与修改时间

\`\`\`python
import os
import time
from datetime import datetime

path = "/tmp/test_attrs.txt"

# 创建测试文件
with open(path, "w") as f:
    f.write("hello world")

# getsize:文件大小(字节)
size = os.path.getsize(path)
print(f"文件大小: {size} 字节")  # 11 字节(hello world 共 11 字符)

# getmtime:最后修改时间(时间戳)
mtime = os.path.getmtime(path)
print(f"修改时间戳: {mtime}")
# 转成可读格式
print(f"修改时间: {datetime.fromtimestamp(mtime)}")

# getatime:最后访问时间(access time)
atime = os.path.getatime(path)
print(f"访问时间: {datetime.fromtimestamp(atime)}")

# getctime:创建时间(Windows)/ 元数据修改时间(Unix)
ctime = os.path.getctime(path)
print(f"创建/更改时间: {datetime.fromtimestamp(ctime)}")

# 实用场景:找出 7 天内修改过的文件
import time
seven_days_ago = time.time() - 7 * 86400
if os.path.getmtime(path) > seven_days_ago:
    print("这是最近 7 天内修改的文件")
\`\`\`

**详细解释**:
- \`getsize\` 返回字节数,不是字符数。中文文件用 UTF-8 编码时,一个汉字占 3 字节。
- \`getmtime\` 返回的是浮点时间戳(自 1970-01-01 起的秒数),需要用 \`datetime.fromtimestamp\` 转成人类可读时间。
- \`getctime\` 在不同系统语义不同:Windows 是创建时间,Linux/macOS 是元数据(inode)修改时间(如改权限时)。如果你需要真正的"创建时间",在 macOS 上要用 \`st_birthtime\`,在 Linux 上根本没有标准方法。
- 第 28-30 行:这是非常实用的"清理过期文件"模式——比较 \`getmtime\` 与当前时间差。

## 七、os.path.abspath / realpath:绝对路径与真实路径

### demo 6:规范化路径

\`\`\`python
import os

# 假设当前工作目录是 /home/user
os.chdir("/home/user")

# 相对路径
rel_path = "../other/file.txt"

# abspath:转成绝对路径(基于当前工作目录,但不解析符号链接)
abs_path = os.path.abspath(rel_path)
print(abs_path)  # /home/other/file.txt

# realpath:转成真实路径(解析符号链接 + 处理 ..)
real_path = os.path.realpath(rel_path)
print(real_path)  # 如果 /home 是符号链接,会解析到真实位置

# normpath:只规范化(不转绝对路径),处理冗余的 . 和 ..
print(os.path.normpath("/a/b/../c/./d"))  # /a/c/d
print(os.path.normpath("a//b///c"))       # a/b/c(合并多余斜杠)
print(os.path.normpath("a/./b/."))        # a/b(去除 . )

# expanduser:展开 ~ 为用户主目录
print(os.path.expanduser("~/Documents"))  # /home/user/Documents

# relpath:计算相对路径
print(os.path.relpath("/home/user/docs", "/home/user"))  # docs
print(os.path.relpath("/home/user", "/home/user/docs"))   # ..
\`\`\`

**详细解释**:
- \`abspath\` 只做"基于 cwd 的拼接 + 规范化",**不解析符号链接**。所以如果当前目录是符号链接,结果可能仍含符号链接。
- \`realpath\` 是 \`abspath\` 的增强版:它会递归解析所有符号链接,返回"真实物理路径"。当你想知道文件到底在硬盘哪个位置时,用 \`realpath\`。
- \`normpath\` 是纯字符串操作,不访问文件系统,速度快。它合并多余斜杠、去除 \`.\`、处理 \`..\`。
- 第 23 行:\`expanduser("~/...")\` 是跨平台获取用户主目录的标准方式,在 Windows 上 \`~\` 会展开为 \`C:\\Users\\用户名\`。
- 第 26-27 行:\`relpath\` 计算两个绝对路径之间的相对表示,常用于"显示用户友好的路径"。

## 八、os.path.commonpath / commonprefix:公共路径

### demo 7:commonpath 找公共目录

\`\`\`python
import os

paths = [
    "/home/user/docs/report.txt",
    "/home/user/docs/notes.txt",
    "/home/user/docs/archive/old.txt",
]

# commonpath:找所有路径的最长公共目录(基于路径组件,安全)
common = os.path.commonpath(paths)
print(common)  # /home/user/docs

# commonprefix:字符级前缀(危险,可能切出半个目录名)
prefix = os.path.commonprefix(paths)
print(prefix)  # /home/user/docs/(可能不完整,不可靠)

# commonpath 的陷阱:必须都是绝对路径或都是相对路径,不能混用
try:
    os.path.commonpath(["/abs/path", "rel/path"])
except ValueError as e:
    print(f"混用绝对/相对: {e}")  # Can't mix absolute and relative paths

# 实用场景:计算一组文件相对于公共目录的相对路径
base = os.path.commonpath(paths)
for p in paths:
    rel = os.path.relpath(p, base)
    print(f"{p} -> {rel}")
# 输出:
# /home/user/docs/report.txt -> report.txt
# /home/user/docs/notes.txt -> notes.txt
# /home/user/docs/archive/old.txt -> archive/old.txt
\`\`\`

**详细解释**:
- \`commonpath\` 是 Python 3.5+ 引入的,**正确**地按路径组件比较,返回完整的目录路径。这是推荐用法。
- \`commonprefix\` 是历史遗留函数,它按**字符**比较前缀,可能切出半个目录名(如 \`/home/user/do\`),极其危险,**不要用**。
- 第 12-14 行:\`commonpath\` 要求所有路径必须是同一类型(全绝对或全相对),否则抛 \`ValueError\`。
- 第 19-23 行:这是非常实用的模式——找到公共目录后,把每个文件的相对路径提取出来,常用于"打包一组文件时保留目录结构"。

## 九、os.path 函数速查表

| 函数 | 作用 | 返回值示例 |
|------|------|----------|
| \`os.path.join(a, b, c)\` | 跨平台拼接路径 | \`a/b/c\` |
| \`os.path.split(p)\` | 拆成 (目录, 文件名) | \`('/a/b', 'c.txt')\` |
| \`os.path.dirname(p)\` | 取目录部分 | \`/a/b\` |
| \`os.path.basename(p)\` | 取文件名部分 | \`c.txt\` |
| \`os.path.splitext(p)\` | 拆 (root, ext) | \`('/a/c', '.txt')\` |
| \`os.path.abspath(p)\` | 转绝对路径(不解析链接) | \`/home/user/a.txt\` |
| \`os.path.realpath(p)\` | 转真实路径(解析链接) | \`/real/path/a.txt\` |
| \`os.path.normpath(p)\` | 规范化路径 | \`/a/c\` |
| \`os.path.exists(p)\` | 路径是否存在 | \`True\` / \`False\` |
| \`os.path.isfile(p)\` | 是否是文件 | \`True\` / \`False\` |
| \`os.path.isdir(p)\` | 是否是目录 | \`True\` / \`False\` |
| \`os.path.islink(p)\` | 是否是符号链接 | \`True\` / \`False\` |
| \`os.path.getsize(p)\` | 文件大小(字节) | \`1024\` |
| \`os.path.getmtime(p)\` | 修改时间戳 | \`1700000000.0\` |
| \`os.path.commonpath(ps)\` | 多路径公共目录 | \`/home/user\` |
| \`os.path.expanduser(p)\` | 展开 \`~\` | \`/home/user\` |
| \`os.path.relpath(p, start)\` | 相对路径 | \`docs/file.txt\` |

## 十、本节小结

- \`os.path.join\` 是拼接路径的**唯一正确方式**,永远不要用 \`+\`。
- \`split\` / \`dirname\` / \`basename\` / \`splitext\` 都是纯字符串操作,不访问文件系统。
- \`exists\` / \`isfile\` / \`isdir\` 存在 TOCTOU 竞态,关键场景用 try/except 替代。
- \`abspath\` 不解析符号链接,\`realpath\` 解析——根据需求选择。
- \`commonpath\` 是正确的公共路径函数,\`commonprefix\` 不要用。

下一章我们会学习更现代的 \`pathlib\`,它用面向对象的方式重新封装了这些功能,代码更优雅。
`,
  },
  {
    id: "pyfile-pathlib",
    icon: "🛞",
    title: "pathlib 现代路径操作",
    group: "路径与目录",
    content: `# pathlib 现代路径操作

## 一、引言:为什么需要 pathlib

\`os.path\` 是函数式风格,你总是要把路径字符串传来传去:

\`\`\`python
import os
# 老写法:函数套函数,可读性差
ext = os.path.splitext(os.path.basename(path))[1]
\`\`\`

而 \`pathlib\`(Python 3.4+)是面向对象风格,链式调用,可读性极佳:

\`\`\`python
from pathlib import Path
# 新写法:属性访问,清晰直观
ext = Path(path).suffix
\`\`\`

\`pathlib\` 把路径视为对象,每个路径对象自带一堆方法和属性,这是现代 Python 推荐的路径操作方式。

## 二、os.path vs pathlib 对比

| 操作 | os.path(老) | pathlib(新) |
|------|--------------|-------------|
| 拼接 | \`os.path.join(a, b)\` | \`Path(a) / b\` |
| 父目录 | \`os.path.dirname(p)\` | \`Path(p).parent\` |
| 文件名 | \`os.path.basename(p)\` | \`Path(p).name\` |
| 扩展名 | \`os.path.splitext(p)[1]\` | \`Path(p).suffix\` |
| 主名 | \`os.path.splitext(p)[0]\` | \`Path(p).stem\` |
| 绝对路径 | \`os.path.abspath(p)\` | \`Path(p).resolve()\` |
| 是否存在 | \`os.path.exists(p)\` | \`Path(p).exists()\` |
| 是否是文件 | \`os.path.isfile(p)\` | \`Path(p).is_file()\` |
| 文件大小 | \`os.path.getsize(p)\` | \`Path(p).stat().st_size\` |
| 创建目录 | \`os.makedirs(p)\` | \`Path(p).mkdir(parents=True)\` |
| 读取文本 | \`open(p).read()\` | \`Path(p).read_text()\` |
| 列目录 | \`os.listdir(p)\` | \`Path(p).iterdir()\` |
| 递归 glob | \`os.walk + fnmatch\` | \`Path(p).rglob(pattern)\` |

可以看到 pathlib 几乎在所有操作上都更简洁。下面的 demo 会逐个演示。

## 三、Path 对象创建

### demo 1:Path 基本用法

\`\`\`python
from pathlib import Path

# 创建 Path 对象的几种方式
p1 = Path()                 # 当前目录
p2 = Path("file.txt")       # 相对路径
p3 = Path("/home/user/docs") # 绝对路径
p4 = Path("a", "b", "c.txt") # 多段拼接(类似 os.path.join)
p5 = Path("/home") / "user" / "docs"  # 用 / 运算符拼接

print(p1)  # .(当前目录)
print(p2)  # file.txt
print(p3)  # /home/user/docs
print(p4)  # a/b/c.txt(Linux)或 a\\b\\c.txt(Windows)
print(p5)  # /home/user/docs

# Path 对象是不可变的,可以反复使用
p = Path("/data")
q = p / "sub" / "file.txt"
print(q)        # /data/sub/file.txt
print(p)        # /data(p 本身不变)
print(type(p))  # <class 'pathlib.PosixPath'> 或 WindowsPath
\`\`\`

**详细解释**:
- \`Path()\` 不传参数表示当前目录(\`.\`),等同于 \`Path(".")\`。
- \`Path("a", "b", "c")\` 接受多参数,作用类似 \`os.path.join\`,但返回的是 Path 对象。
- 第 8 行:\`Path("/home") / "user"\` 利用了运算符重载——Path 类把 \`/\` 重载成了路径拼接运算符,非常优雅。
- Path 对象**不可变**,拼接会生成新对象,原对象不受影响。
- 在 Linux/macOS 上 \`type(p)\` 是 \`PosixPath\`,在 Windows 上是 \`WindowsPath\`——但通常你不需要关心,直接用 \`Path\` 即可。

## 四、/ 运算符拼接

### demo 2:/ 运算符的灵活性

\`\`\`python
from pathlib import Path

# / 运算符可以拼接 Path 和字符串
base = Path("/data")
path = base / "files" / "report.txt"
print(path)  # /data/files/report.txt

# 左边必须是 Path 对象,右边可以是字符串或 Path
# Path("a") / "b" / Path("c") / "d"  ✅ 合法
path2 = Path("a") / "b" / Path("c") / "d"
print(path2)  # a/b/c/d

# ❌ 错误:左边是字符串,右边是字符串,不能直接用 /
# "a" / "b"  # TypeError: unsupported operand type(s) for /

# 字符串 / Path 也不行
# "a" / Path("b")  # TypeError

# 实用场景:构建日志文件路径
log_dir = Path("/var/log/myapp")
log_file = log_dir / f"app_{20260704}.log"
print(log_file)  # /var/log/myapp/app_20260704.log

# 拼接多个路径段
def build_output_path(base_dir, user, date_str, filename):
    # / 运算符链式拼接,清晰易读
    return Path(base_dir) / user / date_str / filename

print(build_output_path("/output", "alice", "2026-07", "result.json"))
# /output/alice/2026-07/result.json
\`\`\`

**详细解释**:
- \`/\` 运算符**要求左边是 Path 对象**(右边可以是字符串或 Path)。第 13-15 行的错误示例展示了常见陷阱。
- 第 22 行:这种链式拼接是 pathlib 最优雅的地方,相比 \`os.path.join(base, user, date, file)\` 更接近"路径"的直觉。
- 运算符重载让代码读起来像数学公式:\`/var/log/myapp\` 真的就是 \`/\` \`var\` \`log\` \`myapp\`。

## 五、路径属性:.name .stem .suffix .parent .parents .parts

### demo 3:属性访问

\`\`\`python
from pathlib import Path

p = Path("/home/user/docs/report.tar.gz")

# .name:完整文件名(含扩展名)
print(p.name)        # report.tar.gz

# .stem:主名(去掉扩展名,只去最后一个点后的部分)
print(p.stem)        # report.tar

# .suffix:最后一个扩展名(含点)
print(p.suffix)      # .gz

# .suffixes:所有扩展名列表(每个含点)
print(p.suffixes)    # ['.tar', '.gz']

# .parent:父目录(返回 Path 对象)
print(p.parent)      # /home/user/docs

# .parents:所有祖先目录(返回序列)
for ancestor in p.parents:
    print(ancestor)
# 输出:
# /home/user/docs
# /home/user
# /home
# /(根目录)

# .parts:路径的所有组件元组
print(p.parts)       # ('/', 'home', 'user', 'docs', 'report.tar.gz')

# .anchor:路径锚点(根目录或盘符)
print(p.anchor)      # /(Linux) 或 C:\\(Windows)

# 实用场景:遍历祖先找配置文件
def find_config(start_path):
    # 从当前路径向上找,直到找到 config.json
    p = Path(start_path).resolve()
    for ancestor in [p] + list(p.parents):
        cfg = ancestor / "config.json"
        if cfg.exists():
            return cfg
    return None

print(find_config("/home/user/project/src/main.py"))
# 可能找到 /home/user/project/config.json
\`\`\`

**详细解释**:
- \`stem\` 只去掉**最后一个**扩展名,所以 \`report.tar.gz\` 的 stem 是 \`report.tar\` 而不是 \`report\`。要拿到纯主名,可以用 \`p.name.split('.')[0]\`,但要小心 \`.gitignore\` 这种文件。
- \`suffixes\` 返回所有扩展名列表,处理 \`archive.tar.gz\` 这种多扩展名很有用。
- \`parent\` 返回单个 Path,\`parents\` 返回所有祖先的序列(从近到远)。
- 第 30 行:\`parts\` 把路径拆成元组,根目录 \`/\` 也是一个独立组件——这在跨组件拼接时很有用。
- 第 36-44 行:这是一个非常实用的"向上查找配置文件"模式,类似 git 找 \`.git\` 目录的逻辑。

## 六、路径方法:.resolve() .absolute() .exists() .is_file() .is_dir()

### demo 4:常用方法

\`\`\`python
from pathlib import Path

# 假设当前目录是 /home/user
p = Path("docs/report.txt")

# .absolute():转绝对路径(不解析符号链接,不规范化 ..)
print(p.absolute())  # /home/user/docs/report.txt

# .resolve():转绝对路径 + 解析符号链接 + 规范化
print(p.resolve())   # /home/user/docs/report.txt(如果无符号链接)

# .exists():路径是否存在
print(p.exists())    # True 或 False

# .is_file() / .is_dir():判断类型
print(p.is_file())   # True(如果是文件)
print(p.is_dir())    # False

# .is_symlink():是否是符号链接
print(p.is_symlink())

# .stat():获取文件属性(类似 os.stat)
if p.exists():
    stat = p.stat()
    print(f"大小: {stat.st_size} 字节")
    print(f"修改时间: {stat.st_mtime}")
    print(f"权限: {oct(stat.st_mode)}")

# .touch():创建空文件(类似 touch 命令)
new_file = Path("/tmp/pathlib_demo.txt")
new_file.touch()
print(new_file.exists())  # True

# .unlink():删除文件
new_file.unlink()
print(new_file.exists())  # False
\`\`\`

**详细解释**:
- \`absolute()\` 和 \`resolve()\` 的区别:前者只做"基于 cwd 的拼接",后者还会解析 \`..\` 和符号链接。**推荐用 \`resolve()\`**,它更"真实"。
- \`stat()\` 返回一个 \`os.stat_result\` 对象,包含 \`st_size\`、\`st_mtime\`、\`st_mode\` 等,与 \`os.stat()\` 完全一致。
- \`touch()\` 默认只更新时间戳,如果文件不存在则创建空文件。可以传 \`exist_ok=False\` 让已存在时报错。
- \`unlink()\` 是删除文件(\`unlink\` 是 Unix 术语,意为"解除硬链接"),对应 \`os.remove()\`。

## 七、文件读写快捷方式

### demo 5:read_text 一行读取

\`\`\`python
from pathlib import Path

p = Path("/tmp/pathlib_demo.txt")

# 写入文本(默认 UTF-8 编码)
p.write_text("第一行\\n第二行\\n第三行\\n", encoding="utf-8")

# 一行读取所有内容
content = p.read_text(encoding="utf-8")
print(content)
# 第一行
# 第二行
# 第三行

# 写入二进制
p.write_bytes(b"\\x00\\x01\\x02\\x03")

# 读取二进制
data = p.read_bytes()
print(data)  # b'\\x00\\x01\\x02\\x03'

# 注意:write_text 会覆盖原内容,不是追加!
# 如果要追加,还是要用 open
with p.open("a") as f:
    f.write("追加的内容\\n")

# read_text / write_text 会自动关闭文件,适合小文件
# 大文件仍要用 open 逐行读,避免一次性占内存

# 实用场景:读写 JSON 配置
import json
config = {"name": "myapp", "version": "1.0"}
config_path = Path("/tmp/config.json")
config_path.write_text(json.dumps(config, indent=2, ensure_ascii=False))

loaded = json.loads(config_path.read_text())
print(loaded)  # {'name': 'myapp', 'version': '1.0'}
\`\`\`

**详细解释**:
- \`read_text()\` / \`write_text()\` 是**一次性**操作,把整个文件读进内存或写入。对于配置文件、小文本非常方便。
- \`write_text\` 默认**覆盖**原文件,不是追加。第 21-22 行展示了追加内容仍需用 \`open("a")\`。
- 第 27-32 行:这是 pathlib 处理 JSON 配置的典型模式——\`write_text(json.dumps(...))\` 写,\`json.loads(read_text())\` 读,代码极简。
- 大文件(>100MB)不要用 \`read_text\`,会占满内存,要用 \`open\` 逐行读。

## 八、目录操作:.mkdir() .rmdir() .iterdir() .glob() .rglob()

### demo 6:glob 匹配

\`\`\`python
from pathlib import Path

# 假设 /tmp/demo 目录结构:
# /tmp/demo/
# ├── a.txt
# ├── b.txt
# ├── c.log
# └── sub/
#     ├── d.txt
#     └── e.log

# .iterdir():列出目录下所有条目(不递归)
p = Path("/tmp/demo")
for entry in p.iterdir():
    print(entry.name)
# 输出:a.txt, b.txt, c.log, sub(顺序不定)

# .glob(pattern):按模式匹配(不递归,除非用 **)
for f in p.glob("*.txt"):
    print(f.name)  # a.txt, b.txt

# .rglob(pattern):递归匹配所有子目录
for f in p.rglob("*.txt"):
    print(f)  # /tmp/demo/a.txt, /tmp/demo/b.txt, /tmp/demo/sub/d.txt

# glob 也可以用 ** 实现递归
for f in p.glob("**/*.txt"):
    print(f)  # 同 rglob 结果

# .mkdir():创建目录
new_dir = Path("/tmp/new_folder")
new_dir.mkdir(exist_ok=True)  # 已存在不报错

# 创建多级目录
deep_dir = Path("/tmp/a/b/c/d")
deep_dir.mkdir(parents=True, exist_ok=True)

# .rmdir():删除空目录(目录必须为空)
new_dir.rmdir()  # 如果非空会抛 OSError

# .iterdir() 配合判断,实现"列出所有 .py 文件"
py_files = [f for f in p.rglob("*.py") if f.is_file()]
print(f"找到 {len(py_files)} 个 Python 文件")
\`\`\`

**详细解释**:
- \`iterdir()\` 返回生成器,遍历目录下所有条目(文件和子目录都算),不递归。
- \`glob("*.txt")\` 只匹配当前层级,\`rglob("*.txt")\` 递归所有子目录。\`glob("**/*.txt")\` 等价于 \`rglob\`。
- \`mkdir(exist_ok=True)\` 类似 \`os.makedirs(exist_ok=True)\`,已存在时不报错。
- \`mkdir(parents=True)\` 类似 \`os.makedirs\`,会创建所有不存在的父目录。
- \`rmdir()\` 只能删空目录,删非空目录要用 \`shutil.rmtree\`(下章讲)。

## 九、路径变换:.with_suffix() .with_name() .relative_to()

### demo 7:with_suffix 改扩展名

\`\`\`python
from pathlib import Path

p = Path("/data/images/photo.bmp")

# .with_suffix(ext):替换扩展名(返回新 Path,不改原文件)
new_p = p.with_suffix(".png")
print(new_p)  # /data/images/photo.png

# .with_name(name):替换文件名(含扩展名)
new_p2 = p.with_name("thumbnail.jpg")
print(new_p2)  # /data/images/thumbnail.jpg

# .with_stem(stem):替换主名(Python 3.9+)
new_p3 = p.with_stem("backup")
print(new_p3)  # /data/images/backup.bmp

# .relative_to(other):计算相对路径
abs_p = Path("/data/images/photo.bmp")
base = Path("/data")
rel = abs_p.relative_to(base)
print(rel)  # images/photo.bmp

# 实用场景:批量改扩展名
import shutil
src_dir = Path("/data/bmps")
for bmp in src_dir.glob("*.bmp"):
    png = bmp.with_suffix(".png")
    # 这里只是演示路径变换,实际转换要用 Pillow 等库
    print(f"{bmp.name} -> {png.name}")
    # shutil.copy(bmp, png)  # 真正复制

# relative_to 的陷阱:必须是前缀关系
try:
    Path("/home/user").relative_to("/var")
except ValueError as e:
    print(f"非前缀关系: {e}")  # '/home/user' is not in the subpath of '/var'
\`\`\`

**详细解释**:
- \`with_suffix\` / \`with_name\` / \`with_stem\` 都是**返回新 Path 对象**,不会修改原文件。它们用于"计算目标路径",常配合 \`shutil.copy\` 实现批量重命名。
- \`with_suffix(".png")\` 必须以点开头,否则报错。
- \`relative_to\` 要求路径必须是前缀关系,否则抛 \`ValueError\`。比如 \`/home/user\` 不是 \`/var\` 的子路径。
- 第 25-31 行:这是经典的"批量改扩展名"模式——遍历所有 \`.bmp\`,用 \`with_suffix\` 算出目标路径,再处理。

## 十、为什么现代 Python 推荐 pathlib

1. **代码更短**:属性访问比函数嵌套简洁。
2. **可读性更强**:\`p.parent.parent.name\` 比 \`os.path.basename(os.path.dirname(os.path.dirname(p)))\` 直观得多。
3. **面向对象**:路径自带方法,可以链式调用,符合现代编程习惯。
4. **类型友好**:Path 对象在 IDE 中有完整的类型提示,而 \`os.path\` 的字符串参数容易传错。
5. **统一接口**:\`read_text\` / \`write_text\` / \`mkdir\` / \`glob\` 都集成在 Path 上,不用导入多个模块。

**何时仍用 os.path**:
- 维护老代码(兼容 Python 3.3 及以下)。
- 需要极高性能的批处理(\`os.scandir\` 仍比 \`Path.iterdir\` 快一点)。
- 与第三方库交互(它要求字符串路径时,用 \`str(path)\` 转换)。

## 十一、本节小结

- \`Path\` 对象是不可变的,可以安全地复用和传递。
- \`/\` 运算符是路径拼接的优雅方式,但左边必须是 Path。
- 属性 \`name\` / \`stem\` / \`suffix\` / \`parent\` 比对应 \`os.path\` 函数更直观。
- \`read_text\` / \`write_text\` 适合小文件,大文件仍用 \`open\`。
- \`glob\` / \`rglob\` 让目录遍历变得极简,几乎取代了 \`os.walk\` 的简单场景。

下一章我们会深入目录遍历,对比 \`os.walk\`、\`os.scandir\`、\`Path.rglob\` 三种方式的差异和性能。
`,
  },
  {
    id: "pyfile-walk-traverse",
    icon: "🚶",
    title: "目录遍历:os.walk、scandir、rglob",
    group: "路径与目录",
    content: `# 目录遍历:os.walk、scandir、rglob

## 一、引言:为什么需要目录遍历

目录遍历是文件操作的高频场景,典型用途包括:

- **批量处理**:把某个目录下所有 \`.py\` 文件格式化
- **搜索文件**:找所有包含某关键词的文件
- **统计**:统计目录总大小、文件数量、按扩展名分类
- **清理**:删除所有空目录、清理 30 天前的日志
- **同步**:备份目录树到另一个位置

Python 提供了三种主流遍历方式,各有适用场景:

1. \`os.walk\`:经典递归遍历,返回三元组,灵活但稍慢
2. \`os.scandir\`:高效遍历,返回 \`DirEntry\` 带缓存,适合性能敏感场景
3. \`Path.rglob\` / \`Path.glob\`:pathlib 的面向对象方式,代码最简洁

## 二、os.walk 详解

\`os.walk(top, topdown=True, onerror=None, followlinks=False)\` 是最经典的递归遍历函数。

它是一个**生成器**,每次 yield 一个三元组 \`(dirpath, dirnames, filenames)\`:
- \`dirpath\`:当前目录路径(字符串)
- \`dirnames\`:当前目录下所有子目录名列表(不含文件)
- \`filenames\`:当前目录下所有文件名列表(不含目录)

### demo 1:os.walk 打印目录树

\`\`\`python
import os

def print_tree(root_dir, prefix=""):
    """打印目录树,类似 tree 命令"""
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # 计算相对当前层级的深度
        rel = os.path.relpath(dirpath, root_dir)
        depth = 0 if rel == "." else rel.count(os.sep) + 1
        indent = "    " * depth
        print(f"{indent}[{os.path.basename(dirpath) or dirpath}/]")
        # 打印文件
        for fname in filenames:
            print(f"{indent}    {fname}")

# 假设目录结构:
# project/
# ├── src/
# │   ├── main.py
# │   └── utils.py
# └── tests/
#     └── test_main.py

print_tree("/tmp/project")
# 输出:
# [project/]
#     [src/]
#         main.py
#         utils.py
#     [tests/]
#         test_main.py
\`\`\`

**详细解释**:
- \`os.walk\` 默认 \`topdown=True\`,即**先访问父目录,再访问子目录**(广度优先)。
- 每次迭代返回当前目录的信息,然后**自动递归**进入子目录,无需你写递归代码。
- 第 7 行:\`dirpath\` 是完整路径字符串,\`dirnames\` / \`filenames\` 只是名字(不含路径),要拼接完整路径需要 \`os.path.join(dirpath, name)\`。
- 这个 demo 实现了类似 Linux \`tree\` 命令的效果,通过 \`depth\` 控制缩进。

### demo 2:os.walk 统计文件类型

\`\`\`python
import os
from collections import defaultdict

def count_file_types(root_dir):
    """统计每种扩展名的文件数量和总大小"""
    stats = defaultdict(lambda: {"count": 0, "size": 0})
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for fname in filenames:
            full_path = os.path.join(dirpath, fname)
            # 获取扩展名(小写,空扩展名归为 "无扩展名")
            ext = os.path.splitext(fname)[1].lower() or "无扩展名"
            try:
                size = os.path.getsize(full_path)
            except OSError:
                continue  # 文件可能已被删除
            stats[ext]["count"] += 1
            stats[ext]["size"] += size
    return stats

result = count_file_types("/tmp/project")
for ext, info in sorted(result.items(), key=lambda x: -x[1]["size"]):
    print(f"{ext:15} 文件数: {info['count']:5d}  总大小: {info['size']:>12,} 字节")
# 示例输出:
# .py            文件数:     3  总大小:        4,521 字节
# .txt           文件数:     5  总大小:       12,300 字节
# 无扩展名       文件数:     2  总大小:          512 字节
\`\`\`

**详细解释**:
- 第 8-9 行:用 \`defaultdict\` 自动初始化每种扩展名的统计字典,避免 \`if ext not in stats\` 这种啰嗦代码。
- 第 12 行:\`ext or "无扩展名"\` 巧妙处理空字符串——当 \`splitext\` 返回空 ext 时归为"无扩展名"。
- 第 14-15 行:**必须捕获 OSError**!遍历过程中文件可能被其他进程删除,这是生产代码的必备防御。
- 第 22 行:用 \`sorted(..., key=lambda x: -x[1]["size"])\` 按总大小降序排列,方便看哪个类型最占空间。

### demo 3:os.walk 剪枝(修改 dirnames)

\`os.walk\` 的一个强大特性:**修改 \`dirnames\` 列表会影响后续遍历**。从 \`dirnames\` 中删除某项,就不会递归进入那个子目录。这就是"剪枝"。

\`\`\`python
import os

def walk_without_gitignore(root_dir):
    """遍历目录,跳过 .git、node_modules、__pycache__ 等"""
    skip_dirs = {".git", "node_modules", "__pycache__", ".venv", "venv"}
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # 关键:原地修改 dirnames,影响后续遍历
        # 注意:必须用 [:] 切片赋值或原地 remove,不能重新赋值 dirnames = [...]
        dirnames[:] = [d for d in dirnames if d not in skip_dirs]
        # 现在 dirnames 已过滤,后续 os.walk 不会进入这些目录

        for fname in filenames:
            full_path = os.path.join(dirpath, fname)
            print(full_path)

walk_without_gitignore("/tmp/project")
# 不会打印 .git/、node_modules/ 下的任何文件
\`\`\`

**详细解释**:
- 第 7 行:\`dirnames[:]\` 这个**切片赋值**是关键!如果你直接写 \`dirnames = [...]\`,只是重新绑定了局部变量,不会影响 \`os.walk\` 内部的列表。必须**原地修改**才能生效。
- 剪枝的好处:**性能**。如果不剪枝,\`os.walk\` 会进入 \`node_modules\` 遍历几万个文件,极慢。剪枝后直接跳过,快几个数量级。
- 第 6 行 \`skip_dirs\` 用集合(set)而不是列表,因为 \`in\` 操作在集合上是 O(1),列表是 O(n)。
- 这个模式在做"项目代码统计"时极其有用——你可以只统计源码,忽略依赖目录。

## 三、topdown vs bottomup

\`\`\`python
import os

# topdown=True(默认):先父后子(广度优先)
print("=== topdown=True ===")
for dirpath, _, _ in os.walk("/tmp/project", topdown=True):
    print(dirpath)
# 输出:
# /tmp/project
# /tmp/project/src
# /tmp/project/tests

print("=== topdown=False ===")
# topdown=False:先子后父(深度优先,自底向上)
for dirpath, _, _ in os.walk("/tmp/project", topdown=False):
    print(dirpath)
# 输出:
# /tmp/project/src
# /tmp/project/tests
# /tmp/project

# bottomup 的实用场景:删除目录树
# 必须先删子目录(否则父目录非空,rmdir 失败)
def remove_empty_dirs(root):
    """自底向上删除所有空目录"""
    for dirpath, dirnames, filenames in os.walk(root, topdown=False):
        # topdown=False 保证子目录已处理完
        for dirname in dirnames:
            full = os.path.join(dirpath, dirname)
            try:
                os.rmdir(full)  # 只能删空目录
                print(f"删除空目录: {full}")
            except OSError:
                pass  # 目录非空,跳过

remove_empty_dirs("/tmp/old_project")
\`\`\`

**详细解释**:
- \`topdown=True\`(默认)是"父→子"顺序,适合**遍历展示**(先看到父目录,再看到子目录)。
- \`topdown=False\` 是"子→父"顺序,适合**删除场景**——必须先把子目录删空,才能删父目录。
- 第 22-31 行的 \`remove_empty_dirs\` 是经典实用代码:自底向上扫描,遇到空目录就删。这种"清理空目录"的需求在整理文件时非常常见。
- **重要**:\`topdown=False\` 时**不能修改 dirnames**!因为子目录已经被遍历过了,剪枝没意义。

## 四、os.scandir:更高效的遍历

\`os.scandir(path)\` 是 Python 3.5+ 引入的高性能遍历函数,比 \`os.listdir\` 快 2-10 倍。

它返回 \`DirEntry\` 对象的迭代器,每个 \`DirEntry\` 自带缓存:
- \`entry.name\`:文件名
- \`entry.path\`:完整路径
- \`entry.is_file()\` / \`entry.is_dir()\` / \`entry.is_symlink()\`:类型判断(带缓存,不重复 stat)
- \`entry.stat()\`:文件属性(只在第一次调用时真正访问文件系统)

### demo 4:scandir 高效遍历

\`\`\`python
import os

def list_dir_fast(path):
    """用 scandir 高效列出目录内容"""
    with os.scandir(path) as entries:  # 用 with 自动关闭
        for entry in entries:
            if entry.is_dir():
                # is_dir 第一次调用会 stat,结果被缓存
                print(f"[目录] {entry.name}")
            elif entry.is_file():
                print(f"[文件] {entry.name}")
            elif entry.is_symlink():
                print(f"[链接] {entry.name}")

list_dir_fast("/tmp")

# 性能优势示例:统计目录大小
def dir_size(path):
    """递归计算目录总大小"""
    total = 0
    with os.scandir(path) as entries:
        for entry in entries:
            if entry.is_file():
                # DirEntry.stat() 在 Unix 上不会重复系统调用
                total += entry.stat().st_size
            elif entry.is_dir():
                total += dir_size(entry.path)  # 递归子目录
    return total

print(f"目录大小: {dir_size('/tmp/project')} 字节")

# scandir vs listdir 性能对比
import time
def bench_listdir(path):
    start = time.time()
    for _ in range(100):
        for name in os.listdir(path):
            full = os.path.join(path, name)
            if os.path.isfile(full):
                os.path.getsize(full)  # listdir 需要额外 stat
    return time.time() - start

def bench_scandir(path):
    start = time.time()
    for _ in range(100):
        with os.scandir(path) as entries:
            for entry in entries:
                if entry.is_file():
                    entry.stat().st_size  # scandir 自带缓存,无需额外 stat
    return time.time() - start

# 在文件多的目录下,scandir 通常快 2-3 倍
print(f"listdir: {bench_listdir('/tmp'):.3f}s")
print(f"scandir: {bench_scandir('/tmp'):.3f}s")
\`\`\`

**详细解释**:
- \`scandir\` 返回的是**迭代器**(不是列表),惰性求值,内存占用低。建议用 \`with\` 语句确保及时关闭(虽然不强制,但好习惯)。
- \`DirEntry.is_file()\` / \`is_dir()\` 在 **Unix** 上从 \`dirent\` 结构直接读取类型,**不需要额外 stat 系统调用**——这就是它比 \`os.listdir + os.path.isfile\` 快的原因。
- 第 24-32 行:\`dir_size\` 是递归实现,对每个子目录递归调用。注意 \`entry.is_file()\` 判断时如果是符号链接,默认会跟随链接判断目标类型,可传 \`follow_symlinks=False\` 改变。
- 第 47-50 行的 \`bench_scandir\` 中,\`entry.stat().st_size\` 在 Unix 上,**\`entry.stat()\` 第一次调用会读 inode,之后缓存**——而 \`os.listdir + os.path.getsize\` 每次都要重新 stat,这就是性能差异根源。

## 五、pathlib.Path.rglob / glob

### demo 5:rglob 查找所有 .py 文件

\`\`\`python
from pathlib import Path

# 假设目录:
# /project/
# ├── main.py
# ├── utils/
# │   ├── __init__.py
# │   └── helper.py
# └── tests/
#     └── test_main.py

root = Path("/project")

# rglob:递归查找所有 .py 文件
for py_file in root.rglob("*.py"):
    print(py_file)
# 输出:
# /project/main.py
# /project/utils/__init__.py
# /project/utils/helper.py
# /project/tests/test_main.py

# glob 加 ** 也能递归
for py_file in root.glob("**/*.py"):
    print(py_file)
# 结果同上

# glob 不带 ** 只匹配当前层
for f in root.glob("*.py"):
    print(f)  # 只有 /project/main.py

# 查找所有 Python 文件并统计总行数
total_lines = 0
for py_file in root.rglob("*.py"):
    try:
        line_count = sum(1 for _ in py_file.open())
        print(f"{py_file.name}: {line_count} 行")
        total_lines += line_count
    except OSError as e:
        print(f"无法读取 {py_file}: {e}")
print(f"总行数: {total_lines}")

# 用 rglob 找最大的文件
all_files = [f for f in root.rglob("*") if f.is_file()]
if all_files:
    largest = max(all_files, key=lambda f: f.stat().st_size)
    print(f"最大文件: {largest} ({largest.stat().st_size} 字节)")
\`\`\`

**详细解释**:
- \`rglob("*.py")\` 等价于 \`glob("**/*.py")\`,都是递归匹配。推荐用 \`rglob\`,语义更清晰。
- 第 25-31 行:这是非常实用的"统计代码行数"模式。注意 \`py_file.open()\` 返回文件对象,可以直接迭代。
- 第 35-37 行:\`max(all_files, key=lambda f: f.stat().st_size)\` 是 Python 的惯用法——用 \`key\` 函数指定比较依据。但注意:这里每个文件会 stat 一次,如果 \`all_files\` 很大,可以先 \`[(f, f.stat().st_size) for f in all_files]\` 缓存大小再比较。

## 六、三种遍历方式对比

| 方式 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| \`os.walk\` | 灵活、可剪枝、支持 topdown/bottomup | 略慢、返回字符串 | 需要剪枝、自底向上删除 |
| \`os.scandir\` | 性能最高、DirEntry 带缓存 | 需要自己写递归、代码较长 | 性能敏感、超大目录 |
| \`Path.rglob\` | 代码最简洁、面向对象 | 性能略低于 scandir | 日常开发、简单遍历 |

### 性能对比说明

\`\`\`python
import os
import time
from pathlib import Path

def bench_walk(root):
    start = time.time()
    count = 0
    for dirpath, dirnames, filenames in os.walk(root):
        for fname in filenames:
            count += 1
    return count, time.time() - start

def bench_scandir(root):
    start = time.time()
    count = 0
    def recurse(path):
        nonlocal count
        with os.scandir(path) as entries:
            for entry in entries:
                if entry.is_file():
                    count += 1
                elif entry.is_dir():
                    recurse(entry.path)
    recurse(root)
    return count, time.time() - start

def bench_rglob(root):
    start = time.time()
    count = sum(1 for _ in Path(root).rglob("*") if _.is_file())
    return count, time.time() - start

# 测试同一个大目录(例如 /usr/lib)
root = "/usr/lib"
for name, fn in [("walk", bench_walk), ("scandir", bench_scandir), ("rglob", bench_rglob)]:
    count, elapsed = fn(root)
    print(f"{name:8} 文件数: {count:6d}  耗时: {elapsed:.3f}s")
# 典型结果(文件越多差异越明显):
# walk     文件数:  12345  耗时: 0.234s
# scandir  文件数:  12345  耗时: 0.156s
# rglob    文件数:  12345  耗时: 0.198s
\`\`\`

**性能总结**:
- \`scandir\` 最快(通常比 walk 快 30-50%),因为 \`DirEntry\` 缓存了类型信息。
- \`rglob\` 性能介于两者之间,但代码最简洁。
- \`os.walk\` 最慢,但灵活性最高(剪枝、bottomup)。
- **日常开发推荐 \`rglob\`**,代码可读性最重要;**性能敏感场景用 \`scandir\`**。

## 七、综合 demo:递归删除空目录

### demo 6:递归删除空目录

\`\`\`python
import os
from pathlib import Path

def remove_empty_dirs_walk(root):
    """用 os.walk 自底向上删除空目录"""
    removed = []
    # topdown=False:先处理子目录,再处理父目录
    for dirpath, dirnames, filenames in os.walk(root, topdown=False):
        for dirname in dirnames:
            full = os.path.join(dirpath, dirname)
            try:
                os.rmdir(full)  # 只能删空目录
                removed.append(full)
                print(f"删除: {full}")
            except OSError:
                # 目录非空,跳过(这是正常的)
                pass
    return removed

def remove_empty_dirs_rglob(root):
    """用 pathlib 实现(需要先收集再排序,因为 rglob 是自顶向下)"""
    removed = []
    # 收集所有目录,按路径长度降序(深的先删)
    all_dirs = [d for d in Path(root).rglob("*") if d.is_dir()]
    all_dirs.sort(key=lambda p: len(str(p)), reverse=True)
    for d in all_dirs:
        try:
            d.rmdir()  # 空目录才能删
            removed.append(d)
            print(f"删除: {d}")
        except OSError:
            pass
    return removed

# 测试
# 假设 /tmp/cleanup 下有空目录嵌套
removed = remove_empty_dirs_walk("/tmp/cleanup")
print(f"共删除 {len(removed)} 个空目录")
\`\`\`

**详细解释**:
- \`os.walk\` 版本(第 3-15 行)更简洁,因为 \`topdown=False\` 自动保证了子目录先处理。
- \`pathlib\` 版本(第 17-30 行)需要**手动排序**让深目录先处理——\`rglob\` 是自顶向下的,如果不排序,删父目录时子目录可能还没删。
- 第 27 行的 \`len(str(p))\` 是个简单启发式:路径越长通常越深。更精确的可以用 \`len(p.parts)\`。
- \`rmdir()\` / \`os.rmdir()\` 只能删**空**目录,删非空目录会抛 \`OSError\`。这是安全机制,防止误删数据。

## 八、本节小结

- \`os.walk\` 是最灵活的遍历方式,支持剪枝(\`dirnames[:]\`)和自底向上(\`topdown=False\`)。
- \`os.scandir\` 性能最高,\`DirEntry\` 带类型缓存,适合处理超大目录。
- \`Path.rglob\` 代码最简洁,日常开发首选。
- 自底向上遍历(\`topdown=False\`)是删除目录树的正确顺序。
- 遍历时**必须处理 OSError**,因为文件可能被其他进程修改或删除。

下一章我们会学习目录的创建、删除、重命名等操作,以及 \`shutil.rmtree\` 的用法。
`,
  },
  {
    id: "pyfile-dir-ops",
    icon: "📁",
    title: "目录创建、删除与重命名",
    group: "路径与目录",
    content: `# 目录创建、删除与重命名

## 一、引言:目录操作的危险性

目录操作要特别小心,因为:

1. **不可恢复**:Linux 没有"回收站",\`rm -rf\` 之后只能靠备份
2. **递归影响大**:\`rmtree\` 会删除整棵树,误删可能损失大量数据
3. **跨平台差异**:Windows 上文件被占用时无法删除,Unix 可以
4. **权限问题**:某些目录需要管理员权限才能操作

本章系统讲解 Python 中目录的创建、删除、重命名,并强调最佳实践。

## 二、os.mkdir vs os.makedirs

### demo 1:makedirs 创建多级目录

\`\`\`python
import os

# os.mkdir:只创建一层目录,父目录必须已存在
try:
    os.mkdir("/tmp/a/b/c")
except FileNotFoundError as e:
    print(f"mkdir 报错: {e}")
# 报错!因为 /tmp/a/b 不存在

# 正确:先创建父目录
os.mkdir("/tmp/a")          # 成功
os.mkdir("/tmp/a/b")       # 成功(父目录已存在)
os.mkdir("/tmp/a/b/c")     # 成功

# os.makedirs:递归创建所有不存在的目录(类似 mkdir -p)
os.makedirs("/tmp/x/y/z")  # 一次性创建 x、y、z 三层
print(os.path.exists("/tmp/x/y/z"))  # True

# exist_ok 参数(Python 3.2+):目录已存在时不报错
os.makedirs("/tmp/x/y/z", exist_ok=True)  # 不报错,正常返回

# 不加 exist_ok 时,已存在会报错
try:
    os.makedirs("/tmp/x/y/z")  # 默认 exist_ok=False
except FileExistsError as e:
    print(f"已存在: {e}")

# mode 参数:设置目录权限(Unix)
os.makedirs("/tmp/secure_dir", mode=0o700, exist_ok=True)
# 0o700 = rwx------(仅所有者可读写执行)
\`\`\`

**详细解释**:
- \`os.mkdir\` 是"单层创建",父目录不存在直接报 \`FileNotFoundError\`。这是初学者常犯的错误。
- \`os.makedirs\` 是"递归创建",会自动创建所有缺失的中间目录,等同于 \`mkdir -p\`。
- 第 18 行:\`exist_ok=True\` 是现代 Python 的最佳实践——不再需要 \`if not os.path.exists(dir): os.makedirs(dir)\` 这种啰嗦写法。直接 \`makedirs(dir, exist_ok=True)\` 就行,无论存不存在都能工作。
- 第 28 行:\`mode\` 参数只在 Unix 生效,Windows 忽略。\`0o700\` 是八进制(注意前缀 \`0o\`),表示所有者完全权限,其他人无权限。

## 三、os.rmdir vs os.removedirs

### demo 2:rmdir 与 removedirs 对比

\`\`\`python
import os

# 准备测试目录
os.makedirs("/tmp/test_rmdir/a/b/c", exist_ok=True)

# os.rmdir:删除单层目录,目录必须为空
try:
    os.rmdir("/tmp/test_rmdir")  # 非空(含 a/),报错
except OSError as e:
    print(f"非空报错: {e}")

# 必须从最深层开始删
os.rmdir("/tmp/test_rmdir/a/b/c")  # 成功(c 是空的)
os.rmdir("/tmp/test_rmdir/a/b")   # 成功(b 现在空了)
os.rmdir("/tmp/test_rmdir/a")     # 成功(a 现在空了)
os.rmdir("/tmp/test_rmdir")       # 成功(根现在空了)

# os.removedirs:递归删除空的父目录
# 它会删除指定目录,如果父目录也变空了,继续删父目录,直到根
os.makedirs("/tmp/test_rmdirs/a/b/c", exist_ok=True)
os.removedirs("/tmp/test_rmdirs/a/b/c")
# 删 c,然后 b 变空删 b,然后 a 变空删 a,然后 test_rmdirs 变空删 test_rmdirs
# 直到某个父目录非空才停止
print(os.path.exists("/tmp/test_rmdirs"))  # False(全删了)

# removedirs 的陷阱:如果中间某层非空,会停在那一层
os.makedirs("/tmp/mixed/x/y", exist_ok=True)
# 在 x 下放个文件
with open("/tmp/mixed/x/keep.txt", "w") as f:
    f.write("data")
# removedirs 删 y 后,发现 x 非空(有 keep.txt),停止
os.removedirs("/tmp/mixed/x/y")
print(os.path.exists("/tmp/mixed/x"))  # True(x 还在)
print(os.path.exists("/tmp/mixed/x/y"))  # False(y 被删了)
\`\`\`

**详细解释**:
- \`os.rmdir\` 只删**空**目录,非空会抛 \`OSError\`。这是安全机制,防止误删。
- \`os.removedirs\` 是"链式删除":删完目标后,如果父目录变空,继续删父目录,递归向上。但**遇到非空父目录会停止**(不报错)。
- 第 28-34 行的 \`removedirs\` 行为容易让人困惑:它不是"递归删除整棵树",而是"删除一条空的目录链"。如果你想删整棵非空目录树,要用 \`shutil.rmtree\`。
- 实际开发中 \`os.removedirs\` **用得很少**,因为行为不直观。要么用 \`rmdir\` 删单个,要么用 \`rmtree\` 删整棵树。

## 四、os.rename vs os.renames

### demo 3:rename 重命名与移动

\`\`\`python
import os

# os.rename:重命名或移动文件/目录
os.makedirs("/tmp/rename_test", exist_ok=True)

# 创建测试文件
src = "/tmp/rename_test/old_name.txt"
with open(src, "w") as f:
    f.write("hello")

# 重命名(同目录)
dst = "/tmp/rename_test/new_name.txt"
os.rename(src, dst)
print(os.path.exists(src))  # False(原文件没了)
print(os.path.exists(dst))  # True(新名字出现了)

# 移动(跨目录)
os.makedirs("/tmp/rename_test/sub", exist_ok=True)
dst2 = "/tmp/rename_test/sub/moved.txt"
os.rename(dst, dst2)  # 把 new_name.txt 移到 sub/moved.txt
print(os.path.exists(dst2))  # True

# rename 的跨平台差异:
# - Unix:目标已存在会覆盖(原子操作)
# - Windows:目标已存在会报错(FileExistsError)
# 跨平台安全的重命名方式:
if os.path.exists(dst2):
    os.remove(dst2)
os.rename(src, dst2)  # 现在 Windows 上也安全

# os.renames:递归重命名,会自动创建中间目录
# 类似 mv 命令的 --parents 选项
os.renames("/tmp/rename_test/sub/moved.txt",
           "/tmp/rename_test/deep/nested/path/file.txt")
# 自动创建 deep/nested/path 目录
print(os.path.exists("/tmp/rename_test/deep/nested/path/file.txt"))  # True

# shutil.move:更安全的移动(跨文件系统会复制+删除)
import shutil
shutil.move("/tmp/rename_test/deep/nested/path/file.txt",
            "/tmp/rename_test/final.txt")
\`\`\`

**详细解释**:
- \`os.rename\` 同时具备"重命名"和"移动"功能——它只是改变路径,如果新旧路径在不同目录,就是移动。
- 第 19-23 行的**跨平台陷阱**很重要:Unix 上 \`rename\` 默认覆盖目标,Windows 上目标存在则报错。要写跨平台代码,要么先 \`os.remove(dst)\`,要么用 \`shutil.move\`。
- \`os.renames\` 会自动创建中间目录,适合"移动到深层路径"。但行为不直观,实际开发用得少。
- **推荐用 \`shutil.move\`**:它处理了跨文件系统(跨分区)的情况——\`rename\` 在跨文件系统时会失败,\`shutil.move\` 会自动改成"复制+删除"。

## 五、shutil.rmtree:删除整个目录树

\`shutil.rmtree(path, ignore_errors=False, onerror=None)\` 是删除非空目录树的标准方法,类似 \`rm -rf\`。

### demo 4:rmtree 删除目录树

\`\`\`python
import os
import shutil

# 准备一个复杂的目录树
test_root = "/tmp/rmtree_demo"
os.makedirs(test_root + "/sub1/sub2", exist_ok=True)
os.makedirs(test_root + "/empty_dir", exist_ok=True)
with open(test_root + "/file1.txt", "w") as f:
    f.write("content1")
with open(test_root + "/sub1/file2.txt", "w") as f:
    f.write("content2")
with open(test_root + "/sub1/sub2/file3.txt", "w") as f:
    f.write("content3")

# rmtree:删除整棵目录树(包括所有子目录和文件)
shutil.rmtree(test_root)
print(os.path.exists(test_root))  # False(整个目录被删除了)

# ignore_errors=True:遇到错误忽略(不抛异常)
# 适合"尽力删除,删不掉就算了"的场景
os.makedirs(test_root, exist_ok=True)
shutil.rmtree(test_root, ignore_errors=True)

# onerror 回调:更细粒度的错误处理
def on_rmtree_error(func, path, exc_info):
    """rmtree 出错时的回调
    func: 出错的函数(os.listdir, os.path.islink, os.unlink, os.rmdir)
    path: 出错的路径
    exc_info: sys.exc_info() 返回的异常信息元组
    """
    print(f"删除失败: {path} (在 {func.__name__})")
    # 可以尝试修复权限后重试
    import stat
    os.chmod(path, stat.S_IWRITE)  # 加写权限
    func(path)  # 重试

os.makedirs(test_root, exist_ok=True)
# 创建一个只读文件(可能删不掉)
with open(test_root + "/readonly.txt", "w") as f:
    f.write("data")
os.chmod(test_root + "/readonly.txt", 0o444)  # 只读

try:
    shutil.rmtree(test_root, onerror=on_rmtree_error)
except Exception as e:
    print(f"最终还是失败: {e}")
\`\`\`

**详细解释**:
- \`shutil.rmtree\` 是"核武器",删除整棵目录树,**无法恢复**。调用前务必确认路径正确!
- 第 25 行:\`ignore_errors=True\` 是简单粗暴的"忽略所有错误",适合临时清理。但如果你想知道哪些文件删失败了,要用 \`onerror\`。
- 第 28-39 行:\`onerror\` 回调是处理"权限不足"等问题的标准方式。Windows 上常见"文件被占用"错误,可以在 \`onerror\` 里关闭占用进程后重试。
- 第 41-43 行:只读文件在 Windows 上删不掉,需要先 \`os.chmod\` 去掉只读属性再删——这是 \`onerror\` 的典型用例。
- **安全建议**:永远不要对用户输入的路径直接 \`rmtree\`,要先校验路径是否在允许范围内,防止路径注入攻击。

## 六、pathlib 的目录方法

### demo 5:pathlib mkdir

\`\`\`python
from pathlib import Path
import shutil

# Path.mkdir:创建目录
p = Path("/tmp/pathlib_demo_dir")
p.mkdir(exist_ok=True)  # 已存在不报错

# 创建多级目录
deep = Path("/tmp/pathlib_demo_dir/a/b/c")
deep.mkdir(parents=True, exist_ok=True)
# parents=True:类似 makedirs,创建所有中间目录
# exist_ok=True:已存在不报错

# Path.rmdir:删除空目录
deep.rmdir()  # 删 c(必须空)
Path("/tmp/pathlib_demo_dir/a/b").rmdir()  # 删 b
Path("/tmp/pathlib_demo_dir/a").rmdir()    # 删 a
p.rmdir()  # 删根

# pathlib 没有直接删非空目录的方法,仍要用 shutil.rmtree
# 但可以这样组合:
def remove_tree(path):
    """pathlib 风格的 rmtree"""
    p = Path(path)
    if p.exists():
        shutil.rmtree(p)

# Path.rename:重命名/移动(类似 os.rename)
src = Path("/tmp/rename_src.txt")
src.write_text("hello")
dst = src.with_name("rename_dst.txt")
src.rename(dst)  # 重命名
print(dst.exists())  # True

# Path.replace:类似 rename,但目标存在会覆盖(跨平台一致)
src2 = Path("/tmp/replace_src.txt")
src2.write_text("new")
dst.replace(src2)  # 覆盖 dst
print(dst.read_text())  # new

# Path.unlink:删除文件
dst.unlink()
print(dst.exists())  # False
\`\`\`

**详细解释**:
- \`Path.mkdir(parents=True, exist_ok=True)\` 完全等价于 \`os.makedirs(dir, exist_ok=True)\`,这是最常用的创建目录方式。
- \`Path.rmdir()\` 只能删空目录,删非空目录**必须**用 \`shutil.rmtree(path)\`,pathlib 没有提供等价方法。
- \`Path.rename()\` 在不同平台行为不一致(Windows 目标存在会报错),所以**推荐用 \`Path.replace()\`**——它在所有平台上都是"覆盖式重命名",行为一致。
- \`Path.unlink()\` 等价于 \`os.remove()\`,删除文件。\`unlink\` 是 Unix 术语(解除硬链接)。

## 七、目录创建的最佳实践

### demo 6:批量创建目录结构

\`\`\`python
from pathlib import Path
import os

# 传统写法:先判断再创建(啰嗦)
def create_dir_old(path):
    if not os.path.exists(path):
        os.makedirs(path)

# 现代写法:exist_ok=True(简洁)
def create_dir_new(path):
    os.makedirs(path, exist_ok=True)

# 批量创建项目目录结构
def init_project_structure(root):
    """初始化一个 Python 项目目录结构"""
    root = Path(root)
    # 定义目录结构
    dirs = [
        "src",
        "src/utils",
        "src/models",
        "tests",
        "tests/unit",
        "tests/integration",
        "docs",
        "data/raw",
        "data/processed",
        "logs",
        "config",
    ]
    # 创建所有目录
    for d in dirs:
        (root / d).mkdir(parents=True, exist_ok=True)

    # 创建一些占位文件
    files = {
        "README.md": "# Project Name\\n",
        "src/__init__.py": "",
        "src/utils/__init__.py": "",
        "tests/__init__.py": "",
        ".gitignore": "__pycache__/\\n*.pyc\\nvenv/\\n",
        "requirements.txt": "",
    }
    for rel_path, content in files.items():
        (root / rel_path).write_text(content)

    print(f"项目结构已创建于 {root}")

# 执行
init_project_structure("/tmp/my_new_project")

# 验证
for p in Path("/tmp/my_new_project").rglob("*"):
    if p.is_dir():
        print(f"[目录] {p}")
    else:
        print(f"[文件] {p}")
\`\`\`

**详细解释**:
- 第 5-7 行的 \`create_dir_old\` 是**反模式**!先 \`exists\` 再 \`makedirs\` 有 TOCTOU 竞态,而且啰嗦。直接 \`makedirs(exist_ok=True)\` 既安全又简洁。
- 第 15-32 行的 \`init_project_structure\` 是实用代码模板,可以拿来初始化任何 Python 项目。
- 用 \`Path(root) / d\` 拼接路径,然后用 \`parents=True, exist_ok=True\` 一次创建,无论目录是否存在都能工作。
- 第 36-37 行的 \`.gitignore\` 内容用了 \`\\\\n\`(在字符串里是 \`\\n\`),表示换行。注意模板字符串里的转义。

## 八、删除操作的注意事项

### 删除前必备检查清单

\`\`\`python
import os
import shutil
from pathlib import Path

def safe_rmtree(path, allow_root=False):
    """安全的 rmtree,带多重保护"""
    path = Path(path).resolve()  # 转绝对路径,解析符号链接

    # 1. 不允许删除根目录或家目录
    dangerous = ["/", "/home", "/usr", "/etc", "/var", os.path.expanduser("~")]
    if str(path) in dangerous and not allow_root:
        raise ValueError(f"拒绝删除危险路径: {path}")

    # 2. 路径必须有足够深度(至少 3 层),防止误删浅层目录
    if len(path.parts) < 3:
        raise ValueError(f"路径太浅,可能误删: {path}")

    # 3. 二次确认
    print(f"即将删除: {path}")
    print(f"包含 {sum(1 for _ in path.rglob('*') if _.is_file())} 个文件")
    # confirm = input("确认删除?(输入 yes): ")
    # if confirm != "yes":
    #     print("已取消")
    #     return

    # 4. 实际删除
    shutil.rmtree(path)
    print(f"已删除: {path}")

# 测试
# safe_rmtree("/")  # 会拒绝
# safe_rmtree("/tmp/safe_to_delete")  # 正常删除
\`\`\`

**详细解释**:
- 第 5 行:\`resolve()\` 把相对路径转绝对路径并解析符号链接——防止通过符号链接绕过检查。
- 第 8-10 行:维护一个"危险路径"黑名单,这些路径绝对不能删。
- 第 13-15 行:检查路径深度,\`/tmp/x\` 只有 2 部分(\`/\` 和 \`tmp/x\`?不,\`/tmp/x\`.parts 是 \`('/', 'tmp', 'x')\`,3 部分)。这是一个简单启发式。
- 第 18-21 行:交互式确认是生产代码的标配——特别是接受用户输入路径时。
- **永远不要信任用户输入的路径**,这是文件操作的安全铁律。

## 九、本节速查表

| 操作 | os 模块 | pathlib | 说明 |
|------|---------|---------|------|
| 创建单层目录 | \`os.mkdir(p)\` | \`Path(p).mkdir()\` | 父目录必须存在 |
| 创建多级目录 | \`os.makedirs(p, exist_ok=True)\` | \`Path(p).mkdir(parents=True, exist_ok=True)\` | 推荐方式 |
| 删除空目录 | \`os.rmdir(p)\` | \`Path(p).rmdir()\` | 必须空 |
| 删除非空目录树 | \`shutil.rmtree(p)\` | (无,用 shutil) | 不可恢复 |
| 重命名/移动 | \`os.rename(s, d)\` | \`Path(s).rename(d)\` | 跨平台行为不一 |
| 安全重命名 | \`shutil.move(s, d)\` | \`Path(s).replace(d)\` | 推荐方式 |
| 删除文件 | \`os.remove(p)\` | \`Path(p).unlink()\` | 不可恢复 |

## 十、本节小结

- 创建目录永远用 \`makedirs(dir, exist_ok=True)\`,不要先判断再创建。
- 删除空目录用 \`rmdir\`,删除非空目录树必须用 \`shutil.rmtree\`。
- \`rmtree\` 是危险操作,调用前要校验路径,防止误删和路径注入。
- 重命名推荐 \`shutil.move\` 或 \`Path.replace\`,它们跨平台行为一致。
- Windows 上文件被占用会删除失败,需要 \`onerror\` 回调处理。

下一章我们会学习路径与工作目录的关系,理解 \`__file__\`、\`os.getcwd()\`、\`sys.path\` 的作用。
`,
  },
  {
    id: "pyfile-cwd-paths",
    icon: "🧭",
    title: "路径与工作目录:相对/绝对/sys.path",
    group: "路径与目录",
    content: `# 路径与工作目录:相对/绝对/sys.path

## 一、引言:为什么"工作目录"是初学者的噩梦

很多新手写 Python 脚本时会遇到这种诡异现象:

- 在 IDE 里点"运行",程序能找到 \`config.json\`
- 在命令行用 \`python script.py\` 运行,却报 \`FileNotFoundError\`
- 用 cron 定时任务运行,又找不到文件了

**根本原因**:**当前工作目录(cwd)不同**!相对路径是相对于 cwd 解析的,而 cwd 取决于"你在哪里执行命令"。

本章系统讲解工作目录、相对路径、绝对路径、\`__file__\`、\`sys.path\`,帮你彻底搞懂这个坑。

## 二、当前工作目录:os.getcwd() 与 os.chdir()

### demo 1:getcwd 与 chdir

\`\`\`python
import os

# getcwd:获取当前工作目录
print(os.getcwd())
# 例如:/home/user/projects/myapp
# 这取决于你在哪个目录执行 python 命令

# chdir:切换工作目录
print("切换前:", os.getcwd())
os.chdir("/tmp")
print("切换后:", os.getcwd())  # /tmp

# chdir 后,所有相对路径都相对于新 cwd
with open("test.txt", "w") as f:  # 等价于 /tmp/test.txt
    f.write("hello")
print(os.path.abspath("test.txt"))  # /tmp/test.txt

# 切换回原目录
os.chdir("/home/user/projects/myapp")
# 或者保存原目录再切换
original_cwd = os.getcwd()
os.chdir("/tmp")
# ...做一些操作...
os.chdir(original_cwd)  # 切回去

# pathlib 版本:Path.cwd()
from pathlib import Path
print(Path.cwd())  # 等价于 os.getcwd()

# 注意:pathlib 没有 chdir 方法,切换目录仍要用 os.chdir
\`\`\`

**详细解释**:
- \`os.getcwd()\` 返回当前进程的工作目录。这个目录是**进程级**的,改变它会影响整个程序的所有相对路径。
- 第 8-9 行:\`os.chdir("/tmp")\` 后,所有相对路径都相对于 \`/tmp\`。\`open("test.txt")\` 实际打开 \`/tmp/test.txt\`。
- 第 19-23 行:切换目录的"安全模式"——先保存原目录,操作完再切回去。这适合临时去别的目录干活。
- **不推荐频繁用 \`chdir\`**!它会让代码难以追踪——你以为在操作 \`config.json\`,其实在另一个目录。最佳实践是用绝对路径。

## 三、相对路径 vs 绝对路径:陷阱演示

### demo 2:相对路径陷阱

\`\`\`python
import os
from pathlib import Path

# 场景:脚本想读取项目根目录的 config.json
# 文件结构:
# /home/user/myapp/
# ├── config.json
# └── scripts/
#     └── run.py

# ❌ 错误写法:用相对路径
# run.py 内容:
# with open("config.json") as f:  # 相对于 cwd!
#     config = f.read()

# 在 /home/user/myapp 目录执行 python scripts/run.py
# cwd 是 /home/user/myapp,能找到 config.json ✅

# 在 /home/user/myapp/scripts 目录执行 python run.py
# cwd 是 /home/user/myapp/scripts,找不到 config.json ❌

# 在 /tmp 目录执行 python /home/user/myapp/scripts/run.py
# cwd 是 /tmp,找不到 config.json ❌

# 用 abspath 看看相对路径解析到哪里
print(os.path.abspath("config.json"))
# 不同 cwd 下结果不同!

# ✅ 正确写法:基于 __file__ 构造绝对路径
script_dir = os.path.dirname(os.path.abspath(__file__))
# __file__ 是当前脚本的路径
# abspath 把它转成绝对路径
# dirname 取目录部分

# config.json 在上一级目录(项目根)
config_path = os.path.join(script_dir, "..", "config.json")
config_path = os.path.normpath(config_path)  # 规范化,去掉 ..
print(f"配置文件绝对路径: {config_path}")

# pathlib 写法更优雅
script_dir_p = Path(__file__).resolve().parent
config_path_p = script_dir_p.parent / "config.json"
print(f"配置文件路径: {config_path_p}")

# 现在无论在哪个目录执行,都能找到 config.json
with open(config_path) as f:
    config = f.read()
\`\`\`

**详细解释**:
- 第 11-13 行的核心陷阱:相对路径 \`"config.json"\` 是**相对于 cwd** 的,不是相对于脚本文件的!这是 90% 的新手踩坑原因。
- 第 25 行:\`__file__\` 是 Python 内置变量,表示**当前脚本的路径**。注意:它可能是相对路径(取决于如何调用),所以要先 \`abspath\` 或 \`resolve\`。
- 第 26 行:\`os.path.dirname(abspath(__file__))\` 是"获取脚本所在目录"的标准写法。注意必须先 \`abspath\`,否则 \`__file__\` 可能是相对的。
- 第 33-35 行:\`Path(__file__).resolve().parent\` 是 pathlib 等价写法,\`resolve()\` 同时处理了"转绝对"和"解析符号链接"两件事。
- **核心教训**:任何读写文件的代码,**永远用基于 \`__file__\` 的绝对路径**,不要依赖 cwd。

## 四、脚本所在目录:__file__ 与 os.path.dirname

### demo 3:__file__ 定位脚本目录

\`\`\`python
import os
from pathlib import Path

# __file__ 的几种情况
print(f"__file__ = {__file__}")

# 1. 直接运行:python /home/user/myapp/scripts/run.py
# __file__ = /home/user/myapp/scripts/run.py(绝对路径)

# 2. 相对路径运行:cd /home/user/myapp && python scripts/run.py
# __file__ = scripts/run.py(相对路径!需要 abspath)

# 3. 用 -m 运行:python -m scripts.run
# __file__ = /home/user/myapp/scripts/run.py(绝对路径)

# 标准模式:获取脚本所在目录的绝对路径
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
print(f"脚本目录: {SCRIPT_DIR}")

# pathlib 版本
SCRIPT_DIR_P = Path(__file__).resolve().parent
print(f"脚本目录(pathlib): {SCRIPT_DIR_P}")

# 实用场景:定位项目资源文件
# 项目结构:
# /home/user/myapp/
# ├── main.py
# ├── config/
# │   └── settings.json
# ├── data/
# │   └── template.html
# └── static/
#     └── logo.png

# 从 main.py 访问资源文件
PROJECT_ROOT = Path(__file__).resolve().parent  # main.py 所在目录就是项目根
config_file = PROJECT_ROOT / "config" / "settings.json"
template_file = PROJECT_ROOT / "data" / "template.html"
logo_file = PROJECT_ROOT / "static" / "logo.png"

# 现在无论从哪里运行,都能找到这些文件
print(f"配置: {config_file.exists()}")
print(f"模板: {template_file.exists()}")
print(f"Logo: {logo_file.exists()}")

# 子脚本的情况:scripts/process.py 想访问项目根
# scripts/process.py 内容:
# SCRIPT_DIR = Path(__file__).resolve().parent  # /home/user/myapp/scripts
# PROJECT_ROOT = SCRIPT_DIR.parent  # /home/user/myapp
# config = PROJECT_ROOT / "config" / "settings.json"
\`\`\`

**详细解释**:
- \`__file__\` 的值取决于"如何调用脚本":用绝对路径调用就是绝对路径,用相对路径调用就是相对路径。**必须用 \`abspath\` 或 \`resolve\` 统一化**。
- 第 22-26 行:定义 \`SCRIPT_DIR\` 作为全局常量,后续所有路径都基于它,这是大型项目的标准做法。
- 第 39-44 行:对于子目录的脚本,\`SCRIPT_DIR.parent\` 就是项目根——这种"向上找根目录"的模式在大型项目里很常见。
- **进阶**:更复杂的项目可以用 \`Path(__file__).resolve().parent\` 配合循环向上查找 \`pyproject.toml\` 或 \`.git\` 来定位项目根,类似 git 找仓库根的逻辑。

## 五、获取用户目录:os.path.expanduser

### demo 4:expanduser 用户目录

\`\`\`python
import os
from pathlib import Path

# expanduser:展开 ~ 为用户主目录
home = os.path.expanduser("~")
print(f"用户主目录: {home}")
# Linux/macOS: /home/user 或 /Users/user
# Windows: C:\\Users\\user

# 拼接路径
documents = os.path.join(home, "Documents")
print(f"文档目录: {documents}")

# 配置文件路径
config_file = os.path.join(home, ".myapp", "config.json")
print(f"配置文件: {config_file}")

# pathlib 版本更简洁:Path.home()
home_p = Path.home()
print(f"用户主目录(pathlib): {home_p}")

config = home_p / ".myapp" / "config.json"
print(f"配置文件(pathlib): {config}")

# 实用场景:跨平台存储配置文件
def get_config_dir(app_name):
    """获取应用配置目录(跨平台)"""
    home = Path.home()
    if os.name == "nt":  # Windows
        # Windows 习惯用 AppData/Roaming
        base = home / "AppData" / "Roaming"
    else:  # Unix
        # Unix 习惯用点开头的小写目录
        base = home / f".{app_name.lower()}"
    config_dir = base / app_name
    config_dir.mkdir(parents=True, exist_ok=True)
    return config_dir

cfg_dir = get_config_dir("MyApp")
print(f"应用配置目录: {cfg_dir}")
\`\`\`

**详细解释**:
- \`os.path.expanduser("~")\` 是跨平台获取用户主目录的标准方式。它内部会读 \`$HOME\`(Unix)或 \`%USERPROFILE%\`(Windows)。
- 第 18 行:\`Path.home()\` 是 pathlib 等价方法,Python 3.5+ 引入,更简洁。
- 第 24-37 行的 \`get_config_dir\` 是实用模式——不同操作系统配置文件位置不同:Unix 习惯 \`~/.appname/\`,Windows 习惯 \`AppData/Roaming/appname/\`。这种"按平台选目录"的逻辑在桌面应用开发中很常见。
- 注意:不要硬编码 \`/home/user\`,不同用户名不同,\`expanduser\` 才是正解。

## 六、环境变量路径:os.environ

### demo 5:从环境变量获取路径

\`\`\`python
import os
from pathlib import Path

# 常见的环境变量
# Linux/macOS:
#   HOME: 用户主目录
#   PATH: 可执行文件搜索路径
#   TMPDIR: 临时目录
#   XDG_CONFIG_HOME: 配置目录(遵循 XDG 规范)

# Windows:
#   USERPROFILE: 用户主目录
#   APPDATA: 应用数据目录
#   TEMP / TMP: 临时目录
#   PATH: 可执行文件搜索路径

# 读取环境变量(推荐用 os.environ.get,不存在返回 None)
home = os.environ.get("HOME") or os.environ.get("USERPROFILE")
print(f"主目录(环境变量): {home}")

tmpdir = os.environ.get("TMPDIR") or os.environ.get("TEMP") or "/tmp"
print(f"临时目录: {tmpdir}")

# 实用场景:遵循 XDG 规范(Unix)
def get_xdg_config_home():
    """获取 XDG 配置目录(默认 ~/.config)"""
    xdg_config = os.environ.get("XDG_CONFIG_HOME")
    if xdg_config:
        return Path(xdg_config)
    return Path.home() / ".config"

config_dir = get_xdg_config_home()
print(f"XDG 配置目录: {config_dir}")

# 设置环境变量(仅当前进程有效)
os.environ["MY_APP_DEBUG"] = "1"
print(os.environ.get("MY_APP_DEBUG"))  # 1

# 临时设置环境变量(用 with 语句)
from contextlib import contextmanager

@contextmanager
def env_var(key, value):
    """临时设置环境变量"""
    old = os.environ.get(key)
    os.environ[key] = value
    try:
        yield
    finally:
        if old is None:
            os.environ.pop(key, None)  # 原本不存在,删除
        else:
            os.environ[key] = old  # 恢复原值

# 使用:临时切换 PATH
with env_var("MY_APP_MODE", "test"):
    print(os.environ["MY_APP_MODE"])  # test
print(os.environ.get("MY_APP_MODE"))  # None(已恢复)
\`\`\`

**详细解释**:
- 第 14-19 行:\`os.environ.get("X") or fallback\` 是处理"多个候选环境变量"的惯用法——先试 \`HOME\`(Unix),没有再试 \`USERPROFILE\`(Windows)。
- 第 28-35 行的 XDG 规范是 Linux 桌面应用的标准:\`$XDG_CONFIG_HOME\` 存在就用它,否则默认 \`~/.config\`。优秀的 Linux 应用应该遵循这个规范。
- 第 40-58 行的 \`env_var\` 上下文管理器是测试中常用的模式——临时设置环境变量,测试完自动恢复,不污染全局状态。
- 注意 \`os.environ[key] = value\` 设置的环境变量**仅对当前进程及子进程有效**,不会影响父进程或系统。

## 七、sys.path 与模块搜索路径

### demo 6:理解 sys.path

\`\`\`python
import sys
import os

# sys.path:Python 模块搜索路径列表
print("=== sys.path 内容 ===")
for i, p in enumerate(sys.path):
    print(f"{i}: {p}")

# 典型内容:
# 0: (空字符串,表示当前目录)
# 1: /usr/lib/python3.x
# 2: /usr/lib/python3.x/lib-dynload
# 3: /home/user/.local/lib/python3.x/site-packages
# 4: ... 其他第三方库路径

# Python 导入模块时,按顺序在这些目录查找
# import mymodule -> 找 mymodule.py 或 mymodule/

# 临时添加搜索路径(只对当前进程有效)
sys.path.insert(0, "/home/user/my_libs")
# 现在 import 会优先在 /home/user/my_libs 查找

# 实用场景:让脚本能找到同级模块
# 项目结构:
# /home/user/myapp/
# ├── main.py
# ├── utils.py
# └── subpackage/
#     └── helper.py

# 在 main.py 中:
# import utils  # 能找到(因为 cwd 通常在脚本目录)

# 但如果从其他目录运行,可能找不到
# 解决:动态添加项目根到 sys.path
import os
import sys

# 方式 1:手动添加(简单粗暴)
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT_ROOT)
# 现在 import utils 总能找到

# 方式 2:用 PYTHONPATH 环境变量(更推荐)
# export PYTHONPATH=/home/user/myapp
# 然后 python main.py

# 方式 3:把项目装成包(pip install -e .)
# 这是最规范的方式,适合正式项目
\`\`\`

**详细解释**:
- \`sys.path\` 是 Python 导入系统的核心——\`import\` 语句就是按这个列表顺序查找模块。
- 第 7 行:\`sys.path[0]\` 通常是空字符串,表示"当前工作目录"。这也是为什么在脚本所在目录能直接 \`import utils\`——但**只在 cwd 是脚本目录时有效**,这就是新手"换个地方就 import 失败"的原因。
- 第 19 行:\`sys.path.insert(0, ...)\` 把路径加到最前面,优先级最高。\`insert\` 而不是 \`append\`,是为了让你的模块优先于系统模块。
- 第 35-39 行的"方式 2"是更规范的做法:\`PYTHONPATH\` 环境变量会在 Python 启动时自动加入 \`sys.path\`,不需要改代码。
- **大型项目推荐"方式 3"**:把项目做成一个可安装的包(\`pyproject.toml\` + \`pip install -e .\`),这样 \`import\` 永远能找到,且符合 Python 生态规范。

## 八、跨平台路径分隔符

### demo 7:os.sep 跨平台

\`\`\`python
import os
from pathlib import Path

# 路径分隔符
print(f"os.sep = {repr(os.sep)}")        # '/' (Unix) 或 '\\\\' (Windows)
print(f"os.altsep = {repr(os.altsep)}")  # '/' (Windows 上有,Unix 上为 None)
print(f"os.linesep = {repr(os.linesep)}")  # '\\n' (Unix) 或 '\\r\\n' (Windows)

# 实用场景:处理来自其他系统的路径字符串
# 比如解析 Windows 路径(在 Linux 上)
win_path = "C:\\\\Users\\\\alice\\\\Documents\\\\file.txt"
# 在 Linux 上直接用 os.path.join 会出问题
# 但用 split + sep 可以解析
parts = win_path.replace("\\\\", os.sep).split(os.sep)
print(parts)
# Linux 上: ['C:', 'Users', 'alice', 'Documents', 'file.txt']

# 换行符陷阱:文本文件换行符不同
# Unix: \\n
# Windows: \\r\\n
# Python 的 open 默认会做"通用换行"转换:
with open("/tmp/test_lines.txt", "w", newline="") as f:
    f.write("line1\\nline2\\nline3\\n")  # 写入原始 \\n

# 读取时,默认会把 \\r\\n 转成 \\n(universal newlines)
with open("/tmp/test_lines.txt", "r") as f:
    for line in f:
        print(repr(line))  # 'line1\\n', 'line2\\n', 'line3\\n'

# 跨平台拼接路径的最佳实践
# ❌ 错误:硬编码分隔符
# path = "folder" + "/" + "file"  # Windows 上有问题

# ✅ 正确:用 os.path.join 或 pathlib
path1 = os.path.join("folder", "sub", "file.txt")  # 自动用正确分隔符
path2 = Path("folder") / "sub" / "file.txt"  # pathlib 也自动处理

# 处理跨平台路径字符串
def normalize_path(path_str):
    """把任意系统的路径字符串转成当前系统的 Path"""
    # 替换所有可能的分隔符
    path_str = path_str.replace("\\\\", "/").replace("\\\\", "/")
    return Path(path_str)

# 测试
print(normalize_path("C:\\\\Users\\\\alice"))  # 在 Linux 上变成 C:/Users/alice
print(normalize_path("/home/alice"))           # 保持不变
\`\`\`

**详细解释**:
- 第 4-6 行:\`os.sep\` 是当前系统的分隔符(Unix 是 \`/\`,Windows 是 \`\\\`),\`os.altsep\` 是备用分隔符(Windows 上是 \`/\`,Unix 上是 \`None\`)。
- 第 9-15 行:处理来自其他系统的路径字符串是个麻烦事。最简单的方法是把所有可能的分隔符(\`/\` 和 \`\\\`)替换成 \`/\`,然后让 \`Path\` 处理——\`Path\` 在 Windows 上能识别 \`/\`,在 Unix 上也能(虽然 Unix 文件名可以含 \`\\\`,但很少见)。
- 第 17-34 行的换行符问题:Python 的 \`open\` 默认开启"通用换行"模式,会自动把 \`\\r\\n\` 转成 \`\\n\`。如果你要读写二进制或保留原始换行符,用 \`newline=""\` 关闭转换。
- **最佳实践**:**永远不要硬编码分隔符**,用 \`os.path.join\` 或 \`pathlib\`,它们会自动选择正确分隔符。

## 九、综合最佳实践:用 __file__ + pathlib 定位资源文件

### demo 8:终极方案

\`\`\`python
import os
import sys
from pathlib import Path

# ========== 标准模板:在任何 Python 项目里都适用 ==========

# 1. 获取脚本所在目录(绝对路径,跨 cwd)
SCRIPT_DIR = Path(__file__).resolve().parent

# 2. 获取项目根目录(假设脚本在 src/ 或 scripts/ 下)
# 向上查找 pyproject.toml 或 .git 作为项目根标志
def find_project_root(start=SCRIPT_DIR):
    """从 start 向上查找项目根目录"""
    markers = ["pyproject.toml", "setup.py", ".git", "setup.cfg"]
    for path in [start] + list(start.parents):
        for marker in markers:
            if (path / marker).exists():
                return path
    return start  # 找不到就用脚本目录

PROJECT_ROOT = find_project_root()

# 3. 定义常用路径(全部基于 PROJECT_ROOT,绝对路径)
CONFIG_DIR = PROJECT_ROOT / "config"
DATA_DIR = PROJECT_ROOT / "data"
LOG_DIR = PROJECT_ROOT / "logs"
OUTPUT_DIR = PROJECT_ROOT / "output"

# 4. 确保目录存在
for d in [CONFIG_DIR, DATA_DIR, LOG_DIR, OUTPUT_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# 5. 资源文件路径(完全独立于 cwd)
config_file = CONFIG_DIR / "settings.json"
data_file = DATA_DIR / "input.csv"
log_file = LOG_DIR / f"app_{20260704}.log"

print(f"脚本目录: {SCRIPT_DIR}")
print(f"项目根: {PROJECT_ROOT}")
print(f"配置文件: {config_file}")
print(f"数据文件: {data_file}")
print(f"日志文件: {log_file}")

# 6. 使用时,无论从哪个 cwd 运行都能找到文件
# with open(config_file) as f:
#     settings = json.load(f)

# ========== 跨平台临时文件 ==========
import tempfile

# 用 tempfile 而不是硬编码 /tmp
with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
    f.write("临时数据")
    temp_path = Path(f.name)
print(f"临时文件: {temp_path}")
# 跨平台:Unix 上在 /tmp/,Windows 上在 %TEMP%/
temp_path.unlink()  # 用完删除

# ========== 用户级配置(跨平台) ==========
def get_user_config_dir(app_name):
    """获取用户级配置目录(跨平台)"""
    home = Path.home()
    if os.name == "nt":  # Windows
        return home / "AppData" / "Roaming" / app_name
    elif sys.platform == "darwin":  # macOS
        return home / "Library" / "Application Support" / app_name
    else:  # Linux 等,遵循 XDG
        xdg = os.environ.get("XDG_CONFIG_HOME")
        return Path(xdg) / app_name if xdg else home / ".config" / app_name

user_config = get_user_config_dir("MyApp")
user_config.mkdir(parents=True, exist_ok=True)
print(f"用户配置目录: {user_config}")
\`\`\`

**详细解释**:
- 第 8 行:\`Path(__file__).resolve().parent\` 是获取脚本目录的**标准模板**,记住这个组合。
- 第 12-21 行的 \`find_project_root\` 是大型项目的实用代码:向上查找 \`pyproject.toml\` 或 \`.git\` 作为项目根标志。这样无论脚本嵌套多深,都能找到项目根。
- 第 24-27 行:把常用目录定义为常量,代码里只用这些常量,不直接写路径字符串——这是大型项目的可维护性关键。
- 第 41-50 行:\`tempfile.NamedTemporaryFile\` 是跨平台创建临时文件的标准方式,自动放在系统临时目录(Unix \`/tmp\`,Windows \`%TEMP%\`)。
- 第 53-62 行的 \`get_user_config_dir\` 是桌面应用的标配——不同平台配置文件位置不同,这个函数封装了所有平台逻辑。

## 十、本节速查表

| 操作 | 代码 | 说明 |
|------|------|------|
| 获取 cwd | \`os.getcwd()\` / \`Path.cwd()\` | 当前工作目录 |
| 切换 cwd | \`os.chdir(path)\` | 影响整个进程 |
| 脚本目录 | \`Path(__file__).resolve().parent\` | 推荐方式 |
| 用户主目录 | \`Path.home()\` | 跨平台 |
| 展开 \`~\` | \`os.path.expanduser("~")\` | 等价 Path.home() |
| 环境变量 | \`os.environ.get("X")\` | 不存在返回 None |
| 模块搜索路径 | \`sys.path\` | 列表,可修改 |
| 路径分隔符 | \`os.sep\` | \`/\` 或 \`\\\` |
| 换行符 | \`os.linesep\` | \`\\n\` 或 \`\\r\\n\` |
| 临时目录 | \`tempfile.gettempdir()\` | 跨平台 |

## 十一、本节小结

- **永远用 \`__file__\` 定位资源文件**,不要依赖 cwd——这是避免"换个地方运行就找不到文件"的根本方法。
- \`os.chdir\` 会改变整个进程的 cwd,慎用,会让代码难以追踪。
- \`os.path.expanduser("~")\` 或 \`Path.home()\` 是获取用户主目录的跨平台方式。
- \`sys.path\` 控制 \`import\` 的查找路径,正式项目用 \`pip install -e .\` 规范管理。
- 跨平台处理路径用 \`pathlib\`,它自动处理分隔符差异,代码最简洁。

到这里,「路径与目录」分组的 5 章就结束了。下一批章节我们会进入「文件读写」分组,学习文本/二进制读写、CSV、JSON、序列化等实战内容。
`,
  },
];
