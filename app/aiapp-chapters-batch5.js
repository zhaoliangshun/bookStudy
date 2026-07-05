// =============================================================
// AI 应用编程教程 —— 第 5 批章节（Claude深度使用组，共 5 章）
// -------------------------------------------------------------
// 章节范围：
//   21. aiapp-claude-intro     Claude 入门与订阅
//   22. aiapp-claude-projects  Claude 项目与上下文管理
//   23. aiapp-claude-artifacts Artifacts 与 MCP
//   24. aiapp-claude-prompts   Claude 提示词技巧
//   25. aiapp-claude-workflow  Claude 实战工作流
//
// 信息时效：2026-07-05。Claude 4 系列（Opus 4 / Sonnet 4）已发布。
//           价格、参数与功能如无特别说明均以官方页面为准。
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
    id: "aiapp-claude-intro",
    icon: "🟠",
    group: "Claude深度使用",
    title: "Claude 入门与订阅",
    content: `
# 第21章：Claude 入门与订阅

## 21.1 Claude 是什么

Claude 是 Anthropic 公司出品的通用大语言模型助手，定位与 ChatGPT、Gemini 同属"对话式 AI 助手"赛道，但在产品哲学上有明显差异。Anthropic 由前 OpenAI 核心成员 Dario Amodei 与 Daniela Amodei 等人于 2021 年创立，团队在宪法式对齐（Constitutional AI）、可解释性研究上投入了大量精力，这让 Claude 在"听话"和"有原则"之间走了一条不同于 OpenAI 的路：它倾向于更长、更克制、更结构化的回答，而不是把"快"和"多"放在第一位。

到 2026 年中，Claude 已经迭代到 4 系列为主力：**Claude Opus 4** 是旗舰，主打深度推理与复杂任务；**Claude Sonnet 4** 是平衡型主力，速度与智能兼顾，是大部分开发者日常使用的型号；**Claude Haiku** 系列则面向高吞吐、低延迟场景。理解这套产品线很重要，因为同一个"Claude"在不同型号下表现差异很大，订阅方案能用到哪个型号也是分档的。

从开发者的角度，Claude 的价值集中在三件事上：第一，**长上下文**——Claude 4 系列原生支持 200K tokens 上下文，部分型号在 API 上可启用 1M 窗口，能整本读入中型仓库或长文档；第二，**代码能力**——在 SWE-bench、Aider Polyglot 等编程基准上长期位于第一梯队，尤其擅长 TypeScript、Python、Rust；第三，**Artifacts 与 MCP 生态**——这两项是 Claude.ai 与 Claude Desktop 区别于其他对话产品的独门能力，前者让模型能在对话右侧生成可预览的代码/网页/React 组件，后者让 Claude 能通过统一协议接入本地文件、GitHub、Slack 等外部资源。

## 21.2 Claude 的产品入口：网页 / 桌面 / 移动端

Claude 不是一个单一客户端，而是一组产品形态。下表汇总了 2026 年 7 月时点的主要入口：

| 入口 | 形态 | 主要能力 | 适合场景 |
| --- | --- | --- | --- |
| Claude.ai | 网页应用 | 对话、Projects、Artifacts、MCP 配置 | 主力使用，跨设备无缝 |
| Claude Desktop | macOS / Windows 桌面端 | 同上 + 本地 MCP 服务器原生支持 | 需要访问本地文件、本地命令的深度用户 |
| Claude Mobile | iOS / Android App | 对话、Artifacts 预览、语音输入 | 移动场景、灵感记录 |
| Claude Code | 终端 CLI（npm 包） | 直接读写本地仓库、跑测试、跑 git | 在代码仓库里做 Agent 式开发 |
| console.anthropic.com | API 控制台 | 管理 API Key、看用量、调模型 | 后端集成、构建自己的 AI 应用 |
| Claude Team / Enterprise 后台 | 团队管理控制台 | 成员、权限、共享项目、审计 | 团队协作与企业合规 |

值得强调的是 **Claude Code**：它是 Anthropic 官方出品的命令行 Agent 工具，安装方式是 \`npm install -g @anthropic-ai/claude-code\`，运行后在终端里用自然语言指挥它读写文件、运行测试、提交 commit。Claude Code 既能用订阅账号（Pro/Max）登录"免 API 费"使用，也能用 API Key 计费使用——这是订阅与 API 两条路之间的一座桥梁，下文会详细对比。

## 21.3 五种订阅方案对比

Claude 的订阅体系比 ChatGPT 更细分，2026 年 7 月共五种方案，覆盖从免费体验到企业级。**以下价格与额度均以 Anthropic 官方页面为准，本表仅为示意，可能随时间调整**：

| 方案 | 月费（美元） | 主力型号 | Claude Code 额度 | Projects | 团队管理 | 适合人群 |
| --- | --- | --- | --- | --- | --- | --- |
| Free | 0 | Sonnet（限额） | 不可用 | 不支持 | 不支持 | 体验、轻度使用 |
| Pro | 20 | Sonnet 4 + Opus（限额） | 有限额度（约 5x Free 的 Sonnet 用量） | 支持 | 不支持 | 个人开发者主力 |
| Max | 100 / 200 | Opus 4 + Sonnet 4 大额度 | 大额度（Pro 的 5x / 20x） | 支持 | 不支持 | 重度 Agent 用户 |
| Team | 30（每席位，最少 5 席） | Sonnet 4 + Opus 限额 | 含 Pro 级额度 | 支持团队共享 | 支持 | 小团队协作 |
| Enterprise | 定制 | 全型号 + 私有部署选项 | 定制大额度 | 支持 + 审计 | 支持 SSO/SCIM | 企业级合规 |

几个关键差异需要特别说明：

1. **Free 用户用不了 Claude Code**。Claude Code 是订阅或 API 才能用的"进阶入口"，免费用户只能在网页端对话。
2. **Pro 用户能用 Claude Code，但额度有限**。Pro 给的是大约 5 倍 Free 的 Sonnet 用量，做 Agent 式的多步任务很容易在一两个小时内触发限额，触发后会降级或等待重置。
3. **Max 是为 Agent 重度用户设计的**。100 美元档约等于 5 倍 Pro 的 Claude Code 额度，200 美元档约 20 倍。如果你的日常工作流是"开 Claude Code 让它跑一下午"，Max 几乎是必选项。
4. **Team 与 Pro 的核心差异不是模型，而是协作**。Team 后台能共享 Projects、统一计费、做成员管理，但单席位给的模型额度并不比 Pro 多多少，不要把它当成"便宜的 Max"。
5. **Enterprise 才有 SSO、审计、私有部署**。如果公司有合规要求（数据驻留、审计日志、SCIM 自动配号），只能走 Enterprise。

## 21.4 API 接入方式

订阅适合"人直接用 Claude"，API 则适合"让程序调用 Claude"。Anthropic 的 API 控制台地址是 \`console.anthropic.com\`，在那里可以创建 API Key、查看用量、绑定付款方式。API 是按 token 计费的，**以下价格为示意，请以官方价格页为准**：

| 模型 | 输入（每百万 token） | 输出（每百万 token） | 上下文 | 说明 |
| --- | --- | --- | --- | --- |
| Claude Opus 4 | 约 15 美元 | 约 75 美元 | 200K | 旗舰，复杂任务 |
| Claude Sonnet 4 | 约 3 美元 | 约 15 美元 | 200K | 主力，性价比最高 |
| Claude Haiku（最新） | 约 0.8 美元 | 约 4 美元 | 200K | 高吞吐、低延迟 |

API 调用的典型代码（Python）如下，注意 Anthropic SDK 的 messages 接口与 OpenAI 的 chat/completions 在参数结构上略有差异：

\`\`\`python
import anthropic

client = anthropic.Anthropic(api_key="sk-ant-...")  # 从 console 拿到的 Key
resp = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    system="你是一位资深前端工程师，回答时给出可直接运行的代码。",
    messages=[
        {"role": "user", "content": "用 React 写一个倒计时组件"}
    ],
)
print(resp.content[0].text)
\`\`\`

API 的几个特性值得记住：**system 字段独立**（不像 OpenAI 把 system 塞进 messages 第一条）、**支持 prompt caching**（重复的长 system prompt 可以打折，能省 50%~90% 输入费用）、**支持 batch API**（异步批量调用，半价）、**支持 thinking 参数**（让 Claude 4 系列在回答前显式"思考"，提升复杂任务表现）。

## 21.5 订阅 vs API：怎么选

这是新人最常问的问题。决策树很简单：

- **只在自己电脑上偶尔用**：Free 起步，不够再升 Pro。
- **每天高频用 Claude.ai 网页 + Claude Code**：Pro 起步，Claude Code 频繁撞限额就上 Max。
- **要在自己的产品里调用 Claude**：必须 API。
- **团队多人共享项目、统一计费**：Team。
- **公司有合规/审计/SSO 要求**：Enterprise。
- **两者都要**：常见组合是 Max 订阅（人用）+ API（程序用），两边独立计费互不影响。

一个容易踩的坑：**Claude Code 用订阅账号登录时，额度是订阅额度；切换成 API Key 登录时，额度是 API 余额**。在 Claude Code 里执行 \`claude config set apiKey sk-ant-...\` 就会切到 API 计费，不再消耗订阅额度。这对"白天写代码用订阅、晚上跑批处理用 API"的人来说非常实用。

## 21.6 Claude 与 ChatGPT 的整体差异

把两者放在一起比较，不是为了分高下，而是为了"按场景选用"。下表是 2026 年中视角下的差异：

| 维度 | Claude（Anthropic） | ChatGPT（OpenAI） |
| --- | --- | --- |
| 默认语气 | 偏长、偏结构化、偏克制 | 偏简洁、偏对话感 |
| 长文档处理 | 200K/1M 原生长上下文，"中段遗忘"控制较好 | 128K~1M（按型号），整体也很强 |
| 代码能力 | TypeScript / Rust / Python 一线 | Python / 前端一线 |
| 可预览产物 | Artifacts（右侧实时预览 React/HTML/SVG） | Canvas / Code Interpreter |
| 工具生态 | MCP 协议开放、官方服务器多 | Function Calling + GPTs 商店 |
| Agent CLI | Claude Code（官方） | Codex CLI（官方）+ 第三方 |
| 提示词偏好 | XML 标签、显式结构 | Markdown 分隔、自然语言 |
| 价格梯度 | 分档细（Free/Pro/Max/Team/Ent） | 分档简（Free/Plus/Pro/Team/Ent） |

## 21.7 Claude 的语气与价值观特点

最后聊一点"性格"。Claude 在训练时被注入了比较强的"诚实、谨慎、不讨好"倾向，这表现在三件事上：第一，**它会说"我不知道"**，而不是编一个答案；第二，**它会在不确定时主动列出假设**，而不是直接给结论；第三，**它对"会造成现实伤害"的请求拒绝得比较明确**，但拒绝时会尝试给出替代方案。这种性格让 Claude 在做技术方案评估、代码 review、文档撰写这类"需要严谨"的场景上特别顺手，但在"陪我brainstorming乱想"的场景上会显得比 ChatGPT 保守。理解这种差异，比记住任何具体功能都更能帮你选对工具。
`,
    code: `// =============================================================
// 第21章示例：Claude 订阅方案选型与成本估算器
// 输入用户画像，输出推荐订阅方案、月度预算与 Claude Code 可用量预估
// =============================================================

// ---- 订阅方案定义（价格为示意，请以官方为准）----
const PLANS = [
  {
    name: "Free",
    price: 0,
    claudeCode: false,
    projects: false,
    sonnetWeight: 1,   // 相对用量权重
    opusWeight: 0,
    fitTags: ["体验", "轻度"],
  },
  {
    name: "Pro",
    price: 20,
    claudeCode: true,
    projects: true,
    sonnetWeight: 5,
    opusWeight: 1,     // Pro 能用 Opus 但额度很紧
    fitTags: ["个人主力", "Claude Code 轻度"],
  },
  {
    name: "Max-100",
    price: 100,
    claudeCode: true,
    projects: true,
    sonnetWeight: 25,
    opusWeight: 5,
    fitTags: ["Agent 重度", "Claude Code 日常"],
  },
  {
    name: "Max-200",
    price: 200,
    claudeCode: true,
    projects: true,
    sonnetWeight: 100,
    opusWeight: 20,
    fitTags: ["全天 Agent", "大型重构"],
  },
  {
    name: "Team",
    price: 30,          // 每席位
    minSeats: 5,
    claudeCode: true,
    projects: true,
    sonnetWeight: 5,
    opusWeight: 1,
    fitTags: ["团队协作", "共享项目"],
  },
];

// ---- 用户画像 ----
const USER_PROFILES = [
  { name: "学生小张", dailyMinutes: 15, usesClaudeCode: false, teamSize: 1, budget: 0 },
  { name: "独立开发者老王", dailyMinutes: 180, usesClaudeCode: true, teamSize: 1, budget: 50 },
  { name: "Agent 重度用户阿珍", dailyMinutes: 480, usesClaudeCode: true, teamSize: 1, budget: 250 },
  { name: "创业团队 Tech Lead 大刘", dailyMinutes: 240, usesClaudeCode: true, teamSize: 6, budget: 500 },
];

// ---- 推荐函数 ----
function recommend(profile) {
  const { dailyMinutes, usesClaudeCode, teamSize, budget } = profile;

  // 规则 1：团队 >= 5 人优先 Team
  if (teamSize >= 5) {
    return { plan: "Team", reason: "团队规模 ≥5，Team 方案的共享项目与统一计费更划算" };
  }
  // 规则 2：要 Claude Code 但用量轻（< 2 小时/天）
  if (usesClaudeCode && dailyMinutes < 120) {
    return { plan: "Pro", reason: "Claude Code 用得不多，Pro 的额度够用且性价比最高" };
  }
  // 规则 3：Agent 重度（每天 >= 4 小时 + Claude Code）
  if (usesClaudeCode && dailyMinutes >= 240 && budget >= 200) {
    return { plan: "Max-200", reason: "全天 Agent 工作流，Max-200 的大额度能避免频繁撞限额" };
  }
  if (usesClaudeCode && dailyMinutes >= 240) {
    return { plan: "Max-100", reason: "Claude Code 用量大，Max-100 比 Pro 划算且不撞限额" };
  }
  // 规则 4：用 Claude Code 但用量中等（2-4 小时/天），Pro 仍够用
  if (usesClaudeCode && dailyMinutes >= 120) {
    return { plan: "Pro", reason: "Claude Code 中等用量，Pro 够用，频繁撞限额再升 Max" };
  }
  // 规则 5：默认免费
  return { plan: "Free", reason: "用量轻，Free 起步，不够再升" };
}

// ---- 估算月度成本 ----
function monthlyCost(planName, profile) {
  const plan = PLANS.find((p) => p.name === planName);
  if (plan.name === "Team") return plan.price * Math.max(plan.minSeats, profile.teamSize);
  return plan.price;
}

// ---- 执行推荐 ----
console.log("========================================");
console.log("  Claude 订阅方案推荐报告");
console.log("  生成时间：2026-07-05");
console.log("========================================\\n");

USER_PROFILES.forEach((p) => {
  const rec = recommend(p);
  const cost = monthlyCost(rec.plan, p);
  const plan = PLANS.find((x) => x.name === rec.plan);
  console.log("用户：" + p.name);
  console.log("  画像：每天 " + p.dailyMinutes + " 分钟 / Claude Code=" + p.usesClaudeCode + " / 团队=" + p.teamSize + " 人 / 预算 $" + p.budget);
  console.log("  推荐：" + rec.plan + "（$" + cost + "/月）");
  console.log("  理由：" + rec.reason);
  console.log("  能力：Claude Code=" + plan.claudeCode + " / Projects=" + plan.projects);
  console.log("  Sonnet 相对用量权重：" + plan.sonnetWeight + "x");
  console.log("");
});

// ---- 订阅 vs API 决策提示 ----
console.log("========================================");
console.log("  订阅 vs API 决策提示");
console.log("========================================");
console.log("  - 只有人用 → 订阅（Pro/Max）");
console.log("  - 程序调用 Claude → API（按 token 计费）");
console.log("  - Claude Code 切换计费方式：claude config set apiKey <KEY>");
console.log("  - 团队协作 → Team；合规/SSO/审计 → Enterprise");
console.log("\\n✅ 推荐完成，实际价格与额度请以 console.anthropic.com 官方页面为准。");
`
  },

  {
    id: "aiapp-claude-projects",
    icon: "📁",
    group: "Claude深度使用",
    title: "Claude 项目与上下文管理",
    content: `
# 第22章：Claude 项目与上下文管理

## 22.1 为什么需要 Projects

用 Claude.ai 越久，越会撞上一个痛点：每次开新对话，都得重新交代一遍背景——"我在做一个 Next.js 14 的项目，用 App Router、TypeScript、Tailwind"、"我们团队的代码风格是 xxx"、"参考这份 API 文档"。这些重复的"开场白"既费时间，又容易遗漏。Claude 的 **Projects** 功能就是为解决这个问题设计的：它把"一组知识文件 + 一段自定义指令 + 一组历史对话"打包成一个独立空间，在这个空间里开的所有对话都自动带上这些上下文。

Projects 是 Pro / Team / Max / Enterprise 专属功能，Free 用户看不到。它的本质是 Claude 帮你把"每次都要重新解释的背景"固化下来，让 Claude 在这个项目内表现得像一个"已经入职两周的同事"，而不是"刚进门的实习生"。这个比喻很关键：Projects 不是万能的，它提升的是"背景知识的可用性"，而不是"模型本身的智商"。

## 22.2 创建项目与上传知识

创建一个 Project 的步骤很简单：在 Claude.ai 左侧栏点 Projects → New Project → 命名 → 进入项目设置。核心配置有三块：

1. **Project Knowledge（项目知识）**：上传文档文件，支持 pdf / txt / md / docx / csv / html 等，单个项目最多 200K tokens 的知识总量（约等于一本中等厚度的技术书）。Claude 会在每次对话时自动检索这些知识。
2. **Custom Instructions（项目指令）**：一段对 Claude 的"角色设定 + 行为约束"，相当于这个项目专属的 system prompt。
3. **Conversation History（对话历史）**：项目内所有对话的归档，可以 Star 收藏常用对话，也可以跨对话 Set as context（把某个对话的输出作为下一次对话的输入）。

下表是 Project Knowledge 的容量与建议用法（**以官方为准**）：

| 维度 | 限制 | 建议用法 |
| --- | --- | --- |
| 单项目知识总量 | 200K tokens（约 15 万英文单词 / 10 万汉字） | 别塞满，留 30% 给对话上下文 |
| 单文件大小 | 32MB 或 200K tokens（取小） | 大文件预先切片 |
| 文件格式 | pdf/txt/md/docx/csv/html/json 等 | 优先 md/txt，检索效果最好 |
| 项目数量（Pro） | 限制较多，约 5-10 个 | 按主题聚合，不要按周建 |
| 项目数量（Team/Ent） | 共享给团队，配额更高 | 一个团队一个项目空间 |

**Project Knowledge 的实战要点**：第一，优先上传结构化的 Markdown，而不是 PDF——Markdown 检索效果好且不会因为排版干扰；第二，知识文件要有清晰的标题层级，Claude 在检索时会利用标题；第三，别把整个仓库源码塞进去，源码应该让 Claude Code 在仓库里直接读，Project Knowledge 适合放"文档、规范、设计稿"这类元信息。

## 22.3 自定义项目指令（Custom Instructions）

Custom Instructions 是 Projects 最有杠杆的一块。它本质是"这个项目专属的 system prompt"，但比直接在对话里写 system prompt 有两个优势：第一，它对所有对话生效，不用每次重复；第二，它和 Project Knowledge 联动，Claude 会同时参考两者。

写好 Custom Instructions 的关键原则：

1. **明确角色与目标**：开宗明义告诉 Claude "你是谁、服务谁、目标是什么"。例如："你是一位熟悉 Next.js App Router 的资深前端工程师，服务对象是一个用 TypeScript + Tailwind 的中型 SaaS 团队，目标是帮团队 review 代码与写组件。"
2. **列出硬约束**：技术栈版本、代码风格、禁止事项。例如："TypeScript 严格模式、Tailwind 不要用 @apply、函数组件优先、禁止使用 any。"
3. **规定输出格式**：要不要给解释、给多少、代码块用什么语言。例如："回答时先给结论，再给代码，代码块标注 tsx 语言；不要在代码里写注释解释显而易见的语法。"
4. **提供参考样本**：给一两个"理想回答"的范例，Claude 会模仿其风格。
5. **明确知识边界**：告诉它 Project Knowledge 里有什么、什么时候该引用。例如："项目知识里有《组件规范.md》，回答组件相关问题前先检索该文档并引用其章节号。"

一段合格的 Custom Instructions 示例：

\`\`\`text
角色：你是一位 Next.js 14（App Router）+ TypeScript + Tailwind 资深工程师。
目标：帮团队 review 代码、写组件、回答架构问题。

约束：
1. TypeScript 严格模式，禁止 any，必要时用 unknown + 类型守卫
2. 优先函数组件 + hooks，避免 class 组件
3. Tailwind 用原子类，禁止 @apply
4. 服务端组件优先，需要交互再标 "use client"
5. 数据获取优先 fetch + cache: 'no-store'，复杂场景再考虑 Server Actions

输出格式：
- 先一句话结论
- 再给代码（标注 tsx）
- 最后给"为什么这么做"的解释（不超过 3 条）

知识边界：
- 项目知识里有《组件规范.md》《API 设计.md》
- 回答前先检索这两份文档，引用时标注章节号
- 文档里没覆盖的，明确说"文档未规定，建议..."
\`\`\`

## 22.4 共享项目给团队

Team / Enterprise 方案下，Projects 可以共享给团队成员。共享不是简单的"别人能看你的项目"，而是"团队成员都能在这个项目里开对话、贡献知识、复用 Custom Instructions"。这让 Projects 从"个人工具"升级为"团队知识资产"。

团队用 Projects 的最佳实践：

- **一个领域一个项目**：例如"前端组件库项目"、"API 设计规范项目"、"客户支持知识库项目"，不要按人建。
- **知识文件由专人维护**：避免每个人都在上传自己的版本，造成冲突与噪音。
- **Custom Instructions 走评审**：改 Custom Instructions 等于改团队的 system prompt，应该 PR 式评审，而不是随手改。
- **Set as context 串联对话**：把"已经得出结论的对话"设为下一次对话的上下文，避免重新论证。

## 22.5 对话历史管理与 Star 收藏

Projects 内的对话是按时间倒序排列的，但纯按时间找对话很痛苦。Claude 提供两个机制：**Star 收藏** 和 **Set as context**。Star 是"标记常用对话"，Set as context 是"把某对话的输出当作下一次对话的输入"。

实战中我推荐这样的对话管理节奏：

1. **每个独立任务一个对话**：不要在一个对话里塞三个不相关的需求，否则上下文会越来越乱。
2. **任务完成后改名 + Star**：Claude 支持给对话改名，改成一个能搜到的名字（如"Redis 缓存策略 v2"），然后 Star 收藏。
3. **复用时 Set as context**：下次要做相关任务，新建对话，把上次那个对话 Set as context，再开始。
4. **定期归档**：每个月把不再活跃的对话移出 Star，保持 Star 列表精简。

## 22.6 Context 窗口管理：200K vs 1M

Claude 4 系列原生 200K 上下文，部分型号在 API 上可启用 1M 上下文。在 Projects 里，这个窗口由"Project Knowledge + Custom Instructions + 当前对话历史"共同瓜分。一个常见误区是"反正 200K 很大，随便用"，但实际上长上下文有三个坑：

1. **中段遗忘**：研究表明所有模型在长上下文下都有"开头记得清、结尾记得清、中间被忽略"的现象。Project Knowledge 默认检索可能漏掉中段内容。
2. **延迟上升**：上下文越长，单次响应延迟越高。200K 上下文比 8K 上下文慢数倍。
3. **成本爆炸**：API 模式下，输入 token 是计费的，200K 上下文每次调用都计费 200K 输入，哪怕你只问一句"你好"。

下表是不同场景下的窗口策略：

| 场景 | 推荐窗口 | 策略 |
| --- | --- | --- |
| 日常对话（短问答） | 8K-32K | 不开 Projects，直接问 |
| 项目内对话（中等复杂度） | 32K-100K | 开 Projects，知识 + 对话历史 |
| 整本代码库分析 | 100K-200K | 用 Claude Code 而不是 Projects |
| 超长文档（>200K） | 1M | API 启用 1M 上下文，配合 prompt caching |

## 22.7 上下文压缩与延展

当对话历史变得很长，Claude 会在内部做"上下文压缩"——把早期的对话摘要后再保留。这是自动的，但有三个手动技巧可以配合：

1. **主动总结**：在长对话中段，让 Claude "用一段话总结我们已经讨论的结论"，把这段总结复制到新对话作为开场。
2. **分阶段拆对话**：把"调研 → 设计 → 实现"拆成三个对话，每个对话只承担一个阶段，前一个的输出作为后一个的输入。
3. **用 Projects 沉淀结论**：把每次对话的最终结论整理成 md 文件，上传到 Project Knowledge，让"结论"成为"知识"，而不是反复在对话里翻找。

## 22.8 何时该新建项目而非复用

最后是一个常被忽略的判断题：什么时候该新建项目，什么时候复用旧项目？判断标准是"知识是否还相关"：

- **新业务领域** → 新建。例如从"前端组件"切到"后端 API"，知识完全不重叠，复用反而干扰。
- **新版本/新栈** → 新建。例如从 Next.js 13 升级到 15，旧项目的 Custom Instructions 可能误导，新建一个标注"v15"。
- **同一领域的延伸** → 复用。例如"前端组件"项目里继续讨论"表单库选型"，知识高度重叠。
- **临时性探索** → 不建项目。直接在默认空间开对话，避免项目空间被噪音淹没。

记住一个原则：**Projects 的价值在于"知识复用"，不在于"对话归档"**。如果只是为了存对话，用 Star 收藏就够了；只有当某个领域的"知识 + 指令"会反复使用时，才值得做成 Project。
`,
    code: `// =============================================================
// 第22章示例：Claude Projects 上下文预算估算器
// 输入 Project Knowledge 文件清单 + 对话历史估算，输出上下文占用与建议
// =============================================================

// ---- Token 估算经验值（粗略，实际以 tokenizer 为准）----
// 中文：约 1 字 = 1.5 token；英文：约 1 词 = 1.3 token；代码：波动大，按 1 字符 = 0.4 token
function estimateTokens(text, type = "mixed") {
  if (type === "zh") return Math.ceil(text.length * 1.5);
  if (type === "en") return Math.ceil(text.split(/\\s+/).length * 1.3);
  if (type === "code") return Math.ceil(text.length * 0.4);
  return Math.ceil(text.length * 1.0); // mixed 默认
}

// ---- 一个 Project 的知识文件清单 ----
const KNOWLEDGE_FILES = [
  { name: "组件规范.md",        size: 8000,  type: "zh",   priority: "high" },
  { name: "API 设计指南.md",    size: 12000, type: "zh",   priority: "high" },
  { name: "架构决策记录.md",     size: 5000,  type: "zh",   priority: "medium" },
  { name: "数据库 schema.sql",  size: 6000,  type: "code", priority: "medium" },
  { name: "客户案例集.md",      size: 15000, type: "zh",   priority: "low" },
  { name: "历史对话摘要.txt",   size: 4000,  type: "zh",   priority: "low" },
];

// ---- Custom Instructions ----
const CUSTOM_INSTRUCTIONS = \`
角色：Next.js 14 资深工程师，服务 TypeScript + Tailwind 团队。
约束：严格模式、函数组件、Tailwind 原子类、Server Component 优先。
输出：先结论，再代码（标注 tsx），最后解释（≤3 条）。
\`;

// ---- 对话历史估算 ----
const CONVERSATION_HISTORY = {
  rounds: 12,                  // 已经来回多少轮
  avgRoundTokens: 1500,        // 平均每轮（user+assistant）token
};

// ---- 上下文窗口配置 ----
const WINDOWS = {
  default: 200_000,            // Claude 4 系列原生
  extended: 1_000_000,         // API 启用 1M
};

// ---- 计算占用 ----
function analyzeProject(files, instructions, history, windowSize) {
  const knowledgeTokens = files.reduce(
    (sum, f) => sum + estimateTokens("x".repeat(f.size), f.type),
    0
  );
  const instructionTokens = estimateTokens(instructions, "zh");
  const historyTokens = history.rounds * history.avgRoundTokens;

  const used = knowledgeTokens + instructionTokens + historyTokens;
  const remaining = windowSize - used;
  const utilization = (used / windowSize) * 100;

  // 建议
  const tips = [];
  if (knowledgeTokens > windowSize * 0.5) tips.push("知识文件占用超过 50%，考虑精简或拆项目");
  if (historyTokens > windowSize * 0.3) tips.push("对话历史占用超过 30%，建议总结后开新对话");
  if (utilization > 80) tips.push("整体利用率 >80%，临近上限，禁止再加知识文件");
  if (utilization < 30) tips.push("利用率 <30%，可以再补充知识文件提升检索覆盖");
  if (tips.length === 0) tips.push("上下文使用健康，继续保持");

  return {
    knowledgeTokens,
    instructionTokens,
    historyTokens,
    used,
    remaining,
    utilization: utilization.toFixed(1) + "%",
    tips,
  };
}

// ---- 执行分析（默认 200K 窗口）----
console.log("========================================");
console.log("  Claude Project 上下文预算分析");
console.log("  窗口：200K（Claude 4 原生）");
console.log("========================================\\n");

const result = analyzeProject(KNOWLEDGE_FILES, CUSTOM_INSTRUCTIONS, CONVERSATION_HISTORY, WINDOWS.default);

console.log("【各部分占用】");
console.log("  Project Knowledge  : " + result.knowledgeTokens.toLocaleString() + " tokens");
console.log("  Custom Instructions: " + result.instructionTokens.toLocaleString() + " tokens");
console.log("  对话历史 (12 轮)   : " + result.historyTokens.toLocaleString() + " tokens");
console.log("  ─────────────────────────────");
console.log("  总计占用           : " + result.used.toLocaleString() + " tokens");
console.log("  剩余空间           : " + result.remaining.toLocaleString() + " tokens");
console.log("  利用率             : " + result.utilization);
console.log("");
console.log("【建议】");
result.tips.forEach((t, i) => console.log("  " + (i + 1) + ". " + t));

// ---- 切换 1M 窗口对比 ----
console.log("\\n========================================");
console.log("  对比：启用 1M 上下文窗口");
console.log("========================================");
const result1M = analyzeProject(KNOWLEDGE_FILES, CUSTOM_INSTRUCTIONS, CONVERSATION_HISTORY, WINDOWS.extended);
console.log("  利用率：" + result1M.utilization);
console.log("  注意：1M 窗口仅 API 可用，且延迟与成本显著上升");
console.log("  适用：单次需要塞入 >200K 的超长文档时启用，不要日常开");

console.log("\\n✅ 分析完成。实际 token 数请用 Anthropic 官方 tokenizer 验证。");
`
  },

  {
    id: "aiapp-claude-artifacts",
    icon: "✨",
    group: "Claude深度使用",
    title: "Artifacts 与 MCP",
    content: `
# 第23章：Artifacts 与 MCP

## 23.1 Artifacts 是什么

打开 Claude.ai 网页端，让 Claude "写一个 React 倒计时组件"，你会发现它不仅把代码输出在对话里，还在对话右侧弹出一个独立面板，把组件**真的渲染出来**——可以点、可以动、可以看效果。这个右侧面板里的产物，就叫 **Artifact**。它是 Claude 在 2024 年中推出的功能，目标是让"代码"从"对话框里的文本"升级为"可预览、可交互、可分享"的独立产物。

Artifact 与传统"代码块输出"的本质区别在于：代码块只是一段文本，你要自己复制到本地才能跑；Artifact 是 Claude 主动识别"这是一段值得单独预览的产物"，把它抽离出来，赋予它独立的渲染环境、版本历史、分享链接。这对前端开发、文档撰写、教学演示来说是质变——你能直接看到效果，再决定要不要采纳。

## 23.2 支持的 Artifact 类型

到 2026 年 7 月，Claude 支持的 Artifact 类型主要有以下几类（**以官方文档为准**）：

| 类型 | 文件后缀 / 标识 | 渲染方式 | 典型用途 |
| --- | --- | --- | --- |
| Code | .js / .ts / .py / .go 等 | 语法高亮代码块 | 通用代码片段，不可执行 |
| HTML | .html | iframe 内渲染完整网页 | 落地页、邮件模板、SVG 动画 |
| SVG | .svg | 直接渲染矢量图 | 图标、流程图、数据可视化 |
| Mermaid | mermaid 图源 | Mermaid 引擎渲染 | 流程图、时序图、架构图 |
| React | .jsx / .tsx | 沙箱内渲染组件 | 可交互组件、Demo、原型 |
| Markdown | .md | 渲染为富文本 | 文档、报告、技术方案 |

其中 **React Artifact** 是最有价值的一类。Claude 会把你的组件代码注入一个沙箱（基于 TypeScript + Tailwind + lucide-react 等常用库），实时渲染。你可以让 Claude 写一个"带动画的 Tab 切换组件"，右侧立刻能看到效果；再让它"把切换动画改成 spring"，右侧立刻更新。这种"对话即所见"的循环，比本地起一个 Storybook 再调代码快得多。

## 23.3 Artifacts 的实战场景

下面是几个高价值的实战场景：

**场景 1：生成可交互 React 组件**。需求是"做一个带搜索框的下拉选择器，支持键盘上下键"。直接告诉 Claude：

\`\`\`text
用 React + TypeScript + Tailwind 写一个 Select 组件：
1. 支持搜索过滤
2. 支持键盘上下键导航 + 回车选中
3. 点击外部关闭
4. 输出为 Artifact，让我能直接看到效果
\`\`\`

Claude 会生成一个 tsx Artifact，右侧直接渲染。你能立刻验证键盘交互是否符合预期，再让它调整。

**场景 2：生成 SVG 流程图**。让 Claude "画一个 OAuth 2.0 授权码流程的 SVG 图"，它会输出一个 .svg Artifact，直接渲染成图。比 Mermaid 更可控（能精确控制样式），比手画快十倍。

**场景 3：生成 HTML 邮件模板**。让 Claude "写一封欢迎邮件的 HTML 模板，兼容 Outlook/Gmail"，输出 HTML Artifact，右侧直接预览，复制 HTML 即可投入使用。

**场景 4：生成 Mermaid 架构图**。让 Claude "把我们讨论的微服务架构画成 Mermaid 图"，输出 mermaid Artifact，渲染成架构图。Mermaid 的好处是文本可版本化，能进 git。

## 23.4 Artifacts 的协作与发布

Artifact 不仅是"自己看"，还支持**协作与发布**。在 Claude.ai 里，每个 Artifact 都有"分享"按钮，生成一个公开链接（Pro/Team/Enterprise 可设为私密）。对方打开链接能看到 Artifact 的渲染结果与代码，可以 Fork 到自己的对话里继续修改。这让 Artifacts 成为"AI 产物的 GitHub Gist"——你可以把一个"React 动画 Demo"分享给同事，对方不需要 Claude 账号就能看到效果。

Team 项目里，Artifacts 还能"内嵌在 Project 知识里"。例如团队约定"所有组件 Demo 都用 Artifact 形式存档"，那么 Project Knowledge 里就会沉淀一批可预览的组件范例，新成员开对话时 Claude 能参考这些范例生成符合团队风格的代码。

## 23.5 MCP：Model Context Protocol 简介

如果说 Artifacts 是"输出端"的革新，那么 **MCP（Model Context Protocol）** 是"输入端"的革新。MCP 是 Anthropic 在 2024 年底开源的一套协议，目标是让 AI 助手能**以统一方式接入外部数据源与工具**。在 MCP 之前，每个 AI 应用要接外部数据，都得自己写适配——接 GitHub 一套 SDK、接 Slack 一套 SDK、接本地文件系统又一套逻辑。MCP 把这些抽象成"客户端-服务器"模型：AI 助手是客户端，外部资源是服务器，中间用 JSON-RPC 通信。

MCP 的核心抽象有三个：

1. **Resources（资源）**：只读数据，例如本地文件、GitHub 仓库内容、数据库查询结果。
2. **Tools（工具）**：可执行操作，例如"创建 GitHub Issue"、"发 Slack 消息"、"运行 shell 命令"。
3. **Prompts（提示模板）**：预定义的对话模板，例如"用这个仓库的代码风格生成组件"。

这三类抽象通过统一的协议暴露给 AI 客户端，客户端（如 Claude Desktop）在对话时可以列出"我接了哪些 MCP 服务器、有哪些资源与工具可用"，然后由模型决定何时调用。

## 23.6 MCP 协议工作原理

MCP 的工作流可以用一个简化时序来理解：

\`\`\`text
1. 用户在 Claude Desktop 配置了 MCP 服务器（如 filesystem、github）
2. Claude Desktop 启动时连接这些 MCP 服务器，握手并发现能力
3. 用户提问："帮我看一下 ~/projects/myapp 的 README"
4. Claude 模型判断：需要调用 filesystem MCP 的 read_file 工具
5. Claude Desktop 通过 JSON-RPC 调用 filesystem MCP 服务器
6. filesystem 服务器读取文件，返回内容
7. Claude 模型基于返回内容生成回答
8. 用户看到答案
\`\`\`

关键在于第 4 步：**模型自己决定要不要调用工具**。这不是写死的脚本，而是模型根据用户意图 + 可用工具列表做出的判断。这与 OpenAI 的 Function Calling 在思路上类似，但 MCP 多了一层"协议标准化"——同一套 MCP 服务器可以被任何支持 MCP 的客户端使用，不绑定 Anthropic。

## 23.7 官方 MCP 服务器

Anthropic 与社区维护了一批开箱即用的 MCP 服务器，覆盖主流场景。下表是 2026 年 7 月时点的常见官方/社区服务器（**以官方仓库为准**）：

| MCP 服务器 | 能力 | 典型用途 |
| --- | --- | --- |
| filesystem | 读写本地文件 | 让 Claude 读写本地代码与文档 |
| github | 搜索仓库、读 Issue/PR、创建 Issue | 代码审查、Issue 管理 |
| gitlab | 同上，针对 GitLab | 同上 |
| slack | 读频道、发消息 | 团队通知、知识检索 |
| google-drive | 读写 Google Docs/Sheets | 文档协作 |
| notion | 读写 Notion 页面 | 知识库 |
| postgres | 执行只读 SQL 查询 | 数据分析 |
| sqlite | 操作本地 SQLite | 本地数据 |
| puppeteer | 控制浏览器 | 网页抓取、E2E 测试 |
| memory | 跨对话持久记忆 | 长期项目记忆 |
| sequential-thinking | 结构化推理 | 复杂问题分解 |

## 23.8 Claude Desktop 的 MCP 配置

Claude Desktop 是 MCP 的"第一公民客户端"，配置 MCP 服务器的方式是编辑配置文件：

- macOS：\`~/Library/Application Support/Claude/claude_desktop_config.json\`
- Windows：\`%APPDATA%\\Claude\\claude_desktop_config.json\`

一个典型的配置文件如下（以 filesystem 与 github 为例）：

\`\`\`json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/me/projects"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxx" }
    }
  }
}
\`\`\`

配置完重启 Claude Desktop，对话框下方会多出一个"工具"图标，点开能看到已连接的 MCP 服务器与可用工具。之后你就可以说"帮我看一下 myapp 仓库最近的 5 个 PR"，Claude 会自动调用 github MCP。

**安全提示**：MCP 服务器能访问的资源和权限，就是 Claude 能访问的。配置 filesystem 时一定要限定目录（不要给根目录），配置 github 时用最小权限 token，配置 postgres 时用只读账号。MCP 是把"AI 的手"伸到了真实系统上，权限控制必须严肃对待。

## 23.9 自定义 MCP 服务器

MCP 协议是开源的，你可以自己写一个 MCP 服务器。官方提供了 TypeScript 与 Python 的 SDK，最小实现只需几十行。一个典型的自定义场景是"让 Claude 能查询公司内部的 Jira/Confluence"——写一个 MCP 服务器封装内部 API，暴露为 tools，Claude Desktop 配置后就能用。

自定义 MCP 服务器的最小骨架（TypeScript）：

\`\`\`typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "my-server", version: "0.1.0" });

// 注册一个 tool：根据工单号查询内部工单系统
server.tool("get_ticket", { id: z.string() }, async ({ id }) => {
  const res = await fetch(\`https://internal-api/tickets/\${id}\`, {
    headers: { Authorization: "Bearer " + process.env.INTERNAL_TOKEN },
  });
  const data = await res.json();
  return { content: [{ type: "text", text: JSON.stringify(data) }] };
});

await server.connect(new StdioServerTransport());
\`\`\`

写完用 \`npx tsx server.ts\` 跑起来，在 claude_desktop_config.json 里加一条配置指向它，重启 Claude Desktop 即可。

## 23.10 Artifacts + MCP 的组合威力

最后值得强调的是 Artifacts 与 MCP 的"组合拳"。一个典型流程是：通过 MCP 让 Claude 读取本地仓库的 README 与组件源码 → 让 Claude 基于这些代码生成一个"组件演示页"的 React Artifact → 在右侧预览效果 → 满意后通过 MCP 让 Claude 把演示页写到本地文件。这个流程把"读真实代码 → 生成可预览产物 → 写回真实系统"打通，是 Claude 区别于其他对话 AI 的核心竞争力之一。
`,
    code: `// =============================================================
// 第23章示例：MCP 服务器能力清单与调用模拟器
// 模拟 Claude Desktop 发现 MCP 服务器能力，并根据用户意图选择工具
// =============================================================

// ---- MCP 服务器定义 ----
const MCP_SERVERS = [
  {
    name: "filesystem",
    tools: [
      { name: "read_file",   desc: "读取本地文件",       args: ["path"] },
      { name: "write_file",  desc: "写入本地文件",       args: ["path", "content"] },
      { name: "list_dir",    desc: "列出目录内容",       args: ["path"] },
    ],
    resources: ["~/projects/**"],
    securityNote: "需限定根目录，避免暴露敏感文件",
  },
  {
    name: "github",
    tools: [
      { name: "search_repos", desc: "搜索 GitHub 仓库",  args: ["query"] },
      { name: "list_prs",     desc: "列出仓库 PR",       args: ["owner", "repo"] },
      { name: "create_issue", desc: "创建 Issue",        args: ["owner", "repo", "title", "body"] },
    ],
    resources: ["public github data"],
    securityNote: "用最小权限 token，避免写权限泄漏",
  },
  {
    name: "slack",
    tools: [
      { name: "send_message", desc: "发 Slack 消息",      args: ["channel", "text"] },
      { name: "read_channel", desc: "读频道最近消息",    args: ["channel", "limit"] },
    ],
    resources: ["工作区频道"],
    securityNote: "建议只读 + 限定频道，避免误发消息",
  },
  {
    name: "postgres",
    tools: [
      { name: "query", desc: "执行只读 SQL 查询", args: ["sql"] },
    ],
    resources: ["只读视图"],
    securityNote: "必须用只读账号，禁止 DDL/DML",
  },
];

// ---- 模拟 Claude 模型的工具选择逻辑 ----
// 真实情况下这是模型自己判断的，这里用规则模拟
function selectTool(userIntent, servers) {
  const intent = userIntent.toLowerCase();
  const matches = [];

  for (const s of servers) {
    for (const t of s.tools) {
      // 简单关键词匹配
      const keywords = {
        read_file: ["看", "读", "查看", "read", "文件"],
        write_file: ["写", "保存", "write", "存"],
        list_dir: ["目录", "list", "文件夹"],
        search_repos: ["搜索仓库", "search repo", "找仓库"],
        list_prs: ["pr", "pull request", "合并请求"],
        create_issue: ["建 issue", "提 issue", "创建 issue"],
        send_message: ["发消息", "通知", "send", "slack"],
        read_channel: ["读频道", "看频道", "频道消息"],
        query: ["查询", "sql", "数据库", "query"],
      };
      const kws = keywords[t.name] || [];
      if (kws.some((k) => intent.includes(k))) {
        matches.push({ server: s.name, tool: t, reason: "关键词命中：" + kws.filter((k) => intent.includes(k)).join(", ") });
      }
    }
  }
  return matches;
}

// ---- 模拟用户提问 ----
const USER_QUERIES = [
  "帮我看一下 ~/projects/myapp 的 README",
  "查一下 facebook/react 最近的 5 个 PR",
  "在 #dev 频道发一条'明早 10 点开站会'的通知",
  "查一下 users 表里最近 7 天的注册量",
  "把这段代码保存到 ~/projects/myapp/src/utils.js",
];

// ---- 执行工具选择 ----
console.log("========================================");
console.log("  MCP 工具调用模拟器");
console.log("  已连接服务器：" + MCP_SERVERS.map((s) => s.name).join(", "));
console.log("========================================\\n");

USER_QUERIES.forEach((q) => {
  console.log("用户：" + q);
  const matches = selectTool(q, MCP_SERVERS);
  if (matches.length === 0) {
    console.log("  → 未匹配到工具，Claude 直接用自身知识回答");
  } else {
    matches.forEach((m) => {
      console.log("  → 候选：" + m.server + "." + m.tool.name + "(" + m.tool.args.join(", ") + ")");
      console.log("    " + m.reason);
    });
  }
  console.log("");
});

// ---- 安全审计 ----
console.log("========================================");
console.log("  MCP 安全审计清单");
console.log("========================================");
MCP_SERVERS.forEach((s) => {
  console.log("【" + s.name + "】");
  console.log("  资源范围：" + s.resources.join(", "));
  console.log("  ⚠ " + s.securityNote);
  console.log("");
});

console.log("✅ 模拟完成。真实工具选择由 Claude 模型基于意图判断，本示例仅作原理演示。");
`
  },

  {
    id: "aiapp-claude-prompts",
    icon: "✍️",
    group: "Claude深度使用",
    title: "Claude 提示词技巧",
    content: `
# 第24章：Claude 提示词技巧

## 24.1 Claude 提示词的整体特点

Claude 在提示词上与 GPT 系列有明显差异，这些差异源自 Anthropic 的训练与对齐方式。理解这些差异，能让你给 Claude 写的提示词事半功倍。总结起来，Claude 的提示词有三个特点：

**第一，偏爱 XML 标签**。Claude 在训练时被"教会"了识别 XML 标签作为结构分隔符。当你用 \`<context>...</context>\`、\`<instruction>...</instruction>\` 这类标签时，Claude 解析得更准、漏听得更少。这不是玄学，而是 Anthropic 在官方 prompt engineering 文档里明确推荐的做法。相比之下，GPT 系列更习惯 Markdown 分隔符（如 \`---\` 或 \`###\`）。

**第二，长上下文优势明显**。Claude 4 系列 200K/1M 的上下文窗口不是摆设，它在"长 system prompt + 长 context + 短 instruction"的结构下表现尤其好。你可以放心地把大量背景资料塞进 \`<context>\`，Claude 会认真读完，而不会像某些模型那样"看到后面忘了前面"。

**第三，思维链（Chain-of-Thought）原生支持**。Claude 4 系列在 API 上有 \`thinking\` 参数，可以让模型在回答前显式"思考"。在对话场景下，你也可以用"Let's think step by step"或"先分析再回答"来触发思维链。Claude 的思维链输出比 GPT 更结构化，适合复杂推理任务。

## 24.2 Claude 偏好的提示词结构

一个"Claude 友好"的提示词通常遵循这个结构：

\`\`\`text
<role>你是一位资深前端工程师</role>

<context>
项目背景：Next.js 14 + TypeScript + Tailwind 的 SaaS 应用
团队规范：函数组件优先、Tailwind 原子类、Server Component 优先
相关文档：（贴入参考文档）
</context>

<instruction>
请帮我写一个带搜索的下拉选择组件
</instruction>

<constraints>
1. 支持 keyboard 导航
2. 不引入第三方库
3. TypeScript 严格模式，禁止 any
</constraints>

<output_format>
先给一段不超过 3 行的设计说明，再给代码（标注 tsx），最后给"为什么这么做"的 3 条理由
</output_format>
\`\`\`

这个结构的关键是用 XML 标签把"角色、背景、指令、约束、输出格式"五块分开。Claude 会更精准地识别每一块的作用，不会把"约束"误当成"指令"的一部分。

## 24.3 XML 标签 vs Markdown 分隔符

很多从 ChatGPT 迁移过来的用户会问：为什么我原来用 \`###\` 分隔的提示词，在 Claude 上效果变差了？原因就是 Claude 训练时更偏 XML。下表对比两种风格在 Claude 上的表现：

| 维度 | XML 标签 (\`<tag>\`) | Markdown 分隔符 (\`###\` / \`---\`) |
| --- | --- | --- |
| 结构识别准确度 | 高（Claude 训练时大量见） | 中（能识别但不如 XML） |
| 嵌套表达 | 支持（标签可嵌套） | 弱（嵌套易混乱） |
| 可读性 | 略冗长但清晰 | 简洁但易混淆 |
| 跨模型兼容 | Claude 最优，GPT 也能用 | GPT 最优，Claude 也能用 |
| 长文档内定位 | 强（标签天然分块） | 弱（标题层级易漂移） |

建议：**给 Claude 写提示词，默认用 XML 标签**；只有当提示词很短、结构很简单的时，用 Markdown 分隔符也无妨。

## 24.4 Claude 的"prefers"行为

Anthropic 官方文档里列了一些 Claude 的"偏好"行为，理解这些能让你的提示词更顺滑：

1. **Claude 偏爱明确的角色设定**。开头说一句"你是一位 X 专家"，效果比不说好得多。
2. **Claude 偏爱被给"参考样本"**。给一两个理想回答的范例，Claude 会模仿其风格与结构。
3. **Claude 偏爱"先思考再回答"**。对复杂任务，显式说"先逐步分析，再给结论"，能显著提升质量。
4. **Claude 偏爱被指出"不要做什么"**。负面约束（"不要用 any"、"不要写注释解释语法"）比正面要求更有效。
5. **Claude 偏爱结构化输出**。让它"用表格"、"用编号列表"、"先结论再展开"，它会照做且更稳定。

## 24.5 Claude 4 系列的新提示词特性

Claude 4 系列在提示词上有几个新特性：

**1. 显式 thinking 参数**。API 上可以传 \`thinking: { type: "enabled", budget_tokens: 4096 }\`，让 Claude 在回答前用最多 4096 token 思考。思考过程会作为 \`thinking\` 类型的 content block 返回，可读但默认不计入最终回答。这对复杂推理（算法设计、架构决策、bug 排查）提升明显。

**2. Prompt Caching 原生支持**。在 system prompt 或长 context 里加上 \`cache_control: { type: "ephemeral" }\` 标记，Anthropic 会缓存这部分内容，后续调用若这部分不变则按缓存价计费（约正常价的 10%）。对"长 system prompt + 短问题"的调用模式能省 50%~90% 输入费用。

**3. Tool Use 标准化**。Claude 4 系列的 tool use 接口与 OpenAI Function Calling 思路一致但更严格——工具 schema 用 JSON Schema 描述，模型返回 tool_use block，客户端执行后回传 tool_result。这套机制比早期 Claude 的"伪 function calling"可靠得多。

**4. 长上下文 1M 窗口（部分型号）**。API 上可申请启用 1M 上下文，配合 prompt caching，能塞入整本代码库或长文档。但要注意 1M 窗口的延迟与成本显著高于 200K。

## 24.6 Claude 与 GPT 提示词差异

把 Claude 与 GPT 的提示词风格放在一起对比，能帮你在两者间切换：

| 维度 | Claude | GPT |
| --- | --- | --- |
| 结构分隔 | XML 标签最优 | Markdown 分隔符最优 |
| 角色设定 | 开头一句"你是 X 专家"很有效 | 有效但不如 Claude 明显 |
| 长上下文 | 200K/1M，中段遗忘控制好 | 128K~1M，整体也强 |
| 思维链 | API 有 thinking 参数，对话可用"step by step" | o 系列内置推理，无需提示 |
| 负面约束 | 非常有效 | 有效 |
| 输出格式控制 | 强（XML 标签 + 显式格式说明） | 强（Markdown + 显式格式说明） |
| 参考样本 | 少量样本即可模仿 | 少量样本即可模仿 |
| 多语言 | 中英都强，中文长文结构好 | 中英都强，中文偏口语 |

一个实用建议：**写一次提示词，同时测 Claude 和 GPT**。同一份提示词在两个模型上的表现差异，能帮你快速定位"是提示词写得不清楚，还是模型本身不擅长"。

## 24.7 长文档处理技巧

Claude 的长上下文优势在"长文档处理"上最明显。常见场景：让 Claude 读完一份 50 页的 API 文档，回答"这个 API 怎么用 X 功能"。技巧有三：

**1. 用 \`<document>\` 标签包裹整篇文档**。让 Claude 明确知道"这一整块是一份文档"，而不是分散的片段。

**2. 在文档前给出"阅读任务"**。先告诉 Claude "你接下来要读一份 X 文档，读完后我会问你 Y 问题"，让它带着任务读，比"读完再说"更聚焦。

**3. 用章节锚点引用**。文档里有明显章节标题时，让 Claude "引用章节号回答"，能减少幻觉。

示例结构：

\`\`\`text
<task>
你接下来会读到一份 Stripe API 文档。读完后请回答：
1. 如何用 Payment Intent 收款
2. 退款的最简流程是什么
回答时引用文档章节号。
</task>

<document>
（贴入 Stripe API 文档全文）
</document>
\`\`\`

## 24.8 System Prompt 与 User Prompt 分离

Claude API 把 \`system\` 字段独立出来，这是与 OpenAI 早期接口的一个差异（OpenAI 后来也支持了独立的 system 字段）。把哪些内容放 system、哪些放 user，是有讲究的：

- **System Prompt 放**：角色、长期约束、输出格式、安全策略。这些"对所有对话都成立"的内容。
- **User Prompt 放**：本次具体任务、本次具体上下文。这些"只对本次对话成立"的内容。

这种分离的好处是：System Prompt 可以被 prompt caching 缓存，多次调用只计费一次；User Prompt 每次变化，正常计费。把不变的内容放 system、变化的内容放 user，能最大化 caching 收益。

## 24.9 如何让 Claude 输出 Artifacts

最后一个高频问题：怎么让 Claude 输出 Artifact 而不是普通代码块？答案是**显式要求 + 给类型暗示**。Claude 默认会自己判断"这段代码值不值得做成 Artifact"，但你可以主动触发：

\`\`\`text
请用 React Artifact 形式输出这个组件，让我能在右侧直接预览效果。
\`\`\`

或者更具体：

\`\`\`text
请把这个组件写成一个独立的 .tsx Artifact，要求：
1. 自包含，不依赖外部状态
2. 用 Tailwind 样式
3. 在 Artifact 里渲染一个可点击的 Demo
\`\`\`

如果 Claude 没响应，可以追加一句"为什么没生成 Artifact？请用 Artifact 重新输出"。通常一两次引导后 Claude 就会持续以 Artifact 形式输出。

## 24.10 提示词调试的复盘习惯

最后分享一个调试习惯：每次 Claude 给的回答不满意，先别急着骂模型，按这个顺序复盘：

1. **角色设定够不够明确**？没说"你是 X 专家"的话，加上试试。
2. **约束分块够不够清晰**？约束混在指令里的话，用 \`<constraints>\` 单独包起来。
3. **输出格式够不够具体**？"写好一点"不算格式，"先结论再代码再 3 条解释"才算。
4. **有没有给参考样本**？给一个理想回答范例，效果立竿见影。
5. **是不是该用 thinking**？复杂任务加上"先逐步分析再回答"。

五步走完，90% 的"模型不行"其实都是"提示词不行"。
`,
    code: `// =============================================================
// 第24章示例：Claude 提示词构建器与缓存收益估算
// 输入任务画像，输出符合 Claude 偏好的 XML 结构提示词，并估算缓存收益
// =============================================================

// ---- 任务画像 ----
const TASKS = [
  {
    name: "写一个 React 组件",
    role: "资深前端工程师（Next.js 14 + TypeScript + Tailwind）",
    context: "SaaS 应用，函数组件优先，Server Component 优先",
    instruction: "写一个带搜索框的下拉选择组件",
    constraints: ["支持键盘上下键导航", "不引入第三方库", "禁止 any"],
    outputFormat: "先 3 行设计说明，再 tsx 代码，最后 3 条设计理由",
    artifact: true,
  },
  {
    name: "解读 Stripe API 文档",
    role: "支付系统集成专家",
    context: "（贴入 50 页 Stripe API 文档）",
    instruction: "说明 Payment Intent 的完整收款流程，引用章节号",
    constraints: ["不要编造文档未提及的参数", "代码示例用 Node.js"],
    outputFormat: "流程概述 + 关键参数表 + 代码示例 + 章节引用",
    artifact: false,
  },
  {
    name: "排查一个线上 bug",
    role: "资深后端工程师（Node.js + PostgreSQL）",
    context: "（贴入报错日志 + 相关代码）",
    instruction: "分析这个偶发性 500 错误的根因，给出修复方案",
    constraints: ["先逐步推理再下结论", "修复方案要给出回滚预案"],
    outputFormat: "推理过程 + 根因结论 + 修复代码 + 回滚步骤",
    artifact: false,
  },
];

// ---- 提示词构建器：输出符合 Claude 偏好的 XML 结构 ----
function buildPrompt(task) {
  const parts = [];
  parts.push("<role>" + task.role + "</role>");
  parts.push("");
  parts.push("<context>");
  parts.push(task.context);
  parts.push("</context>");
  parts.push("");
  parts.push("<instruction>");
  parts.push(task.instruction);
  parts.push("</instruction>");
  parts.push("");
  parts.push("<constraints>");
  task.constraints.forEach((c, i) => parts.push((i + 1) + ". " + c));
  parts.push("</constraints>");
  parts.push("");
  parts.push("<output_format>");
  parts.push(task.outputFormat);
  parts.push("</output_format>");

  if (task.artifact) {
    parts.push("");
    parts.push("<artifact_request>");
    parts.push("请以 React Artifact 形式输出组件，在右侧渲染可交互 Demo。");
    parts.push("</artifact_request>");
  }

  // 复杂任务触发思维链
  if (task.name.includes("排查") || task.name.includes("解读")) {
    parts.push("");
    parts.push("<!-- 触发思维链：先在 <thinking> 标签里逐步分析，再在 <answer> 里给最终结论 -->");
    parts.push("请先在 <thinking> 标签内逐步分析，再在 <answer> 标签内给出最终回答。");
  }

  return parts.join("\\n");
}

// ---- System/User 分离建议 ----
function splitSystemUser(task) {
  const systemParts = [
    "角色：" + task.role,
    "长期约束：" + task.constraints.join("；"),
    "输出格式：" + task.outputFormat,
  ];
  const userParts = [
    "本次上下文：" + task.context,
    "本次任务：" + task.instruction,
  ];
  if (task.artifact) userParts.push("请以 React Artifact 形式输出。");
  return { system: systemParts.join("\\n"), user: userParts.join("\\n") };
}

// ---- 缓存收益估算 ----
function estimateCacheSavings(systemTokens, userTokens, calls) {
  // 假设：不缓存每次都按 system+user 全价计费
  // 缓存后：第一次按全价，后续 system 按 10%、user 全价
  const fullPrice = 3;    // Sonnet 4 输入约 $3/M（示意）
  const cachePrice = 0.3; // 缓存读取约 10%
  const cacheWrite = 3.75; // 缓存写入约 1.25x

  const withoutCache = (systemTokens + userTokens) * calls / 1_000_000 * fullPrice;
  const withCache =
    systemTokens / 1_000_000 * cacheWrite +    // 首次写入
    systemTokens / 1_000_000 * cachePrice * (calls - 1) +  // 后续读缓存
    userTokens * calls / 1_000_000 * fullPrice;             // user 每次全价

  return {
    withoutCache: withoutCache.toFixed(4),
    withCache: withCache.toFixed(4),
    saved: (withoutCache - withCache).toFixed(4),
    savedPct: ((1 - withCache / withoutCache) * 100).toFixed(1) + "%",
  };
}

// ---- 执行 ----
console.log("========================================");
console.log("  Claude 提示词构建报告");
console.log("========================================\\n");

TASKS.forEach((task) => {
  console.log("【任务】" + task.name);
  console.log("────────────────────────────────────");
  console.log("[构建后的提示词（XML 结构）]");
  console.log(buildPrompt(task));
  console.log("");

  const split = splitSystemUser(task);
  console.log("[System / User 分离建议]");
  console.log("SYSTEM:");
  console.log(split.system);
  console.log("USER:");
  console.log(split.user);
  console.log("");

  // 假设 system 约 800 token、user 约 300 token、调用 100 次
  const cache = estimateCacheSavings(800, 300, 100);
  console.log("[Prompt Caching 收益估算（100 次调用）]");
  console.log("  不开缓存：$" + cache.withoutCache);
  console.log("  开缓存  ：$" + cache.withCache);
  console.log("  节省    ：$" + cache.saved + "（" + cache.savedPct + "）");
  console.log("\\n");
});

console.log("✅ 构建完成。实际 token 与价格请以官方 tokenizer 与价格页为准。");
`
  },

  {
    id: "aiapp-claude-workflow",
    icon: "🎬",
    group: "Claude深度使用",
    title: "Claude 实战工作流",
    content: `
# 第25章：Claude 实战工作流

## 25.0 本章导览

前四章讲了 Claude 的产品、Projects、Artifacts/MCP、提示词。本章把这些串起来，用 5 个完整实战场景演示"怎么用 Claude 真正干活"。每个场景包含：目标、prompt 模板、Artifacts 输出预期、人工验收要点。建议你边读边在自己的 Claude.ai 里复现一遍，比看十遍文档都有用。

## 25.1 场景一：用 Claude 写一个 React 组件库并预览

**目标**：从零生成一个包含 5 个组件的最小 React 组件库（Button、Input、Select、Modal、Toast），每个组件都能在 Artifacts 里预览。

**prompt 模板**：

\`\`\`text
<role>你是资深前端组件库作者，熟悉 React 18 + TypeScript + Tailwind</role>

<context>
我要做一个内部组件库，技术栈：React 18 + TypeScript 严格模式 + Tailwind。
设计语言：圆角 8px、主色 #3b82f6、过渡 150ms。
参考组件库：shadcn/ui 的 API 风格。
</context>

<instruction>
帮我生成 5 个组件：Button、Input、Select、Modal、Toast。
每个组件单独输出为一个 React Artifact，要求：
1. 自包含、可独立预览
2. 在 Artifact 内渲染一个可交互 Demo
3. TypeScript 严格模式，禁止 any
4. 用 Tailwind 原子类，不引入第三方 UI 库
</instruction>

<constraints>
1. 组件 API 用 forwardRef + ref 转发
2. 支持 className 透传，可被外部覆盖样式
3. Button 支持 variant: primary/secondary/danger/ghost
4. Modal 支持 onClose 与 esc 关闭
5. Toast 支持队列与自动消失
</constraints>

<output_format>
每个组件按以下顺序输出：
1. 组件名 + 一句话用途
2. API 表格（props 名 / 类型 / 默认值 / 说明）
3. React Artifact（含可交互 Demo）
4. 设计理由（3 条）
</output_format>
\`\`\`

**Artifacts 输出预期**：Claude 会依次输出 5 个 .tsx Artifact，每个右侧都能预览。Button 的 Demo 应该能点击并展示不同 variant；Modal 的 Demo 应该能打开/关闭；Toast 的 Demo 应该能触发队列。

**人工验收要点**：
- 5 个组件 API 是否一致（都支持 className、ref）。
- TypeScript 严格模式能否通过（复制到本地 tsc 跑一遍）。
- Modal 的 esc 关闭是否真的生效（在 Artifact 里按 Esc 测试）。
- Toast 队列是否正确处理"快速触发 3 次"。
- 是否有 any 残留（grep 一下输出代码）。

## 25.2 场景二：用 Claude 阅读理解一个大型开源项目

**目标**：让 Claude 读完一个中型开源仓库（如 next.js 仓库的某子目录），输出"架构说明 + 关键模块清单 + 入口流程图"。

**prompt 模板**：

\`\`\`text
<role>你是资深开源项目阅读者，擅长从代码反推架构</role>

<context>
我将贴入 Next.js 仓库 packages/next/src/server 目录的源码（约 200K tokens）。
</context>

<instruction>
读完这份源码后，请输出：
1. 整体架构说明（≤500 字）
2. 关键模块清单：每个模块一行，包含【模块名】【职责】【核心文件】【对外 API】
3. 入口流程图：用 Mermaid 画出"一个 HTTP 请求进入 Next.js server 后的处理流程"
4. 我作为新人想读这份代码，建议的阅读顺序（≤10 个文件，按顺序）
</instruction>

<constraints>
1. 不要编造代码里没有的模块
2. Mermaid 图用 graph TD 语法
3. 引用文件时用相对路径
</constraints>

<output_format>
按上述 4 个小节顺序输出，每节用 ## 标题
</output_format>

<document>
（贴入源码文件，按文件名分块）
</document>
\`\`\`

**Artifacts 输出预期**：第 3 节会输出一个 mermaid Artifact，右侧渲染成架构图。其他节是 Markdown。

**人工验收要点**：
- 架构说明有没有提到关键模块（如 router、render、middleware）。
- Mermaid 图能不能正确渲染（不渲染说明语法错了）。
- 建议阅读顺序里的文件路径是否真实存在（在本地仓库 grep 验证）。
- 有没有出现"代码里没有但 Claude 编出来的"模块（最容易幻觉的地方）。

## 25.3 场景三：用 Claude 做技术方案对比与决策

**目标**：在两个技术方案之间做选型（如 Redis vs Memcached 做缓存），让 Claude 给出结构化对比与推荐。

**prompt 模板**：

\`\`\`text
<role>你是资深架构师，擅长做有依据的技术选型</role>

<context>
业务场景：日活 50 万的 SaaS，需要做会话缓存与热点数据缓存。
QPS 峰值 5 万，缓存命中率目标 ≥95%。
团队现状：熟悉 Redis，但运维对 Memcached 也有经验。
</context>

<instruction>
对比 Redis 与 Memcached 在本场景下的选型，输出：
1. 维度对比表（数据结构 / 持久化 / 集群 / 性能 / 运维成本 / 团队学习成本）
2. 针对本场景的关键差异分析（≤3 条）
3. 推荐方案 + 理由
4. 推荐方案的风险与缓解措施
</instruction>

<constraints>
1. 不要给"两者都很好"式的和稀泥结论
2. 必须给出明确推荐
3. 引用数据时标注来源（官方文档/权威 benchmark）
</constraints>

<output_format>
对比表用 Markdown 表格；其他小节用 ## 标题
</output_format>
\`\`\`

**Artifacts 输出预期**：主要是 Markdown 输出，可能有一个对比表的 Artifact。

**人工验收要点**：
- 推荐结论是否明确（一句话能说出来）。
- 对比表是否有"硬数据"（QPS、延迟、内存占用），而不是只有"高/中/低"。
- 风险与缓解措施是否对得上（缓解措施真能缓解风险）。
- 引用的数据来源是否可查（去官方文档/benchmark 原文核对）。

## 25.4 场景四：用 Claude 写技术博客并自动生成配图

**目标**：写一篇《Next.js Server Components 实战》的技术博客，文字 + 配图（架构图 + 流程图）一次性产出。

**prompt 模板**：

\`\`\`text
<role>你是资深技术博客作者，文风简洁、重代码、轻套话</role>

<context>
读者：有 1-3 年 React 经验、刚接触 Next.js 14 的开发者。
篇幅：3000-4000 字。
风格：先讲为什么，再讲怎么做，最后给完整可跑代码。
</context>

<instruction>
写一篇《Next.js Server Components 实战》博客，包含：
1. 开篇：为什么需要 Server Components（≤300 字）
2. 核心概念：Server / Client / Shared 三类组件的边界
3. 实战：做一个"带搜索的产品列表页"，Server Component 取数 + Client Component 处理交互
4. 配图：
   - 一张 SVG 架构图：Server / Client 组件的渲染流程
   - 一张 Mermaid 时序图：用户搜索时的请求/响应时序
5. 踩坑总结（≤5 条）
</instruction>

<constraints>
1. 代码用 tsx，TypeScript 严格模式
2. 配图 SVG 用 Artifact 输出，Mermaid 用 mermaid Artifact 输出
3. 不要"让我们一起来探索"这类套话
</constraints>

<output_format>
按上述 5 节顺序输出，每节 ## 标题
</output_format>
\`\`\`

**Artifacts 输出预期**：SVG 配图 1 个（.svg Artifact）、Mermaid 时序图 1 个（mermaid Artifact）、博客正文 Markdown。三者在对话里依次出现。

**人工验收要点**：
- 字数是否在 3000-4000 之间（用工具数一下）。
- SVG 图是否真的渲染（不渲染说明语法有问题）。
- Mermaid 时序图是否覆盖"用户搜索"的完整链路。
- 代码能不能跑（复制到本地 Next.js 项目试一下）。
- 踩坑总结是不是真踩过（有具体场景，而不是"注意性能"这种废话）。

## 25.5 场景五：Claude Code 实战 —— 给 Next.js 项目加单元测试

**目标**：用 Claude Code 给一个已有 Next.js 项目补齐单元测试，覆盖 utils 目录下的所有函数。

**操作流程**（在终端里）：

\`\`\`bash
# 1. 进入项目目录
cd ~/projects/my-app

# 2. 启动 Claude Code（用订阅账号或 API Key）
claude

# 3. 在 Claude Code 里下达任务
> 帮我给 src/utils 下的所有函数补单元测试，要求：
> 1. 用 Vitest，不要 Jest
> 2. 每个函数一个测试文件，放在 src/utils/__tests__/
> 3. 覆盖正常路径、边界值、异常输入
> 4. 跑通所有测试后再提交 commit
\`\`\`

**Claude Code 的预期行为**：

1. 读 \`src/utils\` 下所有文件，列出待测函数清单。
2. 检查 \`package.json\` 是否已装 vitest，没有则安装。
3. 逐个生成测试文件，写入 \`src/utils/__tests__/\`。
4. 运行 \`npx vitest run\`，根据失败用例自我修正。
5. 全部通过后，提 commit（消息形如 "test(utils): add unit tests for utils"）。

**人工验收要点**：
- 测试文件数量是否覆盖所有待测函数（对比 utils 文件数与 __tests__ 文件数）。
- 覆盖率是否达标（跑 \`npx vitest run --coverage\`，目标 ≥90%）。
- 边界用例是否真的"边界"（例如数字参数测了 0、负数、MAX_SAFE_INTEGER）。
- commit 是否只动了测试文件，没碰源码（\`git diff HEAD~1 --stat\` 检查）。
- Claude Code 有没有"为了通过测试改源码"的危险行为（必须禁止，发现立刻回滚）。

## 25.6 五个场景的共性方法论

把五个场景放一起看，能提炼出用 Claude 干活的四步方法论：

1. **先想清楚交付物**：组件库、架构说明、选型报告、博客、测试。Claude 不知道你要什么，必须你先想清楚。
2. **写结构化 prompt**：用 XML 标签分块，角色/背景/指令/约束/输出格式五件套。
3. **小步验证**：别让 Claude 一次产出 5000 字，先让它产出一小段，验证方向对了再继续。
4. **人工验收不可省**：Claude 的输出是"草稿"，不是"成品"。验收清单要具体（字数、文件数、覆盖率、路径真实存在）。

## 25.7 常见踩坑与对策

最后列几个高频踩坑：

| 踩坑 | 现象 | 对策 |
| --- | --- | --- |
| Artifact 没触发 | Claude 只输出代码块 | 显式说"用 React Artifact 输出" |
| 长文档中段遗忘 | Claude 漏掉文档中间内容 | 用 \`<document>\` 包裹 + 带任务读 |
| Claude Code 改源码 | 为了让测试过改业务代码 | prompt 里明确"禁止改 src 源码，只能加测试" |
| 选型给和稀泥结论 | "两者都很好" | 约束里写"必须给明确推荐" |
| Mermaid 不渲染 | 语法错误 | 要求 Claude "用 graph TD 语法"或"sequenceDiagram 语法" |
| 缓存没生效 | 费用没降 | 检查 cache_control 标记位置是否在 system prompt 末尾 |

## 25.8 小结

Claude 不是"问答机器"，而是"协作伙伴"。把它用好的核心不是记多少 prompt 模板，而是建立"结构化表达需求 + 小步验证 + 严肃验收"的工作习惯。这套习惯一旦养成，你会发现 Claude 在你工作流里的位置从"偶尔问一下"变成"几乎所有产出都先过它一遍"——这就是 AI 编程时代的"新常态"。
`,
    code: `// =============================================================
// 第25章示例：Claude 实战工作流编排器
// 把 5 个实战场景抽象成可执行的 workflow，输出执行计划与验收清单
// =============================================================

// ---- 5 个实战场景定义 ----
const WORKFLOWS = [
  {
    id: "wf-component-library",
    name: "场景一：React 组件库",
    objective: "生成 5 个组件（Button/Input/Select/Modal/Toast），每个可预览",
    promptTags: ["role", "context", "instruction", "constraints", "output_format", "artifact_request"],
    artifacts: [
      { type: "React", count: 5, desc: "5 个可交互组件 Demo" },
    ],
    checklist: [
      "5 个组件 API 一致（className + ref 透传）",
      "TypeScript 严格模式通过（tsc 无错）",
      "Modal 的 Esc 关闭在 Artifact 里验证",
      "Toast 队列正确处理快速触发",
      "grep 输出代码无 any 残留",
    ],
    risks: ["组件 API 不一致", "Demo 不可交互", "TypeScript 类型缺失"],
  },
  {
    id: "wf-read-opensource",
    name: "场景二：阅读开源项目",
    objective: "读完源码输出架构说明 + 模块清单 + 流程图 + 阅读顺序",
    promptTags: ["role", "context", "instruction", "constraints", "output_format", "document"],
    artifacts: [
      { type: "Mermaid", count: 1, desc: "HTTP 请求处理流程图" },
    ],
    checklist: [
      "架构说明覆盖关键模块",
      "Mermaid 图能正确渲染",
      "建议阅读顺序的文件路径真实存在",
      "无幻觉模块（grep 验证）",
    ],
    risks: ["中段遗忘漏读文件", "幻觉编造模块", "Mermaid 语法错"],
  },
  {
    id: "wf-tech-decision",
    name: "场景三：技术选型对比",
    objective: "Redis vs Memcached 结构化对比 + 明确推荐",
    promptTags: ["role", "context", "instruction", "constraints", "output_format"],
    artifacts: [
      { type: "Markdown", count: 1, desc: "对比表 + 推荐报告" },
    ],
    checklist: [
      "推荐结论一句话能说清",
      "对比表含硬数据（QPS/延迟/内存）",
      "风险与缓解措施一一对应",
      "引用数据来源可查",
    ],
    risks: ["和稀泥结论", "无硬数据", "缓解措施无效"],
  },
  {
    id: "wf-tech-blog",
    name: "场景四：技术博客 + 配图",
    objective: "3000-4000 字博客 + SVG 架构图 + Mermaid 时序图",
    promptTags: ["role", "context", "instruction", "constraints", "output_format"],
    artifacts: [
      { type: "SVG", count: 1, desc: "Server/Client 组件渲染流程" },
      { type: "Mermaid", count: 1, desc: "用户搜索时序图" },
    ],
    checklist: [
      "字数 3000-4000 之间",
      "SVG 图正常渲染",
      "Mermaid 覆盖完整搜索链路",
      "代码可在本地 Next.js 项目跑通",
      "踩坑总结有具体场景",
    ],
    risks: ["字数超标或不足", "SVG 语法错", "套话太多"],
  },
  {
    id: "wf-claude-code-test",
    name: "场景五：Claude Code 补单测",
    objective: "给 Next.js 项目 utils 补 Vitest 单元测试",
    promptTags: ["instruction", "constraints"],
    artifacts: [],
    checklist: [
      "测试文件数 = utils 函数数",
      "覆盖率 ≥90%",
      "边界用例真实（0/负数/MAX_SAFE_INTEGER）",
      "commit 只动测试文件，未碰源码",
      "未出现'为通过测试改源码'行为",
    ],
    risks: ["改业务源码", "覆盖率不足", "边界用例造假"],
  },
];

// ---- 输出执行计划 ----
function printWorkflow(wf) {
  console.log("【" + wf.name + "】");
  console.log("  目标：" + wf.objective);
  console.log("  prompt 结构：" + wf.promptTags.map((t) => "<" + t + ">").join(" "));

  if (wf.artifacts.length > 0) {
    console.log("  预期 Artifacts：");
    wf.artifacts.forEach((a) => {
      console.log("    - " + a.type + " x" + a.count + "：" + a.desc);
    });
  } else {
    console.log("  预期 Artifacts：无（Claude Code 终端任务）");
  }

  console.log("  验收清单（" + wf.checklist.length + " 项）：");
  wf.checklist.forEach((c, i) => console.log("    " + (i + 1) + ". [ ] " + c));

  console.log("  风险点：");
  wf.risks.forEach((r) => console.log("    ⚠ " + r));
  console.log("");
}

// ---- 执行 ----
console.log("========================================");
console.log("  Claude 实战工作流编排器");
console.log("  共 " + WORKFLOWS.length + " 个场景");
console.log("========================================\\n");

WORKFLOWS.forEach(printWorkflow);

// ---- 汇总统计 ----
console.log("========================================");
console.log("  汇总统计");
console.log("========================================");
const totalArtifacts = WORKFLOWS.reduce((s, w) => s + w.artifacts.reduce((ss, a) => ss + a.count, 0), 0);
const totalChecklist = WORKFLOWS.reduce((s, w) => s + w.checklist.length, 0);
const totalRisks = WORKFLOWS.reduce((s, w) => s + w.risks.length, 0);
console.log("  预期 Artifacts 总数：" + totalArtifacts);
console.log("  验收清单总项数   ：" + totalChecklist);
console.log("  风险点总数       ：" + totalRisks);
console.log("");
console.log("  方法论四步：");
console.log("    1. 先想清楚交付物");
console.log("    2. 写结构化 prompt（XML 五件套）");
console.log("    3. 小步验证");
console.log("    4. 人工验收不可省");
console.log("\\n✅ 工作流编排完成。建议逐个场景在 Claude.ai / Claude Code 里复现。");
`
  }
];
