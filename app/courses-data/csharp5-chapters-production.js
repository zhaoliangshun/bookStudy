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

### 这本书的定位

《C# 从零基础到生产上线（2026 完整版）》不是又一本语法词典，也不是框架功能说明书。它要解决的是一条真实职业路径：**从能写出可运行的 C#，到能在团队里对一个服务的正确性、安全、容量、发布和事故负责。**

许多教程在 Hello World、语法和简单 CRUD 处结束。生产里真正消耗时间的是并发冲突、部分失败、权限绕过、数据不一致、密钥泄露、错误预算耗尽、回滚失败和“备份无法恢复”。本教程把语言、应用、分布式、云原生和运维放进同一条连续路线，并要求你把知识合并进一个长期项目，而不是收藏 136 个互不相干的示例仓库。

全书共 **138 篇：前言 + 136 讲 + 结语**。正文标题在「数组」之后采用 **标题章号 = 数据 id + 1** 的编号（例如 \`csharp5-ch92\` 的标题是第九十三章）。这是历史插入数组专章后的刻意偏移，目录、交叉引用和毕业项目都按标题章号说话。

### 2026 版本基线

| 用途 | 版本 | 说明 |
| --- | --- | --- |
| 生产基线 | **.NET 10 LTS / C# 14** | 2026 年新系统应以此规划，并持续打补丁 |
| 在线主 demo | **net8.0 / C# 12** | 当前运行器安装 .NET 8 SDK；ImplicitUsings + Nullable |
| 专属新 API | C# 13/14、.NET 10、ASP.NET / EF 新表面 | 正文代码块会标注版本与 NuGet，不混进主 demo |
| 支持窗口 | .NET 8 于 **2026-11-10** 结束支持（.NET 9 已于 2026-05 结束） | 学习可用旧 SDK，生产不可假装“还能再拖一年” |

主 demo 必须是单个 \`Program.cs\`，不引用需要额外 NuGet 的 ASP.NET Host、EF Provider、Redis 客户端等。涉及真实框架的片段，请在本机或 CI 的真实项目里验证。章末 demo 用纯 C# **模拟语义**（中间件顺序、Inbox 去重、错误预算、预签名校验），这不等于“已经会用 ASP.NET / Redis / Kubernetes”。

### 完整 138 篇地图（前言 + 136 讲 + 结语）

下面按 **21 个部分** 列出全部讲次。括号内是数据 id；标题章号在数组章之后比 id 大 1。

| 部分 | 标题范围 | 数据 id | 内容 |
| --- | --- | --- | --- |
| 开篇 | 前言 | preface | 定位、基线、地图、学法、毕业标准 |
| 一 入门基础 | 第一～五章 | ch01–ch05 | .NET/C# 总览、环境、第一个程序、顶级语句、控制台 IO |
| 二 核心语法 | 第六～十八章 | ch06–ch11、arrays、ch12–ch17 | 变量、类型、值/引用、运算符、字符串、格式化、**第十二章数组**、控制流、枚举、元组、模式匹配、可空值/引用 |
| 三 面向对象 | 第十九～二十八章 | ch18–ch27 | 类、字段属性、方法、构造/析构、静态、继承、多态、抽象/接口、密封/扩展、命名空间 |
| 四 泛型与集合 | 第二十九～三十五章 | ch28–ch34 | 泛型、IEnumerable、List/LinkedList、Dictionary/HashSet、Queue/Stack、有序集合、并发集合 |
| 五 委托事件 Lambda | 第三十六～四十章 | ch35–ch39 | 委托、Lambda、事件、表达式树、函数式基础 |
| 六 LINQ | 第四十一～四十五章 | ch40–ch44 | 基础、过滤投影、排序分组、聚合统计、转换与立即执行 |
| 七 异步与并发 | 第四十六～五十一章 | ch45–ch50 | async/await、Task 并行、取消异常、同步原语、IAsyncEnumerable/Channel、线程池 |
| 八 文件 IO 与序列化 | 第五十二～五十六章 | ch51–ch55 | 文件目录、流、JSON、XML/CSV、管道与高性能 IO |
| 九 反射与特性 | 第五十七～六十章 | ch56–ch59 | 反射基础/高级、Attribute、源生成器入门 |
| 十 异常与调试 | 第六十一～六十四章 | ch60–ch63 | 异常、策略、调试、日志诊断 |
| 十一 内存与性能 | 第六十五～六十九章 | ch64–ch68 | GC、IDisposable、Span/Memory、ref struct、优化技巧 |
| 十二 网络编程 | 第七十～七十三章 | ch69–ch72 | HttpClient、Socket/TCP、UDP/IPC、WebSocket 与 gRPC 简介 |
| 十三 工程化实战 | 第七十四～七十八章 | ch73–ch77 | DI/配置、单元测试、ASP.NET 简介、EF 入门、综合项目 |
| 十四 现代 C# 与生产工程 | 第七十九～九十二章 | ch78–ch91 | SDK/NuGet、C# 13/14、SOLID、Web API、认证、EF 生产、韧性、后台消息、可观测性、测试策略、容器、CI/CD、分布式基本功、生产清单 |
| 十五 团队工程与高级语言 | 第九十三～九十六章 | ch92–ch95 | Git/评审、高级类型与泛型数学、时间全球化正则、Native Interop |
| 十六 数据与分布式系统 | 第九十七～一百零二章 | ch96–ch101 | 关系库设计、ADO/Dapper、Redis、消息/Saga、gRPC/SignalR/GraphQL、对象存储与搜索 |
| 十七 云原生、交付与可靠性 | 第一百零三～一百零八章 | ch102–ch107 | 配置/Flag、K8s、IaC、基准容量、SLO/事故、备份灾备 |
| 十八 平台拓展与毕业实战 | 第一百零九～一百一十六章 | ch108–ch115 | 类库/NuGet、ASP.NET 管道、OpenAPI、OAuth/BFF、EF 建模、WAF/Testcontainers、Native AOT、**订单系统项目启动** |
| 十九 安全、文本与性能专题 | 第一百一十七～一百二十一章 | ch116–ch120 | 加密、编码本地化、PLINQ、不可变集合/对象池、二进制协议 |
| 二十 生态拓展与语言演进 | 第一百二十二～一百二十六章 | ch121–ch125 | 插件隔离、客户端 UI 全景、AI 集成、语言版本演进、遗留现代化 |
| 二十一 生产深水区 | 第一百二十七～一百三十六章 | ch126–ch135 | 输入验证、幂等分页、CORS/上传、Host/DI、HybridCache、健康检查、Aspire、多租户、取消、审计 |
| 结尾 | 结语 | conclusion | 按部分回顾、90 天计划、习惯、教程给不了的东西 |

第十四部分的「第九十二章 生产就绪清单」是阶段体检；第十八部分的「第一百一十六章」启动必须使用**真实**数据库、认证、容器和流水线的长期订单项目。继续读完第十九～二十一部分，把加密、多租户、取消与审计要求补进项目后，才进行最终答辩。

### 读者与约定

- **读者**：有编程常识、愿意把 C# 当主语言做到能独立负责服务的人；也适合从其他语言转入 .NET 的工程师补齐生产缺口。
- **不默认你会 ASP.NET / K8s**：前面章节从零讲起；后面章节假设你已掌握前置 C# 语法和基本 HTTP。
- **表格**给出对比和决策，**带标签的代码围栏**给出可抄片段，**陷阱**写“看起来对、上线会炸”的点，**清单**用于自检。
- 每章主 demo 和显式标成 \`csharp-run\` 的完整正文示例可直接点「运行」；普通 \`csharp\` / \`csharp-snippet\` 是项目级片段，不显示运行按钮。涉及 ASP.NET、EF、Aspire 或 NuGet 的片段必须放进对应真实项目验证。
- 安全示例会演示校验、去重、分桶，**不会**提供利用漏洞或绕过授权的步骤。

### 怎么学

1. **先概念，再改 demo，再默写。** 只看不写等于没学。把每章主 demo 改坏、再修回来。
2. **一个长期项目吃掉所有部分。** 建议从第十三部分起就固定「商店订单」仓库，后续每部分往里加迁移、Outbox、缓存、探针、SLO，而不是新建 20 个玩具。
3. **区分模拟与真实。** 纯 C# 模拟帮助你在浏览器里理解顺序、幂等、预算；PostgreSQL、Redis、Kafka、Ingress、Key Vault 必须在真实进程里跑过，才算会。
4. **用证据说话。** “更快”要有基准或负载曲线；“更安全”要有威胁模型和测试；“会重试”要有幂等与超时证明。
5. **小批量合并。** 按第九十三章的 Git 纪律提交；高风险变更带 flag 和回滚步骤。

### 最终毕业标准（先看终点）

从第一百一十六章启动订单项目、并读完第一百三十六章后，你必须能指向一个真实仓库并证明：

- 数据库迁移可审查、可回滚或 expand/contract，并在容器里用生产 Provider 测过。
- 认证授权在服务端强制；租户隔离有测试，而不是只靠前端藏按钮。
- 创建订单有 Idempotency-Key；库存有并发控制；业务事务与 Outbox 原子提交。
- 缓存故障可降级；消息至少一次投递可去重；下游超时有 deadline。
- 有 OpenTelemetry、探针、告警、runbook；做过灰度、回滚和备份恢复演练。
- 故障注入清单（重复请求、死锁、Redis 宕机、毒消息、SIGTERM）有自动测试或演练记录。

达不到以上标准，就还在“会写代码”；达到了，才开始“能负责生产系统”。结语会给出毕业后的 90 天计划——教程结束不是能力结束。`,
  code: `// ============================================================
// 前言主 demo：生产能力必须拆成可打勾的检查项。
// “我会 C#”不够；安全、密钥、告警、回滚没证据，就还在学习阶段。
// 后面各章都用同样的思路：能证明，才算掌握。
// ============================================================

var capabilities = new[]
{
    new Capability("语言与类型系统", true),
    new Capability("自动化测试", true),
    new Capability("安全与密钥管理", false), // 常见缺口：demo 能跑，密钥仍写在配置文件
    new Capability("监控、告警与回滚", false),
};

foreach (var item in capabilities)
{
    string state = item.Completed ? "已掌握" : "待学习";
    Console.WriteLine($"[{state}] {item.Name}");
}

// static lambda：不捕获外部变量，避免编译器生成闭包对象
int completed = capabilities.Count(static item => item.Completed);
Console.WriteLine($"当前进度：{completed}/{capabilities.Length}");

// record：不可变数据载体；生产里检查项还应带证据链接（测试名、演练日期）
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

生产代码是团队长期维护的资产。版本控制不是“会 \`git commit\`”就结束，而是让每条变更**小、可审查、可回退、可定位**。一次把格式化、重构、功能、迁移混在同一个 PR 里，评审只能变成“看起来没问题”。

### 一、Trunk-based 与 Git Flow

| 策略 | 主干 | 发布 | 适合 | 代价 |
| --- | --- | --- | --- | --- |
| **Trunk-based** | \`main\` 始终可发布 | 短命功能分支（小时～几天）+ feature flag | 持续交付、多人小步合并 | 必须有测试门禁和 flag 纪律 |
| **Git Flow** | \`develop\` + \`main\` + \`release/*\` + \`hotfix/*\` | 按版本火车发布 | 强版本号、多产品线并行 | 分支寿命长，合并冲突和“已合 develop 未上生产”漂移 |

2026 年大多数互联网/SaaS 服务应默认 **trunk-based**：\`main\` 受保护，功能分支当天或隔天合入，用 flag 关闭未完成行为。Git Flow 不是错误，但若你的发布周期已经是每天多次，它会制造虚假安全感。无论哪种，团队必须写进 \`CONTRIBUTING.md\`，禁止每人一套习惯。

推荐的日常命令：

\`\`\`bash
git switch -c feat/order-idempotency
git add src tests
git commit -m "feat: make order creation idempotent"
git fetch origin
git rebase origin/main
git push -u origin feat/order-idempotency
\`\`\`

- 一个提交表达一个完整意图；不要顺手格式化全仓库。
- \`merge --no-ff\`、squash、rebase 都可以，但 **历史策略要统一**，并保证 bisect 仍能定位回归。
- 受保护分支：必过 CI、必过安全扫描、必过规定人数的评审，禁止管理员随手 force-push。

### 二、Conventional Commits 与 PR 模板

提交标题用约定式提交，机器和人都能读：

\`\`\`text
feat(orders): add Idempotency-Key on POST /orders
fix(cache): jitter TTL to reduce stampede
docs(runbook): add Redis failover steps
chore(ci): require CODEOWNERS review on /infra
\`\`\`

类型常用 \`feat\` / \`fix\` / \`docs\` / \`refactor\` / \`test\` / \`chore\` / \`perf\` / \`revert\`。破坏性变更在 footer 写 \`BREAKING CHANGE:\`，并在 OpenAPI/迁移里同步。PR 模板至少包含：动机、行为变化、测试证据、回滚步骤、风险（数据/安全/性能）、关联 issue。没有回滚说明的数据库 PR，默认不合并。

### 三、CODEOWNERS、必需评审与签名

\`CODEOWNERS\` 把目录映射到责任人：\`/src/Shop.Domain/\` 给领域组，\`/infra/\` 给平台组，\`/.github/workflows/\` 给安全/CI 组。GitHub/Azure DevOps 的 required review 应要求 **owner 批准**，而不是任意同事点个赞。高风险路径（认证、支付、IaC、密钥工作流）建议两人，且作者不能自批。

签名提交（SSH 或 GPG signed commits）用于证明“这个提交来自声明的身份”，配合 branch protection 的 “Require signed commits”。它防的是伪造作者，不是防错误逻辑。密钥要进硬件或系统钥匙串，不要把私钥检进仓库。

### 四、评审关注顺序

1. 需求和行为是否正确，边界与失败路径是否写了。
2. 授权、租户隔离、注入、数据损坏、并发。
3. API / 数据库 / 消息契约是否兼容，能否滚动发布与回滚。
4. 测试是否**证明**关键行为，而不是只提高覆盖率数字。
5. 可读性、命名、重复、明显的性能陷阱。

不要把评审变成空格战争。也不要用“LGTM”代替风险分析。作为作者，PR 描述应自己先列出已知风险；作为评审者，你对放行的缺陷负有共同责任。

### 五、.gitignore、大文件、revert 与 reset

.NET 仓库的 \`.gitignore\` 至少排除：\`bin/\` \`obj/\` \`*.user\` \`.vs/\` \`TestResults/\` 覆盖率产物、本地 \`appsettings.*.local.json\`、用户密钥、dump、日志。用 \`dotnet new gitignore\` 做起点，再按团队补。

大文件（安装包、录屏、数据库备份、\`node_modules\` 误提交）会永久膨胀克隆。Git LFS 只是把指针放进 Git、把内容放进 LFS 存储，仍然要有配额和清理策略。二进制资源优先放对象存储，仓库只留 key。

| 操作 | 作用 | 何时用 | 危险 |
| --- | --- | --- | --- |
| \`git revert <sha>\` | 新增一个反向提交 | **已推送**的历史 | 低；保留审计 |
| \`git reset --soft\` | 移动 HEAD，保留暂存 | 整理未推送提交 | 中 |
| \`git reset --hard\` | 丢弃工作区 | 确认可丢的本地实验 | 高；已推送禁止 |
| \`git push --force-with-lease\` | 覆盖远程分支 | 仅自己的功能分支 | 高；禁止对 \`main\` |

定位回归用 \`git bisect\`：标记好/坏提交，配合 \`dotnet test\` 自动脚本，通常十几步就能钉到引入提交。这比在聊天里猜“是不是上周那次重构”可靠得多。

### 六、密钥一旦进仓库

删除文件再提交 **不够**。必须：立即吊销/轮换；从所有 fork 和 CI 缓存假设已泄露；按组织流程清历史（\`git filter-repo\` 等）并强制协调重克隆。预防靠 secret scanning、pre-commit 钩子和禁止把 \`*.pfx\` / 连接字符串放进示例。

### 七、Definition of Done

代码、测试、迁移、文档、监控、发布与回滚方案都完成，才能叫完成。高风险变更还要有 feature flag、演练记录和 \`CODEOWNERS\` 批准。清单：

- [ ] 提交信息符合约定，PR 模板填完
- [ ] CI、安全扫描、必需评审通过
- [ ] 无密钥、无构建产物、无不可追踪大文件
- [ ] 回滚步骤可执行（revert 或 flag 关闭）
- [ ] 需要时已做 bisect 友好的小步提交

### 八、生产里真正拖慢交付的 Git 问题

团队卡在 Git 上，很少是因为“不会 rebase”，而是因为历史没法讲故事。一个持续三周的 \`feat/new-checkout\` 里塞了 80 个提交、三次格式化全仓库、两次“临时提交”，评审者只能放弃逐提交阅读，改看最终 diff——于是回归只能靠运气。**把分支寿命当成 SLO**：超过两个工作日未合入，就要拆 flag 或拆 PR。

\`git blame\` 和 \`git log -L\` 只在提交足够小的时候有用。你要查“谁把金额改成 double”，如果那次提交还改了 40 个文件的 using，blame 会指向“格式化机器人”。约定：自动格式化只在独立 chore 提交，且最好由 CI 的 \`dotnet format --verify-no-changes\` 门禁保证，而不是人肉在功能分支里救火。

冲突解决是高风险操作。合并 \`csproj\`、迁移文件、\`PublicAPI.Shipped.txt\`、OpenAPI 快照时，**不要听 IDE 的“全部接受传入”**。两条分支若从同一模型快照各自生成 EF Core migration，迁移树已经分叉；不要保留两套再手拼快照。官方工作流是：中止合并，用版本控制移除自己尚未发布的生成迁移但保留实体改动，先合入另一条分支，再基于合并后的快照重新 \`dotnet ef migrations add\`。已进入共享环境的迁移不能这样删，只能追加修正迁移。锁文件（\`packages.lock.json\`）冲突则在确认项目引用后重新 \`dotnet restore\` 生成并审查。

标签与发布：\`v2.1.0\` 打在合并到主干且流水线变绿的提交上，不要打在功能分支尖上。发布说明从 conventional commits 生成（\`feat\`/\`fix\`/\`BREAKING CHANGE\`），避免 liberally 手写一份和 Git 对不上的“本周更新”。热修必须从发布标签拉 \`hotfix/*\`，修完立刻回到主干，否则会出现“生产已修、主干仍坏”的分叉。

最后，权限模型：能推 \`main\` 的人越少越好；机器人账号用细粒度 PAT 或 OIDC 联邦，过期日写进日历。fork 进来的 PR 默认不跑含密钥的作业。这些不是“高级 Git”，是让第九十三章的门禁在真实组织里站得住的底座。

### 练习

1. 修改主 demo：把 \`security\` 检查改成 \`CheckState.Failed\`，再新增一项 \`migrations\` 检查，观察 \`mergeable\` 如何变化；交换数组中检查的顺序，验证 \`All\` 的判定与顺序无关。
2. 脱离示例实现一个 \`MergeGate\` 类：支持按名称配置必需检查（build/tests/security 必须 Passed，review 允许 Pending），不满足时输出具体缺少哪一项，而不是笼统的 false。
3. 生产场景：给毕业项目补齐 \`CONTRIBUTING.md\`、PR 模板（动机/行为变化/测试证据/回滚步骤/风险）和 \`CODEOWNERS\`（\`/infra/\` 指向平台组）；再用 \`git bisect\` 配合 \`dotnet test\` 定位一次故意注入的回归提交，把步骤记进 runbook。
`,
    code: `// ============================================================
// 分支与评审的两道闸（纯 C# 模拟）：
//   1. 合并门禁：所有必需检查 Passed 才可合并
//   2. Conventional Commits 分类：提交类型决定流水线规模
//      （chore/docs 不必跑全量测试；feat/fix 走完整门禁）
// ============================================================

// ---------- 1. 合并门禁 ----------
// All(...) 要求每一项都是 Passed。Pending 和 Failed 一样会挡住合并——
// 「还在看」不是绿灯。真实 CI 里 required checks 就是这个语义。
var checks = new[]
{
    new PullRequestCheck("build", CheckState.Passed),
    new PullRequestCheck("tests", CheckState.Passed),
    new PullRequestCheck("security", CheckState.Passed),
    new PullRequestCheck("review", CheckState.Pending),
};

bool mergeable = checks.All(static check => check.State is CheckState.Passed);
// static lambda：不捕获外层变量，避免无意闭包；is 模式匹配比 == 更能表达「状态属于 Passed」。
foreach (var check in checks)
    Console.WriteLine($"{check.Name,-10} {check.State}");
Console.WriteLine($"允许合并：{mergeable}（review 还在 Pending，把整条 PR 挡住）");

// ---------- 2. Conventional Commits 分类门控 ----------
// 提交信息是机器可读的契约：type(scope): subject
// type 决定流水线规模与版本号走向（feat → minor，fix → patch，! → breaking → major）。
static (string Type, string Scope, bool Breaking, string Pipeline) ParseCommit(string message)
{
    // 形如 "feat(checkout)!: 支持余额合并支付" 或 "chore(deps): 升级依赖"
    var head = message.Split(':')[0];
    bool breaking = head.Contains('!');
    head = head.Replace("!", "");
    var type = head.Contains('(') ? head[..head.IndexOf('(')] : head;
    var scope = head.Contains('(') ? head[(head.IndexOf('(') + 1)..head.IndexOf(')')] : "-";
    var pipeline = type switch
    {
        "feat" or "fix"   => "完整门禁：build + 全量测试 + 契约测试 + 评审",
        "refactor"        => "build + 受影响模块测试",
        "docs"            => "文档站构建（不占测试资源）",
        "chore" or "test" => "build + 单元测试",
        _                 => "未知类型 → 默认按完整门禁跑（宁重勿漏）",
    };
    return (type, scope, breaking, pipeline);
}

var commits = new[]
{
    "feat(checkout)!: 支持余额合并支付",     // breaking！
    "fix(order): 修复金额四舍五入",           // 常规修复
    "docs(readme): 补充本地启动步骤",
    "chore(deps): 升级 NuGet 依赖",
};

Console.WriteLine();
foreach (var c in commits)
{
    var (type, scope, breaking, pipeline) = ParseCommit(c);
    Console.WriteLine($"{c}");
    Console.WriteLine($"  type={type} scope={scope} breaking={breaking}");
    Console.WriteLine($"  流水线 → {pipeline}{(breaking ? " + 版本号必须升 major" : "")}");
}
Console.WriteLine("\\n规则：feat/fix 走全量门禁；chore/docs 轻量跑——省下的是所有评审人的等待时间。");

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

类型的职责是让**非法状态难以表示**。生产模型把 \`OrderId\`、\`CustomerId\`、金额、邮箱全部写成 \`string\` / \`decimal\`，编译器就无法阻止“把客户编号传给订单仓储”。高级类型不是炫技，是把评审时靠眼睛抓的错误，提前变成编译错误。

### 一、值对象与 StronglyTypedId

- 在构造函数或工厂验证不变量：空、空白、负数、未知币种。
- \`record\` / \`readonly record struct\` 适合值相等；把 \`List<T>\` 放进 record **不会**让集合不可变。
- 金额必须是 **数量 + 币种**。\`decimal\` 适合十进制定点，但不自动给出四舍五入、银行家舍入或分位规则。
- \`StronglyTypedId\`（\`readonly record struct OrderId(Guid Value)\`）避免 \`Guid\` 满天飞。序列化、EF 转换、日志脱敏要一起设计，否则团队会因为“JSON 不好看”退回裸 Guid。

\`\`\`csharp
readonly record struct OrderId(Guid Value)
{
    public static OrderId New() => new(Guid.CreateVersion7());
    public override string ToString() => Value.ToString("N");
}
\`\`\`

\`Guid.CreateVersion7()\` 需要 .NET 9+；主 demo 若停在 net8.0，用 \`Guid.NewGuid()\` 即可，生产再换成时间有序 ID 以改善索引局部性。

### 二、泛型约束与泛型数学

约束越精确，调用方越安全。不要为了“将来可扩展”发明没有第二个消费者的超级泛型。

\`\`\`csharp
static T Max<T>(T left, T right) where T : IComparable<T>
    => left.CompareTo(right) >= 0 ? left : right;
\`\`\`

.NET 7 起，\`INumber<T>\`、\`IAdditionOperators<TSelf,TOther,TResult>\`、\`IEqualityOperators<TSelf,TOther,TResult>\` 等 static abstract 接口让算法复用于 \`int\`、\`long\`、\`decimal\`、\`BigInteger\`：

\`\`\`csharp
static T Sum<T>(ReadOnlySpan<T> values) where T : INumber<T>
{
    T total = T.Zero;
    foreach (T value in values) total += value;
    return total;
}
\`\`\`

| 接口 | 能力 | 典型用途 |
| --- | --- | --- |
| \`INumber<T>\` | 零、一、比较、四则、Parse | 通用求和/均值 |
| \`IAdditionOperators<T,T,T>\` | \`+\` | 只需要加法的累加器 |
| \`IEqualityOperators<T,T,bool>\` | \`==\` \`!=\` | 值对象与泛型集合键 |
| \`IMinMaxValue<T>\` | \`MinValue\` / \`MaxValue\` | 边界与饱和运算 |

通用算法仍必须定义：**溢出**（\`checked\` 还是饱和）、**NaN / Infinity**（浮点）、**精度与舍入**（decimal 业务）。\`INumber<float>\` 上的金额累加是错误的领域模型，不是“泛型更优雅”。

### 三、checked 数学与 Money 陷阱

默认上下文中 \`int\` 溢出是回绕。金融、库存、序号生成应显式：

- \`checked { ... }\` 或项目 \`<CheckForOverflowUnderflow>true</CheckForOverflowUnderflow>\`（热路径再局部 \`unchecked\`）。
- Money 相加必须同一币种；跨币种要走汇率服务，汇率本身有时点和价差。
- **不要**用 \`double\` 表示货币。\`0.1 + 0.2\` 的二进制误差会在对账时变成分钱级事故。
- 舍入规则写进领域（例如“单行金额四舍五入到分，税额单独算”），不要散落在 UI。
- 主 demo 的 \`Money.Create\` 拒绝负数，是教学简化；真实退款/调账需要带符号的 \`Money\` 或独立 \`Adjustment\` 类型，并在账户层保证借贷平衡。

### 四、封闭枚举、Maybe / Result

开放 \`string Status\` 会让数据库出现 \`paid\` / \`Paid\` / \`PAID \`。封闭枚举或带工厂的状态机更好：未知值在反序列化时进入 \`Unknown\` 分支，而不是抛掉整个请求或静默当默认。

\`Maybe<T>\` / \`Result<T,TError>\` 把“没有”和“失败原因”从空引用和随意抛异常里拉出来：

- 查询未命中：\`Maybe.None\`，映射 404。
- 业务拒绝：\`Result.Fail(Error.Conflict)\`，映射 409。
- 基础设施故障：仍可抛或返回 503，但不要和“订单不存在”混成同一个 \`null\`。

语言没有官方 Result，可用自定义 readonly struct，或社区库；关键是 **边界统一**，不要三层各用各的。

### 五、不可变与相等

\`IReadOnlyList<T>\` 只是只读**视图**，底层 List 仍可能被别人改。跨线程共享用 \`ImmutableArray<T>\`、\`ImmutableDictionary<TKey,TValue>\` 或复制快照。启动后不再变的查找表评估 \`FrozenDictionary<TKey,TValue>\`（.NET 8+）。实现相等时同时考虑 \`GetHashCode\`、\`IEquatable<T>\` 和 \`IEqualityOperators\`，可变字段不要参与哈希。

### 六、清单

- [ ] ID、金额、邮箱等不再是裸 \`string\` / \`Guid\` / \`decimal\`
- [ ] 泛型算法写清溢出、NaN、舍入
- [ ] Money 禁止静默跨币种运算
- [ ] 状态是封闭集合，未知值有策略
- [ ] 只读接口没有被当成深度不可变

### 七、把类型设计落到订单域

以毕业项目的订单为例，最小类型集合建议如下：\`OrderId\`、\`CustomerId\`、\`TenantId\`、\`Money\`、\`OrderStatus\`、\`Sku\`。\`Sku\` 不是自由文本：工厂拒绝空白、控制长度、规定大小写。\`OrderStatus\` 用封闭枚举或私有构造的状态对象，合法迁移写成方法（\`Pay()\`、\`Cancel()\`），而不是外部 \`status = "Paid"\`。这样第一百一十六章的状态机测试可以直接断言“已取消不能再支付”，编译器也会挡住把 \`CustomerId\` 传进 \`FindOrder\`。

泛型数学在领域层要克制。\`Sum<T> where T : INumber<T>\` 适合统计库和科学计算；订单合计应调用 \`Money.Add\`，以便币种检查和舍入规则集中在一处。如果你发现自己在写 \`where T : INumber<T>, IAdditionOperators<T,T,T>\` 来加购物车，停下来问：第二个 \`T\` 会是什么？若永远是 \`Money\`，那就不是泛型问题。

相等性是隐藏坑。\`record struct\` 默认按字段相等，但 \`Money\` 若包含已舍入的 \`decimal\` 和规范化币种，必须保证工厂是进入相等的唯一门。不要既提供 public 构造又提供 \`Create\`，否则 \`new Money(-1, "cny")\` 能绕过不变量。为 ASP.NET 绑定和 EF conversion 写专门的转换器，转换失败应变成 400 / 迁移拒绝，而不是默认 \`default(Money)\`。

\`Result<T>\` 不要变成新的异常体系：在应用边界（用例返回）使用它，在基础设施（网络超时、死锁）仍可用异常或特定错误码。全公司每个方法都返回 Result 会让调用链充满样板，和“到处 throw”一样糟。约定写进 ADR：领域规则用 Result，编程错误（空引用进了不该空的内部）仍抛。

最后，测量类型包装的成本。\`readonly record struct OrderId(Guid Value)\` 在热路径通常可接受；若剖析显示复制过多，再考虑 \`record class\` 或保持 Guid 并在 API 边界转换。过早“全部是 class 值对象”会造成 GC 压力，过早“全部是 struct”会造成意外复制。用 BenchmarkDotNet 回答具体问题，而不是用感觉选择。

### 练习

1. 修改主 demo：把 \`shipping\` 的币种改成带空格小写的 \`" usd"\`，观察 \`Money.Create\` 的 Trim 与大写规范化；再试 \`Money.Create(-5m, "cny")\` 与 \`Money.Create(99.999m, "cny")\`，确认负数被拒、金额舍入到分。
2. 独立实现 \`readonly record struct Sku\`：工厂拒绝空白、超过 16 字符以及 \`[A-Z0-9-]\` 之外的字符；再写泛型方法 \`static T Sum<T>(ReadOnlySpan<T>) where T : INumber<T>\`，分别用 int、decimal、BigInteger 调用，体会泛型数学的能力与边界。
3. 生产场景：为订单域实现封闭的 \`OrderStatus\` 状态机（Pending→Paid→Shipped/Cancelled，\`Pay()\`/\`Cancel()\` 拒绝非法迁移），查询未命中返回 \`Maybe<T>\`、业务拒绝返回 \`Result<T,TError>\`；用单元测试断言“已取消不能再支付”，并在 ADR 里约定哪些规则用 Result、哪些编程错误仍抛异常。
`,
    code: `// ============================================================
// 值对象 Money：工厂是唯一入口，禁止 new Money(-1, "cny") 绕过不变量。
// decimal 表示金额；double 的 0.1+0.2 误差会在对账时变成事故。
// readonly record struct：按值复制、按字段相等，适合小而不变的领域类型。
// ============================================================

var price = Money.Create(99.90m, "cny");   // 小写币种会规范化成 CNY
var shipping = Money.Create(10m, "CNY");
Console.WriteLine(price.Add(shipping));    // 同币种才能加

try
{
    // 跨币种必须走汇率服务，不能静默相加
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
    // 私有构造：外部只能走 Create，保证舍入和币种规范化
    private Money(decimal amount, string currency) =>
        (Amount, Currency) = (amount, currency);

    public static Money Create(decimal amount, string currency)
    {
        if (amount < 0) throw new ArgumentOutOfRangeException(nameof(amount));
        if (string.IsNullOrWhiteSpace(currency)) throw new ArgumentException("币种不能为空");
        // 教学简化：拒绝负数。真实退款应使用带符号的 Adjustment，而不是绕过工厂。
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

时间与文本是上线后最常爆炸的两类“看起来简单”的问题：夏令时跳变、跨时区账单、土耳其语把 \`I\` 变成 \`ı\`、表情符号把 \`Length\` 数错、以及灾难性正则回溯把 CPU 打满。本章把它们收成可测试的规则。

### 一、DateTime、DateTimeOffset、DateOnly、TimeOnly

| 类型 | 表示 | 适合 | 不适合 |
| --- | --- | --- | --- |
| \`DateTime\` (\`Utc\`) | 时刻，Kind=Utc | 遗留代码、内部计算 | 带偏移的对外契约（Kind 常丢失） |
| \`DateTimeOffset\` | 时刻 + 偏移 | 日志、API、存储“发生在何时” | 生日、营业日（偏移会误导） |
| \`DateOnly\` | 日历日 | 生日、账单日、节假日 | 跨时区的“那一天的哪个瞬间” |
| \`TimeOnly\` | 日内时刻 | 营业开始/结束 | 带日期的预约（要和 DateOnly 组合） |

时间线上的绝对时刻：优先 \`DateTimeOffset\`，**存储和传输用 UTC + ISO 8601**（\`2026-09-11T02:00:00Z\`）。\`DateTime.Now\` 依赖服务器抖动的本地时区，容器换节点就会偏。\`DateTime.Today\` 在 UTC 机器上会得到“别人的昨天”。

14 天退款窗口是 **时长运算**（\`createdAt + 14 days\`，注意夏令时用绝对时间）。“下个月同一天”是 **日历运算**（1 月 31 日的下个月要定义 2 月 28/29）。两者不能互相套。

### 二、IANA 与 Windows 时区、TimeProvider

Linux 容器常见 IANA ID（\`Asia/Shanghai\`、\`America/New_York\`），Windows 常见 \`China Standard Time\`。.NET 在较新运行时能互认许多别名，但 **跨平台必须实测** \`TimeZoneInfo.FindSystemTimeZoneById\`，并在 CI 用 Linux 跑一遍转换。不要手写 \`+8\` 当中国，忽略历史偏移。

测试禁止到处 \`DateTime.UtcNow\`。注入 \`TimeProvider\`（.NET 8+）：

\`\`\`csharp
public sealed class RefundPolicy(TimeProvider clock)
{
    public bool CanRefund(DateTimeOffset paidAt) =>
        clock.GetUtcNow() < paidAt + TimeSpan.FromDays(14);
}
\`\`\`

单元测试用 \`FakeTimeProvider\` 拨钟；集成测试也要固定时钟，否则“刚好跨天”会变成 flaky。

### 三、ISO 8601、CultureInfo、Rune

协议、缓存键、HTTP 头、租户 ID 比较用 \`Ordinal\` / \`OrdinalIgnoreCase\`。用户看见的日期、数字、排序才用明确 \`CultureInfo\`（\`zh-CN\`、\`en-US\`）。**永远不要**用 \`CurrentCulture\` 去解析 API 正文里的时间戳——土耳其区域下 \`i\`/\`I\` 的大小写会让路由和字典键“偶尔”找不到。

金额：存储数值 + 币种；\`ToString("C")\` 只发生在展示边界，且必须传入文化，否则 \`1234.5m\` 在德国会变成 \`1.234,50\`，再被另一端当千分位解析。

\`string.Length\` 是 UTF-16 code unit 数。\`A😀é\` 的 Length 是 4（😀 占两个 char），用户看到 3 个字形。计数、截断、数据库 \`nvarchar\` 长度要用 \`EnumerateRunes()\` 或 \`StringInfo\` 文本元素。用户名正则若写成 \`^.{1,16}$\`，一个 emoji 就会吃掉两个“长度”。

### 四、灾难性回溯、GeneratedRegex、NonBacktracking

经典危险模式：\`^(a+)+$\` 配 \`aaaa...X\`。引擎在失败前尝试指数级切分。不可信输入 + 复杂正则 = CPU DoS。

\`\`\`csharp
// 危险：嵌套量词，输入 "aaaaaaaaaaaaaaaaaaaaX" 会把 CPU 打满
// var evil = new Regex(@"^(a+)+$");

var safe = new Regex(
    @"^[a-z0-9._-]{3,32}$",
    RegexOptions.IgnoreCase | RegexOptions.CultureInvariant | RegexOptions.NonBacktracking,
    matchTimeout: TimeSpan.FromMilliseconds(100));
\`\`\`

规则：

- 不可信模式**不要** \`RegexOptions.Compiled\` 还无限时。
- 输入和模式都要有长度上限 + \`matchTimeout\`。
- .NET 7+ 优先 \`RegexOptions.NonBacktracking\`（不支持回溯结构，失败则抛或返回不匹配，而不是指数爆炸）。
- \`[GeneratedRegex("...", RegexOptions.NonBacktracking)]\` 源生成：启动快、AOT/trim 友好、编译期检查模式。
- HTML / 邮箱的“完美正则”几乎都错；邮箱用解析 + 发送验证，HTML 用专用解析器。

### 五、陷阱与清单

- [ ] API 时刻字段是 \`DateTimeOffset\` 或 ISO 8601 字符串，不是无 Kind 的 \`DateTime\`
- [ ] 测试使用 \`TimeProvider\`，CI 覆盖 IANA 时区
- [ ] 标识符比较 Ordinal；展示才用 CultureInfo
- [ ] 截断与长度按 Rune，不按 \`Length\`
- [ ] 用户输入正则有超时 / NonBacktracking / GeneratedRegex
- [ ] 退款窗口与账单日分别用时长和日历 API

### 六、把时间与文本写进合同和测试

对外 JSON 时刻字段统一 \`date-time\`（ISO 8601，带 \`Z\` 或数值偏移），禁止 \`"2026/9/11 下午 2:00"\` 这种文化相关字符串。OpenAPI 标 \`format: date-time\` 或 \`date\`，与 \`DateTimeOffset\` / \`DateOnly\` 对齐。数据库 \`timestamptz\` 存 UTC，展示层用用户时区转换；报表“按自然日聚合”必须声明**哪个时区的自然日**，否则财务对账会在夏令时切换日差出一批。

日志时间戳同样用 UTC。把 \`DateTime.Now\` 打进结构化日志，会在多区域部署后无法对齐 trace。前端显示可以本地化，存储和排障通道不行。定时作业（“每天 0 点出账单”）要写成“在 \`Asia/Shanghai\` 的下一个午夜”，用 \`TimeZoneInfo.GetUtcOffset\` 处理 DST，而不是 cron \`0 16 * * *\` 还假设永远 UTC+8。

正则落地建议：用户名、SKU、Idempotency-Key 这类闭集用 GeneratedRegex + NonBacktracking；复杂文本（地址、备注）不要用正则做解析。需要“高亮关键词”时限制输入长度，并在超时后返回 400，而不是让请求线程卡死。对第三方抄来的“完美邮箱正则”保持怀疑：RFC 邮箱语法远比业务需要的复杂，生产以“能发验证信”为准。

测试清单补强：一组 \`Theory\` 覆盖 \`I\`/\`ı\` 在 \`tr-TR\` 下的大小写；一组拨钟测试覆盖退款刚好到期；一组 Rune 截断测试包含组合音标和 emoji。这些测试几年后仍能防止有人“顺手改回 Length”。全球化不是翻译文件的同义词，它是协议与日历的纪律。

排障时把“时间错了”拆成四问：存的是时刻还是日历日？转换用了哪个时区 ID？比较用了哪种文化？正则有没有超时？十次生产事故里有八次能在这四问里结束。把 TimeProvider 注入不到的静态 DateTime.Now 当成缺陷，和空引用一样拦 CI。跨年、月末、夏令时切换日各做一条集成测试，比再解释一遍 DateTimeKind 更管用。

### 练习

1. 修改主 demo：把时间戳换成 \`"2026-12-31T23:30:00Z"\` 再转 \`America/New_York\`，观察跨日结果；把用户名输入改成带空格与超长字符串，看 \`safe.IsMatch\` 的判定；对 \`"A😀é"\` 分别统计 \`Length\` 与 \`EnumerateRunes()\`。
2. 独立实现注入 \`TimeProvider\` 的 \`RefundPolicy\`（14 天退款窗口），用 \`FakeTimeProvider\` 写“刚好第 14 天”的拨钟边界测试；再实现按文本元素计数的 \`Truncate(string text, int maxRunes)\`，保证 emoji 与组合音标不被截断成乱码。
3. 生产场景：把毕业项目的时刻字段统一为 \`DateTimeOffset\` + ISO 8601（OpenAPI 标 \`format: date-time\`），标识符比较改用 \`StringComparer.Ordinal\`；用 \`[GeneratedRegex]\` 加 \`RegexOptions.NonBacktracking\` 重写用户名/Sku 校验并设置 \`matchTimeout\`；在 CI 的 Linux 容器里跑 tr-TR 大小写与夏令时切换日的 Theory 测试。
`,
    code: `// ============================================================
// 时间与文本的三个生产雷区：
//   1. 存 DateTimeOffset / UTC，展示时再转到用户时区
//   2. string.Length 是 UTF-16 码元，不是“人看到的字符数”
//   3. 用户输入正则必须带超时，防止灾难性回溯打满 CPU
// ============================================================
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

// 解析时用 InvariantCulture，避免服务器区域把日期格式解错
var instant = DateTimeOffset.Parse(
    "2026-09-11T02:00:00Z",
    CultureInfo.InvariantCulture);
TimeZoneInfo shanghai = TimeZoneInfo.FindSystemTimeZoneById("Asia/Shanghai");
Console.WriteLine(TimeZoneInfo.ConvertTime(instant, shanghai));

string text = "A😀é";
Console.WriteLine($"UTF-16 Length={text.Length}");           // 表情是代理对，Length 会大于“看起来的字数”
Console.WriteLine($"Unicode scalars={text.EnumerateRunes().Count()}");

// CultureInvariant：土耳其语区域下 IgnoreCase 不会把 i/I 搞乱
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

绝大多数业务代码不需要 \`unsafe\`。需要和操作系统、驱动、图像库或现有 C ABI 说话时，目标是：**边界小、所有权清晰、公共 API 永不露出裸指针。** Interop 写错的症状是随机崩溃、句柄泄漏和“只在 Linux 复现”，调试成本远高于多写 20 行托管代码。

### 一、LibraryImport 与 DllImport

.NET 7+ 优先 \`[LibraryImport]\`：源生成封送，AOT/trim 友好，编译期就能发现许多签名错误。遗留 \`[DllImport]\` 走运行时封送，在 Native AOT 上更容易出问题。

\`\`\`csharp
internal static partial class NativeMethods
{
    [LibraryImport("mylib", StringMarshalling = StringMarshalling.Utf8)]
    internal static partial int process(ReadOnlySpan<byte> input);
}
\`\`\`

对照：

| 项 | \`DllImport\` | \`LibraryImport\` |
| --- | --- | --- |
| 生成时机 | 运行时 | 编译期源生成 |
| AOT | 需额外提示，易漏 | 设计上更友好 |
| Span / bool / 字符串 | 封送规则含糊 | 必须显式 \`StringMarshalling\` 等 |
| 适用 | 老项目 | 新代码默认 |

库名、calling convention（\`Cdecl\` / \`Stdcall\`）、字符编码、结构体 \`LayoutKind\`、\`Pack\`、整数宽度（\`long\` 在 LLP64 是 32 位）必须与 C 头文件一致。Windows / Linux / macOS 的 so 名不同，用 \`NativeLibrary.Load\` 或 RID 特定资源，并在三种 OS 上做集成测试，不要只在开发机 DLL 通过就宣布可移植。

### 二、SafeHandle、所有权、钉住与 COM

原生句柄用 \`SafeHandle\`（或现成的 \`SafeFileHandle\`、\`SafeWaitHandle\`），在 \`ReleaseHandle\` 里释放，让 GC 与 \`using\` 都能走到释放路径。**禁止**把裸 \`IntPtr\` / \`void*\` 传到 Application 层，更不要放进 public NuGet API——调用方无法判断该不该 \`Free\`，版本升级时必炸。

所有权清单：谁 \`malloc\`、谁 \`free\`、是否跨线程、回调能活过几次 GC、异常路径是否仍释放。COM 互操作（STA/MTA、\`RCW\`、\`Marshal.ReleaseComObject\`）只在必须对接 Office/Windows 组件时使用；新服务优先 REST/gRPC，把 COM 关在一台专用 Windows 工人进程里。

钉住（pin）：

\`\`\`csharp
fixed (byte* p = span) { /* 仅在最小范围内把托管内存地址交给 native */ }
\`\`\`

\`fixed\` / \`GCHandleType.Pinned\` / \`Memory<T>.Pin()\` 都会让 GC 无法移动该对象。长时间 pin 大数组会造成堆碎片。能拷贝到 \`NativeMemory.Alloc\` 再交给长时间 native 工作，就不要钉住托管堆。\`Span<T>\` 本身可以来自栈或托管；传给 native 前确认生命周期覆盖整个调用，包括异步延续——**不要**把指向栈上 \`span\` 的指针存起来下次再用。

回调委托必须被托管侧强引用，否则 native 稍后调用时委托已被回收，表现为随机 AccessViolation。

### 三、unsafe 规则与 AOT 封送

先穷尽 \`Span<T>\`、\`Memory<T>\`、\`BinaryPrimitives\`、\`MemoryMarshal\`、\`Unsafe.As\` 的安全包装。必须写指针时：

- \`unsafe\` 块尽量不超过一个方法，公开表面仍是安全 API。
- 每个指针访问前检查长度；用 fuzz / 属性测试喂随机长度。
- 项目 \`AllowUnsafeBlocks\` 只开在 Interop 项目，不在 Web 层全局打开。
- \`unsafe\` **不会自动更快**，它只是关闭一部分检查。

Native AOT 下，运行时封送、运行时 \`DllImport\` 搜索、反射调 native 都更脆。使用 \`LibraryImport\`、\`DisableRuntimeMarshalling\`（若签名允许）、明确 \`LibraryImport\` 的类型映射，并在 AOT 发布产物上跑 smoke。COM 与部分 Windows API 在 AOT 上支持不完整，发布前查当前 runtime 文档。

### 四、陷阱与清单

- [ ] 新 P/Invoke 使用 \`LibraryImport\`，字符串/布尔/枚举显式封送
- [ ] 句柄是 SafeHandle，public API 无 \`IntPtr\`
- [ ] pin 只包住 native 调用本身
- [ ] 回调委托有静态或实例字段抓住
- [ ] Linux/Windows 真实加载 .so/.dll 的集成测试
- [ ] AOT 发布后仍能调用同一条 interop 路径

### 五、工程化封装：让业务代码看不见 native

推荐物理隔离：\`Company.Native.Imaging\` 之类的独立项目开启 \`AllowUnsafeBlocks\`，只对外提供 \`SafeHandle\` 包装的 \`IImageDecoder\`。Web 项目引用接口而不是 P/Invoke 类。这样 trimming/AOT 分析范围缩小，安全评审也只盯一个程序集。平台特定实现用 \`LibraryImport\` + RID 图（\`runtimes/linux-x64/native/libfoo.so\`）打包，\`NativeLibrary.SetDllImportResolver\` 仅在需要自定义搜索路径时使用，并写清搜索顺序，避免加载到 PATH 上的同名恶意库。

结构体封送是第二常见事故。C 的 \`#pragma pack\`、位域、联合体、\`long\` 宽度必须用 \`[StructLayout]\` 精确复现，并用 \`sizeof\` 测试在目标 OS 上断言长度。不要用 \`bool\` 直接对应 C 的 4 字节 \`BOOL\` 除非标明 \`UnmanagedType.Bool\`。字符串：Windows API 常是 UTF-16，Linux 库常是 UTF-8；\`StringMarshalling.Utf16\` 与 \`Utf8\` 选错会在“偶尔的非 ASCII 路径”才爆炸。

错误处理约定：C 函数返回码 / \`errno\` / \`GetLastError\` 要立刻在托管边界转换成异常或 \`Result\`，不要继续往上传递“-1 表示失败”。日志记录返回码和输入长度，不记录可能含密钥的缓冲区。对不可信输入先在托管侧做长度与格式检查，再交给 native——缓冲区溢出不应成为你的 API 表面。

最后，许可与供应链：静态链接的 C 库许可证、CVE、以及是否提供 Windows/Linux 双构建，都要进 SBOM。Interop 不是“调用一下就走”，它是你对另一门语言的终身依赖。能用托管实现（\`ImageSharp\`、\`System.Security.Cryptography\`）就不要为了“C 更快”拉进一个无人维护的 \`.so\`。

### 六、对照练习

写一个 \`SafeNativeBuffer : SafeHandle\` 教学类型（不必真调 C 库）：构造时“分配”、\`ReleaseHandle\` 里计数释放次数，用 \`using\` 和故意不释放两条路径断言。再写一个公开 API \`int Checksum(ReadOnlySpan<byte>)\` 内部才 \`fixed\`。把 \`IntPtr\` 从 public 表面去掉。若你有真实 .so，用 LibraryImport 包一层，并在 Linux CI 跑。做完这三项，Interop 才算从“会 DllImport”变成“敢给别人调用”。

审查提问单写成 interop.md：许可证、CVE 订阅、Win/Linux 是否同测、回调会否重入死锁、错误码是否立刻翻译、public API 是否泄漏 IntPtr、AOT 能否 Load 到 RID 文件。只有一名“懂 C 的人”时，文档和测试就是备份。宁可多写托管长度检查，也不把未校验缓冲交给 native。COM 与 Office 自动化关在专用 Windows 工人进程，不要进 Web 副本。

### 练习

1. 修改主 demo：把 \`packet\` 前 4 字节换成 \`0x7F 0xFF 0xFF 0xFF\`，观察 \`ReadInt32BigEndian\` 的输出；把 \`TryParsePacket\` 的长度校验从 6 放宽到 4，再喂 5 字节输入，看异常在哪个切片抛出；对调 \`PacketHeader\` 里 \`Version\` 与 \`Flags\` 的 \`FieldOffset\`，对比 \`Convert.ToHexString(buffer)\` 字节视图的变化。
2. 脱离示例独立实现 \`static bool TryParseVarint(ReadOnlySpan<byte> raw, out int value, out int consumed)\`：按 LEB128 规则解析变长整数，长度不足或第 5 字节仍带延续位时返回 false——只用 \`ReadOnlySpan<byte>\` 与算术运算，全程不写 \`unsafe\`，并为每个拒绝分支各写一个测试。
3. 生产场景：为虚构的 \`libchecksum\` 用 \`[LibraryImport("libchecksum", StringMarshalling = StringMarshalling.Utf8)]\` 声明封装，返回句柄交给 \`SafeHandle\`、C 返回码在托管边界立刻转异常；按 RID 图打包进 \`runtimes/linux-x64/native\`，在 ubuntu + windows 双矩阵 CI 里真实加载，再发一次 Native AOT 产物做 smoke，最后把 interop.md 审查单（许可证、CVE、回调重入、错误码翻译、AOT 加载）补进仓库。

`,
    code: `// ============================================================
// Native Interop：安全解析二进制协议 + 显式内存布局 + 非指针技巧。
// 网络字节序是大端；本机 x64 通常是小端——读错端序，数字会对但值全错。
// BinaryPrimitives / MemoryMarshal 覆盖 90% 场景，不到边界再写 unsafe。
// ============================================================
using System.Buffers.Binary;
using System.Runtime.InteropServices;

// ---------- 1. 不使用指针也能高效解析网络协议 ----------
byte[] packet =
[
    0x00, 0x00, 0x00, 0x2A, // big-endian id = 42
    0x01, 0xF4              // big-endian amount = 500
];

ReadOnlySpan<byte> data = packet;
// [..4] 是范围运算符（C# 8）：从 0 取到不含 4；Slice 更适合「偏移 + 长度」。
int id = BinaryPrimitives.ReadInt32BigEndian(data[..4]);
ushort amount = BinaryPrimitives.ReadUInt16BigEndian(data.Slice(4, 2));

Console.WriteLine($"=== 1. 二进制协议解析 ===");
Console.WriteLine($"id={id}, amount={amount}");

// ---------- 2. 显式内存布局（与 native 结构体对齐的前提） ----------
// StructLayout.Explicit + FieldOffset 精确控制每个字段的位置（类型定义见文件末尾）
Console.WriteLine("\\n=== 2. 结构体布局 ===");
Console.WriteLine($"sizeof(PacketHeader) = {Marshal.SizeOf<PacketHeader>()} 字节（与 native 侧约定一致）");

// ---------- 3. 无指针读写结构体到字节数组（MemoryMarshal） ----------
// 把 8 字节头部按 little-endian 写进 buffer，再原样读回——封送不进 unsafe
Span<byte> buffer = stackalloc byte[8];
var header = new PacketHeader { Magic = 0xDEADBEEF, Version = 3, Flags = 0x0001 };
MemoryMarshal.Write(buffer, in header);          // 托管 struct → 字节
var roundTrip = MemoryMarshal.Read<PacketHeader>(buffer);  // 字节 → 托管 struct

Console.WriteLine("\\n=== 3. MemoryMarshal 读写 ===");
Console.WriteLine($"  写入: Magic=0x{roundTrip.Magic:X}, Version={roundTrip.Version}, Flags=0x{roundTrip.Flags:X}");
Console.WriteLine($"  字节视图: {Convert.ToHexString(buffer)}");

// ---------- 4. 按协议字段逐段解析（带边界检查的健壮写法） ----------
// 生产代码解析外来字节必须先验长度，再切片——宁可多写托管检查，不把未校验缓冲交给 native
static bool TryParsePacket(ReadOnlySpan<byte> raw, out int parsedId, out ushort parsedAmount)
{
    parsedId = 0; parsedAmount = 0;
    if (raw.Length < 6) return false;           // 长度校验：头 4 + 体 2
    parsedId = BinaryPrimitives.ReadInt32BigEndian(raw[..4]);
    parsedAmount = BinaryPrimitives.ReadUInt16BigEndian(raw.Slice(4, 2));
    return true;
}

Console.WriteLine("\\n=== 4. 带边界检查的解析 ===");
Console.WriteLine($"  合法包(6字节): {TryParsePacket(packet, out var pid, out var pa)} → id={pid}, amount={pa}");
Console.WriteLine($"  截断包(3字节): {TryParsePacket(packet[..3], out _, out _)} → 拒绝解析");

// ---------- 5. ASCII 字节比较（避免 Encoding 分配） ----------
// 协议里的魔数/命令字常用 ASCII，直接按字节比较零分配
ReadOnlySpan<byte> magic = "PING"u8;             // u8 后缀：UTF-8 字面量 → ReadOnlySpan<byte>
ReadOnlySpan<byte> received = "PING"u8;
Console.WriteLine($"\\n=== 5. 魔数字节比较 ===");
Console.WriteLine($"  magic == received: {magic.SequenceEqual(received)}（零字符串分配）");

// ============== 类型定义区（顶级语句程序中类型必须放在末尾） ==============

// 显式布局的结构体：与 native 侧逐字节对齐的前提
[StructLayout(LayoutKind.Explicit, Size = 8, Pack = 8)]
struct PacketHeader
{
    [FieldOffset(0)] public uint Magic;      // 0-3 字节
    [FieldOffset(4)] public ushort Version;   // 4-5 字节
    [FieldOffset(6)] public ushort Flags;     // 6-7 字节
}
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch96",
    group: "第十六部分 数据与分布式系统",
    icon: "🧱",
    title: "关系数据库设计、索引与锁",
    content: `## 第九十七章　关系数据库设计、索引与锁

