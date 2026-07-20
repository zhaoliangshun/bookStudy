// =============================================================
// C# 大全 - 第八批章节（第八部分 异步与并发，共 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   csharp2-ch39 : 第三十九章 async/await 异步编程
//   csharp2-ch40 : 第四十章 Task 与并行
//   csharp2-ch41 : 第四十一章 锁与线程同步
//   csharp2-ch42 : 第四十二章 CancellationToken 与并发集合
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，解释「为什么」。
// 异步是 C# 现代开发核心技能，本章重点讲清原理与陷阱。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句。
// 注意：异步 demo 用 Task.Delay 模拟耗时操作，不用 Thread.Sleep（会阻塞线程）。
// ⭐ 标记为日常开发高频知识点。
// =============================================================

const chapters = [
  // ============================================================
  // 第三十九章：async/await 异步编程
  // ============================================================
  {
    id: 'csharp2-ch39',
    group: '第八部分 异步与并发',
    icon: '⚡',
    title: '第三十九章 async/await 异步编程',
    content: `## 第三十九章　async/await 异步编程

\`async/await\` 是现代 C# 异步编程的核心。它让异步代码写得像同步代码一样直白，又不会阻塞线程。这一章是 C# 进阶的分水岭，搞不懂 async 你就写不好 Web、UI、IO 任何场景。

### 一、为什么需要异步

先看一段「同步」代码——调用一个耗时 2 秒的接口：

\`\`\`csharp
using System;
using System.Threading;

// 同步：调用线程一直卡在这里干等
string Download(string url)
{
    // 模拟 2 秒网络耗时
    Thread.Sleep(2000);
    return $"<html>{url}</html>";
}

var html = Download("https://example.com");
Console.WriteLine(html);
Console.WriteLine("主线程能继续干别的吗？不能，被卡住了。");
\`\`\`

问题在哪？**线程被白白占用 2 秒**。在 Web 服务器场景，每个请求占一个线程，线程池撑不住就 OOM；在 UI 场景，主线程卡死，界面假死。

异步的本质：**「线程不等了，先去干别的，等结果好了再回来继续」**。

\`\`\`csharp
using System;
using System.Threading.Tasks;

// 异步：线程不等 IO，去做别的，等 IO 完了再回来
// async/await 状态机原理：编译器把 async 方法改写成一个状态机类，
//   await 处会「暂停」方法执行，把控制权交回调用方；
//   当 await 的 Task 完成时，状态机从暂停点恢复继续执行。
//   整个过程**不创建新线程**，只是在 IO 完成时从线程池借一个线程继续跑后续代码。
async Task<string> DownloadAsync(string url)
{
    await Task.Delay(2000);   // 线程释放，不阻塞：这里底层注册一个定时器回调，线程直接返回线程池
    return $"<html>{url}</html>";
}

var html = await DownloadAsync("https://example.com");
Console.WriteLine(html);
\`\`\`

> ⭐ 关键认知：\`Thread.Sleep(2000)\` 是「占着线程睡 2 秒」，\`await Task.Delay(2000)\` 是「线程先走，2 秒后用回调通知」。两者天差地别。

### 二、async/await 语法 ⭐

最小可用例：

\`\`\`csharp
using System;
using System.Threading.Tasks;

// async 关键字标记方法为异步方法，编译器会生成状态机
// Task 表示「这个方法异步执行，没返回值」（类似同步 void，但可 await、可捕获异常）
async Task SayHiAsync()
{
    Console.WriteLine("开始");
    await Task.Delay(1000);    // 等待 1 秒：此处状态机暂停，返回调用方
    Console.WriteLine("结束");  // 1 秒后，从线程池拿线程继续执行这里
}

// 调用方也必须 await（在顶级语句中顶层 await 是允许的，C# 7.2+/.NET Core+）
await SayHiAsync();
\`\`\`

规则：
- \`async\` 修饰方法，方法内才能用 \`await\`。
- \`await\` 一个 \`Task\` 表示「等它完成，期间释放线程」。
- 异步方法命名约定加 \`Async\` 后缀。
- 调用 async 方法必须 await（或显式 fire-and-forget，但谨慎）。

### 三、异步方法的返回类型

\`\`\`csharp
using System;
using System.Threading.Tasks;

// 1. Task：无返回值（类似 void，但可 await）
async Task LogAsync(string msg)
{
    await Task.Delay(100);
    Console.WriteLine(msg);
}

// 2. Task<T>：返回 T
async Task<int> GetCountAsync()
{
    await Task.Delay(100);
    return 42;
}

int count = await GetCountAsync();
Console.WriteLine(count);    // 42

// 3. void：仅限事件处理器，其他场合禁止用（见下文陷阱）
//    async void 的问题：调用方无法 await，异常无法被 catch，会直接崩溃进程
async void OnClick(object sender, EventArgs e)
{
    await Task.Delay(100);
    Console.WriteLine("点了");
}
\`\`\`

> ⭐ 面试高频：异步方法返回 \`Task\` 或 \`Task<T>\`，**不要返回 void**（事件处理器除外）。返回 void 的异步方法无法 await、异常无法捕获。

### 四、同步 vs 异步对比

\`\`\`csharp
using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;

// 同步：三个串行接口，总耗时 = 1+2+1 = 4 秒
string SyncFetch(int id)
{
    Thread.Sleep(id * 1000);
    return $"data-{id}";
}

var sw = Stopwatch.StartNew();
var a = SyncFetch(1);
var b = SyncFetch(2);
var c = SyncFetch(1);
Console.WriteLine($"同步耗时 {sw.ElapsedMilliseconds} ms");   // ~4000

// 异步：三个并发，总耗时 ≈ max(1,2,1) = 2 秒
// 关键：先调用所有 Async 方法拿到 Task（此时任务已启动），再 await Task.WhenAll 等待全部完成
async Task<string> AsyncFetch(int id)
{
    await Task.Delay(id * 1000);
    return $"data-{id}";
}

sw.Restart();
var ta = AsyncFetch(1);   // 任务已启动
var tb = AsyncFetch(2);   // 任务已启动
var tc = AsyncFetch(1);   // 任务已启动
await Task.WhenAll(ta, tb, tc);   // 并发等待所有任务
Console.WriteLine($"异步耗时 {sw.ElapsedMilliseconds} ms");   // ~2000
\`\`\`

**并发是异步最大的红利**：3 个 IO 同时跑，耗时取决于最慢的那个。

### 五、async void 陷阱 ⭐

\`\`\`csharp
using System;
using System.Threading.Tasks;

// ❌ 反例：async void 抛异常没人接，进程崩溃
// 原因：async void 没有 Task 对象作为异常载体，异常会直接抛到 SynchronizationContext，
//       UI/ASP.NET 场景通常会导致进程崩溃
async void BadAsync()
{
    await Task.Delay(100);
    throw new InvalidOperationException("炸了");
}

// BadAsync();   // 取消注释运行：try/catch 抓不住，直接崩溃
// 异常在另一个上下文抛出，try/catch 抓不到

// ✅ 正例：返回 Task，调用方可以 await 和 try/catch
async Task GoodAsync()
{
    await Task.Delay(100);
    throw new InvalidOperationException("炸了");
}

try
{
    await GoodAsync();
}
catch (Exception ex)
{
    Console.WriteLine($"捕获：{ex.Message}");
}
\`\`\`

什么时候允许 \`async void\`？**只有事件处理器**（按钮 Click、Window Loaded 等），因为事件签名就是 void。

### 六、ConfigureAwait(false) ⭐

\`\`\`csharp
using System.Threading.Tasks;

// 库代码里常见的写法
async Task<string> FetchAsync()
{
    // ConfigureAwait(false) 含义：await 完成后**不需要回到原来的同步上下文**（如 UI 线程）
    // 默认 ConfigureAwait(true) 会尝试捕获并回到原始上下文，这在 UI 场景需要（更新UI必须在UI线程），
    // 但在库代码/ASP.NET Core 会造成不必要的上下文切换，甚至死锁
    await Task.Delay(100).ConfigureAwait(false);
    return "done";
}
\`\`\`

为什么要 \`.ConfigureAwait(false)\`？
- **库代码**必须加：避免调用方的 UI 上下文被强制串行化，提升并发性能，防止死锁。
- **应用程序代码**（WinForms/WPF 顶层）可以不加，因为本来就要回 UI 线程更新界面。
- **ASP.NET Core / 控制台**：没有同步上下文，加不加效果一样，但加上更明确。

> 经典死锁场景：UI 线程调用 \`Task.Wait()\` 等 async 方法，而 async 方法又要回到 UI 线程，于是双方互等。\`ConfigureAwait(false)\` 是解药之一。

### 七、ValueTask 简介

\`Task\` 是引用类型，每次 await 都要分配对象。如果方法经常同步完成（比如缓存命中），可以用 \`ValueTask<T>\` 避免分配：

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

// 缓存场景：命中走同步，未命中才异步
static Dictionary<string, string> _cache = new();

async ValueTask<string> GetAsync(string key)
{
    if (_cache.TryGetValue(key, out var v))
        return v;            // 同步返回，不分配 Task 对象（ValueTask 是值类型，栈上分配）

    await Task.Delay(100);   // 真异步
    var result = $"fetched-{key}";
    _cache[key] = result;
    return result;
}

var x = await GetAsync("k1");   // 第一次：异步
var y = await GetAsync("k1");   // 第二次：同步命中缓存
\`\`\`

注意：\`ValueTask\` 不能多次 await，也不能直接 \`Task.WhenAll\`。**高频热路径才考虑用，普通场景 Task 足矣**。

### 八、实战 demo：并发下载多个网页（模拟）

\`\`\`csharp
using System;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

// 模拟异步下载：用 Task.Delay 模拟网络耗时
async Task<string> DownloadAsync(string url, int delayMs)
{
    Console.WriteLine($"  开始下载 {url}");
    await Task.Delay(delayMs);
    Console.WriteLine($"  完成 {url}");
    return $"<html>{url}</html>";
}

// 串行 vs 并发对比
var urls = new (string url, int ms)[]
{
    ("https://a.com", 1000),
    ("https://b.com", 1500),
    ("https://c.com", 800),
};

// 串行：一个个等，总耗时累加
var sw = Stopwatch.StartNew();
foreach (var (url, ms) in urls)
{
    var html = await DownloadAsync(url, ms);
}
Console.WriteLine($"串行耗时：{sw.ElapsedMilliseconds} ms");   // ~3300

// 并发：Task.WhenAll
// 关键：先 Select 拿到所有已启动的 Task（此时任务已在运行），再 WhenAll 等齐
sw.Restart();
var tasks = urls.Select(u => DownloadAsync(u.url, u.ms)).ToArray();
string[] results = await Task.WhenAll(tasks);
Console.WriteLine($"并发耗时：{sw.ElapsedMilliseconds} ms");   // ~1500
Console.WriteLine($"共下载 {results.Length} 个页面");
\`\`\`

并发耗时 ≈ 最慢那个任务（1500ms），而不是三个加起来（3300ms）。**这是 async 最常见的实战收益**。

### 小结

- \`async\` 标记方法，\`await\` 等待 Task，期间释放线程不阻塞。编译器生成状态机实现暂停/恢复。
- 返回类型用 \`Task\` / \`Task<T>\`，**不要用 void**（事件处理器除外）。
- \`Task.Delay\` 替代 \`Thread.Sleep\`，前者不阻塞线程（底层是定时器回调）。
- \`async void\` 异常无法捕获，是常见陷阱，仅事件处理器可用。
- 库代码 \`await\` 后加 \`.ConfigureAwait(false)\`，避免上下文死锁。
- \`ValueTask<T>\` 用于热路径避免 GC 分配，普通场景用 \`Task\` 即可。
- \`Task.WhenAll\` 并发等待多个任务，把串行 IO 变并发，性能立竿见影。
- ⭐ async/await 不创建新线程，只是在等待时释放线程，IO完成后从线程池恢复执行。
- ⭐ async/await 是现代 C# 核心技能，Web、UI、IO 全场景必用。`,
  },

  // ============================================================
  // 第四十章：Task 与并行
  // ============================================================
  {
    id: 'csharp2-ch40',
    group: '第八部分 异步与并发',
    icon: '🚀',
    title: '第四十章 Task 与并行',
    content: `## 第四十章　Task 与并行

\`Task\` 是 .NET 并发的统一抽象：一个「将来会有结果」的单元。无论 IO 异步还是 CPU 并行，都用 Task 表达。这章讲 CPU 并行——把活分到多个线程同时跑。

### 一、Task.Run：把 CPU 活推到线程池 ⭐

\`\`\`csharp
using System;
using System.Threading;
using System.Threading.Tasks;

// Task.Run 与 Thread 的区别：
//   Thread：手动创建的前台线程，开销大（默认1MB栈空间），需要手动管理生命周期
//   Task.Run：把工作排队到**线程池**，由 CLR 管理线程数量（避免线程爆炸），
//             复用线程，开销小，是 CPU 密集工作的首选。
// 注意：Task.Run 适合 CPU 密集计算，IO 密集直接用 async/await 就行，不用 Task.Run 包一层
Task<int> t = Task.Run(() =>
{
    Thread.Sleep(500);     // 模拟耗时计算
    return 42;
});

int result = await t;
Console.WriteLine(result);   // 42
\`\`\`

为什么要 \`Task.Run\`？因为 \`async\` 只解决「等 IO」的释放，**CPU 密集计算还是占线程**。把计算推到线程池，主线程（比如 UI 线程）才能继续响应。

> ⭐ 区分两类工作：
> - **IO 密集**（网络、磁盘、数据库）→ 用 \`async/await\`，不占线程，等待时线程回到线程池。
> - **CPU 密集**（计算、压缩、加密）→ 用 \`Task.Run\` 推到后台线程池线程执行。

### 二、Task.Factory.StartNew

\`Task.Run\` 是简化版，\`Task.Factory.StartNew\` 是完整版，能控制更多选项：

\`\`\`csharp
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

// Task.Run 等价于：
// Task.Factory.StartNew(action, CancellationToken.None,
//     TaskCreationOptions.DenyChildAttach, TaskScheduler.Default)

// 完整版：可以指定选项
var t = Task.Factory.StartNew(() =>
{
    return Enumerable.Range(1, 1000).Sum();
},
    CancellationToken.None,
    TaskCreationOptions.LongRunning,    // 提示调度器：长任务，单独开线程（不进线程池），适合长时间运行的后台服务
    TaskScheduler.Default);

Console.WriteLine(await t);   // 500500
\`\`\`

日常 90% 场景用 \`Task.Run\` 就够了，\`Task.Factory.StartNew\` 只在需要精细控制时用。

### 三、Task.Wait 与 Task.Result

\`\`\`csharp
using System;
using System.Threading;
using System.Threading.Tasks;

var t = Task.Run(() =>
{
    Thread.Sleep(200);
    return 10;
});

// .Wait()：阻塞当前线程等完成（类似 void）
// ⚠️ 阻塞异步代码，UI/ASP.NET 会死锁
t.Wait();
Console.WriteLine("完成");

// .Result：阻塞并取结果
var t2 = Task.Run(() => 99);
Console.WriteLine(t2.Result);   // 99
\`\`\`

> ⚠️ **强烈不推荐**用 \`.Wait()\` 和 \`.Result\`：
> - 阻塞线程，违背异步初衷。
> - UI / ASP.NET 经典场景会死锁（参考上一章 ConfigureAwait）。
> - 异常会被包成 \`AggregateException\`，处理麻烦。
>
> 优先用 \`await\`，除非写控制台 \`Main\` 顶层语句无法 await 时偶尔用。

### 四、ContinueWith：完成回调

\`\`\`csharp
using System;
using System.Threading;
using System.Threading.Tasks;

var t = Task.Run(() =>
{
    Thread.Sleep(200);
    return 42;
});

// 前一个 Task 完成后执行回调
t.ContinueWith(prev =>
{
    Console.WriteLine($"拿到结果：{prev.Result}");
    return prev.Result * 2;
})
.ContinueWith(prev =>
{
    Console.WriteLine($"翻倍：{prev.Result}");
});

t.Wait();   // 等所有完成（演示用）
\`\`\`

\`ContinueWith\` 是老的链式 API，可读性差，且不捕获同步上下文容易出问题。**现代代码用 \`async/await\` 替代**：

\`\`\`csharp
using System;
using System.Threading.Tasks;

// 等价写法，可读性更好，且正确处理同步上下文
async Task ChainAsync()
{
    int r1 = await Task.Run(() => 42);
    Console.WriteLine($"拿到结果：{r1}");
    int r2 = r1 * 2;
    Console.WriteLine($"翻倍：{r2}");
}

await ChainAsync();
\`\`\`

### 五、Task.WhenAll / Task.WhenAny ⭐

\`\`\`csharp
using System;
using System.Threading;
using System.Threading.Tasks;

// 三个独立任务
var t1 = Task.Run(() => { Thread.Sleep(300); return 1; });
var t2 = Task.Run(() => { Thread.Sleep(200); return 2; });
var t3 = Task.Run(() => { Thread.Sleep(100); return 3; });

// WhenAll：全部完成才返回，返回值数组按传入顺序排列
int[] all = await Task.WhenAll(t1, t2, t3);
Console.WriteLine(string.Join(",", all));   // 1,2,3（顺序与传入一致，不是完成顺序）

// WhenAny：任意一个完成就返回，常用于「竞速」模式
Task<int> first = await Task.WhenAny(t1, t2, t3);
Console.WriteLine($"最先完成的是 {first.Result}");   // 3（最短 sleep）
\`\`\`

实战场景：
- \`WhenAll\`：批量并发请求，全部等齐再处理。
- \`WhenAny\`：从多个镜像下载，谁先完成用谁（竞速）；或者给任务加超时。

### 六、Parallel.For / ForEach / Invoke ⭐

专门为 CPU 并行设计，封装了分区、调度、异常聚合：

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

// Parallel.For：并行 for
// ⚠️ 注意：多线程访问共享变量必须加锁或用原子操作，否则数据竞争
long total = 0;
object lockObj = new();
Parallel.For(1, 10001, i =>
{
    // 注意：多线程访问 total 必须加锁
    lock (lockObj) { total += i; }
});
Console.WriteLine($"总和 = {total}");   // 50005000

// Parallel.ForEach：并行遍历集合
var nums = Enumerable.Range(1, 100).ToList();
Parallel.ForEach(nums, n =>
{
    if (n % 10 == 0) Console.WriteLine($"处理 {n}");
});

// Parallel.Invoke：并行执行多个无返回值 Action
Parallel.Invoke(
    () => Console.WriteLine("任务A"),
    () => Console.WriteLine("任务B"),
    () => Console.WriteLine("任务C")
);
\`\`\`

> ⚠️ 上例 \`total += i\` 加锁是低效写法，只是演示同步。真正的并行累加请用 \`Interlocked.Add\`（下一章讲）或 \`Parallel.For\` 的 \`ParallelLoopState\` + 局部变量版本。

\`\`\`csharp
using System;
using System.Threading;
using System.Threading.Tasks;

// 高效版：用 Parallel.For 的线程局部变量
// 原理：每个线程分区内累加自己的 local 值（无竞争），最后一次性合并到 total（减少锁开销）
long total = Parallel.For(0L, 10001, () => 0L,
    (i, loop, local) => local + i,                // 每个分区内用局部变量累加，无锁
    local => Interlocked.Add(ref total, local))   // 分区完成后一次性原子合并
    .Result;

Console.WriteLine($"总和 = {total}");
\`\`\`

### 七、PLINQ 简介

\`AsParallel()\` 让 LINQ 自动并行：

\`\`\`csharp
using System;
using System.Diagnostics;
using System.Linq;

var nums = Enumerable.Range(1, 10_000_000).ToArray();

// 串行 LINQ
var sw = Stopwatch.StartNew();
var sum1 = nums.Where(n => n % 2 == 0).Sum();
Console.WriteLine($"串行：{sw.ElapsedMilliseconds} ms = {sum1}");

// 并行 PLINQ：AsParallel() 自动分区并行，AsOrdered() 保持顺序（但会慢一点）
sw.Restart();
var sum2 = nums.AsParallel().Where(n => n % 2 == 0).Sum();
Console.WriteLine($"并行：{sw.ElapsedMilliseconds} ms = {sum2}");
\`\`\`

适用场景：**数据量大 + 计算重**。小数据用 PLINQ 反而慢（线程调度开销 > 计算收益）。

### 八、实战 demo：并行计算质数

\`\`\`csharp
using System;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

// 判断质数（纯函数，无副作用，最适合并行）
bool IsPrime(int n)
{
    if (n < 2) return false;
    if (n == 2) return true;
    if (n % 2 == 0) return false;
    for (int i = 3; i * i <= n; i += 2)
        if (n % i == 0) return false;
    return true;
}

// 在 [2, max] 范围找所有质数
int max = 5_000_000;

// 串行
var sw = Stopwatch.StartNew();
var primes1 = Enumerable.Range(2, max - 1).Where(IsPrime).Count();
Console.WriteLine($"串行：{sw.ElapsedMilliseconds} ms, 共 {primes1} 个");

// PLINQ 并行
sw.Restart();
var primes2 = Enumerable.Range(2, max - 1).AsParallel().Where(IsPrime).Count();
Console.WriteLine($"并行：{sw.ElapsedMilliseconds} ms, 共 {primes2} 个");

// Parallel.For 版本（用 Interlocked 累加，比 lock 高效）
long count = 0;
sw.Restart();
Parallel.For(2, max + 1, n =>
{
    if (IsPrime(n)) Interlocked.Increment(ref count);
});
Console.WriteLine($"Parallel：{sw.ElapsedMilliseconds} ms, 共 {count} 个");
\`\`\`

在多核机器上并行版通常快 2-4 倍。注意：\`IsPrime\` 是纯函数（无副作用），最适合并行。

### 小结

- \`Task.Run\` 把 CPU 密集任务推到线程池，避免阻塞调用线程；Task.Run 复用线程池线程，比手动 new Thread 高效得多。
- \`Task.Factory.StartNew\` 是完整版，需要精细控制（如 LongRunning）时才用。
- 避免 \`.Wait()\` / \`.Result\`，优先 \`await\`，否则会死锁。
- \`Task.WhenAll\` 等全部完成（按传入顺序返回结果），\`Task.WhenAny\` 等任意一个完成（竞速/超时）。
- \`Parallel.For/ForEach/Invoke\` 专为 CPU 并行，封装分区与调度，比自己写 Task 高效。
- \`PLINQ\` (\`AsParallel()\`) 让 LINQ 自动并行，适合大数据 + 重计算。
- 并行访问共享变量必须同步（\`lock\` 或 \`Interlocked\`，下一章详解）。
- ⭐ \`Task.WhenAll\` 是并发编程最常用 API，必须熟练。
- ⭐ IO 密集用 async/await，CPU 密集用 Task.Run/Parallel/PLINQ。`,
  },

  // ============================================================
  // 第四十一章：锁与线程同步
  // ============================================================
  {
    id: 'csharp2-ch41',
    group: '第八部分 异步与并发',
    icon: '🔒',
    title: '第四十一章 锁与线程同步',
    content: `## 第四十一章　锁与线程同步

多线程最大的坑就是「数据竞争」——多个线程同时改同一个变量，结果不可预测。这一章讲怎么让多线程安全地共享数据。

### 一、数据竞争：先看一个翻车现场

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Threading;

int counter = 0;

// 10 个线程各加 1 万次，期望 10 万
var threads = new List<Thread>();
for (int i = 0; i < 10; i++)
{
    var t = new Thread(() =>
    {
        for (int j = 0; j < 10000; j++)
            counter++;   // ⚠️ 不是原子操作！实际是三步：读 counter → 加 1 → 写回 counter
                         // 两个线程交错时，写覆盖会丢更新
    });
    threads.Add(t);
    t.Start();
}
foreach (var t in threads) t.Join();

Console.WriteLine(counter);   // 期望 100000，实际可能是 47832 之类
\`\`\`

为什么？\`counter++\` 实际是三步：读 → 加 1 → 写。两个线程交错执行时，写覆盖会丢更新。

### 二、lock 关键字 ⭐

\`lock\` 是最常用的互斥锁：同一时刻只允许一个线程进入临界区。

\`\`\`csharp
using System;
using System.Threading;

int counter = 0;
// 为什么锁 private readonly 对象？
//   1. private：锁对象不暴露给外部，外部代码无法意外 lock 它造成死锁
//   2. readonly：防止锁对象在锁期间被替换，导致锁失效
//   3. object 类型：引用类型，lock 值类型会装箱每次生成新对象，锁完全失效
//   4. 专门的锁对象：不要用 this、typeof(T)、字符串等公开/共享对象
object lockObj = new();

for (int i = 0; i < 10; i++)
{
    new Thread(() =>
    {
        for (int j = 0; j < 10000; j++)
            lock (lockObj)      // 进入临界区：其他线程执行到这里会阻塞等待
            {
                counter++;
            }                    // 离开临界区：自动释放锁，下一个等待线程进入
    }).Start();
}

Thread.Sleep(500);   // 等线程跑完（演示用）
Console.WriteLine(counter);   // 100000 ✅
\`\`\`

要点：
- \`lock\` 参数必须是**引用类型对象**（\`object\`），不能是值类型（会装箱成不同对象，锁失效）。
- 推荐用专门的 \`private readonly object lockObj = new();\` 字段，不要 lock 公开对象。
- \`lock\` 等价于 \`Monitor.Enter\` + \`try/finally\` + \`Monitor.Exit\`，保证异常时也能释放。

### 三、Monitor 类

\`lock\` 是 \`Monitor\` 的语法糖。\`Monitor\` 提供更多控制：

\`\`\`csharp
using System;
using System.Threading;

object lockObj = new();

// 等价于 lock(lockObj) { ... }
Monitor.Enter(lockObj);
try
{
    Console.WriteLine("临界区");
}
finally
{
    Monitor.Exit(lockObj);   // 保证即使异常也释放锁
}

// TryEnter：带超时，避免死锁卡死
if (Monitor.TryEnter(lockObj, TimeSpan.FromSeconds(2)))
{
    try
    {
        Console.WriteLine("拿到锁了");
    }
    finally
    {
        Monitor.Exit(lockObj);
    }
}
else
{
    Console.WriteLine("2 秒还没拿到，放弃");
}

// Wait / Pulse：经典生产消费模型
// Wait 释放锁并等待（进入等待队列），Pulse 唤醒一个等待者重新竞争锁
\`\`\`

日常 95% 用 \`lock\` 就够，\`Monitor.TryEnter\` 用于需要超时的场景。

### 四、Interlocked 原子操作 ⭐

\`Interlocked\` 提供 CPU 级别的原子操作，比 \`lock\` 轻量得多（无锁，用户态实现，没有内核切换开销）。适合简单的数值操作：

\`\`\`csharp
using System;
using System.Threading;

long counter = 0;

// ✅ 原子自增：CPU 级 lock 前缀指令，保证读-改-写单步完成
Interlocked.Increment(ref counter);
Interlocked.Decrement(ref counter);

// ✅ 原子加
Interlocked.Add(ref counter, 100);

// ✅ 原子赋值并返回旧值
long old = Interlocked.Exchange(ref counter, 0);
Console.WriteLine($"旧值 {old}");

// ✅ CAS（Compare-And-Swap）：原子条件更新——无锁编程的核心
// 如果 counter == current，则设为 42；返回操作前的值
long current = Interlocked.Read(ref counter);
Interlocked.CompareExchange(ref counter, 42, current);
// CAS 是实现无锁数据结构的基础：重试循环 + CAS
\`\`\`

> ⭐ 简单计数器用 \`Interlocked\` 比 \`lock\` 快几倍，因为没有真正的「等待」和线程上下文切换，直接在 CPU 指令层面保证原子性。

\`\`\`csharp
using System;
using System.Threading;
using System.Threading.Tasks;

// Interlocked 版线程安全计数器
long counter = 0;
Parallel.For(0, 100000, _ => Interlocked.Increment(ref counter));
Console.WriteLine(counter);   // 100000 ✅
\`\`\`

### 五、Mutex 互斥量

\`Mutex\` 跨进程，能用来做「单实例应用」：

\`\`\`csharp
using System;
using System.Threading;

// 第一个参数 true 表示「初始拥有」
// "Global\\" 前缀表示全局（多用户会话可见），不加是当前会话
using var mutex = new Mutex(false, "Global\\\\MyApp.Singleton");

// 尝试获取，5 秒超时
if (mutex.WaitOne(5000))
{
    try
    {
        Console.WriteLine("拿到全局 Mutex，开始干活");
        // ... 应用主逻辑
        Console.ReadLine();   // 模拟运行
    }
    finally
    {
        mutex.ReleaseMutex();
    }
}
else
{
    Console.WriteLine("另一个实例已经在跑了，本进程退出");
}
\`\`\`

\`Mutex\` 比 \`lock\` 慢 50 倍以上（涉及内核对象系统调用），**仅在需要跨进程时才用**。

### 六、SemaphoreSlim 信号量 ⭐

\`SemaphoreSlim\` 限制同时访问的线程数——比如限流：

\`\`\`csharp
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

// 最多 3 个线程同时进入（限流）
using var sem = new SemaphoreSlim(3);

async Task FetchAsync(int id)
{
    await sem.WaitAsync();      // 异步等待信号：WaitAsync 是 async 友好的，不阻塞线程
    try
    {
        Console.WriteLine($"  [{id}] 开始");
        await Task.Delay(500);  // 模拟 IO
        Console.WriteLine($"  [{id}] 完成");
    }
    finally
    {
        sem.Release();          // 必须释放！否则其他任务永远进不来
    }
}

// 启动 10 个任务，但同一时刻只有 3 个在跑
var tasks = Enumerable.Range(1, 10).Select(FetchAsync).ToArray();
await Task.WhenAll(tasks);
\`\`\`

> ⭐ 实战场景：限制并发 HTTP 请求数量，避免打爆对方服务器或本地连接池。
>
> \`SemaphoreSlim\` 是\`async\` 友好的（有 \`WaitAsync\`），推荐替代老的 \`Semaphore\`（老版只有同步 Wait）。

### 七、ManualResetEvent / AutoResetEvent

事件信号——一个线程通知，其他线程等待。

\`\`\`csharp
using System;
using System.Threading;
using System.Threading.Tasks;

// ManualResetEvent：手动复位。Set 后所有等待者都放行，直到 Reset
using var mre = new ManualResetEvent(initialState: false);

// 启动 3 个等待者
for (int i = 1; i <= 3; i++)
{
    var id = i;
    Task.Run(() =>
    {
        Console.WriteLine($"  等待者 {id} 阻塞中");
        mre.WaitOne();                  // 阻塞直到 Set
        Console.WriteLine($"  等待者 {id} 放行");
    });
}

Thread.Sleep(200);
Console.WriteLine("发出信号");
mre.Set();                               // 放行所有等待者
Thread.Sleep(200);
mre.Reset();                             // 关闭信号（手动）

// AutoResetEvent：自动复位。Set 后只放行一个等待者，然后自动 Reset
using var are = new AutoResetEvent(false);
// 适合「一对一」通知：一个 Set 唤醒一个等待者
\`\`\`

区别：
- \`ManualResetEvent\`：大门，\`Set\` 打开后所有人都能进，\`Reset\` 关门。
- \`AutoResetEvent\`：旋转门，\`Set\` 一次只让一个人进，自动关门。

### 八、lock this 陷阱 ⭐

\`\`\`csharp
using System;
using System.Threading;

// ❌ 反例：lock(this) 公开了锁对象，外部代码也能 lock 你的实例造成死锁
class BadCounter
{
    public void Increment()
    {
        lock (this)   // 危险！外部能 lock 这个实例，导致内部死锁
        {
            _count++;
        }
    }
    private int _count;
}

// ❌ 反例：lock(typeof(T)）锁定类型对象，类型对象是全局共享的（跨 AppDomain），极易死锁
// ❌ 反例：lock("字符串") 字符串被 intern（拘留池），相同字符串字面量是同一个对象，全局共享

// ✅ 正例：私有只读字段——锁对象完全在类内部控制，外部无法访问
class GoodCounter
{
    private readonly object _lock = new();   // 私有+只读+专门对象，三要素
    public void Increment()
    {
        lock (_lock) { _count++; }
    }
    private int _count;
}

// ---------- 可执行代码（顶级语句中类型声明必须放在可执行代码之后，否则 CS8803） ----------

// 外部代码演示 lock(this) 的危险
var c = new BadCounter();
// 意外地在外部 lock 了这个实例——内部 Increment() 也 lock 同一个对象，导致死锁
lock (c)
{
    // c.Increment();   // 取消注释会死锁：主线程持有锁，Increment 也等这个锁
    Console.WriteLine("演示：lock(this) 会被外部意外锁住，造成死锁");
}

Console.WriteLine("演示：lock(typeof(T)) 和 lock(\"字符串\") 也危险，因为它们是全局共享的");
\`\`\`

> ⭐ 铁律：**lock 对象必须是 \`private readonly object\`，绝不暴露给外部**。

### 九、实战 demo：线程安全计数器 + 生产消费

\`\`\`csharp
using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;

// 1) 线程安全计数器（Interlocked 版）
class SafeCounter
{
    private long _value;
    public long Value => Interlocked.Read(ref _value);
    public void Increment() => Interlocked.Increment(ref _value);
    public void Add(long n) => Interlocked.Add(ref _value, n);
}

// ---------- 可执行代码（类型声明必须放在可执行代码之后） ----------

var counter = new SafeCounter();
Parallel.For(0, 100000, _ => counter.Increment());
Console.WriteLine($"计数器：{counter.Value}");   // 100000

// 2) 生产者-消费者（BlockingCollection 简化版）
//    生产者往里塞，消费者拿出来，内部自动用 lock + Monitor.Wait/Pulse 同步
//    比手写 Monitor 简单得多，不会错
using var queue = new BlockingCollection<int>(boundedCapacity: 10);   // boundedCapacity=10 限制队列长度，防止生产者生产太快把内存撑爆

// 生产者
var producer = Task.Run(() =>
{
    for (int i = 1; i <= 20; i++)
    {
        queue.Add(i);                       // 满了就阻塞等（消费者拿走后才能继续加）
        Console.WriteLine($"生产 {i}");
    }
    queue.CompleteAdding();                 // 通知：不会再加了，消费者拿到完就退出
});

// 消费者
var consumer = Task.Run(() =>
{
    foreach (var item in queue.GetConsumingEnumerable())   // 一直拿，直到 CompleteAdding 且拿完为止
    {
        Console.WriteLine($"  消费 {item}");
        Thread.Sleep(50);   // 模拟消费速度比生产慢
    }
});

await Task.WhenAll(producer, consumer);
Console.WriteLine("全部处理完成");
\`\`\`

\`BlockingCollection\` 是 .NET 内置的生产消费队列，自动处理锁与信号，比手写 \`Monitor.Wait/Pulse\` 简单得多。

### 小结

- 多线程改共享数据必须同步，否则数据竞争（race condition）。
- \`lock\` 是最常用互斥锁，锁对象必须是 \`private readonly object\`，绝不能是 this/typeof/字符串。
- \`lock\` 为什么锁 private readonly：private 防外部访问，readonly 防替换，专门对象防意外共享。
- \`Monitor\` 是 \`lock\` 的完整版，\`TryEnter\` 支持超时避免死锁。
- \`Interlocked\` 原子操作适合简单数值，CPU 指令级原子，比 \`lock\` 快得多（无内核切换）。CAS 是无锁编程基础。
- \`Mutex\` 跨进程内核对象，慢但能做单实例应用。
- \`SemaphoreSlim\` 限流神器，\`WaitAsync()\` 是 async 友好的，可用于异步限流。
- \`ManualResetEvent\` 是大门（广播），\`AutoResetEvent\` 是旋转门（一对一）。
- ⭐ 铁律：永远不要 \`lock(this)\` / \`lock(typeof(...))\` / \`lock("字符串")\`。
- ⭐ \`Interlocked\` + \`SemaphoreSlim\` 是日常开发最常用的两个同步工具。
- ⭐ \`BlockingCollection\` 封装了生产消费模式，但现代更推荐 Channel（下一章）。`,
  },

  // ============================================================
  // 第四十二章：CancellationToken 与并发集合
  // ============================================================
  {
    id: 'csharp2-ch42',
    group: '第八部分 异步与并发',
    icon: '🛡️',
    title: '第四十二章 CancellationToken 与并发集合',
    content: `## 第四十二章　CancellationToken 与并发集合

这一章讲两件事：**怎么取消一个正在跑的任务**，**怎么让多个线程安全地操作集合**。这两块是写健壮并发程序的关键拼图。

### 一、为什么需要 CancellationToken

\`\`\`csharp
using System;
using System.Threading.Tasks;

// 没有取消机制：任务跑起来就停不下来
async Task RunForeverAsync()
{
    while (true)
    {
        Console.WriteLine("工作中...");
        await Task.Delay(1000);
    }
}

// 用户点了取消按钮、HTTP 请求断开、超时了，怎么办？
// 老方案 Thread.Abort() 是粗暴终止（线程正在执行的代码被强行中断，资源可能泄漏），.NET Core 已弃用
// C# 用**协作式取消**：调用方发信号，被调用方主动检查并优雅退出，保证资源清理
\`\`\`

\`CancellationToken\` 是 .NET 的协作式取消：**调用方发信号，被调用方主动检查并优雅退出**。

### 二、CancellationTokenSource ⭐

\`\`\`csharp
using System;
using System.Threading;
using System.Threading.Tasks;

// CancellationToken 传递模式：
//   1. 调用方创建 CancellationTokenSource (CTS)——这是「发令枪」
//   2. 从 CTS 拿到 CancellationToken (CT)——这是「信号接收器」
//   3. 把 CT 传给所有需要支持取消的异步方法
//   4. 需要取消时调用 cts.Cancel() 发信号
//   5. 被调用方检查 ct.IsCancellationRequested 或 ct.ThrowIfCancellationRequested() 响应
using var cts = new CancellationTokenSource();

// 拿到 Token 传给任务
var task = Task.Run(async () =>
{
    for (int i = 0; i < 100; i++)
    {
        cts.Token.ThrowIfCancellationRequested();   // 检查：如果已取消，抛 OperationCanceledException 优雅退出
        Console.WriteLine($"步骤 {i}");
        await Task.Delay(100, cts.Token);           // Delay 本身也支持 CT：取消时 Delay 立即完成（抛异常）
    }
}, cts.Token);   // Task.Run 也接收 CT：任务排队时如果已取消就不启动了

// 2 秒后取消
await Task.Delay(2000);
cts.Cancel();   // 发取消信号——这是协作式的，任务运行到检查点才会响应

try
{
    await task;
}
catch (OperationCanceledException)
{
    Console.WriteLine("任务被取消");   // 这是正常的取消，不是错误
}
\`\`\`

要点：
- \`CancellationTokenSource\` 是「发信号」的一方，\`CancellationToken\` 是「听信号」的一方。
- \`Token.ThrowIfCancellationRequested()\` 检查并抛 \`OperationCanceledException\`。
- 大多数异步 API（\`Task.Delay\`、\`HttpClient.GetAsync\` 等）都接受 \`CancellationToken\`。
- 取消是协作式的：不是强制终止，任务需要主动检查。

### 三、传递 CancellationToken

\`\`\`csharp
using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

// 自定义异步方法接收 token
// ⭐ 标准模式：CancellationToken 作为最后一个参数，默认值可以给 CancellationToken.None
async Task<string> FetchAsync(string url, CancellationToken ct = default)
{
    ct.ThrowIfCancellationRequested();   // 入站先检查一次
    using var http = new HttpClient();

    // 传给底层 API，让它能中途取消（HttpClient 会在取消时中止 TCP 连接）
    return await http.GetStringAsync(url, ct);
}

// 调用方
using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));   // 5 秒超时自动取消
try
{
    var html = await FetchAsync("https://example.com", cts.Token);
    Console.WriteLine(html.Length);
}
catch (OperationCanceledException)
{
    Console.WriteLine("超时或被取消");
}
\`\`\`

> ⭐ 铁律：**所有公共异步方法都应该接收 \`CancellationToken\` 参数**，并在最后位置。让调用方有机会取消。

### 四、注册取消回调

\`\`\`csharp
using System;
using System.Threading;

using var cts = new CancellationTokenSource();

// 取消时执行的回调（清理资源、记日志、中止操作等）
// Register 返回 IDisposable，Dispose 可以取消注册
cts.Token.Register(() => Console.WriteLine("回调：开始清理"));
var reg2 = cts.Token.Register(() => Console.WriteLine("回调：释放连接"));
// reg2.Dispose();   // 不需要这个回调了就注销

Console.WriteLine("准备取消...");
cts.Cancel();   // 触发回调（同步执行，按注册相反顺序调用）
// 输出：
// 回调：释放连接
// 回调：开始清理
\`\`\`

### 五、超时取消 ⭐

\`CancellationTokenSource\` 内置超时支持：

\`\`\`csharp
using System;
using System.Threading;
using System.Threading.Tasks;

// 方式 1：构造时指定超时
using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(3));

// 方式 2：CancelAfter 动态设置（先创建 CTS，之后决定超时）
using var cts2 = new CancellationTokenSource();
cts2.CancelAfter(TimeSpan.FromSeconds(3));

// 实战：给一个可能很慢的任务加上超时（WhenAny 竞速模式）
async Task<string> WithTimeoutAsync(Task<string> task, TimeSpan timeout)
{
    using var cts = new CancellationTokenSource(timeout);
    // 把任务和延迟任务做 WhenAny 竞速：谁先完成返回谁
    var completed = await Task.WhenAny(task, Task.Delay(timeout, cts.Token));
    if (completed == task)
    {
        cts.Cancel();   // 任务先完成了，取消 Delay 定时器
        return await task;
    }
    throw new TimeoutException($"超过 {timeout.TotalSeconds} 秒");
}
\`\`\`

### 六、ConcurrentDictionary ⭐

线程安全的字典，多线程读写不用加锁（内部使用细粒度锁+无锁技术）：

\`\`\`csharp
using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;

var dict = new ConcurrentDictionary<string, int>();

// 并发写入
Parallel.For(0, 1000, i =>
{
    // AddOrUpdate：键不存在就添加（用工厂函数），存在就更新（用更新函数）
    // 原子操作：不会出现两个线程同时 Add 导致重复的情况
    dict.AddOrUpdate("count", 1, (_, old) => old + 1);
});

Console.WriteLine(dict["count"]);   // 1000

// GetOrAdd：不存在就添加（原子），存在就直接返回现有值
var v = dict.GetOrAdd("name", _ => "张三");

// TryUpdate：条件更新——只有当当前值等于 comparisonValue 时才更新
dict.TryUpdate("name", "李四", "张三");   // 只有当前值是"张三"才更新为"李四"
\`\`\`

注意：\`ConcurrentDictionary\` 的**单个操作是原子的**，但多个操作组合不是。比如：

\`\`\`csharp
using System.Collections.Concurrent;

var dict = new ConcurrentDictionary<string, int>();

// ❌ 这两步之间可能被其他线程插入（非原子）：ContainsKey 和 [] 是两个独立操作
if (!dict.ContainsKey("k"))
    dict["k"] = 1;   // 两个线程可能同时通过 ContainsKey 检查，导致一个覆盖另一个

// ✅ 用 AddOrUpdate / GetOrAdd 保证原子
dict.GetOrAdd("k", _ => 1);   // 原子操作，内部保证只添加一次
\`\`\`

### 七、ConcurrentQueue / ConcurrentStack

无锁的线程安全队列和栈：

\`\`\`csharp
using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;

// ConcurrentQueue：FIFO 队列（先进先出）
var queue = new ConcurrentQueue<int>();

// 多线程入队
Parallel.For(0, 1000, i => queue.Enqueue(i));

// TryDequeue：出队（成功返回 true，空队列返回 false）
while (queue.TryDequeue(out var item))
{
    // 处理 item
}
Console.WriteLine($"剩余 {queue.Count}");

// ConcurrentStack：LIFO 栈（后进先出）
var stack = new ConcurrentStack<int>();
Parallel.For(0, 1000, i => stack.Push(i));
while (stack.TryPop(out var item))
{
    // 处理 item
}
\`\`\`

### 八、ConcurrentBag

无序的线程安全集合，**适合同一线程既生产又消费**的场景：

\`\`\`csharp
using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;

// ConcurrentBag：无序集合，内部用 ThreadLocal 存储
// 特点：同线程 Add/TryTake 极快（本地操作无线程竞争），跨线程操作较慢
var bag = new ConcurrentBag<string>();

Parallel.For(0, 100, i =>
{
    bag.Add($"item-{i}");
    // 同一线程内取数据非常快（本地存储优先）
    if (bag.TryTake(out var item))
    {
        // 处理
    }
});

Console.WriteLine($"剩余 {bag.Count}");
\`\`\`

\`ConcurrentBag\` 不保证顺序，但同线程操作极快。跨线程操作较慢，慎用。

### 九、Channel<T>（C# 7+）⭐

\`System.Threading.Channels\` 是新一代生产消费者模型，比 \`BlockingCollection\` 更高效、更 \`async\` 友好：

\`\`\`csharp
using System;
using System.Threading.Channels;
using System.Threading.Tasks;

// Channel<T> 用法：
//   1. Channel.CreateBounded<T>(capacity)：有界通道，满了会阻塞/等待/丢弃（取决于配置）
//   2. Channel.CreateUnbounded<T>()：无界通道（不限制容量，生产太快会 OOM，谨慎用）
//   关键优势：
//   - 全 async API：WriteAsync/ReadAllAsync 都不阻塞线程（BlockingCollection 是阻塞的）
//   - 支持背压（bounded capacity）：生产者满了会异步等待消费者
//   - 高性能：低锁/无锁设计，是 ASP.NET Core 内部的核心基础设施
var channel = Channel.CreateBounded<string>(
    new BoundedChannelOptions(100)
    {
        FullMode = BoundedChannelFullMode.Wait   // 满了时 Wait：异步等待；还可以选 DropOldest/DropNewest/DropWrite
    });

// 生产者
async Task ProduceAsync()
{
    for (int i = 0; i < 1000; i++)
    {
        // WaitToWriteAsync/WriteAsync：满了就异步等，不阻塞线程
        await channel.Writer.WriteAsync($"msg-{i}");
    }
    channel.Writer.Complete();   // 通知写完：告诉消费者没有更多数据了
}

// 消费者
async Task ConsumeAsync()
{
    // ReadAllAsync：返回 IAsyncEnumerable，可以 await foreach 异步迭代
    // 直到 Writer.Complete() 且数据读完才结束
    await foreach (var item in channel.Reader.ReadAllAsync())
    {
        Console.WriteLine($"收到 {item}");
    }
    Console.WriteLine("Channel 关闭，消费完成");
}

await Task.WhenAll(ProduceAsync(), ConsumeAsync());
\`\`\`

> ⭐ \`Channel<T>\` 是 ASP.NET Core / SignalR / Actor 模型的底层。生产消费场景优先用它，比 \`BlockingCollection\` 性能更好且不阻塞线程。

### 十、实战 demo：可取消的并发日志收集

\`\`\`csharp
using System;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;

// 用 Channel 做一个并发日志收集器，支持取消
// 典型架构：多生产者（多个线程/请求写日志）→ 单消费者（后台线程批量化写文件/发网络）
// 这是高并发系统的标准日志/消息处理模式
class ConcurrentLogger
{
    private readonly Channel<string> _channel;
    private readonly CancellationTokenSource _cts;

    public ConcurrentLogger(int capacity = 1000)
    {
        _channel = Channel.CreateBounded<string>(capacity);
        _cts = new CancellationTokenSource();
    }

    // 多线程写入日志（生产者 API）
    public async Task LogAsync(string msg)
    {
        // 取消时直接丢弃
        if (_cts.IsCancellationRequested) return;
        await _channel.Writer.WriteAsync($"[{DateTime.Now:HH:mm:ss}] {msg}", _cts.Token);
    }

    // 后台消费日志（消费者 API）
    public async Task ProcessAsync(Action<string> handler)
    {
        // await foreach + ReadAllAsync：异步迭代直到 Channel 关闭或取消
        await foreach (var line in _channel.Reader.ReadAllAsync(_cts.Token))
        {
            handler(line);   // 实际项目中这里可以批处理（攒 N 条再一次写文件）
        }
    }

    // 停止：通知写完 + 取消
    public void Stop()
    {
        _channel.Writer.TryComplete();   // 告诉消费者：不会再有新数据了
        _cts.Cancel();                    // 取消正在等待的操作
    }
}

// ---------- 可执行代码（类型声明必须放在可执行代码之后） ----------

// 使用
var logger = new ConcurrentLogger();

// 启动消费者（后台处理）
var consumer = logger.ProcessAsync(line =>
{
    Console.WriteLine($"写入文件: {line}");
});

// 多线程并发写日志（10 个生产者，每个写 5 条）
await Task.WhenAll(Enumerable.Range(1, 10).Select(async i =>
{
    for (int j = 0; j < 5; j++)
    {
        await logger.LogAsync($"线程 {i} 第 {j} 条");
        await Task.Delay(50);
    }
}));

// 停止并等待消费者结束
logger.Stop();
try { await consumer; } catch (OperationCanceledException) { }   // 取消抛异常是预期行为
Console.WriteLine("日志系统停止");
\`\`\`

这套模型可以扩展成：多生产者写日志 → 单消费者批量化写入磁盘/网络，是高并发系统常见模式。

### 小结

- \`CancellationTokenSource\` 发信号（CTS），\`CancellationToken\` 听信号（CT），协作式取消。
- CancellationToken 传递模式：CTS 由调用方创建，CT 作为参数传给所有异步方法（最后一个参数）。
- 异步方法应接收 \`CancellationToken\`，调用方有权取消；\`ThrowIfCancellationRequested()\` 检查并抛 \`OperationCanceledException\`。
- \`Register\` 注册取消回调，做清理工作。
- \`CancelAfter\` / 构造时指定超时 = 自动超时取消；WhenAny 可实现任意任务超时。
- \`ConcurrentDictionary\` / \`Queue\` / \`Stack\` / \`Bag\` 是线程安全集合：单操作原子，多操作组合不原子（用 GetOrAdd/AddOrUpdate 保证复合原子）。
- \`Channel<T>\` 是新一代 async 友好的生产消费模型，背压支持、不阻塞线程，性能优于 \`BlockingCollection\`，是 ASP.NET Core 核心基础设施。
- Channel 用法：CreateBounded→WriteAsync→ReadAllAsync await foreach→Writer.Complete()
- ⭐ \`CancellationToken\` + \`Channel<T>\` 是现代 C# 并发编程的两块基石，必须熟练掌握。
- ⭐ 所有异步方法都应该加 CancellationToken 参数，这是礼貌，也是健壮性的基本要求。`,
  },
];

export { chapters };
