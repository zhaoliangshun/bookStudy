// =============================================================
// AI 应用编程教程 —— 第 7 批章节（AI编程实用技巧组，共 5 章）
// -------------------------------------------------------------
// 章节范围：
//   31. aiapp-tip-context   上下文工程技巧
//   32. aiapp-tip-decompose 任务拆解技巧
//   33. aiapp-tip-iterate   迭代精炼技巧
//   34. aiapp-tip-readcode  让 AI 读懂大代码库
//   35. aiapp-tip-git       AI 辅助 Git/PR/CR
//
// 信息时效：2026-07-05。工具名称、命令与价格如无特别说明均以官方页面为准。
//
// 每个章节对象的结构：
//   id      : 唯一标识
//   icon    : 展示用 emoji
//   group   : 分组名
//   title   : 章节标题
//   content : Markdown 格式的详细讲解（代码块已转义）
//   code    : 可在 Node.js 沙箱运行、带详细中文注释的示例代码
// =============================================================

export const chapters = [
  {
    id: "aiapp-tip-context",
    icon: "🧩",
    group: "AI编程实用技巧",
    title: "上下文工程技巧",
    content: `
# 第31章：上下文工程技巧

## 31.1 什么是上下文工程

"上下文工程"（Context Engineering）是 2025 年之后在 AI 编程圈子里被反复提及的一个词。它的核心命题是：**模型的能力是固定的，但模型在你这次任务里发挥出多少能力，取决于你喂给它的上下文**。同一个 Claude Sonnet 4，同样的提问"帮我重构这个函数"，在一个工程师手里能产出生产级代码，在另一个工程师手里只会给出似是而非的伪代码，差异往往不在 prompt 措辞，而在上下文。

我们可以把一次 AI 调用抽象成这样一个公式：\`输出质量 = 模型能力 × 上下文质量 × prompt 质量\`。模型能力是黑盒，你改不了；prompt 质量已经被讲了两年，大家多少都会写；**上下文质量是三者中最被低估、也最有优化空间的一环**。上下文工程就是系统性地决定"在调用 AI 时，把哪些信息以什么顺序、什么粒度放进上下文窗口"。

为什么这件事在 2026 年变得特别重要？因为模型上下文窗口从早期的 4K 涨到了 200K 甚至 1M，但**窗口大不等于上下文好**。研究表明，模型对长上下文存在"中段衰减"（lost in the middle）现象——放在窗口中间的信息被引用的概率显著低于头尾。这意味着"把整个仓库塞进去"不仅贵，而且不一定比"精选 50 个文件"效果好。上下文工程就是用来对抗这种"塞得越多越好"的直觉的。

一个常见的认知误区是把上下文工程等同于"prompt 工程"。两者有重叠但不同：prompt 工程关注"怎么问"，上下文工程关注"喂什么"。一个典型场景：你想让 AI 改一个 bug。prompt 工程会教你"请按以下步骤分析…"；上下文工程会问你"你有没有把相关的报错日志、对应的测试文件、这个模块的设计文档一起喂进去？"。**前者是修辞，后者是工程**。

## 31.2 五类上下文：任务 / 代码 / 项目 / 规范 / 历史

把上下文分类，是为了能系统地检查"我这次调用缺了哪一类"。实践中把上下文分成五类比较实用：

**1. 任务上下文（Task Context）**：你这次想让 AI 做什么。包括目标、约束、验收标准、优先级。例如"给这个 Express 中间件加 rate limiting，每 IP 每分钟 60 次，超额返回 429，要写单测"。任务上下文缺失是最常见的失败原因——很多人只说"加个限流"，结果 AI 不知道阈值、不知道状态码、不知道要不要测试。

**2. 代码上下文（Code Context）**：与任务直接相关的代码。包括要修改的文件、被调用的函数、相关的类型定义、调用方代码。注意是"直接相关"，不是"整个仓库"。判断标准：如果 AI 不看这段代码会给出错误答案，那它就属于代码上下文。

**3. 项目上下文（Project Context）**：让 AI 理解代码所在环境的背景信息。包括技术栈与版本、目录结构、架构分层约定、第三方依赖。例如"我们用 Next.js 15 App Router + Prisma + PostgreSQL，路由都在 app/ 下，数据库访问统一走 prisma client"。项目上下文解决的是"AI 不知道你的项目长什么样"的问题。

**4. 规范上下文（Spec Context）**：团队或项目的成文约定。包括代码规范（ESLint 配置、命名约定）、提交规范、设计文档、API 契约、ADR（架构决策记录）。规范上下文解决的是"AI 按它训练数据里的默认风格写，但你们团队不是这么干的"的问题。

**5. 历史上下文（History Context）**：本次对话之前发生的事。包括之前的尝试、被否决的方案、为什么被否决、已知的踩坑。历史上下文解决的是"AI 重复犯同一个错"的问题——如果你已经否决过某个方案三次，第四次必须显式告诉它"别再给方案 X，原因 Y"。

一个快速自检表：每次给 AI 派活前，问自己这五类是否都覆盖了。不需要每次都全给，但漏给的那一类往往是出问题的原因。

## 31.3 上下文窗口分配策略：按重要性裁剪

模型有 200K 的窗口，不代表你应该用满。上下文窗口应该被当作"预算"来管理：**重要信息给足，次要信息裁剪，无关信息不放**。一个实用的分配比例（以 200K 窗口为例）：

| 上下文类型 | 建议占比 | 大致 token 数 | 说明 |
| --- | --- | --- | --- |
| 系统 prompt / 角色设定 | 5% | 10K | 角色、输出格式、硬约束 |
| 规范上下文 | 10% | 20K | 代码规范、设计文档摘录 |
| 任务上下文 | 5% | 10K | 目标、验收标准 |
| 代码上下文 | 50% | 100K | 直接相关的代码 |
| 项目上下文 | 10% | 20K | 目录树、依赖、架构说明 |
| 历史上下文 | 15% | 30K | 之前的尝试与反馈 |
| 输出预留 | 5% | 10K | 给模型留输出空间 |

注意"输出预留"——很多人会忘。如果你把 200K 全塞满输入，模型没空间输出长答案，会被截断或质量下降。一般至少预留 5%~10% 给输出。

**裁剪的三条原则**：第一，**相关性优先**——两个文件二选一，选与任务更相关的；第二，**新近性优先**——历史对话里只保留最近 2~3 轮，更早的总结成一句话；第三，**结构化优先**——能换成表格/列表的就不要用段落，能换成"函数签名 + 注释"的就不要给完整函数体。

## 31.4 @引用机制：@file / @folder / @docs / @web

主流 AI 编程工具（Cursor、Claude Code、Windsurf、Copilot Chat 等）都提供了 @ 引用语法，让你显式地把某个资源拉进上下文。这是上下文工程里最重要的"手动挡"。

| 引用语法 | 含义 | 何时用 |
| --- | --- | --- |
| \`@file path/to/x.ts\` | 引用单个文件 | 改某个具体文件时 |
| \`@folder path/to/dir\` | 引用整个目录 | 改一个模块、需要看全貌时 |
| \`@docs 名称\` | 引用工具内置的官方文档索引 | 用了不熟的 API，让 AI 查最新文档 |
| \`@web 关键词\` | 让 AI 联网搜索 | 涉及很新的库版本、需要实时信息时 |
| \`@git commit\` | 引用某个 commit 的 diff | 复盘、写 PR 描述时 |
| \`@symbol 函数名\` | 引用某个符号的定义与所有引用 | 重构某个函数时 |
| \`@codebase\` 或 \`@workspace\` | 让工具自动检索整个工作区 | 不确定相关代码在哪时 |

@ 引用比"把文件内容复制粘贴进对话"有两个优势：第一，**工具会自动做摘要和裁剪**，不会把整个 5000 行文件原样塞进去；第二，**引用是可追踪的**，AI 在回答里说"我修改了 @file x.ts"时你能点击跳转。

一个常见的误用是 \`@folder .\`（引用整个项目根目录）。这会把所有文件都拉进来，不仅超窗口，而且噪音极大。正确做法是用 \`@codebase\` 让工具做语义检索，或者用更细粒度的 \`@file\` / \`@folder\` 针对性引用。

## 31.5 长代码的分块喂给 AI

当一段代码或一个文档超过模型一次能消化的量时（比如 5000 行的 legacy 文件），需要"分块喂给"。这不是简单切分，而是有讲究的。

**分块策略一：按语义边界切**。不要按行数机械切，而要按函数、类、章节切。一个 5000 行的文件，按函数切可能是 80 个块，每块 50~100 行。这样每一块在语义上是完整的，AI 理解时不会断在半句话。

**分块策略二：滑动窗口 + 摘要**。第一块喂完后，让 AI 写一个 5 行摘要；喂第二块时把上一块的摘要带上，再让 AI 更新摘要。这样递进式地把长文件"压缩"成 AI 头脑里的结构化认知。伪代码如下：

\`\`\`text
for each chunk in chunks:
    prompt = "上一段摘要：" + running_summary
           + "\\n本段内容：" + chunk
           + "\\n请更新摘要（不超过 10 行）并回答当前问题"
    response = ai.complete(prompt)
    running_summary = extract_summary(response)
\`\`\`

**分块策略三：先骨架后细节**。先把整个文件的结构（所有函数名 + 一行注释）喂给 AI，让它建立整体认知；然后针对它需要修改的部分，把完整函数体喂进去。这模拟了人类工程师"先看目录再看正文"的阅读方式。

## 31.6 让 AI 主动提问补全上下文

一个反直觉但很有效的技巧是：**不要一开始就把所有上下文塞给 AI，而是让它先问你**。在第一轮对话里加一句："在你开始写代码前，请列出你需要的所有信息，我会逐条补充。"这样做有三个好处：第一，AI 问的问题往往是你没想到的关键信息；第二，让 AI 主动要的上下文比硬塞的上下文被利用得更充分；第三，你可以从 AI 的问题列表判断它是否真的理解了任务。

一个典型的对话开场：

\`\`\`text
用户：我要给这个 Express 应用加 rate limiting 中间件。在开始前，
      请列出你需要我确认的所有信息（技术栈、阈值、存储方式、
      异常处理、测试要求等），我会逐条回答。

AI：好的，我需要确认以下信息：
    1. Express 版本？（4.x / 5.x API 不同）
    2. 限流维度？（IP / 用户 ID / API key）
    3. 限流阈值与窗口？（如 60 次/分钟）
    4. 计数存储？（内存 / Redis / 数据库，影响多实例部署）
    5. 超额响应？（状态码、响应体格式、是否带 Retry-After 头）
    6. 是否需要白名单？（内网、特定用户）
    7. 测试要求？（单元测试 / 集成测试 / 压测）
    8. 日志与监控需求？

用户：逐条回答……
\`\`\`

这种"先问后做"的模式能显著降低返工率。**注意：不要让 AI 无限提问**——限制它最多问 5~8 个问题，否则会变成"问卷式开发"。

## 31.7 避免上下文污染

上下文污染指上下文里混入了会误导 AI 的信息。常见来源有四类：

**1. 过期代码**：你粘贴的是旧版本的函数，但 AI 不知道这是旧的，会基于过期代码给建议。对策：粘贴前先 \`git pull\`，或用 @file 引用而非复制粘贴。

**2. 无关报错**：你把整个终端日志贴进去，里面混了 10 条无关的 warning。AI 会试图"修复"这些 warning，偏离主任务。对策：贴日志前先过滤，只留与当前问题相关的栈。

**3. 误导性注释**：代码里的注释是错的（比如函数签名变了但注释没更新），AI 会把注释当事实。对策：让 AI "以代码为准，注释仅供参考"，或先清理一遍注释。

**4. 历史对话的副作用**：上一轮你让 AI 用了某个库，这一轮换任务了但还在同一个对话里，AI 会延续上一轮的偏好。对策：换任务就开新对话，或者在 prompt 里显式说"忽略之前关于 X 的讨论"。

一个识别上下文污染的信号：**AI 的回答里出现了你没问、也没在任何上下文里出现过的"事实"**，那大概率是它在跨任务串味。这时候最干净的做法是新开对话重置上下文。

## 31.8 上下文优先级排序与"预算"分配（详细）

把上下文塞进窗口不是平铺的，要有优先级。一个实用的优先级模型是"四象限"：

- **高优先级 / 高成本**：核心代码（要修改的文件本身）。必给，但用 \`@file\` 让工具自动裁剪。
- **高优先级 / 低成本**：函数签名、类型定义、API 契约、错误信息。必给，且全文给。
- **低优先级 / 高成本**：整个目录、整个文档。只在 AI 明显缺乏背景时给，且优先用摘要。
- **低优先级 / 低成本**：项目 README、目录树、依赖列表。给个浓缩版即可。

预算紧张时（比如窗口快满了）的裁剪顺序：先砍低优先级/高成本 → 再砍低优先级/低成本 → 最后才动高优先级。**核心代码永远最后裁**。

"预算"的另一个维度是**成本预算**。如果你用 API 计费，输入 token 是要钱的。200K 的输入在 Sonnet 4 上大约 0.6 美元一次调用，一天跑 100 次就是 60 美元。这时候上下文工程的"裁剪"直接等于省钱。一个经验值：**经过裁剪的 30K 上下文，效果通常和塞满 200K 差不多，但成本是后者的 1/6**。

prompt caching 是另一个省钱利器。把不变的部分（系统 prompt、规范文档、项目说明）放在 prompt 开头，重复调用时这部分会命中缓存，Anthropic 的缓存价格是原价的 10%。这意味着你反复迭代同一段代码时，只有"变化的代码片段"按全价计费，规范部分几乎免费。

最后总结一句：**上下文工程的本质是"为 AI 减负"，而不是"为 AI 加料"**。模型在干净、相关、结构化的上下文里表现最好，而不是在堆满信息的上下文里。学会"删上下文"比学会"加上下文"更难，但也更重要。
`,
    code: `// =============================================================
// 第31章示例：上下文工程预算分配器
// 输入任务所需的各种上下文片段，按类型与优先级分配 token 预算
// 超出窗口时按优先级裁剪，输出最终上下文构成与预估成本
// =============================================================

// ---- 上下文片段类型 ----
// 五类：task / code / project / spec / history
const CONTEXT_TYPES = ["task", "code", "project", "spec", "history"];

// ---- 默认预算配比（占比之和 = 1）----
// 可按需调整，例如纯重构任务可把 code 占比调到 70%
const DEFAULT_BUDGET = {
  system: 0.05,   // 系统 prompt
  spec: 0.10,     // 规范
  task: 0.05,     // 任务
  code: 0.50,     // 代码
  project: 0.10,  // 项目
  history: 0.15,  // 历史
  output: 0.05,   // 输出预留
};

// ---- 优先级（数字越大越优先保留）----
const PRIORITY = {
  code: 4,        // 核心代码最后裁
  task: 3,
  spec: 3,
  project: 2,
  history: 1,     // 历史最先裁
};

// ---- 模拟一次任务的上下文片段 ----
const FRAGMENTS = [
  { id: "f1",  type: "task",    name: "任务目标",         tokens: 800,  priorityBoost: 0 },
  { id: "f2",  type: "code",    name: "目标文件 router.ts", tokens: 6200, priorityBoost: 2 }, // 直接修改的文件
  { id: "f3",  type: "code",    name: "依赖 auth.ts",      tokens: 3100, priorityBoost: 1 },
  { id: "f4",  type: "code",    name: "类型定义 types.ts",  tokens: 900,  priorityBoost: 1 },
  { id: "f5",  type: "code",    name: "调用方 api.ts",      tokens: 4500, priorityBoost: 0 },
  { id: "f6",  type: "spec",    name: "ESLint 配置",        tokens: 1200, priorityBoost: 0 },
  { id: "f7",  type: "spec",    name: "API 设计文档",       tokens: 3800, priorityBoost: 0 },
  { id: "f8",  type: "project", name: "目录树",             tokens: 1500, priorityBoost: 0 },
  { id: "f9",  type: "project", name: "package.json",       tokens: 600,  priorityBoost: 0 },
  { id: "f10", type: "history", name: "前 3 轮对话",        tokens: 5200, priorityBoost: 0 },
  { id: "f11", type: "history", name: "更早 5 轮对话",      tokens: 8800, priorityBoost: -1 }, // 旧对话优先级低
];

// ---- 模型窗口配置 ----
const MODEL = {
  name: "claude-sonnet-4",
  window: 200000,
  priceInputPerMillion: 3,   // 美元 / 百万 token（示意）
  priceOutputPerMillion: 15,
  cacheDiscount: 0.1,        // 缓存命中价格为原价 10%
};

// ---- 预算分配 + 裁剪 ----
function planContext(fragments, model, budget) {
  const totalInputBudget = Math.floor(model.window * (1 - budget.output));
  const typeBudgets = {};
  for (const t of CONTEXT_TYPES) {
    typeBudgets[t] = Math.floor(totalInputBudget * (budget[t] || 0));
  }
  // 加上 system 占位
  const systemBudget = Math.floor(model.window * budget.system);

  // 按类型分组，组内按"优先级 + tokens 倒序"排序
  const grouped = {};
  for (const t of CONTEXT_TYPES) grouped[t] = [];
  for (const f of fragments) {
    if (grouped[f.type]) grouped[f.type].push(f);
  }
  for (const t of CONTEXT_TYPES) {
    grouped[t].sort((a, b) => {
      const pa = PRIORITY[t] + a.priorityBoost;
      const pb = PRIORITY[t] + b.priorityBoost;
      if (pb !== pa) return pb - pa;
      return a.tokens - b.tokens; // 同优先级下小的优先（更可能完整保留）
    });
  }

  // 在每个类型内按预算裁剪
  const kept = [];
  const dropped = [];
  for (const t of CONTEXT_TYPES) {
    let used = 0;
    for (const f of grouped[t]) {
      if (used + f.tokens <= typeBudgets[t]) {
        kept.push({ ...f, typeBudget: typeBudgets[t] });
        used += f.tokens;
      } else {
        dropped.push({ ...f, reason: "超出 " + t + " 预算" });
      }
    }
  }

  const keptTokens = kept.reduce((s, f) => s + f.tokens, 0);
  const droppedTokens = dropped.reduce((s, f) => s + f.tokens, 0);

  // 成本估算：假设 system + spec + project 命中缓存，code/task/history 不命中
  const cacheable = kept
    .filter(f => f.type === "spec" || f.type === "project")
    .reduce((s, f) => s + f.tokens, 0) + systemBudget;
  const nonCacheable = keptTokens - cacheable + systemBudget; // system 算进 nonCacheable 计算原价
  // 实际计费：cacheable 按缓存价，nonCacheable 按原价（system 重复调用按缓存）
  const costPerCall =
    (cacheable * model.priceInputPerMillion * model.cacheDiscount) / 1e6 +
    (nonCacheable * model.priceInputPerMillion) / 1e6;

  return {
    window: model.window,
    totalInputBudget,
    systemBudget,
    typeBudgets,
    kept,
    dropped,
    keptTokens,
    droppedTokens,
    cacheableTokens: cacheable,
    costPerCall,
  };
}

// ---- 执行计划 ----
const plan = planContext(FRAGMENTS, MODEL, DEFAULT_BUDGET);

console.log("==== 上下文预算分配报告 ====");
console.log("模型窗口          :", plan.window, "tokens");
console.log("输入预算（扣输出）:", plan.totalInputBudget, "tokens");
console.log("System 预算       :", plan.systemBudget, "tokens");
console.log("");
console.log("各类型预算：");
for (const t of CONTEXT_TYPES) {
  console.log("  " + t.padEnd(8) + ": " + plan.typeBudgets[t] + " tokens");
}
console.log("");
console.log("保留片段（" + plan.kept.length + " 个，共 " + plan.keptTokens + " tokens）：");
for (const f of plan.kept) {
  console.log("  ✓ [" + f.type.padEnd(8) + "] " + f.name.padEnd(22) + " " + f.tokens + " tokens");
}
console.log("");
if (plan.dropped.length > 0) {
  console.log("裁剪片段（" + plan.dropped.length + " 个，省 " + plan.droppedTokens + " tokens）：");
  for (const f of plan.dropped) {
    console.log("  ✗ [" + f.type.padEnd(8) + "] " + f.name.padEnd(22) + " " + f.tokens + " tokens  (" + f.reason + ")");
  }
} else {
  console.log("无裁剪。");
}
console.log("");
console.log("成本估算（每次调用）：");
console.log("  可缓存部分  :", plan.cacheableTokens, "tokens → 约 $" + (plan.cacheableTokens * MODEL.priceInputPerMillion * MODEL.cacheDiscount / 1e6).toFixed(4));
console.log("  不可缓存部分:", (plan.keptTokens - plan.cacheableTokens + plan.systemBudget), "tokens → 约 $" + ((plan.keptTokens - plan.cacheableTokens + plan.systemBudget) * MODEL.priceInputPerMillion / 1e6).toFixed(4));
console.log("  单次调用合计: 约 $" + plan.costPerCall.toFixed(4));
console.log("  日均 100 次估算: 约 $" + (plan.costPerCall * 100).toFixed(2));
console.log("");
console.log("✅ 上下文工程要点：");
console.log("  1. 五类上下文：task / code / project / spec / history");
console.log("  2. 预算配比按任务类型调整（重构多给 code，新功能多给 spec）");
console.log("  3. 裁剪顺序：history → project → spec → task → code");
console.log("  4. 用 prompt caching 省钱：spec/project 放开头，重复调用几乎免费");
`
  },
  {
    id: "aiapp-tip-decompose",
    icon: "🧱",
    group: "AI编程实用技巧",
    title: "任务拆解技巧",
    content: `
# 第32章：任务拆解技巧

## 32.1 为什么大任务必须拆解

让 AI 写"帮我做一个博客系统"这种大任务，结果几乎一定是灾难性的。原因不是模型不够强，而是**单次 prompt 能稳定产出的代码量是有上限的**。这个上限在 2026 年的模型上大约是 200~500 行可读、可用、符合规范的代码。超过这个量级，模型会开始"顾头不顾尾"——前面的类型定义和后面的实现不一致、忘了处理边界、重复造轮子、风格前后不一。

拆解的本质是把一个"超出单次 prompt 上限"的任务，分解成多个"在单次 prompt 上限内"的子任务。这背后是一个朴素的工程原则：**复杂度不会消失，只会转移**。你不主动拆，复杂度就会以 bug、返工、不一致的形式被动显现，代价更大。

拆解还有几个附带好处：第一，**可验收**——每个子任务有明确的完成标准，你能逐个 check；第二，**可回滚**——某个子任务做坏了，只回滚这一步而不是整个项目；第三，**可并行**——独立的子任务可以同时让多个 AI 会话做，缩短总时长；第四，**可复用**——拆解出来的子任务模板能在下一个项目里复用。

一个判断"是否需要拆解"的简单标准：**如果你的任务描述里出现了"和"、"以及"、"同时"三个以上的连词，就需要拆**。例如"实现用户注册、登录、找回密码、修改资料、注销"——这其实是五个任务，不是一个。

## 32.2 WBS（工作分解结构）思路

WBS（Work Breakdown Structure）是项目管理里的经典方法，借到 AI 编程里同样好用。WBS 的核心原则是"百分百原则"：**每一层子任务的合集必须 100% 覆盖父任务，不多不少**。

应用到 AI 编程上，WBS 长这样：

\`\`\`text
L0: 做一个博客系统
├── L1: 数据层
│   ├── L2: 设计 Post 表结构
│   ├── L2: 设计 User 表结构
│   └── L2: 写 Prisma schema 与 migration
├── L1: API 层
│   ├── L2: 认证 API（注册/登录/登出）
│   ├── L2: 文章 CRUD API
│   ├── L2: 评论 API
│   └── L2: 中间件（鉴权/限流/日志）
├── L1: 前端层
│   ├── L2: 布局与导航
│   ├── L2: 文章列表页
│   ├── L2: 文章详情页
│   ├── L2: 编辑器页
│   └── L2: 个人中心页
└── L1: 部署
    ├── L2: CI/CD 流水线
    └── L2: 生产环境配置
\`\`\`

WBS 的关键是**分解到"可执行"为止**。"可执行"在 AI 编程语境下意味着：一个 L2 节点对应一份能直接喂给 AI 的 prompt，AI 一次就能产出完整代码。如果某个 L2 节点描述完发现还是要"和"好几个东西，那就再往下拆一层。

WBS 不是一次定死的，而是边做边调整的。常见情况：做到 L2 才发现某个表结构需要拆成两张表，那就回头更新 L1 的数据层。这是正常的，WBS 是"活文档"。

## 32.3 按层级拆 vs 按阶段拆

拆解有两条主轴：**按层级拆**（横向，按系统结构）和**按阶段拆**（纵向，按时间流程）。两者不互斥，往往一起用。

**按层级拆**：把系统按架构分层，每层独立拆。典型是"数据层 → 服务层 → API 层 → 前端层 → 部署层"。优点是层次清晰、模块解耦；缺点是早期层（如数据层）的决策会影响后期层，需要返工。适合"从零搭一个新系统"。

**按阶段拆**：把任务按交付里程碑分阶段。典型是"设计 → 实现 → 测试 → 文档"。每个阶段产出明确的交付物，阶段之间有 gate。优点是每个阶段都能停下来验收；缺点是阶段间的依赖强，不容易并行。适合"已有系统的迭代"。

实际操作中常用**矩阵式拆解**：先按阶段拆出大块，每个阶段内再按层级拆。例如：

\`\`\`text
阶段 1: 设计
  ├── 数据模型设计
  ├── API 契约设计
  └── UI 原型
阶段 2: 实现
  ├── 数据层实现（schema + migration）
  ├── 服务层实现（业务逻辑）
  ├── API 层实现（路由 + 中间件）
  └── 前端实现（页面 + 状态管理）
阶段 3: 测试
  ├── 单元测试
  ├── 集成测试
  └── E2E 测试
阶段 4: 文档
  ├── API 文档
  └── 用户手册
\`\`\`

## 32.4 颗粒度判断：什么时候算"拆够了"

拆解最大的坑不是不会拆，而是**拆得太粗或太细**。太粗，单次 prompt 仍然超载；太细，子任务数量爆炸，管理成本超过收益。

三个实用的颗粒度判据：

**判据一：一个 PR 能完成**。一个子任务对应一次代码提交、一个 PR。如果一个子任务需要拆成 3 个 PR 才能交付，那它至少还要再拆一层。反之，如果 5 个子任务加起来才 30 行代码，说明拆太细了，应该合并。

**判据二：一次 prompt 能完成**。把子任务描述喂给 AI，AI 一次产出的代码（含修正一次）就能通过验收。如果需要 3 轮以上"修正—反馈"才能用，要么是子任务太大，要么是 prompt 不够清楚，前者要拆，后者要补 spec。

**判据三：一个函数 / 一个文件能容纳**。子任务产出的代码应该在 1 个文件、不超过 300 行。如果一份代码要塞进 3 个文件、600 行才能讲清楚，多半是子任务里混了两个关注点。

一个反向校验：**把所有子任务的 prompt 标题连起来读一遍**。如果连起来是一条完整的故事线（"先建表 → 再写 API → 再接前端 → 最后部署"），说明颗粒度合适；如果中间缺环节（"建表 → 接前端"，少了 API），说明拆漏了。

## 32.5 用 AI 帮你拆解任务

拆解本身也可以让 AI 做。把大任务描述丢给 AI，让它输出一个结构化的拆解方案，是省时省力的做法。关键是给 AI 一个**拆解的 meta-prompt**——告诉它拆解的规则与产出格式。

一个可复用的拆解 meta-prompt：

\`\`\`text
你是一位资深技术负责人。请把下面的任务按 WBS 方法拆解为子任务。

拆解规则：
1. 每个子任务必须能在一次 prompt（≤500 行代码）内完成
2. 每个子任务必须有明确的输入、输出、验收标准
3. 标注子任务之间的依赖关系（A 依赖 B 才能开始）
4. 标注可并行的子任务
5. 最多 3 层，避免过度拆解

输出格式（JSON）：
{
  "tasks": [
    {
      "id": "T1",
      "name": "子任务名",
      "description": "详细描述",
      "inputs": ["需要的输入"],
      "outputs": ["交付物"],
      "acceptance": ["验收标准"],
      "depends_on": ["T0"],
      "parallelizable_with": ["T2"],
      "estimated_prompts": 1
    }
  ]
}

任务描述：[在此粘贴大任务]
\`\`\`

让 AI 拆完后**一定要人工 review**。AI 拆解的常见问题：依赖关系标错（把可并行的标成串行）、颗粒度不一致（有的太粗有的太细）、漏掉关键子任务（如忘了写测试）。把 AI 拆解当作"草稿"，人工调整后才作为执行计划。

## 32.6 子任务的依赖排序：并行 vs 串行

拆完之后要排执行顺序。子任务之间的关系有三种：

**串行依赖**：B 必须等 A 完成。例如"写 API"依赖"定义数据模型"。这种关系要严格排序，不能跳。

**可并行**：A 和 B 互不依赖，可以同时做。例如"写文章列表页"和"写个人中心页"互不影响。这种关系要尽量并行，缩短总时长。

**部分依赖**：B 大部分能做，但有一小部分要等 A。例如"前端页面"可以先把 UI 写出来，但接口对接要等"API 设计"完成。这种关系可以**先做不依赖的部分**，把依赖部分留到最后。

排顺序的算法是经典的"拓扑排序"：把子任务画成有向无环图（DAG），按依赖关系排出一个合法的执行序列，同层可并行的就并行。手动排时简单原则是：**数据模型 → 后端服务 → API 契约 → 前端 → 集成测试 → 部署**。

并行的实操技巧：**开多个 AI 会话同时跑**。每个会话一个子任务，各自独立的上下文。注意并行子任务如果都要修改同一个文件，会产生冲突，所以并行子任务必须落在不同文件上。如果必须改同一文件，改成串行。

## 32.7 颗粒度判据与 AI 拆解 meta-prompt（详细）

把上面两个点合在一起做一个详细的工作模板。这是经过实战验证的"拆解 → 执行"流程：

**第一步：粗拆（5 分钟）**。用 AI meta-prompt 把大任务拆成 5~10 个 L1 子任务，每个一句话描述。这一步只看"是否覆盖完整"，不纠结细节。

**第二步：细拆（10 分钟）**。挑出明显过大的 L1 子任务，再拆成 L2。判断标准是"判据二：一次 prompt 能完成"。通常 L2 子任务数量在 15~30 个之间。

**第三步：标依赖（5 分钟）**。给每个 L2 子任务标 depends_on 与 parallelizable_with。这一步可以用 AI 辅助，但务必人工校验。

**第四步：估算（5 分钟）**。给每个 L2 子任务估算"预计需要几轮 prompt"和"预计代码行数"。这能帮你判断颗粒度是否合理——如果某个子任务预估 5 轮 prompt、800 行代码，那就是拆粗了。

**第五步：执行**。按拓扑序执行，可并行的开多会话并行。每个子任务完成后更新状态，记录"实际 prompt 轮数 / 实际代码行数"，作为下次拆解的校准数据。

一个常被忽略的细节：**在子任务 prompt 里要带上"前置上下文"**。例如执行"写文章列表页"时，prompt 里要带上"API 契约已定义如下…"、"项目用 Next.js App Router"等来自前序子任务的产出。否则 AI 会基于猜测做事，产出对不上。

最后总结：拆解不是为了"显得有规划"，而是为了**让每个 AI 调用都在它的舒适区内**。模型在 200~500 行、明确验收标准的任务上表现最好；超出这个范围，质量断崖式下降。拆解的本质是给模型创造舒适区。
`,
    code: `// =============================================================
// 第32章示例：任务拆解器与执行排序器
// 输入一组子任务（含依赖关系），输出拓扑排序与并行分组
// =============================================================

// ---- 模拟一个"博客系统"的拆解结果 ----
const TASKS = [
  // L1: 数据层
  { id: "T1", name: "设计数据模型",        layer: "数据", dependsOn: [],                estPrompts: 1, estLines: 80 },
  { id: "T2", name: "写 Prisma schema",   layer: "数据", dependsOn: ["T1"],            estPrompts: 1, estLines: 120 },
  // L1: 服务层
  { id: "T3", name: "认证服务",            layer: "服务", dependsOn: ["T2"],            estPrompts: 2, estLines: 250 },
  { id: "T4", name: "文章服务",            layer: "服务", dependsOn: ["T2"],            estPrompts: 2, estLines: 300 },
  { id: "T5", name: "评论服务",            layer: "服务", dependsOn: ["T2"],            estPrompts: 2, estLines: 200 },
  // L1: API 层
  { id: "T6", name: "认证 API 路由",       layer: "API",  dependsOn: ["T3"],            estPrompts: 1, estLines: 100 },
  { id: "T7", name: "文章 API 路由",       layer: "API",  dependsOn: ["T4"],            estPrompts: 1, estLines: 150 },
  { id: "T8", name: "评论 API 路由",       layer: "API",  dependsOn: ["T5"],            estPrompts: 1, estLines: 100 },
  { id: "T9", name: "中间件（鉴权/限流）", layer: "API",  dependsOn: ["T3"],            estPrompts: 1, estLines: 120 },
  // L1: 前端层
  { id: "T10", name: "布局与导航",          layer: "前端", dependsOn: [],                estPrompts: 1, estLines: 150 },
  { id: "T11", name: "文章列表页",          layer: "前端", dependsOn: ["T7", "T10"],     estPrompts: 2, estLines: 220 },
  { id: "T12", name: "文章详情页",          layer: "前端", dependsOn: ["T7", "T8", "T10"], estPrompts: 2, estLines: 280 },
  { id: "T13", name: "编辑器页",            layer: "前端", dependsOn: ["T6", "T10"],     estPrompts: 3, estLines: 350 },
  // L1: 测试与部署
  { id: "T14", name: "集成测试",            layer: "测试", dependsOn: ["T6", "T7", "T8"], estPrompts: 2, estLines: 200 },
  { id: "T15", name: "CI/CD 流水线",        layer: "部署", dependsOn: ["T14"],           estPrompts: 1, estLines: 80 },
];

// ---- 拓扑排序（Kahn 算法）+ 并行分组 ----
// 同一"波次"内的任务无相互依赖，可并行执行
function topoSortParallelGroups(tasks) {
  const idSet = new Set(tasks.map(t => t.id));
  // 校验依赖合法性
  for (const t of tasks) {
    for (const d of t.dependsOn) {
      if (!idSet.has(d)) {
        throw new Error("任务 " + t.id + " 依赖了不存在的 " + d);
      }
    }
  }

  // 计算入度
  const inDegree = {};
  const dependents = {}; // d -> 依赖 d 的任务列表
  for (const t of tasks) {
    inDegree[t.id] = t.dependsOn.length;
    for (const d of t.dependsOn) {
      dependents[d] = dependents[d] || [];
      dependents[d].push(t.id);
    }
  }

  // 入度为 0 的作为第一波
  let wave = tasks.filter(t => inDegree[t.id] === 0).map(t => t.id);
  const waves = [];
  const done = new Set();

  while (wave.length > 0) {
    waves.push(wave.slice());
    for (const id of wave) done.add(id);
    const nextWave = [];
    for (const id of wave) {
      for (const dep of dependents[id] || []) {
        inDegree[dep]--;
        if (inDegree[dep] === 0 && !done.has(dep)) {
          nextWave.push(dep);
        }
      }
    }
    wave = nextWave;
  }

  if (done.size !== tasks.length) {
    const stuck = tasks.filter(t => !done.has(t.id)).map(t => t.id);
    throw new Error("检测到循环依赖，卡住的任务：" + stuck.join(", "));
  }

  // 转回任务对象
  return waves.map(w => w.map(id => tasks.find(t => t.id === id)));
}

// ---- 颗粒度校验 ----
// 判据：estPrompts <= 3 且 estLines <= 500 算合理
function checkGranularity(tasks) {
  const issues = [];
  for (const t of tasks) {
    if (t.estPrompts > 3) {
      issues.push({ id: t.id, name: t.name, reason: "预计 prompt 轮数 " + t.estPrompts + " > 3，建议拆细" });
    }
    if (t.estLines > 500) {
      issues.push({ id: t.id, name: t.name, reason: "预计代码行数 " + t.estLines + " > 500，建议拆细" });
    }
  }
  return issues;
}

// ---- 执行 ----
console.log("==== 任务拆解与排序报告 ====");
console.log("总子任务数:", TASKS.length);
console.log("");

// 颗粒度校验
const issues = checkGranularity(TASKS);
console.log("颗粒度校验：");
if (issues.length === 0) {
  console.log("  ✓ 所有子任务均在合理颗粒度内");
} else {
  for (const i of issues) {
    console.log("  ✗ " + i.id + " " + i.name + " — " + i.reason);
  }
}
console.log("");

// 拓扑排序
const waves = topoSortParallelGroups(TASKS);
console.log("执行波次（同波次可并行）：");
waves.forEach((w, idx) => {
  const totalPrompts = w.reduce((s, t) => s + t.estPrompts, 0);
  const totalLines = w.reduce((s, t) => s + t.estLines, 0);
  console.log("  波次 " + (idx + 1) + "（" + w.length + " 个任务，预计 " + totalPrompts + " 轮 prompt / " + totalLines + " 行代码）：");
  for (const t of w) {
    const deps = t.dependsOn.length > 0 ? "  ← 依赖 " + t.dependsOn.join(",") : "  ← 无依赖";
    console.log("    " + t.id.padEnd(4) + "[" + t.layer.padEnd(4) + "] " + t.name.padEnd(20) + deps);
  }
});

// 估算总工时（假设单轮 prompt 平均 3 分钟）
const totalPrompts = TASKS.reduce((s, t) => s + t.estPrompts, 0);
const totalLines = TASKS.reduce((s, t) => s + t.estLines, 0);
const maxWavePrompts = Math.max(...waves.map(w => w.reduce((s, t) => s + t.estPrompts, 0)));
console.log("");
console.log("工时估算：");
console.log("  串行总 prompt 轮数:", totalPrompts, "→ 约 " + (totalPrompts * 3) + " 分钟");
console.log("  并行后关键路径   :", maxWavePrompts * waves.length, "轮（乐观）→ 约 " + (maxWavePrompts * waves.length * 3) + " 分钟");
console.log("  总代码行数       :", totalLines);
console.log("");
console.log("✅ 拆解要点：");
console.log("  1. 颗粒度判据：单 PR / 单 prompt / 单文件（≤500 行）");
console.log("  2. 依赖排序用拓扑，同层并行省时间");
console.log("  3. 并行任务必须落不同文件，避免冲突");
console.log("  4. 子任务 prompt 要带前置上下文（前序产出）");
`
  },
  {
    id: "aiapp-tip-iterate",
    icon: "🔁",
    group: "AI编程实用技巧",
    title: "迭代精炼技巧",
    content: `
# 第33章：迭代精炼技巧

## 33.1 从草稿到生产的 5 步迭代法

新手用 AI 写代码最常见的失败模式是"一次定生死"——给 AI 一个 prompt，拿到代码就直接用，结果上线后一堆 bug。成熟的 AI 编程工作流是**多轮迭代**的，每一轮有明确的目标。经过大量实践，下面这个"5 步迭代法"被证明能稳定产出生产级代码：

**Step 1: 草稿（Draft）**——让 AI 快速产出第一版"能跑"的代码。这一步不追求完美，追求"快速建立可改的基线"。prompt 风格是开放式的："给我一个 X 的实现，先不考虑边界情况，重点是主干逻辑。"

**Step 2: 修正（Fix）**——把草稿里的明显问题挑出来让 AI 修。包括类型错误、逻辑 bug、缺失的边界处理、不兼容的 API。这一步是"补漏洞"，prompt 风格是清单式的："以下问题请逐个修复：1. xxx 2. xxx 3. xxx"。

**Step 3: 测试（Test）**——让 AI 写单元测试覆盖所有路径，包括正常路径、边界、异常。然后跑测试，把失败的测试反馈给 AI 修。这一步是"证伪"，prompt 风格是"为以下代码写测试，覆盖 X/Y/Z 场景，并解释每个测试断言什么"。

**Step 4: 重构（Refactor）**——在测试保护下让 AI 重构代码，提升可读性、消除重复、改善命名、拆长函数。这一步是"美化"，prompt 风格是"在保持测试通过的前提下，重构以下代码使其更符合 X 规范"。

**Step 5: 优化（Optimize）**——针对性能、安全、可观测性做最后一轮优化。包括 hot path 优化、SQL 索引、日志埋点、错误处理加固。这一步是"打磨"，prompt 风格是"分析以下代码的性能瓶颈，给出优化方案并实施"。

每一步的目标不同，prompt 风格不同，**千万不要在一轮里同时要求 AI 做多件事**——比如"写代码 + 修 bug + 加测试 + 重构 + 优化"全塞一个 prompt 里，结果一定是每件都做不好。

## 33.2 每一步的 prompt 模板

把 5 步法固化成可复用的 prompt 模板：

**草稿模板**：
\`\`\`text
任务：实现 [功能描述]
约束：用 [技术栈]，输出可直接运行的 [文件名]
要求：先不处理边界情况，重点把主干逻辑写通
输出：完整代码 + 5 行以内说明设计思路
\`\`\`

**修正模板**：
\`\`\`text
基于上一版代码，请修复以下问题（逐条对应）：
1. [问题描述，附上报错或期望行为]
2. [问题描述]
3. [问题描述]
约束：不要改动未提及的部分；每修一处请在代码里用 // FIX: 标注
输出：完整代码 + 修复对照表（问题→改了哪几行）
\`\`\`

**测试模板**：
\`\`\`text
为以下代码写单元测试，使用 [测试框架]。
覆盖路径：
  - 正常路径：[列举]
  - 边界情况：[列举]
  - 异常路径：[列举]
要求：每个测试有清晰的 describe/it 描述；用 given-when-then 风格
输出：测试代码 + 覆盖率自评（哪些路径已覆盖、哪些没覆盖）
\`\`\`

**重构模板**：
\`\`\`text
在保持现有测试通过的前提下，重构以下代码：
目标：
  - 函数长度 ≤ 30 行
  - 消除重复（DRY）
  - 改善命名（体现意图而非实现）
  - 提取纯函数便于测试
约束：不改变对外 API；不改变测试用例
输出：重构后代码 + 改动摘要（哪些函数被拆分/重命名）
\`\`\`

**优化模板**：
\`\`\`text
分析以下代码的性能与安全：
1. 找出 O(n²) 或更差的算法
2. 找出 N+1 查询
3. 找出未捕获的 Promise rejection
4. 找出潜在注入点
输出：问题清单 + 优化后代码 + 每项优化的预期收益
\`\`\`

## 33.3 何时该开新对话重置上下文

迭代不等于"在同一个对话里无限聊下去"。**对话越长，上下文越脏**——早期的错误尝试、被否决的方案、过期代码都还在上下文里，会污染 AI 的判断。什么时候该开新对话？

**信号一：AI 开始重复之前的错误**。你已经否决过方案 A 两次，第三次它又给你 A。这说明上下文里"否决 A"的信息被淹没了，新开对话最干净。

**信号二：AI 的回答开始跑偏**。你问的是 X，它给你讲 Y。这是上下文里某个旧话题在主导它的注意力，新开对话能切断这种串味。

**信号三：对话超过 20 轮**。20 轮是个经验阈值，超过后模型对早期内容的引用准确率明显下降。即使没出问题，也建议把"已稳定的结论"总结成一段，开新对话作为开场。

**信号四：换阶段**。从"实现"切到"测试"，从"重构"切到"优化"，都建议开新对话。每阶段的 prompt 风格和关注点不同，混在一起会让 AI 困惑。

开新对话时**一定要带"接力上下文"**——把上一对话的最终代码、关键决策、已知约束浓缩成一段贴到新对话开头。否则新对话的 AI 完全不知道前面发生了什么。

## 33.4 版本对照法

迭代过程中一个极其有用的技巧是**版本对照**：让 AI 同时看到"上一版"和"这一版"的差异，让它基于 diff 而不是基于完整代码做判断。这模拟了人类 code review 的方式。

版本对照的 prompt 模板：

\`\`\`text
以下是 v1 和 v2 两个版本的代码。请对比分析：
- v1（上一版）：[代码]
- v2（当前版）：[代码]

请回答：
1. v2 相对 v1 改了哪些地方？（按改动重要性排序）
2. 每个改动是 bug 修复、功能增强、还是重构？
3. 有没有"看起来是修复 A 但引入了 B"的回归？
4. v2 还遗留了 v1 的哪些问题？
5. 如果要出 v3，最该改的是哪 1~2 处？
\`\`\`

版本对照的威力在于它强迫 AI 做"差异思维"而不是"全量思维"。AI 在看完整代码时倾向于赞美现有方案，但在看 diff 时会更挑剔——因为它被引导去"找变化里的破绽"。

实际操作中，可以用 \`git diff\` 生成 diff 喂给 AI，比贴两份完整代码更省 token。

## 33.5 让 AI 自评 + A/B prompt 对比

**让 AI 自评**是低成本提升质量的技巧。在 AI 产出代码后，立刻追加一个 prompt 让它自评：

\`\`\`text
请用资深工程师视角审视你刚才写的代码，按以下维度打分（1~5）：
- 正确性：是否所有路径都正确？
- 可读性：新人接手能看懂吗？
- 可测试性：纯函数比例？依赖注入？
- 健壮性：边界、异常、并发？
- 性能：有没有明显低效？
然后给出"如果只能改一处，改哪里"。
\`\`\`

AI 的自评往往能挑出 30%~50% 的真实问题——不是因为它特别聪明，而是因为"评价"比"生成"更容易，让它在评价模式下重新看一遍自己的代码，等于多了一轮反思。

**A/B prompt 对比**用于"不确定哪个 prompt 风格更好"的场景。把同一个任务用两种 prompt 分别问 AI，对比产出质量。例如：

- A prompt："实现一个 rate limiter，用 Redis 计数。"
- B prompt："实现一个 rate limiter，要求：1) 用 Redis 的 INCR + EXPIRE 2) 每 IP 每分钟 60 次 3) 超额返回 429 + Retry-After 4) 单测覆盖并发场景"

对比两个产出的代码，你能直观看到"详细 prompt"的收益。A/B 对比做多了，你会形成对自己常见任务的"prompt 模板库"。

## 33.6 避免"满意陷阱"

"满意陷阱"指的是：你看到 AI 给的代码"看起来不错"，就停止迭代了，但实际上离生产可用还有距离。这是 AI 编程最隐蔽的坑——**AI 的代码天然看起来比实际好**，因为它命名规范、注释齐全、结构整齐，给人"很专业"的错觉。

避免满意陷阱的几个反直觉做法：

**做法一：让 AI 主动找自己的茬**。每次拿到代码后，第一反应不是"测试能不能跑"，而是问 AI "这段代码在生产环境会怎么挂？"。强迫它做"破坏性思考"。

**做法二：写"反测试"**。除了正常测试，让 AI 写"专门触发 bug"的测试——比如把时钟拨快、把数据库断开、把内存撑爆。反测试能暴露正常测试覆盖不到的脆弱点。

**做法三：让另一个 AI 会话 review**。开一个新对话，把代码贴进去让它 review，不告诉它这是 AI 写的。新会话没有"作者情感"，会更客观。这是"AI 互相 review"的小型版本。

**做法四：对照"生产 checklist"**。维护一份生产级代码的 checklist（如：日志、监控、降级、限流、重试、幂等、文档），每次迭代完逐项 check，缺一项不算完。

最根本的解法是**把"看起来不错"和"生产可用"分开看**。前者是审美判断，后者是工程判断。AI 编程的 5 步迭代法本质就是把"审美满意"和"工程满意"分开追求——草稿阶段追求审美上的"像样"，测试与优化阶段追求工程上的"扛得住"。

## 33.7 5 步迭代法详解 + 版本对照模板（详细）

把 5 步法落到一个具体例子上。假设任务：实现一个"带熔断的 HTTP 客户端"。

**Step 1 草稿**：prompt 给 AI，让它先出一个"能发请求 + 简单计数"的版本。AI 产出 80 行代码，能跑，但没考虑并发、没考虑超时、没考虑熔断恢复。这是草稿，能用但不完善。

**Step 2 修正**：人工 review 草稿，列出 5 个问题：1) 超时未处理；2) 计数器在并发下不安全；3) 熔断状态没持久化；4) 错误分类不清；5) 没有重试。让 AI 逐个修。修正后代码 150 行，逻辑完整。

**Step 3 测试**：让 AI 写测试，覆盖：正常请求、超时、熔断打开、熔断半开恢复、连续失败、并发 100 请求。跑测试发现 2 个失败（熔断恢复有 race condition），反馈给 AI 修。这一步后代码 + 测试共 400 行。

**Step 4 重构**：让 AI 在测试保护下重构，把"发请求""计数""熔断状态机"拆成三个类，提取"超时策略"为可注入参数。重构后代码 180 行，可读性显著提升，测试仍全绿。

**Step 5 优化**：让 AI 分析性能，发现计数器用了全局锁影响并发，改成分片计数；发现熔断状态查询每次都加锁，改成无锁读。优化后 QPS 提升 3 倍。

整个流程下来 5 步，每步 2~4 轮 prompt，总共约 15 轮。产出是生产级代码。**对比"一次 prompt 写完"的版本，5 步法的产出 bug 数低一个数量级**。

版本对照在这一流程里用两次：Step 2 之后对照 v1/v2 确认修复没引入回归；Step 4 之后对照 v3/v4 确认重构没改变行为。对照的 prompt 用前文给的模板即可。

最后强调：5 步法不是教条，是**默认流程**。简单任务可以合并步骤（如草稿+修正合一），紧急任务可以跳过（如先不上优化），但**测试这一步永远不能跳**。测试是迭代法的"安全网"，没有测试保护的迭代就是裸奔。
`,
    code: `// =============================================================
// 第33章示例：5 步迭代法工作流模拟器
// 给定一个任务，模拟 5 步迭代的执行计划与产出预估
// =============================================================

// ---- 5 步迭代法定义 ----
const ITERATION_STEPS = [
  {
    step: 1,
    name: "草稿",
    nameEn: "Draft",
    goal: "快速产出能跑的基线代码",
    promptStyle: "开放式，只要主干逻辑",
    outputFocus: "可运行 + 设计思路",
    estPrompts: [1, 2],
    codeGrowth: 1.0, // 相对系数
    riskLevel: "高（未经测试）",
  },
  {
    step: 2,
    name: "修正",
    nameEn: "Fix",
    goal: "修复明显 bug 与边界问题",
    promptStyle: "清单式，逐条对应",
    outputFocus: "完整代码 + 修复对照表",
    estPrompts: [2, 4],
    codeGrowth: 1.3,
    riskLevel: "中（逻辑完整但未验证）",
  },
  {
    step: 3,
    name: "测试",
    nameEn: "Test",
    goal: "写测试覆盖所有路径并跑通",
    promptStyle: "given-when-then，明确覆盖路径",
    outputFocus: "测试代码 + 覆盖率自评",
    estPrompts: [3, 5],
    codeGrowth: 2.0, // 加上测试代码
    riskLevel: "低（测试保护下）",
  },
  {
    step: 4,
    name: "重构",
    nameEn: "Refactor",
    goal: "在测试保护下提升可读性与结构",
    promptStyle: "目标明确，约束不改 API",
    outputFocus: "重构后代码 + 改动摘要",
    estPrompts: [2, 3],
    codeGrowth: 1.8, // 重构通常略减代码
    riskLevel: "低（测试兜底）",
  },
  {
    step: 5,
    name: "优化",
    nameEn: "Optimize",
    goal: "性能、安全、可观测性打磨",
    promptStyle: "分析 + 优化方案 + 实施",
    outputFocus: "优化后代码 + 收益说明",
    estPrompts: [2, 4],
    codeGrowth: 1.9,
    riskLevel: "中（性能改动易回归，需重跑测试）",
  },
];

// ---- 任务画像 ----
const TASKS = [
  { name: "Rate Limiter 中间件", baseLines: 80,  complexity: "中", skipOptimize: false },
  { name: "带熔断的 HTTP 客户端", baseLines: 150, complexity: "高", skipOptimize: false },
  { name: "工具函数 formatDate",   baseLines: 20,  complexity: "低", skipOptimize: true  }, // 简单任务跳过优化
  { name: "用户注册流程（全栈）", baseLines: 400, complexity: "高", skipOptimize: false },
];

// ---- 模拟迭代计划 ----
function planIteration(task) {
  const steps = [];
  let currentLines = task.baseLines;
  let totalPrompts = 0;
  const activeSteps = ITERATION_STEPS.filter(s => !(s.step === 5 && task.skipOptimize));

  for (const s of activeSteps) {
    const prompts = s.estPrompts[0] + Math.floor(Math.random() * (s.estPrompts[1] - s.estPrompts[0] + 1));
    const beforeLines = currentLines;
    currentLines = Math.round(currentLines * s.codeGrowth);
    steps.push({
      step: s.step,
      name: s.name,
      goal: s.goal,
      prompts,
      linesBefore: beforeLines,
      linesAfter: currentLines,
      linesDelta: currentLines - beforeLines,
      risk: s.riskLevel,
    });
    totalPrompts += prompts;
  }
  return { task: task.name, complexity: task.complexity, steps, totalPrompts, finalLines: currentLines };
}

// ---- 执行 ----
console.log("==== 5 步迭代法工作流模拟 ====");
console.log("");

const plans = TASKS.map(planIteration);

for (const p of plans) {
  console.log("任务：" + p.task + "（复杂度：" + p.complexity + "）");
  console.log("  步骤 | 名称   | prompt 轮数 | 代码行数变化        | 风险");
  console.log("  -----|--------|------------|---------------------|----------");
  for (const s of p.steps) {
    const delta = (s.linesDelta >= 0 ? "+" : "") + s.linesDelta;
    console.log(
      "  " + String(s.step).padEnd(4) + " | " +
      s.name.padEnd(6) + " | " +
      String(s.prompts).padEnd(10) + " | " +
      (s.linesBefore + " → " + s.linesAfter + " (" + delta + ")").padEnd(19) + " | " +
      s.risk
    );
  }
  console.log("  合计：约 " + p.totalPrompts + " 轮 prompt，最终 " + p.finalLines + " 行代码");
  console.log("");
}

// ---- 版本对照模板演示 ----
console.log("==== 版本对照 prompt 模板 ====");
console.log("");
console.log("适用时机：Step 2 之后（确认修复无回归）、Step 4 之后（确认重构未改行为）");
console.log("");
console.log("模板：");
console.log("  以下是 v1 和 v2 两个版本的代码，请对比分析：");
console.log("  - v1（上一版）：[贴代码或 git diff]");
console.log("  - v2（当前版）：[贴代码]");
console.log("  请回答：");
console.log("    1. v2 改了哪些地方？（按重要性排序）");
console.log("    2. 每个改动是 bug 修复 / 功能增强 / 重构？");
console.log("    3. 有没有'修 A 引入 B'的回归？");
console.log("    4. v2 还遗留了 v1 的哪些问题？");
console.log("    5. 如果出 v3，最该改的 1~2 处？");
console.log("");

// ---- 满意陷阱 checklist ----
console.log("==== 生产级 checklist（避免满意陷阱）====");
const PROD_CHECKLIST = [
  "日志：关键路径有 info，异常有 error，含 traceId",
  "监控：核心指标暴露（QPS / 延迟 / 错误率）",
  "降级：依赖失败时有兜底返回",
  "限流：入口有 rate limit",
  "重试：可重试操作有指数退避",
  "幂等：写操作可安全重试",
  "超时：所有外部调用有超时",
  "并发：共享状态有锁或无锁设计",
  "文档：API 有 JSDoc/TSDoc，复杂逻辑有注释",
  "测试：覆盖率 ≥ 80%，含异常路径",
];
PROD_CHECKLIST.forEach((item, i) => {
  console.log("  [ ] " + (i + 1) + ". " + item);
});
console.log("");
console.log("✅ 迭代要点：");
console.log("  1. 5 步：草稿 → 修正 → 测试 → 重构 → 优化");
console.log("  2. 每步只追求一个目标，不要混");
console.log("  3. 对话超 20 轮或换阶段就开新对话，带接力上下文");
console.log("  4. 用版本对照法做差异 review");
console.log("  5. 让 AI 自评 + A/B prompt 对比");
console.log("  6. 测试步骤永远不能跳");
`
  },
  {
    id: "aiapp-tip-readcode",
    icon: "📖",
    group: "AI编程实用技巧",
    title: "让 AI 读懂大代码库",
    content: `
# 第34章：让 AI 读懂大代码库

## 34.1 大型代码库的 AI 阅读策略

当代码库超过 10 万行（典型中型 SaaS 后端规模），直接把整个仓库喂给 AI 是不可行的——即使上下文窗口够（200K≈15 万行代码），效果也很差，因为模型在超大上下文下"中段遗忘"严重，而且成本爆炸。这时候需要的不是"硬塞"，而是"策略性阅读"。

大代码库的 AI 阅读有三条主路线：**目录结构概览法**（自顶向下）、**入口点追踪法**（自底向上）、**按模块分批喂入**（横向切片）。三者的核心差异在"先建立全局认知"还是"先建立局部深度"。实际操作中往往组合使用：先用概览法建立地图，再用入口点法聚焦关键路径，最后用分批法处理细节。

一个常见的误区是"AI 不需要理解全局，只要改对地方就行"。这在 1000 行的小项目里成立，但在 10 万行的代码库里，不理解全局的"局部修改"几乎一定违反架构约定——比如该走 service 层的硬塞进 controller、该用现有 util 的重新造一个。**理解全局是为了让局部修改"对得上"既有架构**。

另一个误区是"用最强模型一次读完"。Claude Opus 4 + 1M 窗口理论上能一次读 70 万行代码，但实测显示：在 50 万 token 以上的上下文里，模型对具体函数的引用准确率会从 95% 降到 70% 以下。**模型能读 ≠ 模型能用**，分批喂入的 30K 上下文效果通常优于一次塞满的 500K。

## 34.2 目录结构概览法

最简单的起步方法：把目录树喂给 AI，让它建立全局认知。

第一步：生成目录树。用 \`tree -L 3 -I 'node_modules|.git|dist'\` 生成 3 层目录树（排除噪音），通常 100~300 行。这个量级正好能塞进 prompt。

第二步：让 AI 解读。prompt 风格：

\`\`\`text
这是一个 Next.js 项目的目录树（3 层）。请基于结构推断：
1. 这是什么类型的应用？（SSR / SPA / 混合）
2. 推测各顶层目录的职责
3. 找出可能的"异味"（如 utils 和 lib 重复、tests 散落各处）
4. 如果要加一个 [新功能]，最可能改哪些目录？

目录树：
[贴 tree 输出]
\`\`\`

第三步：让 AI 输出"代码地图"。代码地图是结构化的项目摘要，包括：模块清单、模块职责、模块间依赖、关键文件。这份地图后续可以作为"项目上下文"长期复用——每次新对话开头贴一段地图，比让 AI 重新读目录快得多。

目录结构概览法的优点是快、便宜（一次调用），缺点是**只能建立静态认知**，对运行时行为（如哪个函数被高频调用、哪个 service 是性能瓶颈）一无所知。所以概览法是"第一步"而不是"全部"。

## 34.3 入口点追踪法

入口点追踪法模拟"新人接手项目"的阅读方式：从程序入口（main / index / app router）开始，沿着调用链一路追下去，理解核心流程。

第一步：找入口点。Web 应用入口通常是 \`app/layout.tsx\` / \`pages/_app.tsx\` / \`src/main.ts\` / \`server.ts\`。API 入口是路由文件。CLI 入口是 \`bin/index.js\`。

第二步：让 AI 沿调用链展开。prompt 风格：

\`\`\`text
这是入口文件 [文件名] 的内容。请：
1. 列出它直接调用的所有函数/模块
2. 对每个调用，标注"看起来在做什么"
3. 标注哪些调用是"核心流程"（必经路径），哪些是"辅助"（如日志、监控）
4. 挑出 3 个最值得继续追下去的调用点

入口文件内容：
[贴文件]
\`\`\`

第三步：递归。对 AI 标注的"最值得追"的调用点，把对应文件喂进去，重复第二步。通常追 3~5 层就能覆盖核心流程。

入口点追踪法的优点是**聚焦核心路径**，能快速理解"这个程序到底在干什么"。缺点是**容易陷入一条链**，忽略并行的其他流程。补救办法：每追一层都让 AI 标注"还有哪些兄弟入口没追"，最后做一次"横向补齐"。

## 34.4 按模块分批喂入

当代码库实在太大、入口点也追不完时，按模块横向切片是最务实的方法。

第一步：模块划分。按目录或按业务域把代码库切成 5~20 个模块，每个模块 5K~20K 行。模块划分可以参考目录结构（如 \`src/auth/\`、\`src/payment/\`）或代码Ownership（CODEOWNERS 文件）。

第二步：每个模块独立喂入。每个模块开一个新对话，prompt 风格：

\`\`\`text
这是项目的 [模块名] 模块，包含以下文件：
[贴模块内所有文件，或用 @folder 引用]

请产出"模块摘要"：
1. 这个模块的职责（一句话）
2. 对外暴露的 API / 函数 / 类型
3. 依赖的其他模块
4. 关键内部实现（3~5 个核心函数）
5. 已知的坑 / TODO / 技术债
\`\`\`

第三步：综合。把所有模块摘要合并喂给 AI，让它产出"全局架构图"——模块关系、数据流、核心抽象。这一步可以用更便宜的模型（如 Haiku）做综合，省成本。

分批喂入的关键是**模块摘要的格式统一**。如果每个模块的摘要格式不一样，综合阶段 AI 会很难处理。建议用固定模板（如上面的 5 项），所有模块都按这个模板产出。

## 34.5 IDE 集成能力：@workspace / @project / @codebase

主流 AI 编程 IDE（Cursor、Windsurf、Copilot）提供了"全工作区检索"能力，底层是 RAG（检索增强生成）。这些能力比手动分批喂入更高效，因为工具会自动做语义检索，把"最相关的 N 个片段"喂给模型。

| 工具 | 语法 | 底层机制 | 适用场景 |
| --- | --- | --- | --- |
| Cursor | \`@codebase\` 或 Ctrl+Enter | 向量检索 + 关键词混合 | 不确定相关代码在哪时 |
| GitHub Copilot Chat | \`@workspace\` | 本地索引 + 语义检索 | VS Code 内问整个工作区 |
| Windsurf | \`@codebase\` | 类似 Cursor | 全工作区问答 |
| Claude Code | 直接在仓库里对话 | 自动检索 + 文件读写 | 终端 Agent 式开发 |

这些能力的共同点是：**你不需要手动决定喂什么，工具替你决定**。但"工具替你决定"不等于"工具决定得对"，所以仍要：

1. **看工具引用了哪些文件**——大多数工具会展示"基于以下文件回答"，检查这个列表是否合理。如果工具引用了 10 个文件但漏了显然相关的那个，要手动 @file 补上。
2. **问"为什么不引用 X"**——如果工具没引用某个你预期会相关的文件，直接问它"为什么没看 X.ts？",有时候是索引没更新，有时候是检索策略问题。
3. **定期重建索引**——大改动后索引可能滞后，导致检索结果过期。Cursor / Copilot 都有"重建索引"选项。

## 34.6 生成代码地图（Codebase Map）

Codebase Map 是 Aider 提出的概念，后来被很多工具借鉴。它的核心思想是：**给 AI 一份"代码库摘要"而不是"代码库全文"**，让 AI 基于摘要做决策，只在需要时才深入读具体文件。

一份典型的 Codebase Map 长这样：

\`\`\`text
## 项目：my-saas-app

### 技术栈
Next.js 15 (App Router) + TypeScript + Prisma + PostgreSQL + Redis

### 顶层目录
- app/          路由与页面（42 个文件）
- lib/          共享工具（18 个文件）
- services/     业务逻辑层（24 个文件）
- prisma/       数据库 schema 与 migration
- components/   React 组件（56 个文件）
- tests/        测试

### 核心模块
- services/auth/     认证（JWT + Redis session）
  - 关键文件: auth.service.ts (核心), jwt.ts (token 工具), session.ts (会话)
  - 对外: AuthService.login() / .logout() / .verify()
- services/payment/  支付（Stripe 集成）
  - 关键文件: payment.service.ts, webhook.ts
  - 对外: PaymentService.charge() / .refund()

### 数据流
HTTP 请求 → app/api/*/route.ts → services/* → prisma → PostgreSQL
                                          ↘ Redis (session/cache)

### 关键约定
- 所有 service 函数返回 Promise<Result<T, E>>，不抛异常
- 所有 API 路由必须经过 withAuth 中间件
- 所有 SQL 走 Prisma，禁止裸 SQL
\`\`\`

生成 Codebase Map 有两种方式：**手动**（人类写，最准但慢）和**AI 生成**（用前述三法综合，快但需校对）。最佳实践是首次用 AI 生成草稿，人工校对后存档，之后每次大改动后更新。

Codebase Map 的价值在于**复用**。一份好的地图可以服务几十次 AI 对话——每次开新对话，开头贴一段地图，AI 立刻有了全局认知，不需要重新读目录。这比每次让 AI 现读现猜效率高一个数量级。

## 34.7 RAG 工具：Sourcegraph Cody / Aider Repo Map

专门的"代码库 RAG"工具比通用 IDE 的检索更强，适合超大型代码库（100 万行+）。

**Sourcegraph Cody**：基于 Sourcegraph 的代码搜索引擎，能在大代码库里做精准的符号级检索。Cody 的优势是检索质量高（毕竟 Sourcegraph 本身就是代码搜索起家），缺点是依赖 Sourcegraph 实例，对小项目过重。

**Aider Repo Map**：Aider 是开源的终端 AI 编程工具，它的 Repo Map 功能会基于 tree-sitter 解析整个仓库，生成"符号级摘要"（所有类/函数的签名 + 关系），自动塞进每次对话的上下文。Repo Map 的聪明之处在于它会**根据当前任务动态裁剪**——你改 auth 模块时，地图里 auth 模块的符号更详细，其他模块只保留签名。

**Claude Code 的内置检索**：Claude Code 在仓库里运行时会自动做语义检索，不需要显式 @ 引用。它的检索质量介于通用 IDE 和 Aider 之间，胜在"零配置"——开箱即用。

**GitHub Copilot 的 workspace 检索**：基于 GitHub 的代码搜索基础设施，对 monorepo 友好，但对私有仓库的索引速度较慢。

选型建议：**< 10 万行用 IDE 内置即可；10~100 万行上 Aider Repo Map；> 100 万行考虑 Sourcegraph Cody**。但工具只是放大器，前面三法（概览/入口/分批）的方法论永远适用——再强的工具也救不了"无脑硬塞"的用法。

## 34.8 三种代码库阅读方法对比 + Codebase Map 详解（详细）

把三种方法做一个对比表：

| 维度 | 目录结构概览法 | 入口点追踪法 | 按模块分批喂入 |
| --- | --- | --- | --- |
| 方向 | 自顶向下 | 自底向上 | 横向切片 |
| 起步成本 | 低（一次 tree + 一次 AI） | 中（要找入口、递归追） | 高（要切模块、多次喂入） |
| 建立认知速度 | 快（5 分钟有全局印象） | 中（30 分钟追清核心链路） | 慢（数小时覆盖所有模块） |
| 认知深度 | 浅（只知结构不知实现） | 深（核心路径吃得透） | 中（每个模块中等深度） |
| 适用阶段 | 接手项目第一小时 | 要改核心功能时 | 要做大重构时 |
| 主要风险 | 误判目录职责 | 陷入单链忽略兄弟 | 模块边界划错 |
| 最佳搭配 | 后接 Codebase Map | 后接分批喂入补齐 | 前置 Codebase Map |

**推荐组合流程**（10 万行代码库，4 小时接手）：

- 0~30 分钟：目录结构概览法 + 生成 Codebase Map 草稿
- 30~120 分钟：入口点追踪法，追 3~5 条核心链路（如登录、下单、支付）
- 120~180 分钟：人工校对 Codebase Map，补充模块职责与约定
- 180~240 分钟：按模块分批喂入，对要改的模块做深度理解

**Codebase Map 详解**：一份合格的 Codebase Map 必须包含 6 个要素——技术栈与版本、目录职责、核心模块清单（含对外 API）、模块间依赖关系、数据流、关键约定。前 5 个是"事实"，第 6 个是"规范"，规范部分最值钱——因为它告诉 AI"在这个项目里不该怎么做"，能避免大量风格不一致的修改。

Codebase Map 的维护是个轻量级工作。建议把它放在仓库根目录的 \`CODEBASE.md\`，每次大改动后顺手更新。AI 工具（如 Claude Code）可以配置成"每次对话开头自动读 CODEBASE.md"，让所有对话都自带全局认知，省去重复喂目录的成本。

最后一句：**让 AI 读懂大代码库的本质，是替 AI 做好"先看哪、再看哪"的决策**。模型本身没有"阅读策略"，它只会无差别地处理你给的所有上下文。你给的策略越好，它的理解越准。这也是为什么"会读代码的工程师 + AI"远胜于"不会读代码的工程师 + AI"——前者知道该让 AI 看什么，后者只会把整个仓库丢过去。
`,
    code: `// =============================================================
// 第34章示例：代码库阅读策略对比与 Codebase Map 生成器
// 输入一个模拟的代码库结构，对比 3 种阅读方法，并生成 Codebase Map
// =============================================================

// ---- 模拟一个 10 万行代码库的结构 ----
const REPO = {
  name: "my-saas-app",
  stack: ["Next.js 15 (App Router)", "TypeScript", "Prisma", "PostgreSQL", "Redis"],
  totalLines: 98400,
  totalFiles: 187,
  topDirs: [
    { name: "app/",         files: 42, lines: 18400, desc: "路由与页面" },
    { name: "lib/",         files: 18, lines: 6200,  desc: "共享工具" },
    { name: "services/",    files: 24, lines: 21600, desc: "业务逻辑层" },
    { name: "components/",  files: 56, lines: 22800, desc: "React 组件" },
    { name: "prisma/",      files: 8,  lines: 1200,  desc: "数据库 schema" },
    { name: "tests/",       files: 31, lines: 18200, desc: "测试" },
    { name: "public/",      files: 8,  lines: 0,     desc: "静态资源" },
  ],
  modules: [
    {
      name: "services/auth/",
      files: 5,
      lines: 3200,
      keyFiles: ["auth.service.ts", "jwt.ts", "session.ts"],
      publicAPI: ["AuthService.login()", "AuthService.logout()", "AuthService.verify()"],
      dependsOn: ["lib/db", "lib/redis"],
    },
    {
      name: "services/payment/",
      files: 6,
      lines: 4800,
      keyFiles: ["payment.service.ts", "webhook.ts", "stripe.ts"],
      publicAPI: ["PaymentService.charge()", "PaymentService.refund()"],
      dependsOn: ["lib/db", "services/auth"],
    },
    {
      name: "services/order/",
      files: 7,
      lines: 5600,
      keyFiles: ["order.service.ts", "order.query.ts"],
      publicAPI: ["OrderService.create()", "OrderService.list()", "OrderService.cancel()"],
      dependsOn: ["lib/db", "services/payment", "services/auth"],
    },
  ],
  entryPoints: [
    { file: "app/layout.tsx",      type: "前端入口", chains: 4 },
    { file: "app/api/*/route.ts",  type: "API 入口",  chains: 6 },
    { file: "server.ts",           type: "服务启动",  chains: 3 },
  ],
  conventions: [
    "所有 service 函数返回 Promise<Result<T, E>>，不抛异常",
    "所有 API 路由必须经过 withAuth 中间件",
    "所有 SQL 走 Prisma，禁止裸 SQL",
    "组件用函数式 + hooks，不用 class",
  ],
};

// ---- 3 种阅读方法对比 ----
const METHODS = [
  {
    name: "目录结构概览法",
    direction: "自顶向下",
    setupCost: "低（1 次 tree + 1 次 AI 调用）",
    speed: "快（5 分钟有全局印象）",
    depth: "浅（结构清楚，实现不知）",
    bestFor: "接手项目第一小时",
    risk: "误判目录职责",
    tokensUsed: Math.round(REPO.totalLines * 0.02), // 约 2% 代码量
  },
  {
    name: "入口点追踪法",
    direction: "自底向上",
    setupCost: "中（找入口 + 递归追 3~5 层）",
    speed: "中（30 分钟追清核心链路）",
    depth: "深（核心路径吃得透）",
    bestFor: "改核心功能前",
    risk: "陷入单链忽略兄弟流程",
    tokensUsed: Math.round(REPO.totalLines * 0.08), // 约 8% 代码量
  },
  {
    name: "按模块分批喂入",
    direction: "横向切片",
    setupCost: "高（切模块 + 多次喂入 + 综合）",
    speed: "慢（数小时覆盖所有模块）",
    depth: "中（每模块中等深度）",
    bestFor: "大重构前",
    risk: "模块边界划错",
    tokensUsed: Math.round(REPO.totalLines * 0.30), // 约 30% 代码量
  },
];

// ---- 生成 Codebase Map ----
function generateCodebaseMap(repo) {
  const lines = [];
  lines.push("## 项目：" + repo.name);
  lines.push("");
  lines.push("### 技术栈");
  lines.push(repo.stack.join(" + "));
  lines.push("");
  lines.push("### 规模");
  lines.push(repo.totalLines + " 行 / " + repo.totalFiles + " 个文件");
  lines.push("");
  lines.push("### 顶层目录");
  for (const d of repo.topDirs) {
    if (d.lines > 0) {
      lines.push("- " + d.name.padEnd(14) + d.files + " 文件 / " + d.lines + " 行  " + d.desc);
    } else {
      lines.push("- " + d.name.padEnd(14) + d.files + " 文件  " + d.desc);
    }
  }
  lines.push("");
  lines.push("### 核心模块");
  for (const m of repo.modules) {
    lines.push("- " + m.name + " (" + m.lines + " 行)");
    lines.push("  - 关键文件: " + m.keyFiles.join(", "));
    lines.push("  - 对外 API: " + m.publicAPI.join(" / "));
    lines.push("  - 依赖: " + m.dependsOn.join(", "));
  }
  lines.push("");
  lines.push("### 入口点");
  for (const e of repo.entryPoints) {
    lines.push("- " + e.file + " (" + e.type + ", 调用链深度 " + e.chains + ")");
  }
  lines.push("");
  lines.push("### 关键约定");
  for (const c of repo.conventions) {
    lines.push("- " + c);
  }
  return lines.join("\\n");
}

// ---- 执行 ----
console.log("==== 大代码库 AI 阅读策略报告 ====");
console.log("仓库：" + REPO.name + "（" + REPO.totalLines + " 行 / " + REPO.totalFiles + " 文件）");
console.log("");

console.log("三种阅读方法对比：");
console.log("  方法             | 方向       | 起步成本          | 速度            | 深度            | tokens 估算");
console.log("  -----------------|------------|-------------------|-----------------|-----------------|------------");
for (const m of METHODS) {
  console.log(
    "  " + m.name.padEnd(16) + " | " +
    m.direction.padEnd(10) + " | " +
    m.setupCost.padEnd(17) + " | " +
    m.speed.padEnd(15) + " | " +
    m.depth.padEnd(15) + " | " +
    m.tokensUsed + " tokens"
  );
}
console.log("");
console.log("推荐组合流程（4 小时接手）：");
console.log("  0~30 min   : 目录结构概览法 + 生成 Codebase Map 草稿");
console.log("  30~120 min : 入口点追踪法，追 3~5 条核心链路");
console.log("  120~180 min: 人工校对 Codebase Map");
console.log("  180~240 min: 按模块分批喂入，深度理解要改的模块");
console.log("");

console.log("==== 生成的 Codebase Map ====");
console.log(generateCodebaseMap(REPO));
console.log("");

console.log("✅ 大代码库阅读要点：");
console.log("  1. 三法组合：概览建图 → 入口追链 → 分批补齐");
console.log("  2. Codebase Map 是复用利器，存到 CODEBASE.md 长期维护");
console.log("  3. IDE @codebase 适合 < 10 万行；Aider Repo Map 适合 10~100 万行");
console.log("  4. 模型能读 ≠ 模型能用，分批 30K 优于一次塞 500K");
`
  },
  {
    id: "aiapp-tip-git",
    icon: "🌿",
    group: "AI编程实用技巧",
    title: "AI 辅助 Git/PR/CR",
    content: `
# 第35章：AI 辅助 Git/PR/CR

## 35.1 让 AI 生成 Commit Message

写 Commit Message 是开发日常里最被嫌弃的活——明明改了代码却还要花心思写"为什么改"。这件事恰好是 AI 最擅长的：给它 diff，让它产出规范的 commit message。又快又稳，还能强制规范。

业界主流的 commit message 规范是 **Conventional Commits**（约定式提交）。它的格式是：

\`\`\`text
<type>(<scope>): <subject>

<body>

<footer>
\`\`\`

其中 type 必须是以下之一：feat（新功能）、fix（bug 修复）、docs（文档）、style（格式）、refactor（重构）、perf（性能）、test（测试）、chore（杂项）、ci（CI 配置）、build（构建）。scope 是可选的影响范围。subject 是祈使句、不超过 50 字。body 解释"为什么"而不是"做了什么"。footer 用于标注 breaking change 或关联 issue。

让 AI 生成 commit message 的 prompt：

\`\`\`text
以下是 git diff。请按 Conventional Commits 规范生成 commit message。
要求：
1. type 必须准确（feat/fix/refactor/perf/test/docs/chore/ci/build）
2. scope 用模块名（如 auth, payment, ui）
3. subject 一行，祈使句，≤50 字
4. body 解释为什么改、改了什么影响，每行 ≤72 字
5. 如有 breaking change，footer 标注 BREAKING CHANGE:
6. 如关联 issue，footer 标注 Closes #123

git diff:
\`\`\`diff
[贴 git diff 输出]
\`\`\`
\`\`\`

实操技巧：用 \`git diff --staged\` 只看暂存区，避免把未暂存的改动混进来。Aider / Claude Code 这类工具能自动读 git 状态，不需要手动复制 diff。

一个常见坑：AI 倾向于把所有改动都标成 \`feat\`。要在 prompt 里强调"只有用户可见的新功能才是 feat，内部重构是 refactor，bug 修复是 fix"。加几个 few-shot 例子效果更好。

## 35.2 让 AI 生成 PR 描述

PR 描述是 code review 的"门面"。一份好的 PR 描述能让 reviewer 5 分钟理解你要干什么、为什么、怎么干、风险在哪。AI 生成 PR 描述比生成 commit message 更有价值，因为 PR 描述更长、结构更复杂，人工写更费时。

PR 描述的标准模板包含四个部分：**Motivation**（为什么做）、**Changes**（改了什么）、**Checklist**（自检清单）、**Risk & Rollback**（风险与回滚）。

让 AI 生成 PR 描述的 prompt：

\`\`\`text
以下是本次 PR 的所有 commit 与整体 diff 统计。请生成 PR 描述。

模板：
## Motivation
- 为什么要做这个改动？（业务/技术背景）
- 解决什么问题？

## Changes
- 主要改动点（按重要性排序，每点 1~2 句）
- 涉及的模块/文件

## Checklist
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 手动验证了 [核心场景]
- [ ] 更新了相关文档
- [ ] 没有引入新的依赖（或已评估）
- [ ] Breaking change 已标注

## Risk & Rollback
- 主要风险点
- 回滚方案（revert / feature flag / db migration 回滚）

输入：
- commits: [贴 git log main..HEAD --oneline]
- diff stat: [贴 git diff main...HEAD --stat]
- 关键 diff: [贴核心文件的 diff]
\`\`\`

注意"关键 diff"这一项——不要把整个 PR 的 diff 都贴进去（可能几万行），只贴核心文件的 diff。AI 能从 commit message + diff stat 推断整体改动，结合核心 diff 写出准确描述。

## 35.3 让 AI 做 Code Review

AI 做 code review 是 2025 年之后逐渐成熟的能力。GitHub Copilot、CodeRabbit、Cursor 都内置了 PR review 功能，能在 PR 创建后自动评论。AI review 的价值不是"取代人"，而是"做第一遍过滤"——把明显的风格问题、潜在 bug、缺失的测试挑出来，让人 reviewer 聚焦在架构和业务逻辑上。

让 AI 做 code review 的 prompt：

\`\`\`text
你是一位严格的 senior 工程师，请 review 以下 PR diff。

评论规范：
1. 每条评论必须指明文件 + 行号
2. 分级：🔴 阻塞（必须改）/ 🟡 建议（建议改）/ 🔵 提问（需澄清）/ 🟢 称赞（写得好）
3. 评论聚焦：
   - 正确性：逻辑 bug、边界、并发
   - 可读性：命名、复杂度、注释
   - 可测试性：是否便于测试、测试是否覆盖
   - 安全性：注入、权限、敏感信息
   - 性能：N+1、O(n²)、不必要的同步
4. 不要评论风格细节（交给 linter）
5. 最多 10 条评论，按重要性排序

PR diff:
[贴 diff]

相关上下文：
- 项目约定：[贴 CODEBASE.md 摘要]
- 关联 PR/Issue：[可选]
\`\`\`

AI review 的常见问题：**评论过于琐碎**（挑一堆 linter 能查的事）、**评论过于保守**（任何不熟悉的写法都标阻塞）、**漏掉跨文件问题**（只看单文件 diff，没意识到 A 文件改动破坏了 B 文件的假设）。对策：在 prompt 里强调"只评论 linter 查不到的问题"和"关注跨文件一致性"。

## 35.4 让 AI 写 Release Notes

Release notes 是面向用户的"版本变更说明"，写法与 commit message 完全不同——commit message 给开发者看，release notes 给用户看。AI 写 release notes 的关键是**把技术语言翻译成用户语言**。

Release notes 的标准结构：**Highlights**（最重要的 1~3 个变化）、**New Features**（新功能）、**Improvements**（改进）、**Bug Fixes**（修复）、**Breaking Changes**（不兼容变更）、**Deprecations**（即将废弃）。

让 AI 写 release notes 的 prompt：

\`\`\`text
以下是本次版本（vX.Y.Z）的所有 commit。请生成 release notes。

要求：
1. 用用户视角，不用开发者视角（"新增了导出 PDF 功能" 而不是 "add export-pdf.ts"）
2. 每条 1~2 句，说明"能干什么"而非"改了什么"
3. Breaking Changes 必须醒目，附迁移指南
4. 按 Highlights / New Features / Improvements / Bug Fixes / Breaking Changes / Deprecations 分组
5. 语气友好但专业

输入：
- 版本号：vX.Y.Z
- commits（自上个版本以来）：
[贴 git log vPrev..HEAD --oneline]
- 上一版 release notes（参考风格）：
[贴上次的 release notes]
\`\`\`

参考上一版 release notes 的风格很重要——能让 AI 保持一致的语气和详细度。

## 35.5 让 AI 处理 Merge Conflict

Merge conflict 是 git 工作流里最烦人的环节，尤其是大重构后的 conflict，几百个文件冲突看着头大。AI 处理 conflict 的能力在 2026 年已经相当可靠，但仍需人工 review。

让 AI 处理 conflict 的 prompt：

\`\`\`text
以下是某个文件的 merge conflict。请解决冲突，输出合并后的完整文件。

规则：
1. 优先保留双方意图，不要简单选一边
2. 如果双方改了同一处的不同方面，尝试合并两边的改动
3. 如果双方改了同一处的同一方面且冲突，选择更符合 [项目约定] 的一方，并说明理由
4. 输出后请标注：合并策略（保留双方 / 选 ours / 选 theirs / 手动综合）+ 理由

文件路径：src/auth/service.ts

冲突内容：
[贴带 <<<<<<< ======= >>>>>>> 的文件]
\`\`\`

关键约束：**AI 解决 conflict 后必须跑测试**。Conflict 解决的错误往往是隐性的——代码能跑但行为变了。测试是兜底。另外，**不要让 AI 一次处理太多文件的 conflict**，一次 5~10 个文件为限，否则上下文太长 AI 会顾此失彼。

Claude Code / Aider 这类 Agent 工具能直接在终端里跑 \`git merge\`、看 conflict、改文件、跑测试，整个 conflict 解决流程可以半自动化。但仍建议人工 review 关键文件的合并结果。

## 35.6 让 AI 生成 CHANGELOG

CHANGELOG 与 release notes 不同：release notes 是单次版本的公告，CHANGELOG 是所有版本的累积日志。CHANGELOG 通常按版本倒序排列，每个版本下列出变化。

让 AI 生成/更新 CHANGELOG 的 prompt：

\`\`\`text
请更新 CHANGELOG.md，在文件顶部插入新版本 vX.Y.Z 的条目。

格式遵循 Keep a Changelog 规范：
## [vX.Y.Z] - YYYY-MM-DD
### Added
- ...
### Changed
- ...
### Deprecated
- ...
### Removed
- ...
### Fixed
- ...
### Security
- ...

输入：
- 新版本 commits: [贴 git log]
- 现有 CHANGELOG.md: [贴现有内容前 50 行]

要求：
1. 每条用过去时态（"Added" 而非 "Add"）
2. 每条说明用户视角的变化
3. 链接到对应的 PR/issue（如有）
\`\`\`

## 35.7 Aider / Claude Code 的自动提交机制

Aider 和 Claude Code 这类 Agent 工具的杀手锏之一是"自动提交"——每完成一个有意义的改动就自动 commit，不需要人工 \`git add && git commit\`。

**Aider 的自动提交**：默认开启，每轮对话后自动 commit。commit message 由 AI 基于改动生成，遵循 Conventional Commits。Aider 还会自动生成"undo commit"——每条 commit 都带一个对应的 revert commit，方便回滚。配置项 \`--auto-commits\` / \`--no-auto-commits\` 控制开关。

**Claude Code 的自动提交**：在 Agent 模式下，Claude Code 会按"完成一个子任务就 commit"的策略自动提交。commit message 同样由 AI 生成。用户可以用 \`/undo\` 撤销最近的自动 commit。

**Cursor 的自动提交**：默认不开启，需手动配置。Cursor 更倾向于"AI 写代码，人决定何时 commit"的半自动模式。

自动提交的利弊：

| 维度 | 自动提交 ON | 自动提交 OFF |
| --- | --- | --- |
| 速度 | 快（无需手动 commit） | 慢（每步要手动） |
| Commit 粒度 | 细（每步一个 commit） | 由人决定（通常更粗） |
| 回滚精度 | 高（细粒度 revert） | 低 |
| 历史可读性 | 碎片化（几十个"WIP" commit） | 整洁 |
| 协作友好度 | 低（直接 push 会污染主分支） | 高 |

最佳实践：**本地开发开启自动提交，push 前用 interactive rebase 整理 commit 历史**。这样既享受了自动提交的回滚精度，又保持了远端历史的整洁。

## 35.8 Conventional Commits / PR / CR 模板（详细）

把三套模板做一个详细汇总，可以直接复制使用。

**Conventional Commits 模板**：

\`\`\`text
<type>(<scope>): <subject>

<body 每行 ≤72 字>

<footer>

# type 可选值
feat     新功能
fix      bug 修复
docs     文档变更
style    代码格式（不影响功能）
refactor 重构（既不是 feat 也不是 fix）
perf     性能优化
test     测试相关
build    构建系统或依赖
ci       CI 配置
chore    杂项（不修改 src 也不改 test）

# scope 例子
auth, payment, order, ui, api, db

# subject 规则
- 祈使句："add" 而非 "added"
- 不超过 50 字
- 不加句号
- 小写开头

# body 规则
- 解释"为什么"而非"做了什么"（diff 已经说明做了什么）
- 每行 ≤72 字
- 可以用 - 列表

# footer 规则
- BREAKING CHANGE: <描述> + 迁移指南
- Closes #123 / Refs #456

# 完整例子
feat(payment): support refund partial amount

Previously refund only supported full amount. Merchants requested
partial refund for handling returns and exchanges.

- Add amount field to RefundRequest
- Validate amount ≤ original charge
- Update Stripe API call to use amount param

BREAKING CHANGE: RefundRequest.amount is now required (was optional)
Migration: pass the full charge amount to preserve old behavior

Closes #284
\`\`\`

**PR 描述模板**：

\`\`\`text
## Motivation
<!-- 为什么做这个改动？业务/技术背景 -->
- 业务背景：[问题或机会]
- 技术背景：[现有实现的局限]

## Changes
<!-- 改了什么？按重要性排序 -->
1. [主要改动 1] — [一句话说明]
2. [主要改动 2] — [一句话说明]
3. ...

## Type
- [ ] Feature（新功能）
- [ ] Bug Fix（修复）
- [ ] Refactor（重构）
- [ ] Performance（性能）
- [ ] Docs（文档）
- [ ] Test（测试）
- [ ] Chore（杂项）

## Checklist
- [ ] 代码已自测
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 新增了对应测试
- [ ] 文档已更新
- [ ] Breaking change 已在 Changes 标注
- [ ] 迁移指南已附（如有 breaking change）

## Risk & Rollback
- 风险点：[可能出问题的场景]
- 回滚方案：[revert PR / feature flag / db migration down]
- 监控指标：[上线后看什么指标判断是否正常]

## Screenshots / Demo
<!-- 如有 UI 改动，贴截图或录屏 -->

## Related
- Issue: #
- Design doc: [链接]
- 依赖的 PR: #
\`\`\`

**Code Review 评论模板**：

\`\`\`text
<!-- 每条评论用以下格式 -->

### [🔴 阻塞 / 🟡 建议 / 🔵 提问 / 🟢 称赞] 评论标题

**位置**：\`src/xxx.ts:行号\`
**类型**：[正确性 / 可读性 / 可测试性 / 安全 / 性能 / 架构]

**问题**：
[描述问题，附代码片段]

**建议**：
[给出修改建议，附代码片段]

**理由**：
[为什么这么改更好]
\`\`\`

CR 评论的核心原则：**对事不对人**、**给建议而非纯批评**、**说明为什么**。AI review 容易犯的错是"只指出问题不给建议"，在 prompt 里强调"每条评论必须给可执行的建议"。

最后总结：AI 辅助 Git/PR/CR 的本质是**把"流程性写作"自动化**，让人聚焦在"判断性思考"上。commit message、PR 描述、release notes 这些东西，写起来烦但必须有，AI 接手后人的精力能放在架构决策和业务理解上——那才是 review 真正的价值所在。
`,
    code: `// =============================================================
// 第35章示例：AI 辅助 Git 工作流模拟器
// 演示 commit message / PR 描述 / CR 评论 / release notes 的模板生成
// =============================================================

// ---- 模拟一个 PR 的改动 ----
const PR = {
  branch: "feature/refund-partial",
  baseBranch: "main",
  version: "v2.4.0",
  prevVersion: "v2.3.0",
  commits: [
    { hash: "a1b2c3d", message: "add RefundRequest.amount field" },
    { hash: "e4f5g6h", message: "validate refund amount <= charge" },
    { hash: "i7j8k9l", message: "update stripe call to pass amount" },
    { hash: "m0n1o2p", message: "add tests for partial refund" },
    { hash: "q3r4s5t", message: "update API docs for amount field" },
  ],
  diffStat: [
    { file: "src/payment/refund.ts",        additions: 28, deletions: 4 },
    { file: "src/payment/stripe.ts",        additions: 12, deletions: 2 },
    { file: "src/types/refund.ts",          additions: 3,  deletions: 1 },
    { file: "tests/payment/refund.test.ts", additions: 45, deletions: 0 },
    { file: "docs/api/refund.md",           additions: 8,  deletions: 0 },
  ],
  breakingChange: "RefundRequest.amount 由可选改为必填",
  relatedIssue: 284,
};

// ---- Conventional Commits 生成器 ----
function generateCommitMessage(pr) {
  // 基于 commits 推断 type
  const allMessages = pr.commits.map(c => c.message).join(" ");
  let type = "feat";
  if (/fix|bug/.test(allMessages)) type = "fix";
  else if (/refactor/.test(allMessages)) type = "refactor";
  else if (/perf/.test(allMessages)) type = "perf";
  else if (/test/.test(allMessages)) type = "test";
  else if (/doc/.test(allMessages)) type = "docs";

  const scope = "payment";
  const subject = "support refund partial amount";
  const body = [
    "Previously refund only supported full amount. Merchants requested",
    "partial refund for handling returns and exchanges.",
    "",
    "- Add amount field to RefundRequest",
    "- Validate amount <= original charge",
    "- Update Stripe API call to use amount param",
  ].join("\\n");
  const footer = [
    "BREAKING CHANGE: RefundRequest.amount is now required (was optional)",
    "Migration: pass the full charge amount to preserve old behavior",
    "",
    "Closes #" + pr.relatedIssue,
  ].join("\\n");

  return type + "(" + scope + "): " + subject + "\\n\\n" + body + "\\n\\n" + footer;
}

// ---- PR 描述生成器 ----
function generatePRDescription(pr) {
  const lines = [];
  lines.push("## Motivation");
  lines.push("- 业务背景：商家需要部分退款能力处理退货/换货");
  lines.push("- 技术背景：原退款 API 只支持全额退款，RefundRequest 无 amount 字段");
  lines.push("");
  lines.push("## Changes");
  lines.push("1. RefundRequest 新增 amount 字段（必填）");
  lines.push("2. 退款服务校验 amount ≤ 原始金额");
  lines.push("3. Stripe 调用透传 amount 参数");
  lines.push("4. 新增部分退款单元测试（5 个用例）");
  lines.push("5. 更新 API 文档说明 amount 字段");
  lines.push("");
  lines.push("## Type");
  lines.push("- [x] Feature（新功能）");
  lines.push("- [ ] Bug Fix");
  lines.push("- [ ] Refactor");
  lines.push("");
  lines.push("## Checklist");
  lines.push("- [x] 代码已自测");
  lines.push("- [x] 单元测试通过");
  lines.push("- [x] 新增了对应测试");
  lines.push("- [x] 文档已更新");
  lines.push("- [x] Breaking change 已在 Changes 标注");
  lines.push("");
  lines.push("## Risk & Rollback");
  lines.push("- 风险点：旧客户端未传 amount 会报错（breaking change）");
  lines.push("- 回滚方案：revert PR；或在服务端默认填全额 amount 做 feature flag");
  lines.push("- 监控指标：退款成功率、amount 字段缺失率");
  lines.push("");
  lines.push("## Related");
  lines.push("- Issue: #" + pr.relatedIssue);
  return lines.join("\\n");
}

// ---- Code Review 评论生成器（模拟）----
function generateCRComments(pr) {
  // 模拟 AI 对 PR diff 的 review 评论
  return [
    {
      level: "🔴 阻塞",
      title: "amount 缺失时的错误信息不明确",
      file: "src/payment/refund.ts",
      line: 42,
      type: "正确性",
      issue: "当 amount 未传时抛 'Invalid request'，调用方无法定位是 amount 缺失",
      suggestion: "抛 'RefundRequest.amount is required' 并附 expected range",
    },
    {
      level: "🟡 建议",
      title: "amount 校验应考虑浮点精度",
      file: "src/payment/refund.ts",
      line: 58,
      type: "正确性",
      issue: "amount <= charge 直接比较浮点，可能因精度问题误判",
      suggestion: "用 Math.round(amount * 100) <= Math.round(charge * 100) 比较（分单位）",
    },
    {
      level: "🟡 建议",
      title: "测试缺并发场景",
      file: "tests/payment/refund.test.ts",
      type: "可测试性",
      issue: "覆盖了正常/边界，但缺'同时发起两次部分退款'的并发场景",
      suggestion: "加一个测试：并发两次各退 60% 金额，第二次应失败",
    },
    {
      level: "🟢 称赞",
      title: "Stripe 调用透传 amount 的方式很干净",
      file: "src/payment/stripe.ts",
      line: 23,
      type: "架构",
      issue: "无",
      suggestion: "无",
    },
  ];
}

// ---- Release Notes 生成器 ----
function generateReleaseNotes(pr) {
  const lines = [];
  lines.push("## Highlights");
  lines.push("- 支持部分退款：商家可按任意金额退款，处理退货/换货更灵活");
  lines.push("");
  lines.push("## New Features");
  lines.push("- 退款 API 新增 amount 字段，支持指定退款金额（≤ 原始支付金额）");
  lines.push("");
  lines.push("## Improvements");
  lines.push("- 退款金额校验更严格，超额退款会在请求阶段被拒绝");
  lines.push("");
  lines.push("## Bug Fixes");
  lines.push("-（无）");
  lines.push("");
  lines.push("## Breaking Changes");
  lines.push("- **RefundRequest.amount 由可选改为必填**");
  lines.push("  - 迁移：旧客户端调用退款时需显式传 amount（如需全额退款，传原始支付金额）");
  lines.push("  - 未传 amount 的请求将返回 400 错误");
  lines.push("");
  lines.push("## Deprecations");
  lines.push("-（无）");
  return lines.join("\\n");
}

// ---- 执行 ----
console.log("==== AI 辅助 Git 工作流演示 ====");
console.log("分支：" + PR.branch + " → " + PR.baseBranch);
console.log("版本：" + PR.prevVersion + " → " + PR.version);
console.log("");

console.log("---- Commits（" + PR.commits.length + " 个）----");
for (const c of PR.commits) {
  console.log("  " + c.hash + " " + c.message);
}
console.log("");

console.log("---- Diff Stat ----");
let totalAdd = 0, totalDel = 0;
for (const d of PR.diffStat) {
  console.log("  " + d.file.padEnd(36) + " +" + d.additions + " -" + d.deletions);
  totalAdd += d.additions;
  totalDel += d.deletions;
}
console.log("  " + "合计".padEnd(36) + " +" + totalAdd + " -" + totalDel);
console.log("");

console.log("==== 1. Conventional Commit Message ====");
console.log(generateCommitMessage(PR));
console.log("");

console.log("==== 2. PR 描述 ====");
console.log(generatePRDescription(PR));
console.log("");

console.log("==== 3. Code Review 评论 ====");
const comments = generateCRComments(PR);
for (const c of comments) {
  console.log("### " + c.level + " " + c.title);
  console.log("位置: " + c.file + (c.line ? ":" + c.line : ""));
  console.log("类型: " + c.type);
  console.log("问题: " + c.issue);
  if (c.suggestion !== "无") console.log("建议: " + c.suggestion);
  console.log("");
}

console.log("==== 4. Release Notes (" + PR.version + ") ====");
console.log(generateReleaseNotes(PR));
console.log("");

console.log("==== 5. 自动提交策略对比 ====");
const AUTO_COMMIT_TOOLS = [
  { tool: "Aider",       default: "ON",  granularity: "每轮对话一个 commit",  undoable: true,  rebaseFriendly: false },
  { tool: "Claude Code", default: "ON",  granularity: "每子任务一个 commit",  undoable: true,  rebaseFriendly: false },
  { tool: "Cursor",      default: "OFF", granularity: "由人决定",             undoable: false, rebaseFriendly: true  },
];
console.log("  工具           | 默认 | 粒度                  | 可撤销 | rebase 友好");
console.log("  ---------------|------|-----------------------|--------|------------");
for (const t of AUTO_COMMIT_TOOLS) {
  console.log(
    "  " + t.tool.padEnd(14) + " | " +
    t.default.padEnd(4) + " | " +
    t.granularity.padEnd(21) + " | " +
    (t.undoable ? "是" : "否").padEnd(6) + " | " +
    (t.rebaseFriendly ? "是" : "否")
  );
}
console.log("");
console.log("✅ Git/PR/CR 要点：");
console.log("  1. Commit Message 遵循 Conventional Commits");
console.log("  2. PR 描述四件套：Motivation / Changes / Checklist / Risk & Rollback");
console.log("  3. CR 评论分级：🔴阻塞 / 🟡建议 / 🔵提问 / 🟢称赞");
console.log("  4. Release Notes 用用户视角，CHANGELOG 用 Keep a Changelog 规范");
console.log("  5. 自动提交 ON 用于本地，push 前 rebase 整理历史");
`
  }
];
