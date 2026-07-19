// =============================================================
// C# 从入门到精通大全（全新版）—— 第 13 批章节
// 第十一部分 内存管理与性能（共 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   csharp4-ch64 : 第六十四章 垃圾回收
//   csharp4-ch65 : 第六十五章 IDisposable 与 Finalizer
//   csharp4-ch66 : 第六十六章 Span 与 Memory
//   csharp4-ch67 : 第六十七章 ref struct 与 ref readonly
//   csharp4-ch68 : 第六十八章 性能优化技巧
//
// 风格：demo 驱动，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，所有示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 第六十四章：垃圾回收
  // ============================================================
  {
    id: 'csharp4-ch64',
    group: '第十一部分 内存管理与性能',
    icon: '♻️',
    title: '垃圾回收',
    content: `## 第六十四章　垃圾回收

C# 之所以能让你「\`new\` 完就跑」而不用操心释放，全靠**垃圾回收器（Garbage Collector，GC）**。但「不用操心」不等于「可以乱写」——理解 GC 的工作机制，是写出高性能、低延迟 C# 代码的前提。

### 一、为什么需要 GC？⭐

手动管理内存（C/C++ 的 \`malloc/free\`）有两大顽疾：

- **内存泄漏**：忘了释放，内存越积越多。
- **悬空指针**：释放了还在用，访问已回收内存导致崩溃或数据错乱。

GC 把这两件事自动化了：你只管 \`new\`，GC 会在合适时机找出「没人再用」的对象并回收。代价是：你需要理解 GC 的行为，避免给它添麻烦。

### 二、托管堆（Managed Heap）

.NET 中所有引用类型（class）实例都分配在**托管堆**上。值类型（struct）通常分配在栈上或嵌入到引用类型中。托管堆是一块连续内存，分配时维护一个「下一个空闲位置」指针（\`NextObjPtr\`），\`new\` 几乎是 O(1) 操作——只要空间够。

```
托管堆：[objA][objB][objC][....空闲....]
                                      ↑ NextObjPtr
```

### 三、GC 触发条件

GC 不是定时跑的，而是**按需触发**，主要触发条件：

1. **第 0 代预算超限**：最常见。Gen0 空间用完时触发 Gen0 回收。
2. **显式调用**：\`GC.Collect()\`（通常**不推荐**手调，会破坏 GC 自适应调优）。
3. **系统低内存**：操作系统通知内存吃紧，.NET 收到 \`MemoryFailPoint\` 类似信号。
4. **大对象分配**：≥85000 字节的对象进 LOH，可能触发完整 GC。

### 四、代（Generation 0/1/2）

GC 的核心优化是**分代假设**：

- 新对象死得快（临时变量、局部变量）。
- 老对象活得久（静态字段、缓存）。

于是堆被分成三代：

| 代 | 含义 | 回收频率 |
| --- | --- | --- |
| Gen0 | 刚分配的对象 | 最高 |
| Gen1 | 经历过一次 GC 仍存活 | 中 |
| Gen2 | 长期存活对象 | 最低 |

**回收流程**：先回收 Gen0，幸存者晋升到 Gen1；Gen0 不够用时回收 Gen1+Gen0；以此类推。Gen2 回收代价最大，称为「Full GC」。

### 五、标记-清除（Mark and Sweep）

GC 回收分两阶段：

1. **标记（Mark）**：从 **GC Roots** 出发，遍历所有可达对象，打上「存活」标记。
   - GC Roots 包括：静态字段、方法参数/局部变量、CPU 寄存器中的引用、Finalizer 队列。
2. **清除（Sweep）**：未标记的对象视为垃圾，回收其内存。

Gen2 回收还会**压缩（Compact）**：移动存活对象填补空隙，更新所有引用。压缩代价高但避免内存碎片。

### 六、LOH（大对象堆）vs SOH（小对象堆）

- **SOH（Small Object Heap）**：<85000 字节的对象，分三代管理，回收时会压缩。
- **LOH（Large Object Heap）**：≥85000 字节（一般是数组/大字符串），**不压缩**（.NET 4.5.1 起可选压缩），**直接标记为 Gen2**。

LOH 不压缩是为了避免大对象移动的代价，但可能产生内存碎片。如果 LOH 碎片严重，可以 \`GC.Collect(2, GCCollectionMode.Default, true, true)\` 强制压缩。

### 七、Server GC vs Workstation GC

| 模式 | 适用 | 特点 |
| --- | --- | --- |
| Workstation GC | 桌面应用、单 CPU | 一个堆、一个 GC 线程，与用户线程并发 |
| Server GC | 服务端应用、多 CPU | **每个 CPU 一个堆+一个 GC 线程**，并行回收，吞吐高但暂停更长 |

.NET 8 服务端应用默认 Server GC（需配置 \`<ServerGarbageCollection>true</ServerGarbageControl>\` 或 \`runtimeconfig.json\`）。\`GCSettings.IsServerGC\` 可运行时查询。

### 八、GCSettings 类

\`System.Runtime.GCSettings\` 控制和查询 GC 行为：

- \`LatencyMode\`：延迟模式，\`Interactive\`（默认）/ \`Batch\` / \`LowLatency\` / \`SustainedLowLatency\` / \`NoGCRegion\`。
- \`LargeObjectHeapCompactionMode\`：下次 Full GC 是否压缩 LOH。
- \`IsServerGC\`：是否启用 Server GC。

\`NoGCRegion\`（\`GC.TryStartNoGCRegion\`）允许在关键路径上**临时禁用 GC**，跑完用 \`GC.EndNoGCRegion\` 恢复。

### 九、GC 关键 API 速查

\`\`\`csharp
GC.Collect();                            // 完整回收（Gen2+LOH）
GC.Collect(0);                           // 只回收 Gen0
GC.Collect(GC.MaxGeneration, GCCollectionMode.Forced, true, true); // 强制+压缩LOH
GC.WaitForPendingFinalizers();           // 等 Finalizer 跑完
GC.GetTotalMemory(false);                // 当前托管内存（字节）
GC.GetTotalAllocatedBytes();             // 进程累计分配字节
GC.GetAllocatedBytesForCurrentThread();  // 当前线程累计分配
GC.GetGeneration(obj);                   // 对象所在代
GC.GetTotalMemory(forceFullCollection: true);
GC.KeepAlive(obj);                       // 防止 obj 被提前回收
GC.SuppressFinalize(obj);                // 取消 Finalizer
GC.ReRegisterForFinalize(obj);           // 重新注册 Finalizer
GC.RegisterForFullGCNotification(...);   // 注册 Full GC 通知
\`\`\`

### 十、GC 通知（Full GC Notification）

服务端应用想避开在请求高峰期触发 Full GC，可注册通知：

\`\`\`csharp
GC.RegisterForFullGCNotification(10, 10);  // 阈值 10%
while (true) {
    GC.WaitForFullGCApproach();  // 返回 Approaching 表示即将 Full GC
    GC.WaitForFullGCComplete();  // 返回 Completed 表示已完成
}
GC.UnregisterForFullGCNotification();
\`\`\`

收到「Approaching」时可以主动做点轻量工作（如换缓冲区），让 GC 在更空闲时跑。

### 十一、对象生命周期与晋升

一个对象从 \`new\` 到回收的生命周期：

1. \`new\` → 进入 Gen0。
2. Gen0 回收时仍被引用 → 晋升 Gen1。
3. Gen1 回收时仍被引用 → 晋升 Gen2。
4. Gen2 回收时无引用 → 被回收（如有 Finalizer，先进 Finalizer 队列）。

**短生命周期对象应尽量留在 Gen0**——这是 GC 最高效的场景。避免在热路径上分配长期对象。

### 十二、固定对象（Pinned Object）

- **固定（Pin）**：让 GC 不能移动某个对象，通常因为要把它的地址传给 native 代码。
- 固定方式：\`fixed\` 语句、\`GCHandle.Alloc(obj, GCHandleType.Pinned)\`、\`GC.AllocateArray(..., pinned: true)\`（.NET 5+）。
- 固定对象会**制造堆碎片**（GC 不能移动它），尽量短时间固定。

\`GC.AllocateUninitializedArray\`：分配**不清零**的数组（跳过 zeroing），适合你马上要全部覆写的场景，省一点时间。但内存含上次数据，安全敏感场景别用。

### 十三、何时该手调 GC？

**几乎永远不需要。** 唯一合理场景：

- 服务启动后预热完成、想清掉临时对象，再做正式服务。
- 测试内存占用、复现 LOH 行为。
- 跑批任务分阶段，阶段间清场。

手调 \`GC.Collect()\` 会破坏 GC 的自适应统计，反而让后续回收更频繁。

### 十四、本章小结

- GC 按 Gen0→Gen1→Gen2 分代回收，新对象死得快是核心假设。
- 大对象（≥85000B）进 LOH，默认不压缩、直接 Gen2。
- Server GC 适合多核服务端，吞吐高。
- 想测量分配：\`GC.GetAllocatedBytesForCurrentThread()\`、\`GC.GetTotalMemory()\`。
- 别乱调 \`GC.Collect()\`，让 GC 自己决定。`,
    code: `// C# 12 顶级语句 —— 垃圾回收机制演示
using System;
using System.Diagnostics;
using System.Runtime;
using System.Runtime.InteropServices;

// === 1. 查看 GC 基本信息 ===
Console.WriteLine("=== GC 基础信息 ===");
Console.WriteLine($"当前 GC 最大代数: {GC.MaxGeneration}");          // 通常是 2
Console.WriteLine($"是否启用 Server GC: {GCSettings.IsServerGC}");  // 服务端默认 true
Console.WriteLine($"当前延迟模式: {GCSettings.LatencyMode}");        // Interactive
Console.WriteLine($"当前线程已分配字节: {GC.GetAllocatedBytesForCurrentThread():N0}");

// === 2. 演示分代回收 ===
Console.WriteLine("\\n=== 分代回收演示 ===");

// 强制先做一次完整回收，确保环境干净
GC.Collect();
GC.WaitForPendingFinalizers();
GC.Collect();

Console.WriteLine($"初始 Gen0 内存: {GC.GetGCMemoryInfo().GenerationInfo[0].SizeAfterMemory:N0} bytes");

// 创建一批短生命周期对象，触发 Gen0 回收
for (int i = 0; i < 100_000; i++)
{
    var temp = new byte[64];  // 64 字节小对象，进 SOH Gen0
}

// 此时大部分 temp 应该已经没人引用了
Console.WriteLine($"分配后 Gen0 内存: {GC.GetGCMemoryInfo().GenerationInfo[0].SizeAfterMemory:N0} bytes");

// 手动触发 Gen0 回收
GC.Collect(0);
Console.WriteLine($"Gen0 回收后: {GC.GetGCMemoryInfo().GenerationInfo[0].SizeAfterMemory:N0} bytes");

// === 3. 对象晋升演示 ===
Console.WriteLine("\\n=== 对象晋升演示 ===");
var survivor = new byte[1024];  // 这个对象一直被引用
Console.WriteLine($"分配后所在代: {GC.GetGeneration(survivor)}");  // 0

GC.Collect(0);  // 只回收 Gen0
Console.WriteLine($"Gen0 回收后所在代: {GC.GetGeneration(survivor)}");  // 1（晋升）

GC.Collect(1);  // 回收 Gen1
Console.WriteLine($"Gen1 回收后所在代: {GC.GetGeneration(survivor)}");  // 2（再晋升）

// === 4. LOH（大对象堆）演示 ===
Console.WriteLine("\\n=== LOH 大对象堆演示 ===");
GcMemoryInfo infoBefore = GC.GetGCMemoryInfo();
Console.WriteLine($"LOH 回收前大小: {infoBefore.HeapSizeBytes:N0} bytes 总计");

// 分配一个 ≥85000 字节的大数组 → 直接进 LOH（Gen2）
var largeArray = new byte[100_000];
Console.WriteLine($"大对象 (100000 bytes) 所在代: {GC.GetGeneration(largeArray)}");  // 2

// === 5. 测量分配开销（GetAllocatedBytesForCurrentThread）===
Console.WriteLine("\\n=== 测量线程分配字节 ===");
long before = GC.GetAllocatedBytesForCurrentThread();
for (int i = 0; i < 1_000; i++)
{
    _ = new byte[128];  // 共分配 128KB
}
long after = GC.GetAllocatedBytesForCurrentThread();
Console.WriteLine($"1000 次 128B 分配，实际分配: {(after - before):N0} bytes (含对象头开销)");

// === 6. GC.AllocateArray vs AllocateUninitializedArray ===
Console.WriteLine("\\n=== AllocateUninitializedArray 性能 ===");
var sw = Stopwatch.StartNew();
for (int i = 0; i < 100_000; i++)
{
    byte[] arr = GC.AllocateArray<byte>(1024);  // 普通分配，会清零
}
sw.Stop();
Console.WriteLine($"AllocateArray (清零) 10w 次: {sw.ElapsedMilliseconds} ms");

sw.Restart();
for (int i = 0; i < 100_000; i++)
{
    byte[] arr = GC.AllocateUninitializedArray<byte>(1024);  // 不清零，快一点
}
sw.Stop();
Console.WriteLine($"AllocateUninitializedArray (不清零) 10w 次: {sw.ElapsedMilliseconds} ms");

// === 7. pinned 数组（GC 不会移动它）===
Console.WriteLine("\\n=== Pinned 数组 ===");
byte[] pinnedArr = GC.AllocateArray<byte>(16, pinned: true);  // 直接固定
Console.WriteLine($"pinned 数组地址: {Marshal.UnsafeAddrOfPinnedArrayElement(pinnedArr, 0):X}");

// === 8. NoGCRegion：临时禁用 GC ===
Console.WriteLine("\\n=== NoGCRegion 临时禁用 GC ===");
if (GC.TryStartNoGCRegion(64 * 1024 * 1024))  // 给 64MB 空间，期间不触发 GC
{
    Console.WriteLine("已进入 NoGCRegion");
    long b = GC.GetAllocatedBytesForCurrentThread();
    for (int i = 0; i < 10_000; i++) _ = new byte[64];
    long a = GC.GetAllocatedBytesForCurrentThread();
    Console.WriteLine($"NoGCRegion 内分配: {(a - b):N0} bytes，未触发 GC");
    GC.EndNoGCRegion();  // 必须显式结束
    Console.WriteLine("已退出 NoGCRegion");
}
else
{
    Console.WriteLine("进入 NoGCRegion 失败（可能已分配超过预算）");
}

// === 9. GC.GetTotalMemory 与 GetTotalAllocatedBytes ===
Console.WriteLine("\\n=== 全局内存统计 ===");
Console.WriteLine($"GetTotalMemory(forceFull: false): {GC.GetTotalMemory(false):N0} bytes");
Console.WriteLine($"GetTotalAllocatedBytes: {GC.GetTotalAllocatedBytes():N0} bytes（进程累计）");

// === 10. GCSettings 调整 LOH 压缩 ===
Console.WriteLine("\\n=== LOH 压缩模式 ===");
Console.WriteLine($"当前 LOH 压缩模式: {GCSettings.LargeObjectHeapCompactionMode}");
// 下次 Full GC 时压缩 LOH（适合内存碎片严重的场景）
GCSettings.LargeObjectHeapCompactionMode = GCLargeObjectHeapCompactionMode.CompactOnce;
GC.Collect(2, GCCollectionMode.Forced, true, true);  // 阻塞、强制、压缩 LOH
Console.WriteLine("已强制压缩 LOH");
GCSettings.LargeObjectHeapCompactionMode = GCLargeObjectHeapCompactionMode.Default;

Console.WriteLine("\\n=== 完成 ===");`,
    lang: 'cs',
  },

  // ============================================================
  // 第六十五章：IDisposable 与 Finalizer
  // ============================================================
  {
    id: 'csharp4-ch65',
    group: '第十一部分 内存管理与性能',
    icon: '🧹',
    title: 'IDisposable 与 Finalizer',
    content: `## 第六十五章　IDisposable 与 Finalizer

GC 管得了托管内存，但管不了**非托管资源**：文件句柄、数据库连接、网络 socket、native 内存、加密上下文。这些必须**显式释放**，否则就泄漏。本章讲 .NET 处理资源释放的完整套路。

### 一、为什么需要 IDisposable？⭐

托管对象（\`new\` 出来的 class）GC 会回收，但 GC 时机**不确定**。如果你的对象内部持有一个 OS 文件句柄（\`FileStream\` 持有 \`SafeFileHandle\`），等到 GC 回收可能已经过去几分钟——期间句柄被占着不释放，可能耗尽系统资源。

\`IDisposable\` 接口提供 **\`Dispose()\`** 方法，让你**主动**告诉对象：「我现在不用了，立即释放底层资源」。

\`\`\`csharp
public interface IDisposable {
    void Dispose();
}
\`\`\`

### 二、using 语句：自动调用 Dispose

C# 提供 \`using\` 语句，确保离开作用域时一定调用 \`Dispose\`（即使抛异常）：

\`\`\`csharp
using (var fs = new FileStream("a.txt", FileMode.Open))
{
    // 用 fs 读写
}  // ← 这里自动调用 fs.Dispose()
\`\`\`

编译器会展开成 \`try/finally\`，等价于：

\`\`\`csharp
FileStream fs = new FileStream(...);
try { /* 用 fs */ }
finally { fs.Dispose(); }
\`\`\`

### 三、using 声明（C# 8+）：无需大括号

C# 8 引入 **using 声明**，省去大括号，离开当前作用域（方法、\`{ }\` 块）时自动 Dispose：

\`\`\`csharp
using var fs = new FileStream("a.txt", FileMode.Open);
// 用 fs
// 方法结束时自动 Dispose
\`\`\`

更简洁，但要注意：Dispose 发生在**所在作用域结束**时，不是你想的那个时刻。如果需要精确控制释放时机，还是用 \`using ( ) { }\`。

### 四、标准 Dispose 模式

如果一个类持有非托管资源，应实现完整 Dispose 模式：

\`\`\`csharp
public class MyResource : IDisposable
{
    private bool _disposed;

    public void Dispose()
    {
        Dispose(disposing: true);
        GC.SuppressFinalize(this);  // 已手动释放，不需要 Finalizer
    }

    protected virtual void Dispose(bool disposing)
    {
        if (_disposed) return;

        if (disposing)
        {
            // 释放托管资源（实现 IDisposable 的字段）
            _managedField?.Dispose();
        }

        // 释放非托管资源（native 句柄等）
        CloseHandle(_nativeHandle);

        _disposed = true;
    }

    ~MyResource()  // Finalizer
    {
        Dispose(disposing: false);  // GC 时只清非托管
    }
}
\`\`\`

**关键点**：

- \`Dispose(true)\`：手动调用，清托管+非托管。
- \`Dispose(false)\`：Finalizer 调用，**只清非托管**（因为托管对象可能已被 GC 回收）。
- \`GC.SuppressFinalize\`：避免重复清理（Finalizer 有性能代价，进 Finalizer 队列的对象要等下一次 GC 才真正回收）。

### 五、Finalizer（终结器）

\`~MyClass()\` 是 Finalizer，**GC 回收对象前**会被调用（在一个专门的 Finalizer 线程上）。它的存在意义是「兜底」：万一你忘了 \`Dispose\`，至少非托管资源最终能被释放。

⚠ Finalizer 的坑：

1. **不保证执行时机**：可能延迟很久。
2. **不保证执行顺序**：对象间引用关系可能已被破坏。
3. **Finalizer 队列有性能代价**：对象要晋升一代才回收。
4. **进程异常退出可能不执行**：所以不能依赖它做关键清理。

**最佳实践**：尽量别自己写 Finalizer，用 \`SafeHandle\` 包装非托管资源。

### 六、SafeHandle：托管包装器

\`System.Runtime.InteropServices.SafeHandle\` 是 .NET 推荐的非托管句柄包装器：

- 自动实现 Dispose 模式 + Finalizer，你只写 \`ReleaseHandle()\`。
- 保证在 AppDomain unload、CriticalException 等场景下也释放。
- 防止「句柄回收攻击」（GC 过早回收还被人使用的句柄）。

常用子类：

- \`SafeFileHandle\`（\`Microsoft.Win32.SafeHandles\`）：文件句柄。
- \`SafeWaitHandle\`：Wait 句柄。
- \`SafeProcessHandle\` / \`SafePipeHandle\` 等。

\`\`\`csharp
public class MySafeHandle : SafeHandle
{
    public MySafeHandle() : base(IntPtr.Zero, ownsHandle: true) { }

    public override bool IsInvalid => handle == IntPtr.Zero;

    protected override bool ReleaseHandle()
    {
        NativeMethods.CloseHandle(handle);  // 释放 native 资源
        return true;
    }
}
\`\`\`

### 七、CriticalHandle vs SafeHandle

- \`SafeHandle\`：在 **CER（约束执行区域）** 中执行 \`ReleaseHandle\`，保证不抛异常、不被线程中断。**推荐**。
- \`CriticalHandle\`：轻量版，不做 CER 保护，性能稍高但**不安全**。

### 八、CER 与 ReliabilityContract

**CER（Constrained Execution Region）** 是 CLR 保证一段代码「不被异步异常打断」的机制：

\`\`\`csharp
RuntimeHelpers.PrepareConstrainedRegions();
try { /* CER 区域 */ }
finally
{
    // 这里保证执行，即使 AppDomain 卸载
    releaseHandle();
}
\`\`\`

\`ReliabilityContract\` 特性标注方法在 CER 中的行为：

\`\`\`csharp
[ReliabilityContract(Consistency.WillNotCorruptState, Cer.Success)]
public bool ReleaseHandle() { ... }
\`\`\`

日常开发很少自己写 CER，但 \`SafeHandle.ReleaseHandle\` 内部就是 CER。

### 九、ObjectDisposedException

调用已 Dispose 的对象方法，应抛 \`ObjectDisposedException\`：

\`\`\`csharp
public void DoWork()
{
    if (_disposed) throw new ObjectDisposedException(nameof(MyResource));
    // ...
}
\`\`\`

让使用者尽早发现 bug。

### 十、GC.SuppressFinalize / ReRegisterForFinalize

- \`GC.SuppressFinalize(obj)\`：从 Finalizer 队列移除（手动 Dispose 后调用）。
- \`GC.ReRegisterForFinalize(obj)\`：重新加入 Finalizer 队列（罕见，比如「复活」对象）。

### 十一、IAsyncDisposable（C# 8+）

异步资源（如数据库连接）应实现 \`IAsyncDisposable\`：

\`\`\`csharp
public interface IAsyncDisposable {
    ValueTask DisposeAsync();
}
\`\`\`

配合 **\`await using\`** 声明：

\`\`\`csharp
await using var conn = new SqlConnection(connStr);
await conn.OpenAsync();
// 用 conn
// 作用域结束自动 await conn.DisposeAsync()
\`\`\`

\`ValueTask\` 而非 \`Task\` 是为了同步完成时避免分配。

**同时实现 IDisposable 和 IAsyncDisposable** 是常见做法：同步路径走 \`Dispose\`，异步路径走 \`DisposeAsync\`，两套都正确实现。

### 十二、本章小结

- 非托管资源必须显式释放，\`IDisposable\` 是契约。
- 优先 \`using\` 声明（C# 8+），代码最简洁。
- 完整 Dispose 模式：\`Dispose(bool)\` + \`GC.SuppressFinalize\` + 可选 Finalizer。
- **能不写 Finalizer 就不写**，用 \`SafeHandle\` 包装 native 资源。
- 异步资源实现 \`IAsyncDisposable\`，用 \`await using\`。
- 已释放对象抛 \`ObjectDisposedException\` 提醒调用方。`,
    code: `// C# 12 顶级语句 —— IDisposable / Finalizer / SafeHandle / IAsyncDisposable 全套演示
using System;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;

// === 1. 使用 using 声明（C# 8+）===
Console.WriteLine("=== using 声明 ===");
using (var resource = new NativeBuffer(1024))
{
    resource.Write(0, 42);
    Console.WriteLine($"  读取: {resource.Read(0)}");
}  // ← 离开 using 块自动 Dispose

// === 2. using var 声明（无大括号）===
Console.WriteLine("\\n=== using var 声明 ===");
using var r2 = new NativeBuffer(64);
r2.Write(0, 100);
Console.WriteLine($"  using var 声明: {r2.Read(0)}");
// 方法结束时自动 Dispose r2

// === 3. 演示 Finalizer 行为 ===
Console.WriteLine("\\n=== Finalizer 行为 ===");
Console.WriteLine("创建短生命周期对象（有 Finalizer）...");
for (int i = 0; i < 5; i++)
{
    var tmp = new LeakyObject(i);
    tmp = null;  // 不再引用
}
GC.Collect();
GC.WaitForPendingFinalizers();  // 等 Finalizer 跑完
GC.Collect();
Console.WriteLine("Finalizer 已执行（看上面输出）");

// === 4. SafeHandle 包装 native 句柄 ===
Console.WriteLine("\\n=== SafeHandle 演示 ===");
using (var handle = new MySafeHandle())
{
    Console.WriteLine($"  句柄是否有效: {!handle.IsInvalid}");
    // 模拟使用句柄调用 native API
    NativeMethods.UseHandle(handle.DangerousGetHandle());
}
// 离开 using 自动 ReleaseHandle

// === 5. IAsyncDisposable + await using ===
Console.WriteLine("\\n=== IAsyncDisposable + await using ===");
await using (var conn = new AsyncDbConnection("Server=local;"))
{
    await conn.OpenAsync();
    await conn.ExecuteAsync("SELECT 1");
}
// 离开 await using 自动 DisposeAsync

// === 6. ObjectDisposedException 演示 ===
Console.WriteLine("\\n=== ObjectDisposedException 演示 ===");
var r3 = new NativeBuffer(32);
r3.Dispose();
try
{
    r3.Write(0, 1);  // 应抛 ObjectDisposedException
}
catch (ObjectDisposedException ex)
{
    Console.WriteLine($"  正确捕获: {ex.Message}");
}

// === 7. 手动 SuppressFinalize / ReRegisterForFinalize ===
Console.WriteLine("\\n=== SuppressFinalize / ReRegisterForFinalize ===");
var zombie = new LeakyObject(99);
zombie.Dispose();  // Dispose 内部已调用 SuppressFinalize
Console.WriteLine("  Dispose 后 Finalizer 不会跑");
GC.Collect();
GC.WaitForPendingFinalizers();
Console.WriteLine("  验证完毕（未看到 Finalizer 输出）");

// ============== 类型定义区 ==============

// 标准 Dispose 模式 + Finalizer 示例
sealed class NativeBuffer : IDisposable
{
    private IntPtr _buffer;        // 非托管内存指针
    private int _size;
    private bool _disposed;

    public NativeBuffer(int size)
    {
        _size = size;
        _buffer = Marshal.AllocHGlobal(size);  // 分配 native 内存
        Console.WriteLine($"  [NativeBuffer] 分配 {_size} 字节 native 内存");
    }

    public int Read(int offset)
    {
        if (_disposed) throw new ObjectDisposedException(nameof(NativeBuffer));
        return Marshal.ReadByte(_buffer, offset);
    }

    public void Write(int offset, byte value)
    {
        if (_disposed) throw new ObjectDisposedException(nameof(NativeBuffer));
        Marshal.WriteByte(_buffer, offset, value);
    }

    public void Dispose()
    {
        Dispose(disposing: true);
        GC.SuppressFinalize(this);  // 已手动释放，告诉 GC 不用跑 Finalizer
        Console.WriteLine($"  [NativeBuffer] Dispose 调用，SuppressFinalize");
    }

    private void Dispose(bool disposing)
    {
        if (_disposed) return;
        if (disposing)
        {
            // 释放托管资源（如果有 IDisposable 字段）
        }
        // 释放非托管资源
        if (_buffer != IntPtr.Zero)
        {
            Marshal.FreeHGlobal(_buffer);
            _buffer = IntPtr.Zero;
        }
        _disposed = true;
    }

    ~NativeBuffer()  // Finalizer：兜底，万一忘 Dispose
    {
        Dispose(disposing: false);
        Console.WriteLine($"  [NativeBuffer] Finalizer 跑了（说明忘 Dispose）");
    }
}

// 故意不调 Dispose 的对象，演示 Finalizer 兜底
class LeakyObject
{
    public int Id { get; }
    public LeakyObject(int id) { Id = id; }

    ~LeakyObject()
    {
        Console.WriteLine($"  [LeakyObject#{Id}] Finalizer 兜底执行");
    }

    public void Dispose()
    {
        GC.SuppressFinalize(this);  // 主动释放后，Finalizer 就不用跑了
        Console.WriteLine($"  [LeakyObject#{Id}] Dispose → SuppressFinalize");
    }
}

// SafeHandle：自动 Dispose + Finalizer + CER 保护
sealed class MySafeHandle : SafeHandle
{
    public MySafeHandle() : base(IntPtr.Zero, ownsHandle: true)
    {
        // 模拟从 native API 拿到句柄
        SetHandle(new IntPtr(12345));
        Console.WriteLine($"  [MySafeHandle] 获取句柄");
    }

    public override bool IsInvalid => handle == IntPtr.Zero;

    // 在 CER 中执行，保证即使 AppDomain 卸载也能释放
    protected override bool ReleaseHandle()
    {
        Console.WriteLine($"  [MySafeHandle] ReleaseHandle 释放句柄 {handle}");
        // 实际场景调 NativeMethods.CloseHandle(handle)
        return true;
    }
}

// IAsyncDisposable 示例
sealed class AsyncDbConnection : IAsyncDisposable, IDisposable
{
    private string _connStr;
    private bool _disposed;

    public AsyncDbConnection(string connStr)
    {
        _connStr = connStr;
        Console.WriteLine($"  [AsyncDbConnection] 构造，连接串: {_connStr}");
    }

    public Task OpenAsync()
    {
        Console.WriteLine("  [AsyncDbConnection] OpenAsync");
        return Task.CompletedTask;
    }

    public Task ExecuteAsync(string sql)
    {
        Console.WriteLine($"  [AsyncDbConnection] ExecuteAsync: {sql}");
        return Task.CompletedTask;
    }

    public ValueTask DisposeAsync()
    {
        if (_disposed) return ValueTask.CompletedTask;
        Console.WriteLine("  [AsyncDbConnection] DisposeAsync（异步关闭连接）");
        _disposed = true;
        GC.SuppressFinalize(this);
        return ValueTask.CompletedTask;
    }

    public void Dispose()
    {
        if (_disposed) return;
        Console.WriteLine("  [AsyncDbConnection] Dispose（同步关闭连接）");
        _disposed = true;
        GC.SuppressFinalize(this);
    }
}

// Native 方法声明
static class NativeMethods
{
    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern bool CloseHandle(IntPtr handle);

    public static void UseHandle(IntPtr h)
    {
        Console.WriteLine($"  [Native] 使用句柄: {h}");
    }
}`,
    lang: 'cs',
  },

  // ============================================================
  // 第六十六章：Span 与 Memory
  // ============================================================
  {
    id: 'csharp4-ch66',
    group: '第十一部分 内存管理与性能',
    icon: '⚡',
    title: 'Span 与 Memory',
    content: `## 第六十六章　Span 与 Memory

\`Span<T>\` 是 .NET Core 以来最重要的性能 API 之一，被称为「C# 性能的瑞士军刀」。它让你**零拷贝**地操作一段连续内存——数组、字符串、stackalloc、native 内存——统统统一为一种视图。

### 一、为什么需要 Span？⭐

传统写法中，对字符串做切片会**分配新字符串**：

\`\`\`csharp
string s = "Hello, World";
string sub = s.Substring(7, 5);  // "World" — 新分配一个 string
\`\`\`

在解析器、热路径里，这种分配会制造大量临时对象，让 GC 忙个不停。

\`Span<T>\` 提供一种**只读视图**（或可写视图）：

\`\`\`csharp
ReadOnlySpan<char> sub = s.AsSpan(7, 5);  // 不分配，只记录起点+长度
\`\`\`

\`Span<T>\` 内部就是「引用 + 长度」，**不持有内存**，对它操作等同于操作原始内存。

### 二、Span<T> vs ReadOnlySpan<T>

- \`Span<T>\`：可读可写的视图。
- \`ReadOnlySpan<T>\`：只读视图，从 \`string\`、\`ReadOnlyMemory<T>\` 等转出来。

\`\`\`csharp
Span<int> arr = new int[] { 1, 2, 3, 4, 5 };
arr[0] = 99;  // 可写

string s = "abc";
ReadOnlySpan<char> rs = s.AsSpan();  // string 不可变，所以是只读
\`\`\`

### 三、Memory<T> vs Span<T>

\`Span<T>\` 是 **\`ref struct\`**，有限制（见下文）。\`Memory<T>\` 是它的「可装箱、可存储、可异步」版本：

| 类型 | 可装箱 | 可作字段 | 可跨 await | 性能 |
| --- | --- | --- | --- | --- |
| \`Span<T>\` | ❌ | ❌ | ❌ | 最优 |
| \`Memory<T>\` | ✅ | ✅ | ✅ | 略低 |

异步方法里要用 \`Memory<T>\`，在同步热路径用 \`Span<T>\`。两者互转：

\`\`\`csharp
Memory<int> mem = new int[] { 1, 2, 3 }.AsMemory();
Span<int> span = mem.Span;          // Memory → Span
Memory<int> mem2 = span.ToArray().AsMemory();  // Span → Memory（会拷贝）
\`\`\`

### 四、stackalloc：栈上分配

\`stackalloc\` 在**栈**上分配一段内存（不是堆），方法返回时自动释放，零 GC 压力：

\`\`\`csharp
Span<int> buf = stackalloc int[16];  // 16 个 int，在栈上
buf[0] = 42;
\`\`\`

⚠ 注意：栈空间有限（通常 1MB），别 stackalloc 大数组。一般控制在几 KB 内。\`stackalloc\` 在 C# 7.2 后可直接赋值给 \`Span<T>\`。

### 五、Span 切片与操作

\`\`\`csharp
Span<int> arr = new[] { 1, 2, 3, 4, 5, 6 };
Span<int> slice = arr.Slice(2, 3);   // [3, 4, 5]，零拷贝
slice[0] = 99;                        // 改的是 arr[2]
Console.WriteLine(arr[2]);            // 99

// 常用操作
arr.Length;          // 6
arr.IsEmpty;         // false
arr.Fill(0);         // 全部置 0
arr.CopyTo(other);   // 拷贝到 other
arr.Reverse();       // 反转
\`\`\`

### 六、字符串与 Span

\`string.AsSpan()\` 是性能关键 API：

\`\`\`csharp
string s = "user=admin;pass=123";
ReadOnlySpan<char> span = s.AsSpan();

int sep = span.IndexOf(';');
ReadOnlySpan<char> user = span[..sep];     // "user=admin"
ReadOnlySpan<char> pass = span[(sep + 1)..]; // "pass=123"
\`\`\`

\`Span<char>\` 还能配合 \`int.Parse\`、\`Guid.Parse\` 等 API（.NET Core 2.1+ 重载支持 ReadOnlySpan）。

### 七、ref struct 的限制

\`Span<T>\` 是 \`ref struct\`，编译器对它有严格限制：

- ❌ 不能装箱（\`object o = span;\` 编译错误）。
- ❌ 不能作为 class/struct 的字段（除非外层也是 ref struct）。
- ❌ 不能跨 \`await\` / \`yield\`。
- ❌ 不能实现接口（C# 7.2 限制，C# 11 起部分放宽）。
- ❌ 不能用 \`Lambda\` 捕获。

这些限制是为了**保证 Span 引用的内存不会被 GC 移动**，从而安全地用指针操作。

### 八、ArrayPool<T>：数组对象池

频繁分配大数组很贵，\`ArrayPool<T>.Shared\` 提供租借/归还机制：

\`\`\`csharp
byte[] buf = ArrayPool<byte>.Shared.Rent(1024);  // 租借（≥1024 字节）
try
{
    // 使用 buf
}
finally
{
    ArrayPool<byte>.Shared.Return(buf);  // 归还
}
\`\`\`

⚠ \`Rent\` 返回的数组**长度可能 ≥ 请求长度**（向上取整到桶大小），用 \`buf.AsSpan(0, actualLength)\` 截取需要的部分。\`Return\` 时若 \`clearArray: true\` 会清零（防止下个使用者读到敏感数据）。

### 九、CollectionsMarshal.AsSpan

\`System.Runtime.InteropServices.CollectionsMarshal.AsSpan(list)\`（.NET 5+）直接拿到 \`List<T>\` 内部数组作为 Span，绕过索引器边界检查，是热路径优化利器：

\`\`\`csharp
List<int> list = new() { 1, 2, 3, 4, 5 };
Span<int> span = CollectionsMarshal.AsSpan(list);
span[0] = 99;  // 直接改 list 内部数组
\`\`\`

⚠ 危险：之后若 \`list.Add\` 触发扩容，旧 Span 引用的数组已被废弃，Span 与 list 脱节。**只在确定不修改 list 大小时用**。

### 十、String.Create<TState>

\`String.Create<TState>(length, state, callback)\` 让你**直接在新建 string 的内存上写**，跳过中间 StringBuilder：

\`\`\`csharp
string result = string.Create(10, 42, (span, value) =>
{
    "Value: ".AsSpan().CopyTo(span);
    value.TryFormat(span[7..], out _);
});
// "Value: 42"
\`\`\`

适合已知长度的字符串构造场景。

### 十一、Unsafe 类

\`System.Runtime.CompilerServices.Unsafe\` 提供低级指针操作：

- \`Unsafe.As<TFrom, TTo>(ref)\`：类型重解释（reinterpreting）。
- \`Unsafe.Add(ref T, int)\`：指针偏移。
- \`Unsafe.SizeOf<T>()\`：含 padding 的大小。
- \`Unsafe.AsRef<T>(in T)\`：把 \`in\` 转 \`ref\`。

日常少用，写底层库时常用。

### 十二、本章小结

- \`Span<T>\` 是连续内存的零拷贝视图，热路径首选。
- 异步/字段/装箱场景用 \`Memory<T>\`。
- 栈上小缓冲用 \`stackalloc\`，堆上复用大数组用 \`ArrayPool\`。
- \`CollectionsMarshal.AsSpan\` 直接访问 List 内部数组，性能利器但要小心扩容。
- \`String.Create\` 跳过 StringBuilder 中间步骤，直接构造字符串。
- \`ref struct\` 限制多但保证安全，理解它就能用好 Span。`,
    code: `// C# 12 顶级语句 —— Span/Memory/ArrayPool/stackalloc 高性能字符串解析演示
using System;
using System.Buffers;
using System.Diagnostics;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Text;

// === 1. Span 基础：切片零拷贝 ===
Console.WriteLine("=== Span 基础 ===");
int[] arr = { 1, 2, 3, 4, 5, 6, 7, 8 };
Span<int> span = arr.AsSpan();           // 整个数组
Span<int> middle = span.Slice(2, 4);     // [3,4,5,6]
middle[0] = 99;                          // 修改影响原数组
Console.WriteLine($"  arr[2] = {arr[2]} (应是 99)");

// 范围运算符切片（C# 8+）
Span<int> last3 = span[^3..];            // [6,7,8]
Console.WriteLine($"  最后 3 个: {string.Join(',', last3.ToArray())}");

// === 2. 字符串 AsSpan：零分配解析 ===
Console.WriteLine("\\n=== 字符串 AsSpan 解析 ===");
string input = "user=admin;pass=P@ssw0rd;role=admin";
ReadOnlySpan<char> inputSpan = input.AsSpan();

// 手写解析器：不用 Split（会分配 string 数组）
int idx = 0;
while (idx < inputSpan.Length)
{
    int eq = inputSpan[idx..].IndexOf('=');
    if (eq < 0) break;
    eq += idx;
    int semi = inputSpan[eq..].IndexOf(';');
    if (semi < 0) semi = inputSpan.Length - eq;
    semi += eq;

    ReadOnlySpan<char> key = inputSpan[idx..eq];
    ReadOnlySpan<char> value = inputSpan[(eq + 1)..semi];
    Console.WriteLine($"  {key} = {value}");

    idx = semi + 1;
}

// === 3. stackalloc：栈上分配小缓冲 ===
Console.WriteLine("\\n=== stackalloc 栈上分配 ===");
Span<char> buf = stackalloc char[32];    // 32 字符在栈上
"Hello".AsSpan().CopyTo(buf);
"World".AsSpan().CopyTo(buf[5..]);
buf[5] = ' ';
Console.WriteLine($"  buf = {buf[..10].ToString()}");

// stackalloc + 数字格式化
Span<char> numBuf = stackalloc char[16];
if (12345678.TryFormat(numBuf, out int written, "N0"))
{
    Console.WriteLine($"  格式化数字: {numBuf[..written].ToString()}");
}

// === 4. ArrayPool：租借大数组 ===
Console.WriteLine("\\n=== ArrayPool 租借 ===");
byte[] rented = ArrayPool<byte>.Shared.Rent(1024);  // 租借（实际可能更大）
Console.WriteLine($"  租借请求 1024 字节，实际: {rented.Length}");
try
{
    rented.AsSpan(0, 1024).Fill(0xFF);  // 用 Span 填充前 1024 字节
    Console.WriteLine($"  前 4 字节: {rented[0]:X2} {rented[1]:X2} {rented[2]:X2} {rented[3]:X2}");
}
finally
{
    ArrayPool<byte>.Shared.Return(rented, clearArray: true);  // 归还并清零
}

// === 5. Memory<T>：可跨 await ===
Console.WriteLine("\\n=== Memory<T> 跨异步 ===");
Memory<int> mem = new[] { 10, 20, 30, 40, 50 }.AsMemory();
await ProcessAsync(mem);
Console.WriteLine($"  处理后 mem[0] = {mem.Span[0]}");

// === 6. CollectionsMarshal.AsSpan：直接访问 List 内部数组 ===
Console.WriteLine("\\n=== CollectionsMarshal.AsSpan ===");
List<int> list = new() { 1, 2, 3, 4, 5 };
Span<int> listSpan = CollectionsMarshal.AsSpan(list);
listSpan[0] = 999;  // 直接改 List 内部数组
Console.WriteLine($"  list[0] = {list[0]} (应是 999)");

// 在不修改 List 大小的情况下，用 Span 遍历最快
int sum = 0;
foreach (int x in listSpan) sum += x;
Console.WriteLine($"  Span 遍历求和: {sum}");

// === 7. String.Create：跳过 StringBuilder 直接构造 ===
Console.WriteLine("\\n=== String.Create ===");
string formatted = string.Create(13, (123, 456), static (span, state) =>
{
    // span 是新 string 内部内存，直接写入
    "x=".AsSpan().CopyTo(span);
    state.Item1.TryFormat(span[2..], out _);
    span[5] = ',';
    "y=".AsSpan().CopyTo(span[6..]);
    state.Item2.TryFormat(span[8..], out _);
});
Console.WriteLine($"  String.Create 结果: {formatted}");

// === 8. 性能对比：Substring vs AsSpan ===
Console.WriteLine("\\n=== 性能对比：Substring vs AsSpan ===");
string big = new string('x', 100_000);
var sw = Stopwatch.StartNew();

// Substring 会分配新字符串
long memBefore = GC.GetAllocatedBytesForCurrentThread();
for (int i = 0; i < 100_000; i++)
{
    _ = big.Substring(1000, 100);
}
long memSubstring = GC.GetAllocatedBytesForCurrentThread() - memBefore;
sw.Stop();
Console.WriteLine($"  Substring 10w 次: {sw.ElapsedMilliseconds} ms, 分配 {memSubstring:N0} bytes");
sw.Restart();

// AsSpan 零分配
memBefore = GC.GetAllocatedBytesForCurrentThread();
for (int i = 0; i < 100_000; i++)
{
    _ = big.AsSpan(1000, 100);
}
long memSpan = GC.GetAllocatedBytesForCurrentThread() - memBefore;
sw.Stop();
Console.WriteLine($"  AsSpan 10w 次: {sw.ElapsedMilliseconds} ms, 分配 {memSpan:N0} bytes");

// === 9. Unsafe 类简介 ===
Console.WriteLine("\\n=== Unsafe 类 ===");
int a = 42;
ref int refA = ref Unsafe.AsRef(in a);  // in → ref
Unsafe.Add(ref refA, 0) = 100;          // 等同 refA = 100
Console.WriteLine($"  Unsafe 修改后 a = {a}");

long longVal = 0x00000000_00000041L;     // 0x41 = 'A'
ref byte firstByte = ref Unsafe.As<long, byte>(ref longVal);  // 重解释
Console.WriteLine($"  long 0x41 的首字节: {(char)firstByte} (ASCII 'A')");

// === 10. 实战：用 Span + ArrayPool 写高性能解析器 ===
Console.WriteLine("\\n=== 实战：CSV 行解析 ===");
char[] csvBuf = ArrayPool<char>.Shared.Rent(256);
try
{
    "Alice,30,Engineer".AsSpan().CopyTo(csvBuf);
    ReadOnlySpan<char> csv = csvBuf.AsSpan(0, 19);

    int p = 0;
    while (p < csv.Length)
    {
        int comma = csv[p..].IndexOf(',');
        if (comma < 0) { Console.WriteLine($"  字段: {csv[p..].ToString()}"); break; }
        Console.WriteLine($"  字段: {csv[p..(p + comma)].ToString()}");
        p += comma + 1;
    }
}
finally
{
    ArrayPool<char>.Shared.Return(csvBuf);
}

// ============ 异步方法 ============
async Task ProcessAsync(Memory<int> mem)
{
    await Task.Delay(10);  // 模拟 IO
    Span<int> s = mem.Span;  // Memory → Span（在 await 之后才用 Span）
    for (int i = 0; i < s.Length; i++) s[i] *= 2;
}`,
    lang: 'cs',
  },

  // ============================================================
  // 第六十七章：ref struct 与 ref readonly
  // ============================================================
  {
    id: 'csharp4-ch67',
    group: '第十一部分 内存管理与性能',
    icon: '📊',
    title: 'ref struct 与 ref readonly',
    content: `## 第六十七章　ref struct 与 ref readonly

上一章我们用 \`Span<T>\` 时反复提到一个概念：**ref struct**。本章深入这套「按引用语义」的类型系统——它是 C# 性能编程的底层语法基础。

### 一、为什么需要 ref struct？⭐

普通 struct 是**值类型**，赋值时整体拷贝。但 \`Span<T>\` 这种「持有引用」的类型如果被拷贝，会有两个 Span 指向同一块内存，且生命周期不一致——**无法保证引用的有效性**。

\`ref struct\`（C# 7.2）是特殊的 struct：

- **只能存在于栈上**（或嵌入其他 ref struct）。
- 编译器**禁止任何让它进堆的操作**（装箱、作字段、跨 await）。
- 因此它的引用保证「不会比被引用的内存活得更久」。

这是 \`Span<T>\` 安全性的根本保证。

### 二、声明 ref struct

\`\`\`csharp
public ref struct MyRefStruct
{
    public Span<int> Data;  // ref struct 可以持有 Span
    public MyRefStruct(Span<int> data) => Data = data;
}
\`\`\`

### 三、ref struct 的限制

| 操作 | 允许? |
| --- | --- |
| 装箱为 \`object\` / 接口 | ❌ |
| 作为 class 字段 | ❌ |
| 作为普通 struct 字段 | ❌ |
| 跨 \`await\` 持有 | ❌ |
| 跨 \`yield return\` | ❌ |
| 在 lambda / local function 中捕获 | ❌ |
| 实现接口（C# 11 前） | ❌ |
| 作为 ref struct 字段 | ✅ |
| 作为方法参数 / 返回值 | ✅ |

### 四、readonly ref struct

加 \`readonly\` 让 ref struct 不可变：

\`\`\`csharp
public readonly ref struct ReadOnlyView
{
    public ReadOnlySpan<byte> Data { get; }
    public ReadOnlyView(ReadOnlySpan<byte> data) => Data = data;
}
\`\`\`

\`ReadOnlySpan<T>\` 本身就是 \`readonly ref struct\`。

### 五、ref 字段（C# 11+）

C# 11 起，ref struct 内部可以声明 **\`ref\` 字段**：

\`\`\`csharp
public ref struct RefField<T>
{
    private ref T _value;  // 持有对 T 的引用（不是值）
    public RefField(ref T value) => _value = ref value;
    public ref T Value => ref _value;
}
\`\`\`

这让 ref struct 可以「持有对某个变量/数组元素的引用」，避免拷贝。

### 六、in 参数（ref readonly 参数）

\`in\` 修饰符 = \`ref readonly\`：按引用传递，但**只读**。

\`\`\`csharp
void Print(in BigStruct s)  // 不拷贝，但不能改
{
    // s.X = 1;  // 编译错误：in 参数只读
    Console.WriteLine(s.X);
}
\`\`\`

适合传大 struct 避免拷贝。⚠ 注意：调用方可能需要写 \`in\` 显式标注（编译器通常能推断）。

### 七、ref 返回（ref return）

方法可以返回**对变量的引用**，而非值的拷贝：

\`\`\`csharp
private int[] _data = { 1, 2, 3, 4, 5 };
public ref int this[int i] => ref _data[i];  // 索引器返回引用

// 调用方：
var obj = new Container();
obj[0] = 99;  // 直接修改 _data[0]，因为是 ref 返回
\`\`\`

\`CollectionsMarshal.AsSpan\`、\`Unsafe.Add\` 等大量 API 都靠 ref 返回实现零拷贝访问。

### 八、scoped 修饰符（C# 11）

\`scoped\` 显式声明一个 ref/ref struct **不能逃出当前方法**：

\`\`\`csharp
Span<int> M(scoped Span<int> param)
{
    // 不能 return param;  ← scoped 禁止逃逸
    return new[] { 1, 2, 3 };
}
\`\`\`

\`scoped\` 是 C# 11 ref 安全上下文系统的核心，让编译器能更精细地分析引用安全性。还有 \`scoped ref\`、\`ref scoped\` 等组合。

### 九、ref 安全上下文（Ref Safety Context）

C# 11 重构了「ref 安全」规则，三级上下文：

- **return-only**：可作返回值。
- **caller-context**：与调用者同寿命。
- **function-context**（scoped）：仅当前方法内有效。

编译器据此判断「这个 ref 是否能逃逸」，从而允许更多场景，同时保持安全。

### 十、UnmanagedCallersOnly（C# 9+）

\`[UnmanagedCallersOnly]\` 标注的方法可被 native 代码直接调用，无需 P/Invoke 反向 thunk：

\`\`\`csharp
[UnmanagedCallersOnly(CallConvs = new[] { typeof(CallConvCdecl) })]
static int MyCallback(int a, int b) => a + b;
\`\`\`

参数必须全为 blittable（int、指针等）。常用于 native 回调场景（如 OpenGL、原生 UI 库）。

### 十一、nint / nuint（C# 9+）

\`nint\`（NativeInt）/ \`nuint\`（NativeUInt）是平台相关的整数：

- 32 位进程：32 位整数。
- 64 位进程：64 位整数。

本质是 \`IntPtr\` / \`UIntPtr\` 的语法糖，但支持算术运算：

\`\`\`csharp
nint a = 100;
nint b = a * 2;
IntPtr p = a;  // 隐式转换
\`\`\`

写跨平台 native 互操作时常用。

### 十二、Unsafe 类

\`System.Runtime.CompilerServices.Unsafe\` 提供大量底层指针操作：

- \`Unsafe.As<TFrom, TTo>(ref)\`：引用重解释。
- \`Unsafe.Add<T>(ref, int)\`：引用偏移（不检查边界）。
- \`Unsafe.ReadUnaligned<T>(ref byte)\`：不对齐读取。
- \`Unsafe.SizeOf<T>()\`：含 padding 的大小。
- \`Unsafe.ByteOffset<T>\`：两引用间字节距离。

### 十三、GCHandle.Alloc / Pinned

固定托管对象，让 GC 不能移动它：

\`\`\`csharp
int[] arr = { 1, 2, 3 };
GCHandle handle = GCHandle.Alloc(arr, GCHandleType.Pinned);
try
{
    IntPtr ptr = handle.AddrOfPinnedObject();
    // 把 ptr 传给 native 代码
}
finally
{
    handle.Free();  // 必须释放，否则永远固定
}
\`\`\`

更常用的是 \`fixed\` 语句和 \`GC.AllocateArray(pinned: true)\`，GCHandle 适合需要长期固定且不在 fixed 块内的场景。

### 十四、本章小结

- \`ref struct\` 只能存在于栈，是 \`Span<T>\` 安全性的根基。
- \`readonly ref struct\` = 不可变版本。
- C# 11 \`ref\` 字段让 ref struct 持有引用而非值。
- \`in\` 参数按引用传值且只读，传大 struct 时用。
- \`ref return\` 让方法返回可写引用，零拷贝修改。
- \`scoped\` 显式禁止 ref 逃逸，C# 11 安全上下文让规则更精细。
- \`nint\` / \`UnmanagedCallersOnly\` 服务于 native 互操作。
- \`Unsafe\` 类提供底层指针操作，写底层库必备。`,
    code: `// C# 12 顶级语句 —— ref struct / ref readonly / ref 字段 / scoped / nint 全套演示
using System;
using System.Diagnostics;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Text;

// === 1. 自定义 ref struct：基于 Span<char> 的 StringBuilder 替代品 ===
Console.WriteLine("=== ref struct ValueStringBuilder ===");
Span<char> initialBuf = stackalloc char[64];
ValueStringBuilder sb = new(initialBuf);
sb.Append("Hello, ");
sb.Append("World!");
sb.Append(' ');
sb.Append(2026);
Console.WriteLine($"  结果: {sb.ToString()}");
Console.WriteLine($"  长度: {sb.Length}");

// === 2. ref 字段：持有对变量的引用 ===
Console.WriteLine("\\n=== ref 字段演示 ===");
int num = 10;
RefHolder<int> holder = new(ref num);
holder.Value = 999;  // 直接改外部变量
Console.WriteLine($"  外部 num = {num} (应是 999)");

// === 3. in 参数：按引用传递大 struct ===
Console.WriteLine("\\n=== in 参数 ===");
BigVector vec = new() { X = 1.5, Y = 2.5, Z = 3.5 };
PrintVector(in vec);  // 不拷贝整个 struct

// === 4. ref 返回：直接修改内部数据 ===
Console.WriteLine("\\n=== ref 返回 ===");
Container container = new();
container[0] = 100;  // 通过 ref 返回直接改内部数组
container[1] = 200;
Console.WriteLine($"  container[0] = {container[0]}, [1] = {container[1]}");

// === 5. scoped 修饰符 ===
Console.WriteLine("\\n=== scoped 修饰符 ===");
Span<int> local = stackalloc int[] { 1, 2, 3 };
ProcessScoped(local);
Console.WriteLine($"  scoped 处理后: {local[0]}, {local[1]}, {local[2]}");

// === 6. nint 平台相关整数 ===
Console.WriteLine("\\n=== nint ===");
nint native = 0x1000_0000;
nint shifted = native >> 4;
Console.WriteLine($"  nint = {native} (0x{native:X})");
Console.WriteLine($"  nint >> 4 = {shifted} (0x{shifted:X})");
Console.WriteLine($"  IntPtr.Size = {IntPtr.Size} 字节 ({(IntPtr.Size == 8 ? "64 位" : "32 位")}进程)");

// 指针算术（nint 支持）
int[] arr = { 10, 20, 30, 40, 50 };
ref int second = ref Unsafe.Add(ref arr[0], 1);  // 等同 &arr[1]
Console.WriteLine($"  Unsafe.Add 取得 arr[1] = {second}");
second = 999;
Console.WriteLine($"  修改后 arr[1] = {arr[1]}");

// === 7. GCHandle 固定对象 ===
Console.WriteLine("\\n=== GCHandle 固定对象 ===");
byte[] pinnedArr = { 0xAA, 0xBB, 0xCC, 0xDD };
GCHandle handle = GCHandle.Alloc(pinnedArr, GCHandleType.Pinned);
try
{
    IntPtr ptr = handle.AddrOfPinnedObject();
    Console.WriteLine($"  固定后地址: 0x{ptr:X}");
    Console.WriteLine($"  第一字节: 0x{Marshal.ReadByte(ptr):X2}");
}
finally
{
    handle.Free();  // 必须释放
    Console.WriteLine("  已释放 GCHandle");
}

// === 8. UnmanagedCallersOnly（需 AOT / 函数指针场景，这里只展示签名）===
Console.WriteLine("\\n=== UnmanagedCallersOnly 签名演示 ===");
Console.WriteLine("  方法已定义，通常用于 native 回调场景");

// === 9. 性能对比：ref struct vs string ===
Console.WriteLine("\\n=== 性能对比 ===");
var sw = Stopwatch.StartNew();
long memBefore = GC.GetAllocatedBytesForCurrentThread();

// 用 ref struct 拼 10w 次
for (int i = 0; i < 100_000; i++)
{
    Span<char> buf = stackalloc char[64];
    ValueStringBuilder vsb = new(buf);
    vsb.Append("id=");
    vsb.Append(i);
    vsb.Append(";name=test");
    _ = vsb.Length;
}
long memRefStruct = GC.GetAllocatedBytesForCurrentThread() - memBefore;
sw.Stop();
Console.WriteLine($"  ValueStringBuilder 10w 次: {sw.ElapsedMilliseconds} ms, 分配 {memRefStruct} bytes");

sw.Restart();
memBefore = GC.GetAllocatedBytesForCurrentThread();
for (int i = 0; i < 100_000; i++)
{
    _ = "id=" + i + ";name=test";  // 每次都分配新字符串
}
long memConcat = GC.GetAllocatedBytesForCurrentThread() - memBefore;
sw.Stop();
Console.WriteLine($"  string 拼接 10w 次: {sw.ElapsedMilliseconds} ms, 分配 {memConcat:N0} bytes");

// ============== 类型定义区 ==============

// 自定义 ref struct：基于 Span<char> 的高性能字符串构建器
ref struct ValueStringBuilder
{
    private Span<char> _buffer;   // 当前缓冲区
    private int _length;          // 已用长度

    public ValueStringBuilder(Span<char> initialBuffer)
    {
        _buffer = initialBuffer;
        _length = 0;
    }

    public int Length => _length;

    public void Append(ReadOnlySpan<char> value)
    {
        if (_length + value.Length > _buffer.Length)
            throw new InvalidOperationException("缓冲区溢出（演示版未实现扩容）");
        value.CopyTo(_buffer[_length..]);
        _length += value.Length;
    }

    public void Append(char c)
    {
        if (_length >= _buffer.Length) throw new InvalidOperationException("缓冲区溢出");
        _buffer[_length++] = c;
    }

    public void Append(int value)
    {
        // 用 TryFormat 零分配格式化
        if (value.TryFormat(_buffer[_length..], out int written))
            _length += written;
    }

    public override string ToString() => _buffer[.._length].ToString();
}

// ref 字段演示：C# 11+ 持有对 T 的引用
ref struct RefHolder<T>
{
    private ref T _value;  // C# 11 ref 字段

    public RefHolder(ref T value)
    {
        _value = ref value;  // 引用赋值，不拷贝
    }

    public ref T Value
    {
        get => ref _value;   // ref 返回
        set => _value = ref value;  // ref 赋值
    }
}

// in 参数演示用的大 struct
struct BigVector
{
    public double X, Y, Z;
    public double M1, M2, M3, M4, M5, M6, M7, M8, M9;  // 故意撑大
}

static class Helpers
{
    // in 参数：按引用传，避免拷贝大 struct
    public static void PrintVector(in BigVector v)
    {
        Console.WriteLine($"  X={v.X}, Y={v.Y}, Z={v.Z}（in 参数未拷贝）");
    }

    // scoped：禁止 Span 逃逸出方法
    public static void ProcessScoped(scoped Span<int> data)
    {
        for (int i = 0; i < data.Length; i++)
            data[i] *= 10;
        // 不能 return data;  ← scoped 禁止
    }
}

// ref 返回演示：索引器返回引用
class Container
{
    private int[] _data = new int[10];

    // ref 返回的索引器，调用方可直接修改 _data[i]
    public ref int this[int i] => ref _data[i];

    public ref int GetRef(int i) => ref _data[i];  // 普通方法也可 ref 返回
}

// UnmanagedCallersOnly：native 回调函数
// （注意：在顶级语句文件里通常用 delegate* 函数指针调用，这里只展示声明）
static class NativeCallbacks
{
    [UnmanagedCallersOnly(CallConvs = new[] { typeof(System.Runtime.CompilerServices.CallConvCdecl) })]
    public static int AddNumbers(int a, int b)
    {
        return a + b;
    }
}`,
    lang: 'cs',
  },

  // ============================================================
  // 第六十八章：性能优化技巧
  // ============================================================
  {
    id: 'csharp4-ch68',
    group: '第十一部分 内存管理与性能',
    icon: '🚀',
    title: '性能优化技巧',
    content: `## 第六十八章　性能优化技巧

写代码「能跑」和「跑得快」是两码事。本章总结 .NET 8 / C# 12 性能优化的**高频技巧**与**常见反模式**，让你写出少分配、少 GC、少拷贝的代码。

### 一、先测量，再优化 ⭐

性能优化第一原则：**不要猜，先测**。靠直觉优化经常南辕北辙。

- \`Stopwatch\`：简单计时。
- \`BenchmarkDotNet\`：业界标准，自动多次运行、预热、统计、对比。
- \`dotnet-counters\`：运行时查看 GC、CPU、内存指标。
- \`dotnet-trace\`：采样性能 trace。
- \`Visual Studio Profiler\` / \`PerfView\`：CPU/内存火焰图。

\`BenchmarkDotNet\` 示例：

\`\`\`csharp
[MemoryDiagnoser]  // 显示分配量
public class MyBench
{
    [Benchmark]
    public string Concat() => "a" + 1 + "b";

    [Benchmark]
    public string StringCreate() => string.Create(3, 0, static (s, _) =>
    {
        s[0] = 'a'; s[1] = '1'; s[2] = 'b';
    });
}
\`\`\`

### 二、常见性能反模式

#### 反模式 1：循环里字符串拼接

\`\`\`csharp
string s = "";
for (int i = 0; i < 1000; i++)
    s += i.ToString();  // 每次 new 一个 string，O(n²)
\`\`\`

修复：\`StringBuilder\` 或 \`string.Concat\` / \`string.Join\`。

#### 反模式 2：不必要的装箱

\`\`\`csharp
ArrayList list = new();  // 非泛型，Add(object) 装箱
list.Add(1);  // int → object 装箱，分配
\`\`\`

修复：用 \`List<int>\`。

#### 反模式 3：LINQ 滥用

\`\`\`csharp
list.Where(x => x > 0).Select(x => x * 2).Sum();
\`\`\`

LINQ 在热路径上会分配委托、迭代器、闭包。能写 \`for\` 循环就别用 LINQ。

#### 反模式 4：频繁分配临时数组

\`\`\`csharp
byte[] buf = new byte[1024];  // 每次调用都 new
\`\`\`

修复：\`ArrayPool<byte>.Shared.Rent\`。

#### 反模式 5：闭包捕获局部变量

\`\`\`csharp
list.Where(x => x > threshold);  // lambda 捕获 threshold → 生成闭包类 + 分配
\`\`\`

修复：\`static\` lambda（C# 9+）+ 把变量提到方法参数。

### 三、性能优化技巧清单

#### 技巧 1：StringBuilder（适度）

\`\`\`csharp
var sb = new StringBuilder();
for (int i = 0; i < 1000; i++) sb.Append(i);
string result = sb.ToString();
\`\`\`

适合长度未知的字符串构造。**已知长度**用 \`string.Create\` 更快。

#### 技巧 2：string.Concat / string.Join

\`\`\`csharp
string.Join(',', new[] { 1, 2, 3 });  // "1,2,3"
string.Concat("a", "b", "c");          // "abc"
\`\`\`

#### 技巧 3：Span + stackalloc

热路径缓冲用 \`stackalloc\`，零 GC 压力（详见第 66 章）。

#### 技巧 4：ArrayPool

热路径大数组用 \`ArrayPool<T>.Shared.Rent/Return\`（详见第 66 章）。

#### 技巧 5：String.Create

\`\`\`csharp
string s = string.Create(7, 123, static (span, val) =>
{
    "id=".AsSpan().CopyTo(span);
    val.TryFormat(span[3..], out _);
});
// "id=123"
\`\`\`

直接在新 string 的内存上写，零中间分配。

#### 技巧 6：CollectionsMarshal.AsSpan

绕过 List 索引器边界检查（详见第 66 章）。

#### 技巧 7：static lambda（C# 9+）

\`\`\`csharp
list.Where(static x => x > 0);  // static 修饰符禁止捕获，无闭包分配
\`\`\`

#### 技巧 8：避免委托闭包

\`\`\`csharp
// 坏：每次 new Predicate<int>，闭包捕获 threshold
bool Filter(int x) => x > threshold;
list.Find(Filter);

// 好：把 threshold 作为字段或显式参数
\`\`\`

#### 技巧 9：ObjectPool<T>（Microsoft.Extensions.ObjectPool）

\`\`\`csharp
var pool = new DefaultObjectPool<StringBuilder>(
    new DefaultPooledObjectPolicy<StringBuilder>());
var sb = pool.Get();
try { sb.Append("..."); /* use */ }
finally { pool.Return(sb); sb.Clear(); }
\`\`\`

适合频繁创建/销毁的对象（StringBuilder、DbContext 等可复用对象）。

#### 技巧 10：值类型替代引用类型

小型、短生命周期数据用 struct 避免堆分配：

\`\`\`csharp
struct Point { public int X, Y; }  // 在栈上，无 GC
\`\`\`

但**别盲目**——大 struct 拷贝开销可能超过 GC 节省。

### 四、Bit Tricks：位运算替代算术

- \`x & (n - 1)\` 替代 \`x % n\`（当 n 是 2 的幂）。
- \`x << 3\` 替代 \`x * 8\`。
- \`x >> 1\` 替代 \`x / 2\`。
- \`BitOperations.Log2\` / \`LeadingZeroCount\` / \`PopCount\`（.NET Core 3+ 内联硬件指令）。

\`\`\`csharp
int nextPow2 = 1 << (32 - BitOperations.LeadingZeroCount((uint)x));
int popcount = BitOperations.PopCount(0b1011_0110);  // 6
\`\`\`

### 五、SIMD：向量指令

\`System.Numerics\` 提供 SIMD 类型：

- \`Vector<T>\`：平台相关长度（128/256 位）。
- \`Vector128<T>\` / \`Vector256<T>\`：固定长度。
- \`Vector512<T>\`（.NET 8+）：512 位 AVX-512。

\`\`\`csharp
Vector<int> a = new(new[] { 1, 2, 3, 4, 5, 6, 7, 8 });
Vector<int> b = new(new[] { 10, 20, 30, 40, 50, 60, 70, 80 });
Vector<int> sum = a + b;  // 一次处理 8 个 int
\`\`\`

适合图像处理、数值计算、密码学。.NET 会自动用硬件指令（SSE/AVX）。

### 六、内存对齐

\`MemoryMarshal.Read<T>\` / \`Write<T>\` 假设数据对齐，不对齐会异常或慢。\`StructLayout\` 控制字段布局：

\`\`\`csharp
[StructLayout(LayoutKind.Sequential, Pack = 1)]
struct Header { public int Id; public byte Type; }  // Pack=1 紧凑布局
\`\`\`

### 七、MemoryMarshal

- \`MemoryMarshal.Read<T>(ReadOnlySpan<byte>)\`：从字节 Span 读结构。
- \`MemoryMarshal.Write<T>(Span<byte>, in T)\`：写结构到字节 Span。
- \`MemoryMarshal.AsBytes<T>(ReadOnlySpan<T>)\`：把 struct Span 重解释为 byte Span。
- \`MemoryMarshal.Cast<TFrom, TTo>(...)\`：类型重解释。

### 八、Hot Path 优化原则

热路径（每秒调用上万次的代码）每个 CPU 周期都重要：

1. **少分配**：分配 = 后续 GC = 暂停。
2. **少虚方法**：虚方法调用有 vtable 查找。
3. **少接口调用**：编译器可能无法内联。
4. **少 LINQ**：循环 + 直接索引更快。
5. **少 try/catch**：try 块本身几乎免费，但 catch 影响内联。
6. **分支预测友好**：常见分支放前面。

### 九、AOT vs JIT

- **JIT（默认）**：运行时编译，可基于运行时数据优化（PGO .NET 6+），但启动慢。
- **NativeAOT（.NET 8 GA）**：编译时生成原生代码，启动快、内存小、易部署容器。
  - 限制：反射受限、动态 assembly 不支持、文件稍大。
  - 适合云函数、CLI 工具、微服务启动敏感场景。

性能对比（典型）：

| 指标 | JIT | NativeAOT |
| --- | --- | --- |
| 启动时间 | 慢 | 快 |
| 长期吞吐 | 略优（PGO） | 略低 |
| 内存占用 | 大 | 小 |
| 反射 | 完整 | 受限 |

### 十、本章小结

- **先测后优**，用 \`BenchmarkDotNet\` 拿数据说话。
- 少分配、少拷贝、少虚方法是热路径优化主线。
- \`Span\` / \`stackalloc\` / \`ArrayPool\` / \`string.Create\` 是零分配四件套。
- \`static\` lambda 避免闭包分配。
- \`ObjectPool<T>\` 复用昂贵对象。
- 位运算 / \`BitOperations\` / \`Vector<T>\` SIMD 加速数值计算。
- NativeAOT 适合启动敏感场景，但有反射限制。`,
    code: `// C# 12 顶级语句 —— 性能优化技巧对比演示
using System;
using System.Buffers;
using System.Diagnostics;
using System.Numerics;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Text;
using Microsoft.Extensions.ObjectPool;

// === 1. 字符串拼接性能对比 ===
Console.WriteLine("=== 字符串拼接性能对比 ===");
const int N = 10_000;

// (1) + 拼接：最慢，O(n²) 分配
var sw = Stopwatch.StartNew();
long memBefore = GC.GetAllocatedBytesForCurrentThread();
{
    string s = "";
    for (int i = 0; i < N; i++) s += i.ToString() + ",";
}
long memConcat = GC.GetAllocatedBytesForCurrentThread() - memBefore;
sw.Stop();
Console.WriteLine($"  + 拼接 {N} 次: {sw.ElapsedMilliseconds} ms, 分配 {memConcat:N0} bytes");

// (2) StringBuilder：经典优化
sw.Restart();
memBefore = GC.GetAllocatedBytesForCurrentThread();
{
    var sb = new StringBuilder();
    for (int i = 0; i < N; i++) sb.Append(i).Append(',');
    _ = sb.ToString();
}
long memSB = GC.GetAllocatedBytesForCurrentThread() - memBefore;
sw.Stop();
Console.WriteLine($"  StringBuilder {N} 次: {sw.ElapsedMilliseconds} ms, 分配 {memSB:N0} bytes");

// (3) string.Join：内部一次性计算长度，最省
sw.Restart();
memBefore = GC.GetAllocatedBytesForCurrentThread();
{
    var nums = new int[N];
    for (int i = 0; i < N; i++) nums[i] = i;
    _ = string.Join(',', nums);
}
long memJoin = GC.GetAllocatedBytesForCurrentThread() - memBefore;
sw.Stop();
Console.WriteLine($"  string.Join {N} 次: {sw.ElapsedMilliseconds} ms, 分配 {memJoin:N0} bytes");

// === 2. LINQ vs for 循环 ===
Console.WriteLine("\\n=== LINQ vs for 循环 ===");
int[] data = new int[100_000];
for (int i = 0; i < data.Length; i++) data[i] = i;

sw.Restart();
long sumLinq = data.Where(x => x > 0).Select(x => x * 2).Sum();
sw.Stop();
Console.WriteLine($"  LINQ: {sw.ElapsedMilliseconds} ms, sum={sumLinq}");

sw.Restart();
long sumLoop = 0;
for (int i = 0; i < data.Length; i++)
{
    if (data[i] > 0) sumLoop += data[i] * 2;
}
sw.Stop();
Console.WriteLine($"  for 循环: {sw.ElapsedMilliseconds} ms, sum={sumLoop}");

// === 3. 装箱 vs 泛型 ===
Console.WriteLine("\\n=== 装箱 vs 泛型 ===");
sw.Restart();
memBefore = GC.GetAllocatedBytesForCurrentThread();
System.Collections.ArrayList list1 = new();
for (int i = 0; i < 10_000; i++) list1.Add(i);  // 装箱
long memBoxed = GC.GetAllocatedBytesForCurrentThread() - memBefore;
sw.Stop();
Console.WriteLine($"  ArrayList（装箱）: {sw.ElapsedMilliseconds} ms, 分配 {memBoxed:N0} bytes");

sw.Restart();
memBefore = GC.GetAllocatedBytesForCurrentThread();
List<int> list2 = new();
for (int i = 0; i < 10_000; i++) list2.Add(i);  // 无装箱
long memGeneric = GC.GetAllocatedBytesForCurrentThread() - memBefore;
sw.Stop();
Console.WriteLine($"  List<int>（无装箱）: {sw.ElapsedMilliseconds} ms, 分配 {memGeneric:N0} bytes");

// === 4. ArrayPool 复用 ===
Console.WriteLine("\\n=== ArrayPool 复用 ===");
sw.Restart();
memBefore = GC.GetAllocatedBytesForCurrentThread();
for (int i = 0; i < 1_000; i++)
{
    byte[] buf = ArrayPool<byte>.Shared.Rent(1024);
    try { buf.AsSpan(0, 1024).Fill(0xFF); }
    finally { ArrayPool<byte>.Shared.Return(buf); }
}
long memPool = GC.GetAllocatedBytesForCurrentThread() - memBefore;
sw.Stop();
Console.WriteLine($"  ArrayPool 1000 次: {sw.ElapsedMilliseconds} ms, 分配 {memPool:N0} bytes");

sw.Restart();
memBefore = GC.GetAllocatedBytesForCurrentThread();
for (int i = 0; i < 1_000; i++)
{
    byte[] buf = new byte[1024];  // 每次都 new
    buf.AsSpan().Fill(0xFF);
}
long memNew = GC.GetAllocatedBytesForCurrentThread() - memBefore;
sw.Stop();
Console.WriteLine($"  new byte[1024] 1000 次: {sw.ElapsedMilliseconds} ms, 分配 {memNew:N0} bytes");

// === 5. static lambda 避免闭包 ===
Console.WriteLine("\\n=== static lambda ===");
int threshold = 500;

// 非 static lambda 捕获 threshold → 生成闭包类，每次调用分配
sw.Restart();
memBefore = GC.GetAllocatedBytesForCurrentThread();
for (int i = 0; i < 100_000; i++)
{
    _ = data.Where(x => x > threshold).FirstOrDefault();
}
long memClosure = GC.GetAllocatedBytesForCurrentThread() - memBefore;
sw.Stop();
Console.WriteLine($"  非 static lambda: {sw.ElapsedMilliseconds} ms, 分配 {memClosure:N0} bytes");

// static lambda 不捕获，无闭包
sw.Restart();
memBefore = GC.GetAllocatedBytesForCurrentThread();
for (int i = 0; i < 100_000; i++)
{
    _ = data.Where(static x => x > 500).FirstOrDefault();
}
long memStatic = GC.GetAllocatedBytesForCurrentThread() - memBefore;
sw.Stop();
Console.WriteLine($"  static lambda: {sw.ElapsedMilliseconds} ms, 分配 {memStatic:N0} bytes");

// === 6. ObjectPool<StringBuilder> ===
Console.WriteLine("\\n=== ObjectPool 复用对象 ===");
var sbPool = new DefaultObjectPool<StringBuilder>(
    new DefaultPooledObjectPolicy<StringBuilder>(), maximumRetained: 16);

sw.Restart();
memBefore = GC.GetAllocatedBytesForCurrentThread();
for (int i = 0; i < 10_000; i++)
{
    var sb = sbPool.Get();
    try
    {
        sb.Append("iter=").Append(i);
        _ = sb.ToString();
    }
    finally { sb.Clear(); sbPool.Return(sb); }
}
long memObjPool = GC.GetAllocatedBytesForCurrentThread() - memBefore;
sw.Stop();
Console.WriteLine($"  ObjectPool: {sw.ElapsedMilliseconds} ms, 分配 {memObjPool:N0} bytes");

// === 7. SIMD 向量计算 ===
Console.WriteLine("\\n=== SIMD 向量计算 ===");
int[] vecA = new int[1024];
int[] vecB = new int[1024];
int[] vecResult = new int[1024];
for (int i = 0; i < vecA.Length; i++) { vecA[i] = i; vecB[i] = i * 2; }

// 标量循环
sw.Restart();
for (int i = 0; i < vecA.Length; i++) vecResult[i] = vecA[i] + vecB[i];
sw.Stop();
Console.WriteLine($"  标量加法 1024 元素: {sw.ElapsedTicks} ticks");

// SIMD：Vector<int> 一次处理多个
sw.Restart();
ReadOnlySpan<int> sa = vecA;
ReadOnlySpan<int> sb2 = vecB;
Span<int> sr = vecResult;
int vectorSize = Vector<int>.Count;  // 通常 8（256 位 AVX2）
int iVec;
for (iVec = 0; iVec + vectorSize <= sa.Length; iVec += vectorSize)
{
    Vector<int> va = new(sa.Slice(iVec, vectorSize));
    Vector<int> vb = new(sb2.Slice(iVec, vectorSize));
    (va + vb).CopyTo(sr.Slice(iVec, vectorSize));
}
// 处理尾部不足一个向量的部分
for (; iVec < sa.Length; iVec++) sr[iVec] = sa[iVec] + sb2[iVec];
sw.Stop();
Console.WriteLine($"  SIMD 加法 1024 元素: {sw.ElapsedTicks} ticks (Vector<int>.Count={vectorSize})");

// === 8. BitOperations 位运算 ===
Console.WriteLine("\\n=== BitOperations 位运算 ===");
uint val = 0b1011_0110;
Console.WriteLine($"  PopCount(0b1011_0110) = {BitOperations.PopCount(val)} (1 的个数)");
Console.WriteLine($"  LeadingZeroCount = {BitOperations.LeadingZeroCount(val)}");
Console.WriteLine($"  Log2(1024) = {BitOperations.Log2(1024u)}");
Console.WriteLine($"  IsPow2(1024) = {BitOperations.IsPow2(1024u)}");
Console.WriteLine($"  RoundUpPow2(1000) = {BitOperations.RoundUpToPowerOf2(1000u)}");

// === 9. MemoryMarshal 读写 ===
Console.WriteLine("\\n=== MemoryMarshal ===");
Span<byte> bytes = stackalloc byte[8];
int value = 0x78563412;
MemoryMarshal.Write(bytes, in value);  // 写 int 到 byte span
Console.WriteLine($"  写 int 0x{value:X8} 后字节: {BitConverter.ToString(bytes.ToArray())}");
int readBack = MemoryMarshal.Read<int>(bytes);
Console.WriteLine($"  读回: 0x{readBack:X8}");

// 把 int[] 重解释为 byte[]，零拷贝
int[] ints = { 1, 2, 3, 4 };
ReadOnlySpan<byte> asBytes = MemoryMarshal.AsBytes<int>(ints);
Console.WriteLine($"  4 个 int 重解释为 {asBytes.Length} 字节");

// === 10. String.Create vs StringBuilder ===
Console.WriteLine("\\n=== String.Create ===");
sw.Restart();
memBefore = GC.GetAllocatedBytesForCurrentThread();
for (int i = 0; i < 100_000; i++)
{
    // 已知长度，直接在新 string 内存上写
    _ = string.Create(6, i, static (span, val) =>
    {
        span[0] = 'i';
        span[1] = 'd';
        span[2] = '=';
        val.TryFormat(span[3..], out _);
    });
}
long memCreate = GC.GetAllocatedBytesForCurrentThread() - memBefore;
sw.Stop();
Console.WriteLine($"  string.Create 10w 次: {sw.ElapsedMilliseconds} ms, 分配 {memCreate:N0} bytes");

Console.WriteLine("\\n=== 性能优化演示完成 ===");
Console.WriteLine("提示：以上为示意性测量，正式基准测试请用 BenchmarkDotNet");`,
    lang: 'cs',
  },
];

export { chapters };
