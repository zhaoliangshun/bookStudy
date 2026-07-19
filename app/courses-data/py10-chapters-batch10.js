// =============================================================
// Python 从入门到精通大全（终极版）—— 第10批章节
// 第十部分 文件 IO 与模块（共 5 章）
// =============================================================

const chapters = [
  // ============================================================
  // 第四十六章 文件读写基础
  // ============================================================
  {
    id: 'py10-ch46',
    group: '第十部分 文件 IO 与模块',
    icon: '📄',
    title: '第四十六章 文件读写基础',
    content: `## 第四十六章 文件读写基础

文件读写是程序与外部世界交互最基本的方式——配置文件、日志、数据文件、缓存都离不开它。这一章把 \`open()\` 的所有模式、读写方法、编码问题彻底讲清楚。

### 一、open() 函数基础

\`open()\` 是 Python 内置函数，返回一个文件对象：

\`\`\`python
# 最基本的用法
# 参数：文件路径、模式、编码
f = open("demo.txt", "w", encoding="utf-8")
# 写入内容
f.write("hello world\\n")
f.write("你好，世界\\n")
# 必须手动 close，否则可能数据没刷盘
f.close()

# 读出来验证
f = open("demo.txt", "r", encoding="utf-8")
content = f.read()
print(f"读到的内容：{content!r}")
f.close()

# 清理
import os
os.remove("demo.txt")
\`\`\`

### 二、模式字符详解

\`open()\` 的第二个参数是模式字符串，由以下字符组合：

| 字符 | 含义 | 文件不存在时 | 是否覆盖 |
|-----|------|------------|---------|
| \`r\` | 只读（默认） | 报错 | - |
| \`w\` | 只写 | 创建 | 覆盖 |
| \`a\` | 追加 | 创建 | 追加 |
| \`x\` | 独占创建 | 报错 | - |
| \`b\` | 二进制模式 | - | - |
| \`+\` | 读写模式 | - | - |

\`\`\`python
# 演示各种模式
import os

# w 模式：覆盖现有内容
with open("test.txt", "w", encoding="utf-8") as f:
    f.write("第一次写入")

with open("test.txt", "r", encoding="utf-8") as f:
    print(f"w 后读取：{f.read()!r}")

# 再次 w：覆盖
with open("test.txt", "w", encoding="utf-8") as f:
    f.write("第二次写入")

with open("test.txt", "r", encoding="utf-8") as f:
    print(f"再次 w 后：{f.read()!r}")

# a 模式：追加
with open("test.txt", "a", encoding="utf-8") as f:
    f.write("\\n追加的内容")

with open("test.txt", "r", encoding="utf-8") as f:
    print(f"a 后读取：{f.read()!r}")

# x 模式：独占创建，文件已存在会报错
try:
    with open("test.txt", "x", encoding="utf-8") as f:
        f.write("不会执行")
except FileExistsError:
    print("x 模式：文件已存在，创建失败")

os.remove("test.txt")
\`\`\`

### 三、二进制模式 b

文本模式会自动处理换行符（\`\\n\` ↔ 平台默认），二进制模式则是逐字节：

\`\`\`python
import os

# 文本模式：写入字符串
with open("text.txt", "w", encoding="utf-8") as f:
    f.write("你好")

# 二进制模式：必须写入 bytes
with open("bin.dat", "wb") as f:
    # bytes 字面量：b"..."
    f.write(b"hello\\n")
    # 写入中文需要先编码
    f.write("你好".encode("utf-8"))

# 读取二进制
with open("bin.dat", "rb") as f:
    data = f.read()
    print(f"二进制读取：{data!r}")
    # 解码成字符串
    print(f"解码后：{data.decode('utf-8')}")

# 文本模式 vs 二进制模式的换行
# Windows 上文本模式会自动把 \\n 转成 \\r\\n
# 二进制模式则原样读写
for f in ["text.txt", "bin.dat"]:
    if os.path.exists(f):
        os.remove(f)
\`\`\`

### 四、读写模式 +

\`+\` 让模式变成"可读可写"：

\`\`\`python
# r+：可读写，文件必须存在
import os

with open("rw.txt", "w", encoding="utf-8") as f:
    f.write("hello world")

# r+ 模式：可读可写，初始位置在开头
with open("rw.txt", "r+", encoding="utf-8") as f:
    content = f.read()
    print(f"读取：{content!r}")
    # 写入会覆盖当前位置之后的内容
    f.seek(0)  # 移动到开头
    f.write("HELLO")  # 覆盖前 5 字符
    f.seek(0)
    print(f"修改后：{f.read()!r}")

os.remove("rw.txt")
\`\`\`

### 五、read / readline / readlines

三种读取方式各有用途：

\`\`\`python
import os

# 准备一个多行文件
with open("multiline.txt", "w", encoding="utf-8") as f:
    f.write("第一行\\n第二行\\n第三行\\n")

# 1. read()：一次性读全部
with open("multiline.txt", "r", encoding="utf-8") as f:
    content = f.read()
    print(f"read 全部：{content!r}")

# 2. read(n)：读 n 个字符
with open("multiline.txt", "r", encoding="utf-8") as f:
    chunk = f.read(3)
    print(f"read(3)：{chunk!r}")

# 3. readline()：每次读一行
with open("multiline.txt", "r", encoding="utf-8") as f:
    line1 = f.readline()
    line2 = f.readline()
    print(f"第一行：{line1!r}")
    print(f"第二行：{line2!r}")

# 4. readlines()：读所有行，返回列表
with open("multiline.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()
    print(f"所有行：{lines}")

os.remove("multiline.txt")
\`\`\`

### 六、write / writelines

\`\`\`python
import os

# write：写入字符串
with open("w.txt", "w", encoding="utf-8") as f:
    # write 不会自动加换行
    f.write("第一行")
    f.write("第二行")  # 紧贴第一行
    # 要换行得自己加
    f.write("\\n")

with open("w.txt", "r", encoding="utf-8") as f:
    print(f"内容：{f.read()!r}")

# writelines：写入列表，也不自动加换行
with open("w.txt", "w", encoding="utf-8") as f:
    lines = ["第一行", "第二行", "第三行"]
    # 要手动加换行
    f.writelines(line + "\\n" for line in lines)

with open("w.txt", "r", encoding="utf-8") as f:
    print(f"writelines 后：{f.read()!r}")

os.remove("w.txt")
\`\`\`

### 七、with 语句处理文件

**永远用 with，不要手动 close**：

\`\`\`python
# ❌ 反模式：手动 close
f = open("bad.txt", "w", encoding="utf-8")
try:
    f.write("hello")
finally:
    f.close()

# ✅ 用 with：自动 close，即使出异常也会关闭
with open("good.txt", "w", encoding="utf-8") as f:
    f.write("hello")
    # 即使这里抛异常，文件也会被关闭
    # raise ValueError("测试")
# 离开 with 块后，f 已关闭

# 验证
import os
for name in ["bad.txt", "good.txt"]:
    if os.path.exists(name):
        os.remove(name)
print("演示完成")
\`\`\`

### 八、文件指针 seek / tell

\`\`\`python
import os

with open("seek.txt", "w", encoding="utf-8") as f:
    f.write("ABCDEFGH")

with open("seek.txt", "r", encoding="utf-8") as f:
    # tell() 返回当前位置（字符位置）
    print(f"初始位置：{f.tell()}")

    # read 3 个字符
    print(f.read(3))  # ABC
    print(f"读完 3 个后位置：{f.tell()}")  # 3

    # seek(0) 移动到开头
    f.seek(0)
    print(f"seek(0) 后：{f.tell()}")  # 0

    # seek(n)：绝对位置
    f.seek(5)
    print(f"seek(5) 后读取：{f.read()}")  # FGH

    # seek(offset, whence)：相对位置
    # whence=0：开头（默认）
    # whence=1：当前位置
    # whence=2：末尾
    f.seek(0)
    f.seek(3, 1)  # 从当前位置前进 3
    print(f"从当前位置 +3：{f.read(2)}")  # DE

os.remove("seek.txt")
\`\`\`

### 九、文件编码

中文场景**永远指定 encoding="utf-8"**，否则在 Windows 上默认 gbk 会出问题：

\`\`\`python
import os

# ❌ 不指定编码（依赖平台）
# Windows: 默认 gbk
# Linux/Mac: 默认 utf-8
# f = open("file.txt", "w")  # 不推荐

# ✅ 显式指定 utf-8
with open("chinese.txt", "w", encoding="utf-8") as f:
    f.write("你好，世界")

# 读取时也必须指定同样编码
with open("chinese.txt", "r", encoding="utf-8") as f:
    print(f.read())

# 处理其他编码的文件
# 比如读取 gbk 编码的文件
# with open("gbk.txt", "r", encoding="gbk") as f:
#     content = f.read()

# 处理编码错误
with open("mixed.txt", "w", encoding="utf-8", errors="replace") as f:
    f.write("hello")

# errors 参数：
# "strict"（默认）：抛 UnicodeDecodeError
# "replace"：用 ? 替换无法解码的字节
# "ignore"：跳过无法解码的字节
with open("mixed.txt", "rb") as f:
    raw = f.read()

# 模拟解码错误
try:
    # 故意用错误编码解码
    raw.decode("ascii")
except UnicodeDecodeError as e:
    print(f"严格模式失败：{e}")

# 用 replace 容错
print(f"容错解码：{raw.decode('ascii', errors='replace')!r}")

os.remove("chinese.txt")
os.remove("mixed.txt")
\`\`\`

### 十、文件迭代：逐行处理

\`\`\`python
import os

# 生成一个大文件
with open("big.txt", "w", encoding="utf-8") as f:
    for i in range(1000):
        f.write(f"第 {i} 行\\n")

# ❌ 大文件别用 read() / readlines()
# 会把整个文件加载到内存
# with open("big.txt") as f:
#     all_lines = f.readlines()  # 内存爆炸

# ✅ 直接遍历文件对象，逐行读
# 这是 Python 最优雅的写法
with open("big.txt", "r", encoding="utf-8") as f:
    count = 0
    for line in f:  # 每次只读一行到内存
        count += 1
        if count <= 3:
            print(f"行 {count}：{line.rstrip()}")
    print(f"总共 {count} 行")

# 用生成器表达式处理大文件
def count_words(path):
    """统计文件总词数，内存友好。"""
    total = 0
    with open(path, "r", encoding="utf-8") as f:
        # 生成器表达式：惰性求值
        for line in f:
            total += len(line.split())
    return total

print(f"总词数：{count_words('big.txt')}")
os.remove("big.txt")
\`\`\`

### 十一、pathlib.Path 入门

\`pathlib\` 是现代 Python 推荐的路径操作库（替代 \`os.path\`）：

\`\`\`python
from pathlib import Path
import os

# 创建 Path 对象
p = Path("hello.txt")
print(f"类型：{type(p).__name__}")

# 写入文件
p.write_text("hello world", encoding="utf-8")

# 读取文件
content = p.read_text(encoding="utf-8")
print(f"读取：{content!r}")

# 二进制
p2 = Path("data.bin")
p2.write_bytes(b"\\x00\\x01\\x02")
data = p2.read_bytes()
print(f"二进制：{data!r}")

# 清理
p.unlink()  # 删除文件
p2.unlink()
\`\`\`

### 十二、Path 的 / 操作符

\`pathlib\` 用 \`/\` 拼接路径，比 \`os.path.join\` 直观：

\`\`\`python
from pathlib import Path

# 用 / 拼接路径
home = Path("/Users/zhangsan")
config = home / ".config" / "app" / "config.yaml"
print(f"配置文件路径：{config}")

# 也可以用 joinpath
config2 = home.joinpath(".config", "app", "config.yaml")
print(f"joinpath 结果：{config2}")

# 等价于 os.path.join
import os
old_way = os.path.join("/Users/zhangsan", ".config", "app", "config.yaml")
print(f"os.path.join 结果：{old_way}")

# 拼接时路径分隔符跨平台
# Windows: Path("C:\\\\Users") / "zhang"  → WindowsPath('C:/Users/zhang')
# Linux/Mac: Path("/home") / "zhang"     → PosixPath('/home/zhang')
print(f"当前平台 Path 类型：{type(Path()).__name__}")
\`\`\`

### 十三、Path 的属性

\`\`\`python
from pathlib import Path

p = Path("/Users/zhangsan/projects/main.py")

# 文件名（含扩展名）
print(f"name: {p.name}")           # main.py

# 文件名（不含扩展名）
print(f"stem: {p.stem}")           # main

# 扩展名（含点）
print(f"suffix: {p.suffix}")       # .py

# 所有扩展名（如 main.tar.gz）
p2 = Path("archive.tar.gz")
print(f"suffixes: {p2.suffixes}")  # ['.tar', '.gz']

# 父目录
print(f"parent: {p.parent}")       # /Users/zhangsan/projects

# 所有父目录
print(f"parents: {[str(x) for x in p.parents]}")

# 各部分
print(f"parts: {p.parts}")         # ('/', 'Users', 'zhangsan', 'projects', 'main.py')

# 锚点（根目录）
print(f"anchor: {p.anchor}")       # /
\`\`\`

### 十四、Path 的常用方法

\`\`\`python
from pathlib import Path
import os

# 创建测试文件
p = Path("test_path.txt")
p.write_text("hello", encoding="utf-8")

# 判断
print(f"exists: {p.exists()}")    # True
print(f"is_file: {p.is_file()}")  # True
print(f"is_dir: {p.is_dir()}")   # False

# 文件信息
print(f"size: {p.stat().st_size} 字节")
print(f"修改时间: {p.stat().st_mtime}")

# 重命名
p2 = Path("renamed.txt")
p.rename(p2)
print(f"原文件存在: {p.exists()}")   # False
print(f"新文件存在: {p2.exists()}")  # True

# 删除
p2.unlink()
print(f"删除后存在: {p2.exists()}")  # False
\`\`\`

### 十五、目录操作

\`\`\`python
from pathlib import Path
import shutil

# 创建目录
d = Path("test_dir")
d.mkdir()  # 已存在会报错
print(f"目录创建：{d.exists()}")

# mkdir parents=True 类似 mkdir -p
nested = Path("test_dir/a/b/c")
nested.mkdir(parents=True, exist_ok=True)
print(f"嵌套目录：{nested.exists()}")

# 列出目录内容
print("\\n目录内容：")
for item in d.iterdir():
    print(f"  {item.name} ({'目录' if item.is_dir() else '文件'})")

# glob 匹配
print("\\n匹配 *.py：")
# 创建一些文件
(d / "a.py").write_text("")
(d / "b.py").write_text("")
(d / "c.txt").write_text("")
for f in d.glob("*.py"):
    print(f"  {f.name}")

# rglob 递归匹配
for f in d.rglob("*.py"):
    print(f"  递归找到：{f.relative_to(d)}")

# 删除整个目录
shutil.rmtree("test_dir")
print("清理完成")
\`\`\`

### 十六、文件操作的常见异常

\`\`\`python
from pathlib import Path

# 1. FileNotFoundError：文件不存在
try:
    Path("nonexistent.txt").read_text()
except FileNotFoundError as e:
    print(f"文件不存在：{e}")

# 2. FileExistsError：x 模式或 mkdir 已存在
try:
    Path("existing.txt").write_text("hello", encoding="utf-8")
    Path("existing.txt").write_text("world", encoding="utf-8")  # 覆盖
    # x 模式才会报错
    with open("existing.txt", "x", encoding="utf-8") as f:
        pass
except FileExistsError as e:
    print(f"文件已存在：{e}")
Path("existing.txt").unlink()

# 3. PermissionError：权限不足
# try:
#     Path("/root/secret.txt").read_text()
# except PermissionError as e:
#     print(f"权限不足：{e}")

# 4. IsADirectoryError：把目录当文件读
Path("a_dir").mkdir(exist_ok=True)
try:
    with open("a_dir", "r", encoding="utf-8") as f:
        f.read()
except IsADirectoryError as e:
    print(f"是目录不是文件：{e}")
Path("a_dir").rmdir()

# 5. UnicodeDecodeError：编码不对
Path("utf8.txt").write_bytes("你好".encode("utf-8"))
try:
    Path("utf8.txt").read_text(encoding="ascii")
except UnicodeDecodeError as e:
    print(f"解码失败：{e}")
Path("utf8.txt").unlink()
\`\`\`

### 十七、综合实战：日志文件分析器

\`\`\`python
from pathlib import Path
from collections import Counter
import re

# 生成模拟日志
log_content = """
2026-01-01 10:00:00 INFO User login: alice
2026-01-01 10:01:00 WARNING Slow query: 1.2s
2026-01-01 10:02:00 INFO User login: bob
2026-01-01 10:03:00 ERROR Database connection failed
2026-01-01 10:04:00 INFO User logout: alice
2026-01-01 10:05:00 WARNING Slow query: 2.1s
2026-01-01 10:06:00 ERROR File not found: config.yaml
2026-01-01 10:07:00 INFO User login: charlie
"""

log_file = Path("app.log")
log_file.write_text(log_content.strip(), encoding="utf-8")

# 分析日志：统计各级别出现次数
def analyze_log(path):
    """分析日志文件，返回级别统计。"""
    counter = Counter()
    errors = []
    # 逐行读，内存友好
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            # 用正则提取日志级别
            match = re.search(r'\\b(INFO|WARNING|ERROR|DEBUG)\\b', line)
            if match:
                level = match.group(1)
                counter[level] += 1
                if level == "ERROR":
                    errors.append(line.strip())
    return counter, errors

counter, errors = analyze_log(log_file)
print("=== 日志统计 ===")
for level, count in counter.most_common():
    print(f"  {level}: {count} 次")

print(f"\\n=== 错误详情（共 {len(errors)} 条）===")
for err in errors:
    print(f"  → {err}")

# 清理
log_file.unlink()
\`\`\`

### 十八、文件复制的几种方式

\`\`\`python
from pathlib import Path
import shutil

# 准备源文件
src = Path("source.txt")
src.write_text("原始内容", encoding="utf-8")

# 方式 1：shutil.copyfile（只复制内容，不含元信息）
dst1 = Path("copy1.txt")
shutil.copyfile(src, dst1)
print(f"copyfile: {dst1.read_text(encoding='utf-8')}")

# 方式 2：shutil.copy（复制内容 + 权限）
dst2 = Path("copy2.txt")
shutil.copy(src, dst2)
print(f"copy: {dst2.read_text(encoding='utf-8')}")

# 方式 3：shutil.copy2（复制内容 + 权限 + 元信息）
dst3 = Path("copy3.txt")
shutil.copy2(src, dst3)
print(f"copy2: {dst3.read_text(encoding='utf-8')}")

# 方式 4：手动读写（适合特殊处理）
dst4 = Path("copy4.txt")
dst4.write_bytes(src.read_bytes())
print(f"手动: {dst4.read_text(encoding='utf-8')}")

# 清理
for f in [src, dst1, dst2, dst3, dst4]:
    f.unlink()
print("清理完成")
\`\`\`

### 十九、临时文件

\`\`\`python
import tempfile
from pathlib import Path

# 1. NamedTemporaryFile：创建带名字的临时文件
with tempfile.NamedTemporaryFile(
    mode='w', suffix='.txt', prefix='demo_',
    encoding='utf-8', delete=False
) as tmp:
    tmp.write("临时内容")
    print(f"临时文件路径：{tmp.name}")
# delete=False 让文件不自动删除

# 用完手动删
Path(tmp.name).unlink()

# 2. mkstemp：更低级的临时文件
fd, path = tempfile.mkstemp(suffix='.log', prefix='app_')
print(f"mkstemp 创建：{path}")
import os
os.close(fd)  # 关闭文件描述符
Path(path).unlink()

# 3. 临时目录
with tempfile.TemporaryDirectory(prefix='work_') as tmpdir:
    print(f"临时目录：{tmpdir}")
    # 在里面创建文件
    (Path(tmpdir) / "data.txt").write_text("hello", encoding="utf-8")
    print(f"目录内容：{list(Path(tmpdir).iterdir())}")
# 离开 with 块，目录自动删除
print(f"目录还在吗：{Path(tmpdir).exists()}")
\`\`\`

## 小结

- ⭐ \`open()\` 模式字符：\`r\`（读）/ \`w\`（写覆盖）/ \`a\`（追加）/ \`x\`（独占创建）/ \`b\`（二进制）/ \`+\`（读写）。
- ⭐ 读写方法：\`read\` / \`readline\` / \`readlines\` / \`write\` / \`writelines\`，**大文件用文件迭代逐行读**。
- ⭐ **永远用 \`with\`** 自动关闭文件；中文场景**永远指定 \`encoding="utf-8"\`**。
- ⭐ \`pathlib.Path\` 是现代路径操作首选：\`/\` 拼接、\`.read_text()\` / \`.write_text()\` 一行搞定读写。
- ⭐ \`Path\` 常用属性：\`.name\` / \`.stem\` / \`.suffix\` / \`.parent\` / \`.parts\`。
- ⭐ \`Path\` 常用方法：\`.exists()\` / \`.is_file()\` / \`.is_dir()\` / \`.mkdir()\` / \`.unlink()\` / \`.glob()\` / \`.rglob()\`。
- 文件操作常见异常：\`FileNotFoundError\` / \`FileExistsError\` / \`PermissionError\` / \`IsADirectoryError\` / \`UnicodeDecodeError\`。
- 临时文件用 \`tempfile\` 模块：\`NamedTemporaryFile\` / \`mkstemp\` / \`TemporaryDirectory\`。

下一章深入 \`pathlib\`，把路径操作、目录遍历、文件匹配彻底讲透。`,
  },

  // ============================================================
  // 第四十七章 pathlib 与文件系统
  // ============================================================
  {
    id: 'py10-ch47',
    group: '第十部分 文件 IO 与模块',
    icon: '📁',
    title: '第四十七章 pathlib 与文件系统',
    content: `## 第四十七章 pathlib 与文件系统

\`pathlib\` 是 Python 3.4 引入的现代路径库，**强烈推荐替代 \`os.path\`**。它的设计哲学是"路径是一个对象，而不是字符串"——所有路径操作都通过方法调用，跨平台、类型安全、可读性高。

### 一、Path 对象创建

\`\`\`python
from pathlib import Path

# 1. 直接传字符串
p1 = Path("/home/user/file.txt")

# 2. 当前目录
p2 = Path()  # 等价于 Path(".")
print(f"当前目录：{p2}")

# 3. 用户家目录
p3 = Path.home()
print(f"家目录：{p3}")

# 4. 当前工作目录
p4 = Path.cwd()
print(f"工作目录：{p4}")

# 5. 从字符串
p5 = Path("/tmp") / "sub" / "file.txt"
print(f"拼接路径：{p5}")

# 6. 从 uri 或其他
# Path 会自动处理不同平台的分隔符
import os
print(f"系统分隔符：{os.sep!r}")
\`\`\`

### 二、路径拼接：/ 操作符

\`/\` 操作符让路径拼接变得直观：

\`\`\`python
from pathlib import Path

# / 可以拼接 Path 和字符串
base = Path("/var/log")
app_log = base / "myapp" / "app.log"
print(f"完整路径：{app_log}")

# 也可以连缀
log_dir = Path("/var") / "log" / "myapp"
print(f"连缀：{log_dir}")

# 注意：/ 两边类型要兼容
# Path / Path  ✅
# Path / str   ✅
# str / Path   ❌（要先 Path(str)）
# str / str    ❌（这变成字符串拼接）

# joinpath 等价于 /
p = Path("/data").joinpath("files", "doc.pdf")
print(f"joinpath：{p}")
\`\`\`

### 三、路径分解：属性访问

\`\`\`python
from pathlib import Path

p = Path("/home/zhang/projects/myapp/src/main.py")

# name: 文件名（含扩展名）
print(f"name: {p.name}")          # main.py

# stem: 文件名（不含扩展名）
print(f"stem: {p.stem}")          # main

# suffix: 扩展名（最后一个 . 后的部分，含点）
print(f"suffix: {p.suffix}")      # .py

# suffixes: 所有扩展名（多扩展名场景）
p2 = Path("archive.tar.gz")
print(f"suffixes: {p2.suffixes}")  # ['.tar', '.gz']

# parent: 父目录
print(f"parent: {p.parent}")      # /home/zhang/projects/myapp/src

# parents: 所有祖先目录
print(f"parents:")
for ancestor in p.parents:
    print(f"  {ancestor}")

# parts: 路径各部分
print(f"parts: {p.parts}")
# ('/', 'home', 'zhang', 'projects', 'myapp', 'src', 'main.py')

# anchor: 锚点（根或盘符）
print(f"anchor: {p.anchor}")      # /
\`\`\`

### 四、路径修改：with_xxx 方法

\`Path\` 是不可变对象，修改路径会返回新对象：

\`\`\`python
from pathlib import Path

p = Path("/data/files/report.txt")

# with_name：替换文件名
new_p = p.with_name("summary.md")
print(f"with_name: {new_p}")      # /data/files/summary.md

# with_stem：替换文件名（不含扩展名）
new_p = p.with_stem("report_v2")
print(f"with_stem: {new_p}")      # /data/files/report_v2.txt

# with_suffix：替换扩展名
new_p = p.with_suffix(".md")
print(f"with_suffix: {new_p}")    # /data/files/report.md

# with_parent：替换父目录（Python 3.12+）
# new_p = p.with_parent("/backup")

# 追加扩展名（用 / 而不是 +）
new_p = Path("archive") / ".tar.gz"
print(f"组合：{new_p}")

# 修改多扩展名
p2 = Path("data.tar.gz")
new_p = p2.with_suffix(".bz2")  # 只替换最后一个
print(f"多扩展名修改：{new_p}")  # data.tar.bz2
\`\`\`

### 五、相对路径与绝对路径

\`\`\`python
from pathlib import Path
import os

# 相对路径
rel = Path("docs/readme.md")
print(f"相对路径：{rel}")
print(f"is_absolute: {rel.is_absolute()}")  # False

# 绝对路径
abs_p = Path("/home/zhang/docs/readme.md")
print(f"is_absolute: {abs_p.is_absolute()}")  # True

# resolve(): 转成绝对路径，并解析符号链接、. 和 ..
# 在临时目录测试
import tempfile
os.chdir(tempfile.mkdtemp())

Path("a/b/c").mkdir(parents=True, exist_ok=True)
Path("a/b/c/test.txt").write_text("hello", encoding="utf-8")

# 相对路径
rel = Path("a/b/c/test.txt")
print(f"相对：{rel}")

# 转绝对
abs_path = rel.resolve()
print(f"绝对：{abs_path}")
print(f"is_absolute: {abs_path.is_absolute()}")

# resolve 还会解析 . 和 ..
weird = Path("a/b/../b/c/./test.txt")
print(f"含 . 和 ..：{weird}")
print(f"resolve 后：{weird.resolve()}")
\`\`\`

### 六、相对路径计算

\`\`\`python
from pathlib import Path

# relative_to: 计算相对路径
base = Path("/home/zhang/projects")
target = Path("/home/zhang/projects/myapp/main.py")
rel = target.relative_to(base)
print(f"相对路径：{rel}")  # myapp/main.py

# is_relative_to: 判断是否是某个路径的子路径（Python 3.9+）
print(f"is_relative_to: {target.is_relative_to(base)}")  # True
print(f"is_relative_to: {target.is_relative_to(Path('/etc'))}")  # False

# 失败会抛 ValueError
try:
    Path("/etc/passwd").relative_to("/home/zhang")
except ValueError as e:
    print(f"不在子树内：{e}")
\`\`\`

### 七、判断方法

\`\`\`python
from pathlib import Path
import os

os.chdir(tempfile.mkdtemp()) if False else None

# 创建测试文件和目录
Path("test.txt").write_text("hello", encoding="utf-8")
Path("test_dir").mkdir()
# 创建符号链接
try:
    Path("link.txt").symlink_to("test.txt")
except OSError:
    pass

# exists: 路径是否存在（不区分文件/目录/链接）
print(f"test.txt exists: {Path('test.txt').exists()}")  # True

# is_file: 是否是文件
print(f"is_file: {Path('test.txt').is_file()}")  # True
print(f"is_file (dir): {Path('test_dir').is_file()}")  # False

# is_dir: 是否是目录
print(f"is_dir: {Path('test_dir').is_dir()}")  # True

# is_symlink: 是否是符号链接
if Path("link.txt").exists():
    print(f"is_symlink: {Path('link.txt').is_symlink()}")

# is_mount: 是否是挂载点
print(f"is_mount: {Path('/').is_mount()}")

# 清理
Path("test.txt").unlink()
Path("test_dir").rmdir()
if Path("link.txt").exists():
    Path("link.txt").unlink()
\`\`\`

### 八、文件信息：stat

\`\`\`python
from pathlib import Path
import time
import tempfile
import os

os.chdir(tempfile.mkdtemp())

# 创建测试文件
p = Path("info.txt")
p.write_text("hello world", encoding="utf-8")

# stat() 返回文件信息对象
stat = p.stat()
print(f"size: {stat.st_size} 字节")
print(f"权限: {oct(stat.st_mode)}")
print(f"最后访问: {time.ctime(stat.st_atime)}")
print(f"最后修改: {time.ctime(stat.st_mtime)}")
print(f"创建时间: {time.ctime(stat.st_ctime)}")
print(f"inode: {stat.st_ino}")
print(f"设备: {stat.st_dev}")

# 修改权限（仅 Unix）
if os.name != 'nt':
    p.chmod(0o644)
    print(f"修改后权限: {oct(p.stat().st_mode)}")

# 修改所有者（需要 root）
# p.chown(uid, gid)

# 修改访问/修改时间
# os.utime(p, (atime, mtime))

p.unlink()
\`\`\`

### 九、创建与删除

\`\`\`python
from pathlib import Path
import tempfile
import os

os.chdir(tempfile.mkdtemp())

# mkdir: 创建目录
Path("dir1").mkdir()
print(f"dir1 创建: {Path('dir1').exists()}")

# 已存在会报错
try:
    Path("dir1").mkdir()
except FileExistsError as e:
    print(f"已存在: {e}")

# parents=True: 创建所有缺失的父目录
# exist_ok=True: 已存在不报错
Path("a/b/c").mkdir(parents=True, exist_ok=True)
print(f"嵌套目录: {Path('a/b/c').exists()}")

# touch: 创建空文件（已存在则更新时间）
Path("empty.txt").touch()
Path("empty.txt").touch()  # 再次调用，更新时间

# unlink: 删除文件
Path("empty.txt").unlink()
# 不存在时可以加 missing_ok=True（Python 3.8+）
Path("empty.txt").unlink(missing_ok=True)

# rmdir: 删除空目录
Path("a/b/c").rmdir()  # 只能删空目录

# 删除整个目录树要用 shutil
import shutil
shutil.rmtree("a")

# 创建多级目录后清理
print("\\n清理完成")
\`\`\`

### 十、重命名与移动

\`\`\`python
from pathlib import Path
import tempfile
import os

os.chdir(tempfile.mkdtemp())

# rename: 重命名（同目录下）
Path("old.txt").write_text("content", encoding="utf-8")
Path("old.txt").rename("new.txt")
print(f"old exists: {Path('old.txt').exists()}")  # False
print(f"new exists: {Path('new.txt').exists()}")  # True

# rename 也可以移动到其他目录
Path("subdir").mkdir()
Path("new.txt").rename("subdir/moved.txt")
print(f"moved: {Path('subdir/moved.txt').exists()}")

# replace: 类似 rename，但目标存在时会覆盖
Path("target.txt").write_text("original", encoding="utf-8")
Path("source.txt").write_text("replacement", encoding="utf-8")
Path("source.txt").replace("target.txt")
print(f"target 内容: {Path('target.txt').read_text(encoding='utf-8')}")

# 清理
shutil.rmtree("subdir") if False else None
import shutil
shutil.rmtree("subdir")
Path("target.txt").unlink()
\`\`\`

### 十一、目录遍历

\`\`\`python
from pathlib import Path
import tempfile
import os

os.chdir(tempfile.mkdtemp())

# 准备目录结构
"""
project/
├── main.py
├── utils.py
├── tests/
│   ├── test_main.py
│   └── test_utils.py
├── docs/
│   └── readme.md
└── data/
    └── users.json
"""
base = Path("project")
(base / "tests").mkdir(parents=True)
(base / "docs").mkdir(parents=True)
(base / "data").mkdir(parents=True)
(base / "main.py").write_text("")
(base / "utils.py").write_text("")
(base / "tests" / "test_main.py").write_text("")
(base / "tests" / "test_utils.py").write_text("")
(base / "docs" / "readme.md").write_text("")
(base / "data" / "users.json").write_text("")

# 1. iterdir: 列出当前目录内容（不递归）
print("=== iterdir ===")
for item in base.iterdir():
    type_str = "目录" if item.is_dir() else "文件"
    print(f"  [{type_str}] {item.name}")

# 2. glob: 模式匹配（不递归）
print("\\n=== glob *.py ===")
for f in base.glob("*.py"):
    print(f"  {f.relative_to(base)}")

# 3. rglob: 递归匹配
print("\\n=== rglob *.py ===")
for f in base.rglob("*.py"):
    print(f"  {f.relative_to(base)}")

# 4. rglob 用 ** 模式（Python 3.13+ 改进）
print("\\n=== glob **/*.py ===")
for f in base.glob("**/*.py"):
    print(f"  {f.relative_to(base)}")

# 清理
import shutil
shutil.rmtree(base)
\`\`\`

### 十二、glob 模式语法

\`\`\`python
from pathlib import Path
import tempfile
import os

os.chdir(tempfile.mkdtemp())

# 准备文件
for name in ["a.txt", "b.txt", "c.log", "a.py", "b.py",
             "test_a.py", "test_b.py", "data.json",
             "config.yaml", "1.txt", "12.txt"]:
    Path(name).write_text("", encoding="utf-8")

# * 匹配任意字符（不含 /）
print("=== *.txt ===")
for f in sorted(Path(".").glob("*.txt")):
    print(f"  {f.name}")

# ? 匹配单个字符
print("\\n=== ?.txt ===")
for f in sorted(Path(".").glob("?.txt")):
    print(f"  {f.name}")

# [abc] 匹配括号内任意字符
print("\\n=== [ab].py ===")
for f in sorted(Path(".").glob("[ab].py")):
    print(f"  {f.name}")

# [0-9] 匹配数字
print("\\n=== [0-9]*.txt ===")
for f in sorted(Path(".").glob("[0-9]*.txt")):
    print(f"  {f.name}")

# ** 递归匹配
Path("sub").mkdir()
Path("sub/x.py").write_text("", encoding="utf-8")
print("\\n=== **/*.py ===")
for f in sorted(Path(".").rglob("*.py")):
    print(f"  {f.relative_to('.')}")

# 清理
import shutil
shutil.rmtree("sub")
for f in Path(".").iterdir():
    if f.is_file():
        f.unlink()
\`\`\`

### 十三、读写方法封装

\`Path\` 提供了简化的读写方法：

\`\`\`python
from pathlib import Path
import tempfile
import os

os.chdir(tempfile.mkdtemp())

# read_text / write_text：一行读写文本
Path("file.txt").write_text("hello\\nworld", encoding="utf-8")
content = Path("file.txt").read_text(encoding="utf-8")
print(f"内容: {content!r}")

# read_bytes / write_bytes：一行读写二进制
Path("image.dat").write_bytes(b"\\x89PNG\\r\\n")
data = Path("image.dat").read_bytes()
print(f"二进制: {data!r}")

# read_text 可以指定 errors 参数
# Path("bad.txt").read_text(encoding="utf-8", errors="ignore")

# 追加：Path 没有直接的 append 方法，要用 open
with open("log.txt", "a", encoding="utf-8") as f:
    f.write("line1\\n")
with open("log.txt", "a", encoding="utf-8") as f:
    f.write("line2\\n")
print(f"追加后: {Path('log.txt').read_text(encoding='utf-8')!r}")

# 清理
for name in ["file.txt", "image.dat", "log.txt"]:
    Path(name).unlink()
\`\`\`

### 十四、os.path vs pathlib 对比

\`\`\`python
from pathlib import Path
import os

path_str = "/home/zhang/projects/main.py"
p = Path(path_str)

# 拼接路径
old_way = os.path.join("/home/zhang/projects", "main.py")
new_way = Path("/home/zhang/projects") / "main.py"
print(f"拼接: {old_way} vs {new_way}")

# 获取文件名
old_name = os.path.basename(path_str)  # main.py
new_name = p.name                       # main.py
print(f"文件名: {old_name} vs {new_name}")

# 获取目录名
old_dir = os.path.dirname(path_str)
new_dir = str(p.parent)
print(f"目录: {old_dir} vs {new_dir}")

# 拆分扩展名
old_split = os.path.splitext(path_str)  # ('/home/zhang/projects/main', '.py')
new_suffix = p.suffix                    # .py
print(f"扩展名: {old_split} vs {new_suffix}")

# 判断存在
old_exists = os.path.exists(path_str)
new_exists = p.exists()
print(f"存在: {old_exists} vs {new_exists}")

# 获取绝对路径
old_abs = os.path.abspath("test")
new_abs = str(Path("test").resolve())
print(f"绝对: {old_abs} vs {new_abs}")

# 结论：pathlib 更面向对象，可读性更好
\`\`\`

### 十五、路径遍历实战：批量处理文件

\`\`\`python
from pathlib import Path
import tempfile
import os

os.chdir(tempfile.mkdtemp())

# 准备项目结构
project = Path("project")
(project / "src" / "models").mkdir(parents=True)
(project / "src" / "utils").mkdir(parents=True)
(project / "tests").mkdir(parents=True)

files = {
    "src/models/user.py": "class User: pass",
    "src/models/order.py": "class Order: pass",
    "src/utils/logger.py": "def log(): pass",
    "src/utils/helpers.py": "def help(): pass",
    "tests/test_user.py": "def test_user(): pass",
    "README.md": "# Project",
}
for path, content in files.items():
    (project / path).write_text(content, encoding="utf-8")

# 任务：找出所有 .py 文件并统计行数
def count_lines_in_python_files(root):
    """统计所有 Python 文件的总行数。"""
    total = 0
    file_count = 0
    # rglob 递归找所有 .py 文件
    for py_file in Path(root).rglob("*.py"):
        file_count += 1
        # 逐行读取，避免大文件爆内存
        with open(py_file, "r", encoding="utf-8") as f:
            for line in f:
                total += 1
    return file_count, total

file_count, total_lines = count_lines_in_python_files(project)
print(f"Python 文件数: {file_count}")
print(f"总行数: {total_lines}")

# 按目录分组
print("\\n=== 按目录分组 ===")
from collections import defaultdict
grouped = defaultdict(list)
for py_file in project.rglob("*.py"):
    # relative_to 计算相对路径
    rel = py_file.relative_to(project)
    # 取第一级目录
    top_dir = rel.parts[0] if len(rel.parts) > 1 else "root"
    grouped[top_dir].append(rel)

for dir_name, files in sorted(grouped.items()):
    print(f"{dir_name}/:")
    for f in files:
        print(f"  - {f}")

# 清理
import shutil
shutil.rmtree(project)
\`\`\`

### 十六、文件匹配模式案例

\`\`\`python
from pathlib import Path
import tempfile
import os

os.chdir(tempfile.mkdtemp())

# 模拟日志目录
log_dir = Path("logs")
log_dir.mkdir()

# 创建不同日期的日志文件
import datetime
for i in range(7):
    date = (datetime.date(2026, 1, 1) + datetime.timedelta(days=i))
    name = f"app-{date.strftime('%Y-%m-%d')}.log"
    (log_dir / name).write_text(f"log {i}\\n", encoding="utf-8")

# 创建压缩归档
for i in range(3):
    (log_dir / f"app-2026-01-0{i+1}.log.gz").write_bytes(b"compressed")

# 1. 找所有 .log 文件
print("=== 所有 .log 文件 ===")
for f in sorted(log_dir.glob("*.log")):
    print(f"  {f.name}")

# 2. 找所有 .log.gz 文件
print("\\n=== 所有 .log.gz 文件 ===")
for f in sorted(log_dir.glob("*.log.gz")):
    print(f"  {f.name}")

# 3. 按日期范围匹配（用 ? 通配符）
print("\\n=== 1月1-3日的日志 ===")
for f in sorted(log_dir.glob("app-2026-01-0?.log")):
    print(f"  {f.name}")

# 4. 找所有压缩或未压缩的日志
print("\\n=== 所有日志文件 ===")
for f in sorted(log_dir.glob("*.log*")):
    print(f"  {f.name}")

# 清理
import shutil
shutil.rmtree(log_dir)
\`\`\`

### 十七、跨平台路径处理

\`\`\`python
from pathlib import Path
import os

# Path 会根据当前平台生成对应类型
# Linux/Mac: PosixPath
# Windows: WindowsPath
print(f"当前 Path 类型: {type(Path()).__name__}")

# 路径分隔符自动处理
# 在 Windows 上 Path("a/b/c") 也能正确解析
p = Path("folder/subfolder/file.txt")
print(f"parts: {p.parts}")

# 处理 Windows 风格路径
win_path = Path("C:\\\\Users\\\\zhang\\\\file.txt")
print(f"Windows 路径: {win_path}")

# 跨平台拼接：用 PurePosixPath / PureWindowsPath
from pathlib import PurePosixPath, PureWindowsPath

# PurePosixPath: 仅字符串操作，不访问文件系统
posix_path = PurePosixPath("/usr/local/bin")
print(f"Posix: {posix_path}")

# PureWindowsPath: 处理 Windows 路径
win_path_pure = PureWindowsPath("C:\\\\Program Files\\\\App")
print(f"Windows: {win_path_pure}")
print(f"Windows drive: {win_path_pure.drive}")  # C:
print(f"Windows root: {win_path_pure.root}")    # \\\\

# PurePath 不访问文件系统，可以在任何平台上用
# Path 是 PurePath 的子类，会访问文件系统
print(f"Path 是 PurePath 子类: {issubclass(Path, PurePosixPath) or issubclass(Path, PureWindowsPath)}")
\`\`\`

### 十八、文件权限与符号链接

\`\`\`python
from pathlib import Path
import os
import tempfile

os.chdir(tempfile.mkdtemp())

# 创建测试文件
f = Path("test.txt")
f.write_text("hello", encoding="utf-8")

# 修改权限（仅 Unix）
if os.name != 'nt':
    # chmod 接受八进制权限
    f.chmod(0o600)  # rw-------
    mode = f.stat().st_mode
    print(f"权限: {oct(mode)[-3:]}")  # 600

    # 恢复权限
    f.chmod(0o644)  # rw-r--r--
    print(f"恢复: {oct(f.stat().st_mode)[-3:]}")  # 644

# 符号链接
target = Path("target.txt")
target.write_text("target content", encoding="utf-8")

# 创建符号链接
try:
    link = Path("link.txt")
    link.symlink_to(target)
    print(f"\\n符号链接创建成功")
    print(f"is_symlink: {link.is_symlink()}")
    print(f"指向: {link.resolve()}")
    # 读符号链接指向的文件
    print(f"内容: {link.read_text(encoding='utf-8')}")
    link.unlink()
except (OSError, NotImplementedError) as e:
    print(f"符号链接失败（可能需要权限或系统不支持）: {e}")

# 硬链接
try:
    hard = Path("hard.txt")
    hard.hardlink_to(target)  # Python 3.10+
    print(f"\\n硬链接创建成功")
    print(f"inode 相同: {hard.stat().st_ino == target.stat().st_ino}")
    hard.unlink()
except (OSError, AttributeError) as e:
    print(f"硬链接失败: {e}")

# 清理
f.unlink()
target.unlink()
\`\`\`

### 十九、Path 性能注意

\`\`\`python
from pathlib import Path
import time

# 大量路径操作时，pathlib 比 os.path 稍慢
# 但代码可读性差距很大，通常值得

# 测试 1：os.path 拼接
import os
start = time.perf_counter()
for i in range(100000):
    p = os.path.join("/base", "sub", f"file_{i}.txt")
elapsed1 = time.perf_counter() - start
print(f"os.path.join 10万次: {elapsed1:.3f}s")

# 测试 2：pathlib 拼接
start = time.perf_counter()
for i in range(100000):
    p = Path("/base") / "sub" / f"file_{i}.txt"
elapsed2 = time.perf_counter() - start
print(f"pathlib / 拼接 10万次: {elapsed2:.3f}s")

# 性能差距通常很小，但代码可读性提升明显
# 只在性能瓶颈处才考虑用 os.path
print(f"差距: {elapsed2/elapsed1:.1f}x")
\`\`\`

### 二十、综合实战：项目结构分析器

\`\`\`python
from pathlib import Path
import tempfile
import os
from collections import defaultdict

os.chdir(tempfile.mkdtemp())

# 准备项目结构
def create_project():
    root = Path("myproject")
    (root / "src" / "api").mkdir(parents=True)
    (root / "src" / "models").mkdir(parents=True)
    (root / "tests").mkdir(parents=True)
    (root / "docs").mkdir(parents=True)

    files = {
        "src/__init__.py": "",
        "src/main.py": "def main():\\n    pass\\n",
        "src/api/users.py": "def get_users():\\n    pass\\n",
        "src/api/orders.py": "def get_orders():\\n    pass\\n",
        "src/models/user.py": "class User:\\n    pass\\n",
        "src/models/order.py": "class Order:\\n    pass\\n",
        "tests/test_user.py": "def test_user():\\n    pass\\n",
        "docs/readme.md": "# My Project\\n",
        "requirements.txt": "fastapi\\nuvicorn\\n",
        "README.md": "# MyProject\\n",
    }
    for path, content in files.items():
        (root / path).write_text(content, encoding="utf-8")
    return root

def analyze_project(root):
    """分析项目结构。"""
    root = Path(root)
    stats = {
        'files': 0,
        'dirs': 0,
        'lines': 0,
        'by_ext': defaultdict(int),
        'by_dir': defaultdict(int),
    }

    # 遍历所有文件
    for path in root.rglob("*"):
        if path.is_file():
            stats['files'] += 1
            # 按扩展名分组
            ext = path.suffix or "(无扩展名)"
            stats['by_ext'][ext] += 1
            # 按顶层目录分组
            try:
                rel = path.relative_to(root)
                top = rel.parts[0] if len(rel.parts) > 1 else "(根)"
                stats['by_dir'][top] += 1
            except ValueError:
                pass
            # 统计行数（文本文件）
            if ext in ('.py', '.md', '.txt', ''):
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        stats['lines'] += sum(1 for _ in f)
                except UnicodeDecodeError:
                    pass
        elif path.is_dir():
            stats['dirs'] += 1

    return stats

project = create_project()
stats = analyze_project(project)

print("=== 项目统计 ===")
print(f"文件数: {stats['files']}")
print(f"目录数: {stats['dirs']}")
print(f"代码行数: {stats['lines']}")

print("\\n=== 按扩展名 ===")
for ext, count in sorted(stats['by_ext'].items(), key=lambda x: -x[1]):
    print(f"  {ext}: {count} 个")

print("\\n=== 按顶层目录 ===")
for dir_name, count in sorted(stats['by_dir'].items()):
    print(f"  {dir_name}/: {count} 个文件")

# 清理
import shutil
shutil.rmtree(project)
\`\`\`

## 小结

- ⭐ \`pathlib.Path\` 是现代路径操作首选，**用 \`/\` 拼接路径**比 \`os.path.join\` 直观。
- ⭐ Path 属性：\`.name\` / \`.stem\` / \`.suffix\` / \`.parent\` / \`.parts\` / \`.anchor\`。
- ⭐ Path 修改：\`.with_name()\` / \`.with_stem()\` / \`.with_suffix()\`（返回新对象，原对象不变）。
- ⭐ 路径解析：\`.resolve()\` 转绝对路径并解析 \`.\` / \`..\`；\`.relative_to()\` 算相对路径。
- ⭐ 判断方法：\`.exists()\` / \`.is_file()\` / \`.is_dir()\` / \`.is_symlink()\`。
- ⭐ 目录遍历：\`.iterdir()\`（当前层）/ \`.glob()\`（模式匹配）/ \`.rglob()\`（递归匹配）。
- ⭐ 一行读写：\`.read_text()\` / \`.write_text()\` / \`.read_bytes()\` / \`.write_bytes()\`。
- ⭐ 创建删除：\`.mkdir(parents=True, exist_ok=True)\` / \`.touch()\` / \`.unlink(missing_ok=True)\` / \`.rmdir()\`。
- glob 模式：\`*\`（任意字符）/ \`?\`（单字符）/ \`[abc]\`（集合）/ \`**\`（递归）。
- 跨平台用 \`PurePosixPath\` / \`PureWindowsPath\` 做纯字符串操作。

下一章讲 CSV、JSON、配置文件的标准库用法——结构化数据持久化的标准方式。`,
  },

  // ============================================================
  // 第四十八章 CSV、JSON 与配置文件
  // ============================================================
  {
    id: 'py10-ch48',
    group: '第十部分 文件 IO 与模块',
    icon: '📊',
    title: '第四十八章 CSV、JSON 与配置文件',
    content: `## 第四十八章 CSV、JSON 与配置文件

结构化数据的读写是日常开发的高频任务：CSV 用于表格数据，JSON 用于 API 通信和复杂数据，配置文件用 INI/TOML/YAML。Python 标准库都有现成模块。

### 一、csv 模块基础

\`csv\` 模块处理 CSV 文件，避免自己处理逗号、引号、转义的麻烦：

\`\`\`python
import csv
import tempfile
import os

os.chdir(tempfile.mkdtemp())

# 写 CSV：用 writer
data = [
    ["姓名", "年龄", "城市"],
    ["张三", 25, "北京"],
    ["李四", 30, "上海"],
    ["王五", 28, "广州"],
]

with open("users.csv", "w", encoding="utf-8", newline="") as f:
    # 注意：newline="" 是 csv 模块要求，避免 Windows 上的空行问题
    writer = csv.writer(f)
    # writerow 写一行
    for row in data:
        writer.writerow(row)

# 读 CSV：用 reader
with open("users.csv", "r", encoding="utf-8", newline="") as f:
    reader = csv.reader(f)
    for row in reader:
        print(row)

os.remove("users.csv")
\`\`\`

### 二、writerows 批量写入

\`\`\`python
import csv
import tempfile
import os

os.chdir(tempfile.mkdtemp())

data = [
    ["product", "price", "stock"],
    ["苹果", 5.5, 100],
    ["香蕉", 3.2, 200],
    ["橙子", 4.8, 150],
]

with open("products.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    # writerows 一次写多行，更高效
    writer.writerows(data)

with open("products.csv", "r", encoding="utf-8", newline="") as f:
    print(f.read())

os.remove("products.csv")
\`\`\`

### 三、DictReader / DictWriter

按字典方式读写更直观：

\`\`\`python
import csv
import tempfile
import os

os.chdir(tempfile.mkdtemp())

# DictWriter：写时指定字段顺序
users = [
    {"name": "张三", "age": 25, "city": "北京"},
    {"name": "李四", "age": 30, "city": "上海"},
    {"name": "王五", "age": 28, "city": "广州"},
]

fieldnames = ["name", "age", "city"]

with open("users.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    # 写表头
    writer.writeheader()
    # 写数据行
    for user in users:
        writer.writerow(user)

# DictReader：读出来是 dict
with open("users.csv", "r", encoding="utf-8", newline="") as f:
    reader = csv.DictReader(f)
    # fieldnames 属性
    print(f"字段: {reader.fieldnames}")
    for row in reader:
        # row 是 OrderedDict（普通 dict 在 3.8+）
        print(f"  {row['name']}, {row['age']}岁, {row['city']}")

os.remove("users.csv")
\`\`\`

### 四、处理特殊字符

CSV 文件里的逗号、引号需要正确转义：

\`\`\`python
import csv
import tempfile
import os

os.chdir(tempfile.mkdtemp())

# 数据里包含逗号、引号、换行
data = [
    ["描述", "价格"],
    ["苹果，红色", 5.5],
    ['他说"你好"', 10],
    ["多行\\n描述", 8],
]

with open("special.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerows(data)

# 默认 quoting=QUOTE_MINIMAL：只在必要时加引号
with open("special.csv", "r", encoding="utf-8", newline="") as f:
    print("=== 默认 quoting ===")
    print(f.read())

# QUOTE_ALL：所有字段都加引号
with open("all_quoted.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f, quoting=csv.QUOTE_ALL)
    writer.writerows(data)

with open("all_quoted.csv", "r", encoding="utf-8", newline="") as f:
    print("=== QUOTE_ALL ===")
    print(f.read())

# QUOTE_NONNUMERIC：非数字字段加引号，数字转 float
with open("numeric.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f, quoting=csv.QUOTE_NONNUMERIC)
    writer.writerows(data)

with open("numeric.csv", "r", encoding="utf-8", newline="") as f:
    reader = csv.reader(f, quoting=csv.QUOTE_NONNUMERIC)
    for row in reader:
        # 数字字段自动转成 float
        print(row)

# 清理
for f in ["special.csv", "all_quoted.csv", "numeric.csv"]:
    os.remove(f)
\`\`\`

### 五、自定义分隔符

\`\`\`python
import csv
import tempfile
import os

os.chdir(tempfile.mkdtemp())

# TSV：制表符分隔
data = [["name", "age"], ["张三", 25], ["李四", 30]]

with open("users.tsv", "w", encoding="utf-8", newline="") as f:
    # delimiter 指定分隔符
    writer = csv.writer(f, delimiter="\\t")
    writer.writerows(data)

with open("users.tsv", "r", encoding="utf-8", newline="") as f:
    reader = csv.reader(f, delimiter="\\t")
    for row in reader:
        print(row)

# 管道分隔
with open("users.pipe", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f, delimiter="|")
    writer.writerows(data)

with open("users.pipe", "r", encoding="utf-8", newline="") as f:
    print(f.read())

# 清理
os.remove("users.tsv")
os.remove("users.pipe")
\`\`\`

### 六、json 模块基础

\`json\` 模块用于 Python 对象与 JSON 字符串互转：

\`\`\`python
import json

# Python 对象 → JSON 字符串
data = {
    "name": "张三",
    "age": 25,
    "hobbies": ["读书", "运动"],
    "address": {"city": "北京", "zip": "100000"},
    "active": True,
    "score": 95.5,
    "none_field": None
}

# dumps: dump string，序列化为 JSON 字符串
json_str = json.dumps(data)
print(f"紧凑: {json_str}")

# 带缩进的格式化
pretty = json.dumps(data, indent=2, ensure_ascii=False)
# ensure_ascii=False 让中文不被转成 \\uXXXX
print(f"\\n格式化:\\n{pretty}")

# 不同分隔符
compact = json.dumps(data, separators=(",", ":"))  # 最紧凑
print(f"\\n超紧凑: {compact}")
\`\`\`

### 七、JSON 反序列化

\`\`\`python
import json

# JSON 字符串 → Python 对象
json_str = '{"name": "张三", "age": 25, "hobbies": ["读书", "运动"]}'

# loads: load string
data = json.loads(json_str)
print(f"类型: {type(data).__name__}")
print(f"数据: {data}")
print(f"姓名: {data['name']}")
print(f"爱好: {data['hobbies']}")

# 类型映射
# JSON → Python:
# object → dict
# array → list
# string → str
# number (int) → int
# number (real) → float
# true → True
# false → False
# null → None

# 注意：JSON 不区分 int 和 float，但 Python 会智能转换
print(json.loads("42"))     # 42 (int)
print(json.loads("42.0"))   # 42.0 (float)
\`\`\`

### 八、读写 JSON 文件

\`\`\`python
import json
import tempfile
import os

os.chdir(tempfile.mkdtemp())

data = {
    "users": [
        {"id": 1, "name": "张三"},
        {"id": 2, "name": "李四"},
    ],
    "total": 2,
    "last_updated": "2026-01-01"
}

# dump: 写入文件
with open("data.json", "w", encoding="utf-8") as f:
    # indent=2 格式化
    # ensure_ascii=False 中文不转义
    json.dump(data, f, indent=2, ensure_ascii=False)

# load: 从文件读
with open("data.json", "r", encoding="utf-8") as f:
    loaded = json.load(f)

print(f"加载: {loaded}")
print(f"用户数: {loaded['total']}")

os.remove("data.json")
\`\`\`

### 九、自定义序列化

默认 JSON 不支持 Python 的 set、datetime、自定义类，需要自定义：

\`\`\`python
import json
from datetime import datetime, date

data = {
    "created_at": datetime(2026, 1, 1, 12, 0, 0),
    "birthday": date(1995, 5, 15),
    "tags": {"python", "web", "api"},  # set
}

# 默认会报错
try:
    json.dumps(data)
except TypeError as e:
    print(f"默认不支持: {e}")

# 自定义序列化函数
def json_serializer(obj):
    """处理默认 JSON 不支持的对象。"""
    if isinstance(obj, (datetime, date)):
        # 日期转成 ISO 格式字符串
        return obj.isoformat()
    if isinstance(obj, set):
        # set 转成 list
        return list(obj)
    # 其他不支持的类型，抛 TypeError
    raise TypeError(f"无法序列化 {type(obj).__name__}")

# 用 default 参数传入
json_str = json.dumps(data, default=json_serializer, indent=2, ensure_ascii=False)
print(f"\\n自定义序列化:\\n{json_str}")
\`\`\`

### 十、自定义 JSONEncoder 子类

\`\`\`python
import json
from datetime import datetime, date
from decimal import Decimal

class CustomEncoder(json.JSONEncoder):
    """自定义 JSON 编码器。"""
    def default(self, obj):
        # 这个方法只在不支持的对象上调用
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        if isinstance(obj, set):
            return sorted(obj)  # 排序后输出
        if isinstance(obj, Decimal):
            # Decimal 不会被默认序列化
            return float(obj)
        # 调用父类会抛 TypeError
        return super().default(obj)

data = {
    "time": datetime(2026, 1, 1),
    "tags": {"b", "a", "c"},
    "price": Decimal("19.99"),
}

# 用 cls 参数传入
json_str = json.dumps(data, cls=CustomEncoder, indent=2, ensure_ascii=False)
print(json_str)
\`\`\`

### 十一、自定义反序列化

\`\`\`python
import json
from datetime import datetime

# 用 object_hook 在反序列化时拦截
def datetime_parser(dct):
    """扫描所有 dict，把日期字符串转回 datetime。"""
    for key, value in dct.items():
        if isinstance(value, str):
            # 尝试解析 ISO 格式日期
            try:
                dct[key] = datetime.fromisoformat(value)
            except ValueError:
                pass
    return dct

json_str = '{"name": "张三", "created_at": "2026-01-01T12:00:00"}'

# object_hook 在每个 dict 被创建时调用
data = json.loads(json_str, object_hook=datetime_parser)
print(f"类型: {type(data['created_at']).__name__}")
print(f"日期: {data['created_at']}")
\`\`\`

### 十二、configparser 模块

INI 格式配置文件：

\`\`\`python
import configparser
import tempfile
import os

os.chdir(tempfile.mkdtemp())

# 写一个 INI 配置文件
config_content = """
[database]
host = localhost
port = 5432
username = admin
password = secret
debug = false

[api]
base_url = https://api.example.com
timeout = 30
retry = 3

[logging]
level = INFO
file = app.log
"""

with open("config.ini", "w", encoding="utf-8") as f:
    f.write(config_content.strip())

# 读取
config = configparser.ConfigParser()
config.read("config.ini", encoding="utf-8")

# 获取所有 section
print(f"Sections: {config.sections()}")

# 读字符串
host = config.get("database", "host")
print(f"DB host: {host}")

# 读整数（自动转换）
port = config.getint("database", "port")
print(f"DB port: {port} (type: {type(port).__name__})")

# 读布尔值
debug = config.getboolean("database", "debug")
print(f"Debug: {debug} (type: {type(debug).__name__})")

# 默认值
max_conn = config.getint("database", "max_conn", fallback=10)
print(f"Max conn: {max_conn} (用了默认值)")

# 修改并保存
config.set("database", "host", "192.168.1.100")
config.set("database", "max_conn", "50")

with open("config.ini", "w", encoding="utf-8") as f:
    config.write(f)

# 验证
config2 = configparser.ConfigParser()
config2.read("config.ini", encoding="utf-8")
print(f"\\n修改后 host: {config2.get('database', 'host')}")
print(f"新增 max_conn: {config2.getint('database', 'max_conn')}")

os.remove("config.ini")
\`\`\`

### 十三、TOML 配置文件

Python 3.11+ 内置 \`tomllib\` 用于读取 TOML：

\`\`\`python
import sys
import tempfile
import os

os.chdir(tempfile.mkdtemp())

toml_content = """
[project]
name = "myapp"
version = "1.0.0"
description = "My awesome app"

[dependencies]
python = ">=3.11"
fastapi = ">=0.100.0"

[tool.pytest]
testpaths = ["tests"]
addopts = "-v"
"""

with open("pyproject.toml", "w", encoding="utf-8") as f:
    f.write(toml_content.strip())

# Python 3.11+ 用 tomllib
if sys.version_info >= (3, 11):
    import tomllib
    with open("pyproject.toml", "rb") as f:
        # 注意：tomllib 只支持读，不支持写
        # 而且必须用二进制模式打开
        config = tomllib.load(f)

    print(f"项目名: {config['project']['name']}")
    print(f"版本: {config['project']['version']}")
    print(f"Python 版本要求: {config['dependencies']['python']}")
    print(f"测试路径: {config['tool']['pytest']['testpaths']}")
else:
    # Python 3.10 及以下用第三方库 tomli
    try:
        import tomli
        with open("pyproject.toml", "rb") as f:
            config = tomli.load(f)
        print(f"项目名: {config['project']['name']}")
    except ImportError:
        print("需要安装 tomli: pip install tomli")

os.remove("pyproject.toml")
\`\`\`

### 十四、YAML 配置文件（概念）

YAML 比 JSON 更人性化，但需要第三方库 \`PyYAML\`：

\`\`\`python
# 标准库不含 YAML，需要 pip install pyyaml
# 这里演示概念，实际使用要装库

yaml_content = """
# YAML 比 JSON 更适合人工编辑
database:
  host: localhost
  port: 5432
  credentials:
    user: admin
    password: secret

servers:
  - name: web1
    port: 8080
  - name: web2
    port: 8081

features:
  - login
  - registration
  - profile
"""

print("YAML 内容示例:")
print(yaml_content)

print("""
YAML vs JSON vs TOML 对比:
| 格式 | 适合场景 | 标准库 | 优点 |
|------|---------|--------|------|
| JSON | API、机器读写 | ✅ json | 通用性强 |
| TOML | 项目配置 | ✅ tomllib (3.11+) | 类型丰富 |
| YAML | 复杂配置 | ❌ 需要 PyYAML | 可读性高 |
| INI  | 简单配置 | ✅ configparser | 简单直观 |
""")

# 模拟 YAML 解析（用 json 替代演示）
import json
mock_config = {
    "database": {
        "host": "localhost",
        "port": 5432,
        "credentials": {"user": "admin", "password": "secret"}
    },
    "servers": [
        {"name": "web1", "port": 8080},
        {"name": "web2", "port": 8081}
    ]
}
print("等价 JSON:")
print(json.dumps(mock_config, indent=2, ensure_ascii=False))
\`\`\`

### 十五、综合实战：用户数据管理

\`\`\`python
import json
import csv
import tempfile
import os
from pathlib import Path

os.chdir(tempfile.mkdtemp())

# 模拟用户数据
users = [
    {"id": 1, "name": "张三", "email": "zhang@example.com", "age": 25},
    {"id": 2, "name": "李四", "email": "li@example.com", "age": 30},
    {"id": 3, "name": "王五", "email": "wang@example.com", "age": 28},
]

# 1. 存成 JSON
def save_json(users, path):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2, ensure_ascii=False)

def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

save_json(users, "users.json")
loaded = load_json("users.json")
print(f"从 JSON 加载: {loaded[0]['name']}")

# 2. 存成 CSV
def save_csv(users, path):
    if not users:
        return
    fieldnames = list(users[0].keys())
    with open(path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(users)

def load_csv(path):
    with open(path, "r", encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))

save_csv(users, "users.csv")
csv_users = load_csv("users.csv")
print(f"从 CSV 加载: {csv_users[0]}")

# 3. 互转：CSV → JSON
csv_users = load_csv("users.csv")
# CSV 读出来都是字符串，需要转换类型
for u in csv_users:
    u["id"] = int(u["id"])
    u["age"] = int(u["age"])

save_json(csv_users, "users_from_csv.json")
print(f"\\nCSV → JSON 转换完成")

# 清理
for f in ["users.json", "users.csv", "users_from_csv.json"]:
    os.remove(f)
\`\`\`

### 十六、JSON 流式处理大文件

\`\`\`python
import json
import tempfile
import os

os.chdir(tempfile.mkdtemp())

# 生成大 JSON 文件（数组）
users = [{"id": i, "name": f"user{i}"} for i in range(1000)]
with open("big.json", "w", encoding="utf-8") as f:
    json.dump(users, f)

# ❌ 大文件别用 load，会把整个文件读进内存
# with open("big.json") as f:
#     data = json.load(f)  # 内存爆炸

# ✅ 用 ijson 库流式解析（需要 pip install ijson）
# 这里演示用 json.JSONDecoder 流式解析

def stream_json_array(path):
    """流式读取 JSON 数组。"""
    with open(path, "r", encoding="utf-8") as f:
        # 读完整内容（演示，实际用 ijson 更好）
        content = f.read()

    # 用 raw_decode 流式解析
    decoder = json.JSONDecoder()
    idx = 0
    content = content.strip()
    # 跳过 [
    if content[0] == '[':
        idx = 1

    count = 0
    while idx < len(content):
        # 跳过空白和逗号
        while idx < len(content) and content[idx] in ' \\n\\t,':
            idx += 1
        if idx >= len(content) or content[idx] == ']':
            break
        # 解析一个对象
        obj, end = decoder.raw_decode(content, idx)
        idx = end
        count += 1
        if count <= 2:
            print(f"  第 {count} 个: {obj}")
    return count

print("=== 流式读取大 JSON ===")
total = stream_json_array("big.json")
print(f"总共 {total} 个对象")

os.remove("big.json")
\`\`\`

### 十七、JSON Lines 格式

\`\`\`python
import json
import tempfile
import os

os.chdir(tempfile.mkdtemp())

# JSON Lines: 每行一个 JSON 对象
# 优点：可以流式处理，每行独立解析
# 适合日志、大数据场景

logs = [
    {"level": "INFO", "msg": "启动应用"},
    {"level": "WARNING", "msg": "内存使用高"},
    {"level": "ERROR", "msg": "数据库连接失败"},
]

# 写 JSONL
with open("logs.jsonl", "w", encoding="utf-8") as f:
    for log in logs:
        # 每行一个 JSON 对象
        f.write(json.dumps(log, ensure_ascii=False) + "\\n")

# 读 JSONL：逐行解析
with open("logs.jsonl", "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if line:
            log = json.loads(line)
            print(f"[{log['level']}] {log['msg']}")

os.remove("logs.jsonl")
\`\`\`

### 十八、JSON Schema 验证

\`\`\`python
import json
import tempfile
import os

os.chdir(tempfile.mkdtemp())

# 简单的手动验证（标准库不含 jsonschema）
def validate_user(user):
    """简单校验用户对象。"""
    errors = []
    # 必须有 name 字段
    if "name" not in user:
        errors.append("缺少 name 字段")
    elif not isinstance(user["name"], str):
        errors.append("name 必须是字符串")

    # age 是可选的，但必须是正整数
    if "age" in user:
        if not isinstance(user["age"], int) or user["age"] < 0:
            errors.append("age 必须是非负整数")

    # email 格式
    if "email" in user:
        if "@" not in user["email"]:
            errors.append("email 格式错误")

    return errors

# 测试
test_cases = [
    {"name": "张三", "age": 25, "email": "zhang@example.com"},  # OK
    {"name": "李四", "age": -1},  # age 错误
    {"age": 30},  # 缺 name
    {"name": "王五", "email": "invalid"},  # email 错误
]

for i, user in enumerate(test_cases):
    errors = validate_user(user)
    status = "✓" if not errors else "✗"
    print(f"{status} 用例 {i+1}: {user}")
    for err in errors:
        print(f"    - {err}")
\`\`\`

### 十九、CSV 与 JSON 互转

\`\`\`python
import csv
import json
import tempfile
import os

os.chdir(tempfile.mkdtemp())

# 场景：把 CSV 转 JSON
# CSV 是扁平的表格，JSON 可以嵌套

csv_data = [
    ["user_id", "name", "city", "zip"],
    ["1", "张三", "北京", "100000"],
    ["2", "李四", "上海", "200000"],
]

with open("users.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerows(csv_data)

# 读 CSV，转成嵌套 JSON
with open("users.csv", "r", encoding="utf-8", newline="") as f:
    reader = csv.DictReader(f)
    users = []
    for row in reader:
        # 转换类型并重组结构
        user = {
            "id": int(row["user_id"]),
            "name": row["name"],
            "address": {
                "city": row["city"],
                "zip": row["zip"]
            }
        }
        users.append(user)

with open("users.json", "w", encoding="utf-8") as f:
    json.dump(users, f, indent=2, ensure_ascii=False)

# 验证
with open("users.json", "r", encoding="utf-8") as f:
    print(f.read())

# 反向：JSON 转 CSV
with open("users.json", "r", encoding="utf-8") as f:
    users = json.load(f)

# 把嵌套结构展平
flat_users = []
for u in users:
    flat_users.append({
        "id": u["id"],
        "name": u["name"],
        "city": u["address"]["city"],
        "zip": u["address"]["zip"]
    })

with open("users_flat.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=list(flat_users[0].keys()))
    writer.writeheader()
    writer.writerows(flat_users)

with open("users_flat.csv", "r", encoding="utf-8") as f:
    print(f.read())

# 清理
for f in ["users.csv", "users.json", "users_flat.csv"]:
    os.remove(f)
\`\`\`

### 二十、综合实战：配置文件管理器

\`\`\`python
import json
import os
import tempfile
from pathlib import Path
from typing import Any

os.chdir(tempfile.mkdtemp())

class ConfigManager:
    """JSON 配置文件管理器，支持默认值和嵌套访问。"""

    def __init__(self, path, defaults=None):
        self.path = Path(path)
        self.defaults = defaults or {}
        self._data = {}
        self.load()

    def load(self):
        """加载配置。"""
        if self.path.exists():
            with open(self.path, "r", encoding="utf-8") as f:
                # 加载用户配置，与默认值合并
                self._data = {**self.defaults, **json.load(f)}
        else:
            self._data = self.defaults.copy()

    def save(self):
        """保存配置。"""
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(self._data, f, indent=2, ensure_ascii=False)

    def get(self, key, default=None):
        """获取配置值，支持点号分隔的嵌套 key。"""
        keys = key.split(".")
        value = self._data
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        return value

    def set(self, key, value):
        """设置配置值。"""
        keys = key.split(".")
        d = self._data
        for k in keys[:-1]:
            if k not in d:
                d[k] = {}
            d = d[k]
        d[keys[-1]] = value

    def __repr__(self):
        return f"ConfigManager({self._data!r})"

# 使用
config = ConfigManager("app_config.json", defaults={
    "app": {
        "name": "MyApp",
        "version": "1.0.0"
    },
    "database": {
        "host": "localhost",
        "port": 5432
    }
})

print(f"App name: {config.get('app.name')}")
print(f"DB host: {config.get('database.host')}")
print(f"Missing: {config.get('missing.key', '默认值')}")

# 修改并保存
config.set("app.version", "2.0.0")
config.set("database.port", 6543)
config.save()

# 重新加载验证
config2 = ConfigManager("app_config.json", defaults=config.defaults)
print(f"\\n重新加载:")
print(f"App version: {config2.get('app.version')}")
print(f"DB port: {config2.get('database.port')}")

os.remove("app_config.json")
\`\`\`

## 小结

- ⭐ \`csv\` 模块：\`writer\` / \`reader\` 处理列表行；\`DictWriter\` / \`DictReader\` 按字段名读写更直观。
- ⭐ CSV 文件要加 \`newline=""\` 参数，避免 Windows 上的空行问题。
- ⭐ \`json.dumps\` / \`json.loads\` 处理字符串；\`json.dump\` / \`json.load\` 处理文件。
- ⭐ 中文场景用 \`ensure_ascii=False\`；格式化用 \`indent=2\`。
- 自定义序列化：\`default\` 函数或 \`JSONEncoder\` 子类；反序列化用 \`object_hook\`。
- ⭐ \`configparser\` 处理 INI 文件：\`get\` / \`getint\` / \`getboolean\` 自动类型转换。
- ⭐ \`tomllib\`（3.11+ 内置）读取 TOML；\`PyYAML\` 处理 YAML（第三方）。
- JSON Lines（\`.jsonl\`）每行一个对象，适合日志和大文件流式处理。
- 大文件别用 \`json.load\`，用 \`ijson\` 或 JSON Lines 流式处理。

下一章讲 Python 的模块和包系统——\`import\` 机制、\`sys.path\`、相对导入、命名空间包。`,
  },

  // ============================================================
  // 第四十九章 模块与包
  // ============================================================
  {
    id: 'py10-ch49',
    group: '第十部分 文件 IO 与模块',
    icon: '📦',
    title: '第四十九章 模块与包',
    content: `## 第四十九章 模块与包

Python 的代码组织靠"模块"（单个 .py 文件）和"包"（含 \`\`__init__.py\`\` 的目录）。理解 \`import\` 机制是写大型项目的基础。

### 一、模块基础

每个 \`.py\` 文件就是一个模块：

\`\`\`python
# 假设我们有文件 mymodule.py，内容如下：
# def greet(name):
#     return f"Hello, {name}!"
#
# PI = 3.14159
#
# class MyClass:
#     pass

# 在另一个文件里导入
# 方式 1：导入整个模块
# import mymodule
# print(mymodule.greet("张三"))
# print(mymodule.PI)

# 方式 2：导入特定名字
# from mymodule import greet, PI
# print(greet("李四"))

# 方式 3：导入并重命名
# import mymodule as mm
# print(mm.greet("王五"))

# 方式 4：导入所有公开名字（不推荐，可能冲突）
# from mymodule import *

# 这里用内置模块演示
import math
print(f"math.pi = {math.pi}")
print(f"math.sqrt(16) = {math.sqrt(16)}")

# 重命名导入
import math as m
print(f"m.pi = {m.pi}")

# 从模块导入特定名字
from math import pi, sqrt
print(f"直接用 pi = {pi}")
print(f"直接用 sqrt(25) = {sqrt(25)}")
\`\`\`

### 二、__name__ == '__main__'

每个模块都有 \`__name__\` 属性，被导入时是模块名，直接运行时是 \`"__main__"\`：

\`\`\`python
# 假设文件叫 mymodule.py
# 当你直接 python mymodule.py 运行时，__name__ == "__main__"
# 当你 import mymodule 时，__name__ == "mymodule"

# 这种模式让模块既能当脚本运行，又能被导入

def main():
    """主函数：被当作脚本运行时执行。"""
    print("程序启动")
    # ... 业务逻辑
    print("程序结束")

# 这个 if 块只在直接运行时执行
# 被 import 时不会执行
if __name__ == "__main__":
    main()
else:
    # 被 import 时只执行这里
    # 通常什么都不做，只暴露 API
    pass

# 演示当前模块的 __name__
print(f"当前 __name__ = {__name__!r}")
\`\`\`

### 三、模块搜索路径 sys.path

\`import\` 时 Python 按以下顺序查找模块：

1. 当前目录
2. 环境变量 \`PYTHONPATH\` 指定的目录
3. 标准库目录
4. 第三方包目录（site-packages）

\`\`\`python
import sys

# 查看 Python 的模块搜索路径
print("=== sys.path ===")
for i, path in enumerate(sys.path):
    print(f"  [{i}] {path}")

# 添加自定义路径
# sys.path.insert(0, "/my/custom/path")
# 或
# sys.path.append("/my/custom/path")

# 查看已加载的模块
print(f"\\n已加载模块数: {len(sys.modules)}")
# sys.modules 是一个 dict，缓存所有已导入的模块
# 同一个模块只会被导入一次（缓存机制）

# 检查模块是否已加载
if 'math' in sys.modules:
    print("math 模块已加载")
\`\`\`

### 四、from...import 详解

\`\`\`python
# 导入单个名字
from os import path
print(f"os.path: {path}")

# 导入多个名字
from os import getcwd, listdir, environ
print(f"当前目录: {getcwd()}")
print(f"环境变量数: {len(environ)}")

# 重命名导入（避免名字冲突）
from os import path as os_path
from pathlib import Path as PathLibPath
print(f"os.path.exists: {os_path.exists('.')}")
print(f"Path: {PathLibPath('.')}")

# 星号导入（不推荐）
# from os import *
# 会让所有公开名字进入当前命名空间
# 容易和当前模块的名字冲突
\`\`\`

### 五、包的概念

包是含 \`__init__.py\` 的目录，用于组织多个模块：

\`\`\`python
# 假设项目结构：
# mypackage/
#   __init__.py       <- 包的初始化文件
#   module1.py
#   module2.py
#   subpackage/
#     __init__.py
#     submodule.py

# 导入方式
# import mypackage                    # 导入整个包
# from mypackage import module1       # 从包导入模块
# from mypackage.module1 import func   # 从包的模块导入函数
# from mypackage.subpackage import submodule

# 演示用标准库的包
import json
# json 是一个包，含 encoder.py, decoder.py 等
# __init__.py 暴露了 dumps/loads 等函数

# 查看模块文件路径
print(f"json 模块路径: {json.__file__}")

# 查看包的内容
import os
json_dir = os.path.dirname(json.__file__)
print(f"\\njson 包目录内容:")
for f in sorted(os.listdir(json_dir)):
    print(f"  {f}")
\`\`\`

### 六、__init__.py 的作用

\`\`\`python
# __init__.py 可以是空文件，也可以包含初始化代码
# 主要作用：
# 1. 标记目录为 Python 包
# 2. 控制包的对外接口
# 3. 执行包级别的初始化

# 假设包结构：
# mypackage/
#   __init__.py
#   _internal.py
#   api.py

# mypackage/__init__.py 的内容可能这样写：
# """
# mypackage - 一个示例包
# """
# from .api import PublicAPI  # 导出 API
# from .api import helper_func
#
# __version__ = "1.0.0"
# __all__ = ["PublicAPI", "helper_func"]  # 控制from package import * 的范围

# 演示：用 urllib 包
import urllib
print(f"urllib 路径: {urllib.__file__}")
print(f"urbir __path__: {urllib.__path__}")

# urllib 是命名空间包（没有 __init__.py 也能用）
# 子模块要单独导入
from urllib import parse, request
print(f"parse.quote: {parse.quote('hello world')}")
\`\`\`

### 七、相对导入

包内部的模块用相对导入：

\`\`\`python
# 假设包结构：
# mypackage/
#   __init__.py
#   api/
#     __init__.py
#     users.py
#     orders.py
#   models/
#     __init__.py
#     user.py
#     order.py

# 在 mypackage/api/users.py 里：
# 绝对导入
# from mypackage.models.user import User

# 相对导入（推荐在包内用）
# from ..models.user import User   # .. 上一级目录
# from . import orders              # . 当前目录
# from .. import something           # .. 上一级

# 相对导入的优点：
# 1. 包重命名时不用改代码
# 2. 包内模块关系明确

# 相对导入的缺点：
# 1. 不能作为脚本直接运行（python -m 包名.模块 才行）
# 2. 嵌套太深时 .. 可读性差

# 演示标准库的相对导入
import email.mime.text
# email.mime.text 内部用相对导入
print(f"email.mime.text: {email.mime.text}")
\`\`\`

### 八、__all__ 控制导出

\`\`\`python
# 模块里所有不以 _ 开头的名字都会被 from module import * 导入
# 用 __all__ 精确控制

# 假设模块 mymodule.py：
# __all__ = ["public_func", "PublicClass"]  # 只导出这两个
#
# def public_func(): pass
# def _private_func(): pass
# def helper_func(): pass  # 不在 __all__ 里，不会被 * 导入
#
# class PublicClass: pass
# class _PrivateClass: pass

# 用标准库演示
import os

# 看 os 模块的 __all__（如果有的话）
print(f"os 有 __all__: {hasattr(os, '__all__')}")

# 自己写一个示例（不能真正定义模块，演示概念）
class FakeModule:
    """模拟模块的导出控制。"""
    __all__ = ["public_api"]

    def public_api(self):
        return "公开 API"

    def _private_api(self):
        return "私有 API"

    def helper(self):
        return "辅助函数（不导出）"

m = FakeModule()
# from fakemodule import * 只会导入 public_api
print(f"__all__: {m.__all__}")
\`\`\`

### 九、循环导入

两个模块互相 import 会出问题：

\`\`\`python
# 错误示例（概念演示）：
# module_a.py:
#   from module_b import b_func
#   def a_func():
#       b_func()
#
# module_b.py:
#   from module_a import a_func
#   def b_func():
#       a_func()

# 这样会导致 ImportError 或部分初始化

# 解决方案 1：在函数内部导入
# module_a.py:
#   def a_func():
#       from module_b import b_func  # 延迟导入
#       b_func()

# 解决方案 2：重构，把共享代码提取到第三个模块
# shared.py:
#   def shared_func(): pass
# module_a.py:
#   from shared import shared_func
# module_b.py:
#   from shared import shared_func

# 解决方案 3：只导入模块，不导入名字
# module_a.py:
#   import module_b  # 不立即访问
#   def a_func():
#       module_b.b_func()  # 用时再访问

# 演示正常导入
import json
import datetime
# 这两个标准库不会循环导入
print(f"json: {json}")
print(f"datetime: {datetime}")
\`\`\`

### 十、importlib 动态导入

运行时才知道模块名时用 \`importlib\`：

\`\`\`python
import importlib

# 动态导入模块
# 等价于 import math
math_module = importlib.import_module("math")
print(f"动态导入: {math_module}")
print(f"pi = {math_module.pi}")

# 导入子模块
# 等价于 from os import path
path_module = importlib.import_module("os.path")
print(f"os.path: {path_module}")

# 用 importlib.import_module 替代 __import__
# 不推荐用 __import__，太底层

# 模块重载（开发时有用）
# 注意：reload 不会更新 from module import name 拿到的旧引用
import sys
print(f"\\nmath 是否在 sys.modules: {'math' in sys.modules}")

# 模拟插件加载
def load_plugin(plugin_name):
    """根据名字加载插件。"""
    try:
        plugin = importlib.import_module(f"plugins.{plugin_name}")
        return plugin
    except ModuleNotFoundError as e:
        print(f"插件 {plugin_name} 不存在: {e}")
        return None

# 测试（标准库里没有 plugins 包）
load_plugin("math")  # 这个会成功
load_plugin("nonexistent_plugin")  # 这个会失败
\`\`\`

### 十一、命名空间包

Python 3.3+ 支持命名空间包——多个目录贡献给同一个包：

\`\`\`python
# 命名空间包：多个目录共享同一个包名
# 比如两个不同的库都给 "myns" 包添加子模块：
# /path/a/myns/module1.py
# /path/b/myns/module2.py

# 命名空间包不需要 __init__.py
# 演示：标准库的例子

import importlib.util

# 查找一个模块的路径
def find_module_path(name):
    """查找模块的文件路径。"""
    spec = importlib.util.find_spec(name)
    if spec is None:
        return None
    return spec.origin or spec.submodule_search_locations

# 标准库中的命名空间包示例
# 比较常见的：google.protobuf（如果装了的话）

# 演示用标准库
print(f"json 路径: {find_module_path('json')}")

# 模拟命名空间包
import sys
import os
import tempfile

# 创建两个目录
tmpdir = tempfile.mkdtemp()
dir1 = os.path.join(tmpdir, "pkg1")
dir2 = os.path.join(tmpdir, "pkg2")
os.makedirs(os.path.join(dir1, "myns"))
os.makedirs(os.path.join(dir2, "myns"))

# 在两个目录里各放一个模块
with open(os.path.join(dir1, "myns", "mod1.py"), "w") as f:
    f.write("value = 'from pkg1'\\n")
with open(os.path.join(dir2, "myns", "mod2.py"), "w") as f:
    f.write("value = 'from pkg2'\\n")

# 把两个目录加入 sys.path
sys.path.insert(0, dir1)
sys.path.insert(0, dir2)

# 现在可以同时导入 myns.mod1 和 myns.mod2
# 这就是命名空间包
try:
    from myns import mod1, mod2
    print(f"mod1.value: {mod1.value}")
    print(f"mod2.value: {mod2.value}")
except ImportError as e:
    print(f"导入失败: {e}")

# 清理
sys.path.remove(dir1)
sys.path.remove(dir2)
import shutil
shutil.rmtree(tmpdir)
\`\`\`

### 十二、模块缓存机制

\`\`\`python
import sys

# Python 的模块只会被导入一次
# 之后从 sys.modules 缓存读取

# 演示
import math
print(f"pi 第一次: {math.pi}")

# 假设我们修改了 math.pi（只是为了演示缓存）
# 实际上 math.pi 是只读的，这里只是说明
original_pi = math.pi

# 重新导入：从缓存读，不会重新执行模块代码
import math  # 这行不会重新执行 math 模块
print(f"pi 还是: {math.pi} (从缓存读)")

# 强制重新加载（开发调试用）
import importlib
# importlib.reload(math)  # 重新执行模块代码

# 查看模块缓存
print(f"\\n=== sys.modules 中的部分模块 ===")
for name in sorted(sys.modules.keys())[:10]:
    print(f"  {name}")
print(f"  ... 总共 {len(sys.modules)} 个")
\`\`\`

### 十三、模块的属性

每个模块都有一些标准属性：

\`\`\`python
import json
import os

# __name__: 模块名
print(f"json.__name__: {json.__name__}")

# __file__: 模块文件路径
print(f"json.__file__: {json.__file__}")

# __doc__: 模块文档字符串
print(f"json.__doc__[:50]: {json.__doc__[:50]}...")

# __dict__: 模块的所有名字
print(f"json 名字数: {len(json.__dict__)}")
# 模块的 __dict__ 就是它的命名空间

# __package__: 所属包
print(f"os.__package__: {os.__package__!r}")

# __spec__: 模块规格（导入系统用的元信息）
print(f"json.__spec__: {json.__spec__}")

# __loader__: 加载器
print(f"json.__loader__: {json.__loader__}")
\`\`\`

### 十四、自建一个完整包

\`\`\`python
# 演示如何从零创建一个包
import os
import sys
import tempfile

# 创建包目录结构
tmpdir = tempfile.mkdtemp()
pkg_dir = os.path.join(tmpdir, "myapp")
os.makedirs(pkg_dir)

# 创建 __init__.py
init_content = '''
"""myapp 包的入口。"""
from .core import Calculator
from .utils import format_result

__version__ = "1.0.0"
__all__ = ["Calculator", "format_result"]
'''
with open(os.path.join(pkg_dir, "__init__.py"), "w") as f:
    f.write(init_content)

# 创建 core.py
core_content = '''
"""核心计算模块。"""

class Calculator:
    """简单计算器。"""
    def add(self, a, b):
        return a + b

    def multiply(self, a, b):
        return a * b
'''
with open(os.path.join(pkg_dir, "core.py"), "w") as f:
    f.write(core_content)

# 创建 utils.py
utils_content = '''
"""工具函数。"""

def format_result(value, precision=2):
    """格式化结果。"""
    return f"{value:.{precision}f}"
'''
with open(os.path.join(pkg_dir, "utils.py"), "w") as f:
    f.write(utils_content)

# 添加到 sys.path
sys.path.insert(0, tmpdir)

# 现在可以导入并使用
try:
    from myapp import Calculator, format_result
    from myapp.core import Calculator as Calc2  # 也可以从子模块导入

    calc = Calculator()
    result = calc.add(3, 5)
    print(f"3 + 5 = {result}")
    print(f"格式化: {format_result(3.14159, 3)}")

    import myapp
    print(f"版本: {myapp.__version__}")
    print(f"docstring: {myapp.__doc__.strip()}")
except ImportError as e:
    print(f"导入失败: {e}")

# 清理
sys.path.remove(tmpdir)
import shutil
shutil.rmtree(tmpdir)
\`\`\`

### 十五、pip 与包安装

\`\`\`python
# pip 是 Python 包管理器
# 演示如何用代码调用 pip（实际中用命令行）

import subprocess
import sys

# 查看已安装的包
def list_installed_packages():
    """列出已安装的包。"""
    # 方法 1：用 pip list
    result = subprocess.run(
        [sys.executable, "-m", "pip", "list"],
        capture_output=True, text=True
    )
    return result.stdout

# 方法 2：用 importlib.metadata（Python 3.8+）
def list_packages_metadata():
    """用 importlib.metadata 列出已安装的包。"""
    try:
        from importlib.metadata import distributions
        packages = []
        for dist in distributions():
            packages.append((dist.metadata['Name'], dist.version))
        return sorted(packages)
    except ImportError:
        return []

# 这里不实际运行 pip list（输出太长）
print("=== 已安装的部分包 ===")
packages = list_packages_metadata()
for name, version in packages[:10]:
    print(f"  {name}=={version}")
print(f"  ... 总共 {len(packages)} 个包")

# 安装包的命令（演示用，不实际执行）
# pip install requests
# pip install requests==2.28.0  # 指定版本
# pip install "requests>=2.25"  # 版本范围
# pip install -r requirements.txt  # 从文件安装
# pip uninstall requests  # 卸载
\`\`\`

### 十六、__pycache__ 和字节码

\`\`\`python
# Python 会把源码编译成字节码缓存，加速下次导入
# 字节码文件在 __pycache__ 目录，扩展名 .pyc

import os
import tempfile
import sys

# 查看某个模块的字节码缓存
import json
json_dir = os.path.dirname(json.__file__)
pycache = os.path.join(json_dir, "__pycache__")

if os.path.exists(pycache):
    print(f"json 的 __pycache__:")
    for f in os.listdir(pycache)[:5]:
        print(f"  {f}")

# 字节码优缺点：
# 优点：加速模块导入（不用每次重新编译）
# 缺点：占磁盘空间；改了源码后旧 .pyc 可能不更新

# 手动编译
import py_compile
import tempfile

# 创建一个测试模块
tmpdir = tempfile.mkdtemp()
test_py = os.path.join(tmpdir, "test.py")
with open(test_py, "w") as f:
    f.write("x = 42\\n")

# 编译
pyc_file = py_compile.compile(test_py)
print(f"\\n编译生成: {pyc_file}")
print(f"文件存在: {os.path.exists(pyc_file)}")

# 清理
import shutil
shutil.rmtree(tmpdir)
\`\`\`

### 十七、模块化实战：项目结构

\`\`\`python
# 推荐的项目结构
project_structure = """
myproject/
├── pyproject.toml          # 项目配置（Python 3.11+ 推荐）
├── README.md
├── requirements.txt        # 依赖列表
├── src/
│   └── mypackage/          # 源码包
│       ├── __init__.py
│       ├── core.py
│       ├── api.py
│       └── utils/
│           ├── __init__.py
│           ├── logger.py
│           └── validator.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_core.py
│   └── test_api.py
└── docs/
    └── ...
"""

print(project_structure)

# 关键点：
# 1. 源码放在 src/ 下，避免和 tests 冲突
# 2. 每个目录都要有 __init__.py（除非用命名空间包）
# 3. 测试和源码分开
# 4. 配置集中在 pyproject.toml
\`\`\`

### 十八、import 时执行代码

\`\`\`python
# 模块被 import 时，所有顶层代码都会执行
# 包括：变量定义、函数定义、类定义、import 语句

# 演示：模拟一个模块的初始化
print("=== 模拟模块导入过程 ===")
print("1. 顶层变量定义执行")
module_var = 42
print(f"   module_var = {module_var}")

print("2. 函数定义执行（只是定义，不调用）")
def module_func():
    return "hello"

print("3. 类定义执行")
class ModuleClass:
    pass

print("4. import 语句执行")
import os  # 这行会执行

print("5. 顶层 print 会立即执行")

# 注意：模块导入是有副作用的
# 重复 import 同一个模块，只会执行一次（缓存）

# 演示
print("\\n=== 验证导入只执行一次 ===")
print(f"os 模块的 id: {id(os)}")
import os as os2
print(f"再次 import 后 id: {id(os2)}")
print(f"是同一个对象: {os is os2}")
\`\`\`

### 十九、相对导入的陷阱

\`\`\`python
# 相对导入不能直接 python 文件运行
# 必须用 python -m 包名.模块

# 错误示例（直接运行会报错）：
# 文件 mypackage/api/users.py 内容：
# from ..models import User
# 直接 python mypackage/api/users.py → ImportError

# 正确运行方式：
# python -m mypackage.api.users

# 演示当前模块的包
print(f"当前 __package__: {__package__!r}")
print(f"当前 __name__: {__name__!r}")

# 在包内用相对导入
# from . import sibling_module    # 同级模块
# from .. import parent_module    # 上一级
# from .submod import func        # 子模块

# 在包外（顶层脚本）只能用绝对导入
\`\`\`

### 二十、综合实战：插件系统

\`\`\`python
import importlib
import os
import sys
import tempfile
from pathlib import Path

# 模拟一个插件系统
# 主程序根据配置动态加载不同的插件

def setup_plugins(tmpdir):
    """创建模拟的插件目录。"""
    plugins_dir = Path(tmpdir) / "plugins"
    plugins_dir.mkdir()

    # __init__.py 让 plugins 成为包
    (plugins_dir / "__init__.py").write_text("")

    # 插件 1：uppercase
    plugin1 = plugins_dir / "uppercase.py"
    plugin1.write_text('''
"""大写转换插件。"""
def transform(text):
    return text.upper()

def info():
    return {"name": "大写转换", "version": "1.0"}
''')

    # 插件 2：reverse
    plugin2 = plugins_dir / "reverse.py"
    plugin2.write_text('''
"""反转插件。"""
def transform(text):
    return text[::-1]

def info():
    return {"name": "反转", "version": "1.0"}
''')

    # 插件 3：count_words
    plugin3 = plugins_dir / "wordcount.py"
    plugin3.write_text('''
"""词数统计插件。"""
def transform(text):
    return str(len(text.split()))

def info():
    return {"name": "词数统计", "version": "1.0"}
''')

    return plugins_dir


class PluginManager:
    """插件管理器。"""

    def __init__(self):
        self.plugins = {}

    def load_all(self, plugins_dir):
        """加载目录下所有插件。"""
        plugins_path = Path(plugins_dir)

        # 遍历目录找所有 .py 文件
        for py_file in plugins_path.glob("*.py"):
            if py_file.name.startswith("_"):
                continue  # 跳过 __init__.py 等

            # 模块名：plugins.文件名（不含扩展名）
            module_name = f"plugins.{py_file.stem}"

            try:
                # 动态导入
                module = importlib.import_module(module_name)
                # 检查是否有必要接口
                if hasattr(module, "transform") and hasattr(module, "info"):
                    info = module.info()
                    self.plugins[info["name"]] = module
                    print(f"  加载插件: {info['name']}")
            except Exception as e:
                print(f"  加载失败 {py_file.name}: {e}")

    def apply(self, plugin_name, text):
        """应用插件。"""
        if plugin_name not in self.plugins:
            return f"插件 {plugin_name} 未加载"
        return self.plugins[plugin_name].transform(text)


# 演示
tmpdir = tempfile.mkdtemp()
plugins_dir = setup_plugins(tmpdir)
sys.path.insert(0, tmpdir)

print("=== 加载插件 ===")
manager = PluginManager()
manager.load_all(plugins_dir)

print("\\n=== 应用插件 ===")
text = "hello world"
for name, plugin in manager.plugins.items():
    result = plugin.transform(text)
    print(f"  {name}: {result!r}")

# 清理
sys.path.remove(tmpdir)
import shutil
shutil.rmtree(tmpdir)
\`\`\`

## 小结

- ⭐ \`import module\` 导入整个模块；\`from module import name\` 导入特定名字；\`as\` 重命名。
- ⭐ \`if __name__ == "__main__":\` 让模块既能当脚本运行，又能被导入。
- ⭐ \`sys.path\` 控制模块搜索路径；\`sys.modules\` 缓存已加载模块。
- ⭐ 包是含 \`__init__.py\` 的目录；\`__init__.py\` 控制包的对外接口。
- ⭐ 相对导入用 \`.\` / \`..\`，包内推荐用；不能直接 \`python file.py\` 运行，要用 \`python -m\`。
- ⭐ \`__all__\` 控制 \`from module import *\` 的导出范围。
- ⭐ 循环导入的解决：延迟导入、提取共享模块、只导入模块不导入名字。
- ⭐ \`importlib.import_module()\` 运行时动态导入；\`importlib.reload()\` 重新加载。
- ⭐ 命名空间包：多个目录贡献给同一个包，无需 \`__init__.py\`。
- ⭐ 推荐项目结构：\`src/mypackage/\` 放源码，\`tests/\` 放测试，\`pyproject.toml\` 放配置。

下一章讲虚拟环境与依赖管理——为什么需要 venv、pip、requirements.txt、pyproject.toml。`,
  },

  // ============================================================
  // 第五十章 虚拟环境与依赖管理
  // ============================================================
  {
    id: 'py10-ch50',
    group: '第十部分 文件 IO 与模块',
    icon: '🌍',
    title: '第五十章 虚拟环境与依赖管理',
    content: `## 第五十章 虚拟环境与依赖管理

**虚拟环境是 Python 项目隔离依赖的标准方式**——每个项目用自己独立的包集合，避免版本冲突。这一章讲清楚 venv、pip、requirements.txt、pyproject.toml 的用法和原理。

### 一、为什么需要虚拟环境

没有虚拟环境会怎样：

\`\`\`python
# 假设你的系统 Python 里装了：
# - requests 2.20.0（项目 A 需要）
# - flask 1.0（项目 B 需要）

# 项目 A 升级了 requests 到 2.28.0
# → 项目 B 用到 requests 的地方可能就崩了

# 项目 C 需要 Python 3.12
# 项目 D 还在用 Python 3.9
# → 同一个 Python 解释器装不下两个版本

# 虚拟环境解决：
# 每个项目有自己独立的 site-packages（第三方包目录）
# 互不干扰

# 查看 Python 解释器路径
import sys
print(f"Python 解释器: {sys.executable}")
print(f"Python 版本: {sys.version}")

# 查看包搜索路径
print(f"\\n包搜索路径:")
for i, path in enumerate(sys.path):
    if 'site-packages' in path:
        print(f"  [{i}] {path}  ← 第三方包在这")
    else:
        print(f"  [{i}] {path}")
\`\`\`

### 二、venv 模块基础

\`venv\` 是 Python 3.3+ 内置的虚拟环境创建工具：

\`\`\`python
# 在命令行创建虚拟环境（不能在 Python 代码里直接调）
# 命令：
# python3 -m venv myenv
#
# 创建后目录结构：
# myenv/
#   bin/         (Linux/Mac) 或 Scripts/ (Windows)
#     python     Python 解释器（软链接到系统 Python）
#     pip         pip 命令
#     activate    激活脚本
#   lib/
#     python3.X/
#       site-packages/   这个虚拟环境的包目录
#   pyvenv.cfg   配置文件

# 演示：用代码模拟查看虚拟环境信息
import os
import sys

# 检查当前是否在虚拟环境中
def check_venv():
    """检查是否在虚拟环境中。"""
    # 方法 1：检查 sys.prefix
    # 虚拟环境里 sys.prefix 指向 venv 目录
    # 系统环境 sys.prefix 指向 Python 安装目录
    print(f"sys.prefix: {sys.prefix}")
    print(f"sys.base_prefix: {sys.base_prefix}")

    # 如果两者不同，说明在虚拟环境中
    in_venv = sys.prefix != sys.base_prefix
    print(f"在虚拟环境中: {in_venv}")

    # 方法 2：检查 VIRTUAL_ENV 环境变量
    venv_env = os.environ.get('VIRTUAL_ENV')
    print(f"VIRTUAL_ENV 环境变量: {venv_env!r}")

check_venv()
\`\`\`

### 三、激活虚拟环境

\`\`\`python
# 激活命令（不同平台不同）：
# Linux/Mac:
#   source myenv/bin/activate
# Windows (CMD):
#   myenv\\Scripts\\activate.bat
# Windows (PowerShell):
#   myenv\\Scripts\\Activate.ps1

# 激活后的效果：
# 1. 命令行提示符前面会出现 (myenv)
# 2. python / pip 命令指向虚拟环境的版本
# 3. pip install 装的包只进虚拟环境的 site-packages

# 退出虚拟环境：
# deactivate

# 演示：在 Python 代码里查看当前用的 pip
import subprocess
import sys

# 查看当前 pip 的位置
result = subprocess.run(
    [sys.executable, "-m", "pip", "--version"],
    capture_output=True, text=True
)
print(f"pip 信息: {result.stdout.strip()}")

# 查看当前 Python 路径
print(f"Python 路径: {sys.executable}")
\`\`\`

### 四、用代码创建虚拟环境

\`\`\`python
# 也可以用 Python 代码创建虚拟环境
# 等价于 python -m venv myenv

import tempfile
import os
import sys
import subprocess

def create_virtualenv(target_dir):
    """用代码创建虚拟环境。"""
    # 方法 1：调用 venv 模块
    import venv

    # 创建虚拟环境
    # with_pip=True 同时安装 pip
    builder = venv.EnvBuilder(with_pip=True)
    builder.create(target_dir)
    print(f"虚拟环境已创建: {target_dir}")

# 演示（实际创建）
tmpdir = tempfile.mkdtemp()
venv_dir = os.path.join(tmpdir, "test_venv")

try:
    create_virtualenv(venv_dir)

    # 查看创建的内容
    print(f"\\n虚拟环境目录内容:")
    for item in sorted(os.listdir(venv_dir)):
        print(f"  {item}/")

    # 查看 bin 或 Scripts 目录
    bin_dir = "Scripts" if sys.platform == "win32" else "bin"
    bin_path = os.path.join(venv_dir, bin_dir)
    if os.path.exists(bin_path):
        print(f"\\n{bin_dir}/ 目录内容:")
        for item in sorted(os.listdir(bin_path)):
            print(f"  {item}")

    # 查看 pyvenv.cfg
    cfg_path = os.path.join(venv_dir, "pyvenv.cfg")
    if os.path.exists(cfg_path):
        print(f"\\n=== pyvenv.cfg 内容 ===")
        with open(cfg_path) as f:
            print(f.read())

except Exception as e:
    print(f"创建失败: {e}")

# 清理
import shutil
shutil.rmtree(tmpdir, ignore_errors=True)
\`\`\`

### 五、pip 基本用法

\`\`\`python
import subprocess
import sys

# pip 是 Python 包管理器
# 通过 python -m pip 调用（保证用当前 Python 的 pip）

# 1. 安装包
# pip install requests
# pip install requests==2.28.0  # 指定版本
# pip install "requests>=2.25,<3.0"  # 版本范围
# pip install requests flask  # 一次装多个

# 2. 卸载包
# pip uninstall requests

# 3. 查看已安装的包
# pip list
# pip show requests  # 查看某个包的详情

# 4. 升级包
# pip install --upgrade requests

# 5. 导出依赖
# pip freeze > requirements.txt

# 6. 从文件安装
# pip install -r requirements.txt

# 演示：用代码查看已安装的包
def run_pip(args):
    """运行 pip 命令。"""
    cmd = [sys.executable, "-m", "pip"] + args
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout

# 查看已安装的包（前 10 个）
output = run_pip(["list"])
lines = output.strip().split('\\n')
print("=== 已安装的包（前 10 个）===")
for line in lines[:10]:
    print(f"  {line}")
print(f"  ... (共 {len(lines) - 2} 个包)")
\`\`\`

### 六、requirements.txt

\`\`\`python
# requirements.txt 是依赖清单
# 格式示例：
# requests==2.28.0
# flask>=2.0.0
# numpy~=1.21.0
# python-dotenv  # 不指定版本（不推荐）

# 版本号规则：
# ==  精确版本
# >=  最低版本
# <=  最高版本
# ~=  兼容版本（同主版本）
# !=  排除某个版本

# 生成 requirements.txt
# pip freeze > requirements.txt
# 但 freeze 会列出所有间接依赖，太冗长

# 推荐用 pip-tools 精简：
# pip install pip-tools
# 创建 requirements.in（手写直接依赖）
# pip-compile requirements.in  # 生成锁定的 requirements.txt

# 演示：解析 requirements.txt
import tempfile
import os

requirements_content = """
# 直接依赖
requests==2.28.0
flask>=2.0.0
python-dotenv==0.20.0

# 开发依赖（可选）
pytest==7.1.0  # 测试框架
"""

with open("requirements.txt", "w") as f:
    f.write(requirements_content.strip())

# 解析
def parse_requirements(path):
    """解析 requirements.txt 文件。"""
    requirements = []
    with open(path) as f:
        for line in f:
            line = line.strip()
            # 跳过空行和注释
            if not line or line.startswith("#"):
                continue
            # 去掉行内注释
            if "#" in line:
                line = line[:line.index("#")].strip()
            requirements.append(line)
    return requirements

deps = parse_requirements("requirements.txt")
print("=== 解析后的依赖 ===")
for dep in deps:
    print(f"  {dep}")

os.remove("requirements.txt")
\`\`\`

### 七、pip freeze 与锁定依赖

\`\`\`python
import subprocess
import sys

# pip freeze 列出所有已安装包及其精确版本
# 用于"冻结"当前环境的依赖状态

# 演示
result = subprocess.run(
    [sys.executable, "-m", "pip", "freeze"],
    capture_output=True, text=True
)

# 解析输出
lines = result.stdout.strip().split('\\n')
print(f"=== pip freeze 输出（前 10 个）===")
for line in lines[:10]:
    print(f"  {line}")
print(f"  ... 共 {len(lines)} 个包")

# freeze 输出格式：包名==版本号
# 这个格式可以直接给 pip install -r 用
# 但 freeze 会包含间接依赖，所以推荐用 pip-tools
\`\`\`

### 八、pyproject.toml 基础

\`pyproject.toml\` 是现代 Python 项目的标准配置文件（替代 setup.py）：

\`\`\`python
# pyproject.toml 示例：
# [project]
# name = "my-package"
# version = "1.0.0"
# description = "A sample package"
# requires-python = ">=3.10"
# authors = [{name = "张三", email = "zhang@example.com"}]
#
# dependencies = [
#     "requests>=2.25",
#     "flask>=2.0",
# ]
#
# [project.optional-dependencies]
# dev = ["pytest", "black", "mypy"]
#
# [project.scripts]
# myapp = "my_package.cli:main"
#
# [tool.pytest.ini_options]
# testpaths = ["tests"]
#
# [tool.black]
# line-length = 88

import tempfile
import os

# 写一个示例 pyproject.toml
content = """[project]
name = "demo-package"
version = "0.1.0"
description = "演示包"
requires-python = ">=3.10"
dependencies = [
    "requests>=2.25",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0",
    "black",
]

[tool.black]
line-length = 88
"""

with open("pyproject.toml", "w") as f:
    f.write(content)

# Python 3.11+ 可以用 tomllib 读取
import sys
if sys.version_info >= (3, 11):
    import tomllib
    with open("pyproject.toml", "rb") as f:
        config = tomllib.load(f)

    print("=== pyproject.toml 配置 ===")
    print(f"项目名: {config['project']['name']}")
    print(f"版本: {config['project']['version']}")
    print(f"Python 版本要求: {config['project']['requires-python']}")
    print(f"依赖: {config['project']['dependencies']}")
    print(f"开发依赖: {config['project']['optional-dependencies']['dev']}")
else:
    print("需要 Python 3.11+ 才能用 tomllib")

os.remove("pyproject.toml")
\`\`\`

### 九、构建包：从源码到可安装

\`\`\`python
# 现代构建工具：
# 1. build（PEP 517）：python -m build
# 2. hatchling：hatch 的构建后端
# 3. setuptools：传统但仍然流行
# 4. poetry：自带构建+依赖管理

# 演示：用 setuptools 构建一个简单包
import os
import tempfile

tmpdir = tempfile.mkdtemp()

# 创建项目结构
pkg_dir = os.path.join(tmpdir, "mypackage")
os.makedirs(os.path.join(pkg_dir, "mypackage"))

# __init__.py
with open(os.path.join(pkg_dir, "mypackage", "__init__.py"), "w") as f:
    f.write('''
"""mypackage - 示例包。"""
__version__ = "1.0.0"

def hello():
    """打招呼。"""
    return "Hello from mypackage!"
''')

# pyproject.toml
with open(os.path.join(pkg_dir, "pyproject.toml"), "w") as f:
    f.write('''[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "mypackage"
version = "1.0.0"
description = "示例包"

[tool.setuptools.packages.find]
where = ["."]
''')

# README
with open(os.path.join(pkg_dir, "README.md"), "w") as f:
    f.write("# mypackage\\n\\n示例包。\\n")

print(f"项目结构已创建: {pkg_dir}")
print(f"\\n目录结构:")
for root, dirs, files in os.walk(pkg_dir):
    level = root.replace(pkg_dir, '').count(os.sep)
    indent = '  ' * level
    print(f"{indent}{os.path.basename(root)}/")
    sub_indent = '  ' * (level + 1)
    for file in files:
        print(f"{sub_indent}{file}")

# 实际构建命令：
# cd mypackage
# python -m build
# 会生成 dist/mypackage-1.0.0.tar.gz 和 .whl

# 清理
import shutil
shutil.rmtree(tmpdir)
\`\`\`

### 十、pip-tools 精确锁定依赖

\`\`\`python
# pip-tools 解决两个问题：
# 1. requirements.txt 太长（包含所有间接依赖）
# 2. 版本冲突难以排查

# 工作流：
# 1. 写 requirements.in（只列直接依赖）
# requests
# flask

# 2. 运行 pip-compile
# pip-compile requirements.in
# 生成 requirements.txt，包含所有依赖的精确版本

# 3. 安装
# pip install -r requirements.txt

# 4. 添加新依赖时
# 编辑 requirements.in 加上新包
# pip-compile requirements.in  # 重新生成
# pip install -r requirements.txt  # 安装

# 5. 升级某个包
# pip-compile --upgrade-package requests

# 演示：模拟 requirements.in
import os

requirements_in = """
# 直接依赖
requests
flask
"""

with open("requirements.in", "w") as f:
    f.write(requirements_in.strip())

# 模拟 pip-compile 的输出
requirements_txt = """
# 这个文件是 pip-compile 生成的
requests==2.28.0
flask==2.2.0
# 间接依赖
urllib3==1.26.0  # via requests
Werkzeug==2.2.0   # via flask
Jinja2==3.1.0     # via flask
"""

with open("requirements.txt", "w") as f:
    f.write(requirements_txt.strip())

print("=== requirements.in（手写）===")
with open("requirements.in") as f:
    print(f.read())

print("=== requirements.txt（pip-compile 生成）===")
with open("requirements.txt") as f:
    print(f.read())

os.remove("requirements.in")
os.remove("requirements.txt")
\`\`\`

### 十一、Poetry 现代依赖管理

\`\`\`python
# Poetry 是一个一站式工具：
# - 依赖管理（替代 pip + pip-tools）
# - 虚拟环境管理（替代 venv）
# - 构建打包（替代 setup.py）
# - 发布到 PyPI

# 安装：
# curl -sSL https://install.python-poetry.org | python3 -

# 常用命令：
# poetry new myproject         # 创建新项目
# poetry init                  # 在现有项目初始化
# poetry add requests           # 添加依赖（自动创建 venv）
# poetry add pytest --group dev  # 添加开发依赖
# poetry install                # 安装所有依赖
# poetry shell                  # 进入虚拟环境 shell
# poetry run python script.py   # 在虚拟环境里运行
# poetry build                  # 构建
# poetry publish                # 发布到 PyPI

# pyproject.toml 在 Poetry 项目里：
# [tool.poetry]
# name = "myproject"
# version = "1.0.0"
#
# [tool.poetry.dependencies]
# python = "^3.10"
# requests = "^2.28"
#
# [tool.poetry.group.dev.dependencies]
# pytest = "^7.0"

# 演示：检查是否装了 poetry
import shutil
poetry_path = shutil.which("poetry")
print(f"poetry 是否安装: {poetry_path or '未安装'}")

# 与 pip + venv 的对比
comparison = """
| 特性 | pip + venv | Poetry |
|-----|------------|--------|
| 依赖管理 | pip install | poetry add |
| 虚拟环境 | python -m venv | 自动管理 |
| 依赖锁定 | pip-tools | poetry.lock |
| 构建 | build / setuptools | poetry build |
| 学习成本 | 低 | 中 |
| 生态成熟度 | 高 | 高 |
"""
print(comparison)
\`\`\`

### 十二、conda 简述

\`\`\`python
# conda 是另一个流行的包管理器（特别是数据科学场景）
# 主要区别：
# - pip 只装 Python 包
# - conda 能装非 Python 依赖（如 C 库、R、Node.js）

# conda 还能管理 Python 解释器本身
# pip 必须配合 pyenv 等工具才能切换 Python 版本

# 常用命令：
# conda create -n myenv python=3.11  # 创建环境
# conda activate myenv                # 激活
# conda install numpy                 # 安装包
# conda env export > environment.yml  # 导出依赖
# conda env create -f environment.yml # 从文件创建

# 何时用 conda：
# - 数据科学 / 机器学习
# - 需要非 Python 依赖（如 CUDA）
# - 团队统一用 conda

# 何时用 pip + venv：
# - Web 开发
# - 纯 Python 项目
# - 团队用 pip 工作流

# 检查是否装了 conda
import shutil
conda_path = shutil.which("conda")
print(f"conda 是否安装: {conda_path or '未安装'}")
\`\`\`

### 十三、虚拟环境最佳实践

\`\`\`python
# 1. 每个项目一个虚拟环境
# 不要在系统 Python 里直接 pip install

# 2. 把虚拟环境目录加到 .gitignore
gitignore_content = """
# 虚拟环境
venv/
env/
.venv/

# Python 字节码
__pycache__/
*.pyc

# 构建
build/
dist/
*.egg-info/

# IDE
.vscode/
.idea/

# 环境变量
.env
.env.local
"""
print("=== .gitignore 示例 ===")
print(gitignore_content)

# 3. 不要把虚拟环境目录加到 git
# 也不要把 .env 文件加到 git

# 4. 团队协作时锁定版本
# 用 requirements.txt 或 poetry.lock
# 确保所有人用相同版本的依赖

# 5. 区分生产依赖和开发依赖
# 生产：requirements.txt
# 开发：requirements-dev.txt 或 pyproject.toml 的 optional-dependencies
\`\`\`

### 十四、用 Python 代码操作 pip

\`\`\`python
import subprocess
import sys
import json

def pip_install(package, version=None):
    """用代码安装 pip 包。"""
    if version:
        pkg = f"{package}=={version}"
    else:
        pkg = package
    # 用 sys.executable 确保用当前 Python 的 pip
    result = subprocess.run(
        [sys.executable, "-m", "pip", "install", pkg],
        capture_output=True, text=True
    )
    return result.returncode == 0, result.stdout, result.stderr

def pip_list_json():
    """用 JSON 格式列出已安装的包。"""
    result = subprocess.run(
        [sys.executable, "-m", "pip", "list", "--format=json"],
        capture_output=True, text=True
    )
    if result.returncode == 0:
        return json.loads(result.stdout)
    return []

# 演示：列出已安装的包（JSON 格式更易解析）
packages = pip_list_json()
print(f"=== 已安装的包（JSON，前 5 个）===")
for pkg in packages[:5]:
    print(f"  {pkg['name']}=={pkg['version']}")
print(f"  ... 共 {len(packages)} 个")

# 检查某个包是否安装
def is_installed(package_name):
    """检查包是否已安装。"""
    packages = pip_list_json()
    return any(p['name'].lower() == package_name.lower() for p in packages)

# 测试
print(f"\\n=== 检查包是否安装 ===")
print(f"requests 安装了: {is_installed('requests')}")
print(f"flask 安装了: {is_installed('flask')}")
\`\`\`

### 十五、importlib.metadata 查询包信息

\`\`\`python
# Python 3.8+ 内置 importlib.metadata
# 比 pip list 更轻量

try:
    from importlib.metadata import distribution, distributions, version, requires
except ImportError:
    # Python 3.7 及以下用第三方库
    try:
        from importlib_metadata import distribution, distributions, version, requires
    except ImportError:
        print("需要 importlib_metadata")
        import sys
        sys.exit(0)

# 查询某个包的版本
try:
    pip_version = version("pip")
    print(f"pip 版本: {pip_version}")
except Exception as e:
    print(f"查询失败: {e}")

# 查询某个包的元信息
try:
    dist = distribution("pip")
    print(f"\\n=== pip 包元信息 ===")
    print(f"名称: {dist.metadata['Name']}")
    print(f"版本: {dist.version}")
    print(f"摘要: {dist.metadata['Summary']}")
    print(f"主页: {dist.metadata['Home-page']}")
    print(f"作者: {dist.metadata['Author']}")
    print(f"许可: {dist.metadata['License']}")
except Exception as e:
    print(f"查询失败: {e}")

# 列出所有包
print(f"\\n=== 已安装的包（前 5 个）===")
for dist in list(distributions())[:5]:
    print(f"  {dist.metadata['Name']}=={dist.version}")
\`\`\`

### 十六、依赖冲突排查

\`\`\`python
# pip 会自动解决依赖冲突，但有时需要手动检查

import subprocess
import sys

# pip check 检查依赖冲突
result = subprocess.run(
    [sys.executable, "-m", "pip", "check"],
    capture_output=True, text=True
)

print("=== pip check 输出 ===")
if result.returncode == 0:
    print("✓ 依赖无冲突")
else:
    # 输出冲突详情
    print(result.stdout)
    print(result.stderr)

# 常见冲突：
# packageA 需要 requests>=2.25
# packageB 需要 requests<2.20
# → pip 会报错：Cannot install requests because ...
\`\`\`

### 十七、Docker 与依赖管理

\`\`\`python
# 在 Docker 容器里通常这样处理依赖：
# 1. 多阶段构建：构建阶段装依赖，运行阶段只复制产物
# 2. 用 requirements.txt 锁定版本
# 3. 用 --no-cache-dir 减小镜像体积

# 典型的 Dockerfile：
# FROM python:3.12-slim
# WORKDIR /app
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt
# COPY . .
# CMD ["python", "main.py"]

# 用 .dockerignore 避免复制不必要的文件：
dockerignore = """
__pycache__/
*.pyc
.venv/
venv/
.env
.git/
.pytest_cache/
.mypy_cache/
.ruff_cache/
*.egg-info/
build/
dist/
"""
print("=== .dockerignore ===")
print(dockerignore)

# 验证 Docker 镜像里装的依赖
# docker run --rm myimage python -m pip list
\`\`\`

### 十八、CI/CD 中的依赖管理

\`\`\`python
# 在 CI/CD 流水线里，依赖管理的关键：
# 1. 用锁定文件确保可重现
# 2. 缓存 pip 下载，加速构建
# 3. 自动检测安全漏洞

# GitHub Actions 示例：
# jobs:
#   test:
#     runs-on: ubuntu-latest
#     steps:
#       - uses: actions/checkout@v4
#       - uses: actions/setup-python@v5
#         with:
#           python-version: '3.12'
#           cache: 'pip'  # 自动缓存
#       - run: pip install -r requirements.txt
#       - run: pytest

# 用 pip-audit 检查已知漏洞：
# pip install pip-audit
# pip-audit  # 扫描所有依赖的安全漏洞

# 用 safety 检查：
# pip install safety
# safety check

print("=== 依赖安全检查 ===")
print("推荐工具：")
print("  pip-audit - 官方维护，扫描 PyPI 数据库")
print("  safety    - 第三方，有商业版")
print("  dependabot - GitHub 自动 PR 升级")
\`\`\`

### 十九、多 Python 版本管理

\`\`\`python
# 不同项目可能需要不同 Python 版本
# 用版本管理器切换：

# 1. pyenv（推荐）
# pyenv install 3.12.0
# pyenv install 3.11.0
# pyenv global 3.12.0
# pyenv local 3.11.0  # 在当前目录用 3.11

# 2. conda
# conda create -n py312 python=3.12
# conda create -n py311 python=3.11
# conda activate py312

# 3. uv（新一代工具，超快）
# uv python install 3.12
# uv venv --python 3.12

# 检查当前 Python 版本
import sys
import platform

print(f"Python 版本: {platform.python_version()}")
print(f"实现: {platform.python_implementation()}")
print(f"编译器: {platform.python_compiler()}")
print(f"架构: {platform.machine()}")
print(f"系统: {platform.system()} {platform.release()}")

# 不同版本的差异：
# 3.9: 字典合并操作符 |
# 3.10: match-case 语句
# 3.11: ExceptionGroup, tomllib
# 3.12: f-string 嵌套, 更好的错误信息
\`\`\`

### 二十、综合实战：完整项目配置

\`\`\`python
# 演示一个完整的 Python 项目配置
import os
import tempfile
import sys

tmpdir = tempfile.mkdtemp()
project_dir = os.path.join(tmpdir, "myproject")
os.makedirs(os.path.join(project_dir, "src", "myapp"))

# 1. pyproject.toml
with open(os.path.join(project_dir, "pyproject.toml"), "w") as f:
    f.write('''[build-system]
requires = ["setuptools>=68.0"]
build-backend = "setuptools.build_meta"

[project]
name = "myapp"
version = "1.0.0"
description = "示例应用"
requires-python = ">=3.10"
authors = [{name = "张三", email = "zhang@example.com"}]
dependencies = [
    "requests>=2.28",
    "pydantic>=2.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0",
    "black",
    "mypy",
    "ruff",
]

[project.scripts]
myapp = "myapp.cli:main"

[tool.setuptools.packages.find]
where = ["src"]

[tool.pytest.ini_options]
testpaths = ["tests"]

[tool.black]
line-length = 88

[tool.ruff]
line-length = 88
select = ["E", "F", "W"]
''')

# 2. requirements.txt（开发用）
with open(os.path.join(project_dir, "requirements.txt"), "w") as f:
    f.write('''# 生产依赖
requests==2.31.0
pydantic==2.5.0
''')

# 3. requirements-dev.txt
with open(os.path.join(project_dir, "requirements-dev.txt"), "w") as f:
    f.write('''-r requirements.txt
pytest==7.4.0
black==23.0.0
mypy==1.7.0
ruff==0.1.0
''')

# 4. .gitignore
with open(os.path.join(project_dir, ".gitignore"), "w") as f:
    f.write('''# Python
__pycache__/
*.pyc
*.egg-info/
build/
dist/

# 虚拟环境
.venv/
venv/

# 环境变量
.env

# IDE
.vscode/
.idea/

# 测试
.pytest_cache/
.coverage
htmlcov/
''')

# 5. 源码包 __init__.py
with open(os.path.join(project_dir, "src", "myapp", "__init__.py"), "w") as f:
    f.write('''"""myapp - 示例应用。"""
__version__ = "1.0.0"
''')

# 6. README.md
with open(os.path.join(project_dir, "README.md"), "w") as f:
    f.write('''# myapp

示例 Python 应用。

## 安装

\`\`\`bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
\`\`\`

## 开发

\`\`\`bash
pip install -r requirements-dev.txt
pytest
\`\`\`
''')

# 验证配置
print("=== 项目结构 ===")
for root, dirs, files in os.walk(project_dir):
    level = root.replace(project_dir, '').count(os.sep)
    indent = '  ' * level
    folder = os.path.basename(root) or '.'
    print(f"{indent}{folder}/")
    for file in files:
        print(f"{'  ' * (level + 1)}{file}")

# 用 tomllib 验证 pyproject.toml
if sys.version_info >= (3, 11):
    import tomllib
    with open(os.path.join(project_dir, "pyproject.toml"), "rb") as f:
        config = tomllib.load(f)
    print(f"\\n=== pyproject.toml 验证 ===")
    print(f"项目名: {config['project']['name']}")
    print(f"版本: {config['project']['version']}")
    print(f"Python 要求: {config['project']['requires-python']}")
    print(f"依赖: {config['project']['dependencies']}")

# 清理
import shutil
shutil.rmtree(tmpdir)
print("\\n演示完成")
\`\`\`

## 小结

- ⭐ **每个项目一个虚拟环境**，避免依赖污染系统 Python。
- ⭐ \`venv\` 是 Python 内置的虚拟环境创建工具：\`python -m venv myenv\`。
- ⭐ 激活：\`source myenv/bin/activate\`（Linux/Mac）；\`myenv\\\\Scripts\\\\activate\`（Windows）。
- ⭐ \`pip install\` 装包；\`pip freeze\` 导出依赖；\`pip install -r\` 从文件装。
- ⭐ \`requirements.txt\` 锁定版本；\`requirements-dev.txt\` 区分开发依赖。
- ⭐ \`pyproject.toml\` 是现代 Python 项目标准配置（PEP 517/518/621）。
- ⭐ \`pip-tools\` 把 \`requirements.in\` 编译成精确的 \`requirements.txt\`。
- ⭐ Poetry 是一站式工具：依赖 + venv + 构建 + 发布。
- ⭐ conda 适合数据科学，能管理非 Python 依赖。
- 安全：用 \`pip-audit\` / \`safety\` 扫描漏洞；CI 里定期升级。
- 多版本管理：\`pyenv\` 切换 Python 解释器版本。

下一部分进入装饰器与迭代器——Python 函数式编程的核心利器。`,
  },
];

export { chapters };