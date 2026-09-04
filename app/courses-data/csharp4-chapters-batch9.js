// =============================================================
// C# 从入门到精通大全（全新版）—— 第 9 批章节
// 第七部分 异步与并发（共 6 章）
// -------------------------------------------------------------
// 本批包含 6 章：
//   csharp4-ch45 : 第四十五章 异步编程基础
//   csharp4-ch46 : 第四十六章 Task 与并行
//   csharp4-ch47 : 第四十七章 取消与异常处理
//   csharp4-ch48 : 第四十八章 并发同步
//   csharp4-ch49 : 第四十九章 IAsyncEnumerable 与 Channels
//   csharp4-ch50 : 第五十章 线程与线程池
//
// 风格：demo 驱动，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，所有示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 第四十五章：异步编程基础
  // ============================================================
  {
    id: 'csharp4-ch45',
    group: '第七部分 异步与并发',
    icon: '⏳',
    title: '异步编程基础',
    content: `## 第四十六章　异步编程基础

异步编程是现代 C# 最核心的能力之一。无论是调用 Web API、读写数据库、还是处理大文件，都离不开 async/await。本章从最基础的同步 vs 异步讲起，一步步带你理解 async/await 的本质。

### 一、同步 vs 异步：到底差在哪？⭐

**同步代码**：一行执行完才执行下一行。如果某一行在等 IO（网络、磁盘），整个线程就会被阻塞，什么都干不了。

\`\`\`csharp
// 同步：等 3 秒后才能打印 "完成"
Thread.Sleep(3000);
Console.WriteLine("完成");
\`\`\`

**异步代码**：遇到 IO 等待时，线程不会被卡住，而是把时间片让给别人去做别的事，等 IO 完成后再回来继续。

\`\`\`csharp
// 异步：等待期间线程可以处理其他工作
await Task.Delay(3000);
Console.WriteLine("完成");
\`\`\`

关键差异：**同步阻塞线程，异步释放线程**。在 UI 程序里这决定界面会不会卡死；在服务端程序里这决定能不能扛住高并发。

### 二、线程（Thread）与 Task

- \`Thread\` 是操作系统线程的封装，创建开销大（默认 1MB 栈空间），不推荐直接用。
- \`Task\` 是对"一段将要完成的工作"的抽象，它**不一定**占用一个新线程——可以在线程池上跑，也可以纯粹表示一个 IO 等待。

日常开发 99% 的场景都用 \`Task\`，只在极少数特殊场景（如长生命周期后台线程）才直接用 \`Thread\`。

### 三、async / await 关键字

- \`async\` 修饰方法，**只允许**在方法内部使用 \`await\`。它本身不会自动开线程。
- \`await\` 等待一个 \`Task\`（或可等待对象）完成，期间释放当前线程，完成后从挂起点继续执行。

\`\`\`csharp
async Task<string> GetDataAsync()
{
    await Task.Delay(500);           // 异步等待 500ms
    return "数据来了";
}

string result = await GetDataAsync(); // 调用处也要 await
\`\`\`

记住：**async 方法传染**——一旦内部用了 await，整个方法链都得是 async。这是设计使然。

### 四、Task 与 Task&lt;T&gt;

- \`Task\`：表示一个无返回值的异步操作。
- \`Task<T>\`：表示一个返回类型为 T 的异步操作。

\`\`\`csharp
Task DoAsync()         => Task.CompletedTask;  // 无返回值
Task<int> GetAsync()   => Task.FromResult(42);  // 返回 int
\`\`\`

### 五、async 方法的返回类型

| 返回类型 | 适用场景 |
| --- | --- |
| \`void\` | 仅限事件处理器，否则坚决避免 |
| \`Task\` | 无返回值的异步方法（首选） |
| \`Task<T>\` | 有返回值的异步方法（首选） |
| \`ValueTask\` | 可能同步完成、且高频调用，避免分配 |
| \`ValueTask<T>\` | 同上，但有返回值 |

**为什么有 ValueTask？** \`Task\` 是引用类型，每次 await 都会产生堆分配。如果方法 90% 的情况是同步完成（比如缓存命中），用 \`ValueTask\` 可以避免分配，提升性能。但 \`ValueTask\` 只能 await 一次，不能多次 await，也不能随意存储——除非你确实在写性能敏感的库，否则优先用 \`Task\`。

### 六、await 的本质：状态机

编译器看到 \`async\` 方法会做一件神奇的事：把它**重写成状态机**。每个 \`await\` 都是一个"挂起点"，编译器生成一个 \`MoveNext()\` 方法，记录当前状态，等任务完成后从挂起点继续。

简化后的伪代码：

\`\`\`csharp
// 你写的：
async Task<int> FooAsync()
{
    int a = await GetAAsync();
    int b = await GetBAsync();
    return a + b;
}

// 编译器生成的大致逻辑：
// 1. 创建状态机对象，状态 = 0
// 2. 调用 GetAAsync()，注册回调：完成后状态 = 1，再次 MoveNext
// 3. 状态 = 1 时：取出 a，调用 GetBAsync()，注册回调：完成后状态 = 2
// 4. 状态 = 2 时：取出 b，SetResult(a + b)
\`\`\`

理解这点很重要：**async 方法不是"开线程"，而是"把等待改写成回调链"**。

### 七、async 修饰符的几个误区

1. \`async void\` 几乎总是错的——异常无法被调用方捕获，会让进程崩溃。
2. \`async\` 方法不应该返回 \`void\`（除了事件处理器）。
3. 不要写 \`async Task Foo() { return; }\` 这种没意义的东西——直接返回 \`Task.CompletedTask\` 即可。
4. **不要 sync-over-async**：即用 \`.Result\` 或 \`.Wait()\` 阻塞异步方法，容易死锁。

### 八、ConfigureAwait(false)

\`await foo;\` 默认会尝试回到"原始同步上下文"继续执行（比如 UI 线程）。在库代码里你不应该回到调用方的上下文，应该用 \`ConfigureAwait(false)\` 跳过这步：

\`\`\`csharp
// 库代码推荐写法
await DoSomethingAsync().ConfigureAwait(false);
\`\`\`

- **类库代码**：永远加 \`ConfigureAwait(false)\`。
- **UI / ASP.NET Core**：UI 需要回到 UI 线程才能更新控件，所以不加；ASP.NET Core 没有同步上下文，加不加效果一样。

### 九、async 方法命名约定

约定俗成：异步方法名以 \`Async\` 后缀结尾，例如 \`SendEmailAsync\`、\`LoadUserAsync\`。这是 .NET 的强约定，违反会让队友抓狂。

### 十、异步流：IAsyncEnumerable&lt;T&gt;（C# 8+）

如果数据是"流式"产生的（比如数据库分页、传感器读数），用 \`IAsyncEnumerable<T>\` 可以一边产生一边消费，不用等全部数据就绪。

\`\`\`csharp
async IAsyncEnumerable<int> ProduceAsync()
{
    for (int i = 0; i < 5; i++)
    {
        await Task.Delay(200);  // 模拟异步获取数据
        yield return i;          // 异步 yield
    }
}

await foreach (var item in ProduceAsync())
{
    Console.WriteLine(item);  // 每来一个就处理一个
}
\`\`\`

\`await foreach\` 是 \`foreach\` 的异步版本，自动 await 每一次 \`MoveNextAsync\`。

本章 demo 演示：async/await 基础、ValueTask 与 Task 对比、IAsyncEnumerable 流式返回、await foreach 消费。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「异步编程基础」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句 - 异步编程基础演示
// 演示：async/await 基础、ValueTask 与 Task 对比、IAsyncEnumerable 流式返回、await foreach 消费

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;

// 顶级语句文件中的状态：声明为局部变量，被下面的局部函数以闭包方式捕获
// 注意：顶级语句不能直接声明 static 字段，static 字段必须属于某个类型
var _cache = new Dictionary<int, string>();

// === 1. 最基础的 async/await ===
// async 修饰方法、内部用 await 等待、返回 Task<T>
async Task<string> FetchUserNameAsync(int userId)
{
    // 模拟一次网络请求（用 Task.Delay 代替真实 IO）
    await Task.Delay(300);  // 异步等待，不阻塞线程
    return $"用户-{userId}";
}

// === 2. 串行 vs 并行 ===
// 串行：一个一个等，总耗时 = 累加
async Task RunSerialAsync()
{
    var sw = Stopwatch.StartNew();
    string a = await FetchUserNameAsync(1);  // 等 300ms
    string b = await FetchUserNameAsync(2);  // 再等 300ms
    sw.Stop();
    Console.WriteLine($"串行：{a} + {b}，耗时 {sw.ElapsedMilliseconds}ms");
}

// 并行：同时启动，总耗时 ≈ 最慢的那个
async Task RunParallelAsync()
{
    var sw = Stopwatch.StartNew();
    Task<string> t1 = FetchUserNameAsync(1);  // 启动任务1（不 await）
    Task<string> t2 = FetchUserNameAsync(2);  // 启动任务2（不 await）
    string[] results = await Task.WhenAll(t1, t2);  // 同时等两个
    sw.Stop();
    Console.WriteLine($"并行：{results[0]} + {results[1]}，耗时 {sw.ElapsedMilliseconds}ms");
}

// === 3. Task<T> vs ValueTask<T> ===
// Task<T> 是引用类型，每次都会产生堆分配
// ValueTask<T> 是值类型，可避免分配（适合"经常同步完成"的高频方法）
// 模拟一个带缓存的查询：缓存命中时同步返回 ValueTask，不命中时返回真正的异步 Task
ValueTask<string> GetValueAsync(int key)
{
    // 缓存命中：直接返回，零分配
    if (_cache.TryGetValue(key, out var v))
    {
        return new ValueTask<string>(v);  // 同步完成路径
    }
    // 缓存未命中：走真正的异步路径
    return new ValueTask<string>(LoadAndCacheAsync(key));
}

// 真正的异步加载方法
async Task<string> LoadAndCacheAsync(int key)
{
    await Task.Delay(200);  // 模拟 IO
    string v = $"缓存值-{key}";
    _cache[key] = v;
    return v;
}

// === 4. async void 陷阱演示（注释掉，仅作说明） ===
// async void 的异常无法被 await 捕获，会直接让进程崩溃
// 仅在事件处理器中使用，例如：button.Click += async (s, e) => { ... };
// 其他地方一律用 async Task

// === 5. ConfigureAwait(false) 演示 ===
// 在类库中，应该总是 ConfigureAwait(false) 避免回到调用方同步上下文
async Task<string> LibraryMethodAsync()
{
    // ConfigureAwait(false)：不尝试回到原始上下文
    await Task.Delay(100).ConfigureAwait(false);
    return "库方法完成";
}

// === 6. IAsyncEnumerable<T>：异步流 ===
// 类似 IEnumerable<T>，但每次 MoveNextAsync 都是异步的
async IAsyncEnumerable<int> GenerateNumbersAsync(
    [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken ct = default)
{
    for (int i = 1; i <= 5; i++)
    {
        ct.ThrowIfCancellationRequested();  // 支持取消
        await Task.Delay(150, ct);  // 模拟异步获取每一条数据
        yield return i;  // 异步 yield：产出一个值后挂起，等消费者要下一个再继续
    }
}

// === 7. await foreach 消费异步流 ===
async Task ConsumeStreamAsync()
{
    Console.WriteLine("开始消费异步流...");
    await foreach (var n in GenerateNumbersAsync())
    {
        Console.WriteLine($"  收到：{n}");
    }
    Console.WriteLine("异步流消费完毕");
}

// === 主入口：顶级语句按顺序执行 ===
Console.WriteLine("==== 1. 串行 vs 并行 ====");
await RunSerialAsync();       // 预计约 600ms
await RunParallelAsync();     // 预计约 300ms

Console.WriteLine("\\n==== 2. ValueTask 缓存演示 ====");
// 第一次：缓存未命中，走异步路径
string v1 = await GetValueAsync(100);
Console.WriteLine($"第一次取值：{v1}");
// 第二次：缓存命中，走同步路径（无堆分配）
string v2 = await GetValueAsync(100);
Console.WriteLine($"第二次取值：{v2}");

Console.WriteLine("\\n==== 3. ConfigureAwait(false) 库方法 ====");
string libResult = await LibraryMethodAsync();
Console.WriteLine(libResult);

Console.WriteLine("\\n==== 4. IAsyncEnumerable 异步流 ====");
await ConsumeStreamAsync();

Console.WriteLine("\\n==== 全部演示完成 ====");
`,
    lang: 'cs',
  },

  // ============================================================
  // 第四十六章：Task 与并行
  // ============================================================
  {
    id: 'csharp4-ch46',
    group: '第七部分 异步与并发',
    icon: '🔀',
    title: 'Task 与并行',
    content: `## 第四十七章　Task 与并行

上一章讲了 async/await 的基础。本章深入 \`Task\` 类本身，以及并行计算（Parallel）相关 API。这两套东西看似都是"并发"，但定位完全不同。

### 一、Task 类详解 ⭐

\`Task\` 表示"一个将要完成的工作单元"。它有几种创建方式：

\`\`\`csharp
// 1. 直接执行（在线程池上）
Task t1 = Task.Run(() => Console.WriteLine("hi"));

// 2. 返回值
Task<int> t2 = Task.Run(() => 42);

// 3. 已完成的任务（用于 mock）
Task done = Task.CompletedTask;
Task<int> done2 = Task.FromResult(42);

// 4. 延迟
await Task.Delay(500);
\`\`\`

### 二、Task.Run vs Task.Factory.StartNew

- \`Task.Run(action)\`：默认在线程池上排队执行，是最常用的方式。
- \`Task.Factory.StartNew(action, options)\`：更底层，可以指定 \`TaskCreationOptions\`。

99% 的情况用 \`Task.Run\` 就够了。需要精细控制时再用 \`StartNew\`。

### 三、Task.Delay 与 Task.Yield

- \`Task.Delay(ms)\`：在指定毫秒后完成的任务，**不阻塞线程**。
- \`Task.Yield()\`：立即让出当前线程，让其他任务先跑。常用于避免长方法独占线程。

\`\`\`csharp
await Task.Delay(1000);   // 等 1 秒
await Task.Yield();        // 让出一次时间片
\`\`\`

### 四、Task.WhenAll / WhenAny

- \`WhenAll(tasks)\`：等所有任务完成。任意一个失败，整体也会失败。
- \`WhenAny(tasks)\`：等任意一个完成就返回（返回最先完成的那个 Task）。

\`\`\`csharp
Task<string> t1 = GetDataAsync(1);
Task<string> t2 = GetDataAsync(2);
string[] all = await Task.WhenAll(t1, t2);  // 全部完成
Task<string> first = await Task.WhenAny(t1, t2);  // 谁先完成
\`\`\`

### 五、Task.WhenAll 的异常处理：AggregateException

\`WhenAll\` 等所有任务结束。如果有多个任务抛异常，**所有异常都会被收集**到 \`AggregateException\` 里。但 \`await\` 只会重新抛出**第一个**异常，其他会被吞掉。

要拿到所有异常，需要直接访问 \`Task.Exception\`：

\`\`\`csharp
var tasks = new[] { Task.Run(() => throw new Exception("A")), Task.Run(() => throw new Exception("B")) };
Task all = Task.WhenAll(tasks);
try { await all; }
catch
{
    // all.Exception.InnerExceptions 包含全部异常
    foreach (var ex in all.Exception!.InnerExceptions)
        Console.WriteLine(ex.Message);
}
\`\`\`

### 六、TaskCreationOptions

| 选项 | 含义 |
| --- | --- |
| \`None\` | 默认 |
| \`LongRunning\` | 长任务，给一个独立线程而不是用线程池 |
| \`AttachedToParent\` | 创建子任务，父任务会等待子任务 |
| \`DenyChildAttach\` | 禁止子任务附着 |
| \`PreferFairness\` | 提示按 FIFO 顺序执行 |

\`LongRunning\` 用于 CPU 密集型超过几十毫秒的任务，避免占用线程池工作线程。

### 七、Continuation：ContinueWith

\`ContinueWith\` 给一个 Task 注册"完成后要做的事"，是 \`await\` 的前辈写法：

\`\`\`csharp
Task.Run(() => 42)
    .ContinueWith(t => Console.WriteLine($"结果 {t.Result}"));
\`\`\`

现代代码优先用 \`await\`。只有在你需要链式组合多个延续、或者需要观察 \`Task\` 状态时才用 \`ContinueWith\`。

### 八、CancellationToken 协作式取消

C# 的取消是"协作式"的——你不能强行杀掉一个任务，只能传一个 \`CancellationToken\`，让任务自己检查并优雅退出。

\`\`\`csharp
var cts = new CancellationTokenSource();
Task t = Task.Run(async () =>
{
    while (!cts.Token.IsCancellationRequested)
    {
        await Task.Delay(100);
        // 或：cts.Token.ThrowIfCancellationRequested();
    }
}, cts.Token);

cts.Cancel();  // 通知取消
\`\`\`

下一章会详细讲取消机制。

### 九、Parallel.For / Parallel.ForEach / Parallel.Invoke

这是数据并行 API，专为"对大量数据做相同 CPU 工作"设计。它会自动分区、调度到线程池。

\`\`\`csharp
// 并行 for
Parallel.For(0, 1000, i => DoWork(i));

// 并行 foreach
Parallel.ForEach(data, item => Process(item));

// 并行执行多个不同操作
Parallel.Invoke(
    () => DoA(),
    () => DoB(),
    () => DoC()
);
\`\`\`

注意：\`Parallel.For\` 适合 **CPU 密集型** 任务。如果是 IO 密集型，应该用 \`Task.WhenAll\` + async。

### 十、ParallelOptions

\`\`\`csharp
var opts = new ParallelOptions
{
    MaxDegreeOfParallelism = 4,           // 限制并发度
    CancellationToken = cts.Token,         // 支持取消
};
Parallel.For(0, 1000, opts, i => DoWork(i));
\`\`\`

### 十一、Partitioner：手动分区

如果循环体非常轻量，默认分区开销可能比工作本身还大。可以用 \`Partitioner\` 手动切分大区间：

\`\`\`csharp
var ranges = Partitioner.Create(0, 1_000_000);
Parallel.ForEach(ranges, range =>
{
    for (int i = range.Item1; i < range.Item2; i++) DoWork(i);
});
\`\`\`

### 十二、Stopwatch 测量性能

测性能永远用 \`Stopwatch\`，不要用 \`DateTime.Now\`（精度低、受系统时间调整影响）。

\`\`\`csharp
var sw = Stopwatch.StartNew();
// ... 要测的代码
sw.Stop();
Console.WriteLine(sw.ElapsedMilliseconds);
\`\`\`

本章 demo 演示：Task.Run/WhenAll/WhenAny、Parallel.For 并行计算、CancellationToken 取消、Stopwatch 测速。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「Task 与并行」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句 - Task 与并行演示
// 演示：Task.Run/WhenAll/WhenAny + Parallel.For + CancellationToken + Stopwatch 测速

using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

// === 1. Task.Run 基础 ===
// Task.Run 把工作丢到线程池上执行
async Task DemoTaskRunAsync()
{
    Task<int> t = Task.Run(() =>
    {
        Thread.Sleep(100);  // 模拟 CPU 工作
        return 42;
    });
    int result = await t;  // 等待结果
    Console.WriteLine($"Task.Run 结果：{result}");
}

// === 2. Task.WhenAll：并行等待所有完成 ===
async Task DemoWhenAllAsync()
{
    var sw = Stopwatch.StartNew();

    // 三个任务各 300ms，并行执行总共约 300ms
    Task<string> t1 = Task.Run(async () => { await Task.Delay(300); return "A"; });
    Task<string> t2 = Task.Run(async () => { await Task.Delay(300); return "B"; });
    Task<string> t3 = Task.Run(async () => { await Task.Delay(300); return "C"; });

    string[] results = await Task.WhenAll(t1, t2, t3);
    sw.Stop();
    Console.WriteLine($"WhenAll: [{string.Join(", ", results)}]，耗时 {sw.ElapsedMilliseconds}ms");
}

// === 3. Task.WhenAny：等任意一个完成 ===
async Task DemoWhenAnyAsync()
{
    // 三个任务完成时间不同，看谁先回来
    Task<int> t1 = Task.Run(async () => { await Task.Delay(300); return 1; });
    Task<int> t2 = Task.Run(async () => { await Task.Delay(100); return 2; });
    Task<int> t3 = Task.Run(async () => { await Task.Delay(200); return 3; });

    // WhenAny 返回最先完成的那个 Task
    Task<int> first = await Task.WhenAny(t1, t2, t3);
    int result = await first;  // 拿到结果（这里通常很快，因为已经完成了）
    Console.WriteLine($"WhenAny 最先返回：{result}");
}

// === 4. WhenAll 异常聚合演示 ===
async Task DemoWhenAllExceptionAsync()
{
    // 三个任务，两个会抛异常
    // 用 Task.FromException<int> 直接创建"已失败"的 Task<int>
    // 这比 Task.Run(() => throw X) 更清晰：lambda 抛异常会让 Task.Run 的重载推断有歧义
    Task<int> t1 = Task.Run(() => 1);
    Task<int> t2 = Task.FromException<int>(new InvalidOperationException("E1"));
    Task<int> t3 = Task.FromException<int>(new InvalidOperationException("E2"));

    Task<int[]> all = Task.WhenAll(t1, t2, t3);
    try
    {
        await all;  // await 只会重新抛出第一个异常
    }
    catch (Exception ex)
    {
        Console.WriteLine($"捕获到 await 抛出的异常：{ex.Message}");
        // all.Exception.InnerExceptions 包含所有异常
        if (all.Exception != null)
        {
            Console.WriteLine($"AggregateException 内部异常数：{all.Exception.InnerExceptions.Count}");
            foreach (var inner in all.Exception.InnerExceptions)
                Console.WriteLine($"  - {inner.Message}");
        }
    }
}

// === 5. TaskCreationOptions.LongRunning ===
// 长任务用 LongRunning，会给一个独立线程而不是占用线程池
async Task DemoLongRunningAsync()
{
    var sw = Stopwatch.StartNew();
    Task t = Task.Factory.StartNew(() =>
    {
        // 模拟长时间 CPU 工作
        Thread.Sleep(300);
    }, TaskCreationOptions.LongRunning);
    await t;
    sw.Stop();
    Console.WriteLine($"LongRunning 任务完成，耗时 {sw.ElapsedMilliseconds}ms");
}

// === 6. ContinueWith：延续 ===
// 现代 C# 优先用 await，这里展示 ContinueWith 的链式写法
void DemoContinueWith()
{
    Task.Run(() => 10)
        .ContinueWith(t => t.Result * 2)            // 第一阶段：×2
        .ContinueWith(t => Console.WriteLine($"ContinueWith 链结果：{t.Result}"));
    // 注意：这里不 await，给点时间让链跑完
    Thread.Sleep(200);
}

// === 7. Parallel.For 并行计算 ===
void DemoParallelFor()
{
    // 1 到 1 千万的整数数组（用于求和演示）
    int[] data = Enumerable.Range(1, 10_000_000).ToArray();
    long sum = 0;  // 注意用 long，1+2+...+1e7 ≈ 5e13 会溢出 int

    // 并行累加，用 lock 保证累加安全
    object sync = new();
    var sw = Stopwatch.StartNew();
    Parallel.For(0, data.Length, i =>
    {
        // 加锁累加（演示用；更高效做法见下一章 Interlocked）
        lock (sync) { sum += data[i]; }
    });
    sw.Stop();
    // Sum(x => (long)x) 显式转 long，避免 int 求和溢出
    long expected = data.Sum(x => (long)x);
    Console.WriteLine($"Parallel.For 求和 = {sum}（应为 {expected}），耗时 {sw.ElapsedMilliseconds}ms");
}

// === 8. Parallel.ForEach + ParallelOptions ===
void DemoParallelForEachWithCancel()
{
    using var cts = new CancellationTokenSource();
    cts.CancelAfter(500);  // 500ms 后自动取消

    var opts = new ParallelOptions
    {
        MaxDegreeOfParallelism = Environment.ProcessorCount,  // 限制并发度
        CancellationToken = cts.Token,
    };

    int processed = 0;
    try
    {
        // 并行处理一个无穷序列（这里用 Range 模拟）
        Parallel.ForEach(Enumerable.Range(0, int.MaxValue), opts, i =>
        {
            Interlocked.Increment(ref processed);  // 原子递增
            Thread.Sleep(10);  // 模拟工作
        });
    }
    catch (OperationCanceledException)
    {
        Console.WriteLine($"Parallel.ForEach 被取消，已处理 {processed} 项");
    }
}

// === 9. Partitioner 手动分区 ===
// 对于轻量循环体，手动分块比默认每个元素一个任务更高效
void DemoPartitioner()
{
    long sum = 0;
    var ranges = Partitioner.Create(0, 10_000_000);  // 把 0~1e7 切成几个范围

    var sw = Stopwatch.StartNew();
    Parallel.ForEach(ranges, range =>
    {
        long localSum = 0;  // 每个分区的局部累加
        for (int i = range.Item1; i < range.Item2; i++)
            localSum += i;
        Interlocked.Add(ref sum, localSum);  // 把局部和加到总和（原子操作）
    });
    sw.Stop();
    long expected = (long)10_000_000 * (10_000_000 - 1) / 2;
    Console.WriteLine($"Partitioner 求和 = {sum}（应为 {expected}），耗时 {sw.ElapsedMilliseconds}ms");
}

// === 主入口 ===
Console.WriteLine("==== 1. Task.Run ====");
await DemoTaskRunAsync();

Console.WriteLine("\\n==== 2. WhenAll ====");
await DemoWhenAllAsync();

Console.WriteLine("\\n==== 3. WhenAny ====");
await DemoWhenAnyAsync();

Console.WriteLine("\\n==== 4. WhenAll 异常聚合 ====");
await DemoWhenAllExceptionAsync();

Console.WriteLine("\\n==== 5. LongRunning ====");
await DemoLongRunningAsync();

Console.WriteLine("\\n==== 6. ContinueWith ====");
DemoContinueWith();

Console.WriteLine("\\n==== 7. Parallel.For ====");
DemoParallelFor();

Console.WriteLine("\\n==== 8. Parallel.ForEach + 取消 ====");
DemoParallelForEachWithCancel();

Console.WriteLine("\\n==== 9. Partitioner ====");
DemoPartitioner();

Console.WriteLine("\\n==== 全部完成 ====");
`,
    lang: 'cs',
  },

  // ============================================================
  // 第四十七章：取消与异常处理
  // ============================================================
  {
    id: 'csharp4-ch47',
    group: '第七部分 异步与并发',
    icon: '🚫',
    title: '取消与异常处理',
    content: `## 第四十八章　取消与异常处理

并发代码里最难处理的不是"启动任务"，而是"如何优雅地停下来"和"如何处理一堆散落在不同线程里的异常"。本章专注这两件事。

### 一、CancellationTokenSource 与 CancellationToken ⭐

取消机制分两个角色：

- \`CancellationTokenSource\`（CTS）：**发起方**持有，调用 \`Cancel()\` 触发取消。
- \`CancellationToken\`（CT）：**执行方**持有，检查 \`IsCancellationRequested\` 或调用 \`ThrowIfCancellationRequested()\`。

\`\`\`csharp
var cts = new CancellationTokenSource();
CancellationToken token = cts.Token;

Task t = Task.Run(() =>
{
    while (!token.IsCancellationRequested)
    {
        // 干活
    }
}, token);

cts.Cancel();  // 发起取消信号
\`\`\`

**注意**：取消是"协作式"的——信号发出后，任务自己决定如何退出。CTS 不会强行杀线程。

### 二、Register 回调

你可以注册一个回调，在取消发生时被调用：

\`\`\`csharp
cts.Token.Register(() => Console.WriteLine("被取消了！"));
\`\`\`

这常用于资源清理、日志记录、释放外部句柄等。

### 三、ThrowIfCancellationRequested

\`ThrowIfCancellationRequested()\` 检查并抛出 \`OperationCanceledException\`，这是最常用的"中止点"：

\`\`\`csharp
foreach (var item in data)
{
    token.ThrowIfCancellationRequested();  // 每次迭代都检查
    Process(item);
}
\`\`\`

抛异常而非 \`return\` 的好处：调用方知道这是"被取消"而不是"正常完成"，可以区分。

### 四、CancelAfter：定时取消

\`\`\`csharp
cts.CancelAfter(TimeSpan.FromSeconds(5));  // 5 秒后自动取消
\`\`\`

常用于设置超时，避免请求无限期挂起。

### 五、链接 CancellationTokens：CreateLinkedTokenSource

实际场景中，执行方往往要同时受"用户主动取消"和"超时取消"两个信号控制。可以用 \`CreateLinkedTokenSource\` 把多个 token 合并成一个：

\`\`\`csharp
var userCts = new CancellationTokenSource();
var timeoutCts = new CancellationTokenSource();
timeoutCts.CancelAfter(3000);

using var linked = CancellationTokenSource.CreateLinkedTokenSource(
    userCts.Token, timeoutCts.Token);

// 任意一个源被取消，linked.Token 都会被取消
await Task.Run(() => Work(linked.Token), linked.Token);
\`\`\`

### 六、CancellationToken 与 Task

注册 CT 到 Task 有两个作用：

1. **在线程池排队时被取消**：如果你 \`Task.Run\` 之前 token 就取消了，任务根本不会被调度。
2. **状态转移**：被取消的任务会进入 \`Canceled\` 状态（而不是 \`Faulted\`），\`Task.Status\` 会是 \`Canceled\`。

\`\`\`csharp
var cts = new CancellationTokenSource();
cts.Cancel();  // 先取消
Task t = Task.Run(() => { }, cts.Token);  // 任务还没开始
try { await t; }
catch (OperationCanceledException) { /* 任务直接被取消 */ }
\`\`\`

### 七、OperationCanceledException vs TaskCanceledException

- \`OperationCanceledException\`：通用的"被取消"异常。
- \`TaskCanceledException\`：是 \`OperationCanceledException\` 的子类，专门表示 Task 被取消。

实际编码里 \`catch (OperationCanceledException)\` 就够了，能同时捕获两者。

### 八、AggregateException.Flatten

\`Task.Exception\` 是 \`AggregateException\`，它的 \`InnerExceptions\` 可能嵌套（比如父子任务都抛异常时）。\`Flatten()\` 把所有嵌套的异常拍平成一维：

\`\`\`csharp
try { await Task.WhenAll(tasks); }
catch
{
    var flat = task.Exception!.Flatten();
    foreach (var ex in flat.InnerExceptions) { ... }
}
\`\`\`

### 九、async void 的异常陷阱

\`async void\` 方法的异常**无法被调用方捕获**，会直接跑到 \`AppDomain.UnhandledException\` 或 \`SynchronizationContext\`，导致进程崩溃。

\`\`\`csharp
// ❌ 极度危险
async void BadAsync()
{
    await Task.Delay(100);
    throw new Exception("boom");
}

BadAsync();  // 调用方根本不知道这里抛了异常
\`\`\`

只有事件处理器（如 \`button.Click += async (s, e) => {...}\`）才能用 \`async void\`，其他场景一律 \`async Task\`。

### 十、UnobservedTaskException

如果一个 \`Task\` 抛了异常，但你既没 \`await\` 它，也没访问 \`Task.Exception\`，那它就成了"未被观察的异常"。

.NET Framework 时代这会让进程崩溃。.NET Core / .NET 8 默认**不会**让进程崩溃，但你可以监听全局事件：

\`\`\`csharp
TaskScheduler.UnobservedTaskException += (s, e) =>
{
    Console.WriteLine($"未观察的异常：{e.Exception.Message}");
    e.SetObserved();  // 标记已处理，不再传播
};
\`\`\`

垃圾回收时才会触发这个事件（因为只有 GC 时才知道这个 Task 真的没人管了）。

### 十一、最佳实践总结

1. 总是给长时间任务传 \`CancellationToken\`。
2. 在循环、迭代点调用 \`ThrowIfCancellationRequested\`。
3. 超时用 \`CancelAfter\`。
4. 多个取消源用 \`CreateLinkedTokenSource\` 合并。
5. 永远别写 \`async void\`（事件处理器除外）。
6. \`WhenAll\` 处理异常时记得看 \`Task.Exception.InnerExceptions\`。

本章 demo 演示：取消令牌的各种用法 + 链接令牌 + 并行任务异常聚合 + UnobservedTaskException 监听。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「取消与异常处理」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句 - 取消与异常处理演示
// 演示：CancellationToken 各种用法 + CreateLinkedTokenSource + WhenAll 异常聚合 + UnobservedTaskException

using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;

// === 1. 基础：CancellationTokenSource + IsCancellationRequested ===
async Task DemoBasicCancelAsync()
{
    using var cts = new CancellationTokenSource();
    cts.CancelAfter(500);  // 500ms 后自动取消

    int count = 0;
    Task t = Task.Run(() =>
    {
        while (!cts.Token.IsCancellationRequested)  // 自己轮询检查
        {
            Thread.Sleep(50);
            count++;
        }
        Console.WriteLine($"  任务检测到取消，已循环 {count} 次");
    }, cts.Token);

    await t;  // 任务正常退出（没抛异常）
}

// === 2. ThrowIfCancellationRequested：用异常中止 ===
async Task DemoThrowCancelAsync()
{
    using var cts = new CancellationTokenSource();
    cts.CancelAfter(300);

    try
    {
        await Task.Run(async () =>
        {
            for (int i = 0; i < 100; i++)
            {
                cts.Token.ThrowIfCancellationRequested();  // 检查并抛异常
                await Task.Delay(50);
            }
        }, cts.Token);
    }
    catch (OperationCanceledException)
    {
        // 注意：这里既能捕获 OperationCanceledException 也能捕获 TaskCanceledException
        Console.WriteLine("  捕获到 OperationCanceledException");
    }
}

// === 3. Register 回调 ===
async Task DemoRegisterCallbackAsync()
{
    using var cts = new CancellationTokenSource();

    // 注册取消时执行的回调，可注册多个
    cts.Token.Register(() => Console.WriteLine("  回调 1：清理资源"));
    cts.Token.Register(() => Console.WriteLine("  回调 2：记录日志"));

    cts.CancelAfter(200);  // 200ms 后取消，自动触发回调
    await Task.Delay(400);  // 等回调执行
}

// === 4. CreateLinkedTokenSource：链接多个取消源 ===
async Task DemoLinkedTokenAsync()
{
    // 模拟"用户取消"和"超时取消"两个源
    var userCts = new CancellationTokenSource();
    var timeoutCts = new CancellationTokenSource();
    timeoutCts.CancelAfter(300);  // 300ms 超时

    // 合并两个 token：任意一个被取消，linked 就被取消
    using var linked = CancellationTokenSource.CreateLinkedTokenSource(
        userCts.Token, timeoutCts.Token);

    try
    {
        await Task.Run(async () =>
        {
            while (true)
            {
                linked.Token.ThrowIfCancellationRequested();
                await Task.Delay(50);
            }
        }, linked.Token);
    }
    catch (OperationCanceledException)
    {
        // 判断到底是哪个源触发的
        if (timeoutCts.IsCancellationRequested)
            Console.WriteLine("  因超时被取消");
        else if (userCts.IsCancellationRequested)
            Console.WriteLine("  因用户取消");
    }
}

// === 5. WhenAll 异常聚合 + Flatten ===
async Task DemoAggregateExceptionAsync()
{
    // 三个任务，两个抛异常
    // 用 Task.FromException<int> 直接创建"已失败"的 Task<int>
    // 这比 Task.Run(() => throw X) 更清晰：lambda 抛异常会让 Task.Run 的重载推断有歧义
    Task<int> t1 = Task.Run(() => 1);
    Task<int> t2 = Task.FromException<int>(new InvalidOperationException("E1"));
    Task<int> t3 = Task.FromException<int>(new InvalidOperationException("E2"));

    Task<int[]> all = Task.WhenAll(t1, t2, t3);
    try
    {
        await all;
    }
    catch
    {
        // all.Exception 是 AggregateException
        var agg = all.Exception!.Flatten();  // 拍平嵌套
        Console.WriteLine($"  Flatten 后内部异常数：{agg.InnerExceptions.Count}");
        foreach (var ex in agg.InnerExceptions)
            Console.WriteLine($"  - {ex.GetType().Name}: {ex.Message}");
    }
}

// === 6. UnobservedTaskException 全局监听 ===
// 这个事件在 Task 被 GC 时触发，前提是该 Task 抛了异常但没人观察
void SetupUnobservedHandler()
{
    TaskScheduler.UnobservedTaskException += (sender, e) =>
    {
        Console.WriteLine($"  [全局] 未观察的异常：{e.Exception.Message}");
        e.SetObserved();  // 标记已处理，避免传播
    };
}

// 制造一个未观察异常
void FireUnobservedException()
{
    // 启动一个会抛异常的任务，但不 await、不访问 Exception
    _ = Task.Run(() => throw new ApplicationException("没人管的异常"));
    Thread.Sleep(100);  // 等任务跑完
    // 注意：真正触发 UnobservedTaskException 要等到 GC，
    // 这里只演示设置，不做强制 GC
}

// === 7. async void 陷阱演示（注释版，不要真的跑） ===
// async void BadAsync()
// {
//     await Task.Delay(100);
//     throw new Exception("调用方捕获不到这个异常");
// }
// 正确做法：async Task，调用方 await 即可捕获

// === 8. 区分 OperationCanceledException vs TaskCanceledException ===
async Task DemoCanceledExceptionTypesAsync()
{
    using var cts = new CancellationTokenSource();
    cts.Cancel();  // 先取消

    // 任务还没开始就被取消，会抛 TaskCanceledException
    Task t = Task.Run(() => { }, cts.Token);
    try { await t; }
    catch (TaskCanceledException)
    {
        Console.WriteLine("  捕获到 TaskCanceledException（是 OCE 的子类）");
    }
    // 也可以用更通用的：
    // catch (OperationCanceledException) { ... }
}

// === 主入口 ===
Console.WriteLine("==== 1. 基础取消：IsCancellationRequested ====");
await DemoBasicCancelAsync();

Console.WriteLine("\\n==== 2. ThrowIfCancellationRequested ====");
await DemoThrowCancelAsync();

Console.WriteLine("\\n==== 3. Register 回调 ====");
await DemoRegisterCallbackAsync();

Console.WriteLine("\\n==== 4. CreateLinkedTokenSource ====");
await DemoLinkedTokenAsync();

Console.WriteLine("\\n==== 5. WhenAll 异常聚合 + Flatten ====");
await DemoAggregateExceptionAsync();

Console.WriteLine("\\n==== 6. UnobservedTaskException ====");
SetupUnobservedHandler();
FireUnobservedException();

Console.WriteLine("\\n==== 7. TaskCanceledException 类型 ====");
await DemoCanceledExceptionTypesAsync();

Console.WriteLine("\\n==== 全部完成 ====");
`,
    lang: 'cs',
  },

  // ============================================================
  // 第四十八章：并发同步
  // ============================================================
  {
    id: 'csharp4-ch48',
    group: '第七部分 异步与并发',
    icon: '⚡',
    title: '并发同步',
    content: `## 第四十九章　并发同步

多线程访问同一份共享数据时，如果不同步，就会出现"读了一半被另一个线程改了"的撕裂问题。本章覆盖 C# 所有常用的同步原语。

### 一、为什么需要同步 ⭐

\`\`\`csharp
int counter = 0;
Parallel.For(0, 10000, _ => counter++);  // 不是线程安全的
Console.WriteLine(counter);  // 输出可能是 9876 而不是 10000
\`\`\`

\`counter++\` 看起来是一行，其实是"读—改—写"三步。多线程交错执行时会丢更新。

### 二、lock 关键字

最常用的同步方式。\`lock\` 内部用 \`Monitor.Enter\` / \`Monitor.Exit\`，并自动 try-finally 释放锁。

\`\`\`csharp
private readonly object _sync = new();
void Increment()
{
    lock (_sync)  // 进入临界区
    {
        counter++;
    }  // 离开时自动释放
}
\`\`\`

注意：

1. 锁对象推荐用一个 \`private readonly object\`，**不要** lock \`this\`、\`typeof(X)\` 或字符串字面量——容易死锁。
2. lock 持有时间要尽量短。
3. 不要在 lock 内部 await——可能死锁。

### 三、Monitor.Enter / Exit / TryEnter

\`lock\` 是语法糖，等价于：

\`\`\`csharp
Monitor.Enter(_sync);
try { ... } finally { Monitor.Exit(_sync); }
\`\`\`

\`Monitor.TryEnter\` 支持超时，避免永远等下去：

\`\`\`csharp
if (Monitor.TryEnter(_sync, TimeSpan.FromSeconds(1)))
{
    try { ... }
    finally { Monitor.Exit(_sync); }
}
\`\`\`

### 四、死锁与避免

死锁四个必要条件：互斥、占有等待、不可剥夺、循环等待。打破任何一个就能避免。常见做法：

1. **固定加锁顺序**：所有线程都按相同顺序获取多个锁。
2. **加超时**：用 \`Monitor.TryEnter\` 而不是 \`Enter\`。
3. **缩小锁范围**：用更细粒度的锁。
4. **避免 lock 内 await**。

### 五、Interlocked：原子操作

对于简单的 int/long 操作，用 \`Interlocked\` 比 \`lock\` 高效得多。它直接用 CPU 指令保证原子性：

\`\`\`csharp
Interlocked.Increment(ref counter);     // ++counter
Interlocked.Decrement(ref counter);     // --counter
Interlocked.Add(ref total, 10);          // total += 10
Interlocked.Exchange(ref x, 5);          // x = 5（返回旧值）
Interlocked.CompareExchange(ref x, 5, 0); // if (x == 0) x = 5
\`\`\`

\`CompareExchange\` 是无锁编程的基础，可以实现 CAS（Compare-And-Swap）循环。

### 六、Mutex

\`Mutex\` 和 \`lock\` 类似，但可以跨进程——你可以用一个命名的 Mutex 来保证整个系统里只有一个程序实例运行：

\`\`\`csharp
using var mutex = new Mutex(false, "Global\\\\MyApp.Singleton");
if (!mutex.WaitOne(0))
{
    Console.WriteLine("另一个实例已在运行");
    return;
}
\`\`\`

但 \`Mutex\` 开销比 \`lock\` 大得多，单进程内一般不用。

### 七、SemaphoreSlim：异步信号量

信号量限制"同时能进入的线程数"。\`SemaphoreSlim\` 是 \`Semaphore\` 的轻量版，**支持异步等待**：

\`\`\`csharp
var sem = new SemaphoreSlim(3);  // 最多 3 个并发
async Task DoAsync()
{
    await sem.WaitAsync();  // 异步等信号量
    try { /* ... */ }
    finally { sem.Release(); }
}
\`\`\`

这是异步代码里**最常用的"锁"**——因为 \`lock\` 不能 await。

### 八、ReaderWriterLockSlim

读多写少的场景，用读写锁可以让多个读同时进行，写独占：

\`\`\`csharp
var rwLock = new ReaderWriterLockSlim();
// 读
rwLock.EnterReadLock();
try { /* 读数据 */ } finally { rwLock.ExitReadLock(); }
// 写
rwLock.EnterWriteLock();
try { /* 改数据 */ } finally { rwLock.ExitWriteLock(); }
\`\`\`

### 九、AutoResetEvent / ManualResetEvent / ManualResetEventSlim

这三种是"事件信号"，用于线程间通知：

- \`AutoResetEvent\`：放行一个等待者后自动复位。
- \`ManualResetEvent\`：放行所有等待者，需要手动 \`Reset\`。
- \`ManualResetEventSlim\`：纯进程内、短时间等待，性能更好。

\`\`\`csharp
var are = new AutoResetEvent(false);
// 等待方
are.WaitOne();
// 通知方
are.Set();
\`\`\`

### 十、CountdownEvent

"等待 N 个信号后才放行"，比手动用 \`Interlocked.Decrement\` + \`ManualResetEvent\` 方便：

\`\`\`csharp
var cde = new CountdownEvent(5);
Parallel.For(0, 5, i =>
{
    DoWork(i);
    cde.Signal();  // 完成 1 个
});
cde.Wait();  // 等所有 5 个完成
\`\`\`

### 十一、Barrier

让多个线程"阶段同步"——每个阶段所有线程都到了再一起继续，类似赛跑的发令枪：

\`\`\`csharp
var barrier = new Barrier(3);
for (int i = 0; i < 3; i++)
{
    Task.Run(() =>
    {
        Phase1();
        barrier.SignalAndWait();  // 等 3 个线程都到这里
        Phase2();
        barrier.SignalAndWait();
    });
}
\`\`\`

### 十二、ConcurrentQueue 简单使用

\`System.Collections.Concurrent\` 命名空间提供了一组线程安全集合，内部用无锁或细粒度锁实现。

\`\`\`csharp
var queue = new ConcurrentQueue<int>();
queue.Enqueue(1);
if (queue.TryDequeue(out var v)) { ... }
\`\`\`

并发集合适合"生产者-消费者"模式。

### 十三、异步锁：SemaphoreSlim.WaitAsync

记住一条铁律：**永远不要在 lock 里 await**。\`lock\` 持有的是线程，await 会切线程，无法保证释放。\`SemaphoreSlim.WaitAsync\` 是替代方案。

本章 demo 演示：lock 同步访问共享变量、SemaphoreSlim 异步锁、Interlocked 原子操作、CountdownEvent 等待多任务。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「并发同步」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句 - 并发同步演示
// 演示：lock 共享变量 + SemaphoreSlim 异步锁 + Interlocked 原子操作 + CountdownEvent 等待多任务

using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

// === 1. 不加锁的"丢更新"演示 ===
void DemoRaceCondition()
{
    int counter = 0;
    // 1 万次自增，多线程并发
    Parallel.For(0, 10000, _ => counter++);
    Console.WriteLine($"  无锁：counter = {counter}（预期 10000）");
    // 多半输出小于 10000
}

// === 2. 用 lock 保护（SafeCounter 类定义在文件末尾） ===
void DemoLock()
{
    var counter = new SafeCounter();
    Parallel.For(0, 10000, _ => counter.Increment());
    Console.WriteLine($"  lock：counter = {counter.Read()}（应为 10000）");
}

// === 3. Monitor.TryEnter：带超时的 lock ===
void DemoMonitorTryEnter()
{
    object sync = new();
    // 尝试 100ms 内拿到锁
    if (Monitor.TryEnter(sync, TimeSpan.FromMilliseconds(100)))
    {
        try
        {
            Console.WriteLine("  成功进入临界区");
        }
        finally
        {
            Monitor.Exit(sync);  // 必须在 finally 中释放
        }
    }
    else
    {
        Console.WriteLine("  获取锁超时");
    }
}

// === 4. Interlocked：原子操作（比 lock 高效得多） ===
void DemoInterlocked()
{
    int counter = 0;
    Parallel.For(0, 10000, _ =>
    {
        Interlocked.Increment(ref counter);  // CPU 指令级原子操作
    });
    Console.WriteLine($"  Interlocked.Increment：counter = {counter}（应为 10000）");

    // CompareExchange：CAS（Compare-And-Swap）的基础
    int x = 0;
    // 如果 x 当前是 0，就把它设成 1，返回旧值
    int original = Interlocked.CompareExchange(ref x, 1, 0);
    Console.WriteLine($"  CAS：x={x}, original={original}");

    // Add：原子加法
    int sum = 0;
    Parallel.For(0, 1000, _ => Interlocked.Add(ref sum, 1));
    Console.WriteLine($"  Interlocked.Add：sum = {sum}");
}

// === 5. SemaphoreSlim：异步信号量（最常用的"异步锁"） ===
// 限制同时只能有 2 个任务进入临界区
async Task DemoSemaphoreSlimAsync()
{
    using var sem = new SemaphoreSlim(2);  // 初始允许 2 个并发
    int running = 0, maxObserved = 0;

    async Task WorkerAsync(int id)
    {
        await sem.WaitAsync();  // 异步等待信号量（不会阻塞线程）
        try
        {
            int current = Interlocked.Increment(ref running);
            // 记录最大并发数
            int prev = maxObserved;
            while (current > prev &&
                   (prev = Interlocked.CompareExchange(ref maxObserved, current, prev)) != current) { }
            Console.WriteLine($"  [Worker {id}] 进入，当前并发 {current}");
            await Task.Delay(100);  // 模拟工作
            Interlocked.Decrement(ref running);
        }
        finally
        {
            sem.Release();  // 必须在 finally 中释放
        }
    }

    // 启动 5 个 worker，但同时只有 2 个能进入
    await Task.WhenAll(Enumerable.Range(0, 5).Select(WorkerAsync));
    Console.WriteLine($"  最大并发数：{maxObserved}（应 ≤ 2）");
}

// === 6. ReaderWriterLockSlim：读写锁（Cache 类定义在文件末尾） ===
void DemoReaderWriterLock()
{
    var cache = new Cache();
    cache.Set("a", "1");
    Console.WriteLine($"  读写锁：cache['a'] = {cache.Get("a")}");
}

// === 7. CountdownEvent：等 N 个任务完成 ===
void DemoCountdownEvent()
{
    using var cde = new CountdownEvent(5);  // 等待 5 个信号
    var sw = Stopwatch.StartNew();

    Parallel.For(0, 5, i =>
    {
        Thread.Sleep(100);  // 模拟工作
        cde.Signal();  // 每完成一个就 Signal 一次
    });

    cde.Wait();  // 阻塞直到计数归零
    sw.Stop();
    Console.WriteLine($"  CountdownEvent 全部完成，耗时 {sw.ElapsedMilliseconds}ms（约 100ms）");
}

// === 8. Barrier：阶段同步 ===
void DemoBarrier()
{
    int threads = 3;
    using var barrier = new Barrier(threads);
    var phases = new int[threads];

    Parallel.For(0, threads, i =>
    {
        // 阶段 1
        phases[i] = 1;
        barrier.SignalAndWait();  // 等所有线程都到这

        // 阶段 2（保证此时所有线程都完成了阶段 1）
        phases[i] = 2;
        barrier.SignalAndWait();
    });

    Console.WriteLine($"  Barrier 完成，所有线程最终阶段：{string.Join(",", phases)}");
}

// === 9. ConcurrentQueue：线程安全队列 ===
void DemoConcurrentQueue()
{
    var queue = new ConcurrentQueue<int>();

    // 多个生产者
    Parallel.For(0, 1000, i => queue.Enqueue(i));

    // 单消费者全部取出
    int count = 0;
    while (queue.TryDequeue(out _)) count++;
    Console.WriteLine($"  ConcurrentQueue 共取出 {count} 项");
}

// === 主入口 ===
Console.WriteLine("==== 1. 无锁竞态条件 ====");
DemoRaceCondition();

Console.WriteLine("\\n==== 2. lock 保护 ====");
DemoLock();

Console.WriteLine("\\n==== 3. Monitor.TryEnter ====");
DemoMonitorTryEnter();

Console.WriteLine("\\n==== 4. Interlocked 原子操作 ====");
DemoInterlocked();

Console.WriteLine("\\n==== 5. SemaphoreSlim 异步信号量 ====");
await DemoSemaphoreSlimAsync();

Console.WriteLine("\\n==== 6. ReaderWriterLockSlim ====");
DemoReaderWriterLock();

Console.WriteLine("\\n==== 7. CountdownEvent ====");
DemoCountdownEvent();

Console.WriteLine("\\n==== 8. Barrier 阶段同步 ====");
DemoBarrier();

Console.WriteLine("\\n==== 9. ConcurrentQueue ====");
DemoConcurrentQueue();

Console.WriteLine("\\n==== 全部完成 ====");

// === 类型声明区（顶级语句文件要求类型声明放在所有顶级语句之后） ===

// SafeCounter：用 lock 保护 int 累加
class SafeCounter
{
    private int _value;
    private readonly object _sync = new();  // 专用锁对象

    public void Increment()
    {
        // lock 是 Monitor.Enter/Exit 的语法糖
        // 同一时刻只有一个线程能进入这个块
        lock (_sync)
        {
            _value++;
        }
    }

    public int Read()
    {
        lock (_sync) { return _value; }  // 读也要锁，否则可能读到中间态
    }
}

// Cache：读写锁保护的多读单写缓存
class Cache
{
    private readonly ReaderWriterLockSlim _rw = new();
    private readonly Dictionary<string, string> _data = new();

    public string? Get(string key)
    {
        _rw.EnterReadLock();  // 多个读可同时进入
        try
        {
            return _data.TryGetValue(key, out var v) ? v : null;
        }
        finally { _rw.ExitReadLock(); }
    }

    public void Set(string key, string value)
    {
        _rw.EnterWriteLock();  // 写独占，所有读都被阻塞
        try { _data[key] = value; }
        finally { _rw.ExitWriteLock(); }
    }
}
`,
    lang: 'cs',
  },

  // ============================================================
  // 第四十九章：IAsyncEnumerable 与 Channels
  // ============================================================
  {
    id: 'csharp4-ch49',
    group: '第七部分 异步与并发',
    icon: '📡',
    title: 'IAsyncEnumerable 与 Channels',
    content: `## 第五十章　IAsyncEnumerable 与 Channels

异步流（IAsyncEnumerable）和 Channels 是 .NET 高并发场景的两大杀器。前者解决"流式异步产出数据"，后者解决"多生产者-多消费者的高性能管道"。本章详细讲解。

### 一、IAsyncEnumerable&lt;T&gt;（C# 8+）⭐

普通 \`IEnumerable<T>\` 是同步的——\`MoveNext\` 阻塞线程。\`IAsyncEnumerable<T>\` 是它的异步版本：每次 \`MoveNextAsync\` 返回 \`ValueTask<bool>\`，等数据真正就绪才完成。

\`\`\`csharp
async IAsyncEnumerable<int> ProduceAsync()
{
    for (int i = 0; i < 5; i++)
    {
        await Task.Delay(100);  // 异步获取数据
        yield return i;          // 产出一个值
    }
}
\`\`\`

### 二、异步迭代器 yield return

和同步迭代器一样，\`yield return\` 让编译器自动生成状态机。区别是异步迭代器可以在 \`yield return\` 之间穿插 \`await\`。

### 三、await foreach 消费

\`\`\`csharp
await foreach (var item in ProduceAsync())
{
    Console.WriteLine(item);
}
\`\`\`

\`await foreach\` 等价于：

\`\`\`csharp
var enumerator = ProduceAsync().GetAsyncEnumerator();
while (await enumerator.MoveNextAsync())
{
    var item = enumerator.Current;
    Console.WriteLine(item);
}
\`\`\`

### 四、ConfigureAwait

\`await foreach\` 也可以加 \`ConfigureAwait(false)\`：

\`\`\`csharp
await foreach (var item in ProduceAsync().ConfigureAwait(false)) { ... }
\`\`\`

类库代码同样推荐这样写。

### 五、异步流的取消

异步迭代器方法可以接收 \`CancellationToken\`，并用 \`[EnumeratorCancellation]\` 特性标注，这样 \`await foreach\` 传入的 CT 才能传到迭代器内部：

\`\`\`csharp
async IAsyncEnumerable<int> ProduceAsync(
    [EnumeratorCancellation] CancellationToken ct = default)
{
    for (int i = 0; ; i++)
    {
        ct.ThrowIfCancellationRequested();
        await Task.Delay(100, ct);
        yield return i;
    }
}

// 消费时传 CT
await foreach (var x in ProduceAsync().WithCancellation(ct)) { ... }
\`\`\`

### 六、Channel&lt;T&gt;：System.Threading.Channels

\`Channel<T>\` 是 .NET 提供的高性能"生产者-消费者"队列，比 \`ConcurrentQueue\` + 信号量组合更高效。它有几种变体：

- \`Channel.CreateUnbounded<T>()\`：无界通道，写入永不阻塞，但可能 OOM。
- \`Channel.CreateBounded<T>(capacity)\`：有界通道，满了会按策略阻塞或丢弃。

\`\`\`csharp
var channel = Channel.CreateBounded<int>(100);
// 写入方
await channel.Writer.WriteAsync(42);
// 读取方
int x = await channel.Reader.ReadAsync();
\`\`\`

### 七、ChannelWriter 与 ChannelReader

- \`ChannelWriter<T>\`：写入端，\`WriteAsync\` / \`TryWrite\` / \`Complete()\`。
- \`ChannelReader<T>\`：读取端，\`ReadAsync\` / \`TryRead\` / \`WaitToReadAsync\` / \`ReadAllAsync\`。

\`Complete()\` 表示"再也不会写入了"，读取端读到这会知道流结束了。

### 八、BoundedChannel 的满策略

\`\`\`csharp
var opts = new BoundedChannelOptions(100)
{
    FullMode = BoundedChannelFullMode.Wait  // 满则等待
};
\`\`\`

可选策略：

| FullMode | 行为 |
| --- | --- |
| \`Wait\` | 写入方异步等待空位 |
| \`DropWrite\` | 直接丢弃要写的项 |
| \`DropOldest\` | 丢弃最旧的项 |
| \`DropNewest\` | 丢弃最新的项 |

### 九、生产者-消费者模式

典型用法：N 个生产者往 Channel 写，M 个消费者从 Channel 读，自动负载均衡。

\`\`\`csharp
var channel = Channel.CreateBounded<int>(100);

// 生产者
async Task ProduceAsync()
{
    for (int i = 0; i < 1000; i++)
        await channel.Writer.WriteAsync(i);
    channel.Writer.Complete();  // 写完了
}

// 消费者
async Task ConsumeAsync()
{
    await foreach (var item in channel.Reader.ReadAllAsync())
        Process(item);
}
\`\`\`

### 十、Channel 与 IAsyncEnumerable 转换：ReadAllAsync

\`ChannelReader<T>.ReadAllAsync()\` 直接返回 \`IAsyncEnumerable<T>\`，可以 \`await foreach\` 消费。这让两者天然结合。

### 十一、Backpressure（背压）

当生产速度 > 消费速度时，无界 Channel 会无限堆积最终 OOM。有界 Channel + \`Wait\` 模式天然支持背压：写入方被阻塞，强制其放慢速度。

这是设计高吞吐系统时的重要技巧——"用有界队列 + 慢消费者反向限流生产者"。

### 十二、什么时候用 IAsyncEnumerable，什么时候用 Channel？

- **IAsyncEnumerable**：单一生产者、流式产出、消费者直接消费。像 SQL 流式读取。
- **Channel**：多生产者多消费者、解耦生产消费速率、需要背压。像消息队列。

本章 demo 演示：IAsyncEnumerable 流式数据、Channel 生产者消费者管道、背压效果。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「IAsyncEnumerable 与 Channels」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句 - IAsyncEnumerable 与 Channels 演示
// 演示：异步流产出与消费 + Channel 生产者消费者管道 + 背压效果

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;

// === 1. IAsyncEnumerable<T> 基础 ===
// 异步迭代器方法，可以在 yield return 之间穿插 await
async IAsyncEnumerable<int> GenerateNumbersAsync(
    int count,
    [EnumeratorCancellation] CancellationToken ct = default)
{
    for (int i = 1; i <= count; i++)
    {
        ct.ThrowIfCancellationRequested();      // 检查取消
        await Task.Delay(100, ct);              // 模拟异步获取数据
        yield return i;                          // 异步产出一个值
    }
}

// === 2. await foreach 消费 ===
async Task DemoAsyncStreamAsync()
{
    Console.WriteLine("  开始消费异步流...");
    var sw = Stopwatch.StartNew();
    int sum = 0;

    // await foreach 自动 await 每次 MoveNextAsync
    await foreach (var n in GenerateNumbersAsync(5))
    {
        Console.WriteLine($"  收到：{n}");
        sum += n;
    }
    sw.Stop();
    Console.WriteLine($"  求和 = {sum}，耗时 {sw.ElapsedMilliseconds}ms（约 500ms）");
}

// === 3. 异步流 + 取消 ===
async Task DemoAsyncStreamCancelAsync()
{
    using var cts = new CancellationTokenSource();
    cts.CancelAfter(250);  // 250ms 后取消

    try
    {
        // WithCancellation 把 CT 传到迭代器内部
        await foreach (var n in GenerateNumbersAsync(100).WithCancellation(cts.Token))
        {
            Console.WriteLine($"  消费：{n}");
        }
    }
    catch (OperationCanceledException)
    {
        Console.WriteLine("  流被取消");
    }
}

// === 4. Channel<T> 基础：单生产者单消费者 ===
async Task DemoChannelBasicAsync()
{
    // 创建一个有界 Channel，容量 10
    Channel<int> channel = Channel.CreateBounded<int>(10);

    // 生产者：往 Channel 写数据
    async Task ProduceAsync()
    {
        for (int i = 1; i <= 5; i++)
        {
            await channel.Writer.WriteAsync(i);  // 写入（满则等待）
            Console.WriteLine($"  写入：{i}");
        }
        channel.Writer.Complete();  // 通知：写完了，不再有数据
    }

    // 消费者：从 Channel 读数据
    async Task ConsumeAsync()
    {
        // ReadAllAsync 返回 IAsyncEnumerable<T>，可以 await foreach
        await foreach (var item in channel.Reader.ReadAllAsync())
        {
            Console.WriteLine($"  读出：{item}");
            await Task.Delay(50);  // 模拟处理
        }
    }

    // 同时启动生产者和消费者
    await Task.WhenAll(ProduceAsync(), ConsumeAsync());
    Console.WriteLine("  Channel 基础演示完成");
}

// === 5. Channel 多生产者多消费者管道 ===
async Task DemoChannelPipelineAsync()
{
    // 第一阶段 → 第二阶段 → 输出
    Channel<int> stage1 = Channel.CreateBounded<int>(10);
    Channel<string> stage2 = Channel.CreateBounded<string>(10);

    // 生产者：往 stage1 写
    async Task ProducerAsync()
    {
        for (int i = 1; i <= 20; i++)
            await stage1.Writer.WriteAsync(i);
        stage1.Writer.Complete();
    }

    // 中间处理器：从 stage1 读，处理后写 stage2
    async Task TransformerAsync(int id)
    {
        try
        {
            await foreach (var n in stage1.Reader.ReadAllAsync())
            {
                string s = $"T{id}-[{n * 10}]";  // 把数字 ×10 并打标
                await stage2.Writer.WriteAsync(s);
                await Task.Delay(10);  // 模拟工作
            }
        }
        catch (ChannelClosedException) { /* stage1 关闭了 */ }
    }

    // 多个 transformer 都跑完后，关闭 stage2
    async Task RunTransformersAsync()
    {
        var transformers = Enumerable.Range(0, 3).Select(TransformerAsync);
        await Task.WhenAll(transformers);
        stage2.Writer.Complete();  // 所有 transformer 结束，stage2 也关
    }

    // 终端消费者：从 stage2 读
    async Task ConsumerAsync()
    {
        int count = 0;
        await foreach (var s in stage2.Reader.ReadAllAsync())
        {
            count++;
            // Console.WriteLine($"    输出：{s}");  // 太多不打印
        }
        Console.WriteLine($"  最终消费者处理了 {count} 项");
    }

    var sw = Stopwatch.StartNew();
    await Task.WhenAll(ProducerAsync(), RunTransformersAsync(), ConsumerAsync());
    sw.Stop();
    Console.WriteLine($"  管道总耗时 {sw.ElapsedMilliseconds}ms");
}

// === 6. 背压演示：有界 Channel + Wait 模式 ===
async Task DemoBackpressureAsync()
{
    // 容量 3，FullMode 默认是 Wait：满了写方会等待
    var channel = Channel.CreateBounded<int>(new BoundedChannelOptions(3)
    {
        FullMode = BoundedChannelFullMode.Wait,
    });

    var sw = Stopwatch.StartNew();

    // 快速生产者：每 10ms 一个
    async Task ProducerAsync()
    {
        for (int i = 1; i <= 10; i++)
        {
            await channel.Writer.WriteAsync(i);  // 满了会阻塞在这里
            Console.WriteLine($"    写入 {i} @ {sw.ElapsedMilliseconds}ms");
        }
        channel.Writer.Complete();
    }

    // 慢消费者：每 100ms 一个
    async Task ConsumerAsync()
    {
        await foreach (var n in channel.Reader.ReadAllAsync())
        {
            await Task.Delay(100);  // 慢消费
        }
    }

    await Task.WhenAll(ProducerAsync(), ConsumerAsync());
    sw.Stop();
    Console.WriteLine($"  背压演示总耗时 {sw.ElapsedMilliseconds}ms（约 1000ms）");
}

// === 7. Channel 关闭与 TryRead ===
async Task DemoChannelCompletionAsync()
{
    var channel = Channel.CreateUnbounded<int>();

    // 写两条然后 Complete
    channel.Writer.TryWrite(1);
    channel.Writer.TryWrite(2);
    channel.Writer.Complete();  // 不再写入

    // ReadAllAsync 会读到所有已写入项，然后正常结束
    int count = 0;
    await foreach (var _ in channel.Reader.ReadAllAsync())
        count++;
    Console.WriteLine($"  Complete 后仍能读完已写入项：{count}");

    // Complete 之后再写会失败
    bool ok = channel.Writer.TryWrite(3);
    Console.WriteLine($"  Complete 后 TryWrite 成功？{ok}");
}

// === 主入口 ===
Console.WriteLine("==== 1. IAsyncEnumerable 异步流 ====");
await DemoAsyncStreamAsync();

Console.WriteLine("\\n==== 2. 异步流 + 取消 ====");
await DemoAsyncStreamCancelAsync();

Console.WriteLine("\\n==== 3. Channel 基础 ====");
await DemoChannelBasicAsync();

Console.WriteLine("\\n==== 4. Channel 多生产者多消费者管道 ====");
await DemoChannelPipelineAsync();

Console.WriteLine("\\n==== 5. 背压演示 ====");
await DemoBackpressureAsync();

Console.WriteLine("\\n==== 6. Channel 关闭与 TryRead ====");
await DemoChannelCompletionAsync();

Console.WriteLine("\\n==== 全部完成 ====");
`,
    lang: 'cs',
  },

  // ============================================================
  // 第五十章：线程与线程池
  // ============================================================
  {
    id: 'csharp4-ch50',
    group: '第七部分 异步与并发',
    icon: '🧠',
    title: '线程与线程池',
    content: `## 第五十一章　线程与线程池

虽然日常开发都直接用 \`Task\` / \`async\`，但理解底层 \`Thread\` 和 \`ThreadPool\` 的运作机制，对诊断性能问题、死锁、线程池饥饿至关重要。本章从底层往上讲。

### 一、Thread 类：历史的产物 ⭐

\`Thread\` 直接对应一个操作系统线程。早期 .NET（1.0 时代）唯一的并发方式。创建一个 Thread 至少要 1MB 栈空间，开销大。

\`\`\`csharp
var t = new Thread(() =>
{
    Console.WriteLine("在线程 " + Thread.CurrentThread.ManagedThreadId);
});
t.Start();
t.Join();  // 等待结束
\`\`\`

\`Thread\` 现在只在特殊场景使用：

- 需要单线程独占的长生命周期后台任务
- 需要设置 \`IsBackground = false\`（前台线程，让进程等它结束）
- 需要 \`Priority\` 调整

### 二、ThreadPool：线程复用

为每个任务新建线程太贵，所以 .NET 引入了"线程池"——一组可复用的工作线程。任务来了从池里取线程，完成后归还。

\`\`\`csharp
ThreadPool.QueueUserWorkItem(_ => DoWork());
\`\`\`

\`Task.Run\` 默认就是把工作排到 ThreadPool 上执行。

### 三、ThreadPool.QueueUserWorkItem

最直接的"扔到线程池跑"的方式：

\`\`\`csharp
ThreadPool.QueueUserWorkItem(callback, state);

// 现代 C# 优先用 Task.Run
Task.Run(() => callback(state));
\`\`\`

后者更易用、支持 await、能拿到返回值。新代码基本都用 \`Task.Run\`。

### 四、GetAvailableThreads / GetMaxThreads / GetMinThreads

\`\`\`csharp
ThreadPool.GetMaxThreads(out int maxWorker, out int maxIO);
ThreadPool.GetMinThreads(out int minWorker, out int minIO);
ThreadPool.GetAvailableThreads(out int availWorker, out int availIO);
\`\`\`

- \`maxWorker\`：线程池最多能开多少工作线程（默认 int.MaxValue，但受内存限制）。
- \`minWorker\`：线程池最少保持多少线程（默认等于 CPU 核数）。
- \`availWorker\`：当前空闲线程数。

### 五、SetMinThreads / SetMaxThreads

\`\`\`csharp
ThreadPool.SetMinThreads(50, 50);
\`\`\`

调整 \`minWorker\` 是个常见优化：默认线程池增长缓慢（每 0.5 秒才加 1 个新线程），如果你的服务突然来了 100 个并发请求，会卡半天。把 min 调高（比如 50）能减少"冷启动延迟"。

但不要乱调 max——通常默认即可。

### 六、线程池饥饿

线程池饥饿：所有工作线程都被占用（比如在 \`lock\` 里阻塞、或者 sync-over-async 用 \`.Result\`），新任务排队等不到线程，整个进程响应变慢。

典型成因：

1. 大量 \`Task.Run\` 内部 \`Thread.Sleep\` 阻塞。
2. async 方法内部调用了 \`.Result\` 阻塞等待。
3. 长任务用 \`Task.Run\` 而不是 \`TaskCreationOptions.LongRunning\`。

解决方案：少阻塞、多异步；CPU 密集型用 LongRunning 给独立线程。

### 七、Task 默认调度到 ThreadPool

\`Task.Run\` / \`Task.Factory.StartNew\` 默认用 \`ThreadPoolTaskScheduler\`，把任务排到 ThreadPool。这就是为什么大量短任务用 \`Task\` 比手动 \`Thread\` 高效得多——线程被复用。

### 八、Thread vs Task 对照

| 维度 | Thread | Task |
| --- | --- | --- |
| 抽象层级 | OS 线程 | 工作单元（可能不开新线程） |
| 开销 | 大（1MB 栈） | 小（池化复用） |
| 取消 | 难（abort 已废弃） | 简单（CancellationToken） |
| 返回值 | 无 | Task&lt;T&gt; |
| 异常处理 | 难 | await 自动抛出 |
| 现代用法 | 极少 | 首选 |

记住：**新代码不要直接用 Thread**。

### 九、ThreadLocal&lt;T&gt;

每个线程一份独立副本，避免锁竞争：

\`\`\`csharp
var localRand = new ThreadLocal<Random>(() => new Random());
int v = localRand.Value.Next();  // 每个线程独立 Random 实例
\`\`\`

\`Random\` 不是线程安全的，多线程共用一个会坏掉，用 \`ThreadLocal\` 是经典解决方案（.NET 6+ 后 \`Random.Shared\` 已线程安全，可不再用 ThreadLocal）。

### 十、AsyncLocal&lt;T&gt;

\`AsyncLocal<T>\` 是 \`ThreadLocal\` 的异步版：在 \`await\` 切换线程后，值**仍然跟随**逻辑调用链流转。这是实现"请求级上下文"（如当前用户、TraceId）的关键。

\`\`\`csharp
static AsyncLocal<string?> CurrentUser = new();

async Task A()
{
    CurrentUser.Value = "Alice";
    await B();  // 即使 B 在另一个线程执行，也能读到 "Alice"
}

async Task B()
{
    Console.WriteLine(CurrentUser.Value);  // Alice
}
\`\`\`

底层靠 \`ExecutionContext\` 实现：每个异步操作开始时快照上下文，切线程时恢复。

### 十一、ExecutionContext

执行上下文：包含 \`AsyncLocal\` 数据、安全上下文等。每次 await 前后自动捕获和恢复。你几乎不用直接操作它，但要知道它的存在——这是 \`AsyncLocal\` 能跨线程传递的根本原因。

### 十二、SynchronizationContext：UI 与旧 ASP.NET

同步上下文决定"await 完成后回到哪个线程"：

- **WinForms / WPF**：有 \`SynchronizationContext\`，await 后回到 UI 线程。
- **旧版 ASP.NET（.NET Framework）**：有，await 后回到请求线程。
- **ASP.NET Core / 控制台**：**没有** \`SynchronizationContext\`，await 后回到线程池任意线程。

这就是为什么 \`ConfigureAwait(false)\` 在 UI 程序里有意义（跳过回到 UI 线程），在 ASP.NET Core 里没意义（本来就没有同步上下文）。

### 十三、ConfigureAwait 详解

\`ConfigureAwait(true)\`（默认）：完成后尝试回到原 \`SynchronizationContext\`。

\`ConfigureAwait(false)\`：不回到原上下文，直接在当前线程继续。

- **类库代码**：永远 \`ConfigureAwait(false)\`，避免依赖调用方上下文。
- **UI 代码**：要更新控件时，不加（默认 true），让代码回到 UI 线程。
- **ASP.NET Core**：加不加都行，没有同步上下文。

### 十四、性能与诊断小贴士

1. 用 \`ThreadPool.GetAvailableThreads\` 诊断线程池是否被压满。
2. 用 \`EventSource\` / \`dotnet-counters\` 看 \`ThreadPool Thread Count\`、\`ThreadPool Queue Length\`。
3. 高并发服务务必测试突发流量下的延迟。

本章 demo 演示：ThreadPool.QueueUserWorkItem、ThreadLocal&lt;Random&gt;、AsyncLocal&lt;string&gt; 上下文流转、测量 ThreadPool 启动延迟。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「线程与线程池」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句 - 线程与线程池演示
// 演示：ThreadPool.QueueUserWorkItem + ThreadLocal<Random> + AsyncLocal<string> 上下文流转 + 测量 ThreadPool 启动延迟

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;

// === 1. Thread 类：直接创建线程（历史写法，新代码不推荐） ===
void DemoThread()
{
    var t = new Thread(() =>
    {
        Console.WriteLine($"  Thread 工作，ManagedThreadId = {Thread.CurrentThread.ManagedThreadId}");
        Thread.Sleep(50);
    });

    // 默认 IsBackground = false（前台线程，进程会等它结束才退出）
    // 设为 true 则是后台线程，进程可以不等它就退出
    t.IsBackground = true;
    t.Start();
    t.Join();  // 等待线程结束
    Console.WriteLine("  Thread 演示完成");
}

// === 2. ThreadPool.QueueUserWorkItem：扔到线程池 ===
void DemoThreadPoolQueue()
{
    int done = 0;
    using var doneEvent = new ManualResetEventSlim(false);

    // 把工作排到线程池，比 new Thread 高效得多
    ThreadPool.QueueUserWorkItem(_ =>
    {
        Console.WriteLine($"  线程池工作，ManagedThreadId = {Thread.CurrentThread.ManagedThreadId}");
        Thread.Sleep(30);
        if (Interlocked.Increment(ref done) == 1)
            doneEvent.Set();
    });

    doneEvent.Wait();  // 等工作完成
    Console.WriteLine("  ThreadPool.QueueUserWorkItem 完成");
}

// === 3. 查看 / 配置线程池 ===
void ShowThreadPoolInfo()
{
    ThreadPool.GetMinThreads(out int minWorker, out int minIO);
    ThreadPool.GetMaxThreads(out int maxWorker, out int maxIO);
    ThreadPool.GetAvailableThreads(out int availWorker, out int availIO);

    Console.WriteLine($"  最小工作线程：{minWorker}（默认 = CPU 核数 = {Environment.ProcessorCount}）");
    Console.WriteLine($"  最大工作线程：{maxWorker}");
    Console.WriteLine($"  可用工作线程：{availWorker}");
}

// === 4. 测量 ThreadPool 冷启动延迟 ===
// 默认线程池增长很慢（每 ~0.5s 才 +1），突发并发会卡顿
async Task DemoThreadPoolRampUpAsync()
{
    // 不调 SetMinThreads 时，启动 100 个并发任务的延迟会很明显
    var sw = Stopwatch.StartNew();

    var tasks = new List<Task>();
    for (int i = 0; i < 50; i++)
    {
        tasks.Add(Task.Run(async () =>
        {
            await Task.Delay(50);  // 模拟短工作
        }));
    }
    await Task.WhenAll(tasks);
    sw.Stop();
    Console.WriteLine($"  50 个并发 Task.Run 完成，耗时 {sw.ElapsedMilliseconds}ms");
    // 如果 min 设置过低，这里可能 > 1000ms（线程池慢慢涨）
}

// === 5. SetMinThreads 调优：把 min 调高，减少冷启动延迟 ===
void TryTuneMinThreads()
{
    // 把最小工作线程调到 50，让线程池一开始就有 50 个线程待命
    // 注意：仅在确认有线程池饥饿问题时才调
    if (ThreadPool.SetMinThreads(50, 50))
        Console.WriteLine("  SetMinThreads(50, 50) 成功");
    else
        Console.WriteLine("  SetMinThreads 失败");
}

// === 6. ThreadLocal<T>：每线程一份副本 ===
// 经典场景：Random 不是线程安全的，每个线程要独立实例
void DemoThreadLocal()
{
    // ThreadLocal<T>：每个线程访问 Value 时得到一个独立实例
    // 工厂函数为每个新线程创建一个 Random
    var localRand = new ThreadLocal<Random>(() => new Random(Thread.CurrentThread.ManagedThreadId));

    int[] results = new int[5];
    Parallel.For(0, 5, i =>
    {
        // 各线程拿到的是不同的 Random 实例，不会互相干扰
        results[i] = localRand.Value!.Next(1, 1000);
    });

    Console.WriteLine($"  ThreadLocal<Random> 各线程结果：[{string.Join(", ", results)}]");
    // 注意：.NET 6+ 的 Random.Shared 已是线程安全，新代码可以直接用
}

// === 7. AsyncLocal<T>：异步上下文流转 ===
// 在 await 切换线程后，AsyncLocal 的值仍然跟随
// 注意：static AsyncLocal 字段必须放在类型里，不能直接放在顶级语句
// 这里通过下面定义的 AppContext 静态类来持有（类型声明可以放在文件末尾）

async Task DemoAsyncLocalAsync()
{
    // 在调用链顶端设置上下文
    AppContext.CurrentUser.Value = "Alice";
    AppContext.TraceId.Value = Guid.NewGuid().ToString("N")[..8];

    Console.WriteLine($"  [顶层] 线程 {Thread.CurrentThread.ManagedThreadId}：user={AppContext.CurrentUser.Value}, trace={AppContext.TraceId.Value}");

    await DoWorkAsync();  // 内部会切线程，但上下文会跟着传

    async Task DoWorkAsync()
    {
        await Task.Delay(20);  // 这里通常会切线程
        Console.WriteLine($"  [内层] 线程 {Thread.CurrentThread.ManagedThreadId}：user={AppContext.CurrentUser.Value}, trace={AppContext.TraceId.Value}");
        // 即使线程变了，AsyncLocal 的值仍能读出来 —— 这就是 ExecutionContext 的作用
    }
}

// === 8. AsyncLocal 的"写入隔离"特性 ===
// 子调用链修改 AsyncLocal 不会影响父调用链（每次 await 是快照副本）
async Task DemoAsyncLocalWriteIsolationAsync()
{
    AppContext.CurrentUser.Value = "Parent";

    async Task ChildAsync()
    {
        Console.WriteLine($"    [Child 开始] user = {AppContext.CurrentUser.Value}");  // Parent
        AppContext.CurrentUser.Value = "Child";  // 修改只影响这个子调用链
        await Task.Delay(10);
        Console.WriteLine($"    [Child 结束] user = {AppContext.CurrentUser.Value}");  // Child
    }

    await ChildAsync();
    Console.WriteLine($"  [Parent] user = {AppContext.CurrentUser.Value}");  // 仍是 Parent
}

// === 9. 线程池饥饿演示（注释版） ===
// 下面这段代码会让线程池饿死，仅作说明，不要在 demo 里跑
// for (int i = 0; i < 100; i++)
//     Task.Run(() => Thread.Sleep(int.MaxValue));  // 占着线程不放
// 然后任何新 Task.Run 都会卡顿，因为没线程可用
// 正确做法：用 async 代替 Thread.Sleep；或用 LongRunning 给独立线程

// === 主入口 ===
Console.WriteLine("==== 1. Thread 类 ====");
DemoThread();

Console.WriteLine("\\n==== 2. ThreadPool.QueueUserWorkItem ====");
DemoThreadPoolQueue();

Console.WriteLine("\\n==== 3. 线程池信息 ====");
ShowThreadPoolInfo();

Console.WriteLine("\\n==== 4. ThreadPool 冷启动延迟（默认 min） ====");
await DemoThreadPoolRampUpAsync();

Console.WriteLine("\\n==== 5. SetMinThreads 调优 ====");
TryTuneMinThreads();

Console.WriteLine("\\n==== 6. 调优后再测 ====");
await DemoThreadPoolRampUpAsync();

Console.WriteLine("\\n==== 7. ThreadLocal<Random> ====");
DemoThreadLocal();

Console.WriteLine("\\n==== 8. AsyncLocal 上下文流转 ====");
await DemoAsyncLocalAsync();

Console.WriteLine("\\n==== 9. AsyncLocal 写入隔离 ====");
await DemoAsyncLocalWriteIsolationAsync();

Console.WriteLine("\\n==== 全部完成 ====");

// === 类型声明区（顶级语句文件允许在末尾声明类型） ===

// AppContext：用静态 AsyncLocal 字段持有跨线程上下文
// AsyncLocal<T> 必须是某个类型的静态成员，不能直接放在顶级语句
static class AppContext
{
    // AsyncLocal<T>：await 切换线程后，值仍然跟随逻辑调用链流转
    public static AsyncLocal<string?> CurrentUser { get; } = new();
    public static AsyncLocal<string?> TraceId { get; } = new();
}
`,
    lang: 'cs',
  },
];

export { chapters };
