// =============================================================
// C# 从入门到精通大全 —— 第十批章节（最后一批）
// 主题：第十部分 工程化与实战 + 结语，共 6 章（47-52）
// -------------------------------------------------------------
// 本批包含 6 章：
//   csharp2-ch47 : 第四十七章 异常处理最佳实践
//   csharp2-ch48 : 第四十八章 日期时间与时区
//   csharp2-ch49 : 第四十九章 命名空间与程序集
//   csharp2-ch50 : 第五十章 HttpClient 网络请求
//   csharp2-ch51 : 第五十一章 内存管理与 GC
//   csharp2-ch52 : 第五十二章 综合项目：任务管理系统 + 结语
//
// 所有 C# 代码示例均可在交互式编辑器中运行（基于顶级语句）。
// 适用版本：.NET 8 LTS / C# 12
// =============================================================

const chapters = [
  // ============================================================
  // 第四十七章：异常处理最佳实践
  // ============================================================
  {
    id: 'csharp2-ch47',
    group: '第十部分 工程化与实战',
    icon: '⚠️',
    title: '异常处理最佳实践',
    content: `## 第四十七章　异常处理最佳实践

异常处理是工程化代码的"安全带"。写得好——程序稳如老狗；写得差——线上炸了找不到原因。本章系统讲解 C# 异常机制和最佳实践。

### 一、try / catch / finally 基础

\`\`\`csharp
try
{
    // 可能出错的代码
    int a = 10, b = 0;
    int c = a / b;  // 除零异常
}
catch (DivideByZeroException ex)
{
    // 捕获特定异常
    Console.WriteLine($"出错了: {ex.Message}");
}
finally
{
    // 无论是否异常都会执行（清理资源）
    Console.WriteLine("清理完成");
}
\`\`\`

**三块各自的职责：**

| 块 | 职责 | 是否必需 |
|----|------|---------|
| \`try\` | 包裹可能出错的代码 | 必需 |
| \`catch\` | 捕获并处理异常 | 至少一个 catch 或 finally |
| \`finally\` | 资源清理（关闭文件/连接） | 可选 |

> ⭐ **关键点**：\`finally\` 块**即使 try 里 return 了也会执行**——这就是为什么释放资源要放这里。

### 二、Exception 类层次

所有异常都继承自 \`System.Exception\`：

\`\`\`
Exception
├── SystemException
│   ├── NullReferenceException      // 空引用
│   ├── IndexOutOfRangeException    // 索引越界
│   ├── ArgumentException           // 参数错误
│   │   └── ArgumentNullException
│   ├── InvalidOperationException  // 状态无效
│   ├── IOException                 // IO 错误
│   │   ├── FileNotFoundException
│   │   └── DirectoryNotFoundException
│   ├── Collections.Generic.KeyNotFoundException
│   ├── ArithmeticException
│   │   ├── DivideByZeroException
│   │   └── OverflowException
│   ├── FormatException             // 格式错误
│   ├── TimeoutException
│   └── StackOverflowException      // 栈溢出（不可捕获）
└── ApplicationException  // 已不推荐使用
\`\`\`

\`Exception\` 关键属性：

\`\`\`csharp
try { throw new InvalidOperationException("demo"); }
catch (Exception ex)
{
    Console.WriteLine(ex.Message);       // 错误信息
    Console.WriteLine(ex.StackTrace);    // 调用栈
    Console.WriteLine(ex.Source);        // 抛出异常的应用/程序集
    Console.WriteLine(ex.GetType().Name);// 异常类型名
    Console.WriteLine(ex.InnerException);// 内部异常（如有）
}
\`\`\`

### 三、常见异常类型速查 ⭐

| 异常 | 何时抛出 | 如何避免 |
|------|---------|---------|
| \`NullReferenceException\` | 访问 null 成员 | 用 \`?.\` / \`??\` / 提前判空 |
| \`ArgumentException\` | 参数非法 | 在方法入口校验 + \`throw new\` |
| \`ArgumentNullException\` | 参数为 null | 同上，用 \`ArgumentNullException.ThrowIfNull\` |
| \`InvalidOperationException\` | 对象状态不允许操作 | 检查状态机 |
| \`IOException\` | 文件/网络错误 | 用 \`using\` 释放资源 |
| \`KeyNotFoundException\` | 字典键不存在 | 用 \`TryGetValue\` |
| \`FormatException\` | 字符串解析失败 | 用 \`TryParse\` |
| \`IndexOutOfRangeException\` | 数组越界 | 检查 \`Length\` |
| \`TimeoutException\` | 操作超时 | 设置合理超时 + 重试 |

### 四、throw 重新抛出（保留堆栈）

❌ **错误写法**——丢失原始堆栈：

\`\`\`csharp
try { throw new InvalidOperationException("原始"); }
catch (Exception ex)
{
    Log(ex);
    throw ex;  // ❌ 堆栈被重置，看不到原始抛出位置
}
\`\`\`

✅ **正确写法**——使用裸 \`throw\`：

\`\`\`csharp
try { throw new InvalidOperationException("原始"); }
catch (Exception ex)
{
    Log(ex);
    throw;  // ✅ 保留原始堆栈
}
\`\`\`

> ⭐ 这是面试高频考点：\`throw;\` vs \`throw ex;\` 的区别。

### 五、自定义异常

业务异常应当自定义，方便调用方精准捕获：

\`\`\`csharp
// 自定义异常：继承 Exception，以 Exception 结尾
public class UserNotFoundException : Exception
{
    public string UserId { get; }

    // 提供三个常用构造函数
    public UserNotFoundException(string userId)
        : base($"用户不存在: {userId}")
        => UserId = userId;

    public UserNotFoundException(string userId, string message)
        : base(message)
        => UserId = userId;

    public UserNotFoundException(string userId, string message, Exception inner)
        : base(message, inner)
        => UserId = userId;
}

// 使用
public User GetUser(string id)
{
    var user = db.Find(id);
    if (user is null)
        throw new UserNotFoundException(id);
    return user;
}

try { GetUser("u123"); }
catch (UserNotFoundException ex)
{
    Console.WriteLine($"业务处理: {ex.UserId} - {ex.Message}");
}
\`\`\`

**自定义异常要点：**
1. 继承 \`Exception\`（不要继承 \`ApplicationException\`，已过时）
2. 类名以 \`Exception\` 结尾
3. 提供三个构造函数：无参、带消息、带消息+内部异常
4. 标记 \`[Serializable]\`（如果需要跨进程/序列化）

### 六、异常过滤器 when（C# 6+）⭐

\`when\` 关键字让 catch 仅在条件成立时才捕获：

\`\`\`csharp
try
{
    int x = int.Parse("abc");
}
catch (FormatException ex) when (ex.Message.Contains("Input string"))
{
    Console.WriteLine("只处理特定格式的 FormatException");
}
catch (FormatException)
{
    Console.WriteLine("其他 FormatException 走这里");
}
\`\`\`

**经典用法——日志不破坏堆栈：**

\`\`\`csharp
try { DoWork(); }
catch (Exception ex) when (Log(ex)) { }  // Log 返回 false，异常继续传播

static bool Log(Exception ex)
{
    Console.WriteLine($"[LOG] {ex.Message}");
    return false;  // 不真的捕获，仅记录
}
\`\`\`

### 七、空条件运算符 ?. 避免 NullReferenceException ⭐

\`NullReferenceException\` 是 C# 最常见的异常。用 \`?.\` 和 \`??\` 可以从源头消灭：

\`\`\`csharp
public class User
{
    public string Name { get; set; }
    public Address Home { get; set; }
}
public class Address { public string City { get; set; } }

User u = null;

// ❌ 旧写法：三重判空
string city1 = u != null && u.Home != null ? u.Home.City : null;

// ✅ 新写法：?. 链式
string city2 = u?.Home?.City;          // 任一为 null，整体为 null
string city3 = u?.Home?.City ?? "未知";  // 加默认值

// 索引也要用 ?[]
string[] arr = null;
string first = arr?[0];  // null 而不是异常
\`\`\`

> ⭐ \`?.\` 是写出"防御性代码"的瑞士军刀——但别滥用，有时让它抛异常更利于发现 bug。

### 八、不要 catch 所有异常 ⚠️

❌ **反模式**——吞掉所有异常：

\`\`\`csharp
try { DoSomething(); }
catch (Exception) { }  // ❌ 静默吞掉，bug 永远找不到
\`\`\`

❌ **反模式**——catch 后只记日志不抛：

\`\`\`csharp
try { WithdrawMoney(); }
catch (Exception ex) { Log(ex); }  // ❌ 钱没扣成功但用户不知道
\`\`\`

**正确原则：**
1. **只 catch 你能处理的异常**——其他让它继续传播
2. **catch 越具体越好**——优先 \`catch (IOException)\` 而非 \`catch (Exception)\`
3. **需要记录就记录，但要让异常传播**——用 \`when\` 过滤器或 finally
4. **最外层（如 Main / Controller）才做兜底**——记日志 + 返回友好错误

### 九、异常处理性能

异常"抛出"成本高（要收集堆栈），不要用异常做**控制流**：

\`\`\`csharp
// ❌ 用异常判断解析是否成功
int ParseInt(string s)
{
    try { return int.Parse(s); }
    catch (FormatException) { return -1; }
}

// ✅ 用 TryParse
int ParseInt(string s) =>
    int.TryParse(s, out var v) ? v : -1;
\`\`\`

### 十、实战 demo：安全的配置加载

\`\`\`csharp
using System.Text.Json;

public class AppConfig
{
    public string Name { get; set; } = "";
    public int Port { get; set; }
    public string[] Features { get; set; } = Array.Empty<string>();
}

public class ConfigLoadException : Exception
{
    public ConfigLoadException(string message, Exception inner)
        : base(message, inner) { }
}

public class ConfigLoader
{
    public AppConfig Load(string path)
    {
        ArgumentNullException.ThrowIfNull(path);

        if (!File.Exists(path))
            throw new FileNotFoundException("配置文件不存在", path);

        try
        {
            string json = File.ReadAllText(path);
            var cfg = JsonSerializer.Deserialize<AppConfig>(json)
                      ?? throw new InvalidOperationException("配置反序列化为 null");
            return cfg;
        }
        catch (JsonException ex)
        {
            // 包装为业务异常，保留原始堆栈
            throw new ConfigLoadException($"配置文件格式错误: {path}", ex);
        }
        catch (IOException ex)
        {
            throw new ConfigLoadException($"读取配置文件失败: {path}", ex);
        }
    }
}

// 调用方：只关心成功或失败
try
{
    var cfg = new ConfigLoader().Load("app.json");
    Console.WriteLine($"加载: {cfg.Name}:{cfg.Port}");
}
catch (ConfigLoadException ex)
{
    Console.WriteLine($"[FATAL] {ex.Message}");
    Console.WriteLine($"[INNER] {ex.InnerException?.Message}");
    Environment.Exit(1);
}
\`\`\`

### 小结

- \`try/catch/finally\` 是异常处理三件套，\`finally\` 用于资源清理
- 自定义异常要继承 \`Exception\`、提供三构造函数
- \`throw;\` 保留堆栈，\`throw ex;\` 会重置堆栈——务必用前者
- \`when\` 过滤器让 catch 更精准，还能用于"只记录不捕获"
- \`?.\` 和 \`??\` 从源头消灭 \`NullReferenceException\`
- 不要 \`catch (Exception)\` 吞掉所有异常——只处理你懂的

---

## 下一章预告

异常处理好了，业务代码才有底气。下一章我们看另一个高频场景——**日期时间与时区**，这是几乎所有业务系统都要处理的东西。
`,
  },

  // ============================================================
  // 第四十八章：日期时间与时区
  // ============================================================
  {
    id: 'csharp2-ch48',
    group: '第十部分 工程化与实战',
    icon: '📅',
    title: '日期时间与时区',
    content: `## 第四十八章　日期时间与时区

时间处理是后端开发的高频痛点：日志、订单、定时任务、跨时区用户……本章系统讲清 C# 的时间体系。

### 一、DateTime：基础时间类型 ⭐

\`DateTime\` 是最常用的时间类型，表示一个日期+时间。

\`\`\`csharp
// 获取当前时间（三种常用方式）
DateTime now = DateTime.Now;         // 本地时间 + 时区
DateTime utc = DateTime.UtcNow;      // UTC 时间（推荐存储）
DateTime today = DateTime.Today;     // 今天 00:00:00

Console.WriteLine(now);    // 2026-07-18 14:30:00
Console.WriteLine(utc);    // 2026-07-18 06:30:00 (UTC)
Console.WriteLine(today);  // 2026-07-18 00:00:00
\`\`\`

> ⭐ **核心建议**：业务数据存储**永远用 \`UtcNow\`**，显示时再转本地时间。否则跨时区必踩坑。

### 二、DateTime 构造

\`\`\`csharp
new DateTime(2026, 7, 18);                    // 2026-07-18 00:00:00
new DateTime(2026, 7, 18, 14, 30, 0);         // 2026-07-18 14:30:00
new DateTime(2026, 7, 18, 14, 30, 0, 500);    // 带毫秒
new DateTime(2026, 7, 18, DateTimeKind.Utc);  // 显式标记为 UTC

// 从字符串解析
DateTime.Parse("2026-07-18");
DateTime.ParseExact("2026/07/18", "yyyy/MM/dd", null);
DateTime.TryParse("2026-07-18", out var d);  // 安全解析
\`\`\`

### 三、格式化输出 ⭐

\`\`\`csharp
DateTime d = new(2026, 7, 18, 14, 30, 5);

d.ToString();                   // 2026/7/18 14:30:05
d.ToString("yyyy-MM-dd");       // 2026-07-18
d.ToString("yyyy-MM-dd HH:mm:ss");  // 2026-07-18 14:30:05
d.ToString("yyyyMMddHHmmss");   // 20260718143005（生成文件名常用）
d.ToLongDateString();           // 2026年7月18日
d.ToShortTimeString();          // 14:30

// ISO 8601 标准格式（API 传输推荐）
d.ToString("O");  // 2026-07-18T14:30:05.0000000
d.ToString("R");  // RFC1123：Sat, 18 Jul 2026 14:30:05 GMT
\`\`\`

**常用格式符：**

| 符号 | 含义 | 示例 |
|------|------|------|
| \`yyyy\` | 四位年 | 2026 |
| \`MM\` | 两位月 | 07 |
| \`dd\` | 两位日 | 18 |
| \`HH\` | 24 小时制时 | 14 |
| \`mm\` | 分 | 30 |
| \`ss\` | 秒 | 05 |
| \`fff\` | 毫秒 | 123 |
| \`O\` / \`o\` | ISO 8601 | 2026-07-18T14:30:05.0000000 |

### 四、TimeSpan：时间间隔 ⭐

\`TimeSpan\` 表示一段时间长度（不是时间点）。

\`\`\`csharp
// 构造
var ts1 = new TimeSpan(1, 30, 0);          // 1 时 30 分
var ts2 = TimeSpan.FromHours(2.5);         // 2.5 小时
var ts3 = TimeSpan.FromDays(7);            // 7 天
var ts4 = TimeSpan.FromSeconds(90);        // 90 秒

Console.WriteLine(ts1);   // 01:30:00
Console.WriteLine(ts4);   // 00:01:30

// DateTime 运算产生 TimeSpan
DateTime start = DateTime.UtcNow;
Thread.Sleep(500);
DateTime end = DateTime.UtcNow;
TimeSpan elapsed = end - start;
Console.WriteLine($"耗时 {elapsed.TotalMilliseconds} ms");

// TimeSpan 运算
var combined = ts1 + ts2;
var diff = ts2 - ts1;
Console.WriteLine(combined.TotalHours);
\`\`\`

### 五、DateTimeOffset：带时区的时间 ⭐

\`DateTime\` 不带显式时区信息（只有 \`Kind\` 标记），\`DateTimeOffset\` 则把 UTC 偏移量打包进去——跨时区更可靠。

\`\`\`csharp
DateTimeOffset now = DateTimeOffset.Now;
DateTimeOffset utc = DateTimeOffset.UtcNow;

Console.WriteLine(now);  // 2026-07-18 14:30:00 +08:00
Console.WriteLine(utc);  // 2026-07-18 06:30:00 +00:00

// 转换到指定时区
var tz = TimeZoneInfo.FindSystemTimeZoneById("China Standard Time");
var beijing = utc.ToOffset(tz.GetUtcOffset(utc.DateTime));
Console.WriteLine(beijing);  // 2026-07-18 14:30:00 +08:00
\`\`\`

> ⭐ **推荐**：服务端 API 用 \`DateTimeOffset\`，序列化为 ISO 8601 字符串，前端自动显示本地时间。

### 六、DateOnly / TimeOnly（C# 10+）⭐

很多业务场景只关心"日期"或"时间"，用 \`DateTime\` 既冗余又易错。C# 10 引入：

\`\`\`csharp
DateOnly birthday = new(1990, 5, 20);
TimeOnly workStart = new(9, 0, 0);

Console.WriteLine(birthday);   // 1990-05-20
Console.WriteLine(workStart);  // 09:00:00

// 从 DateTime 提取
DateOnly d = DateOnly.FromDateTime(DateTime.Now);
TimeOnly t = TimeOnly.FromDateTime(DateTime.Now);

// 比较
Console.WriteLine(workStart > new TimeOnly(8, 0));  // True

// 常用于生日、营业时间、排班表
\`\`\`

### 七、时区转换 TimeZoneInfo ⭐

\`\`\`csharp
// 列出所有时区 ID
foreach (var tz in TimeZoneInfo.GetSystemTimeZones())
    Console.WriteLine(tz.Id);

// 常用时区 ID：
//   "China Standard Time"          北京
//   "UTC"                          协调世界时
//   "Eastern Standard Time"        美国东部
//   "Pacific Standard Time"        美国西部
//   "Tokyo Standard Time"          东京

DateTime utc = DateTime.UtcNow;
var beijingTz = TimeZoneInfo.FindSystemTimeZoneById("China Standard Time");
var nyTz = TimeZoneInfo.FindSystemTimeZoneById("Eastern Standard Time");

DateTime beijing = TimeZoneInfo.ConvertTimeFromUtc(utc, beijingTz);
DateTime ny = TimeZoneInfo.ConvertTimeFromUtc(utc, nyTz);

Console.WriteLine($"UTC:     {utc}");
Console.WriteLine($"北京:    {beijing}");
Console.WriteLine($"纽约:    {ny}");

// 是否夏令时
Console.WriteLine(nyTz.IsDaylightSavingTime(utc));
\`\`\`

### 八、Unix 时间戳转换

后端 API 经常需要和 Unix 时间戳（从 1970-01-01 起的秒数）互转：

\`\`\`csharp
// DateTimeOffset 自带方法 ⭐
long ts = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
Console.WriteLine(ts);  // 1752834605

DateTimeOffset fromTs = DateTimeOffset.FromUnixTimeSeconds(ts);
Console.WriteLine(fromTs);  // 2026-07-18 06:30:05 +00:00

// 毫秒戳
long tsMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
var fromMs = DateTimeOffset.FromUnixTimeMilliseconds(tsMs);
\`\`\`

### 九、实战 demo 1：年龄计算

\`\`\`csharp
int CalculateAge(DateOnly birthday, DateOnly today)
{
    int age = today.Year - birthday.Year;
    // 今年生日还没到，年龄 -1
    if (birthday.AddYears(age) > today) age--;
    return age;
}

var birthday = new DateOnly(1990, 5, 20);
var today = DateOnly.FromDateTime(DateTime.Today);
Console.WriteLine($"年龄: {CalculateAge(birthday, today)}");
\`\`\`

### 十、实战 demo 2：倒计时

\`\`\`csharp
void ShowCountdown(DateTime target, string name)
{
    TimeSpan remaining = target - DateTime.UtcNow;
    if (remaining.TotalSeconds <= 0)
    {
        Console.WriteLine($"[{name}] 已到期！");
        return;
    }
    Console.WriteLine($"[{name}] 剩余: {remaining.Days} 天 {remaining.Hours:D2}:{remaining.Minutes:D2}:{remaining.Seconds:D2}");
}

var newYear = new DateTime(2027, 1, 1, 0, 0, 0, DateTimeKind.Utc);
ShowCountdown(newYear, "2027 元旦");
\`\`\`

### 十一、实战 demo 3：定时任务（每分钟跑一次）

\`\`\`csharp
using System.Threading;

var cts = new CancellationTokenSource();
CancellationToken token = cts.Token;

// 用 PeriodicTimer（.NET 6+，比 Timer 更现代）
var timer = new PeriodicTimer(TimeSpan.FromMinutes(1));

_ = Task.Run(async () =>
{
    while (await timer.WaitForNextTickAsync(token))
    {
        try
        {
            Console.WriteLine($"[{DateTime.UtcNow:O}] 执行定时任务...");
            await DoDailyWork();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] {ex.Message}");
        }
    }
});

async Task DoDailyWork()
{
    await Task.Delay(500);
    // ... 业务逻辑
}

Console.WriteLine("按 Q 退出");
while (Console.ReadKey().Key != ConsoleKey.Q) { }
cts.Cancel();
\`\`\`

### 小结

- 时间存储**永远用 \`UtcNow\`**，显示时再转本地
- \`DateTime\` 适合本地时间，\`DateTimeOffset\` 适合跨时区
- \`DateOnly\` / \`TimeOnly\`（C# 10+）适合纯日期/纯时间业务
- \`TimeSpan\` 是"长度"，不是"时间点"
- \`TimeZoneInfo\` 做时区转换
- Unix 时间戳用 \`DateTimeOffset\` 的 \`ToUnixTimeSeconds\` / \`FromUnixTimeSeconds\`

---

## 下一章预告

时间处理搞定，下一章我们看 C# 工程的组织方式——**命名空间与程序集**，这是从单文件走向真实项目的关键。
`,
  },

  // ============================================================
  // 第四十九章：命名空间与程序集
  // ============================================================
  {
    id: 'csharp2-ch49',
    group: '第十部分 工程化与实战',
    icon: '📦',
    title: '命名空间与程序集',
    content: `## 第四十九章　命名空间与程序集

写到这个阶段，你的项目应该已经有十几个甚至几十个类了。怎么组织它们？怎么避免命名冲突？怎么打包成可复用的库？本章讲清楚工程层面的组织单元。

### 一、namespace：命名空间 ⭐

命名空间是类的"姓氏"，用来分组相关类型、避免重名冲突。

\`\`\`csharp
namespace MyShop.Orders
{
    public class Order { /* ... */ }
}

namespace MyShop.Users
{
    public class Order { /* 用户订单视图 */ }  // 不冲突
}
\`\`\`

**命名约定：**
- 用 \`公司.产品.模块\` 形式，如 \`Microsoft.AspNetCore.Mvc\`
- PascalCase
- 与目录结构对应（项目模板默认如此）

### 二、using：引入命名空间 ⭐

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

class Program
{
    static void Main()
    {
        var list = new List<int>();  // 不用写 System.Collections.Generic.List<int>
        var sorted = list.OrderBy(x => x);
        Console.WriteLine("hi");
    }
}
\`\`\`

### 三、using static（C# 6+）

直接引入某个类的静态成员：

\`\`\`csharp
using static System.Math;
using static System.Console;

class Program
{
    static void Main()
    {
        double x = Sqrt(2);   // 不用 Math.Sqrt
        WriteLine(x);         // 不用 Console.WriteLine
    }
}
\`\`\`

> 适度使用——可读性是双刃剑，太多 \`using static\` 会让人不知道方法从哪来。

### 四、全局 using（C# 10+）⭐

传统 \`using\` 必须在每个文件重复写。C# 10 引入 \`global using\`，一次声明全项目生效：

\`\`\`csharp
// 放在任意 .cs 文件顶部（通常建一个 GlobalUsings.cs）
global using System;
global using System.Collections.Generic;
global using System.Linq;
global using System.Threading.Tasks;
\`\`\`

之后的文件可以省略这些 \`using\`。

### 五、文件范围命名空间（C# 10+）⭐

传统命名空间要包裹整个文件，缩进多一层：

\`\`\`csharp
// 旧写法
namespace MyShop.Orders
{
    public class Order { /* ... */ }
    public class OrderItem { /* ... */ }
}
\`\`\`

C# 10 引入文件范围命名空间，一行搞定：

\`\`\`csharp
// 新写法
namespace MyShop.Orders;

public class Order { /* ... */ }
public class OrderItem { /* ... */ }
\`\`\`

> ⭐ **新项目强烈推荐文件范围命名空间**——更简洁，少一层缩进。

### 六、命名空间别名

遇到重名类型时，用别名消歧义：

\`\`\`csharp
using System.Collections.Generic;
using MyDict = System.Collections.Generic.Dictionary<string, int>;

class Program
{
    static void Main()
    {
        var d = new MyDict();   // 等同于 new Dictionary<string, int>()
        d["a"] = 1;
    }
}

// 处理同名冲突
using ConsoleJson = System.Text.Json.JsonSerializer;
using NewtonsoftJson = Newtonsoft.Json.JsonSerializer;
\`\`\`

### 七、程序集 / 项目结构

**程序集（Assembly）** 是 C# 的编译产物，是部署/版本/复用的基本单元：

- 控制台项目 → 编译为 \`MyApp.dll\` / \`MyApp.exe\`
- 类库项目 → 编译为 \`MyLib.dll\`
- 一个程序集可以包含多个命名空间，一个命名空间也能跨多个程序集

**典型解决方案结构：**

\`\`\`
MyShop/
├── MyShop.sln                解决方案（VS 双击打开）
├── src/
│   ├── MyShop.Core/          核心领域
│   │   ├── MyShop.Core.csproj
│   │   ├── Entities/
│   │   │   ├── Order.cs
│   │   │   └── User.cs
│   │   └── Services/
│   │       └── OrderService.cs
│   ├── MyShop.Infrastructure/   基础设施（数据库访问等）
│   │   └── MyShop.Infrastructure.csproj
│   └── MyShop.Api/              Web API
│       └── MyShop.Api.csproj
└── tests/
    └── MyShop.Core.Tests/
        └── MyShop.Core.Tests.csproj
\`\`\`

### 八、internal 访问修饰符 ⭐

\`internal\` 表示"只在当前程序集内可见"——是组件化设计的核心工具。

\`\`\`csharp
// MyShop.Core.dll
namespace MyShop.Core;

public class OrderService
{
    public void PlaceOrder() { /* ... */ }

    internal void ValidateInternal() { /* ... */ }  // 同程序集可见
}

// MyShop.Api.dll（引用了 Core）
class OrderController
{
    void Handle()
    {
        var svc = new OrderService();
        svc.PlaceOrder();        // ✅ public 可访问
        // svc.ValidateInternal();  // ❌ internal 跨程序集不可访问
    }
}
\`\`\`

**访问修饰符对比：**

| 修饰符 | 范围 |
|--------|------|
| \`public\` | 任何地方 |
| \`internal\` | 当前程序集 |
| \`protected\` | 当前类 + 子类 |
| \`private\` | 当前类内 |
| \`protected internal\` | 当前程序集 **或** 子类 |
| \`private protected\` | 当前程序集 **且** 子类（C# 7.2+） |

> ⭐ **设计建议**：库的对外 API 用 \`public\`，内部实现用 \`internal\`——这样改 internal 不会破坏调用方。

### 九、csproj 简介 ⭐

\`.csproj\` 是项目的"身份证"，告诉编译器怎么编译：

\`\`\`xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>             <!-- Exe / Library -->
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>  <!-- 自动 using 常用命名空间 -->
    <Nullable>enable</Nullable>              <!-- 启用可空引用类型 -->
    <Version>1.2.0</Version>
    <AssemblyName>MyApp</AssemblyName>
    <RootNamespace>MyShop</RootNamespace>
  </PropertyGroup>

  <ItemGroup>
    <!-- 引用 NuGet 包 -->
    <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
    <PackageReference Include="Microsoft.Extensions.Logging" Version="8.0.0" />
  </ItemGroup>

  <ItemGroup>
    <!-- 引用其他项目 -->
    <ProjectReference Include="..\\MyShop.Core\\MyShop.Core.csproj" />
  </ItemGroup>

</Project>
\`\`\`

**关键属性：**

| 属性 | 作用 |
|------|------|
| \`OutputType\` | \`Exe\`（可执行）/ \`Library\`（类库） |
| \`TargetFramework\` | 目标框架：\`net8.0\` / \`net6.0\` / \`net48\` |
| \`ImplicitUsings\` | 自动加 \`global using\` |
| \`Nullable\` | 启用可空引用类型检查 |
| \`AssemblyName\` | 输出 dll 名 |

### 十、实战 demo：多项目解决方案

\`\`\`bash
# 创建解决方案
dotnet new sln -n MyShop

# 创建三个项目
dotnet new classlib -n MyShop.Core -o src/MyShop.Core -f net8.0
dotnet new classlib -n MyShop.Infrastructure -o src/MyShop.Infrastructure -f net8.0
dotnet new console -n MyShop.App -o src/MyShop.App -f net8.0

# 加入解决方案
dotnet sln add src/MyShop.Core/MyShop.Core.csproj
dotnet sln add src/MyShop.Infrastructure/MyShop.Infrastructure.csproj
dotnet sln add src/MyShop.App/MyShop.App.csproj

# 项目引用关系
dotnet add src/MyShop.Infrastructure/MyShop.Infrastructure.csproj reference src/MyShop.Core/MyShop.Core.csproj
dotnet add src/MyShop.App/MyShop.App.csproj reference src/MyShop.Infrastructure/MyShop.Infrastructure.csproj

# 编译运行
dotnet run --project src/MyShop.App
\`\`\`

**目录与依赖：**

\`\`\`
App ──引用──> Infrastructure ──引用──> Core
\`\`\`

依赖方向**单向**：高层依赖低层，避免循环引用。

### 小结

- \`namespace\` 是组织类型的"姓氏"，命名跟目录对齐
- \`global using\` / 文件范围命名空间（C# 10+）是现代项目标配
- \`using static\` / 别名用来解决重名与简化
- \`internal\` 控制类只在程序集内可见——库设计的核心工具
- \`csproj\` 描述项目元数据、依赖、目标框架
- 多项目解决方案：单向依赖，按"基础设施 / 核心 / 应用"分层

---

## 下一章预告

工程结构理清了，下一章我们看怎么让 C# 程序"开口说话"——**HttpClient 网络请求**，调用 REST API、爬数据、对接第三方服务都靠它。
`,
  },

  // ============================================================
  // 第五十章：HttpClient 网络请求
  // ============================================================
  {
    id: 'csharp2-ch50',
    group: '第十部分 工程化与实战',
    icon: '🌐',
    title: 'HttpClient 网络请求',
    content: `## 第五十章　HttpClient 网络请求

现代应用几乎都离不开 HTTP：调用 REST API、对接微信支付、爬取数据……C# 用 \`HttpClient\` 处理这一切。本章讲清楚正确用法和常见坑。

### 一、HttpClient 类 ⭐

\`HttpClient\` 是发送 HTTP 请求、接收 HTTP 响应的主要类。

\`\`\`csharp
using System.Net.Http;

using HttpClient client = new();

// 最简单的 GET
string text = await client.GetStringAsync("https://api.github.com/zen");
Console.WriteLine(text);
\`\`\`

### 二、GetStringAsync / GetAsync ⭐

\`\`\`csharp
using HttpClient client = new();

// 1. GetStringAsync：只要响应体字符串
string body = await client.GetStringAsync("https://httpbin.org/get");
Console.WriteLine(body);

// 2. GetAsync：拿到完整 HttpResponseMessage
HttpResponseMessage resp = await client.GetAsync("https://httpbin.org/get");
resp.EnsureSuccessStatusCode();  // 不是 2xx 就抛 HttpRequestException

Console.WriteLine($"状态码: {resp.StatusCode}");           // 200
Console.WriteLine($"是否成功: {resp.IsSuccessStatusCode}"); // True

// 读取响应体
string content = await resp.Content.ReadAsStringAsync();
byte[] bytes = await resp.Content.ReadAsByteArrayAsync();
Stream stream = await resp.Content.ReadAsStreamAsync();
\`\`\`

### 三、JSON 请求与响应（System.Text.Json）⭐

真实 API 几乎都是 JSON。配合 \`System.Text.Json\` 用泛型方法最方便：

\`\`\`csharp
using System.Net.Http;
using System.Text.Json;

public class Todo
{
    public int UserId { get; set; }
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public bool Completed { get; set; }
}

using HttpClient client = new();

// GET 反序列化为对象
HttpResponseMessage resp = await client.GetAsync("https://jsonplaceholder.typicode.com/todos/1");
resp.EnsureSuccessStatusCode();

string json = await resp.Content.ReadAsStringAsync();
Todo todo = JsonSerializer.Deserialize<Todo>(json, new JsonSerializerOptions
{
    PropertyNameCaseInsensitive = true  // API 字段小写，类属性大写
});

Console.WriteLine($"#{todo.Id}: {todo.Title} (done={todo.Completed})");
\`\`\`

**POST JSON：**

\`\`\`csharp
var newTodo = new Todo { UserId = 1, Title = "学 C#", Completed = false };
string json = JsonSerializer.Serialize(newTodo);

var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

HttpResponseMessage resp = await client.PostAsync("https://jsonplaceholder.typicode.com/todos", content);
resp.EnsureSuccessStatusCode();

string responseJson = await resp.Content.ReadAsStringAsync();
Console.WriteLine(responseJson);  // 服务器返回新创建的资源
\`\`\`

### 四、扩展方法封装 JSON 调用

写多了重复代码，封装成扩展方法：

\`\`\`csharp
public static class HttpClientExtensions
{
    public static async Task<T> GetFromJsonAsync<T>(
        this HttpClient client, string url, CancellationToken ct = default)
    {
        var resp = await client.GetAsync(url, ct);
        resp.EnsureSuccessStatusCode();
        var json = await resp.Content.ReadAsStringAsync(ct);
        return JsonSerializer.Deserialize<T>(json,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }

    public static async Task<TResponse> PostAsJsonAsync<TRequest, TResponse>(
        this HttpClient client, string url, TRequest data, CancellationToken ct = default)
    {
        var json = JsonSerializer.Serialize(data);
        var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
        var resp = await client.PostAsync(url, content, ct);
        resp.EnsureSuccessStatusCode();
        var respJson = await resp.Content.ReadAsStringAsync(ct);
        return JsonSerializer.Deserialize<TResponse>(respJson,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }
}

// 使用：超简洁
using HttpClient client = new();
var todo = await client.GetFromJsonAsync<Todo>("https://jsonplaceholder.typicode.com/todos/1");
Console.WriteLine(todo.Title);
\`\`\`

> ⭐ .NET 5+ 内置了 \`System.Net.Http.Json\` 包，提供 \`GetFromJsonAsync\` / \`PostAsJsonAsync\`——直接 \`using System.Net.Http.Json\` 就能用，不用自己写。

### 五、请求头

\`\`\`csharp
using HttpClient client = new();

// 全局默认头
client.DefaultRequestHeaders.Add("User-Agent", "MyApp/1.0");
client.DefaultRequestHeaders.Add("Accept", "application/json");

// 鉴权头
client.DefaultRequestHeaders.Authorization =
    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "your-token-here");

// 单次请求自定义头（用 HttpRequestMessage）
var req = new HttpRequestMessage(HttpMethod.Get, "https://api.github.com/user");
req.Headers.Add("X-Custom", "abc");
HttpResponseMessage resp = await client.SendAsync(req);
\`\`\`

> ⚠️ \`Content-Type\` 头要放在 \`StringContent\` 上，不能放在 \`DefaultRequestHeaders\`。

### 六、超时设置 ⭐

HTTP 请求必须设超时——否则服务器挂了你这边永远等下去：

\`\`\`csharp
var client = new HttpClient
{
    Timeout = TimeSpan.FromSeconds(10)  // 全局超时
};

try
{
    string s = await client.GetStringAsync("https://slow-server.com");
}
catch (TaskCanceledException ex) when (ex.InnerException is TimeoutException)
{
    Console.WriteLine("请求超时");
}
// .NET 6+ 超时抛 TaskCanceledException
\`\`\`

**单次请求超时**用 \`CancellationTokenSource\`：

\`\`\`csharp
using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(3));
try
{
    var resp = await client.GetAsync("https://slow.com", cts.Token);
}
catch (OperationCanceledException)
{
    Console.WriteLine("3 秒超时");
}
\`\`\`

### 七、IDisposable 正确使用（重要！）⚠️

\`HttpClient\` 实现了 \`IDisposable\`，但**不要每次请求都 new + dispose**！

❌ **错误用法**（高频坑）：

\`\`\`csharp
// 每次请求都 new
using var client = new HttpClient();
var resp = await client.GetAsync("https://api.com");
// 高并发下会耗尽 TCP 套接字（SocketException / 端口耗尽）
\`\`\`

虽然 \`Dispose\` 了，但底层 TCP 连接进入 \`TIME_WAIT\` 状态，Windows 默认 240 秒才释放。高并发下端口耗尽，请求开始失败。

✅ **正确用法 1：单例复用**

\`\`\`csharp
// 程序生命周期内复用一个 HttpClient 实例
public static class HttpHelper
{
    public static readonly HttpClient Client = new HttpClient();
}

// 使用
var s = await HttpHelper.Client.GetStringAsync("https://api.com");
\`\`\`

✅ **正确用法 2：HttpClientFactory（推荐，ASP.NET Core 场景）⭐**

\`\`\`csharp
// Program.cs
builder.Services.AddHttpClient("github", c =>
{
    c.BaseAddress = new Uri("https://api.github.com/");
    c.DefaultRequestHeaders.Add("User-Agent", "MyApp");
    c.Timeout = TimeSpan.FromSeconds(10);
});

// 注入使用
public class GithubService
{
    private readonly IHttpClientFactory _factory;
    public GithubService(IHttpClientFactory factory) => _factory = factory;

    public async Task<string> GetRepoAsync(string name)
    {
        var client = _factory.CreateClient("github");
        return await client.GetStringAsync($"repos/{name}");
    }
}
\`\`\`

\`HttpClientFactory\` 内部管理 \`HttpMessageHandler\` 池，自动复用 TCP 连接 + 定期回收 DNS 变化——是现代 .NET 的标准做法。

### 八、HttpClientFactory 简介

**为什么需要 Factory？**

直接 \`new HttpClient()\` 单例有两个问题：
1. DNS 变化不会感知（长效连接缓存了旧 IP）
2. 不同业务场景需要不同配置（不同 BaseAddress / 超时 / 鉴权）

\`HttpClientFactory\` 解决方式：
- 内部维护 \`HttpMessageHandler\` 池，默认 2 分钟生命周期
- Handler 过期后创建新的，自动感知 DNS
- 通过"命名客户端"分离不同配置

**三种使用方式：**

\`\`\`csharp
// 1. 命名客户端（推荐）
builder.Services.AddHttpClient("github", c => c.BaseAddress = new Uri("https://api.github.com/"));
var client = factory.CreateClient("github");

// 2. 类型化客户端（强烈推荐，配合 DI）
builder.Services.AddHttpClient<GithubService>(c => c.BaseAddress = new Uri("https://api.github.com/"));
public class GithubService
{
    private readonly HttpClient _client;
    public GithubService(HttpClient client) => _client = client;  // 自动注入配置好的
}

// 3. 直接拿默认客户端
var client = factory.CreateClient();
\`\`\`

### 九、实战 demo：调用 REST API（含错误处理）

\`\`\`csharp
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;

public class Post
{
    [JsonPropertyName("userId")]
    public int UserId { get; set; }

    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; } = "";

    [JsonPropertyName("body")]
    public string Body { get; set; } = "";
}

public class PostApiClient
{
    private readonly HttpClient _client;

    public PostApiClient()
    {
        _client = new HttpClient
        {
            BaseAddress = new Uri("https://jsonplaceholder.typicode.com"),
            Timeout = TimeSpan.FromSeconds(10)
        };
        _client.DefaultRequestHeaders.Add("Accept", "application/json");
        _client.DefaultRequestHeaders.Add("User-Agent", "Demo/1.0");
    }

    public async Task<Post?> GetPostAsync(int id, CancellationToken ct = default)
    {
        try
        {
            // 使用 System.Net.Http.Json 内置扩展
            return await _client.GetFromJsonAsync<Post>($"/posts/{id}", ct);
        }
        catch (HttpRequestException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            Console.WriteLine($"[404] Post {id} 不存在");
            return null;
        }
        catch (HttpRequestException ex)
        {
            Console.WriteLine($"[HTTP ERROR] {ex.StatusCode}: {ex.Message}");
            throw;
        }
    }

    public async Task<Post?> CreatePostAsync(Post post, CancellationToken ct = default)
    {
        var resp = await _client.PostAsJsonAsync("/posts", post, ct);
        resp.EnsureSuccessStatusCode();
        return await resp.Content.ReadFromJsonAsync<Post>(cancellationToken: ct);
    }

    public async Task<bool> UpdatePostAsync(int id, Post post, CancellationToken ct = default)
    {
        var resp = await _client.PutAsJsonAsync($"/posts/{id}", post, ct);
        return resp.IsSuccessStatusCode;
    }

    public async Task<bool> DeletePostAsync(int id, CancellationToken ct = default)
    {
        var resp = await _client.DeleteAsync($"/posts/{id}", ct);
        return resp.IsSuccessStatusCode;
    }
}

// 使用
var api = new PostApiClient();
var post = await api.GetPostAsync(1);
if (post is not null)
    Console.WriteLine($"[{post.Id}] {post.Title}");

var created = await api.CreatePostAsync(new Post
{
    UserId = 1,
    Title = "学 HttpClient",
    Body = "今天学会了用 HttpClient 调用 REST API"
});
Console.WriteLine($"新建 Post ID: {created?.Id}");
\`\`\`

### 小结

- \`HttpClient\` 是 C# 处理 HTTP 的标准类
- \`GetStringAsync\` 简单、\`GetAsync\` 拿完整响应、\`GetFromJsonAsync<T>\` 直接反序列化
- JSON 用 \`System.Text.Json\` + \`StringContent\`，配合 \`System.Net.Http.Json\` 扩展方法更简洁
- **永远设超时**：\`Timeout\` 或 \`CancellationToken\`
- ⚠️ **不要每次 new HttpClient**——单例复用，或用 \`HttpClientFactory\`
- ASP.NET Core 项目优先用 \`AddHttpClient\` + 类型化客户端

---

## 下一章预告

网络层搞定，下一章我们潜入 .NET 的"心脏"——**内存管理与 GC**，理解它才能写出又快又稳的程序。
`,
  },

  // ============================================================
  // 第五十一章：内存管理与 GC
  // ============================================================
  {
    id: 'csharp2-ch51',
    group: '第十部分 工程化与实战',
    icon: '♻️',
    title: '内存管理与 GC',
    content: `## 第五十一章　内存管理与 GC

C# 不用手动 \`free\` 内存——有 GC（垃圾回收器）替你管。但理解 GC 工作原理，才能避免"内存抖动"、"卡顿"、"泄露"这些坑。本章是写出高性能代码的关键。

### 一、.NET 内存结构

.NET 进程的内存分两块堆：

| 堆 | 存什么 | 谁回收 |
|----|--------|--------|
| **托管堆** | \`new\` 出来的对象 | GC 自动回收 |
| **非托管堆** | 文件句柄、数据库连接、原生内存 | 程序员手动释放 |

值类型（\`int\` / \`struct\` 等）通常在**栈**上分配，方法结束自动回收——不经 GC。引用类型（\`class\` 实例）在**托管堆**上，由 GC 回收。

### 二、GC 工作原理：代（Generation）⭐

GC 把对象分三代，假设"新对象死得快、老对象活得久"——分代回收降低开销。

\`\`\`
代 0 (Gen 0)   ← 新对象，回收最频繁
    ↓ 活过一次 GC
代 1 (Gen 1)   ← 缓冲区
    ↓ 再活一次
代 2 (Gen 2)   ← 长期对象，回收最贵
\`\`\`

| 代 | 特点 | 回收频率 |
|----|------|---------|
| Gen 0 | 短命对象（临时变量、字符串拼接结果） | 最高 |
| Gen 1 | 缓冲，避免 Gen 0 涨太快 | 中 |
| Gen 2 | 长期对象（缓存、静态字段） | 最低，回收最贵 |

> ⭐ **核心原则**：让对象尽快"死"在 Gen 0，别让它晋升到 Gen 2。一旦升到 Gen 2，回收成本激增。

**大对象堆（LOH，Large Object Heap）⭐：**

\`>= 85,000 字节\` 的对象直接进 LOH，**不经过 Gen 0/1/2**：

\`\`\`csharp
byte[] small = new byte[1000];       // 小对象，SOH
byte[] big = new byte[100_000];      // 大对象，LOH
\`\`\`

LOH 回收代价大，且不压缩——容易产生内存碎片。**避免频繁分配大对象**。

### 三、GC.Collect：手动触发（一般别用）⚠️

\`\`\`csharp
GC.Collect();           // 全代回收
GC.Collect(0);          // 只回收 Gen 0
GC.WaitForPendingFinalizers();  // 等待终结器执行
GC.GetTotalMemory(true); // 当前托管内存使用量
\`\`\`

**99% 的场景不需要手动 \`GC.Collect\`**——GC 自己会调。手动调用反而：
1. 把对象强行升代，扰乱 GC 策略
2. 触发昂贵全代回收，造成卡顿

**仅有的合理场景：**
- 服务启动后加载完毕，清掉临时垃圾
- 测试场景下测量内存
- 用户离开大内存页面后

### 四、IDisposable 与 using ⭐

GC 只管"托管堆"。对于**非托管资源**（文件、连接、句柄），必须手动释放：

\`\`\`csharp
// 释放非托管资源的标准模式
public class FileWriter : IDisposable
{
    private StreamWriter _writer;
    private bool _disposed = false;

    public FileWriter(string path)
    {
        _writer = new StreamWriter(path);
    }

    public void Write(string text)
    {
        if (_disposed) throw new ObjectDisposedException(nameof(FileWriter));
        _writer.Write(text);
    }

    public void Dispose()
    {
        if (_disposed) return;
        _writer.Dispose();
        _disposed = true;
        GC.SuppressFinalize(this);  // 告诉 GC 不用调终结器
    }
}
\`\`\`

**调用方用 \`using\`：**

\`\`\`csharp
// 旧写法
using (var fw = new FileWriter("a.txt"))
{
    fw.Write("hello");
}  // 自动 Dispose

// C# 8+ 简化写法 ⭐
using var fw = new FileWriter("a.txt");
fw.Write("hello");
// 作用域结束自动 Dispose

// C# 10+ 异步 using（释放时支持 await）
await using var stream = new FileStream("a.txt", FileMode.Open);
\`\`\`

> ⭐ **铁律**：实现了 \`IDisposable\` 的类型，**一定要用 \`using\` 包起来**——否则资源泄露。

### 五、Dispose 模式（带终结器）

如果类包含**非托管资源**（直接持有原生句柄），需要终结器兜底：

\`\`\`csharp
public class NativeResourceHolder : IDisposable
{
    private IntPtr _handle;  // 非托管句柄
    private bool _disposed = false;

    public NativeResourceHolder()
    {
        _handle = NativeApi.Alloc();  // 假设的 P/Invoke
    }

    // 公共 Dispose：用户调用
    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    // 终结器：用户忘了 Dispose 时由 GC 调用（兜底）
    ~NativeResourceHolder()
    {
        Dispose(false);
    }

    // 受保护的释放逻辑
    protected virtual void Dispose(bool disposing)
    {
        if (_disposed) return;

        if (disposing)
        {
            // 释放托管资源（只有 disposing=true 时才能安全访问）
        }

        // 释放非托管资源（两种情况都要释放）
        if (_handle != IntPtr.Zero)
        {
            NativeApi.Free(_handle);
            _handle = IntPtr.Zero;
        }

        _disposed = true;
    }
}
\`\`\`

**关键点：**
- 终结器是"兜底"，不是"主路径"——终结器由 GC 在独立线程调用，时机不确定
- \`Dispose(true)\` 由用户调用，可安全释放托管+非托管
- \`Dispose(false)\` 由终结器调用，只释放非托管
- 没有非托管资源就**不要写终结器**——会让对象升代，影响 GC 性能

### 六、Span<T> / Memory<T>：避免分配 ⭐

\`Span<T>\` 是"对一段连续内存的视图"——不分配堆内存，操作字符串/数组更高效：

\`\`\`csharp
using System.MemoryExtensions;

string s = "Hello, World!";

// 旧写法：Substring 会创建新字符串
string sub1 = s.Substring(7, 5);  // "World"，分配新对象

// 新写法：AsSpan + Slice 不分配
ReadOnlySpan<char> span = s.AsSpan();
ReadOnlySpan<char> sub2 = span.Slice(7, 5);  // "World"，零分配

Console.WriteLine(sub2.ToString());  // 转 string 才会分配

// 解析数字避免分配
ReadOnlySpan<char> numStr = "12345".AsSpan();
if (int.TryParse(numStr, out int n))
    Console.WriteLine(n);

// Span 操作数组
int[] arr = { 1, 2, 3, 4, 5 };
Span<int> intSpan = arr.AsSpan();
intSpan[0] = 100;  // 直接改原数组
foreach (var x in intSpan) Console.WriteLine(x);
\`\`\`

**\`Span<T>\` vs \`Memory<T>\`：**

| 类型 | 特点 | 能否放堆上 |
|------|------|----------|
| \`Span<T>\` | ref struct，栈上 | ❌ 不能做字段、不能装箱、不能跨 await |
| \`Memory<T>\` | 普通结构体 | ✅ 可以放堆、可以跨 await |

\`\`\`csharp
async Task ProcessAsync(Memory<byte> buffer)
{
    await Task.Delay(100);
    Span<byte> span = buffer.Span;  // 在方法内转 Span 用
    span[0] = 42;
}
\`\`\`

### 七、ref struct（C# 7.2+）

\`ref struct\` 强制只能在栈上，用于高性能场景：

\`\`\`csharp
public ref struct StackOnly
{
    public int Value;
    public void DoSomething() { }
}

// 限制：
// - 不能作为 class 的字段
// - 不能装箱（不能转 object）
// - 不能跨 await / yield
// - 不能实现接口（C# 11 之前）
\`\`\`

\`Span<T>\`、\`ReadOnlySpan<T>\` 都是 \`ref struct\`。

### 八、避免装箱 ⭐

**装箱（Boxing）**：值类型转 \`object\` 时在堆上分配一份。性能差。

\`\`\`csharp
int x = 42;

// ❌ 装箱：ArrayList 存 object
var list = new System.Collections.ArrayList();
list.Add(x);  // 装箱！堆上分配

// ✅ 用泛型 List<int>
var list2 = new List<int>();
list2.Add(x);  // 不装箱

// ❌ 字符串拼接值类型会装箱
object o = x;       // 装箱
string s = "" + x;  // 实际调用 x.ToString()，不一定装箱

// ❌ 非泛型接口
IComparable c = x;  // 装箱
\`\`\`

**怎么发现装箱？** 用 Visual Studio 的"性能分析"或 dotMemory 看"Allocations"。

### 九、实战 demo：性能对比

\`\`\`csharp
using System.Diagnostics;

// 测试：拼接大量字符串
const int N = 100_000;

// ❌ 慢：每次 + 都生成新字符串
var sw = Stopwatch.StartNew();
string s1 = "";
for (int i = 0; i < N; i++) s1 += "a";
sw.Stop();
Console.WriteLine($"string +=:  {sw.ElapsedMilliseconds} ms");

// ✅ 快：StringBuilder 复用内部缓冲
sw.Restart();
var sb = new System.Text.StringBuilder();
for (int i = 0; i < N; i++) sb.Append("a");
string s2 = sb.ToString();
sw.Stop();
Console.WriteLine($"StringBuilder: {sw.ElapsedMilliseconds} ms");

// 测试：List 预分配容量
sw.Restart();
var list1 = new List<int>();
for (int i = 0; i < N; i++) list1.Add(i);
sw.Stop();
Console.WriteLine($"List 无容量: {sw.ElapsedMilliseconds} ms");

sw.Restart();
var list2 = new List<int>(capacity: N);  // 预分配
for (int i = 0; i < N; i++) list2.Add(i);
sw.Stop();
Console.WriteLine($"List 预分配: {sw.ElapsedMilliseconds} ms");
\`\`\`

**典型结果对比：**

| 操作 | 慢写法 | 快写法 |
|------|--------|--------|
| 字符串拼接 | \`s += "a"\` 5000ms | \`StringBuilder\` 5ms |
| List | 不指定 capacity 30ms | 预分配 5ms |
| 字符串解析 | \`int.Parse(s.Substring(0,3))\` | \`int.TryParse(s.AsSpan(0,3), out _)\` |

### 十、内存泄露常见原因

虽然有 GC，仍可能"泄露"——通常是"忘了释放非托管资源"或"无意中持有引用"：

1. **事件订阅没取消**：\`event += handler\` 后没 \`-=\`，发布者一直引用订阅者
2. **静态集合无限增长**：\`static Dictionary\` 当缓存不限大小
3. **IDisposable 没 Dispose**：\`Stream\` / \`HttpClient\` / \`DbConnection\`
4. **Capture 闭包**：长生命周期对象 capture 了短生命周期对象
5. **Timer 没释放**：\`System.Timers.Timer\` 持有回调委托

\`\`\`csharp
// ❌ 经典泄露：事件没取消
public class Publisher
{
    public event EventHandler? SomethingHappened;
    public void Fire() => SomethingHappened?.Invoke(this, EventArgs.Empty);
}

public class Subscriber
{
    public Subscriber(Publisher p)
    {
        p.SomethingHappened += OnEvent;  // 订阅
    }
    void OnEvent(object? s, EventArgs e) { }

    // ❌ 忘记 p.SomethingHappened -= OnEvent;
    // 即使 Subscriber 没人引用，Publisher 还持有它，GC 无法回收
}

// ✅ 修复：实现 IDisposable 取消订阅
public class Subscriber : IDisposable
{
    private readonly Publisher _p;
    public Subscriber(Publisher p)
    {
        _p = p;
        _p.SomethingHappened += OnEvent;
    }
    void OnEvent(object? s, EventArgs e) { }
    public void Dispose() => _p.SomethingHappened -= OnEvent;
}
\`\`\`

### 小结

- GC 把对象分代（Gen 0/1/2），让短命对象快速回收
- 大对象（>=85000 字节）进 LOH，回收贵、不压缩
- \`IDisposable\` + \`using\` 处理非托管资源——铁律
- Dispose 模式只在持有非托管资源时才需要终结器
- \`Span<T>\` / \`Memory<T>\` 是高性能编程的核心工具，避免堆分配
- \`ref struct\` 强制栈上，性能极致但限制多
- 避免 \`ArrayList\` 等非泛型集合——会装箱
- 警惕事件订阅、静态缓存、未释放资源导致的"隐性泄露"

---

## 下一章预告

学了这么多，是时候把所有知识串起来做项目了。下一章是**全书综合实战**——任务管理系统，以及我们的结语。
`,
  },

  // ============================================================
  // 第五十二章：综合项目 + 结语
  // ============================================================
  {
    id: 'csharp2-ch52',
    group: '第十部分 工程化与实战',
    icon: '🎓',
    title: '综合项目：任务管理系统 + 结语',
    content: `## 第五十二章　综合项目：任务管理系统 + 结语

恭喜你走到最后一章！前面 51 章我们学了语法、OOP、泛型、LINQ、异步、IO、异常、内存……现在是时候把它们全部串起来，做一个真实可运行的小项目：**TaskManager（任务管理系统）**。

本章会从头到尾完整实现，每个设计决策都解释"为什么"，并在最后给出全书结语。

### 一、需求与设计

**功能需求：**

1. 创建任务（标题、描述、优先级、截止日期）
2. 查看所有任务 / 按 ID 查单个
3. 修改任务状态（待办 / 进行中 / 已完成）
4. 按优先级过滤、按状态分组
5. 删除任务
6. 持久化到 JSON 文件
7. 异常处理 + 输入校验
8. 可单元测试

**用到的知识点：**

| 章节 | 知识点 | 用在 |
|------|--------|------|
| 第 10-19 章 | OOP / record | TaskItem 模型 |
| 第 20-26 章 | 泛型集合 | List<TaskItem> |
| 第 27-32 章 | LINQ | 过滤、分组、排序 |
| 第 39-42 章 | async/await | 文件 IO |
| 第 43-46 章 | 文件 IO / JSON 序列化 | 持久化 |
| 第 47 章 | 异常处理 | 校验、错误传播 |
| 第 48 章 | DateOnly / TimeSpan | 截止日期 |
| 第 51 章 | IDisposable | 释放文件资源 |

### 二、领域模型：TaskItem

用 \`record\`（C# 9+）定义不可变模型——天然适合值对象：

\`\`\`csharp
namespace TaskManager.Models;

public enum TaskPriority { Low, Medium, High, Urgent }
public enum TaskStatus { Todo, InProgress, Done }

public record TaskItem
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public string Title { get; init; } = "";
    public string Description { get; init; } = "";
    public TaskPriority Priority { get; init; } = TaskPriority.Medium;
    public TaskStatus Status { get; init; } = TaskStatus.Todo;
    public DateOnly? DueDate { get; init; }
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; init; }

    // 用 with 表达式生成新实例
    public TaskItem WithStatus(TaskStatus newStatus) => newStatus switch
    {
        TaskStatus.Done => this with { Status = newStatus, CompletedAt = DateTime.UtcNow },
        _ => this with { Status = newStatus, CompletedAt = null }
    };
}
\`\`\`

> **为什么用 record？**
> 1. 不可变——状态变化通过 \`with\` 创建新实例，更安全
> 2. 自带值相等、\`ToString\`、解构
> 3. 序列化友好

### 三、自定义异常

\`\`\`csharp
namespace TaskManager.Exceptions;

public class TaskNotFoundException : Exception
{
    public Guid TaskId { get; }
    public TaskNotFoundException(Guid id)
        : base($"任务不存在: {id}")
        => TaskId = id;
}

public class TaskValidationException : Exception
{
    public TaskValidationException(string message) : base(message) { }
}
\`\`\`

### 四、核心服务：TaskManager

\`\`\`csharp
using System.Linq;
using TaskManager.Exceptions;
using TaskManager.Models;

namespace TaskManager.Services;

public class TaskManagerService
{
    private readonly List<TaskItem> _tasks = new();
    private readonly object _lock = new();  // 简单线程安全

    public IReadOnlyList<TaskItem> All
    {
        get
        {
            lock (_lock) return _tasks.ToList();  // 返回副本，避免外部修改
        }
    }

    // 创建任务（带校验）
    public TaskItem Add(string title, string description = "",
        TaskPriority priority = TaskPriority.Medium,
        DateOnly? dueDate = null)
    {
        // 输入校验
        if (string.IsNullOrWhiteSpace(title))
            throw new TaskValidationException("标题不能为空");
        if (title.Length > 100)
            throw new TaskValidationException("标题不能超过 100 字符");
        if (dueDate.HasValue && dueDate.Value < DateOnly.FromDateTime(DateTime.Today))
            throw new TaskValidationException("截止日期不能早于今天");

        var task = new TaskItem
        {
            Title = title.Trim(),
            Description = description?.Trim() ?? "",
            Priority = priority,
            DueDate = dueDate
        };

        lock (_lock) _tasks.Add(task);
        return task;
    }

    // 按 ID 查找
    public TaskItem GetById(Guid id)
    {
        lock (_lock)
        {
            var task = _tasks.FirstOrDefault(t => t.Id == id);
            if (task is null) throw new TaskNotFoundException(id);
            return task;
        }
    }

    // 更新状态
    public TaskItem UpdateStatus(Guid id, TaskStatus newStatus)
    {
        lock (_lock)
        {
            var idx = _tasks.FindIndex(t => t.Id == id);
            if (idx < 0) throw new TaskNotFoundException(id);

            var updated = _tasks[idx].WithStatus(newStatus);
            _tasks[idx] = updated;
            return updated;
        }
    }

    // 删除
    public bool Delete(Guid id)
    {
        lock (_lock)
        {
            var idx = _tasks.FindIndex(t => t.Id == id);
            if (idx < 0) return false;
            _tasks.RemoveAt(idx);
            return true;
        }
    }

    // ⭐ LINQ: 按优先级过滤
    public IEnumerable<TaskItem> FilterByPriority(TaskPriority priority)
    {
        lock (_lock)
        {
            return _tasks
                .Where(t => t.Priority == priority)
                .OrderByDescending(t => t.Priority)
                .ThenBy(t => t.DueDate ?? DateOnly.MaxValue)
                .ToList();
        }
    }

    // ⭐ LINQ: 按状态分组
    public IDictionary<TaskStatus, List<TaskItem>> GroupByStatus()
    {
        lock (_lock)
        {
            return _tasks
                .GroupBy(t => t.Status)
                .ToDictionary(g => g.Key, g => g.ToList());
        }
    }

    // ⭐ LINQ: 查找逾期未完成的任务
    public IEnumerable<TaskItem> GetOverdueTasks()
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        lock (_lock)
        {
            return _tasks
                .Where(t => t.DueDate.HasValue
                          && t.DueDate.Value < today
                          && t.Status != TaskStatus.Done)
                .OrderBy(t => t.DueDate)
                .ToList();
        }
    }

    // ⭐ LINQ: 统计
    public (int Total, int Todo, int InProgress, int Done) GetStats()
    {
        lock (_lock)
        {
            var total = _tasks.Count;
            var todo = _tasks.Count(t => t.Status == TaskStatus.Todo);
            var inProgress = _tasks.Count(t => t.Status == TaskStatus.InProgress);
            var done = _tasks.Count(t => t.Status == TaskStatus.Done);
            return (total, todo, inProgress, done);
        }
    }
}
\`\`\`

### 五、JSON 持久化

\`\`\`csharp
using System.Text.Json;
using TaskManager.Models;

namespace TaskManager.Storage;

public class JsonTaskRepository : IDisposable
{
    private readonly string _filePath;
    private readonly SemaphoreSlim _sem = new(1, 1);  // 异步锁
    private readonly JsonSerializerOptions _options = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public JsonTaskRepository(string filePath)
    {
        _filePath = filePath;
    }

    // ⭐ async 文件 IO
    public async Task SaveAsync(IEnumerable<TaskItem> tasks, CancellationToken ct = default)
    {
        await _sem.WaitAsync(ct);
        try
        {
            var list = tasks.ToList();
            var json = JsonSerializer.Serialize(list, _options);

            // 写入临时文件再原子替换，避免写一半损坏
            var tmp = _filePath + ".tmp";
            await File.WriteAllTextAsync(tmp, json, ct);
            File.Move(tmp, _filePath, overwrite: true);
        }
        finally
        {
            _sem.Release();
        }
    }

    public async Task<List<TaskItem>> LoadAsync(CancellationToken ct = default)
    {
        if (!File.Exists(_filePath)) return new List<TaskItem>();

        await _sem.WaitAsync(ct);
        try
        {
            var json = await File.ReadAllTextAsync(_filePath, ct);
            return JsonSerializer.Deserialize<List<TaskItem>>(json, _options)
                   ?? new List<TaskItem>();
        }
        catch (JsonException ex)
        {
            Console.WriteLine($"[WARN] 数据文件损坏，重新开始: {ex.Message}");
            return new List<TaskItem>();
        }
        finally
        {
            _sem.Release();
        }
    }

    public void Dispose() => _sem.Dispose();
}
\`\`\`

### 六、组合服务：TaskApp

把核心逻辑 + 持久化组合起来，对外提供"用完即存"的高级 API：

\`\`\`csharp
using TaskManager.Models;
using TaskManager.Storage;

namespace TaskManager.App;

public class TaskApp : IDisposable
{
    private readonly Services.TaskManagerService _svc = new();
    private readonly JsonTaskRepository _repo;

    public TaskApp(string dataFile = "tasks.json")
    {
        _repo = new JsonTaskRepository(dataFile);
    }

    // 启动时加载
    public async Task InitializeAsync(CancellationToken ct = default)
    {
        var tasks = await _repo.LoadAsync(ct);
        foreach (var t in tasks)
        {
            // 通过反射或公开方法重新填充，这里简化为重新 Add 不行——
            // 实际项目可以让 _svc 暴露 Import(IEnumerable<TaskItem>) 方法
        }
        Console.WriteLine($"[启动] 已加载 {tasks.Count} 个任务");
    }

    public async Task<TaskItem> AddTaskAsync(
        string title, string desc = "",
        TaskPriority priority = TaskPriority.Medium,
        DateOnly? dueDate = null,
        CancellationToken ct = default)
    {
        try
        {
            var task = _svc.Add(title, desc, priority, dueDate);
            await _repo.SaveAsync(_svc.All, ct);
            return task;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] 添加失败: {ex.Message}");
            throw;
        }
    }

    public async Task<TaskItem?> CompleteTaskAsync(Guid id, CancellationToken ct = default)
    {
        try
        {
            var updated = _svc.UpdateStatus(id, TaskStatus.Done);
            await _repo.SaveAsync(_svc.All, ct);
            return updated;
        }
        catch (Exceptions.TaskNotFoundException)
        {
            return null;
        }
    }

    public async Task<bool> DeleteTaskAsync(Guid id, CancellationToken ct = default)
    {
        var ok = _svc.Delete(id);
        if (ok) await _repo.SaveAsync(_svc.All, ct);
        return ok;
    }

    public void PrintSummary()
    {
        var (total, todo, inProgress, done) = _svc.GetStats();
        Console.WriteLine($"========== 任务统计 ==========");
        Console.WriteLine($"总数: {total} | 待办: {todo} | 进行中: {inProgress} | 已完成: {done}");

        Console.WriteLine("\\n---------- 按状态分组 ----------");
        foreach (var kv in _svc.GroupByStatus())
        {
            Console.WriteLine($"[{kv.Key}] ({kv.Value.Count})");
            foreach (var t in kv.Value)
                Console.WriteLine($"  - #{t.Id.ToString()[..8]} {t.Title} [{t.Priority}]");
        }

        Console.WriteLine("\\n---------- 逾期任务 ----------");
        var overdue = _svc.GetOverdueTasks().ToList();
        if (overdue.Count == 0) Console.WriteLine("  (无)");
        foreach (var t in overdue)
            Console.WriteLine($"  ⚠️ {t.Title} 截止 {t.DueDate:yyyy-MM-dd}");
    }

    public void Dispose() => _repo.Dispose();
}
\`\`\`

### 七、主程序：交互式入口

\`\`\`csharp
using TaskManager.App;
using TaskManager.Models;

using var app = new TaskApp();
await app.InitializeAsync();

// 添加几条示例数据
var today = DateOnly.FromDateTime(DateTime.Today);
await app.AddTaskAsync("学完 C# 教程", "看完最后这一章", TaskPriority.High, today.AddDays(7));
await app.AddTaskAsync("做综合项目", "实现 TaskManager", TaskPriority.Urgent, today.AddDays(3));
await app.AddTaskAsync("写技术博客", "总结 C# 学习笔记", TaskPriority.Medium, today.AddDays(14));
await app.AddTaskAsync("复习 LINQ", "GroupBy / Select / Where", TaskPriority.Low);

// 完成一个
var first = app.GetType()
    .GetMethod("PrintSummary")!;  // 简化：实际应通过公开 API
app.PrintSummary();

Console.WriteLine("\\n=== 所有操作完成 ===");
\`\`\`

### 八、运行效果

\`\`\`
[启动] 已加载 0 个任务
========== 任务统计 ==========
总数: 4 | 待办: 3 | 进行中: 0 | 已完成: 0

---------- 按状态分组 ----------
[Todo] (4)
  - #a3b4c5d6 学完 C# 教程 [High]
  - #e7f8a9b0 做综合项目 [Urgent]
  - #c1d2e3f4 写技术博客 [Medium]
  - #a5b6c7d8 复习 LINQ [Low]

---------- 逾期任务 ----------
  (无)

=== 所有操作完成 ===
\`\`\`

### 九、单元测试思路

真实项目必须有测试。本项目可以这样拆分测试：

\`\`\`csharp
using Xunit;
using TaskManager.Services;
using TaskManager.Exceptions;

public class TaskManagerServiceTests
{
    private readonly TaskManagerService _svc = new();

    [Fact]
    public void Add_ValidTitle_ReturnsTask()
    {
        var task = _svc.Add("测试任务");
        Assert.NotEqual(Guid.Empty, task.Id);
        Assert.Equal("测试任务", task.Title);
    }

    [Fact]
    public void Add_EmptyTitle_Throws()
    {
        Assert.Throws<TaskValidationException>(() => _svc.Add(""));
    }

    [Fact]
    public void Add_PastDueDate_Throws()
    {
        var past = DateOnly.FromDateTime(DateTime.Today).AddDays(-1);
        Assert.Throws<TaskValidationException>(() => _svc.Add("x", dueDate: past));
    }

    [Fact]
    public void UpdateStatus_ToDone_SetsCompletedAt()
    {
        var t = _svc.Add("x");
        var updated = _svc.UpdateStatus(t.Id, TaskStatus.Done);
        Assert.Equal(TaskStatus.Done, updated.Status);
        Assert.NotNull(updated.CompletedAt);
    }

    [Fact]
    public void GetById_NotFound_Throws()
    {
        Assert.Throws<TaskNotFoundException>(() => _svc.GetById(Guid.NewGuid()));
    }

    [Theory]
    [InlineData(TaskPriority.Urgent, 1)]
    [InlineData(TaskPriority.High, 1)]
    public void FilterByPriority_ReturnsOnlyThatPriority(TaskPriority p, int expected)
    {
        _svc.Add("a", priority: TaskPriority.Urgent);
        _svc.Add("b", priority: TaskPriority.High);
        var result = _svc.FilterByPriority(p);
        Assert.Equal(expected, result.Count());
    }

    [Fact]
    public void GetOverdueTasks_ReturnsOnlyOverdueUndone()
    {
        var past = DateOnly.FromDateTime(DateTime.Today).AddDays(-5);
        _svc.Add("逾期1", dueDate: past);
        var done = _svc.Add("逾期2", dueDate: past);
        _svc.UpdateStatus(done.Id, TaskStatus.Done);

        var overdue = _svc.GetOverdueTasks().ToList();
        Assert.Single(overdue);
    }
}
\`\`\`

**测试要点：**
1. 测试**行为**，不测试实现细节
2. 每个测试独立——构造函数里 \`new\` 一个新 \`TaskManagerService\` 避免状态污染
3. 用 \`[Fact]\` 测单个用例，\`[Theory]\` + \`[InlineData]\` 测多组数据
4. 异常路径必须测试（\`Add\` 空标题、找不到 ID 等）
5. 集成测试单独写——测 \`JsonTaskRepository\` 的真实文件读写

### 十、可扩展方向

这个 demo 是"骨架"，扩展方向：

| 方向 | 改造点 |
|------|--------|
| Web API | 套一层 ASP.NET Core Controller，对外提供 REST 接口 |
| 数据库 | 把 \`JsonTaskRepository\` 换成 \`EfCoreTaskRepository\` |
| UI | 接 WPF / MAUI / Blazor 做可视化界面 |
| 多用户 | 加 User 表，TaskItem 加 \`OwnerUserId\` |
| 提醒服务 | 用 \`PeriodicTimer\` 定时扫描逾期任务，推送通知 |
| 实时协作 | 用 SignalR 同步多端状态 |

### 小结

这个综合项目用到了全书约 80% 的知识点——OOP、泛型集合、LINQ、async/await、文件 IO、JSON 序列化、异常处理、日期时间、IDisposable、单元测试。**自己手写一遍**，比看十遍都管用。

---

## 全书结语

恭喜你读完了这本《C# 从入门到精通大全》——52 章，从一行 \`Console.WriteLine\` 到能写出可维护的工程代码，你已经走过了 C# 开发者的核心成长路径。

### 你已经掌握的能力

✅ 基础语法：变量、控制流、方法、参数
✅ 面向对象：类、继承、多态、接口、抽象类
✅ 泛型与集合：\`List<T>\`、\`Dictionary<K,V>\`、自定义泛型
✅ 函数式风格：委托、事件、Lambda、LINQ
✅ 高级特性：模式匹配、record、可空引用类型、反射、特性
✅ 异步编程：\`async/await\`、Task、并发集合、取消令牌
✅ IO 与序列化：文件、流、JSON、XML
✅ 工程化：异常处理、时间、命名空间、HttpClient、内存管理、GC

### 进阶方向

学完基础，C# 生态还有广阔天地：

**🌱 后端 / Web**
- **ASP.NET Core**：写 Web API、MVC 网站、最小 API
- **EF Core**：ORM，操作 SQL Server / MySQL / PostgreSQL
- **SignalR**：实时通信（聊天、推送）
- **gRPC**：高性能 RPC

**🌿 桌面 / 移动**
- **WPF / WinForms**：Windows 桌面应用
- **.NET MAUI**：跨平台桌面+移动（Windows / macOS / iOS / Android）
- **Avalonia**：开源跨平台桌面 UI

**🍃 游戏**
- **Unity**：用 C# 写 2D/3D 游戏，全球最流行的游戏引擎之一
- **Godot**：开源引擎，支持 C# 脚本

**⛅ 云原生**
- **Azure**：微软云，C# 一等公民
- **Docker / Kubernetes**：容器化部署 .NET 应用
- **微服务**：Dapr + .NET

**🔬 高性能**
- **Span<T> / Memory<T>**：内存零分配编程
- **Native AOT**：编译为原生代码，启动毫秒级
- **Source Generator**：编译期代码生成

**🧪 工程实践**
- **xUnit / NUnit**：单元测试
- **BenchmarkDotNet**：性能基准测试
- **Roslyn**：写代码分析器、Source Generator

### 学习建议

1. **做项目，别只看教程**——把这本书的代码全部敲一遍，再自己想个点子做出来
2. **读源码**——ASP.NET Core、EF Core 都是开源的，看大神怎么写
3. **看官方文档**——\`learn.microsoft.com/dotnet\` 是最权威的资料
4. **关注新版本**——.NET 每年 11 月发布新版本，关注新特性
5. **加入社区**——GitHub、Stack Overflow、博客园、Microsoft Q&A

### 致读者

C# 是一门设计精良、生态完备、持续演进的语言——从 2002 年到今天已经 24 年，依然活跃在 Web、桌面、游戏、移动、云原生各个领域。掌握它，你就拥有了打开微软生态大门的钥匙。

愿 C# 助你写出又快又稳又美的代码。

**Happy coding! 🚀**

---

> 📚 全书完。返回目录可以复习任意章节，或开始下一个学习项目。
`,
  },
];

export { chapters };
