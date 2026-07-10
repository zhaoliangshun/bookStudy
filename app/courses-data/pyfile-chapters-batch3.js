// =============================================================
// Python 文件操作教程 - 第 3 批章节(文件管理)
// 转义规则:content 内部反引号写作 \`,\${ 写作 \$\{。
// =============================================================

export const chapters = [
  {
    id: "pyfile-stat-metadata",
    icon: "📊",
    title: "文件属性与元数据:stat、大小、时间",
    group: "文件管理",
    content: `# 文件属性与元数据:stat、大小、时间

## 一、引言

在文件系统中,每个文件不仅存储内容本身,还附带了一组**属性数据(metadata)**,例如:文件多大、什么时候创建的、最后修改于何时、是什么类型的文件、属于哪个用户等。这些信息由操作系统维护,Python 通过 \`os.stat()\` 可以一次性读取出来。

理解元数据很重要,因为很多实际场景都依赖它:
- **备份程序**:根据修改时间判断哪些文件需要备份
- **日志清理**:按访问时间删除长期不用的旧文件
- **权限判断**:根据 st_mode 判断是文件还是目录
- **磁盘分析**:统计各文件大小找出占用空间的大户

本章聚焦 \`os.stat\` / \`pathlib.Path.stat\` 及相关的时间格式化方法,配合大量 demo 讲透每个字段。

## 二、os.stat 与 os.lstat

\`os.stat(path)\` 返回一个 \`stat_result\` 对象,包含文件的所有元数据。对于软链接,默认会跟随链接读取目标文件属性;而 \`os.lstat(path)\` 则直接读取软链接自身的属性(不跟随)。

\`\`\`python
import os

# stat 返回一个 stat_result 对象,类似命名元组
st = os.stat("example.txt")
print(type(st))  # <class 'os.stat_result'>
print(st)        # os.stat_result(st_mode=33188, st_ino=..., st_size=1024, ...)

# lstat 不会跟随软链接
# 如果 example_link -> example.txt
st_link = os.lstat("example_link")
print(st_link.st_size)  # 软链接自身的大小(很小,只有几十字节)
\`\`\`

**为什么区分 stat 和 lstat?** 当你需要知道"这个软链接本身"的信息(比如它指向谁、什么时候创建的链接),就要用 lstat;否则 stat 会跳到目标文件,你拿到的是目标的信息。

## 三、stat_result 核心字段表

| 字段 | 含义 | 常用度 |
|------|------|--------|
| st_mode | 文件类型 + 权限位 | ⭐⭐⭐⭐⭐ |
| st_size | 文件大小(字节) | ⭐⭐⭐⭐⭐ |
| st_atime | 最后访问时间(时间戳) | ⭐⭐⭐⭐ |
| st_mtime | 最后修改时间(时间戳) | ⭐⭐⭐⭐⭐ |
| st_ctime | 元数据最后改变时间(Windows 为创建时间) | ⭐⭐⭐ |
| st_ino | inode 编号(Unix) | ⭐⭐ |
| st_dev | 文件所在设备号 | ⭐⭐ |
| st_uid | 文件所有者 UID | ⭐⭐⭐ |
| st_gid | 文件所属组 GID | ⭐⭐⭐ |
| st_nlink | 硬链接数 | ⭐⭐ |

**atime vs mtime vs ctime 的区别**(常考):
- **atime(access time)**:文件内容被读取时更新(\`cat\`、\`read()\` 等)
- **mtime(modify time)**:文件内容被修改时更新(\`write()\` 等)
- **ctime(change time)**:文件**元数据**改变时更新(chmod、rename 等)。注意 Windows 下 ctime 表示**创建时间(creation time)**,语义不同

## demo 1:获取文件大小

\`\`\`python
import os

path = "example.txt"
# 方法一:os.path.getsize(底层就是 stat().st_size)
size = os.path.getsize(path)
print(f"文件大小: {size} 字节")

# 方法二:直接用 stat
st = os.stat(path)
print(f"文件大小: {st.st_size} 字节")

# 转成人类可读格式
def human_size(num):
    """把字节数转成 KB / MB / GB 等可读字符串"""
    for unit in ["B", "KB", "MB", "GB", "TB"]:
        if num < 1024:
            return f"{num:.2f} {unit}"
        num /= 1024
    return f"{num:.2f} PB"

print(human_size(size))  # 例如:1.23 MB
\`\`\`

**详解**:\`os.path.getsize\` 本质上就是 \`os.stat(path).st_size\` 的简写,两者完全等价。如果你已经调用过 \`stat\`,就直接复用结果,避免重复读磁盘。 \`human_size\` 函数是日常写脚本非常实用的小工具,可以放在自己的工具库里。

## demo 2:格式化修改时间

\`\`\`python
import os
import time

path = "example.txt"
st = os.stat(path)

# st_mtime 是浮点时间戳(自 1970-01-01 起的秒数)
mtime_ts = st.st_mtime
print(f"原始时间戳: {mtime_ts}")  # 1700000000.123

# 方法一:time.localtime 转成本地时间 struct_time
local_time = time.localtime(mtime_ts)
print(f"本地时间结构: {local_time}")

# 方法二:time.strftime 自定义格式
formatted = time.strftime("%Y-%m-%d %H:%M:%S", local_time)
print(f"修改时间: {formatted}")  # 2023-11-15 10:30:00

# 常用格式化占位符:
# %Y 年(4位)  %m 月  %d 日
# %H 时(24h)  %M 分  %S 秒
# %Y-%m-%d %H:%M:%S 是 ISO 风格,推荐用于日志

# 一行写法
iso = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(st.st_mtime))
print(f"ISO 时间: {iso}")
\`\`\`

**详解**:时间戳是机器友好的(整数比较大小很方便),但人类看不懂,所以展示给用户时一定要格式化。 \`time.localtime\` 把 UTC 时间戳转成本地时区的 struct_time;如果想要 UTC,用 \`time.gmtime\`。 \`strftime\` 是 "string format time" 的缩写,接受一个格式串,记忆方法:%Y 年、%m 月、%d 日、%H 时、%M 分、%S 秒,按顺序就是 "YmdHMS"。

## demo 3:判断文件类型

\`\`\`python
import os
import stat

path = "example.txt"
st = os.stat(path)

# 用 stat 模块的辅助函数判断类型(从 st_mode 中提取)
if stat.S_ISDIR(st.st_mode):
    print("这是一个目录")
elif stat.S_ISREG(st.st_mode):
    print("这是一个普通文件")
elif stat.S_ISLNK(st.st_mode):
    print("这是一个软链接")
elif stat.S_ISCHR(st.st_mode):
    print("这是一个字符设备")
elif stat.S_ISFIFO(st.st_mode):
    print("这是一个 FIFO(命名管道)")
elif stat.S_ISSOCK(st.st_mode):
    print("这是一个 socket")

# 更简洁的写法:os.path.isdir / isfile / islink
# 但 stat 模块更底层,适合需要批量判断的场景
\`\`\`

**详解**:\`st_mode\` 是一个整数,低 9 位是权限位(rwxrwxrwx),高 4 位是文件类型。我们不能直接看 st_mode 的数值,要用 \`stat.S_ISXXX\` 系列函数提取类型位。 日常开发 99% 只需要 \`S_ISDIR\` 和 \`S_ISREG\`,其它类型(设备、socket、管道)在系统编程里才会遇到。

## demo 4:stat 全字段展示

\`\`\`python
import os
import stat
import time
from pwd import getpwuid  # Unix only
from grp import getgrgid   # Unix only

def show_stat(path):
    """完整展示一个文件的所有元数据,适合做调试/分析工具"""
    st = os.stat(path)

    print(f"文件: {path}")
    print(f"  类型: {file_type_str(st.st_mode)}")
    print(f"  大小: {st.st_size} 字节")
    print(f"  权限: {stat.filemode(st.st_mode)}")  # 形如 -rw-r--r--
    print(f"  inode: {st.st_ino}")
    print(f"  设备号: {st.st_dev}")
    print(f"  硬链接数: {st.st_nlink}")

    # UID/GID 转成用户名/组名(Unix)
    try:
        owner = getpwuid(st.st_uid).pw_name
    except KeyError:
        owner = str(st.st_uid)
    try:
        group = getgrgid(st.st_gid).gr_name
    except KeyError:
        group = str(st.st_gid)
    print(f"  所有者: {owner} (uid={st.st_uid})")
    print(f"  所属组: {group} (gid={st.st_gid})")

    # 三个时间
    print(f"  访问时间: {time.ctime(st.st_atime)}")
    print(f"  修改时间: {time.ctime(st.st_mtime)}")
    print(f"  元数据改变: {time.ctime(st.st_ctime)}")

def file_type_str(mode):
    """把 st_mode 转成可读的类型字符串"""
    if stat.S_ISDIR(mode): return "目录"
    if stat.S_ISREG(mode): return "普通文件"
    if stat.S_ISLNK(mode): return "软链接"
    if stat.S_ISCHR(mode): return "字符设备"
    if stat.S_ISBLK(mode): return "块设备"
    if stat.S_ISFIFO(mode): return "FIFO"
    if stat.S_ISSOCK(mode): return "socket"
    return "未知"

show_stat("example.txt")
\`\`\`

**详解**:这个 demo 综合了所有字段。 \`stat.filemode\` 是个隐藏好物,直接把 mode 转成 \`-rw-r--r--\` 这种 ls 风格的字符串,不用自己拼。 \`pwd.getpwuid\` 把 UID 转成用户名(仅 Unix,Windows 下没有 pwd 模块)。 \`time.ctime\` 是最简的时间格式化方法,一行输出 \`Wed Nov 15 10:30:00 2023\` 这种格式,适合调试,不适合正式展示。

## demo 5:比较两个文件的新旧

\`\`\`python
import os

def newer(file_a, file_b):
    """返回更新的文件路径,常用于增量编译/备份判断"""
    mtime_a = os.path.getmtime(file_a)
    mtime_b = os.path.getmtime(file_b)

    if mtime_a > mtime_b:
        return file_a
    elif mtime_b > mtime_a:
        return file_b
    else:
        return None  # 时间相同

# 实际场景:源文件比目标文件新,才重新编译/复制
src = "source.py"
dst = "target.py"

if not os.path.exists(dst) or os.path.getmtime(src) > os.path.getmtime(dst):
    print("需要重新生成目标文件")
    # ... 执行复制/编译 ...
else:
    print("目标文件已经最新,跳过")
\`\`\`

**详解**:这是 \`make\` 这类构建工具的核心思想——**通过时间戳判断是否需要重新生成**。 比较时间戳用 \`>\` 即可,因为时间戳是浮点数。 注意精度问题:同一秒内修改的两个文件可能时间戳相同,所以判断逻辑要写成 \`>\` 而不是 \`>=\`。

## demo 6:pathlib stat 面向对象版本

\`\`\`python
from pathlib import Path
import time

p = Path("example.txt")

# Path.stat() 返回和 os.stat 一样的 stat_result 对象
st = p.stat()
print(f"大小: {st.st_size}")
print(f"修改时间: {time.ctime(st.st_mtime)}")

# lstat 不跟随软链接
if p.is_symlink():
    lst = p.lstat()
    print(f"软链接自身大小: {lst.st_size}")

# 常用属性直接在 Path 上有快捷方法
print(f"是否存在: {p.exists()}")
print(f"是否文件: {p.is_file()}")
print(f"是否目录: {p.is_dir()}")

# 批量处理:列出目录下所有大于 1MB 的文件
for f in Path(".").iterdir():
    if f.is_file() and f.stat().st_size > 1024 * 1024:
        print(f"大文件: {f.name} ({f.stat().st_size} 字节)")
\`\`\`

**详解**:\`pathlib\` 是 Python 3.4+ 推荐的面向对象路径 API。 \`Path.stat()\` 和 \`os.stat()\` 返回完全相同的对象,只是调用方式不同——前者是方法,后者是函数。 实际开发中推荐用 pathlib,代码更易读,链式调用更优雅。

## demo 7:监控文件是否被修改

\`\`\`python
import os
import time

def watch_file(path, interval=2.0, callback=None):
    """轮询监控文件修改,有变化时调用 callback"""
    last_mtime = os.path.getmtime(path)
    print(f"开始监控 {path},初始修改时间: {time.ctime(last_mtime)}")

    while True:
        time.sleep(interval)
        try:
            current = os.path.getmtime(path)
        except FileNotFoundError:
            print("文件被删除,退出监控")
            break

        if current > last_mtime:
            print(f"[{time.ctime(current)}] 检测到文件被修改!")
            if callback:
                callback(path)
            last_mtime = current

def my_callback(path):
    print(f"  处理文件 {path} 的新内容...")

# 实际运行:watch_file("log.txt", callback=my_callback)
# 注意:这是简化版,生产环境推荐 watchdog 库(inotify / FSEvents)
\`\`\`

**详解**:这是基于 mtime 的简单文件监控。 优点是无需第三方依赖,跨平台;缺点是轮询有延迟、CPU 占用比事件驱动高。 生产环境推荐 \`watchdog\` 库,它底层调用系统的 inotify(Linux)/ FSEvents(macOS)/ ReadDirectoryChangesW(Windows),效率高得多。

## 四、os.path 的便捷方法(底层都是 stat)

| os.path 方法 | 等价 stat 字段 |
|--------------|----------------|
| os.path.getsize(path) | st.st_size |
| os.path.getmtime(path) | st.st_mtime |
| os.path.getatime(path) | st.st_atime |
| os.path.getctime(path) | st.st_ctime |

这些便捷方法每次调用都会重新执行一次 \`stat\` 系统调用。 如果你同时需要大小和修改时间,**一定要先 \`st = os.stat(path)\` 缓存一次,然后复用 st.st_size / st.st_mtime**,避免两次磁盘 IO。

## 五、小结

- \`os.stat\` / \`os.lstat\` 返回 \`stat_result\`,包含文件全部元数据
- 三大时间:atime(访问)、mtime(修改)、ctime(元数据改变)
- \`stat.S_ISDIR\` / \`S_ISREG\` 判断文件类型
- \`pathlib.Path.stat\` 是面向对象版本,推荐使用
- \`os.path.getsize\` 等便捷方法底层都是 stat,需要多个字段时直接用 stat 更高效
`,
  },
  {
    id: "pyfile-shutil",
    icon: "📦",
    title: "文件复制、移动、删除:shutil 实战",
    group: "文件管理",
    content: `# 文件复制、移动、删除:shutil 实战

## 一、引言

\`shutil\` 是 "shell utility" 的缩写,提供**高级文件操作**。如果说 \`os\` 模块是"原子操作"(创建、删除单个文件),那 \`shutil\` 就是"分子操作"——能批量复制目录树、移动文件、保留元数据等。

简单对比:
- \`os.remove\`:删除一个文件
- \`shutil.rmtree\`:删除整棵目录树
- \`os.rename\`:重命名(同分区)
- \`shutil.move\`:移动(可跨分区,跨分区自动复制+删除)

日常开发中,凡是涉及"复制目录""移动文件夹""批量删除"的需求,几乎都要用 \`shutil\`。

## 二、三种 copy 的区别(重点)

| 函数 | 复制内容 | 权限(mode) | 元数据(时间等) |
|------|----------|-------------|-------------------|
| shutil.copyfile | ✅ | ❌ | ❌ |
| shutil.copy | ✅ | ✅ | ❌ |
| shutil.copy2 | ✅ | ✅ | ✅ |

- **copyfile**:只把文件内容字节复制过去,目标文件权限由系统默认 umask 决定
- **copy**:内容 + 权限位,适合日常使用
- **copy2**:内容 + 权限 + 元数据(mtime/atime/扩展属性),适合**备份场景**

## demo 1:三种 copy 对比

\`\`\`python
import shutil
import os
import stat
import time

# 准备源文件:权限 0o755,mtime 设置为过去某时刻
src = "source.txt"
with open(src, "w") as f:
    f.write("hello shutil")
os.chmod(src, 0o755)  # rwxr-xr-x
# 设置 mtime 为 2023-01-01
ts = time.mktime((2023, 1, 1, 0, 0, 0, 0, 0, 0))
os.utime(src, (ts, ts))  # (atime, mtime)

print(f"源文件:")
print(f"  权限: {stat.filemode(os.stat(src).st_mode)}")  # -rwxr-xr-x
print(f"  mtime: {time.ctime(os.stat(src).st_mtime)}")   # Sun Jan  1 ...

# 1) copyfile:只复制内容
shutil.copyfile(src, "dst_copyfile.txt")
# 2) copy:内容 + 权限
shutil.copy(src, "dst_copy.txt")
# 3) copy2:内容 + 权限 + 元数据
shutil.copy2(src, "dst_copy2.txt")

for name in ["dst_copyfile.txt", "dst_copy.txt", "dst_copy2.txt"]:
    st = os.stat(name)
    print(f"{name}: mode={stat.filemode(st.st_mode)}, mtime={time.ctime(st.st_mtime)}")
\`\`\`

**输出对比**:
\`\`\`
dst_copyfile.txt: mode=-rw-r--r--, mtime=当前时间
dst_copy.txt:    mode=-rwxr-xr-x, mtime=当前时间
dst_copy2.txt:   mode=-rwxr-xr-x, mtime=Sun Jan  1 ...
\`\`\`

**详解**:
- \`copyfile\` 权限变成了系统默认的 644(因为没复制权限位)
- \`copy\` 权限保留了 755,但 mtime 是当前时间(没复制元数据)
- \`copy2\` 权限和 mtime 都和源文件一致

## demo 2:copytree 递归复制目录树

\`\`\`python
import shutil
import os

# 模拟一个项目目录结构
os.makedirs("project/src", exist_ok=True)
os.makedirs("project/docs", exist_ok=True)
with open("project/src/main.py", "w") as f:
    f.write("print('hello')")
with open("project/docs/readme.md", "w") as f:
    f.write("# Project")
with open("project/config.json", "w") as f:
    f.write("{}")

# 一次性复制整个目录树
shutil.copytree("project", "project_backup")

# 验证:遍历新目录
for root, dirs, files in os.walk("project_backup"):
    for name in files:
        print(os.path.join(root, name))
# 输出:
# project_backup/src/main.py
# project_backup/docs/readme.md
# project_backup/config.json

# 注意:目标目录必须不存在,否则报 FileExistsError
# shutil.copytree("project", "project_backup")  # 第二次会报错
\`\`\`

**详解**:\`copytree\` 是递归复制,会保持原目录结构。 关键限制:**目标目录必须不存在**——这是为了防止误覆盖。 如果想覆盖,Python 3.8+ 支持 \`dirs_exist_ok=True\` 参数:

\`\`\`python
shutil.copytree("project", "project_backup", dirs_exist_ok=True)  # 3.8+
\`\`\`

## demo 3:copytree 用 ignore 过滤

\`\`\`python
import os
import shutil

# 方法一:用 ignore_patterns 工厂函数
shutil.copytree("project", "project_clean",
    ignore=shutil.ignore_patterns("*.pyc", "__pycache__", "*.log", ".git"))

# ignore_patterns 返回一个 ignore 函数,签名为:
# ignore(directory, contents) -> set_of_names_to_ignore

# 方法二:自定义 ignore 函数(更灵活)
def my_ignore(directory, contents):
    """自定义过滤逻辑:忽略 .log 文件,但保留 important.log"""
    ignored = set()
    for name in contents:
        full = os.path.join(directory, name)
        if name.endswith(".log") and name != "important.log":
            ignored.add(name)
        # 忽略所有大于 10MB 的文件
        if os.path.isfile(full) and os.path.getsize(full) > 10 * 1024 * 1024:
            ignored.add(name)
    return ignored

shutil.copytree("project", "project_filtered", ignore=my_ignore)
\`\`\`

**详解**:\`ignore\` 参数是一个**函数**,签名为 \`(directory, contents) -> set\`,其中 \`directory\` 是当前正在复制的目录路径,\`contents\` 是该目录下的所有条目名(列表)。 返回的集合中的名字会被跳过,不复制。 \`shutil.ignore_patterns\` 是个工厂,传入通配符模式,返回符合上述签名的函数,省去自己写循环。

## demo 4:move 移动文件/目录

\`\`\`python
import shutil
import os

# 1) 移动单个文件
shutil.move("old_path.txt", "new_path.txt")
# 等价于 os.rename,但更"宽容":跨分区会自动复制+删除

# 2) 移动到目录下(保留原文件名)
shutil.move("data.csv", "archive/")  # 移到 archive/data.csv

# 3) 移动整个目录
shutil.move("old_folder", "new_folder")
# 如果 new_folder 已存在且是目录,则 old_folder 会被移到 new_folder/old_folder

# 跨分区移动:shutil.move 自动处理
# os.rename 在跨分区时会失败(OSError: Invalid cross-device link)
# shutil.move 检测到跨设备时,会 copytree + rmtree
\`\`\`

**详解**:\`shutil.move\` 比 \`os.rename\` 更稳健,因为它处理了**跨文件系统**的情况。 \`os.rename\` 在同分区内是原子操作(只改目录项),但跨分区会报错(因为不能跨设备硬链接)。 \`shutil.move\` 检测到跨设备错误时,会自动 \`copytree\` + \`rmtree\` 完成移动。

**返回值**:\`shutil.move\` 返回目标路径,常用于知道最终落地位置:

\`\`\`python
import shutil
final = shutil.move("data.csv", "archive/")
print(f"文件最终位置: {final}")  # archive/data.csv
\`\`\`

## demo 5:rmtree 删除目录树

\`\`\`python
import shutil
import os

# 基本用法:删除整个目录树
shutil.rmtree("project_backup")

# 1) ignore_errors=True:遇到错误忽略(不抛异常)
shutil.rmtree("maybe_locked", ignore_errors=True)

# 2) onerror 回调:精细控制错误处理
def handle_error(func, path, exc_info):
    """func 是出错的函数(rmtree 内部用的 os.unlink / os.rmdir)
    path 是出错的文件/目录路径
    exc_info 是 sys.exc_info() 返回的异常元组"""
    print(f"删除 {path} 失败,原因: {exc_info[1]}")
    # 尝试改权限后再删
    import stat
    os.chmod(path, stat.S_IWRITE)
    try:
        func(path)  # 重试一次
    except Exception as e:
        print(f"重试仍失败: {e},跳过")

# 在 Windows 下文件被占用时常会 PermissionError,用 onerror 重试
shutil.rmtree("stubborn_dir", onerror=handle_error)
\`\`\`

**详解**:\`rmtree\` 是"破坏性"操作,一旦执行目录就没了,不能用回收站找回,慎用。 \`onerror\` 回调在 Windows 下尤其重要,因为 Windows 文件被占用时会拒绝删除,常见策略是先 \`chmod\` 加写权限再重试。 \`ignore_errors=True\` 是"懒人模式",不关心具体错误,适合清理临时目录这种"删不掉也无所谓"的场景。

## demo 6:copymode 和 copystat 单独复制权限/元数据

\`\`\`python
import shutil
import os
import stat
import time

# 场景:用 copyfile 复制了内容,但想把源文件的所有属性补上
shutil.copyfile("source.txt", "target.txt")  # 只复制内容

# 单独复制权限位(mode)
shutil.copymode("source.txt", "target.txt")

# 单独复制元数据(mtime/atime/扩展属性)
shutil.copystat("source.txt", "target.txt")

# 验证:两文件权限、mtime 完全一致
src_st = os.stat("source.txt")
dst_st = os.stat("target.txt")
print(f"src mode={stat.filemode(src_st.st_mode)}, dst mode={stat.filemode(dst_st.st_mode)}")
print(f"src mtime={src_st.st_mtime}, dst mtime={dst_st.st_mtime}")

# 适用场景:
# 1) 已经用低层 API 复制了内容,再补属性
# 2) 想保留模板文件的权限,但内容自己生成
# 3) 同步两套部署环境的权限配置
\`\`\`

**详解**:\`copymode\` 只复制权限位(对应 st_mode 的低 9 位),不改内容不改时间。 \`copystat\` 复制元数据(mtime/atime/flags 等),不复制权限位。 这两个函数配合 \`copyfile\` 可以达到和 \`copy2\` 一样的效果,但更灵活——你可以只复制权限不复制时间,或反之。

## demo 7:复制时保留元数据(copy2 最佳实践)

\`\`\`python
import shutil
import os
from datetime import datetime

def backup_with_metadata(src_dir, dst_dir):
    """备份目录,完整保留所有文件的元数据"""
    # 用 copytree + copy2(默认就是 copy2)
    shutil.copytree(src_dir, dst_dir, copy_function=shutil.copy2)

    # 验证元数据是否一致
    for root, dirs, files in os.walk(src_dir):
        for name in files:
            src_file = os.path.join(root, name)
            rel = os.path.relpath(src_file, src_dir)
            dst_file = os.path.join(dst_dir, rel)

            src_st = os.stat(src_file)
            dst_st = os.stat(dst_file)

            # 比较关键属性
            assert src_st.st_mode == dst_st.st_mode, f"{rel} 权限不一致"
            assert src_st.st_mtime == dst_st.st_mtime, f"{rel} mtime 不一致"
            assert src_st.st_size == dst_st.st_size, f"{rel} 大小不一致"
    print(f"备份完成: {src_dir} -> {dst_dir},元数据已校验")

# copytree 的 copy_function 参数(3.3+),默认是 copy2
# 可以指定为 shutil.copy 来加速(不复制元数据,快 5%~10%)
\`\`\`

**详解**:\`copytree\` 有个 \`copy_function\` 参数,默认是 \`shutil.copy2\`,所以默认就会保留元数据。 如果你不需要保留元数据,改成 \`shutil.copy\` 能略微提速(因为不用读元数据再写回去)。 备份场景一定要保留 mtime,这样恢复时时间线才不会乱。

## demo 8:copy vs copy2 决策表

| 场景 | 推荐 | 原因 |
|------|------|------|
| 临时复制文件随便用 | \`shutil.copy\` | 简单快,不关心权限 |
| 备份源代码 | \`shutil.copy2\` | 保留 mtime,git/构建工具依赖 |
| 部署到生产服务器 | \`shutil.copy2\` | 保留权限和元数据 |
| 跨用户复制 | \`shutil.copy\` | 权限可能不适用目标用户 |
| 复制可执行文件 | \`shutil.copy2\` | 保留执行位 |
| 大量小文件批量复制 | \`shutil.copy\` | 性能优先,元数据不重要 |
| 增量同步(类 rsync) | \`shutil.copy2\` | 时间戳是判断依据 |

## 三、disk_usage 查看磁盘占用

\`\`\`python
import shutil

# 返回 (total, used, free),单位字节
total, used, free = shutil.disk_usage("/")
print(f"总容量: {total / (1024**3):.1f} GB")
print(f"已使用: {used / (1024**3):.1f} GB")
print(f"剩余: {free / (1024**3):.1f} GB")
print(f"使用率: {used / total * 100:.1f}%")
\`\`\`

**详解**:\`shutil.disk_usage\` 跨平台,Windows 下也能用。 比 \`os.statvfs\`(Unix only)更通用。 常用于磁盘监控脚本、上传前检查剩余空间。

## 四、小结

- 三种 copy:\`copyfile\`(内容)/ \`copy\`(内容+权限)/ \`copy2\`(内容+权限+元数据)
- \`copytree\` 递归复制目录,支持 \`ignore\` 过滤和 \`copy_function\` 自定义
- \`move\` 跨分区自动处理,优于 \`os.rename\`
- \`rmtree\` 配合 \`onerror\` 可精细处理 Windows 文件占用问题
- 备份场景用 \`copy2\`,临时复制用 \`copy\`
`,
  },
  {
    id: "pyfile-tempfile",
    icon: "🗂️",
    title: "临时文件与目录:tempfile 模块",
    group: "文件管理",
    content: `# 临时文件与目录:tempfile 模块

## 一、引言

程序运行中经常需要"中间数据"——比如下载大文件时先存到临时位置、处理图片时缓存中间结果、写配置文件时先写临时文件再原子替换。 这些数据用完就该删,但又不能用 \`/tmp/xxx.txt\` 这种写死的路径(多进程会冲突、安全性差)。

Python 的 \`tempfile\` 模块专门解决这些问题,它能:
- **自动生成唯一文件名**(避免多进程冲突)
- **自动放到系统临时目录**(Linux 是 /tmp,Windows 是 %TEMP%)
- **支持自动清理**(上下文管理器,with 块结束自动删除)
- **安全创建**(权限 0600,其他用户读不到)

## 二、核心 API 速览

| API | 用途 | 自动清理 |
|-----|------|----------|
| TemporaryFile | 无名临时文件(最安全) | ✅(with 结束) |
| NamedTemporaryFile | 有名临时文件(可被其他进程读) | ✅(可配置) |
| mkstemp | 低层级创建,返回 fd + 路径 | ❌(需手动) |
| mkdtemp | 创建临时目录 | ❌(需手动) |
| TemporaryDirectory | 上下文管理器临时目录 | ✅(with 结束) |
| gettempdir | 获取系统临时目录路径 | - |
| gettempprefix | 获取临时文件名前缀(默认 "tmp") | - |

## demo 1:NamedTemporaryFile 基本用法

\`\`\`python
import tempfile

# 最常用:NamedTemporaryFile
# 默认 mode='w+b'(二进制读写),delete=True(关闭时自动删除)
with tempfile.NamedTemporaryFile() as tmp:
    print(f"文件名: {tmp.name}")  # 例如:/tmp/tmpabc123def
    tmp.write(b"hello tempfile")
    tmp.seek(0)  # 写完必须 seek,否则 read 读不到
    content = tmp.read()
    print(f"内容: {content}")  # b'hello tempfile'
# with 块结束后,文件自动关闭并删除

# 文本模式
with tempfile.NamedTemporaryFile(mode='w+', suffix='.txt', encoding='utf-8') as tmp:
    tmp.write("中文内容")
    tmp.seek(0)
    print(tmp.read())
\`\`\`

**详解**:\`NamedTemporaryFile\` 是最常用的临时文件 API。 "Named" 意味着文件有真实路径(\`tmp.name\`),其他进程可以通过这个路径访问。 \`delete=True\` 时,文件 \`close\` 后自动 \`os.unlink\`,这是默认行为。 注意 \`mode='w+b'\` 是二进制模式,要写字符串需要显式指定 \`mode='w+'\` 加 \`encoding='utf-8'\`。

**关键陷阱**:写完之后必须 \`seek(0)\` 把指针移回开头,否则 \`read\` 读到的是空(因为指针在末尾)。 这是初学者最常踩的坑。

## demo 2:TemporaryFile 匿名文件

\`\`\`python
import tempfile

# TemporaryFile 没有可见文件名,更安全(其他进程无法访问)
# Linux 下用 open(O_EXCL) + unlink 实现,文件在 fs 中"已删除"但 fd 仍可用
with tempfile.TemporaryFile() as tmp:
    # tmp.name 在 Linux 可能是数字 fd,Windows 是临时路径但不暴露
    print(f"name: {tmp.name}")  # Linux: <fd 3>,Windows: C:\\\\...\\\\tmpXXX
    tmp.write(b"secret data")
    tmp.seek(0)
    print(tmp.read())

# 适用场景:
# 1) 数据敏感,不希望其他进程读到
# 2) 不需要其他进程通过路径访问
# 3) Linux 下文件创建后立即 unlink,即使程序崩溃也不会残留
\`\`\`

**详解**:\`TemporaryFile\` 和 \`NamedTemporaryFile\` 的区别在于"是否有名字"。 匿名文件在 Linux 下利用 \`unlink\` 的特性——文件被打开后立即从目录树移除,但 fd 仍可用,直到 fd 关闭磁盘空间才释放。 这意味着即使程序崩溃,文件也不会残留在磁盘上,适合处理密码、密钥等敏感数据。

**Windows 限制**:Windows 不支持"打开后立即 unlink"的语义,\`TemporaryFile\` 在 Windows 上行为和 \`NamedTemporaryFile\` 类似(有路径),但默认 \`delete=True\`,关闭后删除。

## demo 3:mkdtemp 创建临时目录

\`\`\`python
import tempfile
import os

# mkdtemp 创建一个临时目录,返回路径
# 注意:不会自动清理!需要手动 rmtree
tmpdir = tempfile.mkdtemp(prefix="myapp_", suffix="_data")
print(f"临时目录: {tmpdir}")  # /tmp/myapp_xxxxx_data

# 在里面创建文件
config_path = os.path.join(tmpdir, "config.json")
with open(config_path, "w") as f:
    f.write('{"key": "value"}')

# 用完后手动清理
import shutil
shutil.rmtree(tmpdir)  # 删除目录及所有内容
\`\`\`

**详解**:\`mkdtemp\` 适合"我需要一个工作目录,往里面放各种文件"的场景。 它**不会自动清理**,因为目录里可能有你创建的文件,模块不知道你要保留多久。 务必用 \`shutil.rmtree\` 手动清理,否则会在 /tmp 留下垃圾。 \`prefix\` 和 \`suffix\` 用于让临时目录名可识别(方便调试),默认是 "tmp" 开头。

**权限问题**:\`mkdtemp\` 创建的目录权限是 0700(仅所有者可读写执行),保证其他用户无法窥视你的临时数据。

## demo 4:TemporaryDirectory 自动清理(推荐)

\`\`\`python
import tempfile
import os

# Python 3.2+: TemporaryDirectory 上下文管理器,自动清理
with tempfile.TemporaryDirectory(prefix="work_") as tmpdir:
    print(f"工作目录: {tmpdir}")
    # 在里面随便创建文件
    with open(os.path.join(tmpdir, "a.txt"), "w") as f:
        f.write("a")
    with open(os.path.join(tmpdir, "b.txt"), "w") as f:
        f.write("b")

    # 模拟工作过程
    print(f"处理中,文件列表: {os.listdir(tmpdir)}")
# with 结束,目录和所有文件自动删除
print(f"目录还存在吗: {os.path.exists(tmpdir)}")  # False

# 也可以不用 with,手动 cleanup
d = tempfile.TemporaryDirectory()
print(d.name)
d.cleanup()  # 显式清理
\`\`\`

**详解**:\`TemporaryDirectory\` 是 \`mkdtemp\` 的"自动化版本",用 \`with\` 语句包裹,块结束时自动调用 \`rmtree\`。 这是**现代 Python 推荐的写法**,基本不用 \`mkdtemp\` 了。 即使 \`with\` 块内抛异常,\`__exit__\` 也会执行清理,所以非常安全。 唯一例外:程序被 \`kill -9\` 强杀时来不及清理,但这种情况下临时文件本来也不重要。

## demo 5:指定后缀和前缀

\`\`\`python
import tempfile

# 帮助识别临时文件用途,后缀尤其重要(影响其他程序识别)
with tempfile.NamedTemporaryFile(suffix=".csv", prefix="export_") as f:
    print(f.name)  # /tmp/export_XXXXXX.csv

# 为什么指定后缀?
# 1) 让用户/工具识别文件类型:'file' 命令、文本编辑器
# 2) 某些库会按后缀选择处理方式(如 PIL 读图片)
# 3) 调试时一眼看出是哪个程序产生的

# 指定目录(默认是系统临时目录)
import os
os.makedirs("./mytmp", exist_ok=True)
with tempfile.NamedTemporaryFile(dir="./mytmp", suffix=".json") as f:
    print(f.name)  # ./mytmp/tmpXXXX.json

# gettempdir 获取默认临时目录
print(f"系统临时目录: {tempfile.gettempdir()}")  # Linux: /tmp, Win: C:\\\\Users\\\\xxx\\\\AppData\\\\Local\\\\Temp
\`\`\`

**详解**:\`suffix\` 和 \`prefix\` 看起来是小事,但实际开发中很重要。 比如你导出 CSV 文件给 Excel 处理,如果临时文件没 .csv 后缀,Excel 可能打不开。 \`dir\` 参数允许把临时文件放到指定目录,常见场景是"当前项目目录下建 .tmp 子目录",方便统一清理和备份排除。

## demo 6:临时文件实现原子写入

\`\`\`python
import tempfile
import os

def atomic_write(path, content):
    """原子写入文件:先写到临时文件,再 rename 替换原文件
    保证即使写入中途崩溃,原文件也不会损坏"""
    dir = os.path.dirname(path) or "."
    # 关键:临时文件必须和目标文件在同一个目录(同分区才能 rename)
    with tempfile.NamedTemporaryFile(
        mode='w',
        dir=dir,            # 同目录
        prefix=".tmp_",    # 隐藏文件
        delete=False,      # 不要自动删,我们要 rename
        encoding='utf-8'
    ) as tmp:
        try:
            tmp.write(content)
            tmp.flush()
            os.fsync(tmp.fileno())  # 强制刷盘,防止断电丢数据
            os.rename(tmp.name, path)  # 原子替换
        except:
            os.unlink(tmp.name)  # 出错时清理临时文件
            raise

# 使用:即使写到一半进程被杀,原 config.json 也不会损坏
atomic_write("config.json", '{"version": 2}')
\`\`\`

**详解**:这是临时文件最经典的应用——**原子写入**。 直接 \`open(path, 'w')\` 写文件,如果中途崩溃,文件可能只写了一半,损坏了。 用临时文件 + rename 的方式,要么原文件不动(rename 是原子操作),要么完全替换成新内容,永远不会出现"半新半旧"的中间状态。

**关键点**:
1. 临时文件和目标文件必须在**同一文件系统**(同分区),否则 \`os.rename\` 会变成"复制+删除",失去原子性
2. \`delete=False\` 因为我们手动控制(用完 rename 走了)
3. \`os.fsync\` 强制把缓冲区刷到磁盘,防止操作系统 page cache 还没落盘就断电

## demo 7:下载大文件到临时文件

\`\`\`python
import tempfile
import os
import shutil

def download_to_temp(url, suffix=""):
    """模拟下载大文件到临时文件,处理完再保留或删除"""
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        # 模拟分块下载(实际用 requests.get(stream=True))
        for chunk in [b"chunk1-", b"chunk2-", b"chunk3"]:
            tmp.write(chunk)
        path = tmp.name
    print(f"下载完成: {path}, 大小: {os.path.getsize(path)} 字节")
    return path

# 处理大文件
tmp_path = download_to_temp("https://example.com/big.zip", suffix=".zip")
try:
    # 模拟处理(如解压、解析等)
    with open(tmp_path, "rb") as f:
        data = f.read()
    print(f"处理完成,内容: {data}")
finally:
    # 用完一定要删除
    os.unlink(tmp_path)
\`\`\`

**详解**:处理大文件(尤其是流式下载)时,临时文件很常用。 \`delete=False\` 让文件在 with 块结束后保留(否则 close 就删了,没法在 with 外面用)。 但要记得 **finally 里手动 unlink**,否则会残留。 更优雅的写法是用 \`TemporaryDirectory\` 把所有中间文件圈起来,统一清理。

## 三、安全注意事项

1. **不要自己拼临时路径**:/tmp/myapp/data.txt 可能被攻击者预先创建软链接,用 \`tempfile\` 模块的 API 才安全
2. **权限默认是 0600**:\`NamedTemporaryFile\` 创建的文件只有所有者能读写,其他用户读不到,适合敏感数据
3. **不要把临时文件放在 web 可访问目录**:曾经有漏洞就是 /tmp 下的备份文件被 web 直接读走
4. **Linux /tmp 可能是 tmpfs**(内存盘):重启就没了,不要把"持久数据"放进去
5. **跨进程共享用 NamedTemporaryFile**:匿名文件其他进程拿不到 fd,无法访问

## 四、决策表:该用哪个 API

| 需求 | 推荐 API |
|------|----------|
| 单进程内临时数据 | TemporaryFile |
| 需要文件名让其他进程/库读 | NamedTemporaryFile |
| 需要一个工作目录 | TemporaryDirectory |
| 需要精细控制(低层 fd) | mkstemp |
| 原子写入(同目录临时文件) | NamedTemporaryFile(dir=, delete=False) |
| 敏感数据(密码、密钥) | TemporaryFile(自动 unlink) |

## 五、小结

- \`NamedTemporaryFile\` 最常用,有名 + 自动清理
- \`TemporaryFile\` 匿名,更安全(适合敏感数据)
- \`TemporaryDirectory\` 自动清理目录,推荐替代 \`mkdtemp\`
- 原子写入是临时文件最经典的应用:同目录临时文件 + fsync + rename
- 默认权限 0600,跨用户场景安全
`,
  },
  {
    id: "pyfile-permissions",
    icon: "🔐",
    title: "文件权限与所有权",
    group: "文件管理",
    content: `# 文件权限与所有权

## 一、引言

Linux/macOS 的文件系统采用经典的 **Unix 权限模型**:每个文件有三组权限(所有者 / 组 / 其他),每组三种权限(读 / 写 / 执行)。这套模型从 1970 年代 Unix 诞生起沿用至今,是系统编程绕不开的基础。

Python 通过 \`os\` 和 \`stat\` 两个模块操作权限:
- \`os.chmod(path, mode)\`:修改权限位
- \`os.umask(mask)\`:设置创建文件时的默认权限掩码
- \`os.chown(path, uid, gid)\`:修改所有者
- \`os.access(path, mode)\`:检查当前进程是否有权限

Windows 也有这些函数,但权限模型不同,部分操作无效或行为不一致。

## 二、Unix 权限模型详解

每个文件的权限用 9 个位表示,分为 3 组:

\`\`\`
rwx rwx rwx
│││ │││ │││
│││ │││ └┴── 其他(other)的 r/w/x
│││ └┴─── 组(group)的 r/w/x
└┴────── 所有者(user/owner)的 r/w/x
\`\`\`

- **r(read)**:读权限,文件可读内容,目录可列出条目
- **w(write)**:写权限,文件可修改,目录可增删条目
- **x(execute)**:执行权限,文件可执行,目录可进入(cd 进去)

### 权限数字表示法

把 9 位分成 3 组,每组 rwx 用一个八进制数表示(r=4, w=2, x=1,相加):

| 数字 | rwx | 含义 |
|------|-----|------|
| 7 | rwx | 全部权限 |
| 6 | rw- | 读+写 |
| 5 | r-x | 读+执行 |
| 4 | r-- | 只读 |
| 3 | -wx | 写+执行(罕见) |
| 2 | -w- | 只写(罕见) |
| 1 | --x | 只执行(罕见) |
| 0 | --- | 无权限 |

**常见组合**:

| 八进制 | 含义 | 典型用途 |
|--------|------|----------|
| 0755 | rwxr-xr-x | 可执行文件、目录 |
| 0644 | rw-r--r-- | 普通文件(默认) |
| 0600 | rw------- | 私密文件(密钥等) |
| 0700 | rwx------ | 私有目录 |
| 0666 | rw-rw-rw- | 所有人可写(危险) |
| 0777 | rwxrwxrwx | 所有人可写可执行(极危险) |

## 三、stat 模块的权限常量

\`stat\` 模块定义了权限位的符号常量,便于记忆:

\`\`\`python
import stat

# 用户(owner)
stat.S_IRUSR  # 0o400  owner read
stat.S_IWUSR  # 0o200  owner write
stat.S_IXUSR  # 0o100  owner execute

# 组(group)
stat.S_IRGRP  # 0o040  group read
stat.S_IWGRP  # 0o020  group write
stat.S_IXGRP  # 0o010  group execute

# 其他(other)
stat.S_IROTH  # 0o004  other read
stat.S_IWOTH  # 0o002  other write
stat.S_IXOTH  # 0o001  other execute

# 特殊位
stat.S_ISUID  # 0o4000  setuid(执行时切换到所有者)
stat.S_ISGID  # 0o2000  setgid
stat.S_ISVTX  # 0o1000  sticky bit(目录内文件只能所有者删)
\`\`\`

用 \`|\` 组合,比直接写数字更可读:

\`\`\`python
import os, stat
# 等价于 os.chmod(path, 0o755)
os.chmod(path, stat.S_IRUSR | stat.S_IWUSR | stat.S_IXUSR |
                stat.S_IRGRP | stat.S_IXGRP |
                stat.S_IROTH | stat.S_IXOTH)
\`\`\`

## demo 1:chmod 修改权限

\`\`\`python
import os
import stat

path = "script.sh"

# 方法一:直接用八进制数字(最常用)
os.chmod(path, 0o755)  # rwxr-xr-x,可执行

# 方法二:用 stat 常量(可读性好)
os.chmod(path,
    stat.S_IRUSR | stat.S_IWUSR | stat.S_IXUSR |  # owner rwx
    stat.S_IRGRP | stat.S_IXGRP |                 # group r-x
    stat.S_IROTH                                   # other r--
)  # 等价 0o755

# 私密文件:仅所有者可读写
os.chmod(path, 0o600)

# 添加可执行位,不改动其他位(增量修改)
st = os.stat(path)
current_mode = stat.S_IMODE(st.st_mode)  # 提取权限部分(去掉类型位)
new_mode = current_mode | stat.S_IXUSR   # 加上 owner x
os.chmod(path, new_mode)

# 移除组和其他的写权限
new_mode = current_mode & ~(stat.S_IWGRP | stat.S_IWOTH)
os.chmod(path, new_mode)
\`\`\`

**详解**:\`os.chmod\` 直接覆盖权限,不是增量修改。 如果只想"加一个权限"或"减一个权限",要先 \`stat\` 读出当前权限,做位运算后再 \`chmod\`。 \`stat.S_IMODE\` 函数提取 st_mode 的低 9 位(权限部分),去掉高位的类型字段,这样位运算才正确。

## demo 2:umask 影响默认权限

\`\`\`python
import os

# umask 是"创建文件时的权限掩码"
# 新建文件的权限 = 全权限(0666 for 文件, 0777 for 目录) & ~umask
# 例如 umask=022,新文件权限 = 0666 & ~022 = 0644
# 新目录权限 = 0777 & ~022 = 0755

old_umask = os.umask(0o022)  # 返回旧 umask,设置新 umask
print(f"旧 umask: {oct(old_umask)}")

# 创建文件看看默认权限
with open("newfile.txt", "w") as f:
    pass
st = os.stat("newfile.txt")
print(f"文件权限: {oct(st.st_mode & 0o777)}")  # 0o644

os.makedirs("newdir", exist_ok=True)
st = os.stat("newdir")
print(f"目录权限: {oct(st.st_mode & 0o777)}")  # 0o755

# 想要更严格的默认权限:umask 077
os.umask(0o077)
with open("secret.txt", "w") as f:
    pass
st = os.stat("secret.txt")
print(f"私密文件权限: {oct(st.st_mode & 0o777)}")  # 0o600
\`\`\`

**详解**:\`umask\` 是进程级别的设置,影响后续所有 \`open\` / \`os.mkdir\` 创建的文件。 它是"减法"——从全权限里减去 umask 位。 默认 umask 通常是 022(让组和其他没有写权限),改 077 则更严格(组和其他完全无权限)。 \`os.umask\` 返回旧值,方便恢复。 **注意**:umask 设置后影响整个进程,在多线程程序里要谨慎使用。

## demo 3:access 检查权限

\`\`\`python
import os

path = "config.yaml"

# os.access 检查"当前进程"对文件的权限
# R_OK / W_OK / X_OK / F_OK 分别表示 读/写/执行/存在
print(f"存在: {os.access(path, os.F_OK)}")
print(f"可读: {os.access(path, os.R_OK)}")
print(f"可写: {os.access(path, os.W_OK)}")
print(f"可执行: {os.access(path, os.X_OK)}")

# 同时检查多个权限(位或)
if os.access(path, os.R_OK | os.W_OK):
    print("可读可写")

# 典型应用:操作前检查
if not os.access(path, os.W_OK):
    print(f"警告:无写权限,无法修改 {path}")
    # sys.exit(1)
\`\`\`

**详解**:\`os.access\` 检查的是**真实用户 ID**(real uid)的权限,不是有效用户 ID。 这在 setuid 程序里会有差异,但日常脚本里两者相同。 **注意一个陷阱**:\`os.access\` 检查通过不代表后续 \`open\` 一定成功,因为可能有竞争条件(检查后到 open 前文件被删了)。 这种叫 **TOCTOU(Time of Check to Time of Use)** 漏洞,严谨做法是直接尝试 \`open\`,捕获 PermissionError。

## demo 4:权限数字计算

\`\`\`python
def parse_mode(mode_str):
    """把 'rwxr-xr--' 字符串转成八进制数字"""
    if len(mode_str) != 9:
        raise ValueError("模式串必须是 9 字符")
    result = 0
    # owner: 第 0-2 字符
    if mode_str[0] == 'r': result |= 0o400
    if mode_str[1] == 'w': result |= 0o200
    if mode_str[2] == 'x': result |= 0o100
    # group: 第 3-5 字符
    if mode_str[3] == 'r': result |= 0o040
    if mode_str[4] == 'w': result |= 0o020
    if mode_str[5] == 'x': result |= 0o010
    # other: 第 6-8 字符
    if mode_str[6] == 'r': result |= 0o004
    if mode_str[7] == 'w': result |= 0o002
    if mode_str[8] == 'x': result |= 0o001
    return result

print(oct(parse_mode("rwxr-xr-x")))  # 0o755
print(oct(parse_mode("rw-r--r--")))    # 0o644
print(oct(parse_mode("rwx------")))    # 0o700

# 反向:数字转字符串
import stat
def mode_to_str(mode):
    """八进制权限转 rwxrwxrwx 字符串"""
    parts = []
    for who in ['USR', 'GRP', 'OTH']:
        r = mode & getattr(stat, f'S_IR{who}')
        w = mode & getattr(stat, f'S_IW{who}')
        x = mode & getattr(stat, f'S_IX{who}')
        parts.append(('r' if r else '-') + ('w' if w else '-') + ('x' if x else '-'))
    return ''.join(parts)

print(mode_to_str(0o755))  # rwxr-xr-x
print(mode_to_str(0o644))  # rw-r--r--
\`\`\`

**详解**:理解权限位运算是处理权限的关键。 \`r=4, w=2, x=1\` 实际上就是二进制位:\`rwx\` = \`100 | 010 | 001\` = \`111\` = 7。 所以 \`755\` 二进制是 \`111 101 101\`,即 \`rwx r-x r-x\`。 自己写 \`parse_mode\` / \`mode_to_str\` 能加深理解,实际生产代码里直接用 \`stat.filemode()\` 即可。

## demo 5:递归修改目录权限

\`\`\`python
import os
import stat

def chmod_recursive(path, mode):
    """递归修改目录及所有子项的权限
    注意:目录需要 x 权限才能进入,所以通常目录比文件多 x"""
    if os.path.isdir(path):
        # 先改目录本身
        os.chmod(path, mode | stat.S_IXUSR)  # 目录加上 owner x
        # 递归处理子项
        for name in os.listdir(path):
            full = os.path.join(path, name)
            chmod_recursive(full, mode)
    else:
        # 文件直接 chmod
        os.chmod(path, mode)

# 智能版本:目录和文件用不同权限
def chmod_smart(path, dir_mode=0o755, file_mode=0o644):
    """目录用 755,文件用 644,符合 Linux 惯例"""
    if os.path.isdir(path):
        os.chmod(path, dir_mode)
        for name in os.listdir(path):
            chmod_smart(os.path.join(path, name), dir_mode, file_mode)
    else:
        os.chmod(path, file_mode)

# 使用
chmod_smart("/tmp/myproject")
\`\`\`

**详解**:Linux 惯例是目录 755、文件 644——目录需要 x 权限才能 \`cd\` 进去(更准确说是访问目录内条目)。 如果给目录 644(没 x),\`ls\` 能列出名字,但 \`stat\` 不到详情,也无法进入子目录。 \`chmod_smart\` 区分对待文件和目录,是最常见的批量修改模式。

## demo 6:chown 修改所有者

\`\`\`python
import os

path = "data.txt"

# 获取当前所有者
st = os.stat(path)
print(f"uid={st.st_uid}, gid={st.st_gid}")

# 修改所有者(需要 root 权限!普通用户改不了)
# os.chown(path, uid, gid)
# os.chown(path, 1000, 1000)  # 改成 uid=1000, gid=1000

# 只改 gid 不改 uid:uid 传 -1
# os.chown(path, -1, 1000)

# 不改数字,用用户名查找
import pwd
import grp
user_info = pwd.getpwnam("nobody")
group_info = grp.getgrnam("nogroup")
# os.chown(path, user_info.pw_uid, group_info.gr_gid)

# 典型场景:web 服务器把上传的文件 chown 给 www-data
# 注意:Windows 下 chown 几乎无效,权限模型完全不同
\`\`\`

**详解**:\`os.chown\` 修改文件所有者,**只有 root 能调用**(普通用户不能把文件"送给"别人)。 这是 Unix 的安全设计——否则用户能把恶意文件 chown 给管理员,绕过磁盘配额。 实际开发中 \`chown\` 主要在:
1. **部署脚本**:把应用文件 chown 给运行用户(如 www-data)
2. **Docker 容器**:启动时修正文件所有者
3. **sudo 脚本**:临时提权修改所有者

**Windows 注意**:\`os.chown\` 在 Windows 上基本无效,Windows 的 ACL(Access Control List)权限模型和 Unix 完全不同,要操作得用 \`win32security\` 模块(pywin32)。

## 四、setuid / setgid / sticky 特殊位

除了 9 个普通权限位,Unix 还有 3 个特殊位:

- **setuid(0o4000)**:执行时临时切换到文件所有者身份。 \`/usr/bin/passwd\` 就是 setuid root,普通用户执行时能改 /etc/shadow
- **setgid(0o2000)**:对目录有效,新创建的文件继承目录的 gid(而不是创建者的 gid)
- **sticky(0o1000)**:对目录有效,目录内文件只有所有者能删。 \`/tmp\` 就是 sticky,防止用户删别人的文件

\`\`\`python
import os
# 设置 setuid(危险!谨慎)
# os.chmod("privileged", 0o4755)  # setuid + rwxr-xr-x

# 设置 sticky 位(目录常用)
os.chmod("/tmp/shared", 0o1777)  # sticky + rwxrwxrwx
\`\`\`

## 五、Windows 下的差异

| 操作 | Linux/macOS | Windows |
|------|-------------|---------|
| chmod | 完整支持 | 仅只读位有效(0o444 vs 0o666) |
| chown | root 可调用 | 无效 |
| umask | 影响 open | 部分支持 |
| access | 真实权限检查 | 主要检查只读位 |

Windows 的权限用 **ACL**(访问控制列表)管理,比 Unix 模型复杂得多(每个文件可以给不同用户分别授权)。 Python 标准库不支持操作 ACL,要用 \`win32security\` 模块(pywin32 第三方库)。 跨平台脚本建议**只用基本的 0o600 / 0o644 / 0o755**,Windows 上虽然只有"只读"概念生效,但至少不会报错。

## 六、小结

- Unix 权限 9 位:rwxrwxrwx,八进制表示如 0o755
- \`os.chmod\` 覆盖权限,增量修改要先 stat 再位运算
- \`os.umask\` 影响后续创建文件的默认权限
- \`os.access\` 检查权限,但有 TOCTOU 风险,严谨用法是直接尝试 open
- \`os.chown\` 仅 root 可调用,Windows 无效
- 目录需要 x 权限才能进入,所以目录通常 755、文件 644
`,
  },
  {
    id: "pyfile-glob-fnmatch",
    icon: "🔍",
    title: "文件搜索与匹配:glob、fnmatch",
    group: "文件管理",
    content: `# 文件搜索与匹配:glob、fnmatch

## 一、引言

日常脚本里经常需要"找出所有 .py 文件""列出所有以 log 开头的文件"。 这类需求如果手写 \`os.listdir\` + \`re.match\`,代码会很啰嗦。 Python 内置的 \`glob\` 和 \`fnmatch\` 模块用 **shell 通配符** 解决这个问题——简单、直观、跨平台。

- **glob**:既匹配模式又扫描文件系统,返回真实存在的路径
- **fnmatch**:只做字符串模式匹配,不读文件系统(适合已有文件名列表的过滤)

两者用同一套通配符语法:* / ? / [],和 bash 的扩展一致。

## 二、通配符语法

| 通配符 | 含义 | 示例 |
|--------|------|------|
| * | 匹配任意字符(不含路径分隔符) | *.py 匹配 a.py,不匹配 dir/a.py |
| ? | 匹配单个字符 | file?.txt 匹配 file1.txt |
| [seq] | 匹配 seq 中任意字符 | file[123].txt 匹配 file1.txt |
| [!seq] | 匹配不在 seq 中的字符 | file[!0-9].txt 匹配 fileA.txt |
| ** | 递归匹配(需 recursive=True) | **/*.py 匹配任意深度的 .py |

### 通配符 vs 正则表达式对比

| 特性 | shell 通配符 | 正则表达式 |
|------|--------------|------------|
| 任意字符 | * | .* |
| 单个字符 | ? | . |
| 字符集合 | [abc] | [abc] |
| 排除集合 | [!abc] | [^abc] |
| 重复次数 | 不支持 | {n,m} |
| 分组 | 不支持 | (...) |
| 锚点 | 自动全匹配 | ^...$ |
| 学习成本 | 低 | 高 |

**关键区别**:shell 通配符是**全匹配**(整个字符串都要符合),正则是**部分匹配**(只要找到符合的子串)。 所以 \`*.py\` 等价于正则 \`^.*\\.py$\`,而不是 \`.*\\.py\`。

## 三、glob 模块

### demo 1:glob 基本匹配

\`\`\`python
import glob

# 1) 匹配当前目录下所有 .py 文件
py_files = glob.glob("*.py")
print(py_files)  # ['main.py', 'utils.py', ...]

# 2) 匹配指定目录下的 .txt 文件
txt_files = glob.glob("data/*.txt")
print(txt_files)  # ['data/a.txt', 'data/b.txt']

# 3) ? 匹配单个字符
files = glob.glob("log_2023??.txt")  # log_202301.txt, log_202302.txt
print(files)

# 4) [] 字符集合
files = glob.glob("file[0-9].txt")  # file0.txt ~ file9.txt
print(files)

# 5) 多个模式:用多个 glob 调用然后合并
import itertools
all_files = list(itertools.chain(
    glob.glob("*.py"),
    glob.glob("*.txt"),
    glob.glob("*.md")
))
\`\`\`

**详解**:\`glob.glob\` 返回**列表**(可能为空),元素是匹配到的路径字符串。 默认不排序,需要排序用 \`sorted(glob.glob(...))\`。 **重要**:\`*\` 不匹配路径分隔符 \`/\`,所以 \`*.py\` 不会匹配 \`dir/a.py\`。 要匹配子目录的文件,必须显式写路径:\`dir/*.py\`。

### demo 2:glob 递归 **

\`\`\`python
import glob

# recursive=True + ** 实现递归匹配(Python 3.5+)
# ** 匹配任意层级的子目录
all_py = glob.glob("**/*.py", recursive=True)
print(all_py)
# ['main.py', 'utils.py', 'sub/a.py', 'sub/deep/b.py', ...]

# 只匹配顶层和一级子目录的 .py
level1 = glob.glob("*/*.py")  # 不递归,只一层
print(level1)  # ['sub/a.py', 'tests/t.py']

# 匹配所有文件(包括子目录)的常见写法
all_files = glob.glob("**/*", recursive=True)

# 注意:** 单独使用会匹配目录和文件
dirs_only = [f for f in glob.glob("**/", recursive=True)]

# 找出所有 __init__.py(包标记)
init_files = glob.glob("**/__init__.py", recursive=True)
print(f"找到 {len(init_files)} 个 Python 包")
\`\`\`

**详解**:\`recursive=True\` 配合 \`**\` 是 Python 3.5+ 的功能,**之前 \`**\` 退化为 \`*\`,只匹配一层**。 \`**/\` 单独用会匹配所有目录(包括各级子目录)。 **性能提示**:递归匹配大目录可能很慢,IO 是瓶颈,可以考虑用 \`os.walk\` 自己控制遍历逻辑。

### demo 3:iglob 节省内存

\`\`\`python
import glob

# glob.glob 返回完整列表,大目录可能内存爆炸
# glob.iglob 返回迭代器,惰性求值
for path in glob.iglob("**/*.py", recursive=True):
    print(path)
    # 处理每个文件,处理完就丢弃,不占内存

# 转列表:list(glob.iglob("*.py"))
# 计数:sum(1 for _ in glob.iglob("*.py"))

# 适用场景:
# 1) 目录特别大(几万个文件)
# 2) 找到第一个匹配就 break
# 3) 流式处理(逐个上传/复制)
\`\`\`

**详解**:\`iglob\` 是 \`glob\` 的迭代器版本,生成器语义。 大目录扫描时,如果用 \`glob\` 会一次性把所有路径塞进列表,内存占用可能很大。 \`iglob\` 一边扫描一边 yield,内存占用恒定。 唯一缺点:迭代器只能遍历一次,要重用就 \`list()\` 转成列表。

### demo 4:pathlib glob 面向对象版本

\`\`\`python
from pathlib import Path

# Path.glob 返回生成器,语法和 glob 模块一致
p = Path(".")
for f in p.glob("*.py"):
    print(f)  # PosixPath('main.py')

# rglob = glob("**/*") 的简写,递归
for f in p.rglob("*.py"):
    print(f)

# 链式调用,优雅地组合操作
py_files = list(p.rglob("*.py"))
print(f"共 {len(py_files)} 个 .py 文件")

# 配合 Path 的方法,直接处理
for f in p.rglob("*.py"):
    if f.stat().st_size == 0:
        print(f"空文件: {f}")
    elif f.stat().st_size > 100_000:
        print(f"超大文件: {f} ({f.stat().st_size} 字节)")

# Path.glob 也支持 ** 通配符
for f in p.glob("**/*.py"):
    print(f)
\`\`\`

**详解**:\`Path.glob\` 和 \`Path.rglob\` 是 pathlib 提供的面向对象版本。 优点是返回的是 \`Path\` 对象(而不是字符串),可以直接调 \`.stat()\` / \`.read_text()\` / \`.parent\` 等方法,链式操作更优雅。 \`rglob(pattern)\` 等价于 \`glob("**/" + pattern)\`,是常用简写。 现代 Python 代码推荐用 pathlib 替代 glob 模块。

## 四、fnmatch 模块

### demo 5:fnmatch 字符串匹配

\`\`\`python
import fnmatch

# fnmatch.fnmatch(name, pattern):判断 name 是否匹配 pattern
# 不读文件系统,纯字符串操作
print(fnmatch.fnmatch("hello.py", "*.py"))      # True
print(fnmatch.fnmatch("README.md", "*.py"))     # False
print(fnmatch.fnmatch("file1.txt", "file?.txt")) # True
print(fnmatch.fnmatch("a1b.txt", "[abc]?b.txt"))  # True

# 大小写敏感性:
# fnmatch.fnmatch 大小写不敏感(Windows/macOS 默认)
# fnmatch.fnmatchcase 严格大小写敏感(跨平台一致)
print(fnmatch.fnmatch("README.MD", "*.md"))      # Windows:True, Linux:True(默认不敏感)
print(fnmatch.fnmatchcase("README.MD", "*.md"))  # False(M 是大写)

# 适用场景:已有文件名列表,想按模式过滤
files = ["a.py", "b.txt", "c.py", "d.md", "e.py"]
py_files = [f for f in files if fnmatch.fnmatch(f, "*.py")]
print(py_files)  # ['a.py', 'c.py', 'e.py']
\`\`\`

**详解**:\`fnmatch.fnmatch\` 的大小写行为依赖操作系统——Windows 和 macOS 默认不敏感(因为文件系统不敏感),Linux 敏感。 想要跨平台一致的行为,用 \`fnmatchcase\`。 实际开发中,匹配文件名时建议用 \`fnmatchcase\`,避免在不同平台行为不一致。

### demo 6:fnmatch.filter 过滤列表

\`\`\`python
import fnmatch

# fnmatch.filter(names, pattern):返回 names 中匹配的子列表
# 等价于 [n for n in names if fnmatch.fnmatch(n, pattern)]
files = ["a.py", "b.txt", "c.py", "d.md", "e.py", "test_1.py", "test_2.py"]

# 过滤 .py 文件
py_files = fnmatch.filter(files, "*.py")
print(py_files)  # ['a.py', 'c.py', 'e.py', 'test_1.py', 'test_2.py']

# 过滤 test_N.py
test_files = fnmatch.filter(files, "test_[0-9].py")
print(test_files)  # ['test_1.py', 'test_2.py']

# 多模式:分别 filter 再合并,或用 itertools.chain
import itertools
mixed = list(itertools.chain(
    fnmatch.filter(files, "*.py"),
    fnmatch.filter(files, "*.md")
))
print(mixed)
\`\`\`

**详解**:\`fnmatch.filter\` 是 \`fnmatch.fnmatch\` 的批量版本,内部循环优化过,比手写列表推导略快。 **不支持"或"模式**(没有 \`*.py|*.md\` 语法),要多模式得多次调用。 如果经常需要多模式,考虑用正则:

\`\`\`python
import re
pattern = re.compile(r'.*\\.(py|md)$')
mixed = [f for f in files if pattern.match(f)]
\`\`\`

### demo 7:fnmatch.translate 把通配符转成正则

\`\`\`python
import fnmatch
import re

# fnmatch.translate(pattern):把 shell 通配符转成正则表达式字符串
regex_str = fnmatch.translate("*.py")
print(regex_str)  # '(?s:.*\\.py)\\Z'

# 编译成正则对象,可以复用(性能优化)
pattern = re.compile(fnmatch.translate("*.py"))
files = ["a.py", "b.txt", "c.py"]
matches = [f for f in files if pattern.match(f)]
print(matches)  # ['a.py', 'c.py']

# 适用场景:
# 1) 一次翻译,多次匹配(性能优化)
# 2) 想用通配符但又需要正则的特性(如 findall)
# 3) 把通配符"嵌入"到更大的正则中
\`\`\`

**详解**:\`fnmatch.translate\` 是个不太常用但理解原理很重要的函数。 它展示了"通配符本质上是简化版的正则"——通配符先被翻译成正则,再用正则引擎匹配。 这就是为什么 \`*\` 不匹配 \`/\`——翻译出的正则用 \`.*\`,默认不跨行但不阻止 \`/\`(实际上 glob 模块自己会按 \`/\` 切分模式再分别匹配)。 如果想完全理解,可以打印几个 translate 结果看看。

## 五、综合实战 demo

### demo 8:批量重命名文件

\`\`\`python
import glob
import os
from pathlib import Path

# 场景:把所有 IMG_xxxx.JPG 改成小写 .jpg,加上日期前缀
def batch_rename(src_dir):
    """批量重命名照片文件"""
    for path in glob.glob(os.path.join(src_dir, "IMG_*.JPG")):
        p = Path(path)
        # 提取编号
        num = p.stem.split("_")[1]  # IMG_0001 -> 0001
        # 新名字:photo_0001.jpg
        new_name = f"photo_{num}.jpg"
        new_path = p.with_name(new_name)
        # 避免覆盖:如果目标已存在,跳过
        if not new_path.exists():
            p.rename(new_path)
            print(f"{p.name} -> {new_name}")
        else:
            print(f"跳过(已存在): {new_name}")

# batch_rename("./photos")
\`\`\`

**详解**:\`Path.with_name\` 是个常用方法,替换文件名保留目录和后缀。 批量重命名**一定要检查目标是否存在**,否则 \`rename\` 会覆盖已有文件,造成数据丢失。 更安全的做法是先 dry-run 打印将要做的修改,确认无误再执行。

### demo 9:统计各类型文件数量

\`\`\`python
from pathlib import Path
from collections import Counter

def count_by_extension(root):
    """统计每个后缀的文件数量"""
    counter = Counter()
    for f in Path(root).rglob("*"):
        if f.is_file():
            ext = f.suffix.lower()  # .py, .txt, ""(无后缀)
            counter[ext] += 1
    return counter

stats = count_by_extension(".")
for ext, count in stats.most_common():
    print(f"{ext or '(无后缀)'}: {count} 个")
# 输出示例:
# .py: 45 个
# .md: 12 个
# .txt: 8 个
# (无后缀): 3 个
\`\`\`

**详解**:\`Path.suffix\` 返回后缀(含点),无后缀返回空字符串。 \`Counter.most_common()\` 按数量排序,非常方便。 这种"扫描 + 统计"模式在分析项目结构、磁盘占用、代码质量统计时很常用。

### demo 10:找出最近修改的 N 个文件

\`\`\`python
from pathlib import Path
import time

def recently_modified(root, n=10, pattern="*"):
    """找出最近修改的 n 个文件"""
    files = []
    for f in Path(root).rglob(pattern):
        if f.is_file():
            mtime = f.stat().st_mtime
            files.append((mtime, f))
    # 按修改时间倒序(最新在前)
    files.sort(key=lambda x: x[0], reverse=True)
    return files[:n]

for mtime, f in recently_modified(".", n=5, pattern="*.py"):
    t = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(mtime))
    print(f"{t}  {f}")
\`\`\`

**详解**:这是综合 \`rglob\` + \`stat\` 的实战。 关键点是**先收集所有文件,再一次性排序**,而不是边扫描边维护 top-N(除非文件数极多,可以用 \`heapq\` 优化)。 实际开发中,这种"找最近改的文件"功能在监控、备份、调试场景都很有用。

## 六、glob vs os.walk vs pathlib 该用哪个

| 场景 | 推荐 |
|------|------|
| 简单模式匹配 | \`glob.glob\` |
| 递归 + 模式匹配 | \`pathlib.Path.rglob\` |
| 需要精细控制遍历(剪枝) | \`os.walk\` |
| 已有文件名列表要过滤 | \`fnmatch.filter\` |
| 纯字符串模式判断 | \`fnmatch.fnmatch\` |
| 同时要文件属性 | \`pathlib\`(可链式调 .stat()) |
| 极致性能 | \`os.scandir\`(比 walk 快 2-3 倍) |

## 七、性能提示

1. \`glob\` 内部用 \`os.scandir\`(3.5+),性能已经不错
2. 大目录优先 \`iglob\` 或 \`Path.rglob\` 迭代器版本
3. \`os.walk\` 比 \`glob **\` 略快(开销小),但代码更长
4. \`os.scandir\` 是最快的(返回 DirEntry,缓存了 stat 信息)
5. **通配符越具体越快**:\`*.py\` 比 \`*\` 快得多(后者要 stat 每个文件)

\`\`\`python
from pathlib import Path
# 性能对比(伪代码)
import os, time

# 1) glob **(最慢,但代码最短)
t = time.time(); list(Path(".").rglob("*.py")); print(f"rglob: {time.time()-t:.3f}s")

# 2) os.walk(中等)
t = time.time()
for root, dirs, files in os.walk("."):
    for f in files:
        if f.endswith(".py"):
            pass
print(f"walk: {time.time()-t:.3f}s")

# 3) os.scandir 递归(最快,但代码复杂)
\`\`\`

## 八、小结

- \`glob.glob\` / \`iglob\`:基础通配符匹配,后者迭代器省内存
- \`glob **\` + \`recursive=True\`:Python 3.5+ 递归匹配
- \`pathlib.Path.glob\` / \`rglob\`:面向对象版本,推荐使用
- \`fnmatch\`:纯字符串匹配,不读文件系统
- 通配符语法简单(* ? []),适合日常;正则表达式更强大但复杂
- 大目录优先用迭代器版本(\`iglob\` / \`Path.rglob\`)
`,
  },
];
