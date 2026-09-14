// =============================================================
// C# 从零基础到生产上线 —— 第 17 批
// 第二十一部分 生产深水区（10 章）
// -------------------------------------------------------------
// 主 demo 与正文 ```csharp-run 块必须是完整可运行程序（net8 / C# 12）。
// 真实 ASP.NET / EF / Aspire 片段使用 csharp-snippet，不显示“运行”按钮。
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
// .NET 10：项目引用 Microsoft.Extensions.Validation 后注册内置验证管道。
// DataAnnotations 会由端点过滤器在 handler 执行前检查。
builder.Services.AddValidation();
builder.Services.AddProblemDetails();

app.MapPost("/orders", (CreateOrderRequest request) =>
{
    // 只有验证通过才会进入这里；失败默认返回 400。
    return TypedResults.Created($"/orders/{request.Sku}", request);
});
\`\`\`

.NET 8/9 项目、未调用 \`AddValidation()\` 的应用，以及 FluentValidation 等第三方规则不会凭空自动执行，仍需 endpoint filter 或显式管道。若端点模型定义在另一个程序集，应从那个程序集调用 \`AddValidation\`，否则源生成器发现不到类型。用 \`IProblemDetailsService\` 统一字段错误和业务错误的外形，但不要把库存不足等领域冲突误报为格式 400。

### 二、绑定陷阱

- \`[FromRoute]\` / \`[FromQuery]\` / \`[FromBody]\` 要明确，避免一个对象从多个来源拼出来。
- 不要绑定直接映射到 EF 实体：会 over-posting（客户端改 \`Total\`、\`TenantId\`）。
- 文件、超大 JSON 必须限制大小；反序列化失败返回 400，不要 500。

### 三、错误形状

统一 RFC 9457：\`type\`、\`title\`、\`status\`、\`detail\`、字段级 \`errors\`。客户端应按 \`code\` 分支，不要解析中文句子。

下面 demo 把「格式校验」和「业务规则」分开，这是生产里最容易混在一起的点。

### 练习

1. 修改 demo 的 samples 数组：加入 quantity = 100（越界）、currency = ""（空串）、sku = "  "（纯空白）三个新样本，观察 \`Validate\` 聚合出的 400 字段错误信息；再把合法样本的 currency 改成小写 "cny"，确认 \`OrdinalIgnoreCase\` 比较仍通过业务规则。
2. 独立实现 \`ToProblem\` 错误形状生成器：输入 \`ValidationResult\`，输出符合 RFC 9457 的对象（type/title/status/detail 加字段级 errors 数组）；格式错误（400）与业务冲突（409）映射到不同的 type URI，未知 code 走默认分支，保证客户端永远按 code 分支而不是解析中文句子。
3. 生产场景：把 CreateOrderRequest 接入 ASP.NET Core 验证管道——\`AddValidation()\` 加 \`AddProblemDetails()\`，请求模型加 \`[Required]\` 与 \`[Range(1, 99)]\` 标注；写集成测试覆盖四条路径：缺 sku 返回 400 且 errors 指向字段、quantity 越界返回 400、USD 结算返回 409、合法输入返回 201；最后发一个带 Total 字段的请求体验证 over-posting 被忽略。
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

### 练习

1. 修改 demo：先用 key-1、body "sku=1,qty=2" 执行一次，再用相同 key、body 改为 "sku=1,qty=9" 调用，确认返回 422 指纹不匹配；把 \`KeysetPage\` 的 after 分别改成 7 与 0，观察末页（空结果）与首页的输出边界。
2. 独立实现带“处理中”状态的幂等存储：并发两个相同 (tenant, key) 请求只允许一个执行 create，另一个等待其完成后复用结果；用 \`ConcurrentDictionary\` 加 \`SemaphoreSlim\`（或 Lazy 模式）实现，写并发测试验证 create 委托只执行一次、两个调用方拿到同一响应。
3. 生产场景：把 cursor 分页落到 SQL——按 (createdAt, id) 稳定排序，写出形如 \`WHERE (createdAt, id) > (@afterCreatedAt, @afterId) ORDER BY createdAt, id LIMIT @take\` 的查询；把游标编码成 Base64 的 nextCursor 随响应返回，解码时校验格式并拒绝伪造游标；排序字段建允许列表（如只允许 createdAt 与 amount），防止用户输入拼进 ORDER BY。
`,
    code: `// 幂等 + cursor 分页。Dictionary 只是教学存储；生产用数据库唯一索引。
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

### 练习

1. 修改 demo 的 \`Detect\`：补上 JPEG（FF D8 FF）与 GIF（GIF87a/GIF89a）两组魔数分支；构造一个扩展名是 .png、内容却以 "hello" 开头的样本，确认它被识别为 application/octet-stream；再给 \`IsAllowedOrigin\` 传入 null（模拟无 Origin 头的同源请求），观察当前行为并决定该放行还是拒绝。
2. 独立实现 \`ValidateUpload(byte[] content, string fileName)\` 校验管道：魔数白名单（PNG/JPEG/GIF）加大小上限 5MB，加文件名规范化（\`Path.GetFileName\` 去掉 ../ 路径穿越、拒绝 Windows 保留名），返回 (ok, detectedType, reason) 三元组，并为每个失败原因写一个用例。
3. 生产场景：为带前端的 BFF 配置安全基线——CORS 用显式 Origin 列表加 \`AllowCredentials\`；写一个中间件统一加 CSP、\`X-Content-Type-Options: nosniff\`、\`Referrer-Policy\` 与 HSTS 四个响应头；上传保存为对象存储的随机 key（扩展名取自魔数而非用户输入），病毒扫描放隔离容器异步执行；用集成测试断言每个响应头存在且上传目录不可枚举。
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

.NET 8+ 可在 Starting/Started/Stopping/Stopped 等阶段挂钩。应用不能仅凭“进了 Started”就假定依赖可用：启动期完成必要初始化，随后才让 readiness 探针返回成功；Kubernetes / 负载均衡器看到 readiness 成功后再送流量。耗时预热要有超时，非关键依赖失败则保持降级而不是永久卡住启动。

### 练习

1. 修改 demo 的 MiniHost：新增 \`AddTransient<T>\`（每次解析都新建实例），在同一个 scope 里 Get 两次，对比 Transient 与 Scoped、Singleton 三者的实例差异；再把 \`AppClock\` 从 AddSingleton 改为 AddScoped，观察两个 scope 各拿一份、同一 scope 内复用。
2. 独立实现 keyed 解析：给 MiniHost 加 \`AddKeyedSingleton<T>(string key)\` 与 \`Get<T>(string key)\`，注册 "redis" 与 "memory" 两个 \`ICache\` 实现，验证按 key 取到不同实例、未知 key 抛出清晰异常——模拟 .NET 8 keyed services 的语义。
3. 生产场景：把配置校验搬进 Options 管道——\`AddOptions<PaymentOptions>().BindConfiguration("Payment").ValidateDataAnnotations().ValidateOnStart()\`，写一个宿主集成测试证明坏配置（如 ApiKey 为空）在启动阶段直接失败，而不是首次请求才 500；再实现 \`IHostedLifecycleService\` 在 Started 阶段做连接池预热（带 30 秒超时），预热完成后才把 readiness 标记为健康。
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

### 练习

1. 修改 demo：把并发数从 5 提到 50，给 factory 加 \`Task.Delay(100)\` 模拟慢查询，确认“回源数据库”仍然只打印一次；把 key 换成 "tenant:orders:cold" 再跑一轮，观察发生第二次回源；最后让 factory 抛一次异常后重试，观察当前实现会把失败结果也缓存住——这正是练习 2 要修复的缺陷。
2. 独立实现带 TTL 的 StampedeCache：\`GetOrCreateAsync(key, ttl, factory)\` 记录写入时间，过期后下一次请求触发回源且同 key 仍然单飞；写测试覆盖三个场景——过期瞬间的 10 个并发请求只执行一次 factory、未过期命中不回源、不同 key 各自回源；同时修复练习 1 发现的“异常结果被缓存”问题。
3. 生产场景：为订单列表接口设计缓存方案——输出缓存层 \`VaryByQuery\` 加 \`VaryByAuthorization\` 防止跨用户串数据；HybridCache 的 key 设计为 \`tenant:{tenantId}:orders:v{schemaVersion}\`，TTL 60 秒加 ±10 秒 jitter 防同步过期；失效改为递增 schemaVersion 而不是依赖 Remove 成功；最后推演一遍：数据更新后旧缓存最长还能存活多久、回源风暴如何被单飞挡住。
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

### 练习

1. 修改 demo 的 \`AppHealth\`：新增 Redis 字段并作为关键依赖纳入 \`IsReady\`，运行三种组合观察：Redis 挂导致 not ready、Analytics 挂仍然 ready、StartupDone 为 false 时 live 与 ready 全 false；对照结果写一份依赖分级结论（哪些进 readiness、哪些降级放行）。
2. 独立实现 \`HealthCheckRunner\`：接收一组 (name, critical, check) 检查项，每项在 \`Task.Run\` 中执行并施加整体超时（超时即失败），返回 Healthy / Degraded / Unhealthy 三级——全部通过为 Healthy、仅非关键项失败为 Degraded、任一关键项失败为 Unhealthy；用一个故意 \`Task.Delay(Timeout.Infinite)\` 的检查项验证超时兜底生效。
3. 生产场景：写出 K8s 探针配置草案——livenessProbe 只探测进程自身（/healthz 固定返回 200，不含依赖检查）；readinessProbe 挂 /ready 并包含数据库；startupProbe 的 failureThreshold 乘 periodSeconds 大于最坏预热时长；附一份依赖分级表（数据库、Redis、邮件、分析服务各自进 liveness、readiness 还是都不进），并说明每条决策的依据。
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

### 一、现代安装模型（Aspire 9+）

Aspire 8 曾是 .NET workload；现代 Aspire 已改为 **CLI + 版本化 AppHost SDK + NuGet 集成包**。不要再教新项目执行 \`dotnet workload install aspire\`：

\`\`\`bash
# 给现有解决方案添加编排；也可以先安装对应版本模板再 dotnet new aspire
aspire init
aspire run
\`\`\`

\`\`\`xml
<!-- AppHost.csproj：版本应由仓库集中钉住，并由 aspire update 审查升级 -->
<Project Sdk="Aspire.AppHost.Sdk/13.0.0">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
  </PropertyGroup>
</Project>
\`\`\`

### 二、AppHost

\`\`\`csharp-snippet
var builder = DistributedApplication.CreateBuilder(args);
var redis = builder.AddRedis("redis");
var db = builder.AddPostgres("pg").AddDatabase("shop");
builder.AddProject<Projects.Shop_Api>("api")
    .WithReference(redis)
    .WithReference(db)
    .WaitFor(db);
builder.Build().Run();
\`\`\`

\`WithReference\` 注入服务发现或连接信息；\`WaitFor\` 只表达启动依赖，不能替代应用自己的重试、超时和健康检查。资源名是契约，改名也要像改配置键一样评审。

### 三、生产怎么对应

- 本地：Aspire 编排容器与项目。
- 发布：可以从 AppHost 生成部署清单或接发布器，但目标平台上的身份、网络、持久卷、备份、扩缩和密钥仍要显式治理。
- 生产：同样的服务通常落到 Kubernetes / 云托管资源；配置由环境变量、Key Vault 和服务发现提供。
- 不要把 AppHost 项目部署为生产网关。

### 四、遥测与验收

Aspire Dashboard 适合看本地 logs、traces、metrics。生产导出到 OTLP 后端，认证、保留期、采样和基数规则必须单独设计，不能把开发 Dashboard 裸露到公网。

验收至少覆盖：干净机器按锁定版本启动；数据库未就绪时 API 不抢跑；连接信息不写死端口；停止 AppHost 后容器无孤儿；应用脱离 Aspire、只靠标准配置也能在 CI / 生产运行。

### 练习

1. 修改 demo：新增一个 staging 环境的 \`EnvironmentBindings\`（analytics 连接指向 staging 域名），三个环境循环打印 shop 连接串；再对不存在的 key 调用 \`Get\`，把 \`KeyNotFoundException\` 改为返回默认值的 \`TryGet\`，体会“缺配置显式失败还是静默默认”的取舍。
2. 独立实现 \`ResourceGraph\`：提供 \`AddProject\`、\`AddRedis\`、\`WithReference\`、\`WaitFor\` 方法描述资源与依赖关系，\`StartupOrder()\` 做拓扑排序输出启动顺序；构造 api WaitFor pg、pg 依赖 volume 的三层图，验证输出顺序正确，并让循环依赖的图抛出明确异常。
3. 生产场景：为团队编写 Aspire 验收清单并逐条给出验证命令——aspire init 后核对 AppHost csproj 的 SDK 版本被仓库钉住；数据库容器健康检查未通过时 API 不发出首个请求（WaitFor 加应用侧重试双保险）；全局搜索确认没有写死 6379/5432 端口；Ctrl+C 停止后确认 docker ps 无孤儿容器；把 API 项目单独 dotnet run，仅靠环境变量注入连接串也能在 CI 启动。
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

### 练习

1. 修改 demo：给 orders 数组加一条租户 "C" 的记录，当前租户 A 过滤后确认看不到它；把 headerTenant 改成与 tokenTenant 相同的 "A"，观察走进“租户一致”分支；再试试 headerTenant 传空串，决定应该拒绝还是回退到 token 中的租户。
2. 独立实现租户守卫封装：写 \`TenantScope\`（持有当前 TenantId）与扩展方法 \`ApplyTenantFilter\`，所有查询必须经过它；再写断言方法 \`AssertSameTenant\`，任何结果混入其它租户数据就抛异常——把它放进单元测试基类，让“忘记加租户条件”的查询在 CI 直接失败。
3. 生产场景：设计缓存与日志两处的租户隔离——缓存层封装 \`TenantKey.Build("orders", id)\` 统一产出 \`tenant:{tenantId}:orders:{orderId}\` 前缀，禁止裸拼 key；日志结构化字段带 tenantId 但金额、邮箱脱敏；评估共享库 tenant_id 与数据库 RLS 组成双层防线，写一条回归测试：故意构造漏加租户过滤的查询，验证应用层守卫与 RLS 至少有一层拦截。
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

### 练习

1. 修改 demo：把 deadline 从 200ms 分别改成 50ms 与 2s，观察入队条数与 \`OperationCanceledException\` 触发时机的变化；再把 \`BoundedChannelOptions\` 容量从 4 改成 1，对比背压出现得更早——记录每种组合的入队与消费条数。
2. 独立实现 \`DeadlineBudget\`：构造时记录总预算（如 5 秒）与起始时间，提供剩余时间属性与 \`CreateLinkedTokenSource()\`（内部按剩余时间创建 \`CancellationTokenSource\`）；模拟“首次调用花 3 秒、重试只剩 2 秒”的场景，验证第二次的超时预算自动收紧而不是重新给满 5 秒。
3. 生产场景：为消息消费者设计背压策略——\`Channel.CreateBounded\` 容量按下游吞吐乘可容忍延迟估算；可丢消息（指标上报）用 \`BoundedChannelFullMode.DropOldest\`，不可丢消息（订单）用 Wait 并把 \`Reader.Count\` 作为 lag 指标暴露；写一次演练：把消费速度降到每秒 1 条，观察生产者阻塞、lag 告警、超过 deadline 后的降级动作分别如何触发。
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

### 练习

1. 修改 demo 的 \`redact\` 数组：加入 "idCard" 与 "bankCard"，并给样本补一条含 18 位身份证号与长度恰好 4 的短 token 的事件；观察 \`Mask\` 对短值走 "****" 分支、长值保留首尾两字符的规则边界——长度 5 与 4 的值分别输出什么。
2. 独立实现分级日志器：\`SensitivityClassifier\` 按字段名把数据分为公开、内部、机密、严格机密四级，\`Render\` 时机密字段走 Mask 脱敏、严格机密（password、idCard、bankCard）直接替换为 "[REDACTED]"；输出用模板加属性的形式（如 \`order {orderId} paid\`），保证结构化字段可被日志系统索引。
3. 生产场景：为订单模块实现审计事件——审计表记录操作人、时间、资源 id、动作与变更前后的快照哈希；审计写入失败时业务写操作回滚或落入可靠 Outbox，禁止“审计挂了业务照常改”；保留期限按法规设为 180 天，到期删除任务要产出可导出的删除证明；写一个集成测试：让审计存储故意不可用，验证下单接口返回 503 而不是静默成功。
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
