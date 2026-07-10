// =============================================================
// AI 应用编程教程 —— 第 3 批章节（AI编程工具全景组，共 5 章）
// -------------------------------------------------------------
// 章节范围：
//   11. aiapp-tools-overview  AI 编程工具分类与全景
//   12. aiapp-copilot         GitHub Copilot 实战
//   13. aiapp-cursor          Cursor 编辑器实战
//   14. aiapp-claude-code     Claude Code 终端实战
//   15. aiapp-other-tools     Windsurf/Trae/Cline/Aider/v0 等
//
// 信息时效：2026-07-05。工具版本与功能以官方为准，
//           文中会尽量给出可执行命令与真实配置示例。
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
    id: "aiapp-tools-overview",
    icon: "🧰",
    group: "AI编程工具全景",
    title: "AI 编程工具分类与全景",
    content: `
# 第11章：AI 编程工具分类与全景

前面十章我们讨论了“用哪个模型”，从这一章开始我们讨论“用什么工具”。模型是发动机，工具是底盘与方向盘——同一台发动机装到不同的底盘上，开起来的体验天差地别。2026 年的 AI 编程工具已经多到“看花眼”的程度，本章的目标是给你一张全景地图，让你在任何需求面前都能迅速定位“这件事该用哪类工具、具体哪个产品”。

## 11.1 为什么必须先分类再选工具

很多初学者的第一反应是“找个最强的工具用就行”，这个思路在 2026 年已经行不通，原因有三：

1. **能力重叠但边界不同**。Cursor 和 Copilot 都能补全、都能聊天、都能改代码，但 Cursor 擅长跨文件大改，Copilot 擅长无缝嵌入 VSCode 既有工作流。不分类，你就看不出“为什么同一个任务换个工具效率差三倍”。
2. **价格结构差异巨大**。Copilot 按订阅收费（$10~$39/月/人），Cursor 按订阅 + 用量收费，Aider 按你自己的 API 调用收费，Devin 按任务收费。不分类，你就无法做预算。
3. **学习成本不同**。Continue 这种“插件级”工具半小时上手，Claude Code 这种“终端 Agent”要花一两周才能用顺，Devin 这种“自主 Agent”要重新设计工作流。不分类，你就不知道要投入多少学习成本。

所以正确的姿势是：先看清五大分类的能力边界，再看每个分类下有哪些主流产品，最后按你的任务类型与团队规模做矩阵化选择。

## 11.2 AI 编程工具的五大分类

我们把 2026 年市面上的 AI 编程工具分成五大类，每类的核心能力、典型形态、适用场景都不同。

**第一类：IDE 集成型**。形态是“在你已有的编辑器里加 AI”，典型代表是 GitHub Copilot、Cursor、Windsurf、Trae、JetBrains AI Assistant、Continue。核心能力是行内补全、对话编辑、引用项目文件、跨文件修改。它的优势是“无缝嵌入既有工作流”，劣势是“能力受限于宿主编辑器”。这类工具适合“日常写代码 80% 的时间”。

**第二类：终端 CLI 型**。形态是“在终端里跟 AI 对话，让它直接读写文件、跑命令”，典型代表是 Claude Code、Aider、Codex CLI。核心能力是自主执行多步任务、直接操作文件系统、与 git/构建/测试深度集成。优势是“自动化程度高、能跑完整工作流”，劣势是“学习成本高、容易过度放手”。这类工具适合“批量重构、自动化修复、CI 集成”。

**第三类：聊天助手型**。形态是“网页或 App 里的对话窗口”，典型代表是 ChatGPT、Claude.ai、Gemini Web。核心能力是问答、解释、生成片段代码。优势是“随时可用、不依赖项目环境”，劣势是“不能直接操作你的代码、上下文需要手动喂”。这类工具适合“学习、调研、独立片段生成、代码审查”。

**第四类：代码生成平台型**。形态是“输入需求直接生成可运行的应用”，典型代表是 v0、Bolt.new、Lovable、Replit Agent。核心能力是从自然语言生成完整 UI 或全栈应用、内置预览与部署。优势是“从 0 到 1 极快”，劣势是“生成的代码质量参差、不适合大型项目深度迭代”。这类工具适合“原型、MVP、UI 草稿、学习新技术栈”。

**第五类：Agent 框架型**。形态是“可编程的 Agent 运行时，开发者自己定义工具与流程”，典型代表是 Devin、OpenHands、Cline、AutoGPT 系、LangGraph 编排的 Agent。核心能力是长链路自主任务、并行子任务、可接入任意工具。优势是“能处理需要多步推理 + 多工具协同的复杂任务”，劣势是“配置复杂、结果不稳定、成本高”。这类工具适合“自动化巡检、批量 issue 修复、研究探索”。

\`\`\`text
能力轴：  补全 ──── 编辑 ──── 跨文件改 ──── 自主执行 ──── 自主规划
IDE 集成:  ████████  ████████  ██████        ░░            ░░
终端 CLI:  ████      ████████  ████████      ██████        ████
聊天助手:  ████      ██████    ░░            ░░            ░░
代码生成:  ░░        ████      ████          ████          ████
Agent 框架:░░        ████      ██████        ████████      ████████
\`\`\`

上图是一个粗略的能力光谱，越靠右“自主性”越强。需要特别强调：**这五类的边界正在快速模糊**。Cursor 1.0 引入了 Background Agent（向 CLI/Agent 框架靠拢），Claude Code 引入了 IDE 集成（向 IDE 型靠拢），v0 开始支持项目级迭代（向 IDE 型靠拢）。所以分类不是用来“锁死”工具，而是用来“快速定位主战场”。

## 11.3 2026 主流工具列表

下表列出 2026 年中仍然活跃且被广泛使用的主流工具，按五大分类归档。表中“形态”列指的是它的主要使用入口。

| 工具 | 分类 | 形态 | 厂商 | 备注 |
| --- | --- | --- | --- | --- |
| GitHub Copilot | IDE 集成 | VSCode/JetBrains 插件 | GitHub/微软 | 装机量最大，企业版强 |
| Cursor | IDE 集成 | 独立 IDE（Fork VSCode） | Anysphere | Composer/Agent 模式强 |
| Windsurf | IDE 集成 | 独立 IDE（Fork VSCode） | Codeium | Cascade/flows |
| Trae | IDE 集成 | 独立 IDE + CLI + Plugin | 字节跳动 | 国内生态、TRAE 全产品线 |
| JetBrains AI Assistant | IDE 集成 | JetBrains 内置 | JetBrains | 与 IntelliJ 系深度集成 |
| Continue | IDE 集成 | VSCode/JetBrains 插件 | 开源 | 可接任意模型 |
| Claude Code | 终端 CLI | npm 全局命令 | Anthropic | 终端 Agent 旗舰 |
| Aider | 终端 CLI | pip 全局命令 | 开源 | 命令行 pair programming |
| Codex CLI | 终端 CLI | npm 全局命令 | OpenAI | 与 Codex 模型配合 |
| ChatGPT | 聊天助手 | Web/App | OpenAI | 通用对话 + Code Interpreter |
| Claude.ai | 聊天助手 | Web/App | Anthropic | Artifacts 代码预览 |
| Gemini Web | 聊天助手 | Web/App | Google | 长上下文、多模态 |
| v0 | 代码生成 | Web 平台 | Vercel | UI/组件生成 |
| Bolt.new | 代码生成 | Web 平台 | StackBlitz | 全栈应用生成 + 预览 |
| Lovable | 代码生成 | Web 平台 | Lovable | 全栈应用 + 部署 |
| Replit Agent | 代码生成 | Web 平台 | Replit | 内置环境 + 部署 |
| Devin | Agent 框架 | Web 平台 | Cognition | 自主软件工程师 |
| OpenHands | Agent 框架 | 自部署 | 开源 | 原 OpenDevin |
| Cline | Agent 框架 | VSCode 扩展 | 开源 | 自主 Agent |
| AutoGPT 系 | Agent 框架 | 自部署 | 开源 | 早期 Agent 探索 |

这张表里有些工具横跨多个分类，比如 Trae 既是 IDE 又有 CLI 和 Plugin；Cline 既是 VSCode 扩展又是 Agent 框架。表里按“主要形态”归类，使用时不必拘泥。

## 11.4 五大分类的能力边界与重叠

理解分类之后，更重要的是看清它们在能力上的重叠与边界——这决定了“什么时候该切工具”。

**IDE 集成 vs 终端 CLI**。两者都能改代码，但 IDE 型的反馈是“你看着它一行一行写”，CLI 型的反馈是“你给它一个目标，它跑完给你结果”。IDE 型适合“探索性、需要随时介入”的任务；CLI 型适合“目标明确、可以放手”的任务。比如“把这个组件改成用 React Server Components”——IDE 型更合适，因为你要随时看 diff；比如“给这个仓库所有 ts 报错都修了”——CLI 型更合适，因为它能循环跑 tsc 直到清零。

**终端 CLI vs Agent 框架**。两者都能自主执行，但 CLI 型是“一个 Agent 串行干活”，Agent 框架型是“可编排多个 Agent 并行干活”。Claude Code 的子 Agent 能并行，但编排能力比 LangGraph 弱；Devin/OpenHands 是为“长链路自主任务”设计的，能处理“读需求 → 规划 → 写代码 → 跑测试 → 修 bug → 提 PR”的全流程。日常开发用 CLI 型足够，做自动化平台才需要 Agent 框架。

**代码生成平台 vs IDE 集成**。代码生成平台“从 0 到 1”强，但“从 1 到 100”弱——它生成的代码结构很难融入既有项目。IDE 集成反过来，“从 1 到 100”强（你能精确控制每一处改动），但“从 0 到 1”弱（让它从空仓库搭一个完整脚手架不如 v0 快）。最佳实践是“v0 生成原型 → 把代码搬进项目 → Cursor/Copilot 继续迭代”。

**聊天助手 vs 其他四类**。聊天助手是“最低门槛但最弱集成”。它不能直接读你的仓库、不能跑命令、不能改文件，所有上下文都要你手动复制粘贴。但它的优势是“随时可用、不绑定项目、可跨设备”。很多资深工程师的日常工作流是“IDE 里写代码，遇到概念不懂就在 Claude.ai 旁边开一个窗口问”——两者各司其职。

## 11.5 任务 × 工具 推荐矩阵

把日常任务按类型拆开，再对每类任务推荐“首选 / 次选”工具，这就是选型矩阵。下面这张表是 2026 年的推荐组合，你可以按团队实际情况微调。

| 任务类型 | 首选 | 次选 | 理由 |
| --- | --- | --- | --- |
| 行内补全 | Copilot / Cursor Tab | Continue + 本地模型 | 高频低延迟，IDE 集成型最合适 |
| 单文件编辑 | Cursor Cmd+K | Copilot Edits | 内联编辑 + 上下文引用 |
| 跨文件重构 | Cursor Composer | Claude Code | Composer 看 diff 直观；Claude Code 适合放手 |
| 整仓库理解 | Cursor @codebase | Claude Code + CLAUDE.md | 都能做，Cursor 更交互式 |
| 写测试 | Cursor Composer | Copilot Chat / Aider | 需要读实现 + 生成测试 |
| 修 bug | Claude Code | Cursor Agent / Devin | CLI 型能循环跑测试直到通过 |
| 批量改 issue | Devin / OpenHands | Claude Code 子 Agent | Agent 框架并行处理多 issue |
| UI 原型 | v0 | Bolt.new / Lovable | 生成可预览组件，再搬进项目 |
| 全栈 MVP | Bolt.new / Lovable | Replit Agent | 内置环境 + 部署 |
| 学习/调研 | Claude.ai / ChatGPT | Gemini Web | 长文档 + 多模态 |
| 代码审查 | Copilot Chat / Cursor | Claude.ai（贴 diff） | IDE 内直接看变更 |
| CI/CD 集成 | Claude Code / Codex CLI | Aider | 命令行可脚本化 |
| 文档生成 | Cursor + @docs | Claude Code | 读代码生成文档 |

读法：首选是“这个任务用这个工具效率最高”，次选是“首选不可用时退而求其次”。比如“行内补全”首选 Copilot 或 Cursor Tab，因为它们延迟低、与编辑器深度集成；次选 Continue + 本地模型，适合“数据不能出本机”的合规场景。

## 11.6 工具演进趋势

最后看一下工具演进趋势，这能帮你判断“现在学哪个工具性价比最高”。

**趋势 1：IDE 与 CLI 在融合**。Cursor 引入 Background Agent（CLI 化），Claude Code 引入 IDE 集成（IDE 化），未来“在 IDE 里写代码 + 在后台跑 Agent”会成为标配。学习时不要只学一种形态，两类都要会。

**趋势 2：从“补全”走向“自主”**。早期工具主打补全，2025 年起主流工具都加了 Agent 模式，2026 年 Devin/OpenHands 这类自主 Agent 开始进入生产环境。这意味着工程师的角色在从“写代码的人”转向“审 Agent 输出的人”。

**趋势 3：MCP 成为通用工具协议**。Model Context Protocol 让工具、数据源、IDE 之间的连接标准化。2026 年主流工具都支持 MCP，学会配置 MCP 等于“一次配置处处可用”。

**趋势 4：规则文件成为标配**。.github/copilot-instructions.md、.cursor/rules、CLAUDE.md、.windsurfrules 这类“项目级规则文件”越来越重要——它决定了 AI 是否遵守你的代码风格、目录结构、技术选型。下一章开始我们会逐一拆解每个工具的规则文件。

**趋势 5：开源工具与企业版并行**。Continue、Aider、Cline、OpenHands 是开源代表，可自部署、可接任意模型；Copilot、Cursor、Devin 是闭源代表，体验更打磨。企业级团队往往“闭源工具给一线开发 + 开源工具给合规场景”双轨并行。

\`\`\`text
选型速记：
  日常写代码     ──>  IDE 集成型（Cursor / Copilot / Trae）
  自动化任务     ──>  终端 CLI 型（Claude Code / Aider）
  从 0 到 1      ──>  代码生成平台（v0 / Bolt.new / Lovable）
  长链路自主     ──>  Agent 框架（Devin / OpenHands / Cline）
  学习与调研     ──>  聊天助手（Claude.ai / ChatGPT / Gemini）
\`\`\`

本章是“地图”，接下来四章是“导游”——我们会逐一深入 Copilot、Cursor、Claude Code 以及 Windsurf/Trae/Cline/Aider/v0 等工具，给出可照着做的配置与工作流。
`,
    code: `// =============================================================
// 第11章示例：AI 编程工具选型矩阵
// 输入任务画像，输出推荐工具（首选 / 次选）与理由
// =============================================================

// ---- 工具库：按五大分类归档 ----
// type: ide / cli / chat / gen / agent
// caps: 能力评分（补全 / 编辑 / 跨文件 / 自主执行 / 自主规划），0~5
// cost: 月度单人成本（美元，0 表示按用量）
// learning: 学习成本（小时）
const tools = [
  { name: "GitHub Copilot",  type: "ide",   caps: [5,4,3,1,0], cost: 10,  learning: 4 },
  { name: "Cursor",          type: "ide",   caps: [5,5,5,3,2], cost: 20,  learning: 8 },
  { name: "Windsurf",        type: "ide",   caps: [5,5,4,3,2], cost: 15,  learning: 8 },
  { name: "Trae",            type: "ide",   caps: [5,5,4,3,2], cost: 12,  learning: 8 },
  { name: "JetBrains AI",    type: "ide",   caps: [4,4,3,1,0], cost: 10,  learning: 4 },
  { name: "Continue",        type: "ide",   caps: [4,4,3,2,1], cost: 0,   learning: 6 },
  { name: "Claude Code",     type: "cli",   caps: [2,4,5,5,4], cost: 0,   learning: 16 },
  { name: "Aider",           type: "cli",   caps: [1,4,4,4,3], cost: 0,   learning: 12 },
  { name: "Codex CLI",       type: "cli",   caps: [2,4,4,4,3], cost: 0,   learning: 12 },
  { name: "ChatGPT",         type: "chat",  caps: [2,3,1,1,1], cost: 20,  learning: 2 },
  { name: "Claude.ai",       type: "chat",  caps: [2,3,1,1,1], cost: 20,  learning: 2 },
  { name: "Gemini Web",      type: "chat",  caps: [2,3,1,1,1], cost: 20,  learning: 2 },
  { name: "v0",              type: "gen",   caps: [0,3,3,3,3], cost: 20,  learning: 4 },
  { name: "Bolt.new",        type: "gen",   caps: [0,3,4,4,3], cost: 20,  learning: 4 },
  { name: "Lovable",         type: "gen",   caps: [0,3,4,4,3], cost: 25,  learning: 4 },
  { name: "Devin",           type: "agent", caps: [0,3,4,5,5], cost: 500, learning: 24 },
  { name: "OpenHands",       type: "agent", caps: [0,3,4,5,5], cost: 0,   learning: 20 },
  { name: "Cline",           type: "agent", caps: [1,4,4,5,4], cost: 0,   learning: 14 },
];

// ---- 任务画像：每类任务对五大能力的权重 ----
// 顺序：补全 / 编辑 / 跨文件 / 自主执行 / 自主规划
const tasks = [
  { name: "行内补全",     weights: [0.5,0.2,0.1,0,0],   needType: ["ide"] },
  { name: "单文件编辑",   weights: [0.2,0.5,0.1,0,0],   needType: ["ide","chat"] },
  { name: "跨文件重构",   weights: [0.1,0.3,0.5,0.2,0.1], needType: ["ide","cli"] },
  { name: "整仓库理解",   weights: [0,0.2,0.5,0.2,0.1], needType: ["ide","cli"] },
  { name: "修 bug",       weights: [0.1,0.2,0.3,0.4,0.2], needType: ["cli","agent"] },
  { name: "批量改 issue", weights: [0,0.1,0.2,0.4,0.4], needType: ["agent","cli"] },
  { name: "UI 原型",      weights: [0,0.2,0.2,0.3,0.3], needType: ["gen"] },
  { name: "全栈 MVP",     weights: [0,0.2,0.3,0.3,0.3], needType: ["gen"] },
  { name: "学习调研",     weights: [0.1,0.2,0.1,0,0],   needType: ["chat"] },
  { name: "代码审查",     weights: [0.2,0.3,0.3,0.1,0], needType: ["ide","chat"] },
  { name: "CI 集成",      weights: [0,0.2,0.3,0.4,0.2], needType: ["cli"] },
  { name: "文档生成",     weights: [0.1,0.3,0.4,0.2,0], needType: ["ide","cli"] },
];

// ---- 打分函数 ----
// 综合分 = 能力加权分 - 成本惩罚 - 学习成本惩罚
function score(tool, task) {
  if (!task.needType.includes(tool.type)) return -1; // 类型不符直接淘汰
  let s = 0;
  for (let i = 0; i < 5; i++) {
    s += tool.caps[i] * task.weights[i];
  }
  // 成本惩罚：成本越高分越低（500 美元/月的 Devin 要扣得多）
  s -= Math.log10(tool.cost + 1) * 0.4;
  // 学习成本惩罚
  s -= tool.learning * 0.02;
  return s;
}

// ---- 执行：每类任务输出 Top 2 ----
console.log("========================================");
console.log("  AI 编程工具选型矩阵（2026-07）");
console.log("========================================\\n");

console.log(
  "任务".padEnd(16) +
    "首选".padStart(20) +
    "次选".padStart(20)
);
console.log("-".repeat(56));

tasks.forEach((t) => {
  const ranked = tools
    .map((m) => ({ name: m.name, score: score(m, t), type: m.type }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);
  const first = ranked[0] ? ranked[0].name : "—";
  const second = ranked[1] ? ranked[1].name : "—";
  console.log(
    t.name.padEnd(16) +
      first.padStart(20) +
      second.padStart(20)
  );
});

// ---- 五大分类能力对比图 ----
console.log("\\n========================================");
console.log("  五大分类平均能力对比（5 分制）");
console.log("========================================\\n");

const types = ["ide", "cli", "chat", "gen", "agent"];
const typeNames = { ide: "IDE 集成", cli: "终端 CLI", chat: "聊天助手", gen: "代码生成", agent: "Agent 框架" };
const capNames = ["补全", "编辑", "跨文件", "自主执行", "自主规划"];

types.forEach((tp) => {
  const group = tools.filter((t) => t.type === tp);
  const avg = capNames.map((_, i) =>
    (group.reduce((sum, t) => sum + t.caps[i], 0) / group.length).toFixed(1)
  );
  console.log(typeNames[tp].padEnd(10) + avg.map((v) => v.padStart(6)).join(""));
});

console.log("\\n能力轴：".padEnd(10) + capNames.map((n) => n.padStart(6)).join(""));

console.log("\\n========================================");
console.log("  关键洞察");
console.log("========================================");
console.log("  1. IDE 集成型在补全与编辑上最强，是日常开发主战场。");
console.log("  2. 终端 CLI 型在自主执行上强，适合放手型任务与 CI 集成。");
console.log("  3. 代码生成平台在从 0 到 1 上无对手，但深度迭代弱。");
console.log("  4. Agent 框架自主规划最强，但成本高、不稳定，慎用于生产。");
console.log("  5. 聊天助手门槛最低，适合学习调研，不适合代码深度迭代。");
console.log("\\n✅ 矩阵生成完毕，下一章将深入 GitHub Copilot 实战。");
`
  },

  {
    id: "aiapp-copilot",
    icon: "🐙",
    group: "AI编程工具全景",
    title: "GitHub Copilot 实战",
    content: `
# 第12章：GitHub Copilot 实战

GitHub Copilot 是装机量最大的 AI 编程工具，背靠 GitHub 仓库数据与微软/OpenAI 的模型能力。2026 年的 Copilot 已经远不止“行内补全”——它包含 Copilot Chat、Copilot Edits、Copilot Workspace、Copilot Agent 模式、Copilot CLI 等一整套产品线。本章把这套产品线拆开讲清楚，并给出可照着做的配置与工作流。

## 12.1 Copilot 订阅体系

Copilot 的订阅分三档，价格与能力差异明显。

**Copilot Free**（免费版）。2024 年底推出，目的是“让所有人都能试”。限制：每月 2000 次补全、50 次 Chat、不支持 Agent 模式、不能自定义指令文件。适合“个人试水、临时项目”。

**Copilot Pro**（$10/月/人，个人版）。面向个人开发者。包含：无限补全、无限 Chat、Copilot Edits、Copilot Agent 模式、Claude/GPT 等多模型选择（部分高级模型按用量限制）。这是“个人开发者的甜点档”。

**Copilot Business**（$19/月/人，企业版）。面向小团队。在 Pro 基础上增加：组织级管理、企业级安全合规（代码不进训练）、SSO、审计日志、策略管理。适合“5~50 人的团队”。

**Copilot Enterprise**（$39/月/人，企业版旗舰）。在 Business 基础上增加：知识库（可索引私有仓库）、Copilot Workspace、自定义模型微调接入、Bing 搜索集成。适合“大型企业、有内部代码库索引需求”。

\`\`\`text
选档速记：
  免费试水           ──>  Copilot Free
  个人开发           ──>  Copilot Pro ($10)
  小团队 + 合规      ──>  Copilot Business ($19)
  大企业 + 私有索引  ──>  Copilot Enterprise ($39)
\`\`\`

注意：Copilot 的代码“是否进训练”是分级别的。Free/Pro 默认会用于改进模型（可手动 opt-out），Business/Enterprise 默认不进训练。涉密项目务必选 Business 及以上。

## 12.2 Copilot 产品线全景

很多人以为“Copilot 就是补全”，其实它已经是一整套产品线。

**Copilot 行内补全**（Inline Completion）。最经典形态，写代码时按 Tab 接受灰色建议。支持多行补全、参数补全、注释生成代码。

**Copilot Chat**。在 VSCode/JetBrains 侧边栏的对话窗口，支持 @workspace、@terminal、@file 等指令引用上下文。适合“问问题、解释代码、生成片段”。

**Copilot Edits**。2024 年底推出的多文件编辑模式，类似 Cursor Composer。可以在 Chat 里描述改动，Copilot 直接修改多个文件并给出 diff。这是 Copilot 从“补全工具”走向“编辑工具”的关键一步。

**Copilot Workspace**（企业版）。一个独立的 Web 工作台，输入 Issue 描述，Copilot 生成完整的修改方案（含 spec、plan、implementation），你审核后一键应用。它把“从 Issue 到 PR”的流程产品化了。

**Copilot Agent 模式**。2025 年推出的自主执行模式，类似 Claude Code 的能力。你给一个目标，Copilot 自主读文件、改代码、跑命令、修错误。默认需要你确认每一步，可配置为“信任后自动执行”。

**Copilot CLI**。终端工具，把 Copilot 能力带到 shell。能解释命令、生成 shell 脚本、辅助写 git 操作。安装：\`gh extension install github/gh-copilot\`。

**Copilot in GitHub.com**。在 GitHub 网页上的 Copilot，能解释 PR、生成 PR 描述、回答仓库相关问题。企业版还能跨仓库索引。

## 12.3 安装与配置

以 VSCode 为例，安装步骤如下：

\`\`\`bash
# 1. 在 VSCode 扩展市场搜索 "GitHub Copilot" 并安装
#    或者用命令行安装（需要先装 code 命令）
code --install-extension GitHub.copilot
code --install-extension GitHub.copilot-chat

# 2. 安装后用 GitHub 账号登录，授权 Copilot
#    VSCode 右下角会弹出登录提示，按指引完成 OAuth

# 3. 安装 Copilot CLI（可选，需要先装 gh）
gh extension install github/gh-copilot

# 4. 验证
gh copilot --version
\`\`\`

配置建议（VSCode settings.json）：

\`\`\`json
{
  "github.copilot.enable": {
    "*": true,
    "plaintext": false,
    "markdown": true,
    "yaml": true
  },
  "github.copilot.editor.enableAutoCompletions": true,
  "github.copilot.chat.localeOverride": "zh-CN",
  "github.copilot.advanced": {
    "length": 500,
    "listCount": 3,
    "temperature": 0.1
  }
}
\`\`\`

几个关键配置项：\`localeOverride\` 设为 zh-CN 让 Chat 默认中文回复；\`temperature\` 设低让补全更“保守、可预测”；\`listCount\` 设为 3 让你按 Alt+\` 切换多个建议。

## 12.4 行内补全技巧

行内补全是 Copilot 最高频的能力，但有几个技巧能显著提升效率。

**技巧 1：用注释引导**。Copilot 强烈依赖上下文，写一句清晰的注释往往比写半个函数更能引导它生成你想要的代码。比如写 \`// 用二分查找在有序数组里找 target，返回下标或 -1\` 然后回车，Copilot 会直接给出实现。

**技巧 2：用类型签名引导**。在 TypeScript 里，先写好函数签名与类型，Copilot 会按类型约束生成实现。类型本身就是最强的上下文。

**技巧 3：示例驱动**。写一两个示例输入输出，再让 Copilot 补实现。这对“业务逻辑类”函数特别有效。

**技巧 4：按 Alt+\` 切换建议**。默认只显示一个建议，按这个组合键能看其他候选，对“Copilot 第一反应不对”的情况很有用。

**技巧 5：撤销重写**。如果 Copilot 补全方向错了，按 Ctrl+Z 撤销，然后改一下注释或前一行代码再让它补——比硬接受后手改更快。

**技巧 6：用 Tab 接受、Esc 拒绝**。Tab 接受全部，Ctrl+→ 按词接受，Ctrl+] 下一个建议。熟练这几个快捷键能让你几乎不用鼠标。

## 12.5 Copilot Chat 用法

Copilot Chat 是日常第二高频的能力。它的核心是“对话 + 引用上下文”。

**基础对话**。直接在侧边栏问问题，比如“这段代码在干什么”“怎么优化这个 SQL”。Copilot 会基于当前打开的文件回答。

**@workspace 指令**。让 Copilot 把整个工作区作为上下文。比如“@workspace 我们的鉴权中间件在哪？”Copilot 会扫描全项目并定位。

**@terminal 指令**。让 Copilot 引用终端的最近输出。比如“@terminal 这个报错怎么修”Copilot 会基于终端报错给方案。

**@file / #file 指令**。显式引用某个文件作为上下文。适合“我想让 Copilot 基于这个文件回答”。

**@vscode 指令**。问 VSCode 自身的用法，比如“@vscode 怎么配置 formatOnSave”。

**/explain、/fix、/tests、/doc 命令**。这些是 Chat 内置的快捷命令：/explain 解释选中的代码、/fix 修复选中代码的问题、/tests 给选中代码生成测试、/doc 生成文档注释。

\`\`\`text
Chat 指令速记：
  @workspace   ──>  整个工作区作上下文
  @terminal    ──>  终端最近输出作上下文
  #file        ──>  显式引用某个文件
  /explain     ──>  解释选中代码
  /fix         ──>  修复选中代码
  /tests       ──>  生成测试
  /doc         ──>  生成文档注释
\`\`\`

## 12.6 自定义指令文件 .github/copilot-instructions.md

这是 Copilot 最被低估的能力。在仓库根目录创建 \`.github/copilot-instructions.md\`，Copilot 会把它作为“系统级提示”注入到每次补全与 Chat 中。它能显著提升 Copilot “按你的规范写代码”的能力。

一个实用的指令文件示例：

\`\`\`markdown
# Copilot 项目指令

## 代码风格
- 使用 TypeScript strict 模式，禁止 any
- 函数优先用箭头函数，组件用函数声明
- 导入顺序：标准库 → 第三方 → 内部模块 → 类型
- 命名：变量 camelCase，类型 PascalCase，常量 UPPER_SNAKE

## 技术栈
- 前端：Next.js 15 + React 19 + Tailwind 4
- 状态：Zustand，不用 Redux
- 数据获取：React Query，不用 SWR
- 测试：Vitest + Testing Library

## 目录约定
- /app           路由与页面
- /components    通用组件（components/ui 是基础原子）
- /lib           工具函数与业务逻辑
- /hooks         自定义 Hook
- /types         全局类型定义

## 禁止
- 不要用 class 组件
- 不要用 useEffect 做数据获取，用 React Query
- 不要直接操作 DOM，用 ref
- 不要在组件里写内联样式，用 Tailwind 类

## 生成代码时的偏好
- 默认给出完整可运行代码，不要省略 import
- 注释用中文，写在代码上方
- 复杂逻辑加注释，简单逻辑不加
- 错误处理用 Result 模式，不要 throw
\`\`\`

**指令文件最佳实践**：

1. **短而精**。文件不要超过 100 行，太长 Copilot 会忽略后面的内容。把最重要的规则放前面。
2. **正面表述优先**。多写“应该怎么样”，少写“不要怎么样”。模型对正面指令的遵循率更高。
3. **用例子说话**。写“好例子：\`const sum = (a, b) => a + b\`”比写“用箭头函数”更有效。
4. **分模块写**。技术栈、目录、风格、禁止项分开写，便于维护。
5. **随项目演进**。每次发现 Copilot 反复犯同一个错，就加一条规则。
6. **提交到 git**。指令文件必须进版本控制，全团队共享同一份。

## 12.7 Copilot Workspace 与 Cursor Composer 的差异

这两者常被拿来比较，因为都是“多文件编辑”能力。差异主要在四个方面：

**入口形态**。Copilot Workspace 是一个独立的 Web 工作台，需要从 GitHub Issue 进入；Cursor Composer 是 IDE 内嵌面板，随时可用。前者流程重、适合“正式需求”；后者轻量、适合“日常改动”。

**上下文管理**。Workspace 自动拉取整个仓库与 Issue 描述作为上下文，不需要手动选文件；Composer 需要你显式 @file 引用上下文，但你能精确控制。Workspace 适合“我不知道要改哪些文件”，Composer 适合“我知道改哪几个文件”。

**审核流程**。Workspace 生成 spec、plan、implementation 三层文档，每层都能编辑，审核流程产品化；Composer 直接给 diff，审核更轻量。Workspace 适合“需要给非技术同事看方案”，Composer 适合“工程师之间快速迭代”。

**集成度**。Workspace 与 GitHub PR 深度集成，方案确认后直接开 PR；Composer 与 git 集成但需要你自己提交。Workspace 适合“以 Issue/PR 为中心的工作流”，Composer 适合“以代码为中心的工作流”。

\`\`\`text
选哪个？
  从 Issue 出发，要正式方案    ──>  Copilot Workspace
  日常改代码，要快             ──>  Cursor Composer
  团队有 PR review 流程        ──>  Workspace
  个人开发或小团队             ──>  Composer
\`\`\`

## 12.8 实战示例：用 Copilot 实现一个分页 Hook

把上面这些能力串起来，看一个真实任务。需求：实现一个 \`usePagination\` Hook，支持页码切换、每页条数、总数。

**步骤 1：在 hooks 目录新建文件**。打开 \`hooks/usePagination.ts\`，先写注释与签名：

\`\`\`typescript
// 分页 Hook：支持页码切换、每页条数、总数
// 用法：const { page, pageSize, total, totalPages, setPage, setPageSize } = usePagination({ initialPageSize: 10 });
\`\`\`

**步骤 2：让 Copilot 补全**。写完注释回车，Copilot 会给出实现。如果方向不对，按 Esc 撤销，用 Chat 问“帮我实现这个 Hook，要求支持边界检查、page 不能超过 totalPages”。

**步骤 3：用 Chat 生成测试**。选中实现，按 Ctrl+I 唤起 inline chat，输入 \`/tests\`，Copilot 生成对应的 Vitest 测试。

**步骤 4：用 Copilot Edits 优化**。如果发现实现有重复逻辑，唤起 Edits，描述“把这个 Hook 里的页码边界检查抽成一个独立函数”，Copilot 跨文件修改。

**步骤 5：用 @workspace 解释**。如果同事问“这个 Hook 在哪用了”，在 Chat 里输入“@workspace usePagination 在哪些文件被调用”，Copilot 全项目搜索并回答。

这一套流程下来，从写、测、改、查都用 Copilot 的不同能力，覆盖了日常开发的完整闭环。

\`\`\`text
Copilot 工作流速记：
  写  ──>  行内补全 + 注释引导
  问  ──>  Copilot Chat + @workspace/@terminal
  改  ──>  Copilot Edits（多文件）
  测  ──>  选中代码 + /tests
  释  ──>  选中代码 + /explain
  修  ──>  选中代码 + /fix
  查  ──>  @workspace 全项目搜索
\`\`\`

Copilot 的优势是“无缝嵌入既有 GitHub 工作流”，劣势是“跨文件大改与自主执行不如 Cursor/Claude Code”。下一章我们就来看 Cursor 这个最强对手。
`,
    code: `// =============================================================
// 第12章示例：Copilot 工作流模拟器
// 模拟从需求到完成的 5 步 Copilot 工作流，统计耗时与产出
// =============================================================

// ---- 工作流步骤定义 ----
// 每步包含：能力、平均耗时、成功率、是否需要人工介入
const steps = [
  { name: "写代码",     tool: "Inline 补全",     avgMs: 1200, successRate: 0.85, manual: false },
  { name: "问问题",     tool: "Chat + @workspace", avgMs: 3500, successRate: 0.92, manual: false },
  { name: "多文件改",   tool: "Copilot Edits",   avgMs: 8000, successRate: 0.78, manual: true  },
  { name: "生成测试",   tool: "/tests 命令",     avgMs: 4000, successRate: 0.88, manual: false },
  { name: "解释代码",   tool: "/explain 命令",   avgMs: 2000, successRate: 0.95, manual: false },
];

// ---- 模拟一次需求完成 ----
// 用蒙特卡洛方法跑 N 次，统计总耗时与一次成功率
function simulateOnce(steps) {
  let totalMs = 0;
  let retryCount = 0;
  for (const step of steps) {
    let attempt = 0;
    while (true) {
      attempt++;
      totalMs += step.avgMs * (0.7 + Math.random() * 0.6); // 加随机扰动
      if (Math.random() < step.successRate) break;
      retryCount++;
      if (attempt > 3) break; // 最多重试 3 次
    }
  }
  return { totalMs, retryCount, success: retryCount === 0 };
}

// ---- 跑 1000 次取平均 ----
const RUNS = 1000;
let totalMs = 0;
let successCount = 0;
let totalRetries = 0;
const perStepStats = steps.map((s) => ({ name: s.name, totalMs: 0, fails: 0 }));

for (let i = 0; i < RUNS; i++) {
  const r = simulateOnce(steps);
  totalMs += r.totalMs;
  totalRetries += r.retryCount;
  if (r.success) successCount++;
}

// ---- 输出 ----
console.log("========================================");
console.log("  Copilot 工作流模拟（" + RUNS + " 次平均）");
console.log("========================================\\n");

console.log("工作流步骤：");
steps.forEach((s, i) => {
  console.log("  " + (i + 1) + ". " + s.name.padEnd(10) + " 用 " + s.tool.padEnd(22) +
    " 平均 " + (s.avgMs / 1000).toFixed(1) + "s 成功率 " + (s.successRate * 100).toFixed(0) + "%");
});

console.log("\\n aggregate 统计：");
console.log("  平均总耗时：" + (totalMs / RUNS / 1000).toFixed(1) + "s");
console.log("  一次成功率：" + (successCount / RUNS * 100).toFixed(1) + "%");
console.log("  平均重试次数：" + (totalRetries / RUNS).toFixed(2));

// ---- 订阅成本估算 ----
console.log("\\n========================================");
console.log("  订阅档位成本对比");
console.log("========================================\\n");

const tiers = [
  { name: "Free",       monthly: 0,  completions: 2000,  chats: 50,  agent: false },
  { name: "Pro",        monthly: 10, completions: Infinity, chats: Infinity, agent: true },
  { name: "Business",   monthly: 19, completions: Infinity, chats: Infinity, agent: true },
  { name: "Enterprise", monthly: 39, completions: Infinity, chats: Infinity, agent: true },
];

// 假设个人开发者每月用 5000 次补全 + 200 次 Chat
const NEED_COMPLETIONS = 5000;
const NEED_CHATS = 200;

console.log(
  "档位".padEnd(14) +
    "月费".padStart(8) +
    "补全上限".padStart(12) +
    "Chat 上限".padStart(12) +
    "Agent".padStart(8) +
    "是否够用".padStart(12)
);
console.log("-".repeat(66));
tiers.forEach((t) => {
  const enough = t.completions >= NEED_COMPLETIONS && t.chats >= NEED_CHATS;
  const compStr = t.completions === Infinity ? "无限" : t.completions.toString();
  const chatStr = t.chats === Infinity ? "无限" : t.chats.toString();
  console.log(
    t.name.padEnd(14) +
      ("$" + t.monthly).padStart(8) +
      compStr.padStart(12) +
      chatStr.padStart(12) +
      (t.agent ? "是" : "否").padStart(8) +
      (enough ? "✅" : "❌").padStart(12)
  );
});

console.log("\\n========================================");
console.log("  关键洞察");
console.log("========================================");
console.log("  1. 行内补全成功率最高（85%+），是 Copilot 的看家本领。");
console.log("  2. 多文件改成功率最低（78%），需要人工审核 diff。");
console.log("  3. Free 档对重度用户远远不够，Pro 是个人开发甜点档。");
console.log("  4. Business/Enterprise 的核心价值是“代码不进训练 + 合规”。");
console.log("\\n✅ 模拟完成，下一章将深入 Cursor 编辑器实战。");
`
  },

  {
    id: "aiapp-cursor",
    icon: "🖱️",
    group: "AI编程工具全景",
    title: "Cursor 编辑器实战",
    content: `
# 第13章：Cursor 编辑器实战

Cursor 是 2026 年最被讨论的 AI 编辑器，没有之一。它从“Fork VSCode 加 AI”起步，到 2026 年 1.0+ 版本已经成为“AI 优先编辑器”的事实标准。本章把 Cursor 的核心能力拆开讲：Composer vs Agent、Tab 补全、Cmd+K、@ 引用、规则文件、MCP、模型切换、Bug Bot、Background Agent，最后给出一个完整的实战工作流。

## 13.1 Cursor 是什么

Cursor 由 Anysphere 团队开发，本质是“Fork 自 VSCode 的独立编辑器 + 深度集成的 AI 能力”。选择 Fork 而不是“做 VSCode 插件”是关键决策——这意味着 Cursor 能修改编辑器底层（比如 Tab 补全的预测模型、Composer 的多文件 diff 视图），这是 Copilot 这类插件做不到的深度。

Cursor 1.0+（2025 年中发布）相比早期版本有几个质变：Composer 与 Agent 模式融合、Background Agent 上线、Bug Bot 集成 PR review、MCP 一等公民、规则文件系统升级。2026 年中 Cursor 仍然是付费工具，定价 $20/月起，团队版 $40/月起。

## 13.2 安装与首次配置

\`\`\`bash
# macOS 安装 Cursor
# 方式 1：官网下载 dmg
#   https://cursor.com/download
# 方式 2：用 Homebrew Cask（推荐）
brew install --cask cursor

# 首次启动会引导你：
#   1. 登录 Cursor 账号（Google/GitHub）
#   2. 从 VSCode 导入设置与扩展（一键迁移）
#   3. 选择默认模型（推荐 Claude Sonnet 4 日常 + GPT-5 慢思考按需）

# 验证版本
# 在 Cursor 内 Help → About 查看，确保 >= 1.0
\`\`\`

首次配置几个关键设置（Cursor Settings，快捷键 Cmd+,）：

\`\`\`json
{
  "cursor.general.enableAutoUpdate": true,
  "cursor.ai.model": "claude-sonnet-4",
  "cursor.ai.fallbackModel": "gpt-4o",
  "cursor.tab.enabled": true,
  "cursor.tab.previewLength": 500,
  "cursor.composer.autoApply": false,
  "cursor.agent.autoRun": "ask",
  "cursor.rules.alwaysInclude": ["always-rules.md"]
}
\`\`\`

几个要点：\`cursor.tab.enabled\` 开启 Tab 补全；\`cursor.composer.autoApply\` 设 false 让 Composer 改完代码后你手动确认，避免它乱改；\`cursor.agent.autoRun\` 设 ask 让 Agent 模式每步都问你，避免它“放飞”。

## 13.3 Tab 补全：被低估的能力

Cursor Tab 是 Cursor 区别于 Copilot 的最大杀器之一。它不是“补全当前光标位置”，而是“预测你接下来要做的多步操作”——包括跳到下一行、修改另一个位置、添加 import。

**Tab 的能力边界**：

1. **跨行补全**。能预测你接下来 3~5 行的写法，按 Tab 一次接受全部。
2. **光标跳转**。补全完成后按 Tab，光标会跳到“下一个最可能要改的位置”，省去鼠标移动。
3. **多位置修改**。如果你改了一个变量名，Tab 能预测另一个位置也要同步改，按 Tab 接受。
4. **import 自动添加**。用了某个新 API，Tab 会预测你需要 import，按 Tab 自动加。

**Tab 用法技巧**：

- **信任它但验证**。Tab 准确率约 70%~85%，按 Tab 后一定要快速扫一眼，错了按 Esc 撤销。
- **用 Tab 跳转**。哪怕它没补全内容，按 Tab 也能跳到下一个建议位置，比手动移动光标快。
- **别贪多**。Tab 预测太长的内容容易出错，3~5 行内的预测最准，长了就用 Cmd+K。

## 13.4 Cmd+K：内联编辑

Cmd+K（macOS）/ Ctrl+K（Windows）是 Cursor 的内联编辑入口。选中一段代码，按 Cmd+K，输入指令，Cursor 直接修改选中代码并给 diff。

**Cmd+K 的核心场景**：

- **重构**：“把这个 class 改成 hooks”
- **优化**：“这段 SQL 加索引提示”
- **修 bug**：“这里的 off-by-one 错误修一下”
- **加注释**：“给这段加中文注释”
- **改风格**：“用箭头函数重写”

**Cmd+K 高级用法**：

- **@ 引用上下文**。在指令里用 \`@file:utils.ts\` 引用其他文件，Cmd+K 会把它作为上下文。
- **多行选中**。可以选中跨多行跨多文件（用多光标），Cmd+K 一次改多处。
- **快捷指令**。在 .cursor/rules 里定义“快捷指令”，比如 \`!refactor\` 展开成“重构并保持外部行为不变”。

\`\`\`text
Cmd+K 速记：
  选中代码 + Cmd+K + 自然语言  ──>  内联修改 + diff 预览
  Cmd+K 不选中代码              ──>  在光标处生成新代码
  指令里加 @file                ──>  引用其他文件作上下文
  Tab 接受 / Esc 拒绝           ──>  快速决策
\`\`\`

## 13.5 Composer vs Agent 模式

这是 Cursor 1.0+ 最重要的一对概念，必须讲清楚。

**Composer 模式**（Cmd+I 唤起）。定位是“多文件编辑”。你描述一个改动，Composer 跨多个文件修改并给 diff，你审核后接受。它的特点是：

- 一次生成一个完整的改动方案
- 改完即止，不会自主继续
- 适合“我知道要改什么，让它执行”的任务
- 控制感强，每一步都看得到

**Agent 模式**（Cmd+I 唤起后切换，或 Tab 切换）。定位是“自主执行”。你给一个目标，Agent 自主读文件、改代码、跑命令、根据报错继续修。它的特点是：

- 能调工具（读文件、写文件、跑 shell、搜代码）
- 能多轮迭代，根据执行结果调整
- 适合“我有个目标，让它自己摸索”的任务
- 自动化程度高，但要警惕“放飞”

**两者的核心差异**：

| 维度 | Composer | Agent |
| --- | --- | --- |
| 输入 | 改动描述 | 目标描述 |
| 输出 | 一组 diff | 一系列操作（含 diff、命令执行） |
| 迭代 | 一次完成 | 多轮迭代 |
| 工具调用 | 不能 | 能（读文件/写文件/跑命令） |
| 控制感 | 强 | 弱 |
| 适合任务 | 明确改动 | 探索性、需要验证 |

**什么时候用哪个**：

\`\`\`text
任务明确（“把这个组件改成 RSC”）  ──>  Composer
任务模糊（“把这个 bug 修了”）      ──>  Agent
需要跑测试验证                     ──>  Agent
只改代码不跑命令                   ──>  Composer
担心 Agent 乱跑                    ──>  Composer
需要长链路探索                     ──>  Agent
\`\`\`

实战经验：日常 70% 用 Composer，30% 用 Agent。Agent 模式开启时务必把 \`autoRun\` 设为 \`ask\`，每步确认。

## 13.6 @ 引用系统

Cursor 的 @ 引用是它的“上下文管理”精髓。在 Composer/Chat 里输入 @，会弹出引用选项。

**@ 引用类型**：

- **@file**：引用某个文件。最常用。
- **@folder**：引用整个文件夹。适合“按这个目录的风格生成”。
- **@codebase**：让 Cursor 索引整个仓库并按相关性自动选上下文。这是“我不知道该选哪些文件”时的兜底。
- **@docs**：引用第三方库的官方文档。Cursor 内置了主流库的文档索引，比如 \`@docs next.js\`。
- **@web**：联网搜索。适合“查最新 API”或“这个报错别人遇到过吗”。
- **@git**：引用 git 历史。比如“@git 最近的 commit”。
- **@symbol**：引用某个函数/类。比 @file 更精确。

**@ 引用最佳实践**：

1. **精准胜过宽泛**。能用 @symbol 就别用 @file，能用 @file 就别用 @folder。上下文越精准，生成质量越高。
2. **多 @ 组合**。可以同时引用多个，比如“按 @file:Button.tsx 的风格，给 @file:Card.tsx 加一个 variant 属性”。
3. **@codebase 兜底**。不确定要改哪时用 @codebase，但生成会慢一些。
4. **@docs 补新 API**。用 Cursor 不熟悉的最新 API 时，@docs 比让模型瞎猜靠谱。

## 13.7 .cursor/rules 规则文件

规则文件是 Cursor 的“项目级指令系统”，类似 Copilot 的 copilot-instructions.md，但更强大——支持三种类型。

**类型 1：Always Rules**（始终加载）。文件位于 \`.cursor/rules/always-rules.md\`（或在 settings 里配置）。每次 Composer/Chat 都自动注入。适合“全局都要遵守的规则”，比如代码风格、技术栈约定。内容要短（< 50 行）。

**类型 2：Auto Rules**（按需自动加载）。文件位于 \`.cursor/rules/xxx.md\`，文件头部带 frontmatter 描述触发条件。当对话内容匹配条件时自动注入。适合“按场景加载的规则”，比如“改测试时加载测试规则”。

**类型 3：Manual Rules**（手动引用）。文件位于 \`.cursor/rules/xxx.md\`，需要你在对话里 \`@rules:xxx\` 显式引用。适合“偶尔用的复杂规则”，比如“部署脚本编写规范”。

一个 Auto Rules 示例：

\`\`\`markdown
---
description: 测试编写规则，当用户写测试时加载
globs: ["**/*.test.ts", "**/*.spec.ts"]
---

# 测试规则

- 用 Vitest，不用 Jest
- 测试文件名用 .test.ts
- 每个 test 必须有中文描述
- 用 describe 分组，每组不超过 10 个 it
- 断言用 expect().toBe()，不用 assert
- mock 用 vi.mock()，不要在测试里改全局状态
\`\`\`

**规则文件最佳实践**：

1. **Always 极简**。Always 规则每次都加载，太长会吃掉上下文窗口。控制在 50 行内。
2. **Auto 用 globs 触发**。用文件 glob 匹配比用关键词匹配更稳定。
3. **Manual 写复杂场景**。比如“GraphQL schema 设计规范”这种偶尔用的规则，写成 Manual。
4. **规则进 git**。规则文件必须进版本控制，全团队共享。
5. **定期清理**。规则越加越多会互相冲突，定期 review 删过时的。

## 13.8 MCP 集成

MCP（Model Context Protocol）是 Anthropic 提出的“模型-工具协议”，2026 年已成为事实标准。Cursor 1.0+ 把 MCP 作为一等公民支持。

**MCP 的价值**：让 Cursor 能调任意工具——数据库、API、内部系统、第三方服务。比如配置一个 PostgreSQL MCP，Cursor 就能直接查你的数据库；配置一个 GitHub MCP，Cursor 就能直接读 Issue、写 PR 评论。

**配置 MCP**（在 Cursor Settings → MCP 里加）：

\`\`\`json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_xxx"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://user:pass@host/db"]
    }
  }
}
\`\`\`

配置完成后，在 Composer/Agent 里就能用“@github 拉 issue #123”“查一下 users 表最近 10 条”这样的指令，Cursor 会自动调对应 MCP。

## 13.9 模型切换

Cursor 支持多模型，按需切换是省成本的关键。

**模型切换入口**：Composer/Chat 顶部的模型下拉框，或快捷键 Ctrl+/（macOS 用 Cmd+/）。

**推荐模型策略**：

- **日常 Composer/Chat**：Claude Sonnet 4（精度高、守规矩）
- **难任务/架构**：GPT-5 慢思考 或 Claude Opus 4
- **快速补全**：Cursor Tab 自带的小模型（免费、低延迟）
- **长文档**：Gemini 2.5 Pro（2M 上下文）
- **预算紧**：DeepSeek-Coder-V3 / Qwen3-Coder（便宜）

\`\`\`text
模型切换速记：
  日常     ──>  Claude Sonnet 4
  难任务   ──>  GPT-5 慢思考 / Claude Opus 4
  长文档   ──>  Gemini 2.5 Pro
  省钱     ──>  DeepSeek-Coder-V3
  补全     ──>  Cursor Tab（内置）
\`\`\`

## 13.10 Bug Bot 与 Background Agents

这是 Cursor 1.0+ 的两个高级能力。

**Bug Bot**。Cursor 集成的 PR review 机器人。在 GitHub PR 里 @cursor 启动，Bug Bot 会自动 review 代码、找潜在 bug、给评论。它不是“替代人 review”，而是“先过一遍机械性问题”。适合“团队 PR 量大、人 review 来不及”的场景。

**Background Agents**。这是 Cursor 1.0 的杀手锏。你给一个目标，Background Agent 在云端开一个工作环境，自主完成任务，完成后通知你。它和 Agent 模式的区别是“异步”——你可以关掉编辑器去做别的，Agent 在后台跑。

**Background Agent 使用场景**：

- **大型重构**：“把这个 monorepo 里所有 console.log 换成 logger”
- **批量修 issue**：“把 backlog 里所有 good-first-issue 都看了并修”
- **跑长测试**：“改完代码跑全套 e2e，失败的就修”
- **代码迁移**：“把这个仓库从 webpack 迁到 vite”

**Background Agent 注意事项**：

1. **任务要明确**。模糊目标会让 Agent 跑很久还跑偏。
2. **设预算上限**。Background Agent 按用量计费，不设上限可能烧钱。
3. **审核结果**。Background Agent 完成后会给你 diff，务必审核再合并。
4. **信任度分级**。先在非关键分支试，确认稳定后再用于主分支。

\`\`\`text
Background Agent 速记：
  目标明确 + 长链路  ──>  适合 Background Agent
  探索性 + 不确定    ──>  不适合，用本地 Agent 模式
  关键分支           ──>  慎用，先在 dev 分支试
  预算敏感           ──>  必设上限
\`\`\`

## 13.11 实战工作流：从需求到 PR

把上面所有能力串起来，看一个完整工作流。需求：给一个 Next.js 项目加“用户头像上传”功能。

**步骤 1：用 @codebase 探索**。打开 Composer，输入“@codebase 现有的用户信息存在哪？头像字段叫什么？”Cursor 索引全项目并回答。

**步骤 2：用 @docs 查 Next.js 文件上传 API**。输入“@docs next.js 用 route handler 接收文件上传的最佳实践”。

**步骤 3：用 Composer 写前端组件**。输入“在 components/AvatarUploader.tsx 实现头像上传组件，用 @file:Button.tsx 的风格，支持拖拽、预览、压缩到 200x200”。Composer 跨文件生成组件 + 类型 + 样式。

**步骤 4：用 Composer 写后端 API**。输入“在 app/api/upload/route.ts 实现上传接口，存到 /public/avatars，文件名用 user id + 时间戳”。

**步骤 5：用 Agent 模式跑测试**。切到 Agent，输入“写测试覆盖 AvatarUploader 和上传 API，跑通”。Agent 自主写测试、跑测试、修 bug，直到通过。

**步骤 6：用 Bug Bot review**。提交 PR，@cursor 启动 Bug Bot，自动 review。

**步骤 7：用 Background Agent 做后续优化**。如果发现还有“图片裁剪”“CDN 上传”等延伸需求，开一个 Background Agent 在后台做，自己继续其他工作。

这套流程下来，一个中等复杂度的功能从需求到 PR 半小时搞定，关键节点都有人工审核。

\`\`\`text
Cursor 工作流速记：
  探索    ──>  @codebase + @docs
  生成    ──>  Composer（多文件改）
  执行    ──>  Agent 模式（跑测试/修 bug）
  审查    ──>  Bug Bot（PR review）
  异步    ──>  Background Agent（长任务）
  规则    ──>  .cursor/rules（项目规范）
  上下文  ──>  @file/@folder/@symbol/@web
  模型    ──>  Sonnet 日常 / Opus 难题 / Gemini 长文
\`\`\`

Cursor 的优势是“AI 能力深度集成到编辑器”，劣势是“独立编辑器，与既有 VSCode 设置可能有冲突，团队推广成本高”。下一章我们看 Claude Code——一个完全不同的形态：终端 Agent。
`,
    code: `// =============================================================
// 第13章示例：Cursor 工作流成本与耗时模拟器
// 模拟一个需求从探索到 PR 的完整流程，统计成本与耗时
// =============================================================

// ---- Cursor 各能力定义 ----
// cost: 单次平均成本（美元，按模型与 token 估算）
// avgMs: 单次平均耗时
// successRate: 一次成功率
const capabilities = [
  { name: "@codebase 探索",     model: "Sonnet 4",  cost: 0.05, avgMs: 8000,  successRate: 0.85 },
  { name: "@docs 查文档",       model: "Sonnet 4",  cost: 0.02, avgMs: 3000,  successRate: 0.95 },
  { name: "Composer 生成代码",  model: "Sonnet 4",  cost: 0.08, avgMs: 12000, successRate: 0.80 },
  { name: "Agent 跑测试",       model: "Opus 4",    cost: 0.20, avgMs: 45000, successRate: 0.70 },
  { name: "Bug Bot review",     model: "Sonnet 4",  cost: 0.03, avgMs: 20000, successRate: 0.90 },
  { name: "Background Agent",   model: "Opus 4",    cost: 0.50, avgMs: 180000, successRate: 0.65 },
];

// ---- 模拟一次需求完成 ----
function simulateFeature() {
  let totalCost = 0;
  let totalMs = 0;
  const log = [];

  for (const cap of capabilities) {
    let attempts = 0;
    while (true) {
      attempts++;
      totalCost += cap.cost * (0.7 + Math.random() * 0.6);
      totalMs += cap.avgMs * (0.7 + Math.random() * 0.6);
      if (Math.random() < cap.successRate) break;
      if (attempts > 3) break;
    }
    log.push({ name: cap.name, attempts });
  }

  return { totalCost, totalMs, log };
}

// ---- 跑 500 次 ----
const RUNS = 500;
let sumCost = 0;
let sumMs = 0;
const attemptStats = {};
capabilities.forEach((c) => (attemptStats[c.name] = { total: 0, count: 0 }));

for (let i = 0; i < RUNS; i++) {
  const r = simulateFeature();
  sumCost += r.totalCost;
  sumMs += r.totalMs;
  r.log.forEach((l) => {
    attemptStats[l.name].total += l.attempts;
    attemptStats[l.name].count++;
  });
}

// ---- 输出 ----
console.log("========================================");
console.log("  Cursor 工作流模拟（" + RUNS + " 次平均）");
console.log("========================================\\n");

console.log("各能力平均重试次数：");
Object.entries(attemptStats).forEach(([name, s]) => {
  const avg = (s.total / s.count).toFixed(2);
  console.log("  " + name.padEnd(24) + " 平均尝试 " + avg + " 次");
});

console.log("\\n整体统计：");
console.log("  平均单需求成本：$" + (sumCost / RUNS).toFixed(3));
console.log("  平均单需求耗时：" + (sumMs / RUNS / 1000 / 60).toFixed(1) + " 分钟");

// ---- 模型切换策略对比 ----
console.log("\\n========================================");
console.log("  模型切换策略成本对比");
console.log("========================================\\n");

const strategies = [
  { name: "全 Sonnet",     costs: [0.03,0.02,0.05,0.10,0.02,0.30] },
  { name: "全 Opus",       costs: [0.15,0.10,0.25,0.50,0.10,1.50] },
  { name: "智能切换(默认)", costs: [0.05,0.02,0.08,0.20,0.03,0.50] },
  { name: "省钱模式",      costs: [0.02,0.01,0.03,0.08,0.01,0.20] },
];

console.log(
  "策略".padEnd(20) +
    "探索".padStart(10) +
    "查文档".padStart(10) +
    "生成".padStart(10) +
    "跑测试".padStart(10) +
    "review".padStart(10) +
    "后台".padStart(10) +
    "单需求合计".padStart(14)
);
console.log("-".repeat(84));
strategies.forEach((s) => {
  const total = s.costs.reduce((a, b) => a + b, 0);
  console.log(
    s.name.padEnd(20) +
      s.costs.map((c) => ("$" + c.toFixed(2)).padStart(10)).join("") +
      ("$" + total.toFixed(2)).padStart(14)
  );
});

// ---- 月度账单预估 ----
console.log("\\n========================================");
console.log("  月度账单预估（每月 30 个需求）");
console.log("========================================\\n");
strategies.forEach((s) => {
  const total = s.costs.reduce((a, b) => a + b, 0);
  const monthly = total * 30;
  console.log("  " + s.name.padEnd(20) + " 月度 $" + monthly.toFixed(2));
});

console.log("\\n========================================");
console.log("  关键洞察");
console.log("========================================");
console.log("  1. 智能切换（Sonnet 日常 + Opus 难题）是性价比最优解。");
console.log("  2. 全 Opus 成本是智能切换的 3 倍，质量提升不明显。");
console.log("  3. Background Agent 是单笔最大开销，慎用。");
console.log("  4. 月度 $30~50 是个人开发者的典型 Cursor 账单。");
console.log("  5. 团队推广时要配规则文件，否则每人各写各的会很乱。");
console.log("\\n✅ 模拟完成，下一章将深入 Claude Code 终端实战。");
`
  },

  {
    id: "aiapp-claude-code",
    icon: "💻",
    group: "AI编程工具全景",
    title: "Claude Code 终端实战",
    content: `
# 第14章：Claude Code 终端实战

前面两章讲了 IDE 集成型工具（Copilot、Cursor），这一章讲完全不同的形态：终端 Agent。Claude Code 是 Anthropic 官方推出的命令行 AI 编程工具，2025 年发布、2026 年初 GA（General Availability），是终端 Agent 形态的旗舰产品。本章把 Claude Code 从安装到实战的全流程讲透。

## 14.1 Claude Code 是什么

Claude Code 是一个 npm 全局命令，安装后在终端里用 \`claude\` 唤起。它的核心定位是“终端里的自主编程 Agent”——你给它一个目标，它自主读文件、改代码、跑命令、修错误，直到任务完成或需要你介入。

与 IDE 集成型工具的本质区别：

- **形态**：Claude Code 在终端，不在编辑器。你可以同时开着 Vim/VSCode 写代码，终端里跑 Claude Code。
- **自主度**：Claude Code 默认是“Agent 模式”，能自主调工具；IDE 工具默认是“补全/编辑模式”。
- **集成对象**：Claude Code 与 git、构建工具、测试框架深度集成；IDE 工具与编辑器深度集成。
- **使用姿势**：Claude Code 适合“放手型任务”；IDE 工具适合“交互型任务”。

**Claude Code 适合的场景**：

- 批量重构（“把所有 console.log 换成 logger”）
- 自动化修复（“跑 tsc，把所有报错都修了”）
- 跨文件大改（“把这个 monorepo 从 CommonJS 迁到 ESM”）
- CI 集成（“PR 提交后自动跑 Claude Code 做初步 review”）
- 探索性任务（“看看这个仓库的结构，画个依赖图”）

**不适合的场景**：

- 行内补全（终端形态不适合）
- 实时交互编辑（IDE 更顺手）
- UI 设计类任务（没有可视化预览）

## 14.2 安装与首次认证

\`\`\`bash
# 1. 全局安装 Claude Code（需要 Node.js 18+）
npm install -g @anthropic-ai/claude-code

# 2. 验证安装
claude --version
# 输出类似：1.0.x (Claude Code)

# 3. 首次认证
claude
# 首次运行会引导你登录 Anthropic 账号
#   方式 1：浏览器 OAuth（推荐，会打开浏览器）
#   方式 2：API Key（适合服务器/CI 环境）
#   方式 3：Claude.ai 订阅账号（Pro/Max/Team 用户可直接用）

# 4. 验证认证成功
claude "你好，介绍一下你自己"
# 应该收到 Claude 的回复

# 5. 查看帮助
claude --help
\`\`\`

**认证方式选择**：

- **个人开发**：用 Claude.ai 订阅账号（Pro $20/月 或 Max $100/月），最划算。Max 套餐给 Claude Code 较多额度。
- **团队/企业**：用 Anthropic API Key，按用量计费，便于成本管控。
- **CI/服务器**：用 API Key + 环境变量 \`ANTHROPIC_API_KEY\`。

## 14.3 交互模式：REPL 与一次性命令

Claude Code 有两种使用方式。

**REPL 模式**（交互式）。直接输入 \`claude\` 进入 REPL，可以连续对话。适合“探索性、多轮迭代”的任务。

\`\`\`bash
$ claude
> 看看这个项目的结构
（Claude 列出目录结构、解释每个目录的作用）

> 把 utils/time.ts 里的函数都加上中文注释
（Claude 读文件、改文件、给你看 diff、等你确认）

> 跑一下测试
（Claude 跑 npm test，根据结果继续修）

> /exit
\`\`\`

**一次性命令**（非交互式）。用 \`claude "你的指令"\` 直接执行，执行完退出。适合“脚本化、CI 集成”的场景。

\`\`\`bash
# 一次性执行
claude "把 src 目录下所有 .js 文件改名为 .ts，并修复 import 路径"

# 配合管道
git diff HEAD~1 | claude "审查这个 diff，找出潜在 bug"

# CI 集成
claude --auto "跑 npm test，失败的就修，最多修 3 轮" --output-format json
\`\`\`

**两种模式的选择**：

\`\`\`text
REPL 模式    ──>  探索性、多轮迭代、需要随时介入
一次性命令   ──>  目标明确、脚本化、CI 集成
\`\`\`

## 14.4 核心命令

进入 REPL 后，有一组斜杠命令用于控制 Claude Code 自身。

| 命令 | 作用 | 用法 |
| --- | --- | --- |
| /help | 查看所有命令 | /help |
| /clear | 清空对话历史 | /clear |
| /model | 切换模型 | /model sonnet 或 /model opus |
| /compact | 压缩对话历史 | /compact（省 token） |
| /cost | 查看本次会话消耗 | /cost |
| /status | 查看当前配置 | /status |
| /permissions | 管理工具权限 | /permissions |
| /mcp | 管理 MCP 服务 | /mcp |
| /agents | 管理子 Agent | /agents |
| /init | 初始化 CLAUDE.md | /init |
| /review | 让 Claude review 代码 | /review |
| /vim | 切换 Vim 模式 | /vim |
| /exit | 退出 | /exit |

**几个高频命令的细节**：

- **/model**：默认 Sonnet 4（日常），难任务切 Opus 4。切换不重启会话。
- **/compact**：长会话 token 累积，/compact 把历史压缩成摘要，省后续 token。建议每 30 分钟用一次。
- **/clear**：彻底清空，比 /compact 更激进。任务切换时用。
- **/cost**：实时看本次会话花了多少美元，避免账单失控。
- **/init**：在项目根目录生成 CLAUDE.md 模板，你填好后 Claude Code 永久加载。

## 14.5 CLAUDE.md 项目规则

CLAUDE.md 是 Claude Code 的“项目级规则文件”，类似 Copilot 的 copilot-instructions.md、Cursor 的 .cursor/rules。放在项目根目录，Claude Code 启动时自动加载。

**CLAUDE.md 示例**：

\`\`\`markdown
# CLAUDE.md

## 项目概述
这是一个 Next.js 15 + React 19 的电商前台项目。

## 技术栈
- 框架：Next.js 15（App Router）
- UI：Tailwind 4 + shadcn/ui
- 状态：Zustand
- 数据：React Query + tRPC
- 测试：Vitest + Playwright
- 数据库：Postgres + Drizzle ORM

## 目录约定
- /app           路由与页面
- /components    组件（components/ui 是 shadcn 原子组件）
- /lib           工具与业务逻辑
- /server        服务端代码（tRPC router、DB 操作）
- /hooks         自定义 Hook

## 代码风格
- TypeScript strict 模式，禁止 any
- 函数式优先，class 仅用于必要场景
- 命名：变量 camelCase，类型 PascalCase，常量 UPPER_SNAKE
- 注释中文，写在代码上方

## 禁止
- 不要在客户端组件里直接访问数据库
- 不要用 useEffect 做数据获取，用 React Query
- 不要安装新依赖前不询问

## 常用命令
- 开发：npm run dev
- 构建：npm run build
- 测试：npm test
- e2e：npm run e2e
- 类型检查：npm run typecheck
- lint：npm run lint

## 提交规范
- commit message 用 conventional commits
- feat: 新功能 / fix: 修 bug / refactor: 重构 / test: 测试 / docs: 文档
\`\`\`

**CLAUDE.md 最佳实践**：

1. **简洁**。控制在 100 行内，太长 Claude 会忽略后面。
2. **可执行**。写“常用命令”比写“请遵守规范”有效——Claude 会直接用这些命令。
3. **负面清单**。明确写“禁止”事项，比正面引导更管用。
4. **随项目演进**。每次 Claude 犯错，就加一条规则。
5. **进 git**。全团队共享同一份规则。

## 14.6 .claude/ 目录结构

除了 CLAUDE.md，Claude Code 还用 \`.claude/\` 目录存配置。典型结构：

\`\`\`text
.claude/
├── settings.json        # 本项目配置（权限、模型、MCP）
├── commands/            # 自定义斜杠命令
│   ├── refactor.md      # /refactor 命令
│   └── deploy-check.md  # /deploy-check 命令
├── agents/              # 子 Agent 定义
│   ├── reviewer.md      # 代码审查子 Agent
│   └── tester.md        # 测试子 Agent
└── mcp.json             # MCP 服务配置
\`\`\`

**settings.json 示例**：

\`\`\`json
{
  "model": "claude-sonnet-4",
  "fallbackModel": "claude-opus-4",
  "permissions": {
    "allow": ["Bash(npm test)", "Bash(npm run lint)", "Bash(git status)"],
    "deny": ["Bash(rm -rf *)", "Bash(git push --force)"]
  },
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}
\`\`\`

**自定义斜杠命令**（commands/refactor.md）：

\`\`\`markdown
---
description: 重构当前文件，保持外部行为不变
---

请按以下步骤重构我选中的代码：
1. 阅读完整上下文，理解外部行为
2. 找出可改进点（重复、复杂度、命名）
3. 给出重构方案，列出每处改动与理由
4. 应用改动，跑相关测试确认行为不变
5. 输出改动摘要
\`\`\`

定义后，在 REPL 里输入 \`/refactor\` 即可触发。

## 14.7 权限模式

Claude Code 能跑任意命令，权限管控是关键。三个权限模式：

**模式 1：默认模式**（Ask）。每个工具调用都问你确认。最安全，但最繁琐。适合“不熟悉的仓库”或“关键项目”。

**模式 2：计划模式**（Plan）。Claude 只做“读”操作（读文件、跑只读命令），任何“写”操作（改文件、跑会修改状态的命令）都要你先批准计划再执行。最安全的“放手”模式，适合“想自动化但担心出事”的场景。

**模式 3：自动模式**（Auto/YOLO）。所有操作自动执行，不问。最快，但最危险。仅适合“沙箱环境、可丢弃的实验仓库”。

\`\`\`text
权限模式速记：
  Ask   ──>  每步问，最安全最繁琐
  Plan  ──>  读自由、写要批，平衡之选
  Auto  ──>  全自动，仅限沙箱
\`\`\`

**Plan 模式的安全价值**：Plan 模式是 2026 年 Claude Code 推荐的“放手型”模式。它的核心价值是“把决策点前置”——Claude 先告诉你“我打算做 A、B、C 三件事，其中 B 会修改 src/foo.ts，C 会跑 npm test”，你批准后它一口气执行。这避免了“边跑边问”的繁琐，又保留了“写操作必须人审”的安全底线。

实战经验：日常用 Plan 模式，CI 用 Auto 模式（沙箱），陌生仓库用 Ask 模式。

## 14.8 子 Agent（subagent）

子 Agent 是 Claude Code 的高级能力。你可以定义“专门做某件事”的子 Agent，主 Agent 在需要时调用它们。

**子 Agent 的价值**：

- **并行**：多个子 Agent 并行干活，比如同时改 3 个独立模块。
- **专精**：每个子 Agent 只做一件事，prompt 更聚焦，质量更高。
- **隔离上下文**：子 Agent 有独立上下文，不污染主 Agent。

**定义子 Agent**（.claude/agents/reviewer.md）：

\`\`\`markdown
---
name: reviewer
description: 代码审查专家，专注于找潜在 bug 与改进点
tools: ["Read", "Grep", "Glob"]
---

你是资深代码审查工程师。任务：
1. 阅读指定文件或 diff
2. 找出潜在 bug、安全漏洞、性能问题
3. 给出具体改进建议，附代码示例
4. 不要修改文件，只给审查意见

输出格式：
## 严重问题
（必须修）
## 建议改进
（推荐修）
## 风格建议
（可选）
\`\`\`

**调用子 Agent**：在主 Agent 对话里说“用 reviewer 子 Agent 审查 src/auth.ts”，主 Agent 会调起 reviewer 子 Agent，传给它文件路径，子 Agent 完成审查后把结果返回给主 Agent。

**子 Agent 并行任务示例**：

\`\`\`text
你：用 reviewer 审查 src/auth.ts 和 src/payment.ts
Claude（主）：好的，我同时调起两个 reviewer 子 Agent 并行审查...
（约 30 秒后）
Claude（主）：两个文件审查完成，结果如下：
  src/auth.ts：发现 2 个严重问题（...）
  src/payment.ts：发现 1 个严重问题（...）
\`\`\`

并行子 Agent 对“批量任务”特别有效——比如同时审查 10 个文件、同时给 5 个模块写测试。串行要 50 分钟的活，并行 5 分钟搞定。

## 14.9 MCP 配置

Claude Code 原生支持 MCP。配置方式有两种。

**方式 1：项目级 .claude/mcp.json**：

\`\`\`json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "ghp_xxx" }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/mydb"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/me/notes"]
    }
  }
}
\`\`\`

**方式 2：用 /mcp 命令交互式配置**：

\`\`\`bash
# 在 REPL 里
> /mcp add github npx @modelcontextprotocol/server-github
> /mcp list
> /mcp remove github
\`\`\`

配置完成后，Claude Code 能调这些 MCP 工具。比如“从 GitHub 拉 issue #123 并修复”“查一下 users 表最近 10 条记录”。

## 14.10 实战示例：让 Claude Code 实现一个完整功能

把上面所有能力串起来，看一个完整任务：给一个 Next.js 项目加“文章点赞功能”。

**步骤 1：初始化项目规则**（如果还没有 CLAUDE.md）：

\`\`\`bash
$ claude
> /init
（Claude 扫描项目，生成 CLAUDE.md 草稿，你编辑后保存）
\`\`\`

**步骤 2：用 Plan 模式描述目标**：

\`\`\`text
> 切到 plan 模式，然后帮我加一个文章点赞功能：
> - 数据模型：在 Post 加 likes 字段（number），加 LikeRecord 表（userId + postId 唯一）
> - API：POST /api/posts/[id]/like 与 POST /api/posts/[id]/unlike
> - UI：文章页加点赞按钮，已点赞高亮，再次点击取消
> - 权限：必须登录，每篇文章每用户只能点赞一次
> - 测试：覆盖 API 与 UI

请先给计划，我批准后你再执行
\`\`\`

Claude 会给一个计划：

\`\`\`text
计划：
1. 修改 db/schema.ts：加 likes 字段与 LikeRecord 表
2. 跑 db migration：npm run db:migrate
3. 写 server/like.ts：like 与 unlike 业务逻辑
4. 写 app/api/posts/[id]/like/route.ts 与 unlike/route.ts
5. 改 app/posts/[id]/page.tsx：加点赞按钮组件
6. 写组件 components/LikeButton.tsx
7. 写测试：server/like.test.ts 与 components/LikeButton.test.tsx
8. 跑 npm test 验证

涉及修改的文件：8 个
涉及运行的命令：db:migrate, test
请确认是否执行
\`\`\`

**步骤 3：批准并执行**：

\`\`\`text
> 批准
（Claude 按计划执行，每步给你看 diff）
（执行 db:migrate 时会问你是否允许运行此命令）
（执行 npm test 时根据失败自动修 bug）
\`\`\`

**步骤 4：用 reviewer 子 Agent 审查**：

\`\`\`text
> 用 reviewer 子 Agent 审查这次改动的所有文件
（Claude 调起 reviewer 子 Agent，审查 8 个文件，给出审查报告）
\`\`\`

**步骤 5：用 /cost 看消耗**：

\`\`\`text
> /cost
本次会话消耗：
  输入 tokens: 285,000
  输出 tokens: 12,400
  成本: $1.34
  耗时: 14 分钟
\`\`\`

**步骤 6：提交**：

\`\`\`text
> 帮我提交，commit message 按 conventional commits 规范
（Claude 跑 git add + git commit，message 自动生成 "feat: add post like feature"）
\`\`\`

整个流程 15 分钟搞定，包含数据模型、API、UI、测试、审查、提交。这正是 Claude Code 的价值——把“一个完整功能从需求到提交”产品化。

\`\`\`text
Claude Code 工作流速记：
  初始化    ──>  /init 生成 CLAUDE.md
  探索      ──>  REPL 对话 + @codebase（自动）
  计划      ──>  Plan 模式给方案
  执行      ──>  批准后自动跑（含 db:migrate、test）
  审查      ──>  /review 或 reviewer 子 Agent
  并行      ──>  子 Agent 同时干多个独立任务
  成本      ──>  /cost 实时监控
  提交      ──>  让 Claude 写 commit message
  CI 集成   ──>  一次性命令 + --auto + --output-format json
\`\`\`

Claude Code 的优势是“自主执行 + 与 git/构建/测试深度集成”，劣势是“终端形态不直观、学习成本高”。它最适合“已经会用终端、愿意放手”的工程师。下一章我们看剩下的工具：Windsurf、Trae、Cline、Aider、v0 等。
`,
    code: `// =============================================================
// 第14章示例：Claude Code 任务执行模拟器
// 模拟一个完整功能从计划到提交的全流程，统计成本与决策点
// =============================================================

// ---- 任务步骤定义 ----
// 每步：能力、平均耗时、平均 token、是否需要人工确认
const workflow = [
  { name: "扫描项目生成 CLAUDE.md", tool: "/init",            avgMs: 30000, inTokens: 8000,  outTokens: 1500, confirm: false },
  { name: "理解需求给计划",         tool: "Plan 模式",         avgMs: 45000, inTokens: 12000, outTokens: 2000, confirm: true  },
  { name: "改 schema + migration",  tool: "Agent 执行",        avgMs: 60000, inTokens: 15000, outTokens: 1800, confirm: true  },
  { name: "写 server 业务逻辑",     tool: "Agent 执行",        avgMs: 50000, inTokens: 18000, outTokens: 2200, confirm: false },
  { name: "写 API route",           tool: "Agent 执行",        avgMs: 40000, inTokens: 16000, outTokens: 1600, confirm: false },
  { name: "写 UI 组件",             tool: "Agent 执行",        avgMs: 55000, inTokens: 20000, outTokens: 2400, confirm: false },
  { name: "写测试",                 tool: "Agent 执行",        avgMs: 45000, inTokens: 22000, outTokens: 2000, confirm: false },
  { name: "跑测试 + 修 bug",        tool: "Agent 循环",        avgMs: 90000, inTokens: 35000, outTokens: 3000, confirm: false },
  { name: "子 Agent 审查",          tool: "reviewer subagent", avgMs: 30000, inTokens: 25000, outTokens: 1500, confirm: false },
  { name: "生成 commit + 提交",     tool: "Agent 执行",        avgMs: 15000, inTokens: 10000, outTokens: 800,  confirm: true  },
];

// ---- 模型价格（$/1M tokens）----
const SONNET = { in: 3, out: 15 };
const OPUS = { in: 15, out: 75 };

// ---- 假设主 Agent 用 Sonnet，审查子 Agent 也用 Sonnet ----
function calcCost(step) {
  const price = step.tool.includes("subagent") ? SONNET : SONNET;
  return (step.inTokens / 1_000_000) * price.in + (step.outTokens / 1_000_000) * price.out;
}

// ---- 模拟一次完整任务 ----
function simulateTask() {
  let totalMs = 0;
  let totalCost = 0;
  let confirmPoints = 0;
  const log = [];

  for (const step of workflow) {
    // 模拟重试（成功率的反作用）
    const retries = Math.random() < 0.2 ? 1 : 0;
    const ms = step.avgMs * (0.8 + Math.random() * 0.4) * (1 + retries * 0.5);
    const cost = calcCost(step) * (1 + retries * 0.5);
    totalMs += ms;
    totalCost += cost;
    if (step.confirm) confirmPoints++;
    log.push({ name: step.name, ms, cost, retries });
  }

  return { totalMs, totalCost, confirmPoints, log };
}

// ---- 跑 300 次 ----
const RUNS = 300;
let sumMs = 0;
let sumCost = 0;
let sumConfirms = 0;
const stepStats = workflow.map((s) => ({ name: s.name, totalMs: 0, totalCost: 0, count: 0 }));

for (let i = 0; i < RUNS; i++) {
  const r = simulateTask();
  sumMs += r.totalMs;
  sumCost += r.totalCost;
  sumConfirms += r.confirmPoints;
  r.log.forEach((l, idx) => {
    stepStats[idx].totalMs += l.ms;
    stepStats[idx].totalCost += l.cost;
    stepStats[idx].count++;
  });
}

// ---- 输出 ----
console.log("========================================");
console.log("  Claude Code 任务模拟（" + RUNS + " 次平均）");
console.log("========================================\\n");

console.log("各步骤耗时与成本：");
console.log(
  "步骤".padEnd(28) +
    "工具".padEnd(22) +
    "平均耗时".padStart(10) +
    "平均成本".padStart(12) +
    "需确认".padStart(8)
);
console.log("-".repeat(80));
workflow.forEach((s, i) => {
  const avgMs = (stepStats[i].totalMs / stepStats[i].count / 1000).toFixed(1);
  const avgCost = (stepStats[i].totalCost / stepStats[i].count).toFixed(4);
  console.log(
    s.name.padEnd(28) +
      s.tool.padEnd(22) +
      (avgMs + "s").padStart(10) +
      ("$" + avgCost).padStart(12) +
      (s.confirm ? "是" : "否").padStart(8)
  );
});

console.log("\\n整体统计：");
console.log("  平均总耗时：" + (sumMs / RUNS / 1000 / 60).toFixed(1) + " 分钟");
console.log("  平均总成本：$" + (sumCost / RUNS).toFixed(3));
console.log("  平均人工确认点：" + (sumConfirms / RUNS).toFixed(1) + " 次");

// ---- 权限模式对比 ----
console.log("\\n========================================");
console.log("  三种权限模式对比");
console.log("========================================\\n");

const modes = [
  { name: "Ask 模式",  confirmRatio: 1.0,  desc: "每步都问，最安全最繁琐" },
  { name: "Plan 模式", confirmRatio: 0.3,  desc: "写操作集中确认，平衡之选" },
  { name: "Auto 模式", confirmRatio: 0.0,  desc: "全自动，仅限沙箱" },
];

modes.forEach((m) => {
  const confirms = Math.round(10 * m.confirmRatio);
  console.log("  " + m.name.padEnd(12) + " 确认点 " + confirms + "/10  " + m.desc);
});

// ---- 与 IDE 工具对比 ----
console.log("\\n========================================");
console.log("  与 IDE 工具对比（同类任务）");
console.log("========================================\\n");

const compare = [
  { tool: "Claude Code",     time: 15, cost: 1.34, manual: 3, autonomy: "高" },
  { tool: "Cursor Agent",    time: 22, cost: 1.80, manual: 8, autonomy: "中" },
  { tool: "Cursor Composer", time: 35, cost: 1.20, manual: 15, autonomy: "低" },
  { tool: "Copilot Edits",   time: 45, cost: 0.50, manual: 20, autonomy: "低" },
];

console.log(
  "工具".padEnd(20) +
    "耗时(分)".padStart(10) +
    "成本($)".padStart(10) +
    "人工操作".padStart(10) +
    "自主度".padStart(8)
);
console.log("-".repeat(58));
compare.forEach((c) => {
  console.log(
    c.tool.padEnd(20) +
      c.time.toString().padStart(10) +
      c.cost.toFixed(2).padStart(10) +
      c.manual.toString().padStart(10) +
      c.autonomy.padStart(8)
  );
});

console.log("\\n========================================");
console.log("  关键洞察");
console.log("========================================");
console.log("  1. Claude Code 在“完整功能”任务上比 IDE 工具快 2~3 倍。");
console.log("  2. Plan 模式是“放手但安全”的最佳平衡点。");
console.log("  3. 子 Agent 审查能把人工 review 时间省 80%。");
console.log("  4. 单次任务 $1~2 的成本远低于人工时薪。");
console.log("  5. CI 集成用一次性命令 + --auto，能做 PR 自动审查。");
console.log("\\n✅ 模拟完成，下一章将覆盖 Windsurf/Trae/Cline/Aider/v0 等。");
`
  },

  {
    id: "aiapp-other-tools",
    icon: "🛠️",
    group: "AI编程工具全景",
    title: "Windsurf/Trae/Cline/Aider/v0 等",
    content: `
# 第15章：Windsurf/Trae/Cline/Aider/v0 等

前四章讲了 Copilot、Cursor、Claude Code 三大主流。本章覆盖剩下的重要玩家：Windsurf、Trae、Cline、Aider、Continue、JetBrains AI、v0、Bolt.new、Lovable、Devin。它们各自占据不同的细分市场，理解它们的定位能帮你补全工具地图。

## 15.1 Windsurf：Codeium 的 AI IDE

Windsurf 是 Codeium 团队 2024 年底推出的 AI IDE，Fork 自 VSCode，定位直接对标 Cursor。它的核心特色是“Cascade”与“flows”。

**Cascade**。Windsurf 的多文件编辑能力，类似 Cursor Composer。差异在于 Cascade 更强调“对话连贯性”——它会记住你之前所有的对话与改动，跨任务保持上下文。如果你喜欢“一个长对话窗口搞定所有事”，Cascade 比 Composer 顺手。

**flows**。Windsurf 独创的概念，把“编写—运行—观察—修改”的循环产品化。一个 flow 是一组绑定的操作：写代码、自动跑、看输出、根据输出继续改。适合“需要快速迭代验证”的任务，比如写一个数据处理的脚本，每改一版自动跑一遍看结果。

**Windsurf 的优势**：

- 模型支持广，可接 Claude、GPT、Gemini、自家的 Codeium 模型
- 价格略低于 Cursor（$15/月起）
- Cascade 的长上下文连贯性在某些场景比 Composer 顺手
- 内置 Codeium 的免费补全模型，延迟低

**Windsurf 的劣势**：

- 生态比 Cursor 小（插件、规则、社区都更少）
- Agent 能力不如 Cursor 1.0+ 完善
- 国内访问不如 Trae 顺

\`\`\`text
选 Windsurf 还是 Cursor？
  价格敏感 + 长对话连贯   ──>  Windsurf
  生态丰富 + Agent 强     ──>  Cursor
  国内访问                ──>  Trae（下一节）
\`\`\`

## 15.2 Trae：字节跳动的 AI IDE 全产品线

Trae 是字节跳动 2024 年底推出的 AI IDE，2026 年已经发展成“TRAE 全产品线”：TRAE IDE、TRAE Work、TRAE CLI、TRAE Plugin。是国内 AI 编程工具的代表。

**TRAE IDE**。Fork 自 VSCode 的独立 IDE，定位类似 Cursor/Windsurf。特色：

- 深度集成豆包模型与 Claude/GPT，国内访问顺畅
- 中文优化好，对中文注释、中文需求的遵循度高
- 国内合规友好，数据可留在国内
- 价格对国内用户友好（免费档 + Pro 档）

**TRAE Work**。Trae 的“团队协作平台”，把 IDE、任务管理、知识库打通。适合“团队级 AI 编程”——共享规则、共享上下文、共享审查。

**TRAE CLI**。Trae 的命令行工具，定位类似 Claude Code。特色是“与 TRAE IDE 共享配置与规则”，你可以在 IDE 里配规则，CLI 直接用。

**TRAE Plugin**。Trae 提供的 VSCode/JetBrains 插件，让“不想换编辑器”的用户也能用 Trae 能力。定位类似 Copilot 插件。

**Trae 的优势**：

- 全产品线覆盖（IDE/CLI/Plugin/Work），企业落地完整
- 国内访问与合规好
- 中文场景表现优于海外工具
- 字节生态整合（与飞书、火山引擎协同）

**Trae 的劣势**：

- 海外模型（Claude/GPT）的接入稳定性受政策影响
- 海外用户社区比 Cursor 小
- 部分高级功能仍在快速迭代

\`\`\`text
Trae 适合谁？
  国内团队 + 中文场景    ──>  TRAE IDE
  企业级 + 团队协作      ──>  TRAE Work
  命令行自动化           ──>  TRAE CLI
  不想换编辑器            ──>  TRAE Plugin
\`\`\`

## 15.3 Cline：VSCode 自主 Agent 扩展

Cline 是开源的 VSCode 扩展，定位是“VSCode 里的自主 Agent”。它和 Claude Code 的能力类似，但形态是 VSCode 插件，不是终端命令。

**Cline 的核心能力**：

- 自主读文件、改代码、跑命令、修错误
- 支持 Claude、GPT、DeepSeek、Qwen 等任意模型（通过 API Key）
- 支持 MCP
- 可定义“自定义工具”与“自定义指令”
- 完全开源，可自部署

**Cline 与 Claude Code 的差异**：

| 维度 | Cline | Claude Code |
| --- | --- | --- |
| 形态 | VSCode 扩展 | 终端命令 |
| 模型 | 任意（自带 API Key） | 主要 Anthropic（部分版本支持其他） |
| 开源 | 是 | 否 |
| 价格 | 模型 API 费用 | 订阅或 API 费用 |
| 适合 | 想用便宜模型 + VSCode 工作流 | 想要 Anthropic 官方深度集成 |

**Cline 的最佳使用场景**：

- 想用 DeepSeek/Qwen 这类便宜开源模型做自主 Agent
- 不想离开 VSCode 但要 Agent 能力
- 预算敏感（按 API 用量，比订阅便宜）
- 需要自部署/合规场景

\`\`\`bash
# 安装 Cline
# 在 VSCode 扩展市场搜索 "Cline" 安装
# 或命令行
code --install-extension saoudrizwan.claude-dev

# 配置模型（在 Cline 设置里）
# 选 Model Provider：Anthropic / OpenAI / DeepSeek / OpenRouter / 本地 Ollama
# 填 API Key
\`\`\`

## 15.4 Aider：命令行 pair programming

Aider 是开源的命令行 AI 编程工具，2023 年由 Paul Gauthier 创建，是“终端 AI 编程”的先驱之一。它的定位是“命令行 pair programming”——你跟 Aider 在终端里结对编程。

**Aider 的核心能力**：

- 命令行交互，类似 Claude Code 的 REPL
- 自动 git commit 每次改动（这是 Aider 的特色）
- 支持任意模型（通过 API Key），含 OpenAI、Anthropic、DeepSeek、Ollama 本地模型
- 专注于“编辑现有代码”而非“从零生成”
- 有自己的 Benchmark（Aider Polyglot）

**Aider 与 Claude Code 的差异**：

| 维度 | Aider | Claude Code |
| --- | --- | --- |
| 开源 | 是 | 否 |
| 模型 | 任意 | 主要 Anthropic |
| git 集成 | 自动 commit 每次 | 需要你显式 commit |
| 价格 | 模型 API 费用 | 订阅或 API |
| 编辑风格 | 偏 diff 编辑 | 偏整文件重写 |
| 适合 | 喜欢开源 + 自动 commit | 想要 Anthropic 官方体验 |

**Aider 安装与使用**：

\`\`\`bash
# 安装 Aider（需要 Python 3.10+）
pip install aider-chat

# 配置 API Key（以 DeepSeek 为例，便宜）
export DEEPSEEK_API_KEY=sk-xxx

# 在项目目录启动
cd my-project
aider --model deepseek/deepseek-chat

# 在 Aider REPL 里
> 把 src/utils.py 里的函数都加上类型注解
（Aider 读文件、改文件、自动 git commit）
\`\`\`

**Aider 的最佳使用场景**：

- 想用最便宜的模型（DeepSeek/Qwen）做 AI 编程
- 喜欢“每次改动自动 commit”的工作流
- 开源洁癖
- Python 项目（Aider 对 Python 支持最成熟）

## 15.5 Continue：开源 VSCode/JetBrains 扩展

Continue 是另一个重要的开源工具，定位是“开源版的 Copilot”。它是 VSCode 与 JetBrains 双端扩展，可接任意模型。

**Continue 的核心能力**：

- 行内补全（可接本地小模型，如 Codestral、Qwen-Coder）
- Chat 对话（可接任意 API）
- Cmd+K 内联编辑
- @ 引用上下文（@file、@folder、@codebase、@docs）
- 完全开源，可自部署

**Continue 与 Copilot 的差异**：

| 维度 | Continue | Copilot |
| --- | --- | --- |
| 开源 | 是 | 否 |
| 模型 | 任意 | 仅 Copilot 内置 |
| 价格 | 模型费用（可免费接本地） | 订阅 |
| 数据 | 完全自托管 | Business+ 不进训练 |
| 适合 | 合规/预算敏感 | 体验打磨 |

**Continue 的最佳使用场景**：

- 数据不能出本机（接本地 Ollama 模型）
- 预算敏感（接 DeepSeek/Qwen 便宜模型）
- 不想被 Copilot 订阅绑死
- 想要“自建 AI 编程平台”的团队基础

\`\`\`bash
# 安装 Continue
# VSCode 扩展市场搜索 "Continue" 安装
code --install-extension Continue.continue

# 配置模型（~/.continue/config.json）
# 示例：用本地 Ollama 做补全 + DeepSeek 做 Chat
\`\`\`

配置示例（~/.continue/config.json）：

\`\`\`json
{
  "models": [
    {
      "title": "DeepSeek Chat",
      "provider": "deepseek",
      "model": "deepseek-chat",
      "apiKey": "sk-xxx"
    }
  ],
  "tabAutocompleteModel": {
    "title": "Ollama",
    "provider": "ollama",
    "model": "qwen2.5-coder:7b"
  }
}
\`\`\`

## 15.6 JetBrains AI Assistant

JetBrains 在 2024 年推出 AI Assistant，深度集成到 IntelliJ IDEA / WebStorm / PyCharm 等 IDE。2026 年的 JetBrains AI 已经包含补全、Chat、多文件编辑、Agent 模式。

**JetBrains AI 的特色**：

- 与 IntelliJ 系深度集成（重构、导航、调试器联动）
- 用过 JetBrains 的工程师零学习成本
- 支持任意模型（2025 年起开放模型选择）
- 企业版支持私有部署

**JetBrains AI 的适合场景**：

- 重度 JetBrains 用户（不愿换 VSCode 系）
- Java/Kotlin/Scala 项目（JetBrains 的强项）
- 企业级私有部署需求

**劣势**：

- AI 能力迭代速度不如 Cursor/Copilot 快
- 多文件编辑与 Agent 模式不如 Cursor/Claude Code 成熟
- 价格叠加在 JetBrains 订阅上，总成本偏高

## 15.7 v0：UI 生成平台

v0 是 Vercel 推出的 UI 生成平台，2023 年发布，2026 年已经是“UI 生成类工具”的标杆。它的定位是“输入描述生成可运行的 React 组件”。

**v0 的核心能力**：

- 自然语言生成 React + Tailwind 组件
- 内置预览，所见即所得
- 支持生成完整页面（多组件组合）
- 集成 shadcn/ui，组件质量高
- 一键部署到 Vercel
- 支持图片转代码（截图变组件）

**v0 的最佳使用场景**：

- 快速生成 UI 原型
- 生成 shadcn/ui 风格的组件
- 学习新 UI 库（让 v0 给示例）
- 给设计师/产品看交互草稿

**v0 的局限**：

- 生成的组件搬进既有项目时，可能与既有设计系统冲突
- 复杂业务逻辑需要自己实现
- 生成的代码质量参差，需要人工调整
- 不适合大型项目深度迭代

\`\`\`text
v0 工作流：
  描述需求 ──> v0 生成组件 ──> 预览调整 ──> 复制代码 ──> 搬进项目 ──> Cursor/Copilot 继续迭代
\`\`\`

## 15.8 Bolt.new 与 Lovable：全栈应用生成

Bolt.new（StackBlitz）与 Lovable 是“全栈应用生成”类工具，比 v0 更进一步——生成完整可运行的全栈应用。

**Bolt.new**。基于 StackBlitz 的 WebContainer 技术，在浏览器里跑完整 Node.js 环境。你描述需求，Bolt.new 生成前端 + 后端 + 数据库 schema，内置预览与部署。特色：

- 真正在浏览器里跑（不是模拟）
- 支持 Next.js、Astro、SvelteKit 等框架
- 内置 Supabase、Neon 等后端集成
- 一键部署到 StackBlitz 或 Vercel

**Lovable**。定位“从想法到上线”，生成全栈应用并直接部署。特色：

- 更强的“产品思维”——会主动加用户认证、数据模型、错误处理
- 内置 Lovable 部署平台
- 适合“非技术创业者快速验证想法”

**Bolt.new/Lovable 的最佳使用场景**：

- MVP/原型验证
- 学习新技术栈（让工具生成示例）
- 内部工具快速搭建
- 创业者验证想法

**局限**（所有 UI/应用生成类工具的通病）：

- 生成的代码结构难以融入大型既有项目
- 复杂业务逻辑实现质量参差
- 后续迭代仍需传统 IDE 工具
- 长期维护成本可能高于从零写

## 15.9 Devin：自主软件工程师

Devin 是 Cognition 团队 2024 年推出的“自主软件工程师”，是 Agent 框架类工具的代表。2026 年的 Devin 已经从“demo 神器”进化到“能处理真实任务”的阶段。

**Devin 的核心能力**：

- 长链路自主任务（读需求 → 规划 → 写代码 → 跑测试 → 提 PR）
- 内置完整开发环境（沙箱 + 浏览器 + 终端）
- 并行处理多任务
- 集成 Slack/Jira/GitHub，工作流产品化
- 按任务计费（每个 ACU 约 $500/月）

**Devin 的适合场景**：

- 批量处理 backlog 里的 good-first-issue
- 老旧代码库的批量重构
- 探索性任务（“看看这个仓库能不能加 X 功能”）
- 重复性维护任务

**Devin 的局限**：

- 价格昂贵（$500/月起）
- 复杂任务成功率仍不高（约 30~50%）
- 需要重新设计工作流（不是“辅助”，是“委派”）
- 结果需要人工审核，不能直接合并

\`\`\`text
Devin 不是“辅助工具”，是“委派对象”。
适合“批量简单任务”，不适合“复杂核心任务”。
\`\`\`

## 15.10 各工具定位对比

把本章所有工具放在一起对比：

| 工具 | 类型 | 形态 | 价格 | 开源 | 最佳场景 |
| --- | --- | --- | --- | --- | --- |
| Windsurf | IDE 集成 | 独立 IDE | $15/月起 | 否 | Cursor 替代、长对话 |
| Trae 全产品线 | IDE/CLI/Plugin | 多形态 | 免费档+Pro | 否 | 国内团队、中文场景 |
| Cline | Agent 框架 | VSCode 扩展 | API 费用 | 是 | 便宜模型 + VSCode |
| Aider | 终端 CLI | 命令行 | API 费用 | 是 | Python、自动 commit |
| Continue | IDE 集成 | VSCode/JetBrains | API 费用 | 是 | 自托管、合规 |
| JetBrains AI | IDE 集成 | JetBrains 内置 | 订阅叠加 | 否 | JetBrains 重度用户 |
| v0 | 代码生成 | Web 平台 | $20/月起 | 否 | UI 原型、组件生成 |
| Bolt.new | 代码生成 | Web 平台 | $20/月起 | 否 | 全栈 MVP |
| Lovable | 代码生成 | Web 平台 | $25/月起 | 否 | 创业验证 |
| Devin | Agent 框架 | Web 平台 | $500/月起 | 否 | 批量简单任务 |

## 15.11 开源 vs 闭源工具差异

这是选型时的核心维度之一。

**开源工具的代表**：Continue、Aider、Cline、OpenHands、AutoGPT 系。

**开源工具的优势**：

- **数据可控**：可自部署，数据不出本机/内网，满足合规
- **模型自由**：可接任意模型，包括本地 Ollama、自部署的开源模型
- **价格透明**：按 API 用量付费，不被订阅绑架
- **可定制**：可改源码、可写插件、可深度定制
- **社区驱动**：迭代快，新模型/新工具新能力第一时间支持

**开源工具的劣势**：

- **体验打磨差**：UI、交互、文档不如闭源商业产品
- **配置复杂**：要自己配模型、配 API Key、配权限
- **稳定性参差**：开源项目维护节奏不稳定
- **企业支持弱**：没有 SLA，出问题靠社区

**闭源工具的代表**：Copilot、Cursor、Windsurf、Trae、JetBrains AI、v0、Bolt.new、Lovable、Devin。

**闭源工具的优势**：

- **体验打磨好**：UI、交互、文档都精雕细琢
- **模型深度集成**：与官方模型配合最优
- **企业支持**：有 SLA、有客服、有合规承诺
- **即开即用**：装上就能用，不用配置

**闭源工具的劣势**：

- **数据合规风险**：代码要上传到厂商服务器
- **价格绑定**：订阅制，长期成本不可控
- **模型绑定**：只能用厂商支持的模型
- **定制受限**：不能改源码，扩展靠官方提供的接口

**实战建议**：

\`\`\`text
开源 vs 闭源 怎么选？
  个人开发 + 体验优先     ──>  闭源（Cursor/Copilot）
  企业 + 合规要求高       ──>  开源（Continue/Cline + 自部署）
  预算敏感 + 技术能力强   ──>  开源（Aider + DeepSeek）
  团队 + 即开即用          ──>  闭源（Copilot Business/Cursor Team）
  双轨并行                ──>  闭源给一线 + 开源给合规场景
\`\`\`

## 15.12 UI 生成类工具的局限

v0、Bolt.new、Lovable 这类“从需求生成应用”的工具很火，但必须清醒认识它们的局限。

**局限 1：生成的代码难以融入既有项目**。这类工具生成的代码有自己的目录结构、命名约定、依赖选择。把它的输出搬进既有项目，往往要大改。它适合“从零开始的新项目”，不适合“既有项目加功能”。

**局限 2：复杂业务逻辑实现质量参差**。这类工具擅长“UI 层”，对“业务逻辑层”支持弱。比如“生成一个带权限控制的审批流 UI”它可以，“生成一个带状态机的审批流业务逻辑”它就力不从心。

**局限 3：后续迭代仍需传统工具**。生成初版后，后续迭代用 v0/Bolt.new 改不如用 Cursor/Claude Code 改——前者每次重新生成大段代码，后者精确改某行。

**局限 4：长期维护成本可能更高**。自动生成的代码如果没人维护，长期会比手写代码更难改。生成代码“能跑”但“不理解”，工程师接手时要先花时间理解。

**正确的使用姿势**：

\`\`\`text
UI 生成工具的正确用法：
  1. 用 v0 生成 UI 原型，验证设计
  2. 把生成的组件代码复制到项目
  3. 用 Cursor/Copilot 调整成符合项目规范
  4. 后续迭代用 IDE 工具，不再回到 v0
  
  ❌ 错误用法：用 v0 生成整个项目，然后反复用 v0 改
  ✅ 正确用法：v0 只做“0 到 1”，IDE 工具做“1 到 100”
\`\`\`

## 15.13 本章小结与全批总结

本章覆盖了 Copilot/Cursor/Claude Code 之外的所有重要工具。每个工具都有自己的细分市场：

- **Windsurf**：Cursor 的有力替代
- **Trae**：国内 AI 编程代表，全产品线
- **Cline**：开源 VSCode 自主 Agent
- **Aider**：开源命令行 pair programming
- **Continue**：开源 Copilot 替代
- **JetBrains AI**：JetBrains 用户的官方选择
- **v0/Bolt.new/Lovable**：从 0 到 1 的应用生成
- **Devin**：自主软件工程师，批量任务

选型时记住三条原则：

1. **按场景选，不按名气选**。再火的工具不适合你的场景也是白搭。
2. **组合使用，不要“只用一个”**。v0 生成 + Cursor 迭代 + Claude Code 自动化，是最强组合。
3. **开源闭源双轨**。一线用闭源打磨体验，合规场景用开源保数据。

\`\`\`text
本批 5 章（第 11~15 章）小结：
  11. AI 编程工具分类与全景  ──>  五大分类 + 工具矩阵
  12. GitHub Copilot 实战    ──>  装机量最大，无缝嵌入 GitHub
  13. Cursor 编辑器实战     ──>  AI 优先编辑器，Composer/Agent/Background
  14. Claude Code 终端实战  ──>  终端 Agent 旗舰，自主执行 + Plan 模式
  15. Windsurf/Trae/Cline/Aider/v0 等 ──>  补全工具地图

至此，AI 编程工具全景组的 5 章结束。
你已经掌握了 2026 年主流 AI 编程工具的全貌与深度用法。
下一批章节将进入“AI 编程方法论”，讲如何把这些工具组合成高效工作流。
\`\`\`
`,
    code: `// =============================================================
// 第15章示例：多工具对比与组合策略推荐器
// 输入团队画像与约束，输出推荐工具组合
// =============================================================

// ---- 工具库（含本章所有工具）----
// type: ide / cli / chat / gen / agent
// open: 是否开源
// price: 月度单人成本（美元）
// strengths: 强项标签
const allTools = [
  { name: "Copilot",       type: "ide",   open: false, price: 10,  strengths: ["补全","GitHub集成","企业"] },
  { name: "Cursor",        type: "ide",   open: false, price: 20,  strengths: ["Composer","Agent","Tab","Background"] },
  { name: "Windsurf",      type: "ide",   open: false, price: 15,  strengths: ["Cascade","flows","长对话"] },
  { name: "Trae",          type: "ide",   open: false, price: 12,  strengths: ["中文","国内合规","全产品线"] },
  { name: "JetBrains AI",  type: "ide",   open: false, price: 10,  strengths: ["JetBrains集成","Java"] },
  { name: "Continue",      type: "ide",   open: true,  price: 0,   strengths: ["开源","自托管","任意模型"] },
  { name: "Claude Code",   type: "cli",   open: false, price: 20,  strengths: ["自主执行","Plan","子Agent"] },
  { name: "Aider",         type: "cli",   open: true,  price: 0,   strengths: ["开源","自动commit","Python"] },
  { name: "Codex CLI",     type: "cli",   open: false, price: 20,  strengths: ["OpenAI集成","Agent"] },
  { name: "v0",            type: "gen",   open: false, price: 20,  strengths: ["UI生成","shadcn"] },
  { name: "Bolt.new",      type: "gen",   open: false, price: 20,  strengths: ["全栈MVP","WebContainer"] },
  { name: "Lovable",       type: "gen",   open: false, price: 25,  strengths: ["全栈","部署","创业"] },
  { name: "Devin",         type: "agent", open: false, price: 500, strengths: ["自主","批量","长链路"] },
  { name: "Cline",         type: "agent", open: true,  price: 0,   strengths: ["开源","VSCode","任意模型"] },
  { name: "OpenHands",     type: "agent", open: true,  price: 0,   strengths: ["开源","自部署","长链路"] },
];

// ---- 团队画像 ----
// 每个团队有：规模、预算、合规要求、技术栈、地域
const teams = [
  { name: "个人开发者",       size: 1,  budget: 30,  compliance: false, stack: "全栈",     region: "海外" },
  { name: "国内小团队",       size: 8,  budget: 200, compliance: true,  stack: "全栈",     region: "国内" },
  { name: "金融企业",         size: 50, budget: 2000,compliance: true,  stack: "Java",     region: "国内" },
  { name: "硅谷创业公司",     size: 20, budget: 1000,compliance: false, stack: "全栈",     region: "海外" },
  { name: "开源项目维护者",   size: 3,  budget: 50,  compliance: false, stack: "Python",   region: "海外" },
  { name: "MVP 创业者",       size: 2,  budget: 100, compliance: false, stack: "全栈",     region: "海外" },
];

// ---- 推荐函数 ----
// 规则：
//   1. 总价不超过预算 × 团队规模
//   2. 合规要求高 → 必须有开源工具
//   3. 国内 → 优先 Trae
//   4. Java → 优先 JetBrains AI
//   5. MVP → 必须有 gen 类工具
//   6. 全栈 → IDE + CLI 组合
function recommend(team) {
  const totalBudget = team.budget * team.size;
  const picks = [];

  // IDE 选择
  let ide;
  if (team.region === "国内" && team.compliance) {
    ide = allTools.find((t) => t.name === "Trae");
  } else if (team.stack === "Java") {
    ide = allTools.find((t) => t.name === "JetBrains AI");
  } else if (team.budget < 30) {
    ide = allTools.find((t) => t.name === "Continue"); // 开源省钱
  } else {
    ide = allTools.find((t) => t.name === "Cursor");
  }
  picks.push(ide);

  // CLI 选择（全栈团队加 CLI）
  if (team.stack === "全栈" || team.stack === "Python") {
    const cli = team.budget < 30
      ? allTools.find((t) => t.name === "Aider")
      : allTools.find((t) => t.name === "Claude Code");
    picks.push(cli);
  }

  // gen 选择（MVP 创业者）
  if (team.name.includes("MVP") || team.name.includes("创业")) {
    picks.push(allTools.find((t) => t.name === "Bolt.new"));
  }

  // 合规场景加开源 Agent
  if (team.compliance && team.size > 10) {
    picks.push(allTools.find((t) => t.name === "Cline"));
  }

  // 验证预算
  const totalMonthly = picks.reduce((s, t) => s + t.price, 0) * team.size;
  const inBudget = totalMonthly <= totalBudget;

  return { team: team.name, picks: picks.map((p) => p.name), totalMonthly, inBudget };
}

// ---- 执行 ----
console.log("========================================");
console.log("  多工具组合推荐器");
console.log("========================================\\n");

teams.forEach((team) => {
  const r = recommend(team);
  console.log("团队：" + r.team + "（" + team.size + " 人，月预算 $" + team.budget + "/人）");
  console.log("  推荐组合：" + r.picks.join(" + "));
  console.log("  月度总成本：$" + r.totalMonthly + (r.inBudget ? " ✅ 在预算内" : " ❌ 超预算"));
  console.log("");
});

// ---- 工具分类全景图 ----
console.log("========================================");
console.log("  AI 编程工具全景（2026-07）");
console.log("========================================\\n");

const types = ["ide", "cli", "gen", "agent"];
const typeNames = { ide: "IDE 集成", cli: "终端 CLI", gen: "代码生成", agent: "Agent 框架" };

types.forEach((tp) => {
  console.log("【" + typeNames[tp] + "】");
  allTools
    .filter((t) => t.type === tp)
    .forEach((t) => {
      const openTag = t.open ? "[开源]" : "[闭源]";
      const priceTag = t.price === 0 ? "按用量" : "$" + t.price + "/月";
      console.log("  " + openTag.padEnd(6) + t.name.padEnd(16) + priceTag.padStart(12) + "  强项：" + t.strengths.join("/"));
    });
  console.log("");
});

// ---- 开源 vs 闭源 统计 ----
console.log("========================================");
console.log("  开源 vs 闭源 统计");
console.log("========================================\\n");

const open = allTools.filter((t) => t.open);
const closed = allTools.filter((t) => !t.open);
console.log("  开源工具：" + open.length + " 个，平均月费 $" + (open.reduce((s, t) => s + t.price, 0) / open.length).toFixed(1));
console.log("  闭源工具：" + closed.length + " 个，平均月费 $" + (closed.reduce((s, t) => s + t.price, 0) / closed.length).toFixed(1));
console.log("  开源平均价格为闭源的 " + ((open.reduce((s, t) => s + t.price, 0) / open.length) / (closed.reduce((s, t) => s + t.price, 0) / closed.length) * 100).toFixed(0) + "%");

console.log("\\n========================================");
console.log("  关键洞察");
console.log("========================================");
console.log("  1. 没有万能工具，组合使用是常态。");
console.log("  2. 国内合规团队首选 Trae，海外团队首选 Cursor + Claude Code。");
console.log("  3. 开源工具平均价格是闭源的 10% 以下，适合预算敏感或合规场景。");
console.log("  4. MVP 创业者用 Bolt.new + Cursor 组合，从想法到上线最快。");
console.log("  5. 大企业用闭源给一线 + 开源给合规场景的双轨制最稳。");
console.log("\\n✅ 推荐器运行完毕，AI 编程工具全景组 5 章全部结束。");
`
  }
];
