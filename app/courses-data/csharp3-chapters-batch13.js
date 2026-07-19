// =============================================================
// C# 从入门到精通大全（终极版）—— 第13批章节
// 第十三部分 异步编程（共 6 章）
// -------------------------------------------------------------
// 本批包含 6 章：
//   csharp3-ch67 : 第六十七章 async/await 基础
//   csharp3-ch68 : 第六十八章 Task 与 Task&lt;T&gt;
//   csharp3-ch69 : 第六十九章 并行编程（Parallel/PLINQ）
//   csharp3-ch70 : 第七十章 锁与线程安全
//   csharp3-ch71 : 第七十一章 并发集合
//   csharp3-ch72 : 第七十二章 CancellationToken 与异步流
// =============================================================

const chapters = [
  // ============================================================
  // 第六十七章：async/await 基础
  // ============================================================
  {
    id: 'csharp3-ch67',
    group: '第十三部分 异步编程',
    icon: '⏳',
    title: '第六十七章 async/await 基础',
    content: `## 第六十七章　async/await 基础

异步编程是现代 C# 的核心能力。\`async\` 和 \`await\` 关键字让你以同步风格编写异步代码，编译器帮你处理复杂的回调。

### 一、同步 vs 异步：直观对比 ⭐⭐⭐

\`\`\`csharp
// ===== 同步版本：主线程阻塞 =====
// 假设有一个耗时操作（如网络请求、文件读写）
string SyncReadFile(string path)
{
    Console.WriteLine("开始读取文件...");   // 主线程执行
    Thread.Sleep(3000);                      // 模拟耗时操作，阻塞当前线程 3 秒
    Console.WriteLine("读取完成!");
    return "文件内容";                        // 返回结果
}
// 调用时：线程被阻塞 3 秒，期间无法处理其他任务（如 UI 响应）

// ===== 异步版本：不阻塞主线程 =====
async Task<string> AsyncReadFileAsync(string path)
{
    Console.WriteLine("开始读取文件...");   // 主线程执行
    await Task.Delay(3000);                  // 异步等待 3 秒，不阻塞线程！
    // 线程在这 3 秒内可以去做别的事情（如处理其他请求）
    Console.WriteLine("读取完成!");          // 等待完成后继续执行
    return "文件内容";                        // 返回结果
}
// 调用时：主线程立即返回，3 秒后自动恢复执行

Console.WriteLine("=== 同步版本 ===");
var sw = System.Diagnostics.Stopwatch.StartNew();
// string result = SyncReadFile("data.txt");  // 会阻塞 3 秒
Console.WriteLine($"同步调用完成，耗时: {sw.ElapsedMilliseconds}ms");

Console.WriteLine("\\n=== 异步版本 ===");
sw.Restart();
// string result = await AsyncReadFileAsync("data.txt");  // 不阻塞，但 await 会等待
Console.WriteLine($"异步调用完成，耗时: {sw.ElapsedMilliseconds}ms");
\`\`\`

### 二、async 关键字：标记异步方法 ⭐⭐⭐

\`\`\`csharp
// async 关键字告诉编译器：此方法内部包含 await 表达式
// 编译器会将方法转换为状态机，自动处理线程切换

// 1. async Task：返回异步操作（无返回值）
async Task DoWorkAsync()
{
    Console.WriteLine("开始工作...");         // 同步执行
    await Task.Delay(1000);                    // 遇到 await，编译器生成状态机保存当前状态
    Console.WriteLine("工作完成!");           // 异步操作完成后，从此处恢复执行
    // 返回 void（隐式），但调用者可以 await 等待完成
}

// 2. async Task<T>：返回异步操作（有返回值）
async Task<int> CalculateAsync()
{
    Console.WriteLine("开始计算...");         // 同步执行
    await Task.Delay(1000);                    // 异步等待
    int result = 42;                           // 计算结果
    Console.WriteLine("计算完成!");
    return result;                              // 返回结果（编译器自动包装为 Task<int>）
}

// 3. async Task 调用方式
await DoWorkAsync();                           // 等待异步操作完成
Task task = DoWorkAsync();                     // 不等待，返回 Task 对象
// await task;                                  // 稍后再等待

// 4. async Task<T> 调用方式
int value = await CalculateAsync();            // 等待并获取结果
Task<int> task2 = CalculateAsync();            // 不等待，返回 Task<int> 对象
// int result = await task2;                    // 稍后再等待并获取结果
\`\`\`

### 三、await 关键字：异步等待 ⭐⭐⭐

\`\`\`csharp
// await 只能用于 async 方法内部
// await 的作用：暂停当前方法执行，直到被等待的异步操作完成

async Task DemonstrateAwaitAsync()
{
    Console.WriteLine("步骤 1: 开始");       // ① 立即执行
    await Task.Delay(500);                     // ② 暂停，让出线程，500ms 后恢复
    Console.WriteLine("步骤 2: 第一步完成");  // ③ 恢复执行
    await Task.Delay(500);                     // ④ 再次暂停
    Console.WriteLine("步骤 3: 全部完成");    // ⑤ 再次恢复
}
// 执行顺序：① →（等待 500ms）→ ③ →（等待 500ms）→ ⑤

// await 不仅限于 Task.Delay，可以 await 任何可等待类型：
// - Task：异步操作
// - Task<T>：带返回值的异步操作
// - ValueTask/ValueTask<T>：高性能场景下的轻量异步操作
// - 任何实现了 GetAwaiter() 方法的类型（自定义 awaitable）

// 多个 await 顺序执行
async Task<string> FetchDataAsync()
{
    Console.WriteLine("连接服务器...");       // ① 连接
    await Task.Delay(300);                     // ② 模拟网络延迟
    Console.WriteLine("发送请求...");         // ③ 发送
    await Task.Delay(500);                     // ④ 模拟服务器处理
    Console.WriteLine("接收响应...");         // ⑤ 接收
    string data = "{\\"name\\":\\"alice\\"}";   // ⑥ 解析数据
    return data;                                // ⑦ 返回
}
// 注意：多个 await 是顺序执行的，不是并行的！
// 如果需要并行，用 Task.WhenAll（见下一章）
\`\`\`

### 四、async void：危险的反模式 ⭐⭐

\`\`\`csharp
// async void 是异步方法的一种特殊返回类型
// ⚠️ 除了事件处理器，永远不要使用 async void！

// 1. async void 的问题演示
async void FireAndForgetAsync()
{
    await Task.Delay(1000);
    // 如果这里抛异常，调用者无法捕获！
    // 异常会直接抛到 SynchronizationContext，可能导致进程崩溃
    throw new InvalidOperationException("这个异常无法被捕获!");
}

// 2. async void 的唯一合法用途：事件处理器
// 在 WPF/WinForms 中，按钮点击事件处理器需要 void 返回
// async void Button_Click(object sender, EventArgs e)
// {
//     await Task.Delay(1000);
//     label.Text = "处理完成";
// }

// 3. async Task 替代 async void（推荐）
async Task FireAndForgetSafeAsync()
{
    try
    {
        await Task.Delay(1000);
        throw new InvalidOperationException("这个异常可以被捕获!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"捕获异常: {ex.Message}");  // 正常捕获
    }
}

// 4. 对比表
Console.WriteLine("| 返回类型 | 可等待 | 异常传播 | 适用场景 |");
Console.WriteLine("|---------|--------|---------|---------|");
Console.WriteLine("| async Task | ✅ | ✅ 调用者可捕获 | 绝大多数异步方法 |");
Console.WriteLine("| async Task<T> | ✅ | ✅ 调用者可捕获 | 有返回值的异步方法 |");
Console.WriteLine("| async void | ❌ | ❌ 直接抛到上下文 | 仅事件处理器 |");
\`\`\`

### 五、async Main：控制台程序入口 ⭐⭐⭐

\`\`\`csharp
// C# 7.1+ 支持 async Main 方法
// 顶级语句中直接使用 await，无需显式声明 Main

// ===== 方式一：顶级语句（C# 9+，推荐）=====
// 直接在 .cs 文件顶层写 await
Console.WriteLine("程序启动: " + DateTime.Now);

// 直接在顶级语句中 await
await Task.Delay(1000);                      // 模拟异步初始化

Console.WriteLine("初始化完成: " + DateTime.Now);

// 调用异步方法
await DoWorkAsync();                          // 顶级语句中直接 await

// ===== 方式二：显式 async Main（C# 7.1+）=====
// class Program
// {
//     static async Task Main(string[] args)   // 返回 Task
//     {
//         await DoWorkAsync();
//     }
//     // 或者返回 Task<int>（退出码）
//     // static async Task<int> Main(string[] args)
//     // {
//     //     await DoWorkAsync();
//     //     return 0;  // 成功退出码
//     // }
// }

Console.WriteLine("程序结束: " + DateTime.Now);
\`\`\`

### 六、异步方法的执行流程 ⭐⭐⭐

\`\`\`csharp
// 深入理解 async/await 的执行流程
async Task ExecutionFlowDemoAsync()
{
    // 阶段 1：同步执行（在调用线程上）
    Console.WriteLine($"[线程 {Environment.CurrentManagedThreadId}] 阶段1: 同步代码开始");

    int x = 10;                                // 同步操作
    int y = 20;                                // 同步操作
    Console.WriteLine($"[线程 {Environment.CurrentManagedThreadId}] x + y = {x + y}");

    // 阶段 2：遇到 await，暂停执行
    Console.WriteLine($"[线程 {Environment.CurrentManagedThreadId}] 阶段2: 遇到 await，让出线程");
    await Task.Delay(1000);                    // 编译器保存所有局部变量和状态
    // 1 秒后恢复执行，可能在同一线程或不同线程上（取决于 SynchronizationContext）

    // 阶段 3：恢复执行
    Console.WriteLine($"[线程 {Environment.CurrentManagedThreadId}] 阶段3: await 完成后恢复");

    // 阶段 4：再次 await
    Console.WriteLine($"[线程 {Environment.CurrentManagedThreadId}] 阶段4: 再次 await");
    await Task.Delay(500);

    // 阶段 5：最终同步代码
    Console.WriteLine($"[线程 {Environment.CurrentManagedThreadId}] 阶段5: 全部完成");
}

// 执行流程总结：
// 1. 方法开始 → 同步执行直到遇到第一个 await
// 2. 遇到 await → 检查操作是否已完成
//    - 如果已完成：立即继续同步执行（不切换线程）
//    - 如果未完成：保存状态，返回未完成的 Task，让出线程
// 3. 操作完成后 → 从保存的状态恢复执行
// 4. 继续执行直到下一个 await 或方法结束

await ExecutionFlowDemoAsync();
\`\`\`

### 七、SynchronizationContext：线程上下文 ⭐⭐⭐

\`\`\`csharp
// SynchronizationContext 控制 await 后代码在哪个线程上恢复执行

// 1. 不同环境有不同的 SynchronizationContext：
//    - WPF/WinForms：UI 线程上下文（await 后回到 UI 线程）
//    - ASP.NET Core：无 SynchronizationContext（await 后可能在任意线程池线程）
//    - 控制台应用：无 SynchronizationContext（默认线程池线程）

// 2. 验证当前上下文
Console.WriteLine($"当前 SynchronizationContext: {SynchronizationContext.Current?.GetType().Name ?? "null"}");
// 控制台应用：输出 null
// WPF 应用：输出 DispatcherSynchronizationContext
// ASP.NET（非 Core）：输出 AspNetSynchronizationContext

// 3. 在 UI 应用中，await 自动回到 UI 线程
// 伪代码（WPF 场景）：
// private async void Button_Click(object sender, RoutedEventArgs e)
// {
//     // 在 UI 线程上
//     label.Text = "加载中...";
//     string data = await FetchDataFromServerAsync();  // 等待时 UI 不冻结
//     label.Text = data;  // 自动回到 UI 线程更新控件
// }

// 4. 当前线程信息
Console.WriteLine($"当前线程 ID: {Environment.CurrentManagedThreadId}");
await Task.Delay(100);
Console.WriteLine($"await 后线程 ID: {Environment.CurrentManagedThreadId}");
// 控制台应用中，await 前后可能在不同线程上
\`\`\`

### 八、ConfigureAwait：控制上下文切换 ⭐⭐⭐

\`\`\`csharp
// ConfigureAwait(false) 告诉编译器：不需要恢复到原始上下文
// 这对性能有益，但需要注意线程安全问题

async Task ConfigureAwaitDemoAsync()
{
    // 1. 默认行为：ConfigureAwait(true) —— 恢复原始上下文
    Console.WriteLine($"[线程 {Environment.CurrentManagedThreadId}] 默认 await");
    await Task.Delay(100);                     // 默认 ConfigureAwait(true)
    // 在 UI 应用中，此行代码会回到 UI 线程
    // 在 ASP.NET Core 中，此行代码可能在任意线程
    Console.WriteLine($"[线程 {Environment.CurrentManagedThreadId}] 默认 await 后");

    // 2. ConfigureAwait(false)：不恢复原始上下文
    Console.WriteLine($"[线程 {Environment.CurrentManagedThreadId}] ConfigureAwait(false)");
    await Task.Delay(100).ConfigureAwait(false);  // 不恢复上下文
    // 此后的代码可能在任意线程池线程上执行
    // 好处：减少上下文切换开销，提高性能
    Console.WriteLine($"[线程 {Environment.CurrentManagedThreadId}] ConfigureAwait(false) 后");
}

// 3. ConfigureAwait 的使用原则
async Task<string> LibraryCodeAsync()
{
    // 库代码（如 NuGet 包）：推荐使用 ConfigureAwait(false)
    // 因为库代码不需要关心 UI 线程，避免死锁
    await Task.Delay(100).ConfigureAwait(false);
    return "library result";
}

async Task UiCodeAsync()
{
    // UI 代码（如 WPF 事件处理器）：不要使用 ConfigureAwait(false)
    // 因为需要回到 UI 线程更新控件
    await Task.Delay(100);  // 默认恢复 UI 上下文
    // label.Text = "done";  // 安全更新 UI
}

// 4. ConfigureAwait(false) 与死锁
// 经典死锁场景（同步等待异步）：
// 以下代码在 UI 应用中会死锁：
// public string GetData()
// {
//     return GetDataAsync().Result;  // ⚠️ 死锁！
// }
// 原因：.Result 阻塞 UI 线程等待 Task 完成
// Task 完成后需要回到 UI 线程，但 UI 线程被 .Result 阻塞
// → 死锁！
// 解决方案：
//   a) 全链路 async（推荐）
//   b) 在库代码中用 ConfigureAwait(false)
\`\`\`

### 九、异常处理 ⭐⭐⭐

\`\`\`csharp
// 异步方法中的异常处理

// 1. try-catch 正常捕获
async Task ExceptionDemo1Async()
{
    try
    {
        await Task.Delay(100);
        throw new InvalidOperationException("异步异常");
    }
    catch (InvalidOperationException ex)
    {
        Console.WriteLine($"捕获异常: {ex.Message}");  // ✅ 正常捕获
    }
}

// 2. 未捕获的异常：存储在 Task 中
async Task ExceptionDemo2Async()
{
    // 如果不在方法内 try-catch：
    await Task.Delay(100);
    throw new InvalidOperationException("未捕获的异常");
    // 异常会存储在 Task 对象中，调用者 await 时重新抛出
}

// 3. 调用者捕获
try
{
    await ExceptionDemo2Async();               // await 时异常被重新抛出
}
catch (InvalidOperationException ex)
{
    Console.WriteLine($"调用者捕获: {ex.Message}");
}

// 4. 多个异常（Task.WhenAll）
async Task ExceptionDemo3Async()
{
    Task t1 = Task.Run(() => throw new ArgumentException("错误1"));
    Task t2 = Task.Run(() => throw new InvalidOperationException("错误2"));

    try
    {
        await Task.WhenAll(t1, t2);            // WhenAll 会抛出第一个异常
    }
    catch (Exception ex)
    {
        Console.WriteLine($"WhenAll 只捕获第一个: {ex.Message}");
        // 要获取所有异常，用 Task.WhenAll 返回的 Task 的 Exception 属性
    }
}

await ExceptionDemo1Async();
\`\`\`

### 十、关键总结

| 概念 | 说明 |
| --- | --- |
| \`async\` | 标记方法为异步，编译器生成状态机 |
| \`await\` | 暂停方法执行，等待异步操作完成 |
| \`async Task\` | 返回值类型：无返回值异步操作 |
| \`async Task\<T\>\` | 返回值类型：带返回值的异步操作 |
| \`async void\` | 仅用于事件处理器，否则危险 |
| \`ConfigureAwait(false)\` | 不恢复原始上下文，库代码推荐 |
| \`SynchronizationContext\` | 控制 await 后的线程恢复位置 |

**最佳实践**：
1. 异步方法命名以 \`Async\` 结尾（如 \`GetDataAsync\`）
2. 避免 \`async void\`，用 \`async Task\` 替代
3. 库代码使用 \`ConfigureAwait(false)\`
4. 不要让同步代码阻塞异步代码（\`.Result\`/\`.Wait()\` 容易死锁）
5. 控制台程序用 \`async Task Main\` 或顶级语句 \`await\`
6. 异步一路到底：从控制器 → 服务 → 数据访问全部异步

`,
  },

  // ============================================================
  // 第六十八章：Task 与 Task<T>
  // ============================================================
  {
    id: 'csharp3-ch68',
    group: '第十三部分 异步编程',
    icon: '📋',
    title: '第六十八章 Task 与 Task&lt;T&gt;',
    content: `## 第六十八章　Task 与 Task\<T\>

\`Task\` 和 \`Task\<T\>\` 是 .NET 中异步操作的核心抽象。本章深入讲解 Task 的创建、组合、等待和高级用法。

### 一、Task.Run：在线程池中运行代码 ⭐⭐⭐

\`\`\`csharp
// Task.Run 将工作委托给线程池，避免阻塞主线程

// 1. Task.Run 基本用法
Console.WriteLine($"[线程 {Environment.CurrentManagedThreadId}] 主线程开始");

Task task = Task.Run(() =>                     // 在 线程池 线程上执行
{
    Console.WriteLine($"[线程 {Environment.CurrentManagedThreadId}] 后台工作开始");
    Thread.Sleep(1000);                        // 模拟 CPU 密集型工作（注意：这里是同步阻塞）
    Console.WriteLine($"[线程 {Environment.CurrentManagedThreadId}] 后台工作完成");
});
// 主线程不等待，继续执行
Console.WriteLine($"[线程 {Environment.CurrentManagedThreadId}] 主线程继续");

await task;                                    // 等待后台任务完成
Console.WriteLine("所有工作完成");

// 2. Task.Run<T>：返回结果
Task<int> calcTask = Task.Run(() =>           // 返回 Task<int>
{
    Console.WriteLine("开始计算...");
    Thread.Sleep(500);                         // 模拟计算
    return 42;                                 // 返回结果
});

int result = await calcTask;                   // 等待并获取结果
Console.WriteLine($"计算结果: {result}");

// 3. Task.Run 不应用于 I/O 密集型操作
// ❌ 错误：用 Task.Run 包装异步 I/O（多此一举）
// Task.Run(async () => await File.ReadAllTextAsync("file.txt"));
// ✅ 正确：直接调用异步 I/O 方法
// await File.ReadAllTextAsync("file.txt");
// 原因：Task.Run 浪费线程池线程去等待 I/O，I/O 本身不需要线程
\`\`\`

### 二、Task.FromResult：创建已完成的 Task ⭐⭐

\`\`\`csharp
// Task.FromResult 创建已完成的 Task（用于缓存、测试、同步返回）

// 1. 基本用法
Task<int> completedTask = Task.FromResult(42); // 创建已完成 Task<int>
int val = await completedTask;                 // 立即返回，不等待
Console.WriteLine($"立即获得: {val}");

// 2. 缓存场景：避免重复异步调用
// 在接口实现中，如果数据已经缓存，可以同步返回
async Task<int> GetCachedValueAsync(int key)
{
    // 模拟缓存命中
    if (key == 1)
    {
        return await Task.FromResult(100);     // 缓存命中，同步返回（不分配异步状态机）
    }
    // 缓存未命中，真正异步获取
    await Task.Delay(100);                     // 模拟数据库查询
    return key * 10;
}

// 3. Task.CompletedTask：无返回值的已完成 Task
async Task DoIfNeededAsync(bool needWork)
{
    if (!needWork)
    {
        await Task.CompletedTask;              // 立即完成，无需分配异步状态机
        Console.WriteLine("无需工作，立即返回");
        return;
    }
    await Task.Delay(100);                     // 需要工作，异步执行
    Console.WriteLine("工作完成");
}

await DoIfNeededAsync(false);
await DoIfNeededAsync(true);

// 4. Task.FromException / Task.FromCanceled
Task<int> failedTask = Task.FromException<int>(new InvalidOperationException("失败"));
Task<int> canceledTask = Task.FromCanceled<int>(new CancellationToken(true));
// 用于测试异常处理路径
\`\`\`

### 三、Task.Delay：异步等待 ⭐⭐⭐

\`\`\`csharp
// Task.Delay 创建在指定时间后完成的 Task，不阻塞线程

// 1. 基本用法
Console.WriteLine($"开始: {DateTime.Now:HH:mm:ss.fff}");
await Task.Delay(2000);                        // 等待 2 秒，不阻塞线程
Console.WriteLine($"结束: {DateTime.Now:HH:mm:ss.fff}");

// 2. Task.Delay vs Thread.Sleep
// Thread.Sleep(2000)：阻塞当前线程 2 秒（线程无法做其他事）
// await Task.Delay(2000)：异步等待 2 秒（线程可以处理其他任务）
// 在 UI 应用中：Thread.Sleep 会冻结界面，Task.Delay 不会

// 3. 带取消的 Task.Delay
using var cts = new CancellationTokenSource();
cts.CancelAfter(3000);                         // 3 秒后取消

try
{
    Console.WriteLine("等待 10 秒（但 3 秒后会被取消）...");
    await Task.Delay(10000, cts.Token);        // 10 秒等待，但 3 秒后取消
    Console.WriteLine("等待完成（不会执行到这里）");
}
catch (OperationCanceledException)
{
    Console.WriteLine($"等待被取消: {DateTime.Now:HH:mm:ss.fff}");
}

// 4. 超时模式：用 Task.Delay 实现超时
async Task<string> FetchWithTimeoutAsync(string url, TimeSpan timeout)
{
    using var http = new HttpClient();
    Task<string> fetchTask = http.GetStringAsync(url);  // 实际请求
    Task timeoutTask = Task.Delay(timeout);              // 超时任务

    Task completed = await Task.WhenAny(fetchTask, timeoutTask);
    if (completed == timeoutTask)
    {
        throw new TimeoutException($"请求超时 ({timeout.TotalSeconds}s)");
    }
    return await fetchTask;                    // 已完成的 Task，await 立即返回
}
Console.WriteLine("超时模式：Task.Delay 配合 Task.WhenAny");
\`\`\`

### 四、Task.WhenAll：等待所有任务完成 ⭐⭐⭐

\`\`\`csharp
// Task.WhenAll 并行执行多个任务，等待全部完成

// 1. 基本用法
async Task WhenAllDemoAsync()
{
    Console.WriteLine("开始并行执行 3 个任务...");
    var sw = System.Diagnostics.Stopwatch.StartNew();

    Task task1 = Task.Delay(1000);             // 任务 1: 1 秒
    Task task2 = Task.Delay(1500);             // 任务 2: 1.5 秒
    Task task3 = Task.Delay(2000);             // 任务 3: 2 秒

    // 并行执行：总耗时 = max(1s, 1.5s, 2s) = 2s
    await Task.WhenAll(task1, task2, task3);
    sw.Stop();
    Console.WriteLine($"全部完成，耗时: {sw.ElapsedMilliseconds}ms");  // 约 2000ms
}
await WhenAllDemoAsync();

// 2. WhenAll<T>：获取所有结果
async Task WhenAllResultDemoAsync()
{
    Task<int> t1 = Task.Run(() => { Thread.Sleep(500); return 10; });
    Task<int> t2 = Task.Run(() => { Thread.Sleep(300); return 20; });
    Task<int> t3 = Task.Run(() => { Thread.Sleep(700); return 30; });

    int[] results = await Task.WhenAll(t1, t2, t3);  // 并行执行，等待全部
    Console.WriteLine($"结果: [{string.Join(", ", results)}]");  // [10, 20, 30]
    Console.WriteLine($"总和: {results.Sum()}");       // 60
}
await WhenAllResultDemoAsync();

// 3. WhenAll 异常处理
async Task WhenAllExceptionDemoAsync()
{
    Task t1 = Task.Run(() => throw new ArgumentException("错误1"));
    Task t2 = Task.Run(() => throw new InvalidOperationException("错误2"));
    Task t3 = Task.Delay(100);                 // 正常完成

    try
    {
        await Task.WhenAll(t1, t2, t3);
    }
    catch (Exception ex)
    {
        // WhenAll 只抛出第一个异常
        Console.WriteLine($"捕获第一个异常: {ex.Message}");
        // 要获取所有异常：
        Task allTasks = Task.WhenAll(t1, t2, t3);
        try { await allTasks; } catch { }
        if (allTasks.Exception != null)
        {
            foreach (var inner in allTasks.Exception.InnerExceptions)
            {
                Console.WriteLine($"  内部异常: {inner.Message}");
            }
        }
    }
}
// await WhenAllExceptionDemoAsync();  // 演示用，注释掉避免控制台混乱
\`\`\`

### 五、Task.WhenAny：任意一个完成即返回 ⭐⭐⭐

\`\`\`csharp
// Task.WhenAny 在任意一个任务完成时立即返回

// 1. 基本用法
async Task WhenAnyDemoAsync()
{
    Task task1 = Task.Delay(3000);             // 3 秒
    Task task2 = Task.Delay(1000);             // 1 秒
    Task task3 = Task.Delay(2000);             // 2 秒

    Task firstCompleted = await Task.WhenAny(task1, task2, task3);
    Console.WriteLine($"第一个完成的任务: task2 用时最短");

    // 注意：其他任务仍在运行！需要手动等待或取消
    await Task.WhenAll(task1, task2, task3);    // 等待全部完成
}
await WhenAnyDemoAsync();

// 2. 竞速模式：多个数据源竞争
async Task<string> FetchFromFastestAsync(string query)
{
    // 模拟 3 个数据源（不同响应速度）
    Task<string> source1 = Task.Run(async () => { await Task.Delay(500); return "数据源1"; });
    Task<string> source2 = Task.Run(async () => { await Task.Delay(200); return "数据源2"; });
    Task<string> source3 = Task.Run(async () => { await Task.Delay(800); return "数据源3"; });

    Task<string> winner = await Task.WhenAny(source1, source2, source3);
    return await winner;  // 返回最快的结果 "数据源2"
}
string fastest = await FetchFromFastestAsync("search");
Console.WriteLine($"最快数据源: {fastest}");

// 3. 超时实现（配合 Task.Delay）
async Task<string> FetchWithTimeoutAsync(string url, TimeSpan timeout)
{
    using var http = new HttpClient();
    Task<string> fetchTask = http.GetStringAsync(url);  // 实际请求
    Task timeoutTask = Task.Delay(timeout);              // 超时标志

    Task completed = await Task.WhenAny(fetchTask, timeoutTask);
    if (completed == timeoutTask)
    {
        throw new TimeoutException($"请求超时");
    }
    return await fetchTask;  // 已完成的 Task，await 立即返回
}
Console.WriteLine("超时 = WhenAny(fetch, delay)");
\`\`\`

### 六、Task.WaitAll / Task.WaitAny：同步等待 ⭐⭐

\`\`\`csharp
// .Wait() 和 .WaitAll() 是同步阻塞等待，不同于 await

// 1. Task.Wait()：同步阻塞等待单任务
Task task = Task.Run(() => Thread.Sleep(500));
Console.WriteLine("开始 Wait...");
task.Wait();                                   // 阻塞当前线程直到任务完成
Console.WriteLine("Wait 完成");

// 2. Task.WaitAll：同步等待多个任务
Task t1 = Task.Run(() => Thread.Sleep(300));
Task t2 = Task.Run(() => Thread.Sleep(500));
Task.WaitAll(t1, t2);                          // 阻塞直到全部完成
Console.WriteLine("WaitAll 完成");

// 3. Task.WaitAny：同步等待任意一个完成
Task t3 = Task.Run(() => Thread.Sleep(1000));
Task t4 = Task.Run(() => Thread.Sleep(200));
int idx = Task.WaitAny(t3, t4);               // 阻塞直到任意一个完成
Console.WriteLine($"WaitAny: 第一个完成的是任务 {idx}");

// 4. ⚠️ Wait vs await 对比
// | 方式 | 阻塞线程 | 死锁风险 | 适用场景 |
// |------|---------|---------|---------|
// | await task | 否 | 低 | 异步方法内（推荐） |
// | task.Wait() | 是 | 高 | 特殊场景（需谨慎） |
// | task.Result | 是 | 高 | 特殊场景（需谨慎） |

// 5. 死锁演示（不要在生产代码中这样写）
// 在 UI 线程或 ASP.NET（非 Core）中：
// public string GetData()
// {
//     var task = GetDataAsync();
//     return task.Result;  // ⚠️ 死锁！UI 线程被阻塞等待 Task
// }                        // Task 完成需要回到 UI 线程 → 死锁
\`\`\`

### 七、Task.ContinueWith：任务链 ⭐⭐

\`\`\`csharp
// ContinueWith 在任务完成后执行回调（基于回调的异步模式）

// 1. 基本用法
Task initialTask = Task.Run(() =>
{
    Console.WriteLine("初始任务执行中...");
    Thread.Sleep(500);
    return 42;
});

Task continuationTask = initialTask.ContinueWith(prev =>
{
    // 此回调在初始任务完成后执行
    Console.WriteLine($"前一个任务结果: {prev.Result}");
    Console.WriteLine($"前一个任务状态: {prev.Status}");
    return prev.Result * 2;
});

int finalResult = await continuationTask;
Console.WriteLine($"最终结果: {finalResult}");

// 2. 按状态执行不同回调
Task riskyTask = Task.Run(() =>
{
    // 模拟可能失败的操作
    if (Random.Shared.Next(2) == 0)
        throw new InvalidOperationException("随机失败");
    return "成功";
});

riskyTask.ContinueWith(t =>
{
    Console.WriteLine($"✅ 成功: {t.Result}");
}, TaskContinuationOptions.OnlyOnRanToCompletion);

riskyTask.ContinueWith(t =>
{
    Console.WriteLine($"❌ 失败: {t.Exception?.InnerException?.Message}");
}, TaskContinuationOptions.OnlyOnFaulted);

await Task.Delay(100);  // 等待回调执行

// 3. ⚠️ ContinueWith vs await
// ContinueWith：回调风格，代码不够直观，容易遗漏异常处理
// await：同步风格，代码直观，异常自然传播
// 推荐：优先使用 await，ContinueWith 用于特殊场景
\`\`\`

### 八、Task.Result vs await：死锁陷阱 ⭐⭐⭐

\`\`\`csharp
// 理解 .Result 和 await 的本质区别

// 1. .Result：同步阻塞等待
async Task<int> SlowCalculationAsync()
{
    await Task.Delay(1000);
    return 42;
}

// void TestResult()
// {
//     // 在控制台应用中，以下代码可能正常工作
//     int result = SlowCalculationAsync().Result;  // ⚠️ 阻塞当前线程
//     Console.WriteLine(result);
//
//     // 在 UI 应用或 ASP.NET（非 Core）中，以下代码会死锁：
//     // 原因：UI 线程等待 .Result → Task 完成后需要回到 UI 线程 → 死锁
// }

// 2. await：异步等待，不阻塞
async Task TestAwaitAsync()
{
    int result = await SlowCalculationAsync();  // ✅ 不阻塞，没有死锁风险
    Console.WriteLine(result);
}

// 3. .GetAwaiter().GetResult()：另一种同步等待
// 与 .Result 类似，但异常传播方式不同（抛出原始异常而非 AggregateException）
// 同样有死锁风险，不推荐

// 4. 安全获取结果的方式
// a) 全链路 async/await（最佳）
// b) 使用 ConfigureAwait(false) 在库代码中
// c) 在独立的线程池线程上执行（不推荐）
//    Task.Run(() => SomeAsyncMethod().Result).Result;

// 5. 死锁原理图
Console.WriteLine("死锁原理:");
Console.WriteLine("  主线程 ──→ .Result 阻塞等待 ──→ [死锁]");
Console.WriteLine("  Task 完成 ──→ 需要回到主线程 ──→ 主线程被阻塞 ──→ [死锁]");
\`\`\`

### 九、Task.Status：任务状态 ⭐⭐

\`\`\`csharp
// Task.Status 跟踪任务的当前状态

// 1. 查看各种状态
async Task StatusDemoAsync()
{
    // Created → 任务已创建但未启动（Task.Run 自动启动）
    Task createdTask = Task.Run(() => Thread.Sleep(100));
    Console.WriteLine($"刚创建: {createdTask.Status}");  // WaitingToRun 或 Running

    await Task.Delay(50);
    Console.WriteLine($"运行中: {createdTask.Status}");  // Running

    await createdTask;
    Console.WriteLine($"完成后: {createdTask.Status}");  // RanToCompletion

    // Canceled
    using var cts = new CancellationTokenSource();
    cts.Cancel();
    Task canceledTask = Task.Run(() => { }, cts.Token);
    try { await canceledTask; } catch { }
    Console.WriteLine($"已取消: {canceledTask.Status}");  // Canceled

    // Faulted
    Task faultedTask = Task.Run(() => throw new Exception("失败"));
    try { await faultedTask; } catch { }
    Console.WriteLine($"已失败: {faultedTask.Status}");  // Faulted
}
await StatusDemoAsync();

// 2. Task 状态转换表
// | 状态 | 含义 |
// |------|------|
// | Created | 已创建，未启动 |
// | WaitingForActivation | 等待调度 |
// | WaitingToRun | 等待线程池线程 |
// | Running | 正在执行 |
// | WaitingForChildrenToComplete | 等待子任务 |
// | RanToCompletion | 成功完成 |
// | Canceled | 已取消 |
// | Faulted | 异常失败 |
Console.WriteLine("Task 状态: Created → WaitingToRun → Running → RanToCompletion/Faulted/Canceled");
\`\`\`

### 十、TaskCompletionSource：手动控制 Task ⭐⭐⭐

\`\`\`csharp
// TaskCompletionSource 让你手动创建和控制 Task 的完成
// 常用于将回调式 API 转换为 Task 式 API

// 1. 基本用法：创建可手动完成的 Task
async Task TcsBasicDemoAsync()
{
    var tcs = new TaskCompletionSource<string>();  // 创建 TaskCompletionSource

    // 模拟异步回调（如事件、定时器、外部通知）
    _ = Task.Run(async () =>
    {
        await Task.Delay(1000);                    // 模拟 1 秒后回调
        tcs.SetResult("操作成功!");                // 手动设置结果，Task 完成
    });

    Console.WriteLine("等待结果...");
    string result = await tcs.Task;                // 等待 Task 完成
    Console.WriteLine($"收到: {result}");
}
await TcsBasicDemoAsync();

// 2. 设置异常
async Task TcsExceptionDemoAsync()
{
    var tcs = new TaskCompletionSource<int>();

    _ = Task.Run(async () =>
    {
        await Task.Delay(500);
        tcs.SetException(new InvalidOperationException("操作失败!"));
    });

    try
    {
        int result = await tcs.Task;
    }
    catch (InvalidOperationException ex)
    {
        Console.WriteLine($"捕获异常: {ex.Message}");
    }
}
await TcsExceptionDemoAsync();

// 3. 设置取消
async Task TcsCancelDemoAsync()
{
    var tcs = new TaskCompletionSource<int>();
    using var cts = new CancellationTokenSource(2000);  // 2 秒后取消

    // 注册取消回调
    cts.Token.Register(() => tcs.TrySetCanceled());

    try
    {
        // 模拟长时间操作
        int result = await tcs.Task;
    }
    catch (OperationCanceledException)
    {
        Console.WriteLine("操作被取消");
    }
}
await TcsCancelDemoAsync();

// 4. 将 EAP（基于事件的异步模式）转换为 TAP（基于任务的异步模式）
// 经典场景：WebClient 的 DownloadStringCompleted 事件
async Task<string> DownloadStringTaskAsync(string url)
{
    var tcs = new TaskCompletionSource<string>();

    using var client = new System.Net.WebClient();
    client.DownloadStringCompleted += (s, e) =>
    {
        if (e.Error != null)
            tcs.TrySetException(e.Error);          // 错误
        else if (e.Cancelled)
            tcs.TrySetCanceled();                  // 取消
        else
            tcs.TrySetResult(e.Result);            // 成功
    };

    client.DownloadStringAsync(new Uri(url));       // 触发异步操作
    return await tcs.Task;                          // 等待完成
}
// 注：实际项目中 HttpClient 已原生支持 async，不需要 TCS 包装
Console.WriteLine("TaskCompletionSource: 将回调式 API 转为 awaitable");
\`\`\`

### 十一、关键总结

| 方法 | 用途 | 阻塞？ |
| --- | --- | --- |
| \`Task.Run\` | 在线程池上运行代码 | 否（异步） |
| \`Task.FromResult\` | 创建已完成 Task | 否 |
| \`Task.Delay\` | 异步等待 | 否 |
| \`Task.WhenAll\` | 等待所有 Task 完成 | 否 |
| \`Task.WhenAny\` | 等待任意 Task 完成 | 否 |
| \`task.Wait()\` | 同步等待 | 是 |
| \`task.Result\` | 同步获取结果 | 是 |
| \`task.ContinueWith\` | 任务完成后回调 | 否 |
| \`TaskCompletionSource\` | 手动控制 Task 完成 | 否 |

**最佳实践**：
1. 始终用 \`await\` 而不是 \`.Result\`/\`.Wait()\`
2. I/O 操作不要用 \`Task.Run\` 包装
3. 用 \`Task.WhenAll\` 并行执行多个独立任务
4. 用 \`Task.WhenAny\` + \`Task.Delay\` 实现超时
5. 用 \`TaskCompletionSource\` 将旧式回调 API 转为 async/await

`,
  },

  // ============================================================
  // 第六十九章：并行编程（Parallel/PLINQ）
  // ============================================================
  {
    id: 'csharp3-ch69',
    group: '第十三部分 异步编程',
    icon: '⚡',
    title: '第六十九章 并行编程（Parallel/PLINQ）',
    content: `## 第六十九章　并行编程（Parallel/PLINQ）

并行编程用于 CPU 密集型任务，利用多核处理器加速计算。本章讲解 \`Parallel\` 类和 PLINQ 的用法。

### 一、Parallel.For：并行 for 循环 ⭐⭐⭐

\`\`\`csharp
// Parallel.For 将循环迭代分配到多个线程上并行执行

// 1. 基本用法
Console.WriteLine("=== Parallel.For 基本用法 ===");
var sw = System.Diagnostics.Stopwatch.StartNew();

// 普通 for：串行执行
// for (int i = 0; i < 10; i++) { Thread.Sleep(100); }  // 约 1000ms

// Parallel.For：并行执行
Parallel.For(0, 10, i =>                         // 0 到 9（不含 10）
{
    Console.WriteLine($"[线程 {Environment.CurrentManagedThreadId}] 处理索引 {i}");
    Thread.Sleep(100);                           // 模拟 CPU 工作
});
sw.Stop();
Console.WriteLine($"Parallel.For 完成，耗时: {sw.ElapsedMilliseconds}ms");  // 远小于 1000ms

// 2. Parallel.For 的返回值：ParallelLoopResult
ParallelLoopResult result = Parallel.For(0, 100, (i, state) =>
{
    if (i == 50)
    {
        state.Break();                           // 尽早停止（已开始的迭代会完成）
        // state.Stop();                          // 立即停止（已开始的迭代也尽量停止）
    }
    // 处理工作...
});

Console.WriteLine($"是否完成: {result.IsCompleted}");
Console.WriteLine($"最低中断索引: {result.LowestBreakIteration}");

// 3. 带线程局部变量的 Parallel.For
// 每个线程维护自己的局部变量，最后合并
long totalSum = 0;
Parallel.For<long>(0, 1000,
    // 初始化：每个线程的局部变量
    () => 0,
    // 循环体：计算局部和
    (i, state, subtotal) =>
    {
        subtotal += i;                           // 累加到线程局部变量
        return subtotal;                         // 返回更新后的值
    },
    // 最终合并：将每个线程的局部结果合并到最终结果
    subtotal => Interlocked.Add(ref totalSum, subtotal)
);
Console.WriteLine($"0 到 999 总和: {totalSum}");  // 499500
\`\`\`

### 二、Parallel.ForEach：并行遍历集合 ⭐⭐⭐

\`\`\`csharp
// Parallel.ForEach 并行处理集合元素

// 1. 基本用法
Console.WriteLine("=== Parallel.ForEach 基本用法 ===");
string[] urls = { "url1", "url2", "url3", "url4", "url5", "url6", "url7", "url8" };

var sw = System.Diagnostics.Stopwatch.StartNew();
Parallel.ForEach(urls, url =>
{
    // 模拟处理每个 URL（如下载、解析）
    Console.WriteLine($"[线程 {Environment.CurrentManagedThreadId}] 处理: {url}");
    Thread.Sleep(200);                           // 模拟 I/O 或 CPU 工作
});
sw.Stop();
Console.WriteLine($"Parallel.ForEach 完成，耗时: {sw.ElapsedMilliseconds}ms");

// 2. 带取消支持的 Parallel.ForEach
using var cts = new CancellationTokenSource();
cts.CancelAfter(500);                           // 500ms 后取消

var options = new ParallelOptions
{
    CancellationToken = cts.Token,
    MaxDegreeOfParallelism = 4                   // 最多 4 个线程并行
};

try
{
    Parallel.ForEach(Enumerable.Range(0, 100), options, (i, state) =>
    {
        Thread.Sleep(100);
        Console.WriteLine($"处理 {i}");
        if (i > 10) state.Break();              // 提前停止
    });
}
catch (OperationCanceledException)
{
    Console.WriteLine("并行操作被取消");
}

// 3. 带线程局部变量的 Parallel.ForEach
var numbers = Enumerable.Range(1, 1000);
long sum = 0;
Parallel.ForEach(numbers,
    () => 0L,                                    // 线程局部初始化
    (num, state, localSum) => localSum + num,    // 累加
    localSum => Interlocked.Add(ref sum, localSum)  // 合并
);
Console.WriteLine($"1-1000 总和: {sum}");  // 500500
\`\`\`

### 三、Parallel.Invoke：并行执行多个操作 ⭐⭐

\`\`\`csharp
// Parallel.Invoke 并行执行多个无返回值的 Action

// 1. 基本用法
Console.WriteLine("=== Parallel.Invoke 基本用法 ===");
var sw = System.Diagnostics.Stopwatch.StartNew();

Parallel.Invoke(
    () => {                                     // 操作 1
        Console.WriteLine($"[线程 {Environment.CurrentManagedThreadId}] 操作1 开始");
        Thread.Sleep(1000);
        Console.WriteLine($"[线程 {Environment.CurrentManagedThreadId}] 操作1 完成");
    },
    () => {                                     // 操作 2
        Console.WriteLine($"[线程 {Environment.CurrentManagedThreadId}] 操作2 开始");
        Thread.Sleep(800);
        Console.WriteLine($"[线程 {Environment.CurrentManagedThreadId}] 操作2 完成");
    },
    () => {                                     // 操作 3
        Console.WriteLine($"[线程 {Environment.CurrentManagedThreadId}] 操作3 开始");
        Thread.Sleep(1200);
        Console.WriteLine($"[线程 {Environment.CurrentManagedThreadId}] 操作3 完成");
    }
);

sw.Stop();
Console.WriteLine($"Parallel.Invoke 完成，耗时: {sw.ElapsedMilliseconds}ms");  // 约 1200ms

// 2. 带 ParallelOptions 的 Invoke
var options = new ParallelOptions
{
    MaxDegreeOfParallelism = 2                  // 最多 2 个操作并行
};

Parallel.Invoke(options,
    () => Console.WriteLine("操作 A"),
    () => Console.WriteLine("操作 B"),
    () => Console.WriteLine("操作 C")            // 会等待前两个之一完成
);

// 3. Parallel.Invoke 适用场景
// - 初始化时并行加载多个资源
// - 并行执行多个独立的计算
// - 不需要返回值，只需等待全部完成
\`\`\`

### 四、PLINQ：并行 LINQ ⭐⭐⭐

\`\`\`csharp
// PLINQ (Parallel LINQ) 将 LINQ 查询自动并行化

// 1. AsParallel：开启并行查询
Console.WriteLine("=== PLINQ 基本用法 ===");

var numbers = Enumerable.Range(1, 50);

// 普通 LINQ：串行执行
var evenNumbers = numbers
    .Where(n => { Thread.Sleep(10); return n % 2 == 0; })
    .ToList();
Console.WriteLine($"普通 LINQ: {evenNumbers.Count} 个偶数");

// PLINQ：并行执行
var evenNumbersParallel = numbers
    .AsParallel()                               // 启用并行
    .Where(n => { Thread.Sleep(10); return n % 2 == 0; })
    .ToList();
Console.WriteLine($"PLINQ: {evenNumbersParallel.Count} 个偶数");

// 2. AsOrdered：保持原始顺序
var ordered = numbers
    .AsParallel()
    .AsOrdered()                                // 保持原始顺序（有性能开销）
    .Where(n => n % 2 == 0)
    .ToList();
Console.WriteLine($"顺序结果: {string.Join(", ", ordered.Take(5))}...");

// 3. AsSequential：切换回串行
var mixed = numbers
    .AsParallel()                               // 并行：过滤
    .Where(n => n % 2 == 0)
    .AsSequential()                             // 串行：后续操作
    .Take(5)                                    // 取前 5 个（顺序敏感）
    .ToList();
Console.WriteLine($"混合: {string.Join(", ", mixed)}");

// 4. WithCancellation：支持取消
using var cts = new CancellationTokenSource();
cts.CancelAfter(500);

try
{
    var canceled = numbers
        .AsParallel()
        .WithCancellation(cts.Token)            // 传入取消令牌
        .Where(n => { Thread.Sleep(100); return true; })
        .ToList();
}
catch (OperationCanceledException)
{
    Console.WriteLine("PLINQ 查询被取消");
}
\`\`\`

### 五、PLINQ 高级选项 ⭐⭐⭐

\`\`\`csharp
// 1. WithDegreeOfParallelism：控制并行度
var numbers = Enumerable.Range(1, 100);

var result = numbers
    .AsParallel()
    .WithDegreeOfParallelism(4)                 // 最多 4 个线程并行
    .Where(n => { Thread.Sleep(10); return n % 2 == 0; })
    .Select(n => n * n)
    .ToList();
Console.WriteLine($"WithDegreeOfParallelism(4): {result.Count} 个结果");

// 2. WithExecutionMode：强制并行
var result2 = numbers
    .AsParallel()
    .WithExecutionMode(ParallelExecutionMode.ForceParallelism)  // 强制并行
    .Where(n => n % 2 == 0)
    .ToList();
Console.WriteLine($"强制并行: {result2.Count} 个结果");

// 3. WithMergeOptions：控制结果合并方式
// NotBuffered：立即返回结果（流式）
var streaming = numbers
    .AsParallel()
    .WithMergeOptions(ParallelMergeOptions.NotBuffered)
    .Where(n => n % 2 == 0)
    .Select(n => { Console.WriteLine($"流式: {n}"); return n; })
    .ToList();

// FullyBuffered：先全部计算完再返回（默认）
// AutoBuffered：系统自动选择（默认）

// 4. 聚合操作：Aggregate
int sum = numbers
    .AsParallel()
    .Aggregate(
        seed: 0,                                // 初始值
        func: (acc, n) => acc + n,              // 累加
        resultSelector: r => r                  // 结果选择器
    );
Console.WriteLine($"并行聚合: {sum}");

// 5. ForAll：并行执行操作（无返回值）
numbers
    .AsParallel()
    .Where(n => n % 10 == 0)
    .ForAll(n => Console.WriteLine($"ForAll: {n}"));  // 并行执行 Console.WriteLine
\`\`\`

### 六、并行性能注意事项 ⭐⭐⭐

\`\`\`csharp
// 1. 并行不是银弹：小数据量并行反而更慢
//    原因：线程调度、任务分配、结果合并都有开销

Console.WriteLine("=== 并行 vs 串行性能对比 ===");

// 小数据量：串行更快
var smallData = Enumerable.Range(1, 10);
var sw = System.Diagnostics.Stopwatch.StartNew();
var r1 = smallData.Where(n => n % 2 == 0).ToList();
sw.Stop();
Console.WriteLine($"串行(10项): {sw.ElapsedTicks} ticks");

sw.Restart();
var r2 = smallData.AsParallel().Where(n => n % 2 == 0).ToList();
sw.Stop();
Console.WriteLine($"并行(10项): {sw.ElapsedTicks} ticks");

// 大数据量：并行更快
var largeData = Enumerable.Range(1, 1000000);
sw.Restart();
var r3 = largeData.Where(n => n % 2 == 0).ToList();
sw.Stop();
Console.WriteLine($"串行(100万): {sw.ElapsedMilliseconds}ms");

sw.Restart();
var r4 = largeData.AsParallel().Where(n => n % 2 == 0).ToList();
sw.Stop();
Console.WriteLine($"并行(100万): {sw.ElapsedMilliseconds}ms");

// 2. 避免并行中的共享状态
// ❌ 错误：共享变量导致竞态条件
int counter = 0;
Parallel.For(0, 1000, i =>
{
    counter++;  // ❌ 非线程安全！结果可能 < 1000
});
Console.WriteLine($"错误计数器: {counter} (可能不是 1000)");

// ✅ 正确：使用 Interlocked
int safeCounter = 0;
Parallel.For(0, 1000, i =>
{
    Interlocked.Increment(ref safeCounter);     // ✅ 线程安全
});
Console.WriteLine($"安全计数器: {safeCounter} (一定是 1000)");

// 3. 并行度建议
// - CPU 密集型：MaxDegreeOfParallelism ≈ Environment.ProcessorCount
// - I/O 密集型：MaxDegreeOfParallelism 可以更大
Console.WriteLine($"处理器核心数: {Environment.ProcessorCount}");
Console.WriteLine($"建议并行度: {Environment.ProcessorCount} (CPU 密集型)");
\`\`\`

### 七、关键总结

| 方法 | 用途 | 适用场景 |
| --- | --- | --- |
| \`Parallel.For\` | 并行 for 循环 | 固定次数迭代 |
| \`Parallel.ForEach\` | 并行遍历集合 | 集合元素并行处理 |
| \`Parallel.Invoke\` | 并行执行多个操作 | 独立操作并行 |
| \`AsParallel()\` | 启用 PLINQ | LINQ 查询并行化 |
| \`AsOrdered()\` | 保持顺序 | 需要原始顺序 |
| \`WithDegreeOfParallelism()\` | 控制并行度 | 限制线程数 |
| \`WithCancellation()\` | 支持取消 | 可取消的并行操作 |

**最佳实践**：
1. 并行适用于 CPU 密集型任务，I/O 操作用 async/await
2. 小数据量不并行（开销大于收益）
3. 避免并行中的共享状态，用 Interlocked 或锁
4. 并行度 ≈ 处理器核心数（CPU 密集型）
5. PLINQ 保持顺序用 \`AsOrdered()\`（有性能开销）
6. 使用 \`ParallelOptions\` 配置取消和并行度

`,
  },

  // ============================================================
  // 第七十章：锁与线程安全
  // ============================================================
  {
    id: 'csharp3-ch70',
    group: '第十三部分 异步编程',
    icon: '🔒',
    title: '第七十章 锁与线程安全',
    content: `## 第七十章　锁与线程安全

多线程环境下，共享数据的访问必须同步。本章讲解 C# 中的各种锁机制和线程安全模式。

### 一、lock 语句：最常用的同步原语 ⭐⭐⭐

\`\`\`csharp
// lock 是 C# 中最简单的互斥锁，确保同一时间只有一个线程访问临界区

// 1. 基本用法
class Counter
{
    private readonly object _lock = new();      // 锁对象（必须是引用类型）
    private int _value = 0;                      // 需要保护的共享数据

    public void Increment()
    {
        lock (_lock)                             // 获取锁，其他线程在此等待
        {
            _value++;                            // 临界区：一次只有一个线程能执行
        }                                        // 释放锁
    }

    public int GetValue()
    {
        lock (_lock)                             // 读操作也需要锁
        {
            return _value;                       // 确保读取到最新值
        }
    }
}

// 2. 演示：没有锁的竞态条件
int unsafeCounter = 0;
var tasks = new List<Task>();
for (int i = 0; i < 1000; i++)
{
    tasks.Add(Task.Run(() =>
    {
        unsafeCounter++;                         // ❌ 非线程安全！可能丢失增量
    }));
}
await Task.WhenAll(tasks);
Console.WriteLine($"无锁计数器: {unsafeCounter} (期望 1000，实际可能小于 1000)");

// 3. 有锁的版本
int safeCounter = 0;
object lockObj = new();
tasks.Clear();
for (int i = 0; i < 1000; i++)
{
    tasks.Add(Task.Run(() =>
    {
        lock (lockObj)                           // ✅ 线程安全
        {
            safeCounter++;
        }
    }));
}
await Task.WhenAll(tasks);
Console.WriteLine($"有锁计数器: {safeCounter} (一定是 1000)");

// 4. lock 的注意事项
// ✅ 锁对象应该是 private readonly 引用类型
// ❌ 不要锁 this（外部代码也可能锁 this，导致死锁）
// ❌ 不要锁 typeof(MyClass)（类型对象是全局的）
// ❌ 不要锁 string（字符串可能被内联共享）
// ❌ 不要在锁内调用外部代码（可能死锁）
// ✅ 锁的粒度要尽可能小
\`\`\`

### 二、Monitor：lock 的底层实现 ⭐⭐

\`\`\`csharp
// lock 语句是 Monitor 的语法糖
// lock(obj) { ... } 等价于：
// Monitor.Enter(obj); try { ... } finally { Monitor.Exit(obj); }

// 1. Monitor 手动控制
object monitorObj = new();
bool lockTaken = false;

try
{
    Monitor.Enter(monitorObj, ref lockTaken);    // 尝试获取锁
    // 临界区代码
    Console.WriteLine("Monitor 获取锁成功");
}
finally
{
    if (lockTaken)
        Monitor.Exit(monitorObj);                // 释放锁
}

// 2. Monitor.TryEnter：尝试获取锁（不阻塞）
object tryObj = new();
if (Monitor.TryEnter(tryObj, TimeSpan.FromMilliseconds(100)))  // 最多等 100ms
{
    try
    {
        Console.WriteLine("TryEnter 成功获取锁");
    }
    finally
    {
        Monitor.Exit(tryObj);
    }
}
else
{
    Console.WriteLine("TryEnter 超时，未能获取锁");
}

// 3. Monitor.Wait / Pulse：线程间通信
// 生产者-消费者模式（经典用法）
object pulseObj = new();
bool ready = false;

// 消费者线程
Task.Run(() =>
{
    lock (pulseObj)
    {
        while (!ready)
        {
            Console.WriteLine("消费者: 等待数据...");
            Monitor.Wait(pulseObj);              // 释放锁并等待 Pulse
        }
        Console.WriteLine("消费者: 收到数据，开始处理");
    }
});

// 生产者线程
await Task.Delay(500);
lock (pulseObj)
{
    Console.WriteLine("生产者: 数据就绪，通知消费者");
    ready = true;
    Monitor.Pulse(pulseObj);                     // 通知一个等待的线程
}
await Task.Delay(200);
\`\`\`

### 三、SemaphoreSlim：信号量 ⭐⭐⭐

\`\`\`csharp
// SemaphoreSlim 允许多个线程同时访问资源，限制并发数
// 适合场景：限制并发 HTTP 请求数、限制并发文件操作数

// 1. 基本用法：限制并发数为 3
Console.WriteLine("=== SemaphoreSlim 限制并发数 ===");
var semaphore = new SemaphoreSlim(3);           // 初始允许 3 个线程同时进入

var sw = System.Diagnostics.Stopwatch.StartNew();
var tasks = new List<Task>();
for (int i = 1; i <= 10; i++)
{
    int id = i;
    tasks.Add(Task.Run(async () =>
    {
        Console.WriteLine($"任务 {id} 等待进入...");
        await semaphore.WaitAsync();             // 异步等待信号量
        try
        {
            Console.WriteLine($"任务 {id} 开始执行（可用槽位: {semaphore.CurrentCount}）");
            await Task.Delay(1000);              // 模拟工作
            Console.WriteLine($"任务 {id} 完成");
        }
        finally
        {
            semaphore.Release();                 // 释放信号量（必须放在 finally 中）
        }
    }));
}
await Task.WhenAll(tasks);
sw.Stop();
Console.WriteLine($"全部完成，耗时: {sw.ElapsedMilliseconds}ms");
// 10 个任务，每次 3 个并发，每批 1 秒 → 约 4 秒

// 2. SemaphoreSlim 作为异步锁
// 当初始计数为 1 时，行为类似 lock，但支持异步
var asyncLock = new SemaphoreSlim(1, 1);        // 初始 1，最大 1

async Task AccessResourceAsync(int id)
{
    await asyncLock.WaitAsync();                 // 异步获取锁
    try
    {
        Console.WriteLine($"线程 {id} 进入临界区");
        await Task.Delay(100);
        Console.WriteLine($"线程 {id} 离开临界区");
    }
    finally
    {
        asyncLock.Release();                     // 释放锁
    }
}

// 3. 超时等待
bool entered = await semaphore.WaitAsync(TimeSpan.FromMilliseconds(500));
if (entered)
{
    try
    {
        Console.WriteLine("成功获取信号量");
    }
    finally
    {
        semaphore.Release();
    }
}
else
{
    Console.WriteLine("获取信号量超时");
}

// 注意：SemaphoreSlim 不支持跨进程，跨进程用 Semaphore
\`\`\`

### 四、ReaderWriterLockSlim：读写锁 ⭐⭐⭐

\`\`\`csharp
// ReaderWriterLockSlim 区分读锁和写锁
// 多个线程可以同时持有读锁（并发读）
// 写锁是独占的（写时不能读，读时不能写）

// 1. 基本用法
class ThreadSafeCache
{
    private readonly ReaderWriterLockSlim _rwLock = new();
    private readonly Dictionary<int, string> _cache = new();

    // 读操作：允许多个线程并发读取
    public string? Get(int key)
    {
        _rwLock.EnterReadLock();                // 获取读锁（多个线程可以同时持有）
        try
        {
            return _cache.TryGetValue(key, out var value) ? value : null;
        }
        finally
        {
            _rwLock.ExitReadLock();              // 释放读锁
        }
    }

    // 写操作：独占访问
    public void Set(int key, string value)
    {
        _rwLock.EnterWriteLock();               // 获取写锁（独占，阻塞所有读写）
        try
        {
            _cache[key] = value;                // 安全修改
        }
        finally
        {
            _rwLock.ExitWriteLock();             // 释放写锁
        }
    }

    // 可升级的读锁：先读，必要时升级为写
    public string GetOrAdd(int key, Func<int, string> factory)
    {
        _rwLock.EnterUpgradeableReadLock();     // 获取可升级的读锁
        try
        {
            if (_cache.TryGetValue(key, out var value))
                return value;                    // 缓存命中，不需要升级

            // 缓存未命中，升级为写锁
            _rwLock.EnterWriteLock();            // 升级为写锁
            try
            {
                value = factory(key);            // 创建新值
                _cache[key] = value;             // 写入缓存
                return value;
            }
            finally
            {
                _rwLock.ExitWriteLock();         // 降级回读锁
            }
        }
        finally
        {
            _rwLock.ExitUpgradeableReadLock();   // 释放读锁
        }
    }
}

// 2. 演示读写锁的并发优势
var cache = new ThreadSafeCache();
var sw = System.Diagnostics.Stopwatch.StartNew();

// 多个线程并发读取
var readTasks = new List<Task>();
for (int i = 0; i < 10; i++)
{
    readTasks.Add(Task.Run(() =>
    {
        for (int j = 0; j < 100; j++)
        {
            cache.Get(j);                        // 并发读，不互相阻塞
        }
    }));
}
await Task.WhenAll(readTasks);
sw.Stop();
Console.WriteLine($"并发读完成，耗时: {sw.ElapsedMilliseconds}ms");
\`\`\`

### 五、Interlocked：原子操作 ⭐⭐⭐

\`\`\`csharp
// Interlocked 提供无锁的原子操作，性能最高
// 适用于简单的计数器、标志位等场景

// 1. Increment / Decrement：原子增减
int counter = 0;
Parallel.For(0, 10000, _ =>
{
    Interlocked.Increment(ref counter);         // 原子递增，比 lock 快得多
});
Console.WriteLine($"Interlocked.Increment: {counter}");  // 一定是 10000

// 2. Add：原子加法
int total = 0;
Parallel.For(0, 1000, i =>
{
    Interlocked.Add(ref total, i);              // 原子加法：total += i
});
Console.WriteLine($"Interlocked.Add: {total}");  // 0-999 的和

// 3. Exchange：原子交换
int value = 42;
int oldValue = Interlocked.Exchange(ref value, 100);  // 将 value 设为 100，返回旧值
Console.WriteLine($"Exchange: old={oldValue}, new={value}");  // old=42, new=100

// 4. CompareExchange：原子比较交换（CAS）
int target = 10;
int original = Interlocked.CompareExchange(ref target, 20, 10);
// 如果 target == 10，则设 target = 20，返回原始值
Console.WriteLine($"CompareExchange: original={original}, target={target}");  // original=10, target=20

int target2 = 5;
int original2 = Interlocked.CompareExchange(ref target2, 20, 10);
// 如果 target2 == 10 则设 target2 = 20；但 target2 == 5，不进行交换
Console.WriteLine($"CompareExchange(不匹配): original={original2}, target={target2}");  // original=5, target=5

// 5. Read：原子读取 64 位值
long bigValue = 123456789;
long read = Interlocked.Read(ref bigValue);     // 原子读取 long（64 位系统上非必需，但保证兼容性）
Console.WriteLine($"Interlocked.Read: {read}");

// 6. Interlocked 适用场景
// ✅ 简单计数器、累加器
// ✅ 标志位设置（如 _isDisposed）
// ✅ 无锁数据结构的构建块
// ❌ 不适用于复杂操作（多个变量需要原子性）
\`\`\`

### 六、volatile：禁止编译器优化 ⭐⭐

\`\`\`csharp
// volatile 告诉编译器：此字段可能被多个线程同时修改
// 禁止编译器对读写进行优化（如缓存到寄存器）
// 确保每次读写都直接访问内存

// 1. volatile 基本用法
class VolatileDemo
{
    private volatile bool _shouldStop = false;   // volatile 字段

    public void Worker()
    {
        while (!_shouldStop)                     // 每次循环都从内存读取最新值
        {
            // 执行工作...
        }
        Console.WriteLine("工作线程停止");
    }

    public void Stop()
    {
        _shouldStop = true;                      // 写入立即对其它线程可见
    }
}

// 2. volatile 的局限性
// ⚠️ volatile 只保证单个读写的原子性，不保证复合操作的原子性
// ❌ volatile int count; count++;  ← count++ 不是原子操作（读-改-写）
// ✅ 正确做法：Interlocked.Increment(ref count)
// ✅ 或使用 lock

// 3. volatile 使用场景
// - 简单的标志位（如 _isDisposed、_shouldStop）
// - 单次赋值的引用（如 _initialized = true）
// - 不适用于需要复合操作或有依赖关系的场景

// 4. volatile vs lock vs Interlocked
// | 方式 | 性能 | 功能 | 适用场景 |
// |------|------|------|---------|
// | volatile | 最高 | 单次读写可见性 | 简单标志位 |
// | Interlocked | 很高 | 原子操作 | 计数器、CAS |
// | lock | 较低 | 完整互斥 | 复杂临界区 |
Console.WriteLine("volatile: 轻量级可见性保证，但不提供原子性");
\`\`\`

### 七、线程安全模式 ⭐⭐⭐

\`\`\`csharp
// 1. 不可变对象（Immutable）—— 最安全的线程安全模式
// 不可变对象创建后无法修改，天然线程安全

record ImmutablePerson(string Name, int Age);   // record 默认不可变

var person = new ImmutablePerson("Alice", 30);
// person.Name = "Bob";  // ❌ 编译错误，record 属性只读
var newPerson = person with { Age = 31 };       // ✅ 创建新对象而非修改

// 2. 线程静态存储（ThreadStatic）
// 每个线程有自己独立的字段副本
class ThreadStaticDemo
{
    [ThreadStatic]
    private static int _threadLocalValue;        // 每个线程独立的值

    public static void Increment()
    {
        _threadLocalValue++;                     // 线程安全，无需锁
    }

    public static int GetValue() => _threadLocalValue;
}

// 3. ThreadLocal<T>：更现代的线程本地存储
ThreadLocal<int> threadLocal = new(() => 0);    // 每个线程初始化为 0
Parallel.For(0, 100, i =>
{
    threadLocal.Value++;                         // 线程安全，无需锁
});
Console.WriteLine($"ThreadLocal: 每个线程独立计数");

// 4. AsyncLocal<T>：异步本地存储
// 在 async/await 链中保持值，即使跨越多个线程
AsyncLocal<string> asyncLocal = new();
asyncLocal.Value = "初始值";

await Task.Run(async () =>
{
    Console.WriteLine($"异步上下文1: {asyncLocal.Value}");  // 初始值
    asyncLocal.Value = "修改后";
    await Task.Delay(100);
    Console.WriteLine($"异步上下文1(await后): {asyncLocal.Value}");  // 修改后
});

Console.WriteLine($"主线程: {asyncLocal.Value}");  // 初始值（不受异步上下文影响）
\`\`\`

### 八、死锁及其预防 ⭐⭐⭐

\`\`\`csharp
// 1. 死锁的四个必要条件
// a) 互斥：资源不能被共享
// b) 持有并等待：持有资源的同时等待其他资源
// c) 不可抢占：资源不能被强制释放
// d) 循环等待：形成等待环

// 2. 经典死锁演示
object lockA = new();
object lockB = new();

async Task DeadlockDemoAsync()
{
    // 线程 1：先锁 A，再锁 B
    Task t1 = Task.Run(() =>
    {
        lock (lockA)
        {
            Console.WriteLine("线程1: 获取锁 A");
            Thread.Sleep(100);                   // 模拟一些工作，增加死锁概率
            lock (lockB)
            {
                Console.WriteLine("线程1: 获取锁 B");
            }
        }
    });

    // 线程 2：先锁 B，再锁 A（与线程 1 顺序相反！）
    Task t2 = Task.Run(() =>
    {
        lock (lockB)
        {
            Console.WriteLine("线程2: 获取锁 B");
            Thread.Sleep(100);
            lock (lockA)
            {
                Console.WriteLine("线程2: 获取锁 A");
            }
        }
    });

    await Task.WhenAny(Task.WhenAll(t1, t2), Task.Delay(2000));
    Console.WriteLine("如果 2 秒内未完成，则发生了死锁");
}

// 3. 死锁预防策略
// ✅ 策略 1：按固定顺序获取锁（最重要）
// 所有线程都按 lockA → lockB 的顺序获取锁
// ✅ 策略 2：使用超时（TryEnter）
// Monitor.TryEnter(obj, timeout) 避免无限等待
// ✅ 策略 3：减少锁的粒度
// 尽量缩小临界区，降低锁的持有时间
// ✅ 策略 4：避免嵌套锁
// 尽量不要在一个锁内部再获取另一个锁
// ✅ 策略 5：使用更高级的同步原语
// 如 SemaphoreSlim、ConcurrentDictionary 等

Console.WriteLine("死锁预防：统一锁顺序 + 超时 + 减少锁粒度");
\`\`\`

### 九、关键总结

| 原语 | 用途 | 异步支持 | 性能 |
| --- | --- | --- | --- |
| \`lock\` | 互斥锁 | ❌ | 中等 |
| \`Monitor\` | lock 的底层 | ❌ | 中等 |
| \`SemaphoreSlim\` | 信号量（限制并发） | ✅ | 高 |
| \`ReaderWriterLockSlim\` | 读写锁 | ❌ | 中等 |
| \`Interlocked\` | 原子操作 | ❌ | 最高 |
| \`volatile\` | 内存可见性 | ❌ | 最高 |
| \`ThreadLocal\<T\>\` | 线程本地存储 | ❌ | 高 |
| \`AsyncLocal\<T\>\` | 异步本地存储 | ✅ | 高 |

**最佳实践**：
1. 优先使用不可变对象，避免共享状态
2. 简单的计数器用 \`Interlocked\`
3. 限制并发数用 \`SemaphoreSlim\`（支持异步）
4. 读多写少用 \`ReaderWriterLockSlim\`
5. 复杂临界区用 \`lock\`
6. 锁对象必须是 \`private readonly\` 引用类型
7. 统一锁的获取顺序，避免死锁
8. 尽量缩小临界区范围

`,
  },

  // ============================================================
  // 第七十一章：并发集合
  // ============================================================
  {
    id: 'csharp3-ch71',
    group: '第十三部分 异步编程',
    icon: '📦',
    title: '第七十一章 并发集合',
    content: `## 第七十一章　并发集合

\`System.Collections.Concurrent\` 命名空间提供了线程安全的集合类，无需手动加锁即可在并发环境中安全使用。

### 一、ConcurrentDictionary：线程安全字典 ⭐⭐⭐

\`\`\`csharp
// ConcurrentDictionary 是并发编程中最常用的集合
// 提供线程安全的键值对存储，无需 lock

// 1. 基本 CRUD 操作
var dict = new ConcurrentDictionary<int, string>();

// Add：添加（如果键已存在则返回 false）
bool added = dict.TryAdd(1, "Alice");           // 返回 true
bool added2 = dict.TryAdd(1, "Bob");            // 返回 false（键已存在）
Console.WriteLine($"添加 1: {added}, 添加 2: {added2}");

// Get：获取值
if (dict.TryGetValue(1, out string? value))
{
    Console.WriteLine($"键 1 的值: {value}");    // Alice
}

// Update：原子更新
dict[1] = "Alice Updated";                       // 索引器直接赋值
bool updated = dict.TryUpdate(1, "Alice New", "Alice Updated");  // 条件更新
Console.WriteLine($"更新: {updated}");
Console.WriteLine($"当前值: {dict[1]}");

// Delete：删除
bool removed = dict.TryRemove(1, out string? removedValue);
Console.WriteLine($"删除: {removed}, 值: {removedValue}");

// 2. GetOrAdd：获取或添加（原子操作）
var cache = new ConcurrentDictionary<int, string>();

// 如果键不存在，则添加新值；如果存在，则返回现有值
string val1 = cache.GetOrAdd(1, "Alice");       // 添加 Alice
string val2 = cache.GetOrAdd(1, "Bob");         // 键已存在，返回 Alice
Console.WriteLine($"val1={val1}, val2={val2}");  // 都是 Alice

// 带工厂方法的 GetOrAdd（延迟计算）
string val3 = cache.GetOrAdd(2, key =>
{
    Console.WriteLine($"创建键 {key} 的值...");  // 只在键不存在时执行
    return $"User_{key}";
});
Console.WriteLine($"val3: {val3}");

// 3. AddOrUpdate：添加或更新（原子操作）
var counters = new ConcurrentDictionary<string, int>();

// 添加或更新：如果键不存在则添加，否则更新
int newValue = counters.AddOrUpdate("page_views",
    addValue: 1,                                 // 添加时的初始值
    updateValueFactory: (key, oldValue) => oldValue + 1  // 更新时的新值
);
Console.WriteLine($"page_views: {newValue}");    // 1

// 再次调用，更新值
int newValue2 = counters.AddOrUpdate("page_views", 1, (k, v) => v + 1);
Console.WriteLine($"page_views: {newValue2}");   // 2

// 4. 并发操作演示
var concurrentDict = new ConcurrentDictionary<int, int>();
var tasks = new List<Task>();

for (int i = 0; i < 10; i++)
{
    int id = i;
    tasks.Add(Task.Run(() =>
    {
        for (int j = 0; j < 1000; j++)
        {
            // 原子递增计数器（无需 lock）
            concurrentDict.AddOrUpdate(id, 1, (k, v) => v + 1);
        }
    }));
}

await Task.WhenAll(tasks);
Console.WriteLine($"并发更新完成，每个键的计数: {concurrentDict[0]}");  // 1000
Console.WriteLine($"总条目: {concurrentDict.Count}");
\`\`\`

### 二、ConcurrentQueue：线程安全队列 ⭐⭐⭐

\`\`\`csharp
// ConcurrentQueue 是 FIFO（先进先出）的线程安全队列
// 适合生产者-消费者模式

// 1. 基本操作
var queue = new ConcurrentQueue<int>();

// Enqueue：入队
queue.Enqueue(1);
queue.Enqueue(2);
queue.Enqueue(3);
Console.WriteLine($"队列元素数: {queue.Count}");

// TryDequeue：出队（返回 false 表示队列为空）
if (queue.TryDequeue(out int item))
{
    Console.WriteLine($"出队: {item}");          // 1
}
Console.WriteLine($"剩余: {queue.Count}");       // 2

// TryPeek：查看队首但不移除
if (queue.TryPeek(out int peek))
{
    Console.WriteLine($"队首: {peek}");           // 2
}
Console.WriteLine($"Peek 后剩余: {queue.Count}"); // 2（Peek 不移除）

// 2. 生产者-消费者演示
var workQueue = new ConcurrentQueue<string>();
var cts = new CancellationTokenSource(TimeSpan.FromSeconds(3));

// 生产者：不断添加任务
var producer = Task.Run(() =>
{
    for (int i = 1; i <= 100; i++)
    {
        workQueue.Enqueue($"任务_{i}");
        Thread.Sleep(20);                        // 模拟生产间隔
    }
    Console.WriteLine("生产者: 所有任务已添加");
});

// 消费者：不断处理任务
var consumer = Task.Run(() =>
{
    while (!cts.Token.IsCancellationRequested || !workQueue.IsEmpty)
    {
        if (workQueue.TryDequeue(out string? task))
        {
            Console.WriteLine($"消费者处理: {task}");
            Thread.Sleep(50);                    // 模拟处理时间
        }
        else
        {
            Thread.Sleep(10);                    // 队列空，短暂等待
        }
    }
    Console.WriteLine("消费者: 停止处理");
});

await Task.WhenAll(producer, consumer);

// 3. 快照操作
var snapshotQueue = new ConcurrentQueue<int>();
for (int i = 0; i < 5; i++) snapshotQueue.Enqueue(i);

// ToArray：获取当前队列的快照
int[] snapshot = snapshotQueue.ToArray();
Console.WriteLine($"快照: [{string.Join(", ", snapshot)}]");
\`\`\`

### 三、ConcurrentStack：线程安全栈 ⭐⭐⭐

\`\`\`csharp
// ConcurrentStack 是 LIFO（后进先出）的线程安全栈

// 1. 基本操作
var stack = new ConcurrentStack<int>();

// Push：压栈
stack.Push(1);
stack.Push(2);
stack.Push(3);
Console.WriteLine($"栈元素数: {stack.Count}");

// TryPop：弹栈（返回 false 表示栈为空）
if (stack.TryPop(out int popped))
{
    Console.WriteLine($"弹栈: {popped}");         // 3（后进先出）
}

// TryPeek：查看栈顶但不移除
if (stack.TryPeek(out int top))
{
    Console.WriteLine($"栈顶: {top}");             // 2
}

// PushRange：批量压栈
stack.PushRange(new[] { 10, 20, 30 });
Console.WriteLine($"批量压栈后: {stack.Count}");  // 5

// TryPopRange：批量弹栈
int[] poppedItems = new int[3];
int poppedCount = stack.TryPopRange(poppedItems);
Console.WriteLine($"批量弹栈: {poppedCount} 个元素");
Console.WriteLine($"弹栈顺序: [{string.Join(", ", poppedItems)}]");  // 30, 20, 10

// 2. 并发场景：任务撤销栈
var undoStack = new ConcurrentStack<string>();
var tasks = new List<Task>();

for (int i = 0; i < 5; i++)
{
    int id = i;
    tasks.Add(Task.Run(() =>
    {
        for (int j = 0; j < 10; j++)
        {
            undoStack.Push($"线程{id}_操作{j}");
        }
    }));
}

await Task.WhenAll(tasks);
Console.WriteLine($"撤销栈总数: {undoStack.Count}");  // 50
\`\`\`

### 四、ConcurrentBag：线程安全无序集合 ⭐⭐

\`\`\`csharp
// ConcurrentBag 是无序的线程安全集合
// 特别适合同一线程既生产又消费的场景（工作窃取）

// 1. 基本操作
var bag = new ConcurrentBag<int>();

// Add：添加元素
bag.Add(1);
bag.Add(2);
bag.Add(3);
Console.WriteLine($"Bag 元素数: {bag.Count}");

// TryTake：取出元素（取出顺序不确定）
if (bag.TryTake(out int taken))
{
    Console.WriteLine($"取出: {taken}");
}
Console.WriteLine($"取出后剩余: {bag.Count}");

// TryPeek：查看但不移除
if (bag.TryPeek(out int peeked))
{
    Console.WriteLine($"查看: {peeked}");
}

// 2. ConcurrentBag 的优势：工作窃取
// 每个线程有自己的本地列表，优先从本地列表取
// 本地列表为空时，从其他线程"窃取"元素
// 这种设计减少了线程间的竞争

// 3. 并发添加和取出
var sharedBag = new ConcurrentBag<int>();
var tasks = new List<Task>();

// 5 个生产者线程
for (int i = 0; i < 5; i++)
{
    int id = i;
    tasks.Add(Task.Run(() =>
    {
        for (int j = 0; j < 100; j++)
        {
            sharedBag.Add(id * 1000 + j);        // 每个线程添加 100 个元素
        }
    }));
}

await Task.WhenAll(tasks);

// 从同一个 Bag 中取出
int total = 0;
while (sharedBag.TryTake(out _))
{
    total++;
}
Console.WriteLine($"总共取出: {total} 个元素");  // 500
\`\`\`

### 五、BlockingCollection：阻塞集合 ⭐⭐⭐

\`\`\`csharp
// BlockingCollection 是生产者-消费者模式的终极方案
// 当集合为空时，消费者自动阻塞等待
// 当集合满时，生产者自动阻塞等待（有界集合）

// 1. 基本用法（无界集合）
Console.WriteLine("=== BlockingCollection 基本用法 ===");

using var blockingCollection = new BlockingCollection<int>();  // 无界

// 生产者
var producer = Task.Run(() =>
{
    for (int i = 1; i <= 10; i++)
    {
        blockingCollection.Add(i);               // 添加元素
        Console.WriteLine($"生产: {i}");
        Thread.Sleep(100);
    }
    blockingCollection.CompleteAdding();         // 标记生产完成
    Console.WriteLine("生产者: 完成添加");
});

// 消费者
var consumer = Task.Run(() =>
{
    // GetConsumingEnumerable 自动阻塞，直到 CompleteAdding 被调用
    foreach (int item in blockingCollection.GetConsumingEnumerable())
    {
        Console.WriteLine($"消费: {item}");
        Thread.Sleep(200);                       // 模拟消费比生产慢
    }
    Console.WriteLine("消费者: 完成消费");
});

await Task.WhenAll(producer, consumer);

// 2. 有界集合：限制容量
Console.WriteLine("\\n=== 有界 BlockingCollection ===");

using var boundedCollection = new BlockingCollection<int>(3);  // 容量 3

var producer2 = Task.Run(() =>
{
    for (int i = 1; i <= 10; i++)
    {
        boundedCollection.Add(i);                // 集合满时自动阻塞
        Console.WriteLine($"生产: {i} (集合大小: {boundedCollection.Count})");
    }
    boundedCollection.CompleteAdding();
});

var consumer2 = Task.Run(() =>
{
    foreach (int item in boundedCollection.GetConsumingEnumerable())
    {
        Console.WriteLine($"消费: {item}");
        Thread.Sleep(300);                       // 消费慢 → 生产者会阻塞
    }
});

await Task.WhenAll(producer2, consumer2);

// 3. TryAdd：尝试添加（带超时）
using var bc = new BlockingCollection<int>(1);
bc.Add(1);                                       // 集合已满（容量 1）

if (bc.TryAdd(2, TimeSpan.FromMilliseconds(500)))  // 尝试添加，最多等 500ms
{
    Console.WriteLine("添加成功");
}
else
{
    Console.WriteLine("添加超时（集合已满）");
}

// 4. BlockingCollection 底层集合
// 默认使用 ConcurrentQueue（FIFO）
// 可以指定使用 ConcurrentStack（LIFO）或 ConcurrentBag
using var stackBased = new BlockingCollection<int>(new ConcurrentStack<int>(), 5);
stackBased.Add(1);
stackBased.Add(2);
stackBased.CompleteAdding();

// 遍历时按 LIFO 顺序
foreach (int item in stackBased.GetConsumingEnumerable())
{
    Console.WriteLine($"LIFO: {item}");           // 先输出 2
}
\`\`\`

### 六、生产者-消费者模式实战 ⭐⭐⭐

\`\`\`csharp
// 综合示例：多生产者-多消费者处理管道

async Task ProducerConsumerPipelineAsync()
{
    // 阶段 1：原始数据队列
    using var rawQueue = new BlockingCollection<string>(10);
    // 阶段 2：处理后数据队列
    using var processedQueue = new BlockingCollection<string>(10);

    // 生产者：生成原始数据
    var producer = Task.Run(() =>
    {
        for (int i = 1; i <= 20; i++)
        {
            rawQueue.Add($"数据_{i}");
            Console.WriteLine($"生产者: 生成 数据_{i}");
            Thread.Sleep(50);                    // 模拟数据生成间隔
        }
        rawQueue.CompleteAdding();               // 阶段 1 完成
    });

    // 处理者（消费者 + 生产者）：处理原始数据，输出到下一阶段
    var processors = new List<Task>();
    for (int i = 0; i < 3; i++)                  // 3 个处理器并发
    {
        int workerId = i;
        processors.Add(Task.Run(() =>
        {
            foreach (var raw in rawQueue.GetConsumingEnumerable())
            {
                string processed = $"[Worker{workerId}] {raw.ToUpper()}";
                Console.WriteLine($"处理器{workerId}: {raw} → {processed}");
                processedQueue.Add(processed);   // 输出到下一阶段
                Thread.Sleep(150);               // 模拟处理时间
            }
        }));
    }

    // 等待所有处理器完成后，标记第二阶段完成
    var finishProcessor = Task.Run(async () =>
    {
        await Task.WhenAll(processors);
        processedQueue.CompleteAdding();         // 阶段 2 完成
    });

    // 最终消费者：收集结果
    var finalConsumer = Task.Run(() =>
    {
        int count = 0;
        foreach (var item in processedQueue.GetConsumingEnumerable())
        {
            Console.WriteLine($"最终消费: {item}");
            count++;
        }
        Console.WriteLine($"最终消费者: 总共处理 {count} 条数据");
    });

    await Task.WhenAll(producer, finishProcessor, finalConsumer);
    Console.WriteLine("管道处理完成!");
}

await ProducerConsumerPipelineAsync();
\`\`\`

### 七、关键总结

| 集合 | 数据结构 | 特点 | 适用场景 |
| --- | --- | --- | --- |
| \`ConcurrentDictionary\<K,V\>\` | 哈希表 | 线程安全字典 | 缓存、计数器 |
| \`ConcurrentQueue\<T\>\` | FIFO 队列 | 线程安全队列 | 任务队列、消息队列 |
| \`ConcurrentStack\<T\>\` | LIFO 栈 | 线程安全栈 | 撤销栈、深度优先 |
| \`ConcurrentBag\<T\>\` | 无序集合 | 工作窃取 | 同线程生产消费 |
| \`BlockingCollection\<T\>\` | 阻塞集合 | 自动阻塞 | 生产者-消费者 |

**最佳实践**：
1. 需要键值对缓存 → \`ConcurrentDictionary\`（首选）
2. 需要 FIFO 任务队列 → \`ConcurrentQueue\` 或 \`BlockingCollection\`
3. 需要生产者-消费者阻塞 → \`BlockingCollection\`（自动阻塞，无需轮询）
4. 需要撤销栈 → \`ConcurrentStack\`
5. 对顺序无要求 → \`ConcurrentBag\`（工作窃取，性能好）
6. 始终使用 \`CompleteAdding()\` 标记 \`BlockingCollection\` 完成
7. 并发集合在大多数场景下比手动加锁的普通集合性能更好

`,
  },

  // ============================================================
  // 第七十二章：CancellationToken 与异步流
  // ============================================================
  {
    id: 'csharp3-ch72',
    group: '第十三部分 异步编程',
    icon: '🛑',
    title: '第七十二章 CancellationToken 与异步流',
    content: `## 第七十二章　CancellationToken 与异步流

取消操作是异步编程中不可或缺的能力。本章讲解 \`CancellationToken\` 的用法和 C# 8.0 引入的异步流。

### 一、CancellationTokenSource：取消令牌源 ⭐⭐⭐

\`\`\`csharp
// CancellationTokenSource 是取消令牌的来源
// 持有 CTS 的代码可以调用 Cancel() 发出取消信号

// 1. 基本用法：手动取消
Console.WriteLine("=== CancellationToken 基本用法 ===");

using var cts = new CancellationTokenSource();   // 创建取消令牌源
CancellationToken token = cts.Token;             // 获取取消令牌

// 启动一个可取消的任务
var task = Task.Run(async () =>
{
    for (int i = 0; i < 10; i++)
    {
        if (token.IsCancellationRequested)       // 检查是否被取消
        {
            Console.WriteLine($"任务在迭代 {i} 时被取消");
            return;                              // 优雅退出
        }
        Console.WriteLine($"迭代 {i}...");
        await Task.Delay(300);                   // 模拟工作
    }
    Console.WriteLine("任务正常完成");
}, token);

// 1.5 秒后取消
await Task.Delay(1500);
cts.Cancel();                                    // 发出取消信号
Console.WriteLine("已发出取消信号");

try
{
    await task;                                  // 等待任务完成
}
catch (OperationCanceledException)
{
    Console.WriteLine("捕获 OperationCanceledException");
}

// 2. CancelAfter：定时取消
using var cts2 = new CancellationTokenSource();
cts2.CancelAfter(TimeSpan.FromSeconds(2));       // 2 秒后自动取消

try
{
    Console.WriteLine("等待 5 秒...（但 2 秒后会被取消）");
    await Task.Delay(5000, cts2.Token);          // 传入取消令牌
}
catch (OperationCanceledException)
{
    Console.WriteLine("操作被取消（2 秒超时）");
}

// 3. 构造函数中设置超时
using var cts3 = new CancellationTokenSource(TimeSpan.FromSeconds(1));  // 1 秒后自动取消
try
{
    await Task.Delay(3000, cts3.Token);
}
catch (OperationCanceledException)
{
    Console.WriteLine("构造函数超时取消");
}
\`\`\`

### 二、ThrowIfCancellationRequested：抛出取消异常 ⭐⭐⭐

\`\`\`csharp
// ThrowIfCancellationRequested 是更推荐的取消检查方式
// 它会抛出 OperationCanceledException，由调用者处理

// 1. 基本用法
async Task<int> CancellableWorkAsync(CancellationToken cancellationToken)
{
    int result = 0;
    for (int i = 0; i < 100; i++)
    {
        // 每次迭代检查取消状态
        cancellationToken.ThrowIfCancellationRequested();  // 如果已取消，抛出异常

        // 模拟工作
        await Task.Delay(50, cancellationToken); // 大多数异步方法都支持 CancellationToken
        result += i;
    }
    return result;
}

// 2. 调用可取消的方法
using var cts = new CancellationTokenSource();
cts.CancelAfter(1000);                          // 1 秒后取消

try
{
    int result = await CancellableWorkAsync(cts.Token);
    Console.WriteLine($"结果: {result}");
}
catch (OperationCanceledException)
{
    Console.WriteLine("工作被取消");
}

// 3. 检查取消状态的对比
// 方式 A：手动检查 + 返回
// if (token.IsCancellationRequested) { return; }  // 不抛出异常
// 方式 B：ThrowIfCancellationRequested()
// token.ThrowIfCancellationRequested();            // 抛出异常
// 推荐方式 B：调用者可以区分"正常完成"和"被取消"
\`\`\`

### 三、Register：注册取消回调 ⭐⭐

\`\`\`csharp
// CancellationToken.Register 注册取消时的回调函数

// 1. 基本用法
using var cts = new CancellationTokenSource();
CancellationToken token = cts.Token;

// 注册取消回调
token.Register(() =>
{
    Console.WriteLine("取消回调: 清理资源...");
    // 这里的代码在 Cancel() 调用时同步执行
});

// 可以注册多个回调
token.Register(() =>
{
    Console.WriteLine("取消回调 2: 记录日志...");
});

Console.WriteLine("发出取消信号...");
cts.Cancel();                                    // 触发所有注册的回调

// 2. Register 返回值：CancellationTokenRegistration
// 可以调用 Dispose() 取消注册
using var cts2 = new CancellationTokenSource();
CancellationToken token2 = cts2.Token;

var registration = token2.Register(() =>
{
    Console.WriteLine("这个回调不会被触发");
});

registration.Dispose();                          // 取消注册
registration.Dispose();                          // 多次 Dispose 安全

cts2.Cancel();
Console.WriteLine("已取消，但回调已注销");

// 3. 实际场景：取消 HTTP 请求时清理
// using var httpCts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
// httpCts.Token.Register(() => Console.WriteLine("HTTP 请求超时，正在取消..."));
// var response = await httpClient.GetAsync(url, httpCts.Token);
\`\`\`

### 四、CancellationToken 的传播 ⭐⭐⭐

\`\`\`csharp
// CancellationToken 应该在调用链中一直传递下去

// 1. 链接多个 CancellationToken
// CancellationTokenSource.CreateLinkedTokenSource 组合多个令牌
using var cts1 = new CancellationTokenSource();
using var cts2 = new CancellationTokenSource();

// 创建链接令牌：任一令牌取消，链接令牌也会取消
using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(cts1.Token, cts2.Token);
CancellationToken linkedToken = linkedCts.Token;

// 2. 演示：任一源取消即触发
var task = Task.Run(async () =>
{
    try
    {
        await Task.Delay(5000, linkedToken);
        Console.WriteLine("任务完成");
    }
    catch (OperationCanceledException)
    {
        Console.WriteLine("链接令牌被取消");
    }
});

await Task.Delay(500);
cts2.Cancel();                                   // 取消 cts2 → linkedToken 也取消
await task;

// 3. CancellationToken.None：表示"不可取消"
// 当你参数要求 CancellationToken 但不想支持取消时使用
Task DoSomethingAsync(CancellationToken cancellationToken = default)
{
    if (cancellationToken == CancellationToken.None)
    {
        Console.WriteLine("此操作不可取消");
    }
    return Task.CompletedTask;
}

// 4. ASP.NET Core 中的 CancellationToken
// 控制器方法自动注入 HttpContext.RequestAborted
// [HttpGet]
// public async Task<IActionResult> Get(CancellationToken cancellationToken)
// {
//     // 当客户端断开连接时，cancellationToken 会被取消
//     var data = await _db.Users.ToListAsync(cancellationToken);
//     return Ok(data);
// }
Console.WriteLine("ASP.NET Core: 注入 CancellationToken 获取请求取消信号");
\`\`\`

### 五、IAsyncEnumerable：异步流 ⭐⭐⭐

\`\`\`csharp
// C# 8.0 引入 IAsyncEnumerable<T>，让你可以异步地逐个产生元素
// 类似于 IEnumerable<T> + yield return 的异步版本

// 1. 基本用法：异步生成序列
async IAsyncEnumerable<int> GenerateNumbersAsync(int count)
{
    for (int i = 1; i <= count; i++)
    {
        await Task.Delay(200);                   // 模拟异步操作（如数据库查询）
        yield return i;                          // 异步产生下一个元素
    }
}

// 2. await foreach：消费异步流
Console.WriteLine("=== await foreach 消费异步流 ===");
await foreach (int number in GenerateNumbersAsync(5))
{
    Console.WriteLine($"收到: {number}");        // 每个元素间隔 200ms 输出
}

// 3. 带 CancellationToken 的异步流
async IAsyncEnumerable<string> FetchPageAsync(
    int totalPages,
    [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken cancellationToken = default)
{
    for (int page = 1; page <= totalPages; page++)
    {
        cancellationToken.ThrowIfCancellationRequested();  // 检查取消

        await Task.Delay(500, cancellationToken); // 模拟分页获取数据
        yield return $"第 {page} 页数据";         // 逐页返回
    }
}

// 消费带取消的异步流
using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(1.5));
try
{
    await foreach (var page in FetchPageAsync(10).WithCancellation(cts.Token))
    {
        Console.WriteLine(page);
    }
}
catch (OperationCanceledException)
{
    Console.WriteLine("异步流消费被取消");
}

// 4. LINQ 式的异步流操作
// 需要 System.Linq.Async 包（提供 Where、Select 等扩展）
async IAsyncEnumerable<int> GetEvenNumbersAsync(IAsyncEnumerable<int> source)
{
    await foreach (var n in source)
    {
        if (n % 2 == 0)
        {
            yield return n;                      // 过滤偶数
        }
    }
}

Console.WriteLine("\\n=== 过滤异步流中的偶数 ===");
await foreach (var n in GetEvenNumbersAsync(GenerateNumbersAsync(10)))
{
    Console.WriteLine($"偶数: {n}");
}
\`\`\`

### 六、异步流的高级用法 ⭐⭐⭐

\`\`\`csharp
// 1. 异步流读取大文件（逐行）
async IAsyncEnumerable<string> ReadLinesAsync(string filePath)
{
    using var reader = new StreamReader(filePath);
    while (!reader.EndOfStream)
    {
        string? line = await reader.ReadLineAsync();  // 异步读取一行
        if (line != null)
        {
            yield return line;                   // 逐行产生（不一次性加载整个文件）
        }
    }
}

// 2. 异步流分页查询
async IAsyncEnumerable<User> GetUsersPagedAsync(
    int pageSize,
    [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken ct = default)
{
    int page = 0;
    while (true)
    {
        ct.ThrowIfCancellationRequested();

        // 模拟分页查询数据库
        await Task.Delay(300, ct);
        var users = Enumerable.Range(page * pageSize, pageSize)
            .Select(i => new User(i, $"用户_{i}"));

        foreach (var user in users)
        {
            yield return user;                   // 逐用户返回
        }

        page++;
        if (page >= 3) break;                    // 模拟只有 3 页
    }
}

// 3. 异步流聚合
async Task<List<User>> CollectAllUsersAsync(int pageSize)
{
    var results = new List<User>();
    await foreach (var user in GetUsersPagedAsync(pageSize))
    {
        results.Add(user);
    }
    return results;
}

// 4. 异步流中的异常处理
async IAsyncEnumerable<int> FaultyStreamAsync()
{
    yield return 1;
    yield return 2;
    throw new InvalidOperationException("流中发生错误");
    yield return 3;                              // 不会执行
}

try
{
    await foreach (var n in FaultyStreamAsync())
    {
        Console.WriteLine($"收到: {n}");
    }
}
catch (InvalidOperationException ex)
{
    Console.WriteLine($"捕获异常: {ex.Message}");  // 在 yield return 2 之后
}

record User(int Id, string Name);
\`\`\`

### 七、CancellationToken 最佳实践 ⭐⭐⭐

\`\`\`csharp
// 1. 总是在异步方法中接受 CancellationToken 参数
// ✅ 好的做法
async Task<string> GoodMethodAsync(string url, CancellationToken cancellationToken = default)
{
    using var http = new HttpClient();
    // 传递给底层异步方法
    return await http.GetStringAsync(url, cancellationToken);
}

// ❌ 不好的做法
// async Task<string> BadMethodAsync(string url)
// {
//     using var http = new HttpClient();
//     return await http.GetStringAsync(url);  // 无法取消
// }

// 2. 使用 default 参数值
// CancellationToken cancellationToken = default
// 调用者不传时默认为 CancellationToken.None（不可取消）

// 3. 不要用 CancellationToken 做超时功能的唯一手段
// CancellationToken 的语义是"取消"，不是"超时"
// 超时是取消的一种触发方式，但不要混用

// 4. 取消后及时清理资源
async Task WorkWithCleanupAsync(CancellationToken cancellationToken)
{
    try
    {
        await Task.Delay(10000, cancellationToken);
    }
    catch (OperationCanceledException)
    {
        // 清理资源
        Console.WriteLine("清理资源...");
        throw;                                   // 重新抛出，让调用者知道操作被取消
    }
}

// 5. CancellationToken 在调用链中一直传递
// Controller → Service → Repository → DbContext
// 每一层都接受并传递 CancellationToken

// 6. 不要在 CancellationToken 回调中执行耗时操作
// token.Register(() => { /* 快速操作 */ });
// 回调是同步执行的，会阻塞 Cancel() 调用

Console.WriteLine("CancellationToken 最佳实践:");
Console.WriteLine("1. 公开 API 始终接受 CancellationToken");
Console.WriteLine("2. 使用 default 参数值");
Console.WriteLine("3. 在调用链中一直传递");
Console.WriteLine("4. ASP.NET Core 中注入 HttpContext.RequestAborted");
Console.WriteLine("5. 取消后及时清理资源");
\`\`\`

### 八、关键总结

| 概念 | 说明 |
| --- | --- |
| \`CancellationTokenSource\` | 取消令牌的源，调用 Cancel() 发出取消信号 |
| \`CancellationToken\` | 取消令牌，传递给异步方法 |
| \`IsCancellationRequested\` | 检查是否已请求取消 |
| \`ThrowIfCancellationRequested()\` | 如果已取消则抛出异常 |
| \`CancelAfter()\` | 定时自动取消 |
| \`Register()\` | 注册取消回调 |
| \`CreateLinkedTokenSource()\` | 链接多个取消令牌 |
| \`IAsyncEnumerable\<T\>\` | 异步流，异步产生序列 |
| \`await foreach\` | 消费异步流 |
| \`yield return\` (async) | 异步产生元素 |
| \`WithCancellation()\` | 为异步流添加取消支持 |

**最佳实践**：
1. 公开 API 始终接受 \`CancellationToken\` 参数
2. 使用 \`ThrowIfCancellationRequested()\` 而不是手动检查
3. 在调用链中一直传递 \`CancellationToken\`
4. 使用 \`CancelAfter()\` 实现超时取消
5. 异步流用于逐元素异步处理（如分页、大文件读取）
6. 异步流配合 \`WithCancellation()\` 支持取消
7. 取消后记得清理资源（try-catch 重新抛出）

`,
  },
];

export { chapters };