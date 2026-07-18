// =============================================================
// C# 从入门到精通大全 - 第八批章节（第八部分 异步与并发，共 4 章）
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
// 异步：线程不等 IO，去做别的，等 IO 完了再回来
async Task<string> DownloadAsync(string url)
{
    await Task.Delay(2000);   // 线程释放，不阻塞
    return $"<html>{url}</html>";
}

var html = await DownloadAsync("https://example.com");
Console.WriteLine(html);
\`\`\`

> ⭐ 关键认知：\`Thread.Sleep(2000)\` 是「占着线程睡 2 秒」，\`await Task.Delay(2000)\` 是「线程先走，2 秒后用回调通知」。两者天差地别。

### 二、async/await 语法 ⭐

最小可用例：

\`\`\`csharp
// async 关键字标记方法为异步方法
// Task 表示「这个方法异步执行，没返回值」
async Task SayHiAsync()
{
    Console.WriteLine("开始");
    await Task.Delay(1000);    // 等待 1 秒
    Console.WriteLine("结束");
}

// 调用方也必须 await
await SayHiAsync();
\`\`\`

规则：
- \`async\` 修饰方法，方法内才能用 \`await\`。
- \`await\` 一个 \`Task\` 表示「等它完成，期间释放线程」。
- 异步方法命名约定加 \`Async\` 后缀。
- 调用 async 方法必须 await（或显式 fire-and-forget，但谨慎）。

### 三、异步方法的返回类型

\`\`\`csharp
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
async void OnClick(object sender, EventArgs e)
{
    await Task.Delay(100);
    Console.WriteLine("点了");
}
\`\`\`

> ⭐ 面试高频：异步方法返回 \`Task\` 或 \`Task<T>\`，**不要返回 void**（事件处理器除外）。返回 void 的异步方法无法 await、异常无法捕获。

### 四、同步 vs 异步对比

\`\`\`csharp
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
async Task<string> AsyncFetch(int id)
{
    await Task.Delay(id * 1000);
    return $"data-{id}";
}

sw.Restart();
var ta = AsyncFetch(1);
var tb = AsyncFetch(2);
var tc = AsyncFetch(1);
await Task.WhenAll(ta, tb, tc);   // 并发等待
Console.WriteLine($"异步耗时 {sw.ElapsedMilliseconds} ms");   // ~2000
\`\`\`

**并发是异步最大的红利**：3 个 IO 同时跑，耗时取决于最慢的那个。

### 五、async void 陷阱 ⭐

\`\`\`csharp
// ❌ 反例：async void 抛异常没人接，进程崩溃
async void BadAsync()
{
    await Task.Delay(100);
    throw new InvalidOperationException("炸了");
}

BadAsync();
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
// 库代码里常见的写法
async Task<string> FetchAsync()
{
    await Task.Delay(100).ConfigureAwait(false);
    return "done";
}
\`\`\`

含义：\`await\` 完成后**不需要回到原来的同步上下文**（比如 UI 线程）。

为什么要 \`.ConfigureAwait(false)\`？
- **库代码**必须加：避免调用方的 UI 上下文被强制串行化，提升并发性能，防止死锁。
- **应用程序代码**（WinForms/WPF 顶层）可以不加，因为本来就要回 UI 线程更新界面。
- **ASP.NET Core / 控制台**：没有同步上下文，加不加效果一样，但加上更明确。

> 经典死锁场景：UI 线程调用 \`Task.Wait()\` 等 async 方法，而 async 方法又要回到 UI 线程，于是双方互等。\`ConfigureAwait(false)\` 是解药之一。

### 七、ValueTask 简介

\`Task\` 是引用类型，每次 await 都要分配对象。如果方法经常同步完成（比如缓存命中），可以用 \`ValueTask<T>\` 避免分配：

\`\`\`csharp
// 缓存场景：命中走同步，未命中才异步
static Dictionary<string, string> _cache = new();

async ValueTask<string> GetAsync(string key)
{
    if (_cache.TryGetValue(key, out var v))
        return v;            // 同步返回，不分配 Task 对象

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

// 串行
var sw = Stopwatch.StartNew();
foreach (var (url, ms) in urls)
{
    var html = await DownloadAsync(url, ms);
}
Console.WriteLine($"串行耗时：{sw.ElapsedMilliseconds} ms");   // ~3300

// 并发：Task.WhenAll
sw.Restart();
var tasks = urls.Select(u => DownloadAsync(u.url, u.ms)).ToArray();
string[] results = await Task.WhenAll(tasks);
Console.WriteLine($"并发耗时：{sw.ElapsedMilliseconds} ms");   // ~1500
Console.WriteLine($"共下载 {results.Length} 个页面");
\`\`\`

并发耗时 ≈ 最慢那个任务（1500ms），而不是三个加起来（3300ms）。**这是 async 最常见的实战收益**。

### 小结

- \`async\` 标记方法，\`await\` 等待 Task，期间释放线程不阻塞。
- 返回类型用 \`Task\` / \`Task<T>\`，**不要用 void**（事件处理器除外）。
- \`Task.Delay\` 替代 \`Thread.Sleep\`，前者不阻塞线程。
- \`async void\` 异常无法捕获，是常见陷阱。
- 库代码 \`await\` 后加 \`.ConfigureAwait(false)\`，避免上下文死锁。
- \`ValueTask<T>\` 用于热路径避免分配，普通场景用 \`Task\` 即可。
- \`Task.WhenAll\` 并发等待多个任务，把串行 IO 变并发，性能立竿见影。
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
// 在线程池上跑一个 CPU 密集任务
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
> - **IO 密集**（网络、磁盘、数据库）→ 用 \`async/await\`，不占线程。
> - **CPU 密集**（计算、压缩、加密）→ 用 \`Task.Run\` 推到后台线程。

### 二、Task.Factory.StartNew

\`Task.Run\` 是简化版，\`Task.Factory.StartNew\` 是完整版，能控制更多选项：

\`\`\`csharp
// Task.Run 等价于：
// Task.Factory.StartNew(action, CancellationToken.None,
//     TaskCreationOptions.DenyChildAttach, TaskScheduler.Default)

// 完整版：可以指定选项
var t = Task.Factory.StartNew(() =>
{
    return Enumerable.Range(1, 1000).Sum();
},
    CancellationToken.None,
    TaskCreationOptions.LongRunning,    // 提示调度器：长任务，单独开线程
    TaskScheduler.Default);

Console.WriteLine(await t);   // 500500
\`\`\`

日常 90% 场景用 \`Task.Run\` 就够了，\`Task.Factory.StartNew\` 只在需要精细控制时用。

### 三、Task.Wait 与 Task.Result

\`\`\`csharp
var t = Task.Run(() =>
{
    Thread.Sleep(200);
    return 10;
});

// .Wait()：阻塞当前线程等完成（类似 void）
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

\`ContinueWith\` 是老的链式 API，可读性差。**现代代码用 \`async/await\` 替代**：

\`\`\`csharp
// 等价写法，可读性更好
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
// 三个独立任务
var t1 = Task.Run(() => { Thread.Sleep(300); return 1; });
var t2 = Task.Run(() => { Thread.Sleep(200); return 2; });
var t3 = Task.Run(() => { Thread.Sleep(100); return 3; });

// WhenAll：全部完成才返回
int[] all = await Task.WhenAll(t1, t2, t3);
Console.WriteLine(string.Join(",", all));   // 1,2,3

// WhenAny：任意一个完成就返回
Task<int> first = await Task.WhenAny(t1, t2, t3);
Console.WriteLine($"最先完成的是 {first.Result}");   // 3（最短 sleep）
\`\`\`

实战场景：
- \`WhenAll\`：批量并发请求，全部等齐再处理。
- \`WhenAny\`：从多个镜像下载，谁先完成用谁（竞速）。

### 六、Parallel.For / ForEach / Invoke ⭐

专门为 CPU 并行设计，封装了分区、调度、异常聚合：

\`\`\`csharp
// Parallel.For：并行 for
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
// 高效版：用 Parallel.For 的线程局部变量
long total = Parallel.For(0L, 10001, () => 0L,
    (i, loop, local) => local + i,
    local => Interlocked.Add(ref total, local)).Result;

Console.WriteLine($"总和 = {total}");
\`\`\`

### 七、PLINQ 简介

\`AsParallel()\` 让 LINQ 自动并行：

\`\`\`csharp
var nums = Enumerable.Range(1, 10_000_000).ToArray();

// 串行 LINQ
var sw = Stopwatch.StartNew();
var sum1 = nums.Where(n => n % 2 == 0).Sum();
Console.WriteLine($"串行：{sw.ElapsedMilliseconds} ms = {sum1}");

// 并行 PLINQ
sw.Restart();
var sum2 = nums.AsParallel().Where(n => n % 2 == 0).Sum();
Console.WriteLine($"并行：{sw.ElapsedMilliseconds} ms = {sum2}");
\`\`\`

适用场景：**数据量大 + 计算重**。小数据用 PLINQ 反而慢（线程调度开销 > 计算）。

### 八、实战 demo：并行计算质数

\`\`\`csharp
// 判断质数
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

// Parallel.For 版本（用 Interlocked 累加）
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

- \`Task.Run\` 把 CPU 密集任务推到线程池，避免阻塞调用线程。
- \`Task.Factory.StartNew\` 是完整版，需要精细控制时才用。
- 避免 \`.Wait()\` / \`.Result\`，优先 \`await\`。
- \`Task.WhenAll\` 等全部完成，\`Task.WhenAny\` 等任意一个完成。
- \`Parallel.For/ForEach/Invoke\` 专为 CPU 并行，封装分区与调度。
- \`PLINQ\` (\`AsParallel()\`) 让 LINQ 自动并行，适合大数据 + 重计算。
- 并行访问共享变量必须同步（\`lock\` 或 \`Interlocked\`，下一章详解）。
- ⭐ \`Task.WhenAll\` 是并发编程最常用 API，必须熟练。`,
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
int counter = 0;

