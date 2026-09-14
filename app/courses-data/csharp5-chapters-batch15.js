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

生产开发不是只写 \`.cs\` 文件。你还必须理解 SDK、项目文件、依赖锁定、构建配置和可重复构建。本章把「能在本机 \`dotnet run\`」提升到「别人检出仓库后得到同一份制品」。

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

- \`.slnx\` / \`.sln\` 组织多个项目；项目引用表达编译依赖，不要靠复制 DLL 传递内部模块。
- 领域层不应引用 Web、数据库等基础设施层；依赖只能朝内指向 Domain。
- 应用项目引用基础设施实现；测试项目引用被测程序集，不要反向引用测试工具到生产代码。

### 二、Directory.Build.props 与 .editorconfig

两者都「管仓库」，但层次不同，不要互相替代：

| 文件 | 管什么 | 典型内容 |
| --- | --- | --- |
| \`Directory.Build.props\` | MSBuild 属性，编译器/SDK 行为 | \`Nullable\`、\`TreatWarningsAsErrors\`、\`AnalysisLevel\`、\`LangVersion\`、\`ImplicitUsings\` |
| \`Directory.Build.targets\` | 项目评估之后的目标与覆盖 | 统一 \`Pack\`、生成 SBOM、注入 Source Revision |
| \`Directory.Packages.props\` | Central Package Management 版本 | \`<PackageVersion Include="..." Version="..." />\` |
| \`.editorconfig\` | 编码风格与分析器严重级别 | indent、\`csharp_style_*\`、\`dotnet_diagnostic.CA1062.severity\` |

\`.editorconfig\` 影响 IDE 和 \`dotnet format\`，不改变 TargetFramework；\`Directory.Build.props\` 改变编译结果。风格规则放 editorconfig，构建契约放 props。子目录可以再放一份 props 覆盖，但覆盖链要短，避免「每个项目一套 Nullable」。

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

\`TreatWarningsAsErrors\` 适合团队项目，但分析器升级可能突然增加警告；应固定 SDK 和包版本，并在升级 PR 中集中处理。

### 三、固定 SDK 与 Debug / Release

提交 \`global.json\`，避免开发机和 CI 使用不同编译器：

\`\`\`json
{
  "sdk": {
    "version": "10.0.100",
    "rollForward": "latestPatch"
  }
}
\`\`\`

版本号应换成团队验证过的最新补丁，不要长期停留在首个补丁。\`rollForward: latestPatch\` 允许补安全补丁，禁止默默跳到下一 feature band。

| 配置 | 优化 | 常量 | 用途 |
| --- | --- | --- | --- |
| Debug | 关 | \`DEBUG\` | 本机调试、热重载、较慢但信息全 |
| Release | 开 | 通常无 \`DEBUG\` | 性能测试与生产制品 |

不要把 Debug 构建推到生产：未优化、断言可能启用、体积与 JIT 行为都不同。本地复现生产问题至少用 \`-c Release\`。需要「带符号的 Release」时用独立符号包（snupkg），而不是改回 Debug。

### 四、多目标框架（multi-tfm）

库可以 \`<TargetFrameworks>net8.0;net10.0</TargetFrameworks>\` 同时面向多个 TFM；应用通常只目标当前受支持版本。多目标时用预处理器隔离 API：

\`\`\`csharp
public static bool SupportsNewLock
{
    get
    {
#if NET9_0_OR_GREATER
        return true;
#else
        return false;
#endif
    }
}
\`\`\`

- 每个 TFM 单独编译，CI 必须测全部目标，不能只测开发机上的那个。
- 公共 API 以最低 TFM 能表达的契约为准。应用项目不要无谓 multi-tfm，那会把发布矩阵炸开。

### 五、InternalsVisibleTo

内部实现用 \`internal\` 保护，测试或指定友元程序集再看见：

\`\`\`xml
<ItemGroup>
  <InternalsVisibleTo Include="Shop.Tests" />
  <InternalsVisibleTo Include="Shop.ArchitectureTests" />
</ItemGroup>
\`\`\`

- 强签名程序集的 InternalsVisibleTo 必须带公钥，否则运行时仍看不到。
- 不要把 InternalsVisibleTo 送给插件或客户自定义程序集，那等于公开内部契约。
- 友元是测试逃逸舱，不是分层失败后的补丁；生产模块之间仍应走公开接口。

### 六、NuGet 源、锁定与审计

- 应用项目提交 \`packages.lock.json\`，CI 使用 \`dotnet restore --locked-mode\`。锁文件漂移必须走 PR，不能在 CI 里「顺手升级」。
- 包源写入 \`NuGet.config\`；先 \`<clear />\` 再显式添加，避免开发机全局源污染还原。
- 内部包启用 Package Source Mapping：\`Shop.*\` 只从内源还原，防止同名包劫持。
- 不要在项目文件、源码或 NuGet 配置中提交令牌；凭据放用户级 nuget.config、环境变量或 CI OIDC。
- \`NuGetAudit\` 在还原时扫描已知漏洞；建议 \`NuGetAuditMode=all\` 覆盖传递依赖，\`NuGetAuditLevel\` 与门禁一致。
- CI 再跑 \`dotnet list package --vulnerable --include-transitive\`，把结果当成缺陷而不是日志装饰。
- 谨慎使用浮动版本（\`1.2.*\`）；生产构建必须可重现。

\`\`\`xml
<packageSources>
  <clear />
  <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
  <add key="contoso" value="https://pkgs.example.com/nuget/v3/index.json" />
</packageSources>
\`\`\`

还原只认配置里的源。需要临时加源用 \`dotnet restore --source\`，不要在构建脚本里静默改全局 nuget.config。

### 七、确定性构建与 Source Link

可重复构建要求：**同一提交 + 同一 SDK + 同一锁文件 = 同一编译输出**（允许忽略签名时间戳等受控差异）。

- SDK 默认 \`Deterministic=true\`。本地与 CI 路径不同会嵌入不同 PDB 路径，因此 CI 打开 \`ContinuousIntegrationBuild=true\`，把源路径规范到 \`/_/\`。
- Source Link 把 PDB 指回 Git 提交，生产转储才能「点进当时的源码」。常见属性：\`PublishRepositoryUrl\`、\`EmbedUntrackedSources\`、\`IncludeSymbols\` + \`SymbolPackageFormat=snupkg\`。
- 私有仓库要保证调试器能按 Source Link URL 取到源（PAT 或符号服务器），否则只有行号没有文件。
- 版本写入 \`InformationalVersion\`（可含 commit SHA），与 Git 标签、制品名对齐。

### 八、打包库与 PackageValidation

\`\`\`bash
dotnet pack src/Shop.Domain -c Release
\`\`\`

- \`<IsPackable>true</IsPackable>\` 只给真正发布的库；应用项目保持 \`false\`，避免误打包入口程序集。
- 写清 \`PackageId\`、\`Version\`、\`Authors\`、\`PackageLicenseExpression\`、\`PackageReadmeFile\`；打开 \`GenerateDocumentationFile\`，缺 XML 注释会在 pack 时变成警告或错误。
- \`EnablePackageValidation=true\` 并指定 \`PackageValidationBaselineVersion\`（或 baseline nupkg）：删除/改变已发布的公开 API 会在 pack 失败。这是库的「契约测试」。
- 符号包与主包一起推送；不要只推 nupkg 却丢掉 snupkg。

### 九、RID 目录与 SDK workload

RID（Runtime Identifier）描述「OS + 架构 + 工具链」，例如 \`win-x64\`、\`linux-x64\`、\`linux-musl-x64\`（Alpine）、\`osx-arm64\`、\`linux-arm64\`。完整目录见官方 RID catalog，不要自造 \`linux-amd64\` 这种近似名。

- 应用通常用可移植 TFM 发布，到容器里再靠基础镜像的运行时。
- \`RuntimeIdentifier\` / \`-r\` 用于自包含、Native AOT、需要原生依赖的发布。
- \`RuntimeIdentifiers\`（复数）告诉还原预拉哪些 RID 的原生包；漏写会在发布机上才失败。
- workload（\`dotnet workload restore\` / \`install\`）安装 SDK 扩展，例如 MAUI、WASI / WebAssembly 工具。仓库应提交 workload 配置或在文档写明版本，真正使用 workload 的 CI 才需要先 restore 再 build。
- **Aspire 9+ 不是 workload**：现代项目使用 Aspire CLI、版本化的 \`Aspire.AppHost.Sdk\` 与 NuGet 集成包；只有从 Aspire 8 升级时才处理旧 \`aspire\` workload。

### 十、常用命令

\`\`\`bash
dotnet restore --locked-mode
dotnet build --no-restore -c Release
dotnet test --no-build -c Release
dotnet publish src/Shop.Api -c Release -o artifacts/publish
dotnet format --verify-no-changes
dotnet pack src/Shop.Domain -c Release
dotnet list package --vulnerable --include-transitive
dotnet workload restore # 仅当仓库声明了 MAUI / WASM 等 workload
\`\`\`

### 常见陷阱

1. 本机全局 NuGet 源能还原、CI 不能：缺少仓库级 \`NuGet.config\` 或没 \`<clear />\`。
2. 锁文件只在开发机更新：CI 开了 \`--locked-mode\` 却没人认领漂移 PR。
3. 把 \`LangVersion=preview\` 写进 Directory.Build.props：SDK 一升级语法就变。
4. 库 multi-tfm 但测试只跑一个 TFM：条件编译分支等于没测。
5. Dockerfile 或 CI 用 \`latest\` SDK 镜像：与 \`global.json\` 不一致，确定性直接破产。

### 生产检查

1. SDK（\`global.json\`）、依赖锁和构建命令是否固定？
2. Release 构建是否把警告当错误？分析器升级是否走独立 PR？
3. CI 是否从干净环境 restore/build/test/publish，并且 \`--locked-mode\`？
4. 内部包是否做了源映射？审计是否包含传递依赖？
5. 可打包库是否打开 PackageValidation，并与上一稳定版本比 API？
6. CI 是否启用确定性构建与 Source Link，PDB 能否对上 commit？
7. 需要原生 RID 或 workload 的项目，还原矩阵是否写进仓库？
`,
    code: `// 读取运行时与构建信息：生产排障时先确认「跑的是哪一份制品」。
// 把 Version / InformationalVersion 与 CI 的 commit 对齐，比只看机器名有用。
using System.Reflection;
using System.Runtime.InteropServices;

Console.WriteLine($"Framework: {RuntimeInformation.FrameworkDescription}");
Console.WriteLine($"OS: {RuntimeInformation.OSDescription}");
Console.WriteLine($"Architecture: {RuntimeInformation.ProcessArchitecture}");

var assembly = Assembly.GetExecutingAssembly().GetName();
Console.WriteLine($"Assembly: {assembly.Name}");
Console.WriteLine($"Version: {assembly.Version}");

// DEBUG 常量只在 Debug 配置出现；不要用它判断「是不是生产环境」。
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

本书前面的交互示例采用 C# 12 兼容子集；生产新项目建议使用 .NET 10 LTS 默认的 C# 14。不要为了「新」而改写稳定代码，但应认识新语法并在能提升清晰度时使用。语言版本跟着 SDK 走，而不是跟着博客标题走。

### 一、从 C# 12 出发：已经够用的部分

C# 12 已经带来主构造函数、集合表达式、默认 Lambda 参数、\`ref readonly\` 参数和内插字符串改进。迁移到 13/14 时，**先保持这些习惯**，再按需启用新形态：

- 集合表达式 \`[1, 2, 3]\` 继续用；C# 13 只是让它在更多自然索引场景里更顺。
- \`record\` / 模式匹配 / 可空注解的纪律不变。新语法不会替你补领域边界。
- 主构造函数捕获的字段仍要小心：不要把本该是实现细节的依赖暴露成可赋值状态。

### 二、C# 13：params 集合、Lock、\`\\e\`

\`params\` 不再只吃数组，可以接收 \`Span<T>\`、\`ReadOnlySpan<T>\` 以及实现了合适模式的集合（params collections）：

\`\`\`csharp-snippet
// C# 13
static int Sum(params ReadOnlySpan<int> values)
{
    var total = 0;
    foreach (var value in values) total += value;
    return total;
}

Sum(1, 2, 3);          // 不必先 new int[]
Sum([10, 20, 30]);     // 集合表达式也可
\`\`\`

好处是热路径少一次数组分配。代价是**重载决议会变**：新增 \`params ReadOnlySpan<T>\` 可能抢走原来 \`params T[]\` 的调用。库作者升级时必须跑现有测试和 API 基线，而不是假设「只是多一个重载」。

\`System.Threading.Lock\`（.NET 9+ / C# 13）让 \`lock\` 语句绑定到专用类型，而不是任意 \`object\`：

\`\`\`csharp-snippet
// C# 13 / .NET 9+
private readonly Lock _gate = new();

public void Increment()
{
    lock (_gate)
    {
        _count++;
    }
}
\`\`\`

编译器会走 \`Lock.EnterScope()\`，语义比锁 boxed 对象更明确。陷阱：不要把 \`Lock\` 当普通对象再 \`lock ((object)_gate)\`，也不要把它暴露到公共 API 让外部参与同步。旧代码的 \`private readonly object _gate = new();\` 仍然正确，没有性能事故就不必为了「新」而改。

C# 13 新增转义 \`\\e\`（ESC，U+001B），等价于 \`\\u001b\`，写终端控制序列时少一层魔法数字。只在真正输出 ANSI 序列时用；日志和协议字段里塞 ESC 会让下游崩溃。

其他 C# 13 要点：

- 对象初始化器里可以用隐式 \`^\` 索引（从末尾写集合）。
- 部分场景允许 \`ref\` / \`unsafe\` 出现在迭代器、异步方法中，但**引用仍不能跨越 \`await\` / \`yield\`**。
- 允许更多 \`ref struct\` 参与接口实现（以编译器限制为前提）。
- C# 13 已支持 partial 属性与索引器，为源生成器铺路。

### 三、C# 14：field、扩展成员、空条件赋值

\`\`\`csharp-snippet
// C# 14：field-backed property，不必手写 backing field
public string Name
{
    get;
    set => field = string.IsNullOrWhiteSpace(value)
        ? throw new ArgumentException("Name is required")
        : value.Trim();
}

// C# 14：null-conditional assignment
customer?.LastSeenAt = DateTimeOffset.UtcNow;

// C# 14：extension members
static class IntStats
{
    extension(IEnumerable<int> source)
    {
        public int Median() => source.Order().ElementAt(source.Count() / 2);
    }
}
\`\`\`

\`field\` 关键字表示编译器生成的后备字段。若类型里已经有名为 \`field\` 的成员，会发生歧义，需要 \`@field\` 或改名。不要把复杂业务规则全塞进 \`set\`；校验失败仍应能被 API 层翻译成 400，而不是只抛 \`ArgumentException\`。

空条件赋值 \`x?.P = v\` 只在左操作数非 null 时写入。它**不是**线程安全发布，也不能代替锁。对字段与属性都可以，但对「先读后写」的复合操作（\`x?.Count++\` 这类）仍然不是原子的。

扩展成员把「扩展方法」升级成扩展块：可以写实例型扩展、以后也可以表达更接近内置成员的形状。可读性提升明显，但发现规则仍受命名空间与 \`using\` 影响。公共库若同时提供旧扩展方法和新扩展成员，要避免同一调用变成歧义。

C# 14 还支持：

- 更多 partial 成员：\`partial\` 构造函数、\`partial\` 事件，方便源生成器把「用户声明」和「生成实现」拼在同一类型上。
- \`nameof(List<>)\` 这类未绑定泛型名称。
- 简单 Lambda 参数可以使用 \`ref\` / \`in\` / \`out\` 修饰符。
- 更自然的 \`Span<T>\` / \`ReadOnlySpan<T>\` 隐式转换。

\`\`\`csharp-snippet
// C# 14：partial 构造函数 / 事件（与源生成器配合）
public partial class Order
{
    public partial Order(string id);
    public partial event EventHandler? Changed;
}
\`\`\`

用户侧写声明，生成器写实现。手写两边却忘记生成步骤，会变成难读的编译错误，而不是运行时「事件没人订」。

### 四、什么时候不要升级 LangVersion

- **库的消费者还在旧 SDK 上编译源码包 / 共享项目**：你用了 C# 14 语法，他们用 C# 12 编译器会直接红。
- **多目标时最低 TFM 对应的编译器解析不了该语法**：即便高 TFM 能跑，源码仍是一份。
- **分析器、源生成器、代码生成模板尚未支持**：CI 的 \`dotnet format\` 或 StyleCop 可能误报或误改。
- **生产环境禁止 \`LangVersion=preview\`**：预览语法没有 LTS 承诺，补丁级 SDK 都可能改语义。
- **团队没有统一 \`global.json\`**：一个人用 .NET 10 写 \`field\`，另一个人用 .NET 8 SDK 打开仓库，只会制造噪音。
- **唯一动机是「看起来新」**：新语法零收益时，diff 本身就是成本。

正确做法：应用项目可以跟随当前 LTS 默认语言版本；**公共库按消费者范围选择**，并在文档写明「源码需要 C# 14」或继续提供 C# 12 可编译的 API 表面。

### 五、从 C# 12 迁移的注意点

1. 打开 SDK / \`LangVersion\` 后先全量编译，不要边改语法边改行为。
2. 新增 \`params ReadOnlySpan<T>\` 前，用测试钉住现有重载被谁选中；必要时保留数组重载并标 \`[Obsolete]\`。
3. 引入 \`Lock\` 时按类型逐个替换 \`object\` 门闩，并确认没有 \`Monitor.Enter(gate)\` 混用。
4. 启用 \`field\` 前全局搜标识符 \`field\`，避免与局部变量、参数撞名。
5. 扩展成员放到清晰的命名空间，旧扩展方法进入弃用窗口，而不是同一天删掉。
6. 可空分析与警告等级不要同时大改；语言升级 PR 应独立于「把警告当错误」PR。
7. 新语法不自动等于更高性能。\`params Span<T>\` 可能少分配，但先看基准，再看调用点是否真在热路径。

### 六、兼容写法（本章 demo）

下面 demo 使用 C# 12 也能运行，展示同样的设计目标：输入验证、不可变数据、模式匹配和集合表达式。把「现代语法」理解成**表达力**，而不是版本号竞赛。

### 常见陷阱

- 在 net8.0 交互环境里粘贴 C# 14 的 \`field\` / \`extension\` 块会编译失败——正文已标注版本，demo 保持 C# 12。
- \`lock (new Lock())\` 每次新建一把锁，等于没锁。
- \`\\e\` 写进日志模板会被某些收集器截断或当控制字符处理。
- 空条件赋值让「没赋值」和「对象是 null」在调试器里看起来一样，关键路径请显式分支。

### 生产检查

1. 仓库是否用 \`global.json\` 固定能编译所选语言版本的 SDK？
2. 是否存在长期 \`LangVersion=preview\`？
3. 公共库的语言版本是否低于或等于文档承诺的消费者工具链？
4. C# 13 params 集合是否引起过载决议变化？API 基线测了吗？
5. 新语法的引入是否单独 PR，并能用基准或可读性说明理由？
`,
    code: `// net8.0 / C# 12 兼容 demo；正文另列 C# 13/14 专属语法。
// 这里用集合表达式、record 和属性模式表达「先校验形状，再聚合」——
// 升级语言版本时不必先改这类代码。
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

生产代码的核心不是套用「几层架构」，而是控制依赖方向、保护业务不变量，并让变化局限在边界。架构图如果不能回答「需求变更时改哪几个文件、测试谁来兜」，它就只是装饰。

### 一、模块与分层不是同一件事

**分层（layer）**按技术职责切开：Domain / Application / Infrastructure / Host。**模块（module）**按业务能力切开：Ordering、Billing、Catalog、Identity。两者正交：

\`\`\`
Api / Worker  ──> Application ──> Domain
Infrastructure ─> Application / Domain abstractions
\`\`\`

- **Domain**：实体、值对象、领域规则，不依赖数据库或 HTTP。
- **Application**：用例、事务边界、端口接口。
- **Infrastructure**：EF Core、消息系统、外部 API 实现。
- **Host**：ASP.NET Core / Worker，负责组装 DI、配置和生命周期。

小项目不必强拆四个程序集；但业务规则与 IO 边界仍应分开。更常见的失败是：按层拆了四个项目，却在每个层里继续摊成「一个巨大的 God Service」——那只是把文件夹改名叫层。

按模块拆时，每个模块可以内部再分 layer。Ordering 的 Domain 不要引用 Billing 的表结构；需要钱的信息时走明确的应用服务或反腐层，而不是 \`using Shop.Billing.Entities\`。

### 二、限界上下文与防腐层

限界上下文（bounded context）来自 DDD：同一个词在不同上下文含义不同。「订单」在下单上下文是可修改的购物意图，在结算上下文是不可变的会计事实。硬把一张 \`Orders\` 表和一套实体打天下，最后一定出现 \`if (isInvoice) ...\`。

上下文之间用**防腐层（Anti-Corruption Layer, ACL）**翻译模型：

- 入站：把外部 DTO / 第三方 SDK 类型立刻映到自己的值对象。
- 出站：自己的领域事件再映成对方的协议，而不是把实体序列化出去。
- ACL 可以是一组 Adapter + 映射函数，不必再造一个框架。

没有 ACL 的集成，外部字段改名就会直接打进你的领域核心——这就是**泄漏的抽象（leaky abstraction）**：你以为依赖的是「支付端口」，实际依赖的是渠道的错误码、幂等头和沙箱字段。

### 三、模块化单体 vs 微服务

| 维度 | 模块化单体 | 微服务 |
| --- | --- | --- |
| 部署 | 一份进程/一份制品 | 多进程、多仓库或多流水线 |
| 数据 | 可先共享库，逐步拆库 | 每服务私有库，靠事件集成 |
| 事务 | 本地事务足够多数用例 | 必须 saga / 补偿 |
| 适合 | 团队 < 2～3 个，领域仍在学 | 团队独立发布、负载形状差极大 |
| 代价 | 模块纪律靠约定和测试 | 分布式失败模式成为日常 |

默认选**模块化单体**：程序集或目录按上下文切开，禁止跨模块引用具体基础设施，用架构测试（NetArchTest 等）守住引用方向。只有当「独立扩展 / 独立发布 / 独立故障域」的收益大于分布式成本时才拆进程。先拆服务再补边界，会得到分布式单体——每次下单仍要同步打五个 HTTP，还没有了本地事务。

### 四、组合根与依赖方向

**组合根（composition root）**是唯一知道「用哪一个实现」的地方：ASP.NET Core 的 \`Program.cs\` / 启动配置。领域与应用层只依赖接口。测试可以换另一套组合根（内存仓储、假时钟）。

DIP 说的是策略依赖抽象，不是「每个类都配一个接口」。接口要有第二个实现或明确的测试替身才配；过早 \`IOrderService\` 只是换了个文件名。

### 五、SOLID 的实际含义

- SRP：一个模块只有一种变化原因，不是「一个类只能有一个方法」。
- OCP：用稳定抽象隔离变化，不为假想需求制造接口。
- LSP：替换实现后仍遵守语义、异常和前置条件。把「不支持的操作」改成空方法是 LSP 违规。
- ISP：消费者只依赖所需能力。\`IRepository<T>\` 上同时挂 \`Add\`+\`Sql\`+\`Bulk\` 会逼所有实现撒谎。
- DIP：策略依赖抽象，组合根选择实现。

SOLID 是设计启发式，不是打分表。能用更少的类型说清不变量时，少写类型。

### 六、值对象保护不变量

金额、邮箱、订单号不应在系统中永远以裸 \`string\` / \`decimal\` 传播。值对象把验证、相等性和格式化放在一个位置。邮箱在入库前就规范化（trim + lower），比较才不会出现「看起来一样其实两条」。

### 七、Result vs 异常：决策表

| 情况 | 用 Result / 错误码 | 用异常 |
| --- | --- | --- |
| 用户输错、库存不足、余额不够 | 是，这是业务预期 | 否，不要靠 catch 做分支 |
| 编程错误（空引用、不变量已破） | 否 | 是，尽快失败 |
| 基础设施意外（DB 断、磁盘满） | 边界转 Problem Details | 内部抛，记录后转换 |
| 库的公共 API 被误用 | 看调用方能否恢复 | 参数错误常用异常 |
| 高性能内部循环 | 避免异常控制流 | 热路径禁止 throw |

原则：

- 预期业务失败：返回显式 Result / 错误码。
- 编程错误或基础设施意外：抛异常，在边界统一转换和记录。
- 不要用异常做正常分支，也不要捕获后静默吞掉。
- 不要在应用服务里同时抛 \`OrderException\` 又返回 \`Result\`，调用方会精神分裂。
- HTTP 边界把 Result 映到 4xx，把未处理异常映到 5xx + Problem Details，不要把堆栈给匿名客户端。

### 八、CRUD 何时已经足够

Repository、CQRS、Mediator、DDD 都是工具，不是生产级认证。下列情况直接用清晰的应用服务 + DbContext 即可：

- 资源生命周期就是表的增删改查，没有跨实体不变量。
- 没有第二条写模型，读模型也不需要独立缩放。
- 团队三人以下，领域语言还在变。
- 「领域事件」其实只是想打一条日志。

当出现以下信号再升级模型：同一字段被三个用例按不同规则改；开始出现分布式副作用（邮件、扣款、库存）；或者表结构已经无法用一句话解释业务。在那之前，过度设计的 MediatR 管道只会把 15 行更新拆成 8 个文件。

泄漏抽象的典型样子：Controller 返回 \`Entity\`、Application 方法吃 \`HttpContext\`、Domain 里出现 \`DbSet\`。每出现一次，边界就薄一寸。

### 常见陷阱

- 按文件夹复制了 Clean Architecture 模板，却在 Domain 里引用 EF Core 特性。
- 微服务拆分按「一张表一个服务」，而不是按变更频率和发布独立性。
- ACL 写成「把 JSON 原样存进领域事件」，外部一改字段全线重放失败。
- 组合根泄漏：\`IServiceProvider\` 被传到 Domain 当服务定位器。

### 九、架构测试守门，比文档更硬

约定写在 README 里一周就会被人「先这样吧」绕过。用测试把依赖方向钉死：

\`\`\`csharp
var result = Types.InAssembly(typeof(Order).Assembly)
    .ShouldNot()
    .HaveDependencyOn("Shop.Infrastructure")
    .GetResult();
\`\`\`

再加几条：Api 不得引用其它模块的 Infrastructure；只有 Host 可以引用所有实现。失败的架构测试必须红，不能当 warning。新同事加项目引用时会立刻被抓住，这比任何培训都有效。

模块边界的第二个守卫是**公共 API 面要小**。\`internal\` 是默认，需要跨模块再用 \`public\`。觉得「先 public 以后再收」的类型，六个月后就是别人的依赖。值对象、领域事件的字段一旦发布，就是契约。

### 十、何时拆模块、何时拆进程

拆模块的信号：两个团队每周互相踩迁移；一个上下文的发布总被另一个的编译错误挡住；你已经能画出稳定的上下文图。拆进程的信号更苛刻：独立扩展曲线、独立故障、合规数据隔离、或组织上必须独立发布。没有这些，模块化单体加上架构测试通常更便宜。

CRUD 够用时不要假装事件驱动。一条 \`UPDATE\` 能维护的不变量，不必拆成三个 Topic。等真正出现「写路径和读路径的缩放差一个数量级」或「第二个模型要用另一套存储」，再引入读模型。提前 CQRS 的成本是双写和最终一致，收益却还没出现。

### 生产检查

1. 依赖方向是否朝内？架构测试有没有挡住反向引用？
2. 每个限界上下文的核心术语是否只在一处定义？
3. 外部系统是否经过 ACL，而不是 SDK 类型满天飞？
4. 业务失败与系统失败是否用了不同通道（Result vs 异常）？
5. 组合根是否只在 Host / 测试主机出现？
6. 当前复杂度是否真的需要 CQRS / 多服务，还是 CRUD + 模块边界就够？
7. 跨模块类型是否尽量 \`internal\`，公开面是否当契约管理？
`,
    code: `// 值对象把「非法邮箱」挡在边界：应用层拿到的是 Result，而不是半规范化的 string。
// 这是正文 Result vs 异常表的最小实现——预期失败走 Result，不抛。
var result = EmailAddress.Create(" User@Example.COM ");
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

能返回 JSON 只是起点。生产 API 还要有稳定契约、验证、错误格式、并发语义、限流和兼容策略。先决定「这是资源 API 还是过程 API」，再谈框架特性。

### 一、REST vs RPC

| | REST 风格资源 API | RPC 风格过程 API |
| --- | --- | --- |
| 路径 | \`/orders/{id}\` 名词 | \`/createOrder\` 动词 |
| 语义 | 方法表达动作，资源有统一生命周期 | 每个端点一个过程 |
| 缓存 | GET 可缓存、可条件请求 | 多数不可缓存 |
| 适合 | 可被多种客户端浏览的业务资源 | 内部命令、工作流、非资源操作 |
| 风险 | 为了「纯 REST」把动作扭曲成假资源 | 路径爆炸、版本只能整端点替换 |

生产里两者经常共存：对订单用资源动词，对「试算运费」「预览发票」用明确命令。不要在同一组路径上混用「看起来像 REST、语义却是 RPC」——那会让缓存中间层和客户端重试策略一起误判。

### 二、宿主基础配置（.NET 10）

\`\`\`csharp
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

### 三、状态码（先达成团队公约）

| 状态码 | 何时用 | 不要用来 |
| --- | --- | --- |
| 200 | 成功返回表示 | 创建成功却不给 Location |
| 201 | 创建成功 + \`Location\` | 重复提交已存在资源（可 200/409，需约定） |
| 202 | 已接受、异步处理 | 其实已经同步做完 |
| 204 | 成功无正文 | 客户端还指望错误细节 |
| 400 | 语法/校验失败 | 未认证（那是 401） |
| 401 | 未认证或令牌无效 | 已认证但没权限（那是 403） |
| 403 | 已认证、无授权 | 资源不存在时故意统一 404（防枚举要写进安全方案） |
| 404 | 资源不存在 | 整站路由配错 |
| 409 | 业务冲突（状态不允许） | 单纯校验失败 |
| 412 | 前置条件失败（If-Match） | 普通乐观锁想偷懒 |
| 415 | 媒体类型不支持 | 字段校验失败 |
| 422 | 语义校验失败（可选） | 与 400 双标准却不文档化 |
| 429 | 限流 | 应用自己的业务拒绝 |
| 500 | 未处理异常 | 把可预期业务错误装成 500 |

创建返回 201 + Location；异步长任务可返回 202。分页设置上限，优先 cursor/keyset pagination 处理大数据。

### 四、验证：DataAnnotations vs FluentValidation

| | DataAnnotations | FluentValidation |
| --- | --- | --- |
| 位置 | 属性上 | 独立 Validator 类 |
| 优点 | 零依赖、Minimal API / 控制器都能扫 | 条件规则、跨字段、异步查重清晰 |
| 缺点 | 复杂规则会污染 DTO | 要注册、要记得接到管道 |
| 适合 | 必填、长度、范围 | 「结束时间 > 开始时间」、按租户查唯一 |

输入在边界验证；业务不变量仍由领域层保护。注解只能挡住「明显坏输入」，挡不住「库存够不够」。两种都可以产出同一套 Problem Details 字段错误表，不要一边返回字符串、一边返回字典。

### 五、过滤器与端点过滤器

MVC 用 \`IAsyncActionFilter\` / 资源过滤器；Minimal API 用 \`IEndpointFilter\` 或 \`AddEndpointFilter\`。跨切面（关联 ID、幂等键校验、小流量特性开关）放过滤器，业务规则不要放进去。

\`\`\`csharp
app.MapPost("/orders", CreateOrder)
   .AddEndpointFilter(async (context, next) =>
   {
       if (!context.HttpContext.Request.Headers.ContainsKey("Idempotency-Key"))
           return Results.Problem(title: "Idempotency-Key required", statusCode: 400);
       return await next(context);
   });
\`\`\`

过滤器能读参数、替换结果，但不要在这里再解析一遍 JSON——那是重复消耗请求体。

### 六、Problem Details 扩展

返回 RFC 9457 Problem Details，并使用稳定的业务错误码。扩展字段放在约定成员里，而不是另发明一种 envelope：

\`\`\`json
{
  "type": "https://errors.example.com/validation",
  "title": "Validation failed",
  "status": 400,
  "code": "validation_error",
  "traceId": "00-ab...-01",
  "errors": { "amount": ["Amount must be positive"] }
}
\`\`\`

\`AddProblemDetails\` 可在 \`CustomizeProblemDetails\` 里注入 \`traceId\`、租户、实例 URL。业务码 \`code\` 必须稳定，文案可以翻译。不要把异常消息、SQL 或内部路径写进 \`detail\`。

### 七、内容协商与 HATEOAS

内容协商：客户端 \`Accept\` 决定 JSON / 特定版本媒体类型（如 \`application/vnd.shop.order+json;v=2\`）。默认 JSON 即可；XML 只在有真实消费者时开。输出格式器要限制，防止冷门 formatter 成为攻击面。\`Accept\` 不支持时返回 406，而不是悄悄给另一种。

HATEOAS（响应里带 \`links\`）能降低客户端硬编码路径，但对大多数内部 API **可选**。若做，链接要稳定、要测，不要把半残的 \`_links\` 当成版本策略。公开平台 API 才更值得投入。

### 八、限流头与幂等存储

限流除了返回 429，还应给出客户端能算的头（按你们网关约定）：

| 头 | 含义 |
| --- | --- |
| \`Retry-After\` | 多久后再试（秒或 HTTP 日期） |
| \`RateLimit-Limit\` | 窗口配额 |
| \`RateLimit-Remaining\` | 剩余 |
| \`RateLimit-Reset\` | 重置时间 |

按租户/用户分区，IP 只作辅助。网关与应用不要各限一次却用不同键，导致配额「看起来是 2 倍或一半」。

幂等键草图：

\`\`\`
收到 POST + Idempotency-Key
  → 查存储 (key, 哈希(请求体), 用户)
  → 命中且请求体相同：返回第一次的状态码与正文
  → 命中但请求体不同：409
  → 未命中：处理，把响应写入存储（带 TTL），再返回
\`\`\`

存储可以是 Redis 或数据库唯一索引。TTL 要覆盖客户端重试窗口（常见 24h），并记录指纹防止「换金额复用同一 key」。不要在服务器重试非幂等请求，除非协议能去重。PUT 通常应幂等；支付、下单等 POST 必须带键。

更新支持 ETag / If-Match 或版本字段，冲突返回 409/412。

### 九、取消、超时与版本演进

Minimal API 可直接注入 \`CancellationToken\`，它会关联客户端断开。把它传到 EF Core、HttpClient 和其他异步 API，但应用级关键提交要明确事务语义，不能机械地层层取消——用户一刷新就回滚扣款是事故。

优先做向后兼容的加法：新增可选字段、容忍未知字段。删除/改名/改变含义属于破坏性变更，应通过版本端点或协商策略迁移，并公布弃用期限。DTO 与数据库实体分离，避免 over-posting 和意外泄露字段。

### 常见陷阱

- 用 200 装所有失败，客户端无法做重试/告警分流。
- 验证通过后直接 \`SaveChanges\`，领域不变量只写在注释里。
- 幂等存储只记 key 不记请求指纹，被拿去改金额重放。
- OpenAPI 文档与真实状态码表长期漂移。

### 生产检查

1. 每个写端点是否约定了成功/校验/冲突/限流的状态码？
2. 错误是否统一 Problem Details，并带稳定 \`code\` 与 \`traceId\`？
3. 需要重试的 POST 是否强制 Idempotency-Key 且存储带指纹与 TTL？
4. 过滤器是否只做跨切，不藏业务流程？
5. 分页是否有上限？内容协商失败是否 406？
6. 契约变更是否有弃用窗口，而不是周五直接删字段？
`,
    code: `// 用纯 C# 模拟边界验证和统一 Problem Details。
// 真实 ASP.NET 里用 AddProblemDetails + 验证过滤器；结构应对齐 RFC 9457。
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

安全不是最后加一个 JWT 中间件。它贯穿身份、权限、输入、密钥、依赖、日志和部署。先威胁建模，再选协议。

### 一、先做威胁建模（简版）

对每个入口问四件事：**资产**（订单、PII、密钥）、**入口**（浏览器、移动端、回调、管理后台）、**攻击者**（匿名、邻租户、内部人员）、**后果**（数据泄露、资金损失、横向移动）。把答案映射到控件，而不是映射到「再加一个中间件」。

STRIDE 速记：假冒（认证）、篡改（完整性/HMAC）、抵赖（审计）、信息泄露（最小字段/脱敏）、拒绝服务（限流/大小限制）、提权（授权）。不必写厚报告，但每个新端点应能说出「最怕谁、怎么防」。

### 二、认证与授权要分开

- **认证**回答「你是谁」；**授权**回答「你能做什么」。
- 优先采用 OpenID Connect / OAuth 2.0 的成熟身份提供商。
- API 验证访问令牌的签名、issuer、audience、有效期和算法。
- 不要自己实现密码哈希、令牌协议或加密格式。
- 授权使用 policy/claim/resource-based authorization，不在控制器散落角色字符串。

### 三、OIDC 浏览器登录（授权码 + PKCE）文本流程

\`\`\`
[浏览器]                          [你的 BFF / Web]
    |  GET /login                      |
    |--------------------------------->|
    |  302 → IdP /authorize            |
    |  + client_id + redirect_uri      |
    |  + scope + state + code_challenge|
    |<---------------------------------|
    |                                  |
    |  用户在 IdP 登录 / 同意           |
    |                                  |
    |  302 → redirect_uri?code&state   |
    |--------------------------------->|
    |                    校验 state    |
    |                    POST /token   |
    |                    code+verifier |
    |                    (服务端，不经过 JS)
    |                    拿回 access/id/refresh
    |                    建立自己的会话 Cookie
    |  302 → 应用页                    |
    |<---------------------------------|
\`\`\`

要点：\`state\` 防 CSRF；PKCE 防授权码被截获后重放；\`redirect_uri\` **精确匹配**预注册值；令牌交换发生在服务器。SPA 若直接拿令牌，XSS 一次就能把刷新令牌偷走——这是 BFF 模式存在的原因。

机器对机器用 client credentials；浏览器用户用授权码。不要用隐式流，不要把 refresh token 交给不可信前端。

### 四、Cookie 会话 vs Bearer JWT

| | Cookie（服务端会话 / BFF） | Bearer 访问令牌 |
| --- | --- | --- |
| 典型调用方 | 浏览器同源应用 | 移动端、服务间、SPA+BFF 的下游 |
| 存储 | HttpOnly Cookie | 内存 / 安全存储，避免 localStorage |
| CSRF | 必须防 | 头携带，一般无 CSRF，仍要防 XSS |
| 撤销 | 会话一删即失效 | 短 TTL + 刷新轮换，或内省 |
| 跨域 | SameSite、CORS 要一起设计 | CORS 仍约束浏览器 |

- Cookie 设置 \`Secure\`、\`HttpOnly\`、合适的 \`SameSite\`；跨站场景需要 CSRF 令牌或双重提交 Cookie。
- 把高价值浏览器会话放进 \`localStorage\` 等于把令牌交给任何 XSS。
- JWT 通常只是签名不是加密；不要塞密码、证件号。关闭 issuer/audience/过期验证、接受客户端指定算法，都属于致命配置。
- 访问令牌要短；刷新令牌轮换并检测重用。

### 五、XSS、CSRF、SSRF、开放重定向

- **XSS**：输出按上下文编码；Razor 默认编码不要关。禁止把用户输入当 HTML 拼进页面。CSP（\`Content-Security-Policy\`）是纵深防御，不是借口「我们可信任 innerHTML」。API 只吐 JSON 仍可能在别人的页面被利用，CORS 必须白名单。
- **CSRF**：Cookie 认证的状态改变请求必须有反伪令牌或 \`SameSite=strict/lax\` + 自定义头。纯 Bearer API 无 Cookie 时 CSRF 面小，但「Cookie + Bearer 混用」会把面再打开。
- **SSRF**：服务端按用户给的 URL 去抓取（预览、Webhook 测试、导入）时，必须限制协议、禁内网网段、禁重定向到 metadata（\`169.254.169.254\`）、设超时与大小上限。
- **开放重定向**：\`returnUrl\` / \`redirect\` 只允许相对路径或白名单域名。登录完成跳到 \`https://evil.example\` 是经典钓鱼。
- 数据库参数化；禁止拼接 SQL/HTML/shell。限制请求体、上传类型和解压大小，防止资源耗尽与 Zip Bomb。

### 六、安全响应头

| 头 | 作用 |
| --- | --- |
| \`Strict-Transport-Security\` | 强制后续 HTTPS |
| \`Content-Security-Policy\` | 限制脚本/资源来源 |
| \`X-Content-Type-Options: nosniff\` | 禁止 MIME 嗅探 |
| \`Referrer-Policy\` | 控制外链带出路径 |
| \`Permissions-Policy\` | 关摄像头等浏览器能力 |
| \`X-Frame-Options\` / CSP \`frame-ancestors\` | 防点击劫持 |
| \`Cache-Control\`（含隐私页） | 防共享缓存存会话页 |

反向代理终止 TLS 时，正确配置 Forwarded Headers 和**可信代理列表**；否则应用以为自己是 HTTP，Cookie \`Secure\` 和重定向会错。全程 HTTPS，不要在应用里再发明一套「内网可以明文」。

### 七、密钥轮换与数据保护

- 开发使用 User Secrets；生产使用云密钥库或编排平台 Secret。
- 密钥不得写入仓库、镜像层、日志和异常详情。
- 设计轮换：应用应能同时接受新旧密钥的短暂重叠，再丢掉旧密钥。JWT 签名、Cookie 认证、数据保护密钥环都适用「双钥窗口」。
- ASP.NET Core Data Protection 用于 Cookie、反伪令牌、保护的 payload。多实例必须共享密钥环（Blob + 加密证书或 KMS），否则用户每次打到另一台就掉线。密钥环本身也要轮换，并备份到可恢复位置。
- CORS 是浏览器读取策略，不是认证或防火墙；只允许明确来源。

### 八、密码与日志

必须使用 ASP.NET Core Identity 或成熟库提供的自适应密码哈希（如 PBKDF2/Argon2id），每个密码独立盐值，并支持成本升级。普通 SHA-256 即使加盐也不适合存密码。

日志脱敏：令牌、Cookie、密码、连接串、银行卡、身份证一律不落明文。定期扫描传递依赖、容器镜像和泄露凭据。

### 常见陷阱

- 「内部 API 不鉴权，前面有网关」——网关一配错就变成公网。
- 用角色字符串 \`"Admin"\` 散落 40 个地方，改名即漏网。
- 调试时关掉 HTTPS 或 token 验证，并被提交进仓库。
- 把 IdP 的 \`sub\` 当显示名，把邮箱当主键还允许用户改邮箱。

### 生产检查

1. 是否有一页威胁模型，覆盖 XSS/CSRF/SSRF/开放重定向？
2. 浏览器流量是否走 BFF + Cookie，而不是把 refresh token 交给 JS？
3. 令牌校验是否包含 issuer、audience、lifetime、算法白名单？
4. 授权是否资源级、服务端强制、带租户隔离？
5. Data Protection 密钥环是否外置且可轮换？密钥是否有重叠窗口？
6. 安全头、HSTS、可信代理是否在预发环境用浏览器和 curl 对过？
7. 日志与异常是否脱敏？密钥扫描是否进 CI？
`,
    code: `// 资源级授权：权限声明 + 租户匹配。角色字符串散落控制器是常见越权源。
// 真实项目把这段放进 IAuthorizationHandler，并覆盖「邻租户」测试。
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

EF Core 章节讲了 CRUD；生产环境还必须处理 DbContext 生命周期、查询形状、迁移、并发和跨系统一致性。ORM 不会替你设计事务边界，它只是把边界执行得更方便——或更隐蔽。

### 一、DbContext 生命周期

- Web 请求通常每请求一个 scoped DbContext。
- DbContext **不是线程安全的**，不要并行使用同一实例。
- 不要把实体或 \`IQueryable\` 缓存在请求之外；查询树会捕获上下文。
- 后台并行任务使用 \`IDbContextFactory<T>\` 为每个单元创建上下文。
- 长时间流式读取时注意上下文膨胀：身份跟踪集合会一直长，只读路径用 \`AsNoTracking\`。

### 二、查询设计、拆分查询与影子属性

- 投影为 DTO，只取需要的列。
- 只读查询用 \`AsNoTracking\`；身份合并需要时用 \`AsNoTrackingWithIdentityResolution\`。
- 避免循环中查询导致 N+1；检查生成 SQL 和执行计划。
- 大结果集用 keyset pagination；不要无上限 \`ToListAsync()\`。
- \`Include\` 不是越多越好。多集合导航一次 \`Include\` 会变成笛卡尔积，内存和网络一起炸。

**拆分查询（split query）**：把一条宽 JOIN 拆成多条 SQL，再在内存拼图。

\`\`\`csharp
var order = await db.Orders
    .AsSplitQuery()
    .Include(o => o.Lines)
    .Include(o => o.Payments)
    .FirstAsync(o => o.Id == id, ct);
\`\`\`

适用：多个集合导航。代价：多一次往返、非事务性读可能看到中间态。全局 \`UseQuerySplittingBehavior(SplitQuery)\` 要谨慎，单集合小图用单查询往往更快。投影 DTO 通常比两种 Include 都好。

**影子属性（shadow property）**：列在数据库里，不在实体 CLR 属性上，例如 \`UpdatedAt\`、\`TenantId\`。用 \`EF.Property<Guid>(e, "TenantId")\` 过滤，或在 \`SaveChanges\` 拦截器里写。适合不想污染领域模型的基础设施列。陷阱：LINQ 里忘了过滤影子租户列，等于绕过隔离。全局查询过滤器常建在影子属性上，但过滤器在忽略时（\`IgnoreQueryFilters\`）必须有明确授权。

### 三、值转换、拥有类型与编译查询

**值转换（Value Converter）**把值对象或枚举映到列：

\`\`\`csharp
builder.Property(o => o.Amount)
    .HasConversion(v => v.ToMinorUnits(), v => Money.FromMinorUnits(v));
\`\`\`

转换必须双向稳定、无文化依赖。不要在 converter 里读时间或配置，那会让同一输入写出不同列值。枚举存字符串还是 int 要写进兼容策略。

**拥有类型（owned type）**：地址、金额等值对象嵌在拥有者表（或 owned 表）里，没有独立主键身份。适合「离开拥有者不存在」的值。不要把 Customer 标成 Order 的 owned——你会失去独立查询和生命周期。拥有集合在 EF 里能力有限，复杂子项仍用真正实体。

**编译查询**用于极热路径、形状固定的查询，减少每次的表达式树编译：

\`\`\`csharp
private static readonly Func<ShopDb, Guid, Order?> LoadOrder =
    EF.CompileQuery((ShopDb db, Guid id) =>
        db.Orders.AsNoTracking().FirstOrDefault(o => o.Id == id));
\`\`\`

异步用 \`EF.CompileAsyncQuery\`。只编译稳定查询；带动态 \`Where\` 拼装的不要硬编。先用日志确认这是 CPU 热点，再上编译查询——过早编译会降低可读性。

### 四、拦截器、重试与连接弹性

拦截器（\`ISaveChangesInterceptor\` / \`IDbCommandInterceptor\`）适合：写审计影子列、慢 SQL 日志、禁止生产里某些语句、补充租户列。不要在拦截器里再开另一个 DbContext 写业务，递归 \`SaveChanges\` 是事故。

连接弹性与执行策略：

\`\`\`csharp
options.UseSqlServer(conn, sql =>
{
    sql.EnableRetryOnFailure(maxRetryCount: 5, maxRetryDelay: TimeSpan.FromSeconds(8), errorNumbersToAdd: null);
});
\`\`\`

\`EnableRetryOnFailure\` 注册 \`OnExecutionStrategy\` / \`SqlServerRetryingExecutionStrategy\`：对暂时性错误（死锁、连接被重置）重试整段**可重放操作**。注意：

- 策略默认重试的是单个命令；跨多条命令必须 \`strategy.ExecuteAsync(async () => { /* 完整事务 */ })\`，否则只重试了后半段。
- 不要盲目重试整个业务事务：重试必须重新执行完整事务并保证副作用安全（不能已经发了邮件又重扣一次）。
- \`SaveChanges\` 自身具有事务性；只有跨多个 SaveChanges 或混合操作时才显式事务。
- 乐观并发令牌冲突时捕获 \`DbUpdateConcurrencyException\`，重新读取并决定合并、重试或返回冲突。执行策略**不会**把并发冲突当暂时性错误，这是对的。

### 五、原生 SQL 与注入

\`\`\`csharp
// 参数化：安全
await db.Orders.FromSqlInterpolated($"SELECT * FROM Orders WHERE Id = {id}").ToListAsync(ct);

// 字符串拼接：注入
var sql = "SELECT * FROM Orders WHERE Code = '" + userInput + "'";
\`\`\`

\`FromSqlRaw\` 必须配合参数占位符，不能把用户输入插进字符串。\`FromSqlInterpolated\` 的插值会被变成参数，**前提是整句都在插值字符串里**；先拼 \`string\` 再传入就回到注入。存储过程、\`ExecuteSql\` 同样规则。永远不要用拼接做动态排序字段：列名用白名单映射。

### 六、迁移、冲突与发布

- 生产迁移由发布流水线生成并审阅 SQL 脚本，不建议每个应用实例启动时并发迁移——多副本会抢 \`__EFMigrationsHistory\`。
- 采用 expand/contract：先加兼容结构，再部署双读/双写或回填，最后删除旧结构。
- 大表变更要评估锁、日志量和回滚时间；有的索引创建要 \`ONLINE\` 或在维护窗口。
- **迁移冲突**：两人同时从同一模型快照各加一条迁移，合并后迁移树分叉。中止合并，用版本控制删除自己尚未发布的生成迁移并恢复旧快照（保留实体改动），先合入对方分支，再重新 \`dotnet ef migrations add\`。不要在无效序列已经合并后运行 \`migrations remove\`，也不要手工拼两个快照。已进入共享环境的迁移不得删除，只能追加修正迁移。发布前还要在干净库从零升级，并从上一生产版本执行一次增量升级。
- 不要手工改已发布的迁移文件还沿用原名；已经上生产的迁移是历史，只能再加新迁移。

### 七、Outbox

数据库提交和消息发布不能用普通 try/catch 实现原子性。把业务变更和 outbox 事件写入同一数据库事务，后台发布并记录完成；消费者仍要按消息 ID 去重，因为交付通常是「至少一次」。这是下一章分布式里「双写问题」的标准解法。

### 常见陷阱

- \`AsSplitQuery\` 全局打开后，简单列表页变成 6 条 SQL，延迟上升却没人看日志。
- 值转换里用 \`DateTime.Now\`，同一值对象每次 Save 都变。
- 编译查询闭包捕获了 scoped 服务，等于编译了一个会过期的委托。
- 原始 SQL 单元测试用 InMemory 通过，生产 SQL Server 语法炸——原生 SQL 必须打真实库。

### 生产检查

1. DbContext 是否按请求/作业作用域创建，且无跨线程共用？
2. 热查询是否投影 DTO？多集合 Include 是否评估过拆分查询？
3. 暂时性故障是否用执行策略包住**整段事务**？并发冲突是否单独处理？
4. 原生 SQL 是否全部参数化？动态排序是否白名单？
5. 迁移是否在流水线审 SQL、无启动时多实例抢迁、有冲突合并约定？
6. 跨系统副作用是否走 Outbox，而不是 SaveChanges 后裸发消息？
`,
    code: `// 乐观并发的最小模型：更新必须携带读到的版本。
// 第二次用过期 version 必须失败——对应 DbUpdateConcurrencyException → 409/412。
var store = new Dictionary<string, Account>
{
    ["a-1"] = new("a-1", 100m, Version: 3),
};

Console.WriteLine(TryWithdraw(store, "a-1", 30m, expectedVersion: 3));
Console.WriteLine(TryWithdraw(store, "a-1", 20m, expectedVersion: 3));

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

分布式调用一定会出现超时、暂时故障和过载。目标不是「永不失败」，而是在预算内失败、避免放大故障并可恢复。韧性代码写错，比没有韧性更快把依赖打垮。

### 一、超时是一层层的预算

不要只设一个 \`HttpClient.Timeout = 100秒\` 然后祈祷。超时是分层的：

\`\`\`
用户请求预算          例如 5s（网关 / 你的 Action）
  └─ 总下游预算        TotalRequestTimeout  例如 3s
       ├─ 尝试 1       AttemptTimeout       例如 800ms
       ├─ 尝试 2（重试）
       └─ 尝试 3
  连接超时 / 排队      连接池打满时的等待
\`\`\`

每一层都必须**小于**上一层剩余时间，并把剩余预算往下传（\`CancellationToken\`）。多层各重试三次且各等满超时，会得到重试风暴：一次用户请求变成几十次下游调用。

### 二、现代 HttpClient 配置

\`\`\`csharp
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

### 三、重试原则与对冲（hedging）

- 只重试暂时故障，并使用指数退避 + jitter。
- GET 等幂等请求通常可重试；POST 必须先有幂等键或业务去重。
- 429 遵守 \`Retry-After\`；不要让所有实例同时重试。
- 设置总时间预算，避免多层各重试三次造成重试风暴。

**Hedging（对冲）**：主请求还没失败就再发一个并行副本，谁先回来用谁。延迟尾巴会好看，但**负载成倍增加**，依赖一旦抖动会被对冲打得更抖。只对读、且依赖明确有余量、且有取消输家的能力时才考虑。默认关掉。支付、下单、发邮件禁止对冲。

### 四、断路器状态

\`\`\`
Closed（闭合，正常放行）
    │  失败率 / 连续失败超过阈值
    ▼
Open（断开，快速失败）
    │  冷却时间到
    ▼
Half-Open（半开，放入探针请求）
    │  探针成功 → Closed
    │  探针失败 → Open
\`\`\`

断路器减少对已故障依赖的压力，不是修复服务。半开阶段必须限制探针数量，否则所有排队请求会在同一毫秒冲进去。用并发限制 / bulkhead 阻止一个依赖耗尽全部连接和线程。降级数据必须标记新鲜度，不能悄悄返回错误结果。

### 五、服务端限流

ASP.NET Core Rate Limiting 支持 fixed window、sliding window、token bucket 和 concurrency limiter。按经过认证的租户/用户分区；IP 只适合作为辅助信号。返回 429 并提供 \`Retry-After\`。限流键不要用高基数原始 URL。网关与应用双重限流时对齐配额语义。

### 六、缓存：内存 vs Redis，以及 HTTP 缓存

| | \`IMemoryCache\` | 分布式（Redis 等） |
| --- | --- | --- |
| 延迟 | 极低 | 网络往返 |
| 范围 | 单实例 | 全集群一致（最终） |
| 失效 | 别的实例看不见 | 可统一删键 |
| 适合 | 进程内计算、极热小对象 | 会话、跨实例共享读模型 |
| 风险 | 多副本各缓存一份，内存翻倍 | 序列化、热 key、雪崩 |

cache-aside：读缓存，未命中读源并回填；写后失效或更新。缓存键必须包含租户、权限、区域等影响结果的维度。分布式缓存不提供数据库事务；接受并设计最终一致性。绝不能缓存未经隔离的用户敏感响应。

**Cache-Control**（HTTP）：

| 指令 | 含义 |
| --- | --- |
| \`private\` / \`public\` | 能否进共享缓存 |
| \`max-age\` | 新鲜时间 |
| \`no-store\` | 不要存（会话、PII） |
| \`must-revalidate\` | 过期必须回源 |
| \`stale-while-revalidate\` | 先吐旧的，后台回源 |

\`stale-while-revalidate\` 让用户看到略旧数据换取尾延迟。业务上必须允许「旧」：库存扣减、余额、权限判定不要走这条。应用层也可以实现同样策略：过期后仍返回旧值并异步刷新。

### 七、缓存击穿（stampede）与抖动

热点 key 过期时，所有实例同时回源，把数据库打穿，叫 stampede / thundering herd。对策：

- TTL 加随机抖动，避免整批一起死。
- 单飞 / 请求合并：同一 key 只有一个回源，其余等结果。
- 互斥锁或 Redis SETNX 选「刷新者」。
- 预热已知热点，而不是上线第一秒靠用户撞。

空结果也要短 TTL 缓存（负缓存），否则穿透会一直打到 DB。负缓存时间必须短，避免「刚创建的订单一直 404」。

### 八、混沌与演练

韧性配置是假设，不是证明。在预发对依赖注入超时、连接拒绝、429、慢响应，看断路器是否打开、用户是否看到降级、重试是否把 QPS 放大到不可接受。不必上完整混沌平台，一条故障注入中间件加上仪表盘就能揭穿「重试 3 次看起来很安心」。生产演练要有停止条件。

### 常见陷阱

- 只对 \`HttpRequestException\` 重试，却忽略 503 正文——标准 handler 比手写白名单更不容易漏。
- 缓存键漏租户，A 租户读到 B 的价格。
- 把 Redis 当数据库：无 TTL、无驱逐、无备份，还指望事务。
- 对冲 + 重试 + 网关重试三层叠加，故障日流量乘 9。

### 九、缓存一致性的几种写策略

cache-aside（旁路）最常见，也最好推理：读未命中才回源；写库成功后删键（或短 TTL 自然过期）。不要在写路径「先更新缓存再写库」——库失败时缓存成了谎言。

| 策略 | 做法 | 风险 |
| --- | --- | --- |
| Cache-aside | 读回源回填，写后删键 | 删键失败会短暂旧读 |
| Write-through | 写库同时写缓存 | 延迟高，缓存被不常用键填满 |
| Write-behind | 先写缓存再异步落库 | 丢数据窗口，只适合可丢失缓冲 |

生产默认 cache-aside + 删除。需要「读自己的写」时，在该用户请求里绕过缓存或带版本号，而不是把 TTL 调到 24 小时指望运气。

Redis 不是银弹：热 key 会打满单分片 CPU；大 value 会拖高 P99；集群 slot 迁移时短暂失败要当暂时性错误。内存缓存适合「算出来贵、丢了能重算」的小对象。会话、跨实例共享读模型才上 Redis。两者可以叠：本地短 TTL 做 L1，Redis 做 L2，但失效要两边都想到，否则 L1 会脏得更久。

### 十、限流与重试的对手盘

你的客户端重试，是对方的限流输入。对方返回 429 + \`Retry-After\`，你必须睡够，而不是按自己的指数表立刻再打。自己做服务端限流时，分区键用认证身份；把尚未认证的 IP 限流设宽松一些，避免 NAT 出口误伤。令牌桶适合「允许短突发」，固定窗口实现简单但会在窗口边缘叠出双倍流量。把选择和配额写进 SLA，而不是埋在代码常量里。

### 生产检查

1. 是否画出超时层次，且每层预算小于上层？
2. 重试是否仅限幂等/可去重，并带 jitter 与总预算？
3. 断路器阈值、半开探针、降级新鲜度是否写进 runbook？
4. 是否默认关闭 hedging？若打开，依赖容量评估过吗？
5. 缓存键是否含租户与权限？TTL 是否有抖动？热点是否防 stampede？
6. 敏感响应是否 \`no-store\`？SWR 是否只用在允许旧数据的读模型？
7. 预发是否做过依赖故障注入，而不是只在单元测试里 Mock 成功路径？
8. 写后失效是否可靠？L1/L2 叠缓存时失效顺序是否明确？
`,
    code: `// 指数退避 + jitter：避免所有实例在同一毫秒重试。
// 生产请用 Microsoft.Extensions.Http.Resilience，并设置总时间预算。
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

定时任务、消息消费、邮件发送和批处理不应绑在 HTTP 请求生命周期里。请求线程必须快速返回；慢工作进队列。队列不是「另一个函数调用」，它把失败、重复和乱序变成你必须设计的语义。

### 一、IHostedService vs BackgroundService

| | \`IHostedService\` | \`BackgroundService\` |
| --- | --- | --- |
| 抽象 | 原始：\`StartAsync\` / \`StopAsync\` | 已实现循环骨架，你写 \`ExecuteAsync\` |
| 适合 | 与启动/停止强绑定的短任务、订阅 | 长期循环：轮询、消费、定时 |
| 取消 | 你自己把 \`stoppingToken\` 传到各处 | \`ExecuteAsync(stoppingToken)\` 已提供 |
| 风险 | \`StartAsync\` 里阻塞会拖住整个宿主启动 | 未捕获异常可能干掉 Host |

优先 \`BackgroundService\`。只有当你需要精确控制「启动完成前必须就绪」或同时跑多个不对称生命周期时，才直接实现 \`IHostedService\`。

\`\`\`csharp
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
- 未处理异常可能停止宿主；明确告警和重启策略。不要在 \`ExecuteAsync\` 里吞掉所有异常还假装健康。

### 二、Channel 与有界模式

\`System.Threading.Channels\` 提供进程内生产者/消费者。\`Channel.CreateUnbounded<T>()\` 没有背压，内存可以无限涨——生产默认禁止。\`Channel.CreateBounded<T>(n)\` 才是默认选择。

| \`BoundedChannelFullMode\` | 队列满时 |
| --- | --- |
| \`Wait\` | 生产者异步等待（背压传到上游） |
| \`DropNewest\` | 丢最新 |
| \`DropOldest\` | 丢最旧 |
| \`DropWrite\` | 丢本次写入 |

关键任务用 \`Wait\` 或在满时对 HTTP 返回 429/503。日志采样、指标可以用 Drop。进程崩溃会丢内存消息，关键任务必须用持久化 broker。\`SingleReader\` / \`SingleWriter\` 能省同步，但写错就会丢数据或抛异常——只有真单消费者才打开。

\`Channel\` 是类型名，\`Channel<T>\` 是带元素类型的通道；工厂方法返回 \`Channel<T>\`，再分别拿 \`Reader\` / \`Writer\`。不要和 \`System.Threading.ThreadPool\` 或 Azure Channel 概念混名。

### 三、投递语义、毒消息与竞争消费者

- 常见 broker 提供 at-least-once，因此消费者必须幂等。
- 「exactly once」通常只在有限边界内成立，不能消除所有外部副作用重复。
- 消息带唯一 ID、schema 版本、correlation/trace 信息和发生时间。
- 先成功处理并持久化，再 ack；处理超时要考虑 visibility/lock 延长。

**毒消息（poison message）**：无论重试多少次都失败（反序列化失败、业务永久拒绝、依赖 400）。它会堵住分区或被无限重试。策略：有限次数（例如 5）后进死信队列（DLQ），告警，人工或补偿脚本处理。不要把毒消息和暂时性超时混在一个「重试 99 次」里。

**竞争消费者（competing consumers）**：多个实例抢同一队列以提高吞吐。适合无序、可并行的任务。代价是**同一业务实体的消息可能被不同实例同时处理**——必须靠幂等或分区键。

**排序键 / 分区键**：需要「同一订单的事件按序」时，用 \`orderId\` 做分区，保证同一 key 落到同一分区并由单消费者处理。不要幻想全局全序——那是单点。跨实体顺序只能在上层用因果键或业务时间表达。

### 四、Inbox / Outbox 回顾

发布：业务行 + outbox 行同一事务提交，后台转发。消费：先把消息 ID 写入 inbox 唯一约束，再做业务；重复投递被约束挡住。两边都要，缺一边就会双写或重复消费。TTL 清理 inbox 时必须大于生产者重试窗口。

### 五、定时：Hangfire vs Quartz vs 云调度

| 方案 | 特点 | 适合 |
| --- | --- | --- |
| 单实例 \`PeriodicTimer\` | 零依赖，进程挂了就停 | 单副本维护任务 |
| Hangfire | 持久化作业、仪表盘、[AutomaticRetry]、易上手 | ASP.NET 里的后台作业、延迟任务 |
| Quartz.NET | 复杂 Cron、日历、集群作业 | 传统企业调度、精细日历 |
| 云调度（Logic Apps、EventBridge Scheduler、Azure Scheduler/Functions Timer、K8s CronJob） | 与云 IAM、重试、监控集成 | 多实例下的「一天一次」运维任务 |

多副本环境需要分布式租约或持久化调度器，避免每个副本整点同时跑对账。云 Cron 触发时仍要把「真正的工作」推进你们的队列，让执行可水平扩展、可重试、可观测。Hangfire/Quartz 的存储（SQL/Redis）也是生产依赖，要备份和迁移，不要只当 NuGet 包。

选择口诀：单机维护 → Timer；应用内延迟作业 → Hangfire；复杂日历集群 → Quartz；基础设施级定时 → 云调度 + 队列。

### 常见陷阱

- 在 \`StartAsync\` 里 \`Task.Run\` 开火然后立刻返回，异常变成未观察任务，宿主显示「已启动」。
- 无界 Channel 当削峰，高峰一过内存已经换页。
- 竞争消费者无分区键，库存扣减并发把数量扣成负数。
- DLQ 没有告警，毒消息静默堆积两周。
- 三个副本各跑 Quartz 却没配集群，对账跑三次。

### 六、可见性超时与重入

至少一次投递依赖「可见性超时」：消息被领走后一段时间内对其他消费者隐藏；超时未 ack 则重新可见。处理时间超过该窗口，两个消费者会同时做同一件事——于是又回到幂等。长任务要续租（renew lock / defer），而不是把超时设成 30 分钟当懒政。续租失败必须停止副作用。

重入还来自部署：旧实例与新实例竞争同一队列。消息契约必须双向兼容。Worker 的优雅停机要先停止领取，再等在途续租循环退出。

Channel 只解决进程内；跨进程立刻换成 broker。不要用数据库表当队列还自己写 \`UPDATE TOP 1\` 抢行——除非你清楚锁和丢失更新，且量很小。那是 Outbox 转发器的实现细节，不是通用业务队列。

### 生产检查

1. 后台工作是否都在 Hosted Service / 独立 Worker，而不是 Controller 里 \`Task.Run\`？
2. Scoped 依赖是否每批新开 scope？取消令牌是否贯穿？
3. 进程内队列是否有界？满载策略是否明确（等待/拒绝/丢弃）？
4. 消费者是否幂等？毒消息是否有限重试 + DLQ + 告警？
5. 需要顺序的实体是否有分区键？不需要顺序的是否用竞争消费者提吞吐？
6. 定时任务在多副本下是否有租约或外置调度，避免重复执行？
7. Inbox/Outbox 是否覆盖「写库 + 发消息」的双边？
8. 可见性超时是否大于处理时间，长任务是否续租？
`,
    code: `using System.Threading.Channels;

// 有界通道 + Wait：队列满时生产者挂起，而不是无限占内存。
// SingleReader=true 仅当确实只有一个消费者；关键任务仍需持久化 broker。
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

可观测性不是「多打日志」，而是让系统能回答：发生了什么、影响谁、瓶颈在哪、是否恢复。仪表盘好看不算成功；能在五分钟内排除「是代码、是依赖、还是配置」才算。

### 一、三大信号

- **Logs**：离散事件，使用结构化字段。
- **Metrics**：可聚合数值，用于趋势和告警。
- **Traces**：一次请求跨服务的因果链。

OpenTelemetry 统一采集和导出；应用代码优先使用 \`ILogger\`、\`ActivitySource\`、\`Meter\` 等标准 API，后端可替换。不要在业务代码里写死对某一家 APM SDK 的类型。

### 二、W3C Trace Context、相关 ID 与 Baggage

浏览器、网关、服务之间传播两套标准头：

| 头 | 作用 |
| --- | --- |
| \`traceparent\` | \`version-trace-id-parent-id-flags\`，标识当前 span |
| \`tracestate\` | 厂商特定的路由/采样提示，有长度限制 |

这就是 W3C Trace Context。ASP.NET Core 与 \`HttpClient\` 在诊断开启时会自动传播。自己拼 HTTP 时不要丢掉这两个头，否则链路在边界断开。

**Correlation ID / 请求 ID**：面向人类与日志检索的稳定键，常常等于 \`TraceId\`，或网关生成的 \`X-Correlation-ID\`。对外 Problem Details 和客服工单暴露它；对内日志 scope 带上它。不要再发明第三套「guid 每个中间件各生成一次」。

**Baggage**（\`baggage\` 头）把业务键值沿调用链传递，例如 \`tenant.id\`。**务必谨慎**：

- Baggage 会进每一个下游请求，有泄露与放大风险。
- 不要放 PII、令牌、邮箱、订单金额。
- 基数高的值（用户 ID）不要既进 baggage 又进 metric 标签。
- 只放采样或路由真正需要的低敏、低基数键，并设白名单。

### 三、结构化日志与脱敏

\`\`\`csharp
logger.LogInformation(
    "Order {OrderId} paid in {ElapsedMs} ms",
    orderId, elapsed.TotalMilliseconds);
\`\`\`

不要用字符串插值替代消息模板；模板字段才能被日志后端索引。异常对象放第一个参数。使用 scope 附加 tenant、request 等上下文。

**脱敏（redaction）**：在写入管道统一处理，而不是指望每个开发记得。连接串、Authorization、Cookie、身份证、卡号用正则或已知字段名抹掉。生产默认不要打请求体。需要审计的敏感操作写专用审计存储，而不是 Info 日志。

### 四、基数（cardinality）与 Exemplar

指标标签的**基数**是「这个标签有多少不同值」。\`channel=web|app\` 没问题；\`user_id\`、\`order_id\`、完整 URL、邮箱会把时间序列炸成几百万条，账单和查询一起崩。

- Counter：累计请求/错误。
- Histogram：延迟、大小；比只记录平均值更能反映尾延迟。
- ObservableGauge：队列深度等当前观测值。
- 标签必须低基数；禁止把用户 ID、订单 ID、完整 URL 作为 metric 标签。

**Exemplar**：直方图某个桶附带一条示例 trace id，让你从「P99 = 800ms」点进当时那条慢请求。需要后端支持（Prometheus + OTel 等）。没有 exemplar 时，至少保证慢请求日志带同一 \`traceId\`，人工还能跳。

### 五、ActivitySource 命名与 OTLP

\`ActivitySource\` 名字是稳定的遥测身份，不要用类名乱造一堆。

\`\`\`csharp
internal static class Telemetry
{
    public const string ServiceName = "shop-api";
    public static readonly ActivitySource Activity = new("Shop.Api");
    public static readonly Meter Meter = new("Shop.Api");
}
\`\`\`

约定：

- 一个服务一到两个 source，按模块用 \`Activity\` 名（\`shop.order.create\`）区分操作，而不是 20 个 source。
- 名字用点分小写，避免空格和版本号。版本走资源属性 \`service.version\`。
- 外部调用创建子 span，记录状态和低基数标签（\`peer.service\`、\`http.response.status_code\`）。
- 采样降低成本，但错误和慢请求策略应可配置（tail-based sampling 在收集端做）。

**OTLP**（OpenTelemetry Protocol）是导出的默认选择：一个 exporter 同时送 traces/metrics/logs 到 Collector，再由 Collector 分发给后端。应用只配 endpoint 与资源属性（\`service.name\`、\`service.namespace\`、\`deployment.environment\`、\`service.version\`）。不要每个环境改代码切 Jaeger/Zipkin SDK。

### 六、仪表盘 vs 告警

| | 仪表盘 | 告警 |
| --- | --- | --- |
| 目的 | 探索、复盘、值班时看趋势 | 叫醒人去行动 |
| 基数 | 可以多图 | 必须少、准、有 runbook |
| 失败模式 | 图太多没人看 | 误报导致屏蔽 |

告警围着 **SLO / 用户影响**：错误率、饱和度、关键业务（下单成功率），而不是「某台 CPU 80%」。每条告警写：含义、五分钟排查步骤、升级人。仪表盘按服务黄金信号（延迟、流量、错误、饱和）+ 业务计数布置。不要用告警当「日志订阅」。

### 七、健康检查与诊断工具

- liveness：进程是否卡死；不要依赖所有下游。
- readiness：实例是否能接流量，可检查关键初始化。
- startup：慢启动应用是否已完成初始化。

错误地把数据库短暂故障放进 liveness 会导致所有实例重启并放大事故。

\`dotnet-counters\` 看实时指标，\`dotnet-trace\` 收集 EventPipe trace，\`dotnet-dump\` 分析转储，\`dotnet-gcdump\` 分析托管堆。先观察再优化，保留事件时间线和部署版本信息。转储属于机密，按密钥级别保管。

### 常见陷阱

- 每个仓储方法一个 \`ActivitySource\`，Grafana 里服务名对不上。
- 把 \`traceId\` 只打在日志，Metric 没有，告警无法跳转。
- Baggage 塞用户邮箱，被下游 HTTP 日志全打印。
- 生产开 \`AlwaysOn\` 采样，账单先于故障到达。

### 八、相关 ID 的落地位置

同一条请求至少在四个地方出现同一个 ID：入口日志 scope、Problem Details 的 \`traceId\` / \`instance\`、出站 \`HttpRequestMessage\` 头、消息信封的 \`correlationId\`。缺一处，值班就要靠猜时间对齐。ASP.NET Core 的 \`Activity.Current?.Id\` 或 \`HttpContext.TraceIdentifier\` 不要各用各的——选 W3C \`TraceId\` 作为对外相关 ID，内部 span id 仅用于链路树。

资源属性（\`service.version\`、\`deployment.environment\`）必须随制品注入，告警才能回答「是不是刚发的那一版」。没有版本的指标，回滚决策只能靠感觉。

### 生产检查

1. 是否全链路传播 W3C \`traceparent\`，对外错误是否回传同一相关 ID？
2. Baggage 是否有白名单且无 PII？
3. Metric 标签是否低基数？直方图是否能通过 exemplar 或日志对上 trace？
4. \`ActivitySource\` / \`Meter\` / \`service.name\` 是否稳定且与仪表盘过滤一致？
5. 导出是否走 OTLP + Collector，而不是应用直连五家后端？
6. 告警是否对应用户影响并带 runbook？仪表盘是否另用途？
7. 探针语义是否正确？转储与日志是否脱敏、可按版本检索？
8. 日志、错误体、出站 HTTP、消息信封是否共用同一相关 ID？
`,
    code: `using System.Diagnostics;
using System.Diagnostics.Metrics;

// ActivitySource / Meter 名字要稳定，和 OTLP 资源属性 service.name 对齐。
// 标签只用低基数维度（channel），不要把 orderId 打进 metric。
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

只有 Mock 的单元测试无法证明数据库映射、序列化、认证和中间件真的能协作。测试的目标是降低「改完不敢发」的恐惧，而不是堆覆盖率数字。

### 一、测试金字塔的当代读法

经典金字塔：大量单元、少量集成、极少 UI。当代服务开发要加上 nuance：

| 层 | 测什么 | 速度 | 典型工具 |
| --- | --- | --- | --- |
| 单元 | 纯规则、值对象、定价、状态机 | 毫秒 | xUnit + 无 IO |
| 组件 / 集成 | DI、EF 映射、HTTP 管线、真实 SQL | 秒 | \`WebApplicationFactory\`、Testcontainers |
| 契约 | 消费者与提供者对 JSON/事件的共同理解 | 秒 | Pact、OpenAPI 快照（谨慎） |
| 端到端 | 少量关键用户路径 | 分钟 | Playwright、预发环境 |

- **风险决定比例**，不是 70/20/10 教条。支付核心可以集成测试比单元还多。
- 100% 行覆盖经常测到的是「行被执行」，不是「行为正确」。变异测试（见后）比盲目加断言更揭示假测试。
- 金字塔塌掉的常见原因：所有逻辑都在 Controller 里，单元测试只能 Mock 到空气。

### 二、高质量测试

- 测行为，不锁死内部实现。
- Arrange / Act / Assert 清晰，一个失败说明一个原因。
- 时间、随机数、外部 IO 通过显式边界控制。
- 并行测试不共享可变静态状态。
- 测试数据使用 builder/factory，避免脆弱的大型 fixture。

### 三、WebApplicationFactory 定制

\`WebApplicationFactory<Program>\` 在进程内启动测试宿主，通过真实 HttpClient 验证路由、中间件、认证和 JSON。需要让顶级 Program 可被测试项目访问时，可添加 \`public partial class Program { }\`。

定制是集成测试的核心能力：

\`\`\`csharp
public sealed class ShopApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<IHostedService>(); // 避免测试里跑 Outbox 循环
            services.AddSingleton<TimeProvider>(FakeTime);
            services.AddSingleton<IOptionsSnapshot<PricingOptions>>(
                new FakeSnapshot(PricingOptions.Testing));
        });
    }
}
\`\`\`

常见定制：替换连接字符串、关掉后台 hosted service、换成假邮件、注入测试认证 \`WebApplicationFactory\` 的 \`WithWebHostBuilder\`。不要在每个测试里 new 一套工厂而不 Dispose——泄漏端口和容器。xUnit 用 \`IClassFixture<T>\` 或 \`ICollectionFixture<T>\` 共享工厂。需要隔离数据时再按类或按测试重建。

### 四、Testcontainers 生命周期

数据库行为与 provider 强相关；不要用 EF Core InMemory 推断 SQL Server/PostgreSQL 行为。Testcontainers 可在测试期间启动真实数据库。

生命周期建议：

1. **程序集 / 集合级**启动一个容器（分钟级成本摊到很多测试）。
2. 每个测试用事务回滚，或唯一 schema / 数据库名隔离。
3. 固定镜像 digest，而不是 \`postgres:latest\`。
4. 本地无 Docker 时用 \`[Trait("Container", "true")]\` 让 CI 跑、笔记本可跳过。
5. \`IAsyncLifetime.InitializeAsync\` 里等就绪探针，而不是 \`Sleep(5)\`。
6. Dispose 必须删容器；CI 并行任务注意端口冲突，交给容器随机端口。

容器不是「更慢的单元测试」。把映射、迁移、约束、并发冲突放进来；纯计算仍留在单元层。

### 五、TimeProvider 与 IOptionsSnapshot

用 \`TimeProvider\`（.NET 8+）代替 \`DateTime.UtcNow\` 满天飞。生产注册 \`TimeProvider.System\`，测试用 \`FakeTimeProvider\` 把「14 天退款窗口」拨到第 15 天。禁止 \`Thread.Sleep\` 等墙上时钟。

\`IOptions<T>\` 在启动时绑定一次；\`IOptionsSnapshot<T>\` 每 scope 再读（可响应文件变更）；\`IOptionsMonitor<T>\` 可订阅变化。测试里不要只替换 \`IOptions<T>\` 却让生产代码要 \`IOptionsSnapshot<T>\`——DI 会拿到未配置的空实例。明确注册你代码真正请求的那一种，或用 \`Options.Create\` / 自定义 \`IOptionsSnapshot\` 替身。验证：改配置键，测试断言行为变，而不是断言绑定类字段名。

### 六、不稳定测试（flaky）

Flaky 是信任杀手：红了重跑就绿，团队开始无视 CI。常见病因：

- 依赖墙上时钟或未控制的 \`Task.Delay\`。
- 共享静态可变状态、共享数据库行。
- 等待「最终出现」却无超时/轮询上限。
- 并行测试抢同一端口、同一容器、同一磁盘文件。
- 断言顺序敏感的日志或字典枚举。

治理：标记、隔离、限时修复；超过阈值就删或重写。不要在 CI 里「失败重试 3 次」当长期策略——那是把 flaky 制度化。

### 七、变异测试与快照测试

**变异测试**（Stryker.NET 等）会改生产代码（把 \`>\` 改成 \`>=\`）再跑测试，看有没有测试红。存活的变异 = 假安全感。不必追求高分，对定价、权限、幂等这几处核心值得跑。它慢，放夜间即可。

**快照测试**把整段 JSON/HTML 存成文件，变了就失败。适合序列化格式、OpenAPI 文档这类「 intentionally 稳定」的表面。陷阱：

- 快照里含时间戳、随机 ID，每次都要盲批。
- 巨大快照没人读，回归变成「点 accept」。
- 用快照代替断言业务字段，重构一动全红却说不清为什么。

快照要小、要审、要排除易变字段。契约测试优于「整个响应 dump」。

### 八、异步和并发测试

- 测试方法返回 \`Task\`，禁止 \`.Wait()\` / \`.Result\`。
- 用可控 \`TaskCompletionSource\` 协调并发，不靠 \`Thread.Sleep\` 猜时序。
- 给测试设置总超时，失败时保留日志（\`WebApplicationFactory\` 可接 \`ITestOutputHelper\`）。

### 九、属性测试、模糊测试与架构测试

- **属性测试**不手写三个例子，而是声明“对所有合法输入成立”的性质，由 FsCheck / Hedgehog 生成输入并在失败后 shrink 成最小反例。适合金额往返、排序、状态机和序列化；生成器必须遵守领域约束，不能拿一堆无效垃圾只测到参数校验。
- **模糊测试（fuzzing）**持续向解析器、上传、压缩包和二进制协议喂畸形字节，目标是找崩溃、挂死和越界。固定回归语料库，给单次输入设时间/内存上限；发现的最小样本必须进入普通测试。它不能证明业务正确。
- **架构测试**用 NetArchTest / ArchUnitNET 等守住“Domain 不引用 Infrastructure”“模块 A 不越层访问模块 B 的数据库”。它防的是依赖方向漂移，不替代代码评审。

下面是不用库也能理解的最小属性测试：固定 seed 让 CI 可重现，失败信息打印 seed 与输入；真实项目再换成会自动生成和 shrink 的框架。

\`\`\`csharp-run
var seed = 20260914;
var random = new Random(seed);

for (var sample = 0; sample < 1_000; sample++)
{
    // 生成长度和元素，覆盖空集合、重复值、负数与边界附近的值。
    var values = Enumerable.Range(0, random.Next(0, 40))
        .Select(_ => random.Next(-10_000, 10_001))
        .ToArray();

    // 性质：反转两次必须得到原序列；不依赖某一个手写样例。
    var roundTrip = values.Reverse().Reverse().ToArray();
    if (!values.SequenceEqual(roundTrip))
        throw new Exception($"seed={seed}, sample={sample}, input=[{string.Join(",", values)}]");
}

Console.WriteLine($"property passed: seed={seed}, samples=1000");
\`\`\`

### 常见陷阱

- 集成测试共用一个可变种子数据，顺序依赖。
- Factory 里 \`RemoveAll<DbContext>\` 后忘记加回测试库，测试打到开发者本机数据库。
- 快照全绿但从未用真人读过第一次生成的文件。

### 十、测试数据与并行

builder 比「整个库 dump」好维护：\`OrderBuilder.Paid().WithAmount(20m)\` 只暴露测试关心的差异。共享可变种子会让并行 xUnit 变成轮盘。每个测试用唯一 ID（\`Guid\` 或理论序号），或事务回滚。需要「已存在的订单」时在 Arrange 里插入，不要依赖上一个测试的副作用。

\`IOptionsSnapshot\` 测试要覆盖「配置缺键时启动失败」——这是生产 Monday 事故的常见来源。\`ValidateOnStart\` + 测试里拿掉键，断言宿主起不来。时间相关断言用 \`FakeTimeProvider.Advance\`，不要比较绝对时钟。

### 生产检查

1. 风险高的路径是否有集成/契约测试，而不只是 Mock？
2. \`WebApplicationFactory\` 是否定制了环境、关掉有害后台服务、正确替换 Options 与时间？
3. 真实数据库测试的容器是否固定版本、共享生命周期、可在无 Docker 时跳过？
4. 时间与随机是否可注入？\`IOptionsSnapshot\` 是否测了真正的那种接口？
5. CI 是否追踪 flaky 并禁止无限重试？
6. 核心规则是否至少做过一次变异测试？快照是否排除易变字段？
7. 测试数据是否 builder 化、可并行、不依赖顺序？
8. 高风险解析器是否有 fuzz 回归语料？核心不变量是否有属性测试？模块边界是否由架构测试守住？
`,
    code: `// 可测试的业务规则：时间由调用方传入，对应生产里的 TimeProvider。
// 不要在政策类内部读 DateTime.UtcNow，否则集成测试只能 Sleep。
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

容器不是虚拟机。应用应无状态、快速启动、响应终止信号，并把状态放到外部持久化服务。镜像构建的每一层都会被缓存和攻击面扫描，所以 Dockerfile 本身也是生产代码。

### 一、发布模式

- framework-dependent：镜像需要 .NET Runtime，体积和兼容性平衡好。
- self-contained：携带运行时，需按 RID 发布。
- Native AOT：启动和内存优秀，但反射、动态代码和库兼容性需验证。

先测量启动、吞吐、内存、镜像和构建成本再选择。容器里最常见的是 **framework-dependent + 官方 aspnet 基础镜像**。

### 二、多阶段构建与层缓存（先 COPY csproj）

错误写法把源码一次性 \`COPY . .\`，任何 \`.cs\` 改动都让 \`restore\` 缓存作废。正确顺序：**先复制项目文件 → restore → 再复制源码 → publish**。

\`\`\`dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY nuget.config Directory.Build.props Directory.Packages.props ./
COPY src/Shop.Domain/Shop.Domain.csproj src/Shop.Domain/
COPY src/Shop.Api/Shop.Api.csproj src/Shop.Api/
RUN dotnet restore src/Shop.Api/Shop.Api.csproj --locked-mode
COPY src/ src/
RUN dotnet publish src/Shop.Api/Shop.Api.csproj -c Release -o /app --no-restore --no-self-contained

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
USER $APP_UID
COPY --from=build /app .
ENTRYPOINT ["dotnet", "Shop.Api.dll"]
\`\`\`

生产中固定经过验证的镜像 digest，并由自动化定期升级。\`USER $APP_UID\` 使用官方镜像预置的非 root 用户（通常 UID 1654），不要再 \`USER root\`。不把 secret COPY 进镜像，\`.dockerignore\` 排除 \`bin/\`、\`obj/\`、\`.git/\`、\`.env\`。

上一版示例里的 \`COPY . .\` 再 publish，是教学简化，**生产不要用**——层缓存和密钥泄漏风险都更大。

### 三、Chiseled、distroless 与只读根文件系统

| 镜像风格 | 内容 | 适合 |
| --- | --- | --- |
| 完整 \`aspnet\` | 包管理器、shell、调试工具 | 排障方便，攻击面大 |
| Ubuntu Chiseled（微软） | 无包管理器、无 shell、非 root | 生产默认候选 |
| Distroless | 几乎只有运行时 + 应用 | 极小攻击面，排障靠 sidecar/临时容器 |

Chiseled / distroless 里没有 \`bash\`，不能 \`kubectl exec\` 进去 \`apt\`。这是优点。调试用临时调试容器或把 \`dotnet-dump\` 放运维镜像。选镜像时核对 glibc vs musl（Alpine）与 RID。

只读根文件系统（Kubernetes \`readOnlyRootFilesystem: true\`）：应用不能写 \`/app\`。需要的临时目录显式挂 emptyDir（如 \`/tmp\`），并在 ASP.NET 里把 \`TMPDIR\` / 数据保护本地缓存指过去。日志打到 stdout，不要写容器内文件。打开只读后立刻在预发测一遍上传、数据保护、模块初始化。

再收一层：丢掉不必要的 Linux capabilities，禁止特权，Seccomp 默认即可。

### 四、环境配置

配置优先级通常是 appsettings → 环境文件 → 环境变量 → 命令行。环境变量嵌套键用双下划线，如 \`ConnectionStrings__Main\`。启动时验证必需选项并快速失败。容器里不要依赖当前工作目录下的开发证书；HTTPS 终结通常在 Ingress。

### 五、SIGTERM 顺序

Kubernetes / Docker 发送 SIGTERM 后，典型时间线：

\`\`\`
t0     kubelet 发送 SIGTERM
t0     同时从 Service 摘掉 Endpoints（与 preStop 时序要设计）
t0+    ASP.NET Core 收到停机，IHostApplicationLifetime.ApplicationStopping
       - 停止接受新请求（Kestrel 不再派发新工作）
       - 等待在途请求，直到 ShutdownTimeout
       - Hosted Service.StopAsync，消费者停止拉取
t0+N   仍未退出则 SIGKILL（N = terminationGracePeriodSeconds）
\`\`\`

建议：

1. \`preStop\` 里先 \`sleep\` 几秒，等 kube-proxy / Ingress 摘流，再让进程进入停机（按集群网络模型调整）。
2. \`terminationGracePeriodSeconds\` > 应用 \`ShutdownTimeout\` + 摘流时间。
3. 后台消费者：停止领取、完成或把在途消息可见性还给队列，然后退出。
4. 不要依赖 \`finally\` 一定执行；\`SIGKILL\` 不会给你回调。关键状态必须已经持久化。
5. 长请求（上传、SSE）要么短于宽限期，要么设计成可断开重连。

### 六、健康 vs 就绪，以及探针 YAML

- **startupProbe**：慢启动（JIT、迁移预热）期间不要杀进程。
- **livenessProbe**：进程死锁/卡死才失败；不要把下游 DB 抖动放进来。
- **readinessProbe**：实例能否接流量；依赖未就绪时应摘流而不是重启。

\`\`\`yaml
# 示意：与 ASP.NET 映射对齐
startupProbe:
  httpGet: { path: /health/startup, port: 8080 }
  failureThreshold: 30
  periodSeconds: 2
livenessProbe:
  httpGet: { path: /health/live, port: 8080 }
  periodSeconds: 10
readinessProbe:
  httpGet: { path: /health/ready, port: 8080 }
  periodSeconds: 5
lifecycle:
  preStop:
    exec:
      command: ["sleep", "5"]
terminationGracePeriodSeconds: 30
securityContext:
  runAsNonRoot: true
  readOnlyRootFilesystem: true
\`\`\`

设置 CPU/内存 request 和 limit，并做负载测试；内存限制会影响 GC 行为。探测端口必须是容器里应用真正监听的端口（.NET 8+ 官方镜像常见 \`8080\`，并以 \`ASPNETCORE_HTTP_PORTS\` 为准）。

### 七、非容器生产宿主：systemd、Windows Service 与 IIS

容器不是唯一正确答案。内网、边缘设备、Windows 集成和小规模单机服务可以直接托管，但同样要有不可变制品、低权限账号、健康检查、日志轮转、自动重启和回滚。

- **Linux systemd**：Worker 可用 \`Microsoft.Extensions.Hosting.Systemd\` 感知生命周期；Web 服务让 Kestrel 只监听内网/回环，再由 Nginx、Envoy 或云 LB 终结 TLS。unit 文件明确 \`User\`、\`WorkingDirectory\`、环境文件权限、\`Restart=on-failure\` 和停止超时。
- **Windows Service**：使用 \`Microsoft.Extensions.Hosting.WindowsServices\` 的 \`AddWindowsService\`，以专用服务账号运行；不要给 LocalSystem 只为省 ACL 配置。事件日志、恢复动作、服务依赖和证书私钥权限都要在部署脚本里声明。
- **IIS**：ASP.NET Core Module 管理进程和反向代理（或进程内托管）；应用池身份、请求上限、转发头、web.config 与 Hosting Bundle 版本都是部署契约。不要把 IIS Express 配置当生产配置。

\`\`\`ini
# /etc/systemd/system/shop-api.service（节选）
[Service]
User=shop-api
WorkingDirectory=/opt/shop/current
ExecStart=/usr/bin/dotnet /opt/shop/current/Shop.Api.dll
EnvironmentFile=/etc/shop-api/environment
Restart=on-failure
RestartSec=5
TimeoutStopSec=35
\`\`\`

无论哪种宿主，都要做同一组验收：机器重启后自动恢复；SIGTERM / Service Stop 能排空；低权限账号不能读其他服务密钥；反代只信任已知代理；新旧制品可原子切换；日志不会写满系统盘。

### 常见陷阱

- 用 \`latest\` 基础镜像，周一早会变成不可复现的 CVE 或行为变化。
- liveness 打数据库，一次主从切换重启所有 Pod。
- 宽限期 10s，而请求 P99 是 20s，部署变成随机 502。
- 以 root 跑、可写根文件系统、镜像里带 SDK——扫描报告会很难看。

### 生产检查

1. Dockerfile 是否先复制 csproj/props 再 restore，源码变动不打掉还原缓存？
2. 是否非 root（\`APP_UID\`）、只读根、无 secret 进层、digest 固定？
3. 是否评估过 chiseled/distroless，并确认无 shell 时的排障路径？
4. SIGTERM 顺序是否演练过：摘流 → 排空 → 停消费 → 超时 SIGKILL？
5. startup/live/ready 三条探针是否语义分离？YAML 端口是否正确？
6. 必需配置是否启动即校验？临时目录在只读根下是否可写？
7. 若不用容器，systemd / Windows Service / IIS 的账号、重启、停止、反代与回滚是否同样可复现？
`,
    code: `// Generic Host 收到 SIGTERM 后会取消 stoppingToken。
// 必须用 OperationCanceledException 退出循环，而不是忽略取消继续拉取。
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

流水线的目标是让每次变更经过同一套可审计、可重复的验证和发布过程。能在笔记本发布不是能力；能证明「线上那份 DLL 来自哪次提交、用了哪些依赖」才是。

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

### 二、GitHub Actions 草图

\`\`\`yaml
name: ci
on:
  pull_request:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write   # 给 OIDC 换云凭证，不要把长期 AK 放 secrets
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          global-json-file: global.json
      - run: dotnet restore --locked-mode
      - run: dotnet build --no-restore -c Release
      - run: dotnet test --no-build -c Release
      - run: dotnet publish src/Shop.Api --no-build -c Release -o out
      - uses: actions/upload-artifact@v4
        with:
          name: shop-api
          path: out
          retention-days: 14
\`\`\`

要点：用 \`global.json\` 钉 SDK；权限最小化；制品只从这一次 build 往下传。部署 job 用 \`environment: production\` 打开保护规则（必需评审、等待计时器、限制分支）。不要把 secrets 回显到日志，给步骤关闭 echo。密钥只通过环境注入到受保护的 deploy job。

### 三、OIDC 到云，而不是长期密钥

GitHub/GitLab 的 OIDC 令牌换取 Azure / AWS / GCP 的短期凭证：云侧建联邦身份，限制 \`sub\` 为特定仓库与环境。泄露面从「永久 AK 躺在 secrets 里」变成「一小时令牌 + 可审计 assume」。本地开发继续用开发者身份，不要把生产 OIDC 角色绑到个人 PAT。

### 四、制品：SBOM、签名、保留期

- build once, promote same artifact：测试过的制品原样晋级，禁止「生产再编一次」。
- 制品附版本、Git commit、SBOM 和签名。
- 禁止在生产机器现场编译。
- 保存足够的构建证明和依赖清单以便追溯。

**SBOM**（软件物料清单，CycloneDX 或 SPDX）：\`dotnet list package\`、容器扫瞄工具或 \`syft\` 都能生成。它回答「这版用了哪个 System.Text.Json」。CVE 披露当天靠 SBOM 定范围，而不是翻 git blame。

**签名**：对 nupkg / 容器镜像做签名（NuGet 签名、sigstore/cosign）。集群准入只收被签名且来自你们 registry 的摘要。签名密钥走 OIDC 签发的短时证书，优于长期私钥文件。

**制品保留**：PR 构建产物留几天即可；发布候选按法规与回滚窗口（例如 90 天）；生产基线与 SBOM 更长。无限保留会把对象存储变成无主垃圾，也扩大泄漏面。写清谁能下载生产制品。

### 五、部署策略、功能开关与提交信息

- rolling：简单，但新旧版本会短暂共存，API/数据库必须兼容。
- blue-green：切流快，资源成本较高。
- canary：先给少量流量，根据错误率、延迟和业务指标自动判断。

部署成功不等于进程启动成功。发布验证应检查 readiness、关键合成请求、错误预算和核心业务指标。

**功能开关**让「部署」和「发布」分开：暗功能先随版本上船，再按租户打开。开关必须：默认安全、可观测、有清理日期。用开关做「半成品永久藏身」会得到旗标墓地。数据库迁移仍要 expand/contract，开关不能让不兼容 schema 变安全。

**Conventional Commits**（\`feat:\` / \`fix:\` / \`perf:\` / \`revert:\`）让变更日志和语义化版本可生成。强制在 CI 校验 PR 标题比事后补写可靠。面向用户的破坏性变更、迁移步骤和安全修复仍必须人工写进发布说明——生成器只能当草稿。

库遵循语义化版本；服务 API 使用明确兼容策略。

### 六、回滚与数据库

应用制品可以快速回滚，破坏性数据库迁移通常不能。采用 expand/contract，使旧版和新版在迁移窗口共存。发布前写清「停止条件、回滚动作、数据修复负责人」。环境保护规则应要求这些文字出现在发布单里，而不是聊天记录里。

### 常见陷阱

- \`workflow_dispatch\` 手工填版本号，和 git tag 对不上。
- 用个人云 AK 当 \`secrets.AWS_KEY\`，离职后仍能发生产。
- SBOM 生成了但从未在 CVE 演练中打开过。
- 功能开关默认开、没有过期，预发与生产行为分叉。
- 制品保留 1 天，出事后无法对比「昨天的二进制」。

### 七、环境保护与谁能按按钮

GitHub \`environment: production\` 不只是一个名字。打开：必需审批人、等待 10 分钟（给「撤回去」留窗口）、限制能部署的分支为受保护的 \`main\`、可选部署窗口。预发环境可以自动，生产必须慢一拍。OIDC 的云角色按环境拆开：\`repo:org/shop:environment:production\` 才能 assume 生产角色，PR 流水线拿不到。

密钥扫描（gitleaks、push 保护）要在门禁最前面。泄漏的修复是轮换，不是 \`git rm\`——历史里还在。许可证策略提前定：GPL 进主依赖要有法务例外，不要在发布当天才发现。

### 八、发布列车与功能开关的配合

主干持续集成不等于每次 commit 都对用户可见。列车模型：制品按日或按迭代晋级，功能用开关切。这样回滚常常是关开关，而不是倒二进制——前提是 schema 兼容。开关配置本身也是发布：改了默认值要走同样审批。记录「谁在何时对哪批租户打开」，出事故才找得到人。

Conventional Commits 配合 \`feat!\` / \`BREAKING CHANGE\` 脚注，让 CI 能拒绝「偷偷改了公共契约却标成 chore」。服务 API 没有 semver 数字时，用变更日志的破坏性一节代替。标签与制品名、\`InformationalVersion\` 三者必须能对上，否则 SBOM 只是孤儿文件。

供应链攻击面还包括 GitHub Action 的第三方 action。钉到 commit SHA 而不是浮动 tag，定期用 Dependabot 升级。\`permissions: contents: read\` 是默认，需要写 issue 或推镜像再逐项加，用完在 job 级关闭。

### 生产检查

1. CI 是否锁定 SDK 与 restore，门禁失败能否挡住合并？
2. 云访问是否 OIDC 短时令牌，生产环境是否有保护规则与人工审批？
3. 是否 build once、带 SBOM 与签名、按策略保留制品？
4. 提交信息是否约定，发布说明是否覆盖破坏性变更？
5. 功能开关是否与本次发布清单一致，并写了关闭条件？
6. 回滚步骤是否包含数据，而不是只 \`kubectl rollout undo\`？
7. 扫描例外是否有主人和到期日？
8. 第三方 Action 是否钉 SHA？生产角色是否按环境隔离？
`,
    code: `// 将提交信息注入程序集后，可在 /version 或启动日志中暴露。
// 该对象应与 SBOM、镜像标签是同一 commit，禁止生产现场再编译一份。
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

单体跨进程后，函数调用变成了可能超时、重复、乱序和部分成功的网络调用。分布式不是「把类变成 HTTP」，而是承认你再也没有一个自动回滚一切的本地事务。

### 一、必须接受的事实

- 网络延迟不为零，调用可能「服务端成功但客户端没收到响应」。
- 时钟会漂移，不能用本地时间推断全局严格顺序。
- 消息可能重复或乱序。
- 服务、数据库和消息系统不可能靠普通 try/catch 组成原子事务。

### 二、CAP 在实践里怎么用

教科书：分区发生时，只能在一致性（C）和可用性（A）之间选。实践里更有用的说法是：

| 决策 | 你实际在选 | 例子 |
| --- | --- | --- |
| 分区时拒绝写入 | 偏 CP | 库存扣减必须看本分区主库 |
| 分区时先记账后对账 | 偏 AP | 购物车、点赞、分析事件 |
| 多数时候两者都要 | 「日常 CA，分区降级」 | 单区部署其实没经历分区 |

不要把 CAP 当选型口号。先问：**用户在分区窗口看到旧数据，可不可以？写失败是否可接受？** 库存、资金通常不能「先成功再改」；Feed、搜索可以。同一产品里不同用例可以不同：下单 CP，推荐 AP。多活多区还要加上延迟和法定人数（quorum）——那是 PACELC：没分区时你在延迟和一致之间再选一次。

### 三、双写问题与 Outbox / Inbox

**双写**：一次业务既 \`SaveChanges\` 又 \`Publish\`。进程在两者之间崩溃，就会出现「库有单、消息没有」或反过来。try/catch 补发解决不了「消息已发出、库回滚」的窗口。

**Outbox**：业务行和 outbox 行同一数据库事务提交；后台转发器读 outbox、发消息、标记完成。发布仍是至少一次，所以消息必须带稳定 ID。

**Inbox**：消费者把消息 ID 插入带唯一约束的 inbox，再做业务；重复投递撞约束则直接 ack。Inbox 记录要带 TTL（见后）。

两边是一对。只做 Outbox，消费者仍可能处理两次；只做 Inbox，生产者仍可能漏发。

### 四、Saga：编排 vs 协同

跨服务长过程用 saga / 补偿，不伪装成两阶段提交。

| | 编排（orchestration） | 协同（choreography） |
| --- | --- | --- |
| 谁持有流程 | 一个编排者服务发命令、等回复 | 各服务订事件、自己决定下一步 |
| 可见性 | 流程集中，好画状态机 | 流程散落，要靠追踪拼 |
| 耦合 | 编排者认识所有步骤 | 服务认识事件契约 |
| 适合 | 明确的多步下单/开户 | 松散通知、可插拔反应 |

补偿不是自动回滚：钱已经打给渠道就要走退款，库存已扣要回补，邮件已发只能发更正。补偿也要幂等。编排者自身状态必须持久化，崩溃后能从「已付未配」恢复，而不是重头再付一次。

### 五、时钟偏差与时间类型

两台机器的 \`DateTime.UtcNow\` 可以差几百毫秒到数秒。不要用「A 的时间戳 < B 的时间戳」当因果：用因果关系（回复带上请求 ID）、版本向量或数据库 merkle/LSN。\`order by CreatedAt\` 在多写入者下会抖。

业务时间使用 \`DateTimeOffset\` 或 Noda Time 的明确时区类型；存储通常统一 UTC。日历规则（当地午夜、夏令时、节假日）不能只用 \`TimeSpan\`。测试通过 \`TimeProvider\` 注入时间。过期判断加宽限（clock skew allowance），认证库对 JWT \`nbf\`/\`exp\` 的几分钟偏差就是这个原因。

### 六、唯一 ID：GUID、ULID、UUID v7

| 方案 | 特点 | 注意 |
| --- | --- | --- |
| \`Guid.NewGuid()\`（v4） | 简单、碰撞极低 | 作主键时索引随机写入，页分裂 |
| UUID v7 / ULID | 时间有序 + 随机，利于 B 树 | 仍可被粗略推断生成时间 |
| 雪花 ID | 有序、短 | 依赖机器时钟与节点编号，要防回拨 |
| 数据库序列 | 最紧凑 | 暴露业务量，跨库难 |

随机 GUID 简单可靠；高写入数据库可评估有序 ID（.NET 9+ 有 \`Guid.CreateVersion7()\`，旧 TFM 用库）。不要从 ID 暴露业务数量或安全边界。全局唯一不等于不可猜测授权——知道 UUID 仍必须过授权。ULID 字符串可排序，当主键或排序键时比 v4 友好。生成必须在一处约定，避免有的服务用 v4、有的用自增导致合并困难。

### 七、幂等 TTL 与设计方法

- 每个调用有 deadline，并把剩余预算向下游传播。
- 命令携带幂等键，服务端保存处理结果或去重记录。
- 事件携带唯一 ID、版本、发生时间；消费者按 ID 幂等。
- 用 saga/补偿处理跨服务长事务。
- 避免同步调用链过长；明确故障域和降级语义。

**幂等记录 TTL**：inbox / 幂等表不能永存。TTL 必须 **大于** 生产者与中间件的最大重试窗口（含死信回放、人工重放）。24h 键、客户端却在 3 天后重试，会第二次扣款。清理任务按 \`created_at\` 批删；热键用 Redis SET NX EX。返回第一次的响应时，校验请求指纹，防止同键不同体。

### 八、多租户

租户标识来自可信认证上下文，而不是任意请求字段。查询、缓存、消息、日志和对象存储键都必须隔离租户。数据库层可增加 row-level security 等纵深防御。消息上的 \`tenantId\` 只是冗余校验，不能替代令牌里的租户。

### 常见陷阱

- 「我们有消息队列所以是最终一致」——没有 Outbox，那是偶然一致。
- 协同 saga 用了 12 个事件却没有任何超时/补偿，流程卡在中间态没人知道。
- 用本地时间生成雪花 ID，夏令时或 NTP 回拨造成重复。
- 幂等表每周全量清空，正好赶上渠道对账重放。

### 九、同步调用链与故障域

五个服务同步串起来，可用性按乘法塌缩：每个 99.9% 会变成约 99.5%。更糟的是尾延迟叠加。能异步的步骤（发邮件、重建读模型、通知搜索）走 Outbox，不要放进下单的关键路径。必须同步的（扣库存、创建支付意图）要设明确超时和补偿入口。画一张「若支付成功而本服务崩溃」的序列图，补不上的空就是事故雏形。

故障域按「一起挂用户能感知什么」切，而不是按仓库数切。共享数据库的两个「微服务」仍是一个故障域。共享 Redis 当主存储也是。真正隔离要有独立存储、独立配额、独立发布。

### 十、消息顺序、重复与版本

同一分区内 broker 通常保序，跨分区不保。不要在消费者里用「先到的是创建、后到的是更新」这种假设——重放会打破它。事件带 \`schemaVersion\` 和发生时间；消费者按版本分支，未知版本进 DLQ 而不是丢字段继续。兼容策略与 HTTP API 一样：只加可选字段，删除走新版本。

重复投递不是异常，是日常。Inbox 唯一键、渠道回调的通知 ID、Idempotency-Key 是三件不同的外套，罩的是同一需求：副作用最多发生一次。TTL 清理必须留下审计，或把已处理键归档，满足对账。

时钟偏差会让「先创建后取消」的两个事件按 \`occurredAt\` 排反。因此取消必须带上被取消对象的版本或 ETag，而不是只比较时间戳。UUID v7 / ULID 的时间分量可用于近似排序和索引局部性，不能当因果。

### 生产检查

1. 每个跨系统写路径是否避免双写（Outbox），消费是否有 Inbox？
2. 分区时该用例选 CP 还是 AP，产品是否同意？
3. 长过程是编排还是协同？补偿是否幂等、状态是否可恢复？
4. 是否避免用墙上时钟当全局顺序？过期是否留 skew？
5. ID 策略是否统一，主键是否考虑写入局部性，且不当授权令牌？
6. 幂等 TTL 是否覆盖最坏重放窗口，并校验请求指纹？
7. 租户边界是否从令牌走到查询、缓存和消息？
8. 同步链是否足够短？未知事件版本是否进 DLQ？

编排 saga 的状态机请显式列出：已创建、已预留库存、已付款、已发货、已补偿。每个状态只允许若干命令，非法迁移要记审计而不是静默忽略。协同 saga 至少要有一处「超时守望」——定时扫描卡在中间态的流程并告警，否则事件一丢就永不相见。补偿失败本身也是事故：退款渠道 500 时要进待办，而不是假装库存回补即闭环。

Inbox 去重键建议用「消费者组 + 消息 ID」，同一事件被两个不同消费者（邮件、积分）处理是合法的，不要用全局一个 ID 互斥。Outbox 转发器要记录尝试次数和最后错误，便于和 DLQ 对账。幂等键、inbox 行、outbox 行的保留期写进运维文档，和备份恢复演练一起做。
`,
    code: `// 幂等命令：相同 key 返回第一次的结果。生产还要存请求指纹与 TTL。
// 这是 Inbox / Idempotency-Key 的内存版，不能替代跨进程存储。
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
    title: '生产就绪清单：阶段体检',
    content: `## 第九十二章　生产就绪清单：阶段体检