ORM 不能替代数据库基本功。生产里最贵的故障往往不是 C# 写错，而是缺少约束的脏数据、错误索引导致的全表扫描、死锁重试把库存扣两次。Schema、键、范式、隔离级别和执行计划，是应用代码的地基。

### 一、范式、主键与外键

| 范式 | 要求 | 订单例子 |
| --- | --- | --- |
| 1NF | 字段原子，无重复列组 | 不要 \`sku1, sku2, sku3\`，用 \`order_lines\` |
| 2NF | 非主属性完全依赖整键 | 行项目不要重复存商品全名除非快照有意为之 |
| 3NF | 非主属性不依赖其他非主属性 | 客户地址变更不应改写历史订单快照策略要显式 |

适度反范式（把 SKU 名快照进订单行）是允许的，但必须写清“这是下单时的副本”。主键要**稳定**：不要用可变手机号当 PK。代理键（\`bigint identity\` / UUID v7）+ 业务唯一约束（\`tenant_id + order_no\`）是常见组合。外键让孤立行无法存在；软删除要决定 FK 是限制还是级联到“已取消”状态。\`NOT NULL\`、\`CHECK\`（状态枚举、金额 ≥ 0）、唯一约束在数据库再挡一层——应用 bug 不应能写出非法行。

金额用 \`numeric(18,2)\`（或领域要求的精度），禁止 \`float\`。时间存 UTC 时刻（\`timestamptz\`），若业务要“用户当地账单日”另存时区 ID 或 \`DateOnly\`。

### 二、覆盖索引与 EXPLAIN

索引为**具体查询**服务，不是“每个 FK 一根、每个列一根”。经验：等值列在前，范围/排序列在后；\`INCLUDE\`（SQL Server）或把选出列放进索引（PostgreSQL covering）可避免回表。

\`\`\`sql
-- 典型列表：按租户 + 创建时间倒序，覆盖展示列
CREATE INDEX ix_orders_tenant_created
    ON orders (tenant_id, created_at DESC, id DESC)
    INCLUDE (total, status);
\`\`\`

每个索引增加写入放大、VACUUM/统计维护和磁盘。上线前用 \`EXPLAIN (ANALYZE, BUFFERS)\`（PostgreSQL）或实际执行计划（SQL Server）看是否 Seq Scan、估算行数是否离谱、是否排序溢出到磁盘。没有真实数据分布的“我觉得该建索引”经常更慢。

### 三、隔离级别与死锁

| 级别 | 脏读 | 不可重复读 | 幻读 | 典型引擎行为 |
| --- | --- | --- | --- | --- |
| Read Uncommitted | 可能 | 可能 | 可能 | 极少用于资金 |
| Read Committed | 否 | 可能 | 可能 | PostgreSQL/SQL Server 默认附近 |
| Repeatable Read | 否 | 否 | 视实现 | MySQL InnoDB 默认 |
| Snapshot / RCSI | 否 | 行版本 | 语句/事务快照 | SQL Server 常见读优化 |
| Serializable | 否 | 否 | 否 | 冲突最多，正确性最强 |

更高隔离用锁或行版本换正确性，不是免费开关。事务要短：**禁止**在事务里打慢 HTTP、发邮件、等人工。死锁是正常现象：固定访问表/行的顺序（先订单再库存）、减小锁范围、对**整个可重放事务**有限次重试。重试必须幂等，否则死锁重试会变成超卖。

### 四、分页、迁移与 expand/contract

深 \`OFFSET 100000\` 会扫描再丢掉十万行。用稳定唯一排序键做 keyset：

\`\`\`sql
SELECT id, created_at, total
FROM orders
WHERE tenant_id = @tenant
  AND (created_at, id) < (@cursor_time, @cursor_id)
ORDER BY created_at DESC, id DESC
LIMIT @take;
\`\`\`

复合比较在 PostgreSQL 很自然；SQL Server 写成 \`OR\`/\`AND\` 等价条件。游标要对调用方不透明（编码后的 token），避免客户端伪造看别人的页。

Schema 变更用 **expand/contract**：先加可空列/新表并双写，再回填，再切读，最后删旧列。禁止“改列类型 + 删列”一次迁移直接上生产大表。迁移脚本要审查锁级别（\`ACCESS EXCLUSIVE\` 会堵全表）。大索引用 \`CONCURRENTLY\`（PostgreSQL）或在线索引选项，并在低峰执行。

### 五、清单

- [ ] PK/FK/唯一/CHECK 能独立于应用保护不变量
- [ ] 列表查询有覆盖索引，EXPLAIN 已在近似生产数据上跑过
- [ ] 隔离级别与死锁重试策略写进文档
- [ ] 列表接口是 keyset，不是深 OFFSET
- [ ] 迁移是 expand/contract，有回滚或向前修的方案

### 六、约束、统计信息与真实负载

范式解决的是更新异常；生产还要解决**读形状**。订单列表按租户+时间过滤，就在 \`(tenant_id, created_at desc, id desc)\` 上建索引；运营按 SKU 聚合销量，可能需要独立汇总表或物化视图，而不是每次扫 \`order_lines\`。反范式汇总表必须声明刷新方式（同步写、异步 Outbox、夜间作业）和可接受的落后窗口，否则会和搜索引擎一样变成“第二个真相”却没人运维。

外键在高写入场景有人会关掉“为了性能”。先用 EXPLAIN 证明 FK 检查是热点，再考虑延迟校验或应用层保证——大多数中小系统的 FK 开销远小于脏数据成本。软删除（\`deleted_at\`）与唯一约束冲突：邮箱唯一要做成 \`(email) WHERE deleted_at IS NULL\` 的部分唯一索引，否则注销用户无法重新注册。

统计信息过期会让优化器选错计划：昨天 100 行的表今天 1000 万行，仍走嵌套循环。部署大回填后要 \`ANALYZE\`（PostgreSQL）或更新统计。自动 vacuum / 统计更新阈值在大表上常常不够，需要按表调。锁等待图表应进仪表盘：\`pg_stat_activity\` / \`sys.dm_tran_locks\` 不是事故时才第一次打开。

分页 API 的 \`take\` 必须有上限（例如 100）。客户端传 \`take=1000000\` 是合法的恶意或误用。游标编码包含排序方向和版本，排序规则一变旧游标应返回 400 而不是错页。深分页需求（“跳到第 500 页”）用估算或禁止，不要用 OFFSET 硬扛。

把这一章和第一百一十三章一起读：EF 只能表达你已经想清楚的模型。模型没想清楚，迁移工具会非常高效地帮你把错误 schema 固化进仓库。

### 七、一张订单表的审图练习

请在纸上画出 \`orders\` / \`order_lines\` / \`inventory\`：主键、租户、金额精度、状态检查、\`(tenant_id, order_no)\` 唯一、库存版本列、列表覆盖索引。然后写两条 SQL：创建订单（扣库存 + 插入订单，固定锁顺序）和 keyset 翻页。用 EXPLAIN ANALYZE 在十万行种子上看是否 Seq Scan。把死锁重试限制为 3 次且整段可重放。把这张图贴进毕业项目 ADR。若画不出来，说明第九十七章还只是阅读，不是技能。

常见错觉：SELECT * 加 ORM 缓存不是索引；单列 updated_at 帮不了“某租户最近订单”；varchar(max) 状态没有选择性；UUID v4 主键随机写页。建表 PR 先问 PK/UK/FK/覆盖索引/CHECK/隔离假设。EXPLAIN 当附件，不接受“我本地挺快”。统计信息过期与锁等待进仪表盘，事故当天才第一次查 pg_stat_activity 已经晚了。

再补一句当验收：没有 EXPLAIN 附件的索引 PR 视为未完成。把慢查询和锁等待做成周报，比临时救火更接近第九十七章的目标。

### 练习

1. 修改主 demo 的三个部分：分页——把 \`cursor\` 换成 \`orders[0]\`（最新一单）和 \`orders[11]\`（最旧一单），观察 \`nextPage\` 分别输出什么；给几条订单相同的 \`CreatedAt\` 并去掉 \`ThenByDescending(order => order.Id)\`，看只按时间比较会丢行还是重行；把 \`Take(5)\` 改成 \`Take(100)\`，确认 12 行一次取完。唯一约束——把 \`uniqueKeys\` 换成 \`List\` 并改写成「先 Contains 查重、再 Add」的两步实现，单线程下结果相同，体会为什么两步之间在并发下必然有竞态窗口。死锁——把 \`attempts\` 改成两条都 \`Committed: false\` 并把重试上限提到 3，观察重试耗尽后应如何显式上报（抛异常/告警）而不是静默吞掉。
2. 脱离示例独立实现 \`KeysetCursor\`：把 \`(CreatedAt, Id)\` 编码成 Base64 不透明 token，内含排序方向与版本号，提供 \`TryParse\`；伪造、过期或排序规则变更后的旧游标返回失败而不是错页，用 xUnit 覆盖“篡改 token”与“换排序方向后复用旧游标”两个用例。
3. 生产场景：在 PostgreSQL 灌 10 万行订单种子，建 \`(tenant_id, created_at DESC, id DESC) INCLUDE (total, status)\` 覆盖索引，用 \`EXPLAIN (ANALYZE, BUFFERS)\` 对比 \`OFFSET 50000\` 与 keyset 翻页的 Buffers 读数并贴进 PR；再写“扣库存 + 插订单”事务：固定先 \`orders\` 后 \`inventory\` 的锁顺序，死锁重试上限 3 次且整段幂等可重放，用两个并发事务验证不会超卖。


`,
    code: `// ============================================================
// 数据库基本功三件事（纯 C# 模拟）：
//   1. Keyset 分页：深 OFFSET 是「扫描再丢弃」，复合游标翻页不重不漏
//   2. 唯一约束：在「保存」这一层拒绝重复——查重-再插两步之间永远有竞态
//   3. 死锁重试：固定锁顺序 + 有限次重试 + 整段幂等可重放
// ============================================================

// ---------- 1. Keyset 分页（复合游标）----------
// WHERE (created_at, id) < (游标) ORDER BY created_at DESC, id DESC LIMIT 5
// Id 是第二排序键：CreatedAt 相同的行也有稳定顺序，翻页不重不漏。
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

// ---------- 2. 唯一约束：保存层拒绝重复 ----------
// (tenant_id, order_no) 唯一索引的等价物：HashSet.Add 原子地完成「检查 + 插入」。
// 反面模式是「先 SELECT 查重、再 INSERT」——两步之间另一个请求可以插入同键。
var uniqueKeys = new HashSet<(string Tenant, string OrderNo)>();

void TryCreateOrder(string tenant, string orderNo)
{
    if (!uniqueKeys.Add((tenant, orderNo)))
        Console.WriteLine($"拒绝：({tenant}, {orderNo}) 唯一约束冲突 —— 等价数据库 UNIQUE 拒绝");
    else
        Console.WriteLine($"接受：({tenant}, {orderNo})");
}

Console.WriteLine();
TryCreateOrder("t-1", "SO-2026-001");
TryCreateOrder("t-1", "SO-2026-001");   // 同租户同单号：约束拒绝，无论查重逻辑怎么写
TryCreateOrder("t-2", "SO-2026-001");   // 不同租户：不冲突（复合键的语义）

// ---------- 3. 死锁：固定锁顺序 + 有限次整段重试 ----------
// 死锁的根源是两个事务按相反顺序拿锁（T1 拿 orders 等 inventory，
// T2 拿 inventory 等 orders）。生产的解法组合拳：
//   ① 全系统统一锁顺序（先 orders 再 inventory）—— 消灭大部分死锁
//   ② 数据库挑一个事务当「受害者」杀掉 —— 剩余部分靠有限次重试
//   ③ 重试必须整段可重放 —— 幂等键兜底，保证重放不会双下单
var attempts = new[]
{
    (Attempt: 1, Committed: false),   // 第一次被选为死锁受害者
    (Attempt: 2, Committed: true),    // 同序整段重放成功
};

Console.WriteLine();
foreach (var (attempt, committed) in attempts)
{
    Console.WriteLine($"第 {attempt} 次尝试：锁顺序 orders → inventory，" +
        (committed ? "全部拿到，事务提交" : "被死锁受害者选中，整段回滚后重试"));
}
Console.WriteLine("要点：重试上限有限、整段可重放、幂等键兜底——缺一个都会变成超卖。");

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

EF Core、Dapper 和 ADO.NET 不是“谁更高级”，而是不同抽象层。选错的代价是：要么 LINQ 翻译出灾难 SQL，要么到处手写重复映射，要么每个请求 extra 打开连接却忘了释放。本章把连接池、参数、Reader、事务和超时讲清楚。

### 一、何时 EF、何时 Dapper、何时 ADO.NET

| 维度 | EF Core | Dapper | 手写 ADO.NET |
| --- | --- | --- | --- |
| 变更跟踪 / 图保存 | 强 | 无（你自己写 UPDATE） | 无 |
| 迁移 | 一流 | 需另选工具 | 需另选工具 |
| SQL 控制 | LINQ + 原始 SQL | 手写 SQL 是主路径 | 完全控制 |
| 映射 | 实体 + 投影 | 多映射、动态 | \`IDataReader\` 逐列 |
| 适合 | 大多数业务写模型 | 复杂报表、热点读 | 驱动/库作者、极端批次 |

同一系统可以 **写走 EF、热点读走 Dapper**，但必须统一：连接字符串、事务边界、租户过滤器、命名约定。不要在一个事务里一边 \`DbContext.SaveChanges\` 一边另开连接，那会变成两阶段的假原子。

### 二、连接池、超时与事务

连接池由 provider 按连接字符串缓存物理连接。应用的正确模式是 **短作用域打开、用完释放**（\`await using var conn = ...\`）。把 \`SqlConnection\` 做成单例并长期占用，池会枯竭；每次 new 而不 Dispose，池也会以为连接仍在用。池参数（\`Max Pool Size\`、\`Connection Idle Lifetime\`）要结合并发和数据库 \`max_connections\`，HPA 扩容时连接数 = 副本 × 每副本池上限。

\`CommandTimeout\` 默认常是 30 秒，对报表太短、对在线 API 可能太长。在线请求应更短，并传递 \`CancellationToken\`；取消不会自动回滚已提交语句，只是停止等待。事务用 \`connection.BeginTransactionAsync()\` 或 \`TransactionScope\`（注意异步需 \`TransactionScopeAsyncFlowOption.Enabled\`）。EF 与 Dapper 共用连接时，把同一个 \`IDbTransaction\` / \`DbTransaction\` 传给 Dapper 的 \`CommandDefinition\`。

### 三、参数化与 IDataReader

\`\`\`csharp
const string sql = """
    SELECT id, name
    FROM users
    WHERE tenant_id = @TenantId AND id = @Id
    """;
var user = await connection.QuerySingleOrDefaultAsync<User>(
    new CommandDefinition(sql, new { TenantId = tenantId, Id = id },
        commandTimeout: 5,
        cancellationToken: cancellationToken));
\`\`\`

参数化保护的是**值**。表名、列名、\`ORDER BY\` 方向不能当参数拼接，必须允许列表映射（见主 demo）。\`AddWithValue\` 会按 .NET 类型猜测 SqlDbType，字符串可能变成 \`nvarchar(max)\` 从而不走索引——生产应显式类型和尺寸。

\`IDataReader\` / \`DbDataReader\` 是流：读一行处理一行，内存与结果集成正比。流式期间连接被占用，不能把 reader 逃逸到请求结束后的 \`IAsyncEnumerable\` 却先释放连接。需要缓冲就 \`ToListAsync\` 并接受内存；需要流式就把连接生命周期绑到枚举全过程。

### 四、Dapper 多映射

一对多常见写法：

\`\`\`csharp
var lookup = new Dictionary<int, OrderRow>();
var rows = await connection.QueryAsync<OrderRow, LineRow, OrderRow>(
    sql,
    (order, line) =>
    {
        if (!lookup.TryGetValue(order.Id, out var existing))
        {
            existing = order;
            lookup.Add(order.Id, existing);
        }
        existing.Lines.Add(line);
        return existing;
    },
    splitOn: "LineId");
\`\`\`

\`splitOn\` 必须对准第二段的第一列。多映射不会 magically 解决 N+1：SQL 仍要一次 JOIN 或两次查询。列名与属性不一致时用别名，不要靠大小写运气（PostgreSQL 未加引号会折成小写）。

### 五、可观测性与清单

记录操作名、耗时、行数、超时，**不要**把密码、证件号打进 SQL 参数日志。慢查询以数据库 \`EXPLAIN\` / Query Store 为准。清单：

- [ ] 选型理由写进 ADR：默认 EF，例外才 Dapper/ADO
- [ ] 连接 \`await using\`，池大小与数据库和副本数匹配
- [ ] 全部用户输入参数化；排序列走允许列表
- [ ] Reader 不跨越连接生命周期
- [ ] 事务短、可重放、超时明确
- [ ] 与 EF 混用时共享同一连接与事务

### 六、批量、重试与“看起来很快”的陷阱

批量导入不要一条 \`INSERT\` 一个往返。ADO.NET 有 \`SqlBulkCopy\`，PostgreSQL 有 \`COPY\`，Dapper 也能执行表值参数。批量仍要定义失败语义：整批回滚，还是记录失败行继续？后者必须可重入，用业务键去重。超时要按批大小放大，但不能无限；宁可 5000 行一批可重试，不要 500 万行一个事务锁到天黑。

\`Query<dynamic>\` 方便原型，生产会失去列存在性检查和重命名安全性。宁可手写 DTO。\`buffered: false\` 的 Dapper 流式查询在用完前占用连接，把它放进 ASP.NET 请求且再去查别的表，会死锁或耗尽池。异步方法后缀 \`Async\` 必须真的走异步 provider API；包装 \`Task.Run\` 挡同步 SQL 会浪费线程池。

连接字符串属于 Secret，按第一百零三章注入。不同环境的 \`Application Name\` 设成服务名，便于在数据库侧按应用查杀会话。只读副本：显式第二个连接字符串，不要把分析查询打到主库还指望连接池奇迹。会话级设置（\`SET statement_timeout\`）要理解是否被池复用脏掉，provider 的连接重置行为要验证。

和 EF 分工的实用规则：命令（状态变化）走 EF 以获得并发令牌和导航；复杂报表 SQL 走 Dapper 并贴 EXPLAIN 到 PR。禁止在热路径 \`FromSqlRaw\` 拼接用户字符串。把这一章的允许列表排序 demo 当作所有动态 SQL 的模板：先映射，再插入标识符，永远不要插入用户原文。

### 七、一次“三层访问”演练

同一用例里：EF 保存订单，Dapper 跑一条跨月报表，ADO 做 \`COPY\` 风格批量无关日志。强制三者共享一个 \`DbConnection\` + 事务，提交后再分别释放。再故意拆开连接，观察“报表看到半单”。给排序 API 写测试：\`sort=created\`、\`sort=total\`、\`sort=drop table\`——最后一项必须回落到默认列。把 CommandTimeout 设成 2 秒跑一条 \`pg_sleep(5)\`，确认取消路径。做完你才会相信选型表不是哲学题。

禁止热路径 Query<dynamic>。报表 SQL 必须带参数列表和预期行数级。用池空闲计数抓连接泄漏。Application Name 设成服务名，DBA 才能按应用杀会话。只读副本单独连接串，分析查询误打主库要在审查里一眼看见。异步 API 禁止 Task.Run 包同步读取。这几条能消掉大半“ADO 危险 / EF 慢”的宗教争论。

### 练习

1. 修改主 demo：把 \`requested\` 依次改成 \`"DROP TABLE orders"\`、\`""\`、\`"TOTAL"\`，观察它们如何回落到 \`created_at\`；往 \`allowedSorts\` 新增 \`["amount"] = "total_amount"\` 验证映射生效；把 \`StringComparer.OrdinalIgnoreCase\` 换成默认比较器后再请求大写形式，确认行为差异。
2. 脱离示例独立实现 \`static string BuildOrderBy(IReadOnlyList<string> requested, IReadOnlyDictionary<string, string> allowed)\`：支持多列排序与 \`ASC\`/\`DESC\` 方向（方向同样走允许列表），未知列直接报错而不是静默回落，用参数化测试覆盖 \`sort=drop table\`、\`sort=created,-total\` 等输入。
3. 生产场景：给毕业项目落地“EF 写、Dapper 读”的分工——订单保存走 \`DbContext.SaveChanges\`，跨月报表用 \`QueryAsync<OrderRow, LineRow, OrderRow>\` 多映射（\`splitOn\` 对准 \`LineId\`）并把 EXPLAIN 贴进 PR；把 \`CommandTimeout\` 设 2 秒跑一条 \`pg_sleep(5)\` 验证取消路径；批量导入用 \`SqlBulkCopy\`/\`COPY\` 按 5000 行分批、整批失败可重入、按业务键去重；连接串加 \`Application Name=graduation-api\`，在数据库侧验证能按应用查杀会话。

`,
    code: `// ============================================================
// 数据访问三个保命习惯（纯 C# 模拟，无真实数据库）：
//   1. 参数化 vs 字符串拼接：注入只发生在「用户输入变成代码」的地方
//   2. 动态排序白名单：表/列名不能参数化，只能映射
//   3. 瞬态故障重试：连接断开要重试，但只重试「值得重试」的
// ============================================================

// ---------- 1. 参数化 vs 拼接 ----------
// 危险：用户输入直接拼进 SQL 文本 → 输入被当成代码执行。
var userSearch = "'; DROP TABLE orders; --";

// ❌ 拼接（模拟生成出的危险 SQL）
string injected = $"SELECT id FROM orders WHERE customer = '{userSearch}'";
Console.WriteLine($"拼接结果：{injected}");
Console.WriteLine("  ↑ 整条语句被改写：WHERE 变恒真，后面跟 DROP");

// ✅ 参数化：用户输入永远是「值」，不可能是「代码」
// 真实调用：new SqlCommand("... WHERE customer = @customer") + Parameters.AddWithValue
var safe = ("SELECT id FROM orders WHERE customer = @customer", new Dictionary<string, object> { ["@customer"] = userSearch });
Console.WriteLine($"参数化：{safe.Item1}\\n  @customer = {safe.Item2["@customer"]}（整个字符串只匹配一个名字，DROP 只是普通文本）");

// ---------- 2. 动态排序必须从允许列表映射，不能拼接用户原文 ----------
// ORDER BY 的列名不能作为参数（SQL 语法位置），只能白名单映射。
var allowedSorts = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
{
    ["created"] = "created_at",
    ["total"] = "total_amount",
    ["id"] = "id",
};

string requested = "total; DROP TABLE users";
string column = allowedSorts.TryGetValue(requested, out var safeColumn)
    ? safeColumn
    : "created_at";   // 未知值回落默认列，绝不透传

string sql2 = $"SELECT id, total_amount FROM orders ORDER BY {column} DESC";
Console.WriteLine($"\\n恶意排序参数 {requested}\\n  → 白名单回落：{sql2}");

// ---------- 3. 瞬态故障重试 ----------
// 只重试瞬态错误（连接断开/超时/死锁牺牲品），且总预算要封顶；
// 唯一键冲突这类业务错误重试一万次也不会成功。
static async Task<string> ExecuteWithRetryAsync(Func<int, Task<string>> operation, int maxRetries = 3)
{
    for (var attempt = 1; ; attempt++)
    {
        try
        {
            return await operation(attempt);
        }
        catch (TimeoutException) when (attempt <= maxRetries)   // 瞬态：值得重试
        {
            var backoff = TimeSpan.FromMilliseconds(50 * Math.Pow(2, attempt - 1));
            Console.WriteLine($"  attempt {attempt} 超时，{backoff.TotalMilliseconds:F0}ms 后重试");
            await Task.Delay(backoff);
        }
        // InvalidOperationException（唯一键冲突）没有 when 子句 → 直接向上抛：
        // 业务错误重试无意义，还会放大数据库压力。
    }
}

Console.WriteLine("\\n带重试的查询（前 2 次模拟瞬态超时）：");
var result = await ExecuteWithRetryAsync(async attempt =>
{
    await Task.Delay(10);
    if (attempt <= 2) throw new TimeoutException();
    return "42 rows";
});
Console.WriteLine($"最终结果：{result}");
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch98",
    group: "第十六部分 数据与分布式系统",
    icon: "⚡",
    title: "Redis 与分布式缓存",
    content: `## 第九十九章　Redis 与分布式缓存

