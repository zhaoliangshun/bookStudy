// =============================================================
// C# 从零基础到生产上线（2026 完整版）
// csharp5 专属内容：前言 + 24 个生产进阶章节 + 结语
// -------------------------------------------------------------
// 正文以 .NET 10 LTS / C# 14 为生产基线。
// 主 demo 使用 net8.0 / C# 12 兼容语法，确保当前在线运行器可执行。
// =============================================================

export const csharp5ProductionGroups = [
  "第十五部分 团队工程与高级语言",
  "第十六部分 数据与分布式系统",
  "第十七部分 云原生、交付与可靠性",
  "第十八部分 平台拓展与毕业实战",
];

export const csharp5Preface = {
  id: "csharp5-preface",
  group: "开篇",
  icon: "📕",
  title: "前言：从会写代码到能负责生产系统",
  content: `## 前言：从会写代码到能负责生产系统

### 这套教程要解决什么问题

很多教程在 Hello World、语法和简单 CRUD 处结束，但生产开发还要求你处理并发、失败、权限、数据一致性、部署、监控和事故。本教程把这些内容放进一条连续学习路线：

1. **语言基本功**：类型、面向对象、泛型、集合、LINQ、异步、内存与性能。
2. **应用开发**：配置、依赖注入、HTTP、ASP.NET Core、EF Core、测试。
3. **生产工程**：安全、韧性、缓存、消息、可观测性、容器和 CI/CD。
4. **上线能力**：数据库设计、分布式一致性、云原生、容量、SLO、故障处理与恢复。

全书共 **128 篇（前言 + 126 讲 + 结语）**。每篇都有可运行主 demo。正文里完整的 \`csharp\` 代码块可直接点运行；不完整的真实框架片段会标成 \`csharp-snippet\`，避免把不能编译的示例拿去点运行。涉及 ASP.NET Core、数据库、Redis、消息系统、Docker 或 Kubernetes 的代码，需要在对应真实项目中运行；章末主 demo 用纯 C# 讲清语义。

### 版本边界

- **生产基线**：.NET 10 LTS / C# 14。
- **在线主 demo**：兼容 net8.0 / C# 12，因为当前运行器安装的是 .NET 8 SDK。
- **专属新 API**：C# 13/14、.NET 10、ASP.NET Core、EF Core 等代码会明确标注版本和 NuGet 包。
- **生命周期**：生产必须持续升级补丁版本；.NET 8 与 .NET 9 将于 2026 年 11 月结束支持。

### 学习方法

- 先读概念，再运行、修改 demo，最后脱离示例重写。
- 每完成一个部分，把知识合并进同一个长期项目，不要只积累零散代码。
- 所有“更快”“更安全”“会重试”的结论都要通过基准、威胁模型或故障测试验证。
- 教程不能保证开发永远不出问题；真正的生产能力来自评审、测试、演练、监控和复盘。

### 毕业标准

最后你需要独立交付一个订单服务：真实数据库迁移、认证授权、幂等、Outbox、缓存、可观测性、容器、CI/CD、灰度发布、回滚和恢复演练。只有项目能经受故障注入，才算“能上生产”。`,
  code: `// 前言：生产能力不是「学过」，而是「能证明」。
// 把检查项写成数据，毕业时用同一张清单对照真实仓库、流水线和演练记录。
var capabilities = new[]
{
    new Capability("语言与类型系统", true),
    new Capability("自动化测试", true),
    new Capability("安全与密钥管理", false),
    new Capability("监控、告警与回滚", false),
};

foreach (var item in capabilities)
{
    string state = item.Completed ? "已掌握" : "待学习";
    Console.WriteLine($"[{state}] {item.Name}");
}

int completed = capabilities.Count(static item => item.Completed);
Console.WriteLine($"当前进度：{completed}/{capabilities.Length}");

public sealed record Capability(string Name, bool Completed);
`,
  lang: "cs",
};

