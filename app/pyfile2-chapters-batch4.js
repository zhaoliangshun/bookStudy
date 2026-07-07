// =============================================================
// Python 文件管理教程（pyfile2）—— 第四批章节
// -------------------------------------------------------------
// 高级文件操作（15-19章）
//   第 15 章：文件锁（跨进程安全）
//   第 16 章：符号链接与硬链接
//   第 17 章：内存映射文件（mmap）
//   第 18 章：JSON / YAML / TOML 配置文件
//   第 19 章：CSV / Excel 文件读写
// =============================================================

export const chapters = [
  // =========================================================
  // 第十五章：文件锁（跨进程安全）
  // =========================================================
  {
    id: "pf-15",
    group: "高级文件操作",
    icon: "🔒",
    title: "文件锁（跨进程安全）",
    content: `## 一、什么是文件锁？

当多个进程同时操作同一个文件时，需要"锁"来保证：
- 同时只能有一个进程写
- 写时不被打断

## 二、为什么需要文件锁？

场景：
- 多个进程写同一个日志文件
- 多个进程读同一个配置文件
- 防止数据竞争

**没有文件锁**：
\`\`\`
进程A: 写 "用户登录"（写到一半被打断）
进程B: 写 "用户退出"
结果: 文件里可能是 "用户登用户退出录" 乱码
\`\`\`

## 三、Unix 系统：fcntl 文件锁

\`\`\`python
import fcntl
import time

# 排他锁（写锁）
with open("log.txt", "a") as f:
    fcntl.flock(f, fcntl.LOCK_EX)  # 阻塞等待获得锁
    f.write("日志内容\\n")
    f.flush()  # 立即写入磁盘
    # with 块结束自动解锁
\`\`\`

**两种锁**：
- \`fcntl.LOCK_SH\`：共享锁（读锁），多个进程可同时持有
- \`fcntl.LOCK_EX\`：排他锁（写锁），只有一个进程能持有

**参数**：
- \`fcntl.LOCK_NB\`：非阻塞（拿不到锁直接报错）
- \`fcntl.LOCK_UN\`：解锁

## 四、跨平台：msvcrt（Windows）

\`\`\`python
import msvcrt
import time

with open("log.txt", "a") as f:
    msvcrt.locking(f.fileno(), msvcrt.LK_LOCK, 1)  # 锁 1 字节
    f.write("日志\\n")
    # with 块结束自动解锁
\`\`\`

## 五、跨平台封装

\`\`\`python
import os
import time
import portalocker  # pip install portalocker

with open("log.txt", "a") as f:
    portalocker.lock(f, portalocker.EXCLUSIVE)  # 跨平台锁
    f.write("日志\\n")
    # with 块结束自动解锁
\`\`\`

## 六、文件锁的 4 个陷阱

1. **跨机器无效**：文件锁只在同一台机器生效
2. **不可靠**：\`flock\` 在 NFS 上不工作
3. **死锁**：进程崩溃前没解锁，要用 \`with\` 或 try-finally
4. **建议**：能用数据库就用数据库，文件锁是最后选择

## 七、实用：进程安全的日志

\`\`\`python
import fcntl
import time
from pathlib import Path

def safe_log(log_path: Path, msg: str):
    """多进程安全的日志写入"""
    with log_path.open("a", encoding="utf-8") as f:
        try:
            fcntl.flock(f, fcntl.LOCK_EX | fcntl.LOCK_NB)
            f.write(f"[{time.strftime('%H:%M:%S')}] {msg}\\n")
            f.flush()
        except (BlockingIOError, OSError):
            # 拿不到锁，等待后重试
            time.sleep(0.1)
            with log_path.open("a", encoding="utf-8") as f2:
                fcntl.flock(f2, fcntl.LOCK_EX)
                f2.write(f"[{time.strftime('%H:%M:%S')}] {msg}\\n")
                f2.flush()
\`\`\`

## 八、读写安全的配置文件

\`\`\`python
import fcntl
import json

def read_config(path):
    with open(path, "r", encoding="utf-8") as f:
        fcntl.flock(f, fcntl.LOCK_SH)  # 共享读锁
        return json.load(f)

def write_config(path, data):
    with open(path, "w", encoding="utf-8") as f:
        fcntl.flock(f, fcntl.LOCK_EX)  # 排他写锁
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.flush()
\`\`\`

## 九、本章 demo
下面 demo 演示进程间文件锁的同步效果。
`,
    code: `"""
第十五章 demo：文件锁
演示：
  1. Unix flock 基本用法
  2. 共享锁 vs 排他锁
  3. 非阻塞锁
  4. 跨平台：portalocker
  5. 模拟多进程竞争
"""

import os
import sys
import time
import tempfile
import threading
from pathlib import Path


def demo_flock_basic():
    print("=== 1. Unix flock 基本用法 ===\\n")
    if sys.platform == "win32":
        print("  ⚠️  Windows 上无 fcntl，跳过\\n")
        return

    import fcntl
    base = Path(tempfile.mkdtemp(prefix="pf15_"))
    p = base / "log.txt"

    # 写锁
    with p.open("a", encoding="utf-8") as f:
        fcntl.flock(f, fcntl.LOCK_EX)
        f.write("临界区写入\\n")
        f.flush()
        print("  持锁中...")
    print("  自动解锁\\n")

    # 读锁（共享）
    with p.open("r", encoding="utf-8") as f:
        fcntl.flock(f, fcntl.LOCK_SH)
        content = f.read()
        print(f"  读锁读出: {content.strip()!r}")
    print("  读锁自动解锁\\n")


def demo_lock_types():
    print("=== 2. 共享锁 vs 排他锁 ===\\n")
    if sys.platform == "win32":
        print("  ⚠️  Windows 上无 fcntl，跳过\\n")
        return

    import fcntl
    base = Path(tempfile.mkdtemp(prefix="pf15_t_"))
    p = base / "shared.txt"
    p.write_text("")

    # 共享锁：多个读锁可以共存
    f1 = p.open("r")
    f2 = p.open("r")
    fcntl.flock(f1, fcntl.LOCK_SH)
    print("  进程1: 获得共享锁")

    try:
        fcntl.flock(f2, fcntl.LOCK_SH | fcntl.LOCK_NB)
        print("  进程2: 也获得共享锁（OK，共享锁可共存）")
    finally:
        f1.close()
        f2.close()
    print()


def demo_nonblocking_lock():
    print("=== 3. 非阻塞锁（LOCK_NB） ===\\n")
    if sys.platform == "win32":
        print("  ⚠️  Windows 上无 fcntl，跳过\\n")
        return

    import fcntl
    base = Path(tempfile.mkdtemp(prefix="pf15_nb_"))
    p = base / "nb.txt"
    p.write_text("")

    f1 = p.open("a")
    fcntl.flock(f1, fcntl.LOCK_EX)
    print("  f1: 持锁")

    f2 = p.open("a")
    try:
        fcntl.flock(f2, fcntl.LOCK_EX | fcntl.LOCK_NB)
        print("  f2: 也获得锁（不应该发生）")
    except BlockingIOError:
        print("  f2: 拿不到锁（LOCK_NB 立即报错）✅")

    f1.close()
    f2.close()
    print()


def demo_threadsafe_log():
    print("=== 4. 线程安全的日志（演示互斥） ===\\n")
    import threading
    base = Path(tempfile.mkdtemp(prefix="pf15_log_"))
    p = base / "app.log"
    p.write_text("")

    lock = threading.Lock()
    results = []

    def worker(i):
        with lock:  # 模拟锁
            with p.open("a", encoding="utf-8") as f:
                f.write(f"worker {i} start\\n")
                time.sleep(0.01)
                f.write(f"worker {i} end\\n")
        results.append(i)

    threads = [threading.Thread(target=worker, args=(i,)) for i in range(5)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    lines = p.read_text(encoding="utf-8").strip().split("\\n")
    print(f"  写入 {len(results)} 个 worker 的日志")
    print(f"  日志行数: {len(lines)}（每 worker 2 行 = 10 行）")
    # 验证没有交错
    ok = True
    for i in range(5):
        if f"worker {i} start" in lines and f"worker {i} end" in lines:
            start_idx = lines.index(f"worker {i} start")
            end_idx = lines.index(f"worker {i} end")
            if end_idx != start_idx + 1:
                ok = False
    print(f"  无交错: {ok}\\n")


def demo_portable_pattern():
    print("=== 5. 跨平台安全的写法（退化） ===\\n")

    class FileLock:
        def __init__(self, path):
            self.path = Path(path)
            self.fd = None

        def __enter__(self):
            self.fd = self.path.open("a")
            if sys.platform != "win32":
                import fcntl
                fcntl.flock(self.fd, fcntl.LOCK_EX)
            else:
                import msvcrt
                try:
                    msvcrt.locking(self.fd.fileno(), msvcrt.LK_LOCK, 1)
                except OSError:
                    pass
            return self

        def __exit__(self, *args):
            if self.fd:
                self.fd.close()

    base = Path(tempfile.mkdtemp(prefix="pf15_pl_"))
    lock_path = base / "lock.dat"
    data_path = base / "data.txt"

    with FileLock(lock_path):
        with data_path.open("a", encoding="utf-8") as f:
            f.write("锁定区域内写入\\n")
        print(f"  跨平台锁内写入: {data_path.read_text().strip()!r}\\n")


# ===== 主程序 =====
if __name__ == "__main__":
    print("=" * 50)
    print("Python 文件管理教程 — 第十五章 demo")
    print("=" * 50 + "\\n")

    demo_flock_basic()
    demo_lock_types()
    demo_nonblocking_lock()
    demo_threadsafe_log()
    demo_portable_pattern()

    print("\\n" + "=" * 50)
    print("总结：")
    print("• 多进程/多线程写文件需要锁")
    print("• Unix 用 fcntl.flock")
    print("• Windows 用 msvcrt.locking")
    print("• LOCK_EX 排他写，LOCK_SH 共享读")
    print("• LOCK_NB 非阻塞，拿不到锁立即报错")
    print("• 用 with 保证解锁，崩溃也要解锁")
    print("• 跨机器 / 跨 NFS 文件锁不可靠")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第十六章：符号链接与硬链接
  // =========================================================
  {
    id: "pf-16",
    group: "高级文件操作",
    icon: "🔗",
    title: "符号链接与硬链接",
    content: `## 一、两种链接

| 维度 | 硬链接（hard link） | 符号链接（symbolic link / symlink） |
|------|-------------------|-----------------------------------|
| 本质 | 同一文件多个名字 | 指向另一文件的指针（快捷方式） |
| 跨文件系统 | ❌ | ✅ |
| 指向目录 | ❌ | ✅ |
| 原始删除后 | 仍可访问 | 失效（悬空链接） |
| 占用空间 | 等于原文件 | 极小（几字节） |
| Windows 权限 | 需管理员 | 需开发者模式 |

## 二、硬链接

\`\`\`python
import os
from pathlib import Path

# 创建硬链接
os.link("original.txt", "hardlink.txt")

# 或用 pathlib
Path("hardlink.txt").hardlink_to("original.txt")
\`\`\`

查看：
\`\`\`bash
ls -li original.txt hardlink.txt
# 两个 inode 相同
\`\`\`

## 三、符号链接（软链接）

\`\`\`python
import os
from pathlib import Path

# 创建软链接
os.symlink("original.txt", "symlink.txt")

# 或用 pathlib
Path("symlink.txt").symlink_to("original.txt")
\`\`\`

## 四、检测链接

\`\`\`python
from pathlib import Path

p = Path("symlink.txt")
p.is_symlink()  # 是符号链接吗
p.is_file()     # 是文件吗（会跟随链接）

# 解析为真实路径
p.resolve()     # 跟随所有软链
p.readlink()    # 读取链接目标
\`\`\`

## 五、删除链接

\`\`\`python
import os
from pathlib import Path

# 删除软链接本身（不影响原文件）
os.remove("symlink.txt")
Path("symlink.txt").unlink()

# 删除硬链接（仅删一个名字）
os.remove("hardlink.txt")
# 文件还在（其他硬链接还指向它）
\`\`\`

## 六、符号链接的典型用途

1. **版本管理**：
   \`\`\`
   current → python3.11
   python → current
   \`\`\`

2. **多位置访问同一文件**：
   \`\`\`
   /home/alice/docs/report.txt
   /var/www/docs/report.txt  → 软链到上面
   \`\`\`

3. **软件多版本共存**：
   \`\`\`
   /usr/bin/python3 → /usr/bin/python3.11
   \`\`\`

4. **节省空间**：
   \`\`\`
   大文件存一次，多处用链接引用
   \`\`\`

## 七、链接的 5 个常见坑

1. **悬空链接**：原文件删了，软链接失效
2. **循环链接**：A → B → A（\`resolve()\` 会爆）
3. **路径相对性**：软链是相对当前目录的
4. **硬链接不同步**：\`stat\` 看到的 mtime 是原文件的
5. **git 不跟踪符号链接**（默认）

## 八、检测循环引用

\`\`\`python
from pathlib import Path

# resolve(strict=False) 不抛异常
p = Path("a_link")
try:
    real = p.resolve()
    print(real)
except RuntimeError as e:
    print(f"循环: {e}")
\`\`\`

## 九、本章 demo
下面 demo 演示两种链接的差异。
`,
    code: `"""
第十六章 demo：符号链接 vs 硬链接
演示：
  1. 创建硬链接和软链接
  2. inode 对比
  3. 软链接跟随 resolve()
  4. 软链接可指向目录
  5. 跨文件系统的软链接
  6. 循环引用检测
"""

import os
import sys
import tempfile
from pathlib import Path


def demo_hard_link():
    print("=== 1. 硬链接 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf16_h_"))
    original = base / "original.txt"
    original.write_text("硬链接测试", encoding="utf-8")

    hardlink = base / "hardlink.txt"
    os.link(original, hardlink)

    print(f"  原文件大小: {original.stat().st_size}")
    print(f"  硬链接大小: {hardlink.stat().st_size}")
    print(f"  内容一致: {original.read_text() == hardlink.read_text()}")
    print(f"  硬链接数: {original.stat().st_nlink}\\n")

    # 删原文件，硬链接仍可访问
    original.unlink()
    print(f"  删原文件后, 硬链接仍可读: {hardlink.read_text()!r}")
    hardlink.unlink()
    print()


def demo_symlink():
    print("=== 2. 符号链接（软链接） ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf16_s_"))
    original = base / "original.txt"
    original.write_text("软链接测试", encoding="utf-8")

    symlink = base / "symlink.txt"
    os.symlink(original, symlink)

    print(f"  软链接存在: {symlink.exists()}")
    print(f"  是软链接: {symlink.is_symlink()}")
    print(f"  软链接内容: {symlink.read_text(encoding='utf-8')!r}")
    print(f"  链接目标: {os.readlink(symlink)}")
    print(f"  resolve: {symlink.resolve()}")

    # 删原文件，软链接失效
    original.unlink()
    print(f"  删原文件后, 软链接存在: {symlink.exists()}")
    symlink.unlink(missing_ok=True)
    print()


def demo_symlink_to_dir():
    print("=== 3. 软链接指向目录 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf16_d_"))
    real_dir = base / "real_dir"
    real_dir.mkdir()
    (real_dir / "a.txt").write_text("A")
    (real_dir / "b.txt").write_text("B")

    link_dir = base / "link_to_dir"
    os.symlink(real_dir, link_dir, target_is_directory=True)

    print(f"  通过软链接读文件: {(link_dir / 'a.txt').read_text()!r}")
    print(f"  软链接是目录: {link_dir.is_dir()}")
    print(f"  resolve: {link_dir.resolve()}")
    print(f"  硬链接不支持目录\\n")


def demo_cross_filesystem():
    print("=== 4. 跨文件系统的软链接 ===\\n")
    if sys.platform == "win32":
        print("  Windows 上 tmp 都在同盘，跳过演示\\n")
        return

    base1 = Path(tempfile.mkdtemp(prefix="pf16_x1_"))
    base2 = Path(tempfile.mkdtemp(prefix="pf16_x2_"))

    # 在 base1 建文件
    original = base1 / "data.txt"
    original.write_text("跨设备")

    # 在 base2 建软链接
    link = base2 / "link.txt"
    try:
        os.symlink(original, link)
        print(f"  ✅ 跨设备软链接创建成功")
        print(f"  读: {link.read_text()!r}")
    except OSError as e:
        print(f"  软链接失败: {e}")

    # 硬链接会失败
    try:
        os.link(original, base2 / "hard.txt")
        print(f"  ⚠️  跨设备硬链接也成功了（不应该）")
    except OSError as e:
        print(f"  ✅ 跨设备硬链接失败: {type(e).__name__}\\n")


def demo_resolve_follow():
    print("=== 5. resolve() 跟随软链接 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf16_r_"))
    real = base / "real.txt"
    real.write_text("REAL")

    link1 = base / "link1.txt"
    link1.symlink_to(real)

    link2 = base / "link2.txt"
    link2.symlink_to(link1)

    print(f"  link1 → real: {os.readlink(link1)}")
    print(f"  link2 → link1: {os.readlink(link2)}")
    print(f"  link1.resolve(): {link1.resolve()}")
    print(f"  link2.resolve(): {link2.resolve()}\\n")


def demo_circular_link():
    print("=== 6. 循环引用检测 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf16_c_"))
    link_a = base / "a"
    link_b = base / "b"
    try:
        os.symlink("b", link_a)
        os.symlink("a", link_b)
        # resolve 不会死循环
        print(f"  resolve(strict=False): {link_a.resolve(strict=False)}")
    except Exception as e:
        print(f"  错误: {e}")
    print(f"  提示: 实际应用应避免循环链接\\n")


def demo_practical_use():
    print("=== 7. 实战：多版本管理 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf16_ver_"))

    # 模拟：项目有多个版本，latest 指向当前
    v1 = base / "project_v1"
    v1.mkdir()
    (v1 / "main.py").write_text("# v1")

    v2 = base / "project_v2"
    v2.mkdir()
    (v2 / "main.py").write_text("# v2")

    latest = base / "project_latest"
    latest.symlink_to(v2)

    print(f"  通过 latest 访问:")
    print(f"    {(latest / 'main.py').read_text()!r}")
    print(f"  切换版本: 删除 latest 软链，重建")
    latest.unlink()
    latest.symlink_to(v1)
    print(f"    {(latest / 'main.py').read_text()!r}")


# ===== 主程序 =====
if __name__ == "__main__":
    print("=" * 50)
    print("Python 文件管理教程 — 第十六章 demo")
    print("=" * 50 + "\\n")

    demo_hard_link()
    demo_symlink()
    demo_symlink_to_dir()
    demo_cross_filesystem()
    demo_resolve_follow()
    demo_circular_link()
    demo_practical_use()

    print("\\n" + "=" * 50)
    print("总结：")
    print("• 硬链接: 同一文件多个名字，删一个不影响另一个")
    print("• 软链接: 快捷方式，原文件删了就失效")
    print("• 软链接可跨文件系统，可指向目录")
    print("• 硬链接不能跨文件系统，不能指向目录")
    print("• resolve() 跟随所有软链")
    print("• 实际多用于版本管理 / 多位置访问")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第十七章：内存映射文件（mmap）
  // =========================================================
  {
    id: "pf-17",
    group: "高级文件操作",
    icon: "🧠",
    title: "内存映射文件（mmap）",
    content: `## 一、什么是 mmap？

\`mmap\`（memory-mapped file）把文件映射到内存，**像访问数组一样访问文件**。

## 二、为什么用 mmap？

| 方式 | 读 1GB 文件 | 修改 |
|------|------------|------|
| \`read()\` | 加载 1GB 到内存 | 整个写回 |
| \`mmap\` | 按需加载（虚拟内存） | 自动同步 |

mmap 的优势：
- 大文件不爆内存
- 修改自动同步到磁盘
- 多进程共享数据

## 三、基本用法

\`\`\`python
import mmap
import os

# 创建文件
with open("data.bin", "wb") as f:
    f.write(b"hello world" + b"\\x00" * 1000)

# 映射
with open("data.bin", "r+b") as f:
    with mmap.mmap(f.fileno(), 0) as m:
        # 像访问 bytes 一样
        print(m[0:5])  # b'hello'
        m[0:5] = b"HELLO"
        # 修改自动同步到文件
\`\`\`

## 四、mmap 的参数

\`\`\`python
mmap.mmap(
    fileno,            # 文件描述符
    length,            # 映射长度，0 = 全部
    offset=0,          # 起始偏移
    access=mmap.ACCESS_DEFAULT  # 访问模式
)
\`\`\`

**access 模式**：
- \`ACCESS_READ\`：只读
- \`ACCESS_WRITE\`：只写
- \`ACCESS_COPY\`：写时复制（不污染原文件）
- \`ACCESS_DEFAULT\`：读写

## 五、mmap 支持的操作

\`\`\`python
m = mmap.mmap(...)
m[0:10]             # 切片
m[0]                # 单字节
m.find(b"hello")    # 查找
m.read(10)          # 读
m.write(b"data")    # 写
m.seek(0)           # 移动指针
m.tell()            # 当前指针
m.flush()           # 强制写盘
m.close()           # 关闭映射
\`\`\`

## 六、用 mmap 修改大文件

\`\`\`python
# 1GB 文件，把第 100 字节改成 'X'
import mmap

with open("huge.bin", "r+b") as f:
    with mmap.mmap(f.fileno(), 0) as m:
        m[100] = ord('X')  # 一行搞定，不用读整个文件
\`\`\`

## 七、跨进程共享数据

\`\`\`python
# 进程 A：写
import mmap
with open("shared.dat", "r+b") as f:
    m = mmap.mmap(f.fileno(), 0)
    m[0:10] = b"from A   "
    m.flush()

# 进程 B：读
with open("shared.dat", "r+b") as f:
    m = mmap.mmap(f.fileno(), 0)
    print(m[0:10])  # b'from A   '
\`\`\`

## 八、性能对比

\`\`\`python
# 场景：修改大文件中间几个字节

# ❌ read/write 模式（必须读全文件再写全文件）
with open("big.bin", "rb+") as f:
    data = f.read()  # 1GB 内存
    data[100] = 88
    f.seek(0)
    f.write(data)  # 1GB 写回

# ✅ mmap 模式（按页加载，1 行搞定）
import mmap
with open("big.bin", "r+b") as f:
    with mmap.mmap(f.fileno(), 0) as m:
        m[100] = 88
\`\`\`

## 九、mmap 的限制

1. **Unix 完整支持，Windows 部分支持**
2. **文件大小固定**（不能 resize 通过 mmap）
3. **不适合频繁小写入**（page fault 开销）

## 十、本章 demo
下面 demo 对比 mmap 和传统方式。
`,
    code: `"""
第十七章 demo：内存映射文件
演示：
  1. 基本 mmap 读写
  2. 切片和索引
  3. find 查找
  4. mmap vs 传统方式
  5. 模拟跨进程共享
"""

import os
import mmap
import tempfile
import time
from pathlib import Path


def demo_basic_mmap():
    print("=== 1. 基本 mmap 读写 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf17_"))
    p = base / "data.bin"
    p.write_bytes(b"Hello, mmap world!" + b"\\x00" * 100)

    with p.open("r+b") as f:
        with mmap.mmap(f.fileno(), 0) as m:
            # 读取
            print(f"  完整内容: {bytes(m[:13])!r}")
            print(f"  第 7-10 字节: {bytes(m[7:11])!r}")

            # 修改
            m[7:11] = b"MMAP"
            print(f"  修改后: {bytes(m[:13])!r}")

            # 自动写回文件
    print(f"  文件中: {p.read_bytes()[:13]!r}\\n")


def demo_find_in_mmap():
    print("=== 2. mmap 查找 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf17_f_"))
    p = base / "log.txt"
    # 模拟日志
    log = """[INFO] 启动
[INFO] 加载配置
[ERROR] 数据库连接失败
[INFO] 重试
[ERROR] 用户不存在
[ERROR] 权限不足
"""
    p.write_bytes(log.encode("utf-8"))

    with p.open("r+b") as f:
        with mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ) as m:
            # 找所有 ERROR 位置
            pos = 0
            errors = []
            while True:
                pos = m.find(b"[ERROR]", pos)
                if pos == -1:
                    break
                # 找到行尾
                end = m.find(b"\\n", pos)
                line = bytes(m[pos:end])
                errors.append(line.decode("utf-8"))
                pos = end
            print(f"  找到 {len(errors)} 个错误:")
            for e in errors:
                print(f"    {e}")
    print()


def demo_modify_large_file():
    print("=== 3. 修改大文件特定位置 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf17_l_"))
    p = base / "big.bin"
    p.write_bytes(b"\\x00" * 1_000_000)  # 1MB

    # mmap 方式：直接改
    start = time.time()
    with p.open("r+b") as f:
        with mmap.mmap(f.fileno(), 0) as m:
            m[100:103] = b"YES"
            m.flush()
    t1 = time.time() - start
    print(f"  mmap 修改: {t1*1000:.2f} ms")

    # 传统方式：读改写
    start = time.time()
    with p.open("r+b") as f:
        data = f.read()
        data = data[:100] + b"YES" + data[103:]
        f.seek(0)
        f.write(data)
    t2 = time.time() - start
    print(f"  传统方式: {t2*1000:.2f} ms")
    print(f"  加速比: {t2/t1:.1f}x\\n")


def demo_copy_on_write():
    print("=== 4. ACCESS_COPY 写时复制 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf17_c_"))
    p = base / "src.bin"
    p.write_bytes(b"ORIGINAL")

    with p.open("r+b") as f:
        with mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_COPY) as m:
            m[0:8] = b"MODIFIED"
            print(f"  内存中: {bytes(m[:8])!r}")
        # 关闭 mmap 后

    print(f"  原文件: {p.read_bytes()!r}")
    print(f"  ✅ COPY 模式不修改原文件\\n")


def demo_shared_region():
    print("=== 5. 模拟跨进程共享 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf17_s_"))
    p = base / "shared.dat"
    p.write_bytes(b"\\x00" * 100)

    # "进程 A" 写入
    print("  [A] 写入数据...")
    with p.open("r+b") as f:
        m = mmap.mmap(f.fileno(), 0)
        m[0:20] = b"hello from process A"
        m.flush()
        m.close()

    # "进程 B" 读取
    print("  [B] 读取数据...")
    with p.open("r+b") as f:
        m = mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ)
        msg = bytes(m[0:20])
        print(f"  [B] 读到: {msg!r}")
        m.close()
    print()


def demo_search_pattern():
    print("=== 6. 实战：在 GB 文件中搜字符串 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf17_p_"))
    p = base / "huge.log"
    # 模拟 1MB 文件，多次出现关键字
    with p.open("wb") as f:
        for i in range(50_000):
            f.write(f"line {i}\\n".encode("utf-8"))
        f.write(b"\\n=== IMPORTANT: secret key here ===\\n\\n")
        for i in range(50_000):
            f.write(f"more line {i}\\n".encode("utf-8"))

    with p.open("r+b") as f:
        with mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ) as m:
            pos = m.find(b"IMPORTANT")
            if pos != -1:
                end = m.find(b"\\n", pos)
                print(f"  在偏移 {pos} 找到: {bytes(m[pos:end]).decode()!r}")


# ===== 主程序 =====
if __name__ == "__main__":
    print("=" * 50)
    print("Python 文件管理教程 — 第十七章 demo")
    print("=" * 50 + "\\n")

    demo_basic_mmap()
    demo_find_in_mmap()
    demo_modify_large_file()
    demo_copy_on_write()
    demo_shared_region()
    demo_search_pattern()

    print("\\n" + "=" * 50)
    print("总结：")
    print("• mmap 把文件映射到内存，按页加载")
    print("• 大文件不爆内存，修改自动同步")
    print("• 支持切片、索引、find")
    print("• ACCESS_COPY 模式不污染原文件")
    print("• 适合: 大文件随机访问、跨进程共享")
    print("• 不适合: 频繁小写入、resize")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第十八章：JSON / YAML / TOML 配置文件
  // =========================================================
  {
    id: "pf-18",
    group: "高级文件操作",
    icon: "⚙️",
    title: "JSON / YAML / TOML 配置文件",
    content: `## 一、配置文件格式对比

| 格式 | 优点 | 缺点 | 用途 |
|------|------|------|------|
| **JSON** | 标准、跨语言 | 不支持注释 | API、配置 |
| **YAML** | 易读、支持注释 | 依赖库 | 配置（K8s、CI） |
| **TOML** | 易读、Python 原生 | 较新 | pyproject.toml |
| **INI** | 简单 | 功能弱 | 老 Python 项目 |
| **XML** | 强大 | 啰嗦 | 配置文件、文档 |

## 二、JSON

\`\`\`python
import json

# 写
data = {"name": "Alice", "age": 30, "hobbies": ["reading", "hiking"]}
with open("config.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# 读
with open("config.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# 字符串 ↔ JSON
s = json.dumps(data)   # str
data = json.loads(s)   # dict
\`\`\`

**关键参数**：
- \`ensure_ascii=False\`：保留中文
- \`indent=2\`：缩进美化
- \`sort_keys=True\`：按 key 排序

## 三、YAML

需要安装：\`pip install pyyaml\`

\`\`\`python
import yaml

# 写
data = {"name": "Alice", "age": 30, "hobbies": ["reading", "hiking"]}
with open("config.yaml", "w", encoding="utf-8") as f:
    yaml.dump(data, f, allow_unicode=True, default_flow_style=False)

# 读
with open("config.yaml", "r", encoding="utf-8") as f:
    data = yaml.safe_load(f)  # safe_load 不执行任意代码
\`\`\`

**YAML 格式示例**：
\`\`\`yaml
# 这是注释
name: Alice
age: 30
hobbies:
  - reading
  - hiking
database:
  host: localhost
  port: 5432
\`\`\`

**注意**：永远用 \`safe_load\`，不用 \`load\`（安全漏洞）。

## 四、TOML

Python 3.11+ 内置 \`tomllib\`（只读）。写需要 \`tomli-w\` 或 \`tomllib\`（3.13+）。

\`\`\`python
# Python 3.11+ 读
import tomllib
with open("config.toml", "rb") as f:  # 注意二进制模式
    data = tomllib.load(f)

# 写
try:
    import tomllib  # 3.13+ 写支持
    data_str = tomllib.dumps(data)
except ImportError:
    import tomli_w
    with open("config.toml", "wb") as f:
        tomli_w.dump(data, f)
\`\`\`

**TOML 格式示例**：
\`\`\`toml
# 注释
name = "Alice"
age = 30
hobbies = ["reading", "hiking"]

[database]
host = "localhost"
port = 5432
\`\`\`

## 五、INI 格式

\`\`\`python
import configparser

config = configparser.ConfigParser()
config.read("config.ini")

print(config["database"]["host"])

# 写
config["database"] = {"host": "localhost", "port": "5432"}
with open("config.ini", "w") as f:
    config.write(f)
\`\`\`

## 六、配置最佳实践

1. **配置放项目外**：避免污染代码
2. **提供示例配置**：\`config.example.yaml\`
3. **用环境变量覆盖**：\`DB_HOST=prod_host\` 优先
4. **不要把密码写进配置**：用环境变量或密钥管理
5. **配置有版本**：用 \`config_version: 1\` 字段

## 七、实战：分层配置

\`\`\`python
import json
from pathlib import Path

# 默认配置（代码内）
DEFAULT = {
    "debug": False,
    "db": {"host": "localhost", "port": 5432}
}

# 用户配置（文件）
def load_config(path):
    config = DEFAULT.copy()
    if Path(path).exists():
        with open(path, "r", encoding="utf-8") as f:
            user_cfg = json.load(f)
        # 深度合并
        config.update(user_cfg)
    return config
\`\`\`

## 八、本章 demo
下面 demo 演示各种配置文件的读写。
`,
    code: `"""
第十八章 demo：JSON / YAML / TOML 配置文件
演示：
  1. JSON 读写
  2. YAML 读写
  3. TOML 读写
  4. 配置文件分层加载
  5. 实战：带默认值的配置
"""

import os
import json
import tempfile
from pathlib import Path


def demo_json():
    print("=== 1. JSON ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf18_j_"))
    p = base / "config.json"

    data = {
        "name": "张三",
        "age": 30,
        "hobbies": ["读书", "爬山"],
        "db": {"host": "localhost", "port": 5432},
    }

    # 写
    with p.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"  写入文件:\\n{p.read_text(encoding='utf-8')}")

    # 读
    with p.open("r", encoding="utf-8") as f:
        loaded = json.load(f)
    print(f"  读回: {loaded!r}\\n")


def demo_yaml():
    print("=== 2. YAML ===\\n")
    try:
        import yaml
    except ImportError:
        print("  ⚠️  PyYAML 未安装，跳过\\n")
        return

    base = Path(tempfile.mkdtemp(prefix="pf18_y_"))
    p = base / "config.yaml"

    data = {
        "name": "张三",
        "age": 30,
        "hobbies": ["读书", "爬山"],
        "db": {"host": "localhost", "port": 5432},
    }

    # 写
    with p.open("w", encoding="utf-8") as f:
        yaml.dump(data, f, allow_unicode=True, default_flow_style=False)

    print(f"  写入文件:\\n{p.read_text(encoding='utf-8')}")

    # 读
    with p.open("r", encoding="utf-8") as f:
        loaded = yaml.safe_load(f)
    print(f"  读回: {loaded!r}\\n")


def demo_toml():
    print("=== 3. TOML ===\\n")
    if not hasattr(__import__("sys"), "version_info") or \\
       __import__("sys").version_info < (3, 11):
        print("  ⚠️  需要 Python 3.11+，跳过\\n")
        return

    import sys
    if sys.version_info >= (3, 11):
        import tomllib
    else:
        print("  ⚠️  需要 Python 3.11+，跳过\\n")
        return

    base = Path(tempfile.mkdtemp(prefix="pf18_t_"))
    p = base / "config.toml"

    # tomllib 只能读
    toml_text = '''
name = "张三"
age = 30
hobbies = ["读书", "爬山"]

[db]
host = "localhost"
port = 5432
'''
    p.write_text(toml_text, encoding="utf-8")

    # 读（二进制）
    with p.open("rb") as f:
        loaded = tomllib.load(f)
    print(f"  读回: {loaded!r}\\n")


def demo_configparser():
    print("=== 4. INI (configparser) ===\\n")
    import configparser

    base = Path(tempfile.mkdtemp(prefix="pf18_i_"))
    p = base / "config.ini"

    config = configparser.ConfigParser()
    config["DEFAULT"] = {"debug": "false"}
    config["database"] = {"host": "localhost", "port": "5432"}
    config["server"] = {"host": "0.0.0.0", "port": "8000"}

    # 写
    with p.open("w") as f:
        config.write(f)

    # 读
    config2 = configparser.ConfigParser()
    config2.read(p)
    print(f"  [database][host]: {config2['database']['host']}")
    print(f"  [server][port]: {config2['server']['port']}\\n")


def demo_layered_config():
    print("=== 5. 分层配置（默认 + 用户） ===\\n")

    DEFAULT = {
        "debug": False,
        "db": {"host": "localhost", "port": 5432},
        "log_level": "INFO",
    }

    def deep_update(base, override):
        """深度合并字典"""
        for k, v in override.items():
            if k in base and isinstance(base[k], dict) and isinstance(v, dict):
                deep_update(base[k], v)
            else:
                base[k] = v
        return base

    base = Path(tempfile.mkdtemp(prefix="pf18_l_"))
    user_config = base / "user.json"
    user_config.write_text(json.dumps({
        "debug": True,
        "db": {"host": "prod.example.com"}
    }, ensure_ascii=False), encoding="utf-8")

    def load_config(path):
        config = {k: v if not isinstance(v, dict) else v.copy()
                  for k, v in DEFAULT.items()}
        if Path(path).exists():
            with open(path, "r", encoding="utf-8") as f:
                deep_update(config, json.load(f))
        return config

    cfg = load_config(user_config)
    print(f"  默认 + 用户覆盖后:")
    print(f"    debug: {cfg['debug']}（用户开启）")
    print(f"    db.host: {cfg['db']['host']}（用户覆盖）")
    print(f"    db.port: {cfg['db']['port']}（默认保留）")
    print(f"    log_level: {cfg['log_level']}（默认保留）\\n")


def demo_env_override():
    print("=== 6. 环境变量覆盖配置 ===\\n")

    base = Path(tempfile.mkdtemp(prefix="pf18_e_"))
    config_path = base / "config.json"
    config_path.write_text(json.dumps({
        "db_host": "localhost",
        "db_port": 5432,
    }, ensure_ascii=False), encoding="utf-8")

    # 模拟环境变量
    os.environ["DB_HOST"] = "prod-db.example.com"
    os.environ["DEBUG"] = "true"

    def load_config_with_env(path):
        with open(path, "r", encoding="utf-8") as f:
            config = json.load(f)
        # 环境变量覆盖
        for k in list(config.keys()):
            env_key = k.upper()
            if env_key in os.environ:
                # 类型转换
                v = os.environ[env_key]
                if isinstance(config[k], bool):
                    config[k] = v.lower() == "true"
                elif isinstance(config[k], int):
                    config[k] = int(v)
                else:
                    config[k] = v
        return config

    cfg = load_config_with_env(config_path)
    print(f"  db_host: {cfg['db_host']}（被 DB_HOST 环境变量覆盖）")
    print(f"  db_port: {cfg['db_port']}（保持默认）")


# ===== 主程序 =====
if __name__ == "__main__":
    print("=" * 50)
    print("Python 文件管理教程 — 第十八章 demo")
    print("=" * 50 + "\\n")

    demo_json()
    demo_yaml()
    demo_toml()
    demo_configparser()
    demo_layered_config()
    demo_env_override()

    print("\\n" + "=" * 50)
    print("总结：")
    print("• JSON: 标准、跨语言、无注释")
    print("• YAML: 易读、需 PyYAML、safe_load 才安全")
    print("• TOML: Python 3.11+ 内置读、3.13+ 写")
    print("• INI: 简单、老项目")
    print("• 配置分层: 默认 + 用户 + 环境变量")
    print("• 敏感信息用环境变量，别写进文件")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第十九章：CSV / Excel 文件读写
  // =========================================================
  {
    id: "pf-19",
    group: "高级文件操作",
    icon: "📊",
    title: "CSV / Excel 文件读写",
    content: `## 一、CSV 文件

**CSV**（Comma-Separated Values）是最常用的数据交换格式。

**示例**：
\`\`\`
name,age,city
Alice,30,Beijing
Bob,25,Shanghai
\`\`\`

## 二、csv 模块基本用法

\`\`\`python
import csv

# 读
with open("data.csv", "r", encoding="utf-8") as f:
    reader = csv.reader(f)
    for row in reader:
        print(row)  # 每一行是 list

# 写
with open("out.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["name", "age"])
    writer.writerow(["Alice", 30])
\`\`\`

**关键点**：
- 打开时加 \`newline=""\`（避免空行）
- 显式指定 \`encoding="utf-8"\`

## 三、用 DictReader / DictWriter

\`\`\`python
import csv

# 按列名读
with open("data.csv", "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row["name"], row["age"])

# 按列名写
with open("out.csv", "w", encoding="utf-8", newline="") as f:
    fieldnames = ["name", "age"]
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerow({"name": "Alice", "age": 30})
\`\`\`

## 四、自定义分隔符

CSV 不一定是逗号，可能是 Tab（TSV）、分号（欧洲）：

\`\`\`python
# Tab 分隔
with open("data.tsv", "r", encoding="utf-8") as f:
    reader = csv.reader(f, delimiter="\\t")

# 分号分隔
with open("data.csv", "r", encoding="utf-8") as f:
    reader = csv.reader(f, delimiter=";")
\`\`\`

## 五、Excel 文件（openpyxl）

需要安装：\`pip install openpyxl\`

\`\`\`python
from openpyxl import Workbook, load_workbook

# 写
wb = Workbook()
ws = wb.active
ws.title = "学生"
ws.append(["姓名", "年龄", "城市"])
ws.append(["Alice", 30, "Beijing"])
ws.append(["Bob", 25, "Shanghai"])
wb.save("students.xlsx")

# 读
wb = load_workbook("students.xlsx")
ws = wb["学生"]
for row in ws.iter_rows(values_only=True):
    print(row)
\`\`\`

## 六、Excel 高级特性

\`\`\`python
from openpyxl.styles import Font, PatternFill, Alignment

# 样式
ws["A1"].font = Font(bold=True)
ws["A1"].fill = PatternFill("solid", fgColor="FFFF00")
ws["A1"].alignment = Alignment(horizontal="center")

# 合并
ws.merge_cells("A1:C1")

# 设置列宽
ws.column_dimensions["A"].width = 20
\`\`\`

## 七、Excel 公式

\`\`\`python
ws["D1"] = "=SUM(A1:A10)"
ws["D2"] = "=AVERAGE(B1:B10)"
\`\`\`

## 八、处理大 Excel 文件

Excel 2007+ 最大行数 1,048,576。超大数据用：

- \`openpyxl\`：支持 \`read_only=True\` 流式读
- \`xlsxwriter\`：写大文件更快
- 或转 CSV

## 九、Excel vs CSV 怎么选？

| 场景 | 推荐 |
|------|------|
| 数据交换 | CSV |
| 给人看 | Excel |
| 程序处理 | CSV / parquet |
| 含公式/样式 | Excel |
| 大于 100MB | 不用 Excel |

## 十、本章 demo
下面 demo 演示 CSV 和 Excel 读写。
`,
    code: `"""
第十九章 demo：CSV / Excel 文件读写
演示：
  1. CSV 基础读写
  2. DictReader / DictWriter
  3. 自定义分隔符
  4. Excel 读写（openpyxl）
  5. Excel 样式
  6. 实战：导出报表
"""

import csv
import tempfile
from pathlib import Path


def demo_csv_basic():
    print("=== 1. CSV 基础读写 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf19_c_"))
    p = base / "data.csv"

    # 写
    with p.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["name", "age", "city"])
        writer.writerow(["Alice", 30, "Beijing"])
        writer.writerow(["Bob", 25, "Shanghai"])

    print(f"  CSV 内容:\\n{p.read_text(encoding='utf-8')}")

    # 读
    with p.open("r", encoding="utf-8") as f:
        reader = csv.reader(f)
        for row in reader:
            print(f"  {row}")
    print()


def demo_csv_dict():
    print("=== 2. DictReader / DictWriter ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf19_d_"))
    p = base / "data.csv"

    # 写
    with p.open("w", encoding="utf-8", newline="") as f:
        fieldnames = ["name", "age", "city"]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerow({"name": "Alice", "age": 30, "city": "Beijing"})
        writer.writerow({"name": "Bob", "age": 25, "city": "Shanghai"})

    # 读
    with p.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            print(f"  {row['name']} - {row['age']}岁 - {row['city']}")
    print()


def demo_custom_delimiter():
    print("=== 3. 自定义分隔符 ===\\n")
    base = Path(tempfile.mkdtemp(prefix="pf19_s_"))
    p = base / "data.tsv"
    p.write_text("name\\tage\\tcity\\nAlice\\t30\\tBeijing\\nBob\\t25\\tShanghai\\n",
                 encoding="utf-8")

    with p.open("r", encoding="utf-8") as f:
        reader = csv.reader(f, delimiter="\\t")
        for row in reader:
            print(f"  {row}")
    print()


def demo_excel_basic():
    print("=== 4. Excel 读写 ===\\n")
    try:
        from openpyxl import Workbook, load_workbook
    except ImportError:
        print("  ⚠️  openpyxl 未安装，跳过\\n")
        return

    base = Path(tempfile.mkdtemp(prefix="pf19_e_"))
    p = base / "students.xlsx"

    # 写
    wb = Workbook()
    ws = wb.active
    ws.title = "学生"
    ws.append(["姓名", "年龄", "城市"])
    ws.append(["Alice", 30, "Beijing"])
    ws.append(["Bob", 25, "Shanghai"])
    ws.append(["张三", 28, "广州"])
    wb.save(p)

    print(f"  写入: {p.name} ({p.stat().st_size} bytes)")

    # 读
    wb = load_workbook(p)
    ws = wb["学生"]
    for row in ws.iter_rows(values_only=True):
        print(f"  {row}")
    print()


def demo_excel_style():
    print("=== 5. Excel 样式 ===\\n")
    try:
        from openpyxl import Workbook
        from openpyxl.styles import Font, PatternFill, Alignment
    except ImportError:
        print("  ⚠️  openpyxl 未安装，跳过\\n")
        return

    base = Path(tempfile.mkdtemp(prefix="pf19_st_"))
    p = base / "styled.xlsx"

    wb = Workbook()
    ws = wb.active
    ws.title = "报表"

    # 表头
    headers = ["产品", "销量", "金额"]
    ws.append(headers)

    # 表头样式
    for cell in ws[1]:
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = PatternFill("solid", fgColor="4472C4")
        cell.alignment = Alignment(horizontal="center")

    # 数据
    data = [
        ["产品A", 100, 9999],
        ["产品B", 200, 19998],
        ["产品C", 150, 14997],
    ]
    for row in data:
        ws.append(row)

    # 设置列宽
    ws.column_dimensions["A"].width = 15
    ws.column_dimensions["B"].width = 10
    ws.column_dimensions["C"].width = 12

    wb.save(p)
    print(f"  写入: {p.name}")
    print(f"  包含样式: 表头加粗+蓝底白字+居中")
    print(f"  包含列宽: A=15, B=10, C=12\\n")


def demo_excel_formula():
    print("=== 6. Excel 公式 ===\\n")
    try:
        from openpyxl import Workbook, load_workbook
    except ImportError:
        print("  ⚠️  openpyxl 未安装，跳过\\n")
        return

    base = Path(tempfile.mkdtemp(prefix="pf19_f_"))
    p = base / "formula.xlsx"

    wb = Workbook()
    ws = wb.active
    ws.append(["值"])
    for v in [10, 20, 30, 40, 50]:
        ws.append([v])
    # 公式
    ws["B7"] = "=SUM(A2:A6)"
    ws["B8"] = "=AVERAGE(A2:A6)"
    ws["B9"] = "=MAX(A2:A6)"

    wb.save(p)

    # 读
    wb2 = load_workbook(p)
    ws2 = wb2.active
    for cell in ["B7", "B8", "B9"]:
        print(f"  {cell}: {ws2[cell].value}")


def demo_export_report():
    print("\\n=== 7. 实战：导出销售报表 ===\\n")
    try:
        from openpyxl import Workbook
        from openpyxl.styles import Font, PatternFill, Alignment
    except ImportError:
        print("  ⚠️  openpyxl 未安装，跳过\\n")
        return

    # 模拟数据
    sales_data = [
        ("2024-01", "产品A", 100, 9999),
        ("2024-01", "产品B", 200, 19998),
        ("2024-02", "产品A", 150, 14997),
        ("2024-02", "产品C", 80, 7992),
    ]

    base = Path(tempfile.mkdtemp(prefix="pf19_r_"))
    csv_path = base / "report.csv"
    xlsx_path = base / "report.xlsx"

    # 导出 CSV
    with csv_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["月份", "产品", "销量", "金额"])
        writer.writerows(sales_data)
    print(f"  CSV 导出: {csv_path.name} ({csv_path.stat().st_size} bytes)")

    # 导出 Excel
    wb = Workbook()
    ws = wb.active
    ws.title = "销售报表"
    ws.append(["月份", "产品", "销量", "金额"])

    # 表头样式
    for cell in ws[1]:
        cell.font = Font(bold=True)
        cell.fill = PatternFill("solid", fgColor="DDDDDD")

    for row in sales_data:
        ws.append(row)

    # 合计行
    ws.append(["合计", "", "=SUM(C2:C5)", "=SUM(D2:D5)"])

    for col_letter in ["A", "B", "C", "D"]:
        ws.column_dimensions[col_letter].width = 12

    wb.save(xlsx_path)
    print(f"  Excel 导出: {xlsx_path.name} ({xlsx_path.stat().st_size} bytes)")


# ===== 主程序 =====
if __name__ == "__main__":
    print("=" * 50)
    print("Python 文件管理教程 — 第十九章 demo")
    print("=" * 50 + "\\n")

    demo_csv_basic()
    demo_csv_dict()
    demo_custom_delimiter()
    demo_excel_basic()
    demo_excel_style()
    demo_excel_formula()
    demo_export_report()

    print("\\n" + "=" * 50)
    print("总结：")
    print("• CSV: 简单、跨平台，open 时加 newline=''")
    print("• DictReader/DictWriter 按列名读写")
    print("• Excel: openpyxl，支持样式和公式")
    print("• 大数据用 CSV，不用 Excel")
    print("• 数据交换用 CSV，展示给用户用 Excel")
    print("=" * 50)
`,
  },
];
