/**
 * Python工作实战手册 - 第五批章节数据
 * 主题：常用标准库 · 开箱即用的利器
 * 共8章：datetime、time、re、logging、random/uuid、argparse、itertools、threading
 * 说明：所有示例仅使用Python标准库，无需pip install，适合生产环境
 */

export const chapters = [
  {
    id: 'py-datetime',
    group: '第五篇：常用标准库 · 开箱即用的利器',
    icon: '📅',
    title: 'datetime日期时间处理（工作高频）',
    content: `# datetime日期时间处理（工作高频）

datetime是Python处理日期时间的标准库，**几乎每个项目都会用到**。日志时间戳、计算过期时间、定时任务判断、报表统计，都离不开它。

## 核心类一览

| 类名 | 用途 | 示例 |
|------|------|------|
| \`datetime.date\` | 日期（年-月-日） | 2024-01-15 |
| \`datetime.datetime\` | 日期+时间（最常用） | 2024-01-15 14:30:00 |
| \`datetime.time\` | 时间（时:分:秒） | 14:30:00 |
| \`datetime.timedelta\` | 时间差（用于加减） | 1 day, 2:00:00 |

## 常用操作速查

\`\`\`python
from datetime import datetime, date, timedelta

# 1. 获取当前时间
now = datetime.now()        # 本地时间
today = date.today()        # 今天日期

# 2. 字符串转时间（解析用户输入/接口数据）
dt = datetime.strptime("2024-01-15 14:30:00", "%Y-%m-%d %H:%M:%S")

# 3. 时间转字符串（输出给前端/写日志）
s = now.strftime("%Y-%m-%d %H:%M:%S")

# 4. 时间加减（计算3天后、2小时前）
three_days_later = now + timedelta(days=3)
two_hours_ago = now - timedelta(hours=2)

# 5. 时间比较大小
if dt > now:
    print("还没到时间")

# 6. 时间戳互转
ts = now.timestamp()        # 时间 → 时间戳（秒，浮点数）
dt_from_ts = datetime.fromtimestamp(ts)  # 时间戳 → 时间

# 7. 获取周几（1=周一，7=周日）
weekday = now.isoweekday()  # 1-7，周一到周日
\`\`\`

## 常用格式符

| 符号 | 含义 | 示例 |
|------|------|------|
| \`%Y\` | 4位年 | 2024 |
| \`%m\` | 2位月 | 01-12 |
| \`%d\` | 2位日 | 01-31 |
| \`%H\` | 24小时制时 | 00-23 |
| \`%M\` | 分 | 00-59 |
| \`%S\` | 秒 | 00-59 |
| \`%f\` | 微秒 | 000000-999999 |

> **工作场景**：日志记录时间戳、计算订单超时时间、定时任务判断是否执行、统计两个日期间的工作日数量。

> **⚠️ 坑点提醒**：
> - \`datetime.now()\`返回本地时间（无时区信息），涉及时区转换一定要用\`astimezone()\`
> - 不要手动拼接时间字符串，用\`strftime\`和\`strptime\`，避免单数字月/日出错
> - 时间比较时，确保两个datetime都是同一时区，否则结果不可靠
`,
    code: `"""
datetime日期时间处理实战
工作场景：日志时间戳、订单超时计算、定时任务判断
"""
from datetime import datetime, date, time, timedelta, timezone
import time as time_module


def demo_basic_datetime():
    """基础日期时间操作"""
    print("=" * 60)
    print("1. 基础日期时间获取")
    print("=" * 60)

    # 获取当前本地时间（无时区信息，naive datetime）
    # 工作场景：日志记录、报表展示本地时间
    now_local = datetime.now()
    print(f"当前本地时间: {now_local}")
    print(f"  年: {now_local.year}, 月: {now_local.month}, 日: {now_local.day}")
    print(f"  时: {now_local.hour}, 分: {now_local.minute}, 秒: {now_local.second}")

    # 获取今天日期（只有年月日，没有时分秒）
    today = date.today()
    print(f"今天日期: {today}")

    # 获取UTC时间（推荐在服务端存储时使用UTC，避免时区混乱）
    # 为什么用UTC？跨时区部署的服务器统一用UTC存储，展示时再转本地时间
    now_utc = datetime.now(timezone.utc)
    print(f"当前UTC时间: {now_utc}")


def demo_strftime_strptime():
    """字符串与时间互转（最高频操作）"""
    print("\\n" + "=" * 60)
    print("2. 字符串与时间互转")
    print("=" * 60)

    # strptime: string parse time - 字符串 → datetime
    # 工作场景：解析前端传来的时间字符串、读取CSV中的时间字段
    # 注意：格式字符串必须和输入完全匹配，否则抛ValueError
    time_str = "2024-06-15 14:30:45"
    dt = datetime.strptime(time_str, "%Y-%m-%d %H:%M:%S")
    print(f"解析字符串 '{time_str}' → {dt}")
    print(f"  类型: {type(dt)}")

    # strftime: string format time - datetime → 字符串
    # 工作场景：时间格式化后存入数据库、返回给前端展示、写日志
    now = datetime.now()
    formatted = now.strftime("%Y年%m月%d日 %H时%M分%S秒")
    print(f"当前时间格式化: {formatted}")

    # 常见格式：日志用的ISO格式（带T和Z，UTC时间）
    iso_format = now.strftime("%Y-%m-%dT%H:%M:%S")
    print(f"ISO格式: {iso_format}")

    # 常见格式：只有日期
    date_only = now.strftime("%Y-%m-%d")
    print(f"仅日期: {date_only}")


def demo_timedelta_calc():
    """时间加减计算（工作超高频）"""
    print("\\n" + "=" * 60)
    print("3. 时间加减计算")
    print("=" * 60)

    now = datetime.now()
    print(f"当前时间: {now}")

    # timedelta参数：days, seconds, microseconds, milliseconds, minutes, hours, weeks
    # 工作场景：计算N天后的过期时间、提前提醒时间
    one_day_later = now + timedelta(days=1)
    print(f"1天后: {one_day_later}")

    three_hours_ago = now - timedelta(hours=3)
    print(f"3小时前: {three_hours_ago}")

    # 组合使用：2天3小时后
    later = now + timedelta(days=2, hours=3)
    print(f"2天3小时后: {later}")

    # 两个时间相减得到timedelta（计算时间差）
    # 工作场景：计算任务执行耗时、订单超时了多久
    start_time = datetime(2024, 1, 1, 8, 0, 0)
    end_time = datetime(2024, 1, 1, 18, 30, 0)
    duration = end_time - start_time
    print(f"\\n开始: {start_time}")
    print(f"结束: {end_time}")
    print(f"耗时: {duration}")
    print(f"  总秒数: {duration.total_seconds()}")
    print(f"  天数: {duration.days}, 秒数: {duration.seconds}")


def demo_time_compare():
    """时间比较大小"""
    print("\\n" + "=" * 60)
    print("4. 时间比较")
    print("=" * 60)

    now = datetime.now()
    future = now + timedelta(hours=1)
    past = now - timedelta(hours=1)

    # datetime对象可以直接用比较运算符
    # 工作场景：判断定时任务是否到点执行、订单是否超时
    print(f"现在: {now}")
    print(f"过去: {past}")
    print(f"未来: {future}")
    print(f"past < now? {past < now}")
    print(f"future > now? {future > now}")

    # 实战：模拟订单超时判断
    order_create_time = datetime.now() - timedelta(minutes=35)
    timeout_minutes = 30  # 30分钟未支付自动取消
    is_timeout = (datetime.now() - order_create_time).total_seconds() > timeout_minutes * 60
    print(f"\\n订单创建于: {order_create_time}")
    print(f"是否超时({timeout_minutes}分钟)? {is_timeout}")


def demo_timestamp():
    """时间戳互转"""
    print("\\n" + "=" * 60)
    print("5. 时间戳互转")
    print("=" * 60)

    now = datetime.now()

    # datetime → 时间戳（Unix时间戳，从1970-01-01 00:00:00 UTC开始的秒数）
    # 工作场景：存入Redis缓存（时间戳占空间小）、前端需要时间戳做倒计时
    ts = now.timestamp()
    print(f"当前时间: {now}")
    print(f"时间戳(秒): {ts}")
    print(f"时间戳(毫秒，JS常用): {int(ts * 1000)}")

    # 时间戳 → datetime
    # 工作场景：从接口/缓存拿到时间戳，转成datetime方便计算
    dt_from_ts = datetime.fromtimestamp(ts)
    print(f"时间戳转datetime: {dt_from_ts}")

    # UTC时间戳转换
    dt_utc_from_ts = datetime.utcfromtimestamp(ts)
    print(f"时间戳转UTC datetime: {dt_utc_from_ts}")


def demo_timezone():
    """时区处理（生产环境必坑）"""
    print("\\n" + "=" * 60)
    print("6. 时区处理（重点）")
    print("=" * 60)

    # 为什么时区重要？
    # 坑点：如果你的服务器部署在海外，datetime.now()返回当地时间，和国内时间差8小时！
    # 最佳实践：存储用UTC，展示时转用户本地时区

    # 获取带时区信息的当前时间
    utc_now = datetime.now(timezone.utc)
    print(f"UTC时间（带时区）: {utc_now}")

    # 创建东八区（北京时间）时区
    # 注意：Python 3.9+有zoneinfo模块更方便，这里用timezone做兼容
    tz_shanghai = timezone(timedelta(hours=8))
    shanghai_now = utc_now.astimezone(tz_shanghai)
    print(f"北京时间: {shanghai_now}")

    # ⚠️ 注意：无时区的datetime不能直接和有时区的比较！
    naive_now = datetime.now()
    aware_now = datetime.now(timezone.utc)
    print(f"\\n无时区时间: {naive_now} (tzinfo={naive_now.tzinfo})")
    print(f"有时区时间: {aware_now} (tzinfo={aware_now.tzinfo})")
    # 下面这行会报错：TypeError: can't compare offset-naive and offset-aware datetimes
    # print(naive_now < aware_now)  # 不要这么做！


def demo_weekday():
    """获取周几（工作场景：周报统计、工作日判断）"""
    print("\\n" + "=" * 60)
    print("7. 获取周几")
    print("=" * 60)

    now = datetime.now()
    weekday_names = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]

    # isoweekday(): 1=周一, 7=周日（符合中国人习惯）
    # weekday(): 0=周一, 6=周日（程序员索引，注意区别！）
    iso_wd = now.isoweekday()
    wd = now.weekday()
    print(f"今天: {now.strftime('%Y-%m-%d')}")
    print(f"isoweekday()={iso_wd} → {weekday_names[iso_wd - 1]}")
    print(f"weekday()={wd} → {weekday_names[wd]}")

    # 判断是否是工作日
    is_workday = iso_wd <= 5
    print(f"今天是工作日? {is_workday}")


def demo_weekday_calc():
    """实战：计算两个日期之间的工作日天数"""
    print("\\n" + "=" * 60)
    print("8. 实战：计算工作日天数")
    print("=" * 60)

    start = date(2024, 6, 1)
    end = date(2024, 6, 30)
    print(f"计算 {start} 到 {end} 的工作日天数")

    workdays = 0
    current = start
    while current <= end:
        if current.isoweekday() <= 5:  # 1-5是周一到周五
            workdays += 1
        current += timedelta(days=1)

    print(f"总天数: {(end - start).days + 1}天")
    print(f"工作日: {workdays}天")
    print(f"周末: {(end - start).days + 1 - workdays}天")


def main():
    demo_basic_datetime()
    demo_strftime_strptime()
    demo_timedelta_calc()
    demo_time_compare()
    demo_timestamp()
    demo_timezone()
    demo_weekday()
    demo_weekday_calc()


if __name__ == "__main__":
    main()
`
  },
  {
    id: 'py-time-sleep',
    group: '第五篇：常用标准库 · 开箱即用的利器',
    icon: '⏰',
    title: 'time模块与时间戳',
    content: `# time模块与时间戳

time模块是更底层的时间处理模块，主要提供**时间戳、睡眠暂停、性能计时**功能。datetime处理日期时间更方便，但time在计时、控制执行节奏上不可替代。

## 核心功能

| 函数 | 用途 |
|------|------|
| \`time.time()\` | 获取当前时间戳（秒，浮点数） |
| \`time.sleep(secs)\` | 暂停程序执行指定秒数 |
| \`time.perf_counter()\` | 高精度性能计时（推荐） |
| \`time.strftime()/strptime()\` | 字符串格式化/解析（和datetime类似） |
| \`time.localtime()\` | 时间戳 → 本地时间struct_time |
| \`time.gmtime()\` | 时间戳 → UTC时间struct_time |

\`\`\`python
import time

# 1. 计时：统计代码执行耗时
start = time.perf_counter()
# ... 你的代码 ...
elapsed = time.perf_counter() - start
print(f"耗时: {elapsed:.4f}秒")

# 2. 暂停：控制请求频率，防止被封IP
time.sleep(1)  # 暂停1秒

# 3. 时间戳
ts = time.time()  # 当前时间戳
\`\`\`

> **工作场景**：
> - 性能测试：精确统计函数执行耗时
> - 接口限流：循环调用API时加sleep控制QPS
> - 轮询等待：定时轮询检查某个状态是否满足
> - 重试机制：失败后sleep几秒再重试

> **⚠️ 坑点**：
> - \`time.time()\`会受系统时间修改影响（比如用户改了系统时间），计时一定要用\`time.perf_counter()\`
> - \`sleep()\`的时间不是精确的，实际可能多睡几毫秒（操作系统调度问题）
> - sleep参数是秒，可以传小数：\`time.sleep(0.5)\`睡0.5秒
`,
    code: `"""
time模块实战：时间戳、sleep、性能计时
工作场景：接口限流、性能测试、轮询等待
"""
import time


def demo_timestamp():
    """时间戳基础"""
    print("=" * 60)
    print("1. time.time() 时间戳")
    print("=" * 60)

    # time.time() 返回自1970-01-01 00:00:00 UTC以来的秒数（浮点数）
    # 特点：简单、轻量，适合存入数据库/缓存做时间标记
    ts = time.time()
    print(f"当前时间戳: {ts}")
    print(f"  整数部分（秒）: {int(ts)}")
    print(f"  毫秒（JS常用）: {int(ts * 1000)}")
    print(f"  微秒: {int(ts * 1_000_000)}")

    # 时间戳转可读时间（本地时间）
    # localtime返回struct_time对象，包含年/月/日等字段
    local_time = time.localtime(ts)
    print(f"\\n本地时间: {time.strftime('%Y-%m-%d %H:%M:%S', local_time)}")
    print(f"  年: {local_time.tm_year}, 月: {local_time.tm_mon}, 日: {local_time.tm_mday}")

    # UTC时间
    utc_time = time.gmtime(ts)
    print(f"UTC时间: {time.strftime('%Y-%m-%d %H:%M:%S', utc_time)}")


def demo_sleep_basic():
    """sleep基础演示"""
    print("\\n" + "=" * 60)
    print("2. time.sleep() 暂停")
    print("=" * 60)

    print("开始...")
    print(f"暂停前时间戳: {time.time():.2f}")

    # sleep(秒) - 让程序暂停指定秒数
    # 工作场景：
    # 1. 调用第三方API限速（对方有限流，不能请求太快）
    # 2. 轮询检查状态（比如检查任务是否完成，每隔几秒查一次）
    # 3. 重试等待（失败了等几秒再试，避免立即重试造成雪崩）
    time.sleep(1.5)  # 暂停1.5秒，可以传小数！

    print(f"暂停后时间戳: {time.time():.2f}")
    print("...结束")


def demo_sleep_rate_limit():
    """实战：API调用限速模拟"""
    print("\\n" + "=" * 60)
    print("3. 实战：API调用限速（防止被封）")
    print("=" * 60)

    # 工作场景：批量调用第三方接口时，对方QPS限制是每秒2次
    # 那每次调用后要sleep至少0.5秒
    qps_limit = 2  # 每秒最多2次请求
    interval = 1.0 / qps_limit

    print(f"模拟调用API，QPS限制: {qps_limit}/秒，间隔: {interval}秒")

    for i in range(5):
        start = time.time()

        # 模拟调用API
        print(f"  [{i+1}/5] 调用API...", end=" ", flush=True)
        time.sleep(0.1)  # 模拟请求耗时0.1秒
        print("完成")

        # 计算还需要睡多久（确保总间隔达标）
        elapsed = time.time() - start
        if elapsed < interval:
            time.sleep(interval - elapsed)

    print("批量调用完成，符合QPS限制")


def demo_perf_counter_timing():
    """高精度性能计时"""
    print("\\n" + "=" * 60)
    print("4. time.perf_counter() 性能计时（推荐！）")
    print("=" * 60)

    # 为什么用perf_counter而不是time.time()？
    # 1. time.time()是系统时钟时间，用户可能修改系统时间，导致计时不准
    # 2. perf_counter是CPU高精度计时器，只用于计算时间差，不会受系统时间影响
    # 3. perf_counter精度更高（纳秒级）

    def slow_function():
        """模拟一个耗时函数"""
        total = 0
        for i in range(1_000_000):
            total += i
        return total

    # 计时开始
    start = time.perf_counter()

    # 执行要计时的代码
    result = slow_function()

    # 计时结束
    end = time.perf_counter()
    elapsed = end - start

    print(f"slow_function() 执行结果: {result}")
    print(f"执行耗时: {elapsed:.6f} 秒")
    print(f"  = {elapsed * 1000:.3f} 毫秒")
    print(f"  = {elapsed * 1_000_000:.1f} 微秒")


def demo_compare_timing_methods():
    """对比不同计时方法"""
    print("\\n" + "=" * 60)
    print("5. 计时方法对比")
    print("=" * 60)

    import datetime

    # 测试代码
    def code_to_test():
        time.sleep(0.1)
        return sum(range(10000))

    # 方法1: time.time()
    t1 = time.time()
    code_to_test()
    t2 = time.time()
    print(f"time.time() 计时: {(t2 - t1) * 1000:.3f} ms")

    # 方法2: time.perf_counter() （推荐！）
    t1 = time.perf_counter()
    code_to_test()
    t2 = time.perf_counter()
    print(f"perf_counter() 计时: {(t2 - t1) * 1000:.3f} ms  (推荐)")

    # 方法3: datetime
    t1 = datetime.datetime.now()
    code_to_test()
    t2 = datetime.datetime.now()
    print(f"datetime.now() 计时: {(t2 - t1).total_seconds() * 1000:.3f} ms")

    print("\\n结论：统计代码耗时 → 永远用 perf_counter()")


def demo_countdown_timer():
    """实战：倒计时器"""
    print("\\n" + "=" * 60)
    print("6. 实战：简易倒计时")
    print("=" * 60)

    seconds = 3
    print(f"倒计时 {seconds} 秒（演示用，实际快速执行）")

    # 真实倒计时会sleep，这里为了不卡演示只做1秒
    for i in range(seconds, 0, -1):
        print(f"  {i}...")
        time.sleep(0.3)  # 演示用0.3秒代替1秒
    print("  时间到！")


def demo_retry_with_sleep():
    """实战：带退避的重试机制"""
    print("\\n" + "=" * 60)
    print("7. 实战：指数退避重试")
    print("=" * 60)

    # 工作场景：调用外部接口失败时，不要立即重试（会给对方造成压力）
    # 应该等一会再试，而且等待时间逐渐增加（指数退避）

    max_retries = 3
    base_delay = 0.5  # 初始等待0.5秒

    print("模拟调用不稳定的接口...")

    for attempt in range(max_retries):
        print(f"  第 {attempt + 1} 次尝试...", end=" ")

        # 模拟随机失败（前两次失败，第三次成功）
        if attempt < 2:
            print("失败!")
            if attempt < max_retries - 1:
                delay = base_delay * (2 ** attempt)  # 指数退避: 0.5, 1.0, 2.0...
                print(f"    等待 {delay} 秒后重试...")
                time.sleep(delay * 0.3)  # 演示用缩短时间
        else:
            print("成功!")
            break


def main():
    demo_timestamp()
    demo_sleep_basic()
    demo_sleep_rate_limit()
    demo_perf_counter_timing()
    demo_compare_timing_methods()
    demo_countdown_timer()
    demo_retry_with_sleep()


if __name__ == "__main__":
    main()
`
  },
  {
    id: 'py-regex',
    group: '第五篇：常用标准库 · 开箱即用的利器',
    icon: '🔍',
    title: '正则表达式re模块（文本处理必备）',
    content: `# 正则表达式re模块（文本处理必备）

正则表达式是文本处理的神器，**数据清洗、日志解析、格式验证**都靠它。re模块是Python正则标准库，学会这一个模块，处理文本效率提升10倍。

## match/search/findall区别

| 函数 | 匹配位置 | 返回结果 | 场景 |
|------|----------|----------|------|
| \`re.match(pat, s)\` | 从**开头**匹配 | 第一个匹配/None | 验证开头格式（如是否是http开头） |
| \`re.search(pat, s)\` | **任意位置**搜索 | 第一个匹配/None | 查找文本中是否包含某个模式 |
| \`re.findall(pat, s)\` | 任意位置搜索 | **所有匹配**的列表 | 提取所有符合条件的内容 |
| \`re.finditer(pat, s)\` | 任意位置搜索 | 迭代器（省内存） | 处理大量匹配结果 |

\`\`\`python
import re

text = "电话：13800138000，备用：13900139000"

# search找到第一个
result = re.search(r"1[3-9]\\d{9}", text)
print(result.group())  # 13800138000

# findall找到所有
phones = re.findall(r"1[3-9]\\d{9}", text)
print(phones)  # ['13800138000', '13900139000']
\`\`\`

## 常用元字符

| 字符 | 含义 | 示例 |
|------|------|------|
| \`\\d\` | 数字 | \`\\d{3}\`匹配3位数字 |
| \`\\w\` | 单词字符（字母/数字/_） | \`\\w+\`匹配一个单词 |
| \`\\s\` | 空白字符（空格/制表/换行） | 匹配空格分隔 |
| \`.\` | 任意字符（除换行） | \`a.c\`匹配aac/abc/a1c |
| \`*\` | 前面字符0次或多次 | \`ab*c\`匹配ac/abc/abbc |
| \`+\` | 前面字符1次或多次 | \`ab+c\`匹配abc/abbc，不匹配ac |
| \`?\` | 前面字符0次或1次 | \`colou?r\`匹配color/colour |
| \`{n}\` | 恰好n次 | \`\\d{11}\`匹配11位手机号 |
| \`{n,m}\` | n到m次 | \`\\d{2,4}\`匹配2-4位数字 |
| \`[abc]\` | 字符集（a/b/c任一） | \`[aeiou]\`匹配元音 |
| \`[^abc]\` | 不在字符集中 | \`[^0-9]\`匹配非数字 |
| \`^\` | 字符串开头 | \`^http\`以http开头 |
| \`$\` | 字符串结尾 | \`\\.png$\`以.png结尾 |
| \`()\` | 分组捕获 | 提取子字符串 |
| \`|\` | 或 | \`cat|dog\`匹配cat或dog |

## 常用功能

\`\`\`python
# 替换：re.sub（比str.replace强大，可以用模式）
re.sub(r"\\d+", "N", "a1b22c333")  # "aNbNcN"

# 分割：re.split（按多个分隔符分割）
re.split(r"[\\s,;]+", "a,b;c  d")  # ['a', 'b', 'c', 'd']

# 预编译：同一个模式用多次，先编译提升性能
pattern = re.compile(r"\\d+")
pattern.findall("a1b22")  # ['1', '22']

# 忽略大小写
re.search(r"error", "ERROR", re.IGNORECASE)
\`\`\`

> **工作场景**：
> - 日志解析：从日志行中提取时间、IP、错误码
> - 数据清洗：从文本中提取手机号/邮箱/URL
> - 格式验证：判断用户输入是否是合法手机号/邮箱
> - 文本替换：批量替换敏感词、标准化格式

> **⚠️ 坑点**：
> - 正则字符串一定要用**raw字符串**\`r"..."\`，否则\\需要写\\\\，非常容易出错
> - \`match()\`只匹配开头，要全局搜索用\`search()\`或\`findall()\`
> - \`group(0)\`是整个匹配，\`group(1)\`是第一个括号分组，别搞混
> - 复杂正则不要一行写完，可以加\`re.VERBOSE\`写注释
> - 不要用正则解析HTML/XML，用专门的解析库（BeautifulSoup/lxml）
`,
    code: `"""
正则表达式re模块实战
工作场景：日志解析、数据清洗提取、格式验证
"""
import re


def demo_match_vs_search():
    """match vs search 核心区别"""
    print("=" * 60)
    print("1. match vs search vs findall 区别")
    print("=" * 60)

    text = "abc123def456"
    pattern = r"\\d+"  # 匹配数字

    # re.match(): 从字符串**开头**尝试匹配
    # 工作场景：验证字符串是否以某个模式开头（如URL是否以http开头）
    result_match = re.match(pattern, text)
    print(f"text = '{text}'")
    print(f"pattern = r'{pattern}'")
    print(f"re.match(): {result_match}")
    print(f"  → match只在开头匹配，开头是abc不是数字，所以返回None")

    # re.search(): 扫描**整个字符串**，返回第一个匹配
    # 工作场景：判断文本中是否存在某个模式（如是否包含error关键字）
    result_search = re.search(pattern, text)
    print(f"\\nre.search(): {result_search}")
    if result_search:
        print(f"  匹配到: '{result_search.group()}'，位置: {result_search.span()}")
        print(f"  → search找到第一个数字串 '123' 就返回了")

    # re.findall(): 找到**所有**匹配，返回列表
    # 工作场景：提取文本中所有符合条件的内容（如提取所有手机号）
    result_findall = re.findall(pattern, text)
    print(f"\\nre.findall(): {result_findall}")
    print(f"  → findall返回所有匹配 ['123', '456']")

    # re.finditer(): 找到所有匹配，返回迭代器（大数据量时省内存）
    print(f"\\nre.finditer():")
    for match in re.finditer(pattern, text):
        print(f"  匹配到: '{match.group()}', 位置: {match.span()}")


def demo_basic_patterns():
    """常用正则模式演示"""
    print("\\n" + "=" * 60)
    print("2. 常用正则元字符")
    print("=" * 60)

    test_text = "Hello  World! 2024-06-15 test@email.com"

    # \\d 数字
    digits = re.findall(r"\\d+", test_text)
    print(f"\\d+ (数字): {digits}")

    # \\w 单词字符（字母、数字、下划线）
    words = re.findall(r"\\w+", test_text)
    print(f"\\w+ (单词): {words}")

    # \\s 空白字符（空格、制表符、换行）
    spaces = re.findall(r"\\s+", test_text)
    print(f"\\s+ (空白): 匹配到 {len(spaces)} 处空白")

    # . 任意字符（除换行）
    # 注意：.*是贪婪匹配（尽可能多），.*?是非贪婪匹配（尽可能少）
    greedy = re.findall(r"H.*o", test_text)
    non_greedy = re.findall(r"H.*?o", test_text)
    print(f".* 贪婪匹配H开头o结尾: {greedy}")
    print(f".*? 非贪婪匹配H开头o结尾: {non_greedy}")
    print("  → 贪婪匹配到最后一个o，非贪婪匹配到第一个o")

    # [] 字符集
    # 匹配所有小写字母
    lowercase = re.findall(r"[a-z]+", test_text)
    print(f"[a-z]+ (小写字母): {lowercase}")

    # ^ 开头，$ 结尾
    print(f"\\n^ 开头匹配:")
    print(f"  以Hello开头? {bool(re.match(r'^Hello', test_text))}")
    print(f"  以World开头? {bool(re.match(r'^World', test_text))}")
    print(f"$ 结尾匹配:")
    print(f"  以com结尾? {bool(re.search(r'com$', test_text))}")


def demo_groups():
    """分组提取（工作高频）"""
    print("\\n" + "=" * 60)
    print("3. 分组提取 group()")
    print("=" * 60)

    # 场景：从日期字符串中提取年、月、日
    date_str = "日期：2024-06-15 星期六"
    print(f"文本: '{date_str}'")

    # 用()创建分组，可以分别提取年、月、日
    pattern = r"(\\d{4})-(\\d{2})-(\\d{2})"
    match = re.search(pattern, date_str)

    if match:
        print(f"\\n分组提取:")
        print(f"  group(0) 完整匹配: '{match.group(0)}'")
        print(f"  group(1) 年: '{match.group(1)}'")
        print(f"  group(2) 月: '{match.group(2)}'")
        print(f"  group(3) 日: '{match.group(3)}'")
        print(f"  groups() 所有分组: {match.groups()}")

    # 给分组命名（?P<name>...）- 代码可读性更好，推荐！
    named_pattern = r"(?P<year>\\d{4})-(?P<month>\\d{2})-(?P<day>\\d{2})"
    match = re.search(named_pattern, date_str)
    if match:
        print(f"\\n命名分组提取:")
        print(f"  group('year'): {match.group('year')}")
        print(f"  group('month'): {match.group('month')}")
        print(f"  group('day'): {match.group('day')}")
        print(f"  groupdict(): {match.groupdict()}")


def demo_sub_split():
    """替换和分割"""
    print("\\n" + "=" * 60)
    print("4. re.sub() 替换 和 re.split() 分割")
    print("=" * 60)

    # re.sub() 替换（比str.replace强大，可以用正则模式）
    # 工作场景：数据脱敏（手机号中间4位变*）、清理多余空白
    text = "我的电话是13812345678，你的电话是13987654321"
    print(f"原文本: {text}")

    # 手机号脱敏：保留前3后4，中间用****
    def mask_phone(match):
        phone = match.group()
        return phone[:3] + "****" + phone[-4:]

    masked = re.sub(r"1[3-9]\\d{9}", mask_phone, text)
    print(f"脱敏后: {masked}")

    # 清理多余空白：多个空格/制表/换行变成一个空格
    messy_text = "hello   world\\t\\tfoo\\n\\nbar"
    cleaned = re.sub(r"\\s+", " ", messy_text)
    print(f"\\n清理空白: '{messy_text}' → '{cleaned}'")

    # re.split() 按正则分割（可以按多个分隔符分割）
    # 工作场景：解析CSV、分割混合分隔符的文本
    csv_line = "apple, banana; orange  grape\\tmango"
    items = re.split(r"[,;\\s]+", csv_line)
    items = [item for item in items if item]  # 过滤空字符串
    print(f"\\n多分隔符分割: '{csv_line}'")
    print(f"  → {items}")


def demo_compile():
    """预编译提升性能"""
    print("\\n" + "=" * 60)
    print("5. re.compile() 预编译（性能优化）")
    print("=" * 60)

    # 为什么要预编译？
    # 如果同一个正则模式要在循环中使用N次，re.compile()只编译一次
    # 而re.search(pattern, s)每次都要编译pattern，循环量大时差距明显

    # 模拟：处理1000行日志，提取IP地址
    logs = [f"192.168.1.{i} - - [15/Jun/2024:14:30:{i:02d}] GET /api" for i in range(100)]

    # 方法1：每次都传pattern字符串（不推荐循环使用）
    import time
    start = time.perf_counter()
    for log in logs:
        re.search(r"^(\\d+\\.\\d+\\.\\d+\\.\\d+)", log)
    t1 = time.perf_counter() - start

    # 方法2：先compile，再用编译后的对象（推荐）
    ip_pattern = re.compile(r"^(\\d+\\.\\d+\\.\\d+\\.\\d+)")
    start = time.perf_counter()
    for log in logs:
        ip_pattern.search(log)
    t2 = time.perf_counter() - start

    print(f"处理{len(logs)}行日志:")
    print(f"  每次re.search(): {t1*1000:.2f}ms")
    print(f"  先compile再用: {t2*1000:.2f}ms")
    print(f"  结论：同一模式用多次 → 一定要先compile")


def demo_common_regex():
    """工作中常用的正则表达式"""
    print("\\n" + "=" * 60)
    print("6. 工作常用正则：手机号/邮箱/URL/IP")
    print("=" * 60)

    test_cases = {
        "手机号": [
            ("13812345678", True),
            ("12345678901", False),  # 第二位不对
            ("1380013800", False),   # 少一位
            ("23800138000", False),  # 第一位不是1
        ],
        "邮箱": [
            ("test@example.com", True),
            ("user.name@company.co.jp", True),
            ("invalid@", False),
            ("@nodomain.com", False),
        ],
        "URL": [
            ("https://www.example.com/path?query=1", True),
            ("http://api.test.cn/v2/users", True),
            ("not-a-url", False),
        ],
    }

    # 手机号正则（简化版，中国大陆手机号）
    phone_re = re.compile(r"^1[3-9]\\d{9}$")
    # 邮箱正则（实用版，覆盖大多数场景）
    email_re = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")
    # URL正则（简化版）
    url_re = re.compile(r"^https?://[\\w.-]+(?:/[\\w./?%&=-]*)?$")

    patterns = {
        "手机号": phone_re,
        "邮箱": email_re,
        "URL": url_re,
    }

    for name, cases in test_cases.items():
        pattern = patterns[name]
        print(f"\\n【{name}】验证:")
        for text, expected in cases:
            result = bool(pattern.match(text))
            status = "✓" if result == expected else "✗"
            print(f"  {status} '{text}' → {result} (预期{expected})")


def demo_flags():
    """正则标志位"""
    print("\\n" + "=" * 60)
    print("7. 常用标志位 flags")
    print("=" * 60)

    text = "ERROR: something wrong\\nError: another error\\nerror: third one"

    # re.IGNORECASE (re.I) 忽略大小写
    print(f"原文本:\\n{text}")
    matches_case = re.findall(r"error", text)
    matches_ignore = re.findall(r"error", text, re.IGNORECASE)
    print(f"\\n区分大小写匹配error: {matches_case}")
    print(f"忽略大小写匹配error: {matches_ignore}")

    # re.MULTILINE (re.M) 多行模式，^和$匹配每行开头结尾
    print(f"\\n多行模式:")
    # 不用MULTILINE，^只匹配整个字符串开头
    starts_with_error = re.findall(r"^error", text, re.IGNORECASE)
    print(f"  非多行模式，^error匹配: {starts_with_error}")
    # 用MULTILINE，^匹配每一行开头
    starts_with_error_m = re.findall(r"^error", text, re.IGNORECASE | re.MULTILINE)
    print(f"  多行模式，^error匹配: {starts_with_error_m}")

    # re.DOTALL (re.S) 让.匹配包括换行在内的所有字符
    # 工作场景：匹配多行文本块
    multi_line = "start\\ncontent\\nend"
    print(f"\\nDOTALL标志（.匹配换行）:")
    print(f"  不用DOTALL: {re.findall(r'start.*end', multi_line)}")
    print(f"  用DOTALL: {re.findall(r'start.*end', multi_line, re.DOTALL)}")


def demo_log_parse():
    """实战：解析Nginx日志"""
    print("\\n" + "=" * 60)
    print("8. 实战：解析Nginx访问日志")
    print("=" * 60)

    log_line = '192.168.1.100 - - [15/Jun/2024:14:35:22 +0800] "GET /api/users?id=123 HTTP/1.1" 200 1234 "https://example.com" "Mozilla/5.0"'
    print(f"日志行: {log_line}")

    # Nginx日志正则解析（标准combined格式）
    log_pattern = re.compile(
        r'(?P<ip>\\S+) '
        r'(?P<ident>\\S+) '
        r'(?P<user>\\S+) '
        r'\\[(?P<time>[^\\]]+)\\] '
        r'"(?P<method>\\S+) (?P<path>\\S+) (?P<protocol>[^"]+)" '
        r'(?P<status>\\d+) '
        r'(?P<size>\\d+) '
        r'"(?P<referer>[^"]*)" '
        r'"(?P<ua>[^"]*)"'
    )

    match = log_pattern.match(log_line)
    if match:
        data = match.groupdict()
        print(f"\\n解析结果:")
        for key, value in data.items():
            print(f"  {key}: {value}")
        print(f"\\n  → 状态码: {data['status']}, 请求路径: {data['path']}")


def main():
    demo_match_vs_search()
    demo_basic_patterns()
    demo_groups()
    demo_sub_split()
    demo_compile()
    demo_common_regex()
    demo_flags()
    demo_log_parse()


if __name__ == "__main__":
    main()
`
  },
  {
    id: 'py-logging',
    group: '第五篇：常用标准库 · 开箱即用的利器',
    icon: '📝',
    title: 'logging日志记录（比print专业）',
    content: `# logging日志记录（比print专业）

print只适合临时调试，生产环境**必须用logging**。logging有级别控制、可输出到文件、可格式化、可自动轮转，是专业程序的标配。

## 为什么不用print？

| 特性 | print | logging |
|------|-------|---------|
| 级别控制 | ❌ 全部输出 | ✅ 可控制DEBUG/INFO/WARNING/ERROR只输出某级别以上 |
| 输出到文件 | ❌ 需要自己写代码 | ✅ 简单配置即可 |
| 格式化（时间/级别） | ❌ 自己拼接 | ✅ 自动带时间、级别、文件名、行号 |
| 日志轮转 | ❌ 没有 | ✅ 按大小/时间自动切分文件 |
| 多模块使用 | ❌ 到处print很乱 | ✅ 统一配置，所有模块用同一个logger |

## 日志级别

| 级别 | 数值 | 使用场景 |
|------|------|----------|
| \`DEBUG\` | 10 | 调试细节，开发时看，生产环境关闭 |
| \`INFO\` | 20 | 正常运行信息（如"服务启动"、"用户登录"） |
| \`WARNING\` | 30 | 警告，但不影响运行（如"配置项缺失用默认值"） |
| \`ERROR\` | 40 | 错误，某个功能失败了（如"数据库连接失败"） |
| \`CRITICAL\` | 50 | 严重错误，程序可能崩溃（如"磁盘满了"） |

## 三大组件：Logger/Handler/Formatter

- **Logger**：日志记录器，你代码里调用\`logger.info()\`的那个对象
- **Handler**：处理器，决定日志输出到哪里（控制台/文件/邮件）
- **Formatter**：格式化器，决定日志长什么样（时间格式、包含哪些信息）

\`\`\`python
import logging

# 简单配置（快速使用）
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)
logger.info("程序启动")
\`\`\`

\`\`\`python
# 同时输出到控制台和文件（常用配置）
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

# 控制台Handler
console = logging.StreamHandler()
console.setLevel(logging.INFO)
logger.addHandler(console)

# 文件Handler
file_handler = logging.FileHandler("app.log")
file_handler.setLevel(logging.DEBUG)
logger.addHandler(file_handler)
\`\`\`

## 日志轮转（生产必备）

日志文件不能无限增长，必须轮转：

- **RotatingFileHandler**：按大小切分，比如到10MB就新建一个文件，最多保留5个备份
- **TimedRotatingFileHandler**：按时间切分，每天/每小时一个新文件

> **工作场景**：
> - 程序运行状态追踪（启动、处理了多少请求）
> - 错误排查（ERROR级别记录异常堆栈）
> - 审计日志（谁在什么时间做了什么操作）
> - 性能分析（记录接口响应时间）

> **⚠️ 最佳实践**：
> - 每个模块用\`logger = logging.getLogger(__name__)\`，不要用root logger
> - 生产环境日志级别设为INFO，不要开DEBUG（日志太多）
> - 异常一定要用\`logger.exception()\`，自动记录完整堆栈
> - 日志文件一定要配置轮转，不然磁盘会被写满！
> - 不要在日志里打印密码、token、身份证号等敏感信息
`,
    code: `"""
logging日志模块实战
为什么用logging而不是print？级别控制、持久化、格式化、轮转
"""
import logging
import sys
import os
import time
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler


def demo_basic_config():
    """快速入门：basicConfig简单配置"""
    print("=" * 60)
    print("1. basicConfig 快速使用")
    print("=" * 60)

    # basicConfig是最简单的配置方式，适合小脚本
    # 注意：basicConfig必须在所有logging调用之前执行，否则不生效！
    # level设置最低输出级别，低于这个级别的日志不会输出
    # format设置日志格式

    # 重置logging配置（演示用，实际项目不要这么做）
    for handler in logging.root.handlers[:]:
        logging.root.removeHandler(handler)

    logging.basicConfig(
        level=logging.DEBUG,  # DEBUG及以上级别都输出
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        stream=sys.stdout  # 输出到控制台（默认是stderr）
    )

    logger = logging.getLogger("demo_basic")

    # 不同级别日志
    logger.debug("这是DEBUG级别：调试细节，变量值、执行步骤")
    logger.info("这是INFO级别：正常运行信息，服务启动、任务完成")
    logger.warning("这是WARNING级别：警告，配置用默认值、磁盘快满了")
    logger.error("这是ERROR级别：错误，数据库连接失败、API调用超时")
    logger.critical("这是CRITICAL级别：严重错误，服务要挂了")


def demo_why_not_print():
    """演示：logging比print好在哪 - 级别控制"""
    print("\\n" + "=" * 60)
    print("2. 为什么不用print？级别控制演示")
    print("=" * 60)

    for handler in logging.root.handlers[:]:
        logging.root.removeHandler(handler)

    # 模拟：开发环境用DEBUG级别，生产环境用INFO级别
    logging.basicConfig(
        level=logging.INFO,  # 改成DEBUG看更多细节，生产环境用INFO
        format="%(levelname)-8s %(message)s",
        stream=sys.stdout
    )
    logger = logging.getLogger("level_demo")

    print("当前日志级别: INFO（生产环境常用）")
    print("DEBUG级别日志不会显示:")
    logger.debug("  [DEBUG] SQL查询: SELECT * FROM users WHERE id=123")  # 不会显示
    logger.debug("  [DEBUG] 函数返回值: {'name': '张三'}")               # 不会显示
    logger.info("  [INFO] 用户 123 登录成功")
    logger.warning("  [WARNING] Redis连接失败，使用数据库查询")
    logger.error("  [ERROR] 支付接口调用超时，订单号: 456")

    print("\\n→ 好处：改一行level配置，就能控制输出多少日志")
    print("  print做不到这一点，要么全输出要么全注释掉，很麻烦")


def demo_format():
    """日志格式化：常用字段"""
    print("\\n" + "=" * 60)
    print("3. 日志格式化常用字段")
    print("=" * 60)

    for handler in logging.root.handlers[:]:
        logging.root.removeHandler(handler)

    # 常用格式字段：
    # %(asctime)s     - 时间
    # %(name)s        - logger名称
    # %(levelname)s   - 级别名称
    # %(levelno)s     - 级别数字
    # %(message)s     - 日志消息
    # %(filename)s    - 文件名
    # %(funcName)s    - 函数名
    # %(lineno)d      - 行号
    # %(module)s      - 模块名
    # %(process)d     - 进程ID
    # %(thread)d      - 线程ID

    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s | %(levelname)-8s | %(filename)s:%(lineno)d - %(message)s",
        datefmt="%H:%M:%S",
        stream=sys.stdout
    )
    logger = logging.getLogger("format_demo")

    logger.debug("这条日志包含了时间、级别、文件名、行号")
    logger.info("出问题时直接看日志就知道在哪个文件哪一行")


def demo_file_handler():
    """输出到文件"""
    print("\\n" + "=" * 60)
    print("4. 输出到文件")
    print("=" * 60)

    # 创建一个专用logger，不干扰root
    logger = logging.getLogger("file_demo")
    logger.setLevel(logging.DEBUG)
    # 避免重复添加handler
    logger.handlers.clear()

    log_file = "/tmp/test_app.log"

    # FileHandler: 输出到文件
    file_handler = logging.FileHandler(log_file, encoding="utf-8")
    file_handler.setLevel(logging.DEBUG)
    file_formatter = logging.Formatter(
        "%(asctime)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    file_handler.setFormatter(file_formatter)
    logger.addHandler(file_handler)

    # 同时输出到控制台
    console = logging.StreamHandler(sys.stdout)
    console.setLevel(logging.INFO)
    console.setFormatter(logging.Formatter("%(levelname)-8s %(message)s"))
    logger.addHandler(console)

    logger.info("这条日志会同时出现在控制台和文件")
    logger.debug("DEBUG只写文件，不输出控制台（减少控制台噪音）")
    logger.warning("警告信息也两边都有")

    print(f"\\n日志已写入文件: {log_file}")
    print("文件内容预览:")
    if os.path.exists(log_file):
        with open(log_file, "r", encoding="utf-8") as f:
            for line in f.readlines()[-5:]:
                print(f"  {line.rstrip()}")


def demo_rotating_file():
    """日志轮转：按大小切分"""
    print("\\n" + "=" * 60)
    print("5. RotatingFileHandler 按大小轮转")
    print("=" * 60)

    logger = logging.getLogger("rotate_demo")
    logger.setLevel(logging.DEBUG)
    logger.handlers.clear()

    # 为什么需要日志轮转？
    # 如果程序一直运行，日志文件会越来越大，几个G甚至几十G
    # RotatingFileHandler: 文件到一定大小就自动新建一个，旧文件改名备份

    log_file = "/tmp/test_rotate.log"

    # maxBytes: 单个日志文件最大字节数（这里设1KB演示用，生产环境一般10-50MB）
    # backupCount: 最多保留几个备份文件，超过的就删除
    rotating_handler = RotatingFileHandler(
        log_file,
        maxBytes=1024,      # 1KB就轮转（演示用）
        backupCount=3,      # 保留3个备份
        encoding="utf-8"
    )
    rotating_handler.setFormatter(logging.Formatter("%(asctime)s - %(message)s"))
    logger.addHandler(rotating_handler)

    console = logging.StreamHandler(sys.stdout)
    console.setFormatter(logging.Formatter("%(message)s"))
    logger.addHandler(console)

    print("写入日志触发轮转（演示快速写入）...")
    for i in range(50):
        logger.info(f"这是第{i}条日志，用来测试文件轮转功能，写够1KB就切分")
        time.sleep(0.01)

    print(f"\\n查看日志目录下的文件:")
    log_dir = os.path.dirname(log_file) or "."
    for f in sorted(os.listdir(log_dir)):
        if "test_rotate" in f:
            fpath = os.path.join(log_dir, f)
            size = os.path.getsize(fpath)
            print(f"  {f} - {size} bytes")

    print("\\n→ 生产环境建议: maxBytes=10*1024*1024 (10MB), backupCount=30")


def demo_timed_rotating():
    """按时间轮转（每天一个日志文件）"""
    print("\\n" + "=" * 60)
    print("6. TimedRotatingFileHandler 按时间轮转")
    print("=" * 60)

    # 常用场景：每天一个日志文件，保留30天
    print("TimedRotatingFileHandler 常用配置:")
    print("  when='D'   - 按天轮转")
    print("  when='H'   - 按小时轮转")
    print("  when='midnight' - 每天午夜轮转")
    print("  interval=1 - 间隔1个单位")
    print("  backupCount=30 - 保留30个备份（一个月）")
    print("\\n示例代码（不实际运行）:")
    print('''
    handler = TimedRotatingFileHandler(
        "app.log",
        when="midnight",    # 每天零点切分
        interval=1,
        backupCount=30,     # 保留30天
        encoding="utf-8"
    )
    ''')


def demo_exception_logging():
    """记录异常堆栈（排查错误必备）"""
    print("\\n" + "=" * 60)
    print("7. logger.exception() 记录异常堆栈")
    print("=" * 60)

    for handler in logging.root.handlers[:]:
        logging.root.removeHandler(handler)

    logging.basicConfig(
        level=logging.DEBUG,
        format="%(levelname)-8s %(message)s",
        stream=sys.stdout
    )
    logger = logging.getLogger("exception_demo")

    # 坑点：logger.error()不会自动记录堆栈，只记录你传的消息
    # 出异常时一定要用logger.exception()，它会自动带上完整traceback
    def divide(a, b):
        return a / b

    print("错误写法：只用logger.error()，看不到堆栈")
    try:
        divide(1, 0)
    except ZeroDivisionError:
        logger.error("除法出错了")

    print("\\n正确写法：用logger.exception()，自动记录完整堆栈")
    try:
        divide(1, 0)
    except ZeroDivisionError:
        logger.exception("除法出错了")  # 自动带上traceback！

    print("\\n→ 生产环境排查错误全靠这个堆栈信息！")


def demo_multi_module():
    """多模块使用logging（项目推荐写法）"""
    print("\\n" + "=" * 60)
    print("8. 多模块使用最佳实践")
    print("=" * 60)

    print("""
# 推荐的项目结构和用法：

# 1. 在主入口文件（main.py）统一配置logging一次
# main.py:
#   import logging
#   from logging.handlers import RotatingFileHandler
#
#   def setup_logging():
#       root_logger = logging.getLogger()
#       root_logger.setLevel(logging.INFO)
#
#       # 控制台
#       console = logging.StreamHandler()
#       console.setFormatter(logging.Formatter(
#           "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
#       ))
#       root_logger.addHandler(console)
#
#       # 文件（带轮转）
#       file_handler = RotatingFileHandler(
#           "app.log", maxBytes=10*1024*1024, backupCount=30, encoding="utf-8"
#       )
#       file_handler.setFormatter(logging.Formatter(
#           "%(asctime)s [%(levelname)s] %(name)s (%(filename)s:%(lineno)d): %(message)s"
#       ))
#       root_logger.addHandler(file_handler)
#
#   if __name__ == "__main__":
#       setup_logging()
#       # 启动你的应用

# 2. 在其他任何模块文件（user.py, db.py...）顶部加：
#   import logging
#   logger = logging.getLogger(__name__)  # __name__是模块名，方便定位
#
#   def login():
#       logger.info("用户登录成功")  # 用这个logger就行
#       logger.error("数据库连接失败")
""")

    print("""
⚠️ 注意事项（避坑指南）：

1. 不要用logging.info()直接调用，用getLogger()获取自己的logger
2. 不要在每个模块都调用basicConfig()，配置只做一次（主入口做）
3. 异常捕获里用logger.exception()，不要logger.error(e)
4. 生产环境不要开DEBUG，日志量会爆炸
5. 日志文件一定要配轮转，不然磁盘会满
6. 不要打印密码、token、身份证、银行卡号等敏感信息！
7. 日志要有意义："出错了"没用，要写"订单456支付失败：余额不足"
""")


def main():
    demo_basic_config()
    demo_why_not_print()
    demo_format()
    demo_file_handler()
    demo_rotating_file()
    demo_timed_rotating()
    demo_exception_logging()
    demo_multi_module()


if __name__ == "__main__":
    main()
`
  },
  {
    id: 'py-random',
    group: '第五篇：常用标准库 · 开箱即用的利器',
    icon: '🎲',
    title: 'random随机与uuid',
    content: `# random随机与uuid

工作中经常需要生成随机数据：测试数据、验证码、随机抽样、抽奖、唯一ID。random模块处理伪随机数，uuid生成唯一标识符，secrets处理安全随机（密码学安全）。

## 常用函数速查

| 函数 | 用途 | 示例 |
|------|------|------|
| \`random.random()\` | 0-1之间随机浮点数 | 0.3744 |
| \`random.randint(a, b)\` | [a, b]随机整数 | randint(1, 6)掷骰子 |
| \`random.choice(seq)\` | 序列中随机选一个 | choice(名单)抽奖 |
| \`random.choices(seq, k=n)\` | 随机选n个（有放回） | 可能重复 |
| \`random.sample(seq, k=n)\` | 随机选n个（无放回） | 不会重复 |
| \`random.shuffle(list)\` | 原地打乱列表顺序 | 洗牌 |
| \`random.seed(n)\` | 设置随机种子（可复现） | 测试时固定结果 |

\`\`\`python
import random

# 随机整数（闭区间，包含两端）
print(random.randint(1, 100))  # 1到100之间的整数

# 随机选一个
fruits = ["苹果", "香蕉", "橙子"]
print(random.choice(fruits))

# 随机选多个不重复（抽奖）
winners = random.sample(range(1, 101), 3)  # 1-100号抽3个不重复
print(winners)

# 打乱顺序
cards = ["A", "2", "3", "4", "5"]
random.shuffle(cards)
print(cards)
\`\`\`

## uuid：生成唯一ID

uuid4()生成随机UUID，**重复概率极低**，可以认为是唯一的：

\`\`\`python
import uuid

uid = uuid.uuid4()
print(uid)  # 如：a1b2c3d4-e5f6-7890-abcd-ef1234567890
print(str(uid))  # 转字符串
print(uid.hex)  # 不带横线的32位字符串
\`\`\`

## secrets：密码学安全随机

random模块是伪随机，**不能用于密码、token等安全场景**。安全场景要用secrets模块：

\`\`\`python
import secrets
import string

# 生成安全验证码
alphabet = string.digits
code = ''.join(secrets.choice(alphabet) for _ in range(6))
print(code)  # 6位数字验证码

# 生成安全token
token = secrets.token_hex(16)  # 16字节=32个十六进制字符
print(token)
\`\`\`

> **工作场景**：
> - 生成测试数据（随机姓名、手机号、年龄）
> - 抽奖/随机抽样（sample不重复）
> - 生成验证码（6位数字）
> - 生成唯一ID（订单号、用户ID、文件名）
> - 发牌、洗牌（shuffle）
> - 密码重置token（用secrets）

> **⚠️ 坑点**：
> - random是伪随机，不要用于密码/密钥/token，用secrets！
> - randint(a,b)是闭区间，包含b！range(1,10)是1-9，但randint(1,10)包含10
> - choices是有放回（可重复），sample是无放回（不重复），别搞混
> - shuffle是原地修改，返回None！不要写\`arr = random.shuffle(arr)\`
> - 设置seed后随机结果固定，只用于测试复现，生产环境不要设seed
`,
    code: `"""
random随机数、uuid唯一ID、secrets安全随机实战
工作场景：测试数据生成、随机抽样、验证码、唯一ID
"""
import random
import uuid
import secrets
import string


def demo_random_basic():
    """random基础函数"""
    print("=" * 60)
    print("1. random基础函数")
    print("=" * 60)

    # random() 返回 [0.0, 1.0) 之间的浮点数
    # 注意：左闭右开，包含0不包含1
    r1 = random.random()
    print(f"random() → {r1:.6f} (0到1之间随机浮点数)")

    # uniform(a, b) 返回 [a, b] 或 [b, a] 之间的浮点数
    r2 = random.uniform(10, 20)
    print(f"uniform(10, 20) → {r2:.2f} (10到20之间浮点数)")

    # randint(a, b) 返回 [a, b] 之间的整数（闭区间！包含b）
    # ⚠️ 坑点：和range不同！range(1, 10)不包含10，但randint(1,10)包含10
    dice = random.randint(1, 6)  # 掷骰子
    print(f"randint(1, 6) → {dice} (掷骰子)")

    # randrange(start, stop, step) 和range一样左闭右开
    even = random.randrange(0, 100, 2)  # 0-98的偶数
    print(f"randrange(0, 100, 2) → {even} (0-98偶数)")


def demo_choice_sample():
    """choice、choices、sample 随机选择"""
    print("\\n" + "=" * 60)
    print("2. 随机选择：choice / choices / sample")
    print("=" * 60)

    fruits = ["苹果", "香蕉", "橙子", "葡萄", "西瓜", "草莓", "芒果"]
    print(f"候选列表: {fruits}")

    # choice(seq) 随机选1个
    # 工作场景：随机选一个幸运用户
    one = random.choice(fruits)
    print(f"choice() 选1个: {one}")

    # choices(seq, k=n) 随机选n个，有放回（可能重复！）
    # weights参数可以设置权重
    # 工作场景：带权重的随机（比如抽奖概率不同）
    multi_with_replacement = random.choices(fruits, k=3)
    print(f"choices(k=3) 选3个（有放回，可能重复）: {multi_with_replacement}")

    # 带权重选择：苹果权重最高
    weights = [10, 5, 3, 2, 2, 1, 1]
    weighted = random.choices(fruits, weights=weights, k=5)
    print(f"choices带权重（苹果最容易中）: {weighted}")

    # sample(seq, k=n) 随机选n个，无放回（不会重复！）
    # 工作场景：抽奖抽N个不重复的中奖者
    # ⚠️ 注意：k不能超过序列长度，否则报错
    winners = random.sample(fruits, k=3)
    print(f"sample(k=3) 选3个（无放回，不重复）: {winners}")

    print("\\n→ 关键区别：choices有放回可重复，sample无放回不重复")


def demo_shuffle():
    """shuffle打乱顺序"""
    print("\\n" + "=" * 60)
    print("3. shuffle 打乱顺序")
    print("=" * 60)

    # shuffle(list) 原地打乱列表
    # ⚠️ 坑点：shuffle直接修改原列表，返回None！
    # 错误写法：arr = random.shuffle(arr) → arr会变成None！
    cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
    print(f"原牌组: {cards}")

    random.shuffle(cards)
    print(f"洗牌后: {cards}")

    # 如果不想修改原列表，先copy一份
    original = [1, 2, 3, 4, 5]
    shuffled = original.copy()
    random.shuffle(shuffled)
    print(f"\\n原列表不变: {original}")
    print(f"打乱后的副本: {shuffled}")


def demo_seed():
    """seed随机种子（可复现）"""
    print("\\n" + "=" * 60)
    print("4. seed 随机种子（测试可复现）")
    print("=" * 60)

    # 为什么需要seed？
    # random是伪随机数，由算法生成。设置相同seed，会得到相同随机序列
    # 工作场景：单元测试时固定随机结果，方便断言；调试时复现bug

    # 第一次设seed=42
    random.seed(42)
    result1 = [random.randint(1, 100) for _ in range(5)]
    print(f"seed=42 第一次: {result1}")

    # 再设seed=42，结果一样！
    random.seed(42)
    result2 = [random.randint(1, 100) for _ in range(5)]
    print(f"seed=42 第二次: {result2}")
    print(f"两次结果相同? {result1 == result2}")

    # 设seed=123，结果不同
    random.seed(123)
    result3 = [random.randint(1, 100) for _ in range(5)]
    print(f"seed=123: {result3}")

    print("\\n→ 注意：生产环境不要设seed！只在测试/调试时用")


def demo_uuid():
    """uuid生成唯一ID"""
    print("\\n" + "=" * 60)
    print("5. uuid 生成唯一标识符")
    print("=" * 60)

    # uuid.uuid4() 基于随机数生成UUID
    # 重复概率极低（约1/10^36），可以认为是世界唯一的
    # 工作场景：订单号、文件名、用户ID、数据库主键、请求ID

    uid1 = uuid.uuid4()
    uid2 = uuid.uuid4()
    print(f"uuid4(): {uid1}")
    print(f"uuid4(): {uid2}")
    print(f"两个不同? {uid1 != uid2}")

    # 常用格式转换
    print(f"\\n不同格式:")
    print(f"  str(): {str(uid1)}")
    print(f"  hex: {uid1.hex} (32位，无横线)")
    print(f"  int: {uid1.int} (数字形式)")
    print(f"  bytes: {len(uid1.bytes)} 字节")

    # 工作场景：生成不会重复的临时文件名
    temp_filename = f"upload_{uuid.uuid4().hex}.jpg"
    print(f"\\n临时文件名: {temp_filename}")

    # uuid1() 包含MAC地址和时间，不推荐（可能泄露隐私）
    # uuid4() 纯随机，推荐使用
    print("\\n→ 推荐用uuid.uuid4()，不要用uuid1()（隐私问题）")


def demo_secrets():
    """secrets安全随机（密码学安全）"""
    print("\\n" + "=" * 60)
    print("6. secrets 密码学安全随机")
    print("=" * 60)

    # random模块是伪随机数生成器（Mersenne Twister），不安全
    # 用于游戏、测试数据没问题，但不能用于：
    # - 生成密码
    # - 生成token（密码重置、session）
    # - 生成密钥
    # - 验证码（严格来说验证码也应该用secrets）
    # 这些安全场景要用secrets模块！

    # 生成6位数字验证码
    # secrets.choice 是安全版本的random.choice
    digits = string.digits  # "0123456789"
    sms_code = ''.join(secrets.choice(digits) for _ in range(6))
    print(f"6位短信验证码: {sms_code}")

    # 生成包含字母数字的密码
    alphabet = string.ascii_letters + string.digits
    password = ''.join(secrets.choice(alphabet) for _ in range(12))
    print(f"12位随机密码: {password}")

    # token_hex(n) 生成n字节的hex字符串
    # 16字节 = 32个hex字符 = 128位安全强度
    token = secrets.token_hex(16)
    print(f"token_hex(16): {token} (用于密码重置链接)")

    # token_urlsafe(n) 生成URL安全的base64编码token
    url_token = secrets.token_urlsafe(16)
    print(f"token_urlsafe(16): {url_token} (适合放在URL里)")

    # 比较：random vs secrets
    print("\\n对比:")
    print(f"  random.randint(0, 999999): {random.randint(0, 999999):06d} (不安全，可预测)")
    print(f"  secrets验证码: {sms_code} (安全，不可预测)")

    print("\\n⚠️ 安全原则：")
    print("  - 验证码、密码、token、密钥 → 用secrets")
    print("  - 测试数据、洗牌、抽奖 → 用random就够了")


def demo_test_data_generation():
    """实战：生成测试数据"""
    print("\\n" + "=" * 60)
    print("7. 实战：批量生成测试用户数据")
    print("=" * 60)

    first_names = ["张", "李", "王", "刘", "陈", "杨", "赵", "黄", "周", "吴"]
    last_names = ["伟", "芳", "娜", "敏", "静", "强", "磊", "军", "洋", "勇", "艳", "杰"]
    cities = ["北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "南京"]

    def generate_user(uid):
        name = random.choice(first_names) + random.choice(last_names)
        age = random.randint(18, 65)
        city = random.choice(cities)
        phone_prefix = "138"
        phone_suffix = ''.join(random.choices(string.digits, k=8))
        phone = phone_prefix + phone_suffix
        return {
            "id": uid,
            "name": name,
            "age": age,
            "city": city,
            "phone": phone,
        }

    # 生成10个测试用户
    random.seed(42)  # 固定seed，方便测试复现
    users = [generate_user(i + 1) for i in range(10)]

    print("生成10个测试用户:")
    for u in users[:5]:
        print(f"  {u['id']}. {u['name']}, {u['age']}岁, {u['city']}, {u['phone']}")
    print("  ...")


def demo_lottery():
    """实战：抽奖程序"""
    print("\\n" + "=" * 60)
    print("8. 实战：年会抽奖")
    print("=" * 60)

    # 年会抽奖：100个员工，抽三等奖3名、二等奖2名、一等奖1名
    employees = [f"员工{str(i).zfill(3)}" for i in range(1, 101)]
    print(f"参与人数: {len(employees)}人")

    # 三等奖3名（不重复）
    third_prize = random.sample(employees, 3)
    print(f"\\n三等奖(3名): {third_prize}")

    # 从剩下的人中抽二等奖2名
    remaining = [e for e in employees if e not in third_prize]
    second_prize = random.sample(remaining, 2)
    print(f"二等奖(2名): {second_prize}")

    # 剩下的抽一等奖1名
    remaining = [e for e in remaining if e not in second_prize]
    first_prize = random.sample(remaining, 1)
    print(f"一等奖(1名): {first_prize}")

    winners = set(third_prize + second_prize + first_prize)
    print(f"\\n总中奖人数: {len(winners)}人 (无重复)")


def main():
    demo_random_basic()
    demo_choice_sample()
    demo_shuffle()
    demo_seed()
    demo_uuid()
    demo_secrets()
    demo_test_data_generation()
    demo_lottery()


if __name__ == "__main__":
    main()
`
  },
  {
    id: 'py-argparse',
    group: '第五篇：常用标准库 · 开箱即用的利器',
    icon: '🎛️',
    title: 'argparse命令行参数',
    content: `# argparse命令行参数

写Python脚本经常需要传参数：比如数据导入脚本要传文件路径、批处理脚本要传日期范围、工具脚本要传配置项。用sys.argv解析很麻烦，argparse是标准库自带的专业命令行解析工具。

## 核心流程

\`\`\`python
import argparse

# 1. 创建解析器
parser = argparse.ArgumentParser(description="我的脚本描述")

# 2. 添加参数
parser.add_argument("filename", help="输入文件路径")  # 位置参数
parser.add_argument("--output", "-o", default="out.txt", help="输出文件")  # 可选参数
parser.add_argument("--verbose", "-v", action="store_true", help="详细输出")  # 开关

# 3. 解析参数
args = parser.parse_args()

# 4. 使用参数
print(args.filename)
print(args.output)
print(args.verbose)
\`\`\`

## 参数类型

| 类型 | 示例 | 特点 |
|------|------|------|
| 位置参数 | \`add_argument("name")\` | 必填，按顺序传 |
| 可选参数 | \`add_argument("--name")\` | 可选，用--xxx传 |
| 短选项 | \`add_argument("-n", "--name")\` | 短选项-n和长选项--name都可以 |
| 开关 | \`action="store_true"\` | 传了就是True，不传就是False |
| 计数 | \`action="count"\` | -v是WARNING，-vv是INFO，-vvv是DEBUG |

## 常用参数配置

\`\`\`python
parser.add_argument(
    "--port", "-p",
    type=int,               # 自动类型转换
    default=8080,           # 默认值
    choices=[8000, 8080, 9000],  # 只能选这几个值
    required=True,          # 是否必填（可选参数也能设必填）
    help="服务端口号"        # --help显示的帮助信息
)
\`\`\`

## 自动生成帮助

argparse最方便的是**自动生成--help**：\`python script.py --help\`会打印所有参数说明，不用自己写。

> **工作场景**：
> - 数据处理脚本：传输入文件、输出路径、日期范围
> - 服务启动脚本：传端口、配置文件路径、环境
> - 批处理工具：传--dry-run预览不实际执行、--verbose详细输出
> - 运维脚本：传--host主机、--user用户、--password密码（注意密码别写命令行历史里）

> **⚠️ 坑点**：
> - 参数名不要和Python关键字冲突，比如--import不行，可以用--import-file
> - type=int转换失败会自动报错退出，不用自己处理
> - store_true的参数不要设default=True/False，不传就是False，传了就是True
> - 位置参数是按顺序解析的，顺序很重要
> - 密码等敏感参数不要直接传（会留在shell历史），用环境变量或交互式输入
`,
    code: `"""
argparse命令行参数解析实战
工作场景：脚本参数、批处理工具、可配置服务脚本
"""
import argparse
import sys


def demo_positional_args():
    """位置参数"""
    print("=" * 60)
    print("1. 位置参数（必填，按顺序传）")
    print("=" * 60)

    # 位置参数：就像cp src dst那样，不需要前缀
    # 工作场景：文件处理脚本必须传输入文件路径

    parser = argparse.ArgumentParser(description="位置参数演示")
    parser.add_argument("input", help="输入文件路径")
    parser.add_argument("output", help="输出文件路径")

    # 模拟命令行参数（实际使用时从sys.argv获取）
    test_args = ["input.txt", "output.txt"]
    args = parser.parse_args(test_args)

    print(f"解析结果:")
    print(f"  input = {args.input}")
    print(f"  output = {args.output}")
    print(f"\\n实际运行方式: python script.py input.txt output.txt")


def demo_optional_args():
    """可选参数"""
    print("\\n" + "=" * 60)
    print("2. 可选参数（--开头，有默认值）")
    print("=" * 60)

    parser = argparse.ArgumentParser(description="可选参数演示")

    # --长选项，-短选项
    # default设置默认值
    # type自动类型转换（传进来都是字符串，设type=int会自动转int）
    parser.add_argument("--host", default="localhost", help="服务器地址")
    parser.add_argument("--port", "-p", type=int, default=8080, help="端口号")
    parser.add_argument("--workers", "-w", type=int, default=4, help="工作进程数")

    # 不传参数用默认值
    args1 = parser.parse_args([])
    print(f"不传参数（用默认值）:")
    print(f"  host={args1.host}, port={args1.port}, workers={args1.workers}")

    # 传部分参数
    args2 = parser.parse_args(["--host", "0.0.0.0", "-p", "9000"])
    print(f"\\n传--host和-p:")
    print(f"  host={args2.host}, port={args2.port}, workers={args2.workers}")

    print(f"\\n运行方式示例:")
    print(f"  python script.py --host 0.0.0.0 --port 9000")
    print(f"  python script.py -p 8000 -w 8")


def demo_flag_args():
    """开关参数（store_true/store_false）"""
    print("\\n" + "=" * 60)
    print("3. 开关参数（布尔flag）")
    print("=" * 60)

    parser = argparse.ArgumentParser(description="开关参数演示")

    # action="store_true"：传了这个参数就是True，没传就是False
    # 工作场景：--verbose详细输出、--dry-run试运行、--debug调试模式
    parser.add_argument("--verbose", "-v", action="store_true", help="详细输出")
    parser.add_argument("--dry-run", action="store_true", help="试运行，不实际执行")
    parser.add_argument("--debug", action="store_true", help="调试模式")

    # 不传开关
    args1 = parser.parse_args([])
    print(f"不传开关:")
    print(f"  verbose={args1.verbose}, dry_run={args1.dry_run}, debug={args1.debug}")

    # 传开关
    args2 = parser.parse_args(["-v", "--dry-run"])
    print(f"\\n传 -v --dry-run:")
    print(f"  verbose={args2.verbose}, dry_run={args2.dry_run}, debug={args2.debug}")

    # 注意：参数名中的-会自动转换成_（因为Python标识符不能有-）
    # 所以--dry-run 对应 args.dry_run
    print(f"\\n注意：--dry-run 访问时是 args.dry_run（-变成_）")


def demo_count_action():
    """count计数参数（-v/-vv/-vvv级别控制）"""
    print("\\n" + "=" * 60)
    print("4. count 计数参数（控制详细级别）")
    print("=" * 60)

    parser = argparse.ArgumentParser(description="计数参数演示")

    # action="count"：参数出现的次数
    # 经典用法：-v显示INFO，-vv显示DEBUG（很多Linux命令行工具都这样）
    parser.add_argument("-v", "--verbose", action="count", default=0, help="详细级别")

    args0 = parser.parse_args([])
    args1 = parser.parse_args(["-v"])
    args2 = parser.parse_args(["-vv"])
    args3 = parser.parse_args(["-vvv"])

    print(f"不传-v: verbose={args0.verbose} → WARNING级别")
    print(f"-v:      verbose={args1.verbose} → INFO级别")
    print(f"-vv:     verbose={args2.verbose} → DEBUG级别")
    print(f"-vvv:    verbose={args3.verbose} → TRACE级别")

    def get_log_level(v_count):
        if v_count >= 3:
            return "TRACE"
        elif v_count >= 2:
            return "DEBUG"
        elif v_count >= 1:
            return "INFO"
        else:
            return "WARNING"

    print(f"\\n实际使用: python script.py -vv  # 开启DEBUG级别日志")


def demo_choices():
    """choices限制可选值"""
    print("\\n" + "=" * 60)
    print("5. choices 限制参数可选值")
    print("=" * 60)

    parser = argparse.ArgumentParser(description="choices演示")

    # choices限制参数只能是指定的值
    # 传错了会自动报错退出，不用自己校验
    parser.add_argument("--env", choices=["dev", "test", "prod"], default="dev", help="运行环境")
    parser.add_argument("--level", type=int, choices=[1, 2, 3], default=1, help="日志级别")

    # 正确用法
    args1 = parser.parse_args(["--env", "prod"])
    print(f"--env prod: env={args1.env}")

    args2 = parser.parse_args(["--level", "2"])
    print(f"--level 2: level={args2.level}")

    print("\\n如果传入不在choices中的值，argparse会自动报错并退出：")
    print("  error: argument --env: invalid choice: 'staging' (choose from 'dev', 'test', 'prod')")
    print("  → 不用自己写参数校验代码，argparse帮你做了！")


def demo_required_optional():
    """required可选参数设为必填"""
    print("\\n" + "=" * 60)
    print("6. required：可选参数也可以必填")
    print("=" * 60)

    parser = argparse.ArgumentParser(description="required演示")
    parser.add_argument("--config", "-c", required=True, help="配置文件路径（必填）")

    print("虽然--config是可选参数（--开头），但加了required=True就必须传：")
    print("  不传会报错：error: the following arguments are required: --config/-c")

    args = parser.parse_args(["-c", "config.yaml"])
    print(f"\\n传了-c config.yaml: config={args.config}")


def demo_mixed_args():
    """混合使用各种参数类型"""
    print("\\n" + "=" * 60)
    print("7. 实战：数据导入脚本（混合参数）")
    print("=" * 60)

    # 一个真实的数据导入脚本参数设计
    parser = argparse.ArgumentParser(
        description="用户数据导入脚本",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
使用示例:
  python import.py users.csv                        # 导入users.csv
  python import.py users.csv -o result.log          # 指定日志文件
  python import.py users.csv --env prod -v          # 生产环境+详细输出
  python import.py users.csv --dry-run              # 试运行不写入
  python import.py users.csv --batch-size 1000 -vv  # 每批1000条+调试日志
        """
    )

    # 位置参数：输入文件
    parser.add_argument("input_file", help="要导入的CSV文件路径")

    # 可选参数
    parser.add_argument("--output", "-o", default="import.log", help="日志输出文件")
    parser.add_argument("--env", choices=["dev", "test", "prod"], default="dev", help="运行环境")
    parser.add_argument("--batch-size", type=int, default=500, help="每批处理条数")
    parser.add_argument("--encoding", default="utf-8", help="文件编码")

    # 开关
    parser.add_argument("--dry-run", action="store_true", help="试运行不写入数据库")
    parser.add_argument("-v", "--verbose", action="count", default=0, help="详细程度")

    # 模拟不同的命令行调用
    test_cases = [
        ["users.csv"],
        ["users.csv", "-o", "result.log", "-v"],
        ["data.csv", "--env", "prod", "--dry-run", "-vv"],
    ]

    for i, cmd_args in enumerate(test_cases, 1):
        print(f"\\n  用法{i}: python import.py {' '.join(cmd_args)}")
        args = parser.parse_args(cmd_args)
        print(f"    input: {args.input_file}, env: {args.env}, dry_run: {args.dry_run}")
        print(f"    batch_size: {args.batch_size}, verbose: {args.verbose}")


def demo_help_generation():
    """自动生成help"""
    print("\\n" + "=" * 60)
    print("8. 自动生成 --help 帮助信息")
    print("=" * 60)

    print("argparse自动生成--help，你只要写好help参数就行：")
    print("-" * 60)
    print("""
$ python import.py --help

usage: import.py [-h] [--output OUTPUT] [--env {dev,test,prod}]
                 [--batch-size BATCH_SIZE] [--encoding ENCODING]
                 [--dry-run] [-v] input_file

用户数据导入脚本

positional arguments:
  input_file            要导入的CSV文件路径

optional arguments:
  -h, --help            show this help message and exit
  --output OUTPUT, -o OUTPUT
                        日志输出文件
  --env {dev,test,prod}
                        运行环境
  --batch-size BATCH_SIZE
                        每批处理条数
  --encoding ENCODING   文件编码
  --dry-run             试运行不写入数据库
  -v, --verbose         详细程度

使用示例:
  python import.py users.csv
  python import.py users.csv -o result.log
  python import.py users.csv --env prod -v
    """)
    print("-" * 60)
    print("→ 不用自己写帮助文档，argparse自动生成，保持和代码一致")


def demo_practical_script():
    """完整实战：文件处理脚本骨架"""
    print("\\n" + "=" * 60)
    print("9. 完整实战：文件批处理脚本")
    print("=" * 60)

    print("一个完整的脚本应该这样组织：")
    print("""
import argparse
import logging
import sys

def main():
    parser = argparse.ArgumentParser(description="文件批处理工具")
    parser.add_argument("path", help="文件或目录路径")
    parser.add_argument("--pattern", default="*.txt", help="文件匹配模式")
    parser.add_argument("--output", "-o", help="输出文件")
    parser.add_argument("--dry-run", action="store_true", help="试运行")
    parser.add_argument("-v", "--verbose", action="count", default=0)
    args = parser.parse_args()

    # 配置日志
    log_level = logging.WARNING
    if args.verbose == 1:
        log_level = logging.INFO
    elif args.verbose >= 2:
        log_level = logging.DEBUG
    logging.basicConfig(level=log_level, format="%(levelname)s: %(message)s")
    logger = logging.getLogger(__name__)

    logger.debug(f"参数: {args}")
    logger.info(f"开始处理: {args.path}")

    if args.dry_run:
        logger.info("试运行模式，不会实际修改文件")

    # 实际逻辑...
    print(f"处理 {args.path}，模式 {args.pattern}")

if __name__ == "__main__":
    main()
""")


def main():
    demo_positional_args()
    demo_optional_args()
    demo_flag_args()
    demo_count_action()
    demo_choices()
    demo_required_optional()
    demo_mixed_args()
    demo_help_generation()
    demo_practical_script()


if __name__ == "__main__":
    main()
`
  },
  {
    id: 'py-itertools',
    group: '第五篇：常用标准库 · 开箱即用的利器',
    icon: '🔄',
    title: 'itertools迭代器工具',
    content: `# itertools迭代器工具

itertools是Python内置的迭代器工具集，提供了很多高效的迭代器函数，用来操作可迭代对象（列表、生成器等）。特点是**惰性求值**、**省内存**，特别适合处理大数据。

## 常用函数分类

### 无限迭代器
| 函数 | 用途 |
|------|------|
| \`count(start=0, step=1)\` | 无限计数：0,1,2,3... |
| \`cycle(iterable)\` | 无限循环：a,b,c,a,b,c... |
| \`repeat(elem, n)\` | 重复n次（或无限次） |

### 迭代器操作
| 函数 | 用途 |
|------|------|
| \`chain(*iterables)\` | 串联多个可迭代对象 |
| \`islice(iterable, start, stop)\` | 切片迭代器（不用转list） |
| \`zip_longest(*iterables)\` | 最长zip（按最长的对齐） |

### 排列组合
| 函数 | 用途 |
|------|------|
| \`product(*iterables, repeat=n)\` | 笛卡尔积（n个所有组合） |
| \`permutations(iterable, r)\` | 排列（有顺序） |
| \`combinations(iterable, r)\` | 组合（无顺序） |

### 分组
| 函数 | 用途 |
|------|------|
| \`groupby(iterable, key)\` | 分组（需要先排序！） |

\`\`\`python
import itertools

# chain：把多个列表串起来，不用合并（省内存）
for item in itertools.chain([1,2], [3,4], [5]):
    print(item)  # 1,2,3,4,5

# islice：对生成器/大文件切片，不用读全部内容
# 比如读取大文件前100行
with open("big.log") as f:
    for line in itertools.islice(f, 100):
        print(line)

# product：笛卡尔积（密码爆破所有组合）
for pwd in itertools.product("abc", repeat=3):
    print(''.join(pwd))  # aaa, aab, aac, aba...

# groupby：分组统计（注意：必须先按key排序！）
data = sorted(data, key=lambda x: x["category"])
for key, group in itertools.groupby(data, key=lambda x: x["category"]):
    print(key, list(group))
\`\`\`

> **工作场景**：
> - chain串联多个数据源（多个文件、多个查询结果）
> - islice处理大文件/大数据流，不用全部加载到内存
> - product/permutations/combinations排列组合计算（测试用例、抽奖组合）
> - groupby分组聚合统计（按类别分组统计）
> - zip_longest处理不等长列表对齐

> **⚠️ 坑点**：
> - groupby使用前**必须先按分组key排序**，否则相同key不会分到一组！这是最常见的坑
> - 迭代器是一次性的，遍历完就空了，不能重复遍历
> - itertools返回的都是迭代器，要看到内容需要转list或遍历
> - count/cycle/repeat是无限的，一定要有终止条件，否则死循环
`,
    code: `"""
itertools迭代器工具实战
工作场景：大数据迭代、排列组合、分组统计、串联多个数据源
"""
import itertools
import operator


def demo_infinite_iterators():
    """无限迭代器：count/cycle/repeat"""
    print("=" * 60)
    print("1. 无限迭代器")
    print("=" * 60)

    # count(start, step) - 无限计数
    # 工作场景：生成自增ID（配合zip给数据编号）
    print("count(start=1, step=2) 取前5个:")
    for i in itertools.islice(itertools.count(1, 2), 5):
        print(f"  {i}", end=" ")
    print(" (1,3,5,7,9...)")

    # 工作场景：给列表元素加序号（比enumerate更灵活，可以自定义起始和步长）
    names = ["张三", "李四", "王五"]
    numbered = list(zip(itertools.count(1001, 1), names))
    print(f"\\ncount给用户编号: {numbered}")

    # cycle(iterable) - 无限循环
    # 工作场景：轮询分配任务给多个worker（负载均衡简易版）
    print("\\ncycle(['A','B','C']) 分配10个任务:")
    workers = itertools.cycle(["A", "B", "C"])
    for task_id in range(1, 11):
        worker = next(workers)
        print(f"  任务{task_id} → worker {worker}")

    # repeat(elem, times) - 重复元素
    # times可以不传，就是无限重复
    print("\\nrepeat('hello', 3):", list(itertools.repeat("hello", 3)))

    # 工作场景：map时传固定参数
    # 比如对多个数字都平方（pow第二个参数固定为2）
    squares = list(map(pow, range(1, 6), itertools.repeat(2)))
    print(f"用repeat生成平方数: {squares}")


def demo_chain():
    """chain串联多个可迭代对象"""
    print("\\n" + "=" * 60)
    print("2. chain 串联多个可迭代对象")
    print("=" * 60)

    # 为什么用chain而不是a + b？
    # a + b会创建新列表，大数据时占内存；chain是惰性迭代，不占额外内存
    list1 = [1, 2, 3]
    list2 = [4, 5]
    list3 = [6]

    # chain把多个可迭代对象串起来，逐个遍历
    print(f"list1={list1}, list2={list2}, list3={list3}")
    result = list(itertools.chain(list1, list2, list3))
    print(f"chain结果: {result}")

    # 工作场景：遍历多个文件的所有行
    # 不用把所有文件读进内存，一个一个读一个一个处理
    print("\\n工作场景：遍历多个文件（示例）:")
    print("""
import itertools
files = ["log1.txt", "log2.txt", "log3.txt"]
file_handles = [open(f) for f in files]
try:
    for line in itertools.chain.from_iterable(file_handles):
        process(line)  # 处理每一行，内存里只有一行
finally:
    for f in file_handles:
        f.close()
""")

    # chain.from_iterable：如果已经有一个包含多个可迭代对象的列表
    nested = [[1,2], [3,4], [5,6]]
    flattened = list(itertools.chain.from_iterable(nested))
    print(f"chain.from_iterable展平: {nested} → {flattened}")


def demo_islice():
    """islice迭代器切片"""
    print("\\n" + "=" * 60)
    print("3. islice 迭代器切片（省内存）")
    print("=" * 60)

    # 为什么不用list切片？比如 list[100:200] 会把整个列表加载到内存
    # islice对迭代器/生成器/文件对象切片，惰性计算，不占内存

    # 场景：读取大文件前N行，不用把整个文件读进来
    print("场景1：读取大文件前10行（不用读整个文件）:")
    print("""
with open("huge_file.log") as f:
    # islice(f, 10) 就取前10行，文件再大也不怕
    for line in itertools.islice(f, 10):
        print(line.strip())
""")

    # 场景2：对无限迭代器取前N个
    print("场景2：无限计数器取前5个偶数:")
    evens = itertools.count(0, 2)
    first_5_evens = list(itertools.islice(evens, 5))
    print(f"  {first_5_evens}")

    # islice也可以指定start和stop（和列表切片类似）
    print("\\n场景3：取第2到第6个元素（索引2到5）:")
    data = range(100)  # 想象成一个很大的range
    sliced = list(itertools.islice(data, 2, 7))
    print(f"  islice(range(100), 2, 7) → {sliced}")

    # step参数：每隔几个取一个
    stepped = list(itertools.islice(range(20), 0, 15, 3))
    print(f"  islice(range(20), 0, 15, 3) → {stepped}")


def demo_zip_longest():
    """zip_longest 最长对齐"""
    print("\\n" + "=" * 60)
    print("4. zip_longest 按最长序列对齐")
    print("=" * 60)

    # 内置zip按最短的截断，zip_longest按最长的对齐，缺省填fillvalue
    a = [1, 2, 3]
    b = ["a", "b", "c", "d", "e"]

    print(f"a={a}, b={b}")

    # 普通zip按短的来
    zipped = list(zip(a, b))
    print(f"\\nzip(a, b) 按最短截断: {zipped}")

    # zip_longest按长的来，缺的填None（或自定义fillvalue）
    longest = list(itertools.zip_longest(a, b))
    print(f"zip_longest(a, b): {longest}")

    longest_filled = list(itertools.zip_longest(a, b, fillvalue="N/A"))
    print(f"zip_longest(fillvalue='N/A'): {longest_filled}")


def demo_product():
    """product笛卡尔积"""
    print("\\n" + "=" * 60)
    print("5. product 笛卡尔积（所有组合）")
    print("=" * 60)

    # product(*iterables) 生成笛卡尔积，即所有可能的组合
    # 工作场景：
    # 1. 生成测试用例的所有参数组合
    # 2. 密码暴力破解
    # 3. 多维度选项组合

    colors = ["红", "蓝"]
    sizes = ["S", "M", "L"]

    print(f"colors={colors}, sizes={sizes}")
    print(f"product(colors, sizes) 所有颜色尺寸组合:")
    for combo in itertools.product(colors, sizes):
        print(f"  {combo}")

    # repeat参数：自身repeat次的笛卡尔积
    print(f"\\nproduct('ab', repeat=3) 3位ab的所有组合:")
    for p in itertools.product("ab", repeat=3):
        print(f"  {''.join(p)}", end=" ")
    print()

    print(f"\\n共 {2**3} = 8 种组合（repeat=3）")


def demo_permutations_combinations():
    """排列组合"""
    print("\\n" + "=" * 60)
    print("6. permutations排列 / combinations组合")
    print("=" * 60)

    # permutations(p, r) 排列：有顺序 (A,B)≠(B,A)
    # combinations(p, r) 组合：无顺序 {A,B}={B,A}

    people = ["甲", "乙", "丙"]
    print(f"3个人: {people}")

    # 排列：选2个人排队（顺序不同算不同）
    print(f"\\npermutations(3人, 2) 排队（有顺序）:")
    for p in itertools.permutations(people, 2):
        print(f"  {p[0]}站前面，{p[1]}站后面")
    print(f"  共 3×2=6 种")

    # 组合：选2个人搭档（顺序无关）
    print(f"\\ncombinations(3人, 2) 组队（无顺序）:")
    for c in itertools.combinations(people, 2):
        print(f"  {c[0]}和{c[1]}一组")
    print(f"  共 3 种（甲乙=乙甲，不重复算）")

    # combinations_with_replacement：可重复组合
    print(f"\\ncombinations_with_replacement(可重复选自己):")
    for c in itertools.combinations_with_replacement([1, 2, 3], 2):
        print(f"  {c}", end=" ")
    print()


def demo_groupby():
    """groupby分组"""
    print("\\n" + "=" * 60)
    print("7. groupby 分组（⚠️必须先排序！）")
    print("=" * 60)

    # ⚠️ 超级大坑：groupby只对连续相同的key分组！
    # 所以必须先按key排序，否则相同key不会分到一组！

    # 模拟数据：按城市分组统计用户
    users = [
        {"name": "张三", "city": "北京"},
        {"name": "李四", "city": "上海"},
        {"name": "王五", "city": "北京"},
        {"name": "赵六", "city": "广州"},
        {"name": "钱七", "city": "上海"},
        {"name": "孙八", "city": "北京"},
    ]

    print("原始数据:")
    for u in users:
        print(f"  {u['name']} - {u['city']}")

    # ❌ 错误写法：不排序直接groupby，相同city不会分到一组
    print("\\n❌ 不排序直接groupby（错误！同城市分散）:")
    for key, group in itertools.groupby(users, key=lambda x: x["city"]):
        names = [u["name"] for u in group]
        print(f"  {key}: {names}")

    # ✅ 正确写法：先按city排序，再groupby
    users_sorted = sorted(users, key=lambda x: x["city"])
    print("\\n✅ 先排序再groupby（正确分组）:")
    for key, group in itertools.groupby(users_sorted, key=lambda x: x["city"]):
        names = [u["name"] for u in group]
        print(f"  {key}: {names}")

    print("\\n⚠️ 记住：groupby前一定要先sort！这是最多人踩的坑！")

    # 实战：分组统计数量
    print("\\n按城市统计人数:")
    for key, group in itertools.groupby(users_sorted, key=lambda x: x["city"]):
        count = len(list(group))
        print(f"  {key}: {count}人")


def demo_practical_examples():
    """实际工作场景"""
    print("\\n" + "=" * 60)
    print("8. 工作场景实战")
    print("=" * 60)

    # 场景1：批量分页处理数据
    print("场景1：批量处理（每次100条）")
    def chunked(iterable, size):
        """把迭代器按size分组"""
        it = iter(iterable)
        while True:
            chunk = list(itertools.islice(it, size))
            if not chunk:
                break
            yield chunk

    all_ids = range(1, 25)  # 模拟24个ID
    for batch_num, batch in enumerate(chunked(all_ids, 10), 1):
        print(f"  第{batch_num}批: {batch}")

    # 场景2：累计算法（accumulate）
    print("\\n场景2：accumulate 累加/累积计算")
    sales = [100, 200, 150, 300]
    cumulative = list(itertools.accumulate(sales))
    print(f"  每日销量: {sales}")
    print(f"  累计销量: {cumulative}")  # 100, 300, 450, 750

    # 场景3：多列表同时遍历，按最长的来
    print("\\n场景3：表头和数据对齐（数据可能比表头少）")
    headers = ["ID", "姓名", "年龄", "城市", "电话"]
    row_data = [1, "张三", 25]
    for h, v in itertools.zip_longest(headers, row_data, fillvalue="-"):
        print(f"  {h}: {v}")


def main():
    demo_infinite_iterators()
    demo_chain()
    demo_islice()
    demo_zip_longest()
    demo_product()
    demo_permutations_combinations()
    demo_groupby()
    demo_practical_examples()


if __name__ == "__main__":
    main()
`
  },
  {
    id: 'py-threading',
    group: '第五篇：常用标准库 · 开箱即用的利器',
    icon: '🧵',
    title: 'threading多线程与并发基础',
    content: `# threading多线程与并发基础

工作中经常需要并发处理：同时请求10个接口、批量下载文件、并行处理IO任务。threading是Python多线程标准库，对于IO密集型任务（网络请求、文件读写、数据库查询），多线程能大幅提升效率。

## ⚠️ GIL全局解释器锁

先说最重要的：Python有GIL锁，**同一时刻只有一个线程执行Python字节码**。

- **CPU密集型**（大量计算、视频编码）：多线程没用，用多进程multiprocessing
- **IO密集型**（网络请求、文件读写、数据库）：多线程很有效！线程等IO时GIL会释放
- **最新选择**：异步asyncio在IO密集型场景比多线程更好，但学习曲线陡

## 基础用法

\`\`\`python
import threading
import time

def worker(name):
    print(f"线程{name}开始")
    time.sleep(1)  # 模拟IO
    print(f"线程{name}结束")

# 创建线程
t1 = threading.Thread(target=worker, args=("A",))
t2 = threading.Thread(target=worker, args=("B",))

# 启动线程
t1.start()
t2.start()

# 等待线程结束
t1.join()
t2.join()
print("全部完成")
\`\`\`

## 线程安全与Lock

多线程共享变量时会有**竞态条件**（race condition），必须加锁：

\`\`\`python
lock = threading.Lock()
counter = 0

def increment():
    global counter
    for _ in range(100000):
        with lock:  # 加锁，保证同一时间只有一个线程修改counter
            counter += 1
\`\`\`

## 线程池ThreadPoolExecutor（推荐！）

工作中不要手动管理线程，用concurrent.futures.ThreadPoolExecutor：

\`\`\`python
from concurrent.futures import ThreadPoolExecutor, as_completed

def fetch_url(url):
    # 模拟请求
    time.sleep(0.5)
    return f"{url} 内容"

urls = ["url1", "url2", "url3", "url4", "url5"]

# 创建线程池（max_workers是线程数）
with ThreadPoolExecutor(max_workers=3) as executor:
    # 提交任务
    futures = [executor.submit(fetch_url, url) for url in urls]
    # 获取结果（谁先完成谁先返回）
    for future in as_completed(futures):
        result = future.result()
        print(result)
\`\`\`

> **工作场景**：
> - 并发调用多个HTTP接口（同时查10个API比一个个查快多了）
> - 批量下载/上传文件
> - 并行处理多个独立的IO任务
> - 定时任务配合threading.Timer

> **⚠️ 坑点**：
> - GIL：CPU密集不要用多线程！用多进程
> - 共享变量一定要加Lock，否则数据会乱
> - 不要用全局变量在线程间传数据，用Queue或者future.result()
> - 线程池max_workers不是越大越好：IO密集一般设5-20，太多反而因为切换变慢
> - daemon线程：设daemon=True的线程随主线程退出而退出，不要在daemon线程里做重要操作
> - 一定记得join()或者用with ThreadPoolExecutor，否则主线程退出时线程可能没执行完
`,
    code: `"""
threading多线程与并发基础
工作场景：并发请求接口、批量IO任务处理
注意：CPU密集用多进程，IO密集用多线程/asyncio
"""
import threading
import time
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed, wait
from queue import Queue
import random


def demo_basic_thread():
    """基础线程创建"""
    print("=" * 60)
    print("1. 基础线程创建")
    print("=" * 60)

    def say_hello(name, delay):
        """线程执行的函数"""
        print(f"  [{name}] 开始，等待{delay}秒...")
        time.sleep(delay)  # 模拟IO操作（网络请求/数据库查询）
        print(f"  [{name}] 完成")

    start = time.time()

    # 串行执行：一个一个来
    print("串行执行（一个一个来）:")
    serial_start = time.time()
    say_hello("A", 0.5)
    say_hello("B", 0.5)
    say_hello("C", 0.5)
    serial_time = time.time() - serial_start
    print(f"  串行耗时: {serial_time:.2f}秒")

    # 并发执行：三个线程同时
    print("\\n并发执行（三个线程同时）:")
    thread_start = time.time()
    t1 = threading.Thread(target=say_hello, args=("A", 0.5))
    t2 = threading.Thread(target=say_hello, args=("B", 0.5))
    t3 = threading.Thread(target=say_hello, args=("C", 0.5))

    t1.start()
    t2.start()
    t3.start()

    # join()等待线程完成
    t1.join()
    t2.join()
    t3.join()

    thread_time = time.time() - thread_start
    print(f"  并发耗时: {thread_time:.2f}秒")
    print(f"  速度提升: {serial_time/thread_time:.1f}倍")
    print(f"\\n→ IO等待时间越多，多线程提速越明显")


def demo_gil_explain():
    """GIL说明"""
    print("\\n" + "=" * 60)
    print("2. GIL全局解释器锁（重点理解！）")
    print("=" * 60)

    print("""
GIL是什么？
  CPython有一个全局锁（GIL），同一时刻只有一个线程执行Python代码。
  这意味着：多线程不能利用多核CPU做并行计算！

什么时候用多线程？什么时候用多进程？

  ┌─────────────────┬─────────────────┬─────────────────┐
  │  任务类型       │  用什么         │  原因           │
  ├─────────────────┼─────────────────┼─────────────────┤
  │  IO密集型       │  多线程/asyncio │  等IO时GIL释放  │
  │  (网络/文件/DB) │                 │  线程切换开销小  │
  ├─────────────────┼─────────────────┼─────────────────┤
  │  CPU密集型      │  多进程         │  每个进程有GIL  │
  │  (计算/编码)    │  multiprocessing│  真正并行        │
  └─────────────────┴─────────────────┴─────────────────┘

IO密集型例子（多线程有效）：
  - 同时调用多个HTTP API
  - 批量下载图片/文件
  - 并发读写多个数据库
  - 同时等待多个用户输入

CPU密集型例子（多线程没用）：
  - 大量数学计算（素数计算、矩阵运算）
  - 视频/图片编码压缩
  - 数据加密解密
  - 这些要用multiprocessing多进程
""")


def demo_thread_safety_lock():
    """线程安全与Lock锁"""
    print("\\n" + "=" * 60)
    print("3. 线程安全问题与Lock锁")
    print("=" * 60)

    # 问题：多线程同时修改共享变量会出错！
    # 因为counter += 1不是原子操作，分为：读取、+1、写回三步
    # 多个线程交叉执行，结果会不对

    # 不加锁：结果错误
    counter_no_lock = 0
    iterations = 100000

    def add_no_lock():
        nonlocal counter_no_lock
        for _ in range(iterations):
            counter_no_lock += 1  # 危险！多线程同时改会错

    threads = [threading.Thread(target=add_no_lock) for _ in range(5)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    expected = iterations * 5
    print(f"不加锁: 结果={counter_no_lock}, 预期={expected}")
    print(f"  → 少了 {expected - counter_no_lock} 个！这就是竞态条件")

    # 加锁：结果正确
    counter_with_lock = 0
    lock = threading.Lock()

    def add_with_lock():
        nonlocal counter_with_lock
        for _ in range(iterations):
            with lock:  # with语句自动获取和释放锁
                counter_with_lock += 1

    threads = [threading.Thread(target=add_with_lock) for _ in range(5)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    print(f"加锁:   结果={counter_with_lock}, 预期={expected}")
    print(f"  → 正确！加锁保证同一时间只有一个线程修改")

    print("""
Lock使用原则：
  1. 共享变量一定要加锁访问
  2. 用with lock:语法，自动释放，不会死锁
  3. 锁的粒度要小：只包住必须的操作，不要包住整个函数
  4. 避免死锁：多个锁要按固定顺序获取
""")


def demo_daemon_thread():
    """daemon守护线程"""
    print("\\n" + "=" * 60)
    print("4. daemon守护线程")
    print("=" * 60)

    # daemon线程：主线程退出时，daemon线程自动退出
    # 非daemon线程：主线程会等它们执行完才退出

    def background_task():
        print("  后台任务开始")
        time.sleep(10)  # 模拟长时间后台任务
        print("  后台任务结束（这行可能打印不出来）")

    # daemon=True: 主线程结束这个线程就被强制终止
    t = threading.Thread(target=background_task, daemon=True)
    t.start()

    time.sleep(0.3)
    print("  主线程准备退出，daemon线程会被自动终止")
    print("  → 守护线程适合做日志、心跳等不重要的后台任务")
    print("  → 重要任务不要用daemon=True，否则程序退出时任务会被中断！")


def demo_thread_pool():
    """ThreadPoolExecutor线程池（推荐用法！）"""
    print("\\n" + "=" * 60)
    print("5. ThreadPoolExecutor 线程池（工作推荐！）")
    print("=" * 60)

    # 工作中不要手动创建一堆Thread，用线程池！
    # 好处：
    # 1. 不用手动管理线程生命周期
    # 2. 控制最大并发数
    # 3. 方便获取返回值
    # 4. 异常处理更简单

    def fetch_website(url):
        """模拟请求URL（IO操作）"""
        delay = random.uniform(0.2, 0.8)
        time.sleep(delay)
        return f"{url}: 耗时{delay:.2f}秒"

    urls = [f"https://example.com/page{i}" for i in range(1, 11)]

    start = time.time()

    # max_workers：线程池大小（并发数）
    # IO密集型一般设 5-20，太多了切换开销大
    with ThreadPoolExecutor(max_workers=5) as executor:
        # 方法1: submit + as_completed（谁先完成谁先处理）
        print("提交10个任务，并发数=5:")
        futures = {executor.submit(fetch_website, url): url for url in urls}

        for future in as_completed(futures):
            result = future.result()
            print(f"  ✓ {result}")

    elapsed = time.time() - start
    print(f"总耗时: {elapsed:.2f}秒")
    print("→ 串行要约5秒，5并发约1秒左右")

    # 方法2: map（按顺序返回结果）
    print("\\nexecutor.map按提交顺序返回结果:")
    with ThreadPoolExecutor(max_workers=3) as executor:
        results = executor.map(fetch_website, urls[:5])
        for result in results:
            print(f"  ✓ {result}")


def demo_exception_handling():
    """线程池异常处理"""
    print("\\n" + "=" * 60)
    print("6. 线程池异常处理")
    print("=" * 60)

    def risky_task(n):
        if n == 3:
            raise ValueError(f"任务{n}出错了！")
        time.sleep(0.2)
        return f"任务{n}成功"

    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = [executor.submit(risky_task, i) for i in range(5)]

        for i, future in enumerate(futures):
            try:
                result = future.result()
                print(f"  {result}")
            except Exception as e:
                print(f"  ✗ 任务{i}异常: {e}")

    print("\\n→ future.result()会重新抛出线程里的异常，用try-except捕获")


def demo_queue_thread_communication():
    """Queue线程间通信"""
    print("\\n" + "=" * 60)
    print("7. Queue 线程安全队列（线程间通信）")
    print("=" * 60)

    # 线程间通信用queue.Queue，它是线程安全的
    # 不要用全局变量+锁，Queue已经帮你处理好了

    def producer(queue, items):
        """生产者：往队列放数据"""
        for item in items:
            print(f"  生产: {item}")
            queue.put(item)
            time.sleep(0.1)
        # 放None表示结束
        queue.put(None)

    def consumer(queue):
        """消费者：从队列取数据处理"""
        while True:
            item = queue.get()
            if item is None:
                break
            print(f"    消费: {item}")
            time.sleep(0.2)

    q = Queue()
    data = [f"任务{i}" for i in range(1, 6)]

    t_producer = threading.Thread(target=producer, args=(q, data))
    t_consumer = threading.Thread(target=consumer, args=(q,))

    t_producer.start()
    t_consumer.start()

    t_producer.join()
    t_consumer.join()

    print("→ Queue是线程安全的，不用自己加锁")


def demo_concurrent_requests():
    """实战：并发请求多个API"""
    print("\\n" + "=" * 60)
    print("8. 实战：并发调用多个API（最常用场景）")
    print("=" * 60)

    print("""
# 实际工作中最常用的模式：并发调用多个接口

import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

def get_user_info(user_id):
    \"\"\"获取单个用户信息\"\"\"
    # 实际项目中是 requests.get(f"https://api.example.com/users/{user_id}")
    time.sleep(random.uniform(0.1, 0.3))
    return {"id": user_id, "name": f"用户{user_id}"}

user_ids = list(range(1, 21))  # 要获取20个用户

# 串行方式（慢）
start = time.time()
results_serial = []
for uid in user_ids:
    results_serial.append(get_user_info(uid))
print(f"串行获取20个用户: {time.time()-start:.2f}秒")

# 并发方式（快）
start = time.time()
results = []
with ThreadPoolExecutor(max_workers=10) as executor:
    future_to_uid = {
        executor.submit(get_user_info, uid): uid
        for uid in user_ids
    }
    for future in as_completed(future_to_uid):
        uid = future_to_uid[future]
        try:
            user = future.result()
            results.append(user)
        except Exception as e:
            print(f"获取用户{uid}失败: {e}")
print(f"并发获取20个用户: {time.time()-start:.2f}秒")
print(f"获取到{len(results)}个用户信息")
""")

    # 模拟演示
    def mock_api(n):
        time.sleep(random.uniform(0.05, 0.15))
        return f"数据{n}"

    ids = list(range(1, 16))

    serial_start = time.time()
    serial_results = [mock_api(i) for i in ids]
    serial_time = time.time() - serial_start

    thread_start = time.time()
    thread_results = []
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(mock_api, i) for i in ids]
        for f in as_completed(futures):
            thread_results.append(f.result())
    thread_time = time.time() - thread_start

    print(f"模拟演示（16个请求）:")
    print(f"  串行: {serial_time:.2f}秒")
    print(f"  8并发: {thread_time:.2f}秒")
    print(f"  提升: {serial_time/thread_time:.1f}倍")


def demo_best_practices():
    """最佳实践总结"""
    print("\\n" + "=" * 60)
    print("9. 多线程最佳实践")
    print("=" * 60)

    print("""
✅ 推荐做法：

1. 优先用ThreadPoolExecutor，不要手动管理Thread
2. max_workers合理设置：IO密集5-20，不是越大越好
3. 共享数据用Queue，不要用全局变量+锁（容易出错）
4. 用with ThreadPoolExecutor()自动管理资源
5. future.result()加try-except处理异常
6. 线程函数不要太大，职责单一
7. IO密集用多线程/asyncio，CPU密集用多进程

❌ 避免的坑：

1. 不要在多线程里不加锁修改共享变量！
2. 不要在daemon线程里做重要操作（写数据库、发消息）
3. max_workers不要设成100+，线程切换有开销
4. 不要忘记join()或者用with，否则主线程退出时任务没做完
5. 不要用多线程做CPU密集计算（GIL的锅，用多进程）
6. 不要在线程里直接print太多（多线程print可能乱序）
7. 不要嵌套获取锁（容易死锁）
""")


def main():
    demo_basic_thread()
    demo_gil_explain()
    demo_thread_safety_lock()
    demo_daemon_thread()
    demo_thread_pool()
    demo_exception_handling()
    demo_queue_thread_communication()
    demo_concurrent_requests()
    demo_best_practices()


if __name__ == "__main__":
    main()
`
  }
]