export const csharp5ProductionChapters = [
  {
    id: "csharp5-ch92",
    group: "第十五部分 团队工程与高级语言",
    icon: "🌿",
    title: "Git、分支策略与代码评审",
    content: `## 第九十三章　Git、分支策略与代码评审

生产代码是团队长期维护的资产。版本控制不是“会 commit”就结束，还要让变更小、可审查、可回退。

### 一、推荐工作流

\`\`\`bash
git switch -c feat/order-idempotency
git add src tests
git commit -m "feat: make order creation idempotent"
git fetch origin
git rebase origin/main
git push -u origin feat/order-idempotency
\`\`\`

- 主分支保持可发布，短生命周期分支通过 PR 合并。
- 一个提交表达一个完整意图；不要混入格式化全仓库等无关变化。
- 受保护分支要求评审、测试和安全检查通过。
- merge、squash、rebase 都可以，团队要统一并保留可追溯性。

### 二、评审关注顺序

1. 需求和行为是否正确。
2. 授权、数据损坏、并发和失败路径。
3. API/数据库兼容性与回滚。
4. 测试是否证明关键行为。
5. 可读性、命名、重复与性能。

不要只评论空格，也不要用“看起来没问题”代替风险分析。

### 三、提交中不能出现什么

- 密钥、证书私钥、访问令牌和生产数据。
- IDE 缓存、构建输出、日志、dump 和本地数据库。
- 来源不明或许可证不兼容的代码。

发现密钥进入 Git 后，删除文件不够：必须立即吊销/轮换，并按组织流程清理历史。

### 四、Definition of Done

代码、测试、迁移、文档、监控、发布与回滚方案都完成，才能称为完成。高风险变更还应有 feature flag 和演练记录。
`,
    code: `// Git 工作流的核心不是命令，而是合并门禁。
// 构建、测试、安全扫描、评审全部 Passed 才允许进入主分支。
var checks = new[]
{
    new PullRequestCheck("build", CheckState.Passed),
    new PullRequestCheck("tests", CheckState.Passed),
    new PullRequestCheck("security", CheckState.Passed),
    new PullRequestCheck("review", CheckState.Pending),
};

bool mergeable = checks.All(static check => check.State is CheckState.Passed);
foreach (var check in checks)
    Console.WriteLine($"{check.Name,-10} {check.State}");
Console.WriteLine($"允许合并：{mergeable}");

public enum CheckState { Pending, Passed, Failed }
public sealed record PullRequestCheck(string Name, CheckState State);
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch93",
    group: "第十五部分 团队工程与高级语言",
    icon: "🧬",
    title: "高级类型设计与泛型数学",
    content: `## 第九十四章　高级类型设计与泛型数学

类型应让非法状态难以表示。生产模型不要把订单号、金额、邮箱全部退化为 string。

### 一、值对象

- 在构造/工厂处验证不变量。
- record 适合值相等，但可变集合放进 record 仍然可变。
- 金额必须同时包含数值和币种；decimal 适合十进制定点业务，不代表自动解决舍入规则。
- ID 的类型包装可避免把 CustomerId 误传给 OrderId。

### 二、泛型约束

\`\`\`csharp-snippet
static T Max<T>(T left, T right) where T : IComparable<T>
    => left.CompareTo(right) >= 0 ? left : right;
\`\`\`

约束越精确，调用方越安全。不要仅为“可扩展”创建无消费者的泛型抽象。

### 三、泛型数学（.NET 7+）

\`\`\`csharp-snippet
static T Sum<T>(ReadOnlySpan<T> values) where T : INumber<T>
{
    T total = T.Zero;
    foreach (T value in values) total += value;
    return total;
}
\`\`\`

\`INumber<T>\`、static abstract interface members 让算法复用于 int、decimal 等数值类型。通用算法仍要定义溢出、NaN、精度和舍入语义。

### 四、不可变与只读

\`IReadOnlyList<T>\` 只是只读视图，不保证底层不变；真正共享不可变状态可用 ImmutableArray、ImmutableDictionary 或不可变快照。高频只读查找可评估 FrozenDictionary。
`,
    code: `var price = Money.Create(99.90m, "cny");
var shipping = Money.Create(10m, "CNY");
Console.WriteLine(price.Add(shipping));

try
{
    Console.WriteLine(price.Add(Money.Create(5m, "USD")));
}
catch (InvalidOperationException ex)
{
    Console.WriteLine($"拒绝非法运算：{ex.Message}");
}

public readonly record struct Money
{
    public decimal Amount { get; }
    public string Currency { get; }
    private Money(decimal amount, string currency) =>
        (Amount, Currency) = (amount, currency);

    public static Money Create(decimal amount, string currency)
    {
        if (amount < 0) throw new ArgumentOutOfRangeException(nameof(amount));
        if (string.IsNullOrWhiteSpace(currency)) throw new ArgumentException("币种不能为空");
        return new Money(decimal.Round(amount, 2), currency.Trim().ToUpperInvariant());
    }

    public Money Add(Money other) =>
        Currency == other.Currency
            ? Create(Amount + other.Amount, Currency)
            : throw new InvalidOperationException("币种不一致");
}
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch94",
    group: "第十五部分 团队工程与高级语言",
    icon: "🕒",
    title: "时间、时区、全球化与正则",
    content: `## 第九十五章　时间、时区、全球化与正则

时间和文本问题常在上线后才暴露：夏令时、跨时区、土耳其语大小写、Unicode 组合字符和灾难性正则回溯。

### 一、时间类型

- 时间线上的时刻优先用 \`DateTimeOffset\`，存储和传输使用 UTC/ISO 8601。
- \`DateOnly\` 表示生日等日期，\`TimeOnly\` 表示营业时间。
- 当地日历规则需要时区 ID；跨平台部署应测试 IANA/Windows 时区映射。
- 测试通过 \`TimeProvider\` 注入时间，不要到处调用 \`DateTime.Now\`。
- 14 天退款窗口和“下个月同一天”不是同一种时间运算。

### 二、全球化

- 协议、键、标识符比较使用 Ordinal / OrdinalIgnoreCase。
- 面向用户排序、数字和日期使用明确 CultureInfo。
- 金额存储数值+币种，格式化只发生在展示边界。
- string.Length 是 UTF-16 code unit 数，不等于用户看到的字符数；复杂 Unicode 使用 Rune 或文本元素 API。

### 三、正则安全

\`\`\`csharp-snippet
var regex = new Regex(pattern,
    RegexOptions.CultureInvariant,
    matchTimeout: TimeSpan.FromMilliseconds(100));
\`\`\`

不可信模式和输入必须有长度限制与超时。.NET 7+ 可用 \`RegexOptions.NonBacktracking\`，源生成正则 \`[GeneratedRegex]\` 可减少启动和 AOT 问题。
`,
    code: `using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

var instant = DateTimeOffset.Parse(
    "2026-09-11T02:00:00Z",
    CultureInfo.InvariantCulture);
TimeZoneInfo shanghai = TimeZoneInfo.FindSystemTimeZoneById("Asia/Shanghai");
Console.WriteLine(TimeZoneInfo.ConvertTime(instant, shanghai));

string text = "A😀é";
Console.WriteLine($"UTF-16 Length={text.Length}");
Console.WriteLine($"Unicode scalars={text.EnumerateRunes().Count()}");

var safe = new Regex(
    @"^[a-z0-9._-]{3,32}$",
    RegexOptions.IgnoreCase | RegexOptions.CultureInvariant,
    TimeSpan.FromMilliseconds(100));
Console.WriteLine($"用户名合法：{safe.IsMatch("dev_user-01")}");
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch95",
    group: "第十五部分 团队工程与高级语言",
    icon: "🔩",
    title: "Native Interop、unsafe 与内存安全",
    content: `## 第九十六章　Native Interop、unsafe 与内存安全

绝大多数业务代码不需要 unsafe。与操作系统、驱动或 C 库交互时，边界必须小、可测试，并明确所有权。

### 一、P/Invoke

.NET 7+ 优先使用 \`[LibraryImport]\` 源生成封送：

\`\`\`csharp-snippet
internal static partial class NativeMethods
{
    [LibraryImport("mylib", StringMarshalling = StringMarshalling.Utf8)]
    internal static partial int process(ReadOnlySpan<byte> input);
}
\`\`\`

库名、calling convention、字符编码、结构体布局、整数宽度必须与 C ABI 完全一致。跨 Windows/Linux/macOS 做真实集成测试。

### 二、句柄与内存所有权

- 原生句柄使用 SafeHandle，不把裸 IntPtr 扩散到业务层。
- 明确谁分配、谁释放、是否允许跨线程、回调能活多久。
- 固定托管内存只在必要范围内进行；长时间 pin 会妨碍 GC。
- 回调委托必须保持强引用，避免 native 仍调用时被回收。

### 三、unsafe 原则

先使用 Span、Memory、BinaryPrimitives、MemoryMarshal 等安全 API。必须使用指针时，封装成最小方法，验证边界，用 fuzz/property test 和 sanitizer 辅助验证。unsafe 只关闭部分编译器检查，并不会自动更快。
`,
    code: `using System.Buffers.Binary;

// 不使用指针也能高效解析网络协议
byte[] packet =
[
    0x00, 0x00, 0x00, 0x2A, // big-endian id = 42
    0x01, 0xF4              // big-endian amount = 500
];

ReadOnlySpan<byte> data = packet;
int id = BinaryPrimitives.ReadInt32BigEndian(data[..4]);
ushort amount = BinaryPrimitives.ReadUInt16BigEndian(data.Slice(4, 2));

Console.WriteLine($"id={id}, amount={amount}");
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch96",
    group: "第十六部分 数据与分布式系统",
    icon: "🧱",
    title: "关系数据库设计、索引与锁",
    content: `## 第九十七章　关系数据库设计、索引与锁

ORM 不能替代数据库基本功。生产性能和正确性取决于 schema、约束、索引、事务和查询计划。

### 一、Schema 原则

- 主键稳定；外键、唯一约束、NOT NULL、CHECK 在数据库再次保护不变量。
- money 使用 decimal/numeric 明确精度，不使用 float。
- 时间存 UTC 时刻并保留业务所需时区信息。
- 状态字段定义允许集合和迁移策略，不把任意字符串当枚举。

### 二、索引

索引服务于具体查询：等值列通常在前，随后是范围/排序列；include 列可覆盖查询。每个索引都会增加写放大和空间，必须结合执行计划、基数和真实负载验证。

### 三、事务与隔离级别

- Read Committed、Repeatable Read、Snapshot、Serializable 的并发语义不同。
- 更高隔离并非免费，会增加冲突、锁等待或版本存储。
- 事务应短小，不在事务内调用慢外部 HTTP。
- 死锁是正常并发现象：保持访问顺序、缩短事务，并只对整个可重放事务做有限重试。

### 四、分页

大表避免深 OFFSET；使用稳定且唯一的排序键做 keyset pagination：

\`\`\`sql
SELECT id, created_at, total
FROM orders
WHERE (created_at, id) < (@cursor_time, @cursor_id)
ORDER BY created_at DESC, id DESC
LIMIT @take;
\`\`\`
`,
    code: `// 用复合游标模拟 keyset pagination
var orders = Enumerable.Range(1, 12)
    .Select(i => new Order(i, new DateTimeOffset(2026, 9, i, 0, 0, 0, TimeSpan.Zero)))
    .OrderByDescending(static order => order.CreatedAt)
    .ThenByDescending(static order => order.Id)
    .ToList();

var cursor = orders[4];
var nextPage = orders
    .Where(order => order.CreatedAt < cursor.CreatedAt
        || (order.CreatedAt == cursor.CreatedAt && order.Id < cursor.Id))
    .Take(5);

foreach (var order in nextPage)
    Console.WriteLine($"{order.Id}: {order.CreatedAt:yyyy-MM-dd}");

public sealed record Order(int Id, DateTimeOffset CreatedAt);
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch97",
    group: "第十六部分 数据与分布式系统",
    icon: "🪶",
    title: "ADO.NET、Dapper 与数据访问选型",
    content: `## 第九十八章　ADO.NET、Dapper 与数据访问选型

EF Core、Dapper 和 ADO.NET 不是等级关系，而是不同抽象层。

### 一、怎么选

- EF Core：变更跟踪、关系映射、迁移和 LINQ，适合大多数业务系统。
- Dapper：手写 SQL + 轻量映射，适合查询可控、团队 SQL 能力强的场景。
- ADO.NET：连接、命令、参数、reader 的底层基础，适合库和特殊优化。
- 同一系统可以混用，但事务、连接所有权和模型边界要统一。

### 二、参数化

\`\`\`csharp-snippet
const string sql = """
    SELECT id, name
    FROM users
    WHERE tenant_id = @TenantId AND id = @Id
    """;
var user = await connection.QuerySingleOrDefaultAsync<User>(
    new CommandDefinition(sql, new { TenantId = tenantId, Id = id },
        cancellationToken: cancellationToken));
\`\`\`

参数化保护“值”；动态表名、列名和排序方向不能参数化，必须使用允许列表映射。

### 三、连接与读取

连接池由 provider 管理，短作用域打开/释放连接是正常模式。异步 API 传 CancellationToken；大结果用流式 reader，但流式期间连接一直占用。不要返回依赖已释放连接的惰性序列。

### 四、可观测性

记录操作名、耗时、行数和超时，不记录完整敏感 SQL 参数。慢查询以数据库执行计划为准，不靠 ORM 猜测。
`,
    code: `// 动态排序必须从允许列表映射，不能拼接用户原文
var allowedSorts = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
{
    ["created"] = "created_at",
    ["total"] = "total_amount",
    ["id"] = "id",
};

string requested = "total";
string column = allowedSorts.TryGetValue(requested, out var safeColumn)
    ? safeColumn
    : "created_at";

string sql = $"SELECT id, total_amount FROM orders ORDER BY {column} DESC";
Console.WriteLine(sql);
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch98",
    group: "第十六部分 数据与分布式系统",
    icon: "⚡",
    title: "Redis 与分布式缓存",
    content: `## 第九十九章　Redis 与分布式缓存

缓存改善延迟和容量，但引入过期、穿透、击穿、雪崩和一致性问题。

### 一、常见模式

- Cache-aside：先读缓存，未命中查数据库并回填；写入后删除/更新缓存。
- Read-through/write-through 由缓存层封装，复杂度转移而不是消失。
- 分布式锁只在确有跨实例互斥需求时使用，并设计租约、超时和 fencing token。拿到锁不等于拥有数据权：锁过期后旧持有者仍可能写库，必须用单调递增的 token 拒绝过期写。

### 二、键与 TTL

\`app:env:tenant:resource:id:version\`。键必须包含租户和影响结果的授权/版本维度。TTL 加 jitter 防止同时过期；热点未命中用 single-flight 合并请求。

### 三、序列化与演进

缓存值不是永久数据库，但仍会跨版本存活。带 schema version，部署时容忍旧值；反序列化失败应删除并回源。不要缓存巨型对象或无限列表。

### 四、失效与一致性

数据库提交成功、缓存删除失败会产生陈旧值。可使用短 TTL、提交后失效、事件驱动失效等组合。缓存永远不能成为授权判断的唯一真相。

### 五、故障策略

缓存故障时回源会压垮数据库，需要限流、降级和容量预算。连接复用，设置操作超时；禁止在请求线程同步等待 Redis。
`,
    code: `// 1) TTL + jitter，避免大量键同一时刻过期。
// 2) fencing token：锁过期后，旧持有者的写入必须被拒绝。
var random = new Random(2026);
TimeSpan baseTtl = TimeSpan.FromMinutes(10);
for (int i = 1; i <= 3; i++)
    Console.WriteLine($"ttl-{i}: {AddJitter(baseTtl, 0.15, random).TotalSeconds:F0}s");

var lockService = new LeaseLock();
var first = lockService.Acquire("order:42");
var stale = first;
var second = lockService.ExpireAndReacquire("order:42"); // 模拟租约过期后别人抢到锁

Console.WriteLine(lockService.Write("order:42", stale.Token, "旧持有者写"));
Console.WriteLine(lockService.Write("order:42", second.Token, "新持有者写"));

static TimeSpan AddJitter(TimeSpan value, double ratio, Random random)
{
    double factor = 1 - ratio + random.NextDouble() * ratio * 2;
    return TimeSpan.FromMilliseconds(value.TotalMilliseconds * factor);
}

sealed class LeaseLock
{
    private readonly Dictionary<string, long> _tokens = new();

    public Lease Acquire(string key)
    {
        _tokens[key] = 1;
        return new Lease(key, 1);
    }

    public Lease ExpireAndReacquire(string key)
    {
        long next = _tokens[key] + 1;
        _tokens[key] = next;
        return new Lease(key, next);
    }

    public string Write(string key, long token, string payload)
    {
        if (!_tokens.TryGetValue(key, out long current) || token != current)
            return $"拒绝过期 fencing token={token} payload={payload}";
        return $"接受 token={token} payload={payload}";
    }
}

public sealed record Lease(string Key, long Token);
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch99",
    group: "第十六部分 数据与分布式系统",
    icon: "📨",
    title: "消息系统、Outbox、Inbox 与 Saga",
    content: `## 第一百章　消息系统、Outbox、Inbox 与 Saga

消息把服务解耦，但交付通常是至少一次：重复、延迟、乱序和毒消息必须作为正常情况设计。

### 一、事件与命令

- 命令要求某个处理者执行动作；事件陈述已经发生的事实。
- 消息包含 messageId、type、schemaVersion、occurredAt、correlationId 和业务载荷。
- 不把内部实体直接序列化成公共契约；契约要独立演进。

### 二、Outbox / Inbox

业务数据与 Outbox 行在同一数据库事务提交，后台发布；发布成功后标记。消费者用 Inbox/处理记录按 messageId 去重。生产清理记录时要保留足够的最大重投窗口。

### 三、Saga

跨服务流程用本地事务 + 消息 + 补偿。补偿不是数据库回滚：退款、释放库存本身也可能失败，必须幂等、可重试、可观测。

### 四、顺序与分区

只在业务键范围内要求顺序，例如同一 orderId 使用同一 partition key。全局顺序代价高且限制吞吐。消费者还应拒绝旧版本覆盖新状态。

### 五、死信队列

瞬时错误有限重试；永久格式/规则错误进入 DLQ，附原因并告警。必须有人负责检查、修复和重放，DLQ 不是垃圾桶。
`,
    code: `// Inbox 去重：模拟 at-least-once 消息被重复投递
var inbox = new HashSet<Guid>();
var messageId = Guid.NewGuid();
var deliveries = new[]
{
    new Message(messageId, "OrderPaid"),
    new Message(messageId, "OrderPaid"),
};

foreach (var message in deliveries)
{
    if (!inbox.Add(message.Id))
    {
        Console.WriteLine($"skip duplicate {message.Id}");
        continue;
    }
    Console.WriteLine($"handle {message.Type} {message.Id}");
}

public sealed record Message(Guid Id, string Type);
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch100",
    group: "第十六部分 数据与分布式系统",
    icon: "📡",
    title: "gRPC、SignalR 与实时通信",
    content: `## 第一百零一章　gRPC、SignalR 与实时通信

HTTP JSON、gRPC、SignalR 和原始 WebSocket 面向不同问题。

### 一、选型

- REST/HTTP JSON：公共 API、浏览器和广泛互操作。
- gRPC：内部强类型 RPC、流式传输、低开销；浏览器需要 gRPC-Web 等适配。
- SignalR：面向客户端的 hub、分组、用户映射与自动传输选择。
- 原始 WebSocket：自定义协议或极致控制，需自行处理重连、心跳、背压和协议版本。

### 二、gRPC 契约

protobuf 字段编号发布后不能复用。新增字段通常兼容，删除字段应 reserved。deadline 和 CancellationToken 必须传播；状态码与业务错误模型要稳定。

### 三、流与背压

流式并不等于无限缓存。生产者必须尊重消费者速度，限制单消息大小、队列长度和并发。客户端断开后停止工作。

### 四、SignalR 扩展

多实例需要 Azure SignalR Service、Redis backplane 或其他扩展方案；连接 ID 是短期传输标识，不是用户身份。Hub 方法仍需认证、授权、输入验证和限流。

### 五、重连语义

断线重连可能错过或重复事件。关键业务事件要有序号/游标并支持补拉，不能只依赖实时推送。
`,
    code: `// 用序号检测实时事件缺口；发现缺口后应调用 HTTP 补拉
long lastSeen = 100;
var incoming = new[]
{
    new RealtimeEvent(101, "price.updated"),
    new RealtimeEvent(103, "order.changed"),
};

foreach (var item in incoming)
{
    if (item.Sequence != lastSeen + 1)
        Console.WriteLine($"gap: expected {lastSeen + 1}, got {item.Sequence}");
    lastSeen = item.Sequence;
    Console.WriteLine($"event {item.Sequence}: {item.Type}");
}

public sealed record RealtimeEvent(long Sequence, string Type);
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch101",
    group: "第十六部分 数据与分布式系统",
    icon: "🪣",
    title: "对象存储、搜索与大文件处理",
    content: `## 第一百零二章　对象存储、搜索与大文件处理

数据库不适合承担所有二进制对象和全文检索。

### 一、对象存储

- 数据库只保存 object key、大小、哈希、媒体类型、所有者和状态。
- 客户端可用短期预签名 URL 直传，服务端仍要验证最终对象。
- key 使用不可猜随机 ID，不直接信任原始文件名。
- 上传限制大小、类型、速率；在隔离环境做恶意软件扫描和内容嗅探。
- 下载授权不能因为“URL 很难猜”而省略。

### 二、大文件

流式读取，不把整个文件载入 byte[]；设置最大长度，计算哈希时边读边算。分片上传需要 uploadId、分片校验、完成提交和过期清理。

### 三、搜索引擎

Elasticsearch/OpenSearch 是派生读模型，不是订单真相源。通过 Outbox/CDC 同步，记录索引版本并能全量重建。搜索结果接受最终一致性，并明确租户过滤。

### 四、生命周期

临时上传、失败分片、旧版本和软删除对象要有生命周期策略。备份数据库时也要考虑对象元数据与实际对象的一致恢复点。
`,
    code: `using System.Security.Cryptography;

// 流式计算哈希：内存占用与文件大小无关
byte[] data = Enumerable.Range(0, 10_000)
    .Select(static value => (byte)(value % 256))
    .ToArray();
await using var stream = new MemoryStream(data);

string hash = await ComputeSha256Async(stream);
Console.WriteLine(hash);

static async Task<string> ComputeSha256Async(Stream stream)
{
    using var sha = SHA256.Create();
    byte[] digest = await sha.ComputeHashAsync(stream);
    return Convert.ToHexString(digest);
}
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch102",
    group: "第十七部分 云原生、交付与可靠性",
    icon: "☁️",
    title: "云配置、密钥与 Feature Flags",
    content: `## 第一百零三章　云配置、密钥与 Feature Flags

配置用于随环境变化的非敏感参数，Secret 用于凭据，Feature Flag 用于控制功能发布；三者不能混为一谈。

### 一、配置

- appsettings 提供非敏感默认值，环境变量/云配置覆盖。
- Options 在启动时 ValidateOnStart，错误配置快速失败。
- 动态配置变更必须定义一致性、缓存时间和失败回退。
- 不把每个业务规则都变成不可追踪的配置。

### 二、Secret

- 存在 Key Vault/Secrets Manager/Vault/Kubernetes Secret 等受控系统。
- 应用使用 workload identity/managed identity，避免长期云密钥。
- 日志、异常、诊断页面、dump、CI 输出都可能泄露 Secret。
- 设计轮换：数据库账号、签名密钥和证书应支持重叠窗口。

### 三、Feature Flag

- flag 有 owner、用途、创建和删除日期。
- 服务端决定权限和关键行为，客户端 flag 不能作为安全边界。
- 灰度按稳定主体分桶；记录曝光版本以分析业务指标。
- kill switch 应简单、经过演练，并在控制平面故障时有安全默认值。

### 四、配置变更审计

谁在何时改了什么、旧值是什么、影响哪些环境，都要可追踪。高风险生产配置采用双人审批。
`,
    code: `// 稳定百分比分桶：同一用户始终得到相同结果
using System.Security.Cryptography;
using System.Text;

foreach (string userId in new[] { "u-1", "u-2", "u-3", "u-4" })
    Console.WriteLine($"{userId}: {Enabled(userId, "new-checkout", 25)}");

static bool Enabled(string subject, string flag, int percentage)
{
    byte[] hash = SHA256.HashData(Encoding.UTF8.GetBytes($"{flag}:{subject}"));
    uint value = BitConverter.ToUInt32(hash, 0);
    return value % 100 < percentage;
}
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch103",
    group: "第十七部分 云原生、交付与可靠性",
    icon: "☸️",
    title: "Kubernetes 与云原生运行",
    content: `## 第一百零四章　Kubernetes 与云原生运行

Kubernetes 负责调度和期望状态，不会自动修复应用设计。

### 一、Pod 生命周期

- startupProbe：允许慢启动。
- readinessProbe：决定是否接收流量。
- livenessProbe：只判断进程是否不可恢复，不把所有下游放进去。
- PreStop + terminationGracePeriod 给应用停止接流量和完成在途请求的时间。

### 二、资源与 GC

设置 requests/limits 并压测。.NET 会感知容器内存，但过小限制仍会导致频繁 GC 或 OOMKill。CPU limit 可能形成节流并放大尾延迟。观察 working set、allocation rate、GC pause 和 throttling。

### 三、扩缩容

CPU HPA 对队列消费者未必合适；可按队列深度/延迟扩容。扩容速度受启动时间、连接池、缓存预热和下游容量限制。缩容必须优雅停止。

### 四、配置与身份

Secret 不应进入镜像。使用 workload identity 访问云资源；RBAC 最小权限，NetworkPolicy 限制东西向网络。

### 五、部署

滚动期间新旧版本共存，因此 API、消息和数据库 schema 必须前后兼容。Pod 变为 Ready 前执行轻量关键自检，但不要让所有副本同时做数据库迁移。
`,
    code: `// 模拟 readiness：只包含“能否接流量”的必要条件
var state = new ApplicationState(
    StartupCompleted: true,
    DatabaseReachable: true,
    OptionalAnalyticsReachable: false);

bool ready = state.StartupCompleted && state.DatabaseReachable;
Console.WriteLine($"readiness={(ready ? "ready" : "not-ready")}");
Console.WriteLine("分析服务失败不会触发 liveness 重启");

public sealed record ApplicationState(
    bool StartupCompleted,
    bool DatabaseReachable,
    bool OptionalAnalyticsReachable);
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch104",
    group: "第十七部分 云原生、交付与可靠性",
    icon: "🏗️",
    title: "IaC、环境与发布治理",
    content: `## 第一百零五章　IaC、环境与发布治理

基础设施也要版本控制、评审和测试。手工点控制台创建的生产资源不可重复、不可审计。

### 一、Infrastructure as Code

Terraform、Bicep、Pulumi 等工具都可用。模块要有清晰输入输出，state 受控加密并锁定；plan 在 PR 展示，apply 只由受保护流水线执行。

### 二、环境策略

- dev/test/staging/prod 的拓扑尽量一致，规模和数据可不同。
- 禁止把生产数据无脱敏复制到测试。
- 临时预览环境自动创建、设置预算并到期删除。
- 环境差异由配置表达，不能维护长期分叉代码。

### 三、数据库发布

迁移脚本生成后人工审查：锁、扫描、回填、索引构建和回滚。采用 expand/contract，先兼容后删除。大表迁移拆成可暂停批次。

### 四、审批与职责

低风险变更自动发布，高风险变更要求审批和维护窗口。审批者应看到 diff、测试、指标影响和回滚步骤，而不是只点“同意”。

### 五、成本

成本也是生产指标。按服务/团队打标签，监控异常增长；压测和扩容策略同时评估性能与成本。
`,
    code: `// 根据变更风险决定发布门禁
var change = new Change(
    DatabaseDestructive: true,
    PublicApiBreaking: false,
    SecuritySensitive: true);

int risk = (change.DatabaseDestructive ? 3 : 0)
         + (change.PublicApiBreaking ? 3 : 0)
         + (change.SecuritySensitive ? 2 : 0);

string gate = risk switch
{
    >= 5 => "双人审批 + 演练 + 维护窗口",
    >= 2 => "人工审批 + canary",
    _ => "自动发布",
};
Console.WriteLine(gate);

public sealed record Change(
    bool DatabaseDestructive,
    bool PublicApiBreaking,
    bool SecuritySensitive);
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch105",
    group: "第十七部分 云原生、交付与可靠性",
    icon: "🏎️",
    title: "基准、负载测试与容量规划",
    content: `## 第一百零六章　基准、负载测试与容量规划

性能优化必须从目标、测量和瓶颈出发。

### 一、微基准

BenchmarkDotNet 处理预热、JIT、迭代和统计。基准使用 Release、固定环境、消费结果，并检查分配。微基准不能代表真实数据库、网络和并发系统。

### 二、负载模型

- 定义吞吐、并发、请求组合、数据分布和 think time。
- 区分 open model（外部到达率）与 closed model（固定虚拟用户）。
- 使用真实大小的数据与响应，包含缓存冷热和依赖延迟。
- 关注 p50/p95/p99、错误率和饱和度，不只看平均值。

### 三、容量

找出单实例安全容量和拐点，预留故障、部署和突发余量。瓶颈可能是连接池、数据库 IOPS、线程池、GC、下游限流或网络，不只是 CPU。

### 四、避免 coordinated omission

负载工具若上一个请求慢时停止产生新请求，会低估排队延迟。工具和场景必须能表达目标到达率。

### 五、性能回归

稳定微基准可进入 CI，但设置统计阈值并使用可控 runner。端到端容量测试通常定期运行，保存版本、配置和环境。
`,
    code: `using System.Diagnostics;

// 教学计时不是严谨基准；生产请用 BenchmarkDotNet
const int iterations = 100_000;
var stopwatch = Stopwatch.StartNew();
long checksum = 0;

for (int i = 0; i < iterations; i++)
    checksum += ParseId($"order-{i}");

stopwatch.Stop();
Console.WriteLine($"elapsed={stopwatch.ElapsedMilliseconds}ms checksum={checksum}");
Console.WriteLine("此结果只用于理解测量流程，不能作为性能结论");

static int ParseId(string value)
{
    int dash = value.LastIndexOf('-');
    return int.Parse(value.AsSpan(dash + 1));
}
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch106",
    group: "第十七部分 云原生、交付与可靠性",
    icon: "🚨",
    title: "SLO、告警与事故响应",
    content: `## 第一百零七章　SLO、告警与事故响应

“服务在线”不是可靠性目标。SLO 把用户能感知的成功与延迟变成可管理预算。

### 一、SLI / SLO / SLA

- SLI：测量，例如有效请求成功比例、p99 延迟。
- SLO：内部目标，例如 30 天 99.9% 成功。
- SLA：对外合同及后果，不等于监控阈值。

错误预算 = 1 - SLO。预算快速消耗时冻结高风险发布并优先可靠性工作。

### 二、告警

告警必须可行动。优先用多窗口 burn-rate 告警捕获快速和缓慢消耗；CPU 高但用户无影响通常只是诊断信号。每条告警关联 owner、dashboard 和 runbook。

### 三、事故流程

1. 确认影响并指定 incident commander。
2. 先止损：回滚、降级、限流、切流。
3. 保留时间线、版本、日志和操作记录。
4. 恢复后做无责复盘，跟踪改进项到完成。

### 四、沟通

状态更新说明影响、已知事实、当前动作和下次更新时间。不要用未经证实的根因猜测代替事实。

### 五、演练

定期演练依赖超时、区域故障、证书过期、消息积压和密钥轮换。演练必须有停止条件，不能在未知保护能力下直接破坏生产。
`,
    code: `// 计算 30 天窗口的错误预算
const long totalRequests = 5_000_000;
const long failedRequests = 3_200;
const double target = 0.999;

double actual = 1d - (double)failedRequests / totalRequests;
double allowedFailures = totalRequests * (1d - target);
double budgetUsed = failedRequests / allowedFailures;

Console.WriteLine($"SLI={actual:P4}");
Console.WriteLine($"错误预算已使用={budgetUsed:P1}");
Console.WriteLine(budgetUsed > 1 ? "SLO 已违反" : "仍在预算内");
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch107",
    group: "第十七部分 云原生、交付与可靠性",
    icon: "🛟",
    title: "备份、灾备与生产排障",
    content: `## 第一百零八章　备份、灾备与生产排障

“有备份”必须通过恢复演练证明。排障必须保留证据并控制额外风险。

### 一、RPO 与 RTO

- RPO：最多能接受丢失多少数据。
- RTO：最多能接受多久恢复。
- 目标决定备份频率、复制拓扑、自动化与成本。

### 二、备份

数据库、对象存储、配置、密钥恢复材料和消息偏移都要纳入。备份加密、跨故障域保存、限制删除权限。定期在隔离环境恢复并校验业务一致性。

### 三、排障顺序

1. 明确时间范围、影响用户和最近变更。
2. 查看 SLI、流量、错误、延迟、饱和度。
3. 沿 trace 检查依赖，再看结构化日志。
4. 必要时采集 counters、trace、dump；注意 PII 和凭据。
5. 每次只做可回退的假设验证。

### 四、常用 .NET 工具

- dotnet-counters：运行时指标。
- dotnet-trace：EventPipe trace。
- dotnet-dump：进程 dump。
- dotnet-gcdump：托管堆快照。
- createdump / 平台工具：崩溃证据。

### 五、恢复

恢复服务后还要验证积压、缓存、索引、异步补偿和数据对账。不要在未备份证据时“清队列解决告警”。
`,
    code: `var plan = new RecoveryPlan(
    Rpo: TimeSpan.FromMinutes(5),
    Rto: TimeSpan.FromMinutes(30),
    LastBackup: DateTimeOffset.UtcNow.AddMinutes(-3),
    RestoreTestPassed: true);

bool backupFresh = DateTimeOffset.UtcNow - plan.LastBackup <= plan.Rpo;
Console.WriteLine($"备份满足 RPO：{backupFresh}");
Console.WriteLine($"恢复演练通过：{plan.RestoreTestPassed}");
Console.WriteLine(backupFresh && plan.RestoreTestPassed
    ? "恢复能力已验证"
    : "禁止宣称已具备灾备能力");

public sealed record RecoveryPlan(
    TimeSpan Rpo,
    TimeSpan Rto,
    DateTimeOffset LastBackup,
    bool RestoreTestPassed);
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch108",
    group: "第十八部分 平台拓展与毕业实战",
    icon: "📦",
    title: "类库、NuGet 与 API 兼容性",
    content: `## 第一百零九章　类库、NuGet 与 API 兼容性

公共库的消费者升级速度不由作者控制。发布后，类型、方法、异常、线程安全和性能都可能成为契约。

### 一、目标框架

按消费者范围选择 TFM。内部应用库可以只目标 net10.0；广泛库可多目标，但每个 TFM 都要测试。不要为了古老目标牺牲安全补丁。

### 二、包元数据

\`\`\`xml
<PropertyGroup>
  <PackageId>Company.Orders.Client</PackageId>
  <Version>2.1.0</Version>
  <Authors>Platform Team</Authors>
  <RepositoryUrl>https://example/repo</RepositoryUrl>
  <PackageReadmeFile>README.md</PackageReadmeFile>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
  <ContinuousIntegrationBuild>true</ContinuousIntegrationBuild>
</PropertyGroup>
\`\`\`

包应包含 README、许可证、符号包和 Source Link；签名与来源验证按组织供应链策略执行。

### 三、兼容性

- 删除/重命名 public API、收紧参数、改变异常或默认行为都可能破坏。
- 可空注解会影响消费者编译警告，也是 API 设计的一部分。
- 使用 APICompat / PublicApiAnalyzers 检查基线。
- Obsolete 给迁移替代和时间，重大版本才删除。

### 四、设计

最小 public surface；优先抽象稳定语义，不暴露内部 DTO/依赖类型。异步 API 接受 CancellationToken；集合返回只读抽象并说明线程安全与所有权。
`,
    code: `// 兼容演进：保留旧入口，委托给新实现并给出迁移信息
var client = new OrdersClient();
Console.WriteLine(await client.GetAsync("A-100"));

public sealed class OrdersClient
{
    [Obsolete("Use GetOrderAsync instead. This member will be removed in v3.")]
    public Task<string> GetAsync(string id) => GetOrderAsync(id);

    public Task<string> GetOrderAsync(
        string id,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        return Task.FromResult($"order:{id}");
    }
}
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch109",
    group: "第十八部分 平台拓展与毕业实战",
    icon: "🌐",
    title: "ASP.NET Core 管道、Minimal API 与 Controllers",
    content: `## 第一百一十章　ASP.NET Core 管道、Minimal API 与 Controllers

生产 Web API 的核心是请求管道、稳定契约和清晰边界，而不是把所有逻辑塞进 endpoint。

### 一、中间件顺序

\`\`\`csharp-snippet
var app = builder.Build();
app.UseExceptionHandler();
app.UseForwardedHeaders(); // 仅信任已配置的代理
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.MapControllers();
\`\`\`

异常处理应尽早；认证必须先于授权。反向代理头不能无条件信任，否则攻击者可伪造 scheme、host 或客户端地址。

对外入口常用 YARP 做路径剥离、超时、体积极限和转发：

\`\`\`csharp-snippet
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));
app.UseForwardedHeaders();
app.MapReverseProxy();
\`\`\`

YARP 是进程内反向代理，不是服务网格替代品。转发超时、请求体大小和允许的目标地址必须显式限制。

### 二、Minimal API 与 Controllers

- Minimal API 适合小型服务和垂直切片；使用 route group、endpoint filter 和 TypedResults。
- Controllers 适合复杂绑定、过滤器和大型团队约定。
- 两者可共存，选择不应改变领域层和应用层。
- endpoint 只负责 HTTP 映射、授权、验证和调用用例。

### 三、输入与输出

请求 DTO 与领域模型分离；限制 body、集合、字符串和上传大小。不要把 EF entity 直接返回。成功响应使用明确状态码，失败统一 RFC 9457 Problem Details。

### 四、取消与超时

\`HttpContext.RequestAborted\` 要传到数据库和 HTTP 调用。服务端 deadline 结束后停止无价值工作；已提交的写操作不能假装被“取消回滚”。

### 五、真实项目验证

本章主 demo 只演示管道顺序。真实代码必须在 ASP.NET Core 项目中用 \`WebApplicationFactory\` 验证状态码、授权、Problem Details 和中间件行为。`,
    code: `// 纯 C# 模拟中间件：进入顺序与退出顺序相反
var pipeline = Build(
    "exception-handler",
    "authentication",
    "authorization",
    "endpoint");

await pipeline(new RequestContext("/orders"));

static Func<RequestContext, Task> Build(params string[] names)
{
    Func<RequestContext, Task> next = context =>
    {
        Console.WriteLine($"handle {context.Path}");
        return Task.CompletedTask;
    };

    foreach (string name in names.Reverse())
    {
        var capturedNext = next;
        next = async context =>
        {
            Console.WriteLine($"enter {name}");
            await capturedNext(context);
            Console.WriteLine($"exit  {name}");
        };
    }
    return next;
}

public sealed record RequestContext(string Path);
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch110",
    group: "第十八部分 平台拓展与毕业实战",
    icon: "📜",
    title: "OpenAPI、版本化与错误契约",
    content: `## 第一百一十一章　OpenAPI、版本化与错误契约

API 契约发布后，会被客户端、测试、网关和文档依赖。

### 一、.NET 10 OpenAPI

\`\`\`csharp-snippet
builder.Services.AddOpenApi();
var app = builder.Build();
if (app.Environment.IsDevelopment())
    app.MapOpenApi();
\`\`\`

新项目优先使用 ASP.NET Core 内置 OpenAPI 文档生成；交互 UI 可按团队需要选择。生产是否公开文档端点取决于威胁模型。

### 二、兼容演进

- 新增可选字段通常兼容；删除/重命名字段、改变类型或含义通常破坏兼容。
- enum 新值会破坏穷举客户端，消费者应有 unknown 策略。
- 数据库版本、消息 schema 和 HTTP API 必须允许滚动发布时新旧版本共存。
- 先做 expand，再迁移消费者，最后 contract。

### 三、版本策略

优先通过兼容新增演进。确需大版本时，可使用 URL、header 或媒体类型版本，但组织内要统一。每个版本定义支持期、弃用响应头、迁移指南和流量观测。

### 四、Problem Details

错误返回稳定的 \`type\`、\`title\`、\`status\`、\`detail\`、\`instance\`，并增加可关联的 traceId/errorCode。不要返回堆栈、SQL、内部类型名或敏感数据。

### 五、契约门禁

CI 比较 OpenAPI diff，并用消费者契约测试验证关键行为。仅比较 JSON 文本不够，还要判断语义兼容性。`,
    code: `// 用稳定错误码让客户端无需解析自然语言
var errors = new Dictionary<string, ApiProblem>
{
    ["order.not_found"] = new(404, "Order not found"),
    ["order.conflict"] = new(409, "Order state conflict"),
    ["request.invalid"] = new(400, "Request validation failed"),
};

string code = "order.conflict";
ApiProblem problem = errors[code];
Console.WriteLine($"{problem.Status} {code}: {problem.Title}");

public sealed record ApiProblem(int Status, string Title);
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch111",
    group: "第十八部分 平台拓展与毕业实战",
    icon: "🪪",
    title: "OAuth 2.0、OIDC、JWT 与 BFF",
    content: `## 第一百一十二章　OAuth 2.0、OIDC、JWT 与 BFF

OAuth 2.0 是授权框架，OpenID Connect 在其上增加身份认证。JWT 只是一种令牌格式，不等于登录协议。

### 一、常见流程

- 浏览器/移动端：Authorization Code + PKCE，不使用已淘汰的 implicit flow。
- 服务到服务：Client Credentials 或 workload identity。
- 用户登录需要 OIDC 的 ID Token；API 接受 Access Token。
- Refresh Token 是高价值凭据，需要轮换、撤销和安全存储。

### 二、API 验证

\`\`\`csharp-snippet
builder.Services.AddAuthentication()
    .AddJwtBearer(options =>
    {
        options.Authority = issuer;
        options.Audience = "orders-api";
    });
\`\`\`

验证签名、issuer、audience、有效期和允许算法。不要只 Base64 解码后信任 claims，也不要从任意 URL 获取 JWKS。

### 三、授权

认证只回答“是谁”，授权回答“能做什么”。使用 policy、scope/role 和资源级检查；每个数据查询仍要限定 tenant/owner。管理员 UI 隐藏按钮不构成服务端授权。

### 四、BFF 与浏览器安全

高敏感浏览器应用可采用 Backend for Frontend，把令牌保存在服务端，以 HttpOnly、Secure、SameSite Cookie 建立会话。Cookie 认证必须处理 CSRF；Bearer Token 重点防 XSS 和泄露。

### 五、密钥轮换

签名密钥以 kid 标识，发布新密钥、重叠验证、再撤销旧密钥。监控 JWKS 刷新失败与时钟偏移。`,
    code: `using System.Text;
using System.Text.Json;

// 仅演示读取 JWT payload；解码绝不代表签名验证
string payloadJson = """{"sub":"user-42","scope":"orders.read","exp":1893456000}""";
string payload = Convert.ToBase64String(Encoding.UTF8.GetBytes(payloadJson))
    .TrimEnd('=').Replace('+', '-').Replace('/', '_');
string token = $"header.{payload}.signature";

string part = token.Split('.')[1].Replace('-', '+').Replace('_', '/');
part = part.PadRight(part.Length + (4 - part.Length % 4) % 4, '=');
using JsonDocument document = JsonDocument.Parse(Convert.FromBase64String(part));

Console.WriteLine($"sub={document.RootElement.GetProperty("sub").GetString()}");
Console.WriteLine("注意：生产必须由认证中间件验证签名和全部约束");
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch112",
    group: "第十八部分 平台拓展与毕业实战",
    icon: "🗄️",
    title: "EF Core 建模、迁移、查询与测试",
    content: `## 第一百一十三章　EF Core 建模、迁移、查询与测试

EF Core 是关系数据库映射器，不会消除 SQL、索引、事务和 Provider 差异。

### 一、建模

\`\`\`csharp-snippet
modelBuilder.Entity<Order>(entity =>
{
    entity.HasKey(x => x.Id);
    entity.Property(x => x.Total).HasPrecision(18, 2);
    entity.Property(x => x.Version).IsRowVersion();
    entity.HasIndex(x => new { x.TenantId, x.CreatedAt });
});
\`\`\`

关系、删除行为、最大长度、精度、唯一约束和并发令牌要显式定义。领域枚举/值对象可转换，但数据库约束仍需保护数据。

### 二、迁移

迁移文件进入版本控制并审查 SQL。生产部署采用独立 migration job/bundle，不让每个副本启动时竞争迁移。大表用 expand/contract 和分批回填。

### 三、查询

- 只读查询使用 \`AsNoTracking\`，只投影所需列。
- 警惕 N+1、笛卡尔爆炸和客户端求值；检查生成 SQL 与执行计划。
- Include 不是默认答案；必要时 SplitQuery，但理解一致性和往返代价。
- 分页使用稳定排序和 keyset cursor。

### 四、并发与事务

捕获 \`DbUpdateConcurrencyException\` 后决定重读、合并或返回 409；不能无条件重试覆盖他人数据。执行策略重试时，整个事务委托必须可重放。

### 五、测试

纯内存集合不会复现 SQL 翻译、约束、事务和大小写规则。仓储单元测试可用 fake；数据访问与 API 集成测试使用真实生产 Provider 的一次性数据库。`,
    code: `// 模拟乐观并发：更新必须携带读到的版本号
var stored = new OrderState("A-100", "Pending", Version: 3);
var request = new UpdateRequest("Paid", ExpectedVersion: 2);

if (request.ExpectedVersion != stored.Version)
{
    Console.WriteLine($"409 conflict: expected={request.ExpectedVersion}, actual={stored.Version}");
}
else
{
    stored = stored with { Status = request.Status, Version = stored.Version + 1 };
    Console.WriteLine(stored);
}

public sealed record OrderState(string Id, string Status, int Version);
public sealed record UpdateRequest(string Status, int ExpectedVersion);
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch113",
    group: "第十八部分 平台拓展与毕业实战",
    icon: "🧪",
    title: "WebApplicationFactory 与 Testcontainers",
    content: `## 第一百一十四章　WebApplicationFactory 与 Testcontainers

生产信心来自真实边界测试：HTTP 管道、认证、序列化、数据库约束和迁移要一起验证。

### 一、API 集成测试

\`\`\`csharp-snippet
public sealed class OrdersApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    public OrdersApiTests(WebApplicationFactory<Program> factory) =>
        _client = factory.CreateClient();
}
\`\`\`

\`WebApplicationFactory\` 在进程内启动真实 ASP.NET Core Host。替换外部依赖时保持生产注册边界，不要把整个应用换成 mock。

### 二、真实数据库

Testcontainers 启动 PostgreSQL/SQL Server/Redis 等临时容器。测试启动时应用迁移，结束后销毁。它比 EF InMemory 慢，但能发现 SQL 翻译、约束、事务和 Provider 差异。

### 三、隔离与并行

- 每个测试使用独立数据库/schema/事务或唯一数据键。
- 不依赖执行顺序，不共享可变静态状态。
- 固定时钟、随机种子和外部响应。
- 容器可按测试集合复用，但必须可靠清理数据。

### 四、断言

通过 HTTP 断言状态码、content-type、Problem Details、header 和 body；再按需验证数据库副作用。不要只断言“200”。

### 五、CI

失败时保留应用日志、容器日志和 trace，同时清理敏感信息。健康等待使用容器探针/重试，而不是固定 sleep。`,
    code: `// 一个轻量异步测试运行器；真实 API 测试使用 xUnit + WAF + Testcontainers
var tests = new[]
{
    new TestCase("created returns 201", () => AssertEqual(201, 201)),
    new TestCase("duplicate returns 409", () => AssertEqual(409, 409)),
};

foreach (var test in tests)
{
    await test.Body();
    Console.WriteLine($"PASS {test.Name}");
}

static Task AssertEqual<T>(T expected, T actual)
{
    if (!EqualityComparer<T>.Default.Equals(expected, actual))
        throw new InvalidOperationException($"expected={expected}, actual={actual}");
    return Task.CompletedTask;
}

public sealed record TestCase(string Name, Func<Task> Body);
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch114",
    group: "第十八部分 平台拓展与毕业实战",
    icon: "✂️",
    title: "Native AOT、Trimming 与源生成",
    content: `## 第一百一十五章　Native AOT、Trimming 与源生成

Native AOT 可改善启动速度、镜像大小和内存，但限制动态代码与未声明反射。它不是所有服务的默认答案。

### 一、发布模式

\`\`\`bash
dotnet publish -c Release -r linux-x64 --self-contained
dotnet publish -c Release -r linux-x64 -p:PublishTrimmed=true
dotnet publish -c Release -r linux-x64 -p:PublishAot=true
\`\`\`

每种 RID 都需单独产物。先以真实启动、吞吐、内存、镜像和构建时间测量收益。

### 二、Trimming 风险

链接器静态分析不可见的反射成员可能被删除。开启分析器并解决警告，不要全局压制。库作者使用 \`DynamicallyAccessedMembers\` 等注解表达需求，但应优先减少动态发现。

### 三、JSON 源生成

\`\`\`csharp-snippet
[JsonSerializable(typeof(OrderDto))]
internal partial class AppJsonContext : JsonSerializerContext;
\`\`\`

源生成元数据减少运行时反射，并提升 trimming/AOT 兼容性。所有多态类型和命名策略要进入上下文。

### 四、框架兼容

动态代理、运行时生成代码、部分反射扫描和插件系统可能不兼容。ASP.NET Core 有 AOT 模板，但 EF Core 等依赖的支持边界必须按 .NET 10 文档和实际包版本验证。

### 五、门禁

CI 对每个目标 RID 执行 publish，并启动产物跑 smoke/integration test。普通 JIT 构建通过不能证明 AOT 产物可运行。`,
    code: `using System.Text.Json;
using System.Text.Json.Serialization;

var order = new OrderDto("A-100", 129.90m);
string json = JsonSerializer.Serialize(order, AppJsonContext.Default.OrderDto);
OrderDto? copy = JsonSerializer.Deserialize(json, AppJsonContext.Default.OrderDto);

Console.WriteLine(json);
Console.WriteLine(copy);

public sealed record OrderDto(string Id, decimal Total);

[JsonSerializable(typeof(OrderDto))]
internal partial class AppJsonContext : JsonSerializerContext;
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch115",
    group: "第十八部分 平台拓展与毕业实战",
    icon: "🎓",
    title: "毕业项目：订单系统从零到上线",
    content: `## 第一百一十六章　毕业项目：订单系统从零到上线

这不是复制粘贴题。请建立一个真实仓库，按小 PR 逐步交付。

### 一、解决方案

\`\`\`
src/
  Shop.Api/             HTTP 边界、认证、Problem Details
  Shop.Application/     用例、事务边界、端口
  Shop.Domain/          订单、金额、状态机、不变量
  Shop.Infrastructure/  EF Core、Outbox、外部客户端
  Shop.Worker/          消息发布与消费
tests/
  Shop.UnitTests/
  Shop.IntegrationTests/
\`\`\`

### 二、必须实现

- PostgreSQL/SQL Server + EF Core migration，真实容器集成测试。
- OIDC/JWT 验证，租户和资源级授权。
- POST /orders 的 Idempotency-Key；库存乐观并发。
- 业务事务与 Outbox 原子提交；Inbox 幂等消费。
- 标准 HTTP resilience handler，deadline、重试和断路器。
- Redis cache-aside，租户隔离、TTL jitter 和故障降级。
- RFC 9457 Problem Details、OpenAPI、cursor pagination。
- OpenTelemetry logs/metrics/traces，readiness/liveness/startup。
- 非 root 只读容器、锁定依赖、SBOM、漏洞扫描。
- CI build/test/publish；canary、expand/contract 和回滚。

### 三、验收故障

重复创建请求、数据库并发冲突、消息重复/乱序、Redis 停机、下游 429/超时、Pod SIGTERM、错误配置、迁移中新旧版本共存、从备份恢复。每个场景必须有自动测试或演练证据。

### 四、上线文档

架构决策、威胁模型、数据分类、SLO、dashboard、告警、runbook、容量结果、发布/回滚步骤、RPO/RTO 和恢复记录。

### 五、真正完成的判断

代码能运行只是开始。别人能审查、流水线能重复构建、系统能观测、失败能降级、数据能恢复、版本能回退，才是可负责的生产交付。
`,
    code: `// 毕业门禁：任何 BLOCK 都必须解决或获得有期限的风险批准
var gates = new[]
{
    new Gate("unit + integration tests", true),
    new Gate("authorization tests", true),
    new Gate("migration rehearsed", true),
    new Gate("load target met", true),
    new Gate("rollback rehearsed", false),
    new Gate("restore tested", false),
};

foreach (var gate in gates)
    Console.WriteLine($"[{(gate.Passed ? "PASS" : "BLOCK")}] {gate.Name}");

int blockers = gates.Count(static gate => !gate.Passed);
Console.WriteLine(blockers == 0
    ? "可以进入灰度发布"
    : $"仍有 {blockers} 个发布阻断项");

public sealed record Gate(string Name, bool Passed);
`,
    lang: "cs",
  },
];

