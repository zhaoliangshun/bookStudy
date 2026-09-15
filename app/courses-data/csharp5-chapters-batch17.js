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

1. **传输层**：JSON 能否解析、字段类型是否匹配、body 是否超限。这一层失败是 400，而且不需要进 handler 就该被拒掉。
2. **输入层**：必填、范围、格式、集合长度。可用 DataAnnotations 或 FluentValidation。这是「这个字段长什么样」的问题。
3. **领域层**：库存是否足够、状态机是否允许跳转、币种是否支持。这不是「格式校验」，失败通常是 409/422——**把领域冲突报成 400 是最常见的错误形状事故**，客户端会把「改个参数重试」当成正解。

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

### 二、验证库怎么选

| 方案 | 适用 | 注意 |
| --- | --- | --- |
| DataAnnotations | 简单必填/范围/正则，规则贴着 DTO 走 | 复杂交叉字段验证会写成一坨自定义特性 |
| FluentValidation | 规则多、有跨字段逻辑、要测试 | 规则类要注册进 DI，别在 handler 里 new |
| 手写 | 规则极少且性能敏感 | 自己保证错误聚合，不要遇到第一条就 return |

无论用哪个，**聚合全部字段错误再返回**。客户端一次拿到 \`["sku 必填", "quantity 越界"]\`，而不是改一个错再撞下一个——每多一次往返，接入方就想骂你一次。

### 三、绑定陷阱

- \`[FromRoute]\` / \`[FromQuery]\` / \`[FromBody]\` 要明确，避免一个对象从多个来源拼出来：路由里的 \`id\` 和 body 里的 \`id\` 不一样时，你根本不知道生效的是哪个。
- **不要绑定直接映射到 EF 实体**：会 over-posting——客户端在 JSON 里塞 \`Total\`、\`TenantId\`、\`IsAdmin\`，绑定器忠实地写进你的实体。入站用专用 DTO，只暴露允许客户端写的字段；出站也另外定义响应模型。demo 第三部分演示了这个漏洞。
- 文件、超大 JSON 必须限制大小（\`[RequestSizeLimit]\` / Kestrel \`MaxRequestBodySize\`）；反序列化失败返回 400，不要因为没捕获而 500。
- 集合入参要限制长度。\`List<int> ids\` 传十万个元素不是格式错误，但足以拖垮一次查询。

### 四、错误形状

统一 RFC 9457 ProblemDetails：\`type\`、\`title\`、\`status\`、\`detail\`、字段级 \`errors\`。两个硬要求：

1. **\`code\` 稳定且机器可读**：\`validation_error\`、\`currency_not_supported\` 是契约，写进 API 文档；客户端按 code 分支，**不要解析中文句子**——你改文案不该是 breaking change。
2. **\`detail\` 给人看，不给机器分支**：可以带中文描述帮助排障，但不承诺稳定。

下面 demo 做三件事：聚合字段错误、把领域冲突与格式错误分流成不同状态码、演示 over-posting 为什么必须用入站 DTO。

### 练习

1. 修改 demo 的 samples 数组：加入 quantity = 100（越界）、currency = ""（空串）、sku = "  "（纯空白）三个新样本，观察 \`Validate\` 聚合出的 400 字段错误信息；再把合法样本的 currency 改成小写 "cny"，确认 \`OrdinalIgnoreCase\` 比较仍通过业务规则；最后给 \`ApplyToEntity\` 传一个带 \`"total": 0\` 的恶意 JSON 字段集合，确认白名单之外的字段不会写进实体。
2. 独立实现 \`ToProblem\` 错误形状生成器：输入 \`ValidationResult\`，输出符合 RFC 9457 的对象（type/title/status/detail 加字段级 errors 数组）；格式错误（400）与业务冲突（409）映射到不同的 type URI，未知 code 走默认分支，保证客户端永远按 code 分支而不是解析中文句子。
3. 生产场景：把 CreateOrderRequest 接入 ASP.NET Core 验证管道——\`AddValidation()\` 加 \`AddProblemDetails()\`，请求模型加 \`[Required]\` 与 \`[Range(1, 99)]\` 标注；写集成测试覆盖五条路径：缺 sku 返回 400 且 errors 指向字段、quantity 越界返回 400、USD 结算返回 409、合法输入返回 201、请求体多塞 \`Total\` 字段时实体值不被覆盖（over-posting 被忽略）。
`,
    code: `// ============================================================
// 第一百二十六章 输入验证、绑定与错误形状 —— 可运行演示（net8.0 / C# 12）
// ------------------------------------------------------------
// 聚合全部字段错误再返回；格式 400、领域冲突 409，code 是稳定契约，detail 可以改文案。
// .NET 10 的 AddValidation() 会在 handler 前跑 DataAnnotations；net8.0 没有这根管道，
// 未显式注册 filter / FluentValidation 时 [Required] 不会自己生效，本 demo 因此手写聚合。
// 入站 DTO 白名单防 over-posting：JSON 多塞 total/tenantId 不得写进实体。
// ============================================================

// ---------- 1 + 2. 聚合校验与错误分流 ----------
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
    // 聚合后再返回，不要遇到第一条错误就 return
    if (fieldErrors.Count > 0)
        return new(400, "validation_error", string.Join("；", fieldErrors));

    // 领域规则：不是格式问题，不能用 400 糊弄过去
    if (!string.Equals(input.Currency, "CNY", StringComparison.OrdinalIgnoreCase))
        return new(409, "currency_not_supported", "当前店铺只接受 CNY");

    return new(201, "created", $"order for {input.Sku} x{input.Quantity}");
}

// ---------- 3. over-posting 防护 ----------
// 恶意客户端在 JSON 里多塞了 total / tenantId。如果直接绑定到实体，
// 订单金额就被改成 0 了。正确做法：入站 DTO 只暴露允许写的字段。
var rawJson = new Dictionary<string, string>
{
    ["sku"] = "sku-1",
    ["quantity"] = "2",
    ["total"] = "0",          // 客户端不该能写金额
    ["tenantId"] = "evil",    // 客户端不该能写租户
};

var entity = ApplyToEntity(rawJson, new OrderEntity { Total = 99.9m, TenantId = "t-1" });
Console.WriteLine($"\\n实体结果：total={entity.Total} tenant={entity.TenantId}");
Console.WriteLine("  ↑ 白名单只认 sku/quantity，total 与 tenantId 被忽略");

static OrderEntity ApplyToEntity(Dictionary<string, string> raw, OrderEntity entity)
{
    // 白名单拷贝：等价于「入站 DTO 只有 Sku/Quantity 两个属性」
    if (raw.TryGetValue("sku", out var sku)) entity.Sku = sku;
    if (raw.TryGetValue("quantity", out var qty) && int.TryParse(qty, out var q)) entity.Quantity = q;
    return entity;
}

public sealed record CreateOrderInput(string Sku, int Quantity, string Currency);
public sealed record ValidationResult(int Status, string Code, string Detail);

public sealed class OrderEntity
{
    public string Sku { get; set; } = "";
    public int Quantity { get; set; }
    public decimal Total { get; set; }
    public string TenantId { get; set; } = "";
}
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
- 相同 key + 相同 body → 返回第一次结果（重放，不重新执行）。
- 相同 key + 不同 body → 422，防止误用——同一个 key 配不同请求体，几乎一定是客户端 bug。
- 记录要有 TTL（支付类常留 24h），并覆盖「处理中」状态：第一个请求还没完成时第二个相同 key 到达，不能两个都执行——要么等待第一个完成后复用结果，要么返回 409 让客户端稍后重试。

\`\`\`csharp-snippet
// 中间件骨架：先查存储，命中则短路重放；未命中才进 handler。
app.Use(async (ctx, next) =>
{
    var key = ctx.Request.Headers.IdempotencyKey;
    if (key.IsEmpty || HttpMethods.IsGet(ctx.Request.Method)) { await next(); return; }

    var hit = await store.TryGetAsync(ctx.User.TenantId(), key!);
    if (hit is { Status: RecordStatus.Completed })
    {
        ctx.Response.StatusCode = hit.ResponseCode;
        await ctx.Response.WriteAsync(hit.ResponseBody);   // 重放第一次的响应
        return;
    }
    await next();   // 首次执行：handler 完成后由过滤器把响应存进 store
});
\`\`\`

注意幂等键只管「重复提交」，不管「业务唯一性」。同一用户有意下两单相同内容，应该生成两个不同的 key——去重是幂等层的事，判重是业务层的事。

### 二、分页

深 \`OFFSET 50000\` 会扫描再丢弃五万行，越翻越慢，且翻页期间数据变动会导致**漏行或重行**。生产列表用 **keyset/cursor**：按稳定唯一排序键（通常是 \`(created_at, id)\`，时间相同靠 id 决胜）继续往下取。

游标要对调用方**不透明**：编码成 Base64 的 token（内含排序方向与版本号），客户端只知道「上一页给了我 nextCursor」。伪造、篡改、版本不符的游标返回 400，而不是静默返回错页。\`take\` 必须有上限（如 100），\`take=1000000\` 是合法的恶意输入。

### 三、过滤与排序

排序字段必须走允许列表：\`?sort=createdAt_desc\` 映射到白名单里的列，**禁止把用户字符串拼进 ORDER BY**——这是 SQL 注入的最后一块自留地。过滤条件要记录到日志/指标的低基数标签中（记 \`status=paid\` 这个维度名，不记具体值），便于发现慢查询。

主 demo 演示幂等存储的三种路径（首次执行 / 重放 / 指纹冲突）与 keyset 翻页的边界行为。

### 练习

1. 修改 demo：先用 key-1、body "sku=1,qty=2" 执行一次，再用相同 key、body 改为 "sku=1,qty=9" 调用，确认返回 422 指纹不匹配；把 \`KeysetPage\` 的 after 分别改成 7 与 0，观察末页（空结果）与首页的输出边界；再给 \`Execute\` 传一个 Processing 状态的记录（直接往 \`_records\` 里塞），观察第二个并发请求会等到结果还是拿到 409。
2. 独立实现带“处理中”状态的幂等存储：并发两个相同 (tenant, key) 请求只允许一个执行 create，另一个等待其完成后复用结果；用 \`ConcurrentDictionary\` 加 \`SemaphoreSlim\`（或 Lazy 模式）实现，写并发测试验证 create 委托只执行一次、两个调用方拿到同一响应。
3. 生产场景：把 cursor 分页落到 SQL——按 (createdAt, id) 稳定排序，写出形如 \`WHERE (createdAt, id) > (@afterCreatedAt, @afterId) ORDER BY createdAt, id LIMIT @take\` 的查询；把游标编码成 Base64 的 nextCursor 随响应返回，解码时校验格式并拒绝伪造游标；排序字段建允许列表（如只允许 createdAt 与 amount），防止用户输入拼进 ORDER BY。
`,
    code: `// ============================================================
// 第一百二十七章 幂等、分页与查询约定 —— 可运行演示（net8.0 / C# 12）
// ------------------------------------------------------------
// 幂等键按租户隔离；同 key 同指纹重放首次响应，同 key 不同 body 必须 422，不能静默改单。
// 先写入 processing 再执行 create：并发第二个请求应 409/等待，而不是两次下单。
// keyset（after=id）避免 OFFSET 深翻页漂移；末页之后返回空数组，不要 404。
// Dictionary 只是教学存储，生产用唯一索引约束同一语义。
// ============================================================

// ---------- 1. 幂等存储：三种路径 ----------
var store = new IdempotencyStore();
var first = store.Execute("tenant-a", "key-1", "sku=1,qty=2", () => "order-100");
var retry = store.Execute("tenant-a", "key-1", "sku=1,qty=2", () => "order-SHOULD-NOT-CREATE");
var conflict = store.Execute("tenant-a", "key-1", "sku=1,qty=9", () => "order-conflict");

Console.WriteLine($"首次：{first}");
Console.WriteLine($"重试：{retry}（重放第一次的响应，create 委托没有再次执行）");
Console.WriteLine($"同 key 不同 body：{conflict}");

// 并发「处理中」状态：第一个请求还在执行时第二个到达
var processing = store.Execute("tenant-a", "key-2", "sku=2,qty=1", () =>
{
    Console.WriteLine("  （第一个请求处理中…）");
    store.SimulateConcurrent("tenant-a", "key-2", "sku=2,qty=1");
    return "order-200";
});
Console.WriteLine($"并发场景：{processing}");

// ---------- 2. keyset 分页边界 ----------
var page = KeysetPage(
    items: [1, 2, 3, 4, 5, 6, 7],
    after: 3,
    take: 3);
Console.WriteLine("\\nafter=3 的下一页：" + string.Join(",", page));
Console.WriteLine("after=7（末页之后）：" + $"[{string.Join(",", KeysetPage([1, 2, 3, 4, 5, 6, 7], 7, 3))}] ← 空结果，不是异常");

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

        _records[id] = (fingerprint, "processing");   // 先占位：并发同 key 会看到处理中
        string created = create();
        _records[id] = (fingerprint, created);        // 完成后覆盖为真实响应
        return created;
    }

    public void SimulateConcurrent(string tenant, string key, string fingerprint)
    {
        string id = $"{tenant}:{key}";
        if (_records.TryGetValue(id, out var existing) && existing.Response == "processing")
            Console.WriteLine("  第二个相同 key 请求到达 → 409 in-flight（或等待首个完成复用结果）");
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

- 允许的 Origin 必须是明确列表，不要生产环境 \`AllowAnyOrigin()\` + \`AllowCredentials()\`——这个组合浏览器会直接拒绝，但说明配置者没理解自己在开什么口子。
- CORS 不能替代授权。没有 Cookie/令牌，跨域也调不到你的数据——但有令牌时 CORS 配错会把 API 暴露给恶意站点：恶意页面可以带用户凭据发请求并**读到响应**。
- 注意 CORS 拦的是「读响应」，不是「发请求」。\`Content-Type: text/plain\` 的简单请求不做预检就发出去了——这就是为什么 CORS 挡不住 CSRF。
- 无 Origin 头的请求（curl、服务端调用、同源导航）不进 CORS 流程，不要误伤。

### 二、CSRF

Cookie 会话（尤其 SameSite=Lax/None）需要防 CSRF：anti-forgery token、双重提交 Cookie，或改用 Bearer（然后防 XSS——令牌能被 JS 读到就意味着 XSS 能偷走它）。

| 方案 | 原理 | 代价 |
| --- | --- | --- |
| Anti-forgery token | 服务端发 token，表单/header 带回校验 | 需要服务端存储或签名 |
| 双重提交 Cookie | Cookie 与 header 各带一份，比对一致 | 依赖子域隔离，配置要严 |
| SameSite=Strict/Lax | 浏览器不跨站带 Cookie | 部分合法跨站跳转被误伤 |
| 改 Bearer | 无 Cookie 就无 CSRF | XSS 面变大，令牌要短寿命 |

### 三、安全头

生产至少考虑：\`Content-Security-Policy\`、\`X-Content-Type-Options: nosniff\`、\`Referrer-Policy\`、HSTS（\`Strict-Transport-Security\`）。API 纯 JSON 服务与带前端的 BFF 策略不同：纯 JSON 的 CSP 可以收到最紧（\`default-src 'none'\`），BFF 要按前端真实依赖逐项放行——一开始写 \`default-src *\` 等于没写。

\`\`\`csharp-snippet
app.Use(async (ctx, next) =>
{
    var h = ctx.Response.Headers;
    h.XContentTypeOptions = "nosniff";
    h.ReferrerPolicy = "strict-origin-when-cross-origin";
    h.ContentSecurityPolicy = "default-src 'none'; frame-ancestors 'none'";
    await next();
});
\`\`\`

### 四、上传

- 限制大小、数量、速率（三个都要，只有大小限制的接口会被低速连接拖死）。
- 用文件头魔数判断类型，不信 \`Content-Type\` 和文件名——\`evil.exe\` 改名 \`evil.png\` 只需要一次右键。
- 存到对象存储的随机 key；扩展名从识别出的类型推导，不取用户输入。
- 病毒扫描在隔离环境异步执行，扫描通过前文件不对外可见。
- 下载授权不能靠「URL 很难猜」：要么短寿命预签名 URL，要么每次下载走授权校验。

### 练习

1. 修改 demo 的 \`Detect\`：补上 JPEG（FF D8 FF）与 GIF（GIF87a/GIF89a）两组魔数分支；构造一个扩展名是 .png、内容却以 "hello" 开头的样本，确认它被识别为 application/octet-stream；再给 \`IsAllowedOrigin\` 传入 null（模拟无 Origin 头的同源请求），观察当前行为并决定该放行还是拒绝；最后把 \`SanitizeFileName\` 喂 \`"../../etc/passwd"\` 与 \`"CON.png"\`，验证路径穿越与 Windows 保留名被处理。
2. 独立实现 \`ValidateUpload(byte[] content, string fileName)\` 校验管道：魔数白名单（PNG/JPEG/GIF）加大小上限 5MB，加文件名规范化（\`Path.GetFileName\` 去掉 ../ 路径穿越、拒绝 Windows 保留名），返回 (ok, detectedType, reason) 三元组，并为每个失败原因写一个用例。
3. 生产场景：为带前端的 BFF 配置安全基线——CORS 用显式 Origin 列表加 \`AllowCredentials\`；写一个中间件统一加 CSP、\`X-Content-Type-Options: nosniff\`、\`Referrer-Policy\` 与 HSTS 四个响应头；上传保存为对象存储的随机 key（扩展名取自魔数而非用户输入），病毒扫描放隔离容器异步执行；用集成测试断言每个响应头存在且上传目录不可枚举。
`,
    code: `// ============================================================
// 第一百二十八章 CORS、CSRF、安全头与上传 —— 可运行演示（net8.0 / C# 12）
// ------------------------------------------------------------
// 扩展名和 Content-Type 都能伪造，文件头（魔数）才是类型真相；认不出就当 octet-stream。
// CORS Allow-Origin 必须是显式列表。反射任意 Origin + Allow-Credentials 等于帮攻击者读响应。
// CORS 拦的是读响应不是发请求——Cookie 会话仍要防 CSRF（SameSite + 抗伪造 token）。
// 文件名用 GetFileName 后再白名单字符，挡住 ../ 与 Windows 保留名。
// ============================================================

// ---------- 1. 魔数识别 ----------
byte[] png = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00];
byte[] fakePngNamedJpg = png;
byte[] text = "hello"u8.ToArray();

Console.WriteLine($"真实 PNG（伪装成 .jpg）：{Detect(fakePngNamedJpg)}");
Console.WriteLine($"纯文本（伪装成 .png）：{Detect(text)}");

static string Detect(ReadOnlySpan<byte> data)
{
    ReadOnlySpan<byte> pngMagic = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    if (data.StartsWith(pngMagic)) return "image/png";
    return "application/octet-stream";   // 识别不出就按最保守类型处理
}

// ---------- 2. Origin 白名单 ----------
string[] allowList = ["https://shop.example.com", "https://admin.example.com"];
Console.WriteLine($"\\nshop.example.com：{IsAllowedOrigin("https://shop.example.com", allowList)}");
Console.WriteLine($"evil.example：{IsAllowedOrigin("https://evil.example", allowList)}");

static bool IsAllowedOrigin(string origin, string[] allowList) =>
    allowList.Contains(origin, StringComparer.OrdinalIgnoreCase);

// ---------- 3. 文件名消毒 ----------
foreach (var name in new[] { "report.png", "../../etc/passwd", "..\\\\windows\\\\system32\\\\x.dll" })
    Console.WriteLine($"{name,-38} → {SanitizeFileName(name)}");

static string SanitizeFileName(string raw)
{
    // GetFileName 去掉目录部分；剩下的再做一层白名单字符过滤
    string name = Path.GetFileName(raw);
    var safe = new string(name.Where(c => char.IsLetterOrDigit(c) || c is '.' or '-' or '_').ToArray());
    return string.IsNullOrEmpty(safe) ? "upload.bin" : safe;
}
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch129",
    group: "第二十一部分 生产深水区",
    icon: "🏠",
    title: "Generic Host、Keyed DI 与 Options",
    content: `## 第一百三十章　Generic Host、Keyed DI 与 Options

