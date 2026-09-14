// =============================================================
// C# 从零基础到生产上线 —— 第 17 批
// 第二十一部分 生产深水区（10 章）
// -------------------------------------------------------------
// 主 demo 与正文 ```csharp 块必须是完整可运行程序（net8 / C# 12）。
// 真实 ASP.NET / EF / Aspire 片段使用 csharp-snippet，避免点「运行」失败。
// =============================================================

export const csharp5Batch17Groups = [
  "第二十一部分 生产深水区",
];

const chapters = [
  {
    id: "csharp5-ch126",
    group: "第二十一部分 生产深水区",
    icon: "✅",
    title: "输入验证、绑定与错误形状",
    content: `## 第一百二十七章　输入验证、绑定与错误形状

生产 API 的第一道门是：**不信任输入**。验证失败要返回稳定、可机器处理的错误，而不是把异常堆栈丢给客户端。

### 一、三层校验

1. **传输层**：JSON 能否解析、字段类型是否匹配、body 是否超限。
2. **输入层**：必填、范围、格式、集合长度。可用 DataAnnotations 或 FluentValidation。
3. **领域层**：库存是否足够、状态机是否允许跳转。这不是「格式校验」，失败通常是 409/422。

\`\`\`csharp-snippet
app.MapPost("/orders", (CreateOrderRequest request) =>
{
    // DataAnnotations 不会自动跑；Minimal API 需显式校验或使用过滤器
});
\`\`\`

### 二、绑定陷阱

- \`[FromRoute]\` / \`[FromQuery]\` / \`[FromBody]\` 要明确，避免一个对象从多个来源拼出来。
- 不要绑定直接映射到 EF 实体：会 over-posting（客户端改 \`Total\`、\`TenantId\`）。
- 文件、超大 JSON 必须限制大小；反序列化失败返回 400，不要 500。

### 三、错误形状

统一 RFC 9457：\`type\`、\`title\`、\`status\`、\`detail\`、字段级 \`errors\`。客户端应按 \`code\` 分支，不要解析中文句子。

下面 demo 把「格式校验」和「业务规则」分开，这是生产里最容易混在一起的点。
`,
    code: `// 输入验证 demo：格式错误用 400，业务规则冲突用 409。
// 生产中由 ASP.NET 模型绑定 + ProblemDetails 完成同样的分流。
var samples = new[]
{
    new CreateOrderInput("", 2, "CNY"),          // 缺货品
    new CreateOrderInput("sku-1", 0, "CNY"),     // 数量非法
    new CreateOrderInput("sku-1", 3, "USD"),     // 业务：本店只收人民币
    new CreateOrderInput("sku-1", 2, "CNY"),     // 通过
};

foreach (var input in samples)
{
    var result = Validate(input);
    Console.WriteLine($"{result.Status} {result.Code}: {result.Detail}");
}

static ValidationResult Validate(CreateOrderInput input)
{
    var fieldErrors = new List<string>();
    if (string.IsNullOrWhiteSpace(input.Sku)) fieldErrors.Add("sku 必填");
    if (input.Quantity is < 1 or > 99) fieldErrors.Add("quantity 必须在 1-99");
    if (fieldErrors.Count > 0)
        return new(400, "validation_error", string.Join("；", fieldErrors));

    // 领域规则：不是格式问题，不能用 400 糊弄过去
    if (!string.Equals(input.Currency, "CNY", StringComparison.OrdinalIgnoreCase))
        return new(409, "currency_not_supported", "当前店铺只接受 CNY");

    return new(201, "created", $"order for {input.Sku} x{input.Quantity}");
}

public sealed record CreateOrderInput(string Sku, int Quantity, string Currency);
public sealed record ValidationResult(int Status, string Code, string Detail);
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch127",
    group: "第二十一部分 生产深水区",
    icon: "🔁",
    title: "幂等、分页与查询约定",
    content: `## 第一百二十八章　幂等、分页与查询约定

网络会重试。用户会连点。网关超时后客户端会再发一次。**非 GET 请求必须设计成可重复提交。**

### 一、Idempotency-Key

- 客户端生成 UUID，放在 \`Idempotency-Key\` 头。
- 服务端按 \`(tenant, key)\` 存第一次的请求指纹和响应。
- 相同 key + 相同 body → 返回第一次结果。
- 相同 key + 不同 body → 422，防止误用。
- 记录要有 TTL，并覆盖「处理中」状态，避免并发双写。

### 二、分页

深 \`OFFSET\` 会越翻越慢。生产列表用 **keyset/cursor**：按稳定唯一排序键继续往下取。

### 三、过滤与排序

排序字段必须走允许列表，禁止把用户字符串拼进 SQL。过滤条件要记录到日志/指标的低基数标签中，便于发现慢查询。
`,
    code: `// 幂等 + cursor 分页。HashSet 只是教学存储；生产用数据库唯一索引。
var store = new IdempotencyStore();
var first = store.Execute("tenant-a", "key-1", "sku=1,qty=2", () => "order-100");
var retry = store.Execute("tenant-a", "key-1", "sku=1,qty=2", () => "order-SHOULD-NOT-CREATE");
var conflict = store.Execute("tenant-a", "key-1", "sku=1,qty=9", () => "order-conflict");

Console.WriteLine($"首次：{first}");
Console.WriteLine($"重试：{retry}");
Console.WriteLine($"同 key 不同 body：{conflict}");

var page = KeysetPage(
    items: [1, 2, 3, 4, 5, 6, 7],
    after: 3,
    take: 3);
Console.WriteLine("下一页：" + string.Join(",", page));

static IEnumerable<int> KeysetPage(int[] items, int after, int take) =>
    items.Where(id => id > after).Take(take);

sealed class IdempotencyStore
{
    private readonly Dictionary<string, (string Fingerprint, string Response)> _records = new();

    public string Execute(string tenant, string key, string fingerprint, Func<string> create)
    {
        string id = $"{tenant}:{key}";
        if (_records.TryGetValue(id, out var existing))
        {
            return existing.Fingerprint == fingerprint
                ? existing.Response
                : "422 idempotency fingerprint mismatch";
        }

        string created = create();
        _records[id] = (fingerprint, created);
        return created;
    }
}
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch128",
    group: "第二十一部分 生产深水区",
    icon: "🛡️",
    title: "CORS、CSRF、安全头与上传",
    content: `## 第一百二十九章　CORS、CSRF、安全头与上传

浏览器安全不是「加一个中间件就结束」。CORS 管跨域读响应；CSRF 管带 Cookie 的写请求；上传管文件内容而不是扩展名。

### 一、CORS

- 允许的 Origin 必须是明确列表，不要生产环境 \`AllowAnyOrigin()\` + \`AllowCredentials()\`。
- CORS 不能替代授权。没有 Cookie/令牌，跨域也调不到你的数据——但有令牌时 CORS 配错会把 API 暴露给恶意站点。

### 二、CSRF

Cookie 会话（尤其 SameSite=Lax/None）需要防 CSRF：anti-forgery token、双重提交 Cookie，或改用 Bearer（然后防 XSS）。

### 三、安全头

生产至少考虑：\`Content-Security-Policy\`、\`X-Content-Type-Options: nosniff\`、\`Referrer-Policy\`、HSTS。API 纯 JSON 服务与带前端的 BFF 策略不同。

### 四、上传

- 限制大小、数量、速率。
- 用文件头魔数判断类型，不信 \`Content-Type\` 和文件名。
- 存到对象存储的随机 key；病毒扫描在隔离环境。
- 下载授权不能靠「URL 很难猜」。
`,
    code: `// 用魔数识别上传类型：扩展名可以伪造，文件头不能（仍需结合大小限制）。
byte[] png = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00];
byte[] fakePngNamedJpg = png;
byte[] text = "hello"u8.ToArray();

Console.WriteLine(Detect(fakePngNamedJpg));
Console.WriteLine(Detect(text));
Console.WriteLine(IsAllowedOrigin("https://shop.example.com",
    ["https://shop.example.com", "https://admin.example.com"]));
Console.WriteLine(IsAllowedOrigin("https://evil.example",
    ["https://shop.example.com"]));

static string Detect(ReadOnlySpan<byte> data)
{
    ReadOnlySpan<byte> pngMagic = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    if (data.StartsWith(pngMagic)) return "image/png";
    return "application/octet-stream";
}

static bool IsAllowedOrigin(string origin, string[] allowList) =>
    allowList.Contains(origin, StringComparer.OrdinalIgnoreCase);
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch129",
    group: "第二十一部分 生产深水区",
    icon: "🏠",
    title: "Generic Host、Keyed DI 与 Options",
    content: `## 第一百三十章　Generic Host、Keyed DI 与 Options

现代 .NET 应用的骨架是 Generic Host：配置、日志、DI、生命周期和后台服务共用同一套管线。Web 只是 Host 上的一种承载。

### 一、生命周期

- **Singleton**：整个进程一份。不能直接依赖 Scoped（DbContext）。
- **Scoped**：一次请求/一次 scope。Web 默认每请求一个。
- **Transient**：每次解析新建。轻量无状态可以，重对象不要用。
- **Keyed services**（.NET 8+）：同一接口多个实现，用 key 区分，例如 \`redis\` / \`memory\`。

### 二、Options

\`\`\`csharp-snippet
builder.Services
    .AddOptions<PaymentOptions>()
    .BindConfiguration("Payment")
    .ValidateDataAnnotations()
    .ValidateOnStart();
\`\`\`

错误配置必须阻止启动。不要在请求里第一次读到坏配置才 500。

### 三、IHostedLifecycleService

.NET 8+ 可在 Starting/Started/Stopping/Stopped 各阶段挂钩。健康检查就绪应在 Started 之后、开始接流量之前完成。
`,
    code: `// 用最小容器演示：Singleton 不能安全捕获 Scoped。
var root = new MiniHost();
root.AddSingleton(new AppClock());
root.AddScoped(() => new RequestContext(Guid.NewGuid()));

using (var scope1 = root.CreateScope())
using (var scope2 = root.CreateScope())
{
    var clockA = scope1.Get<AppClock>();
    var clockB = scope2.Get<AppClock>();
    var ctxA = scope1.Get<RequestContext>();
    var ctxB = scope2.Get<RequestContext>();
    Console.WriteLine($"同一 Clock：{ReferenceEquals(clockA, clockB)}");
    Console.WriteLine($"不同 Request：{ctxA.Id != ctxB.Id}");
}

sealed class MiniHost
{
    private readonly Dictionary<Type, Func<Scope, object>> _factories = new();
    private readonly Dictionary<Type, object> _singletons = new();

    public void AddSingleton<T>(T instance) where T : class
    {
        _singletons[typeof(T)] = instance;
        _factories[typeof(T)] = _ => instance;
    }

    public void AddScoped<T>(Func<T> factory) where T : class =>
        _factories[typeof(T)] = scope => scope.GetOrCreate(typeof(T), () => factory());

    public Scope CreateScope() => new(this);
    internal object Resolve(Type type, Scope scope) => _factories[type](scope);

    public sealed class Scope(MiniHost host) : IDisposable
    {
        private readonly Dictionary<Type, object> _scoped = new();
        public T Get<T>() => (T)host.Resolve(typeof(T), this);
        internal object GetOrCreate(Type type, Func<object> create)
        {
            if (_scoped.TryGetValue(type, out var existing)) return existing;
            return _scoped[type] = create();
        }
        public void Dispose() => _scoped.Clear();
    }
}

sealed record AppClock();
sealed record RequestContext(Guid Id);
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch130",
    group: "第二十一部分 生产深水区",
    icon: "🧊",
    title: "输出缓存、HybridCache 与失效",
    content: `## 第一百三十一章　输出缓存、HybridCache 与失效

缓存有三层：HTTP 输出缓存、进程内内存、分布式缓存。弄错失效，用户会看到别人的订单。

### 一、输出缓存

ASP.NET Core OutputCache 缓存的是 **HTTP 响应**。必须把 Vary 规则写对：Authorization、租户、语言、查询参数。已认证的私有响应默认不要公共缓存。

### 二、HybridCache（.NET 9+）

HybridCache 组合 L1 内存 + L2 分布式，并内置 stampede 保护（同一 key 只回源一次）。生产仍要：

- key 含租户、版本、授权维度
- TTL + jitter
- 序列化版本
- 分布式缓存故障时的降级预算

### 三、失效

删除缓存失败不等于数据库回滚。短 TTL、发出版本号、或把版本放进 key，都比「相信每次 Remove 都成功」更稳。
`,
    code: `// 单飞（single-flight）：缓存击穿时，同一 key 只让一个请求回源。
var cache = new StampedeCache();
var tasks = Enumerable.Range(0, 5)
    .Select(_ => cache.GetOrCreateAsync("tenant:orders:hot", () =>
    {
        Console.WriteLine("回源数据库");
        return Task.FromResult("payload-v1");
    }));

string[] results = await Task.WhenAll(tasks);
Console.WriteLine(string.Join(",", results.Distinct()));

sealed class StampedeCache
{
    private readonly Dictionary<string, string> _store = new();
    private readonly Dictionary<string, Task<string>> _inflight = new();

    public Task<string> GetOrCreateAsync(string key, Func<Task<string>> factory)
    {
        lock (_store)
        {
            if (_store.TryGetValue(key, out var cached)) return Task.FromResult(cached);
            if (_inflight.TryGetValue(key, out var running)) return running;
            Task<string> created = Load(key, factory);
            _inflight[key] = created;
            return created;
        }
    }

    private async Task<string> Load(string key, Func<Task<string>> factory)
    {
        string value = await factory();
        lock (_store)
        {
            _store[key] = value;
            _inflight.Remove(key);
        }
        return value;
    }
}
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch131",
    group: "第二十一部分 生产深水区",
    icon: "❤️",
    title: "健康检查、探针与依赖隔离",
    content: `## 第一百三十二章　健康检查、探针与依赖隔离

K8s/负载均衡靠探针决定流量。探针配错会导致：正常实例被杀、或坏实例一直接流量。

### 一、三种检查

- **liveness**：进程是否已经不可恢复。失败 → 重启。不要把下游 Redis 放进来。
- **readiness**：现在能否接流量。失败 → 摘掉流量，不一定重启。可含数据库。
- **startup**：允许慢启动。启动完成前不要用 liveness 杀进程。

### 二、依赖分级

关键依赖（数据库）进入 readiness。非关键依赖（可选分析、邮件）失败应降级，不应让整个服务变 NotReady。

### 三、超时

健康检查自己也要超时。下游挂了时，检查必须快速失败，否则探针线程被拖死，集群会误判。
`,
    code: `// 探针决策：分析服务挂了仍可就绪；数据库挂了不能接流量。
foreach (var state in new[]
{
    new AppHealth(StartupDone: true, Database: true, Analytics: false),
    new AppHealth(StartupDone: true, Database: false, Analytics: true),
    new AppHealth(StartupDone: false, Database: true, Analytics: true),
})
{
    Console.WriteLine(
        $"startup={state.StartupDone} db={state.Database} analytics={state.Analytics} " +
        $"=> live={IsLive(state)} ready={IsReady(state)}");
}

static bool IsLive(AppHealth health) => health.StartupDone; // 活着 ≠ 依赖都好
static bool IsReady(AppHealth health) => health.StartupDone && health.Database;

public sealed record AppHealth(bool StartupDone, bool Database, bool Analytics);
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch132",
    group: "第二十一部分 生产深水区",
    icon: "🎼",
    title: ".NET Aspire 与本地开发编排",
    content: `## 第一百三十三章　.NET Aspire 与本地开发编排

Aspire 解决的是：**本地把 API、Worker、Redis、Postgres、遥测一次拉起来**，并把连接字符串通过资源引用注入。它不是生产集群替代品。

### 一、AppHost

\`\`\`csharp-snippet
var builder = DistributedApplication.CreateBuilder(args);
var redis = builder.AddRedis("redis");
var db = builder.AddPostgres("pg").AddDatabase("shop");
builder.AddProject<Projects.Shop_Api>("api")
    .WithReference(redis)
    .WithReference(db);
builder.Build().Run();
\`\`\`

### 二、生产怎么对应

- 本地：Aspire 编排容器与项目。
- 生产：同样的服务用 Kubernetes/云资源；配置改由环境变量、Key Vault、服务发现提供。
- 不要把 AppHost 项目部署为生产网关。

### 三、遥测

Aspire Dashboard 适合看本地 traces。生产导出到 OTLP 后端，采样和基数规则必须单独设计。
`,
    code: `// 用代码描述「资源引用」：应用不写死端口，只依赖资源名。
var local = new EnvironmentBindings(
    "local",
    new Dictionary<string, string>
    {
        ["ConnectionStrings:shop"] = "Host=localhost;Database=shop",
        ["ConnectionStrings:redis"] = "localhost:6379",
    });
var prod = new EnvironmentBindings(
    "prod",
    new Dictionary<string, string>
    {
        ["ConnectionStrings:shop"] = "Host=pg.internal;Database=shop",
        ["ConnectionStrings:redis"] = "redis.internal:6379",
    });

foreach (var env in new[] { local, prod })
    Console.WriteLine($"{env.Name}: shop={env.Get("ConnectionStrings:shop")}");

sealed record EnvironmentBindings(string Name, Dictionary<string, string> Values)
{
    public string Get(string key) => Values[key];
}
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch133",
    group: "第二十一部分 生产深水区",
    icon: "🏢",
    title: "多租户、数据隔离与授权边界",
    content: `## 第一百三十四章　多租户、数据隔离与授权边界

漏租户条件是最贵的 bug 之一：一次查询可能返回别人的数据。

### 一、隔离模式

- **共享库 + tenant_id**：成本低，必须每条查询带租户，并用约束/全局过滤器兜底。
- **每租户 schema/数据库**：隔离强，运维复杂。
- **行级安全（RLS）**：数据库再挡一层，应用过滤器不能作为唯一防线。

### 二、租户从哪来

从已验证的 token/claim 取 tenant，**不要**信客户端 header 里的 \`X-Tenant-Id\`（除非它经过网关签名且与身份一致）。

### 三、缓存与日志

缓存 key、队列分区、搜索索引都必须含租户。日志可记 tenantId，但不要把跨租户数据打进同一调试 dump 后发给错误的人。
`,
    code: `// 全局查询过滤器的教学模型：忘记 tenant 条件就会串数据。
var orders = new[]
{
    new OrderRow("A", "o-1", 10m),
    new OrderRow("B", "o-2", 99m),
    new OrderRow("A", "o-3", 5m),
};

Console.WriteLine("错误：无租户过滤");
foreach (var order in orders) Console.WriteLine($"  {order}");

Console.WriteLine("正确：当前租户 A");
foreach (var order in orders.Where(item => item.TenantId == "A"))
    Console.WriteLine($"  {order}");

var headerTenant = "B"; // 恶意请求
var tokenTenant = "A";
Console.WriteLine(headerTenant == tokenTenant
    ? "租户一致"
    : "拒绝：header 与令牌中的租户不一致");

public sealed record OrderRow(string TenantId, string Id, decimal Total);
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch134",
    group: "第二十一部分 生产深水区",
    icon: "⏱️",
    title: "取消、超时、deadline 与背压",
    content: `## 第一百三十五章　取消、超时、deadline 与背压

异步代码最常见的生产事故是：下游已经超时，上游还在重试；或队列无限堆积把内存打满。

### 一、取消

\`CancellationToken\` 必须从 HTTP/消息/宿主一直传到 DB 和 HttpClient。捕获 \`OperationCanceledException\` 后要判断是请求取消还是本服务超时。

### 二、deadline

重试时不要每次都给满超时。应计算剩余预算：总 deadline 5s，已花 3s，下次只许 2s。

### 三、背压

Channel/Queue 必须有界。满了要失败、丢弃或阻塞生产者——需要明确策略。无界队列等于把内存当缓存。
`,
    code: `await RunAsync();

static async Task RunAsync()
{
    using var deadline = new CancellationTokenSource(TimeSpan.FromMilliseconds(200));
    var channel = System.Threading.Channels.Channel.CreateBounded<int>(
        new System.Threading.Channels.BoundedChannelOptions(4)
        {
            FullMode = System.Threading.Channels.BoundedChannelFullMode.Wait,
        });

    try
    {
        for (int i = 1; i <= 8; i++)
        {
            // WaitToWriteAsync 会在队列满时等待；再叠加 deadline 形成背压
            await channel.Writer.WaitToWriteAsync(deadline.Token);
            await channel.Writer.WriteAsync(i, deadline.Token);
            Console.WriteLine($"入队 {i}");
        }
    }
    catch (OperationCanceledException)
    {
        Console.WriteLine("达到 deadline，停止继续入队（而不是无限重试）");
    }

    channel.Writer.TryComplete();
    int count = 0;
    await foreach (int item in channel.Reader.ReadAllAsync())
        count++;
    Console.WriteLine($"已消费 {count} 条");
}
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch135",
    group: "第二十一部分 生产深水区",
    icon: "🔏",
    title: "审计、数据分级与合规日志",
    content: `## 第一百三十六章　审计、数据分级与合规日志

能排障和能泄密之间只隔着一条日志。生产日志必须分级、可检索、可保留、可删除。

### 一、数据分级

- **公开**：商品名。
- **内部**：订单号、租户 ID。
- **机密**：邮箱、手机、地址。
- **严格机密**：密码、证件、银行卡、生物特征。这些**永远不要**进日志、指标标签、trace attribute、dump 默认采集。

### 二、审计

谁在何时对哪条资源做了什么，要写审计表/事件。审计失败通常应让写操作失败，或进入可靠 Outbox，不能「审计挂了业务照样改完」。

### 三、结构化

用模板 + 属性：\`Order {OrderId} paid\`，不要 \`$\"user={email} token={jwt}\"\`。保留期限按法规设置，过期删除要可证明。
`,
    code: `// 日志脱敏：手机号、邮箱不能原文输出。
foreach (var line in new[]
{
    Render("order.paid", new()
    {
        ["orderId"] = "A-100",
        ["email"] = "ada@example.com",
        ["phone"] = "13800138000",
    }),
    Render("user.login", new()
    {
        ["userId"] = "u-9",
        ["token"] = "eyJhbGciOiJIUzI1NiJ9.aaa.bbb",
    }),
})
{
    Console.WriteLine(line);
}

static string Render(string eventName, Dictionary<string, string> fields)
{
    string[] redact = ["email", "phone", "token", "password", "idCard"];
    var parts = fields.Select(pair =>
        redact.Contains(pair.Key, StringComparer.OrdinalIgnoreCase)
            ? $"{pair.Key}={Mask(pair.Key, pair.Value)}"
            : $"{pair.Key}={pair.Value}");
    return $"{eventName} {string.Join(" ", parts)}";
}

static string Mask(string key, string value)
{
    if (key.Equals("email", StringComparison.OrdinalIgnoreCase))
    {
        int at = value.IndexOf('@');
        return at > 1 ? $"{value[0]}***{value[at..]}" : "***";
    }
    if (value.Length <= 4) return "****";
    return $"{value[..2]}***{value[^2..]}";
}
`,
    lang: "cs",
  },
];

export { chapters };
