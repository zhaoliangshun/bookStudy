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

### 五、验证库怎么落地：三条路的取舍

| 方案 | 优势 | 代价 / 坑 | 适用 |
| --- | --- | --- | --- |
| DataAnnotations | 零依赖、特性即文档、源生成友好 | 跨字段与条件规则写起来别扭（\`IValidatableObject\` 勉强） | 简单 DTO、SDK/共享契约 |
| FluentValidation | 规则即代码，跨字段、条件、\`RuleSet\`、递归 \`SetValidator\` 都自然 | 多一个依赖；反射扫描有冷启动成本；AOT 需额外确认 | 复杂表单、规则密集的后台 |
| .NET 10 源生成验证（\`AddValidation()\`） | 零分配、编译期发现、AOT 友好 | 只覆盖 DataAnnotations 子集 + \`[ValidatableType]\`；**必须在声明类型的那个程序集里注册** | 新项目、AOT/Native 场景 |

三个落地细节，踩过的人都记得：

1. **FluentValidation 的 validator 生命周期是 Transient**，不要在 validator 里注入 Scoped 服务（\`DbContext\`）——那会变成捕获依赖。需要查库的规则（"用户名是否已存在"）请放到 handler 里用 \`ValidateAsync\` 手动跑，把校验拆成「纯格式校验自动跑」和「需查库的业务校验手动跑」两层。
2. **跨程序集不生效**：\`AddValidation()\` / \`AddValidatorsFromAssembly\` 只扫你传进去的程序集。把 DTO 放在共享类库、却在 API 项目里注册，规则会静默失效——验证"通过"了，其实一次都没跑。加一条集成测试专门盯它。
3. **本地化**：\`ValidatorOptions.Global.LanguageManager\` 与 DataAnnotations 的 \`ErrorMessageResourceType\` 都要在启动时配好；错误消息是契约的一部分，别让它随线程 Culture 漂移。

### 六、嵌套、集合与现代绑定写法

DataAnnotations 有个反直觉的默认行为：**复杂属性不会自动递归验证**。

\`\`\`csharp-snippet
// 默认：Order 上的 [Required] 会查，但 Items 里每个元素的规则不查。
// .NET 8+ 显式打开：
public sealed class CreateOrderInput
{
    [ValidateObjectMembers]                       // 递归进 Address 内部
    public AddressInput Address { get; set; } = new();

    [ValidateEnumeratedItems]                     // 逐个查集合元素
    [MaxLength(50)]
    public List<OrderLineInput> Items { get; set; } = new();
}

// record 主构造函数上写特性必须加 property: 前缀，
// 否则特性挂在「参数」上而不是「属性」上，验证器根本看不见。
public sealed record CreateOrderInput(
    [property: Required, MinLength(1)] string Sku,
    [property: Range(1, 99)] int Quantity);
\`\`\`

现代绑定的几个省力写法：

- **\`TryParse\` / \`IParsable<T>\`**：给强类型 id、\`DateOnly\`、自定义值对象实现静态 \`TryParse\`，路由和查询参数会自动解析，解析失败自动进 ModelState——不用再写字符串转类型的样板。
- **\`BindAsync\`**：复杂类型需要异步解析（比如从 Body + Route 组合）时实现它。
- **\`[AsParameters]\`**：把一组查询参数打包成 \`record struct\`，minimal API 里少写一串 \`[FromQuery]\`。
- **JSON 选项**：\`PropertyNameCaseInsensitive\` 决定大小写容错；\`NumberHandling\` 允许字符串数字时要小心（"1" 和 1 混着进来的系统，迟早在排序上出问题）；\`MaxDepth\` 必须设——深层嵌套 JSON 是低成本的栈溢出 DoS。

### 七、文化、可空与枚举：三个静默 bug 源

这三类问题都不会报错，只会悄悄给出错误结果。

1. **文化（Culture）**：\`decimal.TryParse("1,5", out var v)\` 在 \`de-DE\` 下是 1.5，在 \`en-US\` 下是 15。\`DateTime\` 同理，\`03/04\` 是 3 月 4 日还是 4 月 3 日取决于机器。API 边界一律显式指定：
   \`\`\`csharp-snippet
   // 错：吃当前线程文化，容器里设了 LANG 就变
   decimal.TryParse(text, out var price);
   // 对：边界上永远不变文化
   decimal.TryParse(text, NumberStyles.Number,
                    CultureInfo.InvariantCulture, out var price2);
   \`\`\`
   配套：金额用 \`decimal\` 而不是 \`double\`；对外的 JSON 金额用**整数分**，同时避开浮点精度和 JavaScript \`number\` 的 2^53 天花板。
2. **可空与 bool**：\`bool\` 字段缺失时默认是 \`false\`，你无法区分"客户端传了 false"和"客户端没传"。补丁（PATCH）语义下必须用 \`bool?\`，或检查 \`ModelState\` 里是否存在该 key。
3. **枚举**：默认按数字绑定，\`?status=999\` 会得到一个不存在的枚举值且**不报错**。配 \`JsonStringEnumConverter\` 后未知字符串才会 400。生产建议显式 \`Enum.IsDefined\` 兜一遍，或直接用字符串常量白名单。

### 八、出站也要收敛：over-getting

入站防 over-posting，出站防 over-getting。直接把 EF 实体序列化返回，等于把 \`PasswordHash\`、\`TenantId\`、内部状态机字段、软删除标记一起发出去——而且下次给实体加字段时，API 响应会**自动**多一个字段，没人评审过。

- 出站一律用显式响应 DTO，\`sealed record\` 最省心（不可变、值语义、可测）。
- 可选字段裁剪（\`?fields=\`）也要走白名单，否则 \`?fields=passwordHash\` 就是自助餐。
- 映射：手写显式映射最可控，也最适合 AOT/trimming；用自动映射库的代价是"改了实体字段，DTO 悄悄变了"。高频热路径可以上源生成的映射器兼顾两者。

### 生产检查

- [ ] 入站 DTO 与持久化实体分离，字段白名单拷贝，禁 \`TryUpdateModelAsync(entity)\`
- [ ] 出站 DTO 不含 \`PasswordHash\` / \`TenantId\` / 内部状态；新增实体字段不会自动出现在响应里
- [ ] 领域冲突（库存不足、状态不允许、币种不支持）返回 409/422，不是 400
- [ ] 错误 \`code\` 常量化，并在 OpenAPI 上声明（\`.ProducesValidationProblem()\`、\`.ProducesProblem(StatusCodes.Status409Conflict)\`）
- [ ] 所有 \`decimal\`/\`DateTime\` 解析显式传 \`CultureInfo.InvariantCulture\`
- [ ] 嵌套对象与集合元素的验证确实生效（\`[ValidateObjectMembers]\` / \`[ValidateEnumeratedItems]\`），有测试证明
- [ ] 请求体大小、集合长度、JSON 深度三者都设了上限
- [ ] 验证规则跨程序集时，注册了该程序集且有集成测试断言"非法输入必被拒"
- [ ] 有集成测试覆盖：缺字段、越界、类型不符、未知枚举，都返回 400 且错误形状稳定

### 练习

1. 修改 demo 的 samples 数组：加入 quantity = 100（越界）、currency = ""（空串）、sku = "  "（纯空白）三个新样本，观察 \`Validate\` 聚合出的 400 字段错误信息；再把合法样本的 currency 改成小写 "cny"，确认 \`OrdinalIgnoreCase\` 比较仍通过业务规则；最后给 \`ApplyToEntity\` 传一个带 \`"total": 0\` 的恶意 JSON 字段集合，确认白名单之外的字段不会写进实体。
2. 独立实现 \`ToProblem\` 错误形状生成器：输入 \`ValidationResult\`，输出符合 RFC 9457 的对象（type/title/status/detail 加字段级 errors 数组）；格式错误（400）与业务冲突（409）映射到不同的 type URI，未知 code 走默认分支，保证客户端永远按 code 分支而不是解析中文句子。
3. 生产场景：把 CreateOrderRequest 接入 ASP.NET Core 验证管道——\`AddValidation()\` 加 \`AddProblemDetails()\`，请求模型加 \`[Required]\` 与 \`[Range(1, 99)]\` 标注；写集成测试覆盖五条路径：缺 sku 返回 400 且 errors 指向字段、quantity 越界返回 400、USD 结算返回 409、合法输入返回 201、请求体多塞 \`Total\` 字段时实体值不被覆盖（over-posting 被忽略）。
`,
    code: `// ============================================================
// 第一百二十七章 输入验证、绑定与错误形状 —— 可运行演示（net8.0 / C# 12）
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

### 四、分页怎么选：offset 与 keyset 的账

\`?page=3&size=20\` 人人会写，但它有两个物理上的硬伤：**深分页越来越慢**（数据库要数过并丢弃前面所有行），**翻页时会漂移**（两次查询之间插入了新数据，第 2 页会重复显示第 1 页的最后几条，或漏掉几条）。

| 方案 | 优点 | 代价 | 适用 |
| --- | --- | --- | --- |
| Offset（\`LIMIT/OFFSET\`） | 实现简单、可跳页、能显示总页数 | 深分页慢；并发写入会漂移 | 后台管理、数据量小、要跳页 |
| Keyset / cursor | 性能恒定；不漂移 | 不能跳到任意页；游标要防篡改 | 信息流、列表 API、大数据量 |
| Keyset + 总数字段 | 兼顾体验 | 总数要单独 \`COUNT\`，很慢时可缓存/估算 | 通用推荐 |

keyset 的三个实现细节：

1. **排序必须唯一**：只按 \`created_at\` 排序，同一时间戳的行在两次查询间顺序不定，翻页会重复/丢失。必须加唯一 tiebreaker：\`ORDER BY created_at DESC, id DESC\`，游标里同时带上两个值（SQL 里用行值比较 \`(created_at, id) < (@afterCreatedAt, @afterId)\`）。
2. **游标是不透明 token**：Base64 编码 \`{"v":1,"createdAt":...,"id":...}\`，带版本号。客户端篡改、版本不符、解不开 → 400，不要静默返回"第一页"。
3. **响应形状**：返回 \`items\` + \`nextCursor\`，有下一页时才给 \`nextCursor\`；末页返回空 \`items\` 且 \`nextCursor = null\`。**不要用"返回了少于 pageSize 条"来判断末页**——刚好整除时会多翻一次空页。

\`\`\`csharp-snippet
// 稳定的 keyset 查询：行值比较 + 唯一 tiebreaker
// CREATE INDEX ix_orders_tenant_created_id ON orders (tenant_id, created_at DESC, id DESC);
var sql = """
    SELECT id, sku, quantity, created_at
    FROM orders
    WHERE tenant_id = @tenant
      AND (created_at, id) < (@afterCreatedAt, @afterId)   -- 上一页最后一行之后
    ORDER BY created_at DESC, id DESC
    LIMIT @take;
    """;
// 翻页必须配一个匹配的复合索引，否则 keyset 也只是"看起来很快"。
\`\`\`

### 五、幂等的三个真实难点

demo 里的 \`ConcurrentDictionary\` 只演示了语义。落到生产，难的是这三件事：

1. **竞态**：两个相同 key 的请求同时到达，都查不到记录，然后都执行了业务逻辑——幂等形同虚设。解法是让存储本身挡住：\`(tenant, key)\` **唯一索引**，插入成功者执行，插入冲突者去读已有结果；或用一个分布式锁/租约。
2. **原子性**：幂等记录和业务写入必须**同一个事务**。先写业务再写幂等记录，中间崩了，重试会再执行一次；反过来说，业务失败时幂等记录必须一起回滚，否则这个 key 永久被"已成功"占用却什么都没做。
3. **"处理中"状态**：第一个请求还在跑，第二个相同 key 到达。三种做法选一：等待第一个完成并复用结果（用户体验最好，需要锁或轮询）、直接返回 409 + \`Retry-After\`（最简单）、返回 202 让客户端轮询结果。选哪个取决于操作时长——支付类通常等，导出类通常 202。

配套：记录要带 **TTL**（支付类常留 24h，够覆盖客户端重试窗口即可，别永久保留）；指纹只对 **body 的规范化形式** 取哈希（JSON 键顺序、空白差异要归一化，否则语义相同的请求被判成冲突）。

### 六、查询约定的默认答案

把这几条写进 API 规范，能省掉大部分来回讨论：

- **过滤/排序白名单**：用户字符串永不进 SQL（第一百二十八章同款）。未支持的 \`sort\` 值返回 400 并列出允许值，不要静默忽略——静默忽略会让前端以为生效了。
- **默认上限与硬上限**：\`take\` 默认 20、硬上限 100；超过硬上限返回 400（不是截断返回，那会让客户端以为拿全了）。
- **时间范围**：列表查询默认限制时间窗口（如最近 90 天），避免一个没带过滤条件的请求扫全表。
- **稳定排序**：不指定 \`sort\` 时也要有确定的默认排序，否则分页不可重现。
- **条件请求**：读接口支持 \`ETag\` / \`Last-Modified\`，配合 \`If-None-Match\` 返回 304，省带宽也省数据库。
- **大结果集导出**：不要靠翻页把 100 万行拉出来——那会把数据库和连接池拖死。导出走异步任务：提交请求 → 生成文件到对象存储 → 短寿命预签名 URL 通知下载。

### 生产检查

- [ ] 写接口（POST/PATCH/DELETE）都设计了幂等语义，重试不产生副作用
- [ ] 幂等记录与业务写入同库同事务，\`(tenant, key)\` 有唯一索引
- [ ] 幂等记录有 TTL，且覆盖"处理中"状态（等待 / 409 / 202 三选一，写进文档）
- [ ] 幂等指纹对 body 规范化后取哈希（键顺序、空白不敏感）
- [ ] 分页排序带唯一 tiebreaker，游标带版本号且防篡改
- [ ] 已有列表接口评估过 offset → keyset 迁移，深分页（>1000）有监控
- [ ] \`take\` 有硬上限，超限返回 400 而非静默截断
- [ ] 排序/过滤字段白名单，未支持的值 400 而非忽略
- [ ] 大结果集导出走异步任务，不靠同步翻页
- [ ] 有并发测试证明：相同 key 并发请求只执行一次业务逻辑

### 练习

1. 修改 demo：先用 key-1、body "sku=1,qty=2" 执行一次，再用相同 key、body 改为 "sku=1,qty=9" 调用，确认返回 422 指纹不匹配；把 \`KeysetPage\` 的 after 分别改成 7 与 0，观察末页（空结果）与首页的输出边界；再给 \`Execute\` 传一个 Processing 状态的记录（直接往 \`_records\` 里塞），观察第二个并发请求会等到结果还是拿到 409。
2. 独立实现带“处理中”状态的幂等存储：并发两个相同 (tenant, key) 请求只允许一个执行 create，另一个等待其完成后复用结果；用 \`ConcurrentDictionary\` 加 \`SemaphoreSlim\`（或 Lazy 模式）实现，写并发测试验证 create 委托只执行一次、两个调用方拿到同一响应。
3. 生产场景：把 cursor 分页落到 SQL——按 (createdAt, id) 稳定排序，写出形如 \`WHERE (createdAt, id) > (@afterCreatedAt, @afterId) ORDER BY createdAt, id LIMIT @take\` 的查询；把游标编码成 Base64 的 nextCursor 随响应返回，解码时校验格式并拒绝伪造游标；排序字段建允许列表（如只允许 createdAt 与 amount），防止用户输入拼进 ORDER BY。
`,
    code: `// ============================================================
// 第一百二十八章 幂等、分页与查询约定 —— 可运行演示（net8.0 / C# 12）
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

### 五、CSRF 到底怎么防

先厘清一件事：**CSRF 只在"浏览器会自动带上凭据"时才成立**。如果你的 API 只认 \`Authorization: Bearer\` 头（浏览器不会自动加），那它没有 CSRF 问题；一旦用 Cookie 会话（哪怕 \`SameSite=Lax\`），就必须防。

三种做法，按推荐度排序：

1. **SameSite=Lax/Strict 打底**：现代浏览器的默认防线，能挡住跨站 POST 携带 Cookie。它是**必要但不充分**——Lax 允许顶级导航的 GET 携带 Cookie，旧浏览器和某些边缘场景仍会漏，所以不能只靠它。
2. **Anti-forgery token（推荐）**：服务端发一个与会话绑定的 token，前端在表单/请求头里回传，服务端校验。ASP.NET Core MVC 内置 \`ValidateAntiForgeryToken\`；SPA/前后端分离场景用 **double-submit**：token 同时放 Cookie 和自定义头（如 \`X-XSRF-TOKEN\`），服务端比对两者——攻击者能诱导浏览器带上 Cookie，但读不到 Cookie 内容也设不了自定义头（跨域自定义头会触发预检）。
3. **要求自定义头**：简单粗暴但有效——跨域自定义头必然触发预检，而预检不通过浏览器就不会发真实请求。

配套三条：**State-changing 操作必须 POST/PUT/PATCH/DELETE**（不要用 GET 改状态，那连"诱导点击链接"都够用了）；校验 \`Origin\`/\`Referer\` 作为**辅助**手段（不是唯一防线，某些代理会剥掉）；token 与用户会话绑定，别做成全局共享值。

### 六、安全头清单与 CSP 落地

这一组头加起来的成本不到一小时，收益是挡掉一整类低级攻击：

\`\`\`csharp-snippet
app.Use(async (ctx, next) =>
{
    var h = ctx.Response.Headers;
    h["X-Content-Type-Options"] = "nosniff";                    // 禁止 MIME 嗅探：text/plain 别给我当 HTML 执行
    h["X-Frame-Options"] = "DENY";                              // 或 CSP 的 frame-ancestors
    h["Referrer-Policy"] = "strict-origin-when-cross-origin";   // 别把完整 URL 泄漏给第三方
    h["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"; // 关掉用不上的能力
    h["Cross-Origin-Opener-Policy"] = "same-origin";
    h["Cross-Origin-Resource-Policy"] = "same-origin";
    if (ctx.Request.IsHttps)
        h["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";  // HSTS：只在 HTTPS 下加
    ctx.Response.Headers["Content-Security-Policy"] =
        "default-src 'self'; script-src 'self' 'nonce-{每请求随机}'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'";
    await next();
});
\`\`\`

CSP 的正确上法：**先 \`Content-Security-Policy-Report-Only\` 灰度**，收集 \`report-uri\` 上报的违规，确认没有误伤后再切到强制模式。直接上强制模式，最常见的结局是某个 CDN 上的脚本被拦掉、线上白屏。CSP 里 \`script-src\` 用 **nonce（每请求随机）** 或 hash，别用 \`'unsafe-inline'\`——那等于没上。

HSTS 的两个提醒：只在 HTTPS 响应里加（HTTP 响应里加会被忽略）；\`includeSubDomains\` 一旦发出去，撤销要等 \`max-age\` 过期，先小值试水（如 300 秒）再放大。另外，**\`Access-Control-Allow-Origin\` 动态回显 Origin 时必须同时发 \`Vary: Origin\`**，否则 CDN 会把给 A 站的响应缓存后发给 B 站。

### 七、上传的完整链路

上传不是"收到文件存起来"，它是一条有 6 个环节的流水线，每一环都能被单独绕过：

1. **限流与限额三件套**：单个文件大小、单次请求文件数、以及**速率**。只有大小限制的接口会被慢速连接拖死（慢速 POST / Slowloris）——用 \`IHttpMaxRequestBodySizeFeature\` 或反向代理层的 \`client_max_body_size\` + 速率限制。
2. **流式处理**：\`IFormFile\` 会先把整个文件读进内存/临时盘，大文件应该用 \`Request.Body\` 流式读并直接转发到对象存储，避免"内存随并发线性上涨"。
3. **魔数校验**：读文件头若干字节判断真实类型（PNG \`89 50 4E 47\`、JPEG \`FF D8 FF\`、PDF \`25 50 44 46\`），不信 \`Content-Type\`、不信文件名、不信客户端给的扩展名。
4. **文件名与路径**：\`Path.GetFileName()\` 去掉路径穿越（\`../../etc/passwd\`），拒绝 Windows 保留名（\`CON\`、\`NUL\`、\`AUX\`），生成随机存储 key，扩展名从**识别出的类型**推导。
5. **隔离与扫描**：文件先写到不可执行、不可直接访问的位置；病毒扫描在隔离环境异步跑，通过前对外不可见。图片类建议**重新编码**（消除隐藏在元数据/内嵌对象里的载荷）。
6. **读取与下载**：服务端渲染用户上传内容时，用 \`Content-Disposition: attachment\` + \`X-Content-Type-Options: nosniff\`；绝不存到 webroot 下可被当脚本执行的位置；下载走短寿命预签名 URL 或每次鉴权。

一句话总结：**上传的危险不在于"文件多大"，而在于"它会被谁以什么方式解释"**——同一个字节流，被当图片渲染和被当 HTML 执行，后果完全不同。

### 生产检查

- [ ] CORS 的 Origin 是明确列表，未出现 \`AllowAnyOrigin()\` + \`AllowCredentials()\`
- [ ] 动态回显 Origin 时同时发 \`Vary: Origin\`（防 CDN 缓存串站）
- [ ] Cookie 会话有 CSRF 防护（anti-forgery / double-submit / 自定义头），且非 GET 才改状态
- [ ] 安全头齐备：\`nosniff\`、\`X-Frame-Options\`/\`frame-ancestors\`、\`Referrer-Policy\`、\`Permissions-Policy\`、HSTS（仅 HTTPS）
- [ ] CSP 先 \`Report-Only\` 灰度，\`script-src\` 用 nonce/hash 而非 \`unsafe-inline\`
- [ ] 上传有大小、数量、速率三重限制；大文件流式处理不进内存
- [ ] 文件类型按魔数判定，文件名规范化（防穿越 + Windows 保留名），随机存储 key
- [ ] 上传文件不落在可执行目录；下载走短寿命预签名 URL 或每次鉴权
- [ ] 图片类重新编码；扫描通过前文件对外不可见

### 练习

1. 修改 demo 的 \`Detect\`：补上 JPEG（FF D8 FF）与 GIF（GIF87a/GIF89a）两组魔数分支；构造一个扩展名是 .png、内容却以 "hello" 开头的样本，确认它被识别为 application/octet-stream；再给 \`IsAllowedOrigin\` 传入 null（模拟无 Origin 头的同源请求），观察当前行为并决定该放行还是拒绝；最后把 \`SanitizeFileName\` 喂 \`"../../etc/passwd"\` 与 \`"CON.png"\`，验证路径穿越与 Windows 保留名被处理。
2. 独立实现 \`ValidateUpload(byte[] content, string fileName)\` 校验管道：魔数白名单（PNG/JPEG/GIF）加大小上限 5MB，加文件名规范化（\`Path.GetFileName\` 去掉 ../ 路径穿越、拒绝 Windows 保留名），返回 (ok, detectedType, reason) 三元组，并为每个失败原因写一个用例。
3. 生产场景：为带前端的 BFF 配置安全基线——CORS 用显式 Origin 列表加 \`AllowCredentials\`；写一个中间件统一加 CSP、\`X-Content-Type-Options: nosniff\`、\`Referrer-Policy\` 与 HSTS 四个响应头；上传保存为对象存储的随机 key（扩展名取自魔数而非用户输入），病毒扫描放隔离容器异步执行；用集成测试断言每个响应头存在且上传目录不可枚举。
`,
    code: `// ============================================================
// 第一百二十九章 CORS、CSRF、安全头与上传 —— 可运行演示（net8.0 / C# 12）
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

### 四、Keyed services：同一接口多个实现

.NET 8 之前，同一接口注册多个实现要么靠「具名 wrapper 类」，要么自己注入 \`IEnumerable<T>\` 再挑一个——都别扭。Keyed services 把它变成一等公民：

\`\`\`csharp-snippet
// 注册：三个生命周期都有对应 API
builder.Services.AddKeyedSingleton<ICache, RedisCache>("redis");
builder.Services.AddKeyedScoped<ICache, MemoryCache>("memory");
builder.Services.AddKeyedTransient<ICache, NoopCache>("noop");

// 消费方式一：构造注入（最常用，端点/minimal API 支持）
public sealed class OrderService([FromKeyedServices("redis")] ICache cache) { /* ... */ }

// 消费方式二：手动解析
var cache = provider.GetRequiredKeyedService<ICache>("redis");

// 消费方式三：枚举全部 key（做「按 key 路由」的工厂时很有用）
builder.Services.AddKeyedSingleton<ICache, RedisCache>(KeyedService.AnyKey);
\`\`\`

四条实践经验：

1. **key 用常量，不要散落字符串**。建议 \`public static class CacheKeys { public const string Redis = "redis"; }\`，拼错时编译不过，而不是运行时 \`InvalidOperationException\`。
2. **key 解析失败是抛异常**（\`GetRequiredKeyedService\`）或返回 null（\`GetKeyedService\`）。生产建议一律用 Required 版本——静默 null 会变成后面某处的 \`NullReferenceException\`，离现场太远。
3. **Keyed 不能替代策略模式**。如果你需要根据运行时值（租户、地区）选择实现，用工厂 + 字典更清晰；keyed 适合「编译期就确定的少数几种实现」。
4. **不要用 key 伪装多租户**。每个租户注册一个 keyed 实例，等于把租户数量绑死在容器上，租户一多就是内存和启动时间的灾难。

### 五、Options 的三个深坑

表格里的三个接口之外，还有几个反复出现的坑：

1. **绑定是懒执行的**：\`IOptions<T>.Value\` 第一次访问时才做绑定。配置写错（字符串转不了 int、必填项缺失）会在**第一次用到它的请求上**抛 \`InvalidOperationException\`——而不是启动时。所以 \`.ValidateOnStart()\`（或 \`IStartupValidator\`）不是可选项，它把"上线后某个冷门接口 500"变成"部署阶段直接失败回滚"。
2. **自定义校验用 \`IValidateOptions<T>\`**：DataAnnotations 只覆盖特性；跨字段规则（如 \`TimeoutSeconds < RetryCount * BackoffSeconds\`）要实现 \`IValidateOptions<T>\`，返回 \`ValidateOptionsResult.Fail("...")\`。校验失败信息要能直接指导运维："Payment:ApiKey 不能为空"，而不是 "Options validation failed"。
3. **热重载不是万能的**：\`IOptionsMonitor<T>\` 能拿到新值，但**已经在跑的后台服务不会自动重读**——它需要用 \`OnChange\` 回调主动响应；而且回调里做耗时操作会阻塞配置重载。另外，可变对象上的值被就地修改（不是替换）时，monitor 的快照语义会失效，Options 类请保持不可变（\`init\`/\`record\`）。

\`\`\`csharp-snippet
builder.Services
    .AddOptions<PaymentOptions>()
    .BindConfiguration("Payment")       // 绑定配置节
    .ValidateDataAnnotations()          // 特性级校验
    .Validate(o => o.TimeoutSeconds > 0 && o.TimeoutSeconds <= 30,
              "Payment:TimeoutSeconds 必须在 (0, 30] 秒")   // 跨字段/自定义规则
    .ValidateOnStart();                 // 启动即校验，坏配置不让上线

// 需要热更新的地方：OnChange 主动响应，回调里只做轻活
var monitor = provider.GetRequiredService<IOptionsMonitor<PaymentOptions>>();
monitor.OnChange(opts => logger.LogInformation("支付配置已更新: {Timeout}", opts.TimeoutSeconds));
\`\`\`

配置源的**优先级**也要心里有数：后注册的覆盖先注册的。典型顺序是 \`appsettings.json\` → \`appsettings.{Environment}.json\` → 环境变量 → 命令行 →（可选）密钥管理服务。**环境变量用双下划线表示层级**：\`Payment__ApiKey\`，容器里这是最常用的覆盖方式。

### 六、Host 生命周期与优雅停机

停机不是"进程退出"，而是一段有顺序的编排：

1. \`IHostApplicationLifetime.ApplicationStopping\` 触发 → **先把 readiness 置为失败**（让 K8s 把本副本摘出 Endpoints，新流量不再进来）。
2. 等待存量请求完成（\`ShutdownTimeout\`，默认 5 秒，K8s 侧 \`terminationGracePeriodSeconds\` 必须大于它，否则会被 SIGKILL）。
3. \`IHostedService.StopAsync\` 按**注册的反序**执行——先停消费者，再停生产者。
4. 最后释放 DI 容器与日志（flush）。

两个高频错误：**\`ShutdownTimeout\` 与 \`terminationGracePeriodSeconds\` 不匹配**（应用还在排空就被 KILL，表现为发布时零星 502）；**\`BackgroundService\` 忽略了 \`StoppingToken\`**（\`ExecuteAsync\` 里写了个不理取消的死循环，导致停机永远卡到超时）。

\`\`\`csharp-snippet
protected override async Task ExecuteAsync(CancellationToken stoppingToken)
{
    // 关键：循环条件与 await 都要接 stoppingToken，否则停机时卡满 ShutdownTimeout
    while (!stoppingToken.IsCancellationRequested)
    {
        try { await ProcessOneAsync(stoppingToken); }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { break; }
        catch (Exception ex) { _logger.LogError(ex, "处理失败，等待重试"); await Task.Delay(1000, stoppingToken); }
    }
}
\`\`\`

### 生产检查

- [ ] 开发环境开启 \`ValidateOnBuild\` + \`ValidateScopes\`，捕获依赖在启动阶段暴露
- [ ] 所有 Options 都 \`.ValidateOnStart()\`，坏配置阻止启动而非首请求 500
- [ ] 跨字段配置规则用 \`IValidateOptions<T>\`，失败信息指明具体配置键
- [ ] Keyed service 的 key 用常量；解析一律 \`GetRequiredKeyedService\`
- [ ] 配置文件分层清晰，敏感值走环境变量/密钥服务，未进仓库
- [ ] 后台服务的循环与 await 都接受 \`stoppingToken\`
- [ ] \`ShutdownTimeout\` < \`terminationGracePeriodSeconds\`，且停机先摘 readiness
- [ ] 启动期预热有超时，非关键依赖失败时降级而非卡住启动
- [ ] 有集成测试证明坏配置启动失败、优雅停机不丢在途请求

### 练习

1. 修改 demo 的 MiniHost：新增 \`AddTransient<T>\`（每次解析都新建实例），在同一个 scope 里 Get 两次，对比 Transient 与 Scoped、Singleton 三者的实例差异；再把 \`AppClock\` 从 AddSingleton 改为 AddScoped，观察两个 scope 各拿一份、同一 scope 内复用；最后运行第三部分，观察 keyed 解析按 key 取到不同实现、未知 key 抛出明确异常。
2. 独立实现 keyed 解析：给 MiniHost 加 \`AddKeyedSingleton<T>(string key)\` 与 \`Get<T>(string key)\`，注册 "redis" 与 "memory" 两个 \`ICache\` 实现，验证按 key 取到不同实例、未知 key 抛出清晰异常——模拟 .NET 8 keyed services 的语义。
3. 生产场景：把配置校验搬进 Options 管道——\`AddOptions<PaymentOptions>().BindConfiguration("Payment").ValidateDataAnnotations().ValidateOnStart()\`，写一个宿主集成测试证明坏配置（如 ApiKey 为空）在启动阶段直接失败，而不是首次请求才 500；再实现 \`IHostedLifecycleService\` 在 Started 阶段做连接池预热（带 30 秒超时），预热完成后才把 readiness 标记为健康。
`,
    code: `// ============================================================
// 第一百三十章 Generic Host、Keyed DI 与 Options —— 可运行演示（net8.0 / C# 12）
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

### 四、三层缓存怎么选

先把三层的职责分清，很多"缓存不生效"其实是放错了层：

| 层 | 缓存什么 | 生效位置 | 典型失效期 |
| --- | --- | --- | --- |
| **响应缓存/输出缓存** | 整个 HTTP 响应 | 中间件（服务端）/ 浏览器与 CDN（响应头） | 秒级～分钟级 |
| **进程内内存**（\`IMemoryCache\`） | 反序列化后的对象 | 单进程内 | 秒级，重启即丢 |
| **分布式**（Redis 等） | 序列化后的字节 | 跨实例共享 | 分钟～小时级 |

\`[ResponseCache]\`（HTTP 头，靠客户端/CDN 生效）与 OutputCache（服务端中间件，自己存响应）是两回事——前者只是"建议"，后者才真的替你挡住请求，别混为一谈。

三条硬规则：

1. **个性化响应绝不能进公共缓存**。输出缓存的 Vary 规则漏掉 \`Authorization\`/租户，结果就是用户 A 看到用户 B 的订单——这是缓存事故里最贵的一类。私有响应要么不缓存，要么用 \`VaryByValue\` 把租户/用户维度显式写进 key，要么只在进程内缓存且 key 带用户。
2. **别缓存的东西**：带 \`Set-Cookie\` 的响应、实时金额/库存、一次性令牌、以及"错误响应"（5xx 缓存下来会让故障持续时间远超实际）。
3. **命中率要有指标**。没有命中率监控的缓存等于没有缓存——你无法区分"它挡住了 90% 请求"和"它其实一直 miss 还额外付出序列化成本"。

### 五、HybridCache 的正确用法

\`HybridCache\`（.NET 9+）把 L1 + L2 + stampede 保护打包，但用错仍会踩坑：

\`\`\`csharp-snippet
// 注册：L1 内存 + L2 Redis
builder.Services.AddHybridCache()
    .AddStackExchangeRedisCache(o => o.Configuration = redisConn);

// 使用：GetOrCreateAsync 是主 API，同 key 并发只回源一次（stampede 保护）
var orders = await cache.GetOrCreateAsync(
    $"tenant:{tenantId}:orders:v{schemaVersion}",
    async ct => await db.Orders.AsNoTracking().Where(o => o.TenantId == tenantId).ToListAsync(ct),
    new HybridCacheEntryOptions
    {
        Expiration = TimeSpan.FromSeconds(60 + Random.Shared.Next(-6, 6)), // TTL + jitter
        LocalCacheExpiration = TimeSpan.FromSeconds(10),                   // L1 更短，降低跨实例不一致
    },
    tags: ["orders", $"tenant:{tenantId}"]);                               // 标签失效

// 失效：按 key 或按标签批量失效（比逐个 Remove 可靠）
await cache.RemoveAsync(key);
await cache.RemoveByTagAsync($"tenant:{tenantId}");
\`\`\`

要点：

- **L1 比 L2 短得多**（如 L1 10s、L2 60s）。L1 太长会让多实例之间的数据不一致窗口变得肉眼可见，用户刷新页面时看到新旧交替。
- **序列化要求**：L2 要序列化，类型必须是序列化器支持的（JSON 源生成/AOT 场景尤其注意），且**改了 DTO 结构要让旧缓存失效**——把 schema 版本写进 key 是最省事的做法。
- **结果可空与负缓存**：查不到时不要缓存 null（会把"暂时没有"固化）。要防穿透可以缓存一个短暂的**空标记**（如 30 秒），并明确它与"真数据"的区别。
- **回源失败不要污染缓存**：factory 抛异常时必须清理在途记录，否则后续请求会一直复用这个失败状态（demo 第三部分演示的正是这个缺陷）。

### 六、失效的三条可靠策略

依赖 \`Remove\` 成功是最脆的方案（删除失败 = 数据已改、缓存还是旧的，且没有补偿）。生产上按可靠性排序：

1. **短 TTL + 版本化 key（推荐）**：数据更新时递增 \`schemaVersion\`，旧 key 自然无人再读，连删除都不用做。代价是更新后最长有 TTL 窗口的陈旧数据——这通常是可接受的（明确写给产品："最长 60 秒"）。
2. **事件驱动失效**：数据变更后发领域事件/消息，消费者按 key 或标签删缓存。要处理消息丢失（兜底 TTL）与重复（幂等删除）。
3. **双删 + 延迟**：先删缓存 → 改数据库 → 延迟几百毫秒再删一次。用于缓解"改数据库过程中有并发读把旧值写回缓存"的竞态；它不完美，但简单有效。

另外，**TTL 一定要加 jitter**（±10%）。同一批 key 在同一秒集体过期，回源流量会打出一个尖峰；jitter 把尖峰摊平。以及：缓存的 key 必须含**租户、版本、授权维度**，宁可少命中也不要串数据。

### 生产检查

- [ ] 三层缓存职责清晰；私有/个性化响应不会进公共缓存（Vary 规则含租户与授权）
- [ ] 输出缓存未用于带 \`Set-Cookie\`、实时金额、一次性令牌的响应
- [ ] \`HybridCache\` 的 L1 短于 L2；\`schemaVersion\` 写进 key
- [ ] TTL 带 jitter；热点 key 有 stampede 保护（单飞）
- [ ] 回源失败不污染缓存：清理在途记录，可选短暂负缓存
- [ ] 失效策略不依赖单次 \`Remove\` 成功（版本化 key / 事件驱动 / 双删）
- [ ] 有命中率与回源次数的指标；缓存故障时有降级预算（回源 or 返回陈旧）
- [ ] 有测试覆盖：并发回源只执行一次、异常不被缓存、key 不含跨租户数据

### 练习

1. 修改 demo：把并发数从 50 提到 200，确认“回源数据库”仍然只打印一次；把 key 换成 "tenant:orders:cold" 再跑一轮，观察发生第二次回源；再注释掉第三部分里 factory 抛异常时的 \`_inflight.Remove(key)\` 清理，重跑观察后续请求全部卡住——体会为什么失败必须清理在途记录。
2. 独立实现带 TTL 的 StampedeCache：\`GetOrCreateAsync(key, ttl, factory)\` 记录写入时间，过期后下一次请求触发回源且同 key 仍然单飞；写测试覆盖三个场景——过期瞬间的 10 个并发请求只执行一次 factory、未过期命中不回源、不同 key 各自回源；同时修复“异常结果被缓存”的缺陷（失败要清理在途、可选缓存短暂负结果）。
3. 生产场景：为订单列表接口设计缓存方案——输出缓存层 \`VaryByQuery\` 加 \`VaryByAuthorization\` 防止跨用户串数据；HybridCache 的 key 设计为 \`tenant:{tenantId}:orders:v{schemaVersion}\`，TTL 60 秒加 ±10 秒 jitter 防同步过期；失效改为递增 schemaVersion 而不是依赖 Remove 成功；最后推演一遍：数据更新后旧缓存最长还能存活多久、回源风暴如何被单飞挡住。
`,
    code: `// ============================================================
// 第一百三十一章 输出缓存、HybridCache 与失效 —— 可运行演示（net8.0 / C# 12）
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

### 四、探针参数怎么算

探针配错的典型后果有两个方向，都比"不配探针"更糟：**配太敏感** → 下游抖一下，全部实例同时重启（连环车祸）；**配太迟钝** → 实例早已不健康却继续接流量，用户持续报错。

三个关键参数：

- \`periodSeconds\`：探针间隔（如 10s）。
- \`failureThreshold\`：连续失败几次才判定失败（如 3）。**判定耗时 = \`periodSeconds × failureThreshold\`**，健康检查自身的超时必须显著小于它，否则会出现"检查还没超时返回，K8s 已经算它失败"的错位。
- \`startupProbe.failureThreshold × periodSeconds\`：**必须大于最坏启动时长**（含 JIT 预热、缓存加载、迁移）。这是 startupProbe 存在的唯一理由——给慢启动一个合法窗口，别让 liveness 在启动期就把进程杀掉。

\`\`\`yaml
# 生产探针草案（数值是起点，不是真理，按实测调）
startupProbe:
  httpGet: { path: /healthz/startup, port: 8080 }
  periodSeconds: 5
  failureThreshold: 60          # 5s × 60 = 最长 300s 启动窗口
livenessProbe:
  httpGet: { path: /healthz/live, port: 8080 }   # 只查进程自身，不查依赖！
  periodSeconds: 10
  timeoutSeconds: 2
  failureThreshold: 3
readinessProbe:
  httpGet: { path: /healthz/ready, port: 8080 }  # 可含数据库等关键依赖
  periodSeconds: 5
  timeoutSeconds: 2
  failureThreshold: 2
\`\`\`

**liveness 里查下游依赖是头号反模式**。下游抖 3 秒 → 全部副本 liveness 失败 → 集体重启 → 重启期间流量全丢 → 存活的副本被流量打爆 → 更多 liveness 失败。正确的做法是：liveness 只回答"这个进程还活着吗"（进程在、没死锁），依赖问题交给 readiness 摘流量 + 告警。

### 五、依赖隔离：别让一个依赖拖垮全站

健康检查只是"报表"，真正的韧性来自依赖隔离（bulkhead）：

1. **分级**：关键依赖（数据库、支付网关）失败 → 整实例不接流量；非关键依赖（推荐、分析、邮件）失败 → 标记 \`Degraded\`，继续服务并告警。判据是"它挂了，我的核心流程还能不能完成"。
2. **超时与熔断分开设**：每个依赖有自己的超时（不能共用全局），并配熔断器（连续失败 N 次后快速失败一段时间，给下游喘息）。熔断器的**半开**状态要限制试探流量，否则恢复瞬间又被打垮。
3. **降级路径要真的能跑**：写了 \`try/catch\` 返回默认值，不等于降级可用——要有测试证明"缓存挂了接口仍返回 200"，否则降级代码路径第一次被执行往往是在线上故障时，而它可能是坏的。
4. **舱壁（资源隔离）**：给不同依赖用不同的 \`HttpClient\` 实例/连接池，避免一个慢依赖占满公共连接池，把其他依赖一起拖死——这是"明明只挂了一个服务，整站都慢"的常见成因。

### 六、健康端点的暴露与输出

- **不要暴露细节**：公网可访问的 \`/health\` 应该只返回 \`200 Healthy\`/\`503 Unhealthy\`。详细报告（哪个依赖、什么错误、耗时）放内网端点或需要鉴权——详细报告会泄漏内部拓扑、版本号、连接串片段。
- **状态码**：健康检查端点的 HTTP 状态码要真实反映状态（\`Healthy\` → 200，\`Degraded\` → 200，\`Unhealthy\` → 503）。返回 200 却在 body 里写 Unhealthy，LB 会照常发流量。
- **HealthCheckPublisher**：把检查结果定期推送到监控系统，这样"曾经不健康过 30 秒"这种瞬时抖动也会被记录，而不是只靠探针轮询碰运气。
- **缓存健康结果**：高频探针（每 5 秒 × 每副本）打到数据库上也是有成本的，可以给健康检查结果加一个很短的缓存（1～2 秒）。

### 生产检查

- [ ] liveness **不含**任何下游依赖检查（只回答"进程是否还活着"）
- [ ] readiness 含关键依赖，非关键依赖标记为 \`Degraded\` 而非 \`Unhealthy\`
- [ ] \`startupProbe\` 的 \`failureThreshold × periodSeconds\` 大于实测最坏启动时长
- [ ] 健康检查自身有超时（如 2s），且显著小于 \`periodSeconds × failureThreshold\`
- [ ] 多个检查并行执行并共享总预算，不是串行累加
- [ ] 健康端点 HTTP 状态码真实反映状态（Unhealthy → 503）
- [ ] 公网只暴露简化结果，详细报告限内网/鉴权
- [ ] 每个依赖有独立超时与熔断，降级路径有测试证明可用
- [ ] 慢依赖有连接池隔离，不会占满公共连接池
- [ ] 健康检查结果接入监控（Publisher），瞬时抖动可被追溯

### 练习

1. 修改 demo 的 \`AppHealth\`：新增 Redis 字段并作为关键依赖纳入 \`IsReady\`，运行三种组合观察：Redis 挂导致 not ready、Analytics 挂仍然 ready、StartupDone 为 false 时 live 与 ready 全 false；再观察第三部分三级汇总的输出——Analytics 挂时应为 Degraded 而非 Unhealthy；对照结果写一份依赖分级结论（哪些进 readiness、哪些降级放行）。
2. 独立实现 \`HealthCheckRunner\`：接收一组 (name, critical, check) 检查项，每项在 \`Task.Run\` 中执行并施加整体超时（超时即失败），返回 Healthy / Degraded / Unhealthy 三级——全部通过为 Healthy、仅非关键项失败为 Degraded、任一关键项失败为 Unhealthy；用一个故意 \`Task.Delay(Timeout.Infinite)\` 的检查项验证超时兜底生效。
3. 生产场景：写出 K8s 探针配置草案——livenessProbe 只探测进程自身（/healthz 固定返回 200，不含依赖检查）；readinessProbe 挂 /ready 并包含数据库；startupProbe 的 failureThreshold 乘 periodSeconds 大于最坏预热时长；附一份依赖分级表（数据库、Redis、邮件、分析服务各自进 liveness、readiness 还是都不进），并说明每条决策的依据。
`,
    code: `// ============================================================
// 第一百三十二章 健康检查、探针与依赖隔离 —— 可运行演示（net8.0 / C# 12）
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

### 六、ServiceDefaults：别让每个项目各写一遍

\`aspire init\` 生成的 \`ServiceDefaults\` 项目不是样板垃圾，它是**跨服务的横切配置单点**：OpenTelemetry（日志/指标/追踪）接线、健康检查端点、服务发现、HTTP 韧性（标准 \`AddStandardResilienceHandler\`）。所有服务只写一行 \`builder.AddServiceDefaults();\`。

它的价值在于：横切关注点只有一份定义，改采样率、改健康检查路径、加一个 exporter 都是一处改动。团队里最坏的情况是每个服务各写一份 OTel 配置，然后互相不一致——排查时 trace 断在中间，因为 A 服务用了不同的 propagator。

\`\`\`csharp-snippet
// ServiceDefaults/Extensions.cs（节选，理解它在做什么即可）
public static IHostApplicationBuilder AddServiceDefaults(this IHostApplicationBuilder builder)
{
    builder.ConfigureOpenTelemetry();          // logging + metrics + tracing，统一 OTLP 导出
    builder.AddDefaultHealthChecks();          // /health、/alive 端点
    builder.Services.AddServiceDiscovery();    // 让 https://api 这类逻辑名可解析
    builder.Services.ConfigureHttpClientDefaults(http =>
    {
        http.AddStandardResilienceHandler();   // 超时 + 重试 + 熔断 + 限流的默认组合
        http.AddServiceDiscovery();
    });
    return builder;
}
\`\`\`

注意 \`AddStandardResilienceHandler\` 给的是**通用默认值**（总超时约 30 秒、重试若干次）。它是起点不是终点——写操作（POST 下单）的默认重试可能不幂等，应按接口语义覆盖策略（第一百三十五章的 deadline 预算同理）。

### 七、Aspire 不是什么

把边界说清楚，能省掉团队几个月的争论：

| 它是 | 它不是 |
| --- | --- |
| **本地开发编排器**：一键拉起依赖与仪表盘 | 生产编排器（生产用 K8s/ACA/ECS + IaC） |
| **连接信息的注入方式**（资源名 → 连接串） | 服务网格 / 配置中心替代品 |
| **分布式应用的代码化拓扑描述** | 部署流水线（CI/CD 仍由 GitHub Actions/Azure DevOps 负责） |
| 提升本地与生产的一致性 | 消除环境差异（差异必须靠 IaC 与配置治理收敛） |

一个常见误解是"用了 Aspire 就能一键上云"。实际上 Aspire 的部署能力（\`aspire deploy\` / Aspirate 生成清单）适合**快速起步与小型系统**；中大型系统仍应把 IaC 作为唯一事实来源。折中做法是：用 Aspire 描述拓扑，生成 IaC 草稿，再由运维评审固化。

### 八、与测试的配合

编排能力对集成测试是巨大利惠：依赖用容器（Testcontainers）或 Aspire 编排拉起，测试跑完即销毁，不再依赖"某台机器上有个共享测试数据库"——那是测试不稳定的头号来源。

三条经验：

- **测试与本地开发共用同一套依赖描述**，能消除"本地能跑、CI 挂了"的大部分原因。
- **并行测试要隔离**：多组测试同时跑时，数据库要么每套测试独立库/schema，要么固定端口映射到不同宿主端口；共用同一个库和同一份种子数据，结果就是随机失败。
- **启动等待**：容器起来了 ≠ 能连。要么用 \`WaitFor\` + 应用侧重试，要么在测试里显式轮询健康端点（带超时），不要 \`Thread.Sleep(5000)\` 碰运气。

### 生产检查

- [ ] AppHost SDK 版本在 csproj 中钉住，升级走 PR 审查
- [ ] 所有服务调用 \`AddServiceDefaults()\`，横切配置只有一份
- [ ] 连接信息一律通过资源引用注入，代码里无写死的 \`localhost:5432\`/\`6379\`
- [ ] \`WaitFor\` 之外，应用自身仍有重试、超时与健康检查
- [ ] 写接口的 HTTP 韧性策略按幂等性单独覆盖，未盲目使用默认重试
- [ ] Dashboard 仅限本地；生产遥测走 OTLP 后端，采样率与基数有设计
- [ ] 应用脱离 AppHost、\`dotnet run\` + 环境变量也能在 CI 启动
- [ ] 停止编排后无孤儿容器；CI 与本地的依赖版本一致
- [ ] 集成测试用容器化的独立依赖，并行时不互相干扰

### 练习

1. 修改 demo：新增一个 staging 环境的 \`EnvironmentBindings\`（analytics 连接指向 staging 域名），三个环境循环打印 shop 连接串；再对不存在的 key 调用 \`Get\`，把 \`KeyNotFoundException\` 改为返回默认值的 \`TryGet\`，体会“缺配置显式失败还是静默默认”的取舍；最后给第三部分资源图加一条 worker WaitFor redis 的边，观察拓扑排序输出如何变化。
2. 独立实现 \`ResourceGraph\`：提供 \`AddProject\`、\`AddRedis\`、\`WithReference\`、\`WaitFor\` 方法描述资源与依赖关系，\`StartupOrder()\` 做拓扑排序输出启动顺序；构造 api WaitFor pg、pg 依赖 volume 的三层图，验证输出顺序正确，并让循环依赖的图抛出明确异常。
3. 生产场景：为团队编写 Aspire 验收清单并逐条给出验证命令——aspire init 后核对 AppHost csproj 的 SDK 版本被仓库钉住；数据库容器健康检查未通过时 API 不发出首个请求（WaitFor 加应用侧重试双保险）；全局搜索确认没有写死 6379/5432 端口；Ctrl+C 停止后确认 docker ps 无孤儿容器；把 API 项目单独 dotnet run，仅靠环境变量注入连接串也能在 CI 启动。
`,
    code: `// ============================================================
// 第一百三十三章 .NET Aspire 与本地开发编排 —— 可运行演示（net8.0 / C# 12）
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

### 五、租户上下文怎么传递

租户 ID 一旦进入应用，必须有一个**唯一权威来源**，而不是在每个方法里从 \`HttpContext\` 里捞。常见做法：

\`\`\`csharp-snippet
// 推荐：Scoped 的租户上下文（一次请求一份，DI 注入即可）
public sealed class TenantContext { public string TenantId { get; private set; } = ""; public bool IsElevated { get; private set; } }

// 中间件：只从这里解析租户，别的地方一律注入 ITenantContext
app.Use(async (ctx, next) =>
{
    var tenantId = ctx.User.FindFirstValue("tenant_id")      // 来自已验签的 token
                   ?? throw new UnauthorizedAccessException("token 缺少 tenant_id");
    ctx.RequestServices.GetRequiredService<TenantContext>().TenantId = tenantId;
    await next();
});

// EF Core 全局过滤器：让"忘记加条件"在默认情况下就不会发生
modelBuilder.Entity<Order>().HasQueryFilter(o => o.TenantId == _tenantContext.TenantId);
\`\`\`

三个坑：

1. **不要用 \`AsyncLocal\` 当唯一来源**。它在 \`async\` 流动中对"谁设置的"不设防，任何代码都能改；而 Scoped 服务配合 DI 至少能约束到请求边界。若确实用 \`AsyncLocal\`，必须只在中间件里 Set 一次。
2. **后台任务没有 HttpContext**。队列消费者、定时任务要显式携带 tenantId（消息里带），并在 \`CreateScope()\` 后手动填充上下文——否则全局过滤器会拿到空值，于是"什么也查不到"（还算安全的失败）或"查到全部"（如果过滤器写成了 \`== null || \`，那就是灾难）。
3. **\`HasQueryFilter\` 不是安全边界，是防呆**。它可以被 \`IgnoreQueryFilters()\` 绕过，也可能因为过滤器里引用了未初始化的上下文而失效。真正的边界是数据库 RLS。

### 六、RLS：把防线放到数据层

应用层总会漏，数据库层再挡一次。以 PostgreSQL 为例：

\`\`\`sql
-- 1. 开启行级安全
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- 2. 强制（表所有者也受约束，否则 owner 会绕过）
ALTER TABLE orders FORCE ROW LEVEL SECURITY;

-- 3. 策略：会话变量必须等于行的 tenant_id
CREATE POLICY tenant_isolation ON orders
    USING (tenant_id = current_setting('app.tenant_id', true))
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true));
\`\`\`

应用侧每个连接/事务开头设置一次：

\`\`\`csharp-snippet
await using var tx = await db.Database.BeginTransactionAsync(ct);
await db.Database.ExecuteSqlRawAsync($"SET LOCAL app.tenant_id = '{tenantId}'"); // tenantId 必须来自已验证来源
var orders = await db.Orders.ToListAsync(ct);   // 漏了 Where 也只看到本租户
\`\`\`

要点：\`SET LOCAL\`（事务内有效）比 \`SET\`（会话级）安全，连接池复用不会串；\`WITH CHECK\` 同时管住写入（防止把数据写成别人的租户）；迁移账户需要 \`BYPASSRLS\` 或被策略豁免，否则跑不动迁移。SQL Server 的对应能力是 Row-Level Security + \`SESSION_CONTEXT\`，思路相同。

### 七、跨租户操作与授权边界

真实系统里一定有跨租户场景：平台管理员、客服代查、数据导出、对账任务。正确做法不是"放开过滤器"，而是：

- **独立的权限提升路径**：显式授予（有时间窗、有审批记录），期间的操作**全程审计**（谁、为什么、看了哪个租户的什么）。
- **独立的查询入口**：不要在同一个 \`DbContext\` 上用开关切租户，容易忘记切回来。跨租户任务用独立的服务/连接，代码路径一眼可辨。
- **导出与分享**：导出文件按租户打包、加密、短寿命 URL；调试 dump 与日志查询默认只含请求者所属租户。

### 八、租户级配额与噪声邻居

多租户共享资源时，"一个大客户跑批处理把所有人拖慢"是必然事件，需要提前设计：

- 每租户限流（请求数、并发数、批量大小），超限返回 429 + \`Retry-After\`。
- 后台任务按租户配额调度，大租户的导出任务排队而不是并发冲刺。
- 指标标签里放 tenantId 要谨慎：**租户数上千时，标签基数会打爆时序库**。做法是对大租户单独打标，小租户聚合到 \`tenant_tier\` 或干脆只记内部诊断用的维度。

### 生产检查

- [ ] 租户 ID 只有一个权威来源（已验签的 token），不信客户端 header
- [ ] EF Core 全局过滤器兜底，且后台任务显式传递租户
- [ ] 数据库 RLS 已开启并 \`FORCE\`，\`WITH CHECK\` 覆盖写入
- [ ] 缓存 key、队列分区、搜索索引、对象存储前缀都含租户
- [ ] 跨租户操作走独立授权路径，全程审计、有时间窗
- [ ] 有"防线测试"：故意漏租户条件的查询会被应用层或 RLS 拦截
- [ ] 每租户限流与配额，防止噪声邻居
- [ ] 指标标签的租户基数受控（大租户单列，小租户聚合）
- [ ] 日志/导出/dump 默认按租户隔离，敏感字段脱敏

### 练习

1. 修改 demo：给 orders 数组加一条租户 "C" 的记录，当前租户 A 过滤后确认看不到它；把 headerTenant 改成与 tokenTenant 相同的 "A"，观察走进“租户一致”分支；再试试 headerTenant 传空串，决定应该拒绝还是回退到 token 中的租户；最后运行第三部分，观察裸 key 与租户前缀 key 的差异。
2. 独立实现租户守卫封装：写 \`TenantScope\`（持有当前 TenantId）与扩展方法 \`ApplyTenantFilter\`，所有查询必须经过它；再写断言方法 \`AssertSameTenant\`，任何结果混入其它租户数据就抛异常——把它放进单元测试基类，让“忘记加租户条件”的查询在 CI 直接失败。
3. 生产场景：设计缓存与日志两处的租户隔离——缓存层封装 \`TenantKey.Build("orders", id)\` 统一产出 \`tenant:{tenantId}:orders:{orderId}\` 前缀，禁止裸拼 key；日志结构化字段带 tenantId 但金额、邮箱脱敏；评估共享库 tenant_id 与数据库 RLS 组成双层防线，写一条回归测试：故意构造漏加租户过滤的查询，验证应用层守卫与 RLS 至少有一层拦截。
`,
    code: `// ============================================================
// 第一百三十四章 多租户、数据隔离与授权边界 —— 可运行演示（net8.0 / C# 12）
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

队列无界 = 内存定时炸弹。三条经验：

1. **默认就有界**：\`Channel.CreateBounded(capacity)\`，容量按"能承受的积压"而不是"内存能装多少"来定。满了要有明确策略：拒绝（返回 503 + \`Retry-After\`）、阻塞等待、或丢弃最旧——选哪个取决于业务（支付指令不能丢，指标采样可以丢）。
2. **信号量控制并发**：\`SemaphoreSlim\` 限制同时处理的数量，比"加大线程池"更可控。要设置等待超时，否则排队请求会无限堆积。
3. **拒绝要快、要早**：在入口就拒绝（限流中间件）比让请求进来再超时更省资源。已被拒绝的请求不应再占用下游连接。

\`\`\`csharp-snippet
var channel = Channel.CreateBounded<WorkItem>(new BoundedChannelOptions(1000)
{
    FullMode = BoundedChannelFullMode.Wait,   // 满了就等（也可选 DropOldest / DropWrite）
    SingleReader = false,
    SingleWriter = false,
});
// 生产者：写不进去时按策略处理，而不是无限 await
if (!channel.Writer.TryWrite(item))
{
    return Results.StatusCode(503);           // 明确背压：让上游重试或降级
}
\`\`\`

### 四、超时要分层

一个 HTTP 调用其实有三段超时，混为一谈就会出现"明明设了 5 秒，却卡了 40 秒"：

| 超时类型 | 管什么 | 典型值 |
| --- | --- | --- |
| 连接超时 | 建立 TCP/TLS 的时间 | 2～5s |
| 请求超时（每跳） | 单次请求等响应的时间 | 视接口而定 |
| 总体超时 / deadline | 整个业务操作（含重试）的预算 | 由 SLO 倒推 |

重试次数 × 单次超时 必须 ≤ 总体预算，否则重试会把预算撑爆——"重试 3 次、每次 30 秒"的接口，最坏要 90 秒才失败，而调用方 10 秒就放弃了。正确算法是**每跳拿剩余预算**：

\`\`\`csharp-snippet
var total = TimeSpan.FromSeconds(5);
var sw = Stopwatch.StartNew();
for (int attempt = 1; ; attempt++)
{
    var remaining = total - sw.Elapsed;
    if (remaining <= TimeSpan.Zero) throw new TimeoutException("预算耗尽");
    using var cts = CancellationTokenSource.CreateLinkedTokenSource(requestAborted);
    cts.CancelAfter(remaining);                 // 只用剩余时间，不再给满
    try { return await http.GetAsync(url, cts.Token); }
    catch (OperationCanceledException) when (!requestAborted.IsCancellationRequested && attempt < 3)
    { await Task.Delay(100 * attempt); }        // 退避，且退避时间也要算进预算
}
\`\`\`

### 五、取消的边界与代价

- **不可取消的操作**：数据库写入、已发出的支付指令、文件已写一半——取消只能停止"等待"，不能撤销"已发生"。所以取消路径要设计成"停止后续步骤 + 记录中断状态 + 由补偿/对账收拾残局"，而不是假装什么都没发生。
- **不要吞掉取消**：\`catch (Exception)\` 会把 \`OperationCanceledException\` 一起吞掉，于是客户端早已断开，服务端还在算完并写库——这就是"僵尸请求"。正确顺序是先 \`catch (OperationCanceledException) when (ct.IsCancellationRequested)\` 再 \`catch (Exception)\`。
- **取消不等于失败**：客户端取消（499）不该计入错误率，也不该触发告警；自己超时（504）才该计。混在一起会让 SLO 与告警长期失真。
- **资源清理**：取消发生在 \`await\` 之间时，\`finally\`/\`using\` 仍会执行——这是唯一能保证清理的地方，别把释放逻辑写在取消分支里。

### 生产检查

- [ ] \`CancellationToken\` 从入口一路传到 DB、HttpClient、队列
- [ ] 客户端取消（499）与自身超时（504）分开计数与告警
- [ ] 重试次数 × 单次超时 ≤ 总体 deadline；每跳只拿剩余预算
- [ ] 队列默认有界，满时有明确拒绝策略（503 + Retry-After）
- [ ] 信号量限制并发并设置等待超时
- [ ] 未吞掉 \`OperationCanceledException\`；取消后不在继续写业务数据
- [ ] 超时分三层配置（连接/每跳/总体），有集成测试验证
- [ ] 背压有可观测指标（队列长度、丢弃数、等待时长）

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
// 第一百三十五章 取消、超时、deadline 与背压 —— 可运行演示（net8.0 / C# 12）
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

### 四、审计事件的模型与存储

一条有用的审计记录要能回答「谁、何时、对什么、做了什么、为什么、改成了什么」：

\`\`\`csharp-snippet
public sealed record AuditEvent(
    string ActorId,          // 操作人（含系统/服务身份）
    string ActorTenantId,    // 租户，跨租户操作必须记录
    DateTimeOffset At,       // UTC 时间
    string Action,           // order.refund / user.role_changed，稳定枚举式
    string ResourceType,     // order
    string ResourceId,
    string? BeforeHash,      // 变更前快照哈希（不存明文，省空间也降风险）
    string? AfterHash,
    string? Reason,          // 敏感操作的理由（如客服代查工单号）
    string CorrelationId);   // 串联 trace / 请求
\`\`\`

存储上的四条硬要求：

1. **只追加（append-only）**：审计表不允许 \`UPDATE\`/\`DELETE\`，权限上也要单独授予——应用账号有写权限即可，读权限归审计/安全角色。
2. **与业务同事务或可靠 Outbox**：审计写不进去 = 这次变更不能被承认。要么回滚业务，要么走 Outbox 保证最终写入（第一百〇一章同款思路）。**"审计挂了业务照常改"是合规上的硬伤**。
3. **不可篡改的兜底**：高合规场景把审计事件哈希后链式串联（每条含上一条哈希），或定期把哈希锚定到只写存储（WORM）/外部时间戳服务。
4. **保留期分层**：审计通常比业务日志保留更久（1～7 年，看法规），且删除只能按保留策略整体过期，不能被单条抹掉——"能删审计"等于"能毁证据"。

### 五、日志脱敏的实现位置

脱敏最可靠的落点是**日志管线本身**，而不是"每个开发记得别打密码"。三条路线按可靠性排序：

1. **集中式 redaction（推荐）**：自定义 \`ILoggerProvider\` / 序列化钩子，在写入前统一扫字段名与正则（卡号 Luhn、身份证、JWT 形状、邮箱）。漏网只发生在一处，修一次全站生效。
2. **类型级控制**：给敏感类型重写 \`ToString()\`（如 \`Sensitive<T>\` 包装器只输出 \`[REDACTED]\`），并用 \`ILogger\` 的源生成的 \`[LogProperties]\` 控制哪些属性进日志。
3. **约定 + 评审（最弱）**：文档写"不要打 password"。它必然在某个加班的深夜失效。

三个容易漏的出口：**异常消息与堆栈**（\`HttpRequestException: ...?token=xxx\` 会进日志）、**HTTP 访问日志**（URL 查询串里可能有令牌）、**第三方 SDK 的日志**（ORM 打印 SQL 时会把参数值打出来——生产必须关掉 \`EnableSensitiveDataLogging\`）。

另外，**日志注入（log forging）** 也要防：用户输入的换行符能伪造出一条假的日志行。结构化日志（属性化）天然免疫；拼接字符串时要把 \`\r\n\` 转义。

### 六、合规：能删、能导出、能证明

- **删除权（被遗忘权）**：业务数据可删，审计记录通常豁免（合规要求保留），但要能证明"该用户的个人数据已从业务库中删除"。设计上把 PII 集中在少数表/列，删除才可行——PII 散落在 30 张表里时，删除请求会变成不可能完成的任务。
- **保留与过期**：按数据类型设定保留期（如业务日志 90 天、审计 1 年），过期删除任务要产出**可导出的执行记录**（删了哪些、多少条、什么时间），而不是"我们相信定时任务跑了"。
- **跨境与驻留**：多区域部署时，日志与备份的存放位置也是合规事项（数据不能出境）。这会影响日志聚合架构——是集中到一个区域，还是每区域独立留存。
- **访问审计**：谁能看审计日志本身，也要有记录和最小权限。审计系统被攻破等于攻击者知道你在查什么。

### 生产检查

- [ ] 数据分级落在代码里的分类器，而非仅文档约定
- [ ] 严格机密字段（密码、证件、卡号）不进日志、指标标签、trace attribute
- [ ] 脱敏在日志管线集中处理，覆盖异常消息、访问日志、ORM 参数日志
- [ ] 审计事件包含操作人、时间、资源、动作、前后快照、租户、关联 ID
- [ ] 审计与业务同事务或走可靠 Outbox；审计失败不让业务静默成功
- [ ] 审计存储只追加、权限独立，有防篡改设计
- [ ] 保留期按数据分级配置，删除任务产出可导出的证明
- [ ] 高基数字段（userId、email）不进 metrics label
- [ ] 日志结构化（模板 + 属性），用户输入已防日志注入
- [ ] PII 集中在少数表/列，删除权可实际执行

### 练习

1. 修改 demo 的 \`redact\` 数组：加入 "idCard" 与 "bankCard"，并给样本补一条含 18 位身份证号与长度恰好 4 的短 token 的事件；观察 \`Mask\` 对短值走 "****" 分支、长值保留首尾两字符的规则边界——长度 5 与 4 的值分别输出什么；再观察第三部分分级渲染：password 与 email 的输出有何不同。
2. 独立实现分级日志器：\`SensitivityClassifier\` 按字段名把数据分为公开、内部、机密、严格机密四级，\`Render\` 时机密字段走 Mask 脱敏、严格机密（password、idCard、bankCard）直接替换为 "[REDACTED]"；输出用模板加属性的形式（如 \`order {orderId} paid\`），保证结构化字段可被日志系统索引。
3. 生产场景：为订单模块实现审计事件——审计表记录操作人、时间、资源 id、动作与变更前后的快照哈希；审计写入失败时业务写操作回滚或落入可靠 Outbox，禁止“审计挂了业务照常改”；保留期限按法规设为 180 天，到期删除任务要产出可导出的删除证明；写一个集成测试：让审计存储故意不可用，验证下单接口返回 503 而不是静默成功。
`,
    code: `// ============================================================
// 第一百三十六章 审计、数据分级与合规日志 —— 可运行演示（net8.0 / C# 12）
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