export const csharp5Conclusion = {
  id: "csharp5-conclusion",
  group: "结尾",
  icon: "🏁",
  title: "结语：持续交付，而不是毕业",
  content: `## 结语：持续交付，而不是毕业

你已经走过语言、运行时、异步并发、网络、Web、数据、安全、分布式系统、云原生、生产运维，以及验证、幂等、缓存、健康检查、Aspire、多租户和合规日志。但技术清单不是能力本身。

### 接下来怎么做

1. 完成第一百一十六章的真实订单系统，不使用教程里的模拟框架代替数据库、消息系统和容器。
2. 邀请同伴分别从业务正确性、安全、数据、性能和可运维性评审。
3. 对超时、重复消息、依赖故障、并发冲突和停机进行故障注入。
4. 部署到测试环境，使用真实 telemetry 判断系统行为。
5. 做一次灰度、回滚和备份恢复演练，并修正文档。

### 长期习惯

- 跟随 .NET 支持策略和每月安全补丁，不追逐 preview 上生产。
- 先测量再优化，先定义故障语义再增加重试。
- 让不变量进入类型和数据库约束，让操作进入自动化流水线。
- 把事故当作系统改进信号，不把复盘变成追责。
- 删除过期 feature flag、兼容层、临时配置和无主告警。

没有任何教程能保证“开发没有问题”。成熟工程师的价值，是让问题更早暴露、影响更小、恢复更快，并让同类问题不再重复发生。`,
  code: `Console.WriteLine("学习完成不是终点：");

string[] loop =
[
    "设计可验证的变更",
    "编写代码与测试",
    "小批量发布",
    "观察真实指标",
    "复盘并改进",
];

for (int iteration = 1; iteration <= 2; iteration++)
{
    Console.WriteLine($"\\n持续交付循环 {iteration}");
    foreach (string step in loop)
        Console.WriteLine($"  → {step}");
}
`,
  lang: "cs",
};
