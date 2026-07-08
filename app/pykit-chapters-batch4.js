// =============================================================
// Python 开发常用知识点（pykit）—— 第四批章节
// 主题：文件与路径操作（共 5 章：第 16 ~ 20 章）
// 转义规则：content / code 内部反引号写作 \`，\${ 写作 \$\{，
//           反斜杠转义序列（如 \n \t）写作 \\n \\t，避免被 JS 模板字符串吞掉。
// =============================================================

export const chapters = [
  // =============================================================
  // 第16章：路径操作 pathlib
  // =============================================================
  {
    id: "pykit-16",
    group: "文件与路径操作",
    icon: "📁",
    title: "路径操作 pathlib",
    content: `# 路径操作 pathlib

## 一、为什么需要 pathlib

处理文件路径是 Python 开发里最高频的操作之一：读配置、写日志、遍历目录、拼接路径、判断文件是否存在……在 Python 3.4 之前，路径操作主要靠 \`os.path\` 模块的一堆函数，写出来又长又碎：

\`\`\`python
import os
# 拼接路径
p = os.path.join("/home", "user", "demo.txt")
# 取文件名
name = os.path.basename(p)
# 取扩展名
suffix = os.path.splitext(p)[1]
# 判断是否文件
is_file = os.path.isfile(p)
\`\`\`

这种写法的问题在于：**路径只是一个字符串**，所有操作都散落在 \`os.path\` 的不同函数里，调用时还得把字符串传来传去，可读性差、容易拼错。

Python 3.4 引入的 \`pathlib\` 把路径抽象成一个 \`Path\` **对象**，把所有路径相关的操作封装成方法与属性，代码瞬间清爽：

\`\`\`python
from pathlib import Path
p = Path("/home/user/demo.txt")   # 一次构造，到处复用
name = p.name                      # 属性取文件名
suffix = p.suffix                  # 属性取扩展名
is_file = p.is_file()              # 方法判断是否文件
\`\`\`

**结论**：新项目优先用 \`pathlib\`，老代码维护时再用 \`os.path\`。本章几乎所有示例都用 \`Path\` 对象。

## 二、创建 Path 对象

\`Path\` 构造函数接收一个或多个路径片段，可以是绝对路径也可以是相对路径：

\`\`\`python
from pathlib import Path

p1 = Path("/home/user/demo.txt")        # 绝对路径
p2 = Path("demo.txt")                   # 相对路径（相对于当前工作目录）
p3 = Path("a", "b", "c.txt")            # 多段拼接，等价于 a/b/c.txt
p4 = Path()                              # 表示当前目录（.）
p5 = Path.home()                         # 用户主目录，如 /Users/yourname
p5 = Path.cwd()                          # 当前工作目录
\`\`\`

几个常用类方法：

| 方法 | 含义 | 示例 |
|------|------|------|
| \`Path.cwd()\` | 当前工作目录 | \`Path('/Users/me/project')\` |
| \`Path.home()\` | 用户主目录 | \`Path('/Users/me')\` |

注意 \`Path\` 不会校验路径是否真实存在——它只是对字符串的封装。即使 \`Path("/不存在/abc.txt")\` 也能正常构造，调用 \`exists()\` 时才返回 \`False\`。

## 三、/ 运算符拼接路径

\`pathlib\` 最优雅的设计之一：**用 \`/\` 运算符拼接路径**，告别 \`os.path.join\` 的冗长：

\`\`\`python
from pathlib import Path

base = Path("/data")
# 用 / 逐级拼接
log = base / "logs" / "2026" / "app.log"
print(log)  # /data/logs/2026/app.log
\`\`\`

要点：

- 左操作数必须是 \`Path\`，右操作数可以是字符串或 \`Path\`。
- 跨平台自动用正确的分隔符（Windows 是反斜杠，Unix 是 \`/\`）。
- 如果右侧是绝对路径（以 \`/\` 开头），会**覆盖**左侧：

\`\`\`python
Path("a") / "/b" / "c"   # PosixPath('/b/c')，左侧被丢弃
\`\`\`

这是一个容易踩的坑：从配置读到的路径如果以 \`/\` 开头，拼接结果会出乎意料。拼接相对路径片段时不要带前导 \`/\`。

## 四、路径属性：parent / name / stem / suffix / parts

\`Path\` 提供了一组只读属性，拆解路径各部分：

\`\`\`python
p = Path("/data/logs/2026/app.log")

p.parent      # Path('/data/logs/2026')  父目录
p.name        # 'app.log'                最后一段
p.stem        # 'app'                    文件名去掉扩展名
p.suffix      # '.log'                   扩展名（含点）
p.suffixes    # ['.log']                 多段扩展名列表
p.parts       # ('/', 'data', 'logs', '2026', 'app.log')  各部分元组
p.anchor      # '/'                      路径根（盘符或 /）
\`\`\`

对照表：

| 属性 | 示例值 | 含义 |
|------|--------|------|
| \`parent\` | \`/data/logs/2026\` | 上一级目录 |
| \`parents\` | 迭代器，依次给出所有祖先 | \`p.parents[0]\` = 父，\`p.parents[1]\` = 祖父 |
| \`name\` | \`app.log\` | 文件名（含扩展） |
| \`stem\` | \`app\` | 文件名（不含扩展） |
| \`suffix\` | \`.log\` | 扩展名 |
| \`parts\` | 元组 | 拆成段 |

衍生方法（返回新的 \`Path\`，不修改原对象）：

\`\`\`python
p.with_name("error.log")      # 改文件名 → /data/logs/2026/error.log
p.with_stem("error")          # 改 stem → /data/logs/2026/error.log
p.with_suffix(".txt")         # 改扩展名 → /data/logs/2026/app.txt
p.parent.parent               # 链式取祖先 → /data/logs
\`\`\`

这些 \`with_*\` 方法在批量重命名时极为好用——下一节实战会用到。

## 五、判断：exists / is_file / is_dir

\`\`\`python
from pathlib import Path

p = Path("demo.txt")
p.exists()      # 路径是否存在（文件或目录）
p.is_file()     # 是否为普通文件
p.is_dir()      # 是否为目录
p.is_symlink()  # 是否为符号链接
\`\`\`

注意：

- 对不存在的路径，\`is_file()\` 和 \`is_dir()\` 都返回 \`False\`（不会抛异常）。
- 存在"检查 + 操作"的竞态条件（TOCTOU）：先 \`exists()\` 再 \`open()\` 之间文件可能被删。更稳妥的做法是直接操作并用 \`try/except FileNotFoundError\` 兜底。

\`\`\`python
# 不推荐：竞态条件
if p.exists():
    text = p.read_text()

# 推荐：直接读，捕获异常
try:
    text = p.read_text()
except FileNotFoundError:
    text = ""
\`\`\`

## 六、创建与删除：mkdir / rmdir / unlink

\`\`\`python
p = Path("data/logs")

# 创建目录
p.mkdir(parents=True, exist_ok=True)
# parents=True：父目录不存在一并创建（类似 mkdir -p）
# exist_ok=True：目录已存在不报错（默认 False 会抛 FileExistsError）

# 删除文件
Path("data/logs/app.log").unlink(missing_ok=True)
# missing_ok=True：文件不存在不报错（Python 3.8+）

# 删除空目录
Path("data/logs").rmdir()   # 目录必须为空，否则抛 OSError
\`\`\`

\`rmdir\` 只能删空目录。要递归删除整个目录树，用 \`shutil.rmtree(p)\`。

常见坑：

- \`mkdir\` 不加 \`exist_ok=True\`，目录已存在时会抛 \`FileExistsError\`。
- \`unlink\` 默认文件不存在会抛异常，加 \`missing_ok=True\` 更健壮。
- \`rmdir\` 删非空目录会失败，不要拿它当 \`rm -rf\` 用。

## 七、glob 模式匹配

\`Path.glob(pattern)\` 在**当前目录**按通配符匹配，返回一个生成器：

\`\`\`python
from pathlib import Path

p = Path(".")
list(p.glob("*.py"))          # 当前目录所有 .py 文件
list(p.glob("test_*.py"))     # 以 test_ 开头的 py 文件
list(p.glob("data/*.csv"))    # data 子目录下所有 csv
list(p.glob("*.[!t]*"))       # 扩展名不以 t 开头的文件
\`\`\`

通配符规则：

| 通配符 | 含义 | 示例 |
|--------|------|------|
| \`*\` | 任意多个字符（不含路径分隔符） | \`*.py\` |
| \`?\` | 单个字符 | \`?.txt\` |
| \`[abc]\` | 字符集合 | \`[abc].log\` |
| \`[!abc]\` | 取反 | \`[!0-9].txt\` |
| \`**\` | 递归任意层目录 | \`**/*.py\` |

注意：\`*\` 不会跨目录匹配。要匹配 \`src/a/b.py\` 这种多层，用 \`**/*.py\`。

## 八、rglob 递归查找

\`Path.rglob(pattern)\` 等价于 \`glob("**/" + pattern)\`，递归查找所有子孙层：

\`\`\`python
from pathlib import Path

root = Path(".")
# 递归找出所有 .py 文件
for f in root.rglob("*.py"):
    print(f, f.stat().st_size)
\`\`\`

\`rglob\` 是项目里最常用的"找文件"工具：找配置、找日志、统计代码量。它返回的是 \`Path\` 对象，可以直接接 \`.read_text()\`、\`.stat()\` 等方法。

性能提示：\`glob\` / \`rglob\` 返回生成器，**惰性求值**。用 \`list()\` 一次性物化会占用内存；遍历大目录时建议直接 \`for\` 循环，边遍历边处理。

## 九、read_text / write_text 便捷读写

\`Path\` 内置了文本读写快捷方法，省去 \`open(...)\` 的样板：

\`\`\`python
from pathlib import Path

p = Path("note.txt")
p.write_text("第一行\\n第二行\\n", encoding="utf-8")  # 一次性写入
text = p.read_text(encoding="utf-8")                  # 一次性读出
lines = text.splitlines()                             # 按行切列表

# 二进制
p.write_bytes(b"\\x00\\x01")                            # 写二进制
data = p.read_bytes()                                 # 读二进制
\`\`\`

适用场景：

- **小文件**：配置、笔记、脚本，一次读写最方便。
- **大文件不要用**：\`read_text\` 会把整个文件加载进内存。处理 GB 级日志要用 \`open()\` 逐行读（见第 17 章）。

\`read_text\` 默认编码在不同平台不一致（Windows 是 GBK，Linux 是 UTF-8），**显式传 \`encoding="utf-8"\` 是好习惯**，避免跨平台乱码。

## 十、Path vs os.path 对照表

| 操作 | os.path | pathlib |
|------|---------|---------|
| 拼接 | \`os.path.join(a, b)\` | \`Path(a) / b\` |
| 文件名 | \`os.path.basename(p)\` | \`Path(p).name\` |
| 目录名 | \`os.path.dirname(p)\` | \`Path(p).parent\` |
| 扩展名 | \`os.path.splitext(p)[1]\` | \`Path(p).suffix\` |
| 是否存在 | \`os.path.exists(p)\` | \`Path(p).exists()\` |
| 是否文件 | \`os.path.isfile(p)\` | \`Path(p).is_file()\` |
| 建目录 | \`os.makedirs(p)\` | \`Path(p).mkdir(parents=True)\` |
| 列目录 | \`os.listdir(p)\` | \`Path(p).iterdir()\` |
| 递归找 | \`os.walk(p)\` | \`Path(p).rglob("*")\` |
| 文件大小 | \`os.path.getsize(p)\` | \`Path(p).stat().st_size\` |

可以看到 \`pathlib\` 几乎在每一项上都更简洁。两者可以混用：\`Path\` 对象能传给很多 \`os\` 函数（因为它实现了 \`__fspath__\`）。

## 十一、常见坑与最佳实践

1. **\`/\` 右侧带前导 \`/\`**：\`Path("a") / "/b"\` 结果是 \`/b\`，左侧被丢弃。从配置读路径要 \`strip()\`。
2. **忘记 \`exist_ok=True\`**：重复运行脚本创建目录会报 \`FileExistsError\`。
3. **\`read_text\` 不指定编码**：跨平台乱码。统一 \`encoding="utf-8"\`。
4. **拿 \`rmdir\` 删非空目录**：会抛异常，用 \`shutil.rmtree\`。
5. **\`glob\` 结果当列表多次遍历**：生成器只能遍历一次，需要复用就 \`list()\`。
6. **相对路径的基准**：\`Path("a.txt")\` 相对于 \`Path.cwd()\`，运行目录变了就找不到。脚本里尽量用绝对路径或基于 \`__file__\` 定位。

## 十二、实战 demo 说明

本章代码演示两个真实场景：

- **批量重命名**：把 \`IMG_000.JPG\` 这类相机命名统一改成 \`photo_1.jpg\`（扩展名小写、序号从 1 开始）。用 \`glob\` 找文件、\`with_name\` 生成新名、\`rename\` 执行。
- **统计目录大小**：递归遍历所有文件累加 \`stat().st_size\`，模拟磁盘占用统计工具。

为了不污染项目目录，代码用 \`tempfile.mkdtemp()\` 创建临时工作目录，演示结束用 \`shutil.rmtree\` 清理。你可以直接点运行查看效果。

## 本章小结

- \`pathlib.Path\` 用面向对象的方式封装路径，比 \`os.path\` 更简洁、更安全。
- \`/\` 运算符拼接路径，\`parent/name/stem/suffix\` 拆解路径。
- \`exists/is_file/is_dir\` 判断状态，\`mkdir/unlink/rmdir\` 增删。
- \`glob\` 当前层匹配，\`rglob\` 递归查找，\`**\` 通配任意层。
- \`read_text/write_text\` 适合小文件，大文件留给 \`open\` 逐行处理。
- 新代码优先 \`pathlib\`，老代码维护再用 \`os.path\`。

下一章我们深入 \`open\` 函数与文件读写的细节，处理大文件、文件指针、手动解析 CSV 与日志分析。
`,
    code: `
# =============================================================
# 第16章代码：pathlib 路径操作实战（纯标准库，可独立运行）
# =============================================================
# 演示内容：
# 1. Path 对象的创建与属性拆解
# 2. / 运算符拼接路径
# 3. exists / is_file / is_dir 状态判断
# 4. mkdir 创建目录、unlink 删除文件
# 5. glob 模式匹配、rglob 递归查找
# 6. read_text / write_text 便捷读写
# 7. 实战：批量重命名文件、统计目录大小

import pathlib                  # 导入 pathlib 模块，提供面向对象的路径操作
import tempfile                 # 导入 tempfile 模块，创建临时工作目录避免污染项目
import shutil                   # 导入 shutil 模块，用于递归删除临时目录

work = pathlib.Path(tempfile.mkdtemp(prefix="pykit16_"))  # 新建临时目录并包装成 Path 对象
print(f"工作目录: {work}")                                # 打印临时工作目录的绝对路径

# ---------- 1. Path 创建与属性 ----------
p = work / "docs" / "report.txt"            # 用 / 运算符逐级拼接路径，等价 os.path.join
print(f"完整路径: {p}")                      # 打印拼接后的完整路径字符串
print(f"parent : {p.parent}")               # parent 属性返回父目录（不含文件名）
print(f"name   : {p.name}")                 # name 属性返回最后一部分（report.txt）
print(f"stem   : {p.stem}")                 # stem 属性返回文件名去掉扩展名（report）
print(f"suffix : {p.suffix}")               # suffix 属性返回扩展名（.txt）
print(f"parts  : {p.parts}")                # parts 属性返回路径各部分组成的元组

# ---------- 2. 创建目录与文件 ----------
(work / "images").mkdir(parents=True, exist_ok=True)   # 创建 images 子目录，父目录不存在一并创建
(work / "docs").mkdir(parents=True, exist_ok=True)     # 创建 docs 子目录
for i in range(3):                                     # 循环生成 3 个图片文件用于后续演示
    f = work / "images" / f"IMG_{i:03d}.JPG"           # 构造图片文件路径，文件名带序号
    f.write_text(f"fake image {i}", encoding="utf-8")  # 写入占位文本模拟图片内容

# ---------- 3. exists / is_file / is_dir ----------
print(f"images 存在? { (work / 'images').exists() }")    # exists 判断路径是否存在（文件或目录）
print(f"docs 是目录? { (work / 'docs').is_dir() }")      # is_dir 判断是否为目录
print(f"不存在的是文件? { (work / 'no.txt').is_file() }")  # is_file 对不存在的路径返回 False

# ---------- 4. glob 模式匹配 ----------
imgs = list((work / "images").glob("*.JPG"))   # glob 匹配当前目录下所有 .JPG 文件
print(f"找到 JPG 文件 {len(imgs)} 个")          # 打印匹配到的文件数量
for f in imgs:                                  # 遍历匹配到的文件列表
    print(f"  - {f.name}")                      # 打印每个文件的文件名

# ---------- 5. 实战 A：批量重命名 ----------
# 需求：把 IMG_000.JPG 改成 photo_1.jpg，统一扩展名为小写并从 1 开始编号
counter = 1                                       # 重命名计数器，从 1 开始
for f in sorted((work / "images").glob("*.JPG")):  # 按文件名排序遍历所有 JPG
    new_name = f"photo_{counter}.jpg"             # 构造新文件名，扩展名统一小写
    new_path = f.with_name(new_name)              # with_name 返回只改文件名的新 Path 对象
    f.rename(new_path)                            # rename 执行重命名（同目录下移动）
    print(f"重命名: {f.name} -> {new_path.name}") # 打印重命名前后的文件名
    counter += 1                                  # 计数器加 1

# ---------- 6. 造一些文件用于统计目录大小 ----------
(work / "docs" / "a.txt").write_text("a" * 500, encoding="utf-8")     # 写入 500 字节的文件
(work / "docs" / "b.txt").write_text("b" * 1500, encoding="utf-8")    # 写入 1500 字节的文件
(work / "sub" / "deep").mkdir(parents=True, exist_ok=True)            # 创建多层子目录
(work / "sub" / "deep" / "c.txt").write_text("c" * 300, encoding="utf-8")  # 写入 300 字节文件


def dir_size(path):                               # 定义递归统计目录大小的函数
    total = 0                                     # 累计字节数初始化为 0
    for item in path.rglob("*"):                  # rglob("*") 递归遍历所有子孙条目
        if item.is_file():                        # 只统计文件，跳过目录
            total += item.stat().st_size          # stat().st_size 取文件字节数并累加
    return total                                  # 返回目录总大小（字节）


size = dir_size(work)                             # 调用函数统计工作目录总大小
print(f"目录总大小: {size} 字节 (约 {size / 1024:.2f} KB)")  # 打印字节数与换算后的 KB

# ---------- 7. read_text / write_text 便捷读写 ----------
sample = work / "hello.txt"                       # 构造一个文本文件路径
sample.write_text("第一行\\n第二行\\n", encoding="utf-8")  # write_text 一次性写入整个字符串
text = sample.read_text(encoding="utf-8")         # read_text 一次性读出全部内容
print("读取内容:")                                # 打印提示
print(text, end="")                               # 打印读回的内容（已有换行，end="" 防多空行）
print(f"按行拆分: {sample.read_text(encoding='utf-8').splitlines()}")  # splitlines 按行切成列表

# ---------- 清理临时目录 ----------
shutil.rmtree(work)                               # 递归删除临时目录及其所有内容
print("✅ 临时目录已清理，演示完成")                # 提示清理完成
`,
  },

  // =============================================================
  // 第17章：文件读写实战
  // =============================================================
  {
    id: "pykit-17",
    group: "文件与路径操作",
    icon: "📄",
    title: "文件读写实战",
    content: `# 文件读写实战

## 一、open 函数详解

Python 读写文件的入口是内置函数 \`open()\`。它有十几个参数，但日常最常用的只有四个：

\`\`\`python
f = open(file, mode='r', encoding=None, newline=None)
\`\`\`

| 参数 | 作用 | 常用值 |
|------|------|--------|
| \`file\` | 文件路径（字符串或 Path） | \`"a.txt"\`、\`Path("a.txt")\` |
| \`mode\` | 打开模式 | \`r/w/a/x\` + \`b/t\` + \`+\` |
| \`encoding\` | 文本编码 | \`"utf-8"\` |
| \`newline\` | 换行符处理 | \`""\`、\`"\\n"\`、\`None\` |

### mode 速查

| 模式 | 含义 | 文件不存在 | 文件已存在 |
|------|------|-----------|-----------|
| \`r\` | 只读（默认） | 抛异常 | 从头读 |
| \`w\` | 只写 | 创建 | **清空** |
| \`a\` | 追加写 | 创建 | 在末尾追加 |
| \`x\` | 排他创建 | 创建 | **抛异常**（防覆盖） |
| \`r+\` | 读写 | 抛异常 | 不清空，可读可写 |
| \`b\` | 二进制模式后缀 | 与上面组合 | \`rb\`、\`wb\` |
| \`t\` | 文本模式后缀（默认） | 与上面组合 | \`rt\` 等同 \`r\` |

最易踩的坑：**\`w\` 会清空原文件**。如果你只是想覆盖某个文件还好，但若误用 \`w\` 打开重要配置，内容瞬间没了。需要"文件存在就报错、不存在才创建"时用 \`x\`。

### encoding 为什么必须指定

\`\`\`python
# ❌ 危险：依赖系统默认编码
f = open("a.txt")            # Windows 上默认 GBK，Linux 上默认 UTF-8
# ✅ 推荐：显式指定
f = open("a.txt", encoding="utf-8")
\`\`\`

同一段代码在不同平台跑出乱码，九成是没指定 \`encoding\`。养成习惯：只要读写文本，一律加 \`encoding="utf-8"\`。

### newline 与 universal newlines

不同操作系统的换行符不同：Linux \`\\n\`、Windows \`\\r\\n\`、老 Mac \`\\r\`。Python 默认开启"通用换行"模式，读入时把三种换行都转成 \`\\n\`，写出时把 \`\\n\` 转成系统默认换行。

- \`newline=None\`（默认）：读时全转 \`\\n\`，写时 \`\\n\` 转系统换行。
- \`newline=""\`：读时换行原样保留（不转换），写时 \`\\n\` 原样写出。**处理 CSV 时必用这个**，否则 Windows 下会多空行。

## 二、read / readline / readlines 区别

三种读取方式对应不同场景：

\`\`\`python
with open("a.txt", encoding="utf-8") as f:
    f.read()        # 一次读完，返回整个字符串（大文件会撑爆内存）
    f.readline()    # 读一行（含末尾换行符），到末尾返回 ""
    f.readlines()   # 读所有行，返回 list[str]，每行一个元素
\`\`\`

| 方法 | 返回 | 内存 | 适用 |
|------|------|------|------|
| \`read()\` | 一个大字符串 | 高 | 小文件、需整体处理 |
| \`readline()\` | 一行字符串 | 低 | 手动控制读取节奏 |
| \`readlines()\` | 行列表 | 高 | 中小文件、需按下标访问行 |
| \`for line in f\` | 逐行迭代 | **最低** | **大文件首选** |

**大文件黄金法则**：用 \`for line in f\` 逐行迭代。文件对象本身是迭代器，每次只把一行加载进内存，处理几 GB 日志也不慌。

\`\`\`python
# 处理大日志：每行只有一行在内存里
with open("huge.log", encoding="utf-8") as f:
    for line in f:
        if "ERROR" in line:
            process(line)
\`\`\`

## 三、write / writelines

\`\`\`python
with open("out.txt", "w", encoding="utf-8") as f:
    f.write("hello")              # write 写入字符串，返回写入字符数
    f.write("world\\n")           # 不会自动加换行，需手动 \\n
    
    f.writelines(["a\\n", "b\\n", "c\\n"])  # writelines 批量写入，也不加换行
\`\`\`

关键点：**\`write\` 和 \`writelines\` 都不会自动加换行**。\`writelines\` 名字容易误导——它只是把列表里每个字符串依次写出，不会在每项后补 \`\\n\`。要每行带换行得自己加：

\`\`\`python
lines = ["aaa", "bbb", "ccc"]
f.writelines(line + "\\n" for line in lines)   # 手动补换行
\`\`\`

## 四、with 语句自动关闭

\`\`\`python
# ❌ 手动关闭，容易漏
f = open("a.txt", encoding="utf-8")
try:
    data = f.read()
finally:
    f.close()

# ✅ with 语句：无论是否异常都自动关闭
with open("a.txt", encoding="utf-8") as f:
    data = f.read()
# 离开 with 块，f 自动 close
\`\`\`

\`with\` 是上下文管理器，保证文件 descriptor 一定被释放。**永远用 \`with\` 操作文件**，不要裸 \`open\`。漏关文件在短期脚本里看不出问题，但在长跑的服务里会耗尽 fd 上限（\`Too many open files\`）。

可以同时打开多个文件：

\`\`\`python
with open("in.txt", encoding="utf-8") as fin, open("out.txt", "w", encoding="utf-8") as fout:
    for line in fin:
        fout.write(line.upper())
\`\`\`

## 五、大文件逐行处理

实战中"逐行读 + 过滤 + 写出"是最常见模式。下面是一个日志过滤脚本骨架：

\`\`\`python
with open("app.log", encoding="utf-8") as fin, open("error.log", "w", encoding="utf-8") as fout:
    for line in fin:                       # 逐行读，内存占用恒定
        if "ERROR" in line or "CRITICAL" in line:
            fout.write(line)               # 命中则写入新文件
\`\`\`

这种模式即使源文件 10GB，内存占用也只有几 KB。**千万不要 \`read()\` 整个大文件再处理**。

## 六、文件指针 seek / tell

文件对象内部维护一个"指针"，标记当前读到文件的哪个字节位置。

\`\`\`python
with open("a.txt", encoding="utf-8") as f:
    f.tell()           # 当前指针位置（字节偏移）
    f.read(5)          # 读 5 个字符，指针后移
    f.tell()           # 读后位置
    f.seek(0)          # 把指针移回开头
    f.seek(0, 2)       # 移到末尾（whence=2 表示末尾），常用于取文件大小
    f.seek(10)         # 移到第 10 字节
\`\`\`

\`seek(offset, whence)\` 的 \`whence\`：

- \`0\`（默认）：从文件开头算。
- \`1\`：从当前位置算。
- \`2\`：从文件末尾算。

用途：

- **重新读**：读完想再读一遍，\`seek(0)\` 回到开头。
- **取文件大小**：\`f.seek(0, 2); size = f.tell()\`。
- **随机访问**：跳到指定位置读写（二进制文件常用）。

⚠️ **文本模式 \`seek\` 有限制**：只能 \`seek(0)\` 回开头或 \`seek(返回过的 tell 值)\`，不能随意跳字节（因为多字节编码下字节偏移和字符位置不对齐）。需要任意位置随机访问时用二进制模式 \`rb\`。

## 七、实战 demo 说明

本章代码演示两个场景：

- **手动解析 CSV**：不用 \`csv\` 模块，用 \`readline\` + \`split\` 把表头与数据配对成字典。这是理解 CSV 本质的好练习（生产环境还是建议用 \`csv\` 模块，见第 19 章）。
- **日志文件分析**：生成一个 1 万行的模拟日志，逐行读取并按日志级别（INFO/WARN/ERROR）统计出现次数，演示大文件逐行处理的内存友好模式。

代码同样用临时目录隔离，运行结束自动清理。

## 八、常见坑汇总

1. **\`w\` 误清空文件**：要追加用 \`a\`，要防覆盖用 \`x\`。
2. **没指定 encoding**：跨平台乱码，统一 \`utf-8\`。
3. **\`read()\` 读大文件**：内存爆炸，改 \`for line in f\`。
4. **忘记 \`with\`**：fd 泄漏，服务跑久了 \`Too many open files\`。
5. **CSV 不加 \`newline=""\`**：Windows 下每行多一个空行。
6. **\`writelines\` 当成会加换行**：要自己补 \`\\n\`。
7. **文本模式乱 \`seek\`**：只能回开头或跳到之前 \`tell\` 过的位置。

## 九、二进制文件读写

文本模式（\`r\`/\`w\`）处理的是字符串，需要编码转换；二进制模式（\`rb\`/\`wb\`）读写的是 \`bytes\`，原样传输不做转换。处理图片、压缩包、音视频等非文本文件必须用二进制模式：

\`\`\`python
# 复制图片文件：必须用二进制模式
with open("a.png", "rb") as fin, open("b.png", "wb") as fout:
    fout.write(fin.read())           # 一次性读写（小文件）
\`\`\`

大文件用分块拷贝，避免一次性加载：

\`\`\`python
CHUNK = 64 * 1024                     # 64KB 一块
with open("big.zip", "rb") as fin, open("copy.zip", "wb") as fout:
    while chunk := fin.read(CHUNK):   # 海象运算符，读到空 bytes 结束
        fout.write(chunk)
\`\`\`

二进制模式的优点：

- **无编码问题**：\`bytes\` 就是原始字节，不存在乱码。
- **\`seek\` 可任意跳转**：不受多字节编码限制，能精确按字节定位。
- **更快**：省去编解码开销。

注意：二进制模式读出来是 \`bytes\` 不是 \`str\`，要转成文本需 \`data.decode("utf-8")\`；写文本要先 \`text.encode("utf-8")\`。

## 十、缓冲与 flush

Python 文件对象默认带**缓冲区**：写入先攒在内存缓冲，攒够或关闭时才真正写盘。这能大幅减少系统调用提升性能，但也带来一个坑——缓冲区没满就崩溃，数据会丢。

强制立即写盘用 \`flush()\`：

\`\`\`python
with open("log.txt", "w", encoding="utf-8") as f:
    f.write("重要日志\\n")
    f.flush()                         # 立即写盘，不等缓冲区满
\`\`\`

实时日志场景常用 \`flush\` 确保日志及时落盘。也可以打开时用 \`buffering=1\`（行缓冲）：

\`\`\`python
open("log.txt", "w", encoding="utf-8", buffering=1)   # 每写一行就 flush
\`\`\`

\`print\` 函数也有 \`flush\` 参数：\`print("x", flush=True)\`。

## 本章小结

- \`open\` 的 \`mode/encoding/newline\` 是最关键三个参数。
- \`read\`/\`readline\`/\`readlines\` 对应小文件/手动控制/列表访问，大文件用 \`for line in f\`。
- \`write\`/\`writelines\` 都不自动加换行，需手动 \`\\n\`。
- \`with\` 语句保证文件自动关闭，永远用它。
- \`seek\`/\`tell\` 控制文件指针，文本模式只能回开头或跳到已知位置。
- 大文件逐行处理是性能与内存的关键技巧。

下一章进入 JSON 与序列化，学习配置文件、API 响应的处理。
`,
    code: `
# =============================================================
# 第17章代码：文件读写实战（纯标准库，可独立运行）
# =============================================================
# 演示内容：
# 1. open 的 mode / encoding 参数
# 2. read / readline / readlines 的区别
# 3. write / writelines 写入
# 4. with 语句自动关闭
# 5. 大文件逐行处理
# 6. seek / tell 文件指针
# 7. 实战：手动解析 CSV、日志文件分析

import os                           # 导入 os 模块，用于路径拼接
import tempfile                     # 导入 tempfile 模块，创建临时工作目录
import shutil                       # 导入 shutil 模块，用于清理临时目录
from collections import Counter     # 从 collections 导入 Counter，用于统计计数

work = tempfile.mkdtemp(prefix="pykit17_")          # 创建临时工作目录
print(f"工作目录: {work}")                          # 打印工作目录路径

# ---------- 1. open 模式与 encoding ----------
p = os.path.join(work, "demo.txt")                  # 拼接出一个测试文件路径
with open(p, "w", encoding="utf-8") as f:           # 以写模式打开，指定 UTF-8 编码
    f.write("hello 世界\\n")                         # write 写入一行文本
    f.write("second line\\n")                        # 再写一行

with open(p, encoding="utf-8") as f:                # 以读模式打开（默认 mode='r'）
    print("read() 全部:", repr(f.read()))           # read() 一次读完整个文件

with open(p, encoding="utf-8") as f:                # 重新打开文件，指针回到开头
    print("readline():", repr(f.readline()))        # readline() 只读一行

with open(p, encoding="utf-8") as f:                # 再次打开
    print("readlines():", f.readlines())            # readlines() 返回每行组成的列表

# ---------- 2. writelines（不会自动加换行） ----------
p2 = os.path.join(work, "lines.txt")                # 构造另一个文件路径
lines = ["aaa", "bbb", "ccc"]                       # 准备要写入的字符串列表
with open(p2, "w", encoding="utf-8") as f:          # 以写模式打开
    f.writelines(line + "\\n" for line in lines)     # writelines 逐项写入，需手动补换行符

# ---------- 3. 大文件逐行处理（内存友好） ----------
big = os.path.join(work, "big.log")                 # 构造一个大日志文件路径
with open(big, "w", encoding="utf-8") as f:         # 创建大文件
    for i in range(10000):                          # 循环写入 1 万行
        f.write(f"2026-07-08 10:{i % 60:02d} INFO msg {i}\\n")  # 每行写一条日志

line_count = 0                                      # 行数计数器
with open(big, encoding="utf-8") as f:              # 以读模式打开大文件
    for line in f:                                  # 直接遍历文件对象，逐行读取（不一次性加载）
        line_count += 1                             # 累计行数
print(f"大文件共 {line_count} 行")                  # 打印总行数

# ---------- 4. seek / tell 文件指针 ----------
with open(p, encoding="utf-8") as f:                # 打开小文件演示指针
    print("起始位置:", f.tell())                    # tell 返回当前指针位置（字节偏移）
    first = f.read(5)                               # read(5) 读 5 个字符
    print("读了 5 字符:", repr(first), "位置:", f.tell())  # 打印内容与新位置
    f.seek(0)                                       # seek(0) 把指针移回开头
    print("seek(0) 后再读:", repr(f.read(5)))       # 再次读 5 字符，应是开头内容

# ---------- 5. 实战 A：手动解析 CSV ----------
csv_path = os.path.join(work, "users.csv")          # 构造 CSV 文件路径
csv_text = "name,age,city\\nAlice,30,Beijing\\nBob,25,Shanghai\\n"  # 准备 CSV 文本
with open(csv_path, "w", encoding="utf-8") as f:    # 写入 CSV 文件
    f.write(csv_text)                               # 写入字符串内容

with open(csv_path, encoding="utf-8") as f:         # 读取并手动解析
    header = f.readline().strip().split(",")        # 读第一行作为表头并按逗号切分
    print("表头:", header)                          # 打印表头列表
    for line in f:                                  # 逐行读取剩余数据
        fields = line.strip().split(",")            # 去掉换行后按逗号切分字段
        record = dict(zip(header, fields))          # zip 配对表头与字段，转成字典
        print("  记录:", record)                    # 打印每条记录字典

# ---------- 6. 实战 B：日志文件分析 ----------
levels = Counter()                                  # 创建计数器统计各级别出现次数
with open(big, encoding="utf-8") as f:              # 打开大日志文件
    for line in f:                                  # 逐行遍历
        parts = line.split()                        # 按空白切分每行
        if len(parts) >= 3:                         # 确保至少有 3 段（日期 时间 级别 ...）
            levels[parts[2]] += 1                   # 第 3 段是日志级别，计数加 1
print("日志级别统计:", dict(levels))                # 打印各级别出现次数

# ---------- 清理 ----------
shutil.rmtree(work)                                 # 递归删除临时目录
print("✅ 文件读写演示完成")                         # 提示演示完成
`,
  },

  // =============================================================
  // 第18章：JSON 与序列化
  // =============================================================
  {
    id: "pykit-18",
    group: "文件与路径操作",
    icon: "📦",
    title: "JSON 与序列化",
    content: `# JSON 与序列化

## 一、什么是 JSON，为什么用它

JSON（JavaScript Object Notation）是当今最通用的**数据交换格式**。它的语法源自 JavaScript，但和语言无关——Python、Java、Go、Rust、Shell 几乎所有语言都能读写 JSON。典型用途：

- **API 通信**：前后端交互、微服务调用的请求体与响应体。
- **配置文件**：\`package.json\`、\`tsconfig.json\`、各种工具的配置。
- **数据持久化**：把程序状态存成 JSON，下次启动加载。
- **NoSQL 存储**：MongoDB、Redis 都能直接存 JSON 文档。

JSON 只有 6 种数据类型：**对象（object）、数组（array）、字符串、数字、布尔、null**。它和 Python 类型的对应关系：

| JSON | Python |
|------|--------|
| object \`{}\` | \`dict\` |
| array \`[]\` | \`list\` |
| string | \`str\` |
| number | \`int\` / \`float\` |
| true / false | \`True\` / \`False\` |
| null | \`None\` |

注意几个**不对应**的地方：

- JSON 没有"元组"，Python 的 \`tuple\` 会被序列化成数组（再读回来变成 \`list\`）。
- JSON 没有"集合"，\`set\` 不能直接序列化。
- JSON 的数字不区分整型浮点，\`1\` 和 \`1.0\` 读回来分别是 \`int\` 和 \`float\`。
- JSON 的键**必须是字符串**，Python dict 用数字当键时序列化会把键转成字符串。

Python 标准库 \`json\` 模块负责 JSON 与 Python 对象的互转。

## 二、json.dumps / loads：字符串互转

\`dumps\`（dump string）把 Python 对象序列化成 JSON 字符串，\`loads\`（load string）反向解析：

\`\`\`python
import json

data = {"name": "张三", "age": 28, "tags": ["py", "go"], "active": True}
s = json.dumps(data)          # dict -> JSON 字符串
print(s)  # '{"name": "\\u5f20\\u4e09", ...}'

back = json.loads(s)          # JSON 字符串 -> dict
print(back["name"])           # 张三
\`\`\`

\`dumps\` 常用参数：

| 参数 | 作用 | 常用值 |
|------|------|--------|
| \`ensure_ascii\` | 是否转义非 ASCII 字符 | \`False\`（保留中文） |
| \`indent\` | 缩进空格数，美化输出 | \`2\`、\`4\` |
| \`sort_keys\` | 按 key 排序 | \`True\` |
| \`default\` | 未知类型的序列化钩子 | 自定义函数 |
| \`separators\` | 分隔符 | \`(",", ": ")\` |

## 三、处理中文：ensure_ascii=False

\`dumps\` 默认 \`ensure_ascii=True\`，会把中文等非 ASCII 字符转成 \`\\uXXXX\` 转义。这保证任何环境都能传输，但**人不可读**：

\`\`\`python
>>> json.dumps({"city": "北京"})
'{"city": "\\u5317\\u4eac"}'        # 转义后

>>> json.dumps({"city": "北京"}, ensure_ascii=False)
'{"city": "北京"}'                  # 保留中文
\`\`\`

经验法则：

- **存配置、给人看**：\`ensure_ascii=False\`，中文直接显示。
- **跨系统传输、不确定对方编码处理**：保持默认 \`True\` 最安全。
- 写文件时配合 \`encoding="utf-8"\`，否则中文可能乱码。

## 四、json.dump / load：文件操作

\`dump\` / \`load\` 直接对接文件对象，省去中间字符串：

\`\`\`python
import json

data = {"name": "张三", "scores": [90, 85, 88]}

# 写入文件
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# 从文件读取
with open("data.json", encoding="utf-8") as f:
    loaded = json.load(f)
\`\`\`

注意：\`dump\` 写文件时也要传 \`ensure_ascii\`、\`indent\` 等参数，和 \`dumps\` 完全一致。文件编码要和 \`ensure_ascii\` 配合——\`ensure_ascii=False\` 时文件必须用 \`utf-8\` 写。

## 五、美化输出：indent / sort_keys

\`\`\`python
import json

data = {"b": 2, "a": 1, "nested": {"y": 2, "x": 1}}

# 紧凑（默认）
json.dumps(data)                              # '{"b": 2, "a": 1, "nested": {"y": 2, "x": 1}}'

# 美化缩进
json.dumps(data, indent=2, ensure_ascii=False)
# {
#   "b": 2,
#   "a": 1,
#   "nested": {
#     "y": 2,
#     "x": 1
#   }
# }

# 排序 key
json.dumps(data, sort_keys=True, indent=2)    # a 在 b 前
\`\`\`

\`indent\` 让配置文件、日志可读性大增；\`sort_keys=True\` 让输出稳定，便于版本对比（git diff 不会因 key 顺序抖动）。

## 六、自定义序列化：default 参数

JSON 只认 6 种基本类型，遇到 \`datetime\`、\`Decimal\`、\`set\` 等会抛 \`TypeError\`：

\`\`\`python
import json
from datetime import datetime

json.dumps({"now": datetime.now()})   # TypeError: Object of type datetime is not JSON serializable
\`\`\`

解决办法是传 \`default\` 钩子函数，\`dumps\` 遇到不认识的类型时会调用它：

\`\`\`python
from datetime import datetime, date

def default(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()        # 转成 ISO 8601 字符串
    raise TypeError(f"无法序列化 {type(obj)}")

json.dumps({"now": datetime.now()}, default=default, ensure_ascii=False)
# '{"now": "2026-07-08T10:30:00"}'
\`\`\`

\`default\` 只处理"对象 -> JSON"方向。反序列化时要把字符串还原成 \`datetime\`，需要用 \`object_hook\`（进阶，本章略）。

## 七、解析与异常处理

\`loads\` 遇到非法 JSON 会抛 \`json.JSONDecodeError\`（\`ValueError\` 的子类）。解析外部输入（API、用户上传）时务必捕获：

\`\`\`python
import json

raw = '{"name": "张三", "age": 28'   # 少了闭合大括号，非法
try:
    data = json.loads(raw)
except json.JSONDecodeError as e:
    print(f"JSON 解析失败：{e}")
\`\`\`

常见非法情况：

- 尾随逗号：\`{"a": 1,}\`（JSON 不允许，但 Python dict 允许）。
- 单引号：\`{'a': 1}\`（JSON 必须双引号）。
- 注释：JSON 标准不支持 \`//\` 或 \`/* */\`。
- 键没引号：\`{a: 1}\` 非法。

## 八、pickle vs json

\`pickle\` 是 Python 专有的二进制序列化格式，能保存几乎所有 Python 对象（包括自定义类、函数等），但有几个关键区别：

| 维度 | json | pickle |
|------|------|--------|
| 格式 | 文本 | 二进制 |
| 跨语言 | ✅ 通用 | ❌ 仅 Python |
| 支持类型 | 6 种基本类型 | 几乎所有 Python 对象 |
| 安全 | ✅ 安全（只是数据） | ⚠️ **危险**（可执行任意代码） |
| 可读性 | ✅ 人可读 | ❌ 二进制 |
| 体积 | 较大 | 较小 |

⚠️ **安全警告**：**永远不要 \`pickle.load\` 不信任来源的数据**。pickle 反序列化时会执行任意代码，加载恶意 pickle 文件等同于运行病毒。json 只是数据，加载是安全的。

经验：

- 跨语言、对外、配置 → **json**。
- Python 内部缓存、保存模型/复杂对象 → **pickle**，且只加载自己生成的文件。
- 现代替代：要存 Python 对象又想可读，考虑 \`shelve\` 或第三方 \`orjson\`/\`msgpack\`。

## 九、实战 demo 说明

本章代码演示两个场景：

- **配置文件读写**：封装一个 \`ConfigManager\` 类，用 \`json.dump/load\` 持久化程序配置（主题、超时等），演示"读取-修改-保存-重新加载"完整闭环。
- **API 响应解析**：模拟一段 API 返回的 JSON（嵌套的用户与订单），用 \`loads\` 解析后取出用户、订单列表并汇总总金额，演示嵌套 JSON 的取值。

代码用临时目录隔离，运行结束清理。

## 十、常见坑

1. **中文乱码**：\`ensure_ascii=False\` 但文件没指定 \`encoding="utf-8"\`。
2. **键变字符串**：\`{1: "a"}\` 序列化后读回变成 \`{"1": "a"}\`，键永远是字符串。
3. **tuple 变 list**：\`(1, 2)\` 往返后是 \`[1, 2]\`。
4. **set 不能序列化**：要转成 \`list\`。
5. **datetime 报错**：用 \`default\` 钩子。
6. **加载不可信 pickle**：安全风险，改用 json。
7. **单引号 JSON**：JSON 必须双引号，\`ast.literal_eval\` 能解析单引号但不是 JSON。

## 本章小结

- \`dumps/loads\` 处理字符串，\`dump/load\` 处理文件，参数一致。
- \`ensure_ascii=False\` + \`encoding="utf-8"\` 让中文可读。
- \`indent\` 美化、\`sort_keys\` 稳定输出、\`default\` 处理自定义类型。
- 解析外部 JSON 要捕获 \`JSONDecodeError\`。
- json 通用安全，pickle 强大但危险，只加载可信数据。
- 配置文件、API 响应是 JSON 最常见的两个落地场景。

下一章学习 CSV 与表格数据处理。
`,
    code: `
# =============================================================
# 第18章代码：JSON 与序列化（纯标准库，可独立运行）
# =============================================================
# 演示内容：
# 1. json.dumps / loads 字符串互转
# 2. ensure_ascii=False 处理中文
# 3. indent 美化输出
# 4. json.dump / load 文件读写
# 5. default 自定义序列化（datetime）
# 6. pickle 与 json 对比
# 7. 实战：配置文件读写、API 响应解析

import json                         # 导入 json 模块，处理 JSON 序列化
import pickle                       # 导入 pickle 模块，Python 专有的二进制序列化
import tempfile                     # 导入 tempfile，创建临时工作目录
import shutil                       # 导入 shutil，清理临时目录
import os                           # 导入 os，路径拼接
from datetime import datetime, date # 导入日期时间类型用于自定义序列化演示

work = tempfile.mkdtemp(prefix="pykit18_")          # 创建临时工作目录
print(f"工作目录: {work}")                          # 打印工作目录

# ---------- 1. dumps / loads ----------
data = {"name": "张三", "age": 28, "tags": ["py", "go"]}  # 构造一个 Python 字典
s = json.dumps(data, ensure_ascii=False)            # dumps 把对象转成 JSON 字符串，中文不转义
print("JSON 字符串:", s)                            # 打印序列化后的字符串
back = json.loads(s)                                # loads 把 JSON 字符串解析回对象
print("解析回来:", back, "类型:", type(back).__name__)  # 打印对象与类型

# ---------- 2. ensure_ascii 对比 ----------
print("默认(转义):", json.dumps({"city": "北京"}))  # 默认 ensure_ascii=True，中文变 \\uXXXX
print("不转义:", json.dumps({"city": "北京"}, ensure_ascii=False))  # False 保留中文明文

# ---------- 3. indent 美化 ----------
pretty = json.dumps(data, ensure_ascii=False, indent=2)  # indent=2 缩进 2 空格美化输出
print("美化输出:")                                  # 打印提示
print(pretty)                                       # 打印带缩进的 JSON

# ---------- 4. dump / load 文件操作 ----------
cfg_path = os.path.join(work, "config.json")        # 构造配置文件路径
with open(cfg_path, "w", encoding="utf-8") as f:    # 以写模式打开
    json.dump(data, f, ensure_ascii=False, indent=2)  # dump 直接把对象写入文件
with open(cfg_path, encoding="utf-8") as f:         # 以读模式打开
    loaded = json.load(f)                           # load 从文件读出对象
print("从文件读回:", loaded)                        # 打印读回的对象

# ---------- 5. default 自定义序列化 ----------
config = {"updated": datetime(2026, 7, 8, 10, 30)}  # 字典含 datetime（JSON 不认识）


def to_serializable(obj):                           # 定义默认序列化钩子函数
    if isinstance(obj, (datetime, date)):           # 若对象是日期或日期时间
        return obj.isoformat()                      # 转成 ISO 格式字符串
    raise TypeError(f"无法序列化 {type(obj)}")      # 其它类型抛错交给默认处理


s2 = json.dumps(config, ensure_ascii=False, default=to_serializable)  # 用 default 钩子序列化
print("含日期的 JSON:", s2)                         # 打印序列化结果

# ---------- 6. pickle 与 json 对比 ----------
obj = {"nums": [1, 2, 3], "flag": True}             # 构造一个对象
pk_path = os.path.join(work, "data.pkl")            # 构造 pickle 文件路径
with open(pk_path, "wb") as f:                      # pickle 用二进制模式写
    pickle.dump(obj, f)                             # dump 把对象序列化到文件
with open(pk_path, "rb") as f:                      # 二进制模式读
    pk_obj = pickle.load(f)                         # load 反序列化回对象
print("pickle 读回:", pk_obj)                       # 打印反序列化结果
print("pickle 文件大小:", os.path.getsize(pk_path), "字节")  # pickle 文件是二进制
print("JSON 字符串:", json.dumps(obj))              # 对比 JSON 的文本表示

# ---------- 7. 实战 A：配置文件读写 ----------
class ConfigManager:                                # 定义一个简易配置管理器
    def __init__(self, path):                       # 构造函数接收配置文件路径
        self.path = path                            # 保存路径
        self.data = {}                              # 初始化配置字典

    def load(self):                                 # 加载配置
        if os.path.exists(self.path):               # 文件存在才读
            with open(self.path, encoding="utf-8") as f:  # 打开配置文件
                self.data = json.load(f)            # 读出 JSON 配置
        return self.data                            # 返回配置字典

    def save(self):                                 # 保存配置
        with open(self.path, "w", encoding="utf-8") as f:  # 以写模式打开
            json.dump(self.data, f, ensure_ascii=False, indent=2)  # 写入并美化

    def set(self, key, value):                      # 设置某项配置
        self.data[key] = value                      # 写入字典


cfg_file = os.path.join(work, "app.json")           # 构造配置文件路径
mgr = ConfigManager(cfg_file)                       # 实例化配置管理器
mgr.load()                                          # 加载（首次文件不存在，data 为空）
mgr.set("theme", "dark")                            # 设置主题
mgr.set("timeout", 30)                              # 设置超时秒数
mgr.save()                                          # 保存到文件
mgr2 = ConfigManager(cfg_file)                      # 新建一个管理器读取验证
print("重新加载配置:", mgr2.load())                 # 打印重新读出的配置

# ---------- 8. 实战 B：API 响应解析 ----------
# 模拟 API 返回的结构：业务码、用户、订单列表
api_obj = {                                         # 构造模拟的 API 响应对象
    "code": 0,                                      # 业务码 0 表示成功
    "data": {                                       # 数据载荷
        "user": {"id": 101, "name": "李四"},         # 用户信息
        "orders": [                                 # 订单列表
            {"id": "A1", "amount": 99.5},           # 订单 1
            {"id": "A2", "amount": 200}             # 订单 2
        ]                                           # 结束订单列表
    }                                               # 结束 data
}                                                   # 结束顶层对象
api_response = json.dumps(api_obj, ensure_ascii=False)  # 把对象转成 JSON 字符串模拟网络响应
resp = json.loads(api_response)                     # 解析（模拟收到响应后反序列化）
if resp["code"] == 0:                               # 判断业务码是否成功
    user = resp["data"]["user"]                     # 取出用户对象
    orders = resp["data"]["orders"]                 # 取出订单列表
    total = sum(o["amount"] for o in orders)        # 求订单总金额
    print(f"用户 {user['name']} 共 {len(orders)} 笔订单，合计 {total}")  # 打印汇总

# ---------- 清理 ----------
shutil.rmtree(work)                                 # 删除临时目录
print("✅ JSON 序列化演示完成")                      # 提示完成
`,
  },

  // =============================================================
  // 第19章：CSV 与 Excel 数据处理
  // =============================================================
  {
    id: "pykit-19",
    group: "文件与路径操作",
    icon: "🗃️",
    title: "CSV 与 Excel 数据处理",
    content: `# CSV 与 Excel 数据处理

## 一、CSV 是什么

CSV（Comma-Separated Values，逗号分隔值）是最常见的**表格数据交换格式**。本质就是纯文本：每行一条记录，字段间用逗号分隔。几乎所有支持表格的软件（Excel、WPS、数据库导出、Pandas）都能读写。

\`\`\`
姓名,部门,工资
张三,研发,25000
李四,市场,18000
\`\`\`

第一行通常是**表头**，描述每列含义。但 CSV 标准很松散，真实世界会遇到这些复杂情况：

| 情况 | 示例 | 处理方式 |
|------|------|----------|
| 字段含逗号 | \`"张,三",28\` | 整个字段用双引号包起来 |
| 字段含引号 | \`"他说\\"\\"你好\\"\\""\` | 引号用两个双引号转义 |
| 字段含换行 | \`"第一行\\n第二行"\` | 引号包裹 |
| 字段为空 | \`,28,\` | 两个逗号间为空 |
| 不同分隔符 | \`a\\tb\\tc\` | TSV 用 Tab |

正因为这些边界，**自己写 \`line.split(',')\` 解析 CSV 几乎一定出 bug**，必须用标准库 \`csv\` 模块。

## 二、csv.reader / csv.writer

\`csv.reader\` 接收已打开的文件对象，返回迭代器，每次产出一行（一个 list）：

\`\`\`python
import csv

with open("users.csv", encoding="utf-8", newline="") as f:
    reader = csv.reader(f)
    header = next(reader)          # 取出第一行表头
    for row in reader:             # 遍历数据行
        print(row)                 # ['张三', '28', '北京']
        name, age, city = row      # 解构赋值
\`\`\`

关键点：

- **\`newline=""\` 必填**。csv 模块自己处理 \`\\r\\n\` / \`\\n\` / \`\\r\`，若让 \`open\` 再做"通用换行"转换，Windows 下会多空行。
- \`reader\` 是迭代器，只能遍历一次。
- 每行是 \`list[str]\`，即使原字段是数字读出来也是字符串，需自己 \`int()\` 转换。

\`csv.writer\` 写入：

\`\`\`python
import csv

rows = [["姓名", "年龄"], ["张三", 28], ["李四", 35]]
with open("out.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(rows[0])        # 写一行
    writer.writerows(rows[1:])      # 批量写多行
\`\`\`

数字 28 会被自动转成 "28"，不用手动 \`str()\`。

## 三、csv.DictReader / DictWriter

列数多时用下标 \`row[5]\` 既不直观又易错（改列顺序就崩）。\`DictReader\` 把每行读成**字典**，用表头作 key：

\`\`\`python
import csv

with open("users.csv", encoding="utf-8", newline="") as f:
    reader = csv.DictReader(f)      # 自动把第一行当表头
    print(reader.fieldnames)        # ['姓名', '年龄', '城市']
    for row in reader:
        print(row["姓名"], row["年龄"])   # 用字段名访问，比 row[0] 直观
\`\`\`

好处：**列顺序变了代码不用改**，因为用字段名取值而非下标。

\`DictWriter\` 写入：

\`\`\`python
import csv

fieldnames = ["姓名", "年龄", "城市"]
users = [
    {"姓名": "张三", "年龄": 28, "城市": "北京"},
    {"姓名": "李四", "年龄": 35, "城市": "上海"},
]
with open("out.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()            # 必须显式写表头
    writer.writerows(users)
\`\`\`

\`DictWriter\` 必须传 \`fieldnames\`，它决定列顺序——dict 本身无序，靠 fieldnames 指定。如果某行 dict 有 fieldnames 之外的 key 会抛 \`ValueError\`，可用 \`extrasaction="ignore"\` 忽略。

## 四、reader vs DictReader 选择

| 维度 | csv.reader | csv.DictReader |
|------|-----------|-----------------|
| 返回类型 | \`list[str]\` | \`dict[str, str]\` |
| 字段访问 | \`row[0]\` | \`row["name"]\` |
| 列顺序变化 | 易出错 | 不受影响 |
| 可读性 | 一般 | 好 |
| 性能 | 略快 | 略慢（多构造 dict） |
| 适用 | 列少、性能敏感 | 列多、需可读性 |

日常开发优先 **DictReader**，代码清晰、抗列顺序变化。

## 五、不同分隔符

CSV 不一定是逗号分隔。TSV（Tab 分隔）、管道分隔也很常见。用 \`delimiter\` 参数指定：

\`\`\`python
import csv

# TSV：Tab 分隔
with open("data.tsv", encoding="utf-8", newline="") as f:
    reader = csv.reader(f, delimiter="\\t")
    for row in reader:
        print(row)

# 写 TSV
with open("out.tsv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f, delimiter="\\t")
    writer.writerows([["id", "name"], [1, "Alice"]])
\`\`\`

更复杂的格式可以用 \`dialect\` 把一组参数封装复用：

\`\`\`python
csv.register_dialect("pipe", delimiter="|", lineterminator="\\n")
with open("data.txt", encoding="utf-8", newline="") as f:
    for row in csv.reader(f, dialect="pipe"):
        print(row)
\`\`\`

内置三种 dialect：\`excel\`（默认，逗号 + \`\\r\\n\`）、\`excel-tab\`（Tab）、\`unix\`（\`\\n\`，字段始终加引号）。

## 六、中文 CSV 的 BOM 问题

用 Excel 打开 UTF-8 的 CSV 时，如果文件**没有 BOM**，中文可能显示乱码。解决办法是写入时用 \`utf-8-sig\` 编码（带 BOM 的 UTF-8）：

\`\`\`python
import csv

rows = [["姓名", "部门"], ["张三", "研发"]]
with open("salary.csv", "w", encoding="utf-8-sig", newline="") as f:
    csv.writer(f).writerows(rows)
\`\`\`

\`utf-8-sig\` 写入时在文件开头加 3 字节 BOM（\`\\xef\\xbb\\xbf\`），Excel 见到就知道是 UTF-8。读取时 \`utf-8-sig\` 会自动剥离 BOM，\`utf-8\` 则会把 BOM 当普通字符，导致第一个字段名变成 \`\\ufeff姓名\`，后续 \`row["姓名"]\` 取不到。

**经验法则：中文 CSV 且要给 Excel 用，统一 utf-8-sig**。

## 七、大 CSV 分块读取

几十万行的 CSV 不能一次性 \`read\` 进内存。正确做法是**逐行流式处理**，或按固定行数分块：

\`\`\`python
import csv

CHUNK = 10000
with open("huge.csv", encoding="utf-8", newline="") as f:
    reader = csv.reader(f)
    next(reader)                    # 跳过表头
    chunk = []
    for row in reader:
        chunk.append(row)
        if len(chunk) >= CHUNK:
            process(chunk)          # 处理一块
            chunk = []
    if chunk:                       # 处理最后不足一块的尾料
        process(chunk)
\`\`\`

关键：\`reader\` 是迭代器，\`for row in reader\` 一次只读一行进内存，分块只是控制"攒够多少行处理一次"。即使 10GB 的 CSV，内存占用也恒定。

## 八、实战 demo 说明

本章代码演示两个场景：

- **数据导出**：把内存中的员工对象列表（模拟数据库查询结果）用 \`DictWriter\` 导出成 CSV，演示 \`fieldnames\` 控制列顺序、\`writeheader\` 写表头。
- **报表生成**：读回导出的 CSV，按部门分组统计人数与平均工资，再把结果写成报表 CSV，演示"读 → 聚合 → 写"的完整数据处理流水线。

代码还演示了 TSV 读写和大 CSV 分块读取，全部用临时目录隔离。

## 九、常见坑

1. **不用 \`newline=""\`**：Windows 下每行多一个空行。
2. **用 \`split(",")\` 解析**：遇到含逗号的字段就错乱，必须用 \`csv\` 模块。
3. **中文乱码**：给 Excel 用就 \`utf-8-sig\`。
4. **DictWriter 没写表头**：忘记 \`writeheader()\`。
5. **数字当字符串处理**：CSV 读出都是字符串，要自己 \`int()\` / \`float()\`。
6. **一次性读大 CSV**：内存爆炸，改逐行流式。
7. **追加数据重复写表头**：\`a\` 模式追加时不要再次 \`writeheader\`。

## 十、关于 Excel（.xlsx）

标准库 \`csv\` 只能处理纯文本 CSV，**不能直接读写 .xlsx 二进制格式**。需要操作真正的 Excel 文件要用第三方库：

- \`openpyxl\`：读写 xlsx，支持公式、样式、图表。
- \`xlsxwriter\`：只写，性能好，支持图表。
- \`pandas\`：\`df.to_excel()\` / \`pd.read_excel()\`，底层用 openpyxl。

由于本章限定标准库，演示都以 CSV 为主。实际项目中"导出 Excel"通常是先生成 CSV（Excel 能直接打开），需要复杂格式（合并单元格、公式）才上 openpyxl。

## 本章小结

- \`csv.reader/writer\` 处理列表形式，\`DictReader/DictWriter\` 处理字典形式，后者更可读。
- \`newline=""\` 是读写 CSV 的必填项，避免 Windows 空行。
- \`delimiter\` 处理 TSV 等非逗号格式，\`dialect\` 封装复用格式参数。
- 中文给 Excel 用统一 \`utf-8-sig\`。
- 大 CSV 用迭代器逐行 / 分块处理，内存恒定。
- 真正的 .xlsx 需要第三方库（openpyxl），标准库只管 CSV。

下一章学习目录遍历与文件搜索，把路径与文件操作串起来做项目级工具。
`,
    code: `
# =============================================================
# 第19章代码：CSV 与表格数据处理（纯标准库，可独立运行）
# =============================================================
# 演示内容：
# 1. csv.writer 写入、csv.DictReader 读取
# 2. 不同分隔符（TSV）
# 3. 大 CSV 分块读取
# 4. 实战：数据导出（对象列表 -> CSV）
# 5. 实战：报表生成（按部门统计平均工资）

import csv                           # 导入 csv 模块，处理 CSV 读写
import os                            # 导入 os 模块，路径拼接
import tempfile                      # 导入 tempfile，创建临时目录
import shutil                        # 导入 shutil，清理临时目录
from collections import defaultdict  # 导入 defaultdict，分组统计

work = tempfile.mkdtemp(prefix="pykit19_")          # 创建临时工作目录
print(f"工作目录: {work}")                          # 打印工作目录

# ---------- 1. csv.writer 写入 ----------
users_path = os.path.join(work, "users.csv")        # 构造用户 CSV 路径
users = [                                           # 准备二维列表数据（含表头）
    ["姓名", "部门", "工资"],                        # 表头行
    ["张三", "研发", 25000],                        # 数据行 1
    ["李四", "市场", 18000],                        # 数据行 2
    ["王五", "研发", 28000],                        # 数据行 3
    ["赵六", "市场", 16000],                        # 数据行 4
]
with open(users_path, "w", encoding="utf-8-sig", newline="") as f:  # utf-8-sig 让 Excel 不乱码
    writer = csv.writer(f)                          # 创建 writer 对象
    writer.writerows(users)                         # 一次写入多行

# ---------- 2. csv.DictReader 读取 ----------
with open(users_path, encoding="utf-8-sig", newline="") as f:  # 读取（newline='' 必填）
    reader = csv.DictReader(f)                      # DictReader 自动用首行作表头
    rows = list(reader)                             # 转成列表便于多次使用
    print("字段名:", reader.fieldnames)             # fieldnames 保存表头列表
    for r in rows:                                  # 遍历每行
        print(f"  {r['姓名']} - {r['部门']} - {r['工资']}")  # 用字段名访问更直观

# ---------- 3. 不同分隔符（TSV） ----------
tsv_path = os.path.join(work, "data.tsv")           # 构造 TSV 文件路径
tsv_data = [["id", "name"], [1, "Alice"], [2, "Bob"]]  # 准备 TSV 数据
with open(tsv_path, "w", encoding="utf-8", newline="") as f:  # 打开写入
    writer = csv.writer(f, delimiter="\\t")          # delimiter 指定 Tab 为分隔符
    writer.writerows(tsv_data)                      # 写入所有行
with open(tsv_path, encoding="utf-8", newline="") as f:  # 读取验证
    for row in csv.reader(f, delimiter="\\t"):       # 同样指定 Tab 分隔符读取
        print("TSV 行:", row)                       # 打印每行列表

# ---------- 4. 大 CSV 分块读取 ----------
big_csv = os.path.join(work, "big.csv")             # 构造大 CSV 路径
with open(big_csv, "w", encoding="utf-8", newline="") as f:  # 生成大文件
    writer = csv.writer(f)                          # 创建 writer
    writer.writerow(["id", "value"])                # 写表头
    for i in range(50000):                          # 写 5 万行数据
        writer.writerow([i, i * i])                 # 写一行 id 与平方值

CHUNK = 10000                                       # 每块读取 1 万行
total_rows = 0                                      # 累计数据行数
with open(big_csv, encoding="utf-8", newline="") as f:  # 打开大文件
    reader = csv.reader(f)                          # 创建 reader
    next(reader)                                    # 跳过表头
    chunk = []                                      # 当前块缓冲
    for row in reader:                              # 逐行读取
        chunk.append(row)                           # 加入当前块
        if len(chunk) >= CHUNK:                     # 块满
            total_rows += len(chunk)                # 累加本块行数
            print(f"  处理一块: {len(chunk)} 行，累计 {total_rows}")  # 打印进度
            chunk = []                              # 清空缓冲进入下一块
    if chunk:                                       # 处理最后不足一块的剩余
        total_rows += len(chunk)                    # 累加剩余行数
        print(f"  处理尾块: {len(chunk)} 行，累计 {total_rows}")  # 打印尾块
print(f"大 CSV 共 {total_rows} 行数据")             # 打印总行数

# ---------- 5. 实战 A：数据导出（对象列表 -> CSV） ----------
employees = [                                       # 模拟从数据库查出的员工列表
    {"name": "张三", "dept": "研发", "salary": 25000},  # 员工 1
    {"name": "李四", "dept": "市场", "salary": 18000},  # 员工 2
    {"name": "王五", "dept": "研发", "salary": 28000},  # 员工 3
]
export_path = os.path.join(work, "export.csv")      # 导出文件路径
fields = ["name", "dept", "salary"]                 # 指定导出列与顺序
with open(export_path, "w", encoding="utf-8-sig", newline="") as f:  # 打开导出文件
    writer = csv.DictWriter(f, fieldnames=fields)   # 创建 DictWriter，指定字段顺序
    writer.writeheader()                            # 写表头
    writer.writerows(employees)                     # 批量写入所有员工
print(f"已导出 {len(employees)} 条记录到 export.csv")  # 打印导出数量

# ---------- 6. 实战 B：报表生成（按部门统计平均工资） ----------
dept_sum = defaultdict(int)                         # 各部门工资合计
dept_cnt = defaultdict(int)                         # 各部门人数
with open(export_path, encoding="utf-8-sig", newline="") as f:  # 读取导出文件
    reader = csv.DictReader(f)                      # 字典方式读取
    for r in reader:                                # 遍历每行
        dept = r["dept"]                            # 取部门
        dept_sum[dept] += int(r["salary"])          # 工资转 int 并累加
        dept_cnt[dept] += 1                         # 人数加 1

report_path = os.path.join(work, "report.csv")      # 报表输出路径
with open(report_path, "w", encoding="utf-8-sig", newline="") as f:  # 打开报表文件
    writer = csv.writer(f)                          # 创建 writer
    writer.writerow(["部门", "人数", "平均工资"])     # 写报表表头
    for dept in dept_sum:                           # 遍历每个部门
        avg = dept_sum[dept] / dept_cnt[dept]       # 计算平均工资
        writer.writerow([dept, dept_cnt[dept], f"{avg:.2f}"])  # 写一行统计结果
print("部门报表:")                                  # 打印报表标题
with open(report_path, encoding="utf-8-sig", newline="") as f:  # 读回报表打印
    for line in f:                                  # 逐行打印报表内容
        print("  " + line.strip())                  # 去掉换行并缩进打印

# ---------- 清理 ----------
shutil.rmtree(work)                                 # 删除临时目录
print("✅ CSV 数据处理演示完成")                     # 提示完成
`,
  },

  // =============================================================
  // 第20章：目录遍历与文件搜索
  // =============================================================
  {
    id: "pykit-20",
    group: "文件与路径操作",
    icon: "📂",
    title: "目录遍历与文件搜索",
    content: `# 目录遍历与文件搜索

## 一、为什么需要遍历目录

文件操作很少只针对单个文件。真实开发里到处是"批量"场景：

- **清理临时文件**：扫描项目里所有 \`.tmp\`、\`.bak\`、\`.log\` 删掉。
- **代码统计**：数一数项目有多少 \`.py\` 文件、共多少行。
- **查找重复**：找出内容相同的文件，清理冗余。
- **批量重命名**：把所有 \`.JPG\` 改成 \`.jpg\`。
- **资源收集**：把所有 \`.png\` 收集到一个目录。

Python 提供了两套遍历工具：传统的 \`os.walk\` 和现代的 \`pathlib.Path.rglob\`。掌握它们就能应对绝大多数"找文件"需求。

## 二、os.walk 递归遍历

\`os.walk(top)\` 自顶向下（默认）递归遍历目录树，每次迭代产出一个三元组 \`(dirpath, dirnames, filenames)\`：

\`\`\`python
import os

for dirpath, dirnames, filenames in os.walk("."):
    print("当前目录:", dirpath)
    print("子目录:", dirnames)
    print("文件:", filenames)
\`\`\`

- \`dirpath\`：当前所在目录的路径（字符串）。
- \`dirnames\`：当前目录下的**子目录名**列表（不含路径，只有名字）。
- \`filenames\`：当前目录下的**文件名**列表（不含子目录）。

关键技巧：**修改 \`dirnames\` 可以控制遍历行为**。比如想跳过 \`.git\` 目录：

\`\`\`python
for dirpath, dirnames, filenames in os.walk("."):
    dirnames[:] = [d for d in dirnames if d != ".git"]  # 原地修改，跳过 .git
    for fn in filenames:
        print(os.path.join(dirpath, fn))
\`\`\`

注意是 \`dirnames[:] = ...\`（原地修改列表），而不是 \`dirnames = ...\`（重新赋值，walk 不会感知）。这是剪枝遍历的标准写法。

### 自顶向下 vs 自底向上

\`os.walk(top, topdown=False)\` 改成自底向上遍历——先处理子目录再处理父目录。**删除目录树时必须自底向上**（先删子文件再删空目录），否则父目录非空删不掉。

## 三、pathlib.Path.rglob 递归查找

\`Path.rglob(pattern)\` 是更现代的写法，直接返回匹配的 \`Path\` 对象生成器：

\`\`\`python
from pathlib import Path

for f in Path(".").rglob("*.py"):      # 递归找所有 .py 文件
    print(f, f.stat().st_size)         # Path 对象，可直接调用方法
\`\`\`

\`rglob("*.py")\` 等价于 \`glob("**/*.py")\`。\`**\` 表示递归任意层目录。

\`os.walk\` vs \`rglob\` 对比：

| 维度 | os.walk | Path.rglob |
|------|---------|------------|
| 返回 | 三元组（需自己拼路径） | Path 对象（开箱即用） |
| 过滤 | 手动判断扩展名 | 通配符模式 |
| 剪枝 | 修改 dirnames | 较难（要判断父目录） |
| 灵活度 | 高（能拿到 dirnames 做控制） | 简单场景更顺手 |
| 适用 | 需要目录结构控制、自底向上 | 纯找文件、简单遍历 |

经验：**简单找文件用 \`rglob\`，需要剪枝或自底向上用 \`os.walk\`**。

## 四、按扩展名 / 大小 / 修改时间筛选

遍历拿到文件后，常用 \`Path.stat()\` 取属性做筛选：

\`\`\`python
from pathlib import Path
import time

for f in Path(".").rglob("*"):
    if not f.is_file():
        continue
    st = f.stat()
    # 扩展名
    if f.suffix == ".py":
        ...
    # 大小（字节）
    if st.st_size > 1024 * 1024:        # 大于 1MB
        ...
    # 修改时间（时间戳）
    mtime = st.st_mtime
    age_days = (time.time() - mtime) / 86400
    if age_days > 30:                    # 超过 30 天未修改
        ...
\`\`\`

\`stat()\` 常用属性：

| 属性 | 含义 |
|------|------|
| \`st_size\` | 文件大小（字节） |
| \`st_mtime\` | 最后修改时间（时间戳） |
| \`st_ctime\` | 创建时间（Windows）/ 元数据变更时间（Unix） |
| \`st_atime\` | 最后访问时间 |
| \`st_mode\` | 权限与类型位 |

注意：\`stat()\` 每次调用都会发起系统调用，遍历大量文件时避免重复调用——把结果存起来复用。

## 五、查找重复文件

经典场景：找出内容相同的文件。思路是**按文件内容哈希分组**——哈希相同的文件视为重复：

\`\`\`python
import hashlib
from pathlib import Path
from collections import defaultdict

hash_map = defaultdict(list)
for f in Path(".").rglob("*"):
    if f.is_file():
        h = hashlib.md5(f.read_bytes()).hexdigest()   # 算文件内容 MD5
        hash_map[h].append(str(f))

for h, paths in hash_map.items():
    if len(paths) > 1:                   # 同一哈希多于一个文件 = 重复
        print("重复:", paths)
\`\`\`

优化思路（大文件场景）：

1. **先按大小分组**：大小不同的文件内容必然不同，先按 \`st_size\` 粗分，只在大小相同的组里算哈希。
2. **只哈希部分内容**：先哈希前 4KB，相同再哈希全文。
3. **用 \`sha256\`**：MD5 有碰撞风险，去重场景建议更安全的算法。

\`read_bytes()\` 会把整个文件读进内存。处理大文件要用分块哈希：

\`\`\`python
def file_hash(path, chunk=65536):
    m = hashlib.md5()
    with open(path, "rb") as f:
        while chunk_data := f.read(chunk):
            m.update(chunk_data)
    return m.hexdigest()
\`\`\`

## 六、实战 demo 说明

本章代码演示两个场景：

- **清理临时文件**：扫描临时目录里所有 \`.tmp\`、\`.bak\` 文件并删除，演示 \`rglob\` + \`unlink\` 的批量清理模式。
- **项目代码统计**：递归找出所有 \`.py\` 文件，统计文件数与总行数，演示"遍历 + 读取 + 聚合"的统计模式。

代码还演示了 \`os.walk\` 带缩进的目录树打印、按扩展名分布统计、按内容哈希查重，全部在临时目录里完成，运行结束清理。

## 七、常见坑

1. **\`rglob("*")\` 包含目录**：要 \`is_file()\` 过滤，否则会把目录当文件处理。
2. **重复 \`stat()\` 调用**：每次都是系统调用，遍历大目录时缓存结果。
3. **\`os.walk\` 剪枝用赋值**：必须 \`dirnames[:] = ...\` 原地改，赋值无效。
4. **删除目录顺序**：\`rmdir\` 只删空目录，删目录树要自底向上或用 \`shutil.rmtree\`。
5. **\`read_bytes()\` 读大文件**：内存爆炸，改分块读。
6. **符号链接导致循环**：\`os.walk\` 默认不跟随符号链接（\`followlinks=False\`），\`rglob\` 也不跟随，安全。
7. **权限不足**：遍历时遇到无权限目录会抛 \`PermissionError\`，用 \`try/except\` 兜底。

## 八、性能与扩展

处理超大目录树（百万文件）时：

- **优先用 \`scandir\`**：\`os.scandir()\` 比 \`os.listdir()\` 快，因为它在遍历时就拿到了文件类型信息，少一次 \`stat\`。\`os.walk\` 在 Python 3.5+ 已基于 \`scandir\` 实现。
- **并行处理**：用 \`concurrent.futures.ThreadPoolExecutor\` 并行处理每个文件（IO 密集型适合多线程）。
- **第三方库**：\`pathspec\`（支持 .gitignore 规则）、\`scandir\`（旧 Python 加速）、\`tqdm\`（进度条）。

实战中"按 .gitignore 过滤"很常见——遍历时跳过 \`.git\`、\`node_modules\`、\`__pycache__\`、\`venv\` 等。简单做法是维护一个忽略集合：

\`\`\`python
IGNORE = {".git", "node_modules", "__pycache__", ".venv", "dist", "build"}
for dirpath, dirnames, filenames in os.walk("."):
    dirnames[:] = [d for d in dirnames if d not in IGNORE]   # 原地剪枝
    ...
\`\`\`

## 九、把前几章串起来

到这里，文件与路径操作的五块拼图就齐了：

| 章 | 能力 | 典型用法 |
|----|------|----------|
| 16 pathlib | 路径对象操作 | 拼接、拆解、增删 |
| 17 文件读写 | open 读写 | 逐行处理大文件 |
| 18 JSON | 序列化 | 配置文件、API |
| 19 CSV | 表格数据 | 数据导出、报表 |
| 20 遍历搜索 | 批量找文件 | 清理、统计、查重 |

组合起来能解决大量真实问题：扫描项目所有 \`.json\` 配置校验格式、统计 \`.py\` 代码行数、找出超大日志文件、批量重命名图片……这些正是运维脚本、构建工具、数据分析的日常。

## 本章小结

- \`os.walk\` 产三元组，能剪枝、能自底向上，适合需要目录控制的场景。
- \`Path.rglob\` 返回 Path 对象，简单找文件最顺手。
- 用 \`stat()\` 取大小/时间做筛选，注意缓存避免重复系统调用。
- 查重按内容哈希分组，大文件用分块哈希或先按大小粗分。
- \`os.walk\` 剪枝要 \`dirnames[:] = ...\` 原地修改。
- 删目录树用 \`shutil.rmtree\` 或自底向上 \`os.walk(topdown=False)\`。
- 遍历大目录善用 \`scandir\`、多线程、忽略集合。

至此，文件与路径操作这一批章节结束。掌握这些，你就能写出绝大多数与文件打交道的 Python 脚本。
`,
    code: `
# =============================================================
# 第20章代码：目录遍历与文件搜索（纯标准库，可独立运行）
# =============================================================
# 演示内容：
# 1. os.walk 递归遍历目录树
# 2. pathlib.Path.rglob 递归查找
# 3. 按扩展名 / 大小筛选文件
# 4. 查找重复文件（按内容哈希）
# 5. 实战：清理临时文件、项目代码统计

import os                           # 导入 os 模块，目录遍历与路径操作
import hashlib                      # 导入 hashlib，计算文件哈希用于查重
import tempfile                     # 导入 tempfile，创建临时目录
import shutil                       # 导入 shutil，清理目录
from pathlib import Path            # 从 pathlib 导入 Path 类
from collections import defaultdict # 导入 defaultdict，分组容器

work = tempfile.mkdtemp(prefix="pykit20_")          # 创建临时工作目录
root = Path(work)                                   # 包装成 Path 对象方便操作
print(f"工作目录: {work}")                          # 打印工作目录

# ---------- 0. 造一个模拟项目结构 ----------
(root / "src").mkdir()                              # 创建 src 目录
(root / "src" / "utils").mkdir()                    # 创建 src/utils 子目录
(root / "tests").mkdir()                            # 创建 tests 目录
(root / "logs").mkdir()                             # 创建 logs 目录
(root / "src" / "main.py").write_text("print('hi')\\n", encoding="utf-8")        # 写源码文件
(root / "src" / "utils" / "helper.py").write_text("def f():\\n    return 1\\n", encoding="utf-8")  # 写工具文件
(root / "src" / "utils" / "data.json").write_text('{"a":1}', encoding="utf-8")  # 写 JSON 文件
(root / "tests" / "test_main.py").write_text("assert True\\n", encoding="utf-8") # 写测试文件
(root / "logs" / "app.log").write_text("error\\n" * 10, encoding="utf-8")        # 写日志文件
(root / "logs" / "tmp.bak").write_text("backup", encoding="utf-8")              # 写备份文件
(root / "logs" / "old.tmp").write_text("tmp", encoding="utf-8")                 # 写临时文件

# ---------- 1. os.walk 递归遍历 ----------
print("\\n--- os.walk 遍历 ---")                     # 打印分隔标题
for dirpath, dirnames, filenames in os.walk(work):  # os.walk 产出三元组（当前目录、子目录列表、文件列表）
    level = dirpath.count(os.sep) - work.count(os.sep)  # 计算相对深度
    indent = "  " * level                           # 按深度缩进
    print(f"{indent}{os.path.basename(dirpath) or '/'}")  # 打印目录名
    for fn in filenames:                            # 遍历该目录下的文件
        print(f"{indent}  - {fn}")                  # 缩进打印文件名

# ---------- 2. pathlib.rglob 递归查找 ----------
py_files = list(root.rglob("*.py"))                 # rglob 递归查找所有 .py 文件
print(f"\\n找到 {len(py_files)} 个 .py 文件")        # 打印找到的 Python 文件数
for p in py_files:                                  # 遍历每个 py 文件
    print(f"  {p.relative_to(root)}")               # relative_to 打印相对路径

# ---------- 3. 按扩展名 / 大小筛选 ----------
ext_count = defaultdict(int)                        # 扩展名计数器
for p in root.rglob("*"):                           # 递归遍历所有条目
    if p.is_file():                                 # 只看文件
        ext_count[p.suffix or "(无后缀)"] += 1      # suffix 为空则归为无后缀
print("\\n扩展名分布:", dict(ext_count))            # 打印各扩展名文件数

big_files = [p for p in root.rglob("*") if p.is_file() and p.stat().st_size > 50]  # 筛选大于 50 字节的文件
print(f"大于 50 字节的文件 {len(big_files)} 个")    # 打印大文件数量

# ---------- 4. 查找重复文件（按内容哈希） ----------
hash_map = defaultdict(list)                        # 哈希到文件路径列表的映射
(root / "src" / "dup.py").write_text("print('hi')\\n", encoding="utf-8")  # 写一个与 main.py 内容相同的文件制造重复
for p in root.rglob("*"):                           # 遍历所有文件
    if p.is_file():                                 # 只处理文件
        h = hashlib.md5(p.read_bytes()).hexdigest()  # 计算文件内容的 MD5 哈希
        hash_map[h].append(str(p.relative_to(root)))  # 把相对路径加入对应哈希组
print("\\n重复文件:")                               # 打印重复文件标题
for h, paths in hash_map.items():                   # 遍历每个哈希组
    if len(paths) > 1:                              # 同一哈希有多于一个文件即为重复
        print(f"  哈希 {h[:8]}: {paths}")           # 打印哈希前 8 位与重复文件列表

# ---------- 5. 实战 A：清理临时文件 ----------
JUNK_EXT = {".tmp", ".bak"}                         # 定义要清理的垃圾扩展名集合
removed = 0                                         # 记录已删除数量
for p in root.rglob("*"):                           # 递归遍历
    if p.is_file() and p.suffix in JUNK_EXT:        # 是文件且扩展名在垃圾集合中
        print(f"  删除: {p.relative_to(root)}")     # 打印正在删除的文件
        p.unlink()                                  # unlink 删除文件
        removed += 1                                # 计数加 1
print(f"共清理 {removed} 个临时文件")               # 打印清理总数

# ---------- 6. 实战 B：项目代码统计 ----------
stats = defaultdict(lambda: {"files": 0, "lines": 0})  # 每种扩展名的文件数与行数
for p in root.rglob("*.py"):                        # 只统计 Python 源码
    if p.is_file():                                 # 确保是文件
        lines = len(p.read_text(encoding="utf-8").splitlines())  # 读取并按行数统计
        stats[".py"]["files"] += 1                  # 文件数加 1
        stats[".py"]["lines"] += lines              # 行数累加
print("\\n代码统计:")                               # 打印统计标题
for ext, info in stats.items():                     # 遍历统计结果
    print(f"  {ext}: {info['files']} 文件, {info['lines']} 行")  # 打印扩展名、文件数、行数

# ---------- 清理 ----------
shutil.rmtree(work)                                 # 删除整个临时目录
print("✅ 目录遍历演示完成")                         # 提示完成
`,
  },
];
