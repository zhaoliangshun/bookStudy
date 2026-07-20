// =============================================================
// C# 从入门到精通大全（终极版）—— 第11批章节
// 第十一部分 异常与日志（共 6 章）
// -------------------------------------------------------------
// 本批包含 6 章：
//   csharp3-ch55 : 第五十五章 异常处理基础
//   csharp3-ch56 : 第五十六章 自定义异常与异常链
//   csharp3-ch57 : 第五十七章 try 高级模式与 using 声明
//   csharp3-ch58 : 第五十八章 ILogger 日志框架
//   csharp3-ch59 : 第五十九章 诊断与性能分析
//   csharp3-ch60 : 第六十章 单元测试基础
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 第五十五章：异常处理基础
  // ============================================================
  {
    id: 'csharp3-ch55',
    group: '第十一部分 异常与日志',
    icon: '🛟',
    title: '第五十五章 异常处理基础',
    content: `## 第五十五章　异常处理基础

异常是程序运行时的"非正常情况"。C# 用 try/catch/finally 处理，让代码既能处理错误，又不让错误吞噬。

### 一、try-catch-finally 基础 ⭐⭐⭐

\`\`\`csharp
try
{
    int[] arr = { 1, 2, 3 };
    int v = arr[10]; // 越界 → 抛 IndexOutOfRangeException
    Console.WriteLine(v);
}
catch (IndexOutOfRangeException ex)
{
    Console.WriteLine($"越界：{ex.Message}");
    Console.WriteLine($"Stack: {ex.StackTrace?.Substring(0, 60)}...");
}
catch (Exception ex) // 兜底
{
    Console.WriteLine($"其他错误：{ex.Message}");
}
finally
{
    Console.WriteLine("无论是否异常都执行（清理资源）");
}
\`\`\`

### 二、异常的"冒泡"机制 ⭐⭐

异常会沿着调用栈向上传播，直到被 catch 捕获或程序崩溃。

\`\`\`csharp
void Level3() { throw new InvalidOperationException("boom!"); }
void Level2() { Level3(); }
void Level1() { Level2(); }

try
{
    Level1();
}
catch (Exception ex)
{
    Console.WriteLine($"捕获：{ex.Message}");
    Console.WriteLine($"方法链：{ex.StackTrace?.Split('\\n').Length} 层");
}
\`\`\`

### 三、Exception 类的关键属性 ⭐⭐⭐

\`\`\`csharp
try
{
    throw new ArgumentException("参数错误", "paramName");
}
catch (Exception ex)
{
    Console.WriteLine($"Message       = {ex.Message}");
    Console.WriteLine($"Type          = {ex.GetType().FullName}");
    Console.WriteLine($"Source        = {ex.Source}");
    Console.WriteLine($"TargetSite    = {ex.TargetSite?.Name}");
    Console.WriteLine($"StackTrace    = {ex.StackTrace?.Substring(0, Math.Min(50, ex.StackTrace?.Length ?? 0))}");
    Console.WriteLine($"InnerException= {ex.InnerException?.Message ?? "(none)"}");
    Console.WriteLine($"Data          = {ex.Data.Count} items");
}
\`\`\`

### 四、常见内置异常 ⭐⭐⭐

\`\`\`csharp
// 各种异常触发
void Trigger(string type)
{
    switch (type)
    {
        case "arg": throw new ArgumentException("参数无效");
        case "argn": throw new ArgumentNullException("name");
        case "argr": throw new ArgumentOutOfRangeException("index");
        case "inv": throw new InvalidOperationException("操作无效");
        case "nimpl": throw new NotImplementedException("未实现");
        case "nsupp": throw new NotSupportedException("不支持");
        case "io": throw new IOException("IO 错误");
        case "fmt": throw new FormatException("格式错误");
        case "ovf": throw new OverflowException("溢出");
        case "div": int x = 1 / 0; break; // DivideByZeroException
    }
}

foreach (var t in new[] { "arg", "argn", "argr", "inv", "nimpl", "nsupp", "io", "fmt", "ovf", "div" })
{
    try { Trigger(t); }
    catch (Exception ex) { Console.WriteLine($"{t,-6} => {ex.GetType().Name}: {ex.Message}"); }
}
\`\`\`

### 五、抛出异常 throw ⭐⭐

\`\`\`csharp
int Divide(int a, int b)
{
    if (b == 0) throw new DivideByZeroException("除数不能为零");
    return a / b;
}

try
{
    Console.WriteLine(Divide(10, 0));
}
catch (DivideByZeroException ex)
{
    Console.WriteLine(ex.Message);
}
\`\`\`

### 六、rethrow：保留堆栈 ⭐⭐

\`\`\`csharp
void Inner()
{
    try { throw new InvalidOperationException("内部错误"); }
    catch (Exception ex)
    {
        // ❌ 错：new Exception(ex.Message, ex) 改变了堆栈起点
        // ✅ 对：throw; 保留原始堆栈
        throw;
    }
}

try { Inner(); }
catch (Exception ex)
{
    Console.WriteLine(ex.StackTrace?.Split('\\n')[0]);
}
\`\`\`

### 七、try 块的范围 ⭐⭐

\`\`\`csharp
// ❌ 不好：try 包含太多代码
try
{
    Connect();
    Login();
    Query();
    Disconnect();
}
catch (Exception ex) { /* 不确定哪儿抛的 */ }

// ✅ 好：try 只包可能抛异常的最小代码块
Connect();
try { Login(); }
catch (LoginException) { /* 处理登录失败 */ }
Query();
Disconnect();
\`\`\`

### 八、try-catch 的性能成本 ⭐

\`\`\`csharp
// 异常抛出有性能成本（构造堆栈），不要用异常控制正常流程

// ❌ 错：用异常做判断
try
{
    int v = dict[key];
}
catch (KeyNotFoundException) { return false; }

// ✅ 对：用 TryXxx 模式
if (dict.TryGetValue(key, out int v)) { /* ... */ } else { return false; }
\`\`\`

### 九、聚合异常：AggregateException ⭐

\`\`\`csharp
// Task.WhenAll 失败时所有异常被打包成 AggregateException
try
{
    await Task.WhenAll(
        Task.Run(() => throw new Exception("A")),
        Task.Run(() => throw new Exception("B"))
    );
}
catch (Exception ex)
{
    if (ex is AggregateException agg)
    {
        Console.WriteLine($"聚合异常 {agg.InnerExceptions.Count} 个：");
        foreach (var inner in agg.InnerExceptions)
            Console.WriteLine($"  - {inner.Message}");
    }
    else
    {
        Console.WriteLine($"单个异常: {ex.Message}");
    }
}
\`\`\`

### 十、ExceptionDispatchInfo 跨线程抛 ⭐⭐

\`\`\`csharp
Exception? caught = null;
var t = Task.Run(() =>
{
    try { throw new InvalidOperationException("worker failed"); }
    catch (Exception ex) { caught = ex; }
});

await t;
try
{
    ExceptionDispatchInfo.Capture(caught!).Throw();
}
catch (InvalidOperationException ex)
{
    Console.WriteLine($"从 worker 抛出到 main: {ex.Message}");
    Console.WriteLine($"堆栈起点：{ex.StackTrace?.Split('\\n')[0].Trim()}");
}
\`\`\`

### 十一、关键总结

| 关键字 | 用途 |
| --- | --- |
| \`try {}\` | 保护可能抛异常的代码 |
| \`catch (T ex)\` | 捕获指定类型 |
| \`finally {}\` | 无论是否异常都执行 |
| \`throw\` | 抛出异常 |
| \`throw;\` | rethrow 保留堆栈 |
| \`throw new T(...)\` | 构造并抛出 |
| \`ex.Message/StackTrace/InnerException\` | 异常信息 |

- **异常用于"异常情况"**，不是正常控制流
- **不要吞异常**（空的 catch）
- **具体 catch 在前**，兜底 \`catch (Exception)\` 在最后
- **rethrow 用 \`throw;\`**，不用 \`throw ex;\`

`,
  },

  // ============================================================
  // 第五十六章：自定义异常与异常链
  // ============================================================
  {
    id: 'csharp3-ch56',
    group: '第十一部分 异常与日志',
    icon: '🧩',
    title: '第五十六章 自定义异常与异常链',
    content: `## 第五十六章　自定义异常与异常链

业务代码常需要自定义异常来表达领域错误。本章讲解如何正确设计自定义异常。

### 一、最简单的自定义异常 ⭐⭐

\`\`\`csharp
// 推荐：以 Exception 结尾
public class OrderNotFoundException : Exception
{
    public int OrderId { get; }

    // 必须实现的两个构造函数
    public OrderNotFoundException() { }
    public OrderNotFoundException(string message) : base(message) { }
    public OrderNotFoundException(string message, Exception inner) : base(message, inner) { }

    // 推荐：业务字段
    public OrderNotFoundException(int orderId)
        : base($"订单 {orderId} 不存在")
    {
        OrderId = orderId;
    }
}

void FindOrder(int id)
{
    if (id <= 0) throw new OrderNotFoundException(id);
}

try
{
    FindOrder(0);
}
catch (OrderNotFoundException ex)
{
    Console.WriteLine($"业务异常：{ex.Message}, OrderId={ex.OrderId}");
}
\`\`\`

### 二、推荐：实现三个标准构造函数 ⭐⭐

\`\`\`csharp
public class BusinessException : Exception
{
    public string ErrorCode { get; }

    // .NET 异常设计规范要求这 3 个构造函数：
    public BusinessException() : base() { }
    public BusinessException(string message) : base(message) { }
    public BusinessException(string message, Exception innerException) : base(message, innerException) { }

    public BusinessException(string errorCode, string message) : base(message)
    {
        ErrorCode = errorCode;
    }
}
\`\`\`

### 三、异常链：包装底层异常 ⭐⭐⭐

\`\`\`csharp
public class DataAccessException : Exception
{
    public DataAccessException(string message, Exception inner) : base(message, inner) { }
}

void SaveToDb()
{
    try
    {
        // 模拟数据库操作
        throw new IOException("connection lost");
    }
    catch (IOException ex)
    {
        // 包装成领域异常，保留原始异常
        throw new DataAccessException("保存订单失败", ex);
    }
}

try
{
    SaveToDb();
}
catch (DataAccessException ex)
{
    Console.WriteLine($"上层: {ex.Message}");
    Console.WriteLine($"底层: {ex.InnerException?.GetType().Name}: {ex.InnerException?.Message}");
}
\`\`\`

### 四、异常的序列化 ⭐

\`\`\`csharp
// 自定义异常如果需要跨 AppDomain 序列化，加 [Serializable]
[Serializable]
public class NetworkException : Exception
{
    public int StatusCode { get; }

    public NetworkException() { }
    public NetworkException(string message) : base(message) { }
    public NetworkException(string message, Exception inner) : base(message, inner) { }

    // 序列化构造函数
    protected NetworkException(
        System.Runtime.Serialization.SerializationInfo info,
        System.Runtime.Serialization.StreamingContext context) : base(info, context)
    {
        StatusCode = info.GetInt32(nameof(StatusCode));
    }

    public override void GetObjectData(System.Runtime.Serialization.SerializationInfo info,
        System.Runtime.Serialization.StreamingContext context)
    {
        base.GetObjectData(info, context);
        info.AddValue(nameof(StatusCode), StatusCode);
    }
}
\`\`\`

### 五、领域异常设计模式 ⭐⭐⭐

\`\`\`csharp
// 1. 业务异常：用户/调用方可恢复
public class InsufficientBalanceException : Exception
{
    public decimal Balance { get; }
    public decimal Required { get; }
    public InsufficientBalanceException(decimal balance, decimal required)
        : base($"余额 {balance} 不足，需要 {required}")
    {
        Balance = balance; Required = required;
    }
}

// 2. 系统异常：基础设施问题，调用方通常无法处理
public class DatabaseUnavailableException : Exception
{
    public DatabaseUnavailableException(string message) : base(message) { }
    public DatabaseUnavailableException(string message, Exception inner) : base(message, inner) { }
}

void Transfer(decimal balance, decimal amount)
{
    if (balance < amount) throw new InsufficientBalanceException(balance, amount);
    // 模拟数据库失败
    throw new DatabaseUnavailableException("DB down", new TimeoutException());
}

try
{
    Transfer(50m, 100m);
}
catch (InsufficientBalanceException ex)
{
    Console.WriteLine($"业务：{ex.Message}"); // 用户提示
}
catch (DatabaseUnavailableException ex)
{
    Console.WriteLine($"系统：{ex.Message}"); // 记录日志 + 5xx
}
\`\`\`

### 六、用 Result 模式替代异常 ⭐⭐

\`\`\`csharp
// 某些场景下用 Result 对象比抛异常更友好
public record Result<T>(bool IsSuccess, T? Value, string? Error)
{
    public static Result<T> Ok(T value) => new(true, value, null);
    public static Result<T> Fail(string error) => new(false, default, error);
}

Result<int> ParseIntSafe(string s)
{
    if (int.TryParse(s, out int v)) return Result<int>.Ok(v);
    return Result<int>.Fail($"不是有效整数: {s}");
}

var r = ParseIntSafe("abc");
if (r.IsSuccess) Console.WriteLine($"值={r.Value}");
else Console.WriteLine($"错={r.Error}");
\`\`\`

> **💡 建议**：高频失败（如解析、查找）用 \`TryXxx\` 或 \`Result<T>\`；低频、不可恢复的失败用异常。

### 七、Guard Clauses：参数校验 ⭐⭐⭐

\`\`\`csharp
// 用 ArgumentException.ThrowIfXXX（.NET 8 引入）
void SetAge(int age)
{
    ArgumentOutOfRangeException.ThrowIfNegative(age);
    ArgumentOutOfRangeException.ThrowIfGreaterThan(age, 150);
    Console.WriteLine($"年龄设为 {age}");
}

try { SetAge(-1); }
catch (ArgumentOutOfRangeException ex) { Console.WriteLine(ex.Message); }

try { SetAge(200); }
catch (ArgumentOutOfRangeException ex) { Console.WriteLine(ex.Message); }

void SetName(string? name)
{
    ArgumentNullException.ThrowIfNull(name);
    ArgumentException.ThrowIfNullOrWhiteSpace(name);
    Console.WriteLine($"名字 = {name}");
}

try { SetName(""); }
catch (ArgumentException ex) { Console.WriteLine(ex.Message); }
\`\`\`

### 八、关键总结

- 自定义异常继承 \`Exception\`，以 \`Exception\` 结尾
- 实现 3 个标准构造函数
- 用 \`InnerException\` 链保留底层异常
- 业务异常 vs 系统异常要分清
- 优先用 \`TryXxx\` 模式或 \`Result<T>\` 而非异常（高频失败）
- .NET 8 引入 \`ArgumentException.ThrowIf*\`，简化参数校验

`,
  },

  // ============================================================
  // 第五十七章：try 高级模式与 using 声明
  // ============================================================
  {
    id: 'csharp3-ch57',
    group: '第十一部分 异常与日志',
    icon: '🔄',
    title: '第五十七章 try 高级模式与 using 声明',
    content: `## 第五十七章　try 高级模式与 using 声明

C# 提供了多种 try 变体和 using 语法糖，让资源管理、异常处理更优雅。

### 一、using 语句（老语法） ⭐⭐⭐

\`\`\`csharp
// 经典 using
using (var fs = new FileStream("/tmp/test.txt", FileMode.Create))
using (var sw = new StreamWriter(fs, Encoding.UTF8, leaveOpen: false))
{
    sw.WriteLine("Hello");
} // 离开 using 块时自动调用 sw.Dispose() → fs.Dispose()
Console.WriteLine("资源已释放");
\`\`\`

### 二、using 声明（新语法） ⭐⭐⭐

\`\`\`csharp
// C# 8+ 引入：using 声明，作用域结束时自动释放
{
    using var fs = new FileStream("/tmp/test2.txt", FileMode.Create);
    using var sw = new StreamWriter(fs, Encoding.UTF8, leaveOpen: false);
    sw.WriteLine("Hello using 声明");
} // 块结束时按反序自动 Dispose

Console.WriteLine("OK");
\`\`\`

### 三、IAsyncDisposable 与 await using ⭐⭐

\`\`\`csharp
// .NET Core 3+ 引入异步释放
await using var fs = new FileStream("/tmp/test3.txt", FileMode.Create,
    FileAccess.Write, FileShare.None, 4096, useAsync: true);
byte[] data = Encoding.UTF8.GetBytes("async dispose");
await fs.WriteAsync(data);
Console.WriteLine("写入完成");
// 块结束时调用 await fs.DisposeAsync()
\`\`\`

### 四、自定义可释放对象 ⭐⭐⭐

\`\`\`csharp
class MyResource : IDisposable
{
    public string Name { get; }
    private bool _disposed;

    public MyResource(string name)
    {
        Name = name;
        Console.WriteLine($"[{Name}] 已创建");
    }

    public void Use() => Console.WriteLine($"[{Name}] 使用中...");

    public void Dispose()
    {
        if (_disposed) return;
        Console.WriteLine($"[{Name}] 释放资源");
        _disposed = true;
        GC.SuppressFinalize(this);
    }

    ~MyResource()
    {
        Console.WriteLine($"[{Name}] 被 GC 回收（未 Dispose）");
        Dispose();
    }
}

{
    using var r = new MyResource("A");
    r.Use();
}
Console.WriteLine("---");
{
    using var r = new MyResource("B");
    r.Use();
    r.Dispose(); // 显式释放（幂等）
    r.Dispose(); // 二次释放安全
}
\`\`\`

### 五、释放模式：完整版 ⭐⭐

\`\`\`csharp
class FileHandler : IDisposable, IAsyncDisposable
{
    private FileStream? _fs;
    private bool _disposed;

    public FileHandler(string path)
    {
        _fs = new FileStream(path, FileMode.Create);
    }

    // 同步释放
    public void Dispose()
    {
        if (_disposed) return;
        _fs?.Dispose();
        _fs = null;
        _disposed = true;
        GC.SuppressFinalize(this);
    }

    // 异步释放（推荐）
    public async ValueTask DisposeAsync()
    {
        if (_disposed) return;
        if (_fs != null) await _fs.DisposeAsync();
        _fs = null;
        _disposed = true;
        GC.SuppressFinalize(this);
    }
}

{
    await using var fh = new FileHandler("/tmp/handler.txt");
    Console.WriteLine("文件已打开");
}
// 块结束时自动 await DisposeAsync()
Console.WriteLine("已释放");
\`\`\`

### 六、try-finally vs using ⭐

\`\`\`csharp
// 1. try-finally
FileStream? fs = null;
try
{
    fs = new FileStream("/tmp/a.txt", FileMode.Create);
    // ...
}
finally
{
    fs?.Dispose();
}

// 2. using（等价但简洁）
using var fs2 = new FileStream("/tmp/a.txt", FileMode.Create);
// ...
\`\`\`

> **✅ 推荐**：用 using 替代 try-finally，除非需要更精细的控制。

### 七、catch when 过滤 ⭐⭐⭐

\`\`\`csharp
// 仅在条件满足时捕获
try
{
    int v = int.Parse("abc");
}
catch (FormatException ex) when (ex.Message.Contains("input"))
{
    Console.WriteLine("格式异常且消息含 input");
}
catch (FormatException)
{
    Console.WriteLine("其他格式异常");
}

// 实际用法：仅记录特定异常
try { throw new HttpRequestException("503 Service Unavailable"); }
catch (HttpRequestException ex) when (ex.Message.Contains("503"))
{
    Console.WriteLine("服务端暂时不可用，稍后重试");
}
catch (HttpRequestException ex)
{
    Console.WriteLine($"网络错误: {ex.Message}");
}
\`\`\`

### 八、catch 变量重用 ⭐

\`\`\`csharp
// C# 9+：catch 后变量作用域更宽
try { /* ... */ }
catch (Exception ex)
{
    Log(ex);
    // 后续代码仍能引用 ex
    Console.WriteLine(ex.Message);
}
\`\`\`

### 九、迭代器的 try/finally ⭐⭐

\`\`\`csharp
// yield return 中也能用 try-finally（不能 try-catch）
IEnumerable<int> Numbers()
{
    try
    {
        yield return 1;
        yield return 2;
        yield return 3;
    }
    finally
    {
        Console.WriteLine("迭代结束（无论正常/异常/提前退出）");
    }
}

foreach (var n in Numbers())
{
    Console.WriteLine($"got {n}");
    if (n == 2) break; // finally 仍会执行
}
Console.WriteLine("---");
foreach (var n in Numbers()) Console.WriteLine($"got {n}"); // 全部迭代
\`\`\`

### 十、本地函数 + try ⭐

\`\`\`csharp
void Process()
{
    int SafeDivide(int a, int b) // 本地函数
    {
        try { return a / b; }
        catch (DivideByZeroException) { return 0; }
    }

    Console.WriteLine(SafeDivide(10, 0)); // 0
    Console.WriteLine(SafeDivide(10, 2)); // 5
}

Process();
\`\`\`

### 十一、关键总结

- \`using var x = ...\`：作用域结束自动释放
- \`await using var x = ...\`：异步释放
- 自定义 \`IDisposable\`/\`IAsyncDisposable\`
- 释放幂等：多次调用 \`Dispose\` 安全
- \`catch ... when (cond)\`：条件捕获
- \`try-finally\` 仍用于 \`yield\` 迭代器
- 用 \`ArgumentException.ThrowIf*\` 简化参数校验

`,
  },

  // ============================================================
  // 第五十八章：ILogger 日志框架
  // ============================================================
  {
    id: 'csharp3-ch58',
    group: '第十一部分 异常与日志',
    icon: '📝',
    title: '第五十八章 ILogger 日志框架',
    content: `## 第五十八章　ILogger 日志框架

\`Microsoft.Extensions.Logging\` 是 .NET 官方日志抽象。它不直接写日志，而是通过 provider 写入到目标（控制台、文件、数据库等）。

### 一、日志级别 ⭐⭐⭐

\`\`\`csharp
using Microsoft.Extensions.Logging;

// 日志级别（从轻到重）
// Trace = 0  极详细的诊断
// Debug = 1  调试信息
// Information = 2  正常运行信息
// Warning = 3  警告
// Error = 4   错误
// Critical = 5 严重
// None = 6    关闭

Console.WriteLine($"Trace       = {LogLevel.Trace}");
Console.WriteLine($"Information = {LogLevel.Information}");
Console.WriteLine($"Critical    = {LogLevel.Critical}");
\`\`\`

### 二、创建 Logger 最简方式 ⭐⭐⭐

\`\`\`csharp
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

// 1. NullLogger：不输出
ILogger logger1 = NullLogger.Instance;
logger1.LogInformation("这条不会显示");

// 2. 控制台 Logger（最简单演示）
using var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.AddConsole();
    builder.SetMinimumLevel(LogLevel.Trace);
});

ILogger logger = loggerFactory.CreateLogger("MyApp");

logger.LogTrace("Trace 消息");
logger.LogDebug("Debug 消息");
logger.LogInformation("Info 消息");
logger.LogWarning("Warn 消息");
logger.LogError("Error 消息");
logger.LogCritical("Critical 消息");
\`\`\`

### 三、结构化日志 ⭐⭐⭐

\`\`\`csharp
ILogger logger = loggerFactory.CreateLogger("Demo");

// 简单消息
logger.LogInformation("用户登录");

// 结构化（推荐）：{Placeholder} + 参数
logger.LogInformation("用户 {UserId} 在 {Time} 登录", 1001, DateTime.Now);

// 高性能版本：使用 LoggerMessage
logger.LogInformation("订单 {OrderId} 金额 {Amount:C}", 100, 99.99m);
\`\`\`

### 四、占位符与作用域 ⭐⭐

\`\`\`csharp
// 占位符支持 {Property} 语法
logger.LogInformation("用户 {UserId} 来自 {City}", 1001, "杭州");
logger.LogInformation("计算 {A} + {B} = {Result}", 1, 2, 3);

// 数字格式化
logger.LogInformation("价格: {Price:C}", 99.99m);
logger.LogInformation("数量: {Count:N0}", 1234567);
logger.LogInformation("时间: {Time:o}", DateTime.Now);

// 作用域
using (logger.BeginScope("OrderId:{OrderId}", 1001))
{
    logger.LogInformation("开始处理订单");
    logger.LogInformation("完成处理");
} // 作用域结束后日志不再带 OrderId
\`\`\`

### 五、EventId 与分类 ⭐

\`\`\`csharp
// EventId：给日志分组
var loginEvent = new EventId(1001, "UserLogin");
var logoutEvent = new EventId(1002, "UserLogout");

logger.LogInformation(loginEvent, "用户登录");
logger.LogInformation(logoutEvent, "用户登出");

// 自定义 Category
var orderLogger = loggerFactory.CreateLogger("OrderService");
orderLogger.LogInformation("订单处理开始");
\`\`\`

### 六、配置日志过滤器 ⭐⭐

\`\`\`csharp
using var lf = LoggerFactory.Create(builder =>
{
    builder.AddConsole();
    // 全局最低
    builder.SetMinimumLevel(LogLevel.Information);
    // 特定分类
    builder.AddFilter("Microsoft", LogLevel.Warning);
    builder.AddFilter("OrderService", LogLevel.Trace);
});

ILogger log = lf.CreateLogger("OrderService");
log.LogTrace("OrderService 的 trace");
log.LogInformation("OrderService 的 info");
\`\`\`

### 七、LoggerMessage 高性能源生成器 ⭐⭐

\`\`\`csharp
// .NET 6+ 引入源生成器版本，零反射
public static partial class Log
{
    [LoggerMessage(EventId = 1001, Level = LogLevel.Information, Message = "用户 {UserId} 登录")]
    public static partial void UserLogin(this ILogger logger, int userId);

    [LoggerMessage(EventId = 1002, Level = LogLevel.Warning, Message = "订单 {OrderId} 超时 {Timeout}ms")]
    public static partial void OrderTimeout(this ILogger logger, int orderId, int timeout);
}

ILogger logger = loggerFactory.CreateLogger("App");
logger.UserLogin(1001);
logger.OrderTimeout(99, 5000);
\`\`\`

> **💡 优势**：编译期生成、无反射、性能比 \`LogInformation\` 高数倍。

### 八、添加多个 Provider ⭐⭐

\`\`\`csharp
using var lf = LoggerFactory.Create(builder =>
{
    builder.AddConsole();
    builder.AddDebug(); // 输出到调试器
    // builder.AddEventLog(); // Windows 事件日志
    // builder.AddFile("logs/app.txt"); // 需要 Serilog 等第三方
    builder.SetMinimumLevel(LogLevel.Debug);
});

ILogger log = lf.CreateLogger("Multi");
log.LogInformation("会同时输出到控制台和调试器");
\`\`\`

### 九、从配置加载（appsettings.json） ⭐

\`\`\`csharp
// 实际项目用 Configuration 加载
// dotnet add package Microsoft.Extensions.Configuration.Json
/*
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning"
    }
  }
}
*/

// builder.AddConfiguration(config.GetSection("Logging"));
\`\`\`

### 十、记录异常 ⭐⭐

\`\`\`csharp
try
{
    throw new InvalidOperationException("测试异常");
}
catch (Exception ex)
{
    // ✅ 第一个参数传 Exception
    logger.LogError(ex, "处理失败：UserId={UserId}", 1001);
    logger.LogCritical(ex, "系统级错误");
}
\`\`\`

### 十一、第三方日志库 ⭐

\`\`\`csharp
// 主流选择：
// 1. Serilog：最流行，结构化日志、丰富 sink
//    dotnet add package Serilog.AspNetCore
//    dotnet add package Serilog.Sinks.Console
//    dotnet add package Serilog.Sinks.File
// 2. NLog：老牌，配置灵活
// 3. log4net：传统日志框架
Console.WriteLine("第三方：Serilog / NLog / log4net");
\`\`\`

### 十二、关键总结

- 日志级别：\`Trace < Debug < Information < Warning < Error < Critical\`
- \`LogInformation\` / \`LogWarning\` / \`LogError\` 是常用 API
- 结构化日志用占位符 \`{Name}\` + 参数
- 作用域用 \`BeginScope\` 添加上下文
- \`LoggerMessage\` 源生成器提供零反射高性能日志
- 多 Provider 可同时输出到多个目标
- 记录异常时把 Exception 放第一个参数

`,
  },

  // ============================================================
  // 第五十九章：诊断与性能分析
  // ============================================================
  {
    id: 'csharp3-ch59',
    group: '第十一部分 异常与日志',
    icon: '🩺',
    title: '第五十九章 诊断与性能分析',
    content: `## 第五十九章　诊断与性能分析

. NET 提供 \`System.Diagnostics\` 命名空间用于测量时间、监控性能、跟踪事件。

### 一、Stopwatch：测量时间 ⭐⭐⭐

\`\`\`csharp
using System.Diagnostics;

var sw = Stopwatch.StartNew();
// 模拟工作
long sum = 0;
for (int i = 0; i < 10_000_000; i++) sum += i;
sw.Stop();

Console.WriteLine($"耗时 = {sw.ElapsedMilliseconds} ms");
Console.WriteLine($"Ticks = {sw.ElapsedTicks}");
Console.WriteLine($"合计 = {sum}");
\`\`\`

### 二、Stopwatch 高级用法 ⭐⭐

\`\`\`csharp\n// 多次测量取最佳\nvoid Bench(Action act, int n = 5)\n{\n    var times = new List<long>();\n    for (int i = 0; i < n; i++)\n    {\n        var sw = Stopwatch.StartNew();\n        act();\n        sw.Stop();\n        times.Add(sw.ElapsedMilliseconds);\n    }\n    Console.WriteLine($\"min={times.Min()}ms, max={times.Max()}ms, avg={times.Average():F1}ms\");\n}\n\nBench(() =>\n{\n    long s = 0;\n    for (int i = 0; i < 1_000_000; i++) s += i;\n});\n\n// 获取高精度时间戳（不依赖 Stopwatch）\nlong ticks = Stopwatch.GetTimestamp();\ndouble seconds = (double)ticks / Stopwatch.Frequency;\nConsole.WriteLine($\"高精度：{seconds * 1e6:F2} us\");\n\`\`\`\n\n### 三、Process 性能监控 ⭐⭐\n\n\`\`\`csharp\nusing var p = Process.GetCurrentProcess();\nConsole.WriteLine($\"进程名     = {p.ProcessName}\");\nConsole.WriteLine($\"PID        = {p.Id}\");\nConsole.WriteLine($\"内存(工作集) = {p.WorkingSet64 / 1024 / 1024} MB\");\nConsole.WriteLine($\"内存(虚拟)  = {p.VirtualMemorySize64 / 1024 / 1024} MB\");\nConsole.WriteLine($\"线程数      = {p.Threads.Count}\");\nConsole.WriteLine($\"启动时间    = {p.StartTime:yyyy-MM-dd HH:mm:ss}\");\nConsole.WriteLine($\"CPU 时间    = {p.TotalProcessorTime.TotalSeconds:F2} s\");\n\n// GC 信息\nConsole.WriteLine($\"GC 0 代     = {GC.GetGeneration(p)}\");\nConsole.WriteLine($\"GC 总分配   = {GC.GetTotalMemory(false) / 1024} KB\");\n\`\`\`\n\n### 四、GC 性能监控 ⭐⭐⭐\n\n\`\`\`csharp\nlong before = GC.GetTotalMemory(true);\n// 大量分配\nvar list = new List<byte[]>();\nfor (int i = 0; i < 100; i++) list.Add(new byte[10_000]);\nlong after = GC.GetTotalMemory(false);\nConsole.WriteLine($\"分配 = {(after - before) / 1024} KB\");\n\n// 强制 GC\nGC.Collect();\nGC.WaitForPendingFinalizers();\nGC.Collect();\nConsole.WriteLine($\"GC 后 = {GC.GetTotalMemory(true) / 1024} KB\");\n\n// 各代 GC 次数\nConsole.WriteLine($\"Gen0 = {GC.CollectionCount(0)}\");\nConsole.WriteLine($\"Gen1 = {GC.CollectionCount(1)}\");\nConsole.WriteLine($\"Gen2 = {GC.CollectionCount(2)}\");\n\nlist = null;\nGC.Collect();\nConsole.WriteLine($\"释放后 Gen0 = {GC.CollectionCount(0)}\");\n\`\`\`\n\n### 五、PerformanceCounter（Windows 特定） ⭐\n\n\`\`\`csharp\n// Windows 性能计数器（仅 Windows）\n// dotnet add package System.Diagnostics.PerformanceCounter\nConsole.WriteLine(\"Windows 性能计数器：CPU、内存、IO 等\");\n\`\`\`\n\n### 六、Trace 和 Debug 输出 ⭐\n\n\`\`\`csharp\nusing System.Diagnostics;\n\nTrace.WriteLine(\"Trace 输出\");\nTrace.WriteLineIf(true, \"条件 Trace\");\nDebug.WriteLine(\"Debug 输出（仅 Debug 构建）\");\n\n// 输出到 Listeners\nTrace.Listeners.Add(new TextWriterTraceListener(Console.Out));\nTrace.WriteLine(\"通过 listener 输出\");\n\nTrace.Flush();\n\`\`\`\n\n### 七、EventSource：结构化追踪 ⭐⭐⭐\n\n\`\`\`csharp\n[EventSource(Name = \"MyApp\")]\npublic class MyEventSource : EventSource\n{\n    public static readonly MyEventSource Log = new();\n\n    [Event(1, Level = EventLevel.Informational)]\n    public void RequestStart(string url) => WriteEvent(1, url);\n\n    [Event(2, Level = EventLevel.Informational)]\n    public void RequestEnd(string url, long elapsedMs) => WriteEvent(2, url, elapsedMs);\n}\n\nMyEventSource.Log.RequestStart(\"https://example.com\");\nvar sw = Stopwatch.StartNew();\nThread.Sleep(50);\nsw.Stop();\nMyEventSource.Log.RequestEnd(\"https://example.com\", sw.ElapsedMilliseconds);\n\nConsole.WriteLine(\"EventSource 已发送事件\");\n\`\`\`\n\n### 八、Activity：分布式追踪 ⭐⭐\n\n\`\`\`csharp\nusing System.Diagnostics;\n\n// .NET 5+ 引入的 OpenTelemetry 兼容追踪\nusing var activity = new Activity(\"ProcessOrder\").Start();\nactivity?.SetTag(\"order.id\", 1001);\nactivity?.SetTag(\"order.amount\", 99.99);\n\n// 嵌套\nusing (var sub = new Activity(\"Validate\").Start())\n{\n    sub?.SetTag(\"validation.type\", \"schema\");\n    Thread.Sleep(20);\n}\n\nusing (var sub2 = new Activity(\"Save\").Start())\n{\n    sub2?.SetTag(\"db.system\", \"postgresql\");\n    Thread.Sleep(30);\n}\n\nConsole.WriteLine($\"TraceId = {Activity.Current?.TraceId}\");\nConsole.WriteLine($\"SpanId  = {Activity.Current?.SpanId}\");\nConsole.WriteLine($\"Duration = {Activity.Current?.Duration.TotalMilliseconds:F1}ms\");\n\`\`\`\n\n### 九、dotnet-counters：实时监控 ⭐⭐\n\n\`\`\`bash\n# 在终端运行：\n# dotnet tool install -g dotnet-counters\n# dotnet counters monitor --process-id <PID>\n#\n# 输出：\n#   [System.Runtime]\n#     cpu-usage                                    12.5\n#     working-set                              32.5 MB\n#     gc-heap-size                              8.2 MB\n#     gen0-gc-count                                 5\n#     gen1-gc-count                                 2\n#     gen2-gc-count                                 0\nConsole.WriteLine(\"命令行工具：dotnet-counters, dotnet-trace, dotnet-dump\");\n\`\`\`\n\n### 十、dotnet-trace 和 dotnet-dump ⭐\n\n\`\`\`bash\n# 收集调用栈采样：\n# dotnet trace collect --process-id <PID> --duration 00:00:30\n#\n# 内存转储：\n# dotnet dump collect --process-id <PID>\n# dotnet dump analyze core_xxx.dump\n# > dumpheap -stat\n# > gcroot <address>\nConsole.WriteLine(\"性能诊断三件套：counters / trace / dump\");\n\`\`\`\n\n### 十一、关键总结\n\n- \`Stopwatch\`：精确测量时间\n- \`Process\`：进程信息（CPU、内存、线程）\n- \`GC\` 类：GC 统计\n- \`EventSource\`：结构化追踪事件\n- \`Activity\`：分布式追踪（OpenTelemetry 兼容）\n- \`dotnet-counters\`：实时监控\n- \`dotnet-trace\`：CPU 采样\n- \`dotnet-dump\`：内存分析\n\n`,
  },

  // ============================================================
  // 第六十章：单元测试基础
  // ============================================================
  {
    id: 'csharp3-ch60',
    group: '第十一部分 异常与日志',
    icon: '🧪',
    title: '第六十章 单元测试基础',
    content: `## 第六十章　单元测试基础

单元测试是保障代码质量的"安全网"。本章以 xUnit 为例讲解 .NET 单元测试。

### 一、xUnit 项目结构 ⭐⭐

\`\`\`bash\n# 创建 xUnit 项目\n# dotnet new xunit -n MyApp.Tests\n# cd MyApp.Tests\n# dotnet add reference ../MyApp/MyApp.csproj\n# dotnet test\nConsole.WriteLine(\"xUnit 是 .NET 官方推荐的测试框架\");\n\`\`\`\n\n### 二、Fact 与 Theory ⭐⭐⭐\n\n\`\`\`csharp\n// 顶级语句不能直接写 Fact 演示，下面展示测试类写法\n// (在 xUnit 项目中)\n\n/*\npublic class CalculatorTests\n{\n    [Fact]\n    public void Add_TwoNumbers_ReturnsSum()\n    {\n        // Arrange（准备）\n        var calc = new Calculator();\n\n        // Act（执行）\n        int result = calc.Add(2, 3);\n\n        // Assert（断言）\n        Assert.Equal(5, result);\n    }\n\n    [Theory]\n    [InlineData(1, 2, 3)]\n    [InlineData(-1, 1, 0)]\n    [InlineData(0, 0, 0)]\n    [InlineData(100, 200, 300)]\n    public void Add_ManyCases(int a, int b, int expected)\n    {\n        var calc = new Calculator();\n        Assert.Equal(expected, calc.Add(a, b));\n    }\n}\n*/\n\n// 这里用 Record + 字典模拟断言\nrecord TestCase(string Name, int A, int B, int Expected);\nvar cases = new[]\n{\n    new TestCase(\"2+3\", 2, 3, 5),\n    new TestCase(\"-1+1\", -1, 1, 0),\n    new TestCase(\"0+0\", 0, 0, 0)\n};\n\nint Add(int a, int b) => a + b;\n\nint passed = 0;\nforeach (var c in cases)\n{\n    int actual = Add(c.A, c.B);\n    bool ok = actual == c.Expected;\n    if (ok) passed++;\n    Console.WriteLine($\"{(ok ? \"✓\" : \"✗\")} {c.Name}: 期望 {c.Expected} 实际 {actual}\");\n}\nConsole.WriteLine($\"通过 {passed}/{cases.Length}\");\n\`\`\`\n\n### 三、Assert 常用 API ⭐⭐⭐\n\n\`\`\`csharp\n// xUnit Assert 类的常见方法（演示语法）\nvoid Demo()\n{\n    Assert.Equal(5, 5);                    // 相等\n    Assert.NotEqual(1, 2);                 // 不等\n    Assert.True(true);                     // true\n    Assert.False(false);                   // false\n    Assert.Null(null);                     // null\n    Assert.NotNull(\"x\");                   // 非 null\n    Assert.Contains(\"hello\", \"hello world\"); // 包含子串\n    Assert.StartsWith(\"He\", \"Hello\");      // 前缀\n    Assert.Empty(new int[0]);              // 空集合\n    Assert.NotEmpty(new[] { 1 });          // 非空\n    Assert.InRange(5, 1, 10);              // 范围内\n    Assert.Throws<InvalidOperationException>(() => throw new InvalidOperationException());\n    await Assert.ThrowsAsync<HttpRequestException>(async () => { await Task.Yield(); throw new HttpRequestException(); });\n}\n\nConsole.WriteLine(\"Assert API 已就绪\");\n\`\`\`\n\n### 四、生命周期：构造函数与 IDisposable ⭐⭐\n\n\`\`\`csharp\n/*\npublic class DatabaseTests : IDisposable\n{\n    private readonly Database _db;\n\n    public DatabaseTests()\n    {\n        // 每个测试方法前都执行（构造函数 = Setup）\n        _db = new Database(\":memory:\");\n        _db.InitSchema();\n    }\n\n    public void Dispose()\n    {\n        // 每个测试方法后都执行\n        _db.Dispose();\n    }\n\n    [Fact]\n    public void Insert_Works()\n    {\n        _db.Insert(\"key\", \"value\");\n        Assert.Equal(\"value\", _db.Get(\"key\"));\n    }\n}\n*/\n\nConsole.WriteLine(\"每个测试方法 new 一个新实例，结束后 Dispose()\");\n\`\`\`\n\n### 五、IClassFixture：跨测试共享资源 ⭐⭐\n\n\`\`\`csharp\n/*\npublic class DatabaseFixture : IDisposable\n{\n    public Database Db { get; }\n    public DatabaseFixture() { Db = new Database(\":memory:\"); Db.InitSchema(); }\n    public void Dispose() => Db.Dispose();\n}\n\npublic class UserTests : IClassFixture<DatabaseFixture>\n{\n    private readonly Database _db;\n    public UserTests(DatabaseFixture fixture) { _db = fixture.Db; }\n\n    [Fact]\n    public void AddUser() { _db.AddUser(\"alice\"); Assert.Equal(1, _db.UserCount); }\n}\n*/\n\nConsole.WriteLine(\"IClassFixture：所有测试共享一个 fixture 实例\");\n\`\`\`\n\n### 六、CollectionFixture：跨类共享 ⭐\n\n\`\`\`csharp\n/*\n[CollectionDefinition(\"Database collection\")]\npublic class DatabaseCollection : ICollectionFixture<DatabaseFixture> { }\n\n[Collection(\"Database collection\")]\npublic class UserTests { /* uses shared Db */ }\n\n[Collection(\"Database collection\")]\npublic class OrderTests { /* uses shared Db */ }\n*/\n\nConsole.WriteLine(\"ICollectionFixture：多个测试类共享同一 fixture\");\n\`\`\`\n\n### 七、Mock：Moq 框架 ⭐⭐\n\n\`\`\`csharp\n// dotnet add package Moq\n/*\npublic interface IEmailSender { void Send(string to, string body); }\n\n[Fact]\npublic void Register_SendsWelcome()\n{\n    // Arrange\n    var mock = new Mock<IEmailSender>();\n    var service = new UserService(mock.Object);\n\n    // Act\n    service.Register(\"alice@example.com\");\n\n    // Assert\n    mock.Verify(s => s.Send(\"alice@example.com\", It.IsAny<string>()), Times.Once);\n}\n*/\n\nConsole.WriteLine(\"Moq：模拟接口，验证调用\");\n\`\`\`\n\n### 八、测试命名规范 ⭐\n\n\`\`\`csharp\n// 推荐：MethodName_StateUnderTest_ExpectedBehavior\n// [Fact]\n// public void Add_NegativeAndPositive_ReturnsSum()\n// [Fact]\n// public void Parse_EmptyString_ThrowsArgumentException()\n// [Fact]\n// public void Transfer_InsufficientBalance_ThrowsException()\nConsole.WriteLine(\"命名：方法_条件_期望\");\n\`\`\`\n\n### 九、运行测试 ⭐⭐\n\n\`\`\`bash\n# 终端命令：\n# dotnet test                       # 运行所有测试\n# dotnet test --filter \"FullyQualifiedName~Add\"   # 按名过滤\n# dotnet test --logger \"console;verbosity=detailed\"\n# dotnet test /p:CollectCoverage=true /p:CoverageReportFormat=cobertura\n# dotnet tool install -g dotnet-coverage\nConsole.WriteLine(\"dotnet test 是测试入口\");\n\`\`\`\n\n### 十、关键总结\n\n- \`[Fact]\`：单个测试\n- \`[Theory] + [InlineData(...)\`：参数化测试\n- \`Assert.Equal/True/Throws/Contains/...\`：断言\n- 构造函数 = \`SetUp\`，\`Dispose\` = \`TearDown\`\n- \`IClassFixture<T>\`：类内共享资源\n- \`ICollectionFixture<T>\`：跨类共享\n- \`Mock<T>\`（Moq）：模拟依赖\n- 命名：\`方法_场景_期望\`\n- 覆盖率：coverlet + reportgenerator\n\n**测试金字塔**：\n- 70% 单元测试（快、独立）\n- 20% 集成测试（DB、外部服务）\n- 10% E2E 测试（浏览器、用户旅程）\n\n`,
  },
];

export { chapters };
