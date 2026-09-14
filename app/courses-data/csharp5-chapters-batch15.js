// =============================================================
// C# 从入门到生产 —— 第 15 批章节
// 第十四部分 现代 C# 与生产工程（14 章）
// -------------------------------------------------------------
// 版本基线：.NET 10 LTS / C# 14。
// 交互式 demo 保持 net8.0 可编译，便于安装旧 SDK 的读者运行；
// C# 13/14 专属语法在正文代码块中单独标注。
// =============================================================

const chapters = [
  {
    id: 'csharp5-ch78',
    group: '第十四部分 现代 C# 与生产工程',
    icon: '🧰',
    title: 'SDK、项目系统与 NuGet',
    content: `## 第七十九章　SDK、项目系统与 NuGet

生产开发不是只写 \`.cs\` 文件。你还必须理解 SDK、项目文件、依赖锁定、构建配置和可重复构建。

### 一、解决方案与项目

\`\`\`bash
dotnet new sln -n Shop
dotnet new webapi -n Shop.Api
dotnet new classlib -n Shop.Application
dotnet new classlib -n Shop.Domain
dotnet new xunit -n Shop.Tests
dotnet sln add **/*.csproj
dotnet add Shop.Api reference Shop.Application
\`\`\`

- \`.slnx\` / \`.sln\` 组织多个项目；项目引用表达编译依赖。
- 领域层不应引用 Web、数据库等基础设施层。
- \`Directory.Build.props\` 统一可空检查、分析器和警告策略。
- \`Directory.Packages.props\` 用 Central Package Management 集中管理包版本。

### 二、生产级项目设置

\`\`\`xml
<PropertyGroup>
  <TargetFramework>net10.0</TargetFramework>
  <Nullable>enable</Nullable>
  <ImplicitUsings>enable</ImplicitUsings>
  <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
  <AnalysisLevel>latest-recommended</AnalysisLevel>
  <ContinuousIntegrationBuild Condition="'$(CI)' == 'true'">true</ContinuousIntegrationBuild>
</PropertyGroup>
\`\`\`

\`TreatWarningsAsErrors\` 适合团队项目，但第三方分析器升级可能突然增加警告；应固定 SDK 和包版本，并在升级 PR 中集中处理。

### 三、固定 SDK

提交 \`global.json\`，避免开发机和 CI 使用不同编译器：

\`\`\`json
{
  "sdk": {
    "version": "10.0.100",
    "rollForward": "latestPatch"
  }
}
\`\`\`

版本号应换成团队验证过的最新补丁，不要长期停留在首个补丁。

### 四、NuGet 安全与可重复性

- 应用项目提交 \`packages.lock.json\`，CI 使用 \`dotnet restore --locked-mode\`。
- 包源写入 \`NuGet.config\`；内部包启用 Package Source Mapping。
- 不要在项目文件、源码或 NuGet 配置中提交令牌。
- CI 运行 \`dotnet list package --vulnerable --include-transitive\`。
- 谨慎使用浮动版本；生产构建必须可重现。

### 五、常用命令

\`\`\`bash
dotnet restore --locked-mode
dotnet build --no-restore -c Release
dotnet test --no-build -c Release
dotnet publish src/Shop.Api -c Release -o artifacts/publish
dotnet format --verify-no-changes
\`\`\`

### 六、多目标与运行时标识符

库可以 \`<TargetFrameworks>net8.0;net10.0</TargetFrameworks>\` 多目标；应用通常只目标当前受支持版本。RID（如 \`linux-x64\`）只在自包含、Native AOT 或平台特定发布时需要。

### 生产检查

1. SDK、依赖和构建命令是否固定？
2. Release 构建是否把警告当错误？
3. CI 是否从干净环境 restore/build/test/publish？
`,
    code: `// 用代码读取当前运行时与构建信息；生产诊断中很有用
using System.Reflection;
using System.Runtime.InteropServices;

Console.WriteLine($"Framework: {RuntimeInformation.FrameworkDescription}");
Console.WriteLine($"OS: {RuntimeInformation.OSDescription}");
Console.WriteLine($"Architecture: {RuntimeInformation.ProcessArchitecture}");

var assembly = Assembly.GetExecutingAssembly().GetName();
Console.WriteLine($"Assembly: {assembly.Name}");
Console.WriteLine($"Version: {assembly.Version}");

#if DEBUG
Console.WriteLine("Configuration: Debug");
#else
Console.WriteLine("Configuration: Release");
#endif
`,
    lang: 'cs',
  },
  {
    id: 'csharp5-ch79',
    group: '第十四部分 现代 C# 与生产工程',
    icon: '✨',
    title: 'C# 13/14 现代语法',
    content: `## 第八十章　C# 13/14 现代语法

本书前面的交互示例采用 C# 12 兼容子集；生产新项目建议使用 .NET 10 LTS 默认的 C# 14。不要为了“新”而改写稳定代码，但应认识新语法并在能提升清晰度时使用。

### 一、C# 13 重点

- \`params\` 可用于 \`Span<T>\`、\`ReadOnlySpan<T>\` 和其他集合类型。
- 新的 \`Lock\` 类型配合 \`lock\`，更明确地表达线程同步。
- 部分场景允许 ref/unsafe 与迭代器、异步方法共存，但引用仍不能跨越 \`await\` / \`yield\`。
- 集合表达式支持自然索引器中的隐式 \`^\`。

\`\`\`csharp-snippet
// C# 13
static int Sum(params ReadOnlySpan<int> values)
{
    var total = 0;
    foreach (var value in values) total += value;
    return total;
}
\`\`\`

### 二、C# 14 重点

\`\`\`csharp-snippet
// field-backed property
public string Name
{
    get;
    set => field = string.IsNullOrWhiteSpace(value)
        ? throw new ArgumentException("Name is required")
        : value.Trim();
}

// null-conditional assignment
customer?.LastSeenAt = DateTimeOffset.UtcNow;

// extension members 必须写在 static class 里（C# 14）
public static class EnumerableExtensions
{
    extension(IEnumerable<int> source)
    {
        public int Median() => source.Order().ElementAt(source.Count() / 2);
    }
}
\`\`\`

C# 14 还支持更多 partial 成员、\`nameof(List<>)\`、简单 Lambda 参数修饰符，以及更自然的 Span 转换。

### 三、语言版本原则

- 不要在项目里长期设置 \`LangVersion=preview\`。
- 库作者应按目标框架和消费者范围选择语言版本。
- 新语法不自动等于更高性能；先以可读性为准，再用基准测试验证。
- 编译器警告和可空分析属于设计反馈，不应随意 \`#pragma disable\`。

### 四、兼容写法

下面 demo 使用 C# 12 也能运行，展示同样的设计目标：输入验证、不可变数据、模式匹配和集合表达式。
`,
    code: `// net8.0 / C# 12 兼容 demo；正文另列 C# 13/14 专属语法
var orders = new List<Order>
{
    new("A-100", 99m, OrderState.Paid),
    new("A-101", 20m, OrderState.Pending),
    new("A-102", 150m, OrderState.Paid),
};

var paidTotal = orders
    .Where(static order => order.State is OrderState.Paid)
    .Sum(static order => order.Amount);

Console.WriteLine($"Paid total: {paidTotal:C}");
Console.WriteLine(Describe(orders[0]));

static string Describe(Order order) => order switch
{
    { State: OrderState.Paid, Amount: >= 100m } => "large paid order",
    { State: OrderState.Paid } => "paid order",
    { State: OrderState.Pending } => "awaiting payment",
    _ => "closed order",
};

public enum OrderState { Pending, Paid, Cancelled }
public sealed record Order(string Id, decimal Amount, OrderState State);
`,
    lang: 'cs',
  },
  {
    id: 'csharp5-ch80',
    group: '第十四部分 现代 C# 与生产工程',
    icon: '🏛️',
    title: '架构、SOLID 与边界',
    content: `## 第八十一章　架构、SOLID 与边界

生产代码的核心不是套用“几层架构”，而是控制依赖方向、保护业务不变量，并让变化局限在边界。

### 一、推荐依赖方向

\`\`\`
Api / Worker  ──> Application ──> Domain
Infrastructure ─> Application / Domain abstractions
\`\`\`

- **Domain**：实体、值对象、领域规则，不依赖数据库或 HTTP。
- **Application**：用例、事务边界、端口接口。
- **Infrastructure**：EF Core、消息系统、外部 API 实现。
- **Host**：ASP.NET Core / Worker，负责组装 DI、配置和生命周期。

小项目不必强拆四个程序集；但业务规则与 IO 边界仍应分开。

### 二、SOLID 的实际含义

- SRP：一个模块只有一种变化原因，不是“一个类只能有一个方法”。
- OCP：用稳定抽象隔离变化，不为假想需求制造接口。
- LSP：替换实现后仍遵守语义、异常和前置条件。
- ISP：消费者只依赖所需能力。
- DIP：策略依赖抽象，组合根选择实现。

### 三、值对象保护不变量

金额、邮箱、订单号不应在系统中永远以裸 \`string\` / \`decimal\` 传播。值对象把验证、相等性和格式化放在一个位置。

### 四、错误模型

- 预期业务失败：返回显式 Result / 错误码。
- 编程错误或基础设施意外：抛异常，在边界统一转换和记录。
- 不要用异常做正常分支，也不要捕获后静默吞掉。

### 五、避免过度设计

Repository、CQRS、Mediator、DDD 都是工具，不是生产级认证。只有当它们降低复杂度时才引入；简单 CRUD 可以直接使用清晰的应用服务和 DbContext。
`,
    code: `var result = EmailAddress.Create(" User@Example.COM ");
if (!result.IsSuccess)
{
    Console.WriteLine(result.Error);
    return;
}

var customer = new Customer(Guid.NewGuid(), result.Value!);
Console.WriteLine(customer);

public sealed record EmailAddress
{
    public string Value { get; }
    private EmailAddress(string value) => Value = value;

    public static Result<EmailAddress> Create(string? input)
    {
        var value = input?.Trim().ToLowerInvariant();
        return string.IsNullOrWhiteSpace(value) || !value.Contains('@')
            ? Result<EmailAddress>.Failure("Invalid email")
            : Result<EmailAddress>.Success(new EmailAddress(value));
    }

    public override string ToString() => Value;
}

public sealed record Customer(Guid Id, EmailAddress Email);
public sealed record Result<T>(T? Value, string? Error)
{
    public bool IsSuccess => Error is null;
    public static Result<T> Success(T value) => new(value, null);
    public static Result<T> Failure(string error) => new(default, error);
}
`,
    lang: 'cs',
  },
  {
    id: 'csharp5-ch81',
    group: '第十四部分 现代 C# 与生产工程',
    icon: '🔌',
    title: '生产级 Web API 设计',
    content: `## 第八十二章　生产级 Web API 设计

能返回 JSON 只是起点。生产 API 还要有稳定契约、验证、错误格式、并发语义、限流和兼容策略。

### 一、宿主基础配置（.NET 10）

\`\`\`csharp-snippet
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();
builder.Services.AddHealthChecks();

var app = builder.Build();
app.UseExceptionHandler();
app.UseStatusCodePages();
app.MapOpenApi();
app.MapHealthChecks("/health/live");
app.MapGet("/orders/{id:guid}", ...);
app.Run();
\`\`\`

内置 OpenAPI 是现代模板的基础；需要交互式 UI 时再选择 Scalar 等 UI。旧项目使用 Swashbuckle 不等于错误，但不要混用两套注册。

### 二、契约原则

- DTO 与数据库实体分离，避免 over-posting 和意外泄露字段。
- 输入在边界验证；业务不变量仍由领域层保护。
- 返回 RFC 9457 Problem Details，并使用稳定的业务错误码。
- 创建返回 201 + Location；异步长任务可返回 202。
- 分页设置上限，优先 cursor/keyset pagination 处理大数据。

### 三、幂等与并发

- PUT 通常应幂等；支付、下单等 POST 用 Idempotency-Key。
- 更新支持 ETag / If-Match 或版本字段，冲突返回 409/412。
- 不要在服务器重试非幂等请求，除非协议能去重。

### 四、取消与超时

Minimal API 可直接注入 \`CancellationToken\`，它会关联客户端断开。把它传到 EF Core、HttpClient 和其他异步 API，但应用级关键提交要明确事务语义，不能机械地层层取消。

### 五、版本演进

优先做向后兼容的加法：新增可选字段、容忍未知字段。删除/改名/改变含义属于破坏性变更，应通过版本端点或协商策略迁移，并公布弃用期限。
`,
    code: `// 用纯 C# 模拟边界验证和统一 Problem Details
var response = CreateOrder(new CreateOrderRequest("", -1m));
Console.WriteLine($"{response.Status}: {response.Problem?.Title}");
foreach (var error in response.Problem?.Errors ?? [])
    Console.WriteLine($"{error.Key}: {string.Join(", ", error.Value)}");

static ApiResponse CreateOrder(CreateOrderRequest request)
{
    var errors = new Dictionary<string, string[]>();
    if (string.IsNullOrWhiteSpace(request.ProductId))
        errors["productId"] = ["ProductId is required"];
    if (request.Amount <= 0)
        errors["amount"] = ["Amount must be positive"];

    return errors.Count > 0
        ? new(400, null, new("Validation failed", "validation_error", errors))
        : new(201, new { id = Guid.NewGuid() }, null);
}

public sealed record CreateOrderRequest(string ProductId, decimal Amount);
public sealed record Problem(string Title, string Code, Dictionary<string, string[]> Errors);
public sealed record ApiResponse(int Status, object? Body, Problem? Problem);
`,
    lang: 'cs',
  },
  {
    id: 'csharp5-ch82',
    group: '第十四部分 现代 C# 与生产工程',
    icon: '🔐',
    title: '认证、授权与安全',
    content: `## 第八十三章　认证、授权与安全

安全不是最后加一个 JWT 中间件。它贯穿身份、权限、输入、密钥、依赖、日志和部署。

### 一、认证与授权要分开

- **认证**回答“你是谁”；**授权**回答“你能做什么”。
- 优先采用 OpenID Connect / OAuth 2.0 的成熟身份提供商。
- API 验证访问令牌的签名、issuer、audience、有效期和算法。
- 不要自己实现密码哈希、令牌协议或加密格式。
- 授权使用 policy/claim/resource-based authorization，不在控制器散落角色字符串。

### 二、JWT 常见错误

- 把敏感信息放进 JWT：JWT 通常只是签名，不是加密。
- 关闭 issuer/audience/过期验证。
- 接受客户端指定的算法。
- 访问令牌过长且无法撤销；应使用短期令牌和轮换机制。
- 用 localStorage 保存高价值浏览器会话而忽略 XSS 风险；具体存储方案必须结合 BFF、Cookie、CSRF 策略评估。

### 三、密钥与配置

- 开发使用 User Secrets；生产使用云密钥库或编排平台 Secret。
- 密钥不得写入仓库、镜像层、日志和异常详情。
- 设计轮换；应用应能同时接受新旧密钥的短暂重叠。

### 四、Web 安全清单

- 全程 HTTPS；正确配置反向代理 Forwarded Headers 和可信代理。
- Cookie 设置 Secure、HttpOnly、合适的 SameSite；Cookie 认证必须防 CSRF。
- CORS 是浏览器读取策略，不是认证或防火墙；只允许明确来源。
- 限制请求体、上传类型和解压大小，防止资源耗尽与 Zip Bomb。
- 数据库参数化；输出按上下文编码；禁止拼接 SQL/HTML/shell。
- 日志脱敏，避免令牌、Cookie、密码、连接串和个人数据。
- 定期扫描传递依赖、容器镜像和泄露凭据。

### 五、密码

必须使用 ASP.NET Core Identity 或成熟库提供的自适应密码哈希（如 PBKDF2/Argon2id），每个密码独立盐值，并支持成本升级。普通 SHA-256 即使加盐也不适合存密码。
`,
    code: `// 资源级授权：策略应基于事实，不散落魔法角色字符串
var user = new UserContext("u-1", ["orders.read"], TenantId: "tenant-a");
var order = new Order("o-1", "tenant-a", OwnerId: "u-2");

Console.WriteLine(CanReadOrder(user, order));

static bool CanReadOrder(UserContext user, Order order) =>
    user.Permissions.Contains("orders.read", StringComparer.Ordinal)
    && string.Equals(user.TenantId, order.TenantId, StringComparison.Ordinal);

public sealed record UserContext(
    string UserId,
    IReadOnlyCollection<string> Permissions,
    string TenantId);
public sealed record Order(string Id, string TenantId, string OwnerId);
`,
    lang: 'cs',
  },
  {
    id: 'csharp5-ch83',
    group: '第十四部分 现代 C# 与生产工程',
    icon: '🗃️',
    title: '数据一致性与 EF Core 生产实践',
    content: `## 第八十四章　数据一致性与 EF Core 生产实践

EF Core 章节讲了 CRUD；生产环境还必须处理 DbContext 生命周期、查询形状、迁移、并发和跨系统一致性。

### 一、DbContext 生命周期

- Web 请求通常每请求一个 scoped DbContext。
- DbContext **不是线程安全的**，不要并行使用同一实例。
- 不要把实体或 IQueryable 缓存在请求之外。
- 后台并行任务使用 \`IDbContextFactory<T>\` 为每个单元创建上下文。

### 二、查询设计

- 投影为 DTO，只取需要的列。
- 只读查询用 \`AsNoTracking\`；身份合并需要时用 \`AsNoTrackingWithIdentityResolution\`。
- 避免循环中查询导致 N+1；检查生成 SQL 和执行计划。
- 大结果集用 keyset pagination；不要无上限 \`ToListAsync()\`。
- \`Include\` 不是越多越好；评估单查询、拆分查询和投影。

### 三、迁移与发布

- 生产迁移由发布流水线生成并审阅 SQL 脚本，不建议每个应用实例启动时并发迁移。
- 采用 expand/contract：先加兼容结构，再部署双读/双写或回填，最后删除旧结构。
- 大表变更要评估锁、日志量和回滚时间。

### 四、并发、事务与瞬态重试

- 乐观并发令牌冲突时捕获 \`DbUpdateConcurrencyException\`，重新读取并决定合并、重试或返回冲突。
- \`SaveChanges\` 自身具有事务性；只有跨多个 SaveChanges 或混合操作时才显式事务。
- 不要盲目重试整个事务；重试必须重新执行完整事务并保证副作用安全。

\`\`\`csharp-snippet
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connection, npgsql =>
        npgsql.EnableRetryOnFailure(maxRetryCount: 5)));
\`\`\`

\`EnableRetryOnFailure\` 会在暂时性故障时重试。如果自己写了 \`BeginTransaction\`，必须把整段工作放进 \`IExecutionStrategy.ExecuteAsync\`，否则会出现「不支持用户发起的事务」或重试时只重放一半。重试次数用尽仍要失败并告警，不能在请求线程里无限转圈。

### 五、Outbox

数据库提交和消息发布不能用普通 try/catch 实现原子性。把业务变更和 outbox 事件写入同一数据库事务，后台发布并记录完成；消费者仍要按消息 ID 去重，因为交付通常是“至少一次”。
`,
    code: `// 1) 乐观并发：更新必须携带读到的版本。
// 2) 瞬态故障：只有整段事务可重放时才能重试（对应 EF 的 IExecutionStrategy）。
var store = new Dictionary<string, Account>
{
    ["a-1"] = new("a-1", 100m, Version: 3),
};

Console.WriteLine(TryWithdraw(store, "a-1", 30m, expectedVersion: 3));
Console.WriteLine(TryWithdraw(store, "a-1", 20m, expectedVersion: 3));

int attempts = 0;
string result = ExecuteWithRetry(() =>
{
    attempts++;
    if (attempts < 3)
        throw new TimeoutException("暂时性数据库错误");
    return "committed";
});
Console.WriteLine($"重试后：{result}（attempts={attempts}）");

static string TryWithdraw(
    Dictionary<string, Account> store,
    string id,
    decimal amount,
    long expectedVersion)
{
    var current = store[id];
    if (current.Version != expectedVersion) return "409 concurrency conflict";
    if (amount <= 0 || current.Balance < amount) return "business rule rejected";
    store[id] = current with
    {
        Balance = current.Balance - amount,
        Version = current.Version + 1,
    };
    return "updated";
}

static string ExecuteWithRetry(Func<string> work)
{
    const int maxAttempts = 5;
    for (int attempt = 1; attempt <= maxAttempts; attempt++)
    {
        try
        {
            return work(); // 必须重放完整事务，不能只重放 Commit
        }
        catch (TimeoutException) when (attempt < maxAttempts)
        {
            Console.WriteLine($"瞬态失败，重试 {attempt}/{maxAttempts}");
        }
    }
    throw new InvalidOperationException("重试次数用尽");
}

public sealed record Account(string Id, decimal Balance, long Version);
`,
    lang: 'cs',
  },
  {
    id: 'csharp5-ch84',
    group: '第十四部分 现代 C# 与生产工程',
    icon: '🛡️',
    title: 'HTTP 韧性、限流与缓存',
    content: `## 第八十五章　HTTP 韧性、限流与缓存

分布式调用一定会出现超时、暂时故障和过载。目标不是“永不失败”，而是在预算内失败、避免放大故障并可恢复。

### 一、现代 HttpClient 配置

\`\`\`csharp-snippet
builder.Services.AddHttpClient<CatalogClient>(client =>
{
    client.BaseAddress = new Uri(configuration["Catalog:BaseUrl"]!);
})
.AddStandardResilienceHandler(options =>
{
    options.TotalRequestTimeout.Timeout = TimeSpan.FromSeconds(10);
    options.AttemptTimeout.Timeout = TimeSpan.FromSeconds(3);
});
\`\`\`

\`Microsoft.Extensions.Http.Resilience\` 的标准处理器组合限速、总超时、重试、断路器和单次尝试超时。旧的 \`AddTransientHttpErrorPolicy\` 属于早期 Polly 集成，新项目优先使用 resilience handler。

### 二、重试原则

- 只重试暂时故障，并使用指数退避 + jitter。
- GET 等幂等请求通常可重试；POST 必须先有幂等键或业务去重。
- 429 遵守 Retry-After；不要让所有实例同时重试。
- 设置总时间预算，避免多层各重试三次造成重试风暴。

### 三、超时、断路器、隔离

- 连接、单次尝试、总请求分别设预算。
- 断路器减少对已故障依赖的压力，不是修复服务。
- 用并发限制 / bulkhead 阻止一个依赖耗尽全部连接和线程。
- 降级数据必须标记新鲜度，不能悄悄返回错误结果。

### 四、服务端限流

ASP.NET Core Rate Limiting 支持 fixed window、sliding window、token bucket 和 concurrency limiter。按经过认证的租户/用户分区；IP 只适合作为辅助信号。返回 429 并提供 Retry-After。

### 五、缓存

- cache-aside：读缓存，未命中读源并回填；写后失效或更新。
- 缓存键必须包含租户、权限、区域等影响结果的维度。
- TTL 加随机抖动；热点键用请求合并防击穿。
- 分布式缓存不提供数据库事务；接受并设计最终一致性。
- 绝不能缓存未经隔离的用户敏感响应。
`,
    code: `// 指数退避 + jitter 计算示例；真实项目交给 resilience handler
var random = new Random(42);
for (var attempt = 0; attempt < 5; attempt++)
{
    var delay = Backoff(attempt, TimeSpan.FromMilliseconds(200), random);
    Console.WriteLine($"attempt {attempt + 1}: wait {delay.TotalMilliseconds:F0} ms");
}

static TimeSpan Backoff(int attempt, TimeSpan seed, Random random)
{
    var exponential = seed.TotalMilliseconds * Math.Pow(2, attempt);
    var jitter = random.NextDouble() * seed.TotalMilliseconds;
    return TimeSpan.FromMilliseconds(Math.Min(exponential + jitter, 10_000));
}
`,
    lang: 'cs',
  },
  {
    id: 'csharp5-ch85',
    group: '第十四部分 现代 C# 与生产工程',
    icon: '⚙️',
    title: '后台服务、队列与消息',
    content: `## 第八十六章　后台服务、队列与消息

定时任务、消息消费、邮件发送和批处理不应绑在 HTTP 请求生命周期里。

### 一、BackgroundService

\`\`\`csharp-snippet
public sealed class OutboxWorker(
    IServiceScopeFactory scopeFactory,
    ILogger<OutboxWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await using var scope = scopeFactory.CreateAsyncScope();
            await scope.ServiceProvider
                .GetRequiredService<OutboxPublisher>()
                .PublishBatchAsync(stoppingToken);
            await Task.Delay(TimeSpan.FromSeconds(1), stoppingToken);
        }
    }
}
\`\`\`

- Singleton hosted service 不能直接持有 scoped DbContext；每批创建 scope。
- 所有等待和 IO 接收 \`stoppingToken\`。
- 停机停止拉取新任务，给在途任务有限时间完成。
- 未处理异常可能停止宿主；明确告警和重启策略。

### 二、Channel 进程内队列

使用有界 Channel 提供背压。队列满时选择等待、拒绝或丢弃，不能默认无限增长。进程崩溃会丢内存消息，关键任务必须用持久化 broker。

### 三、消息交付语义

- 常见 broker 提供 at-least-once，因此消费者必须幂等。
- “exactly once”通常只在有限边界内成立，不能消除所有外部副作用重复。
- 消息带唯一 ID、schema 版本、correlation/trace 信息和发生时间。
- 失败分瞬时与永久；有限重试后进入死信队列并告警。
- 先成功处理并持久化，再 ack；处理超时要考虑 visibility/lock 延长。

### 四、定时任务

单实例 \`PeriodicTimer\` 适合简单维护任务。多副本环境需要分布式租约或 Quartz/Hangfire 等持久化调度器，避免每个副本重复执行。
`,
    code: `using System.Threading.Channels;

var queue = Channel.CreateBounded<WorkItem>(new BoundedChannelOptions(2)
{
    FullMode = BoundedChannelFullMode.Wait,
    SingleReader = true,
});

var consumer = Task.Run(async () =>
{
    await foreach (var item in queue.Reader.ReadAllAsync())
        Console.WriteLine($"processed {item.Id}: {item.Name}");
});

for (var i = 1; i <= 4; i++)
    await queue.Writer.WriteAsync(new WorkItem(Guid.NewGuid(), $"job-{i}"));

queue.Writer.Complete();
await consumer;

public sealed record WorkItem(Guid Id, string Name);
`,
    lang: 'cs',
  },
  {
    id: 'csharp5-ch86',
    group: '第十四部分 现代 C# 与生产工程',
    icon: '📈',
    title: '可观测性与运行诊断',
    content: `## 第八十七章　可观测性与运行诊断

可观测性不是“多打日志”，而是让系统能回答：发生了什么、影响谁、瓶颈在哪、是否恢复。

### 一、三大信号

- **Logs**：离散事件，使用结构化字段。
- **Metrics**：可聚合数值，用于趋势和告警。
- **Traces**：一次请求跨服务的因果链。

OpenTelemetry 统一采集和导出；应用代码优先使用 \`ILogger\`、\`ActivitySource\`、\`Meter\` 等标准 API，后端可替换。

### 二、结构化日志

\`\`\`csharp-snippet
logger.LogInformation(
    "Order {OrderId} paid in {ElapsedMs} ms",
    orderId, elapsed.TotalMilliseconds);
\`\`\`

不要用字符串插值替代消息模板；模板字段才能被日志后端索引。异常对象放第一个参数。使用 scope 附加 tenant、request 等上下文，但控制基数和敏感信息。

### 三、Metrics 原则

- Counter：累计请求/错误。
- Histogram：延迟、大小；比只记录平均值更能反映尾延迟。
- ObservableGauge：队列深度等当前观测值。
- 标签必须低基数；禁止把用户 ID、订单 ID、完整 URL 作为 metric 标签。

### 四、Tracing 原则

W3C Trace Context 跨进程传播。外部调用创建 span，记录状态和低基数标签。采样降低成本，但错误和慢请求策略应可配置。

### 五、健康检查

- liveness：进程是否卡死；不要依赖所有下游。
- readiness：实例是否能接流量，可检查关键初始化。
- startup：慢启动应用是否已完成初始化。

错误地把数据库短暂故障放进 liveness 会导致所有实例重启并放大事故。

### 六、生产诊断工具

\`dotnet-counters\` 看实时指标，\`dotnet-trace\` 收集 EventPipe trace，\`dotnet-dump\` 分析转储，\`dotnet-gcdump\` 分析托管堆。先观察再优化，保留事件时间线和部署版本信息。
`,
    code: `using System.Diagnostics;
using System.Diagnostics.Metrics;

using var listener = new ActivityListener
{
    ShouldListenTo = source => source.Name == "Shop",
    Sample = (ref ActivityCreationOptions<ActivityContext> _) =>
        ActivitySamplingResult.AllData,
};
ActivitySource.AddActivityListener(listener);

using var source = new ActivitySource("Shop");
using var meter = new Meter("Shop");
var counter = meter.CreateCounter<long>("orders.created");

using var activity = source.StartActivity("CreateOrder");
activity?.SetTag("order.channel", "web");
counter.Add(1, new KeyValuePair<string, object?>("channel", "web"));

Console.WriteLine($"traceId={activity?.TraceId}");
`,
    lang: 'cs',
  },
  {
    id: 'csharp5-ch87',
    group: '第十四部分 现代 C# 与生产工程',
    icon: '🧪',
    title: '测试策略与集成测试',
    content: `## 第八十八章　测试策略与集成测试

只有 Mock 的单元测试无法证明数据库映射、序列化、认证和中间件真的能协作。

### 一、测试分层

- 单元测试：纯业务规则，快速、确定、无 IO。
- 组件/集成测试：真实 DI、数据库、HTTP 管线或 broker。
- 契约测试：验证消费者和提供者对协议的共同理解。
- 端到端测试：少量覆盖关键用户路径。

测试比例取决于风险，不必追求固定金字塔数字或 100% 覆盖率。

### 二、高质量测试

- 测行为，不锁死内部实现。
- Arrange / Act / Assert 清晰，一个失败说明一个原因。
- 时间、随机数、外部 IO 通过显式边界控制。
- 并行测试不共享可变静态状态。
- 测试数据使用 builder/factory，避免脆弱的大型 fixture。

### 三、ASP.NET Core 集成测试

\`WebApplicationFactory<Program>\` 在进程内启动测试宿主，通过真实 HttpClient 验证路由、中间件、认证和 JSON。需要让顶级 Program 可被测试项目访问时，可添加 \`public partial class Program { }\`。

### 四、真实依赖

数据库行为与 provider 强相关；不要用 EF Core InMemory 推断 SQL Server/PostgreSQL 行为。Testcontainers 可在测试期间启动真实数据库。固定镜像版本、隔离数据，并允许本地无容器环境跳过明确标记的测试。

### 五、异步和并发测试

- 测试方法返回 Task，禁止 \`.Wait()\` / \`.Result\`。
- 用可控 TaskCompletionSource 协调并发，不靠 \`Thread.Sleep\` 猜时序。
- 给测试设置总超时，失败时保留日志。
`,
    code: `// 一个可测试的业务规则，不依赖时钟和数据库
var policy = new RefundPolicy(TimeSpan.FromDays(14));
var purchasedAt = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);

Assert(policy.CanRefund(purchasedAt, purchasedAt.AddDays(13)), "day 13");
Assert(!policy.CanRefund(purchasedAt, purchasedAt.AddDays(15)), "day 15");
Console.WriteLine("tests passed");

static void Assert(bool condition, string scenario)
{
    if (!condition) throw new Exception($"failed: {scenario}");
}

public sealed class RefundPolicy(TimeSpan window)
{
    public bool CanRefund(DateTimeOffset purchasedAt, DateTimeOffset now) =>
        now >= purchasedAt && now - purchasedAt <= window;
}
`,
    lang: 'cs',
  },
  {
    id: 'csharp5-ch88',
    group: '第十四部分 现代 C# 与生产工程',
    icon: '📦',
    title: '容器、配置与优雅停机',
    content: `## 第八十九章　容器、配置与优雅停机

容器不是虚拟机。应用应无状态、快速启动、响应终止信号，并把状态放到外部持久化服务。

### 一、发布模式

- framework-dependent：镜像需要 .NET Runtime，体积和兼容性平衡好。
- self-contained：携带运行时，需按 RID 发布。
- Native AOT：启动和内存优秀，但反射、动态代码和库兼容性需验证。

先测量启动、吞吐、内存、镜像和构建成本再选择。

### 二、多阶段 Dockerfile

\`\`\`dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish src/Shop.Api -c Release -o /app --no-self-contained

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
USER $APP_UID
COPY --from=build /app .
ENTRYPOINT ["dotnet", "Shop.Api.dll"]
\`\`\`

生产中固定经过验证的镜像 digest，并由自动化定期升级。使用非 root 用户、只读文件系统、最小 Linux capabilities，不把 secret COPY 进镜像。

### 三、环境配置

配置优先级通常是 appsettings → 环境文件 → 环境变量 → 命令行。环境变量嵌套键用双下划线，如 \`ConnectionStrings__Main\`。启动时验证必需选项并快速失败。

### 四、优雅停机

Kubernetes / Docker 发送 SIGTERM 后，ASP.NET Core 停止接收新请求并等待在途请求。设置合理 termination grace period；后台消费者停止拉取、完成或放回在途消息。不要依赖 finally 一定执行，关键状态必须持续持久化。

### 五、探针与资源

startup/readiness/liveness 语义分离。设置 CPU/内存 request 和 limit，并做负载测试；内存限制会影响 GC 行为。只读根文件系统下，临时文件写入显式挂载的受限目录。
`,
    code: `// Generic Host 中的服务应尊重取消信号；这里模拟优雅停机
using var shutdown = new CancellationTokenSource();
var worker = RunWorkerAsync(shutdown.Token);

await Task.Delay(80);
shutdown.Cancel();
await worker;

static async Task RunWorkerAsync(CancellationToken stoppingToken)
{
    try
    {
        while (true)
        {
            Console.WriteLine("processed batch");
            await Task.Delay(30, stoppingToken);
        }
    }
    catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
    {
        Console.WriteLine("graceful shutdown");
    }
}
`,
    lang: 'cs',
  },
  {
    id: 'csharp5-ch89',
    group: '第十四部分 现代 C# 与生产工程',
    icon: '🚀',
    title: 'CI/CD 与供应链',
    content: `## 第九十章　CI/CD 与供应链

流水线的目标是让每次变更经过同一套可审计、可重复的验证和发布过程。

### 一、持续集成门禁

\`\`\`bash
dotnet restore --locked-mode
dotnet format --verify-no-changes
dotnet build --no-restore -c Release
dotnet test --no-build -c Release --collect:"XPlat Code Coverage"
dotnet list package --vulnerable --include-transitive
dotnet publish src/Shop.Api --no-build -c Release
\`\`\`

另外运行 secret scanning、SAST、许可证策略和容器扫描。扫描结果应有负责人、严重性阈值和有期限的例外，不要生成无人处理的报告。

### 二、制品原则

- build once, promote same artifact：测试过的制品原样晋级。
- 制品附版本、Git commit、SBOM 和签名。
- 禁止在生产机器现场编译。
- 保存足够的构建证明和依赖清单以便追溯。

### 三、部署策略

- rolling：简单，但新旧版本会短暂共存，API/数据库必须兼容。
- blue-green：切流快，资源成本较高。
- canary：先给少量流量，根据错误率、延迟和业务指标自动判断。

部署成功不等于进程启动成功。发布验证应检查 readiness、关键合成请求、错误预算和核心业务指标。

### 四、回滚与数据库

应用制品可以快速回滚，破坏性数据库迁移通常不能。采用 expand/contract，使旧版和新版在迁移窗口共存。发布前写清“停止条件、回滚动作、数据修复负责人”。

### 五、版本与变更

库遵循语义化版本；服务 API 使用明确兼容策略。自动生成变更日志可以辅助，但面向用户的破坏性变更、迁移步骤和安全修复必须人工说明。
`,
    code: `// 将提交信息注入程序集后，可在 /version 或启动日志中暴露
var build = new BuildInfo(
    Version: "2.3.0",
    Commit: "a1b2c3d",
    BuiltAt: DateTimeOffset.Parse("2026-09-09T08:00:00Z"));

Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(build));

public sealed record BuildInfo(
    string Version,
    string Commit,
    DateTimeOffset BuiltAt);
`,
    lang: 'cs',
  },
  {
    id: 'csharp5-ch90',
    group: '第十四部分 现代 C# 与生产工程',
    icon: '🌍',
    title: '分布式系统基本功',
    content: `## 第九十一章　分布式系统基本功

单体跨进程后，函数调用变成了可能超时、重复、乱序和部分成功的网络调用。

### 一、必须接受的事实

- 网络延迟不为零，调用可能“服务端成功但客户端没收到响应”。
- 时钟会漂移，不能用本地时间推断全局严格顺序。
- 消息可能重复或乱序。
- 服务、数据库和消息系统不可能靠普通 try/catch 组成原子事务。

### 二、设计方法

- 每个调用有 deadline，并把剩余预算向下游传播。
- 命令携带幂等键，服务端保存处理结果或去重记录。
- 事件携带唯一 ID、版本、发生时间；消费者按 ID 幂等。
- 用 saga/补偿处理跨服务长事务，不伪装成强一致事务。
- 避免同步调用链过长；明确故障域和降级语义。

### 三、多租户

租户标识来自可信认证上下文，而不是任意请求字段。查询、缓存、消息、日志和对象存储键都必须隔离租户。数据库层可增加 row-level security 等纵深防御。

### 四、时间

业务时间使用 \`DateTimeOffset\` 或 Noda Time 的明确时区类型；存储通常统一 UTC。日历规则（当地午夜、夏令时、节假日）不能只用 \`TimeSpan\`。测试通过 \`TimeProvider\` 注入时间。

### 五、ID

随机 GUID 简单可靠；高写入数据库可评估有序 ID，但不要从 ID 暴露业务数量或安全边界。全局唯一不等于不可猜测授权。
`,
    code: `// 幂等命令处理：相同 key 返回第一次的结果
var processed = new Dictionary<string, Receipt>();
Console.WriteLine(Handle("key-123", 50m, processed));
Console.WriteLine(Handle("key-123", 50m, processed));

static Receipt Handle(
    string idempotencyKey,
    decimal amount,
    Dictionary<string, Receipt> processed)
{
    if (processed.TryGetValue(idempotencyKey, out var existing))
        return existing;

    var receipt = new Receipt(Guid.NewGuid(), amount, DateTimeOffset.UtcNow);
    processed[idempotencyKey] = receipt;
    return receipt;
}

public sealed record Receipt(Guid PaymentId, decimal Amount, DateTimeOffset CreatedAt);
`,
    lang: 'cs',
  },
  {
    id: 'csharp5-ch91',
    group: '第十四部分 现代 C# 与生产工程',
    icon: '✅',
    title: '生产就绪清单与毕业项目',
    content: `## 第九十二章　生产就绪清单与毕业项目

教程能提供知识地图，不能保证任何人“学完就不会出问题”。生产能力来自持续编码、评审、测试、发布和事故复盘。请用下面的毕业项目证明自己真正掌握了关键路径。

### 一、毕业项目

实现一个订单 API：

- ASP.NET Core Minimal API 或 Controllers。
- PostgreSQL / SQL Server + EF Core 迁移。
- OIDC/JWT 认证与基于资源的授权。
- 创建订单支持 Idempotency-Key。
- 乐观并发更新库存。
- outbox 发布 \`OrderCreated\`，幂等消费者处理。
- 标准 resilience handler 调用库存/支付模拟服务。
- Problem Details、分页、输入验证。
- OpenTelemetry logs/metrics/traces 和三类健康探针。
- 单元测试、WebApplicationFactory 集成测试、真实数据库容器测试。
- 非 root 容器、CI 门禁、滚动部署与回滚说明。

### 二、代码评审清单

- 输入是否可信？授权是否在服务端按资源检查？
- 可空、异常、取消和超时语义是否明确？
- 是否存在同步阻塞异步、无界并发或无界缓存/队列？
- DbContext 是否跨线程或跨 scope 使用？
- SQL、日志、指标标签是否可能泄密或高基数？
- 重试的操作是否幂等？总时间预算是多少？
- 新旧版本和数据库 schema 能否在部署窗口共存？

### 三、运行清单

- SLO、告警和 dashboard 是否围绕用户影响？
- runbook 是否说明诊断、降级和恢复步骤？
- secret、证书、依赖和基础镜像能否轮换升级？
- 备份是否实际做过恢复演练？
- 容量、峰值、依赖故障和优雅停机是否压测？
- 谁值班、谁能回滚、谁负责数据修复？

### 四、学习路线

1. 完成本教程所有基础 demo。
2. 独立完成毕业项目，不复制模拟容器。
3. 请同伴做安全、数据和可运维性评审。
4. 部署到测试环境，注入超时、重复消息、数据库冲突和 SIGTERM。
5. 根据观测证据修复，再进行一次演练。

做到这些，你才从“会写 C#”迈向“能负责 C# 生产服务”。
`,
    code: `var checks = new[]
{
    new Check("nullable enabled", true),
    new Check("tests green", true),
    new Check("secrets externalized", true),
    new Check("rollback rehearsed", false),
};

foreach (var check in checks)
    Console.WriteLine($"[{(check.Passed ? "PASS" : "BLOCK")}] {check.Name}");

if (checks.Any(static check => !check.Passed))
    Console.WriteLine("Release blocked: resolve all BLOCK items.");

public sealed record Check(string Name, bool Passed);
`,
    lang: 'cs',
  },
];

export { chapters };
