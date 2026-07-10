// =============================================================
// Python 文件管理教程（pyfile2）—— 第一批章节
// -------------------------------------------------------------
// 专注讲解 Python 文件与目录管理的核心技能与日常开发应用。
// 共 24 章，分 5 批：
//   batch1（1-4章）：  文件与路径基础
//   batch2（5-9章）：  文件读写详解
//   batch3（10-14章）：目录操作
//   batch4（15-19章）：高级文件操作
//   batch5（20-24章）：实战项目
//
// 每个章节包含：
//   id      : 唯一标识
//   group   : 分组名
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解（含表格、代码块、列表）
//   code    : 可运行、带详细中文注释的 Python 示例代码
//
// 代码运行环境约束：
//   - 用 python3 直接运行
//   - 仅使用 Python 标准库（os、pathlib、shutil 等）
//   - 所有跨平台代码在 macOS / Linux / Windows 都能跑
//   - 代码必须是单文件可独立运行的脚本
//   - 操作文件用临时目录 /tmp/pyfile2_demo_xxx，避免污染
//   - print 输出结果
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：为什么要学文件管理？
  // =========================================================
  {
    id: "pf-01",
    group: "文件与路径基础",
    icon: "📁",
    title: "为什么要学文件管理？",
    content: `## 一、文件管理是 Python 开发的"基本功"

无论你做 Web 后端、数据分析、自动化脚本、机器学习，**几乎所有程序都要跟文件打交道**：

- 读配置文件（config.yaml、settings.json）
- 写日志（app.log、error.log）
- 处理用户上传的图片、文档
- 把数据导出成 CSV、Excel
- 批量重命名、整理下载文件夹
- 备份、归档、压缩
- 临时文件、缓存管理

**不会文件管理 = 写不了任何"有用"的程序**。

## 二、Python 文件管理的 4 大场景

### 场景 1：读写文件

\`\`\`python
import json
# 读配置
with open("config.json") as f:
    config = json.load(f)

# 写日志
with open("app.log", "a") as f:
    f.write("用户登录成功\\n")
\`\`\`

### 场景 2：目录操作

\`\`\`python
from pathlib import Path
# 创建项目结构
for subdir in ["src", "tests", "docs", "data"]:
    Path(subdir).mkdir(exist_ok=True)

# 批量重命名
for f in Path("photos").glob("*.jpg"):
    f.rename(f.with_name(f"{f.stem}_backup.jpg"))
\`\`\`

### 场景 3：批量处理

\`\`\`python
from pathlib import Path
# 找出所有大文件
for f in Path.home().rglob("*"):
    if f.is_file() and f.stat().st_size > 100_000_000:
        print(f"大文件: {f}")
\`\`\`

### 场景 4：文件监控

\`\`\`python
# 监控某个目录，看新文件进来就处理
from watchdog.observers import Observer
\`\`\`

## 三、Python 文件管理的"两大门派"

Python 标准库提供了两套文件管理 API：

| 门派 | 风格 | 代表 |
|------|------|------|
| **os.path 派**（老派） | 函数式，路径是字符串 | \`os.path.join()\`、\`os.path.exists()\` |
| **pathlib 派**（新派，3.4+） | 面向对象，路径是对象 | \`Path("a") / "b"\`、\`Path.exists()\` |

**新代码推荐用 pathlib**——更优雅、更跨平台、更易读。

## 四、本教程的覆盖范围

| 主题 | 章节 |
|------|------|
| 路径操作 | 第 2-4 章 |
| 文件读写 | 第 5-9 章 |
| 目录操作 | 第 10-14 章 |
| 高级操作 | 第 15-19 章 |
| 实战项目 | 第 20-24 章 |

## 五、本章 demo

下面 demo 演示：
- 文件管理能做什么
- os vs pathlib 的直观对比
- 实战中的典型用法
`,
    code: `"""
第一章 demo：Python 文件管理的"两大门派"对比
演示：
  1. 用 os.path 做基础操作（老派）
  2. 用 pathlib 做同样的操作（新派）
  3. 直观对比：哪个更优雅？
"""

import os
import os.path
from pathlib import Path
import tempfile


# ===== 准备一个临时目录做演示 =====
# tempfile.mkdtemp 创建一个临时目录，程序退出后不会自动删除
# 用 NamedTemporaryFile / mkdtemp 比硬编码 /tmp 更安全
demo_dir = tempfile.mkdtemp(prefix="pyfile2_demo_")
print(f"演示目录: {demo_dir}\\n")


# ===== os.path 派 =====
def demo_os_path():
    print("=== os.path 派（老派） ===")

    # 1. 拼接路径
    p1 = os.path.join(demo_dir, "subdir", "file.txt")
    print(f"  拼接路径: {p1}")

    # 2. 取出目录名、文件名、扩展名
    print(f"  目录名: {os.path.dirname(p1)}")
    print(f"  文件名: {os.path.basename(p1)}")
    print(f"  扩展名: {os.path.splitext(p1)[1]}")

    # 3. 判断路径是否存在
    print(f"  存在吗: {os.path.exists(p1)}")

    # 4. 获取文件大小（不存在的文件会报错）
    # print(f"  大小: {os.path.getsize(p1)}")  # 这里会 FileNotFoundError
    print("  ⚠️  路径不存在的文件直接调用 getsize 会报错")
    print()


# ===== pathlib 派 =====
def demo_pathlib():
    print("=== pathlib 派（新派，Python 3.4+） ===")

    # 1. 拼接路径：直接用 / 运算符
    p2 = Path(demo_dir) / "subdir" / "file.txt"
    print(f"  拼接路径: {p2}")

    # 2. 取出目录、文件名、扩展名（链式调用）
    print(f"  父目录: {p2.parent}")
    print(f"  文件名: {p2.name}")
    print(f"  扩展名: {p2.suffix}")
    print(f"  去后缀: {p2.stem}")

    # 3. 判断存在
    print(f"  存在吗: {p2.exists()}")

    # 4. 不存在时安全获取信息
    print(f"  大小（不存在返回 None）: {p2.stat().st_size if p2.exists() else 'N/A'}")
    print()


# ===== 对比：哪个更好读？ =====
def demo_comparison():
    print("=== 对比：完成同样任务的代码量 ===\\n")

    # 任务：找到 demo_dir 下所有 .txt 文件

    # 老派（os + os.path + glob）
    import glob
    txt_files_old = glob.glob(os.path.join(demo_dir, "**", "*.txt"), recursive=True)
    print(f"  os.path 派:  {len(txt_files_old)} 行（import + 拼接 + glob）")

    # 新派（pathlib）
    txt_files_new = list(Path(demo_dir).rglob("*.txt"))
    print(f"  pathlib 派:  1 行（Path + rglob）\\n")

    print("  pathlib 用更少代码完成更多事情，且链式调用更优雅。")


# ===== 实战中典型的文件管理 =====
def demo_real_use():
    print("\\n=== 实战中的典型用法 ===\\n")

    # 1. 读配置
    config_path = Path(demo_dir) / "config.json"
    config_path.write_text('{"app_name": "demo", "version": "1.0"}', encoding="utf-8")
    print(f"  1. 读配置: {config_path.read_text(encoding='utf-8')}")

    # 2. 写日志
    log_path = Path(demo_dir) / "app.log"
    with log_path.open("a", encoding="utf-8") as f:
        f.write("[INFO] 应用启动\\n")
    print(f"  2. 写日志: 文件大小 {log_path.stat().st_size} 字节")

    # 3. 创建项目结构
    project = Path(demo_dir) / "myproject"
    for sub in ["src", "tests", "docs"]:
        (project / sub).mkdir(parents=True, exist_ok=True)
    print(f"  3. 创建项目结构: 目录数 {len(list(project.iterdir()))}")

    # 4. 批量处理文件
    photo_dir = Path(demo_dir) / "photos"
    photo_dir.mkdir(exist_ok=True)
    for i in range(3):
        (photo_dir / f"IMG_{i:03d}.jpg").write_bytes(b"fake jpg content")

    # 批量重命名
    renamed = 0
    for f in photo_dir.glob("*.jpg"):
        f.rename(f.with_name(f"{f.stem}_backup.jpg"))
        renamed += 1
    print(f"  4. 批量重命名: 处理 {renamed} 个文件")


# ===== 主程序 =====
if __name__ == "__main__":
    print("=" * 50)
    print("Python 文件管理教程 — 第一章 demo")
    print("=" * 50 + "\\n")

    demo_os_path()
    demo_pathlib()
    demo_comparison()
    demo_real_use()

    print("\\n" + "=" * 50)
    print("总结：")
    print("• 文件管理是 Python 的基本功")
    print("• 推荐用 pathlib（面向对象、更优雅）")
    print("• 后续章节会逐个深入每个主题")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第二章：路径的本质：绝对路径 vs 相对路径
  // =========================================================
  {
    id: "pf-02",
    group: "文件与路径基础",
    icon: "🛣️",
    title: "路径的本质：绝对路径 vs 相对路径",
    content: `## 一、什么是路径？

**路径 = 文件/目录在电脑里的"住址"**。就像你家地址是"XX 市 XX 区 XX 路 XX 号"，文件路径是"XX 盘符/XX 文件夹/XX 文件"。

## 二、两种路径

### 1. 绝对路径（从根目录开始）

\`\`\`text
Windows: C:\\Users\\Alice\\Documents\\report.docx
macOS/Linux: /Users/Alice/Documents/report.docx
\`\`\`

特点：
- **完整**，从盘符（Windows）或根 /（Unix）开始
- 在**任何目录下**用这个路径都能找到同一个文件
- 适合：程序里写死的配置、日志文件

### 2. 相对路径（相对于"当前目录"）

\`\`\`text
当前目录: /Users/Alice/Projects/myapp

相对路径: ./data/users.json
        → 实际: /Users/Alice/Projects/myapp/data/users.json

相对路径: ../shared/config.yaml
        → 实际: /Users/Alice/Projects/shared/config.yaml
\`\`\`

特点：
- **不带盘符或根 /**
- 相对于**当前工作目录（CWD）**解析
- \`.\` 表示当前目录，\`..\` 表示上级目录
- 适合：项目内部文件、配置文件

## 三、当前工作目录（CWD）

Python 启动时有个"当前工作目录"：

- 命令行：\`cd /a/b && python script.py\` → CWD 是 \`/a/b\`
- 脚本里相对路径都是基于 CWD
- 用 \`os.getcwd()\` 查看当前目录

\`\`\`python
import os
print(os.getcwd())  # /Users/Alice/Projects/myapp

# 相对路径是相对 CWD
with open("data/users.json") as f:  # 实际打开 /Users/Alice/Projects/myapp/data/users.json
    ...
\`\`\`

## 四、绝对 vs 相对的 4 个使用建议

| 场景 | 推荐 |
|------|------|
| 项目内部文件 | ✅ 相对路径 |
| 跨项目共享文件 | 绝对路径 |
| 配置文件 | 项目内相对路径 |
| 日志、临时文件 | 绝对路径或 \`tempfile\` 模块 |
| 部署到不同机器 | 不要硬编码绝对路径！ |

## 五、跨平台路径分隔符

| 平台 | 分隔符 | 例子 |
|------|--------|------|
| Windows | \`\\\` | \`C:\\\\Users\\\\Alice\` |
| Unix/macOS | \`/\` | \`/Users/Alice\` |

**千万别**用字符串拼接：

\`\`\`python
from pathlib import Path
import os
# ❌ 跨平台会坏
path = "data" + "/" + "users.json"  # Windows 上能用，但风格不一致

# ✅ 用 os.path.join 或 pathlib
path = os.path.join("data", "users.json")  # 跨平台
path = Path("data") / "users.json"          # 跨平台，更优雅
\`\`\`

## 六、本章 demo

下面 demo 演示：
- 绝对路径 vs 相对路径
- 当前工作目录
- \`..\` 和 \`.\` 的含义
- 跨平台路径拼接
`,
    code: `"""
第二章 demo：绝对路径 vs 相对路径
演示：
  1. 两种路径的获取与使用
  2. 当前工作目录（CWD）
  3. . 和 .. 的含义
  4. 跨平台路径拼接
"""

import os
from pathlib import Path


def demo_absolute_vs_relative():
    print("=== 绝对路径 vs 相对路径 ===\\n")

    # 获取绝对路径
    abs_path = os.path.abspath(".")
    print(f"  当前目录的绝对路径: {abs_path}")

    # 获取当前工作目录
    cwd = os.getcwd()
    print(f"  当前工作目录: {cwd}\\n")


def demo_dot_and_dotdot():
    print("=== . 和 .. 的含义 ===\\n")

    cwd = Path.cwd()
    print(f"  当前目录: {cwd}")

    # . 是当前目录
    print(f"  Path('.'): {Path('.').resolve()}")

    # .. 是上级目录
    print(f"  Path('..'): {Path('..').resolve()}")

    # ../../ 是上两级
    print(f"  Path('../..'): {Path('../..').resolve()}\\n")


def demo_relative_resolution():
    print("=== 相对路径如何解析为绝对路径 ===\\n")

    # 创建几个相对路径
    rel_paths = [
        "data.txt",
        "./data.txt",
        "subdir/data.txt",
        "../data.txt",
    ]

    for rp in rel_paths:
        abs_p = (Path.cwd() / rp).resolve()
        print(f"  '{rp}' → {abs_p}")
    print()


def demo_cross_platform_join():
    print("=== 跨平台路径拼接 ===\\n")

    parts = ["data", "users", "2024", "report.csv"]

    # 方式 1：字符串拼接（不推荐）
    bad_path = "/".join(parts)  # 在 Windows 上会出问题
    print(f"  字符串拼接: {bad_path}（Windows 上不工作）")

    # 方式 2：os.path.join
    import os.path
    good_path = os.path.join(*parts)
    print(f"  os.path.join: {good_path}（跨平台）")

    # 方式 3：pathlib / 运算符
    best_path = Path(*parts)
    print(f"  pathlib Path /: {best_path}（跨平台 + 面向对象）")
    print()


def demo_chdir():
    print("=== 切换当前工作目录 ===\\n")

    print(f"  切换前 CWD: {os.getcwd()}")
    # 切换到 /tmp
    os.chdir("/tmp")
    print(f"  切换后 CWD: {os.getcwd()}")

    # 现在 'data.txt' 是相对 /tmp 的
    rel = Path("data.txt")
    print(f"  相对路径 'data.txt' 解析为: {rel.resolve()}\\n")


def demo_practical():
    print("=== 实战建议 ===\\n")

    # 1. 项目内部用相对路径
    project_root = Path(__file__).parent  # 当前脚本所在目录
    print(f"  1. 项目根: {project_root}")
    config_file = project_root / "config" / "settings.json"
    print(f"     配置文件: {config_file}")

    # 2. 用 Path.home() 取用户主目录（跨平台）
    home = Path.home()
    print(f"  2. 用户主目录: {home}")

    # 3. 临时文件用 tempfile（避免硬编码 /tmp）
    import tempfile
    tmp = Path(tempfile.gettempdir())
    print(f"  3. 系统临时目录: {tmp}")
    print()


# ===== 主程序 =====
if __name__ == "__main__":
    print("=" * 50)
    print("Python 文件管理教程 — 第二章 demo")
    print("=" * 50 + "\\n")

    demo_absolute_vs_relative()
    demo_dot_and_dotdot()
    demo_relative_resolution()
    demo_cross_platform_join()
    demo_chdir()
    demo_practical()

    print("=" * 50)
    print("总结：")
    print("• 绝对路径：从根目录开始，跨任何位置都有效")
    print("• 相对路径：相对当前工作目录（CWD）")
    print("• 项目内部用相对路径，跨项目用绝对路径")
    print("• 永远用 os.path.join 或 pathlib 拼接路径")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第三章：pathlib：面向对象的路径操作
  // =========================================================
  {
    id: "pf-03",
    group: "文件与路径基础",
    icon: "🧩",
    title: "pathlib：面向对象的路径操作",
    content: `## 一、pathlib 是什么？

Python 3.4 引入的 \`pathlib\` 模块，用**面向对象**的方式处理路径。

\`\`\`python
from pathlib import Path

p = Path("/Users/Alice/file.txt")
print(p.name)      # file.txt
print(p.suffix)    # .txt
print(p.parent)    # /Users/Alice
print(p.exists())  # True/False
\`\`\`

**核心思想**：路径是**对象**，不是字符串。操作路径像操作对象一样链式调用。

## 二、Path 对象的两类

| 类型 | 平台 | 例子 |
|------|------|------|
| \`PosixPath\` | Unix/macOS | \`Path("/usr/bin")\` |
| \`WindowsPath\` | Windows | \`Path("C:\\\\Windows")\` |
| \`PurePosixPath\` | 不访问文件系统的 PosixPath | \`PurePosixPath("/a/b")\` |
| \`PureWindowsPath\` | 不访问文件系统的 WindowsPath | \`PureWindowsPath("C:\\\\a")\` |

**通常你只用 \`Path\`**——它会根据当前平台自动选 PosixPath 或 WindowsPath。

## 三、Path 的 4 类操作

### 1. 创建路径

\`\`\`python
from pathlib import Path

Path("/a/b")           # 字面量路径
Path.cwd()             # 当前工作目录
Path.home()            # 用户主目录
Path("/a") / "b" / "c" # 用 / 拼接
\`\`\`

### 2. 解析路径（拆解）

\`\`\`python
from pathlib import Path
p = Path("/Users/Alice/file.txt")
p.parts      # ('/', 'Users', 'Alice', 'file.txt')
p.name       # 'file.txt'  文件名
p.stem       # 'file'      去后缀
p.suffix     # '.txt'      扩展名
p.parent     # '/Users/Alice' 父目录
p.parents    # 各级父目录的序列
p.root       # '/'         根
p.drive      # ''          Windows 才有盘符
\`\`\`

### 3. 判断路径

\`\`\`python
p.exists()        # 存在吗
p.is_file()       # 是文件吗
p.is_dir()        # 是目录吗
p.is_symlink()    # 是符号链接吗
p.is_absolute()   # 是绝对路径吗
\`\`\`

### 4. 路径操作（返回新 Path）

\`\`\`python
from pathlib import Path
p = Path("/a/b.txt")
p.with_name("c.txt")     # /a/c.txt  改文件名
p.with_suffix(".md")     # /a/b.md    改后缀
p.parent / "new"         # /a/new
\`\`\`

## 四、读 glob 通配符

\`\`\`python
from pathlib import Path
# 找当前目录所有 .py 文件
list(Path(".").glob("*.py"))

# 递归找所有 .py 文件
list(Path(".").rglob("*.py"))

# 多种模式
list(Path(".").glob(["*.py", "*.md"]))

# 用通配符: * 任意字符, ? 单字符, [abc] 字符集
list(Path(".").glob("test_*.py"))  # test_xxx.py
\`\`\`

## 五、Path 的 5 大优势

1. **跨平台**：不用关心 \`/\` 和 \`\\\\\`
2. **可读**：\`Path("a") / "b"\` 比 \`os.path.join("a", "b")\` 直观
3. **链式**：\`p.parent.with_suffix(".bak")\`
4. **方法丰富**：基本操作都有
5. **类型一致**：返回值还是 Path，可以继续操作

## 六、本章 demo

下面 demo 演示 pathlib 的核心 API。
`,
    code: `"""
第三章 demo：pathlib 面向对象的路径操作
演示：
  1. 创建 Path
  2. 解析路径（name、stem、suffix、parent、parts）
  3. 判断路径
  4. 路径操作（with_name、with_suffix）
  5. glob 通配符
"""

import os
import tempfile
from pathlib import Path


def demo_create():
    print("=== 创建 Path ===\\n")

    # 1. 字面量
    p1 = Path("/Users/Alice/file.txt")
    print(f"  Path('...'): {p1}")

    # 2. 当前目录和用户主目录
    print(f"  Path.cwd(): {Path.cwd()}")
    print(f"  Path.home(): {Path.home()}")

    # 3. / 运算符拼接
    p3 = Path("/tmp") / "data" / "users.json"
    print(f"  Path / 'b' / 'c': {p3}")

    # 4. 从已有路径衍生
    p4 = p3.parent / "config" / "settings.json"
    print(f"  p3.parent / ...: {p4}\\n")


def demo_decompose():
    print("=== 解析路径 ===\\n")

    p = Path("/Users/Alice/Documents/report.final.docx")
    print(f"  完整路径: {p}")
    print(f"  p.parts: {p.parts}")
    print(f"  p.name: {p.name}")
    print(f"  p.stem: {p.stem}")
    print(f"  p.suffix: {p.suffix}")
    print(f"  p.suffixes: {p.suffixes}")
    print(f"  p.parent: {p.parent}")
    print(f"  p.root: {p.root}")
    print()


def demo_judge():
    print("=== 判断路径 ===\\n")

    demo_dir = Path(tempfile.mkdtemp(prefix="pf03_"))
    # 创建一些文件用于判断
    (demo_dir / "a.txt").write_text("hello")
    (demo_dir / "subdir").mkdir()

    for p in [demo_dir / "a.txt", demo_dir / "subdir", demo_dir / "nope.txt"]:
        print(f"  {p.name}:")
        print(f"    存在: {p.exists()}")
        print(f"    是文件: {p.is_file() if p.exists() else 'N/A'}")
        print(f"    是目录: {p.is_dir() if p.exists() else 'N/A'}")
    print()


def demo_manipulate():
    print("=== 路径操作 ===\\n")

    p = Path("/data/backup/file.txt.bak")
    print(f"  原路径: {p}")
    print(f"  改文件名 with_name('c.txt'): {p.with_name('c.txt')}")
    print(f"  改后缀 with_suffix('.md'): {p.with_suffix('.md')}")
    print(f"  父目录: {p.parent}")
    print(f"  上两级: {p.parent.parent}")
    print()


def demo_glob():
    print("=== glob 通配符 ===\\n")

    # 在临时目录创建一些测试文件
    demo_dir = Path(tempfile.mkdtemp(prefix="pf03_glob_"))
    for name in ["a.py", "b.py", "test_1.py", "test_2.py", "c.md", "subdir/d.py"]:
        full = demo_dir / name
        full.parent.mkdir(parents=True, exist_ok=True)
        full.write_text("")

    print(f"  测试目录: {demo_dir}")
    print(f"  当前目录所有 .py: {[p.name for p in demo_dir.glob('*.py')]}")
    print(f"  递归所有 .py: {sorted([p.name for p in demo_dir.rglob('*.py')])}")
    print(f"  test_*.py: {[p.name for p in demo_dir.glob('test_*.py')]}")
    print(f"  ? 单字符: {[p.name for p in demo_dir.glob('?.py')]}")
    print()


def demo_advanced():
    print("=== 高级：链式调用 ===\\n")

    demo_dir = Path(tempfile.mkdtemp(prefix="pf03_adv_"))
    # 创建 5 个 .jpg 文件
    for i in range(5):
        (demo_dir / f"IMG_{i:03d}.jpg").write_bytes(b"fake jpg")

    print(f"  演示目录: {demo_dir}")

    # 链式：找所有 .jpg → 改后缀为 .png
    converted = []
    for f in demo_dir.glob("*.jpg"):
        # with_suffix 不实际改文件，只是改路径表示
        # 要真正改文件需要 f.rename(f.with_suffix('.png'))
        new_p = f.with_suffix(".png")
        converted.append(new_p.name)
    print(f"  链式转换: {converted}")

    # 链式：取父目录 + 加后缀
    p = Path("/data/file.txt")
    new = p.parent / (p.stem + "_backup" + p.suffix)
    print(f"  父目录 + 后缀: {p} → {new}\\n")


# ===== 主程序 =====
if __name__ == "__main__":
    print("=" * 50)
    print("Python 文件管理教程 — 第三章 demo")
    print("=" * 50 + "\\n")

    demo_create()
    demo_decompose()
    demo_judge()
    demo_manipulate()
    demo_glob()
    demo_advanced()

    print("=" * 50)
    print("总结：")
    print("• pathlib 是面向对象的路径操作（推荐）")
    print("• Path / Path 拼接，链式调用优雅")
    print("• 解析：name、stem、suffix、parent、parts")
    print("• 通配符：glob（当前）、rglob（递归）")
    print("• 操作：with_name、with_suffix 不改实际文件")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第四章：跨平台文件路径的 5 个坑
  // =========================================================
  {
    id: "pf-04",
    group: "文件与路径基础",
    icon: "⚠️",
    title: "跨平台文件路径的 5 个坑",
    content: `## 一、坑 1：硬编码路径分隔符

**症状**：在 Windows 上跑的代码，到 macOS 上全坏（或反过来）。

\`\`\`python
from pathlib import Path
# ❌ 硬编码 /
path = "data/2024/report.csv"  # Windows 上能用，但风格不一致

# ❌ 硬编码 \\
path = "data\\\\2024\\\\report.csv"  # macOS 上直接坏

# ✅ 用 pathlib 或 os.path.join
path = Path("data") / "2024" / "report.csv"
\`\`\`

## 二、坑 2：硬编码 /tmp

**症状**：在 macOS 上 OK，部署到 Windows 服务器就坏（Windows 没有 /tmp）。

\`\`\`python
from pathlib import Path
# ❌ 硬编码 /tmp
tmp_file = "/tmp/myapp_cache.db"

# ✅ 用 tempfile 或 Path.home()
import tempfile
tmp_file = Path(tempfile.gettempdir()) / "myapp_cache.db"
# 或
tmp_file = Path.home() / ".myapp_cache.db"
\`\`\`

## 三、坑 3：忘记用 \`exists()\` 就操作

**症状**：\`FileNotFoundError\`，程序崩溃。

\`\`\`python
# ❌ 直接用
with open("config.json") as f:
    config = f.read()  # 如果文件不存在就崩

# ✅ 先判断
from pathlib import Path
if Path("config.json").exists():
    with open("config.json") as f:
        config = f.read()
else:
    config = {}  # 用默认值
\`\`\`

## 四、坑 4：用 \`~\` 路径但 Python 不展开

**症状**：\`~/data/file.json\` 找不到。

\`\`\`python
from pathlib import Path
# ❌ Python 不认识 ~
path = "~/data/file.json"  # 真的去找叫 ~ 的目录

# ✅ 用 os.path.expanduser 或 Path.home()
import os
path = os.path.expanduser("~/data/file.json")  # 正确展开
# 或
path = Path.home() / "data" / "file.json"
\`\`\`

## 五、坑 5：相对路径基于 CWD，部署时崩

**症状**：开发时跑得好，部署到另一目录就找不到文件。

\`\`\`python
# ❌ 相对 CWD
with open("config.json") as f:  # 假设 CWD 是项目根

# ✅ 用 __file__ 定位
from pathlib import Path
BASE_DIR = Path(__file__).parent
with open(BASE_DIR / "config" / "config.json") as f:
    ...
\`\`\`

**原则**：用 \`__file__\` 定位脚本自身位置，再算相对路径。

## 六、Bonus 坑 6：路径里有空格或特殊字符

**症状**：\`os.system("rm " + filename)\` 失败或删错文件。

\`\`\`python
import os
# ❌ 字符串拼接
os.system("rm " + filename)  # 文件名带空格会出问题

# ✅ 用 list 形式
import subprocess
subprocess.run(["rm", filename])  # 安全
\`\`\`

## 七、本章 demo

下面 demo 演示每个坑的最小复现 + 修复。
`,
    code: `"""
第四章 demo：跨平台路径的 5 个坑
每个坑演示：复现 → 解释 → 修复
"""

import os
import sys
import tempfile
from pathlib import Path


# ===== 坑 1：硬编码分隔符 =====
def pitfall_1_hardcoded_separator():
    print("=== 坑 1: 硬编码分隔符 ===\\n")

    # ❌ 硬编码 /
    bad1 = "data/2024/report.csv"
    # Windows 上能跑（Python 自动转换），但风格不一致

    # ❌ 硬编码 \\\\
    bad2 = "data\\\\2024\\\\report.csv"
    print(f"  bad1 (用 /): {bad1} → 在 Windows 上可以但不规范")
    print(f"  bad2 (用 \\\\\\\\): {bad2} → 在 macOS/Linux 上直接坏\\n")

    # ✅ 用 pathlib
    good = Path("data") / "2024" / "report.csv"
    print(f"  ✅ pathlib 写法: {good}（跨平台）\\n")


# ===== 坑 2：硬编码 /tmp =====
def pitfall_2_hardcoded_tmp():
    print("=== 坑 2: 硬编码 /tmp ===\\n")

    # ❌
    bad = "/tmp/myapp_cache.db"
    print(f"  ❌ {bad} → Windows 上无 /tmp")

    # ✅
    good1 = Path(tempfile.gettempdir()) / "myapp_cache.db"
    print(f"  ✅ tempfile 方案: {good1}")

    good2 = Path.home() / ".myapp_cache.db"
    print(f"  ✅ 用户主目录: {good2}\\n")


# ===== 坑 3：忘记 exists =====
def pitfall_3_no_exists_check():
    print("=== 坑 3: 忘 exists 就操作 ===\\n")

    # ❌ 直接操作会 FileNotFoundError
    fake_file = Path("/nonexistent_dir/nonexistent_file.txt")
    print(f"  ❌ 直接 open('{fake_file}') 会崩")
    # 演示（注释掉避免实际崩溃）
    # open(fake_file)

    # ✅ 防御式写法
    if fake_file.exists():
        with open(fake_file) as f:
            data = f.read()
    else:
        data = None
        print(f"  ✅ 文件不存在时用默认值: data = {data}\\n")


# ===== 坑 4：~ 不展开 =====
def pitfall_4_tilde_not_expanded():
    print("=== 坑 4: Python 不展开 ~ ===\\n")

    # ❌
    bad = "~/data/file.json"
    print(f"  ❌ Python 不会展开 '~'：{bad} 会被当成字面路径")

    # ✅ 用 os.path.expanduser
    good1 = os.path.expanduser("~/data/file.json")
    print(f"  ✅ os.path.expanduser: {good1}")

    # ✅ 用 Path.home
    good2 = Path.home() / "data" / "file.json"
    print(f"  ✅ Path.home(): {good2}\\n")


# ===== 坑 5：相对路径基于 CWD =====
def pitfall_5_relative_to_cwd():
    print("=== 坑 5: 相对路径基于 CWD ===\\n")

    # ❌ 相对当前工作目录
    print("  ❌ open('config.json') 假设 CWD 是项目根")
    print("     如果 cd /elsewhere && python script.py 就找不到\\n")

    # ✅ 用 __file__ 定位
    script_dir = Path(__file__).parent
    config_path = script_dir / "config" / "config.json"
    print(f"  ✅ 脚本目录: {script_dir}")
    print(f"     配置文件: {config_path}\\n")


# ===== Bonus：subprocess 的路径 =====
def pitfall_6_subprocess_path():
    print("=== Bonus: subprocess 路径 ===\\n")

    # ❌ 字符串拼接 + shell=True
    filename = "my file with spaces.txt"
    print(f"  ❌ os.system('cat {filename}') 文件名带空格会出错")

    # ✅ 列表形式
    import subprocess
    demo_dir = Path(tempfile.mkdtemp(prefix="pf04_"))
    (demo_dir / filename).write_text("hello")
    result = subprocess.run(
        ["cat", str(demo_dir / filename)],
        capture_output=True, text=True
    )
    print(f"  ✅ subprocess.run(['cat', path]): {result.stdout.strip()}\\n")


# ===== 跨平台一致性自检 =====
def cross_platform_check():
    print("=== 当前平台信息 ===\\n")
    print(f"  系统: {sys.platform}")
    print(f"  os.sep: '{os.sep}'")
    print(f"  Path.cwd(): {Path.cwd()}")
    print(f"  Path.home(): {Path.home()}")
    print(f"  tempfile.gettempdir(): {tempfile.gettempdir()}")


# ===== 主程序 =====
if __name__ == "__main__":
    print("=" * 50)
    print("Python 文件管理教程 — 第四章 demo")
    print("=" * 50 + "\\n")

    cross_platform_check()
    print()
    pitfall_1_hardcoded_separator()
    pitfall_2_hardcoded_tmp()
    pitfall_3_no_exists_check()
    pitfall_4_tilde_not_expanded()
    pitfall_5_relative_to_cwd()
    pitfall_6_subprocess_path()

    print("=" * 50)
    print("总结：跨平台路径的 5 个坑")
    print("  1. 硬编码分隔符 → 用 pathlib")
    print("  2. 硬编码 /tmp → 用 tempfile 或 Path.home")
    print("  3. 忘 exists → 防御式判断")
    print("  4. ~ 不展开 → 用 os.path.expanduser / Path.home")
    print("  5. 相对 CWD → 用 __file__ 定位脚本")
    print("=" * 50)
`,
  },
];