// 10 个线程各加 1 万次，期望 10 万
var threads = new List<Thread>();
for (int i = 0; i < 10; i++)
{
    var t = new Thread(() =>
    {
        for (int j = 0; j < 10000; j++)
            counter++;   // ⚠️ 不是原子操作
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
int counter = 0;
object lockObj = new();

for (int i = 0; i < 10; i++)
{
    new Thread(() =>
    {
        for (int j = 0; j < 10000; j++)
            lock (lockObj)      // 进入临界区，其他线程等待
            {
                counter++;
            }
    }).Start();
}

Thread.Sleep(500);   // 等线程跑完（演示用）
Console.WriteLine(counter);   // 100000 ✅
\`\`\`

要点：
- \`lock\` 参数必须是**引用类型对象**（\`object\`），不能是值类型（会装箱成不同对象）。
- 推荐用专门的 \`private readonly object lockObj = new();\` 字段，不要 lock 公开对象。
- \`lock\` 等价于 \`Monitor.Enter\` + \`try/finally\` + \`Monitor.Exit\`，保证异常时也能释放。

### 三、Monitor 类

\`lock\` 是 \`Monitor\` 的语法糖。\`Monitor\` 提供更多控制：

\`\`\`csharp
object lockObj = new();

// 等价于 lock(lockObj) { ... }
Monitor.Enter(lockObj);
try
{
    Console.WriteLine("临界区");
}
finally
{
    Monitor.Exit(lockObj);
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
// Wait 释放锁并等待，Pulse 唤醒一个等待者
\`\`\`

日常 95% 用 \`lock\` 就够，\`Monitor.TryEnter\` 用于需要超时的场景。

### 四、Interlocked 原子操作 ⭐

\`Interlocked\` 提供原子操作，比 \`lock\` 轻量得多。适合简单的数值操作：

\`\`\`csharp
long counter = 0;

// ✅ 原子自增
Interlocked.Increment(ref counter);
Interlocked.Decrement(ref counter);

// ✅ 原子加
Interlocked.Add(ref counter, 100);

// ✅ 原子赋值并返回旧值
long old = Interlocked.Exchange(ref counter, 0);
Console.WriteLine($"旧值 {old}");

// ✅ CAS（Compare-And-Swap）：原子条件更新
long current = Interlocked.Read(ref counter);
Interlocked.CompareExchange(ref counter, 42, current);
// 如果 counter == current，则设为 42；返回原值
\`\`\`

> ⭐ 简单计数器用 \`Interlocked\` 比 \`lock\` 快几倍，因为没有真正的「等待」。

\`\`\`csharp
// Interlocked 版线程安全计数器
long counter = 0;
Parallel.For(0, 100000, _ => Interlocked.Increment(ref counter));
Console.WriteLine(counter);   // 100000 ✅
\`\`\`

### 五、Mutex 互斥量

\`Mutex\` 跨进程，能用来做「单实例应用」：

\`\`\`csharp
// 第一个参数 true 表示「初始拥有」
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

\`Mutex\` 比 \`lock\` 慢 50 倍以上（涉及系统调用），**仅在需要跨进程时才用**。

### 六、SemaphoreSlim 信号量 ⭐

\`SemaphoreSlim\` 限制同时访问的线程数——比如限流：

\`\`\`csharp
// 最多 3 个线程同时进入
using var sem = new SemaphoreSlim(3);

async Task FetchAsync(int id)
{
    await sem.WaitAsync();      // 等待信号
    try
    {
        Console.WriteLine($"  [{id}] 开始");
        await Task.Delay(500);  // 模拟 IO
        Console.WriteLine($"  [{id}] 完成");
    }
    finally
    {
        sem.Release();          // 必须释放
    }
}

// 启动 10 个任务，但同一时刻只有 3 个在跑
var tasks = Enumerable.Range(1, 10).Select(FetchAsync).ToArray();
await Task.WhenAll(tasks);
\`\`\`

> ⭐ 实战场景：限制并发 HTTP 请求数量，避免打爆对方服务器或本地连接池。
>
> \`SemaphoreSlim\` 是\`async\` 友好的（有 \`WaitAsync\`），推荐替代老的 \`Semaphore\`。

### 七、ManualResetEvent / AutoResetEvent

事件信号——一个线程通知，其他线程等待。

\`\`\`csharp
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
// ❌ 反例：lock(this) 公开了锁对象，外部代码也能 lock 你的实例造成死锁
class BadCounter
{
    public void Increment()
    {
        lock (this)   // 危险！外部能 lock 这个实例
        {
            _count++;
        }
    }
    private int _count;
}

// 外部代码
var c = new BadCounter();
lock (c)   // 等于锁住了 BadCounter 内部的逻辑
{
    // ... 死锁风险
}

// ❌ 反例：lock(typeof(T)）锁定类型对象，全局共享，极易死锁
lock (typeof(BadCounter)) { /* ... */ }

// ❌ 反例：lock("字符串") 字符串被 intern，全局共享
lock("myLock") { /* ... */ }

// ✅ 正例：私有只读字段
class GoodCounter
{
    private readonly object _lock = new();
    public void Increment()
    {
        lock (_lock) { _count++; }
    }
    private int _count;
}
\`\`\`

> ⭐ 铁律：**lock 对象必须是 \`private readonly object\`，绝不暴露给外部**。

### 九、实战 demo：线程安全计数器 + 生产消费

\`\`\`csharp
// 1) 线程安全计数器（Interlocked 版）
class SafeCounter
{
    private long _value;
    public long Value => Interlocked.Read(ref _value);
    public void Increment() => Interlocked.Increment(ref _value);
    public void Add(long n) => Interlocked.Add(ref _value, n);
}

var counter = new SafeCounter();
Parallel.For(0, 100000, _ => counter.Increment());
Console.WriteLine($"计数器：{counter.Value}");   // 100000

// 2) 生产者-消费者（BlockingCollection 简化版）
//    生产者往里塞，消费者拿出来，自动同步
using var queue = new BlockingCollection<int>(boundedCapacity: 10);

// 生产者
var producer = Task.Run(() =>
{
    for (int i = 1; i <= 20; i++)
    {
        queue.Add(i);                       // 满了就阻塞等
        Console.WriteLine($"生产 {i}");
    }
    queue.CompleteAdding();                 // 通知：不会再加了
});

// 消费者
var consumer = Task.Run(() =>
{
    foreach (var item in queue.GetConsumingEnumerable())
    {
        Console.WriteLine($"  消费 {item}");
        Thread.Sleep(50);
    }
});

await Task.WhenAll(producer, consumer);
Console.WriteLine("全部处理完成");
\`\`\`

\`BlockingCollection\` 是 .NET 内置的生产消费队列，自动处理锁与信号，比手写 \`Monitor.Wait/Pulse\` 简单得多。

### 小结

- 多线程改共享数据必须同步，否则数据竞争。
- \`lock\` 是最常用互斥锁，对象必须是 \`private readonly object\`。
- \`Monitor\` 是 \`lock\` 的完整版，\`TryEnter\` 支持超时。
- \`Interlocked\` 原子操作适合简单数值，比 \`lock\` 快得多。
- \`Mutex\` 跨进程，慢但能做单实例应用。
- \`SemaphoreSlim\` 限流神器，\`async\` 友好。
- \`ManualResetEvent\` 是大门，\`AutoResetEvent\` 是旋转门。
- ⭐ 铁律：永远不要 \`lock(this)\` / \`lock(typeof(...))\` / \`lock("字符串")\`。
- ⭐ \`Interlocked\` + \`SemaphoreSlim\` 是日常开发最常用的两个同步工具。`,
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
// 没有取消机制：任务跑起来就停不下来
async Task RunForeverAsync()
{
    while (true)
    {
        Console.WriteLine("工作中...");
        await Task.Delay(1000);
    }
}

// 用户点了取消按钮，怎么办？没有 CancellationToken 就只能粗暴 Abort
\`\`\`

\`CancellationToken\` 是 .NET 的协作式取消：**调用方发信号，被调用方主动检查并优雅退出**。

### 二、CancellationTokenSource ⭐

\`\`\`csharp
// 创建取消源
using var cts = new CancellationTokenSource();

// 拿到 Token 传给任务
var task = Task.Run(async () =>
{
    for (int i = 0; i < 100; i++)
    {
        cts.Token.ThrowIfCancellationRequested();   // 检查并抛异常
        Console.WriteLine($"步骤 {i}");
        await Task.Delay(100, cts.Token);           // Delay 也支持取消
    }
}, cts.Token);

// 2 秒后取消
await Task.Delay(2000);
cts.Cancel();

try
{
    await task;
}
catch (OperationCanceledException)
{
    Console.WriteLine("任务被取消");
}
\`\`\`

要点：
- \`CancellationTokenSource\` 是「发信号」的一方，\`CancellationToken\` 是「听信号」的一方。
- \`Token.ThrowIfCancellationRequested()\` 检查并抛 \`OperationCanceledException\`。
- 大多数异步 API（\`Task.Delay\`、\`HttpClient.GetAsync\` 等）都接受 \`CancellationToken\`。

### 三、传递 CancellationToken

\`\`\`csharp
// 自定义异步方法接收 token
async Task<string> FetchAsync(string url, CancellationToken ct)
{
    ct.ThrowIfCancellationRequested();
    using var http = new HttpClient();

    // 传给底层 API，让它能中途取消
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
using var cts = new CancellationTokenSource();

// 取消时执行的回调（清理资源、记日志等）
cts.Token.Register(() => Console.WriteLine("回调：开始清理"));
cts.Token.Register(() => Console.WriteLine("回调：释放连接"));

Console.WriteLine("准备取消...");
cts.Cancel();   // 触发回调
// 输出：
// 回调：开始清理
// 回调：释放连接
\`\`\`

### 五、超时取消 ⭐

\`CancellationTokenSource\` 内置超时支持：

\`\`\`csharp
// 方式 1：构造时指定超时
using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(3));

// 方式 2：CancelAfter 动态设置
using var cts2 = new CancellationTokenSource();
cts2.CancelAfter(TimeSpan.FromSeconds(3));

// 实战：给一个可能很慢的任务加上超时
async Task<string> WithTimeoutAsync(Task<string> task, TimeSpan timeout)
{
    using var cts = new CancellationTokenSource(timeout);
    // 把任务和延迟任务做 WhenAny 竞速
    var completed = await Task.WhenAny(task, Task.Delay(timeout));
    if (completed == task)
        return await task;
    throw new TimeoutException($"超过 {timeout.TotalSeconds} 秒");
}
\`\`\`

### 六、ConcurrentDictionary ⭐

线程安全的字典，多线程读写不用加锁：

\`\`\`csharp
var dict = new ConcurrentDictionary<string, int>();

// 并发写入
Parallel.For(0, 1000, i =>
{
    // AddOrUpdate：键不存在就添加，存在就更新
    dict.AddOrUpdate("count", 1, (_, old) => old + 1);
});

Console.WriteLine(dict["count"]);   // 1000

// GetOrAdd：不存在就添加
var v = dict.GetOrAdd("name", _ => "张三");

// TryUpdate：条件更新
dict.TryUpdate("name", "李四", "张三");   // 只有当前值是"张三"才更新
\`\`\`

注意：\`ConcurrentDictionary\` 的**单个操作是原子的**，但多个操作组合不是。比如：

\`\`\`csharp
// ❌ 这两步之间可能被其他线程插入
if (!dict.ContainsKey("k"))
    dict["k"] = 1;

// ✅ 用 AddOrUpdate / GetOrAdd 保证原子
dict.GetOrAdd("k", _ => 1);
\`\`\`

### 七、ConcurrentQueue / ConcurrentStack

无锁的线程安全队列和栈：

\`\`\`csharp
// ConcurrentQueue：FIFO 队列
var queue = new ConcurrentQueue<int>();

// 多线程入队
Parallel.For(0, 1000, i => queue.Enqueue(i));

// 出队
while (queue.TryDequeue(out var item))
{
    // 处理 item
}
Console.WriteLine($"剩余 {queue.Count}");

// ConcurrentStack：LIFO 栈
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
using System.Threading.Channels;

// 创建有界 Channel（容量 100）
var channel = Channel.CreateBounded<string>(100);

// 生产者
async Task ProduceAsync()
{
    for (int i = 0; i < 1000; i++)
    {
        // WaitToWriteAsync：满了就异步等
        await channel.Writer.WriteAsync($"msg-{i}");
    }
    channel.Writer.Complete();   // 通知写完
}

// 消费者
async Task ConsumeAsync()
{
    // ReadAllAsync：异步迭代
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
using System.Threading.Channels;

// 用 Channel 做一个并发日志收集器，支持取消
class ConcurrentLogger
{
    private readonly Channel<string> _channel;
    private readonly CancellationTokenSource _cts;

    public ConcurrentLogger(int capacity = 1000)
    {
        _channel = Channel.CreateBounded<string>(capacity);
        _cts = new CancellationTokenSource();
    }

    // 多线程写入日志
    public async Task LogAsync(string msg)
    {
        // 取消时直接丢弃
        if (_cts.IsCancellationRequested) return;
        await _channel.Writer.WriteAsync($"[{DateTime.Now:HH:mm:ss}] {msg}", _cts.Token);
    }

    // 后台消费日志
    public async Task ProcessAsync(Action<string> handler)
    {
        await foreach (var line in _channel.Reader.ReadAllAsync(_cts.Token))
        {
            handler(line);
        }
    }

    // 停止：通知写完 + 取消
    public void Stop()
    {
        _channel.Writer.TryComplete();
        _cts.Cancel();
    }
}

// 使用
var logger = new ConcurrentLogger();

// 启动消费者
var consumer = logger.ProcessAsync(line =>
{
    Console.WriteLine($"写入文件: {line}");
});

// 多线程并发写日志
await Task.WhenAll(Enumerable.Range(1, 10).Select(async i =>
{
    for (int j = 0; j < 5; j++)
    {
        await logger.LogAsync($"线程 {i} 第 {j} 条");
        await Task.Delay(50);
    }
}));

logger.Stop();
try { await consumer; } catch (OperationCanceledException) { }
Console.WriteLine("日志系统停止");
\`\`\`

这套模型可以扩展成：多生产者写日志 → 单消费者批量化写入磁盘/网络，是高并发系统常见模式。

### 小结

- \`CancellationTokenSource\` 发信号，\`CancellationToken\` 听信号。
- 异步方法应接收 \`CancellationToken\`，调用方有权取消。
- \`ThrowIfCancellationRequested()\` 检查并抛 \`OperationCanceledException\`。
- \`Register\` 注册取消回调，做清理工作。
- \`CancelAfter\` / 构造时指定超时 = 自动超时取消。
- \`ConcurrentDictionary\` / \`Queue\` / \`Stack\` / \`Bag\` 是线程安全集合，单操作原子，多操作组合不原子。
- \`Channel<T>\` 是新一代生产消费模型，\`async\` 友好，性能优于 \`BlockingCollection\`。
- ⭐ \`CancellationToken\` + \`Channel<T>\` 是现代 C# 并发编程的两块基石，必须熟练掌握。`,
  },
];

export { chapters };
