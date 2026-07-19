// C# 教程书 - 第 12 批章节（第十部分 异常处理与调试）
// 版本：.NET 8 LTS / C# 12，全部使用顶级语句
// 共 4 章：异常处理、自定义异常与异常策略、调试技术、日志与诊断

const chapters = [
  {
    id: 'csharp4-ch60',
    group: '第十部分 异常处理与调试',
    icon: '🚨',
    title: '异常处理',
    content: `## 异常处理

异常（Exception）是 .NET 运行时在程序遇到非正常情况时抛出的对象。C# 通过 \`try / catch / finally\` 三件套来捕获、处理和清理异常。良好的异常处理让程序在出错时依然可控、可诊断、可恢复，而不是直接崩溃或返回错误数据。

### 1. try / catch / finally 语法

- \`try\`：包裹可能抛出异常的代码块。
- \`catch\`：捕获特定类型的异常并处理。可以写多个 catch，按"从具体到一般"的顺序排列。
- \`finally\`：无论是否发生异常都会执行的清理块，常用于释放资源。

\`\`\`csharp
try
{
    // 可能出错的代码
}
catch (SpecificException ex)
{
    // 处理特定异常
}
catch (Exception ex)
{
    // 兜底处理
}
finally
{
    // 总是执行的清理
}
\`\`\`

### 2. Exception 基类的核心属性

所有异常都继承自 \`System.Exception\`，常用属性：

- \`Message\`：异常的友好描述文本。
- \`StackTrace\`：调用栈信息字符串，定位异常抛出位置。
- \`InnerException\`：导致当前异常的原始异常（嵌套场景）。
- \`Source\`：抛出异常的应用程序或对象名。
- \`HelpLink\`：帮助文档链接，可自定义。
- \`HResult\`：32 位错误码，常用于 COM 互操作。
- \`Data\`：键值对字典，附加自定义上下文。

### 3. throw 与 throw ex 的关键区别

- \`throw;\`：重抛当前异常，**保留原始调用栈**，便于诊断。
- \`throw ex;\`：重抛但**重置调用栈**，导致堆栈从 catch 处重新开始，丢失真正的抛出点。

**永远优先使用 \`throw;\`**，除非你确实想隐藏内部细节。

### 4. 异常过滤器 when（C# 6+）

\`catch (Exception ex) when (condition)\` 只有当条件为真时才进入 catch 块。优点：

- 不进入 catch，调用栈保持原样（便于上层捕获）。
- 可以基于异常属性、环境状态灵活过滤。
- 多个 \`when\` 让 catch 分支更清晰。

### 5. 常见异常类型

| 异常 | 触发场景 |
| --- | --- |
| \`NullReferenceException\` | 访问 null 对象成员 |
| \`ArgumentNullException\` | 方法参数为 null 且不允许 |
| \`ArgumentOutOfRangeException\` | 参数超出有效范围 |
| \`IndexOutOfRangeException\` | 数组索引越界 |
| \`InvalidOperationException\` | 对象状态不支持当前操作 |
| \`NotImplementedException\` | 方法未实现（占位） |
| \`NotSupportedException\` | 调用了不支持的特性 |
| \`DivideByZeroException\` | 整数除以零 |
| \`OverflowException\` | 算术溢出（checked 场景） |
| \`FormatException\` | 字符串格式不匹配 |
| \`InvalidCastException\` | 显式转换失败 |

### 6. 自定义异常

继承 \`Exception\` 即可。建议：

- 命名以 \`Exception\` 结尾。
- 提供三个构造函数：无参、带 message、带 message + innerException。
- 标记 \`[Serializable]\` 以支持跨域/跨进程序列化（传统做法）。

### 7. finally 与 using 的关系

\`using\` 语句是 \`try / finally\` 的语法糖，自动调用 \`IDisposable.Dispose()\`。等价于：

\`\`\`csharp
using (var fs = new FileStream(...)) { /* 使用 */ }
// 等价于
var fs = new FileStream(...);
try { /* 使用 */ } finally { fs.Dispose(); }
\`\`\`

C# 8+ 还支持 \`using var\` 声明，作用域结束时自动释放。

### 8. 异常传播规则

- 异常沿调用栈向上传播，直到被 catch 或到达顶层导致程序终止。
- async/await 中异常被封装进 Task，await 时重新抛出。
- \`async void\` 中的异常无法被捕获，会直接进 \`AppDomain.UnhandledException\`，应尽量避免 \`async void\`。

### 9. 全局未处理异常

- \`AppDomain.CurrentDomain.UnhandledException\`：捕获所有未处理异常（包括非 CLR 异常）。
- \`TaskScheduler.UnobservedTaskException\`：Task 异常未被观察时触发（默认 .NET 4.5+ 不再让进程崩溃）。
- ASP.NET Core 中用 \`UseExceptionHandler\` 中间件统一处理。

### 10. 异常处理原则

1. **不要捕获你无法处理的异常**。
2. **不要吞异常**（空 catch 是代码坏味道）。
3. **不要用异常做正常流程控制**（性能差且语义混乱）。
4. **优先使用 Try 模式**（\`int.TryParse\`）处理预期失败。
5. **总是记录异常上下文**（参数、用户 ID、操作名）。
6. **在合适的层级处理**，让底层抛、高层处理。

异常是设计契约的一部分，合理的异常策略让代码既能优雅降级，又能快速定位问题。
`,
    code: `// C# 12 顶级语句 - 异常处理完整演示
// 演示：try/catch/finally、throw vs throw ex、when 过滤器、自定义异常、InnerException

using System;
using System.IO;

// ===== 1. 最基本的 try/catch/finally =====
try
{
    Console.WriteLine("=== 1. try/catch/finally 基础 ===");
    int[] numbers = { 1, 2, 3 };
    // 故意访问越界索引，触发 IndexOutOfRangeException
    int value = numbers[10]; // 索引越界
    Console.WriteLine($"不会执行到这里: {value}");
}
catch (IndexOutOfRangeException ex)
{
    // 捕获特定异常：数组索引越界
    Console.WriteLine($"捕获到索引越界: {ex.Message}");
}
catch (Exception ex)
{
    // 兜底捕获：处理所有其他异常
    Console.WriteLine($"兜底捕获: {ex.Message}");
}
finally
{
    // 无论是否异常都会执行，常用于资源清理
    Console.WriteLine("finally 块执行：清理资源");
}

// ===== 2. throw vs throw ex 对比 =====
Console.WriteLine("\\n=== 2. throw vs throw ex ===");
try
{
    DangerousCall(); // 调用会抛异常的方法
}
catch (Exception ex)
{
    // 打印堆栈：观察是 InnerMethod 还是 RethrowMethod 抛出
    Console.WriteLine($"捕获到异常: {ex.Message}");
    Console.WriteLine($"堆栈前两行:\\n{ex.StackTrace?.Split('\\n').Take(2).Aggregate("", (a, b) => a + b + "\\n")}");
}

// 嵌套调用链：InnerMethod 抛出 -> RethrowMethod 捕获重抛
static void DangerousCall()
{
    try
    {
        InnerMethod(); // 真正抛异常的地方
    }
    catch (Exception)
    {
        // throw;  // ✅ 保留原始堆栈（推荐）
        throw;       // 重抛但保留调用栈
        // throw ex; // ❌ 会重置堆栈，丢失 InnerMethod 信息
    }
}

static void InnerMethod()
{
    throw new InvalidOperationException("InnerMethod 中发生了非法操作"); // 真正的抛出点
}

// ===== 3. 异常过滤器 when =====
Console.WriteLine("\\n=== 3. when 异常过滤器 ===");
try
{
    // 模拟根据 HTTP 状态码抛出不同异常
    int httpStatus = 404;
    throw httpStatus switch
    {
        404 => new NotFoundException("资源不存在"),
        500 => new ServerErrorException("服务器内部错误"),
        _ => new InvalidOperationException($"未知状态码: {httpStatus}")
    };
}
catch (NotFoundException ex) when (ex.Message.Contains("资源"))
{
    // 只有当异常消息包含"资源"时才进入此 catch
    Console.WriteLine($"[when 过滤命中] {ex.Message}");
}
catch (Exception ex) when (LogFilter(ex))
{
    // 先调用 LogFilter，返回 false 时不会进入 catch，异常继续传播
    Console.WriteLine($"不会执行这里");
}

// 过滤器辅助方法：记录日志但不拦截
static bool LogFilter(Exception ex)
{
    Console.WriteLine($"[过滤器日志] 异常类型: {ex.GetType().Name}");
    return false; // 返回 false，异常继续向上传播
}

// ===== 4. 自定义异常 InvalidUserException =====
Console.WriteLine("\\n=== 4. 自定义异常 ===");
try
{
    Login("guest", "wrong-password"); // 模拟登录失败
}
catch (InvalidUserException ex)
{
    Console.WriteLine($"登录失败: {ex.Message}");
    Console.WriteLine($"用户名: {ex.UserName}");
    Console.WriteLine($"错误码: {ex.ErrorCode}");
    if (ex.InnerException is not null)
    {
        // 查看内部异常（嵌套异常）
        Console.WriteLine($"内部异常: {ex.InnerException.Message}");
    }
}

// 登录方法：失败时抛出自定义异常
static void Login(string userName, string password)
{
    if (userName != "admin")
    {
        // 抛出带 InnerException 的自定义异常
        throw new InvalidUserException(
            userName,                          // 自定义字段：用户名
            1001,                              // 自定义字段：错误码
            $"用户 {userName} 不存在",          // 异常消息
            new ArgumentException("用户名不匹配", nameof(userName)) // 内部异常
        );
    }
}

// ===== 5. finally 用于资源释放 =====
Console.WriteLine("\\n=== 5. finally 资源释放 ===");
FileStream? fs = null;
try
{
    fs = new FileStream("test.txt", FileMode.Create);
    fs.WriteByte(65); // 写入字符 'A'
    Console.WriteLine("文件写入成功");
}
catch (IOException ex)
{
    Console.WriteLine($"IO 异常: {ex.Message}");
}
finally
{
    // 确保 FileStream 一定被关闭
    fs?.Dispose();
    Console.WriteLine("FileStream 已释放");
}

// ===== 6. 多重 catch 顺序 =====
Console.WriteLine("\\n=== 6. 多重 catch 顺序（具体到一般）===");
try
{
    object obj = "hello";
    int num = (int)obj; // 触发 InvalidCastException
}
catch (InvalidCastException ex)
{
    // 必须在 Exception 之前，否则编译错误
    Console.WriteLine($"类型转换失败: {ex.Message}");
}
catch (SystemException ex)
{
    // 系统异常基类
    Console.WriteLine($"系统异常: {ex.Message}");
}
catch (Exception ex)
{
    // 最通用的异常基类，必须放最后
    Console.WriteLine($"通用异常: {ex.Message}");
}

// ===== 自定义异常定义 =====
// 继承 Exception，标记 Serializable，提供 3 个构造函数
[Serializable]
public class InvalidUserException : Exception
{
    // 自定义字段：用户名
    public string UserName { get; }
    // 自定义字段：业务错误码
    public int ErrorCode { get; }

    // 构造函数 1：无参
    public InvalidUserException() : base("无效用户") { }

    // 构造函数 2：仅消息
    public InvalidUserException(string message) : base(message) { }

    // 构造函数 3：消息 + 内部异常
    public InvalidUserException(string message, Exception innerException)
        : base(message, innerException) { }

    // 构造函数 4：自定义字段
    public InvalidUserException(string userName, int errorCode, string message, Exception? innerException = null)
        : base(message, innerException)
    {
        UserName = userName;     // 保存用户名
        ErrorCode = errorCode;   // 保存错误码
    }
}

// 其他自定义异常用于演示 when 过滤器
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}

public class ServerErrorException : Exception
{
    public ServerErrorException(string message) : base(message) { }
}
`,
    lang: 'cs',
  },
  {
    id: 'csharp4-ch61',
    group: '第十部分 异常处理与调试',
    icon: '🛡️',
    title: '自定义异常与异常策略',
    content: `## 自定义异常与异常策略

异常不只是报错工具，它是程序错误处理策略的核心。本节讨论如何设计自定义异常、什么时候用异常、什么时候用返回值，以及现代 C# 中流行的函数式错误处理模式。

### 1. 自定义异常最佳实践

一个合格的自定义异常应当：

- 继承 \`Exception\`（或更具体的基类如 \`InvalidOperationException\`）。
- 命名以 \`Exception\` 结尾，语义清晰。
- 提供三个标准构造函数：无参、message、message + innerException。
- 标记 \`[Serializable]\` 并实现反序列化构造函数（跨进程/跨域场景）。
- 添加业务字段（如 \`ErrorCode\`）。
- 不要在异常中放敏感数据（密码、Token），因为异常会被日志记录。

### 2. DomainException 领域异常

DDD 中常定义一个 \`DomainException\` 基类，所有领域错误继承它，便于在应用层统一处理。例如 \`UserNotFoundException\`、\`InsufficientBalanceException\`。

### 3. ErrorCode 错误码模式

异常里携带 \`ErrorCode\` 字段，让前端/API 消费方按码处理，而不是解析 \`Message\` 字符串。例如：

\`\`\`csharp
throw new BusinessException(ErrorCode.UserNotFound, "用户 ID=123 不存在");
\`\`\`

错误码集中定义在枚举或常量类中，便于维护和国际化。

### 4. Result<T, TError> 函数式错误处理

异常适合"意外失败"，但"预期失败"（如用户输入错误、业务规则拒绝）用返回值更合适。函数式风格的 \`Result<T>\` 类型让错误成为返回值的一部分：

\`\`\`csharp
public abstract record Result<T>
{
    public record Ok(T Value) : Result<T>;
    public record Err(string Error) : Result<T>;
}
\`\`\`

调用方必须显式处理两种情况，编译器会强制你考虑错误路径，避免"忘记 try/catch"导致崩溃。

### 5. Panic vs Expected Error

- **Panic（不可恢复）**：内存耗尽、配置错误、状态损坏 → 抛异常终止流程。
- **Expected Error（可预期）**：用户名已存在、余额不足、文件不存在 → 用 Result 或 Try 模式返回。

区分两者是错误处理设计的核心判断。

### 6. checked 关键字与算术溢出

默认 C# 整数运算不检查溢出（溢出会"环绕"）。用 \`checked\` 块或编译选项 \`<CheckForOverflowUnderflow>true\` 启用检查，溢出时抛 \`OverflowException\`：

\`\`\`csharp
checked
{
    int max = int.MaxValue;
    int overflow = max + 1; // 抛 OverflowException
}
\`\`\`

\`unchecked\` 反向关闭检查。

### 7. Try 模式

.NET BCL 大量使用 Try 模式避免异常：

- \`int.TryParse(string, out int)\`
- \`Dictionary.TryGetValue(key, out value)\`
- \`Uri.TryCreate\`

返回 \`bool\` 表示成功，\`out\` 参数输出实际值。C# 7+ 支持 \`out var\` 内联声明。

### 8. 不捕获 Exception 基类的原则

\`catch (Exception ex)\` 会吞掉所有异常（包括 \`OutOfMemoryException\` 这种不应恢复的），通常只在以下场景使用：

- 顶层兜底（如 Main 函数、API 中间件）。
- 一定要重新抛出或记录后重新抛出。
- 在 finally 之前清理资源。

业务代码应捕获**具体异常类型**。

### 9. ConfigureAwait(false) 与异常传播

异步代码中 \`ConfigureAwait(false)\` 不影响异常传播，但避免了上下文捕获，库代码应使用。异常仍会被包装进 Task，await 时重新抛出。

### 10. async void 的异常陷阱

\`async void\` 方法抛出的异常**无法被调用方 catch**，会直接进 \`AppDomain.UnhandledException\` 导致进程崩溃。规则：

- 事件处理器（必须 async void）外，**永远用 async Task**。
- async void 中要 try/catch 所有异常并记录。

### 11. 异常日志记录

在 catch 中记录异常时，记录完整 \`ex.ToString()\`（含堆栈、内部异常），而非只 \`ex.Message\`。结构化日志应包含：

- 异常类型全名
- Message
- StackTrace
- InnerException 链
- 上下文（用户、请求 ID、参数）

### 12. 异常策略总结

| 场景 | 策略 |
| --- | --- |
| 预期业务失败 | \`Result<T>\` 或 Try 模式 |
| 不可恢复错误 | 抛异常，让上层兜底 |
| 跨层错误传递 | 包装为领域异常 + InnerException |
| 资源释放 | try/finally 或 using |
| 公共 API 边界 | catch + 转换为友好错误 |
| 库代码内部 | 直接抛，不要吞 |

合理的异常策略让代码既能优雅降级，又能快速定位问题。
`,
    code: `// C# 12 顶级语句 - 自定义异常与异常策略演示
// 演示：Result<T> 类型、BusinessException(ErrorCode)、Try 模式、checked、Result 链式调用

using System;
using System.Collections.Generic;

// ===== 1. Result<T> 函数式错误处理 =====
Console.WriteLine("=== 1. Result<T> 函数式错误处理 ===");

// 调用返回 Result 的方法
var result = ParseAge("25");
switch (result)
{
    case Result<int>.Ok ok:
        Console.WriteLine($"解析成功，年龄: {ok.Value}");
        break;
    case Result<int>.Err err:
        Console.WriteLine($"解析失败: {err.Error}");
        break;
}

// 链式调用：Bind 把多个 Result 串联起来
var finalResult = ParseAge("30")
    .Bind(age => ValidateAge(age))      // 校验年龄范围
    .Bind(age => SaveAge(age));          // 模拟保存
Console.WriteLine($"链式结果: {finalResult}");

// 解析方法：返回 Result 而非抛异常
static Result<int> ParseAge(string input)
{
    // 使用 Try 模式：int.TryParse 避免抛 FormatException
    if (int.TryParse(input, out int age))
    {
        return new Result<int>.Ok(age); // 成功：包装为 Ok
    }
    return new Result<int>.Err($"无法解析年龄: {input}"); // 失败：包装为 Err
}

// 校验方法：返回 Result，不抛异常
static Result<int> ValidateAge(int age)
{
    if (age < 0 || age > 150)
    {
        return new Result<int>.Err($"年龄超出范围: {age}");
    }
    return new Result<int>.Ok(age);
}

// 保存方法：模拟保存，可能抛 BusinessException
static Result<int> SaveAge(int age)
{
    // 内部用异常，边界转换为 Result
    try
    {
        if (age == 999)
        {
            // 抛出带错误码的业务异常
            throw new BusinessException(ErrorCode.DatabaseUnavailable, "数据库不可用");
        }
        Console.WriteLine($"  [模拟] 已保存年龄 {age} 到数据库");
        return new Result<int>.Ok(age);
    }
    catch (BusinessException ex)
    {
        // 异常转 Result：在边界把异常转为返回值
        return new Result<int>.Err($"[{ex.ErrorCode}] {ex.Message}");
    }
}

// ===== 2. Try 模式：TryParse / TryGetValue =====
Console.WriteLine("\\n=== 2. Try 模式 ===");

// int.TryParse：避免抛 FormatException
if (int.TryParse("abc", out int parsed))
{
    Console.WriteLine($"解析成功: {parsed}");
}
else
{
    Console.WriteLine("解析失败：abc 不是有效整数");
}

// Dictionary.TryGetValue：避免抛 KeyNotFoundException
var cache = new Dictionary<string, string>
{
    ["token"] = "abc123",
    ["userId"] = "42"
};
if (cache.TryGetValue("token", out string? token))
{
    Console.WriteLine($"获取 token: {token}");
}
else
{
    Console.WriteLine("token 不存在");
}

// ===== 3. checked 关键字与溢出 =====
Console.WriteLine("\\n=== 3. checked 溢出检查 ===");
try
{
    checked
    {
        int max = int.MaxValue;       // int 最大值 2147483647
        int overflow = max + 1;        // 溢出：抛 OverflowException
        Console.WriteLine($"不会执行: {overflow}");
    }
}
catch (OverflowException ex)
{
    Console.WriteLine($"捕获溢出异常: {ex.Message}");
}

// unchecked：显式关闭检查（默认行为）
unchecked
{
    int max = int.MaxValue;
    int wrapped = max + 1;             // 环绕为负数，不抛异常
    Console.WriteLine($"unchecked 溢出环绕: {wrapped}");
}

// ===== 4. BusinessException + ErrorCode =====
Console.WriteLine("\\n=== 4. BusinessException 与错误码 ===");
try
{
    TransferMoney(100, 50); // 余额不足场景
}
catch (BusinessException ex)
{
    Console.WriteLine($"业务异常: 错误码={ex.ErrorCode}, 消息={ex.Message}");
}

// 转账方法：余额不足抛 BusinessException
static void TransferMoney(decimal amount, decimal balance)
{
    if (amount > balance)
    {
        throw new BusinessException(
            ErrorCode.InsufficientBalance,                          // 错误码
            $"余额不足: 需要 {amount}, 仅有 {balance}",              // 消息
            new InvalidOperationException("账户余额检查失败")        // 内部异常
        );
    }
}

// ===== 5. 异常转 Result：边界处理 =====
Console.WriteLine("\\n=== 5. 边界异常转 Result ===");
var r = SafeDivide(10, 0);
Console.WriteLine($"10/0 = {r}");

// 安全除法：捕获异常转为 Result
static Result<decimal> SafeDivide(int a, int b)
{
    try
    {
        if (b == 0)
        {
            throw new DivideByZeroException(); // 触发异常
        }
        return new Result<decimal>.Ok((decimal)a / b);
    }
    catch (DivideByZeroException ex)
    {
        return new Result<decimal>.Err($"除零错误: {ex.Message}");
    }
}

// ===== 类型定义 =====

// Result<T> 抽象基类：用 record 表示不可变
public abstract record Result<T>
{
    // 成功分支：携带值
    public sealed record Ok(T Value) : Result<T>;

    // 失败分支：携带错误信息
    public sealed record Err(string Error) : Result<T>;

    // Bind 方法：链式调用，成功才继续，失败直接传播
    public Result<TU> Bind<TU>(Func<T, Result<TU>> next)
        => this switch
        {
            Ok ok => next(ok.Value),     // 成功：调用下一个函数
            Err err => new Result<TU>.Err(err.Error), // 失败：直接传播错误
            _ => throw new InvalidOperationException()
        };

    // ToString 便于调试
    public override string ToString() => this switch
    {
        Ok ok => $"Ok({ok.Value})",
        Err err => $"Err({err.Error})",
        _ => base.ToString() ?? ""
    };
}

// 错误码枚举：集中管理业务错误码
public enum ErrorCode
{
    None = 0,
    UserNotFound = 1001,
    InsufficientBalance = 1002,
    DatabaseUnavailable = 1003,
    InvalidInput = 1004
}

// 业务异常基类：携带错误码
[Serializable]
public class BusinessException : Exception
{
    // 错误码：让消费方按码处理
    public ErrorCode ErrorCode { get; }

    public BusinessException() : base() { }

    public BusinessException(string message) : base(message) { }

    public BusinessException(string message, Exception inner) : base(message, inner) { }

    // 自定义构造函数：错误码 + 消息
    public BusinessException(ErrorCode code, string message) : base(message)
    {
        ErrorCode = code;
    }

    // 自定义构造函数：错误码 + 消息 + 内部异常
    public BusinessException(ErrorCode code, string message, Exception inner) : base(message, inner)
    {
        ErrorCode = code;
    }
}
`,
    lang: 'cs',
  },
  {
    id: 'csharp4-ch62',
    group: '第十部分 异常处理与调试',
    icon: '🐛',
    title: '调试技术',
    content: `## 调试技术

调试是开发中最日常的活动之一。.NET 提供了丰富的调试 API、特性和命令行工具，从断点调试到性能分析全覆盖。本节系统介绍 C# 调试技术栈。

### 1. Debugger 类

\`System.Diagnostics.Debugger\` 提供与调试器交互的能力：

- \`Debugger.Break()\`：在代码中硬编码断点。调试器附加时暂停；未附加时弹窗询问是否启动调试器。
- \`Debugger.Launch()\`：触发"附加调试器"对话框，常用于 Windows 服务、IIS 等无法直接 F5 的场景。
- \`Debugger.IsAttached\`：判断当前是否在调试器中，可用于条件行为。
- \`Debugger.Log(level, category, message)\`：向调试器输出窗口写日志。

### 2. DebuggerStepThrough 特性

标记在方法/类上，告诉调试器**单步跳过**（F10 直接跳过，不进入）。常用于：

- 简单的属性 getter/setter。
- 生成的代码（如 designer.cs）。
- 第三方库的工具方法。

类似的还有：

- \`DebuggerNonUserCode\`：标记为"非用户代码"，我的代码外继续。
- \`DebuggerHidden\`：完全隐藏，不显示堆栈帧。

### 3. Conditional("DEBUG") 特性

标记在方法上，**仅在指定符号定义时才编译调用**。\`DEBUG\` 是 Debug 构建默认符号。

\`\`\`csharp
[Conditional("DEBUG")]
static void LogDebug(string msg) => Console.WriteLine(msg);
\`\`\`

Release 构建中调用 \`LogDebug\` 的代码会被编译器**完全移除**（连参数求值都不执行），比 \`#if DEBUG\` 更优雅。

### 4. Debug 类

\`System.Diagnostics.Debug\` 仅在 DEBUG 构建生效：

- \`Debug.Assert(condition)\`：条件为 false 时弹窗（WinForms）或终止（Console）。
- \`Debug.WriteLine(message)\`：输出到调试器的 Output 窗口。
- \`Debug.Indent()\` / \`Debug.Unindent()\`：缩进控制。

Release 构建中所有 Debug 调用被移除，零开销。

### 5. Trace 类

\`Trace\` 在 Debug 和 Release 都生效，适合生产环境诊断：

- \`Trace.Assert\`、\`Trace.WriteLine\`：与 Debug 同名方法语义一致。
- \`TraceListeners\`：可配置多个监听器（控制台、文件、事件日志）。
- 通过 \`app.config\` 或代码配置。

### 6. TraceListener

\`TraceListener\` 是日志输出的接收端：

- \`DefaultTraceListener\`：默认，输出到调试器。
- \`ConsoleTraceListener\`：输出到控制台。
- \`TextWriterTraceListener\`：输出到文件或流。
- \`EventLogTraceListener\`：写入 Windows 事件日志。
- 自定义：继承 \`TraceListener\` 重写 \`WriteLine\`。

### 7. DebuggerDisplay 特性

控制调试器鼠标悬停时显示的文本：

\`\`\`csharp
[DebuggerDisplay("Name={Name}, Age={Age}")]
class Person { public string Name; public int Age; }
\`\`\`

调试时悬停在变量上看到 \`Name=Alice, Age=30\` 而非 \`{Person}\`，极大提升调试体验。

### 8. DebuggerTypeProxy 与 DebuggerBrowsable

- \`DebuggerTypeProxy\`：指定一个代理类，调试器展示代理类的属性而非原类型。
- \`DebuggerBrowsable\`：控制成员在调试器 Watch 窗口的显示（Never / RootHidden / Collapsed）。

### 9. IDE 调试器功能

- **断点**：F9 切换，可设置条件、命中次数、过滤器。
- **条件断点**：满足表达式才中断，如 \`user.Age > 100\`。
- **日志断点（Tracepoint）**：不中断，只输出消息，相当于临时插桩。
- **Watch 窗口**：监视变量、表达式，支持属性求值。
- **Immediate Window**：运行时执行任意表达式，如 \`? list.Count\`。
- **Call Stack**：调用栈窗口，查看层层调用关系，双击跳转。
- **Parallel Stacks**：并行堆栈，多线程调试利器。
- **Threads 窗口**：查看所有线程状态，切换线程上下文。
- **Locals / Autos**：当前作用域变量 / 自动选取的变量。
- **Diagnostic Tools**：CPU、内存、事件实时图表。

### 10. 命令行诊断工具

.NET 提供一组强大的 CLI 工具（基于 \`System.Diagnostics.Metrics\` 和 \`EventPipe\`）：

- \`dotnet-dump\`：采集进程内存转储（heap dump），离线分析。
- \`dotnet-trace\`：采集 CPU 采样、GC 事件，生成 \`.nettrace\` 文件。
- \`dotnet-counters\`：实时监视性能计数器（CPU、GC、ThreadPool）。
- \`dotnet-gcdump\`：采集堆对象统计，文件小适合线上。
- \`dotnet-symbol\`：下载符号文件便于分析。

安装：\`dotnet tool install -g dotnet-trace\` 等。

### 11. 调试技巧

- **二分法定位**：用断点 + 条件快速缩小问题范围。
- **异常断点**：在"异常设置"中勾选特定异常类型，抛出即中断。
- **运行到光标**：右键 → 运行到光标，临时跳过中间代码。
- **编辑并继续**：调试中修改代码继续运行（部分场景支持）。
- **远程调试**：通过 \`msvsmon.exe\` 调试远程机器上的进程。

调试是开发者最值得投入的技能，工具用得越熟，定位问题越快。
`,
    code: `// C# 12 顶级语句 - 调试技术演示
// 演示：Conditional("DEBUG")、Debug.Assert、DebuggerDisplay、DebuggerStepThrough、自定义 TraceListener

using System;
using System.Diagnostics;
using System.IO;

// ===== 1. Conditional("DEBUG") 特性 =====
Console.WriteLine("=== 1. Conditional 特性 ===");

// Debug 构建会执行，Release 构建调用被完全移除
LogDebug("这条日志只在 DEBUG 构建出现"); // 编译时根据符号决定是否保留
LogInfo("这条日志在所有构建都出现");      // 普通方法，总是执行

// DEBUG 条件方法：参数求值也会被移除
string expensiveMsg = ComputeExpensiveLog();
LogDebug(expensiveMsg); // Release 中 ComputeExpensiveLog 不会被调用

// ===== 2. Debug.Assert 与 Debug.WriteLine =====
Console.WriteLine("\\n=== 2. Debug.Assert ===");

int age = 25;
// Assert：条件为 false 时触发（Debug 构建弹窗或终止）
Debug.Assert(age >= 0, "年龄不能为负数"); // age >= 0 成立，继续执行
Debug.WriteLine($"调试输出: 当前年龄 = {age}"); // 输出到调试器 Output 窗口

// 故意触发 Assert（注释掉以避免运行中断）
// Debug.Assert(age > 100, "年龄必须大于 100"); // 会触发 Assert 失败

// ===== 3. DebuggerDisplay 演示 =====
Console.WriteLine("\\n=== 3. DebuggerDisplay ===");
var person = new Person { Name = "Alice", Age = 30, Email = "alice@example.com" };
Console.WriteLine($"创建对象: {person.Name}, {person.Age}");
// 在调试器中悬停 person 会看到 "Person: Name=Alice, Age=30" 而非 {Person}
Console.WriteLine("（在调试器中悬停 person 变量查看 DebuggerDisplay 效果）");

// ===== 4. DebuggerStepThrough 演示 =====
Console.WriteLine("\\n=== 4. DebuggerStepThrough ===");
int result = AddWithStepThrough(3, 5); // F11 不会进入此方法
Console.WriteLine($"3 + 5 = {result}");
// 标记了 DebuggerStepThrough 的方法，单步调试时直接跳过

// ===== 5. 自定义 TraceListener =====
Console.WriteLine("\\n=== 5. 自定义 TraceListener ===");

// 移除默认监听器
Trace.Listeners.Clear();
// 添加自定义监听器：写入控制台
Trace.Listeners.Add(new ConsoleTraceListener());
// 添加自定义监听器：写入文件
Trace.Listeners.Add(new FileTraceListener("trace.log"));
// 添加彩色监听器：错误红色，警告黄色
Trace.Listeners.Add(new ColoredConsoleTraceListener());

// 写入日志：所有监听器都会收到
Trace.WriteLine("程序启动");          // 普通信息
Trace.WriteLine("开始处理数据", "INFO"); // 带类别
Trace.TraceWarning("内存使用率较高");    // 警告级别
Trace.TraceError("数据库连接失败");      // 错误级别

// ===== 6. Debugger.IsAttached 判断 =====
Console.WriteLine("\\n=== 6. 调试器状态 ===");
if (Debugger.IsAttached)
{
    Console.WriteLine("当前在调试器中运行");
    // 调试模式下的特殊行为
    Debugger.Log(1, "Test", "调试器日志输出\\n");
}
else
{
    Console.WriteLine("未附加调试器（Release 或直接运行）");
}

// ===== 7. Stopwatch 性能计时 =====
Console.WriteLine("\\n=== 7. Stopwatch 性能计时 ===");
var sw = Stopwatch.StartNew(); // 开始计时
for (int i = 0; i < 1000; i++)
{
    _ = i * i; // 模拟工作
}
sw.Stop(); // 停止计时
Console.WriteLine($"循环 1000 次耗时: {sw.ElapsedTicks} ticks ({sw.ElapsedMilliseconds} ms)");

// ===== 方法定义 =====

// Conditional("DEBUG")：仅 DEBUG 构建编译调用
[Conditional("DEBUG")]
static void LogDebug(string message)
{
    Console.WriteLine($"[DEBUG] {message}");
}

// 普通方法：总是执行
static void LogInfo(string message)
{
    Console.WriteLine($"[INFO] {message}");
}

// 模拟耗时的日志计算
static string ComputeExpensiveLog()
{
    Console.WriteLine("  [计算] ComputeExpensiveLog 被调用");
    return $"复杂日志 {DateTime.Now:O}";
}

// 标记 DebuggerStepThrough：调试时不进入此方法
[DebuggerStepThrough]
static int AddWithStepThrough(int a, int b)
{
    return a + b; // 简单逻辑，无需单步进入
}

// ===== 类型定义 =====

// DebuggerDisplay：控制调试器悬停显示
[DebuggerDisplay("Person: Name={Name}, Age={Age}")]
public class Person
{
    public string Name { get; set; } = "";
    public int Age { get; set; }

    // DebuggerBrowsable：在 Watch 窗口隐藏此成员
    [DebuggerBrowsable(DebuggerBrowsableState.Never)]
    public string Email { get; set; } = "";

    // DebuggerStepThrough：属性 getter 单步跳过
    public string DisplayName => $"{Name} ({Age})";
}

// 自定义 TraceListener：写入文件
public class FileTraceListener : TextWriterTraceListener
{
    public FileTraceListener(string filePath) : base(filePath) { }

    public override void WriteLine(string? message)
    {
        // 添加时间戳前缀
        base.WriteLine($"[{DateTime.Now:HH:mm:ss}] {message}");
        Flush(); // 立即刷新到文件
    }
}

// 自定义 TraceListener：根据级别着色
public class ColoredConsoleTraceListener : TraceListener
{
    public override void Write(string? message) => WriteImpl(message, false);

    public override void WriteLine(string? message) => WriteImpl(message, true);

    private void WriteImpl(string? message, bool newLine)
    {
        // 根据消息内容判断级别（实际项目用 TraceEventType）
        var originalColor = Console.ForegroundColor;
        if (message?.Contains("Error") == true)
        {
            Console.ForegroundColor = ConsoleColor.Red;       // 错误：红色
        }
        else if (message?.Contains("Warning") == true)
        {
            Console.ForegroundColor = ConsoleColor.Yellow;   // 警告：黄色
        }
        else
        {
            Console.ForegroundColor = ConsoleColor.Gray;     // 普通：灰色
        }

        if (newLine) Console.WriteLine(message);
        else Console.Write(message);

        Console.ForegroundColor = originalColor; // 恢复原色
    }
}
`,
    lang: 'cs',
  },
  {
    id: 'csharp4-ch63',
    group: '第十部分 异常处理与调试',
    icon: '📈',
    title: '日志与诊断',
    content: `## 日志与诊断

日志和诊断是生产环境可观测性的基石。.NET 8 提供了一套完整的日志、追踪、指标（Metrics）三件套，配合 OpenTelemetry 可实现端到端分布式观测。

### 1. ILogger<T> 简介

\`Microsoft.Extensions.Logging\` 是 .NET 标准日志抽象层。核心接口 \`ILogger<T>\` 中 \`T\` 是日志类别（通常是当前类型），用于过滤和定位。

\`\`\`csharp
public class UserService(ILogger<UserService> logger)
{
    public void Login(string name)
    {
        logger.LogInformation("用户 {Name} 登录", name);
    }
}
\`\`\`

\`ILogger<T>\` 通过 DI 注入，可无缝切换底层实现（Console、Debug、Serilog、Application Insights）。

### 2. 日志级别

从低到高：

| 级别 | 数值 | 用途 |
| --- | --- | --- |
| \`Trace\` | 0 | 极详细的开发期日志 |
| \`Debug\` | 1 | 开发调试信息 |
| \`Information\` | 2 | 业务流程关键节点 |
| \`Warning\` | 3 | 异常但可恢复的情况 |
| \`Error\` | 4 | 错误，当前操作失败 |
| \`Critical\` | 5 | 致命错误，需立即处理 |
| \`None\` | 6 | 不记录任何日志 |

通过 \`AddFilter\` 控制每个类别、每个级别的输出阈值。

### 3. 日志类别

\`ILogger<T>\` 的 \`T\` 自动作为类别名（如 \`MyApp.Services.UserService\`）。也可用 \`ILoggerFactory.CreateLogger("CustomCategory")\` 自定义。类别用于：

- 过滤：\`AddFilter("MyApp.*", LogLevel.Information)\`
- 路由：不同类别输出到不同目标
- 聚合：按类别统计日志量

### 4. LoggerExtensions 扩展方法

\`ILogger\` 本身只有 \`Log(level, ...)\`。扩展方法提供便捷 API：

- \`LogTrace\` / \`LogDebug\` / \`LogInformation\` / \`LogWarning\` / \`LogError\` / \`LogCritical\`
- 每个都有同步版本和带 \`Exception\` 参数的版本
- 还有 \`BeginScope\` 开启日志作用域

### 5. 结构化日志

**关键概念**：用 \`{PropertyName}\` 占位符，而非字符串插值。

\`\`\`csharp
// ✅ 正确：结构化日志，属性被单独记录
logger.LogInformation("用户 {UserId} 购买了 {Count} 件商品", userId, count);

// ❌ 错误：字符串插值，所有信息混在 message 里
logger.LogInformation($"用户 {userId} 购买了 {count} 件商品");
\`\`\`

结构化日志的优势：

- 日志系统可按 \`UserId\` 字段单独查询、聚合。
- 自动转义防止注入。
- 支持采样、告警等结构化分析。

### 6. 日志范围 BeginScope

\`using var scope = logger.BeginScope("Transaction {TransactionId}", txId);\` 在作用域内的所有日志自动带上 \`TransactionId\`，便于关联同一事务的多条日志。常用于：

- 请求追踪（带 RequestId）
- 事务追踪
- 用户会话追踪

### 7. 日志过滤

\`AddFilter\` 控制输出：

\`\`\`csharp
builder.Logging.AddFilter("Microsoft", LogLevel.Warning)        // Microsoft 命名空间只 Warning+
       .AddFilter("MyApp.Services.*", LogLevel.Debug)            // 业务服务 Debug+
       .AddFilter<ConsoleLoggerProvider>(level => level >= LogLevel.Information);
\`\`\`

也可在 \`appsettings.json\` 配置：

\`\`\`json
"Logging": { "LogLevel": { "Default": "Information", "Microsoft": "Warning" } }
\`\`\`

### 8. 内置 Logger Provider

- \`ConsoleLogger\`：输出到控制台，支持彩色、JSON 格式（.NET 8）。
- \`DebugLogger\`：输出到调试器 Output 窗口。
- \`EventLogLogger\`：写入 Windows 事件日志（仅 Windows）。
- \`EventSourceLogger\`：通过 ETW 跨进程追踪。
- \`AzureAppServicesLogger\`：Azure App Service 集成。

### 9. Serilog / NLog 简介

第三方日志框架提供更强大功能：

- **Serilog**：天然结构化日志，支持 Sink（文件、Elasticsearch、Seq）。
- **NLog**：传统成熟方案，配置灵活。
- 两者都通过 \`ILoggerProvider\` 适配到 \`Microsoft.Extensions.Logging\`。

### 10. OpenTelemetry 简介

OpenTelemetry 是 CNCF 主导的可观测性标准，统一日志、追踪、指标三大信号。.NET 8 通过 \`System.Diagnostics\` 原生支持：

- \`Activity\`：分布式追踪的标准实现。
- \`Meter\` / \`Counter\` / \`Histogram\`：Metrics API。
- \`System.Diagnostics.Tracing.EventSource\`：高性能事件源。

导出到 Jaeger、Zipkin、Prometheus、OTLP collector 等。

### 11. System.Diagnostics.Activity

\`Activity\` 是 .NET 的分布式追踪原语：

\`\`\`csharp
var activity = ActivitySource.StartActivity("ProcessOrder");
try { /* 业务 */ }
finally { activity?.Dispose(); } // 自动记录耗时和状态
\`\`\`

\`ActivitySource\` 类似 \`ILogger<T>\`，可被监听器订阅。ASP.NET Core 自动创建请求级 Activity。

### 12. EventSource 与 EventListener

\`EventSource\` 是高性能 ETW 事件源，开销极低，适合热路径：

\`\`\`csharp
[EventSource(Name = "MyApp")]
public class MyAppEventSource : EventSource { ... }
\`\`\`

\`EventListener\` 订阅 EventSource 事件，可用于进程内诊断。.NET 运行时自身的 GC、JIT、ThreadPool 都通过 EventSource 暴露数据，\`dotnet-counters\` 就是基于此。

### 13. dotnet-counters 实战

实时监视运行中 .NET 进程的指标：

\`\`\`bash
dotnet-counters monitor --process-id 1234 System.Runtime
\`\`\`

显示 CPU、GC、ThreadPool、Gen 0/1/2 collections、Working Set 等关键指标。自定义 \`EventSource\` 也能被监视。

### 14. Metrics API（.NET 8）

\`System.Diagnostics.Metrics\` 是 .NET 8 主推的指标 API：

- \`Meter\`：指标集合，类似 \`ILoggerFactory\`。
- \`Counter<T>\`：单调递增计数器（请求数、错误数）。
- \`Histogram<T>\`：分布统计（请求耗时分布）。
- \`Gauge<T>\`：当前值（温度、队列长度，.NET 8 新增）。
- \`ObservableCounter<T>\` / \`ObservableGauge<T>\`：回调式指标。

导出到 Prometheus 通过 \`prometheus-net.AspNetCore\` 或 OTLP。

### 15. EventIds

为每条日志分配 \`EventId\`，便于查询和告警：

\`\`\`csharp
logger.LogInformation(MyEvents.UserLogin, "用户 {UserId} 登录", userId);
\`\`\`

\`EventId\` 是结构体，包含 \`Id\` 和 \`Name\`。集中定义所有事件 ID 便于维护。

合理的日志和诊断策略让生产环境问题"看得见、追得到、说得清"。
`,
    code: `// C# 12 顶级语句 - 日志与诊断演示
// 演示：Microsoft.Extensions.Logging 结构化日志、自定义 Logger、Activity 跟踪、Meter 计数

using System.Diagnostics;
using Microsoft.Extensions.Logging;

// ===== 1. 配置 LoggerFactory =====
Console.WriteLine("=== 1. 配置 LoggerFactory ===");

// 创建日志工厂：添加控制台和自定义日志提供程序
using var loggerFactory = LoggerFactory.Create(builder =>
{
    builder
        .AddFilter("Microsoft", LogLevel.Warning)      // Microsoft 命名空间只 Warning+
        .AddFilter("MyApp", LogLevel.Debug)             // MyApp 命名空间 Debug+
        .AddConsole()                                    // 添加控制台日志
        .AddDebug()                                      // 添加调试器输出
        .AddProvider(new ColoredLoggerProvider());       // 添加自定义彩色日志
});

// 创建带类别的 logger
var logger = loggerFactory.CreateLogger<Program>();
logger.LogInformation("日志系统已初始化");

// ===== 2. 结构化日志 =====
Console.WriteLine("\\n=== 2. 结构化日志 ===");

string userId = "U10086";
int productCount = 3;
decimal totalAmount = 299.9m;

// ✅ 正确：结构化占位符 {Property}
logger.LogInformation("用户 {UserId} 购买了 {Count} 件商品，总计 {Amount:C}",
    userId, productCount, totalAmount);
// UserId / Count / Amount 作为独立字段被记录，便于查询

// ❌ 错误示范（字符串插值，丢失结构化信息）
// logger.LogInformation($"用户 {userId} 购买了 {productCount} 件商品");

// ===== 3. 日志级别演示 =====
Console.WriteLine("\\n=== 3. 日志级别 ===");
logger.LogTrace("Trace 级别：极详细，生产通常关闭");
logger.LogDebug("Debug 级别：开发调试用");
logger.LogInformation("Information 级别：业务流程关键节点");
logger.LogWarning("Warning 级别：异常但可恢复");
logger.LogError("Error 级别：操作失败");
logger.LogCritical("Critical 级别：致命错误，需立即处理");

// 带 Exception 的日志
try
{
    throw new InvalidOperationException("模拟业务错误");
}
catch (Exception ex)
{
    // 第二个参数是 Exception，会记录堆栈
    logger.LogError(ex, "处理订单时发生异常，订单号={OrderId}", "ORD-001");
}

// ===== 4. 日志范围 BeginScope =====
Console.WriteLine("\\n=== 4. 日志作用域 ===");

// 开启作用域：作用域内所有日志自动带 TransactionId
using (logger.BeginScope("Transaction {TransactionId}", "TX-2024-001"))
{
    logger.LogInformation("开始处理事务");
    logger.LogInformation("校验用户信息");
    logger.LogInformation("扣减库存");
    logger.LogInformation("事务提交成功");
} // 作用域结束，TransactionId 不再附加

// ===== 5. EventId 使用 =====
Console.WriteLine("\\n=== 5. EventId ===");

// 用预定义的 EventId，便于查询和告警
logger.LogInformation(MyLogEvents.UserLogin, "用户 {UserId} 登录成功", "U10086");
logger.LogWarning(MyLogEvents.LoginFailed, "用户 {UserId} 登录失败，原因={Reason}", "U9999", "密码错误");
logger.LogError(MyLogEvents.DatabaseError, "数据库连接超时");

// ===== 6. Activity 分布式追踪 =====
Console.WriteLine("\\n=== 6. Activity 分布式追踪 ===");

// 启用 Activity 监听器（模拟 OTLP 导出器）
using var activityListener = new ActivityListener
{
    ShouldListenTo = _ => true,
    Sample = (ref ActivityCreationOptions<ActivityContext> _) => ActivitySamplingResult.AllData,
    ActivityStarted = activity => Console.WriteLine($"  [Trace] -> {activity.DisplayName} (开始)"),
    ActivityStopped = activity => Console.WriteLine($"  [Trace] <- {activity.DisplayName} (结束, 耗时={activity.Duration.TotalMilliseconds:F1}ms)")
};
ActivitySource.AddListener(activityListener);

// 创建 ActivitySource（类似 ILoggerFactory）
using var activitySource = new ActivitySource("MyApp", "1.0.0");

// 启动一个 Activity（相当于 span）
using (var activity = activitySource.StartActivity("ProcessOrder"))
{
    activity?.SetTag("order.id", "ORD-2024-001"); // 添加标签
    activity?.SetTag("order.amount", 299.9);

    logger.LogInformation("开始处理订单 ORD-2024-001");

    // 嵌套 Activity（父子 span）
    using (var childActivity = activitySource.StartActivity("ValidateUser"))
    {
        Thread.Sleep(50); // 模拟耗时
        activity?.SetTag("user.valid", true);
        logger.LogInformation("用户校验通过");
    }

    using (var childActivity = activitySource.StartActivity("ChargePayment"))
    {
        Thread.Sleep(80); // 模拟耗时
        activity?.SetTag("payment.success", true);
        logger.LogInformation("支付成功");
    }

    activity?.SetStatus(ActivityStatusCode.Ok); // 设置状态
    logger.LogInformation("订单处理完成");
}

// ===== 7. Meter 指标计数 =====
Console.WriteLine("\\n=== 7. Meter 指标计数 ===");

// 创建 Meter：指标集合
using var meter = new Meter("MyApp.Metrics", "1.0.0");

// 创建 Counter：单调递增计数器
var orderCounter = meter.CreateCounter<long>("orders_processed_total");
var errorCounter = meter.CreateCounter<long>("orders_failed_total", unit: "次");
// 创建 Histogram：分布统计（耗时分布）
var orderDuration = meter.CreateHistogram<double>("order_duration_ms", unit: "ms");
// 创建 ObservableGauge：当前值（队列长度）
long queueLength = 0;
var queueGauge = meter.CreateObservableGauge("order_queue_length", () => queueLength, unit: "个");

// 订阅 Meter 导出指标（模拟 Prometheus 抓取）
using var meterListener = new MeterListener();
meterListener.InstrumentPublished = instrument =>
{
    meterListener.EnableMeasurementEvents(instrument); // 启用所有指标
};
// 记录指标值
meterListener.SetMeasurementEventCallback<long>((measurement, tags, state) =>
{
    // 模拟导出
});
meterListener.Start();

// 模拟处理 3 个订单
for (int i = 0; i < 3; i++)
{
    queueLength++; // 队列增加
    var sw = Stopwatch.StartNew();
    try
    {
        // 模拟处理
        Thread.Sleep(30 + i * 10);
        orderCounter.Add(1); // 计数 +1
        orderCounter.Add(1, new KeyValuePair<string, object?>("status", "success"));
        logger.LogInformation("订单 {Index} 处理成功", i + 1);
    }
    catch
    {
        errorCounter.Add(1); // 错误计数 +1
        orderCounter.Add(1, new KeyValuePair<string, object?>("status", "failed"));
    }
    sw.Stop();
    orderDuration.Record(sw.Elapsed.TotalMilliseconds); // 记录耗时分布
    queueLength--; // 队列减少
}

Console.WriteLine($"\\n指标汇总: 订单总数={orderCounter}, 当前队列={queueLength}");

// ===== 类型定义 =====

// EventId 集中定义：便于维护和告警规则
public static class MyLogEvents
{
    public static readonly EventId UserLogin = new(1001, nameof(UserLogin));
    public static readonly EventId LoginFailed = new(1002, nameof(LoginFailed));
    public static readonly EventId DatabaseError = new(2001, nameof(DatabaseError));
    public static readonly EventId OrderProcessed = new(3001, nameof(OrderProcessed));
}

// 自定义 LoggerProvider：创建彩色控制台 Logger
public class ColoredLoggerProvider : ILoggerProvider
{
    public ILogger CreateLogger(string categoryName) => new ColoredLogger(categoryName);
    public void Dispose() { }
}

// 自定义 Logger：根据级别着色输出
public class ColoredLogger(string categoryName) : ILogger
{
    public IDisposable BeginScope<TState>(TState state) where TState : notnull => NullScope.Instance;
    public bool IsEnabled(LogLevel logLevel) => logLevel >= LogLevel.Debug;

    public void Log<TState>(LogLevel logLevel, EventId eventId, TState state,
        Exception? exception, Func<TState, Exception?, string> formatter)
    {
        if (!IsEnabled(logLevel)) return;

        var originalColor = Console.ForegroundColor;
        // 根据级别选择颜色
        Console.ForegroundColor = logLevel switch
        {
            LogLevel.Trace or LogLevel.Debug => ConsoleColor.DarkGray,
            LogLevel.Information => ConsoleColor.White,
            LogLevel.Warning => ConsoleColor.Yellow,
            LogLevel.Error => ConsoleColor.Red,
            LogLevel.Critical => ConsoleColor.DarkRed,
            _ => ConsoleColor.Gray
        };

        var message = formatter(state, exception);
        Console.WriteLine($"[{logLevel}] [{categoryName}] [{eventId.Id}] {message}");
        if (exception is not null)
        {
            Console.WriteLine($"  Exception: {exception}");
        }

        Console.ForegroundColor = originalColor; // 恢复颜色
    }

    // 空 Scope：不附加额外信息
    private class NullScope : IDisposable
    {
        public static NullScope Instance { get; } = new();
        public void Dispose() { }
    }
}
`,
    lang: 'cs',
  },
];

export { chapters };