缓存降低延迟、吸收读流量，同时引入过期、穿透、击穿、雪崩和“缓存里的权限比数据库新/旧一轮”。Redis 是工具，不是第二个真相源。把购物车、库存、会话**只**放在 Redis 且无持久化/无回放，等于把可用性绑在一台内存数据库的运维水平上。

### 一、Cache-aside、击穿与 TTL 抖动

Cache-aside（旁路缓存）最常见：读先看缓存，未命中查库并回填；写库成功后 **删缓存**（或短 TTL 覆盖）。Read-through / write-through 把复杂性挪到缓存层，一致性问题不会消失。

| 问题 | 现象 | 对策 |
| --- | --- | --- |
| 穿透 | 反复查不存在的键 | 短 TTL 空值、布隆过滤、参数校验 |
| 击穿 | 热点 key 过期，并发打穿 DB | single-flight / 锁单飞、逻辑过期 |
| 雪崩 | 大批 key 同时过期 | TTL + jitter（见主 demo） |
| 惊群 | 实例同时回源 | 每键合并、限制回源 QPS |

\`\`\`text
读：GET key → 未命中 → 单飞查库 → SET key value EX ttl+jitter
写：BEGIN; UPDATE db; COMMIT; DEL key   -- 删失败则依赖 TTL
\`\`\`

TTL 必须加抖动，避免整点同时过期。抖动比例 10%–20% 通常够用。空值也要短 TTL，否则不存在的 SKU 会变成永久打库。

### 二、数据类型：什么时候用什么

| 结构 | 典型用途 | 注意 |
| --- | --- | --- |
| STRING | 对象 JSON、计数、分布式锁值 | 巨大 JSON 会堵网卡 |
| HASH | 对象字段局部更新 | 无字段级 TTL |
| LIST | 简单队列 | 无消费确认，不适合关键投递 |
| SET / ZSET | 去重、排行、时间窗 | 无限增长要裁剪 |
| STREAM | 可消费组的日志 | 才接近“消息”，仍要幂等 |
| Pub/Sub | 易失广播 | **不保证**送达，不能当订单事件总线 |

Pub/Sub 断线即丢。需要积压、重放、消费组，用 Stream 或真正的消息系统（第一百章）。排行榜 ZSET 很好用，但不要把“全站无限历史”塞进一个 key。

### 三、键前缀、租户与反模式

键格式：\`app:env:tenant:resource:id:v{schema}\`。必须包含：

- 环境（防预发连生产 Redis）
- 租户（防跨租户串读）
- 影响结果的授权/版本/币种/语言维度

**反模式：把 Redis 当真相源。** 订单、库存账、资金流水必须在关系数据库（或具备 WAL/复制的专用存储）落地。Redis 持久化（RDB/AOF）有丢失窗口；集群 failover 可能丢写。缓存可以加速“当前库存展示”，扣减必须以数据库约束或有 fencing 的库存服务为准。

### 四、分布式锁的危险

\`SET key token NX EX 30\` 只能做粗互斥，不是正确性原语：

- 锁过期时业务还在跑 → 两个持有者。必须用 fencing token（单调版本），存储层拒绝过期一代的写。
- 解锁必须比较 token，不能 \`DEL key\` 误删别人的锁。
- Redlock 在时钟和少数派分区下仍有争议；资金类不要只靠 Redis 锁。
- 锁不能替代数据库唯一约束和乐观并发。

### 五、故障、超时与清单

Redis 超时或宕机时“全部回源”会压垮数据库。要有：回源限流、默认降级（旧缓存 / 默认值 / 失败）、连接复用、每命令超时、禁止同步 \`GetAwaiter().GetResult()\`。清单：

- [ ] 键含环境、租户、schema 版本
- [ ] TTL 有 jitter；热点有单飞
- [ ] 写后删缓存；接受短暂陈旧并有上限
- [ ] 授权不以缓存为唯一依据
- [ ] 锁带 token/fencing，或不使用锁
- [ ] Pub/Sub 不承担必须送达的业务事件
- [ ] Redis 故障演练过，数据库未被打满

### 六、集群、驱逐与多租户噪音

单机 Redis 适合开发；生产至少理解主从与集群槽。故障转移期间可能丢一小段写入，这再次证明它不能当账本。\`maxmemory\` 策略（\`allkeys-lru\` / \`volatile-ttl\` 等）必须与“键是否都有 TTL”一致：没有 TTL 又选 \`volatile-*\`，内存满时什么都不删，然后写入失败。监控 \`evicted_keys\`、命中率、复制延迟、阻塞客户端。

热 key 单槽过热是集群典型事故：某个租户的活动商品被全国刷新。拆 key（分片本地缓存 + 随机后缀）、或把极热数据放进实例内存（\`MemoryCache\`）+ 短 TTL，比单纯加 Redis 节点有效。大 key（几十 MB 的 HASH）会在网络和单线程命令上造成尖刺，\`KEYS *\` 和长时间 \`HGETALL\` 禁止在生产例行使用，改 \`SCAN\` 或拆结构。

多租户共享 Redis 要防“一户写爆”。按租户前缀加配额很难在开源 Redis 完美实现，至少：键空间隔离、连接账号 ACL、危险命令禁用（\`FLUSHALL\`、\`CONFIG\`、\`DEBUG\`）。预发与生产绝对分实例。本地开发用 Testcontainers，不要共用一个“公司公用开发 Redis”还互相 \`FLUSHDB\`。

客户端：设置连接超时、命令超时、重试次数上限；StackExchange.Redis 的 \`AbortOnConnectFail\` 等选项要理解。熔断后短时间直接走降级，避免重连风暴。序列化选 JSON 源生成或紧凑二进制，并带 schema 版本字节。压缩只对够大的值有意义，先测量。把缓存命中率当业务指标而不是虚荣指标：命中率 99% 但那 1% 打穿的是最热查询，数据库照样死。

### 七、缓存事故剧本

剧本 A：零点 TTL 对齐，全站首页同时过期。加 jitter 后曲线应打散。剧本 B：不存在的 SKU 被爬虫扫，空值未缓存，数据库 QPS 直线上升。剧本 C：用 Redis 锁“保证”库存，锁过期后双写，数据库无版本列。剧本 D：把订单状态只写 Redis，实例内存满驱逐后订单消失。对每一剧本写下：检测指标、止损、代码修复、是否违反“缓存非真相”。毕业项目至少自动复现 A 与 D 的反例测试。

给 Redis 单独容量预算：每副本连接、命令超时、禁 KEYS/FLUSHALL 的 ACL、预发生产隔离。本地 Testcontainers，禁止公司公用开发实例互相冲洗。命中率按接口拆开，首页 99% 不能掩盖下单校验 10%。键漏租户比忘了 TTL 更严重。集群槽倾斜时先拆热 key，再加节点。Pub/Sub 断线即丢，订单事件走 Stream 或真总线。

缓存设计评审会问五件事：键是否含租户与版本？TTL 有没有抖动？写后删除失败怎么办？Redis 宕机是否限流回源？锁有没有 fencing 还是根本不该用锁？答不全就不要合并。把这五问贴进 PR 模板。演示日当场杀掉 Redis，下单 API 必须仍返回正确错误或降级成功，而不是 30 秒超时 cascade。这比再背一遍“旁路缓存”定义更接近生产。

把 Redis 课堂收成一份可执行的周计划。周一：画出每个缓存键的组成，强制包含环境、租户、资源和 schema 版本，缺一列就重画。周二：给 TTL 加上百分之十五左右的抖动，并用脚本创建一千个键观察过期时间是否打散。周三：对不存在的 SKU 做空值短缓存，再用爬虫式循环证明数据库 QPS 不再被穿透。周四：写后删除失败时只依赖 TTL 的路径要有指标，不能沉默。周五：在预发杀掉 Redis，确认回源被限流、页面可降级、错误预算没有被一次演练烧光。周末把 Pub/Sub 从订单事件路径上拆掉，改到第一百章的总线。若某天做不完，宁可减少键的数量，也不要留下一个“临时永不过期”的热键。分布式锁如果没有 fencing 和数据库约束，就从设计里删掉，改用唯一索引和乐观版本。把这周的笔记连同键命名表检入仓库，下个新人才能接着做而不是重猜。

### 练习

1. 修改主 demo：把 \`AddJitter\` 的 \`ratio\` 分别改成 0 和 0.5，各跑 5 个键，观察 TTL 是否重新对齐、抖动范围如何变化；把 \`Random(2026)\` 的固定种子换成 \`Random()\`，体会测试可重复与生产随机的取舍；再想想穿透场景下空值缓存该配多短的 TTL。
2. 脱离示例独立实现 \`static async Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory)\`：未命中时单飞（同一 key 的并发请求只放一个回源，其余等待同一任务），回填时写入带 15% 抖动的 TTL，工厂查出空值时写 30 秒空对象缓存防穿透；用 \`Task.WhenAll\` 发起 100 个并发读，断言 \`factory\` 只执行一次。
3. 生产场景：给毕业项目的商品详情接口加 cache-aside：键按 \`app:env:tenant:product:{id}:v{schema}\` 构造，写库成功后删缓存、删除失败靠 TTL 兜底并打指标；用 Testcontainers 起本地 Redis 写集成测试，再演练“预发杀掉 Redis 后下单 API 仍返回正确错误或降级，而不是 30 秒超时”；把命中率按接口拆开打点，验证首页 99% 是否掩盖了下单校验的低命中。



`,
    code: `// ============================================================
// 分布式缓存三件事（纯 C# 模拟，无真实 Redis）：
//   1. TTL + jitter：大量键同一时刻集体过期 = 集体回源 = 缓存雪崩
//   2. 击穿防护（single-flight）：热键过期瞬间只放一个请求回源
//   3. 键前缀规范：namespace:entity:tenant:id——可扫描、可按租户清理
// ============================================================

// ---------- 1. TTL + jitter ----------
// 固定种子：教学输出可重复。生产必须用不可预测随机，否则整集群同时抖动到同一偏移。
var random = new Random(2026);
TimeSpan baseTtl = TimeSpan.FromMinutes(10);

for (int i = 1; i <= 5; i++)
{
    TimeSpan ttl = AddJitter(baseTtl, 0.15, random);
    Console.WriteLine($"key-{i}: {ttl.TotalSeconds:F0}s（±15% 抖动，过期时刻被摊开）");
}

static TimeSpan AddJitter(TimeSpan value, double ratio, Random random)
{
    double factor = 1 - ratio + random.NextDouble() * ratio * 2;
    return TimeSpan.FromMilliseconds(value.TotalMilliseconds * factor);
}

// ---------- 2. 击穿（stampede）与 single-flight ----------
// 场景：热键过期的一毫秒里，50 个并发请求同时 miss → 50 个都去打数据库。
// 方案：第一个 miss 负责回源，其余等它（Redis 侧可用 SETNX 锁 / 客户端
//      可用 SemaphoreSlim 或 HybridCache 的单飞语义）。
// 实现（StampedeCache 类）声明在本文件末尾——顶级语句必须先于类型声明。

var cache = new StampedeCache();
Console.WriteLine("\\n并发 5 个请求同取热键 product-100：");
var tasks = Enumerable.Range(1, 5)
    .Select(_ => cache.GetOrLoadAsync("product-100", async () =>
    {
        await Task.Delay(50);              // 模拟一次昂贵的数据库查询
        return "product-100 从数据库加载";
    }));
var loaded = await Task.WhenAll(tasks);
Console.WriteLine($"回源次数：1 次（而不是 {loaded.Length} 次）——数据库只被打了一下");

// ---------- 3. 键前缀规范 ----------
// 好的键空间：能按「应用:实体:租户」扫描与批量失效；坏的键空间：无结构、无法清理。
static string BuildKey(string ns, string entity, string tenant, string id) =>
    $"{ns}:{entity}:{tenant}:{id}";

Console.WriteLine("\\n键设计：");
Console.WriteLine($"  {BuildKey("shop", "order", "tenant-a", "1001")}（可按 shop:*:tenant-a:* 失效整个租户）");
Console.WriteLine($"  {BuildKey("shop", "session", "tenant-b", "u-42")}（可按 shop:session:* 清全部会话）");
Console.WriteLine("  反例 user42_orders：无分隔结构，既不能扫描也不能按租户失效");

// ---------- 击穿防护实现 ----------
sealed class StampedeCache
{
    private readonly Dictionary<string, string> _store = new();
    // 教学简化：一把全局锁。生产要按 key 分锁，否则无关热点会互相排队。
    // SemaphoreSlim 只保护本进程；多副本还要 Redis SET NX EX 或 HybridCache。
    private readonly SemaphoreSlim _gate = new(1, 1);   // 同键只有一个回源者

    public async Task<string> GetOrLoadAsync(string key, Func<Task<string>> loadFromDb)
    {
        if (_store.TryGetValue(key, out var hit))
        {
            Console.WriteLine($"  {key}: 缓存命中");
            return hit;
        }

        await _gate.WaitAsync();          // 排队的请求在这里等
        try
        {
            if (_store.TryGetValue(key, out hit))   // 双检查：排队期间别人已回填
            {
                Console.WriteLine($"  {key}: 排队期间已回填，直接复用");
                return hit;
            }
            Console.WriteLine($"  {key}: miss，持锁回源（其余并发在等）");
            hit = await loadFromDb();
            _store[key] = hit;
            return hit;
        }
        finally { _gate.Release(); }
    }
}
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch99",
    group: "第十六部分 数据与分布式系统",
    icon: "📨",
    title: "消息系统、Outbox、Inbox 与 Saga",
    content: `## 第一百章　消息系统、Outbox、Inbox 与 Saga

消息把服务在时间上解开，但主流代理给你的是 **at-least-once**：重复、延迟、乱序、毒消息是正常天气，不是异常天气。按“恰好一次、全局有序、永不丢”去设计，会在 Kafka 分区重平衡的第一周破产。

### 一、至少一次、幂等与契约

命令：“请创建发货单”。事件：“订单已支付（事实）”。消息头最少包含 \`messageId\`、\`type\`、\`schemaVersion\`、\`occurredAt\`、\`correlationId\` / \`causationId\`、租户。载荷是独立契约，**不要**把 EF 实体直接丢进总线。

Schema 演进：只加可选字段；改含义就升 \`schemaVersion\` 并双读。删除字段先停写再停读。JSON 比二进制更易演进；选 protobuf/Avro 就要有兼容规则和注册表。

### 二、Outbox / Inbox

没有 Outbox 的“先写库再发消息”会在进程崩溃时丢事件或只发了消息没写库。正确做法：

1. 同一数据库事务写入业务行 + \`outbox\` 行。
2. 后台轮询/CDC 发布到代理。
3. 发布成功后标记，保留足够长以便运维重放。
4. 消费者 \`inbox(messageId)\` 唯一约束：插入成功才处理，重复投递直接跳过（主 demo）。

清理 Inbox 必须大于代理的最大重投窗口，否则删除后旧消息又当成新的。

### 三、Saga、毒消息、分区键

跨服务用编排（中心协调者）或编舞（事件驱动）+ **补偿**。补偿不是 \`ROLLBACK\`：退款、释放库存、发更正邮件都可能失败，必须幂等、可重试、可观测。长事务锁库存直到支付完成，会在支付超时里变成雪崩。

毒消息：反序列化失败、违反硬规则 → 有限次后进 DLQ，带原因、堆栈摘要、\`messageId\`，并告警到有人的值班。DLQ 不是垃圾桶，要有重放 runbook。瞬时超时/死锁才重试，且重试带抖动，避免集体打下游。

顺序只在业务键内保证：同一 \`orderId\` 进同一分区。全局顺序限制吞吐且大多数业务不需要。消费者用版本号拒绝“旧事件覆盖新状态”（支付完成之后的“订单创建”迟到）。

### 四、云总线对比

| 系统 | 模型 | 顺序 | 重放 | 典型用途 |
| --- | --- | --- | --- | --- |
| Azure Service Bus | 队列 + 主题订阅 | 会话内有序 | 有锁/死信 | Azure 上的命令与事件 |
| Amazon SQS + SNS | 队列 + 扇出 | 标准无序；FIFO 受限 | 可见性超时 | AWS 解耦，简单消费 |
| Apache Kafka | 分区日志 | 分区内有序 | 长期保留、偏移重放 | 高吞吐事件、对账、流处理 |
| RabbitMQ | 队列 | 队列大致 FIFO | 有限 | 传统企业任务分发 |

选型看：是否要日志重放、多订阅者独立进度、事务 Outbox 怎么接、运维是否有集群能力。不要因为教程示例用内存队列，就把生产也建成进程内 \`Channel<T>\`。

### 五、清单

- [ ] 生产者有 Outbox，消费者有 Inbox
- [ ] 所有处理幂等，重复投递可演示
- [ ] 分区键 = 需要顺序的业务键
- [ ] Schema 有版本，滚动发布双读
- [ ] DLQ 有 owner 和重放步骤
- [ ] Saga 补偿失败可重试且可观测

### 六、投递语义、积压与观察

至少一次之外，还有“最多一次”（丢了也不重复）和“有效恰好一次”（至少一次 + 幂等）。业务上你要的几乎总是第三种，但它是**你的作业**，不是代理开关。Kafka 的 idempotent producer 只保证生产者到分区不重复，不保证消费者处理恰好一次。不要在幻灯片上写“我们用了 exactly-once Kafka”就结案。

积压（lag）是一等指标。消费者挂了两小时，恢复时会用过期价格处理订单。策略：滞后 SLA、加速扩容、丢弃过期事件（带业务证明）、或进入降级只处理关键类型。重放全量日志前先确认下游扛得住，否则一次“补数据”变成第二次事故。保留期要覆盖最长排障窗口，太短则无法重放，太长则成本与合规（PII）出问题。

消息体避免巨大附件：对象进对象存储，消息只带 key。PII 按数据分类加密或令牌化。日志打印 \`messageId\` 和类型，不打印完整载荷。追踪：\`traceparent\` 从 HTTP 打进消息头，消费时继续 span，否则 Saga 在 Jaeger 里断成孤岛。

本地开发可用 Testcontainers 的 Kafka/Rabbit，但序列化、分区键、重试头要与生产一致。内存 \`Channel<T>\` 只能测应用逻辑，测不了重平衡和重复投递——所以主 demo 的 Inbox 去重要在真实代理上再跑一遍重复发布。把“发了消息”的单元测试当成必要但不充分。

落地清单再加厚：生产者不得在 HTTP 请求线程同步发网；Outbox 轮询要有积压告警和毒行隔离；消费端并发按分区键分片，避免同一订单并行处理。Schema 注册表（哪怕是仓库里的 JSON 文件）比口头“我们加个字段”可靠。补偿事务写清楚幂等键。把 messageId 打进所有日志和度量标签。若团队还在争论“要不要上 Kafka”，先把 Outbox/Inbox 跑绿——那才是语义，代理可以后换。

消息系统验收故事：用户支付成功，库存服务重启两次，同一条 OrderPaid 到达三次，库存只减一次；一条无法反序列化的毒消息进入 DLQ 并告警；人为乱序先到 Cancel 再到 Create，状态机拒绝回退。把这三条做成自动测试。再加观察：Outbox 积压分钟数、消费滞后、DLQ 深度。没有这三条测试的“我们上了 Kafka”只是运维故事，不是设计完成。Saga 补偿失败要能重放，退款接口必须幂等。把 correlationId 从 HTTP 打到消息再到日志，排障才能一条线看完。

消息部分用三天把语义做硬。第一天只做 Outbox：下单事务里同时插入业务行与 outbox 行，故意在发布前杀掉进程，重启后消息仍在，证明没有“先写库再发网”的窗口。第二天做 Inbox：同一 messageId 连发五次，库存只动一次，测试必须自动。第三天做毒消息与乱序：无法反序列化的进 DLQ 并告警；先到取消后到创建的事件被状态机拒绝。然后才讨论 Kafka 还是 Service Bus——代理可以换，这三天的语义不能换。积压告警按分钟，超过业务 SLA 就扩消费者或丢弃过期的非关键事件。载荷不带大附件，对象进第一百零二章的存储，消息只带键。PII 按分类脱敏。把分区键等于 orderId 写进契约，禁止用随机键还要求顺序。补偿退款接口必须带幂等键，失败可重放。做完这些，第一百章才算从词汇变成肌肉记忆。

### 十日落地：消息与 Saga

按日执行，写不下就延期，不许跳日。每一天结束要有仓库里的证据（测试、文档或演练记录），口头“做过了”不算。

1. 画出命令与事件的区别，给现有一条消息补齐编号、类型、版本、时间、关联编号和租户。
2. 实现业务表与发件箱同行提交，发布前杀进程，重启后消息仍在。
3. 收件箱对同一编号连收五次只处理一次，测试自动红绿。
4. 无法反序列化的消息进死信并告警，手册写明谁负责重放。
5. 乱序到达时用版本拒绝旧事件覆盖新状态，补一条自动化。
6. 分区键等于需要顺序的业务键，随机键不得要求全局顺序。
7. 补偿退款带幂等键，失败可重放，日志能用关联编号串起来。
8. 积压分钟数与死信深度进仪表盘，超过业务时限告警。
9. 载荷不带大附件，对象键指向存储，个人信息按级别脱敏。
10. 写一页为什么选某总线，并说明换总线也不改这十日语义。

### 答辩常见问：消息
下面每问都要能用仓库里的文件回答，答不出来就还没做完。
1. 问：没有发件箱会怎样？ 答：进程在写库后发网前崩溃会丢事件或只发不写，必须同事务。
2. 问：为何还要收件箱？ 答：至少一次投递会重复，唯一约束按消息编号去重。
3. 问：死信谁负责？ 答：有值班主人、原因字段和重放手册，不是垃圾桶。
4. 问：全局顺序要吗？ 答：只要业务键内顺序，全局顺序会限制吞吐。
5. 问：Saga 补偿失败呢？ 答：补偿本身也要幂等可重试可观测，不是数据库回滚。
6. 问：能不能只用内存队列毕业？ 答：开发可以，答辩必须可重放的真实代理或等价说明。
7. 问：大文件放消息体吗？ 答：不，放对象存储，消息只带键。
8. 问：如何串起一次下单？ 答：关联编号从 HTTP 打到消息再到日志。
把这些问题打印出来，找同事当评委抽三问。抽不到证据的那一问，就是下一周唯一任务。


十日结束后开一次十五分钟回顾：哪一天没有证据、哪一条会在毕业答辩被问到。把缺口列进下一周，而不是开始下一章收藏。

### 练习

1. 修改主 demo：往 \`deliveries\` 里再加一条同 \`messageId\` 的 \`OrderPaid\` 和一条新 \`messageId\` 的 \`OrderCancelled\`，观察跳过与处理的分界；把 \`inbox\` 从 \`HashSet<Guid>\` 换成 \`List<Guid>\` 配合 \`Contains\`，模拟 10 万次投递对比两者耗时，体会该把唯一约束建在数据库还是内存。
2. 脱离示例独立实现 \`InboxProcessor\`：\`TryBegin(messageId)\` 用 \`ConcurrentDictionary<Guid, byte>.TryAdd\` 模拟数据库唯一约束，业务处理成功与 inbox 占用一起提交、失败一起释放以便重投重试；用两个并行 \`Task\` 验证同一 \`messageId\` 只有一个能进入处理分支。
3. 生产场景：在毕业项目落地完整 Outbox/Inbox 链路——下单事务同插业务行与 \`outbox\` 行（含 messageId、type、schemaVersion、occurredAt），发布前 kill -9 杀进程、重启后消息仍在；同一 \`OrderPaid\` 重复投递三次库存只扣一次；无法反序列化的毒消息 3 次后进 DLQ 并告警；分区键取 \`orderId\` 保证同单有序——这三条全部写成自动化测试当验收。




`,
    code: `// ============================================================
// Inbox 去重：消息系统默认至少一次投递，重复是天气不是异常。
// HashSet.Add 返回 false 表示已处理过——消费者必须幂等。
// 生产里 Inbox 是带过期时间的数据库表，不是进程内集合。
// ============================================================
var inbox = new HashSet<Guid>();
var messageId = Guid.NewGuid(); // 同一业务消息应携带稳定 MessageId
var deliveries = new[]
{
    new Message(messageId, "OrderPaid"),
    new Message(messageId, "OrderPaid"), // 第二次投递：必须跳过副作用
};

foreach (var message in deliveries)
{
    // Add 失败 = 已见过该 Id。先记 Inbox 再处理，或同一事务提交，避免“处理了但没记下”。
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
    title: "gRPC、SignalR、GraphQL 与实时通信",
    content: `## 第一百零一章　gRPC、SignalR、GraphQL 与实时通信

HTTP JSON、GraphQL、gRPC、SignalR、原始 WebSocket 解决的问题不同。用错的典型症状：简单 CRUD 先造一层 GraphQL、浏览器硬啃 HTTP/2 trailers、把 SignalR 连接 ID 当用户主键，或者用无限服务器流把内存当队列。

### 一、何时 HTTP 就够了

| 场景 | 优先 | 原因 |
| --- | --- | --- |
| 公共 CRUD、Webhook、浏览器 fetch | HTTP JSON | 缓存、网关、OpenAPI、人人会调 |
| 同步内部调用、强类型、多语言 | gRPC | protobuf、deadline、流 |
| 向用户推价格/通知/协作光标 | SignalR | 回退 SSE/长轮询，有用户/组模型 |
| 自定义二进制帧、已有 WS 协议 | 原始 WebSocket | 你必须自己做心跳、重连、版本 |

若客户端是浏览器且调用不频繁，**HTTP 足够**。上 gRPC 是为了契约、流和延迟，不是因为“看起来更微服务”。对外部合作伙伴，HTTP + OpenAPI 的生态成本通常更低。

### 二、protobuf 与 deadline