现代 .NET 应用的骨架是 Generic Host：配置、日志、DI、生命周期和后台服务共用同一套管线。Web 只是 Host 上的一种承载——同一个 Host 模型也支撑 Worker Service、gRPC、控制台批处理。

### 一、生命周期

- **Singleton**：整个进程一份。不能直接依赖 Scoped（DbContext）——那叫**捕获依赖（captive dependency）**：Scoped 对象被 Singleton 攥住，整个进程期都活着，连接、事务、租户上下文全部错乱。开发环境打开 \`ValidateOnBuild\` + \`ValidateScopes\`，这种错误启动即炸。
- **Scoped**：一次请求/一次 scope。Web 默认每请求一个；后台服务里要自己 \`CreateScope()\`，用完 dispose。
- **Transient**：每次解析新建。轻量无状态可以；重对象（持连接、持大缓冲）不要用 Transient 假装「用完就扔」——DI 容器会跟踪可释放的 Transient 直到 scope 结束，照样堆积。
- **Keyed services**（.NET 8+）：同一接口多个实现，用 key 区分，例如 \`[FromKeyedServices("redis")] ICache\`。替代过去的「注册两个具名 wrapper 类」。

### 二、Options

\`\`\`csharp-snippet
builder.Services
    .AddOptions<PaymentOptions>()
    .BindConfiguration("Payment")
    .ValidateDataAnnotations()
    .ValidateOnStart();
\`\`\`

错误配置必须阻止启动。不要在请求里第一次读到坏配置才 500——那时候流量已经打进来了。三个接口的分工：

| 接口 | 语义 | 典型用法 |
| --- | --- | --- |
| \`IOptions<T>\` | 启动时快照，Singleton | 不变的配置 |
| \`IOptionsSnapshot<T>\` | 每个 scope 重读，Scoped | 请求级读取，可感知 reload |
| \`IOptionsMonitor<T>\` | 变更通知，Singleton | 需要热更新响应的服务 |

\`IOptionsMonitor.CurrentValue\` 在 Singleton 里每次拿到的是最新值——这是它和 \`IOptions<T>\` 的关键差异，也是「改了配置单例服务不生效」的经典坑位。

### 三、IHostedLifecycleService

.NET 8+ 可在 Starting/Started/Stopping/Stopped 等阶段挂钩。应用不能仅凭“进了 Started”就假定依赖可用：启动期完成必要初始化，随后才让 readiness 探针返回成功；Kubernetes / 负载均衡器看到 readiness 成功后再送流量。耗时预热要有超时，非关键依赖失败则保持降级而不是永久卡住启动。停止阶段反过来：先摘掉 readiness，等 in-flight 请求排干，再断依赖。

### 练习

1. 修改 demo 的 MiniHost：新增 \`AddTransient<T>\`（每次解析都新建实例），在同一个 scope 里 Get 两次，对比 Transient 与 Scoped、Singleton 三者的实例差异；再把 \`AppClock\` 从 AddSingleton 改为 AddScoped，观察两个 scope 各拿一份、同一 scope 内复用；最后运行第三部分，观察 keyed 解析按 key 取到不同实现、未知 key 抛出明确异常。
2. 独立实现 keyed 解析：给 MiniHost 加 \`AddKeyedSingleton<T>(string key)\` 与 \`Get<T>(string key)\`，注册 "redis" 与 "memory" 两个 \`ICache\` 实现，验证按 key 取到不同实例、未知 key 抛出清晰异常——模拟 .NET 8 keyed services 的语义。
3. 生产场景：把配置校验搬进 Options 管道——\`AddOptions<PaymentOptions>().BindConfiguration("Payment").ValidateDataAnnotations().ValidateOnStart()\`，写一个宿主集成测试证明坏配置（如 ApiKey 为空）在启动阶段直接失败，而不是首次请求才 500；再实现 \`IHostedLifecycleService\` 在 Started 阶段做连接池预热（带 30 秒超时），预热完成后才把 readiness 标记为健康。
`,
    code: `// ============================================================
// 第一百二十九章 Generic Host、Keyed DI 与 Options —— 可运行演示（net8.0 / C# 12）
// ------------------------------------------------------------
// Singleton 跨 Scope 同一实例，Scoped 每 Scope 一份，Transient 每次解析都 new。
// 捕获依赖：Singleton 攥住 RequestContext，下一个请求读到上一个用户——ValidateScopes=true 挡在启动期。
// Keyed 服务（.NET 8+）用 key 区分同接口多实现；未知 key 必须抛，不能悄悄返回 null 打到错误集群。
// Options 绑定失败应启动即崩（ValidateOnStart），不要第一个请求才发现连接串是空的。
// ============================================================

// ---------- 1. 生命周期边界 ----------
var root = new MiniHost();
root.AddSingleton(new AppClock());
root.AddScoped(() => new RequestContext(Guid.NewGuid()));
root.AddTransient(() => new OperationId(Guid.NewGuid()));

using (var scope1 = root.CreateScope())
using (var scope2 = root.CreateScope())
{
    var clockA = scope1.Get<AppClock>();
    var clockB = scope2.Get<AppClock>();
    var ctxA = scope1.Get<RequestContext>();
    var ctxB = scope2.Get<RequestContext>();
    var op1 = scope1.Get<OperationId>();
    var op2 = scope1.Get<OperationId>();
    Console.WriteLine($"Singleton 跨 scope 同一实例：{ReferenceEquals(clockA, clockB)}");
    Console.WriteLine($"Scoped 跨 scope 不同实例：{ctxA.Id != ctxB.Id}");
    Console.WriteLine($"Transient 同 scope 也不同实例：{op1.Id != op2.Id}");
}

// ---------- 2. Keyed 解析 ----------
var keyed = new KeyedCache();
keyed.Add("redis", new CacheStub("RedisCache"));
keyed.Add("memory", new CacheStub("MemoryCache"));

Console.WriteLine($"\\nkey=redis  → {keyed.Get("redis").Name}");
Console.WriteLine($"key=memory → {keyed.Get("memory").Name}");
try
{
    keyed.Get("dynamodb");   // 未知 key：必须明确失败，不能悄悄给 null
}
catch (KeyNotFoundException ex)
{
    Console.WriteLine($"key=dynamodb → 明确失败：{ex.Message}");
}

// ---------- 3. 捕获依赖的形状（反面教材注释说明）----------
// var bad = new SingletonWorker(scope1.Get<RequestContext>());
//   ↑ Singleton 构造函数注入 Scoped：RequestContext 本应随请求结束销毁，
//     现在被进程级的 Singleton 攥住——下一个请求读到的还是上一个请求的数据。
// 生产防线：ValidateScopes = true 让这种注册在启动时直接抛异常。

sealed class MiniHost
{
    private readonly Dictionary<Type, Func<Scope, object>> _factories = new();

    public void AddSingleton<T>(T instance) where T : class =>
        _factories[typeof(T)] = _ => instance;

    public void AddScoped<T>(Func<T> factory) where T : class =>
        _factories[typeof(T)] = scope => scope.GetOrCreate(typeof(T), () => factory());

    public void AddTransient<T>(Func<T> factory) where T : class =>
        _factories[typeof(T)] = _ => factory()!;   // 每次解析都新建

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

sealed class KeyedCache
{
    private readonly Dictionary<string, CacheStub> _stores = new();
    public void Add(string key, CacheStub cache) => _stores[key] = cache;
    public CacheStub Get(string key) =>
        _stores.TryGetValue(key, out var cache)
            ? cache
            : throw new KeyNotFoundException($"未注册 key '{key}' 的缓存实现");
}

sealed record AppClock();
sealed record RequestContext(Guid Id);
sealed record OperationId(Guid Id);
sealed record CacheStub(string Name);
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

ASP.NET Core OutputCache 缓存的是 **HTTP 响应**。必须把 Vary 规则写对：Authorization、租户、语言、查询参数。已认证的私有响应默认不要公共缓存——\`VaryByAuthorization\` 漏掉一次的代价，是用户 A 的订单列表被用户 B 刷到。

\`\`\`csharp-snippet
builder.Services.AddOutputCache(options =>
{
    options.AddPolicy("tenant", policy => policy
        .Expire(TimeSpan.FromSeconds(30))
        .VaryByQuery("page")
        .VaryByValue(async (ctx, _) =>
            new KeyValuePair<string, string>("tenant", ctx.User.TenantId())));
});
\`\`\`

### 二、HybridCache（.NET 9+）

HybridCache 组合 L1 内存 + L2 分布式，并内置 stampede 保护（同一 key 只回源一次）。生产仍要：

- key 含租户、版本、授权维度——\`tenant:{id}:orders:v3\`
- TTL + jitter（±10% 随机），防大批 key 同一秒过期引发回源风暴
- 序列化版本：改了 DTO 结构，旧缓存反序列化会炸或读出脏数据，把 schema 版本写进 key 最省事
- 分布式缓存故障时的降级预算：L2 挂了是回源打数据库，还是返回陈旧数据，要事先决定

### 三、失效

删除缓存失败不等于数据库回滚——\`Remove\` 抛异常时数据已经改了，缓存还是旧的。短 TTL、发出版本号、或把版本放进 key（改数据时递增版本，旧 key 自然没人再读），都比「相信每次 Remove 都成功」更稳。

主 demo 演示 stampede 保护（单飞）：热点 key 过期瞬间 50 个并发请求到达，只有 1 个回源；并展示「异常结果不该被缓存」这个常见缺陷。

### 练习

1. 修改 demo：把并发数从 50 提到 200，确认“回源数据库”仍然只打印一次；把 key 换成 "tenant:orders:cold" 再跑一轮，观察发生第二次回源；再注释掉第三部分里 factory 抛异常时的 \`_inflight.Remove(key)\` 清理，重跑观察后续请求全部卡住——体会为什么失败必须清理在途记录。
2. 独立实现带 TTL 的 StampedeCache：\`GetOrCreateAsync(key, ttl, factory)\` 记录写入时间，过期后下一次请求触发回源且同 key 仍然单飞；写测试覆盖三个场景——过期瞬间的 10 个并发请求只执行一次 factory、未过期命中不回源、不同 key 各自回源；同时修复“异常结果被缓存”的缺陷（失败要清理在途、可选缓存短暂负结果）。
3. 生产场景：为订单列表接口设计缓存方案——输出缓存层 \`VaryByQuery\` 加 \`VaryByAuthorization\` 防止跨用户串数据；HybridCache 的 key 设计为 \`tenant:{tenantId}:orders:v{schemaVersion}\`，TTL 60 秒加 ±10 秒 jitter 防同步过期；失效改为递增 schemaVersion 而不是依赖 Remove 成功；最后推演一遍：数据更新后旧缓存最长还能存活多久、回源风暴如何被单飞挡住。
`,
    code: `// ============================================================
// 第一百三十章 输出缓存、HybridCache 与失效 —— 可运行演示（net8.0 / C# 12）
// ------------------------------------------------------------
// 热点 key 过期时单飞：N 个并发只放行 1 个回源，其余搭便车，避免把数据库打穿。
// 回源失败必须 Remove 在途记录并透传异常；留下失败 Task 会让后续请求全部卡死或缓存负值。
// 缓存 key 要带租户/版本；失效用显式前缀淘汰，TTL 只是托底不是唯一正确性来源。
// ============================================================

// ---------- 1. 单飞：50 个并发只有 1 次回源 ----------
var cache = new StampedeCache();
var tasks = Enumerable.Range(0, 50)
    .Select(_ => cache.GetOrCreateAsync("tenant:orders:hot", () =>
    {
        Console.WriteLine("回源数据库（只应打印一次）");
        return Task.FromResult("payload-v1");
    }));

string[] results = await Task.WhenAll(tasks);
Console.WriteLine($"50 个并发拿到的去重结果：{string.Join(",", results.Distinct())}");

// ---------- 2. 异常路径：失败不缓存、不卡死后续请求 ----------
Console.WriteLine();
int attempts = 0;
for (int round = 1; round <= 2; round++)
{
    try
    {
        await cache.GetOrCreateAsync("flaky", () =>
        {
            attempts++;
            if (attempts == 1) throw new InvalidOperationException("数据库瞬断");
            return Task.FromResult("payload-v2");
        });
    }
    catch (InvalidOperationException)
    {
        Console.WriteLine($"第 {round} 轮：回源失败（异常透传给调用方，不进缓存）");
        continue;
    }
    Console.WriteLine($"第 {round} 轮：重试成功 → {await cache.GetOrCreateAsync("flaky", () => Task.FromResult("x"))}");
}

sealed class StampedeCache
{
    private readonly Dictionary<string, string> _store = new();
    private readonly Dictionary<string, Task<string>> _inflight = new();

    public Task<string> GetOrCreateAsync(string key, Func<Task<string>> factory)
    {
        lock (_store)
        {
            if (_store.TryGetValue(key, out var cached)) return Task.FromResult(cached);
            if (_inflight.TryGetValue(key, out var running)) return running;  // 搭在途请求的便车
            Task<string> created = Load(key, factory);
            _inflight[key] = created;
            return created;
        }
    }

    private async Task<string> Load(string key, Func<Task<string>> factory)
    {
        // 关键细节：async 方法在第一个 await 之前是同步执行的。
        // 若 factory 同步抛异常，异常发生在 _inflight[key] 赋值之前，
        // catch 里的 Remove 清不掉、随后写入的反而是「已失败的 Task」。
        // Task.Yield 把主体推迟到异步执行，保证 catch 时记录已在字典里。
        await Task.Yield();
        try
        {
            string value = await factory();
            lock (_store)
            {
                _store[key] = value;
                _inflight.Remove(key);
            }
            return value;
        }
        catch
        {
            lock (_store)
                _inflight.Remove(key);   // 失败也要清理在途，否则后续请求永远等一个已死的 Task
            throw;
        }
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

- **liveness**：进程是否已经不可恢复。失败 → 重启。**不要把下游 Redis/数据库放进来**——下游抖动会触发全部实例同时重启，形成连环车祸。
- **readiness**：现在能否接流量。失败 → 摘掉流量，不重启。可含数据库等关键依赖。
- **startup**：允许慢启动。启动完成前不要用 liveness 杀进程；\`failureThreshold × periodSeconds\` 必须大于最坏预热时长（JIT 预热、缓存加载、连接池建立）。

### 二、依赖分级

关键依赖（数据库）进入 readiness。非关键依赖（可选分析、邮件）失败应降级，不应让整个服务变 NotReady——邮件服务挂了就让全站拒收流量，等于用别人的故障惩罚自己的用户。

| 状态 | 含义 | 对外表现 |
| --- | --- | --- |
| Healthy | 全部检查通过 | 正常接流量 |
| Degraded | 关键依赖好、非关键挂了 | 接流量 + 告警，功能降级 |
| Unhealthy | 关键依赖挂了 | readiness 失败，摘流量 |

### 三、超时

健康检查自己也要超时。下游挂了时，检查必须快速失败（如 2s），否则探针线程被拖死、K8s 拿到的是「无响应」而非「明确不健康」，集群会按错误的剧本误判。检查之间应该并行执行并共享一个总预算，串行检查 5 个依赖会把超时预算逐个耗尽。

\`\`\`csharp-snippet
builder.Services.AddHealthChecks()
    .AddCheck("self", () => HealthCheckResult.Healthy())                    // liveness
    .AddDbContextCheck<ShopDbContext>("db", tags: ["ready"])                // readiness 关键
    .AddRedis(redisConn, "cache", tags: ["ready"],
        failureStatus: HealthStatus.Degraded);                              // 非关键降级
app.MapHealthChecks("/healthz", new() { Predicate = r => r.Tags.Count == 0 });
app.MapHealthChecks("/ready", new() { Predicate = r => r.Tags.Contains("ready") });
\`\`\`

### 练习

1. 修改 demo 的 \`AppHealth\`：新增 Redis 字段并作为关键依赖纳入 \`IsReady\`，运行三种组合观察：Redis 挂导致 not ready、Analytics 挂仍然 ready、StartupDone 为 false 时 live 与 ready 全 false；再观察第三部分三级汇总的输出——Analytics 挂时应为 Degraded 而非 Unhealthy；对照结果写一份依赖分级结论（哪些进 readiness、哪些降级放行）。
2. 独立实现 \`HealthCheckRunner\`：接收一组 (name, critical, check) 检查项，每项在 \`Task.Run\` 中执行并施加整体超时（超时即失败），返回 Healthy / Degraded / Unhealthy 三级——全部通过为 Healthy、仅非关键项失败为 Degraded、任一关键项失败为 Unhealthy；用一个故意 \`Task.Delay(Timeout.Infinite)\` 的检查项验证超时兜底生效。
3. 生产场景：写出 K8s 探针配置草案——livenessProbe 只探测进程自身（/healthz 固定返回 200，不含依赖检查）；readinessProbe 挂 /ready 并包含数据库；startupProbe 的 failureThreshold 乘 periodSeconds 大于最坏预热时长；附一份依赖分级表（数据库、Redis、邮件、分析服务各自进 liveness、readiness 还是都不进），并说明每条决策的依据。
`,
    code: `// ============================================================
// 第一百三十一章 健康检查、探针与依赖隔离 —— 可运行演示（net8.0 / C# 12）
// ------------------------------------------------------------
// liveness 只回答「进程要不要被杀」；把数据库探活放进 live 会导致依赖抖动时被 K8s 连环重启。
// readiness 回答「要不要接流量」：关键依赖（库、必须的缓存）失败才摘流，分析管道挂了应 Degraded。
// 探针自己必须有超时和剩余预算，禁止在 /health 里跑一次完整迁移或全表扫描。
// ============================================================

// ---------- 1 + 2. 探针决策矩阵 ----------
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

// ---------- 3. 三级汇总 ----------
Console.WriteLine();
var checks = new[]
{
    new HealthCheckItem("database", Critical: true, Passed: true),
    new HealthCheckItem("redis", Critical: true, Passed: true),
    new HealthCheckItem("analytics", Critical: false, Passed: false),  // 非关键挂
};

var overall = checks switch
{
    _ when checks.Any(c => c is { Critical: true, Passed: false }) => "Unhealthy（摘流量）",
    _ when checks.Any(c => !c.Passed) => "Degraded（接流量 + 告警）",
    _ => "Healthy",
};
Console.WriteLine($"汇总：{overall}");
foreach (var c in checks)
    Console.WriteLine($"  {c.Name,-10} critical={c.Critical} passed={c.Passed}");

public sealed record AppHealth(bool StartupDone, bool Database, bool Analytics);
public sealed record HealthCheckItem(string Name, bool Critical, bool Passed);
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

### 五、团队落地的常见坑

- **AppHost 版本漂移**：两人机器上 SDK 版本不同，编排行为微妙不同。把 SDK 版本写进 csproj 并让 \`aspire update\` 走 PR 审查。
- **把 WaitFor 当健康检查**：\`WaitFor(db)\` 只保证「在 db 之后启动」，不保证应用启动时 db 一定可用——应用自己的重试/超时策略一个都不能少。
- **连接信息写死**：\`Host=localhost:5432\` 写进代码，CI 和容器网络立刻翻车。永远通过 \`WithReference\` 注入的连接键读取。
- **把 AppHost 部署到生产**：AppHost 是开发编排器，生产拓扑用 IaC（Bicep/Terraform/Helm）显式表达。

主 demo 演示「资源引用」的核心思想：应用只依赖资源名，连接信息由环境注入——同一份代码在 local 与 prod 读出不同连接串；并演示启动依赖的拓扑排序。

### 练习

1. 修改 demo：新增一个 staging 环境的 \`EnvironmentBindings\`（analytics 连接指向 staging 域名），三个环境循环打印 shop 连接串；再对不存在的 key 调用 \`Get\`，把 \`KeyNotFoundException\` 改为返回默认值的 \`TryGet\`，体会“缺配置显式失败还是静默默认”的取舍；最后给第三部分资源图加一条 worker WaitFor redis 的边，观察拓扑排序输出如何变化。
2. 独立实现 \`ResourceGraph\`：提供 \`AddProject\`、\`AddRedis\`、\`WithReference\`、\`WaitFor\` 方法描述资源与依赖关系，\`StartupOrder()\` 做拓扑排序输出启动顺序；构造 api WaitFor pg、pg 依赖 volume 的三层图，验证输出顺序正确，并让循环依赖的图抛出明确异常。
3. 生产场景：为团队编写 Aspire 验收清单并逐条给出验证命令——aspire init 后核对 AppHost csproj 的 SDK 版本被仓库钉住；数据库容器健康检查未通过时 API 不发出首个请求（WaitFor 加应用侧重试双保险）；全局搜索确认没有写死 6379/5432 端口；Ctrl+C 停止后确认 docker ps 无孤儿容器；把 API 项目单独 dotnet run，仅靠环境变量注入连接串也能在 CI 启动。
`,
    code: `// ============================================================
// 第一百三十二章 .NET Aspire 与本地开发编排 —— 可运行演示（net8.0 / C# 12）
// ------------------------------------------------------------
// 应用只认资源名（ConnectionStrings:shop），连接串由环境注入，同一份代码才能从 localhost 走到内部 DNS。
// WaitFor 是启动拓扑：有环必须失败，不要靠超时「等一等也许好了」。
// Aspire 是开发时编排，不是生产调度器；生产仍由 K8s/云资源接手同样的连接串契约。
// ============================================================

// ---------- 1. 环境绑定：同一份代码，不同连接串 ----------
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

// ---------- 2. 启动拓扑排序 ----------
// api WaitFor db，db WaitFor volume：volume 必须先就绪。
var graph = new ResourceGraph();
graph.WaitFor("api", "db");
graph.WaitFor("db", "volume");
graph.Add("cache");   // 无依赖：可任意早启动

Console.WriteLine("\\n启动顺序：" + string.Join(" → ", graph.StartupOrder()));

sealed record EnvironmentBindings(string Name, Dictionary<string, string> Values)
{
    public string Get(string key) => Values[key];
}

sealed class ResourceGraph
{
    private readonly Dictionary<string, List<string>> _edges = new();  // node → 它依赖的节点
    private readonly HashSet<string> _nodes = new();

    public void Add(string node) => _nodes.Add(node);

    public void WaitFor(string node, string dependsOn)
    {
        _nodes.Add(node);
        _nodes.Add(dependsOn);
        if (!_edges.TryGetValue(node, out var deps)) _edges[node] = deps = new();
        deps.Add(dependsOn);
    }

    // Kahn 拓扑排序；有环说明依赖写错，必须明确报错而不是死循环
    public IReadOnlyList<string> StartupOrder()
    {
        var indegree = _nodes.ToDictionary(n => n, n => _edges.GetValueOrDefault(n)?.Count ?? 0);
        var ready = new Queue<string>(_nodes.Where(n => indegree[n] == 0));
        var order = new List<string>();
        while (ready.Count > 0)
        {
            var node = ready.Dequeue();
            order.Add(node);
            foreach (var (dependent, deps) in _edges)
                if (deps.Remove(node) && deps.Count == 0) ready.Enqueue(dependent);
        }
        if (order.Count != _nodes.Count)
            throw new InvalidOperationException("检测到循环依赖，无法确定启动顺序");
        return order;
    }
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

- **共享库 + tenant_id**：成本低，必须每条查询带租户，并用约束/全局过滤器兜底（EF Core \`HasQueryFilter\`）。
- **每租户 schema/数据库**：隔离强，运维复杂——迁移要跑 N 次，连接池要按租户管理，适合大客户或强合规行业。
- **行级安全（RLS）**：数据库再挡一层，应用过滤器不能作为唯一防线。应用层 bug 漏了条件时，RLS 是最后一道墙。

| 模式 | 隔离强度 | 运维成本 | 适用 |
| --- | --- | --- | --- |
| 共享表 + tenant_id | 低（靠代码） | 低 | 中小租户、量大 |
| 每租户 schema | 中 | 中 | 需要按租户备份/导出 |
| 每租户数据库 | 高 | 高 | 大客户、驻留要求 |
| 共享 + RLS 兜底 | 中高 | 中 | 通用推荐组合 |

### 二、租户从哪来

从已验证的 token/claim 取 tenant，**不要**信客户端 header 里的 \`X-Tenant-Id\`（除非它经过网关签名且与身份一致）。跨租户管理操作（客服代查）走独立的权限提升流程：显式授权 + 全程审计，不是「把 header 改成别人的租户」。

### 三、缓存与日志

缓存 key、队列分区、搜索索引都必须含租户——\`orders:o-1\` 这种裸 key 在多租户系统里就是串数据的邀请函。日志可记 tenantId，但不要把跨租户数据打进同一调试 dump 后发给错误的人：导出排障数据时，按租户过滤是第一道工序。

### 四、测试策略

「忘记加租户条件」必须是会失败的测试，而不是代码评审时的运气。两个层次：

1. 单元/集成测试：构造两个租户的数据，断言查询结果不串。
2. 防线测试：故意写一个漏掉租户过滤的查询，验证应用层守卫或 RLS 至少有一层拦截——这层测试防的是「未来的新代码」。

### 练习

1. 修改 demo：给 orders 数组加一条租户 "C" 的记录，当前租户 A 过滤后确认看不到它；把 headerTenant 改成与 tokenTenant 相同的 "A"，观察走进“租户一致”分支；再试试 headerTenant 传空串，决定应该拒绝还是回退到 token 中的租户；最后运行第三部分，观察裸 key 与租户前缀 key 的差异。
2. 独立实现租户守卫封装：写 \`TenantScope\`（持有当前 TenantId）与扩展方法 \`ApplyTenantFilter\`，所有查询必须经过它；再写断言方法 \`AssertSameTenant\`，任何结果混入其它租户数据就抛异常——把它放进单元测试基类，让“忘记加租户条件”的查询在 CI 直接失败。
3. 生产场景：设计缓存与日志两处的租户隔离——缓存层封装 \`TenantKey.Build("orders", id)\` 统一产出 \`tenant:{tenantId}:orders:{orderId}\` 前缀，禁止裸拼 key；日志结构化字段带 tenantId 但金额、邮箱脱敏；评估共享库 tenant_id 与数据库 RLS 组成双层防线，写一条回归测试：故意构造漏加租户过滤的查询，验证应用层守卫与 RLS 至少有一层拦截。
`,
    code: `// ============================================================
// 第一百三十三章 多租户、数据隔离与授权边界 —— 可运行演示（net8.0 / C# 12）
// ------------------------------------------------------------
// 查询忘记 tenant 条件就是串数据；全局查询过滤器可以托底，但写原生 SQL 时仍要手传。
// 租户身份只信已验证 token，客户端 header 是攻击面（改成邻居租户 ID 即可读）。
// 缓存/队列/日志的 key 必须带租户前缀；裸 orders:o-1 会让 B 租户命中 A 的缓存。
// ============================================================

// ---------- 1. 查询过滤 ----------
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

// ---------- 2. 租户来源校验 ----------
var headerTenant = "B"; // 恶意请求
var tokenTenant = "A";
Console.WriteLine(headerTenant == tokenTenant
    ? "\\n租户一致"
    : "\\n拒绝：header 与令牌中的租户不一致");

// ---------- 3. 缓存 key 设计 ----------
string currentTenant = tokenTenant;
string badKey = $"orders:o-1";                              // 裸 key：B 租户读同 id 会命中 A 的缓存
string goodKey = TenantKey.Build(currentTenant, "orders", "o-1");
Console.WriteLine($"裸 key：{badKey}  ← 跨租户共享，禁止");
Console.WriteLine($"带租户：{goodKey}");

static class TenantKey
{
    public static string Build(string tenant, string resource, string id) =>
        $"tenant:{tenant}:{resource}:{id}";
}

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

\`CancellationToken\` 必须从 HTTP/消息/宿主一直传到 DB 和 HttpClient。捕获 \`OperationCanceledException\` 后要判断是**请求取消**（客户端走了，返回 499 或安静结束）还是**本服务超时**（自己设的 deadline 到了，返回 504）——两者的语义、日志级别、告警策略完全不同。\`CancellationToken\` 不允许被 catch 吞掉后继续跑业务逻辑，那叫「僵尸请求」：客户端早走了，你还在花钱改数据库。

### 二、deadline

重试时不要每次都给满超时。应计算剩余预算：总 deadline 5s，已花 3s，下次只许 2s。链路上每一跳都应该拿到「剩余时间」而不是「本地新预算」——入口剩 200ms，下游再设 2s，等于无视预算（第一百〇一章 gRPC 章节的 CallOptions.Deadline 同理）。Deadline 应从入口透传：HTTP 请求超时、gRPC deadline、消息可见性超时，最终都落成 \`CancellationTokenSource(剩余时间)\`。

### 三、背压

Channel/Queue 必须有界。满了要失败、丢弃或阻塞生产者——需要明确策略：

| FullMode | 语义 | 适用 |
| --- | --- | --- |
| Wait | 生产者阻塞等空位 | 不可丢消息（订单） |
| DropOldest | 丢最旧 | 指标、遥测采样 |
| DropNewest | 丢最新 | 心跳类「旧的更值钱」场景 |
| DropWrite | 丢当前写入 | 极少用，语义易误读 |

无界队列等于把内存当缓存——流量尖峰时 OOM 比拒绝请求更难恢复。容量估算：下游吞吐 × 可容忍延迟。下游每秒处理 100 条、可容忍 2 秒延迟，容量就是 200；超出说明下游已经跟不上了，堆更多只是推迟爆炸。

主 demo 用有界 Channel + deadline 演示：容量 4、总预算 200ms，生产者入队被背压拖住，到点取消而不是无限堆积。

### 练习

1. 修改 demo：把 deadline 从 200ms 分别改成 50ms 与 2s，观察入队条数与 \`OperationCanceledException\` 触发时机的变化；再把 \`BoundedChannelOptions\` 容量从 4 改成 1，对比背压出现得更早——记录每种组合的入队与消费条数；最后把 FullMode 改成 \`DropOldest\`，观察「入队 8 条、消费只拿到最后几条」的丢弃语义。
2. 独立实现 \`DeadlineBudget\`：构造时记录总预算（如 5 秒）与起始时间，提供剩余时间属性与 \`CreateLinkedTokenSource()\`（内部按剩余时间创建 \`CancellationTokenSource\`）；模拟“首次调用花 3 秒、重试只剩 2 秒”的场景，验证第二次的超时预算自动收紧而不是重新给满 5 秒。
3. 生产场景：为消息消费者设计背压策略——\`Channel.CreateBounded\` 容量按下游吞吐乘可容忍延迟估算；可丢消息（指标上报）用 \`BoundedChannelFullMode.DropOldest\`，不可丢消息（订单）用 Wait 并把 \`Reader.Count\` 作为 lag 指标暴露；写一次演练：把消费速度降到每秒 1 条，观察生产者阻塞、lag 告警、超过 deadline 后的降级动作分别如何触发。
`,
    code: `// ============================================================
// 第一百三十四章 取消、超时、deadline 与背压 —— 可运行演示（net8.0 / C# 12）
// ------------------------------------------------------------
// 有界 Channel + Wait：队列满时生产者被拖住，无界队列只是把爆炸推迟到 OOM。
// deadline 是整条操作的绝对截止时间；每次 IO/Delay/WaitToWrite 都传同一 token，用的是剩余预算。
// 反例：每一步 new CancellationTokenSource(200ms) 会让总耗时变成步数 × 200ms，上游早已超时本地还在写。
// 取消后要 TryComplete，让消费者收尾退出，不要留下孤儿读取循环。
// ============================================================
await RunAsync();

static async Task RunAsync()
{
    using var deadline = new CancellationTokenSource(TimeSpan.FromMilliseconds(200));
    var channel = System.Threading.Channels.Channel.CreateBounded<int>(
        new System.Threading.Channels.BoundedChannelOptions(4)   // 容量 4：满了就背压
        {
            FullMode = System.Threading.Channels.BoundedChannelFullMode.Wait,
        });

    // 消费者故意很慢：100ms 一条，模拟下游吞吐不足
    var consumer = Task.Run(async () =>
    {
        await foreach (var item in channel.Reader.ReadAllAsync())
        {
            Console.WriteLine($"  消费 {item}");
            await Task.Delay(100);
        }
    });

    try
    {
        for (int i = 1; i <= 8; i++)
        {
            // WaitToWriteAsync 在队列满时等待；叠加 deadline 形成「等不起就放弃」
            // 同一个 deadline.Token：Wait 和 Write 共享剩余时间，不会各自再等 200ms。
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
    await consumer;
    Console.WriteLine("要点：有界 + Wait + deadline = 背压三件套；无界队列只是把爆炸推迟到 OOM。");
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
- **机密**：邮箱、手机、地址——可进日志但必须脱敏。
- **严格机密**：密码、证件、银行卡、生物特征。这些**永远不要**进日志、指标标签、trace attribute、dump 默认采集。

| 级别 | 例子 | 日志策略 | 泄漏后果 |
| --- | --- | --- | --- |
| 公开 | 商品名 | 原文 | 无 |
| 内部 | 订单号、tenantId | 原文，限内部访问 | 低 |
| 机密 | 邮箱、手机 | 脱敏（首***尾） | 中：骚扰、撞库 |
| 严格机密 | 密码、证件、卡号 | [REDACTED] 占位 | 高：直接违法 |

分级的落点不是一个文档，而是**代码里的分类器**：字段名命中严格机密名单就直接替换为占位符，不依赖每个开发记得。

### 二、审计

谁在何时对哪条资源做了什么，要写审计表/事件。审计失败通常应让写操作失败，或进入可靠 Outbox，不能「审计挂了业务照样改完」——没有审计的变更等于没有发生过的变更，合规审计时你无法自证。审计记录应包含：操作人、时间、资源 id、动作、变更前后快照（或快照哈希）。审计存储本身要防篡改：追加只写、独立权限。

### 三、结构化

用模板 + 属性：\`Order {OrderId} paid\`，不要 \`$\"user={email} token={jwt}\"\`。前者的 \`OrderId\` 是可索引字段，后者是一坨必须正则解析的文本。保留期限按法规设置（如 180 天），过期删除要**可证明**——删除任务产出可导出的执行记录，而不是「我们相信它删了」。

指标标签同样受分级约束：高基数字段（userId、email）不进 metrics label，否则时序数据库先被基数打爆，再把隐私泄进监控系统。

### 练习

1. 修改 demo 的 \`redact\` 数组：加入 "idCard" 与 "bankCard"，并给样本补一条含 18 位身份证号与长度恰好 4 的短 token 的事件；观察 \`Mask\` 对短值走 "****" 分支、长值保留首尾两字符的规则边界——长度 5 与 4 的值分别输出什么；再观察第三部分分级渲染：password 与 email 的输出有何不同。
2. 独立实现分级日志器：\`SensitivityClassifier\` 按字段名把数据分为公开、内部、机密、严格机密四级，\`Render\` 时机密字段走 Mask 脱敏、严格机密（password、idCard、bankCard）直接替换为 "[REDACTED]"；输出用模板加属性的形式（如 \`order {orderId} paid\`），保证结构化字段可被日志系统索引。
3. 生产场景：为订单模块实现审计事件——审计表记录操作人、时间、资源 id、动作与变更前后的快照哈希；审计写入失败时业务写操作回滚或落入可靠 Outbox，禁止“审计挂了业务照常改”；保留期限按法规设为 180 天，到期删除任务要产出可导出的删除证明；写一个集成测试：让审计存储故意不可用，验证下单接口返回 503 而不是静默成功。
`,
    code: `// ============================================================
// 第一百三十五章 审计、数据分级与合规日志 —— 可运行演示（net8.0 / C# 12）
// ------------------------------------------------------------
// 日志是长期存储：能 grep 日志的人通常多于能调接口的人，PII 必须按级别处理。
// Confidential（邮箱/手机）保留首尾便于排障；Restricted（密码/证件）连脱敏版本都不输出。
// 未知字段按最严处理（REDACTED），白名单放行比黑名单漏字段安全。
// 审计事件要有稳定 eventName，和追踪 traceId 关联，但不要把 token 原文写进审计库。
// ============================================================

// ---------- 1. 脱敏渲染 ----------
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

// ---------- 2. 分级渲染：严格机密连脱敏版本都不输出 ----------
Console.WriteLine();
var sensitive = new Dictionary<string, string>
{
    ["orderId"] = "A-100",                                  // 内部：原文
    ["email"] = "ada@example.com",                          // 机密：脱敏
    ["password"] = "S3cret!",                               // 严格机密：占位
    ["idCard"] = "110101199001011234",                      // 严格机密：占位
};

foreach (var (key, value) in sensitive)
{
    string output = Classify(key) switch
    {
        Level.Public or Level.Internal => value,
        Level.Confidential => Mask(key, value),
        Level.Restricted => "[REDACTED]",
        _ => "[REDACTED]",                                  // 未知级别按最严处理
    };
    Console.WriteLine($"{Classify(key),-12} {key,-10} = {output}");
}

static Level Classify(string field) => field.ToLowerInvariant() switch
{
    "password" or "idcard" or "bankcard" => Level.Restricted,
    "email" or "phone" or "address" => Level.Confidential,
    "orderid" or "tenantid" or "userid" => Level.Internal,
    _ => Level.Public, // 未知键默认 Public 只适合本 demo；生产未知键应 Restricted，避免新字段裸奔进日志
};

enum Level { Public, Internal, Confidential, Restricted }
`,
    lang: "cs",
  },
];

export { chapters };
