export const chapters = [
  {
    id: "py6-datetime",
    group: "内置模块",
    icon: "📅",
    title: "datetime 日期时间",
    content: `## datetime 模块详解

datetime是Python处理日期时间的标准库，提供date、time、datetime、timedelta、timezone等类。

### 核心类

| 类 | 说明 |
|-----|------|
| \`datetime.date\` | 日期（年、月、日） |
| \`datetime.time\` | 时间（时、分、秒、微秒） |
| \`datetime.datetime\` | 日期+时间 |
| \`datetime.timedelta\` | 时间间隔（可用于日期运算） |
| \`datetime.timezone\` | 时区（Python 3.2+） |

### 常用方法

- \`datetime.now()\`：当前本地时间
- \`datetime.utcnow()\`：当前UTC时间（注意：Python 3.12推荐用now(timezone.utc)）
- \`strftime(format)\`：datetime → 格式化字符串
- \`strptime(str, format)\`：字符串 → datetime
- \`timedelta(days=, hours=, ...)\`：创建时间差

### 格式化符号

| 符号 | 含义 | 示例 |
|------|------|------|
| %Y | 4位年 | 2024 |
| %m | 2位月 | 01-12 |
| %d | 2位日 | 01-31 |
| %H | 24小时制 | 00-23 |
| %M | 分钟 | 00-59 |
| %S | 秒 | 00-59 |
| %f | 微秒 | 000000-999999 |
| %A | 星期全名 | Monday |
| %B | 月份全名 | January |
| %j | 一年中第几天 | 001-366 |
| %x | 本地日期格式 | |
| %X | 本地时间格式 | |`,
    code: `from datetime import date, time, datetime, timedelta, timezone

print("=" * 50)
print("1. 获取当前时间")
print("=" * 50)
now = datetime.now()
print(f"当前本地时间: {now}")
print(f"年: {now.year}, 月: {now.month}, 日: {now.day}")
print(f"时: {now.hour}, 分: {now.minute}, 秒: {now.second}")
print(f"星期: {now.weekday()} (0=周一, 6=周日)")
print(f"星期: {now.isoweekday()} (1=周一, 7=周日)")

# UTC时间（Python 3.12+推荐写法）
utc_now = datetime.now(timezone.utc)
print(f"UTC时间: {utc_now}")

# ========== 2. 创建指定日期时间 ==========
print("\\n" + "=" * 50)
print("2. 创建指定日期时间")
print("=" * 50)
d = date(2024, 6, 15)
print(f"日期: {d}")
t = time(14, 30, 45)
print(f"时间: {t}")
dt = datetime(2024, 6, 15, 14, 30, 45)
print(f"日期时间: {dt}")

# 从时间戳创建
import time as time_module
ts = time_module.time()
dt_from_ts = datetime.fromtimestamp(ts)
print(f"从时间戳创建: {dt_from_ts}")

# ========== 3. 日期运算 ==========
print("\\n" + "=" * 50)
print("3. timedelta 时间差运算")
print("=" * 50)
today = date.today()
tomorrow = today + timedelta(days=1)
yesterday = today - timedelta(days=1)
next_week = today + timedelta(weeks=1)
print(f"今天: {today}")
print(f"明天: {tomorrow}")
print(f"昨天: {yesterday}")
print(f"下周: {next_week}")

# 计算两个日期差
birthday = date(2000, 1, 1)
age_delta = today - birthday
print(f"从{birthday}到今天: {age_delta.days}天")
print(f"约 {age_delta.days // 365} 年")

# 时间差运算
dt1 = datetime(2024, 1, 1, 12, 0, 0)
dt2 = datetime(2024, 1, 1, 14, 30, 0)
diff = dt2 - dt1
print(f"时间差: {diff} = {diff.total_seconds()}秒")

# ========== 4. strftime 格式化 ==========
print("\\n" + "=" * 50)
print("4. strftime 格式化为字符串")
print("=" * 50)
now = datetime.now()
print(f"完整格式: {now.strftime('%Y-%m-%d %H:%M:%S')}")
print(f"中文日期: {now.strftime('%Y年%m月%d日 %H时%M分%S秒')}")
print(f"日期部分: {now.strftime('%x')}")
print(f"时间部分: {now.strftime('%X')}")
print(f"星期全名: {now.strftime('%A')}")
print(f"月份全名: {now.strftime('%B')}")
print(f"ISO格式: {now.isoformat()}")

# ========== 5. strptime 解析字符串 ==========
print("\\n" + "=" * 50)
print("5. strptime 从字符串解析")
print("=" * 50)
date_strs = [
    ("2024-06-15", "%Y-%m-%d"),
    ("15/06/2024", "%d/%m/%Y"),
    ("2024年6月15日 14:30", "%Y年%m月%d日 %H:%M"),
    ("Jun 15, 2024", "%b %d, %Y"),
]
for s, fmt in date_strs:
    parsed = datetime.strptime(s, fmt)
    print(f"  {s!r:30} -> {parsed}")

# ========== 6. replace 修改部分值 ==========
print("\\n" + "=" * 50)
print("6. replace 修改部分字段")
print("=" * 50)
dt = datetime.now()
print(f"当前: {dt}")
print(f"修改为0点: {dt.replace(hour=0, minute=0, second=0, microsecond=0)}")
print(f"修改为月初: {dt.replace(day=1)}")

# ========== 7. 时区（固定偏移） ==========
print("\\n" + "=" * 50)
print("7. 时区处理（固定偏移 timezone）")
print("=" * 50)
# timezone(timedelta) 创建固定偏移时区，不含 DST（夏令时）信息
from datetime import timedelta as td
# 北京时间是 UTC+8，用固定偏移创建时区对象
beijing_tz = timezone(td(hours=8))
# datetime.now(tz) 获取指定时区的当前时间（推荐方式，替代 utcnow()）
beijing_time = datetime.now(beijing_tz)
print(f"北京时间: {beijing_time}")
print(f"UTC时间: {datetime.now(timezone.utc)}")
# 时区转换：astimezone 将一个时区的时间转换为另一个时区
utc_time = beijing_time.astimezone(timezone.utc)
print(f"北京时间转UTC: {utc_time}")

# ========== 8. zoneinfo（Python 3.9+，IANA 时区数据库） ==========
print("\\n" + "=" * 50)
print("8. zoneinfo IANA 时区（Python 3.9+）")
print("=" * 50)
# zoneinfo 使用操作系统的 IANA 时区数据库（如 "Asia/Shanghai"）
# 优势：自动处理夏令时、历史时区变更，比 timezone(timedelta) 更准确
try:
    from zoneinfo import ZoneInfo
    # 上海时区（含历史夏令时规则）
    shanghai_tz = ZoneInfo("Asia/Shanghai")
    # 纽约时区（自动处理夏令时切换）
    ny_tz = ZoneInfo("America/New_York")
    # 伦敦时区
    london_tz = ZoneInfo("Europe/London")

    # 用 ZoneInfo 创建带时区的时间
    dt_shanghai = datetime.now(shanghai_tz)
    print(f"上海时间: {dt_shanghai}")
    # 同一时刻在不同时区的表示
    dt_ny = dt_shanghai.astimezone(ny_tz)
    dt_london = dt_shanghai.astimezone(london_tz)
    print(f"纽约时间: {dt_ny}")
    print(f"伦敦时间: {dt_london}")
    print(f"时差(上海-纽约): {dt_shanghai.utcoffset() - dt_ny.utcoffset()}")
    print("zoneinfo 自动处理夏令时，比 timezone(timedelta) 更准确")
except ImportError:
    print("zoneinfo 需要 Python 3.9+")
`
  },
  {
    id: "py6-time",
    group: "内置模块",
    icon: "⏰",
    title: "time 时间模块",
    content: `## time 模块

time模块提供底层时间相关函数，主要处理时间戳、格式化、睡眠计时等。

### 核心概念

- **时间戳(timestamp)**：从1970-01-01 00:00:00 UTC到现在的秒数（浮点数）
- **struct_time**：命名元组形式的时间，包含tm_year到tm_yday等9个字段
- **格式化字符串**：与datetime.strftime/strptime基本一致

### 常用函数

| 函数 | 说明 |
|------|------|
| \`time.time()\` | 当前时间戳（秒） |
| \`time.sleep(sec)\` | 休眠指定秒数 |
| \`time.ctime(ts)\` | 时间戳 → 可读字符串 |
| \`time.localtime(ts)\` | 时间戳 → 本地struct_time |
| \`time.gmtime(ts)\` | 时间戳 → UTC struct_time |
| \`time.mktime(st)\` | struct_time → 时间戳 |
| \`time.strftime(fmt, st)\` | struct_time → 字符串 |
| \`time.strptime(s, fmt)\` | 字符串 → struct_time |
| \`time.perf_counter()\` | 高精度性能计时器 |
| \`time.monotonic()\` | 单调时钟（不受系统时间调整影响） |

### perf_counter vs time

- \`time.time()\`：系统时钟，可能被NTP调整影响
- \`time.perf_counter()\`：最高精度，用于基准测试
- \`time.monotonic()\`：单调递增，不会回退，适合计算超时`,
    code: `import time

print("=" * 50)
print("1. 时间戳基础")
print("=" * 50)
ts = time.time()
print(f"当前时间戳: {ts}")
print(f"整数部分: {int(ts)}")
print(f"ctime可读: {time.ctime(ts)}")

# ========== 2. struct_time ==========
print("\\n" + "=" * 50)
print("2. struct_time 时间元组")
print("=" * 50)
local = time.localtime()
print(f"本地时间struct: {local}")
print(f"  年: {local.tm_year}")
print(f"  月: {local.tm_mon}")
print(f"  日: {local.tm_mday}")
print(f"  时:分:秒: {local.tm_hour}:{local.tm_min}:{local.tm_sec}")
print(f"  星期(0=周一): {local.tm_wday}")
print(f"  一年中第几天: {local.tm_yday}")
print(f"  是否夏令时: {local.tm_isdst}")

# UTC时间
utc = time.gmtime()
print(f"UTC时间: {utc.tm_hour}:{utc.tm_min}:{utc.tm_sec}")

# ========== 3. 格式化 ==========
print("\\n" + "=" * 50)
print("3. 格式化与解析")
print("=" * 50)
print(f"默认格式(ctime): {time.ctime()}")
print(f"自定义: {time.strftime('%Y-%m-%d %H:%M:%S')}")
print(f"中文: {time.strftime('%Y年%m月%d日 %H时%M分%S秒')}")
print(f"ISO: {time.strftime('%Y-%m-%dT%H:%M:%S%z')}")

# strptime解析
parsed = time.strptime("2024-06-15 14:30:00", "%Y-%m-%d %H:%M:%S")
print(f"解析结果: {parsed.tm_year}-{parsed.tm_mon}-{parsed.tm_mday}")

# mktime转回时间戳
ts_back = time.mktime(parsed)
print(f"转回时间戳: {ts_back}")

# ========== 4. sleep 休眠 ==========
print("\\n" + "=" * 50)
print("4. sleep 休眠演示（短暂）")
print("=" * 50)
print("开始...")
start = time.perf_counter()
time.sleep(0.1)
elapsed = time.perf_counter() - start
print(f"sleep(0.1)实际耗时: {elapsed:.4f}秒")

# ========== 5. 性能计时 ==========
print("\\n" + "=" * 50)
print("5. perf_counter 性能计时")
print("=" * 50)
def slow_func():
    total = 0
    for i in range(1000000):
        total += i
    return total

start = time.perf_counter()
result = slow_func()
elapsed = time.perf_counter() - start
print(f"计算结果: {result}")
print(f"耗时: {elapsed:.6f}秒")

# ========== 6. monotonic 单调时钟 ==========
print("\\n" + "=" * 50)
print("6. monotonic 单调时钟（不会倒退）")
print("=" * 50)
t0 = time.monotonic()
time.sleep(0.05)
t1 = time.monotonic()
print(f"单调时钟时间差: {t1 - t0:.4f}秒")
print("适合计算超时/时间间隔，不受系统时间调整影响")

# ========== 7. 实际应用：超时检测 ==========
print("\\n" + "=" * 50)
print("7. 应用示例：循环超时检测")
print("=" * 50)
timeout = 0.3
start = time.monotonic()
count = 0
while time.monotonic() - start < timeout:
    count += 1
print(f"{timeout}秒内循环执行了{count}次")

# ========== 8. 进程时间 ==========
print("\\n" + "=" * 50)
print("8. process_time 仅CPU时间")
print("=" * 50)
start_cpu = time.process_time()
for _ in range(5):
    sum(range(100000))
cpu_time = time.process_time() - start_cpu
print(f"CPU时间: {cpu_time:.6f}秒（不含sleep时间）")
`
  },
  {
    id: "py6-calendar",
    group: "内置模块",
    icon: "📆",
    title: "calendar 日历模块",
    content: `## calendar 日历模块

calendar模块提供日历相关功能，生成月份/年历、判断闰年、计算星期等。

### 常用函数

| 函数 | 说明 |
|------|------|
| \`calendar.month(year, month)\` | 返回月历字符串 |
| \`calendar.prmonth(year, month)\` | 直接打印月历 |
| \`calendar.calendar(year)\` | 返回年历字符串 |
| \`calendar.isleap(year)\` | 判断是否闰年 |
| \`calendar.leapdays(y1, y2)\` | 两年间闰年数 |
| \`calendar.weekday(y, m, d)\` | 星期几（0=周一） |
| \`calendar.monthrange(y, m)\` | 返回(星期, 天数) |
| \`calendar.monthcalendar(y, m)\` | 返回日期矩阵 |
| \`calendar.day_name\` | 星期名称序列 |
| \`calendar.month_name\` | 月份名称序列 |

### 闰年规则

- 能被4整除但不能被100整除，**或**
- 能被400整除

即：\`(y%4==0 and y%100!=0) or y%400==0\``,
    code: `import calendar

print("=" * 50)
print("1. 月历输出")
print("=" * 50)
print(calendar.month(2024, 6))

# 直接打印
print("prmonth(2024, 1)直接打印：")
calendar.prmonth(2024, 1)

# ========== 2. 年历 ==========
print("\\n" + "=" * 50)
print("2. 年历（前3个月）")
print("=" * 50)
cal = calendar.calendar(2024)
lines = cal.split('\\n')
for line in lines[:12]:
    print(line)

# ========== 3. 闰年判断 ==========
print("\\n" + "=" * 50)
print("3. 闰年判断")
print("=" * 50)
test_years = [1900, 2000, 2020, 2023, 2024, 2100]
for y in test_years:
    is_leap = calendar.isleap(y)
    print(f"  {y}年: {'闰年' if is_leap else '平年'}")

leap_count = calendar.leapdays(2000, 2050)
print(f"2000-2050年间有{leap_count}个闰年")

# ========== 4. 星期计算 ==========
print("\\n" + "=" * 50)
print("4. weekday 星期计算")
print("=" * 50)
days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
dates = [(2024, 6, 1), (2024, 10, 1), (2024, 12, 25)]
for y, m, d in dates:
    wd = calendar.weekday(y, m, d)
    print(f"  {y}-{m:02d}-{d:02d} 是{days[wd]}")

# ========== 5. monthrange ==========
print("\\n" + "=" * 50)
print("5. monthrange 获取月信息")
print("=" * 50)
for m in range(1, 13):
    first_weekday, num_days = calendar.monthrange(2024, m)
    print(f"  2024年{m:2d}月: 第1天是{days[first_weekday]}, 共{num_days}天")

# ========== 6. monthcalendar 日期矩阵 ==========
print("\\n" + "=" * 50)
print("6. monthcalendar 日期矩阵（2024年6月）")
print("=" * 50)
print("  周一 周二 周三 周四 周五 周六 周日")
cal_matrix = calendar.monthcalendar(2024, 6)
for week in cal_matrix:
    print(" ", end="")
    for day in week:
        if day == 0:
            print("   ", end=" ")
        else:
            print(f"{day:3d}", end=" ")
    print()

# ========== 7. 中英文星期/月份名 ==========
print("\\n" + "=" * 50)
print("7. day_name / month_name")
print("=" * 50)
print("星期:", list(calendar.day_name))
print("月份:", list(calendar.month_name)[1:])

# ========== 8. firstweekday 设置 ==========
print("\\n" + "=" * 50)
print("8. 设置每周第一天（0=周一，6=周日）")
print("=" * 50)
calendar.setfirstweekday(calendar.SUNDAY)
print(f"当前每周第一天: {calendar.firstweekday()} (0=周一,6=周日)")
print("2024年6月（周日开头）：")
print(calendar.month(2024, 6))
calendar.setfirstweekday(calendar.MONDAY)

# ========== 9. 实用：计算某月工作日 ==========
print("=" * 50)
print("9. 实用：计算工作日（周一到周五）")
print("=" * 50)
def count_workdays(year, month):
    cal = calendar.monthcalendar(year, month)
    workdays = 0
    for week in cal:
        for i, day in enumerate(week):
            if day != 0 and i < 5:
                workdays += 1
    return workdays

for m in [1, 6, 10]:
    wd = count_workdays(2024, m)
    print(f"  2024年{m}月: {wd}个工作日")
`
  },
  {
    id: "py6-re-basic",
    group: "内置模块",
    icon: "🔍",
    title: "正则表达式基础",
    content: `## 正则表达式基础 (re模块)

正则表达式是强大的文本匹配工具，Python通过\`re\`模块提供完整支持。

### 基本匹配函数

| 函数 | 说明 |
|------|------|
| \`re.match(pattern, string)\` | 从字符串**开头**匹配 |
| \`re.search(pattern, string)\` | 搜索**第一个**匹配位置 |
| \`re.findall(pattern, string)\` | 找到**所有**匹配，返回列表 |
| \`re.finditer(pattern, string)\` | 所有匹配，返回迭代器 |
| \`re.fullmatch(pattern, string)\` | 完整匹配整个字符串 |

### 普通字符

- 字母数字匹配自身：\`hello\`匹配"hello"
- 大多数字符匹配自身，除了特殊字符：. ^ $ * + ? { } [ ] \\ | ( )

### 元字符（特殊字符）

| 元字符 | 含义 |
|--------|------|
| \`.\` | 任意字符（除换行） |
| \`^\` | 字符串开头 |
| \`$\` | 字符串结尾 |
| \`*\` | 前面模式重复0次或多次 |
| \`+\` | 前面模式重复1次或多次 |
| \`?\` | 前面模式重复0次或1次 |
| \`{n}\` | 恰好n次 |
| \`{n,m}\` | n到m次 |
| \`\\d\` | 数字，等价[0-9] |
| \`\\D\` | 非数字 |
| \`\\w\` | 单词字符[a-zA-Z0-9_] |
| \`\\W\` | 非单词字符 |
| \`\\s\` | 空白字符（空格/制表/换行） |
| \`\\S\` | 非空白字符 |
| \`[abc]\` | 字符类：匹配a/b/c中任意一个 |
| \`[^abc]\` | 不在a/b/c中 |
| \`[a-z]\` | 字符范围：a到z |
| \`\\|\` | 或（分支） |
| \`(...)\` | 分组捕获 |`,
    code: `import re

# ========== 1. match vs search vs findall ==========
print("=" * 50)
print("1. match / search / findall 区别")
print("=" * 50)
text = "abc123def456ghi789"

m1 = re.match(r'abc', text)
print(f"match('abc'): {m1}  <-- 开头匹配")
m2 = re.match(r'123', text)
print(f"match('123'): {m2}  <-- 不在开头，不匹配")
m3 = re.search(r'123', text)
print(f"search('123'): {m3}  <-- 搜索到第一个")
m4 = re.findall(r'\\d+', text)
print(rf"findall(r'\\d+'): {m4}  <-- 所有匹配")

# ========== 2. 元字符演示 ==========
print("\\n" + "=" * 50)
print("2. 元字符演示")
print("=" * 50)

# . 任意字符
print(f". 匹配任意字符: {re.findall(r'a.c', 'abc axc a1c a.c')}")

# ^ 开头 $ 结尾
print(f"^ 开头: {re.findall(r'^hello', 'hello world')}")
print(f"$ 结尾: {re.findall(r'world$', 'hello world')}")

# * + ? 量词
print(f"a* (0或多): {re.findall(r'ab*', 'a ab abb abbb')}")
print(f"a+ (1或多): {re.findall(r'ab+', 'a ab abb abbb')}")
print(f"a? (0或1): {re.findall(r'ab?', 'a ab abb abbb')}")

# {n} {n,m}
print(f"a{{2}}: {re.findall(r'a{2}', 'a aa aaa aaaa')}")
print(f"a{{2,3}}: {re.findall(r'a{2,3}', 'a aa aaa aaaa')}")

# ========== 3. 字符类 ==========
print("\\n" + "=" * 50)
print(r"3. 字符类 \\d \\w \\s [...]")
print("=" * 50)
text = "电话: 138-1234-5678, 邮箱: test@example.com"
print(rf"所有数字(\\d+): {re.findall(r'\\d+', text)}")
print(rf"所有单词(\\w+): {re.findall(r'\\w+', text)}")
print(f"[0-9]+: {re.findall(r'[0-9-]+', text)}")
print(f"[a-z]+: {re.findall(r'[a-z]+', text)}")
print(f"[a-zA-Z]+: {re.findall(r'[a-zA-Z]+', text)}")
print(f"[^a-z]+ 非小写字母: {re.findall(r'[^a-z]+', text)[:3]}...")

# ========== 4. 实际应用：提取数字 ==========
print("\\n" + "=" * 50)
print("4. 实际应用：提取信息")
print("=" * 50)

# 手机号（简单版）
phone_pattern = r'1[3-9]\\d{9}'
test_phones = "联系电话：13812345678，备用：15987654321，无效：12345678901"
print(f"提取手机号: {re.findall(phone_pattern, test_phones)}")

# 邮箱（简单版）
email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'
emails = "联系：zhang@example.com, li.si@company.org, 无效@abc"
print(f"提取邮箱: {re.findall(email_pattern, emails)}")

# ========== 5. match对象用法 ==========
print("\\n" + "=" * 50)
print("5. match对象的方法")
print("=" * 50)
m = re.search(r'(\\d{3})-(\\d{4})-(\\d{4})', "电话：010-1234-5678 地址...")
if m:
    print(f"完整匹配group(): {m.group()}")
    print(f"group(0): {m.group(0)}")
    print(f"group(1): {m.group(1)}")
    print(f"group(2): {m.group(2)}")
    print(f"groups(): {m.groups()}")
    print(f"起始位置start(): {m.start()}")
    print(f"结束位置end(): {m.end()}")
    print(f"跨度span(): {m.span()}")

# ========== 6. 常用正则模式 ==========
print("\\n" + "=" * 50)
print("6. 常用正则模式")
print("=" * 50)
patterns = [
    (r'\\d{4}-\\d{2}-\\d{2}', '日期YYYY-MM-DD'),
    (r'\\d+\\.\\d+', '浮点数'),
    (r'https?://[\\w.-]+(/[\\w./-]*)?', 'URL'),
    (r'#[0-9a-fA-F]{6}', '十六进制颜色'),
    (r'\\d{15}|\\d{18}', '身份证号(简单)'),
]
test_text = "日期：2024-06-15，价格99.9元，网址https://example.com/path，颜色#FF5733"
for pat, desc in patterns:
    result = re.findall(pat, test_text)
    print(f"  {desc}: {result}")

# ========== 7. OR分支 ==========
print("\\n" + "=" * 50)
print("7. | 或分支")
print("=" * 50)
print(f"匹配python|java: {re.findall(r'python|java|go', 'I love python, java and go')}")
print(f"匹配月份: {re.findall(r'Jan|Feb|Mar|Apr|May|Jun', 'Jan Feb Mar Apr May Jun Jul')}")
`
  },
  {
    id: "py6-re-advanced",
    group: "内置模块",
    icon: "🎯",
    title: "正则表达式进阶",
    content: `## 正则表达式进阶

### 分组与捕获

- \`(pattern)\`：捕获分组，可通过group(n)获取
- \`(?:pattern)\`：非捕获分组，不保存匹配内容
- \`(?P<name>pattern)\`：命名分组，可通过group('name')获取
- \`\\1 \\2\`：反向引用，引用之前分组匹配的内容

### re.sub 替换

\`re.sub(pattern, repl, string)\`：替换匹配内容
- repl可以是字符串，也可以是函数
- \`\\1 \\g<name>\`可在替换字符串中引用分组

### re.split 分割

\`re.split(pattern, string)\`：按模式分割字符串，比str.split更强大

### 贪婪 vs 非贪婪

- **贪婪**（默认）：\`*\` \`+\` \`?\` \`{n,m}\` 尽可能多匹配
- **非贪婪**：\`*?\` \`+?\` \`??\` \`{n,m}?\` 尽可能少匹配

### 前瞻断言

| 模式 | 含义 |
|------|------|
| \`(?=pattern)\` | 正向肯定前瞻：后面是pattern |
| \`(?!pattern)\` | 正向否定前瞻：后面不是pattern |
| \`(?<=pattern)\` | 反向肯定前瞻：前面是pattern |
| \`(?<!pattern)\` | 反向否定前瞻：前面不是pattern |

### re.compile 编译

重复使用同一模式时，先\`re.compile()\`编译可提高性能：
\`\`\`pythonimport re
# 使用 re.compile 预编译正则表达式 r'\d+'，预编译可在多次匹配时提升效率
pattern = re.compile(r'\\d+')
# 调用 findall 在文本 text 中查找全部匹配项，返回匹配字符串列表
pattern.findall(text)
\`\`\`

### 常用标志flags

- \`re.IGNORECASE / re.I\`：忽略大小写
- \`re.MULTILINE / re.M\`：多行模式，^$匹配每行
- \`re.DOTALL / re.S\`：.匹配包括换行符
- \`re.VERBOSE / re.X\`：冗长模式，可加注释和空白`,
    code: `import re

# ========== 1. 捕获分组 ==========
print("=" * 50)
print("1. 捕获分组 ()")
print("=" * 50)
m = re.search(r'(\\w+)@(\\w+)\\.(\\w+)', 'Email: zhangsan@example.com')
print(f"groups(): {m.groups()}")
print(f"用户名: {m.group(1)}")
print(f"域名: {m.group(2)}")
print(f"后缀: {m.group(3)}")

# ========== 2. 命名分组 ==========
print("\\n" + "=" * 50)
print("2. 命名分组 (?P<name>)")
print("=" * 50)
# 命名分组用 (?P<名字>模式) 定义，比数字索引更易读、更易维护
# 适合模式复杂、分组多的场景，避免 group(1)/group(2) 混淆
m = re.search(r'(?P<year>\\d{4})-(?P<month>\\d{2})-(?P<day>\\d{2})',
              '日期: 2024-06-15')
# groupdict() 返回 {名字: 匹配内容} 的字典
print(f"groupdict(): {m.groupdict()}")
# 也可用 group('名字') 获取单个分组
print(f"年: {m.group('year')}")
print(f"月: {m.group('month')}")
print(f"日: {m.group('day')}")

# ========== 3. 非捕获分组 (?:) ==========
print("\\n" + "=" * 50)
print("3. 非捕获分组 (?:...)")
print("=" * 50)
text = "https://example.com http://test.org ftp://files.net"
# 捕获分组
print(f"捕获分组结果: {re.findall(r'(https?|ftp)://([\\w.-]+)', text)}")
# 非捕获分组（只保留域名）
print(f"非捕获?: {re.findall(r'(?:https?|ftp)://([\\w.-]+)', text)}")

# ========== 4. 反向引用 ==========
print("\\n" + "=" * 50)
print("4. 反向引用 \\1 \\2")
print("=" * 50)
# 匹配重复单词
doubles = re.findall(r'(\\w+) \\1', 'hello hello world world python java')
print(f"连续重复单词: {doubles}")
# 匹配成对标签
tags = re.findall(r'<(\\w+)>.*?</\\1>', '<b>bold</b> <i>italic</i> <div>div</p>')
print(f"匹配成对HTML标签: {tags}")

# ========== 5. 贪婪 vs 非贪婪 ==========
print("\\n" + "=" * 50)
print("5. 贪婪 vs 非贪婪")
print("=" * 50)
# 贪婪（默认）：量词 * + ? {n,m} 尽可能多匹配，会一直找到最后一个匹配点
# 非贪婪：在量词后加 ?（即 *? +? ?? {n,m}?）尽可能少匹配，找到第一个就停
html = "<div>内容1</div><div>内容2</div>"
# 贪婪 .* 会匹配到字符串最后的 </div>，导致跨标签匹配（错误结果）
print(f"贪婪匹配.*: {re.findall(r'<div>.*</div>', html)}")
# 非贪婪 .*? 匹配到第一个 </div> 就停止，正确提取每个标签
print(f"非贪婪.*?: {re.findall(r'<div>.*?</div>', html)}")
print()
text2 = "a123b456b789b"
# 贪婪 a.*b：从 a 匹配到最后的 b，结果 "a123b456b789b"
print(f"贪婪a.*b: {re.findall(r'a.*b', text2)}")
# 非贪婪 a.*?b：从 a 匹配到第一个 b，结果 "a123b"
print(f"非贪婪a.*?b: {re.findall(r'a.*?b', text2)}")

# ========== 6. re.sub 替换 ==========
print("\\n" + "=" * 50)
print("6. re.sub 替换")
print("=" * 50)
# 基本替换
text = "我的电话是 138-1234-5678，还有 159-8765-4321"
result = re.sub(r'\\d{3}-\\d{4}-', '***-****-', text)
print(f"脱敏电话: {result}")
# 替换中引用分组
date_text = "今天是2024-06-15，明天是2024-06-16"
result = re.sub(r'(\\d{4})-(\\d{2})-(\\d{2})', r'\\2/\\3/\\1', date_text)
print(f"日期格式转换: {result}")
# 函数替换
def double_num(m):
    return str(int(m.group()) * 2)
result = re.sub(r'\\d+', double_num, "数字: 1 2 3 4 5")
print(f"数字翻倍: {result}")

# ========== 7. re.split 分割 ==========
print("\\n" + "=" * 50)
print("7. re.split 分割")
print("=" * 50)
text = "apple,banana;orange|grape  cherry"
print(f"按多种分隔符分割: {re.split(r'[,;|\\s]+', text)}")
# 保留分隔符
print(f"保留分隔符: {re.split(r'(,|;|\\|| )', 'a,b;c|d e')}")

# ========== 8. 前瞻断言 ==========
print("\\n" + "=" * 50)
print("8. 前瞻断言")
print("=" * 50)
prices = "价格: 100元 200$ 300€ 500"
# 后面跟着"元"的数字
print(f"人民币(后面是元): {re.findall(r'\\d+(?=元)', prices)}")
# 后面不是"元"的数字
print(f"非人民币(后面不是元): {re.findall(r'\\d+(?!元)\\$?', prices)}")
# 前面是$的数字
print(f"美元(前面是$): {re.findall(r'(?<=\\$)\\d+', '价$99 价¥88 $199')}")
# 单词边界
words = "this is a test. a123 not match."
print(f"独立单词a: {re.findall(r'\\ba\\b', words)}")

# ========== 9. compile + flags ==========
print("\\n" + "=" * 50)
print("9. re.compile 编译与标志")
print("=" * 50)
pattern = re.compile(r'python', re.IGNORECASE)
print(f"忽略大小写: {pattern.findall('Python PYTHON python')}")
# 多行模式
multi_text = """first line
second line
third line"""
print(f"多行^匹配: {re.findall(r'^\\w+', multi_text, re.MULTILINE)}")
# 实际应用：复杂邮箱密码验证
print("\\n密码强度验证：")
def check_password(pwd):
    if len(pwd) < 8:
        return False, "长度至少8位"
    if not re.search(r'[A-Z]', pwd):
        return False, "需要大写字母"
    if not re.search(r'[a-z]', pwd):
        return False, "需要小写字母"
    if not re.search(r'\\d', pwd):
        return False, "需要数字"
    return True, "密码强度合格"

for pwd in ["abc", "Abcdefg1", "password123", "Good1234"]:
    ok, msg = check_password(pwd)
    print(f"  {pwd!r:15} -> {'✓' if ok else '✗'} {msg}")

# ========== 10. re.VERBOSE 冗长模式（可读性） ==========
print("\\n" + "=" * 50)
print("10. re.VERBOSE / re.X 冗长模式")
print("=" * 50)
# re.VERBOSE 允许在正则中添加空白和注释，提升可读性
# 模式中的空白字符被忽略（除非在字符类 [] 中或用 \\ 转义）
# # 后的内容被视为注释直到行尾
phone_re = re.compile(r"""
    ^                   # 字符串开头
    (\\d{3})            # 区号（3位数字），捕获分组1
    [-.\\s]?            # 分隔符：横线/点/空白（可选）
    (\\d{4})            # 前4位号码，捕获分组2
    [-.\\s]?            # 分隔符（可选）
    (\\d{4})            # 后4位号码，捕获分组3
    $                   # 字符串结尾
""", re.VERBOSE)

test_phones = ["010-1234-5678", "010.1234.5678", "010 1234 5678", "01012345678"]
for p in test_phones:
    m = phone_re.match(p)
    if m:
        print(f"  {p:18} -> 区号={m.group(1)}-{m.group(2)}-{m.group(3)}")
    else:
        print(f"  {p:18} -> 不匹配")

# 复杂邮箱验证（VERBOSE 模式让正则更易维护）
email_re = re.compile(r"""
    ^                                   # 开头
    [a-zA-Z0-9.!#$%&'*+/=?^_\`{|}~-]+   # 用户名部分（允许的字符）
    @                                   # @ 符号
    ([a-zA-Z0-9-]+\\.)+                  # 域名（子域+点，可重复）
    [a-zA-Z]{2,}                        # 顶级域名（至少2个字母）
    $                                   # 结尾
""", re.VERBOSE)
print(f"\\n邮箱验证 'test@example.com': {bool(email_re.match('test@example.com'))}")
print("VERBOSE 优势：可加注释和换行，复杂正则更易维护")
`
  },
  {
    id: "py6-collections",
    group: "内置模块",
    icon: "🗃️",
    title: "collections模块",
    content: `## collections 模块

collections模块提供了多种有用的容器数据类型，是对内置list/dict/set/tuple的补充。

### 核心类

| 类 | 说明 |
|-----|------|
| \`namedtuple\` | 具名元组，可通过名字访问字段 |
| \`deque\` | 双端队列，高效两端添加/删除 |
| \`ChainMap\` | 链式映射，合并多个dict |
| \`Counter\` | 计数器，统计可哈希对象 |
| \`OrderedDict\` | 有序字典（Python 3.7+普通dict也有序） |
| \`defaultdict\` | 默认值字典，访问不存在key不报错 |

### Counter详解

- \`Counter(iterable)\`：统计元素出现次数
- \`most_common(n)\`：返回出现最多的n个元素
- \`elements()\`：返回所有元素
- \`update()\`：增加计数
- \`subtract()\`：减少计数

### defaultdict

- \`defaultdict(factory)\`：访问不存在的key时自动调用factory创建默认值
- 常用factory：\`int\`(0), \`list\`([]), \`set\`(set()), \`dict\`({})

### deque

- 双端队列，O(1)复杂度在两端操作
- \`append/pop\`从右端
- \`appendleft/popleft\`从左端
- \`rotate(n)\`旋转
- \`maxlen\`限制长度（自动弹出）`,
    code: `from collections import namedtuple, deque, ChainMap, Counter, defaultdict, OrderedDict

print("=" * 50)
print("1. namedtuple 具名元组")
print("=" * 50)
Point = namedtuple('Point', ['x', 'y'])
p = Point(10, 20)
print(f"p = {p}")
print(f"p.x = {p.x}, p.y = {p.y}")
print(f"p[0] = {p[0]}, p[1] = {p[1]}")
print(f"字段名: {p._fields}")
# _asdict转字典
print(f"_asdict(): {p._asdict()}")
# _replace创建新对象
p2 = p._replace(x=100)
print(f"_replace(x=100): {p2}")

# 实际应用
Student = namedtuple('Student', 'name age score')
students = [
    Student("张三", 20, 95),
    Student("李四", 21, 88),
    Student("王五", 19, 92),
]
for s in students:
    print(f"  {s.name}: {s.score}分")

# ========== 2. Counter 计数器 ==========
print("\\n" + "=" * 50)
print("2. Counter 计数器")
print("=" * 50)
words = ["apple", "banana", "apple", "orange", "banana", "apple", "grape"]
cnt = Counter(words)
print(f"统计结果: {cnt}")
print(f"apple出现: {cnt['apple']}次")
print(f"不存在的key: {cnt['mango']}次（不报错）")
print(f"most_common(2): {cnt.most_common(2)}")
print(f"elements(): {list(cnt.elements())}")

# 统计字符
char_cnt = Counter("hello world python")
print(f"字符统计: {char_cnt}")
print(f"最常见3个字符: {char_cnt.most_common(3)}")

# update/subtract
cnt2 = Counter(["apple", "grape"])
cnt.update(cnt2)
print(f"update后: {cnt}")
cnt.subtract({"apple": 2})
print(f"subtract后: {cnt}")

# ========== 3. defaultdict 默认字典 ==========
print("\\n" + "=" * 50)
print("3. defaultdict 默认值字典")
print("=" * 50)
# 按首字母分组单词
words = ["apple", "banana", "apricot", "blueberry", "cherry", "avocado"]
groups = defaultdict(list)
for w in words:
    groups[w[0]].append(w)
for k, v in sorted(groups.items()):
    print(f"  {k}: {v}")

# int计数器
word_count = defaultdict(int)
for w in words:
    word_count[w] += 1
print(f"计数: {dict(word_count)}")

# set去重
data = [("a", 1), ("b", 2), ("a", 3), ("b", 4), ("a", 1)]
grouped = defaultdict(set)
for k, v in data:
    grouped[k].add(v)
print(f"去重分组: {dict(grouped)}")

# ========== 4. deque 双端队列 ==========
print("\\n" + "=" * 50)
print("4. deque 双端队列")
print("=" * 50)
dq = deque([1, 2, 3])
print(f"初始: {dq}")
dq.append(4)
dq.appendleft(0)
print(f"append/appendleft: {dq}")
print(f"pop(): {dq.pop()}, popleft(): {dq.popleft()}")
print(f"弹出后: {dq}")
dq.extend([5, 6])
dq.extendleft([-1, -2])
print(f"extend/extendleft: {dq}")
# 旋转
dq2 = deque([1, 2, 3, 4, 5])
print(f"\\n旋转前: {dq2}")
dq2.rotate(2)
print(f"rotate(2)右移2: {dq2}")
dq2.rotate(-2)
print(f"rotate(-2)左移2: {dq2}")
# 限制长度
hist = deque(maxlen=3)
for i in range(5):
    hist.append(i)
    print(f"  append({i}): {list(hist)}")

# ========== 5. ChainMap 链式映射 ==========
print("\\n" + "=" * 50)
print("5. ChainMap 链式映射")
print("=" * 50)
default_config = {"debug": False, "port": 8080, "host": "localhost"}
user_config = {"port": 9090, "debug": True}
cmd_config = {"port": 3000}
config = ChainMap(cmd_config, user_config, default_config)
print(f"合并后: {dict(config)}")
print(f"debug: {config['debug']}（来自user_config）")
print(f"port: {config['port']}（来自cmd_config，优先级最高）")
print(f"host: {config['host']}（来自default_config）")

# ========== 6. OrderedDict ==========
print("\\n" + "=" * 50)
print("6. OrderedDict（Python 3.7+普通dict也有序）")
print("=" * 50)
od = OrderedDict([('b', 2), ('a', 1), ('c', 3)])
print(f"有序字典: {od}")
od.move_to_end('a')
print(f"move_to_end('a'): {od}")
od.move_to_end('c', last=False)
print(f"move_to_end('c', last=False): {od}")
`
  },
  {
    id: "py6-itertools",
    group: "内置模块",
    icon: "🔧",
    title: "itertools迭代器工具",
    content: `## itertools 模块

itertools提供了一系列高效的迭代器工具，用于处理迭代器/生成器，内存高效。

### 无限迭代器

| 函数 | 说明 |
|------|------|
| \`count(start=0, step=1)\` | 无限计数：start, start+step, ... |
| \`cycle(iterable)\` | 无限循环迭代 |
| \`repeat(obj, times=None)\` | 重复对象 |

### 终止于最短输入

| 函数 | 说明 |
|------|------|
| \`chain(*iterables)\` | 串联多个迭代器 |
| \`zip_longest(*its, fillvalue)\` | 最长zip，缺失补fillvalue |
| \`islice(seq, start, stop, step)\` | 迭代器切片 |
| \`starmap(func, seq)\` | 类似map但参数解包 |
| \`takewhile(pred, seq)\` | 取到pred为False |
| \`dropwhile(pred, seq)\` | 丢弃到pred为False |

### 排列组合

| 函数 | 说明 |
|------|------|
| \`product(*its, repeat=n)\` | 笛卡尔积 |
| \`permutations(iter, r=None)\` | 排列（有序） |
| \`combinations(iter, r)\` | 组合（无序，不重复） |
| \`combinations_with_replacement\` | 组合（可重复） |

### 其他

| 函数 | 说明 |
|------|------|
| \`groupby(iter, key=None)\` | 按键分组 |
| \`tee(iter, n=2)\` | 复制n个迭代器 |
| \`accumulate(iter, func)\` | 累积计算 |`,
    code: `import itertools
import operator

print("=" * 50)
print("1. 无限迭代器（用islice截断）")
print("=" * 50)
# itertools 的核心特性是「惰性计算」：只在需要时产生值，不预先生成全部
# 无限迭代器（count/cycle/repeat）必须配合 islice 或 next 截断使用，否则无限循环
# count
# count(10, 2) 产生 10,12,14,...（无限），用 islice 截取前6个
print("count(10, 2):", list(itertools.islice(itertools.count(10, 2), 6)))
# cycle
# cycle 重复循环迭代器内容（无限），用 next 取前8个
cyc = itertools.cycle(['A', 'B', 'C'])
print("cycle('ABC')前8个:", [next(cyc) for _ in range(8)])
# repeat
# repeat 重复同一对象，指定 times 则有限
print("repeat(42, 5):", list(itertools.repeat(42, 5)))

# ========== 2. 串联与切片 ==========
print("\\n" + "=" * 50)
print("2. chain 串联 / islice 切片")
print("=" * 50)
list1 = [1, 2, 3]
list2 = ['a', 'b']
list3 = [100, 200]
print(f"chain: {list(itertools.chain(list1, list2, list3))}")
# from_iterable
nested = [[1, 2], [3, 4], [5]]
print(f"chain.from_iterable: {list(itertools.chain.from_iterable(nested))}")
# islice
nums = range(100)
print(f"islice(0-100, 0, 10, 2): {list(itertools.islice(nums, 0, 10, 2))}")

# ========== 3. zip_longest ==========
print("\\n" + "=" * 50)
print("3. zip_longest 最长对齐")
print("=" * 50)
a = [1, 2, 3]
b = ['a', 'b']
print(f"zip (最短): {list(zip(a, b))}")
print(f"zip_longest: {list(itertools.zip_longest(a, b, fillvalue='-'))}")

# ========== 4. accumulate 累积 ==========
print("\\n" + "=" * 50)
print("4. accumulate 累积计算")
print("=" * 50)
nums = [1, 2, 3, 4, 5]
print(f"累积和: {list(itertools.accumulate(nums))}")
print(f"累积积: {list(itertools.accumulate(nums, operator.mul))}")
print(f"累积最大值: {list(itertools.accumulate([3, 1, 4, 1, 5, 9, 2], max))}")

# ========== 5. takewhile / dropwhile ==========
print("\\n" + "=" * 50)
print("5. takewhile / dropwhile")
print("=" * 50)
nums = [1, 3, 5, 2, 4, 6, 8]
print(f"takewhile <6: {list(itertools.takewhile(lambda x: x < 6, nums))}")
print(f"dropwhile <6: {list(itertools.dropwhile(lambda x: x < 6, nums))}")

# ========== 6. 排列组合 ==========
print("\\n" + "=" * 50)
print("6. product / permutations / combinations")
print("=" * 50)
# product 笛卡尔积
print(f"product('AB', [1,2]): {list(itertools.product('AB', [1, 2]))}")
print(f"product('AB', repeat=2): {list(itertools.product('AB', repeat=2))}")
# permutations 排列
print(f"permutations('ABC', 2): {list(itertools.permutations('ABC', 2))}")
# combinations 组合
print(f"combinations('ABC', 2): {list(itertools.combinations('ABC', 2))}")
# combinations_with_replacement
print(f"combinations_with_replacement: {list(itertools.combinations_with_replacement('AB', 2))}")

# ========== 7. groupby 分组 ==========
print("\\n" + "=" * 50)
print("7. groupby 分组（需先排序！）")
print("=" * 50)
data = [
    ("A", 1), ("A", 2), ("B", 3), ("A", 4),
    ("B", 5), ("B", 6), ("C", 7)
]
# 必须先按key排序
data.sort(key=lambda x: x[0])
for key, group in itertools.groupby(data, key=lambda x: x[0]):
    values = [item[1] for item in group]
    print(f"  组{key}: {values}")

# 按奇偶分组
nums = [1, 3, 2, 4, 5, 7, 6, 8]
nums.sort(key=lambda x: x % 2)
for is_odd, group in itertools.groupby(nums, key=lambda x: x % 2):
    label = "奇数" if is_odd else "偶数"
    print(f"  {label}: {list(group)}")

# ========== 8. starmap ==========
print("\\n" + "=" * 50)
print("8. starmap 解包参数")
print("=" * 50)
pairs = [(2, 3), (4, 5), (10, 2)]
print(f"starmap(pow): {list(itertools.starmap(pow, pairs))}")
print(f"starmap(lambda x,y: x+y): {list(itertools.starmap(lambda x,y: x+y, pairs))}")

# ========== 9. tee 复制迭代器 ==========
print("\\n" + "=" * 50)
print("9. tee 复制迭代器")
print("=" * 50)
it = iter([1, 2, 3])
it1, it2, it3 = itertools.tee(it, 3)
print(f"it1: {list(it1)}")
print(f"it2: {list(it2)}")
print(f"it3: {list(it3)}")

# ========== 10. 实际应用 ==========
print("\\n" + "=" * 50)
print("10. 实用：分页处理")
print("=" * 50)
def paginate(lst, page_size):
    it = iter(lst)
    return iter(lambda: list(itertools.islice(it, page_size)), [])

all_items = list(range(25))
for i, page in enumerate(paginate(all_items, 10), 1):
    print(f"  第{i}页: {page}")
`
  },
  {
    id: "py6-functools",
    group: "内置模块",
    icon: "🎛️",
    title: "functools模块",
    content: `## functools 模块

functools提供高阶函数：操作函数的函数，用于函数式编程和优化。

### 核心函数

| 函数 | 说明 |
|------|------|
| \`@wraps(wrapped)\` | 保留被装饰函数元信息 |
| \`@lru_cache(maxsize)\` | LRU缓存装饰器，缓存函数结果 |
| \`reduce(func, seq, initial)\` | 累积归约（类似求和） |
| \`partial(func, *args, **kwargs)\` | 偏函数，固定部分参数 |
| \`@total_ordering\` | 自动补全比较运算符 |
| \`@singledispatch\` | 单分派泛型函数 |
| \`cmp_to_key(func)\` | 旧风格比较函数转key函数 |

### wraps详解

写装饰器时一定要用@wraps，否则原函数的__name__/__doc__等会丢失。

### lru_cache详解

- 缓存函数调用结果，相同参数直接返回缓存
- 适合纯函数（相同输入总是相同输出）
- maxsize=None表示无限制
- 可通过\`func.cache_clear()\`清空缓存
- \`typed=True\`区分不同类型参数

### partial偏函数

固定函数的部分参数，生成新函数，类似柯里化。

### reduce

从functools导入（Python 3，Python 2是内置）。
\`reduce(f, [a,b,c,d]) = f(f(f(a,b),c),d)\``,
    code: `import functools
import time

print("=" * 50)
print("1. @wraps 装饰器保留元信息")
print("=" * 50)
def my_decorator(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"调用前: {func.__name__}")
        result = func(*args, **kwargs)
        print(f"调用后")
        return result
    return wrapper

@my_decorator
def greet(name):
    """打招呼函数"""
    return f"你好，{name}!"

print(f"函数名: {greet.__name__}")  # greet（不用wraps会显示wrapper）
print(f"文档: {greet.__doc__}")
print(f"调用: {greet('张三')}")

# ========== 2. lru_cache 缓存 ==========
print("\\n" + "=" * 50)
print("2. @lru_cache 结果缓存")
print("=" * 50)
# lru_cache 原理：以函数参数为 key 缓存返回值，相同参数下次调用直接返回缓存
# LRU = Least Recently Used，maxsize 满时淘汰最久未用的缓存项
# 适合纯函数（相同输入必相同输出），递归函数性能提升巨大
# 注意：参数必须可哈希（list/dict/set 不可，需转 tuple/frozenset）
@functools.lru_cache(maxsize=128)
def fib(n):
    if n < 2:
        return n
    return fib(n-1) + fib(n-2)

# 无缓存时 fib(35) 递归约 2^35 次（千万级），有缓存仅计算每个 n 一次
start = time.time()
result = fib(35)
elapsed = time.time() - start
print(f"fib(35) = {result}")
print(f"耗时: {elapsed:.6f}秒（有缓存极快）")
# cache_info() 返回缓存命中信息：hits/misses/maxsize/currsize
print(f"缓存信息: {fib.cache_info()}")
fib.cache_clear()
print("cache_clear()后:", fib.cache_info())

# ========== 3. reduce 归约 ==========
print("\\n" + "=" * 50)
print("3. reduce 累积归约")
print("=" * 50)
nums = [1, 2, 3, 4, 5]
# 求和
sum_result = functools.reduce(lambda a, b: a + b, nums)
print(f"求和: {sum_result}")
# 求积
product = functools.reduce(lambda a, b: a * b, nums)
print(f"求积: {product}")
# 求最大值
max_val = functools.reduce(lambda a, b: a if a > b else b, nums)
print(f"最大值: {max_val}")
# 带初始值
concat = functools.reduce(lambda a, b: a + str(b), nums, "数字:")
print(f"拼接: {concat}")

# ========== 4. partial 偏函数 ==========
print("\\n" + "=" * 50)
print("4. partial 偏函数")
print("=" * 50)
def power(base, exponent):
    return base ** exponent
# 固定exponent=2，创建平方函数
square = functools.partial(power, exponent=2)
cube = functools.partial(power, exponent=3)
print(f"square(5) = {square(5)}")
print(f"cube(5) = {cube(5)}")
print(f"square(base=10) = {square(base=10)}")
# partial对象属性
print(f"square.func = {square.func.__name__}")
print(f"square.keywords = {square.keywords}")

# 实际应用：int(x, base=2)
int2 = functools.partial(int, base=2)
int8 = functools.partial(int, base=8)
int16 = functools.partial(int, base=16)
print(f"int2('1010') = {int2('1010')}")
print(f"int8('777') = {int8('777')}")
print(f"int16('FF') = {int16('FF')}")

# ========== 5. total_ordering ==========
print("\\n" + "=" * 50)
print("5. @total_ordering 自动补全比较")
print("=" * 50)
@functools.total_ordering
class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score
    def __eq__(self, other):
        return self.score == other.score
    def __lt__(self, other):
        return self.score < other.score
    def __repr__(self):
        return f"Student({self.name},{self.score})"

s1 = Student("A", 85)
s2 = Student("B", 92)
s3 = Student("C", 85)
print(f"{s1} < {s2}: {s1 < s2}")
print(f"{s1} > {s2}: {s1 > s2}")
print(f"{s1} == {s3}: {s1 == s3}")
print(f"{s1} <= {s3}: {s1 <= s3}")
print(f"{s2} >= {s1}: {s2 >= s1}")
print("只需实现__eq__和__lt__，自动获得> <= >=")

# ========== 6. singledispatch 单分派 ==========
print("\\n" + "=" * 50)
print("6. @singledispatch 泛型函数")
print("=" * 50)
@functools.singledispatch
def process(obj):
    print(f"默认处理: {type(obj).__name__} = {obj}")

@process.register(int)
def _(n):
    print(f"处理整数: {n} * 2 = {n * 2}")

@process.register(str)
def _(s):
    print(f"处理字符串: 长度={len(s)}, 大写={s.upper()}")

@process.register(list)
def _(lst):
    print(f"处理列表: 元素数={len(lst)}, 和={sum(lst) if all(isinstance(x, (int,float)) for x in lst) else 'N/A'}")

process(42)
process("hello")
process([1, 2, 3, 4, 5])
process(3.14)

# ========== 7. cmp_to_key ==========
print("\\n" + "=" * 50)
print("7. cmp_to_key 自定义排序")
print("=" * 50)
def compare(a, b):
    if a + b > b + a:
        return -1
    elif a + b < b + a:
        return 1
    return 0

nums_str = ["3", "30", "34", "5", "9"]
result = sorted(nums_str, key=functools.cmp_to_key(compare))
print(f"最大拼接数: {''.join(result)}")
`
  },
  {
    id: "py6-json-advanced",
    group: "内置模块",
    icon: "📑",
    title: "JSON进阶",
    content: `## JSON进阶用法

基础JSON序列化参见之前章节，本章讲自定义序列化、特殊类型处理、钩子函数。

### 自定义序列化的方法

1. **default参数**：为无法序列化的类型提供转换函数
2. **cls参数**：自定义JSONEncoder子类
3. **转换为可序列化类型**：先手动转换再序列化
4. **object_hook参数**：反序列化时自定义转换
5. **JSONEncoder/JSONDecoder子类**：完全控制序列化过程

### 常见不可序列化类型

- datetime/date/time
- set/frozenset
- 自定义类实例
- bytes/bytearray
- Decimal
- 复杂数字（复数）

### 常用参数

- \`skipkeys=True\`：跳过非字符串键（不报错）
- \`allow_nan=False\`：禁止NaN/Infinity
- \`separators=(',', ':')\`：紧凑输出（去掉空格）
- \`default=func\`：自定义序列化函数
- \`object_hook=func\`：反序列化钩子`,
    code: `import json
from datetime import datetime, date
from decimal import Decimal

print("=" * 50)
print("1. default 处理datetime")
print("=" * 50)
def json_default(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, set):
        return list(obj)
    if isinstance(obj, bytes):
        return obj.decode('utf-8')
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError(f"无法序列化 {type(obj)}")

data = {
    "name": "测试",
    "created": datetime(2024, 6, 15, 14, 30),
    "today": date(2024, 6, 15),
    "tags": {"python", "json", "tutorial"},
    "price": Decimal("99.99"),
}
json_str = json.dumps(data, default=json_default, ensure_ascii=False, indent=2)
print(json_str)

# ========== 2. object_hook 反序列化 ==========
print("\\n" + "=" * 50)
print("2. object_hook 反序列化自定义转换")
print("=" * 50)
json_text = '''
{
    "name": "张三",
    "age": "25",
    "score": "95.5",
    "active": "true"
}
'''
def parse_types(d):
    for k in ['age']:
        if k in d:
            d[k] = int(d[k])
    for k in ['score']:
        if k in d:
            d[k] = float(d[k])
    for k in ['active']:
        if k in d:
            d[k] = d[k].lower() == 'true'
    return d

result = json.loads(json_text, object_hook=parse_types)
print(f"解析后: {result}")
print(f"age类型: {type(result['age'])}, score类型: {type(result['score'])}")

# ========== 3. 自定义Encoder类 ==========
print("\\n" + "=" * 50)
print("3. 自定义JSONEncoder子类")
print("=" * 50)
class CustomEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return {"__type__": "datetime", "value": obj.isoformat()}
        if isinstance(obj, date):
            return {"__type__": "date", "value": obj.isoformat()}
        if isinstance(obj, complex):
            return {"__type__": "complex", "real": obj.real, "imag": obj.imag}
        return super().default(obj)

complex_data = {
    "time": datetime.now(),
    "val": complex(3, 4),
    "msg": "自定义编码器"
}
encoded = json.dumps(complex_data, cls=CustomEncoder, ensure_ascii=False, indent=2)
print(encoded)

# ========== 4. 带__type__标记的反序列化 ==========
print("\\n" + "=" * 50)
print("4. 带类型标记的反序列化")
print("=" * 50)
def object_hook_with_type(d):
    if "__type__" not in d:
        return d
    t = d["__type__"]
    if t == "datetime":
        return datetime.fromisoformat(d["value"])
    if t == "date":
        return date.fromisoformat(d["value"])
    if t == "complex":
        return complex(d["real"], d["imag"])
    return d

decoded = json.loads(encoded, object_hook=object_hook_with_type)
print(f"解码后: time={decoded['time']} ({type(decoded['time']).__name__})")
print(f"解码后: val={decoded['val']} ({type(decoded['val']).__name__})")

# ========== 5. 序列化自定义类 ==========
print("\\n" + "=" * 50)
print("5. 自定义类实例序列化")
print("=" * 50)
class User:
    def __init__(self, name, age, email):
        self.name = name
        self.age = age
        self.email = email
    def to_dict(self):
        return {"name": self.name, "age": self.age, "email": self.email}
    @classmethod
    def from_dict(cls, d):
        return cls(d["name"], d["age"], d["email"])
    def __repr__(self):
        return f"User({self.name},{self.age})"

users = [User("张三", 25, "zhang@example.com"), User("李四", 30, "li@example.com")]
# 方法1：手动转dict
json_str = json.dumps([u.to_dict() for u in users], ensure_ascii=False, indent=2)
print("序列化自定义对象：")
print(json_str)
# 反序列化
loaded = [User.from_dict(d) for d in json.loads(json_str)]
print(f"反序列化: {loaded}")

# ========== 6. 紧凑输出 ==========
print("\\n" + "=" * 50)
print("6. separators 紧凑输出（网络传输用）")
print("=" * 50)
data = {"name": "test", "values": [1, 2, 3], "active": True}
normal = json.dumps(data, ensure_ascii=False)
compact = json.dumps(data, separators=(',', ':'), ensure_ascii=False)
print(f"普通: {normal} ({len(normal)}字节)")
print(f"紧凑: {compact} ({len(compact)}字节)")

# ========== 7. JSONEncoder实用例子 ==========
print("\\n" + "=" * 50)
print("7. ensure_ascii/indent/sort_keys组合")
print("=" * 50)
data = {"b": 2, "a": 1, "c": {"z": 26, "y": 25}}
print("美化+排序+中文:")
print(json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True))
`
  },
  {
    id: "py6-shutil",
    group: "内置模块",
    icon: "📁",
    title: "shutil文件操作高级",
    content: `## shutil 高级文件操作

shutil(shell utilities)提供高级文件操作：复制、移动、删除、压缩等。

### 核心函数

| 函数 | 说明 |
|------|------|
| \`shutil.copy(src, dst)\` | 复制文件（内容+权限） |
| \`shutil.copy2(src, dst)\` | 复制文件（含元数据：时间等） |
| \`shutil.copyfile(src, dst)\` | 仅复制内容 |
| \`shutil.copytree(src, dst)\` | 递归复制目录树 |
| \`shutil.move(src, dst)\` | 移动/重命名 |
| \`shutil.rmtree(path)\` | 递归删除目录 |
| \`shutil.which(cmd)\` | 查找可执行文件路径 |
| \`shutil.disk_usage(path)\` | 磁盘使用情况 |
| \`shutil.make_archive()\` | 创建压缩包 |
| \`shutil.unpack_archive()\` | 解压 |

### copy vs copy2 vs copyfile

- copyfile：仅内容，dst必须是文件路径
- copy：内容+权限位，dst可以是目录
- copy2：内容+权限+元数据（mtime/atime等）

### 注意事项

- copytree目标目录必须不存在
- rmtree会删除目录及所有内容，慎用！
- 跨文件系统移动实际是复制+删除
- 所有文件操作都可能抛出OSError，需要异常处理`,
    code: `import shutil
import tempfile
import os

temp_dir = tempfile.mkdtemp()
print(f"临时目录: {temp_dir}")

try:
    src_dir = os.path.join(temp_dir, "src")
    dst_dir = os.path.join(temp_dir, "dst")
    os.makedirs(src_dir)
    
    # 创建源文件
    src_file = os.path.join(src_dir, "hello.txt")
    with open(src_file, 'w', encoding='utf-8') as f:
        f.write("Hello shutil!\\n")
    with open(os.path.join(src_dir, "data.txt"), 'w') as f:
        f.write("数据文件")
    
    # ========== 1. copy / copy2 / copyfile ==========
    print("=" * 50)
    print("1. 文件复制")
    print("=" * 50)
    # copyfile
    dst1 = os.path.join(temp_dir, "copy1.txt")
    shutil.copyfile(src_file, dst1)
    print(f"copyfile -> {os.path.getsize(dst1)}字节")
    # copy
    dst2 = os.path.join(temp_dir, "copy2.txt")
    shutil.copy(src_file, dst2)
    print(f"copy -> 存在: {os.path.exists(dst2)}")
    # copy2（保留元数据）
    dst3 = os.path.join(temp_dir, "copy3.txt")
    shutil.copy2(src_file, dst3)
    print(f"copy2(含元数据) -> 存在: {os.path.exists(dst3)}")
    
    # copy到目录
    os.makedirs(dst_dir)
    shutil.copy(src_file, dst_dir)
    print(f"copy到目录: {os.listdir(dst_dir)}")
    
    # ========== 2. copytree 复制目录树 ==========
    print("\\n" + "=" * 50)
    print("2. copytree 递归复制目录")
    print("=" * 50)
    src_sub = os.path.join(src_dir, "subdir")
    os.makedirs(src_sub)
    with open(os.path.join(src_sub, "nested.txt"), 'w') as f:
        f.write("嵌套文件")
    tree_dst = os.path.join(temp_dir, "copied_tree")
    shutil.copytree(src_dir, tree_dst)
    for root, dirs, files in os.walk(tree_dst):
        level = root.replace(tree_dst, '').count(os.sep)
        indent = "  " * level
        print(f"{indent}{os.path.basename(root)}/")
        for file in files:
            print(f"{indent}  {file}")
    
    # ========== 3. move 移动/重命名 ==========
    print("\\n" + "=" * 50)
    print("3. move 移动/重命名")
    print("=" * 50)
    move_src = os.path.join(temp_dir, "move_me.txt")
    with open(move_src, 'w') as f:
        f.write("to be moved")
    move_dst = os.path.join(temp_dir, "moved.txt")
    shutil.move(move_src, move_dst)
    print(f"move后源存在: {os.path.exists(move_src)}")
    print(f"move后目标存在: {os.path.exists(move_dst)}")
    
    # ========== 4. rmtree 递归删除 ==========
    print("\\n" + "=" * 50)
    print("4. rmtree 递归删除（危险！）")
    print("=" * 50)
    to_delete = os.path.join(temp_dir, "to_delete")
    os.makedirs(os.path.join(to_delete, "sub"))
    for name in ["a.txt", "b.txt", "sub/c.txt"]:
        with open(os.path.join(to_delete, name), 'w') as f:
            f.write("temp")
    print(f"删除前存在: {os.path.exists(to_delete)}")
    shutil.rmtree(to_delete)
    print(f"rmtree后存在: {os.path.exists(to_delete)}")
    
    # ========== 5. disk_usage 磁盘使用 ==========
    print("\\n" + "=" * 50)
    print("5. disk_usage 磁盘信息")
    print("=" * 50)
    usage = shutil.disk_usage(temp_dir)
    print(f"总空间: {usage.total / (1024**3):.1f} GB")
    print(f"已使用: {usage.used / (1024**3):.1f} GB")
    print(f"可用: {usage.free / (1024**3):.1f} GB")
    
    # ========== 6. which 查找命令 ==========
    print("\\n" + "=" * 50)
    print("6. which 查找可执行文件")
    print("=" * 50)
    for cmd in ["python3", "ls", "git", "nonexistent_cmd"]:
        path = shutil.which(cmd)
        print(f"  {cmd}: {path if path else '未找到'}")
    
    # ========== 7. make_archive 压缩 ==========
    print("\\n" + "=" * 50)
    print("7. 创建zip压缩包")
    print("=" * 50)
    archive_base = os.path.join(temp_dir, "backup")
    archive_path = shutil.make_archive(archive_base, 'zip', src_dir)
    print(f"压缩包: {os.path.basename(archive_path)}")
    print(f"大小: {os.path.getsize(archive_path)}字节")
    
    # 解压
    extract_dir = os.path.join(temp_dir, "extracted")
    os.makedirs(extract_dir)
    shutil.unpack_archive(archive_path, extract_dir)
    print(f"解压后文件: {os.listdir(extract_dir)}")

finally:
    shutil.rmtree(temp_dir)
    print(f"\\n临时目录已清理")
`
  },
  {
    id: "py6-glob",
    group: "内置模块",
    icon: "🔎",
    title: "glob文件匹配",
    content: `## glob 文件路径匹配

glob模块根据Unix shell规则查找匹配的文件路径名，简单易用。

### 通配符规则

| 通配符 | 含义 |
|--------|------|
| \`*\` | 匹配0个或多个任意字符（不匹配路径分隔符/） |
| \`?\` | 匹配单个任意字符 |
| \`[seq]\` | 匹配seq中的任意一个字符 |
| \`[!seq]\` | 匹配不在seq中的字符 |
| \`**\` | 递归匹配任意子目录（需recursive=True） |

### 函数

- \`glob.glob(pathname, *, recursive=False)\`：返回匹配路径列表
- \`glob.iglob(pathname, *, recursive=False)\`：返回迭代器（内存友好，大结果集用）
- \`glob.escape(s)\`：转义特殊字符

### 常用模式

- \`*.txt\`：当前目录所有.txt文件
- \`data??.csv\`：data后跟2个字符的csv
- \`[abc]*.py\`：以a/b/c开头的py文件
- \`**/*.py\`：递归所有子目录的py文件
- \`src/**/test*.py\`：src下所有test开头的py

### 注意事项

1. 以点号(.)开头的隐藏文件需显式匹配（如.*）
2. **需要recursive=True才生效
3. 返回路径顺序不确定，必要时sorted()
4. glob不展开~（用户目录），用os.path.expanduser()
5. 更复杂的匹配用pathlib（Python 3.4+）或re`,
    code: `import glob
import tempfile
import os

temp_dir = tempfile.mkdtemp()
print(f"临时目录: {temp_dir}")

try:
    # 创建测试文件和目录结构
    os.makedirs(os.path.join(temp_dir, "subdir1"))
    os.makedirs(os.path.join(temp_dir, "subdir2", "nested"))
    files = [
        "readme.txt", "data.csv", "data.json", "config.ini",
        "test1.py", "test2.py", "utils.py",
        "a1.txt", "a2.txt", "b1.txt",
        "subdir1/file1.txt", "subdir1/file2.txt",
        "subdir2/data.csv", "subdir2/nested/deep.txt",
        ".hidden",
    ]
    for f in files:
        path = os.path.join(temp_dir, f)
        with open(path, 'w') as fp:
            fp.write(f"content of {f}")
    
    os.chdir(temp_dir)
    
    # ========== 1. * 匹配任意字符 ==========
    print("=" * 50)
    print("1. * 匹配任意字符")
    print("=" * 50)
    print(f"所有.txt: {sorted(glob.glob('*.txt'))}")
    print(f"所有.py: {sorted(glob.glob('*.py'))}")
    print(f"data*: {sorted(glob.glob('data*'))}")
    
    # ========== 2. ? 单字符匹配 ==========
    print("\\n" + "=" * 50)
    print("2. ? 单字符匹配")
    print("=" * 50)
    print(f"test?.py: {sorted(glob.glob('test?.py'))}")
    print(f"a?.txt: {sorted(glob.glob('a?.txt'))}")
    print(f"??.txt: {sorted(glob.glob('??.txt'))}")
    
    # ========== 3. [] 字符类 ==========
    print("\\n" + "=" * 50)
    print("3. [] 字符类匹配")
    print("=" * 50)
    print(f"[ab]*: {sorted(glob.glob('[ab]*'))}")
    print(f"[a-c]*.txt: {sorted(glob.glob('[a-c]*.txt'))}")
    print(f"[!a]* (非a开头): {sorted(glob.glob('[!a]*'))}")
    
    # ========== 4. 子目录匹配 ==========
    print("\\n" + "=" * 50)
    print("4. 子目录匹配")
    print("=" * 50)
    print(f"subdir1/*.txt: {sorted(glob.glob('subdir1/*.txt'))}")
    print(f"*/*.csv: {sorted(glob.glob('*/*.csv'))}")
    
    # ========== 5. ** 递归匹配 ==========
    print("\\n" + "=" * 50)
    print("5. ** 递归匹配（recursive=True）")
    print("=" * 50)
    all_txt = sorted(glob.glob('**/*.txt', recursive=True))
    print(f"所有txt(递归): {all_txt}")
    all_py = sorted(glob.glob('**/*.py', recursive=True))
    print(f"所有py(递归): {all_py}")
    all_nested = sorted(glob.glob('subdir2/**/*.txt', recursive=True))
    print(f"subdir2下所有txt: {all_nested}")
    
    # ========== 6. iglob 迭代器 ==========
    print("\\n" + "=" * 50)
    print("6. iglob 迭代器（大目录节省内存）")
    print("=" * 50)
    count = 0
    for path in glob.iglob('**/*.txt', recursive=True):
        count += 1
    print(f"iglob找到{count}个txt文件")
    
    # ========== 7. 隐藏文件 ==========
    print("\\n" + "=" * 50)
    print("7. 隐藏文件（.开头）")
    print("=" * 50)
    print(f"普通*: {glob.glob('*')[:5]}...（不含隐藏）")
    print(f".*: {sorted(glob.glob('.*'))}")
    
    # ========== 8. escape 转义 ==========
    print("\\n" + "=" * 50)
    print("8. escape 转义特殊字符")
    print("=" * 50)
    special_file = "test[1].txt"
    with open(special_file, 'w') as f:
        f.write("special")
    # 不转义会被当作字符类
    print(f"不转义 glob('test[1].txt'): {glob.glob('test[1].txt')}")
    # escape后正确匹配
    print(f"escape后: {glob.glob(glob.escape('test[1].txt'))}")
    os.unlink(special_file)
    
    # ========== 9. 实际应用 ==========
    print("\\n" + "=" * 50)
    print("9. 实用：查找特定类型文件统计")
    print("=" * 50)
    exts = {}
    for path in glob.iglob('**/*', recursive=True):
        if os.path.isfile(path):
            ext = os.path.splitext(path)[1] or '(无扩展名)'
            exts[ext] = exts.get(ext, 0) + 1
    for ext, count in sorted(exts.items()):
        print(f"  {ext}: {count}个文件")

finally:
    os.chdir(os.path.dirname(temp_dir))
    import shutil
    shutil.rmtree(temp_dir)
    print(f"\\n临时目录已清理")
`
  },
  {
    id: "py6-logging",
    group: "内置模块",
    icon: "📝",
    title: "logging日志",
    content: `## logging 日志模块

logging是Python标准日志模块，比print更专业：级别控制、格式化、多输出、文件轮转等。

### 日志级别（从低到高）

| 级别 | 数值 | 使用场景 |
|------|------|----------|
| DEBUG | 10 | 调试详细信息 |
| INFO | 20 | 正常运行信息 |
| WARNING | 30 | 警告（默认级别） |
| ERROR | 40 | 错误，部分功能失败 |
| CRITICAL | 50 | 严重错误，程序可能崩溃 |

### 核心组件

- **Logger**：日志器，程序通过它发日志
- **Handler**：处理器，决定日志输出到哪（控制台/文件/网络）
- **Formatter**：格式化器，定义日志格式
- **Filter**：过滤器，精细控制哪些日志输出

### basicConfig快速配置

简单脚本用\`logging.basicConfig()\`即可：
- level：最低输出级别
- format：格式字符串
- filename：输出到文件（默认控制台）
- filemode：文件模式('a'/'w')

### 常用格式符

- %(asctime)s：时间
- %(name)s：logger名称
- %(levelname)s：级别名
- %(message)s：日志消息
- %(filename)s：文件名
- %(lineno)d：行号
- %(funcName)s：函数名`,
    code: `import logging
import sys
import io

print("=" * 50)
print("1. basicConfig 基础配置")
print("=" * 50)

# 配置日志输出到控制台（StreamHandler到stdout）
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    datefmt='%H:%M:%S',
    stream=sys.stdout,
    force=True
)

logger = logging.getLogger("demo")
logger.debug("这是DEBUG级别（调试信息）")
logger.info("这是INFO级别（一般信息）")
logger.warning("这是WARNING级别（警告）")
logger.error("这是ERROR级别（错误）")
logger.critical("这是CRITICAL级别（严重）")

# ========== 2. 不同Logger名称 ==========
print("\\n" + "=" * 50)
print("2. 模块级Logger（常用__name__）")
print("=" * 50)
auth_log = logging.getLogger("auth")
db_log = logging.getLogger("database")
auth_log.info("用户登录成功: user123")
db_log.warning("慢查询检测: 2.5秒")
auth_log.error("密码验证失败")

# ========== 3. 级别过滤 ==========
print("\\n" + "=" * 50)
print("3. 级别控制演示")
print("=" * 50)
# 重置
for handler in logging.root.handlers[:]:
    logging.root.removeHandler(handler)

logging.basicConfig(level=logging.WARNING, format='[%(levelname)s] %(message)s',
                    stream=sys.stdout, force=True)
log = logging.getLogger("level_test")
log.debug("DEBUG消息（不显示，级别不够）")
log.info("INFO消息（不显示）")
log.warning("WARNING消息（显示）")
log.error("ERROR消息（显示）")

# ========== 4. Formatter格式 ==========
print("\\n" + "=" * 50)
print("4. 格式字段说明")
print("=" * 50)
print("常用格式符:")
print("  %(asctime)s   - 日志时间")
print("  %(name)s      - logger名称")
print("  %(levelname)s - 级别名")
print("  %(levelno)d   - 级别数值")
print("  %(message)s   - 日志消息")
print("  %(filename)s  - 源文件名")
print("  %(lineno)d    - 行号")
print("  %(funcName)s  - 函数名")
print("  %(module)s    - 模块名")
print("  %(process)d   - 进程ID")
print("  %(thread)d    - 线程ID")

# 详细格式演示
for handler in logging.root.handlers[:]:
    logging.root.removeHandler(handler)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(filename)s:%(lineno)d %(funcName)s() - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    stream=sys.stdout,
    force=True
)

def process_data():
    logging.info("开始处理数据...")
    logging.warning("数据量较大")
    logging.error("处理失败")

process_data()

# ========== 5. StringHandler 捕获日志（用于测试/演示） ==========
print("\\n" + "=" * 50)
print("5. 捕获日志到字符串（不污染控制台）")
print("=" * 50)
logger2 = logging.getLogger("capture_test")
logger2.setLevel(logging.DEBUG)
# 避免传播到root
logger2.propagate = False
string_io = io.StringIO()
handler = logging.StreamHandler(string_io)
handler.setFormatter(logging.Formatter('[%(levelname)s] %(message)s'))
logger2.addHandler(handler)

logger2.info("第一条日志")
logger2.warning("第二条日志")
logger2.error("第三条日志")

captured = string_io.getvalue()
print("捕获到的日志：")
for line in captured.strip().split('\\n'):
    print(f"  -> {line}")

# ========== 6. 多Handler演示 ==========
print("\\n" + "=" * 50)
print("6. 多Handler（控制台+字符串）")
print("=" * 50)
logger3 = logging.getLogger("multi")
logger3.setLevel(logging.DEBUG)
logger3.propagate = False
logger3.handlers.clear()

# 控制台Handler（只显示WARNING+）
console_h = logging.StreamHandler(sys.stdout)
console_h.setLevel(logging.WARNING)
console_h.setFormatter(logging.Formatter('[控制台] %(message)s'))
logger3.addHandler(console_h)

# 字符串Handler（显示所有DEBUG+）
buf = io.StringIO()
str_h = logging.StreamHandler(buf)
str_h.setLevel(logging.DEBUG)
str_h.setFormatter(logging.Formatter('[完整] %(levelname)s: %(message)s'))
logger3.addHandler(str_h)

logger3.debug("详细调试信息")
logger3.info("一般信息")
logger3.warning("警告信息（控制台也显示）")
logger3.error("错误信息")

print("完整日志缓冲区：")
print(buf.getvalue())

# ========== 7. 异常日志 exc_info ==========
print("=" * 50)
print("7. 记录异常堆栈 exc_info=True")
print("=" * 50)
try:
    result = 10 / 0
except ZeroDivisionError:
    logging.error("计算出错", exc_info=True)

# ========== 8. dictConfig 字典配置（生产环境推荐） ==========
print("\\n" + "=" * 50)
print("8. dictConfig 字典配置（生产环境推荐）")
print("=" * 50)
# logging.config.dictConfig 用字典描述完整日志配置
# 优势：可从 JSON/YAML 文件加载，比 basicConfig 更灵活强大
from logging.config import dictConfig
import io as _io

# 配置字典：定义 loggers、handlers、formatters 三大组件
logging_config = {
    "version": 1,                # 配置 schema 版本，目前固定为 1
    "disable_existing_loggers": False,  # 不禁用已存在的 logger
    "formatters": {              # 格式化器：定义日志输出格式
        "simple": {"format": "[%(levelname)s] %(message)s"},
        "detailed": {"format": "%(asctime)s %(name)s [%(levelname)s] %(message)s"},
    },
    "handlers": {                # 处理器：定义日志输出目标
        "console": {
            "class": "logging.StreamHandler",
            "level": "INFO",
            "formatter": "simple",
            "stream": "ext://sys.stdout",
        },
        # 实际项目可用 FileHandler：保存到文件
        # "file": {
        #     "class": "logging.FileHandler",
        #     "level": "DEBUG",
        #     "formatter": "detailed",
        #     "filename": "app.log",
        #     "encoding": "utf-8",
        # },
    },
    "loggers": {                 # logger 配置
        "app": {
            "level": "DEBUG",
            "handlers": ["console"],
            "propagate": False,  # 不向 root 传播，避免重复输出
        },
    },
    "root": {                    # root logger 配置
        "level": "WARNING",
        "handlers": ["console"],
    },
}

# 应用配置
dictConfig(logging_config)
app_log = logging.getLogger("app")
app_log.debug("dictConfig DEBUG 消息")
app_log.info("dictConfig INFO 消息（控制台显示）")
app_log.warning("dictConfig WARNING 消息")
print("dictConfig 适合生产环境：可从 JSON/YAML 加载，统一管理多组件配置")

# ========== 9. 最佳实践 ==========
print("\\n" + "=" * 50)
print("9. logging最佳实践")
print("=" * 50)
print("""
✅ 模块开头创建logger:
   logger = logging.getLogger(__name__)

✅ 使用参数化日志（%s形式，lazy evaluation）:
   logger.info("用户 %s 登录，年龄 %d", username, age)

✅ 配置只在程序入口做一次:
   if __name__ == '__main__':
       logging.basicConfig(...)
       main()

✅ 生产环境用文件+控制台:
   handlers = [
       logging.FileHandler('app.log'),
       logging.StreamHandler()
   ]

✅ 复杂配置用 dictConfig（可从 JSON/YAML 加载）
✅ 不要用print做日志，用logging
❌ 不要在每个模块都basicConfig
❌ 不要捕获所有异常只log不处理
""")
`
  },
  {
    id: "py6-argparse",
    group: "内置模块",
    icon: "🎮",
    title: "argparse命令行参数",
    content: `## argparse 命令行参数解析

argparse是Python标准库中推荐的命令行参数解析工具，自动生成帮助、类型检查、错误提示。

### 基本流程

1. 创建\`ArgumentParser\`对象
2. 用\`add_argument()\`添加参数
3. 调用\`parse_args()\`解析参数

### 参数类型

- **位置参数**：不带前缀，按顺序传入（如文件名）
- **可选参数**：以-或--开头（如--help, -v）

### add_argument常用参数

| 参数 | 说明 |
|------|------|
| \`name/flags\` | 参数名或选项（如'name'或'-h', '--help'） |
| \`action\` | 行为：store/store_true/store_const/append/count |
| \`nargs\` | 参数个数：N/?/*/+ |
| \`const\` | 某些action用的常量值 |
| \`default\` | 默认值 |
| \`type\` | 参数类型：int/float/str/FileType等 |
| \`choices\` | 允许的值列表 |
| \`required\` | 是否必需（可选参数设为True） |
| \`help\` | 帮助信息 |
| \`metavar\` | 帮助中显示的参数名 |
| \`dest\` | 参数对象的属性名 |

### 注意事项

本章演示直接构造sys.argv，不实际解析命令行参数。

### action类型

- \`store\`：存储值（默认）
- \`store_true/store_false\`：布尔开关
- \`count\`：计数（如-v/-vv/-vvv）
- \`append\`：追加到列表
- \`version\`：打印版本`,
    code: `import argparse
import sys

def demo_basic():
    print("=" * 50)
    print("1. 基本位置参数")
    print("=" * 50)
    parser = argparse.ArgumentParser(description="演示基本参数")
    parser.add_argument("name", help="用户名")
    parser.add_argument("age", type=int, help="年龄（整数）")
    # 构造参数，不使用真实命令行
    args = parser.parse_args(["张三", "25"])
    print(f"name: {args.name}")
    print(f"age: {args.age} (类型: {type(args.age).__name__})")
demo_basic()

def demo_optional():
    print("\\n" + "=" * 50)
    print("2. 可选参数")
    print("=" * 50)
    parser = argparse.ArgumentParser(description="可选参数演示")
    parser.add_argument("--name", default="匿名", help="姓名")
    parser.add_argument("-n", "--number", type=int, default=1, help="数量")
    parser.add_argument("--verbose", "-v", action="store_true", help="详细输出")
    args1 = parser.parse_args([])
    print(f"无参数: name={args1.name}, number={args1.number}, verbose={args1.verbose}")
    args2 = parser.parse_args(["--name", "李四", "-n", "5", "-v"])
    print(f"全参数: name={args2.name}, number={args2.number}, verbose={args2.verbose}")
demo_optional()

def demo_flags():
    print("\\n" + "=" * 50)
    print("3. action: store_true / count 标志")
    print("=" * 50)
    parser = argparse.ArgumentParser()
    parser.add_argument("-v", "--verbose", action="count", default=0, help="增加详细程度")
    parser.add_argument("--quiet", action="store_true", help="静默模式")
    parser.add_argument("--debug", action="store_const", const="DEBUG_MODE", help="调试模式")
    args1 = parser.parse_args([])
    print(f"无参数: v={args1.verbose}, quiet={args1.quiet}")
    args2 = parser.parse_args(["-v"])
    print(f"-v: v={args2.verbose}")
    args3 = parser.parse_args(["-vvv"])
    print(f"-vvv: v={args3.verbose}")
    args4 = parser.parse_args(["--debug"])
    print(f"--debug: {args4.debug}")
demo_flags()

def demo_choices():
    print("\\n" + "=" * 50)
    print("4. choices 限定值")
    print("=" * 50)
    parser = argparse.ArgumentParser()
    parser.add_argument("--color", choices=["red", "green", "blue"], default="blue")
    parser.add_argument("--size", type=int, choices=range(1, 5))
    args = parser.parse_args(["--color", "red", "--size", "3"])
    print(f"color={args.color}, size={args.size}")
demo_choices()

def demo_nargs():
    print("\\n" + "=" * 50)
    print("5. nargs 多个值")
    print("=" * 50)
    parser = argparse.ArgumentParser()
    parser.add_argument("--files", nargs="+", help="一个或多个文件")
    parser.add_argument("--tags", nargs="*", default=[], help="0个或多个标签")
    parser.add_argument("--optional", nargs="?", const="default_val", help="0或1个值")
    args = parser.parse_args(["--files", "a.txt", "b.txt", "c.txt", "--tags", "py", "js"])
    print(f"files({len(args.files)}个): {args.files}")
    print(f"tags({len(args.tags)}个): {args.tags}")
    args2 = parser.parse_args(["--optional"])
    print(f"optional(无值): {args2.optional}")
    args3 = parser.parse_args(["--optional", "custom_val"])
    print(f"optional(有值): {args3.optional}")
demo_nargs()

def demo_type():
    print("\\n" + "=" * 50)
    print("6. type 类型转换")
    print("=" * 50)
    def positive_int(s):
        v = int(s)
        if v <= 0:
            raise argparse.ArgumentTypeError(f"{v}不是正整数")
        return v
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=positive_int, default=8080)
    parser.add_argument("--ratio", type=float, default=1.0)
    args = parser.parse_args(["--port", "3000", "--ratio", "0.75"])
    print(f"port={args.port}, ratio={args.ratio}")
demo_type()

def demo_metavar():
    print("\\n" + "=" * 50)
    print("7. 完整示例：文件复制工具")
    print("=" * 50)
    parser = argparse.ArgumentParser(
        prog="mycopy",
        description="复制文件（演示用）",
        epilog="示例: mycopy source.txt dest.txt -f"
    )
    parser.add_argument("source", help="源文件路径")
    parser.add_argument("dest", help="目标路径")
    parser.add_argument("-f", "--force", action="store_true", help="强制覆盖")
    parser.add_argument("-r", "--recursive", action="store_true", help="递归复制目录")
    parser.add_argument("-v", "--verbose", action="count", default=0, help="详细输出(-v/-vv)")
    parser.add_argument("--buf-size", type=int, default=4096, metavar="SIZE", help="缓冲区大小")
    args = parser.parse_args(["src.txt", "dst.txt", "-f", "-vv", "--buf-size", "8192"])
    print(f"解析结果:")
    print(f"  源: {args.source}")
    print(f"  目标: {args.dest}")
    print(f"  强制覆盖: {args.force}")
    print(f"  递归: {args.recursive}")
    print(f"  详细级别: {args.verbose}")
    print(f"  缓冲区: {args.buf_size}")
    print("\\n帮助信息（python mycopy.py --help）:")
    parser.print_help()
demo_metavar()
`
  },
  {
    id: "py6-configparser",
    group: "内置模块",
    icon: "⚙️",
    title: "configparser配置文件",
    content: `## configparser INI配置文件

configparser模块读写INI格式配置文件，适合存储程序配置。

### INI文件格式

\`\`\`ini
[section1]
key1 = value1
key2 = value2

[section2]
key3 = 3
; 这是注释
# 这也是注释
\`\`\`

### 核心方法

| 方法 | 说明 |
|------|------|
| \`read(filenames, encoding)\` | 读取配置文件 |
| \`read_string(string)\` | 从字符串读取 |
| \`sections()\` | 返回所有section列表 |
| \`has_section(section)\` | 是否存在section |
| \`add_section(section)\` | 添加section |
| \`options(section)\` | 返回section下所有key |
| \`has_option(sec, opt)\` | 是否存在键 |
| \`get(sec, opt, ...)\` | 获取值（字符串） |
| \`getint/getfloat/getboolean\` | 获取并转换类型 |
| \`set(sec, opt, value)\` | 设置值 |
| \`remove_section(sec)\` | 删除section |
| \`remove_option(sec, opt)\` | 删除键 |
| \`write(fileobject)\` | 写入文件 |

### 注意事项

- 默认大小写不敏感，可用\`optionxform=str\`保持大小写
- 默认key会转小写
- 支持插值：%(key)s引用同section的值
- 布尔值识别：yes/no, true/false, on/off, 1/0
- 不支持多级section（如[database.mysql]只是名字）
- 值默认是字符串，需要手动转类型`,
    code: `import configparser
import tempfile
import os

temp_dir = tempfile.mkdtemp()

try:
    config_path = os.path.join(temp_dir, "config.ini")
    
    # ========== 1. 创建配置并写入 ==========
    print("=" * 50)
    print("1. 创建配置文件")
    print("=" * 50)
    config = configparser.ConfigParser()
    config["general"] = {
        "debug": "true",
        "log_level": "INFO",
        "app_name": "我的应用",
        "version": "1.0.0"
    }
    config["database"] = {
        "host": "localhost",
        "port": "3306",
        "user": "root",
        "password": "secret",
        "database": "mydb",
        "max_connections": "10"
    }
    config["server"] = {}
    config["server"]["host"] = "0.0.0.0"
    config["server"]["port"] = "8080"
    config["server"]["workers"] = "4"
    
    with open(config_path, 'w', encoding='utf-8') as f:
        config.write(f)
    
    print("配置文件内容：")
    with open(config_path, 'r', encoding='utf-8') as f:
        print(f.read())
    
    # ========== 2. 读取配置 ==========
    print("=" * 50)
    print("2. 读取配置")
    print("=" * 50)
    cfg = configparser.ConfigParser()
    cfg.read(config_path, encoding='utf-8')
    
    print(f"Sections: {cfg.sections()}")
    print(f"database的所有key: {cfg.options('database')}")
    print(f"database.port = {cfg.get('database', 'port')} (类型: {type(cfg.get('database', 'port')).__name__})")
    print(f"database.port (getint) = {cfg.getint('database', 'port')}")
    print(f"general.debug (getboolean) = {cfg.getboolean('general', 'debug')}")
    print(f"server.workers (getint) = {cfg.getint('server', 'workers')}")
    
    # ========== 3. 默认值 ==========
    print("\\n" + "=" * 50)
    print("3. 默认值 / fallback")
    print("=" * 50)
    print(f"不存在的key，fallback: {cfg.get('server', 'timeout', fallback='30')}")
    print(f"server.host: {cfg.get('server', 'host')}")
    print(f"是否存在section 'cache': {cfg.has_section('cache')}")
    print(f"database是否有'password': {cfg.has_option('database', 'password')}")
    
    # ========== 4. 修改配置 ==========
    print("\\n" + "=" * 50)
    print("4. 修改/添加/删除")
    print("=" * 50)
    cfg.set("database", "port", "3307")
    cfg.set("database", "charset", "utf8mb4")
    if not cfg.has_section("cache"):
        cfg.add_section("cache")
    cfg["cache"]["backend"] = "redis"
    cfg["cache"]["ttl"] = "3600"
    
    cfg.remove_option("general", "debug")
    # cfg.remove_section("section名")
    
    print("修改后的database配置:")
    for k, v in cfg["database"].items():
        print(f"  {k} = {v}")
    
    # ========== 5. 插值 ==========
    print("\\n" + "=" * 50)
    print("5. 值插值 %(key)s")
    print("=" * 50)
    cfg2 = configparser.ConfigParser()
    cfg2.read_string("""
[paths]
base_dir = /opt/myapp
data_dir = %(base_dir)s/data
log_dir = %(base_dir)s/logs
config_file = %(base_dir)s/config.ini
""")
    print(f"base_dir: {cfg2.get('paths', 'base_dir')}")
    print(f"data_dir: {cfg2.get('paths', 'data_dir')}")
    print(f"log_dir: {cfg2.get('paths', 'log_dir')}")
    
    # ========== 6. 读取字符串配置 ==========
    print("\\n" + "=" * 50)
    print("6. read_string 从字符串读取")
    print("=" * 50)
    cfg3 = configparser.ConfigParser()
    ini_text = """
[mysql]
host = 127.0.0.1
port = 3306
user = admin

[redis]
host = 127.0.0.1
port = 6379
"""
    cfg3.read_string(ini_text)
    print(f"mysql.host = {cfg3.get('mysql', 'host')}")
    print(f"redis.port = {cfg3.getint('redis', 'port')}")
    
    # ========== 7. 保持大小写（默认key转小写） ==========
    print("\\n" + "=" * 50)
    print("7. RawConfigParser / 保持大小写")
    print("=" * 50)
    cfg4 = configparser.RawConfigParser()
    cfg4.optionxform = str
    cfg4.read_string("""
[API]
apiKey = abc123
APISecret = xyz789
""")
    print(f"options保持原始大小写: {cfg4.options('API')}")
    
    # ========== 8. 字典式访问 ==========
    print("\\n" + "=" * 50)
    print("8. 字典式访问")
    print("=" * 50)
    for section in cfg.sections():
        print(f"[{section}]")
        for key in cfg[section]:
            print(f"  {key} = {cfg[section][key]}")

finally:
    import shutil
    shutil.rmtree(temp_dir)
    print(f"\\n临时目录已清理")
`
  },
  {
    id: "py6-hashlib",
    group: "内置模块",
    icon: "#️⃣",
    title: "hashlib哈希算法",
    content: `## hashlib 哈希算法

hashlib提供多种安全哈希（消息摘要）算法：MD5、SHA-1、SHA-256、SHA-512等。

### 常用算法

| 算法 | 摘要长度 | 安全性 | 用途 |
|------|----------|--------|------|
| md5 | 128bit(16字节) | ❌ 已破解 | 文件校验、非安全场景 |
| sha1 | 160bit(20字节) | ❌ 已破解 | Git、旧系统兼容 |
| sha256 | 256bit(32字节) | ✅ 安全 | 密码存储、数字签名 |
| sha512 | 512bit(64字节) | ✅ 安全 | 更高安全需求 |
| blake2b/blake2s | 可变 | ✅ 安全快速 | 新应用推荐 |

### 基本用法

1. \`hashlib.算法名()\`创建hash对象
2. \`update(data)\`喂数据（bytes），可多次调用
3. \`hexdigest()\`返回十六进制字符串
4. \`digest()\`返回bytes

### 密码存储要点

❌ 不要直接hash密码（彩虹表攻击）
✅ 用加盐hash：salt+password
✅ 用慢哈希算法：bcrypt/argon2/scrypt（hashlib提供pbkdf2_hmac）
✅ 每个用户使用唯一随机salt

### 文件哈希

大文件分块读取update，避免内存不足。

### 注意事项

- hash对象只能使用一次，digest()后追加数据会报错？不，可以继续update
- update是追加不是覆盖
- 输入必须是bytes，字符串需先encode()
- MD5/SHA1用于校验而非安全目的`,
    code: `import hashlib

print("=" * 50)
print("1. 基本哈希计算")
print("=" * 50)
data = "Hello, Python!".encode('utf-8')
md5 = hashlib.md5(data)
print(f"MD5: {md5.hexdigest()} ({len(md5.hexdigest())}字符)")
sha1 = hashlib.sha1(data)
print(f"SHA1: {sha1.hexdigest()} ({len(sha1.hexdigest())}字符)")
sha256 = hashlib.sha256(data)
print(f"SHA256: {sha256.hexdigest()} ({len(sha256.hexdigest())}字符)")
sha512 = hashlib.sha512(data)
print(f"SHA512: {sha512.hexdigest()} ({len(sha512.hexdigest())}字符)")

# ========== 2. update多次调用 ==========
print("\\n" + "=" * 50)
print("2. update追加（等价于拼接后hash）")
print("=" * 50)
# update 是追加数据到哈希流，不是覆盖！多次 update 等价于拼接后一次 update
# 这使得大文件可以分块处理而无需全部加载到内存
h1 = hashlib.sha256()
h1.update(b"Hello, ")
h1.update(b"World!")
print(f"分次update: {h1.hexdigest()}")
h2 = hashlib.sha256(b"Hello, World!")
print(f"一次update: {h2.hexdigest()}")
print(f"结果相同: {h1.hexdigest() == h2.hexdigest()}")

# ========== 3. 可用算法列表 ==========
print("\\n" + "=" * 50)
print("3. 可用算法")
print("=" * 50)
print(f"openssl_md5: {'md5' in hashlib.algorithms_available}")
print(f"保证可用: {sorted(hashlib.algorithms_guaranteed)}")

# ========== 4. 文件哈希 ==========
print("\\n" + "=" * 50)
print("4. 文件哈希（用tempfile演示）")
print("=" * 50)
import tempfile, os
with tempfile.NamedTemporaryFile(mode='wb', delete=False) as f:
    f.write("这是文件内容\\n".encode("utf-8"))
    f.write("用于计算哈希\\n".encode("utf-8"))
    f.write(b"line 3\\n")
    tmp_path = f.name
try:
    # 小文件一次读取（直接 read 全部到内存）
    with open(tmp_path, 'rb') as f:
        content = f.read()
        file_md5 = hashlib.md5(content).hexdigest()
        print(f"文件MD5: {file_md5}")
    # 大文件必须分块读取 update，避免一次性加载几 GB 文件导致内存溢出
    # 4096/8192/65536 是常见块大小，性能与内存的平衡
    sha256_hash = hashlib.sha256()
    with open(tmp_path, 'rb') as f:
        # iter(callable, sentinel) 每次调用 callable，返回 sentinel 时停止
        for chunk in iter(lambda: f.read(4096), b''):
            sha256_hash.update(chunk)  # 追加每块到哈希流
    print(f"文件SHA256（分块）: {sha256_hash.hexdigest()}")
finally:
    os.unlink(tmp_path)

# ========== 5. 加盐哈希 ==========
print("\\n" + "=" * 50)
print("5. 加盐密码哈希（基础版）")
print("=" * 50)
import os
def hash_password(password, salt=None):
    if salt is None:
        salt = os.urandom(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return salt.hex() + ":" + pwd_hash.hex()
def verify_password(password, stored):
    salt_hex, hash_hex = stored.split(":")
    salt = bytes.fromhex(salt_hex)
    check = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return check.hex() == hash_hex

stored = hash_password("mypassword123")
print(f"存储格式: salt:hash = {stored[:30]}...:{stored[-30:]}...")
print(f"验证正确密码: {verify_password('mypassword123', stored)}")
print(f"验证错误密码: {verify_password('wrong', stored)}")

# ========== 6. 常用场景：数据校验 ==========
print("\\n" + "=" * 50)
print("6. 数据校验")
print("=" * 50)
def md5sum(data):
    return hashlib.md5(data.encode('utf-8')).hexdigest()
print(f"'hello' MD5: {md5sum('hello')}")
# 验证下载文件完整性
expected = "5d41402abc4b2a76b9719d911017c592"
actual = md5sum("hello")
print(f"完整性验证: {'通过' if expected == actual else '失败'}")

# ========== 7. blake2（新算法，更快） ==========
print("\\n" + "=" * 50)
print("7. blake2b/blake2s（现代算法）")
print("=" * 50)
blake = hashlib.blake2b(b"test data", digest_size=32)
print(f"blake2b(32字节): {blake.hexdigest()}")

# ========== 8. shake 可变长度 ==========
print("\\n" + "=" * 50)
print("8. shake_128/256 可变长度摘要")
print("=" * 50)
shake = hashlib.shake_256(b"shake test")
print(f"shake_256 16字节: {shake.hexdigest(16)}")
print(f"shake_256 32字节: {shake.hexdigest(32)}")
`
  },
  {
    id: "py6-base64",
    group: "内置模块",
    icon: "🔐",
    title: "base64编码解码",
    content: `## base64 编码解码

base64是一种将二进制数据编码为ASCII字符串的方法，常用于：
- 电子邮件附件传输
- URL中传递二进制数据
- Data URI（如网页内嵌图片）
- JSON/XML中嵌入二进制
- Basic Auth认证

### 核心函数

| 函数 | 说明 |
|------|------|
| \`b64encode(s)\` | 标准Base64编码 |
| \`b64decode(s)\` | 标准Base64解码 |
| \`urlsafe_b64encode(s)\` | URL安全变体（+→-，/→_） |
| \`urlsafe_b64decode(s)\` | URL安全解码 |
| \`b32encode/b32decode\` | Base32编码 |
| \`b16encode/b16decode\` | Base16（十六进制） |
| \`a85encode/a85decode\` | Ascii85编码 |

### Base64原理

- 将每3字节（24bit）编码为4个ASCII字符
- 每字符6bit，用A-Z,a-z,0-9,+,/共64个字符
- 不足3字节时用=填充
- 编码后数据量增大约33%

### URL安全变体

标准Base64包含+和/，在URL中有特殊含义：
- urlsafe版本将+换成-，/换成_
- 通常去掉=填充符（某些场景）

### 注意事项

- 输入输出都是bytes类型
- 字符串需先encode()
- Base64不是加密！只是编码，任何人都能解码
- 解码失败抛binascii.Error
- 大文件应分块编码（base64.encode/decode）`,
    code: `import base64

print("=" * 50)
print("1. 基本编码解码")
print("=" * 50)
original = "Hello, Python! 你好，世界！"
original_bytes = original.encode('utf-8')
encoded = base64.b64encode(original_bytes)
print(f"原文: {original}")
print(f"编码后: {encoded.decode('ascii')}")
decoded = base64.b64decode(encoded)
print(f"解码后: {decoded.decode('utf-8')}")
print(f"一致: {decoded.decode('utf-8') == original}")

# ========== 2. 二进制数据编码 ==========
print("\\n" + "=" * 50)
print("2. 二进制数据（图片/文件）编码")
print("=" * 50)
binary_data = bytes(range(256))  # 所有字节值
b64_data = base64.b64encode(binary_data)
print(f"{len(binary_data)}字节二进制 -> {len(b64_data)}字符Base64")
print(f"前60字符: {b64_data[:60].decode()}...")
decoded_bin = base64.b64decode(b64_data)
print(f"解码后一致: {decoded_bin == binary_data}")

# ========== 3. URL安全变体 ==========
print("\\n" + "=" * 50)
print("3. urlsafe_b64encode（URL安全）")
print("=" * 50)
# 标准 Base64 使用 A-Z a-z 0-9 + / 共 64 个字符
# 但 + 和 / 在 URL 中有特殊含义（+ 表示空格，/ 是路径分隔符）
# urlsafe 变体把 + 换成 -，/ 换成 _，避免 URL 编码后变 %2B %2F
data = b"\\xfb\\xef\\xbe\\xad\\xde\\xad\\xbe\\xef"  # 包含类似+/的字节
standard = base64.b64encode(data)
urlsafe = base64.urlsafe_b64encode(data)
print(f"标准Base64: {standard}")
print(f"URL安全:   {urlsafe}")
print("区别: + -> -, / -> _  (其余字符完全相同)")
print("应用场景：URL 传参、JWT、Data URI 等需放入 URL 的场景用 urlsafe")
print(f"urlsafe解码: {base64.urlsafe_b64decode(urlsafe).hex()}")

# ========== 4. 填充字符= ==========
print("\\n" + "=" * 50)
print("4. 填充字符=")
print("=" * 50)
for s in ["a", "ab", "abc"]:
    b = s.encode()
    enc = base64.b64encode(b)
    print(f"  {s!r:5} ({len(b)}字节) -> {enc.decode():8} (填充={enc.count(b'=')})")
# 自动处理无填充
print("\\n自动修复缺失的填充：")
no_pad = base64.b64encode(b"test").rstrip(b"=")
print(f"无填充: {no_pad}")
decoded_no_pad = base64.b64decode(no_pad + b'==='[:-len(no_pad) % 4])
print(f"解码: {decoded_no_pad}")

# ========== 5. Base16/Base32 ==========
print("\\n" + "=" * 50)
print("5. Base16(hex) / Base32")
print("=" * 50)
data = b"Hello"
b16 = base64.b16encode(data)
b32 = base64.b32encode(data)
print(f"原文: {data}")
print(f"Base16: {b16}")
print(f"Base32: {b32}")
print(f"Base64: {base64.b64encode(data)}")
print(f"Base16解码: {base64.b16decode(b16)}")
print(f"Base32解码: {base64.b32decode(b32)}")

# ========== 6. 实际应用：Basic Auth ==========
print("\\n" + "=" * 50)
print("6. 实际应用：HTTP Basic Auth")
print("=" * 50)
username = "admin"
password = "secret123"
credentials = f"{username}:{password}".encode()
auth_value = base64.b64encode(credentials).decode()
print(f"Authorization头: Basic {auth_value}")
# 解码验证
decoded_creds = base64.b64decode(auth_value).decode()
u, p = decoded_creds.split(":", 1)
print(f"解码验证: 用户名={u}, 密码={p}")

# ========== 7. Data URI演示 ==========
print("\\n" + "=" * 50)
print("7. Data URI格式")
print("=" * 50)
img_data = bytes([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]) + b"fake_png_data"
b64_img = base64.b64encode(img_data).decode()
data_uri = f"data:image/png;base64,{b64_img}"
print(f"Data URI长度: {len(data_uri)}字符")
print(f"前80字符: {data_uri[:80]}...")

# ========== 8. 编解码错误处理 ==========
print("\\n" + "=" * 50)
print("8. 错误处理")
print("=" * 50)
try:
    base64.b64decode("not valid base!!!")
except Exception as e:
    print(f"无效Base64: {type(e).__name__}: {e}")

valid = base64.b64encode(b"test").decode()
print(f"有效编码: {valid} -> {base64.b64decode(valid)}")
`
  },
  {
    id: "py6-uuid",
    group: "内置模块",
    icon: "🆔",
    title: "UUID生成",
    content: `## uuid 唯一标识符

UUID(Universally Unique Identifier)是128位全局唯一标识符，标准表示为32个十六进制字符加4个连字符：\`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\`。

### UUID版本

| 版本 | 函数 | 说明 |
|------|------|------|
| UUID1 | \`uuid1(node, clock_seq)\` | 基于时间+MAC地址（含硬件信息） |
| UUID3 | \`uuid3(namespace, name)\` | 基于名字MD5哈希（确定性） |
| UUID4 | \`uuid4()\` | 随机生成（最常用） |
| UUID5 | \`uuid5(namespace, name)\` | 基于名字SHA1哈希（确定性） |

### 预定义命名空间

- \`uuid.NAMESPACE_DNS\`：域名
- \`uuid.NAMESPACE_URL\`：URL
- \`uuid.NAMESPACE_OID\`：OID
- \`uuid.NAMESPACE_X500\`：X.500 DN

### UUID对象属性

| 属性 | 说明 |
|------|------|
| \`hex\` | 32字符十六进制 |
| \`int\` | 128位整数 |
| \`bytes\` | 16字节bytes |
| \`urn\` | RFC4122 URN格式 |
| \`version\` | UUID版本号 |
| \`variant\` | 变体 |
| \`fields\` | (time_low, time_mid, time_hi, ...) |

### 选择建议

- **UUID4**：大多数场景首选，完全随机
- **UUID1**：需要按时间排序时
- **UUID3/5**：相同输入得到相同输出（哈希）
- 分布式系统中无需中心节点即可生成唯一ID

### 注意事项

- UUID4碰撞概率极低（2^122=约5e36分之一）
- UUID1暴露MAC地址和生成时间，隐私敏感场景慎用
- UUID是128位，整数范围是0到2^128-1`,
    code: `import uuid

print("=" * 50)
print("1. UUID4 随机生成（最常用）")
print("=" * 50)
for _ in range(3):
    u = uuid.uuid4()
    print(f"  {u}")
    print(f"    hex: {u.hex}")
    print(f"    int: {u.int}")
    print(f"    version: {u.version}")

# ========== 2. UUID1 基于时间 ==========
print("\\n" + "=" * 50)
print("2. UUID1 基于时间+MAC")
print("=" * 50)
u1 = uuid.uuid1()
print(f"UUID1: {u1}")
print(f"version: {u1.version}")
# 不暴露MAC地址：用随机node
import random
u1_random = uuid.uuid1(node=random.getrandbits(48))
print(f"UUID1(随机node): {u1_random}")

# ========== 3. UUID3/5 基于名字 ==========
print("\\n" + "=" * 50)
print("3. UUID3/5 基于名字（确定性）")
print("=" * 50)
# 相同输入得到相同输出
name = "user@example.com"
u3 = uuid.uuid3(uuid.NAMESPACE_DNS, name)
u5 = uuid.uuid5(uuid.NAMESPACE_DNS, name)
print(f"UUID3(DNS, {name}): {u3}")
print(f"UUID5(DNS, {name}): {u5}")
# 再次生成相同
u3_again = uuid.uuid3(uuid.NAMESPACE_DNS, name)
print(f"再次生成UUID3: {u3_again}")
print(f"相同: {u3 == u3_again}")
# 不同命名空间
u5_url = uuid.uuid5(uuid.NAMESPACE_URL, "https://example.com/user")
print(f"UUID5(URL, ...): {u5_url}")

# ========== 4. 格式转换 ==========
print("\\n" + "=" * 50)
print("4. UUID属性与格式")
print("=" * 50)
u = uuid.uuid4()
print(f"字符串: {str(u)}")
print(f"hex: {u.hex}")
print(f"urn: {u.urn}")
print(f"bytes(16字节): {u.bytes.hex()}")
print(f"int: {u.int}")
print(f"fields: {u.fields}")

# ========== 5. 从字符串/字节解析 ==========
print("\\n" + "=" * 50)
print("5. 解析UUID字符串")
print("=" * 50)
uuid_str = "12345678-1234-5678-1234-567812345678"
parsed = uuid.UUID(uuid_str)
print(f"解析字符串: {parsed}")
print(f"version: {parsed.version}")

# 从hex解析
hex_str = "12345678123456781234567812345678"
parsed_hex = uuid.UUID(hex=hex_str)
print(f"从hex解析: {parsed_hex}")
# 从bytes解析
u_bytes = uuid.uuid4().bytes
parsed_bytes = uuid.UUID(bytes=u_bytes)
print(f"从bytes解析: {parsed_bytes}")

# ========== 6. 实际应用：数据库主键/请求ID ==========
print("\\n" + "=" * 50)
print("6. 实际应用场景")
print("=" * 50)
print("  - 数据库主键（替代自增ID，分布式友好）")
print("  - 请求追踪ID（Request-ID / Trace-ID）")
print("  - 文件名/目录名唯一标识")
print("  - 会话ID、令牌")
print("  - 日志追踪")

# ========== 7. 比较 ==========
print("\\n" + "=" * 50)
print("7. UUID对象比较")
print("=" * 50)
u1 = uuid.UUID("12345678-1234-5678-1234-567812345678")
u2 = uuid.UUID("12345678-1234-5678-1234-567812345678")
u3 = uuid.uuid4()
print(f"u1 == u2: {u1 == u2}")
print(f"u1 == u3: {u1 == u3}")
print(f"排序: {sorted([u3, u1, uuid.UUID('00000000-0000-0000-0000-000000000000')])}")
`
  },
  {
    id: "py6-textwrap",
    group: "内置模块",
    icon: "📏",
    title: "textwrap文本处理",
    content: `## textwrap 文本格式化

textwrap模块提供文本换行、填充、缩进等格式化功能，适合命令行输出、文本美化。

### 核心函数

| 函数 | 说明 |
|------|------|
| \`textwrap.fill(text, width=70)\` | 文本换行，返回字符串 |
| \`textwrap.wrap(text, width=70)\` | 文本换行，返回行列表 |
| \`textwrap.shorten(text, width)\` | 截断文本，末尾加... |
| \`textwrap.indent(text, prefix)\` | 给每行添加前缀 |
| \`textwrap.dedent(text)\` | 去除公共前导空白 |

### TextWrapper类

可创建TextWrapper实例复用配置：
- width：宽度（默认70）
- initial_indent：首行缩进
- subsequent_indent：后续行缩进
- expand_tabs：展开tab
- replace_whitespace：替换空白
- fix_sentence_endings：句子结尾修复
- break_long_words：断开长单词
- break_on_hyphens：连字符处断开
- max_lines：最大行数
- placeholder：截断占位符（默认' [...]'）

### 常见用法

- fill()：将长段落按宽度换行
- shorten()：摘要截断
- indent()：添加引用符/注释符
- dedent()：去除三引号字符串缩进`,
    code: `import textwrap

# ========== 1. fill 文本换行 ==========
print("=" * 50)
print("1. fill() 填充换行")
print("=" * 50)
long_text = """Python是一种广泛使用的高级编程语言，以其简洁的语法和强大的功能而闻名。Python支持多种编程范式，包括面向对象、命令式、函数式和过程式编程。它拥有丰富的标准库和活跃的社区，被广泛应用于Web开发、数据科学、人工智能等领域。"""

print("宽度40:")
print(textwrap.fill(long_text, width=40))
print()
print("宽度60:")
print(textwrap.fill(long_text, width=60))

# ========== 2. wrap 返回行列表 ==========
print("\\n" + "=" * 50)
print("2. wrap() 返回行列表")
print("=" * 50)
lines = textwrap.wrap(long_text, width=30)
for i, line in enumerate(lines, 1):
    print(f"  行{i}({len(line)}字): {line}")

# ========== 3. shorten 截断 ==========
print("\\n" + "=" * 50)
print("3. shorten() 截断摘要")
print("=" * 50)
print(f"20字: {textwrap.shorten(long_text, width=20)}")
print(f"40字: {textwrap.shorten(long_text, width=40)}")
print(f"60字: {textwrap.shorten(long_text, width=60)}")
print(f"自定义占位符: {textwrap.shorten(long_text, width=30, placeholder='...')}")

# ========== 4. indent 缩进 ==========
print("\\n" + "=" * 50)
print("4. indent() 添加前缀")
print("=" * 50)
sample = "第一行\\n第二行\\n第三行"
print("添加>前缀（引用）:")
print(textwrap.indent(sample, "> "))
print()
print("添加#前缀（注释）:")
print(textwrap.indent(sample, "# "))
# 选择性添加（predicate参数）
print()
print("只给非空行添加| :")
def not_empty(line):
    return bool(line.strip())
print(textwrap.indent("标题\\n\\n内容行1\\n内容行2", "| ", predicate=not_empty))

# ========== 5. dedent 去除公共缩进 ==========
print("\\n" + "=" * 50)
print("5. dedent() 去除前导空白")
print("=" * 50)
def demo_func():
    indented_text = """
        这是一段有缩进的文本。
        第二行也有相同的缩进。
            第三行缩进更多。
        第四行回到原缩进。
    """
    print("原始:")
    print(indented_text)
    print("dedent后:")
    print(textwrap.dedent(indented_text))
demo_func()

# ========== 6. TextWrapper 高级配置 ==========
print("=" * 50)
print("6. TextWrapper 自定义配置")
print("=" * 50)
wrapper = textwrap.TextWrapper(
    width=50,
    initial_indent="    ",
    subsequent_indent="    ",
    break_long_words=True,
    max_lines=3,
    placeholder="...(更多)"
)
formatted = wrapper.fill(long_text)
print(formatted)

# ========== 7. 实际应用：打印列表 ==========
print("\\n" + "=" * 50)
print("7. 实用：打印键值对/帮助信息")
print("=" * 50)
def print_kv(title, items, width=50):
    print(f"\\n{title}:")
    wrapper = textwrap.TextWrapper(width=width, initial_indent="  ", subsequent_indent="    ")
    for key, value in items:
        line = f"{key}: {value}"
        for wrapped in wrapper.wrap(line):
            print(wrapped)

print_kv("配置信息", [
    ("host", "localhost"),
    ("port", "8080"),
    ("description", "这是一个很长的服务器描述文本，用来说明如何使用textwrap模块美观地格式化输出内容"),
    ("debug", "true"),
])

# ========== 8. 首行缩进 ==========
print("\\n" + "=" * 50)
print("8. 首行缩进（段落风格）")
print("=" * 50)
para_wrapper = textwrap.TextWrapper(
    width=50,
    initial_indent="\\u3000\\u3000",
    subsequent_indent=""
)
paragraphs = [
    "Python是一门优雅的编程语言，它的设计哲学强调代码的可读性和简洁的语法。相比于其他语言，Python让你能够用更少的代码表达想法。",
    "textwrap模块是Python标准库中一个实用的文本处理工具，虽然简单但在命令行工具开发中非常有用。"
]
for p in paragraphs:
    print(para_wrapper.fill(p))
    print()
`
  }
]
