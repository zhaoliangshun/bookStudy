// =============================================================
// Python 逐层深入教程 - batch7
// 章节 59-70：标准库精讲
//   os/sys / pathlib / datetime / json / re / collections /
//   math / random / typing / dataclasses / logging
// =============================================================

export const chapters = [
  // -----------------------------------------------------------
  // 第 59 章：os 与 sys 深入
  // -----------------------------------------------------------
  {
    id: "py9-59",
    group: "标准库精讲",
    icon: "🖥️",
    title: "os 与 sys：与操作系统打交道",
    content: `## os 与 sys 的分工

- **os**：操作系统相关——文件、目录、环境变量、进程
- **sys**：Python 解释器相关——参数、路径、版本、退出

## os 常用：路径与文件

\`\`\`python
import os
os.getcwd()              # 当前工作目录
os.chdir(path)           # 切换目录
os.listdir(path)         # 列目录
os.mkdir(path)           # 建目录
os.makedirs(path)        # 递归建目录
os.remove(path)          # 删文件
os.rmdir(path)           # 删空目录
os.rename(src, dst)      # 重命名
os.path.exists(path)     # 是否存在
os.path.isfile(path)     # 是不是文件
os.path.isdir(path)      # 是不是目录
os.path.join(a, b)       # 拼接路径（跨平台）
os.path.basename(path)   # 文件名
os.path.dirname(path)    # 目录部分
os.path.splitext(path)   # 分扩展名
\`\`\`

## os.environ：环境变量

\`\`\`python
os.environ.get("HOME")       # 取
os.environ["MY_VAR"] = "x"   # 设
\`\`\`

## sys 常用

\`\`\`python
import sys
sys.argv              # 命令行参数列表
sys.version           # Python 版本
sys.platform          # 平台（'darwin' / 'win32' / 'linux'）
sys.path              # 模块搜索路径
sys.exit(0)           # 退出程序
sys.stdin / stdout / stderr   # 标准输入输出
\`\`\`

## sys.argv 命令行参数

\`\`\`python
# script.py
import sys
print(sys.argv)    # ['script.py', 'arg1', 'arg2']
\`\`\`

\`sys.argv[0]\` 是脚本名，后面是参数。

## os.path vs pathlib

\`os.path\` 是老接口，\`pathlib\` 是新接口（更面向对象）。新代码推荐 pathlib，但 os.path 仍随处可见。

## 本章 demo

demo 演示 os/sys 常用功能。`,
    code: `# ============================================
# 第 59 章：os 与 sys
# ============================================
import os
import sys
import tempfile

# --- 1. os 基本信息 ---
print("=== 1. os 基本信息 ===")
print(f"  当前目录: {os.getcwd()}")
print(f"  CPU 核数: {os.cpu_count()}")
print(f"  进程 PID: {os.getpid()}")
print(f"  当前用户: {os.getlogin()}")
print(f"  分隔符: path='{os.sep}', linesep={os.linesep!r}")

# --- 2. 环境变量 ---
print("\\n=== 2. 环境变量 ===")
for key in ["HOME", "PATH", "SHELL", "USER"]:
    val = os.environ.get(key)
    if val:
        # PATH 太长，截断
        display = val[:50] + "..." if len(val) > 50 else val
        print(f"  {key} = {display}")

# 设环境变量
os.environ["MY_TEST_VAR"] = "hello"
print(f"  设置 MY_TEST_VAR = {os.environ.get('MY_TEST_VAR')}")

# --- 3. 目录操作 ---
print("\\n=== 3. 目录操作 ===")
# 用临时目录演示
tmp_dir = tempfile.mkdtemp()
print(f"  创建临时目录: {tmp_dir}")

# 建子目录
sub = os.path.join(tmp_dir, "sub1", "sub2")
os.makedirs(sub, exist_ok=True)
print(f"  递归建目录: {sub}")

# 列目录
print(f"  listdir: {os.listdir(tmp_dir)}")

# 建几个文件
for name in ["a.txt", "b.txt", "c.log"]:
    path = os.path.join(tmp_dir, name)
    with open(path, "w") as f:
        f.write(name)

print(f"  建文件后 listdir: {os.listdir(tmp_dir)}")

# --- 4. os.path 路径操作 ---
print("\\n=== 4. os.path ===")
path = os.path.join(tmp_dir, "sub1", "sub2", "file.txt")
print(f"  路径: {path}")
print(f"  dirname: {os.path.dirname(path)}")
print(f"  basename: {os.path.basename(path)}")
print(f"  splitext: {os.path.splitext(path)}")
print(f"  exists: {os.path.exists(path)}")
print(f"  exists(tmp_dir): {os.path.exists(tmp_dir)}")
print(f"  isdir(tmp_dir): {os.path.isdir(tmp_dir)}")
print(f"  isfile(tmp_dir/a.txt): {os.path.isfile(os.path.join(tmp_dir, 'a.txt'))}")

# 拆分路径
parts = []
p = path
while True:
    p, name = os.path.split(p)
    if name:
        parts.append(name)
    elif p:
        parts.append(p)
        break
parts.reverse()
print(f"  拆分: {parts}")

# --- 5. 遍历目录 ---
print("\\n=== 5. walk 遍历 ===")
# os.walk 递归遍历
for root, dirs, files in os.walk(tmp_dir):
    rel = os.path.relpath(root, tmp_dir)
    print(f"  目录: {rel}, 文件: {files}")

# --- 6. 文件信息 ---
print("\\n=== 6. 文件信息 ===")
file_path = os.path.join(tmp_dir, "a.txt")
stat = os.stat(file_path)
print(f"  文件: {file_path}")
print(f"  大小: {stat.st_size} 字节")
print(f"  mode: {oct(stat.st_mode)}")
import time
print(f"  修改时间: {time.ctime(stat.st_mtime)}")

# --- 7. 重命名和删除 ---
print("\\n=== 7. 重命名删除 ===")
old = os.path.join(tmp_dir, "a.txt")
new = os.path.join(tmp_dir, "a_renamed.txt")
os.rename(old, new)
print(f"  rename: a.txt → a_renamed.txt")
print(f"  listdir: {os.listdir(tmp_dir)}")

os.remove(os.path.join(tmp_dir, "b.txt"))
print(f"  remove b.txt 后: {os.listdir(tmp_dir)}")

# --- 8. sys 模块 ---
print("\\n=== 8. sys ===")
print(f"  Python 版本: {sys.version}")
print(f"  平台: {sys.platform}")
print(f"  编码: {sys.getdefaultencoding()}")
print(f"  递归限制: {sys.getrecursionlimit()}")
print(f"  argv: {sys.argv}")
print(f"  path 前3: {sys.path[:3]}")

# --- 9. sys.stdin/stdout/stderr ---
print("\\n=== 9. 标准流 ===")
# stdout 就是 print 默认输出
sys.stdout.write("  用 sys.stdout.write 输出\\n")
print("  print 默认到 sys.stdout", file=sys.stdout)
print("  这行到 stderr", file=sys.stderr)

# --- 10. 实用：批量改文件名 ---
print("\\n=== 10. 批量重命名 ===")
# 模拟：在临时目录建一批文件
work = tempfile.mkdtemp()
for i in range(5):
    with open(os.path.join(work, f"img_{i}.png"), "w") as f:
        f.write("")

print(f"  原始: {sorted(os.listdir(work))}")

# 加前缀
for name in os.listdir(work):
    if name.startswith("img_"):
        old_path = os.path.join(work, name)
        new_path = os.path.join(work, "backup_" + name)
        os.rename(old_path, new_path)

print(f"  重命名后: {sorted(os.listdir(work))}")

# 清理
import shutil
shutil.rmtree(tmp_dir)
shutil.rmtree(work)
print("  临时目录已清理")`
  },

  // -----------------------------------------------------------
  // 第 60 章：pathlib
  // -----------------------------------------------------------
  {
    id: "py9-60",
    group: "标准库精讲",
    icon: "📁",
    title: "pathlib：现代路径操作",
    content: `## pathlib 用对象表示路径

\`os.path\` 是字符串操作，\`pathlib\` 把路径封装成对象，更优雅。

\`\`\`python
from pathlib import Path
p = Path(".")
p = Path("/usr/local/bin")
p = Path.home()        # 用户主目录
p = Path.cwd()         # 当前目录
\`\`\`

## 拼接：用 /

pathlib 用 \`/\` 运算符拼接，比 \`os.path.join\` 直观：

\`\`\`python
p = Path.home() / "Documents" / "notes.txt"
\`\`\`

## 常用属性

\`\`\`python
p.name       # 文件名（含扩展）
p.stem       # 文件名（不含扩展）
p.suffix     # 扩展名（.txt）
p.parent     # 父目录
p.parents    # 所有祖先（迭代器）
p.parts      # 路径各部分元组
\`\`\`

## 判断与信息

\`\`\`python
p.exists()       # 是否存在
p.is_file()      # 是不是文件
p.is_dir()       # 是不是目录
p.stat()         # 文件信息
\`\`\`

## 创建与删除

\`\`\`python
p.mkdir()              # 建目录
p.mkdir(parents=True)  # 递归建
p.rmdir()              # 删空目录
p.unlink()             # 删文件
p.touch()              # 建空文件
\`\`\`

## 读写文件（一行搞定）

\`\`\`python
p.read_text(encoding="utf-8")     # 读文本
p.write_text("content")           # 写文本
p.read_bytes()                    # 读字节
p.write_bytes(b"data")            # 写字节
\`\`\`

## glob 模式匹配

\`\`\`python
p.glob("*.txt")          # 当前层所有 txt
p.rglob("*.py")          # 递归所有 py
p.glob("**/*.txt")       # 同 rglob
\`\`\`

## 遍历

\`\`\`python
for f in p.iterdir():     # 列出所有
    print(f)
\`\`\`

## 本章 demo

demo 对比 pathlib vs os.path，演示路径操作。`,
    code: `# ============================================
# 第 60 章：pathlib
# ============================================
from pathlib import Path
import tempfile

# --- 1. 创建 Path ---
print("=== 1. 创建 Path ===")
p1 = Path(".")
p2 = Path("/usr/local/bin/python3")
p3 = Path.home()
p4 = Path.cwd()
print(f"  Path('.'): {p1}")
print(f"  Path.home(): {p3}")
print(f"  Path.cwd(): {p4}")
print(f"  类型: {type(p1).__name__}")

# --- 2. / 拼接 ---
print("\\n=== 2. / 拼接 ===")
p = Path.home() / "Documents" / "notes.txt"
print(f"  Path.home() / 'Documents' / 'notes.txt' = {p}")
# 也能用 joinpath
p2 = Path("/tmp").joinpath("a", "b", "c.txt")
print(f"  joinpath: {p2}")

# --- 3. 属性 ---
print("\\n=== 3. 属性 ===")
p = Path("/Users/xm/Documents/notes.txt")
print(f"  路径: {p}")
print(f"  name: {p.name}            ← 文件名")
print(f"  stem: {p.stem}            ← 不含扩展")
print(f"  suffix: {p.suffix}        ← 扩展")
print(f"  suffixes: {p.suffixes}")
print(f"  parent: {p.parent}        ← 父目录")
print(f"  parents: {[str(x) for x in p.parents]}")
print(f"  parts: {p.parts}")

# --- 4. 判断和信息 ---
print("\\n=== 4. 判断 ===")
print(f"  Path.cwd().exists(): {Path.cwd().exists()}")
print(f"  Path.cwd().is_dir(): {Path.cwd().is_dir()}")
print(f"  Path.cwd().is_absolute(): {Path.cwd().is_absolute()}")
# stat
stat = Path(".").stat()
print(f"  stat: 大小 mode={oct(stat.st_mode)}")

# --- 5. 实战：建临时目录和文件 ---
print("\\n=== 5. 创建删除 ===")
tmp = Path(tempfile.mkdtemp())
print(f"  临时目录: {tmp}")

# touch 建空文件
f1 = tmp / "a.txt"
f1.touch()
print(f"  touch a.txt: exists={f1.exists()}, size={f1.stat().st_size}")

# write_text / read_text
f1.write_text("你好，pathlib", encoding="utf-8")
content = f1.read_text(encoding="utf-8")
print(f"  write/read: {content!r}")

# read_bytes
print(f"  read_bytes: {f1.read_bytes()!r}")

# mkdir
sub = tmp / "sub" / "deep"
sub.mkdir(parents=True, exist_ok=True)
print(f"  mkdir parents: {sub.exists()}")

# --- 6. iterdir 列出 ---
print("\\n=== 6. iterdir ===")
# 多建几个文件
for name in ["b.txt", "c.log", "d.py", "e.txt"]:
    (tmp / name).write_text("")
for sub_name in ["x.txt", "y.py"]:
    (sub / sub_name).write_text("")

print(f"  tmp 下:")
for item in tmp.iterdir():
    kind = "目录" if item.is_dir() else "文件"
    print(f"    [{kind}] {item.name}")

# --- 7. glob 模式匹配 ---
print("\\n=== 7. glob ===")
print(f"  *.txt:")
for f in tmp.glob("*.txt"):
    print(f"    {f.name}")
print(f"  *.py 或 *.log:")
for f in tmp.glob("*.*"):
    if f.suffix in (".py", ".log"):
        print(f"    {f.name}")

# rglob 递归
print(f"  rglob('*.py') 所有 py:")
for f in tmp.rglob("*.py"):
    rel = f.relative_to(tmp)
    print(f"    {rel}")

# --- 8. 重命名 ---
print("\\n=== 8. 重命名 ===")
old = tmp / "a.txt"
new = tmp / "a_renamed.txt"
old.rename(new)
print(f"  rename: a.txt → a_renamed.txt")
print(f"  exists a.txt: {old.exists()}")
print(f"  exists a_renamed.txt: {new.exists()}")

# --- 9. with_name / with_suffix ---
print("\\n=== 9. 替换部分 ===")
p = Path("/data/img/photo.jpg")
print(f"  原始: {p}")
print(f"  with_name('new.png'): {p.with_name('new.png')}")
print(f"  with_suffix('.png'): {p.with_suffix('.png')}")
print(f"  with_stem('backup'): {p.with_stem('backup')}")
print(f"  原始不变: {p}    ← 返回新 Path")

# --- 10. 对比 os.path ---
print("\\n=== 10. 对比 os.path ===")
import os
p_str = "/usr/local/bin/python3"

# os.path 写法
print("  os.path 写法:")
print(f"    basename: {os.path.basename(p_str)}")
print(f"    dirname: {os.path.dirname(p_str)}")
print(f"    splitext: {os.path.splitext(p_str)}")
print(f"    join: {os.path.join('/usr', 'local', 'bin')}")

# pathlib 写法
p = Path(p_str)
print("  pathlib 写法:")
print(f"    name: {p.name}")
print(f"    parent: {p.parent}")
print(f"    suffix: {p.suffix}")
print(f"    /: {Path('/usr') / 'local' / 'bin'}")

# 清理
import shutil
shutil.rmtree(tmp)
print("\\n  临时目录已清理")`
  },

  // -----------------------------------------------------------
  // 第 61 章：datetime
  // -----------------------------------------------------------
  {
    id: "py9-61",
    group: "标准库精讲",
    icon: "🕐",
    title: "datetime：时间日期处理",
    content: `## datetime 四个核心类

- **date**：日期（年月日）
- **time**：时间（时分秒微秒）
- **datetime**：日期 + 时间
- **timedelta**：时间差

\`\`\`python
from datetime import date, time, datetime, timedelta
\`\`\`

## 创建

\`\`\`python
date.today()                  # 今天
datetime.now()                # 现在（本地）
datetime.now().date()         # 今天的日期部分
date(2024, 1, 1)              # 指定日期
datetime(2024, 1, 1, 12, 0)   # 指定日期时间
\`\`\`

## 格式化：strftime

\`\`\`python
datetime.now().strftime("%Y-%m-%d %H:%M:%S")   # "2024-01-15 10:30:00"
datetime.now().strftime("%Y年%m月%d日")          # "2024年01月15日"
\`\`\`

常用格式符：
- %Y 年（4位） / %m 月 / %d 日
- %H 时（24） / %M 分 / %S 秒
- %A 星期名 / %a 简写
- %B 月名 / %b 简写
- %w 星期数字（0=周日）

## 解析：strptime

\`\`\`python
datetime.strptime("2024-01-15", "%Y-%m-%d")    # 字符串 → datetime
\`\`\`

格式必须和字符串匹配，否则报错。

## 时间差 timedelta

\`\`\`python
from datetime import timedelta
delta = timedelta(days=7)
now + delta            # 一周后
now - delta            # 一周前
\`\`\`

两个日期相减得到 timedelta：

\`\`\`python
(date(2024, 12, 31) - date(2024, 1, 1)).days    # 365
\`\`\`

## 时间戳

\`\`\`python
import time
time.time()                       # 当前时间戳（秒）
datetime.fromtimestamp(ts)        # 时间戳 → datetime
datetime.now().timestamp()        # datetime → 时间戳
\`\`\`

## 本章 demo

demo 演示日期创建、格式化、计算、时间戳。`,
    code: `# ============================================
# 第 61 章：datetime
# ============================================
from datetime import date, time, datetime, timedelta
import time as time_mod

# --- 1. 创建 ---
print("=== 1. 创建 ===")
today = date.today()
now = datetime.now()
print(f"  date.today(): {today}")
print(f"  datetime.now(): {now}")
print(f"  now.date(): {now.date()}")
print(f"  now.time(): {now.time()}")

# 指定日期
d = date(2024, 1, 1)
dt = datetime(2024, 1, 1, 12, 30, 45)
print(f"  date(2024,1,1): {d}")
print(f"  datetime(2024,1,1,12,30,45): {dt}")

# 各字段
print(f"  年: {now.year}, 月: {now.month}, 日: {now.day}")
print(f"  时: {now.hour}, 分: {now.minute}, 秒: {now.second}")
print(f"  微秒: {now.microsecond}")
print(f"  星期: {now.weekday()} (0=周一)") 
print(f"  isoweekday: {now.isoweekday()} (1=周一)")

# --- 2. 格式化 ---
print("\\n=== 2. 格式化 strftime ===")
now = datetime.now()
print(f"  默认: {now.strftime('%Y-%m-%d %H:%M:%S')}")
print(f"  日期: {now.strftime('%Y/%m/%d')}")
print(f"  时间: {now.strftime('%H:%M:%S')}")
print(f"  中文: {now.strftime('%Y年%m月%d日 %H时%M分%S秒')}")
print(f"  星期: {now.strftime('%A')}")
print(f"  月份: {now.strftime('%B')}")
print(f"  上午下午: {now.strftime('%p')}")

# 自定义格式
formats = [
    ("%Y-%m-%d", "ISO 日期"),
    ("%Y/%m/%d %H:%M", "斜杠日期"),
    ("%d-%b-%Y", "短月名"),
    ("%Y%m%d", "紧凑"),
    ("%H:%M:%S", "时间"),
    ("%j", "一年中第几天"),
]
for fmt, desc in formats:
    print(f"  {desc}: {now.strftime(fmt)}")

# --- 3. 解析 strptime ---
print("\\n=== 3. 解析 strptime ===")
s = "2024-01-15 10:30:00"
dt = datetime.strptime(s, "%Y-%m-%d %H:%M:%S")
print(f"  '{s}' → {dt}, 类型 {type(dt).__name__}")

s2 = "2024/01/15"
dt2 = datetime.strptime(s2, "%Y/%m/%d").date()
print(f"  '{s2}' → {dt2}")

s3 = "15-Jan-2024"
dt3 = datetime.strptime(s3, "%d-%b-%Y").date()
print(f"  '{s3}' → {dt3}")

# 格式不匹配会报错
try:
    datetime.strptime("2024-01-15", "%Y/%m/%d")
except ValueError as e:
    print(f"  格式不匹配: {e}")

# --- 4. timedelta 时间差 ---
print("\\n=== 4. timedelta ===")
now = datetime.now()
delta = timedelta(days=7)
print(f"  现在: {now.strftime('%Y-%m-%d')}")
print(f"  7天后: {(now + delta).strftime('%Y-%m-%d')}")
print(f"  7天前: {(now - delta).strftime('%Y-%m-%d')}")

# 各种单位（用元组配标签，timedelta 没有 label 参数）
deltas = [
    ("1天", timedelta(days=1)),
    ("12小时", timedelta(hours=12)),
    ("30分", timedelta(minutes=30)),
    ("1.5秒", timedelta(seconds=1.5)),
]
for label, d in deltas:
    print(f"  {label}: {d}")

# 相减得到 timedelta
d1 = date(2024, 12, 31)
d2 = date(2024, 1, 1)
diff = d1 - d2
print(f"  {d1} - {d2} = {diff}")
print(f"  天数: {diff.days}")

# timedelta 运算
print(f"  timedelta(days=1) + timedelta(hours=12) = {timedelta(days=1) + timedelta(hours=12)}")
print(f"  timedelta(days=7) * 2 = {timedelta(days=7) * 2}")
print(f"  timedelta(days=7) / 7 = {timedelta(days=7) / 7}")

# --- 5. 日期比较 ---
print("\\n=== 5. 比较 ===")
d1 = date(2024, 1, 1)
d2 = date(2024, 6, 1)
print(f"  {d1} < {d2}: {d1 < d2}")
print(f"  {d1} == date(2024,1,1): {d1 == date(2024, 1, 1)}")

# 排序
dates = [date(2024, 3, 1), date(2024, 1, 1), date(2024, 2, 1)]
print(f"  原始: {dates}")
print(f"  排序: {sorted(dates)}")

# --- 6. 时间戳 ---
print("\\n=== 6. 时间戳 ===")
ts = time_mod.time()
print(f"  time.time(): {ts:.2f}    ← 秒")
dt_from_ts = datetime.fromtimestamp(ts)
print(f"  fromtimestamp: {dt_from_ts.strftime('%Y-%m-%d %H:%M:%S')}")

# datetime → 时间戳
now = datetime.now()
ts2 = now.timestamp()
print(f"  datetime.timestamp(): {ts2:.2f}")

# --- 7. 实用：年龄计算 ---
print("\\n=== 7. 年龄计算 ===")
def age(birth_date):
    """根据生日算年龄"""
    today = date.today()
    years = today.year - birth_date.year
    # 如果今年生日还没到，减1
    if (today.month, today.day) < (birth_date.month, birth_date.day):
        years -= 1
    return years

birth = date(2000, 6, 15)
print(f"  生日 {birth} → 年龄 {age(birth)}")

# --- 8. 实用：本月最后一天 ---
print("\\n=== 8. 月末 ===")
def last_day_of_month(year, month):
    """某月最后一天"""
    if month == 12:
        next_month = date(year + 1, 1, 1)
    else:
        next_month = date(year, month + 1, 1)
    return next_month - timedelta(days=1)

for m in [1, 2, 4, 12]:
    print(f"  2024年{m}月最后一天: {last_day_of_month(2024, m)}")

# --- 9. 实用：工作日判断 ---
print("\\n=== 9. 工作日 ===")
def is_weekday(d):
    """是不是工作日"""
    return d.weekday() < 5    # 0-4 是周一到周五

today = date.today()
print(f"  今天 {today} ({today.strftime('%A')})")
print(f"  是工作日: {is_weekday(today)}")

# 列出本周
today = date.today()
monday = today - timedelta(days=today.weekday())
print(f"  本周:")
for i in range(7):
    d = monday + timedelta(days=i)
    mark = "工作日" if is_weekday(d) else "周末"
    print(f"    {d} {d.strftime('%A')} ({mark})")

# --- 10. 实用：倒计时 ---
print("\\n=== 10. 倒计时 ===")
def countdown(target_date):
    """距离目标日期还有几天"""
    today = date.today()
    delta = target_date - today
    return delta.days

new_year = date(2025, 1, 1)
print(f"  距离 {new_year}: {countdown(new_year)} 天")`
  },

  // -----------------------------------------------------------
  // 第 62 章：json
  // -----------------------------------------------------------
  {
    id: "py9-62",
    group: "标准库精讲",
    icon: "📄",
    title: "json 与序列化",
    content: `## JSON 是什么

JSON（JavaScript Object Notation）是通用的数据交换格式。Python 用 \`json\` 模块处理。

\`\`\`python
import json
\`\`\`

## Python 类型与 JSON 对应

| Python | JSON |
|---|---|
| dict | object {} |
| list, tuple | array [] |
| str | string |
| int, float | number |
| True/False | true/false |
| None | null |

## 序列化：dumps

\`\`\`python
data = {"name": "小明", "age": 18}
s = json.dumps(data)              # 字典 → JSON 字符串
s = json.dumps(data, ensure_ascii=False)  # 中文不转义
s = json.dumps(data, indent=2)    # 美化缩进
\`\`\`

## 反序列化：loads

\`\`\`python
data = json.loads(s)              # JSON 字符串 → 字典
\`\`\`

## 文件读写

\`\`\`python
with open("data.json", "w") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

with open("data.json") as f:
    data = json.load(f)
\`\`\`

## 处理自定义对象

JSON 默认只认基本类型。要序列化对象，需提供转换函数：

\`\`\`python
class Point:
    def __init__(self, x, y): ...

json.dumps(p, default=lambda o: o.__dict__)
\`\`\`

## 常见错误

- \`TypeError: Object of type ... is not JSON serializable\`：用了不支持的类型（如 datetime）
- \`json.decoder.JSONDecodeError\`：JSON 字符串格式错误

## 本章 demo

demo 演示序列化、反序列化、文件读写、自定义对象。`,
    code: `# ============================================
# 第 62 章：json
# ============================================
import json
import tempfile
import os

# --- 1. 基本序列化 ---
print("=== 1. dumps 序列化 ===")
data = {
    "name": "小明",
    "age": 18,
    "scores": [90, 85, 88],
    "active": True,
    "nickname": None,
}

s = json.dumps(data)
print(f"  默认: {s}")

# 中文转义问题
print(f"  ensure_ascii=True (默认): {s}")
s_cn = json.dumps(data, ensure_ascii=False)
print(f"  ensure_ascii=False: {s_cn}    ← 中文正常显示")

# 美化
s_pretty = json.dumps(data, ensure_ascii=False, indent=2)
print(f"  indent=2:")
print(s_pretty)

# 排序键
s_sorted = json.dumps(data, ensure_ascii=False, sort_keys=True)
print(f"  sort_keys: {s_sorted}")

# --- 2. 反序列化 ---
print("\\n=== 2. loads 反序列化 ===")
s = '{"name": "小红", "age": 20, "scores": [95, 92, 90]}'
data = json.loads(s)
print(f"  字符串: {s}")
print(f"  解析: {data}")
print(f"  类型: {type(data).__name__}")
print(f"  name: {data['name']}")
print(f"  scores 类型: {type(data['scores']).__name__}")

# --- 3. 各种类型 ---
print("\\n=== 3. 类型映射 ===")
types_demo = {
    "字符串": "hello",
    "数字": 42,
    "浮点": 3.14,
    "布尔": True,
    "None": None,
    "列表": [1, 2, 3],
    "字典": {"a": 1},
}
s = json.dumps(types_demo, ensure_ascii=False)
print(f"  原始: {types_demo}")
print(f"  JSON: {s}")
back = json.loads(s)
print(f"  往返: {back}")

# tuple → JSON array
t = (1, 2, 3)
s = json.dumps(t)
print(f"  tuple {t} → JSON: {s}")
back = json.loads(s)
print(f"  解析回来: {back}, 类型 {type(back).__name__}    ← 变 list 了")

# --- 4. 文件读写 ---
print("\\n=== 4. 文件读写 ===")
data = {
    "students": [
        {"name": "小明", "score": 90},
        {"name": "小红", "score": 85},
    ],
    "class": "高三1班",
}

path = tempfile.mktemp(suffix=".json")
# 写
with open(path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print(f"  写入 {path}")

# 看文件内容
with open(path, "r", encoding="utf-8") as f:
    print(f"  文件内容:")
    print(f.read())

# 读
with open(path, "r", encoding="utf-8") as f:
    loaded = json.load(f)
print(f"  读取: {loaded}")
print(f"  类型: {type(loaded).__name__}")
os.unlink(path)

# --- 5. 嵌套数据 ---
print("\\n=== 5. 嵌套 ===")
nested = {
    "company": "ACME",
    "departments": [
        {
            "name": "技术部",
            "employees": [
                {"name": "张三", "skills": ["Python", "Go"]},
                {"name": "李四", "skills": ["Java", "SQL"]},
            ]
        },
        {
            "name": "市场部",
            "employees": [
                {"name": "王五", "skills": ["营销", "文案"]},
            ]
        }
    ]
}

s = json.dumps(nested, ensure_ascii=False, indent=2)
print("  嵌套 JSON:")
print(s[:200] + "...")

# 访问
print(f"  技术部第一名员工: {nested['departments'][0]['employees'][0]['name']}")
print(f"  他的技能: {nested['departments'][0]['employees'][0]['skills']}")

# --- 6. 错误处理 ---
print("\\n=== 6. 错误处理 ===")
bad_jsons = [
    "{'name': '小红'}",          # 单引号
    '{"name": "小红"',           # 缺右括号
    '{"name": "小红",}',         # 尾随逗号
    'not json',
]
for bad in bad_jsons:
    try:
        json.loads(bad)
        print(f"  '{bad}' → 成功")
    except json.JSONDecodeError as e:
        print(f"  '{bad}' → 错误: {e.msg}")

# --- 7. 自定义对象 ---
print("\\n=== 7. 自定义对象 ===")
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def __repr__(self):
        return f"Point({self.x}, {self.y})"

p = Point(3, 4)
# 直接 dumps 会报错
try:
    json.dumps(p)
except TypeError as e:
    print(f"  默认: {e}")

# 用 default 转换
def point_to_dict(obj):
    if isinstance(obj, Point):
        return {"x": obj.x, "y": obj.y}
    raise TypeError(f"不支持的类型: {type(obj)}")

s = json.dumps(p, default=point_to_dict, ensure_ascii=False)
print(f"  default 转换: {s}")

# 通用：用 __dict__
s2 = json.dumps(p, default=lambda o: o.__dict__, ensure_ascii=False)
print(f"  __dict__: {s2}")

# 反向：解析成对象
def dict_to_point(d):
    if "x" in d and "y" in d:
        return Point(d["x"], d["y"])
    return d

p_back = json.loads(s, object_hook=dict_to_point)
print(f"  object_hook 解析: {p_back}, 类型 {type(p_back).__name__}")

# --- 8. datetime 处理 ---
print("\\n=== 8. datetime ===")
from datetime import datetime
data = {"time": datetime.now()}
# datetime 不可序列化
try:
    json.dumps(data)
except TypeError as e:
    print(f"  错误: {e}")

# 解决：转字符串
def json_default(obj):
    if isinstance(obj, datetime):
        return obj.strftime("%Y-%m-%d %H:%M:%S")
    raise TypeError

s = json.dumps(data, default=json_default, ensure_ascii=False)
print(f"  自定义: {s}")

# --- 9. 实用：配置文件 ---
print("\\n=== 9. 配置文件 ===")
config = {
    "database": {
        "host": "localhost",
        "port": 5432,
        "name": "mydb",
    },
    "server": {
        "host": "0.0.0.0",
        "port": 8080,
        "debug": True,
    },
    "log_level": "INFO",
}

path = tempfile.mktemp(suffix=".json")
with open(path, "w", encoding="utf-8") as f:
    json.dump(config, f, ensure_ascii=False, indent=2)

# 读取并使用
with open(path, "r", encoding="utf-8") as f:
    cfg = json.load(f)

print(f"  数据库: {cfg['database']['host']}:{cfg['database']['port']}")
print(f"  服务器: {cfg['server']['host']}:{cfg['server']['port']}")
print(f"  调试: {cfg['server']['debug']}")
print(f"  日志级别: {cfg['log_level']}")
os.unlink(path)

# --- 10. JSON 性能 ---
print("\\n=== 10. 性能 ===")
import time
big_data = [{"id": i, "name": f"item_{i}", "value": i * 1.5} for i in range(10000)]

start = time.time()
s = json.dumps(big_data)
t_dump = time.time() - start

start = time.time()
back = json.loads(s)
t_load = time.time() - start

print(f"  10000 条数据:")
print(f"  序列化: {t_dump:.4f}s, 大小 {len(s):,} 字节")
print(f"  反序列化: {t_load:.4f}s")
print(f"  往返一致: {back == big_data}")`
  },

  // -----------------------------------------------------------
  // 第 63 章：re 正则
  // -----------------------------------------------------------
  {
    id: "py9-63",
    group: "标准库精讲",
    icon: "🔤",
    title: "re：正则表达式",
    content: `## 正则是什么

正则表达式（regular expression）是描述字符串模式的"小语言"。比如：

- \`\\d+\` 匹配一串数字
- \`[a-z]+@\\w+\\.com\` 匹配简单邮箱

\`\`\`python
import re
\`\`\`

## 基本函数

\`\`\`python
re.match(pattern, string)     # 从开头匹配
re.search(pattern, string)    # 搜索任意位置（第一个）
re.findall(pattern, string)   # 找所有
re.finditer(pattern, string)  # 找所有（迭代器）
re.sub(pattern, repl, string) # 替换
re.split(pattern, string)     # 分割
\`\`\`

## 字符类

| 模式 | 含义 |
|---|---|
| \\d | 数字 0-9 |
| \\D | 非数字 |
| \\w | 字母数字下划线 |
| \\W | 非 \\w |
| \\s | 空白（空格、tab、换行）|
| \\S | 非空白 |
| . | 任意字符（不含换行）|

## 量词

| 模式 | 含义 |
|---|---|
| * | 0 次或多次 |
| + | 1 次或多次 |
| ? | 0 次或 1 次 |
| {n} | 恰好 n 次 |
| {n,m} | n 到 m 次 |

## 锚点

| 模式 | 含义 |
|---|---|
| ^ | 开头 |
| $ | 结尾 |
| \\b | 单词边界 |

## 分组与捕获

\`\`\`python
m = re.match(r"(\\d+)-(\\d+)", "123-456")
m.group(0)    # "123-456" 整个匹配
m.group(1)    # "123" 第1组
m.group(2)    # "456" 第2组
\`\`\`

## 命名分组

\`\`\`python
m = re.match(r"(?P<year>\\d+)-(?P<month>\\d+)", "2024-01")
m.group("year")    # "2024"
\`\`\`

## 预编译

\`\`\`python
pattern = re.compile(r"\\d+")
pattern.findall("a1b22c333")    # ['1', '22', '333']
\`\`\`

多次用同一个正则，预编译更快。

## 本章 demo

demo 演示常用正则操作。`,
    code: `# ============================================
# 第 63 章：re 正则表达式
# ============================================
import re

# --- 1. 基础匹配 ---
print("=== 1. 基础 ===")
# match 从开头匹配
m = re.match(r"hello", "hello world")
print(f"  match('hello', 'hello world'): {m}")
print(f"  group: {m.group()}, span: {m.span()}")

# match 必须从头开始
m = re.match(r"world", "hello world")
print(f"  match('world', 'hello world'): {m}    ← 从开头匹配不上")

# search 搜索任意位置
m = re.search(r"world", "hello world")
print(f"  search('world', 'hello world'): {m.group()}")

# --- 2. 字符类 ---
print("\\n=== 2. 字符类 ===")
text = "abc 123 XYZ !@#"
print(f"  文本: {text!r}")
print(f"  \\d+: {re.findall(r'\\d+', text)}        ← 数字")
print(f"  \\D+: {re.findall(r'\\D+', text)}        ← 非数字")
print(f"  \\w+: {re.findall(r'\\w+', text)}        ← 字母数字下划线")
print(f"  \\W+: {re.findall(r'\\W+', text)}        ← 非字母数字下划线")
print(f"  \\s+: {re.findall(r'\\s+', text)}        ← 空白")
print(f"  [a-z]+: {re.findall(r'[a-z]+', text)}   ← 小写字母")
print(f"  [A-Z]+: {re.findall(r'[A-Z]+', text)}   ← 大写字母")
print(f"  [a-zA-Z]+: {re.findall(r'[a-zA-Z]+', text)}  ← 所有字母")
print(f"  [^a-z ]+: {re.findall(r'[^a-z ]+', text)}    ← 不是小写和空格")

# --- 3. 量词 ---
print("\\n=== 3. 量词 ===")
text = "a aa aaa aaaa aaaaa"
print(f"  文本: {text}")
print(f"  a*: {re.findall(r'a*', text)}    ← 0个或多个")
print(f"  a+: {re.findall(r'a+', text)}    ← 1个或多个")
print(f"  a?: {re.findall(r'a?', text)}    ← 0或1个")
print(f"  a{{3}}: {re.findall(r'a{3}', text)}    ← 恰好3个")
print(f"  a{{2,3}}: {re.findall(r'a{2,3}', text)}    ← 2到3个")
print(f"  a{{2,}}: {re.findall(r'a{2,}', text)}    ← 至少2个")

# 贪婪 vs 非贪婪
print("\\n  贪婪 vs 非贪婪:")
html = "<b>粗体</b><i>斜体</i>"
greedy = re.findall(r"<.+>", html)
lazy = re.findall(r"<.+?>", html)
print(f"    贪婪 <.+>: {greedy}    ← 一次匹配到末尾")
print(f"    非贪婪 <.+?>: {lazy}    ← 最短匹配")

# --- 4. 锚点 ---
print("\\n=== 4. 锚点 ===")
texts = ["hello world", "world hello", "say hello"]
print(f"  '^hello': {[t for t in texts if re.match(r'^hello', t)]}    ← 开头")
print(f"  'hello$': {[t for t in texts if re.search(r'hello$', t)]}    ← 结尾")

# 单词边界
text = "cat category catch cat"
print(f"  文本: {text}")
print(f"  'cat': {re.findall(r'cat', text)}    ← 所有含 cat")
print(f"  '\\\\bcat\\\\b': {re.findall(r'\\bcat\\b', text)}    ← 完整单词 cat")

# --- 5. 分组 ---
print("\\n=== 5. 分组 ===")
date_str = "2024-01-15"
m = re.match(r"(\\d+)-(\\d+)-(\\d+)", date_str)
print(f"  '{date_str}'")
print(f"  group(0) 整个: {m.group(0)}")
print(f"  group(1) 年: {m.group(1)}")
print(f"  group(2) 月: {m.group(2)}")
print(f"  group(3) 日: {m.group(3)}")
print(f"  groups: {m.groups()}")

# 命名分组
m = re.match(r"(?P<year>\\d+)-(?P<month>\\d+)-(?P<day>\\d+)", date_str)
print(f"  命名分组:")
print(f"    year: {m.group('year')}")
print(f"    month: {m.group('month')}")
print(f"    day: {m.group('day')}")
print(f"    groupdict: {m.groupdict()}")

# --- 6. findall 与分组 ---
print("\\n=== 6. findall 分组 ===")
text = "电话: 138-1234-5678, 139-8765-4321"
# 无分组：返回匹配字符串
phones = re.findall(r"\\d{3}-\\d{4}-\\d{4}", text)
print(f"  无分组: {phones}")

# 一个分组：返回组内容
area_codes = re.findall(r"(\\d{3})-\\d{4}-\\d{4}", text)
print(f"  一个分组: {area_codes}")

# 多个分组：返回元组
parts = re.findall(r"(\\d{3})-(\\d{4})-(\\d{4})", text)
print(f"  多个分组: {parts}")

# --- 7. 替换 ---
print("\\n=== 7. sub 替换 ===")
text = "我的电话是 138-1234-5678，请保密"
masked = re.sub(r"\\d{4}", "XXXX", text)
print(f"  原文: {text}")
print(f"  替换4位数字: {masked}")

# 用回调函数替换
def mask_phone(m):
    """保留前3后4，中间掩码"""
    return f"{m.group(1)}-****-{m.group(3)}"

text = "电话: 138-1234-5678 或 139-8765-4321"
masked = re.sub(r"(\\d{3})-(\\d{4})-(\\d{4})", mask_phone, text)
print(f"  回调替换: {masked}")

# 引用分组
text = "hello world"
result = re.sub(r"(\\w+) (\\w+)", r"\\2 \\1", text)
print(f"  引用分组: '{text}' → '{result}'")

# --- 8. 分割 ---
print("\\n=== 8. split ===")
text = "a,b,,c"
print(f"  普通分割: {text.split(',')}")

text = "a, b;;c , d"
parts = re.split(r"[,;\\s]+", text.strip())
print(f"  多分隔符: {parts}")

# 保留分隔符
text = "2024-01-15"
parts = re.split(r"(-)", text)
print(f"  保留分隔符: {parts}")

# --- 9. 预编译 ---
print("\\n=== 9. 预编译 ===")
email_pattern = re.compile(r"[\\w.+-]+@[\\w-]+\\.[\\w.]+")
texts = [
    "联系我: alice@example.com",
    "邮箱 bob@work.cn 已验证",
    "无邮箱",
]
print("  预编译后多次使用:")
for t in texts:
    m = email_pattern.search(t)
    if m:
        print(f"    '{t}' → {m.group()}")
    else:
        print(f"    '{t}' → 无匹配")

# --- 10. 实用正则 ---
print("\\n=== 10. 实用 ===")

# 邮箱
emails = ["user@example.com", "a@b", "name.surname@site.co.uk", "nope"]
email_re = r"^[\\w.+-]+@[\\w-]+(\\.[\\w-]+)+$"
for e in emails:
    print(f"  邮箱 '{e}': {bool(re.match(email_re, e))}")

# URL
url_re = r"https?://[\\w.-]+(?:/[\\w./-]*)?"
text = "访问 https://example.com 或 http://docs.python.org/3/library"
print(f"  URL: {re.findall(url_re, text)}")

# IP 地址
ip_re = r"\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b"
text = "服务器 192.168.1.1 和 10.0.0.1"
print(f"  IP: {re.findall(ip_re, text)}")

# 中文字符
cn_re = r"[\\u4e00-\\u9fa5]+"
text = "Hello 世界，Python 编程"
print(f"  中文: {re.findall(cn_re, text)}")

# 提取数字（整数和小数）
num_re = r"-?\\d+(?:\\.\\d+)?"
text = "温度 -5.5 度，价格 99 元，整数 42"
print(f"  数字: {re.findall(num_re, text)}")`
  },

  // -----------------------------------------------------------
  // 第 64 章：collections
  // -----------------------------------------------------------
  {
    id: "py9-64",
    group: "标准库精讲",
    icon: "📚",
    title: "collections：高级容器",
    content: `## collections 提供更强容器

\`\`\`python
from collections import Counter, defaultdict, deque, OrderedDict, namedtuple, ChainMap
\`\`\`

## Counter：计数器

\`\`\`python
from collections import Counter
c = Counter("aabbbcccc")
c                # Counter({'c': 4, 'b': 3, 'a': 2})
c.most_common(2) # [('c', 4), ('b', 3)]
c['a']           # 2
\`\`\`

## defaultdict：默认值字典

\`\`\`python
from collections import defaultdict
d = defaultdict(list)    # 默认值是空列表
d['a'].append(1)         # 'a' 不存在自动建 []
d['a'].append(2)
d['a']                   # [1, 2]
\`\`\`

省去"判断 key 在不在"的麻烦。

## deque：双端队列

\`\`\`python
from collections import deque
dq = deque([1, 2, 3])
dq.appendleft(0)     # 左边加
dq.append(4)         # 右边加
dq.popleft()         # 左边删
dq.pop()             # 右边删
\`\`\`

列表头尾都加删，用 deque（O(1)），不要用 list（头部操作 O(n)）。

## namedtuple：具名元组

\`\`\`python
from collections import namedtuple
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
p.x    # 3
p.y    # 4
p[0]   # 3（也能用下标）
\`\`\`

像类，但不可变、省内存。

## OrderedDict

Python 3.7+ 普通 dict 已经有序，OrderedDict 用得少了。它额外支持：
- \`move_to_end(key)\`：移动到首/尾
- \`popitem(last=True)\`：弹出首/尾

## ChainMap：串联字典

\`\`\`python
from collections import ChainMap
defaults = {"color": "black", "size": "M"}
user = {"color": "red"}
cm = ChainMap(user, defaults)
cm["color"]    # "red"（先查 user）
cm["size"]     # "M"（user 没有，查 defaults）
\`\`\`

## 本章 demo

demo 演示每个容器的用法。`,
    code: `# ============================================
# 第 64 章：collections
# ============================================
from collections import Counter, defaultdict, deque, OrderedDict, namedtuple, ChainMap

# --- 1. Counter 计数器 ---
print("=== 1. Counter ===")
# 字符计数
c = Counter("abracadabra")
print(f"  Counter('abracadabra'): {dict(c)}")
print(f"  most_common(3): {c.most_common(3)}")
print(f"  c['a'] = {c['a']}")
print(f"  c['z'] = {c['z']}    ← 不存在返回0，不报错")

# 列表计数
words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
wc = Counter(words)
print(f"  词频: {dict(wc)}")
print(f"  最常见: {wc.most_common(2)}")

# Counter 运算
c1 = Counter(a=3, b=1)
c2 = Counter(a=1, b=2)
print(f"  {dict(c1)} + {dict(c2)} = {dict(c1 + c2)}    ← 相加")
print(f"  {dict(c1)} - {dict(c2)} = {dict(c1 - c2)}    ← 相减（>=0）")

# --- 2. defaultdict ---
print("\\n=== 2. defaultdict ===")
# 分组
students = [("A", "小明"), ("B", "小红"), ("A", "小刚"), ("B", "小亮")]
groups = defaultdict(list)
for grade, name in students:
    groups[grade].append(name)
print(f"  分组: {dict(groups)}")

# 计数
words = ["a", "b", "a", "c", "b", "a"]
count = defaultdict(int)
for w in words:
    count[w] += 1
print(f"  计数: {dict(count)}")

# 嵌套默认
tree = defaultdict(lambda: defaultdict(int))
tree["a"]["b"] += 1
tree["a"]["b"] += 1
tree["a"]["c"] += 1
print(f"  嵌套: {dict(tree)} -> a: {dict(tree['a'])}")

# 默认值是 set
d = defaultdict(set)
d["fruits"].add("apple")
d["fruits"].add("banana")
d["fruits"].add("apple")    # 重复不增加
print(f"  set 默认: {dict(d)}")

# --- 3. deque ---
print("\\n=== 3. deque ===")
dq = deque([1, 2, 3])
print(f"  初始: {list(dq)}")
dq.appendleft(0)
print(f"  appendleft(0): {list(dq)}")
dq.append(4)
print(f"  append(4): {list(dq)}")
dq.popleft()
print(f"  popleft(): {list(dq)}")
dq.pop()
print(f"  pop(): {list(dq)}")

# 限制大小
dq = deque(maxlen=3)
for i in range(5):
    dq.append(i)
    print(f"    append({i}): {list(dq)}")
print(f"  maxlen=3 自动丢弃旧的")

# 旋转
dq = deque([1, 2, 3, 4, 5])
dq.rotate(2)    # 右转2
print(f"  rotate(2): {list(dq)}")
dq.rotate(-1)   # 左转1
print(f"  rotate(-1): {list(dq)}")

# 性能对比
import time
N = 100000

# list 头部插入
lst = []
start = time.time()
for i in range(N):
    lst.insert(0, i)
t_list = time.time() - start

# deque 头部插入
dq = deque()
start = time.time()
for i in range(N):
    dq.appendleft(i)
t_deque = time.time() - start

print(f"\\n  头部插入 {N} 次:")
print(f"    list:   {t_list:.4f}s")
print(f"    deque:  {t_deque:.4f}s")
print(f"    list 比 deque 慢: {t_list/t_deque:.0f}x")

# --- 4. namedtuple ---
print("\\n=== 4. namedtuple ===")
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
print(f"  Point: {p}")
print(f"  p.x = {p.x}, p.y = {p.y}")
print(f"  p[0] = {p[0]}, p[1] = {p[1]}    ← 也能用下标")
print(f"  类型: {type(p).__name__}, 是元组: {isinstance(p, tuple)}")

# 解包
x, y = p
print(f"  解包: x={x}, y={y}")

# 不可变
try:
    p.x = 10
except AttributeError as e:
    print(f"  不可变: {e}")

# _replace 创建新实例
p2 = p._replace(x=10)
print(f"  _replace: {p2}    ← 返回新的，原 {p} 不变")

# _asdict
print(f"  _asdict: {p._asdict()}")

# _make 从可迭代对象创建
pts = Point._make([5, 6])
print(f"  _make([5,6]): {pts}")

# 实用：表示记录
Student = namedtuple("Student", ["name", "age", "score"])
students = [
    Student("小明", 18, 90),
    Student("小红", 19, 85),
    Student("小刚", 18, 92),
]
print(f"\\n  学生记录:")
for s in students:
    print(f"    {s.name}: {s.age}岁, {s.score}分")

# --- 5. OrderedDict ---
print("\\n=== 5. OrderedDict ===")
od = OrderedDict()
od["a"] = 1
od["b"] = 2
od["c"] = 3
print(f"  初始: {dict(od)}")
od.move_to_end("a")    # a 移到末尾
print(f"  move_to_end('a'): {dict(od)}")
od.move_to_end("a", last=False)    # a 移到开头
print(f"  move_to_end('a', last=False): {dict(od)}")
item = od.popitem(last=False)    # 弹出开头
print(f"  popitem(last=False): {item}, 剩 {dict(od)}")

# --- 6. ChainMap ---
print("\\n=== 6. ChainMap ===")
defaults = {"color": "black", "size": "M", "qty": 1}
user_prefs = {"color": "red"}
session = {"qty": 5}

cm = ChainMap(session, user_prefs, defaults)
print(f"  defaults: {defaults}")
print(f"  user_prefs: {user_prefs}")
print(f"  session: {session}")
print(f"  ChainMap:")
for key in ["color", "size", "qty"]:
    print(f"    {key}: {cm[key]}    ← 优先取第一个找到的")

# 修改只影响第一个
cm["color"] = "blue"
print(f"  修改 color='blue' 后 session: {session}, user_prefs: {user_prefs}")

# new_child 添加
cm2 = cm.new_child({"temp": "x"})
print(f"  new_child: {list(cm2.keys())}")

# --- 7. 实用综合 ---
print("\\n=== 7. 实用 ===")

# 词频统计
text = "the cat sat on the mat the cat ate the rat"
words = text.split()
counter = Counter(words)
print(f"  词频 top3: {counter.most_common(3)}")

# 分组聚合
orders = [
    ("2024-01-01", 100), ("2024-01-01", 200),
    ("2024-01-02", 150), ("2024-01-01", 50),
    ("2024-01-02", 300),
]
daily = defaultdict(list)
for date, amount in orders:
    daily[date].append(amount)
print(f"  按日分组:")
for date, amounts in sorted(daily.items()):
    print(f"    {date}: 总 {sum(amounts)}, 单数 {len(amounts)}")

# 历史记录
history = deque(maxlen=3)
for cmd in ["ls", "cd", "pwd", "mkdir", "rm"]:
    history.append(cmd)
print(f"  最近命令(最多3): {list(history)}")`
  },

  // -----------------------------------------------------------
  // 第 65 章：math 与 statistics
  // -----------------------------------------------------------
  {
    id: "py9-65",
    group: "标准库精讲",
    icon: "🔢",
    title: "math 与 statistics：数学与统计",
    content: `## math：数学函数

\`\`\`python
import math
\`\`\`

### 常用函数

\`\`\`python
math.sqrt(16)      # 4.0 平方根
math.pow(2, 10)    # 1024.0 幂
math.log(100, 10)  # 2.0 对数
math.log2(8)       # 3.0
math.log10(1000)   # 3.0
math.exp(1)        # e 的幂
math.fabs(-3.14)   # 3.14 绝对值
math.factorial(5)  # 120 阶乘
math.gcd(12, 18)   # 6 最大公约数
math.lcm(4, 6)     # 12 最小公倍数（3.9+）
\`\`\`

### 取整

\`\`\`python
math.floor(3.7)    # 3 向下取整
math.ceil(3.2)     # 4 向上取整
math.trunc(3.9)    # 3 截断小数部分
round(3.5)         # 4 四舍五入（内置）
\`\`\`

### 常量

\`\`\`python
math.pi       # 3.14159...
math.e        # 2.71828...
math.inf      # 无穷大
math.nan      # 非数字
\`\`\`

### 三角函数

\`\`\`python
math.sin(math.pi/2)    # 1.0
math.cos(0)            # 1.0
math.tan(0)            # 0.0
math.degrees(math.pi)  # 180.0 弧度→角度
math.radians(180)      # 3.14... 角度→弧度
\`\`\`

## statistics：统计函数

\`\`\`python
import statistics
data = [1, 2, 3, 4, 5]
statistics.mean(data)       # 平均
statistics.median(data)     # 中位数
statistics.mode(data)       # 众数
statistics.stdev(data)      # 标准差（样本）
statistics.variance(data)   # 方差（样本）
\`\`\`

## 本章 demo

demo 演示数学和统计函数。`,
    code: `# ============================================
# 第 65 章：math 与 statistics
# ============================================
import math
import statistics

# --- 1. 常量 ---
print("=== 1. 常量 ===")
print(f"  pi = {math.pi}")
print(f"  e  = {math.e}")
print(f"  inf = {math.inf}, -inf = {-math.inf}")
print(f"  nan = {math.nan}")
print(f"  inf > 1e308: {math.inf > 1e308}")
print(f"  nan != nan: {math.nan != math.nan}    ← nan 永远不等于自己")
print(f"  isnan(nan): {math.isnan(math.nan)}")
print(f"  isinf(inf): {math.isinf(math.inf)}")

# --- 2. 幂与对数 ---
print("\\n=== 2. 幂对数 ===")
print(f"  sqrt(16) = {math.sqrt(16)}")
print(f"  pow(2, 10) = {math.pow(2, 10)}")
print(f"  2 ** 10 = {2 ** 10}    ← 运算符也行")
print(f"  log(100, 10) = {math.log(100, 10)}")
print(f"  log2(8) = {math.log2(8)}")
print(f"  log10(1000) = {math.log10(1000)}")
print(f"  log(e) = {math.log(math.e)}    ← 自然对数")
print(f"  exp(1) = {math.exp(1)}    ← e 的 1 次方")
print(f"  exp(0) = {math.exp(0)}")

# --- 3. 整数函数 ---
print("\\n=== 3. 整数函数 ===")
print(f"  factorial(5) = {math.factorial(5)}    ← 5! = 120")
print(f"  factorial(0) = {math.factorial(0)}    ← 0! = 1")
print(f"  gcd(12, 18) = {math.gcd(12, 18)}")
print(f"  gcd(0, 5) = {math.gcd(0, 5)}")
if hasattr(math, 'lcm'):
    print(f"  lcm(4, 6) = {math.lcm(4, 6)}")
    print(f"  lcm(3, 4, 5) = {math.lcm(3, 4, 5)}    ← 多参数")
print(f"  comb(5, 2) = {math.comb(5, 2)}    ← C(5,2) 组合数")
print(f"  perm(5, 2) = {math.perm(5, 2)}    ← P(5,2) 排列数")
print(f"  isqrt(20) = {math.isqrt(20)}    ← 整数平方根")

# --- 4. 取整 ---
print("\\n=== 4. 取整 ===")
nums = [3.1, 3.5, 3.7, -3.1, -3.5, -3.7]
print(f"  {'数':>6} | floor | ceil | trunc | round")
for n in nums:
    print(f"  {n:>6} | {math.floor(n):>5} | {math.ceil(n):>5} | {math.trunc(n):>5} | {round(n):>5}")

# --- 5. 三角函数 ---
print("\\n=== 5. 三角函数 ===")
print(f"  degrees(pi) = {math.degrees(math.pi)}")
print(f"  radians(180) = {math.radians(180)}")
print(f"  sin(pi/2) = {math.sin(math.pi/2)}")
print(f"  cos(0) = {math.cos(0)}")
print(f"  tan(0) = {math.tan(0)}")
print(f"  sin(0) + cos(0) = {math.sin(0) + math.cos(0)}    ← 应该是 1")

# 反三角
print(f"  asin(1) = {math.asin(1)}    ← pi/2")
print(f"  acos(1) = {math.acos(1)}    ← 0")
print(f"  atan(1) = {math.atan(1)}    ← pi/4")

# 双曲
print(f"  sinh(0) = {math.sinh(0)}")
print(f"  cosh(0) = {math.cosh(0)}")

# --- 6. 角度和坐标 ---
print("\\n=== 6. 坐标转换 ===")
# 极坐标 → 直角坐标
r = 5
theta = math.radians(30)    # 30度
x = r * math.cos(theta)
y = r * math.sin(theta)
print(f"  极坐标 (r={r}, θ=30°) → ({x:.3f}, {y:.3f})")

# 距离公式
def distance(x1, y1, x2, y2):
    return math.sqrt((x2-x1)**2 + (y2-y1)**2)

print(f"  (0,0) 到 (3,4) 距离: {distance(0, 0, 3, 4)}")
print(f"  hypot(3, 4) = {math.hypot(3, 4)}    ← 等价")

# --- 7. 浮点数处理 ---
print("\\n=== 7. 浮点数 ===")
print(f"  fabs(-3.14) = {math.fabs(-3.14)}")
print(f"  fsum([0.1]*10) = {math.fsum([0.1]*10)}    ← 精确求和")
print(f"  sum([0.1]*10) = {sum([0.1]*10)}    ← 普通求和有误差")
print(f"  copysign(3, -1) = {math.copysign(3, -1)}    ← 复制符号")
print(f"  isclose(0.1+0.2, 0.3) = {math.isclose(0.1+0.2, 0.3)}    ← 浮点比较")
print(f"  isclose(0.1+0.2, 0.3, rel_tol=1e-9) = {math.isclose(0.1+0.2, 0.3, rel_tol=1e-9)}")

# --- 8. statistics 统计 ---
print("\\n=== 8. statistics ===")
data = [85, 92, 78, 95, 67, 88, 72, 95, 90, 85]
print(f"  数据: {data}")
print(f"  个数: {len(data)}")
print(f"  总和: {sum(data)}")
print(f"  mean 平均: {statistics.mean(data):.2f}")
print(f"  median 中位: {statistics.median(data)}")
print(f"  mode 众数: {statistics.mode(data)}")
print(f"  multimode 多众数: {statistics.multimode(data)}")
print(f"  range 极差: {max(data) - min(data)}")
print(f"  variance 方差: {statistics.variance(data):.2f}    ← 样本方差")
print(f"  pvariance 总体方差: {statistics.pvariance(data):.2f}")
print(f"  stdev 标准差: {statistics.stdev(data):.2f}")
print(f"  pstdev 总体标准差: {statistics.pstdev(data):.2f}")

# --- 9. 分位数 ---
print("\\n=== 9. 分位数 ===")
print(f"  中位数: {statistics.median(data)}")
print(f"  median_low: {statistics.median_low(data)}")
print(f"  median_high: {statistics.median_high(data)}")
print(f"  quantiles(4): {statistics.quantiles(data, n=4)}    ← 四分位数")

# --- 10. 实用 ---
print("\\n=== 10. 实用 ===")

# 计算圆
r = 5
area = math.pi * r ** 2
perimeter = 2 * math.pi * r
print(f"  半径 {r} 的圆: 面积 {area:.2f}, 周长 {perimeter:.2f}")

# 复利
principal = 1000
rate = 0.05
years = 10
final = principal * math.pow(1 + rate, years)
print(f"  本金 {principal}, 年利率 {rate}, {years} 年后: {final:.2f}")

# 阶乘对比
print(f"  10! = {math.factorial(10)}")

# 概率：抛硬币 n 次 k 次正面
def binomial(n, k, p=0.5):
    """二项分布概率"""
    return math.comb(n, k) * (p ** k) * ((1-p) ** (n-k))

print(f"  抛 10 次硬币，5 次正面: {binomial(10, 5):.4f}")
print(f"  抛 10 次，0 次正面: {binomial(10, 0):.4f}")

# 标准差判断异常值
mean = statistics.mean(data)
stdev = statistics.stdev(data)
print(f"\\n  成绩数据，均值={mean:.1f}，标准差={stdev:.1f}")
print(f"  异常值（>2σ）:")
for x in data:
    if abs(x - mean) > 2 * stdev:
        print(f"    {x} (偏离 {(x-mean)/stdev:.1f}σ)")`
  },

  // -----------------------------------------------------------
  // 第 66 章：random
  // -----------------------------------------------------------
  {
    id: "py9-66",
    group: "标准库精讲",
    icon: "🎲",
    title: "random：随机数",
    content: `## random 模块

\`\`\`python
import random
\`\`\`

⚠️ random 是**伪随机**，基于种子。**不能用于安全场景**（密码、token），用 \`secrets\` 模块。

## 基本函数

\`\`\`python
random.random()              # 0.0 ~ 1.0 浮点
random.randint(a, b)         # a ~ b 整数（含两端）
random.randrange(0, 10, 2)   # 0,2,4,6,8（步长2）
random.uniform(a, b)         # a ~ b 浮点
\`\`\`

## 序列操作

\`\`\`python
random.choice(seq)           # 随机选一个
random.choices(seq, k=3)     # 选多个（可重复）
random.sample(seq, k=3)      # 选多个（不重复）
random.shuffle(seq)          # 原地打乱
\`\`\`

## 种子

\`\`\`python
random.seed(42)    # 固定种子，结果可复现
\`\`\`

固定种子后，每次运行结果一样。调试、测试常用。

## 加权随机

\`\`\`python
random.choices(["A", "B", "C"], weights=[1, 2, 3], k=5)
# A 概率 1/6, B 2/6, C 3/6
\`\`\`

## 本章 demo

demo 演示随机数生成和实用场景。`,
    code: `# ============================================
# 第 66 章：random
# ============================================
import random

# 固定种子便于复现
random.seed(42)

# --- 1. 基本随机 ---
print("=== 1. 基本 ===")
print(f"  random(): {random.random():.6f}    ← [0, 1)")
print(f"  random(): {random.random():.6f}")
print(f"  randint(1, 100): {random.randint(1, 100)}    ← 含两端")
print(f"  randint(1, 6): {random.randint(1, 6)}    ← 模拟骰子")
print(f"  randrange(0, 10, 2): {random.randrange(0, 10, 2)}    ← 0,2,4,6,8")
print(f"  uniform(1.5, 3.5): {random.uniform(1.5, 3.5):.4f}    ← 浮点")

# --- 2. 序列操作 ---
print("\\n=== 2. 序列 ===")
fruits = ["苹果", "香蕉", "橘子", "葡萄", "西瓜"]
print(f"  水果: {fruits}")
print(f"  choice: {random.choice(fruits)}    ← 随机选一个")
print(f"  choices(k=3): {random.choices(fruits, k=3)}    ← 可重复")
print(f"  sample(k=3): {random.sample(fruits, k=3)}    ← 不重复")

# 打乱
cards = list(range(1, 11))
print(f"  原始: {cards}")
random.shuffle(cards)
print(f"  shuffle: {cards}    ← 原地打乱")

# 字符串也能选
print(f"  choice('abcde'): {random.choice('abcde')}")

# --- 3. 种子 ---
print("\\n=== 3. 种子 ===")
random.seed(100)
a1 = [random.randint(1, 100) for _ in range(5)]
random.seed(100)
a2 = [random.randint(1, 100) for _ in range(5)]
random.seed()    # 恢复随机
a3 = [random.randint(1, 100) for _ in range(5)]
print(f"  种子100第一次: {a1}")
print(f"  种子100第二次: {a2}    ← 相同！")
print(f"  不固定种子: {a3}    ← 每次不同")

# --- 4. 加权随机 ---
print("\\n=== 4. 加权 ===")
# 抽奖：一等奖1%，二等奖5%，三等奖20%，未中奖74%
result = random.choices(
    ["一等奖", "二等奖", "三等奖", "未中奖"],
    weights=[1, 5, 20, 74],
    k=10
)
print(f"  抽10次: {result}")

# 统计
counts = {}
for r in result:
    counts[r] = counts.get(r, 0) + 1
print(f"  统计: {counts}")

# 大量抽验证概率
n = 10000
results = random.choices(
    ["一等奖", "二等奖", "三等奖", "未中奖"],
    weights=[1, 5, 20, 74],
    k=n
)
print(f"  抽 {n} 次频率:")
for level in ["一等奖", "二等奖", "三等奖", "未中奖"]:
    freq = results.count(level) / n * 100
    print(f"    {level}: {freq:.1f}%")

# --- 5. 实用：验证码 ---
print("\\n=== 5. 验证码 ===")
def gen_code(length=4):
    """生成数字验证码"""
    return "".join(random.choices("0123456789", k=length))

def gen_mixed_code(length=6):
    """生成字母数字混合验证码"""
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"    # 去掉易混淆
    return "".join(random.choices(chars, k=length))

print(f"  4位数字验证码: {gen_code()}")
print(f"  6位混合验证码: {gen_mixed_code()}")
print(f"  再生成一个: {gen_mixed_code()}")

# --- 6. 实用：随机密码 ---
print("\\n=== 6. 随机密码 ===")
import string
def gen_password(length=12):
    """生成随机密码"""
    chars = string.ascii_letters + string.digits + "!@#$%^&*"
    # 至少包含每种字符
    pwd = [
        random.choice(string.ascii_lowercase),
        random.choice(string.ascii_uppercase),
        random.choice(string.digits),
        random.choice("!@#$%^&*"),
    ]
    pwd += random.choices(chars, k=length - 4)
    random.shuffle(pwd)
    return "".join(pwd)

for _ in range(3):
    print(f"  密码: {gen_password()}")

# --- 7. 模拟：抛硬币 ---
print("\\n=== 7. 抛硬币 ===")
n = 10000
heads = sum(1 for _ in range(n) if random.random() < 0.5)
print(f"  抛 {n} 次，正面 {heads} ({heads/n*100:.1f}%)，反面 {n-heads} ({(n-heads)/n*100:.1f}%)")

# --- 8. 模拟：掷骰子 ---
print("\\n=== 8. 掷骰子 ===")
n = 60000
results = [random.randint(1, 6) for _ in range(n)]
print(f"  掷 {n} 次:")
for face in range(1, 7):
    count = results.count(face)
    print(f"    {face}点: {count} 次 ({count/n*100:.1f}%)")

# 两个骰子之和
print(f"  两个骰子之和（10000次）:")
sums = [random.randint(1, 6) + random.randint(1, 6) for _ in range(10000)]
from collections import Counter
c = Counter(sums)
for s in range(2, 13):
    bar = "█" * (c[s] // 100)
    print(f"    {s:2}点: {c[s]:5} {bar}")

# --- 9. 模拟：扑克牌 ---
print("\\n=== 9. 扑克 ===")
suits = ["♠", "♥", "♦", "♣"]
ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
deck = [f"{r}{s}" for s in suits for r in ranks]
print(f"  牌数: {len(deck)}")

# 洗牌发牌
random.shuffle(deck)
players = ["东", "南", "西", "北"]
hands = {p: [] for p in players}
for i, card in enumerate(deck):
    hands[players[i % 4]].append(card)

for p in players:
    print(f"  {p}: {hands[p][:5]}...（共 {len(hands[p])} 张）")

# --- 10. 实用：随机采样 ---
print("\\n=== 10. 采样 ===")
# 从大数据随机采样
data = list(range(1000))
sample = random.sample(data, 10)
print(f"  从 1000 个采 10 个: {sorted(sample)}")

# 随机布尔
bools = [random.random() < 0.7 for _ in range(100)]
true_count = sum(bools)
print(f"  100 次随机（p=0.7）: True {true_count}, False {100-true_count}")

# 随机浮点列表
nums = [round(random.uniform(0, 10), 2) for _ in range(5)]
print(f"  5 个随机浮点: {nums}")`
  },

  // -----------------------------------------------------------
  // 第 67 章：typing
  // -----------------------------------------------------------
  {
    id: "py9-67",
    group: "标准库精讲",
    icon: "🔖",
    title: "typing：类型提示",
    content: `## 类型提示是什么

Python 是动态类型，但可以用类型提示（type hint）标注变量/函数的类型。**运行时不强制**，但能被 IDE/mypy 检查。

\`\`\`python
def add(a: int, b: int) -> int:
    return a + b
\`\`\`

\`a: int\` 表示参数 a 应是 int，\`-> int\` 表示返回 int。

## 基本类型

\`\`\`python
x: int = 1
y: float = 1.5
s: str = "hi"
b: bool = True
\`\`\`

## 容器类型

\`\`\`python
from typing import List, Dict, Tuple, Set

names: List[str] = ["a", "b"]
scores: Dict[str, int] = {"a": 1}
point: Tuple[int, int] = (3, 4)
nums: Set[int] = {1, 2, 3}
\`\`\`

Python 3.9+ 可以直接用 \`list[str]\`、\`dict[str, int]\`，不用 import typing。

## Optional 与 Union

\`\`\`python
from typing import Optional, Union

# 可能是 int 或 None
def find(x) -> Optional[int]:
    ...

# 多种类型之一
def parse(x) -> Union[int, str]:
    ...
\`\`\`

Python 3.10+ 可以用 \`int | None\` 代替 \`Optional[int]\`。

## Any 与 NoReturn

\`\`\`python
from typing import Any, NoReturn

def log(msg: Any) -> None:    # 接受任何类型
    print(msg)

def fatal() -> NoReturn:      # 不返回（抛异常/退出）
    raise SystemExit
\`\`\`

## Callable

\`\`\`python
from typing import Callable

# 接受两个 int，返回 int 的函数
def apply(f: Callable[[int, int], int], a, b):
    return f(a, b)
\`\`\`

## TypeVar：泛型

\`\`\`python
from typing import TypeVar

T = TypeVar("T")
def first(items: List[T]) -> T:
    return items[0]
\`\`\`

## TypedDict：类型化字典

\`\`\`python
from typing import TypedDict

class User(TypedDict):
    name: str
    age: int

u: User = {"name": "小明", "age": 18}
\`\`\`

## 本章 demo

demo 演示类型提示各种用法。`,
    code: `# ============================================
# 第 67 章：typing 类型提示
# ============================================
# 注意：类型提示不影响运行，但能被 IDE/mypy 检查
from typing import (
    List, Dict, Tuple, Set, Optional, Union,
    Any, Callable, TypeVar, Generic, Iterable, Iterator,
    TypedDict, Protocol
)

# --- 1. 基本类型 ---
print("=== 1. 基本类型 ===")
def add(a: int, b: int) -> int:
    """两数相加"""
    return a + b

def greet(name: str, times: int = 1) -> str:
    """打招呼"""
    return f"Hello {name}! " * times

print(f"  add(1, 2) = {add(1, 2)}")
print(f"  greet('World') = {greet('World')}")
print(f"  greet('Py', 3) = {greet('Py', 3)}")

# 变量类型提示
x: int = 10
y: float = 3.14
s: str = "hello"
b: bool = True
print(f"  x={x}, y={y}, s={s}, b={b}")

# 运行时不强制
result = add("a", "b")    # 标注是 int，但传 str 也能跑
print(f"  add('a', 'b') = {result!r}    ← 运行时不强制，但 mypy 会报错")

# --- 2. 容器类型 ---
print("\\n=== 2. 容器 ===")
def average(nums: List[float]) -> float:
    """求平均"""
    return sum(nums) / len(nums) if nums else 0.0

def count_words(text: str) -> Dict[str, int]:
    """词频"""
    from collections import Counter
    return dict(Counter(text.split()))

def swap(p: Tuple[int, int]) -> Tuple[int, int]:
    """交换"""
    return (p[1], p[0])

print(f"  average([1,2,3,4]) = {average([1.0, 2, 3, 4])}")
print(f"  count_words: {count_words('a b a c b a')}")
print(f"  swap((1, 2)) = {swap((1, 2))}")

# Python 3.9+ 内置泛型
def first(items: list) -> object:
    return items[0] if items else None
print(f"  first([1,2,3]) = {first([1, 2, 3])}")

# --- 3. Optional ---
print("\\n=== 3. Optional ===")
def find_user(user_id: int) -> Optional[str]:
    """查找用户，找不到返回 None"""
    users = {1: "小明", 2: "小红"}
    return users.get(user_id)

print(f"  find_user(1) = {find_user(1)}")
print(f"  find_user(99) = {find_user(99)}    ← Optional 允许 None")

# 等价写法
def find_user_v2(user_id: int) -> Union[str, None]:
    return find_user(user_id)

# Python 3.10+ 可以用 str | None
# def find_user_v3(user_id: int) -> str | None: ...

# --- 4. Union 多类型 ---
print("\\n=== 4. Union ===")
def parse_value(s: str) -> Union[int, float, str]:
    """尝试解析为数字，失败返回原字符串"""
    try:
        return int(s)
    except ValueError:
        try:
            return float(s)
        except ValueError:
            return s

for v in ["42", "3.14", "hello", "-5"]:
    result = parse_value(v)
    print(f"  parse_value('{v}') = {result!r} ({type(result).__name__})")

# --- 5. Any ---
print("\\n=== 5. Any ===")
def print_anything(x: Any) -> None:
    """接受任何类型"""
    print(f"    收到: {x!r} ({type(x).__name__})")

print("  print_anything:")
print_anything(42)
print_anything("hi")
print_anything([1, 2, 3])
print_anything(None)

# --- 6. Callable ---
print("\\n=== 6. Callable ===")
def apply_twice(f: Callable[[int], int], x: int) -> int:
    """把函数应用两次"""
    return f(f(x))

result = apply_twice(lambda x: x + 3, 10)
print(f"  apply_twice(x+3, 10) = {result}    ← (10+3)+3")

def make_multiplier(n: int) -> Callable[[int], int]:
    """返回一个乘法函数"""
    return lambda x: x * n

double = make_multiplier(2)
triple = make_multiplier(3)
print(f"  double(5) = {double(5)}")
print(f"  triple(5) = {triple(5)}")

# --- 7. TypeVar 泛型 ---
print("\\n=== 7. TypeVar ===")
T = TypeVar("T")

def first_item(items: List[T]) -> T:
    """返回第一个元素，类型保持"""
    return items[0] if items else None

# 自动适配类型
n = first_item([1, 2, 3])        # int
s = first_item(["a", "b"])       # str
print(f"  first_item([1,2,3]) = {n} ({type(n).__name__})")
print(f"  first_item(['a','b']) = {s} ({type(s).__name__})")

def max_of(a: T, b: T) -> T:
    """两个同类型取大"""
    return a if a > b else b

print(f"  max_of(3, 7) = {max_of(3, 7)}")
print(f"  max_of('apple', 'banana') = {max_of('apple', 'banana')}")

# --- 8. Iterable / Iterator ---
print("\\n=== 8. Iterable ===")
def sum_all(items: Iterable[int]) -> int:
    """对任何可迭代对象求和"""
    return sum(items)

print(f"  sum_all([1,2,3]) = {sum_all([1, 2, 3])}")
print(f"  sum_all((1,2,3)) = {sum_all((1, 2, 3))}")
print(f"  sum_all(range(5)) = {sum_all(range(5))}")
print(f"  sum_all(x for x in [1,2,3]) = {sum_all(x for x in [1, 2, 3])}")

def take_n(it: Iterator, n: int) -> List:
    """取前 n 个"""
    result = []
    for i, x in enumerate(it):
        if i >= n:
            break
        result.append(x)
    return result

print(f"  take_n(range(10), 3) = {take_n(iter(range(10)), 3)}")

# --- 9. TypedDict ---
print("\\n=== 9. TypedDict ===")
class UserDict(TypedDict):
    name: str
    age: int
    email: str

def create_user(u: UserDict) -> str:
    return f"用户 {u['name']}, {u['age']}岁, 邮箱 {u['email']}"

user: UserDict = {"name": "小明", "age": 18, "email": "xm@example.com"}
print(f"  {create_user(user)}")

# --- 10. 实用 ===
print("\\n=== 10. 实用 ===")

# 高阶函数类型
def map_func(
    func: Callable[[int], int],
    items: List[int]
) -> List[int]:
    """自己实现 map"""
    return [func(x) for x in items]

print(f"  map_func(x², [1,2,3,4]) = {map_func(lambda x: x**2, [1, 2, 3, 4])}")

# 复杂签名
def group_by(
    items: List[Dict[str, Any]],
    key: str
) -> Dict[Any, List[Dict[str, Any]]]:
    """按字段分组"""
    from collections import defaultdict
    groups = defaultdict(list)
    for item in items:
        groups[item[key]].append(item)
    return dict(groups)

students = [
    {"name": "小明", "class": "A"},
    {"name": "小红", "class": "B"},
    {"name": "小刚", "class": "A"},
]
print(f"  分组: {group_by(students, 'class')}")

# Protocol（结构子类型）
print("\\n  Protocol 示例:")
class Closeable(Protocol):
    def close(self) -> None: ...

def close_all(items: List[Closeable]) -> None:
    count = 0
    for item in items:
        item.close()
        count += 1
    print(f"    关闭了 {count} 个")

class FakeFile:
    def close(self) -> None:
        pass

class FakeConn:
    def close(self) -> None:
        pass

close_all([FakeFile(), FakeConn()])    # 鸭子类型`
  },

  // -----------------------------------------------------------
  // 第 68 章：dataclasses
  // -----------------------------------------------------------
  {
    id: "py9-68",
    group: "标准库精讲",
    icon: "🗃️",
    title: "dataclasses：数据类",
    content: `## dataclass 是什么

写类时常常只是存数据，要手写 \`__init__\`、\`__repr__\`、\`__eq__\` 等很烦。\`dataclass\` 装饰器自动生成。

\`\`\`python
from dataclasses import dataclass

@dataclass
class Point:
    x: int
    y: int
\`\`\`

自动生成：
- \`__init__(self, x, y)\`
- \`__repr__\`（漂亮的打印）
- \`__eq__\`（按字段比较）

## 默认值

\`\`\`python
@dataclass
class User:
    name: str
    age: int = 18              # 默认值
    active: bool = True
\`\`\`

⚠️ 默认值必须放在没默认值的后面（同函数参数）。

## 可变默认值用 field

\`\`\`python
from dataclasses import dataclass, field

@dataclass
class Student:
    name: str
    scores: list = field(default_factory=list)    # 不能直接写 []
\`\`\`

直接写 \`scores: list = []\` 所有实例会共享同一个列表（坑）。

## 常用 field 参数

\`\`\`python
field(default=10)               # 默认值
field(default_factory=list)     # 可变默认值
field(init=False)               # 不在 __init__ 里
field(repr=False)               # 不在 repr 里
field(compare=False)            # 不参与比较
\`\`\`

## frozen 不可变

\`\`\`python
@dataclass(frozen=True)
class Point:
    x: int
    y: int

p = Point(1, 2)
p.x = 10    # ❌ FrozenInstanceError
\`\`\`

frozen 后可哈希，能当字典 key。

## 方法

dataclass 还是类，能加方法：

\`\`\`python
@dataclass
class Circle:
    r: float
    def area(self) -> float:
        return 3.14 * self.r ** 2
\`\`\`

## asdict / astuple

\`\`\`python
from dataclasses import asdict, astuple
asdict(obj)    # 转字典
astuple(obj)   # 转元组
\`\`\`

## 本章 demo

demo 演示 dataclass 用法。`,
    code: `# ============================================
# 第 68 章：dataclasses
# ============================================
from dataclasses import dataclass, field, asdict, astuple
from typing import List

# --- 1. 基础 ---
print("=== 1. 基础 ===")
@dataclass
class Point:
    x: int
    y: int

p1 = Point(3, 4)
p2 = Point(3, 4)
p3 = Point(5, 6)
print(f"  p1 = {p1}    ← 自动 __repr__")
print(f"  p2 = {p2}")
print(f"  p1 == p2: {p1 == p2}    ← 自动 __eq__")
print(f"  p1 == p3: {p1 == p3}")

# --- 2. 默认值 ---
print("\\n=== 2. 默认值 ===")
@dataclass
class User:
    name: str
    age: int = 18
    active: bool = True

u1 = User("小明")
u2 = User("小红", 20)
u3 = User("小刚", 22, False)
print(f"  User('小明') = {u1}")
print(f"  User('小红', 20) = {u2}")
print(f"  User('小刚', 22, False) = {u3}")

# --- 3. 可变默认值 ---
print("\\n=== 3. 可变默认值 ===")
# ❌ 错误写法
# @dataclass
# class Bad:
#     items: list = []    # 所有实例共享！

# ✅ 正确写法
@dataclass
class Student:
    name: str
    scores: List[int] = field(default_factory=list)
    
    def add_score(self, s):
        self.scores.append(s)

s1 = Student("小明")
s2 = Student("小红")
s1.add_score(90)
s1.add_score(85)
s2.add_score(95)
print(f"  s1 = {s1}")
print(f"  s2 = {s2}    ← 各自独立")

# --- 4. field 选项 ---
print("\\n=== 4. field 选项 ===")
@dataclass
class Product:
    name: str
    price: float
    id: int = field(default=0)            # 默认值
    internal_code: str = field(default="", repr=False)  # 不显示在 repr
    discount: float = field(default=0.0, compare=False)  # 不参与比较
    
    @property
    def final_price(self):
        return self.price * (1 - self.discount)

p = Product("手机", 2999, internal_code="X-001")
print(f"  product = {p}    ← internal_code 不显示")
p.discount = 0.1
print(f"  final_price = {p.final_price}")

# --- 5. frozen 不可变 ---
print("\\n=== 5. frozen ===")
@dataclass(frozen=True)
class Color:
    r: int
    g: int
    b: int

red = Color(255, 0, 0)
print(f"  red = {red}")
try:
    red.r = 100
except Exception as e:
    print(f"  red.r = 100 → {type(e).__name__}: {e}")

# frozen 后可哈希
colors = {red: "红色", Color(0, 255, 0): "绿色"}
print(f"  当字典 key: {colors[Color(255, 0, 0)]}    ← 用值的 key 查")

# --- 6. 方法 ---
print("\\n=== 6. 方法 ===")
@dataclass
class Circle:
    r: float
    
    def area(self) -> float:
        return 3.14159 * self.r ** 2
    
    def perimeter(self) -> float:
        return 2 * 3.14159 * self.r
    
    def __post_init__(self):
        """初始化后调用"""
        if self.r < 0:
            raise ValueError("半径不能为负")

c = Circle(5)
print(f"  Circle(5): 面积 {c.area():.2f}, 周长 {c.perimeter():.2f}")

try:
    Circle(-1)
except ValueError as e:
    print(f"  Circle(-1) → {e}")

# --- 7. 计算字段 ---
print("\\n=== 7. 计算字段 ===")
@dataclass
class Rectangle:
    width: float
    height: float
    area: float = field(init=False)  # 不在 __init__，自动算
    perimeter: float = field(init=False)
    
    def __post_init__(self):
        self.area = self.width * self.height
        self.perimeter = 2 * (self.width + self.height)

r = Rectangle(4, 3)
print(f"  Rectangle(4, 3): 面积 {r.area}, 周长 {r.perimeter}")

# --- 8. asdict / astuple ---
print("\\n=== 8. 转换 ===")
@dataclass
class Book:
    title: str
    author: str
    year: int

b = Book("Python 入门", "Guido", 2024)
print(f"  原始: {b}")
print(f"  asdict: {asdict(b)}")
print(f"  astuple: {astuple(b)}")

# 嵌套
@dataclass
class Author:
    name: str
    email: str

@dataclass
class Article:
    title: str
    author: Author
    tags: List[str] = field(default_factory=list)

a = Article("Python 教程", Author("张三", "zs@example.com"), ["python", "教程"])
print(f"  嵌套: {a}")
print(f"  asdict: {asdict(a)}    ← 嵌套也转字典")

# --- 9. 继承 ---
print("\\n=== 9. 继承 ===")
@dataclass
class Animal:
    name: str
    age: int

@dataclass
class Dog(Animal):
    breed: str = "未知"
    
    def bark(self):
        return f"{self.name} 汪汪！"

d = Dog("旺财", 3, "金毛")
print(f"  Dog: {d}")
print(f"  bark: {d.bark()}")

# --- 10. 实用对比 ---
print("\\n=== 10. 普通类 vs dataclass ===")
print("  普通类写法:")
class PointOld:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def __repr__(self):
        return f"PointOld(x={self.x}, y={self.y})"
    def __eq__(self, other):
        if not isinstance(other, PointOld):
            return NotImplemented
        return self.x == other.x and self.y == other.y

# dataclass 写法
@dataclass
class PointNew:
    x: int
    y: int

p_old = PointOld(1, 2)
p_new = PointNew(1, 2)
print(f"    普通类: {p_old}, == {PointOld(1, 2)}: {p_old == PointOld(1, 2)}")
print(f"    dataclass: {p_new}, == {PointNew(1, 2)}: {p_new == PointNew(1, 2)}")
print("    → dataclass 一行搞定，少写很多样板代码")`
  },

  // -----------------------------------------------------------
  // 第 69 章：logging
  // -----------------------------------------------------------
  {
    id: "py9-69",
    group: "标准库精讲",
    icon: "📝",
    title: "logging：日志系统",
    content: `## 为什么用 logging 而不是 print

- **分级别**：DEBUG/INFO/WARNING/ERROR/CRITICAL
- **可控制**：能开关、能筛选
- **多输出**：文件、控制台、网络
- **格式化**：时间、文件名、行号自动加

## 简单用法

\`\`\`python
import logging
logging.basicConfig(level=logging.INFO)
logging.debug("调试信息")
logging.info("普通信息")
logging.warning("警告")
logging.error("错误")
logging.critical("严重")
\`\`\`

## 日志级别

| 级别 | 数值 | 用途 |
|---|---|---|
| DEBUG | 10 | 调试细节 |
| INFO | 20 | 一般信息 |
| WARNING | 30 | 警告 |
| ERROR | 40 | 错误 |
| CRITICAL | 50 | 严重错误 |

设置 level 后，**只显示 >= 该级别**的日志。

## basicConfig 配置

\`\`\`python
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s",
    filename="app.log",
)
\`\`\`

## 格式化字段

- \`%(asctime)s\`：时间
- \`%(levelname)s\`：级别名
- \`%(message)s\`：消息
- \`%(name)s\`：logger 名
- \`%(filename)s\`：文件名
- \`%(lineno)d\`：行号
- \`%(funcName)s\`：函数名

## Logger 对象

\`\`\`python
logger = logging.getLogger("my_app")
logger.info("...")
\`\`\`

不同模块用不同 logger 名，便于区分。

## Handler：输出到不同地方

\`\`\`python
from logging import StreamHandler, FileHandler

console = StreamHandler()       # 输出到控制台
file_h = FileHandler("app.log") # 输出到文件
logger.addHandler(console)
logger.addHandler(file_h)
\`\`\`

## 本章 demo

demo 演示 logging 配置和使用。`,
    code: `# ============================================
# 第 69 章：logging
# ============================================
import logging
import sys

# --- 1. 基本用法 ---
print("=== 1. 基本 ===")
# 配置根 logger
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
    stream=sys.stdout    # 输出到 stdout（默认是 stderr）
)

logging.debug("这是 DEBUG 信息")
logging.info("这是 INFO 信息")
logging.warning("这是 WARNING")
logging.error("这是 ERROR")
logging.critical("这是 CRITICAL")

# --- 2. 级别过滤 ---
print("\\n=== 2. 级别过滤 ===")
# 创建新 logger（避免 basicConfig 冲突，直接配置）
logger2 = logging.getLogger("demo2")
logger2.setLevel(logging.WARNING)    # 只看 WARNING 及以上
logger2.addHandler(logging.StreamHandler(sys.stdout))

print("  设置 level=WARNING，只显示 >= WARNING:")
logger2.debug("这条 debug 不会显示")
logger2.info("这条 info 也不会显示")
logger2.warning("warning 会显示")
logger2.error("error 也会显示")

# --- 3. logger 对象 ---
print("\\n=== 3. logger 对象 ===")
# 不同模块用不同 logger
db_logger = logging.getLogger("app.db")
api_logger = logging.getLogger("app.api")
# 都继承自 app
app_logger = logging.getLogger("app")

app_logger.info("应用启动")
db_logger.info("连接数据库")
api_logger.info("启动 API 服务")
db_logger.error("数据库连接失败")

# --- 4. 格式化 ---
print("\\n=== 4. 格式化 ===")
logger3 = logging.getLogger("demo3")
logger3.setLevel(logging.DEBUG)
logger3.handlers = []    # 清掉之前的 handler

handler = logging.StreamHandler(sys.stdout)
formatter = logging.Formatter(
    "%(asctime)s | %(name)s | %(levelname)-8s | %(filename)s:%(lineno)d | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
handler.setFormatter(formatter)
logger3.addHandler(handler)
logger3.propagate = False    # 不传给父 logger

logger3.info("带详细信息的日志")
logger3.warning("警告消息")

# --- 5. 异常记录 ---
print("\\n=== 5. 异常 ===")
logger4 = logging.getLogger("demo4")
logger4.setLevel(logging.ERROR)
logger4.handlers = []
h = logging.StreamHandler(sys.stdout)
h.setFormatter(logging.Formatter("[%(levelname)s] %(message)s"))
logger4.addHandler(h)
logger4.propagate = False

try:
    1 / 0
except ZeroDivisionError:
    logger4.error("发生异常", exc_info=True)    # 自动加堆栈
    # 等价于 logger4.exception("发生异常")

# --- 6. 文件日志 ---
print("\\n=== 6. 文件日志 ===")
import tempfile, os
log_path = tempfile.mktemp(suffix=".log")

file_logger = logging.getLogger("demo5")
file_logger.setLevel(logging.DEBUG)
file_logger.handlers = []
file_logger.propagate = False

# 同时输出到文件和控制台
file_handler = logging.FileHandler(log_path, encoding="utf-8")
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(logging.Formatter(
    "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
))

console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.WARNING)    # 控制台只看 WARNING+
console_handler.setFormatter(logging.Formatter("[%(levelname)s] %(message)s"))

file_logger.addHandler(file_handler)
file_logger.addHandler(console_handler)

file_logger.debug("调试信息（只在文件）")
file_logger.info("普通信息（只在文件）")
file_logger.warning("警告（文件和控制台）")
file_logger.error("错误（文件和控制台）")

# 看文件内容
file_handler.close()
print(f"  文件内容:")
with open(log_path, encoding="utf-8") as f:
    for line in f:
        print(f"    {line.rstrip()}")
os.unlink(log_path)

# --- 7. RotatingFileHandler ---
print("\\n=== 7. 日志轮转 ===")
from logging.handlers import RotatingFileHandler

log_path = tempfile.mktemp(suffix=".log")
# 每个 200 字节，保留 3 个备份
rotating_handler = RotatingFileHandler(
    log_path, maxBytes=200, backupCount=3, encoding="utf-8"
)
rotating_handler.setFormatter(logging.Formatter("%(message)s"))

rot_logger = logging.getLogger("demo6")
rot_logger.setLevel(logging.INFO)
rot_logger.handlers = [rotating_handler]
rot_logger.propagate = False

# 写入大量日志
for i in range(50):
    rot_logger.info(f"日志条目 {i:04d} - 这是一段足够长的消息用于触发轮转")

rotating_handler.close()
# 看有哪些文件
import glob
files = sorted(glob.glob(log_path + "*"))
print(f"  写入 50 条后，文件列表:")
for f in files:
    size = os.path.getsize(f)
    print(f"    {os.path.basename(f)}: {size} 字节")

for f in files:
    os.unlink(f)

# --- 8. 自定义 logger 工厂 ---
print("\\n=== 8. 工厂 ===")
def setup_logger(name, level=logging.DEBUG, log_file=None):
    """统一的 logger 配置"""
    logger = logging.getLogger(name)
    logger.setLevel(level)
    logger.handlers = []
    logger.propagate = False
    
    fmt = logging.Formatter(
        "%(asctime)s [%(levelname)-7s] %(name)s: %(message)s",
        datefmt="%H:%M:%S"
    )
    
    # 控制台
    sh = logging.StreamHandler(sys.stdout)
    sh.setFormatter(fmt)
    logger.addHandler(sh)
    
    # 文件（可选）
    if log_file:
        fh = logging.FileHandler(log_file, encoding="utf-8")
        fh.setFormatter(fmt)
        logger.addHandler(fh)
    
    return logger

# 不同模块用各自的 logger
db_log = setup_logger("DB")
api_log = setup_logger("API")

db_log.info("数据库已连接")
api_log.info("API 服务启动")
db_log.warning("连接池接近上限")
api_log.error("请求超时")

# --- 9. 实用：装饰器记录函数调用 ---
print("\\n=== 9. 装饰器日志 ===")
def log_calls(logger):
    """记录函数调用的装饰器"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            logger.debug(f"调用 {func.__name__}({args}, {kwargs})")
            try:
                result = func(*args, **kwargs)
                logger.debug(f"{func.__name__} 返回 {result!r}")
                return result
            except Exception as e:
                logger.error(f"{func.__name__} 抛出 {type(e).__name__}: {e}")
                raise
        return wrapper
    return decorator

call_logger = setup_logger("CALLS", level=logging.DEBUG)

@log_calls(call_logger)
def add(a, b):
    return a + b

@log_calls(call_logger)
def divide(a, b):
    return a / b

print("  调用 add(1, 2):")
result = add(1, 2)
print(f"  结果: {result}")

print("\\n  调用 divide(10, 0):")
try:
    divide(10, 0)
except ZeroDivisionError:
    pass

# --- 10. 实用：模块化日志 ---
print("\\n=== 10. 模块化 ===")
# 模拟项目结构
class App:
    def __init__(self):
        self.logger = logging.getLogger("app")
    
    def run(self):
        self.logger.info("应用启动")
        try:
            self.load_config()
            self.connect_db()
            self.logger.info("应用运行中")
        except Exception as e:
            self.logger.critical(f"启动失败: {e}")
    
    def load_config(self):
        self.logger.debug("加载配置文件")
    
    def connect_db(self):
        self.logger.debug("连接数据库")
        # 模拟失败
        raise ConnectionError("数据库不可达")

# 配置 app logger
app_logger = logging.getLogger("app")
app_logger.setLevel(logging.DEBUG)
app_logger.handlers = []
h = logging.StreamHandler(sys.stdout)
h.setFormatter(logging.Formatter("[%(levelname)-7s] %(name)s: %(message)s"))
app_logger.addHandler(h)
app_logger.propagate = False

app = App()
app.run()
print("  → 不同级别记录不同重要性的信息")`
  },

  // -----------------------------------------------------------
  // 第 70 章：subprocess
  // -----------------------------------------------------------
  {
    id: "py9-70",
    group: "标准库精讲",
    icon: "⚡",
    title: "subprocess：子进程",
    content: `## subprocess 是什么

\`subprocess\` 用来在 Python 里启动其他程序、命令。

\`\`\`python
import subprocess
\`\`\`

## run：最常用

\`\`\`python
result = subprocess.run(["echo", "hello"], capture_output=True, text=True)
result.stdout      # "hello\\n"
result.returncode  # 0（成功）
\`\`\`

参数：
- \`capture_output=True\`：捕获 stdout/stderr
- \`text=True\`：返回字符串（默认字节）
- \`timeout=10\`：超时秒数
- \`cwd=path\`：工作目录
- \`env=dict\`：环境变量

## 命令参数

推荐用**列表**形式：

\`\`\`python
subprocess.run(["ls", "-l", "/tmp"])    # ✅
subprocess.run("ls -l /tmp", shell=True)  # ⚠️ 字符串 + shell
\`\`\`

\`shell=True\` 会启动 shell 解释命令，**有注入风险**（用户输入时慎用）。

## check：失败抛异常

\`\`\`python
subprocess.run(["false"], check=True)    # 抛 CalledProcessError
\`\`\`

## Popen：更细控制

\`\`\`python
p = subprocess.Popen(["cmd"], stdout=subprocess.PIPE)
out, err = p.communicate()    # 等待完成
\`\`\`

Popen 适合：
- 流式读取输出
- 与子进程交互（stdin）
- 后台运行

## 管道

\`\`\`python
# 用 shell 管道
subprocess.run("ls | grep .py", shell=True, capture_output=True, text=True)
\`\`\`

## 实用场景

- 调用系统命令（ls、grep、git）
- 调用其他语言脚本
- 执行 shell 脚本

## 安全提示

- 用列表形式比 \`shell=True\` 安全
- 不要把用户输入直接拼进命令
- 处理 \`timeout\`、\`returncode\`、错误

## 本章 demo

demo 演示 subprocess 各种用法。`,
    code: `# ============================================
# 第 70 章：subprocess
# ============================================
import subprocess
import sys
import os

# --- 1. 基础 ---
print("=== 1. 基础 ===")
# 列表形式（推荐）
result = subprocess.run(
    ["echo", "hello subprocess"],
    capture_output=True,
    text=True
)
print(f"  returncode: {result.returncode}")
print(f"  stdout: {result.stdout!r}")
print(f"  stderr: {result.stderr!r}")

# 不捕获，直接输出到终端
print("  直接输出:")
subprocess.run(["echo", "这条直接到终端"])

# --- 2. 命令参数 ---
print("\\n=== 2. 参数 ===")
# 列表形式：每个参数一个元素
result = subprocess.run(["python3", "-c", "print(1+1)"], capture_output=True, text=True)
print(f"  python3 -c 'print(1+1)': {result.stdout.strip()}")

# 字符串 + shell=True
result = subprocess.run("echo $HOME", shell=True, capture_output=True, text=True)
print(f"  echo $HOME (shell): {result.stdout.strip()}    ← shell 解析变量")

# --- 3. 返回码 ---
print("\\n=== 3. 返回码 ===")
# 成功
r1 = subprocess.run(["true"])
print(f"  true 返回码: {r1.returncode}")

# 失败
r2 = subprocess.run(["false"])
print(f"  false 返回码: {r2.returncode}")

# check=True 失败抛异常
try:
    subprocess.run(["false"], check=True)
except subprocess.CalledProcessError as e:
    print(f"  check=True 抛异常: returncode={e.returncode}")

# --- 4. 捕获输出 ---
print("\\n=== 4. 捕获 ===")
# stdout
result = subprocess.run(["python3", "-c", "print('output'); import sys; sys.stderr.write('error')"],
                       capture_output=True, text=True)
print(f"  stdout: {result.stdout.strip()}")
print(f"  stderr: {result.stderr.strip()}")

# 字节模式
result = subprocess.run(["echo", "bytes"], capture_output=True)
print(f"  字节模式: {result.stdout!r}    ← bytes")
print(f"  解码: {result.stdout.decode().strip()}")

# --- 5. 工作目录和环境 ---
print("\\n=== 5. cwd/env ===")
# cwd 指定工作目录
result = subprocess.run(["pwd"], capture_output=True, text=True)
print(f"  默认 cwd: {result.stdout.strip()}")

import tempfile
tmp = tempfile.mkdtemp()
result = subprocess.run(["pwd"], capture_output=True, text=True, cwd=tmp)
print(f"  cwd={tmp}: {result.stdout.strip()}")

# env 传入环境变量
result = subprocess.run(
    ["python3", "-c", "import os; print(os.environ.get('MY_VAR', '无'))"],
    capture_output=True, text=True,
    env={**os.environ, "MY_VAR": "hello"}
)
print(f"  env MY_VAR: {result.stdout.strip()}")

# --- 6. 输入 ---
print("\\n=== 6. stdin ===")
# 通过 input 参数传输入
result = subprocess.run(
    ["python3", "-c", "data = input(); print('收到:', data)"],
    input="来自 Python 的输入",
    capture_output=True,
    text=True
)
print(f"  传输入: {result.stdout.strip()}")

# 多行输入
result = subprocess.run(
    ["python3", "-c", "import sys; print(sum(int(x) for x in sys.stdin))"],
    input="1\\n2\\n3\\n4\\n5",
    capture_output=True,
    text=True
)
print(f"  多行求和: {result.stdout.strip()}")

# --- 7. 超时 ---
print("\\n=== 7. 超时 ===")
try:
    subprocess.run(["python3", "-c", "import time; time.sleep(5)"], timeout=1)
    print("  没超时")
except subprocess.TimeoutExpired as e:
    print(f"  超时: {e}    ← 1秒后强制结束")

# --- 8. Popen 交互 ---
print("\\n=== 8. Popen ===")
# 启动子进程
p = subprocess.Popen(
    ["python3", "-c", """
import sys
for i in range(5):
    print(f'行 {i}')
    sys.stdout.flush()
"""],
    stdout=subprocess.PIPE,
    text=True
)

# 流式读取
print("  流式读:")
for line in p.stdout:
    print(f"    收到: {line.strip()}")

p.wait()
print(f"  返回码: {p.returncode}")

# --- 9. 管道 ---
print("\\n=== 9. 管道 ===")
# 用 shell 管道
result = subprocess.run(
    "echo 'a b c a b a' | tr ' ' '\\n' | sort | uniq -c | sort -rn",
    shell=True, capture_output=True, text=True
)
print(f"  统计字符:")
print(result.stdout)

# 不用 shell，用 Popen 串联
print("  Popen 串联:")
p1 = subprocess.Popen(["echo", "apple banana apple cherry banana apple"],
                     stdout=subprocess.PIPE, text=True)
p2 = subprocess.Popen(["tr", " ", "\\n"], stdin=p1.stdout, stdout=subprocess.PIPE, text=True)
p1.stdout.close()
p3 = subprocess.Popen(["sort"], stdin=p2.stdout, stdout=subprocess.PIPE, text=True)
p2.stdout.close()
p4 = subprocess.Popen(["uniq", "-c"], stdin=p3.stdout, stdout=subprocess.PIPE, text=True)
p3.stdout.close()
output = p4.communicate()[0]
print(output.rstrip())

# --- 10. 实用 ---
print("\\n=== 10. 实用 ===")

# 检查命令是否存在
def command_exists(cmd):
    """检查命令是否存在"""
    try:
        subprocess.run(["which", cmd], capture_output=True, check=True)
        return True
    except subprocess.CalledProcessError:
        return False

for cmd in ["python3", "git", "nonexistent_cmd"]:
    print(f"  {cmd} 存在: {command_exists(cmd)}")

# 获取 git 信息
if command_exists("git"):
    try:
        result = subprocess.run(
            ["git", "--version"],
            capture_output=True, text=True, check=True
        )
        print(f"  git 版本: {result.stdout.strip()}")
    except subprocess.CalledProcessError:
        print("  git 不可用")

# 调用 Python 自己
def run_python(code):
    """执行 Python 代码并返回输出"""
    result = subprocess.run(
        ["python3", "-c", code],
        capture_output=True, text=True, timeout=5
    )
    if result.returncode != 0:
        return f"错误: {result.stderr}"
    return result.stdout

print(f"  run_python('print(2**10)'): {run_python('print(2**10)').strip()}")
print(f"  run_python('print(sum(range(101)))'): {run_python('print(sum(range(101)))').strip()}")

# 清理
import shutil
shutil.rmtree(tmp)
print("\\n  → subprocess 是 Python 调用外部命令的标准方式")`
  }
];