字段编号一旦发布，**禁止改含义或复用编号**。新增字段用新号；删除写 \`reserved\`。\`optional\` / 默认值行为要写进兼容性文档：客户端不知道的新字段应忽略，服务器对缺省字段用默认值。

\`\`\`protobuf
message OrderReply {
  string id = 1;
  int64 total_cents = 2;
  reserved 3; // 曾经是 internal_flag，永不复用
}
\`\`\`

Deadline 必须从入口传到下游：ASP.NET 的 \`RequestAborted\`、gRPC \`CallOptions.Deadline\`、\`CancellationToken\`。没有 deadline 的内部调用会在依赖变慢时把线程和连接吃光。状态码：\`NotFound\` / \`InvalidArgument\` / \`FailedPrecondition\` 给客户端可处理错误；未知异常不要泄漏内部类型名。业务错误也可以用 trailer 或富消息，但要稳定。

四种流：Unary、Server streaming、Client streaming、Bidirectional。流不是无限缓冲区——限制消息大小、未处理队列和并发；客户端断开后取消生产。背压失败的表现是内存线性涨，而不是“实时性更好”。

### 三、SignalR 扩展、鉴权、补拉

多实例时，进程内连接表互不可见，必须有 **backplane**（Redis）或 Azure SignalR Service。Redis backplane 适合中小规模；连接风暴和大规模扇出更适合托管服务。\`ConnectionId\` 是短期传输标识，重启即变，**绝不能**当外键。身份来自认证声明，再用 \`IUserIdProvider\` 映射。

Hub 方法与 MVC 一样：\`[Authorize]\`、输入校验、限流、防伪造载荷。匿名 Hub 加“管理广播”等于对互联网开放内部事件。分组名必须来自服务端权威（\`tenant:{id}\`），不要让客户端随便 \`JoinGroup("admins")\`。

断线会丢消息或重复。关键业务不能只靠推送：每条事件带单调 \`sequence\`（主 demo），客户端发现缺口就走 HTTP 补拉。重连后先拉游标再订阅，避免“实时系统偶尔少一单”。

### 四、GraphQL 与 Hot Chocolate 的生产边界

GraphQL 适合多个客户端需要不同投影、资源关系天然成图的读取 API；它不是“更高级的 REST”，简单 CRUD 和公共 Webhook 往往继续用 HTTP + OpenAPI 更便宜。.NET 常用 Hot Chocolate：

\`\`\`csharp-snippet
builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>()
    .AddAuthorization()
    .AddProjections();

app.MapGraphQL().RequireAuthorization();
\`\`\`

生产必须处理：

- resolver 的 N+1 用 DataLoader / 批量查询解决；不要把 EF \`IQueryable\` 无边界暴露给客户端。
- 按字段做授权，限制 query depth、complexity、别名数量、分页上限和总执行时间；大查询照样能打垮数据库。
- 公网优先 persisted operations / allowlist；是否开放 introspection 由威胁模型决定，关闭 introspection 也不能代替授权。
- schema 演进优先加字段和 \`@deprecated\`，先看字段使用遥测再删除；订阅只做通知，关键状态仍可查询补拉。
- 集成测试要执行真实文档并断言 SQL 次数、跨租户拒绝和复杂度上限，不只测 resolver 方法。

### 五、清单

- [ ] 选型表能向评审解释“为什么不是 HTTP”
- [ ] protobuf 编号不复用，有 reserved
- [ ] deadline / CancellationToken 贯穿调用链
- [ ] 流有大小和队列上限
- [ ] SignalR 多实例有 backplane；Hub 有鉴权
- [ ] 关键事件可按序号补拉
- [ ] GraphQL 有深度/复杂度/分页上限，DataLoader 与字段授权有集成测试

### 六、运维与安全细节

gRPC 在网关上要开启 HTTP/2、正确的 TLS 与最大消息尺寸。默认几 MB 的限制被一张“导出全部订单”打爆时，应在业务层分页，而不是把限制调到 100MB。健康检查用独立的 grpc.health.v1，不要把业务 Unary 当探针。反射服务（server reflection）只在开发打开。截断 deadline 的传播：入口剩 200ms，下游再设 2s，等于无视预算——用剩余时间或显式 \`RequestTimeout\` 递减。

SignalR 的扩展模式要测广播放大：给 10 万用户推同一条，Redis backplane 可能先把自己打满。分组应粗（按租户、按订单）而不是一人一组还广播。消息要小，大payload 改成“推通知 + HTTP 拉详情”。身份：Cookie 认证的 Hub 要注意 CORS 与 CSRF；JWT query string 会出现在日志和 Referer，优先用协商阶段的 header 或 cookie。连接数是容量规划的一部分，按第一百零六章压测，不要只压 REST 再假设 Hub “差不多”。

协议演进与 HTTP API 相同：加字段、禁复用编号、准备两个客户端版本共存。浏览器若必须调 gRPC，用 grpc-web 或纯 HTTP 并行端点，不要指望所有企业代理理解 trailers。服务网格重试 gRPC 时同样要求幂等，否则网格的“贴心重试”会变成双下单。把这一章和第九十九、一百章一起做毕业项目的“通知与价格推送”，但钱相关状态仍以 HTTP 查询与数据库为准。

练习：给价格推送加 sequence，客户端故意丢一条，断言会走补拉。给 Hub 写匿名调用管理方法必须 401。压测 1 万空闲连接看内存，再广播一条 2KB 消息看 backplane。gRPC 设 100ms deadline 调一个 500ms 下游，确认取消而不是堆请求。把 protobuf 字段 3 reserved 写进评审检查项。实时系统的正确性来自“推送 + 可查询”，不是更亮的 WebSocket 指示灯。

### 十日落地：gRPC 与 SignalR

按日执行，写不下就延期，不许跳日。每一天结束要有仓库里的证据（测试、文档或演练记录），口头“做过了”不算。

1. 用表格向评审解释本接口为什么不是普通 HTTP，写不出来就维持 HTTP。
2. 契约字段编号不复用，删除写保留，新旧客户端各跑一次。
3. 入口剩余时间递减到下游，禁止下游另写更长截止时间。
4. 限制单条消息大小和未处理队列，断开后取消生产。
5. 多实例广播必须有背面总线或托管服务，否则文档标明单实例。
6. 集线器方法全部鉴权，分组名由服务端按租户计算。
7. 事件带序号，客户端丢包后走 HTTP 补拉并有测试。
8. 压测空闲连接数与一条广播的放大，结果写入容量页。
9. 浏览器流量保持 HTTP 或 grpc-web，不假设所有代理懂拖尾。
10. 钱与库存状态以查询为准，推送只提示刷新。

十日结束后开一次十五分钟回顾：哪一天没有证据、哪一条会在毕业答辩被问到。把缺口列进下一周，而不是开始下一章收藏。

### 练习

1. 修改主 demo 的两个部分：缺口检测——往 \`incoming\` 加一条 \`RealtimeEvent(102, "price.updated")\` 让序号连续，确认 gap 提示消失；再加一条倒退事件（如 99），观察 \`lastSeen\` 被拉低后后续事件如何被误判；把判断条件从 \`!=\` 改成 \`>\`，体会缺口检测背后的严格递增假设。deadline——把 \`CallDownstream\` 的预算参数改成 600ms，观察放行分支；再把 \`cost\` 改成 5 秒，确认两条调用都变成取消，体会「预算是入口剩余时间，不是下游想要的时长」。
2. 脱离示例独立实现 \`SequenceTracker\`：\`Observe(long sequence)\` 返回本次发现的缺口区间，支持乱序到达（103 先到、102 后到则缺口自动关闭）与重复事件忽略，用测试覆盖 100→103→102 与同号重放两条路径。
3. 生产场景：给毕业项目的价格推送落地“推送 + 可查询”：Hub 方法全部 \`[Authorize]\`，分组名由服务端按 \`tenant:{id}\` 计算而不接受客户端传入；事件带 sequence，客户端重连后先走 HTTP 补拉再订阅；gRPC 内部调用把入口剩余时间递减进 \`CallOptions.Deadline\`，用 100ms 预算调 500ms 下游验证取消传播而不是堆请求；protobuf 废弃字段 3 写 \`reserved\` 并让新旧客户端各跑一次。





`,
    code: `// ============================================================
// 实时通信的两个生产习惯（纯 C# 模拟）：
//   1. 推送不保证送达：事件带单调序号，发现缺口走 HTTP 补拉
//   2. deadline 递减传播：把入口「剩余预算」传给下游，而不是各设各的
// ============================================================

// ---------- 1. 序号缺口检测 + 补拉 ----------
// SignalR 断线重连 / gRPC 流取消 / 服务器重启都会丢消息。
// 关键业务不能只靠推送：每条事件带单调 sequence，客户端发现缺口就走 HTTP 补拉。
long lastSeen = 100;
var incoming = new[]
{
    new RealtimeEvent(101, "price.updated"),
    new RealtimeEvent(103, "order.changed"),   // 102 在断线中丢了
};

foreach (var item in incoming)
{
    if (item.Sequence != lastSeen + 1)
    {
        Console.WriteLine($"gap: expected {lastSeen + 1}, got {item.Sequence}");
        // 生产代码：在这里调 GET /events?after=lastSeen 补齐缺口，
        // 不要等下一条推送把 102 送来——它永远不会来
    }
    lastSeen = item.Sequence;
    Console.WriteLine($"event {item.Sequence}: {item.Type}");
}

// ---------- 2. deadline 递减传播 ----------
// 下游固定耗时 500ms（模拟慢依赖）。正确的传播是「入口剩余时间」：
// 入口剩 200ms 就把 200ms 传下去，预算耗尽立即取消——而不是下游另设 2s，
// 让请求在慢依赖里排队，把线程、连接和内存吃光。
static string CallDownstream(string policy, TimeSpan budget)
{
    var cost = TimeSpan.FromMilliseconds(500);
    return budget >= cost
        ? $"{policy}：预算 {budget.TotalMilliseconds:F0}ms 覆盖 500ms 成本，调用完成"
        : $"{policy}：预算 {budget.TotalMilliseconds:F0}ms 耗尽，立即取消——不占线程干等";
}

Console.WriteLine();
Console.WriteLine(CallDownstream("递减传播（正确）", TimeSpan.FromMilliseconds(200)));  // 入口只剩 200ms
Console.WriteLine(CallDownstream("各设各的（错误）", TimeSpan.FromSeconds(2)));         // 无视入口预算，请求堆积

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

把 PDF、视频、用户头像塞进 \`bytea\` / \`varbinary(max)\`，备份和复制会先被文件拖垮。全文检索用 \`LIKE '%keyword%'\` 在百万行上不可用。对象存储和搜索引擎是派生系统：数据库仍是权限与元数据的权威。

### 一、S3 语义、预签名、分片

S3 兼容存储（AWS S3、MinIO、Azure Blob 的块语义略有不同）核心是：对象是按 key 寻址的不透明字节；覆盖通常是整体替换；列出是最终一致或弱一致（视实现）。成功 PUT 后立刻 GET 在少数系统上可能短暂 404，设计不要假设跨区域强一致。

数据库只存：\`bucket\`、\`key\`、大小、内容哈希、媒体类型、所有者、扫描状态、版本。**不要**用用户原始文件名当 key（路径穿越、覆盖、猜测）。用不可猜 ID：\`tenant/{tid}/objects/{uuid}\`。

预签名 URL 让浏览器直传，避开应用服务器带宽：

\`\`\`text
1. 客户端申请上传 → API 校验类型/大小配额 → 返回 PUT 预签名（1～15 分钟）
2. 浏览器直传对象存储
3. 客户端回调完成 → API HeadObject 核对大小/ETag → 病毒扫描 → 状态=Ready
\`\`\`

服务端必须复核最终对象，不能信客户端“我传完了”。下载同样走短时预签名 GET，或应用流式代理并做授权。URL 难猜 ≠ 授权。预签名泄漏等于限时万能钥匙，日志和 referrer 都可能带上 query。

分片（Multipart）：大文件按 5MB+ 块上传，\`UploadId\`、每片 ETag、\`CompleteMultipartUpload\` 原子合并。未完成的分片会一直计费，必须有生命周期中止过期上传。校验每片哈希，完成后再算全对象哈希。

### 二、病毒扫描、流式与 Range

上传限制：大小、MIME（用内容嗅探，不信扩展名）、速率、每租户配额。扫描在隔离网络/独立进程，**扫描完成前对象不可被其他用户下载**。失败则删除或隔离桶。

大文件处理：

- 不要 \`ReadAllBytesAsync\`。用 \`Stream\` 边读边哈希（主 demo）。
- 应用下载时支持 \`Range\`，便于视频拖动和断点续传；校验 Range 合法性，防止超大范围打存储。
- 反向代理/Kestrel 设请求体上限；预签名直传则在存储侧策略限制。

### 三、Elastic/OpenSearch 对数据库 FTS

| 方案 | 优点 | 缺点 |
| --- | --- | --- |
| PostgreSQL FTS / SQL Server Full-Text | 与事务同库，运维简单 | 相关性、分片、中文分析较弱 |
| Elasticsearch / OpenSearch | 相关性、聚合、规模 | 派生索引，最终一致，要重建能力 |
| 托管搜索（Azure AI Search 等） | 少运维 | 成本与锁定 |

搜索引擎**不是**订单真相源。通过 Outbox/CDC 同步，文档带 \`version\` / \`updatedAt\`，乱序到达时丢弃旧版本。必须能从数据库全量重建。查询强制租户过滤，避免“URL 里改个 q 看到别人订单”。接受列表页短暂落后于写入。

### 四、生命周期与清单

临时上传、失败分片、旧版本、软删除对象用生命周期规则（30 天后清）。备份数据库时定义对象的一致恢复点：元数据恢复到 T，对象桶恢复到 T±δ，要有对账任务补漏。清单：

- [ ] 元数据在数据库，字节在对象存储
- [ ] 预签名短时、窄权限；完成后服务端复核
- [ ] 分片有过期清理；流式处理，支持合法 Range
- [ ] 扫描通过前不可公开读
- [ ] 搜索可重建，查询带租户谓词

### 五、合规、成本与失败模式

对象存储账单由 API 请求次数、存储容量、出站流量和未完成分片组成。缩略图不要每次原图拉取；生命周期把冷发票推到低频存储。公开桶 + 可枚举前缀是经典事故：key 必须不可猜，列举权限收紧，公共读只用在真正的静态资产并配 CDN。跨账号复制与合规存储（不可变 WORM）用于第一百零八章的勒索场景。

病毒扫描不是“装个开源引擎就结束”：要有队列、重试、超时、人工隔离、以及扫描器本身的更新通道。扫描器被恶意样本打崩时，对象应保持不可下载，而不是 fail-open。内容嗅探：\`image/jpeg\` 声明但实际是 HTML 的文件，若以附件方式被浏览器渲染，会变成 XSS。下载响应加 \`Content-Disposition: attachment\` 和 \`X-Content-Type-Options: nosniff\`。

搜索集群的脑裂、磁盘打满、映射爆炸（每个文档不同字段）会让查询 500。映射要严格，动态字段关闭或限制。中文分析器选词方式影响召回，变更分析器等于要重建索引。不要把订单金额过滤只放在搜索引擎：金额以数据库为准，搜索只负责发现 ID 列表再回源校验权限。这样即使索引被投毒或落后，也不会显示别人的订单详情。

大文件测试用 0 字节、刚好上限、上限+1、中断分片、错误 Range。这些比再写一段哈希代码更能防止生产事故。把对象 key 写进备份对账作业：每天抽检“元数据为 Ready 的对象 Head 得存在”。

再写三条失败注入：预签名过期后 PUT 应失败；完成回调时 Head 大小不符应拒绝；分片上传中途放弃后生命周期作业能回收。搜索侧：重建索引时新旧别名切换，查询零中断；故意写一个旧 version 文档，断言被丢弃。Range 请求越界返回 416。把对象存储账单告警接上，未完成分片增长要能叫醒人。文件不是“存进去就好”，它是带生命周期的派生数据。

对象与搜索的毕业标准：上传走预签名，完成时服务端 Head 复核；扫描完成前不可读；大文件流式哈希；搜索可全量重建且查询带租户过滤。抽检作业每天对 Ready 对象做 Head。备份恢复后元数据与对象对账脚本有退出码。禁止把 PDF 推进 bytea“先顶一阵”。搜索结果点进详情必须回源数据库再做授权，防止索引落后或被投毒时泄露。

文件与搜索要当成有生命周期的产品，而不是一次上传。流程写成状态机：申请预签名、直传、服务端复核、隔离扫描、Ready、只读访问、过期或软删、生命周期清理。任一状态可以停留，但不能跳步。分片上传失败必须能被作业回收，否则账单会在无人注意时增长。Range 越界返回四百一十六。搜索索引带版本，乱序旧文档丢弃，别名切换重建，查询永远带租户谓词，点进详情必须回源库再授权。备份时定义元数据与对象的可接受时间差，并有对账脚本退出码。把病毒扫描失败设为 fail-closed。用零字节、上限、上限加一、中断分片四组测试防止“哈希函数写对了但流程是空的”。

### 十日落地：对象存储与搜索

按日执行，写不下就延期，不许跳日。每一天结束要有仓库里的证据（测试、文档或演练记录），口头“做过了”不算。

1. 元数据进数据库，字节进对象存储，键用不可猜标识，不用原文件名。
2. 预签名短时窄权限，完成后服务端复核大小与标签。
3. 扫描完成前对象不可读，扫描失败保持关闭而不是放开。
4. 分片上传有过期清理作业，未完成分片要能被看到并回收。
5. 流式计算哈希，禁止一次读入全部字节，支持合法范围请求。
6. 下载加附件处置与类型嗅探防护，授权不靠难猜网址。
7. 搜索可全量重建，文档带版本，乱序旧文档丢弃。
8. 查询强制租户条件，详情回源数据库再授权。
9. 备份定义元数据与对象的可接受时间差，对账脚本有退出码。
10. 用零字节、上限、上限加一、中断分片四组测试封流程。

### 答辩常见问：对象与搜索
下面每问都要能用仓库里的文件回答，答不出来就还没做完。
1. 问：为何不把文件放数据库？ 答：备份复制会被大对象拖垮，库只存元数据。
2. 问：预签名等于授权结束？ 答：否，完成后必须服务端复核，网址难猜不是权限。
3. 问：扫描失败怎么办？ 答：保持不可读，失败关闭，不要为了体验放开。
4. 问：搜索能当订单真相吗？ 答：不能，必须能重建，详情回源再授权。
5. 问：分片残留如何处理？ 答：生命周期作业中止过期上传，并看账单。
6. 问：范围请求有何风险？ 答：非法范围要拒绝，防止超大范围打存储。
7. 问：恢复后对什么账？ 答：元数据 Ready 的对象必须 Head 得存在。
8. 问：公开桶列举？ 答：禁止可枚举前缀，公共读仅静态资产加网络分发。
把这些问题打印出来，找同事当评委抽三问。抽不到证据的那一问，就是下一周唯一任务。


十日结束后开一次十五分钟回顾：哪一天没有证据、哪一条会在毕业答辩被问到。把缺口列进下一周，而不是开始下一章收藏。

### 练习

1. 修改主 demo：把数据量从 10_000 字节放大到 10_000_000 字节再跑，观察内存占用不变（流式 \`ComputeSha256Async\` 的内存与文件大小无关）；把 \`SHA256\` 换成 \`MD5\` 对比摘要长度差异；计算完哈希后把 \`stream.Position = 0\` 再算一次，验证同一份数据摘要可重复。
2. 脱离示例实现分片上传模拟：\`UploadInParts(Stream data, int partSize)\` 把流切成 N 片逐片返回 \`(partNumber, etag)\`（etag 用 \`SHA256.HashData\` 对每片计算），全部完成后输出 multipart complete；写测试钉住「同一数据同一分片大小 → 同一组 etag」。
3. 生产场景：实现 Range 请求校验函数 \`ParseRange(string? rangeHeader, long fileSize)\`：解析 \`bytes=0-99\` 形式，越界（end ≥ fileSize）、多区间、超大范围（如 > 10MB）一律拒绝并返回 416 语义，合法则返回 \`(start, length)\`；再实现预签名 URL 模拟——过期时间戳 + HMAC 签名校验，篡改路径或超时都拒绝。




`,
    code: `// ============================================================
// 大文件哈希必须走 Stream，禁止一次性 ReadAllBytes。
// SHA256 这里用于完整性校验 / 分桶，不是密码存储（密码用专用 KDF）。
// await using：异步释放流，避免文件句柄拖到 finally 才关。
// ============================================================
using System.Security.Cryptography;

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
    return Convert.ToHexString(digest); // 十六进制便于日志与对账；不要当加密密钥
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

配置、Secret、Feature Flag 是三种东西。把连接字符串写进 \`appsettings.json\` 检入 Git、把“是否免密支付”做成客户端可改的 flag、把税率做成无人值守的动态配置，都会在评审之外改变生产行为。

### 一、IOptions、Monitor 与 Snapshot

| 类型 | 语义 | 适合 |
| --- | --- | --- |
| \`IOptions<T>\` | 启动时绑定一次 | 几乎不变的选项 |
| \`IOptionsSnapshot<T>\` | **每个作用域**重新计算 | 请求内要看到刷新后的配置 |
| \`IOptionsMonitor<T>\` | 单例，变更通知 | 后台服务、长寿命缓存 |

\`\`\`csharp
builder.Services.AddOptions<OrdersOptions>()
    .BindConfiguration("Orders")
    .ValidateDataAnnotations()
    .Validate(o => o.MaxLines is > 0 and <= 200, "MaxLines 非法")
    .ValidateOnStart();
\`\`\`

\`ValidateOnStart\` 让错误配置在启动失败，而不是第一笔订单才炸。动态刷新要定义：刷新延迟、部分失败是否沿用旧值、多副本是否同时看到新值。**不要**把价格公式、法律条款全做成配置——那是无人评审的代码。

分层：\`appsettings.json\` 非敏感默认 → 环境变量 / 云配置覆盖 → 用户 secrets 仅开发机。生产覆盖来自受控存储，而不是人手改 Pod 环境变量且不入库。

### 二、Key Vault 与密钥轮换

密钥进 Azure Key Vault、AWS Secrets Manager、HashiCorp Vault 或 Kubernetes Secret（后者加密与 RBAC 要单独加固）。应用用 **workload identity / managed identity** 取密钥，禁止长期 Access Key 躺在 CI 变量和桌面便签。

轮换需要重叠窗口：签发两个 JWT 签名密钥，先加新 \`kid\` 验证新旧，再停旧。数据库账号同样双用户切换。轮换失败要告警——证书过期是最无聊也最常见的全站事故。日志、异常、\`/debug\`、内存 dump、CI 日志都可能泄露 Secret；诊断中间件生产关闭。

### 三、Feature Flag：灰度、定向、失败关闭

Flag 元数据：owner、用途、创建日、**删除日**。超过删除日还在的 flag 就是债务。种类：

- 发布开关：未完成功能对 0% 用户关闭
- 实验：稳定哈希分桶（主 demo），同一用户始终同一面
- 定向：租户、邮箱后缀、内部员工
- Kill switch：依赖故障时关掉昂贵路径

**失败关闭（fail-closed）**：控制平面不可达时，涉及支付、导出、管理的开关视为关；仅装饰性功能可以 fail-open。客户端 flag 只影响 UI，**不能**当授权。服务端仍检查权限。灰度按 \`flag + userId\` 哈希，记录曝光版本以便对照错误率和业务指标。

### 四、审计与清单

谁在何时把 \`Orders:MaxLines\` 从 50 改成 5000、旧值是什么、哪个环境，必须可查。生产高风险配置双人审批。清单：

- [ ] Options 有 ValidateOnStart；选对 Options/Snapshot/Monitor
- [ ] Secret 不在 Git / 镜像 / 日志
- [ ] 身份是 workload identity；轮换有重叠窗口
- [ ] Flag 有 owner 和过期日；安全相关 fail-closed
- [ ] 客户端 flag 不是安全边界
- [ ] 配置变更有审计和审批

### 五、分层覆盖、热重载与测试

配置真源的顺序必须写进文档并在测试里锁定。典型 ASP.NET：\`appsettings.json\` → \`appsettings.{Environment}.json\` → 环境变量 → Key Vault。后写覆盖先写。同名键类型冲突（json 对象 vs 环境变量扁平键）会让人以为“改了没生效”。用 \`IConfiguration.GetDebugView()\` 只在安全的开发会话查看，生产不要把值打进日志。

\`IOptionsMonitor.OnChange\` 里不要做重操作或递归刷新。长寿命单例缓存了旧 Options 却不用 Snapshot/Monitor，是“我改了配置为什么没变”的第一原因。测试用 \`Configure<T>(_ => { })\` 或 \`PostConfigure\` 注入非法值，断言宿主启动失败——这比文档里写“记得校验”可靠。Feature flag 的分桶函数要有单测：同一 subject 稳定、边界百分比 0 和 100、哈希输入包含 flag 名（避免所有 flag 同一批用户）。

密钥旋转演练：准备双密钥、切流量、撤销。把旋转步骤写进 runbook，和第一百零七章值班接上。开发人员的 User Secrets 不要复制到群聊。CI 用 OIDC 联邦换取云身份，短期凭证，拒绝长期 AK/SK 文件进仓库。配置即代码：生产覆盖进 GitOps 或 IaC 变量，变更走 PR，这样第一百零五章的评审才能看见“MaxLines 从 50 变成 5000”。

Options 验证要覆盖：缺键、类型错误、范围越界、互斥开关同时打开。Monitor 回调里更新缓存必须线程安全。Flag 过期日用日历作业扫描，超期仍开启的列进可靠性债。密钥轮换与证书到期共用一张值班表。开发机 User Secrets 与生产 Key Vault 的键名保持一致，避免“本地有、集群无”。配置是代码的近亲，必须能 diff、能回滚、能审计。

配置与 flag 的演示：错误的 MaxLines=0 让进程拒绝启动；同一用户打新结算 flag 永远同一面；Key Vault 不可达时支付相关开关 fail-closed。轮换演示双 kid 重叠验证。配置 PR 能看出旧值新值。把这四项写进毕业文档。没有 ValidateOnStart 的服务等于把第一次错误请求当金丝雀，对用户不公平。

配置、密钥与开关是生产变更的一半来源，却常被当成“运维填空”。请把三者拆开记账。配置：Options 启动校验，非法进程起不来；Monitor 与 Snapshot 按寿命选用；分层覆盖可在测试里锁定。密钥：进保险柜，工作负载身份读取，轮换有重叠窗口，日志禁出。开关：有主人有删除日，安全项失败关闭，客户端开关不是授权，分桶哈希含开关名。再做审计：谁把上限从五十改到五千，旧值可见，生产要双人。把这些做成毕业项目的配置说明书，比堆一堆环境变量更像能交接的系统。预发和生产的键名一致，避免本地有集群无。到期开关用作业扫描，超期仍开的列进可靠性债务。

### 十日落地：配置密钥与开关

按日执行，写不下就延期，不许跳日。每一天结束要有仓库里的证据（测试、文档或演练记录），口头“做过了”不算。

1. 选项启动即校验，非法配置进程起不来，测试覆盖缺键与越界。
2. 按寿命选择一次性、每请求快照或监视器，长寿命服务不用错类型。
3. 分层覆盖顺序写进文档并用测试锁定，避免同名键类型冲突。
4. 密钥进保险柜，工作负载身份读取，禁止长期云钥匙进仓库。
5. 轮换有重叠窗口，双密钥验证后再撤旧，失败要告警。
6. 开关有主人与删除日，超期仍开列入债务。
7. 涉及支付与导出的开关控制面故障时关闭。
8. 分桶哈希包含开关名与主体，零与一百边界有单测。
9. 客户端开关只影响界面，服务端仍做授权。
10. 生产配置变更可审计旧值新值，高风险双人批准。

### 答辩常见问：配置开关
下面每问都要能用仓库里的文件回答，答不出来就还没做完。
1. 问：三种 Options 怎么选？ 答：几乎不变用一次性，请求内看刷新用快照，长服务用监视器。
2. 问：为何启动校验？ 答：错误配置应让进程起不来，而不是第一笔订单爆炸。
3. 问：开关能当授权吗？ 答：不能，客户端开关只影响界面。
4. 问：控制面挂了怎么办？ 答：支付导出类失败关闭，装饰类才可打开。
5. 问：密钥放哪？ 答：保险柜加工作负载身份，不进仓库镜像日志。
6. 问：如何轮换？ 答：双密钥重叠验证再撤旧，到期进值班表。
7. 问：开关过期？ 答：有删除日，超期仍开列债务。
8. 问：配置算代码吗？ 答：要能差异、能回滚、能审计，走拉取请求。
把这些问题打印出来，找同事当评委抽三问。抽不到证据的那一问，就是下一周唯一任务。


十日结束后开一次十五分钟回顾：哪一天没有证据、哪一条会在毕业答辩被问到。把缺口列进下一周，而不是开始下一章收藏。

### 练习

1. 修改主 demo：把 \`percentage\` 从 25 改成 50、100、0 各跑一遍，观察 u-1 到 u-4 的翻转情况；把 flag 名从 \`new-checkout\` 换成 \`checkout-v2\`，验证同一用户落进不同桶（哈希键变了，分桶结果就变——这就是为什么换 flag 名等于重新灰度）。
2. 脱离示例实现带过期日的开关存储：\`FeatureFlagStore\` 存 \`(percentage, expiresAt)\`，\`IsEnabled\` 在到期后直接返回 false（失败关闭），并用注入的 \`TimeProvider\` 写测试钉住「到期即全员关闭」与「到期前一天仍按比例开」。
3. 生产场景：实现双密钥轮换模拟：\`KeyRing\` 同时持有 current / previous 两把密钥，\`Sign\` 只用 current，\`Validate\` 先试 current 失败再试 previous（重叠期）；写测试覆盖「轮换后旧令牌在重叠期内可验、超过重叠期被拒」，并把「到期进值班表」写成检查清单项。




`,
    code: `// ============================================================
// 配置与开关的三个关键语义（纯 C# 模拟）：
//   1. 稳定百分比分桶：同一用户永远同一结果（哈希分桶，非随机）
//   2. 分层覆盖：appsettings < 环境变量 < 密钥库，后一层覆盖前一层
//   3. 失败关闭：开关存储不可用/已过期 → 一律当 false 处理
//      （支付类开关失败打开 = 事故；装饰类开关才允许失败打开）
// ============================================================
using System.Security.Cryptography;
using System.Text;

// ---------- 1. 稳定百分比分桶 ----------
foreach (string userId in new[] { "u-1", "u-2", "u-3", "u-4" })
    Console.WriteLine($"{userId}: {Enabled(userId, "new-checkout", 25)}");

// 哈希键 = flag + subject：换 flag 名等于重新灰度（分桶全变）
static bool Enabled(string subject, string flag, int percentage)
{
    byte[] hash = SHA256.HashData(Encoding.UTF8.GetBytes($"{flag}:{subject}"));
    uint value = BitConverter.ToUInt32(hash, 0);
    return value % 100 < percentage;
}

// ---------- 2. 分层覆盖：配置的合并语义 ----------
// 生产里的真实链路：appsettings.json → appsettings.Production.json
//   → 环境变量 → Key Vault，每层只覆盖自己出现的键。
// 注意类型统一转 string——环境变量没有「int/bool」，解析在最外层做一次。
var layers = new (string Layer, Dictionary<string, string> Values)[]  // 优先级从低到高
{
    ("appsettings.json", new() { ["db:retry"] = "3", ["feature:x"] = "off", ["log:level"] = "info" }),
    ("env:OVERRIDE",     new() { ["db:retry"] = "5" }),                          // 只改 retry
    ("key-vault",        new() { ["db:password"] = "kv-secret", ["feature:x"] = "on" }),
};

var merged = new Dictionary<string, string>();
foreach (var (_, values) in layers)
    foreach (var (key, value) in values)
        merged[key] = value;   // 后一层覆盖同名键

Console.WriteLine("\\n合并结果（高优先级覆盖低优先级）：");
foreach (var (key, value) in merged.OrderBy(kv => kv.Key))
    Console.WriteLine($"  {key} = {value}");

// ---------- 3. 失败关闭（fail-closed）----------
// 开关存储拿不到（网络分区/密钥库故障）或已过期：支付类开关一律返回 false。
// 只有「打开与否不影响正确性」的装饰类开关（如新 UI）才允许失败打开。
static bool IsEnabledSafe(string flag, bool storeReachable, DateTimeOffset now, DateTimeOffset expiresAt) =>
    storeReachable && now < expiresAt;   // 任何一个条件不满足 → false

var now = DateTimeOffset.UtcNow;
Console.WriteLine($"\\n存储可达 & 未过期 → {IsEnabledSafe("pay-v2", true,  now, now.AddDays(7))}（正常放行灰度）");
Console.WriteLine($"存储不可达       → {IsEnabledSafe("pay-v2", false, now, now.AddDays(7))}（失败关闭：宁可全量走旧链路）");
Console.WriteLine($"开关已过期       → {IsEnabledSafe("pay-v2", true,  now, now.AddDays(-1))}（过期即关：超期仍开列进技术债清单）");
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch103",
    group: "第十七部分 云原生、交付与可靠性",
    icon: "☸️",
    title: "Kubernetes 与云原生运行",
    content: `## 第一百零四章　Kubernetes 与云原生运行

Kubernetes 让你声明期望副本、探针和资源，它**不会**替你修复同步阻塞、无限制内存分配或把迁移放在每个 Pod 启动里。把 .NET 服务扔进集群只是开始。

### 一、Deployment、Service、Ingress

| 对象 | 职责 |
| --- | --- |
| Deployment | 副本、滚动、标签；背后是 ReplicaSet |
| Service | 稳定 ClusterIP / 名称，选中 Pod 的 endpoints |
| Ingress / Gateway | HTTP 路由、TLS、路径；后面仍是 Service |
| PDB | 自愿中断时最少可用副本，保护滚动与腾空 |

Service 不是负载均衡器的全部：集群外流量还要 Ingress Controller 或云 LB。标签选择器打错会导致“部署成功但 0 endpoints”。滚动更新时新旧 Pod 同时接流量，契约必须兼容（见第一百零五、一百一十一章）。

### 二、探针、PDB、优雅退出