教程能提供知识地图，不能保证任何人「学完就不会出问题」。生产能力来自持续编码、评审、测试、发布和事故复盘。请用下面的阶段项目检查第十四部分的关键路径；它是评分尺，不是最终毕业答辩。第一百一十六章会启动真实订单系统，读完第二十一部分后才做最终答辩。

### 一、阶段项目：订单 API

实现一个订单 API，范围宁可窄而完整，不要宽而只剩 CRUD：

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

允许模拟支付渠道，但模拟必须有延迟、故障和重复回调，而不是永远 200。不允许「内存字典当数据库」充当最终提交——那测不到迁移和并发。

### 二、评分量规（建议满分 100）

| 维度 | 分 | 「及格」 | 「优秀」 |
| --- | --- | --- | --- |
| 契约与校验 | 10 | 有 DTO、400 有字段错误 | RFC 9457 + 稳定业务码 + OpenAPI 与实现一致 |
| 身份与授权 | 15 | 能验证 JWT | 资源级授权 + 租户隔离 + 测了越权 |
| 数据与并发 | 15 | CRUD + 迁移 | 乐观并发、投影查询、无 N+1 |
| 消息与幂等 | 15 | 能发一条消息 | Outbox + Inbox + 幂等键指纹 + 重复投递测试 |
| 韧性 | 10 | HttpClient 有超时 | 标准 resilience、预算分层、依赖故障测试 |
| 可观测 | 10 | 有日志 | 结构化日志 + 指标低基数 + 追踪能串起来 |
| 测试 | 15 | 有若干单元测试 | Factory + Testcontainers + 无 flaky |
| 交付 | 10 | 有 Dockerfile | 非 root、先拷 csproj、CI、回滚文书 |

