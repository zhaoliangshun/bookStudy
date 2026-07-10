// =============================================================
// Python 文件管理教程（pyfile2）—— 第三批章节
// -------------------------------------------------------------
// 目录操作（10-14章）
//   第 10 章：创建/删除目录
//   第 11 章：遍历目录（iterdir / glob / rglob / os.walk）
//   第 12 章：移动/重命名/复制（shutil）
//   第 13 章：批量重命名与文件整理
//   第 14 章：临时文件与目录（tempfile）
// =============================================================

export const chapters = [
  // =========================================================
  // 第十章：创建/删除目录
  // =========================================================
  {
    id: "pf-10",
    group: "目录操作",
    icon: "📂",
    title: "创建/删除目录",
    content: `## 一、目录也是文件

Linux/Unix 哲学："一切皆文件"——目录也是特殊的文件，记录了里面包含什么。

## 二、创建目录

### pathlib 方式（推荐）

\`\`\`python
from pathlib import Path

# 创建单层目录
p = Path("data")
p.mkdir()                # 父目录必须存在
p.mkdir(exist_ok=True)   # 目录已存在不报错

# 创建多层目录
p = Path("a/b/c")
p.mkdir(parents=True, exist_ok=True)  # 父目录不存在也创建
\`\`\`

**关键参数**：
- \`exist_ok=False\`（默认）：目录已存在则报错
- \`parents=False\`（默认）：父目录不存在则报错
- \`mode=0o777\`：权限（Unix）

### os 方式

\`\`\`python
import os

os.mkdir("data")                # 等价 Path("data").mkdir()
os.makedirs("a/b/c")            # 等价 parents=True
os.makedirs("a/b/c", exist_ok=True)
\`\`\`

## 三、删除目录

\`\`\`python
from pathlib import Path
import shutil

# 删除空目录
Path("data").rmdir()  # 目录非空则报错

# 删除非空目录（递归）
shutil.rmtree("data")  # ⚠️ 永久删除，不会进回收站
\`\`\`

## 四、判断目录

\`\`\`python
from pathlib import Path

p = Path("data")
p.exists()   # 存在吗
p.is_dir()   # 是目录吗
p.is_file()  # 是文件吗
\`\`\`

## 五、当前目录与父目录

\`\`\`python
from pathlib import Path

Path.cwd()            # 当前工作目录
Path(".").resolve()   # 解析后的绝对路径

# 父目录链
p = Path("/a/b/c/d.txt")
p.parent               # /a/b/c
p.parent.parent        # /a/b
list(p.parents)        # [PosixPath('/a/b/c'), PosixPath('/a/b'), PosixPath('/a'), PosixPath('/')]
\`\`\`

## 六、权限

Unix 系统下创建目录可以指定权限：

\`\`\`python
from pathlib import Path
# rwxr-xr-x (755)
Path("data").mkdir(mode=0o755)
\`\`\`

常见权限：
- \`0o755\`：所有者全部，其他读+执行
- \`0o700\`：只有所有者能访问
- \`0o777\`：所有用户全部权限（不推荐）

## 七、删除的 3 个危险操作

1. \`shutil.rmtree(path)\`：递归删除，**无法恢复**
2. \`os.system("rm -rf /")\`：**别运行这个！**
3. \`pathlib.Path.unlink()\`：删文件，**无法恢复**

**保护措施**：
\`\`\`python
# 删除前确认
if p.exists() and input(f"确认删除 {p}? (yes/no): ") == "yes":
    shutil.rmtree(p)
\`\`\`

## 八、本章 demo
下面 demo 演示所有目录操作。
`,
    code: `"""
第十章 demo：创建/删除目录
演示：
  1. mkdir 三种模式
  2. parents=True 创建多层
  3. exist_ok 防止报错
  4. rmdir vs rmtree
  5. 创建项目结构实战
"""

import os
import shutil
import tempfile
from pathlib import Path


def demo_mkdir_basic():
    print("=== 1. mkdir 基础 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf10_"))

    # 普通创建
    p1 = base / "data"
    p1.mkdir()
    print(f"  创建 {p1.name}: 存在={p1.is_dir()}")

    # exist_ok=True：存在不报错
    p1.mkdir(exist_ok=True)
    print(f"  再次创建（exist_ok=True）: OK\\n")


def demo_mkdir_parents():
    print("=== 2. parents=True 创建多层 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf10_p_"))

    # 默认：父目录不存在会报错
    deep = base / "a" / "b" / "c"
    try:
        deep.mkdir()
    except FileNotFoundError as e:
        print(f"  不带 parents: {e!r}")

    # parents=True：自动创建父目录
    deep.mkdir(parents=True, exist_ok=True)
    print(f"  parents=True 后, 层级: {len(deep.parts)}")
    print(f"  完整路径: {deep}\\n")


def demo_rmdir_vs_rmtree():
    print("=== 3. rmdir vs rmtree ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf10_rm_"))

    # rmdir：只能删空目录
    empty = base / "empty"
    empty.mkdir()
    empty.rmdir()
    print(f"  rmdir 空目录: {empty.exists() == False}")

    # rmtree：能删非空目录
    full = base / "full"
    full.mkdir()
    (full / "a.txt").write_text("data")
    (full / "sub").mkdir()
    (full / "sub" / "b.txt").write_text("data")
    shutil.rmtree(full)
    print(f"  rmtree 非空目录: {full.exists() == False}")

    # rmdir 非空目录 → 报错
    full.mkdir()
    (full / "a.txt").write_text("data")
    try:
        full.rmdir()
    except OSError as e:
        print(f"  rmdir 非空目录: {e!r}\\n")


def demo_project_structure():
    print("=== 4. 创建标准项目结构 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf10_proj_"))
    project = base / "myproject"

    # 用 parents=True 一次性建好
    for sub in [
        "src", "tests", "docs", "data", "data/raw", "data/processed",
        "logs", "scripts", "config"
    ]:
        (project / sub).mkdir(parents=True, exist_ok=True)

    # 显示创建的结构
    print(f"  项目根: {project}")
    for p in sorted(project.rglob("*")):
        if p.is_dir():
            depth = len(p.relative_to(project).parts)
            print(f"  {'  ' * depth}📁 {p.name}/")
    print()


def demo_safe_delete():
    print("=== 5. 安全删除（带确认） ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf10_safe_"))
    target = base / "important_data"
    target.mkdir()
    (target / "file.txt").write_text("重要数据")

    def safe_rmtree(path):
        if not path.exists():
            print(f"  路径不存在: {path}")
            return False
        # 实际应用应该用 input() 让用户确认，这里模拟
        size = sum(f.stat().st_size for f in path.rglob('*') if f.is_file())
        file_count = sum(1 for _ in path.rglob('*') if _.is_file())
        print(f"  准备删除: {path}")
        print(f"    包含 {file_count} 个文件, {size} 字节")
        # 模拟确认
        confirmed = True  # 实际中: input("确认? yes/no: ") == "yes"
        if confirmed:
            shutil.rmtree(path)
            print(f"  ✅ 已删除")
            return True
        return False

    safe_rmtree(target)


# ===== 主程序 =====
if __name__ == "__main__":
    print("=" * 50)
    print("Python 文件管理教程 — 第十章 demo")
    print("=" * 50 + "\\n")

    demo_mkdir_basic()
    demo_mkdir_parents()
    demo_rmdir_vs_rmtree()
    demo_project_structure()
    demo_safe_delete()

    print("\\n" + "=" * 50)
    print("总结：")
    print("• mkdir(exist_ok=True) 防已存在报错")
    print("• mkdir(parents=True) 自动建父目录")
    print("• rmdir 删空目录，rmtree 删非空")
    print("• 重要数据删除前必须确认")
    print("• 标准项目结构：src/tests/docs/data/logs")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第十一章：遍历目录
  // =========================================================
  {
    id: "pf-11",
    group: "目录操作",
    icon: "🔍",
    title: "遍历目录（iterdir/glob/rglob/os.walk）",
    content: `## 一、4 种遍历方式

| 方式 | 速度 | 递归 | 适用 |
|------|------|------|------|
| \`iterdir()\` | ⚡⚡⚡ | ❌ | 列出当前层 |
| \`glob()\` | ⚡⚡ | ❌ | 当前层匹配 |
| \`rglob()\` | ⚡ | ✅ | 递归匹配 |
| \`os.walk()\` | ⚡ | ✅ | 自定义遍历 |

## 二、iterdir() 列出当前层

\`\`\`python
from pathlib import Path

for p in Path(".").iterdir():
    print(p)  # 所有直接子项
\`\`\`

**返回**：\`Iterator[Path]\`

## 三、glob() 通配符匹配

\`\`\`python
from pathlib import Path
# 当前目录所有 .py
list(Path(".").glob("*.py"))

# 多种后缀
list(Path(".").glob(["*.py", "*.md"]))

# 通配符语法（Unix shell 风格）
# *    任意字符
# ?    单个字符
# [abc] 字符集
list(Path(".").glob("test_*.py"))     # test_开头的
list(Path(".").glob("?.py"))           # 单字符名
list(Path(".").glob("[abc]*.txt"))    # a/b/c 开头的
\`\`\`

## 四、rglob() 递归匹配

\`\`\`python
from pathlib import Path
# 递归找所有 .py
list(Path(".").rglob("*.py"))

# 等价于
list(Path(".").glob("**/*.py"))
\`\`\`

**警告**：\`rglob\` 慢！大目录慎用。

## 五、os.walk() 自定义遍历

\`\`\`python
import os
for root, dirs, files in os.walk("."):
    # root: 当前目录
    # dirs: 子目录列表
    # files: 文件列表
    for f in files:
        print(os.path.join(root, f))
\`\`\`

**特点**：
- 真正"遍历"——你控制怎么处理每个文件
- 可以中途 \`del dirs[:]\` 决定哪些子目录继续递归
- 旧 API，但功能最强大

## 六、按条件过滤

\`\`\`python
from pathlib import Path
# 找大于 1MB 的文件
for f in Path(".").rglob("*"):
    if f.is_file() and f.stat().st_size > 1_000_000:
        print(f)

# 找最近 7 天修改的文件
import time
seven_days_ago = time.time() - 7*24*3600
for f in Path(".").rglob("*"):
    if f.is_file() and f.stat().st_mtime > seven_days_ago:
        print(f)
\`\`\`

## 七、性能对比

| 场景 | 推荐 |
|------|------|
| 列单层 | iterdir |
| 单层 + 模式 | glob |
| 递归 + 模式 | rglob |
| 递归 + 复杂逻辑 | os.walk |

## 八、本章 demo
下面 demo 对比各种遍历方式。
`,
    code: `"""
第十一章 demo：遍历目录
演示：
  1. iterdir 列出单层
  2. glob 通配符
  3. rglob 递归
  4. os.walk 自定义
  5. 按大小/时间过滤
"""

import os
import time
import tempfile
from pathlib import Path


def create_test_tree():
    """创建测试目录树"""
    base = Path(tempfile.mkdtemp(prefix="pf11_"))
    # 创建结构
    structure = {
        "src": ["main.py", "utils.py", "test_main.py"],
        "src/sub": ["helper.py"],
        "docs": ["README.md", "CHANGELOG.md"],
        "data": ["users.csv", "data.json"],
        "data/raw": ["raw1.txt", "raw2.txt"],
        "tests": ["test1.py", "test2.py", "conftest.py"],
        "config.yaml": None,  # 文件
        "README.md": None,    # 文件
    }
    for path, files in structure.items():
        full = base / path
        if files is None:
            full.touch()
        else:
            full.mkdir(parents=True, exist_ok=True)
            for f in files:
                (full / f).touch()
    return base


def demo_iterdir():
    print("=== 1. iterdir 单层 ===\\n")
    base = create_test_tree()
    print(f"  根目录: {base.name}")
    for p in sorted(base.iterdir()):
        kind = "📁" if p.is_dir() else "📄"
        print(f"    {kind} {p.name}")
    print()


def demo_glob():
    print("=== 2. glob 通配符 ===\\n")
    base = create_test_tree()

    print("  *.md:", sorted([p.name for p in base.glob("*.md")]))
    print("  *.py:", sorted([p.name for p in base.glob("*.py")]))
    print("  test*:", sorted([p.name for p in base.glob("test*")]))
    print("  ?.yaml:", sorted([p.name for p in base.glob("?.yaml")]))
    print("  *.{py,md}:", sorted([p.name for p in base.glob("*.{py,md}")]))
    print()


def demo_rglob():
    print("=== 3. rglob 递归 ===\\n")
    base = create_test_tree()
    print("  递归所有 .py:")
    for p in sorted(base.rglob("*.py")):
        rel = p.relative_to(base)
        print(f"    {rel}")
    print()


def demo_os_walk():
    print("=== 4. os.walk 自定义遍历 ===\\n")
    base = create_test_tree()
    print(f"  目录树结构:")
    for root, dirs, files in os.walk(base):
        depth = root.replace(str(base), "").count(os.sep)
        rel = Path(root).relative_to(base)
        indent = "  " * (depth + 1)
        print(f"{indent}📁 {rel if str(rel) != '.' else base.name}/")
        for f in sorted(files):
            print(f"{indent}  📄 {f}")
    print()


def demo_filter_by_size():
    print("=== 5. 按大小过滤 ===\\n")
    base = create_test_tree()
    # 给某些文件写点内容
    (base / "data" / "users.csv").write_text("x" * 2000)
    (base / "data" / "data.json").write_text("y" * 500)
    (base / "docs" / "README.md").write_text("z" * 100)

    print("  大于 500 字节的文件:")
    for f in sorted(base.rglob("*")):
        if f.is_file() and f.stat().st_size > 500:
            print(f"    {f.relative_to(base)} ({f.stat().st_size} bytes)")
    print()


def demo_filter_by_time():
    print("=== 6. 按修改时间过滤 ===\\n")
    base = create_test_tree()
    # 修改一个文件时间
    import time
    old_file = base / "docs" / "CHANGELOG.md"
    old_time = time.time() - 30*24*3600  # 30 天前
    os.utime(old_file, (old_time, old_time))

    # 找最近 7 天修改的文件
    seven_days_ago = time.time() - 7*24*3600
    print("  最近 7 天修改的:")
    for f in base.rglob("*"):
        if f.is_file() and f.stat().st_mtime > seven_days_ago:
            print(f"    {f.relative_to(base)}")
    print("  超过 7 天的:")
    for f in base.rglob("*"):
        if f.is_file() and f.stat().st_mtime <= seven_days_ago:
            print(f"    {f.relative_to(base)}")


def demo_count_by_type():
    print("\\n=== 7. 统计文件类型 ===\\n")
    base = create_test_tree()
    from collections import Counter
    counter = Counter()
    total_size = 0
    for f in base.rglob("*"):
        if f.is_file():
            counter[f.suffix] += 1
            total_size += f.stat().st_size
    print(f"  总文件: {sum(counter.values())} 个, {total_size} 字节")
    print(f"  按后缀分布:")
    for ext, n in counter.most_common():
        print(f"    {ext or '(无后缀)'}: {n} 个")


# ===== 主程序 =====
if __name__ == "__main__":
    print("=" * 50)
    print("Python 文件管理教程 — 第十一章 demo")
    print("=" * 50 + "\\n")

    demo_iterdir()
    demo_glob()
    demo_rglob()
    demo_os_walk()
    demo_filter_by_size()
    demo_filter_by_time()
    demo_count_by_type()

    print("\\n" + "=" * 50)
    print("总结：")
    print("• iterdir: 列单层（最快）")
    print("• glob: 单层 + 通配符")
    print("• rglob: 递归 + 通配符（慢，大目录慎用）")
    print("• os.walk: 自定义遍历逻辑")
    print("• 按大小/时间过滤：f.stat().st_size / st_mtime")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第十二章：移动/重命名/复制
  // =========================================================
  {
    id: "pf-12",
    group: "目录操作",
    icon: "📦",
    title: "移动/重命名/复制（shutil）",
    content: `## 一、shutil 模块

\`shutil\`（shell utilities）是 Python 标准库的高层文件操作工具。

## 二、复制文件

\`\`\`python
import shutil
from pathlib import Path

# 复制文件（保留元数据：时间、权限）
shutil.copy2("src.txt", "dst.txt")

# 复制文件（不保留元数据）
shutil.copy("src.txt", "dst.txt")

# 复制为文件对象
with open("src.txt", "rb") as fin, \\
     open("dst.txt", "wb") as fout:
    shutil.copyfileobj(fin, fout)
\`\`\`

**copy vs copy2**：
- \`copy\`：复制 + 权限
- \`copy2\`：复制 + 权限 + 时间戳

## 三、复制目录

\`\`\`python
import shutil

# 递归复制整个目录
shutil.copytree("src_dir", "dst_dir")
shutil.copytree("src_dir", "dst_dir", dirs_exist_ok=True)  # 目标存在也复制
\`\`\`

## 四、移动/重命名

\`\`\`python
import shutil

# 移动（rename）
shutil.move("old.txt", "new.txt")
shutil.move("old.txt", "subdir/new.txt")  # 移到子目录
shutil.move("old_dir", "new_location")    # 移整个目录
\`\`\`

等价于 pathlib 的 \`rename()\`：

\`\`\`python
from pathlib import Path
Path("old.txt").rename("new.txt")
\`\`\`

## 五、删除

\`\`\`python
from pathlib import Path
import shutil

# 删文件
Path("a.txt").unlink()              # 文件不存在会报错
Path("a.txt").unlink(missing_ok=True)  # 不存在不报错

# 删非空目录
shutil.rmtree("non_empty_dir")
\`\`\`

## 六、文件元数据

\`\`\`python
import os
from pathlib import Path

p = Path("a.txt")
stat = p.stat()

print(stat.st_size)   # 大小（字节）
print(stat.st_mtime)  # 修改时间（时间戳）
print(stat.st_atime)  # 访问时间
print(stat.st_ctime)  # 创建时间（Windows）或元数据变更（Unix）
print(stat.st_mode)   # 权限
\`\`\`

## 七、实用操作清单

| 需求 | 做法 |
|------|------|
| 复制文件 | \`shutil.copy2\` |
| 复制目录 | \`shutil.copytree\` |
| 移动/重命名 | \`shutil.move\` / \`Path.rename\` |
| 删文件 | \`Path.unlink\` |
| 删目录 | \`shutil.rmtree\` |
| 修改时间 | \`os.utime\` |
| 修改权限 | \`os.chmod\` |

## 八、本章 demo
下面 demo 展示实际的文件整理工作流。
`,
    code: `"""
第十二章 demo：移动/重命名/复制
演示：
  1. 复制文件（copy / copy2 / copyfileobj）
  2. 复制目录
  3. 移动/重命名
  4. 删除文件/目录
  5. 文件元数据
"""

import os
import shutil
import time
import tempfile
from pathlib import Path


def demo_copy_file():
    print("=== 1. 复制文件 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf12_c_"))
    src = base / "src.txt"
    src.write_text("Hello, world!\\n", encoding="utf-8")

    # copy：不保留时间
    dst1 = base / "copy1.txt"
    shutil.copy(src, dst1)
    print(f"  copy:      {dst1.name} (修改时间: {time.ctime(dst1.stat().st_mtime)[:19]})")

    # copy2：保留时间
    dst2 = base / "copy2.txt"
    shutil.copy2(src, dst2)
    print(f"  copy2:     {dst2.name} (修改时间: {time.ctime(dst2.stat().st_mtime)[:19]})")

    # copyfileobj：自定义流
    dst3 = base / "copy3.txt"
    with src.open("rb") as fin, dst3.open("wb") as fout:
        shutil.copyfileobj(fin, fout)
    print(f"  copyfileobj: 内容一致 = {src.read_text() == dst3.read_text()}\\n")


def demo_copy_tree():
    print("=== 2. 复制目录 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf12_t_"))
    src = base / "src_dir"
    src.mkdir()
    (src / "a.txt").write_text("A")
    (src / "b.txt").write_text("B")
    (src / "sub").mkdir()
    (src / "sub" / "c.txt").write_text("C")

    # 复制整个目录
    dst = base / "dst_dir"
    shutil.copytree(src, dst)
    print(f"  源目录文件: {sorted(p.name for p in src.rglob('*') if p.is_file())}")
    print(f"  目标目录文件: {sorted(p.name for p in dst.rglob('*') if p.is_file())}")

    # 目标已存在：默认报错
    try:
        shutil.copytree(src, dst)
    except FileExistsError as e:
        print(f"  目标存在: {e!r}")

    # dirs_exist_ok=True 允许覆盖
    shutil.copytree(src, dst, dirs_exist_ok=True)
    print(f"  dirs_exist_ok=True: OK\\n")


def demo_move_rename():
    print("=== 3. 移动/重命名 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf12_m_"))

    # 重命名
    p = base / "old.txt"
    p.write_text("data")
    p.rename(base / "new.txt")
    print(f"  重命名: old.txt → new.txt ({(base/'new.txt').exists()})")

    # 移到子目录
    (base / "subdir").mkdir()
    (base / "loose.txt").write_text("loose")
    shutil.move(str(base / "loose.txt"), str(base / "subdir" / "moved.txt"))
    print(f"  移动: loose.txt → subdir/moved.txt")

    # 跨目录移动整个目录
    src_dir = base / "src_dir"
    src_dir.mkdir()
    (src_dir / "f.txt").write_text("F")
    shutil.move(str(src_dir), str(base / "moved_dir"))
    print(f"  移动目录: src_dir → moved_dir\\n")


def demo_delete():
    print("=== 4. 删除文件/目录 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf12_d_"))

    # unlink
    p1 = base / "a.txt"
    p1.write_text("data")
    p1.unlink()
    print(f"  unlink: a.txt 存在={p1.exists()}")

    # unlink missing_ok
    p1 = base / "b.txt"
    p1.unlink(missing_ok=True)  # 不存在也不报错
    print(f"  unlink(missing_ok=True): OK")

    # rmtree
    d = base / "dir"
    d.mkdir()
    (d / "f.txt").write_text("F")
    shutil.rmtree(d)
    print(f"  rmtree: dir 存在={d.exists()}\\n")


def demo_metadata():
    print("=== 5. 文件元数据 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf12_meta_"))
    p = base / "meta.txt"
    p.write_text("Hello", encoding="utf-8")

    stat = p.stat()
    print(f"  文件: {p.name}")
    print(f"  大小: {stat.st_size} 字节")
    print(f"  修改时间: {time.ctime(stat.st_mtime)}")
    print(f"  权限: {oct(stat.st_mode)}")
    print(f"  绝对路径: {p.absolute()}")
    print(f"  解析后: {p.resolve()}\\n")


def demo_practical_organize():
    print("=== 6. 实战：整理下载目录 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf12_org_"))

    # 模拟下载目录
    downloads = base / "Downloads"
    downloads.mkdir()
    (downloads / "report.pdf").write_text("pdf")
    (downloads / "photo.jpg").write_text("jpg")
    (downloads / "data.csv").write_text("csv")
    (downloads / "app.zip").write_bytes(b"zip")
    (downloads / "notes.txt").write_text("txt")

    # 按扩展名分类
    categories = {
        "Documents": [".pdf", ".doc", ".txt"],
        "Images": [".jpg", ".png", ".gif"],
        "Data": [".csv", ".xlsx", ".json"],
        "Archives": [".zip", ".tar", ".gz"],
    }
    for cat, exts in categories.items():
        (downloads / cat).mkdir(exist_ok=True)

    for f in downloads.iterdir():
        if f.is_file():
            for cat, exts in categories.items():
                if f.suffix.lower() in exts:
                    shutil.move(str(f), str(downloads / cat / f.name))
                    break

    # 显示整理结果
    print(f"  整理前: {sorted(p.name for p in downloads.iterdir() if p.is_file())}")
    print(f"  整理后:")
    for d in sorted(downloads.iterdir()):
        if d.is_dir():
            files = sorted(p.name for p in d.iterdir() if p.is_file())
            print(f"    📁 {d.name}/: {files}")


# ===== 主程序 =====
if __name__ == "__main__":
    print("=" * 50)
    print("Python 文件管理教程 — 第十二章 demo")
    print("=" * 50 + "\\n")

    demo_copy_file()
    demo_copy_tree()
    demo_move_rename()
    demo_delete()
    demo_metadata()
    demo_practical_organize()

    print("\\n" + "=" * 50)
    print("总结：")
    print("• shutil.copy2: 复制文件保留元数据")
    print("• shutil.copytree: 递归复制目录")
    print("• shutil.move: 移动/重命名")
    print("• Path.unlink: 删文件（missing_ok=True）")
    print("• shutil.rmtree: 删非空目录")
    print("• stat(): 查看大小、时间、权限")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第十三章：批量重命名与文件整理
  // =========================================================
  {
    id: "pf-13",
    group: "目录操作",
    icon: "🏷️",
    title: "批量重命名与文件整理",
    content: `## 一、批量重命名的场景

- 下载的文件名乱码（IMG_xxxx.jpg）
- 相机照片按日期排序
- 项目文件统一编号
- 清理特殊字符

## 二、基础：批量加前缀

\`\`\`python
from pathlib import Path

for f in Path("photos").glob("*.jpg"):
    new_name = f"2024_{f.name}"
    f.rename(f.with_name(new_name))
\`\`\`

## 三、批量加序号

\`\`\`python
from pathlib import Path
files = sorted(Path("photos").glob("*.jpg"))
for i, f in enumerate(files, 1):
    new_name = f"photo_{i:03d}.jpg"
    f.rename(f.with_name(new_name))
\`\`\`

## 四、清理特殊字符

\`\`\`python
import re
from pathlib import Path

for f in Path(".").iterdir():
    if f.is_file():
        # 把空格和特殊字符替换成 _
        new_name = re.sub(r'[\\s\\(\\)\\[\\]\\{\\}]', '_', f.name)
        if new_name != f.name:
            f.rename(f.with_name(new_name))
\`\`\`

## 五、按修改时间排序后编号

\`\`\`python
from pathlib import Path
files = sorted(Path("photos").glob("*.jpg"),
               key=lambda p: p.stat().st_mtime)
for i, f in enumerate(files, 1):
    new_name = f"img_{i:04d}.jpg"
    f.rename(f.with_name(new_name))
\`\`\`

## 六、按扩展名分类到子目录

\`\`\`python
import shutil
from pathlib import Path

# 整理下载目录
for f in Path("Downloads").iterdir():
    if f.is_file():
        ext = f.suffix.lower()
        target_dir = Path("Downloads") / ext.strip(".")
        target_dir.mkdir(exist_ok=True)
        shutil.move(str(f), str(target_dir / f.name))
\`\`\`

## 七、实战：处理相机照片

手机/相机照片通常叫 \`IMG_20240301_123456.jpg\`，按日期归档：

\`\`\`python
import re
from pathlib import Path
from collections import defaultdict

# 正则提取日期
date_pattern = re.compile(r"(\\d{4})(\\d{2})(\\d{2})")

groups = defaultdict(list)
for f in Path("photos").glob("IMG_*.jpg"):
    m = date_pattern.search(f.name)
    if m:
        date_str = f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
        groups[date_str].append(f)

# 按日期建子目录
for date, files in groups.items():
    target_dir = Path("photos") / date
    target_dir.mkdir(exist_ok=True)
    for f in files:
        shutil.move(str(f), str(target_dir / f.name))
\`\`\`

## 八、安全第一：先备份再操作

\`\`\`python
import shutil
from pathlib import Path

def safe_batch_rename(path, transform):
    """先备份到 .bak 再批量重命名"""
    backup = path.with_suffix(path.suffix + ".bak")
    if not backup.exists():
        shutil.copy2(path, backup)
    path.rename(transform(path))

# 出现问题可以从 .bak 恢复
\`\`\`

## 九、本章 demo
下面 demo 展示完整的批量整理工作流。
`,
    code: `"""
第十三章 demo：批量重命名与文件整理
演示：
  1. 批量加前缀/序号
  2. 清理特殊字符
  3. 按扩展名分类
  4. 按日期归档照片
  5. 模拟完整工作流
"""

import os
import re
import shutil
import tempfile
from pathlib import Path
from collections import defaultdict


def demo_add_prefix():
    print("=== 1. 批量加前缀 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf13_p_"))
    for name in ["a.txt", "b.txt", "c.txt"]:
        (base / name).write_text("data")

    for f in base.iterdir():
        f.rename(f.with_name(f"backup_{f.name}"))
    print(f"  重命名后: {sorted(p.name for p in base.iterdir())}\\n")


def demo_add_sequence():
    print("=== 2. 批量加序号 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf13_s_"))
    for name in ["report.txt", "summary.txt", "data.txt"]:
        (base / name).write_text("data")

    files = sorted(base.iterdir())
    for i, f in enumerate(files, 1):
        f.rename(f.with_name(f"{i:02d}_{f.name}"))
    print(f"  排序加序号: {sorted(p.name for p in base.iterdir())}\\n")


def demo_clean_special_chars():
    print("=== 3. 清理特殊字符 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf13_c_"))
    dirty_names = [
        "file (1).txt", "file[2].txt", "file{3}.txt",
        "file name.txt", "file@home.txt"
    ]
    for name in dirty_names:
        (base / name).write_text("data")

    # 用正则替换特殊字符
    pattern = re.compile(r'[\\s\\(\\)\\[\\]\\{\\}\\@]')
    for f in base.iterdir():
        if f.is_file():
            new_name = pattern.sub('_', f.name)
            # 合并连续的下划线
            new_name = re.sub(r'_+', '_', new_name)
            new_name = new_name.strip('_')
            if new_name != f.name:
                f.rename(f.with_name(new_name))
    print(f"  清理后: {sorted(p.name for p in base.iterdir())}\\n")


def demo_organize_by_ext():
    print("=== 4. 按扩展名分类 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf13_e_"))
    downloads = base / "Downloads"
    downloads.mkdir()
    (downloads / "doc.pdf").write_text("p")
    (downloads / "pic.jpg").write_text("j")
    (downloads / "data.csv").write_text("c")
    (downloads / "app.zip").write_text("z")
    (downloads / "note.txt").write_text("t")

    for f in downloads.iterdir():
        if f.is_file():
            ext = f.suffix.lstrip(".").upper() or "OTHER"
            target = downloads / ext
            target.mkdir(exist_ok=True)
            shutil.move(str(f), str(target / f.name))

    print(f"  整理后结构:")
    for d in sorted(downloads.iterdir()):
        if d.is_dir():
            files = sorted(p.name for p in d.iterdir())
            print(f"    📁 {d.name}/: {files}")
    print()


def demo_organize_by_date():
    print("=== 5. 按日期归档照片 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf13_d_"))
    photos = base / "photos"
    photos.mkdir()

    # 模拟相机照片命名
    fake_photos = [
        "IMG_20240301_120000.jpg",
        "IMG_20240301_150000.jpg",
        "IMG_20240302_090000.jpg",
        "IMG_20240315_180000.jpg",
        "IMG_20240315_220000.jpg",
    ]
    for name in fake_photos:
        (photos / name).write_text("photo")

    date_pattern = re.compile(r"(\\d{4})(\\d{2})(\\d{2})")
    groups = defaultdict(list)
    for f in photos.iterdir():
        m = date_pattern.search(f.name)
        if m:
            date_str = f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
            groups[date_str].append(f)

    for date, files in groups.items():
        target_dir = photos / date
        target_dir.mkdir(exist_ok=True)
        for f in files:
            shutil.move(str(f), str(target_dir / f.name))

    print(f"  按日期归档后:")
    for d in sorted(photos.iterdir()):
        if d.is_dir():
            files = sorted(p.name for p in d.iterdir())
            print(f"    📁 {d.name}/: {files}")


def demo_complete_workflow():
    print("\\n=== 6. 完整工作流：清理 + 编号 + 分类 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf13_w_"))
    messy = base / "messy"
    messy.mkdir()

    # 模拟一个杂乱的目录
    for name in [
        "IMG (1).jpg", "IMG (2).jpg", "report.pdf",
        "data.csv", "data.json", "IMG_20240315.jpg"
    ]:
        (messy / name).write_text("data")

    print(f"  原始:")
    for f in sorted(messy.iterdir()):
        print(f"    {f.name}")

    # Step 1: 清理特殊字符
    pattern = re.compile(r'[\\s\\(\\)\\[\\]\\{\\}]')
    for f in messy.iterdir():
        if f.is_file():
            new_name = pattern.sub('_', f.name)
            new_name = re.sub(r'_+', '_', new_name).strip('_')
            if new_name != f.name:
                f.rename(f.with_name(new_name))

    # Step 2: 按扩展名分类
    for f in messy.iterdir():
        if f.is_file():
            ext = f.suffix.lstrip(".").upper() or "OTHER"
            target = messy / ext
            target.mkdir(exist_ok=True)
            shutil.move(str(f), str(target / f.name))

    print(f"\\n  整理后:")
    for d in sorted(messy.iterdir()):
        if d.is_dir():
            files = sorted(p.name for p in d.iterdir())
            print(f"    📁 {d.name}/: {files}")


# ===== 主程序 =====
if __name__ == "__main__":
    print("=" * 50)
    print("Python 文件管理教程 — 第十三章 demo")
    print("=" * 50 + "\\n")

    demo_add_prefix()
    demo_add_sequence()
    demo_clean_special_chars()
    demo_organize_by_ext()
    demo_organize_by_date()
    demo_complete_workflow()

    print("\\n" + "=" * 50)
    print("总结：")
    print("• f.with_name() 生成新路径不实际改文件")
    print("• f.rename() 才真正改名")
    print("• 用正则清理特殊字符")
    print("• 批量整理前先备份")
    print("• 复杂工作流分步骤走")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第十四章：临时文件与目录
  // =========================================================
  {
    id: "pf-14",
    group: "目录操作",
    icon: "⏳",
    title: "临时文件与目录（tempfile）",
    content: `## 一、为什么需要临时文件？

- 测试时需要临时文件
- 大文件处理要中间存储
- 缓存数据
- 避免污染用户目录

## 二、tempfile 模块

Python 标准库 \`tempfile\` 提供安全的临时文件管理。

## 三、获取系统临时目录

\`\`\`python
import tempfile
print(tempfile.gettempdir())
# macOS: /var/folders/xx/xxxxxx/T/
# Linux: /tmp
# Windows: C:\\Users\\xxx\\AppData\\Local\\Temp\\
\`\`\`

## 四、创建临时文件

\`\`\`python
import tempfile

# 自动创建 + 关闭
with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
    f.write("临时数据\\n")
    print(f.name)

# delete=False：with 块结束不删除
# delete=True（默认）：with 块结束自动删除
\`\`\`

## 五、临时文件名

\`\`\`python
import tempfile
import os

# 拿到名字，但不创建
name = tempfile.mktemp(suffix=".txt")
print(name)  # /tmp/tmpXXXXXX.txt

# 创建临时文件
fd, name = tempfile.mkstemp(suffix=".log")
os.close(fd)
print(name)
\`\`\`

## 六、创建临时目录

\`\`\`python
import tempfile
from pathlib import Path

# 创建
tmpdir = tempfile.mkdtemp(prefix="myapp_")
print(tmpdir)  # /tmp/myapp_xxxxx/

# 清理
import shutil
shutil.rmtree(tmpdir)
\`\`\`

**特点**：
- 名字保证不冲突
- 路径保证可写
- 跨平台

## 七、TemporaryDirectory 上下文管理器

\`\`\`python
import tempfile
from pathlib import Path

with tempfile.TemporaryDirectory() as tmpdir:
    tmp = Path(tmpdir)
    (tmp / "a.txt").write_text("data")
    print(f"使用临时目录: {tmp}")
# with 块结束自动删除整个目录
\`\`\`

**最推荐**——自动清理，不用担心泄漏。

## 八、NamedTemporaryFile 的坑

\`\`\`python
import tempfile
# 默认 delete=True
with tempfile.NamedTemporaryFile() as f:
    f.write(b"data")
# 文件已删除！Windows 上可能还报错（文件被占用）
\`\`\`

**解决方案**：
- 用 \`delete=False\` 自己管理
- 或者只用 \`TemporaryDirectory\`

## 九、实战场景

### 1. 测试需要临时文件
\`\`\`python
import tempfile
import unittest

class TestFile(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
    def tearDown(self):
        import shutil
        shutil.rmtree(self.tmp)
\`\`\`

### 2. 处理大文件不爆内存
\`\`\`python
import tempfile

with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".log") as f:
    f.writelines(f"line {i}\\n" for i in range(1_000_000))
    tmpfile = f.name
\`\`\`

### 3. 跨进程安全
\`\`\`python
import tempfile
# 在 /tmp 下创建文件，多个进程不会冲突
fd, name = tempfile.mkstemp()
\`\`\`

## 十、本章 demo
下面 demo 演示所有 tempfile 用法。
`,
    code: `"""
第十四章 demo：临时文件与目录
演示：
  1. 获取系统临时目录
  2. NamedTemporaryFile
  3. mkstemp
  4. mkdtemp
  5. TemporaryDirectory 上下文管理器
  6. 实战：处理大文件
"""

import os
import shutil
import tempfile
from pathlib import Path


def demo_gettempdir():
    print("=== 1. 系统临时目录 ===\\n")
    print(f"  tempfile.gettempdir(): {tempfile.gettempdir()}")
    print(f"  跨平台吗? {os.path.exists(tempfile.gettempdir())}\\n")


def demo_named_temp_file():
    print("=== 2. NamedTemporaryFile ===\\n")

    # 写入并自动删除
    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt",
                                       delete=True, encoding="utf-8") as f:
        f.write("会自动删除\\n")
        name = f.name
        print(f"  临时文件: {name}")
        print(f"  with 块内存在: {os.path.exists(name)}")
    print(f"  with 块外存在: {os.path.exists(name)}")
    print(f"  ✅ delete=True 自动删除\\n")

    # delete=False：手动管理
    with tempfile.NamedTemporaryFile(mode="w", suffix=".log",
                                       delete=False, encoding="utf-8") as f:
        f.write("保留文件\\n")
        name = f.name
    print(f"  delete=False 保留: {os.path.exists(name)}")
    os.unlink(name)  # 手动删除
    print(f"  手动删除后: {os.path.exists(name)}\\n")


def demo_mkstemp():
    print("=== 3. mkstemp ===\\n")
    fd, name = tempfile.mkstemp(suffix=".dat", prefix="myapp_")
    print(f"  文件描述符: {fd}")
    print(f"  文件名: {name}")

    # 写入
    os.write(fd, b"low-level data")
    os.close(fd)
    print(f"  写入后大小: {os.path.getsize(name)}")

    # 清理
    os.unlink(name)
    print(f"  清理后存在: {os.path.exists(name)}\\n")


def demo_mkdtemp():
    print("=== 4. mkdtemp ===\\n")
    tmpdir = tempfile.mkdtemp(prefix="project_", suffix="_test")
    print(f"  临时目录: {tmpdir}")

    # 在里面建文件
    Path(tmpdir, "a.txt").write_text("A")
    Path(tmpdir, "b.txt").write_text("B")
    print(f"  目录内容: {sorted(p.name for p in Path(tmpdir).iterdir())}")

    # 手动清理
    shutil.rmtree(tmpdir)
    print(f"  清理后: {os.path.exists(tmpdir)}\\n")


def demo_temporary_directory_ctx():
    print("=== 5. TemporaryDirectory 上下文（最推荐） ===\\n")
    with tempfile.TemporaryDirectory(prefix="ctx_") as tmpdir:
        tmp = Path(tmpdir)
        # 创建复杂结构
        (tmp / "src").mkdir()
        (tmp / "src" / "main.py").write_text("print('hi')")
        (tmp / "data").mkdir()
        (tmp / "data" / "input.csv").write_text("a,b\\n1,2\\n")

        print(f"  使用中: {tmp}")
        print(f"  文件: {sorted(p.name for p in tmp.rglob('*') if p.is_file())}")
    # with 退出后自动删除
    print(f"  with 外存在: {os.path.exists(tmpdir)}")
    print(f"  ✅ 自动清理\\n")


def demo_practical_big_file():
    print("=== 6. 实战：用临时文件处理大文件 ===\\n")
    with tempfile.TemporaryDirectory() as tmpdir:
        tmpfile = Path(tmpdir) / "big.txt"

        # 模拟生成 1 万行数据到临时文件
        with tmpfile.open("w", encoding="utf-8") as f:
            for i in range(10_000):
                f.write(f"record {i:05d}\\n")
        print(f"  临时文件: {tmpfile.name}")
        print(f"  大小: {tmpfile.stat().st_size / 1024:.1f} KB")

        # 处理
        line_count = 0
        with tmpfile.open("r", encoding="utf-8") as f:
            for line in f:
                if "0050" in line:
                    line_count += 1
        print(f"  找到 {line_count} 行包含 '0050'")

    # 临时目录已自动删除
    print(f"  清理后 tmpdir 存在: {os.path.exists(tmpdir)}\\n")


def demo_safety_in_tests():
    print("=== 7. 单元测试中的临时文件 ===\\n")

    class FakeProcessor:
        def process(self, path):
            content = path.read_text(encoding="utf-8")
            return content.upper()

    # 模拟测试
    with tempfile.TemporaryDirectory() as tmpdir:
        # 准备测试数据
        test_file = Path(tmpdir) / "input.txt"
        test_file.write_text("hello", encoding="utf-8")

        # 运行
        proc = FakeProcessor()
        result = proc.process(test_file)
        print(f"  处理结果: {result!r}")
        assert result == "HELLO", "测试通过"
        print(f"  ✅ 测试通过")
    # 测试数据自动清理


# ===== 主程序 =====
if __name__ == "__main__":
    print("=" * 50)
    print("Python 文件管理教程 — 第十四章 demo")
    print("=" * 50 + "\\n")

    demo_gettempdir()
    demo_named_temp_file()
    demo_mkstemp()
    demo_mkdtemp()
    demo_temporary_directory_ctx()
    demo_practical_big_file()
    demo_safety_in_tests()

    print("\\n" + "=" * 50)
    print("总结：")
    print("• TemporaryDirectory 是最推荐的临时目录方式")
    print("• NamedTemporaryFile 注意 delete 参数")
    print("• mkdtemp 返回路径，mkstemp 返回 (fd, 路径)")
    print("• 临时文件名保证不冲突")
    print("• 临时目录在 with 块结束时自动清理")
    print("=" * 50)
`,
  },
];