- **startupProbe**：慢启动（JIT、迁移检查、预热）期间不要杀进程。
- **readinessProbe**：决定是否进 Service；失败则摘流，不必然重启。
- **livenessProbe**：只判断进程死锁/不可恢复。把下游 Redis 放进 liveness，会在缓存抖动时集体重启，雪上加霜。
- **PreStop + terminationGracePeriodSeconds**：先从就绪摘流，再停 Kestrel，再等在途请求。SIGTERM 到强制 SIGKILL 之间要够用。
- **PDB**：\`minAvailable: 2\` 防止腾空节点时一次打掉过多副本。没有 PDB，集群升级会变成自己制造的中断。

主 demo 用纯 C# 表达“分析服务失败不影响 readiness”——真实探针是 HTTP/TCP/\`exec\`，在 ASP.NET 用 \`MapHealthChecks\` 分组。

### 三、requests/limits 与 .NET 容器 GC

\`requests\` 影响调度和 HPA 基数；\`limits\` 是上限。只给 limit 不给 request 会过度承诺。内存 limit 过小 → 频繁 GC 或 **OOMKill**（133）。.NET 8+ 能感知 cgroup 限制调整堆，但仍要压测 working set。CPU limit 造成 throttling，p99 变差，看起来像“代码变慢”。

观察：\`working_set\`、分配速率、GC 暂停、\`cpu_throttled\`。Server GC 在容器里通常合适；超小 sidecar 才考虑 Workstation。\`DOTNET_GCHeapHardLimit\` 等只有在理解文档后使用，不要抄未知博客。

### 四、ConfigMap / Secret、HPA、身份

非敏感配置用 ConfigMap；凭据用 Secret + 外部 KMS，挂载文件优于环境变量（后者易进日志）。改 ConfigMap 默认不重启 Pod，需要 checksum 注解或热更新约定。

HPA：CPU 对 CPU 型 API 尚可；队列消费者应按队列深度或消费延迟。扩容受启动时间、连接池、缓存冷启动、**下游容量**限制——你扩 10 倍，数据库没扩，只是更快地把库打挂。缩容必须优雅。

身份：镜像无长期密钥；workload identity 访问云。RBAC 最小权限；NetworkPolicy 限制东西向，默认拒绝然后放行必要端口。

### 五、清单

- [ ] Deployment + Service + 明确 Ingress；PDB 保护自愿中断
- [ ] startup / readiness / liveness 语义分开
- [ ] requests/limits 经过负载测试；看过 OOM 与 throttle
- [ ] 迁移由 Job 执行，不是每个副本抢跑
- [ ] Secret 不进镜像；有身份绑定
- [ ] SIGTERM 演练：在途请求完成，不再接新流量

### 六、.NET 容器细节与排障

镜像用 Microsoft 的 chiseled / Alpine / Distroless 变体时，注意 ICU、时区数据和证书包是否仍在——全球化与 HTTPS 会在“最小镜像”里突然坏掉。启用 \`DOTNET_SYSTEM_GLOBALIZATION_INVARIANT\` 只有在你确认不需要文化时才可以。非 root 用户、只读根文件系统、\`tmp\` 挂 emptyDir，是毕业项目的硬要求。只读根上 Kestrel 和诊断要把写路径指到卷。

\`CrashLoopBackOff\` 先看 \`kubectl describe\` 的 OOM、探针失败还是拉取镜像。\`kubectl logs --previous\` 看被杀前的日志。不要一上来 \`restart\`。资源清单与 HPA 要一起改：只改 HPA 最大副本却不给下游扩容，是典型级联。PDB 与 HPA 同时存在时，腾空节点可能无法满足 PDB，集群升级会卡住——提前算 \`minAvailable\`。

Service Mesh 的边车会抢 CPU/内存，requests 要算进去。mTLS 很好，但证书轮换失败时的 fail-closed 与第一百零三章同一原则。NetworkPolicy 写完要用探测 Pod 验证“不该通的真的不通”。把探针路径排除出认证和重的依赖，\`/health/live\` 只回答进程活着，\`/health/ready\` 才查库。这一分法能避免“数据库抖动 → liveness 杀光 → 更没人连库”。

对照练习：给 API 配 startup 慢 20 秒，确认 startupProbe 期间不被杀、也不进 Service。把 Redis 摘掉，readiness 仍为就绪（若缓存可降级），liveness 仍为存活。发 SIGTERM，观察在途请求是否在 grace 内完成。把 memory limit 调到工作集以下，确认 OOMKill 而不是无限 GC——然后回调到合理值。HPA 按 CPU 扩一倍时盯数据库连接数。K8s YAML 与第一百零五章 IaC 同源，禁止手改集群后不回写。

K8s 验收：三探针语义不同且有测试或手册；PDB 存在；SIGTERM 演练过；requests/limits 来自压测而非抄作业；迁移 Job 独立。描述一次 CrashLoop 你如何区分 OOM、探针和镜像。镜像非 root 只读。把 YAML 放进 infra 目录与应用同 PR。集群不是“运维的事”，是你服务运行时契约的一部分。

把集群对象当成你服务的运行时 API。Deployment 管副本与滚动，Service 管稳定名字，Ingress 管入口，PDB 管自愿中断时最少还活几份。探针三件套各做各的事：启动慢给时间，就绪决定进不进流量，存活只判断进程不可救。把下游抖动放进存活探针，等于用重启惩罚依赖。资源请求与限制来自压测，过小则 OOM 或节流，过大则浪费并影响调度。扩容看队列和延迟，不看 CPU 一种尺子。配置用 ConfigMap，密钥不进镜像。迁移用独立 Job。SIGTERM 演练在途请求。镜像非 root 只读，注意最小镜像是否还带时区与证书。YAML 与应用同仓库，手改集群必须回写，否则第一百零五章的 IaC 是假的。

### 十日落地：Kubernetes 运行

按日执行，写不下就延期，不许跳日。每一天结束要有仓库里的证据（测试、文档或演练记录），口头“做过了”不算。

1. 工作负载、服务、入口对象齐全，标签选择器能对上端点。
2. 启动、就绪、存活三探针语义分开，下游抖动不得杀死进程。
3. 中断预算保证自愿腾空时最少副本，升级不会一次打光。
4. 资源请求限制来自压测，观察工作集、分配、暂停与节流。
5. 扩容尺子按队列或延迟，扩副本时同步看数据库连接预算。
6. 配置与密钥不进镜像，改配置的滚动策略写清楚。
7. 迁移由独立作业执行，禁止每个副本启动抢跑。
8. 终止信号演练：先摘流，再完成在途，再退出。
9. 镜像非特权只读，检查最小镜像是否仍含时区与证书。
10. 清单与应用同仓库，手改集群必须回写，否则视为事故。

十日结束后开一次十五分钟回顾：哪一天没有证据、哪一条会在毕业答辩被问到。把缺口列进下一周，而不是开始下一章收藏。

### 练习

1. 修改主 demo：把 \`DatabaseReachable\` 改成 false，观察 readiness 变为 not-ready 而“分析服务失败不触发重启”的语义不变；给 \`ApplicationState\` 增加 \`MigrationRunning\` 字段并讨论它该影响 startup 还是 readiness；解释 \`OptionalAnalyticsReachable\` 为什么不该进任何探针。
2. 脱离示例独立实现 \`static HealthStatus Evaluate(ApplicationState state, ProbeKind kind)\`：\`ProbeKind\` 分 Startup/Readiness/Liveness 三种语义——readiness 只看“启动完成 + 核心依赖可接流量”，liveness 只看进程本身；用测试覆盖“分析服务挂了 readiness 仍就绪”“数据库挂了摘流但不重启”两条断言。
3. 生产场景：给毕业项目编写 Deployment + Service + Ingress 与 PDB（\`minAvailable: 2\`），三探针分别指向 \`/health/startup\`、\`/health/ready\`、\`/health/live\`（用 \`MapHealthChecks\` 分组），readiness 查库、liveness 不查；演练 SIGTERM 确认在途请求在 \`terminationGracePeriodSeconds\` 内完成；把 memory limit 压到工作集以下观察 OOMKill 再回调合理值；数据库迁移改成独立 Job 执行，禁止每个副本启动抢跑。





`,
    code: `// ============================================================
// Kubernetes 三组核心语义（纯 C# 模拟）：
//   1. liveness vs readiness：崩溃重启 ≠ 摘除流量，两探针回答不同问题
//   2. 优雅停机：收到 SIGTERM → 摘流量 → 排空在途请求 → 再退出
//   3. 容器资源感知：内存 limit 决定 GC 模式，超出即被 OOMKill（不是节流）
// ============================================================

// ---------- 1. liveness vs readiness ----------
// liveness：“进程还活着吗？”——失败 = 重启（治僵死锁）。
// readiness：“能接流量吗？”——失败 = 摘出 Service（治临时不可用）。
// 关键：依赖故障只能让它 not-ready，绝不能 fail liveness——
// 否则整个副本集体重启风暴，把「一个依赖慢」放大成「全站不可用」。
var state = new ApplicationState(
    StartupCompleted: true,
    DatabaseReachable: true,
    OptionalAnalyticsReachable: false);

bool ready = state.StartupCompleted && state.DatabaseReachable;
Console.WriteLine($"readiness={(ready ? "ready" : "not-ready")}");
Console.WriteLine("分析服务失败不会触发 liveness 重启");

// 启动未完成时：not-ready（等预热），但进程没死——liveness 仍应通过
var starting = state with { StartupCompleted = false };
Console.WriteLine($"启动中：ready={starting.StartupCompleted && starting.DatabaseReachable}（Endpoints 里还看不到它，但不需要重启）");

// ---------- 2. 优雅停机：SIGTERM 后的排水窗口 ----------
// K8s 删除 Pod 的顺序（ terminationGracePeriodSeconds 内必须完成）：
//   Endpoints 摘除 → 应用收到 SIGTERM → 停止接新请求 → 排空存量 → 退出。
// 排不干净 = 客户端看到连接被掐断的 502。
static async Task DrainAsync(Queue<string> inflight, TimeSpan deadline)
{
    Console.WriteLine("收到 SIGTERM：不再接新请求，开始排水…");
    var sw = System.Diagnostics.Stopwatch.StartNew();
    while (inflight.Count > 0 && sw.Elapsed < deadline)
    {
        await Task.Delay(50);                    // 模拟处理完一个在途请求
        var done = inflight.Dequeue();
        Console.WriteLine($"  完成 {done}（剩余 {inflight.Count}）");
    }
    Console.WriteLine(inflight.Count == 0
        ? "排水完成：所有在途请求得到响应，进程体面退出"
        : $"超过 {deadline.TotalSeconds:F0}s 宽限期：放弃剩余 {inflight.Count} 个（配 terminationGracePeriodSeconds 对齐）");
}

var inflight = new Queue<string>(["req-1", "req-2", "req-3"]);
await DrainAsync(inflight, TimeSpan.FromSeconds(1));

// ---------- 3. 资源感知：内存 limit 与 GC 模式 ----------
// .NET 在容器里读 cgroup：limit < 80% 时 GC 保守；Server GC 按核数建堆。
// CPU 超限被「节流」（慢），内存超限被「杀死」（OOMKill）——性质完全不同。
static string PlanGc(int? memoryLimitMb, int cpuLimitMillis)
{
    var throttled = cpuLimitMillis < 1000 ? "CPU 被节流（变慢，进程还活着）" : "CPU 充足";
    if (memoryLimitMb is null) return $"未设内存 limit（危险：节点内存随便吃）｜{throttled}";
    var mode = memoryLimitMb <= 512 ? "分代 GC + 预留余量" : "Server GC 可开";
    return $"内存 limit {memoryLimitMb}MB → {mode}（超限 = OOMKill，不是变慢）｜{throttled}";
}

Console.WriteLine();
Console.WriteLine(PlanGc(null, 2000));
Console.WriteLine(PlanGc(384, 500));
Console.WriteLine(PlanGc(2048, 4000));

public sealed record ApplicationState(
    bool StartupCompleted,
    bool DatabaseReachable,
    bool OptionalAnalyticsReachable);`,
    lang: "cs",
  },
  {
    id: "csharp5-ch104",
    group: "第十七部分 云原生、交付与可靠性",
    icon: "🏗️",
    title: "IaC、环境与发布治理",
    content: `## 第一百零五章　IaC、环境与发布治理

点一下云控制台创建的生产数据库，三个月后没人知道安全组为什么那样开。基础设施必须像应用一样：版本控制、评审、plan、受保护 apply。本章把工具对比、环境晋升、漂移、策略即代码和“密钥进 state”讲清楚。

### 一、Terraform、Bicep、Pulumi

| 工具 | 语言 | 状态 | 适合 |
| --- | --- | --- | --- |
| Terraform | HCL | 远程 state | 多云、生态最大 |
| Bicep | DSL → ARM | Azure 部署历史 | 纯 Azure、与门户模型接近 |
| Pulumi | C#/TS/Python | state 或云后端 | 想用熟悉语言、复杂逻辑 |

没有宇宙第一。团队已有 Azure 且合规走 ARM，Bicep 摩擦小；多云或多团队模块市场，Terraform 更常见；要用循环/单元测试描述基础设施，Pulumi 舒服。原则相同：

- 模块输入输出清晰，禁止一个 3000 行上帝模块。
- **state 远程、加密、加锁**；本地 \`terraform.tfstate\` 含密钥且会冲突。
- PR 必须贴 \`plan\`，apply 只在受保护流水线、使用受管身份。
- 销毁生产要额外保护（\`prevent_destroy\`、回收站、审批）。

### 二、环境晋升、漂移、策略即代码

dev / test / staging / prod 拓扑尽量同构（同样的子网、私钥、诊断），规模和数据不同。差异用变量和配置，不要 \`prod-special.tf\` 长期分叉。禁止无脱敏复制生产库到测试——这是合规事故，不是方便。

预览环境（每 PR 一套）必须有预算、TTL、自动销毁，否则月底账单会教育你。晋升顺序：plan 于 dev 验证 → staging 跑迁移与烟雾 → prod 金丝雀。跳过 staging “因为赶工”等于用客户当测试机。

**漂移（drift）**：有人手改了安全组，state 不知道。定期 \`plan\` 检测漂移；生产禁止控制台热修，除非事后立刻回写代码。Policy as Code（Azure Policy、OPA/Conftest、Sentinel）：强制加密、禁止公网 0.0.0.0/0、强制标签。策略在流水线拦，比事后审计省钱。

### 三、State 里的密钥与基础设施 PR 评审

Terraform state 常含数据库密码明文。后端必须加密（S3+KMS、Azure Storage 加密）、严格 IAM、开启版本。更彻底：密码不进 Terraform，只在 Key Vault 生成，计算资源引用引用。\`terraform output\` 不要把 secret 打到 CI 日志。

评审基础设施 PR 的顺序：

1. 是否扩大攻击面（公网、RBAC、匿名）。
2. 数据销毁与备份是否被改。
3. 成本（SKU、副本、NAT 流量）。
4. plan 是否只包含声称的资源。
5. 回滚：删资源是否可逆，state 是否可恢复。

应用评审者不一定看得懂 \`azurerm_sql_firewall_rule\`，所以 \`CODEOWNERS\` 的 \`/infra/\` 必须指向平台组。主 demo 的风险评分是教学模型，真实世界还要看 blast radius。

### 四、数据库发布与成本

迁移仍走 expand/contract（第九十七章），由独立 Job 执行，不嵌在每个 Pod。成本是可靠性的一部分：无标签资源无法追责；压测环境忘记关等于烧钱。清单：

- [ ] 工具已选定并写 ADR；state 加密加锁
- [ ] 每个环境同源代码 + 变量，无长期分叉
- [ ] plan 在 PR 可见；apply 仅流水线
- [ ] 漂移检测与策略即代码已启用
- [ ] Secret 尽量不进 state；CI 日志无明文
- [ ] infra PR 有平台 owner 评审

### 五、模块边界、导入现有资源与回滚

导入（import）已存在的云资源到 state 是高风险手术：地址、ID、强制新创建的属性必须逐项核对 plan。宁可先只读 \`plan\` 十遍，也不要在生产 \`apply\` 看到“将替换数据库”。替换（replace）对有状态资源等于销毁。\`lifecycle { prevent_destroy = true }\` 加在数据库、密钥保管库、关键 DNS。需要销毁时走单独 PR，标题写明不可逆。

模块版本钉死，不用浮动 \`latest\`。跨团队模块要 SemVer，破坏性变量改名走主版本。文档列出必填变量和示例 \`tfvars\`（无密钥）。格式化与 \`tflint\` / \`checkov\` / \`tfsec\` 进 CI。人工评审仍不可少：静态扫描看不见“这个防火墙规则放行了合作伙伴过期 IP”。

环境晋升用同一模块版本号，像升应用版本一样升基础设施。prod 落后 staging 两个模块版本时，先补齐再发应用。密钥轮换与 IaC 的配合：IaC 只引用 vault 版本，不把值写入 tfvars。state 备份和锁丢失的恢复 runbook 要存在——锁死在崩溃的 CI 上是常见事件，解锁必须鉴权且留审计。

成本异常：昨天 NAT 流量翻 10 倍，标签能指到服务。无标签资源在策略里直接拒创建。把 IaC 评审当代码评审的亲戚，而不是“绿色按钮”。

把一次真实 apply 拆成 PR 故事：改 SKU、加只读副本、收紧防火墙。plan 必须只含这三项。审批者核对照片式 diff，询问 destroy 与数据丢失。故意在 staging 制造漂移（控制台改标签），看下次 plan 是否检出。state 权限只给流水线身份。模块升级与应用发布错开窗口。基础设施评审的长度应接近应用评审，因为炸库比炸一次 500 更难悔。

IaC 验收：PR 必贴 plan；state 加密加锁；生产 apply 仅流水线；密钥不进 tfvars；平台组 CODEOWNERS。讲清楚 Terraform/Bicep/Pulumi 选谁及原因。演示在 staging 检出控制台漂移。有状态资源有 prevent_destroy。成本标签强制。把“点控制台先顶一下”列为事故诱因而不是英雄行为。

基础设施即代码的日常不是选工具品牌，而是让每次云变更可审查可回放。选定 Terraform 或 Bicep 或 Pulumi 之后写 ADR，模块输入输出清晰，状态远程加密加锁，计划贴在拉取请求，应用只由流水线执行。环境用同一模块加变量晋升，禁止长期分叉的生产特例文件。漂移要定期计划检出。策略即代码拦住公网全开和缺标签。密钥尽量不进状态。评审顺序：攻击面、数据销毁、成本、计划是否超范围、回滚。有状态资源防止误删。预览环境有预算和到期销毁。把一次改防火墙的请求练到能在十分钟内讲清 blast radius，你才算会这一章。

### 十日落地：基础设施即代码

按日执行，写不下就延期，不许跳日。每一天结束要有仓库里的证据（测试、文档或演练记录），口头“做过了”不算。

1. 为所选工具写决策记录，说明为何不是另外两个。
2. 状态远程加密加锁，本地状态文件不得进仓库。
3. 拉取请求必须贴计划，应用仅受保护流水线可执行。
4. 环境同源代码加变量，禁止长期分叉的生产特例。
5. 定期计划检出漂移，控制台热修事后立刻回写。
6. 策略即代码拦住公网全开、缺加密与缺标签。
7. 密钥尽量不进状态，输出不得打进流水线日志。
8. 平台组拥有基础设施目录的审查权，应用组不能自批炸库变更。
9. 有状态资源防止误删，销毁走单独请求并写明不可逆。
10. 预览环境有预算和到期销毁，成本标签强制创建。

### 答辩常见问：基础设施
下面每问都要能用仓库里的文件回答，答不出来就还没做完。
1. 问：为何不能点控制台？ 答：不可重复不可审计，三个月后没人知道安全组来源。
2. 问：状态丢了怎么办？ 答：远程加密加锁并有备份，解锁必须鉴权留审计。
3. 问：计划为何贴出来？ 答：审批者要看是否超范围、是否销毁有状态资源。
4. 问：环境如何晋升？ 答：同一模块加变量，禁止长期分叉特例文件。
5. 问：漂移是什么？ 答：人手改了云，状态不知道，定期计划检出。
6. 问：策略即代码拦什么？ 答：公网全开、缺加密、缺标签。
7. 问：密钥进状态？ 答：尽量不，引用保险柜，输出不进日志。
8. 问：谁审基础设施？ 答：平台组拥有者，应用组不能自批炸库。
把这些问题打印出来，找同事当评委抽三问。抽不到证据的那一问，就是下一周唯一任务。


十日结束后开一次十五分钟回顾：哪一天没有证据、哪一条会在毕业答辩被问到。把缺口列进下一周，而不是开始下一章收藏。

### 练习

1. 修改主 demo：把 \`PublicApiBreaking\` 也改成 true，确认 risk 升到 8 仍走"双人审批 + 演练 + 维护窗口"；把三个开关全设 false，观察落入"自动发布"；调整权重（如 \`SecuritySensitive\` 计 5 分），体会阈值与权重的取舍得反映真实 blast radius。
2. 脱离示例独立实现 \`ReleasePolicy.Evaluate(Change change)\`：返回结构化结果——门禁级别、必须的审批角色列表、是否允许夜间发布；\`DatabaseDestructive\` 强制双人加演练，用表驱动测试覆盖 risk 为 0/2/5/8 的四档输出。
3. 生产场景：把毕业项目的基础设施落进 \`infra/\` 目录用 Terraform 或 Bicep 管理：state 远程加密加锁、PR 必贴 \`terraform plan\` 输出、apply 仅在受保护流水线执行；给数据库和 Key Vault 加 \`lifecycle { prevent_destroy = true }\`；在 staging 用控制台故意改一个标签制造漂移，验证下次 plan 能检出并回写；\`/infra/\` 的 CODEOWNERS 指向平台组。





`,
    code: `// ============================================================
// 发布门禁按风险加权，而不是“看起来是小改动就可以自动发”。
// 破坏性迁移、公开 API 不兼容、安全敏感必须抬升审批与演练。
// switch 表达式把分数映射成可执行策略，避免口头传统。
// ============================================================
var change = new Change(
    DatabaseDestructive: true,   // 删列 / 改类型：需要 expand-contract 和维护窗口
    PublicApiBreaking: false,
    SecuritySensitive: true);

int risk = (change.DatabaseDestructive ? 3 : 0)
         + (change.PublicApiBreaking ? 3 : 0)
         + (change.SecuritySensitive ? 2 : 0);
// 权重是团队政策，不是宇宙常数：资金/PII 相关可以把安全项提到 5，让它单独越阈。

string gate = risk switch
{
    >= 5 => "双人审批 + 演练 + 维护窗口", // 关系模式（C# 9）：从上到下匹配第一条
    >= 2 => "人工审批 + canary",
    _ => "自动发布",                     // 0 分才允许全自动；「看起来是 typo」也要过这条表
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

“我觉得更慢”不是性能工作。先有 SLO 和预算，再测量，再改代码。微基准、负载测试、容量规划是三层，混用会得出“笔记本上快 10 倍，生产 p99 更差”的结论。

### 一、BenchmarkDotNet 的陷阱

BenchmarkDotNet 负责预热、JIT、多迭代、统计和分配。规则：

- 必须 Release，不要调试器附加。
- 消费计算结果，防止被优化掉。
- 看 \`Mean\`、\`Error\`、\`Allocated\`，不要只截一张“更快”。
- **不能**代表数据库、网络、线程池饥饿、缓存冷启动。

把 \`string.Concat\` 和 \`StringBuilder\` 比完就去改生产，通常优化了 0.1% 的 CPU。热点要用生产剖析（\`dotnet-trace\`、APM）定位。CI 微基准要固定机器或接受统计噪声，阈值太紧会 flaky。

主 demo 用 \`Stopwatch\` 只教测量流程，**不是**严谨基准。

### 二、负载测试：k6、NBomber、预热、协调遗漏

| 工具 | 位置 | 特点 |
| --- | --- | --- |
| k6 | 进程外 HTTP | 脚本化、云/本地、易表达到达率 |
| NBomber | .NET 内 | 可测任意协议、与代码同语言 |
| bombardier / wrk | 粗测 | 快，但场景和协调遗漏要小心 |

区分 **open model**（按每秒 N 个到达，不管系统是否消化完）与 **closed model**（固定虚拟用户，做完一个再发）。Closed 会在系统变慢时自动降低到达率，把排队藏起来——这就是 **coordinated omission（协调遗漏）**：工具等慢请求结束才发下一个，直方图看起来还行，真实用户已经在排队。表达 SLO 时用开放到达率，或对等待时间做校正。

场景要包含：真实 payload 大小、读写比例、缓存冷热、思考时间、依赖延迟、错误路径。只打 \`GET /health\` 的压测没有价值。预热：JIT、连接池、缓存填满之前的数据单独标注，不要把预热段的 p99 当容量结论。

### 三、Little's Law、饱和与 SLO 驱动容量

Little's Law：\`L = λW\`（系统中请求数 ≈ 到达率 × 平均逗留时间）。到达率升高而延迟升高时，并发占用线性涨，线程/连接/内存先饱和。饱和点之后吞吐不再涨，延迟和错误率陡增——这是容量上限，不是“再加两个实例试试”的起点。

容量规划从 SLO 反推：若 30 天 99.9% 的请求要 < 300ms，负载测试必须报告 **p99 与错误率**，不是平均 80ms。单实例安全容量 = 拐点之前留出余量（故障、滚动、流量突发通常再留 30%–50%）。瓶颈经常是：连接池、数据库 IOPS、锁等待、线程池、GC、下游 429，而不是 CPU 仪表盘好看。

### 四、清单

- [ ] 微基准只回答微问题；生产热点用剖析
- [ ] 负载模型写清 λ、混合、数据形状、是否 open
- [ ] 工具不遗漏排队时间；有预热段
- [ ] 容量按 SLO 与饱和曲线，不是按平均 CPU
- [ ] 结果保存版本、SHA、环境和配置，可回归对比

### 五、从曲线到发布决策

把负载测试当成发布门禁的一部分，而不是上线前一晚的表演。定义：目标 λ、最大可接受 p99、最大错误率、饱和指标上限。未达标就冻结功能发布，和错误预算同一逻辑。测试环境必须在拓扑上像生产（同样的连接池、同样的 GC、同样的依赖延迟），否则你在测另一套系统。用生产流量回放要注意脱敏和幂等，不要回放真实扣款。

剖析与负载结合：在 λ 接近拐点时抓 \`dotnet-trace\`，看线程池饥饿、锁、正则、JSON 分配。优化应落在贡献最大的栈上。缓存预热脚本可以进发布步骤，但要限制并发，避免自己打崩自己。容量文档写清“单副本安全 QPS / 依赖的每副本预算 / 扩到 N 时谁先死”。毕业项目至少交出一张图：QPS-延迟曲线和一条 SLO 水平线。没有这张图，第一百零六章就算没做。

协调遗漏再强调一次：若工具的并发模型是“10 个虚拟用户循环”，系统变慢时到达率自动下降，你的 p99 是幸存请求的 p99。用恒定到达率或对等待做校正，否则你会在演示里赢、在大促里输。

练习课：用 NBomber 或 k6 对毕业项目打开放到达率，画出 QPS-p99 曲线，标 SLO 水平线与拐点。在拐点附近抓 dotnet-trace，列出前三栈。把连接池、线程池、GC 暂停画进同一时间轴。写容量结论：“单副本安全 QPS=X，依赖预算 Y，扩到 N 时 Z 先死”。没有这张图不要谈优化。微基准只允许优化已被剖析点名的方法。把协调遗漏写进负载测试模板页脚，防止下个人用固定 VU 自嗨。

容量验收必须交卷：开放到达率曲线、SLO 水平线、拐点、前三热点栈、单副本安全 QPS、先死的依赖。协调遗漏写进方法说明。预热段与测量段分开。没有曲线的“我们优化了 30%”不予采纳。把负载测试脚本检入仓库，参数（λ、混合、数据形状）写在文件头。发布门禁用同一脚本的阈值，避免演示环境与门禁环境各玩各的。

性能工作从目标倒推。先写 SLO：百分之九十九点九的有效请求低于三百毫秒。再选开放到达率模型，避免固定虚拟用户在系统变慢时自动少发请求，把排队藏起来。预热段单独标注。用真实大小的数据、读写混合、缓存冷热。在拐点抓运行时跟踪，优化被点名的栈，而不是凭微基准改字符串拼接。容量结论写成单副本安全吞吐、依赖预算、扩到若干时谁先饱和，并留故障与滚动余量。脚本和参数进仓库，发布门禁用同一套阈值。协调遗漏写在模板页脚。没有曲线就没有优化结论。把这一段当作第一百零六章的交卷格式，缺图即缺作业。

### 十日落地：基准与容量

按日执行，写不下就延期，不许跳日。每一天结束要有仓库里的证据（测试、文档或演练记录），口头“做过了”不算。

1. 写下用户可感知目标：有效请求成功比例与延迟分位。
2. 微基准只优化已被剖析点名的方法，结果消费以防被优化掉。
3. 负载用开放到达率，避免固定用户在变慢时少发请求。
4. 场景含真实体积、读写混合、缓存冷热与错误路径。
5. 预热段与测量段分开标注，冷启动数字不得冒充容量。
6. 在拐点抓跟踪，列出前三栈并只改这些。
7. 画出吞吐-延迟曲线，标目标水平线与饱和点。
8. 结论写单副本安全吞吐、依赖预算、扩容时谁先死。
9. 脚本与参数进仓库，发布门禁用同一阈值。
10. 协调遗漏写进模板页脚，防止下一人用固定用户自嗨。

### 答辩常见问：容量规划

容量规划这一章如果还差一口气，就补一张图：横轴到达率，纵轴百分之九十九延迟，再画一条服务水平目标横线。图上标预热结束点和拐点。把这张图、脚本参数和前三热点栈一起检入 docs/capacity.md。没有文件就不许在发布评审里说“性能没问题”。 图、脚本、栈，三件套缺一不可。小定律用来检查并发是否被低估：到达率乘平均逗留时间应接近系统中的在途请求。工具若在变慢时少发请求，把校正方法写在同一页。

下面每问都要能用仓库里的文件回答，答不出来就还没做完。
1. 问：微基准能代替压测吗？ 答：不能，它没有数据库网络与排队。
2. 问：开放与封闭模型？ 答：开放按到达率，封闭固定用户会在变慢时少发请求。
3. 问：何谓协调遗漏？ 答：工具等慢请求结束再发下一个，直方图低估排队。
4. 问：看哪些数？ 答：分位延迟、错误率、饱和，不看平均自嗨。
5. 问：容量怎么写？ 答：单副本安全吞吐、依赖预算、谁先死、余量。
6. 问：预热为何分开？ 答：即时编译与连接池填满前不是稳态。
7. 问：优化依据？ 答：拐点处跟踪的前三栈，不是感觉。
8. 问：门禁用哪套脚本？ 答：与仓库里同一参数，禁止演示另造一套。
9. 问：没有图能过关吗？ 答：不能，缺图即缺作业。
10. 问：小定律提醒什么？ 答：到达率乘逗留时间等于系统中请求数，饱和后延迟陡增。
把这些问题打印出来，找同事当评委抽三问。抽不到证据的那一问，就是下一周唯一任务。


十日结束后开一次十五分钟回顾：哪一天没有证据、哪一条会在毕业答辩被问到。把缺口列进下一周，而不是开始下一章收藏。

### 练习

1. 修改主 demo：把 \`iterations\` 改成 10_000 与 1_000_000 各跑三遍，观察同进程内耗时的抖动幅度；把 \`int.Parse(value.AsSpan(...))\` 换成 \`int.TryParse\` 版本对比——再想想为什么这仍然不是严谨结论（无预热、无独立进程、无多样本统计，对照正文的 BenchmarkDotNet 陷阱清单逐条打勾）。
2. 脱离示例实现 Little's Law 容量计算器：\`Capacity(double rps, double avgLatencyMs)\` 返回所需并发数（\`rps × latency / 1000\`），再按 60% 目标利用率输出安全容量与饱和预警线；用 (500 rps, 120ms) 与 (2000 rps, 90ms) 两组数据验证。
3. 生产场景：为毕业项目写 k6 脚本草案（stages: 2 分钟 ramp 到 200 VU、保持 5 分钟、1 分钟降回）打一个读端点，采集 p95/p99 与错误率；用 Little's Law 从实测延迟反推该并发下所需容量，把「先横向扩容还是先加缓存」的判断连同数据写进容量文档。




`,
    code: `using System.Diagnostics;

// ============================================================
// 教学计时不是严谨基准：Debug 模式、GC、JIT 都会污染 Stopwatch。
// 生产请用 BenchmarkDotNet（Release、多迭代、消费结果防优化掉）。
// checksum 必须被打印，否则编译器可能删掉整个循环。
// AsSpan + 切片避免再分配子字符串。
// ============================================================
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

“进程在跑”不是可靠性。用户关心的是下单是否成功、页面是否在预算内返回。SLO 把这些感受变成数字和**错误预算**，让“能不能发版”有依据，而不是靠嗓门。

### 一、SLI、SLO、SLA 与错误预算

| 词 | 含义 | 例子 |
| --- | --- | --- |
| SLI | 测量 | 有效请求中非 5xx 且 < 300ms 的比例 |
| SLO | 内部目标 | 连续 30 天 SLI ≥ 99.9% |
| SLA | 对外合同 | 扣款条款，通常松于 SLO |

有效请求要剔除客户端 4xx（除非是你的 bug 导致的 401 风暴）、合成探测可单独一条 SLI。延迟 SLI 用分位或“好请求比例”，避免平均值掩盖。

错误预算 = \`1 - SLO\`。99.9% × 30 天 ≈ 43 分钟不可用，或等价的失败请求数。预算耗尽 → 冻结高风险发布，优先可靠性。预算充裕 → 可以实验。主 demo 用失败数 / 允许失败数算消耗，生产用多窗口 burn rate（1 小时快烧、6 小时慢烧）。

### 二、对症状告警，而不是对原因

告警必须 **可行动**：有人能在 15 分钟内做一件减少用户伤害的事。优先告 SLI 燃烧、队列积压、错误率、饱和，而不是“CPU > 70%”。CPU 高但 SLI 健康，是工单不是传呼。每条告警绑定：owner、dashboard、runbook、严重级别。

| 级别 | 含义 | 响应 |
| --- | --- | --- |
| SEV1 | 核心下单/支付大面积失败 | 立即召集，IC 指挥 |
| SEV2 | 重要功能受损或单区域 | 工作时间快速，夜间按政策 |
| SEV3 | 降级、少量用户 | 工单，下一个工作日 |
| SEV4 | 无用户影响 | 改进项 |

没有级别的“全员风暴”会训练大家忽略告警。

### 三、事故指挥官、值班、无责复盘

指定 **Incident Commander（IC）**：只负责协调、时间线、沟通，不深潜写代码（人手极缺时可以兼，但角色仍要喊出来）。另有沟通官对内对外，操作员执行回滚/限流。值班（on-call）轮转、补偿、升级路径写进文档；没有 runbook 的告警等于把人叫醒猜谜。

流程：确认影响范围 → 指定 IC → **先止损**（回滚、关 flag、限流、切区）→ 保留证据 → 恢复后无责复盘。无责意味着问“系统如何允许这发生”，不问“谁是白痴”。改进项必须有 owner 和截止日期，否则复盘是话剧。

沟通模板：影响、已知事实、当前动作、下次更新时间。禁止用未证实根因安抚（“肯定是 Redis”）。

### 四、演练与清单

定期演练：依赖超时、证书过期、消息积压、错误配置、区域故障。演练有停止条件，不在未知保护下乱杀生产。清单：

- [ ] 每条关键用户旅程有 SLI/SLO
- [ ] 告警对症状，有级别、owner、runbook
- [ ] 值班与 IC 角色演练过
- [ ] 复盘无责且改进项被跟踪
- [ ] 错误预算进入发布决策

### 五、值班体验与学习闭环

好的值班不是英雄主义，是无聊：告警准、runbook 短、回滚一键。每月回顾：误报率、平均应答时间、重复事故。误报超过真报，人们会关闭通知——这比没有告警更危险。把“这条告警三个月没人行动”列为删除或降级候选。

IC 培训用桌面推演：给一张假时间线，让人练习点名、止损、对外措辞。不要等第一次 SEV1 再学开会。对外沟通避免技术黑话和时间幻想（“五分钟就能好”）。法律/公关需要接入的事故类型预先列清单。

复盘文档模板：摘要、影响、时间线、根因（机制而非个人）、触发因素、检测缺口、修复、后续项。根因若写“人为失误”，继续问“哪道门禁能挡住”。把复盘链接进发布评审，让第一百零五章的审批者看得到上次同类变更如何失败。SLO 不是 KPI 鞭子：团队不该靠牺牲安全预算来“完成故事点”。错误预算用完时，产品必须一起停高风险需求——否则 SLO 是墙上的海报。

补充值班包：一张 SEV 定义表、一个 IC 检查单（点名、时间线、对外时间、止损选项）、一条“错误预算耗尽停止发版”的发布政策。用上周真实流量算 99.9% 允许失败数，对比实际失败，开会决定能否发风险功能。删掉三条不可行动告警。桌面推演一次证书过期。复盘若写“人为失误”，退回重写机制原因。可靠性是产品功能，不是运维业余爱好。

SLO 验收：一条用户可感知 SLI、30 天目标、burn-rate 告警、SEV 表、IC 检查单、无责复盘模板、错误预算进入发布政策。删掉不可行动的 CPU 告警。用真实流量算允许失败数。值班轮转写进日历。若产品拒绝在预算耗尽时停需求，SLO 尚未生效——先解决治理再谈工具。

可靠性治理比再接一套监控更重要。先定义用户可感知的成功与延迟，再设内部目标，对外合同更松。错误预算等于一减目标，烧得快就停高风险发布。告警对症状、可行动、有级别、有手册、有主人。指定事故指挥官，先止损再找原因，复盘问系统如何允许发生。值班轮转写进日历，没有手册的呼叫视为缺陷。桌面推演证书过期和依赖超时。把不可行动的处理器告警删掉或降级。若产品拒绝在预算耗尽时停需求，先打治理仗。工具可以换，这套决策顺序不能换。把复盘链接进发布审批，让同类变更看见上次伤疤。

### 十日落地：SLO 与事故

按日执行，写不下就延期，不许跳日。每一天结束要有仓库里的证据（测试、文档或演练记录），口头“做过了”不算。

1. 为下单成功与延迟各写一条服务指标，定义有效请求。
2. 内部目标与对外合同分开，合同更松。
3. 用最近三十天流量算允许失败数，对比实际消耗。
4. 燃烧率告警覆盖快烧与慢烧，处理器高但用户无感不呼叫。
5. 严重级别表与指挥官检查单进仓库。
6. 每条告警绑定主人、仪表盘和手册，没有手册就降级。
7. 桌面推演一次证书过期，练习点名、止损、对外时间。
8. 复盘模板问系统如何允许，不问谁是白痴，改进项有截止日期。
9. 错误预算耗尽时冻结高风险发布，产品共同签字。
10. 删除或降级三条不可行动告警，误报率列入月会。

### 答辩常见问：SLO 事故

把可靠性写成可执行政策：错误预算耗尽自动冻结高风险发布；呼叫必须有手册；指挥官上线先点名；复盘七日内交出改进项主人。再用上周真实流量算允许失败数，开会对照实际失败，决定本周能不能发数据库变更。把三条不可行动告警删掉的拉取请求链接进本章笔记。若这些文件不存在，服务水平目标就还是海报。值班轮转表、严重级别表、对外沟通模板三件套进仓库，新人第一次接电话才不靠喊。桌面推演记录也要有日期，和备份演练同一标准。把政策、预算表、手册索引放进同一目录，值班交接只丢一个链接。没有链接的呼叫视为流程失败，下一次复盘第一项就是补上。可靠性不是再买一套观测产品，而是这些文件真的被用过。把上次事故的复盘链接也放进同一目录，发布审批打开就能看见伤疤。这就是第一百零七章要交给组织的东西，不是又一张处理器曲线。政策目录存在且被值班用过，这一章才算交卷。交接检查就看能不能只靠这一目录过夜。过夜检查通过才算值班就绪了。

下面每问都要能用仓库里的文件回答，答不出来就还没做完。
1. 问：指标目标合同区别？ 答：测量、内部目标、对外扣款，三者不是同一数字。
2. 问：错误预算做什么？ 答：量化还能失败多少，烧完停高风险发布。
3. 问：告警对什么？ 答：对用户可感知症状，不对处理器热闹。
4. 问：谁当指挥官？ 答：只协调时间线与沟通的人，先喊角色再动手。
5. 问：复盘问什么？ 答：系统如何允许发生，不问谁是白痴。
6. 问：没有手册的呼叫？ 答：视为缺陷，先补手册或降级告警。
7. 问：产品不认预算？ 答：先打治理，目标否则是海报。
8. 问：演练要停条件吗？ 答：要，未知保护下不乱杀生产。
9. 问：严重级别谁定？ 答：事先写表，避免全员风暴。
10. 问：值班价值是什么？ 答：无聊的可执行手册，不是英雄加班。
把这些问题打印出来，找同事当评委抽三问。抽不到证据的那一问，就是下一周唯一任务。


十日结束后开一次十五分钟回顾：哪一天没有证据、哪一条会在毕业答辩被问到。把缺口列进下一周，而不是开始下一章收藏。

### 练习

1. 修改主 demo：把 \`failedRequests\` 改成 5000 与 5001，观察"仍在预算内/SLO 已违反"在 1 倍预算处的翻转；把 \`target\` 换成 0.99 与 0.9995，对比允许失败数的变化；把窗口换成 7 天（\`totalRequests\` 相应缩小），体会预算窗口与告警节奏的关系。
2. 脱离示例独立实现 \`ErrorBudget\` 类型：构造传入（窗口、总请求、目标），提供 \`Remaining\` 与 \`BurnRate(TimeSpan window)\`（1 小时快烧、6 小时慢烧双阈值），超阈值时输出"页面还是传呼"的建议；用 99.9% × 30 天 ≈ 43 分钟不可用做断言测试。
3. 生产场景：给毕业项目的下单旅程定义 SLI（非 5xx 且 < 300ms 的比例）与 30 天 99.9% 的 SLO，用真实流量算出允许失败数并做成仪表盘；配置多窗口 burn-rate 告警，每条绑定 owner、dashboard、runbook；写一份 SEV 分级表与 IC 检查单；删掉三条不可行动的 CPU 告警；把"错误预算耗尽冻结高风险发布"写进发布政策并让产品方签字。





`,
    code: `// ============================================================
// SLO 工程三件套（纯 C# 模拟）：
//   1. 错误预算：30 天窗口的可用性目标换算成「允许失败的次数」
//   2. 燃烧率告警：不看累计值，看「短期窗口烧预算的速度」——
//      页面慢半小时就该响，而不是等月底报表
//   3. 症状 vs 原因：只对用户看得见的症状告警，原因进仪表盘
// ============================================================

// ---------- 1. 错误预算 ----------
const long totalRequests = 5_000_000;
const long failedRequests = 3_200;
const double target = 0.999;  // 99.9%：30 天里允许 0.1% 失败

double actual = 1d - (double)failedRequests / totalRequests;
double allowedFailures = totalRequests * (1d - target);   // 预算总额
double budgetUsed = failedRequests / allowedFailures;    // 已烧比例

Console.WriteLine($"SLI={actual:P4}");
Console.WriteLine($"错误预算已使用={budgetUsed:P1}（允许 {allowedFailures:N0} 次失败，实际 {failedRequests:N0} 次）");
Console.WriteLine(budgetUsed > 1 ? "SLO 已违反" : "仍在预算内");

// ---------- 2. 燃烧率（burn rate）：短期窗口的烧钱速度 ----------
// 燃烧率 = 实际错误率 / 允许错误率。= 1 表示按预算匀速烧；
// 多窗口 SRE 实践：1h 窗口燃烧率 > 14.4（2% 预算/小时）= 页面级事故，立即告警；
// 6h 窗口 > 6 = 需要关注。速度×时间=消耗，快烧比慢烧危险得多。
var windows = new (string Name, long Total, long Failed, double Threshold)[]
{
    ("1h",  7_000,   120, 14.4),  // 错误率 1.71%：燃烧 17.1× → 立即页面（半小时烧掉一天预算）
    ("6h",  42_000,  130, 6.0),   // 错误率 ~0.31%：燃烧 3.1×，中速但未过阈 → 观察仪表盘
    ("30d", 5_000_000, 3_200, 1.0),
};

foreach (var (name, total, failed, threshold) in windows)
{
    double actualRate = (double)failed / total;
    double allowedRate = 1d - target;
    double burnRate = actualRate / allowedRate;
    Console.WriteLine($"{name,-4} 窗口：错误率 {actualRate:P3}，燃烧率 {burnRate:F1}×（阈值 {threshold:F1}×）→ {(burnRate > threshold ? "🚨 告警" : "正常")}");
}

// ---------- 3. 症状 vs 原因：告警只挂在用户看得见的地方 ----------
// 症状（用户视角）：p99 延迟、失败率、正确性——值得半夜叫醒。
// 原因（系统视角）：CPU 高、磁盘满、GC 频繁——进仪表盘白天看。
// 「CPU 90% 但用户毫无感知」不该触发页面；「失败率超标但所有机器绿灯」必须触发。
var alerts = new (string Signal, bool IsSymptom, bool Firing)[]
{
    ("p99 延迟 > 2s（用户感觉卡）",  true,  true),
    ("下单失败率 > 0.5%（用户下单失败）", true,  true),
    ("CPU 使用率 91%",                 false, true),
    ("GC Gen2 每秒 5 次",              false, true),
};

Console.WriteLine();
foreach (var (signal, isSymptom, firing) in alerts)
{
    var kind = isSymptom ? "症状" : "原因";
    var action = firing && isSymptom ? "→ 告警（叫醒值班）" : firing ? "→ 仪表盘（白天处理）" : "→ 静默";
    Console.WriteLine($"[{kind}] {signal} {action}");
}
Console.WriteLine("原则：对原因告警 = 噪音疲劳，真警报来时没人看。");
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch107",
    group: "第十七部分 云原生、交付与可靠性",
    icon: "🛟",
    title: "备份、灾备与生产排障",
    content: `## 第一百零八章　备份、灾备与生产排障

“我们有备份”在法庭和事故里都不够。只有 **恢复演练成功** 的备份才算数。灾备不是买了跨区副本就结束：RPO/RTO、勒索、runbook、磁盘快照与逻辑备份的差异，决定你能不能在承诺时间内把订单找回来。

### 一、RPO、RTO 与恢复演练

| 指标 | 含义 | 决定什么 |
| --- | --- | --- |
| RPO | 最多丢失多长窗口的数据 | 备份频率、同步/异步复制 |
| RTO | 最多多久恢复服务 | 自动化程度、热备/冷备、DNS 切换 |

RPO=0 几乎意味着同步复制和双活，成本高且有脑裂风险。RPO=5 分钟可能是连续归档 + 每 5 分钟快照。目标必须业务签字，不是工程师口头“应该差不多”。

**PITR（Point-in-Time Recovery）**：PostgreSQL WAL、SQL Server 日志链允许恢复到事故前一秒。前提是备份链完整、未中断、加密密钥找得到。演练：在隔离网络恢复到指定时间点，跑对账（订单行与支付、对象 key 是否存在），写下实际 RTO。从未演练的 PITR 只是文档幻想。

主 demo 用“上次备份是否在 RPO 内 + 演练是否通过”做门禁，生产应把演练日期做成指标。

### 二、磁盘快照 vs 逻辑备份、跨区、勒索

| 类型 | 内容 | 优点 | 缺点 |
| --- | --- | --- | --- |
| 磁盘/卷快照 | 整盘字节 | 快，含本地文件 | 崩溃一致性要配合冻结/VSS；难抽单表 |
| 逻辑备份（pg_dump、bacpac） | SQL/数据 | 可移植、可选表 | 大库慢；不替代 WAL |
| 托管连续备份 | 快照 + 日志 | 省运维 | 要理解保留期与跨区 |

数据库、对象存储、配置、**密钥恢复材料**、消息偏移/订阅都要进范围。备份加密，密钥与备份分存。跨故障域（另一区域/另一账号）存放，防止区域和被盗账号同时没。

勒索软件会加密生产盘并尝试删备份。对策：不可变备份（WORM/合规锁）、独立账号、删除需双人、定期从**离线副本**恢复。只在同一订阅里放“备份盘”等于给勒索一份清单。

区域故障切换：DNS/流量管理、数据库 failover、对象复制延迟、密钥是否在目标区域可读。切换 runbook 要包含 **failback** 和脑裂后的对账，不是只写“切过去”。

### 三、排障、runbook、恢复后

顺序：时间范围与最近变更 → SLI/流量/错误/延迟/饱和 → trace 沿依赖 → 结构化日志 → counters/dump。每次一个假设，可回退。不要未留证据就 \`kubectl delete pod --all\` 或清空队列。

.NET 工具：\`dotnet-counters\`、\`dotnet-trace\`、\`dotnet-dump\`、\`dotnet-gcdump\`、平台 \`createdump\`。dump 含内存中的令牌和 PII，按保密流程保存。

恢复服务后还要：消费积压、缓存是否该刷、搜索索引、Saga 补偿、账实核对。清单：

- [ ] RPO/RTO 业务已确认
- [ ] PITR 或等价物在隔离环境演练过
- [ ] 备份不可变或双人删除；加密密钥可恢复
- [ ] 区域切换与 failback 有 runbook
- [ ] 勒索场景假设备份也被删，仍有离线副本

### 四、排障证据链与恢复后对账

生产排障要像写实验记录。先冻结时间范围：开始、发现、最近发布、相关 flag。保存 \`kubectl get events\`、仪表盘截图时间、变更 SHA。dump 太大时先 counters 再 trace 再 dump，避免一上来把节点打满磁盘。内存转储按保密级别存放，到期删除。

逻辑备份与磁盘备份互补：逻辑便于抽表修复“一行被错误 UPDATE”；磁盘/PITR 便于整库回到事故前。应用层软删除误操作，有时用数据库备份还不如用审计表回放——设计时留补偿。消息偏移也要备份策略：恢复数据库到 T，消费者偏移仍在 T+1，会漏或重复，必须按 Inbox 幂等消化。

跨区 DR 的隐藏依赖：DNS TTL、第三方 Webhook 白名单 IP、证书 SAN、对象复制滞后、搜索索引重建时间。RTO 取最长那一项，不是取数据库 failover 广告值。每年至少一次全链路切换演练，记录真实分钟数，回头改 SLO 或改架构。把演练失败当作成功的发现，而不是隐瞒以免“看起来没准备好”。

恢复剧本写进仓库：谁有权发起 PITR、密钥在哪、对象对账脚本路径、消息 Inbox 如何消化重复、对外公告模板。每年改一次假日期跑桌面 + 至少一次隔离环境真恢复。记录实际分钟数，回头改 RTO 或改架构。勒索假设“主账号备份被删”，验证离线副本。磁盘快照不能替代逻辑抽表。没有日期的“我们备份了”在事故里等于没有。

灾备验收：RPO/RTO 有业务签字；隔离环境 PITR 演练有日期和实际分钟；备份不可变或双人删除；勒索假设演练过；恢复后有对账（订单、支付、对象、Inbox）。runbook 写清谁有权发起恢复。没有演练日期的备份陈述视为风险项，发布评审可以据此阻断。工具名称不重要，恢复证据重要。

灾备只认证据。业务签字的恢复点与恢复时间决定备份频率和拓扑。时间点恢复必须在隔离环境做过，写下实际分钟数和对账结果。磁盘快照与逻辑备份互补：一个回整库，一个抽错改的表。备份加密、跨域、不可变或双人删除，防勒索连备份一起毁。区域切换还要算域名、证书、对象复制、索引重建，取最长项当真实恢复时间。恢复后处理积压、缓存、搜索和 Inbox 重复。排障保留时间线与转储，不先清空队列。把演练日期做成指标，没有日期就不能在发布评审里勾选“已具备灾备”。工具广告值作废，你的分钟数作数。

### 十日落地：备份与排障

按日执行，写不下就延期，不许跳日。每一天结束要有仓库里的证据（测试、文档或演练记录），口头“做过了”不算。

1. 业务签字恢复点与恢复时间，并写进毕业文档。
2. 隔离环境做一次时间点恢复，记录实际分钟和对账。
3. 磁盘快照与逻辑备份互补，知道何时抽表何时整库。
4. 备份加密、跨域存放，删除需双人或不可变。
5. 勒索假设主账号备份被删，验证离线副本仍在。
6. 区域切换把域名、证书、对象复制、索引重建算进最长项。
7. 恢复后处理积压、缓存、搜索与收件箱重复。
8. 排障先定时间范围与最近变更，再指标再跟踪再转储。
9. 转储按保密存放到期删除，不清空队列灭火。
10. 演练日期做成指标，无日期不得在发布评审勾选已具备。

### 答辩常见问：备份灾备

再写一份一页纸恢复清单：谁有权发起、密钥在哪、对象对账脚本、消息如何去重、对外怎么说。把最近一次隔离恢复的实际分钟数写在页顶。没有分钟数就不要勾选具备灾备。勒索段落单独签字：主账号备份被删时离线副本仍可用。排障时先复制时间线再操作，避免灭火灭掉证据。这一页比再介绍一个备份产品名称更重要。把恢复清单打印出来贴在值班手册首页，事故夜里翻得到才算数。演练日期写进页眉，过期九十天视为无效。过期就重做一次短恢复。短恢复也要留下分钟数。

下面每问都要能用仓库里的文件回答，答不出来就还没做完。
1. 问：有备份等于能恢复吗？ 答：只有演练成功才算，日期是证据。
2. 问：恢复点恢复时间谁定？ 答：业务签字，决定频率与成本。
3. 问：时间点恢复前提？ 答：备份链完整、密钥找得到、隔离环境跑过。
4. 问：快照与逻辑备份？ 答：整盘快、抽表靠逻辑，互补不是二选一。
5. 问：勒索为何专写？ 答：会删备份，需要不可变或离线副本。
6. 问：切区看什么？ 答：域名证书对象复制索引，取最长项。
7. 问：恢复后还做什么？ 答：积压缓存搜索收件箱对账。
8. 问：排障第一件事？ 答：时间范围与最近变更，再动刀。
9. 问：转储注意？ 答：含令牌与个人信息，按保密存放。
10. 问：广告值作数吗？ 答：不作数，你的分钟数作数。
把这些问题打印出来，找同事当评委抽三问。抽不到证据的那一问，就是下一周唯一任务。


十日结束后开一次十五分钟回顾：哪一天没有证据、哪一条会在毕业答辩被问到。把缺口列进下一周，而不是开始下一章收藏。

### 练习

1. 修改主 demo：把 \`LastBackup\` 改成 10 分钟前（超过 RPO=5 分钟），确认输出变为"禁止宣称已具备灾备能力"；再把 \`RestoreTestPassed\` 改成 false 观察同样被拒；把 RPO/RTO 分别调成 15 分钟与 4 小时，体会指标与门禁的联动。
2. 脱离示例独立实现 \`static DrStatus Evaluate(RecoveryPlan plan, DateTimeOffset now)\`：同时校验备份新鲜度（RPO）、演练有效期（90 天内必须有一次带日期的恢复演练）与跨域副本存在，返回"可宣称灾备"或风险项列表；用表驱动测试覆盖"备份新鲜但演练过期""演练通过但备份超窗"等组合。
3. 生产场景：给毕业项目做一次完整灾备演练：在隔离环境用 PostgreSQL WAL 做 PITR 恢复到指定时刻，记录实际分钟数并跑对账（订单-支付-对象 key）；备份加密、密钥分存、删除需双人；勒索场景假设主账号备份被删，验证离线副本仍可恢复；把一页纸恢复清单（谁有权发起、密钥位置、对账脚本、对外公告模板）贴进值班手册，演练日期做成指标并接入发布门禁。





`,
    code: `// ============================================================
// 备份存在 ≠ 能恢复。RPO 看数据最多丢多久，RTO 看多久能回来。
// 没做过恢复演练的备份，评审时应视为不存在。
// 时刻一律用 DateTimeOffset.UtcNow，避免服务器本地时区把新鲜度算错。
// ============================================================
var plan = new RecoveryPlan(
    Rpo: TimeSpan.FromMinutes(5),
    Rto: TimeSpan.FromMinutes(30), // 本 demo 只打印 RPO；RTO 要靠演练秒表，不是字段自己变绿
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

应用可以下周改接口；**公共库不行**。消费者升级节奏不由你控制。发布后，类型名、方法、异常、默认值、线程安全、甚至“碰巧的”性能都可能成为契约。本章面向要打 NuGet 的团队，也面向只在公司内部 feed 发包的平台组。

### 一、公共表面、破坏性变更、多目标

最小 public surface：默认 \`internal\`，需要的类型才 \`public\`。不要把 EF 实体、JSON DTO、第三方类型暴露出去，否则你换依赖就是他们的破坏性变更。

破坏性变更包括：删/改名 public 成员、参数变必填、可空注解从 \`string\` 改为 \`string?\`（警告即契约）、异常种类变化、默认超时缩短、枚举插入中间值、\`IEqualityComparer\` 行为变化。新增可选参数、新重载、新接口默认实现通常兼容，仍要测。

多目标：内部库可只 \`net10.0\`；面向社区的库常 \`net8.0;net10.0\`。每个 TFM 都要在 CI 测。不要为 net48 牺牲安全补丁——宣布停止支持比带洞更负责。\`#if NET8_0_OR_GREATER\` 要少而集中。

### 二、SourceLink、snupkg、废弃包、InternalsVisibleTo

\`\`\`xml
<PropertyGroup>
  <PackageId>Company.Orders.Client</PackageId>
  <Version>2.1.0</Version>
  <PublishRepositoryUrl>true</PublishRepositoryUrl>
  <EmbedUntrackedSources>true</EmbedUntrackedSources>
  <IncludeSymbols>true</IncludeSymbols>
  <SymbolPackageFormat>snupkg</SymbolPackageFormat>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
  <ContinuousIntegrationBuild>true</ContinuousIntegrationBuild>
</PropertyGroup>
\`\`\`

**SourceLink** 让消费者调试步入对应提交的源码；CI 必须 \`ContinuousIntegrationBuild\` 才能确定性。**snupkg** 是符号包，上传到符号服务器，不要只发 nupkg 却让用户看反编译。包还要 README、许可证、可空注解。

废弃：在 nuget.org / 内部源标记 deprecated，并指向后继包。不要默默停更。分析器包（\`*.Analyzers\`）用 \`PrivateAssets="all"\` 传到消费者，避免分析器成为运行时依赖。

\`InternalsVisibleTo\` 只给测试程序集，且生产建议用公钥签名的 InternalsVisibleTo，避免任意程序集伪造友元。不要把 InternalsVisibleTo 给另一个产品库当“方便”——那是伪装的公共 API。

### 三、版本、APICompat、分析器

SemVer：修复补丁、兼容功能次版本、破坏性主版本。预发布 \`-preview.N\` 不保证兼容。用 Microsoft.CodeAnalysis.PublicApiAnalyzers 或 APICompat 把 public API 基线检入仓库，CI 拒绝无意识扩大/缩小。\`[Obsolete("Use X", error: false)]\` 给一个主版本周期，再删。

### 四、清单

- [ ] public API 有基线检查
- [ ] 多 TFM 均有测试
- [ ] SourceLink + snupkg + README
- [ ] 废弃包有指向；分析器 PrivateAssets
- [ ] InternalsVisibleTo 仅测试且签名
- [ ] 异步方法接受 CancellationToken；集合所有权有文档

### 五、版本策略、依赖与安全公告

内部库也按 SemVer 发，哪怕只有三个消费者。浮动版本 \`1.*\` 会在凌晨还原一个破坏性预览包。应用端用 Central Package Management 钉版本，库端对自己的依赖用尽可能宽松但不越安全边界的范围。传递依赖漏洞：\`dotnet list package --vulnerable\` 进 CI，不能修就换包或隔离。弃用路径写进 CHANGELOG 的迁移一节，给日期。

SourceLink 失败常见原因：CI 没设 \`ContinuousIntegrationBuild\`、源不在仓库根、或 deterministic 构建缺信息。用一个空消费者项目引用本地 nupkg，F8 步入验证。符号包要和 nupkg 同一版本上传，否则调试对不上。包签名（Authenticode / nuget 签名）按组织供应链要求，至少固定包源映射，防止同名劫持。

分析器包版本与代码修复器要可关。发一个过于严格的 analyzer 作为 \`error\` 会在升级日让全公司构建变红——先 \`info\`/\`warning\` 一个周期。\`InternalsVisibleTo\` 给性能测试程序集可以，但不要给插件宿主；插件用公共接口。公共 API 审查当作小型 ADR：为什么这个类型必须 public。删比加难，所以默认不导出。

发包前检查：PublicAPI 基线 diff、每个 TFM 测试、snupkg 可下载、SourceLink 能步入、README 含最小示例、许可证非空、废弃包指向后继、分析器 PrivateAssets、InternalsVisibleTo 仅测试公钥。破坏性变更走主版本并写迁移。内部三消费者也要 SemVer。供应链扫描进 CI。类库作者的礼貌是：让升级无聊，让破坏显而易见。

类库验收：API 基线在 CI、多 TFM 测试、SourceLink+snupkg、废弃有指向、分析器 PrivateAssets、InternalsVisibleTo 仅测试。给内部消费者一次预发布。破坏性变更写 BREAKING CHANGE 与迁移。升级应无聊。若每次升级都要改调用方，那是你的 API 设计失败，不是他们不积极。

公共库是慢性产品。表面越小越好，默认内部可见。破坏包括删改名、收紧参数、改变异常与默认值、可空注解变化。多目标每个框架都要测。符号包与源码链接让消费者能调试到你的提交。废弃要指向后继并给时间。分析器当私有资源传递。友元程序集只给测试且签名。基线检查进持续集成，无意识扩大表面就失败。版本按语义化，预发布不保证兼容。内部三个调用方也要纪律，因为他们的升级日会变成你的事故日。礼貌是让升级无聊，让破坏在变更日志里刺眼。把这一段贴进库仓库的贡献指南。

### 十日落地：类库与包

按日执行，写不下就延期，不许跳日。每一天结束要有仓库里的证据（测试、文档或演练记录），口头“做过了”不算。

1. 公共表面基线检入，持续集成拒绝无意识扩大或缩小。
2. 每个目标框架都有测试，不为古老目标牺牲补丁。
3. 符号包与源码链接可步入对应提交。
4. 说明、许可证、可空注解齐全，废弃包指向后继。
5. 分析器私有传递，不成为运行时依赖。
6. 友元只给测试程序集且建议公钥。
7. 破坏性变更走主版本并写迁移与过时特性。
8. 内部消费者也按语义化版本，浮动版本禁止。
9. 供应链扫描进流水线，漏洞传递依赖有处理。
10. 发布前用空消费者项目验证安装与调试。

### 答辩常见问：NuGet 类库
下面每问都要能用仓库里的文件回答，答不出来就还没做完。
1. 问：什么算破坏？ 答：删改名、收紧参数、改异常默认值、可空变化。
2. 问：为何要基线？ 答：防止无意识扩大表面，升级日才发现。
3. 问：符号包干什么？ 答：让消费者调试步入你的提交。
4. 问：友元给谁？ 答：仅测试且建议公钥，不当方便后门。
5. 问：分析器如何引用？ 答：私有传递，避免成为运行时依赖。
6. 问：内部库也要版本纪律吗？ 答：要，三个调用方的升级日就是你的事故日。
7. 问：浮动版本？ 答：禁止，凌晨还原预览包会炸。
8. 问：礼貌是什么？ 答：升级无聊，破坏在日志里刺眼。
把这些问题打印出来，找同事当评委抽三问。抽不到证据的那一问，就是下一周唯一任务。


十日结束后开一次十五分钟回顾：哪一天没有证据、哪一条会在毕业答辩被问到。把缺口列进下一周，而不是开始下一章收藏。

### 练习

1. 修改主 demo：在 \`Main\` 里调用 \`client.GetAsync("A-100")\` 观察编译警告 CS0618 的文案；给 \`[Obsolete]\` 加 \`error: true\` 观察警告升级为错误；再给 \`GetOrderAsync\` 传一个已取消的 \`CancellationToken\`（\`new CancellationTokenSource(0).Token\`），观察 \`OperationCanceledException\` 抛出。
2. 脱离示例实现版本守卫：\`ApiCompatGuard\` 记录 v1 的公开成员清单（\`Type.Name + "." + MemberName + 参数签名\`），与 v2 清单对比后输出 added / removed 两张表——出现 removed 即要求 major 版本，只增即 minor；写测试分别构造两种差异验证判定。
3. 生产场景：给毕业项目的一个内部库开 PackageValidation（\`EnablePackageValidation=true\` + baseline 钉住 1.0.0）并 pack 一次成功；随后删掉一个 public 方法再 pack，观察构建失败信息；把「删除 API 前先在 minor 版本 Obsolete 一个周期、隔 major 再删」写进贡献指南。




`,
    code: `// ============================================================
// 公共库兼容：旧成员先标 Obsolete，委托给新实现，下个大版本再删。
// 新入口必须带 CancellationToken；旧入口没有也不要偷偷吞掉取消。
// 消息写清替代 API 和移除版本，IDE 才能把迁移路径显示给调用方。
// ============================================================
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

生产 Web API 的核心是管道顺序、端点元数据和稳定错误契约，不是把业务塞进 lambda。主 demo 用纯 C# 模拟“先入后出”；真实行为必须在 ASP.NET 项目里用第一百一十四章的工厂验证。

### 一、中间件顺序（务必按表）

| 顺序 | 中间件 | 作用 | 放错的后果 |
| --- | --- | --- | --- |
| 1 | ExceptionHandler / DeveloperExceptionPage | 捕获后续异常 | 放后面则无法包装为 Problem Details |
| 2 | ForwardedHeaders（仅信任已知代理） | 还原协议与客户端 IP | 无白名单则攻击者伪造 IP/Host |
| 3 | HSTS / HTTPS 重定向 | 传输安全 | 内网 gRPC 明文要排除 |
| 4 | Routing | 匹配端点 | 鉴权前不知道 endpoint metadata |
| 5 | CORS | 浏览器跨域 | 与凭据 cookie 组合要谨慎 |
| 6 | Authentication | 填写 User | 放在 Authorization 之后等于形同虚设 |
| 7 | Authorization | 执行策略 | 漏掉则匿名可进 Map |
| 8 | RateLimiter | 限流 | 应能按用户/IP |
| 9 | Endpoint（Map*） | 执行处理 | — |

\`\`\`csharp
var app = builder.Build();
app.UseExceptionHandler();
app.UseForwardedHeaders();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.MapControllers();
\`\`\`

.NET 6+ 的 \`UseAuthentication/UseAuthorization\` 与路由集成后，仍要保证 **先认证后授权**。WAF/反代做的限流不能替代应用内按身份的限流。

### 二、Minimal API、Controller、MapGroup、过滤器

Minimal API 适合垂直切片和小组件：\`MapGroup("/orders")\` 共享前缀、授权和 OpenAPI 标签。\`AddEndpointFilter\` 做验证、日志、幂等键。\`TypedResults.Ok/Created/Problem\` 让契约进入类型系统。Controller 适合复杂绑定、\`IActionFilter\`/\`IAsyncResourceFilter\`、大型团队已有约定。两者可共存，**领域层不应知道你选了哪个**。

过滤器 vs 中间件：中间件看不到 MVC 模型绑定结果；过滤器/endpoint filter 可以。跨切面（相关 id、异常）用中间件；针对“这个端点要幂等”用 filter。

端点元数据（\`IEndpointConventionBuilder.WithMetadata\`、\`[Authorize]\`、\`ProducesProblem\`）驱动授权、OpenAPI 和 \`LinkGenerator\`。漏元数据会导致文档与真实 401/403 不一致。

### 三、IProblemDetailsService 与版本化预览

ASP.NET Core 8+ 的 \`IProblemDetailsService\` 把未处理异常、状态码页和手工 \`Results.Problem\` 收成 RFC 9457。配置 \`ProblemDetailsOptions\` 附加 \`traceId\`，禁止进栈。版本化：URL（\`/v1/orders\`）简单；header / media type 更 REST，网关要会转。预览版本（\`v2-preview\`）必须可关，且不保证兼容——写进文档，监控调用方。

输入：DTO ≠ 领域；限制 body 大小。输出：不直接返回 EF 实体。取消：\`RequestAborted\` 下传；已提交事务不能因取消假装回滚。

### 四、清单

- [ ] 中间件顺序与转发头白名单已评审
- [ ] 认证在授权之前；匿名端点显式标出
- [ ] MapGroup / 过滤器不把业务拖进管道
- [ ] 错误走 Problem Details，有 traceId
- [ ] 真实行为有 WAF 集成测试（第一百一十四章）

### 五、绑定、限流与问题详情落地

模型绑定失败应变成 400 Problem Details，而不是空 500。Minimal API 用 \`AddEndpointFilter\` 或生成的验证，Controller 用 \`ApiController\` 约定。\`[FromHeader]\` 的幂等键、\`If-Match\` 版本必须出现在 OpenAPI 元数据里，否则文档生成器会漏。\`MapGroup\` 上的 \`RequireAuthorization("orders")\` 不要被组内某个 \`AllowAnonymous\` 意外扩大；评审 diff 时专门搜授权变化。

限流分区：按用户、租户、IP。全局限流会被一个大客户吃光。返回 \`429\` + \`Retry-After\`，并纳入 SLI 时决定 429 算谁的错误——通常不算服务错误，但要单独指标。\`IProblemDetailsService\` 自定义时注意不要覆盖 401/403 的挑战头。异常处理中间件必须在开发与生产有不同细节级别，生产 \`detail\` 给稳定句子，开发才给异常消息。

Kestrel / YARP 的限制与应用限制要对齐，否则反代已 413，应用日志看不到。把管道图画进仓库 \`docs/pipeline.md\`，新人改中间件先改图。第一百一十章的主 demo 打印 enter/exit 顺序，请对照真实 \`IStartupFilter\` 和框架插入的中间件再看一次日志——你以为的顺序和实际顺序经常差两步。

### 答辩常见问：ASP.NET 管道
下面每问都要能用仓库里的文件回答，答不出来就还没做完。
1. 问：转发头为何危险？ 答：不设白名单则攻击者伪造协议主机与地址。
2. 问：认证授权顺序？ 答：必须先认证后授权，放反等于虚设。
3. 问：过滤器与中间件？ 答：中间件看不到绑定结果，端点级规则用过滤器。
4. 问：问题详情谁统一？ 答：问题详情服务，附加跟踪号，生产无堆栈。
5. 问：取消能回滚已提交？ 答：不能，只能停止无价值后续工作。
6. 问：如何测顺序？ 答：工厂里伪造头、匿名、异常包装三条。
7. 问：组路由坑？ 答：组内匿名可能扩大授权，审查要搜授权差异。
8. 问：管道图为何要入库？ 答：新人改中间件先改图，避免口头传统。
把这些问题打印出来，找同事当评委抽三问。抽不到证据的那一问，就是下一周唯一任务。

### 练习

1. 修改主 demo：在 \`Build\` 的参数里最前面加一个 \`"forwarded-headers"\`、末尾再加一个 \`"rate-limiter"\`，先在纸上预测 enter/exit 顺序再运行验证；把 \`names.Reverse()\` 改成正序遍历，看管道顺序如何整个反转；故意在 \`authorization\` 里抛异常，观察所有 \`exit\` 都不再打印——体会为什么 ExceptionHandler 必须排在最外层。
2. 脱离示例独立实现 \`app.Use(...)\` 风格的构建器：\`PipelineBuilder.Use(Func<RequestContext, Func<Task>, Task> middleware)\` 支持链式注册与短路（不调用 next 直接返回），验证短路时内层中间件不再 enter；再写一个计时中间件包住 endpoint 输出耗时。
3. 生产场景：在真实 ASP.NET 项目里按表落中间件顺序（ExceptionHandler → ForwardedHeaders → HttpsRedirection → Authentication → Authorization → RateLimiter → Map*），用 WebApplicationFactory 写三条集成测试：伪造 \`X-Forwarded-For\` 验证白名单、匿名访问受保护端点得 401、未处理异常被包成 Problem Details 且带 traceId；把管道图画进 docs/pipeline.md；限流按用户分区并返回 429 + Retry-After。





`,
    code: `// ============================================================
// 中间件是洋葱：先注册的最外层，进入正序、离开逆序。
// 因此异常处理必须最先包上，认证必须在授权之前。
// Reverse 再包裹：最后一次赋值的 next 是管道入口。
// capturedNext 避免闭包捕获正在被改写的 next 变量。
// ============================================================
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
        var capturedNext = next; // 必须拷贝：后面会改 next，闭包若抓变量本身会看到最终值
        next = async context =>
        {
            Console.WriteLine($"enter {name}");
            await capturedNext(context); // 先外后内进入；await 返回后是先内后外离开
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

OpenAPI 文档一旦被客户端生成器、网关、合同测试引用，它就和数据库 schema 一样是发布物。手写一份过期的 Swagger 比没有更危险：调用方按文档传字段，运行时 400。

### 一、文档生成与可空

.NET 9/10 内置 \`AddOpenApi()\` / \`MapOpenApi()\`，从端点元数据、\`TypedResults\`、XML 注释生成。旧 \`Swashbuckle\` 仍常见，但新项目优先内置管道。生产是否暴露 \`/openapi\` 取决于威胁模型：内网可开，公网常只给门户静态副本。

\`\`\`csharp
builder.Services.AddOpenApi();
var app = builder.Build();
if (app.Environment.IsDevelopment())
    app.MapOpenApi();
\`\`\`

**Schema 里的可空**：\`string?\` 应体现为 \`nullable: true\` 或 oneOf。C# 可空注解与 JSON 默认值（缺省 vs JSON null）不是一回事。\`required\` 数组必须与模型绑定一致，否则生成的 SDK 会漏必填校验。枚举要决定是字符串还是整数，并在文档写清未知值策略。

### 二、版本：URL vs Header

| 策略 | 例子 | 优点 | 缺点 |
| --- | --- | --- | --- |
| URL | \`/v1/orders\` | 直观、缓存键简单 | 资源标识随版本变 |
| Header | \`Accept: application/vnd.shop.v2+json\` | 同一 URL | 中间盒、调试不直观 |
| Query | \`?api-version=1.0\` | 易试验 | 缓存与日志嘈杂 |

组织内选一种。优先 **兼容新增** 避免升版本：加可选字段、加新端点。破坏性变更才并行 v2，v1 设日落日期。响应带 \`Deprecation\`、\`Sunset\`、\`Link\` 头。监控 v1 流量，到阈值再关。滚动发布期间 v1 与 v2 **以及** 旧二进制必须同时活着。

### 三、错误契约与弃用

统一 RFC 9457：\`type\`（稳定 URI）、\`title\`、\`status\`、\`detail\`（可给用户看的）、\`instance\`、扩展 \`errorCode\` / \`traceId\`。\`type\` 和 \`errorCode\` 是客户端分支依据，不要用中文句子当协议。禁止堆栈、SQL、内部类型。主 demo 用稳定错误码表，这是最低可行契约。

弃用字段：文档标记 \`deprecated: true\`，运行时仍接受一段时间，日志打点谁还在用，再拒绝。删字段前必须能指出最后一个消费者。

### 四、SDK 生成的谨慎与门禁

OpenAPI Generator / Kiota / NSwag 能出客户端，但：生成代码的默认重试可能不幂等；命名会丑；你无法控制对方何时重新生成。对外更稳的是：**稳定 HTTP 契约 + 官方少量 SDK**，而不是强迫每家公司检入 2 万行生成物。内部可以用生成客户端，但要锁定生成器版本并审 diff。

CI：对 OpenAPI 做语义 diff（oasdiff 等），破坏性变更必须 major 版本或豁免。仅 \`git diff swagger.json\` 会被空白和属性顺序干扰。再加上消费者契约测试（对真实 WAF 打关键路径）。清单：

- [ ] 文档由代码生成，可空/必填与运行时一致
- [ ] 版本策略唯一；弃用有日期和流量
- [ ] Problem Details 字段稳定，无内部泄漏
- [ ] 不把未审查的生成 SDK 当银弹
- [ ] CI 拦语义破坏

### 五、文档即测试、兼容矩阵

把 OpenAPI 快照检入 \`contracts/openapi.v1.json\`，PR 里看语义 diff。生成的文档与运行时不一致的来源：忘记 \`Produces\`、过滤器短路、多态未声明、\`JsonIgnore\` 与 schema 不同步。每个发布打一次“文档 vs 真实”集成测试：启动 Host，抓 \`/openapi/v1.json\`，对比快照。

版本并存期间的路由测试：v1 与 v2 的同一资源 ID 是否兼容、错误码是否仍可解析。弃用头要在集成测试断言存在。对外部合作伙伴提供变更日历，而不是突然 404。SDK 若必须提供，锁生成器版本，生成物进仓库，走代码评审——生成不是免审许可证。

可空与默认值再强调：JSON 省略字段、JSON \`null\`、空字符串在业务上是三件事。文档和 C# 模型要三者分开处理。金额字段用整数分或 decimal 字符串，避免 JS 客户端把 \`number\` 丢精度。这是契约问题，不是前端问题。把错误码表当作公共 API 的一部分版本化，主 demo 的字典应变成真实仓库里的 \`errors.md\`。

再练：给 v1 加可选字段，oasdiff 应显示非破坏；删字段必须失败或要求豁免。Sunset 头有集成测试。SDK 生成物若检入，生成器版本钉死并审 diff。可空三态（缺省 / null / 空串）分别举例。金额用整数分避免 JS number。文档端点生产默认关闭，改由门户发静态副本。契约测试失败应阻断合并，和编译失败同级。

契约验收：OpenAPI 快照语义 diff 进 CI；可空/必填与运行时一致；错误码表版本化；弃用有 Sunset 与流量；生产不默认暴露文档端点。生成 SDK 若存在则钉生成器版本。金额不用 JS number。评委应能指出一个非破坏新增和一个被门禁拦住的破坏删除。

契约一旦被生成器和网关引用就是发布物。文档由代码生成，可空与必填和运行时一致。版本策略在网址与请求头里只选一种。优先兼容新增，破坏才并行大版本并写日落。错误用稳定类型与错误码，不用中文句子当协议。持续集成做语义差异，破坏要主版本或豁免。生成客户端要锁生成器版本并审查。金额避免动态语言数字精度问题。生产默认不暴露文档端点。评委应能指出一次合法新增和一次被拦住的删除。把错误码表当成公共接口版本化，主演示里的字典要变成仓库里的说明文件。

### 十日落地：OpenAPI 契约

按日执行，写不下就延期，不许跳日。每一天结束要有仓库里的证据（测试、文档或演练记录），口头“做过了”不算。

1. 文档由代码生成，快照检入，语义差异进持续集成。
2. 可空、必填、缺省与空串三态在模型与文档对齐。
3. 版本策略只选网址或请求头一种，全公司统一。
4. 兼容新增走小步，破坏并行大版本并写日落日期。
5. 弃用响应头有集成断言，旧版流量可观测。
6. 错误类型与错误码稳定，禁止堆栈与内部类型。
7. 金额用整数分或十进制字符串，避免动态语言精度。
8. 生成客户端若存在则钉生成器版本并审查差异。
9. 生产默认不暴露文档端点，改由门户发静态副本。
10. 评委能指出一次合法新增和一次被门禁拦住的删除。

### 答辩常见问：OpenAPI

契约章补一句验收：快照差异在持续集成变红时，必须有人解释兼容还是破坏，破坏就要升版本或拿豁免。没有这个对话，开放接口文档只是装饰。

下面每问都要能用仓库里的文件回答，答不出来就还没做完。
1. 问：文档过期比没有更糟？ 答：调用方按过期字段传参会四百，信任被破坏。
2. 问：可空如何进模式？ 答：与可空注解和绑定一致，缺省与空值分开。
3. 问：版本选哪种？ 答：组织内只选一种，优先兼容新增。
4. 问：错误凭什么分支？ 答：稳定类型与错误码，不用自然语言。
5. 问：生成软件开发包？ 答：锁生成器版本，审查差异，不盲信重试。
6. 问：金额字段？ 答：整数分或十进制字符串，避免动态语言精度。
7. 问：生产暴露文档？ 答：按威胁模型，常只给门户静态副本。
8. 问：门禁比文本差异？ 答：要比语义，空白和属性顺序会误报。
把这些问题打印出来，找同事当评委抽三问。抽不到证据的那一问，就是下一周唯一任务。


十日结束后开一次十五分钟回顾：哪一天没有证据、哪一条会在毕业答辩被问到。把缺口列进下一周，而不是开始下一章收藏。

### 练习

1. 修改主 demo：把 \`code\` 改成字典里不存在的 \`"order.gone"\`，观察 \`errors[code]\` 抛出的 \`KeyNotFoundException\`——想想生产代码该返回什么而不是崩；往 \`errors\` 加 \`["order.rate_limited"] = new(429, "Too many requests")\` 并查询；给 \`ApiProblem\` 加 \`string? TraceId\` 扩展字段。
2. 脱离示例独立实现 \`ProblemDetailsFactory\`：输入（errorCode、detail、traceId）输出 RFC 9457 形态——\`type\` 为稳定 URI（如 \`https://api.shop.dev/errors/order.not_found\`）、\`title\`、\`status\`、\`instance\` 加扩展字段；错误码表从 \`errors.md\` 加载，未知错误码返回 500 + \`internal_error\` 而不是抛异常。
3. 生产场景：把毕业项目的 OpenAPI 快照检入 \`contracts/openapi.v1.json\`，CI 用 oasdiff 做语义 diff——加可选字段应显示非破坏、删字段必须变红并要求 major 或豁免；错误统一走 \`IProblemDetailsService\` 附加 traceId；弃用字段时响应带 \`Deprecation\`/\`Sunset\` 头并有集成测试断言；金额字段用整数分避免 JS number 精度。





`,
    code: `// ============================================================
// API 契约三件套（纯 C# 模拟）：
//   1. 稳定错误码：客户端解析 code，不是 title 的自然语言
//   2. 弃用流程：Deprecation/Sunset 头 + 通知期，不是周五直接删字段
//   3. 破坏性变更判定：删字段/改语义 = major；加可选字段 = minor
// ============================================================

// ---------- 1. 稳定错误码 ----------
// code 是契约（改它 = 破坏性变更）；title 是给人看的文案（随便改）。
var errors = new Dictionary<string, ApiProblem>
{
    ["order.not_found"] = new(404, "Order not found"),
    ["order.conflict"] = new(409, "Order state conflict"),
    ["request.invalid"] = new(400, "Request validation failed"),
};

foreach (var code in new[] { "order.conflict", "order.not_found", "order.teapot" })
{
    // 未知错误码绝不能抛 KeyNotFoundException 崩掉——退到 500 + internal_error，
    // 让客户端始终拿到 RFC 9457 形态，而不是连接被掐断。
    var problem = errors.TryGetValue(code, out var known)
        ? known with { Code = code }
        : new ApiProblem(500, "Internal error") with { Code = "internal_error" };
    Console.WriteLine($"{problem.Status} {problem.Code}: {problem.Title}");
}

// ---------- 2. 弃用：给客户端机器可读的倒计时 ----------
// 三个头一起发：Deprecation（何时弃）、Sunset（何时停）、link 到迁移文档。
// 契约测试断言「弃用字段在 Sunset 前仍返回且带头」——口头通知不算弃用。
var now = DateTimeOffset.UtcNow;
var deprecations = new (string Field, DateTimeOffset DeprecatedAt, DateTimeOffset SunsetAt)[]
{
    ("customer_name", now.AddDays(-60), now.AddDays(30)),   // 已弃用 60 天，还剩 30 天
    ("vip_level",     now.AddDays(-350), now.AddDays(15)),  // 马上到 sunset：最紧急
};

foreach (var (field, deprecatedAt, sunsetAt) in deprecations)
{
    var remaining = (sunsetAt - now).TotalDays;
    Console.WriteLine($"\\n字段 {field}：Deprecation={deprecatedAt:yyyy-MM-dd}，Sunset={sunsetAt:yyyy-MM-dd}");
    Console.WriteLine(remaining < 30
        ? $"  ⚠ 剩 {remaining:F0} 天停用：升级公告再发一轮 + 调用方监控告警"
        : $"  剩 {remaining:F0} 天停用：响应继续带字段与 Deprecation 头");
}

// ---------- 3. 破坏性变更判定 ----------
// 规则：删字段/改类型/改语义/收紧校验 = 必须 major（v2）；
//       加可选字段/加新错误码/放宽校验 = minor 安全。
static string Classify(string change) => change switch
{
    var c when c.Contains("删除字段") || c.Contains("改类型") || c.Contains("改语义") => "MAJOR（v2 路由 /v2/，旧版本至少再维护 6 个月）",
    var c when c.Contains("收紧") => "MAJOR（昨天能过的请求今天 400，对调用方就是破坏）",
    _ => "minor（加可选字段/新错误码，客户端无感升级）",
};

foreach (var change in new[] { "删除字段 customer_name", "加可选字段 coupon_code", "收紧校验 amount>0", "加错误码 order.rate_limited" })
    Console.WriteLine($"{change,-28} → {Classify(change)}");

public sealed record ApiProblem(int Status, string Title, string? Code = null);
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch111",
    group: "第十八部分 平台拓展与毕业实战",
    icon: "🪪",
    title: "OAuth 2.0、OIDC、JWT 与 BFF",
    content: `## 第一百一十二章　OAuth 2.0、OIDC、JWT 与 BFF

OAuth 2.0 解决**授权委托**，OIDC 在其上加**认证**（ID Token）。JWT 只是令牌编码，不是登录协议。把“前端存 access token + 自己解析 payload”当成登录，是 2026 年仍然高发的事故源。主 demo 故意只解码、并打印警告：解码 ≠ 验证。

### 一、流程表

| 流程 | 谁用 | 令牌 | 2026 态度 |
| --- | --- | --- | --- |
| Authorization Code + **PKCE** | 浏览器 SPA、移动端、带 BFF 的 Web | 授权码换 access（+ refresh） | **默认** |
| Client Credentials | 服务对服务 | access | 内部 API；更好是 workload identity |
| Refresh Token Rotation | 需要长会话 | 一次性 refresh | 必须轮换+重用检测 |
| Implicit | 旧 SPA | 直接回 token | **淘汰**，禁止新系统 |
| ROPC（密码） | 遗留 | 用户密码给客户端 | 禁止，除非 IdP 托管遗留 |

OIDC 的 ID Token 给客户端证明“谁登录了”；Access Token 给 API。不要把 ID Token 当 API 凭证，除非 IdP 明确这样设计。PKCE 防止授权码被拦截者换走。

### 二、JWT vs 会话、audience、issuer

JWT 优点：无状态、可跨服务验证。代价：撤销难（只能短 TTL + 黑名单）、体积大、时钟敏感。会话（服务器存 session id）易撤销、易轮换，要存存储并处理粘滞/共享缓存。BFF 把两者结合：浏览器只拿会话 cookie，BFF 持有 refresh/access。

验证必须检查：签名算法白名单（禁 \`none\`、禁随意 RSA/HMAC 切换）、\`iss\` 精确匹配、\`aud\` 包含**本 API**、\`exp\`/\`nbf\`、\`tid\`/租户。\`AddJwtBearer\` 的 \`Authority\` 用于拉 JWKS，不要接受调用方传来的任意 \`iss\`（issuer 混淆）。

\`\`\`csharp
builder.Services.AddAuthentication()
    .AddJwtBearer(options =>
    {
        options.Authority = issuer;          // 固定配置，不是请求里的
        options.Audience = "orders-api";
        options.MapInboundClaims = false;
    });
\`\`\`

### 三、BFF Cookie、Refresh 轮换、Confused Deputy

高敏感浏览器：BFF 模式。令牌留在服务器，浏览器只有 \`HttpOnly; Secure; SameSite=Lax|Strict\` 的会话 cookie。CSRF：SameSite + 反伪令牌（跨站 POST 仍要）。XSS 不再轻易偷到 Bearer，但仍能借会话调 BFF，故 CSP 和输入转义仍必要。

Refresh **轮换**：每次颁发新 refresh，旧的立即失效。若旧 refresh 再出现，视为盗窃，**吊销整个家族**。存 refresh 要哈希，像存密码。

**Confused deputy（糊涂代理人）**：你的 API 拿着用户令牌去调下游，下游只看“令牌有效”不看“是否为该用户、该 audience 授权这次调用”。必须：下游校验 aud/scope；传播用户身份而不是换成万能服务账号；防止开放重定向把授权码送到攻击者。

授权：policy + 资源级 \`tenant_id\` 过滤。隐藏按钮不是授权。

### 四、清单

- [ ] 用户交互走 Code + PKCE；无 implicit
- [ ] API 校验签名、iss、aud、时间；不信任解码
- [ ] Refresh 轮换 + 重用检测
- [ ] 浏览器优先 BFF cookie，处理 CSRF
- [ ] 下游调用防糊涂代理人
- [ ] 签名密钥 kid 轮换有重叠窗口

### 五、声明、时钟与多租户陷阱

\`scope\` 与 \`role\` 是粗粒度；对象级授权仍要查库。不要把“管理员”做成全局上帝除非确实如此，按租户赋角色。\`amr\` / \`acr\` 可用于高风险操作的升级认证（step-up）。时钟偏移：容器时间未同步会导致全员 401，监控 JWT 验证失败原因分类（exp/sig/aud）。允许的时钟偏移保持小（一两分钟），不要开到一小时“图省事”。

登出：本地会话可删；JWT 未过期仍可用，故 access TTL 要短。全局登出靠刷新家族吊销和 IdP session。第三方 IdP 中断时的 fail-closed：登录失败，已有会话可按业务决定是否保留。把 IdP 当依赖纳入 SLO。

Redirect URI 白名单精确匹配，开放重定向是 OAuth 经典洞。state / nonce 防 CSRF 与重放。移动端用系统浏览器 + PKCE，不要内嵌 WebView 劫持。服务账号调用用户 API 时带上用户身份（obo 或可信头 + 双向 TLS），并防糊涂代理人：下游拒绝“只验证签名、不验证 aud/scope/主体”。主 demo 解码 JWT 是为了教学；生产代码路径不得出现“只 Decode 不 Validate”。

威胁模型作业：列出 implicit 回潮、开放重定向、refresh 重用、糊涂代理人、XSS 偷 cookie、受众混淆各一条利用故事（只写防御，不写利用步骤）。对应测试：错误 aud 403、过期 401、跨租户 404、BFF CSRF 拒绝、下游拒绝无用户身份的服务账号。时钟偏移监控分类。IdP 纳入 SLO。Redirect URI 精确匹配。这一章没有“先上线再加鉴权”的及格路径。

身份验收：Code+PKCE；API 验签+iss+aud；refresh 轮换；BFF cookie 处理 CSRF；跨租户测试；下游防糊涂代理人。禁止 implicit。把“只解码 JWT”的代码路径列为缺陷。IdP 进 SLO。演示错误 audience 与过期令牌。这一章不过，毕业项目直接不合格。

身份这一章没有补考。浏览器走授权码加证明密钥交换，废弃隐式流。接口校验签名、签发者、受众和时间，不信任解码。刷新令牌轮换并检测重用。浏览器优先后端会话饼干并处理跨站。调用下游时带用户身份，防止糊涂代理人只看签名不看受众。跨租户访问应表现为找不到而不是未授权，以免探测存在。时钟偏移分类监控。身份提供者纳入目标。演示过期、错误受众、跨租户、跨站拒绝。先上线再加认证的借口在毕业标准里直接否决。把威胁模型写成防御条目，不写利用步骤。

### 十日落地：OAuth 与 BFF

按日执行，写不下就延期，不许跳日。每一天结束要有仓库里的证据（测试、文档或演练记录），口头“做过了”不算。

1. 用户交互走授权码加证明密钥交换，隐式流禁止。
2. 接口校验签名、签发者、受众、时间，算法白名单。
3. 刷新令牌轮换，旧令牌再现则吊销家族。
4. 浏览器优先后端会话饼干，跨站伪造有防护。
5. 服务到服务用客户端凭证或工作负载身份，不借用用户密码。
6. 调用下游带用户身份，下游拒绝无受众的万能号。
7. 跨租户表现为找不到，避免探测资源存在。
8. 重定向地址精确匹配，状态与一次性数防重放。
9. 时钟偏移分类监控，身份提供者纳入目标。
10. 演示过期、错误受众、跨租户与跨站拒绝四条自动化。

### 答辩常见问：身份
下面每问都要能用仓库里的文件回答，答不出来就还没做完。
1. 问：令牌解码等于验证？ 答：不等于，必须验签与约束，教学解码不得进生产路径。
2. 问：为何证明密钥交换？ 答：防止授权码被拦截者换走。
3. 问：刷新如何防盗？ 答：每次换新，旧的再现吊销家族。
4. 问：饼干与承载？ 答：饼干防跨站，承载防脚本偷盗，选 BFF 仍要内容安全。
5. 问：糊涂代理人？ 答：下游只看签名不看受众与主体，必须拒绝。
6. 问：跨租户返回？ 答：找不到优于未授权，减少探测。
7. 问：隐式流？ 答：淘汰，新系统禁止。
8. 问：身份提供者挂了？ 答：纳入目标，登录失败关闭，已有会话按策略。
把这些问题打印出来，找同事当评委抽三问。抽不到证据的那一问，就是下一周唯一任务。


十日结束后开一次十五分钟回顾：哪一天没有证据、哪一条会在毕业答辩被问到。把缺口列进下一周，而不是开始下一章收藏。

### 练习

1. 修改主 demo：把 payload 里的 \`exp\` 换成早已过去的时间戳（如 1600000000），加一行判断输出"已过期"；把 \`scope\` 改成 \`"orders.write"\` 再解码；故意改动 payload 的一个 Base64 字符再运行，观察异常——体会"解码 ≠ 验证"。
2. 脱离示例独立实现 \`TokenGuard\`：\`Read(token)\` 容错解析 header/payload（非法 Base64Url 返回失败而非抛出），\`Validate(token, expectedIssuer, expectedAudience)\` 骨架包含算法白名单、\`iss\` 精确匹配、\`aud\` 包含本 API、\`exp\`/\`nbf\` 检查；单测断言 \`alg=none\` 直接拒绝、\`iss\` 不匹配拒绝。
3. 生产场景：给毕业项目接真实 OIDC：浏览器端走 Authorization Code + PKCE 或 BFF（令牌留服务器、浏览器只持 \`HttpOnly; Secure; SameSite\` 会话 cookie）；API 用 \`AddJwtBearer\` 固定 \`Authority\` 与 \`Audience\` 验签；写四条自动化测试——过期 401、错误 audience 403、跨租户 404、匿名 401；refresh token 每次轮换、旧令牌再现即吊销整个家族；Redirect URI 精确匹配白名单。





`,
    code: `// ============================================================
// JWT 与令牌生命周期的三个关键校验（纯 C# 模拟）：
//   1. 解码读 claims（注意：解码 ≠ 验签）
//   2. 过期校验 + 时钟偏移：exp 用 UTC Unix 秒，留 60s 容差
//   3. Refresh 轮换：旧 refresh 第二次出现 = 可能被偷，全家令牌作废
// 生产中这些由认证中间件（JwtBearer / OpenIdConnect）完成。
// ============================================================
using System.Text;
using System.Text.Json;

// ---------- 1. 解码读 claims ----------
// 仅演示读取 JWT payload；解码绝不代表签名验证。
string payloadJson = """{"sub":"user-42","scope":"orders.read","exp":1893456000}""";
string payload = Convert.ToBase64String(Encoding.UTF8.GetBytes(payloadJson))
    .TrimEnd('=').Replace('+', '-').Replace('/', '_');
string token = $"header.{payload}.signature";

string part = token.Split('.')[1].Replace('-', '+').Replace('_', '/');
part = part.PadRight(part.Length + (4 - part.Length % 4) % 4, '=');
using JsonDocument document = JsonDocument.Parse(Convert.FromBase64String(part));

Console.WriteLine($"sub={document.RootElement.GetProperty("sub").GetString()}");
Console.WriteLine("注意：生产必须由认证中间件验证签名和全部约束");

// ---------- 2. 过期校验与时钟偏移 ----------
// exp/iat/nbf 都是 UTC Unix 秒。两台机器时钟差几秒很常见，
// 校验时留 clockSkew 容差（默认 5 分钟，收紧到 60 秒）。
static bool IsExpired(long expUnixSeconds, DateTimeOffset now, int skewSeconds = 60)
{
    var exp = DateTimeOffset.FromUnixTimeSeconds(expUnixSeconds);
    return now > exp.AddSeconds(skewSeconds);   // 超过 exp+容差才算真过期
}

var expValue = document.RootElement.GetProperty("exp").GetInt64();
var now = DateTimeOffset.UtcNow;
Console.WriteLine($"\\nexp={DateTimeOffset.FromUnixTimeSeconds(expValue):u}");
Console.WriteLine($"token exp=2030-01-01（未来）→ 过期？{IsExpired(expValue, now)}");
Console.WriteLine($"同一 token 在 2030-01-02 → 过期？{IsExpired(expValue, new DateTimeOffset(2030, 1, 2, 0, 0, 1, TimeSpan.Zero))}");
Console.WriteLine("  ↑ 只超 1 秒时因 60s 容差仍可用——时钟偏移不该制造随机 401");

// ---------- 3. Refresh 轮换与重放检测 ----------
// 规则：每次用 refresh 换新 access 时，旧 refresh 立即作废并记录「轮换链」。
// 已作废的 refresh 再次出现 = 令牌可能被窃取 → 整条链作废，强制重新登录。
// 实现（RefreshTokenStore 类）在文件末尾。

var store = new RefreshTokenStore();
var rt1 = store.Issue("user-42");
Console.WriteLine("\\n第 1 次轮换（正常流程）：");
var (rt2, note1) = store.Rotate(rt1);
Console.WriteLine($"  {note1}，新令牌 {rt2}");
Console.WriteLine("攻击者重放第 1 个旧令牌（可能已从日志/代理被偷走）：");
var (_, note2) = store.Rotate(rt1);
Console.WriteLine($"  {note2}");

// ---------- Refresh 轮换实现 ----------
sealed class RefreshTokenStore
{
    private readonly Dictionary<string, string> _valid = new();       // 当前有效的 refresh
    private readonly HashSet<string> _retired = new();               // 已轮换作废的

    public string Issue(string user) { var t = $"rt-{user}-{Guid.NewGuid():N}"[..18]; _valid[user] = t; return t; }

    public (string? NewToken, string Note) Rotate(string presented)
    {
        if (_retired.Contains(presented))   // 旧令牌第二次出现：重放！
            return (null, "已作废的 refresh 再次出现 → 疑似被盗，整链作废，强制重登");
        if (!_valid.ContainsValue(presented))
            return (null, "未知令牌 → 拒绝");

        var user = _valid.First(kv => kv.Value == presented).Key;
        _retired.Add(presented);           // 旧的下岗
        var fresh = Issue(user);           // 新的上岗
        return (fresh, "轮换成功：旧 refresh 已作废");
    }
}
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch112",
    group: "第十八部分 平台拓展与毕业实战",
    icon: "🗄️",
    title: "EF Core 建模、迁移、查询与测试",
    content: `## 第一百一十三章　EF Core 建模、迁移、查询与测试

EF Core 把对象图映射到关系模型，它不理解你的钱、锁和执行计划。把“能 SaveChanges”当成数据层完成，是毕业项目最常见的假完成。

### 一、键、索引、转换、TPH/TPT/TPC

\`\`\`csharp
modelBuilder.Entity<Order>(entity =>
{
    entity.HasKey(x => x.Id);
    entity.Property(x => x.Total).HasPrecision(18, 2);
    entity.Property(x => x.Version).IsRowVersion();
    entity.HasIndex(x => new { x.TenantId, x.CreatedAt });
    entity.Property(x => x.Status).HasConversion<string>().HasMaxLength(32);
});
\`\`\`

显式：PK、FK 删除行为（Restrict 常比 Cascade 安全）、最大长度、精度、唯一约束、并发令牌。值对象/StronglyTypedId 用 conversion，**同时**在库里建同类型列和约束，防止有人用 SSMS 写入非法值。

| 继承映射 | 表结构 | 优点 | 代价 |
| --- | --- | --- | --- |
| TPH | 一张表 + 鉴别列 | 简单、少 Join | 稀疏列、宽表 |
| TPT | 基表 + 子表 | 较规范 | Join 多，迁移烦 |
| TPC | 每具体类型一张完整表 | 查询单表快 | 身份生成、跨类型查询难 |

默认 TPH 够用。TPC（EF Core 7+）适合子类差异巨大且很少一起查。不要为了 OOP 纯度把简单状态机拆成继承树。

### 二、迁移工作流与编译模型

\`dotnet ef migrations add\` 产出的 C# 和 SQL 必须 **人工审查**：锁、默认值回填、丢失数据、索引是否在线。检入仓库。生产用 \`dotnet ef migrations bundle\` 或独立 Job，**禁止**每个 API 副本 \`Database.Migrate()\` 抢跑。expand/contract：先加列，再双写，再切读，再删列，分多个发布。

编译模型（\`dotnet ef dbcontext optimize\`）把模型元数据变成生成代码，缩短冷启动，AOT/trim 更友好。模型一变就要重新生成，CI 应检查“optimize 已更新”。

### 三、查询、并发、用真实 Provider 测

只读：\`AsNoTracking\` + 投影。N+1 用日志或 \`ToQueryString()\` 抓。\`Include\` 笛卡尔爆炸时 \`AsSplitQuery\`，理解两次查询之间的一致性。分页用 keyset。全局查询过滤器做租户，但要记得 \`IgnoreQueryFilters\` 的审计路径必须再鉴权。

\`DbUpdateConcurrencyException\` → 409 或合并，禁止盲重试覆盖。执行策略重试时整个事务委托可重放。

**EF InMemory 不是数据库。** 它不执行真实 SQL、约束、事务隔离、大小写折叠。仓储单测可用假仓库；涉及 LINQ 翻译、迁移、唯一约束的测试必须用生产 Provider（Testcontainers，下一章）。清单：

- [ ] 键/索引/精度/并发令牌显式配置
- [ ] 继承策略有意选择，不是默认将就
- [ ] 迁移 SQL 已审；Job 单独跑
- [ ] 编译模型在 CI 保持新鲜（若启用）
- [ ] 集成测试打真实 Provider

### 四、查询卫生、拦截器与多 DbContext

热路径禁止 \`Select *\` 式的实体物化再映射。需要列表就投影匿名/DTO。\`AsNoTrackingWithIdentityResolution\` 仅在需要图去重时用。原始 SQL 必须参数化，表名白名单。拦截器可以补 \`tenant_id\` 和审计字段，但不要在拦截器里偷偷发 HTTP。多个 DbContext（读写分离、不同库）明确生命周期，避免跨上下文事务却以为自己在一个 \`SaveChanges\`。

迁移基线：老库用 \`script\` 生成并审，空库用全部迁移。生产前在还原的生产副本（脱敏）演练。失败的迁移要有向前修脚本，不是幻想 rollback 能撤销 \`DROP COLUMN\`。编译模型与设计时工厂（\`IDesignTimeDbContextFactory\`）要能在 CI 无环境变量时生成迁移，密钥用占位连接串。

把 EF 日志的敏感数据关闭，参数日志只在开发开。慢查询阈值打点。这一章读完应能在毕业项目里画出：实体、索引、并发列、迁移 PR 模板、测试用的真实容器。做不到就还停留在“会 SaveChanges”。

把毕业项目的模型图、索引、并发列、迁移 PR 模板、Testcontainers 集合名字写进 docs/ef.md。CI 检查：有新迁移必有 SQL 审查记录；禁止 Startup 里 Migrate()。编译模型若启用则有过期检查。InMemory 不得出现在 IntegrationTests 项目。慢查询日志在开发打开，参数日志在生产关闭。EF 是映射器，评审仍按第九十七章的数据库标准验收。

EF 验收：显式键索引精度并发令牌；迁移 SQL 已审且 Job 单独跑；集成测试用生产 Provider；InMemory 不进集成项目；并发冲突变 409。编译模型若用则 CI 保新鲜。能画出实体关系并解释为什么不是 TPT。会 SaveChanges 只是起点。

实体框架是映射器，验收按数据库标准。键、索引、精度、并发列、删除行为显式配置。继承映射有意选择而不是默认将就。迁移脚本审查锁与回填，由独立作业执行，禁止每个副本启动抢跑。只读查询不跟踪并投影。并发冲突变冲突状态码，禁止盲重试覆盖。内存提供器不进集成测试项目。能画出实体关系、解释为何不用某种继承、指出哪条查询需要覆盖索引。编译模型若启用就要在集成里保新鲜。把模型图和迁移模板检入文档。这一章和第九十七章是同一门课的两端。

### 十日落地：EF 建模与测试

按日执行，写不下就延期，不许跳日。每一天结束要有仓库里的证据（测试、文档或演练记录），口头“做过了”不算。

1. 键、索引、精度、并发列、删除行为在模型里显式出现。
2. 继承映射有意选择并写明代价，不为对象纯度乱拆表。
3. 迁移脚本审查锁与回填，独立作业执行。
4. 只读查询不跟踪并投影，列表用键集分页。
5. 并发冲突返回冲突，禁止盲重试覆盖他人。
6. 执行策略重试时整段事务可重放。
7. 集成测试用生产提供器容器，内存提供器不准进该项目。
8. 编译模型若启用则持续集成检查过期。
9. 敏感参数日志仅开发打开，慢查询阈值打点。
10. 能画出实体关系并指出哪条查询对应哪条覆盖索引。

### 答辩常见问：EF

映射章补一句：集成项目里若还出现内存提供器引用，当作构建失败。真实提供器加上迁移审查，才配和第九十七章对表。模型图与索引清单一并提交，评审先看库再看映射代码。这才是实体框架课的句号。否则只是会保存更改。

下面每问都要能用仓库里的文件回答，答不出来就还没做完。
1. 问：内存提供器行吗？ 答：不行，不执行真实结构化查询与约束。
2. 问：谁跑迁移？ 答：独立作业，禁止每个副本启动抢跑。
3. 问：并发冲突？ 答：捕获后四百零九或合并，不盲覆盖。
4. 问：包含导航默认？ 答：不，小心笛卡尔，必要时拆分查询。
5. 问：值对象转换够吗？ 答：不够，库里还要约束。
6. 问：继承怎么选？ 答：默认单表加鉴别，代价写清。
7. 问：只读列表？ 答：不跟踪加投影加键集分页。
8. 问：和第九十七章关系？ 答：同一门课两端，映射器不替代范式与计划。
把这些问题打印出来，找同事当评委抽三问。抽不到证据的那一问，就是下一周唯一任务。


十日结束后开一次十五分钟回顾：哪一天没有证据、哪一条会在毕业答辩被问到。把缺口列进下一周，而不是开始下一章收藏。

### 练习

1. 修改主 demo：把 \`ExpectedVersion\` 改成 3（当前值）观察成功路径与版本自增；紧接着用同样的请求再提交一次，验证第二次必然 409；再用 \`with\` 表达式构造「只改 Status 不带新 Version」的请求，观察它如何被版本检查拦截。
2. 脱离示例实现复合键去重：\`OrderLine\` 用 \`HashSet<(string OrderId, string Sku)>\` 拒绝重复行，\`AddLine\` 返回结果对象而不是抛异常；再实现 keyset 分页查询 \`(OrderId, LineId) > after\` 的内存模拟，验证游标翻页不重不漏。
3. 生产场景：给毕业项目生成第一个迁移并在空库重放（\`dotnet ef migrations add init\` + \`database update\`）；再故意改实体（加字段）不建迁移，跑集成测试观察 schema 漂移如何失败；最后给并发冲突包上重试（重读最新 Version 再提交，最多 3 次，仍冲突返回 409）。




`,
    code: `// ============================================================
// EF Core 生产查询的三个关键习惯（纯 C# 模拟）：
//   1. 乐观并发：更新必须携带读到的版本号
//   2. Keyset 分页：offset 深翻页是 O(n)，游标是 O(log n)
//   3. 复合唯一约束：在「保存」这一层拒绝重复，而不是查重后再插
//      （查重-再插两步之间永远可能插入竞态）
// ============================================================

// ---------- 1. 乐观并发 ----------
var stored = new OrderState("A-100", "Pending", Version: 3);
var request = new UpdateRequest("Paid", ExpectedVersion: 2);

if (request.ExpectedVersion != stored.Version)
{
    // 客户端拿着过期版本来写：返回 409，让它重新 GET 再带新版本提交。
    // 不要「读最新再覆盖」——那会把别人刚写的 Paid 悄悄打回 Pending。
    Console.WriteLine($"409 conflict: expected={request.ExpectedVersion}, actual={stored.Version}");
    Console.WriteLine("  ↑ DbUpdateConcurrencyException 的等价物：读后有人先改了");
}
else
{
    stored = stored with { Status = request.Status, Version = stored.Version + 1 };
    // with：复制一份新 record。数据库里对应 UPDATE ... SET version = version+1 WHERE version = @expected
    // with：复制一份新 record。数据库里对应 UPDATE ... SET version = version+1 WHERE version = @expected
    Console.WriteLine(stored);
}

// ---------- 2. Keyset 分页（游标）----------
// WHERE (CreatedAt, Id) > (上一页末尾) ORDER BY CreatedAt, Id LIMIT N
// Id 是第二排序键：CreatedAt 相同的行也有稳定顺序，翻页不重不漏。
var orders = new List<(DateTimeOffset CreatedAt, string Id)>
{
    new(new(2026, 1, 1, 0, 0, 0, TimeSpan.Zero), "a"),
    new(new(2026, 1, 1, 0, 0, 0, TimeSpan.Zero), "b"),   // 与上一行同一秒：靠 Id 区分
    new(new(2026, 1, 2, 0, 0, 0, TimeSpan.Zero), "c"),
    new(new(2026, 1, 3, 0, 0, 0, TimeSpan.Zero), "d"),
    new(new(2026, 1, 4, 0, 0, 0, TimeSpan.Zero), "e"),
};

static List<(DateTimeOffset CreatedAt, string Id)> KeysetPage(
    List<(DateTimeOffset CreatedAt, string Id)> source,
    (DateTimeOffset, string)? cursor, int take) =>
    source
        .Where(o => cursor is null || (o.CreatedAt, o.Id).CompareTo(cursor.Value) > 0)
        .OrderBy(o => o.CreatedAt).ThenBy(o => o.Id)
        .Take(take)
        .ToList();

Console.WriteLine("\\n第 1 页（take 2）：");
var page1 = KeysetPage(orders, null, 2);
page1.ForEach(o => Console.WriteLine($"  {o.CreatedAt:yyyy-MM-dd} {o.Id}"));

var last1 = page1[^1];
Console.WriteLine("第 2 页（游标 = 第 1 页末尾）：");
var page2 = KeysetPage(orders, last1, 2);
page2.ForEach(o => Console.WriteLine($"  {o.CreatedAt:yyyy-MM-dd} {o.Id}"));

// ---------- 3. 复合唯一约束 ----------
// 「同一订单同一 SKU 只能有一行」：靠 HashSet<(OrderId, Sku)> 在保存时拒绝，
// 等价于数据库 UNIQUE (order_id, sku) + 唯一键冲突异常处理。
var lines = new OrderLineStore();
Console.WriteLine("\\n两步插入竞态演示（查重-再插之间另一个请求插入了同键）：");
lines.TryAdd("A-100", "sku-9", 2);
lines.TryAdd("A-100", "sku-9", 99);   // 第二次同键：被约束拒绝，无论查重逻辑怎么写
lines.TryAdd("A-100", "sku-7", 1);

// 类型声明统一放末尾：顶级语句必须位于所有类型声明之前（CS8803）
sealed class OrderLineStore
{
    private readonly HashSet<(string OrderId, string Sku)> _unique = new();

    public bool TryAdd(string orderId, string sku, decimal qty)
    {
        if (!_unique.Add((orderId, sku)))
        {
            Console.WriteLine($"  拒绝：order={orderId} 已有 sku={sku}（UNIQUE 冲突，等价 DbUpdateException）");
            return false;
        }
        Console.WriteLine($"  接受：order={orderId} + sku={sku} × {qty}");
        return true;
    }
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

单元测试证明函数，集成测试证明 **管道 + 真实依赖** 仍组成你以为的系统。没有 WAF 的“Controller 单测”看不到中间件顺序、模型绑定和认证。没有容器的“仓储测试”看不到唯一约束和 SQL 翻译。

### 一、工厂定制与认证测试

\`\`\`csharp
public sealed class OrdersApiTests : IClassFixture<ShopApiFactory>
{
    private readonly HttpClient _client;
    public OrdersApiTests(ShopApiFactory factory) =>
        _client = factory.CreateClient();
}
\`\`\`

派生 \`WebApplicationFactory<Program>\`，在 \`ConfigureWebHost\` 里：

- \`UseEnvironment("Testing")\`
- 换成测试连接字符串（容器）
- 替换邮件/支付为假实现，**不要**把整个 DI 换成空壳
- 用 \`AddAuthentication("Test")\` 加测试处理程序，签发带租户声明的票据

认证测试至少覆盖：匿名 401、错误 audience 403、跨租户 404（避免 403 泄露存在性，按你的威胁模型）、合法用户 201。只测 Happy Path 的工厂是安慰剂。

### 二、Testcontainers 生命周期与 Respawn

Testcontainers 拉起 PostgreSQL/SQL Server/Redis 的官方镜像。策略：

| 策略 | 做法 | 适合 |
| --- | --- | --- |
| 每集合一容器 | \`ICollectionFixture\` / xUnit collection | 平衡速度与隔离 |
| 每测试一库 | \`CREATE DATABASE\` 或随机 schema | 最隔离，较慢 |
| 事务回滚 | 测完回滚 | 快，但不适合成品提交/多连接 |

容器可在程序集级启动一次（\`IAsyncLifetime\`），测试间用 **Respawn** 或 \`TRUNCATE ... CASCADE\` 复位。Respawn 比删容器快，但要排除 \`__EFMigrationsHistory\`。并行集合：不同 collection 可并行，同一数据库必须串行或分库。标记 \`[Collection("pg")]\` 避免抢同一个库。

镜像标签钉死（\`postgres:16.4\`），不要 \`latest\`。CI 需要 Docker；无 Docker 的代理用跳过特性，不要默默改走 InMemory。

### 三、失败日志、等待、并行

失败时打印：应用日志（\`ILogger\` 接到测试输出）、容器 \`GetLogs()\`、关键 SQL。脱敏连接串密码。等待就绪用容器 Wait 策略或重试 \`SELECT 1\`，**禁止** \`Thread.Sleep(5000)\` 赌运气。

时钟用 \`FakeTimeProvider\`；外部 HTTP 用 WireMock 或 handler。清单：

- [ ] WAF 定制保持生产注册形状
- [ ] 认证/授权/租户有独立用例
- [ ] 真实 Provider + 迁移；Respawn 不删历史表
- [ ] 并行集合不共享可变库
- [ ] 失败保留日志；无固定 sleep

### 四、测试数据、契约与 CI 成本

种子数据要可重复：固定 GUID、固定时钟、每个测试自己的租户 ID。共享“全局管理员用户”会导致并行测试互相改密码。Respawn 后重新插入最小种子，或用事务级种子。对数据库断言除了 HTTP：例如创建订单后 Outbox 表有一行，而不只是 201。

WAF 替换配置时小心把生产中间件摘光。测试认证处理程序应仍走 \`UseAuthorization\`。CORS、限流、反伪在测试里按场景开关，不要默认全关。容器日志在 CI artifact 保留失败那次，成功可丢，以免 PII 长期存。

成本：每个 PR 拉镜像要缓存层。钉镜像摘要。并行 worker 数量按 CPU 和 Docker 套接字能力。本地开发用 \`dotnet test --filter\` 跑相关集合。把“CI 绿”定义为：单测 + 真实 PG + 至少一条认证失败用例 + 至少一条迁移后查询。少一条都是假绿。主 demo 的微型断言运行器提醒你：真实世界请用 xUnit/NUnit + WAF，不要把控制台循环当测试框架。

工厂清单：Testing 环境、容器连接串、生产形状的 DI、测试认证、失败日志、无 Sleep、并行集合隔离、Respawn 保留迁移历史、至少一条 401/403/409。CI 缓存镜像层，钉摘要。本地用 filter 跑相关集合。绿的定义写进 README。没有真实数据库的“集成测试”请改名，以免误导发布审批。

测试验收：WAF 保持生产 DI 形状；认证正反用例；Testcontainers 钉镜像；Respawn 保留迁移表；失败留日志；无固定 Sleep；并行不抢库。CI 绿的定义写进 README。假绿比红更危险，因为它让发布审批签字。

测试工厂要像缩小的生产。派生工厂设置测试环境、容器连接、替换邮件支付但保持注册形状、加入测试认证签发带租户的票。至少覆盖匿名、错误受众、跨租户、合法创建。容器钉标签，程序集级启动，测试间重置数据且保留迁移历史。并行集合不抢同一库。失败打印应用与容器日志并脱敏。等待用就绪策略不是固定睡眠。持续集成缓存镜像。绿的定义写进说明：单测、真实库、一条失败认证、一条迁移后查询。假绿比红更危险。把控制台循环留给教学演示，真正仓库用主流测试框架。

### 十日落地：工厂与容器测试

按日执行，写不下就延期，不许跳日。每一天结束要有仓库里的证据（测试、文档或演练记录），口头“做过了”不算。

1. 派生工厂设置测试环境并保持生产注册形状。
2. 测试认证签发带租户声明的票，覆盖匿名与错误受众。
3. 跨租户访问有独立用例，期望找不到或禁止。
4. 容器镜像标签钉死，程序集级启动一次。
5. 测试间重置数据，保留迁移历史表。
6. 并行集合不共享可变库，用集合特性隔离。
7. 失败保留应用与容器日志并脱敏。
8. 就绪等待用探测或重试，禁止固定睡眠。
9. 持续集成缓存镜像层，无容器的代理显式跳过而不是改走内存。
10. 绿的定义写进说明：单测、真实库、失败认证、迁移后查询。

### 答辩常见问：集成测试

测试章补强：把绿的定义贴进说明文件第一段，流水线名字与过滤条件写清。没有真实库的作业不得叫集成。失败工件保留日志一天并脱敏。并行工人数按主机套接字能力限制，避免自己打翻自己的容器。这些约定能消灭假绿，让第一百一十六章的答辩不靠运气。工厂定制、容器寿命、失败日志三条写进贡献指南，新人第一周就能按同一标准加测试。把集合名称、重置策略和镜像摘要写在同一段，避免每个人复制一套不一样的工厂。没有统一工厂，并行测试会变成彩票。统一工厂是集成测试的公共设施，不是个人偏好。偏好只能存在于本地过滤，不能存在于持续集成定义。定义只能有一份。

下面每问都要能用仓库里的文件回答，答不出来就还没做完。
1. 问：工厂为何派生？ 答：换连接与认证仍保持生产注册形状。
2. 问：只测二百？ 答：必须有四百零一、四百零三、四百零九。
3. 问：容器每次新建？ 答：集合级复用加重置，钉镜像标签。
4. 问：为何保留迁移表？ 答：重置不得把结构历史删掉。
5. 问：并行如何？ 答：不同集合可并行，同一库串行或分库。
6. 问：失败看什么？ 答：应用日志、容器日志、关键语句，脱敏。
7. 问：睡眠等待？ 答：禁止，用就绪探测或重试。
8. 问：假绿危害？ 答：让发布审批签字，比红更危险。
把这些问题打印出来，找同事当评委抽三问。抽不到证据的那一问，就是下一周唯一任务。


十日结束后开一次十五分钟回顾：哪一天没有证据、哪一条会在毕业答辩被问到。把缺口列进下一周，而不是开始下一章收藏。

### 练习

1. 修改主 demo：加一条故意失败的用例 \`new TestCase("boom", () => AssertEqual(200, 404))\`，观察未捕获异常如何中断整个循环；把 \`AssertEqual\` 改成返回 bool 并统计通过/失败数；体会 xUnit 替你解决了用例隔离、发现与并行哪些问题。
2. 脱离示例独立实现 \`MiniTestRunner.RunAsync(params TestCase[])\`：失败不中断后续用例、结束时汇总 pass/fail 并以非零退出码收场，失败时打印用例名与异常详情；再用 \`CancellationTokenSource\` 给每条用例加超时包装，体会 flaky 用例的危害。
3. 生产场景：给毕业项目搭 \`ShopApiFactory : WebApplicationFactory<Program>\`：\`UseEnvironment("Testing")\`、容器连接串、测试认证 handler 签发带租户声明的票，替换邮件/支付为假实现但保持 DI 注册形状；Testcontainers 钉死 \`postgres:16.4\`、程序集级启动一次、Respawn 复位时排除 \`__EFMigrationsHistory\`；覆盖匿名 401、错误 audience 403、跨租户 404、合法 201 四条；失败时输出应用与容器日志（脱敏连接串）；就绪等待用探测、禁止 \`Thread.Sleep\`。





`,
    code: `// ============================================================
// 测试要返回 Task，禁止 .Result / .Wait() 造成死锁假象。
// EqualityComparer<T>.Default 正确处理可空与 IEquatable。
// 本 demo 只演示“失败即抛”；生产用 xUnit + WebApplicationFactory
// + Testcontainers，断言 201/401/409，而不是只测快乐路径。
// ============================================================
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

Native AOT 把应用编译成机器码：启动快、工作集小、镜像小，适合 CLI、Serverless、高密度 sidecar。它不是所有 ASP.NET 服务的默认按钮。代价是：反射、运行时代码生成、部分库直接不可用，构建变慢且按 RID 出包。

### 一、发布设置与何时不用

\`\`\`bash
dotnet publish -c Release -r linux-x64 --self-contained
dotnet publish -c Release -r linux-x64 -p:PublishTrimmed=true
dotnet publish -c Release -r linux-x64 -p:PublishAot=true
\`\`\`

\`PublishAot=true\` 隐含 trim。csproj 常见：\`<PublishAot>true</PublishAot>\`、\`<OptimizationPreference>Size|Speed</OptimizationPreference>\`、\`<IlcInstructionSet>\` 仅在清楚 CPU 基线时设置。每个 RID（\`linux-x64\`、\`linux-arm64\`、\`win-x64\`）单独产物，不能“一份 DLL 到处跑”。

**先测再开。** 若服务已是长寿命、启动占 SLO 可忽略、却重度依赖 EF 动态查询或插件，AOT 会让你重写一半基础设施。适合：最小 API、明确 JSON 契约、无插件、冷启动敏感。不适合：可加载扩展、任意类型反射、未支持的 COM、需要 \`System.Reflection.Emit\` 的库。

### 二、Trim 警告与禁止的反射

打开 trim 分析器，把警告当错误。\`IL2026\` / \`IL2104\` 表示有成员可能被剪掉。全局 \`<TrimmerRootAssembly>\` 或乱 \`DynamicDependency\` 会抵消体积收益。库作者用 \`DynamicallyAccessedMembers\` 标注“这个 Type 要保留公共构造”，应用作者优先 **删掉反射**。

运行时 \`GetTypes()\` 扫程序集、\`JsonSerializer.Deserialize(typeFromString)\`、\`MakeGenericType\` 用户输入——这些在 AOT 里要么要提示要么直接炸。配置绑定到 \`Dictionary<string, object>\` 也会痛苦。主 demo 的 \`JsonSerializerContext\` 是正确方向。

### 三、JSON 源生成、体积 vs 启动

\`\`\`csharp
[JsonSerializable(typeof(OrderDto))]
[JsonSourceGenerationOptions(PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
internal partial class AppJsonContext : JsonSerializerContext;
\`\`\`

多态、\`JsonDerivedType\`、自定义转换器都要登记进上下文，漏一个就运行时回退或抛。Options 的命名策略必须与上下文一致，否则字段对不上。

体积 vs 启动：AOT 镜像往往小于自包含 JIT + 完整运行时，但 **构建时间** 显著增加。吞吐稳态未必优于已预热的 Server GC JIT。用 k6 对比：冷启动、稳态 p99、RSS、构建分钟数，再决定。

### 四、门禁与清单

CI：每个 RID \`publish\`，启动产物跑烟雾（不只是 JIT \`dotnet test\`）。清单：

- [ ] 有测量证明 AOT 值得
- [ ] trim 警告清零，无全局压制
- [ ] JSON 全部走源生成上下文
- [ ] 无未注解反射 / Emit / 插件扫描
- [ ] EF / 第三方已核对其 AOT 文档（.NET 10 时点）
- [ ] 发布产物在 Linux 容器里跑过

### 五、诊断、兼容性与回退路径

AOT 诊断：发布时打开 trimmer 输出，把警告当作业项。运行时 \`MissingMetadataException\` 或奇怪的空序列化，先怀疑漏登记的类型。开发仍用 JIT 以获得热重载，CI 矩阵包含 \`PublishAot\` 作业，避免“我机器上能跑”。部分库提供 \`IsAotCompatible\` 标注，引用前查 NuGet 说明。

大小优化：裁剪国际化数据、关闭未用的 Host 特性、\`InvariantGlobalization\` 仅当业务允许。启动优化还靠预连接数据库、编译模型、减少启动时 IO，不一定非 AOT。若 AOT 构建在 CI 要 20 分钟，评估是否只对 CLI/函数用 AOT，对长寿命 API 保持 JIT——这是正当架构，不是认输。

回退：保留非 AOT 镜像标签，发布系统能一键切回。第一次上 AOT 不要和数据库破坏性迁移同一天。把“禁止的 API 名单”写进分析器规则，防止后续 PR 又引入 \`Assembly.LoadFrom\` 扫描插件。毕业项目可以不做 AOT，但必须在文档里写清为什么不做，以及若未来要做缺哪些注解——这比盲目 \`PublishAot=true\` 然后关掉所有警告更成熟。

决策表：冷启动是否在 SLO 内？有无插件/Emit/未标注反射？EF 动态查询是否可改为编译模型+源生成 JSON？CI 能否承受 AOT 构建时间？若三问否，保持 JIT 并写 ADR。若上 AOT：trim 警告当错误、RID 矩阵烟雾、保留非 AOT 回退标签、不与破坏性迁移同天。体积数字要和稳态吞吐一起看。AOT 是工具，不是先进性徽章。

AOT 验收：有测量或有“不做”的 ADR；若做则 trim 警告清零、JSON 源生成全覆盖、RID 烟雾、保留 JIT 回退。禁止与破坏性迁移同天首次上 AOT。把反射扫描插件列为不兼容项。先进性看用户有没有更快看到首字节，不看你是否勾了 PublishAot。

原生提前编译是选项不是勋章。先问冷启动是否在目标内、有无插件和未标注反射、动态查询能否改成源生成、构建时间是否可接受。三问为否则写架构决策保持即时编译。若上：裁剪警告当错误、JSON 上下文覆盖所有类型、每个运行时标识烟雾、保留非提前编译回退标签、不与破坏性库迁移同天首次切换。体积要和稳态尾延迟一起看。开发仍用即时编译方便热重载。把禁止的动态表面写进分析器，防止后续请求又扫程序集。毕业项目可以不做，但必须写清为什么，以及若要做缺哪些注解。

### 十日落地：Native AOT 取舍

按日执行，写不下就延期，不许跳日。每一天结束要有仓库里的证据（测试、文档或演练记录），口头“做过了”不算。

1. 先测量冷启动、稳态尾延迟、工作集与构建时间再决定。
2. 有插件、发射或未标注反射则写决策保持即时编译。
3. 若启用则裁剪警告当错误，禁止全局压制。
4. JSON 源生成上下文覆盖所有多态与命名策略。
5. 每个运行时标识单独发布并做烟雾。
6. 持续集成跑发布产物，不只跑即时编译测试。
7. 保留非提前编译回退标签，首次切换不与破坏迁移同天。
8. 禁止的动态表面写进分析器规则。
9. 体积数字必须和吞吐一起看，防止为小而慢。
10. 毕业项目可不做，但文档写清为什么以及缺口注解。

### 答辩常见问：AOT
下面每问都要能用仓库里的文件回答，答不出来就还没做完。
1. 问：为何不是默认？ 答：反射与插件和动态查询会断，构建变慢。
2. 问：先做什么？ 答：测冷启动稳态尾延迟工作集构建时间。
3. 问：裁剪警告？ 答：当错误处理，全局压制等于没裁。
4. 问：JSON 为何源生成？ 答：减少反射，提前编译才能稳定序列化。
5. 问：持续集成测什么？ 答：每个标识的发布产物烟雾，不只即时编译测试。
6. 问：如何回退？ 答：保留非提前编译标签，不同天混破坏迁移。
7. 问：不做可以毕业吗？ 答：可以，但要决策记录与缺口清单。
8. 问：先进看什么？ 答：用户是否更快看到首字节，不看勾选。
把这些问题打印出来，找同事当评委抽三问。抽不到证据的那一问，就是下一周唯一任务。


十日结束后开一次十五分钟回顾：哪一天没有证据、哪一条会在毕业答辩被问到。把缺口列进下一周，而不是开始下一章收藏。

### 练习

1. 修改主 demo：删掉 \`[JsonSerializable]\` 那行、直接 \`JsonSerializer.Serialize(order)\`（不带 context），先跑通再想：普通反射路径在 Native AOT 下会遇到什么；给 \`OrderDto\` 加一个 \`DateTimeOffset Created\` 属性重新编译，观察源生成路径的输出自动包含新字段。
2. 脱离示例实现第二个源生成上下文：\`internal partial class CatalogContext : JsonSerializerContext\` 服务 \`ProductDto(string Sku, string Name, int Stock)\`，用 \`[JsonSourceGenerationOptions(PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]\` 让输出转 camelCase；写断言验证序列化结果确实是小驼峰（如 \`sku\`、\`stock\`）。
3. 生产场景：给毕业项目做一次 AOT 试验：\`dotnet publish -r osx-arm64 -c Release /p:PublishAot=true\`，记录三组数据（普通发布、Trimmed、AOT）的体积与冷启动时间并处理所有 trim 警告；把反射依赖（如 Dapper 动态列）单列「不可 AOT」清单与回退标签（保留非 AOT 发布路径）。




`,
    code: `// ============================================================
// Native AOT / Trim 三件事（纯 C# 演示可运行部分）：
//   1. JSON 源生成：编译期确定序列化形状，反射零依赖（AOT 安全）
//   2. trim 危险清单：哪些写法在 Trimmer 面前站不住
//   3. 取舍矩阵：AOT 买的是启动/内存，卖的是动态性
// ============================================================
using System.Text.Json;
using System.Text.Json.Serialization;

// ---------- 1. JSON 源生成 ----------
// JsonSerializerContext 由源生成器在编译期产出：没有反射、没有运行时
// 代码生成，且序列化形状在构建时就锁死（字段改了 → 生成代码跟着变）。
var order = new OrderDto("A-100", 129.90m);
string json = JsonSerializer.Serialize(order, AppJsonContext.Default.OrderDto);
OrderDto? copy = JsonSerializer.Deserialize(json, AppJsonContext.Default.OrderDto);

Console.WriteLine(json);
Console.WriteLine(copy);

// 快速失败：DTO 改了字段忘了检查生成代码？序列化往返测试一跑就露馅。
Console.WriteLine($"往返一致：{copy == order}");

// ---------- 2. trim 危险清单 ----------
// Trimmer 从入口做可达性分析：没被「静态引用到」的代码/元数据被裁掉。
// 危险写法在 Release + PublishTrimmed 下给出 IL2026/IL2075 警告——
// 把它们当错误处理（<WarningsAsErrors>IL2026;IL2075</WarningsAsErrors>），
// 而不是学着忽略。
var hazards = new (string Pattern, string Why, string Fix)[]
{
    (@"typeof(T).GetMethod(""foo"")",  "按字符串找方法：裁剪器看不见名字引用", "改接口调用或源生成器生成调用"),
    ("Activator.CreateInstance(type)",   "运行时才知道类型：构造器可能被裁", "注册表模式：显式字典映射 type → factory"),
    ("Dapper / 动态列映射",               "反射读属性建列：AOT 下直接失败", "换 EF Core / 手写映射器"),
    ("JSON 反射模式序列化",              "首次序列化时反射建元数据", "就用上面的 JsonSerializerContext"),
};

Console.WriteLine("\\ntrim 危险写法（必须零警告过闸）：");
foreach (var (pattern, why, fix) in hazards)
    Console.WriteLine($"  ✗ {pattern,-34} {why}；改法：{fix}");

// ---------- 3. 取舍矩阵 ----------
// AOT 不是银弹：先看场景再上，保留回退标签。
static string Decide(string scenario) => scenario switch
{
    var s when s.Contains("CLI 工具") || s.Contains("Serverless") => "上 AOT：冷启动敏感，收益最大",
    var s when s.Contains("反射依赖") || s.Contains("动态插件")  => "别上：先做依赖改造或干脆放弃，留普通发布",
    var s when s.Contains("长驻服务")                          => "可试：启动只快一次，先量稳态内存差异再定",
    _ => "先测：没有「用户更快看到首字节」的证据就不上",
};

foreach (var s in new[] { "CLI 工具（dotnet-countfs 风格）", "Serverless 函数", "反射依赖（Dapper 动态查询）", "长驻服务（订单 API）" })
    Console.WriteLine($"{s,-30} → {Decide(s)}");

Console.WriteLine("\\n门禁：三种发布产物（普通/Trimmed/AOT）都要进 CI 烟雾测试；回退标签常备。");

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
    title: "毕业项目启动：订单系统从零到上线",
    content: `## 第一百一十六章　毕业项目启动：订单系统从零到上线

这不是复制教程 demo。建立一个 **真实 Git 仓库**，按第九十三章的小 PR 往前推。主 demo 只是门禁清单的隐喻；数据库、IdP、Redis、容器、流水线必须是真的。**本章是项目启动和核心交付里程碑，不是课程结束**：第十九、二十部分可按岗位选修，但第二十一部分的验证、缓存失效、健康检查、多租户、取消与审计是最终答辩前置项。

最终流程：先完成本章核心门禁并保留证据；继续学习到第一百三十六章；把适用的深水区要求回填项目；最后由同伴按安全、数据、可靠性和可运维性重新评审。没有完成这次回填，不应宣称已经学完生产路径。

### 一、架构草图

\`\`\`
[浏览器/BFF] --OIDC--> [Shop.Api]
                          |  Outbox 同事务
                          v
                     [PostgreSQL]
                          |
                    [Shop.Worker] --> [消息总线] --> 库存/通知
                          ^
                     [Redis 缓存]
对象存储(发票 PDF)     搜索(可选，可重建)
\`\`\`

解决方案建议：

\`\`\`
src/
  Shop.Api/             HTTP、认证、Problem Details、OpenAPI
  Shop.Application/     用例、端口、事务边界
  Shop.Domain/          订单、Money、状态机
  Shop.Infrastructure/  EF、Outbox、HTTP 客户端
  Shop.Worker/          发布与消费
tests/
  Shop.UnitTests/
  Shop.IntegrationTests/   WAF + Testcontainers
infra/                  Terraform 或 Bicep，含环境变量而非密钥
\`\`\`

### 二、四周节奏（可压缩，不可跳项）

| 周 | 目标 | 完成定义 |
| --- | --- | --- |
| 1 | 仓库、CI、领域、迁移、创建订单 API | 容器里迁移；单测+集成测绿 |
| 2 | 认证授权、幂等、乐观并发、Problem Details | 跨租户测试红/绿明确 |
| 3 | Outbox/Inbox、缓存、韧性、OpenTelemetry | 重复消息与 Redis 宕机有测试 |
| 4 | 容器加固、CI/CD、灰度、备份演练、文档 | 故障注入清单逐条有证据 |

一人全职大约如此；兼职按周加倍。不要第一周就上 K8s 却没有迁移。

### 三、必须实现（真，不是模拟）

- 真实 PostgreSQL 或 SQL Server + EF 迁移，Testcontainers 跑集成测试。
- 真实 OIDC/JWT（可用开发 IdP 如 Keycloak/Duende Demo），租户与资源级授权测试。
- \`POST /orders\` 支持 \`Idempotency-Key\`；库存版本列冲突返回 409。
- 业务写与 Outbox **同一事务**；消费者 Inbox 去重。
- \`HttpClient\` 标准 resilience：deadline、有限重试、断路；重试仅幂等方法。
- Redis cache-aside：键含租户、TTL jitter、Redis 停机降级。
- RFC 9457、OpenAPI、keyset 分页。
- OpenTelemetry 三支柱；startup/readiness/liveness 分开。
- 非 root 只读文件系统镜像、lock 文件、SBOM、漏洞扫描。
- CI 构建测试发布；生产路径 canary + 可回滚；schema expand/contract。

可用内存总线 **开发**，但毕业验收必须有可重放的真实代理（至少容器里的 Kafka/Rabbit/Service Bus 模拟器之一）或文档说明为何 Worker 消费真实队列。

### 四、故障注入清单与 Definition of Done

每条要有自动测试或签名演练记录：

1. 同一 Idempotency-Key 重放 → 同一订单，不双扣。
2. 并发改库存 → 一人 409，库存不超卖。
3. 消息重复、乱序、毒消息 → Inbox/DLQ。
4. Redis 杀死 → API 仍可用，库不被打满。
5. 下游 429/超时 → 不级联耗尽线程。
6. Pod SIGTERM → 在途完成，探针摘流。
7. 错误配置 → 进程拒绝启动（ValidateOnStart）。
8. 新旧二进制 + 中间 schema 共存。
9. 从备份 PITR 恢复后对账通过。

文档：ADR、威胁模型、数据分类、SLO、dashboard、告警、runbook、容量结果、RPO/RTO、发布回滚步骤。

**完成**：他人能克隆并经 CI 得到同样产物；能观测；能降级；能恢复；能回滚。\`dotnet run\` 通了只是周一目的，不是毕业。

### 五、必须真实、禁止用模拟充数

| 能力 | 允许的开发替身 | 毕业时必须变成 |
| --- | --- | --- |
| 数据库 | EF InMemory 仅作领域草稿 | 生产 Provider + 迁移 + 容器测试 |
| 认证 | 测试 handler | 真实 JWT/OIDC 验证（可用开发 IdP） |
| 缓存 | MemoryCache | Redis（可容器）+ 故障降级 |
| 消息 | Channel/队列内存 | Outbox 表 + 可重放代理或等价物 |
| 可观测性 | Console.WriteLine | OTel 导出到可查询后端 |
| 发布 | 本机 \`dotnet run\` | 镜像 + CI + 回滚步骤 |

教程主 demo 继续用纯 C# 帮你理解门禁；你的仓库若把那些类复制进去当生产实现，答辩不合格。评审者应能：clone、\`dotnet test\`、看见 Testcontainers 拉起 Postgres、用假 JWT 调 API、在日志里看到 traceId。

范围管理：不要做商城前台、推荐算法、原生 App。SKU 可以 3 个，流程必须完整。可选加对象存储发票，但不要因此牺牲备份演练。文档比第 20 个功能重要。做完后读结语的 90 天计划，把第一次灰度排进日历。

答辩时请准备十分钟演示：重复下单不双扣、杀 Redis 仍能下单、重复消息不重复出库、从备份恢复后对账、CI 一键出镜像。评委若只能看到 Swagger 里点一次 200，项目未毕业。范围宁可窄：三个 SKU、一条支付成功路径、完整运维。文档、演练记录、ADR 与代码同级提交。做完读结语 90 天计划，不要立刻开新框架。

毕业答辩十条：真实库、真实认证、幂等、Outbox/Inbox、缓存降级、探针、OTel、容器加固、CI 回滚、恢复演练。少一条就还在模拟。十分钟演示重复下单、杀 Redis、重复消息、备份恢复、出镜像。SKU 三个即可。评委要的是责任能力，不是功能清单长度。

毕业项目用责任定义完成，不用故事点。仓库真实，拉取请求小步。必须真的有：生产级数据库与迁移、身份与租户测试、幂等键、乐观并发、发件箱收件箱、缓存降级、问题详情与开放接口文档、遥测与探针、加固镜像与软件清单、持续集成与回滚、恢复演练记录。故障注入九条有证据。答辩十分钟只做五件事：重复下单、杀掉缓存、重复消息、备份恢复、打出镜像。三个库存单位足够。文档、决策记录与代码同级。做完按结语九十天计划过活，不要立刻换新框架逃避运维。

### 十日落地：毕业项目冲刺

按日执行，写不下就延期，不许跳日。每一天结束要有仓库里的证据（测试、文档或演练记录），口头“做过了”不算。

1. 第一日建立解决方案、持续集成与空迁移，容器测试能红。
2. 第二日领域不变量：金额、编号、状态机，单测先绿。
3. 第三日创建订单接口与问题详情，工厂测试二百零一。
4. 第四日身份与租户，跨租户用例绿。
5. 第五日幂等键与库存版本冲突。
6. 第六日发件箱收件箱，重复消息不重复出库。
7. 第七日缓存旁路、抖动与宕机降级。
8. 第八日遥测与三探针，终止信号演练。
9. 第九日镜像加固、清单扫描、流水线出图。
10. 第十日故障注入与恢复演练留证据，准备十分钟答辩。

十日结束后开一次十五分钟回顾：哪一天没有证据、哪一条会在毕业答辩被问到。把缺口列进下一周，而不是开始下一章收藏。

### 练习

1. 修改主 demo：把 \`rollback rehearsed\` 与 \`restore tested\` 都改成 true，确认输出变为"可以进入灰度发布"；再加两个真实门禁（如 \`sbom scanned\`、\`slo dashboards\`）并留一个 BLOCK；把 \`Passed\` 换成枚举（Passed/Blocked/Waived + 豁免期限），体会"有期限的风险批准"如何建模。
2. 脱离示例独立实现 \`ReleaseGate\`：支持门禁注册、\`Waive(name, owner, expiresOn)\` 豁免到期自动变回 BLOCK，\`CanDeploy()\` 输出全部阻断项；用测试覆盖"全部通过""有未到期豁免""豁免已过期"三种状态。
3. 生产场景：正式启动毕业项目——按本章的解决方案结构建真实 Git 仓库（Shop.Api/Application/Domain/Infrastructure/Worker + tests + infra），按四周节奏推进：容器里的迁移、真实 OIDC、幂等键与 409、Outbox/Inbox、缓存降级、OTel 三探针、加固镜像；把九条故障注入逐条做成自动测试或签名演练记录；最后用十分钟演示答辩——重复下单不双扣、杀 Redis 仍能下单、重复消息不重复出库、备份恢复对账、CI 一键出镜像。





`,
    code: `// ============================================================
// 毕业/发布门禁：BLOCK 不能靠“演示能跑”蒙混。
// 回滚演练、备份恢复经常是最后才补、事故时最先被问到的两项。
// 任一 false 都不得进入灰度；豁免必须有截止日期和批准人。
// ============================================================
var gates = new[]
{
    new Gate("unit + integration tests", true),
    new Gate("authorization tests", true),
    new Gate("migration rehearsed", true),
    new Gate("load target met", true),
    new Gate("rollback rehearsed", false), // 常见缺口：只会发，不会退
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

138 篇读完，你手里有一条从 \`Console.WriteLine\` 到订单服务上线的地图。技术清单不是能力：能力是下一次变更时，你知道该写测试、该看计划、该留回滚、该对谁说“今晚不能发”。

### 按部分回顾

| 部分 | 你应能做到 |
| --- | --- |
| 一～二 | 独立写出正确的 C# 程序，理解类型、数组、控制流与可空 |
| 三～六 | 用对象、泛型、委托、LINQ 组织中等复杂度的领域代码 |
| 七～十一 | 异步不乱，资源能释放，内存与异常有策略 |
| 十二～十三 | 会 HTTP/套接字基础，能搭 DI、测试、ASP.NET 与 EF 入门项目 |
| 十四 | 用现代 SDK、安全、韧性、可观测性、CI 的生产视角看服务 |
| 十五 | Git 纪律、类型不变量、时间/正则安全、Interop 边界 |
| 十六 | 关系库、数据访问选型、缓存、消息、实时、对象存储 |
| 十七 | 配置与密钥、K8s、IaC、容量、SLO、备份灾备 |
| 十八 | 类库契约、管道、OpenAPI、身份、EF 生产、真实测试、AOT 取舍、**毕业项目启动** |
| 十九～二十 | 加密、国际化、并行与池、二进制、插件、UI/AI 生态、遗留改造 |
| 二十一 | 验证错误形状、幂等分页、CORS/上传、Host/DI、缓存失效、探针、Aspire、租户隔离、取消与审计 |

第十四部分的「第九十二章 清单」是体检表；**第一百一十六章（\`csharp5-ch115\`）启动真实订单项目，读完第一百三十六章并完成深水区回填后才答辩**。若订单系统仍在用内存字典冒充 PostgreSQL，请回到项目章，而不是在结语给自己颁奖。

### 接下来 90 天

把日历分成三块，每周至少一次可审查的 PR：

**第 1–30 天：毕业项目补真。** 按第一百一十六章四周表压缩执行。Week 1 仓库与迁移必须在容器里绿。不要并行开三个框架试验。邀请一名同事按安全/数据/可运维三条线评审，把问题记进 issue 而不是聊天记录。

**第 31–60 天：故障与数据。** 把故障注入清单九条做成自动测试或每月演练。做一次 PITR 恢复并写实际 RTO。给 SLI 接上 burn-rate 告警，关掉三条不可行动的 CPU 告警。读一遍你自己的 OpenAPI，用 oasdiff 对比“上周”。

**第 61–90 天：交付节奏。** 主干 + 受保护分支跑通；一次金丝雀和一次故意回滚。轮换一个密钥（带重叠窗口）。删掉到期 feature flag。把 .NET 补丁纳入月例。若还有余力，再进入第十九部分专题，而不是用加密课逃避没做完的备份演练。

90 天结束时的验收不是“又看了一本书”，而是：仓库还活着、流水线还绿、演练记录有日期、你能在值班时按 runbook 操作。

### 长期习惯

- 跟踪 .NET 支持策略；2026-11-10 后 .NET 8/9 不再收安全更新。生产跟 LTS 补丁走，不拿 preview 当稳定。
- 先测量再优化；先定义超时与幂等再加“重试三遍”。
- 不变量进类型和数据库约束；操作进流水线；密钥进保险柜。
- 事故无责复盘，改进项有截止日期。
- 定期删除：过期 flag、无主告警、兼容层、文档谎言。
- 每周读一点别人的生产 PR，比再刷语法题更接近职业。

### 教程给不了的东西

教程不能给你：真实用户、真实值班电话、真实合规审计、真实账单惊吓、真实同事的坏脾气和好见解。它不能保证“按章节抄就不会出问题”——生产问题来自你的数据分布、你的组织接口、你没演练过的那条路径。模拟 demo 帮助理解顺序，**替代不了** PostgreSQL 死锁、Redis 脑裂、证书过期和“备份也加密了但密钥在被毁的区域”。

它能给你的是共同词汇和检查单：当有人说“我们上个 Outbox”或“这个告警在烧预算”，你知道那意味着什么，也知道下一章该翻哪一页。

### 现在就去做

如果还没有项目仓库，回到第一百一十六章，写第一个失败的集成测试，让它在 Testcontainers 里变绿；如果已经完成核心项目，就按第二十一部分复查验证、租户、取消与审计后再答辩。结语不是终点，是第一次持续交付循环的发令枪：设计可验证的变更 → 写代码与测试 → 小批量发布 → 观察真实指标 → 复盘改进。然后下一圈。

### 若你只记得五句话

1. **非法状态放不进类型和数据库**，比写更多 if 有效。
2. **至少一次 + 幂等** 是分布式默认天气，Outbox/Inbox 不是选修。
3. **告警对症状，备份看恢复**；没演练等于没有。
4. **模拟帮你懂，真实帮你负责**；第一百一十六章启动项目，第一百三十六章后做最终答辩。
5. **小批量、可回滚、有预算**，比一次完美发布更接近生产。

把这五句贴在仓库 README 顶上。当你准备加一个“很酷但不可观测”的功能时，先看错误预算和回滚步骤。

### 读完后最容易犯的六个错

1. **把模拟 demo 当成框架经验。** 章末纯 C# 能讲清 Outbox 顺序，但不能证明 EF 迁移、Redis 过期和 Kestrel 转发头。第一百一十六章要求真实依赖，就是为了挡住这一步。
2. **收藏下一本书，而不是合并长期仓库。** 126 个互不相干的示例目录，三个月后没有一个能发布。只保留毕业项目仓库，其余当查阅。
3. **用覆盖率或“学完进度条”代替演练。** 没有故障注入、没有恢复成功记录，就没有生产能力。
4. **忽略支持日历。** 2026-11-10 之后 .NET 8/9 不再收安全更新；学习环境可以暂留，生产不能。
5. **一个人读完、一个人上线、一个人值班。** 至少找一名同伴做安全和数据评审，并约定谁能在凌晨执行回滚。
6. **过早追求 Native AOT、服务网格或自研协议。** 先让订单路径可观测、可回滚、可恢复，再谈缩小镜像。

### 如何维护这张地图

你不需要记住每一行 API，但需要知道回哪一章：语法在第一～十三部分，生产主线在第十四～十八部分，专题在第十九～二十部分，生产深水区在第二十一部分；第一百一十六章启动项目，最终答辩在读完第一百三十六章并回填深水区要求之后。建议在毕业仓库的 \`docs/map.md\` 里只留三列：主题、本书标题章号、你们自己的 runbook 链接。章节会过时，你们的链接要跟着补丁和事故更新。

维护节奏可以很轻：

| 周期 | 做什么 | 完成证据 |
| --- | --- | --- |
| 每周五 | 看错误预算、未关 flag、无主告警 | 一条 issue 或会议记录 |
| 每两周 | 一条故障注入（超时、重复消息或冲突） | 测试或演练日期 |
| 每月 | 运行时补丁 + 一次恢复桌面推演 | 变更单与恢复耗时 |
| 每季度 | 请外人看授权、备份和 OpenAPI 兼容 | 评审意见与整改截止日期 |

### 现在离开这一页

打开第一百一十六章，把毕业仓库设为默认工作区，写一个此刻会失败的集成测试，让它在 Testcontainers 里变绿。地图在前言，答辩在毕业项目，习惯在上面这张表。教程到此停笔，系统还在你键盘后面运行——去照顾它。


`,
  code: `// ============================================================
// 结语 demo：教程结束 = 第一次持续交付循环的发令枪。
// 集合表达式 [] 是 C# 12 语法；循环打印两圈，强调能力靠重复而不是读完。
// ============================================================
Console.WriteLine("学习完成不是终点：");

string[] loop =
[
    // 集合表达式（C# 12）：目标类型是 string[] 时，[] 就是数组初始化。
    // 换成 List<string> loop = [ ... ] 语法相同，底层集合不同。
    "设计可验证的变更",
    "编写代码与测试",
    "小批量发布",
    "观察真实指标",
    "复盘并改进",
];

for (int iteration = 1; iteration <= 2; iteration++)
{
    // 打两圈：提醒「读完 ≠ 会了」。生产节奏是同一套步骤每周重复，而不是一次性仪式。
    Console.WriteLine($"\\n持续交付循环 {iteration}");
    foreach (string step in loop)
        Console.WriteLine($"  → {step}");
}
`,
  lang: "cs",
};