低于 70 分不要自称「生产就绪」。缺「消息与幂等」或「身份」其中一整块，直接不及格——这是本教程后半部分的核心，不是加分项。

### 三、何谓 Done

功能能点不算 Done。一条用户故事 Done 至少包括：

1. 代码在主分支，CI 绿，警告当错误。
2. 迁移可在空库重放，expand/contract 已写（若有破坏性结构）。
3. 自动化测试覆盖成功路径、校验失败、冲突、未授权、重复提交。
4. OpenAPI / README 描述了状态码和幂等头。
5. 日志能用一个 \`traceId\` 查出一次失败下单。
6. 回滚或降级步骤写在仓库里，而不是只在你脑子里。
7. 密钥不在仓库，本地用 User Secrets / \`.env\`（被 gitignore）。

「Demo 当天能跑」是里程碑，不是 Done。课程结束仍把连接串写在 \`appsettings.json\` 里，按未完成计。

### 四、验收测试（人工 + 自动）

把下面当作发布前必过清单，写成 xUnit 或脚本都行：

1. 未带令牌调用写接口 → 401；带 A 租户令牌读 B 租户订单 → 404 或 403（与安全方案一致）。
2. 非法金额 → 400 Problem Details，\`errors.amount\` 存在。
3. 同一 \`Idempotency-Key\` + 同一正文提交两次 → 同一订单 ID；换金额复用该键 → 409。
4. 库存并发：两个请求各扣到边界，一个成功一个 409，库存不为负。
5. 杀掉进程发生在 \`SaveChanges\` 之后、消息发出之前（可用测试钩子）→ 重启后 Outbox 补发，消费者不产生两份副作用。
6. 支付模拟返回 503 → 客户端看到明确错误或异步 202，重试不制造双订单。
7. \`GET /health/live\` 在数据库暂停时仍 200；\`/health/ready\` 可失败。
8. 容器以非 root 运行；对进程发 SIGTERM，在途请求完成或在宽限内 499/连接关闭，消费者不丢「已 ack 未处理」。
9. CI 对漏洞依赖或格式破坏必须红。
10. 追踪：一次下单在后端能看到 API span + DB span + 出站 HTTP span，同一 \`traceId\`。

少任何一条，就还有作业。

### 五、四周节奏（可压缩为两周全职）

**第 1 周：边界与数据。** 建 sln、\`global.json\`、CPM、可空与警告。切开 Domain / Application / Infrastructure / Host（或模块目录）。订单/库存实体、值对象、EF 映射、第一次迁移。单元测试钉住「不能超卖」规则。还不要上微服务。

**第 2 周：HTTP 契约与安全。** Minimal API、验证、Problem Details、分页。接入开发用 IdP 或测试密钥的 JWT。资源授权。Idempotency-Key 存储。\`WebApplicationFactory\` 覆盖 401/400/201。

**第 3 周：副作用与韧性。** Outbox 表 + Worker。模拟库存/支付的 HttpClient + 标准 resilience。消费者 Inbox。集成测试用 Testcontainers。补 OpenTelemetry 与三条探针。

**第 4 周：交付与演练。** 多阶段 Dockerfile（先 csproj）、非 root、只读根（能到哪算哪）。GitHub Actions：restore 锁定、测试、发布制品。写回滚与迁移说明。按第 4 节验收清单做故障注入：超时、重复消息、冲突、SIGTERM。根据证据修，再跑一遍清单。

每周结束应有可演示增量，而不是第四周才第一次 \`dotnet run\`。若只有两周：合并 1+2、3+4，删掉非必要读模型，但不要删幂等和授权。

### 六、学生项目常见失败模式

1. **大而空**：做了用户/商品/订单/优惠券/后台，每一块都是无校验 CRUD。评委只能打「会脚手架」。
2. **假分层**：四个项目里 Domain 引用 EF Core，Controller 直接 \`DbContext\`。
3. **假安全**：Startup 里 \`AllowAnonymous\` 或硬编码角色字符串，测试从未尝试越权。
4. **假异步**：\`Task.Run\` 在 API 里发邮件，进程一关就丢，还声称「已上队列」。
5. **假测试**：全是 Mock，绿得发光，上真实 SQL 立刻炸。或测试依赖执行顺序。
6. **不可复现**：没有 \`global.json\`、没有锁文件、README 写「在我机器可以」。
7. **密钥进仓 / 镜像**：连接串提交了；Dockerfile \`COPY .env\`。
8. **一次迁到微服务**：三个空仓库靠同步 HTTP 串起来，没有 Outbox，本地都跑不齐。
9. **文档与实现分叉**：OpenAPI 仍是模板天气接口。
10. **不演练停机与重复**：只测了快乐路径，第一次生产重试就双下单。

看见自己在其中两项以上，停功能、补根基。阶段项目的价值是**完整的一条生产路径**，不是功能清单竞赛。

### 七、代码评审清单

- 输入是否可信？授权是否在服务端按资源检查？
- 可空、异常、取消和超时语义是否明确？
- 是否存在同步阻塞异步、无界并发或无界缓存/队列？
- DbContext 是否跨线程或跨 scope 使用？
- SQL、日志、指标标签是否可能泄密或高基数？
- 重试的操作是否幂等？总时间预算是多少？
- 新旧版本和数据库 schema 能否在部署窗口共存？

### 八、运行清单

- SLO、告警和 dashboard 是否围绕用户影响？
- runbook 是否说明诊断、降级和恢复步骤？
- secret、证书、依赖和基础镜像能否轮换升级？
- 备份是否实际做过恢复演练？
- 容量、峰值、依赖故障和优雅停机是否压测？
- 谁值班、谁能回滚、谁负责数据修复？

### 九、学习路线

1. 完成本教程所有基础 demo。
2. 独立完成本章阶段项目，不复制模拟容器当「最终架构」。
3. 请同伴按评分量规做安全、数据和可运维性评审。
4. 部署到测试环境，注入超时、重复消息、数据库冲突和 SIGTERM。
5. 根据观测证据修复，再进入第一百一十六章的长期订单项目。

做到这些，你才从「会写 C#」迈向「能负责 C# 生产服务」。
`,
    code: `// 发布门禁：任一 BLOCK 都不能靠「演示能跑」蒙混。
// 对照正文评分量规，rollback 未演练就是未完成。
var checks = new[]
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
